"""ASR-as-oracle trim: for each clip find the range of start points and end points where SenseVoice hears exactly
one 薄肌-like pair (two characters, 搏击/薄肌/… ) and nothing else, then cut in the middle of each range.
Writes cuts2.json: start, end, the valid ranges, and the decoded text at the chosen cut."""
import json, sys, time, numpy as np, soundfile as sf, sherpa_onnx
d = 'sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17'
rec = sherpa_onnx.OfflineRecognizer.from_sense_voice(model=f'{d}/model.int8.onnx', tokens=f'{d}/tokens.txt', num_threads=2, language='zh', use_itn=False)
A = json.load(open('asr.json')); C = json.load(open('cuts.json'))
B = set('搏薄博伯泊勃脖驳箔铂舶播'); J = set('击机肌基鸡积级激几迹姬饥极吉际及')
SR = 16000; PAD = np.zeros(int(0.25 * SR), dtype='float32')
def dec(a, s, e):
    seg = a[int(s * SR):int(e * SR)].copy(); f = int(0.01 * SR)
    if len(seg) < 2 * f: return ''
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    st = rec.create_stream(); st.accept_waveform(SR, np.concatenate([PAD, seg, PAD])); rec.decode_stream(st)
    return st.result.text.strip()
good = lambda txt: len(txt) == 2 and txt[0] in B and txt[1] in J
def mid_of_run(vals, oks):
    # the longest contiguous run of valid values; return its middle
    best, cur = [], []
    for v, ok in zip(vals, oks):
        cur = cur + [v] if ok else []
        if len(cur) > len(best): best = cur
    return (best[len(best) // 2], best[0], best[-1]) if best else None
out = {}; t0 = time.time()
keys = [k for k, c in C.items() if c['status'] != 'none']
for n, k in enumerate(keys):
    v = A[k]; a, _ = sf.read(f'wav/{k}.wav', dtype='float32'); dur = len(a) / SR
    t, ts = v['tok'], v['ts']
    cand = [i for i in range(len(t) - 1) if t[i] in (B | set('国')) and t[i + 1] in (J | set('金'))]
    i = min(cand, key=lambda c: abs(ts[c] - (dur / 2 - 0.15))) if cand else None
    if i is None: out[k] = {'ok': False, 'why': 'no pair'}; continue
    tb, tj = ts[i], ts[i + 1]; tn = ts[i + 2] if i + 2 < len(ts) else dur
    starts = [round(x, 3) for x in np.arange(max(0, tb - 0.30), tb + 0.07, 0.02)]
    ends = [round(x, 3) for x in np.arange(tj + 0.06, min(dur, tn + 0.14) + 1e-6, 0.02)]
    res = None
    for e_fix in [C[k].get('end', tn), min(dur, tn + 0.04), max(tj + 0.14, tn - 0.04)]:
        oks = [good(dec(a, s, e_fix)) for s in starts]
        ms = mid_of_run(starts, oks)
        if not ms: continue
        oke = [good(dec(a, ms[0], e)) for e in ends]
        me = mid_of_run(ends, oke)
        if me: res = (ms, me); break
    if not res: out[k] = {'ok': False, 'why': 'never exactly 薄肌', 'text': v['text']}; continue
    (s, s_lo, s_hi), (e, e_lo, e_hi) = res
    out[k] = {'ok': True, 'start': s, 'end': e, 'start_range': [s_lo, s_hi], 'end_range': [e_lo, e_hi], 'heard': dec(a, s, e), 'orig': v['text']}
    if n % 10 == 0: print(n, k, out[k].get('heard'), f'{time.time() - t0:.0f}s', flush=True)
json.dump(out, open('cuts2.json', 'w'), ensure_ascii=False, indent=1)
print('ok', sum(o['ok'] for o in out.values()), 'of', len(out))
