"""ep57 rough storyboard v1: 25 frames (1920x1080) from the script v5 beats, with the real photos + the
D+ 可爱 「你」 character (sb_comp.py), the drawn → real device shown as posterised 'drawn' frames and photo-print
'打卡照' frames, plus the drawn travel shots (reuses make_kf.py's gate / globe / serpent / Egypt / reveal).
Writes scratchpad sb57/frames/pNN.jpg and sb57/panels.json (captions for the storyboard page).
Photos and renders stay in the scratchpad (never committed)."""
import json, math, os, random, re
import numpy as np, cv2
from PIL import Image
from playwright.sync_api import sync_playwright

S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad'
SB, KF, PH = f'{S}/sb57', f'{S}/ep57kf', f'{S}/ep57photos'
FR_DIR = f'{SB}/frames'; os.makedirs(FR_DIR, exist_ok=True)
TOOLS = os.path.dirname(os.path.abspath(__file__))

# reuse the drawn key-frame helpers and pages (everything before make_kf's render loop)
ns = {'__file__': f'{TOOLS}/make_kf.py', '__name__': 'kf'}
src = open(f'{TOOLS}/make_kf.py').read().split("os.makedirs(f'{D}/frames'")[0]
src = src.replace("G = json.load(open(f'{D}/globe.json'))", f"G = json.load(open('{KF}/globe.json'))")
exec(src, ns)
subs, counter, odo, SEALD, page, globe_svg, plane, DEFS, KFR, GOLD, CREAM, G = (ns[k] for k in
    ('subs', 'counter', 'odo', 'SEALD', 'page', 'globe_svg', 'plane', 'DEFS', 'FR', 'GOLD', 'CREAM', 'G'))

def hl(r): return re.sub(r'\[([^\]]+)\]', r'<span style="border-bottom:7px solid #F2C66E;padding-bottom:2px">\1</span>', r)
def subs_c(rows, top=120):
    return (f'<div style="position:absolute;left:0;right:0;top:{top}px;text-align:center;font-family:Noto Sans CJK SC;font-weight:900;font-size:65px;line-height:1.5;letter-spacing:.03em;'
            f'color:{CREAM};text-shadow:0 0 18px rgba(14,8,5,.85),0 2px 4px rgba(14,8,5,.9);white-space:nowrap">{"<br>".join(hl(r) for r in rows)}</div>')
HEAD = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}#f{position:relative;width:1920px;height:1080px;overflow:hidden}</style></head><body><div id="f">'
def photo_page(bg, overlay, svg=''):
    return (HEAD + f'<img src="file://{bg}" style="position:absolute;left:0;top:0;width:1920px;height:1080px">'
            f'<svg width="1920" height="1080" style="position:absolute;left:0;top:0">{DEFS}{svg}</svg>'
            '<div style="position:absolute;inset:0;background:radial-gradient(ellipse 1150px 520px at 0% 0%, rgba(14,8,5,.5), rgba(14,8,5,0))"></div>'
            f'{overlay}</div></body></html>')

# ---------- photo crops: real and 'drawn' (posterised clean plate + the same character layer) ----------
CROPS = {'greatwall': (0, 286, 2576, 1735), 'gw_push': (700, 520, 2576, 1575), 'chichen': (0, 500, 1932, 1587), 'machu': (0, 0, 2576, 1449),
         'christ': (0, 950, 1718, 1916), 'colosseum': (0, 482, 2576, 1931), 'petra': (0, 1300, 2070, 2464), 'taj': (0, 150, 2576, 1599)}
def posterize(rgb, k=10):
    sm = cv2.bilateralFilter(cv2.bilateralFilter(rgb, 9, 50, 9), 9, 50, 9)
    lab = cv2.cvtColor(sm, cv2.COLOR_RGB2LAB).astype(np.float32)
    small = cv2.resize(lab, (480, 270), interpolation=cv2.INTER_AREA).reshape(-1, 3)
    _, _, cen = cv2.kmeans(small, k, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, .5), 3, cv2.KMEANS_PP_CENTERS)
    flat = lab.reshape(-1, 3); lbl = np.argmin(((flat[:, None, :] - cen[None]) ** 2).sum(-1), 1).astype(np.uint8).reshape(lab.shape[:2])
    lbl = cv2.medianBlur(cv2.medianBlur(lbl, 9), 9)
    return cv2.cvtColor(cen[lbl].astype(np.uint8), cv2.COLOR_LAB2RGB)
def crop(k, box_key=None, drawn=False):
    box = CROPS[box_key or k]; tag = (box_key or k) + ('_drawn' if drawn else '_real'); out = f'{SB}/{tag}.jpg'
    x0, y0, x1, y1 = box
    fig = Image.open(f'{SB}/fig_{k}.png').convert('RGBA').crop(box).resize((1920, 1080), Image.LANCZOS)
    a = np.array(fig)[..., 3]; ys, xs = np.nonzero(a > 40)
    bbox = (xs.min(), ys.min(), xs.max(), ys.max()) if len(xs) else None
    if not os.path.exists(out):
        if drawn:
            base = posterize(np.array(Image.open(f'{SB}/clean_{k}.jpg').convert('RGB').crop(box).resize((1920, 1080), Image.LANCZOS)))
            im = Image.fromarray(base).convert('RGBA'); im.alpha_composite(fig); im.convert('RGB').save(out, quality=92)
        else:
            Image.open(f'{SB}/comp_{k}.jpg').crop(box).resize((1920, 1080), Image.LANCZOS).save(out, quality=92)
    return out, bbox
def viewfinder(bbox):
    g = ['<g stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" opacity=".92">']
    for (x, y, dx, dy) in ((120, 80, 1, 1), (1800, 80, -1, 1), (120, 1000, 1, -1), (1800, 1000, -1, -1)):
        g.append(f'<path d="M{x},{y + dy * 70} L{x},{y} L{x + dx * 70},{y}"/>')
    if bbox:
        x0, y0, x1, y1 = bbox; x0 -= 26; y0 -= 26; x1 += 26; y1 = min(1050, y1 + 26); L = 40
        for (x, y, dx, dy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
            g.append(f'<path d="M{x},{y + dy * L} L{x},{y} L{x + dx * L},{y}" stroke="{GOLD}" stroke-width="5"/>')
    g.append('</g><circle cx="1745" cy="128" r="11" fill="#E5483B"/>')
    return ''.join(g)

ASPECT = {}
def print_page(k, n, name, overlay, rot=-2):
    W, H = Image.open(f'{SB}/comp_{k}.jpg').size; ar = W / H
    if ar >= 1: iw = 1120; ih = iw / ar
    else: ih = 740; iw = ih * ar
    cx, cy = 960, 590; pw, phh = iw + 40, ih + 110
    bg = f'{SB}/comp_{k}.jpg'
    flash = '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(255,255,255,0) 55%, rgba(255,255,255,.45) 100%)"></div>'
    pr = (f'<div style="position:absolute;left:{cx - pw / 2:.0f}px;top:{cy - phh / 2:.0f}px;width:{iw:.0f}px;padding:20px 20px 90px;background:#FFFFFF;box-shadow:0 30px 70px rgba(0,0,0,.55);transform:rotate({rot}deg)">'
          f'<img src="file://{bg}" style="display:block;width:{iw:.0f}px;height:{ih:.0f}px;object-fit:cover">'
          f'<div style="position:absolute;left:0;right:0;bottom:26px;text-align:center;font-family:\'Noto Serif CJK SC\';font-weight:700;font-size:36px;color:#5A524A">你的打卡照 · {name} · {n}/7</div></div>')
    return (HEAD + f'<img src="file://{bg}" style="position:absolute;left:-80px;top:-80px;width:2080px;height:1240px;object-fit:cover;filter:blur(30px) brightness(.4)">'
            + pr + flash + overlay + '</div></body></html>')

# ---------- globe helpers (same orthographic as d3 in globe.mjs; verified against globe.json) ----------
VIEWS = {'pacific': ([165, -10, 0], 430, 960, 600), 'egypt': ([-25, -28, 0], 430, 960, 600), 'reveal': ([40, -20, 0], 380, 960, 610)}
P = {'gw': (116.02, 40.36), 'ci': (-88.568, 20.684), 'mp': (-72.545, -13.163), 'cr': (-43.211, -22.952), 'co': (12.492, 41.89), 'pe': (35.444, 30.329), 'tj': (78.042, 27.175)}
def ortho(view):
    rot, r, cx, cy = VIEWS[view]; l0, p0 = math.radians(-rot[0]), math.radians(-rot[1])
    def f(lon, lat):
        l, p = math.radians(lon), math.radians(lat)
        x = r * math.cos(p) * math.sin(l - l0); y = r * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))
        vis = math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0) >= 0
        return cx + x, cy - y, vis
    return f
def gc(a, b, n=48):
    v = lambda ll: (math.cos(math.radians(ll[1])) * math.cos(math.radians(ll[0])), math.cos(math.radians(ll[1])) * math.sin(math.radians(ll[0])), math.sin(math.radians(ll[1])))
    A, B = v(a), v(b); d = math.acos(max(-1, min(1, sum(x * y for x, y in zip(A, B))))); out = []
    for i in range(n + 1):
        t = i / n; w1, w2 = (math.sin((1 - t) * d) / math.sin(d), math.sin(t * d) / math.sin(d)) if d > 1e-9 else (1 - t, t)
        x, y, z = (w1 * p + w2 * q for p, q in zip(A, B)); out.append((math.degrees(math.atan2(y, x)), math.degrees(math.atan2(z, math.hypot(x, y)))))
    return out
def route_paths(view, seq):
    f = ortho(view); front, back = [], []
    for a, b in zip(seq, seq[1:]):
        run, vis0 = [], None
        for lon, lat in gc(P[a], P[b]):
            x, y, vis = f(lon, lat)
            if vis0 is not None and vis != vis0:
                (front if vis0 else back).append(run); run = []
            run.append((x, y)); vis0 = vis
        (front if vis0 else back).append(run)
    d = lambda runs: ''.join('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in r) for r in runs if len(r) > 1)
    return d(front), d(back)
BEST = ['gw', 'ci', 'mp', 'cr', 'co', 'pe', 'tj', 'gw']
WORST = ['gw', 'co', 'ci', 'pe', 'mp', 'tj', 'cr', 'gw']

FRAMES = []   # (time, tag, rows, picture, html)
def add(time, tag, lines, pic, html): FRAMES.append(dict(time=time, tag=tag, lines=lines, pic=pic, html=html))

# 1 · frame 0: the first 打卡照, 长城 (real)
bg, bb = crop('greatwall')
add('0:00', '实拍 · 第0帧', ['新世界七大奇迹，你是不是[只去过长城]？'],
    '第0帧就是第一张「打卡照」：长城实拍，「你」在城墙上朝镜头挥手。右上「打卡 1/7」。',
    photo_page(bg, subs(['新世界七大奇迹，', '你是不是[只去过长城]？']) + counter(1) + SEALD))
# 2 · boarding gate (drawn, from make_kf)
add('0:03', '手绘 · 登机口', ['今天，带你把[剩下6个]，一次看完。'], '登机口 POV：手里一张登机牌「长城 → 新世界七大奇迹 ×6」，座位 7A，乘客「你」。左下里程表出现：已飞 0 公里。', KFR[1][1])
# 3 · boarding pass back: 7 wonders + a greyed pyramid
POS = {'greatwall': '45% 35%', 'chichen': '38% 45%', 'machu': '78% 40%', 'christ': '50% 44%', 'colosseum': '40% 60%', 'petra': '50% 35%', 'taj': '50% 32%'}
NAMES = [('greatwall', '长城'), ('chichen', '奇琴伊察'), ('machu', '马丘比丘'), ('christ', '基督像'), ('colosseum', '斗兽场'), ('petra', '佩特拉'), ('taj', '泰姬陵')]
cells = ''
for i, (k, nm) in enumerate(NAMES + [('pyr', '金字塔？')]):
    x = 480 + (i % 4) * 300; y = 470 + (i // 4) * 270
    if k == 'pyr':
        cells += (f'<div style="position:absolute;left:{x - 85}px;top:{y - 85}px;width:166px;height:166px;border-radius:50%;border:4px dashed #A99F92;display:flex;align-items:center;justify-content:center">'
                  '<svg width="110" height="90"><path d="M10,80 L55,12 L100,80 Z" fill="none" stroke="#A99F92" stroke-width="5" stroke-linejoin="round"/></svg>'
                  '<div style="position:absolute;font-family:Noto Sans CJK SC;font-weight:900;font-size:64px;color:#C0392B;right:-14px;top:-26px">?</div></div>')
    else:
        cells += f'<div style="position:absolute;left:{x - 85}px;top:{y - 85}px;width:170px;height:170px;border-radius:50%;background:url(file://{PH}/{k}.jpg) {POS[k]}/cover;box-shadow:0 4px 10px rgba(0,0,0,.25)"></div>'
    cells += f'<div style="position:absolute;left:{x - 120}px;width:240px;top:{y + 96}px;text-align:center;font-family:Noto Sans CJK SC;font-weight:800;font-size:30px;color:{"#A99F92" if k == "pyr" else "#2A2420"}">{nm}</div>'
card = (f'<div style="position:absolute;left:270px;top:300px;width:1380px;height:700px;transform:rotate(-2deg)">'
        f'<div style="position:absolute;inset:0;background:#FBF3E2;border-radius:24px;box-shadow:0 30px 60px rgba(0,0,0,.5)"></div>'
        f'<div style="position:absolute;left:0;right:0;top:0;height:76px;background:#C0392B;border-radius:24px 24px 0 0;font-family:Noto Sans CJK SC;font-weight:800;font-size:34px;color:#FFF6E6;line-height:76px;padding-left:40px">新世界七大奇迹 · 2007 全球投票</div>'
        f'<div style="position:absolute;left:-270px;top:-300px;width:1920px;height:1080px">{cells}</div></div>')
add('0:06', '手绘 · 登机牌背面', ['这7个，是2007年近1亿人投票选的。', '咦，怎么没有[金字塔]？'],
    '登机牌翻到背面：7 个圆形小照片，第 8 个是灰色虚线的金字塔 + 红色问号。第二个问题埋下。',
    HEAD + '<div style="position:absolute;inset:0;background:#121826"></div>' + card + subs_c(['咦，怎么没有[金字塔]？'], top=100) + counter(1) + odo(0) + SEALD + '</div></body></html>')
# 4 · back to 长城, push in (real)
bg, bb = crop('greatwall', 'gw_push')
add('0:11', '实拍 · 推近', ['起点，就在家门口：[长城]。', '历代长城加起来，有21196公里。'],
    '回到长城实拍，镜头慢慢推近；「你」挥手告别。地球上长城的点变金色。',
    photo_page(bg, subs(['历代长城加起来，', '有[21196公里]。']) + counter(1) + odo(0) + SEALD))
# 5 · Pacific hop (from make_kf)
add('0:19', '地球 · 跳转', ['下一站，直接横跨[太平洋]。'], '无国界地球仪，金色航线横跨太平洋，小飞机；里程表狂转 → 12,766。', KFR[2][1])
# 6 · 5,040 orders collapse into the shortest loop
rnd = random.Random(7); mids = BEST[1:-1]; tangles = ''
for _ in range(70):
    m = mids[:]; rnd.shuffle(m); fr, bk = route_paths('reveal', ['gw'] + m + ['gw'])
    tangles += f'<path d="{fr}" stroke="#FFFFFF" stroke-opacity=".13" stroke-width="2" fill="none"/>'
fr, bk = route_paths('reveal', BEST)
ex = (tangles + f'<path d="{bk}" stroke="{GOLD}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="6 9" fill="none"/>'
      f'<path d="{fr}" stroke="{GOLD}" stroke-width="14" fill="none" opacity=".35" filter="url(#blur8)"/><path d="{fr}" stroke="{GOLD}" stroke-width="5" fill="none" stroke-linejoin="round"/>')
add('0:23', '地球 · 主问题', ['7个地方有5040种走法，这是最短的一种。', '从长城出发再飞回来，[最少]要飞多少公里？'],
    '5040 条乱线在地球上闪，然后收成一条干净的金色环线。整片的主问题，答案留到最后。',
    page(globe_svg('reveal', {'gw'}, ex), subs_c(['从长城出发再飞回来，', '[最少]要飞多少公里？'], top=40) + counter(1) + odo(12766) + SEALD))
# 7 · 奇琴伊察 drawn + 365
bg, bb = crop('chichen', drawn=True)
lab365 = ('<div style="position:absolute;left:760px;top:250px;width:470px;text-align:center;font-family:Noto Sans CJK SC;color:#F2C66E;text-shadow:0 0 16px rgba(14,8,5,.8)">'
          '<div style="font-size:120px;font-weight:900;line-height:1">365</div><div style="font-size:36px;font-weight:800;color:#FFF6E6">级 = 一年365天</div></div>')
add('0:29', '手绘（照片描出来的）', ['第二站，墨西哥，[奇琴伊察]。', '四面台阶加上顶上的平台，一共[365]级。'],
    '这一站先是「画」出来的：照片描成色块（最终会按 Juno 配色重画），「你」已经站在里面摆姿势。台阶一级级亮起，数到 365。',
    photo_page(bg, subs(['四面台阶加上顶上的平台，', '一共[365]级。']) + lab365 + counter(1) + odo(12766) + SEALD))
# 8 · serpent (drawn, from make_kf)
add('0:38', '手绘 · 大场面', ['每年春分秋分，影子会变成一条[蛇]，'], '整片第一个大视觉：下午的光在台阶边缘投出一串三角形影子，像一条蛇往下爬到石雕蛇头。（音乐在这里抬一下）', KFR[3][1])
# 9 · 打卡照 2/7
add('0:42', '实拍 · 打卡照 2/7', ['从台阶上爬下来。'],
    '取景框出现 → 咔嚓 + 白光 → 画面变成真实照片（和手绘完全对齐），定格成一张相纸：「你的打卡照 · 奇琴伊察 · 2/7」。右上计数变金色。',
    print_page('chichen', 2, '奇琴伊察', subs(['从台阶上爬下来。']) + counter(2, hot=True) + odo(12766) + SEALD, rot=2))
# 10 · 马丘比丘 drawn + viewfinder
bg, bb = crop('machu', drawn=True)
add('0:47', '手绘 + 取景框', ['第三站，秘鲁，[马丘比丘]。'],
    '跳转后落地：手绘版马丘比丘，「你」叉腰站在梯田上。取景框四角 + 对焦框框住「你」：马上要拍了。',
    photo_page(bg, subs(['第三站，秘鲁，', '[马丘比丘]。']) + counter(2) + odo(16917) + SEALD, viewfinder(bb)))
# 11 · 打卡照 3/7
add('0:51', '实拍 · 打卡照 3/7', ['它建在两千多米高的山上，', '[一百年前]才被外面的世界知道。'], '咔嚓 → 真实照片 → 相纸「马丘比丘 · 3/7」。（F8/F9 两个数字待核实）',
    print_page('machu', 3, '马丘比丘', subs(['它建在两千多米高的山上，', '[一百年前]才被外面的世界知道。']) + counter(3, hot=True) + odo(16917) + SEALD, rot=-2))
# 12 · 基督像 drawn + lightning
bg, bb = crop('christ', drawn=True)
bolt = ('<path d="M560,0 L470,120 L540,130 L430,250 L500,262 L425,268" stroke="#FFF7C2" stroke-width="22" fill="none" opacity=".45" filter="url(#blur8)"/>'
        '<path d="M560,0 L470,120 L540,130 L430,250 L500,262 L425,268" stroke="#FFFBE0" stroke-width="7" fill="none" stroke-linejoin="round"/>'
        '<circle cx="425" cy="268" r="34" fill="#FFF7C2" opacity=".55" filter="url(#blur8)"/>')
add('0:57', '手绘 · 雷劈', ['第四站，巴西，[基督像]。', '它是七个里最年轻的：1931年才落成。', '它还常被雷劈，手指和头都被劈坏过。'],
    '手绘版：雕像张开双臂，「你」在前面学它张开双臂。暴雨，一道闪电劈中雕像的右手。（年龄对比：7 个点上标年龄，它最小，95 岁）',
    photo_page(bg, subs(['它还常被雷劈，', '手指和头都被[劈坏]过。']) + counter(3) + odo(20195) + SEALD, bolt))
# 13 · 打卡照 4/7
add('1:05', '实拍 · 打卡照 4/7', ['它还常被雷劈，手指和头都被劈坏过。'], '咔嚓 → 真实照片（竖图）→ 相纸「基督像 · 4/7」。',
    print_page('christ', 4, '基督像', counter(4, hot=True) + odo(20195) + SEALD, rot=-3))
# 14 · 斗兽场 drawn + 5万人
bg, bb = crop('colosseum', drawn=True)
lab5 = ('<div style="position:absolute;left:820px;top:300px;font-family:Noto Sans CJK SC;color:#F2C66E;text-shadow:0 0 16px rgba(14,8,5,.8);text-align:center">'
        '<div style="font-size:120px;font-weight:900;line-height:1">50,000</div><div style="font-size:36px;font-weight:800;color:#FFF6E6">看台一排排坐满</div></div>')
add('1:10', '手绘 · 看台坐满', ['第五站，跨过大西洋：罗马，[斗兽场]。', '两千年前，它能坐下[5万人]。'],
    '跳转跨大西洋（里程表 → 29,399）。手绘版斗兽场，看台上的小剪影一排排坐满；「你」在前面叉腰当「角斗士」。',
    photo_page(bg, subs(['两千年前，', '它能坐下[5万人]。']) + lab5 + counter(4) + odo(29399) + SEALD, viewfinder(bb)))
# 15 · 打卡照 5/7
add('1:15', '实拍 · 打卡照 5/7', ['两千年前，它能坐下[5万人]。'], '咔嚓 → 相纸「斗兽场 · 5/7」。',
    print_page('colosseum', 5, '斗兽场', counter(5, hot=True) + odo(29399) + SEALD, rot=2))
# 16 · Egypt window (from make_kf)
add('1:20', '手绘 · 窗口', ['往东飞，下面就是[埃及]。还记得那个问题吗？'], '飞机舷窗往下看：沙漠、尼罗河、三座小金字塔。登机牌上那个灰色金字塔闪一下。第二个问题开始回答。', KFR[5][1])
# 17 · honorary candidate
CAND = [(23.726, 37.971), (-3.588, 37.176), (103.867, 13.412), (2.294, 48.858), (28.98, 41.008), (135.785, 34.995), (37.617, 55.752), (10.75, 47.557),
        (-74.044, 40.689), (-1.826, 51.179), (151.215, -33.857), (-3.0, 16.77), (-109.35, -27.11)]
f = ortho('egypt'); dots = ''
for lon, lat in CAND:
    x, y, v = f(lon, lat)
    if v: dots += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="#9AA3B5"/>'
for k in P:
    x, y, v = f(*P[k])
    if v: dots += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="8" fill="{GOLD}" opacity=".9"/>'
gx, gy, _ = f(31.134, 29.979)
leaves = ''
for side in (-1, 1):
    for i in range(9):
        a = math.radians(100 + i * 17); lx, ly = gx + side * 58 * math.cos(a) * -1, gy + 58 * math.sin(a)
        leaves += f'<ellipse cx="{lx:.1f}" cy="{ly:.1f}" rx="14" ry="6" fill="{GOLD}" transform="rotate({side * (i * 17 - 60):.0f} {lx:.1f} {ly:.1f})"/>'
honor = (dots + f'<circle cx="{gx:.1f}" cy="{gy:.1f}" r="26" fill="#FFE6A8" opacity=".5" filter="url(#blur8)"/><path d="M{gx - 18:.1f},{gy + 12:.1f} L{gx:.1f},{gy - 16:.1f} L{gx + 18:.1f},{gy + 12:.1f}Z" fill="#FFE6A8"/>' + leaves +
         f'<text x="{gx + 80:.1f}" y="{gy + 14:.1f}" font-family="Noto Sans CJK SC" font-weight="900" font-size="40" fill="#FFE6A8">荣誉候选</text>')
add('1:24', '地球 · 揭晓', ['金字塔，本来也在候选名单里。埃及人不干了：', '它是古代七大奇迹里[唯一还在的]，根本不需要投票。', '最后，它成了“[荣誉]候选”。'],
    '地球上 21 个候选点（灰），7 个入选点（金）；金字塔的点单独亮起，一圈小月桂叶围上来：「荣誉候选」。',
    page(globe_svg('egypt', set(), honor), subs(['最后，它成了', '“[荣誉]候选”。']) + counter(5) + odo(29399, ghost=True) + SEALD))
# 18 · 佩特拉 drawn
bg, bb = crop('petra', drawn=True)
add('1:37', '手绘 + 取景框', ['第六站，约旦，[佩特拉]。', '整座城，是从红色岩石里[凿]出来的。'],
    '手绘版：神殿立面从崖壁上自上而下「凿」出来，碎石掉落；「你」背对镜头坐在一地蜡灯中间，抬头看。',
    photo_page(bg, subs(['整座城，', '是从红色岩石里[凿]出来的。']) + counter(5) + odo(31817) + SEALD, viewfinder(bb)))
# 19 · 打卡照 6/7
add('1:41', '实拍 · 打卡照 6/7', ['整座城，是从红色岩石里[凿]出来的。'], '咔嚓 → 相纸「佩特拉 · 6/7」（竖图，夜景蜡灯）。',
    print_page('petra', 6, '佩特拉', counter(6, hot=True) + odo(31817) + SEALD, rot=-2))
# 20 · 泰姬陵 drawn
bg, bb = crop('taj', drawn=True)
add('1:47', '手绘 + 取景框', ['第七站，印度，[泰姬陵]。'],
    '手绘版：清晨的泰姬陵，前景一排游客剪影，「你」在人群里朝镜头挥手。',
    photo_page(bg, subs(['第七站，印度，', '[泰姬陵]。']) + counter(6) + odo(35960) + SEALD, viewfinder(bb)))
# 21 · 打卡照 7/7
add('1:51', '实拍 · 打卡照 7/7', ['这么美的地方，其实是一座[坟]，', '一位皇帝为去世的妻子修的。'], '咔嚓 → 相纸「泰姬陵 · 7/7」。七张集齐，计数金色 7/7。',
    print_page('taj', 7, '泰姬陵', subs(['这么美的地方，其实是一座[坟]，', '一位皇帝为去世的妻子修的。']) + counter(7, hot=True) + odo(35960) + SEALD, rot=2))
# 22 · the reveal (from make_kf)
add('2:00', '地球 · 答案', ['好了，回家。', '你一共飞了……', '[39729公里]。', '地球一圈是40075公里。你只差了[346公里]——', '差不多，刚好[绕地球一圈]。'],
    '最后一跳回长城，里程表滚完最后 3,769 → 39,729，音乐落拍。金色环线下面浮出赤道虚线，两圈几乎重合，然后锁在一起。',
    KFR[6][1])
# 23 · the worst order
fr, bk = route_paths('reveal', WORST); fb, bb2 = route_paths('reveal', BEST)
ex = (f'<path d="{fb}" stroke="{GOLD}" stroke-opacity=".3" stroke-width="4" fill="none"/>'
      f'<path d="{bk}" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="3" stroke-dasharray="6 9" fill="none"/>'
      f'<path d="{fr}" stroke="#FFFFFF" stroke-width="12" fill="none" opacity=".25" filter="url(#blur8)"/><path d="{fr}" stroke="#FFF6E6" stroke-width="4" fill="none" stroke-linejoin="round"/>')
add('2:13', '地球 · 反例', ['要是顺序乱走呢？', '最远要飞[89636公里]。'], '最差的顺序闪一下：线在地球上来回乱窜，超过两圈。里程表闪成 89,636 再弹回 39,729。',
    page(globe_svg('reveal', set(P), ex), subs(['要是顺序乱走呢？', '最远要飞[89636公里]。']) + counter(7) + odo(89636, ghost=True) + SEALD))
# 24 · the 7 打卡照 (real prints)
ORDER = [('greatwall', '长城'), ('chichen', '奇琴伊察'), ('machu', '马丘比丘'), ('christ', '基督像'), ('colosseum', '斗兽场'), ('petra', '佩特拉'), ('taj', '泰姬陵')]
def grid_html(dim=1.0):
    ih = 285; rows = [ORDER[:4], ORDER[4:]]; out = ''; rots = [-3, 2, -2, 3, 2, -3, 2]; i = 0
    for r, row in enumerate(rows):
        ws = [ih * (lambda s: s[0] / s[1])(Image.open(f'{SB}/comp_{k}.jpg').size) for k, _ in row]
        total = sum(w + 28 for w in ws) + 36 * (len(row) - 1); x = (1920 - total) / 2; y = 300 + r * 375
        for (k, nm), w in zip(row, ws):
            out += (f'<div style="position:absolute;left:{x:.0f}px;top:{y}px;padding:14px 14px 52px;background:#FFFFFF;box-shadow:0 14px 34px rgba(0,0,0,.5);transform:rotate({rots[i]}deg);opacity:{dim}">'
                    f'<img src="file://{SB}/comp_{k}.jpg" style="display:block;width:{w:.0f}px;height:{ih}px;object-fit:cover">'
                    f'<div style="position:absolute;left:0;right:0;bottom:12px;text-align:center;font-family:\'Noto Serif CJK SC\';font-weight:700;font-size:24px;color:#5A524A">{nm} · {i + 1}/7</div></div>')
            x += w + 28 + 36; i += 1
    return out
add('2:18', '实拍 · 七张合集', ['这一圈，你的7张[打卡照]——', '截图存好，晒给朋友。真去过的，评论区[晒]你的照片👇'],
    '7 张打卡照像相纸一样一张张落到桌上，排成一版「你的旅行合集」。静止 2 秒，方便截图。',
    HEAD + '<div style="position:absolute;inset:0;background:#241A13"></div>' + grid_html() + subs(['截图存好，晒给朋友。', '真去过的，评论区[晒]你的照片👇'], top=60) + counter(7, hot=True) + odo(39729) + SEALD + '</div></body></html>')
# 25 · end card
import base64
seal = base64.b64encode(open('/home/claude/video/episodes/37-qiqing/remotion/public/ep44/jseal.png', 'rb').read()).decode()
end = ('<div style="position:absolute;inset:0;background:#241A13"></div><div style="position:absolute;inset:0;opacity:.3">' + grid_html() + '</div>'
       f'<img src="data:image/png;base64,{seal}" style="position:absolute;left:880px;top:90px;width:160px;transform:rotate(-8deg);opacity:.95">'
       '<div style="position:absolute;left:0;right:0;top:290px;text-align:center;font-family:\'Noto Serif CJK SC\';font-weight:900;font-size:84px;line-height:1.3;color:#FFF6E6">《新世界七大奇迹，<br>你去过几个？》</div>'
       '<div style="position:absolute;left:0;right:0;top:560px;text-align:center;font-family:Noto Sans CJK SC;font-weight:900;font-size:62px;color:#F2C66E">你“去过”几个了？</div>'
       '<div style="position:absolute;left:0;right:0;top:650px;text-align:center;font-family:Noto Sans CJK SC;font-weight:800;font-size:46px;color:#FFF6E6">真去过的，评论区晒图👇</div>'
       '<div style="position:absolute;left:50%;top:760px;transform:translateX(-50%);padding:14px 40px;border-radius:40px;background:rgba(255,246,230,.12);border:2px solid rgba(255,246,230,.5);font-family:Noto Sans CJK SC;font-weight:800;font-size:36px;color:#FFF6E6;white-space:nowrap">关注 Juno · 一起看懂世界</div>'
       '<div style="position:absolute;left:150px;right:150px;top:880px;text-align:center;font-family:Noto Sans CJK SC;font-size:22px;line-height:1.6;color:rgba(255,246,230,.7)">距离按大圆直线计算：从八达岭出发、访问7处、返回八达岭；5040种顺序中的最短 · 新七大奇迹为瑞士私人基金会2007年发起的投票<br>来源：China Daily · 新华网 · INAH · Daily News Egypt · UNESCO … · 照片：Pexels（摄影师署名）</div>')
add('2:25', '片尾', ['《新世界七大奇迹，你去过几个？》', '你“去过”几个了？真去过的，评论区晒图👇'], '片尾卡：七张照片压暗到 30%，红色 J 印章、片名、结尾提问、关注胶囊、计算口径和来源、照片署名。停 ≥ 5.5 秒。',
    HEAD + end + '</div></body></html>')

if __name__ == '__main__':
    with sync_playwright() as pw:
        br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080})
        for i, fr in enumerate(FRAMES):
            fn = f'{FR_DIR}/p{i + 1:02d}.html'; open(fn, 'w').write(fr['html'])
            pg.goto('file://' + fn); pg.wait_for_timeout(250); pg.evaluate('document.fonts.ready')
            pg.locator('#f').screenshot(path=f'{FR_DIR}/p{i + 1:02d}.jpg', type='jpeg', quality=90)
        br.close()
    json.dump([{k: v for k, v in fr.items() if k != 'html'} for fr in FRAMES], open(f'{SB}/panels.json', 'w'), ensure_ascii=False, indent=1)
    print('frames', len(FRAMES))
