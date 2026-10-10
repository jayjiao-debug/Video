// Small et al. (2001): eat chocolate piece after piece, past being full. Pleasure turns into aversion.
import {U} from './util.js';
import {stage,glowTex,pool,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeChoc(THREE,R){
 const {S,tickDust}=stage(THREE,{fog:.05});const cam=new THREE.PerspectiveCamera(32,16/9,.02,200);const gt=glowTex(THREE);
 const plinth=new THREE.Mesh(new THREE.BoxGeometry(1.4,.9,1.0),new THREE.MeshStandardMaterial({color:0x101218,roughness:.35,metalness:.2}));plinth.position.y=.45;S.add(plinth);
 const foil=new THREE.Mesh(new THREE.PlaneGeometry(.98,.66,30,20),new THREE.MeshStandardMaterial({color:0xd9a845,metalness:1,roughness:.32}));foil.rotation.x=-Math.PI/2;foil.position.y=.905;
 {const p=foil.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,(Math.sin(p.getX(i)*41)*Math.cos(p.getY(i)*37))*.004);foil.geometry.computeVertexNormals();}S.add(foil);
 const chM=new THREE.MeshPhysicalMaterial({color:0x3a2014,roughness:.38,clearcoat:.4,clearcoatRoughness:.35});
 const pieces=[];const NX=4,NZ=4;for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){const m=new THREE.Mesh(new THREE.BoxGeometry(.19,.06,.135,1,1,1),chM);m.position.set(-.3+i*.2,.94,-.21+j*.14);S.add(m);
  const tp=new THREE.Mesh(new THREE.BoxGeometry(.15,.02,.1),chM);tp.position.y=.035;m.add(tp);pieces.push(m);}
 const order=pieces.map((_,k)=>k).sort((a,b)=>((a*7)%16)-((b*7)%16));
 const spot=new THREE.SpotLight(0xffe2b8,70,10,.42,.6,1.4);spot.position.set(.6,3.2,1.2);spot.target.position.set(0,.9,0);S.add(spot);S.add(spot.target);
 const rim=new THREE.DirectionalLight(0xa9bde8,.6);rim.position.set(-3,2,-3);S.add(rim);
 const pl=pool(THREE,0xffc070,2.4,.55);S.add(pl);
 // pleasure gauge: a glass rod with a bead of light; top = 好吃, bottom = 难受
 const rod=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.8,12),new THREE.MeshBasicMaterial({color:0x6a6f80,transparent:true,opacity:.5}));rod.position.set(.95,1.35,0);S.add(rod);
 const zero=new THREE.Mesh(new THREE.BoxGeometry(.14,.006,.006),new THREE.MeshBasicMaterial({color:0xc9cfdb}));zero.position.set(.95,1.35,0);S.add(zero);
 const bead=new THREE.Mesh(new THREE.SphereGeometry(.05,16,12),new THREE.MeshBasicMaterial({color:0xf6cf78}));S.add(bead);const bg=sprite(THREE,gt,0xf6cf78,.22);S.add(bg);
 const T0=40.9,T1=48.6;
 const cp=camPath(THREE,[[36.4,2.6,2.3,3.4,.3,1.05,0],[40.9,1.1,1.6,2.4,.35,1.15,0],[44.9,-.3,1.6,2.4,.45,1.2,0],[48.9,-1.3,1.9,2.9,.35,1.15,0],[53.4,-.6,2.6,4.4,.3,1.1,0]]);
 let gauge=1;
 function update(T){const [p,l]=cp(T);cam.position.copy(p);cam.lookAt(l);tickDust(T,new THREE.Vector3(0,0,0));
  const n=16*pr(T,T0,T1);order.forEach((k,r)=>{const m=pieces[k];const u=cl(n-r);const s=1-eo(u);m.scale.setScalar(Math.max(.001,s));m.position.y=.94+.25*eo(u);m.visible=s>.01;});
  // pleasure falls from very pleasant through neutral to unpleasant as pieces are eaten (shape illustrative)
  const f=pr(T,T0,T1);gauge=f<.5?1-.6*f:(.7-1.5*(f-.5));const y=1.35+.37*cl(gauge,-1,1);bead.position.set(.95,y,0);bg.position.copy(bead.position);
  const c=new THREE.Color(0xf6cf78).lerp(new THREE.Color(0x7d90c0),cl(-gauge*1.6+.2));bead.material.color.copy(c);bg.material.color.copy(c);
  spot.intensity=70*(1-.35*cl(-gauge));rod.visible=bead.visible=bg.visible=zero.visible=T>39.8;}
 function hud(T){if(T<37||T>53.4)return '';const o=pr(T,39.9,40.4)*(1-pr(T,52.6,53.2));if(o<=0)return '';const G='#F6CF78';
  const pr2=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080];};
  const [x1,y1]=pr2(new THREE.Vector3(.95,1.74,0)),[x0,y0]=pr2(new THREE.Vector3(.95,.98,0));
  return `<div style="opacity:${o}"><div class="t" style="left:${x1+20}px;top:${y1-20}px;font-size:32px;color:${G}">好吃</div><div class="t" style="left:${x0+20}px;top:${y0-20}px;font-size:32px;color:#a9bde8">难受</div></div>`;}
 return {scene:S,cam,update,hud};}
