// Set-piece: two doors of light on a black mirror floor. Left = 快乐 (rose gold, flickering like a screen), right = 意义 (deep gold, stairs going up).
import {Reflector} from 'three/addons/objects/Reflector.js';
import {U} from './util.js';
const {pr,eio,eo,lerp,cl,sst}=U;
export async function makeDoors(THREE,R){
 const S=new THREE.Scene();S.background=new THREE.Color(0x010207);S.fog=new THREE.FogExp2(0x02040b,.035);
 const cam=new THREE.PerspectiveCamera(34,16/9,.05,400);
 // mirror floor + dark glaze on top
 const mir=new Reflector(new THREE.PlaneGeometry(200,200),{textureWidth:1920,textureHeight:1080,color:0x8a8f99,clipBias:.003});mir.rotation.x=-Math.PI/2;S.add(mir);
 const glaze=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshBasicMaterial({color:0x03050b,transparent:true,opacity:.72,depthWrite:false}));glaze.rotation.x=-Math.PI/2;glaze.position.y=.002;glaze.renderOrder=-10;S.add(glaze);
 const W=2.2,H=4.4,DX=3.2;
 const frameM=new THREE.MeshStandardMaterial({color:0x2a2216,metalness:.9,roughness:.35,emissive:0x3a2a10,emissiveIntensity:.4});
 S.add(new THREE.AmbientLight(0x1a2240,.6));
 const doorLight=(col,col2)=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{c1:{value:new THREE.Color(col)},c2:{value:new THREE.Color(col2)},I:{value:1},t:{value:0},fl:{value:0}},
  vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform vec3 c1,c2;uniform float I,t,fl;varying vec2 v;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   void main(){float e=smoothstep(0.,.08,v.x)*smoothstep(1.,.92,v.x)*smoothstep(1.,.97,v.y);vec3 c=mix(c1,c2,v.y);float g=.75+.25*(1.-v.y);
    float f=1.+fl*(.18*sin(t*23.)+.12*sin(t*37.+v.y*9.)+.25*(h(vec2(floor(t*12.),1.))-.5));gl_FragColor=vec4(c*g*I*f*e*.62,1.);}`});
 const doors=[];
 for(const [side,col,col2] of [[-1,0xff7a66,0xffb8a6],[1,0xe8a030,0xffe0a0]]){const g=new THREE.Group();g.position.set(side*DX,0,0);S.add(g);
  const m=doorLight(col,col2);const pl=new THREE.Mesh(new THREE.PlaneGeometry(W,H),m);pl.position.y=H/2;g.add(pl);
  const b=(w,h,x,y)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,.18),frameM);o.position.set(x,y,0);g.add(o);};b(.12,H+.12,-W/2-.06,H/2);b(.12,H+.12,W/2+.06,H/2);b(W+.24,.12,0,H+.06);
  // light pool on the floor + beam
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(W*2.6,9),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{c:{value:new THREE.Color(col)},I:{value:1}},
   vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
   fragmentShader:`uniform vec3 c;uniform float I;varying vec2 v;void main(){float d=1.-v.y;float w=abs(v.x-.5)*2.;float sp=.18+d*.42;float a=(1.-smoothstep(sp*.6,sp,w))*pow(1.-d,1.6)*.5;gl_FragColor=vec4(c*a*I,1.);}`}));
  pool.rotation.x=-Math.PI/2;pool.position.set(0,.01,4.5);g.add(pool);
  const beam=new THREE.Mesh(new THREE.PlaneGeometry(W*2.2,H*1.4),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{c:{value:new THREE.Color(col)},I:{value:1}},
   vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
   fragmentShader:`uniform vec3 c;uniform float I;varying vec2 v;void main(){float w=abs(v.x-.5)*2.;float a=(1.-smoothstep(.3,1.,w))*smoothstep(0.,.5,v.y)*smoothstep(1.,.55,v.y)*.07;gl_FragColor=vec4(c*a*I,1.);}`}));
  beam.rotation.x=-Math.PI/2+0.35;beam.position.set(0,H*0.45,2.4);g.add(beam);
  const lamp=new THREE.PointLight(col,8,14,1.6);lamp.position.set(0,H*.5,.6);g.add(lamp);
  doors.push({g,m,pool,beam,lamp});}
 // right door: stairs rising into the light (silhouettes)
 const stairM=new THREE.MeshBasicMaterial({color:0x07060a});
 for(let i=0;i<9;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(W*.78,.32,.5),stairM);s.position.set(DX,.16+i*.36,-.3-i*.42);S.add(s);}
 // left door: sparkles (instant, bright, short-lived)
 const SP=220;const sg=new THREE.BufferGeometry();const sp=new Float32Array(SP*3),sa=new Float32Array(SP);sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sg.setAttribute('a',new THREE.BufferAttribute(sa,1));
 let sd=5;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;const SB=Array.from({length:SP},()=>[rn(),rn(),rn(),rn()]);
 const spM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{},vertexShader:`attribute float a;varying float va;void main(){va=a;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=(2.+a*5.)*(14./-mv.z);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float va;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);gl_FragColor=vec4(vec3(1.,.8,.75)*va*smoothstep(.5,0.,r),1.);}`});
 S.add(new THREE.Points(sg,spM));
 // dust in the air
 const DN=900;const dg=new THREE.BufferGeometry();const dp=new Float32Array(DN*3);const DB=Array.from({length:DN},()=>[(rn()-.5)*16,rn()*6,(rn()-.3)*16,rn()]);dg.setAttribute('position',new THREE.BufferAttribute(dp,3));
 S.add(new THREE.Points(dg,new THREE.PointsMaterial({color:0xd8c9a4,size:.018,transparent:true,opacity:.5,depthWrite:false})));
 // the person: faceless silhouette, back to camera
 const figM=new THREE.MeshStandardMaterial({color:0x050508,roughness:1});const fig=new THREE.Group();
 {const b=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.78,4,10),figM);b.position.y=.62;fig.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.15,14,10),figM);h.position.y=1.38;fig.add(h);}fig.position.set(0,0,3.2);S.add(fig);
 const aura=new THREE.Mesh(new THREE.PlaneGeometry(3.2,4.2),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{I:{value:0}},vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float I;varying vec2 v;void main(){vec2 q=(v-vec2(.5,.38))*vec2(1.6,1.);float a=exp(-dot(q,q)*7.)*I;gl_FragColor=vec4(vec3(1.,.82,.6)*a*.35,1.);}`}));aura.position.set(0,1.6,1.6);S.add(aura);
 // camera keys [T, x, y, z, lookX, lookY, lookZ]
 const KA=[[0,0,1.5,27,0,1.8,0],[4.4,-.6,1.4,17,-.6,1.9,0],[8.5,-2.4,1.25,10.5,-2.6,2.0,0],[12.5,2.4,1.25,10.5,2.6,2.0,0],[16.5,0,2.0,15.5,0,1.9,0],[20.4,-.4,1.8,12.5,-1.6,2.0,0],[21.6,-3.2,2.1,.6,-3.2,2.2,-6]];
 const KB=[[72.6,0,1.7,12,1.0,2.0,0],[73.6,1.6,1.9,6.5,3.0,2.1,0],[75.0,3.2,2.3,.5,3.2,2.6,-6]];
 const KC=[[109.2,0,2.3,18,0,2.1,0],[117.8,0,1.9,15,0,2.0,0],[121.9,0,1.2,8.6,0,1.6,0],[126,0,1.9,13.5,0,2.0,0]];
 const camK=(K,T)=>{let i=0;while(i<K.length-2&&T>K[i+1][0])i++;const a=K[i],b=K[i+1];const u=eio(pr(T,a[0],b[0]));const f=j=>lerp(a[j],b[j],u);return [new THREE.Vector3(f(1),f(2),f(3)),new THREE.Vector3(f(4),f(5),f(6))];};
 function update(T){const K=T<40?KA:(T<100?KB:KC);const [p,l]=camK(K,T);cam.position.copy(p);cam.lookAt(l);
  let iL=1,iR=1;if(T<40){iL=.35+.65*pr(T,0.4,2)+.5*pr(T,4.4,5.2)*(1-pr(T,8.3,9));iR=.35+.65*pr(T,0.4,2)+.5*pr(T,8.5,9.3)*(1-pr(T,12.3,13));iL=Math.min(iL,1.4);iR=Math.min(iR,1.4);if(T>20.4){iL+=1.5*pr(T,20.4,21.5);}}
  else if(T<100){iL=.6;iR=1+1.6*pr(T,73.6,75);}else{iL=lerp(.55,1.1,pr(T,117.8,119.5));iR=iL;}
  const [L,Rr]=doors;L.m.uniforms.I.value=iL;L.m.uniforms.t.value=T;L.m.uniforms.fl.value=1;Rr.m.uniforms.I.value=iR;Rr.m.uniforms.t.value=T;Rr.m.uniforms.fl.value=0;
  for(const [d,i] of [[L,iL],[Rr,iR]]){d.pool.material.uniforms.I.value=i;d.beam.material.uniforms.I.value=i;d.lamp.intensity=8*i;}
  const sOn=(T<40?pr(T,4.4,5.0)*(1-pr(T,8.6,9.6))+.3:.3);for(let i=0;i<SP;i++){const [a,b,c,s]=SB[i];const ph=(T*(.4+s*.6)+a*7)%1;sp[i*3]=-DX+(b-.5)*W*.9;sp[i*3+1]=.3+ph*H*.95;sp[i*3+2]=.25+c*.6;sa[i]=sOn*Math.pow(Math.sin(Math.PI*ph),3)*(.5+.5*Math.sin(T*9+i));}
  sg.attributes.position.needsUpdate=true;sg.attributes.a.needsUpdate=true;
  for(let i=0;i<DN;i++){const [x,y,z,s]=DB[i];dp[i*3]=x+Math.sin(T*.2+s*20)*.3;dp[i*3+1]=(y+T*.05*(.3+s))%6;dp[i*3+2]=z;}dg.attributes.position.needsUpdate=true;
  fig.visible=!(T>20.8&&T<72.6)&&!(T>74.4&&T<109);
  aura.material.uniforms.I.value=fig.visible?(T>100?1:.6):0;
  const step=T>121.9?eio(pr(T,121.9,123.6))*.6:0;fig.position.z=3.2-step;}
 const flash=T=>Math.max(T>21.1&&T<21.9?Math.exp(-Math.pow((T-21.5)/0.16,2)):0,T>74.2&&T<75.6?Math.exp(-Math.pow((T-74.85)/0.3,2)):0)*0.9;
 return {scene:S,cam,update,flash};}
