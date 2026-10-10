// Solnick & Hemenway (Harvard School of Public Health, 257 people): World A (you 50k, others 25k) vs World B (you 100k, others 200k), same prices.
// 257 small lights walk to the world they pick: 48 % choose A. Then the same question for vacation: 85 % just want more for themselves.
import {U} from './util.js';
import {stage,glowTex,pool,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeWorlds(THREE,R){
 const {S,tickDust,rn}=stage(THREE,{fog:.04});const cam=new THREE.PerspectiveCamera(34,16/9,.05,200);const gt=glowTex(THREE);
 const gold=new THREE.MeshStandardMaterial({color:0xd8a648,metalness:.85,roughness:.32,emissive:0x3a2608,emissiveIntensity:.6}),grey=new THREE.MeshStandardMaterial({color:0x6a7080,metalness:.7,roughness:.4});
 const coin=new THREE.CylinderGeometry(.22,.22,.04,28);
 const tower=(x,z,n,m)=>{const g=new THREE.InstancedMesh(coin,m,Math.max(1,n));const D=new THREE.Object3D();for(let k=0;k<n;k++){D.position.set(x+Math.sin(k*1.7)*.01,.02+k*.042,z+Math.cos(k*2.3)*.01);D.rotation.y=k;D.updateMatrix();g.setMatrixAt(k,D.matrix);}S.add(g);return {g,n};};
 const WA=new THREE.Vector3(-2.6,0,-1),WB=new THREE.Vector3(2.6,0,-1);
 const pedM=new THREE.MeshStandardMaterial({color:0x101218,roughness:.35,metalness:.2});
 for(const p of [WA,WB]){const c=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.55,.16,64),pedM);c.position.copy(p).setY(.08);S.add(c);S.add(Object.assign(pool(THREE,0xffc070,2.2,.45),{}).translateX(p.x).translateY(-p.z));}
 // tower heights: 1 coin = 2.5k
 const TA=[tower(WA.x-.4,WA.z,20,gold),tower(WA.x+.5,WA.z,10,grey)],TB=[tower(WB.x-.5,WB.z,40,gold),tower(WB.x+.5,WB.z,80,grey)];
 // vacation version: glowing day tiles instead of coins (same layout, no numbers)
 const tileM=new THREE.MeshBasicMaterial({color:0x9fd0ff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});const tileG=new THREE.BoxGeometry(.36,.05,.36);
 const tiles=(x,z,n)=>{const g=new THREE.InstancedMesh(tileG,tileM,n);const D=new THREE.Object3D();for(let k=0;k<n;k++){D.position.set(x,.04+k*.07,z);D.updateMatrix();g.setMatrixAt(k,D.matrix);}g.visible=false;S.add(g);return g;};
 const VA=[tiles(WA.x-.4,WA.z,8),tiles(WA.x+.5,WA.z,4)],VB=[tiles(WB.x-.5,WB.z,16),tiles(WB.x+.5,WB.z,32)];
 const key=new THREE.SpotLight(0xffe0b0,60,30,.9,.7,1.2);key.position.set(0,8,6);key.target.position.set(0,1,-1);S.add(key);S.add(key.target);const fill=new THREE.DirectionalLight(0xffe2b0,1.2);fill.position.set(3,5,8);S.add(fill);
 // 257 walkers (lights) from the front toward A or B
 const N=257;const W=Array.from({length:N},(_,i)=>({s:(()=>{const s=sprite(THREE,gt,0xfff0d0,.16);S.add(s);return s;})(),x0:(rn()-.5)*7,z0:3.4+rn()*1.6,a:rn()*6.28,r:Math.sqrt(rn())*1.25,d:rn()*.8,pickA:i<123,pickA2:i<Math.round(N*.15)}));// 123/257 = 47.9 % ≈ 48 %; vacation: 15 % pick the "relative" world, 85 % the larger own amount
 const cp=camPath(THREE,[[48.6,0,4.2,9.0,0,1.2,-1],[53.0,-2.2,2.4,4.6,-2.6,1.0,-1],[57.0,2.2,3.0,5.0,2.6,1.6,-1],[61.1,0,4.6,8.2,0,1.0,-.5],[65.2,0,4.4,8.0,0,1.1,-.6],[69.2,.4,3.8,7.4,0,1.0,-.6],[73.4,.4,4.2,8.6,0,1.0,-.6]]);
 function update(T){const [p,l]=cp(T);cam.position.copy(p);cam.lookAt(l);tickDust(T,new THREE.Vector3(0,0,0));
  const ga=pr(T,53.1,54.8),gb=pr(T,57.1,59.6);const vac=T>65.2;const m=eio(pr(T,65.2,66.0));
  TA.forEach(t=>{t.g.count=Math.max(1,Math.round(t.n*ga*(1-m)));t.g.visible=ga>0&&m<1;});TB.forEach(t=>{t.g.count=Math.max(1,Math.round(t.n*gb*(1-m)));t.g.visible=gb>0&&m<1;});
  [...VA,...VB].forEach(g=>{g.visible=vac;g.count=Math.max(1,Math.round(g.instanceMatrix.count*m));});
  // walk 1 (61.1–64.6): to the chosen world; walk 2 (65.5–69): re-sort for vacation
  const w1=pr(T,61.2,64.4),w2=pr(T,65.8,68.6);
  W.forEach((w,i)=>{const go=eio(cl((w1-w.d*.4)/.6));const tgt1=w.pickA?WA:WB;const tgt2=w.pickA2?WA:WB;const off=new THREE.Vector3(Math.cos(w.a)*w.r,0,Math.sin(w.a)*w.r+1.0);
   const p1=new THREE.Vector3(w.x0,0,w.z0).lerp(tgt1.clone().add(off),go);const go2=eio(cl((w2-w.d*.4)/.6));const p2=p1.clone().lerp(tgt2.clone().add(off),go2);
   w.s.position.set(p2.x,.25+.05*Math.sin(T*3+i),p2.z);w.s.visible=T>60.8;w.s.material.opacity=.9;w.s.material.color.set(vac?0x9fd0ff:0xfff0d0);});}
 function hud(T){if(T<48.6||T>73.6)return '';const o=pr(T,49.2,49.6)*(1-pr(T,73.0,73.4));const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
  const vac=T>65.2;let h='';
  const lab=(v,t,c,op)=>{const [x,y,z]=pj(v);if(z>1||op<=0)return '';return `<div class="t" style="left:${x}px;top:${y}px;transform:translateX(-50%);font-size:28px;color:${c};opacity:${op};text-shadow:0 2px 10px #000">${t}</div>`;};
  if(!vac){h+=lab(new THREE.Vector3(WA.x-.4,.95,WA.z+.3),'你 5万','#F6CF78',pr(T,53.5,54));h+=lab(new THREE.Vector3(WA.x+.5,.6,WA.z+.3),'别人 2.5万','#c9cfdb',pr(T,53.5,54));
   h+=lab(new THREE.Vector3(WB.x-.5,1.8,WB.z+.3),'你 10万','#F6CF78',pr(T,57.5,58));h+=lab(new THREE.Vector3(WB.x+.5,3.5,WB.z+.3),'别人 20万','#c9cfdb',pr(T,57.5,58));}
  else{h+=lab(new THREE.Vector3(WA.x,1.0,WA.z+.3),'你的假期 · 比别人多','#9fd0ff',pr(T,66,66.5));h+=lab(new THREE.Vector3(WB.x,2.6,WB.z+.3),'你的假期 · 更多，但别人更多','#9fd0ff',pr(T,66,66.5));}
  const [ax,ay]=pj(new THREE.Vector3(WA.x,.0,WA.z+1.9)),[bx,by]=pj(new THREE.Vector3(WB.x,0,WB.z+1.9));
  h+=`<div class="t serif" style="left:${ax}px;top:${ay}px;transform:translateX(-50%);font-size:56px;color:#fff">A</div><div class="t serif" style="left:${bx}px;top:${by}px;transform:translateX(-50%);font-size:56px;color:#fff">B</div>`;
  const pa=T<65.2?Math.round(48*eo(pr(T,61.4,64.4))):Math.round(lerp(48,15,eo(pr(T,65.9,68.6))));const showP=pr(T,61.3,61.7);
  h+=`<div style="position:absolute;left:120px;top:150px;opacity:${showP}"><div class="lbl" style="position:static">${vac?'换成假期 · 选 A 的人':'选 A 的人'}</div><div class="t serif" style="position:static;font-size:120px;color:${vac?'#9fd0ff':'#F6CF78'};line-height:1.1">${pa}<span style="font-size:48px">%</span></div>${vac&&T>68?`<div style="font-size:32px;font-weight:900;color:#fff;margin-top:8px">85% 只要自己的假期更多</div>`:''}</div>`;
  h+=`<div class="t" style="left:960px;top:892px;transform:translateX(-50%);font-size:22px;color:#7d8597;font-weight:700">Solnick &amp; Hemenway (1998) · 哈佛公共卫生学院 257 人 · 物价相同 · 塔高按比例</div>`;
  return `<div style="opacity:${o}">${h}</div>`;}
 return {scene:S,cam,update,hud};}
