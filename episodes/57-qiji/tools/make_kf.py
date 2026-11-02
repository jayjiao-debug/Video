"""ep57 key frames (mock-ups for the owner): 8 frames as HTML+SVG, screenshot with Playwright, then a labelled sheet.
Photo stops use PAINTED STAND-INS for the real photos (the owner picks the real ones); everything else is the planned look."""
import json, math, os, base64, random
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__))
G = json.load(open(f'{D}/globe.json'))
SEAL = base64.b64encode(open('/home/claude/video/episodes/37-qiqing/remotion/public/ep44/jseal.png', 'rb').read()).decode()
CREAM, GOLD = '#FFF6E6', '#F2C66E'
W, H = 1920, 1080

def f1(v): return f'{v:.1f}'
def ridge(y0, amp, seed, x0=-20, x1=1940, step=20, base=1100):
    r = random.Random(seed); ph = [r.random() * 6.28 for _ in range(4)]
    pts = [(x, y0 + amp * (0.55 * math.sin(x / 260 + ph[0]) + 0.3 * math.sin(x / 117 + ph[1]) + 0.15 * math.sin(x / 47 + ph[2]))) for x in range(x0, x1 + step, step)]
    return 'M' + ' L'.join(f'{f1(x)},{f1(y)}' for x, y in pts) + f' L{x1},{base} L{x0},{base} Z', pts

# ---------- the white 「你」 figure ----------
POSE = {
    'walk': dict(legs=[[(0, -.48), (-.07, -.25), (-.16, 0)], [(0, -.48), (.06, -.24), (.12, 0)]], arms=[[(0, -.77), (-.09, -.62), (-.13, -.48)], [(0, -.77), (.08, -.63), (.14, -.51)]], hip=-.48, neck=-.80, head=(0, -.915)),
    'open': dict(legs=[[(0, -.48), (-.06, -.24), (-.09, 0)], [(0, -.48), (.06, -.24), (.09, 0)]], arms=[[(0, -.77), (-.2, -.78), (-.38, -.79)], [(0, -.77), (.2, -.78), (.38, -.79)]], hip=-.48, neck=-.80, head=(0, -.915)),
    'spread': dict(legs=[[(0, -.48), (-.08, -.24), (-.13, 0)], [(0, -.48), (.08, -.24), (.13, 0)]], arms=[[(0, -.77), (-.17, -.93), (-.27, -1.06)], [(0, -.77), (.17, -.93), (.27, -1.06)]], hip=-.48, neck=-.80, head=(0, -.915)),
    'thumb': dict(legs=[[(0, -.48), (-.05, -.24), (-.08, 0)], [(0, -.48), (.05, -.24), (.08, 0)]], arms=[[(0, -.77), (-.08, -.62), (-.1, -.47)], [(0, -.77), (.17, -.7), (.19, -.9)]], hip=-.48, neck=-.80, head=(0, -.915)),
    'step': dict(legs=[[(0, -.48), (-.05, -.24), (-.08, 0)], [(0, -.48), (.12, -.33), (.16, -.14)]], arms=[[(0, -.77), (-.1, -.62), (-.12, -.47)], [(0, -.77), (.09, -.62), (.13, -.49)]], hip=-.48, neck=-.80, head=(0, -.915)),
    'sit': dict(legs=[[(0, -.30), (.17, -.30), (.19, 0)], [(0, -.30), (.13, -.31), (.15, 0)]], arms=[[(0, -.58), (.07, -.45), (.14, -.32)], [(0, -.58), (-.04, -.45), (.02, -.33)]], hip=-.30, neck=-.62, head=(0, -.735)),
    'look': dict(legs=[[(0, -.48), (-.05, -.24), (-.07, 0)], [(0, -.48), (.05, -.24), (.07, 0)]], arms=[[(0, -.77), (-.07, -.62), (-.09, -.47)], [(0, -.77), (.07, -.62), (.09, -.47)]], hip=-.48, neck=-.80, head=(.015, -.925)),
}
def fig(x, yf, h, pose, label=True, uid='f'):
    p = POSE[pose]; sw = .105 * h
    pl = lambda pts: 'M' + ' L'.join(f'{f1(x + a * h)},{f1(yf + b * h)}' for a, b in pts)
    body = ''.join(f'<path d="{pl(L)}" />' for L in p['legs'] + p['arms'])
    torso = f'<path d="{pl([(0, p["hip"]), (0, p["neck"])])}" stroke-width="{f1(.17 * h)}" />'
    hx, hy = x + p['head'][0] * h, yf + p['head'][1] * h
    tag = ''
    if label:
        ts = max(26, .1 * h); ty = hy - .16 * h
        tag = (f'<g><rect x="{f1(hx - ts * .85)}" y="{f1(ty - ts * .78)}" width="{f1(ts * 1.7)}" height="{f1(ts * 1.25)}" rx="{f1(ts * .3)}" fill="#FFFFFF" />'
               f'<path d="M{f1(hx - ts * .18)},{f1(ty + ts * .46)} L{f1(hx)},{f1(ty + ts * .72)} L{f1(hx + ts * .18)},{f1(ty + ts * .46)}Z" fill="#FFFFFF" />'
               f'<text x="{f1(hx)}" y="{f1(ty - ts * .12)}" font-family="Noto Sans CJK SC" font-weight="900" font-size="{f1(ts * .9)}" text-anchor="middle" dominant-baseline="central" fill="#1C1A18">你</text></g>')
    return (f'<g><ellipse cx="{f1(x)}" cy="{f1(yf)}" rx="{f1(.2 * h)}" ry="{f1(.03 * h)}" fill="#000" opacity="0.28" />'
            f'<g filter="url(#ds)" stroke="#FFFFFF" stroke-width="{f1(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none">{body}{torso}</g>'
            f'<circle cx="{f1(hx)}" cy="{f1(hy)}" r="{f1(.085 * h)}" fill="#FFFFFF" filter="url(#ds)" />{tag}</g>')

DEFS = '''<defs><filter id="ds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/></filter>
<filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter><filter id="blur30"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'''

# ---------- painted stand-ins for the real photos ----------
def sc_greatwall(fig_on=True):
    s = ['<linearGradient id="gwsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5F7AA8"/><stop offset=".55" stop-color="#E9A978"/><stop offset=".72" stop-color="#FBD7A4"/></linearGradient>',
         '<radialGradient id="gwsun"><stop offset="0" stop-color="#FFF4D8"/><stop offset=".25" stop-color="#FFE0A0" stop-opacity=".9"/><stop offset="1" stop-color="#FFD090" stop-opacity="0"/></radialGradient>']
    out = [f'<defs>{"".join(s)}</defs><rect width="1920" height="1080" fill="url(#gwsky)"/><circle cx="1430" cy="470" r="380" fill="url(#gwsun)"/><circle cx="1430" cy="470" r="70" fill="#FFF6DE"/>']
    for i, (y0, a, c) in enumerate([(520, 60, '#B7A9B4'), (590, 80, '#8E8AA2'), (680, 110, '#6A6984')]):
        d, _ = ridge(y0, a, 11 + i); out.append(f'<path d="{d}" fill="{c}" opacity="{.85 if i < 2 else 1}"/>')
    d, pts = ridge(760, 120, 31); out.append(f'<path d="{d}" fill="#4E5068"/>')
    wall = [(x, y - 14) for x, y in pts if 120 < x < 1800]
    wp = 'M' + ' L'.join(f'{f1(x)},{f1(y)}' for x, y in wall)
    out.append(f'<path d="{wp}" stroke="#8C7461" stroke-width="22" fill="none" stroke-linejoin="round"/><path d="{wp}" stroke="#E2B98A" stroke-width="8" fill="none" transform="translate(0,-9)" stroke-dasharray="9 7"/>')
    for x, y in wall[::9]: out.append(f'<rect x="{f1(x - 22)}" y="{f1(y - 52)}" width="44" height="46" fill="#7E6857"/><rect x="{f1(x - 22)}" y="{f1(y - 52)}" width="44" height="8" fill="#E2B98A"/>')
    # the foreground walkway in perspective
    out.append('<path d="M-20,1100 L-20,870 C 500,800 1100,760 1940,700 L1940,1100 Z" fill="#7A5E48"/>')
    out.append('<path d="M-20,905 C 500,835 1100,795 1940,735 L1940,760 C 1100,820 500,860 -20,930 Z" fill="#C79B70"/>')
    out.append('<path d="M-20,930 C 500,860 1100,820 1940,760 L1940,1100 L-20,1100 Z" fill="#A7805C"/>')
    for i in range(26):
        x = -20 + i * 80; y = 870 - (x + 20) / 1960 * 170
        out.append(f'<rect x="{f1(x)}" y="{f1(y - 38)}" width="44" height="40" fill="#8E6F55"/><rect x="{f1(x)}" y="{f1(y - 38)}" width="44" height="7" fill="#E2B98A"/>')
    out.append('<rect width="1920" height="1080" fill="#FFB070" opacity="0.08"/>')
    if fig_on: out.append(fig(1180, 975, 300, 'walk'))
    return ''.join(out)

def sc_christ(fig_on=True):
    out = ['<defs><linearGradient id="crsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5D9BD8"/><stop offset=".7" stop-color="#CFE5F5"/><stop offset="1" stop-color="#F1F6F8"/></linearGradient></defs>',
           '<rect width="1920" height="1080" fill="url(#crsky)"/>']
    for cx, cy, rx in [(420, 260, 210), (700, 200, 160), (1650, 330, 230)]: out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{rx * .32}" fill="#FFFFFF" opacity=".8" filter="url(#blur8)"/>')
    out.append('<path d="M-20,820 C 200,780 420,800 700,770 L700,1100 L-20,1100Z" fill="#8FB7CC"/>')
    for i in range(24): out.append(f'<rect x="{20 + i * 28}" y="{790 + (i * 37) % 40}" width="18" height="{20 + (i * 13) % 30}" fill="#F3F1EA" opacity=".85"/>')
    out.append('<path d="M560,1100 C 760,820 980,560 1180,470 C 1300,430 1360,470 1460,560 C 1640,730 1800,860 1960,940 L1960,1100Z" fill="#3F5B43"/>')
    out.append('<path d="M1150,480 C 1240,440 1320,450 1380,500 L1360,520 C 1300,480 1240,480 1170,505Z" fill="#6E8B67"/>')
    # the statue
    out.append('<g fill="#E9E5DC"><rect x="1236" y="420" width="70" height="60"/><path d="M1252,420 L1290,420 L1302,250 L1240,250Z"/><rect x="1120" y="262" width="300" height="26" rx="10"/><circle cx="1271" cy="232" r="20"/></g>')
    out.append('<g fill="#C9C4B8"><path d="M1271,250 L1302,250 L1290,420 L1271,420Z"/><rect x="1271" y="275" width="149" height="13"/></g>')
    if fig_on: out.append(fig(760, 1010, 360, 'open'))
    return ''.join(out)

def sc_chichen(fig_on=True):
    out = ['<defs><linearGradient id="chsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E8FD0"/><stop offset="1" stop-color="#D8ECF7"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#chsky)"/>']
    out.append('<path d="M-20,760 C 400,720 900,740 1940,730 L1940,1100 L-20,1100Z" fill="#3E6B3A"/>')
    for i in range(9):
        w = 1100 - i * 100; y = 820 - i * 62
        out.append(f'<rect x="{960 - w / 2}" y="{y - 62}" width="{w}" height="64" fill="#CDB693"/><rect x="{960 - w / 2}" y="{y - 62}" width="{w}" height="8" fill="#E6D3B2"/>')
    out.append('<rect x="845" y="200" width="230" height="110" fill="#BFA57F"/><rect x="900" y="240" width="40" height="70" fill="#5C4A36"/><rect x="980" y="240" width="40" height="70" fill="#5C4A36"/>')
    out.append('<path d="M890,820 L1030,820 L1000,258 L920,258Z" fill="#B59C77"/>')
    for i in range(36): out.append(f'<rect x="{904 + (36 - i) * 0}" y="{262 + i * 15.5}" width="{112}" height="5" fill="#9C845F"/>')
    out.append('<path d="M-20,900 C 400,860 1100,880 1940,860 L1940,1100 L-20,1100Z" fill="#C7B795"/>')
    if fig_on: out.append(fig(960, 1000, 300, 'step'))
    return ''.join(out)

def sc_machu(fig_on=True):
    out = ['<defs><linearGradient id="mpsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA9C4"/><stop offset="1" stop-color="#E7EEF2"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#mpsky)"/>']
    out.append('<path d="M1050,1100 C 1130,600 1260,260 1360,230 C 1450,210 1520,420 1600,700 C 1680,900 1800,1000 1960,1050 L1960,1100Z" fill="#2F4B33"/>')
    out.append('<path d="M-20,1100 C 300,900 600,820 900,780 C 1100,760 1300,800 1500,900 L1500,1100Z" fill="#5C7A4C"/>')
    for i in range(8): out.append(f'<path d="M{40 + i * 30},{1080 - i * 34} C {500},{900 - i * 22} {900},{860 - i * 18} {1400 - i * 30},{960 - i * 20}" stroke="#86A26C" stroke-width="10" fill="none"/>')
    for i in range(10): out.append(f'<rect x="{620 + (i % 5) * 70}" y="{800 + (i // 5) * 40}" width="50" height="30" fill="#A99C86"/>')
    for cx, cy, rx in [(1300, 560, 420), (500, 640, 360)]: out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="60" fill="#FFFFFF" opacity=".55" filter="url(#blur30)"/>')
    if fig_on: out.append(fig(420, 1030, 320, 'spread'))
    return ''.join(out)

def sc_colosseum(fig_on=True):
    out = ['<defs><linearGradient id="cosky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7A867"/><stop offset="1" stop-color="#FBE2B7"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#cosky)"/>']
    out.append('<path d="M260,900 L260,380 C 700,300 1300,300 1700,380 L1700,900Z" fill="#C88E5E"/>')
    out.append('<path d="M1300,330 C 1500,345 1640,365 1700,380 L1700,900 L1350,900Z" fill="#A86E44"/>')
    for row in range(4):
        for i in range(16):
            x = 300 + i * 88; y = 410 + row * 118
            out.append(f'<rect x="{x}" y="{y}" width="52" height="{78 if row < 3 else 60}" rx="26" fill="#6A3E22" opacity=".8"/>')
    out.append('<rect x="-20" y="900" width="1960" height="200" fill="#D8BC93"/>')
    if fig_on: out.append(fig(1500, 1010, 300, 'thumb'))
    return ''.join(out)

def sc_petra(fig_on=True):
    out = ['<rect width="1920" height="1080" fill="#E9B08E"/>',
           '<path d="M-20,-20 L520,-20 C 560,300 600,700 560,1100 L-20,1100Z" fill="#7E3D2B"/>',
           '<path d="M1940,-20 L1400,-20 C 1360,300 1320,700 1360,1100 L1940,1100Z" fill="#6F3426"/>']
    out.append('<rect x="640" y="150" width="640" height="860" fill="#D99572"/>')
    for i in range(6): out.append(f'<rect x="{680 + i * 106}" y="620" width="40" height="390" fill="#C27E5C"/>')
    out.append('<path d="M640,620 L960,500 L1280,620Z" fill="#C88565"/><rect x="900" y="180" width="120" height="260" fill="#C27E5C"/><path d="M860,180 L960,120 L1060,180Z" fill="#C88565"/>')
    out.append('<rect x="905" y="760" width="110" height="250" fill="#4A2219"/><rect x="-20" y="1000" width="1960" height="100" fill="#C9906F"/>')
    if fig_on: out.append(fig(980, 1050, 170, 'look'))
    return ''.join(out)

def sc_taj(fig_on=True):
    out = ['<defs><linearGradient id="tjsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7B9C3"/><stop offset="1" stop-color="#FCE9DA"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#tjsky)"/>']
    out.append('<g fill="#FBF6EE"><rect x="760" y="400" width="400" height="300"/><ellipse cx="960" cy="400" rx="140" ry="150"/><rect x="955" y="210" width="10" height="60"/>'
               '<rect x="600" y="300" width="30" height="400"/><rect x="1290" y="300" width="30" height="400"/><ellipse cx="615" cy="300" rx="26" ry="22"/><ellipse cx="1305" cy="300" rx="26" ry="22"/></g>')
    out.append('<path d="M860,700 L860,560 C 860,500 1060,500 1060,560 L1060,700Z" fill="#E6DDD0"/>')
    out.append('<rect x="-20" y="700" width="1960" height="400" fill="#7E9C6E"/><path d="M900,700 L1020,700 L1300,1100 L620,1100Z" fill="#9CC3D8"/>')
    out.append('<path d="M900,700 L1020,700 L1300,1100 L620,1100Z" fill="#FFFFFF" opacity=".15"/>')
    out.append('<rect x="1180" y="930" width="300" height="24" fill="#E8E2D6"/><rect x="1195" y="954" width="14" height="50" fill="#CFC7B8"/><rect x="1452" y="954" width="14" height="50" fill="#CFC7B8"/>')
    if fig_on: out.append(fig(1320, 1000, 300, 'sit'))
    return ''.join(out)

SCENES = dict(gw=('长城', sc_greatwall), ci=('奇琴伊察', sc_chichen), mp=('马丘比丘', sc_machu), cr=('基督像', sc_christ), co=('斗兽场', sc_colosseum), pe=('佩特拉', sc_petra), tj=('泰姬陵', sc_taj))

# ---------- overlays ----------
def subs(rows, top=132):
    def part(r):
        import re
        return re.sub(r'\[([^\]]+)\]', r'<span style="border-bottom:7px solid #F2C66E;padding-bottom:2px">\1</span>', r)
    return (f'<div style="position:absolute;left:150px;top:{top}px;font-family:Noto Sans CJK SC;font-weight:900;font-size:65px;line-height:1.5;letter-spacing:.03em;'
            f'color:{CREAM};text-shadow:0 0 18px rgba(14,8,5,.85),0 2px 4px rgba(14,8,5,.9);white-space:nowrap">{"<br>".join(part(r) for r in rows)}</div>')
def counter(n, hot=False):
    cam = '<svg width="38" height="30" viewBox="0 0 38 30"><rect x="1" y="6" width="36" height="23" rx="5" fill="none" stroke="#FFF6E6" stroke-width="3"/><circle cx="19" cy="17.5" r="7" fill="none" stroke="#FFF6E6" stroke-width="3"/><rect x="12" y="1" width="14" height="6" rx="2" fill="#FFF6E6"/></svg>'
    bg = 'rgba(242,198,110,.95)' if hot else 'rgba(14,8,5,.55)'
    return (f'<div style="position:absolute;right:150px;top:70px;display:flex;align-items:center;gap:14px;padding:12px 26px;border-radius:40px;background:{bg};'
            f'font-family:Noto Sans CJK SC;font-weight:800;font-size:40px;color:{CREAM}">{cam}<span>打卡 {n}/7</span></div>')
def odo(km, ghost=False):
    g = ''
    if ghost: g = f'<span style="position:absolute;left:0;top:-.62em;opacity:.22;filter:blur(1.5px)">{km + 1873:,}</span><span style="position:absolute;left:0;top:.62em;opacity:.22;filter:blur(1.5px)">{max(0, km - 2390):,}</span>'
    return (f'<div style="position:absolute;left:150px;bottom:70px;color:{CREAM};font-family:Noto Sans CJK SC;text-shadow:0 0 14px rgba(14,8,5,.8);display:flex;align-items:baseline;gap:12px">'
            f'<span style="font-size:34px;font-weight:700">已飞</span><span style="position:relative;font-size:78px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1">{g}<span>{km:,}</span></span><span style="font-size:34px;font-weight:700">公里</span></div>')
SEALD = f'<img src="data:image/png;base64,{SEAL}" style="position:absolute;right:150px;bottom:60px;width:74px;opacity:.9;transform:rotate(-6deg)">'
def stand_in(txt='示意：此处换成实拍照片'):
    return f'<div style="position:absolute;left:0;right:0;bottom:22px;text-align:center;font-family:Noto Sans CJK SC;font-size:24px;color:rgba(255,255,255,.75);text-shadow:0 1px 3px #000">{txt}</div>'
def page(svg, overlay):
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>html,body{{margin:0;background:#000}}#f{{position:relative;width:1920px;height:1080px;overflow:hidden}}</style></head>
<body><div id="f"><svg width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0">{DEFS}{svg}</svg>{overlay}</div></body></html>'''

def globe_svg(v, lit, extra=''):
    o = G[v]; cx, cy, r = o['cx'], o['cy'], o['r']; stars = ''.join(f'<circle cx="{(i * 397) % 1920}" cy="{(i * 211) % 1080}" r="{1 + (i % 3) * .6}" fill="#FFFFFF" opacity="{.25 + (i % 5) * .1}"/>' for i in range(140))
    pts = ''
    for k, p in o['pts'].items():
        if not p['vis'] or k == 'gz': continue
        x, y = p['xy']; on = k in lit
        pts += (f'<circle cx="{f1(x)}" cy="{f1(y)}" r="16" fill="{GOLD}" opacity=".35" filter="url(#blur8)"/><circle cx="{f1(x)}" cy="{f1(y)}" r="8" fill="{GOLD}"/>' if on else
                f'<circle cx="{f1(x)}" cy="{f1(y)}" r="7" fill="#9AA3B5"/>')
    return (f'<defs><radialGradient id="oc" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#2E6A9E"/><stop offset="1" stop-color="#0D2742"/></radialGradient>'
            f'<linearGradient id="spc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070B16"/><stop offset="1" stop-color="#18213A"/></linearGradient></defs>'
            f'<rect width="1920" height="1080" fill="url(#spc)"/>{stars}<circle cx="{cx}" cy="{cy}" r="{r + 26}" fill="#5FA8E8" opacity=".18" filter="url(#blur30)"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#oc)"/><path d="{o["grat"]}" stroke="#FFFFFF" stroke-opacity=".07" fill="none"/>'
            f'<path d="{o["land"]}" fill="#C8B48C" stroke="#E9D9B4" stroke-width="1"/>{extra}{pts}')

def plane(x, y, ang, s=1):
    return (f'<g transform="translate({f1(x)},{f1(y)}) rotate({f1(ang)}) scale({s})"><path d="M-30,0 L22,-4 C 32,-4 32,4 22,4 Z" fill="#FFFFFF"/><path d="M-4,-2 L-16,-24 L-8,-24 L10,-2Z M-4,2 L-16,24 L-8,24 L10,2Z M-28,-1 L-34,-11 L-29,-11 L-20,-1Z M-28,1 L-34,11 L-29,11 L-20,1Z" fill="#FFFFFF"/></g>')

FR = []
# 1 · frame 0: the first 打卡照 (长城)
FR.append(('0:00 第0帧 · 第一张打卡照：长城（照片为示意，换实拍）', page(sc_greatwall(), subs(['新世界七大奇迹，', '你是不是[只去过长城]？']) + counter(1) + SEALD + stand_in())))
# 2 · boarding gate POV (drawn)
bp = ('<g transform="translate(980,610) rotate(-7)"><rect x="-430" y="-200" width="860" height="400" rx="22" fill="#FBF3E2"/><rect x="-430" y="-200" width="860" height="78" rx="22" fill="#C0392B"/><rect x="-430" y="-150" width="860" height="28" fill="#C0392B"/>'
      '<text x="-395" y="-150" font-family="Noto Sans CJK SC" font-weight="800" font-size="34" fill="#FFF6E6">登机牌 BOARDING PASS</text>'
      '<text x="-395" y="-60" font-family="Noto Sans CJK SC" font-size="26" fill="#8A7D6C">出发</text><text x="-395" y="-10" font-family="Noto Sans CJK SC" font-weight="900" font-size="54" fill="#2A2420">长城</text>'
      '<text x="-150" y="-60" font-family="Noto Sans CJK SC" font-size="26" fill="#8A7D6C">目的地</text><text x="-150" y="-10" font-family="Noto Sans CJK SC" font-weight="900" font-size="54" fill="#2A2420">新世界七大奇迹 ×6</text>'
      '<text x="-395" y="70" font-family="Noto Sans CJK SC" font-size="26" fill="#8A7D6C">登机口</text><text x="-395" y="120" font-family="Noto Sans CJK SC" font-weight="800" font-size="46" fill="#2A2420">G7</text>'
      '<text x="-210" y="70" font-family="Noto Sans CJK SC" font-size="26" fill="#8A7D6C">座位</text><text x="-210" y="120" font-family="Noto Sans CJK SC" font-weight="800" font-size="46" fill="#2A2420">7A</text>'
      '<text x="-40" y="70" font-family="Noto Sans CJK SC" font-size="26" fill="#8A7D6C">乘客</text><text x="-40" y="120" font-family="Noto Sans CJK SC" font-weight="900" font-size="46" fill="#C0392B">你</text>'
      + ''.join(f'<rect x="{230 + i * 7}" y="40" width="{3 if i % 3 else 5}" height="120" fill="#2A2420"/>' for i in range(24)) + '</g>')
hand = ('<g><path d="M1330,1100 C 1340,980 1360,880 1395,800 C 1410,770 1450,760 1480,775 L1560,830 C 1600,860 1620,960 1630,1100Z" fill="#1A1410"/>'
        '<path d="M1395,800 C 1410,770 1450,760 1480,775" stroke="#F2A65A" stroke-width="4" fill="none" opacity=".85"/>'
        '<g transform="rotate(-30 1405 742)"><rect x="1360" y="722" width="110" height="44" rx="22" fill="#1A1410"/><path d="M1366,730 C 1400,722 1440,722 1466,730" stroke="#F2A65A" stroke-width="3" fill="none" opacity=".85"/></g></g>')
gate = ('<defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4B5C93"/><stop offset=".65" stop-color="#E99A5C"/><stop offset="1" stop-color="#F6C27F"/></linearGradient></defs>'
        '<rect width="1920" height="1080" fill="#121826"/><rect x="120" y="90" width="1680" height="640" rx="20" fill="url(#dusk)"/>'
        '<path d="M120,560 L1800,560 L1800,730 L120,730Z" fill="#2B2F3E"/>' + ''.join(f'<circle cx="{150 + i * 60}" cy="620" r="4" fill="#FFD27A"/>' for i in range(28)) +
        '<g fill="#0D111C"><path d="M520,520 L1340,500 C 1400,500 1420,520 1400,540 L560,560Z"/><path d="M820,525 L700,420 L760,420 L960,520Z"/><path d="M820,545 L640,640 L700,640 L960,545Z"/><path d="M560,525 L500,440 L540,440 L620,520Z"/></g>'
        '<g stroke="#2A3245" stroke-width="16"><line x1="680" y1="90" x2="680" y2="730"/><line x1="1240" y1="90" x2="1240" y2="730"/></g>' + bp)
FR.append(('0:03 登机口 POV（手绘）：「带你把剩下6个，一次看完」', page(gate, subs(['今天，带你把[剩下6个]，', '一次看完。']) + counter(1) + odo(0) + SEALD)))
# 3 · globe hop across the Pacific
o = G['pacific']; arc = o['legs'][0]['front']
ex = (f'<path d="{arc}" stroke="{GOLD}" stroke-width="16" fill="none" opacity=".35" filter="url(#blur8)"/><path d="{arc}" stroke="{GOLD}" stroke-width="5" fill="none" stroke-linecap="round"/>')
ci = o['pts']['ci']['xy']; FR.append(('0:19 地球仪跳转（无国界线）：横跨太平洋，里程表在转', page(globe_svg('pacific', {'gw', 'ci'}, ex + plane(ci[0] - 26, ci[1] - 6, 12, 1.2)), subs(['下一站，直接横跨[太平洋]。']) + counter(1) + odo(12766, ghost=True) + SEALD)))
# 4 · Chichen Itza serpent shadow (drawn, the big moment)
ch = ['<defs><linearGradient id="aft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0B26E"/><stop offset="1" stop-color="#E5824E"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#aft)"/>']
d, _ = ridge(800, 40, 7); ch.append(f'<path d="{d}" fill="#2E3B24"/>')
for i in range(9):
    w = 1180 - i * 108; y = 880 - i * 64
    ch.append(f'<rect x="{960 - w / 2}" y="{y - 64}" width="{w}" height="66" fill="#9C7451"/><rect x="{960 - w / 2}" y="{y - 64}" width="{w * .5}" height="66" fill="#6A4C33"/><rect x="{960 - w / 2}" y="{y - 64}" width="{w}" height="7" fill="#C89C70"/>')
ch.append('<rect x="830" y="230" width="260" height="100" fill="#8B6646"/><rect x="830" y="230" width="130" height="100" fill="#5E432D"/>')
ch.append('<path d="M880,880 L1040,880 L1010,320 L910,320Z" fill="#7B5A3E"/>')
for i in range(7):
    y0 = 340 + i * 76; ch.append(f'<path d="M1012,{y0} L1050,{y0 + 38} L1018,{y0 + 70}Z" fill="#FFE3A0" filter="url(#glow)"/>')
ch.append('<path d="M1010,320 L1046,880" stroke="#3B2A1C" stroke-width="10"/><g transform="translate(1050,890)"><path d="M-10,-40 C 40,-50 90,-20 90,10 C 90,40 40,50 -10,40Z" fill="#8B6646"/><circle cx="40" cy="-8" r="8" fill="#2B1E14"/><path d="M60,18 L90,22" stroke="#2B1E14" stroke-width="5"/></g>')
ch.append('<path d="M-20,940 C 500,900 1300,920 1940,900 L1940,1100 L-20,1100Z" fill="#26311E"/>')
FR.append(('0:38 奇琴伊察（手绘）：春分秋分，影子变成一条蛇爬下台阶', page(''.join(ch), subs(['每年春分秋分，', '影子会变成一条[蛇]，']) + counter(1) + odo(12766) + SEALD)))
# 5 · the 打卡照 moment at the 基督像 (flash + print border)
pr = ('<g transform="rotate(-2 960 480)"><rect x="250" y="40" width="1420" height="880" fill="#FFFFFF" filter="url(#ds)"/>'
      '<svg x="276" y="66" width="1368" height="770" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">' + sc_christ() + '</svg>'
      '<text x="960" y="892" font-family="Noto Serif CJK SC" font-weight="700" font-size="38" text-anchor="middle" fill="#5A524A">你的打卡照 · 基督像 · 4/7</text></g>')
flash = '<defs><radialGradient id="fl" cx="50%" cy="50%" r="70%"><stop offset=".55" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".55"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#fl)"/>'
FR.append(('1:05 打卡照定格：咔嚓、白光、相纸白边（照片为示意）', page('<rect width="1920" height="1080" fill="#20262E"/>' + pr + flash, subs(['它是七个里最年轻的：', '[1931年]才落成。'], top=110) + counter(4, hot=True) + odo(20195) + SEALD)))
# 6 · over Egypt (window POV)
eg = ('<defs><linearGradient id="des" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D9AE"/><stop offset="1" stop-color="#D9AF77"/></linearGradient><clipPath id="win"><rect x="560" y="140" width="800" height="820" rx="320"/></clipPath></defs>'
      '<rect width="1920" height="1080" fill="#E9E6E1"/><rect width="1920" height="1080" fill="#2E2A27" opacity=".92"/>'
      '<g clip-path="url(#win)"><rect width="1920" height="1080" fill="url(#des)"/><path d="M600,300 C 800,420 900,600 860,980" stroke="#4E7F5C" stroke-width="60" fill="none" opacity=".7"/><path d="M600,300 C 800,420 900,600 860,980" stroke="#5D9CC4" stroke-width="10" fill="none"/>'
      '<g fill="#B88A55"><path d="M1040,640 L1100,560 L1160,640Z"/><path d="M1130,660 L1176,598 L1222,660Z"/><path d="M1190,672 L1214,640 L1238,672Z"/></g><g fill="#8E6538"><path d="M1100,560 L1160,640 L1100,640Z"/><path d="M1176,598 L1222,660 L1176,660Z"/></g>'
      '<rect width="1920" height="1080" fill="#FFFFFF" opacity=".12"/><path d="M1200,140 L1360,400 L1360,140Z" fill="#D7DCE3" opacity=".5"/></g>'
      '<rect x="560" y="140" width="800" height="820" rx="320" fill="none" stroke="#C9C3BA" stroke-width="40"/><rect x="560" y="140" width="800" height="820" rx="320" fill="none" stroke="#8E877D" stroke-width="6"/>')
FR.append(('1:20 飞过埃及（窗口 POV）：揭晓「怎么没有金字塔」', page(eg, subs(['往东飞，下面就是[埃及]。', '还记得那个问题吗？']) + counter(5) + odo(29399, ghost=True) + SEALD)))
# 7 · the reveal: 39,729 km ≈ once round the Earth
o = G['reveal']
ex = (f'<path d="{o["eqAll"]}" stroke="#FFFFFF" stroke-opacity=".25" stroke-width="3" stroke-dasharray="10 10" fill="none"/>'
      f'<path d="{o["loopAll"]}" stroke="{GOLD}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="6 9" fill="none"/>'
      f'<path d="{o["loopFront"]}" stroke="{GOLD}" stroke-width="14" fill="none" opacity=".35" filter="url(#blur8)"/><path d="{o["loopFront"]}" stroke="{GOLD}" stroke-width="5" fill="none" stroke-linejoin="round"/>')
big = ('<div style="position:absolute;left:0;right:0;top:70px;text-align:center;font-family:Noto Sans CJK SC;font-weight:900;font-size:120px;color:#F2C66E;text-shadow:0 0 30px rgba(14,8,5,.9)">39729 公里</div>'
       '<div style="position:absolute;left:0;right:0;top:230px;text-align:center;font-family:Noto Sans CJK SC;font-weight:700;font-size:44px;color:#FFF6E6;text-shadow:0 0 14px rgba(14,8,5,.9)">地球一圈 40075 公里 · 只差 <span style="color:#F2C66E">346</span> 公里</div>')
FR.append(('2:02 揭晓：最短路线 39729 公里，几乎刚好绕地球一圈（虚线 = 赤道）', page(globe_svg('reveal', set(G['reveal']['pts'].keys())) + ex, big + counter(7) + odo(39729) + SEALD)))
# 8 · ending: the 7 打卡照 as prints
tiles = ''
order = ['gw', 'ci', 'mp', 'cr', 'co', 'pe', 'tj']; pos = [(330, 420), (735, 400), (1140, 430), (1545, 410), (530, 760), (935, 780), (1340, 760)]
for i, (k, (x, y)) in enumerate(zip(order, pos)):
    name, fn = SCENES[k]; rot = [-4, 3, -2, 4, 2, -3, 3][i]
    tiles += (f'<g transform="rotate({rot} {x} {y})"><rect x="{x - 190}" y="{y - 130}" width="380" height="270" fill="#FFFFFF" filter="url(#ds)"/>'
              f'<svg x="{x - 175}" y="{y - 115}" width="350" height="197" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">{fn()}</svg>'
              f'<text x="{x}" y="{y + 118}" font-family="Noto Serif CJK SC" font-weight="700" font-size="26" text-anchor="middle" fill="#5A524A">{name} · {i + 1}/7</text></g>')
FR.append(('2:18 结尾：7 张打卡照排开，静止 2 秒方便截图（照片为示意）', page('<rect width="1920" height="1080" fill="#241A13"/>' + tiles, subs(['截图存好，晒给朋友。', '真去过的，评论区[晒]你的照片👇'], top=70) + counter(7, hot=True) + odo(39729) + SEALD)))

os.makedirs(f'{D}/frames', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    for i, (lab, html) in enumerate(FR):
        fn = f'{D}/frames/kf{i + 1}.html'; open(fn, 'w').write(html); pg.goto('file://' + fn); pg.wait_for_timeout(250)
        pg.locator('#f').screenshot(path=f'{D}/frames/kf{i + 1}.png')
    b.close()
# sheet: 2 per row, large, labelled
fnt = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 34)
cw, chh, gap, lab = 1200, 675, 40, 70
rows = (len(FR) + 1) // 2
S = Image.new('RGB', (2 * cw + 3 * gap, rows * (chh + lab + gap) + gap), (24, 24, 26)); d = ImageDraw.Draw(S)
for i, (l, _) in enumerate(FR):
    x = gap + (i % 2) * (cw + gap); y = gap + (i // 2) * (chh + lab + gap)
    d.text((x, y + 10), f'{i + 1}. {l}', font=fnt, fill=(240, 236, 228))
    S.paste(Image.open(f'{D}/frames/kf{i + 1}.png').convert('RGB').resize((cw, chh), Image.LANCZOS), (x, y + lab))
S.save(f'{D}/ep57_keyframes_v1.jpg', quality=88)
print('ok', S.size)
