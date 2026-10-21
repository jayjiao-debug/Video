#!/usr/bin/env python3
"""Look check for stills and style frames: does the picture read on a phone?

For each frame it measures
  - brightness: mean luminance (0–255). FAIL below 30, warning below 40 (owner, ep21: 27/255 read "too dark").
  - squint spread: blur the frame to phone size as if squinting and measure the spread between its darkest and
    brightest areas (95th − 5th percentile). Below ~85 everything sits in one tone and nothing stands out.
    Calibrated on ep35: the 0:19 spotlight frame = 114 (reads), the 0:22 push frame = 68 (flat).
  - subject (only with --subject x,y,w,h in 1920×1080 pixels): its luminance against a ring around it and how
    its local contrast ranks in the frame. Reported, and a warning when weak; thin subjects (puppets, strings)
    make these numbers noisy, so the 3-tone image is the judge.
and writes, per frame, a greyscale + 3-tone (posterised) view, plus one sheet of every frame at phone size
(a landscape film is ~¼ of a portrait phone screen: ~480 px wide) so a reviewer can look, not guess.

usage: look_check.py FRAME.png [FRAME2.png …] [--subject x,y,w,h] [--out DIR]
       (--subject may be given once per frame, in the same order, or once for all frames)
exit code 1 if any frame FAILs.
"""
import argparse, json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
import numpy as np

PHONE_W = 480          # a 1920-wide film shown across a portrait phone, in CSS-ish pixels
DARK_FAIL, DARK_WARN = 30, 40   # mean luminance
SQUINT = 85                      # squint spread below this → flat value structure


def lum(im):
    a = np.asarray(im.convert('RGB'), dtype=np.float32)
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def squint_spread(L):
    im = Image.fromarray(np.clip(L, 0, 255).astype(np.uint8), 'L').resize((480, 270)).filter(ImageFilter.GaussianBlur(6))
    b = np.asarray(im, np.float32)
    return float(np.percentile(b, 95) - np.percentile(b, 5))


def subject_stats(L, box):
    H, W = L.shape
    sx, sy = W / 1920, H / 1080
    x, y, w, h = [int(v) for v in box]
    x0, y0, x1, y1 = int(x * sx), int(y * sy), int((x + w) * sx), int((y + h) * sy)
    pad = int(max(x1 - x0, y1 - y0) * 0.5)
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    ring = np.ones((Y1 - Y0, X1 - X0), bool)
    ring[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = False
    subj = L[y0:y1, x0:x1]
    sur = L[Y0:Y1, X0:X1][ring]
    s_mean, r_mean = float(subj.mean()), float(sur.mean())
    ratio = (max(s_mean, r_mean) + 5) / (min(s_mean, r_mean) + 5)
    # local contrast (std) inside the subject vs the frame's typical local contrast
    s_std = float(subj.std())
    tiles = [L[j:j + H // 6, i:i + W // 8].std() for j in range(0, H - H // 6 + 1, H // 6) for i in range(0, W - W // 8 + 1, W // 8)]
    rank = float((np.array(tiles) < s_std).mean())  # share of frame tiles with less contrast than the subject
    return {'subject_mean': round(s_mean, 1), 'surround_mean': round(r_mean, 1), 'ratio': round(ratio, 2),
            'subject_contrast_rank': round(rank, 2)}


def posterise(L):
    q = np.digitize(L, [85, 170]) * 127
    return Image.fromarray(q.astype(np.uint8), 'L')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('frames', nargs='+')
    ap.add_argument('--subject', action='append', default=[])
    ap.add_argument('--out', default='look_check')
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    boxes = [tuple(map(float, s.split(','))) for s in a.subject]
    if len(boxes) == 1:
        boxes = boxes * len(a.frames)
    results, thumbs, fail = [], [], False
    for i, f in enumerate(a.frames):
        im = Image.open(f).convert('RGB')
        L = lum(im)
        r = {'frame': f, 'mean_luminance': round(float(L.mean()), 1), 'squint_spread': round(squint_spread(L), 1)}
        flags, warns = [], []
        if r['mean_luminance'] < DARK_FAIL:
            flags.append(f"too dark (mean {r['mean_luminance']} < {DARK_FAIL})")
        elif r['mean_luminance'] < DARK_WARN:
            warns.append(f"on the dark side (mean {r['mean_luminance']}); check the subject is lit")
        if r['squint_spread'] < SQUINT:
            flags.append(f"flat when squinting (spread {r['squint_spread']} < {SQUINT}): subject and background share one tone")
        if i < len(boxes):
            s = subject_stats(L, boxes[i]); r.update(s)
            if s['subject_contrast_rank'] < 0.75:
                warns.append(f"subject is not among the highest-contrast areas (beats {int(s['subject_contrast_rank'] * 100)} % of the frame); check the 3-tone image")
        r['verdict'] = 'FAIL' if flags else 'PASS'
        r['flags'] = flags; r['warnings'] = warns
        fail |= bool(flags)
        stem = Path(f).stem
        g = ImageOps.grayscale(im)
        pair = Image.new('L', (g.width * 2, g.height)); pair.paste(g, (0, 0)); pair.paste(posterise(L), (g.width, 0))
        pair.thumbnail((1920, 1080)); pair.save(out / f'{stem}_values.png')
        t = im.copy(); t.thumbnail((PHONE_W, PHONE_W)); thumbs.append((stem, r['verdict'], t))
        results.append(r)
        print(f"{r['verdict']}  {f}  mean {r['mean_luminance']} · squint spread {r['squint_spread']}"
              + (f" · subject ratio {r['ratio']} · contrast rank {r['subject_contrast_rank']}" if 'ratio' in r else '')
              + ''.join(f"\n      - {x}" for x in flags) + ''.join(f"\n      (warn) {x}" for x in warns))
    # phone-size sheet: thumbnails at real phone size, labelled
    pad, lab = 16, 26
    cols = min(3, len(thumbs)); rows = (len(thumbs) + cols - 1) // cols
    tw = max(t.width for _, _, t in thumbs); th = max(t.height for _, _, t in thumbs)
    sheet = Image.new('RGB', (pad + cols * (tw + pad), pad + rows * (th + lab + pad)), (18, 18, 20))
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 16)
    except OSError:
        font = ImageFont.load_default()
    for k, (stem, v, t) in enumerate(thumbs):
        x = pad + (k % cols) * (tw + pad); y = pad + (k // cols) * (th + lab + pad)
        d.text((x, y), f'{stem}  {v}', fill=(120, 220, 140) if v == 'PASS' else (255, 120, 110), font=font)
        sheet.paste(t, (x, y + lab))
    sheet.save(out / 'look_sheet.png')
    (out / 'look_check.json').write_text(json.dumps(results, ensure_ascii=False, indent=1))
    print(f"→ {out}/look_sheet.png (phone size), {out}/*_values.png (greyscale | 3-tone), look_check.json")
    sys.exit(1 if fail else 0)


if __name__ == '__main__':
    main()
