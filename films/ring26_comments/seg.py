"""Segment Douyin comment-section frames into individual comment rows; OCR each; keep the sharpest crop per unique comment."""
import glob, re, json, sys, os
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
eng = RapidOCR()
META = re.compile(r'(\d+\s*(秒|分钟|小时|天|周)前|刚刚|昨天\s*\d{1,2}\s*[:：]\s*\d{2}|\d{1,2}-\d{1,2}|\d{4}-\d{1,2}-\d{1,2})\s*[·・.,，]?\s*(\S{1,8})')
LIST_TOP, LIST_BOT = 1010, 2650
os.makedirs('crops', exist_ok=True)
def sharp(a):
    g = a.astype(float); return float(np.var(g[1:-1, 1:-1] * 4 - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]))
out = []
frames = sorted(glob.glob('fr/*.jpg'))
for n, f in enumerate(frames):
    im = Image.open(f).convert('RGB'); A = np.asarray(im); G = np.asarray(im.convert('L'))
    # skip non-comment frames (header '评论' must be visible near y~980)
    res, _ = eng(A[LIST_TOP - 80:LIST_BOT])
    if not res: continue
    L = sorted([(int(b[0][1]) + LIST_TOP - 80, int(b[2][1]) + LIST_TOP - 80, int(b[0][0]), int(b[2][0]), t.strip(), s) for b, t, s in res])
    if not any('评论' in t and y0 < LIST_TOP for y0, y1, x0, x1, t, s in L):
        continue
    bounds = []  # (y_bottom, kind)
    for y0, y1, x0, x1, t, s in L:
        if y0 < LIST_TOP: continue
        if META.search(t) and x0 < 260: bounds.append((y0, y1, 'meta', t))
        elif re.search(r'展开\d*条回复|收起', t): bounds.append((y0, y1, 'more', t))
    prev = None
    for b in bounds:
        if b[2] == 'meta' and prev is not None:
            top, bot = prev + 6, b[1] + 34
            if bot > LIST_BOT or top < LIST_TOP: prev = b[1]; continue
            lines = [(y0, x0, x1, t) for y0, y1, x0, x1, t, s in L if y0 >= top - 2 and y1 <= b[0] + 2 and t not in ('回复',)]
            likes = [t for y0, y1, x0, x1, t, s in L if top <= y0 <= bot and x0 > 1150 and re.fullmatch(r'\d+(\.\d+)?[万wW]?', t)]
            body = [l for l in lines if l[1] < 1150]
            # name: first line, grey text
            name, text = '', []
            for i, (y0, x0, x1, t) in enumerate(body):
                crop = G[y0:y0 + 30, x0:x1]
                grey = crop.size and np.percentile(crop, 5) > 90
                if i == 0 and grey: name = t
                else: text.append(t)
            meta = META.search(b[3]); when, prov = (meta.group(1), meta.group(3)) if meta else ('', '')
            reply = any(x0 > 230 for y0, x0, x1, t in body[:1]) or (A[top:bot, 170:175].mean() > 250 and A[top:bot, 245:255].mean() < 250 and False)
            ca = A[top:bot]; key = f'{n:04d}_{top}'
            out.append({'frame': f, 'top': top, 'bot': bot, 'name': name, 'text': ' '.join(text), 'when': when, 'prov': prov, 'likes': likes[0] if likes else '', 'indent': int(body[0][1]) if body else 0, 'sharp': sharp(np.asarray(Image.fromarray(ca).convert('L'))), 'h': bot - top})
        prev = b[1]
    print(n, len(out), file=sys.stderr, flush=True)
json.dump(out, open('segs.json', 'w'), ensure_ascii=False)
