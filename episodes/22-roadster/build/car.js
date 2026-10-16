// Original generic mid-engine sports car (not modelled on any real car). Local frame: +x forward, +y up, +z right.
// Body = loft of rounded-polygon cross-sections (flat floor, side skirt, convex flank, sharp shoulder, tumblehome),
// real wheel wells, glass greenhouse, blade lamps, diffuser fins. X-ray internals: 4 fans, 2 air tanks, 10 nozzles.
import * as THREE from 'three';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const sm=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t);};const lerp=(a,b,t)=>a+(b-a)*t;
function curve(pts){// monotone cubic (Fritsch–Carlson) through the control points: smooth, no plateaus, no overshoot
 const n=pts.length,x=pts.map(p=>p[0]),y=pts.map(p=>p[1]);const d=[],m=new Array(n).fill(0);for(let i=0;i<n-1;i++)d.push((y[i+1]-y[i])/(x[i+1]-x[i]));
 m[0]=d[0];m[n-1]=d[n-2];for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
 for(let i=0;i<n-1;i++){if(d[i]===0){m[i]=m[i+1]=0;continue;}const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;if(s>9){const t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i];}}
 return u=>{if(u<=x[0])return y[0];if(u>=x[n-1])return y[n-1];let i=0;while(u>x[i+1])i++;const h=x[i+1]-x[i],t=(u-x[i])/h,t2=t*t,t3=t2*t;
  return (2*t3-3*t2+1)*y[i]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*y[i+1]+(t3-t2)*h*m[i+1];};}
export const DIM={L:4.5,W:2.0,R:.355,XF:1.38,XR:-1.34,TR:.835,CLR:.12};
// rounded polygon → n points (corner radius r_i per vertex)
function roundPoly(P,rad,per=8,seg=6){const out=[];const n=P.length;const cs=[];
 for(let i=0;i<n;i++){const a=P[(i-1+n)%n],b=P[i],c=P[(i+1)%n];const d1=[a[0]-b[0],a[1]-b[1]],d2=[c[0]-b[0],c[1]-b[1]];const l1=Math.hypot(...d1)||1e-6,l2=Math.hypot(...d2)||1e-6;const rr=Math.min(rad[i],l1*.45,l2*.45);
  cs.push({p1:[b[0]+d1[0]/l1*rr,b[1]+d1[1]/l1*rr],b,p2:[b[0]+d2[0]/l2*rr,b[1]+d2[1]/l2*rr]});}
 for(let i=0;i<n;i++){const {p1,b,p2}=cs[i];for(let k=0;k<per;k++){const t=k/per;out.push([(1-t)*(1-t)*p1[0]+2*(1-t)*t*b[0]+t*t*p2[0],(1-t)*(1-t)*p1[1]+2*(1-t)*t*b[1]+t*t*p2[1]]);}
  const q=cs[(i+1)%n].p1;for(let k=0;k<seg;k++){const t=k/seg;out.push([p2[0]+(q[0]-p2[0])*t,p2[1]+(q[1]-p2[1])*t]);}}
 return out;}
export function makeCar({paint='#C8261A'}={}){
 const g=new THREE.Group();const {L,R,XF,XR}=DIM;
 // ---- side/plan profiles over u ∈ [0 nose, 1 tail]
 const hw=curve([[0,.34],[.025,.66],[.1,.9],[.2,.985],[.3,.96],[.42,.9],[.55,.93],[.68,1.0],[.84,.99],[.95,.93],[1,.86]]); // half width at shoulder
 const shY=curve([[0,.29],[.04,.44],[.12,.66],[.19,.79],[.26,.77],[.33,.68],[.45,.66],[.6,.74],[.7,.84],[.8,.865],[.9,.84],[1,.78]]);        // shoulder (fender) height
 const top=curve([[0,.32],[.04,.42],[.14,.55],[.26,.62],[.34,.66],[.62,.78],[.78,.84],[.9,.83],[1,.78]]);           // deck/hood centre height
 const bot=curve([[0,.22],[.06,.15],[.14,.12],[.82,.12],[.92,.2],[1,.3]]);
 const NU=240;let NV=0;const pos=[],uvs=[],idx=[],col=[];const wells=[[XF,R+.06],[XR,R+.065]];
 const secs=[];
 for(let i=0;i<=NU;i++){const u=i/NU;const x=L/2-u*L;const w=hw(u),sy=shY(u),ty=top(u),by=bot(u);
  // half section (z≥0) from bottom centre to top centre: floor, skirt corner, flank (convex), shoulder crease, deck
  const skirtW=w*.93,flankY=by+(sy-by)*.45;
  const half=[[0,by],[skirtW,by],[w*.985,flankY],[w,sy-.05],[w*.9,sy+.015],[w*.55,ty-.01+(sy>ty-.03?0:.0)],[0,ty]];
  const rads=[0,.06,.25,.05,.03,.25,0];
  // mirror to full loop: bottom centre → +z side → top centre → -z side → back
  const full=half.concat(half.slice(1,-1).reverse().map(p=>[-p[0],p[1]])).map(p=>[p[0],p[1]]);
  const fr=rads.concat(rads.slice(1,-1).reverse());
  let pts=roundPoly(full,fr,4,4);
  // wheel wells
  const dk=[];pts=pts.map(([z,y],pi)=>{dk[pi]=1;for(const [xw,ra] of wells){const dx=x-xw;const rr=ra+.05;if(Math.abs(dx)<rr+.1){const ya=R+Math.sqrt(Math.max(0,rr*rr-dx*dx));const k=sm(ya-.03,ya+.03,y);const wIn=.62;
     if(Math.abs(z)>wIn){const blend=sm(rr+.1,rr-.01,Math.abs(dx));const z2=lerp(z,Math.sign(z)*lerp(wIn,Math.abs(z),k),blend);if(Math.abs(z)-Math.abs(z2)>.03)dk[pi]=Math.min(dk[pi],.04);z=z2;}}}return [z,y];});
  NV=pts.length;secs.push(pts);for(let j=0;j<=NV;j++){const [z,y]=pts[j%NV];pos.push(x,y,z);uvs.push(u,j/NV);const d=dk[j%NV];col.push(d,d,d);}}
 for(let i=0;i<NU;i++)for(let j=0;j<NV;j++){const a=i*(NV+1)+j,b=a+NV+1;idx.push(a,a+1,b,a+1,b+1,b);}
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));bg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));bg.setIndex(idx);bg.computeVertexNormals();
 const paintM=new THREE.MeshPhysicalMaterial({color:paint,metalness:.1,roughness:.42,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:.85,vertexColors:true});
 const body=new THREE.Mesh(bg,paintM);body.castShadow=true;body.receiveShadow=true;g.add(body);
 const darkM=new THREE.MeshPhysicalMaterial({color:'#111214',metalness:.3,roughness:.5,clearcoat:.5,envMapIntensity:.6});
 // nose & tail caps (fill the tiny end sections)
 for(const [i,sx] of [[0,1],[NU,-1]]){const pts=secs[i];const shape=new THREE.Shape(pts.map(([z,y])=>new THREE.Vector2(z,y)));const m=new THREE.Mesh(new THREE.ShapeGeometry(shape),i?darkM:paintM);m.rotation.y=sx>0?Math.PI/2:-Math.PI/2;m.position.x=L/2-i/NU*L;g.add(m);}
 // ---- greenhouse: glass canopy from windshield base to engine cover
 const gu=curve([[0,0],[.1,.16],[.3,.36],[.55,.4],[.8,.3],[1,.08]]),gw=curve([[0,.6],[.25,.72],[.55,.74],[.85,.62],[1,.5]]);
 const CU=90,CV=48,cp=[],ci=[];const X0=.98,X1=-1.2;for(let i=0;i<=CU;i++){const t=i/CU;const x=lerp(X0,X1,t);const uu=(L/2-x)/L;const base=top(uu)-.012;const h=gu(t),w=gw(t)*hw(uu)*.8;
  for(let j=0;j<=CV;j++){const a=j/CV*Math.PI;const s=Math.sin(a),c=Math.cos(a);const z=Math.sign(c)*Math.pow(Math.abs(c),.75)*w;const y=base+Math.pow(s,.55)*h;cp.push(x,y,z);}}
 for(let i=0;i<CU;i++)for(let j=0;j<CV;j++){const a=i*(CV+1)+j,b=a+CV+1;ci.push(a,b,a+1,a+1,b,b+1);}
 const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));cg.setIndex(ci);cg.computeVertexNormals();
 const glassM=new THREE.MeshPhysicalMaterial({color:'#0a0e12',metalness:.2,roughness:.03,clearcoat:1,clearcoatRoughness:.01,envMapIntensity:1.5,transparent:true,opacity:.96,side:THREE.DoubleSide});
 const canopy=new THREE.Mesh(cg,glassM);canopy.castShadow=true;g.add(canopy);
 // ---- details: front splitter, side skirt blade, rear diffuser fins, ducktail, lamps
 const splitter=new THREE.Mesh(new THREE.BoxGeometry(.3,.025,1.1),darkM);splitter.position.set(L/2-.3,.125,0);g.add(splitter);
 for(const s of [-1,1]){const sk=new THREE.Mesh(new THREE.BoxGeometry(1.6,.035,.05),darkM);sk.position.set(0,.135,s*.9);g.add(sk);}
 for(let i=0;i<5;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(.55,.13,.022),darkM);f.position.set(-L/2+.3,.2,(i-2)*.32);f.rotation.z=-.22;g.add(f);}
 const lampM=new THREE.MeshBasicMaterial({color:new THREE.Color(5,5.3,6)}),tailM=new THREE.MeshBasicMaterial({color:new THREE.Color(6,.35,.25)});
 for(const s of [-1,1]){const b=new THREE.Mesh(new THREE.BoxGeometry(.32,.022,.03),lampM);b.position.set(L/2-.17,.395,s*.56);b.rotation.y=s*-.9;g.add(b);
  const b2=b.clone();b2.position.set(L/2-.21,.37,s*.6);b2.scale.x=.7;g.add(b2);
  const t=new THREE.Mesh(new THREE.BoxGeometry(.03,.025,.5),tailM);t.position.set(-L/2-.005,.66,s*.48);g.add(t);const t2=t.clone();t2.position.y=.62;t2.position.z=s*.42;t2.scale.z=.7;g.add(t2);}
 // side intake (dark, inset) behind the door
 for(const s of [-1,1]){const pts=[[0,0],[.6,.0],[.72,.18],[.1,.2]];const shp=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],p[1])));const m=new THREE.Mesh(new THREE.ShapeGeometry(shp),new THREE.MeshPhysicalMaterial({color:'#07080a',roughness:.7,side:THREE.DoubleSide}));
  m.position.set(-.62,.36,s*(hw(.6)*.985+.006));g.add(m);}
 // ---- wheels
 const wheels=[];const tyreM=new THREE.MeshPhysicalMaterial({color:'#101113',roughness:.82}),rimM=new THREE.MeshPhysicalMaterial({color:'#1c1e21',metalness:.8,roughness:.32,envMapIntensity:1.1});
 const spokeM=new THREE.MeshPhysicalMaterial({color:'#c9ced4',metalness:.95,roughness:.18,envMapIntensity:1.3}),discM=new THREE.MeshPhysicalMaterial({color:'#55595e',metalness:.8,roughness:.45}),calM=new THREE.MeshPhysicalMaterial({color:'#e8b23a',metalness:.2,roughness:.4});
 const tp=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI;tp.push(new THREE.Vector2(R-.095+Math.sin(a)*.095,-.14+(1-Math.cos(a))*.14));}
 const tyreG=new THREE.LatheGeometry(tp,56);
 for(const [x,s] of [[XF,1],[XF,-1],[XR,1],[XR,-1]]){const w=new THREE.Group();w.position.set(x,R,s*DIM.TR);g.add(w);const spin=new THREE.Group();w.add(spin);
  const ty=new THREE.Mesh(tyreG,tyreM);ty.rotation.x=Math.PI/2;ty.castShadow=true;spin.add(ty);
  const rim=new THREE.Mesh(new THREE.CylinderGeometry(R-.1,R-.1,.02,48),rimM);rim.rotation.x=Math.PI/2;rim.position.z=s*.115;spin.add(rim);
  for(let k=0;k<10;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.028,R-.115,.018),spokeM);sp.position.y=(R-.115)/2+.02;sp.rotation.z=(k%2?.12:-.12);const p=new THREE.Group();p.rotation.z=Math.floor(k/2)/5*Math.PI*2+(k%2?.18:-.18);p.add(sp);p.position.z=s*.13;spin.add(p);}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.03,20),spokeM);hub.rotation.x=Math.PI/2;hub.position.z=s*.135;spin.add(hub);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(R-.13,R-.13,.02,40),discM);disc.rotation.x=Math.PI/2;disc.position.z=s*.06;spin.add(disc);
  const cal=new THREE.Mesh(new THREE.BoxGeometry(.18,.09,.05),calM);cal.position.set(-.12,.12,s*.08);w.add(cal);
  wheels.push({g:w,spin,x,s});}
 // ---- x-ray internals (hidden until xray>0)
 const inner=new THREE.Group();g.add(inner);inner.visible=false;
 const glow=(r,gg,b)=>new THREE.MeshBasicMaterial({color:new THREE.Color(r,gg,b),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
 const tankM=new THREE.MeshStandardMaterial({color:'#7fd8e8',emissive:new THREE.Color('#2aa6c4'),emissiveIntensity:.9,roughness:.25,metalness:.3,transparent:true,opacity:0});const tanks=[];
 for(const z of [-.36,.36]){const t=new THREE.Mesh(new THREE.CapsuleGeometry(.21,1.25,10,28),tankM);t.rotation.z=Math.PI/2;t.position.set(-.3,.44,z);inner.add(t);tanks.push(t);
  // winding bands on the tank (carbon overwrap)
  for(let k=0;k<9;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(.212,.006,6,40),glow(.8,2.4,2.8));r.rotation.y=Math.PI/2;r.position.set(-.3-.6+k*.15,.44,z);r.material=new THREE.MeshStandardMaterial({color:'#e9fbff',emissive:new THREE.Color('#9fe9ff'),emissiveIntensity:.6,transparent:true,opacity:0});inner.add(r);}}
 const fanM=new THREE.MeshStandardMaterial({color:'#ffb35c',emissive:new THREE.Color('#ff8a2a'),emissiveIntensity:1.1,side:THREE.DoubleSide,transparent:true,opacity:0});const fans=[];
 for(let i=0;i<4;i++){const z=(i-1.5)*.36;const grp=new THREE.Group();grp.position.set(-1.95,.2,z);inner.add(grp);const ring=new THREE.Mesh(new THREE.TorusGeometry(.13,.012,8,40),fanM);ring.rotation.y=Math.PI/2;grp.add(ring);
  const rot=new THREE.Group();rot.rotation.y=Math.PI/2;grp.add(rot);for(let k=0;k<7;k++){const bl=new THREE.Mesh(new THREE.PlaneGeometry(.11,.03),fanM);bl.position.x=.065;const p=new THREE.Group();p.rotation.z=k/7*Math.PI*2;p.add(bl);rot.add(p);}fans.push(rot);}
 // 4 main (rear diffuser) + 6 attitude = 10
 const NOZ=[[-2.24,.3,-.54,-1,0,0],[-2.24,.3,-.18,-1,0,0],[-2.24,.3,.18,-1,0,0],[-2.24,.3,.54,-1,0,0],
  [1.75,.2,-.62,0,-1,0],[1.75,.2,.62,0,-1,0],[-1.85,.2,-.82,0,-1,0],[-1.85,.2,.82,0,-1,0],[.15,.62,-.99,0,0,-1],[.15,.62,.99,0,0,1]];
 const nozzles=NOZ.map(([x,y,z,dx,dy,dz])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.055,16,12),new THREE.MeshStandardMaterial({color:'#fff4d6',emissive:new THREE.Color('#ffd27a'),emissiveIntensity:1.6,transparent:true,opacity:0}));m.position.set(x,y,z);inner.add(m);return {m,p:V(x,y,z),d:V(dx,dy,dz)};});
 const pipeM=new THREE.LineBasicMaterial({color:new THREE.Color(.5,1.8,2.2),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
 const pp=[];for(const n of nozzles){const tz=n.p.z>0?.36:-.36;const t=V(n.p.x>0?.33:-.92,.44,tz);pp.push(t.x,t.y,t.z,n.p.x,t.y,n.p.z*.9,n.p.x,t.y,n.p.z*.9,n.p.x,n.p.y,n.p.z);}
 const pipes=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(pp,3)),pipeM);inner.add(pipes);
 // x-ray shell: fresnel edge of the body (warm), interior floor plate
 const shellM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uK:{value:0},uC:{value:new THREE.Color(1.0,.5,.32)}},
  vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float uK;uniform vec3 uC;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-abs(dot(vN,vV)),3.);gl_FragColor=vec4(uC*(.0+.75*f)*uK,1.);}`});
 const shell=new THREE.Mesh(bg,shellM);shell.visible=false;g.add(shell);const shell2=new THREE.Mesh(cg,shellM);shell2.visible=false;g.add(shell2);
 const others=[];g.traverse(o=>{if(o.isMesh&&o!==body&&o!==canopy&&o!==shell&&o!==shell2&&!inner.children.includes(o)&&o.parent!==inner&&!(o.parent&&o.parent.parent===inner)&&!(o.parent&&o.parent.parent&&o.parent.parent.parent===inner))others.push(o);});
 function setXray(k){const on=k>.001;shell.visible=shell2.visible=on;inner.visible=on;shellM.uniforms.uK.value=k;
  paintM.transparent=true;paintM.opacity=1-k*.72;glassM.opacity=.96*(1-k*.75);paintM.depthWrite=k<.5;glassM.depthWrite=k<.5;
  inner.traverse(o=>{if(o.material&&o.material!==pipeM)o.material.opacity=k*.92;});pipeM.opacity=k*.9;}
 g.userData={wheels,fans,tanks,nozzles,setXray,inner,paintM};
 return g;}
