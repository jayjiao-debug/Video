/* ---- board A (LED 情报板) with the post behind the cabinet, and a free text version ---- */
function ledBoard(lines,w=6.6,h=3.7,postH=3.9){const G=new THREE.Group();const t=ctex(960,Math.round(960*h/w),(g,W,H)=>led(g,lines,W,H,4));
 const post=lam(0x8d938c);const p=new THREE.Mesh(new THREE.BoxGeometry(0.3,postH+h/2,0.3),post);p.position.set(0,(postH+h/2)/2,-0.45);G.add(p);
 const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.4),lam(0x2b2e2c));box.position.set(0,postH+h/2,-0.1);G.add(box);
 const f=new THREE.Mesh(new THREE.PlaneGeometry(w-0.4,h-0.34),new THREE.MeshBasicMaterial({map:t}));f.position.set(0,postH+h/2,0.11);G.add(f);return G;}
function pinSprite(){const t=ctex(256,320,(g)=>{g.fillStyle='#1f1d1a';g.beginPath();g.arc(128,118,104,Math.PI*0.82,Math.PI*0.18);g.lineTo(128,312);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.arc(128,118,78,0,7);g.fill();g.fillStyle='#1f1d1a';g.font='900 96px "Noto Sans CJK SC"';g.textAlign='center';g.textBaseline='middle';g.fillText('你',128,122);});
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));s.scale.set(1.4,1.75,1);s.renderOrder=9;return s;}
function dashes(S,xs,z0,z1){const g=[];for(const x of xs)for(let z=z0;z>z1;z-=4){const b=new THREE.PlaneGeometry(0.08,1.6);b.rotateX(-Math.PI/2);b.translate(x,0.035,z);g.push(b);}S.add(new THREE.Mesh(mergeGeometries(g),basic(0xffffff)));}
const LANES=[[-1.95,C.teal],[-0.65,C.black],[0.65,C.amber],[1.95,C.blue]];
function motorway(S,z0,z1){LANES.forEach(([x,c])=>lane(S,x,z0,z1,c));dashes(S,[-1.3,0,1.3],z0,z1);}
function addCar(S,col,x,z,mode,rot=0,sc=1){const g=carB(col,mode);g.position.set(x,0,z);g.rotation.y=rot;g.scale.setScalar(sc);S.add(g);return g;}
function nightify(g){g.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshLambertMaterial){o.material=o.material.clone();o.material.color.multiplyScalar(0.55);}});}
function glowPlane(S,x,z,w,l,col,op){const g=new THREE.PlaneGeometry(w,l);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(x,0.06,z);S.add(m);return m;}
const RAD=230/(2*Math.PI);
function ring(S,col=C.blue){const r=new THREE.Mesh(new THREE.RingGeometry(RAD-0.7,RAD+0.7,256),basic(col));r.rotation.x=-Math.PI/2;r.position.y=0.04;S.add(r);
 const s=new THREE.Mesh(new THREE.RingGeometry(RAD-0.5,RAD+1.1,256),shMat);s.rotation.x=-Math.PI/2;s.position.y=0.02;S.add(s);}
function ringCars(S,frame,opts={}){for(let j=0;j<22;j++){const a=frame.x[j]/230*2*Math.PI;const auto=opts.auto===j;
 const g=carB(auto?C.white:0x2559B3,auto?'auto':(frame.v[j]<2?'brake':'drive'));g.scale.setScalar(2.4);g.position.set(Math.sin(a)*RAD,0,-Math.cos(a)*RAD);g.rotation.y=-a-Math.PI/2;S.add(g);}}
const cams={};function cam(p,l,fov=42){const c=new THREE.PerspectiveCamera(fov,16/9,0.1,900);c.position.set(...p);c.lookAt(...l);return c;}
const $=id=>document.getElementById(id);
function hud({plate,sub,vms,km,card,gauge}){
 $('chap').style.display=plate?'flex':'none';if(plate){$('chap').querySelector('.ex').textContent=plate[0];$('chap').querySelector('.t').textContent=plate[1];$('chap').querySelector('.s').textContent=plate[2];}
 $('sub').innerHTML=sub?'<span class="pill">'+sub.replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';
 $('vms').style.display=vms?'block':'none';if(vms)led($('vms').getContext('2d'),vms,420,150,3);
 $('km').style.display=km?'block':'none';$('card').style.display=card?'block':'none';if(card)$('card').innerHTML=card;$('gauge').style.display=gauge?'block':'none';}
window.shot=function(n){let S,K;
 if(n===0){S=scene();S.fog=new THREE.Fog(0xE4E6E1,50,170);motorway(S,40,-260);
  for(let q=0;q<60;q++)LANES.forEach(([x,c],li)=>addCar(S,c===C.black?0x26282b:c,x,10-q*2.85-(li%2)*0.9,'brake'));
  const p=pinSprite();p.position.set(-0.65,1.9,-14.25);S.add(p);
  const fr=frontA();fr.position.set(0,0,-170);S.add(fr);
  K=cam([-4.6,7.6,4],[-0.3,0,-24]);
  hud({plate:['00','堵了','STUCK'],sub:'堵了[40分钟]',vms:[{t:'已堵 40:00',c:'#f22'},{t:'前方事故 ？',c:'#fff'}],km:1});}
 if(n===1){S=scene();ring(S);const sim=ringSim({N:22,L:230,T:40,dt:0.02,every:1,kick:{i:0,t0:6,t1:8,dec:3.5}});ringCars(S,sim.frames[Math.round(25/sim.dt)]);
  const t=ctex(1024,256,(c)=>{c.fillStyle='#1f1d1a';c.font='900 150px "Noto Sans CJK SC"';c.textAlign='center';c.fillText('230 米',512,180);});const pl=new THREE.PlaneGeometry(20,5);pl.rotateX(-Math.PI/2);pl.translate(0,0.08,0);S.add(new THREE.Mesh(pl,new THREE.MeshBasicMaterial({map:t,transparent:true})));
  K=cam([-30,48,58],[0,0,0],40);
  hud({plate:['01','一个圈','THE RING'],sub:'2008年，日本，一条[230米]的圆',card:`<div class="h">实验 · 2008 · 日本</div><div class="row"><span class="k">车</span><span class="v">22 辆</span></div><div class="row"><span class="k">跑道</span><span class="v">230 米</span></div><div class="row"><span class="k">车速</span><span class="v">≈30 km/h</span></div><div class="src">Sugiyama et al., New J. Phys. 2008</div>`});}
 if(n===2){S=scene(0x0b0e11,true);S.fog=new THREE.Fog(0x0b0e11,30,190);
  LANES.forEach(([x,c])=>{const g=new THREE.PlaneGeometry(0.12,400);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.35}));m.position.set(x,0.03,-150);S.add(m);});
  for(const x of [-1.95,-0.65])glowPlane(S,x,-90,0.28,240,0xfff1d0,0.55);for(const x of [0.65,1.95])glowPlane(S,x,-90,0.28,240,0xff3a2a,0.45);
  for(let q=0;q<26;q++){for(const [x,c] of LANES){const z=12-q*5.2-(x>0?2:0);const inWave=z<-16&&z>-46&&x>0;const g=addCar(S,c===C.black?0x26282b:c,x,z,inWave?'brake':'drive');nightify(g);
   if(inWave)glowPlane(S,x,z+1.6,1.4,2.4,0xff2a1a,0.55);}}
  glowPlane(S,1.3,-31,3.4,30,0xff2a1a,0.22);
  const bl=[];for(let q=0;q<90;q++){const h=3+Math.random()*22;const b=new THREE.BoxGeometry(4+Math.random()*5,h,4+Math.random()*5);b.translate((Math.random()<.5?-1:1)*(11+Math.random()*40),h/2,30-Math.random()*240);bl.push(b);}
  const wt=ctex(64,128,(c)=>{c.fillStyle='#161b21';c.fillRect(0,0,64,128);for(let y=4;y<128;y+=10)for(let x=4;x<64;x+=10){if(Math.random()<.32){c.fillStyle=Math.random()<.7?'#f3c46a':'#9cc8ff';c.fillRect(x,y,5,6);}}});wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(1,2);
  S.add(new THREE.Mesh(mergeGeometries(bl),new THREE.MeshBasicMaterial({map:wt,color:0x9a9a9a})));
  const lb=ctex(512,128,(c)=>{c.fillStyle='#ff5040';c.font='900 80px "Noto Sans CJK SC"';c.textAlign='center';c.fillText('堵点 ≈20 km/h ▼',256,96);});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:lb,depthTest:false}));sp.scale.set(7,1.75,1);sp.position.set(4.6,3.2,-30);S.add(sp);
  K=cam([-7,8.5,22],[1.5,0,-26],44);
  hud({plate:['02','往后跑','THE WAVE'],sub:'车在往前开，堵点却在[往后跑]'});}
 if(n===3){S=scene();lane(S,0,40,-200,C.black);
  let z=12;for(let q=0;q<34;q++){const gap=q<12?7.5:(q<20?7.5-(q-12)*0.6:2.75);z-=gap;const brake=q>=20;addCar(S,0x26282b,0,z,brake?'brake':'drive');}
  K=cam([-10,12,10],[0,0,-40],44);
  hud({plate:['03','临界点','TIPPING POINT'],sub:'车一密，过了[临界点]',gauge:1});}
 if(n===4){S=scene();ring(S);const sim=ringSim({N:22,L:230,T:40,dt:0.02,every:1,kick:{i:0,t0:6,t1:8,dec:3.5}});const fr=sim.frames[Math.round(9/sim.dt)];
  // the automated car keeps a long gap: place it with extra space ahead
  ringCars(S,{x:[...Array(22)].map((_,j)=>j*230/22+(j===5?-4:0)),v:Array(22).fill(8)},{auto:5});
  K=cam([-34,44,50],[0,0,0],40);
  hud({plate:['04','一辆车','ONE CAR'],sub:'只换掉[1辆车]',card:`<div class="h">2016 · 美国 · 22 辆车</div><div class="row"><span class="k">急刹车</span><span class="v">−74% 以上</span></div><div class="row"><span class="k">油耗</span><span class="v">−22% 以上</span></div><div class="src">Stern et al., Transp. Res. C 2018</div>`});}
 if(n===5){S=scene();S.fog=new THREE.Fog(0xE4E6E1,50,170);motorway(S,40,-200);
  for(let q=0;q<30;q++)LANES.forEach(([x,c],li)=>{if(x===-0.65&&q>=3&&q<=5)return;addCar(S,c===C.black?0x26282b:c,x,10-q*2.85-(li%2)*0.9,'drive');});
  const you=addCar(S,0x26282b,-0.65,-6.2,'drive');const p=pinSprite();p.position.set(-0.65,1.9,-6.2);S.add(p);
  const br=ctex(512,160,(c)=>{c.strokeStyle='#E5493A';c.lineWidth=10;c.beginPath();c.moveTo(20,40);c.lineTo(20,120);c.moveTo(20,80);c.lineTo(492,80);c.moveTo(492,40);c.lineTo(492,120);c.stroke();});
  const bp=new THREE.PlaneGeometry(5.6,1.6);bp.rotateX(-Math.PI/2);bp.rotateY(Math.PI/2);const bm=new THREE.Mesh(bp,new THREE.MeshBasicMaterial({map:br,transparent:true}));bm.position.set(-3.1,0.06,-10.2);S.add(bm);
  const lt=ctex(512,128,(c)=>{c.fillStyle='#E5493A';c.font='900 84px "Noto Sans CJK SC"';c.textAlign='center';c.fillText('留出空当',256,96);});const ls=new THREE.Sprite(new THREE.SpriteMaterial({map:lt}));ls.scale.set(4.4,1.1,1);ls.position.set(-5.4,1.2,-10.2);S.add(ls);
  K=cam([-6.5,6.6,4],[-0.8,0,-14],42);
  hud({plate:['05','你','YOU'],sub:'你也可以做[那一辆车]'});}
 if(n===6){S=scene();S.fog=new THREE.Fog(0xE4E6E1,50,170);motorway(S,40,-260);
  for(let q=0;q<46;q++)LANES.forEach(([x,c],li)=>addCar(S,c===C.black?0x26282b:c,x,10-q*4.6-(li%2)*1.6,'drive'));
  const p=pinSprite();p.position.set(-0.65,1.9,-17.6);S.add(p);const fr=frontA();fr.position.set(0,0,-150);S.add(fr);
  K=cam([-4.6,7.6,4],[-0.3,0,-24]);
  hud({plate:['06','下次','NEXT TIME'],sub:'只是[一道波]，刚好经过你',vms:[{t:'前方情况',c:'#fff'},{t:'什么都没有',c:'#fff'}],km:1});}
 R.setRenderTarget(null);R.setViewport(0,0,1920,1080);R.render(S,K);};
