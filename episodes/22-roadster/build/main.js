import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {makeCar,DIM} from './car.js';
import {SUN,PAL,skyMat,concreteTex,makeRamp,atS,surf,nrm,SLEN,genericCar,X2,RC,makeHorizon} from './world.js';
import {makeFX} from './fx.js';
const $=id=>document.getElementById(id);
const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(1920,1080);
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;$('gl').appendChild(R.domElement);
const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(38,16/9,.1,3000);
S.fog=new THREE.FogExp2(PAL.haze.clone(),.0026);
const sky=new THREE.Mesh(new THREE.SphereGeometry(1500,48,24),skyMat());S.add(sky);
// env map from the sky (+ a dark ground hemisphere so paint gets a horizon line)
{const es=new THREE.Scene();es.add(new THREE.Mesh(new THREE.SphereGeometry(100,48,24),skyMat()));const gd=new THREE.Mesh(new THREE.CircleGeometry(99,48),new THREE.MeshBasicMaterial({color:'#6b625a'}));gd.rotation.x=-Math.PI/2;gd.position.y=-2;es.add(gd);
 const pm=new THREE.PMREMGenerator(R);S.environment=pm.fromScene(es,.02).texture;}
S.environmentIntensity=.75;
const sunL=new THREE.DirectionalLight('#ffc48e',3.6);sunL.castShadow=true;sunL.shadow.mapSize.set(2048,2048);const sc=sunL.shadow.camera;sc.left=-30;sc.right=30;sc.top=30;sc.bottom=-30;sc.near=1;sc.far=400;sunL.shadow.bias=-.0004;sunL.shadow.normalBias=.04;S.add(sunL);S.add(sunL.target);
const hemi=new THREE.HemisphereLight('#a9c4e6','#7a6658',.5);S.add(hemi);
// ground
const gt=concreteTex([1,1]);gt.repeat.set(160,160);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600),new THREE.MeshStandardMaterial({map:gt,roughness:.9,color:'#a89e93'}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;S.add(ground);
makeHorizon(S);
const ramp=makeRamp();S.add(ramp.g);
const car=makeCar();S.add(car);window.SCENE=S;
const FX=makeFX(S,car);S.userData.cam=cam;
// jump row: generic vehicles side by side across the path at x≈X2+150
const ROWX=X2+168;const row=new THREE.Group();S.add(row);
{const kinds=[['sedan','#c9c6c0'],['pickup','#c4c1bb'],['truck','#cfccc6'],['van','#bdbab4'],['sedan','#b8b5af']];const vs=kinds.map(([k,c])=>genericCar(k,c));
 const tot=vs.reduce((s,v)=>s+v.userData.W,0)+.9*(vs.length-1);let x=-tot/2;for(const v of vs){v.rotation.y=Math.PI/2;v.position.set(ROWX+x+v.userData.W/2,0,0);x+=v.userData.W+.9;row.add(v);}}
// --- post
const comp=new EffectComposer(R);comp.addPass(new RenderPass(S,cam));
comp.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r)||!(c.g==c.g)||!(c.b==c.b))c=vec4(0.);gl_FragColor=vec4(clamp(c.rgb,0.,40.),1.);}`}));
const bloom=new UnrealBloomPass(new THREE.Vector2(960,540),.55,.6,.86);comp.addPass(bloom);window.BLOOM=bloom;
const grade=window.GRADE=new ShaderPass({uniforms:{tDiffuse:{value:null},uVig:{value:.32},uSunUV:{value:new THREE.Vector2(.5,.5)},uRay:{value:.0},uCool:{value:0}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform float uVig,uRay,uCool;uniform vec2 uSunUV;varying vec2 vUv;
 void main(){vec4 c=texture2D(tDiffuse,vUv);
  // light shafts: radial gather of bright pixels toward the sun
  vec3 acc=vec3(0.);vec2 d=(vUv-uSunUV)/48.;vec2 p=vUv;float w=1.;for(int i=0;i<48;i++){p-=d;vec3 s=texture2D(tDiffuse,p).rgb;float sw=exp(-length((p-uSunUV)*vec2(1.78,1.))*7.);acc+=max(s-1.2,0.)*w*sw;w*=.955;}
  c.rgb+=acc*uRay*vec3(1.,.8,.6)/48.*3.;
  // freeze grade: cooler, a touch darker, keeps the glow parts
  float l=dot(c.rgb,vec3(.3,.59,.11));c.rgb=mix(c.rgb,vec3(l)*vec3(.62,.76,1.0)*.62+max(c.rgb-.9,0.)*1.4,uCool);
  float v=smoothstep(1.15,.25,length((vUv-.5)*vec2(1.25,1.)));c.rgb*=mix(1.-uVig,1.,v);gl_FragColor=c;}`});
comp.addPass(grade);comp.addPass(new OutputPass());
// ---- placement helpers
const _m=new THREE.Matrix4();
export function placeOnRamp(s,{roll=0}={}){const c=atS(s);const P=surf(c.a,c.b),N=nrm(c.b);
 // tangent in world: d/ds of surf(a(s),b(s))
 const p2=surf(c.a+c.ta*.01,c.b+c.tb*.01);const T=p2.sub(P).normalize();const Z=new THREE.Vector3().crossVectors(T,N).normalize();const Y=new THREE.Vector3().crossVectors(Z,T);
 // per-wheel suspension: contact points on the true surface
 _m.makeBasis(T,Y,Z);car.quaternion.setFromRotationMatrix(_m);
 const off=[];for(const w of car.userData.wheels){const wa=c.a+c.ta*w.x-c.tb*w.s*DIM.TR,wb=c.b+c.tb*w.x+c.ta*w.s*DIM.TR;const cp=surf(wa,wb);const local=cp.clone().sub(P);off.push(local.dot(Y));}
 const LIFT=.04;const avg=off.reduce((a,b)=>a+b,0)/4;car.position.copy(P).addScaledVector(Y,avg+LIFT);car.userData.wheels.forEach((w,i)=>{w.g.position.y=DIM.R+(off[i]-avg)-LIFT;});
 return {P,T,N:Y,Z};}
export function placeFree(pos,quat,ground=false){car.position.copy(pos);car.quaternion.copy(quat);car.userData.wheels.forEach(w=>w.g.position.y=DIM.R);
 if(ground){// wheels stay on the ground while the body pitches: per-wheel suspension, then lift the body if any wheel would still sink
  const up=new THREE.Vector3(0,1,0).applyQuaternion(quat);let need=0;const ys=car.userData.wheels.map(w=>{const c=new THREE.Vector3(w.x,0,w.s*DIM.TR).applyQuaternion(quat).add(pos);return c.y;});
  car.userData.wheels.forEach((w,i)=>{w.g.position.y=DIM.R-ys[i]/up.y;});}}
// camera helper relative to the car frame
function camRel(fr,off,look,fov){const {P,T,N,Z}=fr;cam.position.copy(P).addScaledVector(T,off[0]).addScaledVector(N,off[1]).addScaledVector(Z,off[2]);
 const L=P.clone().addScaledVector(T,look[0]).addScaledVector(N,look[1]).addScaledVector(Z,look[2]);cam.up.copy(fr.up||new THREE.Vector3(0,1,0));cam.lookAt(L);cam.fov=fov;cam.updateProjectionMatrix();}
function frameOfCar(){const T=new THREE.Vector3(1,0,0).applyQuaternion(car.quaternion),N=new THREE.Vector3(0,1,0).applyQuaternion(car.quaternion),Z=new THREE.Vector3(0,0,1).applyQuaternion(car.quaternion);return {P:car.position.clone(),T,N,Z};}
function sunUV(){const p=cam.position.clone().addScaledVector(SUN,1000).project(cam);return new THREE.Vector2(p.x*.5+.5,p.y*.5+.5);}
function finish(){sunL.position.copy(car.position).addScaledVector(SUN,150);sunL.target.position.copy(car.position);sky.position.copy(cam.position);grade.uniforms.uSunUV.value.copy(sunUV());
 // light shafts only when the sun is actually in front of the lens (a sun behind the camera projects to a jumping point → global flicker)
 const fwd=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion);const k=sm(.55,.85,fwd.dot(SUN));const uv=grade.uniforms.uSunUV.value;const onS=sm(-.35,.0,Math.min(uv.x,uv.y,1-uv.x,1-uv.y));
 const r0=grade.uniforms.uRay.value;grade.uniforms.uRay.value=0*r0*k*onS;comp.render();grade.uniforms.uRay.value=r0;}
// ---- HUD helpers
const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
let H='',SV='';
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const sm=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t);};const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=cl(t);return t*t*t*(t*(t*6-15)+10);};
// pop: 0→1 over .28 s with a small overshoot; out: fade over .3 s
const pop=(T,t0)=>{const u=cl((T-t0)/.28);return u<=0?0:u<1?1.12*Math.sin(u*Math.PI/2)-.12*u*u*u:1;};
const vis=(T,a,b,f=.3)=>sm(a,a+f,T)*(1-sm(b-f,b,T));
function lab(x,y,k,n,u,{cls='',anchor=null,align='left',o=1,s=1}={}){if(o<=0.002)return;const tx=align==='right'?'translate(-100%,0)':align==='center'?'translate(-50%,0)':'';
 H+=`<div class="lab ${cls}" style="left:${x}px;top:${y}px;opacity:${o};transform:${tx} scale(${s});transform-origin:${align==='right'?'right':align==='center'?'center':'left'} 60%"><span class="k">${k}</span><span class="n">${n}</span><span class="u">${u}</span></div>`;
 if(anchor){const [ax,ay,az]=pj(anchor);if(az<1){const lx=align==='right'?x+10:align==='center'?x:x-10;SV+=`<g opacity="${o}"><line x1="${ax}" y1="${ay}" x2="${lx}" y2="${y+40}" stroke="#fff" stroke-width="2.5" opacity=".9"/><circle cx="${ax}" cy="${ay}" r="7" fill="#F6CF78"/></g>`;}}}
function tag(x,y,t,anchor,o=1){if(o<=.002)return;H+=`<div class="tag" style="left:${x}px;top:${y}px;opacity:${o}">${t}</div>`;if(anchor){const [ax,ay,az]=pj(anchor);if(az<1)SV+=`<g opacity="${o}"><line x1="${ax}" y1="${ay}" x2="${x}" y2="${y+22}" stroke="#F6CF78" stroke-width="2" opacity=".95"/><circle cx="${ax}" cy="${ay}" r="5.5" fill="#F6CF78"/></g>`;}}
const W2=v=>v.clone().applyQuaternion(car.quaternion).add(car.position);
import {B,HIT,S_STOP,stateAt,initFlight,initGround,F1,tau} from './traj.js';
// lip pose → flight; ground layout
const LIPP=surf(atS(SLEN).a,atS(SLEN).b);initFlight(LIPP.x,LIPP.y);const G=initGround();
// place the jump row at its true centre
row.children.forEach(v=>v.position.x+=G.ROW_C-ROWX);
const PH=surf(atS(S_STOP).a,atS(S_STOP).b);// hang point on the ceiling
const LINES=[[0.12,3.59,'这车正往一面墙上开'],[3.59,7.07,'墙越来越陡，它还在往上冲'],[7.07,10.54,'直到整辆车[倒过来]'],[10.54,14.01,'然后，它[停]在了天花板上'],
 [17.50,20.97,'停着都不掉，靠的不是速度'],[20.97,24.44,'车底有风扇，把空气[往外抽]'],[24.44,27.91,'车底空气少了，外面的就把它[按住]'],[27.91,31.40,'车底约4㎡，外面空气推着约[40吨]'],[31.40,34.88,'车只有约[2吨]：少约[5%]就够'],
 [34.88,37.04,'然后，它[冲了出去]'],[37.04,40.31,'车里塞满了[高压气瓶]'],[40.31,43.80,'一侧猛喷，车就[翻个身]'],[45.30,48.79,'往下喷，落地前[刹一下]'],[48.79,52.26,'再来：前面停着[一排车]'],[52.26,55.73,'这次，往下[猛喷]'],
 [55.73,59.21,'一边喷，一边在空中[翻转]'],[59.21,62.68,'特斯拉称：推力是抓地力的[4–5倍]'],[62.68,66.17,'还说：0到60英里/时[不到1秒]'],[66.17,69.64,'这些都还[没人实测过]'],
 [69.64,73.11,'会飞的版本：[单座]，受邀才能买'],[73.11,76.59,'也[不能上路]；能飞多久，[没公布]'],[76.59,80.06,'[2028]年，才开始量产'],[80.06,83.53,'最便宜的版本，定金[5万美元]'],[83.53,87.02,'倒挂靠[抽气]，起飞靠[喷气]']];
window.LINES=LINES;
// ---- camera keys: each returns {p,l,u,f}; consecutive keys blend over [a,b]
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),UP=V3(0,1,0);
function carFrame(){const T=V3(1,0,0).applyQuaternion(car.quaternion),N=V3(0,1,0).applyQuaternion(car.quaternion),Z=V3(0,0,1).applyQuaternion(car.quaternion);return {P:car.position.clone(),T,N,Z};}
const rel=(fr,o)=>fr.P.clone().addScaledVector(fr.T,o[0]).addScaledVector(fr.N,o[1]).addScaledVector(fr.Z,o[2]);
let PEND=null;
const KEYS=[
 {a:-1,b:0,fn:T=>{const fr=carFrame();const k=sm(0,10,T);if(window.OVR){const O=window.OVR;return {p:rel(fr,O.o),l:rel(fr,O.l),u:fr.N.clone().lerp(UP,O.u).normalize(),f:46};}const q=ease(sm(0,3.4,T));const p=rel(fr,[lerp(-6.5,-4.5,q)-.6*k,lerp(2.6,2.4,q),lerp(2.5,5.0,q)]),l=rel(fr,[lerp(2.0,1.2,q),.5,0]);
  // roll: follow ~70% of the wall's bank at the start, then level out so the car reads upside down on the ceiling
  const d=l.clone().sub(p).normalize();const u0=UP.clone().addScaledVector(d,-UP.dot(d)).normalize();const nn=fr.N.clone().addScaledVector(d,-fr.N.dot(d)).normalize();
  const ang=Math.acos(cl(u0.dot(nn),-1,1));const f=.7*(1-ease(sm(3.5,9.0,T)));let u=u0.clone().applyAxisAngle(d,ang*f);const u2=u0.clone().applyAxisAngle(d,-ang*f);if(u2.dot(nn)>u.dot(nn))u=u2;
  return {p,l,u,f:46};}},
 {a:9.6,b:13.6,fn:T=>{const d=1.6*sm(13.6,21,T);return {p:PH.clone().add(V3(-14+d,-12.5,-8.5)),l:PH.clone().add(V3(2.5+d*.6,-.6,1)),u:UP,f:40};}},
 {a:19.6,b:23.2,fn:T=>{const d=.9*sm(23,34,T);return {p:PH.clone().add(V3(-1.7+d,-3.6,-6.4)),l:PH.clone().add(V3(.2+d*.5,-1.55,0)),u:UP,f:46};}},
 {a:34.3,b:36.3,fn:T=>{const P=car.position;return {p:P.clone().add(V3(-9,-6.2,-7.4)),l:P.clone().add(V3(2.5,-1.6,0)),u:UP,f:44};}},
 {a:36.9,b:38.4,fn:T=>{const P=car.position;const o=sm(37.4,40.3,T);const ang=-.12+.3*o;const r=8.4;return {p:P.clone().add(V3(-Math.sin(.68+ang)*r*.75,-1.0,-Math.cos(.68+ang)*r)),l:P.clone().add(V3(.25,-.15,0)),u:UP,f:42};}},
 {a:40.6,b:43.6,fn:T=>{const P=car.position;const k=sm(43,47.5,T);return {p:P.clone().add(V3(-8.5,lerp(1.8,1.0,k),-11.5)).setY(Math.max(1.2,P.y+lerp(1.8,1.0,k))),l:P.clone().add(V3(4,.6,0)),u:UP,f:44};}},
 {a:46.6,b:49.0,fn:T=>{const P=car.position;return {p:P.clone().add(V3(-7.2,1.9,-4.2)),l:P.clone().add(V3(5,.7,0)),u:UP,f:46};}},
 {a:51.0,b:51.1,fn:T=>{const P=car.position;const ch={p:P.clone().add(V3(-7.2,1.9,-4.2)),l:P.clone().add(V3(5,.7,0))};
   // the camera settles beside the take-off point: the car charges past it, then it pans with the jump over the row
   const x=lerp(G.X_T-4.5,G.ROW_C-5,ease(sm(54.4,59.4,T)));const rc=V3(x,1.6,-11.5);const lx=lerp(P.x+1.5,lerp(G.ROW_C,P.x,.6),ease(sm(54.0,55.2,T)));const ly=lerp(.8,lerp(3.4,P.y+.6,.6),ease(sm(54.0,55.0,T)));
   const w=ease(sm(51.4,53.9,T));return {p:ch.p.lerp(rc,w),l:ch.l.lerp(V3(lx,ly,0),w),u:UP,f:lerp(46,50,w)};}},
 {a:59.0,b:61.4,fn:T=>{const P=car.position;const lag=3*sm(62.68,63.8,T)*(1-sm(64.5,67.6,T));const o=ease(sm(59.5,68.5,T));return {p:V3(P.x-lerp(7.4,3.2,o)-lag,lerp(1.9,1.3,o),-lerp(4.4,7.0,o)),l:V3(P.x+lerp(5,1.2,o),.75,0),u:UP,f:46};}},
 {a:68.0,b:71.6,fn:T=>{const P=PEND;const d=1.6*sm(70,83.5,T);const up=sm(83.3,87,T);return {p:P.clone().add(V3(-3.6+d-1.5*up,1.0+2.6*up,-7.3-3.2*up)),l:P.clone().add(V3(.6+d*.6,.9+.5*up,0)),u:UP,f:36};}},
];
const _p=V3(0,0,0),_l=V3(0,0,0),_u=V3(0,0,0);
function camAt(T){let i=0;while(i+1<KEYS.length&&T>=KEYS[i+1].a)i++;let c=KEYS[i].fn(T);
 if(i+1<KEYS.length&&T>KEYS[i+1].a-1e-9){}// handled below
 if(i>0&&T<KEYS[i].b){const w=ease((T-KEYS[i].a)/(KEYS[i].b-KEYS[i].a));const c0=KEYS[i-1].fn(T);c={p:c0.p.lerp(c.p,w),l:c0.l.lerp(c.l,w),u:c0.u.lerp(c.u,w).normalize(),f:lerp(c0.f,c.f,w)};}
 return c;}
function applyCam(c){cam.position.copy(c.p);cam.up.copy(c.u);cam.lookAt(c.l);cam.fov=c.f;cam.updateProjectionMatrix();}
// ---- car placement for state
function placeState(st){if(st.mode==='ramp')placeOnRamp(st.s);else placeFree(st.pos,st.quat,!!st.ground);car.userData.wheels.forEach(w=>w.spin.rotation.z=-st.spin);}
{const st=stateAt(89);placeState(st);PEND=car.position.clone();}
// ---- the frame
const sub=t=>{$('sub').innerHTML=t?'<span>'+t.replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';};
function groundLift(st){if(!st.ground)return;car.updateMatrixWorld(true);let mn=1e9;const w=new THREE.Vector3();for(const [o,v] of bodyPts){w.copy(v).applyMatrix4(o.matrixWorld);if(w.y<mn)mn=w.y;}
 const need=.015-mn;if(need>0){car.position.y+=need;const up=new THREE.Vector3(0,1,0).applyQuaternion(car.quaternion);car.userData.wheels.forEach(wh=>wh.g.position.y-=need/up.y);}}
window.renderAt=function(T){H='';SV='';
 const st=stateAt(T);placeState(st);groundLift(st);
 // x-ray / freeze amounts
 const xS=sm(20.97,21.7,T)*(1-sm(34.2,34.88,T)),xF=sm(37.3,37.8,T)*(1-sm(40.31,40.9,T));const xr=Math.max(xS,xF);
 car.userData.setXray(xr);grade.uniforms.uCool.value=.62*xr;grade.uniforms.uRay.value=lerp(.35,.1,xr);
 const bursts=[];const L1=HIT.land1,L2=HIT.land2;
 if(T>L1-.05)bursts.push({pos:V3(car.position.x-(T-L1)*4,0,0).setX(G.X_L1-1),age:T-L1,kind:'frost',n:30});
 if(T>HIT.jump-.05)bursts.push({pos:V3(G.X_T,0,0),age:T-HIT.jump,kind:'frost',n:24});
 if(T>L2-.05)bursts.push({pos:V3(G.X_L2-1,0,0),age:T-L2,kind:'frost',n:26});
 if(T>HIT.halt)bursts.push({pos:car.position.clone().setY(0),age:Math.min(T-HIT.halt,2.5),kind:'smoke',n:10});
 FX.set({suck:xS,arrows:xS*sm(24.2,25.2,T),t:st.t,jets:st.jets,bursts});
 applyCam(camAt(T));
 // ---- HUD
 if(xS>0){const o=xS;tag(1250,180,'风扇把车底的空气往外抽',W2(V3(-1.95,.2,.3)),o*sm(21.4,21.9,T));
  lab(1300,600,'外面的空气 往上推','约40','吨',{anchor:W2(V3(1.2,2.6,.9)),o:o*sm(27.91,28.0,T),s:pop(T,27.91)});
  tag(280,560,'车底约4㎡',W2(V3(.6,.12,-.6)),o*sm(27.91,28.1,T));
  lab(260,250,'车重','约2','吨',{cls:'s',anchor:W2(V3(-.6,.7,0)),o:o*sm(29.65,29.75,T),s:pop(T,29.65)});
  lab(1240,330,'车底空气只要少','约5','%',{cls:'s',o:o*sm(31.40,31.5,T),s:pop(T,31.40)});}
 if(xF>0){const o=xF;lab(1250,140,'据报道 · 压缩空气','600','升',{cls:'s',anchor:W2(V3(-.3,.44,.36)),o:o*sm(38.35,38.45,T),s:pop(T,38.35)});
  lab(250,700,'据报道 · 喷口','10','个',{cls:'s',o:o*sm(39.01,39.1,T),s:pop(T,39.01)});
  car.userData.nozzles.forEach((n,i)=>{const t0=39.01+i*.06;const oo=o*sm(t0,t0+.08,T);if(oo>0){const [x,y,z]=pj(W2(n.p));if(z<1)SV+=`<circle cx="${x}" cy="${y}" r="${13*pop(T,t0)}" fill="none" stroke="#F6CF78" stroke-width="3" opacity="${oo}"/>`;}});}
 // roll arrow at the flip
 {const o=vis(T,40.31,41.6,.2);if(o>0){const [cx,cy]=pj(car.position);SV+=`<g opacity="${o}"><path d="M ${cx-250} ${cy+110} A 270 190 0 0 1 ${cx+240} ${cy+120}" fill="none" stroke="#F6CF78" stroke-width="7" stroke-linecap="round"/><path d="M ${cx+240} ${cy+120} l -36 -6 l 22 -30 z" fill="#F6CF78"/></g>`;}}
 // claims tags
 {const o=vis(T,59.21,66.17,.25);if(o>0)tag(1500,150,'以上均为特斯拉自己的说法',null,o);}
 // version cards
 {const o=vis(T,69.64,83.53,.4);if(o>0){const hi=[T<73.11?2:T<76.59?2:T<80.06?-1:0];const dim=T>=76.59&&T<80.06;
  const C=[['入门版','定金5万美元','不会飞'],['加速版','定金25万美元','只加速喷气'],['会飞版','单座 · 受邀购买','不能上路']];
  H+=`<div style="position:absolute;left:0;right:0;top:120px;display:flex;justify-content:center;gap:28px;opacity:${o*(dim?.35:1)}">`+C.map((c,i)=>{const on=hi[0]===i;return `<div style="width:330px;padding:18px 22px;border-radius:18px;background:rgba(14,20,34,${on?.78:.5});border:2px solid ${on?'#F6CF78':'rgba(255,255,255,.25)'};color:#fff;transform:scale(${on?1.06:1})"><div style="font-size:40px;font-weight:900;color:${on?'#F6CF78':'#fff'}">${c[0]}</div><div style="font-size:28px;font-weight:700;margin-top:6px">${c[1]}</div><div style="font-size:28px;font-weight:700;opacity:.85">${c[2]}</div></div>`;}).join('')+`</div>`;}}
 {const o=vis(T,76.59,80.06,.3);if(o>0)lab(960,330,'才开始量产','2028','年',{align:'center',o,s:pop(T,76.59)});}
 // title plaque
 {const o=vis(T,14.01,17.50,.35);if(o>0)H+=`<div class="plaque" style="top:600px;opacity:${o};transform:scale(${.94+.06*pop(T,14.01)})"><div class="t">倒挂靠<b>抽气</b>，起飞靠<b>喷气</b></div><div class="d">2026.10.15 · 新跑车发布会 · 美国得州</div></div>`;}
 $('hud').innerHTML=`<svg width="1920" height="1080">${SV}</svg>`+H;
 const L=LINES.find(l=>T>=l[0]&&T<l[1]);sub(L?L[2]:'');
 $('end').style.opacity=sm(87.02,87.6,T);
 finish();};
await document.fonts.load('900 60px "Noto Sans CJK SC"');await document.fonts.load('900 60px "Inter Display"');await document.fonts.ready;
// ---- 穿模 checker: returns a list of problems at time T (no rendering)
const bodyPts=(()=>{const out=[];const wheelSet=new Set();car.userData.wheels.forEach(w=>w.g.traverse(o=>wheelSet.add(o)));car.traverse(o=>{if(wheelSet.has(o))return;if(o.isMesh&&o.geometry&&o.visible&&o.material.blending!==THREE.AdditiveBlending&&!o.isInstancedMesh){const p=o.geometry.attributes.position;if(!p)return;const step=Math.max(1,Math.floor(p.count/400));for(let i=0;i<p.count;i+=step)out.push([o,new THREE.Vector3().fromBufferAttribute(p,i)]);}});return out;})();
const rowBoxes=row.children.map(v=>{v.updateMatrixWorld(true);return new THREE.Box3().setFromObject(v);});
window.check=function(T){const st=stateAt(T);placeState(st);groundLift(st);car.updateMatrixWorld(true);const c=camAt(T);const P=c.p;const bad=[];
 const inTube=P.x>-2&&P.x<X2+1;const r=Math.hypot(P.y-RC,P.z);if(inTube&&r>RC-.35&&r<RC+1.8)bad.push('cam-in-wall r='+r.toFixed(2));
 if(P.y<.5)bad.push('cam-low y='+P.y.toFixed(2));
 const cb=new THREE.Box3().setFromObject(car);if(cb.distanceToPoint(P)<.4)bad.push('cam-in-car');
 for(const b of rowBoxes)if(b.distanceToPoint(P)<.5)bad.push('cam-in-row');
 let minR=1e9,minY=1e9,rowHit=0;const w=new THREE.Vector3();
 for(const [o,v] of bodyPts){w.copy(v).applyMatrix4(o.matrixWorld);if(st.mode==='ramp'){const rr=Math.hypot(w.y-RC,w.z);minR=Math.min(minR,RC-rr);}else{minY=Math.min(minY,w.y);for(const b of rowBoxes)if(b.containsPoint(w))rowHit++;}}
 if(st.mode==='ramp'&&minR<-.005)bad.push('car-in-ramp '+minR.toFixed(3));
 if(st.mode!=='ramp'&&minY<-.02)bad.push('car-in-ground '+minY.toFixed(3));
 if(rowHit)bad.push('car-in-row x'+rowHit);
 return {T,bad,clr:st.mode==='ramp'?+minR.toFixed(3):+minY.toFixed(3),cam:[+P.x.toFixed(1),+P.y.toFixed(1),+P.z.toFixed(1)]};};
window.margins=function(){let ramp=1e9,row=1e9,camCar=1e9,camWall=1e9,ground=1e9;const w=new THREE.Vector3();
 for(let f=0;f<=2715;f++){const T=f/30;const st=stateAt(T);placeState(st);groundLift(st);car.updateMatrixWorld(true);const P=camAt(T).p;const cb=new THREE.Box3().setFromObject(car);camCar=Math.min(camCar,cb.distanceToPoint(P));
  if(P.x>-2&&P.x<X2+1){const r=Math.hypot(P.y-RC,P.z);camWall=Math.min(camWall,RC-r);}
  for(const [o,v] of bodyPts){w.copy(v).applyMatrix4(o.matrixWorld);if(st.mode==='ramp')ramp=Math.min(ramp,RC-Math.hypot(w.y-RC,w.z));else{ground=Math.min(ground,w.y);for(const b of rowBoxes)if(w.x>b.min.x&&w.x<b.max.x&&w.z>b.min.z&&w.z<b.max.z)row=Math.min(row,w.y-b.max.y);}}}
 return {ramp,row,camCar,camWall,ground};};
window.stateAt=stateAt;window.G=G;window.camAt=camAt;window.car=car;window.CAMERA=cam;
window.renderAt(0);window.READY=true;
