function station(S,x,z,shape='c',s=1){const g=new THREE.Group();const mat=basic(0xffffff),ol=basic(0x34495E);let o,i;
 if(shape==='c'){o=new THREE.CircleGeometry(0.95*s,40);i=new THREE.CircleGeometry(0.66*s,40);}else if(shape==='s'){o=new THREE.PlaneGeometry(1.8*s,1.8*s);i=new THREE.PlaneGeometry(1.24*s,1.24*s);}else{const t=(r)=>{const sh=new THREE.Shape();sh.moveTo(0,r);sh.lineTo(r*0.87,-r*0.5);sh.lineTo(-r*0.87,-r*0.5);sh.closePath();return new THREE.ShapeGeometry(sh);};o=t(1.2*s);i=t(0.78*s);}
 const a=new THREE.Mesh(o,ol),b=new THREE.Mesh(i,mat);a.rotation.x=b.rotation.x=-Math.PI/2;a.position.y=0.07;b.position.y=0.075;g.add(a,b);g.position.set(x,0,z);S.add(g);}
function deco(S,lines){for(const [pts,col] of lines){const sm=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const g=new THREE.PlaneGeometry(0.75,L+0.75);g.rotateX(-Math.PI/2);g.rotateY(-Math.atan2(b[0]-a[0],b[1]-a[1]));g.translate((a[0]+b[0])/2,0.02,(a[1]+b[1])/2);sm.push(g);}
 S.add(new THREE.Mesh(mergeGeometries(sm),basic(col)));}}
function arrow(S,x,z,dir,col,len=6){const sh=new THREE.Shape();sh.moveTo(-0.35,0);sh.lineTo(-0.35,len-1.4);sh.lineTo(-0.9,len-1.4);sh.lineTo(0,len);sh.lineTo(0.9,len-1.4);sh.lineTo(0.35,len-1.4);sh.lineTo(0.35,0);sh.closePath();
 const g=new THREE.ShapeGeometry(sh);g.rotateX(-Math.PI/2);if(dir>0)g.rotateY(Math.PI);const m=new THREE.Mesh(g,basic(col));m.position.set(x,0.06,z);S.add(m);}
function label3(S,txt,col,x,y,z,w=8){const t=ctex(900,140,(c)=>{c.fillStyle=col;c.font='900 92px "Noto Sans CJK SC"';c.textAlign='center';c.fillText(txt,450,108);});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));sp.scale.set(w,w*140/900,1);sp.position.set(x,y,z);sp.renderOrder=8;S.add(sp);}
function mapDeco(S){river(S,[[-260,-120],[-40,-150],[60,-210],[300,-230]],22);
 deco(S,[[[[-90,-30],[-20,-30],[-12,-38],[-12,-110],[-40,-138],[-120,-138]],0x8E5CA8],[[[90,0],[24,0],[14,-10],[14,-70],[44,-100],[110,-100]],0x00A6B4],[[[-110,-200],[-24,-200],[-10,-214],[-10,-290]],0xE8413C]]);
 station(S,-40,-30,'c',1.5);station(S,-12,-80,'s',1.5);station(S,44,-100,'t',1.5);station(S,60,0,'c',1.5);station(S,-60,-200,'t',1.5);}
window.shot=function(n){let S,K;
 if(n===0){S=scene();S.fog=new THREE.Fog(0xF3EFE6,50,180);mapDeco(S);motorway(S,40,-260);
  for(let q=0;q<60;q++)LANES.forEach(([x,c],li)=>addCar(S,c===C.black?0xEAA800:c,x,10-q*2.85-(li%2)*0.9,'brake'));
  const p=pinSprite();p.position.set(-0.65,2.0,-14.25);S.add(p);const fr=frontA();fr.position.set(0,0,-170);S.add(fr);
  K=cam([-2.8,3.1,-6],[0.4,0.6,-30],40);
  hud({plate:['00','堵了','STUCK'],sub:'堵了[40分钟]',vms:[{t:'已堵 40:00',c:'#f22'},{t:'前方事故 ？',c:'#fff'}],km:1});}
 if(n===1){S=scene();river(S,[[-200,40],[-30,20],[40,-30],[220,-60]],20);ring(S);
  deco(S,[[[[-90,60],[-48,60],[-40,52],[-40,-60]],0x00A6B4],[[[90,-70],[46,-70],[40,-62],[40,40]],0x8E5CA8]]);station(S,-40,20,'s',1.6);station(S,40,-20,'t',1.6);
  const sim=ringSim({N:22,L:230,T:40,dt:0.02,every:1,kick:{i:0,t0:6,t1:8,dec:3.5}});ringCars(S,sim.frames[Math.round(25/sim.dt)]);
  const t=ctex(1024,256,(c)=>{c.fillStyle='#34495E';c.font='900 150px "Noto Sans CJK SC"';c.textAlign='center';c.fillText('230 米',512,180);});const pl=new THREE.PlaneGeometry(20,5);pl.rotateX(-Math.PI/2);pl.translate(0,0.08,0);S.add(new THREE.Mesh(pl,new THREE.MeshBasicMaterial({map:t,transparent:true})));
  K=cam([-46,30,46],[2,0,-4],40);
  hud({plate:['01','一个圈','THE RING'],sub:'2008年，日本，一条[230米]的圆',card:`<div class="h">实验 · 2008 · 日本</div><div class="row"><span class="k">车</span><span class="v">22 辆</span></div><div class="row"><span class="k">跑道</span><span class="v">230 米</span></div><div class="row"><span class="k">车速</span><span class="v">≈30 km/h</span></div><div class="src">Sugiyama et al., New J. Phys. 2008</div>`});}
 if(n===2){S=scene();S.fog=new THREE.Fog(0xF3EFE6,60,200);mapDeco(S);motorway(S,40,-260);
  LANES.forEach(([x,c],li)=>{let z=12-li*1.3;for(let q=0;q<34;q++){const inW=q>=9&&q<16;z-=inW?2.75:5.2;addCar(S,c===C.black?0xEAA800:c,x,z,inW?'brake':'drive');}});
  const band=new THREE.Mesh(new THREE.PlaneGeometry(7.2,22),new THREE.MeshBasicMaterial({color:0xE8413C,transparent:true,opacity:.16,depthWrite:false}));band.rotation.x=-Math.PI/2;band.position.set(0,0.045,-55);S.add(band);
  arrow(S,-4.6,-10,-1,0x3FAE49,9);label3(S,'车 往前开','#2E8B3D',-7.6,1.2,-12,7);
  arrow(S,4.6,-46,1,0xE8413C,9);label3(S,'堵点 往后跑 ≈20 km/h','#D7362F',8.6,2.6,-50,11);
  K=cam([-15,15,4],[1,0,-44],42);
  hud({plate:['02','往后跑','THE WAVE'],sub:'车在往前开，堵点却在[往后跑]'});}
 if(n===3){S=scene();S.fog=new THREE.Fog(0xF3EFE6,40,160);mapDeco(S);motorway(S,40,-200);
  LANES.forEach(([x,c],li)=>{let z=4-li*1.1;for(let q=0;q<30;q++){const gap=q<5?7.0:(q<11?7.0-(q-5)*0.72:2.75);z-=gap;addCar(S,c===C.black?0xEAA800:c,x,z,q>=11?'brake':'drive');}});
  label3(S,'车距拉得开','#34495E',7.2,1.6,-16,6.5);label3(S,'车距贴得紧','#D7362F',7.6,2.6,-64,9);
  K=cam([-11,5.2,2],[2,0.5,-40],46);
  hud({plate:['03','临界点','TIPPING POINT'],sub:'车一密，过了[临界点]',gauge:1});}
 if(n===4){S=scene();river(S,[[-200,40],[-30,20],[40,-30],[220,-60]],20);ring(S);
  ringCars(S,{x:[...Array(22)].map((_,j)=>j*230/22+(j===11?-5:0)),v:Array(22).fill(8)},{auto:11});
  {const a=(11*230/22-5)/230*2*Math.PI;label3(S,'它不追前车','#00838F',Math.sin(a)*RAD-2,6,-Math.cos(a)*RAD-4,13);}
  K=cam([-12,14,44],[-2,0,22],46);
  hud({plate:['04','一辆车','ONE CAR'],sub:'只换掉[1辆车]',card:`<div class="h">2016 · 美国 · 22 辆车</div><div class="row"><span class="k">急刹车</span><span class="v">−74% 以上</span></div><div class="row"><span class="k">油耗</span><span class="v">−22% 以上</span></div><div class="src">Stern et al., Transp. Res. C 2018</div>`});}
 if(n===5){S=scene();S.fog=new THREE.Fog(0xF3EFE6,50,170);mapDeco(S);motorway(S,40,-200);
  for(let q=0;q<30;q++)LANES.forEach(([x,c],li)=>{if(x===-0.65&&q>=3&&q<=6)return;addCar(S,c===C.black?0xEAA800:c,x,10-q*2.85-(li%2)*0.9,'drive');});
  addCar(S,0xEAA800,-0.65,0.55,'drive');const p=pinSprite();p.position.set(-0.65,2.0,0.55);S.add(p);
  const br=ctex(512,160,(c)=>{c.strokeStyle='#E8413C';c.lineWidth=10;c.beginPath();c.moveTo(20,40);c.lineTo(20,120);c.moveTo(20,80);c.lineTo(492,80);c.moveTo(492,40);c.lineTo(492,120);c.stroke();});
  const bp=new THREE.PlaneGeometry(5.6,1.6);bp.rotateX(-Math.PI/2);bp.rotateY(Math.PI/2);const bm=new THREE.Mesh(bp,new THREE.MeshBasicMaterial({map:br,transparent:true}));bm.position.set(-3.1,0.06,-5.2);S.add(bm);
  label3(S,'留出空当','#D7362F',-6.2,1.3,-5.2,5);
  K=cam([-7.5,4.2,10],[-0.6,0.4,-7],44);
  hud({plate:['05','你','YOU'],sub:'你也可以做[那一辆车]'});}
 if(n===6){S=scene();S.fog=new THREE.Fog(0xF3EFE6,50,180);mapDeco(S);motorway(S,40,-260);
  for(let q=0;q<46;q++)LANES.forEach(([x,c],li)=>addCar(S,c===C.black?0xEAA800:c,x,10-q*4.6-(li%2)*1.6,'drive'));
  const p=pinSprite();p.position.set(-0.65,2.0,-17.6);S.add(p);const fr=frontA();fr.position.set(0,0,-150);S.add(fr);
  K=cam([-2.8,3.1,-9],[0.4,0.6,-33],40);
  hud({plate:['06','下次','NEXT TIME'],sub:'只是[一道波]，刚好经过你',vms:[{t:'前方情况',c:'#fff'},{t:'什么都没有',c:'#fff'}],km:1});}
 R.setRenderTarget(null);R.setViewport(0,0,1920,1080);R.render(S,K);};
