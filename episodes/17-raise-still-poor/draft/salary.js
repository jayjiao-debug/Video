// 《工资涨了，为什么还是觉得穷？》 draft film — every frame is a pure function of T
(function(){
const INK='#2E2A24',RED='#C8102E',GRN='#2F7F5E',GOLD='#F6CF78',MUT='#BDB4A3';
const money=n=>n.toLocaleString('en-US');
const S1=T=>{ // lockscreen: pay arrives, three days pass, a colleague's post lands
 const nIn=eo(pr(T,-0.15,0.35)),day=T<4.6?10:(T<5.6?11:(T<6.6?12:13)),wk=['','','','','','','','','','','五','六','日','一'][day];
 const grey=pr(T,14.0,14.8),mom=eo(pr(T,7.4,8.0));
 const noti=`<div class="noti" style="transform:translateY(${(1-nIn)*-160}px);opacity:${nIn};filter:grayscale(${grey}) opacity(${1-0.45*grey})"><div class="h"><div class="ic">银</div>某某银行 · ${T<3.4?'现在':(day-10)+'天前'}</div><div class="t">您尾号8826的账户<br>工资收入</div><div class="m">¥9,800.00</div></div>`;
 const post=`<div style="position:absolute;left:18px;right:18px;top:${lerp(980,300,mom)}px;background:#fff;border-radius:26px;padding:22px 24px;box-shadow:0 14px 40px rgba(0,0,0,.35)">
  <div style="display:flex;gap:14px;align-items:center"><div class="av" style="background:#8EA6C8"></div><div><div style="font-size:26px;font-weight:900;color:#3b5a85">同事 · 老周</div><div style="font-size:18px;color:#999">朋友圈 · 刚刚</div></div></div>
  <div style="font-size:30px;margin-top:14px;font-weight:700;color:#222">年终调薪 <b style="color:${RED}">+3000</b> 🎉🎉</div>
  <div style="margin-top:14px;height:170px;border-radius:16px;background:linear-gradient(135deg,#d9dee8,#b9c2d2);display:flex;align-items:center;justify-content:center;font-size:90px">🚗</div></div>`;
 const chip1=pop(T,1.0),chip2=pop(T,11.0);
 return `${P(720,60,`<div class="sb" style="color:#fff"><span>9:41</span><span>5G ▮▮▮</span></div><div class="clock">9:41</div><div class="date">10月${day}日 星期${wk}</div>${noti}${post}`,'lock')}
 <div class="tag chip" style="left:1250px;top:370px;background:${GRN};color:#fff;font-size:46px;transform:rotate(-4deg) scale(${chip1});opacity:${chip1>0?1:0};filter:grayscale(${grey})">比去年 +1,200</div>
 <div class="tag" style="left:1240px;top:520px;font-size:120px;color:${RED};transform:scale(${chip2});opacity:${chip2>0?1:0}">+3000</div>
 <div class="tag" style="left:330px;top:${300-20*Math.sin(T*1.3)}px;font-size:150px;color:${RED};opacity:.10">¥</div>
 <div class="tag" style="left:310px;top:640px;font-size:56px;color:${INK};opacity:${pr(T,3.6,4.0)*(1-pr(T,7.0,7.4))}">${['','😊','🙂','😐'][Math.min(3,Math.max(1,day-9))]}</div>`;};
const bar=(h,c,v,n,glow)=>`<div style="width:120px;height:${h}px;border-radius:14px 14px 0 0;background:${c};position:relative;${glow?'box-shadow:0 0 0 8px rgba(246,207,120,.85)':''}"><div style="position:absolute;top:-64px;left:-40px;right:-40px;text-align:center;font-size:40px;font-weight:900;opacity:${h>4?1:0}">${v}</div><div style="position:absolute;bottom:-56px;left:-40px;right:-40px;text-align:center;font-size:32px;font-weight:700;color:#6b665e">${n}</div></div>`;
const S2=T=>{ // two doors
 const a=eo(pr(T,24.7,25.6)),b=eo(pr(T,28.7,29.6)),g=T>32.8&&T<36.8;
 const door=(x,lab,bars,dim)=>`<div style="position:absolute;left:${x}px;top:150px;width:620px;height:690px;border-radius:28px 28px 8px 8px;background:#FFFDF8;box-shadow:0 30px 70px rgba(60,45,20,.18);border:6px solid ${INK};opacity:${dim}"><div style="position:absolute;top:-66px;left:0;right:0;text-align:center;font-size:54px;font-weight:900">${lab}</div><div style="position:absolute;bottom:90px;left:0;right:0;display:flex;justify-content:center;align-items:flex-end;gap:70px">${bars}</div></div>`;
 let crowd='';const q=pr(T,36.8,40.0);for(let i=0;i<24;i++){const goA=i%2==0;const k=cl(q*1.4-i/34);const sx=960+((i*37)%120-60),sy=520;const j=Math.floor(i/2);const tx=goA?lerp(sx,300+(j%6)*86,k):lerp(sx,1120+(j%6)*86,k),ty=lerp(sy,250+Math.floor(j/6)*44,k);
  crowd+=`<div style="position:absolute;left:${tx}px;top:${ty-30}px;width:26px;height:26px;border-radius:50%;background:${goA?RED:'#8E9BB8'};opacity:${k>0?0.9:0}"></div>`;}
 const half=pop(T,37.6),line=pr(T,40.9,41.8);
 return `${door(240,'A',bar(250*a,GRN,'5万','你')+bar(125*a,MUT,'2.5万','别人'),1)}
 ${door(1060,'B',bar(250*b,GRN,'10万','你',g)+bar(500*b,MUT,'20万','别人'),1)}
 <div class="tag" style="left:930px;top:430px;font-size:90px;color:${RED};opacity:${pr(T,29.6,30.2)*(1-pr(T,36.8,37.2))}">?</div>
 <div class="tag chip" style="left:1180px;top:640px;background:${GOLD};color:${INK};font-size:44px;transform:scale(${pop(T,33.0)});opacity:${T>33&&T<36.8?1:0}">多挣一倍</div>
 ${crowd}<div class="tag chip" style="left:320px;top:200px;background:${RED};color:#fff;font-size:42px;transform:scale(${half});opacity:${half>0?1:0}">约一半的人选这里</div>
 <svg style="position:absolute;left:0;top:0;opacity:${line}" width="1920" height="1080"><line x1="420" y1="${840-90-250}" x2="${lerp(420,560,line)}" y2="${840-90-125}" stroke="${RED}" stroke-width="8" stroke-linecap="round"/></svg>
 <div class="tag chip" style="left:560px;top:520px;background:#fff;color:${RED};font-size:40px;border:4px solid ${RED};opacity:${line}">比别人多</div>`;};
const S3=T=>{ // money illusion: two payslips
 const slip=(x,name,r,inf,buy,buyc,t0,happy)=>{const k=eo(pr(T,t0,t0+0.6));const fill=eo(pr(T,61.1,62.4))*buy;return `<div style="position:absolute;left:${x}px;top:${lerp(1100,150,k)}px;width:560px;height:640px;background:#FFFDF8;border-radius:18px;box-shadow:0 26px 60px rgba(60,45,20,.18);padding:36px 44px;border-top:16px solid ${GRN}">
  <div style="font-size:44px;font-weight:900">${name} 的工资条</div><div style="display:flex;justify-content:space-between;font-size:36px;margin-top:24px;font-weight:700;color:#4a443c"><span>起薪</span><b>3万</b></div>
  <div style="display:flex;justify-content:space-between;font-size:36px;margin-top:20px;font-weight:700;color:#4a443c"><span>涨薪</span><b style="color:${GRN}">${r}</b></div>
  <div style="display:flex;justify-content:space-between;font-size:36px;margin-top:20px;font-weight:700;color:#4a443c;opacity:${pr(T,t0+1.2,t0+1.6)}"><span>物价</span><b style="color:${inf==='没涨'?INK:RED}">${inf}</b></div>
  <div style="position:absolute;left:44px;right:44px;bottom:60px;height:150px;border:4px solid ${INK};border-radius:14px;overflow:hidden;opacity:${pr(T,61.1,61.5)}"><div style="position:absolute;left:0;bottom:0;height:100%;width:${fill*50}%;background:${buyc}"></div><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900">能多买 ${buy}%</div></div>
  <div style="position:absolute;right:-30px;top:-60px;font-size:90px;transform:scale(${happy});opacity:${happy>0?1:0}">😊</div></div>`;};
 return slip(300,'小A','+2%','没涨',2,'#9FD3B5',44.9,0)+slip(1060,'小B','+5%','+4%',1,'#E9C9C9',47.0,pop(T,57.6))+
 `<div class="tag chip" style="left:1100px;top:830px;background:${INK};color:#fff;font-size:38px;opacity:${pr(T,57.6,58)*(1-pr(T,61,61.4))}">多数人觉得他更开心</div>
  <div class="tag chip" style="left:340px;top:830px;background:${GRN};color:#fff;font-size:38px;transform:scale(${pop(T,62.6)});opacity:${pr(T,62.6,62.7)}">实际多买的是小A</div>`;};
const rowsData=[['周 · 研究员','$72,300'],['李 · 讲师','$61,900'],['郑 · 辅导员','$52,600'],['王 · 实验员','$48,200'],['吴 · 技术员','$44,800'],['孙 · 图书管理','$41,700'],['陈 · 行政','$39,400']];
const S4=T=>{ // the salary website; the drop shows who got upset
 const typed='吴 · 技术员'.slice(0,Math.floor(pr(T,69.4,71.6)*6));const listIn=eo(pr(T,73.2,74.4));const med=pr(T,77.4,78.2);const low=pr(T,81.4,82.2),hi=pr(T,89.8,90.6);
 let rows='';rowsData.forEach((r,i)=>{const isLow=i>=4;if(i==4)rows+=`<div style="border-top:6px dashed ${RED};margin:2px 0;opacity:${med}"></div>`;
  const bgc=isLow?`rgba(232,180,180,${0.9*low})`:`rgba(190,220,200,${0.8*hi})`;
  rows+=`<div style="display:flex;justify-content:space-between;padding:16px 26px;font-size:26px;border-bottom:1px solid #eee;background:${bgc};opacity:${cl(listIn*1.6-i*0.1)};transform:translateY(${(1-listIn)*40}px)"><span>${r[0]}${isLow&&T>85.6?' 💼':''}</span><b>${r[1]}</b></div>`;});
 const ph=P(720,60,`<div class="sb"><span>9:41</span><span>5G ▮▮▮</span></div><div style="padding:24px 26px 10px;font-size:20px;color:#888;font-weight:700">某某报 · 2008</div>
  <div style="padding:0 26px;font-size:36px;font-weight:900;line-height:1.3">加州大学员工工资<br>全部可查</div>
  <div style="margin:20px 26px;border:3px solid ${INK};border-radius:14px;padding:14px 18px;font-size:26px;min-height:62px">🔍 ${typed||'<span style=color:#aaa>输入同事名字…</span>'}${T%1<0.5&&T>69&&T<73?'<span style="border-left:3px solid '+RED+';margin-left:3px"></span>':''}</div>${rows}`,'','background:#15171c');
 const big=pop(T,85.8);
 return `<div style="position:absolute;inset:0"><div class="phone-wrap" style="position:absolute;inset:0">${ph.replace('class="scr "','class="scr" style="background:#fff"')}</div></div>
 <div class="tag chip" style="left:1250px;top:500px;background:${RED};color:#fff;font-size:40px;opacity:${med}">中位数</div>
 <div class="tag" style="left:1250px;top:610px;font-size:44px;color:#8a2d2d;line-height:1.4;opacity:${low*(1-pr(T,89.4,89.8))}">低于它的人：<br>满意度下降</div>
 <div class="tag" style="left:1240px;top:740px;font-size:130px;color:${RED};transform:scale(${big});opacity:${big>0?1:0};line-height:1">+20%</div><div class="tag" style="left:1250px;top:880px;font-size:34px;color:#8a2d2d;opacity:${big>0?1:0}">"很可能找新工作"的人</div>
 <div class="tag" style="left:250px;top:300px;font-size:44px;color:${GRN};line-height:1.4;opacity:${hi}">高于它的人：</div>
 <div class="tag" style="left:250px;top:380px;font-size:110px;opacity:${pr(T,93.8,94.4)}">😐</div><div class="tag" style="left:250px;top:520px;font-size:44px;color:${INK};opacity:${pr(T,93.8,94.4)}">并没有更开心</div>
`;};
const S5=T=>{ // back to your own pay
 const chips=[['🧳 一次周末旅行',300,260,113.9],['📚 一门想上的课',250,420,114.5],['💰 存下来',1260,330,115.1]];
 const roll=Math.round(lerp(1200,14400,eo(pr(T,117.9,120.2))));
 return `${P(720,60,`<div class="sb" style="color:#fff"><span>9:41</span><span>5G ▮▮▮</span></div><div class="clock">9:41</div><div class="date">10月13日 星期一</div>
  <div class="noti"><div class="h"><div class="ic">银</div>某某银行</div><div class="t">您尾号8826的账户<br>工资收入</div><div class="m">¥9,800.00</div></div>
  <div style="margin:30px 18px 0;background:rgba(255,255,255,.18);border-radius:24px;padding:20px 24px;color:#fff;font-size:24px;opacity:${1-pr(T,109.8,110.8)};transform:translateX(${-eo(pr(T,109.8,110.8))*500}px)">朋友圈 · 3条新动态 🔴</div>`,'lock')}
 ${chips.map(([t,x,y,t0])=>`<div class="tag chip" style="left:${x}px;top:${y}px;background:#fff;font-size:40px;box-shadow:0 10px 26px rgba(0,0,0,.12);transform:scale(${pop(T,t0)});opacity:${pop(T,t0)>0?1:0}">${t}</div>`).join('')}
 <div class="tag" style="left:1240px;top:520px;font-size:110px;color:${GRN};opacity:${pr(T,117.8,118.2)}">¥${money(roll)}</div><div class="tag" style="left:1250px;top:660px;font-size:38px;color:${INK};opacity:${pr(T,117.8,118.2)}">一年，多出来的</div>`;};
window.FILM={
 bg:T=>T>101.8?`radial-gradient(ellipse at 50% 30%,#FFF6DF 0%,#F2E3C2 60%,#E2CDA2 100%)`:`radial-gradient(ellipse at 50% 40%,#FBF7EE 0%,#EFE7D6 70%,#E4D9C3 100%)`,
 scenes:[{w:[0,20.8],f:S1},{w:[20.8,44.9],f:S2},{w:[44.9,65.2],f:S3},{w:[65.2,101.8],f:S4},{w:[101.8,999],f:S5}],
 lines:[[0,3.4,'涨薪了，每月多了[1200]'],[3.4,7.4,'开心了大概……[三天]'],[7.4,11.0,'然后你刷到同事的朋友圈'],[11.0,14.0,'他涨了[3000]'],[14.0,16.4,'你的1200，突然[不香了]'],
  [20.8,24.7,'有研究者问过一个问题'],[24.7,28.7,'A：你挣5万，别人挣2.5万'],[28.7,32.8,'B：你挣10万，别人挣20万'],[32.8,36.8,'B 明明多挣[一倍]'],[36.8,40.9,'可约[一半的人]选了 A'],[40.9,44.9,'我们要的不只是钱，是[比别人多]'],
  [44.9,48.9,'再看两个人，起薪一样'],[48.9,53.0,'小A：涨2%，物价[没涨]'],[53.0,57.0,'小B：涨5%，物价涨了[4%]'],[57.0,61.1,'谁更开心？多数人说：[小B]'],[61.1,65.1,'可能多买东西的，其实是[小A]'],
  [65.2,69.2,'那如果，工资[全部公开]呢？'],[69.2,73.2,'2008年，美国一家报纸真这么做了'],[73.2,77.2,'加州大学员工的工资，[人人可查]'],[77.2,81.3,'研究者调查了这些员工……'],
  [81.4,85.6,'低于中位数的人，[满意度下降]'],[85.6,89.8,'想找新工作的，多了[两成]'],[89.8,93.8,'那高于中位数的呢？'],[93.8,97.8,'[并没有更开心]'],[97.8,101.8,'比下去会难受，比上去[不会更爽]'],
  [101.8,105.8,'所以觉得穷，不一定是钱少'],[105.8,109.8,'是你一直在[跟谁比]'],[109.8,113.8,'下次涨薪，先别急着刷朋友圈'],[113.8,117.8,'先看看，它能让你[多做点什么]'],[117.8,121.4,'每月1200，一年就是[14400]'],[121.4,125.4,'这是你的，[不是比出来的]']],
 endBg:'rgba(246,240,228,.97)'};
document.documentElement.style.setProperty('--acc',GRN);
$('pa').textContent='工资涨了，为什么还是觉得穷？';$('pa').style.fontSize='92px';$('pb').textContent='WHY A RAISE STILL FEELS POOR';
$('et').textContent='工资涨了，为什么还是觉得穷';$('eq').textContent='你上一次涨薪，开心了几天？';
$('es').innerHTML='Solnick &amp; Hemenway (1998) J. Econ. Behav. Organ. 37, 373–383 · Shafir, Diamond &amp; Tversky (1997) QJE 112, 341–374<br>Card, Mas, Moretti &amp; Saez (2012) Inequality at Work, American Economic Review 102(6), 2981–3003';
})();
