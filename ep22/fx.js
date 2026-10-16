// Physics made visible. Streaks = camera-facing light ribbons between two points (air molecules in motion).
// Suction: dense blue-white air below pushing up onto the roof, thin amber air in the gap drawn back to the 4 fans and blown out.
// Jets: per nozzle a shock-diamond core + frost streaks + soft frost puffs.
import * as THREE from 'three';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
let SD=3;const rn=()=>(SD=(SD*16807)%2147483647)/2147483647;
function streakSet(scene,n,{blending=THREE.AdditiveBlending,depthTest=true}={}){
 const base=new THREE.PlaneGeometry(1,1);base.translate(0,.5,0);const g=new THREE.InstancedBufferGeometry();g.index=base.index;g.attributes.position=base.attributes.position;g.attributes.uv=base.attributes.uv;
 const A0=new Float32Array(n*3),A1=new Float32Array(n*3),W=new Float32Array(n),C=new Float32Array(n*4);
 g.setAttribute('a0',new THREE.InstancedBufferAttribute(A0,3));g.setAttribute('a1',new THREE.InstancedBufferAttribute(A1,3));g.setAttribute('aw',new THREE.InstancedBufferAttribute(W,1));g.setAttribute('ac',new THREE.InstancedBufferAttribute(C,4));g.instanceCount=n;
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest,blending,uniforms:{},
  vertexShader:`attribute vec3 a0,a1;attribute float aw;attribute vec4 ac;varying vec2 vU;varying vec4 vC;
  void main(){vec3 p0=(modelMatrix*vec4(a0,1.)).xyz,p1=(modelMatrix*vec4(a1,1.)).xyz;vec3 ax=p1-p0;vec3 mid=mix(p0,p1,position.y);vec3 vd=normalize(cameraPosition-mid);
   vec3 sd=normalize(cross(ax+vec3(1e-5),vd));vec3 p=mid+sd*position.x*aw;vU=vec2(position.x*2.,position.y);vC=ac;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
  fragmentShader:`varying vec2 vU;varying vec4 vC;void main(){float a=exp(-vU.x*vU.x*3.5)*smoothstep(0.,.35,vU.y)*smoothstep(1.,.75,vU.y);gl_FragColor=vec4(vC.rgb*vC.a*a,vC.a*a);}`});
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;scene.add(mesh);
 return {mesh,n,set(i,p0,p1,w,r,gg,b,a){A0.set([p0.x,p0.y,p0.z],i*3);A1.set([p1.x,p1.y,p1.z],i*3);W[i]=w;C.set([r,gg,b,a],i*4);},
  clear(){C.fill(0);},flush(){for(const k of ['a0','a1','aw','ac'])g.attributes[k].needsUpdate=true;}};}
function puffTex(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 for(let i=0;i<70;i++){const x=128+(rn()-.5)*110,y=128+(rn()-.5)*110,r=25+rn()*55;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(255,255,255,${.12+rn()*.1})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);}
 const m=g.createRadialGradient(128,128,40,128,128,128);m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(1,'rgba(0,0,0,1)');g.globalCompositeOperation='destination-out';g.fillStyle=m;g.fillRect(0,0,256,256);
 const t=new THREE.CanvasTexture(c);return t;}
export function makeFX(S,car){
 const root=new THREE.Group();S.add(root);
 // world-space sets
 const air=streakSet(S,2600),gap=streakSet(S,900),jetS=streakSet(S,1400);
 const glowSlab=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uK:{value:0},uT:{value:0}},
  vertexShader:`varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uK,uT;varying vec2 vU;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  void main(){vec2 c=vU-.5;float r=length(c*vec2(1.,1.8));float a=smoothstep(.5,.0,r);float nn=n2(vU*vec2(9.,5.)+vec2(0.,-uT*.6))*.6+n2(vU*vec2(23.,11.)-uT*.3)*.4;
   gl_FragColor=vec4(vec3(.35,.75,1.)*a*(.35+.65*nn)*uK*.55,1.);}`}));
 S.add(glowSlab);glowSlab.visible=false;
 // underside footprint (约4㎡): glowing rounded rectangle on the car floor (car-local)
 const fpM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uK:{value:0}},
  vertexShader:`varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uK;varying vec2 vU;void main(){vec2 q=abs(vU-.5)*2.;float e=max(q.x,q.y);float line=smoothstep(.93,.97,e)*smoothstep(1.,.985,e);
   vec2 gr=abs(fract(vU*vec2(9.,4.))-.5);float grid=smoothstep(.47,.5,max(gr.x,gr.y))*.35;gl_FragColor=vec4(vec3(1.,.72,.35)*(line*2.2+grid+.08)*uK,1.);}`});
 const fp=new THREE.Mesh(new THREE.PlaneGeometry(4.0,1.0*1.0),fpM);fp.rotation.x=-Math.PI/2;fp.position.y=.118;fp.scale.set(1,1.8,1);car.add(fp);fp.visible=false;
 // outside-air push: a grid of glass arrows under the roof pointing at the car (gold tips = the few % that matter)
 const arrowG=(()=>{const sh=new THREE.CylinderGeometry(.06,.06,1,16);sh.translate(0,.5,0);return sh;})();const headG=new THREE.ConeGeometry(.17,.36,20);headG.translate(0,.18,0);
 const NA=4*9*3;const arM=new THREE.MeshPhysicalMaterial({color:'#bfeaff',emissive:new THREE.Color('#3fb6ff'),emissiveIntensity:.55,roughness:.15,metalness:.1,clearcoat:1,transparent:true,opacity:.9,depthWrite:false});
 const hdM=new THREE.MeshPhysicalMaterial({color:'#ffe2a0',emissive:new THREE.Color('#ffb53a'),emissiveIntensity:.9,roughness:.2,clearcoat:1,transparent:true,opacity:.95,depthWrite:false});
 const shafts=new THREE.InstancedMesh(arrowG,arM,NA),heads=new THREE.InstancedMesh(headG,hdM,NA);shafts.frustumCulled=heads.frustumCulled=false;car.add(shafts);car.add(heads);shafts.visible=heads.visible=false;
 const _o=new THREE.Object3D();
 // jets: per nozzle a core cone with shock diamonds
 const nz=car.userData.nozzles;const coreG=new THREE.CylinderGeometry(.06,.5,1,24,1,true);coreG.translate(0,-.5,0);
 const cores=nz.map(n=>{const m=new THREE.Mesh(coreG,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uK:{value:0},uT:{value:0}},
   vertexShader:`varying vec2 vU;varying vec3 vN,vV;void main(){vU=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`uniform float uK,uT;varying vec2 vU;varying vec3 vN,vV;void main(){float along=1.-vU.y;float f=abs(dot(vN,vV));float core=pow(f,2.5);
    float dia=.55+.45*smoothstep(.55,1.,sin(along*38.-uT*6.)*.5+.5)*smoothstep(.55,.0,along);float fade=smoothstep(1.,.15,along)*smoothstep(0.,.03,along);
    vec3 col=mix(vec3(.55,.85,1.),vec3(1.),core);gl_FragColor=vec4(col*core*dia*fade*uK*2.6,1.);}`}));
  m.visible=false;car.userData.inner.parent.add(m);m.position.copy(n.p);m.quaternion.setFromUnitVectors(V(0,-1,0),n.d.clone());return m;});
 // frost puffs (normal blending, sunlit white)
 const ptex=puffTex();const puffs=[];for(let i=0;i<160;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:ptex,transparent:true,depthWrite:false,opacity:0,color:new THREE.Color(1.15,1.12,1.1),fog:true}));S.add(m);m.visible=false;puffs.push({m,ph:rn(),sp:rn(),k:Math.floor(rn()*10)});}
 const tmpQ=new THREE.Quaternion();
 function L2W(v){return v.clone().applyQuaternion(car.quaternion).add(car.position);}
 function D2W(v){return v.clone().applyQuaternion(car.quaternion);}
 const H=(i,k)=>{const x=Math.sin(i*12.9898+k*78.233+.5)*43758.5453;return x-Math.floor(x);};
 // ground bursts (landing frost) and tyre smoke: extra puff pool
 const bp=[];for(let i=0;i<90;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:ptex,transparent:true,depthWrite:false,opacity:0,color:new THREE.Color(1.1,1.08,1.06)}));S.add(m);m.visible=false;bp.push(m);}
 function set(o){const t=o.t||0;air.clear();gap.clear();jetS.clear();glowSlab.visible=false;shafts.visible=heads.visible=false;fp.visible=false;cores.forEach(c=>c.visible=false);puffs.forEach(p=>p.m.visible=false);bp.forEach(m=>m.visible=false);
  const cam=S.userData.cam;
  if(o.suck>0){const k=o.suck;
   // thin gap air: particles in the 13 cm gap, drawn rearward to the fans and blown out behind as amber filaments
   for(let i=0;i<gap.n;i++){const ph=(H(i,1)+t*(.5+H(i,2)*.3))%1;const lane=(H(i,3)-.5)*1.5;const sx=(H(i,4)-.5)*3.6;let P,P1;
    if(ph<.6){const u=ph/.6;const x=sx-(sx+2.25)*u*u;const z=lane*(1-u*.7);P=L2W(V(x,.065,z));P1=L2W(V(x-.35,.065,z*.95));}
    else{const u=(ph-.6)/.4;const x=-2.3-u*5.5;const z=lane*.4*(1+u*1.6);const y=.3+u*.4*(H(i,5)-.3);P=L2W(V(x,y,z));P1=L2W(V(x-.6-u,y,z));}
    gap.set(i,P,P1,.03,1.,.62,.28,k*(i<gap.n*.18||ph>.6?.85:.0)*Math.sin(Math.PI*ph));}
   shafts.visible=heads.visible=true;let ai=0;for(let ix=0;ix<6;ix++)for(let iz=0;iz<3;iz++){const x=-1.75+ix*.7,z=-.62+iz*.62;const len=1.7;const wave=.5+.5*Math.sin(t*5-ix*.6);
     const y0=1.62+len;const s=Math.max(.001,(o.arrows??k)*(.85+.15*wave));_o.position.set(x,y0,z);_o.rotation.set(Math.PI,0,0);_o.scale.set(1,len*s,1);_o.updateMatrix();shafts.setMatrixAt(ai,_o.matrix);
     _o.position.set(x,y0-len*s,z);_o.scale.set(1,1,1);_o.updateMatrix();heads.setMatrixAt(ai,_o.matrix);ai++;}
   shafts.count=heads.count=ai;shafts.instanceMatrix.needsUpdate=heads.instanceMatrix.needsUpdate=true;arM.opacity=.85*(o.arrows??k);hdM.opacity=.95*(o.arrows??k);
   glowSlab.visible=true;glowSlab.position.copy(L2W(V(0,2.8,0)));glowSlab.quaternion.copy(car.quaternion).multiply(tmpQ.setFromEuler(new THREE.Euler(Math.PI/2,0,0)));glowSlab.scale.set(11,5.5,1);glowSlab.material.uniforms.uK.value=k;glowSlab.material.uniforms.uT.value=t;
   fp.visible=true;fpM.uniforms.uK.value=k*(o.fp??1);}
  car.userData.fans.forEach((f,i)=>f.rotation.x=t*40+i);
  if(o.jets){let pi=0,ji=0;for(const [i,k] of o.jets){if(k<=0)continue;const n=nz[i];const c=cores[i];c.visible=true;const L=(i<4?3.4:2.4)*(.4+.6*k);c.scale.set(i<4?.55:.45,L,i<4?.55:.45);c.material.uniforms.uK.value=k;c.material.uniforms.uT.value=t;
    const P0=L2W(n.p),D=D2W(n.d);
    for(let q=0;q<130&&ji<jetS.n;q++,ji++){const ph=(H(ji,1)+t*(1.6+H(ji,2)))%1;const spread=.05+ph*.35;const off=V(H(ji,3)-.5,H(ji,4)-.5,H(ji,5)-.5).multiplyScalar(spread*2.2);const P=P0.clone().addScaledVector(D,.2+ph*L*1.4).add(off);const P1=P.clone().addScaledVector(D,.35+ph*.6);
     if(P.y<.05||P1.y<.05)continue;jetS.set(ji,P,P1,.03+ph*.05,.85,.95,1.,k*.9*(1-ph));}
    for(let q=0;q<14&&pi<puffs.length;q++,pi++){const p=puffs[pi];const ph=(p.ph+t*(.45+p.sp*.3))%1;let P=P0.clone().addScaledVector(D,L*(.5+ph*1.1));
     P.add(V(Math.sin(p.ph*40)*ph*1.3,Math.cos(p.sp*33)*ph*.8,Math.sin(p.sp*21)*ph*1.3));if(P.y<.4+ph*.5)P.y=.4+ph*.5;
     const s=.5+ph*(i<4?2.6:2.0);p.m.visible=true;p.m.position.copy(P);p.m.scale.set(s,s,s);p.m.material.opacity=k*(i<4?.22:.3)*Math.sin(Math.PI*Math.min(1,ph*1.2))*(1-ph*.5);if(cam)p.m.quaternion.copy(cam.quaternion);p.m.rotateZ(p.ph*6.28+t*.4);}}}
  // bursts: [{pos, age, kind:'frost'|'smoke', n}]
  let bi=0;for(const b of (o.bursts||[])){if(b.age<0||b.age>2.6)continue;const n=b.n||30;for(let q=0;q<n&&bi<bp.length;q++,bi++){const m=bp[bi];const a=H(bi,7)*6.283,sp=.6+H(bi,8);
    const r=(b.kind==='smoke'?1.5:3.6)*sp*(1-Math.exp(-b.age*2.2));const P=b.pos.clone().add(V(Math.cos(a)*r*(b.kind==='smoke'?.6:1)-(b.kind==='smoke'?b.age*2.5*H(bi,9):0),.35+b.age*(.25+.4*H(bi,9)),Math.sin(a)*r));
    const s=(b.kind==='smoke'?1.0:1.2)+b.age*(.9+H(bi,10));m.visible=true;m.position.copy(P);m.scale.set(s,s,s);m.material.color.setRGB(...(b.kind==='smoke'?[.82,.8,.79]:[1.1,1.08,1.06]));
    m.material.opacity=(b.kind==='smoke'?.3:.3)*Math.min(1,b.age*8)*Math.exp(-b.age*1.3);if(cam)m.quaternion.copy(cam.quaternion);m.rotateZ(H(bi,11)*6.28+b.age*.3);}}
  air.flush();gap.flush();jetS.flush();}
 return {set};}
