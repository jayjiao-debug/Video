"""ep57 explanation shots for 佩特拉 (petra): two self-contained animated pages (see shots/BRIEF.md).
  petra_when  3.344 s  时光倒流 on the coded night scene (petra_vector.py): the lantern field at the Treasury's foot,
              colour drains to sepia, grain and scratches, a dolly-in with parallax; the year rolls 2026 → 公元前100
              and lands on t = 1.672 (约 · 年); 你 flinches, looks round, then points at the year.
  petra_what  5.016 s  the caravan (hist_c.petra_caravan, rebuilt in layers): the camels walk up the Siq on the beat
              (leg cycle, swinging ropes and tags, dust puffs), the camera dollies toward the Treasury while the
              walls stream past; 你 walks beside the last camel and points ahead on bar 3.
This file also holds the shared kit (JS port of the 你 rig, the 2.5D camera, bubble, film FX, year counter) that
taj.py imports.
usage: python3 petra.py OUTDIR   → OUTDIR/petra_when.html, OUTDIR/petra_what.html"""
import sys, os, math, json, random, re
SHOTS = os.path.dirname(os.path.abspath(__file__)); TOOLS = os.path.dirname(SHOTS)
sys.path.insert(0, TOOLS)
import hist_c as hc

INK, GOLD, CREAM = '#2A211B', '#F2C66E', '#FFF6E6'
BEAT, BAR = 0.418, 1.672
WENKAI = 'file:///home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai/wenkai-bold.css'

# ======================================================================================================
# shared kit
# ======================================================================================================
def run_sections(path, stop=None, marker='# ----------------'):
    """exec a scene script (which writes its SVG at import) in a namespace, chunk by chunk at its section markers;
    returns (namespace, [(section title, len(g) after it)]). `stop`: exec only the source before this text."""
    src = open(path).read()
    if stop: src = src[:src.index(stop)]
    chunks, cur = [], []
    for ln in src.split('\n'):
        if ln.startswith(marker) and cur: chunks.append('\n'.join(cur)); cur = []
        cur.append(ln)
    chunks.append('\n'.join(cur))
    ns = {'__name__': 'scene_src', '__file__': path}; marks = []
    old = sys.argv; sys.argv = [path, os.devnull]
    try:
        for c in chunks:
            exec(compile(c, path, 'exec'), ns); marks.append((c.split('\n')[0], len(ns.get('g', []))))
    finally: sys.argv = old
    return ns, marks

def sec(marks, key):
    """index range [a, b) of the elements a section added"""
    for i, (title, n) in enumerate(marks):
        if key in title: return (marks[i - 1][1] if i else 0), n
    raise KeyError(key)

KIT_JS = r'''
const cl=x=>Math.min(1,Math.max(0,x)), lerp=(a,b,u)=>a+(b-a)*u;
const EASE={io:x=>{x=cl(x);return x*x*(3-2*x);}, lin:x=>cl(x), out:x=>{x=cl(x);return 1-(1-x)**3;}, in:x=>{x=cl(x);return x*x*x;},
  io3:x=>{x=cl(x);return x<.5?4*x*x*x:1-(-2*x+2)**3/2;}, back:x=>{x=cl(x)-1;return 1+2.7*x**3+1.7*x**2;}};
const ease=EASE.io, out3=EASE.out;
const BEAT=0.418, BAR=1.672;
const REST={ra1:58,ra2:84,la1:122,la2:96,tilt:0,squat:0,lift:0,tuck:0,lean:0,walk:0,stride:0};
function track(keys,t){            // keys: [[t,{...},easing], ...] (every key carries every field)
  if(t<=keys[0][0]) return Object.assign({},keys[0][1]);
  for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];
    if(t<=b[0]){const f=(EASE[b[2]||'io'])((t-a[0])/(b[0]-a[0]));const o={};for(const k in a[1]) o[k]=lerp(a[1][k],b[1][k],f);return o;}}
  return Object.assign({},keys[keys.length-1][1]);
}
function hop(t,t0,d){return (t>=t0&&t<t0+d)?Math.sin(Math.PI*(t-t0)/d):0;}          // an arch after t0
function dip(t,t0,d){if(t<t0||t>=t0+d) return 0; const u=(t-t0)/d; return (1-u)*(1-u)*Math.sin(Math.PI*Math.min(1,u*2.2));}
function kick(t,t0,d){if(t<t0||t>=t0+d) return 0; const u=(t-t0)/d; return (1-u)**2;}       // sharp hit decaying
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const f1=x=>(+x).toFixed(1), $=id=>document.getElementById(id);

// ---------- the 你 rig (port of you_figure.figure + opt_comp.arms) ----------
function bez(a,c,b,n){n=n||24;const o=[];for(let i=0;i<=n;i++){const t=i/n;o.push([(1-t)**2*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)**2*a[1]+2*(1-t)*t*c[1]+t*t*b[1]]);}return o;}
function limb(a,e,b,w0,w1,fill){
  const c=[2*e[0]-(a[0]+b[0])/2,2*e[1]-(a[1]+b[1])/2],pts=bez(a,c,b),L=[],R=[];
  for(let i=0;i<pts.length;i++){const j=Math.min(i+1,pts.length-1),k=Math.max(i-1,0),dx=pts[j][0]-pts[k][0],dy=pts[j][1]-pts[k][1],d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d,w=(w0+(w1-w0)*i/(pts.length-1))/2;
    L.push([pts[i][0]+nx*w,pts[i][1]+ny*w]);R.push([pts[i][0]-nx*w,pts[i][1]-ny*w]);}
  const poly=L.concat(R.reverse());
  return `<path d="M${poly.map(p=>f1(p[0])+','+f1(p[1])).join(' L')}Z" fill="${fill}"/><circle cx="${f1(a[0])}" cy="${f1(a[1])}" r="${f1(w0/2)}" fill="${fill}"/>`;
}
const mid=(a,b,t)=>{t=t===undefined?.5:t;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];};
function figure(J,u,o){   // o: {fill, tilt}
  const fill=o.fill, nk=J.neck, hc=mid(J.l_hip,J.r_hip), tl=Math.hypot(nk[0]-hc[0],nk[1]-hc[1]);
  const side=J.r_shoulder[0]>J.l_shoulder[0]?1:-1;
  const lr=[nk[0]-side*u*.3,nk[1]+tl*.14], rr=[nk[0]+side*u*.3,nk[1]+tl*.14], lh=[hc[0]-side*u*.17,hc[1]], rh=[hc[0]+side*u*.17,hc[1]];
  const g=[];
  for(const [root,e,w] of [[lr,'l_elbow','l_wrist'],[rr,'r_elbow','r_wrist']]){g.push(limb(root,J[e],J[w],u*.15,u*.095,fill));g.push(`<circle cx="${f1(J[w][0])}" cy="${f1(J[w][1])}" r="${f1(u*.072)}" fill="${fill}"/>`);}
  for(const [root,k,a] of [[lh,'l_knee','l_ankle'],[rh,'r_knee','r_ankle']]){ if(!J[k]) continue;
    g.push(limb(root,J[k],J[a],u*.19,u*.12,fill)); const fx=J[a][0]>=root[0]?1:-1;
    g.push(`<ellipse cx="${f1(J[a][0]+fx*u*.05)}" cy="${f1(J[a][1]+u*.03)}" rx="${f1(u*.11)}" ry="${f1(u*.065)}" fill="${fill}"/>`);}
  const wc=u*.34,ww=u*.3,wh=u*.36;
  const body=`M${f1(nk[0]-wc)},${f1(nk[1]+tl*.08)} C${f1(nk[0]-wc*1.05)},${f1(nk[1]-tl*.06)} ${f1(nk[0]+wc*1.05)},${f1(nk[1]-tl*.06)} ${f1(nk[0]+wc)},${f1(nk[1]+tl*.08)} `+
    `C${f1(nk[0]+ww*1.05)},${f1(nk[1]+tl*.5)} ${f1(hc[0]+wh*1.15)},${f1(hc[1]+tl*.02)} ${f1(hc[0]+wh*.6)},${f1(hc[1]+tl*.13)} `+
    `Q${f1(hc[0])},${f1(hc[1]+tl*.2)} ${f1(hc[0]-wh*.6)},${f1(hc[1]+tl*.13)} C${f1(hc[0]-wh*1.15)},${f1(hc[1]+tl*.02)} ${f1(nk[0]-ww*1.05)},${f1(nk[1]+tl*.5)} ${f1(nk[0]-wc)},${f1(nk[1]+tl*.08)} Z`;
  g.push(`<path d="${body}" fill="${fill}"/>`);
  // an arm folded across the chest (hand on heart) is drawn again over the body, with a soft shadow, so it reads
  for(const [root,e,w] of [[lr,'l_elbow','l_wrist'],[rr,'r_elbow','r_wrist']]){ const W=J[w];
    if(Math.abs(W[0]-hc[0])<u*.3&&W[1]>nk[1]+tl*.12&&W[1]<hc[1]-tl*.1)
      g.push(`<g filter="url(#yarm)">${limb(root,J[e],W,u*.15,u*.095,fill).split('<circle')[0]}<circle cx="${f1(W[0])}" cy="${f1(W[1])}" r="${f1(u*.072)}" fill="${fill}"/></g>`); }
  const [hx,hy]=J.head, hr=u*.28;
  g.push(`<g transform="rotate(${f1(o.tilt||0)} ${f1(hx)} ${f1(hy)})"><ellipse cx="${f1(hx)}" cy="${f1(hy)}" rx="${f1(hr)}" ry="${f1(hr*1.08)}" fill="${fill}"/>`);
  // the face, exactly as you_figure.figure(face=True): dot eyes, small smile, blush
  const ex=hr*.34, ey=hr*.05;
  g.push(`<ellipse cx="${f1(hx-ex)}" cy="${f1(hy+ey)}" rx="${f1(hr*.075)}" ry="${f1(hr*.1)}" fill="#2B2724"/><ellipse cx="${f1(hx+ex)}" cy="${f1(hy+ey)}" rx="${f1(hr*.075)}" ry="${f1(hr*.1)}" fill="#2B2724"/>`+
    `<path d="M${f1(hx-hr*.16)},${f1(hy+hr*.3)} Q${f1(hx)},${f1(hy+hr*.45)} ${f1(hx+hr*.16)},${f1(hy+hr*.3)}" fill="none" stroke="#2B2724" stroke-width="${f1(hr*.055)}" stroke-linecap="round"/>`+
    `<circle cx="${f1(hx-hr*.56)}" cy="${f1(hy+hr*.3)}" r="${f1(hr*.14)}" fill="#F4A9A0" opacity=".45"/><circle cx="${f1(hx+hr*.56)}" cy="${f1(hy+hr*.3)}" r="${f1(hr*.14)}" fill="#F4A9A0" opacity=".45"/>`);
  g.push('</g>');
  return `<g filter="url(#yds)">${g.join('')}</g>`;
}
// pose state S: ra1 ra2 la1 la2 (screen angles, deg: 0 right, 90 down), tilt, squat, lift, tuck, lean (deg), walk (phase, rad), stride (units)
function joints(S){
  const q=S.squat||0, dy=30*q, lean=(S.lean||0)*Math.PI/180, tk=S.tuck||0, st=S.stride||0;
  const P={head:[0,-298+dy],neck:[0,-262+dy],l_shoulder:[-55,-250+dy],r_shoulder:[55,-250+dy],l_hip:[-22,-120+dy],r_hip:[22,-120+dy]};
  // legs: stand → squat (knees out) → tuck (jump) ; walking swings the ankles and lifts the swinging foot
  for(const [s,k] of [[-1,'l'],[1,'r']]){
    const ph=(S.walk||0)+(s>0?Math.PI:0), sw=st*Math.sin(ph), lf=st*.5*Math.max(0,Math.cos(ph));
    let ank=[s*26+sw, -lf], kne=[s*(25+16*q)+sw*.55, -60+dy*.25-lf*1.2-2*q];
    const jk=[s*48,-66+dy*.3], ja=[s*84,-34];
    kne=[lerp(kne[0],jk[0],tk),lerp(kne[1],jk[1],tk)]; ank=[lerp(ank[0],ja[0],tk),lerp(ank[1],ja[1],tk)];
    P[k+'_knee']=kne; P[k+'_ankle']=ank;
  }
  // arms (fixed segment lengths, as opt_comp.arms)
  const nk=P.neck, hcx=(P.l_hip[0]+P.r_hip[0])/2, hcy=(P.l_hip[1]+P.r_hip[1])/2, ry=nk[1]+Math.hypot(nk[0]-hcx,nk[1]-hcy)*.14, R=Math.PI/180;
  for(const [k,a1,a2,sx] of [['r',S.ra1,S.ra2,1],['l',S.la1,S.la2,-1]]){
    const x0=nk[0]+sx*36, e=[x0+64*Math.cos(a1*R), ry+64*Math.sin(a1*R)];
    P[k+'_elbow']=e; P[k+'_wrist']=[e[0]+60*Math.cos(a2*R), e[1]+60*Math.sin(a2*R)];
  }
  if(lean){ const c=Math.cos(lean), s=Math.sin(lean);
    for(const k of ['head','neck','l_shoulder','r_shoulder','l_elbow','r_elbow','l_wrist','r_wrist']){const x=P[k][0]-hcx,y=P[k][1]-hcy;P[k]=[hcx+x*c-y*s,hcy+x*s+y*c];} }
  return P;
}
// draws 你 at feet (bx, by) with sc src px per unit; returns {svg, head:[x,y] (centre), top:[x,y] (crown)}
function you(S,bx,by,sc,fill,shadow){
  const P=joints(S), lift=(S.lift||0)*sc, J={};
  for(const k in P) J[k]=[bx+P[k][0]*sc, by-lift+P[k][1]*sc];
  const u=120*sc; let sh='';
  if(shadow!==false){ const k=1/(1+(S.lift||0)/60); sh=`<ellipse cx="${f1(bx)}" cy="${f1(by+u*.04)}" rx="${f1(u*.5*k)}" ry="${f1(u*.08*k)}" fill="#1A0E08" opacity="${f1(.35*k)}" filter="url(#ysb)"/>`; }
  const svg=sh+figure(J,u,{fill:fill,tilt:S.tilt||0});
  const hr=u*.28, th=(S.tilt||0)*Math.PI/180;
  return {svg:svg, head:J.head, top:[J.head[0]+Math.sin(th)*hr*1.08, J.head[1]-Math.cos(th)*hr*1.08], J:J, u:u};
}

// ---------- 2.5D camera: every layer has a depth d; cam = {Z (dolly), zoom, TX, TY (truck/crane, px at depth dref), roll (deg)} ----------
function layerK(cam,d,d0){ // unrotated: screen = (ex,ey) + src*k ; d = current depth, d0 = the depth the layer is drawn at
  if(d0===undefined) d0=d;
  const den=Math.max(.05,d-cam.Z), k=CFG.S0*cam.zoom*d0/den, sh=CFG.dref/den*cam.zoom;
  return {k:k, ex:CFG.V[0]-CFG.P0[0]*k-cam.TX*sh+(cam.sx||0), ey:CFG.V[1]-CFG.P0[1]*k-cam.TY*sh+(cam.sy||0)};
}
function rotM(L,roll){const r=roll*Math.PI/180,c=Math.cos(r),s=Math.sin(r),k=L.k,ex=L.ex-960,ey=L.ey-540;
  return [k*c,k*s,-k*s,k*c,c*ex-s*ey+960,s*ex+c*ey+540];}
const mstr=M=>`matrix(${M.map(v=>v.toFixed(5)).join(' ')})`;
const apply=(M,p)=>[M[0]*p[0]+M[2]*p[1]+M[4], M[1]*p[0]+M[3]*p[1]+M[5]];
function setLayer(id,cam,d,d0){const L=layerK(cam,d,d0),M=rotM(L,cam.roll||0);const e=$(id);if(e)e.setAttribute('transform',mstr(M));return M;}

// ---------- the gold 你 bubble (screen space; tail tip at `tip`) ----------
function bubble(t,tip,tIn,vis){
  const b=$('bub'); if(!tip||!vis||t<tIn){b.setAttribute('opacity','0');return;}
  const u=(t-tIn)/.4, sc=u<1?.4+.6*EASE.back(u):1, bob=5*Math.sin((t-tIn)*5.2);
  b.setAttribute('opacity',f1(cl(u/.25)));
  b.setAttribute('transform',`translate(${f1(tip[0])},${f1(tip[1]+bob)}) scale(${sc.toFixed(4)}) translate(-960,-540)`);
}
const inFrame=p=>p&&p[0]>40&&p[0]<1880&&p[1]>60&&p[1]<1060;

// ---------- film FX: grain, scratches, flicker, vignette (amount a in 0..1) ----------
function filmFX(t,a){
  const fr=Math.floor(t*24), R=rng(9001+fr*7);
  $('grainT').setAttribute('seed',String(1+fr%97)); $('grain').setAttribute('opacity',f1(.55*a));
  let s='';
  if(a>.02){ const n=2+Math.floor(R()*3);
    for(let i=0;i<n;i++){const x=R()*1920, y0=R()*300-100, y1=y0+400+R()*900, w=1+R()*2.2, dark=R()<.55;
      s+=`<path d="M${f1(x)},${f1(y0)} L${f1(x+(R()-.5)*14)},${f1(y1)}" stroke="${dark?'#2A1C12':'#FFF4DC'}" stroke-width="${f1(w)}" opacity="${f1(a*(.25+.35*R()))}" fill="none"/>`;}
    const m=4+Math.floor(R()*6);
    for(let i=0;i<m;i++){const x=R()*1920,y=R()*1080,r=1+R()*3.5; s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${R()<.6?'#24170F':'#FFF1D6'}" opacity="${f1(a*.6)}"/>`;}
    if(R()<.25){const y=R()*1080, x=R()*1200; s+=`<path d="M${f1(x)},${f1(y)} L${f1(x+300+R()*400)},${f1(y+(R()-.5)*16)}" stroke="#FFF4DC" stroke-width="1.2" opacity="${f1(a*.14)}"/>`;}
  }
  $('scr').innerHTML=s; $('vig').setAttribute('opacity',f1(.25+.6*a));
  return 1+(R()-.5)*.05*a;   // brightness flicker for the world filter
}
'''

FIG_DEFS = ('<filter id="yds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="6" dy="12" stdDeviation="12" flood-color="#1A1410" flood-opacity=".3"/></filter>'
            '<filter id="yarm" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#5A3A34" flood-opacity=".4"/></filter>'
            '<filter id="ysb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>')
BUBBLE = (f'<g id="bub" opacity="0"><g filter="url(#bds)"><path d="M944,512 L960,540 L978,512 Z" fill="{GOLD}" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
          f'<rect x="896" y="420" width="128" height="96" rx="30" fill="{GOLD}" stroke="{INK}" stroke-width="5"/><rect x="940" y="508" width="40" height="10" fill="{GOLD}"/></g>'
          f'<text x="960" y="490" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="66" fill="{INK}">你</text></g>')
HUD_DEFS = ('<filter id="bds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/></filter>'
            f'<filter id="cds" x="-20%" y="-30%" width="140%" height="170%"><feDropShadow dx="0" dy="9" stdDeviation="0" flood-color="{INK}" flood-opacity=".95"/>'
            '<feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#000" flood-opacity=".45"/></filter>'
            '<filter id="cblur" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur id="cblurS" stdDeviation="0 0"/></filter>')
FX = ('<svg id="fx" width="1920" height="1080" style="position:absolute;left:0;top:0;pointer-events:none">'
      '<defs><filter id="grainF" x="0" y="0" width="100%" height="100%"><feTurbulence id="grainT" type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="1" stitchTiles="stitch"/>'
      '<feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .33  0 0 0 1.6 -.55"/></filter>'
      '<radialGradient id="vigG" cx="50%" cy="50%" r="72%"><stop offset=".55" stop-color="#1A0F08" stop-opacity="0"/><stop offset="1" stop-color="#1A0F08" stop-opacity=".85"/></radialGradient></defs>'
      '<rect id="grain" width="1920" height="1080" filter="url(#grainF)" opacity="0" style="mix-blend-mode:overlay"/>'
      '<g id="scr"></g><rect id="vig" width="1920" height="1080" fill="url(#vigG)" opacity=".25"/></svg>')

def counter_svg():
    """the year counter: digits (right-aligned at #yr x), an optional prefix and the label before/after (petra / taj set them)"""
    st = f'font-family="Noto Sans CJK SC" font-weight="900" fill="{CREAM}" stroke="{INK}" stroke-width="10" paint-order="stroke" stroke-linejoin="round"'
    return (f'<g id="ctr" opacity="0" filter="url(#cds)"><g id="ctrin">'
            f'<text id="yr" x="0" y="0" font-size="190" text-anchor="end" {st} filter="url(#cblur)">2026</text>'
            f'<text id="pre" x="0" y="0" font-size="92" text-anchor="end" {st} opacity="0">公元前</text>'
            f'<text id="lab1" x="0" y="0" font-size="66" text-anchor="end" {st} opacity="0"></text>'
            f'<text id="lab2" x="0" y="0" font-size="66" text-anchor="start" {st} opacity="0"></text></g></g>')

COUNTER_JS = r'''
// year counter: rolls 2026 → C.target with the progress F(u) (u = t/BAR) and lands exactly on BAR with a punch; label pops at the landing
function counter(t,C,F){
  const t1=BAR, u=cl(t/t1), f=F(u), v=Math.round(2026+(C.target-2026)*f);
  const g=$('ctr'); g.setAttribute('opacity','1');
  const yr=$('yr'), pre=$('pre'), l1=$('lab1'), l2=$('lab2');
  yr.textContent=String(Math.abs(v)); yr.setAttribute('x',C.xr); yr.setAttribute('y',C.y);
  const rate=t<t1? Math.abs((C.target-2026)*(F(Math.min(1,u+.01))-f)/.01/t1):0;   // years per second
  $('cblurS').setAttribute('stdDeviation','0 '+f1(Math.min(9,rate/450)));
  const w=yr.getComputedTextLength();
  const bc=v<=0; pre.setAttribute('opacity',bc?'1':'0'); pre.setAttribute('x',f1(C.xr-w-12)); pre.setAttribute('y',C.y);
  const left=bc? C.xr-w-12-pre.getComputedTextLength(): C.xr-w;
  const lu=cl((t-t1)/.22), ls=t>=t1? .5+.5*EASE.back(lu):0;
  l1.textContent=C.lab1; l2.textContent=C.lab2;
  l1.setAttribute('x',f1(left-12)); l1.setAttribute('y',C.y); l2.setAttribute('x',f1(C.xr+12)); l2.setAttribute('y',C.y);
  for(const [e,ax] of [[l1,left-12],[l2,C.xr+12]]){ e.setAttribute('opacity',t>=t1?f1(cl(lu*3)):'0');
    e.setAttribute('transform',`translate(${f1(ax)},${C.y-30}) scale(${ls.toFixed(3)}) translate(${f1(-ax)},${-(C.y-30)})`); }
  // the punch: 1.15 → 1 on the landing, a small squash while rolling fast
  const p=t>=t1? 1+.15*(1-EASE.out(cl((t-t1)/.3))) : 1+.03*Math.min(1,rate/3000);
  const cx=(left+C.xr)/2, cy=C.y-70, jit=rate>200? ((Math.floor(t*30)%2)?2:-2)*Math.min(1,rate/2500):0;
  $('ctrin').setAttribute('transform',`translate(${f1(cx)},${f1(cy+jit)}) scale(${p.toFixed(4)}) translate(${f1(-cx)},${f1(-cy)})`);
}
'''

def page(title, dur, world_svg, js, defs='', fill_defs='', extra_hud='', world_style=''):
    """the shot page: #f > #world (the layered SVG, CSS filter for the sepia ramp) + FX overlay + HUD (counter, bubble)"""
    return f'''<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<link rel="stylesheet" href="{WENKAI}">
<style>html,body{{margin:0;background:#000}} #f{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000}}</style></head>
<body><div id="f" style="position:relative;width:1920px;height:1080px;overflow:hidden">
<div id="world" style="position:absolute;left:0;top:0;width:1920px;height:1080px;{world_style}">
<svg id="sv" width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg" style="position:absolute;left:0;top:0">
<defs>{defs}{FIG_DEFS}{fill_defs}</defs>
{world_svg}
</svg></div>
{FX}
<svg id="hud" width="1920" height="1080" style="position:absolute;left:0;top:0"><defs>{HUD_DEFS}</defs>{extra_hud}{BUBBLE}</svg>
</div>
<script>
window.DUR={dur};
{KIT_JS}
{COUNTER_JS}
{js}
window.render(0);
</script></body></html>'''

def keys(*ks, fields=None):
    """[(t, {..}, easing)] → JSON-able list where every key carries every field (missing = previous value)"""
    out, cur = [], {}
    for k in ks:
        t, d = k[0], k[1]; e = k[2] if len(k) > 2 else 'io'
        cur = dict(cur, **d); out.append([t, dict(cur), e])
    allk = set().union(*(set(k[1]) for k in out))
    first = {f: next(k[1][f] for k in out if f in k[1]) for f in allk}
    for k in out:
        for f in allk: k[1].setdefault(f, first[f])
    return out

REST = dict(ra1=58, ra2=84, la1=122, la2=96, tilt=0, squat=0, lift=0, tuck=0, lean=0, walk=0, stride=0)

def G(gid, items, extra=''):
    return f'<g id="{gid}"{(" " + extra) if extra else ""}>' + '\n'.join(items) + '</g>'

# ======================================================================================================
# _when: 「穿越时间轴」 on blueprint (one device for every stop; taj.py imports it)
# ======================================================================================================
CHALK = '#F3F8FF'
RULER_Y = 770                              # the ruler's top edge: 你 runs on it
X_START, X_LAND, TRUCK = 1150, 840, 580    # 你 on screen at 2026 and at the landing; the camera's truck (px, ≤ 18 px/frame)
MON_X = 470                                # the monument's axis on screen after the landing

def _pairs(e):
    m = re.search(r'\s(?:points|d)="([^"]*)"', e)
    return [(float(a), float(b)) for a, b in re.findall(r'(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)', m.group(1))] if m else []
def yext(e):
    """(top, bottom) y of an element string"""
    if e.startswith(('<ellipse', '<circle')):
        cy = float(re.search(r'\scy="([-\d.]+)"', e).group(1)); r = re.search(r'\s(?:ry|r)="([-\d.]+)"', e)
        r = float(r.group(1)) if r else 0; return cy - r, cy + r
    ys = [y for _, y in _pairs(e)]
    return (min(ys), max(ys)) if ys else (0, 0)
def chalk(els, swk=1.0, deco_op=.6, cls='dr'):
    """line art on blueprint: fills dropped, every outline in chalk; fill-only shading is dropped.
    returns [(top, bottom, element)] with pathLength=1 dashes ready for the draw-on"""
    out = []
    for e in els:
        if not e.startswith(('<polygon', '<polyline', '<path', '<ellipse', '<circle', '<line')): continue
        st = re.search(r'\sstroke="([^"]*)"', e); sw = re.search(r'\sstroke-width="([^"]*)"', e)
        if not st or st.group(1) == 'none' or not sw or float(sw.group(1)) == 0: continue
        deco = st.group(1).upper() != INK.upper()
        w = max(1.4, float(sw.group(1)) * swk * (.75 if deco else 1))
        top, bot = yext(e)
        for a in ('fill', 'stroke', 'stroke-width', 'opacity'): e = re.sub(rf'\s{a}="[^"]*"', '', e)
        e = e[:-2].rstrip() + (f' fill="none" stroke="{CHALK}" stroke-width="{w:.1f}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"'
                               f' visibility="hidden" class="{cls}"' + (f' opacity="{deco_op}"' if deco else '') + '/>')
        out.append((top, bot, e))
    return out
def timed(items, t0, t1, dur=.3):
    """give drawn lines their start times: base first (largest bottom y), the top last"""
    items = sorted(items, key=lambda it: -(it[0] + it[1]) / 2); n = max(1, len(items) - 1)
    return [e.replace(' class=', f' data-a="{t0 + (t1 - dur - t0) * i / n:.3f}" data-d="{dur}" class=', 1) for i, (_, _, e) in enumerate(items)]
def cline(p, w=2.5, op=None, cls='dr', a=0, d=.3, dash=None):
    """a chalk polyline to draw on at time a"""
    extra = (f' opacity="{op}"' if op is not None else '')
    if dash: return f'<polyline points="{hc.pts(p)}" fill="none" stroke="{CHALK}" stroke-width="{w}" stroke-dasharray="{dash}" stroke-linecap="round" class="fade" data-a="{a:.3f}" data-d="{d}" opacity="0"{"" if op is None else f" data-o=\"{op}\""}/>'
    return (f'<polyline points="{hc.pts(p)}" fill="none" stroke="{CHALK}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" '
            f'stroke-dasharray="1 1" stroke-dashoffset="1" visibility="hidden" class="{cls}" data-a="{a:.3f}" data-d="{d}"{extra}/>')
def silhouette(els, a, fx, fy):
    """a tiny figure (hist_c.figure / elephant) as a filled chalk silhouette that pops in at time a (feet at fx, fy)"""
    out = []
    for e in els:
        if 'opacity=".25"' in e or 'opacity=".35"' in e: continue   # their ground shadows
        e = re.sub(r'\sfill="(?!none)[^"]*"', f' fill="{CHALK}"', e); e = re.sub(r'\sstroke="(?!none)[^"]*"', f' stroke="{CHALK}"', e)
        out.append(e)
    return f'<g class="pop" data-a="{a:.3f}" data-x="{fx:.1f}" data-y="{fy:.1f}" opacity="0">' + ''.join(out) + '</g>'
def dim_v(x, y0, y1, label, a, tick=14, side=1):
    """a vertical dimension line with arrowheads and its label"""
    out = [cline([(x - tick, y0), (x + tick, y0)], 2, .8, a=a, d=.15), cline([(x - tick, y1), (x + tick, y1)], 2, .8, a=a, d=.15),
           cline([(x, y0), (x, y1)], 2.2, .85, a=a + .05, d=.3),
           cline([(x - 8, y1 + 14), (x, y1), (x + 8, y1 + 14)], 2.2, .85, a=a + .3, d=.08), cline([(x - 8, y0 - 14), (x, y0), (x + 8, y0 - 14)], 2.2, .85, a=a + .3, d=.08)]
    my = (y0 + y1) / 2
    out.append(f'<text x="{x + 16 * side}" y="{my + 10:.0f}" text-anchor="{"start" if side > 0 else "end"}" font-family="LXGW WenKai" font-weight="700" font-size="32" fill="{CHALK}" class="fade" data-a="{a + .2:.3f}" data-d=".2" opacity="0">{label}</text>')
    return out

def year_label(y):
    return str(y) if y > 0 else ('公元元年' if y == 0 else f'前{-y}')

def ruler(T, minor, mid, major, label_every, eras, target_label, era_target):
    """the time ruler in world px (x = X_START at 2026, years to the left); returns (elements, px per year)"""
    ppy = (X_START - X_LAND + TRUCK) / (2026 - T)
    X = lambda y: X_START + (y - 2026) * ppy
    y0 = RULER_Y; y1 = RULER_Y + 36
    ymin = int(2026 + (-TRUCK - 520 - X_START) / ppy) // minor * minor
    out = [f'<rect x="{X(ymin):.1f}" y="{y0}" width="{X(2026) - X(ymin):.1f}" height="36" fill="#2E5385" opacity=".55"/>',
           hc.line([(X(ymin), y0), (X(2026), y0)], CHALK, 3), hc.line([(X(ymin), y1), (X(2026), y1)], CHALK, 2, 'opacity=".8"'),
           hc.line([(X(2026), y0 - 10), (X(2026), y1 + 10)], CHALK, 3.5),
           # today onwards: the ruler goes on, dashed
           f'<path d="M{X(2026) + 8:.1f},{y0} H{X(2026) + 1200:.1f} M{X(2026) + 8:.1f},{y1} H{X(2026) + 1200:.1f}" stroke="{CHALK}" stroke-width="2" stroke-dasharray="10 12" opacity=".45" fill="none"/>']
    tk = []
    for y in range(ymin, 2026 + 1, minor):
        x = X(y)
        if y % major == 0: tk.append(((x, y0), (x, y1 + 8)))
        elif y % mid == 0: tk.append(((x, y0), (x, y0 + 22)))
        else: tk.append(((x, y0), (x, y0 + 11)))
    out.append(hc.marks(tk, CHALK, 2, 'opacity=".9"'))
    for y in range(ymin // label_every * label_every, 2026, label_every):
        if y < ymin or abs(y - T) * ppy < 95 or (2026 - y) * ppy < 70: continue
        big = y % major == 0
        out.append(f'<text x="{X(y):.1f}" y="{y1 + (44 if big else 38)}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="700" font-size="{30 if big else 24}" fill="{CHALK}" opacity="{.92 if big else .7}">{year_label(y)}</text>')
    out.append(f'<text x="{X(2026):.1f}" y="{y1 + 44}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="700" font-size="30" fill="{CHALK}">2026</text>')
    for name, y in eras:   # the eras' names, small chalk letters above the ruler
        out.append(f'<text x="{X(y):.1f}" y="{y0 - 14}" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="28" fill="{CHALK}" opacity=".62">{name}</text>')
    # the target: a gold tick, its year and its era
    xt = X(T)
    out.append(f'<g id="tgt"><path d="M{xt:.1f},{y0 - 26} V{y1 + 12}" stroke="{GOLD}" stroke-width="5" stroke-linecap="round"/>'
               f'<text x="{xt:.1f}" y="{y1 + 50}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="38" fill="{GOLD}" stroke="#16263F" stroke-width="6" paint-order="stroke">{target_label}</text>'
               f'<text x="{xt + 34:.1f}" y="{y0 - 14}" text-anchor="start" font-family="LXGW WenKai" font-weight="700" font-size="34" fill="{GOLD}">{era_target}</text></g>')
    return out, ppy, xt

def tools_fg():
    """floating construction tools (set square, compass, plumb line), chalk line art, foreground (1.4×)"""
    def sq(cx, cy, s):
        return (f'<g class="tool" data-c="{cx},{cy}"><polygon points="{cx - s * .5:.0f},{cy + s * .4:.0f} {cx + s * .5:.0f},{cy + s * .4:.0f} {cx - s * .5:.0f},{cy - s * .5:.0f}" fill="none" stroke="{CHALK}" stroke-width="4"/>'
                f'<polygon points="{cx - s * .36:.0f},{cy + s * .27:.0f} {cx + s * .1:.0f},{cy + s * .27:.0f} {cx - s * .36:.0f},{cy - s * .2:.0f}" fill="none" stroke="{CHALK}" stroke-width="3"/>'
                + ''.join(f'<path d="M{cx - s * .5 + i * s / 8:.0f},{cy + s * .4:.0f} v{-10 if i % 2 else -18}" stroke="{CHALK}" stroke-width="2.5"/>' for i in range(1, 8)) + '</g>')
    def compass(cx, cy, s):
        return (f'<g class="tool" data-c="{cx},{cy}"><path d="M{cx},{cy - s * .5} L{cx - s * .3},{cy + s * .5} M{cx},{cy - s * .5} L{cx + s * .3},{cy + s * .5}" stroke="{CHALK}" stroke-width="5" fill="none" stroke-linecap="round"/>'
                f'<circle cx="{cx}" cy="{cy - s * .5}" r="{s * .07:.0f}" fill="none" stroke="{CHALK}" stroke-width="4"/><path d="M{cx},{cy - s * .62} v{-s * .14:.0f}" stroke="{CHALK}" stroke-width="5"/>'
                f'<path d="M{cx - s * .55},{cy + s * .55} Q{cx},{cy + s * .85} {cx + s * .55},{cy + s * .55}" stroke="{CHALK}" stroke-width="2.5" stroke-dasharray="8 8" fill="none"/></g>')
    def plumb(cx, cy, L):
        return (f'<g class="tool" data-c="{cx},{cy - L}"><path d="M{cx},{cy - L} V{cy}" stroke="{CHALK}" stroke-width="2.5"/>'
                f'<path d="M{cx - 16},{cy} L{cx + 16},{cy} L{cx},{cy + 40} Z" fill="none" stroke="{CHALK}" stroke-width="4" stroke-linejoin="round"/></g>')
    return [sq(490, 935, 150), compass(860, 900, 120), plumb(-740, 330, 330), sq(-560, 960, 110)]

def when_page(name, T, label1, label2, xr, eras, target_label, era_target, monument, minor=100, mid=100, major=500, label_every=500, mon_cx=None):
    """the blueprint 「穿越时间轴」 page. monument(cx, by) → [elements] in world coords (drawn after the landing)"""
    rul, ppy, xt = ruler(T, minor, mid, major, label_every, eras, target_label, era_target)
    mon = monument(MON_X - TRUCK, RULER_Y)
    R = random.Random(hash(name) % 1000)
    dust = ''.join(f'<circle cx="{R.uniform(-1300, 1900):.0f}" cy="{R.uniform(140, 1040):.0f}" r="{R.uniform(1.5, 4.5):.1f}" fill="{CHALK}" opacity="{R.uniform(.12, .45):.2f}"/>' for _ in range(70))
    defs = (f'<radialGradient id="paper" cx="50%" cy="46%" r="75%"><stop offset="0" stop-color="#1D3557"/><stop offset="1" stop-color="#16263F"/></radialGradient>'
            f'<pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M40 0V200M80 0V200M120 0V200M160 0V200M0 40H200M0 80H200M0 120H200M0 160H200" stroke="#FFFFFF" stroke-opacity=".08" stroke-width="1.3" fill="none"/>'
            f'<path d="M0 0V200M0 0H200" stroke="#FFFFFF" stroke-opacity=".15" stroke-width="1.8" fill="none"/></pattern>'
            '<filter id="pgrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 -.18"/></filter>'
            '<filter id="chalkF" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="3" result="n"/>'
            '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/>'
            '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.55" result="a"/><feComposite in="d" in2="a" operator="in"/></filter>'
            '<filter id="dof" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>'
            f'<radialGradient id="puff"><stop offset="0" stop-color="{CHALK}" stop-opacity=".7"/><stop offset="1" stop-color="{CHALK}" stop-opacity="0"/></radialGradient>')
    world = [f'<rect width="1920" height="1080" fill="url(#paper)"/>',
             G('L_grid', [f'<rect x="-900" y="-400" width="3800" height="1900" fill="url(#grid)"/>']),
             f'<rect width="1920" height="1080" filter="url(#pgrain)" opacity=".22"/>',
             G('L_main', [G('rul', rul), G('mon', mon, 'filter="url(#chalkF)"'), '<g id="skid"></g>', '<g id="FIG"></g>']),
             G('L_fg', [G('tools', tools_fg(), 'opacity=".4" filter="url(#dof)"'), G('fdust', [dust])]),
             '<g id="speed"></g>']
    fill = ('<linearGradient id="yfill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F1F4F8"/>'
            '<stop offset="1" stop-color="#B9C4D4"/></linearGradient>')
    cfg = dict(T=T, truck=TRUCK, xs=X_START, xl=X_LAND, ry=RULER_Y, sc=.84, F=[MON_X + 10, 560], push=.05, roll=-1.0,
               C=dict(target=T, xr=xr, y=520, lab1=label1, lab2=label2))
    js = 'const CFG=' + json.dumps(cfg) + ';\n' + WHEN_JS
    return page(name, round(2 * BAR, 3), '\n'.join(world), js, defs, fill, extra_hud=counter_svg())

WHEN_JS = r'''
// the truck: a quick start, cruise, then a long smooth ease-out that lands on BAR (peak ≈ 1.5× the mean speed)
const TA=.08, TB=.4, TAREA=TA/2+(TB-TA)+(1-TB)/2;
function E(u){u=cl(u); let a; if(u<TA) a=u*u/(2*TA); else if(u<TB) a=TA/2+(u-TA); else {const w=(u-TB)/(1-TB); a=TA/2+(TB-TA)+(1-TB)*(w-w*w*w+w*w*w*w/2);} return a/TAREA;}
function Ev(u){u=cl(u); let v; if(u<TA) v=u/TA; else if(u<TB) v=1; else {const w=(u-TB)/(1-TB); v=1-w*w*(3-2*w);} return v;}   // speed, 0..1
function camM(p,camX,zoom,roll,F){ const z=1+(zoom-1)*p, r=roll*Math.PI/180, c=Math.cos(r), s=Math.sin(r), qx=(-p*camX-F[0])*z, qy=-F[1]*z;
  return [z*c,z*s,-z*s,z*c,F[0]+c*qx-s*qy,F[1]+s*qx+c*qy]; }
const DR=[...document.querySelectorAll('.dr')].map(e=>[e,+e.dataset.a,+e.dataset.d]);
const FADE=[...document.querySelectorAll('.fade')].map(e=>[e,+e.dataset.a,+e.dataset.d,e.dataset.o?+e.dataset.o:1]);
const POP=[...document.querySelectorAll('.pop')].map(e=>[e,+e.dataset.a,+e.dataset.x,+e.dataset.y]);
const TOOLS=[...document.querySelectorAll('.tool')].map(e=>[e,e.dataset.c.split(',').map(Number)]);
function mixJ(list){ // blend the joints of several poses: [[S,w],...]
  const out={}; let lift=0,tilt=0;
  for(const [S,w] of list){ if(w<=0) continue; const P=joints(S); for(const k in P){ if(!out[k]) out[k]=[0,0]; out[k][0]+=P[k][0]*w; out[k][1]+=P[k][1]*w; } lift+=(S.lift||0)*w; tilt+=(S.tilt||0)*w; }
  return {P:out,lift:lift,tilt:tilt};
}
window.render=function(t){
  const u=t/BAR, e=E(u), v=t<BAR?Ev(u):0;
  const camX=-CFG.truck*e;
  const pa=cl((t-BAR)/BAR), zoom=1+CFG.push*EASE.out(pa)+.018*kick(t,BAR,.3), roll=CFG.roll*ease(pa);
  const M={}; for(const [id,p] of [['L_grid',.5],['L_main',1],['L_fg',1.4]]){ M[id]=camM(p,camX,zoom,roll,CFG.F); $(id).setAttribute('transform',mstr(M[id])); }
  // 你: runs left (a step every half beat), skids into the landing, turns and points up at the year
  const xw=CFG.xs-(CFG.xs-CFG.xl+CFG.truck)*e;
  const ph=Math.PI/2+2*Math.PI*t/BEAT, sp=Math.sin(ph);
  const run=Object.assign({},REST,{walk:ph,stride:26,lean:-13,squat:.1+.12*Math.abs(sp),lift:14*Math.abs(Math.cos(ph))+6*hop(t%BEAT,0,.2),
      ra1:70-42*sp,ra2:-10-42*sp,la1:110+42*sp,la2:190+42*sp,tilt:-6});
  const skid=Object.assign({},REST,{walk:-Math.PI/2,stride:24,lean:15,squat:.5,ra1:-25,ra2:-70,la1:215,la2:250,tilt:10});
  const pt=Object.assign({},REST,{ra1:-50,ra2:-44,la1:112,la2:52,tilt:-8,lean:3});
  pt.squat+=.3*dip(t,BAR,.32)+.04*Math.sin(t*4.5); for(const b of [2.09,2.508,2.926]){ pt.squat+=.18*dip(t,b,.3); pt.ra1-=5*dip(t,b,.3); }
  pt.lift=10*hop(t,BAR+.12,.25);
  const ws=ease((t-1.12)/.16), wp=ease((t-BAR+.02)/.15);
  const W=[[run,(1-ws)],[skid,ws*(1-wp)],[pt,wp]];
  const mj=mixJ(W), sc=CFG.sc, J={}, bx=xw, by=CFG.ry;
  for(const k in mj.P) J[k]=[bx+mj.P[k][0]*sc, by-mj.lift*sc+mj.P[k][1]*sc];
  const uu=120*sc, sh=`<ellipse cx="${f1(bx)}" cy="${f1(by+uu*.03)}" rx="${f1(uu*.5)}" ry="${f1(uu*.07)}" fill="#0A1424" opacity=".45" filter="url(#ysb)"/>`;
  $('FIG').innerHTML=sh+figure(J,uu,{fill:'url(#yfill)',tilt:mj.tilt});
  const hr=uu*.28, th=mj.tilt*Math.PI/180, top=apply(M.L_main,[J.head[0]+Math.sin(th)*hr*1.08, J.head[1]-Math.cos(th)*hr*1.08]);
  bubble(t,[top[0],top[1]-14],.04,inFrame(top));
  // speed lines behind (to the right of) the runner
  let sl=''; if(v>.05){ const R=rng(77+Math.floor(t*30)), hs=apply(M.L_main,[bx,by]);
    for(let i=0;i<6;i++){ const yy=hs[1]-(40+i*42)*sc*1.05, x0=hs[0]+60+R()*30, L=(90+R()*170)*v; sl+=`<path d="M${f1(x0)},${f1(yy)} h${f1(L)}" stroke="${'#F3F8FF'}" stroke-width="${f1(3+R()*3)}" stroke-linecap="round" opacity="${f1(.55*v)}"/>`; } }
  $('speed').innerHTML=sl;
  // chalk dust from the skidding foot, and a ring on the landing
  let sk=''; for(let i=0;i<12;i++){ const t0=1.15+i*.045; if(t<t0) break; const a=t-t0; if(a>.7) continue; const R=rng(400+i);
    const x=xw-34*sc-a*(120+90*R()), y=CFG.ry-6-a*(60+80*R()), r=(10+60*a)*(0.7+.6*R()); sk+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#puff)" opacity="${f1(1-a/.7)}"/>`; }
  if(t>=BAR&&t<BAR+.5){ const a=(t-BAR)/.5; sk+=`<ellipse cx="${f1(xw)}" cy="${CFG.ry}" rx="${f1(40+260*a)}" ry="${f1(8+40*a)}" fill="none" stroke="#F2C66E" stroke-width="${f1(6*(1-a))}" opacity="${f1(1-a)}"/>`; }
  $('skid').innerHTML=sk;
  const tg=$('tgt'), tk=t>=BAR? 1+.5*kick(t,BAR,.4):1; tg.setAttribute('opacity',f1(.65+.35*cl((t-1.3)/.3)));
  // the monument draws itself, stroke by stroke, base → top; then construction marks, workers, dimensions
  for(const [el,a,d] of DR){ const k=cl((t-a)/d); el.setAttribute('visibility',k>0?'visible':'hidden'); el.setAttribute('stroke-dashoffset',(1-k).toFixed(3)); }
  for(const [el,a,d,o] of FADE){ el.setAttribute('opacity',f1(o*cl((t-a)/d))); }
  for(const [el,a,x,y] of POP){ const k=cl((t-a)/.3), s=k>0?.3+.7*EASE.back(k):0; el.setAttribute('opacity',f1(cl(k*3)));
    el.setAttribute('transform',`translate(${f1(x)},${f1(y)}) scale(${s.toFixed(3)}) translate(${f1(-x)},${f1(-y)})`); }
  for(const [el,c] of TOOLS){ el.setAttribute('transform',`rotate(${f1(8*Math.sin(t*.9+c[0]*.01))} ${c[0]} ${c[1]}) translate(0,${f1(10*Math.sin(t*1.3+c[1]*.02))})`); }
  counter(t,CFG.C,E);
};'''


def petra_monument(cx, by):
    """the Treasury as chalk line art (hist_c.treasury's proportions), in its cliff, carved from the top down:
    scaffold and a rope with a basket on the right, tiny Nabataean masons, the height dimensioned"""
    k = 2.3; by = by - 2 * k; T = lambda x, y: (cx + x * k, by + y * k); R = random.Random(571)
    out = timed(chalk(hc.treasury(cx, by, k, hc.PETRA_LIT, 2.6), swk=1.0, deco_op=.55), BAR, BAR + 3 * BEAT + .05, .3)
    cliff_l = hc.jag(T(-76, 2), T(-80, -96), 5, 5, R)[:-1] + hc.jag(T(-80, -96), T(-71, -170), 5, 5, R)
    cliff_t = hc.jag(T(-71, -170), T(-20, -176), 5, 4, R)[:-1] + hc.jag(T(-20, -176), T(73, -168), 7, 4, R)
    cliff_r = hc.jag(T(73, -168), T(80, -80), 5, 5, R)[:-1] + hc.jag(T(80, -80), T(77, 2), 5, 5, R)
    out += [cline(cliff_l, 2.6, a=BAR + .05, d=.7), cline(cliff_t, 2.6, a=BAR + .7, d=.5), cline(cliff_r, 2.6, a=BAR + .05, d=.7)]
    for i in range(7):   # bedding lines in the rock either side
        for sgn in (-1, 1):
            y = -20 - i * 22 + R.uniform(-5, 5); x0, x1 = (sgn * 60, sgn * 76) if sgn > 0 else (sgn * 76, sgn * 60)
            out.append(cline([T(x0, y), T((x0 + x1) / 2, y + R.uniform(-2, 2)), T(x1, y - 2)], 1.6, .45, a=BAR + .2 + i * .12, d=.2))
    # construction: a scaffold against the lower storey, a rope and basket from the cliff top
    a0 = BAR + 2.2 * BEAT
    for j, x in enumerate((18, 32, 46)):
        out.append(cline([T(x, 1), T(x, -62)], 2.2, .9, a=a0 + j * .06, d=.25))
    for j, y in enumerate((-20, -40, -60)):
        out.append(cline([T(14, y), T(50, y)], 2.2, .9, a=a0 + .15 + j * .06, d=.2))
        out.append(cline([T(18 if j % 2 else 46, y + 20), T(46 if j % 2 else 18, y)], 1.6, .7, a=a0 + .25 + j * .06, d=.2))
    out.append(cline([T(62, -170), T(62, -112)], 1.8, .85, a=a0 + .1, d=.3))
    out.append(cline([T(58, -112), T(66, -112), T(65, -104), T(59, -104), T(58, -112)], 2, .9, a=a0 + .35, d=.15))
    # tiny masons in robes and head wraps (silhouettes): two chiselling on the scaffold, one carrying a basket
    for i, (x, y, f, pose, tool) in enumerate(((30, -60, -1, 'pick', 'pick'), (-40, -90, 1, 'pick', 'pick'), (-64, 0, 1, 'carry', None))):
        fx, fy = T(x, y); el, _ = hc.figure(fx, fy, .34, f, robe='#fff', head='wrap', pose=pose, tool=tool, sw=1.2)
        out.append(silhouette(el, 3 * BEAT + BAR + i * BEAT / 2, fx, fy))
    out += dim_v(cx + 90 * k, by + 2 * k, by - 162 * k, '39 m', BAR + 3 * BEAT)
    return out

def petra_when():
    return when_page('petra_when', -100, '约', '年', 1715,
                     [('清', 1778), ('明', 1506), ('元', 1320), ('宋', 1120), ('唐', 762), ('晋', 340)], '前100', '西汉', petra_monument)

# ======================================================================================================
# petra_what
# ======================================================================================================
NPH = 12   # walk phases pre-drawn per stride

def walker(ox, oy, k, f=1, robe='#3E4A6A', wrap='#E9DDC8', skin='#8C5A3C', rim=None, staff=None, ph=0.0, sw=None):
    """hist_c.figure (head='wrap', pose='walk') with the legs, near arm and staff swinging by phase ph"""
    sw = sw or (2.5 if k > 1.6 else 2 if k > .8 else 1.5)
    s, c = math.sin(ph), math.cos(ph)
    T0 = hc.tf(ox, oy, k, f); T = T0; out = []; A = {}
    out.append(hc.ell(ox, oy, 18 * k, 3.5 * k, '#2A140C', 'opacity=".25"'))
    lw = max(2.5, 5 * k); dark = '#3A2A24'
    fa = (-11 - 7 * s, -1 - 3 * max(0, -c)); na = (14 + 7 * s, -1 - 3 * max(0, c))   # the two feet scissor
    out += hc.bar([T((-3, -14)), T(((-3 + fa[0]) / 2 - 1, -6 + fa[1] * .5)), T(fa)], dark, lw, sw * .8)
    body = [(-7, -77), (-2, -81), (5, -80), (9, -76), (11, -64), (9.5, -50), (12, -30), (15, -11), (2, -9), (-13, -11), (-12, -30), (-11, -50), (-11, -64)]
    out.append(hc.path(hc.curve(hc.TP(T, body)), robe, INK, sw))
    out.append(hc.line(hc.TP(T, [(-11, -51), (10, -51)]), '#00000055', max(2, 3 * k)))
    out += hc.bar([T((5, -12)), T(((5 + na[0]) / 2 + 1, -6 + na[1] * .5)), T(na)], dark, lw, sw * .8)
    hcn = T((3, -88 - .8 * abs(c))); out.append(hc.ell(hcn[0], hcn[1], 6.8 * k, 7.6 * k, skin, f'stroke="{INK}" stroke-width="{sw}"'))
    dy = -.8 * abs(c)
    out.append(hc.path(hc.curve(hc.TP(T, [(-7, -88 + dy), (-5, -97 + dy), (3, -101 + dy), (10, -97 + dy), (11, -90 + dy), (6, -92 + dy), (-1, -91 + dy)])), wrap, INK, sw))
    out.append(hc.path(hc.curve(hc.TP(T, [(-6, -92 + dy), (-10 - s, -80), (-11 - 1.5 * s, -68), (-7, -71), (-3, -86 + dy)])), wrap, INK, sw))
    out.append(hc.line(hc.TP(T, [(-6, -94 + dy), (10, -94 + dy)]), INK, max(2, 2.5 * k)))
    hand = (14 + 3 * s, -57); elbow = (6, -62)
    if staff:   # the staff swings with the step
        a, b = staff; out += hc.bar([T((a[0] + 3 * s, a[1])), T((b[0] + 6 * s, b[1]))], '#6E4426', max(2, 3 * k), sw * .7)
        hand = (a[0] + 3 * s, a[1] + 4)
    out += hc.bar([T((2, -75)), T(elbow), T(hand)], robe, max(3, 6 * k), sw * .8)
    hp = T(hand); out.append(f'<circle cx="{hp[0]:.1f}" cy="{hp[1]:.1f}" r="{max(2, 3 * k):.1f}" fill="{skin}" stroke="{INK}" stroke-width="{sw * .7}"/>')
    A['hand'] = hp
    if rim:
        out.append(hc.path(hc.curve(hc.TP(T, [(9, -96 + dy), (11, -90 + dy), (11, -84)]), False), 'none', rim, max(1.5, 2.5 * k), 'opacity=".9"'))
        out.append(hc.path(hc.curve(hc.TP(T, [(9, -75), (11, -64), (10, -52), (12, -32), (14, -14)]), False), 'none', rim, max(1.5, 2.5 * k), 'opacity=".75"'))
    return out, A

def phased(gid, fn):
    """NPH pre-drawn phases of a walking thing in one group; JS shows one. fn(ph) -> (elements, anchors)"""
    parts, anchors = [], []
    for i in range(NPH):
        ph = 2 * math.pi * i / NPH; el, A = fn(ph)
        parts.append(f'<g id="{gid}_{i}" style="display:{"inline" if i == 0 else "none"}">' + '\n'.join(el) + '</g>'); anchors.append(A)
    return f'<g id="{gid}">' + '\n'.join(parts) + '</g>', anchors

def petra_what():
    R = random.Random(5701)   # the drawing's own seed: the same rim, strata and joints as petra_caravan
    W, H, INK_ = hc.W, hc.H, INK
    defs = [hc.grad('sky', [(0, '#A7C3D9'), (1, '#E4ECEA')]),
            hc.grad('far', [(0, '#F3B28C'), (.55, '#E89A78'), (1, '#F4BC94')], 0, 40, 0, 800, True),
            hc.grad('lw', [(0, '#A55F4C'), (.45, '#874841'), (1, '#5C2F2D')], 0, 0, 0, 900, True),
            hc.grad('rw', [(0, '#B66B52'), (.5, '#914E43'), (1, '#663535')], 0, 0, 0, 910, True),
            hc.grad('floor', [(0, '#F6C796'), (.1, '#DDA47C'), (.42, '#A8735A'), (1, '#6E4034')], 0, 785, 0, 1080, True),
            hc.rgrad('pool', [(0, '#FFE6BE', .95), (.45, '#FFCB98', .45), (1, '#F6A876', 0)]),
            hc.rgrad('spill', [(0, '#FFD0A0', .5), (.6, '#F6A878', .14), (1, '#E08A60', 0)]),
            hc.rgrad('dust', [(0, '#F8D9B8', .85), (.6, '#EEC29E', .4), (1, '#E8B48E', 0)]),
            hc.rgrad('haze', [(0, '#FFE4C0', .55), (1, '#FFD8AC', 0)])]
    sky = [f'<rect x="-400" y="-500" width="{W + 800}" height="{H + 500}" fill="url(#sky)"/>']
    # ---- the far cliff with the Treasury (extended behind the walls so the dolly never opens a gap) ----
    rim = [(1000, 70)] + [(x, 62 + 16 * math.sin(x * .02) + R.uniform(-6, 6)) for x in range(1040, 1640, 40)] + [(1660, 50)]
    far = [hc.poly([(560, 120), (1000, 70)] + rim[1:-1] + [(1660, 50), (2150, 110), (2150, 800), (560, 800)], 'url(#far)', '#9A5A44', 2.5)]
    for i in range(16):
        y0 = 90 + i * 44 + R.uniform(-10, 10); L = [(x, y0 + 8 * math.sin(x * .012 + i) + (x - 1300) * .05) for x in range(1000, 1680, 40)]
        far.append(hc.line(L, '#C9785C', 2, 'opacity=".55"'))
    far += hc.treasury(1338, 777, 3.3, hc.PETRA_LIT, 2.5)
    far.append(hc.poly([(560, 777), (2150, 777), (2150, 805), (560, 805)], '#F7CFA2', '#B8805C', 2))
    # ---- the two walls of the Siq ----
    le = hc.jag((1185, -10), (1085, 150), 6, 9, R)[:-1] + hc.jag((1085, 150), (1052, 330), 5, 8, R)[:-1] + hc.jag((1052, 330), (1100, 560), 6, 9, R)[:-1] + hc.jag((1100, 560), (1148, 792), 6, 7, R)
    re_ = hc.jag((1460, -10), (1585, 170), 6, 9, R)[:-1] + hc.jag((1585, 170), (1592, 330), 4, 8, R)[:-1] + hc.jag((1592, 330), (1540, 560), 6, 9, R)[:-1] + hc.jag((1540, 560), (1502, 792), 6, 7, R)
    lwall = [(-400, -400), (1185, -400)] + le + [(700, 838), (-400, 923)]
    rwall = [(1460, -400)] + re_ + [(1720, 846), (2330, 1020), (2330, -400)]
    defs.append(f'<clipPath id="cl"><polygon points="{hc.pts(lwall)}"/></clipPath><clipPath id="cr"><polygon points="{hc.pts(rwall)}"/></clipPath>')
    sc = ['#B9705A', '#8A453F', '#C88464', '#6A3540', '#A35E4E', '#D9987A', '#7B3B3A']
    walls = [hc.poly(lwall, 'url(#lw)', INK, 3)]
    walls += hc.rock_strata('cl', -400, 1200, -300, 920, 38, sc, R, slope=.07, amp=16, sw=(10, 34)); walls.append('</g>')
    defs.append('<radialGradient id="hang" cx="560" cy="120" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3A1A18" stop-opacity=".5"/>'
                '<stop offset=".6" stop-color="#3A1A18" stop-opacity=".22"/><stop offset="1" stop-color="#3A1A18" stop-opacity="0"/></radialGradient>')
    walls.append(f'<g clip-path="url(#cl)"><rect x="-400" y="-400" width="1700" height="1300" fill="url(#hang)"/></g>')
    walls.append(hc.poly(rwall, 'url(#rw)', INK, 3))
    walls += hc.rock_strata('cr', 1420, 2330, -300, 1000, 28, sc, R, slope=-.12, amp=14, sw=(10, 30)); walls.append('</g>')
    for x0, top in ((-200, 0), (180, 40), (420, 70), (720, 120), (1760, 60), (2050, 40)):
        y = top; L = []
        while y < 880: L.append((x0 + R.uniform(-12, 12), y)); y += R.uniform(70, 130)
        walls.append(hc.line(L, '#3E1E1C', 2.5, 'opacity=".45"'))
    walls.append(f'<g clip-path="url(#cl)">' + hc.ell(1150, 560, 260, 420, 'url(#spill)') + '</g>')
    walls.append(f'<g clip-path="url(#cr)">' + hc.ell(1520, 520, 230, 420, 'url(#spill)') + '</g>')
    walls.append(hc.line(le, INK, 3)); walls.append(hc.line(re_, INK, 3))
    # ---- the floor ----
    floor = [(-400, 923), (700, 838), (1148, 792), (1502, 792), (1720, 846), (2330, 1020), (2330, H + 400), (-400, H + 400)]
    fl = [hc.poly(floor, 'url(#floor)', INK, 3), hc.ell(1320, 806, 440, 52, 'url(#pool)')]
    pav = []
    for row in range(10):
        y = 860 + row * row * 6 + row * 18
        if y > H + 300: break
        n = 6 + row * 2; w = (1920 + 900) / n
        for i in range(n):
            x = -450 + i * w + (row % 2) * w / 2 + R.uniform(-8, 8)
            pav.append(((x, y), (x + w * .8, y + R.uniform(-2, 2)))); pav.append(((x + w * .85, y + 2), (x + w * .85 - 6 - row * 3, y + 14 + row * 5)))
    fl.append(hc.marks(pav, '#5E352C', 2, 'opacity=".28"'))
    fl.append(hc.line([(-400, 936), (700, 849), (1140, 801)], '#4A2622', 5, 'opacity=".55"'))
    fl.append(hc.line([(-400, 943), (700, 855), (1140, 805)], '#D59C78', 2, 'opacity=".45"'))
    track_ = [(-200, 1080), (120, 1010), (430, 948), (760, 885), (1050, 830), (1260, 795), (1400, 782)]
    for (x, y), _ in hc.along(track_, 90):
        s_ = (y - 760) / 260; x += R.uniform(-60, 60) * s_; rx = R.uniform(9, 15) * s_ + 2; ry = rx * .32
        fl.append(hc.ell(x, y + R.uniform(-8, 14) * s_, rx, ry, '#5A3028', 'opacity=".35"'))
    # ---- the caravan: every walker pre-drawn in NPH phases ----
    rimc = '#FFD6A2'
    pal4 = dict(body='#7E5238', dark='#5E3C2A', knee='#6E4730', cloth='#7E2E28', stripe=GOLD, stripe2='#2E3A5C', sack='#B89A76', sack_d='#957A5C', jar='#8E4A30', bolt='#2E6A78')
    pal3 = dict(body='#946243', dark='#6E4632', knee='#83573A', cloth='#8E3430', stripe=GOLD, stripe2='#34446A', sack='#CDB08A', sack_d='#A88A66', jar='#A5583A', bolt='#2E6A78')
    AMP = 1.9   # leg swing (camel() step units)
    def camel_ph(ox, oy, k, load, pal=None, tags=()):
        def fn(ph):
            el, A = hc.camel(ox, oy, k, 1, load, rim=rimc, pal=pal, step=AMP * math.sin(ph))
            for args in tags: el += hc.tag(*args(A))
            return el, A
        return fn
    lead, LA = phased('w_lead', lambda ph: walker(1430, 780, .72, 1, robe='#2E3044', wrap='#E8DCC6', skin='#5A3828', rim=rimc, staff=((16, -64), (18, 0)), ph=ph))
    c4, A4 = phased('c4', camel_ph(1290, 780, .42, 'B', pal4))
    c3, A3 = phased('c3', camel_ph(1120, 813, .68, 'A', pal3))
    t2, _ = phased('w_t2', lambda ph: walker(1018, 842, 1.32, 1, robe='#8E4A2E', wrap='#F0E6D2', skin='#7A4E34', rim=rimc, staff=((16, -60), (19, 0)), ph=ph))
    c2, A2 = phased('c2', camel_ph(860, 858, 1.02, 'B', None, [lambda A: (A['sack'][0] + 4, A['sack'][1] + 2, '香料', 44, -3)]))
    c1, A1 = phased('c1', camel_ph(430, 936, 1.6, 'A', None, [lambda A: (A['sack'][0] + 4, A['sack'][1] + 8, '乳香', 54, -4),
                                                               lambda A: (A['bolt'][0] + 14, A['bolt'][1] - 64, '丝绸', 42, 3, (A['bolt'][0] + 6, A['bolt'][1] - 14))]))
    t1, _ = phased('w_t1', lambda ph: walker(764, 958, 2.15, 1, robe='#3E4A6A', wrap='#EADFC8', skin='#7E5036', rim=rimc, staff=((16, -62), (20, 0)), ph=ph))
    an = dict(lead=LA[0]['hand'], c4m=A4[0]['muzzle'], c4s=A4[0]['saddle_back'], c3m=A3[0]['muzzle'], c3s=A3[0]['saddle_back'],
              c2m=A2[0]['muzzle'], c2s=A2[0]['saddle_back'], c1m=A1[0]['muzzle'])
    # walkers: (group, base depth, phase offset (strides), forward speed (depth units / s))
    D = dict(sky=400, far=60, walls=13, floor=13, motes=34, lead=40, c4=38, c3=23.5, t2=17, c2=15.7, c1=10, t1=7.4, FIG=8.6, puffs=10)
    world = [G('L_sky', sky), G('L_far', far), G('L_walls', walls), G('L_floor', fl), G('L_motes', ['<g id="motes"></g>']),
             G('L_lead', [lead]), G('L_c4', [c4]), G('L_rope4', ['<path id="rope4" fill="none" stroke="#5A2C1E" stroke-width="2"/>']),
             G('L_c3', [c3]), G('L_rope3', ['<path id="rope3" fill="none" stroke="#5A2C1E" stroke-width="2"/>']),
             G('L_t2', [t2]), G('L_c2', [c2]), G('L_rope2', ['<path id="rope2" fill="none" stroke="#5A2C1E" stroke-width="2.5"/>']),
             G('L_puffs', ['<g id="puffs"></g>']), G('L_c1', [c1]), G('L_rope1', ['<path id="rope1" fill="none" stroke="#5A2C1E" stroke-width="3"/>']),
             G('L_FIG', ['<g id="FIG"></g>']), G('L_t1', [t1])]
    fill = ('<linearGradient id="yfill" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6EC"/><stop offset=".55" stop-color="#F8E4D6"/>'
            '<stop offset="1" stop-color="#C99A8E"/></linearGradient>')
    # 你 walks beside the last camel (steps on the beats), looks up at the cargo, points ahead to the Treasury on bar 3
    fig = keys((0, dict(REST, stride=10, tilt=-4)),
               (1.4, dict(tilt=-12)),
               (2.9, dict(tilt=-8)),
               (3.344, dict(ra1=-36, ra2=-30, tilt=-10, lean=5), 'out'),
               (4.2, dict(ra1=-40, ra2=-34, lean=4)),
               (5.016, dict(ra1=-38, ra2=-32, lean=4)))
    cfg = dict(S0=1.045, P0=[1330, 790], V=[1330 - 370 * .045, 790 - 250 * .045], dref=13, D=D, an=an, nph=NPH,
               cam=keys((0, dict(Z=0, zoom=1, TX=0, TY=0, roll=.6)),
                        (5.016, dict(Z=3.2, zoom=1.1, TX=-40, TY=26, roll=-1.2), 'lin')),
               fwd={'lead': .72, 'c4': .7, 'c3': .68, 't2': .66, 'c2': .66, 'c1': .645, 't1': .64, 'FIG': .638, 'puffs': .645},
               off={'lead': .75, 'c4': .25, 'c3': .75, 't2': .25, 'c2': .75, 'c1': .25, 't1': .75, 'FIG': 0},
               fig=fig, figpath=[[232, 951], [292, 947]], sc=.66)
    js = 'const CFG=' + json.dumps(cfg) + ';\n' + r'''
const LAY=['sky','far','walls','floor','motes','lead','c4','rope4','c3','rope3','t2','c2','rope2','puffs','c1','rope1','FIG','t1'];
const DEP={rope4:'c4',rope3:'c3',rope2:'c2',rope1:'c1'};   // a rope rides with the camel it hangs from
const STRIDE=2*BEAT;                                       // one stride = two steps, a step on every beat
let shown={};
window.render=function(t){
  const cam=track(CFG.cam,t), M={};
  for(const k of LAY){ const base=DEP[k]||k, d=CFG.D[base]+(CFG.fwd[base]||0)*t; M[k]=setLayer('L_'+k,cam,d,CFG.D[base]); }
  // leg cycles: phase 0 is a footfall; footfalls on the beats
  for(const g of ['lead','c4','c3','t2','c2','c1','t1']){
    const gid={lead:'w_lead',t2:'w_t2',t1:'w_t1'}[g]||g;
    const ph=((t/STRIDE+CFG.off[g])%1+1)%1, i=Math.round(ph*CFG.nph)%CFG.nph;
    if(shown[gid]!==i){ if(shown[gid]!==undefined) $(gid+'_'+shown[gid]).style.display='none'; else $(gid+'_0').style.display='none';
      $(gid+'_'+i).style.display='inline'; shown[gid]=i; }
  }
  // ropes: muzzle → the saddle of the camel ahead (or the leader's hand), swinging
  const A=CFG.an, inv=(Mf,p)=>{const det=Mf[0]*Mf[3]-Mf[1]*Mf[2],x=p[0]-Mf[4],y=p[1]-Mf[5];return [(Mf[3]*x-Mf[2]*y)/det,(-Mf[1]*x+Mf[0]*y)/det];};
  for(const [rid,from,fl,to,tl,sag] of [['rope4','c4m','c4','lead','lead',6],['rope3','c3m','c3','c4s','c4',8],['rope2','c2m','c2','c3s','c3',14],['rope1','c1m','c1','c2s','c2',22]]){
    const a=A[from], b=inv(M[fl],apply(M[tl],A[to])), m=[(a[0]+b[0])/2,(a[1]+b[1])/2], sw=sag*(1+.35*Math.sin(t*2*Math.PI/STRIDE*1+rid.length));
    $(rid).setAttribute('d',`M${f1(a[0])},${f1(a[1])} Q${f1(m[0]+sag*.3*Math.sin(t*4.1))},${f1(m[1]+sw)} ${f1(b[0])},${f1(b[1])}`);
  }
  // dust: a puff behind each footfall of the last camel and of 你 (on the beats), drifting back
  let pf='';
  for(let n=0;n<14;n++){ const tb=n*BEAT; if(tb>t) break; const age=t-tb; if(age>.9) continue;
    const u=age/.9, R=rng(70+n)();
    for(const [fx,fy,s] of [[n%2?560:330,936,1],[lerp(CFG.figpath[0][0],CFG.figpath[1][0],tb/DUR)+(n%2?14:-14),CFG.figpath[0][1]-4,.6]]){
      const x=fx-60*u-20*R, y=fy-8-26*u, r=(14+40*u)*s; pf+=`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r*1.5)}" ry="${f1(r*.7)}" fill="url(#dust)" opacity="${f1((1-u)*.9)}"/>`; }
  }
  $('puffs').innerHTML=pf;
  // floating motes in the light from the opening
  let mo=''; const RM=rng(5);
  for(let i=0;i<34;i++){ const x0=900+RM()*900, y0=200+RM()*620, sp=10+RM()*24, r=1.5+RM()*3.5;
    const x=x0-((t*sp+i*37)%300), y=y0+Math.sin(t*1.3+i)*12; mo+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#FFF0D8" opacity="${f1(.35+.4*Math.sin(t*2+i)**2)}"/>`; }
  $('motes').innerHTML=mo;
  // 你: walks beside the camel's flank (catching up a little), a step on each beat
  const S=track(CFG.fig,t), u=t/DUR, fp=CFG.figpath, bx=lerp(fp[0][0],fp[1][0],u), by=lerp(fp[0][1],fp[1][1],u);
  S.walk=Math.PI/2+Math.PI*t/BEAT;
  const bob=Math.abs(Math.cos(S.walk));
  S.lift=(S.lift||0)+6*bob; S.squat+=.12*(1-bob);
  { const sw=Math.sin(S.walk), w=ease((t-2.95)/.39); S.ra1=lerp(58-18*sw,S.ra1,w); S.ra2=lerp(84-22*sw,S.ra2,w); }
  S.la1=122+18*Math.sin(S.walk); S.la2=96+20*Math.sin(S.walk);
  S.tilt+=3*Math.sin(S.walk);
  const Y=you(S,bx,by,CFG.sc,'url(#yfill)');
  $('FIG').innerHTML=Y.svg;
  const top=apply(M.FIG,Y.top); bubble(t,[top[0],top[1]-12],.04,inFrame(top));
  filmFX(t,0); $('vig').setAttribute('opacity','.18');
};'''
    world_svg = '\n'.join(world)
    return page('petra_what', round(3 * BAR, 3), world_svg, js, ''.join(defs), fill)

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    only = sys.argv[2:] or ['petra_when', 'petra_what']
    for name in only:
        html = {'petra_when': petra_when, 'petra_what': petra_what}[name]()
        open(os.path.join(out, name + '.html'), 'w').write(html); print('ok', name, len(html) // 1024, 'KB')
