// WALL 73.2–97.6: Card, Mas, Moretti & Saez (2012). The 2008 pay site as a giant hot list; the camera pulls back: every row is a person
// standing on tiers in pay order. On the big drop (81.375) the median isotherm slams across and a cold front freezes everyone below it.
// Below-median people turn toward a warm doorway (更想跳槽); the upper tiers keep exactly the same heat (并没有更开心).
import {T3 as THREE,heatMat,heatAdd,capsuleBetween,rbox,V3,camPath,setHL} from './thermal.js';
import {FONT} from './kit.js';
import {U} from './util.js';const {pr,eio,eo,lerp,cl}=U;
const B=n=>0.383+2.0248*n, b=n=>0.383+0.5062*n;
export function makeWall(){
 const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(36,16/9,.05,120);S.add(cam);const amb=.1;
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),heatMat({heat:.09,vol:.1,recv:1}));floor.rotation.x=-Math.PI/2;S.add(floor);
 const back=new THREE.Mesh(new THREE.PlaneGeometry(60,20),heatMat({heat:.11,vol:.1,recv:1}));back.position.set(0,8,-7);S.add(back);
 // the list screen behind the tiers
 const NR=24;const screenTex=(()=>{const c=document.createElement('canvas');c.width=1600;c.height=1100;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,1600,1100);g.fillStyle='#fff';g.textAlign='center';g.font=`900 66px ${FONT}`;g.fillText('加州大学 · 员工工资 · 全部可查',800,190);g.font=`700 40px ${FONT}`;g.fillText('2008 · 报纸网站',800,250);g.fillRect(160,275,1280,6);return new THREE.CanvasTexture(c);})();
 const scrM=heatMat({heat:.42,vol:.05,map:screenTex,ink:.32});const scr=new THREE.Mesh(new THREE.PlaneGeometry(8,5.5),scrM);scr.position.set(0,4.2,-6.6);S.add(scr);
 const frame=rbox(8.3,5.8,.12,.08,heatMat({heat:.2,vol:.3}),2);frame.position.set(0,4.2,-6.7);S.add(frame);
 // rows: name stub + pay bar (descending). Rows are hot bars on the screen
 const rows=[];let sd=11;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let i=0;i<NR;i++){const w=lerp(6.2,1.4,Math.pow(i/(NR-1),.8))*(.93+.12*rn());const y=4.2+2.75-1.65-i*.165;const bar=new THREE.Mesh(new THREE.PlaneGeometry(1,.1),heatMat({heat:.95,vol:0}));bar.position.set(-2.4+w/2*0,y,-6.58);S.add(bar);
  const nm=new THREE.Mesh(new THREE.PlaneGeometry(.9,.1),heatMat({heat:.4,vol:0}));nm.position.set(-3.35,y,-6.58);S.add(nm);rows.push({bar,nm,w,y});}
 // tiers of people in pay order (top tier = highest pay). 6 tiers × 10.
 const tierM=heatMat({heat:.16,vol:.3,recv:.9});const NT=6,NP=10;const people=[];
 for(let t=0;t<NT;t++){const y=t*.42,z=-1.0-t*.75;const st=rbox(9.5,.42,.75,.03,tierM,1);st.rotation.x=Math.PI/2;st.position.set(0,y+.21-.21,z);st.scale.set(1,1,1);const step=new THREE.Mesh(new THREE.BoxGeometry(9.5,y+.42,.75),tierM);step.position.set(0,(y+.42)/2,z);S.add(step);
  for(let k=0;k<NP;k++){const x=-4.1+k*.91+(rn()-.5)*.12;const g=new THREE.Group();const mC=heatMat({heat:.62,vol:.42}),mS=heatMat({heat:.75,vol:.45});const s=.95+rn()*.1;
   g.add(capsuleBetween(V3(0,.9*s,0),V3(0,1.32*s,0),.16*s,mC));const hd=new THREE.Mesh(new THREE.SphereGeometry(.105*s,20,14),mS);hd.position.y=1.55*s;g.add(hd);
   for(const zz of [-.08,.08]){g.add(capsuleBetween(V3(0,.88*s,zz*s),V3(0,.06,zz*1.1*s),.06*s,mC));}
   for(const xx of [-.21,.21]){g.add(capsuleBetween(V3(xx*s,1.3*s,0),V3(xx*1.15*s,.92*s,0),.045*s,mC));}
   g.position.set(x,y+.42,z+.1);g.rotation.y=0;S.add(g);people.push({g,mC,mS,t,k,x,rank:t*NP+k,ph:rn()});}}
 const YOU=people.find(p=>p.t===2&&p.k===6);
 // the median isotherm: a thin hot sheet between tier 2 and tier 3
 const medM=heatAdd({heat:0,map:null});const med=new THREE.Mesh(new THREE.PlaneGeometry(12,.06),heatMat({heat:2.2,vol:0}));med.position.set(0,2.98,-2.86);med.visible=false;S.add(med);
 // warm doorway on the right (找新工作)
 const DR=V3(4.9,0,-1.2);const doorM=heatMat({heat:.2,vol:.1,side:THREE.DoubleSide});const door=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2.6),doorM);door.position.copy(DR).setY(1.3);door.rotation.y=-.45;S.add(door);
 {const jm=heatMat({heat:.24,vol:.3});const dx=Math.cos(.45)*.75,dz=Math.sin(.45)*.75;S.add(capsuleBetween(V3(DR.x-dx,0,DR.z-dz),V3(DR.x-dx,2.65,DR.z-dz),.06,jm));S.add(capsuleBetween(V3(DR.x+dx,0,DR.z+dz),V3(DR.x+dx,2.65,DR.z+dz),.06,jm));S.add(capsuleBetween(V3(DR.x-dx,2.65,DR.z-dz),V3(DR.x+dx,2.65,DR.z+dz),.06,jm));}
 const K=[[B(36),.6,4.95,-1.0, .5,4.75,-6.6,44],[B(37)+1.8,.1,4.85,-1.4, .1,4.6,-6.6,44],[B(38),.1,4.85,-1.4, .1,4.6,-6.6,44],[B(39),0,3.3,2.4, 0,2.6,-4.0,40],[B(39)+1.9,0,2.6,4.2, 0,2.0,-3.6,40],
  [B(40)+1.0,0,2.15,5.4, 0,1.9,-3.2,40],[B(42),.4,1.9,5.6, .8,1.5,-2.6,40],[B(43)+1.0,1.6,2.0,6.0, 2.6,1.6,-2.2,40],[B(44),1.5,2.6,6.2, .5,2.4,-3.2,40],[B(46),.8,3.2,7.2, 0,2.2,-3.5,40],[B(47)+.6,3.0,1.8,4.4, 4.9,1.4,-1.2,40],[B(48),4.45,1.4,-.25, 4.9,1.35,-1.2,40]];
 const cp=camPath(K);
 function update(T){const [p,l,f]=cp(T);cam.position.copy(p);cam.lookAt(l);cam.fov=f||36;cam.updateProjectionMatrix();
  const on=pr(T,B(36)+.2,B(37));rows.forEach((r,i)=>{const a=cl(on*28-i*.9);r.bar.scale.x=Math.max(.001,r.w*a);r.bar.position.x=-2.8+r.w*a/2;r.nm.visible=a>0;});
  // scan bar on 77.2–79.3, stops on your row in the gap
  const sc=pr(T,B(38),B(39));const yRow=rows[14].y;
  rows.forEach((r,i)=>{const hit=sc>0&&sc<1?Math.exp(-Math.pow((r.y-lerp(rows[0].y,yRow,eio(sc)))/.12,2)):0;r.bar.material.uniforms.uHeat.value=.72+.45*hit+(T>B(39)&&i===14?.35:0);});
  // the drop: line slams at 81.375; the cold front runs down the tiers over two beats
  med.visible=T>=B(40);med.material.uniforms.uHeat.value=T>=B(40)?2.0+1.2*Math.exp(-(T-B(40))*4):0;med.scale.y=T>=B(40)?1+1.0*Math.exp(-(T-B(40))*5):1;const fr=pr(T,B(40),B(40)+1.0124);
  people.forEach(q=>{const below=q.t<3;let h=.62,hs=.75;
   if(below){const d=cl((fr*3.2)-(2-q.t)*.9-q.ph*.4);h=lerp(.62,-.42,eo(d));hs=lerp(.75,-.3,eo(d));}
   q.mC.uniforms.uHeat.value=h;q.mS.uniforms.uHeat.value=hs;
   q.mC.uniforms.uIce.value=below?cl(fr*3):0;
   // 更想跳槽: the cold ones turn toward the door and drift that way
   const go=below?eio(pr(T,B(42)+q.ph*.8,B(43)+q.ph)):0;q.g.rotation.y=-go*1.1;q.g.position.x=q.x+go*(.5+q.ph*.6);if(below&&T>B(46)){const k=eio(pr(T,B(46)+q.ph*1.2,B(48)));q.g.position.x=lerp(q.g.position.x,DR.x-.3+q.ph*.4,k*(q.t===0?1:.0));q.g.position.z+=k*(q.t===0?(DR.z-q.g.position.z)*.8:0);}});
  doorM.uniforms.uHeat.value=lerp(.2,1.05,eio(pr(T,B(42),B(42)+.6)));
  setHL([[0,4.2,-6.3,.18*on,3.5],[DR.x,1.3,DR.z+.3,.5*pr(T,B(42),B(42)+.6),2.2],[0,2.98,-2.86,T>=B(40)?.18*Math.exp(-(T-B(40))*1.5):0,2.5]]);}
 function params(T){return {amb,lo:0,hi:1.15,t:T,shim:.6,iso:1,bloom:1,flash:0,haze:Math.max(1-eio(pr(T,B(36),B(36)+.9)),eio(pr(T,B(47)+1.2,B(48)))),hazeL:.75};}
 const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
 function hud(T){let h='';const o=pr(T,B(36)+.5,B(37));
  if(T>=B(39)-.2){const [x,y,z]=pj(YOU.g.position.clone().add(V3(0,1.55,0)));const [x2,y2]=pj(YOU.g.position.clone().add(V3(0,1.85,0)));const r=Math.max(18,(y-y2)*1.1);const oo=pr(T,B(39),B(39)+.4);if(z<1)h+=`<div style="position:absolute;left:${x-r}px;top:${y-r}px;width:${2*r}px;height:${2*r}px;border-radius:50%;border:5px solid #F6CF78;box-shadow:0 0 24px #F6CF78,inset 0 0 18px rgba(246,207,120,.6);opacity:${oo}"></div><div class="t" style="left:${x+r+14}px;top:${y-34}px;font-size:56px;color:#F6CF78;opacity:${oo}">你</div>`;}
  if(T>=B(40)){const [x1,y1]=pj(V3(3.2,3.1,-2.86));h+=`<div class="t" style="left:${x1}px;top:${y1-56}px;font-size:46px;color:#FFFFFA;opacity:${pr(T,B(40),B(40)+.25)}">— 中位数</div>`;
   const pp=pr(T,B(40)+.506,B(40)+.62);h+=`<div class="t" style="right:110px;top:600px;font-size:110px;color:#EBFFFF;opacity:${(pp>0?1:0)*(1-pr(T,B(42)-.3,B(42)))};transform:scale(${lerp(1.35,1,eo(pp))});transform-origin:right center;text-shadow:0 0 30px rgba(80,230,255,.9),0 4px 14px rgba(20,10,60,.9)">满意度▼</div>`;}
  if(T>=B(42)){const [x,y,z]=pj(V3(DR.x,3.0,DR.z));if(z<1)h+=`<div class="t" style="left:${x}px;top:${y}px;transform:translate(-50%,-100%);font-size:48px;color:#FFEC96;opacity:${pr(T,B(42)+.3,B(42)+.7)}">找新工作</div>`;}
  if(T>=B(44)&&T<B(46)){const [x,y]=pj(V3(-3.6,3.6,-4.5));h+=`<div class="t" style="left:${x}px;top:${y}px;font-size:46px;color:#FFEC96;opacity:${pr(T,B(44)+.3,B(44)+.7)}">高于中位数 · 满意度 不变</div>`;}
  return h+`<div class="src" style="opacity:${o}">Card, Mas, Moretti &amp; Saez (2012) American Economic Review · 名单为示意</div>`;}
 return {scene:S,cam,update,params,hud};}
