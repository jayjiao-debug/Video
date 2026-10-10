// Brosnan & de Waal (2003): two capuchins side by side (stylised, faceless). Each hands over a token for a slice of cucumber.
// Then the neighbour gets a grape for the same token; then a grape for nothing. The subject turns away from its cucumber.
import {U} from './util.js';
import {stage,glowTex,pool,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl}=U;
export async function makeMonkeys(THREE,R){
 const {S,tickDust}=stage(THREE,{fog:.05});const cam=new THREE.PerspectiveCamera(34,16/9,.02,200);const gt=glowTex(THREE);
 const dark=new THREE.MeshStandardMaterial({color:0x0a0a0e,roughness:.9});
 const monkey=()=>{const g=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(.3,24,18),dark);body.scale.set(.85,1.05,.8);body.position.y=.42;g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.17,20,16),dark);head.position.set(0,.86,.05);g.add(head);
  for(const s of [-1,1]){const ear=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),dark);ear.position.set(s*.15,.92,0);g.add(ear);
   const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.05,.3,4,8),dark);arm.position.set(s*.24,.45,.14);arm.rotation.x=-.9;g.add(arm);}
  const pts=[];for(let i=0;i<=20;i++){const t=i/20;pts.push(new THREE.Vector3(0,.2+Math.sin(t*3.6)*.38*t,-.25-.35*t+Math.cos(t*4)*.12*t));}
  const tail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.03,8),dark);g.add(tail);S.add(g);return g;};
 const A=new THREE.Vector3(-1.1,0,0),B=new THREE.Vector3(1.1,0,0);
 const mA=monkey(),mB=monkey();mA.position.copy(A);mB.position.copy(B);
 // glass enclosures
 const glass=new THREE.MeshPhysicalMaterial({color:0x9fb4d8,transparent:true,opacity:.08,roughness:.05,metalness:0,depthWrite:false});const edge=new THREE.LineBasicMaterial({color:0x56607a,transparent:true,opacity:.6});
 for(const p of [A,B]){const bx=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.5,1.4),glass);bx.position.copy(p).setY(.75);S.add(bx);const e=new THREE.LineSegments(new THREE.EdgesGeometry(bx.geometry),edge);e.position.copy(bx.position);S.add(e);}
 // trays in front + items
 const tok=(p)=>{const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.05,0),new THREE.MeshStandardMaterial({color:0x8a8a90,roughness:.8}));m.position.copy(p);S.add(m);return m;};
 const cuc=()=>{const g=new THREE.Group();const m=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.02,28),new THREE.MeshStandardMaterial({color:0x6aa84a,roughness:.5}));g.add(m);const c=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.022,28),new THREE.MeshStandardMaterial({color:0xcfe6a8,roughness:.6}));g.add(c);S.add(g);return g;};
 const grp=()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.055,24,16),new THREE.MeshPhysicalMaterial({color:0x5a2a6e,roughness:.25,clearcoat:.8,emissive:0x2a0f38,emissiveIntensity:.7}));S.add(m);const s=sprite(THREE,gt,0xc890ff,.55);S.add(s);return {m,s};};
 const tA=tok(new THREE.Vector3()),tB=tok(new THREE.Vector3());const cA=cuc(),cB=cuc();const gB=grp();
 const sA=new THREE.SpotLight(0xffe2b8,28,8,.42,.6,1.4);sA.position.set(A.x,3.4,1.8);sA.target.position.copy(A);S.add(sA);S.add(sA.target);
 const sB=new THREE.SpotLight(0xffe2b8,28,8,.42,.6,1.4);sB.position.set(B.x,3.4,1.8);sB.target.position.copy(B);S.add(sB);S.add(sB.target);
 const pA=pool(THREE,0xffc070,1.4,.5);pA.position.set(A.x,.011,.2);S.add(pA);const pB=pool(THREE,0xffc070,1.4,.5);pB.position.set(B.x,.011,.2);S.add(pB);
 // exchange cycle: 2.0 s loop — token goes out, reward comes in
 const cyc=(T,t0)=>((T-t0)%2.0)/2.0;
 const cp=camPath(THREE,[[20.4,0,2.6,6.0,0,.8,0],[24.7,-.6,1.5,3.6,-.6,.6,0],[28.7,0,1.9,4.4,0,.6,0],[32.8,.8,1.5,3.4,.9,.6,0],[36.8,-.5,1.4,3.0,-.8,.6,0],[40.9,0,1.8,4.0,0,.6,0],[44.9,-.9,1.3,2.6,-1.0,.6,0],[49.3,0,2.4,5.2,0,.8,0]]);
 function update(T){const [p,l]=cp(T);cam.position.copy(p);cam.lookAt(l);tickDust(T,new THREE.Vector3(0,0,0));
  const phase=T<32.8?0:(T<40.9?1:2);// 0 equal, 1 grape for same work, 2 grape for nothing
  const u=cyc(T,24.7);const tokOut=eio(cl(u/.35)),rewIn=eio(cl((u-.4)/.35));
  const refuse=T>36.8?pr(T,36.8,37.6):0;
  // A: subject — token out, cucumber in; after 36.8 it refuses (cucumber stays out on the tray, monkey turns away)
  tA.position.set(A.x+.15,.62-.3*tokOut,.35+.5*tokOut);tA.visible=T>24.7&&(T<36.8||Math.floor((T-24.7)/2)%3===0);
  cA.position.set(A.x+.1,lerp(.25,.62,T<36.8?rewIn:0),lerp(.95,.4,T<36.8?rewIn:0));cA.visible=T>25.2;
  mA.rotation.y=lerp(0,2.4,eio(refuse));mA.position.z=lerp(0,-.25,refuse);
  // B: partner — cucumber before 32.8, grape after; after 40.9 gets the grape without handing a token
  const giveTok=phase<2;tB.visible=T>24.7&&giveTok;tB.position.set(B.x-.15,.62-.3*tokOut,.35+.5*tokOut);
  const isGrape=phase>=1;cB.visible=T>25.2&&!isGrape;cB.position.set(B.x-.1,lerp(.25,.62,rewIn),lerp(.95,.4,rewIn));
  gB.m.visible=gB.s.visible=isGrape;gB.m.position.set(B.x-.1,lerp(.25,.62,rewIn)+.03,lerp(.95,.4,rewIn));gB.s.position.copy(gB.m.position);gB.s.material.opacity=.8;
  sA.intensity=28*(1-.4*refuse);pA.material.uniforms.I.value=.5*(1-.5*refuse);}
 function hud(T){if(T<24.6||T>49.3)return '';const o=pr(T,28.7,29.1)*(1-pr(T,48.6,49.1));const v=T<36.8?95:(T<40.9?Math.round(lerp(95,60,eo(pr(T,36.9,38.2)))):Math.round(lerp(60,20,eo(pr(T,41.0,42.4)))));
  const pj=q=>{const p=q.clone().project(cam);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080];};const [ax,ay]=pj(new THREE.Vector3(-1.1,1.55,0)),[bx,by]=pj(new THREE.Vector3(1.1,1.55,0));const lab=pr(T,25,25.4)*(1-pr(T,48.6,49.1));
  const right=T<32.8?'黄瓜':(T<40.9?'葡萄（同样干活）':'葡萄（什么都不干）');
  return `<div style="opacity:${lab}"><div class="t" style="left:${ax}px;top:${ay-40}px;transform:translateX(-50%);font-size:30px;color:#c9e6a8">这只：黄瓜</div><div class="t" style="left:${bx}px;top:${by-40}px;transform:translateX(-50%);font-size:30px;color:${T<32.8?'#c9e6a8':'#d9b0ff'}">旁边：${right}</div></div>
  <div style="position:absolute;left:120px;top:150px;opacity:${o}"><div class="lbl" style="position:static">愿意完成交换</div><div class="t serif" style="position:static;font-size:130px;color:${v<90?'#ff9a8a':'#F6CF78'};line-height:1.1">${v}<span style="font-size:52px">%</span></div></div>
  <div class="t" style="left:960px;top:892px;transform:translateX(-50%);font-size:22px;color:#7d8597;font-weight:700;opacity:${lab}">Brosnan &amp; de Waal (2003) Nature · 卷尾猴 · 数据来自 Emory 大学公布的实验结果</div>`;}
 return {scene:S,cam,update,hud};}
