/* ===== one-take demo 00 → 01 (30.75 s = 15 bars of the Slowed BGM) ===== */
INK.on=false;
const DUR=30.755;
const S=new THREE.Scene();S.background=new THREE.Color(0xF3EFE6);S.fog=new THREE.Fog(0xF3EFE6,90,300);
S.add(new THREE.HemisphereLight(0xffffff,0xe8e2d4,2.4));{const d=new THREE.DirectionalLight(0xffffff,0.85);d.position.set(-20,40,25);S.add(d);}
// ground: cream paper + map grid (fine lines every 4 m, stronger every 20 m)
{const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');g.fillStyle='#F3EFE6';g.fillRect(0,0,1024,1024);
 let sd=3;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};for(let i=0;i<9000;i++){g.fillStyle=`rgba(120,100,70,${r()*0.03})`;g.fillRect(r()*1024,r()*1024,2,2);}
 g.strokeStyle='rgba(120,105,80,.17)';g.lineWidth=2;for(let i=0;i<5;i++){const p=i*204.8;g.beginPath();g.moveTo(p,0);g.lineTo(p,1024);g.stroke();g.beginPath();g.moveTo(0,p);g.lineTo(1024,p);g.stroke();}
 g.strokeStyle='rgba(110,95,70,.30)';g.lineWidth=4;g.strokeRect(0,0,1024,1024);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(70,70);t.anisotropy=16;t.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshBasicMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(60,0,-120);S.add(m);}
// map decoration (thin transit lines + white stations), one river
river(S,[[-260,-250],[-40,-262],[80,-300],[320,-320]],20);
deco(S,[[[[-90,-30],[-20,-30],[-12,-38],[-12,-110],[-40,-138],[-120,-138]],0x8E5CA8],[[[ 6,-60],[60,-60],[72,-72],[72,-150],[96,-150]],0x00A6B4],[[[-110,-200],[-24,-200],[-10,-214],[-10,-290]],0xE8413C]]);
station(S,-40,-30,'c',1.5);station(S,-12,-80,'s',1.5);station(S,72,-110,'t',1.5);station(S,-60,-200,'t',1.5);
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
{const post=lam(0x8d938c);const p=new THREE.Mesh(new THREE.BoxGeometry(0.3,5.4,0.3),post);p.position.set(0,2.7,-0.45);vb.add(p);
 const box=new THREE.Mesh(new THREE.BoxGeometry(6.6,3.7,0.4),lam(0x2b2e2c));box.position.set(0,5.75,-0.1);vb.add(box);
 const f=new THREE.Mesh(new THREE.PlaneGeometry(6.2,3.36),new THREE.MeshBasicMaterial({map:vbT}));f.position.set(0,5.75,0.11);vb.add(f);}
vb.position.set(8.5,0,-201);vb.rotation.y=-0.56;S.add(vb);
let vbKey='';function drawVB(T){const it=[['车祸',7.2],['施工',7.8],['收费站',8.4]];const rows=it.map(([n,t0])=>T<t0?{t:' ',c:'#fff'}:{t:`${n} —— ${T>=t0+0.35?'无':'？'}`,c:T>=t0+0.35?'#f22':'#fff'});
 const k=rows.map(r=>r.t).join('|');if(k===vbKey)return;vbKey=k;led(vbT.image.getContext('2d'),[{t:'前方情况',c:'#fff'},...rows],960,540,4);vbT.needsUpdate=true;}
// ---- the ring (01), off to the side of the map; connected by the cyan line's station
const RC=new THREE.Vector3(150,0,-150);
{const r=new THREE.Mesh(new THREE.RingGeometry(RAD-0.7,RAD+0.7,256),basic(0xE8413C));r.rotation.x=-Math.PI/2;r.position.set(RC.x,0.04,RC.z);S.add(r);
 const s=new THREE.Mesh(new THREE.RingGeometry(RAD-0.5,RAD+1.1,256),shMat);s.rotation.x=-Math.PI/2;s.position.set(RC.x,0.02,RC.z);S.add(s);}
deco(S,[[[[96,-150],[RC.x-RAD-1.2,-150]],0x00A6B4]]);
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
 if(hk!==hudKey){hudKey=hk;led($('vms').getContext('2d'),[{t:'已堵 '+tm,c:sec>=2400?'#f22':'#fff'},{t:'前方事故 '+(T<9.0?'？':'0'),c:'#fff'}],420,150,3);
  const q=$('chap');q.querySelector('.ex').textContent=ch?'01':'00';q.querySelector('.t').textContent=ch?'一个圈':'堵了';q.querySelector('.s').textContent=ch?'THE RING':'STUCK';}
 const hudA=1-pr(T,16.4,17.2);$('vms').style.opacity=hudA;$('km').style.opacity=hudA;
 $('chap').style.opacity=T<17.2?1-pr(T,16.4,17.2):pr(T,21.0,21.6);
 const pp=0.04+0.92*eio(pr(T,2.8,7.2));$('km').querySelector('.fill').style.width=pp*100+'%';$('km').querySelector('.car').style.left=pp*100+'%';
 const ta=eo(pr(T,18.6,19.2))*(1-pr(T,20.4,21.0));$('title').style.opacity=ta;$('title').style.transform=`translate(-50%,${(1-eo(pr(T,18.6,19.2)))*18}px)`;
 const ca=pr(T,24.2,24.8);$('card').style.display=ca>0?'block':'none';$('card').style.opacity=ca;
 const L=LINES.find(x=>T>=x[0]&&T<x[1]);$('sub').innerHTML=L?'<span class="pill">'+L[2].replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';};
$('card').innerHTML=`<div class="h">实验 · 2008 · 日本</div><div class="row"><span class="k">车</span><span class="v">22 辆</span></div><div class="row"><span class="k">跑道</span><span class="v">230 米</span></div><div class="row"><span class="k">车速</span><span class="v">≈30 km/h</span></div><div class="src">Sugiyama et al., New J. Phys. 2008</div>`;
$('gauge').style.display='none';$('vms').style.display='block';$('km').style.display='block';$('chap').style.display='flex';
