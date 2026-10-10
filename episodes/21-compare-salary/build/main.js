// ep21 《为什么一比，就觉得穷？》 v2 — 2D flat illustration in the 德国坦克 look: moonlit blue night scenes, a big moon, warm orange lamps and windows,
// coloured faceless cartoon figures, bold serif subtitles with gold keywords, a chapter line at the top, the title cast on a bronze plaque.
// Each scene has a backdrop (#back, under the canvas) and a foreground (#world, over the canvas). renderAt(T) is pure in T.
import {U} from './util.js';
const {cl,pr,eio,eo,sst,lerp,pop}=U;
const $=id=>document.getElementById(id);
const G='#F6CF78',BL='#a9c8ff',RED='#ff8a7a',OR='#ff9f43';
const fx=$('fx'),X=fx.getContext('2d',{willReadFrequently:true});
let seed=21;const rng=()=>(seed=(seed*16807)%2147483647)/2147483647;
const mk=s=>()=>(s=(s*16807)%2147483647)/2147483647;
const spot=(x,y,r,c='255,200,120',a=.2)=>`<div style="position:absolute;left:${x-r}px;top:${y-r}px;width:${2*r}px;height:${2*r}px;border-radius:50%;background:radial-gradient(circle,rgba(${c},${a}),rgba(${c},0) 65%)"></div>`;
const cone=(x,y,wt,wb,h,a,c='255,196,120')=>`<div style="position:absolute;left:${x-wb/2}px;top:${y}px;width:${wb}px;height:${h}px;clip-path:polygon(${50-wt/wb*50}% 0,${50+wt/wb*50}% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(${c},${a}),rgba(${c},${a*.25}) 70%,rgba(${c},0))"></div>`;
const note=(t,o=1)=>`<div class="src" style="opacity:${o}">${t}</div>`;
const big=(lab,val,unit,c,o=1,x=120,y=150)=>`<div style="position:absolute;left:${x}px;top:${y}px;opacity:${o}"><div class="lbl" style="position:static">${lab}</div><div class="t serif" style="position:static;font-size:128px;color:${c};line-height:1.1">${val}<span style="font-size:50px">${unit}</span></div></div>`;
const svg=(inner,st='')=>`<svg style="position:absolute;left:0;top:0;${st}" width="1920" height="1080" viewBox="0 0 1920 1080">${inner}</svg>`;
/* ---------- scenery pieces (SVG strings in 1920×1080 space) ---------- */
const STARS=(()=>{const r=mk(777);return Array.from({length:110},()=>[r()*1920,r()*620,r()*1.7+.7,r()]);})();
const stars=(T,a=1,ymax=620)=>STARS.filter(s=>s[1]<ymax).map(([x,y,r,p])=>`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#fff8e6" opacity="${(a*(.45+.45*Math.sin(T*1.3+p*20))).toFixed(2)}"/>`).join('');
function skyG(id,top='#24467f',mid='#3f6aaa',low='#90b0dc'){return `<linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".62" stop-color="${mid}"/><stop offset="1" stop-color="${low}"/></linearGradient>`;}
function moon(id,x,y,r,halo=1){return `<radialGradient id="mh${id}"><stop offset="0" stop-color="rgba(255,246,222,${.6*halo})"/><stop offset=".3" stop-color="rgba(255,240,210,${.22*halo})"/><stop offset="1" stop-color="rgba(255,240,210,0)"/></radialGradient>
 <circle cx="${x}" cy="${y}" r="${r*4.2}" fill="url(#mh${id})"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fff4d6"/><circle cx="${x-r*.3}" cy="${y-r*.2}" r="${r*.18}" fill="#efdfb8" opacity=".7"/><circle cx="${x+r*.35}" cy="${y+r*.25}" r="${r*.12}" fill="#efdfb8" opacity=".7"/><circle cx="${x+r*.1}" cy="${y-r*.45}" r="${r*.08}" fill="#efdfb8" opacity=".7"/>`;}
function hills(y,amp,f,ph,col){let d=`M0 1080 L0 ${y}`;for(let x=0;x<=1920;x+=32)d+=` L${x} ${(y-amp*(.5+.5*Math.sin(x*f+ph))*(.65+.35*Math.sin(x*f*2.7+ph*1.9))).toFixed(1)}`;return `<path d="${d} L1920 1080 Z" fill="${col}"/>`;}
function skyline(x0,x1,base,hmin,hmax,col,win,sd,wa=.85,cap=0){const r=mk(sd);let s='',x=x0;while(x<x1){const w=Math.min(50+r()*90,x1-x);const h=hmin+r()*(hmax-hmin);s+=`<rect x="${x.toFixed(0)}" y="${(base-h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h+cap).toFixed(0)}" fill="${col}"/>`;
 for(let yy=base-h+16;yy<base-18;yy+=28)for(let xx=x+10;xx<x+w-16;xx+=21)if(r()<.36)s+=`<rect x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="10" height="13" fill="${win}" opacity="${((.45+.55*r())*wa).toFixed(2)}"/>`;x+=w+5+r()*12;}return s;}
function trees(x0,x1,base,h,col,sd){const r=mk(sd);let s='';for(let x=x0;x<x1;x+=36+r()*40){const hh=h*(.6+.5*r()),rr=hh*.42;s+=`<rect x="${x-4}" y="${base-hh*.4}" width="8" height="${hh*.4}" fill="${col}"/><circle cx="${x}" cy="${base-hh*.62}" r="${rr}" fill="${col}"/><circle cx="${x-rr*.6}" cy="${base-hh*.45}" r="${rr*.75}" fill="${col}"/><circle cx="${x+rr*.6}" cy="${base-hh*.48}" r="${rr*.7}" fill="${col}"/>`;}return s;}
/* ---------- figures (faceless, flat colour) ---------- */
// front view, feet at (x,fy), height h
const person=(x,fy,h,{jk='#e9973a',pt='#2d3a5c',sk='#f1cfa6',hr='#2b2233',op=1,glow=''}={})=>{const s=h/100;return `<svg style="position:absolute;left:${x-30*s}px;top:${fy-104*s}px;overflow:visible;opacity:${op};${glow?`filter:drop-shadow(0 0 ${8*s}px ${glow})`:''}" width="${60*s}" height="${106*s}" viewBox="-30 -104 60 106">
 <ellipse cx="-6" cy="-1" rx="6.5" ry="2.6" fill="#1b2033"/><ellipse cx="6" cy="-1" rx="6.5" ry="2.6" fill="#1b2033"/>
 <rect x="-10" y="-46" width="8.6" height="45" rx="3" fill="${pt}"/><rect x="1.4" y="-46" width="8.6" height="45" rx="3" fill="${pt}"/>
 <path d="M-19 -72 Q-22 -60 -20 -48" stroke="${jk}" stroke-width="6.5" stroke-linecap="round" fill="none"/><path d="M19 -72 Q22 -60 20 -48" stroke="${jk}" stroke-width="6.5" stroke-linecap="round" fill="none"/>
 <path d="M-15 -44 L-15.5 -71 Q-15 -79 -8 -80 L8 -80 Q15 -79 15.5 -71 L15 -44 Z" fill="${jk}"/><path d="M-4 -80 L0 -73 L4 -80 Z" fill="rgba(255,255,255,.35)"/>
 <rect x="-3.2" y="-85" width="6.4" height="6" fill="${sk}"/><circle cx="0" cy="-92" r="10" fill="${sk}"/><path d="M-10.4 -91 Q-11 -103 0 -103 Q11 -103 10.4 -91 Q7 -96 0 -96.5 Q-7 -96 -10.4 -91 Z" fill="${hr}"/></svg>`;};
// seen from behind, seated on a chair; seat line at (x,y), s = scale (unit height ≈105)
const seated=(x,y,s,{jk='#f0a13c',hr='#2b2233',sk='#eec59c',ch='#26365e',rim='rgba(255,190,110,.55)'}={})=>`<svg style="position:absolute;left:${x-45*s}px;top:${y-110*s}px;overflow:visible;filter:drop-shadow(0 0 ${6*s}px ${rim})" width="${90*s}" height="${112*s}" viewBox="-45 -110 90 112">
 <path d="M-31 -40 Q-32 -63 -14 -67 L14 -67 Q32 -63 31 -40 L29 2 L-29 2 Z" fill="${jk}"/><path d="M-31 -40 Q-32 -63 -14 -67 L-8 -67 Q-24 -60 -24 -40 L-24 2 L-29 2 Z" fill="rgba(0,0,0,.12)"/>
 <rect x="-5" y="-76" width="10" height="11" fill="${sk}"/><circle cx="-16.5" cy="-86" r="3.8" fill="${sk}"/><circle cx="16.5" cy="-86" r="3.8" fill="${sk}"/><circle cx="0" cy="-88" r="17" fill="${hr}"/>
 <rect x="-36" y="-30" width="72" height="34" rx="7" fill="${ch}"/><rect x="-36" y="-30" width="72" height="5" rx="2.5" fill="rgba(255,255,255,.12)"/></svg>`;
// capuchin, flat colour, no facial features; facing right, flip with sx=-1
const monkey=(x,fy,s,sx=1,rim='')=>{const B='#8b5a36',L='#c08a5c',F='#f0d0a4',C='#3d2616';return `<svg style="position:absolute;left:${x-120*s}px;top:${fy-230*s}px;overflow:visible;transform:scaleX(${sx});${rim?`filter:drop-shadow(0 0 12px ${rim})`:''}" width="${240*s}" height="${240*s}" viewBox="-120 -230 240 240">
 <path d="M-40 -10 C -110 -10 -120 -110 -70 -120 C -40 -126 -50 -80 -78 -88" fill="none" stroke="${B}" stroke-width="12" stroke-linecap="round"/>
 <ellipse cx="0" cy="-60" rx="52" ry="62" fill="${B}"/><ellipse cx="10" cy="-56" rx="30" ry="42" fill="${L}"/>
 <circle cx="-14" cy="-176" r="12" fill="${L}"/><circle cx="50" cy="-174" r="12" fill="${L}"/><circle cx="18" cy="-150" r="40" fill="${B}"/><ellipse cx="26" cy="-140" rx="27" ry="25" fill="${F}"/><path d="M-21 -158 Q-14 -194 22 -191 Q56 -188 57 -158 Q40 -172 18 -172 Q-4 -172 -21 -158 Z" fill="${C}"/>
 <path d="M30 -88 Q 70 -70 78 -40" stroke="${B}" stroke-width="18" stroke-linecap="round" fill="none"/><path d="M-26 -10 L -30 0 M 22 -10 L 26 0" stroke="${B}" stroke-width="18" stroke-linecap="round"/></svg>`;};
const cucumber=(x,y,s=1,o=1)=>`<svg style="position:absolute;left:${x-30*s}px;top:${y-30*s}px;opacity:${o};overflow:visible;filter:drop-shadow(0 4px 6px rgba(10,20,45,.4))" width="${60*s}" height="${60*s}" viewBox="-30 -30 60 60"><circle r="26" fill="#3f7a2c"/><circle r="21" fill="#d6ecb0"/><g fill="#8fb870">${[0,1,2,3,4,5].map(i=>`<ellipse cx="${Math.cos(i*1.05)*9}" cy="${Math.sin(i*1.05)*9}" rx="2.4" ry="4" transform="rotate(${i*60} ${Math.cos(i*1.05)*9} ${Math.sin(i*1.05)*9})"/>`).join('')}</g></svg>`;
const grape=(x,y,s=1,o=1)=>`<svg style="position:absolute;left:${x-30*s}px;top:${y-30*s}px;opacity:${o};overflow:visible;filter:drop-shadow(0 0 ${14*s}px rgba(210,150,255,.85))" width="${60*s}" height="${60*s}" viewBox="-30 -30 60 60"><defs><radialGradient id="gq" cx="35%" cy="30%"><stop offset="0" stop-color="#f0d8ff"/><stop offset=".35" stop-color="#9a5cc8"/><stop offset="1" stop-color="#4a2068"/></radialGradient></defs><circle r="24" fill="url(#gq)"/><path d="M0 -24 q 4 -10 12 -12" stroke="#6a8a3a" stroke-width="3" fill="none"/></svg>`;
const token=(x,y,o=1)=>`<div style="position:absolute;left:${x-20}px;top:${y-16}px;width:40px;height:32px;border-radius:45% 55% 50% 50%;background:radial-gradient(circle at 35% 30%,#e3e6ec,#7d8390);box-shadow:0 3px 6px rgba(10,20,45,.4);opacity:${o}"></div>`;
function coins(cx,base,n,w,c1='#ffe7a0',c2='#c8963e',a=1,gap=9){X.globalAlpha=a;for(let k=0;k<n;k++){const y=base-k*gap;X.fillStyle=c2;X.beginPath();X.ellipse(cx,y+3,w,w*.28,0,0,7);X.fill();const g=X.createLinearGradient(cx-w,0,cx+w,0);g.addColorStop(0,c2);g.addColorStop(.45,c1);g.addColorStop(1,c2);X.fillStyle=g;X.beginPath();X.ellipse(cx,y,w,w*.28,0,0,7);X.fill();}}
function dot(x,y,r,c,a=1,glow=10){X.globalAlpha=a;X.shadowBlur=glow;X.shadowColor=c;X.fillStyle=c;X.beginPath();X.arc(x,y,r,0,7);X.fill();X.shadowBlur=0;}
const phone=(x,y,s,{title,amount,sub,col=G,dim=0,glow=.5})=>`<div style="position:absolute;left:${x-150*s}px;top:${y-300*s}px;width:${300*s}px;height:${600*s}px;border-radius:${44*s}px;background:linear-gradient(160deg,#3a4664,#1a2135);border:${2*s}px solid rgba(255,255,255,.22);box-shadow:0 30px 60px rgba(8,16,40,.5),0 0 ${90*glow}px rgba(255,200,120,${.45*glow});padding:${12*s}px">
 <div style="width:100%;height:100%;border-radius:${34*s}px;background:linear-gradient(180deg,#34508a,#1b2c55);position:relative;overflow:hidden">
 <div style="position:absolute;left:${110*s}px;top:${14*s}px;width:${56*s}px;height:${12*s}px;border-radius:${6*s}px;background:#121a2e"></div>
 <div style="position:absolute;left:${18*s}px;right:${18*s}px;top:${170*s}px;border-radius:${24*s}px;background:rgba(255,255,255,.14);padding:${22*s}px ${22*s}px">
  <div style="font-size:${20*s}px;color:#d3dcf0;font-weight:700">${title}</div><div style="font-family:'Noto Serif CJK SC';font-size:${58*s}px;font-weight:700;color:${col};margin-top:${8*s}px;white-space:nowrap">${amount}</div><div style="font-size:${20*s}px;color:#eef2fb;font-weight:700;margin-top:${6*s}px;min-height:${26*s}px">${sub}</div></div>
 <div style="position:absolute;inset:0;background:rgba(10,16,34,${dim})"></div></div></div>`;
/* ---------------- scenes ---------------- */
// S0 hook 0–20.8: a dorm room at night, the two of you at your desks seen from behind, a big moon in the window
const DORM_WIN=`<defs>${skyG('dw','#26508f','#4a78b8','#94b6e2')}<clipPath id="cw"><rect x="700" y="80" width="520" height="440"/></clipPath></defs><g clip-path="url(#cw)"><rect x="700" y="80" width="520" height="440" fill="url(#skdw)"/>${moon('dw',1110,190,50)}${skyline(690,1230,520,60,210,'#2d4c82','#ffc46b',31)}</g>`;
const BOOKS=(()=>{const r=mk(5);let s='';for(const sy of [300,440]){let x=110;while(x<420){const w=16+r()*20,h=60+r()*46;s+=`<rect x="${x}" y="${sy-h}" width="${w}" height="${h}" rx="2" fill="${['#c96a4a','#5aa39a','#d9a548','#7a8fd0','#b06a9a','#e0d2b0'][Math.floor(r()*6)]}"/>`;x+=w+3;}s+=`<rect x="96" y="${sy}" width="340" height="12" fill="#2a4373"/>`;}return s;})();
function HOOKb(T){const dim=pr(T,12.5,13.8);return svg(`<defs><linearGradient id="wall0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f73ad"/><stop offset="1" stop-color="#36578f"/></linearGradient></defs>
 <rect width="1920" height="1080" fill="url(#wall0)"/>${DORM_WIN}${stars(T,.8,520).replace(/<circle/g,'<circle clip-path="url(#cw)"')}
 <rect x="700" y="80" width="520" height="440" fill="none" stroke="#223a66" stroke-width="18"/><path d="M960 80 V520 M700 300 H1220" stroke="#223a66" stroke-width="10"/>
 <path d="M630 60 Q660 300 640 600 L700 600 L700 60 Z" fill="#7393ca"/><path d="M1290 60 Q1260 300 1280 600 L1220 600 L1220 60 Z" fill="#7393ca"/><rect x="610" y="48" width="700" height="14" rx="7" fill="#223a66"/>
 <path d="M720 520 L1200 520 L1350 770 L560 770 Z" fill="rgba(210,228,255,.10)"/>
 ${BOOKS}<rect x="1480" y="180" width="230" height="300" rx="6" fill="#e9dcc0"/><rect x="1496" y="196" width="198" height="268" fill="#5a86c4"/><circle cx="1640" cy="260" r="30" fill="#ffd27a"/><path d="M1496 464 L1560 360 L1610 420 L1650 380 L1694 464 Z" fill="#2f5a92"/>
 <rect x="0" y="770" width="1920" height="26" fill="#9a7352"/><rect x="0" y="796" width="1920" height="284" fill="#6e4e38"/><rect x="0" y="770" width="1920" height="4" fill="rgba(255,230,190,.35)"/>`)
 +spot(360,690,lerp(330,180,dim),'255,170,80',lerp(.55,.18,dim))+spot(1580,690,330,'255,170,80',.5)
 +cone(375,640,70,360,140,lerp(.42,.08,dim))+cone(1565,640,70,360,140,.42)
 +svg(`<ellipse cx="330" cy="772" rx="46" ry="9" fill="#2a3557"/><path d="M330 770 L352 650" stroke="#2a3557" stroke-width="9"/><path d="M322 640 L420 640 L400 594 L344 594 Z" fill="${OR}" opacity="${lerp(1,.55,dim)}"/>
 <ellipse cx="1610" cy="772" rx="46" ry="9" fill="#2a3557"/><path d="M1610 770 L1588 650" stroke="#2a3557" stroke-width="9"/><path d="M1520 640 L1618 640 L1596 594 L1540 594 Z" fill="${OR}"/>
 <rect x="470" y="740" width="110" height="30" rx="3" fill="#d9a548"/><rect x="480" y="718" width="96" height="24" rx="3" fill="#5aa39a"/><rect x="1400" y="726" width="40" height="44" rx="8" fill="#e9dcc0"/><path d="M1440 736 q18 4 0 22" stroke="#e9dcc0" stroke-width="6" fill="none"/>`);}
function HOOK(T,o){const day=T<4.4?0:Math.min(3,1+Math.floor((T-4.4)/1.3));const in2=eio(pr(T,8.4,9.8));const dim=.6*pr(T,12.5,13.8);
 const x1=lerp(960,700,in2);
 return `${seated(700,1090,4.2,{jk:'#f0a13c',rim:`rgba(255,190,110,${.6*(1-dim)})`})}${seated(1240,1090,4.2,{jk:'#7f9fd8',hr:'#3a2a24',rim:'rgba(255,190,110,.5)'})}
 ${phone(x1,360,.82,{title:'实习工资 · 到账',amount:'¥4,000',sub:day?`开心的第 ${day} 天`:'刚刚',dim,glow:1-dim})}
 ${in2>0?`<div style="opacity:${in2}">${phone(lerp(1650,1220,in2),360,.82,{title:'室友的实习工资',amount:'¥6,000',sub:'',col:'#fff',glow:.7})}</div>`:''}
 <div class="t" style="left:700px;top:620px;transform:translateX(-50%);font-size:28px;color:#ffe3b0;opacity:${pr(T,9.6,10.1)*(1-pr(T,16.2,16.6))}">你</div><div class="t" style="left:1240px;top:620px;transform:translateX(-50%);font-size:28px;color:#dfe9ff;opacity:${pr(T,9.6,10.1)*(1-pr(T,16.2,16.6))}">室友</div>`;}
// S1 monkeys 20.6–49.0: a lab room at night, two glass enclosures under warm lamps, a big window onto moonlit trees
function MONKb(T){return svg(`<defs><linearGradient id="wall1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a7cb4"/><stop offset="1" stop-color="#3f6098"/></linearGradient>${skyG('mw','#25508f','#4877b8','#9cbce6')}<clipPath id="cm"><rect x="160" y="70" width="1600" height="540"/></clipPath></defs>
 <rect width="1920" height="1080" fill="url(#wall1)"/><g clip-path="url(#cm)"><rect x="160" y="70" width="1600" height="540" fill="url(#skmw)"/>${stars(T,.8,400)}${moon('mw',960,170,48)}
 ${hills(560,90,.006,1.3,'#3d66a2')}${trees(160,1760,612,190,'#2f5590',11)}${trees(150,1770,620,120,'#244678',12)}</g>
 <rect x="160" y="70" width="1600" height="540" fill="none" stroke="#2a4677" stroke-width="16"/>${[480,800,1120,1440].map(x=>`<rect x="${x-7}" y="70" width="14" height="540" fill="#2a4677"/>`).join('')}<rect x="140" y="606" width="1640" height="18" rx="4" fill="#2a4677"/>
 <rect x="0" y="740" width="1920" height="340" fill="#33528a"/><rect x="0" y="740" width="1920" height="6" fill="rgba(220,235,255,.25)"/>${[800,860,930,1010].map((y,i)=>`<rect x="0" y="${y}" width="1920" height="2" fill="rgba(220,235,255,${.10-.02*i})"/>`).join('')}`);}
function MONK(T,o){const ph=T<32.8?0:(T<40.9?1:2);const refuse=pr(T,36.8,37.8);
 const cyc=((T-24.7+20)%2.2)/2.2;const out=eio(cl(cyc/.35)),inn=eio(cl((cyc-.42)/.35));
 const Ax=640,Bx=1280,fy=720;
 const box=(x,lit)=>`<div style="position:absolute;left:${x-280}px;top:270px;width:560px;height:470px;border:3px solid rgba(230,240,255,.65);border-radius:10px;background:linear-gradient(180deg,rgba(200,222,255,.16),rgba(200,222,255,.08));box-shadow:0 20px 50px rgba(10,20,45,.35)"></div>
  <div style="position:absolute;left:${x-120}px;top:270px;width:240px;height:16px;border-radius:0 0 10px 10px;background:#2a3557"></div><div style="position:absolute;left:${x-80}px;top:284px;width:160px;height:8px;border-radius:4px;background:#ffd48a;box-shadow:0 0 24px #ffc070"></div>
  ${cone(x,292,150,540,446,lit)}<div style="position:absolute;left:${x-250}px;top:290px;width:60px;height:420px;background:linear-gradient(100deg,rgba(255,255,255,.16),rgba(255,255,255,0));transform:skewX(-8deg)"></div>`;
 let h=box(Ax,.34*(1-.45*refuse))+box(Bx,ph?.42:.34);
 const tAx=Ax+70,tAy=lerp(600,800,out);const tBx=Bx-70,tBy=lerp(600,800,out);
 h+=monkey(Ax-50,fy,1.5,refuse>.5?-1:1,refuse>.5?'':'rgba(255,200,120,.55)')+monkey(Bx+50,fy,1.5,-1,'rgba(255,200,120,.6)');
 if(T>24.7){if(!(refuse>0&&ph>0))h+=token(tAx,tAy,1-inn);if(ph<2)h+=token(tBx,tBy,1-inn);
  const rAx=Ax+70,rAy=lerp(820,600,refuse>0?0:inn);h+=cucumber(refuse>0?Ax+150+60*refuse:rAx,refuse>0?800:rAy,1.9,refuse>0?1-.4*refuse:inn);
  const rBy=lerp(820,600,inn);h+=ph===0?cucumber(Bx-80,rBy,1.9,inn):grape(Bx-80,rBy,1.8,inn);}
 const v=T<36.8?95:(T<40.9?Math.round(lerp(95,60,eo(pr(T,36.9,38.2)))):Math.round(lerp(60,20,eo(pr(T,41.0,42.4)))));
 h+=`<div class="t" style="left:${Ax}px;top:218px;transform:translateX(-50%);font-size:34px;color:#d8f2b4;opacity:${pr(T,25,25.5)}">这只：黄瓜</div>
 <div class="t" style="left:${Bx}px;top:218px;transform:translateX(-50%);font-size:34px;color:${ph?'#ecd0ff':'#d8f2b4'};opacity:${pr(T,25,25.5)}">旁边：${ph===0?'黄瓜':(ph===1?'葡萄（同样干活）':'葡萄（什么都不干）')}</div>
 ${big('愿意完成交换',v,'%',v<90?RED:G,pr(T,28.7,29.1),70,330)}${note('Brosnan &amp; de Waal (2003) Nature · 卷尾猴 · 用小石子换食物',pr(T,25,25.5))}`;
 return h;}
// S2 two worlds 48.9–73.4: two towns under one moon — a small town (A) and a big city (B)
const TOWN_A=(()=>{const r=mk(41);let s='';[[300,110],[380,150],[470,120],[560,170],[650,130],[740,115]].forEach(([x,hh],i)=>{const w=78;s+=`<rect x="${x}" y="${716-hh}" width="${w}" height="${hh}" fill="${i%2?'#3a5f9a':'#33568f'}"/><path d="M${x-8} ${716-hh} L${x+w/2} ${716-hh-44} L${x+w+8} ${716-hh} Z" fill="#26467b"/>`;for(let yy=716-hh+20;yy<700;yy+=36)for(const xx of [x+14,x+46])if(r()<.7)s+=`<rect x="${xx}" y="${yy}" width="18" height="20" fill="#ffc46b" opacity="${(.6+.4*r()).toFixed(2)}"/>`;});return s;})();
function WORLDSb(T){return svg(`<defs>${skyG('w2','#24467f','#3f6aaa','#9cbce6')}</defs><rect width="1920" height="1080" fill="url(#skw2)"/>${stars(T,1,520)}${moon('w2',960,190,62)}
 ${hills(640,110,.004,.4,'#5277b3')}${hills(690,70,.007,2.1,'#46699f')}${TOWN_A}${skyline(1110,1640,716,140,380,'#2f5290','#ffc46b',52)}
 <rect x="0" y="716" width="1920" height="364" fill="#3a5e98"/><rect x="0" y="716" width="1920" height="5" fill="rgba(220,235,255,.3)"/><path d="M0 780 Q960 760 1920 790 L1920 1080 L0 1080 Z" fill="#33558d"/>`);}
const WAL=Array.from({length:257},(_,i)=>({x0:200+rng()*1520,y0:930+rng()*60,a:rng()*6.28,r:Math.sqrt(rng()),d:rng(),A:i<123,A2:i<39}));
function WORLDS(T,o){const Ax=560,Bx=1360,base=700;const ga=eo(pr(T,53.1,54.8)),gb=eo(pr(T,57.1,59.6));const vac=T>65.2,m=eio(pr(T,65.2,66.2));
 let h=spot(Ax,560,380,'255,210,140',.16)+spot(Bx,520,420,'255,210,140',.16);
 if(m<1){coins(Ax-70,base,Math.round(20*ga),52,'#ffe7a0','#c8963e',o*(1-m),11);coins(Ax+80,base,Math.round(10*ga),52,'#eef1f6','#8a90a0',o*(1-m),11);
  coins(Bx-70,base,Math.round(40*gb),52,'#ffe7a0','#c8963e',o*(1-m),11);coins(Bx+80,base,Math.round(80*gb),52,'#eef1f6','#8a90a0',o*(1-m)*1,6.6);}
 if(vac){const tile=(x,n,c)=>{for(let k=0;k<Math.round(n*m);k++){X.globalAlpha=o*.95;X.fillStyle=c;X.shadowBlur=12;X.shadowColor=c;X.fillRect(x-48,base-8-k*16,96,11);X.shadowBlur=0;}};tile(Ax-70,10,'#bfe3ff');tile(Ax+80,5,'#8095bd');tile(Bx-70,20,'#bfe3ff');tile(Bx+80,40,'#8095bd');}
 const w1=pr(T,61.1,62.6),w2=pr(T,65.8,68.6);WAL.forEach(w=>{const g1=eio(cl((w1-w.d*.4)/.6)),g2=eio(cl((w2-w.d*.4)/.6));const tx1=(w.A?Ax:Bx)+Math.cos(w.a)*w.r*230,ty1=800+Math.sin(w.a)*w.r*24;const tx2=(w.A2?Ax:Bx)+Math.cos(w.a)*w.r*230;
  const x=lerp(lerp(w.x0,tx1,g1),tx2,g2),y=lerp(lerp(w.y0,ty1,g1),ty1,g2);if(T>60.9)dot(x,y,4.5,vac?'#cfeaff':'#fff3d6',o,6);});
 const lab=(x,y,t,c,op)=>`<div class="t" style="left:${x}px;top:${y}px;transform:translateX(-50%);font-size:30px;color:${c};opacity:${op}">${t}</div>`;
 if(!vac){h+=lab(Ax-70,base-20*11*ga-70,'你 5万',G,ga)+lab(Ax+80,base-10*11*ga-70,'别人 2.5万','#eef1f6',ga)+lab(Bx-70,base-40*11*gb-70,'你 10万',G,gb)+lab(Bx+80,base-80*6.6*gb-70,'别人 20万','#eef1f6',gb);}
 else h+=lab(Ax,base-260,'你的假期，比别人多','#cfeaff',pr(T,66,66.5))+lab(Bx,base-560,'你的假期更多，但别人更多','#cfeaff',pr(T,66,66.5));
 h+=`<div class="t serif" style="left:${Ax}px;top:${base+26}px;transform:translateX(-50%);font-size:54px;color:#fff">A</div><div class="t serif" style="left:${Bx}px;top:${base+26}px;transform:translateX(-50%);font-size:54px;color:#fff">B</div>`;
 const pa=T<65.2?Math.round(48*eo(pr(T,61.2,62.4))):Math.round(lerp(48,15,eo(pr(T,65.9,68.6))));
 h+=big(vac?'换成假期 · 选 A 的人':'选 A 的人',pa,'%',vac?'#cfeaff':G,pr(T,61.3,61.7))+(vac?`<div class="t" style="left:120px;top:330px;font-size:34px;color:#fff;opacity:${pr(T,68.4,68.9)}">85% 只要自己的假期更多</div>`:'');
 h+=`<div class="t" style="left:960px;top:96px;transform:translateX(-50%);font-size:32px;color:#fbecc8;letter-spacing:4px;opacity:${pr(T,49.2,49.7)*(1-pr(T,61.0,61.4))}">物价完全一样 · 你想住在哪个世界？</div>`+note('Solnick &amp; Hemenway (1998) · 哈佛公共卫生学院 257 人 · 塔高按比例',pr(T,49.2,49.7));
 return h;}
// S3 the pay wall 73.2–97.7: a campus hall at night; the salary list as a cream newspaper page; staff on the plaza
const HALL=(()=>{const r=mk(63);let s=`<rect x="140" y="360" width="1640" height="440" fill="#4b6ea8"/><path d="M110 360 L960 210 L1810 360 Z" fill="#3c5d95"/><path d="M200 350 L960 228 L1720 350 Z" fill="#5679b2"/><rect x="110" y="352" width="1700" height="16" fill="#6b8cc2"/>`;
 for(let x=180;x<1760;x+=110){s+=`<rect x="${x}" y="380" width="34" height="420" fill="#6688c0"/><rect x="${x-6}" y="376" width="46" height="10" fill="#7898cc"/>`;if(x+52<1760)for(const y of [420,540,660])s+=`<rect x="${x+46}" y="${y}" width="50" height="80" rx="4" fill="#ffc46b" opacity="${(.35+.6*r()).toFixed(2)}"/>`;}
 return s+`<rect x="100" y="790" width="1720" height="18" fill="#6b8cc2"/>`;})();
function WALLb(T){return svg(`<defs>${skyG('w3','#22437b','#3a64a4','#88a9d8')}</defs><rect width="1920" height="1080" fill="url(#skw3)"/>${stars(T,1,330)}${moon('w3',1720,130,52)}
 ${trees(0,160,800,330,'#2a4c86',71)}${trees(1770,1920,800,330,'#2a4c86',72)}${HALL}<rect x="0" y="800" width="1920" height="280" fill="#3d609a"/><rect x="0" y="800" width="1920" height="5" fill="rgba(220,235,255,.3)"/>
 ${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<path d="M${i*180-60} 1080 L${i*180+40} 805" stroke="rgba(220,235,255,.10)" stroke-width="3"/>`).join('')}
 <rect x="1640" y="590" width="110" height="210" rx="6" fill="#2b4677"/>`);}
const BARS=Array.from({length:24},(_,i)=>({w:lerp(860,200,Math.pow(i/23,.8))*(.92+.16*rng())}));
const STAFF=Array.from({length:12},(_,i)=>({below:i>=6,x:(i>=6?1030:400)+(i%6)*82+(rng()-.5)*14,ph:rng()}));
const JK_UP=['#e9973a','#d9765a','#e8b44a','#c9824a','#f0a860','#d98f3a'],JK_LO=['#7f9fd8','#6a8ccc','#93a9d9','#5f86c6','#8aa0d0','#7090cc'];
function WALL(T,o){const on=pr(T,73.6,75.4),hit=pr(T,81.4,82.6),job=eio(pr(T,85.5,87.6)),look=pr(T,89.6,90.2)*(1-pr(T,93.2,93.6));
 const px=560,py=140,pw=800,ph=520;let rows='';BARS.forEach((b,i)=>{const a=cl(on*30-i);const below=i>=12;const c=below&&hit>0?`rgb(${Math.round(lerp(217,84,hit))},${Math.round(lerp(135,124,hit))},${Math.round(lerp(43,196,hit))})`:'#d9872b';
  rows+=`<div style="position:absolute;left:${px+150}px;top:${py+70+i*18}px;width:${b.w*.62*a}px;height:10px;border-radius:5px;background:${c}"></div><div style="position:absolute;left:${px+30}px;top:${py+70+i*18}px;width:96px;height:10px;border-radius:5px;background:rgba(30,45,80,.22);opacity:${a}"></div>`;});
 const sc=pr(T,77.3,81.0);const scanY=py+66+((sc*3)%1)*24*18;const medY=py+70+11.5*18+4;
 let h=`<div style="position:absolute;left:${px}px;top:${py}px;width:${pw}px;height:${ph}px;border-radius:10px;background:#f4ecd8;border:3px solid #cdb68a;box-shadow:0 30px 70px rgba(10,20,45,.45);opacity:${pr(T,73.3,73.9)}">
  <div style="position:absolute;left:30px;top:20px;font-size:28px;font-weight:900;color:#1d2c4f;font-family:'Noto Serif CJK SC'">加州大学 · 员工工资 · 全部可查</div><div style="position:absolute;right:30px;top:24px;font-size:20px;color:#6a6250;font-weight:700">2008 · 报纸网站</div><div style="position:absolute;left:30px;right:30px;top:62px;height:2px;background:#1d2c4f;opacity:.5"></div></div>${rows}
  ${sc>0&&sc<1?`<div style="position:absolute;left:${px+20}px;top:${scanY}px;width:${pw-40}px;height:20px;border-radius:6px;background:rgba(255,170,60,.28)"></div><div style="position:absolute;left:${px+pw-90}px;top:${scanY-8}px;width:30px;height:30px;border-radius:50%;border:4px solid #e0782a"></div>`:''}
  <div style="position:absolute;left:${px+20}px;top:${medY}px;width:${pw-40}px;border-top:3px dashed rgba(29,44,79,${.8*pr(T,79.6,80.4)})"></div><div class="t" style="left:${px+pw+16}px;top:${medY-20}px;font-size:28px;color:#fff;opacity:${pr(T,79.6,80.4)}">中位数</div>`;
 const fy=830;STAFF.forEach((s,i)=>{const d=s.below?hit:0;const x=s.x+(s.below?job*(120+s.ph*80):0);const c=s.below?`rgba(${Math.round(lerp(255,150,d))},${Math.round(lerp(210,190,d))},${Math.round(lerp(150,255,d))},${lerp(.45,.4,d)})`:`rgba(255,205,130,${.45+.3*look*Math.abs(Math.sin(T*6))})`;
  h+=`<div style="position:absolute;left:${x-60}px;top:${fy-170}px;width:120px;height:170px;border-radius:50%;background:radial-gradient(circle,${c},transparent 70%)"></div>`+person(x,fy,150,{jk:s.below?JK_LO[i%6]:JK_UP[i%6],pt:s.below?'#2a3a62':'#33405f',hr:i%3?'#2b2233':'#4a3426'});});
 h+=`<div style="position:absolute;left:1650px;top:600px;width:90px;height:200px;border-radius:4px;background:linear-gradient(180deg,#e4f3ff,#9fd0ff);box-shadow:0 0 70px rgba(159,208,255,.8);opacity:${pr(T,85.4,86.2)}"></div><div class="t" style="left:1695px;top:548px;transform:translateX(-50%);font-size:30px;color:#dff0ff;opacity:${pr(T,85.6,86.2)}">找新工作</div>
  <div class="t" style="left:624px;top:${fy+14}px;transform:translateX(-50%);font-size:28px;color:${G};opacity:${pr(T,81.6,82.2)}">高于中位数</div><div class="t" style="left:1244px;top:${fy+14}px;transform:translateX(-50%);font-size:28px;color:${BL};opacity:${pr(T,81.6,82.2)}">低于中位数</div>
  ${note('Card, Mas, Moretti &amp; Saez (2012) American Economic Review · 名单为示意',pr(T,73.6,74.1))}`;
 return h;}
// S4 the street 97.6–105.8: a moonlit street; the neighbours' houses grow taller and brighter, yours stays the same and dims
function STREETb(T){return svg(`<defs>${skyG('w4','#22437b','#3d68a8','#94b4e0')}</defs><rect width="1920" height="1080" fill="url(#skw4)"/>${stars(T,1,420)}${moon('w4',300,170,66)}
 ${hills(620,90,.005,2.6,'#4d72ae')}${trees(0,1920,700,150,'#3a5f9a',91)}<rect x="0" y="760" width="1920" height="46" fill="#5a7cb4"/><rect x="0" y="806" width="1920" height="274" fill="#30508a"/>
 ${[0,1,2,3,4,5,6,7,8].map(i=>`<rect x="${i*240+40}" y="930" width="120" height="10" rx="5" fill="rgba(230,240,255,.45)"/>`).join('')}`);}
const HOUSES=[[190,'#8fa9d6',1.6],[440,'#b9a6d2',2.4],[690,'#9cc0b4',1.8],[1230,'#c9b48e',2.2],[1480,'#93acd8',1.5],[1730,'#b6a2c8',2.6]];
const house=(x,fy,w,fl,wall,roof,win,glow=0)=>{const fh=86,H=fh*fl+40;let s=`<rect x="${x-w/2}" y="${fy-H}" width="${w}" height="${H}" fill="${wall}"/><path d="M${x-w/2-14} ${fy-H} L${x} ${fy-H-70} L${x+w/2+14} ${fy-H} Z" fill="${roof}"/>`;
 for(let k=0;k<Math.ceil(fl);k++){const y=fy-40-fh*(k+1)+24;const a=cl((fl-k-.55)/.45);for(const dx of [-w*.25,w*.25])s+=`<rect x="${x+dx-20}" y="${y}" width="40" height="44" rx="3" fill="#ffc46b" opacity="${(win*a).toFixed(2)}"/>`;}
 return s+`<rect x="${x-18}" y="${fy-40}" width="36" height="40" fill="${roof}"/>`;};
function STREET(T,o){const up=eo(pr(T,97.9,101.2)),me=pr(T,101.6,102.4);const fy=780;let h='';
 const mine=960;let s='';HOUSES.forEach(([x,c,g])=>{const fl=1+(g-1)*up+ .0;h+=spot(x,fy-140,220,'255,200,120',.10+.12*up);s+=house(x,fy,170,lerp(1,g,up),c,'#2c4672',.45+.5*up);});
 h+=svg(s);
 h+=`${spot(mine,fy-130,lerp(280,170,me),'255,205,130',lerp(.38,.12,me))}<svg style="position:absolute;left:0;top:0;filter:drop-shadow(0 0 ${lerp(20,4,me)}px rgba(255,200,120,.8))" width="1920" height="1080" viewBox="0 0 1920 1080">${house(mine,fy,220,1,'#e8c98e','#7a4a28',lerp(.95,.4,me))}</svg>
 <div class="t" style="left:${mine}px;top:${fy+16}px;transform:translateX(-50%);font-size:32px;color:${G}">你 · 收入不变</div><div class="t" style="left:440px;top:${fy+16}px;transform:translateX(-50%);font-size:30px;color:#fff1d0;opacity:${pr(T,98.6,99.1)}">邻居 · 挣得越来越多 ↑</div>
 <div class="t" style="left:${mine}px;top:${fy-360}px;transform:translateX(-50%);font-size:36px;color:#fff;opacity:${me}">你的快乐 ↓</div>${note('Luttmer (2005) Quarterly Journal of Economics · 已控制本人收入 · 示意',pr(T,98,98.5))}`;
 return h;}
// S5 ending 105.7–125.4: on the rooftop under a huge moon; the phone floats against it
function ENDb(T){return svg(`<defs>${skyG('w5','#1f4079','#3a66a8','#8fb0dc')}</defs><rect width="1920" height="1080" fill="url(#skw5)"/>${stars(T,1,600)}${moon('w5',960,440,250,1.1)}
 ${skyline(0,1920,900,70,280,'#2c4c84','#ffc46b',95)}<rect x="0" y="900" width="1920" height="180" fill="#3b5a90"/><rect x="0" y="900" width="1920" height="8" fill="#6b8cc2"/>`);}
function END(T,o){const g=pr(T,109.9,110.6)*(1-pr(T,113.6,114.2));const ch=pr(T,113.9,114.5)*(1-pr(T,117.6,118.1));const last=pr(T,117.8,118.4);
 let h=seated(1640,905,1.6,{jk:'#f0a13c',ch:'rgba(0,0,0,0)',rim:'rgba(255,240,210,.5)'});
 const sub=last>0?'去年这时候：¥0':'';h+=phone(960,470,1.0,{title:last>0?'跟去年的自己比':'实习工资 · 到账',amount:last>0?'+¥4,000':'¥4,000',sub,dim:.3*(1-last)*(1-ch),glow:.4+.6*last});
 if(g>0)h+=grape(1150,640,1.6,g);
 if(ch>0)h+=`<div style="opacity:${ch}"><div style="position:absolute;left:330px;top:400px;width:310px;padding:22px 26px;border-radius:20px;background:rgba(18,32,66,.72);border:2px solid rgba(255,255,255,.3)"><div style="font-size:24px;color:#d3dcf0;font-weight:700">跟室友比</div><div class="serif" style="font-size:54px;color:${RED}">−¥2,000</div></div>
  <div style="position:absolute;left:1280px;top:400px;width:310px;padding:22px 26px;border-radius:20px;background:rgba(60,40,10,.6);border:2px solid rgba(246,207,120,.7)"><div style="font-size:24px;color:#fbecc8;font-weight:700">跟去年的自己比</div><div class="serif" style="font-size:54px;color:${G}">+¥4,000</div></div></div>`;
 return h;}
const SCN=[{w:[0,20.9],f:HOOK,b:HOOKb,c:'—— 大学宿舍 · 晚上 ——'},{w:[20.6,49.0],f:MONK,b:MONKb,c:'—— 2003 · 美国 · 猴子实验 ——'},{w:[48.9,73.3],f:WORLDS,b:WORLDSb,c:'—— 1998 · 哈佛 · 两个世界 ——'},
 {w:[73.2,97.7],f:WALL,b:WALLb,c:'—— 2008 · 加州 · 工资上了网 ——'},{w:[97.6,105.8],f:STREET,b:STREETb,c:'—— 2005 · 邻居的收入 ——'},{w:[105.7,125.7],f:END,b:ENDb,c:'—— 回到宿舍楼顶 ——'}];
const LINES=[[0,4.4,'你拿到人生第一份实习工资：[4000]'],[4.4,8.5,'开心了[整整三天]'],[8.5,12.5,'然后室友说：他的是[6000]'],[12.5,16.4,'你的4000，突然就[不香了]'],
 [20.6,24.7,'别怪自己。连[猴子]都这样'],[24.7,28.7,'科学家让卷尾猴，用小石子换[黄瓜]'],[28.7,32.8,'两只都换到黄瓜：[95%]照常交换'],[32.8,36.8,'可旁边那只，同样干活，换到[葡萄]'],[36.8,40.9,'这只就不干了：掉到[60%]'],[40.9,44.9,'旁边那只[啥也不干]就拿葡萄：只剩[20%]'],[44.9,48.9,'不是黄瓜变难吃了，是[旁边有葡萄]'],
 [48.98,53.0,'人呢？哈佛问过257个人一道题'],[53.0,57.0,'A世界：你年入5万，别人[2.5万]'],[57.0,61.1,'B世界：你年入10万，别人[20万]'],[61.1,65.1,'B多挣一倍，可[48%]的人选了A'],[65.2,69.2,'换成假期呢？[85%]的人只要自己多'],[69.2,73.2,'原来我们，偏偏在[钱]上最爱比'],
 [73.2,77.2,'2008年，一家报纸把加州大学的工资[放上了网]'],[77.2,81.3,'研究者提醒一部分员工：[可以去查同事]'],[81.4,85.4,'低于中位数的人：满意度[下降]'],[85.4,89.5,'而且[更想跳槽]'],[89.5,93.5,'高于中位数的人呢？[并没有更开心]'],[93.5,97.6,'比较这笔账，只有[比输的人]在痛'],
 [97.6,101.6,'还有研究发现：自己收入不变，[邻居]挣得越多'],[101.6,105.7,'人就[越不快乐]'],
 [105.7,109.7,'所以觉得穷，不一定是[钱少]'],[109.7,113.8,'是你身边，总有一颗[葡萄]'],[113.8,117.8,'比较是天性，但[跟谁比]，你能选'],[117.8,121.9,'跟去年的自己比，你[多了4000]'],[121.9,125.4,'你最常拿自己，跟[谁]比？']];
window.LINES=LINES;
window.renderAt=function(T){X.setTransform(1,0,0,1,0,0);X.globalAlpha=1;X.clearRect(0,0,1920,1080);X.fillStyle='rgba(0,0,0,0.004)';X.fillRect(0,0,2,2);
 let h='',bk='',chap='',co=0;for(const s of SCN){const [a,b]=s.w;if(T<a-0.5||T>b+0.5)continue;const e=a<=0?1:eio(pr(T,a-0.5,a+0.5)),x=b>=130?0:eio(pr(T,b-0.5,b+0.5)),o=e*(1-x),sc=1+0.03*sst(pr(T,a,b));
  X.save();X.translate(960,540);X.scale(sc,sc);X.translate(-960,-540);bk+=`<div class="sc" style="opacity:${o};transform:scale(${sc})">${s.b(T)}</div>`;h+=`<div class="sc" style="opacity:${o};transform:scale(${sc})">${s.f(T,o)}</div>`;X.restore();
  if(o>co){co=o;chap=s.c;}}
 $('back').innerHTML=bk;$('world').innerHTML=h;
 const plq=pr(T,16.4,16.9)*(1-pr(T,20.3,20.9));$('chap').textContent=chap;$('chap').style.opacity=co*(1-plq)*(T<125.4?1:0);
 const L=LINES.find(l=>T>=l[0]&&T<l[1]);$('sub').innerHTML=L&&T<125.4?'<span>'+L[2].replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';
 $('dim').style.opacity=0.42*plq;
 $('plaque').style.opacity=pr(T,16.58,16.9)*(1-pr(T,20.2,20.8));$('plaque').style.transform=`scale(${1.06-0.06*eo(pr(T,16.58,17.3))})`;
 $('end').style.opacity=pr(T,125.4,126.4);};
await document.fonts.load('900 60px "Noto Sans CJK SC"');await document.fonts.load('700 60px "Noto Serif CJK SC"');await document.fonts.ready;window.renderAt(0);window.READY=true;
