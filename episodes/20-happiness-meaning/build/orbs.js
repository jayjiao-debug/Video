// Baumeister et al. (2013): two orbs of light, 快乐 (rose) and 意义 (gold), mostly overlapping. A weight of stress presses down: meaning swells, happiness shrinks.
// Then particles flow INTO the happiness orb (taking) and OUT of the meaning orb to the people around it (giving).
import {U} from './util.js';
import {stage,glowTex,pool,figure,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeOrbs(THREE,R){
 const {S,tickDust,rn}=stage(THREE,{fog:.045});const cam=new THREE.PerspectiveCamera(34,16/9,.05,200);const gt=glowTex(THREE);
 const orb=(col)=>{const g=new THREE.Group();const core=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{c:{value:new THREE.Color(col)},I:{value:1}},
   vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`uniform vec3 c;uniform float I;varying vec3 vN;varying vec3 vV;void main(){float d=max(dot(vN,vV),0.);float rim=pow(1.-d,2.2);float a=(.18+.9*rim)*I;gl_FragColor=vec4(c*a,1.);}`}));g.add(core);
  const s=sprite(THREE,gt,col,3.4);g.add(s);const l=new THREE.PointLight(col,6,8,1.6);g.add(l);S.add(g);return {g,core,s,l};};
 const H=orb(0xff9a86),M=orb(0xf6c25a);
 const plH=pool(THREE,0xff9a86,2.4,.5),plM=pool(THREE,0xf6c25a,2.6,.5);S.add(plH);S.add(plM);
 // the weight
 const slab=new THREE.Mesh(new THREE.BoxGeometry(5.2,.35,2.4),new THREE.MeshStandardMaterial({color:0x0c0d12,roughness:.6,metalness:.3}));S.add(slab);
 // people around the meaning orb who receive light
 const ring=[];for(let i=0;i<9;i++){const a=-1.2+i*.3;const f=figure(THREE,{h:1.1});f.position.set(1.0+Math.cos(a)*3.4,0,Math.sin(a)*3.4-.5);f.lookAt(1.0,0,-.5);S.add(f);const s=sprite(THREE,gt,0xf6cf78,.9);s.position.copy(f.position).setY(.75);S.add(s);ring.push({f,s});}
 const NP=260;const pts=Array.from({length:NP},(_,i)=>{const s=sprite(THREE,gt,i%2?0xffb4a2:0xf6cf78,.12);S.add(s);return {s,ph:rn(),a:rn()*6.28,y:rn()*1.6-.6,side:i%2,k:i%9};});
 const cp=camPath(THREE,[[89.0,0,2.0,10.4,0,1.8,0],[93.5,-.6,2.2,9.0,0,1.9,0],[97.6,.8,3.0,9.6,.4,1.6,-.3],[101.9,2.4,3.6,10.4,.8,1.4,-.4]]);
 function update(T){const [p,l]=cp(T);cam.position.copy(p);cam.lookAt(l);tickDust(T,new THREE.Vector3(0,0,0));
  const j=eio(pr(T,89.6,91.4)),st=eio(pr(T,93.7,95.8)),fl=pr(T,97.6,98.3);const sep=lerp(4.6,1.5,j);
  const rH=lerp(.95,.65,st),rM=lerp(.95,1.25,st);const yb=1.9;
  H.g.position.set(-sep/2,yb,0);M.g.position.set(sep/2,yb+(rM-1.25)*.3,0);H.core.scale.setScalar(rH);M.core.scale.setScalar(rM);H.s.scale.setScalar(rH*2.6);M.s.scale.setScalar(rM*2.6);
  H.core.material.uniforms.I.value=lerp(1,.55,st);M.core.material.uniforms.I.value=lerp(1,1.35,st);H.s.material.opacity=lerp(.35,.15,st);M.s.material.opacity=lerp(.35,.55,st);H.l.intensity=6*lerp(1,.5,st);M.l.intensity=6*lerp(1,1.6,st);
  plH.position.set(-sep/2,.011,0);plM.position.set(sep/2,.011,0);plH.material.uniforms.I.value=.5*lerp(1,.5,st);plM.material.uniforms.I.value=.5*lerp(1,1.4,st);
  const sl=pr(T,93.5,94.6)*(1-pr(T,97.2,97.8));slab.position.set(0,lerp(7,yb+1.75,eo(sl)),0);slab.visible=sl>0;
  ring.forEach((o,i)=>{const on=fl*cl(pr(T,98.2+i*.15,98.8+i*.15));o.f.visible=T>97.2;o.s.material.opacity=.15+.6*on;o.s.scale.setScalar(.6+.6*on);});
  pts.forEach((q,i)=>{const ph=((T*.45+q.ph)%1);let pos;
   if(q.side){const r=lerp(3.2,.3,eo(ph));pos=new THREE.Vector3(H.g.position.x+Math.cos(q.a)*r,yb+q.y*(r/3.2),Math.sin(q.a)*r);}
   else{const tg=ring[q.k].f.position;const from=M.g.position;pos=from.clone().lerp(new THREE.Vector3(tg.x,.9,tg.z),eo(ph));pos.y+=Math.sin(Math.PI*ph)*.6;}
   q.s.position.copy(pos);q.s.material.opacity=fl*Math.sin(Math.PI*ph)*.9;});}
 function hud(T){if(T<89||T>101.9)return '';const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080];};const o=pr(T,89.6,90.1)*(1-pr(T,101.2,101.7));
  const [hx,hy]=pj(H.g.position.clone().add(new THREE.Vector3(-.5,1.05,0))),[mx,my]=pj(M.g.position.clone().add(new THREE.Vector3(.5,1.45,0)));const hy2=hy-90,my2=my-90;const st=pr(T,93.7,95.8),fl=pr(T,97.7,98.2);
  return `<div style="opacity:${o}"><div class="t serif" style="left:${hx}px;top:${hy2}px;transform:translateX(-50%);font-size:56px;color:#ffb3a0">快乐${st>.3?` <span style="font-size:48px">↓</span>`:''}</div><div class="t serif" style="left:${mx}px;top:${my2}px;transform:translateX(-50%);font-size:56px;color:#F6CF78">意义${st>.3?` <span style="font-size:48px">↑</span>`:''}</div>
  <div class="t" style="left:${hx}px;top:${hy2+70}px;transform:translateX(-50%);font-size:34px;color:#fff;opacity:${fl}">得到</div><div class="t" style="left:${mx}px;top:${my2+70}px;transform:translateX(-50%);font-size:34px;color:#fff;opacity:${fl}">给出</div>
  <div style="position:absolute;left:120px;top:150px;opacity:${pr(T,93.7,94.2)*(1-pr(T,97.2,97.6))}"><div class="lbl" style="position:static">压力 · 担心 · 焦虑</div><div class="t serif" style="position:static;font-size:96px;color:#ff8a7a;line-height:1.15">↑</div></div>
  <div class="t" style="left:960px;top:892px;transform:translateX(-50%);font-size:22px;color:#7d8597;font-weight:700">Baumeister, Vohs, Aaker &amp; Garbinsky (2013) J. Positive Psychology</div></div>`;}
 return {scene:S,cam,update,hud};}
