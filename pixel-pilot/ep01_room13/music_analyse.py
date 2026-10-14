"""Beat grid, accents and sections of the BGM -> audio/music.json (times in original-track seconds)."""
import json, pathlib, sys
import numpy as np
import librosa

HERE = pathlib.Path(__file__).resolve().parent
SRC = sys.argv[1]
y, sr = librosa.load(SRC, sr=22050, mono=True)
dur = len(y) / sr
hop = 512
onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=onset, sr=sr, hop_length=hop, tightness=400)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
# low-end energy per beat (kick) and broadband onset strength per beat
S = np.abs(librosa.stft(y, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr)
low = S[freqs < 150].sum(0)
rms = librosa.feature.rms(S=S)[0]
def at(arr, t):
    i = librosa.time_to_frames(t, sr=sr, hop_length=hop)
    return float(arr[max(0, i - 1):i + 2].max())
acc = np.array([at(onset, t) for t in bt])
acc = acc / np.percentile(acc, 98)
lowb = np.array([at(low, t) for t in bt]); lowb /= np.percentile(lowb, 98)
# energy per bar of 4 beats and novelty between bars -> sections
bars = [(bt[i], bt[i + 4] if i + 4 < len(bt) else dur) for i in range(0, len(bt), 4)]
def seg_stat(a, b):
    f0, f1 = librosa.time_to_frames([a, b], sr=sr, hop_length=hop)
    return float(rms[f0:f1].mean()), float(low[f0:f1].mean())
bar_stats = [seg_stat(a, b) for a, b in bars]
out = dict(src=SRC, duration=dur, tempo=float(np.atleast_1d(tempo)[0]),
           beats=[round(float(t), 3) for t in bt],
           accent=[round(float(a), 3) for a in acc], kick=[round(float(a), 3) for a in lowb],
           bars=[dict(t=round(float(a), 3), rms=round(r, 4), low=round(l, 2)) for (a, b), (r, l) in zip(bars, bar_stats)])
(HERE / "audio").mkdir(exist_ok=True)
json.dump(out, open(HERE / "audio" / "music.json", "w"), indent=1)
print("tempo", out["tempo"], "beats", len(bt), "first", bt[:4])
lows = np.array([b["low"] for b in out["bars"]]); rmss = np.array([b["rms"] for b in out["bars"]])
for i, b in enumerate(out["bars"]):
    print(f"bar {i:3d} {b['t']:7.2f}s rms {b['rms']:.3f} low {b['low']/lows.max():.2f} " + "#" * int(30 * b['low'] / lows.max()))
