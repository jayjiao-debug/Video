"""ep57 sound effects, synthesised (no third-party samples):
- shutter_iphone_style.wav: a short, crisp double click ("tchk-tchk", ~120 ms) in the spirit of a phone shutter.
- eject_soft.wav: a gentle instant-camera eject: a soft filtered whirr (no square waves), a light paper slide, a soft tick when it's out.
- eject_slide.wav: alternative: just a paper-slide whoosh + tick.
usage: sfx.py outdir"""
import sys, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 48000; rng = np.random.default_rng(7); out = sys.argv[1]; os.makedirs(out, exist_ok=True)
def bp(x, lo, hi, o=4): return sosfilt(butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, hi, o=4): return sosfilt(butter(o, hi, 'lowpass', fs=SR, output='sos'), x)
def hp(x, lo, o=4): return sosfilt(butter(o, lo, 'highpass', fs=SR, output='sos'), x)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def click(gain, body):
    n = int(.06 * SR); t = np.arange(n) / SR
    x = hp(rng.normal(0, 1, n), 1800) * env(n, .0004, .004) * 1.0                 # the crisp edge
    x += (np.sin(2 * np.pi * 3100 * t) * .5 + np.sin(2 * np.pi * 5300 * t) * .3) * env(n, .0003, .006)   # small bright ring
    x += np.sin(2 * np.pi * 420 * t) * body * env(n, .0005, .009)                  # a little body
    return x * gain
# 1) shutter: two clicks 55 ms apart, the second a touch fuller, plus a whisper of air
n = int(.2 * SR); s = np.zeros(n)
a = click(.55, .25); s[:len(a)] += a
b = click(.75, .45); i = int(.055 * SR); s[i:i + len(b)] += b
s += bp(rng.normal(0, 1, n), 2500, 9000) * env(n, .002, .03) * .06
s = s / np.abs(s).max() * .9; s[-int(.01 * SR):] *= np.linspace(1, 0, int(.01 * SR))
sf.write(f'{out}/shutter_iphone_style.wav', s.astype(np.float32), SR)
# 2) eject: soft whirr (band-limited noise with a slow tremolo, gently rising), paper slide on top, soft tick at the end
L = .5; n = int(L * SR); t = np.arange(n) / SR
fade = np.minimum(1, t / .05) * np.minimum(1, (L - t) / .08)
whirr = bp(rng.normal(0, 1, n), 500, 1400, 2) * (.7 + .3 * np.sin(2 * np.pi * 38 * t)) * .5
purr = lp(np.sin(2 * np.pi * (95 + 25 * t / L) * t) + .3 * np.sin(2 * np.pi * (190 + 50 * t / L) * t), 600) * .25
slide = bp(rng.normal(0, 1, n), 2500, 7000, 2) * np.clip((t - .08) / .3, 0, 1) * np.clip((L - t) / .12, 0, 1) * .18
e = (whirr + purr) * fade + slide
tk = click(.25, .6); j = n - int(.03 * SR); e = np.concatenate([e, np.zeros(int(.08 * SR))]); e[j:j + len(tk)] += tk
e = lp(e, 5000, 2); e = e / np.abs(e).max() * .55
sf.write(f'{out}/eject_soft.wav', e.astype(np.float32), SR)
# 3) alternative eject: paper slide whoosh + tick only
n = int(.42 * SR); t = np.arange(n) / SR
w = bp(rng.normal(0, 1, n), 1200, 6000, 2) * np.sin(np.pi * np.clip(t / .42, 0, 1)) ** 1.5 * .5
tk = click(.3, .6); w = np.concatenate([w, np.zeros(int(.08 * SR))]); j = n - int(.02 * SR); w[j:j + len(tk)] += tk
w = w / np.abs(w).max() * .5
sf.write(f'{out}/eject_slide.wav', w.astype(np.float32), SR)
print('ok', out)
