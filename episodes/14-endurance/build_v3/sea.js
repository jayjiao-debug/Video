// Set-piece 2: the James Caird (Watt Institution scan, CC BY) on a dark swell; the "clearing sky" that is a wave crest.
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {U} from './util.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeSea(THREE,R){
 const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(34,16/9,.1,6000);
 const [cG,wn]=await Promise.all([new GLTFLoader().loadAsync('assets/james_caird_watt.glb'),new THREE.TextureLoader().loadAsync('assets/waternormals.jpg')]);
 wn.wrapS=wn.wrapT=THREE.RepeatWrapping;wn.repeat.set(26,26);
 const skyM=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{band:{value:0}},vertexShader:`varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float band;varying vec3 vD;void main(){float h=vD.y;vec3 c=mix(vec3(.06,.08,.13),vec3(.012,.018,.04),smoothstep(0.,.5,h));float az=atan(vD.x,-vD.z);
   c+=vec3(.75,.78,.8)*band*exp(-pow((h-.03)/.025,2.))*exp(-az*az*1.5);c+=vec3(.12,.14,.2)*exp(-pow(h/.1,2.));gl_FragColor=vec4(c,1.);}`});
 S.add(new THREE.Mesh(new THREE.SphereGeometry(3000,48,24),skyM));S.fog=new THREE.FogExp2(0x0d1220,.0055);
 const oG=new THREE.PlaneGeometry(900,900,240,240);oG.rotateX(-Math.PI/2);const oB=oG.attributes.position.array.slice();const col=new Float32Array(oG.attributes.position.count*3);oG.setAttribute('color',new THREE.BufferAttribute(col,3));
 const oM=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.25,metalness:0,normalMap:wn,normalScale:new THREE.Vector2(.55,.55),clearcoat:.5,clearcoatRoughness:.3});
 const ocean=new THREE.Mesh(oG,oM);S.add(ocean);
 const moon=new THREE.DirectionalLight(0xc8d4f0,1.6);moon.position.set(-80,60,-200);S.add(moon);S.add(new THREE.HemisphereLight(0x33405e,0x05070c,.6));const front=new THREE.DirectionalLight(0xb8c8e8,0);front.position.set(40,30,120);S.add(front);
 const caird=cG.scene;caird.updateMatrixWorld(true);{const b=new THREE.Box3().setFromObject(caird);const s=b.getSize(new THREE.Vector3());const k=7/Math.max(s.x,s.z);caird.scale.multiplyScalar(k);caird.updateMatrixWorld(true);
  const b2=new THREE.Box3().setFromObject(caird);const c=b2.getCenter(new THREE.Vector3());caird.position.sub(new THREE.Vector3(c.x,b2.min.y,c.z));}
 const boat=new THREE.Group();boat.add(caird);S.add(boat);caird.traverse(o=>{if(o.isMesh){o.castShadow=true;if(o.material&&o.material.color)o.material.color.multiplyScalar(.75);}});
 // long axis -> z
 {const b=new THREE.Box3().setFromObject(caird);const s=b.getSize(new THREE.Vector3());if(s.x>s.z)caird.rotation.y=Math.PI/2;}
 const stove=new THREE.PointLight(0xffa050,9,7,1.8);stove.position.set(0,1.3,0.6);boat.add(stove);
 let wave=0,zc=-200;
 const hgt=(x,z,t)=>Math.sin(x*.045+t*.8)*1.3+Math.sin(z*.06+t*1.1+1)*1.1+Math.sin((x*.7+z)*.11+t*1.6)*.4+wave*(24*Math.exp(-Math.pow((z-zc)/(z>zc?11:26),2)));
 const dark=new THREE.Color(0x0a1824),foam=new THREE.Color(0xdfe8ee);
 function oceanAt(t){const p=oG.attributes.position.array;for(let i=0,j=0;i<p.length;i+=3,j++){const y=hgt(oB[i],oB[i+2],t);p[i+1]=y;
   const cr=Math.max(wave*cl((y-9)/9)*(oB[i+2]>zc-8?1:.45),cl((y-2.6)/1.2)*.25);const c=dark.clone().lerp(foam,cr);col[j*3]=c.r;col[j*3+1]=c.g;col[j*3+2]=c.b;}
  oG.attributes.position.needsUpdate=true;oG.attributes.color.needsUpdate=true;oG.computeVertexNormals();wn.offset.set(t*.01,t*.006);}
 function update(T){const t=T*1.1;wave=pr(T,93.4,94.4);zc=lerp(-260,6,eio(pr(T,93.6,96.9)));skyM.uniforms.band.value=pr(T,93.5,94.2)*(1-pr(T,95.0,95.8));oceanAt(t);front.intensity=2.2*wave;
  const y=hgt(0,0,t),yf=hgt(0,3,t),yb=hgt(0,-3,t);boat.position.y=y-1.1;boat.rotation.x=Math.atan2(yb-yf,6)*.8;boat.rotation.z=Math.sin(T*.9)*.07;
  const u=eio(pr(T,89.3,93.5)),v=eio(pr(T,93.5,95.6));
  const cp=new THREE.Vector3(lerp(10,7,u),y+lerp(.9,1.5,u),lerp(10,13,u));const look=new THREE.Vector3(0,y+1.1,0).lerp(new THREE.Vector3(0,y+lerp(1,16,v),-60),v);
  cam.position.copy(cp);cam.lookAt(look);stove.intensity=9*(0.85+0.15*Math.sin(T*13)*Math.sin(T*7));}
 const flash=T=>T>96.5&&T<97.6?0.95*Math.exp(-(T-96.5)/0.25):0;
 return {scene:S,cam,update,flash};}
