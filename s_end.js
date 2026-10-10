// END 105.67–125.4: back at your desk (the hook's room). Your ¥4000 is cool against the roommate's blazing phone, which turns into a grape.
// 跟谁比，你能选: two placards; then the reference switches to last year's you (¥0): the legend re-ranges and your phone flares white-hot.
import {T3 as THREE,heatMat,capsuleBetween,V3,camPath,setHL,setCapsule} from './thermal.js';
import {makeHook} from './s_hook.js';import {FONT,redraw} from './kit.js';
import {U} from './util.js';const {pr,eio,eo,lerp,cl}=U;
const B=n=>0.383+2.0248*n, b=n=>0.383+0.5062*n;
export function makeEnd(){
 const H=makeHook();const {P1,P2,PH2,plaque,arms,sun,winM,MUG,tickSteam}=H.objs;const S=H.scene,cam=H.cam;
 // a hot grape cluster that grows out of the roommate's phone
 const grapeM=heatMat({heat:1.1,vol:.55});const grape=new THREE.Group();{let q=9;const r2=()=>(q=(q*16807)%2147483647)/2147483647;for(let i=0;i<16;i++){const row=Math.floor(i/4);const s=new THREE.Mesh(new THREE.SphereGeometry(.022,16,12),grapeM);const a=r2()*6.28,rr=(.04-row*.009)*Math.sqrt(r2());s.position.set(Math.cos(a)*rr,.04-row*.022,Math.sin(a)*rr);grape.add(s);}
  grape.add(capsuleBetween(V3(0,.045,0),V3(.012,.09,0),.004,heatMat({heat:.5,vol:.2})));}grape.position.copy(PH2).add(V3(0,.13,.02));S.add(grape);
 const drawSw=(g,w,h)=>{g.textAlign='center';g.font=`900 56px ${FONT}`;g.fillText('跟去年的自己比',w/2,300);g.font=`900 150px ${FONT}`;g.fillText('+¥4000',w/2,500);g.font=`900 48px ${FONT}`;g.fillText('去年这时候：¥0',w/2,650);};
 const drawA=(g,w,h)=>{g.textAlign='center';g.font=`900 60px ${FONT}`;g.fillText('实习工资 · 到账',w/2,300);g.font=`900 150px ${FONT}`;g.fillText('¥4000',w/2,500);};
 let state=-1;
 const K=[[B(52),.02,1.28,-.3, .24,.74,-1.14,50],[B(54),.03,1.28,-.3, .25,.76,-1.14,48],[B(54)+.9,.05,1.29,-.3, .34,.98,-.92,38],[B(56),.05,1.29,-.3, .34,.99,-.92,38],
  [B(56)+1.0,0,1.27,-.33, 0,1.02,-.66,42],[B(58),0,1.27,-.33, 0,1.02,-.66,42],[B(59),0,1.27,-.38, 0,1.02,-.66,34],[B(60),0,1.27,-.39, 0,1.02,-.66,34],[B(62),.06,1.36,-.12, 0,1.0,-.8,44]];
 const PK=[[B(52),-.1,1.0,-.62, -.6,.15,0],[B(56),-.1,1.0,-.62, -.6,.15,0],[B(56)+1.0,0,1.02,-.66, -.5,0,0],[B(62),0,1.02,-.66, -.5,0,0]];
 const cp=camPath(K),pp=camPath(PK);
 function update(T){const [p,l,f]=cp(T);cam.position.copy(p);cam.lookAt(l);cam.fov=f;cam.updateProjectionMatrix();tickSteam(T,cam,1);
  const [pq,prt]=pp(T);P1.position.copy(pq);P1.rotation.set(prt.x,prt.y,0,'YXZ');P1.updateMatrixWorld(true);
  arms.forEach(A=>{const hand=V3(A.s*.04,-.035,-.008).applyMatrix4(P1.matrixWorld);A.h.position.copy(hand);setCapsule(A.a,hand.clone().add(V3(A.s*.36,-.32,.22)),hand);});
  const sw=T>=B(58);if((sw?1:0)!==state){redraw(P1.userData.tex,sw?drawSw:drawA);state=sw?1:0;}
  sun.visible=false;winM.uniforms.uHeat.value=-.22;plaque.visible=false;P2.visible=true;
  P2.userData.sm.uniforms.uHeat.value=1.55;P2.userData.body.material.uniforms.uHeat.value=1.1;
  const gk=eo(pr(T,B(54),B(54)+.6));grape.visible=gk>0;grape.scale.setScalar(.2+1.0*gk);grape.position.copy(PH2).add(V3(-.02,.1+.04*gk,.05));grapeM.uniforms.uHeat.value=1.25;
  const flare=eo(pr(T,B(58),B(58)+.6));P1.userData.sm.uniforms.uHeat.value=lerp(.95,1.05,flare);P1.userData.sm.uniforms.uInk.value=lerp(.82,.98,flare);
  setHL([[pq.x,pq.y,pq.z,.2+.25*flare,.25+.15*flare],[PH2.x,PH2.y,PH2.z,.4,.45],[-.43,1.18,-1.31,.25,.5],[MUG.x,MUG.y,MUG.z,.12,.18]]);}
 // range: against the roommate (hi 1.62) until the switch, then against last year's you: hi drops so yours is the hottest thing in view
 function params(T){const sw=eio(pr(T,B(58),B(58)+.7));const hi=lerp(1.62,.95,sw);const haze=1-eio(pr(T,B(52),B(52)+.8));return {amb:.13,lo:lerp(0,-.05,sw),hi,t:T,shim:1,iso:1,bloom:1+.4*sw,haze,hazeL:.6};}
 const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
 function hud(T,P){let h='';const sw=pr(T,B(58),B(58)+.7);const y0=200,y1=680;const yOf=v=>y1-(y1-y0)*cl((v-P.lo)/(P.hi-P.lo));const chv=pr(T,B(56)+.2,B(56)+.6)*(1-pr(T,B(58)-.3,B(58)+.1));const vis=pr(T,B(52)+.6,B(52)+1)*(1-pr(T,B(61),B(61)+.6))*(1-chv);
  const mk=(v,t,c,o=1)=>`<div class="t" style="right:112px;top:${yOf(v)-28}px;font-size:42px;color:${c};text-align:right;opacity:${o*vis}">${t} ◀</div>`;
  h+=`<div style="opacity:${vis}"><div style="position:absolute;right:56px;top:${y0}px;width:34px;height:${y1-y0}px;border-radius:17px;background:linear-gradient(0deg,#260A68,#681696 14%,#BA2280 28%,#EE3E56 43%,#FF761A 57%,#FFBE28 71%,#FFEC96 86%,#FFFFFA);box-shadow:0 0 30px rgba(255,200,120,.35)"></div>
   <div class="t" style="right:36px;top:${y0-122}px;font-size:46px;text-align:right;line-height:1.1">满意度<br><span style="font-size:36px;color:#FFEC96">越开心 越热 ▲</span></div></div>`;
  h+=mk(Math.min(.95,P.hi),'你的 ¥4000','#fff');h+=mk(1.6,'室友 ¥6000','#FFEC96',1-sw);if(sw>0)h+=mk(0,'去年的你 ¥0','#EBFFFF',sw);
  const ch=pr(T,B(56)+.2,B(56)+.6)*(1-pr(T,B(58)-.3,B(58)+.1));
  if(ch>0){const pc=(x,t,v,c,bd,bg,dl)=>`<div style="position:absolute;left:${x}px;top:250px;width:440px;padding:22px 30px;border-radius:22px;background:${bg};border:3px solid ${bd};box-shadow:0 0 40px ${bd};opacity:${pr(T,B(56)+dl,B(56)+dl+.3)*ch}"><div class="t" style="position:static;font-size:40px;color:#fff">${t}</div><div class="t" style="position:static;font-size:84px;color:${c}">${v}</div></div>`;
   h+=pc(170,'跟室友比','−¥2,000','#9ff0ff','rgba(80,230,255,.8)','rgba(20,40,120,.55)',0)+pc(1250,'跟去年的自己比','+¥4,000','#FFEC96','rgba(255,190,40,.85)','rgba(120,40,10,.45)',.506);}
  return h;}
 return {scene:S,cam,update,params,hud};}
