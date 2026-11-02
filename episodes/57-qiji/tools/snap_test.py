"""ep57 quick test: taking the 长城 photo.
Drawn scene (gw_vector.py) → the camera comes up (pull back; outside the viewfinder dims and blurs) →
咔嚓 (blink + flash) → a 拍立得 slides out of the camera slot, blank → it develops: drawing → real photo →
caption written on the border. 1920x1080, 30 fps, about 7.6 s, with a synthesised shutter + eject sound.
usage: snap_test.py out.mp4"""
import sys, os, math, base64, subprocess, wave
import numpy as np, cv2
from PIL import Image
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from opt_comp import POSE, arms, stand, FILLS
from you_figure import figure, DEFS

S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57'
OUTD = f'{S}/snap'; os.makedirs(f'{OUTD}/f', exist_ok=True)
FPS, DUR = 30, 6.69   # 4 bars of the BGM (143.6 BPM): camera up on bar 2, 咔嚓 on the bar-3 downbeat
PW, PH = 2576, 1717; PX, PY = 520, 158; EW, EH = PW + 2 * PX, PH + 2 * PY   # extended canvas around the photo

# 1) extended drawing: the coded scene, padded by reflection; the padding only shows dimmed and blurred
d = cv2.imread(f'{S}/vec/gw_code.png'); d = cv2.resize(d, (PW, PH))
ext = cv2.copyMakeBorder(d, PY, PY, PX, PX, cv2.BORDER_REFLECT)
m = np.ones((EH, EW), np.float32); m[PY:PY + PH, PX:PX + PW] = 0; m = cv2.GaussianBlur(m, (0, 0), 30)[..., None]
ext = (ext * (1 - m) + cv2.GaussianBlur(ext, (0, 0), 16) * .7 * m).astype(np.uint8)
cv2.imwrite(f'{OUTD}/ext.jpg', ext, [cv2.IMWRITE_JPEG_QUALITY, 92])
fg = cv2.imread(f'{S}/fig_greatwall2.png', cv2.IMREAD_UNCHANGED); fg = cv2.resize(fg, (PW, PH)); al = fg[..., 3:4] / 255.
cv2.imwrite(f'{OUTD}/drawn_crop.jpg', (d * (1 - al) + fg[..., :3] * al).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])   # the drawing with 你 in it

def ease(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)
def span(t, a, b): return ease((t - a) / (b - a))

def fig_svg(t):
    """selfie 3 in extended-canvas coordinates; the raised hand waves until the camera comes up"""
    w = math.sin(t * 2 * math.pi * 1.4) * (1 - span(t, 1.7, 2.3))
    P = arms(stand, r=(-20 + 14 * w, -100 + 18 * w), l=(125, 115))
    bx, by, s = 1830 + PX, 2700 + PY, 5.4
    J = {k: (bx + x * s, by + y * s) for k, (x, y) in P.items() if 'knee' not in k and 'ankle' not in k}
    return figure(J, 120 * s, face=True, tilt=14 - 4 * w, fill='url(#gwf)', tag=False)

def view(t):
    """camera view over the extended canvas: (centre x, centre y, width)"""
    cx, cy = PX + PW / 2, PY + PH / 2
    if t < 1.67: return cx, cy, 2576 - 100 * span(t, 0, 1.67)
    vw = 2476 + (3616 - 2476) * span(t, 1.67, 2.4) - 110 * span(t, 2.4, 3.3)
    return cx, cy, vw

with open(f'{OUTD}/ext.jpg', 'rb') as f: ext_b64 = base64.b64encode(f.read()).decode()
CSS = '/home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai/wenkai-bold.css'
HTML = f'''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://{CSS}"><style>
html,body{{margin:0;background:#000}} #st{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000}}
#world{{position:absolute;left:0;top:0;width:{EW}px;height:{EH}px;transform-origin:0 0}}
.band{{position:absolute;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);background:rgba(10,8,6,.5)}}
#card{{position:absolute;width:760px;height:607px;background:#FBFAF6;box-shadow:0 18px 40px rgba(0,0,0,.45);transform-origin:50% 50%}}
#win{{position:absolute;left:30px;top:30px;width:700px;height:467px;overflow:hidden;background:#3B342E}}
#win img{{position:absolute;left:0;top:0;width:700px;height:467px}}
#cap{{position:absolute;left:0;right:0;bottom:30px;text-align:center;font-family:'LXGW WenKai';font-weight:700;font-size:44px;color:#5A4E44;white-space:nowrap}}
</style></head><body><div id="st">
<div id="world"><img src="data:image/jpeg;base64,{ext_b64}" style="position:absolute;left:0;top:0;width:{EW}px;height:{EH}px">
<svg id="figsvg" width="{EW}" height="{EH}" style="position:absolute;left:0;top:0">{DEFS}{FILLS}<g id="fig"></g></svg></div>
<div class="band" id="bt"></div><div class="band" id="bb"></div><div class="band" id="bl"></div><div class="band" id="br"></div>
<svg id="hud" width="1920" height="1080" style="position:absolute;left:0;top:0"><g id="hudg" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round"></g></svg>
<div id="card"><div id="win"><img id="dr" src="file://{OUTD}/drawn_crop.jpg"><img id="re" src="file://{S}/comp_greatwall2.jpg"><div id="raw" style="position:absolute;inset:0;background:#3B342E"></div></div>
<div id="cap"><span id="capin">长城 · 7/7　欢迎回家</span></div></div>
<svg id="cam" width="1920" height="1080" style="position:absolute;left:0;top:0"><g id="camg">
<rect x="500" y="0" width="920" height="300" rx="46" fill="#F1EADF" stroke="#2A211B" stroke-width="5"/>
<rect x="500" y="0" width="920" height="70" rx="40" fill="#E4DACB"/>
<rect x="560" y="26" width="800" height="16" rx="8" fill="#2A211B"/>
<circle cx="1330" cy="140" r="34" fill="#D86B5A" stroke="#2A211B" stroke-width="5"/>
<rect x="560" y="110" width="150" height="60" rx="14" fill="#2A211B" opacity=".85"/>
</g></svg>
<div id="flash" style="position:absolute;inset:0;background:#FFF;opacity:0"></div>
<div id="blink" style="position:absolute;inset:0;background:#000;opacity:0"></div>
</div></body></html>'''
open(f'{OUTD}/page.html', 'w').write(HTML)

def frame_js(t):
    cx, cy, vw = view(t); sc = 1920 / vw; vx, vy = cx - vw / 2, cy - vw * 9 / 32
    fx0, fy0, fx1, fy1 = (PX - vx) * sc, (PY - vy) * sc, (PX + PW - vx) * sc, (PY + PH - vy) * sc
    vf = span(t, 1.8, 2.3) * (1 - span(t, 3.9, 4.4))          # viewfinder on
    dim = vf + .0 * span(t, 4.4, 5.0)
    hud = ''
    if vf > 0:
        L = 80
        for (x, y, dx, dy) in ((fx0, fy0, 1, 1), (fx1, fy0, -1, 1), (fx0, fy1, 1, -1), (fx1, fy1, -1, -1)):
            hud += f'<path d="M{x + 14 * dx:.0f},{y + (14 + L) * dy:.0f} L{x + 14 * dx:.0f},{y + 14 * dy:.0f} L{x + (14 + L) * dx:.0f},{y + 14 * dy:.0f}" opacity="{vf:.2f}"/>'
        hx, hy = (2350 - vx) * sc, (1249 - vy) * sc; b = 130 * sc * (1 + .25 * (1 - span(t, 2.4, 3.0)))
        hud += f'<rect x="{hx - b:.0f}" y="{hy - b:.0f}" width="{2 * b:.0f}" height="{2 * b:.0f}" stroke="#F2C66E" stroke-width="4" opacity="{vf:.2f}"/>'
        hud += f'<circle cx="{fx0 + 60:.0f}" cy="{fy0 + 60:.0f}" r="10" fill="#E5483B" stroke="none" opacity="{vf * (.5 + .5 * math.sin(t * 12)):.2f}"/>'
    band_a = .5 * dim + .35 * span(t, 3.9, 4.6)
    cam_y = 1080 - 78 * span(t, 1.67, 2.3) + 120 * span(t, 4.0, 4.5)          # camera top edge on screen
    # the card: hidden behind the camera, pushed out of the slot, then lifted to centre
    slot = cam_y + 34
    out = span(t, 3.40, 3.88)
    card_top = slot - 607 * out + 6 * math.sin(t * 40) * (out > 0) * (out < 1)
    lift = span(t, 3.92, 4.6)
    ctop = card_top + (236 - card_top) * lift; sc_card = 1 + .32 * lift; rot = -3 * lift
    raw = 1 - span(t, 3.85, 4.5); dr = span(t, 3.95, 4.45) * (1 - span(t, 4.7, 5.35)); re = span(t, 4.6, 5.4)
    cap = span(t, 5.35, 5.95)
    flash = (1 - span(t, 3.41, 3.75)) * (t >= 3.41); blink = 1.0 if 3.34 <= t < 3.41 else 0
    return f'''(() => {{
const W=document.getElementById('world'); W.style.transform='scale({sc:.5f}) translate({-vx:.2f}px,{-vy:.2f}px)';
document.getElementById('fig').innerHTML={fig_svg(t)!r};
const B=(id,l,t_,w,h)=>{{const e=document.getElementById(id);e.style.left=l+'px';e.style.top=t_+'px';e.style.width=Math.max(0,w)+'px';e.style.height=Math.max(0,h)+'px';e.style.opacity={1 if band_a > 0 else 0};e.style.background='rgba(10,8,6,{band_a:.3f})';}};
B('bt',0,0,1920,{fy0:.1f}); B('bb',0,{fy1:.1f},1920,{1080 - fy1:.1f}); B('bl',0,{fy0:.1f},{fx0:.1f},{fy1 - fy0:.1f}); B('br',{fx1:.1f},{fy0:.1f},{1920 - fx1:.1f},{fy1 - fy0:.1f});
document.getElementById('hudg').innerHTML={hud!r};
document.getElementById('camg').setAttribute('transform','translate(0,{cam_y:.1f})');
const C=document.getElementById('card'); C.style.left='580px'; C.style.top='{ctop:.1f}px'; C.style.transform='scale({sc_card:.4f}) rotate({rot:.2f}deg)'; C.style.zIndex=1;
C.style.clipPath='inset(0 0 {max(0, ctop + 607 - slot) if lift < .02 else 0:.1f}px 0)';
document.getElementById('raw').style.opacity={raw:.3f}; document.getElementById('dr').style.opacity={dr:.3f}; document.getElementById('re').style.opacity={re:.3f};
document.getElementById('re').style.filter='saturate({.5 + .5 * re:.2f}) brightness({.85 + .15 * re:.2f})';
document.getElementById('capin').style.clipPath='inset(0 {100 - 100 * cap:.1f}% 0 0)';
document.getElementById('flash').style.opacity={flash:.3f}; document.getElementById('blink').style.opacity={blink};
}})()'''

N = int(DUR * FPS)
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080})
    pg.goto('file://' + f'{OUTD}/page.html'); pg.wait_for_timeout(800); pg.evaluate('document.fonts.ready')
    for i in range(N):
        t = i / FPS; pg.evaluate(frame_js(t))
        pg.locator('#st').screenshot(path=f'{OUTD}/f/{i:04d}.jpg', type='jpeg', quality=92)
    br.close()

# sound: 4 bars of the extended BGM (bar-aligned) and the crisp shutter click on the bar-3 downbeat; no eject sound (owner 00:46)
import soundfile as sf
M = f'/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/ep57music'
bed, sr = sf.read(f'{M}/bed_v1.wav'); D0 = float(os.environ.get('BGM_AT', '132.03'))   # a downbeat in the final chorus (bar 48 lands at 135.37)
mus = bed[int(D0 * sr): int((D0 + DUR) * sr)].mean(1) * .55
n = len(mus); mus[:int(.25 * sr)] *= np.linspace(0, 1, int(.25 * sr)); mus[-int(.4 * sr):] *= np.linspace(1, 0, int(.4 * sr))
a = mus.copy(); rng = np.random.default_rng(3)
sh, _ = sf.read('/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sfx/shutter_iphone_style.wav')   # sfx.py; owner 00:46: only the click, no eject sound
i0 = int(3.34 * sr) - int(.003 * sr); a[i0:i0 + len(sh)] += sh * .9
a = np.clip(a, -1, 1)
sf.write(f'{OUTD}/sfx.wav', np.stack([a, a], 1), sr)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{OUTD}/f/%04d.jpg', '-i', f'{OUTD}/sfx.wav',
                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', sys.argv[1]], check=True)
print('ok', sys.argv[1], N, 'frames, music from', D0)
