// Set-piece 1: the ship held in pack ice, polar night (navy + gold), kitbashed CC-BY schooner -> 3-mast barquentine silhouette.
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {U} from './util.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeShip(THREE,R){
 const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(30,16/9,.5,9000);
 const gl=new GLTFLoader();const tl=new THREE.TextureLoader();
 const [schG,sDiff,sNor]=await Promise.all([gl.loadAsync('assets/merchant_schooner.glb'),tl.loadAsync('assets/snow_02_diff_2k.jpg'),tl.loadAsync('assets/snow_02_nor_gl_2k.jpg')]);
 // sky dome: navy night with a low warm band on one side (the sun just below the horizon) + stars
 const skyM=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{},vertexShader:`varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vD;void main(){float h=vD.y;float az=atan(vD.x,vD.z);float band=exp(-pow(h/0.07,2.))*pow(max(0.,cos(az-2.6)),3.);
   vec3 c=mix(vec3(.035,.05,.11),vec3(.006,.01,.03),smoothstep(0.,.6,h));c+=vec3(.55,.32,.14)*band*.55;c+=vec3(.05,.07,.14)*exp(-pow(h/.12,2.));gl_FragColor=vec4(c,1.);}`});
 S.add(new THREE.Mesh(new THREE.SphereGeometry(4000,48,24),skyM));
 {const g=new THREE.BufferGeometry();const p=[];let s=9;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<3500;i++){const v=new THREE.Vector3(r()-.5,r()*.9+.02,r()-.5).normalize().multiplyScalar(3500);p.push(v.x,v.y,v.z);}
  g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));S.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xe8ecff,size:2.2,sizeAttenuation:false,transparent:true,opacity:.75,fog:false})));}
 S.fog=new THREE.FogExp2(0x0a1022,.0030);
 // ---- SHIP (kitbash, same recipe as the lookdev test)
 const ship=new THREE.Group();S.add(ship);
 const sch=schG.scene;const meshes=[];sch.traverse(o=>{if(o.isMesh){meshes.push(o);o.castShadow=o.receiveShadow=true;}});
 meshes[14].visible=false;for(const mi of [8,11,12,13])meshes[mi].visible=false;
 for(const mi of [0,1,9,10,2,3]){const m=meshes[mi].material;if(m&&m.color){m.color.setRGB(.13,.12,.12);m.roughness=Math.max(.75,m.roughness||0);m.metalness=0;}}
 sch.updateMatrixWorld(true);const raw=new THREE.Box3().setFromObject(sch);const k=44/(raw.max.z-raw.min.z);
 sch.scale.setScalar(k);sch.position.set(-(raw.min.x+raw.max.x)/2*k,-raw.min.y*k,-(raw.min.z+raw.max.z)/2*k);ship.add(sch);ship.updateMatrixWorld(true);
 const NB=180,zmin=-45,zmax=45;let half=new Array(NB).fill(0),deckY=0,mastZ=[];const v=new THREE.Vector3();
 function profile(){half=new Array(NB).fill(0);deckY=0;mastZ=[];ship.updateMatrixWorld(true);for(const mi of [0,1]){const m=meshes[mi];const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);
  if(v.y<0.2*44){const b=Math.min(NB-1,Math.max(0,Math.floor((v.z-zmin)/(zmax-zmin)*NB)));half[b]=Math.max(half[b],Math.abs(v.x));deckY=Math.max(deckY,v.y);}if(mi===0&&v.y>0.68*44)mastZ.push(v.z);}}}
 const halfAt=z=>{const b=Math.floor((z-zmin)/(zmax-zmin)*NB);return (b<0||b>=NB)?0:Math.max(half[b],half[Math.max(0,b-1)],half[Math.min(NB-1,b+1)]);};
 profile();let hz0=1e9,hz1=-1e9;for(let b=0;b<NB;b++)if(half[b]>1.0){const z=zmin+(b+.5)*(zmax-zmin)/NB;hz0=Math.min(hz0,z);hz1=Math.max(hz1,z);}
 {const s2=44/(hz1-hz0),zc=(hz0+hz1)/2;sch.scale.multiplyScalar(s2);sch.position.multiplyScalar(s2);sch.position.z-=zc*s2;}profile();
 let H0=1e9,H1=-1e9;for(let b=0;b<NB;b++)if(half[b]>1.0){const z=zmin+(b+.5)*(zmax-zmin)/NB;H0=Math.min(H0,z);H1=Math.max(H1,z);}
 {const h2=half.slice();for(let b=0;b<NB;b++){let m=0;for(let d=-5;d<=5;d++){const j=b+d;if(j>=0&&j<NB)m=Math.max(m,h2[j]);}half[b]=m;}}
 mastZ.sort((a,b)=>a-b);const clusters=[];for(const z of mastZ){const c=clusters.find(c=>Math.abs(c.z-z)<2);if(c){c.n++;c.z+=(z-c.z)/c.n}else clusters.push({z,n:1})}
 const masts=clusters.filter(c=>c.n>20).map(c=>c.z).sort((a,b)=>a-b);const shipBox=new THREE.Box3().setFromObject(sch);
 const woodM=new THREE.MeshStandardMaterial({color:0x2b2018,roughness:.85}),canvasM=new THREE.MeshStandardMaterial({color:0xb8ae98,roughness:.95}),blackM=new THREE.MeshStandardMaterial({color:0x121212,roughness:.7});
 const rc=new THREE.Raycaster();const hullMeshes=[meshes[0],meshes[1],meshes[9],meshes[10]];
 function deckAt(z){let best=-1e9;for(const x of [-1.2,-.6,.6,1.2]){rc.set(new THREE.Vector3(x,9.5,z),new THREE.Vector3(0,-1,0));const h=rc.intersectObjects(hullMeshes,false);if(h.length)best=Math.max(best,h[0].point.y);}return best;}
 const foreZ=H0+(H1-H0)*0.84,foreDeck=deckAt(foreZ),mastH=shipBox.max.y*0.86;const fm=new THREE.Group();fm.position.set(0,foreDeck-.15,foreZ);ship.add(fm);
 const FH=mastH-foreDeck;const fmast=new THREE.Mesh(new THREE.CylinderGeometry(.22,.34,FH),woodM);fmast.position.y=FH/2;fm.add(fmast);
 [[.42,8.4],[.58,7.2],[.72,6.0],[.84,4.6]].forEach(([f,w])=>{const y=FH*f;const yard=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,w),woodM);yard.rotation.z=Math.PI/2;yard.position.y=y;fm.add(yard);
  const roll=new THREE.Mesh(new THREE.CapsuleGeometry(.28,w*.82,4,10),canvasM);roll.rotation.z=Math.PI/2;roll.position.set(0,y+.34,0);fm.add(roll);});
 fm.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});
 const realMasts=masts.filter(z=>z>H0+3&&z<H1-3);const funnelZ=(realMasts[0]+realMasts[realMasts.length-1])/2;const funDeck=deckAt(funnelZ);
 const fun=new THREE.Mesh(new THREE.CylinderGeometry(.9,.95,5.2,20),blackM);fun.position.set(0,funDeck+2.6-.15,funnelZ);fun.castShadow=true;ship.add(fun);
 const stayM=new THREE.LineBasicMaterial({color:0x1a140f});const top=new THREE.Vector3(0,mastH-.3,foreZ);
 [new THREE.Vector3(0,deckY+1,shipBox.max.z-1),new THREE.Vector3(0,mastH*.95,masts[masts.length-1])].forEach(b=>ship.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([top,b]),stayM)));
 const SINK=deckY*0.42;ship.position.y=-SINK;
 // ---- SNOW FIELD with soft pressure ridges (smooth mounds, no boxes)
 let sd=11;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const RIDGES=Array.from({length:7},()=>{const a=rnd()*6.28,d=50+rnd()*220;return {a,d,len:80+rnd()*120,ang:a+1.3+rnd()*.5,h:1.4+rnd()*2.2};});
 const terrainH=(x,z)=>{const dd=Math.hypot(x,z);const fl=Math.min(1,Math.max(0,(dd-18)/30));let h=fl*(Math.sin(x*.035)*Math.cos(z*.041)*.9+Math.sin(x*.13+z*.09)*.25);
  for(const r of RIDGES){const cx=Math.cos(r.a)*r.d,cz=Math.sin(r.a)*r.d;const dx=Math.cos(r.ang),dz=Math.sin(r.ang);const s=(x-cx)*dx+(z-cz)*dz,o=-(x-cx)*dz+(z-cz)*dx;
   if(Math.abs(s)<r.len/2)h+=r.h*Math.exp(-o*o/6)*(1-Math.pow(2*s/r.len,4))*(.7+.3*Math.sin(s*.4));}
  const hz=halfAt(z);const gap=Math.abs(x)-hz;if(hz>0&&gap<9)h+=1.3*Math.pow(1-Math.max(0,gap)/9,2);return h;};
 [sDiff,sNor].forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(200,200);});sDiff.colorSpace=THREE.SRGBColorSpace;
 const tG=new THREE.PlaneGeometry(2400,2400,300,300);tG.rotateX(-Math.PI/2);{const p=tG.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrainH(p.getX(i),p.getZ(i)));tG.computeVertexNormals();}
 const terr=new THREE.Mesh(tG,new THREE.MeshStandardMaterial({map:sDiff,normalMap:sNor,color:0x9fb0cf,roughness:.92,normalScale:new THREE.Vector2(.7,.7)}));terr.receiveShadow=true;S.add(terr);
 // rounded ice slabs pressed against the hull
 const iceM=new THREE.MeshStandardMaterial({color:0xaec3e2,roughness:.3,metalness:0,flatShading:true});const slabs=[];
 for(let i=0;i<4000&&slabs.length<90;i++){const z=-20+rnd()*40;const side=rnd()<.5?-1:1;const sx=.5+rnd()*1.1,sy=1.0+rnd()*2.4,sz=1.6+rnd()*3.2;const x=side*(halfAt(z)+0.9+rnd()*6);
  if(slabs.some(s=>Math.hypot(s.position.x-x,s.position.z-z)<Math.max(sz,s.userData.sz)*.6))continue;
  const g=new THREE.BoxGeometry(sx*.55,sy*1.6,sz*1.3,1,2,2);const p=g.attributes.position;for(let j=0;j<p.count;j++){p.setXYZ(j,p.getX(j)*(.8+.4*rnd()),p.getY(j)*(.85+.3*rnd()),p.getZ(j)*(.8+.4*rnd()));}g.computeVertexNormals();
  const m=new THREE.Mesh(g,iceM);m.position.set(x,terrainH(x,z)+sy*.15,z);m.rotation.set((rnd()-.5)*.3,(rnd()-.5)*.5,side*(.25+rnd()*.55));m.castShadow=m.receiveShadow=true;m.userData={base:m.position.clone(),rz:m.rotation.z,sz,near:Math.abs(x)-halfAt(z)<3.5};S.add(m);slabs.push(m);}
 // ---- LIGHT: moon rim + low warm sky glow + deck lanterns
 const moon=new THREE.DirectionalLight(0xa9bdf0,1.5);moon.position.set(-260,180,-340);S.add(moon);S.add(moon.target);
 moon.castShadow=true;moon.shadow.mapSize.set(4096,4096);Object.assign(moon.shadow.camera,{left:-70,right:70,top:70,bottom:-70,near:1,far:1200});moon.shadow.bias=-.0004;moon.shadow.normalBias=.4;
 S.add(new THREE.HemisphereLight(0x3a4c80,0x0b0d14,.55));
 const warm=new THREE.DirectionalLight(0xffa868,.35);warm.position.set(Math.sin(2.6)*400,25,Math.cos(2.6)*400);S.add(warm);
 const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,240,200,1)');r.addColorStop(.2,'rgba(255,190,110,.75)');r.addColorStop(1,'rgba(255,160,80,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
 const lantern=(p,s=3)=>{const l=new THREE.PointLight(0xffb060,40,30,1.6);l.position.copy(p);S.add(l);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffc070,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.position.copy(p);sp.scale.set(s,s,1);S.add(sp);return [l,sp];};
 const deckL=[lantern(new THREE.Vector3(0,deckY-SINK+2.2,H0+6)),lantern(new THREE.Vector3(1.5,deckY-SINK+2,funnelZ-3)),lantern(new THREE.Vector3(-1.5,deckY-SINK+2.2,H1-9))];
 // 28 people with lanterns on the ice (faceless silhouettes)
 const figM=new THREE.MeshStandardMaterial({color:0x0c0d12,roughness:1});const crew=[];
 for(let i=0;i<28;i++){const a=rnd()*6.28,rr=Math.sqrt(rnd());const z=-6+Math.sin(a)*rr*16,x=-(halfAt(z)+15+(Math.cos(a)*rr+1)*7);const y=terrainH(x,z);
  const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.32,1.05,4,8),figM);body.position.y=.85;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.26,10,8),figM);head.position.y=1.75;g.add(head);
  g.position.set(x,y,z);g.traverse(o=>{if(o.isMesh)o.castShadow=true});S.add(g);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffc070,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.position.set(x+.45,y+1.0,z);sp.scale.set(0,0,1);S.add(sp);
  const pl=new THREE.PointLight(0xffb060,0,9,1.8);pl.position.set(x+.45,y+1.0,z);S.add(pl);crew.push({g,sp,pl,t0:12.7+i*0.11});}
 // ---- CAMERA (az around the ship, dist, height, lookY)
 const KEYS=[[5.6,-0.15,200,7,9],[8.5,-0.10,125,6,9],[12.5,0.25,92,6,7],[16.4,0.75,84,8,7],[20.6,1.2,86,14,7],[24.7,1.6,92,30,6],[28.8,1.85,110,170,0]];
 const ksp=['az','d','h','ly'].map((_,j)=>new THREE.CatmullRomCurve3(KEYS.map((k,i)=>new THREE.Vector3(i,k[j+1],0)),false,'centripetal'));
 const A0=-0.95;
 function camAt(T){let i=0;while(i<KEYS.length-2&&T>KEYS[i+1][0])i++;const f=(i+cl((T-KEYS[i][0])/(KEYS[i+1][0]-KEYS[i][0])))/(KEYS.length-1);
  const g=eio(cl((T-5.6)/(28.8-5.6)));const u=lerp(f,g,.35);const [az,d,h,ly]=ksp.map(c=>c.getPoint(u).y);return [new THREE.Vector3(Math.sin(A0+az)*d,h,Math.cos(A0+az)*d),new THREE.Vector3(0,ly,0)];}
 const FL=9.25;
 function update(T){const crush=eio(cl((T-8.6)/3.4));ship.rotation.z=0.085*crush;ship.rotation.x=.012*crush;ship.position.y=-SINK-.6*crush;
  for(const s of slabs){if(s.userData.near){s.position.y=s.userData.base.y+crush*1.1;s.rotation.z=s.userData.rz+crush*.14*Math.sign(s.userData.base.x);}}
  for(const c of crew){const k=eo(pr(T,c.t0,c.t0+.35));c.sp.scale.set(2.2*k,2.2*k,1);c.pl.intensity=14*k;c.g.visible=k>0||T>c.t0;}
  const [p,l]=camAt(T);cam.position.copy(p);cam.lookAt(l);
  const fl=T>FL?Math.exp(-(T-FL)/0.18):0;moon.intensity=1.5+fl*9;R.toneMappingExposure=1;}
 const flash=T=>T>FL&&T<FL+1.2?0.85*Math.exp(-(T-FL)/0.12):0;
 window.SHIPINFO={masts,H0,H1,deckY,slabs:slabs.length};
 return {scene:S,cam,update,flash};}
