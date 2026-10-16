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
const car=makeCar();S.add(car);
const FX=makeFX(S,car);S.userData.cam=cam;
// jump row: generic vehicles side by side across the path at x≈X2+150
const ROWX=X2+168;const row=new THREE.Group();S.add(row);
{const kinds=[['sedan','#c9c6c0'],['van','#bdbab4'],['pickup','#c4c1bb'],['sedan','#b8b5af'],['truck','#cfccc6'],['sedan','#c0bdb7']];let z=-9;
 let x=0;for(const [k,c] of kinds){const v=genericCar(k,c);v.rotation.y=Math.PI/2;v.position.set(ROWX-7+x+v.userData.W/2,0,0);x+=v.userData.W+.8;row.add(v);}}
// --- post
const comp=new EffectComposer(R);comp.addPass(new RenderPass(S,cam));
const bloom=new UnrealBloomPass(new THREE.Vector2(960,540),.55,.6,.86);comp.addPass(bloom);
const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},uVig:{value:.32},uSunUV:{value:new THREE.Vector2(.5,.5)},uRay:{value:.0},uCool:{value:0}},
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
 const avg=off.reduce((a,b)=>a+b,0)/4;car.position.copy(P).addScaledVector(Y,avg);car.userData.wheels.forEach((w,i)=>{w.g.position.y=DIM.R+(off[i]-avg);});
 return {P,T,N:Y,Z};}
export function placeFree(pos,quat){car.position.copy(pos);car.quaternion.copy(quat);car.userData.wheels.forEach(w=>w.g.position.y=DIM.R);}
// camera helper relative to the car frame
function camRel(fr,off,look,fov){const {P,T,N,Z}=fr;cam.position.copy(P).addScaledVector(T,off[0]).addScaledVector(N,off[1]).addScaledVector(Z,off[2]);
 const L=P.clone().addScaledVector(T,look[0]).addScaledVector(N,look[1]).addScaledVector(Z,look[2]);cam.up.copy(fr.up||new THREE.Vector3(0,1,0));cam.lookAt(L);cam.fov=fov;cam.updateProjectionMatrix();}
function frameOfCar(){const T=new THREE.Vector3(1,0,0).applyQuaternion(car.quaternion),N=new THREE.Vector3(0,1,0).applyQuaternion(car.quaternion),Z=new THREE.Vector3(0,0,1).applyQuaternion(car.quaternion);return {P:car.position.clone(),T,N,Z};}
function sunUV(){const p=cam.position.clone().addScaledVector(SUN,1000).project(cam);return new THREE.Vector2(p.x*.5+.5,p.y*.5+.5);}
function finish(){sunL.position.copy(car.position).addScaledVector(SUN,150);sunL.target.position.copy(car.position);sky.position.copy(cam.position);grade.uniforms.uSunUV.value.copy(sunUV());comp.render();}
// ---- HUD helpers
const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
let H='',SV='';
function hudReset(){H='';SV='';}
function lab(x,y,k,n,u,{cls='',pre='',anchor=null,align='left'}={}){const tx=align==='right'?'translate(-100%,0)':align==='center'?'translate(-50%,0)':'';
 H+=`<div class="lab ${cls}" style="left:${x}px;top:${y}px;transform:${tx}"><span class="k">${k}</span>${pre?`<span class="y">${pre}</span>`:''}<span class="n">${n}</span><span class="u">${u}</span></div>`;
 if(anchor){const [ax,ay]=pj(anchor);const lx=align==='right'?x+10:align==='center'?x:x-10;SV+=`<line x1="${ax}" y1="${ay}" x2="${lx}" y2="${y+40}" stroke="#fff" stroke-width="2.5" opacity=".9"/><circle cx="${ax}" cy="${ay}" r="7" fill="#F6CF78"/>`;}}
function tag(x,y,t,anchor){H+=`<div class="tag" style="left:${x}px;top:${y}px">${t}</div>`;if(anchor){const [ax,ay]=pj(anchor);SV+=`<line x1="${ax}" y1="${ay}" x2="${x}" y2="${y+22}" stroke="#F6CF78" stroke-width="2" opacity=".95"/><circle cx="${ax}" cy="${ay}" r="5.5" fill="#F6CF78"/>`;}}
function sub(t){$('sub').innerHTML=t?'<span>'+t.replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';}
function hudFlush(extra=''){$('hud').innerHTML=`<svg width="1920" height="1080">${SV}</svg>`+H+extra;}
const W2=v=>v.clone().applyQuaternion(car.quaternion).add(car.position);
function sForPhi(ph){let lo=0,hi=SLEN;for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(atS(mid).b/RC<ph)lo=mid;else hi=mid;}return lo;}
// ---- key frames (pitch stills)
const KF={
 climb(){hudReset();const fr=placeOnRamp(sForPhi(1.05));car.userData.setXray(0);FX.set({});
  camRel({...fr,up:fr.N.clone().lerp(new THREE.Vector3(0,1,0),.45).normalize()},[-7.2,3.0,-.6],[4.5,.2,0],48);grade.uniforms.uRay.value=.6;grade.uniforms.uCool.value=0;
  sub('墙越来越陡，它还在[加速]');hudFlush();finish();},
 hang(){hudReset();const fr=placeOnRamp(SLEN-15);car.userData.setXray(0);FX.set({});cam.up.set(0,1,0);cam.position.copy(fr.P).add(new THREE.Vector3(-14,-12.5,-8.5));cam.lookAt(fr.P.clone().add(new THREE.Vector3(2.5,-.5,1)));cam.fov=40;cam.updateProjectionMatrix();grade.uniforms.uRay.value=.6;grade.uniforms.uCool.value=0;
  sub('');hudFlush(`<div class="plaque" style="top:640px"><div class="t">倒挂靠<b>抽气</b>，起飞靠<b>喷气</b></div><div class="d">2026.10.15 · 新跑车发布会 · 美国得州</div></div>`);finish();},
 suck(){hudReset();const fr=placeOnRamp(SLEN-15);car.userData.setXray(1);FX.set({suck:1,t:3.3,fr});cam.up.set(0,1,0);cam.position.copy(fr.P).add(new THREE.Vector3(-1.6,-3.6,-6.4));cam.lookAt(fr.P.clone().add(new THREE.Vector3(.2,-1.55,0)));cam.fov=46;cam.updateProjectionMatrix();grade.uniforms.uRay.value=.15;grade.uniforms.uCool.value=.62;
  finish();lab(1300,610,'外面的空气 往上推','约40','吨',{anchor:W2(new THREE.Vector3(1.2,2.6,.9))});lab(260,250,'车重','约2','吨',{cls:'s',anchor:W2(new THREE.Vector3(-.6,.7,0))});
  tag(1250,180,'车底约4㎡ · 风扇把空气往外抽',W2(new THREE.Vector3(-2.0,.15,.2)));sub('车底只要比外面少约[5%]的空气');hudFlush();},
 flip(){hudReset();const p=new THREE.Vector3(X2+18,13,0);const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI*.7,0,-.1));placeFree(p,q);car.userData.setXray(1);FX.set({jets:[[4,1],[6,1]],t:2});
  cam.up.set(0,1,0);cam.position.set(p.x-5.2,p.y-1.0,p.z-6.6);cam.lookAt(p.x+.2,p.y-.1,p.z);cam.fov=42;cam.updateProjectionMatrix();grade.uniforms.uRay.value=.2;grade.uniforms.uCool.value=.58;finish();
  lab(1250,140,'据报道 · 压缩空气','600','升',{cls:'s',anchor:W2(new THREE.Vector3(-.3,.44,.36))});lab(250,720,'据报道 · 喷口','10','个',{cls:'s'});
  for(const n of car.userData.nozzles){const [x,y]=pj(W2(n.p));SV+=`<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#F6CF78" stroke-width="3"/>`;}
  {const [cx,cy]=pj(p);SV+=`<path d="M ${cx-260} ${cy+120} A 280 200 0 0 1 ${cx+250} ${cy+130}" fill="none" stroke="#F6CF78" stroke-width="7" stroke-linecap="round" opacity=".95"/><path d="M ${cx+250} ${cy+130} l -36 -6 l 22 -30 z" fill="#F6CF78"/>`;}
  sub('一侧猛喷，车就[翻个身]');hudFlush();},
 jump(){hudReset();const p=new THREE.Vector3(ROWX+1.2,6.4,0);const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI*.38,0,.1));placeFree(p,q);car.userData.setXray(0);FX.set({jets:[[0,.4],[1,.4],[2,.4],[3,.4],[4,1],[5,1],[6,1],[7,1]],t:1.2,ground:0});
  cam.up.set(0,1,0);cam.position.set(ROWX-3.5,1.6,-13.5);cam.lookAt(ROWX+.6,4.4,0);cam.fov=50;cam.updateProjectionMatrix();grade.uniforms.uRay.value=.7;grade.uniforms.uCool.value=0;finish();
  sub('往下猛喷，[跳]过一排车');hudFlush();},
 y2028(){hudReset();const p=new THREE.Vector3(ROWX+60,0,0);placeFree(p,new THREE.Quaternion());car.userData.setXray(0);FX.set({});
  cam.up.set(0,1,0);cam.position.set(p.x-3.5,1.0,p.z-7.2);cam.lookAt(p.x+.6,.9,p.z);cam.fov=36;cam.updateProjectionMatrix();grade.uniforms.uRay.value=.9;grade.uniforms.uCool.value=0;finish();
  lab(960,160,'才开始量产','2028','年',{align:'center'});sub('定金[5万美元]起，会飞的那版[只邀请购买]');hudFlush();},
};
await document.fonts.load('900 60px "Noto Sans CJK SC"');await document.fonts.load('900 60px "Inter Display"');await document.fonts.ready;
window.KF=KF;window.renderKF=n=>{KF[n]();};window.READY=true;
