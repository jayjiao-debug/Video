// Hill & Turiano (2014): 14 lamps for 14 years along a road. Two groups walk it; the group with a sense of purpose (gold lanterns) keeps more walkers.
// How many fall away is illustrative only; the study reports that purposeful people lived longer over the 14 years.
import {U} from './util.js';
import {stage,glowTex,pool,figure,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makePath(THREE,R){
 const {S,tickDust,rn}=stage(THREE,{fog:.028,dust:400});const cam=new THREE.PerspectiveCamera(34,16/9,.05,300);const gt=glowTex(THREE);
 const postM=new THREE.MeshStandardMaterial({color:0x14151b,roughness:.6,metalness:.4});const lamps=[];
 for(let i=0;i<14;i++){const z=-i*3.2;for(const x of [-2.6,2.6]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,2.6,10),postM);p.position.set(x,1.3,z);S.add(p);const s=sprite(THREE,gt,0xffd08a,.45);s.position.set(x,2.65,z);S.add(s);const pl=pool(THREE,0xffc070,1.6,0);pl.position.set(x,.012,z);S.add(pl);lamps.push({s,pl,i});}}
 const walkers=[];for(const [lane,col,keep] of [[-.9,0xf6cf78,.88],[.9,0x9aa2b4,.72]])for(let k=0;k<14;k++){const f=figure(THREE,{h:.95});S.add(f);const lan=sprite(THREE,gt,col,.28);S.add(lan);walkers.push({f,lan,lane,dx:(rn()-.5)*1.1,dz:rn()*7,drop:rn(),keep,gold:lane<0});}
 const road=new THREE.Mesh(new THREE.PlaneGeometry(4,60),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 v;void main(){float a=exp(-pow((v.x-.5)*3.2,2.))*.10;gl_FragColor=vec4(vec3(1.,.8,.55)*a,1.);}`}));road.rotation.x=-Math.PI/2;road.position.set(0,.011,-24);S.add(road);
 const camZ=T=>-14*pr(T,101.9,108.8)*3.2+1.5;
 function update(T){const zc=camZ(T);const p=new THREE.Vector3(1.6,1.9,zc+6.2);cam.position.copy(p);cam.lookAt(0,.8,zc-6);tickDust(T,p.clone().setY(0));
  const yr=14*pr(T,101.9,108.8);lamps.forEach(o=>{const on=cl(yr-o.i);o.s.material.opacity=.15+.85*on;o.pl.material.uniforms.I.value=.45*on;});
  walkers.forEach((w,i)=>{const z=-yr*3.2+1.5-w.dz;const frac=yr/14;const gone=w.drop<(1-w.keep)*frac;
   const alive=!gone;w.f.position.set(w.lane+w.dx,0,z);w.f.visible=alive&&T>101.4;w.lan.position.set(w.lane+w.dx+.18,.7,z+.05);w.lan.visible=alive&&T>101.4;w.lan.material.opacity=w.gold?1:.35;});}
 function hud(T){if(T<101.2||T>110.2)return '';const o=pr(T,101.7,102.2)*(1-pr(T,109.4,109.9));const yrs=Math.round(14*pr(T,101.9,108.8));
  const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080];};const z=-14*pr(T,101.9,108.8)*3.2+1.5;const [gx,gy]=pj(new THREE.Vector3(-.9,1.6,z)),[nx,ny]=pj(new THREE.Vector3(.9,1.6,z));const d=pr(T,105.8,106.3);
  return `<div style="opacity:${o}"><div style="position:absolute;left:120px;top:150px"><div class="lbl" style="position:static">美国成年人跟踪研究 · MIDUS</div><div class="t serif" style="position:static;font-size:110px;color:#F6CF78;line-height:1.15">第 ${yrs} 年</div></div>
  <div class="t" style="left:${gx}px;top:${gy-40}px;transform:translateX(-50%);font-size:30px;color:#F6CF78;opacity:${d}">人生有目标</div><div class="t" style="left:${nx}px;top:${ny-40}px;transform:translateX(-50%);font-size:30px;color:#c9cfdb;opacity:${d}">目标感低</div>
  <div class="t" style="left:960px;top:892px;transform:translateX(-50%);font-size:22px;color:#7d8597;font-weight:700">Hill &amp; Turiano (2014) Psychological Science · 已控制其他幸福感指标 · 人数为示意</div></div>`;}
 return {scene:S,cam,update,hud};}
