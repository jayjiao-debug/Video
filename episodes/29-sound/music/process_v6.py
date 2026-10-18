"""ep29 v7 (owner 2026-10-18: "remove the remix parts") — THE SONG ONLY. Same film clock as v5/v6 up to W.
  0 … Pd   the song's own intro (bars 2¼–3) circles the head under the headphones card, loops into bar 0 at Pd
  W        after the slowed bar 63 the song skips to bar 68 (bar 64 ≈ bar 68), still slowed, and spins back up to
           normal speed across bar 68 → its own drop at bar 72 (rdrop) → recap on bars 73–78, one bar each
  SPL      bar 79 ends the song; it loops back to its intro (单曲循环) and falls apart: darker, thinner, circling, fading
usage (inside music/): python3 process_v6.py out.wav timing.json

ep29 v2 — non-stop effects on the owner's slowed track, chained into combos, built for chills.

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
from scipy.signal import resample_poly, butter, sosfilt, sosfiltfilt, hilbert
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
    if OB(38) < tf < OB(40):                                       # QA v5: phones — the last two bars give up 3 dB of mids
        k = float(cosr((tf - OB(38)) / BAR)); g *= 1 - k * 0.3 * ((F > 300) & (F < 4000))
    if OB(40) - BEAT < tf < OB(40):                                # music review v5: empty the bass over the last beat (zero-phase)
        kb = float(cosr((tf - (OB(40) - BEAT)) / (0.6 * BEAT))); g *= (1 - kb) + kb * hpg(200)
    a, b = E['slow']                                              # music review v5: +2 dB presence in the sad part (phones)
    k = w(a, b + 0.5, fi=BAR, fo=0.6); g *= 1 + k * 0.26 * ((F > 300) & (F < 3000))
    k = w(*E['bright'], fi=0.05, fo=BAR)                          # the drop: a brighter top (+3 dB above 5 kHz)
    g *= 1 + k * 0.41 * (F > 5000) * np.clip((F - 5000) / 3000, 0, 1)
    g *= 1 + k * 0.33 * ((F > 300) & (F < 4000))                 # QA v5: the title must also slam on a phone
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
E['rot_slow'] = (OB(56), W + 30.0)                              # v7: keeps turning into part B (faded there)
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
# v7 ASSEMBLY — the song only
# =====================================================================================================================
yb = y
Pd = 3.5772; P = Pd - B0                                          # the film clock of v5/v6 (the picture is built on it)
RBc = 6.9542 / 4                                                  # card rotation: one turn per 2·RBc (same formula as the picture)
def secx(a, b): return x[:, int(round(a * SR)):int(round(b * SR))].copy()
def rot2(m, theta, amount):                                       # rotate a mono source around the head (any length)
    global N, idx
    n0, i0_ = N, idx; N = len(m); idx = np.arange(N, dtype=np.float64)
    out_ = rotate(np.stack([m, m]), theta, amount); N, idx = n0, i0_
    return out_
def ramp(n, a, b, up=True):                                       # cosine ramp over samples a..b of an n-array
    u = np.clip((np.arange(n) - a) / max(b - a, 1), 0, 1); r_ = 0.5 - 0.5 * np.cos(np.pi * u)
    return (r_ if up else 1 - r_).astype(np.float32)
def band(z, lo, hi, order=2):
    return sosfiltfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), z, axis=-1).astype(np.float32)

# --- part B: source from just before bar 68, slowed like the sad part, spinning back up to normal across bar 68
D0 = S(68) - 0.3
tauB = D0 + np.arange(x.shape[1] - int(D0 * SR)) / SR
spB = down + (1 - down) * cosr((tauB - S(68)) / BAR)
tB = np.concatenate([[0], np.cumsum(1 / spB[:-1]) / SR]); tB += W - float(np.interp(S(68), tauB, tB))   # S(68) → W
def OBB(k): return float(np.interp(S(k), tauB, tB))               # source bar k (68…80) → song output time
nBo = int((tB[-1] - tB[0]) * SR); toB = tB[0] + np.arange(nBo) / SR
tau_o = np.interp(toB, tB, tauB)
xb = x[:, int(D0 * SR) - 64:]; hiB = resample_poly(xb, UP, 1, axis=1); posB = (tau_o * SR - (int(D0 * SR) - 64)) * UP
yB = np.stack([np.interp(posB, np.arange(hiB.shape[1]), hiB[c]) for c in range(2)]).astype(np.float32); del hiB
RDo = OBB(72); R = [OBB(73 + j) for j in range(7)]; SPL = R[6]
L4 = SPL + 4.5 * BAR; OUTRO = L4 + 2.75; END_S = OUTRO + 7.0      # song-time; the picture derives the same from RB = BAR
print('v7: W %.2f  drop %.2f  recap %.2f  splice %.2f  outro %.2f  end %.2f (song clock)' % (W, RDo, R[0], SPL, OUTRO, END_S))
# (1) the sad part's +2 dB presence fades out as in part A
kp = 1 - cosr((toB - (W - 0.1)) / 0.6); yB += band(yB, 300, 3000) * (0.26 * kp).astype(np.float32)[None]
# (2) the slow circling goes on through the spin-up, back to the front for the drop
thB = 2 * np.pi * (toB - OB(56)) / (4 * BAR)
amB = 0.8 * (1 - cosr((toB - (RDo - BAR - 0.2)) / BAR))
def rotS(z, theta, amount):                                       # rotate() on a stereo buffer of any length
    global N, idx
    n0, i0_ = N, idx; N = z.shape[1]; idx = np.arange(N, dtype=np.float64)
    o_ = rotate(z, theta, amount); N, idx = n0, i0_
    return o_.astype(np.float32)
yB = rotS(yB, thB, amB)
# (3) the drop: brighter, fuller mids, wider, for two bars (like the title drop)
kd = (cosr((toB - RDo) / 0.05) * (1 - cosr((toB - (RDo + BAR)) / BAR))).astype(np.float32)[None]
hi5 = sosfiltfilt(butter(2, 5000, 'high', fs=SR, output='sos'), yB, axis=1).astype(np.float32)
yB += hi5 * 0.41 * kd + band(yB, 300, 4000) * 0.30 * kd
md_ = 0.5 * (yB[0] + yB[1]); sd_ = 0.5 * (yB[0] - yB[1]) * (1 + 0.5 * kd[0]); yB = np.stack([md_ + sd_, md_ - sd_])
# (4) inhale into the drop: its first beat, reverbed and reversed
iD = int((RDo - toB[0]) * SR); hit = yB[:, iD:iD + int(1.2 * SR)]
wet = reverb(hit, 1.1, 77, hit.shape[1])[:, ::-1]
L1 = int(1.5 * BEAT * SR); wet = wet[:, -L1:] * np.linspace(0, 1, L1) ** 2
wet = sosfilt(butter(2, 250, 'high', fs=SR, output='sos'), wet, axis=1)
wet *= 10 ** (-13 / 20) * np.sqrt((yB[:, iD - L1:iD] ** 2).mean()) / max(np.sqrt((wet ** 2).mean()), 1e-9)
yB[:, iD - L1 - int(0.012 * SR):iD - int(0.012 * SR)] += wet.astype(np.float32)
# (5) recap, one bar each: bass / treble / no middle / left-right / around you
def wl(a, b, fi=0.03, fo=0.03): return (np.clip((toB - a) / fi, 0, 1) * np.clip((b - toB) / fo, 0, 1))[None].astype(np.float32)
lp_ = sosfilt(butter(6, 220, 'low', fs=SR, output='sos'), yB, axis=1).astype(np.float32) * 1.25
hp_ = sosfilt(butter(6, 3000, 'high', fs=SR, output='sos'), yB, axis=1).astype(np.float32) * 1.4
k = wl(R[0], R[1]); yB = yB * (1 - k) + lp_ * k
k = wl(R[1], R[2]); yB = yB * (1 - k) + hp_ * k
sdr = 0.5 * (yB[0] - yB[1]); k = wl(R[2], R[3]); yB = yB * (1 - k) + np.stack([sdr, np.imag(hilbert(sdr)).astype(np.float32)]) * 1.8 * k
k = wl(R[3], R[4]); m_ = yB.mean(0); sw = np.sign(np.sin(np.pi * (toB - R[3]) / (BEAT / 2))); sw = np.convolve(sw, np.ones(300) / 300, 'same')
yB = yB * (1 - k) + np.stack([m_ * (1 - 0.85 * np.clip(sw, 0, 1)), m_ * (1 - 0.85 * np.clip(-sw, 0, 1))]) * 1.15 * k
k = wl(R[4], R[6], 0.05, 0.4)[0]; yB = rot2(yB.mean(0), 2 * np.pi * (toB - R[4]) / (2 * BAR), k * 0.95) * k + yB * (1 - k)
del lp_, hp_, hi5

TOT = END_S + P + 1.0
out = np.zeros((2, int(TOT * SR)), np.float32)
def put(z, at):
    i = int(round(at * SR)); j = min(out.shape[1], i + z.shape[1]); out[:, i:j] += z[:, :j - i]

# --- 1. card: the song's bars 2¼–3, circling the head; at Pd it loops into bar 0 (bar 4 ≈ bar 0)
c0 = S(4) - Pd; card = secx(c0, S(4) + 0.01); nc = card.shape[1]; tc = np.arange(nc) / SR
thc = 2 * np.pi * np.clip(tc - 0.15, 0, None) / (2 * RBc)
amc = (np.clip(tc / 0.6, 0, 1) * 0.9 * (1 - cosr((tc - (Pd - 0.35)) / 0.33))).astype(np.float32)
rc_ = rot2(card.mean(0), thc, np.ones(nc)); card = card * (1 - amc)[None] + rc_ * amc[None]
card *= ramp(nc, 0, int(0.02 * SR)) * ramp(nc, int((Pd - 0.03) * SR), int(Pd * SR), up=False)
put(card, 0)
E['card'] = (0.0, Pd); E['weld_in'] = (Pd,)
# --- 2. the song from bar 0 (its time 0 at P) up to W; crossfade into part B 25 ms before W (bar 64 ≈ bar 68)
nA = int((W + 0.01) * SR); ya = yb[:, :nA].copy()
ya *= ramp(nA, int((B0 - 0.03) * SR), int(B0 * SR))               # its pickup is already in the card
ya *= ramp(nA, int((W - 0.035) * SR), int((W - 0.005) * SR), up=False)
put(ya, P)
iS = int((W - 0.035 - toB[0]) * SR); iE = int((S(80) + 0.6 - D0) / 1 * SR)   # part B from the crossfade to past the song's stop
nB = int((float(np.interp(S(80) + 0.6, tauB, tB)) - toB[0]) * SR)
yBp = yB[:, iS:nB].copy(); yBp *= ramp(yBp.shape[1], 0, int(0.03 * SR)) * ramp(yBp.shape[1], yBp.shape[1] - int(0.4 * SR), yBp.shape[1], up=False)
put(yBp, P + toB[0] + iS / SR)
# --- 3. coda: bar 79 ends the song; it loops back to its intro (bar 0 where bar 80 would be) and falls apart
C0 = OBB(80) - B0; nC = int((END_S - C0 + 0.5) * SR)
put(secx(0, nC / SR)[:, :nC] * ramp(nC, 0, int(0.02 * SR)), P + C0)
a_ = int((P + SPL) * SR); b_ = int((P + END_S) * SR); tl = out[:, a_:b_].copy(); n2 = tl.shape[1]; v2 = np.arange(n2) / SR; Dc = n2 / SR
Zt = np.stack([librosa.stft(tl[c], n_fft=4096, hop_length=1024) for c in range(2)])
ft = librosa.fft_frequencies(sr=SR, n_fft=4096); vq = librosa.frames_to_time(np.arange(Zt.shape[2]), sr=SR, hop_length=1024)
fc_lp = np.exp(np.interp(vq, [0, BAR, Dc], [np.log(16000), np.log(3500), np.log(450)]))
fc_hp = 20 + 230 * np.clip((vq / Dc - 0.45) / 0.55, 0, 1) ** 1.5
Gt = (1 / np.sqrt(1 + (ft[:, None] / fc_lp[None]) ** 4)) / np.sqrt(1 + (fc_hp[None] / np.maximum(ft[:, None], 1)) ** 4)
tl = np.stack([librosa.istft(Zt[c] * Gt, hop_length=1024, length=n2) for c in range(2)]).astype(np.float32); del Zt, Gt
gdb = np.interp(v2, [0, 0.5 * BAR, BAR, 0.55 * Dc, Dc - 1.2, Dc - 0.15], [0, -1, -5, -12, -30, -70])
tl *= (10 ** (gdb / 20)).astype(np.float32)[None]
amt = np.clip((v2 - BAR) / 4.0, 0, 1) * 0.6                        # as it dies, it drifts around the head
tl = rot2(tl.mean(0), 2 * np.pi * (v2 - BAR) / (4 * BAR), np.ones(n2)) * amt[None] + tl * (1 - amt)[None]
out[:, a_:b_] = tl; out[:, b_:] = 0
put(reverb(tl[:, int(BAR * SR):], 3.6, 139) * 0.22, P + SPL + BAR)    # it dissolves into the room
put(reverb(tl[:, -int(6 * SR):], 4.2, 140) * 0.5, P + END_S - 6)     # the last breath rings out
E['wash'] = (P + W, P + W + 3.0); E['breakdown'] = (P + W, P + RDo); E['vrot'] = (P + W, P + RDo)
E['rdrop'] = (P + RDo,); E['rinhale'] = (P + RDo - L1 / SR, P + RDo); E['recap'] = [P + v for v in R]
E['splice'] = (P + SPL,); E['outro_desc'] = (P + SPL + BAR,); E['bookend'] = (P + END_S - 4.2,)
E['rot_slow'] = (OB(56), RDo - 0.2)
END_T = P + END_S + 0.6
y = out[:, :int(END_T * SR)]
Wo = P + W

# ------------------------------------------------------------ loudness: −14 LUFS, true-peak limiter at −2.1 dBTP
y = y * 10 ** ((-13.8 - pyln.Meter(SR).integrated_loudness(y.T)) / 20)
pk = np.abs(resample_poly(y, 4, 1, axis=1)).max(0).reshape(-1, 4).max(1)[:y.shape[1]]
g = np.minimum(1.0, 10 ** (-2.6 / 20) / np.maximum(pk, 1e-9))
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
bars['-2'] = round(Pd - 2 * BAR, 4); bars['-1'] = round(Pd - BAR, 4)
for j in range(0, 13): bars[str(100 + j)] = round(OBB(68 + j) + P, 4)
nj = int((END_S - OBB(80)) / BAR) + 2
for j in range(1, nj): bars[str(112 + j)] = round(OBB(80) + j * BAR + P, 4)
T['bars'] = bars; T['drop'] = [round(OB(40) + P, 4)]; T['end'] = [round(y.shape[1] / SR, 4)]
T['P'] = [round(P, 4)]; T['W'] = [round(Wo, 4)]; T['RB'] = [round(BAR, 6)]
json.dump(T, open(sys.argv[2], 'w'), indent=1)
print('P', round(P, 3), 'end', round(y.shape[1] / SR, 2))
