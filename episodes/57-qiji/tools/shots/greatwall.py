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
# greatwall_when: 「穿越时间轴」 — the shared blueprint device (petra.when_page); only the monument is ours:
# a stretch of Ming wall over a hill with a watchtower, drawn in chalk after the landing, with construction marks.
# =====================================================================================================
sys.path.insert(0, HERE)
import petra as K
from petra import hc, BAR, BEAT, cline, silhouette, dim_v, CHALK

GW_HILL = [(-400, 0), (-330, -20), (-265, -64), (-198, -126), (-135, -172), (-70, -196), (-20, -200), (35, -188), (95, -152), (155, -100), (202, -44), (235, 0)]

def _smooth(P, n=6):
    """Catmull-Rom through P, sampled as a polyline"""
    out = []
    for i in range(len(P) - 1):
        p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, len(P) - 1)]
        for j in range(n):
            u = j / n; u2, u3 = u * u, u * u * u
            out.append(tuple(.5 * (2 * p1[c] + (-p0[c] + p2[c]) * u + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u3) for c in (0, 1)))
    return out + [P[-1]]

def greatwall_monument(cx, by):
    """a Ming wall stretch snaking over a hill, a watchtower (敌台) with a lookout pavilion and a flag on the crest,
    a far hill with the wall running on; then construction: guidelines, scaffold, a hoist lifting a basket of bricks,
    a ramp, tiny labourers in straw hats, the wall's height dimensioned (7.8 m, 八达岭)"""
    k = .82; T = lambda x, y: (cx + x * k, by + y * k)
    H = _smooth(GW_HILL)
    def hy(x):
        for (x0, y0), (x1, y1) in zip(H, H[1:]):
            if x0 <= x <= x1: return y0 + (y1 - y0) * (x - x0) / (x1 - x0 or 1)
        return 0
    out = []; a = BAR
    # guidelines first (dashed, faint): the tower's axis, its top level, a compass arc
    out.append(cline([T(-50, 30), T(-50, -500)], 1.6, .4, a=a, d=.25, dash='22 8 4 8'))
    out.append(cline([T(-230, -386), T(170, -386)], 1.6, .4, a=a + .05, d=.25, dash='12 9'))
    out.append(cline([T(-50 + 300 * math.cos(math.radians(q)), -186 + 300 * math.sin(math.radians(q))) for q in range(196, 345, 4)], 1.6, .35, a=a + .08, d=.3, dash='9 9'))
    # base: the far hill and its wall, the near hill, section hatching
    FH = _smooth([(-520, 0), (-470, -70), (-400, -128), (-340, -150), (-280, -136), (-230, -96)])
    out.append(cline([T(x, y) for x, y in FH], 2, .5, a=a + .02, d=.35))
    out.append(cline([T(x, y - 30) for x, y in FH[3:]], 2.2, .55, a=a + .3, d=.35))
    out.append(cline([T(x + dx, y - 30 - h) for x, y in FH[4::3] for dx, h in ((0, 0), (0, 9), (8, 9), (8, 0))], 1.4, .45, a=a + .55, d=.3))
    out.append(cline([T(x, y) for x, y in H], 3, a=a + .02, d=.42))
    for i, s in enumerate(range(-420, 260, 26)):   # 45° hatching inside the hill
        seg = [(s + j, -j) for j in range(0, 260, 3) if s + j <= 235 and -j >= hy(s + j) + 8]
        if len(seg) > 1: out.append(cline([T(*seg[0]), T(*seg[-1])], 1.4, .3, a=a + .18 + i * .012, d=.12))
    # walls: the wall body following the hill (top parallel to it, cut ends with break marks), courses, joints
    WH = 84; T0, T1, TB, TT = -134, 34, -190, -386
    for i, (xa, xb) in enumerate(((-358, T0 - 2), (T1 + 2, 220))):
        xs = [xa + (xb - xa) * j / 40 for j in range(41)]
        out.append(cline([T(x, hy(x) - WH) for x in xs], 3, a=a + .32 + i * .06, d=.4))
        for r, kk in ((28, 0), (56, 1)):
            out.append(cline([T(x, hy(x) - r) for x in xs], 1.5, .42, a=a + .48 + kk * .05 + i * .04, d=.35))
        for x in xs[2:-1:3]:
            for r in (0, 28, 56):
                xx = x + (9 if r == 28 else 0)
                out.append(cline([T(xx, hy(xx) - r), T(xx, hy(xx) - r - 28)], 1.2, .3, a=a + .6 + (x - xa) / 1800, d=.08))
    for x in (-358, 220):   # break lines: the wall goes on
        y = hy(x); out.append(cline([T(x, y), T(x, y - 34), T(x - 8, y - 42), T(x + 8, y - 50), T(x, y - 58), T(x, y - WH)], 2.2, .9, a=a + .45, d=.2))
    # the watchtower: body, plinth, string course, an arched gate and windows, a few brick lines
    out.append(cline([T(T0 - 6, TB + 6), T(T0 - 6, TB - 6), T(T1 + 6, TB - 6), T(T1 + 6, TB + 6)], 2.4, .9, a=a + .3, d=.2))
    out.append(cline([T(T0 - 3, TB), T(T0, TT), T(T1, TT), T(T1 + 3, TB)], 3.2, a=a + .38, d=.45))
    out.append(cline([T(T0, -288), T(T1, -288)], 2.2, .8, a=a + .66, d=.22)); out.append(cline([T(T0, -282), T(T1, -282)], 1.6, .6, a=a + .7, d=.22))
    def arch(x0, top, w, h):
        r = w / 2; return [T(x0 - r, top + h)] + [T(x0 + r * math.cos(math.radians(q)), top + r - r * math.sin(math.radians(q))) for q in range(180, -1, -15)] + [T(x0 + r, top + h)]
    out.append(cline(arch(-50, -244, 34, 54), 2.8, a=a + .74, d=.2))
    for j, x in enumerate((-100, 0)): out.append(cline(arch(x, -250, 22, 34), 2.4, a=a + .8 + j * .04, d=.18))
    for j, x in enumerate((-98, -50, -2)): out.append(cline(arch(x, -352, 24, 40), 2.4, a=a + .86 + j * .04, d=.18))
    for j, y in enumerate(range(-370, -194, 22)):
        if -296 < y < -276: continue
        out.append(cline([T(T0 + 4, y), T(T0 + 20, y)], 1.2, .38, a=a + .7 + j * .02, d=.08)); out.append(cline([T(T1 - 20, y), T(T1 - 4, y)], 1.2, .38, a=a + .7 + j * .02, d=.08))
    # top: crenellations along the wall, the tower's parapet, the pavilion, the flagpole
    for i, (xa, xb) in enumerate(((-358, T0 - 2), (T1 + 2, 220))):
        P = []; x = xa
        while x < xb:
            m = min(xb, x + 16); g_ = min(xb, m + 10)
            P += [T(x, hy(x) - WH), T(x, hy(x) - WH - 16), T(m, hy(m) - WH - 16), T(m, hy(m) - WH), T(g_, hy(g_) - WH)]; x = g_
        out.append(cline(P, 2.4, a=a + .86 + i * .06, d=.36))
    P = []; x = T0
    while x < T1:
        m = min(T1, x + 18); P += [T(x, TT), T(x, TT - 18), T(m, TT - 18), T(m, TT)]; x = min(T1, m + 10)
    out.append(cline(P, 2.6, a=a + .98, d=.28))
    out.append(cline([T(-84, TT - 18), T(-84, -428)], 2.2, a=a + 1.06, d=.12)); out.append(cline([T(-16, TT - 18), T(-16, -428)], 2.2, a=a + 1.06, d=.12))
    out.append(cline([T(-108, -424), T(-94, -426), T(-74, -444), T(-26, -444), T(-6, -426), T(8, -424)], 2.8, a=a + 1.1, d=.2))
    out.append(cline([T(26, TT - 18), T(26, -458)], 2, a=a + 1.12, d=.12))
    fl = [T(26, -458), T(62, -450), T(26, -440)]
    out.append(f'<polygon points="{hc.pts(fl)}" fill="{CHALK}" fill-opacity=".85" stroke="{CHALK}" stroke-width="2" class="fade" data-a="{a + 1.22:.3f}" data-d=".15" opacity="0"/>')
    # construction (from about beat 2 after the landing): scaffold beside the tower, a hoist, a ramp
    a0 = BAR + 2.2 * BEAT
    for j, x in enumerate((44, 70)): out.append(cline([T(x, -186 - j * 12), T(x, -398)], 2, .85, a=a0 + j * .05, d=.22))
    for j, y in enumerate((-200, -250, -300, -350, -394)): out.append(cline([T(36, y), T(78, y)], 1.8, .8, a=a0 + .1 + j * .04, d=.12))
    for j, (y0, y1) in enumerate(((-200, -250), (-250, -300), (-300, -350))): out.append(cline([T(44, y0), T(70, y1)], 1.4, .65, a=a0 + .25 + j * .04, d=.12))
    out.append(cline([T(190, -22), T(172, -300)], 2.4, .9, a=a0 + .05, d=.25))          # the hoist's mast and jib
    out.append(cline([T(172, -300), T(118, -306)], 2.2, .9, a=a0 + .25, d=.12))
    out.append(cline([T(172, -300), T(226, 0)], 1.4, .6, a=a0 + .3, d=.18))
    out.append(cline([T(118, -306), T(118, -170)], 1.4, .85, a=a0 + .35, d=.15))       # the rope and its basket of bricks
    out.append(cline([T(108, -170), T(128, -170), T(126, -156), T(110, -156), T(108, -170)], 2, .9, a=a0 + .45, d=.1))
    out.append(cline([T(-430, 0), T(-362, -84)], 2.6, a=a0 + .1, d=.22))               # a ramp up to the wall's cut end
    out.append(cline([T(-418, -2), T(-408, -16), T(-398, -28), T(-388, -42), T(-378, -54), T(-368, -68)], 1.4, .6, a=a0 + .2, d=.15))
    # tiny labourers in straw hats (silhouettes, pop in one per third of a beat)
    for i, (x, y, f, pose) in enumerate(((-396, -46, 1, 'carry'), (56, -350, -1, 'pick'), (200, 0, -1, 'walk'), (-250, hy(-250) - WH, 1, 'walk'))):
        fx, fy = T(x, y); el, A = hc.figure(fx, fy, .25, f, robe='#fff', head='bare', pose=pose, tool=None, sw=1.2)
        hx, hy_ = A['head']; el.append(f'<polygon points="{hx - 13:.1f},{hy_ - 3:.1f} {hx:.1f},{hy_ - 15:.1f} {hx + 13:.1f},{hy_ - 3:.1f}" fill="#fff" stroke="#fff" stroke-width="1"/>')
        out.append(silhouette(el, BAR + 3 * BEAT + (i + 1) * BEAT / 3, fx, fy))
    xd = 205; out += dim_v(cx + (xd + 34) * k, by + (hy(xd)) * k, by + (hy(xd) - WH) * k, '7.8 m', BAR + 3 * BEAT)
    return out

def when_page():
    return K.when_page('greatwall_when', 1505, '', '年 · 明朝', 1515, [('民国', 1930), ('清', 1778), ('元', 1320)], '1505', '明', greatwall_monument,
                       minor=10, mid=50, major=500, label_every=100)


# =====================================================================================================
# greatwall_what: 用来挡住北方的骑兵. A new drawing in the coded style (flat palette, ink #2A211B, hand-placed
# shapes + generated repeats), built from a small 3D layout projected through one camera: a crane just
# outside the wall at merlon height, looking along it. 你 on the near wall walk; the wall runs to a beacon
# tower; northern riders gallop over the plain and rein up at the wall's foot; the beacon flares, the relay
# beacons on the far ridges answer one per beat.
# =====================================================================================================
def _sub(a, b): return (a[0] - b[0], a[1] - b[1], a[2] - b[2])
def _dot(a, b): return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
def _cross(a, b): return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
def _norm(a): l = math.sqrt(_dot(a, a)); return (a[0] / l, a[1] / l, a[2] / l)
class Cam:
    """pinhole camera: x east, y north, z up (metres); screen y down"""
    def __init__(s, pos, look, f, c):
        s.C = pos; s.F = _norm(_sub(look, pos)); s.R = _norm(_cross(s.F, (0, 0, 1))); s.U = _cross(s.R, s.F); s.f = f; s.c = c
    def __call__(s, P):
        v = _sub(P, s.C); d = _dot(v, s.F); return (s.c[0] + s.f * _dot(v, s.R) / d, s.c[1] - s.f * _dot(v, s.U) / d)
    def depth(s, P): return _dot(_sub(P, s.C), s.F)
    def js(s): return json.dumps(dict(C=s.C, F=s.F, R=s.R, U=s.U, f=s.f, c=s.c))

WCAM = Cam((-3.4, -0.6, 9.1), (-18.9, 96.6, 2.5), 1058, (960, 540))
WP = dict(sky0='#D9BC90', sky1='#F1D9AE', sky2='#F8E8C8', sun='#FFF4D8', far='#CDB9A0', far_s='#9C8B7A', mid='#B9A388', mid_s='#8E7B66',
          plain0='#D2B07A', plain1='#B88E57', grass='#8F6A42', grass_l='#E2B97A', hill='#B49470', hill_s='#8C6E4E',
          face='#D6BF98', face_d='#B9A27E', course='#B39C78', merl='#CDB792', merl_top='#EAC98F', merl_side='#9C8D7C',
          walk='#8E8A92', walk_d='#77737C', inner='#7C7680', tower='#D3BE98', tower_d='#A8957A', win='#3A2E26', stack='#8E8478',
          far_wall='#DCCAA9', rider='#211A17', rim='#F2B66E')

def wall_path():
    """centreline (x, y, ground) of the main wall, near → the beacon tower"""
    P = []
    for i in range(0, 64):
        y = -4 + i * 1.05
        x = 0 if y < 24 else 9 * ((y - 24) / 38) ** 1.6
        g = 0 if y < 30 else 2.6 * ((y - 30) / 32) ** 1.3
        P.append((x, y, g))
    return P

def what_scene():
    cam = WCAM; W = WP; R = random.Random(1449)
    L = {k: [] for k in ('sky', 'far', 'mid', 'wall', 'near')}
    pr = lambda P: cam(P)
    # --- sky: dusk gradient, a low sun behind the far ridges on the left ---
    g = L['sky']
    g.append('<rect x="-500" y="-400" width="2920" height="1900" fill="url(#wsky)"/>')
    g.append('<circle cx="330" cy="430" r="300" fill="url(#wsun)"/><circle cx="330" cy="452" r="46" fill="#FFF6E2" opacity=".9"/>')
    for cx, cy, w in ((560, 150, 300), (1660, 230, 260), (140, 260, 200)):
        g.append(f'<path d="M{cx - w / 2},{cy} q{w * .2},-34 {w * .45},-14 q{w * .2},-28 {w * .4},2 q{w * .1},16 {w * .15},12 Z" fill="#FBEBD0" opacity=".75"/>')
    # --- far ridges and the wall snaking on them (with the relay beacon towers) ---
    g = L['far']
    hz = pr((0, 5000, 0))[1]
    far = [(-500, hz - 40)]
    for i, x in enumerate(range(-460, 2460, 80)): far.append((x, hz - 34 - 26 * math.sin(i * .55) - 18 * math.sin(i * 1.3 + 1) - (40 if 2 < i < 8 else 0) * math.sin((i - 2) / 6 * math.pi)))
    g.append(poly(far + [(2460, hz + 200), (-500, hz + 200)], W['far'], W['far_s'], 2))
    mid = [(-500, hz - 6)]
    for i, x in enumerate(range(-460, 2460, 70)): mid.append((x, hz - 4 - 22 * math.sin(i * .7 + 2) - 12 * math.sin(i * 1.7)))
    g.append(poly(mid + [(2460, hz + 220), (-500, hz + 220)], W['mid'], W['mid_s'], 2))
    # the far wall: a snaking line over the mid ridge, small towers on the crests; relay beacons at three of them
    fw = [(x, y - 3) for x, y in mid if -60 < x < 1240]
    g.append(line(fw, INK, 7, 'opacity=".85"')); g.append(line(fw, W['far_wall'], 4))
    relay = []
    for k, x in enumerate((140, 490, 840)):
        y = min(p[1] for p in mid if abs(p[0] - x) < 40) - 3
        g.append(poly([(x - 9, y + 2), (x - 9, y - 16), (x + 9, y - 16), (x + 9, y + 2)], W['far_wall'], INK, 2))
        relay.append((x, y - 18))
    # --- the mid ground: the plain outside, the hill under the beacon tower, the land inside ---
    g = L['mid']
    pl = [(-500, hz + 4)]
    for i, x in enumerate(range(-460, 2460, 90)): pl.append((x, hz + 6 + 6 * math.sin(i * .9)))
    g.append(poly(pl + [(2460, 1500), (-500, 1500)], 'url(#wplain)', 'none', 0))
    # far tree-less rolling ground lines (generated)
    for k in range(7):
        y = hz + 22 + k * k * 9
        g.append(line([(x, y + 4 * math.sin(x / 140 + k)) for x in range(-500, 1300, 60)], '#A9844F', 2, f'opacity="{.35 - k * .03:.2f}"'))
    # the hill rising behind the beacon tower and the inside land (right of the wall)
    th = [cam((x, y, 0)) for x, y in ((40, 40), (22, 52), (14, 62), (12, 74), (20, 90), (60, 120))]
    hl = [cam((12, 45, 0))[0] - 160, hz + 6]
    g.append(poly([(hl[0], hl[1]), (1180, hz - 30), (1300, hz - 52), (1420, hz - 40), (1560, hz - 18), (1760, hz - 26), (2460, hz - 10), (2460, 1500), (1240, 1500)], W['hill'], W['hill_s'], 2.5))
    # dry grass on the plain (strokes, smaller with distance)
    for _ in range(700):
        X, Y = R.uniform(-80, -3.5), R.uniform(6, 160)
        if Y < 6: continue
        a = cam((X, Y, 0)); d = cam.depth((X, Y, 0)); h = 0.45 * cam.f / d
        if a[0] < -300 or a[0] > 1400 or h < 1.2: continue
        ang = R.uniform(-1.9, -1.2); g.append(line([a, (a[0] + math.cos(ang) * h, a[1] + math.sin(ang) * h)], R.choice([W['grass'], W['grass_l'], '#A57A48']), max(1, min(3.2, h / 6))))
    # --- the wall: segments far → near; outer face, walk, inner parapet, merlons ---
    g = L['wall']
    WPth = wall_path()
    def frame(i):
        x, y, gr = WPth[i]; j = min(i + 1, len(WPth) - 1); k = max(i - 1, 0)
        tx, ty = WPth[j][0] - WPth[k][0], WPth[j][1] - WPth[k][1]; n = math.hypot(tx, ty); tx, ty = tx / n, ty / n
        return x, y, gr, (-ty, tx)        # outward normal: to the west (left)
    segs = []
    for i in range(len(WPth) - 1, 0, -1):
        x0, y0, g0, n0 = frame(i); x1, y1, g1, n1 = frame(i - 1)
        if y0 > 58.5: continue
        off = lambda x, y, n, d: (x + n[0] * d, y + n[1] * d)
        of0, of1 = off(x0, y0, n0, 2.6), off(x1, y1, n1, 2.6); ft0, ft1 = off(x0, y0, n0, 3.0), off(x1, y1, n1, 3.0)
        in0, in1 = off(x0, y0, n0, -2.6), off(x1, y1, n1, -2.6)
        # inner parapet (low), walk, outer face
        g.append(poly([cam((*in0, g0 + 7)), cam((*in1, g1 + 7)), cam((*in1, g1 + 8.0)), cam((*in0, g0 + 8.0))], W['inner'], INK, 1.5))
        g.append(poly([cam((*of0, g0 + 7)), cam((*of1, g1 + 7)), cam((*in1, g1 + 7)), cam((*in0, g0 + 7))], W['walk'], INK, 1.5))
        g.append(poly([cam((*of0, g0 + 7)), cam((*of1, g1 + 7)), cam((*ft1, g1 - .5)), cam((*ft0, g0 - .5))], W['face'], 'none', 0))
    # outer face courses and the face's outline (generated, following the path)
    for z in (1.4, 2.8, 4.2, 5.6):
        g.append(line([cam((x + n[0] * (3.0 - .4 * z / 7), y + n[1] * (3.0 - .4 * z / 7), gr + z)) for x, y, gr, n in (frame(i) for i in range(len(WPth))) if y < 58.5], W['course'], 1.6, 'opacity=".8"'))
    g.append(line([cam((x + n[0] * 3.0, y + n[1] * 3.0, gr - .3)) for x, y, gr, n in (frame(i) for i in range(len(WPth))) if y < 58.5], INK, 2.5))
    # merlons along the outer edge (far → near): side (facing the camera), front, top
    mer = []
    s = 2.4
    while s < 57:
        mer.append(s); s += 2.25
    for s in mer[::-1]:
        i = int((s + 4) / 1.05); i = max(1, min(len(WPth) - 2, i)); x, y, gr, n = frame(i)
        tx, ty = n[1], -n[0]
        a = (x + n[0] * 2.6 - tx * .0, y + n[1] * 2.6); b = (a[0] + tx * 1.5, a[1] + ty * 1.5)
        ai, bi = (a[0] - n[0] * .5, a[1] - n[1] * .5), (b[0] - n[0] * .5, b[1] - n[1] * .5)
        z0, z1 = gr + 7, gr + 8.8
        g.append(poly([cam((*a, z0)), cam((*ai, z0)), cam((*ai, z1)), cam((*a, z1))], W['merl_side'], INK, 2))
        g.append(poly([cam((*a, z0)), cam((*b, z0)), cam((*b, z1)), cam((*a, z1))], W['merl'], INK, 2))
        g.append(poly([cam((*a, z1)), cam((*b, z1)), cam((*bi, z1)), cam((*ai, z1))], W['merl_top'], INK, 2))
    # --- the beacon tower at the end of the stretch ---
    tx_, ty_, tg = WPth[-1][0] + .5, 62.0, 2.6
    x0, x1, y0, y1, zb, zt = tx_ - 4, tx_ + 4, ty_ - 4, ty_ + 4, tg - 1, tg + 13
    tower = [poly([cam((x0, y0, zb)), cam((x0, y1, zb)), cam((x0, y1, zt)), cam((x0, y0, zt))], W['tower'], INK, 2.5),      # west face (lit)
             poly([cam((x0, y0, zb)), cam((x1, y0, zb)), cam((x1, y0, zt)), cam((x0, y0, zt))], W['tower_d'], INK, 2.5)]    # south face
    for zz in (zb + 4.8, zb + 9.6):
        for yy in (y0 + 1.6, y0 + 4, y0 + 6.4):
            a, b = cam((x0, yy - .55, zz)), cam((x0, yy + .55, zz + 1.9)); w_ = b[0] - a[0]
            tower.append(f'<path d="M{a[0]:.1f},{a[1]:.1f} L{a[0]:.1f},{b[1] + abs(w_) * .5:.1f} Q{(a[0] + b[0]) / 2:.1f},{b[1] - abs(w_) * .4:.1f} {b[0]:.1f},{b[1] + abs(w_) * .5:.1f} L{b[0]:.1f},{a[1]:.1f} Z" fill="{W["win"]}"/>')
    tower.append(line([cam((x0, y0, zb + 7.2)), cam((x0, y1, zb + 7.2))], W['course'], 2))
    for k in range(5):   # crenellations on the tower top (west and south)
        yy = y0 + .4 + k * 1.6
        tower.append(poly([cam((x0, yy, zt)), cam((x0, yy + 1, zt)), cam((x0, yy + 1, zt + 1.2)), cam((x0, yy, zt + 1.2))], W['merl'], INK, 1.5))
        xx = x0 + .4 + k * 1.6
        tower.append(poly([cam((xx, y0, zt)), cam((xx + 1, y0, zt)), cam((xx + 1, y0, zt + 1.2)), cam((xx, y0, zt + 1.2))], W['tower_d'], INK, 1.5))
    sb = (tx_ + .5, ty_ + .5)   # the beacon stack on the roof
    tower.append(poly([cam((sb[0] - 1.3, sb[1] - 1.3, zt)), cam((sb[0] - .8, sb[1] - .8, zt + 3.2)), cam((sb[0] + .8, sb[1] - .8, zt + 3.2)), cam((sb[0] + 1.3, sb[1] - 1.3, zt))], W['stack'], INK, 2))
    fire = cam((sb[0], sb[1] - .8, zt + 3.3))
    L['wall'] = tower + L['wall']     # the tower stands behind the stretch that leads to it
    # --- the near parapet in front of the camera: the closest merlons are huge, dark, at the bottom edge ---
    g = L['near']
    for s in (-.6,):
        a = (-2.6, s); b = (-2.6, s + 1.5); ai, bi = (-2.1, s), (-2.1, s + 1.5)
        z0, z1 = 7, 8.8
        g.append(poly([cam((*a, z0)), cam((*b, z0)), cam((*b, z1)), cam((*a, z1))], '#8E8170', INK, 3))
    you_feet = cam((-.6, 5.6, 7.0)); you_k = cam.f / cam.depth((-.6, 5.6, 7.0))   # px per metre at 你
    return {k: '\n'.join(v) for k, v in L.items()}, dict(fire=fire, relay=relay, you=you_feet, you_k=you_k, hz=hz)

def rider_svg(i):
    """one rider: DOM built once; legs / tail / body pose are set per frame by JS (ids rN_*)"""
    c = WP['rider']
    return (f'<g id="r{i}" filter="url(#rim)"><g id="r{i}_s">'
            f'<g id="r{i}_b">'
            f'<path id="r{i}_lh" fill="none" stroke="{c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path id="r{i}_lf" fill="none" stroke="{c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path id="r{i}_tail" fill="{c}"/>'
            f'<path d="M-62,-128 L-50,-146 L-10,-152 L30,-150 L52,-142 L64,-122 L58,-100 L40,-90 L-20,-90 L-50,-94 L-64,-110 Z" fill="{c}"/>'
            f'<g id="r{i}_n"><path d="M34,-140 L50,-172 L68,-198 L86,-214 L100,-216 L110,-206 L128,-178 L130,-168 L121,-163 L104,-174 L96,-172 L80,-148 L66,-116 L50,-108 Z" fill="{c}"/>'
            f'<path d="M90,-212 L94,-228 L100,-212 Z" fill="{c}"/><path d="M50,-170 L58,-188 L66,-182 L74,-200 L80,-196 L86,-214" fill="none" stroke="{c}" stroke-width="7" stroke-linejoin="round"/></g>'
            f'<path id="r{i}_rf" fill="none" stroke="{c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path id="r{i}_rh" fill="none" stroke="{c}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<g id="r{i}_m">'
            # the rider: lamellar coat flaring over the flank, belt, quiver, helmet with a spike and a neck guard, arm to the reins
            f'<path d="M-22,-150 L20,-152 L26,-116 L-24,-112 Z" fill="{c}"/>'
            f'<path d="M-12,-150 L14,-152 L18,-200 L-6,-206 Z" fill="{c}"/>'
            f'<path d="M-30,-196 L-20,-200 L-12,-140 L-22,-138 Z" fill="{c}"/><path d="M-30,-196 L-34,-212 M-26,-198 L-28,-214 M-22,-199 L-21,-215" stroke="{c}" stroke-width="2.5"/>'
            f'<circle cx="8" cy="-218" r="10" fill="{c}"/>'
            f'<path d="M-4,-218 Q8,-246 20,-218 Z" fill="{c}"/><path d="M8,-238 L8,-256" stroke="{c}" stroke-width="3"/><circle cx="8" cy="-258" r="3.5" fill="{c}"/>'
            f'<path d="M-6,-220 L-14,-200 L2,-206 Z" fill="{c}"/>'
            f'<path id="r{i}_arm" d="M10,-196 L30,-176 L48,-170" fill="none" stroke="{c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path id="r{i}_rein" d="M48,-170 L112,-178" fill="none" stroke="{c}" stroke-width="2"/>'
            f'<path d="M2,-150 L18,-126 L10,-102" fill="none" stroke="{c}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<g id="r{i}_lance"></g>'
            f'</g></g></g></g>')

def what_page():
    Ly, A = what_scene()
    riders = ''.join(rider_svg(i) for i in range(7))
    dust = ''.join('<circle fill="#E6D2AE" stroke="#B89A72" stroke-width="1.5"/>' for _ in range(84))
    smoke = ''.join('<circle/>' for _ in range(70))
    relays = ''.join(f'<g id="rl{k}"><path id="rlf{k}" d="" fill="#FF9A3C"/><g id="rls{k}">' + ''.join('<circle/>' for _ in range(16)) + '</g></g>' for k in range(3))
    body = f'''
<svg id="w" width="1920" height="1080" viewBox="0 0 1920 1080">
<defs>
<linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(1)" ><stop offset="0" stop-color="{WP["sky0"]}"/><stop offset=".55" stop-color="{WP["sky1"]}"/><stop offset=".8" stop-color="{WP["sky2"]}"/></linearGradient>
<radialGradient id="wsun"><stop offset="0" stop-color="#FFF4D8" stop-opacity=".95"/><stop offset="1" stop-color="#FFE2A8" stop-opacity="0"/></radialGradient>
<linearGradient id="wplain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{WP["plain0"]}"/><stop offset=".5" stop-color="{WP["plain1"]}"/><stop offset="1" stop-color="#9C7446"/></linearGradient>
<radialGradient id="fglow"><stop offset="0" stop-color="#FFD27A" stop-opacity=".85"/><stop offset=".4" stop-color="#FF9A3C" stop-opacity=".35"/><stop offset="1" stop-color="#FF8A2A" stop-opacity="0"/></radialGradient>
<filter id="rim" x="-20%" y="-20%" width="140%" height="140%"><feFlood flood-color="{WP["rim"]}" result="c"/><feComposite in="c" in2="SourceAlpha" operator="in" result="r"/><feOffset in="r" dx="-2.6" dy="-2.2" result="ro"/><feMerge><feMergeNode in="ro"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5"/></filter>
{YOU_DEFS}
</defs>
<g id="cam">
<g id="Lsky">{Ly["sky"]}</g>
<g id="Lfar">{Ly["far"]}{relays}</g>
<g id="Lmid">{Ly["mid"]}<g id="dust">{dust}</g><g id="riders">{riders}</g></g>
<g id="Lwall">{Ly["wall"]}<circle id="fglo" r="120" fill="url(#fglow)"/><g id="smoke">{smoke}</g><path id="flame" fill="#FF9A3C" stroke="#2A211B" stroke-width="2"/><path id="flame2" fill="#FFE08A"/>
<ellipse id="csh" cx="0" cy="0" rx="10" ry="3" fill="#1A1410" opacity=".35" filter="url(#csb)"/><g id="fig"></g></g>
<g id="Lnear">{Ly["near"]}<g id="banner"><line x1="0" y1="0" x2="0" y2="-330" stroke="#2A211B" stroke-width="12" stroke-linecap="round"/><line x1="0" y1="0" x2="0" y2="-330" stroke="#7A5232" stroke-width="7" stroke-linecap="round"/><path id="bnf" d="" fill="#B8322A" stroke="#2A211B" stroke-width="3" stroke-linejoin="round"/><path id="bnb" d="" fill="none" stroke="#F2C66E" stroke-width="8"/></g></g>
</g>
{BUBBLE}
</svg>'''
    js = r'''
const CAM=%(CAM)s, FIRE=%(FIRE)s, RELAY=%(RELAY)s, YOU=%(YOU)s, YK=%(YK)s;
function P3(p){const v=[p[0]-CAM.C[0],p[1]-CAM.C[1],p[2]-CAM.C[2]];const d=v[0]*CAM.F[0]+v[1]*CAM.F[1]+v[2]*CAM.F[2];
  return [CAM.c[0]+CAM.f*(v[0]*CAM.R[0]+v[1]*CAM.R[1]+v[2]*CAM.R[2])/d,CAM.c[1]-CAM.f*(v[0]*CAM.U[0]+v[1]*CAM.U[1]+v[2]*CAM.U[2])/d,d];}
// camera: opening wide over the plain; crane down and push in toward the wall's foot and 你 as the riders arrive; slight roll
function cam(t){const u=eio(lin(t,0,5.016));const u2=eio(lin(t,2.2,5.016));return {z:1+0.30*u2+0.04*u,fx:1180,fy:760,ty:-40*(1-u)+30*u2,tx:30*u,roll:0.8-1.8*u};}
const LY={sky:[.05],far:[.15],mid:[.62],wall:[.8],near:[1.25]};const EL={};for(const k in LY)EL[k]=document.getElementById('L'+k);
function LT(d,c){const s=1+(c.z-1)*d;return [s,c.fx*(1-s)+c.tx*d,c.fy*(1-s)+c.ty*d];}
function mstr(m){return 'matrix('+m[0].toFixed(5)+',0,0,'+m[0].toFixed(5)+','+m[1].toFixed(2)+','+m[2].toFixed(2)+')';}
// ---- riders: start far out on the plain (west), gallop to the wall's foot, rein up (rear) on the bar ----
const RD=[ // [startX,startY, stopX,stopY, phase, stopT, lance]
 [-46,40,-9.5,24.5,.0,3.344,'tug'],[-52,46,-12.5,29,.31,3.30,'lance'],[-44,33,-8.5,19.5,.62,3.38,''],[-58,52,-11,34,.17,3.26,'lance'],
 [-50,37,-14,23,.45,3.40,''],[-62,44,-16,30,.8,3.32,'lance'],[-56,30,-13,17.5,.27,3.36,'']];
const T0=0.0;
function lanceSVG(kind){const c='#211A17';if(kind==='tug')return '<path d="M-8,-118 L-34,-372" stroke="'+c+'" stroke-width="5"/><path d="M-36,-372 L-34,-396 M-44,-370 L-40,-388 M-28,-374 L-28,-390" stroke="'+c+'" stroke-width="4"/><path id="TUG" d="M-36,-366 Q-46,-330 -40,-300 Q-30,-330 -32,-366 Z" fill="'+c+'"/>';
  if(kind==='lance')return '<path d="M-6,-120 L40,-330" stroke="'+c+'" stroke-width="4.5"/><path d="M38,-330 L44,-352 L46,-328 Z" fill="'+c+'"/><path class="pen" d="M40,-322 L76,-314 L38,-304 Z" fill="#8E2E26"/>';return '';}
for(let i=0;i<RD.length;i++)document.getElementById('r'+i+'_lance').innerHTML=lanceSVG(RD[i][6]);
function legPath(pts){return 'M'+pts.map(p=>f1(p[0])+','+f1(p[1])).join(' L');}
function leg(root,a1,a2,l1,l2,l3,hind){const r=Math.PI/180;const k=[root[0]+Math.sin(a1*r)*l1,root[1]+Math.cos(a1*r)*l1];const f=[k[0]+Math.sin(a2*r)*l2,k[1]+Math.cos(a2*r)*l2];
  const h=[f[0]+Math.sin((a2+(hind?14:10))*r)*l3,f[1]+Math.cos((a2+(hind?14:10))*r)*l3];return [root,k,f,h];}
function riderState(i,t){const d=RD[i];const st=d[5];const tR=st-0.85;   // decelerate from tR, rear at st
  let u;if(t<tR)u=t/st*1.0;else{const x=(t-tR)/(st-tR);u=tR/st+(1-tR/st)*(1-Math.pow(1-Math.min(1,x),2.2));}u=Math.min(1,u*(1/(tR/st+(1-tR/st))));
  const X=mix(d[0],d[2],u),Y=mix(d[1],d[3],u);return {X:X,Y:Y,u:u};}
function horse(i,t){const d=RD[i];const st=d[5];const S=riderState(i,t);const p=P3([S.X,S.Y,0]);const k=CAM.f/p[2]/100;
  const g=document.getElementById('r'+i);g.setAttribute('transform','translate('+f1(p[0])+','+f1(p[1])+') scale('+(k).toFixed(4)+')');
  // gallop cycle (slows into the rein-up), then rear, then settle
  const run=t<st-0.25?1:Math.max(0,1-(t-(st-0.25))/0.25);const ph=t*2.6+d[4];
  const rear=t<st-0.18?0:(t<st+0.45?sm((t-(st-0.18))/0.24):1-sm((t-(st+0.45))/0.5));
  const rr=-34*rear;const pitch=run*4*Math.sin(ph*2*Math.PI);const bob=run*7*Math.sin(ph*4*Math.PI);
  const b=document.getElementById('r'+i+'_b');b.setAttribute('transform','rotate('+(rr+pitch).toFixed(2)+' -54 -4) translate(0,'+f1(-bob)+')');
  document.getElementById('r'+i+'_n').setAttribute('transform','rotate('+(-14*rear+3*run*Math.sin(ph*2*Math.PI+1)).toFixed(2)+' 50 -120)');
  const m=document.getElementById('r'+i+'_m');m.setAttribute('transform','rotate('+((8*run)-(10*rear)+18*rear).toFixed(2)+' 0 -150)');
  const s=Math.sin(ph*2*Math.PI),c=Math.cos(ph*2*Math.PI);
  function fr(off){const a=(run?38*Math.sin((ph+off)*2*Math.PI)+6:0);const fold=run*Math.max(0,Math.sin((ph+off)*2*Math.PI+1.2))*80;return [a*run+rear*(60),a*run-fold-rear*(70)];}
  function hd(off){const a=run*34*Math.sin((ph+off)*2*Math.PI)-4;const bend=18+run*Math.max(0,-Math.sin((ph+off)*2*Math.PI+0.8))*50;return [a+rear*28,a+bend-rear*10];}
  const lf=fr(.38),rf=fr(.48),lh=hd(0),rh=hd(.1);
  document.getElementById('r'+i+'_lf').setAttribute('d',legPath(leg([42,-106],lf[0],lf[1],38,40,16,false)));
  document.getElementById('r'+i+'_rf').setAttribute('d',legPath(leg([48,-104],rf[0],rf[1],38,40,16,false)));
  document.getElementById('r'+i+'_lh').setAttribute('d',legPath(leg([-46,-112],-lh[0]*-1+0,-(-lh[1])+0,36,38,18,true)));
  document.getElementById('r'+i+'_rh').setAttribute('d',legPath(leg([-40,-110],rh[0],rh[1],36,38,18,true)));
  const tw=Math.sin(ph*2*Math.PI*1.0)*8*run+rear*16;document.getElementById('r'+i+'_tail').setAttribute('d','M-60,-134 Q-92,'+f1(-136+tw)+' -104,'+f1(-104+tw*1.5)+' Q-96,'+f1(-112+tw)+' -64,-118 Z');
  return {p:p,k:k,run:run,ph:ph,st:st};}
const dustEls=[...document.getElementById('dust').children];
function dustFX(t,H){let n=0;for(let i=0;i<H.length;i++){const d=RD[i];for(let j=0;j<12;j++){const e=dustEls[n++];const born=d[5]-0.15-j*0.16;const age=t-born;
    if(age<0||age>1.0||born<0){e.setAttribute('opacity',0);continue;}const S=riderState(i,born);const p=P3([S.X-0.9,S.Y,0]);const k=CAM.f/p[2];const u=age/1.0;
    e.setAttribute('cx',f1(p[0]-u*k*0.9));e.setAttribute('cy',f1(p[1]-u*k*0.5));e.setAttribute('r',f1(k*(0.25+0.6*u)*(j===0?1.6:1)));e.setAttribute('opacity',((1-u)*.7).toFixed(2));}}}
// ---- the beacon: flares on beat 2 (0.836), the smoke column climbs; relays light one per beat on 2.09, 2.51, 2.93 ----
const smokeEls=[...document.getElementById('smoke').children];const IGN=0.836;
function smokeFX(t){for(let i=0;i<smokeEls.length;i++){const e=smokeEls[i];const born=IGN+i*0.06;const age=t-born;if(age<0){e.setAttribute('opacity',0);continue;}
    const r0=rng(i*7+1);const a=r0(),b=r0();const up=age*(150+60*a)+age*age*30;const drift=Math.pow(age,1.6)*(36+20*b)+Math.sin(age*3+i)*8;
    e.setAttribute('cx',f1(FIRE[0]+drift-6+12*a));e.setAttribute('cy',f1(FIRE[1]-14-up));e.setAttribute('r',f1(10+age*30+8*b));
    const lit=Math.max(0,1-age/0.6);e.setAttribute('fill',lit>0.3?'#C8B6A2':(i%%3?'#9A8F86':'#8A7F77'));e.setAttribute('stroke','#5E544D');e.setAttribute('stroke-width','2');e.setAttribute('opacity',Math.min(1,age/0.12)*Math.max(0,1-age/4.6)*.95);}
  const on=t<IGN?0:back((t-IGN)/0.3);const fl=document.getElementById('flame'),f2=document.getElementById('flame2');
  const h=(30+10*Math.sin(t*23)+6*Math.sin(t*37))*on,w=16*on;const x=FIRE[0],y=FIRE[1];
  fl.setAttribute('d','M'+f1(x-w)+','+f1(y)+' Q'+f1(x-w*1.1)+','+f1(y-h*.5)+' '+f1(x-w*.2+4*Math.sin(t*17))+','+f1(y-h)+' Q'+f1(x+w*.4)+','+f1(y-h*.55)+' '+f1(x+w*.9)+','+f1(y-h*.7)+' Q'+f1(x+w*1.2)+','+f1(y-h*.2)+' '+f1(x+w)+','+f1(y)+' Z');
  f2.setAttribute('d','M'+f1(x-w*.5)+','+f1(y-2)+' Q'+f1(x-w*.4)+','+f1(y-h*.4)+' '+f1(x)+','+f1(y-h*.62)+' Q'+f1(x+w*.5)+','+f1(y-h*.35)+' '+f1(x+w*.5)+','+f1(y-2)+' Z');
  const gl=document.getElementById('fglo');gl.setAttribute('cx',f1(x));gl.setAttribute('cy',f1(y-10));gl.setAttribute('r',f1(140*on*(1+.08*Math.sin(t*19))));
  for(let k=0;k<3;k++){const t0=2.09+k*0.418;const o=t<t0?0:back((t-t0)/0.25);const fx=RELAY[2-k][0],fy=RELAY[2-k][1];
    document.getElementById('rlf'+k).setAttribute('d','M'+f1(fx-5*o)+','+f1(fy)+' Q'+f1(fx)+','+f1(fy-16*o-3*Math.sin(t*20+k))+' '+f1(fx+5*o)+','+f1(fy)+' Z');
    const cs=document.getElementById('rls'+k).children;for(let j=0;j<cs.length;j++){const age=t-t0-j*0.07;const e=cs[j];if(age<0){e.setAttribute('opacity',0);continue;}
      e.setAttribute('cx',f1(fx+Math.pow(age,1.5)*14));e.setAttribute('cy',f1(fy-6-age*60));e.setAttribute('r',f1(3+age*8));e.setAttribute('fill','#9A8F86');e.setAttribute('opacity',(Math.min(1,age/0.1)*Math.max(0,1-age/2.5)*.85).toFixed(2));}}}
// ---- 你 on the wall walk: shades its eyes at the riders, startles at the flare, points at the beacon, cheers at the rein-up ----
const fig=document.getElementById('fig'),csh=document.getElementById('csh'),bub=document.getElementById('bub');
const KP={crouch:[[0,0],[0.70,0],[0.80,.2],[0.90,0],[1.60,0],[1.672,.15],[1.75,0],[2.09,.1],[2.2,0],[2.51,.1],[2.6,0],[2.93,.1],[3.1,.3],[3.344,0],[3.5,.12],[3.8,0],[4.18,.1],[4.3,0],[4.6,.1],[4.7,0]],
  hop:[[0,0],[0.80,0],[0.88,26],[0.96,0],[3.20,0],[3.344,44],[3.50,0],[5.016,0]],
  lean:[[0,-8],[0.8,-8],[1.0,-4],[1.672,-6],[3.1,-6],[3.344,0],[3.9,0],[4.2,-6],[5.016,-6]],look:[[0,-8],[0.8,-8],[1.0,-6],[1.672,-6],[3.344,0],[3.9,0],[4.2,-6]],
  tilt:[[0,-10],[0.8,-10],[0.9,8],[1.2,-8],[3.1,-8],[3.344,0],[3.9,4],[4.2,-8],[5.016,-8]],
  r:[[0,[58,84]],[0.8,[58,84]],[0.9,[20,40]],[1.2,[58,84]],[3.1,[58,84]],[3.344,[-62,-80]],[3.9,[-62,-80]],[4.2,[58,84]],[5.016,[58,84]]],
  l:[[0,[-160,-28]],[0.8,[-160,-28]],[0.9,[160,140]],[1.2,[-158,-150]],[3.1,[-158,-150]],[3.344,[-118,-100]],[3.9,[-118,-100]],[4.2,[-158,-150]],[5.016,[-158,-150]]]};
function you(t,c){const m=LT(.8,c);const s=YK*1.5/334*m[0]*1.0;const bx=m[0]*YOU[0]+m[1],by=m[0]*YOU[1]+m[2];
  const p={crouch:track(KP.crouch,t),lean:track(KP.lean,t),look:track(KP.look,t),r:track(KP.r,t),l:track(KP.l,t)};const hop=track(KP.hop,t,x=>Math.sin(x*Math.PI/2));
  const br=1+Math.sin(t*2*Math.PI/(4*BEAT))*.012;const J=placeJ(poseJ(p),bx,by-hop*s,s,1,br);
  fig.innerHTML=figureSVG(J,120*s,true,track(KP.tilt,t),'url(#gwf)');csh.setAttribute('cx',f1(bx));csh.setAttribute('cy',f1(by+3));csh.setAttribute('rx',f1(58*s));csh.setAttribute('ry',f1(9*s));
  return {hx:J.head[0],ht:J.head[1]-120*s*.28*1.08,m:m};}
const bnf=document.getElementById('bnf'),bnb=document.getElementById('bnb'),ban=document.getElementById('banner');
window.render=function(t){const c=cam(t);
  for(const k in LY)EL[k].setAttribute('transform',mstr(LT(LY[k][0],c)));document.getElementById('cam').setAttribute('transform','rotate('+c.roll.toFixed(3)+' 960 540)');
  const H=[];for(let i=0;i<RD.length;i++)H.push(horse(i,t));dustFX(t,H);smokeFX(t);
  // a Ming banner on the near merlon, flapping in the wind (foreground layer)
  ban.setAttribute('transform','translate(1880,700)');const N=10,Wd=-230,Hd=130;let top=[],bot=[];
  for(let i=0;i<=N;i++){const x=i/N;const w=Math.sin(t*6.5-x*4)*22*x;top.push([x*Wd,-326+w+x*x*14]);bot.push([x*Wd*(1-.1*x),-326+Hd*(1-.5*x)+w*1.2+x*x*14]);}
  bnf.setAttribute('d','M'+top.concat(bot.slice().reverse()).map(q=>f1(q[0])+','+f1(q[1])).join(' L')+' Z');bnb.setAttribute('d','M'+top.map(q=>f1(q[0])+','+f1(q[1]+8)).join(' L'));
  const Y=you(t,c);const R=c.roll*Math.PI/180;const dx=Y.hx-960,dy=Y.ht-540;const hx=960+dx*Math.cos(R)-dy*Math.sin(R),hy=540+dx*Math.sin(R)+dy*Math.cos(R);setBubble(bub,hx,hy-6,t,1);
};
''' % dict(CAM=WCAM.js(), FIRE=json.dumps([round(v, 1) for v in A['fire']]), RELAY=json.dumps([[round(a, 1), round(b, 1)] for a, b in A['relay']]),
           YOU=json.dumps([round(v, 1) for v in A['you']]), YK=f"{A['you_k']:.3f}")
    return page('greatwall_what', 5.016, body, js)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    open(f'{out}/greatwall_when.html', 'w').write(when_page())
    if 'what_page' in globals(): open(f'{out}/greatwall_what.html', 'w').write(what_page())
    print('ok', out)
