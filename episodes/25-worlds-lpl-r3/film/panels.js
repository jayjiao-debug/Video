// 2D content for the LED screens (2048 x 1152). Every function is pure in T.
import {B,BEAT,cl,sm,lerp,eio,eo,vis,back,H,REGC,GOLD,D} from './util.js';
export const PW=2048,PH=1152;
const SE='"Noto Serif CJK SC",serif',CN='"Noto Sans CJK SC",sans-serif',IN='"Inter Display","Noto Sans CJK SC",sans-serif';
export const IMG={};
const regc=t=>REGC[D.region[t]]||'#ddd';
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function T_(c,s,x,y,sz,col='#fff',al='left',f=SE,w=900){c.font=`${w} ${sz}px ${f}`;c.fillStyle=col;c.textAlign=al;c.textBaseline='alphabetic';c.fillText(s,x,y);}
function bg(c){const g=c.createLinearGradient(0,0,0,PH);g.addColorStop(0,'#16120b');g.addColorStop(1,'#0a0806');c.fillStyle=g;c.fillRect(0,0,PW,PH);
 c.strokeStyle='rgba(246,207,120,.07)';c.lineWidth=2;for(let y=0;y<PH;y+=48){c.beginPath();c.moveTo(0,y);c.lineTo(PW,y);c.stroke();}
 c.strokeStyle='rgba(246,207,120,.55)';c.lineWidth=4;c.strokeRect(24,24,PW-48,PH-48);}
function head(c,s,sub){T_(c,s,90,150,78,GOLD);if(sub)T_(c,sub,PW-90,150,40,'rgba(255,255,255,.55)','right',CN,700);
 const g=c.createLinearGradient(90,0,PW-90,0);g.addColorStop(0,'rgba(246,207,120,.8)');g.addColorStop(1,'rgba(246,207,120,0)');c.fillStyle=g;c.fillRect(90,180,PW-180,3);}
function plate(c,t,x,y,w=170,h=74,a=1){if(a<=0)return;c.save();c.globalAlpha=a;rr(c,x-w/2,y-h/2,w,h,14);c.fillStyle=regc(t);c.fill();c.fillStyle='rgba(255,255,255,.16)';rr(c,x-w/2,y-h/2,w,h/2,14);c.fill();
 T_(c,t,x,y+h*.26,h*.64,'#fff','center',IN);c.restore();}
function icon(c,name,x,y,s,{ring=null,grey=false,a=1,ban=false}={}){const im=IMG[name];if(a<=0)return;c.save();c.globalAlpha=a;if(grey)c.filter='grayscale(1) brightness(.75)';
 rr(c,x,y,s,s,s*.16);c.save();c.clip();if(im)c.drawImage(im,x,y,s,s);else{c.fillStyle='#333';c.fill();}c.restore();c.filter='none';
 if(ring){c.strokeStyle=ring;c.lineWidth=Math.max(4,s*.045);rr(c,x,y,s,s,s*.16);c.stroke();}
 if(ban){c.strokeStyle='#ff4560';c.lineWidth=s*.08;c.beginPath();c.moveTo(x+s*.18,y+s*.18);c.lineTo(x+s*.82,y+s*.82);c.stroke();}c.restore();}
const k1=v=>(v/1000).toFixed(1)+'k';
const pop=(T,t0,d=.35)=>cl(back(T,t0,d),0,1.2);

// ---------- R1: four lost games, then IG vs GEN, then the tally
export function drawR1(c,T){bg(c);
 const sA=vis(T,B(14)-.5,B(16)+.1,.25),sB=vis(T,B(16),B(20)+.1,.25),sC=sm(B(20),B(20)+.3,T);
 if(sA>0){c.globalAlpha=sA;head(c,'首轮 · LPL 四场全败','15 分钟经济差');
  D.r1_view.forEach((g,i)=>{const x=110+i*470,y=260,a=sm(B(14)+.2+i*.18,B(14)+.45+i*.18,T)*sA;c.globalAlpha=a;
   rr(c,x,y,430,760,26);c.fillStyle='rgba(255,255,255,.05)';c.fill();c.strokeStyle='rgba(246,207,120,.35)';c.lineWidth=3;c.stroke();
   plate(c,g.team,x+125,y+90,190,84,a);T_(c,'vs',x+250,y+112,40,'rgba(255,255,255,.5)','left',IN);plate(c,g.opp,x+350,y+90,130,64,a);
   const v=g.gd15;T_(c,'15 分钟',x+40,y+300,40,'rgba(255,255,255,.6)','left',CN,700);
   T_(c,(v>0?'+':'')+k1(v),x+40,y+440,130,v>0?REGC.LPL:'#9aa3b5','left',IN);
   T_(c,v>0?'领先':'落后',x+40,y+520,48,v>0?REGC.LPL:'#9aa3b5','left',SE);
   T_(c,'✕ 负',x+40,y+700,54,'#ff4560','left',SE);T_(c,Math.round(g.min)+' 分钟',x+390,y+700,40,'rgba(255,255,255,.55)','right',CN,700);});c.globalAlpha=1;}
 if(sB>0){c.globalAlpha=sB;const g=D.r1_games[0];head(c,'IG vs GEN · 首轮 BO1','26:01');
  for(const [sd,y] of [['blue',330],['red',540]]){const t=g[sd];plate(c,t.team,200,y,220,96);T_(c,t.res==='WIN'?'胜':'负',200,y+110,46,t.res==='WIN'?GOLD:'#9a97a6','center');
   t.picks.forEach((n,i)=>icon(c,n,380+i*190,y-80,160,{ring:regc(t.team),a:sm(B(16)+.15+i*.08+(sd==='red'?.4:0),B(16)+.4+i*.08+(sd==='red'?.4:0),T)*sB}));
   t.bans.filter(n=>IMG[n]).forEach((n,i)=>icon(c,n,1390+i*120,y-50,100,{grey:true,ban:true,a:sm(B(16)+.9,B(16)+1.2,T)*sB*.85}));}
  T_(c,'禁用',1390,250,34,'rgba(255,255,255,.5)','left',CN,700);
  // gold curve draws in over bars 17-19
  const gd=g.gold_diff_blue,n=gd.length-1,gx0=120,gx1=PW-120,gy=930,gs=.017;const X=i=>gx0+(gx1-gx0)*i/n,Y=v=>gy-v*gs;
  const prog=cl((T-B(17))/(B(19.4)-B(17)));const m=prog*n;
  c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=2;c.beginPath();c.moveTo(gx0,gy);c.lineTo(gx1,gy);c.stroke();
  T_(c,'经济差（IG 视角）',gx0,700,34,'rgba(255,255,255,.55)','left',CN,700);
  if(prog>0){const pts=[];for(let i=0;i<=Math.floor(m);i++)pts.push([X(i),Y(gd[i])]);const fi=Math.floor(m),fr=m-fi;if(fi<n)pts.push([X(fi+fr),Y(lerp(gd[fi],gd[fi+1],fr))]);
   for(const sg of [1,-1]){c.save();c.beginPath();c.rect(0,sg>0?0:gy,PW,sg>0?gy:PH);c.clip();c.beginPath();c.moveTo(gx0,gy);pts.forEach(p=>c.lineTo(...p));c.lineTo(pts[pts.length-1][0],gy);c.closePath();c.fillStyle=(sg>0?REGC.LPL:REGC.LCK)+'55';c.fill();c.restore();}
   c.strokeStyle='#fff';c.lineWidth=6;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();
   if(m>=15){const a=sm(15,16,m);c.globalAlpha=sB*a;c.fillStyle=REGC.LPL;c.beginPath();c.arc(X(15),Y(gd[15]),14,0,7);c.fill();T_(c,`15分钟 领先 ${k1(gd[15])}`,X(15)-200,Y(gd[15])-50,46,REGC.LPL);c.globalAlpha=sB;}
   if(m>=n-.01){const a=sm(B(19.4),B(19.4)+.3,T);c.globalAlpha=sB*a;T_(c,`终局 落后 ${k1(-gd[n])}`,X(n)-10,Y(gd[n])-30,50,REGC.LCK,'right');c.globalAlpha=sB;}}
  c.globalAlpha=1;}
 if(sC>0){c.globalAlpha=sC;bg(c);head(c,'首轮四场 · 资源','LPL : 对手');tally(c,D.r1_tally,T,B(20),sC);c.globalAlpha=1;}}
function tally(c,t,T,t0,a){const rows=[['小龙',t.drag,t.odrag],['大龙',t.baron,t.obaron]];
 rows.forEach(([lab,me,op],i)=>{const y=420+i*330,u=eo(cl((T-t0-.2-i*.35)/.7));T_(c,lab,110,y+30,64,'#fff');
  const W=1500,tot=Math.max(me+op,1),x0=360;c.fillStyle=REGC.LPL;rr(c,x0,y-60,Math.max(8,W*me/tot*u),120,18);c.fill();c.fillStyle='#4b5466';rr(c,x0+W*me/tot*u+10,y-60,Math.max(8,W*op/tot*u-10),120,18);c.fill();
  T_(c,String(Math.round(me*u)),x0+20,y+170,96,REGC.LPL,'left',IN);T_(c,String(Math.round(op*u)),x0+W,y+170,96,'#c9cfdb','right',IN);});}
// ---------- later wins: the same tally, flipped
export function drawLater(c,T){bg(c);head(c,'之后五场胜利 · 资源','LPL : 对手');tally(c,D.later_tally,T,B(22),1);
 const a=sm(B(24)+.2,B(24)+.6,T);if(a>0){c.globalAlpha=a;T_(c,`首轮：小龙 ${D.r1_tally.drag}:${D.r1_tally.odrag} · 大龙 ${D.r1_tally.baron}:${D.r1_tally.obaron}`,PW-110,1060,46,'rgba(255,255,255,.6)','right',CN,700);c.globalAlpha=1;}}
// ---------- coin flip facts
export function drawFacts(c,T){bg(c);head(c,'瑞士轮 '+D.n_games+' 局 · 反直觉数据','');
 const [w,n]=D.ahead15,a1=sm(B(32)+.2,B(32)+.6,T),a2=sm(B(34),B(34)+.4,T);
 c.globalAlpha=a1;T_(c,'15 分钟经济领先的一方',110,360,64,'#fff');c.globalAlpha=a2;
 T_(c,`${w}`,110,700,300,GOLD,'left',IN);T_(c,`/ ${n} 局获胜`,110+c.measureText(String(w)).width+30,700,96,'#fff','left',SE);
 T_(c,`≈ ${Math.round(100*w/n)}%`,110,860,96,'rgba(255,255,255,.75)','left',IN);
 const a3=sm(B(36),B(36)+.4,T);c.globalAlpha=a3;const [bw,bn]=D.blue;T_(c,`蓝色方 ${bw}/${bn} 胜`,PW-110,860,64,'#7fb6ff','right',SE);c.globalAlpha=1;}
// ---------- paths after tonight (R4 opponents for BLG; filled from the sim)
export function drawPaths(c,T){bg(c);const P=D.paths['blg_path_win'];head(c,'第四轮 · BLG 可能的对手','BO3 · 模型胜率');
 (P?P.R4:[]).slice(0,5).forEach(([t,p,wp],i)=>{const y=330+i*150,a=sm(B(44)+.3+i*.15,B(44)+.6+i*.15,T);c.globalAlpha=a;plate(c,t,220,y,200,90);
  const W=1100*p/40;c.fillStyle='rgba(246,207,120,.85)';rr(c,370,y-40,W*eo(cl((T-B(44)-.4-i*.15)/.6)),80,14);c.fill();T_(c,p.toFixed(0)+'%',390+W,y+24,64,'#fff','left',IN);
  T_(c,'BLG 胜率 '+wp+'%',PW-110,y+24,50,wp>=70?GOLD:'#c9cfdb','right',CN,700);
  if(D.region[t]==='LPL'){T_(c,'内战',1760-260,y+24,50,REGC.LPL,'right',SE);}});c.globalAlpha=1;}
// ---------- QF draw (BLG's QF opponent distribution)
export function drawQF(c,T){bg(c);const P=D.paths['blg_path_win'];head(c,'八强 · BLG 最可能碰到','BO5 · 模型胜率');
 (P?P.QF:[]).slice(0,5).forEach(([t,p,wp],i)=>{const x=170+i*380,a=sm(B(50)+.2+i*.15,B(50)+.5+i*.15,T);c.globalAlpha=a;plate(c,t,x+120,420,220,100);
  T_(c,p.toFixed(0)+'%',x+120,640,120,'#fff','center',IN);T_(c,'碰面概率',x+120,710,40,'rgba(255,255,255,.55)','center',CN,700);
  T_(c,wp+'%',x+120,900,96,wp>=60?GOLD:'#9aa3b5','center',IN);T_(c,'BLG 胜率',x+120,960,40,'rgba(255,255,255,.55)','center',CN,700);});c.globalAlpha=1;}
// ---------- AI poll
export function drawAI(c,T){bg(c);head(c,'再问一次 AI · 你选谁夺冠？','开源模型 · 同一份资料 · 离线作答');
 const L=D.ai||[];L.slice(0,6).forEach((m,i)=>{const x=110+(i%3)*620,y=260+Math.floor(i/3)*420,a=sm(B(54)+.2+i*.12,B(54)+.5+i*.12,T);c.globalAlpha=a;
  rr(c,x,y,580,380,26);c.fillStyle='rgba(255,255,255,.05)';c.fill();c.strokeStyle=m.lpl?'rgba(255,69,96,.8)':'rgba(246,207,120,.35)';c.lineWidth=4;c.stroke();
  T_(c,m.model,x+30,y+70,44,'#fff','left',IN);(m.top3||[]).forEach((t,j)=>plate(c,t,x+110+j*180,y+200,160,74,a));
  T_(c,m.lpl?'选了 LPL':'没选 LPL',x+30,y+330,44,m.lpl?REGC.LPL:'#9aa3b5','left',SE);});
 if(!L.length){T_(c,'（今晚更新）',PW/2,620,80,'rgba(255,255,255,.4)','center');}c.globalAlpha=1;}
// ---------- close: the model can't see / next round
export function drawClose(c,T){bg(c);head(c,'模型看不到的','');['状态','心态','临场 BP'].forEach((s,i)=>{const y=380+i*190,a=sm(B(56)+.2+i*.25,B(56)+.5+i*.25,T);c.globalAlpha=a;
  c.strokeStyle='#fff';c.lineWidth=6;c.strokeRect(140,y-90,110,110);c.strokeStyle='#ff4560';c.lineWidth=12;const u=sm(B(56)+.4+i*.25,B(56)+.7+i*.25,T);
  c.beginPath();c.moveTo(150,y-80);c.lineTo(150+90*u,y-80+90*u);c.stroke();c.beginPath();c.moveTo(240,y-80);c.lineTo(240-90*u,y-80+90*u);c.stroke();T_(c,s,320,y,110,'#fff');});c.globalAlpha=1;
 const a=sm(B(58),B(58)+.4,T);if(a>0){c.globalAlpha=a;T_(c,'第四轮',1500,450,72,GOLD,'center');T_(c,'10.29 凌晨',1500,620,120,'#fff','center',IN);T_(c,'北京时间',1500,720,48,'rgba(255,255,255,.6)','center',CN,700);c.globalAlpha=1;}}
