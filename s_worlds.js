// WORLDS 48.98–73.27: Solnick & Hemenway (1998). A cold night sky over a warm plain; two plateaus, World A and World B, each a small town.
// Coin towers rise (heights ∝ income): A you 5万 vs others 2.5万, B you 10万 vs others 20万. Through the 满意度 camera the tower that is
// ahead of its neighbour glows hot. 257 people walk: 123 (48 %) choose A. Then vacation tiles: 85 % take the world with more for themselves.
// Then the tiles cool and only the coins re-ignite (钱上最爱比); the camera pushes into your coin stack (hot stripes → the 2008 pay list).
import {T3 as THREE,heatMat,capsuleBetween,rbox,V3,camPath,setHL} from './thermal.js';
import {FONT} from './kit.js';
import {U} from './util.js';const {pr,eio,eo,lerp,cl}=U;
const B=n=>0.383+2.0248*n, b=n=>0.383+0.5062*n;
export function makeWorlds(){
 const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(40,16/9,.05,300);S.add(cam);const amb=.16;
 // sky dome: cold (ice) at the zenith, warmer toward the horizon
 const skyM=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vP;void main(){float y=clamp(vP.y,0.,1.);float h=mix(.2,-.55,pow(y,.6));gl_FragColor=vec4(h,99.,0.,0.);}`});
 const sky=new THREE.Mesh(new THREE.SphereGeometry(150,32,16),skyM);S.add(sky);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),heatMat({heat:.2,vol:.1,recv:1,fog:[18,90],amb:.16}));ground.rotation.x=-Math.PI/2;S.add(ground);
 let sd=17;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const PA=V3(-3.2,0,0),PB=V3(3.2,0,0);
 const plat=(p)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.5,.3,64),heatMat({heat:.26,vol:.3,recv:1}));m.position.copy(p).setY(.15);S.add(m);
  // a small town at the back of each plateau
  for(let i=0;i<7;i++){const a=Math.PI*(1.15+i*.1),r=1.75;const w=.32+rn()*.2,h=.35+rn()*.45;const hm=heatMat({heat:.3+rn()*.08,vol:.3,recv:.8});const hs=rbox(w,h,.32,.02,hm,1);hs.position.set(p.x+Math.cos(a)*r,.3+h/2,p.z+Math.sin(a)*r);S.add(hs);
   const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.75,.22,4),hm);roof.position.set(hs.position.x,.3+h+.11,hs.position.z);roof.rotation.y=Math.PI/4;S.add(roof);
   for(let k=0;k<2;k++){const wn=new THREE.Mesh(new THREE.PlaneGeometry(.07,.08),heatMat({heat:.8,vol:0}));wn.position.set(hs.position.x+(k-.5)*w*.45,.3+h*.55,hs.position.z+.165);S.add(wn);}}};
 plat(PA);plat(PB);
 // coin towers: InstancedMesh stacks
 const coinG=new THREE.CylinderGeometry(.26,.26,.045,40);
 const tower=(x,z,n,heat)=>{const m=heatMat({heat,vol:.45,rim:.08});const im=new THREE.InstancedMesh(coinG,m,n);const D=new THREE.Object3D();for(let k=0;k<n;k++){D.position.set(x+Math.sin(k*1.7)*.012,.3+.0225+k*.05,z+Math.cos(k*2.3)*.012);D.rotation.y=k;D.updateMatrix();im.setMatrixAt(k,D.matrix);}im.count=0;im.frustumCulled=false;S.add(im);return {im,m,n,x,z};};
 const tw={aY:tower(PA.x-.45,.2,20,1.0),aO:tower(PA.x+.45,.2,10,.5),bY:tower(PB.x-.45,.2,40,.55),bO:tower(PB.x+.45,.2,80,1.05)};
 // vacation tiles (same proportions, illustrative)
 const tileG=new THREE.BoxGeometry(.5,.07,.5);
 const tiles=(x,z,n,heat)=>{const m=heatMat({heat,vol:.3});const im=new THREE.InstancedMesh(tileG,m,n);const D=new THREE.Object3D();for(let k=0;k<n;k++){D.position.set(x,.3+.035+k*.11,z);D.rotation.y=k*.15;D.updateMatrix();im.setMatrixAt(k,D.matrix);}im.count=0;im.frustumCulled=false;S.add(im);return {im,m,n};};
 const tl={aY:tiles(PA.x-.45,.2,10,.95),aO:tiles(PA.x+.45,.2,5,.5),bY:tiles(PB.x-.45,.2,20,.95),bO:tiles(PB.x+.45,.2,40,.75)};
 // 257 people (instanced bodies + heads), start on the plain in front
 const N=257;const bodyM=heatMat({heat:.62,vol:.45}),headM=heatMat({heat:.74,vol:.45});
 const bodies=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.06,.22,4,8),bodyM,N),heads=new THREE.InstancedMesh(new THREE.SphereGeometry(.055,10,8),headM,N);bodies.frustumCulled=heads.frustumCulled=false;S.add(bodies);S.add(heads);
 const P=Array.from({length:N},(_,i)=>{const x0=(rn()-.5)*5.2,z0=2.2+rn()*2.2;const toA=i<123,toA2=i<39;const ang=rn()*6.28,rr=.6+Math.sqrt(rn())*1.3;return {x0,z0,toA,toA2,ang,rr,d:rn(),ph:rn()};});
 const D=new THREE.Object3D();
 const K=[[B(24),PA.x-.45,1.5,1.4, PA.x-.45,.6,0,30],[B(24)+1.6,0,3.6,9.5, 0,1.2,0,40],[B(26),0,3.6,9.4, 0,1.2,0,40],[B(26)+1.3,PA.x+.6,2.2,4.6, PA.x,1.0,0,40],[B(28),PA.x+.7,2.25,4.5, PA.x,1.0,0,40],
  [B(28)+1.4,PB.x-1.0,3.0,8.8, PB.x,2.3,0,42],[B(30),PB.x-1.05,3.05,8.7, PB.x,2.3,0,42],[B(30)+1.3,0,5.0,11.5, 0,1.7,.8,40],[B(32),0,5.0,11.4, 0,1.7,.8,40],[B(34),0,4.6,10.4, 0,1.7,.6,40],
  [B(35),PA.x-.2,1.3,2.6, PA.x-.45,.85,.2,34],[B(36),PA.x-.43,.85,.7, PA.x-.45,.82,.2,28]];
 const cp=camPath(K);
 function update(T){const [p,l,f]=cp(T);cam.position.copy(p);cam.lookAt(l);cam.fov=f;cam.updateProjectionMatrix();sky.position.copy(p);
  const ga=eo(pr(T,B(26)+.25,B(27)+.5)),gb=eo(pr(T,B(28)+.25,B(29)+.5));const vac=pr(T,B(32),B(32)+1.0124),cool=pr(T,B(34),B(34)+1.0124);
  // the first coin: the white grape-bloom becomes your first coin
  tw.aY.im.count=Math.max(T>=B(24)?1:0,Math.round(20*ga));tw.aO.im.count=Math.round(10*ga);tw.bY.im.count=Math.round(40*gb);tw.bO.im.count=Math.round(80*gb);
  const coinsOn=1-eio(vac)+eio(cool);for(const k in tw){tw[k].im.visible=coinsOn>.02;tw[k].m.uniforms.uHeat.value=({aY:1.0,aO:.5,bY:.55,bO:1.05})[k]*lerp(.3,1,coinsOn)+(k==='aY'&&T<B(25)?.4:0);}
  for(const k in tl){tl[k].im.count=Math.round(tl[k].n*eio(vac));tl[k].im.visible=vac>0&&cool<1;tl[k].m.uniforms.uHeat.value=({aY:.95,aO:.5,bY:.95,bO:.75})[k]*(1-.8*cool);}
  // people: walk to A/B on 61.13, re-sort on 65.18 (vacation)
  const w1=pr(T,B(30)+.2,B(31)+.6),w2=pr(T,B(32)+.5,B(33)+.8);
  P.forEach((q,i)=>{const g1=eio(cl((w1-q.d*.35)/.65)),g2=eio(cl((w2-q.d*.35)/.65));const tA=q.toA?PA:PB,tB=q.toA2?PA:PB;
   const x1=tA.x+Math.cos(q.ang)*q.rr,z1=tA.z+.4+Math.abs(Math.sin(q.ang))*q.rr*.9,x2=tB.x+Math.cos(q.ang)*q.rr,z2=tB.z+.4+Math.abs(Math.sin(q.ang))*q.rr*.9;
   let x=lerp(q.x0,x1,g1),z=lerp(q.z0,z1,g1);x=lerp(x,x2,g2);z=lerp(z,z2,g2);const onP=Math.hypot(x-PA.x,z-PA.z)<2.3||Math.hypot(x-PB.x,z-PB.z)<2.3;
   const y=(onP?.3:0)+Math.abs(Math.sin((w1>0&&w1<1)||(w2>0&&w2<1)?T*9+q.ph*6:0))*.02;
   D.position.set(x,y+.17,z);D.rotation.set(0,0,0);D.updateMatrix();bodies.setMatrixAt(i,D.matrix);D.position.set(x,y+.39,z);D.updateMatrix();heads.setMatrixAt(i,D.matrix);});
  bodies.instanceMatrix.needsUpdate=heads.instanceMatrix.needsUpdate=true;
  setHL([[PA.x-.45,.3+.5*ga,.4,.25*ga*coinsOn,.9],[PB.x+.45,.3+2*gb,.4,.3*gb*coinsOn,1.6],[PA.x,.3,1.0,.1,2.6],[PB.x,.3,1.0,.1,2.6]]);}
 function params(T){const haze=1-eio(pr(T,B(24),B(24)+1.0));const out=eio(pr(T,B(35)+1.2,B(36)));return {amb,lo:-.05,hi:1.15,t:T,shim:.8,iso:1,bloom:1,haze:Math.max(haze,out),hazeL:.8};}
 const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
 function hud(T){let h='';const lab=(v,t,c,o)=>{const [x,y,z]=pj(v);if(z>1||x<160||x>1780||y<120||o<=0)return '';return `<div class="t" style="left:${x}px;top:${y}px;transform:translate(-50%,-100%);font-size:44px;color:${c};opacity:${o}">${t}</div>`;};
  const ga=eo(pr(T,B(26)+.25,B(27)+.5)),gb=eo(pr(T,B(28)+.25,B(29)+.5));const vac=pr(T,B(32),B(32)+1.0124);const lo=1-pr(T,B(31)+1,B(32));
  if(T<B(26)+.2)h+=`<div class="t" style="left:960px;top:130px;transform:translateX(-50%);font-size:48px;color:#FFFFFA;opacity:${pr(T,B(24)+1.2,B(24)+1.7)}">物价完全一样 · 你想住在哪个世界？</div>`;
  h+=lab(V3(PA.x,.3,2.4),'A 世界','#fff',pr(T,B(24)+1.3,B(24)+1.8))+lab(V3(PB.x,.3,2.4),'B 世界','#fff',pr(T,B(24)+1.3,B(24)+1.8));
  h+=lab(V3(PA.x-.45,.3+20*.05*ga+.15,.2),'你 5万','#F6CF78',ga*lo)+lab(V3(PA.x+.45,.3+10*.05*ga+.15,.2),'别人 2.5万','#fff',ga*lo);
  h+=lab(V3(PB.x-.45,.3+40*.05*gb+.15,.2),'你 10万','#F6CF78',gb*lo)+lab(V3(PB.x+.45,.3+80*.05*gb+.15,.2),'别人 20万','#fff',gb*lo);
  if(vac>0)h+=lab(V3(PB.x,.3+40*.11*eio(vac)+.4,.2),'换成：假期','#EBFFFF',pr(T,B(32)+.3,B(32)+.7)*(1-pr(T,B(34),B(34)+.5)));
  if(T>=B(34))h+=lab(V3(PA.x-.45,.3+20*.05+.15,.2),'只有钱，一比就烫','#FFEC96',pr(T,B(34)+.3,B(34)+.7)*(1-pr(T,B(35)+.5,B(35)+1)));
  const pa=T<B(32)?Math.round(48*eo(pr(T,B(30),B(30)+.6))):85;const showP=pr(T,B(30),B(30)+.25)*(1-pr(T,B(34)-.3,B(34)));
  if(showP>0)h+=`<div style="position:absolute;left:96px;top:150px;opacity:${showP}"><div class="t" style="position:static;font-size:40px;color:#fff3d6">${T<B(32)?'选 A 的人':'只要自己假期多的人'}</div><div class="t" style="position:static;font-size:150px;line-height:1.05;color:${T<B(32)?'#FFEC96':'#EBFFFF'}">${pa}<span style="font-size:64px">%</span></div></div>`;
  return h+`<div class="src" style="opacity:${pr(T,B(24)+1.2,B(24)+1.7)}">Solnick &amp; Hemenway (1998) · 哈佛公共卫生学院 257 人 · 塔高按收入比例 · 假期为示意</div>`;}
 return {scene:S,cam,update,params,hud};}
