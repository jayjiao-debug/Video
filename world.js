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
 // gold columns rising from the brightest lights (night light ~ wealth; illustrative), collapsing on the drop
 const cv=document.createElement('canvas');cv.width=480;cv.height=240;const cx=cv.getContext('2d');cx.drawImage(lt.image,0,0,480,240);const px=cx.getImageData(0,0,480,240).data;
 const cols=[];for(let y=0;y<240;y++)for(let x=0;x<480;x++){const i=(y*480+x)*4;const b=(px[i]+px[i+1]+px[i+2])/765;if(b>.2&&y<198&&!(x>140&&x<220&&y<48))cols.push([x,y,b]);}
 const colM=new THREE.MeshBasicMaterial({color:0xf6cf78,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
 const IM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),colM,cols.length);S.add(IM);const D=new THREE.Object3D();
 const setCols=k=>{cols.forEach(([x,y,b],i)=>{const h=Math.max(1e-4,k*.22*Math.pow(b,1.8));D.position.set(-2+(x+.5)/480*4,1-(y+.5)/240*2,h/2);D.scale.set(.0045,.0045,h);D.updateMatrix();IM.setMatrixAt(i,D.matrix);});IM.instanceMatrix.needsUpdate=true;};
 window.WCOLS=cols.length;
 function update(T){const u=eio(pr(T,74.4,81.4)),w=eio(pr(T,81.4,89.6));
  // start low over the lit northern hemisphere, pull back to the whole world, drift south
  const tx=lerp(.25,0,u),ty=lerp(.35,.05,u)-.12*w,d=lerp(1.4,3.7,u)+.25*w,tilt=lerp(48,30,u)*Math.PI/180,yaw=(lerp(-6,4,u)+3*w)*Math.PI/180;
  cam.position.set(tx+d*Math.sin(tilt)*Math.sin(yaw),ty-d*Math.sin(tilt)*Math.cos(yaw),d*Math.cos(tilt));cam.up.set(0,0,1);cam.lookAt(tx,ty,0);
  Uu.glow.value=lerp(1.1,1.7,pr(T,77.2,78.6))*(1-.55*pr(T,81.4,82.2));Uu.cool.value=pr(T,81.4,82.2)*.6;
  const k=eo(pr(T,77.3,79.2))*(1-eio(pr(T,81.4,82.4)));setCols(k);IM.visible=k>.002;colM.opacity=.6;}
 return {scene:S,cam,update,linear:true};}
