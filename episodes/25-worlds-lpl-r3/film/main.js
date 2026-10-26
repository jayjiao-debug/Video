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
// icons: local copies, or straight from Riot Data Dragon on the render farm (?cdn=1); not committed to the repo
const CDN=new URLSearchParams(location.search).get('cdn')==='1';
const ICON=n=>CDN?`https://ddragon.leagueoflegends.com/cdn/16.20.1/img/champion/${D.ids[n]||n}.png`:'icons/icon_'+(D.ids[n]||n)+'.png';
// ---- champion icons (Riot Data Dragon)
{const names=new Set();for(const g of D.r1_games)for(const s of ['blue','red'])for(const n of [...g[s].picks,...g[s].bans])names.add(n);for(const r of D.presence)names.add(r[0]);
 await Promise.all([...names].map(n=>new Promise(r=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{P.IMG[n]=im;r()};im.onerror=()=>r();im.src=ICON(n);})));}
const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(1920,1080);R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;$('gl').appendChild(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color('#07060a');S.fog=new THREE.Fog('#0b0910',60,190);
const cam=new THREE.PerspectiveCamera(36,16/9,.1,800);
S.add(new THREE.HemisphereLight('#ffffff','#202030',.55));const key=new THREE.DirectionalLight('#fff1dc',1.2);key.position.set(-20,40,30);S.add(key);
const glow=(c,k=1.2)=>new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(k),toneMapped:false});
// ---- stage: stations along +x, one travel direction
const GAP=62;const ST=[];for(let k=0;k<10;k++)ST.push(new THREE.Vector3(k*GAP,0,0));
const floor=new THREE.Mesh(new THREE.PlaneGeometry(1400,400),new THREE.MeshStandardMaterial({color:'#0d0b08',roughness:.32,metalness:.6}));floor.rotation.x=-Math.PI/2;floor.position.set(GAP*4.5,-9.5,0);S.add(floor);
{// gold light strips along the route (floor) + pillars behind
 const m=glow(GOLD,.9);for(const z of [-14,16]){const s=new THREE.Mesh(new THREE.BoxGeometry(GAP*11,.08,.25),m);s.position.set(GAP*4.5,-9.45,z);S.add(s);}
 const geo=new THREE.BoxGeometry(.6,22,.6);const n=60;const pil=new THREE.InstancedMesh(geo,glow(GOLD,.28),n);const M=new THREE.Matrix4();
 for(let i=0;i<n;i++){const x=-30+i*12;const h=.5+.5*H(i,3);M.compose(new THREE.Vector3(x,-9.5+11*h,-46),new THREE.Quaternion(),new THREE.Vector3(1,h,1));pil.setMatrixAt(i,M);}S.add(pil);}
// ---- the Swiss machine (balls = simulated runs)
const machines=[];
function makeMachine(k,sc,NB,seed){const g=new THREE.Group();g.position.copy(ST[k]);g.scale.setScalar(sc);S.add(g);
 const XS=2.6,YS=2.7,Y0=8.2;const pos=(w,l)=>new THREE.Vector3((w-l)*XS,Y0-(w+l)*YS,0);
 const bt=(()=>{const c=document.createElement('canvas');c.width=2048;c.height=1566;const x=c.getContext('2d');x.fillStyle='#14110c';x.fillRect(0,0,c.width,c.height);
  for(let i=0;i<900;i++){x.strokeStyle=`rgba(246,207,120,${.02+H(i,seed)*.03})`;x.beginPath();const y=H(i,seed+1)*c.height;x.moveTo(0,y);x.lineTo(c.width,y+H(i,seed+2)*4-2);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
 const bm=new THREE.MeshStandardMaterial({color:'#14110c',roughness:.35,metalness:.6});
 const board=new THREE.Mesh(new THREE.BoxGeometry(34,26,.6),[bm,bm,bm,bm,new THREE.MeshStandardMaterial({map:bt,roughness:.4,metalness:.4}),bm]);board.position.set(0,-.6,-1.1);g.add(board);
 for(const [x,y,w,h] of [[0,12.4,34.4,.35],[0,-13.6,34.4,.35],[-17.1,-.6,.35,26.4],[17.1,-.6,.35,26.4]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.3),glow(GOLD,.45));m.position.set(x,y,-.6);g.add(m);}
 const edgeMat=new THREE.MeshBasicMaterial({color:new THREE.Color(GOLD).multiplyScalar(.5),transparent:true,opacity:.5,toneMapped:false});
 const nodes=[];for(let w=0;w<=3;w++)for(let l=0;l<=3;l++){if(w===3&&l===3)continue;if(w+l>5)continue;nodes.push({w,l,term:w===3||l===3});}
 for(const n of nodes){if(n.term)continue;for(const [dw,dl] of [[1,0],[0,1]]){const a=pos(n.w,n.l),b=pos(n.w+dw,n.l+dl);const e=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,a.distanceTo(b),8),edgeMat);e.position.copy(a).add(b).multiplyScalar(.5);e.position.z=-.3;e.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());g.add(e);}}
 const label=(text,col,size,w=4,h=1)=>{const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.font=`900 ${size}px "Noto Serif CJK SC"`;x.fillStyle=col;x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,toneMapped:false,depthWrite:false}));};
 for(const n of nodes){const p=pos(n.w,n.l);
  if(!n.term){const peg=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,1.4,40),new THREE.MeshStandardMaterial({color:'#222',roughness:.25,metalness:.9}));peg.rotation.x=Math.PI/2;peg.position.copy(p);g.add(peg);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.66,.07,12,48),glow(GOLD));ring.position.copy(p).setZ(.28);g.add(ring);const lb=label(`${n.w}-${n.l}`,'#ffffff',60);lb.scale.set(.5,.5,1);lb.position.copy(p).setZ(.74);g.add(lb);}
  else{const q=n.w===3;const bin=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.9,1.2),new THREE.MeshPhysicalMaterial({color:new THREE.Color(q?GOLD:'#5a5560'),roughness:.08,transparent:true,opacity:.22,depthWrite:false,emissive:new THREE.Color(q?GOLD:'#5a5560').multiplyScalar(q?.12:.04)}));bin.position.copy(p).setY(p.y-.2);g.add(bin);
   const lip=new THREE.Mesh(new THREE.BoxGeometry(2.4,.12,.9),glow(q?GOLD:'#5a5560'));lip.position.copy(p).setY(p.y+.6);g.add(lip);
   const lb=label(q?`${n.w}-${n.l} 晋级`:`${n.w}-${n.l} 淘汰`,q?GOLD:'#9a97a6',58);lb.scale.set(1.1,1.1,1);lb.position.copy(p).setY(p.y-1.75).setZ(.8);g.add(lb);}}
 const top=label('0-0  ·  16 支队','#ffffff',56);top.scale.set(1.1,1.1,1);top.position.set(0,Y0+2.1,.4);g.add(top);
 const balls=[];for(let i=0;i<NB;i++){let w=0,l=0;const path=[[0,0]];const r=H(i,seed+5);const reg=r<.25?'lpl':r<.5?'lck':'oth';const pw=reg==='lck'?.62:reg==='lpl'?.55:.42;
  let j=0;while(w<3&&l<3){if(H(i*7+j,seed+6)<pw)w++;else l++;path.push([w,l]);j++;}balls.push({path,reg,t0:H(i,seed+7)*9,sp:.85+H(i,seed+8)*.35,jit:(H(i,seed+9)-.5)*.5,jz:(H(i,seed+10)-.5)*.5});}
 {const c={};for(const b of balls){const k=b.path[b.path.length-1].join('-');b.slot=c[k]=(c[k]||0)+1;}}
 const geo=new THREE.SphereGeometry(.17,14,10);const mats={lpl:glow(REGC.LPL),lck:glow(REGC.LCK),oth:new THREE.MeshStandardMaterial({color:'#e9e2d0',roughness:.2,metalness:.8,emissive:new THREE.Color('#e9e2d0').multiplyScalar(.25)})};
 const inst={},ghost={};for(const k of ['lpl','lck','oth']){inst[k]=new THREE.InstancedMesh(geo,mats[k],NB);inst[k].frustumCulled=false;g.add(inst[k]);const gm=mats[k].clone();gm.transparent=true;gm.opacity=.35;ghost[k]=new THREE.InstancedMesh(geo,gm,NB*2);ghost[k].frustumCulled=false;g.add(ghost[k]);}
 const V=new THREE.Vector3(),M=new THREE.Matrix4(),Qn=new THREE.Quaternion(),ONE=new THREE.Vector3(1,1,1),SC=new THREE.Vector3();
 function ballPos(b,t,out){const tt=(t-b.t0)*b.sp,hop=.62,seg=Math.floor(tt/hop);if(tt<0)return false;const p=b.path;
  if(seg>=p.length-1){const [w,l]=p[p.length-1];const c=pos(w,l);const k=b.slot;if(k>30)return false;out.set(c.x-.9+(k%6)*.36,c.y-.8+Math.floor(k/6)*.3,.1+((k*7)%3)*.12);return true;}
  const u=tt/hop-seg;const a=pos(...p[seg]),c=pos(...p[seg+1]);out.lerpVectors(a,c,u);out.y+=Math.sin(u*Math.PI)*.9;out.x+=b.jit*.4*Math.sin(u*Math.PI);out.z=.7+b.jz;return true;}
 const m={g,update(t){const cnt={lpl:0,lck:0,oth:0},gc={lpl:0,lck:0,oth:0};
  for(const b of balls){if(ballPos(b,t,V)){M.compose(V,Qn,ONE);inst[b.reg].setMatrixAt(cnt[b.reg]++,M);const tt=(t-b.t0)*b.sp;
    if(tt/.62<b.path.length-1)for(const [dt,s] of [[.045,.75],[.09,.5]])if(ballPos(b,t-dt,V)){SC.setScalar(s);M.compose(V,Qn,SC);ghost[b.reg].setMatrixAt(gc[b.reg]++,M);}}}
  for(const k in inst){inst[k].count=cnt[k];inst[k].instanceMatrix.needsUpdate=true;ghost[k].count=gc[k];ghost[k].instanceMatrix.needsUpdate=true;}}};
 machines.push(m);return m;}
const M0=makeMachine(0,.5,700,11),M5=makeMachine(5,.5,900,23);M5.g.position.x+=4.5;
// ---- LED screens
const screens=[];
function makeScreen(k,draw,w=17,h=9.5,y=0,x=0){const cv=document.createElement('canvas');cv.width=P.PW;cv.height=Math.round(P.PW*h/w);const ctx=cv.getContext('2d');const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
 const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,toneMapped:false,color:new THREE.Color(.9,.9,.9)})));
 const fm=glow(GOLD,.8),t=.12;for(const [fx,fy,ww,hh] of [[0,h/2+t/2,w+2*t,t],[0,-h/2-t/2,w+2*t,t],[-w/2-t/2,0,t,h],[w/2+t/2,0,t,h]]){const b=new THREE.Mesh(new THREE.BoxGeometry(ww,hh,.12),fm);b.position.set(fx,fy,-.02);g.add(b);}
 const bk=new THREE.Mesh(new THREE.BoxGeometry(w+.4,h+.4,.3),new THREE.MeshStandardMaterial({color:'#100d08',roughness:.6,metalness:.3}));bk.position.z=-.2;g.add(bk);
 for(const s of [-1,1]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.3,9.5+y-h/2,.3),new THREE.MeshStandardMaterial({color:'#2a2418',roughness:.5,metalness:.7}));leg.position.set(s*w*.3,-(h/2)-(9.5+y-h/2)/2,-.2);g.add(leg);}
 g.position.copy(ST[k]).add(new THREE.Vector3(x,y,0));S.add(g);const p={k,g,ctx,tex,draw};screens.push(p);return p;}
makeScreen(1,P.drawR1);makeScreen(2,P.drawLater);makeScreen(4,P.drawFacts,17,9.5,0,-4.5);makeScreen(6,P.drawPaths);makeScreen(7,P.drawQF);makeScreen(8,P.drawAI);makeScreen(9,P.drawClose);
// ---- station 3: the BP wall — ten champion tiles with presence columns
const tiles=[];{const L=D.presence.slice(0,10);const tl=new THREE.TextureLoader();
 L.forEach(([name,pk,bn,pres,wr],i)=>{const x=ST[3].x+(i-4.5)*2.9;const tex=tl.load(ICON(name));tex.colorSpace=THREE.SRGBColorSpace;
  const t=new THREE.Mesh(new THREE.BoxGeometry(2.3,2.3,.25),[...Array(4)].map(()=>new THREE.MeshStandardMaterial({color:'#2a2418',metalness:.8,roughness:.3})).concat([new THREE.MeshBasicMaterial({map:tex,toneMapped:false}),new THREE.MeshStandardMaterial({color:'#2a2418'})]));
  t.position.set(x,3.2,0);S.add(t);const frame=new THREE.Mesh(new THREE.BoxGeometry(2.5,2.5,.18),glow(i===0?REGC.LPL:GOLD,.7));frame.position.set(x,3.2,-.05);S.add(frame);
  const colB=new THREE.Mesh(new THREE.BoxGeometry(1.0,1,1.0),glow('#ff4560',.8)),colP=new THREE.Mesh(new THREE.BoxGeometry(1.0,1,1.0),glow(GOLD,.9));colB.position.set(x-.55,-9.5,0);colP.position.set(x+.55,-9.5,0);S.add(colB,colP);
  tiles.push({name,pk,bn,pres,wr,t,frame,colB,colP,x});});}
// ---- station 4: a gold coin that won't settle
const coin=new THREE.Group();{const ct=(txt)=>{const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');const g=x.createRadialGradient(256,220,40,256,256,256);g.addColorStop(0,'#fff1c2');g.addColorStop(1,'#b8862e');x.fillStyle=g;x.beginPath();x.arc(256,256,250,0,7);x.fill();
  x.strokeStyle='#7a5418';x.lineWidth=14;x.beginPath();x.arc(256,256,214,0,7);x.stroke();x.font='900 170px "Noto Serif CJK SC"';x.fillStyle='#5a3a0c';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,262);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;};
 const side=new THREE.MeshStandardMaterial({color:'#c89a3c',metalness:1,roughness:.25});const body=new THREE.Mesh(new THREE.CylinderGeometry(3,3,.36,64),[side,new THREE.MeshStandardMaterial({map:ct('赢'),metalness:.6,roughness:.3}),new THREE.MeshStandardMaterial({map:ct('输'),metalness:.6,roughness:.3})]);
 body.rotation.x=Math.PI/2;coin.add(body);coin.position.copy(ST[4]).add(new THREE.Vector3(10.2,0,1.5));S.add(coin);}
// ---- camera: hold at each station, glide right between them (x never decreases)
const HOLD=[[0,B(10)-.2,B(14)-.75,20,18],[1,B(14)+.15,B(22)-.75,17.5,16],[2,B(22)+.15,B(26)-.75,17.5,16.2],[3,B(26)+.15,B(32)-.75,37,34],[4,B(32)+.15,B(38)-.75,31,29],[5,B(38)+.15,B(44)-.75,23,21],[6,B(44)+.15,B(50)-.75,17.5,16],[7,B(50)+.15,B(54)-.75,17.5,16.2],[8,B(54)+.15,B(56)-.75,17.5,16.6],[9,B(56)+.15,140,17.5,16]];
const VIEW=(k,d)=>ST[k].clone().add(new THREE.Vector3(k===4?2.5:k===5?-2:0,k===3?-.4:.2,d));
function camAt(T){for(let i=0;i<HOLD.length;i++){const [k,ta,tb,d0,d1]=HOLD[i],n=HOLD[i+1];
  if(T<=tb||!n){const f=cl((T-ta)/(tb-ta));const p=VIEW(k,lerp(d0,d1,eio(f)));const l=ST[k].clone().add(new THREE.Vector3(k===4?2.5:k===5?-2:0,k===3?-1.2:0,0));return {p,l};}
  if(T<n[1]){const f=eio((T-tb)/(n[1]-tb));const p0=VIEW(k,d1),p3=VIEW(n[0],n[3]);const p=p0.clone().lerp(p3,f);p.z+=Math.sin(f*Math.PI)*6;p.y+=Math.sin(f*Math.PI)*1.2;
   const l0=ST[k].clone(),l3=ST[n[0]].clone();const l=l0.lerp(l3,sm(.15,.85,f));return {p,l};}}}
window.camAt=camAt;
// ---- post
const comp=new EffectComposer(R);comp.addPass(new RenderPass(S,cam));
comp.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r)||!(c.g==c.g)||!(c.b==c.b))c=vec4(0.);gl_FragColor=vec4(clamp(c.rgb,0.,40.),1.);}`}));
comp.addPass(new UnrealBloomPass(new THREE.Vector2(960,540),.5,.5,.7));
comp.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float v=smoothstep(1.15,.25,length((vUv-.5)*vec2(1.25,1.)));c.rgb*=mix(.72,1.,v);gl_FragColor=c;}`}));
comp.addPass(new OutputPass());
// ---- HUD
let HT='';const pj=v=>{const p=v.clone().project(cam);return [(p.x+1)/2*1920,(1-p.y)/2*1080,p.z];};
const sub=t=>{$('sub').innerHTML=t?'<span>'+t.replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';};
function lab(x,y,k,n,u,{col='#fff',o=1,s=1,align='left',size=120}={}){if(o<=0)return;const tx=align==='center'?'-50%':align==='right'?'-100%':'0';
 HT+=`<div class="lab" style="left:${x}px;top:${y}px;opacity:${o};transform:translate(${tx},0) scale(${s});transform-origin:${align==='center'?'50%':'0'} 50%"><span class="k">${k}</span><span class="n" style="color:${col};font-size:${size}px">${n}</span><span class="u">${u}</span></div>`;}
window.renderAt=function(T){HT='';const c=camAt(T);cam.position.copy(c.p);cam.lookAt(c.l);
 for(const p of screens){const d=cam.position.distanceTo(p.g.position);p.g.visible=d<120;if(d<80){p.draw(p.ctx,T);p.tex.needsUpdate=true;}}
 for(const m of machines){const d=cam.position.distanceTo(m.g.position);m.g.visible=d<120;}
 M0.update(T-B(10)+3);M5.update(T-B(38)+(T>B(40)?1.2*(T-B(40)):0));
 // BP wall
 tiles.forEach((t,i)=>{const u=eo(cl((T-B(26)-.2-i*.08)/.7));const hb=Math.max(.01,t.bn*.4*u),hp=Math.max(.01,t.pk*.4*u);t.colB.scale.y=hb;t.colB.position.y=-9.5+hb/2;t.colP.scale.y=hp;t.colP.position.y=-9.5+hp/2;
  const hi=(i===0?sm(B(28),B(28)+.3,T):0)+(t.name==='Nocturne'?sm(B(30),B(30)+.3,T):0);t.t.position.z=1.6*hi;t.frame.position.z=1.6*hi-.05;t.t.scale.setScalar(1+.12*hi);t.frame.scale.setScalar(1+.12*hi);
  const [x,y,z]=pj(new THREE.Vector3(t.x,1.55,.3));if(z<1&&T>B(26)&&T<B(32)+.3){const a=vis(T,B(26)+.3,B(32)-.3,.3);HT+=`<div class="chip" style="left:${x}px;top:${y}px;opacity:${a}">${D.cn[t.name]||t.name}<br><small>${t.pres}%</small></div>`;}});
 {const a=vis(T,B(28)+.2,B(30)+.1,.3);if(a>0)lab(960,60,'蔚 · 被禁',''+D.presence[0][2],'/'+D.n_games+' 局',{col:REGC.LPL,o:a,align:'center',size:150,s:back(T,B(28)+.2)});}
 {const a=vis(T,B(30)+.2,B(32)-.3,.3);const nc=(D.picks_lpl&&Object.values(D.picks_lpl).flat().filter(([n])=>n==='Nocturne').reduce((s,[,k])=>s+k,0))||0;const lv=D.lpl_vs_lck.find(r=>r[0]==='Nocturne');if(a>0&&lv)lab(960,60,'梦魇 · LPL',lv[1][1]+'胜','/'+lv[1][0]+' 场',{col:GOLD,o:a,align:'center',size:150,s:back(T,B(30)+.2)});}
 {const a=vis(T,B(26)+.4,B(32)-.3,.3);if(a>0)HT+=`<div class="chip" style="left:1700px;top:960px;opacity:${a};font-size:30px"><span style="color:#ff4560">■</span> 被禁　<span style="color:#F6CF78">■</span> 被选</div>`;}
 // coin: spins fast, slows, never really lands on a side
 {const f=cl((T-B(32))/(B(36)-B(32)));const ang=(T<B(32)?0:(1-Math.pow(1-f,2.2))*Math.PI*2*9)+.0;coin.rotation.set(ang,0,0);coin.position.y=ST[4].y+Math.sin(f*Math.PI)*1.4;}
 // drop: the new number
 {const a=vis(T,DROP,B(44)-.4,.15);if(a>0){lab(110,260,'LPL 夺冠',D.lpl.toFixed(1),'%',{col:REGC.LPL,o:a,align:'left',size:240,s:back(T,DROP,.45)});
   const a2=sm(B(42),B(42)+.3,T)*a;if(a2>0&&D.blg_share)lab(110,560,'其中 BLG 占',''+D.blg_share,'%',{col:'#fff',o:a2,align:'left',size:150,s:back(T,B(42),.4)});}}
 $('hud').innerHTML=HT;
 const L=LINES.find(l=>T>=l[0]&&T<l[1]);sub(L?L[2]:'');
 $('end').style.opacity=sm(125.4,125.9,T);
 comp.render();};
const DROP=B(40);
await document.fonts.load('900 60px "Noto Serif CJK SC"');await document.fonts.load('900 60px "Noto Sans CJK SC"');await document.fonts.load('900 60px "Inter Display"');await document.fonts.ready;
window.check=function(){const bad=[];let minD=1e9;const boxes=[...screens.map(p=>p.g),...machines.map(m=>m.g),coin,...tiles.map(t=>t.t)].map(o=>{o.updateMatrixWorld(true);return new THREE.Box3().setFromObject(o);});
 for(let f=Math.round(B(10)*30);f<3899;f+=2){const T=f/30;const {p}=camAt(T);for(const b of boxes){const d=b.distanceToPoint(p);minD=Math.min(minD,d);if(d<.8)bad.push([+T.toFixed(2),+d.toFixed(2)]);}if(p.y<-8)bad.push([+T.toFixed(2),'low']);}
 // x must never decrease
 let px=-1e9,back_=0;for(let f=Math.round(B(10)*30);f<3899;f++){const x=camAt(f/30).p.x;if(x<px-1e-6)back_++;px=x;}
 return {bad:bad.slice(0,20),n:bad.length,minD,backwards:back_};};
window.__cv={R,comp,cam,camAt};window.renderAt(B(10));window.READY=true;
