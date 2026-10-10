// Seabed, 3008 m: our own built stern (planks + our own lettering), one warm beam, marine snow.
import {U} from './util.js';
const {pr,eio,eo,lerp}=U;
export async function makeDeep(THREE,R){
 const S=new THREE.Scene();S.background=new THREE.Color(0x010308);S.fog=new THREE.FogExp2(0x01060c,.075);
 const cam=new THREE.PerspectiveCamera(30,16/9,.05,200);
 const tl=new THREE.TextureLoader();const ld=u=>tl.loadAsync(u);
 const [pd,pn,prg]=await Promise.all([ld('assets/brown_planks_03_diff_2k.jpg'),ld('assets/brown_planks_03_nor_gl_2k.jpg'),ld('assets/brown_planks_03_rough_2k.jpg')]);
 pd.colorSpace=THREE.SRGBColorSpace;[pd,pn,prg].forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,1.2);t.rotation=Math.PI/2;});
 // stern counter: a section of a cylinder, convex toward the camera (+z), tumblehome via slight cone
 const RAD=10,HGT=4.2,ARC=1.0;
 const g=new THREE.CylinderGeometry(RAD,RAD*0.94,HGT,96,24,true,-ARC/2,ARC);
 const wood=new THREE.MeshStandardMaterial({map:pd,normalMap:pn,roughnessMap:prg,color:0x6a5a4c,roughness:.95,normalScale:new THREE.Vector2(1.4,1.4)});
 const stern=new THREE.Mesh(g,wood);stern.position.set(0,0,-RAD);S.add(stern);
 // rail and moulding
 const rail=new THREE.Mesh(new THREE.TorusGeometry(RAD+0.06,0.09,10,96,ARC),new THREE.MeshStandardMaterial({color:0x2e2620,roughness:.8}));rail.rotation.set(Math.PI/2,0,Math.PI/2-ARC/2);rail.position.set(0,HGT/2,-RAD);S.add(rail);
 // lettering: arc "ENDURANCE" + five-pointed star, painted on a canvas texture applied to a slightly larger shell
 const c=document.createElement('canvas');c.width=4096;c.height=2048;const x=c.getContext('2d');x.clearRect(0,0,4096,2048);
 const txt='ENDURANCE';x.font='bold 250px "Noto Serif CJK SC", serif';x.textAlign='center';x.textBaseline='middle';
 const cx=2048,cy=2900,rr=1950,span=1.02;for(let i=0;i<txt.length;i++){const a=-span/2+span*i/(txt.length-1);x.save();x.translate(cx+Math.sin(a)*rr,cy-Math.cos(a)*rr);x.rotate(a);
  const gr=x.createLinearGradient(0,-120,0,120);gr.addColorStop(0,'#fff2c8');gr.addColorStop(.5,'#e8c272');gr.addColorStop(1,'#a8782e');x.fillStyle=gr;x.fillText(txt[i],0,0);x.restore();}
 const star=(sx,sy,r)=>{x.beginPath();for(let k=0;k<10;k++){const rad=k%2?r*.42:r;const a=-Math.PI/2+k*Math.PI/5;x.lineTo(sx+Math.cos(a)*rad,sy+Math.sin(a)*rad);}x.closePath();const gr=x.createRadialGradient(sx,sy,0,sx,sy,r);gr.addColorStop(0,'#fff2c8');gr.addColorStop(1,'#c99a46');x.fillStyle=gr;x.fill();};
 star(2048,1440,150);
 const lt=new THREE.CanvasTexture(c);lt.colorSpace=THREE.SRGBColorSpace;lt.anisotropy=8;
 const letters=new THREE.Mesh(new THREE.CylinderGeometry(RAD+0.012,RAD*0.94+0.012,HGT,96,1,true,-ARC/2,ARC),new THREE.MeshStandardMaterial({map:lt,transparent:true,roughness:.45,metalness:.55,color:0xffffff,depthWrite:false}));
 letters.position.copy(stern.position);S.add(letters);
 // silt on top of the rail + seabed
 const bed=new THREE.Mesh(new THREE.PlaneGeometry(200,200,80,80),new THREE.MeshStandardMaterial({color:0x2a2c2c,roughness:1}));bed.rotation.x=-Math.PI/2;bed.position.y=-HGT/2-2.2;
 {const p=bed.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*.3)*.15+Math.cos(p.getY(i)*.22)*.2);bed.geometry.computeVertexNormals();}S.add(bed);
 S.add(new THREE.AmbientLight(0x0b1a2a,.35));
 const beam=new THREE.SpotLight(0xffe2b0,900,60,.16,.55,1.4);S.add(beam);S.add(beam.target);
 // volumetric cone (additive)
 const coneM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{op:{value:.5}},
  vertexShader:`varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float op;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float e=pow(abs(dot(vN,vV)),1.5);gl_FragColor=vec4(1.,.86,.62,op*e*pow(vY,1.6)*.22);}`});
 const cone=new THREE.Mesh(new THREE.ConeGeometry(1,1,48,1,true),coneM);S.add(cone);
 // marine snow
 const N=1400;const pg=new THREE.BufferGeometry();const pp=new Float32Array(N*3);let sd=3;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;const base=[];
 for(let i=0;i<N;i++){base.push([(rn()-.5)*16,(rn()-.5)*10,(rn()-.2)*14,rn()]);}pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
 const snow=new THREE.Points(pg,new THREE.PointsMaterial({color:0xb8b2a0,size:.022,transparent:true,opacity:.45,depthWrite:false}));S.add(snow);
 // camera: opening (0–6.2) close on E rising with the beam; ending (121.6–125.4) dive in, reveal full name
 const LETTER_E=new THREE.Vector3(Math.sin(-0.5*0.255)*RAD*1.0,0.55,-RAD+Math.cos(-0.5*.255)*RAD);
 function update(T){let cp,ct,bp,bt,ang=.13,cop=.5;
  if(T<10){const u=eio(pr(T,0,4.4)),v=eio(pr(T,4.2,6.2));
   const e=new THREE.Vector3(-2.30,-0.36,-0.27);
   cp=new THREE.Vector3(lerp(-1.3,-1.1,u),lerp(-0.1,0.1,u)+v*4.5,lerp(4.6,4.0,u)+v*1.0);ct=e.clone().add(new THREE.Vector3(0,v*6,0));
   bp=new THREE.Vector3(1.6,6.5,6);bt=e.clone().add(new THREE.Vector3(lerp(0,.25,u),v*5.5,0));ang=.11;cop=.55*(1-.4*v);}
  else{const u=eio(pr(T,121.6,123.4)),w=eio(pr(T,122.6,125.2));
   cp=new THREE.Vector3(0,lerp(6.5,0.2,u),lerp(6,7.4,u)+w*1.6);ct=new THREE.Vector3(0,lerp(-1.5,-0.15,u),-1.2);
   const sw=eio(pr(T,122.4,124.6));bp=new THREE.Vector3(2.0,6.5,7.5);bt=new THREE.Vector3(lerp(-2.4,2.3,sw),-.1,-.3);ang=lerp(.12,.36,eio(pr(T,124.2,125.3)));cop=.5;}
  cam.position.copy(cp);cam.lookAt(ct);beam.position.copy(bp);beam.target.position.copy(bt);beam.angle=ang;beam.target.updateMatrixWorld();
  const dir=bt.clone().sub(bp);const L=dir.length();cone.position.copy(bp.clone().add(dir.clone().multiplyScalar(.5)));cone.scale.set(Math.tan(ang)*L,L,Math.tan(ang)*L);
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),dir.normalize());coneM.uniforms.op.value=cop;
  for(let i=0;i<N;i++){const [a,b,cz,s]=base[i];pp[i*3]=a+Math.sin(T*.3+s*9)*.2;pp[i*3+1]=((b-T*.12*(.4+s)+50)%10)-5+cp.y*0.6;pp[i*3+2]=cz;}pg.attributes.position.needsUpdate=true;}
 function hud(T){if(T<121.4||T>125.6)return '';const d=Math.round(3008*eo(pr(T,121.7,123.2)));const o=pr(T,121.7,122)*(1-pr(T,124.8,125.3));
  return `<div style="position:absolute;left:1480px;top:400px;opacity:${o}"><div style="font-size:22px;letter-spacing:6px;color:#c9b98f;font-weight:700">深度 · 2022</div><div style="font-family:'Noto Serif CJK SC';font-size:84px;font-weight:900;color:#F6CF78">${d.toLocaleString('en')}<span style="font-size:34px"> m</span></div></div>`;}
 return {scene:S,cam,update,hud};}
