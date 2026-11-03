"""ep57 demo v2, rebuilt from the owner's notes (2026-11-03 02:05–02:09):
- every cut on the downbeat 咚 (the kick: measured 68 vs 11–20 on the other beats), hard cuts with a punch-in, no dissolves;
- fast opening: Beijing → the whole Earth 「世界这么大！」, first-person up the airstairs on the beat 「今天，我们一起去看看！」,
  seven polaroids slam down one per beat 「世界新七大奇迹」, the title lands as the plane takes off;
- flights are a zoom: the finished polaroid shrinks into the globe, the camera pulls out and follows the plane, dives in through cloud;
- every stop ends with the photo coming out and developing, held so it can be seen (never skipped);
- a gold 「你」 bubble points at the character whenever it is on screen;
- cut: the pyramid / 8th slot, the 40,075 race and the 340 km, the plane-window globe, the screen curve over the album;
- 基督像: a wider frame so 你's torso is in the photo;
- finale: the seven photos slam into the album on seven beats in the last chorus.
Writes scratchpad sb57/demo2/ep57_demo_vN.mp4 (renders/audio never committed).  usage: demo_v2.py [vN] [t0 t1]"""
import os, sys, re, json, math, hashlib, subprocess, functools, time
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kf7 as K
B = K.B
from playwright.sync_api import sync_playwright

S, SB = K.S, K.SB; DEMO = f'{SB}/demo2'; LAY = f'{DEMO}/L'; os.makedirs(LAY, exist_ok=True)
MUS, VO = f'{S}/ep57music', f'{S}/ep57vo'
NM = '/home/claude/video/episodes/37-qiqing/remotion/node_modules'
FPS, W, H = 30, 1920, 1080
VER = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('v') else 'v2'
WIN = [float(x) for x in sys.argv[2:4]] if len(sys.argv) >= 4 else None
GOLD, CREAM, INK = K.GOLD, K.CREAM, K.INK

D = sorted(set(round(float(x), 3) for x in np.load(f'{MUS}/bed_down.npy')))
D = [d for i, d in enumerate(D) if i == 0 or d - D[i - 1] > .5]
BEAT = 0.418
def b(n, k=0): return D[n] + k * BEAT
END = D[93] + .6

def cl(x): return min(1.0, max(0.0, x))
def ease(x): x = cl(x); return x * x * (3 - 2 * x)
def out3(x): x = cl(x); return 1 - (1 - x) ** 3
def outback(x, s=1.7): x = cl(x) - 1; return 1 + (s + 1) * x ** 3 + s * x ** 2
def lerp(a, b_, u): return a + (b_ - a) * u

# ---------------- layers ----------------
TP = K.HEAD.replace('html,body{margin:0;background:#000}', 'html,body{margin:0;background:transparent}')
JOBS = {}
def lay(inner, transparent=False):
    html = (TP if transparent else K.HEAD) + inner + '</div></body></html>'
    p = f'{LAY}/{hashlib.md5(html.encode()).hexdigest()[:16]}.{"png" if transparent else "jpg"}'
    if not os.path.exists(p): JOBS[p] = (html, transparent)
    return p
def P(inner): return lay(inner)
def T(inner): return lay(inner, True)
def run_jobs(pg):
    for i, (p, (html, tr)) in enumerate(list(JOBS.items())):
        fn = f'{LAY}/_job.html'; open(fn, 'w').write(html)
        pg.goto('file://' + fn); pg.wait_for_timeout(100); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(40)
        if tr: pg.locator('#f').screenshot(path=p, omit_background=True)
        else: pg.locator('#f').screenshot(path=p, type='jpeg', quality=93)
        if i % 50 == 0: print(f'  layer {i + 1}/{len(JOBS)}', flush=True)
    JOBS.clear()
@functools.lru_cache(maxsize=80)
def load_rgb(p): return Image.open(p).convert('RGB')
@functools.lru_cache(maxsize=300)
def load_crop(p):
    im = Image.open(p).convert('RGBA'); bb = im.getchannel('A').point(lambda v: 255 if v > 3 else 0).getbbox()
    return (im.crop(bb), bb[0], bb[1]) if bb else (None, 0, 0)
def with_alpha(im, a):
    if a >= .999: return im
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * a))); return im
def zoom(img, z, f=(960, 540), dx=0.0, dy=0.0):
    hw, hh = 960 / z, 540 / z
    cx = 960 + (f[0] - 960) * (1 - 1 / z) + dx / z; cy = 540 + (f[1] - 540) * (1 - 1 / z) + dy / z
    cx = min(max(cx, hw), W - hw); cy = min(max(cy, hh), H - hh)
    if abs(z - 1) < 1e-4 and abs(cx - 960) < .01 and abs(cy - 540) < .01: return img.copy()
    return img.transform((W, H), Image.AFFINE, (1 / z, 0, cx - hw, 0, 1 / z, cy - hh), resample=Image.BILINEAR)
def paste(base, p, a=1.0, sc=1.0, pivot=None, off=(0, 0)):
    im, x0, y0 = load_crop(p)
    if im is None or a <= .001: return
    x0 += off[0]; y0 += off[1]
    if abs(sc - 1) > 1e-3:
        px, py = pivot or (x0 + im.width / 2, y0 + im.height / 2)
        im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.BILINEAR)
        x0, y0 = px + (x0 - px) * sc, py + (y0 - py) * sc
    im = with_alpha(im, a); base.paste(im, (int(round(x0)), int(round(y0))), im)
def punch(t, t0, amt=.07, d=.32): return 1 + amt * (1 - out3((t - t0) / d)) if t >= t0 else 1

class Pop:
    def __init__(s, p, t_in, kind='back', pivot=None, dur=None, t_out=None, off=(0, 0)):
        s.p, s.t, s.kind, s.pivot, s.t_out, s.off = p, t_in, kind, pivot, t_out, off
        s.dur = dur or {'back': .36, 'slam': .14, 'fade': .3}[kind]
    def draw(s, base, t):
        if t < s.t or (s.t_out is not None and t >= s.t_out): return
        u = (t - s.t) / s.dur
        if u >= 1: paste(base, s.p, off=s.off); return
        if s.kind == 'back': paste(base, s.p, cl(u / .3), .5 + .5 * outback(u), s.pivot, s.off)
        elif s.kind == 'slam': paste(base, s.p, cl(u / .35), 1.8 - .8 * out3(u), s.pivot, s.off)
        else: paste(base, s.p, ease(u), off=s.off)

# ---------------- scene crops (with soft padding where a frame runs past the photo) ----------------
CROP = dict(B.CROPS); CROP['christ'] = (-170, 1000, 1888, 2158)     # wider: 你's torso is in the frame
def crop_ext(im, box):
    x0, y0, x1, y1 = box; w, h = im.size
    if x0 >= 0 and y0 >= 0 and x1 <= w and y1 <= h: return im.crop(box)
    a = np.array(im.convert('RGB')); px, py = max(0, -x0, x1 - w), max(0, -y0, y1 - h)
    e = cv2.copyMakeBorder(a, py, py, px, px, cv2.BORDER_REFLECT)
    m = np.ones(e.shape[:2], np.float32); m[py:py + h, px:px + w] = 0; m = cv2.GaussianBlur(m, (0, 0), 25)[..., None]
    e = (e * (1 - m) + cv2.GaussianBlur(e, (0, 0), 18) * .75 * m).astype(np.uint8)
    return Image.fromarray(e).crop((x0 + px, y0 + py, x1 + px, y1 + py))
SC = {}
def scene(k):
    """1920x1080 crops: drawn with 你, drawn without, real photo, the fig alpha"""
    if k in SC: return SC[k]
    box = CROP[k]; o = {}
    for kind in ('fig', 'nofig', 'real'):
        p = f'{DEMO}/sc_{k}_{kind}.jpg'; o[kind] = p
        if not os.path.exists(p):
            if kind == 'real': im = Image.open(f'{SB}/comp_{k}.jpg').convert('RGB')
            else:
                im = Image.open(f'{SB}/vec/{k}_code.png').convert('RGBA')
                if kind == 'fig': im.alpha_composite(Image.open(f'{SB}/fig_{k}.png').convert('RGBA').resize(im.size, Image.LANCZOS))
                im = im.convert('RGB')
            crop_ext(im, box).resize((W, H), Image.LANCZOS).save(p, quality=93)
    v = Image.open(f'{SB}/vec/{k}_code.png'); f = Image.open(f'{SB}/fig_{k}.png').convert('RGBA').resize(v.size)
    fa = Image.new('L', v.size, 0); fa.paste(f.getchannel('A'))
    x0, y0, x1, y1 = box; fa2 = Image.new('L', (x1 - x0, y1 - y0), 0); fa2.paste(fa, (-x0, -y0))
    o['alpha'] = np.array(fa2.resize((W, H)))
    SC[k] = o; return o
def head_tip(alpha):
    """where the 你 bubble points: just above the head (arms removed by an erosion)"""
    ys, xs = np.nonzero(alpha > 40)
    if not len(ys): return None
    hgt = ys.max() - ys.min(); r = max(6, int(hgt * .07))
    er = cv2.erode((alpha > 40).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1)))
    ys, xs = np.nonzero(er)
    if not len(ys): return None
    top = ys.min(); band = xs[ys < top + r * 2]
    return (int(band.mean()), max(150, int(top - r - 18)))
def vf_for(fb, k):
    if k == 'christ': return (159, 6, 1761, 1074)
    cx, vw = 960, 1380
    if fb:
        ux0, ux1 = min(fb[0] - 50, 440), max(fb[2] + 50, 1480); vw = min(1500, max(1380, ux1 - ux0)); cx = (ux0 + ux1) / 2
    vh = vw * 2 / 3; cx = min(max(cx, vw / 2 + 20), 1900 - vw / 2); y0 = max(30, 515 - vh / 2)
    return (int(cx - vw / 2), int(y0), int(cx + vw / 2), int(y0 + vh))
def figbox(alpha):
    ys, xs = np.nonzero(alpha > 40); return (xs.min(), ys.min(), xs.max(), ys.max()) if len(xs) else None
def card_photo(k):
    """the photo in the polaroid = what is inside the viewfinder, real"""
    p = f'{DEMO}/card_{k}.jpg'
    if k == 'greatwall2': return f'{SB}/comp_greatwall2.jpg'
    if not os.path.exists(p):
        o = scene(k); vf = vf_for(figbox(o['alpha']), k)
        load_rgb(o['real']).crop(vf).resize((700, 467), Image.LANCZOS).save(p, quality=93)
    return p

# the 「你」 bubble (tail tip at 960,540; pasted with an offset to the head)
BUBBLE = None
def bubble_p():
    return T(svgw(f'<g filter="url(#ds)"><path d="M944,512 L960,540 L978,512 Z" fill="{GOLD}" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
                  f'<rect x="896" y="420" width="128" height="96" rx="30" fill="{GOLD}" stroke="{INK}" stroke-width="5"/>'
                  f'<rect x="940" y="508" width="40" height="10" fill="{GOLD}"/></g>'
                  f'<text x="960" y="490" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="66" fill="{INK}">你</text>'))
def draw_bubble(base, t, t_in, tip, t_out=None):
    if tip is None or t < t_in or (t_out is not None and t >= t_out): return
    u = (t - t_in) / .36; bob = 6 * math.sin((t - t_in) * 5.2)
    off = (tip[0] - 960, tip[1] - 540 + bob)
    a = 1.0 if t_out is None else cl((t_out - t) / .1)
    if u < 1: paste(base, BUBBLE, cl(u / .3) * a, .4 + .6 * outback(u), (tip[0], tip[1]), off)
    else: paste(base, BUBBLE, a, off=off)

svgw, img, page = K.svgw, K.img, K.page

# ---------------- shots ----------------
class Shot:
    def __init__(s, t0, t1, **kw): s.t0, s.t1 = t0, t1; s.__dict__.update(kw)
class Still(Shot):
    """continuous move (z0→z1, focus f0→f1) + a punch-in on the downbeat cut + timed pops"""
    def __init__(s, t0, t1, path, z0=1.0, z1=1.08, f0=(960, 540), f1=None, pops=(), pn=.07, after=None):
        super().__init__(t0, t1, path=path, z0=z0, z1=z1, f0=f0, f1=f1 or f0, pops=list(pops), pn=pn, after=after)
    def cam(s, t):
        u = cl((t - s.t0) / (s.t1 - s.t0)); e = ease(u) * .35 + u * .65
        return lerp(s.z0, s.z1, e) * punch(t, s.t0, s.pn), (lerp(s.f0[0], s.f1[0], e), lerp(s.f0[1], s.f1[1], e))
    def frame(s, t):
        z, f = s.cam(t); im = zoom(load_rgb(s.path), z, f)
        for p in s.pops: p.draw(im, t)
        if s.after: s.after(im, t)
        return im
class Walk(Still):
    def frame(s, t):
        ph = ((t - D[1]) / BEAT) % 1.0; bob = 14 * (1 - math.cos(2 * math.pi * ph)) / 2
        z, f = s.cam(t); im = zoom(load_rgb(s.path), z, f, dy=bob - 7)
        for p in s.pops: p.draw(im, t)
        return im
class Arrive(Still):
    """dive through cloud: zoom 1.28 → 1 (fast), the clouds rush past, white clears, board pops, stamp lands on the next downbeat"""
    def __init__(s, t0, t1, path, clouds, board, stamp_p, t_stamp, stamp_pivot=(1540, 520), board_pivot=(960, 720)):
        super().__init__(t0, t1, path, pn=0)
        s.clouds = clouds; s.pops = [Pop(board, t0 + .12, 'back', board_pivot), Pop(stamp_p, t_stamp, 'slam', stamp_pivot)]
    def frame(s, t):
        u = t - s.t0; z = 1.0 + .28 * (1 - out3(u / .75)) + .035 * cl((u - .75) / (s.t1 - s.t0))
        im = zoom(load_rgb(s.path), z, (960, 560))
        cu = out3(u / .7)
        if cu < 1: paste(im, s.clouds, 1 - cu * .9, 1 + 1.4 * cu, (960, 540))
        else: paste(im, s.clouds, .1, 2.4, (960, 540))
        v = .9 * (1 - ease(u / .35))
        if v > .005: im = Image.blend(im, Image.new('RGB', (W, H), (255, 255, 255)), v)
        for p in s.pops: p.draw(im, t)
        return im
class Frames(Shot):
    def __init__(s, t0, t1, paths, off=0.0, pops=(), after=None, pn=0):
        super().__init__(t0, t1, paths=paths, off=off, pops=list(pops), after=after, pn=pn)
    def frame(s, t):
        i = min(max(int(round((t - s.t0 + s.off) * FPS)), 0), len(s.paths) - 1)
        im = load_rgb(s.paths[i]); im = zoom(im, punch(t, s.t0, s.pn)) if s.pn else im.copy()
        for p in s.pops: p.draw(im, t)
        if s.after: s.after(im, t)
        return im

CAM = None
def camera_body():
    im = Image.new('RGBA', (920, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, 919, 299), 46, fill='#F1EADF', outline=INK, width=5)
    d.rounded_rectangle((3, 3, 916, 70), 40, fill='#E4DACB'); d.rounded_rectangle((60, 26, 860, 42), 8, fill=INK)
    d.ellipse((796, 106, 864, 174), fill='#D86B5A', outline=INK, width=5); d.rounded_rectangle((60, 110, 210, 170), 14, fill=INK)
    return im
def shadow_card(card):
    w, h = card.size; pad = 46; sh = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle((pad, pad + 14, pad + w, pad + h + 14), fill=(0, 0, 0, 120))
    sh = sh.filter(ImageFilter.GaussianBlur(17)); sh.alpha_composite(card, (pad, pad)); return sh
class Snap(Shot):
    """1 bar camera up (viewfinder, focus, 你 bubble) → 咔嚓 on the downbeat → card out of the slot (fast) → lifts →
       develops drawn → real → caption → held.  mode 'dev': the self-timer (card flies in from the camera on the rock)."""
    def __init__(s, t0, t1, k, tc, cap, mode='full', candle=False, origin=None, base=None):
        super().__init__(t0, t1, k=k, tc=tc, cap=cap, mode=mode, candle=candle, origin=origin, basep=base)
        o = scene(k); s.fb = figbox(o['alpha']); s.vf = vf_for(s.fb, k); s.tip = head_tip(o['alpha'])
    def prep(s):
        if hasattr(s, 'scene'): return
        o = scene(s.k); s.scene = load_rgb(o['fig']); s.base0 = load_rgb(s.basep) if s.basep else s.scene; vf = s.vf
        m = Image.new('L', (W, H), 255); ImageDraw.Draw(m).rectangle(vf, fill=0); m = m.filter(ImageFilter.GaussianBlur(5))
        s.vfimg = Image.composite(ImageEnhance.Brightness(s.scene.filter(ImageFilter.GaussianBlur(6))).enhance(.5), s.scene, m)
        dim = ImageEnhance.Brightness(s.base0.filter(ImageFilter.GaussianBlur(14))).enhance(.42)
        if s.candle:
            g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).ellipse((360, 160, 1560, 1100), fill=150); g = g.filter(ImageFilter.GaussianBlur(140))
            dim = Image.composite(Image.new('RGB', (W, H), (255, 176, 92)), dim, g.point(lambda v: int(v * .55)))
        s.dim = dim
        s.pd = s.scene.crop(vf).resize((700, 467), Image.LANCZOS); s.pr = load_rgb(card_photo(s.k))
        s.prd = ImageEnhance.Brightness(ImageEnhance.Color(s.pr).enhance(.5)).enhance(.85); s.dark = Image.new('RGB', (700, 467), '#3B342E')
    def overlay(s, base, t, a):
        if a <= .01: return
        o = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(o); L = 80; x0, y0, x1, y1 = s.vf
        for (x, y, dx, dy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
            x += 14 * dx; y += 14 * dy; d.line([(x, y + L * dy), (x, y), (x + L * dx, y)], fill=(255, 255, 255, 235), width=6, joint='curve')
        if s.fb:
            fx0, fy0, fx1, fy1 = s.fb; cx, cy = (fx0 + fx1) / 2, (fy0 + fy1) / 2
            r = 1 + .3 * (1 - ease((t - s.t0 - .15) / .3)); hw, hh = (fx1 - fx0) / 2 * r + 24, (fy1 - fy0) / 2 * r + 24
            hh = min(hh, cy - y0 - 10, y1 - cy - 10); hw = min(hw, cx - x0 - 10, x1 - cx - 10)
            d.rectangle((cx - hw, cy - hh, cx + hw, cy + hh), outline=(242, 198, 110, 235), width=4)
        if math.sin(t * 12) > -.2: d.ellipse((x0 + 50, y0 + 50, x0 + 72, y0 + 72), fill=(229, 72, 59, 240))
        o.putalpha(o.getchannel('A').point(lambda v: int(v * a))); base.paste(o, (0, 0), o)
    def card(s, u):
        k0 = 1.25 if s.candle else 1.0
        dr = ease((u - .38) / (.28 * k0)); re = ease((u - .72 * k0) / (.5 * k0))
        ph = Image.blend(s.dark, s.pd, dr)
        if re > 0: ph = Image.blend(ph, Image.blend(s.prd, s.pr, re), re)
        c = Image.new('RGBA', (760, 607), '#FBFAF6'); c.paste(ph, (30, 30))
        ca = ease((u - 1.2 * k0) / .3); im, _, _ = load_crop(s.cap)
        if im is not None and ca > 0:
            w = int(im.width * ca)
            if w > 0: part = im.crop((0, 0, w, im.height)); c.paste(part, ((760 - im.width) // 2, 607 - 30 - im.height - 8), part)
        return shadow_card(c)
    def final_card(s):
        s.prep(); c = s.card(9.0); c = c.resize((int(c.width * 1.32), int(c.height * 1.32)), Image.BILINEAR)
        return c.rotate(3, resample=Image.BICUBIC, expand=True)
    def frame(s, t):
        s.prep(); u = t - s.tc
        if u < 0:
            if s.mode == 'dev': im = s.base0.copy(); draw_bubble(im, t, s.t0 + .1, s.tip); return im
            a = ease((t - s.t0) / .3); z = 1.06 - .06 * a
            base = zoom(Image.blend(s.scene, s.vfimg, a), z)
            tip = None if s.tip is None else (960 + (s.tip[0] - 960) * z, 540 + (s.tip[1] - 540) * z)
            draw_bubble(base, t, s.t0 + .12, tip)
            s.overlay(base, t, a); base.paste(CAM, (500, int(1080 - 78 * a)), CAM)
            return base
        lift = ease((u - .28) / .40)
        base = Image.blend(s.vfimg if s.mode == 'full' else s.base0, s.dim, lift)
        if s.mode == 'full':
            s.overlay(base, t, 1 - ease((u - .2) / .25))
            cam_y = 1002 + 260 * lift; slot = cam_y + 34; ej = ease((u - .07) / .21)
            cy = (slot - 607 * ej + 303.5) * (1 - lift) + 539.5 * lift; cx = 960; sc = 1 + .32 * lift; rot = 3 * lift
        else:
            ox, oy = s.origin; e = out3((u - .07) / .5)
            cx, cy = ox + (960 - ox) * e, oy + (539.5 - oy) * e; sc = .15 + 1.17 * e; rot = 3 * e - 8 * (1 - e)
        c = s.card(u); c = c.resize((int(c.width * sc), int(c.height * sc)), Image.BILINEAR)
        if abs(rot) > .05: c = c.rotate(rot, resample=Image.BICUBIC, expand=True)
        base.paste(c, (int(cx - c.width / 2), int(cy - c.height / 2)), c)
        if s.mode == 'full' and lift < 1: base.paste(CAM, (500, int(cam_y)), CAM)
        return base

# ---------------- the globe (d3 in the page; zoom flights) ----------------
LL = {'gw': (116.02, 40.36), 'ci': (-88.568, 20.684), 'mp': (-72.545, -13.163), 'cr': (-43.211, -22.952), 'co': (12.492, 41.89), 'pe': (35.444, 30.329), 'tj': (78.042, 27.175)}
CC = {'gw': 'home', 'ci': 'mx', 'mp': 'pe', 'cr': 'br', 'co': 'it', 'pe': 'jo', 'tj': 'in'}
def v3(ll):
    lo, la = map(math.radians, ll); return np.array([math.cos(la) * math.cos(lo), math.cos(la) * math.sin(lo), math.sin(la)])
def slerp(a, b_, u):
    A, Bv = v3(a), v3(b_); om = math.acos(min(1, max(-1, A @ Bv)))
    if om < 1e-6: return a
    v = (math.sin((1 - u) * om) * A + math.sin(u * om) * Bv) / math.sin(om)
    return (math.degrees(math.atan2(v[1], v[0])), math.degrees(math.asin(max(-1, min(1, v[2])))))
def gdist(a, b_): return math.degrees(math.acos(min(1, max(-1, v3(a) @ v3(b_)))))
GLOBE_JOBS = []
def globe_frames(name, specs):
    tag = hashlib.md5((name + json.dumps(specs)).encode()).hexdigest()[:10]
    paths = [f'{LAY}/gl_{tag}_{i:03d}.jpg' for i in range(len(specs))]
    if not all(os.path.exists(p) for p in paths): GLOBE_JOBS.append((paths, specs))
    return paths
def flight_specs(a, b_, n, visited):
    dist = gdist(LL[a], LL[b_]); rout = min(1700, max(430, 46000 / max(dist, 20))); rin = 5200
    out = []
    for i in range(n):
        u = i / (n - 1); e = ease(u)
        r = math.exp(math.log(rin) + (math.log(rout) - math.log(rin)) * math.sin(math.pi * u) ** .65)
        c = slerp(LL[a], LL[b_], e)
        out.append(dict(c=c, r=r, arc=[LL[a], LL[b_]], p=e, pins=[dict(ll=LL[k], k=CC[k]) for k in visited + [b_]], dots=[LL[k] for k in visited]))
    return out
def globe_page():
    land = {}
    for res in ('50m', '110m'):
        f = f'{LAY}/land{res}.js'
        if not os.path.exists(f): open(f, 'w').write(f'window.L{res}=' + open(f'{NM}/world-atlas/land-{res}.json').read() + ';')
    pins = {c: K.pin(0, 0, c) for c in set(CC.values())}
    stars = ''.join(f'<circle cx="{(i * 397) % 1920}" cy="{(i * 211) % 1080}" r="{1 + (i % 3) * .6}" fill="#FFF" opacity="{.25 + (i % 5) * .1}"/>' for i in range(160))
    return (K.HEAD.replace('<style>', f'<script src="file://{NM}/d3-array/dist/d3-array.min.js"></script><script src="file://{NM}/d3-geo/dist/d3-geo.min.js"></script>'
                           f'<script src="file://{NM}/topojson-client/dist/topojson-client.min.js"></script><script src="file://{LAY}/land50m.js"></script><script src="file://{LAY}/land110m.js"></script><style>')
            + f'''<svg id="g" width="1920" height="1080" style="position:absolute;left:0;top:0">{K.DEFS}
<defs><radialGradient id="oc2" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#2E6A9E"/><stop offset="1" stop-color="#0D2742"/></radialGradient>
<linearGradient id="sp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070B16"/><stop offset="1" stop-color="#18213A"/></linearGradient></defs>
<rect width="1920" height="1080" fill="url(#sp2)"/>{stars}
<circle id="atm" cx="960" cy="560" r="10" fill="#5FA8E8" opacity=".2" filter="url(#blur30)"/><circle id="oc" cx="960" cy="560" r="10" fill="url(#oc2)"/>
<path id="grat" stroke="#FFF" stroke-opacity=".07" fill="none"/><path id="land" fill="#C8B48C" stroke="#E9D9B4" stroke-width="1.2"/>
<g id="dots"></g><path id="a0" stroke="{INK}" stroke-opacity=".55" stroke-width="11" fill="none" stroke-linecap="round"/>
<path id="a1" stroke="{GOLD}" stroke-width="18" fill="none" opacity=".35" filter="url(#blur8)"/><path id="a2" stroke="{GOLD}" stroke-width="6" fill="none" stroke-linecap="round"/>
<g id="pins"></g><g id="pl">{K.plane(0, 0, 0, 1.6)}</g></svg>
<script>
const PINS={json.dumps(pins)}; const LA=topojson.feature(L50m,L50m.objects.land), LB=topojson.feature(L110m,L110m.objects.land); const GR=d3.geoGraticule().step([30,30])();
function draw(s){{
 const pr=d3.geoOrthographic().rotate([-s.c[0],-s.c[1],0]).scale(s.r).translate([960,560]).clipAngle(90).precision(s.r>2000?0.15:0.3);
 const path=d3.geoPath(pr), vis=ll=>d3.geoDistance(ll,s.c)<Math.PI/2-0.03;
 for(const id of ['atm','oc']) document.getElementById(id).setAttribute('r', id=='atm'? s.r+30 : s.r);
 document.getElementById('land').setAttribute('d', path(s.r>1100?LA:LB)||''); document.getElementById('grat').setAttribute('d', path(GR)||'');
 let d='', pl=document.getElementById('pl');
 if(s.arc){{ const ip=d3.geoInterpolate(s.arc[0],s.arc[1]), n=Math.max(2,Math.ceil(90*s.p)), pts=[]; for(let i=0;i<=n;i++) pts.push(ip(s.p*i/n));
   d=path({{type:'LineString',coordinates:pts}})||''; const h=ip(s.p), q=pr(h), q0=pr(ip(Math.max(0,s.p-0.004))), q1=pr(ip(Math.min(1,s.p+0.004)));
   const ang=Math.atan2(q1[1]-q0[1],q1[0]-q0[0])*180/Math.PI; pl.setAttribute('transform','translate('+q[0]+','+q[1]+') rotate('+ang+')'); pl.style.opacity=(s.p<0.985&&vis(h))?1:0; }}
 else pl.style.opacity=0;
 for(const id of ['a0','a1','a2']) document.getElementById(id).setAttribute('d', d);
 document.getElementById('dots').innerHTML=(s.dots||[]).filter(vis).map(ll=>{{const q=pr(ll);return '<circle cx="'+q[0]+'" cy="'+q[1]+'" r="9" fill="{GOLD}"/>';}}).join('');
 document.getElementById('pins').innerHTML=(s.pins||[]).filter(p=>vis(p.ll)).map(p=>{{const q=pr(p.ll);return '<g transform="translate('+q[0]+','+q[1]+')">'+PINS[p.k]+'</g>';}}).join('');
}}
</script></div></body></html>''')
def render_globes(pg):
    if not GLOBE_JOBS: return
    fn = f'{LAY}/_globe.html'; open(fn, 'w').write(globe_page()); pg.goto('file://' + fn); pg.wait_for_timeout(600)
    for paths, specs in GLOBE_JOBS:
        for p, sp in zip(paths, specs):
            pg.evaluate(f'draw({json.dumps(sp)})'); pg.locator('#f').screenshot(path=p, type='jpeg', quality=92)
        print('  globe', len(paths), flush=True)
    GLOBE_JOBS.clear()

# ---------------- build ----------------
BUBBLE = bubble_p(); CAM = camera_body()
def big(text, col=CREAM, y=440, size=118):
    sh = 'text-shadow:0 0 30px rgba(14,8,5,.85),0 4px 8px rgba(14,8,5,.9)' if col == CREAM else 'text-shadow:0 2px 0 rgba(255,255,255,.6)'
    return T(f'<div style="position:absolute;left:0;right:0;top:{y}px;text-align:center;font-family:Noto Sans CJK SC;font-weight:900;font-size:{size}px;letter-spacing:.04em;color:{col};{sh};white-space:nowrap">{text}</div>')
def cap_p(text): return T(f'<div style="position:absolute;left:20px;top:20px;font-family:\'LXGW WenKai\';font-weight:700;font-size:44px;color:#5A4E44;white-space:nowrap">{text}</div>')
VOF = {'chichen': '01_mx.mp3', 'machu2': '02_pe.mp3', 'christ': '03_br.mp3', 'colosseum': '04_it.mp3', 'petra2': '05_jo.mp3', 'taj': 'r2_06_in_b.mp3', 'home': 'r2_07_cn.mp3'}
VOICES, CLICKS, STAMPS, SH, SUBS, HUDK = [], [], [], [], [], []
CLOUDS = T(svgw(K.clouds()))
def sub(t0, t1, text, align='l', top=None): SUBS.append((t0 + .1, t1 - .08, text, align, top))

# --- opening (fast: a cut on every downbeat, slams on every beat) ---
o1 = []
for i in range(int(round(D[1] * FPS)) + 2):
    t = i / FPS; u = out3(t / (D[0] + .55)); r = math.exp(lerp(math.log(9000), math.log(470), u)) - 40 * cl((t - D[0] - .55) / 1.2)
    o1.append(dict(c=slerp(LL['gw'], (95, 18), ease(t / D[1])), r=r, pins=[dict(ll=LL['gw'], k='home')], dots=[]))
SH.append(Frames(0, D[1], globe_frames('open', o1), pops=[Pop(big('世界这么大！'), D[0], 'back', (960, 500))]))
SH.append(Walk(D[1], D[2], P(svgw(K.airstairs())), 1.0, 1.38, (960, 330), pops=[Pop(big('今天，我们一起去看看！', y=640, size=100), D[1] + .05, 'back', (960, 700))]))
kraft = ('<rect width="1920" height="1080" fill="#E9DCC3"/>' + ''.join(f'<circle cx="{(i * 733) % 1920}" cy="{(i * 389) % 1080}" r="{2 + i % 4}" fill="#D8C8AA" opacity=".6"/>' for i in range(220))
         + '<rect width="1920" height="1080" fill="none" stroke="#B9A47F" stroke-width="40" opacity=".25" filter="url(#blur30)"/>')
STOPS = [('chichen', '奇琴伊察'), ('machu2', '马丘比丘'), ('christ', '基督像'), ('colosseum', '斗兽场'), ('petra2', '佩特拉'), ('taj', '泰姬陵'), ('greatwall2', '长城')]
POS = [(250, 330, -8), (640, 300, 5), (1030, 330, -4), (1420, 300, 7), (440, 650, 6), (830, 680, -6), (1220, 650, 4)]
slams = []
for i, ((k, nm), (x, y, r)) in enumerate(zip(STOPS, POS)):
    src = scene(k)['nofig'] if k != 'greatwall2' else K.drawn('greatwall2', fig=False)
    slams.append(Pop(T(K.polaroid_html(src, x, y, 280, rot=r, caption=nm)), D[2] + i * BEAT, 'slam', (x + 155, y + 140), dur=.12))
SH.append(Still(D[2], D[4], P(svgw(kraft)), 1.0, 1.06, (960, 600), pops=[Pop(big('世界新七大奇迹', INK, y=70, size=104), D[2], 'back', (960, 130))] + slams))
sky = ('<defs><linearGradient id="dk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26304F"/><stop offset=".7" stop-color="#E08E57"/><stop offset="1" stop-color="#F6C27F"/></linearGradient></defs>'
       '<rect width="1920" height="1080" fill="url(#dk3)"/><rect y="860" width="1920" height="220" fill="#232733"/>'
       + ''.join(f'<line x1="{960 + (x - 960) * .2}" y1="870" x2="{x}" y2="1080" stroke="#FFD27A" stroke-width="3" stroke-dasharray="6 26" opacity=".7"/>' for x in range(-400, 2400, 400)))
planeL = T(svgw('<g transform="translate(960,540) rotate(-14) scale(1.4)" fill="#0D111C"><path d="M-300,0 L260,-18 C320,-18 340,0 320,18 L-260,36Z"/><path d="M-20,8 L-140,-110 L-80,-110 L120,6Z"/><path d="M-20,26 L-200,140 L-140,140 L120,26Z"/><path d="M-260,10 L-320,-80 L-280,-80 L-200,6Z"/></g>'))
titleL = T(svgw(f'<text x="960" y="400" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="116" fill="{GOLD}" filter="url(#ds)">新世界七大奇迹，</text>'
                f'<text x="960" y="556" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="116" fill="{GOLD}" filter="url(#ds)">你去过几个？</text>'))
def takeoff_after(im, t):
    u = (t - D[4]) / (D[6] - D[4]); e = ease(u)
    paste(im, planeL, 1, .45 + .55 * e, (960, 540), off=(lerp(-760, 820, e), lerp(400, 190, e)))
SH.append(Still(D[4], D[6], P(svgw(sky)), 1.0, 1.07, (960, 600), pops=[Pop(titleL, D[4], 'slam', (960, 480), dur=.16)], after=takeoff_after))
SHAKES = [D[2] + i * BEAT for i in range(7)]

# --- the stops ---
LEGS = [12772, 16923, 20202, 29405, 31823, 35967, 39735]
CODES = ['ci', 'mp', 'cr', 'co', 'pe', 'tj', 'gw']
ARRD = {a[0]: a for a in K.ARR}
HIST = {
 'chichen': [('chichen_calendar', '玛雅人的神庙，也是一本[石头日历]：\n台阶加顶上平台，正好365级。', (1.0, 1.12, (960, 520))),
             ('chichen_serpent', '每年春分秋分，影子会变成\n一条[蛇]，从台阶上爬下来。', (1.14, 1.02, (1150, 600)))],
 'machu2': [('machu_palace', '它可能是印加皇帝的[山顶行宫]，\n建在两千多米高的山上。', (1.0, 1.12, (700, 600))),
            ('machu_hidden', '后来西班牙人征服了印加，\n却一直[没找到]它。', (1.14, 1.0, (1100, 640)))],
 'christ': [('christ_1922', '1922年，里约人觉得这座城\n越来越[不信神]了，', (1.0, 1.08, (700, 640))),
            ('christ_1922', '于是大家[捐钱]，\n在山顶立起了它。', (1.45, 1.3, (1340, 330)))],
 'colosseum': [('colosseum_nero_lake', '这块地，原来是暴君尼禄的\n[私人湖]。', (1.0, 1.1, (1000, 560))),
               ('colosseum_return', '新皇帝把湖填了，建起斗兽场：\n[还给罗马人民]。', (1.14, 1.0, (1100, 520)))],
 'petra2': [('petra_caravan', '两千年前，运香料的骆驼队\n都要经过这里。', (1.0, 1.12, (1200, 560))),
            ('petra_tax', '纳巴泰人收[过路税]发了财，\n把城刻进了石头里。', (1.14, 1.0, (1050, 600)))],
 'taj': [('taj_build', '皇后生第14个孩子时去世，\n皇帝为她修了[二十多年]。', (1.0, 1.1, (1400, 560))),
         ('taj_fort', '晚年他被软禁，只能[远远望着]它；\n死后，葬在了她身边。', (1.14, 1.0, (1000, 600)))]}
def hist_p(name):
    f = f'{SB}/hist/{name}.png'; return P(img(f'{f}?v={int(os.path.getmtime(f))}') + '<div style="position:absolute;inset:0;background:radial-gradient(ellipse 1150px 520px at 0% 0%, rgba(14,8,5,.5), rgba(14,8,5,0))"></div>')
def vo_len(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{VO}/{f}'], capture_output=True, text=True).stdout)
SNAPS = []
def flight(i, F, prev_snap):
    a, b_ = (['gw'] + CODES)[i], CODES[i]; n = int(round((D[F + 1] - D[F]) * FPS)) + 2
    paths = globe_frames(f'fl{i}', flight_specs(a, b_, n, (['gw'] + CODES)[:i + 1]))
    t0, t1 = D[F], D[F + 1]
    def after(im, t, ps=prev_snap, t0=t0, t1=t1):
        if ps is not None:                                   # the finished polaroid shrinks into the globe
            u = (t - t0) / .42
            if u < 1:
                c = ps.final_card(); sc = 1 - .93 * ease(u); cc = c.resize((max(1, int(c.width * sc)), max(1, int(c.height * sc))), Image.BILINEAR)
                cc = with_alpha(cc, 1 - ease((u - .7) / .3)); im.paste(cc, (int(960 - cc.width / 2), int(560 - cc.height / 2)), cc)
        v = (t - (t1 - .3)) / .3                             # cloud rush + white into the dive
        if v > 0:
            paste(im, CLOUDS, ease(v), .7 + 1.6 * ease(v), (960, 540))
            im.paste(Image.blend(im, Image.new('RGB', (W, H), (255, 255, 255)), .9 * ease(v)))
    SH.append(Frames(t0, t1, paths, after=after))
for i, F in enumerate([6, 18, 30, 42, 54, 66]):
    k = STOPS[i][0]; flight(i, F, SNAPS[-1] if SNAPS else None)
    _, zh, local, font, st, col = ARRD[k]; bg, pop, pop2 = K.arrival_parts(k, zh, local, font, st, col)
    bg = img(scene(k)['nofig'], 'filter:brightness(1.04)')
    VOICES.append((D[F + 1] + .15, VOF[k])); STAMPS.append(D[F + 2])
    SH.append(Arrive(D[F + 1], D[F + 3], P(bg), CLOUDS, T(pop.replace('<div class="pop">', '<div>')), T(pop2.replace('<div class="pop2">', '<div>')), D[F + 2]))
    sub(D[F + 1] + .3, D[F + 3], K.SUB_ARR[i][0] + '\n' + K.SUB_ARR[i][1])
    for j, (name, line, (z0, z1, f)) in enumerate(HIST[k]):
        t0, t1 = D[F + 3 + 3 * j], D[F + 6 + 3 * j]
        SH.append(Still(t0, t1, hist_p(name), z0, z1, f))
        sub(t0, t1, line)
    t0, tc, t1 = D[F + 9], D[F + 10], D[F + 12]; CLICKS.append(tc)
    cap = cap_p(f'{STOPS[i][1]} · {i + 1}/7')
    if k == 'machu2':
        timer_nonum = re.sub(r'<text x="1500".*?</text>', '', K.timer); tb = P(img(scene(k)['fig']) + svgw(timer_nonum))
        NUM = lambda n: T(svgw(f'<text x="1500" y="560" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="260" fill="#FFFFFF" opacity=".95" stroke="{INK}" stroke-width="6">{n}</text>'))
        tn = [t0 + BEAT, t0 + 2 * BEAT, t0 + 3 * BEAT, tc]
        s = Snap(t0, t1, k, tc, cap, mode='dev', origin=(330, 880), base=tb)
        s.pops = [Pop(NUM(n), tn[m], 'slam', (1500, 470), t_out=tn[m + 1]) for m, n in enumerate((3, 2, 1))]
        sub(t0, tc, '倒计时3、2、1——[跳]！')
    else:
        s = Snap(t0, t1, k, tc, cap, candle=(k == 'petra2'))
    SNAPS.append(s); SH.append(s)
# --- home: 长城 ---
flight(6, 78, SNAPS[-1])
home_bg = P(img(K.drawn('greatwall2', fig=False)))
home_board = T('<div style="position:absolute;left:150px;top:420px;width:620px;padding:22px 30px 26px;border-radius:18px;background:rgba(18,30,52,.9);border-top:8px solid #F2C66E;text-align:center">'
               '<div style="font-family:Noto Sans CJK SC;font-weight:700;font-size:24px;letter-spacing:4px;color:#F2C66E">✈ 到达 ARRIVALS</div><div style="font-family:Noto Sans CJK SC;font-weight:900;font-size:92px;color:#FFF">欢迎回家</div></div>')
home_stamp = T(svgw(K.stamp('中国', '欢迎回家', 1540, 470, rot=-10, col='#C0392B')))
VOICES.append((D[79] + .12, VOF['home'])); STAMPS.append(b(79, 3))
SH.append(Arrive(D[79], D[80], home_bg, CLOUDS, home_board, home_stamp, b(79, 3), (1540, 470), (460, 540)))
sub(D[79] + .25, D[80] + .9, '最后一站：\n回家，[长城]！')
PX, PY = 520, 158
def gw_tip(ts):
    vw = 2576 - 100 * ease(ts / 1.67) if ts < 1.67 else 2476 + 1140 * ease((ts - 1.67) / .73) - 110 * ease((ts - 2.4) / .9)
    sc = 1920 / vw; vx, vy = PX + 1288 - vw / 2, PY + 858.5 - vw * 9 / 32
    return ((2350 - vx) * sc, (1249 - 230 - vy) * sc)
def gw_after(im, t):
    ts = t - D[80]
    if ts < 3.30: draw_bubble(im, t, D[80] + .1, gw_tip(ts), t_out=D[82])
SH.append(Frames(D[80], D[84], [f'{SB}/snap/f/{i:04d}.jpg' for i in range(200)], after=gw_after)); CLICKS.append(D[82])
# --- finale: the album fills on seven beats ---
def album_bg():
    s = ['<defs><linearGradient id="tray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9CDD3"/><stop offset="1" stop-color="#9EA4AC"/></linearGradient>'
         '<linearGradient id="seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B4A63"/><stop offset="1" stop-color="#2A3548"/></linearGradient></defs>',
         '<rect width="1920" height="1080" fill="url(#seat)"/><path d="M60,330 L1860,330 L1920,1080 L0,1080 Z" fill="url(#tray)"/><rect x="110" y="300" width="1700" height="50" rx="12" fill="#B4BAC2"/>',
         '<g filter="url(#ds)"><rect x="180" y="360" width="790" height="660" rx="10" fill="#F6EEDC"/><rect x="950" y="360" width="790" height="660" rx="10" fill="#F3EAD6"/></g><rect x="945" y="360" width="30" height="660" fill="#E2D6BC"/>',
         f'<text x="960" y="200" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="84" fill="{GOLD}">我的新七大奇迹</text>']
    for i, (x, y) in enumerate(SLOTS[:7]):
        s.append(f'<rect x="{x}" y="{y}" width="330" height="270" rx="8" fill="none" stroke="#B9AA8E" stroke-width="4" stroke-dasharray="14 10"/>'
                 f'<text x="{x + 165}" y="{y + 150}" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="44" fill="#B9AA8E">{i + 1}</text>')
    return svgw(''.join(s))
SLOTS = [(215 + pg * 770 + c * 370, 400 + r * 310) for pg in range(2) for r in range(2) for c in range(2)]
STAMPC = [('墨西哥', 'MÉXICO · 入境', '#C0392B'), ('秘鲁', 'PERÚ · 入境', '#1F5FA8'), ('巴西', 'BRASIL · 入境', '#2E7D4F'), ('意大利', 'ITALIA · 入境', '#C0392B'),
          ('约旦', 'JORDAN · 入境', '#7A3E9D'), ('印度', 'INDIA · 入境', '#D07A1F'), ('中国', '欢迎回家', '#C0392B')]
def slot_layer(i):
    x, y = SLOTS[i]; k, stk, capt = K.STOPS[i][0], K.STOPS[i][2], K.STOPS[i][3]
    a, b_, col = STAMPC[i]
    sv = (K.tape(x + 40, y + 6, rot=-24) + K.tape(x + 300, y + 6, rot=22) + K.sticker(stk, x + 300, y + 230, .9, [-12, 10, -8, 14, -10, 8, -6][i])
          + K.stamp(a, b_, x + 250, y + 40, rot=[-14, 10, -6, 12, 8, -10, 6][i], s=.5, col=col))
    return K.polaroid_html(card_photo(k), x, y, 300, rot=[-3, 2, -2, 3, 2, -3, 2][i], caption=capt) + svgw(sv)
ticket = ('<g transform="translate(1515,840) rotate(4)" filter="url(#ds)"><rect x="-150" y="-110" width="300" height="220" rx="14" fill="#FBF3E2"/><rect x="-150" y="-110" width="300" height="48" rx="14" fill="#C0392B"/>'
          '<text x="0" y="-77" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="800" font-size="22" fill="#FFF6E6">登机牌 · 全程</text>'
          f'<text x="0" y="-8" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="58" fill="{INK}">39,735</text>'
          '<text x="0" y="30" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="700" font-size="24" fill="#8A7D6C">公里 · 7 站</text>'
          '<text x="0" y="78" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="28" fill="#C0392B">北京 → 北京</text></g>')
ab = P(album_bg()); sl = [T(slot_layer(i)) for i in range(7)]; tk = T(svgw(ticket))
fills = [Pop(sl[i], D[84] + i * BEAT, 'slam', (SLOTS[i][0] + 165, SLOTS[i][1] + 135), dur=.12) for i in range(7)] + [Pop(tk, D[86], 'slam', (1515, 840), dur=.14)]
SHAKES += [D[84] + i * BEAT for i in range(7)] + [D[86]]
SH.append(Still(D[84], D[87], ab, 1.0, 1.04, (960, 620), pops=fills))
sub(D[85], D[87], '这一圈，你的7张[打卡照]。\n截图存好！', 'l', 60)
SH.append(Still(D[87], D[89], ab, 1.04, 1.12, (960, 640), pops=[Pop(p_, D[87] - 9, 'fade', dur=.01) for p_ in sl + [tk]]))
sub(D[87], D[89], '你去过几个？评论区打个数字👇\n真去过的，晒出你的照片！', 'l', 60)
end_html = K.end.replace(K.sv + K.ht, '')
SH.append(Still(D[89], END, P('<div style="position:absolute;inset:0;background:#241A13"></div><div style="position:absolute;inset:0;opacity:.3"><img src="file://' + ab + '" style="width:1920px;height:1080px"></div>' + end_html), 1.0, 1.04))
for a_, b2 in zip(SH, SH[1:]): assert abs(a_.t1 - b2.t0) < 1e-6, (a_.t1, b2.t0)

# ---------------- subtitles ----------------
class Sub:
    def __init__(s, t0, t1, text, align='l', top=None):
        rows = text.split('\n'); s.t0, s.t1 = t0, t1; top = top if top is not None else (120 if align == 'c' else 132)
        s.p = T(K.subs_c(rows, top) if align == 'c' else K.subs(rows, top)); s.top = top
        s.n = [len(re.sub(r'[\[\]]', '', r)) for r in rows]; s.dur = [min(.55, max(.2, .032 * n)) for n in s.n]
    def prep(s):
        im, x0, y0 = load_crop(s.p); s.im, s.x0, s.y0 = im, x0, y0; a = np.array(im.getchannel('A')); s.bands = []
        for r in range(len(s.n)):
            ya = int(s.top + 97.5 * r + 8 - y0) if r else 0; yb = int(s.top + 97.5 * (r + 1) + 8 - y0) if r < len(s.n) - 1 else a.shape[0]
            ya, yb = max(0, ya), min(a.shape[0], yb); cols = np.nonzero(a[ya:yb].max(0) > 40)[0]
            s.bands.append((ya, yb, cols.min() if len(cols) else 0, cols.max() if len(cols) else a.shape[1]))
        s.a0 = a.astype(np.float32)
    def draw(s, base, t):
        if not (s.t0 <= t < s.t1): return
        if not hasattr(s, 'im'): s.prep()
        fade = cl((s.t1 - t) / .1); u = t - s.t0; M = np.zeros_like(s.a0); st = 0.0; xs = np.arange(s.a0.shape[1], dtype=np.float32)
        for (ya, yb, c0, c1), d in zip(s.bands, s.dur):
            rx = c0 - 30 + (c1 - c0 + 90) * cl((u - st) / d); st += d + .05; M[ya:yb] = np.clip((rx - xs) / 40 + 1, 0, 1)[None, :]
        im = s.im.copy(); im.putalpha(Image.fromarray((s.a0 * M * fade).astype(np.uint8)))
        base.paste(im, (s.x0, s.y0 + int(16 * (1 - out3(u / .3)))), im)
SUBO = [Sub(*x) for x in SUBS]

# ---------------- HUD ----------------
def roll(a, b_, t, t0, t1): return int(round(a + (b_ - a) * ease((t - t0) / (t1 - t0))))
FL = [6, 18, 30, 42, 54, 66, 78]
def hud_state(t):
    if t < D[6] or t >= D[89]: return None
    n, hot, km = 0, False, 0
    for i, F in enumerate(FL):
        if t < D[F]: break
        prev = LEGS[i - 1] if i else 0
        km = roll(prev, LEGS[i], t, D[F], D[F + 1]) if t < D[F + 1] else LEGS[i]
        n = i; hot = False
        tc = CLICKS[i]
        if t >= tc: n, hot = i + 1, True
    return (n, hot, km)
def odo3(km): return T(f'<div style="position:absolute;left:150px;bottom:62px;color:{CREAM};font-family:Noto Sans CJK SC;text-shadow:0 0 14px rgba(14,8,5,.85);display:flex;align-items:baseline;gap:12px">'
                       f'<span style="font-size:32px;font-weight:700">已飞</span><span style="font-size:70px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1">{km:,}</span><span style="font-size:32px;font-weight:700;opacity:.85">公里</span></div>')
@functools.lru_cache(maxsize=None)
def counter_p(n, hot): return T(B.counter(n, hot))
@functools.lru_cache(maxsize=None)
def odo_p(km): return odo3(km)
SEAL_P = T(B.SEALD)

# ---------------- audio ----------------
def mix(out):
    import pyloudnorm as pyln, warnings; warnings.filterwarnings('ignore')
    bed, sr = sf.read(f'{MUS}/bed_v1.wav'); n = int(END * sr); m = bed[:n].copy(); meter = pyln.Meter(sr)
    fo = int(1.0 * sr); m[-fo:] *= np.linspace(1, 0, fo)[:, None]
    for t, f in VOICES:
        w = f'{DEMO}/vo_{f}.wav'; subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{VO}/{f}', '-ac', '1', '-ar', str(sr), w], check=True)
        v, _ = sf.read(w); v = pyln.normalize.loudness(v, meter.integrated_loudness(v), -15.0); v = .5 * np.tanh(v / .5)
        i = int(t * sr); v = v[:n - i]; m[i:i + len(v)] += v[:, None]
    sh, ssr = sf.read(f'{S}/sfx/shutter_iphone_style.wav'); sh = sh.mean(1) if sh.ndim > 1 else sh
    if ssr != sr: sh = np.interp(np.arange(int(len(sh) * sr / ssr)) / sr, np.arange(len(sh)) / ssr, sh)
    for t in CLICKS: i = int(t * sr) - int(.003 * sr); m[i:i + len(sh)] += (sh * .45)[:, None]
    q = int(.22 * sr); tt = np.arange(q) / sr; rng = np.random.default_rng(5)
    thud = (np.sin(2 * np.pi * (95 - 40 * tt) * tt) * np.exp(-tt / .045) * .55 + np.convolve(rng.normal(0, 1, q) * np.exp(-tt / .012), np.ones(24) / 24, 'same') * .5) * .3
    for t in STAMPS: i = int(t * sr); m[i:i + q] += thud[:, None]
    pk = np.abs(m).max()
    if pk > .89: m *= .89 / pk
    sf.write(out, m.astype(np.float32), sr); print('mix peak', round(20 * np.log10(np.abs(m).max()), 2), 'LUFS', round(meter.integrated_loudness(m), 1))

# ---------------- compose ----------------
def shot_at(t):
    for i, s in enumerate(SH):
        if s.t0 <= t < s.t1: return i
    return len(SH) - 1
RNG = np.random.default_rng(11)
def compose(t):
    s = SH[shot_at(t)]; im = s.frame(t)
    for p in getattr(s, 'pops', []) if isinstance(s, Snap) else []: p.draw(im, t)
    sh = [x for x in SHAKES + [c for c in CLICKS if abs(c - D[82]) > .01] if 0 <= t - x < .12]
    if sh:
        a = 1 - (t - sh[0]) / .12; im = zoom(im, 1.012, dx=RNG.uniform(-7, 7) * a, dy=RNG.uniform(-7, 7) * a)
    for su in SUBO: su.draw(im, t)
    hs = hud_state(t)
    if hs:
        paste(im, counter_p(hs[0], hs[1])); paste(im, odo_p(hs[2])); paste(im, SEAL_P)
    for c in CLICKS:
        if abs(c - D[82]) < .01: continue
        if c <= t < c + .07: im = Image.new('RGB', (W, H), (0, 0, 0))
        elif c + .07 <= t < c + .36: im = Image.blend(im, Image.new('RGB', (W, H), (255, 255, 255)), 1 - ease((t - c - .07) / .29))
    if t > END - 1.0: im = Image.blend(im, Image.new('RGB', (W, H), (0, 0, 0)), ease((t - END + 1.0) / 1.0))
    return im

if __name__ == '__main__':
    for s in SH: print(f'{s.t0:7.2f} {s.t1:7.2f} {type(s).__name__:6s} {getattr(s, "k", "")}')
    print('clicks', [round(c, 2) for c in CLICKS], 'END', round(END, 2))
    t0, t1 = WIN or (0, END); frames = [i / FPS for i in range(int(t0 * FPS), int(min(t1, END) * FPS))]
    for t in frames:
        hs = hud_state(t)
        if hs: counter_p(hs[0], hs[1]); odo_p(hs[2])
    with sync_playwright() as pw:
        br = pw.chromium.launch(); pg = br.new_page(viewport={'width': W, 'height': H})
        print('layers', len(JOBS), 'globe sets', len(GLOBE_JOBS), flush=True); run_jobs(pg); render_globes(pg); br.close()
    wav = f'{DEMO}/mix_{VER}.wav'; mix(wav)
    tag = VER + (f'_{t0:.0f}-{t1:.0f}' if WIN else ''); out = f'{DEMO}/ep57_demo_{tag}_hd.mp4'
    pr = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-ss', f'{t0:.3f}', '-t', f'{len(frames) / FPS:.3f}', '-i', wav, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19',
                           '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], stdin=subprocess.PIPE)
    st = time.time()
    for j, t in enumerate(frames):
        pr.stdin.write(compose(t).tobytes())
        if j % 300 == 0: print(f'  t={t:6.2f}  {j}/{len(frames)}  {time.time() - st:.0f}s', flush=True)
    pr.stdin.close(); pr.wait(); print('wrote', out)
