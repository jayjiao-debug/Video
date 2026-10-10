// Brickman et al. (1978): a jackpot winner and an ordinary person. Gold rains on one; their halos end up the same size; small everyday joys reach the winner dimmer.
import {U} from './util.js';
import {stage,glowTex,pool,figure,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeLotto(THREE,R){
 const {S,tickDust,rn}=stage(THREE,{fog:.05});const cam=new THREE.PerspectiveCamera(34,16/9,.05,200);const gt=glowTex(THREE);
 const A=new THREE.Vector3(-1.3,0,0),B=new THREE.Vector3(1.3,0,0);
 const plM=new THREE.MeshStandardMaterial({color:0x101218,roughness:.35,metalness:.2});
 for(const p of [A,B]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.8,.85,.18,48),plM);c.position.copy(p).setY(.09);S.add(c);}
 const fA=figure(THREE),fB=figure(THREE);fA.position.copy(A).setY(.18);fB.position.copy(B).setY(.18);S.add(fA);S.add(fB);
 const halo=(p,col)=>{const m=new THREE.Mesh(new THREE.RingGeometry(.95,1.0,128),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.copy(p).setY(.19);S.add(m);return m;};
 const hA=halo(A,0xf6cf78),hB=halo(B,0xe9e3d6);
 const back=(p,col)=>{const s=sprite(THREE,gt,col,3.2);s.position.copy(p).setY(1.2).add(new THREE.Vector3(0,0,-.6));S.add(s);return s;};const bA=back(A,0xf6cf78),bB=back(B,0xc9cfdb);
 const sA=new THREE.SpotLight(0xffe2a8,30,9,.38,.6,1.5);sA.position.set(A.x,4,1.5);sA.target.position.copy(A);S.add(sA);S.add(sA.target);
 const sB=new THREE.SpotLight(0xdfe6f2,22,9,.38,.6,1.5);sB.position.set(B.x,4,1.5);sB.target.position.copy(B);S.add(sB);S.add(sB.target);
 // coins (instanced) rain on A and pile up
 const NC=420;const coinM=new THREE.MeshStandardMaterial({color:0xe2b04a,metalness:1,roughness:.28});const coins=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.07,.012,20),coinM,NC);S.add(coins);
 const CB=Array.from({length:NC},()=>({a:rn()*6.28,r:.25+Math.sqrt(rn())*.62,t:rn(),rx:rn()*6,ry:rn()*6,h:rn()}));const D=new THREE.Object3D();
 // small joys: fireflies drifting toward each person
 const NJ=24;const joys=Array.from({length:NJ},(_,i)=>{const s=sprite(THREE,gt,0xffd9a0,.25);S.add(s);return {s,side:i%2,ph:rn(),ang:rn()*6.28};});
 const cp=camPath(THREE,[[52.6,0,1.6,7.2,0,1.0,0],[57.0,-.4,1.4,5.6,-.2,1.0,0],[61.1,.3,2.0,5.0,0,.9,0],[65.6,0,2.6,6.2,0,1.0,0]]);
 function update(T){const [p,l]=cp(T);cam.position.copy(p);cam.lookAt(l);tickDust(T,new THREE.Vector3(0,0,0));
  const rain=pr(T,53.3,56.6);for(let i=0;i<NC;i++){const c=CB[i];const t0=c.t;const k=cl((rain-t0*.7)/.3);const y=k<1?lerp(4.2,.2+.012*Math.floor(c.h*6),eo(k)):.19+.012*Math.floor(c.h*6);
   D.position.set(A.x+Math.cos(c.a)*c.r,k>0?y:-5,A.z+Math.sin(c.a)*c.r);D.rotation.set(k<1?c.rx+T*4:0,k<1?c.ry:c.ry,0);D.updateMatrix();coins.setMatrixAt(i,D.matrix);}coins.instanceMatrix.needsUpdate=true;
  // happiness halo: the same size for both (not happier than controls)
  const spike=0;const coinGlow=pr(T,53.4,54.4)*(1-.6*pr(T,56,57.5));const hs=pr(T,57.0,57.8);const rA=1+.55*spike,rB=1;hA.scale.setScalar(rA);hB.scale.setScalar(rB);hA.material.opacity=Math.max(spike,hs)*.9;hB.material.opacity=hs*.9;
  bA.material.opacity=.25+.35*coinGlow+.2*hs;bB.material.opacity=.25+.2*hs;
  // small joys after 61.1: reach both; at the winner they fade before arriving
  const jo=pr(T,61.2,61.8);joys.forEach((j,i)=>{const ph=((T*.35+j.ph)%1);const tgt=j.side?B:A;const r=lerp(2.6,.25,eo(ph));const pos=new THREE.Vector3(tgt.x+Math.cos(j.ang+ph)*r,1.0+Math.sin(ph*3+i)*.3,tgt.z+Math.sin(j.ang+ph)*r);j.s.position.copy(pos);
   const fade=j.side?1:(1-.85*cl((ph-.35)/.4));j.s.material.opacity=jo*fade*Math.sin(Math.PI*ph);j.s.scale.setScalar(.22+.1*Math.sin(T*5+i));});}
 function hud(T){if(T<52.8||T>65.6)return '';const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080];};const o=pr(T,53.2,53.7)*(1-pr(T,65.0,65.5));
  const [ax,ay]=pj(A.clone().setY(2.15)),[bx,by]=pj(B.clone().setY(2.15));const eq=pr(T,57.6,58.0)*(1-pr(T,60.8,61.2));const [mx,my]=pj(new THREE.Vector3(0,1.0,0));
  return `<div style="opacity:${o}"><div class="t" style="left:${ax}px;top:${ay-50}px;transform:translateX(-50%);font-size:34px;color:#F6CF78">大奖得主</div><div class="t" style="left:${bx}px;top:${by-50}px;transform:translateX(-50%);font-size:34px;color:#e9e3d6">普通人</div>
  <div class="t serif" style="left:${mx}px;top:${my-70}px;transform:translateX(-50%);font-size:110px;color:#fff;opacity:${eq}">≈</div>
  <div class="t" style="left:960px;top:892px;transform:translateX(-50%);font-size:22px;color:#7d8597;font-weight:700">Brickman, Coates &amp; Janoff-Bulman (1978) · 光圈大小为示意</div></div>`;}
 return {scene:S,cam,update,hud};}
