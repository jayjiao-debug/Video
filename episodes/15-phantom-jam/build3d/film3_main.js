/* ===== 幽灵堵车 v3 · one take, four ideas (129.97 s = 64 bars of the Slowed BGM) ===== */
INK.on=false;
const DUR=129.97;
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),pr=(t,a,b)=>cl((t-a)/(b-a)),eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,eo=x=>1-Math.pow(1-x,3),sst=x=>x*x*(3-2*x);
const lerp=(a,b,f)=>a+(b-a)*f;
const BGC=0xE6E8E3;
const S=new THREE.Scene();S.background=new THREE.Color(BGC);S.fog=new THREE.Fog(BGC,120,430);
S.add(new THREE.HemisphereLight(0xffffff,0xe3e6df,2.35));{const d=new THREE.DirectionalLight(0xffffff,0.9);d.position.set(-20,40,25);S.add(d);}
function lay(m,y,order){m.position.y=y;m.renderOrder=order;m.material.polygonOffset=true;m.material.polygonOffsetFactor=-order;m.material.polygonOffsetUnits=-order*4;return m;}
// ---- ground: plain, flat, no pattern (owner v3: no dots)
{const m=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),new THREE.MeshBasicMaterial({color:BGC}));m.rotation.x=-Math.PI/2;m.position.set(0,0,-700);S.add(m);}
const mute=(hex,f=0.45)=>new THREE.Color(hex).lerp(new THREE.Color(BGC),f).getHex();
const shM=new THREE.MeshBasicMaterial({color:0x2a3a35,transparent:true,opacity:.10,depthWrite:false});
function strip(pts,w,col,y,order,shadow=true){const L=[],Rr=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;L.push([pts[i][0]-dz*w/2,pts[i][1]+dx*w/2]);Rr.push([pts[i][0]+dz*w/2,pts[i][1]-dx*w/2]);}
 const sh=new THREE.Shape();const all=L.concat(Rr.reverse());sh.moveTo(all[0][0],-all[0][1]);for(const p of all.slice(1))sh.lineTo(p[0],-p[1]);const geo=new THREE.ShapeGeometry(sh);
 const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col}));m.rotation.x=-Math.PI/2;lay(m,y,order);S.add(m);
 if(shadow){const s=new THREE.Mesh(geo,shM.clone());s.rotation.x=-Math.PI/2;lay(s,y-0.01,order-1);s.position.x=0.18;s.position.z=0.18;S.add(s);}
 for(const e of [pts[0],pts[pts.length-1]]){const c=new THREE.Mesh(new THREE.CircleGeometry(w/2,20),new THREE.MeshBasicMaterial({color:col}));c.rotation.x=-Math.PI/2;lay(c,y,order);c.position.x=e[0];c.position.z=e[1];S.add(c);}}
function smoothPts(pts,k=4){let p=pts;for(let n=0;n<k;n++){const q=[p[0]];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);}q.push(p[p.length-1]);p=q;}return p;}
const LANE=[[-1.95,0x3FAE49],[-0.65,0xF5B700],[0.65,0x2F7FD3],[1.95,0xF28C28]];
function dashGeo(list){const g=[];for(const [x,z,rot] of list){const b=new THREE.PlaneGeometry(0.08,1.6);b.rotateX(-Math.PI/2);if(rot)b.rotateY(-rot);b.translate(x,0,z);g.push(b);}const m=new THREE.Mesh(mergeGeometries(g),new THREE.MeshBasicMaterial({color:0xffffff}));lay(m,0.1,8);S.add(m);}
function straightRoad(z0,z1){LANE.forEach(([d,c])=>strip([[d,z0],[d,z1]],0.55,c,0.08,6));const l=[];for(const d of [-1.3,0,1.3])for(let z=z0;z>z1;z-=4)l.push([d,z,0]);dashGeo(l);}
// ---- motorway A: straight, then bends right out of frame
const RB=34,ZB=-236;
function pathA(s,d){const L1=40-ZB;if(s<=L1)return [d,40-s,0];const arc=(Math.PI/2)*RB;if(s<=L1+arc){const th=(s-L1)/RB;const r=RB-d;return [RB-Math.cos(th)*r,ZB-Math.sin(th)*r,th];}const u=s-L1-arc;return [RB+u,ZB-RB+d,Math.PI/2];}
const LEN_A=40-ZB+(Math.PI/2)*RB+700;
LANE.forEach(([d,c])=>{const p=[];for(let s=0;s<=LEN_A;s+=2){const q=pathA(s,d);p.push([q[0],q[1]]);}strip(p,0.55,c,0.08,6);});
{const l=[];for(const d of [-1.3,0,1.3])for(let s=0;s<LEN_A;s+=4){const q=pathA(s,d);l.push([q[0],q[1],q[2]]);}dashGeo(l);}
// ---- the rings and motorways B (next-lane) and C (finale)
const R1={x:0,z:-330,R:230/(2*Math.PI),L:230},R2={x:0,z:-660,R:260/(2*Math.PI),L:260};
for(const rg of [R1,R2]){const r=new THREE.Mesh(new THREE.RingGeometry(rg.R-0.7,rg.R+0.7,256),new THREE.MeshBasicMaterial({color:0xE8413C}));r.rotation.x=-Math.PI/2;lay(r,0.08,6);r.position.x=rg.x;r.position.z=rg.z;S.add(r);
 const s=new THREE.Mesh(new THREE.RingGeometry(rg.R-0.5,rg.R+1.1,256),shM.clone());s.rotation.x=-Math.PI/2;lay(s,0.07,5);s.position.x=rg.x+0.2;s.position.z=rg.z+0.2;S.add(s);}
const ZB0=-400,ZB1=-600,ZC0=-730,ZC1=-1500;straightRoad(ZB0,ZB1);straightRoad(ZC0,ZC1);
// ---- muted accent curves and small props (kept clear of every road)
const ACC=[[[[-80,20],[-20,18],[-11,6],[-11,-120],[-40,-150],[-120,-152]],0x8E5CA8],[[[-60,-250],[-36,-262],[-30,-300],[-56,-330],[-58,-380],[-30,-396],[-8,-396]],0x00A6B4],
 [[[90,-300],[60,-318],[50,-350],[60,-390],[110,-420]],0x3FAE49],[[[-90,-450],[-30,-452],[-14,-470],[-14,-590],[-60,-640],[-70,-700],[-30,-724],[-8,-724]],0xF28C28],
 [[[80,-610],[60,-640],[60,-690],[90,-720]],0x8E5CA8],[[[-110,-850],[-40,-852],[-14,-870],[-14,-1000]],0x00A6B4],[[[70,-900],[16,-920],[12,-980],[40,-1060]],0x3FAE49]];
const accPts=ACC.map(([p,c])=>{const sp=smoothPts(p);strip(sp,0.5,mute(c,0.42),0.06,4);return sp;});
function clear(x,z,m){const roadX=(lo,hi)=>z<lo&&z>hi&&Math.abs(x)<6+m;if(roadX(44,ZB-10)||roadX(ZB0+6,ZB1-6)||roadX(ZC0+6,ZC1-6))return false;
 if(z<ZB+4&&z>ZB-RB-8&&x>-2){const rr=Math.hypot(x-RB,z-ZB);if((rr<RB+5+m&&rr>RB-5-m)||(z<ZB-RB+6&&x>RB-2))return false;}
 for(const rg of [R1,R2]){const rr=Math.hypot(x-rg.x,z-rg.z);if(rr>rg.R-4-m&&rr<rg.R+(rg===R1?14:4)+m)return false;}
 for(const pts of accPts)for(const p of pts)if(Math.hypot(p[0]-x,p[1]-z)<2.2+m)return false;return true;}
let sp=17;const prn=()=>{sp=(sp*16807)%2147483647;return sp/2147483647;};
const tops=[],trunks=[],lamps=[],tshadow=[];
function addTree(x,z,s){if(!clear(x,z,1.2*s))return;const t=new THREE.CylinderGeometry(0.1*s,0.13*s,0.7*s,6);t.translate(x,0.35*s,z);trunks.push(t);const c=new THREE.IcosahedronGeometry(0.75*s,0);c.translate(x,1.1*s,z);tops.push(c);const g=new THREE.CircleGeometry(0.8*s,14);g.rotateX(-Math.PI/2);g.translate(x+0.25,0,z+0.25);tshadow.push(g);}
for(let k=0;k<700;k++)addTree((prn()-0.5)*220,40-prn()*1500,0.6+prn()*0.6);
for(const rg of [R1,R2])for(let k=0;k<10;k++){const a=prn()*Math.PI*2,r=prn()*(rg.R-9);addTree(rg.x+Math.sin(a)*r,rg.z+Math.cos(a)*r,0.8+prn()*0.4);}
const lampRow=(z0,z1)=>{for(let z=z0;z>z1;z-=36)for(const x of [-3.6,3.6]){const p=new THREE.CylinderGeometry(0.06,0.08,3.0,8);p.translate(x,1.5,z);lamps.push(p);const h=new THREE.BoxGeometry(0.6,0.1,0.2);h.translate(x+(x<0?0.26:-0.26),3.0,z);lamps.push(h);}};
lampRow(30,ZB);lampRow(ZB0-10,ZB1);lampRow(ZC0-10,ZC1);
S.add(new THREE.Mesh(mergeGeometries(tops),new THREE.MeshLambertMaterial({color:0xBFD3B2,flatShading:true})));S.add(new THREE.Mesh(mergeGeometries(trunks),new THREE.MeshLambertMaterial({color:0xC9BBA8})));
S.add(new THREE.Mesh(mergeGeometries(lamps),new THREE.MeshLambertMaterial({color:0xD3D7D1})));{const m=new THREE.Mesh(mergeGeometries(tshadow),shM.clone());lay(m,0.05,3);S.add(m);}
// ---- cars
const PAL=[0x3FAE49,0x2F7FD3,0xF28C28,0x8E5CA8,0x00A6B4,0xE8413C,0xFFFFFF];
let sd2=5;const rr2=()=>{sd2=(sd2*16807)%2147483647;return sd2/2147483647;};
const glowT=ctex(64,64,(q)=>{const r=q.createLinearGradient(0,0,0,64);r.addColorStop(0,'rgba(255,60,40,.6)');r.addColorStop(1,'rgba(255,60,40,0)');q.fillStyle=r;q.fillRect(0,0,64,64);});
const haloT=ctex(128,128,(q)=>{const r=q.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(232,65,60,.55)');r.addColorStop(1,'rgba(232,65,60,0)');q.fillStyle=r;q.fillRect(0,0,128,128);});
function mkCar(col){const g=carB(col,'drive');const tails=[];g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x7a2018)tails.push(o);});
 g.traverse(o=>{if(o.isMesh&&o.material&&o.material.transparent)o.renderOrder=9;});
 const p=new THREE.PlaneGeometry(0.9,0.6);p.rotateX(-Math.PI/2);const gm=new THREE.MeshBasicMaterial({map:glowT,transparent:true,depthWrite:false});const glow=new THREE.Mesh(p,gm);glow.position.set(0,0.13,1.3);glow.renderOrder=9;g.add(glow);
 const body=[];g.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshLambertMaterial)body.push(o);});return {g,tm:tails.length?tails[0].material:null,gm,body};}
const BON=new THREE.Color(0xFF3020),BOFF=new THREE.Color(0x7a2018);
function setBrake(c,f){if(c.tm)c.tm.color.copy(BOFF).lerp(BON,f);c.gm.opacity=f;}
// A: the queue
const carsA=[];const GAP=2.85,FRONT_S=40+174,NPL=70;
LANE.forEach(([d],li)=>{for(let i=0;i<NPL;i++){const s0=FRONT_S-(li%2)*0.9-i*GAP;const you=li===1&&i===50;const k=mkCar(you?0xEAA800:PAL[Math.floor(rr2()*PAL.length)]);S.add(k.g);carsA.push({...k,li,i,s0,d,you});}});
const YOU=carsA.find(c=>c.you);for(const c of carsA)c.gm.visible=false; // v3.5: flat brake-glow quads shimmered at the low opening angle
function placeOnA(c,s){const q=pathA(s,c.d);c.g.position.set(q[0],0,q[1]);c.g.rotation.y=-q[2];c.g.visible=s<LEN_A-20;}
const pinA=pinSprite();S.add(pinA);
const qT=ctex(512,512,(g)=>{g.fillStyle='#34495E';g.beginPath();g.arc(256,256,240,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(256,256,192,0,7);g.fill();g.fillStyle='#34495E';g.font='900 128px "Noto Sans CJK SC"';g.textAlign='center';g.textBaseline='middle';g.fillText('队头',256,232);g.font='700 46px "Noto Sans CJK SC"';g.fillText('K 1.6',256,334);});
const QZ=-176.5;const qS=new THREE.Sprite(new THREE.SpriteMaterial({map:qT,transparent:true}));qS.scale.set(3.0,3.0,1);qS.position.set(0,4.2,QZ);S.add(qS);
const qParts=[qS];{const st=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.6,8),new THREE.MeshLambertMaterial({color:0x34495E,transparent:true}));st.position.set(0,1.3,QZ);S.add(st);qParts.push(st);const rg=new THREE.Mesh(new THREE.RingGeometry(3.2,3.45,72),new THREE.MeshBasicMaterial({color:0x34495E,transparent:true}));qParts.push(rg);rg.rotation.x=-Math.PI/2;lay(rg,0.12,9);rg.position.z=QZ;S.add(rg);}
function infoCard(g,W,H,title,rows){g.clearRect(0,0,W,H);g.fillStyle='#FFFFFF';rr(g,8,8,W-16,H-16,46);g.fill();g.lineWidth=8;g.strokeStyle='#34495E';rr(g,8,8,W-16,H-16,46);g.stroke();
 g.fillStyle='#1D7A4C';rr(g,8,8,W-16,140,46);g.fill();g.fillRect(8,100,W-16,48);g.fillStyle='#fff';g.font='900 90px "Noto Sans CJK SC"';g.textAlign='center';g.fillText(title,W/2,112);
 rows.forEach((r,i)=>{if(!r)return;const y=262+i*112;g.textAlign='left';g.fillStyle='#34495E';g.font='900 84px "Noto Sans CJK SC"';g.fillText(r[0],80,y);g.textAlign='right';g.fillStyle=r[1]==='无'?'#E8413C':'#8A949C';g.fillText(r[1],W-80,y);g.strokeStyle='#D9DDD8';g.lineWidth=4;g.beginPath();g.moveTo(80,y+32);g.lineTo(W-80,y+32);g.stroke();});}
const vbT=ctex(960,600,()=>{});const vb=new THREE.Group();
{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,4.4,12),new THREE.MeshLambertMaterial({color:0xC5CAC4}));p.position.set(0,2.2,-0.4);vb.add(p);const box=new THREE.Mesh(new RoundedBoxGeometry(7.4,4.7,0.34,3,0.28),new THREE.MeshLambertMaterial({color:0xD3D8D2}));box.position.set(0,6.4,-0.14);vb.add(box);
 const f=new THREE.Mesh(new THREE.PlaneGeometry(7.0,4.375),new THREE.MeshBasicMaterial({map:vbT}));f.position.set(0,6.4,0.05);vb.add(f);}
vb.position.set(9.5,0,-194);vb.rotation.y=-0.42;S.add(vb);
let vbKey='';function drawVB(T){const it=[['车祸',8.0],['施工',8.7],['收费站',9.4]];const rows=it.map(([n,t0])=>T<t0?null:[n,T>=t0+0.4?'无':'？']);const k=JSON.stringify(rows);if(k===vbKey)return;vbKey=k;infoCard(vbT.image.getContext('2d'),960,600,'前方情况',rows);vbT.needsUpdate=true;}
// ---- ring helper: time-warped OV simulation, cars, halos
function mkRing(rg,o){const SIMT=[];let acc=0;for(let i=0;i<=Math.ceil(DUR*60);i++){SIMT.push(acc);acc+=o.rate(i/60)/60;}
 const simAt=t=>{const k=cl(t*60,0,SIMT.length-1);const i=Math.floor(k);return SIMT[i]+(SIMT[Math.min(i+1,SIMT.length-1)]-SIMT[i])*(k-i);};
 const KICK=simAt(o.kick);const sim=ringSim2({N:22,L:rg.L,T:Math.ceil(simAt(DUR))+2,dt:0.02,every:2,hs:5.8,hmin:5.0,kick:{i:0,t0:KICK,t1:KICK+2.0,dec:3.0}});
 const OFF=o.kickAngle-(sim.frames[Math.round(KICK/sim.dt)].x[0]/rg.L)*2*Math.PI;
 const state=t=>{const s=simAt(t);const k=Math.min(sim.frames.length-2,s/sim.dt);const i=Math.floor(k),f=k-i;const A=sim.frames[i],B=sim.frames[i+1];const x=[],v=[];for(let j=0;j<22;j++){x.push(A.x[j]+(B.x[j]-A.x[j])*f);v.push(A.v[j]+(B.v[j]-A.v[j])*f);}return {x,v};};
 const ang=x=>x/rg.L*2*Math.PI+OFF,pos=a=>[rg.x+Math.sin(a)*rg.R,rg.z-Math.cos(a)*rg.R];
 const cars=[],halos=[];for(let j=0;j<22;j++){const k=mkCar(j===0?0xE8413C:PAL[(j*2+1)%6]);k.g.scale.setScalar(2.4);S.add(k.g);cars.push(k);const h=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:haloT,transparent:true,depthWrite:false,opacity:0}));h.rotation.x=-Math.PI/2;lay(h,0.11,9);S.add(h);halos.push(h);}
 const jam=st=>{let sx=0,sy=0,n=0;for(let j=0;j<22;j++){const w=cl((3-st.v[j])/3);if(w<=0)continue;const a=ang(st.x[j]);sx+=Math.sin(a)*w;sy+=Math.cos(a)*w;n+=w;}return n>0.3?Math.atan2(sx,sy):null;};
 const JA=[];{let prev=null;for(let i=0;i<=Math.ceil(DUR*4);i++){const t=i/4;const a=t<o.kick+1?null:jam(state(t));let v=a===null?(prev===null?o.kickAngle:prev):a;if(prev!==null){while(v-prev>Math.PI)v-=2*Math.PI;while(v-prev<-Math.PI)v+=2*Math.PI;}JA.push(v);prev=v;}
  const sm=JA.map((_,i)=>{let s=0,n=0;for(let k=-12;k<=12;k++){s+=JA[cl(i+k,0,JA.length-1)];n++;}return s/n;});for(let i=0;i<JA.length;i++)JA[i]=sm[i];}
 const jaAt=t=>{const k=cl(t*4,0,JA.length-1);const i=Math.floor(k);return JA[i]+((JA[Math.min(i+1,JA.length-1)])-JA[i])*(k-i);};
 return {rg,state,ang,pos,cars,halos,jaAt,simAt};}
function updateRing(r,T,t0,blendWin,auto){const st=r.state(T);if(r.mod)r.mod(st,T);const b=blendWin?sst(pr(T,blendWin[0],blendWin[1])):0;let mean=0;for(let j=0;j<22;j++)mean+=st.x[j]-j*r.rg.L/22;mean/=22;let stopped=0;
 for(let j=0;j<22;j++){const x=lerp(st.x[j],mean+j*r.rg.L/22,b);const a=r.ang(x);const p=r.pos(a);const c=r.cars[j];c.g.position.set(p[0],0,p[1]);c.g.rotation.y=-a-Math.PI/2;
  let bf=T<t0?0:cl((3-st.v[j])/2.5)*(1-b);if(r.kickLight&&j===0)bf=Math.max(bf,pr(T,r.kickLight[0],r.kickLight[0]+0.15)*(1-pr(T,r.kickLight[1],r.kickLight[1]+0.6)));setBrake(c,bf);r.halos[j].position.x=p[0];r.halos[j].position.z=p[1];r.halos[j].material.opacity=bf;if(st.v[j]<1.5&&b<0.5&&T>t0)stopped++;}return stopped;}
const FRZ=[32.9,36.0],FF=[49.1,52.6];
const rate1=t=>{if(t<14)return 0;let r=1.8;if(t>FRZ[0])r=lerp(1.8,0.05,sst(pr(t,FRZ[0],FRZ[0]+0.4)));if(t>FRZ[1])r=lerp(0.05,1.8,sst(pr(t,FRZ[1],FRZ[1]+0.7)));if(t>44)r=lerp(1.8,1.0,sst(pr(t,44,46)));
 if(t>FF[0]-0.5)r=lerp(1.0,3.0,sst(pr(t,FF[0]-0.5,FF[0]+0.3)));if(t>FF[1]-0.4)r=lerp(3.0,1.3,sst(pr(t,FF[1]-0.4,FF[1]+0.6)));if(t>56)r=lerp(1.3,1.6,sst(pr(t,56,58)));return r;};
const RING1=mkRing(R1,{rate:rate1,kick:32.6,kickAngle:-Math.PI/2});RING1.kickLight=[32.6,36.6];
const RING2=mkRing(R2,{rate:t=>t<70?0:1.6,kick:72,kickAngle:-Math.PI/2});RING2.kickLight=[72,73.3];
const AUTO=9;const autoRing=new THREE.Mesh(new THREE.RingGeometry(1.25,1.4,48),new THREE.MeshBasicMaterial({color:0x2FB3A8,transparent:true,opacity:0}));autoRing.rotation.x=-Math.PI/2;autoRing.position.y=0.15;autoRing.renderOrder=9;RING2.cars[AUTO].g.add(autoRing);
const autoDome=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,0.1,20),new THREE.MeshBasicMaterial({color:0x2FB3A8}));autoDome.position.set(0,0.7,-0.07);autoDome.visible=false;RING2.cars[AUTO].g.add(autoDome);
// ---- 01: chain reaction — the order in which cars stop after the one brake (deterministic, safe for chunked rendering)
const angOf=(rg,p)=>Math.atan2(p.x-rg.x,-(p.z-rg.z));const camAz=a=>Math.PI-a;
const FIRST=new Array(22).fill(null);for(let t=32.6;t<46;t+=0.05){const st=RING1.state(t);for(let j=1;j<22;j++)if(FIRST[j]===null&&st.v[j]<1.5)FIRST[j]=t;}
const ORDER=[];for(let j=1;j<22;j++)if(FIRST[j]!==null)ORDER.push(j);ORDER.sort((a,b)=>FIRST[a]-FIRST[b]);
const chainN=T=>{let n=0;for(const j of ORDER)if(FIRST[j]<=T)n++;return n;};
const BADGES=ORDER.map((j,k)=>{const t=ctex(128,128,g=>{g.fillStyle='#E8413C';g.beginPath();g.arc(64,64,60,0,7);g.fill();g.fillStyle='#fff';g.font=`900 ${k+1<10?84:66}px "Noto Sans CJK SC"`;g.textAlign='center';g.textBaseline='middle';g.fillText(String(k+1),64,70);});
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,opacity:0}));s.renderOrder=11;S.add(s);return {j,t0:FIRST[j],s};});
// ---- 02: "you" in the ring = the car whose stop best spans the fast-forward window
let YR=12;{let bd=1e9;for(let j=1;j<22;j++){let s0=null,s1=null;for(let t=46;t<57;t+=0.05){const v=RING1.state(t).v[j];if(s0===null){if(v<1.0)s0=t;}else if(v>1.0){s1=t;break;}}
 if(s0!==null&&s1!==null){const d=Math.abs(s0-48.6)+Math.abs(s1-52.6);if(d<bd){bd=d;YR=j;}}}}
window.DBG={YR,FIRST,ORDER};
for(const k of [0,2])RING1.cars[YR].g.children[k].material.color.set(0xEAA800);
const pinR=pinSprite();pinR.scale.set(3.4,4.24,1);S.add(pinR);
const A0F=RING1.ang(RING1.state(36.4).x[0]),AY55=RING1.ang(RING1.state(55).x[YR]);
// ---- 02: a stadium crowd around ring 1 doing the wave, locked to the jam (nobody leaves their seat)
const SPEC=[];{const rows=[R1.R+8.5,R1.R+10.2];rows.forEach((rad,ri)=>{const n=Math.round(2*Math.PI*rad/1.55);for(let k=0;k<n;k++)SPEC.push({a:(k+ri*0.5)/n*2*Math.PI,rad,c:mute(PAL[(k*7+ri*3)%6],0.30)});});}
const sBody=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2,0.24,0.62,8).translate(0,0.31,0),new THREE.MeshLambertMaterial(),SPEC.length);
const sHead=new THREE.InstancedMesh(new THREE.SphereGeometry(0.17,12,8).translate(0,0.8,0),new THREE.MeshLambertMaterial({color:0xE9D3BE}),SPEC.length);
const armG=mergeGeometries([new THREE.CylinderGeometry(0.05,0.05,0.5,6).translate(0,0.25,0).rotateZ(0.35).translate(-0.2,0,0),new THREE.CylinderGeometry(0.05,0.05,0.5,6).translate(0,0.25,0).rotateZ(-0.35).translate(0.2,0,0)]);
const sArm=new THREE.InstancedMesh(armG,new THREE.MeshLambertMaterial(),SPEC.length);
SPEC.forEach((p,k)=>{const c=new THREE.Color(p.c);sBody.setColorAt(k,c);sArm.setColorAt(k,c);});
for(const m of [sBody,sHead,sArm]){m.frustumCulled=false;m.visible=false;S.add(m);}
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_s=new THREE.Vector3(),_p=new THREE.Vector3(),_e=new THREE.Euler();
function updSpec(T){const vis=T>56.4&&T<66;for(const m of [sBody,sHead,sArm])m.visible=vis;if(!vis)return;const g=eo(pr(T,56.4,57.6))*(1-sst(pr(T,64.6,65.8)));const ja=RING1.jaAt(T);const on=pr(T,57.0,57.8);
 SPEC.forEach((p,k)=>{let d=p.a-ja;d=Math.atan2(Math.sin(d),Math.cos(d));const r=Math.exp(-((d/0.17)**2))*on;const x=R1.x+Math.sin(p.a)*p.rad,z=R1.z-Math.cos(p.a)*p.rad;const FS=Math.max(1e-4,2.0*g);
  _e.set(0,-p.a,0);_q.setFromEuler(_e);_p.set(x,0.45*r*FS,z);_s.set(FS,FS,FS);_m.compose(_p,_q,_s);sBody.setMatrixAt(k,_m);sHead.setMatrixAt(k,_m);
  const ar=Math.max(1e-4,cl(r*1.4)*FS);_p.set(x,(0.45*r+0.55)*FS,z);_s.set(ar,ar,ar);_m.compose(_p,_q,_s);sArm.setMatrixAt(k,_m);});
 for(const m of [sBody,sHead,sArm])m.instanceMatrix.needsUpdate=true;}
// ---- 04: the automated car hangs back (smoothed speed), its followers can never overlap it
RING2.mod=(st,T)=>{const w=sst(pr(T,89.8,91.8));if(w<=0)return;const ld=AUTO+1,n=9,dw=0.4;let s=0;for(let k=0;k<n;k++)s+=RING2.state(T-k*dw).x[ld];
 const vb=(st.x[ld]-RING2.state(T-(n-1)*dw).x[ld])/((n-1)*dw);const tgt=s/n+vb*(n-1)*dw/2-14;st.x[AUTO]=Math.min(lerp(st.x[AUTO],tgt,w),st.x[ld]-5.0);st.v[AUTO]=lerp(st.v[AUTO],cl(vb,0,11.1),w);
 const L=RING2.rg.L;for(let q=1;q<22;q++){const j=(AUTO-q+22)%22,l=(j+1)%22;const xl=st.x[l]+(l<j?L:0);if(st.x[j]>xl-5.0){st.x[j]=xl-5.0;st.v[j]=Math.min(st.v[j],st.v[l]);}}};
// ---- "gap" zones (teal = room you leave), same look in 04 and 05
const zoneMat=()=>new THREE.MeshBasicMaterial({color:0x2FB3A8,transparent:true,opacity:0,depthWrite:false});
const zoneR=new THREE.Mesh(new THREE.BufferGeometry(),zoneMat());zoneR.rotation.x=-Math.PI/2;lay(zoneR,0.13,10);zoneR.position.x=R2.x;zoneR.position.z=R2.z;S.add(zoneR);
const zoneC=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1),zoneMat());zoneC.rotation.x=-Math.PI/2;lay(zoneC,0.13,10);zoneC.position.x=LANE[1][0];S.add(zoneC);
let zrMid=[0,0];function updZoneR(op){zoneR.visible=op>0;zoneR.material.opacity=op*0.75;if(op<=0)return;const aA=angOf(R2,RING2.cars[AUTO].g.position);let aL=angOf(R2,RING2.cars[AUTO+1].g.position);while(aL<aA)aL+=2*Math.PI;
 const dl=2.7/R2.R,len=(aL-aA)-2*dl;if(len<0.01){zoneR.visible=false;return;}zoneR.geometry.dispose();zoneR.geometry=new THREE.RingGeometry(R2.R-2.1,R2.R+2.1,32,1,Math.PI/2-(aL-dl),len);const am=(aA+aL)/2;zrMid=[R2.x+Math.sin(am)*R2.R,R2.z-Math.cos(am)*R2.R];}
const lab=(txt,rg,s)=>{const t=ctex(1024,256,(c)=>{c.fillStyle='#34495E';c.font='900 150px "Noto Sans CJK SC"';c.textAlign='center';c.fillText(txt,512,180);});const m=new THREE.Mesh(new THREE.PlaneGeometry(22*s,5.5*s),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthWrite:false}));m.rotation.x=-Math.PI/2;lay(m,0.12,9);m.position.x=rg.x;m.position.z=rg.z;S.add(m);return m;};
const lab230=lab('230 米',R1,1),lab260=lab('260 米 · 美国',R2,1.1);
// ---- motorway B: stop-and-go waves in every lane, your lane and the next lane out of phase
const VBb=6.0,AMP=0.6,LAM=60,TAU=8;const PH=[1.2,0,Math.PI,2.1];
const vField=(z,t,li)=>VBb*(1+AMP*Math.sin(2*Math.PI*(-z)/LAM+2*Math.PI*t/TAU+PH[li]));
const carsB=[];const TB0=60;
LANE.forEach(([d],li)=>{for(let i=0;i<34;i++){const you=li===1&&i===10;const k=mkCar(you?0xEAA800:(li===2?[0x2F7FD3,0x00A6B4,0x8E5CA8][i%3]:PAL[Math.floor(rr2()*PAL.length)]));S.add(k.g);carsB.push({...k,d,li,i,you,z0:ZB0+96-i*10-(li%2)*4});}});
// integrate positions once (60 Hz) so ordering is kept and speeds stay smooth
const BH=[];{const zs=carsB.map(c=>c.z0);for(let n=0;n<=Math.ceil((DUR-TB0)*60);n++){BH.push(Float32Array.from(zs));const t=TB0+n/60;for(let k=0;k<zs.length;k++){zs[k]-=vField(zs[k],t,carsB[k].li)/60;}}}
const bAt=(t,k)=>{const n=cl((t-TB0)*60,0,BH.length-1);const i=Math.floor(n),f=n-i;return BH[i][k]+(BH[Math.min(i+1,BH.length-1)][k]-BH[i][k])*f;};
const YB=carsB.findIndex(c=>c.you);const pinB=pinSprite();S.add(pinB);
// ---- motorway C: flowing traffic, you keep a gap, a soft brake wave passes you
const VC=7.0,TC0=96;const carsC=[];
LANE.forEach(([d],li)=>{const gap=li===1?11:8.6;for(let i=0;i<30;i++){const you=li===1&&i===4;const k=mkCar(you?0xEAA800:PAL[Math.floor(rr2()*PAL.length)]);S.add(k.g);carsC.push({...k,d,li,i,you,z0:ZC0-6-i*gap-(li%2)*3.1-(li===1&&i>4?6:0)});}});
const YC=carsC.find(c=>c.you);const AHC=carsC.find(c=>c.li===1&&c.i===5);const pinC=pinSprite();S.add(pinC);
const bumpA=T=>Math.sin(Math.PI*pr(T,114.0,117.4))**2,bumpY=T=>Math.sin(Math.PI*pr(T,114.6,117.8))**2;
const zYC=t=>YC.z0-VC*Math.max(0,t-TC0)+1.6*bumpY(t);
// ---- soft blob car shadows above the lane lines (v3.5: hard-edged slivers shimmered in the low opening shot)
{const st=ctex(128,256,(g)=>{g.clearRect(0,0,128,256);g.filter='blur(13px)';g.fillStyle='#fff';rr(g,26,26,76,204,32);g.fill();});shMat.map=st;shMat.opacity=0.30;shMat.needsUpdate=true;
 S.traverse(o=>{if(o.isMesh&&o.material===shMat){const sc=(o.parent&&o.parent.scale.y)||1;o.position.y=0.12/sc;o.scale.set(1.35,1,1.18);o.renderOrder=8;}});}
// ---- HTML pill labels projected from 3D (kept out of the subtitle band)
const LBS=[];function pill(txt,col,px=40){const d=document.createElement('div');d.textContent=txt;d.style.cssText=`position:absolute;left:0;top:0;transform:translate(-50%,-100%);white-space:nowrap;font-family:'Noto Sans CJK SC';font-weight:900;font-size:${px}px;color:${col};background:rgba(255,255,255,.92);padding:6px 22px 8px;border-radius:999px;box-shadow:0 6px 18px rgba(30,40,50,.12);opacity:0;pointer-events:none`;document.body.insertBefore(d,document.getElementById('sub'));const o={p:new THREE.Vector3(),a:0,el:d};LBS.push(o);return o;}
const L_slow=pill('就是这一脚刹车','#D7362F',46),L_back=pill('堵车：还在，往后挪','#D7362F',44);
const L_wave=pill('人浪','#7B4FA0',48),L_jam=pill('堵车：也这样往后传','#D7362F',44);
const L_next=pill('隔壁车道','#2F6FC0',42),L_auto=pill('自动驾驶','#1F8F86',44),L_spc=pill('空当','#1F8F86',44),L_gap=pill('多留的车距','#1F8F86',44);
/* ---- camera ---- */
function hermK(K,T,idx){let i=0;while(i<K.length-2&&T>K[i+1][0])i++;const t0=K[i][0],t1=K[i+1][0];const u=cl((T-t0)/(t1-t0));const P=j=>K[cl(j,0,K.length-1)][idx],Tt=j=>K[cl(j,0,K.length-1)][0];const out=[];
 for(let c=0;c<P(0).length;c++){const m=j=>{if(j<=0||j>=K.length-1)return 0;return (P(j+1)[c]-P(j-1)[c])/(Tt(j+1)-Tt(j-1));};const h00=2*u**3-3*u**2+1,h10=u**3-2*u**2+u,h01=-2*u**3+3*u**2,h11=u**3-u**2,d=t1-t0;out.push(P(i)[c]*h00+m(i)*h10*d+P(i+1)[c]*h01+m(i+1)*h11*d);}return out;}
const yz=pathA(YOU.s0,YOU.d)[1];
const KA=[[0,[-1.25,1.7,yz+16],[-0.6,1.0,yz]],[2.6,[-1.25,1.9,yz+6],[-0.6,0.8,yz-6]],[4.4,[-2.6,7,yz-4],[0,0.4,yz-26]],[7.4,[-4.5,17,-138],[2.5,0,-184]],[11.0,[-5.5,19,-148],[4,0,-192]],
 [14.0,[-3,24,-178],[1.5,0,-208]],[17.5,[-2,44,-206],[0,0,-258]],[21.0,[-6,58,-236],[0,0,-318]],[24,[-8,62,-250],[0,0,-326]]];
const shotA=T=>[hermK(KA,T,1),hermK(KA,T,2)];
function polar(ring,K,T,follow){const [az0,d,h,ls,push=0]=hermK(K,T,1);let az=az0,look=[ring.rg.x,0,ring.rg.z];
 if(follow){const w=sst(pr(T,follow[0],follow[0]+4))*(1-sst(pr(T,follow[1]-4,follow[1])));az=az0+0.5*w*(ring.jaAt(T)-ring.jaAt(follow[0]));const jp=ring.pos(ring.jaAt(T));look=[lerp(ring.rg.x,jp[0],ls*w),0,lerp(ring.rg.z,jp[1],ls*w)];}
 if(ls>0&&(!follow||T<follow[0])){const p0=ring.cars[0].g.position;look=[lerp(ring.rg.x,p0.x,ls),0,lerp(ring.rg.z,p0.z,ls)];}
 const cam=[ring.rg.x+Math.sin(az)*d,h,ring.rg.z+Math.cos(az)*d];if(push){const dx=look[0]-cam[0],dz=look[2]-cam[2],l=Math.hypot(dx,dz)||1;look=[look[0]+dx/l*push,look[1],look[2]+dz/l*push];}return [cam,look];}
const KR1=[[19,[0.0,95,60,0,0]],[26,[-0.4,80,46,0,0]],[32.6,[-0.85,58,24,0.5,0]]];
const KR2=[[82,[0.0,100,62,0,0]],[88,[-0.35,82,46,0,0]],[93.8,[-0.6,70,36,0.35,0]],[98,[-0.5,78,44,0.2,0]],[103,[-0.1,96,60,0,0]]];
const shotR1=T=>polar(RING1,KR1,T,null);const shotR2=T=>{const r=polar(RING2,KR2,T,null);if(T>88){const pa=RING2.cars[AUTO].g.position;const w=sst(pr(T,88,92))*(1-sst(pr(T,99,102)));r[1]=[lerp(r[1][0],pa.x,0.35*w),0,lerp(r[1][2],pa.z,0.35*w)];}return r;};
// 01 bullet time: slow orbit round the braking car (one direction: from behind it, round the outside, to its front)
function orbit0(T){const p=RING1.cars[0].g.position;const a=angOf(R1,p);const fx=Math.cos(a),fz=Math.sin(a),nx=Math.sin(a),nz=-Math.cos(a);const u=sst(pr(T,33.4,36.3));const ps=lerp(0.45,2.05,u),rad=lerp(17,14.5,u),h=lerp(7.5,6.4,u);
 const ox=Math.cos(ps)*(-fx)+Math.sin(ps)*nx,oz=Math.cos(ps)*(-fz)+Math.sin(ps)*nz;return [[p.x+rad*ox,h,p.z+rad*oz],[p.x+rad*ox*0.08,0.9,p.z+rad*oz*0.08]];}
const KO=[[36.3,[camAz(A0F+0.25),66,44,0.3,-6]],[39.0,[camAz(A0F+0.45),86,64,0,-4]],[44.9,[camAz(A0F+0.75),80,60,0,-4]]];const shotO=T=>polar(RING1,KO,T,null);
// 02 chase cam behind "you"; rises while you wait in the jam
function chase(T){let sx=0,sz=0;for(let k=0;k<10;k++){const q=RING1.pos(RING1.ang(RING1.state(T-k*0.07).x[YR]));sx+=q[0];sz+=q[1];}const c={x:sx/10,z:sz/10};const a=angOf(R1,c);const fx=Math.cos(a),fz=Math.sin(a),nx=Math.sin(a),nz=-Math.cos(a);const up=sst(pr(T,49.0,51.0))*(1-sst(pr(T,52.4,54)));const back=lerp(13,18,up),h=lerp(5.2,9.5,up),side=lerp(2.5,3.5,up);
 return [[c.x-fx*back+nx*side,h,c.z-fz*back+nz*side],[c.x+fx*10,0.8,c.z+fz*10]];}
// 02 you drive off, the jam stays: high view between the two, then (polar, never through the ring) down to the crowd
const JA55=RING1.jaAt(55),JA57=RING1.jaAt(57),dYJ=Math.atan2(Math.sin(AY55-JA55),Math.cos(AY55-JA55));const AZM=camAz(JA55+dYJ*0.5);
let AZW0=camAz(JA57)+0.15;while(AZW0-AZM>Math.PI)AZW0-=2*Math.PI;while(AZW0-AZM<-Math.PI)AZW0+=2*Math.PI;const azW=T=>AZW0-0.7*(RING1.jaAt(T)-JA57);
const KO2=[[53,[AZM,74,54,0,-10]],[57.2,[AZW0,64,24,0,0]]];
function shotO2(T){const [az,d,h]=hermK(KO2,T,1);const u=sst(pr(T,55,57.2));const cam=[R1.x+Math.sin(az)*d,h,R1.z+Math.cos(az)*d];const ja=RING1.jaAt(T);const wl=[R1.x+Math.sin(ja)*(R1.R+4),0,R1.z-Math.cos(ja)*(R1.R+4)];
 const dx=R1.x-cam[0],dz=R1.z-cam[2],l=Math.hypot(dx,dz);const cl0=[R1.x-dx/l*10,0,R1.z-dz/l*10];return [cam,[lerp(cl0[0],wl[0],u),0,lerp(cl0[2],wl[2],u)]];}
// 02 the wave: camera outside the crowd, drifting with the jam
function waveShot(T){const ja=RING1.jaAt(T);const az=azW(T);const u=pr(T,57.2,64);const d=lerp(64,70,u),h=lerp(24,27,u);
 return [[R1.x+Math.sin(az)*d,h,R1.z+Math.cos(az)*d],[R1.x+Math.sin(ja)*(R1.R+4),0,R1.z-Math.cos(ja)*(R1.R+4)]];}
function shotB(T){const z=bAt(T,YB);const u=sst(pr(T,66,78));return [[-6.2,lerp(9,6.4,u),z+lerp(14,10,u)],[0.4,0.4,z-3]];}
function shotC(T){const z=zYC(T);return [[-2.8,6.2,z+10],[0.0,0.4,z-6]];}
const mix=(a,b,f)=>[a[0].map((v,i)=>lerp(v,b[0][i],f)),a[1].map((v,i)=>lerp(v,b[1][i],f))];
function camAt(T){if(T<19)return shotA(T);if(T<24)return mix(shotA(T),shotR1(T),sst(pr(T,19,24)));if(T<31.4)return shotR1(T);
 if(T<33.4)return mix(shotR1(T),orbit0(T),eio(pr(T,31.2,33.4)));if(T<36.3)return orbit0(T);if(T<39.0)return mix(orbit0(T),shotO(T),eio(pr(T,36.3,39.0)));if(T<44.6)return shotO(T);
 if(T<48.6)return mix(shotO(T),chase(T),eio(pr(T,44.6,48.6)));if(T<52.6)return chase(T);if(T<55.4)return mix(chase(T),shotO2(T),eio(pr(T,52.6,55.4)));
 if(T<57.2)return shotO2(T);if(T<58)return mix(shotO2(T),waveShot(T),sst(pr(T,57.2,58)));if(T<64)return waveShot(T);if(T<69.5)return mix(waveShot(T),shotB(T),eio(pr(T,64,69.5)));
 if(T<81.2)return shotB(T);if(T<85.6)return mix(shotB(T),shotR2(T),eio(pr(T,81.2,85.6)));if(T<99.5)return shotR2(T);if(T<106)return mix(shotR2(T),shotC(T),eio(pr(T,99.5,106)));return shotC(T);}
const camera=new THREE.PerspectiveCamera(42,16/9,0.8,1800);
/* ---- text ---- */
const LINES=[[0,3.4,'堵了[40分钟]'],[3.4,7.4,'到前面一看——'],[7.4,11.0,'[什么都没有]'],[11.0,14.0,'然后，突然就通了'],[14.0,16.4,'那刚才，是谁堵的？'],
 [20.8,24.6,'2008年，日本：22辆车绕圈开'],[24.6,28.6,'没有红绿灯，没有路口'],[28.6,32.6,'只要求：跟着前车，[安全地开]'],[32.6,36.6,'有一辆车，[轻轻踩了一脚刹车]'],[36.6,40.6,'后面的车，[一辆接一辆停下]'],[40.6,44.8,'一个堵车，[凭空出现]'],
 [44.9,48.9,'假如你开的是[这一辆]'],[48.9,53.0,'你开进堵车，[停下]，再开出来'],[53.0,57.0,'你走了，[堵车却还在]，还往后挪'],[57.0,61.1,'就像球场的[人浪]'],[61.1,65.1,'没人离开座位，[浪却在跑]'],
 [65.2,69.2,'所以堵车的时候，你总觉得——'],[69.2,73.2,'[隔壁车道更快]'],[73.2,77.2,'看一段堵车录像，[70%]的人这么想'],[77.2,81.3,'可在模拟里，两条道[一样快]'],
 [81.4,85.6,'答案藏在[1辆车]里'],[85.6,89.8,'2016年，美国：22辆车绕圈'],[89.8,93.8,'只把[1辆]换成自动驾驶'],[93.8,97.8,'它不追前车，[留出空当]'],[97.8,101.8,'急刹车少了[七成多]'],
 [101.8,105.8,'不用所有人都变好'],[105.8,109.8,'只要有人，[不跟那么紧]'],[109.8,113.8,'下次堵车，你也可以是[那一辆]'],[113.8,117.8,'多留一点车距，[少一脚急刹]'],
 [117.8,121.4,'前面什么都没有的堵车'],[121.4,125.4,'只是[一道波]，刚好经过你']];
const CHAP=[[0,16.4,'00','堵了','STUCK'],[20.8,44.8,'01','一个圈','THE RING'],[44.9,65.1,'02','往后跑','THE WAVE'],[65.2,81.3,'03','隔壁车道','THE NEXT LANE'],[81.4,101.7,'04','一辆车','ONE CAR'],[101.8,125.3,'05','你','YOU']];
const CARDS=[[24.6,32.6,`<div class="h">实验 · 2008 · 日本</div><div class="row"><span class="k">车</span><span class="v">22 辆</span></div><div class="row"><span class="k">跑道</span><span class="v">230 米</span></div><div class="row"><span class="k">车速</span><span class="v">≈30 km/h</span></div><div class="src">Sugiyama et al., New J. Phys. 2008</div>`],
 [73.2,81.3,`<div class="h">看完一段堵车录像（120 人）</div><div class="row"><span class="k">觉得隔壁更快</span><span class="v">70%</span></div><div class="row"><span class="k">想变道</span><span class="v">65%</span></div><div class="src">Redelmeier &amp; Tibshirani, Nature 1999</div>`],
 [97.8,105.8,`<div class="h">实验 · 2016 · 美国 · 22 辆车</div><div class="row"><span class="k">急刹车</span><span class="v">−74% 以上</span></div><div class="row"><span class="k">油耗</span><span class="v">−22% 以上</span></div><div class="src">Stern et al., Transp. Res. C 2018</div>`]];
function hudCard(g,mode,a,b){const W=520,H=180;g.clearRect(0,0,W,H);g.fillStyle='#fff';rr(g,0,0,W,H,26);g.fill();
 if(mode==='timer'){g.fillStyle='#8A949C';g.font='700 34px "Noto Sans CJK SC"';g.textAlign='left';g.fillText('已经堵了',34,64);g.fillText('前方事故',34,146);g.textAlign='right';g.font='900 64px "Noto Sans CJK SC"';g.fillStyle=a[1]?'#E8413C':'#34495E';g.fillText(a[0],W-34,70);g.fillStyle=b==='0'?'#E8413C':'#34495E';g.fillText(b,W-34,152);g.strokeStyle='#E3E6E2';g.lineWidth=3;g.beginPath();g.moveTo(34,96);g.lineTo(W-34,96);g.stroke();}
 else if(mode==='count'){g.fillStyle='#8A949C';g.font='700 34px "Noto Sans CJK SC"';g.textAlign='left';g.fillText('被这一脚刹车逼停的车',34,70);g.textAlign='right';g.fillStyle=a>0?'#E8413C':'#34495E';g.font='900 92px "Noto Sans CJK SC"';g.fillText(a+' 辆',W-34,152);}
 else{g.fillStyle='#8A949C';g.font='700 32px "Noto Sans CJK SC"';g.textAlign='left';g.fillText('你这条道',34,64);g.fillText('隔壁车道',34,146);g.textAlign='right';g.font='900 56px "Noto Sans CJK SC"';g.fillStyle='#C99400';g.fillText(a+' km/h',W-34,68);g.fillStyle='#2F6FC0';g.fillText(b+' km/h',W-34,150);g.strokeStyle='#E3E6E2';g.lineWidth=3;g.beginPath();g.moveTo(34,96);g.lineTo(W-34,96);g.stroke();}}
let hk='',ck='',pk=-1;
window.renderAt=function(T){
 for(const c of carsA){const ts=11.0+c.i*0.16+c.li*0.05;const dt=Math.max(0,T-ts);const a=2.6,tv=3.2;const s=dt<tv?0.5*a*dt*dt:0.5*a*tv*tv+a*tv*(dt-tv);placeOnA(c,c.s0+s);setBrake(c,1-cl(dt/0.6));}
 pinA.position.set(YOU.g.position.x,2.0,YOU.g.position.z);pinA.material.opacity=1-pr(T,3.0,3.6);pinA.visible=pinA.material.opacity>0;drawVB(T);{const qa=1-pr(T,11.2,12.2);for(const q of qParts){q.material.opacity=qa;q.visible=qa>0;}}
 const stopped=updateRing(RING1,T,14,null);updateRing(RING2,T,70,[95,101],AUTO);
 {const w=pr(T,89.8,91);for(const o of RING2.cars[AUTO].body)o.material.color.lerp(new THREE.Color(0xF7F8F6),w*0.5);autoRing.material.opacity=w;autoDome.visible=w>0.5;}
 lab230.material.opacity=pr(T,24.6,25.4)*(1-pr(T,31.2,32.2));lab260.material.opacity=pr(T,85.6,86.4)*(1-pr(T,100,101.5));
 // B
 let vy=0,vn=0;{for(let k=0;k<carsB.length;k++){const c=carsB[k];const z=bAt(T,k);const z2=bAt(T+0.1,k),z0=bAt(T-0.1,k);c.g.position.set(c.d,0,z);c.g.visible=z<ZB0+2&&z>ZB1+4&&T>58;const acc=((z2-z)-(z-z0))/0.01;setBrake(c,cl(acc/2.5));}
  vy=vField(bAt(T,YB),T,1)*3.6;const nb=carsB.filter(c=>c.li===2).map((c,k)=>c);vn=vField(bAt(T,YB),T,2)*3.6;}
 const zb=bAt(T,YB);pinB.position.set(LANE[1][0],2.0,zb);pinB.material.opacity=pr(T,64,65)*(1-pr(T,80.5,81.3));pinB.visible=pinB.material.opacity>0;
 // C
 const zy=zYC(T);const zw=zy-46+12*Math.max(0,T-119.2);let zA=0;for(const c of carsC){let z=c.z0-VC*Math.max(0,T-TC0);if(c===AHC){z+=6.5*bumpA(T);zA=z;}if(c===YC)z=zy;c.g.position.set(c.d,0,z);const rel=(z-zw)/7;
  let bf=T>119.2?Math.exp(-rel*rel):0;if(c===AHC)bf=Math.max(bf,pr(T,114.0,114.3)*(1-pr(T,115.5,116.0)));if(c===YC)bf=Math.max(bf,0.4*pr(T,114.7,115.0)*(1-pr(T,116.0,116.5)));setBrake(c,bf);c.g.visible=z<ZC0+2;}
 {const z0=zy-1.05,z1=zA+1.05;zoneC.scale.y=Math.max(0.01,z0-z1);zoneC.position.z=(z0+z1)/2;const op=pr(T,105.8,106.6)*(1-pr(T,124.6,125.4));zoneC.material.opacity=op*0.72;zoneC.visible=op>0;}
 updZoneR(pr(T,93.8,94.6)*(1-pr(T,99.0,99.8)));updSpec(T);
 for(const b of BADGES){const p=RING1.cars[b.j].g.position;b.s.position.set(p.x,7.2,p.z);const k=pr(T,b.t0,b.t0+0.3);const op=k*(1-pr(T,44.2,45.0));b.s.material.opacity=op;b.s.visible=op>0;const sc=4.4*(0.5+0.5*eo(k))*(1+0.25*Math.sin(Math.PI*k));b.s.scale.set(sc,sc,1);}
 {const p=RING1.cars[YR].g.position;const [cp]=camAt(T);const hs=0.07*Math.hypot(cp[0]-p.x,cp[1],cp[2]-p.z);pinR.scale.set(hs*0.8,hs,1);pinR.position.set(p.x,1.6+hs*0.5,p.z);pinR.material.opacity=pr(T,44.9,45.6)*(1-pr(T,56.4,57));pinR.visible=pinR.material.opacity>0;}
 pinC.position.set(LANE[1][0],2.0,zy);pinC.material.opacity=pr(T,106,107)*(1-pr(T,107.4,108.2))+pr(T,122.4,123.2)*0;pinC.visible=T>105.9&&T<125.6;
 // labels
 const set=(o,p,a)=>{o.p.set(...p);o.a=a;};const p0=RING1.cars[0].g.position;
 set(L_slow,[p0.x,3.6,p0.z],pr(T,33.3,33.9)*(1-pr(T,36.2,36.7)));
 {const ja=RING1.jaAt(T);const jp=RING1.pos(ja);const py=RING1.cars[YR].g.position;const w=pr(T,53.4,54.2)*(1-pr(T,56.4,57));set(L_back,[jp[0],4,jp[1]],w);
  const wr=R1.R+9.3;set(L_wave,[R1.x+Math.sin(ja)*wr,6.0,R1.z-Math.cos(ja)*wr],pr(T,57.6,58.3)*(1-pr(T,60.6,61.1)));set(L_jam,[jp[0],5,jp[1]],pr(T,61.3,62)*(1-pr(T,64.2,64.8)));}
 {let best=null,bd=1e9;for(let k=0;k<carsB.length;k++){if(carsB[k].li!==2)continue;const dz=Math.abs(bAt(T,k)-(zb-4));if(dz<bd){bd=dz;best=k;}}const zn=bAt(T,best);set(L_next,[LANE[2][0],2.6,zn],pr(T,69.2,70)*(1-pr(T,80.4,81.2)));}
 {const pa=RING2.cars[AUTO].g.position;set(L_auto,[pa.x,6.5,pa.z],pr(T,90.2,91)*(1-pr(T,93.2,93.8)));}set(L_spc,[zrMid[0],3.0,zrMid[1]],zoneR.visible?pr(T,94.0,94.8)*(1-pr(T,97.2,97.8)):0);
 set(L_gap,[LANE[1][0],1.4,zoneC.position.z],pr(T,106.0,106.8)*(1-pr(T,117.2,117.8)));
 const [p,l]=camAt(T);camera.position.set(...p);camera.lookAt(...l);R.render(S,camera);
 for(const o of LBS){if(o.a<=0){o.el.style.opacity=0;continue;}const v=o.p.clone().project(camera);let x=(v.x*0.5+0.5)*1920,y=(-v.y*0.5+0.5)*1080;const w=o.el.offsetWidth/2+30;x=cl(x,w,1920-w);y=cl(y,215,780);o.el.style.left=x+'px';o.el.style.top=y+'px';o.el.style.opacity=v.z<1?o.a:0;}
 // HUD card
 let mode=null;if(T<16.4)mode='timer';else if(T>=36.6&&T<44.8)mode='count';else if(T>=69.2&&T<73.2)mode='lanes';
 const sec=Math.min(2400,2392+Math.floor(pr(T,0,2.6)*8));const tm=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
 const ky=mode==='timer'?tm+(T<9.8?'?':'0'):(mode==='count'?'c'+chainN(T):(mode==='lanes'?'l'+Math.round(vy)+'/'+Math.round(vn):'n'));
 if(ky!==hk){hk=ky;const g=$('vms').getContext('2d');if(mode==='timer')hudCard(g,'timer',[tm,sec>=2400],T<9.8?'？':'0');else if(mode==='count')hudCard(g,'count',chainN(T));else if(mode==='lanes')hudCard(g,'lanes',Math.round(vy),Math.round(vn));}
 $('vms').style.opacity=mode==='timer'?1-pr(T,15.6,16.4):(mode==='count'?pr(T,36.6,37.2)*(1-pr(T,44.2,44.8)):(mode==='lanes'?pr(T,69.2,69.9)*(1-pr(T,72.5,73.2)):0));
 const ch=CHAP.find(c=>T>=c[0]&&T<c[1]);const chk=ch?ch[2]:'';if(chk!==ck){ck=chk;if(ch){const q=$('chap');q.querySelector('.ex').textContent=ch[2];q.querySelector('.t').textContent=ch[3];q.querySelector('.s').textContent=ch[4];}}
 $('chap').style.opacity=ch?pr(T,ch[0],ch[0]+0.6)*(1-pr(T,ch[1]-0.6,ch[1])):0;
 $('km').style.opacity=1-pr(T,15.6,16.4);const pp=0.04+0.92*eio(pr(T,3.4,7.6));$('km').querySelector('.fill').style.width=pp*100+'%';$('km').querySelector('.car').style.left=pp*100+'%';
 const ci=CARDS.findIndex(c=>T>=c[0]&&T<c[1]);if(ci!==pk){pk=ci;$('card').innerHTML=ci>=0?CARDS[ci][2]:'';}
 $('card').style.display=ci>=0?'block':'none';if(ci>=0){const c=CARDS[ci];$('card').style.opacity=pr(T,c[0],c[0]+0.6)*(1-pr(T,c[1]-0.6,c[1]));}
 $('plaque').style.opacity=pr(T,16.58,16.9)*(1-pr(T,20.2,20.8));$('plaque').style.transform=`scale(${1.06-0.06*eo(pr(T,16.58,17.3))})`;
 $('end').style.opacity=pr(T,125.4,126.4);
 {const fz=pr(T,33.0,33.3)*(1-pr(T,36.0,36.3)),ff=pr(T,49.2,49.5)*(1-pr(T,52.2,52.5));const md=fz>0?'fz':(ff>0?'ff':'');if($('tb').dataset.m!==md){$('tb').dataset.m=md;$('tb').innerHTML=md==='fz'?'<i class="pz"></i><i class="pz"></i><span>定格</span>':(md==='ff'?'<i class="tr"></i><i class="tr"></i><span>快进</span>':'');}
  $('tb').style.opacity=Math.max(fz,ff);$('flash').style.opacity=T>=FRZ[0]&&T<FRZ[0]+0.8?0.45*Math.exp(-(T-FRZ[0])/0.12):0;}
 const L=LINES.find(x=>T>=x[0]&&T<x[1]);$('sub').innerHTML=L?'<span class="pill">'+L[2].replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';$('sub').style.opacity=T>125.4?0:1;};
$('gauge').style.display='none';$('vms').style.display='block';$('km').style.display='block';$('chap').style.display='flex';$('title').style.display='none';
