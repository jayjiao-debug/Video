"""ep57 rendered demo (owner 2026-11-03: 「give me a rendered demo, with the other scenes filled in」).
Animates the kf7 key frames on the extended BGM (bed_v1, 162.33 s):
- every cut on a bed downbeat (or a beat inside the bar), title on the verse start 7.87, 「39,735」 on bar 48 at 135.42;
- slow pushes on stills; arrivals dive in through cloud (board pops, the passport stamp lands on a beat after the voice);
- globe hops drawn live (the gold arc draws, the plane flies it, the odometer rolls);
- the 拍立得 moments, varied per stop: viewfinder → 咔嚓 → the card comes out of the slot → develops drawn → real;
  马丘比丘 is the self-timer 3·2·1 jump; 基督像 and 斗兽场 are click-and-flash straight into the next flight; 长城 reuses
  the snap_test sequence;
- typed subtitles (row 1 types, row 2 follows), the counter / odometer / seal HUD;
- audio: the bed unprocessed, the AI 「XXX欢迎你」 voices, the shutter click (only the click), a soft stamp thud.
Writes scratchpad sb57/demo/ep57_demo_vN.mp4 (renders, audio and video are never committed).
usage: demo_render.py [vN] [t0 t1]"""
import os, sys, re, json, math, hashlib, subprocess, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kf7 as K
B = K.B
from playwright.sync_api import sync_playwright

S = K.S; SB = K.SB; DEMO = f'{SB}/demo'; LAY = f'{DEMO}/L'; os.makedirs(LAY, exist_ok=True)
MUS = f'{S}/ep57music'; VO = f'{S}/ep57vo'
FPS, W, H = 30, 1920, 1080
VER = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('v') else 'v1'
WIN = [float(x) for x in sys.argv[2:4]] if len(sys.argv) >= 4 else None

# ---------------- music grid ----------------
D = sorted(set(round(float(x), 3) for x in np.load(f'{MUS}/bed_down.npy')))
D = [d for i, d in enumerate(D) if i == 0 or d - D[i - 1] > .5]
BEAT = 0.418
def b(n, k=0): return D[n] + k * BEAT
BEATS = sorted(set([round(D[n] + k * BEAT, 3) for n in range(len(D)) for k in range(4)]))
def next_beat(t): return min(x for x in BEATS if x >= t)
END = 162.33

# ---------------- easing ----------------
def cl(x): return min(1.0, max(0.0, x))
def ease(x): x = cl(x); return x * x * (3 - 2 * x)
def out3(x): x = cl(x); return 1 - (1 - x) ** 3
def outback(x, s=1.7): x = cl(x); x -= 1; return 1 + (s + 1) * x ** 3 + s * x ** 2
def span(t, a, b_): return ease((t - a) / (b_ - a))

# ---------------- layer rendering (Playwright, cached by content hash) ----------------
TP = K.HEAD.replace('html,body{margin:0;background:#000}', 'html,body{margin:0;background:transparent}')
JOBS = {}
def lay(inner, transparent=False, full=False):
    html = inner if full else ((TP if transparent else K.HEAD) + inner + '</div></body></html>')
    h = hashlib.md5(html.encode()).hexdigest()[:16]
    p = f'{LAY}/{h}.{"png" if transparent else "jpg"}'
    if not os.path.exists(p): JOBS[p] = (html, transparent)
    return p
def run_jobs(pg):
    for i, (p, (html, tr)) in enumerate(list(JOBS.items())):
        fn = f'{LAY}/_job.html'; open(fn, 'w').write(html)
        pg.goto('file://' + fn); pg.wait_for_timeout(120); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(40)
        if tr: pg.locator('#f').screenshot(path=p, omit_background=True)
        else: pg.locator('#f').screenshot(path=p, type='jpeg', quality=93)
        if i % 40 == 0: print(f'  layer {i + 1}/{len(JOBS)}', flush=True)
    JOBS.clear()
def P(inner): return lay(inner)                       # opaque full frame
def T(inner): return lay(inner, transparent=True)     # transparent overlay

# ---------------- image helpers ----------------
@functools.lru_cache(maxsize=96)
def load_rgb(p): return Image.open(p).convert('RGB')
@functools.lru_cache(maxsize=256)
def load_crop(p):
    im = Image.open(p).convert('RGBA'); bb = im.getchannel('A').point(lambda v: 255 if v > 3 else 0).getbbox()
    if not bb: return None, 0, 0
    return im.crop(bb), bb[0], bb[1]
def with_alpha(im, a):
    if a >= .999: return im
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * a))); return im
def zoom(img, z, f=(960, 540), dy=0.0):
    fx, fy = f
    cx = 960 + (fx - 960) * (1 - 1 / z); cy = 540 + (fy - 540) * (1 - 1 / z) + dy / z
    hw, hh = 960 / z, 540 / z
    cx = min(max(cx, hw), W - hw); cy = min(max(cy, hh), H - hh)
    if abs(z - 1) < 1e-4 and abs(cx - 960) < .01 and abs(cy - 540) < .01: return img.copy()
    return img.transform((W, H), Image.AFFINE, (1 / z, 0, cx - hw, 0, 1 / z, cy - hh), resample=Image.BILINEAR)
def paste(base, p, a=1.0, sc=1.0, pivot=None):
    im, x0, y0 = load_crop(p)
    if im is None or a <= 0.001: return
    if abs(sc - 1) > 1e-3:
        px, py = pivot or (x0 + im.width / 2, y0 + im.height / 2)
        im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.BILINEAR)
        x0, y0 = px + (x0 - px) * sc, py + (y0 - py) * sc
    im = with_alpha(im, a); base.paste(im, (int(round(x0)), int(round(y0))), im)

class Pop:
    """an overlay that appears at t_in: 'back' (pops with overshoot), 'slam' (stamps down), 'fade'"""
    def __init__(s, p, t_in, kind='back', pivot=None, dur=None, t_out=None):
        s.p, s.t, s.kind, s.pivot, s.t_out = p, t_in, kind, pivot, t_out
        s.dur = dur or {'back': .38, 'slam': .14, 'fade': .3}[kind]
    def draw(s, base, t):
        if t < s.t or (s.t_out is not None and t >= s.t_out): return
        u = (t - s.t) / s.dur
        if u >= 1: paste(base, s.p); return
        if s.kind == 'back': paste(base, s.p, cl(u / .35), .55 + .45 * outback(u), s.pivot)
        elif s.kind == 'slam': paste(base, s.p, cl(u / .4), 1.7 - .7 * out3(u), s.pivot)
        else: paste(base, s.p, ease(u))

# ---------------- shots ----------------
class Shot:
    xf = .13   # dissolve from the previous shot
    def __init__(s, t0, t1, **kw): s.t0, s.t1 = t0, t1; s.__dict__.update(kw)
class Still(Shot):
    """a still with a slow push (z0 → z1 toward focus f) and timed pops"""
    def __init__(s, t0, t1, path, z0=1.0, z1=1.05, f=(960, 540), pops=(), xf=.13, curve=None):
        super().__init__(t0, t1, path=path, z0=z0, z1=z1, f=f, pops=list(pops), xf=xf, curve=curve)
    def z(s, t):
        u = cl((t - s.t0) / max(.01, s.t1 - s.t0))
        return s.z0 + (s.z1 - s.z0) * (s.curve(u) if s.curve else ease(u) * .3 + u * .7)
    def frame(s, t):
        im = zoom(load_rgb(s.path), s.z(t), s.f)
        for p in s.pops: p.draw(im, t)
        return im
class Walk(Still):
    """first-person walk up the airstairs: push toward the door, a small bob on every beat"""
    def frame(s, t):
        ph = ((t - D[2]) / BEAT) % 1.0
        bob = 10 * (1 - math.cos(2 * math.pi * ph)) / 2
        return zoom(load_rgb(s.path), s.z(t), s.f, dy=bob - 5)
class Arrive(Still):
    """dive through the cloud: zoom 1.22 → 1.0 (fast, then settles), white veil clears, board pops, stamp lands"""
    xf = 0
    def __init__(s, t0, t1, path, board, stamp_p, t_stamp, stamp_pivot=(1540, 520), board_pivot=(960, 720)):
        super().__init__(t0, t1, path, xf=0)
        s.pops = [Pop(board, t0 + .14, 'back', board_pivot), Pop(stamp_p, t_stamp, 'slam', stamp_pivot)]
    def z(s, t):
        u = t - s.t0
        return 1.0 + .22 * (1 - out3(u / .7)) + .03 * cl((u - .7) / max(.1, s.t1 - s.t0 - .7))
    def frame(s, t):
        im = super().frame(t)
        v = .85 * (1 - ease((t - s.t0) / .4))
        if v > .005: im = Image.blend(im, Image.new('RGB', (W, H), (255, 255, 255)), v)
        return im
class Frames(Shot):
    """a pre-rendered frame sequence (globe hops; the 长城 snap)"""
    def __init__(s, t0, t1, paths, off=0.0, z0=1.0, z1=1.0, xf=.13):
        super().__init__(t0, t1, paths=paths, off=off, z0=z0, z1=z1, xf=xf)
    def frame(s, t):
        i = int(round((t - s.t0 + s.off) * FPS)); i = min(max(i, 0), len(s.paths) - 1)
        z = s.z0 + (s.z1 - s.z0) * cl((t - s.t0) / (s.t1 - s.t0))
        return zoom(load_rgb(s.paths[i]), z)

# --- the 拍立得 moment ---
VF = (270, 60, 1650, 980)                     # viewfinder (3:2) on screen; the photo is what's inside it
def camera_body():
    im = Image.new('RGBA', (920, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, 919, 299), 46, fill='#F1EADF', outline='#2A211B', width=5)
    d.rounded_rectangle((3, 3, 916, 70), 40, fill='#E4DACB')
    d.rounded_rectangle((60, 26, 860, 42), 8, fill='#2A211B')
    d.ellipse((830 - 34, 140 - 34, 830 + 34, 140 + 34), fill='#D86B5A', outline='#2A211B', width=5)
    d.rounded_rectangle((60, 110, 210, 170), 14, fill='#2A211B')
    return im
CAM = camera_body()
def vf_for(fb):
    """the viewfinder: 3:2, wide enough for the monument's centre and the character, kept on screen"""
    cx, vw = 960, 1380
    if fb:
        ux0, ux1 = min(fb[0] - 50, 960 - 520), max(fb[2] + 50, 960 + 520)
        vw = min(1500, max(1380, ux1 - ux0)); cx = (ux0 + ux1) / 2
    vh = vw * 2 / 3; cx = min(max(cx, vw / 2 + 20), 1900 - vw / 2); y0 = max(30, 515 - vh / 2)
    return (int(cx - vw / 2), int(y0), int(cx + vw / 2), int(y0 + vh))
def shadow_card(card):
    w, h = card.size; pad = 46
    sh = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle((pad, pad + 14, pad + w, pad + h + 14), fill=(0, 0, 0, 120))
    sh = sh.filter(ImageFilter.GaussianBlur(17)); sh.alpha_composite(card, (pad, pad)); return sh
class Snap(Shot):
    """mode 'full': camera up (viewfinder), 咔嚓 at tc, card out of the slot, lifts, develops drawn → real, caption.
       mode 'pre': camera up and 咔嚓 only (the flash carries into the next shot).
       mode 'dev': no camera on screen (the self-timer): the card flies in from `origin` and develops."""
    xf = 0
    def __init__(s, t0, t1, k, tc, mode='full', cap=None, candle=False, origin=None, base=None, xf=.13):
        super().__init__(t0, t1, k=k, tc=tc, mode=mode, cap=cap, candle=candle, origin=origin, xf=xf, basep=base)
    def prep(s):
        if hasattr(s, 'scene'): return
        k, base, candle = s.k, s.basep, s.candle
        s.scene = load_rgb(K.drawn(k))
        s.fb = K.figbox(k); s.vf = vf_for(s.fb); VF = s.vf
        s.base0 = load_rgb(base) if base else s.scene
        m = Image.new('L', (W, H), 255); ImageDraw.Draw(m).rectangle(VF, fill=0); m = m.filter(ImageFilter.GaussianBlur(5))
        s.vfimg = Image.composite(ImageEnhance.Brightness(s.scene.filter(ImageFilter.GaussianBlur(6))).enhance(.5), s.scene, m)
        dim = ImageEnhance.Brightness(s.base0.filter(ImageFilter.GaussianBlur(14))).enhance(.42)
        if candle:
            g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).ellipse((360, 160, 1560, 1100), fill=150); g = g.filter(ImageFilter.GaussianBlur(140))
            dim = Image.composite(Image.new('RGB', (W, H), (255, 176, 92)), dim, g.point(lambda v: int(v * .55)))
        s.dim = dim
        real = load_rgb(K.real(k))
        s.pd = s.scene.crop(VF).resize((700, 467), Image.LANCZOS)
        s.pr = real.crop(VF).resize((700, 467), Image.LANCZOS)
        s.prd = ImageEnhance.Brightness(ImageEnhance.Color(s.pr).enhance(.5)).enhance(.85)
        s.dark = Image.new('RGB', (700, 467), '#3B342E')
    def overlay(s, base, t, a):
        if a <= .01: return
        o = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(o); L = 80
        x0, y0, x1, y1 = s.vf
        for (x, y, dx, dy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
            x += 14 * dx; y += 14 * dy
            d.line([(x, y + L * dy), (x, y), (x + L * dx, y)], fill=(255, 255, 255, 235), width=6, joint='curve')
        if s.fb:
            fx0, fy0, fx1, fy1 = s.fb; cx, cy = (fx0 + fx1) / 2, (fy0 + fy1) / 2
            r = 1 + .3 * (1 - ease((t - s.t0 - .15) / .3)); hw, hh = (fx1 - fx0) / 2 * r + 24, (fy1 - fy0) / 2 * r + 24
            hh = min(hh, cy - y0 - 10, y1 - cy - 10)
            d.rectangle((cx - hw, cy - hh, cx + hw, cy + hh), outline=(242, 198, 110, 235), width=4)
        if math.sin(t * 12) > -.2: d.ellipse((x0 + 50, y0 + 50, x0 + 72, y0 + 72), fill=(229, 72, 59, 240))
        o.putalpha(o.getchannel('A').point(lambda v: int(v * a)))
        base.paste(o, (0, 0), o)
    def card(s, u):
        k0 = 1.25 if s.candle else 1.0
        dr = ease((u - .40) / (.30 * k0)); re = ease((u - .40 - .35 * k0) / (.5 * k0))
        ph = Image.blend(s.dark, s.pd, dr)
        if re > 0: ph = Image.blend(ph, Image.blend(s.prd, s.pr, re), re)
        c = Image.new('RGBA', (760, 607), '#FBFAF6'); c.paste(ph, (30, 30))
        if s.cap:
            ca = ease((u - .40 - .85 * k0) / .3)
            im, cx0, cy0 = load_crop(s.cap)
            if im is not None and ca > 0:
                w = int(im.width * ca);
                if w > 0:
                    part = im.crop((0, 0, w, im.height)); c.paste(part, ((760 - im.width) // 2, 607 - 30 - im.height - 8), part)
        return shadow_card(c)
    def frame(s, t):
        s.prep(); u = t - s.tc
        if u < 0 or s.mode == 'pre':
            if s.mode == 'dev': return s.base0.copy()
            a = ease((t - s.t0) / .3)
            base = zoom(Image.blend(s.scene, s.vfimg, a), 1.04 - .04 * a)
            s.overlay(base, t, a)
            cy = 1080 - 78 * a; base.paste(CAM, (500, int(cy)), CAM)
            return base
        lift = ease((u - .28) / .40)
        base = Image.blend(s.vfimg if s.mode == 'full' else s.base0, s.dim, lift)
        if s.mode == 'full':
            s.overlay(base, t, 1 - ease((u - .2) / .25))
            cam_y = 1002 + 260 * lift; slot = cam_y + 34
            ej = ease((u - .07) / .21)
            cy = (slot - 607 * ej + 303.5) * (1 - lift) + 539.5 * lift; cx = 960
            sc = 1 + .32 * lift; rot = 3 * lift
        else:
            ox, oy = s.origin; e = out3((u - .07) / .5)
            cx, cy = ox + (960 - ox) * e, oy + (539.5 - oy) * e; sc = .15 + 1.17 * e; rot = 3 * e - 8 * (1 - e)
        c = s.card(u)
        c = c.resize((int(c.width * sc), int(c.height * sc)), Image.BILINEAR)
        if abs(rot) > .05: c = c.rotate(rot, resample=Image.BICUBIC, expand=True)
        base.paste(c, (int(cx - c.width / 2), int(cy - c.height / 2)), c)
        if s.mode == 'full' and lift < 1: base.paste(CAM, (500, int(cam_y)), CAM)
        return base

# ---------------- build the pieces ----------------
GOLD, CREAM = K.GOLD, K.CREAM
svgw, img, page, H_ = K.svgw, K.img, K.page, K.H
def scene_page(inner): return P(inner)
HIST_G = '<div style="position:absolute;inset:0;background:radial-gradient(ellipse 1150px 520px at 0% 0%, rgba(14,8,5,.5), rgba(14,8,5,0))"></div>'
def hist_p(name):
    f = f'{SB}/hist/{name}.png'
    return P(img(f'{f}?v={int(os.path.getmtime(f))}') + HIST_G)
ARRD = {a[0]: a for a in K.ARR}
VOF = {'chichen': '01_mx.mp3', 'machu2': '02_pe.mp3', 'christ': '03_br.mp3', 'colosseum': '04_it.mp3', 'petra2': '05_jo.mp3', 'taj': 'r2_06_in_b.mp3', 'home': 'r2_07_cn.mp3'}
def vo_len(f):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{VO}/{f}'], capture_output=True, text=True).stdout
    return float(out.strip())
VOICES, CLICKS, STAMPS = [], [], []
def arrive(k, t0, t1):
    _, zh, local, font, st, col = ARRD[k]
    bg, pop, pop2 = K.arrival_parts(k, zh, local, font, st, col)
    tv = t0 + .18; L = vo_len(VOF[k]); VOICES.append((tv, VOF[k]))
    ts = next_beat(tv + L - .12); ts = ts if ts < t1 - .3 else t1 - .5
    STAMPS.append(ts)
    return Arrive(t0, t1, P(bg), T(pop), T(pop2), ts)
def cap_p(text): return T(f'<div style="position:absolute;left:20px;top:20px;font-family:\'LXGW WenKai\';font-weight:700;font-size:44px;color:#5A4E44;white-space:nowrap">{text}</div>')

SH = []
# opening
SH.append(Still(0, b(2, 2), P(svgw(K.terminal() + K.speed + K.hand_pass)), 1.0, 1.08, (1410, 430), xf=0))
SH.append(Walk(b(2, 2), D[4], P(svgw(K.airstairs())), 1.0, 1.32, (960, 330), xf=.2))
SH.append(Still(D[4], b(5, 3), P(svgw(K.takeoff())), 1.0, 1.05, xf=.12))
SH.append(Still(b(5, 3), b(8, 1), P(svgw(K.window(K.globe('reveal', set(B.P)) + K.ring + K.pins('reveal', ['ci', 'mp', 'cr', 'co', 'pe', 'tj', 'gw'])))), 1.0, 1.06, xf=.25))
SH.append(Still(b(8, 1), b(9, 3), P(H_(*K.album(0, slot8='none', stamps=False))[len(K.HEAD):-len('</div></body></html>')]), 1.0, 1.04))

# globe hops: rendered live (arc draws, plane flies)
HOPS = []
def hop(view, lit, dest, t0, t1, curve=ease):
    n = int(round((t1 - t0) * FPS)) + 2
    d = K.G7[view]['legs'][0]['front']
    extra = (f'<path id="gl" d="{d}" pathLength="1" stroke="{GOLD}" stroke-width="16" fill="none" opacity=".35" filter="url(#blur8)" stroke-dasharray="1 2" stroke-dashoffset="1"/>'
             f'<path id="arc0" d="{d}" pathLength="1" stroke="#2A211B" stroke-opacity=".55" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="1 2" stroke-dashoffset="1"/>'
             f'<path id="arc" d="{d}" pathLength="1" stroke="{GOLD}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="1 2" stroke-dashoffset="1"/>')
    html = K.HEAD + svgw(K.globe(view, lit, extra) + K.pins(view, dest) + f'<g id="pl">{K.plane(0, 0, 0, 1.25)}</g>') + '</div></body></html>'
    tag = hashlib.md5((html + str(n) + curve.__name__).encode()).hexdigest()[:10]
    paths = [f'{LAY}/hop_{tag}_{i:03d}.jpg' for i in range(n)]
    HOPS.append((html, paths, [curve(i / (n - 2)) for i in range(n)]))
    return paths
def render_hops(pg):
    for html, paths, ps in HOPS:
        if all(os.path.exists(p) for p in paths): continue
        fn = f'{LAY}/_hop.html'; open(fn, 'w').write(html); pg.goto('file://' + fn); pg.wait_for_timeout(200); pg.evaluate('document.fonts.ready')
        for p_, p in zip(paths, ps):
            pg.evaluate(f'''(() => {{const p={min(p, 1):.4f}; const a=document.getElementById('arc'), g=document.getElementById('gl');
              a.style.strokeDashoffset=1-p; g.style.strokeDashoffset=1-p; document.getElementById('arc0').style.strokeDashoffset=1-p; const L=a.getTotalLength();
              const q=a.getPointAtLength(Math.max(0.001,p*L)), r=a.getPointAtLength(Math.min(L,p*L+3)), q0=a.getPointAtLength(Math.max(0,p*L-3));
              const ang=Math.atan2(r.y-q0.y,r.x-q0.x)*180/Math.PI;
              document.getElementById('pl').setAttribute('transform','translate('+q.x+','+q.y+') rotate('+ang+')');
              document.getElementById('pl').style.opacity = p>0.985 ? 0 : 1; }})()''')
            pg.locator('#f').screenshot(path=p_, type='jpeg', quality=92)
        print('  hop', len(paths), 'frames', flush=True)
SH.append(Frames(b(9, 3), D[11], hop('pacific', {'gw', 'ci'}, ['gw', 'ci'], b(9, 3), D[11]), z0=1.0, z1=1.04))

# stop 1 奇琴伊察
SH.append(arrive('chichen', D[11], b(12, 2)))
SH.append(Still(b(12, 2), D[17], hist_p('chichen_calendar'), 1.0, 1.09))
SH.append(Still(D[17], b(19, 1), hist_p('chichen_serpent'), 1.0, 1.06))
SH.append(Snap(b(19, 1), D[21], 'chichen', D[20], 'full', cap_p('奇琴伊察 · 1/7'), xf=.1)); CLICKS.append(D[20])
SH.append(Still(D[21], b(22, 3), P(H_(*K.album(1, slot8='q'))[len(K.HEAD):-len('</div></body></html>')]), 1.0, 1.05, (960, 600), xf=.2))
SLOT8 = ('<rect width="1920" height="1080" fill="#F3EAD6"/><rect x="560" y="200" width="800" height="660" rx="20" fill="none" stroke="#B9AA8E" stroke-width="8" stroke-dasharray="30 20"/>'
         '<path d="M720,760 L960,330 L1200,760 Z" fill="none" stroke="#A99F92" stroke-width="14" stroke-linejoin="round"/><text x="1210" y="380" font-family="Noto Sans CJK SC" font-weight="900" font-size="200" fill="#C0392B">?</text>'
         '<text x="960" y="940" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="52" fill="#9C8E76">8</text>')
SH.append(Still(b(22, 3), D[25], P(svgw(SLOT8)), 1.0, 1.08, (960, 520)))
# stop 2 马丘比丘
SH.append(arrive('machu2', D[25], D[27]))
SH.append(Still(D[27], D[30], hist_p('machu_palace'), 1.0, 1.08))
SH.append(Still(D[30], b(32, 1), hist_p('machu_hidden'), 1.06, 1.0))
timer_nonum = re.sub(r'<text x="1500".*?</text>', '', K.timer)
timer_bg = P(img(K.drawn('machu2')) + svgw(timer_nonum))
NUM = lambda n: T(svgw(f'<text x="1500" y="560" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="260" fill="#FFFFFF" opacity=".92" stroke="#2A211B" stroke-width="6">{n}</text>'))
tn = [b(33, 1), b(33, 2), b(33, 3), D[34]]
SH.append(Still(b(32, 1), D[34], timer_bg, 1.0, 1.05, (900, 600), pops=[Pop(NUM(n), tn[i], 'slam', (1500, 470), t_out=tn[i + 1]) for i, n in enumerate((3, 2, 1))]))
SH.append(Snap(D[34], D[35], 'machu2', D[34], 'dev', cap_p('马丘比丘 · 2/7'), origin=(330, 880), base=timer_bg)); CLICKS.append(D[34])
# stop 3 基督像
SH.append(arrive('christ', D[35], b(36, 2)))
SH.append(Still(b(36, 2), b(40, 3), hist_p('christ_1922'), 1.0, 1.10, (1300, 380)))
SH.append(Snap(b(40, 3), D[41] + .07, 'christ', D[41], 'pre', xf=.1)); CLICKS.append(D[41])
SH.append(Frames(D[41] + .07, b(42, 2), hop('atlantic', {'cr', 'co', 'gw', 'ci', 'mp'}, ['co'], D[41] + .07, b(42, 2)), z0=1.0, z1=1.04, xf=0))
# stop 4 斗兽场
SH.append(arrive('colosseum', b(42, 2), D[44]))
SH.append(Still(D[44], b(46, 1), hist_p('colosseum_nero_lake'), 1.0, 1.07))
SH.append(Still(b(46, 1), b(48, 2), hist_p('colosseum_return'), 1.07, 1.0))
SH.append(Snap(b(48, 2), D[49] + .07, 'colosseum', D[49], 'pre', xf=.1)); CLICKS.append(D[49])
# Egypt, the pyramid, honour
SH.append(Still(D[49] + .07, D[51], P(svgw(B.ns['eg'])), 1.0, 1.06, xf=0))
SH.append(Still(D[51], D[56], P(svgw(''.join(K.anc))), 1.0, 1.08, (960, 640)))
sv, ht = K.album(4, slot8='none')
laurel = T(svgw(K.sticker('laurel', 1355 + 165, 710 + 140, 1.5)))
SH.append(Still(D[56], D[58], P(sv + ht), 1.0, 1.05, (1300, 700), pops=[Pop(laurel, D[56], 'slam', (1520, 850), dur=.16)], xf=.1)); STAMPS.append(D[56])
# stop 5 佩特拉
SH.append(arrive('petra2', D[58], b(60, 2)))
SH.append(Still(b(60, 2), b(62, 3), hist_p('petra_caravan'), 1.0, 1.07, (1200, 400)))
SH.append(Still(b(62, 3), b(64, 3), hist_p('petra_tax'), 1.0, 1.06))
SH.append(Snap(b(64, 3), D[66], 'petra2', D[65], 'full', cap_p('佩特拉 · 5/7'), candle=True, xf=.1)); CLICKS.append(D[65])
# stop 6 泰姬陵
SH.append(arrive('taj', D[66], b(67, 2)))
SH.append(Still(b(67, 2), b(70, 1), hist_p('taj_build'), 1.0, 1.08))
SH.append(Still(b(70, 1), b(72, 3), hist_p('taj_fort'), 1.0, 1.06, (1150, 450)))
SH.append(Snap(b(72, 3), D[74], 'taj', D[73], 'full', cap_p('泰姬陵 · 6/7'), xf=.1)); CLICKS.append(D[73])
# the race home
SH.append(Still(D[74], b(76, 2), P(svgw(K.bar)), 1.0, 1.05, xf=.15))
SH.append(Frames(b(76, 2), D[80], hop('asia', set(B.P), ['gw'], b(76, 2), D[80], curve=out3), z0=1.0, z1=1.06))
o = K.G7['reveal']
SH.append(Still(D[80], D[83], P(svgw(K.globe('reveal', set(B.P), K.ex))), 1.08, 1.0, pops=[Pop(T(K.big), D[80], 'slam', (960, 200), dur=.18)], xf=0))
# home: 长城, 欢迎回家
home_bg = P(img(K.drawn('greatwall2', fig=False)) + svgw(K.clouds()))
home_board = T('<div style="position:absolute;left:150px;top:420px;width:620px;padding:22px 30px 26px;border-radius:18px;background:rgba(18,30,52,.9);border-top:8px solid #F2C66E;text-align:center">'
               '<div style="font-family:Noto Sans CJK SC;font-weight:700;font-size:24px;letter-spacing:4px;color:#F2C66E">✈ 到达 ARRIVALS</div><div style="font-family:Noto Sans CJK SC;font-weight:900;font-size:92px;color:#FFF">欢迎回家</div></div>')
home_stamp = T(svgw(K.stamp('中国', '欢迎回家', 1540, 470, rot=-10, col='#C0392B')))
VOICES.append((D[83] + .15, VOF['home'])); STAMPS.append(b(83, 3))
SH.append(Arrive(D[83], D[84], home_bg, home_board, home_stamp, b(83, 3), (1540, 470), (460, 540)))
snapf = [f'{SB}/snap/f/{i:04d}.jpg' for i in range(200)]
SH.append(Frames(D[84], D[87], snapf, off=1.67, xf=.3)); CLICKS.append(D[85])
sv7, ht7 = K.album(7, slot8='gold')
SH.append(Still(D[87], D[92], P(sv7 + ht7), 1.0, 1.09, (960, 640), xf=.25))
SH.append(Still(D[92], END, P('<div style="position:absolute;inset:0;background:#241A13"></div>' + K.end), 1.0, 1.03, xf=.6))
for a_, b_ in zip(SH, SH[1:]): assert abs(a_.t1 - b_.t0) < 1e-6, (a_.t1, b_.t0)

# ---------------- subtitles ----------------
SUBS = [(0.30, b(2, 2) - .07, '世界这么大！\n新七大奇迹，你是不是只去过[长城]？'),
        (b(2, 2) + .08, D[4] - .07, '今天，我们一起去看看！'),
        (b(5, 3) + .16, b(8, 1) - .07, '7个地方连成一圈飞回来，\n够不够[绕地球一圈]？', 'c', 40),
        (b(8, 1) + .1, b(9, 3) - .07, '地球一圈，40075公里。\n出发！'),
        (D[11] + .33, b(12, 2) - .07, '第一站，墨西哥，\n奇琴伊察。'),
        (b(12, 2) + .07, b(14, 3) - .1, '这是玛雅人的神庙，\n也是一本[石头日历]：'),
        (b(14, 3), D[17] - .07, '四面台阶加顶上的平台，\n一共365级，一年365天。'),
        (D[17] + .08, D[20] - .15, '每年春分秋分，影子会变成\n一条[蛇]，从台阶上爬下来。'),
        (D[21] + .14, b(22, 3) - .07, '咦，这相册怎么有[8个]格子？', 'c', 60),
        (b(22, 3) + .1, D[25] - .07, '第8格是金字塔——\n它怎么不在七大奇迹里？', 'c', 40),
        (D[25] + .38, D[27] - .07, '第二站，秘鲁，\n马丘比丘。'),
        (D[27] + .08, D[30] - .07, '它很可能是印加皇帝的[山顶行宫]，\n建在两千多米高的山上。'),
        (D[30] + .08, b(32, 1) - .07, '后来西班牙人征服了印加，\n却一直[没找到]它。'),
        (b(32, 1) + .08, D[34] - .04, '倒计时3、2、1——[跳]！'),
        (D[35] + .35, b(36, 2) - .07, '第三站，巴西，\n基督像。'),
        (b(36, 2) + .08, b(39, 1), '1922年，里约的天主教徒觉得\n这座城越来越[不信神]了，'),
        (b(39, 1), D[41] - .04, '于是大家[捐钱]，\n在山顶立起了它。'),
        (b(42, 2) + .3, D[44] - .07, '第四站，意大利，\n罗马斗兽场。'),
        (D[44] + .08, b(46, 1) - .07, '这块地，原来是暴君尼禄的\n[私人湖]。'),
        (b(46, 1) + .08, D[49] - .04, '新皇帝把湖填了，建起斗兽场，\n说：还给[罗马人民]。'),
        (D[49] + .25, D[51] - .07, '往东飞，下面就是[埃及]。\n还记得第8格吗？'),
        (D[51] + .08, b(53, 2) - .05, '金字塔本来也在候选名单里，\n埃及人[不干了]：'),
        (b(53, 2) + .05, D[56] - .07, '它是古代七大奇迹里[唯一还在的]，\n根本不需要投票。'),
        (D[56] + .15, D[58] - .07, '最后，它成了\n“[荣誉]候选”。'),
        (D[58] + .5, b(60, 2) - .07, '第五站，约旦，\n佩特拉。'),
        (b(60, 2) + .08, b(62, 3) - .07, '两千年前，运香料的骆驼队\n都要经过这里。'),
        (b(62, 3) + .07, D[65] - .04, '纳巴泰人收[过路税]发了财，\n把城刻进了石头里。'),
        (D[66] + .36, b(67, 2) - .07, '第六站，印度，\n泰姬陵。'),
        (b(67, 2) + .07, b(70, 1) - .07, '皇后生下第14个孩子后去世，\n皇帝为她修了[二十多年]。'),
        (b(70, 1) + .08, D[73] - .04, '晚年他被软禁，只能[远远望着]它；\n死后，葬在了她身边。'),
        (D[74] + .1, b(76, 2) - .07, '已经飞了35967公里，\n离一圈只差[4108公里]。'),
        (b(76, 2) + .1, b(78, 1), '回家这一段，\n够不够？', 'c', 40),
        (D[83] + .55, b(86, 2), '差的那340公里？\n在[万里长城]上走走就补上了。'),
        (D[87] + .12, b(89, 1), '这一圈，你的7张[打卡照]。\n截图存好！', 'l', 60),
        (b(89, 1) + .05, D[92] - .1, '你去过几个？评论区打个数字👇\n真去过的，晒出你的照片！', 'l', 60)]
class Sub:
    def __init__(s, t0, t1, text, align='l', top=None):
        rows = text.split('\n'); s.t0, s.t1 = t0, t1
        top = top if top is not None else (120 if align == 'c' else 132)
        s.p = T(K.subs_c(rows, top) if align == 'c' else K.subs(rows, top)); s.top = top
        s.n = [len(re.sub(r'[\[\]]', '', r)) for r in rows]
        s.dur = [min(.6, max(.22, .035 * n)) for n in s.n]
    def prep(s):
        im, x0, y0 = load_crop(s.p); s.im, s.x0, s.y0 = im, x0, y0
        a = np.array(im.getchannel('A')); s.bands = []
        for r in range(len(s.n)):
            ya = int(s.top + 97.5 * r + 8 - y0) if r else 0; yb = int(s.top + 97.5 * (r + 1) + 8 - y0) if r < len(s.n) - 1 else a.shape[0]
            ya, yb = max(0, ya), min(a.shape[0], yb); cols = np.nonzero(a[ya:yb].max(0) > 40)[0]
            s.bands.append((ya, yb, cols.min() if len(cols) else 0, cols.max() if len(cols) else a.shape[1]))
        s.a0 = a.astype(np.float32)
    def draw(s, base, t):
        if not (s.t0 <= t < s.t1): return
        if not hasattr(s, 'im'): s.prep()
        fade = cl((s.t1 - t) / .12); u = t - s.t0; M = np.zeros_like(s.a0); st = 0.0
        xs = np.arange(s.a0.shape[1], dtype=np.float32)
        for (ya, yb, c0, c1), d in zip(s.bands, s.dur):
            rx = c0 - 30 + (c1 - c0 + 90) * cl((u - st) / d); st += d + .06
            M[ya:yb] = np.clip((rx - xs) / 40 + 1, 0, 1)[None, :]
        im = s.im.copy(); im.putalpha(Image.fromarray((s.a0 * M * fade).astype(np.uint8))); base.paste(im, (s.x0, s.y0), im)
SUBO = [Sub(*x) for x in SUBS]

# ---------------- HUD: counter, odometer, seal ----------------
def roll(a, b_, t, t0, t1, f=out3): return int(round(a + (b_ - a) * f((t - t0) / (t1 - t0))))
def hud_state(t):
    if t >= D[92]: return None
    if t < b(8, 1): return (0, False, None)
    if t < b(9, 3): return (0, False, 0)
    if t < D[11]: return (0, False, roll(0, 12772, t, b(9, 3), D[11], ease))
    if t < D[20]: return (0, False, 12772)
    if t < D[21]: return (1, True, 12772)
    if t < b(22, 3): return (1, True, roll(12772, 16923, t, D[21], b(22, 3), ease))
    if t < D[25]: return (1, True, 16923)
    if t < D[34]: return (1, False, 16923)
    if t < D[35]: return (2, True, 16923)
    if t < D[41]: return (2, False, roll(16923, 20202, t, D[35], D[35] + .7))
    if t < D[41] + .07: return (3, True, 20202)
    if t < b(42, 2): return (3, True, roll(20202, 29405, t, D[41] + .07, b(42, 2), ease))
    if t < D[49]: return (3, False, 29405)
    if t < D[51]: return (4, True, roll(29405, 31000, t, D[49] + .07, D[51], ease))
    if t < D[56]: return (4, False, 31000)
    if t < D[58]: return (4, True, 31000)
    if t < D[65]: return (4, False, roll(31000, 31823, t, D[58], D[58] + .7))
    if t < D[66]: return (5, True, 31823)
    if t < D[73]: return (5, False, roll(31823, 35967, t, D[66], D[66] + .7))
    if t < D[74]: return (6, True, 35967)
    if t < b(76, 2): return (6, True, None)
    if t < D[80]: return (6, True, roll(35967, 39735, t, b(76, 2), D[80], out3))
    if t < D[83]: return (6, True, 39735)
    if t < D[85]: return (6, False, 39735)
    if t < b(89, 1): return (7, True, 39735)
    return (7, True, None)
@functools.lru_cache(maxsize=None)
def counter_p(n, hot): return T(B.counter(n, hot))
@functools.lru_cache(maxsize=None)
def odo_p(km): return T(K.odo2(km))
SEAL_P = T(B.SEALD)

# ---------------- timeline sanity ----------------
def report():
    for s in SH: print(f'{s.t0:7.2f} {s.t1:7.2f} {type(s).__name__:7s} {getattr(s, "k", "") or os.path.basename(getattr(s, "path", "") or "")}')
    print('clicks', [round(c, 2) for c in CLICKS]); print('stamps', [round(c, 2) for c in STAMPS]); print('voices', [(round(a, 2), f) for a, f in VOICES])

# ---------------- audio ----------------
def mix(out):
    import pyloudnorm as pyln, warnings; warnings.filterwarnings('ignore')
    bed, sr = sf.read(f'{MUS}/bed_v1.wav'); n = int(END * sr); bed = bed[:n]
    mixd = bed.copy(); meter = pyln.Meter(sr)
    for t, f in VOICES:
        w = f'{DEMO}/vo_{f}.wav'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{VO}/{f}', '-ac', '1', '-ar', str(sr), w], check=True)
        v, _ = sf.read(w); v = pyln.normalize.loudness(v, meter.integrated_loudness(v), -15.0); v = .5 * np.tanh(v / .5)
        i = int(t * sr); v = v[:n - i]; mixd[i:i + len(v)] += v[:, None]
    sh, ssr = sf.read(f'{S}/sfx/shutter_iphone_style.wav')
    if sh.ndim > 1: sh = sh.mean(1)
    if ssr != sr: sh = np.interp(np.arange(int(len(sh) * sr / ssr)) / sr, np.arange(len(sh)) / ssr, sh)
    for t in CLICKS:
        i = int(t * sr) - int(.003 * sr); mixd[i:i + len(sh)] += (sh * .45)[:, None]
    m = int(.22 * sr); tt = np.arange(m) / sr; rng = np.random.default_rng(5)
    thud = np.sin(2 * np.pi * (95 - 40 * tt) * tt) * np.exp(-tt / .045) * .55
    nz = rng.normal(0, 1, m) * np.exp(-tt / .012); nz = np.convolve(nz, np.ones(24) / 24, 'same') * .5
    thud = (thud + nz) * .32
    for t in STAMPS:
        i = int(t * sr); mixd[i:i + m] += thud[:, None]
    fo = int(.9 * sr); mixd[-fo:] *= np.linspace(1, 0, fo)[:, None]
    pk = np.abs(mixd).max()
    if pk > .89: mixd *= .89 / pk
    sf.write(out, mixd.astype(np.float32), sr)
    print('mix', out, 'peak', round(20 * np.log10(np.abs(mixd).max()), 2), 'dBFS, LUFS', round(meter.integrated_loudness(mixd), 1))

# ---------------- compose ----------------
def shot_at(t):
    for i, s in enumerate(SH):
        if s.t0 <= t < s.t1: return i
    return len(SH) - 1
def compose(t):
    i = shot_at(t); s = SH[i]; im = s.frame(t)
    xf = getattr(s, 'xf', 0)
    if i > 0 and xf and t < s.t0 + xf:
        im = Image.blend(SH[i - 1].frame(t), im, ease((t - s.t0) / xf))
    for su in SUBO: su.draw(im, t)
    hs = hud_state(t)
    if hs:
        n, hot, km = hs; paste(im, counter_p(n, hot))
        if km is not None: paste(im, odo_p(km))
        paste(im, SEAL_P)
    for c in CLICKS:
        if abs(c - D[85]) < .01: continue        # the 长城 snap frames carry their own blink + flash
        if c <= t < c + .07: im = Image.new('RGB', (W, H), (0, 0, 0))
        elif c + .07 <= t < c + .36: im = Image.blend(im, Image.new('RGB', (W, H), (255, 255, 255)), 1 - ease((t - c - .07) / .29))
    if t > END - 1.0: im = Image.blend(im, Image.new('RGB', (W, H), (0, 0, 0)), ease((t - END + 1.0) / 1.0))
    return im

if __name__ == '__main__':
    report()
    t0, t1 = WIN or (0, END)
    frames = [i / FPS for i in range(int(t0 * FPS), int(min(t1, END) * FPS))]
    # pre-register every HUD layer the window needs
    for t in frames:
        hs = hud_state(t)
        if hs: counter_p(hs[0], hs[1]); hs[2] is not None and odo_p(hs[2])
    with sync_playwright() as pw:
        br = pw.chromium.launch(); pg = br.new_page(viewport={'width': W, 'height': H})
        print('layers to render', len(JOBS), flush=True); run_jobs(pg); render_hops(pg); br.close()
    tag = f'{VER}' + (f'_{t0:.0f}-{t1:.0f}' if WIN else '')
    wav = f'{DEMO}/mix_{VER}.wav'; mix(wav)
    out = f'{DEMO}/ep57_demo_{tag}_hd.mp4'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-ss', f'{t0:.3f}', '-t', f'{len(frames) / FPS:.3f}', '-i', wav,
           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    import time; st = time.time()
    for j, t in enumerate(frames):
        pr.stdin.write(compose(t).tobytes())
        if j % 300 == 0: print(f'  t={t:6.2f}  {j}/{len(frames)}  {time.time() - st:.0f}s', flush=True)
    pr.stdin.close(); pr.wait(); print('wrote', out)
