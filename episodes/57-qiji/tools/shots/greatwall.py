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
# greatwall_when: 穿越时间轴 on blueprint. The camera trucks right → left along a year ruler (2026 → 1505),
# 你 runs on the ruler and skids to a stop on the bar; the year lands with 年 · 明朝; then a wall and a
# watchtower draw themselves in chalk with construction marks (guidelines, scaffold, hoist, dimensions, workers).
# =====================================================================================================
BP_K = 1.15            # px per year on the ruler (fastest layer, the 1.4x foreground, peaks at ~24 px/frame)
BP_Y = 870             # the ruler's top edge (你 runs on it)
BP_X = 880             # 你's screen x while running; the year under 你 is the year shown
BP_LAND = (1505 - 2026) * BP_K
CHALK = '#EEF3FA'
BP_HILL = [(70, 870), (140, 850), (205, 806), (272, 744), (335, 698), (400, 674), (450, 670), (505, 682), (565, 718), (625, 770), (672, 826), (705, 870)]

def wx(year): return BP_X + (year - 2026) * BP_K

def catmull(P, n=8):
    """a smooth path through points (Catmull-Rom → cubic Bézier), as an SVG d string"""
    d = f'M{P[0][0]:.1f},{P[0][1]:.1f}'
    for i in range(len(P) - 1):
        p0 = P[max(i - 1, 0)]; p1 = P[i]; p2 = P[i + 1]; p3 = P[min(i + 2, len(P) - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6); c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f' C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}'
    return d
def hill_y(x, H):
    for a, b in zip(H, H[1:]):
        if a[0] <= x <= b[0]: return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])
    return H[0][1] if x < H[0][0] else H[-1][1]
def dpath(pts_):
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts_)

def bp_ruler():
    g = []
    x0, x1 = wx(500), wx(2400)
    g.append(f'<defs><linearGradient id="rfade" gradientUnits="userSpaceOnUse" x1="{wx(2026):.1f}" y1="0" x2="{wx(2400):.1f}" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
             f'<mask id="rmask" maskUnits="userSpaceOnUse" x="{x0 - 10:.1f}" y="{BP_Y - 80}" width="{x1 - x0 + 20:.1f}" height="200"><rect x="{x0 - 10:.1f}" y="{BP_Y - 80}" width="{wx(2026) - x0 + 10:.1f}" height="200" fill="#fff"/><rect x="{wx(2026):.1f}" y="{BP_Y - 80}" width="{x1 - wx(2026):.1f}" height="200" fill="url(#rfade)"/></mask></defs><g mask="url(#rmask)">')
    g.append(f'<rect x="{x0:.1f}" y="{BP_Y}" width="{x1 - x0:.1f}" height="74" fill="#2A4A78" opacity=".55"/>')
    g.append(f'<line x1="{x0:.1f}" y1="{BP_Y}" x2="{x1:.1f}" y2="{BP_Y}" stroke="{CHALK}" stroke-width="3.5"/>')
    g.append(f'<line x1="{x0:.1f}" y1="{BP_Y + 74}" x2="{x1:.1f}" y2="{BP_Y + 74}" stroke="{CHALK}" stroke-width="2" opacity=".7"/>')
    for y in range(500, 2401, 10):
        x = wx(y)
        if y % 500 == 0: L, w, o = 36, 4, 1
        elif y % 100 == 0: L, w, o = 26, 2.6, .92
        elif y % 50 == 0: L, w, o = 17, 2, .7
        else: L, w, o = 10, 1.5, .5
        fade = 1
        g.append(f'<line x1="{x:.1f}" y1="{BP_Y}" x2="{x:.1f}" y2="{BP_Y + L}" stroke="{CHALK}" stroke-width="{w}" opacity="{o * fade:.2f}"/>')
        if y % 100 == 0 and fade > 0:
            big = y % 500 == 0
            g.append(f'<text x="{x:.1f}" y="{BP_Y + (66 if big else 60)}" font-family="Noto Sans CJK SC" font-weight="{900 if big else 700}" font-size="{30 if big else 24}" '
                     f'fill="{CHALK}" opacity="{(1 if big else .82) * fade:.2f}" text-anchor="middle">{y}</text>')
    g.append('</g>')
    # era tags above the ruler, in chalk letters
    for y, name, col in ((1368, '明', CHALK), (1644, '清', CHALK), (1912, '民国', CHALK), (2026, '今', '#F2C66E')):
        x = wx(y)
        g.append(f'<path d="M{x:.1f},{BP_Y} L{x:.1f},{BP_Y - 46} L{x + 12:.1f},{BP_Y - 40} L{x:.1f},{BP_Y - 34}" fill="none" stroke="{col}" stroke-width="2.6" stroke-linejoin="round" opacity=".9"/>')
        g.append(f'<text x="{x + 16:.1f}" y="{BP_Y - 12}" font-family="LXGW WenKai" font-weight="700" font-size="34" fill="{col}" opacity=".92">{name}</text>')
    return '\n'.join(g)

def bp_drawing():
    """the wall + watchtower in chalk, in landing-screen coords; every stroke carries its draw window (data-a, data-b)"""
    els = []
    def S(d, a, b, w=3.2, o=1, extra=''):
        els.append(f'<path class="ck" d="{d}" data-a="{a}" data-b="{b}" fill="none" stroke="{CHALK}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" opacity="{o}" {extra}/>')
    def dashed(P, a, b, on=14, off=10, w=1.8, o=.5):
        d = ''; segs = list(zip(P, P[1:]))
        for p, q in segs:
            L = math.dist(p, q); k = 0
            while k < L:
                e = min(L, k + on); u, v = lerp(p, q, k / L), lerp(p, q, e / L); d += f'M{u[0]:.1f},{u[1]:.1f} L{v[0]:.1f},{v[1]:.1f} '; k += on + off
        S(d, a, b, w, o)
    H = BP_HILL
    hy = lambda x: hill_y(x, H)
    # 1 · construction guidelines (dashed): tower axis, tower-top level, a compass arc
    dashed([(420, 380), (420, 900)], 1.70, 1.98, 26, 8)
    dashed([(250, 478), (640, 478)], 1.74, 2.00)
    arc = [(420 + 268 * math.cos(math.radians(a)), 684 + 268 * math.sin(math.radians(a))) for a in range(196, 345, 4)]
    dashed(arc, 1.76, 2.06, 10, 9, 1.6, .4)
    # 2 · base: the hill line, ground hatching, the foundation plinth under the tower
    S(catmull(H), 1.76, 2.12, 3.6)
    hd = ''
    for k in range(-40, 760, 26):   # 45-degree section hatching, clipped to the hill
        seg = []
        for j in range(0, 260, 4):
            x, y = k + j, 870 - j
            if 0 <= x and y >= hy(x) + 8: seg.append((x, y))
            elif seg: break
        if len(seg) > 1: hd += f'M{seg[0][0]:.1f},{seg[0][1]:.1f} L{seg[-1][0]:.1f},{seg[-1][1]:.1f} '
    S(hd, 1.86, 2.20, 1.5, .32)
    # a far hill behind, the wall snaking on over it (thin, light)
    FH = [(-60, 870), (-10, 800), (60, 742), (120, 716), (180, 730), (230, 770)]
    S(catmull(FH), 1.80, 2.10, 2, .45)
    fw = catmull([(x, y - 30) for x, y in FH[1:]])
    S(fw, 2.10, 2.40, 2.2, .5)
    S(dpath([(x + dx, y - 30 - h) for (x, y) in FH[1:] for dx, h in ((0, 0), (0, 9), (8, 9), (8, 0))]), 2.40, 2.70, 1.4, .4)
    S(dpath([(330, 690), (330, 678), (510, 678), (510, 692)]), 2.0, 2.16, 3)
    # 3 · walls: the wall body (top line parallel to the hill, cut ends with break marks), brick courses, the tower body
    WH = 84
    for xa, xb in ((112, 333), (507, 690)):
        base = [(x, hy(x)) for x in range(xa, xb + 1, 6)]; top = [(x, y - WH) for x, y in base]
        S(dpath(top), 2.06, 2.40, 3.4)
        for k in (28, 56):
            S(dpath([(x, y - k) for x, y in base]), 2.18, 2.46, 1.6, .45)
        jd = ''
        for i, (x, y) in enumerate(base[2:-1:3]):
            for k, row in ((0, 0), (1, 28), (2, 56)):
                xx = x + (9 if k % 2 else 0)
                if xx < xb - 4: jd += f'M{xx:.1f},{hy(xx) - row:.1f} L{xx:.1f},{hy(xx) - row - 28:.1f} '
        S(jd, 2.24, 2.50, 1.4, .35)
    # cut ends (a wall section continues: zigzag break lines)
    for x in (112, 690):
        y = hy(x); S(dpath([(x, y), (x, y - 34), (x - 8, y - 42), (x + 8, y - 50), (x, y - 58), (x, y - WH)]), 2.10, 2.30, 2.4)
    # tower body, string course, arched gate and windows
    T0, T1, TB, TT = 336, 504, 680, 484
    S(dpath([(T0 - 3, TB), (T0, TT), (T1, TT), (T1 + 3, TB)]), 2.10, 2.44, 3.6)
    S(dpath([(T0, 592), (T1, 592)]) + f' M{T0},{598} L{T1},{598}', 2.30, 2.50, 2.2, .8)
    def arch(cx, top, w, h):
        r = w / 2; return f'M{cx - r:.1f},{top + h:.1f} L{cx - r:.1f},{top + r:.1f} A{r:.1f},{r:.1f} 0 0 1 {cx + r:.1f},{top + r:.1f} L{cx + r:.1f},{top + h:.1f}'
    S(arch(420, 626, 34, 54), 2.32, 2.52, 3)
    S(arch(370, 620, 22, 34) + ' ' + arch(470, 620, 22, 34), 2.36, 2.54, 2.6)
    S(arch(372, 518, 24, 40) + ' ' + arch(420, 518, 24, 40) + ' ' + arch(468, 518, 24, 40), 2.40, 2.60, 2.6)
    bd = ''
    for y in range(500, 676, 22):
        if 586 < y < 604: continue
        bd += f'M{T0 + 4},{y} L{T0 + 20},{y} M{T1 - 20},{y} L{T1 - 4},{y} '
    S(bd, 2.40, 2.60, 1.4, .4)
    # 4 · top: crenellations along the wall, the tower parapet, the pavilion, the flag
    for xa, xb in ((112, 333), (507, 690)):
        d = ''; x = xa
        top = lambda x: hy(x) - WH
        pts_ = [(x, top(x))]
        while x < xb:
            m = min(xb, x + 16); pts_ += [(x, top(x) - 16), (m, top(m) - 16), (m, top(m))]; g_ = min(xb, m + 10); pts_ += [(g_, top(g_))]; x = g_
        S(dpath(pts_), 2.44, 2.80, 2.8)
    d = []; x = T0
    while x < T1:
        m = min(T1, x + 18); d += [(x, TT), (x, TT - 18), (m, TT - 18), (m, TT)]; x = min(T1, m + 10)
    S(dpath(d), 2.56, 2.82, 3)
    S(dpath([(386, TT - 18), (386, 444)]) + ' ' + dpath([(454, TT - 18), (454, 444)]), 2.64, 2.84, 2.6)
    S(dpath([(362, 448), (376, 446), (396, 428), (444, 428), (464, 446), (478, 448)]), 2.66, 2.90, 3)
    S(dpath([(496, TT - 18), (496, 410)]), 2.70, 2.86, 2.4)
    els.append(f'<path id="bpflag" d="M496,410 L536,418 L496,428 Z" fill="{CHALK}" fill-opacity=".85" stroke="{CHALK}" stroke-width="2" opacity="0"/>')
    # 5 · construction: scaffold on the tower's right, a hoist, a ramp, dimension lines
    sd = 'M516,606 L516,470 M546,622 L546,470 '
    for y in (600, 560, 520, 480): sd += f'M506,{y} L552,{y} '
    sd += 'M516,600 L546,560 M516,560 L546,520 M516,520 L546,480'
    S(sd, 2.62, 2.92, 2.2, .85)
    S('M660,846 L644,560 M644,560 L586,552 M644,560 L700,864 M644,560 L622,850', 2.66, 2.94, 2.6, .9)
    els.append('<circle cx="586" cy="552" r="6" fill="none" stroke="#EEF3FA" stroke-width="2.4" class="ck" data-a="2.86" data-b="2.94"/>')
    S('M52,868 L114,780', 2.58, 2.76, 3)
    S('M62,856 L72,858 M72,842 L82,844 M82,828 L92,830 M92,814 L102,816 M102,800 L112,802', 2.64, 2.78, 1.8, .7)
    # dimension: the wall's height, with arrowheads and extension lines
    xd = 612; yb, yt = hy(xd), hy(xd) - WH
    S(f'M{xd - 14},{yb} L{xd + 22},{yb} M{xd - 14},{yt} L{xd + 22},{yt} M{xd + 14},{yb - 4} L{xd + 14},{yt + 4} '
      f'M{xd + 8},{yt + 12} L{xd + 14},{yt + 2} L{xd + 20},{yt + 12} M{xd + 8},{yb - 12} L{xd + 14},{yb - 2} L{xd + 20},{yb - 12}', 2.84, 3.04, 1.8, .9)
    els.append(f'<text id="bpdim" x="{xd + 30}" y="{(yb + yt) / 2 + 9:.1f}" font-family="Noto Sans CJK SC" font-weight="700" font-size="24" fill="{CHALK}" opacity="0">7.8m</text>')
    S(f'M{T0},{TT - 24} L{T0},{TT - 70} M{T1},{TT - 24} L{T1},{TT - 70} M{T0 + 4},{TT - 60} L{T1 - 4},{TT - 60} '
      f'M{T0 + 14},{TT - 66} L{T0 + 4},{TT - 60} L{T0 + 14},{TT - 54} M{T1 - 14},{TT - 66} L{T1 - 4},{TT - 60} L{T1 - 14},{TT - 54}', 2.90, 3.10, 1.6, .7)
    return '\n'.join(els)

def bp_worker(id_, kind):
    """a tiny Ming labourer in chalk (conical straw hat), local feet at 0,0, ~46 px tall"""
    c = CHALK
    hat = f'<path d="M-15,-36 L0,-48 L15,-36 Z" fill="{c}"/>'
    head = f'<circle cx="0" cy="-33" r="5" fill="{c}"/>'
    body = f'<path d="M-6,-28 L6,-28 L8,-12 L-8,-12 Z" fill="{c}"/>'
    legs = (f'<g class="wa"><path d="M-3,-12 L-7,0 M3,-12 L6,0" stroke="{c}" stroke-width="3.4" stroke-linecap="round"/></g>'
            f'<g class="wb" style="display:none"><path d="M-3,-12 L-1,0 M3,-12 L1,0" stroke="{c}" stroke-width="3.4" stroke-linecap="round"/></g>')
    if kind == 'pole':     # shoulder pole with two baskets
        extra = (f'<path d="M-24,-27 L24,-27" stroke="{c}" stroke-width="2.4"/><path d="M-22,-27 L-22,-14 M22,-27 L22,-14" stroke="{c}" stroke-width="1.4"/>'
                 f'<path d="M-29,-14 L-15,-14 L-17,-5 L-27,-5 Z M15,-14 L29,-14 L27,-5 L17,-5 Z" fill="{c}"/>')
    elif kind == 'pull':   # hauling a rope
        extra = f'<path d="M4,-24 L16,-30 M4,-20 L16,-26" stroke="{c}" stroke-width="3" stroke-linecap="round"/>'
    else:                  # carrying a brick on the shoulder
        extra = f'<path d="M5,-25 L10,-34" stroke="{c}" stroke-width="3" stroke-linecap="round"/><rect x="2" y="-42" width="16" height="8" fill="{c}"/>'
    return f'<g id="{id_}" opacity="0"><g class="wbody">{hat}{head}{body}{legs}{extra}</g></g>'

def bp_tools():
    """floating construction tools (foreground, out of focus): a set square, a compass, a plumb line"""
    c = CHALK; o = []
    o.append(f'<g id="tsq"><path d="M0,0 L300,0 L0,-190 Z M40,-24 L190,-24 L40,-120 Z" fill="none" stroke="{c}" stroke-width="5" stroke-linejoin="round"/>'
             + ''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="{-12 if x % 50 else -22}" stroke="{c}" stroke-width="3"/>' for x in range(20, 290, 25)) + '</g>')
    o.append(f'<g id="tcp"><circle cx="0" cy="0" r="12" fill="none" stroke="{c}" stroke-width="5"/><line x1="0" y1="-12" x2="0" y2="-40" stroke="{c}" stroke-width="6" stroke-linecap="round"/>'
             f'<path d="M-5,10 L-70,230 M5,10 L72,226" stroke="{c}" stroke-width="7" stroke-linecap="round"/><path d="M-70,230 L-74,252" stroke="{c}" stroke-width="3"/>'
             f'<path d="M66,222 L82,224 L76,252 Z" fill="{c}"/></g>')
    o.append(f'<g id="tpl"><line x1="0" y1="-400" x2="0" y2="0" stroke="{c}" stroke-width="2.4"/><path d="M-16,0 L16,0 L0,44 Z" fill="none" stroke="{c}" stroke-width="5" stroke-linejoin="round"/></g>')
    return '\n'.join(o)

def when_page():
    R = random.Random(1505)
    grid = []
    for x in range(-760, 2760, 40):
        grid.append(f'<line x1="{x}" y1="-300" x2="{x}" y2="1400" stroke="#FFFFFF" stroke-width="{1.6 if x % 200 == 0 else 1}" opacity="{.15 if x % 200 == 0 else .08}"/>')
    for y in range(-280, 1400, 40):
        grid.append(f'<line x1="-760" y1="{y}" x2="2760" y2="{y}" stroke="#FFFFFF" stroke-width="{1.6 if y % 200 == 0 else 1}" opacity="{.15 if y % 200 == 0 else .08}"/>')
    far = []   # faint big chalk marks behind the ruler (they drift slower than the ruler)
    for k in range(7):
        x = -300 + k * 420
        far.append(f'<line x1="{x}" y1="140" x2="{x + 260}" y2="140" stroke="#FFFFFF" stroke-width="2" opacity=".07"/><line x1="{x}" y1="128" x2="{x}" y2="152" stroke="#FFFFFF" stroke-width="2" opacity=".07"/><line x1="{x + 260}" y1="128" x2="{x + 260}" y2="152" stroke="#FFFFFF" stroke-width="2" opacity=".07"/>')
    far.append(f'<circle cx="1500" cy="700" r="380" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".07" stroke-dasharray="18 12"/>')
    far.append(f'<circle cx="300" cy="300" r="250" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".06" stroke-dasharray="6 10"/>')
    dust = ''.join(f'<circle cx="{R.uniform(-900, 2700):.0f}" cy="{R.uniform(0, 1080):.0f}" r="{R.uniform(1.4, 4.2):.1f}" fill="#FFFFFF" opacity="{R.uniform(.2, .55):.2f}"/>' for _ in range(70))
    workers = bp_worker('wk0', 'pole') + bp_worker('wk1', 'pull') + bp_worker('wk2', 'brick') + bp_worker('wk3', 'pole')
    body = f'''
<svg id="bp" width="1920" height="1080" viewBox="0 0 1920 1080">
<defs>
<radialGradient id="paper" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#1D3557"/><stop offset="1" stop-color="#16263F"/></radialGradient>
<radialGradient id="vig" cx="50%" cy="50%" r="72%"><stop offset=".6" stop-color="#0A1222" stop-opacity="0"/><stop offset="1" stop-color="#0A1222" stop-opacity=".55"/></radialGradient>
<filter id="grainf" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0"/></filter>
<filter id="chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6"/></filter>
<filter id="dof" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
<linearGradient id="bpf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#EEF1F5"/><stop offset="1" stop-color="#AEB9CB"/></linearGradient>
<filter id="yds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="6" dy="12" stdDeviation="12" flood-color="#06101F" flood-opacity=".45"/></filter>
<filter id="csb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
</defs>
<rect width="1920" height="1080" fill="url(#paper)"/>
<g id="cam">
<g id="Lgrid">{''.join(grid)}</g>
<g id="Lfar">{''.join(far)}</g>
<g id="Lruler">{bp_ruler()}
<g id="draw" transform="translate({BP_LAND:.2f},0)"><g filter="url(#chalk)">{bp_drawing()}</g>
<g id="load" opacity="0"><line id="rope" x1="586" y1="552" x2="586" y2="800" stroke="{CHALK}" stroke-width="1.8"/><path d="M574,800 L598,800 L595,818 L577,818 Z M576,806 L596,806 M579,812 L593,812" fill="{CHALK}" stroke="#2A4A78" stroke-width="1"/></g>
{workers}<circle id="pen" r="7" fill="#FFFFFF" opacity="0" filter="url(#glow)"/></g>
</g>
<g id="Lyou"><path id="skm" d="" fill="none" stroke="#EEF3FA" stroke-width="5" stroke-linecap="round" opacity="0"/><ellipse id="csh" cx="0" cy="0" rx="10" ry="3" fill="#050B16" opacity=".5" filter="url(#csb)"/><g id="fig"></g><g id="dustp"></g></g>
<g id="Lfg"><g filter="url(#dof)" opacity=".42">{bp_tools()}</g>{dust}</g>
</g>
<g id="speed"></g>
<rect width="1920" height="1080" filter="url(#grainf)" opacity=".05"/>
<rect width="1920" height="1080" fill="url(#vig)"/>
{BUBBLE}
</svg>
<div id="ctr"><div id="digs"></div><div id="lab">年 · 明朝</div></div>
'''
    css = ('#ctr{position:absolute;left:0;top:0;transform-origin:0 0;font-family:"Noto Sans CJK SC";font-weight:900;color:#FFF6E6;}'
           '#digs{position:absolute;left:0;top:0;display:flex;}'
           '.wh{position:relative;width:114px;height:230px;overflow:hidden;-webkit-mask-image:linear-gradient(transparent 0,#000 20%,#000 80%,transparent 100%);}'
           '.col{position:absolute;left:0;top:0;width:114px;text-align:center;font-size:190px;line-height:230px;text-shadow:0 7px 0 #0B1526,0 0 26px rgba(8,16,32,.7);}'
           '#lab{position:absolute;white-space:nowrap;font-size:62px;line-height:62px;text-shadow:0 5px 0 #0B1526,0 0 18px rgba(8,16,32,.7);transform-origin:0 50%;}')
    js = r'''
const K=%(K)s, BX=%(BX)s, BY=%(BY)s, LAND=%(LAND)s, TL=1.672, HILL=%(HILL)s;
function hyJ(x){for(let i=0;i<HILL.length-1;i++){const a=HILL[i],b=HILL[i+1];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return HILL[HILL.length-1][1];}
// truck profile: full speed from t=0, then a decelerating skid into the bar
function prog(t){const u=clamp(t/TL,0,1),a=.45,I=a+(1-a)/2.3;if(u<a)return u/I;const s=(u-a)/(1-a);return (a+(1-a)*(1-Math.pow(1-s,2.3))/2.3)/I;}
function yearAt(t){return 2026-521*prog(t);}
function speed(t){return (yearAt(Math.max(0,t-1/60))-yearAt(t+1/60))*30*K;}   // ruler px/s
// after the landing: a slow push toward the drawing and a slight roll
function cam(t){const u=eio(lin(t,1.72,3.344));return {dx:(yearAt(t)-2026)*K,z:1+0.10*u,fx:300,fy:470,roll:-1.2*u};}
function LT(d,pz,c){const s=1+(c.z-1)*pz;return [s,c.fx*(1-s)-s*d*c.dx,c.fy*(1-s)];}
function mstr(m){return 'matrix('+m[0].toFixed(5)+',0,0,'+m[0].toFixed(5)+','+m[1].toFixed(2)+','+m[2].toFixed(2)+')';}
const LY={grid:[.3,.4],far:[.6,.7],ruler:[1,1],you:[1,1],fg:[1.4,1.3]};
const EL={};for(const k in LY)EL[k]=document.getElementById('L'+k);
// the year wheels
const digs=document.getElementById('digs');const cols=[];
for(let i=0;i<4;i++){const w=document.createElement('div');w.className='wh';const c=document.createElement('div');c.className='col';c.innerHTML=[0,1,2,3,4,5,6,7,8,9,0].join('<br>');w.appendChild(c);digs.appendChild(w);cols.push(c);}
const CX=1030,CY=332,lab=document.getElementById('lab');lab.style.left=(4*114+16)+'px';lab.style.top=(230/2+22)+'px';
function wheels(v){const p=[];for(let k=0;k<4;k++){const m=Math.pow(10,k);const base=Math.floor(v/m);const low=v-base*m;let fr=0;if(k>0&&low>m-1)fr=low-(m-1);p.push(base+fr);}return p.reverse();}
// chalk strokes: dash reveal
const CK=[...document.querySelectorAll('.ck')].map(e=>{const L=e.getTotalLength?e.getTotalLength():100;e.style.strokeDasharray=L+' '+(L+10);return {e:e,L:L,a:+e.dataset.a,b:+e.dataset.b};});
const pen=document.getElementById('pen');
// 你: run cycle (side view, running left), skid, turn, point
const RUN=[[0,[-52,0],[-38,-60]],[.2,[0,0],[-10,-58]],[.4,[62,-6],[22,-56]],[.55,[78,-56],[16,-66]],[.75,[-6,-54],[-56,-94]],[.9,[-58,-16],[-60,-74]],[1,[-52,0],[-38,-60]]];
function legAt(ph){ph=((ph%%1)+1)%%1;for(let i=0;i<RUN.length-1;i++){const a=RUN[i],b=RUN[i+1];if(ph<=b[0]){const u=sm((ph-a[0])/(b[0]-a[0]));return [[mix(a[1][0],b[1][0],u),mix(a[1][1],b[1][1],u)],[mix(a[2][0],b[2][0],u),mix(a[2][1],b[2][1],u)]];}}return [RUN[0][1],RUN[0][2]];}
function lerpJ(A,B,u){const o={};for(const k in A)o[k]=[mix(A[k][0],B[k][0],u),mix(A[k][1],B[k][1],u)];return o;}
function runJ(ph){const A=legAt(ph),B=legAt(ph+.5);const fl=Math.max(0,Math.sin(ph*4*Math.PI-0.6))*9;
  const w=(Math.sin(ph*2*Math.PI)+1)/2;const J=poseJ({lean:-18,look:-12,r:[mix(25,165,w),mix(85,235,w)],l:[mix(165,25,w),mix(235,85,w)]});
  J.l_knee=[A[1][0]-4,A[1][1]];J.l_ankle=[A[0][0]-4,A[0][1]];J.r_knee=[B[1][0]+4,B[1][1]];J.r_ankle=[B[0][0]+4,B[0][1]];
  for(const k in J)J[k]=[J[k][0],J[k][1]-fl];return J;}
function skidJ(){const J=poseJ({lean:20,crouch:.5,look:6,r:[-12,15],l:[172,196]});J.l_knee=[-64,-44];J.l_ankle=[-112,0];J.r_knee=[22,-56];J.r_ankle=[34,0];return J;}
const fig=document.getElementById('fig'),csh=document.getElementById('csh'),bub=document.getElementById('bub');
const KP={crouch:[[1.672,.25],[1.80,0],[2.09,.12],[2.2,0],[2.51,.12],[2.62,0],[2.93,.12],[3.04,0],[3.344,.1]],
  lean:[[1.672,8],[1.80,-2],[1.95,3],[2.55,3],[2.75,-6],[3.344,-6]],look:[[1.672,2],[1.85,6],[2.55,6],[2.72,-7],[3.344,-7]],
  tilt:[[1.672,4],[1.85,10],[2.55,10],[2.72,-12],[3.344,-12]],
  r:[[1.672,[-20,-60]],[1.76,[30,40]],[1.90,[-36,-32]],[2.55,[-36,-32]],[2.75,[58,84]],[3.344,[58,84]]],
  l:[[1.672,[190,150]],[1.78,[120,90]],[1.92,[135,40]],[2.55,[135,40]],[2.75,[-160,-166]],[3.344,[-160,-166]]]};
function you(t,c){const m=LT(1,1,c);const s=1.2*m[0];
  const skid=-26*span(t,1.36,1.672);const wxp=BX+c.dx+skid;const bx=m[0]*wxp+m[1],by=m[0]*BY+m[2];
  let J,face,sx=1,tilt;
  if(t<1.672){const ph=t/0.418;const R=runJ(ph);const k=span(t,1.30,1.50);J=lerpJ(R,skidJ(),k);face=false;sx=0.8;tilt=-6+10*k;}
  else{const st=poseJ({crouch:track(KP.crouch,t),lean:track(KP.lean,t),look:track(KP.look,t),r:track(KP.r,t),l:track(KP.l,t)});const k=span(t,1.672,1.80);J=lerpJ(skidJ(),st,k);
    face=t>=1.74;sx=mix(0.8,1,span(t,1.70,1.80));tilt=track(KP.tilt,t);}
  const br=1+Math.sin(t*2*Math.PI/(4*BEAT))*.012;const turn=Math.max(0,1-Math.abs(t-1.74)/0.06);
  const P=placeJ(J,bx,by,s,sx*(1-0.18*turn),br);fig.innerHTML=figureSVG(P,120*s,face,tilt,'url(#bpf)');
  csh.setAttribute('cx',f1(bx));csh.setAttribute('cy',f1(by+4));csh.setAttribute('rx',f1(60*s));csh.setAttribute('ry',f1(9*s));
  return {hx:P.head[0],ht:P.head[1]-120*s*.28*1.08,foot:[bx-80*s*(t<1.672?span(t,1.30,1.50):0),by]};}
// skid dust (chalk puffs kicked up at the front foot), speed lines
const dustp=document.getElementById('dustp');for(let i=0;i<22;i++){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('fill','#EEF3FA');dustp.appendChild(c);}
const speedg=document.getElementById('speed');for(let i=0;i<12;i++){const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('stroke','#EEF3FA');l.setAttribute('stroke-linecap','round');speedg.appendChild(l);}
function fx(t,y,c){const r=rng(5);let i=0;for(const d of dustp.children){const born=1.30+i*0.018;const age=t-born;const life=0.6;
    if(age<0||age>life){d.setAttribute('opacity',0);i++;continue;}const u=age/life;const m=LT(1,1,c);const bx=m[0]*(BX+c.dx-26*span(born,1.36,1.672)-80)+m[1];
    d.setAttribute('cx',f1(bx-50+(r()-.3)*70-u*(30+r()*90)));d.setAttribute('cy',f1(m[0]*BY+m[2]-6-u*(20+r()*70)));d.setAttribute('r',f1(8+u*(16+26*r())));d.setAttribute('opacity',((1-u)*.5).toFixed(2));i++;}
  const sk=document.getElementById('skm');const m2=LT(1,1,c);const a0=span(t,1.36,1.60),fo=1-span(t,2.0,2.6);const xs=m2[0]*(BX+c.dx-26*span(t,1.36,1.672)-110)+m2[1];
  sk.setAttribute('d','M'+f1(xs)+','+f1(m2[0]*BY+m2[2]-2)+' l'+f1(170*a0)+',0 M'+f1(xs+40)+','+f1(m2[0]*BY+m2[2]+5)+' l'+f1(150*a0)+',0');sk.setAttribute('opacity',(t<1.36?0:.7*fo).toFixed(2));
  const v=speed(t)/540;let j=0;for(const l of speedg.children){const R2=rng(j*17+3);const yy=520+R2()*330,len=90+R2()*200,ph=R2();const x=960+((t*2.4+ph)%%1)*820;
    l.setAttribute('x1',f1(x));l.setAttribute('x2',f1(x+len*v));l.setAttribute('y1',f1(yy));l.setAttribute('y2',f1(yy));l.setAttribute('stroke-width',f1(2+R2()*3));l.setAttribute('opacity',(Math.min(1,v)*(.25+.35*R2())*(t<1.6?1:0)).toFixed(2));j++;}}
// workers, hoist, flag
const W=[0,1,2,3].map(i=>document.getElementById('wk'+i));
function workers(t){const a=span(t,2.62,2.86);const st=Math.floor(t/0.209)%%2;
  const pos=[[mix(58,106,lin(t,2.62,3.344)),mix(866,796,lin(t,2.62,3.344)),1],[682,866,-1],[526,598,1],[mix(222,262,lin(t,2.7,3.344)),0,1]];
  pos[3][1]=0;W.forEach((w,i)=>{let [x,y,f]=pos[i];if(i===3){y=hyJ(x)-84;}w.setAttribute('opacity',a.toFixed(2));
    const bob=(i===1)?Math.sin(t*12)*2:Math.abs(Math.sin(t*Math.PI/0.209))*-2;const lean=(i===1)?-10+6*Math.sin(t*12):0;
    w.setAttribute('transform','translate('+f1(x)+','+f1(y+bob)+') scale('+f+',1) rotate('+lean.toFixed(1)+')');
    w.querySelector('.wa').style.display=(i===1||st)?'':'none';w.querySelector('.wb').style.display=(i!==1&&!st)?'':'none';});
  const ld=document.getElementById('load');ld.setAttribute('opacity',span(t,2.9,3.0).toFixed(2));const ly=-150*span(t,2.95,3.344);ld.querySelector('path').setAttribute('transform','translate(0,'+ly.toFixed(1)+')');
  document.getElementById('rope').setAttribute('y2',f1(800+ly));
  const fl=document.getElementById('bpflag');fl.setAttribute('opacity',span(t,2.84,2.92).toFixed(2));const w=Math.sin(t*9)*4;fl.setAttribute('d','M496,410 Q516,'+f1(410+w)+' 536,'+f1(418+w)+' Q516,'+f1(424+w)+' 496,428 Z');
  document.getElementById('bpdim').setAttribute('opacity',span(t,2.98,3.08).toFixed(2));}
const tsq=document.getElementById('tsq'),tcp=document.getElementById('tcp'),tpl=document.getElementById('tpl');
const camg=document.getElementById('cam'),ctr=document.getElementById('ctr');
window.render=function(t){
  const c=cam(t);
  for(const k in LY){if(k==='you')continue;EL[k].setAttribute('transform',mstr(LT(LY[k][0],LY[k][1],c)));}
  camg.setAttribute('transform','rotate('+c.roll.toFixed(3)+' 960 540)');
  // the chalk drawing: each stroke reveals in its window; a glowing chalk tip rides the newest stroke
  let tip=null;for(const s of CK){const p=lin(t,s.a,s.b);s.e.style.strokeDashoffset=(s.L*(1-p)).toFixed(1);s.e.style.visibility=p<=0?'hidden':'visible';if(p>0&&p<1&&s.L>60)tip=[s,p];}
  if(tip){const q=tip[0].e.getPointAtLength(tip[0].L*tip[1]);pen.setAttribute('cx',f1(q.x));pen.setAttribute('cy',f1(q.y));pen.setAttribute('opacity',.9);}else pen.setAttribute('opacity',0);
  workers(t);
  // floating tools (1.4x layer), drifting and turning
  tsq.setAttribute('transform','translate('+f1(560)+','+f1(1050+6*Math.sin(t*1.3))+') rotate('+(-8+4*t).toFixed(2)+')');
  tcp.setAttribute('transform','translate('+f1(1060)+','+f1(640+10*Math.sin(t*1.1))+') rotate('+(18-6*t).toFixed(2)+')');
  tpl.setAttribute('transform','translate('+f1(560)+','+f1(260)+') rotate('+(6*Math.sin(t*2.2)).toFixed(2)+')');
  const Y=you(t,c);fx(t,BY,c);
  setBubble(bub,Y.hx,Y.ht-6,t,1);
  // the year: rolls with the truck, lands on the bar with a punch; the label pops then
  const v=yearAt(t);const P=wheels(v);for(let i=0;i<4;i++){const q=((P[i]%%10)+10)%%10;cols[i].style.transform='translateY('+(-q*230).toFixed(1)+'px)';}
  const punch=t>=TL?1+0.15*Math.exp(-(t-TL)/0.07):1;const cw=4*114,ch=230;
  ctr.style.transform='translate('+(CX+cw/2)+'px,'+(CY+ch/2)+'px) scale('+punch.toFixed(4)+') translate('+(-cw/2)+'px,'+(-ch/2)+'px)';
  const lp=t<TL?0:back((t-TL)/0.3);lab.style.opacity=t<TL?0:Math.min(1,(t-TL)/0.06);lab.style.transform='scale('+(0.5+0.5*lp).toFixed(3)+')';
};
''' % dict(K=BP_K, BX=BP_X, BY=BP_Y, LAND=f'{BP_LAND:.2f}', HILL=json.dumps(BP_HILL))
    return page('greatwall_when', 3.344, body, js, css)

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    open(f'{out}/greatwall_when.html', 'w').write(when_page())
    if 'what_page' in globals(): open(f'{out}/greatwall_what.html', 'w').write(what_page())
    print('ok', out)
