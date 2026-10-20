"""Trim each 薄肌 clip down to just the two syllables 薄肌.
SenseVoice token start times (60 ms frames) give the rough span; the cut points are snapped to the quietest
moment nearby (a plosive closure before 薄, the dip before the next syllable after 肌). Writes cuts.json."""
import json, numpy as np, soundfile as sf
A = json.load(open('asr.json'))
B = set('搏薄博伯泊勃脖驳箔铂舶播'); J = set('击机肌基鸡积级激几迹姬饥极吉际及')
UNSURE_B = set('国'); UNSURE_J = set('金')
def env(a, sr, hop=0.005, win=0.02):
    h, w = int(sr * hop), int(sr * win)
    e = np.array([np.sqrt(np.mean(a[i:i + w] ** 2) + 1e-12) for i in range(0, max(1, len(a) - w), h)])
    return 20 * np.log10(e + 1e-9), hop
def quietest(E, hop, t0, t1, bias):
    i0, i1 = max(0, int(t0 / hop)), min(len(E) - 1, int(t1 / hop))
    if i1 <= i0: return (t0 + t1) / 2
    seg = E[i0:i1 + 1] + bias * np.linspace(0, 1, i1 - i0 + 1)      # bias: prefer earlier (-) or later (+) when levels tie
    return (i0 + int(np.argmin(seg))) * hop
cuts = {}
for k, v in A.items():
    t, ts, dur = v['tok'], v['ts'], v['dur']
    cand = [(i, 'ok') for i in range(len(t) - 1) if t[i] in B and t[i + 1] in J]
    if not cand:
        cand = [(i, 'unsure') for i in range(len(t) - 1) if (t[i] in B | UNSURE_B) and (t[i + 1] in J | UNSURE_J)]
    if not cand: cuts[k] = {'status': 'none', 'text': v['text']}; continue
    i, st = min(cand, key=lambda c: abs(ts[c[0]] - (dur / 2 - 0.15)))   # if several, the one nearest the clip centre
    a, sr = sf.read(f'wav/{k}.wav', dtype='float32'); E, hop = env(a, sr)
    tb = ts[i]; tn = ts[i + 2] if i + 2 < len(ts) else None
    # start: the quietest point in [tb-0.14, tb+0.03] — for 薄 (a 'b' stop) that is the closure just before the burst
    s = quietest(E, hop, tb - 0.14, tb + 0.02, bias=+1.5)
    if tn is not None:
        e = quietest(E, hop, ts[i + 1] + 0.10, tn + 0.04, bias=-1.5)        # the dip before the next syllable (prefer later: keep all of 肌)
    else:
        # 肌 is last: end where the level falls 30 dB below the 肌 peak (or the clip end)
        j0 = int(ts[i + 1] / hop); pk = E[j0:].max() if j0 < len(E) else E.max()
        after = [n for n in range(j0 + 20, len(E)) if E[n] < pk - 30]
        e = after[0] * hop if after else dur
    s, e = max(0.0, s), min(dur, max(e, s + 0.32))
    cuts[k] = {'status': st, 'text': v['text'], 'start': round(s, 3), 'end': round(e, 3), 'pair': t[i] + t[i + 1]}
json.dump(cuts, open('cuts.json', 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter(c['status'] for c in cuts.values()))
