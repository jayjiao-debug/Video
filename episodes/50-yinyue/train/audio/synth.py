"""Numpy synths for the electronic layers: 808, sub, kick, supersaw pads and leads, plucks, noise risers, impacts.
Everything returns stereo float32 (n, 2) at 48 kHz. Filters are time-varying TPT state-variable filters (numba).
"""
import math
import numpy as np
from numba import njit

SR = 48000
rng = np.random.default_rng(7)


def mtof(m):
    return 440.0 * 2 ** ((np.asarray(m, dtype=float) - 69) / 12)


def st(m, pan=0.0):
    """mono → stereo with equal-power pan."""
    a = (pan + 1) * math.pi / 4
    return np.stack([m * math.cos(a), m * math.sin(a)], 1).astype('float32') * 1.4142


@njit(cache=True)
def _svf(x, fc, q, mode):
    """TPT state-variable filter. fc per sample (Hz). mode 0 = low, 1 = band, 2 = high."""
    y = np.empty_like(x)
    ic1 = 0.0
    ic2 = 0.0
    k = 1.0 / q
    for i in range(len(x)):
        g = math.tan(math.pi * min(fc[i], 0.45 * 48000) / 48000)
        a1 = 1.0 / (1.0 + g * (g + k))
        a2 = g * a1
        a3 = g * a2
        v3 = x[i] - ic2
        v1 = a1 * ic1 + a2 * v3
        v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        if mode == 0:
            y[i] = v2
        elif mode == 1:
            y[i] = v1
        else:
            y[i] = x[i] - k * v1 - v2
    return y


def svf(x, fc, q=0.707, mode='low'):
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), (len(x),)).copy()
    m = {'low': 0, 'band': 1, 'high': 2}[mode]
    if x.ndim == 2:
        return np.stack([_svf(x[:, c].astype(np.float64), fc, q, m) for c in range(x.shape[1])], 1).astype('float32')
    return _svf(x.astype(np.float64), fc, q, m).astype('float32')


def env_adsr(n, a=0.005, d=0.1, s=0.7, r=0.2, gate=None):
    """gate = samples the key is held (default n − release)."""
    A, D, R = max(1, int(a * SR)), max(1, int(d * SR)), max(1, int(r * SR))
    g = n - R if gate is None else min(n, gate)
    e = np.zeros(n, 'float32')
    i = np.arange(n)
    e = np.where(i < A, i / A, np.where(i < A + D, 1 - (1 - s) * (i - A) / D, s)).astype('float32')
    if g < n:
        lvl = e[g - 1] if g > 0 else 0
        k = np.arange(n - g)
        e[g:] = lvl * np.clip(1 - k / R, 0, 1) ** 2
    return e


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR)).astype('float32')


def polyblep_saw(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    # polyBLEP at wraps
    t = ph
    m1 = t < dt
    y[m1] -= (t[m1] / dt[m1]) * 2 - (t[m1] / dt[m1]) ** 2 - 1
    m2 = t > 1 - dt
    tt = (t[m2] - 1) / dt[m2]
    y[m2] -= tt * tt + 2 * tt + 1
    return y.astype('float32')


def sine(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    return np.sin(2 * np.pi * (phase0 + np.cumsum(f / SR))).astype('float32')


def sat(x, drive=1.0):
    return (np.tanh(x * drive) / math.tanh(drive)).astype('float32') if drive > 0 else x


# ---------------- drums ----------------
def kick808(note=38, dur=1.2, drop=24, drop_t=0.035, drive=2.0, click=0.3, glide_to=None, glide_t=0.0):
    """808: sine with a pitch drop, long tail, saturation for phone speakers."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    base = mtof(note)
    if glide_to is not None:
        base = mtof(note + (glide_to - note) * np.clip((t - 0.05) / max(glide_t, 1e-3), 0, 1))
    f = base * 2 ** (drop / 12 * np.exp(-t / drop_t))
    y = sine(f, n)
    e = np.minimum(1, t / 0.002) * np.exp(-t / (dur * 0.45))
    y = sat(y * e, drive)
    if click:
        c = rng.standard_normal(n).astype('float32') * np.exp(-t / 0.004) * click
        y += svf(c, 3500, 0.8, 'band')
    rel = int(0.03 * SR)
    y[-rel:] *= np.linspace(1, 0, rel)
    return st(y)


def kick_punch(dur=0.45, f0=55, f1=230, tau_p=0.03, tau_a=0.18, click=0.6, drive=1.6):
    """909-ish club kick."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 + (f1 - f0) * np.exp(-t / tau_p)
    y = sine(f, n) * np.exp(-t / tau_a)
    nz = rng.standard_normal(n).astype('float32') * np.exp(-t / 0.006) * click
    y = sat(y + svf(nz, 4000, 0.7, 'band'), drive)
    y[-256:] *= np.linspace(1, 0, 256)
    return st(y)


def hat(dur=0.08, open_=False, tone=9000):
    n = int((0.45 if open_ else dur) * SR)
    t = np.arange(n) / SR
    # metallic: six detuned squares (TR-808 hat recipe) + noise
    fs = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0]
    m = sum(np.sign(np.sin(2 * np.pi * f * 2.0 * t)) for f in fs) / 6
    x = 0.6 * m + 0.6 * rng.standard_normal(n)
    x = svf(svf(x.astype('float32'), tone, 1.2, 'band'), 7000, 0.7, 'high')
    e = np.exp(-t / (0.12 if open_ else dur / 3))
    return st(sat(x * e, 1.2), 0.2)


def clap_synth(dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for k, dt in enumerate((0.0, 0.011, 0.022, 0.033)):
        e += (t >= dt) * np.exp(-(t - dt).clip(0) / (0.006 if k < 3 else 0.09))
    x = svf(rng.standard_normal(n).astype('float32') * e.astype('float32'), 1300, 1.6, 'band')
    return st(sat(x * 3, 1.5))


def noise_riser(dur, f0=300, f1=9000, q=2.0, curve=2.0):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    fc = f0 * (f1 / f0) ** (u ** curve)
    x = rng.standard_normal((n, 2)).astype('float32')
    y = svf(x, fc, q, 'band') * (u ** 1.5)[:, None].astype('float32')
    return y.astype('float32')


def downlifter(dur, f0=8000, f1=200):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    fc = f0 * (f1 / f0) ** u
    x = rng.standard_normal((n, 2)).astype('float32')
    return (svf(x, fc, 1.5, 'band') * ((1 - u) ** 2)[:, None]).astype('float32')


def impact(dur=2.5, note=31):
    """sub boom with a pitch fall + noise crack."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(note) * 2 ** (1.0 * np.exp(-t / 0.08))
    boom = sine(f, n) * np.exp(-t / 0.7)
    crack = svf(rng.standard_normal(n).astype('float32') * np.exp(-t / 0.05), 1800, 0.6, 'low')
    return st(sat(boom + 0.5 * crack, 1.5))


# ---------------- tonal ----------------
def supersaw(notes, dur, voices=7, spread=0.22, cutoff=4000, q=0.9, a=0.01, d=0.3, s=0.8, r=0.3,
             cut_env=None, width=0.8, sub=0.0):
    """notes: list of MIDI numbers (a chord). cut_env: per-sample cutoff array or None."""
    n = int((dur + r) * SR)
    L = np.zeros(n, 'float32'); R = np.zeros(n, 'float32')
    for m in notes:
        for v in range(voices):
            det = (v - (voices - 1) / 2) / max(1, (voices - 1) / 2) * spread
            y = polyblep_saw(mtof(m + det), n, rng.random())
            p = (v - (voices - 1) / 2) / max(1, (voices - 1) / 2) * width
            L += y * math.cos((p + 1) * math.pi / 4); R += y * math.sin((p + 1) * math.pi / 4)
        if sub:
            sv = sine(mtof(m - 12), n) * sub
            L += sv; R += sv
    x = np.stack([L, R], 1) / (voices * len(notes)) ** 0.5
    fc = cutoff if cut_env is None else cut_env[:n] if len(cut_env) >= n else np.pad(cut_env, (0, n - len(cut_env)), mode='edge')
    x = svf(x, fc, q, 'low')
    e = env_adsr(n, a, d, s, r, gate=int(dur * SR))
    return (x * e[:, None]).astype('float32')


def pluck(note, dur=0.4, bright=6000, decay=0.18, wave='saw', q=1.2):
    n = int((dur + 0.1) * SR)
    t = np.arange(n) / SR
    f = mtof(note)
    y = polyblep_saw(f, n) if wave == 'saw' else np.sign(sine(f, n)).astype('float32') * 0.7
    y = y + 0.5 * polyblep_saw(f * 1.004, n)
    fc = 200 + bright * np.exp(-t / decay)
    y = svf(y.astype('float32'), fc, q, 'low') * np.exp(-t / (decay * 2.5)) * np.minimum(1, t / 0.002)
    return st(y.astype('float32'))


def sub_bass(note, dur, drive=0.8, a=0.004, r=0.06):
    n = int((dur + r) * SR)
    y = sine(mtof(note), n) + 0.25 * sine(mtof(note) * 2, n)
    y = sat(y, 1 + drive) * env_adsr(n, a, 0.05, 1.0, r, gate=int(dur * SR))
    return st(y.astype('float32'))


def reese(note, dur, cutoff=900, r=0.08):
    n = int((dur + r) * SR)
    y = polyblep_saw(mtof(note) * 0.995, n) + polyblep_saw(mtof(note) * 1.005, n)
    y = svf(y.astype('float32'), cutoff, 1.0, 'low')
    y = sat(y, 2.0) * env_adsr(n, 0.005, 0.1, 0.9, r, gate=int(dur * SR))
    return st(y.astype('float32'))


def place(buf, x, t, gain=1.0):
    """mix x into buf at time t (s)."""
    i = int(round(t * SR))
    if i >= len(buf):
        return
    if i < 0:
        x, i = x[-i:], 0
    m = min(len(x), len(buf) - i)
    buf[i:i + m] += x[:m] * gain
