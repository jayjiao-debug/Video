import sys, glob, re, json
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
eng = RapidOCR()
frames = sorted(glob.glob('full/*.png'))
def thumbs(g):
    col = g[:, 1140:1144].mean(1) < 90; runs = []; s = None
    for y, d in enumerate(col):
        if d and s is None: s = y
        if not d and s is not None: runs.append((s, y)); s = None
    return [(a, b) for a, b in runs if 175 < b - a < 210 and a > 640 and b < 2840]
def sig(img, a): return np.asarray(img.crop((1128, a, 1272, a + 190)).convert('L').resize((24, 32))).astype(float)
REF = sig(Image.open('full/0020.png'), 844)
TIME = re.compile(r'(\d+\s*(秒|分钟|小时|天)前|刚刚|昨天\s*\d{1,2}:\d{2}|\d{1,2}-\d{1,2})\s*$')
rows = []; prev = None
for fi, f in enumerate(frames):
    img = Image.open(f).convert('RGB'); g = np.asarray(img.convert('L')).astype(int)
    if prev is not None and np.abs(g[600:2800:8, ::8] - prev).mean() < 1.0: continue
    prev = g[600:2800:8, ::8]
    for a, b in thumbs(g):
        top = a - 40
        res, _ = eng(np.asarray(img.crop((250, top, 1110, min(a + 430, 2860)))))
        lines = sorted([(bx[0][1], t, s) for bx, t, s in (res or [])])
        out = []
        for y, t, s in lines:
            if '回复评论' in t or t.strip() in ('赞',): break
            out.append(t.strip())
        rows.append({'frame': fi, 'y': a, 'thumbDiff': round(float(np.abs(sig(img, a) - REF).mean()), 1), 'lines': out})
    print(fi, len(rows), file=sys.stderr, flush=True)
json.dump(rows, open('rows2.json', 'w'), ensure_ascii=False)
