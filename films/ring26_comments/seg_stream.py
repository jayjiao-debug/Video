"""Stream a screen recording, OCR the comment list only when it has scrolled ~600px, save every complete comment row as a crop."""
import sys, re, json, subprocess, os
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
eng = RapidOCR()
META = re.compile(r'(\d+\s*(秒|分钟|小时|天|周)前|刚刚|昨天\s*\d{1,2}\s*[:：]\s*\d{2}|\d{1,2}-\d{1,2}|\d{4}-\d{1,2}-\d{1,2})\s*[·・.,，]?\s*(\S{1,8})')
LIST_TOP, LIST_BOT, W, H = 1010, 2650, 1320, 2868
def sharp(g):
    g = g.astype(float); return float(np.var(g[1:-1, 1:-1] * 4 - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]))
def shift(a, b):
    best = (1e18, 0)
    for d in range(-40, 260, 2):
        e = np.mean((a[d:] - b[:a.shape[0] - d]) ** 2) if d >= 0 else np.mean((a[:d] - b[-d:]) ** 2)
        if e < best[0]: best = (e, d)
    return best[1]
def process(A, tag, out):
    G = np.asarray(Image.fromarray(A).convert('L'))
    res, _ = eng(A[LIST_TOP - 80:LIST_BOT])
    if not res: return 0
    L = sorted([(int(b[0][1]) + LIST_TOP - 80, int(b[2][1]) + LIST_TOP - 80, int(b[0][0]), int(b[2][0]), t.strip()) for b, t, s in res])
    if not any('评论' in t and y0 < LIST_TOP for y0, y1, x0, x1, t in L): return 0
    bounds = []
    for y0, y1, x0, x1, t in L:
        if y0 < LIST_TOP: continue
        if META.search(t) and x0 < 260: bounds.append((y0, y1, 'meta', t))
        elif re.search(r'展开\d*条回复|收起', t): bounds.append((y0, y1, 'more', t))
    prev = None; n = 0
    for b in bounds:
        if b[2] == 'meta' and prev is not None:
            top, bot = prev + 6, b[1] + 34
            if bot <= LIST_BOT and top >= LIST_TOP:
                body = [(y0, x0, x1, t) for y0, y1, x0, x1, t in L if y0 >= top - 2 and y1 <= b[0] + 2 and t != '回复' and x0 < 1000]
                name, text = '', []
                for i, (y0, x0, x1, t) in enumerate(body):
                    c = G[y0:y0 + 30, x0:x1]
                    if i == 0 and c.size and np.percentile(c, 5) > 90: name = t
                    else: text.append(t)
                m = META.search(b[3]); fn = f'crops/{tag}_{top}.jpg'
                Image.fromarray(A[top:bot]).save(fn, quality=88)
                out.append({'frame': fn, 'top': 0, 'bot': bot - top, 'name': name, 'text': ' '.join(text), 'when': m.group(1) if m else '', 'prov': m.group(3) if m else '',
                            'likes': '', 'sharp': sharp(G[top:bot]), 'h': bot - top}); n += 1
        prev = b[1]
    return n
out = []
for vi, path in enumerate(sys.argv[1:], 1):
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-i', path, '-vf', 'fps=15', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    k = 0; acc = 999; prevs = None; done = 0
    while True:
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        A = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        s = A[LIST_TOP:LIST_BOT:4, 150:1100:4].mean(2)
        if prevs is not None: acc += max(0, shift(prevs, s))
        prevs = s
        if acc >= 175:
            done += 1; process(A.copy(), f'n{vi}_{k:05d}', out); acc = 0
        k += 1
        if k % 300 == 0: print(f'video {vi} frame {k} processed {done} segs {len(out)}', flush=True); json.dump(out, open('segs.json', 'w'), ensure_ascii=False)
    print(f'video {vi} done frames {k} processed {done} segs {len(out)}', flush=True)
json.dump(out, open('segs.json', 'w'), ensure_ascii=False)
