// STREET 97.57–105.67: Luttmer (2005). A night street; your house in the middle keeps exactly the same heat while the neighbours' houses
// heat up one by one. The camera auto-ranges on the hottest house, so yours reads colder (越不快乐). Push through your window → END.
import {T3 as THREE,heatMat,capsuleBetween,rbox,V3,camPath,setHL} from './thermal.js';
import {U} from './util.js';const {pr,eio,eo,lerp,cl}=U;
const B=n=>0.383+2.0248*n;
export function makeStreet(){
 const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(40,16/9,.05,300);S.add(cam);const amb=.2;
 const skyM=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vP;void main(){float y=clamp(vP.y,0.,1.);gl_FragColor=vec4(mix(.2,.03,pow(y,.6)),99.,0.,0.);}`});const sky=new THREE.Mesh(new THREE.SphereGeometry(150,32,16),skyM);S.add(sky);
 const road=new THREE.Mesh(new THREE.PlaneGeometry(200,60),heatMat({heat:.16,vol:.1,recv:1,fog:[16,80]}));road.rotation.x=-Math.PI/2;S.add(road);
 for(let i=-12;i<=12;i++){const d=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.12),heatMat({heat:.28,vol:0}));d.rotation.x=-Math.PI/2;d.position.set(i*2.4,.01,2.2);S.add(d);}
 const curb=rbox(80,.15,1.6,.02,heatMat({heat:.2,vol:.2,recv:1}),1);curb.rotation.x=Math.PI/2;curb.position.set(0,.075,-1.0);S.add(curb);
 let sd=29;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const XS=[-9,-6,-3,0,3,6,9];const houses=XS.map((x,i)=>{const mine=i===3;const w=2.2,h=mine?2.0:1.8+rn()*.5;const wallM=heatMat({heat:.3,vol:.3,recv:.9}),winM=heatMat({heat:.55,vol:0}),roofM=heatMat({heat:.26,vol:.3});
  const g=new THREE.Group();g.position.set(x,0,-3.2);S.add(g);const body=rbox(w,h,2.0,.04,wallM,1);body.position.y=h/2;g.add(body);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.82,.9,4),roofM);roof.position.y=h+.45;roof.rotation.y=Math.PI/4;roof.scale.z=.7;g.add(roof);
  const wins=[];for(const [wx,wy] of [[-.5,h*.62],[.5,h*.62],[-.5,h*.25],[.5,h*.25]]){const wn=new THREE.Mesh(new THREE.PlaneGeometry(.5,.45),winM);wn.position.set(wx,wy,1.01);g.add(wn);wins.push(wn);}
  const door=new THREE.Mesh(new THREE.PlaneGeometry(.45,.8),heatMat({heat:.35,vol:0}));door.position.set(0,.4,1.03);g.add(door);
  const trimM=heatMat({heat:.2,vol:.3,recv:.6});const eave=rbox(w+.5,.08,2.5,.02,trimM,1);eave.rotation.x=Math.PI/2;eave.position.set(0,h+.02,0);g.add(eave);
  for(const [wx,wy] of [[-.5,h*.62],[.5,h*.62],[-.5,h*.25],[.5,h*.25]]){const fr=rbox(.6,.55,.05,.01,trimM,1);fr.position.set(wx,wy,1.0);g.add(fr);const sill=rbox(.7,.05,.12,.01,trimM,1);sill.position.set(wx,wy-.3,1.05);g.add(sill);}
  const dfr=rbox(.6,.9,.05,.01,trimM,1);dfr.position.set(0,.45,1.0);g.add(dfr);
  const chim=rbox(.25,.6,.25,.02,roofM,1);chim.position.set(.55,h+.6,-.2);g.add(chim);
  const step=rbox(.8,.1,.3,.01,trimM,1);step.rotation.x=Math.PI/2;step.position.set(0,.05,1.15);g.add(step);
  return {g,wallM,winM,roofM,mine,x,order:[2,4,1,-1,5,0,6][i]};});
 for(let i=0;i<9;i++){const x=-12+i*3.1;S.add(capsuleBetween(V3(x,0,1.0),V3(x,2.6,1.0),.05,heatMat({heat:.22,vol:.3})));const lp=new THREE.Mesh(new THREE.SphereGeometry(.14,16,12),heatMat({heat:.9,vol:.2}));lp.position.set(x,2.7,1.0);S.add(lp);}
 for(let i=0;i<14;i++){const x=-12+i*1.85+rn()*.4;const t=new THREE.Mesh(new THREE.SphereGeometry(.7+rn()*.4,18,12),heatMat({heat:.22+rn()*.05,vol:.4,recv:.6}));t.position.set(x,2.8+rn(),-5.4);S.add(t);}
 const K=[[B(48),-6.0,2.4,9.5, -3.0,2.0,-3.2,44],[B(50),-1.2,2.3,8.6, 0,2.0,-3.2,44],[B(51),-.3,1.9,5.0, 0,1.6,-3.2,40],[B(52),0,1.24,-1.6, 0,1.24,-2.3,36]];
 const cp=camPath(K);
 function update(T){const [p,l,f]=cp(T);cam.position.copy(p);cam.lookAt(l);cam.fov=f;cam.updateProjectionMatrix();sky.position.copy(p);
  const hl=[];houses.forEach(hs=>{let k=0;if(!hs.mine){k=eo(pr(T,B(48)+.4+hs.order*.506,B(48)+.9+hs.order*.506));}
   const base=hs.mine?.62:.45;hs.wallM.uniforms.uHeat.value=hs.mine?.5:lerp(.34,.88,k);hs.winM.uniforms.uHeat.value=hs.mine?.95:lerp(.55,1.5,k);hs.roofM.uniforms.uHeat.value=hs.mine?.32:lerp(.26,.7,k);
   if(k>0)hl.push([hs.x,1.2,-1.8,.25*k,1.6]);});
  hl.push([0,1.2,-1.8,.18,1.4]);setHL(hl.slice(0,8));}
 function params(T){const hi=lerp(1.0,1.5,eio(pr(T,B(48)+.4,B(49)+1)))+.45*eio(pr(T,B(50),B(50)+.5));const haze=1-eio(pr(T,B(48),B(48)+.8));const out=eio(pr(T,B(52)-.6,B(52)));return {amb,lo:0,hi,t:T,shim:.8,iso:1,bloom:1,haze:Math.max(haze,out),hazeL:.5};}
 const pj=v=>{const p=v.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
 function hud(T){let h='';const lab=(v,t,c,o)=>{const [x,y,z]=pj(v);if(z>1||x<160||x>1760||y<120||o<=0)return '';return `<div class="t" style="left:${x}px;top:${y}px;transform:translate(-50%,-100%);font-size:50px;color:${c};opacity:${o}">${t}</div>`;};
  const o=pr(T,B(48)+.8,B(48)+1.2)*(1-pr(T,B(51)+.6,B(51)+1));
  {const [x,y,z]=pj(V3(0,1.2,-2.1));const [x2,y2]=pj(V3(0,2.6,-2.1));const r=Math.abs(y-y2)*.85;const oo=pr(T,B(48)+.6,B(48)+1.0)*(1-pr(T,B(51)+1.2,B(51)+1.7));if(z<1)h+=`<div style="position:absolute;left:${x-r*1.2}px;top:${y-r}px;width:${2.4*r}px;height:${2*r}px;border-radius:50%;border:5px solid #F6CF78;box-shadow:0 0 24px #F6CF78;opacity:${oo}"></div>`;}
  h+=lab(V3(0,3.5,-2.1),'你家 · 收入不变','#F6CF78',pr(T,B(48)+.6,B(48)+1.0)*(1-pr(T,B(51)+1.2,B(51)+1.7)))+lab(V3(-3.6,3.9,-2.2),'邻居 · 越挣越多 ↑','#FFFFFA',o*pr(T,B(48)+1.4,B(48)+1.8));
  if(T>=B(50))h+=lab(V3(0,4.4,-2.2),'你的快乐 ↓','#EBFFFF',pr(T,B(50),B(50)+.4)*(1-pr(T,B(51)+.6,B(51)+1)));
  return h+`<div class="src" style="opacity:${o}">Luttmer (2005) Quarterly Journal of Economics · 已控制本人收入 · 示意</div>`;}
 return {scene:S,cam,update,params,hud};}
