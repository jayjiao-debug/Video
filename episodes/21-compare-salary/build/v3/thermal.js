// Thermal 满意度 engine: scenes render a signed "heat" scalar (satisfaction) per pixel into a float target; heat diffuses (depth-aware blur),
// shimmers above hot objects, and is mapped through an ironbow ramp (warm) or an ice ramp (below ambient), with soft isotherms and bloom on the hottest band.
import * as THREE from 'three';
export const T3=THREE;
// ---- heat materials -------------------------------------------------------------------------------------------
// uHeat: object satisfaction (0 = ambient, 1 = white-hot, <0 = cold/ice). Volume: centre-facing hotter, grazing edges cooler (emissivity).
const HV=`varying vec3 vN;varying vec3 vV;varying vec2 vUv;varying float vD;varying vec3 vW;
void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);
#ifdef USE_INSTANCING
mv=modelViewMatrix*instanceMatrix*vec4(position,1.);vN=normalize(normalMatrix*mat3(instanceMatrix)*normal);
#else
vN=normalize(normalMatrix*normal);
#endif
vec4 wp=modelMatrix*vec4(position,1.);
#ifdef USE_INSTANCING
wp=modelMatrix*instanceMatrix*vec4(position,1.);
#endif
vW=wp.xyz;vV=normalize(-mv.xyz);vD=-mv.z;gl_Position=projectionMatrix*mv;}`;
const HF=`uniform float uHeat,uVol,uInk,uFogN,uFogF,uAmb,uRim,uIce,uRecv,uMot;uniform sampler2D uMap;uniform float uHasMap;uniform vec4 uHL[8];uniform float uHLr[8];
varying vec3 vN;varying vec3 vV;varying vec2 vUv;varying float vD;varying vec3 vW;
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){float ndv=clamp(abs(dot(normalize(vN),normalize(vV))),0.,1.);
 float h=uHeat;
 float hh=h*(1.-uVol+uVol*pow(ndv,.6));
 hh+=uRim*pow(1.-ndv,3.);
 float hl=0.;for(int i=0;i<8;i++){vec3 d=vW-uHL[i].xyz;hl+=uHL[i].w*exp(-dot(d,d)/(uHLr[i]*uHLr[i]));}hh+=hl*uRecv;
 hh+=(n3(vW*7.)-.5)*.035*uMot+(n3(vW*1.7)-.5)*.05*uMot;
 float ink=0.;if(uHasMap>.5){vec4 m=texture2D(uMap,vUv);ink=m.r;hh-=uInk*m.r;}
 float f=smoothstep(uFogN,uFogF,vD);hh=mix(hh,uAmb,f*.85);
 gl_FragColor=vec4(hh,vD,max(uIce,0.)*pow(1.-ndv,1.5),ink);}`;
export const HL={value:Array.from({length:8},()=>new THREE.Vector4(0,-99,0,0))},HLR={value:Array(8).fill(1)};
export function setHL(list){for(let i=0;i<8;i++){const l=list[i];if(l){HL.value[i].set(l[0],l[1],l[2],l[3]);HLR.value[i]=l[4]||1;}else HL.value[i].set(0,-99,0,0);}}
export function heatMat({heat=.5,vol=.35,rim=0,map=null,ink=.6,ice=0,side=THREE.FrontSide,fog=[14,60],amb=.12,recv=.0,mot=1}={}){
 const m=new THREE.ShaderMaterial({uniforms:{uHL:HL,uHLr:HLR,uRecv:{value:recv},uMot:{value:mot},uHeat:{value:heat},uVol:{value:vol},uInk:{value:ink},uFogN:{value:fog[0]},uFogF:{value:fog[1]},uAmb:{value:amb},uRim:{value:rim},uIce:{value:ice},uMap:{value:map},uHasMap:{value:map?1:0}},
  vertexShader:HV,fragmentShader:HF,side});m.userData.heat=true;return m;}
// additive heat (steam, glows, shimmer sources): adds heat on top, no depth write
export function heatAdd({heat=.3,map=null}={}){return new THREE.ShaderMaterial({uniforms:{uHeat:{value:heat},uMap:{value:map}},transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,blendSrcAlpha:THREE.ZeroFactor,blendDstAlpha:THREE.OneFactor,
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uHeat;uniform sampler2D uMap;varying vec2 vUv;void main(){float a=texture2D(uMap,vUv).r;gl_FragColor=vec4(uHeat*a,0.,0.,0.);}`});}
export function blobTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'#fff');r.addColorStop(.35,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);return t;}
// ink texture: white text on black (white = cooler print on a hot surface)
export function inkTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#fff';draw(g,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.userData={c,g,draw};return t;}
// ---- the thermal camera ---------------------------------------------------------------------------------------
const FSV=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const BLUR=`uniform sampler2D tex;uniform vec2 dir;varying vec2 vUv;void main(){vec4 s=vec4(0.);float w[5];w[0]=.227;w[1]=.195;w[2]=.122;w[3]=.054;w[4]=.016;
 s+=texture2D(tex,vUv)*w[0];for(int i=1;i<5;i++){s+=texture2D(tex,vUv+dir*float(i))*w[i];s+=texture2D(tex,vUv-dir*float(i))*w[i];}gl_FragColor=s;}`;
const COMP=`uniform sampler2D tH,tB1,tB2;uniform float uLo,uHi,uT,uShim,uIso,uBloom,uAmb,uFlash,uFreeze,uFreezeY,uHaze,uHazeL;uniform vec2 px;varying vec2 vUv;
vec3 iron(float x){x=clamp(x,0.,1.);
 vec3 c0=vec3(.149,.039,.408),c1=vec3(.408,.086,.588),c2=vec3(.729,.133,.502),c3=vec3(.933,.243,.337),c4=vec3(1.,.463,.102),c5=vec3(1.,.745,.157),c6=vec3(1.,.925,.588),c7=vec3(1.,1.,.98);
 float s=x*7.;if(s<1.)return mix(c0,c1,s);if(s<2.)return mix(c1,c2,s-1.);if(s<3.)return mix(c2,c3,s-2.);if(s<4.)return mix(c3,c4,s-3.);if(s<5.)return mix(c4,c5,s-4.);if(s<6.)return mix(c5,c6,s-5.);return mix(c6,c7,s-6.);}
vec3 ice(float x){x=clamp(x,0.,1.);vec3 a=vec3(.149,.039,.408),b=vec3(.13,.32,.78),c=vec3(.31,.90,1.),d=vec3(.92,1.,1.);float s=x*3.;if(s<1.)return mix(a,b,s);if(s<2.)return mix(b,c,s-1.);return mix(c,d,s-2.);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 uv=vUv;
 // shimmer: heat haze above hot regions (driven by the wide blur, sampled slightly below)
 float hot=max(texture2D(tB2,uv-vec2(0.,.035)).r-.55,0.);
 vec2 w=vec2(noise(uv*vec2(18.,9.)+vec2(0.,-uT*1.6))-.5,noise(uv*vec2(14.,7.)+vec2(5.,-uT*1.3))-.5);
 float ink0=texture2D(tH,uv).a;uv+=w*hot*uShim*.012*(1.-smoothstep(0.,.05,ink0));
 vec4 h=texture2D(tH,uv);vec4 b1=texture2D(tB1,uv);vec4 b2=texture2D(tB2,uv);
 float H=h.r;float glow=(max(b1.r-H,0.)*.75+max(b2.r-H,0.)*.4)*(1.-h.a); // heat bleeding out of hot objects
 float cold=min(H,0.);float Hc=max(H,0.)+glow;
 // auto-range: displayed temperature relative to the hottest thing the camera is ranging on
 if(uHaze>0.){float hn=noise(vUv*vec2(5.,3.)+vec2(0.,-uT*.6))*.6+noise(vUv*vec2(11.,6.)+vec2(3.,-uT*1.1))*.4;Hc=mix(Hc,uHazeL*(.75+.5*hn),uHaze);H=mix(H,max(H,0.),uHaze);}
 float x=(Hc-uLo)/(uHi-uLo);
 vec3 col;
 if(H<-0.001){float k=clamp(-H*1.4,0.,1.);col=mix(iron((uAmb-uLo)/(uHi-uLo)),ice(.35+.65*k),smoothstep(0.,.12,k));}
 else col=iron(x);
 // ice rim on cold objects
 col=mix(col,vec3(.75,.98,1.),clamp(h.b,0.,1.)*.75);
 // isotherms: soft lines only where heat changes
 float cf=((b1.r*.65+b2.r*.35)-uLo)/(uHi-uLo)*10.;float fw=fwidth(cf);float l=abs(fract(cf+.5)-.5);float iso=(1.-smoothstep(fw*.6,fw*1.6,l))*smoothstep(.004,.03,fw)*(1.-smoothstep(.25,.6,fw))*uIso;
 iso*=1.-smoothstep(0.,.3,max(h.a,texture2D(tB1,uv).a*3.));col=mix(col,min(col*1.35+vec3(.22),vec3(1.)),iso*.55);
 // bloom on the hottest band
 float bb=max(b2.r*0.6+b1.r*.4-.5*uHi,0.)/uHi;col+=iron(.9)*bb*uBloom*1.4*(1.-h.a);
 // freeze front (the drop): below uFreezeY the frame turns to frost
 if(uFreeze>0.){float fz=smoothstep(uFreezeY+.02,uFreezeY-.02,vUv.y)*uFreeze;float n=noise(vUv*vec2(160.,90.))*.5+noise(vUv*vec2(40.,22.))*.5;col=mix(col,mix(col,ice(.55+.4*n),.6),fz);}
 col+=uFlash;
 // gentle vignette
 vec2 q=vUv-.5;col*=1.-dot(q,q)*.35;
 gl_FragColor=vec4(col,1.);}`;
export function thermal(renderer,W=1920,H=1080){
 const opt={type:THREE.HalfFloatType,depthBuffer:true,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter};
 const rtH=new THREE.WebGLRenderTarget(W,H,opt);
 const q4={type:THREE.HalfFloatType,depthBuffer:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter};
 const a1=new THREE.WebGLRenderTarget(W/4,H/4,q4),b1=new THREE.WebGLRenderTarget(W/4,H/4,q4),a2=new THREE.WebGLRenderTarget(W/16,H/16,q4),b2=new THREE.WebGLRenderTarget(W/16,H/16,q4);
 const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));const qs=new THREE.Scene();qs.add(quad);const qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const bm=new THREE.ShaderMaterial({uniforms:{tex:{value:null},dir:{value:new THREE.Vector2()}},vertexShader:FSV,fragmentShader:BLUR,depthTest:false,depthWrite:false});
 const cm=new THREE.ShaderMaterial({uniforms:{tH:{value:rtH.texture},tB1:{value:a1.texture},tB2:{value:a2.texture},uLo:{value:0},uHi:{value:1},uT:{value:0},uShim:{value:1},uIso:{value:1},uBloom:{value:1},uAmb:{value:.12},uFlash:{value:0},uFreeze:{value:0},uFreezeY:{value:.5},uHaze:{value:0},uHazeL:{value:.6},px:{value:new THREE.Vector2(1/W,1/H)}},
  vertexShader:FSV,fragmentShader:COMP,depthTest:false,depthWrite:false,extensions:{derivatives:true}});
 const pass=(src,dst,dx,dy)=>{bm.uniforms.tex.value=src.texture;bm.uniforms.dir.value.set(dx,dy);quad.material=bm;renderer.setRenderTarget(dst);renderer.render(qs,qc);};
 function render(scene,cam,P={}){const amb=P.amb??.12;renderer.setRenderTarget(rtH);renderer.setClearColor(new THREE.Color(amb,0,0),0);renderer.clear();renderer.render(scene,cam);
  pass(rtH,b1,1.6/(W/4),0);pass(b1,a1,0,1.6/(H/4));pass(a1,b2,1.5/(W/16),0);pass(b2,a2,0,1.5/(H/16));pass(a2,b2,2.5/(W/16),0);pass(b2,a2,0,2.5/(H/16));
  const u=cm.uniforms;u.uLo.value=P.lo??0;u.uHi.value=P.hi??1;u.uT.value=P.t??0;u.uShim.value=P.shim??1;u.uIso.value=P.iso??1;u.uBloom.value=P.bloom??1;u.uAmb.value=amb;u.uFlash.value=P.flash??0;u.uFreeze.value=P.freeze??0;u.uFreezeY.value=P.freezeY??.5;u.uHaze.value=P.haze??0;u.uHazeL.value=P.hazeL??.6;
  quad.material=cm;renderer.setRenderTarget(null);renderer.render(qs,qc);}
 return {render,rtH};}
// ---- tiny geometry kit (soft forms read well in thermal) -----------------------------------------------------------
export const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
export function capsuleBetween(a,b,r,mat){const d=new THREE.Vector3().subVectors(b,a);const L=d.length();const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.001,L),6,14),mat);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return m;}
export function rbox(w,h,d,r,mat,seg=4){const s=new THREE.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
 const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:Math.min(r,d/2)*.6,bevelSize:Math.min(r,d/2)*.6,bevelSegments:seg,curveSegments:seg*2});g.translate(0,0,-d/2);return new THREE.Mesh(g,mat);}
// Camera through keys [T,x,y,z,lx,ly,lz]: eased move between consecutive keys (identical keys = hold). Optional 8th value = fov.
export function camPath(K){return T=>{let i=0;while(i<K.length-2&&T>K[i+1][0])i++;const a=K[i],c=K[i+1];const u=Math.min(1,Math.max(0,(T-a[0])/(c[0]-a[0])));const e=u*u*u*(u*(u*6-15)+10);
 const f=j=>a[j]+(c[j]-a[j])*e;return [V3(f(1),f(2),f(3)),V3(f(4),f(5),f(6)),a[7]!==undefined?f(7):undefined];};}

export function setCapsule(m,a,b){const d=new THREE.Vector3().subVectors(b,a);const L=d.length();m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());m.scale.set(1,Math.max(.05,L/m.userData.L),1);}
export function capsule(r,L,mat){const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,L,6,14),mat);m.userData.L=L+2*r;return m;}
