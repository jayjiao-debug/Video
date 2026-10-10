// Card, Mas, Moretti & Saez (2012): in 2008 a newspaper website listed University of California pay. A wall of anonymous pay bars with a median line.
// People below the line dim and turn toward a glowing exit (more likely to look for a new job); people above it do not get any brighter.
import {U} from './util.js';
import {stage,glowTex,pool,figure,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeWall(THREE,R){
 const {S,tickDust,rn}=stage(THREE,{fog:.035});const cam=new THREE.PerspectiveCamera(34,16/9,.05,200);const gt=glowTex(THREE);
 // the wall: 28 rows of bars, sorted by pay, median line in the middle
 const NB=28;const bars=[];const barM=i=>new THREE.MeshBasicMaterial({color:0xf6cf78,transparent:true,opacity:.0,blending:THREE.AdditiveBlending,depthWrite:false});
 const back=new THREE.Mesh(new THREE.PlaneGeometry(7.6,5.0),new THREE.MeshStandardMaterial({color:0x07080c,roughness:.9}));back.position.set(0,2.9,-3);S.add(back);
 for(let i=0;i<NB;i++){const w=lerp(5.8,1.2,Math.pow(i/(NB-1),.8))*(.92+.16*rn());const m=new THREE.Mesh(new THREE.PlaneGeometry(1,.1),barM(i));m.scale.x=w;m.position.set(-3.4+w/2,5.1-i*.16,-2.98);S.add(m);bars.push({m,w,below:i>=NB/2});}
 const med=new THREE.Mesh(new THREE.PlaneGeometry(7.2,.02),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}));med.position.set(0,5.1-(NB/2-.5)*.16,-2.97);S.add(med);
 // scanning light (someone looking colleagues up)
 const scan=new THREE.Mesh(new THREE.PlaneGeometry(7.4,.22),new THREE.MeshBasicMaterial({color:0xfff2d0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));scan.position.z=-2.96;S.add(scan);
 // people on the floor: left group above the median, right group below
 const ppl=[];for(let i=0;i<16;i++){const below=i>=8;const f=figure(THREE,{h:1.05});const x=(below?.6:-3.4)+(i%4)*.75+(rn()-.5)*.2,z=.6+Math.floor((i%8)/4)*.9+(rn()-.5)*.2;f.position.set(x,0,z);S.add(f);const s=sprite(THREE,gt,0xffd9a0,.9);s.position.set(x,.7,z-.05);S.add(s);ppl.push({f,s,below,x,z,ph:rn()});}
 // the exit door glow on the right
 const door=new THREE.Mesh(new THREE.PlaneGeometry(1.0,2.2),new THREE.MeshBasicMaterial({color:0x9fd0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));door.position.set(4.6,1.1,.4);door.rotation.y=-1.0;S.add(door);
 const key=new THREE.SpotLight(0xffe0b0,40,30,.9,.7,1.2);key.position.set(0,7,6);key.target.position.set(0,1,0);S.add(key);S.add(key.target);
 const cp=camPath(THREE,[[72.8,0,2.6,9.6,0,3.0,-3],[77.2,-1.2,2.2,7.6,-.6,2.6,-3],[81.4,.6,1.9,7.4,.4,1.6,-1],[85.4,2.6,1.8,6.0,2.2,1.0,0],[89.5,-2.4,1.9,6.4,-1.8,1.2,0],[93.5,0,3.0,9.2,0,2.0,-1],[97.9,0,3.2,9.6,0,2.0,-1]]);
 function update(T){const [p,l]=cp(T);cam.position.copy(p);cam.lookAt(l);tickDust(T,new THREE.Vector3(0,0,0));
  const on=pr(T,73.4,75.2);const hit=T>81.4;const k=eio(pr(T,81.4,82.6));
  bars.forEach((b,i)=>{const a=cl(on*NB*1.2-i);b.m.material.opacity=.55*a;b.m.material.color.set(b.below&&hit?new THREE.Color(0xf6cf78).lerp(new THREE.Color(0x6f86c0),k):0xf6cf78);});
  med.material.opacity=.7*pr(T,79.6,80.4);
  const sc=pr(T,77.3,81.0);scan.material.opacity=sc>0&&sc<1?.35:0;scan.position.y=5.1-((sc*3)%1)*NB*.16;
  const job=eio(pr(T,85.5,87.5));door.material.opacity=.5*pr(T,85.4,86.2)*(1-pr(T,96.8,97.6));
  ppl.forEach(o=>{if(o.below){o.s.material.opacity=lerp(.5,.18,k);o.s.material.color.set(new THREE.Color(0xffd9a0).lerp(new THREE.Color(0x8fa6d8),k));
    o.f.rotation.y=lerp(0,-1.3,job);o.f.position.x=o.x+.35*job*(1+o.ph);o.s.position.x=o.f.position.x;}
   else{o.s.material.opacity=.5;}});
  // above-median people: no change at all, a gentle pulse only on 89.5 to point at them
  const look=pr(T,89.6,90.2)*(1-pr(T,93.2,93.6));ppl.forEach(o=>{if(!o.below)o.s.scale.setScalar(.9+.15*look*Math.sin(T*6));});}
 function hud(T){if(T<72.8||T>97.9)return '';const o=pr(T,73.3,73.8)*(1-pr(T,97.2,97.7));const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
  const [mx,my]=pj(new THREE.Vector3(3.8,5.1-(NB/2-.5)*.16,-2.9));const [ax,ay]=pj(new THREE.Vector3(-2.3,1.6,1.0)),[bx,by]=pj(new THREE.Vector3(1.7,1.6,1.0)),[dx,dy]=pj(new THREE.Vector3(4.6,2.5,.4));
  return `<div style="opacity:${o}"><div class="t" style="left:${mx}px;top:${my-46}px;font-size:28px;color:#fff;opacity:${pr(T,79.6,80.4)}">中位数</div>
  <div class="t" style="left:${ax}px;top:${ay-40}px;transform:translateX(-50%);font-size:30px;color:#F6CF78;opacity:${pr(T,81.6,82.2)}">高于中位数</div><div class="t" style="left:${bx}px;top:${by-40}px;transform:translateX(-50%);font-size:30px;color:#a9bde8;opacity:${pr(T,81.6,82.2)}">低于中位数</div>
  <div class="t" style="left:${dx}px;top:${dy-50}px;transform:translateX(-50%);font-size:30px;color:#9fd0ff;opacity:${pr(T,85.6,86.2)*(1-pr(T,96.8,97.4))}">找新工作</div>
  <div class="t" style="left:960px;top:892px;transform:translateX(-50%);font-size:22px;color:#7d8597;font-weight:700">Card, Mas, Moretti &amp; Saez (2012) American Economic Review · 加州大学员工 · 名单为示意</div></div>`;}
 return {scene:S,cam,update,hud};}
