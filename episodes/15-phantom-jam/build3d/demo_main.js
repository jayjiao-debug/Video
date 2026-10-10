/* ===== one-take demo 00 → 01 (30.75 s = 15 bars of the Slowed BGM) ===== */
INK.on=false;
const DUR=30.755;
const S=new THREE.Scene();S.background=new THREE.Color(0xF3EFE6);S.fog=new THREE.Fog(0xF3EFE6,90,300);
S.add(new THREE.HemisphereLight(0xffffff,0xe8e2d4,2.4));{const d=new THREE.DirectionalLight(0xffffff,0.85);d.position.set(-20,40,25);S.add(d);}
const RC_X=150;
// ground: light concrete with a dot grid (as demo v2)
const BGC=0xE6E8E3;S.background.set(BGC);S.fog.color.set(BGC);
{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#E6E8E3';g.fillRect(0,0,256,256);
 let sd=3;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let i=0;i<1400;i++){g.fillStyle=`rgba(70,80,75,${r()*0.035})`;g.fillRect(r()*256,r()*256,2,2);}
 g.fillStyle='rgba(60,70,65,.30)';for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.beginPath();g.arc(x*64+32,y*64+32,2.6,0,7);g.fill();}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(175,175);t.anisotropy=16;t.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshBasicMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(60,0,-120);S.add(m);}
// natural accent lines (thick smooth curves with a soft shadow, no stations)
function smoothPts(pts){let p=pts;for(let k=0;k<4;k++){const q=[p[0]];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);}q.push(p[p.length-1]);p=q;}return p;}
function ribbon(pts,w,color,y=0.05){pts=smoothPts(pts);const sh=new THREE.Shape();const L=[],Rr=[];
 for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz);dx/=l;dz/=l;L.push([pts[i][0]-dz*w/2,pts[i][1]+dx*w/2]);Rr.push([pts[i][0]+dz*w/2,pts[i][1]-dx*w/2]);}
 const all=L.concat(Rr.reverse());sh.moveTo(all[0][0],-all[0][1]);for(const p of all.slice(1))sh.lineTo(p[0],-p[1]);
 const geo=new THREE.ShapeGeometry(sh);const m=new THREE.Mesh(geo,basic(color));m.rotation.x=-Math.PI/2;m.position.y=y;S.add(m);
 const s=new THREE.Mesh(geo,shMat);s.rotation.x=-Math.PI/2;s.position.set(0.22,0.012,0.22);S.add(s);
 for(const e of [pts[0],pts[pts.length-1]]){const c=new THREE.Mesh(new THREE.CircleGeometry(w/2,24),basic(color));c.rotation.x=-Math.PI/2;c.position.set(e[0],y+0.001,e[1]);S.add(c);}}
ribbon([[-70,-10],[-16,-10],[-9,-22],[-9,-120],[-34,-142],[-100,-142]],0.7,0x8E5CA8);
ribbon([[40,20],[14,20],[9,8],[9,-40],[20,-60],[60,-66],[96,-120],[RC_X-46,-150],[RC_X-RAD-2,-150]],0.7,0x00A6B4);
ribbon([[-120,-230],[-30,-232],[-12,-250],[-12,-320]],0.7,0x3FAE49);
ribbon([[60,-250],[120,-240],[190,-200],[230,-120]],0.7,0xF28C28);
// small props that sit in the background: low-poly trees, hedges, lamp posts (muted, never in front of the cars)
const propShadow=(x,z,r)=>{const g=new THREE.CircleGeometry(r,16);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,shMat);m.position.set(x+0.25,0.015,z+0.25);S.add(m);};
let sp=17;const prn=()=>{sp=(sp*16807)%2147483647;return sp/2147483647;};
const treeTops=[],trunks=[],hedges=[],lamps=[];
function addTree(x,z,s){const t=new THREE.CylinderGeometry(0.1*s,0.13*s,0.7*s,6);t.translate(x,0.35*s,z);trunks.push(t);const c=new THREE.IcosahedronGeometry(0.75*s,0);c.translate(x,1.1*s,z);treeTops.push(c);propShadow(x,z,0.8*s);}
for(let k=0;k<70;k++){const side=prn()<.5?-1:1;const x=side*(9+prn()*45),z=30-prn()*330;if(Math.abs(x-RC_X)<RAD+6&&Math.abs(z+150)<RAD+6)continue;addTree(x,z,0.7+prn()*0.6);}
for(let k=0;k<26;k++){const a=prn()*Math.PI*2,r=RAD+8+prn()*30;addTree(RC_X+Math.sin(a)*r,-150+Math.cos(a)*r,0.7+prn()*0.6);}
for(let k=0;k<8;k++){const a=prn()*Math.PI*2,r=prn()*(RAD-10);addTree(RC_X+Math.sin(a)*r,-150+Math.cos(a)*r,0.8+prn()*0.4);}
for(let k=0;k<18;k++){const side=prn()<.5?-1:1;const x=side*(6+prn()*30),z=20-prn()*300;const b=new RoundedBoxGeometry(2.4+prn()*2,0.5,0.8,2,0.25);b.translate(x,0.25,z);hedges.push(b);}
for(let z=30;z>-320;z-=24)for(const x of [-3.5,3.5]){const p=new THREE.CylinderGeometry(0.06,0.08,3.2,8);p.translate(x,1.6,z);lamps.push(p);const h=new THREE.BoxGeometry(0.7,0.12,0.22);h.translate(x+(x<0?0.3:-0.3),3.2,z);lamps.push(h);}
S.add(new THREE.Mesh(mergeGeometries(treeTops),new THREE.MeshLambertMaterial({color:0xA9C79A,flatShading:true})));
S.add(new THREE.Mesh(mergeGeometries(trunks),lam(0xB8A48C)));S.add(new THREE.Mesh(mergeGeometries(hedges),lam(0xB9D1AA)));S.add(new THREE.Mesh(mergeGeometries(lamps),lam(0xC5CAC4)));
// ---- the motorway (00)
motorway(S,40,-330);
const PAL=[0x3FAE49,0x2F7FD3,0xF28C28,0x8E5CA8,0x00A6B4,0xE8413C,0xFFFFFF];
let sd2=5;const rr2=()=>{sd2=(sd2*16807)%2147483647;return sd2/2147483647;};
const glowT=ctex(64,64,(q)=>{const r=q.createLinearGradient(0,0,0,64);r.addColorStop(0,'rgba(255,60,40,.55)');r.addColorStop(1,'rgba(255,60,40,0)');q.fillStyle=r;q.fillRect(0,0,64,64);});
function mkCar(col){const g=carB(col,'drive');const tails=[];g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x7a2018)tails.push(o);});
 const p=new THREE.PlaneGeometry(0.9,0.6);p.rotateX(-Math.PI/2);const gm=new THREE.MeshBasicMaterial({map:glowT,transparent:true,depthWrite:false});const glow=new THREE.Mesh(p,gm);glow.position.set(0,0.02,1.3);g.add(glow);
 return {g,tm:tails.length?tails[0].material:null,gm};}
const BRAKE_ON=new THREE.Color(0xFF3020),BRAKE_OFF=new THREE.Color(0x7a2018);
function setBrake(c,f){if(c.tm)c.tm.color.copy(BRAKE_OFF).lerp(BRAKE_ON,f);c.gm.opacity=f;}
const cars=[];const GAP=2.85,FRONT=-174,NPL=70;
LANES.forEach(([x,col],li)=>{for(let i=0;i<NPL;i++){const z0=FRONT+(li%2)*0.9+i*GAP;const you=li===1&&i===50;
 const c=you?0xEAA800:PAL[Math.floor(rr2()*PAL.length)];const k=mkCar(c);k.g.position.set(x,0,z0);S.add(k.g);cars.push({...k,li,i,z0,x,you});}});
const YOU=cars.find(c=>c.you);
const pin=pinSprite();S.add(pin);
const gantry=frontA();gantry.position.set(0,0,-178.6);S.add(gantry);
// roadside LED board that fills in line by line
const vbT=ctex(960,540,()=>{});const vb=new THREE.Group();
{const post=lam(0x8d938c);const p=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,5.4,12),lam(0xC5CAC4));p.position.set(0,2.7,-0.45);vb.add(p);
 const box=new THREE.Mesh(new RoundedBoxGeometry(6.6,3.8,0.34,3,0.25),lam(0xD3D8D2));box.position.set(0,5.75,-0.12);vb.add(box);
 const f=new THREE.Mesh(new THREE.PlaneGeometry(6.2,3.36),new THREE.MeshBasicMaterial({map:vbT}));f.position.set(0,5.75,0.11);vb.add(f);}
vb.position.set(8.5,0,-201);vb.rotation.y=-0.56;S.add(vb);
function infoCard(g,W,H,title,rows){g.clearRect(0,0,W,H);g.fillStyle='#FFFFFF';rr(g,8,8,W-16,H-16,46);g.fill();g.lineWidth=8;g.strokeStyle='#34495E';rr(g,8,8,W-16,H-16,46);g.stroke();
 g.fillStyle='#1D7A4C';rr(g,8,8,W-16,128,46);g.fill();g.fillRect(8,90,W-16,46);g.fillStyle='#fff';g.font='900 78px "Noto Sans CJK SC"';g.textAlign='center';g.fillText(title,W/2,100);
 rows.forEach((r,i)=>{if(!r)return;const y=230+i*104;g.textAlign='left';g.fillStyle='#34495E';g.font='900 70px "Noto Sans CJK SC"';g.fillText(r[0],90,y);
  g.textAlign='right';g.fillStyle=r[1]==='无'?'#E8413C':'#8A949C';g.fillText(r[1],W-90,y);g.strokeStyle='#D9DDD8';g.lineWidth=4;g.beginPath();g.moveTo(90,y+30);g.lineTo(W-90,y+30);g.stroke();});}
let vbKey='';function drawVB(T){const it=[['车祸',7.2],['施工',7.8],['收费站',8.4]];const rows=it.map(([n,t0])=>T<t0?{t:' ',c:'#fff'}:{t:`${n} —— ${T>=t0+0.35?'无':'？'}`,c:T>=t0+0.35?'#f22':'#fff'});
 const k=rows.map(r=>r.t).join('|');if(k===vbKey)return;vbKey=k;infoCard(vbT.image.getContext('2d'),960,540,'前方情况',rows.map(r=>r.t===' '?null:r.t.split(' —— ')));vbT.needsUpdate=true;}
// ---- the ring (01), off to the side of the map; connected by the cyan line's station
const RC=new THREE.Vector3(RC_X,0,-150);
{const r=new THREE.Mesh(new THREE.RingGeometry(RAD-0.7,RAD+0.7,256),basic(0xE8413C));r.rotation.x=-Math.PI/2;r.position.set(RC.x,0.04,RC.z);S.add(r);
 const s=new THREE.Mesh(new THREE.RingGeometry(RAD-0.5,RAD+1.1,256),shMat);s.rotation.x=-Math.PI/2;s.position.set(RC.x,0.02,RC.z);S.add(s);}
const ringSimR=ringSim({N:22,L:230,T:40,dt:0.02,every:1});
const rc=[];for(let j=0;j<22;j++){const k=mkCar(PAL[j%6]);k.g.scale.setScalar(2.4);S.add(k.g);rc.push(k);}
const t230=ctex(1024,256,(c)=>{c.fillStyle='#34495E';c.font='900 150px "Noto Sans CJK SC"';c.textAlign='center';c.fillText('230 米',512,180);});
const lab230=new THREE.Mesh(new THREE.PlaneGeometry(20,5),new THREE.MeshBasicMaterial({map:t230,transparent:true,opacity:0}));lab230.rotation.x=-Math.PI/2;lab230.position.set(RC.x,0.08,RC.z);S.add(lab230);
// ---- camera: one continuous Hermite path through keys [t, pos, look]
const yz=YOU.z0;
const K=[
 [0.0,[-3.0,3.2,yz+7.5],[0.2,0.6,yz-16]],
 [2.6,[-2.4,4.2,yz+3.5],[0.4,0.6,yz-22]],
 [4.6,[-1.5,9.5,yz-24],[0.8,0,yz-60]],
 [6.8,[-3.5,11,-150],[1.5,1.5,-188]],
 [8.8,[-6,13,-176],[8,3.5,-202]],
 [10.6,[-5,13.5,-181],[8.5,4,-205]],
 [12.6,[10,16,-206],[0,0,-150]],
 [15.0,[14,34,-178],[20,0,-130]],
 [17.8,[50,110,-150],[60,0,-150]],
 [20.6,[110,96,-130],[125,0,-150]],
 [23.6,[RC.x-34,52,RC.z+60],[RC.x+2,0,RC.z+2]],
 [27.6,[RC.x-50,34,RC.z+40],[RC.x,0,RC.z]],
 [30.755,[RC.x-56,26,RC.z+20],[RC.x+2,0,RC.z-2]]];
function herm(T,idx){let i=0;while(i<K.length-2&&T>K[i+1][0])i++;const t0=K[i][0],t1=K[i+1][0];const u=Math.max(0,Math.min(1,(T-t0)/(t1-t0)));
 const Pp=j=>new THREE.Vector3(...K[Math.max(0,Math.min(K.length-1,j))][idx]),Tt=j=>K[Math.max(0,Math.min(K.length-1,j))][0];
 const m=j=>{if(j<=0||j>=K.length-1)return new THREE.Vector3();return Pp(j+1).sub(Pp(j-1)).multiplyScalar(1/(Tt(j+1)-Tt(j-1)));};
 const h00=2*u**3-3*u**2+1,h10=u**3-2*u**2+u,h01=-2*u**3+3*u**2,h11=u**3-u**2,d=t1-t0;
 return Pp(i).multiplyScalar(h00).add(m(i).multiplyScalar(h10*d)).add(Pp(i+1).multiplyScalar(h01)).add(m(i+1).multiplyScalar(h11*d));}
const camera=new THREE.PerspectiveCamera(42,16/9,0.3,1200);
const LINES=[[0,2.6,'堵了[40分钟]'],[2.6,6.6,'到前面一看——'],[6.6,10.8,'[什么都没有]'],[10.8,14.4,'然后，突然就通了'],[14.4,17.8,'那刚才，是谁堵的？'],
 [21.0,24.2,'2008年，日本'],[24.2,27.6,'一条[230米]的圆，22辆车'],[27.6,30.6,'跟着前车，[安全地开]']];
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),pr=(t,a,b)=>cl((t-a)/(b-a)),eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,eo=x=>1-Math.pow(1-x,3);
let hudKey='';
function hudCard(g,tm,red,acc){const W=420,H=150;g.clearRect(0,0,W,H);g.fillStyle='#fff';rr(g,0,0,W,H,22);g.fill();
 g.fillStyle='#8A949C';g.font='700 26px "Noto Sans CJK SC"';g.textAlign='left';g.fillText('已经堵了',28,52);g.fillText('前方事故',28,116);
 g.textAlign='right';g.font='900 50px "Noto Sans CJK SC"';g.fillStyle=red?'#E8413C':'#34495E';g.fillText(tm,W-28,58);g.fillStyle=acc==='0'?'#E8413C':'#34495E';g.fillText(acc,W-28,122);
 g.strokeStyle='#E3E6E2';g.lineWidth=3;g.beginPath();g.moveTo(28,78);g.lineTo(W-28,78);g.stroke();}
window.renderAt=function(T){
 // motorway: queue stopped, start-up wave from the front at 11.0 s
 for(const c of cars){const ts=11.0+c.i*0.16+c.li*0.05;const dt=Math.max(0,T-ts);const a=3.2,tv=2.4;const s=dt<tv?0.5*a*dt*dt:0.5*a*tv*tv+a*tv*(dt-tv);
  const z=c.z0-s;c.g.position.z=z;c.g.visible=z>-326;setBrake(c,1-cl(dt/0.6));}
 pin.position.set(YOU.g.position.x,2.0,YOU.g.position.z);pin.material.opacity=1-pr(T,3.8,4.8);pin.visible=pin.material.opacity>0;
 drawVB(T);
 // ring: cars at real speed from the moment it comes into view
 const st=Math.max(0,T-18)*1.0;const k=Math.min(ringSimR.frames.length-1,Math.round(st/ringSimR.dt));const fr=ringSimR.frames[k];
 for(let j=0;j<22;j++){const a=fr.x[j]/230*2*Math.PI-1.2;rc[j].g.position.set(RC.x+Math.sin(a)*RAD,0,RC.z-Math.cos(a)*RAD);rc[j].g.rotation.y=-a-Math.PI/2;setBrake(rc[j],0);}
 lab230.material.opacity=pr(T,24.2,24.9);
 const p=herm(T,1),l=herm(T,2);camera.position.copy(p);camera.lookAt(l);R.render(S,camera);
 // HUD
 const sec=Math.min(2400,2392+Math.floor(pr(T,0,2.4)*8));const tm=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
 const ch=T<18.6?0:1;const hk=tm+(T<9.0?'?':'0')+ch;
 if(hk!==hudKey){hudKey=hk;hudCard($('vms').getContext('2d'),tm,sec>=2400,T<9.0?'？':'0');
  const q=$('chap');q.querySelector('.ex').textContent=ch?'01':'00';q.querySelector('.t').textContent=ch?'一个圈':'堵了';q.querySelector('.s').textContent=ch?'THE RING':'STUCK';}
 const hudA=1-pr(T,16.4,17.2);$('vms').style.opacity=hudA;$('km').style.opacity=hudA;
 $('chap').style.opacity=T<17.2?1-pr(T,16.4,17.2):pr(T,21.0,21.6);
 const pp=0.04+0.92*eio(pr(T,2.8,7.2));$('km').querySelector('.fill').style.width=pp*100+'%';$('km').querySelector('.car').style.left=pp*100+'%';
 const ta=eo(pr(T,18.6,19.2))*(1-pr(T,20.4,21.0));$('title').style.opacity=ta;$('title').style.transform=`translate(-50%,${(1-eo(pr(T,18.6,19.2)))*18}px)`;
 const ca=pr(T,24.2,24.8);$('card').style.display=ca>0?'block':'none';$('card').style.opacity=ca;
 const L=LINES.find(x=>T>=x[0]&&T<x[1]);$('sub').innerHTML=L?'<span class="pill">'+L[2].replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';};
$('card').innerHTML=`<div class="h">实验 · 2008 · 日本</div><div class="row"><span class="k">车</span><span class="v">22 辆</span></div><div class="row"><span class="k">跑道</span><span class="v">230 米</span></div><div class="row"><span class="k">车速</span><span class="v">≈30 km/h</span></div><div class="src">Sugiyama et al., New J. Phys. 2008</div>`;
$('gauge').style.display='none';$('vms').style.display='block';$('km').style.display='block';$('chap').style.display='flex';
