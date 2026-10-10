/* ===== 幽灵堵车 · full one-take film (129.97 s = 64 bars of the Slowed BGM) ===== */
INK.on=false;
const DUR=129.97;
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),pr=(t,a,b)=>cl((t-a)/(b-a)),eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,eo=x=>1-Math.pow(1-x,3),sst=x=>x*x*(3-2*x);
const lerp=(a,b,f)=>a+(b-a)*f;
const BGC=0xE6E8E3;
const S=new THREE.Scene();S.background=new THREE.Color(BGC);S.fog=new THREE.Fog(BGC,120,420);
S.add(new THREE.HemisphereLight(0xffffff,0xe3e6df,2.35));{const d=new THREE.DirectionalLight(0xffffff,0.9);d.position.set(-20,40,25);S.add(d);}
function lay(m,y,order){m.position.y=y;m.renderOrder=order;m.material.polygonOffset=true;m.material.polygonOffsetFactor=-order;m.material.polygonOffsetUnits=-order*4;return m;}
// ---- ground: light concrete, dot grid
{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#E6E8E3';g.fillRect(0,0,256,256);
 let sd=3;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let i=0;i<1400;i++){g.fillStyle=`rgba(70,80,75,${r()*0.03})`;g.fillRect(r()*256,r()*256,2,2);}
 g.fillStyle='rgba(60,70,65,.26)';for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.beginPath();g.arc(x*64+32,y*64+32,2.6,0,7);g.fill();}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(400,400);t.anisotropy=16;t.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(3200,3200),new THREE.MeshBasicMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(0,0,-400);S.add(m);}
const mute=(hex,f=0.45)=>new THREE.Color(hex).lerp(new THREE.Color(BGC),f).getHex();
const shM=new THREE.MeshBasicMaterial({color:0x2a3a35,transparent:true,opacity:.10,depthWrite:false});
// ---- strip along a sampled path (used for lanes and accent curves)
function strip(pts,w,col,y,order,shadow=true){const L=[],Rr=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;L.push([pts[i][0]-dz*w/2,pts[i][1]+dx*w/2]);Rr.push([pts[i][0]+dz*w/2,pts[i][1]-dx*w/2]);}
 const sh=new THREE.Shape();const all=L.concat(Rr.reverse());sh.moveTo(all[0][0],-all[0][1]);for(const p of all.slice(1))sh.lineTo(p[0],-p[1]);const geo=new THREE.ShapeGeometry(sh);
 const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col}));m.rotation.x=-Math.PI/2;lay(m,y,order);S.add(m);
 if(shadow){const s=new THREE.Mesh(geo,shM.clone());s.rotation.x=-Math.PI/2;lay(s,y-0.01,order-1);s.position.x=0.18;s.position.z=0.18;S.add(s);}
 for(const e of [pts[0],pts[pts.length-1]]){const c=new THREE.Mesh(new THREE.CircleGeometry(w/2,20),new THREE.MeshBasicMaterial({color:col}));c.rotation.x=-Math.PI/2;lay(c,y,order);c.position.x=e[0];c.position.z=e[1];S.add(c);}}
function smoothPts(pts,k=4){let p=pts;for(let n=0;n<k;n++){const q=[p[0]];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);}q.push(p[p.length-1]);p=q;}return p;}
// ---- motorway A path: straight along −z, then a right-hand bend that leaves the frame toward +x
const RB=34,ZB=-236;
function pathA(s,d){ // s: arc length from z=40, d: lateral offset (+ = right / +x)
 const L1=40-ZB;if(s<=L1)return [d,40-s,0];
 const arc=(Math.PI/2)*RB;if(s<=L1+arc){const th=(s-L1)/RB;const cx=RB,cz=ZB;const r=RB-d;return [cx-Math.cos(th)*r,cz-Math.sin(th)*r,th];}
 const u=s-L1-arc;return [RB+u,ZB-RB+d,Math.PI/2];}
const LEN_A=40-ZB+(Math.PI/2)*RB+700;
const LANE=[[-1.95,0x3FAE49],[-0.65,0xF5B700],[0.65,0x2F7FD3],[1.95,0xF28C28]];
function lanePts(d,s0,s1,step=2){const p=[];for(let s=s0;s<=s1;s+=step){const q=pathA(s,d);p.push([q[0],q[1]]);}return p;}
LANE.forEach(([d,c])=>strip(lanePts(d,0,LEN_A),0.55,c,0.08,6));
{const g=[];for(const d of [-1.3,0,1.3])for(let s=0;s<LEN_A;s+=4){const q=pathA(s,d);const b=new THREE.PlaneGeometry(0.08,1.6);b.rotateX(-Math.PI/2);b.rotateY(-q[2]);b.translate(q[0],0,q[1]);g.push(b);}
 const m=new THREE.Mesh(mergeGeometries(g),new THREE.MeshBasicMaterial({color:0xffffff}));lay(m,0.1,8);S.add(m);}
// ---- motorway B (the final stretch, straight ahead past the ring)
const ZB0=-410,ZB1=-1300;
LANE.forEach(([d,c])=>strip([[d,ZB0],[d,ZB1]],0.55,c,0.08,6));
{const g=[];for(const d of [-1.3,0,1.3])for(let z=ZB0;z>ZB1;z-=4){const b=new THREE.PlaneGeometry(0.08,1.6);b.rotateX(-Math.PI/2);b.translate(d,0,z);g.push(b);}const m=new THREE.Mesh(mergeGeometries(g),new THREE.MeshBasicMaterial({color:0xffffff}));lay(m,0.1,8);S.add(m);}
// ---- the ring
const RC={x:0,z:-330};
{const r=new THREE.Mesh(new THREE.RingGeometry(RAD-0.7,RAD+0.7,256),new THREE.MeshBasicMaterial({color:0xE8413C}));r.rotation.x=-Math.PI/2;lay(r,0.08,6);r.position.x=RC.x;r.position.z=RC.z;S.add(r);
 const s=new THREE.Mesh(new THREE.RingGeometry(RAD-0.5,RAD+1.1,256),shM.clone());s.rotation.x=-Math.PI/2;lay(s,0.07,5);s.position.x=RC.x+0.2;s.position.z=RC.z+0.2;S.add(s);}
// ---- muted accent curves (no stations)
const ACC=[[[[-80,20],[-20,18],[-11,6],[-11,-120],[-40,-150],[-120,-152]],0x8E5CA8],
 [[[-60,-250],[-36,-262],[-30,-300],[-52,-330],[-58,-380],[-30,-404],[-8,-404]],0x00A6B4],
 [[[90,-300],[60,-318],[48,-350],[60,-390],[110,-420]],0x3FAE49],
 [[[-110,-520],[-40,-522],[-12,-540],[-12,-700]],0xF28C28],[[[70,-560],[18,-580],[12,-640],[40,-720]],0x8E5CA8]];
const accPts=ACC.map(([p,c])=>{const sp=smoothPts(p);strip(sp,0.5,mute(c,0.42),0.06,4);return sp;});
// ---- props: small trees + a few lamp posts, muted and away from every road/curve
function farFromRoads(x,z,m){if(z>ZB-10&&z<44&&Math.abs(x)<6+m)return false;if(z<ZB&&z>ZB-RB-8&&x>RB-6&&Math.hypot(x-RB,z-ZB)<RB+5+m&&Math.hypot(x-RB,z-ZB)>RB-5-m)return false;
 if(z<ZB-RB+6&&z>ZB-RB-6-m&&x>RB-2)return false;if(z<ZB0+6&&Math.abs(x)<6+m)return false;const rr=Math.hypot(x-RC.x,z-RC.z);if(rr>RAD-4-m&&rr<RAD+4+m)return false;
 for(const pts of accPts)for(const p of pts)if(Math.hypot(p[0]-x,p[1]-z)<2.2+m)return false;return true;}
let sp=17;const prn=()=>{sp=(sp*16807)%2147483647;return sp/2147483647;};
const tops=[],trunks=[],lamps=[],tshadow=[];
function addTree(x,z,s){if(!farFromRoads(x,z,1.2*s))return;const t=new THREE.CylinderGeometry(0.1*s,0.13*s,0.7*s,6);t.translate(x,0.35*s,z);trunks.push(t);const c=new THREE.IcosahedronGeometry(0.75*s,0);c.translate(x,1.1*s,z);tops.push(c);
 const g=new THREE.CircleGeometry(0.8*s,14);g.rotateX(-Math.PI/2);g.translate(x+0.25,0,z+0.25);tshadow.push(g);}
for(let k=0;k<420;k++){const x=(prn()-0.5)*220,z=40-prn()*1100;addTree(x,z,0.6+prn()*0.6);}
for(let k=0;k<10;k++){const a=prn()*Math.PI*2,r=prn()*(RAD-9);addTree(RC.x+Math.sin(a)*r,RC.z+Math.cos(a)*r,0.8+prn()*0.4);}
for(let z=30;z>ZB;z-=36)for(const x of [-3.6,3.6]){const p=new THREE.CylinderGeometry(0.06,0.08,3.0,8);p.translate(x,1.5,z);lamps.push(p);const h=new THREE.BoxGeometry(0.6,0.1,0.2);h.translate(x+(x<0?0.26:-0.26),3.0,z);lamps.push(h);}
for(let z=ZB0-10;z>ZB1;z-=36)for(const x of [-3.6,3.6]){const p=new THREE.CylinderGeometry(0.06,0.08,3.0,8);p.translate(x,1.5,z);lamps.push(p);const h=new THREE.BoxGeometry(0.6,0.1,0.2);h.translate(x+(x<0?0.26:-0.26),3.0,z);lamps.push(h);}
S.add(new THREE.Mesh(mergeGeometries(tops),new THREE.MeshLambertMaterial({color:0xBFD3B2,flatShading:true})));
S.add(new THREE.Mesh(mergeGeometries(trunks),new THREE.MeshLambertMaterial({color:0xC9BBA8})));
S.add(new THREE.Mesh(mergeGeometries(lamps),new THREE.MeshLambertMaterial({color:0xD3D7D1})));
{const m=new THREE.Mesh(mergeGeometries(tshadow),shM.clone());lay(m,0.05,3);S.add(m);}
// ---- cars
const PAL=[0x3FAE49,0x2F7FD3,0xF28C28,0x8E5CA8,0x00A6B4,0xE8413C,0xFFFFFF];
let sd2=5;const rr2=()=>{sd2=(sd2*16807)%2147483647;return sd2/2147483647;};
const glowT=ctex(64,64,(q)=>{const r=q.createLinearGradient(0,0,0,64);r.addColorStop(0,'rgba(255,60,40,.6)');r.addColorStop(1,'rgba(255,60,40,0)');q.fillStyle=r;q.fillRect(0,0,64,64);});
function mkCar(col){const g=carB(col,'drive');const tails=[];g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x7a2018)tails.push(o);});
 g.traverse(o=>{if(o.isMesh&&o.material&&o.material.transparent&&o.material.opacity<0.5)o.renderOrder=9;});
 const p=new THREE.PlaneGeometry(0.9,0.6);p.rotateX(-Math.PI/2);const gm=new THREE.MeshBasicMaterial({map:glowT,transparent:true,depthWrite:false});const glow=new THREE.Mesh(p,gm);glow.position.set(0,0.13,1.3);glow.renderOrder=9;g.add(glow);
 const body=[];g.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshLambertMaterial)body.push(o);});
 return {g,tm:tails.length?tails[0].material:null,gm,body};}
const BON=new THREE.Color(0xFF3020),BOFF=new THREE.Color(0x7a2018);
function setBrake(c,f){if(c.tm)c.tm.color.copy(BOFF).lerp(BON,f);c.gm.opacity=f;}
// motorway A: the queue
const carsA=[];const GAP=2.85,FRONT_S=40+174,NPL=70;
LANE.forEach(([d],li)=>{for(let i=0;i<NPL;i++){const s0=FRONT_S-(li%2)*0.9-i*GAP;const you=li===1&&i===50;
 const k=mkCar(you?0xEAA800:PAL[Math.floor(rr2()*PAL.length)]);S.add(k.g);carsA.push({...k,li,i,s0,d,you});}});
const YOU=carsA.find(c=>c.you);
function placeOnA(c,s){const q=pathA(s,c.d);c.g.position.set(q[0],0,q[1]);c.g.rotation.y=-q[2];c.g.visible=s<LEN_A-20;}
const pinA=pinSprite();S.add(pinA);
// front-of-queue marker C: round label on a stem + a ring on the ground
const qT=ctex(512,512,(g)=>{g.fillStyle='#34495E';g.beginPath();g.arc(256,256,240,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(256,256,192,0,7);g.fill();g.fillStyle='#34495E';g.font='900 128px "Noto Sans CJK SC"';g.textAlign='center';g.textBaseline='middle';g.fillText('队头',256,232);g.font='700 46px "Noto Sans CJK SC"';g.fillText('K 1.6',256,334);});
const qS=new THREE.Sprite(new THREE.SpriteMaterial({map:qT}));qS.scale.set(3.0,3.0,1);qS.position.set(0,4.2,-176.5);S.add(qS);
{const st=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.6,8),new THREE.MeshLambertMaterial({color:0x34495E}));st.position.set(0,1.3,-176.5);S.add(st);
 const rg=new THREE.Mesh(new THREE.RingGeometry(3.2,3.45,72),new THREE.MeshBasicMaterial({color:0x34495E}));rg.rotation.x=-Math.PI/2;lay(rg,0.12,9);rg.position.z=-176.5;S.add(rg);}
// roadside info board (white card)
function infoCard(g,W,H,title,rows){g.clearRect(0,0,W,H);g.fillStyle='#FFFFFF';rr(g,8,8,W-16,H-16,46);g.fill();g.lineWidth=8;g.strokeStyle='#34495E';rr(g,8,8,W-16,H-16,46);g.stroke();
 g.fillStyle='#1D7A4C';rr(g,8,8,W-16,140,46);g.fill();g.fillRect(8,100,W-16,48);g.fillStyle='#fff';g.font='900 90px "Noto Sans CJK SC"';g.textAlign='center';g.fillText(title,W/2,112);
 rows.forEach((r,i)=>{if(!r)return;const y=262+i*112;g.textAlign='left';g.fillStyle='#34495E';g.font='900 84px "Noto Sans CJK SC"';g.fillText(r[0],80,y);g.textAlign='right';g.fillStyle=r[1]==='无'?'#E8413C':'#8A949C';g.fillText(r[1],W-80,y);
  g.strokeStyle='#D9DDD8';g.lineWidth=4;g.beginPath();g.moveTo(80,y+32);g.lineTo(W-80,y+32);g.stroke();});}
const vbT=ctex(960,600,()=>{});const vb=new THREE.Group();
{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,4.4,12),new THREE.MeshLambertMaterial({color:0xC5CAC4}));p.position.set(0,2.2,-0.4);vb.add(p);
 const box=new THREE.Mesh(new RoundedBoxGeometry(7.4,4.7,0.34,3,0.28),new THREE.MeshLambertMaterial({color:0xD3D8D2}));box.position.set(0,6.4,-0.14);vb.add(box);
 const f=new THREE.Mesh(new THREE.PlaneGeometry(7.0,4.375),new THREE.MeshBasicMaterial({map:vbT}));f.position.set(0,6.4,0.05);vb.add(f);}
vb.position.set(9.5,0,-196);vb.rotation.y=-0.42;S.add(vb);
let vbKey='';function drawVB(T){const it=[['车祸',8.0],['施工',8.7],['收费站',9.4]];const rows=it.map(([n,t0])=>T<t0?null:[n,T>=t0+0.4?'无':'？']);const k=JSON.stringify(rows);if(k===vbKey)return;vbKey=k;infoCard(vbT.image.getContext('2d'),960,600,'前方情况',rows);vbT.needsUpdate=true;}
// ring cars and simulation (time-warped)
const RATE=t=>t<14?0:(t<81?1.8:(t<86?lerp(1.8,1.0,sst(pr(t,81,86))):(t<101.8?1.0:lerp(1.0,1.3,sst(pr(t,101.8,104))))));
const SIMT=[];{let acc=0;for(let i=0;i<=Math.ceil(DUR*60);i++){SIMT.push(acc);acc+=RATE(i/60)/60;}}
const simAt=t=>{const k=cl(t*60,0,SIMT.length-1);const i=Math.floor(k);return SIMT[i]+(SIMT[Math.min(i+1,SIMT.length-1)]-SIMT[i])*(k-i);};
const KICK=simAt(54.0);
const RS=ringSim2({N:22,L:230,T:Math.ceil(simAt(DUR))+2,dt:0.02,every:2,hs:5.8,hmin:5.0,kick:{i:0,t0:KICK,t1:KICK+2.0,dec:3.0}});
const OFF=-Math.PI/2-(RS.frames[Math.round(KICK/RS.dt)].x[0]/230)*2*Math.PI; // car 0 brakes on the west side, facing the camera
function ringState(t){const s=simAt(t);const k=Math.min(RS.frames.length-2,s/RS.dt);const i=Math.floor(k),f=k-i;const A=RS.frames[i],B=RS.frames[i+1];const x=[],v=[];for(let j=0;j<22;j++){x.push(A.x[j]+(B.x[j]-A.x[j])*f);v.push(A.v[j]+(B.v[j]-A.v[j])*f);}return {x,v};}
const AUTO=7;const ringCars=[];for(let j=0;j<22;j++){const k=mkCar(j===0?0xE8413C:PAL[(j*2+1)%6]);k.g.scale.setScalar(2.4);S.add(k.g);ringCars.push(k);}
const autoRing=new THREE.Mesh(new THREE.RingGeometry(1.25,1.4,48),new THREE.MeshBasicMaterial({color:0x2FB3A8,transparent:true,opacity:0}));autoRing.rotation.x=-Math.PI/2;autoRing.position.y=0.15;autoRing.renderOrder=9;ringCars[AUTO].g.add(autoRing);
const autoDome=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,0.1,20),new THREE.MeshBasicMaterial({color:0x2FB3A8}));autoDome.position.set(0,0.7,-0.07);autoDome.visible=false;ringCars[AUTO].g.add(autoDome);
const ringAng=(x)=>x/230*2*Math.PI+OFF;
const ringPos=(a)=>[RC.x+Math.sin(a)*RAD,RC.z-Math.cos(a)*RAD];
function jamAngle(st){let sx=0,sy=0,n=0;for(let j=0;j<22;j++){const w=cl((3-st.v[j])/3);if(w<=0)continue;const a=ringAng(st.x[j]);sx+=Math.sin(a)*w;sy+=Math.cos(a)*w;n+=w;}return n>0.3?Math.atan2(sx,sy):null;}
// pre-compute a heavily smoothed jam angle for the camera (unwrapped)
const JA=[];{let prev=null;for(let i=0;i<=Math.ceil(DUR*4);i++){const t=i/4;const a=t<55?null:jamAngle(ringState(t));let v=a===null?(prev===null?-Math.PI/2:prev):a;if(prev!==null){while(v-prev>Math.PI)v-=2*Math.PI;while(v-prev<-Math.PI)v+=2*Math.PI;}JA.push(v);prev=v;}
 const sm=JA.map((_,i)=>{let s=0,n=0;for(let k=-12;k<=12;k++){const q=JA[cl(i+k,0,JA.length-1)];s+=q;n++;}return s/n;});for(let i=0;i<JA.length;i++)JA[i]=sm[i];}
const jaAt=t=>{const k=cl(t*4,0,JA.length-1);const i=Math.floor(k);return JA[i]+((JA[Math.min(i+1,JA.length-1)])-JA[i])*(k-i);};
// labels on the ring (screen-sized)
function spriteLabel(txt,col,hpx,bg){const t=ctex(1024,180,(c)=>{c.font='900 112px "Noto Sans CJK SC"';const w=c.measureText(txt).width;if(bg){c.fillStyle=bg;rr(c,512-w/2-40,18,w+80,144,40);c.fill();}c.fillStyle=col;c.textAlign='center';c.fillText(txt,512,132);});
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,sizeAttenuation:false,transparent:true,opacity:0}));const h=hpx/1080*2.0;s.scale.set(h*1024/180,h,1);s.renderOrder=20;S.add(s);return s;}
const lbForward=spriteLabel('车  往前开 →','#2E8B3D',64,'rgba(255,255,255,.85)'),lbBack=spriteLabel('← 堵点  往后跑','#D7362F',64,'rgba(255,255,255,.85)');
const lbBraker=spriteLabel('最早踩刹车的那辆','#D7362F',52,'rgba(255,255,255,.88)'),lbAuto=spriteLabel('它不追前车，留出空当','#1F8F86',56,'rgba(255,255,255,.88)');
const t230=ctex(1024,256,(c)=>{c.fillStyle='#34495E';c.font='900 150px "Noto Sans CJK SC"';c.textAlign='center';c.fillText('230 米',512,180);});
const lab230=new THREE.Mesh(new THREE.PlaneGeometry(22,5.5),new THREE.MeshBasicMaterial({map:t230,transparent:true,opacity:0,depthWrite:false}));lab230.rotation.x=-Math.PI/2;lay(lab230,0.12,9);lab230.position.x=RC.x;lab230.position.z=RC.z;S.add(lab230);
// motorway B: flowing traffic; you keep a longer gap; a soft brake wave passes you at the end
const VB=7.0,T0B=110;const carsB=[];
LANE.forEach(([d],li)=>{const gap=li===1?11:8.6;for(let i=0;i<28;i++){const off=li===1&&i===4?0:0;const k=mkCar(li===1&&i===4?0xEAA800:PAL[Math.floor(rr2()*PAL.length)]);S.add(k.g);carsB.push({...k,d,li,i,z0:ZB0-6-i*gap-(li%2)*3.1-(li===1&&i>4?6:0),you:li===1&&i===4});}});
const YOUB=carsB.find(c=>c.you);const pinB=pinSprite();S.add(pinB);
const zYouB=t=>YOUB.z0-VB*Math.max(0,t-T0B);
const brk=ctex(512,160,(c)=>{c.strokeStyle='#E8413C';c.lineWidth=12;c.beginPath();c.moveTo(20,40);c.lineTo(20,120);c.moveTo(20,80);c.lineTo(492,80);c.moveTo(492,40);c.lineTo(492,120);c.stroke();});
const gapM=new THREE.Mesh(new THREE.PlaneGeometry(1.6,9.0),new THREE.MeshBasicMaterial({map:brk,transparent:true,opacity:0,depthWrite:false}));gapM.rotation.x=-Math.PI/2;gapM.rotation.z=Math.PI/2;lay(gapM,0.13,10);gapM.position.x=-3.2;S.add(gapM);
const lbGap=spriteLabel('留出空当','#D7362F',52,'rgba(255,255,255,.88)');
/* ---- camera: shots blended with long smooth cross-fades (no hard turns) ---- */
function hermK(K,T,idx){let i=0;while(i<K.length-2&&T>K[i+1][0])i++;const t0=K[i][0],t1=K[i+1][0];const u=cl((T-t0)/(t1-t0));
 const P=j=>K[cl(j,0,K.length-1)][idx],Tt=j=>K[cl(j,0,K.length-1)][0];const dim=P(0).length;const out=[];
 for(let c=0;c<dim;c++){const m=j=>{if(j<=0||j>=K.length-1)return 0;return (P(j+1)[c]-P(j-1)[c])/(Tt(j+1)-Tt(j-1));};const h00=2*u**3-3*u**2+1,h10=u**3-2*u**2+u,h01=-2*u**3+3*u**2,h11=u**3-u**2,d=t1-t0;
  out.push(P(i)[c]*h00+m(i)*h10*d+P(i+1)[c]*h01+m(i+1)*h11*d);}return out;}
const yz=pathA(YOU.s0,YOU.d)[1];
const KA=[[0,[-3,3.2,yz+7.5],[0.2,0.6,yz-16]],[3.4,[-2.6,4.4,yz+2],[0.4,0.6,yz-24]],[7.4,[-3.4,10,-146],[2.2,1.6,-186]],[11.0,[-4.2,12.5,-165],[5.5,2.4,-197]],
 [14.0,[-3,24,-182],[1.5,0,-214]],[17.5,[-2,44,-206],[0,0,-258]],[21.0,[-6,58,-236],[0,0,-318]],[24,[-8,62,-250],[0,0,-326]]];
function shotA(T){const p=hermK(KA,T,1),l=hermK(KA,T,2);return [p,l];}
// ring shot in polar form around RC: [t, az, dist, height, lookShift]
const KR=[[19,[0.0,95,60,0]],[33,[-0.35,82,48,0]],[45,[-0.7,72,38,0.25]],[53,[-1.0,62,26,0.55]],[61,[-1.1,60,23,0.55]],[69,[-0.95,80,42,0.1]],[77,[-0.9,74,36,0.2]],
 [81.4,[-0.85,64,30,0.45]],[93,[-0.85,62,28,0.45]],[97.8,[-0.9,66,32,0.3]],[101.8,[-0.6,88,60,0]],[109,[-0.25,80,54,0]],[113,[-0.05,90,62,0]]];
function shotR(T){const [az0,d,h,ls]=hermK(KR,T,1);let az=az0;let look=[RC.x,0,RC.z];
 if(T>79){const w=sst(pr(T,79,84))*(1-sst(pr(T,98,103)));az=az0+0.5*w*(jaAt(T)-jaAt(81.4));const ja=jaAt(T);const jp=ringPos(ja);look=[lerp(RC.x,jp[0],ls*w),0,lerp(RC.z,jp[1],ls*w)];}
 else if(T>45&&T<75){const st=ringState(54.5);const p0=ringPos(ringAng(st.x[0]));look=[lerp(RC.x,p0[0],ls),0,lerp(RC.z,p0[1],ls)];}
 return [[RC.x+Math.sin(az)*d,h,RC.z+Math.cos(az)*d],look];}
function shotB(T){const z=zYouB(T);return [[-3.0,3.4,z+8],[0.3,0.7,z-16]];}
function mixShot(a,b,f){return [a[0].map((v,i)=>lerp(v,b[0][i],f)),a[1].map((v,i)=>lerp(v,b[1][i],f))];}
function camAt(T){if(T<19)return shotA(T);if(T<24)return mixShot(shotA(T),shotR(T),sst(pr(T,19,24)));if(T<111)return shotR(T);if(T<118)return mixShot(shotR(T),shotB(T),eio(pr(T,111,118)));return shotB(T);}
const camera=new THREE.PerspectiveCamera(42,16/9,0.8,1500);
/* ---- subtitles and HUD ---- */
const LINES=[[0,3.4,'堵了[40分钟]'],[3.4,7.4,'到前面一看——'],[7.4,11.0,'[什么都没有]'],[11.0,14.0,'然后，突然就通了'],[14.0,16.4,'那刚才，是谁堵的？'],
 [21.2,25.2,'2008年，日本'],[25.2,29.2,'一条[230米]的圆形跑道'],[29.2,33.2,'[22辆车]，绕着圈开'],[33.2,37.2,'规则只有一条'],[37.2,41.2,'跟着前车，[安全地开]'],[41.2,45.2,'没有红绿灯，也没有路口'],[45.2,49.0,'一开始，一切正常'],
 [49.0,53.0,'几分钟后'],[53.0,57.0,'有一辆车，[慢了一点点]'],[57.0,61.0,'后车刹得[更重一点]'],[61.0,65.1,'再后面的，[直接停了]'],
 [65.2,69.2,'一个堵车，[凭空出现]'],[69.2,73.2,'没有车祸，也没有施工'],[73.2,77.2,'更奇怪的是——'],[77.2,81.3,'车，一直在往前开'],
 [81.4,85.6,'堵点，却在[往后跑]'],[85.6,89.8,'大约每小时[20公里]'],[89.8,93.8,'跟高速上测到的一样'],[93.8,97.8,'所以让你停下的那一脚刹车'],[97.8,101.8,'踩它的人，[早就开远了]'],
 [101.8,105.8,'那能不能不堵？'],[105.8,109.8,'2016年的实验：只换掉[1辆车]'],[109.8,113.8,'它留出空当，急刹少了[七成多]'],
 [113.8,117.8,'你也可以做[那一辆车]'],[117.8,121.4,'下次堵着，前面什么都没有'],[121.4,125.4,'只是[一道波]，刚好经过你']];
const CHAP=[[0,16.4,'00','堵了','STUCK'],[21.2,81.3,'01','一个圈','THE RING'],[81.4,101.7,'02','往后跑','THE WAVE'],[101.8,113.7,'03','一辆车','ONE CAR'],[113.8,125.3,'04','你','YOU']];
function hudCard(g,mode,a,b){const W=520,H=180;g.clearRect(0,0,W,H);g.fillStyle='#fff';rr(g,0,0,W,H,26);g.fill();
 if(mode==='timer'){g.fillStyle='#8A949C';g.font='700 34px "Noto Sans CJK SC"';g.textAlign='left';g.fillText('已经堵了',34,64);g.fillText('前方事故',34,146);
  g.textAlign='right';g.font='900 64px "Noto Sans CJK SC"';g.fillStyle=a[1]?'#E8413C':'#34495E';g.fillText(a[0],W-34,70);g.fillStyle=b==='0'?'#E8413C':'#34495E';g.fillText(b,W-34,152);
  g.strokeStyle='#E3E6E2';g.lineWidth=3;g.beginPath();g.moveTo(34,96);g.lineTo(W-34,96);g.stroke();}
 else{g.fillStyle='#8A949C';g.font='700 34px "Noto Sans CJK SC"';g.textAlign='left';g.fillText('跑道上停着的车',34,70);g.textAlign='right';g.fillStyle=a>0?'#E8413C':'#34495E';g.font='900 92px "Noto Sans CJK SC"';g.fillText(a+' 辆',W-34,152);}}
let hk='',ck='',pk=-1;
window.renderAt=function(T){
 // A: queue, then the start-up wave from the front (11.0 s), cars drive off round the bend
 for(const c of carsA){const ts=11.0+c.i*0.16+c.li*0.05;const dt=Math.max(0,T-ts);const a=2.6,tv=3.2;const s=dt<tv?0.5*a*dt*dt:0.5*a*tv*tv+a*tv*(dt-tv);placeOnA(c,c.s0+s);setBrake(c,1-cl(dt/0.6));}
 pinA.position.set(YOU.g.position.x,0.9,YOU.g.position.z);pinA.material.opacity=1-pr(T,4.2,5.2);pinA.visible=pinA.material.opacity>0;
 drawVB(T);
 // ring
 const st=ringState(T);const blend=sst(pr(T,104.5,111.5));let mean=0;for(let j=0;j<22;j++)mean+=st.x[j]-j*230/22;mean/=22;let stopped=0;
 for(let j=0;j<22;j++){const xu=mean+j*230/22+(j===AUTO?-3:0)+(j===AUTO+1?0:0);const x=lerp(st.x[j],xu,blend);const a=ringAng(x);const p=ringPos(a);const c=ringCars[j];c.g.position.set(p[0],0,p[1]);c.g.rotation.y=-a-Math.PI/2;
  const bf=cl((3-st.v[j])/2.5)*(1-blend);setBrake(c,T<14?0:bf);if(st.v[j]<1.5&&blend<0.5&&T>54)stopped++;}
 {const w=pr(T,101.8,103.0);for(const o of ringCars[AUTO].body){o.material.color.lerp(new THREE.Color(0xF7F8F6),w*0.5);}autoRing.material.opacity=w;autoDome.visible=w>0.5;}
 lab230.material.opacity=pr(T,25.2,26)*(1-pr(T,48,49.5));
 // ring labels
 {const ja=jaAt(T);const jp=ringPos(ja);const w=pr(T,81.6,82.4)*(1-pr(T,93.5,94.3));lbBack.position.set(jp[0],5,jp[1]);lbBack.material.opacity=w;
  const fp=ringPos(ja+1.1);lbForward.position.set(fp[0],5,fp[1]);lbForward.material.opacity=w;
  const p0=ringCars[0].g.position;const wb=pr(T,97.8,98.5)*(1-pr(T,101.2,101.8));lbBraker.position.set(p0.x,6.5,p0.z);lbBraker.material.opacity=wb;
  const pa=ringCars[AUTO].g.position;const wa=pr(T,106,106.8)*(1-pr(T,113,113.8));lbAuto.position.set(pa.x,6.5,pa.z);lbAuto.material.opacity=wa;}
 // B: flowing traffic, the wave passes you at ~123 s
 const zy=zYouB(T);const zw=zy-46+12*Math.max(0,T-119.2);
 for(const c of carsB){const z=c.z0-VB*Math.max(0,T-T0B);c.g.position.set(c.d,0,z);const rel=(z-zw)/7;setBrake(c,T>119.2?Math.exp(-rel*rel):0);c.g.visible=z<ZB0+2;}
 pinB.position.set(YOUB.d,0.9,zy);pinB.material.opacity=pr(T,114.5,115.5);pinB.visible=T>114.4;
 gapM.position.z=zy-6.4;gapM.material.opacity=pr(T,115.2,116)*(1-pr(T,120.6,121.4));lbGap.position.set(-6.4,2.4,zy-6.4);lbGap.material.opacity=gapM.material.opacity;
 const [p,l]=camAt(T);camera.position.set(...p);camera.lookAt(...l);R.render(S,camera);
 // HUD
 let mode=null;if(T<16.4)mode='timer';else if(T>=53&&T<101.8)mode='count';
 const sec=Math.min(2400,2392+Math.floor(pr(T,0,2.6)*8));const tm=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
 const key=mode+(mode==='timer'?tm+(T<9.8?'?':'0'):stopped);if(key!==hk){hk=key;if(mode==='timer')hudCard($('vms').getContext('2d'),'timer',[tm,sec>=2400],T<9.8?'？':'0');else if(mode)hudCard($('vms').getContext('2d'),'count',stopped);}
 $('vms').style.opacity=mode==='timer'?1-pr(T,15.6,16.4):(mode==='count'?pr(T,53,53.8)*(1-pr(T,101,101.8)):0);
 const ch=CHAP.find(c=>T>=c[0]&&T<c[1]);const chk=ch?ch[2]:'';if(chk!==ck){ck=chk;if(ch){const q=$('chap');q.querySelector('.ex').textContent=ch[2];q.querySelector('.t').textContent=ch[3];q.querySelector('.s').textContent=ch[4];}}
 $('chap').style.opacity=ch?pr(T,ch[0],ch[0]+0.6)*(1-pr(T,ch[1]-0.6,ch[1])):0;
 $('km').style.opacity=1-pr(T,15.6,16.4);const pp=0.04+0.92*eio(pr(T,3.4,7.6));$('km').querySelector('.fill').style.width=pp*100+'%';$('km').querySelector('.car').style.left=pp*100+'%';
 const card=(T>=25.2&&T<45.2)?1:((T>=105.8&&T<113.8)?2:0);if(card!==pk){pk=card;$('card').innerHTML=card===1?CARD1:(card===2?CARD2:'');}
 $('card').style.display=card?'block':'none';$('card').style.opacity=card===1?pr(T,25.2,25.8)*(1-pr(T,44.6,45.2)):(card===2?pr(T,105.8,106.4)*(1-pr(T,113.2,113.8)):0);
 const pa=pr(T,16.58,16.9)*(1-pr(T,20.4,21.0));$('plaque').style.opacity=pa;$('plaque').style.transform=`scale(${1.06-0.06*eo(pr(T,16.58,17.3))})`;
 $('end').style.opacity=pr(T,125.4,126.4);
 const L=LINES.find(x=>T>=x[0]&&T<x[1]);$('sub').innerHTML=L?'<span class="pill">'+L[2].replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';$('sub').style.opacity=T>125.4?0:1;};
const CARD1=`<div class="h">实验 · 2008 · 日本</div><div class="row"><span class="k">车</span><span class="v">22 辆</span></div><div class="row"><span class="k">跑道</span><span class="v">230 米</span></div><div class="row"><span class="k">车速</span><span class="v">≈30 km/h</span></div><div class="src">Sugiyama et al., New J. Phys. 2008</div>`;
const CARD2=`<div class="h">实验 · 2016 · 美国 · 22 辆车</div><div class="row"><span class="k">急刹车</span><span class="v">−74% 以上</span></div><div class="row"><span class="k">油耗</span><span class="v">−22% 以上</span></div><div class="src">Stern et al., Transp. Res. C 2018</div>`;
$('gauge').style.display='none';$('vms').style.display='block';$('km').style.display='block';$('chap').style.display='flex';$('title').style.display='none';
