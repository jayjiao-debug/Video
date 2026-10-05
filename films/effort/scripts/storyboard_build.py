import json, math, html

D = json.load(open('/tmp/claude-0/sb_data.json'))
B = D['beats']
b = lambda i: B[min(i, len(B) - 1)]
DUR = 164.49

def tc(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"

# ---------------------------------------------------------------- scenes
S = [
 dict(id='S0', name='冷开场 · 一颗真实光照的地球', a=0, z=8, sec='intro',
  tools=['3D', '数据'],
  cam='自建的高精度地球（昼夜交界、城市灯光、云层、大气光边），亚洲朝向镜头，镜头慢慢后拉。只点亮 7 个国家的人口数（印度、中国、印尼、日本、伊朗、泰国、菲律宾），首位数字是金色。',
  trans='b8 满分重音：所有国家变成小方块，从地球上落向九根管子。',
  lines=[(0, 8, '随便挑一个国家的人口，第一位最可能是几？')],
  sketch='globe'),
 dict(id='S1', name='钩子 · 215 个方块落进 9 列', a=8, z=32, sec='intro → 第一个 drop',
  tools=['数据'],
  cam='地球暗下去，九根透明管亮起；方块先慢后快地落入（不踩拍）。虚线标出"各占一份 ≈ 24"。b24 重音：1 号管变金，65 和 9 砸下；之后镜头缓慢推近，不留死帧。',
  trans='b30–b32 每根管里的方块熔成一根金条（真实高度），收到标题下面。',
  lines=[(8, 16, '直觉：1到9，{各占一份}。'), (16, 24, '全世界215个国家和地区，数一数——'), (24, 32, '[65]个以1开头，只有[9]个以9开头。')],
  sketch='tubes'),
 dict(id='T', name='标题卡 ·《第一位数字》', a=32, z=44, sec='第一个 drop：b32 = 16.6 s',
  tools=['2D'],
  cam='九根真实数据的金条居中，标题在 drop 上逐字盖下，再扫过一道光。副标题：为什么1开头的数最多？',
  trans='金条横向展开，变成一本旧书书口上的九段磨损。',
  lines=[],
  sketch='title'),
 dict(id='S2', name='1881 · 纽康的对数表', a=44, z=104, sec='响亮段落 → 静默开始',
  tools=['3D', '人物卡'],
  cam='书桌上一本旧对数表（下载模型），油灯侧光，墨水瓶和羽毛笔放在一旁，没有人。镜头贴着书口滑过：前面发黑，后面全新。纽康以静止的头像卡出现，不做动作。',
  trans='b96 音乐骤停，灯灭，书页的灰落成档案室里的尘。',
  lines=[(44, 52, '1881年，美国华盛顿。'), (52, 60, '天文学家纽康天天翻一本对数表。'), (60, 68, '他发现：书的前几页，脏得发黑；'), (68, 76, '越往后翻，越干净。'), (76, 84, '对数表按第一位排：1在最前，9在最后。'), (84, 92, '他猜：1开头的数，用得最多。'), (92, 104, '两页纸发表了，没人在意。')],
  sketch='book'),
 dict(id='S3', name='1938 · 本福特数了两万个数', a=104, z=128, sec='安静段（break）',
  tools=['3D', '数据', '人物卡'],
  cam='一个慢镜头横移过一排档案抽屉，每格一类数据（河流面积 335、美国人口 3,259、物理常数 104……），计数器慢慢爬到 20,229。本福特头像卡。',
  trans='20,229 这个数变成小镇路牌上的人口数。',
  lines=[(104, 112, '57年后，物理学家本福特重新发现了它。'), (112, 120, '他数了20类、[20,229]个数：'), (120, 128, '河流面积、城市人口、物理常数……')],
  sketch='drawers'),
 dict(id='S4', name='机制 · 每年涨一成的小镇', a=128, z=161, sec='build',
  tools=['2D', '数据'],
  cam='一块小镇人口路牌，时间快进；下方一把刻度尺记录"停在每个首位数字上的年数"。1 的格子最宽，9 的最窄。',
  trans='刻度尺的九段竖起来，在 drop 上变成本福特阶梯。',
  lines=[(128, 136, '为什么？看一个每年涨一成的小镇。'), (136, 144, '从1千到2千，要7年多；'), (144, 152, '从9千到1万，1年多就过了。'), (152, 161, '那1开头的，到底占多少？')],
  sketch='town'),
 dict(id='S5', name='揭晓 · 本福特阶梯', a=161, z=192, sec='第二个 drop',
  tools=['数据'],
  cam='b161 九根金条砸下：30.1% → 4.6%。随后开场那 215 个方块飞回来，叠在阶梯上：几乎重合。',
  trans='阶梯缩小，变成 CRT 屏幕上的虚线轮廓。',
  lines=[(161, 168, '约[三成]，以1开头；'), (168, 176, '以9开头的，[不到5%]。'), (176, 184, '这叫[本福特定律]。'), (184, 192, '开头那215个国家，几乎完全吻合。')],
  sketch='stairs'),
 dict(id='S6', name='1993 · 亚利桑那的 23 张支票', a=192, z=232, sec='drop 段',
  tools=['3D', '2D', '数据'],
  cam='1993 年的办公室：针式打印机按自己的节奏吐出支票（不踩拍），金额大多刚好低于 10 万美元。首位数字飞上 CRT：7、8、9 三根红柱远远高出虚线。盖章。办公桌后的人只坐着，不做动作。',
  trans='CRT 屏幕切换成一张欧洲地图。',
  lines=[(192, 200, '1993年，美国亚利桑那州，'), (200, 208, '一位财政官员开出23张支票，近200万美元。'), (208, 216, '金额全是{他编的}。'), (216, 224, '九成以上，以7、8、9开头。'), (224, 232, '和本福特定律一比，[一眼露馅]。')],
  sketch='crt'),
 dict(id='S7', name='2011 · 欧盟各国的经济数据', a=232, z=264, sec='drop 段',
  tools=['地图', '数据'],
  cam='一张 SVG 欧洲轮廓地图。各国按"离本福特多远"着色（示意）；希腊最后亮起，红色。一次只看一处：先全图，再推到希腊。',
  trans='地图的灯光变成城市夜景的窗灯。',
  lines=[(232, 240, '2011年，研究者用同一把尺子，'), (240, 248, '检查欧盟各国上报的经济数据。'), (248, 256, '离本福特定律最远的，是[希腊]。'), (256, 264, '偏离不等于造假，但值得多看一眼。')],
  sketch='map'),
 dict(id='S8', name='哪些数才符合', a=264, z=294, sec='drop 段',
  tools=['3D', '数据'],
  cam='城市夜景里到处是数字：股价、账单、河长、文件大小，首位的 1 逐个亮金。然后身高（都在 1 米几）、手机号、彩票号被划掉。',
  trans='城市的灯从高空看，变回开场那颗地球的夜光。',
  lines=[(264, 272, '跨越好几个数量级、自然增长的数，'), (272, 280, '都偏爱1：人口、股价、河长、账单。'), (280, 288, '身高、手机号、彩票号——不算。'), (288, 294, '人编的数，往往{太平均}。')],
  sketch='city'),
 dict(id='S9', name='回到地球 · 片尾', a=294, z=322, sec='尾声 + 片尾卡（最后 6 秒）',
  tools=['3D'],
  cam='回到开场的地球：65 个"1开头"的国家同时亮金。b310 起片尾卡：标题、九根金条、评论区问题（置顶评论：随手打一个，看看评论区能不能骗过本福特）、出处与模型署名。',
  trans='音乐在 162.1 s 后淡出，片尾卡停在画面上。',
  lines=[(294, 302, '下次看到一串数字，'), (302, 310, '先看第一位。'), (310, 322, '片尾卡：不许想——随手打一个四位数，第一位是几？')],
  sketch='end'),
]

def rich(s):
    s = html.escape(s)
    out, i = '', 0
    while i < len(s):
        ch = s[i]
        if ch == '[':
            j = s.index(']', i); out += f'<b class="g">{s[i+1:j]}</b>'; i = j + 1
        elif ch == '{':
            j = s.index('}', i); out += f'<b class="r">{s[i+1:j]}</b>'; i = j + 1
        else:
            out += ch; i += 1
    return out

# ---------------------------------------------------------------- sketches (schematic keyframes, 320x180)
def sk(kind):
    g = 'var(--gold)'; ink = 'var(--sk-ink)'; dim = 'var(--sk-dim)'; red = 'var(--red)'
    o = []
    if kind == 'globe':
        o.append(f'<circle cx="160" cy="98" r="62" fill="var(--sk-sea)" stroke="{dim}" />')
        o.append(f'<path d="M110,80 C130,60 150,74 168,62 C186,70 196,90 210,96 C200,118 176,130 150,126 C130,118 116,104 110,80Z" fill="var(--sk-land)"/>')
        for i, (x, y, t) in enumerate([(124, 70, '1,463,865,525'), (186, 82, '9,027'), (150, 112, '212,812,405'), (204, 120, '35,042'), (118, 100, '1,280')]):
            o.append(f'<circle cx="{x}" cy="{y}" r="2.2" fill="{g}"/><text x="{x+4}" y="{y-4}" class="sk-t">{t}</text>')
    elif kind == 'tubes':
        counts = D['digits']
        for d in range(9):
            x = 34 + d * 30
            o.append(f'<rect x="{x}" y="30" width="22" height="120" rx="4" fill="none" stroke="{dim}" />')
            h = counts[d] * 1.75
            o.append(f'<rect x="{x+2}" y="{148-h}" width="18" height="{h}" rx="2" fill="{g if d==0 else ink}" opacity="{1 if d in (0,8) else .55}"/>')
            o.append(f'<text x="{x+11}" y="166" text-anchor="middle" class="sk-t">{d+1}</text>')
        o.append(f'<line x1="28" y1="{148-24*1.75:.0f}" x2="300" y2="{148-24*1.75:.0f}" stroke="{red}" stroke-dasharray="4 4"/>')
        o.append(f'<text x="45" y="26" class="sk-big" fill="{g}">65</text><text x="275" y="118" class="sk-big" fill="{ink}">9</text>')
    elif kind == 'title':
        o.append(f'<text x="160" y="76" text-anchor="middle" class="sk-title">《第一位数字》</text>')
        for d in range(9):
            h = math.log10(1 + 1 / (d + 1)) * 150
            o.append(f'<rect x="{104 + d*13}" y="{132-h}" width="10" height="{h}" fill="{g}"/>')
        o.append(f'<text x="160" y="152" text-anchor="middle" class="sk-t">为什么1开头的数最多？</text>')
    elif kind == 'book':
        o.append(f'<rect x="0" y="128" width="320" height="52" fill="var(--sk-wood)"/>')
        o.append('<defs><linearGradient id="wear" x1="0" x2="1"><stop offset="0" stop-color="#3a2c1c"/><stop offset=".35" stop-color="#8a7656"/><stop offset="1" stop-color="#efe5cc"/></linearGradient></defs>')
        o.append('<path d="M60,96 L230,96 L250,80 L80,80Z" fill="#6a3f22"/><rect x="60" y="96" width="170" height="34" fill="url(#wear)"/><path d="M230,96 L250,80 L250,114 L230,130Z" fill="#d9ccb0"/>')
        for d in range(9):
            o.append(f'<text x="{70 + d*18.5}" y="92" class="sk-t" fill="#e8d9b0">{d+1}</text>')
        o.append(f'<circle cx="282" cy="74" r="26" fill="{g}" opacity=".18"/><rect x="276" y="86" width="12" height="42" rx="3" fill="#b8892e"/><ellipse cx="282" cy="74" rx="4" ry="9" fill="#ffd27a"/>')
        o.append(f'<rect x="16" y="16" width="96" height="40" rx="6" fill="#000" opacity=".45"/><ellipse cx="34" cy="36" rx="12" ry="15" fill="#e9dcc0" stroke="{g}"/><text x="52" y="34" class="sk-t">西蒙·纽康</text><text x="52" y="46" class="sk-t" fill="{dim}">1835–1909</text>')
    elif kind == 'drawers':
        for r in range(3):
            for c in range(7):
                o.append(f'<rect x="{18 + c*42}" y="{58 + r*34}" width="38" height="30" fill="var(--sk-wood)" stroke="#000" stroke-opacity=".4"/><rect x="{31 + c*42}" y="{70 + r*34}" width="12" height="5" fill="#c9b48a"/>')
        for c, t in enumerate(['河流', '人口', '常数']):
            o.append(f'<text x="{24 + c*42}" y="{66}" class="sk-t" fill="#efe5cc">{t}</text>')
        o.append(f'<text x="160" y="40" text-anchor="middle" class="sk-big" fill="{g}">20,229</text>')
    elif kind == 'town':
        o.append(f'<rect x="96" y="22" width="128" height="58" rx="4" fill="#efe5cc"/><text x="160" y="40" text-anchor="middle" class="sk-t" fill="#4a3a26">小镇 · 人口</text><text x="160" y="70" text-anchor="middle" class="sk-big" fill="#2a2018">1,000</text>')
        o.append(f'<rect x="156" y="80" width="8" height="30" fill="#5a4630"/>')
        x = 24
        for d in range(1, 10):
            w = math.log10(1 + 1 / d) * 272
            o.append(f'<rect x="{x:.1f}" y="124" width="{w-2:.1f}" height="20" fill="{g if d==1 else ink}" opacity="{1 if d==1 else .4}"/><text x="{x + w/2:.1f}" y="160" text-anchor="middle" class="sk-t">{d}</text>')
            x += w
        o.append(f'<text x="24" y="118" class="sk-t" fill="{dim}">7.3 年</text><text x="296" y="118" text-anchor="end" class="sk-t" fill="{dim}">1.1 年</text>')
    elif kind == 'stairs':
        cnt = D['digits']; n = D['n']
        for d in range(9):
            p = math.log10(1 + 1 / (d + 1)); h = p * 360
            x = 30 + d * 30
            o.append(f'<rect x="{x}" y="{150-h}" width="24" height="{h}" fill="{g}"/>')
            for k in range(cnt[d] // 5):
                o.append(f'<circle cx="{x + 6 + (k%3)*6}" cy="{147 - (k//3)*7}" r="2" fill="#fff" opacity=".7"/>')
            o.append(f'<text x="{x+12}" y="166" text-anchor="middle" class="sk-t">{d+1}</text>')
        o.append(f'<text x="30" y="34" class="sk-big" fill="{g}">30.1%</text><text x="250" y="88" class="sk-t" fill="{g}">4.6%</text>')
    elif kind == 'crt':
        o.append(f'<rect x="0" y="134" width="320" height="46" fill="var(--sk-wood)"/>')
        o.append(f'<rect x="150" y="26" width="150" height="112" rx="10" fill="#cbc3b0"/><rect x="162" y="36" width="126" height="86" fill="#0d1d14"/>')
        for d in range(9):
            h = math.log10(1 + 1 / (d + 1)) * 160
            o.append(f'<rect x="{168 + d*13}" y="{116-h}" width="9" height="{h}" fill="none" stroke="{g}" stroke-dasharray="2 2"/>')
        for d, v in [(6, 52), (7, 72), (8, 60)]:
            o.append(f'<rect x="{169 + d*13}" y="{116-v}" width="7" height="{v}" fill="{red}"/>')
        o.append(f'<g transform="rotate(-12 225 70)"><rect x="186" y="58" width="80" height="24" fill="none" stroke="{red}" stroke-width="2"/><text x="226" y="75" text-anchor="middle" class="sk-t" fill="{red}">不符合规律</text></g>')
        o.append(f'<rect x="20" y="104" width="100" height="30" rx="3" fill="#cfc8b8"/><rect x="34" y="80" width="80" height="34" fill="#e3ead9" transform="rotate(-4 74 97)"/><text x="40" y="102" class="sk-t" fill="#22301e">$<tspan fill="{red}">9</tspan>8,650.00</text>')
    elif kind == 'map':
        blobs = [(60, 60, 26, 20, .25), (100, 74, 22, 18, .2), (140, 56, 30, 22, .3), (178, 84, 24, 20, .45), (120, 108, 22, 26, .15), (90, 120, 14, 22, .15), (216, 60, 22, 30, .5), (200, 112, 16, 14, .35)]
        for x, y, rx, ry, v in blobs:
            o.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{ink}" opacity="{v}"/>')
        o.append(f'<path d="M226,128 l14,-8 l10,10 l-6,14 l10,8 l-14,4 l-6,-10 l-10,4z" fill="{red}"/><text x="262" y="136" class="sk-t" fill="{red}">希腊</text>')
        o.append(f'<text x="14" y="168" class="sk-t" fill="{dim}">示意 · Rauch et al. 2011</text>')
    elif kind == 'city':
        import random
        random.seed(3)
        for i in range(14):
            h = 40 + random.random() * 70; x = 8 + i * 22
            o.append(f'<rect x="{x}" y="{150-h}" width="20" height="{h}" fill="var(--sk-sea)"/>')
            for k in range(int(h // 12)):
                if random.random() > .55:
                    o.append(f'<rect x="{x+6}" y="{154-h+k*12}" width="6" height="5" fill="{g}" opacity=".7"/>')
        for x, y, t, ok in [(24, 30, '1,580', 1), (110, 22, '¥19.9', 1), (196, 34, '1,024 MB', 1), (60, 170, '身高 1.7x', 0), (196, 170, '手机号', 0)]:
            o.append(f'<text x="{x}" y="{y}" class="sk-t" fill="{g if ok else red}">{"✓" if ok else "✗"} {t}</text>')
    elif kind == 'end':
        o.append(f'<circle cx="160" cy="210" r="140" fill="var(--sk-sea)" stroke="{dim}"/>')
        import random
        random.seed(7)
        for i in range(40):
            a = random.random() * math.pi; r = random.random() * 130
            x = 160 + math.cos(a) * r; y = 210 - math.sin(a) * r
            if y < 178:
                o.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="2" fill="{g if i%3==0 else ink}" opacity="{1 if i%3==0 else .4}"/>')
        o.append(f'<text x="160" y="44" text-anchor="middle" class="sk-title" style="font-size:20px">《第一位数字》</text><text x="160" y="64" text-anchor="middle" class="sk-t">随手打一个四位数，第一位是几？</text>')
    return f'<svg viewBox="0 0 320 180" role="img" aria-label="分镜示意"><rect width="320" height="180" fill="var(--sk-bg)"/>{"".join(o)}</svg>'

# ---------------------------------------------------------------- timeline
def timeline():
    w = 1000; h = 120
    pts = ' '.join(f'{t / DUR * w:.1f},{h - 14 - v * (h - 34):.1f}' for t, v in enumerate(D['energy']))
    o = [f'<svg viewBox="0 0 {w} {h + 60}" class="tl" role="img" aria-label="音乐能量与分场">']
    marks = [(0, 'intro'), (b(32), 'drop 1'), (49.17, 'break'), (65.45, 'build'), (82.24, 'drop 2'), (162.11, 'outro')]
    o.append(f'<polyline points="0,{h-14} {pts} {w},{h-14}" fill="var(--energy)" stroke="var(--energy-line)" stroke-width="1.2"/>')
    for t, lab in marks:
        x = t / DUR * w
        o.append(f'<line x1="{x:.1f}" y1="6" x2="{x:.1f}" y2="{h-14}" stroke="var(--rule)" stroke-dasharray="3 3"/><text x="{x+4:.1f}" y="16" class="tl-m">{lab}</text>')
    for i, s in enumerate(S):
        x0 = b(s['a']) / DUR * w if s['a'] else 0; x1 = b(s['z']) / DUR * w if s['z'] < 322 else w
        cls = 'tl-b' if i % 2 == 0 else 'tl-b alt'
        o.append(f'<a href="#{s["id"]}"><rect x="{x0:.1f}" y="{h-6}" width="{x1-x0-1.5:.1f}" height="26" rx="3" class="{cls}"/><text x="{(x0+x1)/2:.1f}" y="{h+11}" text-anchor="middle" class="tl-id">{s["id"]}</text></a>')
    for t in range(0, 165, 20):
        o.append(f'<text x="{t / DUR * w:.1f}" y="{h + 44}" class="tl-s">{t}s</text>')
    o.append('</svg>')
    return ''.join(o)

# ---------------------------------------------------------------- data chart (real)
def chart():
    cnt = D['digits']; n = D['n']
    w, h, pad = 560, 260, 40
    bw = (w - pad * 2) / 9
    o = [f'<svg viewBox="0 0 {w} {h}" class="chart" role="img" aria-label="215个国家和地区人口的首位数字分布与本福特定律对比">']
    for p in (0, 10, 20, 30):
        y = h - 40 - p / 34 * (h - 70)
        o.append(f'<line x1="{pad}" y1="{y:.1f}" x2="{w-10}" y2="{y:.1f}" stroke="var(--rule)"/><text x="{pad-6}" y="{y+4:.1f}" text-anchor="end" class="ax">{p}%</text>')
    bp = []
    for d in range(9):
        share = cnt[d] / n * 100; ben = math.log10(1 + 1 / (d + 1)) * 100
        x = pad + d * bw + 6
        y = h - 40 - share / 34 * (h - 70)
        o.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw-12:.1f}" height="{h-40-y:.1f}" fill="{"var(--gold)" if d==0 else "var(--bar)"}"/>')
        o.append(f'<text x="{x + (bw-12)/2:.1f}" y="{y-6:.1f}" text-anchor="middle" class="val">{cnt[d]}</text>')
        o.append(f'<text x="{x + (bw-12)/2:.1f}" y="{h-20}" text-anchor="middle" class="ax">{d+1}</text>')
        bp.append(f'{x + (bw-12)/2:.1f},{h - 40 - ben / 34 * (h - 70):.1f}')
    o.append(f'<polyline points="{" ".join(bp)}" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="5 4"/>')
    for p in bp:
        x, y = p.split(',')
        o.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="var(--bg)" stroke="var(--ink)" stroke-width="2"/>')
    o.append('</svg>')
    return ''.join(o)

# ---------------------------------------------------------------- page
FACTS = [
 ('215 个国家和地区的人口（2025）中，65 个以 1 开头（30.2%），9 个以 9 开头（4.2%）', '世界银行人口数据（GitHub datasets/population），用 Python 逐个计数', 'https://github.com/datasets/population'),
 ('本福特分布：P(d) = log₁₀(1 + 1/d)，1 为 30.1%，9 为 4.6%', 'Wikipedia: Benford\'s law', 'https://en.wikipedia.org/wiki/Benford%27s_law'),
 ('纽康 1881 年发现对数表前几页磨损最重，发表于 American Journal of Mathematics 第 4 卷', 'Wikipedia: Benford\'s law', 'https://en.wikipedia.org/wiki/Benford%27s_law'),
 ('本福特 1938 年统计 20 类、20,229 个数，含 335 条河流面积、3,259 个美国人口数、104 个物理常数', 'Wikipedia: Benford\'s law', 'https://en.wikipedia.org/wiki/Benford%27s_law'),
 ('纽康 1835–1909；本福特 1883–1948', 'Random Services 人物小传', 'https://randomservices.org/random/biographies/Newcomb.html'),
 ('每年涨 10%：1,000→2,000 需 7.27 年，9,000→10,000 需 1.11 年', '计算：ln2/ln1.1，ln(10/9)/ln1.1', ''),
 ('1993 年 State of Arizona v. Wayne James Nelson：州财政部门经理，23 张支票，近 200 万美元；九成以上以 7、8、9 开头，多数刚好低于 10 万美元', 'Nigrini, Journal of Accountancy (1999)', 'https://www.journalofaccountancy.com/issues/1999/may/nigrini.html'),
 ('Rauch 等 2011：希腊上报欧盟的数据离本福特分布最远（2000 年尤甚）；罗马尼亚、拉脱维亚、比利时也异常', 'Tim Harford (2011)；German Economic Review 12(3)', 'https://timharford.com/2011/09/look-out-for-no-1/'),
]
ASSETS = [('夜间地球 / 地球仪', 'S0、S9', 'Sketchfab CC-BY'), ('旧书（对数表）', '标题出场、S2', 'Sketchfab CC-BY'), ('油灯、木书桌', 'S2', 'Sketchfab CC-BY'), ('档案抽屉柜', 'S3', 'Sketchfab CC-BY'), ('90 年代 CRT 电脑、针式打印机', 'S6', 'Sketchfab CC-BY'), ('欧洲国界', 'S7', 'Natural Earth（公有领域）'), ('木纹、纸张贴图', '全片', 'Poly Haven CC0')]
QUESTIONS = [
   '3D 模型已下载：地球改为自建（three.js 贴图，MIT），旧书 / 书桌 / 墨水瓶 / 油灯 / 档案柜 / 90 年代办公室来自 Sketchfab（CC-BY）。',
]

def scene_card(s):
    t0 = b(s['a']) if s['a'] else 0; t1 = b(s['z']) if s['z'] < 322 else DUR
    chips = ''.join(f'<span class="chip c-{ {"3D":"a","数据":"b","2D":"c","地图":"d","人物卡":"e"}[t] }">{t}</span>' for t in s['tools'])
    rows = ''.join(f'<tr><td class="bt">b{a}–b{z}</td><td class="tm">{b(a):.1f}s</td><td>{rich(l)}</td></tr>' for a, z, l in s['lines'])
    lines = f'<table class="lines"><tbody>{rows}</tbody></table>' if rows else '<p class="nolines">无字幕：标题卡本身。</p>'
    return f'''<article class="scene" id="{s['id']}">
  <div class="kf">{sk(s['sketch'])}</div>
  <div class="body">
    <header><span class="sid">{s['id']}</span><h3>{html.escape(s['name'])}</h3></header>
    <p class="when"><span class="mono">b{s['a']}–b{s['z']} · {tc(t0)}–{tc(t1)} · {t1-t0:.1f}s</span><span class="sec">{html.escape(s['sec'])}</span></p>
    <div class="chips">{chips}</div>
    <dl><dt>镜头</dt><dd>{html.escape(s['cam'])}</dd><dt>转场</dt><dd>{html.escape(s['trans'])}</dd></dl>
    {lines}
  </div>
</article>'''

facts = ''.join(f'<tr><td>{html.escape(f)}</td><td>{f"<a href=\"{u}\">{html.escape(src)}</a>" if u else html.escape(src)}</td></tr>' for f, src, u in FACTS)
assets = ''.join(f'<tr><td>{a}</td><td>{w}</td><td>{l}</td></tr>' for a, w, l in ASSETS)
qs = ''.join(f'<li>{html.escape(q)}</li>' for q in QUESTIONS)

page = f'''<title>第一位数字 · 分镜</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;900&family=Noto+Sans+SC:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* layout: a film storyboard — header + music timeline, the real-data hook, then one row per scene (keyframe left, notes right) */
:root {{
  --bg: #0e0f14; --panel: #16171f; --ink: #ece6d8; --dim: #9b968b; --rule: #2b2c36;
  --gold: #f6cf78; --red: #ef6a5e; --bar: #6e6a63;
  --energy: rgba(246,207,120,.12); --energy-line: rgba(246,207,120,.55);
  --sk-bg: #0a0b10; --sk-ink: #e9e2d2; --sk-dim: #5d5a56; --sk-sea: #18203a; --sk-land: #2a3552; --sk-wood: #3a2616;
  --serif: "Noto Serif SC", "Songti SC", serif; --sans: "Noto Sans SC", "PingFang SC", system-ui, sans-serif; --mono: "JetBrains Mono", ui-monospace, monospace;
  color-scheme: dark;
}}
* {{ box-sizing: border-box }}
body {{ background: var(--bg); color: var(--ink); font-family: var(--sans); font-size: 15px; line-height: 1.65; padding: 0 20px }}
.wrap {{ max-width: 1120px; margin: 0 auto; padding-block: 40px 80px; display: grid; gap: 44px }}
h1 {{ font-family: var(--serif); font-weight: 900; font-size: clamp(30px, 5vw, 48px); margin: 0; letter-spacing: .02em; text-wrap: balance }}
h1 .q {{ color: var(--gold) }}
h2 {{ font-family: var(--serif); font-weight: 600; font-size: 22px; margin: 0 0 14px }}
.kicker {{ font-family: var(--mono); font-size: 12px; letter-spacing: .14em; color: var(--dim); text-transform: uppercase }}
.lede {{ color: var(--dim); max-width: 62ch; margin: 10px 0 0 }}
.meta {{ display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 16px; font-family: var(--mono); font-size: 13px; color: var(--dim) }}
.meta b {{ color: var(--ink); font-weight: 600 }}
.tlwrap {{ overflow-x: auto }}
.tl {{ width: 100%; min-width: 640px; display: block }}
.tl-m {{ font: 600 11px var(--mono); fill: var(--dim) }}
.tl-s {{ font: 11px var(--mono); fill: var(--dim) }}
.tl-b {{ fill: #2a2b36 }} .tl-b.alt {{ fill: #353644 }}
a:hover .tl-b, a:focus .tl-b {{ fill: #4a4733 }}
.tl-id {{ font: 600 11px var(--mono); fill: var(--ink) }}
.hook {{ display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 28px; align-items: center; background: var(--panel); border-radius: 14px; padding: 26px }}
.chart {{ width: 100%; height: auto; display: block }}
.chart .ax {{ font: 12px var(--mono); fill: var(--dim) }} .chart .val {{ font: 600 13px var(--mono); fill: var(--ink) }}
.big {{ font-family: var(--serif); font-weight: 900; font-size: clamp(36px, 6vw, 60px); line-height: 1.1 }}
.big .g {{ color: var(--gold) }}
.legend {{ font-size: 13px; color: var(--dim); display: flex; gap: 18px; flex-wrap: wrap; margin-top: 10px }}
.legend i {{ display: inline-block; width: 18px; height: 0; border-top: 2px dashed var(--ink); vertical-align: middle; margin-right: 6px }}
.legend s {{ display: inline-block; width: 12px; height: 12px; background: var(--gold); vertical-align: -1px; margin-right: 6px; text-decoration: none }}
.scenes {{ display: grid; gap: 26px }}
.scene {{ display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 26px; padding-top: 26px; border-top: 1px solid var(--rule); scroll-margin-top: 16px }}
.kf svg {{ width: 100%; height: auto; display: block; border-radius: 8px; border: 1px solid var(--rule) }}
.sk-t {{ font: 9.5px var(--sans); fill: var(--sk-ink) }}
.sk-big {{ font: 900 22px var(--serif) }}
.sk-title {{ font: 900 26px var(--serif); fill: var(--gold) }}
.scene header {{ display: flex; align-items: baseline; gap: 12px }}
.sid {{ font: 600 13px var(--mono); color: var(--gold); border: 1px solid var(--gold); border-radius: 4px; padding: 0 6px }}
.scene h3 {{ font-family: var(--serif); font-weight: 600; font-size: 20px; margin: 0; text-wrap: balance }}
.when {{ display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 6px 0 10px; font-size: 13px; color: var(--dim) }}
.mono {{ font-family: var(--mono); font-variant-numeric: tabular-nums }}
.chips {{ display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px }}
.chip {{ font-size: 12px; padding: 1px 9px; border-radius: 999px; border: 1px solid currentColor }}
.c-a {{ color: #8fb3ff }} .c-b {{ color: var(--gold) }} .c-c {{ color: #b9e0a5 }} .c-d {{ color: #e8a6d8 }} .c-e {{ color: #d9c9a4 }}
dl {{ display: grid; grid-template-columns: 3em minmax(0, 1fr); gap: 4px 10px; margin: 0 0 12px }}
dt {{ color: var(--dim); font-size: 13px; padding-top: 2px }} dd {{ margin: 0 }}
table {{ border-collapse: collapse; width: 100% }}
.lines td {{ padding: 5px 8px 5px 0; border-top: 1px solid var(--rule); vertical-align: top }}
.lines .bt, .lines .tm {{ font: 12px var(--mono); color: var(--dim); white-space: nowrap; padding-top: 7px }}
.lines td:last-child {{ font-family: var(--serif); font-size: 16px }}
b.g {{ color: var(--gold); font-weight: 700 }} b.r {{ color: var(--red); font-weight: 700 }}
.nolines {{ color: var(--dim); margin: 0 }}
.tbl {{ overflow-x: auto }}
.tbl table td, .tbl table th {{ padding: 9px 12px 9px 0; border-top: 1px solid var(--rule); text-align: left; vertical-align: top; font-size: 14px }}
.tbl th {{ font-weight: 500; color: var(--dim); font-size: 13px }}
a {{ color: var(--gold) }} a:focus-visible {{ outline: 2px solid var(--gold); outline-offset: 2px }}
.two {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 36px }}
ol.q {{ margin: 0; padding-left: 1.3em; display: grid; gap: 8px }}
.rules {{ display: flex; flex-wrap: wrap; gap: 8px }}
.rules span {{ font-size: 13px; padding: 3px 10px; border-radius: 6px; background: var(--panel); color: var(--dim) }}
@media (max-width: 760px) {{
  .hook, .scene {{ grid-template-columns: minmax(0, 1fr) }}
  .lines .tm {{ display: none }}
}}
</style>
<div class="wrap">
<header>
  <div class="kicker">VIBE知识大赏 · Video engine V1 · 分镜 v1</div>
  <h1>《第一位数字》<span class="q">为什么1开头的数最多？</span></h1>
  <p class="lede">一个反直觉的规律，用五个不同年代、不同尺度的场景讲：一组真实数据开场，1881 年的对数表，1938 年的两万个数，一个小镇的增长，1993 年的假支票，2011 年的欧盟数据，最后回到开头那颗地球。所有时间都写在节拍上（b = 拍号）。</p>
  <div class="meta"><span>时长 <b>2:44</b></span><span>节拍 <b>118 BPM · 323 拍</b></span><span>标题落在第一个 drop <b>b32 · 16.6s</b></span><span>静默 <b>b96–b128</b></span><span>第二个 drop <b>b161 · 82.2s</b></span><span>片尾卡 <b>最后 6 秒</b></span></div>
</header>

<section aria-label="音乐与分场">
  <h2>音乐能量与分场</h2>
  <div class="tlwrap">{timeline()}</div>
</section>

<section class="hook" aria-label="开场悖论">
  <div>{chart()}
    <div class="legend"><span><s></s>215 个国家和地区，按人口首位数字计数（世界银行 2025）</span><span><i></i>本福特定律预测</span></div>
  </div>
  <div>
    <div class="kicker">开场用的真实数据</div>
    <p class="big"><span class="g">65</span> 个以 1 开头<br>只有 <span class="g">9</span> 个以 9 开头</p>
    <p class="lede">1 开头占 30.2%，本福特定律预测 30.1%；9 开头占 4.2%，预测 4.6%。这组数据在开场以悖论出现，在第二个 drop 上飞回来，叠在本福特阶梯上。</p>
  </div>
</section>

<section aria-label="分场">
  <h2>分场</h2>
  <div class="scenes">{''.join(scene_card(s) for s in S)}</div>
</section>

<section class="two" aria-label="事实与素材">
  <div>
    <h2>事实核对</h2>
    <div class="tbl"><table><thead><tr><th>画面上的说法</th><th>出处</th></tr></thead><tbody>{facts}</tbody></table></div>
  </div>
  <div style="display:grid;gap:36px;align-content:start">
    <div>
      <h2>要下载的素材</h2>
      <div class="tbl"><table><thead><tr><th>模型</th><th>用在</th><th>许可</th></tr></thead><tbody>{assets}</tbody></table></div>
    </div>
    <div>
      <h2>这一版的规矩</h2>
      <div class="rules"><span>只用音乐，无音效</span><span>无 AI 生成视频</span><span>不写"Juno 出品"</span><span>人物只以头像卡或静坐出现</span><span>连续动作不踩拍</span><span>一次只看一处</span><span>字幕区下方 260px 留空</span></div>
    </div>
    <div>
      <h2>进度</h2>
      <ol class="q">{qs}</ol>
    </div>
  </div>
</section>
</div>
'''
open('/tmp/claude-0/-home-claude-video/1d140deb-710b-5fc8-9456-90915ad0b154/scratchpad/sb/storyboard.html', 'w').write(page)
print('ok', len(page))
