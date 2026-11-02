"""ep57: several 「你」 stick-man styles on the same real photo and the same pose, for the owner to pick."""
import sys, json, base64, math, glob
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
photo, posef, outdir = sys.argv[1:4]
P = json.load(open(posef)); J = {k: tuple(v) for k, v in P['joints'].items()}; st = P['style']
W, H = Image.open(photo).size; LW, HR = st['limb'], st['head']
def pt(n): return J[n]
def mid(a, b, t=.5): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
neck, hipc = pt('neck'), mid(pt('l_hip'), pt('r_hip'))
hx, hy = pt('head')
def tag(r):
    ts = st['tag']; ty = hy - r - ts * .55
    return (f'<g filter="url(#ds)"><rect x="{hx - ts * .85:.0f}" y="{ty - ts * 1.25:.0f}" width="{ts * 1.7:.0f}" height="{ts * 1.25:.0f}" rx="{ts * .3:.0f}" fill="#FFF"/>'
            f'<path d="M{hx - ts * .18:.0f},{ty - 1:.0f} L{hx:.0f},{ty + ts * .28:.0f} L{hx + ts * .18:.0f},{ty - 1:.0f}Z" fill="#FFF"/></g>'
            f'<text x="{hx:.0f}" y="{ty - ts * .62:.0f}" font-family="Noto Sans CJK SC" font-weight="900" font-size="{ts * .9:.0f}" text-anchor="middle" dominant-baseline="central" fill="#1C1A18">你</text>')
chains = [('neck', 'l_shoulder', 'l_elbow', 'l_wrist'), ('neck', 'r_shoulder', 'r_elbow', 'r_wrist'), ('l_hip', 'l_knee', 'l_ankle'), ('r_hip', 'r_knee', 'r_ankle')]
def poly(names): return 'M' + ' L'.join(f'{pt(n)[0]:.0f},{pt(n)[1]:.0f}' for n in names)
def curve(names):   # smooth: quadratic through the middle joint
    a = pt(names[-3]); b = pt(names[-2]); c = pt(names[-1]); pre = ''.join(f' L{pt(n)[0]:.0f},{pt(n)[1]:.0f}' for n in names[1:-2])
    s = pt(names[0]); cx, cy = 2 * b[0] - (a[0] + c[0]) / 2, 2 * b[1] - (a[1] + c[1]) / 2
    return f'M{s[0]:.0f},{s[1]:.0f}{pre} Q{cx:.0f},{cy:.0f} {c[0]:.0f},{c[1]:.0f}'
def taper(a, b, w0, w1):
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1; nx, ny = -dy / L, dx / L
    pts = [(a[0] + nx * w0 / 2, a[1] + ny * w0 / 2), (b[0] + nx * w1 / 2, b[1] + ny * w1 / 2), (b[0] - nx * w1 / 2, b[1] - ny * w1 / 2), (a[0] - nx * w0 / 2, a[1] - ny * w0 / 2)]
    return 'M' + ' L'.join(f'{x:.0f},{y:.0f}' for x, y in pts) + 'Z'
S = {}
# A: pictogram (sign-like)
S['A 图标小人'] = (f'<g filter="url(#ds)"><g stroke="#FFF" stroke-width="{LW:.0f}" stroke-linecap="round" stroke-linejoin="round" fill="none">' + ''.join(f'<path d="{poly(c)}"/>' for c in chains) +
                f'<path d="M{neck[0]:.0f},{neck[1]:.0f} L{hipc[0]:.0f},{hipc[1]:.0f}" stroke-width="{st["torso"]:.0f}"/></g><circle cx="{hx:.0f}" cy="{hy:.0f}" r="{HR:.0f}" fill="#FFF"/></g>' + tag(HR))
# B: classic animation stick man (uniform lines, joints, solid head, dark keyline)
lw = LW * .42
def keyed(d, w): return f'<path d="{d}" stroke="#15130F" stroke-width="{w + 10:.0f}"/><path d="{d}" stroke="#FFF" stroke-width="{w:.0f}"/>'
body = poly(('neck',)) + f' L{hipc[0]:.0f},{hipc[1]:.0f}'
B = ''.join(f'<path d="{poly(c)}" stroke="#15130F" stroke-width="{lw + 10:.0f}"/>' for c in chains) + f'<path d="{body}" stroke="#15130F" stroke-width="{lw + 10:.0f}"/>'
B += ''.join(f'<path d="{poly(c)}" stroke="#FFF" stroke-width="{lw:.0f}"/>' for c in chains) + f'<path d="{body}" stroke="#FFF" stroke-width="{lw:.0f}"/>'
S['B 经典火柴人（动作最灵活）'] = (f'<g filter="url(#ds)" stroke-linecap="round" stroke-linejoin="round" fill="none">{B}</g><circle cx="{hx:.0f}" cy="{hy:.0f}" r="{HR * .82:.0f}" fill="#FFF" stroke="#15130F" stroke-width="10" filter="url(#ds)"/>' + tag(HR * .82))
# C: rubber hose (curvy limbs, gloves, bean body, keyline)
lw = LW * .62; ol = '#15130F'
bean = (f'M{neck[0] - LW * .9:.0f},{neck[1] + 20:.0f} C{neck[0] - LW * 1.7:.0f},{(neck[1] + hipc[1]) / 2:.0f} {hipc[0] - LW * 2.0:.0f},{hipc[1] + 40:.0f} {hipc[0]:.0f},{hipc[1] + 60:.0f} '
        f'C{hipc[0] + LW * 2.0:.0f},{hipc[1] + 40:.0f} {neck[0] + LW * 1.7:.0f},{(neck[1] + hipc[1]) / 2:.0f} {neck[0] + LW * .9:.0f},{neck[1] + 20:.0f} Z')
C = ''.join(f'<path d="{curve(c)}" stroke="{ol}" stroke-width="{lw + 12:.0f}"/>' for c in chains) + ''.join(f'<path d="{curve(c)}" stroke="#FFF" stroke-width="{lw:.0f}"/>' for c in chains)
gloves = ''.join(f'<circle cx="{pt(w)[0]:.0f}" cy="{pt(w)[1]:.0f}" r="{LW * .62:.0f}" fill="#FFF" stroke="{ol}" stroke-width="8"/>' for w in ('l_wrist', 'r_wrist'))
S['C 橡皮管卡通（弯曲好动）'] = (f'<g filter="url(#ds)" stroke-linecap="round" fill="none">{C}</g><path d="{bean}" fill="#FFF" stroke="{ol}" stroke-width="8" filter="url(#ds)"/>{gloves}'
                     f'<circle cx="{hx:.0f}" cy="{hy:.0f}" r="{HR * 1.05:.0f}" fill="#FFF" stroke="{ol}" stroke-width="8" filter="url(#ds)"/>' + tag(HR * 1.05))
# D: capsule / bean people (soft shaded, no line)
cap = ''.join(f'<path d="{poly(c)}" stroke="url(#cg)" stroke-width="{LW * .95:.0f}"/>' for c in chains)
S['D 胶囊豆豆人'] = (f'<defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D9DEE6"/></linearGradient>'
                   f'<radialGradient id="hg" cx=".35" cy=".3"><stop offset="0" stop-color="#FFF"/><stop offset="1" stop-color="#D6DCE5"/></radialGradient></defs>'
                   f'<g filter="url(#ds)"><g stroke-linecap="round" stroke-linejoin="round" fill="none">{cap}</g>'
                   f'<rect x="{neck[0] - LW * .75:.0f}" y="{neck[1] - 10:.0f}" width="{LW * 1.5:.0f}" height="{hipc[1] - neck[1] + 40:.0f}" rx="{LW * .75:.0f}" fill="url(#cg)"/>'
                   f'<circle cx="{hx:.0f}" cy="{hy:.0f}" r="{HR * 1.05:.0f}" fill="url(#hg)"/></g>' + tag(HR * 1.05))
# E: ink-brush stick man (tapered strokes)
E = ''
for c in chains:
    segs = list(zip(c[:-1], c[1:])); n_ = len(segs)
    for i, (a, b) in enumerate(segs):
        w0 = LW * (.85 - .45 * i / n_); w1 = LW * (.85 - .45 * (i + 1) / n_)
        E += f'<path d="{taper(pt(a), pt(b), w0, w1)}" fill="#FFFDF6"/><circle cx="{pt(b)[0]:.0f}" cy="{pt(b)[1]:.0f}" r="{w1 / 2:.0f}" fill="#FFFDF6"/>'
E += f'<path d="{taper(neck, hipc, LW * 1.0, LW * .55)}" fill="#FFFDF6"/><circle cx="{neck[0]:.0f}" cy="{neck[1]:.0f}" r="{LW * .5:.0f}" fill="#FFFDF6"/>'
r = HR * .95
S['E 毛笔火柴人'] = (f'<g filter="url(#ds)">{E}<circle cx="{hx:.0f}" cy="{hy:.0f}" r="{r:.0f}" fill="#FFFDF6"/></g>' + tag(r))
# F: glowing light line
lw = LW * .28; Fl = ''.join(f'<path d="{poly(c)}"/>' for c in chains) + f'<path d="{body}"/>'
S['F 光线小人'] = (f'<g stroke-linecap="round" stroke-linejoin="round" fill="none"><g stroke="#FFE6A8" stroke-width="{lw * 3.2:.0f}" opacity=".55" filter="url(#glow)">{Fl}<circle cx="{hx:.0f}" cy="{hy:.0f}" r="{HR * .8:.0f}"/></g>'
                 f'<g stroke="#FFFFFF" stroke-width="{lw:.0f}">{Fl}<circle cx="{hx:.0f}" cy="{hy:.0f}" r="{HR * .8:.0f}"/></g></g>' + tag(HR * .8))
b64 = base64.b64encode(open(photo, 'rb').read()).decode()
defs = ('<defs><filter id="ds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="10" dy="16" stdDeviation="14" flood-color="#000" flood-opacity=".35"/></filter>'
        '<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter></defs>')
import os; os.makedirs(outdir, exist_ok=True); files = []
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(viewport={'width': W, 'height': H})
    for i, (name, g) in enumerate(S.items()):
        pg.set_content(f'<html><body style="margin:0"><div id="f" style="position:relative;width:{W}px;height:{H}px"><img src="data:image/jpeg;base64,{b64}" style="position:absolute;width:{W}px;height:{H}px">'
                       f'<svg style="position:absolute;left:0;top:0" width="{W}" height="{H}">{defs}{g}</svg></div></body></html>')
        pg.wait_for_timeout(300); pg.evaluate('document.fonts.ready'); f = f'{outdir}/s{i}.jpg'; pg.locator('#f').screenshot(path=f, type='jpeg', quality=90); files.append((name, f))
    br.close()
cx0, cy0, cx1, cy1 = 0, 760, W, H; sc = .34; tw, th = int((cx1 - cx0) * sc), int((cy1 - cy0) * sc); gap, lab = 16, 64
sheet = Image.new('RGB', (3 * tw + 4 * gap, 2 * (th + lab) + 3 * gap), '#F4F1EA'); d = ImageDraw.Draw(sheet)
ft = ImageFont.truetype(glob.glob('/usr/share/fonts/**/NotoSansCJK*Bold*', recursive=True)[0], 34)
for i, (name, f) in enumerate(files):
    im = Image.open(f).crop((cx0, cy0, cx1, cy1)).resize((tw, th), Image.LANCZOS); c, r = i % 3, i // 3
    x, y = gap + c * (tw + gap), gap + r * (th + lab + gap); d.text((x + 4, y + 10), name, font=ft, fill='#1C1A18'); sheet.paste(im, (x, y + lab))
sheet.save(f'{outdir}/stick_styles_v2.jpg', quality=88); print(sheet.size)
