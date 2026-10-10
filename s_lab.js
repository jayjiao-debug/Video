// LAB 20.6–48.9: Brosnan & de Waal (2003). Two capuchins in side-by-side cages trade a stone for food through a tray slot.
// Through the 满意度 camera: cucumber is lukewarm, the grape is white-hot. When the neighbour gets grapes, monkey A cools, refuses and throws the cucumber out.
import {T3 as THREE,heatMat,heatAdd,capsuleBetween,rbox,V3,camPath,setHL} from './thermal.js';
import {FONT,BLOB} from './kit.js';
import {U} from './util.js';const {pr,eio,eo,lerp,cl}=U;
const B=n=>0.383+2.0248*n, b=n=>0.383+0.5062*n;
// capuchin in side profile, facing +x; origin at the feet. Returns {g, set({heat, reach, eat, turn, slump})}
function capuchin(){const g=new THREE.Group();const body=heatMat({heat:.7,vol:.5}),face=heatMat({heat:.82,vol:.45}),cap=heatMat({heat:.6,vol:.5});
 const torso=new THREE.Mesh(new THREE.SphereGeometry(.16,32,24),body);torso.scale.set(1.0,1.25,.85);torso.position.set(0,.3,0);torso.rotation.z=-.35;g.add(torso);
 const hips=new THREE.Mesh(new THREE.SphereGeometry(.14,28,20),body);hips.position.set(-.08,.16,0);g.add(hips);
 const headG=new THREE.Group();headG.position.set(.1,.56,0);g.add(headG);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.105,32,24),body);headG.add(head);
 const muzzle=new THREE.Mesh(new THREE.SphereGeometry(.07,24,18),face);muzzle.position.set(.075,-.03,0);muzzle.scale.set(1,.85,1);headG.add(muzzle);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(.1,24,18,0,Math.PI*2,0,Math.PI*.42),cap);crown.position.set(-.01,.02,0);crown.rotation.z=.25;headG.add(crown);
 for(const z of [-.09,.09]){const ear=new THREE.Mesh(new THREE.SphereGeometry(.03,12,10),body);ear.position.set(-.02,.02,z);headG.add(ear);}
 // tail: a curl behind
 const tc=new THREE.CatmullRomCurve3([V3(-.18,.14,0),V3(-.36,.1,0),V3(-.48,.28,0),V3(-.44,.5,0),V3(-.32,.56,0),V3(-.28,.46,0)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(tc,40,.028,10),body));
 // legs (sitting)
 for(const z of [-.08,.08]){g.add(capsuleBetween(V3(-.04,.14,z),V3(.12,.1,z),.055,body));g.add(capsuleBetween(V3(.12,.1,z),V3(.1,0,z),.045,body));}
 // arms: shoulder → elbow → hand, posed in set()
 const arms=[];for(const z of [-.1,.1]){const up=capsuleBetween(V3(0,0,0),V3(0,-.14,0),.04,body),lo=capsuleBetween(V3(0,0,0),V3(0,-.14,0),.035,body);const hand=new THREE.Mesh(new THREE.SphereGeometry(.04,14,10),face);g.add(up);g.add(lo);g.add(hand);arms.push({up,lo,hand,z});}
 const place=(m,a,b2,r)=>{const d=new THREE.Vector3().subVectors(b2,a);const L=d.length();m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(V3(0,1,0),d.clone().normalize());m.scale.set(1,L/.14/1.6+.0,1);};
 function set({heat=.7,reach=0,eat=0,turn=0,slump=0,throwA=0}){body.uniforms.uHeat.value=heat;face.uniforms.uHeat.value=heat>.3?heat+.12:heat;cap.uniforms.uHeat.value=heat-.08;
  headG.rotation.y=turn;headG.rotation.z=-.15*eat-.25*slump;headG.position.y=.56-.04*slump;torso.rotation.z=-.35-.2*slump;
  const hands=[];arms.forEach((A,i)=>{const sh=V3(.06,.42,A.z);let tgt;
   if(i===1){tgt=V3(lerp(.2,.44,reach),lerp(.24,.2,reach),A.z*.6);tgt.lerp(V3(.2,.52,.05),eat);if(throwA>0){const k=Math.sin(Math.PI*cl(throwA));tgt=V3(lerp(.1,-.05,k),lerp(.4,.72,k),.12);}}
   else tgt=V3(.16,.2,A.z);
   const el=sh.clone().lerp(tgt,.5).add(V3(-.04,-.06,0));
   const p1=(m,a,c)=>{const d=new THREE.Vector3().subVectors(c,a);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(V3(0,1,0),d.clone().normalize());m.scale.set(1,Math.max(.2,d.length()/.14),1);};
   p1(A.up,sh,el);p1(A.lo,el,tgt);A.hand.position.copy(tgt);hands.push(tgt);});
  return hands;}
 return {g,set,body};}
export function makeLab(){
 const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(34,16/9,.01,80);S.add(cam);const amb=.2;
 const wallM=heatMat({heat:.25,vol:.1,recv:1}),floorM=heatMat({heat:.21,vol:.1,recv:1});
 const back=new THREE.Mesh(new THREE.PlaneGeometry(14,6),wallM);back.position.set(0,2,-1.4);S.add(back);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,10),floorM);floor.rotation.x=-Math.PI/2;S.add(floor);
 // two cages on a bench: frame + vertical bars in front, a tray slot at the front-right of each
 const benchM=heatMat({heat:.16,vol:.25,recv:.9});const bench=rbox(4.2,.08,1.2,.02,benchM,1);bench.rotation.x=Math.PI/2;bench.position.set(0,.76,-.55);S.add(bench);
 for(const x of [-1.9,1.9])for(const z of [-1.05,-.05])S.add(capsuleBetween(V3(x,0,z),V3(x,.74,z),.035,benchM));
 const barM=heatMat({heat:.2,vol:.3,recv:.6});const cages=[];
 for(const cx of [-.95,.95]){const g=new THREE.Group();g.position.set(cx,.8,-.55);S.add(g);
  const W=1.6,H=1.25,D=1.0;for(const [x,z] of [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]])g.add(capsuleBetween(V3(x,0,z),V3(x,H,z),.02,barM));
  for(const y of [0,H])for(const z of [-D/2,D/2])g.add(capsuleBetween(V3(-W/2,y,z),V3(W/2,y,z),.02,barM));
  for(const y of [0,H])for(const x of [-W/2,W/2])g.add(capsuleBetween(V3(x,y,-D/2),V3(x,y,D/2),.02,barM));
  const floorC=rbox(W,.03,D,.01,heatMat({heat:.14,vol:.2,recv:.8}),1);floorC.rotation.x=Math.PI/2;g.add(floorC);
  const tray=rbox(.34,.03,.26,.01,heatMat({heat:.18,vol:.3,recv:.6}),1);tray.rotation.x=Math.PI/2;tray.position.set(.45,.02,D/2+.13);g.add(tray);
  const lamp=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,.1,32),heatMat({heat:.55,vol:.3}));lamp.position.set(0,H+.25,0);g.add(lamp);const lb=new THREE.Mesh(new THREE.SphereGeometry(.07,20,12),heatMat({heat:1.1,vol:.1}));lb.position.set(0,H+.19,0);g.add(lb);S.add(capsuleBetween(V3(cx,.8+H+.29,-.55),V3(cx,3,-.55),.012,barM));
  cages.push(g);}
 const mA=capuchin(),mB=capuchin();mA.g.position.set(-1.0,.83,-.55);mB.g.position.set(.9,.83,-.55);S.add(mA.g);S.add(mB.g);
 const tokM=heatMat({heat:-.05,vol:.4,ice:.6});const tok=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.065,16,12),tokM);m.scale.set(1.2,.7,1);S.add(m);return m;});
 const cuke=()=>{const g=new THREE.Group();const m=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.24,6,16),heatMat({heat:.38,vol:.35}));m.rotation.z=Math.PI/2;g.add(m);S.add(g);return {g,m};};
 const cA=cuke(),cB=cuke();
 const grapeM=heatMat({heat:1.12,vol:.55});const grape=new THREE.Group();{let q=5;const r2=()=>(q=(q*16807)%2147483647)/2147483647;for(let i=0;i<14;i++){const row=Math.floor(i/4);const s=new THREE.Mesh(new THREE.SphereGeometry(.03,18,12),grapeM);const a=r2()*6.28,rr=(.05-row*.012)*Math.sqrt(r2());s.position.set(Math.cos(a)*rr,.05-row*.03,Math.sin(a)*rr);grape.add(s);}grape.add(capsuleBetween(V3(0,.06,0),V3(.02,.12,0),.006,heatMat({heat:.5,vol:.2})));}S.add(grape);
 const STASH=V3(1.22,1.12,-.62);const stash=grape.clone();stash.scale.setScalar(1.7);stash.position.copy(STASH);S.add(stash);const dish=new THREE.Mesh(new THREE.CylinderGeometry(.13,.1,.02,32),heatMat({heat:.3,vol:.3}));dish.position.copy(STASH).add(V3(0,-.07,0));S.add(dish);const post=capsuleBetween(V3(STASH.x,.83,STASH.z),V3(STASH.x,STASH.y-.08,STASH.z),.015,heatMat({heat:.25,vol:.3}));S.add(post);
 // the exchange cycle, one per bar from bar 12 (24.68): beat0 hand out token → beat1–2 food slides in → beat3 eat
 const SL=[-1.0+.95+.45-.0,.95+.45]; // tray x (world) for A and B
 const slot=i=>V3(cages[i].position.x+.45,.83,-.55+.5+.13);
 function cyc(T){if(T<B(12))return null;const n=Math.floor((T-B(12))/2.0248);const u=((T-B(12))/2.0248)%1;return {n,u};}
 const K=[[B(10),-.2,3.2,1.2, 0,1.2,-.6,40],[B(10)+1.6,0,1.6,3.2, 0,1.25,-.6,34],[B(12),0,1.55,3.0, 0,1.25,-.6,34],[B(12)+1.6,-1.2,1.35,1.55, -1.0,1.2,-.4,34],[B(14),-1.15,1.36,1.5, -1.0,1.2,-.4,34],
  [B(14)+1.4,0,1.5,3.0, 0,1.25,-.55,34],[B(16),0,1.5,2.95, 0,1.25,-.55,34],[B(16)+1.4,.95,1.32,1.45, .95,1.2,-.4,32],[B(18),.92,1.32,1.45, .9,1.2,-.4,32],[B(18)+1.4,-1.75,1.45,1.55, -.25,1.15,-.55,36],[B(20),-1.72,1.45,1.5, -.25,1.15,-.55,36],
  [B(20)+1.4,0,1.55,3.1, 0,1.25,-.55,36],[B(22),0,1.55,3.0, 0,1.25,-.55,36],[B(23),.8,1.3,1.6, 1.1,1.0,-.6,30],[B(24),1.28,.93,-.42, 1.28,.88,-.72,30]];
 const cp=camPath(K);
 function update(T){const [p,l,f]=cp(T);cam.position.copy(p);cam.lookAt(l);cam.fov=f||34;cam.updateProjectionMatrix();
  const c=cyc(T);const grapePhase=T>=B(16);const refuse=T>=B(18);const effort=T>=B(20);
  // monkey A: satisfied (warm) → cools when the neighbour gets grape → ice when it refuses
  const coolA=lerp(0,.35,eio(pr(T,B(16)+.5,B(17))))+lerp(0,.45,eio(pr(T,B(18),B(18)+.8)))+lerp(0,.2,eio(pr(T,B(20)+.5,B(21))));
  const hA=.72-coolA;const hB=.72+.12*eio(pr(T,B(16)+.6,B(17)));
  let rA=0,eA=0,rB=0,eB=0,thr=0;const tA=tok[0],tB=tok[1];tA.visible=tB.visible=false;cA.g.visible=cB.g.visible=false;grape.visible=false;
  if(c){const u=c.u;const out=eio(cl(u/.25)),inn=eio(cl((u-.3)/.35)),eat=eio(cl((u-.72)/.2));
   // A
   if(!refuse){rA=out*(1-inn)+inn*(1-eat);eA=eat;const hand=V3(mA.g.position.x+.44,mA.g.position.y+.2,mA.g.position.z+.06);
    tA.visible=u<.3;tA.position.copy(hand.clone().lerp(slot(0),out));
    cA.g.visible=u>.3;cA.g.position.copy(slot(0).lerp(hand,inn));if(eat>0)cA.g.position.lerp(V3(mA.g.position.x+.2,mA.g.position.y+.52,mA.g.position.z+.05),eat);cA.g.scale.setScalar(1-.7*eat);}
   else{ // refuse: takes the cucumber on beat 2, throws it out of the cage on beat 3
    const k=(T-B(18))/2.0248;const kk=k%1;const nth=Math.floor(k);
    tA.visible=kk<.3;const hand=V3(mA.g.position.x+.44,mA.g.position.y+.2,mA.g.position.z+.06);tA.position.copy(hand.clone().lerp(slot(0),eio(cl(kk/.25))));
    const inn2=eio(cl((kk-.3)/.2));thr=cl((kk-.55)/.25);rA=inn2*(1-thr);
    cA.g.visible=kk>.3;if(thr<=0)cA.g.position.copy(slot(0).lerp(hand,inn2));else{const s=cl(thr*1.6);cA.g.position.set(lerp(hand.x,hand.x-1.2,s),hand.y+Math.sin(Math.PI*s)*.9-(s>.9?0:0),lerp(hand.z,hand.z+1.4,s));cA.g.rotation.z=s*8;}
    if(effort&&nth>=0){}}
   // B
   const gB=grapePhase;if(!effort){rB=out*(1-inn)+inn*(1-eat);tB.visible=u<.3;}else{rB=inn*(1-eat);}
   eB=eat;const handB=V3(mB.g.position.x+.44,mB.g.position.y+.2,mB.g.position.z+.06);tB.position.copy(handB.clone().lerp(slot(1),out));
   const food=gB?grape:cB.g;food.visible=u>.3;food.position.copy(slot(1).lerp(handB,inn));if(eat>0)food.position.lerp(V3(mB.g.position.x+.2,mB.g.position.y+.52,mB.g.position.z+.05),eat);food.scale.setScalar(1-.6*eat);}
  mA.set({heat:hA,reach:rA,eat:eA,turn:refuse?-.5:(grapePhase?-.35*eio(pr(T,B(16)+.4,B(16)+1)):0),slump:pr(T,B(18),B(18)+.6)*.8,throwA:thr});
  mB.set({heat:hB,reach:rB,eat:eB});stash.visible=dish.visible=post.visible=T>=B(16);if(stash.visible)stash.scale.setScalar(1.7*eo(pr(T,B(16),B(16)+.35)));
  setHL([[cages[0].position.x,1.9,-.55,.2,.75],[cages[1].position.x,1.9,-.55,.2+.08*(grapePhase?1:0),.75],[STASH.x,STASH.y,STASH.z,T>=B(16)?.3:0,.4]]);}
 function params(T){const haze=1-eio(pr(T,B(10),B(10)+1.2));const end=eio(pr(T,B(23)+.6,B(24)));return {amb,lo:0,hi:1.15,t:T,shim:1,iso:1,bloom:1,haze:Math.max(haze,end),hazeL:.5};}
 const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
 function hud(T){if(T<B(10)+.8)return '';let h='';
  const v=T<B(18)?95:(T<B(20)?Math.round(lerp(95,60,eo(pr(T,B(18),B(18)+.5)))):Math.round(lerp(60,20,eo(pr(T,B(20),B(20)+.5)))));
  const show=pr(T,B(14),B(14)+.3);const pop=T>=B(18)&&T<B(18)+.4||T>=B(20)&&T<B(20)+.4?1.12:1;
  if(show>0)h+=`<div style="position:absolute;left:96px;top:150px;opacity:${show*(1-pr(T,B(23)+.3,B(23)+.8))}"><div class="t" style="position:static;font-size:40px;color:#fff3d6">愿意完成交换</div><div class="t" style="position:static;font-size:150px;line-height:1.05;color:${v<90?'#7fe8ff':'#FFEC96'};transform:scale(${pop});transform-origin:left center">${v}<span style="font-size:64px">%</span></div></div>`;
  const lab=(x,y,t,c,o)=>{const [sx,sy,z]=pj(V3(x,y,-.05));if(sx<200||sx>1720||sy<150)return '';return z<1?`<div class="t" style="left:${sx}px;top:${sy}px;transform:translate(-50%,-100%);font-size:42px;color:${c};opacity:${o}">${t}</div>`:'';};
  const o=pr(T,B(12),B(12)+.4)*(1-pr(T,B(23),B(23)+.5));
  h+=lab(-.95,1.98,'这只：黄瓜','#ffe1a8',o)+lab(.95,1.98,T<B(16)?'旁边：黄瓜':(T<B(20)?'旁边：葡萄（同样干活）':'旁边：葡萄（啥也不干）'),T<B(16)?'#ffe1a8':'#FFFFFA',o);
  return h+`<div class="src" style="opacity:${o}">Brosnan &amp; de Waal (2003) Nature · 卷尾猴 · 用小石子换食物</div>`;}
 return {scene:S,cam,update,params,hud};}
