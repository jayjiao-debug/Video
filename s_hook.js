// HOOK 0–20.6, first person at your dorm desk through the 满意度 thermal camera. Your phone (¥4000) is the hottest thing in view;
// you hold it up against the window while three days pass; you turn to the roommate on the top bunk: his ¥6000 blazes, the camera
// auto-ranges and your phone (still in your hand, foreground) cools with the same number. Title plaque erupts from your screen on the
// groove; then the camera dives into the mug's steam (heat-haze wipe into the lab).
import {T3 as THREE,heatMat,capsuleBetween,rbox,V3,camPath,setHL,capsule,setCapsule} from './thermal.js';
import {phone,redraw,steam,FONT,seatedPerson,standingPerson} from './kit.js';
import {U} from './util.js';const {pr,eio,eo,lerp,cl}=U;
const B=n=>0.383+2.0248*n, b=n=>0.383+0.5062*n;
export function makeHook(){
 const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(40,16/9,.01,80);S.add(cam);
 const amb=.13;
 const wallM=heatMat({heat:.16,vol:.1,recv:1}),floorM=heatMat({heat:.13,vol:.1,recv:1});
 const back=new THREE.Mesh(new THREE.PlaneGeometry(9,4),wallM);back.position.set(0,1.6,-1.6);S.add(back);
 const left=new THREE.Mesh(new THREE.PlaneGeometry(6,4),wallM);left.rotation.y=Math.PI/2;left.position.set(-1.6,1.6,.5);S.add(left);
 const right=new THREE.Mesh(new THREE.PlaneGeometry(6,4),wallM);right.rotation.y=-Math.PI/2;right.position.set(2.3,1.6,.5);S.add(right);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(9,9),floorM);floor.rotation.x=-Math.PI/2;S.add(floor);
 const ceil=new THREE.Mesh(new THREE.PlaneGeometry(9,9),heatMat({heat:.18,vol:.1,recv:1}));ceil.rotation.x=Math.PI/2;ceil.position.y=2.8;S.add(ceil);
 const winM=heatMat({heat:-.22,vol:.2,recv:.2});const win=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.8),winM);win.position.set(0,1.6,-1.59);S.add(win);
 const frameM=heatMat({heat:.24,vol:.3,recv:.6});for(const [w,h,x,y] of [[1.22,.06,0,2.03],[1.22,.06,0,1.17],[.06,.92,-.58,1.6],[.06,.92,.58,1.6],[.035,.8,0,1.6]]){const bb=rbox(w,h,.06,.01,frameM,1);bb.position.set(x,y,-1.57);S.add(bb);}
 const sun=new THREE.Mesh(new THREE.CircleGeometry(.11,40),heatMat({heat:1.3,vol:0}));S.add(sun);
 const deskM=heatMat({heat:.2,vol:.25,recv:.9});const desk=rbox(1.8,.05,.8,.01,deskM,1);desk.rotation.x=Math.PI/2;desk.position.set(0,.76,-1.1);S.add(desk);
 for(const x of [-.85,.85])for(const z of [-.78,-1.42])S.add(capsuleBetween(V3(x,0,z),V3(x,.74,z),.025,deskM));
 const lampM=heatMat({heat:.32,vol:.3,recv:.5});S.add(capsuleBetween(V3(-.62,.79,-1.32),V3(-.5,1.22,-1.36),.018,lampM));const shade=new THREE.Mesh(new THREE.ConeGeometry(.12,.14,32,1,true),heatMat({heat:.6,vol:.4,side:THREE.DoubleSide}));shade.position.set(-.44,1.22,-1.33);shade.rotation.z=-.5;S.add(shade);
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.035,16,12),heatMat({heat:1.05,vol:.1}));bulb.position.set(-.43,1.18,-1.31);S.add(bulb);
 const MUG=V3(-.32,.84,-.86);const mugM=heatMat({heat:.8,vol:.45});const mug=new THREE.Mesh(new THREE.CylinderGeometry(.045,.04,.1,32),mugM);mug.position.copy(MUG);S.add(mug);const handle=new THREE.Mesh(new THREE.TorusGeometry(.03,.009,10,24,Math.PI),mugM);handle.position.set(MUG.x-.048,MUG.y+.005,MUG.z);handle.rotation.z=Math.PI/2;S.add(handle);
 const tickSteam=steam(S,{x:MUG.x,y:MUG.y+.06,z:MUG.z,heat:.17,rise:1.1,spread:.045,n:30});
 let sd=3;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let i=0;i<9;i++){const bk=rbox(.17,.035+rn()*.025,.24,.004,heatMat({heat:.16+rn()*.1,vol:.2,recv:.6}),1);bk.rotation.x=Math.PI/2;bk.position.set(.62+rn()*.04,.8+i*.04,-1.05);bk.rotation.z=(rn()-.5)*.2;S.add(bk);}
 const lap=rbox(.36,.012,.25,.005,heatMat({heat:.36,vol:.2}),1);lap.rotation.x=Math.PI/2;lap.position.set(.15,.79,-1.2);S.add(lap);
 const lapS=rbox(.36,.23,.01,.005,heatMat({heat:.3,vol:.2}),1);lapS.position.set(.15,.91,-1.33);lapS.rotation.x=-.25;S.add(lapS);
 const P1=phone({heat:.95});P1.userData.sm.uniforms.uInk.value=.82;S.add(P1);
 const armM=heatMat({heat:.5,vol:.45}),skinM=heatMat({heat:.74,vol:.45});const arms=[-1,1].map(s=>{const a=capsule(.048,.4,armM);S.add(a);const h=new THREE.Mesh(new THREE.SphereGeometry(.03,16,12),skinM);h.scale.set(.8,1.2,1);S.add(h);return {a,h,s};});
 const bedM=heatMat({heat:.2,vol:.25,recv:.7});for(const [x,z] of [[1.15,-1.5],[1.15,.3],[2.15,-1.5],[2.15,.3]])S.add(capsuleBetween(V3(x,0,z),V3(x,2.2,z),.03,bedM));
 for(const y of [.45,1.5]){const mt=rbox(1.0,.14,1.8,.05,heatMat({heat:.22,vol:.3,recv:.8}),2);mt.rotation.x=Math.PI/2;mt.position.set(1.65,y,-.6);S.add(mt);}
 const PH2=V3(.34,.98,-.92);
 const mate=standingPerson({skin:.8,cloth:.52,h:1.74,noArms:true});mate.position.set(.78,0,-1.0);mate.rotation.y=-2.45;S.add(mate);
 {const mC=heatMat({heat:.52,vol:.4});const sh=V3(.78,1.35,-1.0);for(const s of [-1,1]){const shp=sh.clone().add(V3(s*.12*.64,0,s*.12*.77));S.add(capsuleBetween(shp,PH2.clone().add(V3(s*.03,-.07,0)),.045,mC));}}
 const P2=phone({heat:1.0});P2.userData.sm.uniforms.uInk.value=1.0;P2.position.copy(PH2);P2.lookAt(V3(0,1.27,-.3));P2.scale.setScalar(1.2);S.add(P2);
 const draw1=day=>(g,w,h)=>{g.textAlign='center';g.font=`900 60px ${FONT}`;g.fillText('实习工资 · 到账',w/2,300);g.font=`900 150px ${FONT}`;g.fillText('¥4000',w/2,500);g.font=`900 62px ${FONT}`;g.fillText(day?`开心的第 ${day} 天`:'刚刚',w/2,660);};
 const draw2=(g,w,h)=>{g.textAlign='center';g.font=`900 60px ${FONT}`;g.fillText('室友的实习工资',w/2,300);g.font=`900 150px ${FONT}`;g.fillText('¥6000',w/2,500);};
 redraw(P2.userData.tex,draw2);let lastDay=-1;
 const plTex=(()=>{const c=document.createElement('canvas');c.width=2048;c.height=640;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,2048,640);g.fillStyle='#fff';g.textAlign='center';g.font=`900 200px ${FONT}`;g.fillText('为什么一比，就觉得穷？',1024,320);g.font=`700 60px "DejaVu Sans"`;g.fillText('T H E   C O M P A R I S O N   T R A P',1024,470);
  g.strokeStyle='#fff';g.lineWidth=12;g.strokeRect(46,46,1956,548);return new THREE.CanvasTexture(c);})();
 const plM=heatMat({heat:1.1,vol:.1,map:plTex,ink:.9});const plaque=new THREE.Group();plaque.add(rbox(1.62,.52,.04,.03,heatMat({heat:.9,vol:.3}),2));
 const plFace=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.5),plM);plFace.position.z=.04;plaque.add(plFace);plaque.visible=false;S.add(plaque);
 const K=[[0,0,1.27,-.32, 0,1.02,-.68,34],[B(2),0,1.27,-.33, 0,1.02,-.68,34],[B(2)+1.0,0,1.28,-.3, 0,1.42,-1.4,46],[B(4),0,1.28,-.3, 0,1.43,-1.4,46],
  [B(4)+.9,.03,1.28,-.3, .23,.74,-1.14,50],[B(6),.03,1.28,-.3, .24,.74,-1.14,50],[B(6)+1.2,0,1.27,-.33, -.02,1.0,-.68,36],[B(8),0,1.27,-.36, 0,1.02,-.68,34],
  [B(9),0,1.27,-.37, 0,1.02,-.68,34],[B(9)+1.1,-.1,1.2,-.5, MUG.x,MUG.y+.3,MUG.z,40],[B(10),-.28,1.15,-.76, MUG.x,MUG.y+.6,MUG.z-.02,40]];
 const PK=[[0,0,1.02,-.66, -.5,0,0],[B(2),0,1.03,-.66, -.5,0,0],[B(2)+1.0,-.16,1.25,-.72, -.05,.15,0],[B(4),-.16,1.25,-.72, -.05,.15,0],[B(4)+.9,-.1,1.0,-.62, -.6,.15,0],[B(6),-.1,1.0,-.62, -.6,.15,0],[B(6)+1.2,0,1.02,-.66, -.5,0,0],[B(10),0,1.02,-.66, -.5,0,0]];
 const cp=camPath(K),pp=camPath(PK);
 function update(T){const [p,l,f]=cp(T);cam.position.copy(p);cam.lookAt(l);cam.fov=f;cam.updateProjectionMatrix();tickSteam(T,cam,1+2.5*pr(T,B(9),B(10)));
  const [pq,prt]=pp(T);P1.position.copy(pq);P1.rotation.set(prt.x,prt.y,0,'YXZ');P1.updateMatrixWorld(true);
  arms.forEach(A=>{const hand=V3(A.s*.04,-.035,-.008).applyMatrix4(P1.matrixWorld);A.h.position.copy(hand);setCapsule(A.a,hand.clone().add(V3(A.s*.36,-.32,.22)),hand);});
  const day=T<B(2)?0:Math.min(3,1+Math.floor((T-B(2))/1.0124));if(day!==lastDay){redraw(P1.userData.tex,draw1(day));lastDay=day;}
  const dph=T<B(2)||T>B(3)+1.0124?-1:((T-B(2))/1.0124)%1;const sunUp=dph<0?0:Math.sin(Math.PI*dph);winM.uniforms.uHeat.value=lerp(-.22,.25,sunUp);sun.visible=sunUp>.02;sun.position.set(-.42+.84*Math.max(dph,0),1.32+.5*sunUp,-1.585);
  const on=eo(pr(T,B(4),B(4)+.5));const off=eio(pr(T,B(7),B(7)+.5));P2.userData.sm.uniforms.uHeat.value=lerp(lerp(.15,1.55,on),.28,off);P2.userData.body.material.uniforms.uHeat.value=lerp(.15,1.1,on);P2.visible=T>B(4)-.4;
  const pk=pr(T,B(8),B(8)+.5);plaque.visible=T>=B(8)&&T<B(9)+1.3;if(plaque.visible){const fw=cam.getWorldDirection(new THREE.Vector3());const up=V3(0,1,0).applyQuaternion(cam.quaternion);
   const tp=cam.position.clone().addScaledVector(fw,lerp(.36,.3,eo(pk))).addScaledVector(up,lerp(-.06,.008,eo(pk))-.25*eio(pr(T,B(9)+.3,B(9)+1.3)));plaque.position.copy(tp);plaque.quaternion.copy(cam.quaternion);plaque.scale.setScalar(lerp(.02,.122,eo(pk)));
   plM.uniforms.uHeat.value=lerp(2.0,1.2,eo(pr(T,B(8),B(8)+1.0)));}
  setHL([[pq.x,pq.y,pq.z,.2,.22],[PH2.x,PH2.y,PH2.z,.4*on,.45],[-.43,1.18,-1.31,.25,.5],[MUG.x,MUG.y,MUG.z,.12,.18],[sun.position.x,sun.position.y,sun.position.z+.1,.3*sunUp,.7]]);}
 function params(T){const hi=lerp(1.0,1.62,eio(pr(T,B(5),B(5)+1.0124)));return {amb,lo:0,hi,t:T,shim:1,iso:1,bloom:1,haze:eio(pr(T,B(9)+.6,B(10))),hazeL:.55*hi};}
 const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
 function hud(T,P){if(T>=B(8)-.05)return '';const hi=P.hi;const y0=200,y1=680;const yOf=v=>y1-(y1-y0)*cl(v/hi);
  const mk=(v,t,c,o=1)=>`<div class="t" style="right:112px;top:${yOf(v)-28}px;font-size:42px;color:${c};text-align:right;opacity:${o}">${t} ◀</div>`;
  let h=`<div style="position:absolute;right:56px;top:${y0}px;width:34px;height:${y1-y0}px;border-radius:17px;background:linear-gradient(0deg,#260A68,#681696 14%,#BA2280 28%,#EE3E56 43%,#FF761A 57%,#FFBE28 71%,#FFEC96 86%,#FFFFFA);box-shadow:0 0 30px rgba(255,200,120,.35)"></div>
   <div class="t" style="right:36px;top:${y0-122}px;font-size:46px;text-align:right;line-height:1.1">满意度<br><span style="font-size:36px;color:#FFEC96">越开心 越热 ▲</span></div>`;
  h+=mk(.95,'你的 ¥4000','#fff');if(T>B(5))h+=mk(1.6,'室友 ¥6000','#FFEC96',pr(T,B(5),B(5)+.5));
  if(T>B(4)+.5&&T<B(6)+.6){const [x,y,z]=pj(PH2.clone().add(V3(0,.13,0)));if(z<1)h+=`<div class="t" style="left:${x}px;top:${y-90}px;transform:translateX(-50%);font-size:60px;color:#FFFFFA;opacity:${pr(T,B(4)+.5,B(4)+1)*(1-pr(T,B(6)-.3,B(6)+.1))}">室友 · ¥6000</div>`;}
  return h;}
 return {scene:S,cam,update,params,hud,objs:{P1,P2,PH2,plaque,arms,sun,winM,MUG,tickSteam,draw1,redrawP1:fn=>redraw(P1.userData.tex,fn),setDay:d=>{lastDay=d;}}};}
