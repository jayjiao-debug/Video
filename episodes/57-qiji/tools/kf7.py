"""ep57 key frames for script v7 (owner 2026-11-03 00:59: 「make it all add up, the history needs visuals, give me key frames」).
Builds every non-history frame (airport, departures board, window + globe, arrival boards 「XXX欢迎你」, the coded scenes with
你, viewfinder, developing 拍立得, the album on the tray table, the counter race, the ancient-wonders line-up, 欢迎回家, the
finished album, the end card) and composites the history frames drawn by hist_a/b/c.py with subtitles and counters.
Writes scratchpad sb57/kf7/kNN.jpg + kf7.json (captions). Photos/renders are never committed."""
import json, math, os, re, sys, base64
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sb57 as B   # helpers: subs, subs_c, counter, SEALD, HEAD, viewfinder, ortho/gc, P, BEST, CROPS, f1 …

S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad'
SB = f'{S}/sb57'; OUT = f'{SB}/kf7'; os.makedirs(OUT, exist_ok=True)
G7 = json.load(open(f'{SB}/globe7.json'))
GOLD, CREAM, INK = '#F2C66E', '#FFF6E6', '#2A211B'
WENKAI = 'file:///home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai/wenkai-bold.css'
FD = f'{S}/fonts_dl'
FONTS = (f'<link rel="stylesheet" href="{WENKAI}"><style>'
         f"@font-face{{font-family:'NotoAr';src:url('file://{FD}/x_fontsource-noto-sans-arabic-5.2.9/package/files/noto-sans-arabic-arabic-700-normal.woff2')}}"
         f"@font-face{{font-family:'NotoDev';src:url('file://{FD}/x_fontsource-noto-sans-devanagari-5.2.7/package/files/noto-sans-devanagari-devanagari-700-normal.woff2')}}</style>")
HEAD = B.HEAD.replace('<style>', FONTS + '<style>')
DEFS = B.DEFS
subs, subs_c, counter, SEALD = B.subs, B.subs_c, B.counter, B.SEALD
def page(inner): return HEAD + inner + '</div></body></html>'
def svgw(inner): return f'<svg width="1920" height="1080" style="position:absolute;left:0;top:0">{DEFS}{inner}</svg>'
def img(path, extra=''): return f'<img src="file://{path}" style="position:absolute;left:0;top:0;width:1920px;height:1080px;{extra}">'

def odo2(km, ghost=False):
    p = min(1, km / 40075)
    return (f'<div style="position:absolute;left:150px;bottom:62px;color:{CREAM};font-family:Noto Sans CJK SC;text-shadow:0 0 14px rgba(14,8,5,.85)">'
            f'<div style="display:flex;align-items:baseline;gap:12px"><span style="font-size:32px;font-weight:700">已飞</span>'
            f'<span style="font-size:70px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1">{km:,}</span>'
            f'<span style="font-size:32px;font-weight:700;opacity:.8">/ 40,075 公里</span></div>'
            f'<div style="margin-top:10px;width:520px;height:8px;border-radius:4px;background:rgba(255,246,230,.25)"><div style="width:{520 * p:.0f}px;height:8px;border-radius:4px;background:{GOLD}"></div></div></div>')

# ---------- the coded scenes (1920x1080 crops, with 你) ----------
SCN = {'greatwall2': 'greatwall2', 'chichen': 'chichen', 'machu2': 'machu2', 'christ': 'christ', 'colosseum': 'colosseum', 'petra2': 'petra2', 'taj': 'taj'}
def drawn(k, box=None):
    out = f'{OUT}/scene_{k}.jpg'
    if not os.path.exists(out):
        v = Image.open(f'{SB}/vec/{k}_code.png').convert('RGBA'); f = Image.open(f'{SB}/fig_{k}.png').convert('RGBA').resize(v.size, Image.LANCZOS)
        v.alpha_composite(f); v.convert('RGB').crop(box or B.CROPS[k]).resize((1920, 1080), Image.LANCZOS).save(out, quality=92)
    return out
def real(k):
    out = f'{OUT}/real_{k}.jpg'
    if not os.path.exists(out): Image.open(f'{SB}/comp_{k}.jpg').crop(B.CROPS[k]).resize((1920, 1080), Image.LANCZOS).save(out, quality=92)
    return out
def figbox(k):
    f = Image.open(f'{SB}/fig_{k}.png').convert('RGBA').crop(B.CROPS[k]).resize((1920, 1080)); a = np.array(f)[..., 3]; ys, xs = np.nonzero(a > 40)
    return (xs.min(), ys.min(), xs.max(), ys.max()) if len(xs) else None

# ---------- globe (borderless; land from d3 via globe7.mjs) ----------
def globe(view, lit, extra='', bg=True):
    o = G7[view]; cx, cy, r = o['cx'], o['cy'], o['r']
    stars = ''.join(f'<circle cx="{(i * 397) % 1920}" cy="{(i * 211) % 1080}" r="{1 + (i % 3) * .6}" fill="#FFF" opacity="{.25 + (i % 5) * .1}"/>' for i in range(140))
    pts = ''
    for k, p in o['pts'].items():
        if not p['vis'] or k == 'gz': continue
        x, y = p['xy']
        pts += (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="16" fill="{GOLD}" opacity=".35" filter="url(#blur8)"/><circle cx="{x:.1f}" cy="{y:.1f}" r="8" fill="{GOLD}"/>' if k in lit
                else f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="#9AA3B5"/>')
    back = (f'<defs><radialGradient id="oc" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#2E6A9E"/><stop offset="1" stop-color="#0D2742"/></radialGradient>'
            f'<linearGradient id="spc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070B16"/><stop offset="1" stop-color="#18213A"/></linearGradient></defs>'
            f'<rect width="1920" height="1080" fill="url(#spc)"/>{stars}') if bg else ''
    return (back + f'<circle cx="{cx}" cy="{cy}" r="{r + 26}" fill="#5FA8E8" opacity=".18" filter="url(#blur30)"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#oc)"/>'
            f'<path d="{o["grat"]}" stroke="#FFF" stroke-opacity=".07" fill="none"/><path d="{o["land"]}" fill="#C8B48C" stroke="#E9D9B4" stroke-width="1"/>{extra}{pts}')
def arc(view, i=0, w=5):
    d = G7[view]['legs'][i]['front']
    return f'<path d="{d}" stroke="{GOLD}" stroke-width="16" fill="none" opacity=".35" filter="url(#blur8)"/><path d="{d}" stroke="{GOLD}" stroke-width="{w}" fill="none" stroke-linecap="round"/>'
def plane(x, y, ang, s=1.2): return B.plane(x, y, ang, s)

# ---------- stickers, polaroids, album ----------
def sticker(kind, x, y, s=1.0, rot=0):
    """die-cut vector stickers (white border = a fat white stroke under the shape)"""
    body = {
        'snake': f'<path d="M-40,20 C-30,-20 0,30 10,-5 C20,-35 45,-10 40,10" stroke="#3E9B5A" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="40" cy="8" r="9" fill="#3E9B5A"/><circle cx="43" cy="5" r="2.5" fill="{INK}"/>',
        'llama': f'<path d="M-30,35 L-30,0 C-30,-12 -10,-14 10,-10 L18,-10 L18,-38 C18,-46 30,-46 30,-38 L30,0 C30,10 28,20 26,35 L18,35 L16,12 L-18,12 L-20,35 Z" fill="#F4E9D6" stroke="{INK}" stroke-width="3"/><circle cx="24" cy="-30" r="2.5" fill="{INK}"/>',
        'arms': f'<path d="M-48,-14 L48,-14 L48,-4 L10,-4 L12,40 L-12,40 L-10,-4 L-48,-4 Z" fill="#E8E4DA" stroke="{INK}" stroke-width="3"/><circle cx="0" cy="-26" r="10" fill="#E8E4DA" stroke="{INK}" stroke-width="3"/>',
        'helmet': f'<path d="M-30,30 L-30,-5 C-30,-35 30,-35 30,-5 L30,30 L12,30 L12,8 L-12,8 L-12,30 Z" fill="#C9A24A" stroke="{INK}" stroke-width="3"/><path d="M-6,-34 C-20,-60 20,-60 6,-34" fill="#C0392B" stroke="{INK}" stroke-width="3"/>',
        'lantern': f'<circle cx="0" cy="0" r="40" fill="#FFC77E" opacity=".45"/><path d="M-20,30 L-22,-26 L-12,-32 L-4,-26 L6,-33 L14,-26 L22,-30 L20,30 Z" fill="#FFF3D6" stroke="{INK}" stroke-width="3"/><ellipse cx="0" cy="8" rx="7" ry="10" fill="#FFB24A"/>',
        'heart': f'<path d="M0,30 C-50,0 -38,-38 -12,-30 C-4,-27 0,-20 0,-16 C0,-20 4,-27 12,-30 C38,-38 50,0 0,30 Z" fill="#E5483B" stroke="{INK}" stroke-width="3"/>',
        'brick': f'<path d="M-40,30 L-40,-10 L-28,-10 L-28,-28 L-14,-28 L-14,-10 L-6,-10 L-6,-28 L8,-28 L8,-10 L16,-10 L16,-28 L30,-28 L30,-10 L40,-10 L40,30 Z" fill="#8E8A92" stroke="{INK}" stroke-width="3"/><path d="M-40,8 L40,8 M-14,8 L-14,30 M14,8 L14,30" stroke="{INK}" stroke-width="2"/>',
        'laurel': ''.join(f'<ellipse cx="{sd * 34 * math.cos(math.radians(a)):.1f}" cy="{-34 * math.sin(math.radians(a)) + 4:.1f}" rx="12" ry="6" fill="{GOLD}" stroke="{INK}" stroke-width="2" transform="rotate({sd * (90 - a):.0f} {sd * 34 * math.cos(math.radians(a)):.1f} {-34 * math.sin(math.radians(a)) + 4:.1f})"/>'
                          for sd in (-1, 1) for a in range(-50, 140, 26)) + f'<text x="0" y="12" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="26" fill="#8A5A12">荣誉</text>',
    }[kind]
    halo = re.sub(r'fill="[^"]*"', 'fill="#FFFFFF"', re.sub(r'stroke="[^"]*"', 'stroke="#FFFFFF"', body)).replace('stroke-width="3"', 'stroke-width="18"').replace('stroke-width="2"', 'stroke-width="16"').replace('stroke-width="16"', 'stroke-width="30"', 1) if kind != 'laurel' else f'<circle r="58" fill="#FFF8E6"/>'
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})" filter="url(#ds)">{halo}{body}</g>'
def tape(x, y, w=90, rot=-20, col='#E8C9A0'):
    return f'<rect x="{x - w / 2}" y="{y - 14}" width="{w}" height="28" fill="{col}" opacity=".78" transform="rotate({rot} {x} {y})"/>'
def stamp(text1, text2, x, y, rot=-12, col='#C0392B', s=1.0):
    return (f'<g transform="translate({x},{y}) rotate({rot}) scale({s})" opacity=".85"><rect x="-150" y="-62" width="300" height="124" rx="16" fill="none" stroke="{col}" stroke-width="6"/>'
            f'<rect x="-140" y="-52" width="280" height="104" rx="10" fill="none" stroke="{col}" stroke-width="2.5"/>'
            f'<text x="0" y="-6" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="40" fill="{col}">{text1}</text>'
            f'<text x="0" y="36" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="700" font-size="24" fill="{col}" letter-spacing="3">{text2}</text></g>')
def polaroid_html(photo, x, y, w, rot=0, caption='', develop=1.0, dark='#3B342E', z=2, drawn_img=None, drawn_a=0):
    h = w * 2 / 3; pad = w * .045; bot = w * .16
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;padding:{pad:.0f}px {pad:.0f}px {bot:.0f}px;background:#FBFAF6;box-shadow:0 14px 34px rgba(0,0,0,.45);transform:rotate({rot}deg);z-index:{z}">'
            f'<div style="position:relative;width:{w}px;height:{h:.0f}px;overflow:hidden;background:{dark}">'
            + (f'<img src="file://{drawn_img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:{drawn_a}">' if drawn_img else '')
            + f'<img src="file://{photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:{develop}"></div>'
            f'<div style="position:absolute;left:0;right:0;bottom:{bot * .24:.0f}px;text-align:center;font-family:\'LXGW WenKai\';font-weight:700;font-size:{w * .062:.0f}px;color:#5A4E44;white-space:nowrap">{caption}</div></div>')

STOPS = [('chichen', '奇琴伊察', 'snake', '365级 = 一年'), ('machu2', '马丘比丘', 'llama', '皇帝的山顶行宫'), ('christ', '基督像', 'arms', '大家捐钱立的'),
         ('colosseum', '斗兽场', 'helmet', '尼禄的湖→斗兽场'), ('petra2', '佩特拉', 'lantern', '过路税之城'), ('taj', '泰姬陵', 'heart', '为她修了二十多年'), ('greatwall2', '长城', 'brick', '欢迎回家')]
def album(filled, slot8='q', stamps=True, close=None):
    """the open album on the plane's tray table: 2 pages x 4 slots; slot 8 = the pyramid"""
    s = ['<defs><linearGradient id="tray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9CDD3"/><stop offset="1" stop-color="#9EA4AC"/></linearGradient>'
         '<linearGradient id="seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B4A63"/><stop offset="1" stop-color="#2A3548"/></linearGradient></defs>',
         '<rect width="1920" height="1080" fill="url(#seat)"/>',
         '<rect x="780" y="40" width="360" height="200" rx="16" fill="#111827" stroke="#0B0F18" stroke-width="6"/>',
         f'<path d="M840,200 C900,120 1000,100 1080,140" stroke="{GOLD}" stroke-width="4" fill="none" stroke-dasharray="8 8"/>',
         '<path d="M60,330 L1860,330 L1920,1080 L0,1080 Z" fill="url(#tray)"/>',
         '<rect x="110" y="300" width="1700" height="50" rx="12" fill="#B4BAC2"/>',
         '<g filter="url(#ds)"><rect x="180" y="360" width="790" height="660" rx="10" fill="#F6EEDC"/><rect x="950" y="360" width="790" height="660" rx="10" fill="#F3EAD6"/></g>',
         '<rect x="945" y="360" width="30" height="660" fill="#E2D6BC"/>']
    slots = [(230 + c * 182 + (0 if c < 2 else 0), 0) for c in range(4)]
    pos = []
    for pg in range(2):
        for r in range(2):
            for c in range(2):
                pos.append((215 + pg * 770 + c * 370, 400 + r * 310))
    html = []
    for i, (x, y) in enumerate(pos):
        if i < 7:
            k, name, stk, cap = STOPS[i]
            if i < filled:
                html.append(polaroid_html(f'{SB}/comp_{k}.jpg', x, y, 300, rot=[-3, 2, -2, 3, 2, -3, 2][i], caption=cap))
                s.append(tape(x + 40, y + 6, rot=-24)); s.append(tape(x + 300, y + 6, rot=22))
            else:
                s.append(f'<rect x="{x}" y="{y}" width="330" height="270" rx="8" fill="none" stroke="#B9AA8E" stroke-width="4" stroke-dasharray="14 10"/>'
                         f'<text x="{x + 165}" y="{y + 150}" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="44" fill="#B9AA8E">{i + 1}</text>')
        else:   # slot 8: the pyramid
            s.append(f'<rect x="{x}" y="{y}" width="330" height="270" rx="8" fill="none" stroke="#B9AA8E" stroke-width="4" stroke-dasharray="14 10"/>'
                     f'<path d="M{x + 85},{y + 210} L{x + 165},{y + 70} L{x + 245},{y + 210} Z" fill="none" stroke="#A99F92" stroke-width="6" stroke-linejoin="round"/>')
            if slot8 == 'q': s.append(f'<text x="{x + 255}" y="{y + 90}" font-family="Noto Sans CJK SC" font-weight="900" font-size="80" fill="#C0392B">?</text>')
            if slot8 == 'gold': s.append(sticker('laurel', x + 165, y + 140, 1.5))
    stick = ''.join(sticker(STOPS[i][2], pos[i][0] + 300, pos[i][1] + 230, .9, [-12, 10, -8, 14, -10, 8, -6][i]) for i in range(min(filled, 7)))
    st = ''
    if stamps and filled:
        for i, (a, b) in enumerate([('墨西哥', 'MÉXICO · 入境'), ('秘鲁', 'PERÚ · 入境'), ('巴西', 'BRASIL · 入境'), ('意大利', 'ITALIA · 入境'), ('约旦', 'JORDAN · 入境'), ('印度', 'INDIA · 入境'), ('中国', '欢迎回家')][:filled]):
            st += stamp(a, b, [880, 1680, 880, 1680, 560, 1290, 1600][i], [660, 660, 980, 980, 1000, 1000, 380][i], rot=[-14, 10, -6, 12, 8, -10, 6][i], s=.55, col=['#C0392B', '#1F5FA8', '#2E7D4F', '#C0392B', '#7A3E9D', '#D07A1F', '#C0392B'][i])
    sv = svgw(''.join(s) + stick + st)
    return sv, ''.join(html)

FR = []
def add(time, tag, lines, pic, html): FR.append(dict(time=time, tag=tag, lines=lines, pic=pic, html=html))
def H(sv, *over): return page(sv + ''.join(over))
SEAL = SEALD

# ===== K01 0:00 airport POV: departures board =====
board_rows = [('CA 7071', '墨西哥 · 奇琴伊察'), ('CA 7072', '秘鲁 · 马丘比丘'), ('CA 7073', '巴西 · 基督像'), ('CA 7074', '意大利 · 斗兽场'), ('CA 7075', '约旦 · 佩特拉'), ('CA 7076', '印度 · 泰姬陵'), ('CA 7077', '中国 · 长城（回家）')]
def terminal(board_title=False):
    s = ['<defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4B5C93"/><stop offset=".65" stop-color="#E99A5C"/><stop offset="1" stop-color="#F6C27F"/></linearGradient></defs>',
         '<rect width="1920" height="1080" fill="#151B29"/><rect x="0" y="60" width="1920" height="600" fill="url(#dusk)"/>',
         '<path d="M0,520 L1920,520 L1920,660 L0,660Z" fill="#2B2F3E"/>'] + [f'<circle cx="{30 + i * 70}" cy="590" r="4" fill="#FFD27A"/>' for i in range(28)]
    s.append('<g fill="#0D111C"><path d="M120,470 L900,452 C960,452 980,470 960,490 L160,508Z"/><path d="M420,476 L300,370 L360,370 L560,472Z"/><path d="M420,494 L240,590 L300,590 L560,494Z"/><path d="M160,478 L100,392 L140,392 L220,470Z"/></g>')
    s += [f'<line x1="{x}" y1="60" x2="{x}" y2="660" stroke="#2A3245" stroke-width="18"/>' for x in (480, 960, 1440)]
    s.append('<path d="M0,660 L1920,660 L1920,1080 L0,1080Z" fill="#3A3F4C"/>' + ''.join(f'<line x1="960" y1="660" x2="{x}" y2="1080" stroke="#4A505E" stroke-width="3"/>' for x in range(-1600, 3600, 320)))
    # departures board
    s.append('<g filter="url(#ds)"><rect x="1010" y="150" width="800" height="560" rx="14" fill="#10141C" stroke="#2A2F3A" stroke-width="8"/></g>')
    s.append(f'<text x="1050" y="210" font-family="Noto Sans CJK SC" font-weight="900" font-size="34" fill="{GOLD}">出发 DEPARTURES</text>')
    for i, (fl, dest) in enumerate(board_rows):
        y = 270 + i * 62; hot = i == 0
        s.append(f'<rect x="1040" y="{y - 40}" width="740" height="52" rx="6" fill="#1A2030"/>')
        s.append(f'<text x="1060" y="{y}" font-family="Noto Sans CJK SC" font-weight="700" font-size="28" fill="#E8E2D2">{fl}</text>')
        s.append(f'<text x="1230" y="{y}" font-family="Noto Sans CJK SC" font-weight="900" font-size="30" fill="#FFF6E6">{dest}</text>')
        s.append(f'<text x="1770" y="{y}" text-anchor="end" font-family="Noto Sans CJK SC" font-weight="900" font-size="28" fill="{"#7CE08A" if hot else "#E8E2D2"}">{"登机" if hot else "准点"}</text>')
    if board_title:
        s.append('<rect x="1010" y="150" width="800" height="560" rx="14" fill="#10141C" opacity=".86"/>')
        s.append(f'<text x="1410" y="380" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="74" fill="{GOLD}">新世界七大奇迹，</text>')
        s.append(f'<text x="1410" y="480" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="74" fill="{GOLD}">你去过几个？</text>')
    return ''.join(s)
hand_pass = ('<g transform="translate(560,860) rotate(-8)"><rect x="-300" y="-140" width="600" height="280" rx="18" fill="#FBF3E2"/><rect x="-300" y="-140" width="600" height="60" rx="18" fill="#C0392B"/><rect x="-300" y="-100" width="600" height="20" fill="#C0392B"/>'
             '<text x="-270" y="-98" font-family="Noto Sans CJK SC" font-weight="800" font-size="28" fill="#FFF6E6">登机牌 BOARDING PASS</text>'
             '<text x="-270" y="-30" font-family="Noto Sans CJK SC" font-size="22" fill="#8A7D6C">乘客</text><text x="-270" y="20" font-family="Noto Sans CJK SC" font-weight="900" font-size="48" fill="#C0392B">你</text>'
             '<text x="-120" y="-30" font-family="Noto Sans CJK SC" font-size="22" fill="#8A7D6C">航线</text><text x="-120" y="20" font-family="Noto Sans CJK SC" font-weight="900" font-size="36" fill="#2A2420">北京 → 新七大奇迹 → 北京</text>'
             '<text x="-270" y="90" font-family="Noto Sans CJK SC" font-size="22" fill="#8A7D6C">座位 7A · 登机口 G7</text></g>'
             '<path d="M700,1100 C710,990 735,930 770,880 C790,860 830,856 850,875 L900,930 C930,960 940,1030 950,1100Z" fill="#1A1410"/>')
speed = ''.join(f'<line x1="{x}" y1="{y}" x2="{x + 160}" y2="{y}" stroke="#FFFFFF" stroke-width="4" opacity=".35" stroke-linecap="round"/>' for x, y in [(40, 720), (120, 790), (60, 860), (1500, 760), (1580, 840)])
add('0:00', '手绘 · 第0帧 · 机场', ['世界这么大！', '新七大奇迹，你是不是只去过[长城]？'], '第一视角在航站楼里跑向登机口，手里攥着登机牌（乘客：你，北京 → 新七大奇迹 → 北京）。右边出发大屏一行行翻出 7 个目的地，第一班「登机」在闪。',
    H(svgw(terminal() + speed + hand_pass), subs(['世界这么大！', '新七大奇迹，你是不是只去过[长城]？']), counter(0), SEAL))
add('0:06', '手绘 · 片名', [], '出发大屏整块翻成金色片名《新世界七大奇迹，你去过几个？》，窗外飞机拉起。停 ≥ 2.5 秒。',
    H(svgw(terminal(board_title=True) + '<g fill="#0D111C" transform="translate(-60,-90) rotate(-8 500 470)"><path d="M120,470 L900,452 C960,452 980,470 960,490 L160,508Z"/></g>'), subs(['今天，我们一起去看看！']), counter(0), SEAL))
# ===== K03 window + globe, the bet =====
win = ('<defs><clipPath id="win"><rect x="470" y="80" width="980" height="920" rx="380"/></clipPath></defs><rect width="1920" height="1080" fill="#D9D4CC"/>'
       '<rect width="1920" height="1080" fill="#2E2A27" opacity=".9"/>')
def window(inner):
    return (win + f'<g clip-path="url(#win)">{inner}</g><rect x="470" y="80" width="980" height="920" rx="380" fill="none" stroke="#C9C3BA" stroke-width="46"/>'
            '<rect x="470" y="80" width="980" height="920" rx="380" fill="none" stroke="#8E877D" stroke-width="6"/><path d="M1180,90 L1450,520 L1450,90Z" fill="#FFFFFF" opacity=".06"/>')
fr, bk = B.route_paths('reveal', B.BEST)
ring = (f'<path d="{bk}" stroke="{GOLD}" stroke-opacity=".3" stroke-width="3" stroke-dasharray="6 9" fill="none"/><path d="{fr}" stroke="{GOLD}" stroke-width="4" stroke-dasharray="10 10" fill="none"/>'
        f'<path d="{G7["reveal"]["eqAll"]}" stroke="#FFF" stroke-opacity=".3" stroke-width="3" stroke-dasharray="4 10" fill="none"/>')
add('0:09', '手绘 · 舷窗 · 主问题', ['7个地方连成一圈飞回来，', '够不够[绕地球一圈]？'], '舷窗外是无国界地球仪，7 个点，一条虚线把它们连成一圈，下面是赤道虚线。整片押注的问题，答案留到最后。',
    H(svgw(window(globe('reveal', set(B.P)) + ring)), subs_c(['7个地方连成一圈飞回来，', '够不够[绕地球一圈]？'], top=40), counter(0), SEAL))
sv, ht = album(0, slot8='none', stamps=False)
add('0:13', '手绘 · 小桌板 · 空相册', ['地球一圈，40075公里。', '出发！'], '小桌板上摊开一本空相册（7 个虚线格，数字 1–7），左下出现里程表：已飞 0 / 40,075 公里，下面一根进度条。',
    H(sv, ht, subs(['地球一圈，40075公里。', '出发！']), counter(0), odo2(0), SEAL))
o = G7['pacific']; ci = o['pts']['ci']['xy']
add('0:16', '地球 · 跳转', [], '横跨太平洋：金色航线 + 小飞机，里程表狂转 → 12,772 / 40,075。配音进来：「¡Bienvenido a México!」',
    H(svgw(globe('pacific', {'gw', 'ci'}, arc('pacific')) + plane(ci[0] - 26, ci[1] - 6, 12)), counter(0), odo2(12772), SEAL))

# ===== arrival boards 「XXX欢迎你」 over the coded scene (the camera dives through the clouds) =====
def clouds():
    c = ''
    for cx, cy, r in [(-60, 120, 260), (180, 40, 200), (1880, 80, 280), (1700, 0, 200), (-40, 1000, 240), (1960, 1000, 300), (300, 1120, 220), (1500, 1120, 240)]:
        for k in range(5):
            c += f'<circle cx="{cx + (k - 2) * r * .45:.0f}" cy="{cy + (k % 2) * r * .2:.0f}" r="{r * (.6 + .1 * k):.0f}" fill="#FFFFFF" opacity=".72"/>'
    return f'<g filter="url(#blur8)">{c}</g>'
def arrival(k, zh, local, font='Noto Sans CJK SC', stamp_a=('', ''), col='#C0392B'):
    board = (f'<div style="position:absolute;left:520px;top:560px;width:880px;padding:26px 40px 30px;border-radius:18px;background:rgba(18,30,52,.9);box-shadow:0 20px 50px rgba(0,0,0,.45);border-top:8px solid {GOLD};text-align:center">'
             f'<div style="font-family:Noto Sans CJK SC;font-weight:700;font-size:24px;letter-spacing:4px;color:{GOLD}">✈ 到达 ARRIVALS</div>'
             f'<div style="font-family:Noto Sans CJK SC;font-weight:900;font-size:92px;line-height:1.15;color:#FFFFFF">{zh}</div>'
             f'<div style="font-family:{font},Noto Sans CJK SC;font-weight:700;font-size:46px;color:{CREAM};opacity:.9;direction:{"rtl" if font == "NotoAr" else "ltr"}">{local}</div></div>')
    return img(drawn(k), 'filter:brightness(1.04)') + svgw(clouds() + stamp(stamp_a[0], stamp_a[1], 1540, 520, rot=-14, col=col, s=1.0)) + board
ARR = [('chichen', '墨西哥欢迎你', '¡Bienvenido a México!', 'Noto Sans CJK SC', ('墨西哥', 'MÉXICO · 入境'), '#C0392B'),
       ('machu2', '秘鲁欢迎你', '¡Bienvenido al Perú!', 'Noto Sans CJK SC', ('秘鲁', 'PERÚ · 入境'), '#1F5FA8'),
       ('christ', '巴西欢迎你', 'Bem-vindo ao Brasil!', 'Noto Sans CJK SC', ('巴西', 'BRASIL · 入境'), '#2E7D4F'),
       ('colosseum', '意大利欢迎你', 'Benvenuto in Italia!', 'Noto Sans CJK SC', ('意大利', 'ITALIA · 入境'), '#C0392B'),
       ('petra2', '约旦欢迎你', 'أهلاً وسهلاً بك في الأردن!', 'NotoAr', ('约旦', 'JORDAN · 入境'), '#7A3E9D'),
       ('taj', '印度欢迎你', 'भारत में आपका स्वागत है!', 'NotoDev', ('印度', 'INDIA · 入境'), '#D07A1F')]
KM = [12772, 16923, 20202, 29405, 31823, 35967]
SUB_ARR = [['第一站，墨西哥，', '奇琴伊察。'], ['第二站，秘鲁，', '马丘比丘。'], ['第三站，巴西，', '基督像。'], ['第四站，意大利，', '罗马斗兽场。'], ['第五站，约旦，', '佩特拉。'], ['第六站，印度，', '泰姬陵。']]
T_ARR = ['0:18', '0:42', '0:57', '1:10', '1:38', '1:50']
def arr_frame(i):
    k, zh, local, font, st, col = ARR[i]
    add(T_ARR[i], f'手绘 · 到达 · 配音', SUB_ARR[i] + [f'（配音：{local}）'], f'穿过云层俯冲进代码画的{["奇琴伊察", "马丘比丘", "基督像", "斗兽场", "佩特拉", "泰姬陵"][i]}；到达牌「{zh}」，下面一行是当地语言；护照入境章「咚」一声盖上。',
        H(arrival(k, zh, local, font, st, col), subs(SUB_ARR[i]), counter(i), odo2(KM[i]), SEAL))

# history frame composite (drawn by hist_a/b/c.py)
def hist(name, time, lines, pic, cnt, km, rows=None, centred=False):
    p = f'{SB}/hist/{name}.png'
    bg = img(p) if os.path.exists(p) else f'<div style="position:absolute;inset:0;background:#3A3330;color:#FFF6E6;font:900 60px Noto Sans CJK SC;display:flex;align-items:center;justify-content:center">（历史画面绘制中：{name}）</div>'
    add(time, '手绘 · 历史讲解', lines, pic, H(bg, '<div style="position:absolute;inset:0;background:radial-gradient(ellipse 1150px 520px at 0% 0%, rgba(14,8,5,.5), rgba(14,8,5,0))"></div>',
                                                   (subs_c if centred else subs)(rows or [l.replace('，', '，\n').split('\n')[0] for l in lines][:2]), counter(cnt), odo2(km), SEAL))
def viewfinder_frame(k, time, pic, cnt, km, label='咔嚓'):
    bb = figbox(k)
    cam = '<g transform="translate(0,1002)"><rect x="500" y="0" width="920" height="200" rx="40" fill="#F1EADF" stroke="#2A211B" stroke-width="5"/><rect x="560" y="26" width="800" height="16" rx="8" fill="#2A211B"/></g>'
    dim = '<div style="position:absolute;inset:0;box-shadow:inset 0 0 0 70px rgba(10,8,6,.45)"></div>'
    add(time, '手绘 · 取景框 · 咔嚓（卡重拍）', [], pic, H(img(drawn(k)), dim, svgw(B.viewfinder(bb) + cam), counter(cnt), odo2(km), SEAL))
def develop_frame(k, time, pic, cnt, km, dev=.5, caption='', candle=False):
    bg = img(drawn(k), 'filter:blur(14px) brightness(.45);transform:scale(1.06)')
    glow = '<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 60%, rgba(255,190,110,.35), rgba(0,0,0,0) 60%)"></div>' if candle else ''
    card = polaroid_html(f'{SB}/comp_{k}.jpg', 560, 150, 800, rot=-3, caption=caption, develop=dev, drawn_img=drawn(k), drawn_a=(1 - dev) * .8)
    add(time, '拍立得显影', [], pic, H(bg, glow, card, counter(cnt + 1, hot=True), odo2(km), SEAL))

# ===== stop 1: 奇琴伊察 =====
arr_frame(0)
hist('chichen_calendar', '0:21', ['这是玛雅人的神庙，也是一本石头日历：', '四面台阶加顶上的平台，一共365级，一年365天。'], '金字塔变成日历图解：四面台阶各 91 级（金色标数），顶上平台 +1，合起来「= 365」，背后一圈 365 格的日历刻度。', 0, 12772,
     rows=['这是玛雅人的神庙，', '也是一本[石头日历]：'])
hist('chichen_serpent', '0:28', ['每年春分秋分，影子会变成一条蛇，从台阶上爬下来。'], '傍晚低角度阳光，台阶边缘的栏杆上亮出一串 7 个光三角，连起来像一条蛇往下爬到底部的石雕蛇头；一条虚线标出太阳角度，「春分 · 秋分」。', 0, 12772,
     rows=['每年春分秋分，影子会变成', '一条[蛇]，从台阶上爬下来。'])
viewfinder_frame('chichen', '0:33', '取景框四角 + 对焦框框住「你」（手搭凉棚看金字塔）；屏幕下沿露出拍立得机身。咔嚓落在小节重拍上，只有快门声。', 0, 12772)
develop_frame('chichen', '0:33.5', '0.5 秒内相纸从机身弹出，飞到画面中央，从黑 → 手绘 → 真实照片显影。', 0, 12772, dev=.55, caption='奇琴伊察 · 1/7')
sv, ht = album(1, slot8='q')
add('0:34', '手绘 · 小桌板相册 · 第二个问题', ['咦，这相册怎么有[8个]格子？'], '回到飞机上：照片贴进第 1 格（两条胶带、蛇贴纸、手写「365级 = 一年」、墨西哥入境章）。相册其实有 8 格，第 8 格是一个灰色金字塔轮廓 + 红色问号。',
    H(sv, ht, subs_c(['咦，这相册怎么有[8个]格子？'], top=60), counter(1, hot=True), odo2(16923), SEAL))
add('0:38', '手绘 · 特写第8格', ['第8格是金字塔——', '它怎么不在七大奇迹里？'], '镜头推到第 8 格：虚线框里的金字塔轮廓和问号。第二个悬念，飞到埃及时回答。',
    H(svgw('<rect width="1920" height="1080" fill="#F3EAD6"/><rect x="560" y="200" width="800" height="660" rx="20" fill="none" stroke="#B9AA8E" stroke-width="8" stroke-dasharray="30 20"/>'
           '<path d="M720,760 L960,330 L1200,760 Z" fill="none" stroke="#A99F92" stroke-width="14" stroke-linejoin="round"/><text x="1210" y="380" font-family="Noto Sans CJK SC" font-weight="900" font-size="200" fill="#C0392B">?</text>'
           '<text x="960" y="940" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="52" fill="#9C8E76">8</text>'),
      subs_c(['第8格是金字塔——', '它怎么不在七大奇迹里？'], top=40), counter(1, hot=True), odo2(16923), SEAL))
# ===== stop 2: 马丘比丘 =====
arr_frame(1)
hist('machu_palace', '0:45', ['它很可能是印加皇帝的山顶行宫，', '建在两千多米高的山上。'], '废墟「复原」成有人住的样子：茅草屋顶、梯田、炊烟、羊驼，梯田上站着戴扇形头饰的印加君主剪影和随从；旁边一根海拔线「约2350米」。', 1, 16923,
     rows=['它很可能是印加皇帝的[山顶行宫]，', '建在两千多米高的山上。'])
hist('machu_hidden', '0:50', ['后来西班牙人征服了印加，', '却一直没找到它。'], '山城藏在画面上方厚厚的云海里；远远的谷底，一队西班牙征服者剪影（头盔、长矛、几匹马）沿着河走过，没人抬头。', 1, 16923,
     rows=['后来西班牙人征服了印加，', '却一直[没找到]它。'])
timer = ('<g transform="translate(330,880)"><path d="M-160,120 C-150,40 -60,10 60,20 C150,30 190,80 200,120Z" fill="#7C7468" stroke="#2A211B" stroke-width="4"/>'
         '<rect x="-80" y="-60" width="170" height="110" rx="20" fill="#F1EADF" stroke="#2A211B" stroke-width="5"/><circle cx="5" cy="-5" r="34" fill="#2A211B"/><circle cx="5" cy="-5" r="20" fill="#3E5A7A"/>'
         '<circle cx="60" cy="-40" r="10" fill="#E5483B"/><circle cx="60" cy="-40" r="22" fill="#E5483B" opacity=".35"/></g>'
         '<text x="1500" y="560" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="260" fill="#FFFFFF" opacity=".92" stroke="#2A211B" stroke-width="6">3</text>')
add('0:54', '手绘 · 自拍定时', ['倒计时3、2、1——跳！'], '拍立得放在前景一块石头上，红灯闪，屏幕上大大的倒计时 3、2、1；「你」在草坡上起跳。咔嚓定格在半空。',
    H(img(drawn('machu2')), svgw(timer), subs(['倒计时3、2、1——[跳]！']), counter(1), odo2(16923), SEAL))
# ===== stop 3: 基督像 =====
arr_frame(2)
hist('christ_1922', '1:00', ['1922年，里约的天主教徒觉得', '这座城越来越不信神了，', '于是大家捐钱，在山顶立起了它。'], '前景是 1920 年代里约街头的剪影人群往教堂捐款箱里投硬币；远处科尔科瓦多山顶，雕像裹着脚手架正在建，「1922 → 1931」。', 2, 20202,
     rows=['1922年，里约的天主教徒觉得', '这座城越来越[不信神]了，'])
add('1:08', '地球 · 横跨大西洋', [], '「你」学着雕像张开双臂，咔嚓。然后最长的一段：横跨大西洋，里程表 20,202 → 29,405。配音：「Benvenuto in Italia!」',
    H(svgw(globe('atlantic', {'cr', 'co', 'gw', 'ci', 'mp'}, arc('atlantic'))), subs(['下一段，横跨[大西洋]。']), counter(3), odo2(29405), SEAL))
# ===== stop 4: 斗兽场 =====
arr_frame(3)
hist('colosseum_nero_lake', '1:13', ['这块地，原来是暴君尼禄的私人湖。'], '同一个角度回到古罗马：金色宫殿和柱廊围着一片人工湖，尼禄的剪影站在露台上俯看自己的私人湖。', 3, 29405,
     rows=['这块地，原来是暴君尼禄的', '[私人湖]。'])
hist('colosseum_return', '1:17', ['新皇帝把湖填了，建起斗兽场，', '说：还给罗马人民。'], '湖被填平，崭新完整的斗兽场立在原地，成群的罗马人从拱门涌进去，顶上挂着遮阳篷；地上隐约还有旧湖的轮廓。', 3, 29405,
     rows=['新皇帝把湖填了，建起斗兽场，', '说：还给[罗马人民]。'])
# ===== Egypt / the pyramid =====
eg = B.KFR[5][1]
eg = eg.replace(B.counter(5), counter(4)).replace(B.odo(29399, ghost=True), odo2(31000))
add('1:21', '手绘 · 舷窗 · 埃及', ['往东飞，下面就是[埃及]。', '还记得第8格吗？'], '舷窗往下看：沙漠、尼罗河、三座小金字塔；画面角落相册的第 8 格在闪。', eg)
ancient = [('空中花园', 'garden'), ('阿尔忒弥斯神庙', 'temple'), ('宙斯神像', 'zeus'), ('摩索拉斯陵墓', 'mauso'), ('罗德岛巨像', 'colossus'), ('亚历山大灯塔', 'light')]
def anc_icon(kind, x, y):
    st = 'fill="none" stroke="#9AA3B5" stroke-width="5" stroke-dasharray="12 9" stroke-linejoin="round"'
    shapes = {'garden': f'<path d="M{x - 90},{y} L{x - 90},{y - 60} L{x - 60},{y - 60} L{x - 60},{y - 110} L{x - 20},{y - 110} L{x - 20},{y - 160} L{x + 20},{y - 160} L{x + 20},{y - 110} L{x + 60},{y - 110} L{x + 60},{y - 60} L{x + 90},{y - 60} L{x + 90},{y} Z" {st}/>',
              'temple': f'<path d="M{x - 100},{y} L{x + 100},{y} M{x - 100},{y - 120} L{x},{y - 175} L{x + 100},{y - 120} Z" {st}/>' + ''.join(f'<line x1="{x - 85 + i * 34}" y1="{y - 115}" x2="{x - 85 + i * 34}" y2="{y}" {st}/>' for i in range(6)),
              'zeus': f'<path d="M{x - 70},{y} L{x - 70},{y - 70} L{x - 40},{y - 70} L{x - 40},{y - 140} C{x - 40},{y - 175} {x + 40},{y - 175} {x + 40},{y - 140} L{x + 40},{y - 70} L{x + 70},{y - 70} L{x + 70},{y} Z" {st}/><circle cx="{x}" cy="{y - 190}" r="22" {st}/>',
              'mauso': f'<path d="M{x - 90},{y} L{x - 90},{y - 50} L{x + 90},{y - 50} L{x + 90},{y} Z M{x - 70},{y - 50} L{x - 70},{y - 110} L{x + 70},{y - 110} L{x + 70},{y - 50} M{x - 80},{y - 110} L{x},{y - 190} L{x + 80},{y - 110}" {st}/>',
              'colossus': f'<path d="M{x - 30},{y} L{x - 20},{y - 90} L{x - 30},{y - 160} L{x + 30},{y - 160} L{x + 20},{y - 90} L{x + 30},{y} M{x + 30},{y - 150} L{x + 60},{y - 220}" {st}/><circle cx="{x}" cy="{y - 180}" r="18" {st}/>',
              'light': f'<path d="M{x - 60},{y} L{x - 45},{y - 90} L{x - 30},{y - 90} L{x - 22},{y - 170} L{x - 12},{y - 170} L{x - 8},{y - 220} L{x + 8},{y - 220} L{x + 12},{y - 170} L{x + 22},{y - 170} L{x + 30},{y - 90} L{x + 45},{y - 90} L{x + 60},{y} Z" {st}/>'}
    return shapes[kind]
anc = ['<defs><linearGradient id="dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B2237"/><stop offset="1" stop-color="#E39A5E"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#dk)"/>',
       '<rect y="820" width="1920" height="260" fill="#C79A63"/>']
xs = [180, 430, 680, 1240, 1490, 1740]
for (name, kind), x in zip(ancient, xs):
    anc.append(anc_icon(kind, x, 800)); anc.append(f'<text x="{x}" y="870" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="700" font-size="26" fill="#5E5146" opacity=".8">{name}</text>')
    anc.append(f'<text x="{x}" y="910" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="24" fill="#7A3E2E" opacity=".75">已消失</text>')
anc.append('<g filter="url(#ds)"><path d="M740,800 L960,430 L1180,800 Z" fill="#E7B66A" stroke="#2A211B" stroke-width="5"/><path d="M960,430 L1180,800 L1010,800 Z" fill="#B9844A"/></g>')
anc.append(f'<circle cx="960" cy="600" r="300" fill="{GOLD}" opacity=".18" filter="url(#blur30)"/><text x="960" y="880" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="36" fill="#2A211B">吉萨大金字塔 · 唯一还在</text>')
add('1:29', '手绘 · 古代七大奇迹', ['金字塔本来也在候选名单里，埃及人[不干了]：', '它是古代七大奇迹里[唯一还在的]，根本不需要投票。'], '古代七大奇迹排成一排：六个只剩灰色虚线轮廓（标「已消失」），中间的吉萨大金字塔是实心的，在夕阳里发光。',
    H(svgw(''.join(anc)), subs(['它是古代七大奇迹里[唯一还在的]，', '根本不需要投票。']), counter(4), odo2(31000), SEAL))
sv, ht = album(4, slot8='gold')
add('1:34', '手绘 · 相册 · 荣誉', ['最后，它成了', '“[荣誉]候选”。'], '相册第 8 格不放照片，贴上一枚金色月桂「荣誉」贴纸。',
    H(sv, ht, subs(['最后，它成了', '“[荣誉]候选”。']), counter(4, hot=True), odo2(31000), SEAL))
# ===== stop 5: 佩特拉 =====
arr_frame(4)
hist('petra_caravan', '1:41', ['两千年前，运香料的骆驼队', '都要经过这里。'], '白天的红色峡谷里，一支驮着乳香、香料的骆驼队向深处的宝库立面走去。', 4, 31823)
hist('petra_tax', '1:45', ['纳巴泰人收过路税发了财，', '把城刻进了石头里。'], '峡谷口的收税点：商人交钱，金币越堆越高；后面的宝库立面上半已经凿好，下半还是原石，小小的工匠在凿。', 4, 31823,
     rows=['纳巴泰人收[过路税]发了财，', '把城刻进了石头里。'])
develop_frame('petra2', '1:49', '夜里：「你」抱着纸灯坐在灯海里，咔嚓；相纸在烛光里慢慢显影（这一站显影最慢）。', 4, 31823, dev=.35, caption='佩特拉 · 5/7', candle=True)
# ===== stop 6: 泰姬陵 =====
arr_frame(5)
hist('taj_build', '1:53', ['皇后生下第14个孩子后去世，', '皇帝为她修了二十多年。'], '泰姬陵在脚手架里慢慢长出来，工匠和大象运大理石，大大的金色年份「1632 → 1653」；前景是低头哀悼的皇帝剪影。', 5, 35967,
     rows=['皇后生下第14个孩子后去世，', '皇帝为她修了[二十多年]。'])
hist('taj_fort', '1:58', ['晚年他被软禁，只能远远望着它；', '死后，葬在了她身边。'], '阿格拉堡的红砂岩拱窗里，年老的皇帝剪影坐着向外望；远处河对岸的雾里，小小的白色泰姬陵在暮色里发光；旁边并排的两座白色衣冠冢。', 5, 35967,
     rows=['晚年他被软禁，只能[远远望着]它；', '死后，葬在了她身边。'])
viewfinder_frame('taj', '2:02', '人群全都面朝泰姬陵，只有「你」转过身朝镜头挥手：咔嚓。', 5, 35967)
# ===== the race home =====
bar = ('<rect width="1920" height="1080" fill="#0E1424"/>'
       f'<text x="960" y="560" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="190" fill="{CREAM}" style="font-variant-numeric:tabular-nums">35,967</text>'
       f'<text x="960" y="640" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="700" font-size="48" fill="{CREAM}" opacity=".75">/ 40,075 公里（地球一圈）</text>'
       f'<rect x="360" y="700" width="1200" height="34" rx="17" fill="#2A3350"/><rect x="360" y="700" width="{1200 * 35967 / 40075:.0f}" height="34" rx="17" fill="{GOLD}"/>'
       f'<text x="{360 + 1200 * 35967 / 40075 + 10:.0f}" y="790" font-family="Noto Sans CJK SC" font-weight="900" font-size="44" fill="#E5483B">还差 4,108</text>'
       f'<text x="960" y="890" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="700" font-size="40" fill="{CREAM}" opacity=".8">最后一段：泰姬陵 → 长城（3,769 公里）</text>')
add('2:03', '手绘 · 里程表特写', ['已经飞了35967公里，', '离一圈只差[4108公里]。'], '里程表放大：35,967 / 40,075，金色进度条差一截，红字「还差 4,108」；下面写着最后一段 3,769 公里。',
    H(svgw(bar), subs(['已经飞了35967公里，', '离一圈只差[4108公里]。']), counter(6, hot=True), SEAL))
o = G7['asia']; tj = o['pts']['tj']['xy']
add('2:08', '地球 · 最后一段', ['回家这一段，', '够不够？'], '最后一跳：泰姬陵 → 长城，金色航线往家的方向画；问题居中。里程表滚动、越来越慢（音乐蓄力）。',
    H(svgw(globe('asia', set(B.P), arc('asia')) + plane(tj[0] + 40, tj[1] - 40, -40)), subs_c(['回家这一段，', '够不够？'], top=40), counter(6, hot=True), odo2(38800), SEAL))
o = G7['reveal']; fr, bk = B.route_paths('reveal', B.BEST)
ex = (f'<path d="{o["eqAll"]}" stroke="#FFF" stroke-opacity=".3" stroke-width="3" stroke-dasharray="10 10" fill="none"/>'
      f'<path d="{bk}" stroke="{GOLD}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="6 9" fill="none"/>'
      f'<path d="{fr}" stroke="{GOLD}" stroke-width="14" fill="none" opacity=".35" filter="url(#blur8)"/><path d="{fr}" stroke="{GOLD}" stroke-width="5" fill="none" stroke-linejoin="round"/>')
big = ('<div style="position:absolute;left:0;right:0;top:60px;text-align:center;font-family:Noto Sans CJK SC;font-weight:900;font-size:130px;color:#F2C66E;text-shadow:0 0 30px rgba(14,8,5,.9)">39,735 公里</div>'
       '<div style="position:absolute;left:0;right:0;top:230px;text-align:center;font-family:Noto Sans CJK SC;font-weight:800;font-size:50px;color:#FFF6E6;text-shadow:0 0 14px rgba(14,8,5,.9)">地球一圈 40,075 · 差 <span style="color:#E5483B">340</span> 公里，没绕满</div>')
add('2:14', '地球 · 答案（落在副歌重拍）', ['[39735公里]。', '差340公里，没绕满一圈。'], '里程表停在 39,735，音乐落拍。金色航线环和赤道虚线几乎重合，差一小截。',
    H(svgw(globe('reveal', set(B.P), ex)), big, counter(6, hot=True), odo2(39735), SEAL))
# ===== home: 长城, 欢迎回家 =====
home = img(drawn('greatwall2')) + svgw(clouds() + stamp('中国', '欢迎回家', 1540, 470, rot=-10, col='#C0392B'))
add('2:20', '手绘 · 回到长城 · 配音「欢迎回家」', ['差的那340公里？', '在[万里长城]上走走就补上了。'], '俯冲回到代码画的长城：金色夕阳，「你」在台阶顶上自拍（全片唯一一张自拍）；入境章「中国 · 欢迎回家」。配音（普通话）：「欢迎回家。」',
    H(home, '<div style="position:absolute;left:150px;top:420px;width:620px;padding:22px 30px 26px;border-radius:18px;background:rgba(18,30,52,.9);border-top:8px solid #F2C66E;text-align:center">'
            '<div style="font-family:Noto Sans CJK SC;font-weight:700;font-size:24px;letter-spacing:4px;color:#F2C66E">✈ 到达 ARRIVALS</div><div style="font-family:Noto Sans CJK SC;font-weight:900;font-size:92px;color:#FFF">欢迎回家</div></div>',
      subs(['差的那340公里？', '在[万里长城]上走走就补上了。']), counter(6, hot=True), odo2(39735), SEAL))
snap_last = f'{SB}/snap/f/0199.jpg'
add('2:22', '拍立得 7/7', [], '自拍咔嚓（只有快门声），相纸弹出、显影：「长城 · 7/7　欢迎回家」。', H(img(snap_last), counter(7, hot=True), SEAL))
sv, ht = album(7, slot8='gold')
add('2:25', '手绘 · 完整相册（截图位）', ['这一圈，你的7张[打卡照]。', '截图存好！'], '完整的旅行相册：7 张拍立得 + 第 8 格金色「荣誉」贴纸，每张一枚贴纸、一行手写、一枚入境章。静止 2 秒方便截图。',
    H(sv, ht, subs(['这一圈，你的7张[打卡照]。', '截图存好！'], top=60), counter(7, hot=True), odo2(39735), SEAL))
add('2:29', '手绘 · 互动', ['你去过几个？评论区打个数字👇', '真去过的，晒出你的照片！'], '同一本相册，镜头轻轻推近；结尾提问。', H(sv, ht, subs(['你去过几个？评论区打个数字👇', '真去过的，晒出你的照片！'], top=60), counter(7, hot=True), SEAL))
seal = base64.b64encode(open('/home/claude/video/episodes/37-qiqing/remotion/public/ep44/jseal.png', 'rb').read()).decode()
end = ('<div style="position:absolute;inset:0;opacity:.28">' + sv + ht + '</div>'
       f'<img src="data:image/png;base64,{seal}" style="position:absolute;left:880px;top:80px;width:160px;transform:rotate(-8deg);opacity:.95">'
       '<div style="position:absolute;left:0;right:0;top:280px;text-align:center;font-family:\'Noto Serif CJK SC\';font-weight:900;font-size:84px;line-height:1.3;color:#FFF6E6">《新世界七大奇迹，<br>你去过几个？》</div>'
       '<div style="position:absolute;left:0;right:0;top:560px;text-align:center;font-family:Noto Sans CJK SC;font-weight:900;font-size:62px;color:#F2C66E">你去过几个？评论区打个数字👇</div>'
       '<div style="position:absolute;left:50%;top:680px;transform:translateX(-50%);padding:14px 40px;border-radius:40px;background:rgba(255,246,230,.12);border:2px solid rgba(255,246,230,.5);font-family:Noto Sans CJK SC;font-weight:800;font-size:36px;color:#FFF6E6;white-space:nowrap">关注 Juno · 一起看懂世界</div>'
       '<div style="position:absolute;left:150px;right:150px;top:800px;text-align:center;font-family:Noto Sans CJK SC;font-size:22px;line-height:1.6;color:rgba(255,246,230,.75)">距离按大圆直线计算：北京首都机场出发，经6处，回到长城八达岭；720种顺序中最短 · 新七大奇迹为瑞士私人基金会2007年发起的投票<br>'
       '资料：Britannica · National Geographic · Smarthistory · History Hit · Yale（Kleiner）· China Daily · INAH · Daily News Egypt · 照片：Pexels 等 · 音乐：Nato Kitch《i will feel alive》</div>')
add('2:34', '片尾（≥ 5.5 秒）', ['《新世界七大奇迹，你去过几个？》', '你去过几个？评论区打个数字👇'], '片尾卡：相册压暗到约 30%，红色 J 印章、片名、结尾提问、关注胶囊、计算口径、资料来源、照片和音乐署名。停 ≥ 5.5 秒后淡出。',
    page('<div style="position:absolute;inset:0;background:#241A13"></div>' + end))

if __name__ == '__main__':
    only = set(sys.argv[1:])
    with sync_playwright() as pw:
        br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080})
        for i, fr in enumerate(FR):
            name = f'k{i + 1:02d}'
            if only and name not in only: continue
            fn = f'{OUT}/{name}.html'; open(fn, 'w').write(fr['html'])
            pg.goto('file://' + fn); pg.wait_for_timeout(300); pg.evaluate('document.fonts.ready')
            pg.locator('#f').screenshot(path=f'{OUT}/{name}.jpg', type='jpeg', quality=88)
        br.close()
    json.dump([{k: v for k, v in fr.items() if k != 'html'} for fr in FR], open(f'{OUT}/kf7.json', 'w'), ensure_ascii=False, indent=1)
    print('frames', len(FR))
