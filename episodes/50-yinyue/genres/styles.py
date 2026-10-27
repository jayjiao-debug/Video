"""Four new styles in the reference format: label top-left, tempo top-right, one bar = four beat cells (强/弱 + 拟声词),
a notes lane above the cells (piano-roll style) and a GarageBand-style slider; behind it all, an iconic scene for the genre.
python3 styles.py <outdir>   → S1..S4 png (1920×1080)"""
import math, os, sys, random
from playwright.sync_api import sync_playwright
W, H = 1920, 1080
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
SANS = "'Noto Sans CJK SC', sans-serif"; SERIF = "'Noto Serif CJK SC', serif"; MONO = "'DejaVu Sans Mono', monospace"

# ---------------------------------------------------------------- shared format geometry
CX0, CX1, CGAP = 120, 1560, 20            # beat cells span
CY0, CY1 = 812, 958                       # beat cells
RY0, RY1 = 640, 790                       # notes lane
SX0, SX1 = 1612, 1800                     # slider column
CW = (CX1 - CX0 - 3 * CGAP) / 4
def cellx(i): return CX0 + i * (CW + CGAP)
def beatx(b): return CX0 + b * (CW + CGAP) + 0 if False else CX0 + (b / 4) * (CX1 - CX0)   # notes lane is continuous in time
def notes_for(kind):
    """(start beat, length, pitch 0..1) for one bar"""
    if kind == 'edm':  return [(i * .5, .4, [.3, .55, .3, .7, .3, .55, .85, .7][i]) for i in range(8)]
    if kind == 'rock': return [(0, .5, .2), (.5, .5, .2), (1, .25, .5), (1.5, .5, .45), (2, .5, .2), (2.5, .5, .3), (3, .25, .55), (3.5, .5, .65)]
    if kind == 'lofi': return [(0, .9, .35), (1.15, .6, .55), (2, 1.2, .7), (3.3, .55, .5)]
    if kind == 'guofeng': return [(0, .5, .1), (.5, .5, .3), (1, 1, .5), (2, .5, .7), (2.5, .5, .5), (3, 1, .9)]
    return []

def page(body, css):
    return f"""<html><head><style>
    *{{box-sizing:border-box;margin:0;padding:0}} body{{width:{W}px;height:{H}px;overflow:hidden;position:relative}}
    .abs{{position:absolute}} svg.scene{{position:absolute;left:0;top:0}}
    {css}</style></head><body>{body}</body></html>"""
def A(x, y, w, h): return f"left:{x}px;top:{y}px;width:{w}px;height:{h}px"

# ================================================================ S1 像素 · 电子 (EDM, ♩=128, four on the floor)
def s1():
    U = 8; rnd = random.Random(4)
    def px(x, y, w, h, c, o=1): return f'<rect x="{x*U}" y="{y*U}" width="{w*U}" height="{h*U}" fill="{c}" opacity="{o}"/>'
    s = f'<svg class="scene" width="{W}" height="{H}" shape-rendering="crispEdges">' + px(0, 0, 240, 135, '#0B0A1F')
    for i in range(14): s += px(0, i * 6, 240, 6, ['#0B0A1F', '#100C2A'][i % 2])
    # LED wall: a ring of light spreading out from the centre on the beat
    for gy in range(0, 15):
        for gx in range(0, 34):
            x, y = 34 + gx * 5, 6 + gy * 4; d = math.hypot(gx - 16.5, (gy - 7) * 1.6)
            v = math.cos(d * .55 - 1.2); c = '#FF2BD6' if v > .55 else '#22E4FF' if v > .1 else '#3A2A78' if v > -.4 else '#1A1440'
            s += px(x, y, 4, 3, c)
    # lasers (stepped)
    for (x0, c, angs) in ((88, '#FF2BD6', (-62, -40, -20)), (152, '#22E4FF', (-160, -140, -118))):
        for a in angs:
            for k in range(0, 90):
                x = x0 + math.cos(math.radians(a)) * k; y = 66 + math.sin(math.radians(a)) * k
                if y < 0 or x < 0 or x > 240: break
                s += px(int(x), int(y), 1, 1, c, .55)
    # booth + DJ
    s += px(116, 50, 8, 9, '#05040E') + px(115, 52, 1, 4, '#22E4FF') + px(124, 52, 1, 4, '#22E4FF') + px(114, 59, 12, 6, '#05040E')
    s += px(90, 64, 60, 12, '#1B1840') + px(90, 64, 60, 1, '#22E4FF') + px(96, 62, 10, 2, '#2E2A5C') + px(134, 62, 10, 2, '#2E2A5C')
    for i in range(6): s += px(94 + i * 9, 69, 5, 2, ['#FF2BD6', '#22E4FF', '#FFE45C'][i % 3])
    # crowd: heads and raised hands
    for i in range(30):
        x = i * 8 + rnd.randint(-2, 2); y = 74 + rnd.randint(0, 4)
        s += px(x, y, 6, 6, '#05040E') + px(x, y, 6, 1, '#FF2BD6', .7)
        if rnd.random() < .45: s += px(x + rnd.choice([0, 5]), y - 9, 1, 9, '#05040E') + px(x + rnd.choice([0, 5]) - 1, y - 11, 3, 3, '#05040E')
    s += px(0, 80, 240, 55, '#05040E')
    s += '</svg>'
    PANEL = 'background:#120F2E;border:6px solid #22E4FF;box-shadow:8px 8px 0 #000'
    css = f"""body{{background:#0B0A1F;font-family:{SANS};color:#fff}}
    .label{{{A(120,60,0,0)};width:auto;height:auto;background:#000;border:6px solid #FF2BD6;padding:14px 30px;font-size:46px;font-weight:900;box-shadow:8px 8px 0 #FF2BD6}}
    .tempo{{right:120px;top:66px;font-family:{MONO};font-weight:bold;font-size:64px;color:#FFE45C;text-shadow:6px 6px 0 #000}}
    .roll{{{A(CX0,RY0,CX1-CX0,RY1-RY0)};{PANEL};background-image:linear-gradient(#22E4FF22 2px,transparent 2px),linear-gradient(90deg,#22E4FF22 2px,transparent 2px);background-size:40px 30px}}
    .cell{{position:absolute;{PANEL};border-color:#3A2A78}}
    .cell.on{{background:#FF2BD6;border-color:#FFE45C;box-shadow:8px 8px 0 #000,0 0 0 6px #000 inset}}
    .snd{{position:absolute;font-weight:900;color:#fff;text-shadow:5px 5px 0 #000}}
    .num{{position:absolute;font-family:{MONO};font-weight:bold;font-size:52px}}
    .acc{{position:absolute;font-size:28px;font-weight:900}}
    .note{{position:absolute;height:22px;background:#22E4FF;box-shadow:4px 4px 0 #000}}
    .note.on{{background:#FFE45C}}
    .head{{position:absolute;width:8px;background:#FFE45C}}
    .fader{{{A(SX0,RY0,SX1-SX0,CY1-RY0)};{PANEL};border-color:#FF2BD6}}"""
    b = s + '<div class="abs label">电子 · 四拍都踩底鼓</div><div class="abs tempo">♩=128</div>'
    b += '<div class="abs roll"></div>'
    t = 0.12
    for (st, ln, p) in notes_for('edm'):
        on = st <= t < st + ln
        b += f'<div class="note{" on" if on else ""}" style="left:{beatx(st)+6}px;width:{ln/4*(CX1-CX0)-10}px;top:{RY1-30-p*(RY1-RY0-50)}px"></div>'
    b += f'<div class="head" style="left:{beatx(t)}px;top:{RY0-14}px;height:{CY1-RY0+28}px"></div>'
    for i in range(4):
        on = i == 0; x = cellx(i)
        b += f'<div class="cell{" on" if on else ""}" style="{A(x,CY0,CW,CY1-CY0)}"></div>'
        b += f'<div class="snd" style="left:{x+24}px;top:{CY0+18}px;font-size:{86 if on else 70}px">嘭{"!" if on else ""}</div>'
        # every beat is a kick: a small kick-drum pixel icon in each cell
        b += f'<div class="abs" style="{A(x+CW-110,CY0+40,70,70)};border-radius:0;background:{"#FFE45C" if on else "#22E4FF"};box-shadow:6px 6px 0 #000;clip-path:polygon(20% 0,80% 0,100% 20%,100% 80%,80% 100%,20% 100%,0 80%,0 20%)"></div>'
        b += f'<div class="num" style="left:{x+CW/2-50}px;top:{CY1+12}px;color:{"#FFE45C" if on else "#7A6FC0"}">{i+1}</div><div class="acc" style="left:{x+CW/2+6}px;top:{CY1+28}px;color:{"#FF2BD6" if on else "#7A6FC0"}">强</div>'
    # pixel fader: tempo
    b += '<div class="abs fader"></div>'
    fx = (SX0 + SX1) / 2
    b += f'<div class="abs" style="{A(fx-8,RY0+80,16,CY1-RY0-160)};background:#000"></div>'
    for k in range(9): b += f'<div class="abs" style="{A(fx-34,RY0+80+k*(CY1-RY0-160)/8,18,4)};background:#3A2A78"></div>'
    b += f'<div class="abs" style="{A(fx-44,RY0+150,88,44)};background:#FFE45C;box-shadow:6px 6px 0 #000;border:6px solid #000"></div>'
    b += f'<div class="abs" style="left:{SX0+30}px;top:{RY0+22}px;font-size:30px;font-weight:900">速度</div>'
    b += f'<div class="abs" style="left:{SX0+40}px;top:{CY1-62}px;font-family:{MONO};font-weight:bold;font-size:40px;color:#FFE45C">128</div>'
    return page(b, css)

# ================================================================ S2 孔版印刷 · 摇滚 (rock garage, ♩=120, backbeat on 2 & 4)
def s2():
    PINK, BLUE, YEL, PAPER, INK = '#FF48B0', '#0078BF', '#FFE800', '#F2ECDF', '#1D1A3A'
    m = 'style="mix-blend-mode:multiply"'
    s = f'''<svg class="scene" width="{W}" height="{H}"><defs>
      <pattern id="dB" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="7" cy="7" r="4.2" fill="{BLUE}"/></pattern>
      <pattern id="dP" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="5.5" cy="5.5" r="3" fill="{PINK}"/></pattern>
      <pattern id="dY" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="3.4" fill="{YEL}"/></pattern>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .3 0 0 0 0 .25 0 0 0 0 .2 0 0 0 .22 0"/></filter>
      <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9"/></filter></defs>
      <rect width="{W}" height="{H}" fill="{PAPER}"/>
      <g filter="url(#rough)">
      <rect x="0" y="0" width="{W}" height="640" fill="url(#dB)" opacity=".55" {m}/>
      <path d="M560 120 H1360 V640 H560Z" fill="{BLUE}" opacity=".75" {m}/>'''
    for k in range(12): s += f'<rect x="560" y="{140+k*40}" width="800" height="7" fill="{PAPER}" opacity=".55"/>'
    # string lights
    s += f'<path d="M0 70 Q960 230 1920 70" fill="none" stroke="{INK}" stroke-width="5"/>'
    for i in range(1, 27):
        x = i * 71; y = 70 + 160 * (1 - ((x - 960) / 960) ** 2) * .62
        s += f'<circle cx="{x}" cy="{y+18}" r="15" fill="{YEL}" {m}/><circle cx="{x+4}" cy="{y+21}" r="15" fill="{PINK}" opacity=".35" {m}/>'
    # amp stacks
    for x0 in (150, 1500):
        s += f'<rect x="{x0}" y="300" width="270" height="110" fill="{INK}"/><rect x="{x0+14}" y="314" width="242" height="40" fill="{PINK}" {m}/>'
        for k in range(6): s += f'<circle cx="{x0+40+k*38}" cy="{385}" r="10" fill="{YEL}"/>'
        for r in range(2): s += f'<rect x="{x0}" y="{420+r*130}" width="270" height="124" fill="{INK}"/><rect x="{x0+14}" y="{434+r*130}" width="242" height="96" fill="url(#dP)"/>'
    # drum kit: kick front-on, toms/snare/floor tom as cylinders seen from the side, hi-hat and crash on stands
    def drum(x, y, w, h, fill):
        return (f'<rect x="{x-w/2}" y="{y}" width="{w}" height="{h}" fill="{fill}" {m}/><rect x="{x-w/2}" y="{y}" width="{w}" height="{h}" fill="none" stroke="{INK}" stroke-width="7"/>'
                f'<ellipse cx="{x}" cy="{y}" rx="{w/2}" ry="{w*.16}" fill="{PAPER}" stroke="{INK}" stroke-width="7"/>'
                + ''.join(f'<line x1="{x-w/2+k*w/4}" y1="{y+6}" x2="{x-w/2+k*w/4}" y2="{y+h}" stroke="{INK}" stroke-width="3"/>' for k in range(1, 4)))
    s += f'''<line x1="640" y1="300" x2="640" y2="640" stroke="{INK}" stroke-width="7"/><ellipse cx="640" cy="300" rx="90" ry="12" fill="{YEL}" stroke="{INK}" stroke-width="6"/><ellipse cx="640" cy="316" rx="90" ry="12" fill="{YEL}" stroke="{INK}" stroke-width="6"/>
      <line x1="1290" y1="220" x2="1260" y2="640" stroke="{INK}" stroke-width="7"/><ellipse cx="1290" cy="220" rx="130" ry="20" fill="{YEL}" stroke="{INK}" stroke-width="7" transform="rotate(10 1290 220)"/>
      <line x1="700" y1="200" x2="760" y2="640" stroke="{INK}" stroke-width="7"/><ellipse cx="700" cy="200" rx="115" ry="18" fill="{YEL}" stroke="{INK}" stroke-width="7" transform="rotate(-12 700 200)"/>'''
    s += drum(780, 470, 150, 70, BLUE) + drum(1170, 470, 170, 170, BLUE)
    s += f'''<circle cx="975" cy="520" r="140" fill="{YEL}" {m}/><circle cx="983" cy="526" r="140" fill="none" stroke="{PINK}" stroke-width="16" {m}/>
      <circle cx="975" cy="520" r="140" fill="none" stroke="{INK}" stroke-width="10"/><circle cx="975" cy="520" r="112" fill="none" stroke="{INK}" stroke-width="4"/><circle cx="975" cy="520" r="46" fill="{PINK}" {m}/>'''
    s += drum(900, 330, 120, 74, PINK) + drum(1050, 330, 130, 84, PINK)
    s += f'''
      </g><rect width="{W}" height="{H}" filter="url(#grain)"/></svg>'''
    css = f"""body{{background:{PAPER};font-family:{SANS};color:{INK}}}
    .label{{left:110px;top:56px;background:{INK};color:{PAPER};padding:16px 34px;font-size:46px;font-weight:900;transform:rotate(-1.5deg);clip-path:polygon(0 4%,3% 0,98% 3%,100% 96%,96% 100%,2% 97%)}}
    .tempo{{right:110px;top:58px;font-weight:900;font-size:62px;background:{YEL};padding:6px 26px;transform:rotate(2deg);mix-blend-mode:multiply}}
    .roll{{{A(CX0,RY0,CX1-CX0,RY1-RY0)};background:{PAPER};border:5px solid {INK};background-image:repeating-linear-gradient(90deg,transparent 0 {(CX1-CX0)/16-3}px,{BLUE}44 {(CX1-CX0)/16-3}px {(CX1-CX0)/16}px)}}
    .cell{{position:absolute;background:{PAPER};border:6px solid {INK}}}
    .cell.on{{background:{PINK};mix-blend-mode:multiply}}
    .snd{{position:absolute;font-weight:900;color:{INK};}}
    .num{{position:absolute;font-weight:900;font-size:56px}} .acc{{position:absolute;font-size:28px;font-weight:900}}
    .note{{position:absolute;height:24px;background:{BLUE};mix-blend-mode:multiply;border-radius:3px}}
    .note.on{{background:{PINK}}}
    .tape{{position:absolute;background:{YEL};opacity:.85;mix-blend-mode:multiply}}"""
    b = s + f'<div class="abs label">摇滚 · 军鼓砸在 2、4 拍</div><div class="abs tempo">♩ = 120</div><div class="abs roll"></div>'
    b += f'<div class="tape" style="{A(CX0-30,RY0-16,120,34)};transform:rotate(-8deg)"></div><div class="tape" style="{A(CX1-90,RY0-16,120,34)};transform:rotate(6deg)"></div>'
    t = 1.08
    for (st, ln, p) in notes_for('rock'):
        on = st <= t < st + ln
        b += f'<div class="note{" on" if on else ""}" style="left:{beatx(st)+6}px;width:{ln/4*(CX1-CX0)-10}px;top:{RY1-34-p*(RY1-RY0-56)}px"></div>'
    b += f'<div class="abs" style="left:{beatx(t)}px;top:{RY0-20}px;width:6px;height:{CY1-RY0+40}px;background:{PINK};mix-blend-mode:multiply"></div>'
    snds = ['咚', '啪', '咚', '啪']; accs = ['', '重', '', '重']
    for i in range(4):
        on = i == 1; x = cellx(i); back = i in (1, 3)
        b += f'<div class="cell{" on" if on else ""}" style="{A(x,CY0,CW,CY1-CY0)};transform:rotate({[-1,1.2,-.6,.8][i]}deg)"></div>'
        if back and not on: b += f'<div class="abs" style="{A(x+8,CY0+8,CW-16,CY1-CY0-16)};background:url(#);background-image:radial-gradient({PINK} 30%,transparent 32%);background-size:12px 12px;opacity:.45;mix-blend-mode:multiply"></div>'
        b += f'<div class="snd" style="left:{x+26}px;top:{CY0+14}px;font-size:{96 if on else 72}px;{"color:" + PAPER + ";-webkit-text-stroke:4px " + INK if on else ""}">{snds[i]}{"!" if on else ""}</div>'
        b += f'<div class="num" style="left:{x+CW/2-44}px;top:{CY1+6}px;color:{PINK if on else INK if back else "#9a93a8"}">{i+1}</div><div class="acc" style="left:{x+CW/2+6}px;top:{CY1+26}px;color:{PINK if back else "#9a93a8"}">{"重" if back else "轻"}</div>'
    # fader as cut paper + tape
    fx = (SX0 + SX1) / 2
    b += f'<div class="abs" style="{A(SX0,RY0,SX1-SX0,CY1-RY0)};background:{PAPER};border:5px solid {INK};transform:rotate(1deg)"></div>'
    b += f'<div class="abs" style="{A(fx-6,RY0+90,12,CY1-RY0-170)};background:{INK}"></div>'
    for k in range(9): b += f'<div class="abs" style="{A(fx+16,RY0+90+k*(CY1-RY0-170)/8,26,4)};background:{BLUE}"></div>'
    b += f'<div class="abs" style="{A(fx-50,RY0+140,100,52)};background:{PINK};mix-blend-mode:multiply;border:5px solid {INK};transform:rotate(-3deg)"></div>'
    b += f'<div class="abs" style="left:{SX0+40}px;top:{RY0+24}px;font-size:30px;font-weight:900">音量</div><div class="abs" style="left:{SX0+52}px;top:{CY1-66}px;font-size:40px;font-weight:900;color:{BLUE}">-6</div>'
    return page(b, css)

# ================================================================ S3 毛玻璃 · Lo-fi (bedroom at night, ♩=75, lazy swing)
def s3():
    rnd = random.Random(9)
    s = f'''<svg class="scene" width="{W}" height="{H}"><defs>
      <linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B2550"/><stop offset="1" stop-color="#171430"/></linearGradient>
      <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2D5C"/><stop offset="1" stop-color="#5B4C8A"/></linearGradient>
      <radialGradient id="lamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFC48A" stop-opacity=".75"/><stop offset="1" stop-color="#FFC48A" stop-opacity="0"/></radialGradient>
      <filter id="b8"><feGaussianBlur stdDeviation="8"/></filter><filter id="b20"><feGaussianBlur stdDeviation="22"/></filter></defs>
      <rect width="{W}" height="{H}" fill="url(#room)"/>
      <rect x="560" y="70" width="960" height="560" rx="18" fill="url(#night)"/>'''
    for i in range(14):
        x = 570 + i * 70 + rnd.randint(-10, 10); h = rnd.randint(120, 300)
        s += f'<rect x="{x}" y="{630-h}" width="{rnd.randint(50,80)}" height="{h}" fill="#141A38"/>'
        for k in range(10):
            if rnd.random() < .45: s += f'<rect x="{x+8+rnd.randint(0,40)}" y="{630-h+10+rnd.randint(0,h-30)}" width="8" height="10" fill="#FFD9A0" opacity=".7"/>'
    for i in range(26):
        s += f'<circle cx="{rnd.randint(580,1500)}" cy="{rnd.randint(380,620)}" r="{rnd.randint(12,34)}" fill="{rnd.choice(["#FFB38A","#B9A7FF","#7FD1FF","#FFE0A3"])}" opacity=".45" filter="url(#b8)"/>'
    for i in range(110):
        x = rnd.randint(570, 1510); y = rnd.randint(80, 600); s += f'<line x1="{x}" y1="{y}" x2="{x-10}" y2="{y+34}" stroke="#CFE3FF" stroke-width="2" opacity=".25"/>'
    s += '<rect x="560" y="70" width="960" height="560" rx="18" fill="none" stroke="#120F28" stroke-width="26"/><rect x="1028" y="70" width="24" height="560" fill="#120F28"/><rect x="560" y="338" width="960" height="22" fill="#120F28"/>'
    # desk, lamp, laptop, plant, mug
    s += '''<circle cx="360" cy="420" r="380" fill="url(#lamp)"/>
      <rect x="0" y="600" width="1920" height="40" fill="#0F0C22"/><rect x="0" y="640" width="1920" height="440" fill="#151230"/>
      <path d="M300 600 L330 420 L430 360" fill="none" stroke="#0F0C22" stroke-width="16" stroke-linecap="round"/><path d="M400 330 L500 360 L470 420 L370 395Z" fill="#0F0C22"/>
      <path d="M380 410 L480 430 L620 640 L230 640Z" fill="#FFC48A" opacity=".16"/><ellipse cx="300" cy="600" rx="70" ry="12" fill="#0F0C22"/>
      <path d="M760 600 L800 470 L1020 470 L990 600Z" fill="#0F0C22"/><path d="M780 590 L815 485 L1005 485 L975 590Z" fill="#7FD1FF" opacity=".22"/><rect x="740" y="596" width="300" height="12" rx="6" fill="#0F0C22"/>
      <path d="M1360 600 C1350 560 1400 560 1400 600Z" fill="#0F0C22"/><rect x="1345" y="540" width="70" height="62" rx="10" fill="#0F0C22"/>
      <path d="M1372 530 C1360 500 1392 490 1380 460" fill="none" stroke="#fff" stroke-width="4" opacity=".25" stroke-linecap="round"/>
      <rect x="1580" y="520" width="90" height="82" rx="8" fill="#0F0C22"/>
      <path d="M1625 520 C1560 440 1600 380 1625 360 C1650 380 1690 440 1625 520Z M1625 520 C1690 470 1730 470 1760 440 C1740 500 1700 520 1625 520Z M1625 520 C1560 480 1520 480 1500 450 C1520 510 1560 525 1625 520Z" fill="#0F0C22"/>'''
    s += '</svg>'
    GL = 'background:rgba(255,255,255,.10);backdrop-filter:blur(26px) saturate(1.3);-webkit-backdrop-filter:blur(26px);border:1.5px solid rgba(255,255,255,.28);border-radius:28px;box-shadow:0 20px 50px rgba(0,0,0,.35)'
    css = f"""body{{font-family:{SANS};color:#fff}}
    .label{{left:110px;top:60px;{GL};border-radius:22px;padding:16px 34px;font-size:44px;font-weight:700}}
    .tempo{{right:110px;top:60px;{GL};border-radius:22px;padding:12px 30px;font-size:56px;font-weight:700}}
    .roll{{{A(CX0,RY0,CX1-CX0,RY1-RY0)};{GL}}}
    .cell{{position:absolute;{GL}}} .cell.on{{background:linear-gradient(135deg,rgba(255,179,138,.75),rgba(185,167,255,.55));border-color:rgba(255,255,255,.7)}}
    .snd{{position:absolute;font-weight:700;color:#fff}}
    .num{{position:absolute;font-weight:300;font-size:56px}} .acc{{position:absolute;font-size:26px;font-weight:500;opacity:.8}}
    .note{{position:absolute;height:22px;border-radius:11px;background:rgba(185,167,255,.85)}} .note.on{{background:#FFB38A;box-shadow:0 0 24px #FFB38A}}"""
    b = s + '<div class="abs label">Lo-fi · 慢一点，松一点</div><div class="abs tempo">♩ = 75</div><div class="abs roll"></div>'
    t = .3
    for (st, ln, p) in notes_for('lofi'):
        on = st <= t < st + ln
        b += f'<div class="note{" on" if on else ""}" style="left:{beatx(st)+8}px;width:{ln/4*(CX1-CX0)-14}px;top:{RY1-34-p*(RY1-RY0-56)}px"></div>'
    b += f'<div class="abs" style="left:{beatx(t)}px;top:{RY0-12}px;width:3px;height:{CY1-RY0+24}px;background:#fff;border-radius:2px;box-shadow:0 0 12px #fff"></div>'
    snds = ['嘭', '嚓', '嘭', '嚓']
    for i in range(4):
        on = i == 0; x = cellx(i)
        b += f'<div class="cell{" on" if on else ""}" style="{A(x,CY0,CW,CY1-CY0)}"></div>'
        b += f'<div class="snd" style="left:{x+28}px;top:{CY0+20}px;font-size:{80 if on else 62}px;opacity:{1 if on else .75}">{snds[i]}</div>'
        b += f'<div class="num" style="left:{x+CW/2-40}px;top:{CY1+8}px;opacity:{1 if on else .5}">{i+1}</div><div class="acc" style="left:{x+CW/2+6}px;top:{CY1+30}px">{"强" if i == 0 else "次强" if i == 2 else "弱"}</div>'
    # mixer-style faders (glass): drums low, rain high
    b += f'<div class="abs" style="{A(SX0,RY0,SX1-SX0,CY1-RY0)};{GL}"></div>'
    for k, (nm, v, col) in enumerate((('鼓', .35, '#B9A7FF'), ('雨', .82, '#FFB38A'))):
        fx = SX0 + 55 + k * 80; y0, y1 = RY0 + 70, CY1 - 70
        b += f'<div class="abs" style="{A(fx-4,y0,8,y1-y0)};background:rgba(255,255,255,.18);border-radius:4px"></div>'
        b += f'<div class="abs" style="{A(fx-4,y1-(y1-y0)*v,8,(y1-y0)*v)};background:{col};border-radius:4px"></div>'
        b += f'<div class="abs" style="{A(fx-26,y1-(y1-y0)*v-16,52,32)};background:rgba(255,255,255,.9);border-radius:10px;box-shadow:0 6px 16px rgba(0,0,0,.35)"></div>'
        b += f'<div class="abs" style="left:{fx-14}px;top:{RY0+20}px;font-size:28px;font-weight:700">{nm}</div>'
    return page(b, css)

# ================================================================ S4 木刻 · 国风 (moonlit pavilion, ♩=90, pentatonic)
def s4():
    global RY0
    RY0 = 600
    PAPER, INK, RED = '#EFE6D2', '#191714', '#C8102E'; rnd = random.Random(2)
    s = f'''<svg class="scene" width="{W}" height="{H}"><defs>
      <filter id="cut"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6"/></filter>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="1"/><feColorMatrix values="0 0 0 0 .3 0 0 0 0 .25 0 0 0 0 .2 0 0 0 .18 0"/></filter></defs>
      <rect width="{W}" height="{H}" fill="{PAPER}"/><g filter="url(#cut)">
      <rect x="0" y="0" width="{W}" height="660" fill="{INK}"/>'''
    # carved sky: gouge strokes that curve around the moon
    for k in range(60):
        y = 20 + k * 11; x0 = rnd.randint(-40, 200); x1 = rnd.randint(1200, 1960)
        s += f'<path d="M{x0} {y} C{x0+300} {y-8} {x1-300} {y+10} {x1} {y}" fill="none" stroke="{PAPER}" stroke-width="{rnd.choice([1.5,2,2.5])}" opacity=".55" stroke-dasharray="{rnd.randint(60,200)} {rnd.randint(20,90)}"/>'
    s += f'<circle cx="1360" cy="250" r="170" fill="{INK}"/><circle cx="1360" cy="250" r="150" fill="{PAPER}"/>'
    for k in range(4): s += f'<circle cx="1360" cy="250" r="{186+k*16}" fill="none" stroke="{PAPER}" stroke-width="3" opacity="{.7-k*.15}"/>'
    # mountains with carved contour lines
    for (pts, lines) in (('0,520 260,360 460,450 700,300 980,470 1200,380 1500,500 1920,400 1920,660 0,660', 6), ('0,600 340,470 620,560 900,480 1240,580 1600,500 1920,560 1920,660 0,660', 4)):
        s += f'<polygon points="{pts}" fill="{INK}" stroke="{PAPER}" stroke-width="4"/>'
    for k in range(18):
        x = rnd.randint(100, 1800); y = rnd.randint(430, 600); s += f'<path d="M{x} {y} q30 -24 60 0 q30 -24 60 0" fill="none" stroke="{PAPER}" stroke-width="3" opacity=".7"/>'
    # pavilion on a rock, lanterns
    s += f'''<path d="M160 660 L190 560 L520 540 L560 660Z" fill="{INK}" stroke="{PAPER}" stroke-width="4"/>
      <rect x="250" y="400" width="16" height="150" fill="{PAPER}"/><rect x="420" y="400" width="16" height="150" fill="{PAPER}"/>
      <path d="M180 410 Q340 380 500 410 L520 392 Q340 330 160 392Z" fill="{PAPER}"/><path d="M220 330 Q340 260 460 330 L470 345 Q340 300 210 345Z" fill="{PAPER}"/>
      <path d="M340 250 L344 290" stroke="{PAPER}" stroke-width="6"/>
      <rect x="236" y="540" width="214" height="14" fill="{PAPER}"/>'''
    for (x, y) in ((200, 470), (480, 470)):
        s += f'<line x1="{x}" y1="405" x2="{x}" y2="{y-24}" stroke="{PAPER}" stroke-width="3"/><ellipse cx="{x}" cy="{y}" rx="26" ry="32" fill="{RED}"/><rect x="{x-10}" y="{y-36}" width="20" height="8" fill="{PAPER}"/>'
    # willow from the top-left
    for k in range(9):
        x = 40 + k * 26; s += f'<path d="M{x} 0 C{x+20} 120 {x-10} 220 {x+14} {280+k*14}" fill="none" stroke="{PAPER}" stroke-width="3"/>'
    s += f'</g><rect width="{W}" height="{H}" filter="url(#grain)"/></svg>'
    css = f"""body{{font-family:{SERIF};color:{INK};background:{PAPER}}}
    .label{{left:110px;top:56px;background:{PAPER};border:6px solid {INK};padding:14px 32px;font-size:46px;font-weight:900}}
    .tempo{{right:110px;top:56px;font-size:60px;font-weight:900;color:{PAPER}}}
    .roll{{{A(CX0+70,RY0,CX1-CX0-70,RY1-RY0)};background:{PAPER};border:6px solid {INK}}}
    .keys{{{A(CX0,RY0,70,RY1-RY0)};background:{INK};color:{PAPER};font-size:22px;font-weight:900}}
    .cell{{position:absolute;background:{PAPER};border:6px solid {INK}}} .cell.on{{background:{RED};border-color:{INK}}}
    .snd{{position:absolute;font-weight:900}} .num{{position:absolute;font-weight:900;font-size:56px}} .acc{{position:absolute;font-size:28px;font-weight:900}}
    .note{{position:absolute;height:20px;background:{INK}}} .note.on{{background:{RED}}}
    .seal{{position:absolute;border:5px solid {RED};color:{RED};font-weight:900;text-align:center}}"""
    b = s + f'<div class="abs label">国风 · 只用五个音</div><div class="abs tempo">♩ = 90</div><div class="abs keys"></div><div class="abs roll"></div>'
    for k, nm in enumerate('宫商角徵羽'):
        y = RY1 - (k + .5) * (RY1 - RY0) / 5
        b += f'<div class="abs" style="left:{CX0+20}px;top:{y-17}px;font-size:28px;font-weight:900;color:{PAPER}">{nm}</div>'
        if k: b += f'<div class="abs" style="{A(CX0+70,RY1-k*(RY1-RY0)/5,CX1-CX0-70,2)};background:{INK}33"></div>'
    t = .2
    R0 = CX0 + 70
    for (st, ln, p) in notes_for('guofeng'):
        on = st <= t < st + ln; x = R0 + st / 4 * (CX1 - R0)
        row = round(p * 4.4 - .4); yc = RY1 - (row + .5) * (RY1 - RY0) / 5
        b += f'<div class="note{" on" if on else ""}" style="left:{x+6}px;width:{ln/4*(CX1-R0)-10}px;top:{yc-10}px"></div>'
    b += f'<div class="abs" style="left:{R0 + t/4*(CX1-R0)}px;top:{RY0-16}px;width:6px;height:{CY1-RY0+32}px;background:{RED}"></div>'
    snds = ['咚', '哒', '锵', '哒']
    for i in range(4):
        on = i == 0; x = cellx(i)
        b += f'<div class="cell{" on" if on else ""}" style="{A(x,CY0,CW,CY1-CY0)}"></div>'
        b += f'<div class="snd" style="left:{x+26}px;top:{CY0+14}px;font-size:{92 if on else 70}px;color:{PAPER if on else INK}">{snds[i]}</div>'
        b += f'<div class="num" style="left:{x+CW/2-44}px;top:{CY1+4}px;color:{RED if on else INK}">{"一二三四"[i]}</div><div class="acc" style="left:{x+CW/2+22}px;top:{CY1+26}px;color:{RED if i in (0,2) else "#8a8070"}">{"强" if i == 0 else "次强" if i == 2 else "弱"}</div>'
    # the slider as a carved scroll with a seal for a knob
    fx = (SX0 + SX1) / 2
    b += f'<div class="abs" style="{A(SX0,RY0,SX1-SX0,CY1-RY0)};background:{PAPER};border:6px solid {INK}"></div>'
    b += f'<div class="abs" style="{A(fx-5,RY0+90,10,CY1-RY0-170)};background:{INK}"></div>'
    b += f'<div class="seal" style="{A(fx-40,RY0+110,80,80)};background:{PAPER};font-size:44px;line-height:70px">速</div>'
    b += f'<div class="abs" style="left:{SX0+34}px;top:{RY0+20}px;font-size:32px;font-weight:900">节拍</div><div class="abs" style="left:{SX0+60}px;top:{CY1-68}px;font-size:40px;font-weight:900;color:{RED}">90</div>'
    RY0 = 640
    return page(b, css)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(viewport={'width': W, 'height': H})
        for k, fn in (('S1_像素_电子', s1), ('S2_孔版_摇滚', s2), ('S3_毛玻璃_lofi', s3), ('S4_木刻_国风', s4)):
            pg.set_content(fn()); pg.wait_for_timeout(250); pg.screenshot(path=f'{OUT}/{k}.png'); print(k)
        br.close()
