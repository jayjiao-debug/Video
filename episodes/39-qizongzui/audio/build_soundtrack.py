#!/usr/bin/env python3
"""《七宗罪》梗图版 soundtrack, r1 (music specialist, 2026-10-23).

Rules (owner-notes rows 37, 51, 64, 66, 91 + producer update 2026-10-23):
  * the BGM (37-qiqing/audio/qiqing_music.wav) stays sample-identical from 0:00: no cuts, mutes, ducks, filters.
    The only things applied to it are ONE static gain (to reach -14 LUFS for the whole mix) and the 1 s fade-out.
  * the 停顿 (pauses) are the track's own: bar 2 beat 4, bar 10, bar 26 (measured below); the picture makes them.
  * SFX: few, quiet, one family. Here the family is ONE synthesized church bell in F# (the track is F# minor,
    tuned +12 cents): a damped toll on each of the 7 reveals (>= 10 dB under the music, slowly escalating) and the
    same bell ringing free on the title (the one impact). Everything else is built but OFF (flags below).

Run:  python3 build_soundtrack.py          -> sins7_mix.wav, sfx_cues.json, plots/*.png, prints the verification
"""
import json, os
import numpy as np, soundfile as sf, scipy.signal as ss, pyloudnorm as pyln

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = '/home/claude/video/episodes/37-qiqing/audio/qiqing_music.wav'
OUT = os.path.join(HERE, 'sins7_mix.wav')
CUES = os.path.join(HERE, 'sfx_cues.json')
PLOTS = os.path.join(HERE, 'plots')

SR = 48000
DUR = 59.46                      # film length (QQ9_END = bt(29) + 0.6)
FPS = 30
BEAT, PH = 0.5069, 0.06          # grid used by Sins7.tsx
BAR = 4 * BEAT
bt = lambda n: PH + n * BAR      # film time of bar n
REV = [bt(3 + 3 * i) for i in range(7)]           # reveals
SCENE = [bt(2 + 3 * i) for i in range(7)]         # scene starts (= iris ends)
OUTRO, TITLE = bt(24), bt(27)
FADE_START, FADE_END = DUR - 1.0, DUR            # 1 s fade-out (whole mix)
LUFS_TARGET, TP_MAX = -14.0, -1.5

TUNE = 2 ** (12 / 1200)          # track is ~12 cents sharp (A4 ~ 443 Hz), measured from its partials
def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12) * TUNE
FS1, FS2, FS3, FS5, CS6 = note(30), note(42), note(54), note(78), note(85)

# ------------------------------------------------------------------ switches (fewer is better: only the bell is on)
REVEAL_TOLLS = True     # damped bell + sub on each of the 7 reveals
TITLE_TOLL = True       # the one impact: the bell rings free on the title
QUIP_POP = False        # soft tuned "bloop" at reveal + 2 beats (the kick on beat 3 already pops the bubble)
IRIS_SWELL = False      # reversed air swell into each scene downbeat (owner rejected whooshes; the kick carries it)
CAL_FLICKS = False      # 懒惰 calendar paper flicks on the half beats
COINS = False           # 贪婪 tuned coin clinks
TYPING = False          # owner row 37: no per-character typing blips

# levels: SFX momentary loudness relative to the music in the same 400 ms (K-weighted, LU). Rule: <= -10 except title.
REVEAL_REL = [-10.0, -12.0, -11.5, -11.0, -10.5, -10.5, -10.0]    # 1st = the hook drop; then a slow climb to 7
REVEAL_DAMP = [0.22, 0.14, 0.16, 0.18, 0.21, 0.24, 0.30]          # ring length grows sin by sin (escalation)
REVEAL_BRIGHT = [0.60, 0.45, 0.50, 0.55, 0.60, 0.65, 0.75]        # the hammer gets harder sin by sin
TITLE_REL = -4.0         # the one impact: clearly heard, still under the music's own loudness
POP_REL, SWELL_REL, FLICK_REL, COIN_REL, TYPE_REL = -14.0, -20.0, -18.0, -16.0, -20.0

rng = np.random.default_rng(7)


# ------------------------------------------------------------------ helpers
def kweight(x):
    """K-weighting (BS.1770) of a mono or stereo signal."""
    m = pyln.Meter(SR)
    y = np.array(x, dtype=float)
    for f in m._filters.values():
        y = np.stack([f.apply_filter(y[:, c]) for c in range(y.shape[1])], 1) if y.ndim == 2 else f.apply_filter(y)
    return y


def lufs_window(x, t0, w=0.4, pre=0.3):
    """momentary loudness (LUFS) of x in [t0, t0 + w] (K-weighted on a slice with a short pre-roll)."""
    a0, a, b = max(0, int((t0 - pre) * SR)), int(t0 * SR), int((t0 + w) * SR)
    y = kweight(x[a0:b])[a - a0:]
    p = (y ** 2).sum(axis=1).mean() if y.ndim == 2 else 2 * (y ** 2).mean()
    return -0.691 + 10 * np.log10(p + 1e-20)


def click_onset(x, g, win=0.035):
    """true start of the kick near grid time g: steepest rise of the >1.5 kHz envelope (the beater click)."""
    m = x.mean(1) if x.ndim == 2 else x
    a, b = int((g - win) * SR), int((g + win) * SR)
    seg = ss.sosfilt(ss.butter(4, 1500, 'high', fs=SR, output='sos'), m[a - 2000:b])[2000:]
    e = np.convolve(np.abs(seg), np.ones(48) / 48, 'same')[::24]
    return (a + 24 * int(np.argmax(np.diff(e)))) / SR


def env_ar(n, att, tau):
    t = np.arange(n) / SR
    e = np.exp(-t / tau)
    na = max(1, int(att * SR))
    e[:na] *= 0.5 - 0.5 * np.cos(np.pi * np.arange(na) / na)
    return e


def bell(prime, dur, damp=1.0, bright=1.0, strike=1.0):
    """church bell (minor-third tierce, so it sits in F# minor): hum, prime, tierce, quint, nominal + upper partials.
    Each partial is a slowly beating pair (+-0.15 Hz, 1 : 0.3, so the warble is ~5 dB deep, never a null) for the bell 'warble'; mono, so it is mono-safe."""
    n = int(dur * SR); t = np.arange(n) / SR
    #        ratio  amp   tau(s)   ratio vs prime: hum .5, prime 1, tierce 1.189 (m3), quint 1.498, nominal 2,
    parts = [(0.5, 0.55, 4.0), (1.0, 0.70, 2.6), (1.189, 0.50, 2.0), (1.498, 0.28, 1.3), (2.0, 1.00, 1.6),
             (2.378, 0.30, 0.9), (2.997, 0.26, 0.7), (4.0, 0.15, 0.45), (5.04, 0.07, 0.3)]
    y = np.zeros(n)
    for k, (r, a, tau) in enumerate(parts):
        if r > 2.0:
            a *= bright ** (1 + (r - 2))
        f = prime * r
        if f > 9000:
            continue
        ph = rng.uniform(0, 2 * np.pi)
        y += a / 1.3 * (np.sin(2 * np.pi * (f - 0.15) * t + ph) + 0.3 * np.sin(2 * np.pi * (f + 0.15) * t + ph + 0.7)) \
            * env_ar(n, 0.0015, tau * damp)
    # the strike: a short band-limited knock
    nz = ss.sosfilt(ss.butter(2, [900, 4200], 'band', fs=SR, output='sos'), rng.standard_normal(n))
    y += 0.10 * strike * bright * nz * env_ar(n, 0.0008, 0.006)
    return y / np.abs(y).max()


def sub_drop(dur, f0=FS2, f1=FS1, glide=0.09, tau=0.2):
    """a tuned sub thump: F#2 -> F#1 in `glide` s, so it fuses with the 808 kick instead of fighting it."""
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / (glide / 3))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ar(n, 0.002, tau)
    return np.tanh(1.6 * y) / np.tanh(1.6)


def tail(dry, tau=0.45, pre=0.015, lp=3500):
    """a short synthetic hall: decorrelated L/R noise IR (wide but mono-safe)."""
    n = int(tau * 7 * SR)
    t = np.arange(n) / SR
    out = []
    for c in range(2):
        ir = rng.standard_normal(n) * np.exp(-t / tau)
        ir = ss.sosfilt(ss.butter(2, lp, 'low', fs=SR, output='sos'), ir)
        ir = np.r_[np.zeros(int(pre * SR)), ir]
        ir /= np.sqrt((ir ** 2).sum())
        out.append(ss.fftconvolve(dry, ir)[:len(dry)])
    return np.stack(out, 1)


def place(bus, sig, t0):
    """add a mono or stereo sig into the stereo bus starting at time t0 (samples past DUR are dropped)."""
    if sig.ndim == 1:
        sig = np.stack([sig, sig], 1)
    a = int(round(t0 * SR))
    b = min(len(bus), a + len(sig))
    if b > a:
        bus[a:b] += sig[:b - a]


def level_to(sfx, music, t0, rel):
    """scale a stereo SFX so its loudness over the first 400 ms is `rel` LU relative to the music there."""
    y = kweight(sfx)
    seg = y[:int(0.4 * SR)]
    l_sfx = -0.691 + 10 * np.log10((seg ** 2).sum(1).mean() + 1e-20)
    l_mus = lufs_window(music, t0)
    return sfx * 10 ** ((l_mus + rel - l_sfx) / 20), l_mus


# ------------------------------------------------------------------ build
def build():
    x, sr = sf.read(SRC, always_2d=True)
    assert sr == SR
    N = int(round(DUR * SR))
    music = x[:N].astype(float)                       # untouched, from 0:00
    sfx = np.zeros_like(music)
    cues = []

    def cue(t, typ, rel, **kw):
        cues.append(dict(t=round(t, 4), type=typ, gain_rel_music_LU=rel, **kw))

    if REVEAL_TOLLS:
        for i, r in enumerate(REV):
            k = click_onset(music, r)                 # land the toll on the kick's real transient (no flam)
            d = REVEAL_DAMP[i]
            s = bell(FS3, 1.6, damp=d, bright=REVEAL_BRIGHT[i]) + 0.9 * sub_drop(1.6, tau=0.16 + 0.1 * d)
            st = np.stack([s, s], 1)
            st, lm = level_to(st, music, k, REVEAL_REL[i])
            place(sfx, st, k)
            cue(k, 'reveal_toll', REVEAL_REL[i], sin=i + 1, grid=round(r, 4), damp=d,
                note='damped F# bell (prime F#3) + F#2->F#1 sub, onset on the kick click')

    if TITLE_TOLL:
        k = click_onset(music, TITLE)
        n = len(music) - int(k * SR)
        dry = bell(FS3, n / SR, damp=1.0, bright=1.0, strike=1.4) + 1.1 * sub_drop(n / SR, glide=0.12, tau=0.55)
        st = np.stack([dry, dry], 1) + 0.35 * tail(dry)
        st, lm = level_to(st, music, k, TITLE_REL)
        place(sfx, st, k)
        cue(k, 'title_toll', TITLE_REL, grid=round(TITLE, 4),
            note='the same bell ringing free + sub + short hall: the one impact; rings into the fade')

    if QUIP_POP:
        for i, r in enumerate(REV):
            t = click_onset(music, r + 2 * BEAT)
            n = int(0.35 * SR); tt = np.arange(n) / SR
            f = note(78) + (note(73) - note(78)) * np.exp(-tt / 0.012)   # C#5 -> F#5 bloop
            p = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ar(n, 0.004, 0.09)
            st, _ = level_to(np.stack([p, p], 1), music, t, POP_REL)
            place(sfx, st, t); cue(t, 'quip_pop', POP_REL, sin=i + 1)

    if IRIS_SWELL:
        for e in SCENE[1:] + [OUTRO, SCENE[0]]:
            k = click_onset(music, e)
            n = int(0.32 * SR)
            nz = ss.sosfilt(ss.butter(2, [2500, 10000], 'band', fs=SR, output='sos'), rng.standard_normal((n, 2)), axis=0)
            sw = nz * env_ar(n, 0.002, 0.08)[::-1, None]
            st, _ = level_to(sw, music, k - 0.32, SWELL_REL)
            place(sfx, st, k - 0.32); cue(k - 0.32, 'iris_swell', SWELL_REL, end=round(k, 4))

    if CAL_FLICKS:
        for j in range(7):
            t = REV[3] + 2 * BEAT + j * BEAT / 2
            n = int(0.06 * SR)
            nz = ss.sosfilt(ss.butter(2, [700, 3500], 'band', fs=SR, output='sos'), rng.standard_normal(n)) * env_ar(n, 0.001, 0.012)
            st, _ = level_to(np.stack([nz, nz], 1), music, t, FLICK_REL)
            place(sfx, st, t); cue(t, 'calendar_flick', FLICK_REL, page=j + 1)

    if COINS:
        for j, m in enumerate([78, 81, 85, 90]):
            t = REV[4] + 2 * BEAT + j * BEAT / 8
            n = int(0.4 * SR); tt = np.arange(n) / SR; f = note(m)
            c = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt / d) for r, a, d in [(1, 1, .2), (2.32, .5, .12), (4.25, .25, .06)])
            st, _ = level_to(np.stack([c, c], 1), music, t, COIN_REL)
            place(sfx, st, t); cue(t, 'coin', COIN_REL, k=j + 1)

    if TYPING:
        times = [(i - 5) / 17 for i in range(5, 17)] + [1.0738 + i / 13 for i in range(10)]
        for t in times:
            n = int(0.03 * SR)
            tk = np.sin(2 * np.pi * note(73) * np.arange(n) / SR) * env_ar(n, 0.0005, 0.006)
            st, _ = level_to(np.stack([tk, tk], 1), music, max(t, 0.0), TYPE_REL)
            place(sfx, st, t); cue(t, 'type_tick', TYPE_REL)

    # one static gain for the whole mix to -14 LUFS, then the 1 s equal-power fade on the whole mix
    fade = np.ones(N)
    a, b = int(FADE_START * SR), N
    u = np.arange(b - a) / (b - a)
    fade[a:b] = np.cos(0.5 * np.pi * u)
    pre = (music + sfx) * fade[:, None]
    meter = pyln.Meter(SR)
    g = 10 ** ((LUFS_TARGET - meter.integrated_loudness(pre)) / 20)
    mix = pre * g
    tp = 20 * np.log10(np.abs(ss.resample_poly(mix, 4, 1, axis=0)).max())
    if tp > TP_MAX:                                   # never expected (track TP +1.1 dBTP at -6.7 LUFS)
        raise SystemExit(f'true peak {tp:.2f} dBTP > {TP_MAX}: lower the title toll, do not limit the music')
    sf.write(OUT, mix.astype(np.float32), SR, subtype='PCM_24')

    # the track's own pauses, for the picture (measured: no kick on these beats; half-beat sub hole before each)
    pauses = [
        dict(type='track_pause', name='P1 first drop', no_kick=[5.62, 6.13], sub_hole=[5.635, 5.885],
             pickup_stab=[5.885, 6.129], kick_returns=round(click_onset(music, REV[0]), 4)),
        dict(type='track_pause', name='P2 bar 10 break', sub_hole=[20.09, 20.34], no_kick=[20.33, 22.35],
             kick_returns=round(click_onset(music, bt(11)), 4)),
        dict(type='track_pause', name='P3 bar 26 break before title', sub_hole=[52.55, 52.80], no_kick=[52.77, 54.79],
             offbeat_hit=53.54, sub_holes_inside=[[53.29, 53.35], [53.83, 54.01], [54.31, 54.55]],
             kick_returns=round(click_onset(music, TITLE), 4)),
    ]
    with open(CUES, 'w') as f:
        json.dump(dict(film='sins7', sr=SR, duration=DUR, music_gain_db=round(20 * np.log10(g), 2),
                       grid=dict(beat=BEAT, phase=PH, bar=BAR, kick_click_vs_grid_ms='-14 at 0 s ... -10 at 59 s'),
                       cues=cues, track_pauses=pauses, fade=[FADE_START, FADE_END]), f, ensure_ascii=False, indent=1)
    return music, sfx, mix, g, fade, cues


# ------------------------------------------------------------------ verification
def verify(music, sfx, mix, g, fade, cues):
    meter = pyln.Meter(SR)
    I = meter.integrated_loudness(mix)
    tp = 20 * np.log10(np.abs(ss.resample_poly(mix, 4, 1, axis=0)).max())
    print(f'mix: {len(mix) / SR:.3f} s, {SR} Hz, {mix.shape[1]} ch | integrated {I:.2f} LUFS | true peak {tp:.2f} dBTP | '
          f'sample peak {20 * np.log10(np.abs(mix).max()):.2f} dBFS | music gain {20 * np.log10(g):.2f} dB')
    # 1. the music is untouched: mix - g*fade*music must equal g*fade*sfx exactly
    resid = mix - g * fade[:, None] * music
    quiet = np.abs(sfx).max(1) < 1e-9
    print(f'music untouched: max |mix - g*music| where no SFX = {np.abs(resid[quiet]).max():.2e} '
          f'({quiet.mean() * 100:.1f} % of samples carry no SFX)')
    # 2. the kick at every reveal and at the title, vs the picture's reveal frame
    print('reveal | grid     frame(Remotion) | kick click in MIX | kick - frame')
    worst = 0
    for i, r in enumerate(REV + [TITLE]):
        fr = round(r * FPS - 0.2) / FPS
        k = click_onset(mix, r)
        worst = max(worst, abs(k - fr))
        print(f'  {"title" if i == 7 else i + 1:>5} | {r:7.3f}  {fr:7.3f}        | {k:8.4f}          | {(k - fr) * 1000:+5.1f} ms')
    print(f'  worst |kick - frame| = {worst * 1000:.1f} ms (limit 15) with Sins7.tsx rv = Math.round(REV * FPS - 0.2) / FPS')
    wf = max(abs(click_onset(mix, r) - np.floor(r * FPS) / FPS) for r in REV + [TITLE])
    print(f'  worst |kick - frame| = {wf * 1000:.1f} ms with the fix rv = Math.floor(REV * FPS) / FPS')
    worst = min(worst, wf)
    # 3. every cue's loudness vs the music
    for c in cues:
        t = c['t']
        ls = lufs_window(g * sfx, t); lm = lufs_window(g * music, t)
        c['measured_rel_LU'] = round(ls - lm, 1)
    print('cue levels (SFX vs music, 400 ms K-weighted):', [(c['type'][:6], c['measured_rel_LU']) for c in cues])
    # 4. mono compatibility of the SFX bus
    sm = (sfx[:, 0] + sfx[:, 1]) / 2
    print(f'SFX mono fold-down: {20 * np.log10(np.sqrt((sm ** 2).mean()) / np.sqrt((sfx ** 2).mean()) + 1e-12):+.2f} dB')
    return dict(I=I, tp=tp, worst_ms=worst * 1000)


def plots(music, sfx, mix, g):
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    os.makedirs(PLOTS, exist_ok=True)
    def mom(x):
        y = kweight(x); p = (y ** 2).sum(1); cs = np.cumsum(np.r_[0, p]); w = int(0.4 * SR); h = int(0.05 * SR)
        idx = np.arange(0, len(p) - w, h)
        return (idx + w / 2) / SR, -0.691 + 10 * np.log10((cs[idx + w] - cs[idx]) / w + 1e-20)
    t1, lm = mom(mix); t2, ls = mom(g * sfx); t3, lmu = mom(g * music)
    fig, ax = plt.subplots(2, 1, figsize=(22, 9))
    ax[0].plot(t1, lm, label='mix'); ax[0].plot(t3, lmu, lw=.6, label='music alone'); ax[0].plot(t2, ls, label='SFX alone')
    ax[0].set_ylim(-40, -5); ax[0].set_ylabel('momentary LUFS (400 ms)'); ax[0].legend()
    for a in ax[:1]:
        for n in range(30): a.axvline(bt(n), color='gray', lw=.3)
        for r in REV: a.axvline(r, color='r', lw=1)
        a.axvline(TITLE, color='gold', lw=2)
        for s, e in [(5.62, 6.13), (20.33, 22.35), (52.77, 54.79)]: a.axvspan(s, e, color='c', alpha=.15)
    m = mix.mean(1)[int(52 * SR):]
    import librosa
    S = librosa.amplitude_to_db(np.abs(librosa.stft(m, n_fft=4096, hop_length=256)), ref=np.max)
    f = librosa.fft_frequencies(sr=SR, n_fft=4096); tt = 52 + np.arange(S.shape[1]) * 256 / SR
    ax[1].pcolormesh(tt, f, S, vmin=-80, vmax=0, shading='auto'); ax[1].set_yscale('symlog', linthresh=200); ax[1].set_ylim(30, 16000)
    ax[1].axvline(TITLE, color='w'); ax[1].set_title('mix 52 s - end (bar 26 break, title toll, fade)')
    plt.tight_layout(); plt.savefig(os.path.join(PLOTS, 'mix_energy_title.png'), dpi=60)


if __name__ == '__main__':
    music, sfx, mix, g, fade, cues = build()
    v = verify(music, sfx, mix, g, fade, cues)
    with open(CUES) as f:
        d = json.load(f)
    d['cues'] = cues; d['verify'] = {k: round(float(val), 2) for k, val in v.items()}
    with open(CUES, 'w') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    plots(music, sfx, mix, g)
    print('wrote', OUT, CUES, PLOTS)
