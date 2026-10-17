"""ep29 v2 — non-stop effects on the owner's slowed track, chained into combos, built for chills.

Chills research used: gradual crescendo, expansion of the frequency range / brightness, sudden loudness, new voices
entering, everything joining together, violated expectations (Bannister & Eerola 2018 review), and sound rotating
around the head increases frisson, slow rotation is the most pleasant (Honda et al. 2020).

Chain (output time, roughly):
  intro   varispeed up a major third and back → ping-pong between the ears
  groove  air "pump" on every kick → bass only → treble only → PHANTOM BASS (no lows, you still hear the kick)
          → CENTRE CANCEL (the middle vanishes) → slam back
  quiet   BINAURAL BEAT (363 Hz left, 369 Hz right: a 6 Hz wobble that is in neither ear) → highs fade with age
  build   GOTCHA (screen says left, sound is right; swap) → PRECEDENCE (both ears equal, one 18 ms late → heard on one
          side) → COMBO: endless rising Shepard scale + accelerating 360° + filter opening + crescendo → silence
  DROP    everything at once, brighter and wider (title)
  full    tuned sines: root, octave 2:1, fifth 3:2, a semitone clash → slow 360° + a sad slowdown −2 semitones
          → recap montage (one bar each) → wide, gently circling finale → tape-stop
usage: python3 process_v2.py out.wav   (writes timing_v2.json)

v3 PROPOSED (music review, review/music_review.md) — every change is tagged "# FIX n" with the review item number.
usage (run inside music/):  python3 ../review/music/process_v3_proposed.py out.wav timing_out.json
"""
import json, sys, os, subprocess
import numpy as np, soundfile as sf, librosa
from scipy.signal import resample_poly, butter, sosfilt, hilbert
from scipy.ndimage import minimum_filter1d, uniform_filter1d
import pyloudnorm as pyln

SR = 44100
# FIX 1: the song is 118.52 bpm (beat 0.50625 s, measured by onset autocorrelation over the whole track), not
# 117.45. The picture, subtitles and timing were all built on BEAT = 0.510839, so conform the SONG to that grid:
# a 0.90 % pitch-preserving stretch (rubberband) makes the song's bars land exactly on OB(k). Picture untouched.
BEAT_SONG, BEAT = 0.50625, 0.5108390
CONF = os.environ.get('BGM_CONFORMED', 'bgm_conformed.wav')
if not os.path.exists(CONF):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'bgm.mp3', '-af',
                    f'rubberband=tempo={BEAT_SONG / BEAT:.6f}:transients=crisp:detector=percussive:pitchq=quality',
                    '-c:a', 'pcm_s16le', CONF], check=True)
x, _ = librosa.load(CONF, sr=SR, mono=False)
x = x.astype(np.float32)
BAR = 4 * BEAT; B0 = 0.414                                       # FIX 1: measured first downbeat of the conformed file
ROOT = 362.8                                                     # measured tonic of the track (F#, −34 cents)
def S(k): return B0 + BAR * k                                 # source time of bar k
def cosr(u): u = np.clip(u, 0, 1); return 0.5 - 0.5 * np.cos(np.pi * u)

# ------------------------------------------------------------ time warps, defined on SOURCE time
NS = x.shape[1]
tau = np.arange(NS) / SR
sp = np.ones(NS)
up = 2 ** (4 / 12)
sp += (up - 1) * cosr((tau - 4.45) / 0.55) * (1 - cosr((tau - 9.3) / 1.3))      # intro: up a major third, back
down = 2 ** (-2 / 12)
sp += (down - 1) * cosr((tau - S(59)) / BEAT) * (1 - cosr((tau - (S(61) - BEAT)) / BEAT))   # the sad slowdown
t_of_tau = np.concatenate([[0], np.cumsum(1 / sp[:-1]) / SR])
NOUT = int(t_of_tau[-1] * SR)
t = np.arange(NOUT) / SR
tau_t = np.interp(t, t_of_tau, tau)
def O(src_time): return float(np.interp(src_time, tau, t_of_tau))   # source → output time
def OB(k): return O(S(k))
UP = 4
y = np.zeros((2, NOUT), np.float32)
CH = SR * 20
for a in range(0, NOUT, CH):                                    # resample in chunks (memory)
    b = min(NOUT, a + CH)
    s0 = max(0, int(tau_t[a] * SR) - 64); s1 = min(NS, int(tau_t[b - 1] * SR) + 64)
    hi = resample_poly(x[:, s0:s1], UP, 1, axis=1)
    pos = (tau_t[a:b] * SR - s0) * UP
    for c in range(2):
        y[c, a:b] = np.interp(pos, np.arange(hi.shape[1]), hi[c])
N = NOUT

# ------------------------------------------------------------ helpers
def win(a, b, fi=0.12, fo=0.12):                               # smooth 0→1→0 window in output time
    return cosr((t - a) / fi) * (1 - cosr((t - (b - fo)) / fo))
idx = np.arange(N, dtype=np.float64)
def delayed(sig, d):                                             # fractional delay (seconds, array or float)
    return np.interp(idx - d * SR, idx, sig, left=0).astype(np.float32)
mono = lambda z: 0.5 * (z[0] + z[1])

E = {}                                                           # effect timeline for the overlay
# ------------------------------------------------------------ STFT EQ effects
NFFT, HOP = 4096, 1024
F = librosa.fft_frequencies(sr=SR, n_fft=NFFT)
E['lp'] = (OB(13), OB(15)); E['hp'] = (OB(15), OB(17)); E['phantom'] = (OB(17), OB(19))
E['age'] = (OB(30) - 0.4, OB(31) + 0.3, OB(32))                  # FIX 9: start on the line 年纪越大 (60.24), not 2.7 s before
E['open'] = (OB(36), OB(40) - 0.5)                               # the build: filter opens from 500 Hz to everything
E['binaural'] = (OB(24), OB(28) + 1.0)
E['bright'] = (OB(40), OB(42))
E['recap'] = [OB(k) for k in range(64, 70)]
def lpg(fc): return 1 / np.sqrt(1 + (F / fc) ** 8)
def hpg(fc): return 1 / np.sqrt(1 + (fc / np.maximum(F, 1)) ** 8)
def gains(tf):
    g = np.ones_like(F)
    def w(a, b, fi=BEAT * 0.5, fo=BEAT * 0.5): return float(cosr((tf - a) / fi) * (1 - cosr((tf - (b - fo)) / fo)))
    k = w(*E['lp']);      g *= (1 - k) + k * lpg(220) * 1.25     # FIX 5: was 0.85 → −9 dB on earbuds, silent on a phone
    k = w(*E['hp']);      g *= (1 - k) + k * hpg(3000) * 1.6     # FIX 5: was 2.3 → +2.6 dB over the body, harsh, TP overs
    a, b = E['binaural']                                          # FIX 4: take the track's own F#4 out of the binaural band,
    k = w(a, b, fi=1.2, fo=1.2)                                   #        so "两只耳朵里，都没有它" is literally true
    g *= 1 - k * 0.92 * (np.abs(F - (ROOT + 3)) < 28)
    k = w(*E['phantom']); g *= (1 - k) + k * hpg(130) * 1.15
    a, b, c = E['age']
    k = float(cosr((tf - a) / (b - a)) * (1 - cosr((tf - c + 0.25) / 0.25)))
    if k > 0: g *= lpg(np.exp(np.log(18000) + (np.log(2500) - np.log(18000)) * k)) ** 0.75
    a, b = E['open']
    if a - BEAT < tf < b + 0.6:
        k = float(cosr((tf - a) / (b - a)))
        fc = np.exp(np.log(800) + (np.log(20000) - np.log(800)) * k ** 1.7)   # FIX 7: start at 800 Hz, not 500
        g *= lpg(fc) ** 0.75 * (0.55 + 0.45 * k) if tf < b else 1
    k = w(*E['bright'], fi=0.05, fo=BAR)                          # the drop: a brighter top (+3 dB above 5 kHz)
    g *= 1 + k * 0.41 * (F > 5000) * np.clip((F - 5000) / 3000, 0, 1)
    r = E['recap']                                                # recap montage, one bar each
    k = w(r[0], r[1]); g *= (1 - k) + k * lpg(220) * 1.25         # FIX 5
    k = w(r[1], r[2]); g *= (1 - k) + k * hpg(3000) * 1.6         # FIX 5
    return g
Y = np.stack([librosa.stft(y[c], n_fft=NFFT, hop_length=HOP) for c in range(2)])
tfr = librosa.frames_to_time(np.arange(Y.shape[2]), sr=SR, hop_length=HOP)
G = np.stack([gains(tf) for tf in tfr], axis=1).astype(np.float32)
y = np.stack([librosa.istft(Y[c] * G, hop_length=HOP, length=N) for c in range(2)]).astype(np.float32)
del Y, G

# ------------------------------------------------------------ the kick "pump" (air pushed on every beat)
E['pump'] = (OB(8), OB(13))
k = win(*E['pump'], fi=BAR, fo=BEAT)
ph = ((tau_t - B0) / BEAT) % 1.0
pump = 1 - 0.45 * np.exp(-ph * BEAT / 0.11) * k
# FIX 10: sidechain-style — duck everything ABOVE the kick, not the kick itself (y *= pump also ducked the kick 4 dB)
sosK = butter(4, 150, 'low', fs=SR, output='sos')
lowp = sosfilt(sosK, y, axis=1).astype(np.float32)
y = lowp + (y - lowp) * pump.astype(np.float32)
del lowp

# ------------------------------------------------------------ ping-pong between the ears (intro tail)
E['pingpong'] = (O(10.6), OB(8))
k = win(*E['pingpong'], fi=BEAT, fo=BEAT)
side = np.sign(np.sin(np.pi * ((tau_t - B0) / BEAT)))           # alternate every beat
sm = np.convolve(side, np.ones(400) / 400, mode='same')         # soften the switch
m = mono(y)
pp = np.stack([m * (1 - 0.85 * np.clip(sm, 0, 1)), m * (1 - 0.85 * np.clip(-sm, 0, 1))]) * 1.15
y = y * (1 - k) + pp * k

# ------------------------------------------------------------ centre cancel (the middle vanishes), then slam back
E['cancel'] = (OB(19), OB(21))
k = win(*E['cancel'], fi=BEAT * 0.5, fo=0.03)
sd = 0.5 * (y[0] - y[1])
# FIX 3: [sd, −sd]·3 was pure anti-phase (+4 dB over the body on earbuds, total silence in mono / phone speaker,
# and the "合回来！" slam then sounded QUIETER than the cancel). Right ear = 90°-shifted copy: just as wide and hollow
# on earbuds, flat (no cancellation) when summed to mono; gain 1.8 so the return is a lift.
sdq = np.imag(hilbert(sd)).astype(np.float32)
y = y * (1 - k) + np.stack([sd, sdq]) * 1.8 * k

# ------------------------------------------------------------ binaural beat (in neither ear)
k = win(*E['binaural'], fi=1.2, fo=1.2)
y *= 1 - 0.4 * k                                                  # FIX 4: was 0.3; tones up from 0.09
y[0] += (0.13 * k * np.sin(2 * np.pi * 363.0 * t)).astype(np.float32)      # the subtitle's numbers: 363 / 369
E['bin_mute'] = (OB(27), OB(27) + 2 * BEAT)                     # MASTERCLASS 2: mute the right tone for two beats —
mute = win(*E['bin_mute'], 0.06, 0.06)                            # the wobble stops, then returns: proof it lives in the head
y[1] += (0.13 * k * (1 - mute) * np.sin(2 * np.pi * 369.0 * t)).astype(np.float32)

# ------------------------------------------------------------ gotcha + precedence
E['gotcha'] = (OB(32), OB(33), OB(34))                          # bar 32: sound RIGHT (screen says left); bar 33: LEFT
E['prec'] = (OB(34), OB(35), OB(37))                            # bar 34: right 18 ms late (heard left); bar 35: left late
# FIX 11: hold the "left late" state through bar 36 so 大脑只信先到的那只耳朵 (73.2–75.8) is still heard as a demo
m = mono(y)
kR = win(OB(32), OB(33), 0.05, 0.05); kL = win(OB(33), OB(34), 0.05, 0.05)
gl = np.stack([m * 0.06, m * 1.12]); gr = np.stack([m * 1.12, m * 0.06])   # FIX 12: 1.35 put these hard-panned bars on the limiter
y = y * (1 - kR - kL) + gl * kR + gr * kL
m = mono(y)
k1 = win(OB(34), OB(35), 0.05, 0.05); k2 = win(OB(35), OB(37), 0.05, 0.3)
p1 = np.stack([m, delayed(m, 0.018)]); p2 = np.stack([delayed(m, 0.018), m])
y = y * (1 - k1 - k2) + p1 * k1 + p2 * k2

# ------------------------------------------------------------ 360° rotation (used three times)
sosL = butter(2, 1800, 'low', fs=SR, output='sos')
sosL = butter(2, 1200, 'low', fs=SR, output='sos')              # FIX 6: darker head shadow (was 1800 Hz)
def rotate(z, theta, amount):
    m = mono(z); ml = sosfilt(sosL, m).astype(np.float32)
    sdx = np.sin(theta); back = np.clip(-np.cos(theta), 0, 1)
    itd = 0.0006 * sdx
    farL = np.clip(sdx, 0, 1); farR = np.clip(-sdx, 0, 1)
    # FIX 6: behind the head both ears lose the top (pinna cue) instead of a flat −3 dB → front/back reads on earbuds
    bL = np.clip(farL + 0.6 * back, 0, 1); bR = np.clip(farR + 0.6 * back, 0, 1)
    L = delayed(m, np.clip(itd, 0, None)) * (1 - bL) + delayed(ml, np.clip(itd, 0, None)) * bL
    R = delayed(m, np.clip(-itd, 0, None)) * (1 - bR) + delayed(ml, np.clip(-itd, 0, None)) * bR
    L *= 1 - 0.72 * farL; R *= 1 - 0.72 * farR                  # FIX 6: far ear −11 dB (was −5 dB → only ±4 dB swing)
    b = np.stack([L, R]) * 1.15
    return z * (1 - 0.95 * amount) + b * (0.95 * amount)           # FIX 6: less dry centre left over (was 0.85)
# (a) the build: 3 turns, accelerating, lands in front on the drop
E['rot_build'] = (OB(37), OB(40))
a, b = E['rot_build']; u = np.clip((t - a) / (b - a), 0, 1)
y = rotate(y, 2 * np.pi * 3 * u ** 1.7, win(a, b - 0.5, BAR * 0.5, 0.2))
# (b) the sad part: one slow turn every 4 bars (slow rotation = most frisson with the most pleasure)
E['rot_slow'] = (OB(56), OB(64))
a, b = E['rot_slow']; y = rotate(y, 2 * np.pi * (t - a) / (4 * BAR), win(a, b, BAR, BAR) * 0.8)
# (c) recap bar 5 and the finale: gentle circles
E['rot_end'] = (OB(68), OB(74))                                 # MASTERCLASS 3: the circling settles to the front as everything lines up
a, b = E['rot_end']; y = rotate(y, 2 * np.pi * (t - a) / (2 * BAR), win(a, b, BAR, BAR) * 0.7)

# ------------------------------------------------------------ the build: endless rising Shepard scale (in F# minor)
E['shepard'] = (OB(36), OB(40) - 0.5)
a, b = E['shepard']
scale = [0, 2, 3, 5, 7, 8, 10]                                   # natural minor, semitones above F#
steps = []
st = a; i = 0
while st < b:                                                     # eighth notes, then sixteenths in the last bar
    dur = BEAT / 2 if st < b - BAR else BEAT / 4
    steps.append((st, min(st + dur, b), i)); st += dur; i += 1
sh = np.zeros(N, np.float32)
for (s0, s1, i) in steps:
    i0, i1 = int(s0 * SR), int(min(s1 + 0.08, b) * SR)
    tt = (np.arange(i1 - i0) / SR).astype(np.float32)
    semis = 12 * (i // 7) + scale[i % 7]
    pos = (semis % 72) / 72.0                                     # position in a 6-octave cycle
    env = np.minimum(1, tt / 0.01) * np.exp(-tt / 0.35)
    tone = np.zeros_like(tt)
    for o in range(6):                                            # octave partials under a fixed bell curve
        f = (ROOT / 4) * 2 ** (o + pos * 6 - int(pos * 6) + (semis % 12) / 12 - (semis % 12) / 12)
        f = (ROOT / 8) * 2 ** (((semis % 12) / 12) + o)
        lf = np.log2(f / (ROOT / 2))
        amp = np.exp(-0.5 * (lf / 1.2) ** 2)
        tone += amp * np.sin(2 * np.pi * f * tt)
    sh[i0:i1] += (tone * env).astype(np.float32)
cres = (cosr((t - a) / (b - a)) * 0.6 + 0.4) * (t < b)          # FIX 2: floor 0.4 (was 0.15)
sh *= (0.17 * cres).astype(np.float32)                            # FIX 2: was 0.06 → −24…−9 dB under the mix, inaudible
y += np.stack([sh, sh])
# crescendo of the whole mix and a breath of silence before the drop
y *= (0.78 + 0.22 * cosr((t - OB(36)) / (OB(40) - 0.5 - OB(36)))) ** (1.0 * ((t > OB(36)) & (t < OB(40))))  # FIX 7: was 0.6
gap = 1.0   # owner: no silent stop before the drop (felt like a stutter)
y *= gap

# ------------------------------------------------------------ the drop: wider stereo for two bars
E['wide'] = (OB(40), OB(42))
k = win(*E['wide'], fi=0.03, fo=BAR)
md = 0.5 * (y[0] + y[1]); sd = 0.5 * (y[0] - y[1])
y = np.stack([md + sd * (1 + 0.8 * k), md - sd * (1 + 0.8 * k)])

# ------------------------------------------------------------ tuned sines: root, octave, fifth, clash
def note(f, a, b, level=0.07, att=0.25, rel=0.6):
    env = (np.clip((t - a) / att, 0, 1) * np.clip((b - t) / rel, 0, 1)) ** 1.5
    # FIX 8: a few harmonics (soft organ), so the octave/fifth "lock" and the semitone's roughness are audible on earbuds
    w = sum(h * np.sin(2 * np.pi * f * n * t) for n, h in [(1, 1), (2, 0.45), (3, 0.3), (4, 0.15)])
    return (level * env * w).astype(np.float32)
E['root'] = (OB(43), OB(50)); E['oct'] = (OB(45), OB(47)); E['fifth'] = (OB(47), OB(50)); E['clash'] = (OB(51), OB(52) + BEAT)
OCT_IN = OB(44)                                                   # FIX 8: octave enters ON 再加一个高八度—— (89.18), not 2 s later
pad = note(ROOT, *E['root'], level=0.10) + note(2 * ROOT, OCT_IN, E['oct'][1], level=0.07) + note(1.5 * ROOT, *E['fifth'], level=0.08)
pad += note(ROOT, *E['clash'], level=0.10) + note(ROOT * 2 ** (1 / 12), E['clash'][0] + BEAT, E['clash'][1], level=0.09)
kd = win(OB(43) - 0.3, OB(52) + BEAT + 0.6, BEAT, BAR)            # FIX 8: duck the song 5 dB under the demo tones
y *= (1 - 0.44 * kd).astype(np.float32)
y += np.stack([pad, pad])
E['slow'] = (OB(59), OB(61))

# ------------------------------------------------------------ recap montage: bass / treble / centre-cancel / ping-pong
r = E['recap']
k = win(r[2], r[3], 0.05, 0.05); sd = 0.5 * (y[0] - y[1]); y = y * (1 - k) + np.stack([sd, np.imag(hilbert(sd)).astype(np.float32)]) * 1.8 * k   # FIX 3
k = win(r[3], r[4], 0.05, 0.05)
m = mono(y); side = np.sign(np.sin(np.pi * ((tau_t - B0) / (BEAT / 2)))); sm = np.convolve(side, np.ones(300) / 300, mode='same')
pp = np.stack([m * (1 - 0.85 * np.clip(sm, 0, 1)), m * (1 - 0.85 * np.clip(-sm, 0, 1))]) * 1.15
y = y * (1 - k) + pp * k

# ------------------------------------------------------------ MASTERCLASS 3: everything returns in the final chorus
# the octave and fifth from the harmony demo come back under the closing lines, swelling over a bar into bar 73,
# where the picture's particles line up into one wave
E['return'] = (OB(72), OB(76))
ret = note(2 * ROOT, OB(72), OB(76), level=0.05, att=BAR, rel=BAR) + note(1.5 * ROOT, OB(72) + BAR * 0.5, OB(76), level=0.045, att=BAR, rel=BAR)
y += np.stack([ret, ret])

# ------------------------------------------------------------ MASTERCLASS 1: reverse-reverb "inhale" into the drop
# one beat of the drop's own first hit, smeared by a 1.2 s decaying-noise reverb, played backwards so it swells
# INTO OB(40): anticipation without a stop (the owner rejected the silent gap)
i40 = int(OB(40) * SR); seg = y[:, i40:i40 + int(1.2 * SR)].astype(np.float64)
rng_ = np.random.default_rng(40); n = int(1.2 * SR)
ir = rng_.standard_normal((2, n)) * np.exp(-np.arange(n) / (0.32 * SR)); ir /= np.sqrt((ir ** 2).sum(1, keepdims=True))
from scipy.signal import fftconvolve
wet = np.stack([fftconvolve(seg[c], ir[c])[:n] for c in range(2)])[:, ::-1]
L1 = int(BEAT * 1.5 * SR); wet = wet[:, -L1:] * np.linspace(0, 1, L1) ** 2
wet *= 10 ** (-8 / 20) * np.sqrt((y[:, i40 - L1:i40] ** 2).mean()) / max(np.sqrt((wet ** 2).mean()), 1e-9)
y[:, i40 - L1:i40] += wet.astype(np.float32)
E['inhale'] = (OB(40) - BEAT * 1.5, OB(40))

# ------------------------------------------------------------ tape-stop on the last bar
END = OB(80); TS0 = END - 1.6
E['tapestop'] = (TS0, END)
if TS0 < N / SR:
    i0 = int(TS0 * SR); tt = np.arange(int(1.6 * SR)) / SR
    src = TS0 + np.cumsum((1 - tt / 1.6) ** 1.6) / SR
    tail = np.stack([np.interp(src * SR, np.arange(N), y[c]) for c in range(2)]) * np.clip((1.6 - tt) / 0.5, 0, 1)
    y = np.concatenate([y[:, :i0], tail.astype(np.float32)], axis=1)

# FIX 12: was peak-normalise → true peak +0.4 dBTP at −15.9 LUFS, so the "two-pass linear" loudnorm silently fell back
# to DYNAMIC mode and re-rode the gain by −2.4…+5.2 dB (flattening the build by ~3 dB). Do loudness here instead:
# −14 LUFS, then a look-ahead true-peak limiter at −1.5 dBTP (4× oversampled detector). Mux the result with NO loudnorm.
y = y * 10 ** ((-14.0 - pyln.Meter(SR).integrated_loudness(y.T)) / 20)
pk = np.abs(resample_poly(y, 4, 1, axis=1)).max(0).reshape(-1, 4).max(1)[:y.shape[1]]
g = np.minimum(1.0, 10 ** (-1.6 / 20) / np.maximum(pk, 1e-9))
LA = int(0.004 * SR); g = minimum_filter1d(g, 2 * LA + 1)
gd = g[::44].copy(); rel = np.exp(-1 / 80.0)                       # 1 ms steps, 80 ms release
for i in range(1, len(gd)): gd[i] = min(gd[i], rel * gd[i - 1] + (1 - rel) * gd[i])
g = np.minimum(g, np.interp(np.arange(len(g)), np.arange(len(gd)) * 44, gd))
g = uniform_filter1d(g, LA, mode='nearest')
y = (y * g).astype(np.float32)
print('limiter max gain reduction %.1f dB' % (-20 * np.log10(g.min())))
print('limiter > 3 dB at (s):', sorted(set(np.round(np.where(g < 10 ** (-3 / 20))[0] / SR, 1).tolist()))[:40])
sf.write(sys.argv[1], y.T, SR, subtype='PCM_24')
E['drop'] = (OB(40),); E['end'] = (y.shape[1] / SR,)
E['bars'] = {k: round(OB(k), 3) for k in range(0, 81)}
json.dump({k: v for k, v in E.items()}, open(sys.argv[2] if len(sys.argv) > 2 else 'timing_v2.json', 'w'), indent=1)
print('drop', round(OB(40), 2), 'end', round(y.shape[1] / SR, 2))
