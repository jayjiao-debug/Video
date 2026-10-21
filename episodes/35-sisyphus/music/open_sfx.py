"""ep35 cold open: TV sound design (dial clicks, static bursts, CRT hum, power off/on) mixed under the owner's BGM.
usage: python3 open_sfx.py <bgm.mp3> <out.wav> [duration]
Times follow the picture (Open8): bt(k) = 0.416 + 0.50625 k."""
import subprocess, sys, numpy as np, wave
SR = 44100
bt = lambda k: 0.416 + 0.50625 * k
FLIPS = [bt(k) for k in [7, 9, 11, 13, 14, 15, 16, 17, 18, 19, 19.5, 20, 20.5, 21, 21.25, 21.5, 21.75]]
PULL0, PULL1, OFF, DIVE1 = bt(5), bt(7) - 0.04, bt(22), bt(25)
rng = np.random.default_rng(7)

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def band(x, lo, hi): return onepole_lp(x, hi) - onepole_lp(x, lo)
def env_ad(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def static(dur, level=1.0):
    n = int(dur * SR)
    w = rng.standard_normal(n)
    hiss = band(w, 400, 9000)
    crackle = (rng.random(n) < 0.004) * rng.standard_normal(n) * 6   # sparse pops
    buzz = 0.25 * np.sign(np.sin(2 * np.pi * 59.94 * np.arange(n) / SR)) * band(rng.standard_normal(n), 100, 3000)   # field-rate buzz
    x = hiss + band(crackle, 600, 7000) + buzz
    return level * 0.22 * x / np.sqrt(np.mean(x ** 2))          # unit: RMS 0.22
def click(level=1.0, f=2600, d=0.018):
    n = int(0.06 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * f * t) * np.exp(-t / d) + 0.6 * np.sin(2 * np.pi * f * 1.9 * t) * np.exp(-t / (d * 0.5))
    tr = np.zeros(n); tr[:30] = rng.standard_normal(30) * np.linspace(1, 0, 30) * 2
    x = body + tr
    return level * 0.5 * x / np.abs(x).max()                    # unit: peak 0.5
def thunk(level=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    c = np.concatenate([click(0.5, 900, 0.03), np.zeros(n - int(0.06 * SR))])
    return level * (c + np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.06))

def main():
    bgm_path, out = sys.argv[1], sys.argv[2]
    dur = float(sys.argv[3]) if len(sys.argv) > 3 else 20.5
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', bgm_path, '-t', str(dur), '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    bgm = np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float64) / 32768
    N = int(dur * SR); bgm = np.pad(bgm, ((0, max(0, N - len(bgm))), (0, 0)))[:N]
    fx = np.zeros(N)
    def put(sig, t0, g=1.0):
        i = int(t0 * SR); j = min(N, i + len(sig))
        if i < N: fx[i:j] += g * sig[:j - i]
    # CRT hum + faint line whine while the set is on screen (pull-back → switch-off)
    t = np.arange(N) / SR
    on = np.clip((t - PULL0) / 0.6, 0, 1) * np.clip((OFF + 0.35 - t) / 0.3, 0, 1)
    hum = 0.022 * (np.sin(2 * np.pi * 60 * t) + 0.5 * np.sin(2 * np.pi * 120 * t) + 0.25 * np.sin(2 * np.pi * 180 * t)) + 0.006 * np.sin(2 * np.pi * 7800 * t)
    # (owner, v9: no hum under the TV — removed)
    # the platform turns out to be a picture: a soft crackle as the glass appears
    s = static(0.7); put(s * np.linspace(0, 1, len(s)) ** 0.5 * np.exp(-np.arange(len(s)) / SR / 0.25), PULL0, 0.18)
    # each flip: the dial's detent, then a burst of snow that matches the picture (full 0.12 s, fading by 0.34 s)
    for k, tf in enumerate(FLIPS):
        fast = k >= 10
        put(click(1.0, 2400 + 300 * (k % 3)), tf - 0.012, 0.5)
        n = int(0.36 * SR); e = np.ones(n); a = int(0.12 * SR); e[a:] = np.linspace(1, 0, n - a) ** 1.5
        put(static(0.36) * e, tf, 0.42 if not fast else 0.36)
    # switch-off: a thunk, the picture collapsing with a falling whine, a last crackle of static
    put(click(1.0, 1200, 0.03), OFF - 0.01, 0.6)
    n = int(0.6 * SR); tt = np.arange(n) / SR
    whine = np.sin(2 * np.pi * np.cumsum(9000 * np.exp(-tt / 0.18) + 300) / SR) * np.exp(-tt / 0.22)
    put(whine, OFF, 0.07)
    s = static(0.3); put(s * np.exp(-np.arange(len(s)) / SR / 0.08), OFF, 0.35)
    # switch-on (第二天): a click, a rising zap of static, the hum swelling then cut as we are back on the platform
    put(click(1.0, 1500, 0.025), DIVE1 - 0.02, 0.6)
    s = static(0.32); put(s * np.linspace(0.2, 1, len(s)) * np.exp(-np.maximum(0, np.arange(len(s)) / SR - 0.2) / 0.05), DIVE1, 0.38)
    # the channel change dips the music a little (like the set's own sound cutting out), then it comes straight back
    # (owner rule: the BGM is never processed — no ducking; the effects give way instead where the song is already near full scale)
    # mix: a little stereo width on the static, keep the music on top
    L = bgm[:, 0] + fx * 0.95; R = bgm[:, 1] + np.concatenate([np.zeros(40), fx[:-40]]) * 0.95
    mix = np.stack([L, R], 1)
    fade = np.clip((dur - 0.05 - t) / 0.9, 0, 1)[:, None]; mix *= fade
    room = np.clip(0.985 - np.abs(bgm).max(1), 0.0, None)                     # headroom left by the song, per sample
    room = -onepole_lp(-room, 200) if False else room
    over = np.abs(mix).max(1) > 0.985
    if over.any():                                                              # pull only the effects back where song + effects would clip
        g = np.ones(N); fxa = np.maximum(np.abs(fx), 1e-9)
        g[over] = np.clip(room[over] / fxa[over], 0, 1)
        g = np.minimum.accumulate(g[::-1])[::-1] if False else g
        mix = bgm + np.stack([fx * g, np.concatenate([np.zeros(40), (fx * g)[:-40]])], 1) * 0.95
    peak = np.abs(mix).max()
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
    rms = lambda a, b, x: np.sqrt(np.mean(x[int(a * SR):int(b * SR)] ** 2))
    print('wrote', out, 'peak', round(peak, 3), '| music rms in flips', round(rms(FLIPS[0], FLIPS[0] + 0.3, bgm[:, 0]), 3), '| static rms', round(rms(FLIPS[0], FLIPS[0] + 0.12, fx), 3))
if __name__ == '__main__': main()
