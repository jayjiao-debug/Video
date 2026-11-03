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
# chichen_when — 时光倒流 on the coded scene
# =====================================================================================================
def chichen_when():
    ns = run_scene('chichen_vector.py',
                   [('sky', '# ---------------- sky:'), ('trees', '# ---------------- horizon:'), ('field', '# ---------------- the field'),
                    ('pyr', '# ---------------- El Castillo'), ('mid', '# ---------------- mid-ground:'), ('fg', '# ---------------- foreground:'),
                    ('canopy', '# ---------------- canopy:')],
                   patches=[("for tip, base, w, col, bend in B:\n    g += blade(tip, base, w, P[col], bend)",
                             "for _i, (tip, base, w, col, bend) in enumerate(B):\n    g.append(f'<g id=\"bl{_i}\">'); g += blade(tip, base, w, P[col], bend); g.append('</g>')")])
    defs, L = split(ns['g'])
    W, H = ns['W'], ns['H']; Pc = ns['P']; R = random.Random(5701)
    # sky: the gradient rect made bigger than the drawing (it is the deepest layer), clouds in their own groups (they race back)
    sky = [f'<rect x="-800" y="-600" width="{W + 1600}" height="{H + 1200}" fill="url(#sky)"/>']
    sky += [f'<g id="cl{i}">{e}</g>' for i, e in enumerate(L['sky'])]
    # far tree lines + a filler under them so parallax never opens a gap above the field
    trees = [f'<rect x="-400" y="1560" width="{W + 800}" height="300" fill="{Pc["tree_far"]}"/>'] + L['trees']
    trees += [ns['crowns'](-400, 0, 1612, lambda x: 1452 + 10 * math.sin(x / 40), Pc['tree_far'], Pc['tree_far_d']),
              ns['crowns'](W, W + 400, 1600, lambda x: 1400 + 10 * math.sin(x / 33), Pc['tree_dk'], INK, 20, 34)]
    field = [ns['poly']([(-400, 1592), (0, 1590), (W, 1572), (W + 400, 1572), (W + 400, H + 400), (-400, H + 400)], Pc['field1'], 'none', 0)] + L['field']
    pyr = L['pyr']
    # the pyramid in its own time: a red-plastered face, a crowd at its foot, climbers on the stair, copal smoke from the temple
    paint = (ns['poly'](ns['lface'], '#A4442E', 'none', 0, 'id="paintL" opacity="0"') + ns['poly'](ns['rface'], '#7A3426', 'none', 0, 'id="paintR" opacity="0"'))
    edge_x, LBi, RBi = ns['edge_x'], ns['LBi'], ns['RBi']
    stair_c = [((edge_x(LBi, y) + edge_x(RBi, y)) / 2, y) for y in range(1590, 1080, -30)]
    crowd, rr = [], random.Random(57011)
    for i, (parts, x, y, sc) in enumerate([(HA.ruler_parts(), 868, 1099, .44), (HA.attendant_parts(bow=1), 930, 1093, .4), (HA.attendant_parts(), 1040, 1096, .38)]):
        crowd.append(f'<g id="pp{i}" opacity="0">{HA.sil(parts, x, y, sc, flip=i == 2, rim=(-1.4, -1.0), rimc="#F2C08A")}</g>')
    climbers = ''.join(f'<g id="cb_{i}" opacity="0"></g>' for i in range(6))
    mid = L['mid']; fg = L['fg']; canopy = L['canopy']

    # camera: the 16:9 frame at t = 0 shows x 34..1898, y 579..1627 of the 1932 x 2576 drawing
    S0 = 1.03; F = (966, 1103)
    you_base, you_s = (1048, 1750), 1.66      # feet (below frame) and px per rig unit: a half figure close to the camera
    groups = ''.join([f'<g id="Lsky">{"".join(sky)}</g>', f'<g id="Ltrees">{"".join(trees)}</g>',
                      f'<g id="Lpyr">{"".join(field)}{"".join(pyr)}<g id="paint">{paint}</g><g id="crowd">{"".join(crowd)}</g>{climbers}<g id="smk"></g></g>',
                      f'<g id="Lmid">{"".join(mid)}</g>'])
    front = f'<g id="Lfg">{"".join(fg)}</g><g id="Lcan">{"".join(canopy)}</g>'
    cnt, cdefs, CN = counter_svg(1100, '公元', '前后', 1196, 588)
    body = (svg_layer('back', groups, defs=defs)
            + svg_layer('youS', '<g id="Lyou"><g id="you"></g></g>', defs=fig_defs([(0, '#FFFFFF'), (.55, '#FBFAF6'), (1, '#D9DCE2')], sh=(5, 9, 7, .28)))
            + svg_layer('front', front)          # url(#…) refs resolve across the page's inline svgs
            + GRAIN + svg_layer('hud', cnt + BUBBLE, defs=cdefs + BUBBLE_DEFS))
    K = [  # 你: shading its eyes at the pyramid → looks round on beats 1, 2 → grabs its head → points at the year on the bar
        [0.00, P('shade', look=[-.8, -.55], tilt=-7)],
        [0.30, P('shade', look=[-.7, -.6], tilt=-5), 'io'],
        [0.42, P('hang', look=[.95, -.15], tilt=9, expr='o'), 'ob'],
        [0.70, P('hang', look=[.8, -.2], tilt=7, expr='o'), 'io'],
        [0.84, P('hang', ra=[70, 95], la=[110, 85], look=[-.95, -.25], tilt=-9, expr='o'), 'ob'],
        [1.05, P('grab', look=[0, -.85], tilt=0, nk=[0, 7], expr='wide'), 'ob'],
        [1.18, P('grab', look=[-.3, -.85], tilt=7, nk=[0, 7], expr='wide'), 'io'],
        [1.30, P('grab', look=[.3, -.85], tilt=-6, nk=[0, 7], expr='wide'), 'io'],
        [1.42, P('hang', ra=[-10, -20], look=[.9, -.7], tilt=3, nk=[0, 4], root=[0, -10], expr='o'), 'io'],
        [1.672, P('hips', ra=[-38, -44], look=[1, -.75], tilt=11, root=[0, 0], expr='smile'), 'ob'],
        [2.30, P('hips', ra=[-36, -42], look=[.95, -.7], tilt=10, expr='smile'), 'io'],
        [2.508, P('hang', ra=[64, 92], look=[-.9, -.3], tilt=-8, expr='o'), 'ob'],
        [2.80, P('hang', ra=[60, 88], look=[-.85, -.25], tilt=-6, expr='o'), 'io'],
        [2.926, P('cheer', ra=[-40, -70], la=[220, 250], look=[-.6, -.4], tilt=-4, expr='joy', root=[0, -6]), 'ob'],
        [3.344, P('cheer', ra=[-44, -74], la=[224, 254], look=[-.5, -.4], tilt=-2, expr='joy', root=[0, 0]), 'io'],
    ]
    C = [  # camera keys: push in through the rewind (with a slight roll), bump on the landing, keep drifting after
        [0.00, dict(z=1.0, c=0.0, dx=0, dy=0, roll=0.0)],
        [0.15, dict(z=1.0, c=0.005, dx=0, dy=-2, roll=0.0), 'l'],
        [0.95, dict(z=1.0, c=0.075, dx=-6, dy=-14, roll=-1.3), 'io'],
        [1.672, dict(z=1.0, c=0.15, dx=-10, dy=-30, roll=0.5), 'io'],
        [3.344, dict(z=1.0, c=0.205, dx=-34, dy=-42, roll=-0.4), 'io'],
    ]
    data = dict(S0=S0, F=F, K=K, C=C, CN=CN, you=dict(b=you_base, s=you_s), stair=stair_c,
                climb=[dict(p0=.1 + .13 * i, s=.42 + .03 * (i % 2)) for i in range(6)],
                climbParts=[HA.attendant_parts(bow=0), HA.attendant_parts(pole_to=(-6, -128))],
                blades=[dict(i=i, d=.1 + .55 * R.random(), sink=max(0, 1720 - tip[1])) for i, (tip, *_r) in enumerate(ns['B'])])
    js = r'''
const T0=.15, TL=1.672, DEP={Lsky:9, Ltrees:3.4, Lpyr:1, Lmid:.86, Lyou:.8, Lfg:.56, Lcan:.42};
window.render=function(t){
  const a=span(t,T0,1.05,'ss');                                          // the rewind: colour → sepia
  const [jx,jy]=film(t,a);
  const k=track(DATA.C,t), C={S0:DATA.S0,fx:DATA.F[0],fy:DATA.F[1],z:k.z*(1+.018*pulse(t,TL,.09)),c:k.c,dx:k.dx,dy:k.dy,roll:k.roll,jx:jx,jy:jy};
  for(const id in DEP)setL(id,C,DEP[id]);
  const flick=1+(a>.05?(hash(Math.floor(t*24)*3)-.5)*.07*a:0) + .12*pulse(t,TL,.06);
  const filt=sepia(a,flick); $('back').style.filter=filt; $('front').style.filter=filt+' blur('+f2(1.2*a+.4)+'px)';
  $('youS').style.filter='sepia('+f2(.25*a)+') brightness('+f2(flick)+')';
  // clouds race back while time rewinds
  for(let i=0;i<8;i++){const e=$('cl'+i);if(!e)continue;const r=span(t,T0,TL,'io')*(240+60*i%3)+ (t>TL?(t-TL)*30:0) - t*12;e.setAttribute('transform','translate('+f1(r)+',0)')}
  // the modern garden sinks back into the ground, blade by blade
  for(const b of DATA.blades){const e=$('bl'+b.i);if(!e)continue;const u=span(t,T0+b.d,T0+b.d+1.05,'ss');e.setAttribute('transform','translate(0,'+f1(u*b.sink)+')')}
  // the past: paint, crowd, climbers, smoke (from the landing, one beat at a time)
  const past=span(t,TL-.05,TL+.5,'ss');
  $('paintL').setAttribute('opacity',f2(.34*past));$('paintR').setAttribute('opacity',f2(.3*past));
  for(let i=0;i<3;i++){const e=$('pp'+i);const t0=TL+BEAT*(i+1);const u=span(t,t0-.1,t0+.1,'o');
    const bob=-2.5*Math.abs(Math.sin((t-t0)*Math.PI/BEAT+i));e.setAttribute('opacity',f2(u));e.setAttribute('transform','translate(0,'+f1((1-u)*10+bob*u)+')')}
  const sc=DATA.stair;
  for(let i=0;i<6;i++){const c=DATA.climb[i], t0=TL+(i%3)*BEAT*.5, u=span(t,t0-.06,t0+.16,'o');const steps=Math.max(0,(t-t0)/BEAT);
    const st=Math.floor(steps)+EASE.io(Math.min(1,(steps%1)*1.8)), pp=c.p0+.03*st, idx=pp*(sc.length-1), j=Math.min(sc.length-2,Math.floor(idx)), f=idx-j;
    const x=sc[j][0]+(sc[j+1][0]-sc[j][0])*f+(i%2?-16:16), y=sc[j][1]+(sc[j+1][1]-sc[j][1])*f;
    const e=$('cb_'+i);e.setAttribute('opacity',f2(u));e.innerHTML=silJS(DATA.climbParts[i%2],x,y,c.s*(1-.3*pp),false,[-1.2,-1],'#211A17','#F2C08A')}
  $('smk').innerHTML=past>0?smoke(872,1030,170,t,3,1.3,'#EFE6D8',.55*past)+smoke(913,1022,150,t+.31,7,1.2,'#EFE6D8',.5*past):'';
  // 你
  let p=breathe(track(DATA.K,t),t,2.5);
  if(t>TL)p.nk[1]+=3*beatPulse(t,TL+BEAT,DUR,.06);
  const Y=you(p,DATA.you.b[0],DATA.you.b[1],DATA.you.s);
  $('you').innerHTML=Y.svg;
  bubble(t,Y.head,Y.hr,MATS.Lyou);
  counter(t,T0,TL,DATA.CN);
};'''
    return page(2 * BAR, body, data, js)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    which = sys.argv[2:] or ['chichen_when', 'chichen_what']
    for name in which:
        fn = globals().get(name)
        if fn:
            open(os.path.join(out, name + '.html'), 'w').write(fn()); print('page', name)
