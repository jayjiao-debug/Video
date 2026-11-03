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
function figure(J,u,o){   // o: {fill, tilt, ex, ey (eye look, in head radii), close (0..1 eyes to happy arcs), mouth (0 smile .. 1 open O)}
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
  const [hx,hy]=J.head, hr=u*.28;
  g.push(`<g transform="rotate(${f1(o.tilt||0)} ${f1(hx)} ${f1(hy)})"><ellipse cx="${f1(hx)}" cy="${f1(hy)}" rx="${f1(hr)}" ry="${f1(hr*1.08)}" fill="${fill}"/>`);
  const ex=hr*.34, ey=hr*.05, lx=(o.ex||0)*hr, ly=(o.ey||0)*hr, cz=o.close||0, mo=o.mouth||0;
  if(cz<.5){ const sy=1-cz*1.4;
    g.push(`<ellipse cx="${f1(hx-ex+lx)}" cy="${f1(hy+ey+ly)}" rx="${f1(hr*.075)}" ry="${f1(hr*.1*sy)}" fill="#2B2724"/><ellipse cx="${f1(hx+ex+lx)}" cy="${f1(hy+ey+ly)}" rx="${f1(hr*.075)}" ry="${f1(hr*.1*sy)}" fill="#2B2724"/>`);
  } else { for(const s of [-1,1]){const cx=hx+s*ex+lx, cy=hy+ey+ly;
    g.push(`<path d="M${f1(cx-hr*.1)},${f1(cy+hr*.03)} Q${f1(cx)},${f1(cy-hr*.11)} ${f1(cx+hr*.1)},${f1(cy+hr*.03)}" fill="none" stroke="#2B2724" stroke-width="${f1(hr*.05)}" stroke-linecap="round"/>`);}}
  const mx=hx+lx*.6, my=hy+ly*.5;
  if(mo<.5) g.push(`<path d="M${f1(mx-hr*.16)},${f1(my+hr*.3)} Q${f1(mx)},${f1(my+hr*(.45+.1*mo))} ${f1(mx+hr*.16)},${f1(my+hr*.3)}" fill="none" stroke="#2B2724" stroke-width="${f1(hr*.055)}" stroke-linecap="round"/>`);
  else g.push(`<ellipse cx="${f1(mx)}" cy="${f1(my+hr*.36)}" rx="${f1(hr*(.06+.06*mo))}" ry="${f1(hr*(.06+.08*mo))}" fill="#2B2724"/>`);
  g.push(`<circle cx="${f1(hx-hr*.56+lx*.4)}" cy="${f1(hy+hr*.3)}" r="${f1(hr*.14)}" fill="#F4A9A0" opacity=".45"/><circle cx="${f1(hx+hr*.56+lx*.4)}" cy="${f1(hy+hr*.3)}" r="${f1(hr*.14)}" fill="#F4A9A0" opacity=".45"/>`);
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
  const svg=sh+figure(J,u,{fill:fill,tilt:S.tilt||0,ex:S.ex,ey:S.ey,close:S.close,mouth:S.mouth});
  const hr=u*.28, th=(S.tilt||0)*Math.PI/180;
  return {svg:svg, head:J.head, top:[J.head[0]+Math.sin(th)*hr*1.08, J.head[1]-Math.cos(th)*hr*1.08], J:J, u:u};
}

// ---------- 2.5D camera: every layer has a depth d; cam = {Z (dolly), zoom, TX, TY (truck/crane, px at depth dref), roll (deg)} ----------
function layerK(cam,d){ // unrotated: screen = (ex,ey) + src*k
  const den=Math.max(.05,d-cam.Z), k=CFG.S0*cam.zoom*d/den, sh=CFG.dref/den*cam.zoom;
  return {k:k, ex:CFG.V[0]-CFG.P0[0]*k-cam.TX*sh+(cam.sx||0), ey:CFG.V[1]-CFG.P0[1]*k-cam.TY*sh+(cam.sy||0)};
}
function rotM(L,roll){const r=roll*Math.PI/180,c=Math.cos(r),s=Math.sin(r),k=L.k,ex=L.ex-960,ey=L.ey-540;
  return [k*c,k*s,-k*s,k*c,c*ex-s*ey+960,s*ex+c*ey+540];}
const mstr=M=>`matrix(${M.map(v=>v.toFixed(5)).join(' ')})`;
const apply=(M,p)=>[M[0]*p[0]+M[2]*p[1]+M[4], M[1]*p[0]+M[3]*p[1]+M[5]];
function setLayer(id,cam,d){const L=layerK(cam,d),M=rotM(L,cam.roll||0);const e=$(id);if(e)e.setAttribute('transform',mstr(M));return M;}

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
// year counter: rolls 2026 → C.target from t0 (ease-out), lands exactly on BAR with a punch; label pops at the landing
function counter(t,C){
  const t0=.15, t1=BAR, u=cl((t-t0)/(t1-t0)), f=out3(u), v=Math.round(2026+(C.target-2026)*f);
  const g=$('ctr'); g.setAttribute('opacity',f1(cl((t-.04)/.14)));
  const yr=$('yr'), pre=$('pre'), l1=$('lab1'), l2=$('lab2');
  yr.textContent=String(Math.abs(v)); yr.setAttribute('x',C.xr); yr.setAttribute('y',C.y);
  const rate=t<t1&&t>t0? Math.abs((C.target-2026)*3*(1-u)**2/(t1-t0)):0;   // years per second
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

REST = dict(ra1=58, ra2=84, la1=122, la2=96, tilt=0, squat=0, lift=0, tuck=0, lean=0, walk=0, stride=0, ex=0, ey=0, close=0, mouth=0)

def G(gid, items, extra=''):
    return f'<g id="{gid}"{(" " + extra) if extra else ""}>' + '\n'.join(items) + '</g>'

# ======================================================================================================
# petra_when
# ======================================================================================================
def petra_when():
    ns, mk = run_sections(f'{TOOLS}/petra_vector.py', stop='for cx, b, w, h, shape in sorted(items')
    g = ns['g']; defs_el = g[1]; defs = defs_el[len('<defs>'):-len('</defs>')]
    a_sky = 2; b_stars = sec(mk, 'sky: stars')[1]
    a_walls, b_low = sec(mk, 'canyon walls')[0], sec(mk, 'lower storey')[1]
    a_gr, b_gr = sec(mk, 'ground:')
    i_sand = next(i for i in range(a_gr, b_gr) if 'url(#sand)' in g[i])
    W_, H_ = ns['W'], ns['H']; R = random.Random(571)
    # extensions so the frame can roll and truck past the photo's edges (same gradients, the walls continue)
    ext_back = [f'<polygon points="-420,520 0,565 0,1800 -420,1800" fill="url(#rock)"/>',
                f'<polygon points="-420,1050 0,1050 0,1800 -420,1800" fill="url(#warmL)"/>',
                f'<polygon points="{W_},0 {W_ + 420},0 {W_ + 420},1790 {W_},1765" fill="url(#rwall)"/>']
    for x0 in (-330, -170):
        y = 700 + R.uniform(0, 100); L = []
        while y < 1790: L.append((x0 + R.uniform(-10, 10), y)); y += R.uniform(80, 150)
        ext_back.append(ns['line'](L, '#0C0504', 3, 'opacity=".5"'))
    sand_ext = [f'<polygon points="-420,1792 0,1792 0,{H_} -420,{H_}" fill="url(#sand)"/>',
                f'<polygon points="{W_},1765 {W_ + 420},1785 {W_ + 420},{H_} {W_},{H_}" fill="url(#sand)"/>',
                # the sand continues under the platform so a little parallax never opens a seam
                f'<polygon points="205,1795 262,1750 505,1716 1400,1676 1460,1698 1460,1745 200,1805" fill="url(#sand)"/>']
    plat_items = g[a_gr:i_sand]; sand_items = g[i_sand:b_gr]
    # lanterns, exactly as the scene draws them (same order and random draws), split into depth bands by their base y
    FEET = (785, 1992)
    bands = {k: ([], []) for k in 'ABCDE'}   # (glows, bodies)
    def band_of(b): return 'A' if b < 1800 else 'B' if b < 1900 else 'C' if b < FEET[1] else 'D' if b < 2120 else 'E'
    items = sorted(ns['items'], key=lambda t: t[1])
    extra = []   # a few more lanterns in the side extensions (same recipe)
    for _ in range(26):
        side = R.random() < .5; x = R.uniform(-380, -30) if side else R.uniform(W_ + 30, W_ + 380); b = R.uniform(1800, 2450)
        sc = (b - 1700) / 800; extra.append((x, b, 20 + 70 * sc, 30 + 120 * sc, None))
    for cx, b, w, h, shape in sorted(items + extra, key=lambda t: t[1]):
        el = ns['bag'](cx, b, w, h, shape); band = bands[band_of(b)]
        band[0].extend(el[:2] if h > 24 else el[:1]); band[1].extend(el[2:] if h > 24 else el[1:])
    D = dict(sky=60, cliff=20, sand=15, plat=20, A=18, B=14, cara=14, C=11, FIG=10, D=8, E=5.5)
    world = [G('L_sky', g[a_sky:b_stars]), G('L_cliff', ext_back + g[a_walls:b_low]), G('L_sand', sand_ext + sand_items),
             G('L_plat', plat_items)]
    rimc = '#FFD6A2'
    cam_, _ = phased('cc', lambda ph: hc.camel(40, 1858, .95, 1, 'A', rim=rimc, step=1.9 * math.sin(ph)))
    man_, _ = phased('cm', lambda ph: walker(300, 1866, 1.05, 1, robe='#3E4A6A', wrap='#EADFC8', skin='#7E5036', rim=rimc, staff=((16, -62), (20, 0)), ph=ph))
    for k in 'ABCDE':
        world.append(G(f'L_{k}', [G(f'gl_{k}', bands[k][0]), G(f'bd_{k}', bands[k][1])]))
        if k == 'B': world.append(G('L_cara', [G('cara', [cam_, hc.rope((230, 1702), (318, 1800), 16, w=2.5), man_], 'opacity="0"')]))
        if k == 'C': world.append(G('L_FIG', ['<g id="FIG"></g>']))
    fill = ('<linearGradient id="yfill" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFE2BC"/><stop offset=".5" stop-color="#F3C9A2"/>'
            '<stop offset="1" stop-color="#C98D6C"/></linearGradient>')
    # 你: present → flinch (hands to head) → looks left, right → wind-up → points at the year on the landing, beat bobs
    P = REST
    fig = keys((0, dict(P, tilt=-8, ey=-.25, ex=.1, ra1=62, ra2=88, la1=118, la2=92)),
               (.15, dict(tilt=-6)),
               (.42, dict(ra1=-30, ra2=-145, la1=210, la2=325, squat=.45, tilt=4, mouth=1, ey=-.05, ex=0, lean=0), 'out'),
               (.80, dict(tilt=14, ex=-.32, ey=0, squat=.3, lean=-5, mouth=.8)),
               (1.20, dict(tilt=-12, ex=.32, lean=5, squat=.25, mouth=.9)),
               (1.46, dict(ra1=60, ra2=95, la1=120, la2=85, squat=.55, tilt=-4, ex=.2, lean=2, mouth=.2), 'io'),
               (1.672, dict(ra1=-22, ra2=-12, la1=112, la2=52, squat=0, lift=34, tuck=.25, tilt=-10, ex=.34, ey=-.1, lean=6, mouth=1), 'out'),
               (1.95, dict(lift=0, tuck=0, mouth=.7), 'in'),
               (2.4, dict(ra1=-26, ra2=-16, tilt=-14, lean=4, mouth=.6)),
               (3.344, dict(ra1=-20, ra2=-10, tilt=-6, lean=3, ex=.15, mouth=.4)))
    cfg = dict(S0=1.16, P0=list(FEET), V=[700, 935], dref=20, D=D, feet=FEET, sc=.98, nph=NPH,
               cam=keys((0, dict(Z=0, zoom=1, TX=0, TY=0, roll=0)),
                        (.15, dict(Z=0.04, zoom=1.0, TX=0, TY=0, roll=0)),
                        (BAR, dict(Z=.85, zoom=1.02, TX=-14, TY=6, roll=-1.0), 'io3'),
                        (2 * BAR + .05, dict(Z=1.1, zoom=1.03, TX=-40, TY=8, roll=-.3), 'out')),
               fig=fig, C=dict(target=-100, xr=1718, y=596, lab1='约', lab2='年'))
    js = 'const CFG=' + json.dumps(cfg) + ';\n' + r'''
const LAY=['sky','cliff','sand','plat','A','B','cara','C','FIG','D','E'];
let shown={};
window.render=function(t){
  const cam=track(CFG.cam,t);
  // the landing: a short camera punch
  const pk=kick(t,BAR,.32); cam.zoom*=1+.022*pk; cam.sy=(t>=BAR&&t<BAR+.2)?Math.sin((t-BAR)*90)*5*(1-(t-BAR)/.2):0;
  const M={}; for(const k of LAY) M[k]=setLayer('L_'+k,cam,CFG.D[k]);
  // candle flicker on the lantern glows (seeded per band)
  for(const k of 'ABCDE'){const f=Math.floor(t*15), r=rng(311+f*13+k.charCodeAt(0))(); $('gl_'+k).setAttribute('opacity',f1(.82+.18*r));}
  // after the landing the lanterns of today go, near to far, one band per beat; the old city's caravan walks in
  for(const [ks,tb] of [['DE',2.09],['C',2.508],['AB',2.926]]) for(const k of ks){
    const u=cl((t-tb)/.2); $('L_'+k).setAttribute('opacity',f1(1-u)); }
  const cu=t-BAR; $('cara').setAttribute('opacity',f1(cl(cu/.3)));
  $('cara').setAttribute('transform',`translate(${f1(Math.max(0,cu)*112)},0)`);
  for(const gid of ['cc','cm']){ const ph=((t/(2*BEAT)+(gid=='cc'?.25:.75))%1+1)%1, i=Math.round(ph*CFG.nph)%CFG.nph;
    if(shown[gid]!==i){ $(gid+'_'+(shown[gid]===undefined?0:shown[gid])).style.display='none'; $(gid+'_'+i).style.display='inline'; shown[gid]=i; } }
  // 你
  const S=track(CFG.fig,t), br=Math.sin(t*2*Math.PI/1.4);
  S.squat+=.04*br; S.tilt+=1.5*br;
  for(const b of [2.09,2.508,2.926]){ S.squat+=.22*dip(t,b,.3); S.ra1-=6*dip(t,b,.3); }
  S.lift+=10*hop(t,.418,.22);
  if(t<.15) S.la2+=0;
  const Y=you(S,CFG.feet[0],CFG.feet[1],CFG.sc,'url(#yfill)');
  $('FIG').innerHTML=Y.svg;
  const top=apply(M.FIG,Y.top); bubble(t,[top[0],top[1]-14],.04,inFrame(top));
  // time rewind: colour drains, grain, scratches, flicker
  const a=ease((t-.15)/.75), fl=filmFX(t,a);
  $('world').style.filter=`sepia(${(.9*a).toFixed(3)}) saturate(${(1-.25*a).toFixed(3)}) contrast(${(1+.1*a).toFixed(3)}) brightness(${(fl*(1-.1*a)).toFixed(3)})`;
  counter(t,CFG.C);
};'''
    return page('petra_when', round(2 * BAR, 3), '\n'.join(world), js, defs, fill, extra_hud=counter_svg())

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
    fig = keys((0, dict(REST, stride=10, tilt=-4, ex=.25, ey=-.1)),
               (1.4, dict(tilt=-12, ex=.15, ey=-.35, mouth=.3)),
               (2.9, dict(tilt=-8, ex=.3, ey=-.2, mouth=.2)),
               (3.344, dict(ra1=-22, ra2=-16, tilt=-10, ex=.35, ey=-.15, mouth=1, lean=5), 'out'),
               (4.2, dict(ra1=-26, ra2=-20, mouth=.7, lean=4)),
               (5.016, dict(ra1=-24, ra2=-18, mouth=.5, lean=4)))
    cfg = dict(S0=1.045, P0=[1330, 790], V=[1330 - 370 * .045, 790 - 250 * .045], dref=13, D=D, an=an, nph=NPH,
               cam=keys((0, dict(Z=0, zoom=1, TX=0, TY=0, roll=.5)),
                        (5.016, dict(Z=2.6, zoom=1.07, TX=-40, TY=-22, roll=-.6), 'lin')),
               fwd={'lead': .62, 'c4': .6, 'c3': .58, 't2': .55, 'c2': .56, 'c1': .53, 't1': .51, 'FIG': .505, 'puffs': .53},
               off={'lead': .75, 'c4': .25, 'c3': .75, 't2': .25, 'c2': .75, 'c1': .25, 't1': .75, 'FIG': 0},
               fig=fig, figpath=[[262, 951], [400, 942]], sc=.66)
    js = 'const CFG=' + json.dumps(cfg) + ';\n' + r'''
const LAY=['sky','far','walls','floor','motes','lead','c4','rope4','c3','rope3','t2','c2','rope2','puffs','c1','rope1','FIG','t1'];
const DEP={rope4:'c4',rope3:'c3',rope2:'c2',rope1:'c1'};   // a rope rides with the camel it hangs from
const STRIDE=2*BEAT;                                       // one stride = two steps, a step on every beat
let shown={};
window.render=function(t){
  const cam=track(CFG.cam,t), M={};
  for(const k of LAY){ const base=DEP[k]||k, d=CFG.D[base]+(CFG.fwd[base]||0)*t; M[k]=setLayer('L_'+k,cam,d); }
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
