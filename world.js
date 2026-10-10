// The world at night (NASA Black Marble 2016, public domain), flat, tilted, no borders. Used for the 132-nation study.
import {U} from './util.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeWorld(THREE,R){
 const S=new THREE.Scene();S.background=new THREE.Color(0x010207);const cam=new THREE.PerspectiveCamera(32,16/9,.01,100);
 const tl=new THREE.TextureLoader();const [lt,lm]=await Promise.all([tl.loadAsync('tex/bm8k.jpg'),tl.loadAsync('tex/land4k.png')]);lt.colorSpace=THREE.SRGBColorSpace;lt.anisotropy=8;
 const Uu={map:{value:lt},land:{value:lm},glow:{value:1},cool:{value:0}};
 const pl=new THREE.Mesh(new THREE.PlaneGeometry(4,2,1,1),new THREE.ShaderMaterial({uniforms:Uu,vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D map,land;uniform float glow,cool;varying vec2 v;void main(){vec3 c=texture2D(map,v).rgb;float l=dot(c,vec3(.33));float ld=texture2D(land,v).r;
   vec3 lights=vec3(1.,.8,.46)*pow(l,1.15)*2.0*glow;vec3 base=mix(vec3(.01,.02,.05),vec3(.05,.07,.13),ld);
   vec3 col=base+lights;col=mix(col,vec3(dot(col,vec3(.33)))*vec3(.6,.7,.95),cool*.7);
   float e=smoothstep(0.,.03,v.x)*smoothstep(1.,.97,v.x)*smoothstep(0.,.06,v.y)*smoothstep(1.,.94,v.y);gl_FragColor=vec4(pow(mix(vec3(.004,.008,.028),col,e),vec3(2.2)),1.);}`}));
 S.add(pl);
 function update(T){const u=eio(pr(T,74.4,81.4)),w=eio(pr(T,81.4,89.6));
  // start low over the lit northern hemisphere, pull back to the whole world, drift south
  const tx=lerp(.25,0,u),ty=lerp(.35,.05,u)-.12*w,d=lerp(1.4,3.7,u)+.25*w,tilt=lerp(48,30,u)*Math.PI/180,yaw=(lerp(-6,4,u)+3*w)*Math.PI/180;
  cam.position.set(tx+d*Math.sin(tilt)*Math.sin(yaw),ty-d*Math.sin(tilt)*Math.cos(yaw),d*Math.cos(tilt));cam.up.set(0,0,1);cam.lookAt(tx,ty,0);
  Uu.glow.value=lerp(1.1,1.7,pr(T,77.2,78.6))*(1-.55*pr(T,81.4,82.2));Uu.cool.value=pr(T,81.4,82.2)*.6;}
 return {scene:S,cam,update,linear:true};}
