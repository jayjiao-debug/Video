import * as THREE from 'three';
import {U as UT} from './util.js';
import {makeDoors} from './doors.js';
import {makePhones} from './phones.js';
import {makeWorld} from './world.js';
const {cl,pr,eio,eo,sst,lerp,pop}=UT;
const $=id=>document.getElementById(id);
const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(1920,1080);R.outputColorSpace=THREE.SRGBColorSpace;R.setClearColor(0x02040a,1);document.body.prepend(R.domElement);
/* ---------- compositor ---------- */
const rtA=new THREE.WebGLRenderTarget(1920,1080,{samples:4,type:THREE.HalfFloatType}),rtB=new THREE.WebGLRenderTarget(1920,1080,{samples:4,type:THREE.HalfFloatType});
const qS=new THREE.Scene(),qC=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const qM=new THREE.ShaderMaterial({uniforms:{a:{value:rtA.texture},b:{value:rtB.texture},f:{value:0},fl:{value:0},ma:{value:1},mb:{value:1},ex:{value:1}},vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}`,
 fragmentShader:`uniform sampler2D a,b;uniform float f,fl,ma,mb,ex;varying vec2 v;
 vec3 fit(vec3 v){vec3 a=v*(v+0.0245786)-0.000090537;vec3 b=v*(0.983729*v+0.4329510)+0.238081;return a/b;}
 vec3 aces(vec3 c){const mat3 I=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777));const mat3 O=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602));c*=ex/0.6;c=I*c;c=fit(c);c=O*c;return clamp(c,0.,1.);}
 vec3 srgb(vec3 c){c=clamp(c,0.,1.);return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-0.055,step(0.0031308,c));}
 vec3 tm(vec3 c,float m){return srgb(m>.5?aces(c):c);}
 void main(){vec2 q=v-.5;float vig=1.-.28*dot(q,q)*2.;vec3 A=tm(texture2D(a,v).rgb,ma),B=tm(texture2D(b,v).rgb,mb);vec3 c=mix(A,B,f)*vig+vec3(1.,.95,.86)*fl;gl_FragColor=vec4(c,1.);}`});
qS.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),qM));
const doors=await makeDoors(THREE,R),phones=await makePhones(THREE,R),world=await makeWorld(THREE,R);
const GLW=[[0,21.7,doors],[20.9,41.2,phones],[72.6,75.3,doors],[74.7,89.9,world],[117.3,130,doors]];
/* ---------- 2D ---------- */
const G='#F6CF78',RG='#ffb3a0',BL='#a9bde8',RED='#ff6a5a',GR='#7d8597';
const fx=$('fx'),X=fx.getContext('2d',{willReadFrequently:true});
let seed=13;const rng=()=>(seed=(seed*16807)%2147483647)/2147483647;
const card=(x,y,w,h,inner,st='')=>`<div class="card" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}">${inner}</div>`;
const note=(t,o=1,y=900)=>`<div class="t" style="left:960px;top:${y}px;transform:translateX(-50%);font-size:22px;color:${GR};font-weight:700;opacity:${o}">${t}</div>`;
function dot(x,y,r,c,a=1,glow=12){X.globalAlpha=a;X.shadowBlur=glow;X.shadowColor=c;X.fillStyle=c;X.beginPath();X.arc(x,y,r,0,7);X.fill();X.shadowBlur=0;}
// LOTTO 40.9–53.0
const CONF=Array.from({length:60},()=>[rng(),rng(),rng()]);
function LOTTO(T,o){const t1=pop(T,41.2,.5);const ph=eio(pr(T,41.0,42.0));
 for(let i=0;i<22;i++){const a=pr(T,42.2+i*.03,42.6+i*.03);dot(500+(i%11)*48,330+Math.floor(i/11)*54,14,G,o*a,16);dot(1124+(i%11)*48,330+Math.floor(i/11)*54,14,'#e9e3d6',o*a,6);}
 CONF.forEach(([a,b,c])=>{const k=pr(T,41.4+c*.4,43.8+c*.6);if(k<=0||k>=1)return;X.globalAlpha=o*(1-k);X.fillStyle=c>.5?G:'#fff2c8';X.save();X.translate(520+a*440,250+eo(k)*240+b*40);X.rotate(k*8+a*6);X.fillRect(-5,-2,10,4);X.restore();});
 const m1=eio(pr(T,45.2,46.6)),m2=eio(pr(T,49.2,50.6));const bar=(x,h,c,lab)=>`<div class="bar" style="left:${x}px;top:${820-h}px;width:120px;height:${h}px;border-radius:12px 12px 0 0;background:${c}"></div><div class="t" style="left:${x+60}px;top:832px;transform:translateX(-50%);font-size:28px;color:#e9e3d6">${lab}</div>`;
 const showA=pr(T,44.9,45.3)*(1-pr(T,48.6,49.0)),showB=pr(T,48.98,49.4);
 return `<div class="lbl" style="left:960px;top:170px;transform:translateX(-50%)">1978 · 彩票大奖得主 vs 普通人</div>
 <div class="t" style="left:762px;top:250px;transform:translateX(-50%);font-size:34px;color:${G};opacity:${pr(T,42.2,42.6)}">22 位大奖得主</div><div class="t" style="left:1344px;top:250px;transform:translateX(-50%);font-size:34px;color:#e9e3d6;opacity:${pr(T,42.2,42.6)}">22 位普通人</div>
 <div style="position:absolute;left:840px;top:${lerp(380,140,0)}px;width:240px;height:130px;opacity:${ph*(1-pr(T,42.0,42.4))};transform:perspective(900px) rotateY(${lerp(90,0,ph)}deg) scale(${t1});border-radius:14px;background:linear-gradient(135deg,#fff1c7,#f6cf78 45%,#c8963e);display:flex;align-items:center;justify-content:center;font-size:56px;font-weight:900;color:#3a2a10;box-shadow:0 0 60px rgba(246,207,120,.6)">大奖</div>
 <div style="opacity:${showA}"><div class="lbl" style="left:960px;top:470px;transform:translateX(-50%)">整体有多快乐</div>${bar(700,250*m1,G,'大奖得主')}${bar(1100,244*m1,'#e9e3d6','普通人')}<div class="t serif" style="left:960px;top:640px;transform:translateX(-50%);font-size:90px;color:#fff;opacity:${pr(T,46.4,46.8)}">≈</div></div>
 <div style="opacity:${showB}"><div class="lbl" style="left:960px;top:470px;transform:translateX(-50%)">从日常小事里得到的快乐</div>${bar(700,140*m2,G,'大奖得主')}${bar(1100,240*m2,'#e9e3d6','普通人')}
  <div class="t" style="left:960px;top:510px;transform:translateX(-50%);font-size:30px;color:#c9b98f;opacity:${pr(T,50.4,50.8)}">平常的小乐子，没那么香了</div></div>
 ${note('Brickman, Coates &amp; Janoff-Bulman (1978) · 柱高为示意，方向来自论文',pr(T,45,45.5),892)}`;}
// MONEY 53.0–73.2 : log-income chart drawn on canvas
const CX0=330,CX1=1600,CY0=760,CY1=250;const xL=f=>CX0+(CX1-CX0)*f,yL=v=>CY0-(CY0-CY1)*v;const X75=.42,X100=.50;
const TICKS=[['$1.5万',0],['$3万',.17],['$6万',.36],['$12万',.55],['$25万',.75],['$50万+',.95]];
function line(fn,f0,f1,c,w,a,dash){X.globalAlpha=a;X.strokeStyle=c;X.lineWidth=w;X.setLineDash(dash||[]);X.shadowBlur=14;X.shadowColor=c;X.beginPath();for(let k=0;k<=80;k++){const f=lerp(f0,f1,k/80);const p=[xL(f),yL(fn(f))];k?X.lineTo(...p):X.moveTo(...p);}X.stroke();X.setLineDash([]);X.shadowBlur=0;}
const kd=f=>f<X75?.1+.62*(f/X75)-.12*Math.pow(f/X75,3):.6;
const mk=f=>.12+.62*f;
const PCT=[[.85,'最快乐',G,f=>.42+.5*f+.18*Math.pow(f,3)],[.7,'',G,f=>.32+.52*f],[.5,'中间',G,f=>.22+.52*f],[.3,'',G,f=>.13+.5*f],[.15,'最不快乐',BL,f=>f<X100?.03+.52*f:.03+.52*X100+.02*(f-X100)]];
function MONEY(T,o){X.globalAlpha=o*.35;X.strokeStyle='#9aa2b4';X.lineWidth=1.5;X.beginPath();X.moveTo(CX0,CY0);X.lineTo(CX1,CY0);X.moveTo(CX0,CY0);X.lineTo(CX0,CY1-30);X.stroke();
 let h='';TICKS.forEach(([s,f])=>{h+=`<div class="t" style="left:${xL(f)}px;top:${CY0+16}px;transform:translateX(-50%);font-size:24px;color:${GR};font-weight:700">${s}</div>`;});
 h+=`<div class="t" style="left:${CX0-20}px;top:${CY1-60}px;font-size:26px;color:${GR};font-weight:700">快乐 ↑</div><div class="t" style="left:${CX1-40}px;top:${CY0+56}px;font-size:24px;color:${GR};font-weight:700">年收入（对数刻度）→</div>`;
 const a=eio(pr(T,53.3,55.6)),b=eio(pr(T,57.3,59.6)),fan=eio(pr(T,65.4,67.6)),low=pr(T,69.3,69.8);
 const kdA=1-pr(T,64.8,65.6),mkA=1-pr(T,64.8,65.6);
 if(kdA>0)line(kd,0,a,'#e9e3d6',4,o*kdA*(T>57?(T>61.1?.9:.5):1),[10,8]);
 if(T>57&&mkA>0)line(mk,0,b,G,5,o*mkA);
 if(T>65){PCT.forEach(([p,lab,c,fn],i)=>{const isLow=i===4;const al=isLow?(.6+.4*low):(1-.55*low);line(fn,0,fan,c,isLow?5:3.5,o*al*(i===0||isLow?1:.8));
   if(fan>.95&&lab)h+=`<div class="t" style="left:${xL(.97)+14}px;top:${yL(fn(.97))-18}px;font-size:26px;color:${c};opacity:${isLow?1:1-.5*low}">${lab}</div>`;});}
 const kdo=pr(T,55.4,55.9)*(1-pr(T,64.8,65.4));if(kdo>0)h+=`<div style="opacity:${kdo}"><div style="position:absolute;left:${xL(X75)}px;top:${CY1-20}px;height:${CY0-CY1+20}px;border-left:2px dashed rgba(233,227,214,.35)"></div><div class="t serif" style="left:${xL(X75)+14}px;top:${yL(.6)-80}px;font-size:44px;color:#e9e3d6">$7.5万 · 到顶？</div></div>`;
 const mko=pr(T,59.4,59.9)*(1-pr(T,64.8,65.4));if(mko>0)h+=`<div class="t serif" style="left:${xL(.86)}px;top:${yL(mk(.86))-84}px;transform:translateX(-50%);font-size:44px;color:${G};opacity:${mko}">没有顶</div>`;
 const vs=pr(T,61.2,61.7)*(1-pr(T,65.0,65.4));if(vs>0)h+=`<div style="opacity:${vs}">${card(660,120,600,110,`<div class="t" style="left:0;right:0;top:20px;text-align:center;font-size:30px;color:#fff">卡尼曼 × Killingsworth × Mellers</div><div class="t" style="left:0;right:0;top:64px;text-align:center;font-size:22px;color:${G};letter-spacing:4px">2023 · 对抗性合作 · 重新算同一份数据</div>`)}</div>`;
 if(low>0)h+=`<div style="opacity:${low}"><div style="position:absolute;left:${xL(X100)}px;top:${CY1-20}px;height:${CY0-CY1+20}px;border-left:2px dashed rgba(169,189,232,.55)"></div><div class="t serif" style="left:${xL(X100)+14}px;top:${CY0-70}px;font-size:46px;color:${BL}">$10万</div></div>`;
 const src=T<57?'Kahneman &amp; Deaton (2010) PNAS · 45万份回答':(T<61.1?'Killingsworth (2021) PNAS · 3.3万人 · 172万条手机记录':'Killingsworth, Kahneman &amp; Mellers (2023) PNAS');
 const lead=T<57?`<div class="t" style="left:120px;top:140px;font-size:30px;color:#e9e3d6;opacity:${pr(T,53.2,53.6)}">诺奖得主 · 卡尼曼</div>`:'';
 return `${h}${lead}${note(src+' · 曲线为示意',1,880)}`;}
// VENN 89.5–101.6
function VENN(T,o){const join=eio(pr(T,89.7,91.4)),st=eio(pr(T,93.7,95.6)),flow=pr(T,97.6,98.2);const cx=960,cy=470,sep=lerp(520,250,join);
 const rH=lerp(230,190,st),rM=lerp(230,265,st);const aH=lerp(1,.55,st),aM=lerp(1,1.25,st);
 const ring=(x,r,c,a)=>{X.globalAlpha=o*Math.min(1,a);X.strokeStyle=c;X.lineWidth=6;X.shadowBlur=30*a;X.shadowColor=c;X.beginPath();X.arc(x,cy,r,0,7);X.stroke();X.shadowBlur=0;X.globalAlpha=o*.08*a;X.fillStyle=c;X.fill();};
 ring(cx-sep/2,rH,RG,aH);ring(cx+sep/2,rM,G,aM);
 if(flow>0){for(let k=0;k<60;k++){const ang=k/60*6.283+T*.2;const ph=((T*.5+k*.137)%1);const rr1=lerp(rH+90,rH*.2,ph),rr2=lerp(rM*.2,rM+110,ph);
   dot(cx-sep/2+Math.cos(ang)*rr1,cy+Math.sin(ang)*rr1,3,RG,o*flow*Math.sin(Math.PI*ph),8);dot(cx+sep/2+Math.cos(ang)*rr2,cy+Math.sin(ang)*rr2,3,G,o*flow*Math.sin(Math.PI*ph),8);}}
 let h=`<div class="t serif" style="left:${cx-sep/2-rH*.55}px;top:${cy-50}px;transform:translateX(-50%);font-size:64px;color:${RG};opacity:${aH>.7?1:.7}">快乐</div><div class="t serif" style="left:${cx+sep/2+rM*.55}px;top:${cy-50}px;transform:translateX(-50%);font-size:64px;color:${G}">意义</div>
 <div class="t" style="left:${cx}px;top:${cy-24}px;transform:translateX(-50%);font-size:30px;color:#fff;opacity:${pr(T,91.2,91.7)*(1-pr(T,93.4,93.8))}">大部分重叠</div>`;
 if(T>93.5){const v=st;h+=`<div style="opacity:${pr(T,93.5,93.9)*(1-pr(T,97.4,97.8))}"><div class="lbl" style="left:${cx}px;top:760px;transform:translateX(-50%)">压力 · 担心 · 焦虑</div><div style="position:absolute;left:${cx-300}px;top:800px;width:600px;height:12px;border-radius:6px;background:rgba(255,255,255,.1)"><div style="width:${v*100}%;height:100%;border-radius:6px;background:linear-gradient(90deg,${RG},${RED})"></div></div>
  <div class="t" style="left:${cx-sep/2-rH*.55}px;top:${cy+30}px;transform:translateX(-50%);font-size:40px;color:${RG};opacity:${v}">↓</div><div class="t" style="left:${cx+sep/2+rM*.55}px;top:${cy+30}px;transform:translateX(-50%);font-size:40px;color:${G};opacity:${v}">↑</div></div>`;}
 if(flow>0)h+=`<div class="t" style="left:${cx-sep/2-rH*.55}px;top:${cy+40}px;transform:translateX(-50%);font-size:40px;color:#fff;opacity:${flow}">得到</div><div class="t" style="left:${cx+sep/2+rM*.55}px;top:${cy+40}px;transform:translateX(-50%);font-size:40px;color:#fff;opacity:${flow}">给出</div>`;
 return `<div class="lbl" style="left:960px;top:150px;transform:translateX(-50%)">一项大规模调查 · 区分快乐和意义</div>${h}${note('Baumeister, Vohs, Aaker &amp; Garbinsky (2013) J. Positive Psychology',1,880)}`;}
// LIFE 101.6–109.7 : two curves over 14 years (shape is illustrative)
function LIFE(T,o){const k=eio(pr(T,101.9,108.6));const yrs=Math.round(14*k);const x0=360,x1=1560,y0=300,y1=760;const yP=f=>y0+150*Math.pow(f,1.6),yN=f=>y0+330*Math.pow(f,1.5);
 X.globalAlpha=o*.3;X.strokeStyle='#9aa2b4';X.lineWidth=1.5;X.beginPath();X.moveTo(x0,y1);X.lineTo(x1,y1);X.stroke();
 const cv=(fn,c,w)=>{X.globalAlpha=o;X.strokeStyle=c;X.lineWidth=w;X.shadowBlur=14;X.shadowColor=c;X.beginPath();for(let i=0;i<=80;i++){const f=k*i/80;const p=[lerp(x0,x1,f),fn(f)];i?X.lineTo(...p):X.moveTo(...p);}X.stroke();X.shadowBlur=0;};
 cv(yN,'#9aa2b4',4);cv(yP,G,5);
 const d=pr(T,105.8,106.4);
 return `<div class="lbl" style="left:${x0}px;top:200px">美国中年人跟踪研究 · 仍然在世的比例</div>
 <div class="t serif" style="left:${lerp(x0,x1,k)+16}px;top:${yP(k)-70}px;font-size:40px;color:${G};opacity:${d}">人生有目标</div><div class="t" style="left:${lerp(x0,x1,k)+16}px;top:${yN(k)+10}px;font-size:32px;color:#c9cfdb;opacity:${d}">目标感低</div>
 ${[0,2,4,6,8,10,12,14].map(y=>`<div class="t" style="left:${lerp(x0,x1,y/14)}px;top:${y1+14}px;transform:translateX(-50%);font-size:22px;color:${GR};font-weight:700">${y}年</div>`).join('')}
 <div class="t serif" style="left:1560px;top:150px;transform:translateX(-100%);font-size:110px;color:${G};line-height:1">${yrs}<span style="font-size:42px"> 年</span></div>
 ${note('Hill &amp; Turiano (2014) Psychological Science · 已控制其他幸福感指标 · 曲线为示意',1,880)}`;}
// SUMMARY 109.7–117.8
const SUMH=[['46.9%','的清醒时间在走神，走神时更不开心'],['22 位','大奖得主，并没有更快乐'],['20%','最不快乐的人，过了10万美元就不涨']];
const SUMM=[['132 国','穷国的人，反而更觉得人生有意义'],['压力 ↑','意义越高，快乐越低'],['14 年','有目标的人，活得更久']];
function SUM(T,o){const col=(x,title,c,rows,t0)=>`<div class="t serif" style="left:${x}px;top:170px;font-size:72px;color:${c};opacity:${pr(T,t0-.2,t0+.2)}">${title}</div>`+rows.map(([n,s],i)=>{const t=t0+.3+i*.35;const u=eo(pr(T,t,t+.5));return `<div style="position:absolute;left:${x}px;top:${300+i*150+20*(1-u)}px;width:640px;opacity:${u}"><div class="serif" style="font-size:60px;font-weight:900;color:${c};line-height:1.1">${n}</div><div style="font-size:30px;font-weight:700;color:#e9e3d6;margin-top:6px">${s}</div></div>`;}).join('');
 const dimq=pr(T,113.8,114.4);
 return `<div style="opacity:${1-.6*dimq}">${col(220,'快乐',RG,SUMH,110.0)}${col(1060,'意义',G,SUMM,110.6)}<div style="position:absolute;left:960px;top:200px;height:600px;border-left:1px solid rgba(246,207,120,.25)"></div></div>
 <div class="t serif" style="left:960px;top:420px;transform:translateX(-50%) scale(${pop(T,113.9,.5)});font-size:150px;color:#fff;opacity:${dimq}">?</div>`;}
const SCN=[{w:[40.9,53.0],f:LOTTO},{w:[53.0,73.0],f:MONEY},{w:[89.5,101.6],f:VENN},{w:[101.6,109.7],f:LIFE},{w:[109.7,117.6],f:SUM}];
/* world HUD 74.7–89.6 */
function worldHud(T){if(T<75||T>89.9)return '';const o=pr(T,75.6,76.2)*(1-pr(T,89.2,89.7));const s1=pr(T,77.3,77.8),s2=pr(T,81.4,81.7),s3=pr(T,85.5,86);
 const arrow=(up,c,on,big=1)=>`<span class="serif" style="display:inline-block;font-size:${64*big}px;color:${c};opacity:${on};transform:scale(${on>0?1:0})">${up?'↑':'↓'}</span>`;
 return `<div style="opacity:${o}">${card(110,170,560,470,`<div class="lbl" style="left:36px;top:30px">Gallup 世界民意调查 · 132 国</div>
  <div class="t" style="left:250px;top:84px;font-size:28px;color:#e9e3d6">富裕国家</div><div class="t" style="left:410px;top:84px;font-size:28px;color:#e9e3d6">贫穷国家</div>
  <div class="t" style="left:36px;top:160px;font-size:34px;color:#fff">对生活满意</div><div class="t" style="left:275px;top:130px">${arrow(1,G,s1)}</div><div class="t" style="left:440px;top:130px">${arrow(0,GR,s1)}</div>
  <div class="t" style="left:36px;top:280px;font-size:34px;color:#fff">觉得有意义</div><div class="t" style="left:275px;top:250px">${arrow(0,GR,s2)}</div><div class="t" style="left:440px;top:236px">${arrow(1,G,s2,1.3)}</div>
  <div class="t" style="left:36px;top:390px;font-size:28px;color:${G};opacity:${s3}">原因之一：宗教信仰更强</div>`)}
 ${note('Oishi &amp; Diener (2014) Psychological Science',1,880)}</div>`;}
/* doors labels */
function doorHud(T){const lab=(x,t,c,o)=>{if(o<=0)return '';const p=new THREE.Vector3(x,4.95,0).project(doors.cam);if(p.z>1)return '';if((-p.y*.5+.5)*1080-60<90)return '';return `<div class="t serif" style="left:${(p.x*.5+.5)*1920}px;top:${(-p.y*.5+.5)*1080-60}px;transform:translateX(-50%);font-size:52px;color:${c};opacity:${o};text-shadow:0 0 30px rgba(0,0,0,.9)">${t}</div>`;};
 let o=0;if(T<20.5)o=pr(T,1.5,2.4)*(1-pr(T,16.2,16.6));else if(T>118)o=pr(T,118.4,119.2)*(1-pr(T,125,125.4));if(o<=0)return '';
 const oL=o*(T<20.5?(T>8.5&&T<12.5?.45:1):1),oR=o*(T<20.5?(T>4.4&&T<8.5?.45:1):1);return lab(-3.2,'快乐',RG,oL)+lab(3.2,'意义',G,oR);}
/* timing */
const LINES=[[0,4.4,'今晚，你面前有[两扇门]'],[4.4,8.5,'一扇：刷两小时手机，[很开心]'],[8.5,12.5,'一扇：去做那件[很难的事]'],[12.5,16.4,'哪一扇，会让你[过得更好]？'],
 [20.6,24.7,'先拆“快乐”。哈佛做过一个[手机实验]'],[24.7,28.7,'随机提醒2250人：你[现在]开心吗？'],[28.7,32.8,'结果，人有[46.9%]的清醒时间在走神'],[32.8,36.8,'而走神的时候，人通常[更不开心]'],[36.8,40.9,'快乐，只住在[此刻]'],
 [40.9,44.9,'那中大奖呢？研究者找来[22位]彩票得主'],[44.9,48.9,'他们并不比普通人[更快乐]'],[48.98,53.0,'从日常小事里得到的快乐，反而[更少]'],
 [53.0,57.0,'诺奖得主卡尼曼说：年入[7.5万美元]，快乐到顶'],[57.0,61.1,'做手机实验的那位学者说：[没有顶]'],[61.1,65.1,'结论打架，两人决定[一起重算]'],[65.2,69.2,'结果：大多数人，钱越多[越快乐]'],[69.2,73.2,'只有最不快乐的约20%，过了[10万美元]就不涨'],
 [73.2,77.2,'再拆“意义”。一份调查，横跨[132个国家]'],[77.2,81.3,'富裕国家的人，对生活[更满意]'],[81.4,85.4,'可穷国的人，反而觉得人生[更有意义]'],[85.4,89.5,'原因之一：他们[更虔诚]'],
 [89.5,93.5,'另一项研究发现：快乐和意义，大部分[重叠]'],[93.5,97.6,'但压力越大：意义[越高]，快乐[越低]'],[97.6,101.6,'快乐更像[得到]，意义更像[给出]'],
 [101.6,105.7,'还有一项研究，跟踪了成年人[14年]'],[105.7,109.7,'觉得人生有目标的人，[活得更久]'],
 [109.7,113.8,'快乐，是此刻的[感受]；意义，是一生的[故事]'],[113.8,117.8,'科学能算出代价，但[选不了答案]'],
 [117.8,121.9,'一百多年前，有本小说写：“我们生来[不是为了幸福]”'],[121.9,125.4,'你呢？今晚，[推开哪一扇]？']];
window.LINES=LINES;
const SRC=[[20.6,40.9,'','Killingsworth &amp; Gilbert (2010) Science · 哈佛'],[117.8,121.9,'','André Gide《La Porte étroite》(1909) · 1947年诺贝尔文学奖得主']];
window.renderAt=function(T){
 const act=[];for(const [a,b,s] of GLW){if(T>=a&&T<=b)act.push([s,pr(T,a,a+0.6)*(1-pr(T,b-0.6,b))]);}
 for(const [s] of act)s.update(T);
 let flash=0;for(const [s] of act)if(s.flash)flash=Math.max(flash,s.flash(T));
 if(act.length===0){R.setRenderTarget(null);R.clear();}
 else{const a=act[0],b=act[1]||null;R.setRenderTarget(rtA);R.clear();R.render(a[0].scene,a[0].cam);let f=0;if(b){R.setRenderTarget(rtB);R.clear();R.render(b[0].scene,b[0].cam);const sa=a[1],sb=b[1];f=sb/Math.max(1e-4,sa+sb);if(sa>=.999&&sb<1)f=sb;if(sb>=.999)f=sa<1?1-sa:1;}
  qM.uniforms.f.value=b?f:0;qM.uniforms.ma.value=a[0].linear?0:1;qM.uniforms.mb.value=b&&b[0].linear?0:1;qM.uniforms.fl.value=flash;R.setRenderTarget(null);R.render(qS,qC);}
 const glOp=Math.max(0,...act.map(x=>x[1]));R.domElement.style.opacity=Math.max(glOp,flash>0?1:0);
 X.setTransform(1,0,0,1,0,0);X.globalAlpha=1;X.clearRect(0,0,1920,1080);X.fillStyle='rgba(0,0,0,0.004)';X.fillRect(0,0,2,2);
 let h='',twoD=0;for(const s of SCN){const [a,b]=s.w;if(T<a-0.5||T>b+0.5)continue;const e=eio(pr(T,a-0.5,a+0.5)),x=eio(pr(T,b-0.5,b+0.5)),o=e*(1-x),sc=1+0.03*sst(pr(T,a,b));twoD=Math.max(twoD,o);
  X.save();X.translate(960,540);X.scale(sc,sc);X.translate(-960,-540);h+=`<div class="sc" style="opacity:${o};transform:scale(${sc})">${s.f(T,o)}</div>`;X.restore();}
 $('world').innerHTML=h;$('bg2').style.opacity=Math.min(1,twoD*1.2);
 $('hud').innerHTML=(phones.hud?phones.hud(T):'')+worldHud(T)+doorHud(T);
 $('dim').style.opacity=0.5*pr(T,16.4,16.9)*(1-pr(T,20.3,20.9));
 const sr=SRC.find(s=>T>=s[0]&&T<s[1]);$('src').style.opacity=sr?pr(T,sr[0],sr[0]+0.4)*(1-pr(T,sr[1]-0.3,sr[1])):0;if(sr)$('src').innerHTML=`${sr[2]?`<i>${sr[2]}</i>`:''}${sr[3]}`;
 const L=LINES.find(l=>T>=l[0]&&T<l[1]);$('sub').innerHTML=L&&T<125.4?'<span>'+L[2].replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';
 $('plaque').style.opacity=pr(T,16.58,16.9)*(1-pr(T,20.2,20.8));$('plaque').style.transform=`scale(${1.06-0.06*eo(pr(T,16.58,17.3))})`;
 $('end').style.opacity=pr(T,125.4,126.4);};
await document.fonts.load('900 60px "Noto Sans CJK SC"');await document.fonts.load('900 60px "Noto Serif CJK SC"');await document.fonts.ready;window.renderAt(0);window.READY=true;
