// Shared props for the thermal world: people (faceless, soft forms), phones with ink screens, steam.
import {T3 as THREE,heatMat,heatAdd,blobTex,inkTex,capsuleBetween,rbox,V3} from './thermal.js';
export const BLOB=blobTex();
// a seated person seen from behind / three-quarter; origin at the seat centre, facing -z
export function seatedPerson({skin=.82,cloth=.55,hair:hairH=.62}={}){const g=new THREE.Group();
 const mS=heatMat({heat:skin,vol:.45}),mC=heatMat({heat:cloth,vol:.4}),mH=heatMat({heat:hairH,vol:.5});g.userData.mats=[mS,mC,mH];
 const torso=capsuleBetween(V3(0,.12,0),V3(0,.52,-.02),.17,mC);torso.scale.set(1.15,1,.8);g.add(torso);
 const neck=capsuleBetween(V3(0,.6,-.03),V3(0,.7,-.04),.045,mS);g.add(neck);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.105,32,24),mS);head.position.set(0,.8,-.05);head.scale.set(.92,1.08,1);g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.112,32,24,0,Math.PI*2,0,Math.PI*.55),mH);hair.position.set(0,.81,-.04);hair.rotation.x=.35;hair.scale.set(.95,1.05,1.05);g.add(hair);
 for(const s of [-1,1]){g.add(capsuleBetween(V3(s*.19,.5,-.02),V3(s*.16,.3,-.2),.052,mC));g.add(capsuleBetween(V3(s*.16,.3,-.2),V3(s*.05,.42,-.36),.045,mC));
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.04,16,12),mS);hand.position.set(s*.045,.43,-.37);hand.scale.set(.8,1,1.3);g.add(hand);
  g.add(capsuleBetween(V3(s*.1,.08,0),V3(s*.11,.08,-.42),.075,mC));g.add(capsuleBetween(V3(s*.11,.08,-.42),V3(s*.11,-.38,-.46),.06,mC));}
 return g;}
// standing person (side profile reads direction); origin at feet, facing +x
export function standingPerson({skin=.8,cloth=.5,h=1.7,noArms=false}={}){const g=new THREE.Group();const s=h/1.7;const mS=heatMat({heat:skin,vol:.45}),mC=heatMat({heat:cloth,vol:.4});g.userData.mats=[mS,mC];
 g.add(capsuleBetween(V3(0,.95*s,0),V3(0,1.38*s,0),.17*s,mC));
 const head=new THREE.Mesh(new THREE.SphereGeometry(.11*s,24,18),mS);head.position.set(.015*s,1.6*s,0);g.add(head);
 const nose=new THREE.Mesh(new THREE.SphereGeometry(.03*s,10,8),mS);nose.position.set(.115*s,1.6*s,0);g.add(nose);
 g.add(capsuleBetween(V3(0,1.47*s,0),V3(0,1.52*s,0),.05*s,mS));
 for(const z of [-.09,.09]){g.add(capsuleBetween(V3(0,.9*s,z*s),V3(.02*s,.08*s,z*s),.065*s,mC));if(!noArms)g.add(capsuleBetween(V3(0,1.33*s,z*1.9*s),V3(.04*s,.92*s,z*2.1*s),.045*s,mC));}
 return g;}
// phone: hot body + screen with ink texture (text prints darker)
export function phone({heat=.92,draw=()=>{},w=512,h=1024}={}){const g=new THREE.Group();const body=rbox(.075,.155,.008,.011,heatMat({heat:heat*.8,vol:.3}));g.add(body);
 const tex=inkTex(w,h,draw);const sm=heatMat({heat,vol:.12,map:tex,ink:.62});const scr=new THREE.Mesh(new THREE.PlaneGeometry(.068,.146),sm);scr.position.z=.0075;g.add(scr);g.userData={tex,sm,body};return g;}
export function redraw(tex,fn){const {c,g}=tex.userData;g.fillStyle='#000';g.fillRect(0,0,c.width,c.height);g.fillStyle='#fff';fn(g,c.width,c.height);tex.needsUpdate=true;}
// steam: a column of soft additive heat puffs; returns update(T)
export function steam(parent,{n=26,heat=.16,x=0,y=0,z=0,rise=.9,spread=.06}={}){const ps=[];let sd=7;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),heatAdd({heat,map:BLOB}));parent.add(m);ps.push({m,ph:rn(),sw:rn()*6.28});}
 return (T,cam,k=1)=>ps.forEach(p=>{const u=(T*.32+p.ph)%1;p.m.position.set(x+Math.sin(u*5+p.sw)*spread*(.4+u),y+u*rise,z+Math.cos(u*4+p.sw)*spread*.6);const s=.05+u*.22;p.m.scale.set(s,s,s);p.m.material.uniforms.uHeat.value=heat*k*Math.sin(Math.PI*u)*(1-u*.4);p.m.scale.multiplyScalar(1+.8*(k-1));if(cam)p.m.quaternion.copy(cam.quaternion);});}
export const FONT='"Noto Sans CJK SC",sans-serif';
