// Shared look for every 3D vignette: black mirror floor, fog, dust, soft light pools, faceless figures.
import {Reflector} from 'three/addons/objects/Reflector.js';
export function stage(THREE,{fog=.05,glaze=.74,dust=600,bg=0x010207}={}){
 const S=new THREE.Scene();S.background=new THREE.Color(bg);S.fog=new THREE.FogExp2(0x02040b,fog);
 const mir=new Reflector(new THREE.PlaneGeometry(160,160),{textureWidth:1280,textureHeight:720,color:0x8a8f99,clipBias:.003});mir.rotation.x=-Math.PI/2;S.add(mir);
 const gz=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshBasicMaterial({color:0x03050b,transparent:true,opacity:glaze,depthWrite:false}));gz.rotation.x=-Math.PI/2;gz.position.y=.002;gz.renderOrder=-10;S.add(gz);
 S.add(new THREE.AmbientLight(0x1a2240,.5));
 let sd=77;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const dg=new THREE.BufferGeometry();const dp=new Float32Array(dust*3);const DB=Array.from({length:dust},()=>[(rn()-.5)*18,rn()*6,(rn()-.5)*18,rn()]);dg.setAttribute('position',new THREE.BufferAttribute(dp,3));
 S.add(new THREE.Points(dg,new THREE.PointsMaterial({color:0xd8c9a4,size:.016,transparent:true,opacity:.45,depthWrite:false})));
 const tickDust=(T,c)=>{for(let i=0;i<dust;i++){const [x,y,z,s]=DB[i];dp[i*3]=c.x+x+Math.sin(T*.2+s*20)*.3;dp[i*3+1]=(y+T*.05*(.3+s))%6;dp[i*3+2]=c.z+z;}dg.attributes.position.needsUpdate=true;};
 return {S,tickDust,rn};}
export const glowTex=THREE=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);};
export function pool(THREE,col,r=2.2,I=.6){const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{c:{value:new THREE.Color(col)},I:{value:I}},
 vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform vec3 c;uniform float I;varying vec2 v;void main(){float d=length(v-.5)*2.;float a=pow(max(0.,1.-d),2.2)*I;gl_FragColor=vec4(c*a,1.);}`}));m.rotation.x=-Math.PI/2;m.position.y=.01;return m;}
export function figure(THREE,{h=1.7,col=0x050508,seated=false}={}){const M=new THREE.MeshStandardMaterial({color:col,roughness:1});const g=new THREE.Group();const s=h/1.7;
 if(seated){const b=new THREE.Mesh(new THREE.CapsuleGeometry(.2*s,.5*s,4,10),M);b.position.y=.95*s;g.add(b);const hd=new THREE.Mesh(new THREE.SphereGeometry(.15*s,14,10),M);hd.position.y=1.48*s;g.add(hd);const th=new THREE.Mesh(new THREE.CapsuleGeometry(.12*s,.36*s,4,8),M);th.rotation.z=Math.PI/2;th.position.set(.22*s,.62*s,0);g.add(th);const lg=new THREE.Mesh(new THREE.CapsuleGeometry(.1*s,.4*s,4,8),M);lg.position.set(.42*s,.3*s,0);g.add(lg);}
 else{const b=new THREE.Mesh(new THREE.CapsuleGeometry(.2*s,.78*s,4,10),M);b.position.y=.62*s;g.add(b);const hd=new THREE.Mesh(new THREE.SphereGeometry(.15*s,14,10),M);hd.position.y=1.38*s;g.add(hd);}
 g.userData.M=M;return g;}
export function sprite(THREE,tex,col,s=1,add=true){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:col,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));sp.scale.set(s,s,1);return sp;}
export const camK=(K,T,eio,pr,lerp,THREE)=>{let i=0;while(i<K.length-2&&T>K[i+1][0])i++;const a=K[i],b=K[i+1];const u=eio(pr(T,a[0],b[0]));const f=j=>lerp(a[j],b[j],u);return [new THREE.Vector3(f(1),f(2),f(3)),new THREE.Vector3(f(4),f(5),f(6))];};
// smooth camera through keys [T,x,y,z,lx,ly,lz]: Catmull-Rom in space, piecewise-linear time, eased ends
export function camPath(THREE,K){const P=new THREE.CatmullRomCurve3(K.map(k=>new THREE.Vector3(k[1],k[2],k[3])),false,'centripetal'),L=new THREE.CatmullRomCurve3(K.map(k=>new THREE.Vector3(k[4],k[5],k[6])),false,'centripetal');
 const n=K.length-1;return T=>{let i=0;while(i<n-1&&T>K[i+1][0])i++;let f=(i+Math.min(1,Math.max(0,(T-K[i][0])/(K[i+1][0]-K[i][0]))))/n;const e=x=>x*x*(3-2*x);f=f<.12?.12*e(f/.12)*1:f;f=Math.min(1,Math.max(0,f));return [P.getPoint(f),L.getPoint(f)];};}
