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
usage: python3 process_v4.py out.wav timing.json
v4 (owner notes 2026-10-18): 若如初见 (the remix) opens the film with the vocal circling the head and welds into the
song; the sad slowdown holds to the end of the song part and welds into the remix breakdown (rotating vocal), whose
drop carries the recap; the remix's own decaying outro ends the film. Binaural notch widened (no single-ear beating),
the ratio demo uses struck e-piano dyads instead of drones, the Shepard scale runs all the way into the drop.

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
sp += (down - 1) * cosr((tau - S(59)) / BEAT)                    # v4: the sad slowdown holds to the weld
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
E['open'] = (OB(36), OB(40))                               # the build: filter opens from 500 Hz to everything
E['binaural'] = (OB(24), OB(28) + 1.0)
E['bright'] = (OB(40), OB(42))
W = OB(64)                                                       # v4: weld into the remix breakdown
E['slow'] = (OB(59), W)
notch = np.clip(np.minimum((F - 280) / 20, (450 - F) / 20), 0, 1)
def lpg(fc): return 1 / np.sqrt(1 + (F / fc) ** 8)
def hpg(fc): return 1 / np.sqrt(1 + (fc / np.maximum(F, 1)) ** 8)
def gains(tf):
    g = np.ones_like(F)
    def w(a, b, fi=BEAT * 0.5, fo=BEAT * 0.5): return float(cosr((tf - a) / fi) * (1 - cosr((tf - (b - fo)) / fo)))
    k = w(*E['lp']);      g *= (1 - k) + k * lpg(220) * 1.25     # FIX 5: was 0.85 → −9 dB on earbuds, silent on a phone
    k = w(*E['hp']);      g *= (1 - k) + k * hpg(3000) * 1.6     # FIX 5: was 2.3 → +2.6 dB over the body, harsh, TP overs
    a, b = E['binaural']                                          # FIX 4: take the track's own F#4 out of the binaural band,
    k = w(a, b, fi=1.2, fo=1.2)                                   #        so "两只耳朵里，都没有它" is literally true
    g *= 1 - k * notch                                             # v4: 300–430 Hz fully out (no single-ear beating)
    k = w(*E['phantom']); g *= (1 - k) + k * hpg(130) * 1.15
    a, b, c = E['age']
    k = float(cosr((tf - a) / (b - a)) * (1 - cosr((tf - c + 0.25) / 0.25)))
    if k > 0: g *= lpg(np.exp(np.log(18000) + (np.log(2500) - np.log(18000)) * k)) ** 0.75
    a, b = E['open']
    if a - BEAT < tf < b + 0.6:
        k = float(cosr((tf - a) / (b - a)))
        fc = np.exp(np.log(800) + (np.log(20000) - np.log(800)) * k ** 1.7)   # FIX 7: start at 800 Hz, not 500
        g *= lpg(fc) ** 0.75 * (0.55 + 0.45 * k) if tf < b else 1
    if OB(40) - BEAT < tf < OB(40):                                # music review v5: empty the bass over the last beat (zero-phase)
        kb = float(cosr((tf - (OB(40) - BEAT)) / (0.6 * BEAT))); g *= (1 - kb) + kb * hpg(200)
    a, b = E['slow']                                              # music review v5: +2 dB presence in the sad part (phones)
    k = w(a, b + 0.5, fi=BAR, fo=0.6); g *= 1 + k * 0.26 * ((F > 300) & (F < 3000))
    k = w(*E['bright'], fi=0.05, fo=BAR)                          # the drop: a brighter top (+3 dB above 5 kHz)
    g *= 1 + k * 0.41 * (F > 5000) * np.clip((F - 5000) / 3000, 0, 1)
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
# v4 (owner: "play with 和声，混响"): in the second bar of the cancel the leftover side signal (the harmony and the
# room) blooms into a long reverb that swells around the head, then the slam back cuts it
from scipy.signal import fftconvolve
def reverb(sig2, t60, seed, length=None):
    n = int(t60 * 1.1 * SR); rr = np.random.default_rng(seed)
    ir = rr.standard_normal((2, n)) * np.exp(-6.9 * np.arange(n) / (t60 * SR)); ir /= np.sqrt((ir ** 2).sum(1, keepdims=True))
    out = np.stack([fftconvolve(sig2[c], ir[c]) for c in range(2)]).astype(np.float32)
    return out if length is None else out[:, :length]
E['verb'] = (OB(20), OB(21))
i0, i1 = int(OB(19) * SR), int(OB(21) * SR)
side2 = np.stack([sd, sdq])[:, i0:i1] * 1.8
side2 = sosfilt(butter(2, [250, 6000], 'band', fs=SR, output='sos'), side2, axis=1).astype(np.float32)
wet = delayed_pd = reverb(side2, 3.5, 19, i1 - i0)
wet = np.concatenate([np.zeros((2, int(0.255 * SR)), np.float32), wet[:, :-int(0.255 * SR)]], 1)   # 1/8 pre-delay
kv = np.clip((t[i0:i1] - OB(20) + BEAT) / (BAR), 0, 1) ** 1.5 * np.clip((OB(21) - t[i0:i1]) / 0.05, 0, 1)
y[:, i0:i1] += wet * kv * 0.9

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
    bL = np.clip(farL + 0.9 * back, 0, 1); bR = np.clip(farR + 0.9 * back, 0, 1)
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
E['rot_slow'] = (OB(56), W + 1.0)
a, b = E['rot_slow']; y = rotate(y, 2 * np.pi * (t - a) / (4 * BAR), win(a, b, BAR, BAR) * 0.8)
# ------------------------------------------------------------ the build: endless rising Shepard scale (in F# minor)
E['shepard'] = (OB(36), OB(40))                                 # v4: runs into the drop (was −0.5 s)
a, b = E['shepard']
scale = [0, 2, 3, 5, 7, 8, 10]                                   # natural minor, semitones above F#
steps = []
st = a; i = 0
while st < b:                                                     # eighth notes, then sixteenths in the last bar
    dur = BEAT / 2 if st < b - BAR else BEAT / 4
    steps.append((st, min(st + dur, b), i)); st += dur; i += 1
sh = np.zeros(N, np.float32)
for (s0, s1, i) in steps:
    i0, i1 = int(s0 * SR), int((s1 + 0.35) * SR)
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
cres = (cosr((t - a) / (b - a)) * 0.6 + 0.4) * np.clip(1 - (t - b) / 0.35, 0, 1)   # v4: tails ring into the drop
sh *= (0.17 * cres).astype(np.float32)                            # FIX 2: was 0.06 → −24…−9 dB under the mix, inaudible
y += np.stack([sh, sh])
# crescendo of the whole mix and a breath of silence before the drop
y *= (0.78 + 0.22 * cosr((t - OB(36)) / (OB(40) - OB(36)))) ** (1.0 * ((t > OB(36)) & (t < OB(40))))
# v4: a noise riser sweeping 300 Hz → 9 kHz over the last two bars, rotating with the build, cut on the drop
E['riser'] = (OB(38), OB(40))
a, b = E['riser']; i0, i1 = int(a * SR), int(b * SR)
rng_r = np.random.default_rng(7); nz = rng_r.standard_normal(i1 - i0).astype(np.float32)
Zr = librosa.stft(nz, n_fft=2048, hop_length=512); fr_ = librosa.fft_frequencies(sr=SR, n_fft=2048)
for j in range(Zr.shape[1]):
    u = j / max(Zr.shape[1] - 1, 1); fc = np.exp(np.log(300) + (np.log(9000) - np.log(300)) * u ** 1.4)
    Zr[:, j] *= np.exp(-0.5 * (np.log2(np.maximum(fr_, 1) / fc) / 0.7) ** 2)
nz = librosa.istft(Zr, hop_length=512, length=i1 - i0)
uu = np.linspace(0, 1, i1 - i0); nz *= (uu ** 2.2) / (np.sqrt((nz ** 2).mean()) + 1e-9)
rl = np.sqrt((y[:, i1 - int(BAR * SR):i1] ** 2).mean())
nz *= np.clip((b - 0.06 - (a + np.arange(i1 - i0) / SR)) / 0.12, 0, 1)   # gone 60 ms before the hit
y[:, i0:i1] += (np.stack([nz, nz]) * rl * 10 ** (-18 / 20)).astype(np.float32)

kd_ = cosr((t - (OB(40) - BEAT * 0.75)) / (BEAT * 0.6)) * (t < OB(40) - 0.004)   # −4.5 dB suck, groove keeps playing
y *= (1 - 0.4 * kd_).astype(np.float32)
# ------------------------------------------------------------ the drop: wider stereo for two bars
E['wide'] = (OB(40), OB(42))
k = win(*E['wide'], fi=0.03, fo=BAR)
md = 0.5 * (y[0] + y[1]); sd = 0.5 * (y[0] - y[1])
y = np.stack([md + sd * (1 + 0.5 * k), md - sd * (1 + 0.5 * k)])

# ------------------------------------------------------------ tuned sines: root, octave, fifth, clash
def note(f, a, b, level=0.07, att=0.25, rel=0.6):
    env = (np.clip((t - a) / att, 0, 1) * np.clip((b - t) / rel, 0, 1)) ** 1.5
    # FIX 8: a few harmonics (soft organ), so the octave/fifth "lock" and the semitone's roughness are audible on earbuds
    w = sum(h * np.sin(2 * np.pi * f * n * t) for n, h in [(1, 1), (2, 0.45), (3, 0.3), (4, 0.15)])
    return (level * env * w).astype(np.float32)
E['root'] = (OB(43), OB(50)); E['oct'] = (OB(45), OB(47)); E['fifth'] = (OB(47), OB(50)); E['clash'] = (OB(51), OB(52) + BEAT)
OCT_IN = OB(44)                                                   # FIX 8: octave enters ON 再加一个高八度—— (89.18)
# v4 (owner: "constant buzz"): struck e-piano notes on beats 1 and 3 that ring and fade, instead of held organ drones.
# Each strike still rings long enough (τ ≈ 1.1 s) to hear the octave/fifth lock and the semitone's sour beating.
def strike(f, at, level, tau=1.1):
    i0 = int(at * SR); n = int(min(4 * tau, 4.5) * SR); tt = np.arange(n) / SR
    w = np.zeros(n)
    for m, h in [(1, 1.0), (2, 0.42), (3, 0.16), (4, 0.10), (5.02, 0.05)]:
        w += h * np.exp(-tt / (tau / m ** 0.6)) * np.sin(2 * np.pi * f * m * tt)
    w += 0.18 * np.exp(-tt / 0.06) * np.sin(2 * np.pi * f * 7.0 * tt)          # the tine's "ding"
    w *= np.minimum(1, tt / 0.004)
    i1 = min(N, i0 + n); pad[i0:i1] += (level * w[:i1 - i0]).astype(np.float32)
pad = np.zeros(N, np.float32)
def strikes(f, a, b, level, every=2):                              # on beats 1 and 3 of the (unwarped) bars 43–53
    k = int(np.ceil((a - 0.05 - OB(43)) / BEAT))
    while OB(43) + k * BEAT < b - 0.3:
        if k % every == 0: strike(f, OB(43) + k * BEAT, level)
        k += 1
strikes(ROOT, OB(43), OB(50), 0.16)
strikes(2 * ROOT, OCT_IN, E['oct'][1], 0.11)
strikes(1.5 * ROOT, *E['fifth'], 0.12)
strikes(ROOT, E['clash'][0], E['clash'][1] + BEAT, 0.16)
strikes(ROOT * 2 ** (1 / 12), E['clash'][0], E['clash'][1] + BEAT, 0.15)
kd = win(OB(43) - 0.3, OB(52) + BEAT + 0.6, BEAT, BAR)            # duck the song under the demo notes
y *= (1 - 0.40 * kd).astype(np.float32)
y += np.stack([pad, pad])

# ------------------------------------------------------------ MASTERCLASS 1: reverse-reverb "inhale" into the drop
# one beat of the drop's own first hit, smeared by a 1.2 s decaying-noise reverb, played backwards so it swells
# INTO OB(40): anticipation without a stop (the owner rejected the silent gap)
i40 = int(OB(40) * SR); seg = y[:, i40:i40 + int(1.2 * SR)].astype(np.float64)
rng_ = np.random.default_rng(40); n = int(1.2 * SR)
ir = rng_.standard_normal((2, n)) * np.exp(-np.arange(n) / (0.32 * SR)); ir /= np.sqrt((ir ** 2).sum(1, keepdims=True))
from scipy.signal import fftconvolve
wet = np.stack([fftconvolve(seg[c], ir[c])[:n] for c in range(2)])[:, ::-1]
L1 = int(BEAT * 1.5 * SR); wet = wet[:, -L1:] * np.linspace(0, 1, L1) ** 2
env = np.convolve(np.abs(wet).sum(0), np.ones(441) / 441, 'same')     # music review r2: peak 12 ms before the hit
sh = L1 - 1 - int(0.07 * SR) - int(np.argmax(env))
wet = np.roll(wet, sh, axis=1); wet[:, :max(sh, 0)] = 0
wet = sosfilt(butter(2, 250, 'high', fs=SR, output='sos'), wet, axis=1)
wet *= 10 ** (-14 / 20) * np.sqrt((y[:, i40 - L1:i40] ** 2).mean()) / max(np.sqrt((wet ** 2).mean()), 1e-9)
y[:, i40 - L1:i40] += wet.astype(np.float32)
E['inhale'] = (OB(40) - BEAT * 1.5, OB(40))


# =====================================================================================================================
# v4 ASSEMBLY — 若如初见 (the remix, same key; stems split with UVR MDX-Net Voc_FT, tuned −34 cents to this track)
#   0 … Pd      remix opening under the headphones card, its vocal circling the head (one turn per two bars)
#   Pd          the song's first downbeat lands on the remix's third downbeat; remix vocal echoes out over it
#   W           the slowed song melts into a reverb wash; the remix breakdown rises out of it, vocal turning slowly
#   RD          the remix drop (inhale before it) carries the recap, one bar each
#   splice      the same point five phrases later, into the remix's own decaying outro; the vocal echoes away
# =====================================================================================================================
yb = y; NB = yb.shape[1]
RI = librosa.load('remix_inst_tuned.wav', sr=SR, mono=False)[0].astype(np.float32)
RV = librosa.load('remix_voc_tuned.wav', sr=SR, mono=False)[0].astype(np.float32)
RM = RI + RV
RB = 6.9542 / 4                                                   # remix bar (138 bpm, dotted 3+3+2 groove)
RD = 76.579                                                       # remix drop: kick after the pre-drop gap (music review v5: 77.23 was 3 eighths late)
RS0, RS1 = RD - 4 * RB, RD + 7 * RB                               # breakdown … one full bar of drop … recap end
RT = 122.422 - 0.651 + RB                                         # RS1 five phrases later (chroma + onset match)
oe_ = librosa.onset.onset_strength(y=RM.mean(0)[: int(0.4 * SR)], sr=SR, hop_length=64)
R0 = float(np.argmax(oe_) * 64 / SR)                              # the remix's first downbeat
Pd = R0 + 2 * RB; P = Pd - B0                                     # bgm time 0 sits at output P
# level match: remix drop = song drop + 0.5 dB
meter = pyln.Meter(SR)
Lb = meter.integrated_loudness(yb[:, int(OB(40) * SR):int(OB(44) * SR)].T)
Lr = meter.integrated_loudness(RM[:, int(RD * SR):int((RD + 6 * RB) * SR)].T)
gR = 10 ** ((Lb - Lr - 0.5) / 20); RI *= gR; RV *= gR; RM *= gR
def sec(z, a, b): return z[:, int(round(a * SR)):int(round(a * SR)) + int(round((b - a) * SR))]
def ramp(n, a, b, up=True):                                       # cosine ramp over samples a..b of an n-array
    u = np.clip((np.arange(n) - a) / max(b - a, 1), 0, 1); r_ = 0.5 - 0.5 * np.cos(np.pi * u)
    return (r_ if up else 1 - r_).astype(np.float32)
def rot2(m, theta, amount):                                       # rotate a mono source around the head
    global N, idx
    n0, i0_ = N, idx; N = len(m); idx = np.arange(N, dtype=np.float64)
    out = rotate(np.stack([m, m]), theta, amount); N, idx = n0, i0_
    return out
def echo_out(m, d, fb, reps, seed):                               # ping-pong delay throws, each darker, circling
    n = len(m) + int(d * SR * (reps + 1)); out = np.zeros((2, n), np.float32); cur = m.astype(np.float32)
    for r_ in range(1, reps + 1):
        cur = sosfilt(butter(1, max(5200 - 650 * r_, 1200), 'low', fs=SR, output='sos'), cur).astype(np.float32)
        o = int(d * SR * r_); g_ = fb ** r_; c = r_ % 2
        out[c, o:o + len(cur)] += cur * g_; out[1 - c, o:o + len(cur)] += cur * g_ * 0.35
    return out

tail_end = RS1 - RS0 + (138.9 - RT) + 3.0
Wo = P + W; TOT = Wo + tail_end
out = np.zeros((2, int(TOT * SR) + SR), np.float32)
def put(z, at):
    i = int(round(at * SR)); j = min(out.shape[1], i + z.shape[1]); out[:, i:j] += z[:, :j - i]

# --- 1. opening: remix under the card, vocal circling
n_op = int((Pd + 2.2) * SR); top = np.arange(n_op) / SR
oi = RI[:, :n_op].copy() * 0.65                                    # −2 dB so the circling voice leads
oi *= ramp(n_op, 0, int(0.02 * SR)) * ramp(n_op, int((Pd - 0.22) * SR), int((Pd + 0.04) * SR), up=False)
put(oi, 0)
put(reverb(sec(RI, Pd - RB * 0.5, Pd) * 0.8, 2.2, 3) * 0.32, Pd - RB * 0.5)   # the instrumental's tail rings over the weld
ov = RV.mean(0)[:n_op] * 1.8
th = 2 * np.pi * np.clip(top - 0.15, 0, None) / (2 * RB)          # front → right → behind → left → front, every two bars
vk = np.clip(top / 0.6, 0, 1) * 0.95
vg = ramp(n_op, int((Pd + 0.2) * SR), int((Pd + 1.9) * SR), up=False)  # sings on over the song's first bar, fading
put(rot2(ov * vg, th, vk), 0)
ov_ = ov[int((Pd - 0.9) * SR):int((Pd + 0.4) * SR)]
put(echo_out(ov_ * ramp(len(ov_), 0, int(0.1 * SR)), 1.5 * BEAT, 0.45, 5, 1) * 0.45, Pd - 0.9)
E['card'] = (0.0, Pd); E['weld_in'] = (Pd,)

# --- 2. the song (its time 0 at P), ending in a reverb wash at W
ybs = yb[:, :int((W + 0.9) * SR)].copy()
nb = ybs.shape[1]; ybs *= ramp(nb, int((W - 0.05) * SR), int((W + 0.85) * SR), up=False)
put(ybs, P)
put(reverb(sec(yb, W - BAR * 1.12, W), 3.4, 64) * 0.4, P + W - BAR * 1.12)
E['wash'] = (Wo, Wo + 3.0)

# --- 3. remix breakdown → drop → recap (one bar each) ; local time u = 0 at Wo (= remix RS0)
n1 = int(round((RS1 - RS0 + 0.03) * SR)); u = np.arange(n1) / SR
si = sec(RI, RS0, RS1 + 0.03)[:, :n1].copy(); sv = sec(RV, RS0, RS1 + 0.03)[:, :n1].copy()
ud = RD - RS0
thv = 2 * np.pi * u / (4 * RB)                                    # one slow turn across the breakdown, front at the drop
kv = np.clip(u / 1.0, 0, 1) * np.clip((ud - u) / 0.6, 0, 1) * 0.9
sv = rot2(sv.mean(0) * 1.6, thv, kv) * (kv > 0)[None] + sv * (1 - kv)[None]
seg = si + sv
seg *= ramp(n1, 0, int(0.9 * SR))                                 # rises out of the wash
# inhale into the drop: the drop's first beat, reverbed and reversed
i_d = int(ud * SR); hit = seg[:, i_d:i_d + int(1.2 * SR)]
wet = reverb(hit, 1.1, 77, hit.shape[1])[:, ::-1]
L1 = int(2 * 0.4346 * SR); wet = wet[:, -L1:] * np.linspace(0, 1, L1) ** 2
wet *= 10 ** (-7 / 20) * np.sqrt((seg[:, i_d - L1:i_d] ** 2).mean()) / max(np.sqrt((wet ** 2).mean()), 1e-9)
seg[:, i_d - L1 - int(0.012 * SR):i_d - int(0.012 * SR)] += wet
# recap
def wl(a, b, fi=0.03, fo=0.03): return (np.clip((u - a) / fi, 0, 1) * np.clip((b - u) / fo, 0, 1))[None].astype(np.float32)
rc = [ud + (k + 1) * RB for k in range(7)]                     # the drop's first bar plays whole
lp_ = sosfilt(butter(6, 220, 'low', fs=SR, output='sos'), seg, axis=1).astype(np.float32) * 1.15
hp_ = sosfilt(butter(6, 3000, 'high', fs=SR, output='sos'), seg, axis=1).astype(np.float32) * 1.3
k = wl(rc[0], rc[1]); seg = seg * (1 - k) + lp_ * k
k = wl(rc[1], rc[2]); seg = seg * (1 - k) + hp_ * k
sdr = 0.5 * (seg[0] - seg[1]); k = wl(rc[2], rc[3]); seg = seg * (1 - k) + np.stack([sdr, np.imag(hilbert(sdr)).astype(np.float32)]) * 1.8 * k
k = wl(rc[3], rc[4]); m_ = seg.mean(0); sw = np.sign(np.sin(np.pi * (u - rc[3]) / (0.4346 / 2))); sw = np.convolve(sw, np.ones(300) / 300, 'same')
seg = seg * (1 - k) + np.stack([m_ * (1 - 0.85 * np.clip(sw, 0, 1)), m_ * (1 - 0.85 * np.clip(-sw, 0, 1))]) * 1.15 * k
k = wl(rc[4], rc[6], 0.05, 0.4)[0]; seg = rot2(seg.mean(0), 2 * np.pi * (u - rc[4]) / (2 * RB), k * 0.95) * k + seg * (1 - k)
seg *= ramp(n1, n1 - int(0.03 * SR), n1, up=False)
put(seg, Wo)
E['breakdown'] = (Wo, Wo + ud); E['rdrop'] = (Wo + ud,); E['rinhale'] = (Wo + ud - L1 / SR, Wo + ud)
E['recap'] = [Wo + x for x in rc]
E['vrot'] = (Wo, Wo + ud)

# --- 4. splice into the remix's own dying outro; the vocal echoes away around the head
Sp = Wo + (RS1 - RS0)
a_ = sec(RM, RS1 - 0.02, RS1 + 0.02).mean(0); best, bo = -1e9, 0
for off in range(-int(0.012 * SR), int(0.012 * SR), 4):            # fine-align the target by waveform correlation
    b_ = sec(RM, RT + off / SR - 0.02, RT + off / SR + 0.02).mean(0)[:len(a_)]
    c_ = float((a_ * b_).sum()); best, bo = (c_, off) if c_ > best else (best, bo)
RT2 = RT + bo / SR
n2 = int((138.9 - RT2) * SR); tl = sec(RM, RT2, 138.9)[:, :n2].copy(); v2 = np.arange(n2) / SR
tl *= ramp(n2, 0, int(0.03 * SR))
# music review v5: only ever darker from the splice; the top closes and the kick thins out — it falls apart
Zt = np.stack([librosa.stft(tl[c], n_fft=4096, hop_length=1024) for c in range(2)])
ft = librosa.fft_frequencies(sr=SR, n_fft=4096); uq = np.linspace(0, 1, Zt.shape[2])
fc_lp = np.exp(np.log(3500) + (np.log(450) - np.log(3500)) * uq ** 0.8)
fc_hp = 20 + 230 * np.clip((uq - 0.45) / 0.55, 0, 1) ** 1.5
Gt = (1 / np.sqrt(1 + (ft[:, None] / fc_lp[None]) ** 4)) / np.sqrt(1 + (fc_hp[None] / np.maximum(ft[:, None], 1)) ** 4)
tl = np.stack([librosa.istft(Zt[c] * Gt, hop_length=1024, length=n2) for c in range(2)]).astype(np.float32)
tl *= (0.45 + 0.55 * np.clip(np.arange(n2) / SR / (2 * RB), 0, 1)).astype(np.float32)   # the fill bar must not lift above the recap
# as it dies, it drifts around the head
desc = 126.4 - RT2
amt = np.clip((v2 - desc) / 4.0, 0, 1) * 0.6
tl = rot2(tl.mean(0), 2 * np.pi * (v2 - desc) / (4 * RB), amt) * amt[None] + tl * (1 - amt)[None]
tl *= ramp(n2, n2 - int(1.6 * SR), n2, up=False)
put(tl, Sp)
put(reverb(tl[:, -int(6 * SR):], 4.2, 139) * 0.7, Sp + (n2 / SR) - 6)   # the last breath rings out
# bookend: the syllable that circled the head at 0:00 circles once more, dark, into the reverb
bk = RV.mean(0)[int(0.1 * SR):int(1.45 * SR)] * 1.6
bk = sosfilt(butter(2, 1000, 'low', fs=SR, output='sos'), bk).astype(np.float32); bk *= ramp(len(bk), len(bk) - int(0.2 * SR), len(bk), up=False)
tb_ = np.arange(len(bk)) / SR; bro = rot2(bk, 2 * np.pi * tb_ / 2.6, np.full(len(bk), 0.95))
put(bro * 0.5, Sp + n2 / SR - 4.2); put(reverb(bro, 3.2, 6) * 0.35, Sp + n2 / SR - 4.2)
E['bookend'] = (Sp + n2 / SR - 4.2,)
vv = sec(RV, RS1 - 2 * 0.4346, RS1 + 0.05).mean(0); vv = vv * ramp(len(vv), 0, int(0.05 * SR))
put(echo_out(vv, 3 * 0.4346 / 2, 0.55, 7, 2) * 0.9, RS1 - 2 * 0.4346 - RS0 + Wo)
E['splice'] = (Sp,); E['outro_desc'] = (Sp + desc,)
END_T = Sp + n2 / SR + 2.6
y = out[:, :int(END_T * SR)]

# ------------------------------------------------------------ loudness: −14 LUFS, true-peak limiter at −2.1 dBTP
y = y * 10 ** ((-13.8 - pyln.Meter(SR).integrated_loudness(y.T)) / 20)
pk = np.abs(resample_poly(y, 4, 1, axis=1)).max(0).reshape(-1, 4).max(1)[:y.shape[1]]
g = np.minimum(1.0, 10 ** (-2.1 / 20) / np.maximum(pk, 1e-9))
LA = int(0.004 * SR); g = minimum_filter1d(g, 2 * LA + 1)
gd = g[::44].copy(); rel = np.exp(-1 / 80.0)
for i in range(1, len(gd)): gd[i] = min(gd[i], rel * gd[i - 1] + (1 - rel) * gd[i])
g = np.minimum(g, np.interp(np.arange(len(g)), np.arange(len(gd)) * 44, gd))
g = uniform_filter1d(g, LA, mode='nearest')
y = (y * g).astype(np.float32)
print('limiter max gain reduction %.1f dB' % (-20 * np.log10(g.min())))
print('limiter > 3 dB at (s):', sorted(set(np.round(np.where(g < 10 ** (-3 / 20))[0] / SR, 1).tolist()))[:40])
sf.write(sys.argv[1], y.T, SR, subtype='PCM_24')

# ------------------------------------------------------------ timing for the picture (all in final output time)
SKIP = {'card', 'weld_in', 'wash', 'breakdown', 'rdrop', 'rinhale', 'recap', 'vrot', 'splice', 'outro_desc', 'bookend'}
T = {}
for k_, v_ in E.items():
    vals = v_ if isinstance(v_, (list, tuple)) else [v_]
    T[k_] = [round(x + (0 if k_ in SKIP else P), 4) for x in vals]
bars = {str(k_): round(OB(k_) + P, 4) for k_ in range(0, 65)}
bars['-2'] = round(R0, 4); bars['-1'] = round(R0 + RB, 4)
for j in range(0, 12): bars[str(100 + j)] = round(Wo + j * RB, 4)
nj = int((END_T - Sp) / RB) + 2
for j in range(1, nj): bars[str(111 + j)] = round(Sp + j * RB, 4)
T['bars'] = bars; T['drop'] = [round(OB(40) + P, 4)]; T['end'] = [round(y.shape[1] / SR, 4)]
T['P'] = [round(P, 4)]; T['W'] = [round(Wo, 4)]
json.dump(T, open(sys.argv[2], 'w'), indent=1)
print('P', round(P, 3), 'Pd', round(Pd, 3), 'drop', round(OB(40) + P, 2), 'weld', round(Wo, 2), 'rdrop', round(Wo + ud, 2),
      'splice', round(Sp, 2), 'end', round(y.shape[1] / SR, 2), 'gR dB', round(20 * np.log10(gR), 1), 'RT2', round(RT2, 4))
