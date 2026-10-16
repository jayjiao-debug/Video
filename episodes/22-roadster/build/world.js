// Dawn test site: sky (apricot horizon → soft blue), sun, layered mesas, concrete pad, the spiral wall (a road wrapped
// inside a 22 m cylinder that banks from flat to the ceiling), steel hoops with light strips, a landing pad, a row of generic cars.
import * as THREE from 'three';
export const SUN=new THREE.Vector3(.9,.085,-.42).normalize();
export const PAL={hor:new THREE.Color('#ffb072'),mid:new THREE.Color('#e9988a'),zen:new THREE.Color('#3d6aa6'),haze:new THREE.Color('#e6a888'),ground:'#9c948a'};
export function skyMat(){return new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{uSun:{value:SUN},uHor:{value:PAL.hor},uMid:{value:PAL.mid},uZen:{value:PAL.zen},uK:{value:1}},
 vertexShader:`varying vec3 vD;void main(){vD=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`,
 fragmentShader:`uniform vec3 uSun,uHor,uMid,uZen;uniform float uK;varying vec3 vD;
 float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
 void main(){vec3 d=normalize(vD);float y=max(d.y,-.02);float sd=max(dot(d,uSun),0.);
  vec3 c=mix(uHor,uMid,smoothstep(0.,.12,y));c=mix(c,uZen,smoothstep(.08,.6,y));
  c+=vec3(1.,.62,.36)*pow(sd,6.)*.55*(1.-smoothstep(0.,.5,y));c+=vec3(1.,.8,.55)*pow(sd,60.)*1.2;c+=vec3(1.,.95,.85)*smoothstep(.9993,.9997,sd)*14.;
  // thin cloud streaks lit from below
  vec2 q=d.xz/(y+.08);float cl=smoothstep(.55,.9,n2(q*vec2(.9,3.)+3.)*.7+n2(q*3.1)*.3)*smoothstep(.03,.14,y)*(1.-smoothstep(.3,.6,y));
  c=mix(c,vec3(1.,.78,.66)*1.05+vec3(.5,.25,.1)*pow(sd,4.),cl*.55);
  if(d.y<0.)c=mix(c,uHor*.9,smoothstep(0.,-.05,d.y));
  gl_FragColor=vec4(c*uK,1.);}`});}
function canvasTex(w,h,fn,rep=[1,1]){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
let sd=11;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
export function concreteTex(rep,base='#cfc7bb',joints=true){return canvasTex(1024,1024,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);
 for(let i=0;i<9000;i++){const x=rn()*w,y=rn()*h,r=rn()*2.2+.3,a=rn()*.07;g.fillStyle=rn()<.5?`rgba(80,70,60,${a})`:`rgba(255,250,240,${a})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
 for(let i=0;i<60;i++){const x=rn()*w,y=rn()*h,r=40+rn()*140;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(90,80,70,${.05*rn()})`);gr.addColorStop(1,'rgba(90,80,70,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}
 if(joints){g.strokeStyle='rgba(70,62,55,.35)';g.lineWidth=3;g.beginPath();g.moveTo(0,1);g.lineTo(w,1);g.moveTo(1,0);g.lineTo(1,h);g.stroke();}},rep);}
// ---- spiral wall geometry -----------------------------------------------------------------------------------
export const RC=11, X0=0, X1=64, X2=86, HALF=3.6; // ramp starts at x=0 flat, reaches the ceiling at X1, ceiling runs to the lip at X2
const ease=t=>t<=0?0:t>=1?1:t*t*t*(t*(t*6-15)+10);
export const phiOf=x=>Math.PI*ease((x-X0)/(X1-X0));
// unrolled coords (a=x, b=RC*phi) → world
export const surf=(a,b)=>{const p=b/RC;return new THREE.Vector3(a,RC-RC*Math.cos(p),RC*Math.sin(p));};
export const nrm=b=>{const p=b/RC;return new THREE.Vector3(0,Math.cos(p),-Math.sin(p));};
// centreline table: arc length s ↔ x
const TAB=[];{let s=0,px=-40,pb=0;for(let x=-40;x<=X2+.001;x+=.05){const b=RC*phiOf(x);if(x>-40)s+=Math.hypot(x-px,b-pb);TAB.push([s,x,b]);px=x;pb=b;}}
export const SLEN=TAB[TAB.length-1][0];
export function atS(s){// returns {a,b,ta,tb} (unrolled point + unit tangent)
 let lo=0,hi=TAB.length-1;if(s<=0){return {a:-40+s,b:0,ta:1,tb:0};}if(s>=SLEN){const t=TAB[hi];return {a:t[1]+(s-SLEN),b:t[2],ta:1,tb:0};}
 while(hi-lo>1){const m=(lo+hi)>>1;if(TAB[m][0]<s)lo=m;else hi=m;}const [s0,x0,b0]=TAB[lo],[s1,x1,b1]=TAB[hi];const k=(s-s0)/(s1-s0);const dx=x1-x0,db=b1-b0,l=Math.hypot(dx,db);return {a:x0+dx*k,b:b0+db*k,ta:dx/l,tb:db/l};}
export function makeRamp(){const g=new THREE.Group();
 const roadTex=concreteTex([1,1],'#e4ddd2',false);
 // road ribbon
 const NS=900,NW=16,P=[],N=[],UV=[],I=[];
 for(let i=0;i<=NS;i++){const s=i/NS*SLEN;const c=atS(s);for(let j=0;j<=NW;j++){const w=(j/NW*2-1)*HALF;const a=c.a-c.tb*w,b=c.b+c.ta*w;const p=surf(a,b),n=nrm(b);P.push(p.x,p.y,p.z);N.push(n.x,n.y,n.z);UV.push(j/NW*1.4,s/5);}}
 for(let i=0;i<NS;i++)for(let j=0;j<NW;j++){const a=i*(NW+1)+j,b=a+NW+1;I.push(a,b,a+1,a+1,b,b+1);}
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));rg.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));rg.setIndex(I);
 const roadM=new THREE.MeshStandardMaterial({map:roadTex,roughness:.82,metalness:0,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const road=new THREE.Mesh(rg,roadM);road.receiveShadow=true;road.castShadow=true;g.add(road);
 // outer skin (back of the ribbon, darker) – offset outward 0.5 m so the wall has thickness
 const P2=[];for(let i=0;i<P.length;i+=3){const nx=N[i],ny=N[i+1],nz=N[i+2];P2.push(P[i]-nx*.5,P[i+1]-ny*.5,P[i+2]-nz*.5);}
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));bg.setIndex(I);bg.computeVertexNormals();
 const back=new THREE.Mesh(bg,new THREE.MeshStandardMaterial({color:'#8d8a86',roughness:.9,side:THREE.DoubleSide}));back.castShadow=true;g.add(back);
 // edge bands (side faces) + LED lines on both edges
 const edgeM=new THREE.MeshStandardMaterial({color:'#a9a49d',roughness:.85,side:THREE.DoubleSide});
 const ledM=new THREE.MeshBasicMaterial({color:new THREE.Color(5.5,3.2,1.4)});
 for(const side of [-1,1]){const EP=[],EI=[],LP=[],LI=[];for(let i=0;i<=NS;i++){const s=i/NS*SLEN;const c=atS(s);const w=side*HALF;const a=c.a-c.tb*w,b=c.b+c.ta*w;const p=surf(a,b),n=nrm(b);
   EP.push(p.x,p.y,p.z,p.x-n.x*.5,p.y-n.y*.5,p.z-n.z*.5);
   const w2=side*(HALF-.25),w3=side*(HALF-.33);const p2=surf(c.a-c.tb*w2,c.b+c.ta*w2),p3=surf(c.a-c.tb*w3,c.b+c.ta*w3);const n2=nrm(c.b+c.ta*w2);LP.push(p2.x+n2.x*.012,p2.y+n2.y*.012,p2.z+n2.z*.012,p3.x+n2.x*.012,p3.y+n2.y*.012,p3.z+n2.z*.012);}
  for(let i=0;i<NS;i++){const a=i*2;EI.push(a,a+2,a+1,a+1,a+2,a+3);LI.push(a,a+2,a+1,a+1,a+2,a+3);}
  const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.Float32BufferAttribute(EP,3));eg.setIndex(EI);eg.computeVertexNormals();g.add(new THREE.Mesh(eg,edgeM));
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(LP,3));lg.setIndex(LI);const led=new THREE.Mesh(lg,ledM.clone());led.material.side=THREE.DoubleSide;g.add(led);}
 // centre dashes
 const dashM=new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.5,1.4),side:THREE.DoubleSide});const DP=[],DI=[];let q=0;
 for(let s=2;s<SLEN-1;s+=4){for(let k=0;k<=6;k++){const ss=s+k/6*1.8;const c=atS(ss);for(const w of [-.07,.07]){const p=surf(c.a-c.tb*w,c.b+c.ta*w),n=nrm(c.b+c.ta*w);DP.push(p.x+n.x*.01,p.y+n.y*.01,p.z+n.z*.01);}}
  for(let k=0;k<6;k++){const a=q+k*2;DI.push(a,a+2,a+1,a+1,a+2,a+3);}q+=14;}
 const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.Float32BufferAttribute(DP,3));dg.setIndex(DI);g.add(new THREE.Mesh(dg,dashM));
 // steel hoops (arcs above ground) every 6 m from x=-2 to X2, with a warm light strip on the inner face
 const steelM=new THREE.MeshStandardMaterial({color:'#3b3f46',metalness:.35,roughness:.55,envMapIntensity:.5});const hoopLed=new THREE.MeshBasicMaterial({color:new THREE.Color(4.2,3.4,2.6)});
 const RR=RC+.95;const th0=Math.acos(RC/RR)+.02;
 for(let x=-1;x<=X2+.1;x+=5.8){const arc=new THREE.TorusGeometry(RR,.32,10,120,Math.PI*2-2*th0);const m=new THREE.Mesh(arc,steelM);m.castShadow=true;
  m.rotation.y=Math.PI/2;m.position.set(x,RC,0);m.rotateZ(-Math.PI/2+th0);g.add(m);
  const l=new THREE.Mesh(new THREE.TorusGeometry(RR-.33,.045,6,120,Math.PI*2-2*th0),hoopLed);l.rotation.copy(m.rotation);l.position.copy(m.position);g.add(l);
  for(const s of [-1,1]){const foot=new THREE.Mesh(new THREE.BoxGeometry(1.2,.4,1.2),steelM);foot.position.set(x,.2,s*RR*Math.sin(th0));g.add(foot);}}
 // longitudinal stringers along the top and sides of the hoops
 for(const th of [Math.PI*.5,Math.PI,Math.PI*1.5,Math.PI*.25,Math.PI*1.75]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,X2+1,10),steelM);p.rotation.z=Math.PI/2;p.position.set((X2-1)/2,RC-(RR+.1)*Math.cos(th),(RR+.1)*Math.sin(th));g.add(p);}
 return {g,road};}
// clay mock-up cars for the jump row: extruded side profiles with bevels (design-studio clay, no badges, no real shapes)
const PROF={sedan:{L:4.7,W:1.86,body:[[-2.35,.32],[-2.35,.78],[-2.0,.98],[-1.15,1.02],[-.7,1.42],[.55,1.44],[1.25,.98],[2.25,.82],[2.35,.5],[2.3,.32]],glass:[[-1.0,1.0],[-.62,1.34],[.48,1.36],[1.08,.99]]},
 van:{L:5.0,W:1.98,body:[[-2.5,.32],[-2.5,1.9],[-2.35,2.0],[1.3,2.0],[2.2,1.12],[2.5,.95],[2.5,.32]],glass:[[1.0,1.9],[1.95,1.12],[1.35,1.12]]},
 pickup:{L:5.4,W:2.0,body:[[-2.7,.32],[-2.7,1.12],[-.2,1.12],[-.15,1.78],[1.05,1.8],[1.6,1.15],[2.6,1.05],[2.7,.6],[2.65,.32]],glass:[[-.05,1.7],[.95,1.72],[1.4,1.16],[-.05,1.16]]},
 truck:{L:7.8,W:2.45,body:[[-3.9,.4],[-3.9,3.2],[1.9,3.2],[1.9,2.6],[3.2,2.55],[3.9,1.7],[3.9,.4]],glass:[[2.05,2.45],[3.1,2.42],[3.62,1.75],[2.05,1.75]]}};
export function genericCar(kind,color){const g=new THREE.Group();const P=PROF[kind];const m=new THREE.MeshPhysicalMaterial({color,roughness:.55,metalness:0,clearcoat:.25,clearcoatRoughness:.4});
 const gl=new THREE.MeshPhysicalMaterial({color:'#20262c',roughness:.1,metalness:.3,clearcoat:1});const tm=new THREE.MeshStandardMaterial({color:'#1a1b1d',roughness:.9});
 const ex=(pts,w,bev)=>{const s=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],p[1])));const geo=new THREE.ExtrudeGeometry(s,{depth:w-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:4,curveSegments:4});geo.translate(0,0,-(w-2*bev)/2);return geo;};
 const b=new THREE.Mesh(ex(P.body,P.W,.12),m);b.castShadow=b.receiveShadow=true;g.add(b);
 for(const s of [-1,1]){const gm=new THREE.Mesh(ex(P.glass,.02,.005),gl);gm.position.z=s*(P.W/2+.005);g.add(gm);}
 const ws=new THREE.Mesh(ex(P.glass,P.W*.86,.02),gl);ws.scale.set(1,1,1);ws.position.y=.012;g.add(ws);
 for(const x of [-P.L*.31,P.L*.31])for(const z of [-P.W/2+.18,P.W/2-.18]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.37,.37,.3,28),tm);wh.rotation.x=Math.PI/2;wh.position.set(x,.37,z);g.add(wh);}
 g.userData.L=P.L;g.userData.H=3;g.userData.W=P.W;return g;}
// distant ridges (smooth layered silhouettes) + a generic launch tower and tanks far away
export function makeHorizon(S){const g=new THREE.Group();S.add(g);let sd=9;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const cols=['#8f8098','#a8909a','#c49e97'];
 for(let k=0;k<3;k++){const rad=1100-k*280;const n=220;const pos=[],idx=[];const ph=[rn()*9,rn()*9,rn()*9];
  for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;const h=(14+k*4)*(.55+.45*Math.sin(a*3+ph[0]))*(.6+.4*Math.sin(a*11+ph[1]))+ (Math.sin(a*29+ph[2])>.7?9:0)+6;
   pos.push(Math.cos(a)*rad,-3,Math.sin(a)*rad,Math.cos(a)*rad,h*(1+k*.3),Math.sin(a)*rad);if(i<n){const q=i*2;idx.push(q,q+2,q+1,q+1,q+2,q+3);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);
  const c=new THREE.Color(cols[k]);g.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c,fog:false,side:THREE.DoubleSide})));}
 // tower: lattice column + a few tanks, far ahead-left, hazy
 const tm=new THREE.MeshBasicMaterial({color:'#8a7f8c',fog:false});const T=new THREE.Group();T.position.set(620,0,-420);g.add(T);
 const tw=new THREE.Mesh(new THREE.BoxGeometry(14,150,14),tm);tw.position.y=75;T.add(tw);const arm=new THREE.Mesh(new THREE.BoxGeometry(30,4,4),tm);arm.position.set(-14,118,0);T.add(arm);
 for(let i=0;i<4;i++){const t=new THREE.Mesh(new THREE.CylinderGeometry(7,7,26,20),tm);t.position.set(40+i*18,13,30);T.add(t);}
 return g;}
