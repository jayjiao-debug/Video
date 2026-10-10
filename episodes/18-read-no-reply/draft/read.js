// 《已读不回，为什么这么难受？》 draft film — every frame is a pure function of T
(function(){
const INK='#232533',RED='#E8413C',BLU='#2F6FC0',YEL='#F2C46B',GRY='#8E9BB8';
const hm=m=>{m=Math.floor(m);return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
const chatScreen=(T,clock,opts={})=>{const fly=opts.fly?eo(pr(T,-0.2,0.45)):1;const readK=opts.readAt!=null?pr(T,opts.readAt,opts.readAt+0.25):1;
 return `<div class="sb"><span>${clock}</span><span>5G ▮▮▮</span></div><div class="top">小林</div>
 <div style="text-align:center;font-size:20px;color:#999;margin:26px 0 10px">20:41</div>
 <div class="row" style="justify-content:flex-end;transform:translate(${(1-fly)*40}px,${(1-fly)*420}px) scale(${lerp(0.7,1,fly)});opacity:${fly}"><div class="bub me">在吗？明天有空吗</div><div class="av" style="background:${YEL}"></div></div>
 <div class="read" style="font-size:${lerp(26,34,readK)}px;color:${readK>0.5?'#3b4050':'#9aa0aa'}">${readK>0.5?'已读':'送达'}</div>
 ${opts.reply?opts.reply:''}
 <div style="position:absolute;bottom:0;left:0;right:0;height:96px;background:#F7F7F7;border-top:1px solid #ddd;display:flex;align-items:center;padding:0 22px"><div style="flex:1;height:58px;background:#fff;border-radius:10px;font-size:26px;padding:12px 16px;color:#333">${opts.typing||''}</div></div>`;};
const S1=T=>{
 const mins=20*60+41+(T<7.4?0:Math.min(146,Math.pow(pr(T,7.4,14.0),1.3)*146));
 const away=sst(pr(T,11.6,12.3))*(1-sst(pr(T,12.9,13.6)));
 const draft='是不是我说错';const ty=T<14?'':(T<15.2?draft.slice(0,Math.floor(pr(T,14,15.2)*draft.length)):draft.slice(0,Math.max(0,draft.length-Math.floor(pr(T,15.6,16.3)*draft.length))));
 const list=`<div style="position:absolute;inset:0;background:#fff;transform:translateX(${(1-away)*-100}%)"><div class="sb"><span>${hm(mins)}</span><span>5G ▮▮▮</span></div><div class="top" style="background:#F7F7F7;padding:16px 0 18px;text-align:center;font-size:28px;font-weight:700">微信</div>
  ${['小林 · 在吗？明天有空吗','家人群 · [3条]','工作群 · [12条]'].map((t,i)=>`<div style="display:flex;gap:16px;align-items:center;padding:20px 22px;border-bottom:1px solid #eee"><div class="av" style="background:${i==0?'#B9C3D6':'#d5d9e2'}"></div><div style="font-size:26px">${t}</div></div>`).join('')}</div>`;
 const tm=Math.round((mins-(20*60+41)));const big=pr(T,7.4,7.8);
 return `${P(720,60,`<div style="position:absolute;inset:0;transform:translateX(${away*100}%)">${chatScreen(T,hm(mins),{fly:true,readAt:3.4,typing:ty+(T>14&&T<16.4&&T%0.8<0.4?'|':'')})}</div>${list}`,'chat')}
 <div class="tag chip" style="left:330px;top:250px;background:${INK};color:#fff;font-size:52px;transform:scale(${pop(T,3.6)});opacity:${pop(T,3.6)>0?1:0}">已读</div>
 <svg style="position:absolute;left:0;top:0;opacity:${pr(T,3.8,4.1)}" width="1920" height="1080"><path d="M540 292 C 660 292 720 292 860 262" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M842 246 L 866 262 L 840 280" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
 <div class="tag" style="left:1260px;top:260px;font-size:130px;color:${tm>60?RED:INK};opacity:${big};letter-spacing:4px">${Math.floor(tm/60)}:${String(tm%60).padStart(2,'0')}</div>
 <div class="tag" style="left:1270px;top:420px;font-size:36px;color:#6b6f80;opacity:${big}">已读之后，过去了</div>`;};
const fig=(x,y,c,arm,sad)=>`<div style="position:absolute;left:${x}px;top:${y}px;width:120px"><div style="width:96px;height:96px;border-radius:50%;margin:0 auto;background:${c}"></div><div style="width:120px;height:150px;border-radius:60px 60px 18px 18px;margin-top:10px;background:${c};transform:scaleY(${sad?0.92:1});transform-origin:bottom"></div>${arm?`<div style="position:absolute;top:110px;left:-30px;width:180px;height:16px;background:${c};border-radius:8px;transform:rotate(${-20+arm*10}deg)"></div>`:''}</div>`;
const S2=T=>{ // Cyberball: the ball stops coming to you
 const A=[580,330],B=[1220,330],Y=[900,600];const seq=[A,B,Y,A,B,A,B,A,B,A,B,A,B,A,B,A,B];const t0=22.2,per=1.1;
 const n=Math.floor(cl((T-t0)/per,0,seq.length-1.001)),u=sst(cl((T-t0)/per-n));const p0=seq[n],p1=seq[n+1];
 const bx=lerp(p0[0],p1[0],u)+50,by=lerp(p0[1],p1[1],u)-Math.sin(Math.PI*u)*160;
 const mood=lerp(1,0.25,eo(pr(T,29,36)));const told=pop(T,36.9);
 return `<div style="position:absolute;left:360px;top:110px;width:1200px;height:760px;border-radius:30px;background:#fff;box-shadow:0 30px 80px rgba(40,40,70,.18)"></div>
 <div class="tag" style="left:400px;top:140px;font-size:26px;color:#9aa0aa">Cyberball · 抛球小游戏</div>
 ${fig(A[0],A[1],GRY)}${fig(B[0],B[1],GRY)}${fig(Y[0],Y[1],YEL,T>29?Math.sin(T*3)*0.5+0.5:0,T>33)}
 <div style="position:absolute;left:${bx}px;top:${by}px;width:56px;height:56px;border-radius:50%;background:#F28C28;box-shadow:0 8px 18px rgba(0,0,0,.18)"></div>
 <div class="tag" style="left:935px;top:870px;font-size:34px;color:#B07A10">你</div>
 <div style="position:absolute;left:1610px;top:260px;width:60px;height:420px;border-radius:30px;background:#fff;box-shadow:0 10px 30px rgba(40,40,70,.15);overflow:hidden;opacity:${pr(T,32.8,33.3)}"><div style="position:absolute;left:0;right:0;bottom:0;height:${mood*100}%;background:${mood>0.5?'#7BC47F':RED}"></div></div>
 <div class="tag" style="left:1570px;top:700px;font-size:30px;color:#6b6f80;opacity:${pr(T,32.8,33.3)}">归属感</div>
 <div class="tag chip" style="left:1250px;top:150px;background:${INK};color:#fff;font-size:34px;transform:scale(${told});opacity:${told>0?1:0}">对方只是电脑程序</div>`;};
const brain=(x,y,s,lit,label)=>`<div style="position:absolute;left:${x}px;top:${y}px;width:${520*s}px;height:${420*s}px">
 <svg width="${520*s}" height="${420*s}" viewBox="0 0 520 420"><path d="M80 250 C 40 160 110 60 220 50 C 300 20 420 50 460 140 C 500 220 470 300 400 320 C 380 360 330 380 290 360 L 270 400 L 230 400 L 240 350 C 160 350 100 310 80 250 Z" fill="#F3D6DA" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
 <path d="M150 170 C 190 130 250 130 270 170 M290 110 C 330 90 380 110 390 150 M180 250 C 220 230 260 250 300 230" fill="none" stroke="#c99aa3" stroke-width="7" stroke-linecap="round"/>
 <ellipse cx="270" cy="185" rx="${70}" ry="${42}" fill="${RED}" opacity="${lit}"/><ellipse cx="270" cy="185" rx="${100}" ry="${65}" fill="${RED}" opacity="${lit*0.25}"/></svg>
 <div style="text-align:center;font-size:40px;font-weight:900;margin-top:10px">${label}</div></div>`;
const S3=T=>{const l1=pr(T,48.9,49.8),two=eo(pr(T,52.6,53.6)),pain=pop(T,57.2);
 const xL=lerp(700,300,two);
 return `<div class="tag" style="left:${xL+40}px;top:120px;font-size:30px;color:#6b6f80;opacity:${pr(T,41,41.5)}">脑扫描 · 被冷落的那一刻</div>
 ${brain(xL,190,1,l1*(0.75+0.25*Math.sin(T*6)),'被冷落')}
 <div style="opacity:${two}">${brain(1100,190,1,two*(0.75+0.25*Math.sin(T*6+1)),'身体疼痛')}</div>
 <div class="tag" style="left:930px;top:360px;font-size:90px;color:${RED};opacity:${two}">≈</div>
 <div class="tag" style="left:860px;top:700px;font-size:170px;color:${RED};transform:scale(${pain});opacity:${pain>0?1:0}">疼</div>`;};
const S4=T=>{ // not knowing: the 50% shock
 const opt=pr(T,61.1,61.6)*(1-pr(T,65.0,65.4)),sw=Math.sin(T*2.2);
 let p=0;if(T<73.2)p=0;else if(T<75.2)p=lerp(0,100,eio(pr(T,73.2,74.0)));else if(T<77.2)p=lerp(100,0,eio(pr(T,75.2,76.0)));else p=lerp(0,50,eio(pr(T,77.2,78.0)));
 const stress=1-Math.abs(p-50)/50;const pts=[];for(let i=0;i<=40;i++){const xx=i*11;const j=Math.sin(i*1.7+T*9)*Math.sin(i*0.6+T*4);pts.push(`${xx},${90-j*80*stress-Math.sin(i*0.9+T*3)*6}`);}
 const bar=pr(T,69.2,69.8);
 return `${P(720,60,chatScreen(T,'23:40',{}),'chat',`transform:scale(${lerp(1,0.0001,0)});opacity:${1-pr(T,68.6,69.2)}`)}
 <div class="tag chip" style="left:${250+sw*14}px;top:250px;background:#fff;color:#8a2d2d;font-size:42px;box-shadow:0 12px 30px rgba(40,40,70,.16);opacity:${opt}">他不想理我？</div>
 <div class="tag chip" style="left:${1290-sw*14}px;top:250px;background:#fff;color:${BLU};font-size:42px;box-shadow:0 12px 30px rgba(40,40,70,.16);opacity:${opt}">他只是在忙？</div>
 <div class="tag" style="left:1220px;top:500px;font-size:140px;color:${INK};transform:scale(${pop(T,65.3)});opacity:${(pop(T,65.3)>0?1:0)*(1-pr(T,68.6,69.2))}">？</div>
 <div style="opacity:${bar}">
  <div class="tag" style="left:420px;top:200px;font-size:40px;color:${INK}">这一次，会被电吗？</div>
  <div style="position:absolute;left:420px;top:300px;width:1080px;height:60px;border-radius:30px;background:#fff;box-shadow:0 10px 26px rgba(40,40,70,.12)"><div style="width:${p}%;height:100%;border-radius:30px;background:${RED}"></div></div>
  <div class="tag" style="left:${420+10.8*p-60}px;top:380px;font-size:60px;color:${RED}">${Math.round(p)}%</div>
  <div class="tag" style="left:420px;top:500px;font-size:34px;color:#6b6f80">紧张程度</div>
  <svg style="position:absolute;left:420px;top:560px" width="1080" height="200" viewBox="0 0 440 180" preserveAspectRatio="none"><polyline points="${pts.join(' ')}" fill="none" stroke="${stress>0.5?RED:'#7BC47F'}" stroke-width="5" stroke-linejoin="round"/></svg>
 </div>`;};
const S5=T=>{ // the flip: the receiver overestimates how urgent you are
 const k=eo(pr(T,85.6,86.6)),tm=2*3600+Math.floor(Math.max(0,T-81.4)*45);
 const list=['工作群 · [23条]','家人群 · [12条]','快递 · 您的包裹已到','同学群 · [41条]','你 · 在吗？明天有空吗','公众号 · 今日推荐'];
 const thought=pop(T,94.0),both=pr(T,97.9,98.5);
 return `<div style="opacity:${1-k}"><div class="tag" style="left:600px;top:330px;font-size:240px;color:${RED}">50%</div><div class="tag" style="left:640px;top:610px;font-size:50px;color:${INK}">已读不回 = 不知道</div></div>
 <div style="opacity:${k}">
  <div style="position:absolute;left:960px;top:0;bottom:0;width:4px;background:${INK};opacity:.15"></div>
  <div class="tag" style="left:330px;top:90px;font-size:42px">你这边</div><div class="tag" style="left:1330px;top:90px;font-size:42px">他那边</div>
  <div class="tag" style="left:200px;top:300px;font-size:120px;color:${RED};letter-spacing:4px">0${Math.floor(tm/3600)}:${String(Math.floor(tm/60)%60).padStart(2,'0')}:${String(tm%60).padStart(2,'0')}</div>
  <div class="tag" style="left:230px;top:450px;font-size:40px;color:#6b6f80">"怎么还不回？"</div>
  ${P(1240,150,`<div class="sb"><span>18:25</span><span>5G ▮▮▮</span></div><div class="top">微信 (99+)</div>${list.map((t,i)=>`<div style="display:flex;gap:16px;align-items:center;padding:18px 22px;border-bottom:1px solid #e5e5e5;background:${i==4?'#FFF6D6':'#fff'}"><div class="av" style="background:${i==4?YEL:'#C9CFDA'}"></div><div style="font-size:24px;${i==4?'font-weight:900':''}">${t}</div></div>`).join('')}`,'chat')}
  <div class="tag chip" style="left:1010px;top:620px;background:${BLU};color:#fff;font-size:36px;transform:rotate(-3deg) scale(${thought});opacity:${thought>0?1:0}">"他肯定等急了…"</div>
  <div class="tag chip" style="left:260px;top:620px;background:${INK};color:#fff;font-size:40px;opacity:${both}">两边，都在高估这一秒</div>
 </div>`;};
const S6=T=>{const rep=pop(T,121.4),cal=pr(T,105.8,107)*(1-pr(T,117.4,118));
 const reply=`<div class="row" style="margin-top:34px;opacity:${rep>0?1:0};transform:scale(${rep||0.01});transform-origin:left"><div class="av"></div><div class="bub them">明天可以呀 😊<br>昨晚加班才看到</div></div>`;
 const pts=[];for(let i=0;i<=40;i++){const calm=pr(T,106,112);const j=Math.sin(i*1.7+T*9)*Math.sin(i*0.6+T*4)*(1-calm);pts.push(`${i*11},${90-j*70}`);}
 return `${P(720,60,chatScreen(T,T<121.4?'23:58':'08:12',{reply}),'chat')}
 <div class="tag" style="left:250px;top:380px;font-size:46px;color:#7a5a30;line-height:1.5;opacity:${pr(T,117.9,118.5)}">他只是<br>还没来得及</div>`;};
window.FILM={
 bg:T=>T>117.8?`radial-gradient(ellipse at 50% 35%,#FFF4E2 0%,#EEDDC6 60%,#D9C3A6 100%)`:`radial-gradient(ellipse at 50% 40%,#F4F3F8 0%,#E3E1EC 70%,#D3D0E0 100%)`,
 scenes:[{w:[0,20.8],f:S1},{w:[20.8,40.9],f:S2},{w:[40.9,61.1],f:S3},{w:[61.1,81.4],f:S4},{w:[81.4,101.8],f:S5},{w:[101.8,999],f:S6}],
 lines:[[0,3.4,'你发了一句「明天有空吗」'],[3.4,7.4,'显示：[已读]'],[7.4,11.0,'然后，[什么都没有]'],[11.0,14.0,'10分钟，30分钟，[2小时]'],[14.0,16.4,'我是不是说错什么了？'],
  [20.8,24.7,'心理学家做过一个小游戏'],[24.7,28.7,'三个人在网上互相抛球'],[28.7,32.8,'抛着抛着，[不再抛给你]'],[32.8,36.8,'几分钟后，被晾着的人[更难受]'],[36.8,40.9,'哪怕知道对方[只是电脑程序]'],
  [40.9,44.9,'研究者又把人放进脑扫描仪'],[44.9,48.9,'被冷落的那一刻'],[48.9,53.0,'大脑里亮起的一块区域'],[53.0,57.0,'和身体疼痛时的[有重叠]'],[57.0,61.1,'被晾着，大脑也觉得[疼]'],
  [61.1,65.1,'可已读不回，还多了一样东西'],[65.2,69.2,'[不知道]'],[69.2,73.2,'有实验让人猜：会不会被电'],[73.2,77.2,'一定会电，一定不会，都还好'],[77.2,81.3,'最紧张的，是[50%]'],
  [81.4,85.6,'已读不回，就是那个[50%]'],[85.6,89.8,'可换到对方那边看看'],[89.8,93.8,'一项关于工作消息的研究发现'],[93.8,97.8,'收消息的人，常[高估]对方有多急'],[97.8,101.8,'两边都以为，对方[很在意这一秒]'],
  [101.8,105.8,'所以下次看到「已读」'],[105.8,109.8,'那阵难受，是大脑在[报警]'],[109.8,113.8,'不一定是你说错了什么'],[113.8,117.8,'只是，[还不知道]而已'],[117.8,121.4,'他可能只是，还没来得及'],[121.4,125.4,'「明天可以呀」']],
 endBg:'rgba(244,240,236,.97)'};
document.documentElement.style.setProperty('--acc',BLU);
$('pa').textContent='已读不回，为什么这么难受？';$('pa').style.fontSize='96px';$('pb').textContent='WHY "READ" HURTS';
$('et').textContent='已读不回，为什么这么难受';$('eq').textContent='你有没有一个，总是已读不回的人？';
$('es').innerHTML='Williams, Cheung &amp; Choi (2000) JPSP 79, 748–762 · Zadro, Williams &amp; Richardson (2004) JESP 40, 560–567 · Eisenberger, Lieberman &amp; Williams (2003) Science 302, 290–292<br>de Berker et al. (2016) Nature Communications 7, 10996 · Giurge &amp; Bohns (2021) OBHDP 167, 114–128';
})();
