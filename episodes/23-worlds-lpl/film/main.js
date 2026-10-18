import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {B,BEAT,cl,sm,lerp,eio,eo,vis,back,H,REGC,GOLD,loadData} from './util.js';
import * as P from './panels.js';
const D=await loadData();
const LINES=await (await fetch('lines.json')).json();window.LINES=LINES;
const $=id=>document.getElementById(id);
const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,logarithmicDepthBuffer:true});R.setPixelRatio(1);R.setSize(1920,1080);
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;$('gl').appendChild(R.domElement);
const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(40,16/9,.1,4000);
const FOG=new THREE.Color('#4a1d55');S.fog=new THREE.Fog(FOG,60,420);
// ---- sky: arena glow, warm at the horizon
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{},vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec3 vP;void main(){float h=vP.y;vec3 top=vec3(.13,.05,.22),mid=vec3(.42,.12,.33),hor=vec3(.95,.36,.32);
 vec3 c=mix(hor,mid,smoothstep(0.,.18,h));c=mix(c,top,smoothstep(.18,.6,h));if(h<0.)c=mix(hor*.7,vec3(.18,.07,.2),smoothstep(0.,-.2,h));gl_FragColor=vec4(c,1.);}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(2000,48,24),skyMat);S.add(sky);
// env for reflections: the same sky plus a ring of red/blue light strips
{const es=new THREE.Scene();es.add(new THREE.Mesh(new THREE.SphereGeometry(100,32,16),skyMat));
 for(let i=0;i<24;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(3,18,1),new THREE.MeshBasicMaterial({color:i%2?'#ff4560':'#4f9dff'}));const a=i/24*Math.PI*2;m.position.set(Math.cos(a)*80,14,Math.sin(a)*80);m.lookAt(0,14,0);es.add(m);}
 const pm=new THREE.PMREMGenerator(R);S.environment=pm.fromScene(es,.03).texture;}
S.environmentIntensity=.9;
S.add(new THREE.HemisphereLight('#c9a2ff','#3a1838',.9));
const key=new THREE.DirectionalLight('#ffd2c0',1.4);key.position.set(-40,80,60);S.add(key);
// ---- floor: glossy stage
const floor=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),new THREE.MeshStandardMaterial({color:'#3a2150',roughness:.28,metalness:.55}));floor.rotation.x=-Math.PI/2;S.add(floor);
// floor light grid (thin emissive lines along the route)
const ST=[];for(let k=0;k<10;k++)ST.push(new THREE.Vector3(26*k,5.3,-30*k));
const dir=new THREE.Vector3(26,0,-30).normalize();const side=new THREE.Vector3(-dir.z,0,dir.x);// right-hand side
{const g=new THREE.Group();const mat=new THREE.MeshBasicMaterial({color:'#ff6a8a',transparent:true,opacity:.55,fog:true});const mat2=new THREE.MeshBasicMaterial({color:'#6fb0ff',transparent:true,opacity:.55});
 for(const s of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(.35,420),s<0?mat:mat2);m.rotation.x=-Math.PI/2;m.rotation.z=-Math.atan2(dir.x,-dir.z);const c=new THREE.Vector3(26*4,0.02,-30*4).addScaledVector(side,s*21);m.position.copy(c);m.position.y=.02;g.add(m);}
 S.add(g);}
// light pillars along both sides of the route
{const geo=new THREE.BoxGeometry(.9,14,.9);const n=70;const red=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:new THREE.Color('#ff4560').multiplyScalar(2.2)}),n);const blue=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:new THREE.Color('#4f9dff').multiplyScalar(2.2)}),n);
 const m=new THREE.Matrix4();for(let i=0;i<n;i++){const t=-40+i*7;const c=new THREE.Vector3().addScaledVector(dir,t);const hh=.6+.4*H(i,1);
  m.compose(c.clone().addScaledVector(side,-30).setY(7*hh),new THREE.Quaternion(),new THREE.Vector3(1,hh,1));red.setMatrixAt(i,m);
  m.compose(c.clone().addScaledVector(side,30).setY(7*hh),new THREE.Quaternion(),new THREE.Vector3(1,hh,1));blue.setMatrixAt(i,m);}
 S.add(red,blue);}
// ---- panels
const panels=[];
function makePanel(k,draw,w=16,h=9,cy=ST[k].y){const cv=document.createElement('canvas');cv.width=P.PW;cv.height=Math.round(P.PW*h/w);const ctx=cv.getContext('2d');const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
 const g=new THREE.Group();const scr=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,toneMapped:false,color:new THREE.Color(.86,.86,.86)}));g.add(scr);
 const fm=new THREE.MeshBasicMaterial({color:new THREE.Color(GOLD).multiplyScalar(1.05)});const t=.14;
 for(const [x,y,ww,hh] of [[0,h/2+t/2,w+2*t,t],[0,-h/2-t/2,w+2*t,t],[-w/2-t/2,0,t,h],[w/2+t/2,0,t,h]]){const b=new THREE.Mesh(new THREE.BoxGeometry(ww,hh,.12),fm);b.position.set(x,y,-.02);g.add(b);}
 const bk=new THREE.Mesh(new THREE.BoxGeometry(w+.5,h+.5,.3),new THREE.MeshStandardMaterial({color:'#1a0c24',roughness:.6,metalness:.3}));bk.position.z=-.2;g.add(bk);
 for(const s of [-1,1]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.35,cy-h/2,.35),new THREE.MeshStandardMaterial({color:'#2a1a36',roughness:.5,metalness:.6}));leg.position.set(s*w*.3,-(h/2)-(cy-h/2)/2,-.2);g.add(leg);}
 g.position.copy(ST[k]);g.position.y=cy;S.add(g);const p={k,g,ctx,tex,draw,w,h,center:ST[k].clone()};panels.push(p);return p;}
makePanel(0,P.draw0);makePanel(1,P.draw1);makePanel(2,P.draw2);makePanel(3,P.draw3,17,2.6,6.9);makePanel(4,P.draw4);makePanel(5,P.draw5);makePanel(6,P.draw6);makePanel(8,P.draw8);
// ---- station 3: 16 glass tubes filled by the simulated champions
const TEAMS=Object.keys(D.rating).sort((a,b)=>D.champ[b]-D.champ[a]);
const tubes=[];const tubeG=new THREE.Group();tubeG.position.copy(ST[3]).setY(0);tubeG.position.z+=3.2;S.add(tubeG);
const TH=4.2,TR=.3,SP=.86;
TEAMS.forEach((t,i)=>{const x=(i-(TEAMS.length-1)/2)*SP;const glass=new THREE.Mesh(new THREE.CylinderGeometry(TR,TR,TH,28,1,true),new THREE.MeshPhysicalMaterial({color:'#ffffff',roughness:.05,metalness:0,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));
 glass.position.set(x,TH/2+.25,0);const base=new THREE.Mesh(new THREE.CylinderGeometry(TR*1.25,TR*1.35,.25,28),new THREE.MeshStandardMaterial({color:'#2b1838',roughness:.4,metalness:.7}));base.position.set(x,.125,0);
 const col=new THREE.Color(REGC[D.region[t]]);const liq=new THREE.Mesh(new THREE.CylinderGeometry(TR*.86,TR*.86,1,24),new THREE.MeshBasicMaterial({color:col.clone().multiplyScalar(1.25)}));liq.position.set(x,.25,0);liq.scale.y=.001;
 tubeG.add(glass,base,liq);tubes.push({t,x,liq,col,glass});});
// rain particles into tubes
const NR=900;const rain=new THREE.InstancedMesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:'#ffffff'}),NR);rain.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(NR*3),3);tubeG.add(rain);
const rainTube=[];{const cum=[];let s=0;for(const t of TEAMS){s+=D.champ[t];cum.push(s);}for(let i=0;i<NR;i++){const r=H(i,9)*s;let j=cum.findIndex(c=>r<c);if(j<0)j=0;rainTube.push(j);const c=tubes[j].col.clone().multiplyScalar(1.6);rain.setColorAt(i,c);}}
// ---- station 0: data streams flying into the simulator
const NS=520;const stream=new THREE.InstancedMesh(new THREE.SphereGeometry(.06,8,6),new THREE.MeshBasicMaterial({color:'#fff'}),NS);stream.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(NS*3),3);S.add(stream);
{const regs=['LCK','LPL','LEC','LCS','LCP'];for(let i=0;i<NS;i++){const c=new THREE.Color(REGC[regs[Math.floor(H(i,2)*5)]]).multiplyScalar(1.8);stream.setColorAt(i,c);}}
// ---- station 7: three best-of-five gates between panel 6 and panel 8
const gates=[];{const a=ST[6].clone().add(new THREE.Vector3(0,0,13)),b=ST[8].clone().add(new THREE.Vector3(0,0,13));
 for(let i=0;i<3;i++){const f=.3+i*.2;const p=a.clone().lerp(b,f);p.y=0;const g=new THREE.Group();g.position.copy(p);g.rotation.y=Math.atan2(dir.x,dir.z)+Math.PI;
  const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(i===2?'#ff4560':GOLD).multiplyScalar(2.0)});const arc=new THREE.Mesh(new THREE.TorusGeometry(6.2,.22,12,64,Math.PI),mat);arc.position.y=2.6;g.add(arc);
  for(const s of [-1,1]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,2.6,12),mat);leg.position.set(s*6.2,1.3,0);g.add(leg);}
  S.add(g);gates.push({g,p:p.clone().setY(5.5)});}}
// ---- camera: one travel direction (forward-right), hold at each station with a slow push-in
const VIEW=(k,d)=>ST[k].clone().add(new THREE.Vector3(0,.25,d));
const HOLD=[[0,0,B(10),19,13.6],[1,B(10)+1.4,B(14),15.2,13.4],[2,B(14)+1.4,B(18),15.2,13.4],[3,B(18)+1.5,B(24),23.0,21.0],[4,B(24)+1.4,B(32),15.2,13.2],[5,B(32)+1.4,B(44),15.2,12.8],[6,B(44)+1.4,B(52),15.2,13.2],[8,B(56)+.3,131,15.4,13.4]];
function bez(a,b,c,d,t){const u=1-t;return a.clone().multiplyScalar(u*u*u).addScaledVector(b,3*u*u*t).addScaledVector(c,3*u*t*t).addScaledVector(d,t*t*t);}
function camAt(T){let pos,look;
 for(let i=0;i<HOLD.length;i++){const [k,ta,tb,d0,d1]=HOLD[i];const n=HOLD[i+1];
  if(T>=ta&&T<=tb||(i===0&&T<ta)){const f=cl((T-ta)/(tb-ta));pos=VIEW(k,lerp(d0,d1,f));pos.x+=.4*Math.sin(f*Math.PI)*.5;look=ST[k].clone().add(new THREE.Vector3(0,-.15,0));if(k===3)look.y=2.5;if(k===3)pos.y=4.2;break;}
  if(n&&T>tb&&T<n[1]){const [k2,ta2,,d02]=n;const f=eio((T-tb)/(ta2-tb));const p0=VIEW(k,d1),p3=VIEW(k2,d02);if(k===3)p0.y=4.2;if(k2===3)p3.y=4.2;
   const span=k2-k;const p1=p0.clone().add(new THREE.Vector3(10*span,0,-3*span)),p2=p3.clone().add(new THREE.Vector3(-5*span,0,9*span));
   if(k===6){// gate run: straight through the gate centres, each gate passed on a beat
    const g=gates.map(x=>x.p);const fg=GF(T);pos=pathThrough([p0,...g,p3],fg);}else pos=bez(p0,p1,p2,p3,f);
   const l0=ST[k].clone(),l3=ST[k2].clone();if(k===3)l0.y=2.5;if(k2===3)l3.y=2.5;
   if(k===6){const fg=GF(T);const ahead=pathThrough([p0,...gates.map(x=>x.p),p3],Math.min(1,fg+.08));look=ahead.clone().add(new THREE.Vector3(0,-.2,0)).lerp(l3,sm(.75,1,f));}
   else look=l0.clone().lerp(l3,sm(.15,.85,f));break;}}
 return {p:pos,l:look};}
function pathThrough(pts,f){// piecewise linear with smoothed corners, parameter by length
 const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+pts[i].distanceTo(pts[i-1]));const s=f*L[L.length-1];let i=1;while(i<pts.length-1&&L[i]<s)i++;const u=(s-L[i-1])/(L[i]-L[i-1]);return pts[i-1].clone().lerp(pts[i],u);}
// gate timing: path-length fraction as a monotone cubic through (time, fraction) knots
export const GATE_T=[B(54)+BEAT,B(54)+BEAT*3,B(54)+BEAT*5];
function mono(pts){const n=pts.length,x=pts.map(p=>p[0]),y=pts.map(p=>p[1]);const d=[],m=new Array(n).fill(0);for(let i=0;i<n-1;i++)d.push((y[i+1]-y[i])/(x[i+1]-x[i]));
 m[0]=0;m[n-1]=0;for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
 for(let i=0;i<n-1;i++){const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;if(s>9){const t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i];}}
 return u=>{if(u<=x[0])return y[0];if(u>=x[n-1])return y[n-1];let i=0;while(u>x[i+1])i++;const h=x[i+1]-x[i],t=(u-x[i])/h,t2=t*t,t3=t2*t;return (2*t3-3*t2+1)*y[i]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*y[i+1]+(t3-t2)*h*m[i+1];};}
let GF=null;{const p0=VIEW(6,HOLD[6][4]),p3=VIEW(8,HOLD[7][3]);const pts=[p0,...gates.map(g=>g.p),p3];const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+pts[i].distanceTo(pts[i-1]));const tot=L[L.length-1];
 GF=mono([[HOLD[6][2],0],[HOLD[6][2]+.6,.004],...GATE_T.map((t,i)=>[t,L[i+1]/tot]),[HOLD[7][1],1]]);}
window.camAt=camAt;
// gate pass times (for the HUD product)
// ---- post
const comp=new EffectComposer(R);comp.addPass(new RenderPass(S,cam));
comp.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r)||!(c.g==c.g)||!(c.b==c.b))c=vec4(0.);gl_FragColor=vec4(clamp(c.rgb,0.,40.),1.);}`}));
const bloom=new UnrealBloomPass(new THREE.Vector2(960,540),.42,.5,.9);comp.addPass(bloom);
const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},uVig:{value:.26}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform float uVig;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float v=smoothstep(1.15,.25,length((vUv-.5)*vec2(1.25,1.)));c.rgb*=mix(1.-uVig,1.,v);gl_FragColor=c;}`});
comp.addPass(grade);comp.addPass(new OutputPass());
// ---- HUD helpers
let HT='';const pj=v=>{const p=v.clone().project(cam);return [(p.x+1)/2*1920,(1-p.y)/2*1080,p.z];};
const sub=t=>{$('sub').innerHTML=t?'<span>'+t.replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';};
function lab(x,y,k,n,u,{col='#fff',kc='#fff',uc=GOLD,o=1,s=1,align='left',size=120}={}){if(o<=0)return;const tx=align==='center'?'-50%':align==='right'?'-100%':'0';
 HT+=`<div class="lab" style="left:${x}px;top:${y}px;opacity:${o};transform:translate(${tx},0) scale(${s});transform-origin:${align==='center'?'50%':'0'} 50%"><span class="k" style="color:${kc}">${k}</span><span class="n" style="color:${col};font-size:${size}px">${n}</span><span class="u" style="color:${uc}">${u}</span></div>`;}
// ---- the frame
let lastDraw={};
window.renderAt=function(T){HT='';
 const c=camAt(T);cam.position.copy(c.p);cam.lookAt(c.l);cam.updateProjectionMatrix();
 // panels: redraw only the ones near the camera
 for(const p of panels){const d=cam.position.distanceTo(p.g.position);p.g.visible=d<140;if(d<90){p.draw(p.ctx,T);p.tex.needsUpdate=true;}}
 // stream particles (hook): flowing forward into panel 0
 {const o=1-sm(15.5,16.6,T);const m=new THREE.Matrix4();const tgt=ST[0].clone().add(new THREE.Vector3(3.2,0,0.3));
  for(let i=0;i<NS;i++){const per=2.2+H(i,4)*1.6;const ph=((T/per+H(i,5))%1);const sx=(H(i,6)-.5)*34,sy=1+H(i,7)*10;const start=new THREE.Vector3(sx,sy,6+H(i,8)*8);
   const p=start.lerp(tgt,eio(ph));const sc=o*(ph<.05?ph/.05:ph>.92?(1-ph)/.08:1);m.compose(p,new THREE.Quaternion(),new THREE.Vector3(sc,sc,sc*3));stream.setMatrixAt(i,m);}
  stream.instanceMatrix.needsUpdate=true;stream.visible=o>0;}
 // tubes: fill as the simulated champions rain in
 {const prog=cl((T-37.3)/3.3);const m=new THREE.Matrix4();const mx=D.champ[TEAMS[0]];const dimOthers=sm(B(22)-.2,B(22)+.3,T);
  const showReg=sm(B(20)-.2,B(20)+.2,T);
  tubes.forEach((tb,i)=>{const h=(TH-.3)*D.champ[tb.t]/mx*eo(prog);tb.liq.scale.y=Math.max(.001,h);tb.liq.position.y=.25+h/2;
   const isB=tb.t==='BLG';tb.liq.material.color.copy(tb.col).multiplyScalar(isB?1.25+1.2*dimOthers:1.25*(1-.7*dimOthers));});
  for(let i=0;i<NR;i++){const t0=37.3+H(i,10)*3.0;const u=(T-t0)/.9;const j=rainTube[i];let p;
   if(u<0||u>1){m.makeScale(0,0,0);}else{const x=tubes[j].x+(H(i,11)-.5)*.2;const y=lerp(TH+3.5,.4+ (TH-.3)*D.champ[tubes[j].t]/mx*eo(prog),u*u);m.compose(new THREE.Vector3(x,y,(H(i,12)-.5)*.2),new THREE.Quaternion(),new THREE.Vector3(1,1,1));}
   rain.setMatrixAt(i,m);}rain.instanceMatrix.needsUpdate=true;
  // tube labels
  const tv=vis(T,36.6,B(24)+1.6,.4);if(tv>0){tubes.forEach((tb,i)=>{const [x,y,z]=pj(new THREE.Vector3(tb.x,-.05,.5).add(tubeG.position));if(z>1)return;const a=tv*(1-.75*dimOthers*(tb.t!=='BLG'));
    HT+=`<div class="chip" style="left:${x}px;top:${y+16+(i%2)*30}px;font-size:28px;opacity:${a};color:${REGC[D.region[tb.t]]}">${tb.t}</div>`;
    const h=(TH-.3)*D.champ[tb.t]/mx*eo(prog);const [x2,y2]=pj(new THREE.Vector3(tb.x,.25+h+.35,0).add(tubeG.position));const v=D.champ[tb.t];
    if(v>=1&&prog>.2)HT+=`<div class="chip" style="left:${x2}px;top:${y2-(i%2)*34}px;font-size:${v>8?34:28}px;opacity:${a*sm(.2,.5,prog)}">${v>=1?Math.round(v*prog):(v*prog).toFixed(1)}%</div>`;});}
  if(showReg>0){const o=showReg*vis(T,B(20)-.2,B(24)+1.2,.3)*(1-.0*dimOthers);
   lab(110,560,'LCK 夺冠','<span>'+Math.round(D.reg.LCK)+'</span>','%',{col:REGC.LCK,o:o*(1-.6*dimOthers),s:back(T,B(20))});
   lab(1810,560,'LPL 夺冠',''+Math.round(D.reg.LPL),'%',{col:REGC.LPL,o,s:back(T,B(20)+BEAT),align:'right'});
   if(dimOthers>0){lab(1810,330,'其中 BLG',''+D.champ.BLG.toFixed(1),'%',{col:'#fff',o:dimOthers*o,s:back(T,B(22)+BEAT),align:'right',size:96});}}}
 // console drop hits
 {const st=P.state5(T);const o=vis(T,B(40),B(44),.25);if(o>0){const big=T<B(42)?34.9:45.7;lab(960,170,T<B(42)?'最顺的路 · LPL 夺冠':'GEN、HLE 四强前出局 · LPL 夺冠',''+Math.round(big),'%',{col:REGC.LPL,o,s:back(T,T<B(42)?B(40):B(42),.4),align:'center',size:210});}}
 // gates: running product
 {const o=vis(T,B(52)+.4,B(56)+.3,.3);if(o>0){const pass=GATE_T;
   const n=pass.filter(t=>T>=t).length;const vals=['60%','× 60%','× 60%'];let s='';for(let i=0;i<3;i++){const on=i<n||(i===0&&T>=B(52)+.6);s+=`<span style="opacity:${on?1:.25};margin:0 10px">${vals[i]}</span>`;}
   HT+=`<div class="lab" style="left:960px;top:150px;transform:translate(-50%,0);opacity:${o}"><span class="n" style="font-size:96px">${s}</span></div>`;
   if(T>=pass[2]+.3)lab(960,330,'连赢三个 BO5','≈22','%',{col:REGC.LPL,o,s:back(T,pass[2]+.3,.4),align:'center',size:200});
   gates.forEach((g,i)=>{const [x,y,z]=pj(g.p.clone().add(new THREE.Vector3(0,2.0,0)));const nx=pass.findIndex(t=>T<t+.1);if(z<1&&i===nx)HT+=`<div class="chip" style="left:${x}px;top:${y}px;font-size:56px;color:${i===2?REGC.LPL:GOLD};opacity:${o}">${['八强','半决赛','决赛'][i]} · 60%</div>`;});}}
 // title plaque on the bar-8 hit
 {const o=vis(T,B(8),B(10)+.15,.12);if(o>0){const s=back(T,B(8),.45);HT+=`<div class="plaque" style="opacity:${o};transform:translate(-50%,0) scale(${.86+.14*s})"><div class="box"><div class="t"><b>五分之一</b></div><div class="d">LPL 夺冠概率 ≈ ${Math.round(D.reg.LPL)}% · 十万次模拟</div></div></div>`;}}
 $('hud').innerHTML=HT;
 const L=LINES.find(l=>T>=l[0]&&T<l[1]);sub(L?L[2]:'');
 $('end').style.opacity=sm(B(61.74),B(61.74)+.5,T);
 comp.render();};
await document.fonts.load('900 60px "Noto Sans CJK SC"');await document.fonts.load('700 60px "Noto Sans CJK SC"');await document.fonts.load('900 60px "Inter Display"');await document.fonts.ready;
// collision check: camera vs panels / tubes / gates, sampled over the film
window.check=function(){const bad=[];let minP=1e9,minT=1e9,minG=1e9;
 const boxes=panels.map(p=>{p.g.updateMatrixWorld(true);return new THREE.Box3().setFromObject(p.g);});const tb=new THREE.Box3().setFromObject(tubeG);
 for(let f=0;f<3899;f+=2){const T=f/30;const {p}=camAt(T);for(const b of boxes){const d=b.distanceToPoint(p);minP=Math.min(minP,d);if(d<.8)bad.push([+T.toFixed(2),'panel',+d.toFixed(2)]);}
  const dt=tb.distanceToPoint(p);minT=Math.min(minT,dt);if(dt<.8)bad.push([+T.toFixed(2),'tubes',+dt.toFixed(2)]);
  for(const g of gates){const q=p.clone().sub(g.g.position);const r=Math.hypot(q.x,q.y-2.6,q.z);// distance to the arch ring
   const lr=new THREE.Vector3(q.x,q.y,q.z).applyAxisAngle(new THREE.Vector3(0,1,0),-g.g.rotation.y);const ring=Math.abs(Math.hypot(lr.x,lr.y-2.6)-6.2);const dz=Math.abs(lr.z);if(dz<1)minG=Math.min(minG,ring);if(dz<.6&&ring<.9)bad.push([+T.toFixed(2),'gate',+ring.toFixed(2)]);}
  if(p.y<1)bad.push([+T.toFixed(2),'low',p.y]);}
 return {bad:bad.slice(0,30),n:bad.length,minP,minT,minG};};
window.renderAt(0);window.READY=true;
