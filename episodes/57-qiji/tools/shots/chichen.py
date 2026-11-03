"""ep57 · 奇琴伊察: the two animated explanation shots (pages for render_shot.py), see BRIEF.md.
  chichen_when  3.344 s  时光倒流 on the coded scene (chichen_vector.py, split into 7 depth layers): 你 in the foreground
                watching the pyramid; the colour drains to sepia, grain and scratches flicker, the clouds race back,
                the modern snake-plant garden sinks back into the ground, the camera pushes in with a slight roll;
                the year rolls 2026 → 1100 and lands on the bar; then the pyramid fills with its own people
                (a crowd at the foot, climbers on the stair, copal smoke from the temple). 你 shades its eyes,
                looks around, grabs its head, points at the year, then gasps at the crowd.
  chichen_what  5.016 s  the equinox serpent (hist_a.chichen_serpent rebuilt in 6 layers): the 7 light triangles crawl
                down the balustrade one per beat while the camera pushes from the wide view down to the serpent head;
                你 walks up to look, the head lights on the bar-3 downbeat and 你 jumps back; the camera pulls back
                and cranes up over the whole serpent of light.
usage: chichen.py OUTDIR   → OUTDIR/chichen_when.html, OUTDIR/chichen_what.html

This file is also the shared toolkit for the other stops' shot scripts (machu.py imports it):
run_scene / split (exec a scene script with layer markers), the 2.5D camera, the 你 rig (you_figure.figure ported
to JS so render(t) can pose it every frame), the 你 bubble, film grain + scratches, the rolling year counter."""
import sys, os, re, json, math, random
HERE = os.path.dirname(os.path.abspath(__file__)); TOOLS = os.path.dirname(HERE)
if TOOLS not in sys.path: sys.path.insert(0, TOOLS)
_argv = sys.argv; sys.argv = sys.argv[:1]          # hist_a reads sys.argv[1] at import
import hist_a as HA
sys.argv = _argv

INK, GOLD, CREAM, DARK = '#2A211B', '#F2C66E', '#FFF6E6', '#1E1612'
BEAT, BAR = 0.418, 1.672
WENKAI = 'file:///home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai/wenkai-bold.css'


# =====================================================================================================
# scene scripts → depth layers
# =====================================================================================================
def run_scene(fname, markers, patches=(), extra=None):
    """exec a tools/ scene script (minus its file write) with <!--L:key--> markers put in front of the given
    anchor lines and optional source patches; returns its namespace (g = the painter's-order element list)"""
    src = open(os.path.join(TOOLS, fname)).read()
    tail = "open(sys.argv[1], 'w').write('\\n'.join(g)); print('ok', len(g), 'elements')"
    assert tail in src; src = src.replace(tail, '')
    for key, anchor in markers:
        assert src.count(anchor) == 1, anchor
        src = src.replace(anchor, f"g.append('<!--L:{key}-->')\n" + anchor)
    for a, b in patches:
        assert src.count(a) == 1, a
        src = src.replace(a, b)
    ns = {'__name__': 'shot_scene'}; ns.update(extra or {})
    exec(compile(src, fname, 'exec'), ns)
    return ns

def split(g):
    """painter's-order list → (defs inner text, {layer: [elements]}), cut at the markers"""
    defs, L, cur = [], {'pre': []}, 'pre'
    for e in g[1:-1]:
        m = re.match(r'<!--L:(\w+)-->$', e)
        if m: cur = m.group(1); L[cur] = []; continue
        if e.startswith('<defs>'): defs.append(e[6:-7]); continue
        L[cur].append(e)
    return ''.join(defs), L


# =====================================================================================================
# the page
# =====================================================================================================
def svg_layer(id_, inner, style='', defs=''):
    return (f'<svg id="{id_}" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:hidden;{style}">'
            f'<defs>{defs}</defs>{inner}</svg>')

def page(dur, body, data, js):
    return ('<!doctype html><html><head><meta charset="utf-8">'
            f'<link rel="stylesheet" href="{WENKAI}">'
            '<style>html,body{margin:0;background:#000}</style></head><body>'
            f'<div id="f" style="position:relative;width:1920px;height:1080px;overflow:hidden;background:#000">{body}</div>'
            f'<script>window.DUR={dur};\nconst DATA={json.dumps(data)};\n{JSLIB}\n{js}\nwindow.render(0);</script></body></html>')

# the 「你」 bubble (tail tip at the origin = just above the head)
BUBBLE = (f'<g id="bub" opacity="0"><g filter="url(#bds)"><path d="M-16,-28 L0,0 L18,-28 Z" fill="{GOLD}" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
          f'<rect x="-64" y="-120" width="128" height="96" rx="30" fill="{GOLD}" stroke="{INK}" stroke-width="5"/>'
          f'<rect x="-20" y="-32" width="40" height="10" fill="{GOLD}"/></g>'
          f'<text x="0" y="-50" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="66" fill="{INK}">你</text></g>')
BUBBLE_DEFS = '<filter id="bds" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#1A1410" flood-opacity=".35"/></filter>'

def fig_defs(stops, x1=0, y1=0, x2=1, y2=1, sh=(4, 8, 6, .3)):
    """the 你 fill (a light-matched gradient, objectBoundingBox like you_figure's) and its drop shadow, in rig units"""
    st = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return (f'<linearGradient id="yf" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{st}</linearGradient>'
            f'<filter id="yds" x="-40%" y="-30%" width="180%" height="160%"><feDropShadow dx="{sh[0]}" dy="{sh[1]}" stdDeviation="{sh[2]}" flood-color="#1A1410" flood-opacity="{sh[3]}"/></filter>'
            '<filter id="ysb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>')

# film grain (re-seeded 24 times a second), scratches and dust, vignette
GRAIN_DEFS = ('<filter id="gn" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse"><feTurbulence id="turb" type="fractalNoise" baseFrequency=".78" numOctaves="2" seed="1"/>'
              '<feColorMatrix type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1"/><feComponentTransfer><feFuncR type="linear" slope="1.7" intercept="-.35"/>'
              '<feFuncG type="linear" slope="1.7" intercept="-.35"/><feFuncB type="linear" slope="1.7" intercept="-.35"/></feComponentTransfer></filter>'
              '<radialGradient id="vig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".45" stop-color="#1A0F08" stop-opacity="0"/><stop offset="1" stop-color="#1A0F08" stop-opacity=".85"/></radialGradient>')
GRAIN = (svg_layer('grainS', '<rect width="1920" height="1080" filter="url(#gn)"/>', 'mix-blend-mode:overlay;opacity:0', GRAIN_DEFS)
         + svg_layer('fxS', '<rect id="vigR" width="1920" height="1080" fill="url(#vig)" opacity="0"/><g id="scr"></g>'))

def counter_svg(target, pre, suf, nx, ny, fs=184, dw=None):
    """the big year: 4 rolling digit strips (clipped, blurred by speed) + small gold labels before / after.
    nx, ny: left x and baseline of the number (screen px)."""
    dw = dw or fs * .58; lh = fs * 1.02; o = []; defs = []
    for i in range(4):
        x0 = nx + dw * i; cx = x0 + dw / 2
        defs.append(f'<clipPath id="cc{i}"><rect x="{x0 - 6:.1f}" y="{ny - fs * .9:.1f}" width="{dw + 12:.1f}" height="{fs * 1.08:.1f}"/></clipPath>'
                    f'<filter id="cb{i}" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur id="cbg{i}" stdDeviation="0 0"/></filter>')
        digits = ''.join(f'<text x="{cx:.1f}" y="{ny + lh * d:.1f}">{d % 10}</text>' for d in range(-1, 12))
        o.append(f'<g clip-path="url(#cc{i})"><g id="cs{i}" filter="url(#cb{i})">{digits}</g></g>')
    defs.append('<filter id="cds" x="-20%" y="-30%" width="140%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#120A06" flood-opacity=".55"/></filter>')
    num = (f'<g font-family="Noto Sans CJK SC" font-weight="900" font-size="{fs}" text-anchor="middle" fill="{CREAM}" stroke="{INK}" stroke-width="{fs * .085:.1f}" '
           f'stroke-linejoin="round" paint-order="stroke">{"".join(o)}</g>')
    lab = lambda id_, x, y, s, anchor, size: (f'<text id="{id_}" x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-family="LXGW WenKai" font-weight="700" font-size="{size}" '
                                             f'fill="{GOLD}" stroke="{DARK}" stroke-width="{size * .16:.1f}" stroke-linejoin="round" paint-order="stroke" opacity="0">{s}</text>')
    labels = ''
    if pre: labels += lab('lpre', nx + 4, ny - fs * .86, pre, 'start', 62)
    if suf: labels += lab('lsuf', nx + dw * 4 + 16, ny - 6, suf, 'start', 66)
    cx, cy = nx + dw * 2, ny - fs * .36
    return (f'<g id="cnt" opacity="0" data-cx="{cx:.1f}" data-cy="{cy:.1f}"><g id="cntn" filter="url(#cds)">{num}</g>{labels}</g>', ''.join(defs),
            dict(target=target, lh=lh, cx=cx, cy=cy))


# =====================================================================================================
# the JS side: easing, tracks, camera, the 你 rig, bubble, grain, counter, smoke, silhouettes
# =====================================================================================================
JSLIB = r'''
const cl=x=>Math.min(1,Math.max(0,x));
const EASE={l:x=>cl(x), ss:x=>{x=cl(x);return x*x*(3-2*x)}, io:x=>{x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},
  o:x=>{x=cl(x);return 1-Math.pow(1-x,3)}, o2:x=>{x=cl(x);return 1-(1-x)*(1-x)}, i:x=>{x=cl(x);return x*x*x}, i2:x=>{x=cl(x);return x*x},
  ob:x=>{x=cl(x)-1;const s=1.9;return 1+(s+1)*x*x*x+s*x*x}, ob2:x=>{x=cl(x)-1;const s=3.2;return 1+(s+1)*x*x*x+s*x*x}, h:x=>x>=1?1:0};
const span=(t,a,b,e)=>(EASE[e||'ss'])((t-a)/(b-a));
const hash=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const BEAT=.418, BAR=1.672;
const f1=v=>v.toFixed(1), f2=v=>v.toFixed(2);
const cosd=a=>Math.cos(a*Math.PI/180), sind=a=>Math.sin(a*Math.PI/180);
const $=id=>document.getElementById(id);
function mix(a,b,u){if(typeof a==='number')return a+(b-a)*u;if(typeof a==='string')return u<.5?a:b;if(Array.isArray(a))return a.map((v,i)=>mix(v,b[i],u));const o={};for(const k in a)o[k]=(k in b)?mix(a[k],b[k],u):a[k];return o}
function track(K,t){if(t<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++){if(t<=K[i][0]){const u=EASE[K[i][2]||'io']((t-K[i-1][0])/(K[i][0]-K[i-1][0]));return mix(K[i-1][1],K[i][1],u)}}return K[K.length-1][1]}
// a short pulse peaking at time c (for hits on beats)
const pulse=(t,c,w)=>Math.exp(-Math.pow((t-c)/(w||.07),2));
function beatPulse(t,from,to,w){let s=0;for(let k=Math.ceil((from-.3)/BEAT);k*BEAT<=to+.3;k++){const c=k*BEAT;if(c>=from-1e-6&&c<=to+1e-6)s+=pulse(t,c,w)}return s}

// ---- 2.5D camera: layer at relative depth D (1 = the subject plane); C = {S0,fx,fy,z,c,dx,dy,roll,jx,jy}
// z: focal zoom (no parallax), c: dolly toward the subject (parallax), dx/dy: truck / crane in subject-plane px
function camMat(C,D){const k=C.z*D/(D-C.c), s=C.S0*k, sh=C.S0*C.z/(D-C.c);
  const tx=-s*C.fx-sh*C.dx, ty=-s*C.fy-sh*C.dy, r=C.roll*Math.PI/180, co=Math.cos(r), si=Math.sin(r);
  return [s*co,s*si,-s*si,s*co,960+co*tx-si*ty+(C.jx||0),540+si*tx+co*ty+(C.jy||0)]}
const mstr=m=>'matrix('+m.map(v=>v.toFixed(5)).join(',')+')';
const app=(m,p)=>[m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];
const MATS={};
function setL(id,C,D){const m=camMat(C,D);MATS[id]=m;const e=$(id);if(e)e.setAttribute('transform',mstr(m));return m}

// ---- the 你 rig: you_figure.figure() ported 1:1, plus a face that can look around and change expression
function bez(a,c,b,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]])}return o}
function limb(a,e,b,w0,w1,fill){const c=[2*e[0]-(a[0]+b[0])/2,2*e[1]-(a[1]+b[1])/2];const p=bez(a,c,b,24);const L=[],R=[];
  for(let i=0;i<p.length;i++){const j=Math.min(i+1,p.length-1),k=Math.max(i-1,0);const dx=p[j][0]-p[k][0],dy=p[j][1]-p[k][1];const d=Math.hypot(dx,dy)||1;const nx=-dy/d,ny=dx/d;const w=(w0+(w1-w0)*i/(p.length-1))/2;L.push([p[i][0]+nx*w,p[i][1]+ny*w]);R.push([p[i][0]-nx*w,p[i][1]-ny*w])}
  const q=L.concat(R.reverse());return '<path d="M'+q.map(v=>f1(v[0])+','+f1(v[1])).join(' L')+'Z" fill="'+fill+'"/><circle cx="'+f1(a[0])+'" cy="'+f1(a[1])+'" r="'+f1(w0/2)+'" fill="'+fill+'"/>'}
function figure(J,u,o){
  const fill=o.fill||'url(#yf)', nk=J.neck, hc=[(J.l_hip[0]+J.r_hip[0])/2,(J.l_hip[1]+J.r_hip[1])/2], tl=Math.hypot(nk[0]-hc[0],nk[1]-hc[1]);
  const side=J.r_shoulder[0]>J.l_shoulder[0]?1:-1;
  const lr=[nk[0]-side*u*.3,nk[1]+tl*.14], rr=[nk[0]+side*u*.3,nk[1]+tl*.14], lh=[hc[0]-side*u*.17,hc[1]], rh=[hc[0]+side*u*.17,hc[1]];
  let g='';
  for(const [root,e,w] of [[lr,'l_elbow','l_wrist'],[rr,'r_elbow','r_wrist']]){g+=limb(root,J[e],J[w],u*.15,u*.095,fill);g+='<circle cx="'+f1(J[w][0])+'" cy="'+f1(J[w][1])+'" r="'+f1(u*.072)+'" fill="'+fill+'"/>'}
  for(const [root,k,a] of [[lh,'l_knee','l_ankle'],[rh,'r_knee','r_ankle']]){if(!J[k])continue;g+=limb(root,J[k],J[a],u*.19,u*.12,fill);const fx=J[a][0]>=root[0]?1:-1;
    g+='<ellipse cx="'+f1(J[a][0]+fx*u*.05)+'" cy="'+f1(J[a][1]+u*.03)+'" rx="'+f1(u*.11)+'" ry="'+f1(u*.065)+'" fill="'+fill+'"/>'}
  const wc=u*.34, ww=u*.3, wh=u*.36, n0=nk[0], n1=nk[1], h0=hc[0], h1=hc[1];
  g+='<path d="M'+f1(n0-wc)+','+f1(n1+tl*.08)+' C'+f1(n0-wc*1.05)+','+f1(n1-tl*.06)+' '+f1(n0+wc*1.05)+','+f1(n1-tl*.06)+' '+f1(n0+wc)+','+f1(n1+tl*.08)+
     ' C'+f1(n0+ww*1.05)+','+f1(n1+tl*.5)+' '+f1(h0+wh*1.15)+','+f1(h1+tl*.02)+' '+f1(h0+wh*.6)+','+f1(h1+tl*.13)+
     ' Q'+f1(h0)+','+f1(h1+tl*.2)+' '+f1(h0-wh*.6)+','+f1(h1+tl*.13)+' C'+f1(h0-wh*1.15)+','+f1(h1+tl*.02)+' '+f1(n0-ww*1.05)+','+f1(n1+tl*.5)+' '+f1(n0-wc)+','+f1(n1+tl*.08)+' Z" fill="'+fill+'"/>';
  const hx=J.head[0], hy=J.head[1], hr=u*.28, lk=o.look||[0,0], ex=hr*.34*(1-.12*Math.abs(lk[0])), ey=hr*.05, dx=lk[0]*hr*.26, dy=lk[1]*hr*.17, E='#2B2724';
  g+='<g transform="rotate('+f2(o.tilt||0)+' '+f1(hx)+' '+f1(hy)+')"><ellipse cx="'+f1(hx)+'" cy="'+f1(hy)+'" rx="'+f1(hr)+'" ry="'+f1(hr*1.08)+'" fill="'+fill+'"/>';
  const ex1=hx-ex+dx, ex2=hx+ex+dx, ey1=hy+ey+dy, mx=hx+dx*.8, my=hy+hr*.3+dy*.6, xp=o.expr||'smile';
  if(xp==='closed'||xp==='joy'){const s=xp==='joy'?-1:1, r=hr*.11;
    for(const x of [ex1,ex2])g+='<path d="M'+f1(x-r)+','+f1(ey1)+' Q'+f1(x)+','+f1(ey1+s*r*1.1)+' '+f1(x+r)+','+f1(ey1)+'" fill="none" stroke="'+E+'" stroke-width="'+f1(hr*.07)+'" stroke-linecap="round"/>'}
  else{const k=xp==='wide'?1.35:1; for(const x of [ex1,ex2])g+='<ellipse cx="'+f1(x)+'" cy="'+f1(ey1)+'" rx="'+f1(hr*.075*k)+'" ry="'+f1(hr*.1*k)+'" fill="'+E+'"/>'}
  if(xp==='o'||xp==='wide')g+='<ellipse cx="'+f1(mx)+'" cy="'+f1(my+hr*.06)+'" rx="'+f1(hr*.09)+'" ry="'+f1(hr*.12)+'" fill="'+E+'"/>';
  else g+='<path d="M'+f1(mx-hr*.16)+','+f1(my)+' Q'+f1(mx)+','+f1(my+hr*(xp==='joy'?.22:.15))+' '+f1(mx+hr*.16)+','+f1(my)+'" fill="none" stroke="'+E+'" stroke-width="'+f1(hr*.055)+'" stroke-linecap="round"/>';
  for(const s of [-1,1])g+='<circle cx="'+f1(hx+s*hr*.56+dx*.55)+'" cy="'+f1(hy+hr*.3+dy*.4)+'" r="'+f1(hr*.14)+'" fill="#F4A9A0" opacity=".45"/>';
  g+='</g>';
  return '<g filter="url(#yds)">'+g+'</g>'}
// pose (rig units, origin between the feet, u = 120) → joints; arms from screen angles with fixed segment lengths (opt_comp.arms)
function joints(p){const hx=p.hip[0], hy=-120+p.hip[1];
  const J={l_hip:[-22+hx,hy],r_hip:[22+hx,hy],l_knee:p.lk,r_knee:p.rk,l_ankle:p.lf,r_ankle:p.rf};
  const nk=[p.nk[0],-262+p.nk[1]];J.neck=nk;J.head=[nk[0]+p.hd[0],nk[1]-36+p.hd[1]];
  J.l_shoulder=[nk[0]-55,nk[1]+12];J.r_shoulder=[nk[0]+55,nk[1]+12];
  const ry=nk[1]+Math.hypot(nk[0]-hx,nk[1]-hy)*.14;
  for(const [s,a,sx] of [['r',p.ra,1],['l',p.la,-1]]){const x0=nk[0]+sx*36;const e=[x0+64*cosd(a[0]),ry+64*sind(a[0])];J[s+'_elbow']=e;J[s+'_wrist']=[e[0]+60*cosd(a[1]),e[1]+60*sind(a[1])]}
  return J}
// the posed figure in layer coordinates: base (feet) bx,by, scale s (px per rig unit); returns svg + head point + head radius
function you(p,bx,by,s,opt){const J=joints(p);const X=bx+p.root[0]*s, Y=by+p.root[1]*s;
  let g='';if(opt&&opt.shadow)g+=opt.shadow(X,Y,s,p);
  g+='<g transform="translate('+f1(X)+','+f1(Y)+') scale('+s.toFixed(4)+')">'+figure(J,120,{tilt:p.tilt,look:p.look,expr:p.expr})+'</g>';
  return {svg:g, head:[X+J.head[0]*s, Y+J.head[1]*s], hr:120*.28*1.08*s}}
function breathe(p,t,amp){const q=JSON.parse(JSON.stringify(p));const b=Math.sin(t*2*Math.PI/(2*BAR));q.nk[1]+=b*(amp||2.5);q.ra[0]+=b*1.5;q.la[0]-=b*1.5;return q}

// ---- bubble: pops in during the first .4 s, follows the head with a slight bob; hidden when the head is off frame
function bubble(t,head,hr,lm){const e=$('bub');const p=app(lm,head);const sc=Math.hypot(lm[0],lm[1]);
  const x=p[0], y=p[1]-hr*sc-14+3.5*Math.sin(t*2*Math.PI/(2*BEAT));
  const k=t<.4?.4+.6*EASE.ob2(t/.4):1, on=(x>-40&&x<1960&&p[1]>-20&&p[1]<1100)?1:0;
  e.setAttribute('transform','translate('+f1(x)+','+f1(y)+') scale('+k.toFixed(3)+')');e.setAttribute('opacity',on*cl(t/.06));return [x,y]}

// ---- film: grain re-seeded at 24 fps, gate weave, scratches + dust, vignette
function film(t,a){const fr=Math.floor(t*24);$('grainS').style.opacity=(.55*a).toFixed(3);$('turb').setAttribute('seed',1+fr%97);
  $('vigR').setAttribute('opacity',(.75*a).toFixed(3));
  let s='';if(a>.05){for(let k=0;k<3;k++){const h=hash(fr*7+k);if(h<.45)continue;const x=hash(fr*13+k*3)*1920, w=1+2*hash(fr*5+k), o=(.18+.3*hash(fr*11+k))*a;
      s+='<path d="M'+f1(x)+',-10 Q'+f1(x+(hash(fr+k*9)-.5)*30)+',540 '+f1(x+(hash(fr*3+k)-.5)*16)+',1090" stroke="'+(k%2?'#FFF3DC':'#2A1A10')+'" stroke-width="'+f1(w)+'" fill="none" opacity="'+f2(o)+'"/>'}
    for(let k=0;k<5;k++){const h=hash(fr*17+k*5);if(h<.55)continue;const x=hash(fr*19+k)*1920, y=hash(fr*23+k)*1080, r=1.5+4*hash(fr*29+k);
      s+='<ellipse cx="'+f1(x)+'" cy="'+f1(y)+'" rx="'+f1(r)+'" ry="'+f1(r*(.4+hash(k+fr)))+'" fill="'+(k%2?'#FFF3DC':'#1E120A')+'" opacity="'+f2(.5*a)+'"/>'}}
  $('scr').innerHTML=s;
  const fr12=Math.floor(t*12);return [(hash(fr12*31)-.5)*2.4*a,(hash(fr12*37)-.5)*2.4*a]}
function sepia(a,extra){return 'sepia('+f2(.92*a)+') saturate('+f2(1-.25*a)+') contrast('+f2(1+.06*a)+') brightness('+f2((1-.04*a)*(extra||1))+')'}

// ---- the year counter: v(t) rolls from 2026 to the target with an ease-out, lands at TL with a 1.15 → 1 punch
function counter(t,T0,TL,CN){const g=$('cnt');if(t<T0){g.setAttribute('opacity',0);return}
  const u=cl((t-T0)/(TL-T0)), e=1-Math.pow(1-u,3.2), v=2026+(CN.target-2026)*e;
  const dv=Math.abs((CN.target-2026)*3.2*Math.pow(1-u,2.2)/(TL-T0));
  const digs=[Math.floor(v/1000)%10,Math.floor(v/100)%10,Math.floor(v/10)%10,v%10];
  for(let i=0;i<4;i++){const p=10**(3-i);let pos;if(i===3)pos=v%10;else{const low=v%p;pos=Math.floor(v/p)%10+Math.max(0,low-(p-1))}
    $('cs'+i).setAttribute('transform','translate(0,'+f1(-pos*CN.lh)+')');
    const sp=dv/p; $('cbg'+i).setAttribute('stdDeviation','0 '+f1(Math.min(16,sp*.55)))}
  const pop=t<TL?span(t,T0,T0+.22,'ob'):1, punch=t>=TL?1+.15*(1-EASE.o((t-TL)/.28)):1, k=(t<TL?.7+.3*pop:1)*punch;
  g.setAttribute('opacity',f2(cl((t-T0)/.12)));
  g.setAttribute('transform','translate('+CN.cx+','+CN.cy+') scale('+k.toFixed(4)+') translate('+(-CN.cx)+','+(-CN.cy)+')');
  for(const id of ['lpre','lsuf']){const e=$(id);if(!e)continue;const a=t>=TL?EASE.ob((t-TL)/.3):0;e.setAttribute('opacity',f2(cl((t-TL)/.08)));
    const bb=e.getBBox(), cx=bb.x+bb.width/2, cy=bb.y+bb.height/2, s=.4+.6*a;
    e.setAttribute('transform','translate('+f1(cx)+','+f1(cy)+') scale('+f2(s)+') translate('+f1(-cx)+','+f1(-cy)+')')}}

// ---- hearth / incense smoke: puffs rising along a breezy wisp, looping (deterministic in t)
function smoke(x,y,h,t,seed,sc,col,op){sc=sc||1;let s='';const N=13;
  for(let i=0;i<N;i++){const ph=((t*.42+i/N+hash(seed)*.7)%1+1)%1, cx=x+(26*ph*ph+5*Math.sin(ph*7+seed))*sc, cy=y-h*ph, r=(3.5+12*ph)*sc;
    s+='<circle cx="'+f1(cx)+'" cy="'+f1(cy)+'" r="'+f1(r)+'" fill="'+(col||'#F2EEE6')+'" opacity="'+f2((op||.62)*(1-ph)*cl(ph*7))+'"/>'}
  return s}

// ---- silhouette parts (hist_a.sil format) drawn in JS, for figures whose limbs move
function silJS(parts,x,y,s,flip,rim,dark,rimc){const fx=flip?-1:1;
  const body=(col,dx,dy)=>{let o='';for(const q of parts){if(q[0]==='p')o+='<polygon points="'+q[1].map(v=>f1(v[0]+dx)+','+f1(v[1]+dy)).join(' ')+'" fill="'+col+'"/>';
    else if(q[0]==='l')o+='<polyline points="'+q[1].map(v=>f1(v[0]+dx)+','+f1(v[1]+dy)).join(' ')+'" fill="none" stroke="'+col+'" stroke-width="'+q[2]+'" stroke-linecap="round" stroke-linejoin="round"/>';
    else o+='<ellipse cx="'+f1(q[1]+dx)+'" cy="'+f1(q[2]+dy)+'" rx="'+q[3]+'" ry="'+q[4]+'" fill="'+col+'"/>'}return o};
  return '<g transform="translate('+f1(x)+','+f1(y)+') scale('+(fx*s).toFixed(3)+','+s.toFixed(3)+')">'+body(rimc,fx*rim[0]/s,rim[1]/s)+body(dark,0,0)+'</g>'}
'''

# rig poses (units): arm angles in screen degrees (0 = right, 90 = down), legs as knee / foot points
def pose(**kw):
    p = dict(ra=[60, 86], la=[120, 94], lk=[-25, -60], lf=[-26, 0], rk=[25, -60], rf=[26, 0], hip=[0, 0], nk=[0, 0], hd=[0, 0],
             tilt=6, look=[0, 0], expr='smile', root=[0, 0])
    for k, v in kw.items(): p[k] = list(v) if isinstance(v, tuple) else v
    return p
ARMS = dict(hang=dict(ra=[60, 86], la=[120, 94]), hips=dict(ra=[43, 131], la=[137, 49]),
            shade=dict(la=[222, -23], ra=[43, 131]), grab=dict(ra=[-35, 209], la=[215, -29]),
            cheer=dict(ra=[-58, -76], la=[238, 256]), fling=dict(ra=[-25, -60], la=[205, 240]),
            together=dict(ra=[82, 150], la=[98, 30]))
LEGS = dict(stand=dict(lk=[-25, -60], lf=[-26, 0], rk=[25, -60], rf=[26, 0]), wide=dict(lk=[-34, -60], lf=[-44, 0], rk=[34, -60], rf=[44, 0]),
            crouch=dict(lk=[-42, -50], lf=[-34, 0], rk=[42, -50], rf=[34, 0], hip=[0, 18]),
            tuck=dict(lk=[-46, -70], lf=[-70, -36], rk=[46, -70], rf=[70, -36]),
            stepL=dict(lk=[-30, -66], lf=[-34, -14], rk=[25, -58], rf=[24, 0]), stepR=dict(lk=[-25, -58], lf=[-24, 0], rk=[30, -66], rf=[34, -14]))
def P(*parts, **kw):
    d = {}
    for q in parts: d.update(ARMS.get(q) or LEGS.get(q) or {})
    d.update(kw); return pose(**d)


# =====================================================================================================
# 「穿越时间轴」 — the shared blueprint _when device (the same at every stop)
# =====================================================================================================
BP0, BP1, CHALK = '#1D3557', '#16263F', '#F3F0E6'
DYNASTIES = [(-202, 220, '汉'), (266, 420, '晋'), (420, 589, '南北朝'), (618, 907, '唐'), (960, 1279, '宋'), (1279, 1368, '元'),
             (1368, 1644, '明'), (1644, 1912, '清'), (1912, 1949, '民国')]
RY = 776                                   # top edge of the ruler: 你 runs on it

def pth(*runs, close=False): return ' '.join('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in r) + (' Z' if close else '') for r in runs)
def dw(d, a, b, w=3.0, op=1.0, col=CHALK, extra=''):
    """a line that draws itself between t = a and b (stroke-dashoffset over a normalised pathLength)"""
    return (f'<path class="dw" data-a="{a:.3f}" data-b="{b:.3f}" data-o="{op}" d="{d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" '
            f'fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" opacity="0" {extra}/>')
def fd(inner, a, b, op=1.0, id_=''):
    """a group that fades in between t = a and b"""
    return f'<g class="fd" data-a="{a:.3f}" data-b="{b:.3f}" data-o="{op}" opacity="0"{f" id={chr(34)}{id_}{chr(34)}" if id_ else ""}>{inner}</g>'
def dashed(d, w=2.0, op=.6, dash='10 8', col=CHALK):
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" stroke-dasharray="{dash}" stroke-linecap="round" opacity="{op}"/>'
def ctext(x, y, s, size=26, anchor='middle', col=CHALK, op=1.0, extra=''):
    return (f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-family="LXGW WenKai" font-weight="700" font-size="{size}" fill="{col}" '
            f'opacity="{op}" {extra}>{s}</text>')
def dim_v(x, ya, yb, label, a, b, side=1):
    """a vertical dimension line with ticks and the label beside it (draws, then the label fades in)"""
    o = dw(pth([(x - 10, ya), (x + 10, ya)], [(x - 10, yb), (x + 10, yb)]), a, a + .12, 2, .8)
    o += dw(pth([(x, yb), (x, ya)]), a + .05, b, 2, .8)
    o += dw(pth([(x - 7, ya + 14), (x, ya), (x + 7, ya + 14)], [(x - 7, yb - 14), (x, yb), (x + 7, yb - 14)]), b - .1, b, 2, .8)
    o += fd(ctext(x + side * 16, (ya + yb) / 2 + 9, label, 26, 'start' if side > 0 else 'end'), b - .05, b + .15)
    return o
def dim_h(y, xa, xb, label, a, b):
    o = dw(pth([(xa, y - 10), (xa, y + 10)], [(xb, y - 10), (xb, y + 10)]), a, a + .12, 2, .8)
    xm = (xa + xb) / 2
    o += dw(pth([(xm - 34, y), (xa, y)], [(xm + 34, y), (xb, y)]), a + .05, b, 2, .8)
    o += dw(pth([(xa + 14, y - 7), (xa, y), (xa + 14, y + 7)], [(xb - 14, y - 7), (xb, y), (xb - 14, y + 7)]), b - .1, b, 2, .8)
    o += fd(ctext(xm, y + 9, label, 26), b - .05, b + .15)
    return o

def tool_set_square(x, y, s=1.0, rot=0, op=.5):
    q = lambda pts: ' '.join(f'{px * s:.1f},{py * s:.1f}' for px, py in pts)
    ticks = ''.join(f'M{i * 20 * s:.1f},0 L{i * 20 * s:.1f},{-(10 if i % 5 else 18) * s:.1f} ' for i in range(1, 11))
    return (f'<g class="tool" data-x="{x}" data-y="{y}" data-r="{rot}" transform="translate({x},{y}) rotate({rot})"><g opacity="{op}">'
            f'<polygon points="{q([(0, 0), (230, 0), (0, -175)])}" fill="#FFFFFF" fill-opacity=".05" stroke="{CHALK}" stroke-width="4" stroke-linejoin="round"/>'
            f'<polygon points="{q([(34, -26), (150, -26), (34, -114)])}" fill="none" stroke="{CHALK}" stroke-width="3" stroke-linejoin="round"/>'
            f'<path d="{ticks}" stroke="{CHALK}" stroke-width="2"/></g></g>')
def tool_compass(x, y, s=1.0, rot=0, op=.5):
    return (f'<g class="tool" data-x="{x}" data-y="{y}" data-r="{rot}" transform="translate({x},{y}) rotate({rot})"><g opacity="{op}" fill="none" stroke="{CHALK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M0,{-50 * s} L0,{-16 * s}"/><circle cx="0" cy="0" r="{15 * s}" fill="#FFFFFF" fill-opacity=".06"/>'
            f'<path d="M{-8 * s},{12 * s} L{-70 * s},{210 * s} L{-74 * s},{232 * s}"/><path d="M{8 * s},{12 * s} L{64 * s},{190 * s}"/>'
            f'<path d="M{58 * s},{186 * s} L{74 * s},{192 * s} L{72 * s},{226 * s} L{60 * s},{222 * s} Z" fill="#FFFFFF" fill-opacity=".08"/>'
            f'<path d="M{-40 * s},{110 * s} L{36 * s},{104 * s}" stroke-width="3"/></g></g>')
def tool_plumb(x, y0, L, op=.55):
    return (f'<g id="plumb" data-x="{x}" data-y="{y0}" transform="translate({x},{y0})"><g opacity="{op}" stroke="{CHALK}" fill="none" stroke-linecap="round">'
            f'<path d="M0,0 L0,{L}" stroke-width="2.5"/><path d="M-14,{L} L14,{L} L0,{L + 44} Z" stroke-width="3.5" fill="#FFFFFF" fill-opacity=".1"/>'
            f'<circle cx="0" cy="{L}" r="5" stroke-width="3"/></g></g>')

BP_JS = r'''
const TL=1.672, T1=1.15, DT=DATA.D, V=DT/(T1+.5*(TL-T1));
function trav(t){if(t<=T1)return V*t;const u=cl((t-T1)/(TL-T1));return V*(T1+(TL-T1)*(u-u*u*u+u*u*u*u/2))}
function vel(t){if(t<=T1)return V;return V*(1-EASE.ss((t-T1)/(TL-T1)))}
const DW=[...document.querySelectorAll('.dw')].map(e=>[e,+e.dataset.a,+e.dataset.b,+e.dataset.o]);
const FD=[...document.querySelectorAll('.fd')].map(e=>[e,+e.dataset.a,+e.dataset.b,+e.dataset.o]);
const TOOLS=[...document.querySelectorAll('.tool')].map(e=>[e,+e.dataset.x,+e.dataset.y,+e.dataset.r]);
const S=DATA.youS;
function P0(o){return Object.assign({ra:[60,86],la:[120,94],lk:[-25,-60],lf:[-26,0],rk:[25,-60],rf:[26,0],hip:[0,0],nk:[0,0],hd:[0,0],tilt:6,look:[0,0],expr:'smile',root:[0,0]},o)}
function runPose(t){const th=2*Math.PI*t/BEAT, sn=Math.sin(th);
  const leg=(sg,v)=>{const lf=Math.max(0,v), push=-12*Math.cos(th)*sg;
    return [[sg*30-6-(sg<0?12:16)*lf+push*.5,-62-30*lf],[sg*24-4+(sg<0?6:18)*lf+push,-46*lf]]};
  const [lk,lf]=leg(-1,sn), [rk,rf]=leg(1,-sn);
  const arm=v=>[52+24*v,-37+60*v], r=arm(sn), l=arm(-sn);
  return P0({ra:r,la:[180-l[0],180-l[1]],lk:lk,lf:lf,rk:rk,rf:rf,hip:[-6,4],nk:[-16,6],hd:[-6,0],tilt:-11,look:[-.95,-.05],expr:'smile',root:[0,-11*Math.abs(sn)]})}
const lead=t=>-46*(1-span(t,1.12,TL,'io'));
const youW=t=>DATA.youX+(DT-trav(t))+lead(t);
window.render=function(t){
  const dx=DT-trav(t), k=track(DATA.C,t);
  const C={S0:1,fx:k.fx,fy:k.fy,z:k.z*(1+.014*pulse(t,TL,.08)),c:k.c,dx:dx,dy:0,roll:k.roll};
  setL('Lgrid',C,2.857); setL('Lfar',C,1.667); setL('Lmain',C,1); setL('Lfg',C,.714);
  const sp=vel(t)/30; $('mbg').setAttribute('stdDeviation',f1(sp*.4)+' 0'); $('mbf').setAttribute('stdDeviation',f1(1.6+sp*.55)+' 1.6');
  for(const [e,a,b,o] of DW){const u=span(t,a,b,'io');e.setAttribute('stroke-dashoffset',f2(1-u));e.setAttribute('opacity',u>0?o:0)}
  for(const [e,a,b,o] of FD)e.setAttribute('opacity',f2(o*span(t,a,b,'ss')));
  for(const [e,x,y,r] of TOOLS)e.setAttribute('transform','translate('+f1(x)+','+f1(y+6*Math.sin(t*1.7+x)) +') rotate('+f2(r+3*Math.sin(t*1.1+y))+')');
  const pl=$('plumb'); if(pl)pl.setAttribute('transform','translate('+pl.dataset.x+','+pl.dataset.y+') rotate('+f2(5*Math.sin(t*3.1)*(1-.5*span(t,TL,3.3)))+')');
  // landing: the gold pin and the era name
  const pin=span(t,TL-.02,TL+.22,'ob'); $('pin').setAttribute('transform','translate('+DATA.pinX+','+(RYV+34)+') scale('+f2(pin)+')');
  $('eraT').setAttribute('fill',t>=TL?'#F2C66E':'#F3F0E6');
  // 你: runs (2 steps a beat, the bob on the beat), skids, turns, points up at the year
  let p=runPose(t); if(t>1.1){const q=track(DATA.K,t);p=t<1.32?mix(p,q,EASE.ss((t-1.1)/.22)):q}
  p=breathe(p,t,t>TL?2.5:0); if(t>TL)p.nk[1]+=3*beatPulse(t,TL+BEAT,DUR,.06);
  const xw=youW(t);
  const Y=you(p,xw,RYV,S,{shadow:(X,Yy,s)=>'<ellipse cx="'+f1(X)+'" cy="'+f1(RYV+2)+'" rx="'+f1(52*s*(1-.004*Math.min(60,-p.root[1])))+'" ry="'+f1(9*s)+'" fill="#08111F" opacity=".45"/>'});
  $('you').innerHTML=Y.svg;
  // speed lines behind, chalk puffs on each footfall, the skid spray
  const fr=Math.floor(t*12), vv=vel(t)/V; let sl='';
  if(vv>.05)for(let i=0;i<6;i++){const y=RYV-(26+48*i)*S, x0=xw+(70+30*hash(fr*7+i))*S, L=(120+220*hash(fr*3+i))*S*vv;
    sl+='<path d="M'+f1(x0)+','+f1(y)+' L'+f1(x0+L)+','+f1(y)+'" stroke="#F3F0E6" stroke-width="'+f1(3+2*hash(i))+'" stroke-linecap="round" opacity="'+f2(.55*vv*(.5+.5*hash(fr+i*5)))+'"/>'}
  let du='';
  for(let kk=0;kk*BEAT/2<1.2;kk++){const tk=kk*BEAT/2, age=(t-tk)/.42;if(age<0||age>1)continue;const px=youW(tk)-40*S;
    for(let j=0;j<3;j++)du+='<circle cx="'+f1(px+(j-1)*10*S+age*18)+'" cy="'+f1(RYV-4-age*(18+j*8))+'" r="'+f1((5+age*(22+6*j))*S)+'" fill="#F3F0E6" opacity="'+f2(.42*(1-age))+'"/>'}
  for(let i=0;i<26;i++){const te=1.2+.42*i/26, age=t-te;if(age<0||age>.65)continue;const x0=youW(te)-82*S, vx=-(90+220*hash(i)), vy=-(110+230*hash(i+50));
    const x=x0+vx*age, y=Math.min(RYV-2,RYV-6+vy*age+520*age*age);du+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(2+4.5*hash(i+9))+'" fill="#F3F0E6" opacity="'+f2(.75*(1-age/.65))+'"/>'}
  $('spd').innerHTML=sl; $('dust').innerHTML=du;
  bubble(t,Y.head,Y.hr,MATS.Lmain);
  // the year rolls with the truck and lands on the bar
  counterV(t,2026+(DATA.CN.target-2026)*trav(t)/DT,Math.abs(DATA.CN.target-2026)*vel(t)/DT,TL,DATA.CN);
  if(window.monHook)window.monHook(t);
};
function counterV(t,v,dv,TL,CN){const g=$('cnt');
  for(let i=0;i<4;i++){const p=10**(3-i);let pos;if(i===3)pos=v%10;else{const low=v%p;pos=Math.floor(v/p)%10+Math.max(0,low-(p-1))}
    $('cs'+i).setAttribute('transform','translate(0,'+f1(-pos*CN.lh)+')');$('cbg'+i).setAttribute('stdDeviation','0 '+f1(Math.min(16,dv/p*.5)))}
  const pop=span(t,0,.22,'ob'), punch=t>=TL?1+.15*(1-EASE.o((t-TL)/.3)):1, k=(.7+.3*pop)*punch;
  g.setAttribute('opacity',f2(cl(t/.1)));
  g.setAttribute('transform','translate('+CN.cx+','+CN.cy+') scale('+k.toFixed(4)+') translate('+(-CN.cx)+','+(-CN.cy)+')');
  for(const id of ['lpre','lsuf']){const e=$(id);if(!e)continue;const a=t>=TL?EASE.ob((t-TL)/.3):0;e.setAttribute('opacity',f2(cl((t-TL)/.08)));
    const bb=e.getBBox(), cx=bb.x+bb.width/2, cy=bb.y+bb.height/2, s=.4+.6*a;
    e.setAttribute('transform','translate('+f1(cx)+','+f1(cy)+') scale('+f2(s)+') translate('+f1(-cx)+','+f1(-cy)+')')}}
'''

def blueprint_when(target, pre, suf, monument, you_x=1030, D=750, nx=1240, fs=176, mon_js='', eras=DYNASTIES):
    """the 「穿越时间轴」 shot: blueprint paper, grid (0.35x), faint construction arcs (0.6x), the year ruler with dynasty bands (1x),
    chalk dust and floating drafting tools (1.4x). The camera trucks right → left from 2026 to `target` and lands on t = 1.672;
    你 runs, skids, turns and points at the year; then `monument` (a string of dw / fd elements, world = screen at the landing)
    draws itself above the ruler while the camera pushes in with a slight roll."""
    TL = BAR; ppy = D / (2026 - target); X = lambda yr: you_x + (yr - target) * ppy
    y_lo = int(math.floor((target - 1500) / 100.0) * 100)
    R = random.Random(target)
    # --- paper (screen-fixed)
    pdefs = (f'<radialGradient id="bpg" cx="900" cy="470" r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#21406A"/><stop offset=".45" stop-color="{BP0}"/><stop offset="1" stop-color="{BP1}"/></radialGradient>'
             '<radialGradient id="bpv" cx="960" cy="540" r="1180" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#08101D" stop-opacity="0"/><stop offset="1" stop-color="#08101D" stop-opacity=".6"/></radialGradient>'
             '<filter id="pgr" x="0" y="0" width="1920" height="1080" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="11"/>'
             '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.1 0 0 0 -.5"/></filter>'
             '<filter id="pgr2" x="0" y="0" width="1920" height="1080" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="2" seed="4"/>'
             '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  .5 0 0 0 -.2"/></filter>')
    paper = svg_layer('paper', '<rect width="1920" height="1080" fill="url(#bpg)"/>', defs=pdefs)
    # --- grid (0.35x): 40 px, every 5th line brighter
    gl = ''.join(f'<path d="M{i * 40},0 V200 M0,{i * 40} H200" stroke="#FFFFFF" stroke-width="{1.6 if i == 0 else 1.1}" opacity="{.15 if i == 0 else .08}"/>' for i in range(5))
    grid = f'<g id="Lgrid"><rect x="-1400" y="-600" width="4800" height="2400" fill="url(#gridp)"/></g>'
    gdefs = f'<pattern id="gridp" width="200" height="200" patternUnits="userSpaceOnUse">{gl}</pattern>'
    # --- faint construction arcs (0.6x)
    far = []
    for cx, cy, r in [(260, 330, 430), (1480, 900, 560), (2300, 260, 380), (-300, 760, 300), (900, -120, 520)]:
        far.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".07"/>')
        for k in range(24):
            a = math.radians(k * 15); far.append(f'<path d="M{cx + math.cos(a) * r:.1f},{cy + math.sin(a) * r:.1f} L{cx + math.cos(a) * (r - (22 if k % 6 == 0 else 10)):.1f},{cy + math.sin(a) * (r - (22 if k % 6 == 0 else 10)):.1f}" stroke="#FFFFFF" stroke-width="2" opacity=".09"/>')
    for x0, y0, x1, y1 in [(-400, 980, 2600, 120), (-200, 60, 2400, 1020), (600, -50, 600, 1150), (1900, -50, 1900, 1150)]:
        far.append(dashed(pth([(x0, y0), (x1, y1)]), 1.6, .07, '18 12 4 12'))
    far = f'<g id="Lfar">{"".join(far)}</g>'
    # --- the ruler (1x), with motion blur while trucking
    xa, xn = X(y_lo), X(2026)
    rul = [f'<rect x="{xa:.1f}" y="{RY}" width="{xn - xa:.1f}" height="32" fill="#FFFFFF" opacity=".06"/>',
           f'<path d="M{xa:.1f},{RY} H{xn:.1f} M{xa:.1f},{RY + 32} H{xn:.1f}" stroke="{CHALK}" stroke-width="3"/>',
           dashed(f'M{xn:.1f},{RY} H{xn + 1300:.1f} M{xn:.1f},{RY + 32} H{xn + 1300:.1f}', 2.5, .28, '16 12')]
    t10, t50, t100 = [], [], []
    for yr in range(y_lo, 2027, 10):
        x = X(yr); (t100 if yr % 100 == 0 else t50 if yr % 50 == 0 else t10).append(x)
    for xs, L, op, w in ((t10, 9, .45, 1.6), (t50, 15, .7, 2), (t100, 24, .95, 2.6)):
        rul.append(f'<path d="{"".join(f"M{x:.1f},{RY} v{L} " for x in xs)}" stroke="{CHALK}" stroke-width="{w}" opacity="{op}"/>')
    for yr in range(y_lo, 2027, 100):
        big = yr % 500 == 0; lab = f'前{-yr}' if yr < 0 else ('公元' if yr == 0 else str(yr))
        if yr == target or abs(X(yr) - xn) < 80: continue
        rul.append(ctext(X(yr), RY + (76 if big else 68), lab, 34 if big else 25, op=1 if big else .72, extra='font-family="Noto Sans CJK SC" font-weight="700"' if False else ''))
    for a, b, name in eras:
        if b < y_lo or a > 2026: continue
        xa_, xb_ = X(max(a, y_lo)) + 4, X(min(b, 2026)) - 4
        tid = ' id="eraT"' if a <= target < b else ''
        rul.append(f'<path d="M{xa_:.1f},{RY - 6} V{RY - 13} H{xb_:.1f} V{RY - 6}" fill="none" stroke="{CHALK}" stroke-width="2" opacity=".5"/>')
        if xb_ - xa_ > 30 * len(name) + 14: rul.append(ctext(xa_ + 10, RY - 22, name, 28, 'start', op=.85, extra=tid))
    if 'id="eraT"' not in ''.join(rul): rul.append('<text id="eraT"></text>')
    rul.append(f'<path d="M{xn:.1f},{RY - 22} V{RY + 40}" stroke="{GOLD}" stroke-width="4"/>' + ctext(xn, RY + 76, '2026', 34, col=GOLD))
    ruler = f'<g filter="url(#mb)">{"".join(rul)}</g>'
    pin = (f'<g id="pin" transform="translate({X(target):.1f},{RY + 34}) scale(0)"><path d="M0,0 L-16,26 L16,26 Z" fill="{GOLD}" stroke="{DARK}" stroke-width="3" stroke-linejoin="round"/>'
           f'<text x="0" y="66" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="34" fill="{GOLD}" stroke="{DARK}" stroke-width="6" paint-order="stroke">{target}</text></g>')
    chalk_f = ('<filter id="chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="5" result="n"/>'
               '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>'
               '<feGaussianBlur in="d" stdDeviation="2.2" result="g"/><feComponentTransfer in="g" result="g2"><feFuncA type="linear" slope=".55"/></feComponentTransfer>'
               '<feMerge><feMergeNode in="g2"/><feMergeNode in="d"/></feMerge></filter>'
               '<filter id="mb" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur id="mbg" stdDeviation="0 0"/></filter>'
               '<filter id="mbf" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur id="mbf" stdDeviation="2 2"/></filter>')
    main = (f'<g id="Lmain">{ruler}{pin}<g filter="url(#chalk)">{monument}</g><g id="spd"></g><g id="dust"></g><g id="you"></g></g>')
    # --- foreground (1.4x): drafting tools and chalk dust, out of focus
    fgs = [tool_compass(2150, 850, 1.1, -18), tool_set_square(2900, 230, 1.0, 12), tool_set_square(1430, 1110, .9, -8, .42),
           tool_compass(-120, 260, .9, 24, .4), tool_set_square(3500, 1000, 1.1, -20)]
    for _ in range(70):
        x, y, r = R.uniform(-300, 3300), R.uniform(0, 1080), R.uniform(1.5, 5.5)
        fgs.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="{CHALK}" opacity="{R.uniform(.12, .4):.2f}"/>')
    fg = f'<g id="Lfg"><g filter="url(#mbf)">{"".join(fgs)}</g>{tool_plumb(84, -30, 250)}</g>'
    cnt, cdefs, CN = counter_svg(target, pre, suf, nx, 545, fs)
    body = (paper + svg_layer('scene', grid + far + main, defs=gdefs + chalk_f
                              + fig_defs([(0, '#FFFFFF'), (.55, '#F3F6FA'), (1, '#C6D0E0')], sh=(3, 6, 5, .45)))
            + svg_layer('fgS', fg) + svg_layer('grain', '<rect width="1920" height="1080" filter="url(#pgr)" opacity=".55"/><rect width="1920" height="1080" fill="url(#bpv)"/>')
            + svg_layer('hud', cnt + BUBBLE, defs=cdefs + BUBBLE_DEFS))
    K = [  # from the skid on (the run before it is procedural)
        [1.12, P('hang', lk=[-30, -60], lf=[-40, 0], rk=[22, -60], rf=[30, 0], nk=[-12, 4], look=[-.95, 0], tilt=-8)],
        [1.32, P(ra=[-25, -55], la=[200, 175], lk=[-54, -50], lf=[-86, 0], rk=[14, -52], rf=[20, 0], hip=[10, 16], nk=[16, 8], hd=[4, 0], look=[-.6, -.1], tilt=9, expr='wide'), 'o'],
        [1.58, P(ra=[-30, -60], la=[195, 172], lk=[-50, -50], lf=[-80, 0], rk=[14, -52], rf=[22, 0], hip=[10, 16], nk=[18, 8], hd=[4, 0], look=[-.6, -.1], tilt=10, expr='wide'), 'l'],
        [1.672, P('hang', 'wide', hip=[0, 12], nk=[0, 10], look=[-.3, .1], tilt=2, expr='o'), 'o'],
        [1.86, P('hang', 'wide', look=[.1, -.2], tilt=4, expr='smile'), 'io'],
        [2.09, P('hips', 'wide', ra=[-50, -55], look=[.75, -.85], tilt=11), 'ob'],
        [2.40, P('hips', 'wide', ra=[-48, -53], look=[.7, -.8], tilt=10), 'io'],
        [2.508, P('hang', 'wide', ra=[50, 70], look=[-.9, -.45], tilt=-8, expr='o'), 'ob'],
        [2.80, P('hang', 'wide', ra=[55, 78], look=[-.85, -.5], tilt=-7, expr='o'), 'io'],
        [2.926, P('cheer', 'wide', look=[-.5, -.5], tilt=-3, expr='joy', root=[0, -10]), 'ob'],
        [3.344, P('cheer', 'wide', ra=[-55, -72], la=[235, 252], look=[-.4, -.4], tilt=-1, expr='joy', root=[0, 0]), 'io'],
    ]
    C = [[0.0, dict(fx=960, fy=540, z=1.0, c=0.0, roll=-1.1)], [1.672, dict(fx=960, fy=540, z=1.0, c=0.0, roll=0.0), 'o'],
         [3.344, dict(fx=905, fy=552, z=1.0, c=0.075, roll=-0.9), 'io']]
    data = dict(D=D, youX=you_x, youS=.57, K=K, C=C, CN=CN, pinX=X(target))
    js = 'const RYV=' + str(RY) + ';\n' + BP_JS + mon_js
    return page(2 * BAR, body, data, js)


# ---------------- El Castillo, front elevation in chalk (proportions from hist_a's model) ----------------
WORKER_JS = r'''
// a builder in chalk (white silhouette), facing right; mode: pull (rope forward), carry (block on the back), lift (block overhead)
function worker(x,y,s,ph,mode,flip){const sw=Math.sin(ph), L=[];
  const leg=(o)=>{const a=o*sw*24;return ['l',[[o*3,-40],[o*3+Math.sin(a*Math.PI/180)*20+4,-21],[o*3+Math.sin(a*Math.PI/180)*38,-1]],6]};
  L.push(leg(1),leg(-1),['p',[[-8,-72],[8,-72],[10,-44],[-9,-44]]],['p',[[-10,-47],[10,-47],[6,-31],[0,-25],[-6,-31]]],['e',2,-81,7,8],
    ['l',[[-3,-87],[-9,-98],[-15,-103]],3]);
  if(mode==='pull')L.push(['l',[[4,-68],[16,-58],[28,-56]],5],['l',[[0,-66],[12,-54],[26,-50]],5]);
  else if(mode==='carry')L.push(['p',[[-24,-92],[-4,-92],[-4,-68],[-24,-68]]],['l',[[4,-68],[2,-82],[-6,-90]],5],['l',[[-2,-90],[4,-84],[6,-90]],3]);
  else L.push(['p',[[-14,-128],[14,-128],[14,-108],[-14,-108]]],['l',[[-6,-68],[-12,-92],[-8,-108]],5],['l',[[6,-68],[12,-92],[8,-108]],5]);
  return silJS(L,x,y,s,flip,[0,0],'#F3F0E6','#F3F0E6')}
'''
def castillo_bp(X0=575, Y0=690, K=11.2, t0=BAR):
    """El Castillo's north elevation as chalk line art: ground, 9 battered terraces (bottom → top), the stair with its
    balustrades, treads and serpent heads, the temple; then dimensions, centre line, an earth ramp with builders
    dragging a block, a scaffold with a plumb line, stone stock. Returns (svg, js hook)."""
    sb, st, zk, NT, WS, BW, BH, ZT, TQ, TZ = HA.sb, HA.st, HA.zk, HA.NT, HA.WS, HA.BW, HA.BH, HA.ZT, HA.TQ, HA.TZ
    p = lambda u, z: (X0 + u * K, Y0 - z * K)
    a = t0; o = []
    # the sheet: a faint panel with registration corners
    x0_, y0_, x1_, y1_ = 150, 340, 995, 742
    o.append(dw(pth([(x0_, y0_), (x1_, y0_), (x1_, y1_), (x0_, y1_)], close=True), a - .04, a + .3, 1.8, .35))
    o.append(fd(f'<rect x="{x0_}" y="{y0_}" width="{x1_ - x0_}" height="{y1_ - y0_}" fill="#FFFFFF" opacity=".035"/>'
                + ''.join(f'<path d="M{x},{y + 22 * sy} V{y} H{x + 22 * sx}" stroke="{CHALK}" stroke-width="3" fill="none"/>' for x, y, sx, sy in
                          [(x0_ + 8, y0_ + 8, 1, 1), (x1_ - 8, y0_ + 8, -1, 1), (x0_ + 8, y1_ - 8, 1, -1), (x1_ - 8, y1_ - 8, -1, -1)]), a, a + .25))
    o.append(dw(pth([(x0_ + 20, Y0), (x1_ - 20, Y0)]), a, a + .3, 3))                                  # ground line
    o.append(fd(dashed(pth([(X0, Y0 + 30), (X0, y0_ + 14)]), 1.6, .45, '22 8 4 8'), a + .2, a + .5))   # centre line
    # terraces, bottom → top
    for k in range(NT):
        ta = a + .1 + k * .085; tb = ta + .22
        for sgn in (-1, 1):
            o.append(dw(pth([p(sgn * WS, zk(k)), p(sgn * sb(k), zk(k)), p(sgn * st(k), zk(k + 1)), p(sgn * WS, zk(k + 1))]), ta, tb, 2.8))
            zm = zk(k) + (zk(k + 1) - zk(k)) * .56
            o.append(dw(pth([p(sgn * (st(k) + (sb(k) - st(k)) * .44), zm), p(sgn * WS, zm)]), ta + .06, tb + .06, 1.6, .5))
            for j in range(1, 5):   # panel joints
                u = WS + (st(k) - WS) * j / 5
                o.append(dw(pth([p(sgn * u, zk(k + 1) - .2), p(sgn * u, zm)]), tb - .05, tb + .08, 1.4, .4))
    # the stair: balustrades up, then the treads, the serpent heads at the foot
    for u in (-WS, -(WS - BW), WS - BW, WS):
        o.append(dw(pth([p(u, 0), p(u, ZT + BH)]), a + .32, a + .95, 2.6 if abs(u) == WS else 2))
    for i in range(1, 31):
        z = ZT * i / 31; ta = a + .42 + .55 * i / 31
        o.append(dw(pth([p(-(WS - BW), z), p(WS - BW, z)]), ta, ta + .08, 1.5, .7))
    for sgn in (-1, 1):
        u = sgn * (WS - BW / 2)
        hx, hy = p(u, 0)
        o.append(dw(pth([(hx - 16, hy), (hx - 18, hy - 22), (hx - 8, hy - 30), (hx + 8, hy - 30), (hx + 18, hy - 22), (hx + 16, hy)]), a + .3, a + .5, 2.4))
        o.append(fd(f'<circle cx="{hx - 7:.1f}" cy="{hy - 20:.1f}" r="2.6" fill="{CHALK}"/><circle cx="{hx + 7:.1f}" cy="{hy - 20:.1f}" r="2.6" fill="{CHALK}"/>'
                    f'<path d="M{hx - 10:.1f},{hy - 8:.1f} L{hx - 5:.1f},{hy - 3:.1f} L{hx:.1f},{hy - 8:.1f} L{hx + 5:.1f},{hy - 3:.1f} L{hx + 10:.1f},{hy - 8:.1f}" stroke="{CHALK}" stroke-width="2" fill="none"/>', a + .42, a + .55))
    # the temple
    ta = a + .95
    o.append(dw(pth([p(-TQ, ZT), p(-TQ, ZT + 3.6), p(TQ, ZT + 3.6), p(TQ, ZT)]), ta, ta + .2, 2.8))
    o.append(dw(pth([p(-TQ - .35, ZT + 4.0), p(-TQ - .35, ZT + TZ), p(TQ + .35, ZT + TZ), p(TQ + .35, ZT + 4.0)], close=True), ta + .08, ta + .28, 2.8))
    o.append(dw(pth([p(-TQ - .25, ZT + 3.6), p(TQ + .25, ZT + 3.6)], [p(-TQ - .35, ZT + 5.5), p(TQ + .35, ZT + 5.5)]), ta + .15, ta + .3, 2))
    for u0, u1 in [(-2.6, -1.6), (-.7, .7), (1.6, 2.6)]:
        o.append(dw(pth([p(u0, ZT), p(u0, ZT + 2.6), p(u1, ZT + 2.6), p(u1, ZT)]), ta + .18, ta + .32, 2.2))
    for j in range(1, 8):
        u = -TQ + 2 * TQ * j / 8; o.append(dw(pth([p(u, ZT + 4.1), p(u, ZT + 5.4)]), ta + .26, ta + .34, 1.4, .6))
    # dimensions, level mark, scale bar
    o.append(dim_v(p(sb(0) + 4.2, 0)[0], Y0, p(0, ZT + TZ)[1], '30 m', a + 1.05, a + 1.35, -1))
    o.append(dim_h(Y0 + 22, p(-sb(0), 0)[0], p(sb(0), 0)[0], '55 m', a + 1.0, a + 1.3))
    o.append(fd(f'<path d="M{x1_ - 150},{y1_ - 26} h100 M{x1_ - 150},{y1_ - 32} v12 M{x1_ - 100},{y1_ - 30} v8 M{x1_ - 50},{y1_ - 32} v12" stroke="{CHALK}" stroke-width="2" fill="none"/>'
                + ctext(x1_ - 150, y1_ - 38, '0', 18) + ctext(x1_ - 50, y1_ - 38, '10 m', 18), a + 1.2, a + 1.4, .8))
    # construction: the earth ramp on the left, builders dragging a block, a scaffold with a plumb line, stone stock
    r0, r1 = p(-sb(0) - 9.5, 0), p(-st(4), zk(5))
    ramp = (dashed(pth([r0, r1, p(-st(4), 0)]), 2.2, .7, '12 7')
            + ''.join(dashed(pth([p(-sb(0) - 9.5 + 3.2 * j, 0), lerp2(r0, r1, (3.2 * j) / (sb(0) + 9.5 - st(4)))]), 1.5, .35, '6 6') for j in range(1, 7)))
    o.append(fd(ramp, a + .8, a + 1.05))
    sc = ''
    for u in (7.5, 11, 14.5): sc += dashed(pth([p(u, zk(4)), p(u, 28.5)]), 2, .6, '14 6')
    for z in (14, 18, 22, 26): sc += dashed(pth([p(6.5, z), p(15.5, z)]), 2, .55, '14 6')
    o.append(fd(sc, a + .9, a + 1.15))
    o.append(fd(tool_plumb(p(15, 26)[0], p(15, 26)[1], 70, .85).replace('id="plumb"', 'id="plumbm"'), a + 1.1, a + 1.25))
    stock = ''.join(f'<rect x="{p(u, 0)[0]:.1f}" y="{p(u, 0)[1] - h:.1f}" width="22" height="{h}" fill="none" stroke="{CHALK}" stroke-width="2" opacity=".7"/>'
                    for u, h in [(27.9, 16), (25.9, 16), (26.9, 32)])
    o.append(fd(stock, a + 1.0, a + 1.2))
    o.append('<g id="wk"></g>')
    js = WORKER_JS + r'''
const RAMP=%s;
window.monHook=function(t){const a=TL+1.0;if(t<a){$('wk').innerHTML='';return}
  const op=span(t,a,a+.25), st=Math.max(0,(t-a)/BEAT), q=.18+.05*(Math.floor(st)+EASE.io(Math.min(1,(st%%1)*1.6)));
  const at=f=>[RAMP[0][0]+(RAMP[1][0]-RAMP[0][0])*f,RAMP[0][1]+(RAMP[1][1]-RAMP[0][1])*f];
  let g='';const ang=Math.atan2(RAMP[1][1]-RAMP[0][1],RAMP[1][0]-RAMP[0][0])*180/Math.PI;
  const b=at(q), w1=at(q+.17), w2=at(q+.27);
  g+='<g transform="translate('+f1(b[0])+','+f1(b[1])+') rotate('+f2(ang)+')"><rect x="-22" y="-24" width="40" height="24" fill="none" stroke="#F3F0E6" stroke-width="2.6"/><path d="M-26,2 H24" stroke="#F3F0E6" stroke-width="3"/></g>';
  g+='<path d="M'+f1(b[0]+16)+','+f1(b[1]-14)+' L'+f1(w2[0]+8)+','+f1(w2[1]-22)+'" stroke="#F3F0E6" stroke-width="1.8" fill="none"/>';
  g+=worker(w1[0],w1[1],.5,t*2*Math.PI/BEAT,'pull',false)+worker(w2[0],w2[1],.5,t*2*Math.PI/BEAT+1.6,'pull',false);
  const tp=%s; g+=worker(tp[0],tp[1],.5,0,'lift',false);
  const cp=%s; g+=worker(cp[0]+8*Math.sin(t*2),cp[1],.5,t*2*Math.PI/BEAT,'carry',true);
  $('wk').innerHTML='<g opacity="'+f2(op)+'">'+g+'</g>';
  const pl=$('plumbm');if(pl)pl.setAttribute('transform','translate('+pl.dataset.x+','+pl.dataset.y+') rotate('+f2(4*Math.sin(t*3.3))+')')};
''' % (json.dumps([r0, r1]), json.dumps(p(10.6, 22)), json.dumps(p(23, 0)))
    return ''.join(o), js
def lerp2(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

def chichen_when():
    mon, js = castillo_bp()
    return blueprint_when(1100, '公元', '前后', mon, mon_js=js)


# =====================================================================================================
# chichen_what — the equinox serpent, alive (hist_a.chichen_serpent rebuilt in depth layers)
# =====================================================================================================
def chichen_what():
    W, H = HA.W, HA.H; poly, line, cam_ = HA.poly, HA.line, None
    R = random.Random(572)
    phi = math.radians(36); Dd = 92
    cam = HA.Cam((-Dd * math.sin(phi), Dd * math.cos(phi), 4.0), (0, 0, 13.5), 1630, (1160, 652))
    sun = (1886, 572)
    defs = (HA.lgrad('sky', [(0, '#5E6C93', None), (.45, '#B98A86', None), (.75, '#E9AC78', None), (1, '#F7CF8E', None)], units='userSpaceOnUse', x2=0, y2=720)
            + HA.rgrad('glow', sun[0], sun[1], 760, [(0, '#FFF1C4', .95), (.18, '#FFD58A', .75), (.5, '#F2A866', .28), (1, '#F2A866', 0)])
            + HA.lgrad('field', [(0, '#B07A55', None), (1, '#5E4436', None)], units='userSpaceOnUse', y1=640, y2=1080))
    sky = [f'<rect x="-900" y="-600" width="{W + 1800}" height="{H + 1200}" fill="url(#sky)"/>', f'<rect x="-900" y="-600" width="{W + 1800}" height="{H + 1200}" fill="url(#glow)"/>',
           f'<g id="sun"><circle cx="{sun[0]}" cy="{sun[1]}" r="62" fill="#FFF3CF" stroke="#F7C77E" stroke-width="3"/></g>']
    hz = 655; cs = []; x = -40
    while x < W + 40:
        r = R.uniform(16, 34); cs.append((x, hz - R.uniform(0, 26) - (12 if x > 1500 else 0), r)); x += r * R.uniform(1.0, 1.5)
    R2 = random.Random(5722); x = -700        # extra crowns beyond the drawing's edges (own seed: keeps the original sequence)
    while x < -40: r = R2.uniform(16, 34); cs.append((x, hz - R2.uniform(0, 26), r)); x += r * R2.uniform(1.0, 1.5)
    x = W + 40
    while x < W + 700: r = R2.uniform(16, 34); cs.append((x, hz - R2.uniform(0, 26) - 12, r)); x += r * R2.uniform(1.0, 1.5)
    top = []
    for xi in range(-700, W + 701, 6):
        ys = [cy - math.sqrt(r * r - (xi - cx) ** 2) for cx, cy, r in cs if abs(xi - cx) < r]
        top.append((xi, min(ys) if ys else hz))
    trees = [poly([(-700, hz + 60)] + top + [(W + 700, hz + 60)], '#4A3F3E', '#2E2628', 2.5)]
    field = [poly([(-900, hz + 6), (W + 900, hz + 6), (W + 900, H + 700), (-900, H + 700)], 'url(#field)', INK, 2.5)]
    for _ in range(60):
        x, y = R.uniform(0, W), R.uniform(700, 1070); r = R.uniform(3, 8) * (y - 600) / 300
        field.append(f'<ellipse cx="{x - r * 4:.1f}" cy="{y + r * .3:.1f}" rx="{r * 4:.1f}" ry="{r * .35:.1f}" fill="#4A3330" opacity=".35"/>')
        field.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{r:.1f}" ry="{r * .55:.1f}" fill="{R.choice(["#C99266", "#8E6248", "#D9A574"])}"/>')
    R3 = random.Random(5723)
    for _ in range(40):   # more pebbles on the extended near ground
        x, y = R3.uniform(-300, W + 300), R3.uniform(1080, 1500); r = R3.uniform(3, 8) * (y - 600) / 300
        field.append(f'<ellipse cx="{x - r * 4:.1f}" cy="{y + r * .3:.1f}" rx="{r * 4:.1f}" ry="{r * .35:.1f}" fill="#3A2826" opacity=".35"/>')
        field.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{r:.1f}" ry="{r * .55:.1f}" fill="{R3.choice(["#A97A58", "#7A5440", "#B98A62"])}"/>')
    # the pyramid, painted far → near as in hist_a
    lit = dict(W=('#DE9C62', '#F3C58E', '#B57446'), N=('#625E7C', '#7A7592', '#4C4864'), E=('#5A5470', '#6E6886', '#45405C'), S=('#5A5470', '#6E6886', '#45405C'))
    tc = dict(W=dict(wall='#E8AE74', corn='#B77A4C', frieze='#D49A66', joint='#B57E52'), N=dict(wall='#706A86', corn='#4E4964', frieze='#625C79', joint='#57516C'),
              E=dict(wall='#706A86', corn='#4E4964', frieze='#625C79', joint='#57516C'), S=dict(wall='#706A86', corn='#4E4964', frieze='#625C79', joint='#57516C'),
              door='#231B22', roof='#C48E6A')
    pyr = HA.temple(cam, tc); zc = cam.C[2]
    for k in sorted(range(HA.NT), key=lambda k: -abs(HA.zk(k) + HA.HT / 2 - zc)):
        for side in HA.SIDES:
            if cam.sees(HA.P3(side, (HA.sb(k) + HA.st(k)) / 2, 0, HA.zk(k) + HA.HT / 2), HA.wall_normal(side)):
                pyr += HA.terrace_wall(cam, side, k, *lit[side])
        if cam.sees((0, 0, HA.zk(k + 1)), (0, 0, 1)): pyr.append(HA.terrace_top(cam, k, '#B98564'))
    wc = dict(ramp='#EDB57A', tread='#C48550', top='#F6CB92', out_p='#D99860', out_m='#D99860', end='#E2A46C', **{'in': '#C98A58'})
    pyr += HA.stair(cam, 'W', wc, step=2)
    tris = []
    for k in range(1, 8):
        z0 = HA.zk(k); r0 = HA.rz(z0 - HA.BH); w = HA.HT * (HA.RF - HA.SP) / HA.ZT * .97
        a_, b_, c_ = (r0, z0), (r0 - w, z0), (r0 - w, HA.zr(r0 - w) + HA.BH)
        P3 = lambda r, z: HA.P3('N', r, HA.WS, z)
        g_ = (cam.poly([P3(r, z) for r, z in (a_, b_, c_)], 'none', '#FFC56E', 16, 'class="glow" opacity=".4"')
              + cam.poly([P3(r, z) for r, z in (a_, b_, c_)], '#FFDC8E', '#C98A3E', 1.5)
              + cam.line([P3(r, z) for r, z in ((a_[0] - .12, a_[1] + .1), (c_[0] + .02, c_[1] - .1))], '#FFF3CF', 2.5))
        tris.append(f'<g id="tri{k}" opacity="0">{g_}</g>')
    nc = dict(ramp='#857C93', tread='#6B6380', top='#9C93A9', out_p='#2F2A45', out_m='#3F3A55', end='#585170', **{'in': '#5C5672'})
    pyr += HA.stair(cam, 'N', nc, step=2, light={'out_p': ['<g id="tris">' + ''.join(tris) + '</g>']})
    pyr += HA.serpent_head(cam, -1, False)
    pyr.append('<g id="headD">' + ''.join(HA.serpent_head(cam, 1, False)) + '</g>')
    pyr.append('<g id="headL" opacity="0">' + ''.join(HA.serpent_head(cam, 1, True)) + '</g>')
    head_c = cam(HA.P3('N', HA.RF + 1.2, HA.WS - .4, 1.2))
    tri_c = []
    for k in range(1, 8):
        z0 = HA.zk(k); r0 = HA.rz(z0 - HA.BH); w = HA.HT * (HA.RF - HA.SP) / HA.ZT * .97
        tri_c.append(cam(HA.P3('N', r0 - w * .6, HA.WS, z0 + .5)))
    # foreground agaves (same draws from R as hist_a)
    def agave(cx, cy, rad, n):
        o = [f'<ellipse cx="{cx - rad * 1.6:.1f}" cy="{cy + 3:.1f}" rx="{rad * 1.9:.1f}" ry="{rad * .12:.1f}" fill="#3A2830" opacity=".45"/>']
        for i in range(n):
            a = math.radians(-165 + 150 * (i + R.uniform(-.3, .3)) / (n - 1)); L = rad * R.uniform(.6, 1.05) * (1 if -150 < math.degrees(a) < -30 else .75); w = rad * .09
            tip = (cx + math.cos(a) * L, cy + math.sin(a) * L); nx, ny = -math.sin(a), math.cos(a)
            o.append(poly([(cx + nx * w + 3, cy + ny * w), (tip[0] + 2, tip[1]), (cx - nx * w + 3, cy - ny * w)], '#E9A060', 'none', 0))
            o.append(poly([(cx + nx * w, cy + ny * w), tip, (cx - nx * w, cy - ny * w)], R.choice(['#3E4630', '#33392A']), INK, 1.5))
        return o
    fg = []
    for cx, cy, rad, n in ((150, 905, 70, 9), (1560, 1010, 95, 10), (1240, 1050, 60, 8), (880, 1072, 80, 10)):
        fg += agave(cx, cy, rad, n)
    fg2 = []
    for cx, cy, rad, n in ((560, 1190, 150, 11), (1420, 1230, 190, 12)):   # two big ones close to the lens
        fg2 += agave(cx, cy, rad, n)
    tgt = cam(HA.P3('N', HA.rz(HA.zk(5)) - .9, HA.WS, HA.zk(5) + .7))
    over = (f'<path id="ray" d="" stroke="{GOLD}" stroke-width="3.5" stroke-dasharray="16 12" fill="none"/><circle id="rayd" r="7" fill="{GOLD}" stroke="{DARK}" stroke-width="2.5"/>'
            f'<g id="burst" opacity="0"></g>'
            + HA.text(0, 0, '春分 · 秋分', 48, anchor='end', extra='id="lab" opacity="0"'))
    body = (svg_layer('back', f'<g id="Lsky">{"".join(sky)}</g><g id="Ltrees">{"".join(trees)}</g><g id="Lfield">{"".join(field)}</g><g id="Lpyr">{"".join(pyr)}</g><g id="Lfg">{"".join(fg)}</g>',
                      defs=defs)
            + svg_layer('youS', '<g id="Lyou"><g id="you"></g></g>', defs=fig_defs([(0, '#FFF8EC'), (.6, '#F8E4CF'), (1, '#A897B0')], 1, 0, 0, 1, sh=(-6, 5, 5, .35)))
            + svg_layer('near', f'<g id="Lnear">{"".join(fg2)}</g>', 'filter:blur(3px)')
            + svg_layer('ovl', over) + svg_layer('hud', BUBBLE, defs=BUBBLE_DEFS))
    K = [  # 你 watches the light come down, walks up to the head, peers, jumps back when it lights, then cheers
        [0.00, P('hang', look=[-.6, -.9], tilt=-6)],
        [0.418, P('hang', ra=[60, 86], la=[215, 210], look=[-.7, -.95], tilt=-8, expr='o'), 'ob'],
        [0.80, P('hang', la=[210, 205], look=[-.75, -.8], tilt=-7, expr='o'), 'io'],
        [1.254, P('hang', 'stepL', look=[-.8, -.6], tilt=-6, root=[-50, 0]), 'io'],
        [1.672, P('hang', 'stepR', look=[-.8, -.45], tilt=-6, root=[-100, 0]), 'io'],
        [2.09, P('hang', 'stepL', look=[-.85, -.3], tilt=-7, root=[-150, 0]), 'io'],
        [2.508, P('hang', 'stepR', look=[-.9, -.15], tilt=-8, root=[-196, 0]), 'io'],
        [2.926, P(ra=[110, 70], la=[118, 70], lk=[-40, -48], lf=[-30, 0], rk=[36, -48], rf=[30, 0], hip=[-6, 22], nk=[-26, 26], hd=[-6, 4], look=[-.95, .25], tilt=-14, expr='o', root=[-210, 0]), 'io'],
        [3.30, P(ra=[110, 70], la=[118, 70], lk=[-40, -48], lf=[-30, 0], rk=[36, -48], rf=[30, 0], hip=[-6, 22], nk=[-28, 28], hd=[-6, 4], look=[-.95, .3], tilt=-15, expr='o', root=[-212, 0]), 'l'],
        [3.344, P(ra=[110, 70], la=[118, 70], lk=[-40, -48], lf=[-30, 0], rk=[36, -48], rf=[30, 0], hip=[-6, 22], nk=[-28, 28], hd=[-6, 4], look=[-.95, .3], tilt=-15, expr='wide', root=[-212, 0]), 'l'],
        [3.55, P('fling', 'tuck', nk=[10, -4], look=[-.6, -.2], tilt=12, expr='wide', root=[-130, -95]), 'o'],
        [3.762, P('fling', 'crouch', nk=[6, 14], look=[-.7, -.3], tilt=8, expr='wide', root=[-80, 0]), 'i2'],
        [4.18, P('hips', 'wide', la=[205, 200], look=[-.85, -.6], tilt=-6, expr='o', root=[-80, 0]), 'ob'],
        [4.598, P('cheer', 'wide', look=[-.6, -.5], tilt=-4, expr='joy', root=[-80, -14]), 'ob'],
        [5.016, P('cheer', 'wide', ra=[-55, -72], la=[235, 252], look=[-.5, -.5], tilt=-2, expr='joy', root=[-80, 0]), 'io'],
    ]
    C = [[0.0, dict(z=1.0, fx=960, fy=540, c=0.0, dy=0, roll=0.0)],
         [0.836, dict(z=1.03, fx=940, fy=575, c=0.03, dy=0, roll=-0.3), 'l'],
         [2.926, dict(z=1.30, fx=840, fy=760, c=0.2, dy=0, roll=-0.9), 'io'],
         [3.344, dict(z=1.38, fx=830, fy=780, c=0.23, dy=0, roll=-1.1), 'io'],
         [5.016, dict(z=1.1, fx=1150, fy=625, c=0.1, dy=70, roll=1.5), 'io']]
    data = dict(K=K, C=C, sun=sun, tgt=tgt, head=head_c, tri=tri_c, you=dict(b=(1110, 1052), s=.45))
    js = r'''
const DEP={Lsky:12,Ltrees:4,Lfield:1.12,Lpyr:1,Lfg:.62,Lyou:.6,Lnear:.42};
window.render=function(t){
  const k=track(DATA.C,t), HIT=3.344, C={S0:1,fx:k.fx,fy:k.fy,z:k.z*(1+.02*pulse(t,HIT,.08)),c:k.c,dx:0,dy:k.dy,roll:k.roll};
  for(const id in DEP)setL(id,C,DEP[id]);
  // the light crawls down: one triangle per beat, top → bottom, then the head lights on the bar
  for(let k7=7;k7>=1;k7--){const tb=BEAT*(8-k7), u=span(t,tb-.06,tb+.06,'ss'), e=$('tri'+k7);e.setAttribute('opacity',f2(u));
    const gl=e.querySelector('.glow');gl.setAttribute('stroke-width',f1(16+30*pulse(t,tb+.04,.12)));gl.setAttribute('opacity',f2(.4+.5*pulse(t,tb+.04,.12)))}
  const hl=span(t,HIT-.05,HIT+.05,'ss');$('headL').setAttribute('opacity',f2(hl));$('headD').setAttribute('opacity',f2(1-hl));
  // sunset: the sun sinks a little
  $('sun').setAttribute('transform','translate(0,'+f1(t*6)+')');
  // the gold ray from the sun to the corner of the balustrade, dashes flowing
  const ms=MATS.Lsky, mp=MATS.Lpyr, a=app(ms,[DATA.sun[0],DATA.sun[1]+t*6]), b=app(mp,DATA.tgt), dr=span(t,.1,.8,'o');
  $('ray').setAttribute('d','M'+f1(a[0])+','+f1(a[1])+' L'+f1(a[0]+(b[0]-a[0])*dr)+','+f1(a[1]+(b[1]-a[1])*dr));$('ray').setAttribute('stroke-dashoffset',f1(-t*60));
  $('rayd').setAttribute('cx',f1(b[0]));$('rayd').setAttribute('cy',f1(b[1]));$('rayd').setAttribute('opacity',f2(span(t,.7,.85)));
  $('ray').setAttribute('opacity',f2(.9*(1-.6*span(t,2.9,3.3))));
  const lb=app(ms,[DATA.sun[0]-92,DATA.sun[1]-100]);$('lab').setAttribute('transform','translate('+f1(Math.min(1830,lb[0]))+','+f1(Math.max(380,lb[1]))+')');$('lab').setAttribute('opacity',f2(span(t,3.70,3.85)));
  // the burst when the head lights
  const h=app(mp,DATA.head), bu=span(t,HIT,HIT+.5,'o');let s='';
  if(t>=HIT-.01&&bu<1){for(let i=0;i<12;i++){const an=i*30+15, r0=40+120*bu, r1=r0+40*(1-bu);s+='<path d="M'+f1(h[0]+cosd(an)*r0)+','+f1(h[1]+sind(an)*r0)+' L'+f1(h[0]+cosd(an)*r1)+','+f1(h[1]+sind(an)*r1)+'" stroke="#FFD27A" stroke-width="11" stroke-linecap="round"/>'}
    s='<circle cx="'+f1(h[0])+'" cy="'+f1(h[1])+'" r="'+f1(70+60*bu)+'" fill="#FFE2A0" opacity="'+f2(.55*(1-bu))+'"/>'+s;
    s+='<circle cx="'+f1(h[0])+'" cy="'+f1(h[1])+'" r="'+f1(30+170*bu)+'" fill="none" stroke="#FFD27A" stroke-width="'+f1(14*(1-bu))+'"/>'}
  $('burst').innerHTML=s;$('burst').setAttribute('opacity',f2(1-bu));
  // 你 (lit by the sunset from the right; its shadow falls long to the left)
  let p=breathe(track(DATA.K,t),t,2);
  const steps=[1.254,1.672,2.09,2.508];for(const c of steps)p.root[1]-=6*Math.exp(-Math.pow((t-c+.2)/.09,2));
  const Y=you(p,DATA.you.b[0],DATA.you.b[1],DATA.you.s,{shadow:(X,Yy,s,pp)=>{const air=Math.max(0,-pp.root[1])/100;return '<ellipse cx="'+f1(X-70*s)+'" cy="'+f1(DATA.you.b[1]+3)+'" rx="'+f1(95*s*(1-.4*air))+'" ry="'+f1(9*s)+'" fill="#3A2830" opacity="'+f2(.45*(1-.5*air))+'"/>'}});
  $('you').innerHTML=Y.svg;
  bubble(t,Y.head,Y.hr,MATS.Lyou);
};'''
    return page(3 * BAR, body, data, js)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    which = sys.argv[2:] or ['chichen_when', 'chichen_what']
    for name in which:
        fn = globals().get(name)
        if fn:
            open(os.path.join(out, name + '.html'), 'w').write(fn()); print('page', name)
