// Hook + ending: your phone on a plinth (¥4,000 first internship pay). The roommate's phone slides in (¥6,000); yours dims.
// Ending: a single grape glows beside your phone; then the screen compares you with last year's you.
import {U} from './util.js';
import {stage,glowTex,pool,sprite,camPath} from './stage.js';
const {pr,eio,eo,lerp,cl,pop}=U;
export async function makePhones(THREE,R){
 const {S,tickDust}=stage(THREE,{fog:.05});const cam=new THREE.PerspectiveCamera(32,16/9,.02,200);const gt=glowTex(THREE);
 const plinth=new THREE.Mesh(new THREE.BoxGeometry(2.6,.8,1.2),new THREE.MeshStandardMaterial({color:0x101218,roughness:.35,metalness:.2}));plinth.position.y=.4;S.add(plinth);
 const mkScreen=()=>{const c=document.createElement('canvas');c.width=540;c.height=1080;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return {c,x:c.getContext('2d'),t};};
 const phone=(x)=>{const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(.36,.025,.72),new THREE.MeshStandardMaterial({color:0x0b0c10,roughness:.3,metalness:.6}));g.add(body);
  const sc=mkScreen();const scr=new THREE.Mesh(new THREE.PlaneGeometry(.33,.68),new THREE.MeshBasicMaterial({map:sc.t,transparent:true}));scr.rotation.x=-Math.PI/2;scr.position.y=.014;g.add(scr);
  const gl=sprite(THREE,gt,0xffe0b0,1.2);gl.position.y=.12;g.add(gl);g.position.set(x,.815,0);S.add(g);return {g,sc,scr,gl};};
 const P1=phone(-.35),P2=phone(.75);
 const draw=(p,{title,amount,sub,col,dim,tag})=>{const x=p.sc.x;x.clearRect(0,0,540,1080);const gr=x.createLinearGradient(0,0,0,1080);gr.addColorStop(0,'#141a2a');gr.addColorStop(1,'#07090f');x.fillStyle=gr;x.fillRect(0,0,540,1080);
  x.fillStyle='rgba(255,255,255,.08)';x.beginPath();x.roundRect(40,330,460,340,36);x.fill();
  x.font='700 34px "Noto Sans CJK SC"';x.fillStyle='#9aa2b4';x.textAlign='left';x.fillText(title,80,400);
  x.font='900 112px "Noto Serif CJK SC"';x.fillStyle=col;x.fillText(amount,72,540);x.font='700 30px "Noto Sans CJK SC"';x.fillStyle='#c9cfdb';x.fillText(sub,80,620);
  if(tag){x.font='900 40px "Noto Sans CJK SC"';x.fillStyle='#F6CF78';x.fillText(tag,80,760);}
  x.fillStyle=`rgba(0,0,0,${dim})`;x.fillRect(0,0,540,1080);p.sc.t.needsUpdate=true;};
 const grape=new THREE.Mesh(new THREE.SphereGeometry(.07,24,16),new THREE.MeshPhysicalMaterial({color:0x5a2a6e,roughness:.25,clearcoat:.8,emissive:0x2a0f38,emissiveIntensity:.6}));S.add(grape);const gg=sprite(THREE,gt,0xc890ff,.6);S.add(gg);
 const spot=new THREE.SpotLight(0xffe2b8,50,10,.5,.6,1.4);spot.position.set(0,3.4,1.6);spot.target.position.set(0,.8,0);S.add(spot);S.add(spot.target);S.add(pool(THREE,0xffc070,2.6,.5));
 const KA=camPath(THREE,[[0,-.35,1.55,.95,-.35,.82,0],[4.4,-.3,1.7,1.25,-.3,.82,-.05],[8.5,.15,1.9,1.7,.2,.82,0],[12.5,.2,2.1,2.0,.2,.82,0],[20.8,.2,2.6,2.8,.2,.85,0]]);
 const KC=camPath(THREE,[[105.4,.4,2.6,3.0,.2,.85,0],[109.7,-.1,1.7,1.5,-.2,.82,0],[117.8,-.35,1.6,1.05,-.35,.82,0],[125.6,-.35,2.4,2.4,-.2,.85,0]]);
 let last='';
 function update(T){const [p,l]=(T<60?KA:KC)(T);cam.position.copy(p);cam.lookAt(l);tickDust(T,new THREE.Vector3(0,0,0));
  const early=T<60;const day=T<4.4?1:Math.min(3,1+Math.floor((T-4.4)/1.3));
  const in2=early?eio(pr(T,8.4,9.6)):0;P2.g.visible=in2>0;P2.g.position.x=lerp(2.4,.75,in2);P2.g.rotation.y=lerp(.4,0,in2);
  const dim=early?.65*pr(T,12.5,13.6)*(1-pr(T,20,21)):0;
  let s1;if(early)s1={title:'实习工资 · 到账',amount:'¥4,000',sub:T<4.4?'刚刚':`开心的第 ${day} 天`,col:'#F6CF78',dim,tag:''};
  else if(T<117.8)s1={title:'实习工资 · 到账',amount:'¥4,000',sub:'',col:'#F6CF78',dim:.35*(1-pr(T,113.8,115)),tag:''};
  else s1={title:'跟去年的自己比',amount:'+¥4,000',sub:'去年这时候：¥0',col:'#F6CF78',dim:0,tag:''};
  const key=JSON.stringify(s1);if(key!==last){draw(P1,s1);last=key;}
  if(P2.g.visible&&!P2.drawn){draw(P2,{title:'室友的实习工资',amount:'¥6,000',sub:'',col:'#ffffff',dim:0,tag:''});P2.drawn=true;}
  P1.gl.material.opacity=(.55-.45*dim/.65)*(early?1:1);P2.gl.material.opacity=.6*in2;
  // the grape (ending): sits beside your phone at 109.7–117.8
  const go=early?0:pr(T,109.9,110.6)*(1-pr(T,117.4,118.0));grape.visible=gg.visible=go>0;grape.position.set(.12,.88+.02*Math.sin(T*2),.05);grape.scale.setScalar(Math.max(.001,go));gg.position.copy(grape.position);gg.material.opacity=.7*go;}
 return {scene:S,cam,update};}
