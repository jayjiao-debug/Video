"""ep29 声音 — the soundtrack: the owner's slowed track, with every sound-physics demo done ON the music.

Every effect is a normal, musical DJ move, lasts 1–2 bars, starts/ends on the beat grid and fades in/out smoothly:
  1. varispeed: speed up ×1.26 (+4 semitones, a major third, so it stays in harmony), then back  (intro)
  2. only-bass (low-pass) for 2 bars, only-treble (high-pass) for 2 bars                         (what Hz is)
  3. age: the highs slowly disappear, then come back                                             (hearing range)
  4. 360°: the mix circles around the listener's head (ITD 0.6 ms + level difference + head shadow) (localisation)
  5. soft sine notes tuned to the track: root ~363 Hz, its octave (2:1), its fifth (3:2), then one bar of a
     semitone clash, then resolved                                                                 (why it sounds good)
  6. tape-stop on the last bar                                                                     (ending)
usage: python3 process.py out.wav  → also writes timing.json (bar grid on the OUTPUT timeline)
"""
import json, sys
import numpy as np, soundfile as sf, librosa
from scipy.signal import resample_poly, butter, sosfilt

SR = 44100
x, sr = librosa.load('bgm.mp3', sr=SR, mono=False)          # (2, n)
x = x.astype(np.float64)
BEAT = 0.5108390; BAR = 4 * BEAT; B0 = 0.418               # downbeat of bar 0 in the source
FIFTH_ROOT = 363.4                                           # measured main pitch of this (slowed, detuned) track

def cosr(u):                                                 # 0→1 smooth
    u = np.clip(u, 0, 1); return 0.5 - 0.5 * np.cos(np.pi * u)

# ---------------------------------------------------------------- 1. varispeed intro (output time → source time)
UP0, UP1, DN0, DN1, FAST = 4.45, 4.95, 8.40, 9.40, 2 ** (4 / 12)
def speed(t):
    s = np.ones_like(t)
    s += (FAST - 1) * cosr((t - UP0) / (UP1 - UP0)) * (t < DN0)
    s += (FAST - 1) * (1 - cosr((t - DN0) / (DN1 - DN0))) * (t >= DN0)
    return s
T_WARP = 12.0
tw = np.arange(int(T_WARP * SR)) / SR
tau = np.concatenate([[0], np.cumsum(speed(tw[:-1])) / SR])
DELTA = tau[-1] + 1 / SR - T_WARP                             # how far ahead the source is after the warp
UP = 4
seg = x[:, : int((tau[-1] + 0.1) * SR)]
hi = resample_poly(seg, UP, 1, axis=1)
warped = np.stack([np.interp(tau * SR * UP, np.arange(hi.shape[1]), hi[c]) for c in range(2)])
rest = x[:, int(round((T_WARP + DELTA) * SR)):]
y = np.concatenate([warped, rest], axis=1)
N = y.shape[1]; t = np.arange(N) / SR
def bar(k): return B0 + BAR * k - DELTA                      # output time of source bar k (k ≥ 5)

# ---------------------------------------------------------------- 2/3. time-varying EQ in the STFT domain
NFFT, HOP = 4096, 1024
F = librosa.fft_frequencies(sr=SR, n_fft=NFFT)
LP_A, LP_B = bar(13), bar(15)          # only the bass
HP_A, HP_B = bar(15), bar(17)          # only the treble
AGE_A, AGE_B, AGE_C = bar(28) + 2 * BEAT + 1.1, bar(31), bar(32)   # highs fade out … come back on the bar
def gains(tf):
    g = np.ones_like(F)
    ramp = BEAT
    # low-pass to ~220 Hz
    k = cosr((tf - LP_A) / ramp) * (1 - cosr((tf - LP_B + ramp * 0.5) / (ramp * 0.5)))
    if k > 0:
        fc = np.exp(np.log(20000) + (np.log(220) - np.log(20000)) * k)
        g *= 1 / np.sqrt(1 + (F / fc) ** 8) * (1 - 0.15 * k)
    # high-pass from ~3 kHz
    k = cosr((tf - HP_A) / (ramp * 0.5)) * (1 - cosr((tf - HP_B + ramp * 0.5) / (ramp * 0.5)))
    if k > 0:
        fc = np.exp(np.log(20) + (np.log(3000) - np.log(20)) * k)
        g *= 1 / np.sqrt(1 + (fc / np.maximum(F, 1)) ** 8) * (1 + 1.3 * k)
    # age: the top slowly closes from 18 kHz to 2.5 kHz, then opens on the bar
    k = cosr((tf - AGE_A) / (AGE_B - AGE_A)) * (1 - cosr((tf - AGE_C + 0.25) / 0.25))
    if k > 0:
        fc = np.exp(np.log(18000) + (np.log(2500) - np.log(18000)) * k)
        g *= 1 / np.sqrt(1 + (F / fc) ** 6)
    return g
Y = np.stack([librosa.stft(y[c], n_fft=NFFT, hop_length=HOP) for c in range(2)])
tfr = librosa.frames_to_time(np.arange(Y.shape[2]), sr=SR, hop_length=HOP)
G = np.stack([gains(tf) for tf in tfr], axis=1)
y = np.stack([librosa.istft(Y[c] * G, hop_length=HOP, length=N) for c in range(2)])

# ---------------------------------------------------------------- 4. 360°: the music circles the head
ROT_A, ROT_B = bar(33), bar(40)                              # starts on a bar, lands in front exactly on the drop
u = np.clip((t - ROT_A) / (ROT_B - ROT_A), 0, 1)
turns = 3.0
theta = 2 * np.pi * turns * (u ** 1.6)                       # slow at first, faster towards the drop, ends at 0 (front)
wet = cosr((t - ROT_A) / BAR) * (1 - cosr((t - (ROT_B - BEAT)) / BEAT))
if wet.max() > 0:
    m = 0.5 * (y[0] + y[1])
    side = np.sin(theta)                                     # +1 = right, -1 = left
    back = np.clip(-np.cos(theta), 0, 1)
    itd = 0.0006 * side                                      # seconds; right leads when side>0
    idx = np.arange(N)
    def delayed(sig, d):                                      # fractional delay, d ≥ 0 seconds
        return np.interp(idx - d * SR, idx, sig, left=0)
    sos = butter(2, 1800, 'low', fs=SR, output='sos')
    mlow = sosfilt(sos, m)
    farL = np.clip(side, 0, 1); farR = np.clip(-side, 0, 1)  # how much each ear is in the head's shadow
    L = delayed(m, np.clip(itd, 0, None)) * (1 - farL) + delayed(mlow, np.clip(itd, 0, None)) * farL
    R = delayed(m, np.clip(-itd, 0, None)) * (1 - farR) + delayed(mlow, np.clip(-itd, 0, None)) * farR
    L *= 1 - 0.45 * farL; R *= 1 - 0.45 * farR
    dull = sosfilt(butter(1, 5000, 'low', fs=SR, output='sos'), np.stack([L, R]), axis=1)
    bin_ = np.stack([L, R]) * (1 - 0.5 * back) + dull * (0.5 * back)
    bin_ *= 1.25                                             # keep the loudness of the mono fold-down
    y = y * (1 - 0.8 * wet) + bin_ * (0.8 * wet)

# ---------------------------------------------------------------- 5. tuned sine notes over the track
def note(f, a, b, level=0.07, att=0.25, rel=0.6):
    env = np.clip((t - a) / att, 0, 1) * np.clip((b - t) / rel, 0, 1)
    env = env ** 1.5
    tone = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)   # a soft, slightly warm tone
    return level * env * tone
R0 = FIFTH_ROOT
H_ROOT = (bar(43), bar(50))                                  # root alone, then with partners
H_OCT = (bar(45), bar(47))                                   # + octave 2:1
H_FIF = (bar(47), bar(50))                                   # + fifth 3:2
H_CLASH = (bar(51), bar(52) + BEAT)                          # root + a semitone above: the beating, "sour"
pad = note(R0, *H_ROOT) + note(2 * R0, *H_OCT, level=0.05) + note(1.5 * R0, *H_FIF, level=0.055)
pad += note(R0, *H_CLASH) + note(R0 * 2 ** (1 / 12), H_CLASH[0] + BEAT, H_CLASH[1], level=0.055)
y = y + np.stack([pad, pad])

# ---------------------------------------------------------------- 6. tape-stop on the last bar
END = bar(80)
TS0 = END - 1.6
if TS0 < N / SR:
    i0 = int(TS0 * SR)
    tt = np.arange(int(1.6 * SR)) / SR
    sp = (1 - tt / 1.6) ** 1.6                               # slows to a stop
    src = TS0 + np.cumsum(sp) / SR
    tail = np.stack([np.interp(src * SR, np.arange(N), y[c]) for c in range(2)])
    tail *= np.clip((1.6 - tt) / 0.5, 0, 1)
    y = np.concatenate([y[:, :i0], tail], axis=1)

peak = np.abs(y).max()
y = y / max(peak, 1e-9) * 0.95
sf.write(sys.argv[1], y.T.astype(np.float32), SR)
json.dump({'delta': DELTA, 'bar0': B0 - DELTA, 'bar': BAR, 'beat': BEAT, 'end': y.shape[1] / SR,
           'lp': [LP_A, LP_B], 'hp': [HP_A, HP_B], 'age': [AGE_A, AGE_B, AGE_C], 'rot': [ROT_A, ROT_B],
           'root': H_ROOT, 'oct': H_OCT, 'fifth': H_FIF, 'clash': H_CLASH, 'drop': bar(40), 'tapestop': TS0,
           'bars': {k: round(bar(k), 3) for k in range(5, 81)}}, open('timing.json', 'w'), indent=1)
print('delta', round(DELTA, 3), 'drop', round(bar(40), 3), 'end', round(y.shape[1] / SR, 2))
