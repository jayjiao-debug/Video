"""ep57 explanation shots for the last stop, 长城 (八达岭, the homecoming). See BRIEF.md in this folder.
  greatwall_when (3.344 s)  时光倒流 on the coded 长城 scene (gw_vector.py's drawing, regrouped into 5 depth layers):
                            colour drains to sepia, grain flickers, the camera dollies in on 你; the year rolls 2026 → 1505
                            and lands on the bar (t = 1.672) with 年 · 明朝; then the wall becomes its Ming self
                            (the modern railings and sign fade, Ming banners rise on the merlons, two guards walk the landing).
  greatwall_what (5.016 s)  用来挡住北方的骑兵: a new drawing in the same coded style, seen from a crane outside the wall,
                            looking along it: northern riders gallop in from the left and rein up (rear) at the wall's foot
                            on the bar-3 downbeat; the beacon on the watchtower flares and its smoke column climbs; the relay
                            beacons on the far ridges light one per beat; 你 on the wall walk points at the beacon.
Every page is self-contained: window.DUR, window.render(t) (deterministic), DOM built once, the character rebuilt per frame.
usage: greatwall.py OUTDIR"""
import sys, os, math, random, json
HERE = os.path.dirname(os.path.abspath(__file__))
INK = '#2A211B'
WENKAI = 'file:///home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai/wenkai-bold.css'


# ---------------- 2D helpers (same as the scene scripts) ----------------
def pts(p): return ' '.join(f'{x:.1f},{y:.1f}' for x, y in p)
def poly(p, fill, stroke=INK, sw=3, extra=''): return f'<polygon points="{pts(p)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'
def line(p, stroke=INK, sw=3, extra=''): return f'<polyline points="{pts(p)}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def along(path, n):
    """n+1 evenly spaced points (with unit tangents) along a polyline"""
    seg = [math.dist(a, b) for a, b in zip(path, path[1:])]; L = sum(seg); out = []
    for i in range(n + 1):
        d = L * i / n; j = 0
        while j < len(seg) - 1 and d > seg[j]: d -= seg[j]; j += 1
        a, b = path[j], path[j + 1]; t = min(1, d / seg[j]); tx, ty = (b[0] - a[0]) / seg[j], (b[1] - a[1]) / seg[j]
        out.append((lerp(a, b, t), (tx, ty)))
    return out
def edge_x(edge, y):
    """x of a polyline edge (listed top → bottom) at height y"""
    for a, b in zip(edge, edge[1:]):
        if a[1] <= y <= b[1]: return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1] or 1)
    return edge[0][0] if y < edge[0][1] else edge[-1][0]


# =====================================================================================================
# the 长城 scene (gw_vector.py, 2576x1717 photo coords), regrouped into depth layers and widened by EXT
# on every side that touches the frame, so the camera can dolly, truck and roll without showing an edge
# =====================================================================================================
GW_W, GW_H, EXT = 2576, 1717, 420
GP = dict(sky0='#F7ECD6', sky1='#EAD6B6', far='#D3C7B6', mid='#BCAE9C', slope='#6F665C', slope_lit='#93877A', foot='#9E8B76',
          valley='#D7C19B', river='#F4EEE2', hill='#C8945A', hill_hi='#E3B776', hill_lo='#9A6C44',
          wface='#EEDCB5', wtop='#7C7068', wwalk='#6E6A70', tower='#BBA98E', roof='#5E544D',
          nwall='#6C6870', ncap='#DCA965', merl='#78737B', merl_lit='#E4B878',
          blk_dark='#5B5962', blk_top='#8E8277', blk_lit='#BC9D79', tread='#7B8196', riser='#565B6F',
          pcap='#D8A25F', pcap_d='#6C686F', pface='#625F68', rail='#8A4632', rail_hi='#C98055', grass='#C99A5C', grass_d='#8F6A42')
# merlons of the near wall (used for the Ming banners)
GW_C0, GW_C1, GW_NM = (690, 800), (1650, 745), 11

def gw_layers():
    R = random.Random(57); W, H, E, P = GW_W, GW_H, EXT, GP
    L = {k: [] for k in ('sky', 'hills', 'mon', 'near', 'fg', 'fg2', 'rails', 'sign')}
    defs = (f'<linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["sky0"]}"/><stop offset="1" stop-color="{P["sky1"]}"/></linearGradient>'
            f'<linearGradient id="ghill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{P["hill_hi"]}"/><stop offset=".6" stop-color="{P["hill"]}"/><stop offset="1" stop-color="{P["hill_lo"]}"/></linearGradient>'
            f'<linearGradient id="gslope" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["slope_lit"]}"/><stop offset="1" stop-color="{P["slope"]}"/></linearGradient>')
    g = L['sky']
    g.append(f'<rect x="{-E}" y="{-E}" width="{W + 2 * E}" height="{H + 2 * E}" fill="url(#gsky)"/>')
    far = [(0, 75), (120, 85), (250, 110), (400, 125), (500, 115), (580, 95), (650, 70), (720, 45), (790, 38), (850, 52), (920, 60), (1000, 88), (1100, 118), (1200, 124), (1300, 100), (1450, 90), (1530, 78), (1600, 94), (1700, 108), (1800, 90), (1900, 84), (2000, 74), (2100, 68), (2200, 55), (2300, 60), (2400, 44), (2500, 30), (2576, 22)]
    g.append(poly([(-E, 60)] + far + [(W + E, 10), (W + E, 900), (-E, 900)], P['far'], '#9C9182', 2))
    mid = [(0, 130), (150, 150), (300, 190), (400, 214), (500, 200), (600, 170), (700, 150), (800, 136), (900, 150), (1000, 165), (1100, 176), (1200, 200), (1300, 214), (1400, 200), (1500, 214), (1600, 228), (1700, 218), (1800, 190), (1900, 170), (2000, 164), (2100, 150), (2200, 140), (2300, 120), (2400, 100), (2500, 90), (2576, 84)]
    g.append(poly([(-E, 110)] + mid + [(W + E, 70), (W + E, 1000), (-E, 1000)], P['mid'], '#8E8274', 2))
    # --- hills: the foothills, the valley and river, the big slope on the right, the dark hill on the left ---
    g = L['hills']
    g.append(poly([(-E, 290), (0, 300), (150, 318), (250, 350), (350, 378), (450, 362), (550, 330), (640, 300), (720, 290), (720, 1000), (-E, 1000)], P['foot'], '#6E6152', 2.5))
    g.append(poly([(1330, 290), (1500, 278), (1650, 298), (1760, 330), (1700, 420), (1600, 470), (1500, 520), (1450, 480), (1400, 400)], P['valley'], '#8E7B60', 2))
    g.append(line([(1435, 296), (1420, 340), (1452, 392), (1500, 432), (1540, 470), (1562, 520), (1580, 565)], P['river'], 12))
    g.append(poly([(1560, 600), (1600, 420), (1700, 330), (1800, 292), (1900, 270), (2000, 260), (2100, 246), (2200, 240), (2300, 200), (2400, 170), (2500, 146), (2576, 130), (W + E, 105), (W + E, 1100), (1560, 1100)], 'url(#gslope)', '#5E5448', 3))
    for i in range(9):
        x0 = 1700 + i * 100; g.append(line([(x0, 300 - i * 12), (x0 - 120, 520), (x0 - 210, 700)], '#7A6E61', 2, 'opacity=".55"'))
    g.append(poly([(-E, 470), (0, 520), (200, 560), (380, 600), (500, 700), (520, 900), (720, 990), (720, 1300), (-E, 1500)], '#6F5C49', '#4A3C2E', 3))
    # --- the monument: the golden hill, the distant wall and its towers ---
    g = L['mon']
    g.append(poly([(700, 770), (640, 700), (620, 600), (640, 480), (700, 430), (850, 380), (980, 340), (1050, 360), (1150, 420), (1250, 482), (1350, 560), (1450, 640), (1520, 720), (1300, 740), (1000, 760), (800, 772)], 'url(#ghill)', '#6E4A2A', 3))
    for _ in range(140):
        x, y = R.uniform(720, 1450), R.uniform(420, 740)
        if y < 330 + (x - 700) * .35 or y > 760: continue
        g.append(line([(x, y), (x + R.uniform(-6, 6), y - R.uniform(10, 22))], '#7A5230', 2, 'opacity=".6"'))
    top = [(650, 420), (700, 372), (760, 342), (820, 320), (880, 302), (940, 290), (1000, 280), (1035, 272)]
    g.append(poly(top + [(1040, 380), (960, 420), (860, 462), (760, 522), (700, 600), (662, 700), (640, 640), (630, 520)], P['wface'], '#8C7656', 3))
    for k in range(1, 6):
        t = k / 6; g.append(line([lerp(a, b, t) for a, b in zip(top, [(630, 520), (700, 600), (760, 522), (860, 462), (960, 420), (1000, 400), (1040, 380), (1040, 380)])], '#C8B08A', 2))
    for (x, y), (tx, ty) in along(top, 16):
        nx, ny = ty, -tx
        if ny > 0: nx, ny = -nx, -ny
        w, h = 16, 26; q = [(x - tx * w, y - ty * w), (x + tx * w, y + ty * w), (x + tx * w + nx * h, y + ty * w + ny * h), (x - tx * w + nx * h, y - ty * w + ny * h)]
        g.append(poly(q, P['wtop'], INK, 2))
    left_out = [(590, 425), (500, 520), (470, 650), (480, 800), (520, 900)]; left_in = [(645, 440), (612, 540), (600, 680), (622, 800), (665, 862)]
    g.append(poly(left_out + left_in[::-1], P['wwalk'], INK, 3))
    for i in range(1, 26):
        t = i / 26; a = lerp(left_out[0], left_out[-1], t); a = (edge_x(left_out, a[1]), a[1]); b = (edge_x(left_in, a[1]), a[1])
        g.append(line([a, b], '#4E4B52', 2))
    for (x, y), (tx, ty) in along(left_out, 12):
        g.append(poly([(x - 10, y), (x + 4, y), (x + 4, y - 22), (x - 10, y - 22)], P['merl_lit'], INK, 2))
    g.append(poly([(735, 330), (735, 245), (1030, 245), (1030, 330)], P['tower'], INK, 3))
    g.append(poly([(790, 245), (800, 200), (950, 195), (968, 245)], P['roof'], INK, 3))
    for x in range(750, 1030, 34): g.append(poly([(x, 250), (x + 16, 250), (x + 16, 232), (x, 232)], P['tower'], INK, 2))
    g.append(poly([(205, 540), (205, 420), (300, 410), (300, 540)], '#8E8478', INK, 3))
    g.append(poly([(280, 335), (370, 322), (445, 432), (300, 444)], P['roof'], INK, 3))
    # --- the near wall crossing the frame, the walkway behind it, and the dry grass on the hillside ---
    g = L['near']
    c0, c1 = GW_C0, GW_C1
    g.append(poly([c0, c1, (1660, 930), (600, 930)], P['nwall'], INK, 3))
    for i in range(10):
        y = 820 + i * 12; g.append(line([(610, y + (c0[1] - 800)), (1650, y - 100 + (c1[1] - 700) + 100)], '#5A5660', 1.5))
    for i in range(GW_NM):
        a = lerp(c0, c1, (i + .15) / GW_NM); b = lerp(c0, c1, (i + .78) / GW_NM)
        m = [(a[0], a[1]), (b[0], b[1]), (b[0], b[1] - 74), (a[0], a[1] - 74)]
        g.append(poly(m, P['merl'], INK, 3)); g.append(poly([m[3], m[2], (m[2][0] + 10, m[2][1] - 9), (m[3][0] + 10, m[3][1] - 9)], P['merl_lit'], INK, 2))
        g.append(line([(m[1][0] - 3, m[1][1] - 6), (m[2][0] - 3, m[2][1] + 6)], P['merl_lit'], 6))
    g.append(poly([(560, 925), (1660, 925), (1660, 1000), (1255, 882), (900, 1000), (600, 1100), (300, 1190), (0, 1273), (-E, 1390), (-E, 1000), (560, 960)], P['wwalk'], INK, 3))
    RG = random.Random(58)
    for _ in range(560):
        x, y = RG.uniform(-E, 660), RG.uniform(640, 1250)
        if y > 1265 - x * .3: continue
        a = RG.uniform(-1.9, -1.2); Ln = RG.uniform(30, 90)
        g.append(line([(x, y), (x + math.cos(a) * Ln, y + math.sin(a) * Ln)], RG.choice([P['grass'], P['grass_d'], '#E2B97A']), RG.uniform(2, 4)))
    # --- foreground: the light gap, stairs, the right block, the left parapet ---
    g = L['fg']
    g.append(poly([(1600, 900), (1720, 900), (1730, H + 40), (1600, H + 40)], '#EFE3CB', 'none', 0))
    wl = [(1273, 912), (1182, 1073), (1018, 1255), (855, 1509), (800, 1717), (790, H + 60)]
    wr = [(1625, 905), (1636, 982), (1673, 1345), (1691, 1717), (1693, H + 60)]
    g.append(poly(wl + wr[::-1], P['tread'], INK, 3))
    y, step = 1717 + 40, 96
    while y > 912 and step > 9:
        y2 = y - step; a, b = (edge_x(wl, y2), y2), (edge_x(wr, y2), y2)
        g.append(poly([a, b, (b[0], y2 + step * .32), (a[0], y2 + step * .32)], P['riser'], 'none', 0))
        g.append(line([a, b], INK, 2.5))
        for k in range(1, 4):
            t = k / 4 + R.uniform(-.06, .06); x = a[0] + (b[0] - a[0]) * t; g.append(line([(x, y2 + step * .32), (x, y - 2)], '#5E6377', 1.5))
        y = y2; step *= .9
    g = L['fg2']
    g.append(poly([(1700, H + 60), (1672, 650), (2300, 540), (2300, H + 60)], P['blk_dark'], INK, 3))
    for i in range(14):
        yl = 690 + i * 88; yr = 580 + i * 98; g.append(line([(1680, yl), (2300, yr)], '#B9AFA4', 3, 'opacity=".55"'))
        for k in range(4):
            x = 1720 + k * 150 + (i % 2) * 70; t = (x - 1680) / 620; yy = yl + (yr - yl) * t
            g.append(line([(x, yy), (x, yy + 80)], '#B9AFA4', 2, 'opacity=".4"'))
    g.append(poly([(1650, 600), (2290, 440), (2576, 470), (W + E, 500), (W + E, 590), (2576, 562), (2300, 540), (1672, 650)], P['blk_top'], INK, 3))
    g.append(poly([(2300, 540), (2576, 562), (W + E, 590), (W + E, H + 60), (2300, H + 60)], P['blk_lit'], INK, 3))
    cap_top = [(-E, 1390), (0, 1273), (300, 1190), (600, 1100), (900, 1000), (1255, 882)]; cap_bot = [(-E, 1610), (0, 1473), (300, 1370), (600, 1260), (900, 1130), (1262, 936)]
    g.append(poly(cap_bot + [(1273, 960), (1182, 1073), (1018, 1255), (855, 1509), (800, 1717), (790, H + 60), (-E, H + 60)], P['pface'], INK, 3))
    cap_mid = [lerp(p, q, .42) for p, q in zip(cap_top, cap_bot)]
    st, sm_, sb = along(cap_top, 10), along(cap_mid, 10), along(cap_bot, 10)
    for i in range(10):
        g.append(poly([st[i][0], st[i + 1][0], sm_[i + 1][0], sm_[i][0]], P['pcap'], INK, 2.5))
        g.append(poly([sm_[i][0], sm_[i + 1][0], sb[i + 1][0], sb[i][0]], P['pcap_d'], INK, 2.5))
    g.append(poly([(745, 1215), (790, 1200), (820, 1430), (800, 1480), (760, 1470)], P['pcap'], INK, 2))
    for i in range(16):
        y0 = 1500 + i * 17; g.append(line([(-E, y0 + 60), (edge_x(wl, max(960, y0 - 420 + i * 6)) - 4, y0 - 420 + i * 6)], '#53505A', 1.5))
    # the modern things that fade when time runs back: railings and the 春 sign
    rl = [(236, 1717), (500, 1500), (745, 1330), (1000, 1150), (1273, 927), (1500, 905)]
    rr = [(1609, 909), (1640, 1050), (1680, 1250), (1727, 1345), (1818, 1618), (1891, 1717)]
    g = L['rails']
    for r in (rl, rr):
        g.append(line(r, INK, 18)); g.append(line(r, P['rail'], 11)); g.append(line([(x - 2, y - 3) for x, y in r], P['rail_hi'], 3))
    for x, y in [(500, 1500), (745, 1330), (1255, 940), (1680, 1250), (1800, 1580)]:
        g.append(line([(x, y), (x, y + 230 * (y / 1717))], INK, 15)); g.append(line([(x, y), (x, y + 230 * (y / 1717))], P['rail'], 9))
    L['sign'].append('<text x="2440" y="640" font-family="Noto Serif CJK SC" font-weight="700" font-size="64" fill="#7B6248" opacity=".75">春</text>')
    return defs, {k: '\n'.join(v) for k, v in L.items()}


# =====================================================================================================
# shared page parts: the 你 rig in JS (a port of you_figure.figure + opt_comp.arms), the bubble, easing
# =====================================================================================================
YOU_DEFS = ('<linearGradient id="gwf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3DE"/><stop offset=".55" stop-color="#F1E3D0"/><stop offset="1" stop-color="#B7B2B4"/></linearGradient>'
            '<linearGradient id="dusk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF0DA"/><stop offset=".5" stop-color="#EBD9C6"/><stop offset="1" stop-color="#A49CA6"/></linearGradient>'
            '<filter id="yds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="6" dy="12" stdDeviation="12" flood-color="#1A1410" flood-opacity=".3"/></filter>'
            '<filter id="csb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>')
BUBBLE = ('<g id="bub"><g id="bubs">'
          '<path d="M-14,-40 L0,-6 L14,-40 Z" fill="#F2C66E" stroke="#2A211B" stroke-width="5" stroke-linejoin="round"/>'
          '<rect x="-64" y="-134" width="128" height="96" rx="30" fill="#F2C66E" stroke="#2A211B" stroke-width="5"/>'
          '<path d="M-13,-43 L0,-12 L13,-43" fill="#F2C66E" stroke="none"/>'
          '<text x="0" y="-86" font-family="Noto Sans CJK SC" font-weight="900" font-size="66" fill="#2A211B" text-anchor="middle" dominant-baseline="central">你</text>'
          '</g></g>')
JS_COMMON = r'''
const BEAT=0.418, BAR=1.672;
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function sm(x){x=clamp(x,0,1);return x*x*(3-2*x);}
function span(t,a,b){return sm((t-a)/(b-a));}
function lin(t,a,b){return clamp((t-a)/(b-a),0,1);}
function eoc(x){x=clamp(x,0,1);return 1-Math.pow(1-x,3);}
function eio(x){x=clamp(x,0,1);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function back(x){x=clamp(x,0,1);const c1=2.2,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);}
function mix(a,b,u){return a+(b-a)*u;}
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// keyframe track: [[t, value], ...] eased between keys (value: number or array)
function track(K,t,ease){ease=ease||sm;if(t<=K[0][0])return K[0][1];for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(t<=b[0]){const u=ease((t-a[0])/(b[0]-a[0]));if(Array.isArray(a[1]))return a[1].map((v,j)=>mix(v,b[1][j],u));return mix(a[1],b[1],u);}}return K[K.length-1][1];}
// ---- the 你 rig: a port of you_figure.figure (face variant, no tag) ----
function f1(v){return v.toFixed(1);}
function midp(a,b,t){t=t===undefined?.5:t;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
function bez(a,c,b,n){const o=[];for(let i=0;i<=n;i++){const t=i/n;o.push([(1-t)*(1-t)*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*c[1]+t*t*b[1]]);}return o;}
function limb(a,e,b,w0,w1,fill){const c=[2*e[0]-(a[0]+b[0])/2,2*e[1]-(a[1]+b[1])/2];const P=bez(a,c,b,24),L=[],R=[];
  for(let i=0;i<P.length;i++){const j=Math.min(i+1,P.length-1),k=Math.max(i-1,0);const dx=P[j][0]-P[k][0],dy=P[j][1]-P[k][1];const d=Math.hypot(dx,dy)||1;const nx=-dy/d,ny=dx/d;const w=(w0+(w1-w0)*i/(P.length-1))/2;L.push([P[i][0]+nx*w,P[i][1]+ny*w]);R.push([P[i][0]-nx*w,P[i][1]-ny*w]);}
  const pl=L.concat(R.reverse());return '<path d="M'+pl.map(p=>f1(p[0])+','+f1(p[1])).join(' L')+'Z" fill="'+fill+'"/><circle cx="'+f1(a[0])+'" cy="'+f1(a[1])+'" r="'+f1(w0/2)+'" fill="'+fill+'"/>';}
function figureSVG(J,u,face,tilt,fill){
  const nk=J.neck,hc=midp(J.l_hip,J.r_hip),tl=Math.hypot(nk[0]-hc[0],nk[1]-hc[1]);const side=J.r_shoulder[0]>J.l_shoulder[0]?1:-1;
  const lr=[nk[0]-side*u*.3,nk[1]+tl*.14],rr=[nk[0]+side*u*.3,nk[1]+tl*.14],lh=[hc[0]-side*u*.17,hc[1]],rh=[hc[0]+side*u*.17,hc[1]];let g='';
  for(const [root,e,w] of [[lr,'l_elbow','l_wrist'],[rr,'r_elbow','r_wrist']]){g+=limb(root,J[e],J[w],u*.15,u*.095,fill);g+='<circle cx="'+f1(J[w][0])+'" cy="'+f1(J[w][1])+'" r="'+f1(u*.072)+'" fill="'+fill+'"/>';}
  for(const [root,k,a] of [[lh,'l_knee','l_ankle'],[rh,'r_knee','r_ankle']]){if(!J[k])continue;g+=limb(root,J[k],J[a],u*.19,u*.12,fill);const fx=J[a][0]>=root[0]?1:-1;
    g+='<ellipse cx="'+f1(J[a][0]+fx*u*.05)+'" cy="'+f1(J[a][1]+u*.03)+'" rx="'+f1(u*.11)+'" ry="'+f1(u*.065)+'" fill="'+fill+'"/>';}
  const wc=u*.34,ww=u*.3,wh=u*.36;
  const body='M'+f1(nk[0]-wc)+','+f1(nk[1]+tl*.08)+' C'+f1(nk[0]-wc*1.05)+','+f1(nk[1]-tl*.06)+' '+f1(nk[0]+wc*1.05)+','+f1(nk[1]-tl*.06)+' '+f1(nk[0]+wc)+','+f1(nk[1]+tl*.08)+' '
    +'C'+f1(nk[0]+ww*1.05)+','+f1(nk[1]+tl*.5)+' '+f1(hc[0]+wh*1.15)+','+f1(hc[1]+tl*.02)+' '+f1(hc[0]+wh*.6)+','+f1(hc[1]+tl*.13)+' '
    +'Q'+f1(hc[0])+','+f1(hc[1]+tl*.2)+' '+f1(hc[0]-wh*.6)+','+f1(hc[1]+tl*.13)+' C'+f1(hc[0]-wh*1.15)+','+f1(hc[1]+tl*.02)+' '+f1(nk[0]-ww*1.05)+','+f1(nk[1]+tl*.5)+' '+f1(nk[0]-wc)+','+f1(nk[1]+tl*.08)+' Z';
  g+='<path d="'+body+'" fill="'+fill+'"/>';
  const hx=J.head[0],hy=J.head[1],hr=u*.28;
  g+='<g transform="rotate('+tilt.toFixed(2)+' '+f1(hx)+' '+f1(hy)+')"><ellipse cx="'+f1(hx)+'" cy="'+f1(hy)+'" rx="'+f1(hr)+'" ry="'+f1(hr*1.08)+'" fill="'+fill+'"/>';
  if(face){const ex=hr*.34,ey=hr*.05;
    g+='<ellipse cx="'+f1(hx-ex)+'" cy="'+f1(hy+ey)+'" rx="'+f1(hr*.075)+'" ry="'+f1(hr*.1)+'" fill="#2B2724"/><ellipse cx="'+f1(hx+ex)+'" cy="'+f1(hy+ey)+'" rx="'+f1(hr*.075)+'" ry="'+f1(hr*.1)+'" fill="#2B2724"/>'
      +'<path d="M'+f1(hx-hr*.16)+','+f1(hy+hr*.3)+' Q'+f1(hx)+','+f1(hy+hr*.45)+' '+f1(hx+hr*.16)+','+f1(hy+hr*.3)+'" fill="none" stroke="#2B2724" stroke-width="'+f1(hr*.055)+'" stroke-linecap="round"/>'
      +'<circle cx="'+f1(hx-hr*.56)+'" cy="'+f1(hy+hr*.3)+'" r="'+f1(hr*.14)+'" fill="#F4A9A0" opacity=".45"/><circle cx="'+f1(hx+hr*.56)+'" cy="'+f1(hy+hr*.3)+'" r="'+f1(hr*.14)+'" fill="#F4A9A0" opacity=".45"/>';}
  g+='</g>';return '<g filter="url(#yds)">'+g+'</g>';}
// pose in rig units (feet at 0,0; standing height ~334): crouch, lean (deg, + = toward screen right), head look, arm angles (opt_comp.arms)
function poseJ(p){
  const c=p.crouch||0, lean=(p.lean||0)*Math.PI/180, look=p.look||0, sp=p.spread||0;
  const hipY=-120+34*c;
  const J={l_hip:[-22,hipY],r_hip:[22,hipY],l_knee:[-25-26*c-sp*.4,-60+12*c],r_knee:[25+26*c+sp*.4,-60+12*c],l_ankle:[-26-sp,0],r_ankle:[26+sp,0]};
  if(p.stepL){J.l_knee=[J.l_knee[0]-4,J.l_knee[1]-16*p.stepL];J.l_ankle=[J.l_ankle[0]-6*p.stepL,-30*p.stepL];}
  if(p.stepR){J.r_knee=[J.r_knee[0]+4,J.r_knee[1]-16*p.stepR];J.r_ankle=[J.r_ankle[0]+6*p.stepR,-30*p.stepR];}
  const up={head:[look,-298],neck:[0,-262],l_shoulder:[-55,-250],r_shoulder:[55,-250]};
  const cy=hipY, dy=34*c;
  for(const k in up){let x=up[k][0],y=up[k][1]+dy-cy;const xr=x*Math.cos(lean)-y*Math.sin(lean),yr=x*Math.sin(lean)+y*Math.cos(lean);J[k]=[xr,yr+cy];}
  // arms: angles in degrees, 0 = screen right, 90 = down
  const nk=J.neck,hc=midp(J.l_hip,J.r_hip),ry=nk[1]+Math.hypot(nk[0]-hc[0],nk[1]-hc[1])*.14;
  for(const [s,ang,sx] of [['r',p.r,1],['l',p.l,-1]]){const x0=nk[0]+sx*36;const a0=ang[0]*Math.PI/180,a1=ang[1]*Math.PI/180;
    const e=[x0+64*Math.cos(a0),ry+64*Math.sin(a0)];J[s+'_elbow']=e;J[s+'_wrist']=[e[0]+60*Math.cos(a1),e[1]+60*Math.sin(a1)];}
  return J;}
// place pose units into screen: feet at (bx,by), scale s (px per unit), optional squash about the feet
function placeJ(J,bx,by,s,sqx,sqy){const o={};for(const k in J)o[k]=[bx+J[k][0]*s*(sqx||1),by+J[k][1]*s*(sqy||1)];return o;}
function setBubble(el,hx,htop,t,sc){const pop=t<0?0:back(t/0.4);const bob=Math.sin(t*2*Math.PI/(2*BEAT))*4;
  el.setAttribute('transform','translate('+f1(hx)+','+f1(htop-8+bob)+') scale('+(Math.max(0.001,(0.4+0.6*pop))*(sc||1)).toFixed(3)+')');el.setAttribute('opacity',t<0?0:Math.min(1,t/0.08).toFixed(2));}
'''


def page(title, dur, body, js, extra_head=''):
    return f'''<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<link rel="stylesheet" href="{WENKAI}">
<style>html,body{{margin:0;background:#000}} #f svg{{position:absolute;left:0;top:0}} {extra_head}</style></head><body>
<div id="f" style="position:relative;width:1920px;height:1080px;overflow:hidden">
{body}
</div>
<script>
window.DUR={dur};
{JS_COMMON}
{js}
window.render(0);
</script></body></html>'''


# =====================================================================================================
# greatwall_when: 时光倒流
# =====================================================================================================
def ming_flag_defs():
    return ''

def when_page():
    defs, Ly = gw_layers()
    # Ming banners: poles on four merlons of the near wall (photo coords: merlon top centre)
    flags = []
    for j, i in enumerate((1, 4, 7, 10)):
        a = lerp(GW_C0, GW_C1, (i + .15) / GW_NM); b = lerp(GW_C0, GW_C1, (i + .78) / GW_NM)
        flags.append(((a[0] + b[0]) / 2 + 4, (a[1] + b[1]) / 2 - 78))
    flag_svg = ''
    for j, (x, y) in enumerate(flags):
        flag_svg += (f'<g id="fl{j}" transform="translate({x:.1f},{y:.1f})"><g id="fls{j}">'
                     f'<line x1="0" y1="0" x2="0" y2="-150" stroke="{INK}" stroke-width="9" stroke-linecap="round"/>'
                     f'<line x1="0" y1="0" x2="0" y2="-150" stroke="#7A5232" stroke-width="5" stroke-linecap="round"/>'
                     f'<circle cx="0" cy="-154" r="7" fill="#E4B878" stroke="{INK}" stroke-width="2.5"/>'
                     f'<path id="flp{j}" d="" fill="#B8322A" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
                     f'<path id="flb{j}" d="" fill="none" stroke="#F2C66E" stroke-width="7" stroke-linejoin="round"/>'
                     f'</g></g>')
    # two Ming guards on the landing (silhouettes with a red tassel helmet and a spear), walking left
    def guard(id_):
        dark = '#2B221D'
        legs = lambda k: (f'<polyline points="-4,-40 {-6 - 6 * k},-20 {-8 - 9 * k},0" fill="none" stroke="{dark}" stroke-width="7" stroke-linecap="round"/>'
                          f'<polyline points="4,-40 {5 + 5 * k},-20 {8 + 8 * k},0" fill="none" stroke="{dark}" stroke-width="7" stroke-linecap="round"/>')
        return (f'<g id="{id_}"><g class="la">{legs(1)}</g><g class="lb" style="display:none">{legs(-1)}</g>'
                f'<polygon points="-12,-76 12,-76 15,-40 13,-30 -13,-30 -15,-40" fill="{dark}"/>'
                f'<polygon points="-11,-62 11,-62 12,-56 -12,-56" fill="#8E3A2E"/>'
                f'<ellipse cx="0" cy="-86" rx="8" ry="9" fill="{dark}"/>'
                f'<path d="M-12,-90 Q0,-108 12,-90 Z" fill="{dark}"/><line x1="0" y1="-104" x2="0" y2="-112" stroke="{dark}" stroke-width="3"/>'
                f'<circle cx="0" cy="-113" r="4.5" fill="#C23B2E"/>'
                f'<line x1="-14" y1="-70" x2="-20" y2="-50" stroke="{dark}" stroke-width="6" stroke-linecap="round"/>'
                f'<line x1="-22" y1="6" x2="-22" y2="-150" stroke="{dark}" stroke-width="4"/><polygon points="-26,-150 -22,-166 -18,-150" fill="{dark}"/>'
                f'<circle cx="-22" cy="-146" r="4" fill="#C23B2E"/></g>')
    guards = f'<g id="gds" opacity="0">{guard("g0")}{guard("g1")}</g>'
    body = f'''
<div id="world" style="position:absolute;left:0;top:0;width:1920px;height:1080px">
<svg id="scene" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>{defs}</defs>
<g id="cam">
<g id="Lsky">{Ly["sky"]}</g>
<g id="Lhills">{Ly["hills"]}</g>
<g id="Lmon">{Ly["mon"]}</g>
<g id="Lnear">{Ly["near"]}{flag_svg}{guards}</g>
<g id="Lfg">{Ly["fg"]}{Ly["fg2"]}<g id="rails">{Ly["rails"]}</g><g id="sign">{Ly["sign"]}</g></g>
</g></svg></div>
<svg id="you" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>{YOU_DEFS}</defs>
<g id="youcam"><ellipse id="csh" cx="0" cy="0" rx="10" ry="3" fill="#1A1410" opacity=".32" filter="url(#csb)"/><g id="fig"></g></g>{BUBBLE}</svg>
<svg id="grain" width="1920" height="1080" viewBox="0 0 1920 1080" style="pointer-events:none">
<defs><radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".55" stop-color="#2A1A0C" stop-opacity="0"/><stop offset="1" stop-color="#2A1A0C" stop-opacity=".75"/></radialGradient></defs>
<rect id="vigr" width="1920" height="1080" fill="url(#vig)" opacity="0"/>
<rect id="flick" width="1920" height="1080" fill="#FFF3DC" opacity="0"/>
<g id="specks"></g><g id="scr"></g></svg>
<div id="ctr"><div id="digs"></div><div id="lab">年 · 明朝</div></div>
'''
    css = ('#ctr{position:absolute;left:0;top:0;transform-origin:0 0;font-family:"Noto Sans CJK SC";font-weight:900;color:#FFF6E6;}'
           '#digs{position:absolute;left:0;top:0;display:flex;}'
           '.wh{position:relative;width:118px;height:236px;overflow:hidden;-webkit-mask-image:linear-gradient(transparent 0,#000 22%,#000 78%,transparent 100%);}'
           '.col{position:absolute;left:0;top:0;width:118px;text-align:center;font-size:196px;line-height:236px;'
           'text-shadow:0 8px 0 #2A211B,0 0 22px rgba(42,33,27,.55);}'
           '#lab{position:absolute;white-space:nowrap;font-size:66px;line-height:66px;text-shadow:0 5px 0 #2A211B,0 0 16px rgba(42,33,27,.6);transform-origin:0 50%;}')
    js = r'''
const K0=1920/2576, OY=60;
const FL=%s;
const D={sky:.12,hills:.32,mon:.5,near:.74,fg:1.0};
// the year wheels
const digs=document.getElementById('digs');const cols=[];
for(let i=0;i<4;i++){const w=document.createElement('div');w.className='wh';const c=document.createElement('div');c.className='col';
  c.innerHTML=[0,1,2,3,4,5,6,7,8,9,0].join('<br>');w.appendChild(c);digs.appendChild(w);cols.push(c);}
const CX=975, CY=372;   // counter box (left, top of the wheels)
const lab=document.getElementById('lab');lab.style.left=(4*118+18)+'px';lab.style.top=(236/2+30)+'px';
function yearAt(t){const u=lin(t,0.15,1.672);const e=1-Math.pow(1-u,3.4);return 2026-(2026-1505)*e;}
function wheels(v){const p=[];for(let k=0;k<4;k++){const m=Math.pow(10,k);let base=Math.floor(v/m);let low=v-base*m;let fr=0;if(k>0&&low>m-1)fr=low-(m-1);p.push(base+fr);}return p.reverse();}
// camera: dolly in on 你, truck and crane a little, slight roll; a small shake on the landing
function cam(t){const u=eio(lin(t,0.12,3.344));const z=1+0.24*u+0.03*Math.exp(-Math.pow((t-1.672)/0.12,2))*(t>1.672?1:0);
  const roll=-1.1*span(t,0.15,1.5)+1.1*span(t,1.672,3.3)*0.8;let sx=0,sy=0;if(t>=1.672&&t<1.80){const r=rng(Math.floor(t*30)*7+3);sx=(r()-.5)*7;sy=(r()-.5)*7;}
  return {z:z,fx:790,fy:900-40*u,tx:-70*u+sx,ty:28*u+sy,roll:roll};}
function LT(d,c){const s=1+(c.z-1)*d;const sc=s*K0;const tx=c.fx*(1-s)+c.tx*d;const ty=c.fy*(1-s)-s*K0*OY+c.ty*d;return [sc,tx,ty];}
function mstr(m){return 'matrix('+m[0].toFixed(5)+',0,0,'+m[0].toFixed(5)+','+m[1].toFixed(2)+','+m[2].toFixed(2)+')';}
// 你: keyed pose (rig units), feet on the stairs at photo (1062,1400)
const YB=[1050,1405], YS=1.2;
const KP={ // [t, value]
  crouch:[[0,0],[0.40,0],[0.47,.18],[0.56,0],[0.95,0],[1.08,.42],[1.45,.42],[1.56,.55],[1.672,.1],[1.76,.22],[1.9,0],[2.09,.14],[2.2,0],[2.51,.12],[2.62,0],[2.93,.14],[3.04,0],[3.344,.1]],
  hop:[[0,0],[0.42,0],[0.50,22],[0.58,0],[1.56,0],[1.62,28],[1.672,0],[3.344,0]],
  lean:[[0,0],[0.6,-6],[0.78,-7],[0.92,7],[1.06,4],[1.2,0],[1.5,-3],[1.672,7],[2.4,6],[2.55,-2],[2.85,-2],[3.0,6],[3.344,6]],
  look:[[0,0],[0.6,-7],[0.78,-8],[0.92,8],[1.06,6],[1.2,0],[1.672,5],[2.45,5],[2.6,-6],[2.88,-6],[3.0,5],[3.344,5]],
  tilt:[[0,4],[0.42,2],[0.6,-12],[0.78,-14],[0.92,13],[1.06,10],[1.2,0],[1.4,-4],[1.672,10],[2.45,9],[2.6,-12],[2.88,-12],[3.0,10],[3.344,10]],
  r:[[0,[58,84]],[0.42,[58,84]],[0.5,[12,40]],[0.95,[18,44]],[1.1,[-30,-153]],[1.5,[-30,-153]],[1.6,[-10,-40]],[1.672,[-34,-36]],[3.344,[-34,-36]]],
  l:[[0,[122,96]],[0.42,[122,96]],[0.5,[168,140]],[0.95,[162,136]],[1.1,[210,333]],[1.5,[210,333]],[1.6,[150,120]],[1.672,[122,98]],[3.344,[122,98]]],
};
const fig=document.getElementById('fig'),csh=document.getElementById('csh'),bub=document.getElementById('bub');
function you(t,c){const m=LT(D.fg,c);const s=YS*m[0];const bx=m[0]*YB[0]+m[1],by=m[0]*YB[1]+m[2];
  const p={crouch:track(KP.crouch,t),lean:track(KP.lean,t),look:track(KP.look,t),r:track(KP.r,t),l:track(KP.l,t)};
  // grabbing the head: a little shiver; idle breathing throughout
  const shiver=(t>1.1&&t<1.5)?Math.sin(t*2*Math.PI*9)*1.5:0;const br=Math.sin(t*2*Math.PI/(4*BEAT))*.012;
  const hop=track(KP.hop,t,x=>Math.sin(x*Math.PI/2));
  const face=t>=0.45;const turn=(t>=0.40&&t<0.50)?1-Math.abs(t-0.45)/0.05*0.9:0;   // the turn: a squash in x
  let sqx=1-0.22*Math.max(0,1-Math.abs(t-0.45)/0.06), sqy=1+br;
  const land=Math.max(0,1-Math.abs(t-1.69)/0.07);sqy*=1-0.07*land;sqx*=1+0.06*land;
  const J=placeJ(poseJ(p),bx+shiver*s,by-hop*s,s,sqx,sqy);
  fig.innerHTML=figureSVG(J,120*s,face,track(KP.tilt,t)+(face?0:0),'url(#gwf)');
  csh.setAttribute('cx',f1(bx));csh.setAttribute('cy',f1(by+4*s));csh.setAttribute('rx',f1(56*s*(1-hop/80)));csh.setAttribute('ry',f1(10*s));
  const ht=J.head[1]-120*s*.28*1.08;setBubble(bub,J.head[0],ht-6,t,1);}
// banners and guards
const flp=[0,1,2,3].map(j=>document.getElementById('flp'+j)),flb=[0,1,2,3].map(j=>document.getElementById('flb'+j)),fls=[0,1,2,3].map(j=>document.getElementById('fls'+j));
function flag(j,t){const N=8,Wd=120,Hd=70;let top=[],bot=[];for(let i=0;i<=N;i++){const x=i/N;const w=Math.sin(t*7.5-x*4.2+j)*12*x;const sag=x*x*10;top.push([x*Wd,-148+w+sag]);bot.push([x*Wd*(1-0.12*x),-148+Hd*(1-0.55*x)+w*1.15+sag]);}
  const all=top.concat(bot.reverse());flp[j].setAttribute('d','M'+all.map(p=>f1(p[0])+','+f1(p[1])).join(' L')+' Z');
  const edge=top.slice(0,N+1);flb[j].setAttribute('d','M'+edge.map(p=>f1(p[0])+','+f1(p[1]+7)).join(' L'));}
const g0=document.getElementById('g0'),g1=document.getElementById('g1'),gds=document.getElementById('gds');
function guards(t){gds.setAttribute('opacity',t>1.7?1:0);
  [[g0,1050,0],[g1,1180,0.21]].forEach(([g,x0,ph])=>{const x=x0-260*lin(t,1.75,3.344);const y=800+(745-800)*(x-690)/(1650-690);const step=Math.floor((t+ph)/0.209)%%2;const bob=Math.abs(Math.sin((t+ph)*Math.PI/0.209))*3;
    g.setAttribute('transform','translate('+f1(x)+','+f1(y-2-bob)+') scale(0.8)');g.querySelector('.la').style.display=step?'none':'';g.querySelector('.lb').style.display=step?'':'none';});}
// grain, scratches, flicker
const specks=document.getElementById('specks'),scr=document.getElementById('scr');
for(let i=0;i<70;i++){const c=document.createElementNS('http://www.w3.org/2000/svg','ellipse');specks.appendChild(c);}
for(let i=0;i<5;i++){const l=document.createElementNS('http://www.w3.org/2000/svg','path');l.setAttribute('fill','none');l.setAttribute('stroke-linecap','round');scr.appendChild(l);}
function grain(t,a){const n=Math.floor(t*24+1e-6);const r=rng(n*131+17);
  for(const c of specks.children){const big=r()<.15;c.setAttribute('cx',f1(r()*1920));c.setAttribute('cy',f1(r()*1080));c.setAttribute('rx',f1(big?2+r()*4:0.8+r()*1.6));c.setAttribute('ry',f1(big?1.5+r()*3:0.8+r()*1.6));
    c.setAttribute('fill',r()<.6?'#2A211B':'#FFF6E6');c.setAttribute('opacity',(a*(.25+.55*r())).toFixed(2));}
  let i=0;for(const l of scr.children){const on=r()<.6;const x=r()*1920,w=r()*14-7;l.setAttribute('d','M'+f1(x)+',-10 Q'+f1(x+w)+',540 '+f1(x-w*.6)+',1090');l.setAttribute('stroke',i%%2?'#FFF6E6':'#3A2A1C');
    l.setAttribute('stroke-width',f1(0.8+r()*1.8));l.setAttribute('opacity',on?(a*(.18+.3*r())).toFixed(2):0);i++;}
  document.getElementById('flick').setAttribute('opacity',(a*(.02+.07*r())).toFixed(3));}
const world=document.getElementById('world'),camg=document.getElementById('cam'),ycam=document.getElementById('youcam');
const LY={sky:document.getElementById('Lsky'),hills:document.getElementById('Lhills'),mon:document.getElementById('Lmon'),near:document.getElementById('Lnear'),fg:document.getElementById('Lfg')};
const rails=document.getElementById('rails'),sign=document.getElementById('sign'),ctr=document.getElementById('ctr');
window.render=function(t){
  const c=cam(t);for(const k in LY)LY[k].setAttribute('transform',mstr(LT(D[k],c)));
  const rot='rotate('+c.roll.toFixed(3)+' 960 540)';camg.setAttribute('transform',rot);ycam.setAttribute('transform',rot);
  // time runs back: colour drains to sepia, the grain and the vignette come up
  const sp=span(t,0.15,1.0);const back_=span(t,1.75,2.6);world.style.filter='sepia('+(0.88*sp-0.2*back_).toFixed(3)+') saturate('+(1-0.25*sp+0.3*back_).toFixed(3)+') contrast('+(1+0.08*sp).toFixed(3)+') brightness('+(1-0.04*sp+0.03*Math.sin(t*41)*sp).toFixed(3)+')';
  document.getElementById('vigr').setAttribute('opacity',(0.85*sp).toFixed(3));grain(t,sp);
  // the past returns after the landing
  const past=span(t,1.75,2.5);rails.setAttribute('opacity',(1-past).toFixed(3));sign.setAttribute('opacity',(1-past).toFixed(3));
  for(let j=0;j<4;j++){const t0=1.672+0.209*j+0.1;const g=t<t0?0:back((t-t0)/0.36);fls[j].setAttribute('transform','scale(1,'+Math.max(0.001,g).toFixed(3)+')');fls[j].setAttribute('opacity',t<t0?0:1);flag(j,t);}
  guards(t);
  you(t,c);
  // the counter: in at 0.15, rolls 2026 → 1505, lands on 1.672 with a punch; the label pops then
  const v=yearAt(t);const P=wheels(v);for(let i=0;i<4;i++){const q=((P[i]%%10)+10)%%10;cols[i].style.transform='translateY('+(-q*236).toFixed(1)+'px)';}
  const vin=back(lin(t,0.12,0.40));const punch=t>=1.672?1+0.15*Math.exp(-(t-1.672)/0.07):1;const sc=(0.5+0.5*vin)*punch;
  ctr.style.opacity=t<0.12?0:Math.min(1,(t-0.12)/0.1).toFixed(2);
  const cw=4*118, ch=236;ctr.style.transform='translate('+(CX+cw/2)+'px,'+(CY+ch/2)+'px) scale('+sc.toFixed(4)+') translate('+(-cw/2)+'px,'+(-ch/2)+'px)';
  const lp=t<1.672?0:back((t-1.672)/0.3);lab.style.opacity=t<1.672?0:Math.min(1,(t-1.672)/0.06);lab.style.transform='scale('+(0.5+0.5*lp).toFixed(3)+')';
};
''' % json.dumps(flags)
    return page('greatwall_when', 3.344, body, js, css)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    open(f'{out}/greatwall_when.html', 'w').write(when_page())
    if 'what_page' in globals(): open(f'{out}/greatwall_what.html', 'w').write(what_page())
    print('ok', out)
