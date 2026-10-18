// 2D content drawn onto the stage's LED panels (2048 x 1152 canvases). Every function is pure in T.
import {B,BEAT,cl,sm,lerp,eio,eo,vis,back,H,REGC,GOLD,D} from './util.js';
export const PW=2048,PH=1152;
const CN='"Noto Sans CJK SC",sans-serif',IN='"Inter Display","Noto Sans CJK SC",sans-serif';
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function T_(c,s,x,y,sz,col='#fff',al='left',f=CN,w=900){c.font=`${w} ${sz}px ${f}`;c.fillStyle=col;c.textAlign=al;c.textBaseline='alphabetic';c.fillText(s,x,y);}
function bg(c,top='#2b1242',bot='#1a0b2a'){const g=c.createLinearGradient(0,0,0,PH);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fillRect(0,0,PW,PH);
 // faint LED dot texture
 c.globalAlpha=.06;c.fillStyle='#fff';for(let y=8;y<PH;y+=16)for(let x=8;x<PW;x+=16)c.fillRect(x,y,2,2);c.globalAlpha=1;}
function chip(c,team,x,y,w=150,h=64,a=1,s=1){if(a<=0)return;const reg=D.region[team]||'LPL';c.save();c.globalAlpha=a;c.translate(x,y);c.scale(s,s);rr(c,-w/2,-h/2,w,h,16);c.fillStyle=REGC[reg];c.fill();
 c.fillStyle='rgba(255,255,255,.18)';rr(c,-w/2,-h/2,w,h/2,16);c.fill();T_(c,team,0,h*.24,h*.62,'#fff','center',IN);c.restore();}
const pct=v=>(Math.round(v*10)/10).toFixed(1);
const fmtInt=n=>Math.round(n).toLocaleString('en-US');

// ---------- P0: the simulator (hook) and the title "1/5"
export function draw0(c,T){bg(c,'#33134a','#1c0a2c');
 const N=D.N;const runs=Math.max(Math.min(N,Math.round(30+T*600)),N*eio(cl(T/14.2)));const fr=cl(T/14.2);
 // left: the counter
 const tit=vis(T,-1,16.9,.3);
 if(tit>0){c.globalAlpha=tit;T_(c,'模拟世界赛',120,250,96,'#fff');
  T_(c,fmtInt(runs),110,520,250,'#fff','left',IN);T_(c,'次',110+c.measureText(fmtInt(runs)).width+20,520,110,GOLD);
  // running tally: the real share of titles after this many simulated runs
  let cu=D.cum[6];for(const q of D.cum)if(q[0]<=Math.max(1,runs)&&q[0]>=20)cu=q;
  const x0=120,y0=660,W=880,h=100;T_(c,'冠军来自哪里',x0,y0-34,60,'#fff');
  const parts=[['LCK',cu[1]],['LPL',cu[2]],['其他',Math.max(0,100-cu[1]-cu[2])]];let x=x0;
  for(const [r,v] of parts){const w=W*v/100;if(w<2)continue;c.fillStyle=r==='其他'?'rgba(255,255,255,.28)':REGC[r];rr(c,x,y0,Math.max(4,w-6),h,14);c.fill();if(w>150)T_(c,r,x+22,y0+68,52,'#fff','left',IN);x+=w;}
  const hold=sm(12.4,12.9,T);
  T_(c,'LCK',x0,y0+h+100,72,REGC.LCK,'left',IN);T_(c,Math.round(cu[1])+'%',x0+190,y0+h+100,72,'#fff','left',IN);
  T_(c,'LPL',x0+480,y0+h+100,72,REGC.LPL,'left',IN);T_(c,Math.round(cu[2])+'%',x0+670,y0+h+100,72,'#fff','left',IN);
  c.globalAlpha=tit*(1-.0*hold);
  // right: a bracket that lights one champion path per simulated run
  const bx=1180,by=170,bw=760,bh=820;c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=6;
  const lx=[bx,bx+250,bx+500,bx+700];const slotY=i=>by+50+i*(bh-100)/7;
  for(let i=0;i<8;i++){rr(c,lx[0],slotY(i)-30,150,60,14);c.stroke();}
  for(let i=0;i<4;i++){const y=(slotY(2*i)+slotY(2*i+1))/2;rr(c,lx[1],y-30,150,60,14);c.stroke();}
  for(let i=0;i<2;i++){const y=(slotY(4*i)+slotY(4*i+3))/2;rr(c,lx[2],y-30,150,60,14);c.stroke();}
  // runs: a new champion every ~0.11 s early, slowing toward the end
  const k=Math.floor(T<12.53?Math.pow(T,1.25)*9:Math.pow(12.53,1.25)*9);
  const champs=Object.entries(D.champ).filter(([t,v])=>v>0);
  for(let j=0;j<6;j++){const id=k-j;if(id<0)break;const a=(1-j/6)*(T<12.53?1:j===0?1:.0);
   const t=D.first[id%D.first.length];
   const s0=Math.floor(H(id,5)*8);const col=REGC[D.region[t]];c.globalAlpha=tit*a;c.strokeStyle=col;c.lineWidth=10;c.beginPath();
   const y0=slotY(s0),y1=(slotY(s0&~1)+slotY(s0|1))/2,y2=(slotY(s0&~3)+slotY((s0&~3)+3))/2,y3=by+bh/2;
   c.moveTo(lx[0]+150,y0);c.lineTo(lx[1]-20,y0);c.lineTo(lx[1]-20,y1);c.lineTo(lx[1]+150,y1);c.lineTo(lx[2]-20,y1);c.lineTo(lx[2]-20,y2);c.lineTo(lx[2]+150,y2);c.lineTo(lx[3]-20,y2);c.lineTo(lx[3]-20,y3);c.lineTo(lx[3],y3);c.stroke();
   if(j===0){chip(c,t,lx[3]+60,y3,130,70,tit);}}
  c.globalAlpha=1;}
 // title state: five columns, one red (1 of 5)
 const ti=sm(16.4,16.9,T);
 if(ti>0){c.globalAlpha=ti;bg(c,'#3a1350','#1d0a2e');c.globalAlpha=ti;
  for(let i=0;i<5;i++){const x=574+i*200,hh=440*back(T,16.58+i*.12,.4);const red=i===2;
   const g=c.createLinearGradient(0,1040-hh,0,1040);g.addColorStop(0,red?'#ff7186':'rgba(255,255,255,.34)');g.addColorStop(1,red?'#c0213a':'rgba(255,255,255,.10)');c.fillStyle=g;rr(c,x,1040-hh,150,hh,24);c.fill();}
  c.globalAlpha=1;}
}
// ---------- P1: power ratings, then the win-chance curve
export function draw1(c,T){bg(c);
 const teams=Object.keys(D.rating).sort((a,b)=>D.rating[b]-D.rating[a]);
 const curve=sm(24.5,25.2,T);const W=lerp(1700,880,curve);
 T_(c,'战力分',90,120,76,'#fff');T_(c,'2026赛季比赛 + 拳头官方排名',380,118,40,'rgba(255,255,255,.75)');
 const x0=210,y0=160,rh=58,mn=1100,mx=1600;
 teams.forEach((t,i)=>{const y=y0+i*rh;const a=back(T,21.0+i*.09,.35);const v=D.rating[t];const w=(W-x0-150)*(v-mn)/(mx-mn)*cl(a);
  T_(c,t,x0-20,y+45,46,'#fff','right',IN);c.fillStyle=REGC[D.region[t]];rr(c,x0,y+8,Math.max(6,w),rh-14,12);c.fill();
  if(a>.2)T_(c,String(v),x0+w+16,y+45,44,'rgba(255,255,255,.92)','left',IN);});
 if(curve>0){c.globalAlpha=curve;const cx=1060,cy=200,cw=900,ch=700;
  T_(c,'单局胜率',cx,cy-40,56,'#fff');T_(c,'分差',cx+cw,cy+ch+70,44,'rgba(255,255,255,.75)','right');
  c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=3;for(let k=0;k<=4;k++){const y=cy+ch*k/4;c.beginPath();c.moveTo(cx,y);c.lineTo(cx+cw,y);c.stroke();}
  T_(c,'100%',cx-14,cy+14,34,'rgba(255,255,255,.7)','right',IN);T_(c,'50%',cx-14,cy+ch/2+12,34,'rgba(255,255,255,.7)','right',IN);T_(c,'0',cx-14,cy+ch+12,34,'rgba(255,255,255,.7)','right',IN);
  const px=d=>cx+cw*(d+400)/800,py=p=>cy+ch*(1-p);const prog=eo(cl((T-24.9)/1.2));
  c.strokeStyle=GOLD;c.lineWidth=10;c.lineCap='round';c.beginPath();for(let d=-400;d<=-400+800*prog;d+=8){const p=1/(1+Math.pow(10,-d/400));d===-400?c.moveTo(px(d),py(p)):c.lineTo(px(d),py(p));}c.stroke();
  const mk=(t0,a,b)=>{const o=back(T,t0,.3);if(o<=0)return;const d=D.rating[a]-D.rating[b];const p=1/(1+Math.pow(10,-d/400));const x=px(d),y=py(p);
   c.fillStyle='#fff';c.beginPath();c.arc(x,y,16*o,0,7);c.fill();c.save();c.translate(x,y);c.scale(o,o);
   const oy=b==='T1'?230:0;rr(c,-250,-170+oy,500,120,20);c.fillStyle='rgba(20,8,32,.85)';c.fill();c.strokeStyle=REGC[D.region[b]];c.lineWidth=4;c.stroke();
   T_(c,`${a} 对 ${b}`,-225,-97+oy,46,'#fff');T_(c,Math.round(p*100)+'%',225,-92+oy,64,GOLD,'right',IN);c.restore();};
  mk(B(13)-.0+BEAT*0,'BLG','T1');mk(B(13)+BEAT*2,'BLG','KC');c.globalAlpha=1;}
}
// ---------- P2: one simulated Swiss stage, then the best-of-five knockout
export function draw2(c,T){bg(c,'#24123d','#150a26');const S=D.swiss;
 T_(c,'瑞士轮',90,120,76,'#fff');T_(c,'其中一次模拟',340,116,40,'rgba(255,255,255,.7)');
 // positions: column = games played, row = wins - losses
 const col=g=>230+g*318,row=d=>640-d*128;const t0=29.24,dt=BEAT*1.5;const ko=sm(32.6,33.2,T);
 const step=r=>sm(t0+r*dt,t0+r*dt+.45,T);
 // node grid
 c.globalAlpha=1-ko*.85;for(let g=0;g<=5;g++)for(let d=-g;d<=g;d+=2){if(Math.abs(d)>3||(g-Math.abs(d))/2>2&&false)continue;const w=(g+d)/2,l=(g-d)/2;if(w>3||l>3)continue;if((w===3||l===3)&&g>w+l)continue;
  const x=col(g),y=row(d);if(w===3||l===3)continue;c.fillStyle='rgba(255,255,255,.05)';rr(c,x-150,y-58,300,116,24);c.fill();
  T_(c,`${w}-${l}`,x-140,y-66,34,'rgba(255,255,255,.6)','left',IN);}
 T_(c,'三胜晋级',col(5)+0,row(3)-86,46,'#62de7c','center');T_(c,'三败回家',col(5),row(-3)+100,46,'rgba(255,255,255,.7)','center');c.globalAlpha=1;
 // chips: replay the rounds
 const rec={};for(const t of Object.keys(D.rating))rec[t]=[0,0];const hist={};for(const t in rec)hist[t]=[[0,0]];
 for(const rd of S){for(const [w,l] of rd){rec[w][0]++;rec[l][1]++;}for(const t in rec)hist[t].push([...rec[t]]);}
 const slot={};// spread chips that share a node
 for(let r=0;r<=S.length;r++){const g={};for(const t in hist){const h=hist[t][Math.min(r,hist[t].length-1)];const k=h.join('-');(g[k]=g[k]||[]).push(t);}slot[r]=g;}
 const pos=(t,r)=>{const h=hist[t][r];const k=h.join('-');const arr=slot[r][k];const i=arr.indexOf(t);const n=arr.length;const g=h[0]+h[1],d=h[0]-h[1];
  const done=h[0]===3||h[1]===3;let x=col(g),y=row(d);const sp=done?0:n>1?Math.min(56,170/(n-1)):0;
  if(done){const j=i;x=col(5)+(h[0]===3?0:0);y=row(h[0]===3?3:-3)+((j%2)*0)-0;x+= (j-(n-1)/2)*0;return [x+ (j-(n-1)/2)*0,y,done,j,n];}
  return [x+(i-(n-1)/2)*sp*0, y+(i-(n-1)/2)*sp*0, done,i,n];};
 const allT=Object.keys(D.rating);
 // stack layout inside a node: up to 8 chips -> two columns of small chips
 const place=(t,r)=>{const h=hist[t][r];const key=h.join('-');const arr=slot[r][key];const i=arr.indexOf(t),n=arr.length;const g=h[0]+h[1],d=h[0]-h[1];
  const done=h[0]===3||h[1]===3;let cx=done?col(5)+40:col(g),cy=done?row(h[0]===3?3:-3):row(d);
  const per=done?4:3;const cw=done?130:102,chh=44;const rows=Math.ceil(n/per);const ci=i%per,ri=Math.floor(i/per);
  return [cx+(ci-(Math.min(n,per)-1)/2)*cw,cy+(ri-(rows-1)/2)*(chh+6)];};
 if(ko<1){c.globalAlpha=1-ko;for(const t of allT){let r=0;let f=0;for(let k=0;k<S.length;k++){const s=step(k);if(s>=1)r=k+1;else if(s>0){r=k;f=s;break;}}
  const a=place(t,r),b=place(t,Math.min(r+1,S.length));const [x,y]=[lerp(a[0],b[0],f>0?eio(f):0),lerp(a[1],b[1],f>0?eio(f):0)];const h=hist[t][r];const out=h[1]===3;
  chip(c,t,x,y,96,40,(1-ko)*(out?.45:1));}c.globalAlpha=1;}
 // knockout: three best-of-five rounds
 if(ko>0){c.globalAlpha=ko;const q=allT.filter(t=>hist[t][S.length][0]===3);
  T_(c,'八强起：全部 BO5',90,250,70,'#fff');
  const st=[['八强',B(16)+BEAT*2],['半决赛',B(16)+BEAT*4],['决赛',B(16)+BEAT*6]];
  q.forEach((t,i)=>chip(c,t,220,360+i*86,150,62,ko));
  st.forEach(([n,t0],i)=>{const o=back(T,t0,.35);if(o<=0)return;const x=640+i*450;c.save();c.translate(x+170,620);c.scale(o,o);
   rr(c,-170,-230,340,460,36);c.fillStyle='rgba(255,69,96,.16)';c.fill();c.strokeStyle=GOLD;c.lineWidth=6;c.stroke();
   T_(c,n,0,-120,64,'#fff','center');T_(c,'BO5',0,30,120,GOLD,'center',IN);T_(c,'先赢3局',0,140,48,'rgba(255,255,255,.85)','center');c.restore();
   if(i<2){c.fillStyle='rgba(255,255,255,.6)';c.beginPath();const ax=x+380;c.moveTo(ax,600);c.lineTo(ax+40,620);c.lineTo(ax,640);c.fill();}});
  c.globalAlpha=1;}
}
// ---------- P3: header behind the 3D tubes
export function draw3(c,T){bg(c,'#2d1146','#190a29');const prog=cl((T-37.3)/3.3);
 T_(c,'十万届世界赛 · 冠军分布',80,190,96,'#fff','left');
 T_(c,'已模拟 '+fmtInt(D.N*eo(prog))+' 届',PW-80,186,80,GOLD,'right',IN);}
// ---------- P4: history cards
const H10=[['2017','半决赛','SKT',3,2,'RNG'],['2022','八强','T1',3,0,'RNG'],['2022','半决赛','T1',3,1,'JDG'],['2023','八强','T1',3,0,'LNG'],['2023','半决赛','T1',3,1,'JDG'],
 ['2023','决赛','T1',3,0,'WBG'],['2024','八强','T1',3,0,'TES'],['2024','决赛','T1',3,2,'BLG'],['2025','八强','T1',3,2,'AL'],['2025','半决赛','T1',3,0,'TES']];
const H7=[['First Stand','HLE',3,0,'TES'],['MSI','GEN',3,2,'AL'],['MSI','T1',3,0,'BLG'],['MSI','T1',3,2,'AL'],['电竞世界杯','GEN',3,2,'AL'],['世界赛八强','T1',3,2,'AL'],['世界赛半决赛','T1',3,0,'TES']];
const H26=[['First Stand','BLG',3,2,'BFX',1],['MSI','BLG',3,2,'T1',1],['MSI','BLG',3,1,'HLE',1],['MSI决赛','BLG',2,3,'HLE',0]];
function card(c,x,y,w,h,top,a,sa,sb,b,colA,colB,o,s=1,glow=0){if(o<=0)return;c.save();c.globalAlpha=o;c.translate(x+w/2,y+h/2);c.scale(s,s);
 rr(c,-w/2,-h/2,w,h,22);c.fillStyle='rgba(16,7,28,.86)';c.fill();c.lineWidth=glow?7:3;c.strokeStyle=glow?REGC.LPL:'rgba(255,255,255,.28)';c.stroke();
 T_(c,top,0,-h/2+60,46,'rgba(255,255,255,.8)','center');
 T_(c,a,-w/2+22,44,48,colA,'left',IN);T_(c,b,w/2-22,44,48,colB,'right',IN);T_(c,`${sa}:${sb}`,0,48,72,'#fff','center',IN);c.restore();}
export function draw4(c,T){bg(c,'#2a1040','#170926');const a1=1-sm(56.8,57.3,T),a2=vis(T,57.1,61.2,.3),a3=sm(61.0,61.5,T);
 if(a1>0){c.globalAlpha=a1;T_(c,'2017年以来 · 世界赛BO5',PW/2,130,70,'rgba(255,255,255,.85)','center');
  const big=back(T,B(24)+.15,.4);c.save();c.translate(PW/2,300);c.scale(big,big);T_(c,'T1',-330,60,120,REGC.LCK,'center',IN);T_(c,'10 : 0',0,70,190,'#fff','center',IN);T_(c,'LPL',350,60,120,REGC.LPL,'center',IN);c.restore();
  H10.forEach((h,i)=>{const t0=B(25)+BEAT*(i*.75);const o=back(T,t0,.3);const x=34+(i%5)*398,y=470+Math.floor(i/5)*300;card(c,x,y,384,270,`${h[0]} ${h[1]}`,h[2],h[3],h[4],h[5],REGC.LCK,REGC.LPL,o*a1,cl(o));});c.globalAlpha=1;}
 if(a2>0){c.globalAlpha=a2;T_(c,'2025年 · 国际赛 LPL 对 LCK 的 BO5',PW/2,130,70,'rgba(255,255,255,.85)','center');
  const big=back(T,B(28)+.1,.4);c.save();c.translate(PW/2,310);c.scale(big,big);T_(c,'0 胜 7 负',0,70,170,'#fff','center');c.restore();
  H7.forEach((h,i)=>{const t0=B(28)+.6+BEAT*i*.5;const o=back(T,t0,.3);const x=60+(i%4)*490,y=480+Math.floor(i/4)*300;card(c,x,y,460,260,h[0],h[1],h[2],h[3],h[4],REGC.LCK,REGC.LPL,o*a2,cl(o));});c.globalAlpha=1;}
 if(a3>0){c.globalAlpha=a3;T_(c,'2026年 · BLG 的 BO5 对 LCK',PW/2,130,70,'rgba(255,255,255,.85)','center');
  const big=back(T,B(30)+.1,.4);c.save();c.translate(PW/2,310);c.scale(big,big);T_(c,'3 胜',0,70,190,REGC.LPL,'center');c.restore();
  H26.forEach((h,i)=>{const t0=B(30)+.6+BEAT*i;const o=back(T,t0,.3);const x=110+i*470,y=520;card(c,x,y,430,300,h[0],h[1],h[2],h[3],h[4],REGC.LPL,REGC.LCK,o*a3*(h[5]?1:.55),cl(o),h[5]);});
  c.globalAlpha=1;}
}
// ---------- P5: the "what if" console
export const C5={rowA:[['LYON',B(34)+BEAT],['MKOI',B(34)+BEAT*3],['T1',B(34)+BEAT*5]],rowB:[['3:2',B(36)+BEAT],['3:1',B(36)+BEAT*3],['3:0',B(36)+BEAT*5]],rowC:[['3',B(38)+BEAT],['2',B(38)+BEAT*2],['1',B(38)+BEAT*3],['0',B(39)+.02]]};
export function state5(T){const P=D.paths;const r1=Object.fromEntries(P.r1.filter(r=>r.team==='BLG').map(r=>[r.opp,r]));
 let blg=D.champ.BLG,lpl=D.reg.LPL,sel={A:null,B:null,C:null,D:false},cursor=null,hl=null;
 for(const [o,t] of C5.rowA)if(T>=t&&T<B(36)){sel.A=o;blg=r1[o].team_title*100;lpl=r1[o].lpl_title*100;hl='A';}
 for(const [o,t] of C5.rowB)if(T>=t&&T<B(38)){sel.B=o;const k=o.replace(':','-');blg=P.rec_BLG[k].title*100;hl='B';}
 for(const [o,t] of C5.rowC)if(T>=t&&T<B(40)){sel.C=o;blg=P.blg_half_lck[o].title*100;hl='C';}
 if(T>=B(40)&&T<B(42)){sel.B='3:0';sel.C='0';blg=31.3;lpl=34.9;hl='BC';}
 if(T>=B(42)){sel.D=true;lpl=45.7;blg=35.7;hl='D';}
 return {blg,lpl,sel,hl};}
export function draw5(c,T){bg(c,'#2c1145','#170926');const st=state5(T);
 T_(c,'如果……会怎样？',90,130,80,'#fff');T_(c,'改一个条件，看夺冠概率怎么变',700,126,44,'rgba(255,255,255,.75)');
 const rows=[['A','第一轮对手（BLG）',C5.rowA.map(x=>x[0]),B(34)],['B','BLG 瑞士轮战绩',C5.rowB.map(x=>x[0]),B(36)],['C','BLG 半区里的 LCK 队',C5.rowC.map(x=>x[0]),B(38)]];
 rows.forEach(([k,lab,opts,t0],i)=>{const y=270+i*230;const on=st.hl&&st.hl.includes(k);const a=T>=t0-.3||st.hl==='BC'?1:.45;
  c.globalAlpha=a*(st.hl==='D'?.2:st.hl==='BC'?(k==='A'?.15:.5):1);T_(c,lab,90,y,52,on?GOLD:'#fff');
  opts.forEach((o,j)=>{const x=90+j*220,yy=y+30,w=190,h=110;const s=st.sel[k]===o;rr(c,x,yy,w,h,22);c.fillStyle=s?'rgba(255,69,96,.85)':'rgba(255,255,255,.08)';c.fill();c.strokeStyle=s?'#fff':'rgba(255,255,255,.3)';c.lineWidth=s?5:3;c.stroke();
   T_(c,o,x+w/2,yy+76,56,'#fff','center',IN);});c.globalAlpha=1;});
 // row D
 const dA=sm(B(42)-.3,B(42),T);if(dA>0){c.globalAlpha=dA;const y=270+3*230-40;rr(c,90,y,1000,110,22);c.fillStyle='rgba(255,69,96,.85)';c.fill();T_(c,'GEN、HLE 都在四强前出局',130,y+74,54,'#fff');c.globalAlpha=1;}
 // gauges
 const g=(x,lab,v,col,big)=>{rr(c,x,240,420,640,40);c.fillStyle='rgba(10,4,20,.6)';c.fill();c.strokeStyle=col;c.lineWidth=big?8:4;c.stroke();
  T_(c,lab,x+210,330,54,'#fff','center');T_(c,pct(v),x+210,560,big?170:150,'#fff','center',IN);T_(c,'%',x+210,660,70,col,'center',IN);
  const h=420*cl(v/50);c.fillStyle=col;rr(c,x+40,850-0,340,-0,10);c.fillStyle='rgba(255,255,255,.12)';rr(c,x+40,720,340,40,20);c.fill();c.fillStyle=col;rr(c,x+40,720,Math.max(20,340*cl(v/50)),40,20);c.fill();
  T_(c,'0',x+40,808,30,'rgba(255,255,255,.6)','left',IN);T_(c,'50%',x+380,808,30,'rgba(255,255,255,.6)','right',IN);};
 const big=st.hl==='BC'||st.hl==='D';
 g(1150,'BLG 夺冠',st.blg,'#ff7a8c',st.hl==='B'||st.hl==='C');g(1600,'LPL 夺冠',st.lpl,REGC.LPL,big||st.hl==='A'||!st.hl);
 // cursor
 const clicks=[...C5.rowA.map((x,j)=>[x[1],90+j*220+150,300+76]),...C5.rowB.map((x,j)=>[x[1],90+j*220+150,530+76]),...C5.rowC.map((x,j)=>[x[1],90+j*220+150,760+76])];
 let cx=1000,cy=980,last=-9;for(let i=0;i<clicks.length;i++){const [t,x,y]=clicks[i];const pt=i?clicks[i-1]:[B(33.5),1000,980];const f=sm(t-.32,t-.04,T);if(T>=t-.32){cx=lerp(pt[1],x,eio(f));cy=lerp(pt[2],y,eio(f));}if(T>=t)last=t;}
 const cv=vis(T,B(33.6),B(40)-.2,.3);if(cv>0){c.globalAlpha=cv;const rp=T-last;if(rp<.45){c.strokeStyle='rgba(255,255,255,'+(1-rp/.45)+')';c.lineWidth=5;c.beginPath();c.arc(cx,cy,20+rp*120,0,7);c.stroke();}
  c.save();c.translate(cx,cy);c.fillStyle='#fff';c.strokeStyle='#1a0a2a';c.lineWidth=4;c.beginPath();c.moveTo(0,0);c.lineTo(0,62);c.lineTo(16,48);c.lineTo(28,74);c.lineTo(40,68);c.lineTo(28,43);c.lineTo(48,42);c.closePath();c.fill();c.stroke();c.restore();c.globalAlpha=1;}
}
// ---------- P6: the AI panel
export function draw6(c,T){bg(c,'#22103c','#140826');const A=D.ai;if(!A)return;
 T_(c,'问问 AI：谁会夺冠？',90,126,78,'#fff');T_(c,`开源模型 · 同一份资料 · 离线作答 · 每个问 ${A.samples} 次`,860,122,40,'rgba(255,255,255,.72)');
 const tally=sm(B(48)-.2,B(48)+.3,T);const gw=lerp(1880,1240,tally);
 A.models.forEach((m,i)=>{const col=i%3,row=Math.floor(i/3);const w=(gw-90-2*24)/3,h=400,x=90+col*(w+24),y=190+row*(h+28);const o=back(T,B(44)+.25+i*BEAT*.5,.3);if(o<=0)return;
  c.save();c.globalAlpha=cl(o);rr(c,x,y,w,h,22);c.fillStyle='rgba(8,3,18,.82)';c.fill();c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=3;c.stroke();
  rr(c,x,y,w,64,22);c.fillStyle='rgba(255,255,255,.1)';c.fill();{let fs=42;c.font=`900 ${fs}px ${CN}`;while(c.measureText(m.label).width>w-40&&fs>26){fs-=2;c.font=`900 ${fs}px ${CN}`;}T_(c,m.label,x+20,y+48,fs,'#fff');}
  // typed answer (own clock)
  const t0=B(46)+i*.18,chars=Math.floor(cl((T-t0)/1.6)*m.top3.length*3);
  m.top3.forEach((t,j)=>{if(chars<j*3+1)return;const yy=y+140+j*86;T_(c,`${j+1}`,x+26,yy,44,'rgba(255,255,255,.6)','left',IN);chip(c,t,x+150,yy-15,150,62,1);
   if(m.share&&j===0)T_(c,`${m.share}/${m.valid||A.samples}`,x+w-20,yy,40,GOLD,'right',IN);});
  c.restore();});
 if(tally>0){c.globalAlpha=tally;const x=1300,y=190;rr(c,x,y,660,880,24);c.fillStyle='rgba(8,3,18,.82)';c.fill();
  T_(c,'第一名得票',x+30,y+70,50,'#fff');T_(c,`共 ${A.total} 次回答`,x+630,y+68,36,'rgba(255,255,255,.7)','right');
  const mx=Math.max(...A.tally.map(r=>r[1]));A.tally.slice(0,6).forEach(([t,n],i)=>{const yy=y+130+i*120;const o=back(T,B(48)+.3+i*BEAT*.5,.3);
   chip(c,t,x+100,yy+40,140,64,cl(o));const w=380*n/mx*cl(o);c.fillStyle=REGC[D.region[t]];rr(c,x+190,yy+12,Math.max(8,w),56,14);c.fill();T_(c,String(n),x+200+w+12,yy+58,48,'#fff','left',IN);});
  c.globalAlpha=1;}
}
// ---------- P8: the close
export function draw8(c,T){bg(c,'#3a1350','#1c0a2e');const teams=Object.keys(D.rating).sort((a,b)=>D.rating[b]-D.rating[a]);
 const a1=1-sm(B(58)-.2,B(58)+.2,T),a2=vis(T,B(58),B(61.74)+1,.3)*(1-sm(B(60)-.2,B(60)+.2,T)),a3=sm(B(60)-.2,B(60)+.2,T);
 // 16 chips in a ring
 const R0=400;teams.forEach((t,i)=>{const ang=-Math.PI/2+i*2*Math.PI/16+T*.05;const x=PW/2+Math.cos(ang)*R0*1.5,y=600+Math.sin(ang)*R0;chip(c,t,x,y,150,64,.9*(a1*.9+.25));});
 const a1t=a1*sm(B(56)+.3,B(56)+.7,T);if(a1t>0){c.globalAlpha=a1t;T_(c,'模型不会打比赛',PW/2,560,110,'#fff','center');T_(c,'选手会',PW/2,720,130,GOLD,'center');c.globalAlpha=1;}
 if(a2>0){c.globalAlpha=a2;T_(c,'10月24日 凌晨',PW/2,520,90,'#fff','center');T_(c,'瑞士轮开打',PW/2,700,150,GOLD,'center');c.globalAlpha=1;}
 if(a3>0){c.globalAlpha=a3;T_(c,'你觉得',PW/2,520,100,'#fff','center');T_(c,'谁会夺冠？',PW/2,710,160,GOLD,'center');c.globalAlpha=1;}
}
