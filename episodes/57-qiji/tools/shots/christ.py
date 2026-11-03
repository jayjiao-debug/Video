#!/usr/bin/env python3
"""ep57 explanation shots for the 基督像 stop (and the shared kit colosseum.py imports).
  christ_when  3.344 s  「穿越时间轴」 blueprint: the camera trucks along a ruler from 2026 back to 1931 while 你 runs
                        backwards in time, skids to a stop on the downbeat, the year lands (1931 年建成), then the statue
                        draws itself in chalk with scaffolding, a derrick and 1920s workers.
  christ_what  5.016 s  christ_1922 (hist_b.py) split into 9 depth layers: coins drop into the donation box one per beat,
                        你 tosses its coin in, a stream of coins arcs up to the summit, the statue glows, 你 opens its arms.
usage: christ.py OUTDIR   ->  OUTDIR/christ_when.html, OUTDIR/christ_what.html
Each page: window.DUR, window.render(t) (deterministic), DOM built once, content inside #f (1920x1080)."""
import sys, os, math, random, json
HERE = os.path.dirname(os.path.abspath(__file__)); TOOLS = os.path.dirname(HERE)
if TOOLS not in sys.path: sys.path.insert(0, TOOLS)

INK, GOLD = '#2A211B', '#F2C66E'
BEAT, BAR = .418, 1.672
FONT_LINK = '<link rel="stylesheet" href="file:///home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai/wenkai-bold.css">'


# ============================================================================================ shared page kit
def page(title, dur, body, js, css=''):
    return f'''<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>{FONT_LINK}
<style>html,body{{margin:0;background:#000}} .L{{position:absolute;left:0;top:0;transform-origin:0 0}} .L>svg{{display:block;overflow:visible;position:absolute;left:0;top:0}} {css}</style>
</head><body><div id="f" style="position:relative;width:1920px;height:1080px;overflow:hidden">{body}</div>
<script>{JSLIB}
{js}</script></body></html>'''


def layer(id_, content, w=1920, h=1080, extra=''):
    return f'<div class="L" id="{id_}" {extra}><svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">{content}</svg></div>'


def fig_defs(light='tl', shadow=(6, 12, .3), sh_col='#1A1410'):
    """gradients for 你 lit from the given side + its soft drop shadow (id yds)"""
    v = {'tl': (0, 0, 1, 1), 'tr': (1, 0, 0, 1)}[light]
    return (f'<linearGradient id="yb" x1="{v[0]}" y1="{v[1]}" x2="{v[2]}" y2="{v[3]}"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FCFBF8"/>'
            f'<stop offset="1" stop-color="#E4E6EC"/></linearGradient>'
            f'<filter id="yds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="{shadow[0]}" dy="{shadow[1]}" stdDeviation="10" flood-color="{sh_col}" flood-opacity="{shadow[2]}"/></filter>'
            f'<filter id="bds" x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".28"/></filter>')


JSLIB = r'''
const W=1920,H=1080,CX=960,CY=540,BEAT=.418,BAR=1.672,INK='#2A211B',GOLD='#F2C66E',RAD=Math.PI/180;
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), lerp=(a,b,u)=>a+(b-a)*u, span=(t,a,b)=>cl((t-a)/(b-a));
const sm=x=>{x=cl(x);return x*x*(3-2*x);}, eio=x=>{x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
const eout=(x,p=3)=>1-Math.pow(1-cl(x),p), ein=(x,p=3)=>Math.pow(cl(x),p);
const oback=(x,s=1.9)=>{x=cl(x);const c=s+1;return 1+c*Math.pow(x-1,3)+s*Math.pow(x-1,2);};
const f1=x=>(+x).toFixed(1), f2=x=>(+x).toFixed(2), $=id=>document.getElementById(id);
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const hop=(t,t0,b=BEAT)=>{if(t<t0)return 0;const p=((t-t0)/b)%1;return 4*p*(1-p);};          // 0 on each beat, 1 between
const kick=(t,t0,d=.25)=>t<t0?0:Math.exp(-3*(t-t0)/d);                                      // 1 at a hit, decays
function mix(a,b,u){if(typeof a==='number'&&typeof b==='number')return a+(b-a)*u;
  if(Array.isArray(a)&&Array.isArray(b))return a.map((v,i)=>mix(v,b[i],u));
  if(a&&b&&typeof a==='object'&&typeof b==='object'){const o={};for(const k in a)o[k]=(k in b)?mix(a[k],b[k],u):a[k];for(const k in b)if(!(k in o))o[k]=b[k];return o;}
  return u<.5?a:b;}
function keys(t,K,e=eio){if(t<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++){if(t<=K[i][0]){const u=(t-K[i-1][0])/(K[i][0]-K[i-1][0]);return mix(K[i-1][1],K[i][1],(K[i][2]||e)(u));}}return K[K.length-1][1];}

// ---------------- 2.5D camera: layer at depth z (1 = reference plane); content -> base screen by (k, ox, oy)
// cam = {dx, dy (camera offset in reference-plane px), zc (dolly toward the plane, fraction), F (zoom), roll (deg)}
function lmat(c,L){const den=L.z-(c.zc||0), s=(c.F||1)*L.z/den, a=s*(L.k||1);
  const ex=s*((L.ox||0)-CX)-(c.F||1)*(c.dx||0)/den, ey=s*((L.oy||0)-CY)-(c.F||1)*(c.dy||0)/den;
  const r=(c.roll||0)*RAD, co=Math.cos(r), si=Math.sin(r);
  return [a*co,a*si,-a*si,a*co,CX+co*ex-si*ey,CY+si*ex+co*ey];}
const app=(m,p)=>[m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];
const css=m=>'matrix('+m.map(v=>v.toFixed(5)).join(',')+')';

// ---------------- 你: the rig of you_figure.py / opt_comp.py, ported (same shapes, same face)
const STAND={head:[0,-298],neck:[0,-262],l_shoulder:[-55,-250],r_shoulder:[55,-250],l_elbow:[-72,-185],r_elbow:[72,-185],l_wrist:[-78,-125],r_wrist:[78,-125],
  l_hip:[-22,-120],r_hip:[22,-120],l_knee:[-25,-60],r_knee:[25,-60],l_ankle:[-26,0],r_ankle:[26,0]};
const L1=64,L2=60;
// p: {x,y (feet, layer coords), s, ra/la [upper,fore] screen deg (0 right, 90 down), crouch, lean, lift, tuck, breath, kl/kr/al/ar leg overrides, tilt}
function rig(p){const P={};for(const k in STAND)P[k]=STAND[k].slice();
  const c=p.crouch||0, ln=p.lean||0, br=p.breath||0, tk=p.tuck||0;
  for(const k of ['head','neck','l_shoulder','r_shoulder']){P[k][1]+=c-br;P[k][0]+=ln;}
  P.head[0]+=(p.hdx||0);P.head[1]+=(p.hdy||0);
  for(const k of ['l_hip','r_hip']){P[k][1]+=c;P[k][0]+=ln*.35;}
  P.l_knee=[mix(-25-c*.8,-48,tk)+ln*.2,mix(-60+c*.5,-66,tk)];P.r_knee=[mix(25+c*.8,48,tk)+ln*.2,mix(-60+c*.5,-66,tk)];
  P.l_ankle=[mix(-26,-84,tk),mix(0,-34,tk)];P.r_ankle=[mix(26,84,tk),mix(0,-34,tk)];
  for(const k of ['kl','kr','al','ar'])if(p[k]){const n={kl:'l_knee',kr:'r_knee',al:'l_ankle',ar:'r_ankle'}[k];P[n]=p[k].slice();}
  const nk=P.neck, hc=[(P.l_hip[0]+P.r_hip[0])/2,(P.l_hip[1]+P.r_hip[1])/2], ry=nk[1]+Math.hypot(nk[0]-hc[0],nk[1]-hc[1])*.14;
  for(const [sd,ang,sx] of [['r',p.ra,1],['l',p.la,-1]]){if(!ang)continue;const x0=nk[0]+sx*36;
    const e=[x0+L1*Math.cos(ang[0]*RAD),ry+L1*Math.sin(ang[0]*RAD)];P[sd+'_elbow']=e;P[sd+'_wrist']=[e[0]+L2*Math.cos(ang[1]*RAD),e[1]+L2*Math.sin(ang[1]*RAD)];}
  const J={},s=p.s,lift=p.lift||0;for(const k in P)J[k]=[p.x+P[k][0]*s,p.y-lift+P[k][1]*s];return J;}
function _bez(a,c,b,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]]);}return o;}
function limb(a,e,b,w0,w1,fill){const c=[2*e[0]-(a[0]+b[0])/2,2*e[1]-(a[1]+b[1])/2],p=_bez(a,c,b,24),L=[],R=[];
  for(let i=0;i<p.length;i++){const j=Math.min(i+1,p.length-1),k=Math.max(i-1,0),dx=p[j][0]-p[k][0],dy=p[j][1]-p[k][1],d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d,w=(w0+(w1-w0)*i/(p.length-1))/2;
    L.push([p[i][0]+nx*w,p[i][1]+ny*w]);R.push([p[i][0]-nx*w,p[i][1]-ny*w]);}
  const q=L.concat(R.reverse());
  return `<path d="M${q.map(v=>f1(v[0])+','+f1(v[1])).join(' L')}Z" fill="${fill}"/><circle cx="${f1(a[0])}" cy="${f1(a[1])}" r="${f1(w0/2)}" fill="${fill}"/>`;}
function figure(J,u,o){o=o||{};const fill=o.fill||'url(#yb)',tilt=o.tilt===undefined?6:o.tilt;
  const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],nk=J.neck,hc=mid(J.l_hip,J.r_hip),tl=Math.hypot(nk[0]-hc[0],nk[1]-hc[1]);
  const side=J.r_shoulder[0]>J.l_shoulder[0]?1:-1;
  const lr=[nk[0]-side*u*.3,nk[1]+tl*.14],rr=[nk[0]+side*u*.3,nk[1]+tl*.14],lh=[hc[0]-side*u*.17,hc[1]],rh=[hc[0]+side*u*.17,hc[1]];
  let g='';
  for(const [root,e,w] of [[lr,'l_elbow','l_wrist'],[rr,'r_elbow','r_wrist']]){g+=limb(root,J[e],J[w],u*.15,u*.095,fill);g+=`<circle cx="${f1(J[w][0])}" cy="${f1(J[w][1])}" r="${f1(u*.072)}" fill="${fill}"/>`;}
  for(const [root,k,a] of [[lh,'l_knee','l_ankle'],[rh,'r_knee','r_ankle']]){if(!J[k])continue;g+=limb(root,J[k],J[a],u*.19,u*.12,fill);
    const fx=J[a][0]>=root[0]?1:-1;g+=`<ellipse cx="${f1(J[a][0]+fx*u*.05)}" cy="${f1(J[a][1]+u*.03)}" rx="${f1(u*.11)}" ry="${f1(u*.065)}" fill="${fill}"/>`;}
  const wc=u*.34,ww=u*.3,wh=u*.36,n0=nk[0],n1=nk[1],h0=hc[0],h1=hc[1];
  g+=`<path d="M${f1(n0-wc)},${f1(n1+tl*.08)} C${f1(n0-wc*1.05)},${f1(n1-tl*.06)} ${f1(n0+wc*1.05)},${f1(n1-tl*.06)} ${f1(n0+wc)},${f1(n1+tl*.08)} `+
     `C${f1(n0+ww*1.05)},${f1(n1+tl*.5)} ${f1(h0+wh*1.15)},${f1(h1+tl*.02)} ${f1(h0+wh*.6)},${f1(h1+tl*.13)} Q${f1(h0)},${f1(h1+tl*.2)} ${f1(h0-wh*.6)},${f1(h1+tl*.13)} `+
     `C${f1(h0-wh*1.15)},${f1(h1+tl*.02)} ${f1(n0-ww*1.05)},${f1(n1+tl*.5)} ${f1(n0-wc)},${f1(n1+tl*.08)} Z" fill="${fill}"/>`;
  const hx=J.head[0],hy=J.head[1],hr=u*.28,ex=hr*.34,ey=hr*.05;
  g+=`<g transform="rotate(${f1(tilt)} ${f1(hx)} ${f1(hy)})"><ellipse cx="${f1(hx)}" cy="${f1(hy)}" rx="${f1(hr)}" ry="${f1(hr*1.08)}" fill="${fill}"/>`+
     `<ellipse cx="${f1(hx-ex)}" cy="${f1(hy+ey)}" rx="${f1(hr*.075)}" ry="${f1(hr*.1)}" fill="#2B2724"/><ellipse cx="${f1(hx+ex)}" cy="${f1(hy+ey)}" rx="${f1(hr*.075)}" ry="${f1(hr*.1)}" fill="#2B2724"/>`+
     `<path d="M${f1(hx-hr*.16)},${f1(hy+hr*.3)} Q${f1(hx)},${f1(hy+hr*.45)} ${f1(hx+hr*.16)},${f1(hy+hr*.3)}" fill="none" stroke="#2B2724" stroke-width="${f1(hr*.055)}" stroke-linecap="round"/>`+
     `<circle cx="${f1(hx-hr*.56)}" cy="${f1(hy+hr*.3)}" r="${f1(hr*.14)}" fill="#F4A9A0" opacity=".45"/><circle cx="${f1(hx+hr*.56)}" cy="${f1(hy+hr*.3)}" r="${f1(hr*.14)}" fill="#F4A9A0" opacity=".45"/></g>`;
  return `<g filter="url(#${o.sh||'yds'})">${g}</g>`;}
const headTop=(J,u)=>[J.head[0],J.head[1]-u*.28*1.08];

// ---------------- the gold 「你」 bubble (tail tip at 0,0)
const BUBBLE=`<g id="bub" style="display:none"><g filter="url(#bds)"><path d="M-16,-28 L0,0 L18,-28 Z" fill="${GOLD}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`+
  `<rect x="-64" y="-120" width="128" height="96" rx="30" fill="${GOLD}" stroke="${INK}" stroke-width="5"/><rect x="-20" y="-33" width="40" height="11" fill="${GOLD}"/></g>`+
  `<text x="0" y="-49" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="66" fill="${INK}">你</text></g>`;
function bubble(t,tip,tin,vis){const b=$('bub');if(!vis||t<tin){b.style.display='none';return;}b.style.display='';
  const u=(t-tin)/.36,s=u<1?.4+.6*oback(u,2.4):1,bob=5*Math.sin((t-tin)*5.2);
  b.setAttribute('transform',`translate(${f1(tip[0])},${f1(tip[1]-14+bob)}) scale(${s.toFixed(3)})`);b.setAttribute('opacity',f2(cl(u/.3)));}
'''


# ============================================================================================ 「穿越时间轴」 blueprint (_when)
BP_JS = r'''
const C=__CFG__, N0=2026, YX=940, RY=752;            // 你 runs at screen x 940 on the ruler's top edge (y 752)
function truckP(u){u=cl(u);const a=.45,s=Math.max(0,(u-a)/(1-a));return(Math.min(u,a)+(1-a)*(s-s*s*s+s*s*s*s/2))/(a+(1-a)/2);}
function cam(t){const p=truckP(t/BAR),e=eio(span(t,1.72,3.344));
  return {dx:-C.D*p-55*e, dy:-10*e, zc:.03*e, F:1+.045*e+.022*kick(t,BAR,.22), roll:-1.1*e};}
const LAY={grid:{z:2},rul:{z:1},you:{z:1},fg:{z:1/1.4}};
// ---- paper grid, dust, tools
const R0=rng(57), DUST=[];for(let i=0;i<46;i++)DUST.push([R0()*3200-900,R0()*1000+40,.8+R0()*2.6,R0()*6.28,.15+R0()*.5]);
// ---- 你 on the timeline
function youPose(t){const s=C.ys;
  if(t<1.38){const ps=2*Math.PI*t/BEAT+Math.PI/2, L=[], b=8*Math.abs(Math.cos(ps));
    const leg=(ph,sx)=>{const fw=Math.sin(ph),sw=Math.max(0,Math.cos(ph));const ax=sx*12-50*fw, ay=-46*sw;
      return {k:[sx*20+(ax-sx*20)*.5-24*(.3+.7*sw),-64+ay*.35-16*sw], a:[ax,ay]};};
    const l=leg(ps,-1), r=leg(ps+Math.PI,1), sw=(1+Math.sin(ps))/2;
    return {s, lean:-16, lift:b, tilt:-10, kl:l.k, al:l.a, kr:r.k, ar:r.a,
      ra:mix([48,-82],[88,-12],sw), la:mix([96,192],[132,262],sw), crouch:8, breath:0};}
  const skid={s,lean:12,crouch:18,tilt:-4,kl:[-70,-44],al:[-96,0],kr:[34,-50],ar:[48,0],ra:[-10,-35],la:[200,240],lift:0};
  const stand={s,lean:0,crouch:0,tilt:6,ra:[58,84],la:[122,96],lift:0};
  const point={s,lean:-3,crouch:0,tilt:9,ra:[-38,-46],la:[125,40],lift:0};
  const show={s,lean:-4,crouch:0,tilt:-7,ra:[125,40],la:[205,222],lift:0};
  let p=keys(t,[[1.38,skid],[1.672,skid],[1.80,mix(stand,{lift:22,crouch:-4},1)],[1.95,point],[2.62,point],[2.85,show],[3.344,show]]);
  p=Object.assign({},p);p.breath=2*Math.sin(t*3.6);p.lift=(p.lift||0)+(t>2.0?7*hop(t,2.09):0);return p;}
function render(t){
  const c=cam(t);for(const id in LAY){$('L'+id).style.transform=css(lmat(c,LAY[id]));}
  const c1=cam(Math.max(0,t-1/30)), v=Math.abs(c.dx-c1.dx);                 // px per frame
  $('mbg').setAttribute('stdDeviation',`${f1(Math.min(4.5,v*.22))} 0`);
  // ---- counter
  const p=truckP(t/BAR), yr=N0-(N0-C.target)*p, landed=t>=BAR;
  rollNum(landed?C.target:yr, landed?0:v);
  const pk=1+.15*kick(t,BAR,.26); $('cg').setAttribute('transform',`translate(${C.cx},${C.cy}) scale(${pk.toFixed(4)}) translate(${-C.cx},${-C.cy})`);
  $('cg').setAttribute('opacity',f2(span(t,0,.12)));
  const lu=(t-BAR)/.32; $('clab').setAttribute('opacity',f2(landed?cl(lu/.4):0));
  $('clab').setAttribute('transform',`translate(${C.cx},${C.cy}) scale(${f2(landed?.6+.4*oback(lu,2.2):.6)}) translate(${-C.cx},${-C.cy})`);
  // ---- 你
  const wx=YX+(t<BAR?c.dx:cam(BAR).dx)+(t<1.38?0:-9*eout(span(t,1.38,BAR)));   // world x (camera locked on it while running)
  const P=Object.assign({x:wx,y:RY},youPose(t)), J=rig(P), u=120*P.s;
  let g=`<ellipse cx="${f1(wx)}" cy="${RY+3}" rx="${f1(u*.5-(P.lift||0)*.3)}" ry="${f1(u*.07)}" fill="#07101E" opacity=".45" filter="url(#sb)"/>`;
  // speed lines (behind 你, to the right), fading with the speed
  const rs=rng(Math.floor(t*30)+11), sp=cl(v/17);
  for(let i=0;i<7;i++){const y=RY-40-i*34+rs()*14, L=(90+rs()*190)*sp, x0=wx+60+rs()*50; if(L<6)continue;
    g+=`<line x1="${f1(x0)}" y1="${f1(y)}" x2="${f1(x0+L)}" y2="${f1(y)}" stroke="#EAF2FF" stroke-width="${f1(3+rs()*2)}" stroke-linecap="round" opacity="${f2(.25+.45*sp)}"/>`;}
  // chalk dust kicked up at each footfall (world space: it stays behind as the ruler slides)
  const puffs=[];for(let k=0;k*BEAT/2<1.38;k++)puffs.push([k*BEAT/2,YX+cam(k*BEAT/2).dx+(k%2?16:-24)*P.s,.5]);
  for(let k=0;k<7;k++){const tk=1.38+k*.045;puffs.push([tk,YX+cam(Math.min(tk,BAR)).dx-90*P.s,.8+k*.08]);}
  for(const [tk,px,sz] of puffs){const a=t-tk;if(a<0||a>.6)continue;const q=a/.6;
    for(let j=0;j<3;j++){const r=(10+30*eout(q))*sz*(1-j*.2);g+=`<circle cx="${f1(px+(j-1)*r*.9+30*q)}" cy="${f1(RY-6-r*.5-j*5)}" r="${f1(r)}" fill="#EAF2FF" opacity="${f2(.32*(1-q))}"/>`;}}
  g+=figure(J,u,{tilt:P.tilt});
  $('you').innerHTML=g;
  const m=lmat(c,LAY.you), tip=app(m,headTop(J,u)); bubble(t,tip,.04,tip[1]>60);
  // ---- target marker on the ruler, the monument drawing itself (stroke-dashoffset), construction marks
  $('tgt').setAttribute('opacity',f2(span(t,BAR-.05,BAR+.1)));
  $('tgt').setAttribute('transform',`translate(${C.tx},${RY}) scale(${f2(t<BAR?.5:.5+.5*oback((t-BAR)/.3,2.5))}) translate(${-C.tx},${-RY})`);
  for(const el of ART){const u=span(t,el._t0,el._t1);
    if(el._len){el.style.strokeDashoffset=f1(el._len*(1-eio(u)));el.style.opacity=u>0?1:0;} else el.setAttribute('opacity',f2(sm(u)));}
  if(window.ANIM)ANIM(t);
  // ---- floating tools and chalk dust in the foreground (1.4x parallax)
  let d='';for(const [x,y,r,ph,o] of DUST){d+=`<circle cx="${f1(x+12*Math.sin(t*.9+ph))}" cy="${f1(y-14*t+6*Math.cos(t*1.3+ph))}" r="${f1(r)}" fill="#EAF2FF" opacity="${f2(o)}"/>`;}
  $('dust').innerHTML=d;
  for(const [id,ph] of [['tool0',0],['tool1',1.7],['tool2',3.1]]){const e=$(id);e.setAttribute('transform',e.dataset.base+` rotate(${f1(4*Math.sin(t*1.6+ph))}) translate(0,${f1(8*Math.sin(t*2.1+ph))})`);}
}
function rollNum(v,speed){const n=Math.floor(v+1e-6),f=v-n,Hh=C.rowh;
  $('cA').textContent=fmt(n+1);$('cB').textContent=fmt(n);
  $('cA').setAttribute('y',f1(C.cy+(1-f)*Hh));$('cB').setAttribute('y',f1(C.cy-f*Hh));
  $('cA').setAttribute('opacity',f>.001?1:0);$('cblur').setAttribute('stdDeviation',`0 ${f1(Math.min(14,speed*.6*C.blurk))}`);}
function fmt(n){return C.neg&&n<0?'公元前'+(-n):String(n);}
const ART=[];
window.addEventListener('DOMContentLoaded',()=>{});
(function init(){for(const el of document.querySelectorAll('#art [data-t0]')){el._t0=+el.dataset.t0;el._t1=+el.dataset.t1;
  if(el.dataset.draw){const L=el.getTotalLength();el._len=L;el.style.strokeDasharray=`${f1(L+2)} ${f1(L+2)}`;}ART.push(el);}})();
window.DUR=C.dur; window.render=render;
'''


def bp_ruler(target, ppy, majors, mids, minors, label_every, label_big, eras, y0=752):
    """the timeline ruler in world px: x(year) = 940 + (year - 2026) * ppy"""
    X = lambda yr: 940 + (yr - 2026) * ppy
    lo, hi = target - 1300 / ppy, 2026 + 1500 / ppy
    W = '#EAF2FF'
    g = [f'<rect x="{X(lo):.0f}" y="{y0}" width="{(hi - lo) * ppy:.0f}" height="36" fill="#EAF2FF" opacity=".05"/>',
         f'<line x1="{X(lo):.0f}" y1="{y0}" x2="{X(hi):.0f}" y2="{y0}" stroke="{W}" stroke-width="3.2" opacity=".95"/>',
         f'<line x1="{X(lo):.0f}" y1="{y0 + 36}" x2="{X(hi):.0f}" y2="{y0 + 36}" stroke="{W}" stroke-width="2" opacity=".7"/>']
    ticks = []
    yr = math.ceil(lo / minors) * minors
    while yr <= hi:
        x = X(yr)
        if yr % majors == 0: L, w, o = 26, 3, .95
        elif yr % mids == 0: L, w, o = 16, 2.2, .8
        else: L, w, o = 8, 1.5, .55
        ticks.append(f'<line x1="{x:.1f}" y1="{y0}" x2="{x:.1f}" y2="{y0 + L}" stroke="{W}" stroke-width="{w}" opacity="{o}"/>')
        if yr % label_every == 0:
            big = yr % label_big == 0; s = 31 if big else 21
            txt = f'公元前{-yr}' if yr < 0 else str(yr)
            ticks.append(f'<text x="{x:.1f}" y="{y0 + 36 + s + 6}" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="{s}" fill="{W}" opacity="{.95 if big else .7}">{txt}</text>')
        yr += minors
    g += ticks
    for a, b, name in eras:   # era brackets above the ruler, small chalk letters
        xa, xb = X(a), X(b); yb = y0 - 22
        g.append(f'<polyline points="{xa:.1f},{yb + 8} {xa:.1f},{yb} {xb:.1f},{yb} {xb:.1f},{yb + 8}" fill="none" stroke="{W}" stroke-width="1.6" opacity=".45" stroke-dasharray="6 5"/>')
        g.append(f'<text x="{(xa + xb) / 2:.1f}" y="{yb - 9}" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="25" fill="{W}" opacity=".62">{name}</text>')
    return '\n'.join(g), X


TOOLS_SVG = {   # floating drafting tools (chalk outlines), drawn round their own origin
    'square': '<polygon points="-90,60 90,60 -90,-90" fill="#EAF2FF" fill-opacity=".05" stroke="#EAF2FF" stroke-width="3" stroke-linejoin="round"/>'
              '<polygon points="-66,44 30,44 -66,-36" fill="none" stroke="#EAF2FF" stroke-width="2.4" stroke-linejoin="round"/>'
              + ''.join(f'<line x1="{-90 + i * 18}" y1="60" x2="{-90 + i * 18}" y2="{52 if i % 5 else 46}" stroke="#EAF2FF" stroke-width="1.6"/>' for i in range(1, 10)),
    'compass': '<circle cx="0" cy="-70" r="9" fill="none" stroke="#EAF2FF" stroke-width="3"/><line x1="0" y1="-84" x2="0" y2="-100" stroke="#EAF2FF" stroke-width="4" stroke-linecap="round"/>'
               '<polyline points="-4,-62 -46,60 -48,72" fill="none" stroke="#EAF2FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
               '<polyline points="4,-62 44,58" fill="none" stroke="#EAF2FF" stroke-width="4" stroke-linecap="round"/><polygon points="40,56 50,56 47,74" fill="#EAF2FF"/>'
               '<path d="M-60,80 Q0,104 62,78" fill="none" stroke="#EAF2FF" stroke-width="2" stroke-dasharray="5 6" opacity=".7"/>',
    'protractor': '<path d="M-95,0 A95,95 0 0 1 95,0 Z" fill="#EAF2FF" fill-opacity=".05" stroke="#EAF2FF" stroke-width="3"/><path d="M-60,0 A60,60 0 0 1 60,0" fill="none" stroke="#EAF2FF" stroke-width="2"/>'
                  + ''.join(f'<line x1="{95 * math.cos(math.radians(a)):.1f}" y1="{-95 * math.sin(math.radians(a)):.1f}" x2="{(95 - (12 if a % 30 else 20)) * math.cos(math.radians(a)):.1f}" y2="{-(95 - (12 if a % 30 else 20)) * math.sin(math.radians(a)):.1f}" stroke="#EAF2FF" stroke-width="1.6"/>' for a in range(10, 180, 10))
                  + '<circle cx="0" cy="0" r="4" fill="#EAF2FF"/>',
}


def blueprint_when(stop, target, ppy, ticks, eras, art, label_pre='', label_post='', art_anim_js='', title='', cx=1395):
    """the shared 「穿越时间轴」 page. art: SVG elements (world coords at the landing frame = screen coords + D)
    carrying data-t0/data-t1 (and data-draw="1" for strokes drawn on)."""
    D = (2026 - target) * ppy
    rul, X = bp_ruler(target, ppy, *ticks, eras)
    tx = X(target)
    # counter: number centred at cx; labels around it
    cy, fs = 520, 190
    nw = len(str(target)) * fs * .29
    pre = (f'<text x="{cx - nw - 18:.0f}" y="{cy}" text-anchor="end" font-family="Noto Sans CJK SC" font-weight="900" font-size="64" fill="#FFF6E6" filter="url(#cshd)">{label_pre}</text>' if label_pre else '')
    post_x = cx + nw + 18
    post = (f'<text x="{post_x:.0f}" y="{cy}" text-anchor="start" font-family="Noto Sans CJK SC" font-weight="900" font-size="64" fill="#FFF6E6" filter="url(#cshd)">{label_post}</text>' if label_post else '')
    cfg = dict(target=target, D=D, ys=.84, cx=cx, cy=cy, rowh=fs * 1.25, tx=tx, dur=3.344, neg=target < 0, blurk=1 if (2026 - target) < 300 else .5)
    tools = ''
    for i, (name, X0, Y0, rot, sc) in enumerate([('square', 330, 905, -18, .95), ('compass', -420, 880, 14, .9), ('protractor', 1240, 930, 8, .8)]):
        base = f'translate({X0},{Y0}) rotate({rot}) scale({sc})'
        tools += f'<g id="tool{i}" data-base="{base}" transform="{base}" opacity=".55" filter="url(#fgb)">{TOOLS_SVG[name]}</g>'
    defs = (fig_defs('tl', (5, 10, .45), '#050B16')
            + '<pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">'
            + ''.join(f'<line x1="{i * 40}" y1="0" x2="{i * 40}" y2="200" stroke="#FFFFFF" stroke-width="1.2" opacity="{.15 if i == 0 else .08}"/>'
                      f'<line x1="0" y1="{i * 40}" x2="200" y2="{i * 40}" stroke="#FFFFFF" stroke-width="1.2" opacity="{.15 if i == 0 else .08}"/>' for i in range(5))
            + '</pattern>'
            '<filter id="mb" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur id="mbg" stdDeviation="0 0"/></filter>'
            '<filter id="cblur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur id="cblur_" stdDeviation="0 0"/></filter>'
            '<filter id="cshd" x="-10%" y="-20%" width="130%" height="150%"><feDropShadow dx="7" dy="9" stdDeviation="0" flood-color="#0A1222" flood-opacity=".95"/></filter>'
            '<filter id="sb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>'
            '<filter id="fgb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>'
            '<filter id="chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="9" result="n"/>'
            '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>'
            '<feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves="1" seed="3" result="m"/><feColorMatrix in="m" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -2.2 2.25" result="ma"/>'
            '<feComposite in="d" in2="ma" operator="in"/></filter>'
            '<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="21"/>'
            '<feColorMatrix type="matrix" values="0 0 0 0 .85 0 0 0 0 .9 0 0 0 0 1 0 0 0 .55 -.22"/></filter>')
    body = (f'<svg width="0" height="0" style="position:absolute"><defs>{defs}</defs></svg>'
            '<div style="position:absolute;inset:0;background:radial-gradient(ellipse 75% 70% at 52% 46%,#21406A 0%,#1D3557 45%,#182C4A 75%,#13223A 100%)"></div>'
            '<svg width="1920" height="1080" style="position:absolute;left:0;top:0;opacity:.22"><rect width="1920" height="1080" filter="url(#grain)"/></svg>'
            + layer('Lgrid', '<rect x="-900" y="-400" width="4200" height="2000" fill="url(#grid)"/>')
            + layer('Lrul', f'<g filter="url(#mb)">{rul}</g>'
                    f'<g id="tgt" opacity="0"><line x1="{tx:.1f}" y1="{752 - 30}" x2="{tx:.1f}" y2="{752 + 44}" stroke="{GOLD}" stroke-width="5" stroke-linecap="round"/>'
                    f'<polygon points="{tx - 13:.1f},{752 - 46} {tx + 13:.1f},{752 - 46} {tx:.1f},{752 - 26}" fill="{GOLD}"/></g>'
                    f'<g id="art" filter="url(#chalk)" transform="translate({-D:.1f},0)">{art}</g>')
            + layer('Lyou', '<g id="you"></g>')
            + layer('Lfg', f'<g id="dust"></g>{tools}')
            + f'<svg width="1920" height="1080" style="position:absolute;left:0;top:0"><g id="cg" opacity="0">'
              f'<defs><clipPath id="cclip"><rect x="{cx - 420}" y="{cy - fs * .86:.0f}" width="840" height="{fs * 1.12:.0f}"/></clipPath></defs>'
              f'<g clip-path="url(#cclip)"><g filter="url(#cblur)"><g filter="url(#cshd)">'
              f'<text id="cA" x="{cx}" y="{cy}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="{fs}" fill="#FFF6E6">2027</text>'
              f'<text id="cB" x="{cx}" y="{cy}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="{fs}" fill="#FFF6E6">2026</text></g></g></g>'
              f'<g id="clab" opacity="0">{pre}{post}</g></g>{"<g>"}<g id="bubw"></g></g></svg>')
    js = ('const BUBW=1;' + BP_JS.replace('__CFG__', json.dumps(cfg)).replace("$('cblur').setAttribute", "$('cblur_').setAttribute")
          + art_anim_js + "\n$('bubw').innerHTML=BUBBLE;render(0);")
    return page(title or f'{stop} when', 3.344, body, js)


def strokes(items, t0, t1, w=3.2, col='#F4F7FF', op=1, dash=None, extra=''):
    """SVG path elements drawn on one after another between t0 and t1 (in list order)"""
    n = len(items); out = []
    for i, d in enumerate(items):
        a = t0 + (t1 - t0) * i / n; b = a + (t1 - t0) / n * 1.8
        da = f' stroke-dasharray="{dash}"' if dash else ''
        if dash:   # dashed construction lines fade in instead of drawing on
            out.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" opacity="0"{da} data-t0="{a:.3f}" data-t1="{b:.3f}" {extra}/>')
        else:
            out.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" style="opacity:0;stroke-opacity:{op}" data-draw="1" data-t0="{a:.3f}" data-t1="{min(b, t1 + .15):.3f}" {extra}/>')
    return '\n'.join(out)


def P(pts, close=False): return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + (' Z' if close else '')


def dim_v(x, ya, yb, txt, t0, t1, side=1):
    """vertical dimension line with arrowheads, extension ticks and a label"""
    a = 10
    d = [P([(x, ya), (x, yb)]), P([(x - 7, ya + a), (x, ya), (x + 7, ya + a)]), P([(x - 7, yb - a), (x, yb), (x + 7, yb - a)]),
         P([(x - 16 * side, ya), (x + 10 * side, ya)]), P([(x - 16 * side, yb), (x + 10 * side, yb)])]
    s = strokes(d, t0, t1, 2.2, op=.9)
    s += (f'<text x="{x + 16 * side:.1f}" y="{(ya + yb) / 2 + 10:.1f}" text-anchor="{"start" if side > 0 else "end"}" font-family="LXGW WenKai" font-weight="700" font-size="30" '
          f'fill="#F4F7FF" opacity="0" data-t0="{t1 - .1:.3f}" data-t1="{t1 + .2:.3f}">{txt}</text>')
    return s


def dim_h(y, xa, xb, txt, t0, t1):
    a = 10
    d = [P([(xa, y), (xb, y)]), P([(xa + a, y - 7), (xa, y), (xa + a, y + 7)]), P([(xb - a, y - 7), (xb, y), (xb - a, y + 7)]),
         P([(xa, y - 12), (xa, y + 14)]), P([(xb, y - 12), (xb, y + 14)])]
    s = strokes(d, t0, t1, 2.2, op=.9)
    s += (f'<text x="{(xa + xb) / 2:.1f}" y="{y - 12:.1f}" text-anchor="middle" font-family="LXGW WenKai" font-weight="700" font-size="30" '
          f'fill="#F4F7FF" opacity="0" data-t0="{t1 - .1:.3f}" data-t1="{t1 + .2:.3f}">{txt}</text>')
    return s


def worker(x, y, h, kind='cap', t0=2.6, id_=None, flip=1):
    """a tiny filled chalk silhouette of a worker (cap: 1920s flat cap / tunic: Roman), feet at (x, y)"""
    hr = h * .11; s = flip
    body = (f'<circle cx="{x}" cy="{y - h + hr:.1f}" r="{hr:.1f}"/>'
            f'<path d="M{x - h * .13:.1f},{y - h * .78:.1f} L{x + h * .13:.1f},{y - h * .78:.1f} L{x + h * .11:.1f},{y - h * .42:.1f} L{x - h * .11:.1f},{y - h * .42:.1f} Z"/>'
            f'<path d="M{x - h * .1:.1f},{y - h * .44:.1f} L{x - h * .12:.1f},{y:.1f} M{x + h * .1:.1f},{y - h * .44:.1f} L{x + h * .12:.1f},{y:.1f}" stroke="#F4F7FF" stroke-width="{h * .1:.1f}" stroke-linecap="round"/>')
    if kind == 'cap':
        body += f'<path d="M{x - hr * 1.1:.1f},{y - h + hr * .7:.1f} Q{x:.1f},{y - h - hr * .9:.1f} {x + hr * 1.1:.1f},{y - h + hr * .7:.1f} L{x + s * hr * 1.9:.1f},{y - h + hr * .9:.1f} Z"/>'
    else:   # tunic flaring to the knee
        body += f'<path d="M{x - h * .13:.1f},{y - h * .5:.1f} L{x + h * .13:.1f},{y - h * .5:.1f} L{x + h * .19:.1f},{y - h * .3:.1f} L{x - h * .19:.1f},{y - h * .3:.1f} Z"/>'
    arm = f'<path {"id=" + chr(34) + id_ + chr(34) if id_ else ""} d="M{x + s * h * .1:.1f},{y - h * .74:.1f} L{x + s * h * .32:.1f},{y - h * .9:.1f}" stroke="#F4F7FF" stroke-width="{h * .085:.1f}" stroke-linecap="round"/>'
    return f'<g fill="#F4F7FF" opacity="0" data-t0="{t0:.2f}" data-t1="{t0 + .25:.2f}">{body}{arm}</g>'


# ---------------------------------------------------------------- the statue as chalk line art (proportions from christ_vector.py)
from hist_b import LH, LTOP, HEAD, RTOP, RH, RSL, BODYR, HEM, BODYL, LBOT, LHB, COLL, COLR


def christ_art():
    bx, base = 540, 752; hill_top = 684; ped_top = 616; sc = (ped_top - 356) / (1948 - 1052)
    T = lambda pts: [(bx + (x - 840) * sc, ped_top + (y - 1948) * sc) for x, y in pts]
    t0 = BAR + .02; b1, b2, b3 = t0 + .38, t0 + .78, t0 + 1.2
    hill = [(bx - 300, base), (bx - 230, base - 14), (bx - 160, base - 34), (bx - 105, base - 58), (bx - 60, hill_top), (bx + 64, hill_top),
            (bx + 110, base - 56), (bx + 170, base - 30), (bx + 240, base - 12), (bx + 310, base)]
    s = strokes([P(hill)], t0, t0 + .3, 3.4)
    s += strokes([P([(bx - 120, base - 40), (bx - 70, base - 30), (bx - 40, base - 44)]), P([(bx + 90, base - 44), (bx + 140, base - 28), (bx + 190, base - 22)])], t0 + .2, t0 + .4, 2, op=.6)
    ped = [P([(bx - 46, hill_top), (bx - 46, hill_top - 10), (bx + 46, hill_top - 10), (bx + 46, hill_top)]),
           P([(bx - 38, hill_top - 10), (bx - 38, ped_top + 6), (bx + 38, ped_top + 6), (bx + 38, hill_top - 10)]),
           P([(bx - 44, ped_top + 6), (bx - 44, ped_top), (bx + 44, ped_top), (bx + 44, ped_top + 6)])]
    s += strokes(ped, t0 + .15, b1, 3.2)
    s += strokes([P([(bx - 38, y), (bx + 38, y)]) for y in (ped_top + 26, ped_top + 46)], b1 - .1, b1 + .1, 1.6, op=.6)
    # walls: the robe column, then the body outline from the hem up to the shoulders
    s += strokes([P(T(COLL)), P(T(COLR)), P(T(HEM))], b1, b1 + .3, 3.2)
    s += strokes([P(T(BODYL[::-1] + [(720, 1330), (690, 1328)])), P(T(BODYR[::-1] + RSL[::-1][:4]))], b1 + .15, b2, 3.2)
    for i in range(7):   # flutes
        xt = 753 + i * 32; s += strokes([P(T([(xt, 1660 + i * 6), (xt - 2, 1940)]))], b1 + .2 + i * .03, b1 + .4 + i * .03, 1.4, op=.55)
    # top: arms, hands, head
    s += strokes([P(T(LBOT[::-1] + LHB[::-1] + LH)), P(T(LTOP[::-1])), P(T(RTOP + RH + RSL[:6]))], b2 - .05, b3 - .2, 3.2)
    s += strokes([P(T(HEAD + [(884, 1176)])), P(T([(816, 1084), (822, 1070), (838, 1063), (856, 1066), (870, 1078), (874, 1098), (871, 1124), (864, 1142), (850, 1153), (836, 1152), (824, 1140), (818, 1118), (816, 1084)]))], b3 - .3, b3, 3)
    s += strokes([P(T(f)) for f in [[(748, 1320), (806, 1421), (864, 1518), (890, 1575)], [(930, 1300), (932, 1430), (930, 1560), (925, 1640)],
                                    [(733, 1203), (770, 1236), (800, 1254), (848, 1256), (880, 1248)], [(884, 1178), (903, 1180), (910, 1662)]]], b3 - .15, b3 + .15, 1.8, op=.7)
    # construction marks: centre line, scaffold round the figure and under both arms, the derrick, workers, dimensions
    s += strokes([P([(bx, 336), (bx, base + 4)])], t0 + .1, t0 + .4, 1.6, dash='18 7 3 7')
    sc_ = []
    for x in (690, 760, 920, 990): sc_.append([(x, 1010), (x, 1948)])
    for y in range(1020, 1948, 96): sc_.append([(680, y), (1000, y)])
    for i, y in enumerate(range(1020, 1890, 128)):
        sc_.append([(690, y), (760, y + 128)] if i % 2 else [(760, y), (690, y + 128)]); sc_.append([(920, y), (990, y + 128)] if i % 2 else [(990, y), (920, y + 128)])
    YG = 1948 + (hill_top - ped_top) / sc
    for xa, xb in ((395, 565), (1115, 1285)):
        xm = (xa + xb) / 2
        for x in (xa, xm, xb): sc_.append([(x, 1250), (x, YG)])
        for y in range(1250, int(YG), 110): sc_.append([(xa - 10, y), (xb + 10, y)])
        for y in range(1250, int(YG) - 110, 220): sc_ += [[(xa, y), (xm, y + 110)], [(xm, y + 110), (xb, y + 220)]]
    s += strokes([P(T(q)) for q in sc_], b2 - .1, b3 + .3, 1.5, dash='7 5')
    d0, d1, d2 = T([(990, 1010), (1200, 850), (1200, 1040)])
    s += strokes([P([d0, d1, d2]), P([(d2[0] - 6, d2[1]), (d2[0] + 6, d2[1]), (d2[0] + 6, d2[1] + 9), (d2[0] - 6, d2[1] + 9)], True)], b3 - .1, b3 + .25, 2.4)
    s += worker(bx + 110, T([(0, 1250)])[0][1] - 1, 28, 'cap', b3 + .05, 'wk1')
    s += worker(bx - 118, T([(0, 1580)])[0][1] - 1, 26, 'cap', b3 + .15, flip=-1)
    s += worker(bx - 22, T([(0, 1020)])[0][1] - 1, 24, 'cap', b3 + .25, 'wk2', flip=-1)
    s += worker(bx + 200, base - 22, 30, 'cap', b3 + .1, 'wk3')
    s += dim_v(bx + 210, 356, ped_top, '30 m', b3 + .05, b3 + .35)
    s += dim_v(bx + 210, ped_top, hill_top, '8 m', b3 + .2, b3 + .45)
    for (x, y) in ((bx - 300, 360), (bx + 300, 360)):   # registration crosses
        s += strokes([P([(x - 12, y), (x + 12, y)]), P([(x, y - 12), (x, y + 12)])], t0, t0 + .2, 1.6, op=.5)
    anim = r'''
window.ANIM=function(t){const a=$('wk1'),b=$('wk2');
  if(a){const r=-30*Math.abs(Math.sin((t-2.9)*Math.PI/.209));a.setAttribute('transform',`rotate(${f1(t>2.9?r:0)} ${a.getAttribute('d').split(' ')[0].slice(1)})`);}
};'''
    return s, anim


# ============================================================================================ christ_what (christ_1922, alive)
def christ_what_layers():
    """christ_1922() from hist_b.py, copied element for element (same random sequence) and split into depth layers.
    The static coins, the coin trail, the dashed toss lines and the year label are left out: they are animated."""
    import hist_b as HB
    from hist_b import poly, line, segs, ell, lerp, arc, bez, ey, inside, blob, rim, person20, RIM1, W, H
    L = {k: [] for k in ('sky', 'far', 'mtn', 'town', 'street', 'tram', 'mid', 'church', 'queue')}
    R = random.Random(1922)
    Pp = dict(sky0='#6C83AA', sky1='#B5A4A0', sky2='#EBC48F', sky3='#F7DCAA', glow='#FFE6AE',
              far='#ABA0B6', far_l='#8C809A', loaf='#9E95B2', loaf_l='#7E7596', bay='#F6E2B8',
              rock='#857E92', rock_lit='#B7A6A2', rock_line='#655E77', forest='#4B6744', leaf=['#58784B', '#678652', '#46623F', '#517046'], leaf_lit='#8DA663',
              stat='#8E8A97', stat_sh='#706C7A', stat_rim='#FFE1A0', ped='#77707A', scaf='#4A3424',
              roof='#B4583A', roof_d='#8E4230', win='#4B3B35', frame='#F1E5CC',
              pave='#E9DBBE', wave='#9C8670', church='#F1E9D9', church_sh='#DCCFB9', trim='#C99A5C', trim_d='#A87A42', door='#5E3523', door_l='#7A4A30',
              box='#8A5634', box_l='#B07445', box_d='#5C3822', brass='#E2B65A', iron='#3E3530')
    defs = (f'<linearGradient id="c_sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1080"><stop offset="0" stop-color="{Pp["sky0"]}"/><stop offset=".42" stop-color="{Pp["sky1"]}"/>'
            f'<stop offset=".62" stop-color="{Pp["sky2"]}"/><stop offset="1" stop-color="{Pp["sky3"]}"/></linearGradient>'
            f'<radialGradient id="c_glow" gradientUnits="userSpaceOnUse" cx="1340" cy="300" r="460"><stop offset="0" stop-color="{Pp["glow"]}" stop-opacity=".95"/>'
            f'<stop offset=".45" stop-color="{Pp["glow"]}" stop-opacity=".35"/><stop offset="1" stop-color="{Pp["glow"]}" stop-opacity="0"/></radialGradient>'
            f'<radialGradient id="c_halo" gradientUnits="userSpaceOnUse" cx="1332" cy="290" r="300"><stop offset="0" stop-color="#FFF4D2" stop-opacity="1"/>'
            f'<stop offset=".3" stop-color="#FFE3A0" stop-opacity=".6"/><stop offset="1" stop-color="#FFD480" stop-opacity="0"/></radialGradient>'
            f'<linearGradient id="c_door" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A261C"/><stop offset="1" stop-color="#9A6232"/></linearGradient>')
    g = L['sky']
    g += ['<rect x="-800" y="-600" width="3520" height="2400" fill="url(#c_sky)"/>', '<rect x="-800" y="-600" width="3520" height="2400" fill="url(#c_glow)"/>']
    g = L['far']
    far = [(0, 610), (90, 592), (180, 566), (260, 556), (340, 572), (430, 548), (520, 528), (600, 540), (700, 566), (800, 556), (880, 570), (960, 600),
           (1500, 612), (1560, 600), (1620, 618), (1700, 640), (1920, 650)]
    g.append(poly([(-600, 640), (-300, 600)] + far + [(2300, 660), (2600, 640), (2600, 900), (-600, 900)], Pp['far'], Pp['far_l'], 2))
    g.append(poly([(1460, 668), (2600, 668), (2600, 700), (1460, 700)], Pp['bay'], 'none', 0))
    for i in range(14):
        x = 1480 + i * 31 + R.uniform(-8, 8); y = 674 + R.uniform(0, 18); g.append(line([(x, y), (x + R.uniform(10, 22), y)], '#FFFFFF', 2, f'opacity=".7" class="glint" data-i="{i}"'))
    g.append(poly([(1585, 690), (1610, 650), (1640, 630), (1680, 626), (1712, 640), (1730, 690)], Pp['loaf'], Pp['loaf_l'], 2))
    loaf = [(1700, 690), (1712, 640), (1722, 590), (1736, 548), (1752, 520), (1772, 504), (1796, 500), (1818, 508), (1834, 530), (1846, 570), (1856, 630), (1864, 690)]
    g.append(poly(loaf, Pp['loaf'], Pp['loaf_l'], 2))
    g.append(line([(1820, 512), (1836, 534), (1847, 574), (1856, 630)], Pp['stat_rim'], 3, 'opacity=".6"'))
    g = L['mtn']
    g.append('<circle id="halo" cx="1332" cy="290" r="300" fill="url(#c_halo)" opacity="0"/>')
    g.append('<g id="rays" opacity="0">' + ''.join(
        f'<polygon points="1332,300 {1332 + 620 * math.cos(math.radians(a - 3)):.0f},{300 + 620 * math.sin(math.radians(a - 3)):.0f} {1332 + 620 * math.cos(math.radians(a + 3)):.0f},{300 + 620 * math.sin(math.radians(a + 3)):.0f}" fill="#FFF0C4" opacity=".28"/>'
        for a in range(-170, 10, 20)) + '</g>')
    PEAK = [(860, 760), (930, 716), (1000, 672), (1060, 628), (1110, 586), (1150, 548), (1186, 510), (1220, 478), (1252, 452), (1278, 434), (1298, 425),
            (1368, 425), (1388, 434), (1404, 456), (1418, 490), (1430, 530), (1444, 572), (1466, 610), (1500, 640), (1550, 666), (1620, 694), (1710, 720), (1800, 760)]
    g.append(poly(PEAK, Pp['rock'], INK, 3))
    g.append(poly([(1368, 425), (1388, 434), (1404, 456), (1418, 490), (1430, 530), (1444, 572), (1466, 610), (1440, 614), (1424, 576), (1410, 534), (1398, 494), (1384, 460), (1374, 440)], Pp['rock_lit'], 'none', 0))
    g.append(line([(1370, 427), (1388, 436), (1402, 458), (1416, 492), (1428, 532), (1442, 574), (1464, 610)], Pp['stat_rim'], 3, 'opacity=".8"'))
    for _ in range(40):
        x = R.uniform(1160, 1450); y0 = ey(PEAK[5:18], x) + R.uniform(6, 14); Lr = R.uniform(30, 95)
        g.append(line([(x, y0), (x - Lr * .1, y0 + Lr * .5), (x - Lr * .16, y0 + Lr)], Pp['rock_line'], R.uniform(1.5, 2.5), 'opacity=".55"'))
    FOREST = [(860, 760), (930, 716), (1000, 672), (1060, 628), (1110, 586), (1150, 548), (1176, 522), (1210, 552), (1256, 580), (1306, 600), (1366, 612),
              (1426, 616), (1466, 610), (1500, 640), (1550, 666), (1620, 694), (1710, 720), (1800, 760)]
    g.append(poly(FOREST, Pp['forest'], INK, 2.5))
    for _ in range(200):
        x, y = R.uniform(860, 1800), R.uniform(520, 760)
        if not inside(FOREST, x, y): continue
        col = Pp['leaf_lit'] if (x > 1450 and R.random() < .55) else R.choice(Pp['leaf'])
        g.append(poly(blob(R, x, y, R.uniform(8, 15), 9, .2), col, '#2F4229', 1.2))
    s = .24; ox, oy = 1332, 380
    def T(p): return [(ox + (x - 840) * s, oy + (y - 1948) * s) for x, y in p]
    g.append(poly([(1302, 380), (1362, 380), (1370, 428), (1294, 428)], Pp['ped'], INK, 2.5))
    g.append(poly([(1296, 374), (1368, 374), (1368, 382), (1296, 382)], '#8E8790', INK, 2))
    for k in range(1, 3): g.append(line([(1300 - k * 1.5, 382 + k * 15), (1364 + k * 1.5, 382 + k * 15)], '#5E5862', 1.5))
    def TS(a, b): return tuple(T([a, b]))
    YG = 1948 + (425 - oy) / s
    sc = []
    for x in (690, 760, 920, 990): sc.append(TS((x, 1010), (x, 1948)))
    for y in range(1020, 1948, 96): sc.append(TS((680, y), (1000, y)))
    for i, y in enumerate(range(1020, 1890, 128)):
        sc.append(TS((690, y), (760, y + 128)) if i % 2 else TS((760, y), (690, y + 128)))
        sc.append(TS((920, y), (990, y + 128)) if i % 2 else TS((990, y), (920, y + 128)))
    for xa, xb in ((395, 565), (1115, 1285)):
        xm = (xa + xb) / 2
        for x in (xa, xm, xb): sc.append(TS((x, 1250), (x, YG)))
        for y in range(1250, int(YG), 110): sc.append(TS((xa - 10, y), (xb + 10, y)))
        for y in range(1250, int(YG) - 110, 220): sc += [TS((xa, y), (xm, y + 110)), TS((xm, y + 110), (xb, y + 220))]
        sc.append(TS((xa - 20, 1244), (xb + 20, 1244)))
    sc += [TS((565, 1244), (690, 1244)), TS((990, 1244), (1115, 1244))]
    g.append(segs(sc, INK, 3, 'opacity=".85"')); g.append(segs(sc, '#9A7650', 1.4))
    d0, d1, d2 = T([(990, 1010), (1170, 870), (1170, 1010)])
    g.append(segs([(d0, d1), (d1, d2)], INK, 3))
    g.append(f'<g id="hook">{poly([(d2[0] - 6, d2[1]), (d2[0] + 6, d2[1]), (d2[0] + 6, d2[1] + 9), (d2[0] - 6, d2[1] + 9)], "#6E5038", INK, 1.5)}</g>')
    g.append(poly(T(COLL + COLR[::-1]), Pp['stat'], INK, 2))
    cloak = LH + LTOP + HEAD + RTOP + RH + RSL + BODYR + HEM[::-1] + BODYL + LBOT + LHB
    g.append(poly(T(cloak), Pp['stat'], INK, 2))
    g.append(poly(T([(720, 1330), (762, 1335), (768, 1450), (756, 1560), (746, 1616), (734, 1585), (729, 1540), (725, 1500), (716, 1490), (714, 1472), (718, 1455), (720, 1400)]), Pp['stat_sh'], 'none', 0))
    g.append(poly(T([(549, 1305), (590, 1317), (623, 1322), (657, 1325), (690, 1328), (720, 1330), (722, 1288), (690, 1294), (650, 1300), (600, 1302), (565, 1298)]), Pp['stat_sh'], 'none', 0))
    g.append(poly(T(HEAD + [(884, 1176), (860, 1180), (830, 1180), (794, 1175)]), '#7A7784', INK, 1.8))
    g.append(line(T(RTOP + RH[:6]), Pp['stat_rim'], 2.5)); g.append(line(T(HEAD[5:]), Pp['stat_rim'], 2.5)); g.append(line(T(LTOP[3:]), Pp['stat_rim'], 2, 'opacity=".7"'))
    g.append(line(T([(951, 1340), (951, 1600), (964, 1610)]), Pp['stat_rim'], 2.2))
    # the glow when the coins arrive: the statue lit warm, a bright rim all round
    g.append(f'<g id="sglow" opacity="0">{poly(T(cloak), "#FFE7A8", "#FFF4D0", 3, "fill-opacity=.55")}{poly(T(COLL + COLR[::-1]), "#FFE7A8", "#FFF4D0", 2.5, "fill-opacity=.45")}</g>')
    fr = [TS((660, y), (1020, y)) for y in (1420, 1612, 1804)] + [TS((375, 1244), (585, 1244)), TS((1095, 1244), (1305, 1244))]
    g.append(segs(fr, INK, 3.2)); g.append(segs(fr, '#B08A5C', 1.6))
    # ---- town (generated sobrados), then extra houses past both ends of the original row (own random stream)
    g = L['town']
    HOUSE = ['#E2B064', '#D9917D', '#A9BCC4', '#EFDDBC', '#9EAE84', '#E8C5A0', '#C7A3B5', '#F2E2B4']
    def house(R_, x, w, hh, col, roof):
        top = 772 - hh
        g.append(poly([(x, 772), (x, top), (x + w, top), (x + w, 772)], col, INK, 2.5))
        if roof:
            g.append(poly([(x - 7, top), (x + w + 7, top), (x + w - 16, top - 24), (x + 16, top - 24)], Pp['roof'], INK, 2.5))
            for k in range(1, 3): g.append(line([(x - 7 + k * 6, top - k * 8), (x + w + 7 - k * 6, top - k * 8)], Pp['roof_d'], 1.5))
        else:
            g.append(poly([(x - 3, top), (x + w + 3, top), (x + w + 3, top - 13), (x - 3, top - 13)], Pp['frame'], INK, 2))
            for u_ in range(int(x + 12), int(x + w - 6), 18): g.append(line([(u_, top - 13), (u_, top - 22)], INK, 4)); g.append(ell(u_, top - 25, 4, 4, Pp['frame'], INK, 1.5))
        nr = max(1, int((hh - 24) // 44)); nc = max(1, int((w - 16) // 34))
        for r_ in range(nr):
            for c_ in range(nc):
                wx = x + 12 + c_ * (w - 24) / nc + ((w - 24) / nc - 16) / 2; wy = top + 16 + r_ * 44
                g.append(poly([(wx, wy + 30), (wx, wy + 6), (wx + 8, wy), (wx + 16, wy + 6), (wx + 16, wy + 30)], Pp['win'], INK, 1.5))
                g.append(line([(wx - 2, wy + 31), (wx + 18, wy + 31)], Pp['frame'], 3))
    x = 400
    while x < 1940:
        w = R.uniform(84, 150); hh = R.uniform(80, 150) if x < 1440 else R.uniform(56, 92); col = R.choice(HOUSE)
        top = 772 - hh
        if R.random() < .55:
            house(None, x, w, hh, col, True)
        else:
            house(None, x, w, hh, col, False)
        x += w
    R2 = random.Random(31)
    while x < 2500:
        w = R2.uniform(84, 150); house(R2, x, w, R2.uniform(56, 92), R2.choice(HOUSE), R2.random() < .55); x += w
    for px_, top_ in ((1520, 560), (1758, 585)):
        g.append(line([(px_, 772), (px_ + 4, top_)], INK, 10)); g.append(line([(px_, 772), (px_ + 4, top_)], '#B3A182', 6))
        g.append(f'<g class="palm" data-x="{px_ + 4}" data-y="{top_}">')
        for a in (-160, -130, -100, -70, -40, -10, 20):
            ex_, ey_ = px_ + 4 + 58 * math.cos(math.radians(a)), top_ + 30 * math.sin(math.radians(a)) + 22
            frd = [(px_ + 4, top_), ((px_ + 4 + ex_) / 2, top_ - 16 + (ey_ - top_) * .3), (ex_, ey_)]
            g.append(line(frd, INK, 9)); g.append(line(frd, '#5C7A45', 5))
        g.append('</g>')
    # ---- the street (extended past the frame so camera moves never show its edge)
    g = L['street']
    g.append(poly([(-700, 772), (2700, 772), (2700, 1700), (-700, 1700)], Pp['pave'], INK, 2.5))
    HZ, FC, CAMH = 700, 900.0, 1.6
    def wave_y(d, xs): return [(xx, HZ + FC * CAMH / (d + .25 * math.sin(((xx - 960) * d / FC) / .55))) for xx in xs]
    xs = list(range(-700, 2701, 8)); ds = [2.1 + .62 * k for k in range(32)]
    for k in range(0, len(ds) - 1, 2):
        a, b = wave_y(ds[k], xs), wave_y(ds[k + 1], xs)
        band = [(x_, max(774, y_)) for x_, y_ in a] + [(x_, max(774, y_)) for x_, y_ in b[::-1]]
        g.append(poly(band, Pp['wave'], 'none', 0, 'opacity=".42"'))
    # ---- tram + wire
    g = L['tram']
    g.append(line([(880, 612), (2600, 598)], '#3A3230', 2))
    g.append('<g id="tram">')
    g.append(poly([(1172, 776), (1172, 712), (1440, 712), (1440, 776)], '#D6B25C', INK, 2.5))
    g.append(poly([(1160, 712), (1452, 712), (1446, 698), (1166, 698)], '#5E5A52', INK, 2.5))
    g.append(poly([(1172, 776), (1440, 776), (1440, 788), (1172, 788)], '#4E6B48', INK, 2.5))
    for u_ in range(1180, 1440, 37): g.append(line([(u_, 712), (u_, 776)], INK, 3))
    for i, u_ in enumerate(range(1196, 1430, 37)):
        if i % 3 == 1: continue
        g.append(ell(u_, 734, 8, 9, R.choice(['#C99476', '#8E5E45', '#E0B497']), INK, 1.5)); g.append(ell(u_, 726, 13, 3.5, R.choice(['#E3C68A', '#3B3A40', '#5A4636']), INK, 1.5))
        g.append(poly([(u_ - 10, 744), (u_ + 10, 744), (u_ + 11, 762), (u_ - 11, 762)], R.choice(['#3B3A40', '#D9CCB0', '#2E4D5E', '#8E3B3A']), INK, 1.5))
    for u_ in (1205, 1408): g.append(ell(u_, 792, 13, 13, '#2E2A28', INK, 2))
    g.append(line([(1300, 698), (1236, 612)], INK, 3)); g.append(poly([(1180, 716), (1240, 716), (1240, 730), (1180, 730)], Pp['frame'], INK, 1.5))
    g.append('</g>')
    # ---- people in the middle distance
    g = L['mid']
    person20(g, 1528, 868, 200, 'dress', -1, 'cloche', '#7A5A86', '#E9D7B0', '#E0B497', '#3A2A20', '#2E2A30', stride=.5)
    person20(g, 1586, 872, 214, 'suit', -1, 'fedora', '#4A4A52', '#F2EEE6', '#C99476', '#2A1F1A', '#6B5A48', stride=.5)
    person20(g, 1712, 880, 222, 'suit', -1, 'boater', '#C9BBA0', '#F2EEE6', '#B98060', '#2A1F1A', '#E3C68A', stride=.25)
    # ---- the church
    g = L['church']
    g.append(poly([(-300, 906), (-300, 300), (92, 300), (92, 906)], Pp['church'], INK, 3))
    g.append(poly(arc(46, 300, 46, 52, 180, 360, 12), Pp['trim'], INK, 3)); g.append(segs([((46, 248), (46, 214)), ((34, 226), (58, 226))], INK, 5))
    g.append(poly(arc(46, 382, 26, 30, 180, 360, 10) + [(72, 440), (20, 440)], '#3E2E26', INK, 2.5)); g.append(ell(46, 410, 12, 14, Pp['brass'], INK, 2))
    g.append(poly([(-300, 452), (98, 452), (98, 464), (-300, 464)], Pp['trim'], INK, 2))
    g.append(poly([(92, 906), (92, 462), (430, 462), (430, 906)], Pp['church'], INK, 3))
    gable = [(100, 462), (110, 444), (138, 436), (160, 426), (178, 412), (198, 400), (230, 393), (262, 393), (294, 400), (314, 412), (332, 426), (354, 436), (382, 444), (392, 462)]
    g.append(poly(gable, Pp['church'], INK, 3)); g.append(line([(p[0], p[1] + 12) for p in gable[1:-1]], Pp['trim'], 3))
    g.append(segs([((246, 393), (246, 352)), ((232, 366), (260, 366))], INK, 6)); g.append(segs([((246, 393), (246, 352)), ((232, 366), (260, 366))], Pp['trim'], 2.5))
    for x0, x1 in ((92, 124), (398, 430)): g.append(poly([(x0, 906), (x0, 462), (x1, 462), (x1, 906)], Pp['trim'], INK, 2.5))
    g.append(poly([(92, 600), (430, 600), (430, 616), (92, 616)], Pp['trim'], INK, 2.5))
    g.append(ell(246, 530, 30, 30, '#3E2E26', INK, 3)); g.append(ell(246, 530, 38, 38, 'none', Pp['trim'], 6))
    for wx in (150, 318): g.append(poly(arc(wx + 14, 500, 14, 14, 180, 360, 8) + [(wx + 28, 570), (wx, 570)], '#3E2E26', INK, 2.5))
    door = arc(246, 730, 62, 50, 180, 360, 14) + [(308, 906), (184, 906)]
    g.append(poly(door, 'url(#c_door)', INK, 3)); g.append(line(arc(246, 730, 72, 60, 180, 360, 14), Pp['trim'], 8)); g.append(line(arc(246, 730, 72, 60, 180, 360, 14), INK, 2))
    g.append(poly([(184, 734), (204, 742), (204, 906), (184, 906)], Pp['door'], INK, 2)); g.append(poly([(308, 734), (288, 742), (288, 906), (308, 906)], Pp['door'], INK, 2))
    for k in range(3): g.append(ell(228 + k * 18, 820, 3, 7, '#FFE6A8', 'none', 0, f'opacity=".9" class="candle" data-i="{k}"'))
    g.append(poly([(130, 640), (170, 640), (170, 712), (130, 712)], '#F6EEDD', INK, 2))
    g.append(poly([(136, 666), (164, 663), (164, 668), (152, 668), (153, 704), (147, 704), (148, 668), (136, 669)], '#8A8590', 'none', 0))
    g.append(ell(150, 658, 4, 5, '#8A8590', 'none', 0))
    for i, (y0, x1) in enumerate(((906, 470), (924, 485), (941, 500))):
        g.append(poly([(-300, y0), (x1, y0), (x1 + 6, y0 + 18), (-300, y0 + 18)], '#D8CBB4' if i % 2 == 0 else '#CDBFA6', INK, 2.5))
    g.append(poly([(-300, 958), (506, 958), (470, 1000), (330, 1080), (330, 1300), (-300, 1300)], '#5E4E44', 'none', 0, 'opacity=".32"'))
    # ---- the queue: lamp post, the donation box, six people
    g = L['queue']
    g.append(line([(1870, 940), (1870, 470)], INK, 12)); g.append(line([(1870, 940), (1870, 470)], '#2E3A3A', 7))
    g.append(poly([(1852, 470), (1888, 470), (1882, 430), (1858, 430)], '#F6E3A8', INK, 2.5)); g.append(poly([(1850, 430), (1890, 430), (1870, 414)], '#2E3A3A', INK, 2.5))
    g.append(poly([(1856, 940), (1884, 940), (1880, 900), (1860, 900)], '#2E3A3A', INK, 2))
    g.append('<g id="boxg">')
    g.append(poly([(553, 722), (567, 722), (569, 924), (551, 924)], '#6E4228', INK, 2.5))
    g.append(poly([(530, 940), (590, 940), (580, 922), (540, 922)], '#6E4228', INK, 2.5))
    g.append(poly([(510, 646), (610, 646), (610, 724), (510, 724)], Pp['box'], INK, 3))
    g.append(poly([(590, 646), (610, 646), (610, 724), (590, 724)], Pp['box_d'], 'none', 0))
    g.append(poly([(504, 646), (616, 646), (606, 628), (514, 628)], Pp['box_l'], INK, 3))
    g.append(poly([(542, 634), (580, 634), (580, 640), (542, 640)], INK, INK, 1))
    for u_ in (522, 598): g.append(poly([(u_ - 4, 647), (u_ + 4, 647), (u_ + 4, 723), (u_ - 4, 723)], Pp['iron'], 'none', 0))
    g.append(segs([((560, 662), (560, 706)), ((546, 676), (574, 676))], INK, 9)); g.append(segs([((560, 662), (560, 706)), ((546, 676), (574, 676))], Pp['brass'], 5))
    g.append(line([(612, 630), (612, 724)], RIM1, 3, 'opacity=".8"'))
    g.append('</g>')
    hands = {}
    person20(g, 352, 946, 392, 'priest', 1, 'saturno', '#26201F', '#F1ECE2', '#C7987A', '#4A3A30', '#26201F')
    hands['girl'] = person20(g, 470, 942, 205, 'dress', 1, 'cloche', '#C9705E', '#F2E6CC', '#D7A88A', '#6A4430', '#EAD7B0', reach=(530, 732), child=True)
    hands['man'] = person20(g, 694, 934, 402, 'suit', -1, 'fedora', '#3A3A42', '#F2EEE6', '#B98060', '#2A1F1A', '#5B4535', reach=(592, 624))
    hands['wom'] = person20(g, 838, 936, 368, 'dress', -1, 'cloche', '#2E4D5E', '#D7B062', '#E0B497', '#2A1F1A', '#8E3B3A', reach=(790, 726), bag='#5A3A2A')
    person20(g, 968, 938, 388, 'suit', -1, 'boater', '#D6C9AC', '#F4F0E6', '#C99476', '#BDB3A6', '#E3C68A', cane=True)
    hands['wrk'] = person20(g, 1100, 940, 382, 'worker', -1, 'flatcap', '#5B4636', '#ECE4D4', '#8E5E45', '#1E1814', '#4A4440', reach=(1030, 552))
    g.append(f'<g id="badge">{ell(468, 600, 36, 36, GOLD, INK, 3.5)}{ell(468, 600, 28, 28, "none", "#C9953C", 2.5)}'
             f'<text x="468" y="615" font-family="Noto Sans CJK SC" font-weight="900" font-size="40" text-anchor="middle" fill="{INK}">捐</text></g>')
    return L, defs, hands


CW_JS = r'''
const HANDS=__HANDS__;
// depth of each layer (1 = the queue); content is already in screen coordinates at the base camera
const LAY={sky:{z:40},far:{z:14},mtn:{z:6},town:{z:3},street:{z:1.7},tram:{z:2.2},mid:{z:1.5},church:{z:1.04},queue:{z:1},you:{z:.95}};
function cam(t){return keys(t,[[0,{dx:-170,dy:150,zc:.2,F:1,roll:-1.2}],[1.672,{dx:-205,dy:165,zc:.26,F:1,roll:-.6}],
  [3.25,{dx:-150,dy:-55,zc:.015,F:1.07,roll:.5}],[5.016,{dx:-150,dy:-70,zc:.06,F:1.07,roll:.9}]]);}
const SLOT=[561,637], YOU={x:1236,y:952,s:.88};
const sgn=(x)=>x<0?-1:1;
function coin(p,r,tilt,op){return `<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(r)}" ry="${f1(r*Math.max(.12,Math.abs(tilt)))}" fill="${GOLD}" stroke="${INK}" stroke-width="1.8" opacity="${f2(op)}"/>`+
  `<ellipse cx="${f1(p[0]-r*.2)}" cy="${f1(p[1]-r*.15*Math.abs(tilt))}" rx="${f1(r*.5)}" ry="${f1(r*.3*Math.abs(tilt))}" fill="#FFF0C2" opacity="${f2(op)}"/>`;}
const bz=(a,c,b,u)=>[(1-u)*(1-u)*a[0]+2*(1-u)*u*c[0]+u*u*b[0],(1-u)*(1-u)*a[1]+2*(1-u)*u*c[1]+u*u*b[1]];
function glint(p,a,s){if(a<0||a>.32)return '';const q=a/.32,r=(12+26*eout(q))*s,o=1-q;let g='';
  for(let k=0;k<8;k++){const an=k*45*RAD,l=k%2?r*.55:r;g+=`<line x1="${f1(p[0]+Math.cos(an)*l*.35)}" y1="${f1(p[1]+Math.sin(an)*l*.35)}" x2="${f1(p[0]+Math.cos(an)*l)}" y2="${f1(p[1]+Math.sin(an)*l)}" stroke="#FFF3C8" stroke-width="${f1(3.2*s)}" stroke-linecap="round" opacity="${f2(o)}"/>`;}
  return g+`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(7*s*(1-q*.5))}" fill="#FFF6D8" opacity="${f2(o)}"/>`;}
function youPose(t){const s=YOU.s;
  const hold={s,ra:[58,84],la:[150,232],tilt:-6,crouch:0,lean:-4};
  const wind={s,ra:[50,80],la:[100,70],tilt:-10,crouch:10,lean:4};
  const thr ={s,ra:[40,10],la:[212,226],tilt:-12,crouch:-4,lean:-14};
  const joy ={s,ra:[-58,-82],la:[238,262],tilt:8,crouch:-4,lean:0};
  const look={s,ra:[62,92],la:[118,88],tilt:-14,crouch:0,lean:-2,hdy:-4};
  const open={s,ra:[-4,-6],la:[184,186],tilt:4,crouch:-2,lean:0};
  let p=keys(t,[[0,hold],[.6,hold],[.78,wind],[.86,thr,eout],[1.25,thr],[1.6,mix(thr,joy,.3)],[1.72,joy,eout],[2.2,joy],[2.6,look],[3.30,look],[3.62,open,(u)=>oback(u,1.6)],[5.1,open]]);
  p=Object.assign({},p);p.breath=2.2*Math.sin(t*3.4);
  p.lift=(t<.8?6*hop(t,0):0)+(t>1.672&&t<2.5?16*hop(t,1.672)*(1-span(t,2.09,2.5)):0)+(t>3.5?3*hop(t,3.762):0);
  return p;}
function render(t){
  const c=cam(t),M={};for(const id in LAY){M[id]=lmat(c,LAY[id]);$('L'+id).style.transform=css(M[id]);}
  const pr=(p,z)=>app(lmat(c,{z}),p);
  // 你
  const P=Object.assign({x:YOU.x,y:YOU.y},youPose(t)),J=rig(P),u=120*P.s;
  let g=`<polygon points="${f1(YOU.x+u*.85)},${YOU.y} ${f1(YOU.x-u*.7)},${YOU.y} ${f1(YOU.x-u*2.4)},${f1(YOU.y+u*.22)} ${f1(YOU.x-u*1.7)},${f1(YOU.y+u*.27)}" fill="#6A5A4E" opacity=".3"/>`;
  g+=figure(J,u,{tilt:P.tilt});
  const hasCoin=t<.86;if(hasCoin){g+=coin([J.l_wrist[0]-4,J.l_wrist[1]-u*.1],9,.7,1);}
  $('you').innerHTML=g;
  const tip=app(M.you,headTop(J,u));bubble(t,tip,.04,tip[0]<1900&&tip[1]>40);
  // coins into the box, one per beat: (land time, start point, control, layer z)
  let o='';const H=HANDS;
  const drops=[[0,[H.man[0]-6,H.man[1]],[575,620],-.12],[.418,[H.girl[0]+4,H.girl[1]-6],[548,640],.12],[.836,[H.wom[0],H.wom[1]-4],[680,560],.53],[1.254,[H.man[0]-6,H.man[1]],[575,620],1.12]];
  for(const [tl,a,cp,ts] of drops){const u_=span(t,ts,tl);if(t>=ts&&t<tl){const q=bz(a,cp,SLOT,ein(u_,1.6));o+=coin(pr(q,1),9,Math.cos(u_*9),1);}o+=glint(pr([SLOT[0],SLOT[1]-6],1),t-tl,1);}
  // 你's toss: released at .86, lands in the slot on the bar (1.672)
  if(t>=.86&&t<BAR){const u_=span(t,.86,BAR),a=[J.l_wrist[0],J.l_wrist[1]];const q=bz([YOU.x-60,YOU.y-300],[880,330],SLOT,u_);o+=coin(pr(q,lerp(.95,1,u_)),10,Math.cos(u_*14),1);}
  o+=glint(pr([SLOT[0],SLOT[1]-6],1),t-BAR,1.6);
  // the worker flips his coin on every beat
  {const ph=((t+.209)/BEAT)%1,hgt=70*4*ph*(1-ph);o+=coin(pr([H.wrk[0]-6,H.wrk[1]-14-hgt],1),10,Math.cos(t*20),1);}
  // the stream of coins rising from the box to the summit, one per beat
  const p0=[564,612],p1=[610,380],p2=[1262,408];let trail='';
  for(let i=0;i<14;i++){const L0=.2+i*BEAT,u_=(t-L0)/3.144;if(u_<0)continue;
    if(u_>=1){o+=glint(pr([1300,300],6),t-(L0+3.144),1.2);continue;}
    const q=bz(p0,p1,p2,u_),z=1+5*Math.pow(u_,1.5);o+=coin(pr(q,z),(9-5.5*u_)*(lmat(c,{z})[0]),Math.cos(t*7+i),1-.35*u_);}
  const lead=cl((t-.2)/3.144);if(lead>0){let d='';for(let k=0;k<=40;k++){const u_=lead*k/40,q=pr(bz(p0,p1,p2,u_),1+5*Math.pow(u_,1.5));d+=(k?' L':'M')+f1(q[0])+','+f1(q[1]);}
    trail=`<path d="${d}" fill="none" stroke="${GOLD}" stroke-width="3" stroke-dasharray="6 9" opacity=".55"/>`;}
  $('ov').innerHTML=trail+o;
  // the box jumps when 你's coin lands; the 捐 badge pulses on every coin
  const kb=kick(t,BAR,.3);$('boxg').setAttribute('transform',`rotate(${f2(-3*kb*Math.sin((t-BAR)*40))} 560 930)`);
  let kp=0;for(const tl of [0,.418,.836,1.254])kp=Math.max(kp,kick(t,tl,.22));kp=Math.max(kp,1.5*kick(t,BAR,.3));
  $('badge').setAttribute('transform',`translate(468,600) scale(${f2(1+.18*kp)}) translate(-468,-600)`);
  // the statue glows when the coins arrive (3.344 and every beat after)
  let gl=0;for(let k=0;k<5;k++){const ta=3.344+k*BEAT;if(t>=ta)gl=Math.max(gl,(k?.55:.75)+.45*kick(t,ta,.35));}
  gl=Math.min(1,gl);$('halo').setAttribute('opacity',f2(gl));$('rays').setAttribute('opacity',f2(gl*.9));$('sglow').setAttribute('opacity',f2(gl*.85));
  $('rays').setAttribute('transform',`rotate(${f1(t*6)} 1332 300)`);
  // little life: tram creeps, glints twinkle, the derrick hook swings, palms sway
  $('tram').setAttribute('transform',`translate(${f1(-26*t)},0)`);
  for(const e of document.querySelectorAll('.glint'))e.setAttribute('opacity',f2(.35+.5*Math.abs(Math.sin(t*3+(+e.dataset.i)*1.7))));
  $('hook').setAttribute('transform',`rotate(${f1(6*Math.sin(t*2.4))} 1414 323)`);
  for(const e of document.querySelectorAll('.palm'))e.setAttribute('transform',`rotate(${f1(2.5*Math.sin(t*1.9+(+e.dataset.x)))} ${e.dataset.x} ${e.dataset.y})`);
}
window.DUR=5.016;window.render=render;$('bubw').innerHTML=BUBBLE;render(0);
'''


def christ_what():
    L, defs, hands = christ_what_layers()
    dd = (f'<svg width="0" height="0" style="position:absolute"><defs>{defs}'
          '<linearGradient id="yb" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8EC"/><stop offset=".55" stop-color="#F7EBDC"/><stop offset="1" stop-color="#CDB9A8"/></linearGradient>'
          '<filter id="yds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="-4" dy="7" stdDeviation="7" flood-color="#3A2A20" flood-opacity=".32"/></filter>'
          '<filter id="bds" x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".28"/></filter></defs></svg>')
    body = dd + ''.join(layer('L' + k, '\n'.join(v)) for k, v in L.items()) + layer('Lyou', '<g id="you"></g>')
    body += '<svg width="1920" height="1080" style="position:absolute;left:0;top:0"><g id="ov"></g><g id="bubw"></g></svg>'
    js = CW_JS.replace('__HANDS__', json.dumps({k: [round(v[0], 1), round(v[1], 1)] for k, v in hands.items()}))
    return page('christ what', 5.016, body, js)


# ============================================================================================ christ_when
def christ_when():
    art, anim = christ_art()
    eras = [(1930, 1945, '瓦加斯时代'), (1964, 1985, '军政府'), (1985, 2026, '新共和国'), (1889, 1930, '旧共和国')]
    return blueprint_when('christ', 1931, 6.6, (50, 10, 1, 10, 50), eras, art, label_post='年建成', art_anim_js=anim, title='christ when', cx=1350)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, 'christ_when.html'), 'w', encoding='utf-8').write(christ_when())
    open(os.path.join(out, 'christ_what.html'), 'w', encoding='utf-8').write(christ_what())
    print('ok', out)
