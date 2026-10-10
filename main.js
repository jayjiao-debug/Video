// ep21 《为什么一比，就觉得穷？》 — all 2D (DOM/SVG + one canvas), navy + gold, one lit subject per beat. renderAt(T) is pure in T.
import {U} from './util.js';
const {cl,pr,eio,eo,sst,lerp,pop}=U;
const $=id=>document.getElementById(id);
const G='#F6CF78',GD='#c8963e',BL='#9fb6e8',GR='#7d8597',CU='#8fcf6a',GP='#b07ad8',W='#e9e3d6',RED='#ff8a7a';
const fx=$('fx'),X=fx.getContext('2d',{willReadFrequently:true});
let seed=21;const rng=()=>(seed=(seed*16807)%2147483647)/2147483647;
const spot=(x,y,r,c='246,207,120',a=.16)=>`<div style="position:absolute;left:${x-r}px;top:${y-r}px;width:${2*r}px;height:${2*r}px;border-radius:50%;background:radial-gradient(circle,rgba(${c},${a}),rgba(${c},0) 62%)"></div>`;
const floor=(y,a=.25)=>`<div style="position:absolute;left:0;right:0;top:${y}px;height:2px;background:linear-gradient(90deg,transparent,rgba(246,207,120,${a}),transparent)"></div>`;
const note=(t,o=1)=>`<div class="t" style="left:960px;top:892px;transform:translateX(-50%);font-size:22px;color:${GR};font-weight:700;opacity:${o}">${t}</div>`;
const big=(lab,val,unit,c,o=1,x=120,y=150)=>`<div style="position:absolute;left:${x}px;top:${y}px;opacity:${o}"><div class="lbl" style="position:static">${lab}</div><div class="t serif" style="position:static;font-size:128px;color:${c};line-height:1.1">${val}<span style="font-size:50px">${unit}</span></div></div>`;
// faceless person silhouette standing on y=floor
const person=(x,fy,h,c='#0c1020',glow='',op=1,rim=G)=>{const w=h*.36,hd=h*.16;return `<svg style="position:absolute;left:${x-w/2-40}px;top:${fy-h-40}px;overflow:visible;opacity:${op};${glow?`filter:drop-shadow(0 0 ${glow}px ${rim})`:''}" width="${w+80}" height="${h+80}" viewBox="-40 -40 ${w+80} ${h+80}"><circle cx="${w/2}" cy="${hd}" r="${hd}" fill="${c}"/><path d="M${w*.08} ${h} L${w*.1} ${hd*2.35} Q${w/2} ${hd*1.75} ${w*.9} ${hd*2.35} L${w*.92} ${h} Z" fill="${c}"/></svg>`;};
// stylised capuchin silhouette (faceless), facing right; flip with sx=-1
const monkey=(x,fy,s,sx=1,c='#0c1020',rim='')=>`<svg style="position:absolute;left:${x-120*s}px;top:${fy-230*s}px;overflow:visible;transform:scaleX(${sx});${rim?`filter:drop-shadow(0 0 10px ${rim})`:''}" width="${240*s}" height="${240*s}" viewBox="-120 -230 240 240">
 <path d="M-40 -10 C -110 -10 -120 -110 -70 -120 C -40 -126 -50 -80 -78 -88" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
 <ellipse cx="0" cy="-60" rx="52" ry="62" fill="${c}"/><circle cx="18" cy="-150" r="40" fill="${c}"/><circle cx="-14" cy="-178" r="12" fill="${c}"/><circle cx="48" cy="-176" r="12" fill="${c}"/>
 <path d="M30 -88 Q 70 -70 78 -40" stroke="${c}" stroke-width="18" stroke-linecap="round" fill="none"/><path d="M-26 -10 L -30 0 M 22 -10 L 26 0" stroke="${c}" stroke-width="18" stroke-linecap="round"/></svg>`;
const cucumber=(x,y,s=1,o=1)=>`<svg style="position:absolute;left:${x-30*s}px;top:${y-30*s}px;opacity:${o}" width="${60*s}" height="${60*s}" viewBox="-30 -30 60 60"><circle r="26" fill="#3f7a2c"/><circle r="21" fill="#cfe6a8"/><g fill="#8fb870">${[0,1,2,3,4,5].map(i=>`<ellipse cx="${Math.cos(i*1.05)*9}" cy="${Math.sin(i*1.05)*9}" rx="2.4" ry="4" transform="rotate(${i*60} ${Math.cos(i*1.05)*9} ${Math.sin(i*1.05)*9})"/>`).join('')}</g></svg>`;
const grape=(x,y,s=1,o=1)=>`<svg style="position:absolute;left:${x-30*s}px;top:${y-30*s}px;opacity:${o};overflow:visible;filter:drop-shadow(0 0 ${14*s}px rgba(200,140,255,.8))" width="${60*s}" height="${60*s}" viewBox="-30 -30 60 60"><defs><radialGradient id="gq" cx="35%" cy="30%"><stop offset="0" stop-color="#e6c8ff"/><stop offset=".35" stop-color="#8a4fb8"/><stop offset="1" stop-color="#3a1858"/></radialGradient></defs><circle r="24" fill="url(#gq)"/><path d="M0 -24 q 4 -10 12 -12" stroke="#6a8a3a" stroke-width="3" fill="none"/></svg>`;
const token=(x,y,o=1)=>`<div style="position:absolute;left:${x-20}px;top:${y-16}px;width:40px;height:32px;border-radius:45% 55% 50% 50%;background:radial-gradient(circle at 35% 30%,#c9cdd6,#6a6f7a);opacity:${o}"></div>`;
// coins: canvas ellipse stacks
function coins(cx,base,n,w,c1='#ffe7a0',c2='#c8963e',a=1,gap=9){X.globalAlpha=a;for(let k=0;k<n;k++){const y=base-k*gap;X.fillStyle=c2;X.beginPath();X.ellipse(cx,y+3,w,w*.28,0,0,7);X.fill();const g=X.createLinearGradient(cx-w,0,cx+w,0);g.addColorStop(0,c2);g.addColorStop(.45,c1);g.addColorStop(1,c2);X.fillStyle=g;X.beginPath();X.ellipse(cx,y,w,w*.28,0,0,7);X.fill();}}
function dot(x,y,r,c,a=1,glow=10){X.globalAlpha=a;X.shadowBlur=glow;X.shadowColor=c;X.fillStyle=c;X.beginPath();X.arc(x,y,r,0,7);X.fill();X.shadowBlur=0;}
// phone card
const phone=(x,y,s,{title,amount,sub,col=G,dim=0,glow=.5})=>`<div style="position:absolute;left:${x-150*s}px;top:${y-300*s}px;width:${300*s}px;height:${600*s}px;border-radius:${44*s}px;background:#0b0d14;box-shadow:0 30px 70px rgba(0,0,0,.6),0 0 ${80*glow}px rgba(246,207,120,${.35*glow});padding:${12*s}px">
 <div style="width:100%;height:100%;border-radius:${34*s}px;background:linear-gradient(180deg,#151b2c,#07090f);position:relative;overflow:hidden">
 <div style="position:absolute;left:${18*s}px;right:${18*s}px;top:${170*s}px;border-radius:${24*s}px;background:rgba(255,255,255,.07);padding:${22*s}px ${22*s}px">
  <div style="font-size:${20*s}px;color:#9aa2b4;font-weight:700">${title}</div><div style="font-family:'Noto Serif CJK SC';font-size:${58*s}px;font-weight:900;color:${col};margin-top:${8*s}px;white-space:nowrap">${amount}</div><div style="font-size:${20*s}px;color:#c9cfdb;font-weight:700;margin-top:${6*s}px;min-height:${26*s}px">${sub}</div></div>
 <div style="position:absolute;inset:0;background:rgba(3,4,8,${dim})"></div></div></div>`;
/* ---------------- scenes ---------------- */
// S0 hook 0–20.8
function HOOK(T,o){const day=T<4.4?0:Math.min(3,1+Math.floor((T-4.4)/1.3));const in2=eio(pr(T,8.4,9.8));const dim=.68*pr(T,12.5,13.8);const pl=pr(T,16.4,17);
 const x1=lerp(960,730,in2);
 return `${spot(x1,470,lerp(520,420,in2),'246,207,120',.2*(1-dim*.8))}${in2>0?spot(lerp(1500,1180,in2),470,420,'255,255,255',.12*in2):''}
 ${phone(x1,480,1.3,{title:'实习工资 · 到账',amount:'¥4,000',sub:day?`开心的第 ${day} 天`:'刚刚',dim,glow:1-dim})}
 ${in2>0?`<div style="opacity:${in2}">${phone(lerp(1650,1190,in2),480,1.3,{title:'室友的实习工资',amount:'¥6,000',sub:'',col:'#fff',glow:.6})}</div>`:''}`;}
// S1 monkeys 20.6–49.0
function MONK(T,o){const ph=T<32.8?0:(T<40.9?1:2);const refuse=pr(T,36.8,37.8);
 const cyc=((T-24.7+20)%2.2)/2.2;const out=eio(cl(cyc/.35)),inn=eio(cl((cyc-.42)/.35));
 const Ax=640,Bx=1280,fy=720;
 const box=(x,lit)=>`<div style="position:absolute;left:${x-280}px;top:270px;width:560px;height:470px;border:2px solid rgba(160,180,215,.25);border-radius:10px;background:linear-gradient(180deg,rgba(150,170,210,.04),rgba(150,170,210,.02))"></div>${spot(x,520,330,'246,207,120',lit)}`;
 let h=box(Ax,.18*(1-.5*refuse))+box(Bx,ph?.24:.18)+floor(fy,.2);
 // tray line between monkey and the experimenter's slot (the front, bottom of each box)
 const tAx=lerp(Ax+70,Ax+70,out),tAy=lerp(600,800,out);const tBx=Bx-70,tBy=lerp(600,800,out);
 h+=monkey(Ax-50,fy,1.5,refuse>.5?-1:1,'#0c1020',refuse>.5?'':'rgba(246,207,120,.5)')+monkey(Bx+50,fy,1.5,-1,'#0c1020','rgba(246,207,120,.5)');
 if(T>24.7){if(!(refuse>0&&ph>0))h+=token(tAx,tAy,1-inn);if(ph<2)h+=token(tBx,tBy,1-inn);
  // rewards come in from the bottom
  const rAx=Ax+70,rAy=lerp(820,600,refuse>0?0:inn);h+=cucumber(refuse>0?Ax+150+60*refuse:rAx,refuse>0?800:rAy,1.9,refuse>0?1-.4*refuse:inn);
  const rBy=lerp(820,600,inn);h+=ph===0?cucumber(Bx-80,rBy,1.9,inn):grape(Bx-80,rBy,1.8,inn);}
 const v=T<36.8?95:(T<40.9?Math.round(lerp(95,60,eo(pr(T,36.9,38.2)))):Math.round(lerp(60,20,eo(pr(T,41.0,42.4)))));
 h+=`<div class="t" style="left:${Ax}px;top:250px;transform:translateX(-50%);font-size:32px;color:#c9e6a8;opacity:${pr(T,25,25.5)}">这只：黄瓜</div>
 <div class="t" style="left:${Bx}px;top:250px;transform:translateX(-50%);font-size:32px;color:${ph?'#d9b0ff':'#c9e6a8'};opacity:${pr(T,25,25.5)}">旁边：${ph===0?'黄瓜':(ph===1?'葡萄（同样干活）':'葡萄（什么都不干）')}</div>
 ${big('愿意完成交换',v,'%',v<90?RED:G,pr(T,28.7,29.1))}${note('Brosnan &amp; de Waal (2003) Nature · 卷尾猴 · 用小石子换食物',pr(T,25,25.5))}`;
 return h;}
// S2 two worlds 48.9–73.4
const WAL=Array.from({length:257},(_,i)=>({x0:200+rng()*1520,y0:930+rng()*60,a:rng()*6.28,r:Math.sqrt(rng()),d:rng(),A:i<123,A2:i<39}));
function WORLDS(T,o){const Ax=560,Bx=1360,base=700;const ga=eo(pr(T,53.1,54.8)),gb=eo(pr(T,57.1,59.6));const vac=T>65.2,m=eio(pr(T,65.2,66.2));
 let h=spot(Ax,560,380,'246,207,120',.14)+spot(Bx,560,380,'246,207,120',.14)+floor(base+16,.25);
 // coins: 1 coin per 2.5k
 if(m<1){coins(Ax-70,base,Math.round(20*ga),52,'#ffe7a0','#c8963e',o*(1-m),11);coins(Ax+80,base,Math.round(10*ga),52,'#d8dde8','#6a7080',o*(1-m),11);
  coins(Bx-70,base,Math.round(40*gb),52,'#ffe7a0','#c8963e',o*(1-m),11);coins(Bx+80,base,Math.round(80*gb),52,'#d8dde8','#6a7080',o*(1-m)*1,6.6);}
 if(vac){const tile=(x,n,c)=>{for(let k=0;k<Math.round(n*m);k++){X.globalAlpha=o*.9;X.fillStyle=c;X.shadowBlur=12;X.shadowColor=c;X.fillRect(x-48,base-8-k*16,96,11);X.shadowBlur=0;}};tile(Ax-70,10,'#9fd0ff');tile(Ax+80,5,'#5d6f94');tile(Bx-70,20,'#9fd0ff');tile(Bx+80,40,'#5d6f94');}
 // 257 people as dots walking to A or B
 const w1=pr(T,61.2,64.4),w2=pr(T,65.8,68.6);WAL.forEach(w=>{const g1=eio(cl((w1-w.d*.4)/.6)),g2=eio(cl((w2-w.d*.4)/.6));const tx1=(w.A?Ax:Bx)+Math.cos(w.a)*w.r*230,ty1=800+Math.sin(w.a)*w.r*24;const tx2=(w.A2?Ax:Bx)+Math.cos(w.a)*w.r*230;
  const x=lerp(lerp(w.x0,tx1,g1),tx2,g2),y=lerp(lerp(w.y0,ty1,g1),ty1,g2);if(T>60.9)dot(x,y,4,vac?'#9fd0ff':'#fff0d0',o*.95,6);});
 const lab=(x,y,t,c,op)=>`<div class="t" style="left:${x}px;top:${y}px;transform:translateX(-50%);font-size:28px;color:${c};opacity:${op}">${t}</div>`;
 if(!vac){h+=lab(Ax-70,base-20*11*ga-70,'你 5万',G,ga)+lab(Ax+80,base-10*11*ga-70,'别人 2.5万','#c9cfdb',ga)+lab(Bx-70,base-40*11*gb-70,'你 10万',G,gb)+lab(Bx+80,base-80*6.6*gb-70,'别人 20万','#c9cfdb',gb);}
 else h+=lab(Ax,base-260,'你的假期，比别人多','#9fd0ff',pr(T,66,66.5))+lab(Bx,base-700,'你的假期更多，但别人更多','#9fd0ff',pr(T,66,66.5));
 h+=`<div class="t serif" style="left:${Ax}px;top:${base+24}px;transform:translateX(-50%);font-size:52px;color:#fff">A</div><div class="t serif" style="left:${Bx}px;top:${base+24}px;transform:translateX(-50%);font-size:52px;color:#fff">B</div>`;
 const pa=T<65.2?Math.round(48*eo(pr(T,61.4,64.4))):Math.round(lerp(48,15,eo(pr(T,65.9,68.6))));
 h+=big(vac?'换成假期 · 选 A 的人':'选 A 的人',pa,'%',vac?'#9fd0ff':G,pr(T,61.3,61.7))+(vac?`<div class="t" style="left:120px;top:330px;font-size:34px;color:#fff;opacity:${pr(T,68.4,68.9)}">85% 只要自己的假期更多</div>`:'');
 h+=`<div class="t" style="left:960px;top:150px;transform:translateX(-50%);font-size:28px;color:#c9b98f;letter-spacing:4px;opacity:${pr(T,49.2,49.7)*(1-pr(T,61.0,61.4))}">物价完全一样 · 你想住在哪个世界？</div>`+note('Solnick &amp; Hemenway (1998) · 哈佛公共卫生学院 257 人 · 塔高按比例',pr(T,49.2,49.7));
 return h;}
// S3 the pay wall 73.2–97.7
const BARS=Array.from({length:24},(_,i)=>({w:lerp(860,200,Math.pow(i/23,.8))*(.92+.16*rng())}));
const STAFF=Array.from({length:12},(_,i)=>({below:i>=6,x:(i>=6?1030:400)+(i%6)*82+(rng()-.5)*14,ph:rng()}));
function WALL(T,o){const on=pr(T,73.6,75.4),hit=pr(T,81.4,82.6),job=eio(pr(T,85.5,87.6)),look=pr(T,89.6,90.2)*(1-pr(T,93.2,93.6));
 const px=560,py=140,pw=800,ph=520;let rows='';BARS.forEach((b,i)=>{const a=cl(on*30-i);const below=i>=12;const c=below&&hit>0?`rgba(${Math.round(lerp(246,111,hit))},${Math.round(lerp(207,134,hit))},${Math.round(lerp(120,192,hit))},.9)`:'rgba(246,207,120,.85)';
  rows+=`<div style="position:absolute;left:${px+150}px;top:${py+70+i*18}px;width:${b.w*.62*a}px;height:10px;border-radius:5px;background:${c}"></div><div style="position:absolute;left:${px+30}px;top:${py+70+i*18}px;width:96px;height:10px;border-radius:5px;background:rgba(255,255,255,.12);opacity:${a}"></div>`;});
 const sc=pr(T,77.3,81.0);const scanY=py+66+((sc*3)%1)*24*18;const medY=py+70+11.5*18+4;
 let h=`${spot(960,420,560,'246,207,120',.1)}<div style="position:absolute;left:${px}px;top:${py}px;width:${pw}px;height:${ph}px;border-radius:18px;background:rgba(10,14,28,.92);border:1px solid rgba(246,207,120,.25);box-shadow:0 30px 80px rgba(0,0,0,.6);opacity:${pr(T,73.3,73.9)}">
  <div style="position:absolute;left:30px;top:22px;font-size:26px;font-weight:900;color:#fff">加州大学 · 员工工资 · 全部可查</div><div style="position:absolute;right:30px;top:22px;font-size:20px;color:#9aa2b4;font-weight:700">2008 · 报纸网站</div></div>${rows}
  ${sc>0&&sc<1?`<div style="position:absolute;left:${px+20}px;top:${scanY}px;width:${pw-40}px;height:20px;border-radius:6px;background:rgba(255,242,208,.18);box-shadow:0 0 20px rgba(255,242,208,.3)"></div><div style="position:absolute;left:${px+pw-90}px;top:${scanY-8}px;width:30px;height:30px;border-radius:50%;border:4px solid #fff2d0;box-shadow:0 0 14px #fff2d0"></div>`:''}
  <div style="position:absolute;left:${px+20}px;top:${medY}px;width:${pw-40}px;border-top:2px dashed rgba(255,255,255,${.8*pr(T,79.6,80.4)})"></div><div class="t" style="left:${px+pw+16}px;top:${medY-18}px;font-size:26px;color:#fff;opacity:${pr(T,79.6,80.4)}">中位数</div>`;
 // people below the panel
 const fy=820;h+=floor(fy,.2);STAFF.forEach(s=>{const d=s.below?hit:0;const x=s.x+(s.below?job*(120+s.ph*80):0);const c=s.below?`rgba(${Math.round(lerp(255,143,d))},${Math.round(lerp(217,166,d))},${Math.round(lerp(160,216,d))},${lerp(.55,.3,d)})`:`rgba(255,217,160,${.55+.25*look*Math.abs(Math.sin(T*6))})`;
  h+=`<div style="position:absolute;left:${x-46}px;top:${fy-150}px;width:92px;height:150px;border-radius:50%;background:radial-gradient(circle,${c},transparent 70%)"></div>`+person(x,fy,140,'#0c1020','',1);});
 h+=`<div style="position:absolute;left:1690px;top:640px;width:110px;height:230px;border-radius:6px;background:linear-gradient(180deg,rgba(159,208,255,.55),rgba(159,208,255,.15));box-shadow:0 0 60px rgba(159,208,255,.5);opacity:${pr(T,85.4,86.2)}"></div><div class="t" style="left:1745px;top:596px;transform:translateX(-50%);font-size:28px;color:#9fd0ff;opacity:${pr(T,85.6,86.2)}">找新工作</div>
  <div class="t" style="left:624px;top:${fy+14}px;transform:translateX(-50%);font-size:26px;color:${G};opacity:${pr(T,81.6,82.2)}">高于中位数</div><div class="t" style="left:1244px;top:${fy+14}px;transform:translateX(-50%);font-size:26px;color:${BL};opacity:${pr(T,81.6,82.2)}">低于中位数</div>
  ${note('Card, Mas, Moretti &amp; Saez (2012) American Economic Review · 名单为示意',pr(T,73.6,74.1))}`;
 return h;}
// S4 the street 97.6–105.8
function STREET(T,o){const up=eo(pr(T,97.9,101.2)),me=pr(T,101.6,102.4);const fy=760;let h=floor(fy,.25);
 const houses=[260,520,780,1140,1400,1660];const mine=960;
 houses.forEach((x,i)=>{const b=lerp(.35,1,up);h+=`${spot(x,fy-120,200,'255,214,140',.12*b)}<svg style="position:absolute;left:${x-100}px;top:${fy-220}px" width="200" height="220" viewBox="0 0 200 220"><path d="M10 100 L100 20 L190 100 L190 220 L10 220 Z" fill="#0c1020"/><rect x="40" y="120" width="44" height="44" fill="rgba(255,214,140,${.25+.7*b})"/><rect x="116" y="120" width="44" height="44" fill="rgba(255,214,140,${.25+.7*b})"/></svg>`;});
 const myGlow=lerp(.75,.32,me);
 h+=`${spot(mine,fy-130,lerp(260,170,me),'255,214,140',.2*myGlow)}<svg style="position:absolute;left:${mine-120}px;top:${fy-260}px;filter:drop-shadow(0 0 ${lerp(24,6,me)}px rgba(246,207,120,.8))" width="240" height="260" viewBox="0 0 240 260"><path d="M12 120 L120 24 L228 120 L228 260 L12 260 Z" fill="#0c1020" stroke="rgba(246,207,120,.6)" stroke-width="2"/><rect x="50" y="140" width="52" height="52" fill="rgba(255,214,140,.75)"/><rect x="138" y="140" width="52" height="52" fill="rgba(255,214,140,.75)"/></svg>
 <div class="t" style="left:${mine}px;top:${fy+14}px;transform:translateX(-50%);font-size:30px;color:${G}">你 · 收入不变</div><div class="t" style="left:420px;top:${fy+14}px;transform:translateX(-50%);font-size:28px;color:#e9c98a;opacity:${pr(T,98.6,99.1)}">邻居 · 挣得越来越多 ↑</div>
 <div class="t" style="left:${mine}px;top:${fy-330}px;transform:translateX(-50%);font-size:34px;color:#fff;opacity:${me}">你的快乐 ↓</div>${note('Luttmer (2005) Quarterly Journal of Economics · 已控制本人收入 · 示意',pr(T,98,98.5))}`;
 return h;}
// S5 ending 105.7–125.4
function END(T,o){const g=pr(T,109.9,110.6)*(1-pr(T,113.6,114.2));const ch=pr(T,113.9,114.5)*(1-pr(T,117.6,118.1));const last=pr(T,117.8,118.4);
 let h=spot(960,480,520,'246,207,120',.18);
 const sub=last>0?'去年这时候：¥0':'';h+=phone(960,480,1.3,{title:last>0?'跟去年的自己比':'实习工资 · 到账',amount:last>0?'+¥4,000':'¥4,000',sub,dim:.3*(1-last)*(1-ch),glow:.4+.6*last});
 if(g>0)h+=grape(1150,620,1.6,g);
 if(ch>0)h+=`<div style="opacity:${ch}"><div style="position:absolute;left:330px;top:400px;width:300px;padding:22px 26px;border-radius:20px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15)"><div style="font-size:22px;color:#9aa2b4;font-weight:700">跟室友比</div><div class="serif" style="font-size:52px;font-weight:900;color:${RED}">−¥2,000</div></div>
  <div style="position:absolute;left:1290px;top:400px;width:300px;padding:22px 26px;border-radius:20px;background:rgba(246,207,120,.08);border:1px solid rgba(246,207,120,.4)"><div style="font-size:22px;color:#c9b98f;font-weight:700">跟去年的自己比</div><div class="serif" style="font-size:52px;font-weight:900;color:${G}">+¥4,000</div></div></div>`;
 return h;}
const SCN=[{w:[0,20.9],f:HOOK},{w:[20.6,49.0],f:MONK},{w:[48.9,73.3],f:WORLDS},{w:[73.2,97.7],f:WALL},{w:[97.6,105.8],f:STREET},{w:[105.7,130],f:END}];
const LINES=[[0,4.4,'你拿到人生第一份实习工资：[4000]'],[4.4,8.5,'开心了[整整三天]'],[8.5,12.5,'然后室友说：他的是[6000]'],[12.5,16.4,'你的4000，突然就[不香了]'],
 [20.6,24.7,'别怪自己。连[猴子]都这样'],[24.7,28.7,'科学家让卷尾猴，用小石子换[黄瓜]'],[28.7,32.8,'两只都换到黄瓜：[95%]照常交换'],[32.8,36.8,'可旁边那只，同样干活，换到[葡萄]'],[36.8,40.9,'这只就不干了：掉到[60%]'],[40.9,44.9,'旁边那只[啥也不干]就拿葡萄：只剩[20%]'],[44.9,48.9,'不是黄瓜变难吃了，是[旁边有葡萄]'],
 [48.98,53.0,'人呢？哈佛问过257个人一道题'],[53.0,57.0,'A世界：你年入5万，别人[2.5万]'],[57.0,61.1,'B世界：你年入10万，别人[20万]'],[61.1,65.1,'B多挣一倍，可[48%]的人选了A'],[65.2,69.2,'换成假期呢？[85%]的人只要自己多'],[69.2,73.2,'原来我们，偏偏在[钱]上最爱比'],
 [73.2,77.2,'2008年，一家报纸把加州大学的工资[放上了网]'],[77.2,81.3,'研究者提醒一部分员工：[可以去查同事]'],[81.4,85.4,'低于中位数的人：满意度[下降]'],[85.4,89.5,'而且[更想跳槽]'],[89.5,93.5,'高于中位数的人呢？[并没有更开心]'],[93.5,97.6,'比较这笔账，只有[比输的人]在痛'],
 [97.6,101.6,'还有研究发现：自己收入不变，[邻居]挣得越多'],[101.6,105.7,'人就[越不快乐]'],
 [105.7,109.7,'所以觉得穷，不一定是[钱少]'],[109.7,113.8,'是你身边，总有一颗[葡萄]'],[113.8,117.8,'比较是天性，但[跟谁比]，你能选'],[117.8,121.9,'跟去年的自己比，你[多了4000]'],[121.9,125.4,'你最常拿自己，跟[谁]比？']];
window.LINES=LINES;
window.renderAt=function(T){X.setTransform(1,0,0,1,0,0);X.globalAlpha=1;X.clearRect(0,0,1920,1080);X.fillStyle='rgba(0,0,0,0.004)';X.fillRect(0,0,2,2);
 let h='';for(const s of SCN){const [a,b]=s.w;if(T<a-0.5||T>b+0.5)continue;const e=a<=0?1:eio(pr(T,a-0.5,a+0.5)),x=b>=130?0:eio(pr(T,b-0.5,b+0.5)),o=e*(1-x),sc=1+0.03*sst(pr(T,a,b));
  X.save();X.translate(960,540);X.scale(sc,sc);X.translate(-960,-540);h+=`<div class="sc" style="opacity:${o};transform:scale(${sc})">${s.f(T,o)}</div>`;X.restore();}
 $('world').innerHTML=h;$('bg2').style.opacity=1;
 const L=LINES.find(l=>T>=l[0]&&T<l[1]);$('sub').innerHTML=L&&T<125.4?'<span>'+L[2].replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';
 $('dim').style.opacity=0.55*pr(T,16.4,16.9)*(1-pr(T,20.3,20.9));
 $('plaque').style.opacity=pr(T,16.58,16.9)*(1-pr(T,20.2,20.8));$('plaque').style.transform=`scale(${1.06-0.06*eo(pr(T,16.58,17.3))})`;
 $('end').style.opacity=pr(T,125.4,126.4);};
await document.fonts.load('900 60px "Noto Sans CJK SC"');await document.fonts.load('900 60px "Noto Serif CJK SC"');await document.fonts.ready;window.renderAt(0);window.READY=true;
