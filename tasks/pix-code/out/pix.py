#!/usr/bin/env python3
"""Retro '3D pixel' look: clean cartoon frames -> pixelate + Bayer dither + CRT/VHS glitch,
pixel-font subtitles and an RPG-style status box. 1080x1920, 30 fps.
usage: pix.py video OUT.mp4 --frames DIR | pix.py stills OUTDIR --frames DIR t1 t2 ..."""
import sys, math, subprocess, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, DUR = 1080, 1920, 30, 12.0
PX = 6                      # picture pixel size -> 180x320 low-res
LW, LH = W // PX, H // PX
LEVELS = 7                  # colour levels per channel (dither does the rest)
FONT = ImageFont.truetype(os.path.join(HERE, 'font/package/fusion-pixel.ttf'), 12)

FRAMES = os.path.join(HERE, 'frames')     # overridden by --frames DIR
# shot time ranges + flags (the camera now lives in scene/scene.js)
SHOTS = [
    dict(t0=0.0, t1=3.0),
    dict(t0=3.0, t1=6.0, heat=True),
    dict(t0=6.0, t1=9.0),
    dict(t0=9.0, t1=12.0, mirage=True),
]
CUTS = [3.0, 6.0, 9.0]
# subtitles: (t0, t1, [row, row]); [..] = gold highlight
SUBS = [
    (0.15, 2.95, ['假如你7天不喝水，', '第[3]天：失水约[5%]']),
    (3.15, 5.95, ['头痛、烦躁、头晕，', '身体开始[报警]。']),
    (6.15, 8.95, ['就算一口不喝，', '每天还净亏约[1.25升]。']),
    (9.15, 11.9, ['远处……', '好像有[水]？']),
]
STATUS = [(0.0, '口渴'), (3.2, '头痛'), (9.2, '头晕')]

ease = lambda x: 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, x)))
BAYER = (np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) + 0.5) / 16 - 0.5

def rng(t, salt=0):
    return np.random.default_rng(int(t * FPS) * 7919 + salt)

# ---------- picture ----------
def camera(shot, t):
    """read the rendered 360x640 frame and BOX-downsample it to the low-res grid"""
    i = min(int(round(t * FPS)), int(DUR * FPS) - 1)
    img = Image.open(os.path.join(FRAMES, 'f_%04d.png' % i)).convert('RGB')
    small = img.resize((LW, LH), Image.BOX).filter(ImageFilter.UnsharpMask(radius=1, percent=70, threshold=0))
    return np.asarray(small).astype(np.float32)

def grade(a):
    a = (a / 255 - 0.5) * 1.08 + 0.5                       # contrast
    g = a.mean(axis=2, keepdims=True); a = g + (a - g) * 1.08  # saturation
    return np.clip(a, 0, 1)

def dither(a):
    b = np.tile(BAYER, (LH // 4 + 1, LW // 4 + 1))[:LH, :LW, None]
    q = np.floor(a * (LEVELS - 1) + 0.5 + b * 1.05)
    return np.clip(q / (LEVELS - 1), 0, 1)

def picture(t):
    shot = next(s for s in SHOTS if s['t0'] <= t < s['t1'] + 1e-6)
    a = camera(shot, t)
    if shot.get('heat'):                                    # heat shimmer on the lower half
        for y in range(int(LH * 0.58), LH):
            a[y] = np.roll(a[y], int(round(1.3 * math.sin(y * 0.55 + t * 9))), axis=0)
    if shot.get('mirage'):                                  # shimmering cool reflection in the eye
        cool = (a[..., 2] > a[..., 0] + 8)
        a[cool] = a[cool] * (1.0 + 0.22 * math.sin(t * 11)) + np.array([0, 10, 25]) * (0.6 + 0.4 * math.sin(t * 7))
    a = grade(a)
    r = rng(t, 3)                                           # drifting sand specks
    n = 26
    xs = (r.random(n) * LW + t * 22 * (0.5 + r.random(n))) % LW
    ys = r.random(n) * LH
    a[ys.astype(int), xs.astype(int)] = np.clip(a[ys.astype(int), xs.astype(int)] + 0.35, 0, 1)
    bloom = Image.fromarray((np.clip(a - 0.78, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))
    a = np.clip(a + np.asarray(bloom).astype(np.float32) / 255 * 0.7, 0, 1)
    return dither(a)

# ---------- pixel text ----------
GOLD, WHITE, CYAN = (242, 193, 78), (250, 246, 236), (110, 228, 255)

def text_layer(rows, colour=WHITE, hi=GOLD, line_gap=3, align='center'):
    """returns low-res RGBA numpy (text pixels with 1-px outline + drop shadow)."""
    parts = []
    for row in rows:
        segs, cur, on = [], '', False
        for ch in row:
            if ch in '[]':
                if cur: segs.append((cur, on)); cur = ''
                on = ch == '['
            else: cur += ch
        if cur: segs.append((cur, on))
        parts.append(segs)
    widths = [sum(FONT.getlength(s) for s, _ in segs) for segs in parts]
    tw, th = int(max(widths)) + 4, len(rows) * (12 + line_gap) + 4
    col = np.zeros((th, tw, 3), np.uint8); m = np.zeros((th, tw), bool)
    for i, segs in enumerate(parts):
        x = 2 + ((tw - 4 - widths[i]) / 2 if align == 'center' else 0); y = 2 + i * (12 + line_gap)
        for s, on in segs:
            im = Image.new('1', (tw, th)); d = ImageDraw.Draw(im); d.fontmode = '1'
            for ch in s:                                    # tighten '.' in numbers
                adv = FONT.getlength(ch)
                if ch == '.': x -= 2; d.text((x, y - 1), ch, font=FONT, fill=1); x += adv - 2
                else: d.text((x, y - 1), ch, font=FONT, fill=1); x += adv
            mm = np.asarray(im).astype(bool)
            col[mm] = hi if on else colour; m |= mm
    out = np.zeros((th + 1, tw + 1, 4), np.uint8)
    sh = np.zeros_like(m); sh[1:, 1:] = m[:-1, :-1]
    ol = m.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            ol |= np.roll(np.roll(m, dy, 0), dx, 1)
    shadow = np.zeros((th + 1, tw + 1), bool); shadow[1:, 1:] = ol
    out[shadow] = (0, 0, 0, 150)
    out[:th, :tw][ol] = (10, 8, 8, 255)
    out[:th, :tw][m, :3] = col[m]; out[:th, :tw][m, 3] = 255
    return out

def paste(frame, layer, x, y, scale, alpha=1.0):
    big = np.repeat(np.repeat(layer, scale, 0), scale, 1)
    h, w = big.shape[:2]
    x, y = int(x), int(y)
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + w, W), min(y + h, H)
    if x1 <= x0 or y1 <= y0: return
    b = big[y0 - y:y1 - y, x0 - x:x1 - x].astype(np.float32)
    a = b[..., 3:4] / 255 * alpha
    frame[y0:y1, x0:x1] = frame[y0:y1, x0:x1] * (1 - a) + b[..., :3] * a

def status_box(value, flash):
    t = text_layer(['状态：[' + value + ']'], align='left')
    th, tw = t.shape[:2]
    bw, bh = tw + 10, th + 8
    box = np.zeros((bh, bw, 4), np.uint8)
    box[:, :] = (14, 12, 12, 225)
    gold = (255, 255, 255, 255) if flash else (214, 170, 72, 255)
    box[0, :] = box[-1, :] = gold; box[:, 0] = box[:, -1] = gold
    box[2, 2:-2] = box[-3, 2:-2] = (90, 72, 34, 255); box[2:-2, 2] = box[2:-2, -3] = (90, 72, 34, 255)
    ys, xs = 4, 5
    a = t[..., 3:4].astype(np.float32) / 255
    box[ys:ys + th, xs:xs + tw, :3] = (box[ys:ys + th, xs:xs + tw, :3] * (1 - a) + t[..., :3] * a).astype(np.uint8)
    return box

def water_bar(litres):
    lab = text_layer([f'体内水量 {litres:.1f}L'], colour=(200, 235, 245), align='left')
    lh, lw = lab.shape[:2]
    segs, sw = 14, 5
    bw = segs * (sw + 1) + 3
    out = np.zeros((lh + 9, max(lw, bw), 4), np.uint8)
    out[:lh, :lw] = lab
    y = lh + 1
    out[y:y + 7, :bw] = (10, 10, 12, 230)
    fill = litres / 42 * segs
    for i in range(segs):
        x = 2 + i * (sw + 1)
        if i + 1 <= fill: out[y + 2:y + 5, x:x + sw] = (*CYAN, 255)
        elif i < fill:   out[y + 2:y + 5, x:x + sw] = (40, 120, 150, 255)
        else:            out[y + 2:y + 5, x:x + sw] = (40, 34, 34, 255)
    return out

# ---------- full-res effects ----------
def crt(frame, t):
    r = rng(t, 11)
    near = min(abs(t - c) for c in CUTS)
    burst = max(0.0, 1 - near / 0.12) if near < 0.12 else 0.0
    f = frame
    if burst > 0:                                           # band tear at cuts
        for _ in range(int(4 + 6 * burst)):
            y = int(r.random() * H); h = int(16 + r.random() * 90); dx = int((r.random() - 0.5) * 160 * burst)
            f[y:y + h] = np.roll(f[y:y + h], dx, axis=1)
        f *= 1 + 0.25 * burst
    ca = int(3 + 14 * burst)                                # chromatic aberration
    out = f.copy()
    out[..., 0] = np.roll(f[..., 0], -ca, axis=1)
    out[..., 2] = np.roll(f[..., 2], ca, axis=1)
    out[PX - 1::PX] *= 0.88                                 # scanlines on the pixel grid
    if (int(t * FPS) // 2) % 23 in (0, 11) or burst > 0:    # thin glitch streaks
        for _ in range(1 + int(r.random() * 2)):
            y = int(r.random() * H); x0 = int(r.random() * W * 0.6); x1 = x0 + int(200 + r.random() * 600)
            c = np.array([(255, 255, 255), (150, 230, 255), (255, 140, 200)][int(r.random() * 3)], np.float32)
            for xs in range(x0, min(x1, W), 40):
                yy = y + int((r.random() - 0.5) * 10)
                out[max(yy, 0):yy + 3, xs:xs + 40] = out[max(yy, 0):yy + 3, xs:xs + 40] * 0.3 + c * 0.7
    yy, xx = np.ogrid[:H, :W]                               # vignette
    v = 1 - 0.28 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) ** 1.2
    out *= v[..., None]
    return np.clip(out, 0, 255)

def frame_at(t):
    pic = picture(t)
    f = np.repeat(np.repeat((pic * 255).astype(np.float32), PX, 0), PX, 1)
    # status box + water bar (top-left, below the phone status bar)
    val = [v for s, v in STATUS if t >= s][-1]
    flash = any(0 <= t - s < 0.3 and int((t - s) * FPS) % 4 < 2 for s, _ in STATUS[1:])
    box = status_box(val, flash)
    paste(f, box, 84, 196, 5)
    by = 196 + box.shape[0] * 5 + 14
    litres = 38.3 if t < 6.9 else 37.0
    if 6.9 <= t < 7.4 and int(t * FPS) % 4 < 2: litres = 38.3
    paste(f, water_bar(litres), 84, by, 4)
    # floating '-1.25升' from the bottle mouth
    if 6.7 <= t < 8.2:
        u = (t - 6.7) / 1.5
        paste(f, text_layer(['-1.25升'], colour=CYAN), 470, by + 30 - 90 * ease(u), 6, alpha=min(1, 3 * (1 - u)))
    # subtitles (pixel font, centred, two rows)
    for t0, t1, rows in SUBS:
        if t0 <= t < t1:
            lay = text_layer(rows)
            sc = 7
            paste(f, lay, (W - lay.shape[1] * sc) / 2, 1150, sc)
    # J seal (hollow, small, bottom-right above the Douyin UI)
    return crt(f, t).astype(np.uint8)

if __name__ == '__main__':
    argv = sys.argv[:]
    if '--frames' in argv:
        k = argv.index('--frames'); FRAMES = os.path.abspath(argv[k + 1]); del argv[k:k + 2]
    mode = argv[1]
    if mode == 'stills':
        os.makedirs(argv[2], exist_ok=True)
        for ts in argv[3:]:
            Image.fromarray(frame_at(float(ts))).save(os.path.join(argv[2], f'p_{float(ts):05.2f}.png'))
    else:
        p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                              '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium',
                              '-pix_fmt', 'yuv420p', '-movflags', '+faststart', argv[2]], stdin=subprocess.PIPE)
        for i in range(int(DUR * FPS)):
            p.stdin.write(frame_at(i / FPS).tobytes())
        p.stdin.close(); p.wait()
