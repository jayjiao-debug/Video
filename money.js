// Killingsworth, Kahneman & Mellers (2023): gold towers for income levels (each step roughly doubles). A row of people glows brighter tower by tower;
// a second, blue row (the least happy ~20 %) stops getting brighter after $100k.
import {U} from './util.js';
import {stage,glowTex,pool,figure,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeMoney(THREE,R){
 const {S,tickDust}=stage(THREE,{fog:.035});const cam=new THREE.PerspectiveCamera(34,16/9,.05,300);const gt=glowTex(THREE);
 const LV=[['$1.5万',1.5],['$3万',3],['$6万',6],['$10万',10],['$20万',20],['$40万',40]];
 const gold=new THREE.MeshStandardMaterial({color:0xd8a648,metalness:.85,roughness:.32,emissive:0x3a2608,emissiveIntensity:.6});
 const towers=[];const coin=new THREE.CylinderGeometry(.32,.32,.05,32);
 LV.forEach(([lab,v],i)=>{const x=-6.5+i*2.6;const n=Math.max(2,Math.round(v*1.6));const g=new THREE.InstancedMesh(coin,gold,n);const D=new THREE.Object3D();
  for(let k=0;k<n;k++){D.position.set(x+Math.sin(k*1.7)*.015,.025+k*.052,-1.6+Math.cos(k*2.3)*.015);D.rotation.y=k;D.updateMatrix();g.setMatrixAt(k,D.matrix);}S.add(g);towers.push({g,x,n,lab,v});});
 const key=new THREE.SpotLight(0xffe0b0,60,30,.9,.7,1.2);key.position.set(0,9,6);key.target.position.set(0,1,-1);S.add(key);S.add(key.target);
 const rim=new THREE.DirectionalLight(0xa9bde8,.5);rim.position.set(-6,3,-6);S.add(rim);const fill=new THREE.DirectionalLight(0xffe2b0,1.4);fill.position.set(3,5,8);S.add(fill);
 // two rows of people in front of the towers
 const rows=[[0,0xf6cf78,'most'],[1.5,0x8fb0ff,'low']].map(([dz,col,id])=>LV.map((_,i)=>{const x=-6.5+i*2.6;const f=figure(THREE,{h:1.2});f.position.set(x,0,.2+dz);S.add(f);const s=sprite(THREE,gt,col,1.6);s.position.set(x,.8,.15+dz);S.add(s);const pl=pool(THREE,col,.8,0);pl.position.set(x,.012,.2+dz);S.add(pl);return {f,s,pl};}));
 const cp=camPath(THREE,[[64.8,-9.5,2.6,7.4,-4.5,1.3,-1],[69.2,-2.0,3.2,9.4,0,1.5,-1],[73.4,4.0,3.4,9.6,3,1.4,-.5]]);
 function update(T){const [p,l]=cp(T);cam.position.copy(p);cam.lookAt(l);tickDust(T,p.clone().setY(0));
  const grow=pr(T,65.2,67.6);towers.forEach((t,i)=>{const k=cl(grow*LV.length-i);t.g.count=Math.max(1,Math.round(t.n*eo(k)));});
  // brightness by income step (shape illustrative): the main row rises every step; the blue row rises until $10万 then stays flat
  const r1=pr(T,65.6,68.6),r2=pr(T,69.3,71.6);
  rows[0].forEach((o,i)=>{const on=cl(r1*LV.length-i);const b=(.25+.13*i)*on;o.s.material.opacity=b*.8;o.s.scale.setScalar(.8+.22*i*on);o.pl.material.uniforms.I.value=b*.8;});
  rows[1].forEach((o,i)=>{const on=cl(r2*LV.length-i);const lvl=Math.min(i,3);const b=(.2+.11*lvl)*on;o.s.material.opacity=b*.8;o.s.scale.setScalar(.75+.22*lvl*on);o.pl.material.uniforms.I.value=b*.8;o.f.visible=T>69.0;});}
 function hud(T){if(T<64.8||T>73.6)return '';const o=pr(T,65.2,65.7)*(1-pr(T,73.0,73.4));const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
  let h='';towers.forEach((t,i)=>{const [x,y,z]=pj(new THREE.Vector3(t.x,-.02,-1.0));if(z>1||x<-100||x>2020)return;h+=`<div class="t serif" style="left:${x}px;top:${y+6}px;transform:translateX(-50%);font-size:30px;color:${i===3&&T>69.2?'#a9bde8':'#e9c98a'}">${t.lab}</div>`;});
  const lo=pr(T,69.4,69.9);const [lx,ly]=pj(new THREE.Vector3(-6.5+3*2.6,2.4,1.7));
  return `<div style="opacity:${o}">${h}<div class="t" style="left:${lx}px;top:${ly-60}px;transform:translateX(-50%);font-size:30px;color:#a9bde8;opacity:${lo}">到这里，就不再变亮</div>
  <div class="t" style="left:960px;top:892px;transform:translateX(-50%);font-size:22px;color:#7d8597;font-weight:700">Killingsworth, Kahneman &amp; Mellers (2023) PNAS · 年收入 · 亮度为示意</div></div>`;}
 return {scene:S,cam,update,hud};}
