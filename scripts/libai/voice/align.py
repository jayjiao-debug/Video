# Per-character onsets of every line, from the voice itself (Whisper's word times run up to 1.2 s late).
#  1. phrases: runs of sound split by silences (gaps under 100 ms bridged)
#  2. the line's characters are shared out over the phrases (a DP: each phrase gets characters in proportion to its
#     length; a punctuation mark wants to fall between two phrases)
#  3. inside a phrase the syllable boundaries are the strongest spectral changes / loudness dips, kept near even (DP)
import json, re, sys, os, numpy as np, soundfile as sf, librosa
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
VOICE = sys.argv[1] if len(sys.argv) > 1 else '/home/user/libai_work/voice/voice_48k.wav'
TIMING = sys.argv[2] if len(sys.argv) > 2 else '/home/user/libai_work/voice/voice_timing.json'
OUT_T = sys.argv[3] if len(sys.argv) > 3 else '/home/user/libai_work/voice/voice_timing_v4.json'; OUT_ON = '/home/user/libai_work/v4/onsets.json'
OUT_ENV = os.path.join(ROOT, 'src/videos/libai/voice_env.ts')
y, sr = sf.read(VOICE); y = y.astype(np.float32)
HOP = 240; FR = sr / HOP                                           # 5 ms
M = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=1024, hop_length=HOP, n_mels=40, fmin=80, fmax=5000)
L = np.log(M + 1e-8)
loud = 10 * np.log10(M[3:30].sum(0) + 1e-10)
sm = lambda x, n: np.convolve(x, np.hanning(n) / np.hanning(n).sum(), 'same')
louds = sm(loud, 7)
flux = np.zeros(L.shape[1]); flux[3:] = np.maximum(0, L[:, 3:] - L[:, :-3]).sum(0); flux = sm(flux, 5)
from scipy.ndimage import maximum_filter1d
dip = maximum_filter1d(louds, 17) - louds                           # how far below the loudest within +-40 ms
d = json.load(open(TIMING))
PUN = '，。！？、；：…,.!?'
han = lambda s: re.sub(r'[^一-鿿]', '', s)
def phrases(a, b):
    seg = louds[a:b]; top = np.percentile(seg, 98); on = seg > top - 30
    runs, i = [], 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            runs.append([a + i, a + j]); i = j
        else: i += 1
    m = []
    for r in runs:
        if m and r[0] - m[-1][1] < 20: m[-1][1] = r[1]
        else: m.append(r)
    return [r for r in m if r[1] - r[0] >= 14]
SKIP = {}
NOTWORDS = {'D25': [0], 'E29': [0]}            # phrases that are not words (D25 opens on a big laugh: the take's 「哈哈哈」)
def share(P, cuts, N, lid=''):
    """how many characters each phrase says: DP; cuts = character indices that follow a punctuation mark"""
    D = [p[1] - p[0] for p in P]; r = sum(D) / N; m = len(P); INF = 1e18
    best = [[INF] * (N + 1) for _ in range(m + 1)]; arg = [[0] * (N + 1) for _ in range(m + 1)]; best[0][0] = 0
    for j in range(1, m + 1):
        for c in range(0, N + 1):
            for c0 in range(0, c + 1):
                if best[j-1][c0] >= INF: continue
                n = c - c0
                if n == 0:                                               # not words: a laugh, a breath
                    v = best[j-1][c0] + SKIP.get(lid, 9.0)
                    if v < best[j][c]: best[j][c] = v; arg[j][c] = c0
                    continue
                cost = ((D[j-1] - n * r) / r) ** 2
                inside = sum(1 for k in cuts if c0 < k < c)              # a punctuation mark inside the phrase
                end_ok = 0 if (c == N or c in cuts) else 1               # a phrase that ends mid-sentence
                cost += 4.0 * inside + 4.0 * end_ok
                v = best[j-1][c0] + cost
                if v < best[j][c]: best[j][c] = v; arg[j][c] = c0
    out, c = [], N
    for j in range(m, 0, -1): c0 = arg[j][c]; out.append(c - c0); c = c0
    return out[::-1]
def nov(a, b):
    f = flux[a:b]; dd = dip[a:b]
    z = lambda x: (x - x.mean()) / (x.std() + 1e-6)
    return z(f) + 0.8 * z(dd)
def split(a, b, k):
    """k syllables in [a, b): onsets (frame indices), the first at a"""
    if k == 1: return [a]
    Lp = b - a; mean = Lp / k; nv = nov(a, b); mn = max(18, int(0.5 * mean))
    INF = 1e18; best = {0: (0.0, None)}; layers = [best]
    pos = [{0}]
    # dp over boundary index j=1..k-1 and position p
    prev = {0: (0.0, [])}
    for j in range(1, k):
        cur = {}
        for p in range(mn * j, Lp - mn * (k - j) + 1):
            bestv, bestpath = -INF, None
            for q, (v, path) in prev.items():
                dlen = p - q
                if dlen < mn: continue
                s = v + nv[p] - 1.2 * ((dlen - mean) / mean) ** 2
                if s > bestv: bestv, bestpath = s, path
            if bestpath is not None: cur[p] = (bestv, bestpath + [p])
        # keep it tractable
        prev = dict(sorted(cur.items(), key=lambda kv: -kv[1][0])[:400])
    fin = max(prev.items(), key=lambda kv: kv[1][0] - 1.2 * ((Lp - kv[0] - mean) / mean) ** 2)
    return [a] + [a + p for p in fin[1][1]]
out = {}
for l in d['lines']:
    s, e = l['start'], l['end']; a, b = int(s * FR), int(e * FR)
    P = phrases(a, b)
    parts = [han(c) for c in re.split('[' + PUN + ']+', l['text']) if han(c)]
    chars = ''.join(parts); N = len(chars)
    cuts, acc = set(), 0
    for p in parts[:-1]: acc += len(p); cuts.add(acc)
    P = [p for i, p in enumerate(P) if i not in NOTWORDS.get(l['id'], [])]
    if len(P) > N: P = sorted(sorted(P, key=lambda p: -(p[1] - p[0]))[:N])
    n = share(P, cuts, N, l['id'])
    on = []
    for p, k in zip(P, n):
        if k: on += split(p[0], p[1], k)
    out[l['id']] = {'chars': chars, 'on': [round(x / FR, 3) for x in on], 'end': round(P[-1][1] / FR, 3), 'start': round(P[[i for i, k in enumerate(n) if k][0]][0] / FR, 3),
                    'phrases': [[round(p[0] / FR, 3), round(p[1] / FR, 3), k] for p, k in zip(P, n)]}
    if '-v' in sys.argv: print(l['id'], len(P), n, ' '.join(f"{c}{t:.2f}" for c, t in zip(chars, out[l['id']]['on'])))
json.dump(out, open(OUT_ON, 'w'), ensure_ascii=False, indent=0)
# the timing file with these word times (gen_timing.py reads it): a character ends where the next starts, the last of a
# phrase where the phrase's sound ends
d2 = json.loads(json.dumps(d))
for l in d2['lines']:
    o = out[l['id']]; ends = []
    for i, t in enumerate(o['on']):
        nxt = o['on'][i + 1] if i + 1 < len(o['on']) else None
        ph = [p for p in o['phrases'] if p[0] - 1e-6 <= t <= p[1] + 1e-6]
        pe = ph[0][1] if ph else o['end']
        ends.append(round(min(pe, nxt) if nxt is not None else min(pe, l['end']), 3))
    l['words'] = [[c, max(l['start'], t), max(max(l['start'], t), e)] for c, t, e in zip(o['chars'], o['on'], ends)]
d2['words_from'] = 'scripts/libai/voice/align.py (syllable onsets measured in the voice)'
json.dump(d2, open(OUT_T, 'w'), ensure_ascii=False, indent=1)
# THE MOUTHS: how loud each line is on each picture frame, 0-9 of its own loudest (rigSayEnv reads it)
seg = []
for l in d['lines']:
    f0, f1 = int(l['start'] * 30), int(np.ceil(l['end'] * 30)) + 1
    v = []
    for f in range(f0, f1):
        a0, a1 = int(f / 30 * sr), int((f + 1) / 30 * sr)
        v.append(float(np.sqrt(np.mean(y[a0:a1] ** 2) + 1e-12)))
    v = np.array(v); top = np.percentile(v, 97) + 1e-9
    q = np.clip(np.round(v / top * 9), 0, 9).astype(int)
    seg.append((l['line'], f0, ''.join(map(str, q))))
ts = ["// GENERATED by scripts/libai/voice/align.py from the voice track: do not edit by hand.",
      "// VOICE_ENV: each line's loudness on each picture frame from its first frame, one digit a frame, 0-9 of the line's own",
      "// loudest (rigSayEnv's 0..1 is the digit / 9). shots/common.ts speak() moves the mouth by it, so the mouth opens on",
      "// the real syllables and shuts in the pauses (a laugh moves it too).",
      "export const VOICE_ENV: Record<number, [from: number, env: string]> = {"]
ts += [f"  {n}: [{f0}, \"{e}\"]," for n, f0, e in seg] + ["};", ""]
open(OUT_ENV, 'w').write("\n".join(ts))
print("wrote", OUT_ON, OUT_T, OUT_ENV)
