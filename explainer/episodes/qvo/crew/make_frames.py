#!/usr/bin/env python3
"""ep12 look proposals: writes 6 self-contained 1920x1080 HTML style frames next to this script.
Render: python3 /home/claude/video/.claude/skills/production-crew/scripts/render_html.py style/*.html"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent
W, H = 1920, 1080

def wave(x0, x1, yc, amp_fn, k, phase=0.0, n=600):
    pts = []
    for i in range(n + 1):
        u = i / n
        x = x0 + (x1 - x0) * u
        y = yc - amp_fn(u) * math.sin(k * 2 * math.pi * u + phase)
        pts.append(f"{x:.1f},{y:.1f}")
    return "M" + " L".join(pts)

# ---------- shared engine layer: subtitle band + corner mark ----------
def shell(body, css, bg, sub, mark_color="#FFFFFF", label="", label_color="#FFFFFF"):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:{bg}}}
.stage{{position:absolute;inset:0;width:{W}px;height:{H}px;overflow:hidden}}
.mark{{position:absolute;top:40px;right:56px;font:500 24px 'Noto Sans CJK SC',sans-serif;color:{mark_color};opacity:.55;letter-spacing:1px}}
.chap{{position:absolute;top:44px;left:64px;font:500 22px 'DejaVu Sans Mono','Noto Sans CJK SC',monospace;color:{label_color};letter-spacing:2px;opacity:.85}}
.sub{{position:absolute;left:0;top:820px;width:{W}px;height:140px;display:flex;align-items:center;justify-content:center}}
.sub .band{{position:absolute;left:260px;right:260px;top:18px;bottom:18px;background:rgba(6,7,9,.62);filter:blur(14px);border-radius:60px}}
.sub .tx{{position:relative;font:700 46px 'Noto Serif CJK SC',serif;color:#fff;letter-spacing:2px;text-shadow:0 2px 10px rgba(0,0,0,.65)}}
{css}
</style></head><body><div class="stage">
{body}
{f'<div class="chap">{label}</div>' if label else ''}
<div class="mark">◆ Juno · VIBE知识大赏</div>
<div class="sub"><div class="band"></div><div class="tx">{sub}</div></div>
</div></body></html>"""

# ======================= LOOK A: 示波器 Phosphor Scope =======================
A_BG = "#020604"
A_CSS = """
.scr{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,#07140d 0%,#030a06 60%,#010302 100%)}
.mono{font-family:'DejaVu Sans Mono',monospace}
.lbl{position:absolute;font:500 26px 'DejaVu Sans Mono','Noto Sans CJK SC',monospace;color:#7DFFB3;letter-spacing:2px}
.big{position:absolute;font:700 76px 'DejaVu Sans Mono',monospace;color:#F4FFF8;letter-spacing:0;text-shadow:0 0 18px rgba(180,255,215,.35)}
.status{position:absolute;top:44px;left:520px;font:500 21px 'DejaVu Sans Mono','Noto Sans CJK SC',monospace;color:#5FD99A;letter-spacing:1.5px;opacity:.85}
.status b{color:#F4FFF8;font-weight:700}
"""

def graticule(x0, y0, x1, y1, nx=10, ny=8, col="#1C3D2C"):
    s = []
    dx, dy = (x1 - x0) / nx, (y1 - y0) / ny
    for i in range(nx + 1):
        x = x0 + i * dx
        s.append(f'<line x1="{x:.1f}" y1="{y0}" x2="{x:.1f}" y2="{y1}" stroke="{col}" stroke-width="1.5" stroke-dasharray="2 7"/>')
    for j in range(ny + 1):
        y = y0 + j * dy
        s.append(f'<line x1="{x0}" y1="{y:.1f}" x2="{x1}" y2="{y:.1f}" stroke="{col}" stroke-width="1.5" stroke-dasharray="2 7"/>')
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s.append(f'<line x1="{x0}" y1="{cy}" x2="{x1}" y2="{cy}" stroke="{col}" stroke-width="2"/>')
    s.append(f'<line x1="{cx}" y1="{y0}" x2="{cx}" y2="{y1}" stroke="{col}" stroke-width="2"/>')
    for i in range(nx * 5 + 1):
        x = x0 + i * dx / 5
        s.append(f'<line x1="{x:.1f}" y1="{cy-7}" x2="{x:.1f}" y2="{cy+7}" stroke="{col}" stroke-width="2"/>')
    for j in range(ny * 5 + 1):
        y = y0 + j * dy / 5
        s.append(f'<line x1="{cx-7}" y1="{y:.1f}" x2="{cx+7}" y2="{y:.1f}" stroke="{col}" stroke-width="2"/>')
    s.append(f'<rect x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}" fill="none" stroke="#2A5A40" stroke-width="2.5"/>')
    return "\n".join(s)

def glow_path(d, col, w, glow=True, op=1):
    g = f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w*4}" opacity="{0.18*op}" filter="url(#bl)"/>' if glow else ""
    return g + f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" opacity="{op}" stroke-linejoin="round"/>'

def lookA_hook():
    # background trace: a decaying burst through the middle (the "measurement" pulse)
    d = wave(60, 1860, 715, lambda u: 85 * math.exp(-((u - 0.78) / 0.16) ** 2) + 5, 16)
    d2 = wave(60, 1860, 715, lambda u: 45 * math.exp(-((u - 0.78) / 0.22) ** 2) + 3, 16, phase=1.1)
    svg = f"""<svg class="stage" width="{W}" height="{H}"><defs><filter id="bl"><feGaussianBlur stdDeviation="6"/></filter></defs>
{graticule(60, 100, 1860, 1000)}
{glow_path(d2, '#3E9D6C', 2, op=.45)}
{glow_path(d, '#7DFFB3', 3, op=.7)}
<line x1="1460" y1="100" x2="1460" y2="1000" stroke="#FF3B30" stroke-width="2" stroke-dasharray="10 8" opacity=".8"/>
<polygon points="1448,100 1472,100 1460,116" fill="#FF3B30"/>
</svg>"""
    num = "10,000,000,000,000,000,000,000,000"
    body = f"""<div class="scr"></div>{svg}
<div class="status">CH1 <b>经典超级计算机</b> &nbsp;·&nbsp; CH2 <b>Willow 105 qubits</b> &nbsp;·&nbsp; T = 0.010 K</div>
<div class="lbl" style="left:150px;top:205px">CH1 ▸ 经典超算 · 需要</div>
<div class="big" style="left:150px;top:248px">{num}<span style="font-family:'Noto Sans CJK SC';font-weight:900;margin-left:14px">年</span></div>
<div class="lbl" style="left:150px;top:420px;color:#FF6B5F">CH2 ▸ 量子芯片 Willow · 实测</div>
<div style="position:absolute;left:142px;top:445px;font:700 210px/1 'DejaVu Sans Mono',monospace;color:#FF3B30;text-shadow:0 0 30px rgba(255,59,48,.45)">&lt;5<span style="font:900 150px 'Noto Sans CJK SC';margin-left:22px">分钟</span></div>
<div class="lbl" style="left:1480px;top:120px;font-size:22px;color:#FF6B5F;opacity:.9">CH2 输出 · t &lt; 5 min</div>
"""
    return shell(body, A_CSS, A_BG, "超级计算机要算 10<span style='font-size:.6em;vertical-align:.8em;margin-left:2px'>25</span> 年的题，它不到 5 分钟", label="00 · WILLOW", label_color="#7DFFB3")

def lookA_key():
    x0, x1 = 300, 1480
    top, lane = 120, 84
    names = ["000", "001", "010", "011", "100", "101", "110", "111"]
    right = 5
    parts = []
    reads = []
    for i, nm in enumerate(names):
        yc = top + lane * i + lane / 2
        if i == right:
            d = wave(x0, x1, yc, lambda u: 22 + 58 * (u ** 1.6), 9)
            parts.append(glow_path(d, '#FF3B30', 4))
            parts.append(f'<path d="{d}" fill="none" stroke="#FFE3E0" stroke-width="1.3" opacity=".9"/>')
        else:
            dec = 0.42 + 0.05 * (i % 3)
            amp = lambda u, dec=dec: 22 * max(0.0, 1 - u / dec) ** 1.4 + 0.8
            # the two paths that cancel (ghosts) on the left part
            g1 = wave(x0, x0 + (x1 - x0) * dec, yc, lambda u: 22, 9 * dec, n=200)
            g2 = wave(x0, x0 + (x1 - x0) * dec, yc, lambda u: 22, 9 * dec, phase=math.pi, n=200)
            parts.append(f'<path d="{g1}" fill="none" stroke="#3E9D6C" stroke-width="1.4" opacity=".35"/>')
            parts.append(f'<path d="{g2}" fill="none" stroke="#3E9D6C" stroke-width="1.4" opacity=".35" stroke-dasharray="5 5"/>')
            d = wave(x0, x1, yc, amp, 9)
            parts.append(glow_path(d, '#7DFFB3', 2.6, op=.85))
        col = "#FF6B5F" if i == right else "#7DFFB3"
        op = 1 if i == right else .7
        parts.append(f'<text x="{x0-30}" y="{yc+11}" text-anchor="end" font-family="DejaVu Sans Mono" font-size="30" font-weight="700" fill="{col}" opacity="{op}">|{nm}⟩</text>')
        pct = "94.1%" if i == right else ["0.9%", "0.7%", "1.0%", "0.8%", "0.6%", "", "0.9%", "1.0%"][i]
        if i == right:
            reads.append(f'<div style="position:absolute;left:1530px;top:{yc-44}px;font:700 84px/1 DejaVu Sans Mono;color:#F4FFF8;text-shadow:0 0 22px rgba(255,80,70,.6)">{pct}</div>')
            reads.append(f'<div style="position:absolute;left:1536px;top:{yc+38}px;font:700 21px Noto Sans CJK SC;color:#FF6B5F;letter-spacing:3px">▲ 互相加强</div>')
        else:
            reads.append(f'<div style="position:absolute;left:1530px;top:{yc-14}px;font:500 26px/1 DejaVu Sans Mono;color:#5FD99A;opacity:.65">{pct}</div>')
    # cancellation callout on lane |011>
    yc3 = top + lane * 3 + lane / 2
    xc = x0 + (x1 - x0) * 0.42
    svg = f"""<svg class="stage" width="{W}" height="{H}"><defs><filter id="bl"><feGaussianBlur stdDeviation="5"/></filter></defs>
{graticule(60, 100, 1860, 820, 10, 8, '#173323')}
{''.join(parts)}
<line x1="{xc+150:.0f}" y1="{yc3:.0f}" x2="{xc+225:.0f}" y2="{yc3-56:.0f}" stroke="#F4FFF8" stroke-width="1.5"/>
</svg>"""
    body = f"""<div class="scr"></div>{svg}
<div class="status">MATH <b>Σ 振幅</b> &nbsp;·&nbsp; 3 qubits · 8 个答案 &nbsp;·&nbsp; 干涉 <b>INTERFERENCE</b></div>
<div style="position:absolute;left:{xc+232:.0f}px;top:{yc3-92:.0f}px;font:700 26px 'Noto Sans CJK SC';color:#F4FFF8;letter-spacing:2px;background:#04100a;padding:2px 10px">波峰 + 波谷 = 0</div>
{''.join(reads)}
"""
    return shell(body, A_CSS, A_BG, "错的答案，波峰撞上波谷，互相抵消", label="05 · 干涉", label_color="#7DFFB3")

# ======================= LOOK B: 工程手稿 Drafting Plate =======================
B_BG = "#F1ECE0"
B_CSS = """
.paper{position:absolute;inset:0;
 background-color:#F1ECE0;
 background-image:linear-gradient(#D2C8B2 1.4px,transparent 1.4px),linear-gradient(90deg,#D2C8B2 1.4px,transparent 1.4px),
 linear-gradient(#E3DCCB 1px,transparent 1px),linear-gradient(90deg,#E3DCCB 1px,transparent 1px);
 background-size:120px 120px,120px 120px,24px 24px,24px 24px;background-position:-2px -2px}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(255,252,244,0) 55%,rgba(120,100,70,.18) 100%)}
.an{position:absolute;font:500 26px 'Noto Sans CJK SC',sans-serif;color:#1C1B19;letter-spacing:1px}
.dim{font-family:'DejaVu Sans Mono',monospace}
.ttl{position:absolute;font:700 40px 'Noto Serif CJK SC',serif;color:#1C1B19;letter-spacing:3px}
"""
INK, RED, BLU = "#1C1B19", "#D0342C", "#2F6DB5"
B_SUB = ".sub .band{background:rgba(28,27,25,.86);filter:blur(10px)}"

def coin_flat(cx, cy, r, digit):
    return f"""<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F7F3EA" stroke="{INK}" stroke-width="4"/>
<circle cx="{cx}" cy="{cy}" r="{r-14}" fill="none" stroke="{INK}" stroke-width="1.5"/>
<text x="{cx}" y="{cy+r*0.36}" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="700" font-size="{r*1.05:.0f}" fill="{INK}">{digit}</text>"""

def lookB_hook():
    cx, cy, R = 1220, 460, 270
    ghosts = []
    for k, a in enumerate([80, 62, 44, 26, 10]):
        rx = R * math.cos(math.radians(a))
        ghosts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx:.1f}" ry="{R}" fill="none" stroke="{BLU}" stroke-width="1.6" stroke-dasharray="{"8 6" if k%2 else "none"}" opacity="{0.25+0.1*k:.2f}"/>')
    rx = R * math.cos(math.radians(68))  # main coin, seen nearly edge-on
    th = 26
    main = f"""<path d="M{cx},{cy-R} A{rx:.1f},{R} 0 0 1 {cx},{cy+R} L{cx+th},{cy+R} A{rx:.1f},{R} 0 0 0 {cx+th},{cy-R} Z" fill="#D9D0BC" stroke="{INK}" stroke-width="4"/>
<ellipse cx="{cx}" cy="{cy}" rx="{rx:.1f}" ry="{R}" fill="#F7F3EA" stroke="{INK}" stroke-width="5"/>
<ellipse cx="{cx}" cy="{cy}" rx="{rx-8:.1f}" ry="{R-16}" fill="none" stroke="{INK}" stroke-width="1.5"/>
<g transform="translate({cx},{cy}) scale({rx/R:.3f},1)"><text x="0" y="70" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="700" font-size="220" fill="{INK}" opacity=".85">1</text></g>"""
    # rotation arrow (red pencil): ellipse arc around the axis at the top
    arr = f"""<path d="M{cx-200},{cy-R-40} A200,46 0 1 0 {cx+190},{cy-R-58}" fill="none" stroke="{RED}" stroke-width="7" stroke-linecap="round"/>
<polygon points="{cx+222},{cy-R-62} {cx+176},{cy-R-84} {cx+182},{cy-R-36}" fill="{RED}"/>
<line x1="{cx}" y1="{cy-R-110}" x2="{cx}" y2="{cy+R+40}" stroke="{INK}" stroke-width="1.6" stroke-dasharray="26 7 4 7"/>"""
    # dimension line for the diameter
    dimx = cx + 400
    dim = f"""<line x1="{cx+40}" y1="{cy-R}" x2="{dimx+20}" y2="{cy-R}" stroke="{INK}" stroke-width="1.2"/>
<line x1="{cx+40}" y1="{cy+R}" x2="{dimx+20}" y2="{cy+R}" stroke="{INK}" stroke-width="1.2"/>
<line x1="{dimx}" y1="{cy-R+4}" x2="{dimx}" y2="{cy+R-4}" stroke="{INK}" stroke-width="1.6" marker-start="url(#ah)" marker-end="url(#ah)"/>
<text x="{dimx+16}" y="{cy+8}" font-family="DejaVu Sans Mono" font-size="24" fill="{INK}" transform="rotate(90 {dimx+16} {cy+8})" text-anchor="middle" dy="-6">α|0⟩ + β|1⟩</text>"""
    left = f"""{coin_flat(300, 300, 120, '0')}{coin_flat(300, 590, 120, '1')}
<text x="460" y="455" font-family="Noto Serif CJK SC" font-weight="700" font-size="54" fill="{INK}">或</text>
<path d="M560,445 C680,445 740,445 860,445" fill="none" stroke="{INK}" stroke-width="4" marker-end="url(#ahb)"/>"""
    svg = f"""<svg class="stage" width="{W}" height="{H}"><defs>
<marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="{INK}"/></marker>
<marker id="ahb" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{INK}"/></marker></defs>
{''.join(ghosts)}{main}{arr}{dim}{left}
<line x1="{cx-110}" y1="{cy+120}" x2="{cx-165}" y2="{cy+196}" stroke="{RED}" stroke-width="2.5"/>
<circle cx="{cx-110}" cy="{cy+120}" r="6" fill="{RED}"/>
</svg>"""
    body = f"""<div class="paper"></div><div class="vig"></div>{svg}
<div class="an" style="left:190px;top:740px;font-size:28px">比特：<b>要么 0，要么 1</b></div>
<div class="an" style="left:700px;top:668px;color:{RED};font-weight:700;font-size:30px">量子比特：旋转中（示意）</div>
<div class="an" style="left:700px;top:712px;font-size:24px;color:#5A544A">既不是 0 也不是 1 — 叠加</div>
"""
    return shell(body, B_CSS + B_SUB, B_BG, "量子计算机的秘密，藏在一枚旋转的硬币里", mark_color=INK, label="图 1 · 比特与量子比特", label_color=INK)

def lookB_key():
    # wave equation rows
    pw, ph = 260, 170
    xs = [300, 640, 980]  # panel x for path1, path2, sum
    rows = [(150, "错的答案", "波峰 + 波谷", math.pi, "= 0"), (420, "对的答案", "波峰 + 波峰", 0.0, "× 2")]
    s = []
    for (y, name, subn, ph2, res) in rows:
        yc = y + ph / 2
        s.append(f'<text x="70" y="{yc-4}" font-family="Noto Serif CJK SC" font-weight="700" font-size="40" fill="{INK}">{name}</text>')
        s.append(f'<text x="70" y="{yc+38}" font-family="Noto Sans CJK SC" font-size="24" fill="#5A544A">{subn}</text>')
        for j, x in enumerate(xs):
            s.append(f'<rect x="{x}" y="{y}" width="{pw}" height="{ph}" fill="#F7F3EA" stroke="{INK}" stroke-width="1.5"/>')
            s.append(f'<line x1="{x}" y1="{yc}" x2="{x+pw}" y2="{yc}" stroke="{INK}" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>')
            if j == 0:
                s.append(f'<path d="{wave(x+10, x+pw-10, yc, lambda u: 48, 2)}" fill="none" stroke="{INK}" stroke-width="4"/>')
                s.append(f'<text x="{x+8}" y="{y-10}" font-family="DejaVu Sans Mono" font-size="20" fill="#5A544A">路径 1</text>')
            elif j == 1:
                s.append(f'<path d="{wave(x+10, x+pw-10, yc, lambda u: 48, 2, phase=ph2)}" fill="none" stroke="{BLU}" stroke-width="4" stroke-dasharray="{"10 6" if ph2 else "none"}"/>')
                s.append(f'<text x="{x+8}" y="{y-10}" font-family="DejaVu Sans Mono" font-size="20" fill="#5A544A">路径 2</text>')
            else:
                if ph2:
                    s.append(f'<line x1="{x+10}" y1="{yc}" x2="{x+pw-10}" y2="{yc}" stroke="{RED}" stroke-width="7" stroke-linecap="round"/>')
                else:
                    s.append(f'<path d="{wave(x+10, x+pw-10, yc, lambda u: 78, 2)}" fill="none" stroke="{RED}" stroke-width="7"/>')
                s.append(f'<text x="{x+8}" y="{y-10}" font-family="DejaVu Sans Mono" font-size="20" fill="{RED}">相加</text>')
        s.append(f'<text x="{xs[0]+pw+40}" y="{yc+20}" text-anchor="middle" font-family="DejaVu Sans" font-size="60" fill="{INK}">+</text>')
        s.append(f'<text x="{xs[1]+pw+40}" y="{yc+20}" text-anchor="middle" font-family="DejaVu Sans" font-size="60" fill="{INK}">=</text>')
        s.append(f'<text x="{xs[2]+pw+22}" y="{yc+22}" font-family="Noto Serif CJK SC" font-weight="900" font-size="64" fill="{RED}">{res}</text>')
    # histogram plate
    hx, hy0, hy1 = 1490, 180, 690
    s.append(f'<text x="{hx}" y="{hy0-50}" font-family="Noto Sans CJK SC" font-weight="700" font-size="24" fill="{INK}">测量概率 · 8 个答案</text>')
    s.append(f'<line x1="{hx}" y1="{hy1}" x2="{hx+380}" y2="{hy1}" stroke="{INK}" stroke-width="3"/>')
    s.append(f'<line x1="{hx}" y1="{hy0}" x2="{hx}" y2="{hy1}" stroke="{INK}" stroke-width="2"/>')
    probs = [.01, .008, .01, .009, .007, .94, .009, .007]
    for i, p in enumerate(probs):
        bx = hx + 14 + i * 46
        hgt = max(6, p * (hy1 - hy0 - 30))
        col = RED if i == 5 else INK
        fill = "url(#hatchR)" if i == 5 else "url(#hatch)"
        s.append(f'<rect x="{bx}" y="{hy1-hgt}" width="34" height="{hgt}" fill="{fill}" stroke="{col}" stroke-width="{3 if i==5 else 2}"/>')
        s.append(f'<text x="{bx+17}" y="{hy1+30}" text-anchor="middle" font-family="DejaVu Sans Mono" font-size="17" fill="{col}">{i:03b}</text>')
    s.append(f'<text x="{hx+14+5*46+17}" y="{hy1-0.94*(hy1-hy0-30)-14:.0f}" text-anchor="middle" font-family="DejaVu Sans Mono" font-weight="700" font-size="34" fill="{RED}">94%</text>')
    svg = f"""<svg class="stage" width="{W}" height="{H}"><defs>
<pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="{INK}" stroke-width="2"/></pattern>
<pattern id="hatchR" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#F3D9D2"/><line x1="0" y1="0" x2="0" y2="9" stroke="{RED}" stroke-width="3"/></pattern></defs>
{''.join(s)}
<line x1="1440" y1="140" x2="1440" y2="720" stroke="{INK}" stroke-width="1.2" stroke-dasharray="26 7 4 7" opacity=".6"/>
</svg>"""
    body = f"""<div class="paper"></div><div class="vig"></div>{svg}
<div class="an dim" style="left:70px;top:680px;font-size:22px;color:#5A544A">注：振幅可正可负 → 两条路径相加时可以互相抵消</div>
"""
    return shell(body, B_CSS + B_SUB, B_BG, "错的答案，波峰撞上波谷，互相抵消", mark_color=INK, label="图 3 · 干涉", label_color=INK)

# ======================= LOOK C: 翻牌显示屏 Split-flap Board =======================
C_BG = "#0E0E0E"
C_CSS = """
.board{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#1b1b1b 0%,#0f0f0f 65%,#070707 100%)}
.t{position:relative;display:inline-block;vertical-align:top;background:linear-gradient(#2a2a2a,#202020 49.4%,#050505 49.4%,#050505 50.8%,#1c1c1c 50.8%,#151515);
 border-radius:6px;color:#F5F1E6;text-align:center;box-shadow:0 3px 0 #000,inset 0 1px 0 rgba(255,255,255,.06);font-family:'DejaVu Sans Mono',monospace;font-weight:700}
.t.cn{font-family:'Noto Sans CJK SC',sans-serif;font-weight:900}
.t::before,.t::after{content:'';position:absolute;top:calc(50% - 5px);width:4px;height:10px;background:#333;border-radius:1px}
.t::before{left:-1px}.t::after{right:-1px}
.hdr{position:absolute;font:700 24px 'DejaVu Sans Mono','Noto Sans CJK SC',monospace;color:#FFB81C;letter-spacing:3px}
.lamp{display:inline-block;width:16px;height:16px;border-radius:50%;margin-right:12px;vertical-align:middle}
"""

def tiles(text, w, h, fs, gap=4, col="#F5F1E6", cls="", bg=None):
    out = []
    for ch in text:
        if ch == " ":
            out.append(f'<span style="display:inline-block;width:{w*0.45:.0f}px"></span>')
            continue
        style = f"width:{w}px;height:{h}px;font-size:{fs}px;line-height:{h}px;margin-right:{gap}px;color:{col}"
        if bg:
            style += f";background:{bg}"
        out.append(f'<span class="t {cls}" style="{style}">{ch}</span>')
    return "".join(out)

def flipping_tile(old, new, w, h, fs):
    # a tile caught mid-flip: lower half shows old digit, the top flap is falling over the hinge
    return f"""<span class="t" style="width:{w}px;height:{h}px;font-size:{fs}px;line-height:{h}px;margin-right:4px;overflow:visible">
<span style="position:absolute;left:0;top:0;width:100%;height:50%;overflow:hidden;border-radius:6px 6px 0 0;background:#202020;color:#F5F1E6">{new}</span>
<span style="position:absolute;left:0;top:50%;width:100%;height:50%;overflow:hidden;border-radius:0 0 6px 6px;background:#1a1a1a"><span style="position:absolute;left:0;top:-{h/2}px;width:100%;line-height:{h}px;color:#F5F1E6">{old}</span></span>
<span style="position:absolute;left:0;top:0;width:100%;height:50%;overflow:hidden;border-radius:6px 6px 0 0;background:linear-gradient(#3a3a3a,#262626);color:#F5F1E6;transform-origin:50% 100%;transform:perspective(500px) rotateX(-62deg);box-shadow:0 -6px 14px rgba(0,0,0,.6)">{old}</span>
</span>"""

def lookC_hook():
    n = str(2 ** 105)
    groups = [n[:2]] + [n[i:i + 3] for i in range(2, len(n), 3)]
    w, h, fs = 42, 80, 54
    row = []
    for gi, g in enumerate(groups):
        for ci, ch in enumerate(g):
            if gi == len(groups) - 1:
                row.append(tiles(ch, w, h, fs).replace('class="t "', 'class="t " data-r="1"').replace('color:#F5F1E6', 'color:transparent;text-shadow:0 0 4px #F5F1E6,0 -18px 5px rgba(245,241,230,.45),0 18px 5px rgba(245,241,230,.45)'))
            else:
                row.append(tiles(ch, w, h, fs))
        row.append('<span style="display:inline-block;width:16px"></span>')
    big = (f'<span class="t" style="width:190px;height:270px;font-size:210px;line-height:270px;margin-right:10px">2</span>'
           + tiles("105", 96, 140, 104, gap=8, col="#FFB81C"))
    body = f"""<div class="board"></div>
<div class="hdr" style="left:150px;top:118px"><span class="lamp" style="background:#FFB81C;box-shadow:0 0 12px #FFB81C"></span>105 个量子比特 · 可能的组合 · COMBINATIONS</div>
<div style="position:absolute;left:150px;top:170px;display:flex;align-items:flex-start">{big}
 <div style="margin-left:60px;margin-top:70px">{tiles("=", 96, 140, 104)}</div>
 <div style="margin-left:40px;margin-top:20px;font:900 66px/1.25 'Noto Sans CJK SC';color:#F5F1E6;letter-spacing:2px">每多一个比特<br><span style="color:#FFB81C">组合翻一倍</span></div>
</div>
<div style="position:absolute;left:136px;top:500px;white-space:nowrap">{''.join(row)}</div>
<div class="hdr" style="left:150px;top:620px;color:#9a9a9a;font-weight:500;font-size:22px">≈ 4.06 × 10<span style='font-size:.6em;vertical-align:.8em;margin-left:2px'>31</span> 种 · 全部同时试一遍？</div>
<div style="position:absolute;left:1440px;top:600px">{tiles("真的？", 82, 110, 72, gap=6, col="#FF3B2F", cls="cn")}</div>
"""
    return shell(body, C_CSS, C_BG, "你一定听过：量子计算机能同时试遍所有答案", label="00 · 2<span style='font-size:.6em;vertical-align:.8em;margin-left:2px'>105</span>", label_color="#FFB81C")

def lookC_key():
    names = [f"{i:03b}" for i in range(8)]
    right = 5
    rows = []
    y0, rh = 175, 78
    probs = ["0.9", "0.7", "1.0", "0.8", "0.6", "94.1", "0.9", "1.0"]
    for i, nm in enumerate(names):
        y = y0 + i * rh
        hi = i == right
        lit = "background:linear-gradient(90deg,rgba(61,220,132,.16),rgba(61,220,132,.04));" if hi else ""
        pc = probs[i].rjust(4).replace(" ", "\u00a0")
        prob = tiles(pc + "%", 40, 64, 46, gap=3, col="#3DDC84" if hi else "#8c8c8c")
        barw = 380 * float(probs[i]) / 100
        bar = f'<div style="position:absolute;left:650px;top:{rh/2-12}px;width:{max(barw,6):.0f}px;height:24px;background:{"#3DDC84" if hi else "#555"};border-radius:3px;{"box-shadow:0 0 18px rgba(61,220,132,.6)" if hi else ""}"></div>'
        if hi:
            stat = tiles("放大", 58, 64, 44, gap=4, col="#3DDC84", cls="cn") + '<span style="font:700 26px DejaVu Sans Mono;color:#3DDC84;margin-left:14px;line-height:64px">AMPLIFIED ▲</span>'
        else:
            stat = tiles("已抵消", 58, 64, 44, gap=4, col="#FF3B2F", cls="cn") + '<span style="font:700 22px DejaVu Sans Mono;color:#FF3B2F;opacity:.75;margin-left:14px;line-height:64px">CANCELLED</span>'
        rows.append(f"""<div style="position:absolute;left:110px;top:{y}px;width:1700px;height:{rh}px;{lit}border-bottom:1px solid #222">
<div style="position:absolute;left:30px;top:7px">{tiles(nm, 48, 64, 46, gap=4, col="#FFFFFF" if hi else "#d8d4ca")}</div>
<div style="position:absolute;left:260px;top:7px">{prob}</div>{bar}
<div style="position:absolute;left:1170px;top:7px;white-space:nowrap">{stat}</div></div>""")
    body = f"""<div class="board"></div>
<div class="hdr" style="left:140px;top:120px">答案 ANSWER</div>
<div class="hdr" style="left:370px;top:120px">概率 PROB.</div>
<div class="hdr" style="left:760px;top:120px">干涉之后 AFTER</div>
<div class="hdr" style="left:1280px;top:120px">状态 STATUS</div>
{''.join(rows)}
<div style="position:absolute;left:0;top:{y0+right*rh}px;width:110px;height:{rh}px;display:flex;align-items:center;justify-content:center;font:900 40px DejaVu Sans;color:#3DDC84">▶</div>
"""
    return shell(body, C_CSS, C_BG, "错的答案，波峰撞上波谷，互相抵消", label="05 · 干涉", label_color="#FFB81C")

files = {"lookA_hook": lookA_hook(), "lookA_key": lookA_key(), "lookB_hook": lookB_hook(),
         "lookB_key": lookB_key(), "lookC_hook": lookC_hook(), "lookC_key": lookC_key()}
for k, v in files.items():
    (OUT / f"{k}.html").write_text(v, encoding="utf-8")
    print(OUT / f"{k}.html")
