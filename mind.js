// Killingsworth & Gilbert: a person at a desk under a lamp. A phone pings. Their light-double drifts away ~47 % of the time; when it is away, the warm light on them goes cold.
import {U} from './util.js';
import {stage,glowTex,pool,figure,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeMind(THREE,R){
 const {S,tickDust}=stage(THREE,{fog:.06});const cam=new THREE.PerspectiveCamera(34,16/9,.05,200);const gt=glowTex(THREE);
 const wood=new THREE.MeshStandardMaterial({color:0x2a1d14,roughness:.6}),dark=new THREE.MeshStandardMaterial({color:0x0b0b10,roughness:.8});
 const desk=new THREE.Group();S.add(desk);
 const top=new THREE.Mesh(new THREE.BoxGeometry(1.6,.06,.8),wood);top.position.y=.76;desk.add(top);
 for(const [x,z] of [[-.75,-.35],[.75,-.35],[-.75,.35],[.75,.35]]){const l=new THREE.Mesh(new THREE.BoxGeometry(.05,.76,.05),dark);l.position.set(x,.38,z);desk.add(l);}
 const chair=new THREE.Mesh(new THREE.BoxGeometry(.5,.06,.5),dark);chair.position.set(-.05,.46,.62);desk.add(chair);const back=new THREE.Mesh(new THREE.BoxGeometry(.5,.6,.05),dark);back.position.set(-.05,.78,.88);desk.add(back);
 // lamp
 const arm=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.5),dark);arm.position.set(.55,1.04,-.2);desk.add(arm);const shade=new THREE.Mesh(new THREE.ConeGeometry(.14,.16,24,1,true),new THREE.MeshStandardMaterial({color:0x1a1410,side:THREE.DoubleSide}));shade.position.set(.5,1.3,-.12);shade.rotation.z=.5;desk.add(shade);
 const bulb=sprite(THREE,gt,0xffd9a0,.5);bulb.position.set(.47,1.24,-.1);desk.add(bulb);
 const lamp=new THREE.PointLight(0xffc27a,11,7,1.4);lamp.position.set(.45,1.2,-.05);desk.add(lamp);
 // books + phone
 for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.32,.05,.24),new THREE.MeshStandardMaterial({color:[0x3a2a1c,0x24304a,0x4a2a26,0x2c2c34][i],roughness:.8}));b.position.set(-.5,.82+i*.05,-.15);b.rotation.y=i*.12;desk.add(b);}
 const phone=new THREE.Mesh(new THREE.BoxGeometry(.08,.008,.16),new THREE.MeshBasicMaterial({color:0x111318}));phone.position.set(.1,.795,.05);desk.add(phone);
 const scr=new THREE.Mesh(new THREE.PlaneGeometry(.07,.15),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}));scr.rotation.x=-Math.PI/2;scr.position.set(.1,.8,.05);desk.add(scr);
 const scrGlow=sprite(THREE,gt,0xbfd0ff,.6);scrGlow.position.set(.1,.86,.05);desk.add(scrGlow);
 // person (seated, facing -z) and the light-double
 const fig=figure(THREE,{seated:true});fig.rotation.y=Math.PI/2;fig.position.set(-.05,0,.55);S.add(fig);
 const ghostM=new THREE.MeshBasicMaterial({color:0x8fb0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
 const ghost=figure(THREE,{seated:true});ghost.traverse(o=>{if(o.isMesh)o.material=ghostM;});ghost.rotation.y=Math.PI/2;S.add(ghost);
 const ghostGlow=sprite(THREE,gt,0x8fb0ff,1.6);S.add(ghostGlow);
 const warmPool=pool(THREE,0xffb060,2.0,.7);warmPool.position.set(0,.011,.1);S.add(warmPool);
 // time ring on the floor: 46.9 % arc fills in blue
 const ringU={p:{value:0},a:{value:0}};const ring=new THREE.Mesh(new THREE.RingGeometry(1.9,1.98,256,1),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:ringU,
  vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float p,a;varying vec2 vP;void main(){float ang=fract(atan(vP.x,vP.y)/6.28318+1.);vec3 c=ang<p?vec3(.56,.69,1.):vec3(1.,.82,.5);float on=ang<p?1.:.35;gl_FragColor=vec4(c*on*a,1.);}`}));
 ring.rotation.x=-Math.PI/2;ring.position.set(0,.012,.25);S.add(ring);
 const ticks=new THREE.Group();for(let i=0;i<48;i++){const t=new THREE.Mesh(new THREE.PlaneGeometry(.015,i%4?.08:.16),new THREE.MeshBasicMaterial({color:0xf6cf78,transparent:true,opacity:.4,depthWrite:false}));const a=i/48*6.283;t.position.set(Math.sin(a)*2.08,.013,Math.cos(a)*2.08+.25);t.rotation.set(-Math.PI/2,0,-a);ticks.add(t);}S.add(ticks);
 const PINGS=[24.9,25.6,26.3,27.0,27.7];
 const cp=camPath(THREE,[[20.8,-3.4,2.5,5.2,0,.95,.2],[24.7,-2.4,1.9,3.8,.1,.95,.1],[28.7,-4.4,4.2,5.0,0,.6,.3],[32.8,-2.6,2.3,5.0,-.2,1.2,.3],[37.4,1.2,2.0,4.8,0,1.1,0]]);
 function update(T){const [p,l]=cp(T);cam.position.copy(p);cam.lookAt(l);tickDust(T,new THREE.Vector3(0,0,0));
  // pings
  let pg=0;for(const t0 of PINGS){const k=pr(T,t0,t0+.6);if(k>0&&k<1)pg=Math.max(pg,1-k);}scr.material.opacity=pg;scrGlow.material.opacity=pg;scrGlow.scale.set(.3+.6*pg,.3+.6*pg,1);
  // wandering: ghost leaves on a ~47 % duty cycle after 28.7
  const on=pr(T,28.9,29.6);const cyc=((T-28.9)/2.4)%1;const away=on>0?(cyc<.469?Math.sin(Math.PI*cyc/.469):0):0;const drift=on*away;
  const gp=new THREE.Vector3(-.05,0,.55).add(new THREE.Vector3(-.8*drift,.9*drift,-.9*drift));ghost.position.copy(gp);ghostM.opacity=.5*drift;ghostGlow.position.copy(gp.clone().add(new THREE.Vector3(0,1.1,0)));ghostGlow.material.opacity=.6*drift;
  const cold=T>32.8?drift:drift*.4;lamp.intensity=11*(1-.75*cold);lamp.color.setRGB(lerp(1,.6,cold),lerp(.76,.7,cold),lerp(.48,.9,cold));warmPool.material.uniforms.I.value=.7*(1-.7*cold);bulb.material.opacity=1-.6*cold;
  ringU.p.value=.469*eo(pr(T,29.0,31.6));ringU.a.value=pr(T,28.8,29.4);ticks.visible=T>28.6;}
 function hud(T){if(T<20.8||T>37.4)return '';let h='';const G='#F6CF78',BL='#a9bde8';
  const o1=pr(T,24.8,25.2)*(1-pr(T,28.4,28.8));if(o1>0){const n=Math.round(2250*eo(pr(T,24.8,27.8)));h+=`<div style="position:absolute;left:120px;top:150px;opacity:${o1}"><div class="lbl" style="position:static">哈佛 · 手机随机提问</div><div class="t serif" style="position:static;font-size:110px;color:${G};line-height:1.15">${n.toLocaleString('en')}<span style="font-size:40px"> 人</span></div></div>`;}
  const o2=pr(T,29.0,29.4)*(1-pr(T,36.6,37.1));if(o2>0){const v=(46.9*eo(pr(T,29.0,31.6))).toFixed(1);h+=`<div style="position:absolute;left:120px;top:150px;opacity:${o2}"><div class="lbl" style="position:static">清醒时间里 · 心不在焉</div><div class="t serif" style="position:static;font-size:130px;color:${BL};line-height:1.1">${v}<span style="font-size:52px">%</span></div></div>`;}
  return h;}
 return {scene:S,cam,update,hud};}
