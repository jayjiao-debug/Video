"""ep57: fuller-bodied 「你」 figures (not stick men) on the real photo, same pose: sign figure, bean buddy,
wooden mannequin, flat-design person. Each is built from joint positions, so it can be animated."""
import sys, json, base64, math, glob, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
photo, posef, outdir = sys.argv[1:4]
P = json.load(open(posef)); J = {k: tuple(v) for k, v in P['joints'].items()}; st = P['style']
W, H = Image.open(photo).size
p = lambda n: J[n]
def mid(a, b, t=.5): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
ls, rs, lh, rh, nk = p('l_shoulder'), p('r_shoulder'), p('l_hip'), p('r_hip'), p('neck')
sw = math.dist(ls, rs); hipc = mid(lh, rh); hx, hy = p('head'); HR = st['head']
def tag(r, top=None):
    ts = st['tag']; ty = (top if top is not None else hy - r) - ts * .55
    return (f'<g filter="url(#ds)"><rect x="{hx - ts * .85:.0f}" y="{ty - ts * 1.25:.0f}" width="{ts * 1.7:.0f}" height="{ts * 1.25:.0f}" rx="{ts * .3:.0f}" fill="#FFF"/>'
            f'<path d="M{hx - ts * .18:.0f},{ty - 1:.0f} L{hx:.0f},{ty + ts * .28:.0f} L{hx + ts * .18:.0f},{ty - 1:.0f}Z" fill="#FFF"/></g>'
            f'<text x="{hx:.0f}" y="{ty - ts * .62:.0f}" font-family="Noto Sans CJK SC" font-weight="900" font-size="{ts * .9:.0f}" text-anchor="middle" dominant-baseline="central" fill="#1C1A18">你</text>')
def seg(a, b, w, c, extra=''): return f'<path d="M{a[0]:.0f},{a[1]:.0f} L{b[0]:.0f},{b[1]:.0f}" stroke="{c}" stroke-width="{w:.0f}" stroke-linecap="round" {extra}/>'
def taper(a, b, w0, w1, c):
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1; nx, ny = -dy / L, dx / L
    q = [(a[0] + nx * w0 / 2, a[1] + ny * w0 / 2), (b[0] + nx * w1 / 2, b[1] + ny * w1 / 2), (b[0] - nx * w1 / 2, b[1] - ny * w1 / 2), (a[0] - nx * w0 / 2, a[1] - ny * w0 / 2)]
    return f'<path d="M' + ' L'.join(f'{x:.0f},{y:.0f}' for x, y in q) + f'Z" fill="{c}"/><circle cx="{a[0]:.0f}" cy="{a[1]:.0f}" r="{w0 / 2:.0f}" fill="{c}"/><circle cx="{b[0]:.0f}" cy="{b[1]:.0f}" r="{w1 / 2:.0f}" fill="{c}"/>'
def ell(a, b, w, c, extra=''):
    cx, cy = mid(a, b); L = math.dist(a, b); ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
    return f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{L / 2 + w * .25:.0f}" ry="{w / 2:.0f}" transform="rotate({ang:.1f} {cx:.0f} {cy:.0f})" fill="{c}" {extra}/>'
arms = [('l_shoulder', 'l_elbow', 'l_wrist'), ('r_shoulder', 'r_elbow', 'r_wrist')];
tl = math.dist(J['neck'], mid(J['l_hip'], J['r_hip']))
J['l_root'] = (J['neck'][0] - math.dist(J['l_shoulder'], J['r_shoulder']) * .36, J['neck'][1] + tl * .16)
J['r_root'] = (J['neck'][0] + math.dist(J['l_shoulder'], J['r_shoulder']) * .36, J['neck'][1] + tl * .16)
arms2 = [('l_root', 'l_elbow', 'l_wrist'), ('r_root', 'r_elbow', 'r_wrist')]; legs = [('l_hip', 'l_knee', 'l_ankle'), ('r_hip', 'r_knee', 'r_ankle')]
S = {}
# A: sign figure (solid torso, thick limbs, head apart)
lw = sw * .18; c = '#FFFFFF'; tw2 = sw * .36
torso = f'M{nk[0] - tw2:.0f},{nk[1] + 5:.0f} L{nk[0] + tw2:.0f},{nk[1] + 5:.0f} L{hipc[0] + tw2:.0f},{hipc[1] + 30:.0f} L{hipc[0] - tw2:.0f},{hipc[1] + 30:.0f} Z'
J['l_hipn'] = (hipc[0] - tw2 * .55, hipc[1]); J['r_hipn'] = (hipc[0] + tw2 * .55, hipc[1])
legs2 = [('l_hipn', 'l_knee', 'l_ankle'), ('r_hipn', 'r_knee', 'r_ankle')]
A = ''.join(seg(p(a), p(b), lw, c) + seg(p(b), p(cc), lw * .9, c) for a, b, cc in arms2 + legs2)
A += f'<path d="{torso}" fill="{c}" stroke="{c}" stroke-width="{lw * .9:.0f}" stroke-linejoin="round"/>'
S['A 标志人 · 中性'] = f'<g filter="url(#ds)">{A}<circle cx="{hx:.0f}" cy="{hy - HR * .25:.0f}" r="{HR * 1.15:.0f}" fill="{c}"/></g>' + tag(HR * 1.15, hy - HR * 1.4)
# B: bean buddy (round body, big head, stubby tapered limbs, mitts) - soft shading
body_c = mid(nk, hipc, .5); brx, bry = sw * .5, math.dist(nk, hipc) * .62
B = ''.join(taper(p(a), p(b), sw * .2, sw * .17, '#FFFFFF') + taper(p(b), p(cc), sw * .17, sw * .14, '#FFFFFF') for a, b, cc in arms2 + legs)
B += ''.join(f'<circle cx="{p(w)[0]:.0f}" cy="{p(w)[1]:.0f}" r="{sw * .1:.0f}" fill="#FFFFFF"/>' for w in ('l_wrist', 'r_wrist'))
B += f'<path d="M{nk[0] - sw * .3:.0f},{nk[1] + 10:.0f} C{nk[0] - sw * .55:.0f},{nk[1] + tl * .5:.0f} {hipc[0] - sw * .5:.0f},{hipc[1] + 30:.0f} {hipc[0]:.0f},{hipc[1] + 40:.0f} C{hipc[0] + sw * .5:.0f},{hipc[1] + 30:.0f} {nk[0] + sw * .55:.0f},{nk[1] + tl * .5:.0f} {nk[0] + sw * .3:.0f},{nk[1] + 10:.0f} Z" fill="#FFFFFF"/>'
S['B 胖胖小人 · 中性'] = (f'<defs><radialGradient id="bg" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1F2F4"/><stop offset="1" stop-color="#D3D8E0"/></radialGradient></defs>'
                 f'<g filter="url(#ds)">{B}<circle cx="{hx:.0f}" cy="{hy - HR * .3:.0f}" r="{HR * 1.3:.0f}" fill="#FFFFFF"/></g>' + tag(HR * 1.3, hy - HR * 1.6))
# C: wooden-style mannequin (oval segments + ball joints), warm white
cc_ = '#F7F1E6'; jc = '#E4DACA'
C = ''.join(ell(p(a), p(b), sw * .2, 'url(#mg)') + ell(p(b), p(cc), sw * .17, 'url(#mg)') for a, b, cc in arms2 + legs)
C += ''.join(f'<circle cx="{p(j)[0]:.0f}" cy="{p(j)[1]:.0f}" r="{sw * .1:.0f}" fill="{jc}"/>' for j in ('l_root', 'r_root', 'l_elbow', 'r_elbow', 'l_hip', 'r_hip', 'l_knee', 'r_knee'))
chest = mid(nk, hipc, .36); pelvis = mid(nk, hipc, .9)
C += f'<ellipse cx="{chest[0]:.0f}" cy="{chest[1]:.0f}" rx="{sw * .37:.0f}" ry="{math.dist(nk, hipc) * .34:.0f}" fill="url(#mg)"/>'
C += f'<ellipse cx="{pelvis[0]:.0f}" cy="{pelvis[1]:.0f}" rx="{sw * .36:.0f}" ry="{math.dist(nk, hipc) * .2:.0f}" fill="url(#mg)"/>'
C += f'<circle cx="{mid(chest, pelvis)[0]:.0f}" cy="{mid(chest, pelvis)[1] + 20:.0f}" r="{sw * .12:.0f}" fill="{jc}"/>'
C += ''.join(f'<ellipse cx="{p(w)[0]:.0f}" cy="{p(w)[1]:.0f}" rx="{sw * .1:.0f}" ry="{sw * .13:.0f}" fill="url(#mg)"/>' for w in ('l_wrist', 'r_wrist'))
S['C 木偶人 · 中性'] = (f'<defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="{jc}"/></linearGradient></defs>'
                       f'<g filter="url(#ds)">{C}<rect x="{nk[0] - sw * .07:.0f}" y="{hy:.0f}" width="{sw * .14:.0f}" height="{nk[1] - hy + 20:.0f}" fill="{jc}"/><ellipse cx="{hx:.0f}" cy="{hy - HR * .15:.0f}" rx="{HR * .95:.0f}" ry="{HR * 1.15:.0f}" fill="url(#mg)"/></g>' + tag(HR * 1.15, hy - HR * 1.3))
# D: neutral flat figure (one colour, soft two-tone, capsule torso)
fc, sc = '#FFFFFF', '#E7E9EE'
D = ''.join(taper(p(a), p(b), sw * .17, sw * .15, fc) + taper(p(b), p(cc), sw * .15, sw * .12, fc) for a, b, cc in arms2)
D += ''.join(taper(p(a), p(b), sw * .19, sw * .16, fc) + taper(p(b), p(cc), sw * .16, sw * .13, fc) for a, b, cc in [('l_hipn', 'l_knee', 'l_ankle'), ('r_hipn', 'r_knee', 'r_ankle')])
D += f'<rect x="{nk[0] - sw * .34:.0f}" y="{nk[1] - 5:.0f}" width="{sw * .68:.0f}" height="{hipc[1] - nk[1] + 60:.0f}" rx="{sw * .3:.0f}" fill="{fc}"/>'
D += f'<rect x="{nk[0] + sw * .05:.0f}" y="{nk[1] + 20:.0f}" width="{sw * .27:.0f}" height="{hipc[1] - nk[1] + 10:.0f}" rx="{sw * .14:.0f}" fill="{sc}" opacity=".7"/>'
S['D 扁平小人 · 中性'] = f'<g filter="url(#ds)">{D}<circle cx="{hx:.0f}" cy="{hy - HR * .15:.0f}" r="{HR * 1.1:.0f}" fill="{fc}"/></g>' + tag(HR * 1.1, hy - HR * 1.25)
b64 = base64.b64encode(open(photo, 'rb').read()).decode()
defs = '<defs><filter id="ds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="10" dy="16" stdDeviation="14" flood-color="#000" flood-opacity=".33"/></filter></defs>'
os.makedirs(outdir, exist_ok=True); files = []
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page(viewport={'width': W, 'height': H})
    for i, (name, g) in enumerate(S.items()):
        pg.set_content(f'<html><body style="margin:0"><div id="f" style="position:relative;width:{W}px;height:{H}px"><img src="data:image/jpeg;base64,{b64}" style="position:absolute;width:{W}px;height:{H}px">'
                       f'<svg style="position:absolute;left:0;top:0" width="{W}" height="{H}">{defs}{g}</svg></div></body></html>')
        pg.wait_for_timeout(300); pg.evaluate('document.fonts.ready'); f = f'{outdir}/c{i}.jpg'; pg.locator('#f').screenshot(path=f, type='jpeg', quality=90); files.append((name, f))
    br.close()
cx0, cy0, cx1, cy1 = 0, 760, W, H; sc = .34; tw, th = int((cx1 - cx0) * sc), int((cy1 - cy0) * sc); gap, lab = 16, 64
sheet = Image.new('RGB', (2 * tw + 3 * gap, 2 * (th + lab) + 3 * gap), '#F4F1EA'); d = ImageDraw.Draw(sheet)
ft = ImageFont.truetype(glob.glob('/usr/share/fonts/**/NotoSansCJK*Bold*', recursive=True)[0], 34)
for i, (name, f) in enumerate(files):
    im = Image.open(f).crop((cx0, cy0, cx1, cy1)).resize((tw, th), Image.LANCZOS); cc2, r = i % 2, i // 2
    x, y = gap + cc2 * (tw + gap), gap + r * (th + lab + gap); d.text((x + 4, y + 10), name, font=ft, fill='#1C1A18'); sheet.paste(im, (x, y + lab))
sheet.save(f'{outdir}/neutral_styles_v1.jpg', quality=88); print(sheet.size)
