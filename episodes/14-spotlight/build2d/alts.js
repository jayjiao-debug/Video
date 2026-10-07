<script>
function prof(x,y,sc,col,dir=-1,sit=true){g.save();g.translate(x,y);g.scale(sc*(-dir),sc);g.fillStyle=col;
 if(sit){rr(-48,-135,96,160,42);g.fill();rr(-120,-6,120,36,16);g.fill();rr(-128,0,32,105,14);g.fill();}else{rr(-50,-140,100,190,44);g.fill();rr(-40,40,34,150,14);g.fill();rr(6,40,34,150,14);g.fill();}
 g.save();g.translate(-30,-60);g.rotate(-.35);rr(-80,-12,90,28,13);g.fill();g.restore();g.beginPath();g.ellipse(-8,-192,44,50,0,0,7);g.fill();g.beginPath();g.ellipse(-58,-182,13,12,0,0,7);g.fill();g.restore();}
function label(id,name,motion){g.save();g.fillStyle='rgba(0,0,0,.72)';rr(30,26,1180,92,16);g.fill();txt(id,60,90,`900 52px ${SANS}`,GOLD);txt(name,150,84,`800 38px ${SERIF}`,'#f4efe6');txt(motion,150,110,`500 22px ${SANS}`,'#cdb98e');g.restore();}
function sub(s){$('sub').innerHTML=s.replace(/\[(.+?)\]/g,'<b>$1</b>');}
function bub(x,y,s,font,bg,fg,r=18){g.font=font;const w=g.measureText(s).width+40;g.fillStyle=bg;rr(x,y,w,font.match(/(\d+)px/)[1]*1+30,r);g.fill();txt(s,x+20,y+font.match(/(\d+)px/)[1]*1+6,font,fg);return w;}
function thought(x,y,s,a=1){g.save();g.globalAlpha=a;g.font=`700 26px ${SANS}`;const w=g.measureText(s).width+36;g.fillStyle='rgba(246,236,214,.95)';rr(x-w/2,y-46,w,52,26);g.fill();g.beginPath();g.arc(x-10,y+14,7,0,7);g.fill();g.beginPath();g.arc(x-18,y+30,4,0,7);g.fill();txt(s,x,y-12,`700 26px ${SANS}`,INK,'center');g.restore();}
const ALT={
 // ---------- scene 1 (0:06-0:12)
 '1A':t=>{room(.6);g.save();g.globalAlpha=.35;drawPhone(t,{strip:1,read:52},.62,0,40);g.restore();
  const C=['？？？','笑死','老师就在群里啊','已截图','他完了','勇士','哈哈哈哈哈哈','坐等王老师回复','建议连夜转学','社死现场','我录屏了','明天怎么面对老师','名场面','截图发年级群了','哈？','这是能说的吗'];
  for(let r=0;r<9;r++)for(let k=0;k<4;k++){const s=C[(r*5+k*3)%C.length];const sp=260+((r*37)%5)*70;const x=W-((t*sp+r*310+k*560)%(W+700))+200;const y=170+r*84;const big=(r+k)%5===0;
   txt(s,x,y,`${big?900:700} ${big?50:36}px ${SANS}`,big?RED:(r+k)%3?'#f4efe6':GOLD,'left',.92,big?14:0);}
  label('A','社死弹幕','脑补的全班评论从右边涌进来，越来越密；到“心理学家真测过”那句，弹幕全部定格、变灰，中间弹出“?%”');sub('你觉得，[全班]都看见了');},
 '1B':t=>{room(.25);const N=52,cx=960,cy=760;for(let i=0;i<N;i++){const sx=80+i*(1760/(N-1)),sy=110+Math.sin(i*1.7)*30;g.save();g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(sx,sy,cx,cy);gr.addColorStop(0,'rgba(255,230,170,.0)');gr.addColorStop(1,'rgba(255,230,170,.10)');g.fillStyle=gr;g.beginPath();g.moveTo(sx-3,sy);g.lineTo(sx+3,sy);g.lineTo(cx+70,cy+40);g.lineTo(cx-70,cy+40);g.closePath();g.fill();g.restore();g.fillStyle='rgba(255,236,190,.9)';g.beginPath();g.arc(sx,sy,6,0,7);g.fill();}
  g.save();g.globalCompositeOperation='lighter';const sp=g.createRadialGradient(cx,cy,10,cx,cy,260);sp.addColorStop(0,'rgba(255,236,200,.55)');sp.addColorStop(1,'rgba(255,236,200,0)');g.fillStyle=sp;g.fillRect(0,0,W,H);g.restore();
  person(cx,cy+40,.8,'#141820');g.fillStyle='rgba(160,200,255,.9)';rr(cx-26,cy+30,52,80,8);g.fill();txt('52/52',1500,560,`900 130px ${SERIF}`,RED,'left',1,24);txt('都在看你？',1505,630,`700 40px ${SERIF}`,'#e9dcc0');
  label('B','52 束目光','已读每多一个，天花板上就亮一盏灯打向你；52 盏全亮时画面发白，然后灯一盏盏变成“?”');sub('你觉得，[全班]都看见了');},
 '1C':t=>{room(.3);const head=(x,dir,col)=>{g.save();g.translate(x,560);g.scale(-dir,1);g.fillStyle=col;g.beginPath();g.ellipse(0,-40,250,280,0,0,7);g.fill();g.beginPath();g.ellipse(-245,-10,30,40,0,0,7);g.fill();rr(-120,200,240,200,60);g.fill();g.restore();};
  head(520,1,'#2a2f3d');head(1400,-1,'#2a2f3d');
  g.save();g.beginPath();g.ellipse(520,520,230,260,0,0,7);g.clip();for(let i=0;i<14;i++){const x=330+(i%3)*130+((i/3|0)%2)*60,y=300+(i/3|0)*90;g.save();g.globalAlpha=.55+.45*((i*7)%3)/2;g.fillStyle=GOLD;rr(x,y,170,60,12);g.fill();txt('这老师好无聊',x+14,y+40,`700 22px ${SANS}`,INK);g.restore();}g.restore();
  g.save();g.beginPath();g.ellipse(1400,520,230,260,0,0,7);g.clip();[['今晚吃啥',1260,330],['作业还没写',1390,410],['游戏上分',1250,490],['刘海翘了',1420,560],['明天体育课',1280,640],['好困',1450,700]].forEach(([s,x,y])=>{g.fillStyle='rgba(236,224,198,.92)';g.font=`700 26px ${SANS}`;const w=g.measureText(s).width+30;rr(x,y,w,48,24);g.fill();txt(s,x+15,y+34,`700 26px ${SANS}`,INK);});
   g.globalAlpha=.35;g.fillStyle=GOLD;rr(1480,300,80,26,8);g.fill();g.restore();
  txt('你的脑子',520,190,`800 40px ${SERIF}`,GOLD,'center');txt('同学的脑子',1400,190,`800 40px ${SERIF}`,'#e9dcc0','center');txt('那条消息 ↗',1600,280,`600 24px ${SANS}`,'#cdb98e','left');
  label('C','你的脑子 vs 他的脑子','左边：那条消息在你脑子里循环复制、塞满；右边：同学脑子里全是自己的事，你那条只有角落一小块（先给一半答案）');sub('可心理学家真测过：别人[记得]多少？');},
 // ---------- scene 2 (0:57-1:10)
 '2A':t=>{room(.3);g.save();g.globalCompositeOperation='lighter';const sp=g.createRadialGradient(560,560,20,560,560,360);sp.addColorStop(0,'rgba(255,230,180,.35)');sp.addColorStop(1,'rgba(255,230,180,0)');g.fillStyle=sp;g.fillRect(0,0,W,H);g.restore();
  g.fillStyle='#2a2219';rr(300,800,520,40,8);g.fill();person(560,700,.9,'#1a1e28');card(380,300,380,110,[['🔒 我其实……',`800 40px ${SERIF}`,INK,70]],1,-.02);
  g.fillStyle='#3b3226';rr(980,700,860,60,10);g.fill();[1060,1220,1380,1540,1700].forEach((x,i)=>{prof(x,830,.7,'#36405a',-1);g.save();g.translate(x-70,520);g.rotate(-.06+i*.03);g.fillStyle='#f4ecdc';rr(-70,-60,140,110,10);g.fill();g.fillStyle='#8a6a3a';g.fillRect(-6,50,12,90);txt(['70','68','71','66','72'][i],0,20,`900 60px ${SERIF}`,'#b0201a','center');g.restore();});
  g.fillStyle='rgba(10,10,14,.9)';rr(1080,140,620,170,20);g.fill();g.strokeStyle=GOLD;g.lineWidth=3;rr(1080,140,620,170,20);g.stroke();txt('你以为',1170,205,`700 30px ${SERIF}`,'#f6a35a','center');txt('52',1170,285,`900 76px ${SERIF}`,'#f6a35a','center');txt('评委平均',1500,205,`700 30px ${SERIF}`,BLUE,'center');txt('69',1500,285,`900 76px ${SERIF}`,BLUE,'center',1,18);
  label('A','综艺打分','你讲完糗事，心虚地猜 52；评委一个个举牌（卡点），总分牌滚到 69（牌上分数为示意，平均值是论文数据）');sub('别人其实给了[69]，比你以为的高');},
 '2B':t=>{room(.35);g.save();g.translate(960,500);g.rotate(-.03);g.fillStyle='#f6f1e4';g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=40;rr(-520,-400,1040,760,10);g.fill();g.shadowBlur=0;
  g.strokeStyle='rgba(90,140,200,.25)';g.lineWidth=2;for(let y=-300;y<330;y+=56){g.beginPath();g.moveTo(-480,y);g.lineTo(480,y);g.stroke();}
  txt('自我介绍 · 印象评分',-470,-330,`900 44px ${SERIF}`,INK);txt('姓名：你',300,-330,`600 30px ${SERIF}`,'#555');
  txt('大家好，我叫……',-470,-250,`500 34px "Noto Serif CJK SC",serif`,'#334');txt('说个糗事：我其实……',-470,-194,`500 34px "Noto Serif CJK SC",serif`,'#334');g.fillStyle='rgba(0,0,0,.8)';rr(-120,-228,300,44,6);g.fill();txt('🔒 尴尬小秘密',-100,-196,`700 28px ${SANS}`,'#fff');
  txt('自评：',-470,40,`600 34px ${SERIF}`,'#555');txt('52',-340,60,`500 90px "Noto Serif CJK SC",serif`,'#4a5a7a');g.strokeStyle='#4a5a7a';g.lineWidth=4;g.beginPath();g.moveTo(-360,40);g.lineTo(-220,10);g.stroke();txt('（应该刚及格吧…）',-200,50,`500 28px ${SERIF}`,'#6a7a9a');
  g.strokeStyle='#d0261c';g.lineWidth=7;g.beginPath();g.ellipse(250,90,170,130,-.1,0,7);g.stroke();txt('69',250,140,`900 160px "Noto Serif CJK SC",serif`,'#d0261c','center');txt('别人打的',250,250,`700 34px ${SERIF}`,'#d0261c','center');
  g.restore();label('B','试卷批改','一张“自我介绍评分卷”：你用铅笔心虚地写 52，红笔“唰”地圈出 69（高三感，和开头班群呼应）');sub('别人其实给了[69]，比你以为的高');},
 '2C':t=>{room(.35);const x=960,top=170,bot=800;g.fillStyle='rgba(240,230,210,.12)';rr(x-50,top,100,bot-top,50);g.fill();g.beginPath();g.arc(x,bot+40,90,0,7);g.fill();
  const lv=v=>bot-(bot-top-40)*v/100;g.fillStyle='#e8604a';g.shadowColor='#ff7a5a';g.shadowBlur=30;rr(x-30,lv(69),60,bot-lv(69)+40,30);g.fill();g.beginPath();g.arc(x,bot+40,70,0,7);g.fill();g.shadowBlur=0;txt('🔒',x,bot+62,`60px ${SANS}`,'#fff','center');
  for(let v=0;v<=100;v+=10){g.fillStyle='#cdb98e';g.fillRect(x+60,lv(v)-2,v%50?20:40,4);if(v%50===0)txt(v+(v===50?' · 普通':''),x+120,lv(v)+12,`600 30px ${SERIF}`,'#cdb98e');}
  g.setLineDash([12,10]);g.strokeStyle='#f6a35a';g.lineWidth=4;g.beginPath();g.moveTo(x-300,lv(52));g.lineTo(x-40,lv(52));g.stroke();g.setLineDash([]);txt('你以为 52',x-320,lv(52)+14,`900 50px ${SERIF}`,'#f6a35a','right');
  txt('别人给的 69',x-320,lv(69)+14,`900 64px ${SERIF}`,'#ff8a6a','right',1,20);txt('+17',x+260,lv(69)-10,`900 90px ${SERIF}`,GOLD,'left',1,24);
  label('C','好感温度计','底部泡泡里锁着你的糗事；你先划一条 52 的线，红色液柱一路冲过去停在 69，“+17”弹出（一根柱子就讲完）');sub('别人其实给了[69]，比你以为的高');},
 // ---------- scene 4 (1:31-1:35)
 '4A':t=>{g.fillStyle='#070a14';g.fillRect(0,0,W,H);for(let i=0;i<70;i++){g.fillStyle=`rgba(255,255,255,${.2+.5*hsh(i,3)})`;g.fillRect(hsh(i,1)*W,hsh(i,2)*260,2,2);}
  g.fillStyle='#141824';g.fillRect(260,140,1400,960);const cols=8,rows=5;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=320+c*168,y=190+r*150,me=r===3&&c===2;const on=hsh(r,c)>.12;
   g.fillStyle=on?(me?'#ffd98a':['#f2c27a','#e8b06a','#a8c8f0','#f6d6a0'][(r+c)%4]):'#0b0e16';g.fillRect(x,y,128,100);
   if(on){g.fillStyle='rgba(20,22,30,.85)';g.beginPath();g.ellipse(x+64,y+58,16,18,0,0,7);g.fill();rr(x+38,y+74,52,40,16);g.fill();g.fillStyle='rgba(150,190,255,.9)';g.fillRect(x+56,y+80,16,12);}
   if(me){g.strokeStyle=GOLD;g.lineWidth=5;g.strokeRect(x-6,y-6,140,112);txt('你',x+64,y-18,`900 34px ${SERIF}`,GOLD,'center');}}
  [[3,0,'我今天是不是很尬'],[6,1,'他为什么不回我'],[1,4,'刘海好丑'],[5,3,'PPT讲砸了'],[7,4,'我笑太大声了']].forEach(([c,r,s])=>thought(320+c*168+64,190+r*150-6,s));
  label('A','宿舍楼夜景','从你的窗口拉远：整栋楼每扇窗都亮着一盏灯、一个人低头看手机，好几扇窗冒出自己的小烦恼');sub('人人都在自己的聚光灯下，忙着看[自己]');},
 '4B':t=>{room(.25);const S=['我刚才是不是说错话了','刘海翘了一整天','他为什么不回我','体重又涨了','PPT讲砸了','我笑太大声了','鞋子好旧','迟到被看见了','发错表情包','声音好难听','痘痘好明显','那条群消息'];
  for(let i=0;i<12;i++){const c=i%4,r=i/4|0,x=170+c*410,y=150+r*250,me=i===11;g.fillStyle=me?'rgba(246,207,120,.18)':'rgba(240,230,210,.07)';rr(x,y,370,220,26);g.fill();if(me){g.strokeStyle=GOLD;g.lineWidth=4;rr(x,y,370,220,26);g.stroke();}
   g.fillStyle=AV[i%AV.length];g.beginPath();g.arc(x+70,y+150,46,0,7);g.fill();g.save();g.beginPath();g.arc(x+70,y+150,46,0,7);g.clip();g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x+70,y+140,18,20,0,0,7);g.fill();rr(x+40,y+164,60,50,20);g.fill();g.restore();
   g.font=`700 26px ${SANS}`;const s=S[i];g.fillStyle=me?GOLD:'rgba(246,236,214,.95)';const w=Math.min(250,g.measureText(s).width+30);rr(x+120,y+40,w+10,60,28);g.fill();txt(s.length>8?s.slice(0,8):s,x+138,y+80,`700 26px ${SANS}`,INK);if(s.length>8)txt(s.slice(8),x+138,y+80+0,`700 0px ${SANS}`,INK);
   txt(me?'你':'同学 '+(i+1),x+130,y+170,`600 24px ${SANS}`,me?GOLD:'#cdb98e');}
  label('B','52 个头像的小剧场','班群头像一个个点开：每个人头顶都是自己的烦恼，你那条群消息只是其中一格');sub('人人都在自己的聚光灯下，忙着看[自己]');},
 '4C':t=>{room(.15);for(let r=0;r<4;r++)for(let c=0;c<9-r%2;c++){const sc=.5+r*.14,x=200+c*(1520/(8-r%2))+(r%2)*60,y=250+r*170;
   g.save();g.globalCompositeOperation='lighter';const sp=g.createRadialGradient(x,y-60*sc,4,x,y-60*sc,150*sc);sp.addColorStop(0,'rgba(255,224,170,.42)');sp.addColorStop(1,'rgba(255,224,170,0)');g.fillStyle=sp;g.beginPath();g.arc(x,y-60*sc,150*sc,0,7);g.fill();g.restore();
   g.fillStyle='#2a2019';rr(x-70*sc,y+30*sc,140*sc,70*sc,12*sc);g.fill();phoneGlow(x,y,sc,1);person(x,y,sc,'#2a3040',{down:1});}
  g.save();g.globalAlpha=.9;const sp=g.createRadialGradient(960,1060,10,960,1060,300);sp.addColorStop(0,'rgba(255,240,210,.5)');sp.addColorStop(1,'rgba(255,240,210,0)');g.fillStyle=sp;g.fillRect(0,700,W,380);g.restore();person(960,1150,1.2,'#0c0e14');
  txt('舞台上的你',960,860,`700 30px ${SERIF}`,GOLD,'center');
  label('C','观众席反转','镜头从舞台上的你往后拉：台下每个座位都有自己的一盏灯，每个人都在低头看自己的手机，没人在看台上');sub('人人都在自己的聚光灯下，忙着看[自己]');},
 // ---------- scene 5 (1:39-1:44)
 '5A':t=>{room(1);g.fillStyle='rgba(255,196,130,.16)';g.fillRect(0,0,W,H);g.save();g.globalCompositeOperation='lighter';const L=g.createRadialGradient(960,180,20,960,180,900);L.addColorStop(0,'rgba(255,214,150,.4)');L.addColorStop(1,'rgba(255,214,150,0)');g.fillStyle=L;g.fillRect(0,0,W,H);g.restore();
  g.fillStyle='#e0b070';g.beginPath();g.moveTo(900,90);g.lineTo(1020,90);g.lineTo(1060,170);g.lineTo(860,170);g.closePath();g.fill();
  g.fillStyle='#5a3a24';rr(520,700,880,40,10);g.fill();prof(560,860,.8,'#3a3040',1);prof(1360,860,.8,'#3a3040',-1);prof(760,880,.85,'#4a3a3a',1);prof(1160,880,.85,'#3a4a5a',-1);
  [[760,690,'哈哈哈'],[1160,690,'然后呢然后呢']].forEach(([x,y,s])=>thought(x,y-150,s));g.fillStyle='#111';rr(930,680,90,22,6);g.fill();txt('手机扣着',975,660,`600 22px ${SANS}`,'#6a4a2a','center');
  txt('没那么多人在看你',W/2,330,`900 84px ${SERIF}`,'#fff4dc','center',1,20);
  label('A','聚光灯关掉，房灯亮起','“咔”一声，打在你身上的白光灭了，暖色房灯亮起：一桌朋友在互相聊天大笑，你也坐进去，手机扣在桌上');sub('别人没你想的那么在意你——这是[好消息]');},
 '5B':t=>{g.fillStyle='#d9d2c4';g.fillRect(0,0,W,H);for(let i=0;i<46;i++){const x=hsh(i,9)*W,y=hsh(i,8)*H*.9,an=hsh(i,7)*7;g.save();g.translate(x,y);g.rotate(an);g.fillStyle=['#4a5a7a','#7a4a4a','#5a7a5a','#7a6a4a','#4a4a5a'][i%5];g.beginPath();g.ellipse(0,0,26,18,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.arc(6,0,12,0,7);g.fill();g.restore();}
  const sp=g.createRadialGradient(760,520,10,760,520,220);sp.addColorStop(0,'rgba(255,255,240,.95)');sp.addColorStop(.8,'rgba(255,250,220,.5)');sp.addColorStop(1,'rgba(255,250,220,0)');g.fillStyle=sp;g.beginPath();g.arc(760,520,220,0,7);g.fill();
  [[820,540],[900,520],[990,540],[1080,520]].forEach(([x,y],i)=>{g.fillStyle=`rgba(80,60,40,${.15+.1*i})`;g.beginPath();g.ellipse(x,y,12,7,0,0,7);g.fill();});g.save();g.translate(1170,530);g.fillStyle=GOLD;g.beginPath();g.ellipse(0,0,30,20,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.arc(8,0,13,0,7);g.fill();g.restore();txt('你',1170,480,`900 40px ${SERIF}`,'#6a4a10','center');
  label('B','走出光圈','俯拍：人群往各个方向走，没人抬头；你从一圈刺眼的光里走出来，光圈在身后慢慢暗掉，你混进人群');sub('别人没你想的那么在意你——这是[好消息]');},
 '5C':t=>{room(1);g.fillStyle='#f4d9a8';g.fillRect(1140,120,560,520);const sk=g.createLinearGradient(0,120,0,640);sk.addColorStop(0,'#ffcf8a');sk.addColorStop(1,'#ffe9c4');g.fillStyle=sk;g.fillRect(1160,140,520,480);g.fillStyle='#ffd27a';g.beginPath();g.arc(1420,560,90,0,7);g.fill();g.strokeStyle='#5a4030';g.lineWidth=14;g.strokeRect(1150,130,540,500);g.beginPath();g.moveTo(1420,130);g.lineTo(1420,630);g.stroke();
  g.fillStyle='rgba(255,210,150,.12)';g.fillRect(0,0,W,H);g.fillStyle='#4a3424';g.fillRect(0,820,W,260);
  const s={off:false,clock:'07:32'};g.save();const sc=.5;g.translate(500,180);g.scale(sc,sc);g.fillStyle='#0d0f14';rr(0,0,PW,PH,70);g.fill();rr(18,18,PW-36,PH-36,56);g.clip();g.fillStyle='#ededed';g.fillRect(0,0,PW,PH);txt('07:32',58,62,`600 26px ${SANS}`,'#111');g.fillStyle='#f7f7f7';g.fillRect(0,80,PW,110);txt('新室友 · 小林',PW/2,135,`700 34px ${SANS}`,'#111','center');
   [['你早点睡～晚安',260,1]].forEach(([m,y])=>{g.fillStyle=GOLD;rr(PW-90-m.length*30-40,y,m.length*30+40,74,16);g.fill();txt(m,PW-110,y+48,`500 30px ${SANS}`,INK,'right');});
   g.fillStyle='#fff';rr(110,380,470,74,16);g.fill();txt('昨晚秒睡了哈哈哈😂',130,428,`500 30px ${SANS}`,'#111');g.fillStyle='#fff';rr(110,480,420,74,16);g.fill();txt('今天一起去食堂？',130,528,`500 30px ${SANS}`,'#111');g.restore();
  txt('第二天早上',820,300,`700 40px ${SERIF}`,'#6a4a2a');txt('她回了',820,370,`900 70px ${SERIF}`,'#b0501a');
  label('C','天亮了，她回了','回到那晚的聊天：清晨阳光进窗，手机一亮，小林回：“昨晚秒睡了😂 今天一起去食堂？”（接上“她是不是嫌我烦了”）');sub('别人没你想的那么在意你——这是[好消息]');}
};
window.renderAlt=(id,t)=>{g.setTransform(1,0,0,1,0,0);$('plaque').style.opacity=0;$('end').style.opacity=0;$('chap').style.opacity=0;C.style.transform='none';PULSE=0;ALT[id](t);
 const v=g.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,H*1.0);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=v;g.fillRect(0,0,W,H);const b=g.createLinearGradient(0,H,0,H-300);b.addColorStop(0,'rgba(0,0,0,.75)');b.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=b;g.fillRect(0,H-300,W,300);};
</script>
