import * as THREE from 'three';
import {U as UT} from './util.js';
import {makeDeep} from './deep.js';
import {makeShip} from './ship.js';
import {makeSea} from './sea.js';
const {cl,pr,eio,eo,sst,lerp,pop}=UT;
const $=id=>document.getElementById(id);
const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(1920,1080);R.outputColorSpace=THREE.SRGBColorSpace;R.setClearColor(0x02040a,1);
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;document.body.prepend(R.domElement);
/* ---------- compositor: two scenes -> mix ---------- */
const rtA=new THREE.WebGLRenderTarget(1920,1080,{samples:4,type:THREE.HalfFloatType}),rtB=new THREE.WebGLRenderTarget(1920,1080,{samples:4,type:THREE.HalfFloatType});
const qS=new THREE.Scene(),qC=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const qM=new THREE.ShaderMaterial({uniforms:{a:{value:rtA.texture},b:{value:rtB.texture},f:{value:0},fl:{value:0},ma:{value:1},mb:{value:1},ex:{value:1}},vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}`,
 fragmentShader:`uniform sampler2D a,b;uniform float f,fl,ma,mb,ex;varying vec2 v;
 vec3 fit(vec3 v){vec3 a=v*(v+0.0245786)-0.000090537;vec3 b=v*(0.983729*v+0.4329510)+0.238081;return a/b;}
 vec3 aces(vec3 c){const mat3 I=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777));const mat3 O=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602));c*=ex/0.6;c=I*c;c=fit(c);c=O*c;return clamp(c,0.,1.);}
 vec3 srgb(vec3 c){c=clamp(c,0.,1.);return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-0.055,step(0.0031308,c));}
 vec3 tm(vec3 c,float m){return srgb(m>.5?aces(c):c);}
 void main(){vec3 A=tm(texture2D(a,v).rgb,ma),B=tm(texture2D(b,v).rgb,mb);vec3 c=mix(A,B,f)+vec3(1.,.93,.8)*fl;gl_FragColor=vec4(c,1.);}`});
qS.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),qM));
/* ---------- MAP: polar stereographic Blue Marble, no borders ---------- */
const MK=5,LON0=-45;
const P=(lat,lon,z=0)=>{const r=Math.tan((90+lat)*Math.PI/360),d=(lon-LON0)*Math.PI/180;return new THREE.Vector3(MK*r*Math.sin(d),MK*r*Math.cos(d),z);};
const mapS=new THREE.Scene(),mapC=new THREE.PerspectiveCamera(32,16/9,0.01,100);
const mtex=await new THREE.TextureLoader().loadAsync('tex/ant_polar.jpg');mtex.colorSpace=THREE.SRGBColorSpace;mtex.anisotropy=8;
const MU={map:{value:mtex},uF:{value:new THREE.Vector2()},uR:{value:1},uS:{value:.5},uDim:{value:1}};
const plane=new THREE.Mesh(new THREE.PlaneGeometry(0.64*MK,0.52*MK),new THREE.ShaderMaterial({uniforms:MU,
 vertexShader:`varying vec2 vUv;varying vec2 vP;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vP=w.xy;gl_Position=projectionMatrix*viewMatrix*w;}`,
 fragmentShader:`uniform sampler2D map;uniform vec2 uF;uniform float uR,uS,uDim;varying vec2 vUv;varying vec2 vP;
 void main(){vec3 c=texture2D(map,vUv).rgb;float l=dot(c,vec3(.3,.55,.15));
  float ice=smoothstep(.55,.85,l);
  vec3 sea=mix(vec3(.01,.025,.07),vec3(.07,.16,.33),pow(clamp(c.b*1.25,0.,1.),1.6));
  vec3 land=mix(vec3(.05,.06,.09),vec3(.12,.12,.13),l);float isLand=smoothstep(.04,.1,c.r-c.b+.02);
  vec3 col=mix(sea,land,isLand*(1.-ice));col=mix(col,vec3(.58,.63,.72)*(.7+.35*l),ice);
  float r=length(vP)/${MK.toFixed(1)};float colat=2.*degrees(atan(r));float lon=degrees(atan(vP.x,vP.y));
  float gy=abs(fract(colat/5.+.5)-.5)*5.,gx=abs(fract(lon/15.+.5)-.5)*15.;
  float g=max(1.-smoothstep(0.,fwidth(colat)*1.2,gy),(1.-smoothstep(0.,fwidth(lon)*1.2,gx))*smoothstep(1.,4.,colat));
  col+=vec3(.9,.72,.4)*g*.10;
  float d=length(vP-uF);col*=mix(1.,.34+.66*exp(-d*d/(uR*uR)),uS);col*=uDim;
  float e=smoothstep(0.,.08,vUv.x)*smoothstep(1.,.92,vUv.x)*smoothstep(0.,.08,vUv.y)*smoothstep(1.,.92,vUv.y);
  gl_FragColor=vec4(pow(mix(vec3(.008,.016,.04),col,e),vec3(2.2)),1.);}`}));
plane.position.set(0,0.18*MK,0);mapS.add(plane);mapS.background=new THREE.Color().setRGB(Math.pow(.008,2.2),Math.pow(.016,2.2),Math.pow(.04,2.2),THREE.LinearSRGBColorSpace);
// routes (lat,lon) — positions approximate (示意)
const RT={
 south:[[-54.28,-36.5],[-57,-30],[-60.5,-26],[-65,-22],[-69,-20],[-72.5,-19],[-74.6,-23],[-76,-28],[-76.57,-31.5]],
 drift:[[-76.57,-31.5],[-76.9,-34],[-77,-35.5],[-76.3,-38],[-75.1,-40.6],[-73.7,-43.4],[-72.2,-46.4],[-70.8,-48.9],[-69.7,-50.6],[-69.08,-51.5]],
 floe:[[-69.08,-51.5],[-68.65,-52.44],[-67.4,-52.7],[-66,-52.3],[-64.6,-52.9],[-63.2,-53.4],[-62.1,-53.9]],
 boats:[[-62.1,-53.9],[-61.85,-54.4],[-61.45,-54.85],[-61.1,-54.87]],
 caird:[[-61.1,-54.6],[-59.6,-50.6],[-57.9,-46.3],[-56.4,-42.4],[-55.1,-39.3],[-54.17,-37.4]],
 cross:[[-54.17,-37.4],[-54.08,-37.05],[-54.16,-36.71]],
 plan:[[-77.8,-35],[-82,-28],[-86,-10],[-90,0],[-86,166],[-82,168]],
 walk:[[-68.65,-52.44],[-63.58,-55.78]],
 r1:[[-54.28,-36.5],[-56.5,-43],[-58.6,-50],[-56.9,-45]], r2:[[-51.7,-57.8],[-55.2,-57],[-58.9,-56],[-55.6,-57.1]], r3:[[-53.16,-70.9],[-56.2,-64],[-59,-60],[-56.4,-63.8]],
 r4:[[-53.16,-70.9],[-56.5,-64.5],[-59.4,-59],[-61.05,-55]]};
const curves={};for(const k in RT)curves[k]=new THREE.CatmullRomCurve3(RT[k].map(([a,b])=>P(a,b,0.004)),false,'centripetal');
const lineMat=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthTest:false,depthWrite:false});
const tubes={};const used=new Set();let DC=1.4;
function seg(key,a,b,col=0xf6cf78,op=.95,w=0.006){w*=DC/1.4;const id=key+col;used.add(id);let t=tubes[id];const k=a.toFixed(3)+b.toFixed(3)+op.toFixed(2)+w.toFixed(5);if(t&&t.k===k)return;
 if(t){mapS.remove(t.m);t.m.geometry.dispose();mapS.remove(t.g);t.g.geometry.dispose();delete tubes[id];}if(b-a<0.003||op<=0.01)return;
 const c=curves[key];const pts=Array.from({length:48},(_,i)=>c.getPoint(lerp(a,b,i/47)));const cc=new THREE.CatmullRomCurve3(pts);
 const m=new THREE.Mesh(new THREE.TubeGeometry(cc,96,w,6),lineMat(col,op));const g=new THREE.Mesh(new THREE.TubeGeometry(cc,96,w*2.4,6),lineMat(col,op*.16));mapS.add(m);mapS.add(g);tubes[id]={m,g,k};}
const segOff=key=>{for(const id in tubes)if(id.startsWith(key)){mapS.remove(tubes[id].m);mapS.remove(tubes[id].g);delete tubes[id];}};
const dotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.22,'rgba(255,225,160,.9)');r.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
const ringTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.strokeStyle='#fff';g.lineWidth=7;g.beginPath();g.arc(128,128,112,0,7);g.stroke();return new THREE.CanvasTexture(c);})();
const spr=(col,t=dotTex)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,color:col,transparent:true,depthWrite:false,depthTest:false}));s.visible=false;mapS.add(s);return s;};
const mShip=spr(0xffd98a),mHalo=spr(0xffd98a),mPin=spr(0xffe7a8),mRing=spr(0xffe3a8,ringTex),mFar=spr(0xc9cfdb),mEI=spr(0xffd98a),mSG=spr(0xffd98a),mBoat=[spr(0xffe7a8),spr(0xffe7a8),spr(0xffe7a8)];
const PT={beset:P(-76.57,-31.5),abandon:P(-69.08,-51.5),sink:P(-68.65,-52.44),patience:P(-62.1,-53.9),EI:P(-61.1,-54.87),KHB:P(-54.17,-37.4),STR:P(-54.16,-36.71),pole:P(-90,0),vahsel:P(-77.8,-35),paulet:P(-63.58,-55.78),SG:P(-54.28,-36.5)};
const V=(x,y)=>new THREE.Vector3(x,y,0);const mid=(a,b,f=.5)=>a.clone().lerp(b,f);
// camera keys [T, target, dist, tilt, yaw]
const K=(t,p,d,tl,yw)=>[t,p.clone(),d,tl,yw];
const KM=[K(27.8,mid(PT.beset,PT.abandon,.35),3.1,24,8),K(32.8,mid(PT.beset,PT.abandon,.65),2.7,30,0),K(36.6,PT.sink,1.7,38,-6),
 K(44.4,mid(PT.vahsel,PT.pole,.2),4.2,20,4),K(48.9,mid(PT.pole,PT.sink,.6),4.0,22,0),K(53.0,mid(PT.sink,PT.paulet,.5),2.2,34,-4),K(57.4,mid(PT.sink,PT.paulet,.4),2.0,38,-8),
 K(76.8,mid(PT.sink,PT.patience,.5),2.5,30,6),K(81.4,mid(PT.patience,PT.EI,.4),1.8,36,0),K(85.4,mid(PT.EI,PT.KHB,.45),3.2,30,-4),K(89.6,mid(PT.EI,PT.KHB,.55),1.6,52,-8),
 K(97.4,mid(PT.KHB,PT.STR,.5),.9,38,6),K(101.6,PT.STR,.75,42,10),K(102.4,PT.EI,1.7,36,-6),K(105.7,PT.EI,1.5,38,-8),
 K(109.4,mid(PT.EI,P(-56,-62),.5),3.2,28,0),K(113.9,PT.EI,2.2,34,4),K(117.4,mid(PT.beset,PT.EI,.5),4.6,20,0),K(122.4,mid(PT.beset,PT.EI,.5),4.2,24,-4)];
const camK=(Ks,T)=>{let i=0;while(i<Ks.length-2&&T>Ks[i+1][0])i++;const a=Ks[i],b=Ks[i+1];const u=eio(pr(T,a[0],b[0]));return [a[1].clone().lerp(b[1],u),lerp(a[2],b[2],u),lerp(a[3],b[3],u),lerp(a[4],b[4],u)];};
const proj=(v,c)=>{const p=v.clone().project(c);return [(p.x*.5+.5)*1920,(-p.y*.5+.5)*1080,p.z];};
const MAPW=[[27.8,37.3],[44.4,57.6],[76.7,89.9],[97.3,105.9],[109.3,113.9],[117.3,122.0]];
const mapIn=T=>MAPW.some(([a,b])=>T>=a&&T<=b);
const mapOp=T=>{let o=0;for(const [a,b] of MAPW)o=Math.max(o,pr(T,a,a+0.6)*(1-pr(T,b-0.6,b)));return o;};
const D=(y,m,d)=>Date.UTC(y,m-1,d);const fmt=ms=>{const x=new Date(ms);return `${x.getUTCFullYear()}.${String(x.getUTCMonth()+1).padStart(2,'0')}.${String(x.getUTCDate()).padStart(2,'0')}`;};
function mapUpdate(T){const [tg,d,tl,yw0]=camK(KM,T);DC=d;const yw=(yw0+1.2*Math.sin(T*.19))*Math.PI/180,tr=tl*Math.PI/180;
 mapC.position.set(tg.x+d*Math.sin(tr)*Math.sin(yw),tg.y-d*Math.sin(tr)*Math.cos(yw),d*Math.cos(tr));mapC.up.set(0,0,1);mapC.lookAt(tg);
 MU.uF.value.set(tg.x,tg.y);MU.uR.value=.45*d+.12;MU.uS.value=.5;MU.uDim.value=1-0.55*pr(T,117.6,118.4)*0;
 const H=[];const lab=(v,t,s,o,dy=-26)=>{if(o<=0.01)return;const [x,y,z]=proj(v,mapC);if(z>1)return;H.push(`<div class="lab" style="left:${x}px;top:${y+dy}px;opacity:${o}">${t}${s?`<small>${s}</small>`:''}</div>`);};
 const chip=(v,t,o,dx=26,dy=-10,c='#F6CF78')=>{if(o<=0.01)return;const [x,y]=proj(v,mapC);H.push(`<div class="t" style="left:${x+dx}px;top:${y+dy}px;font-size:30px;color:${c};opacity:${o};text-shadow:0 2px 10px #000">${t}</div>`);};
 [mShip,mHalo,mPin,mRing,mFar,mEI,mSG,...mBoat].forEach(s=>s.visible=false);
 const show=(s,p,sc,op=1)=>{sc*=DC/1.4*0.55;if(s===mHalo)sc*=0.45;s.visible=true;s.position.copy(p);s.scale.set(sc,sc,1);s.material.opacity=op;};
 const big={},ui=[];let gantt=null;
 // ----- A: drift 28.7–36.8
 if(T<38){const f=eio(pr(T,28.9,32.6));seg('south',0,1,0xf6cf78,.35*pr(T,28,28.8),0.003);seg('drift',0,f);const sp=curves.drift.getPoint(f);show(mShip,sp,.07);show(mHalo,sp,.32,.35);
  const dt=lerp(D(1915,1,18),D(1915,10,27),f);big.date=[fmt(dt),pr(T,28.8,29.2)*(1-pr(T,36.4,36.9)),'船被冰夹着漂流'];
  lab(PT.SG,'南乔治亚岛','出发 · 1914.12.05',pr(T,28.4,29)*(1-pr(T,30.5,31.2)),-30);lab(PT.beset,'被困','1915.01.18',pr(T,28.6,29.2)*(1-pr(T,32,32.6)));
  lab(P(-71.5,-38),'威德尔海','',.75*pr(T,28.5,29.5)*(1-pr(T,35.8,36.5)),0);
  if(T>32.8){const k=pr(T,32.9,34.0);show(mRing,PT.abandon,.05+.3*eo(k),1-k);lab(PT.abandon,'弃船','1915.10.27',pr(T,33,33.4));
   const s2=pr(T,34.6,36.2);seg('floe',0,0.12*s2,0xf6cf78,.8);if(T>35.6){show(mPin,PT.sink,.06*pop(T,35.6));lab(PT.sink,'沉没','1915.11.21',pr(T,35.6,36));}}
  gantt={T,mode:'drift'};}
 // ----- B: plan collapses 44.9–48.9 ; walk 49–53 ; next stop 53–57
 if(T>44&&T<58){seg('drift',0,1,0xf6cf78,.45,0.004);seg('floe',0,.12,0xf6cf78,.45,0.004);show(mHalo,PT.sink,.26,.4);show(mShip,PT.sink,.06);
  const pa=pr(T,44.6,45.4),pc=pr(T,46.6,47.8);if(T<49.5){seg('plan',0,1,0xff8a7a,.9*pa*(1-pc),0.007);
   lab(PT.pole,'南极点','',pa*(1-pc));chip(PT.vahsel,'横穿南极',pa*(1-pc),30,-30,'#ff9a8a');}
  if(T>47.2&&T<49.5){const k=pr(T,47.4,48.4);chip(PT.sink,'把人带回去',k*(1-pr(T,49,49.4)),34,-20);show(mRing,PT.sink,.05+.22*eo(pr(T,47.4,48.6)),1-pr(T,47.4,48.6));}
  if(T>48.9){const w=pr(T,49.1,49.6);seg('walk',0,1,0xc9cfdb,.75*w*(1-pr(T,53.2,54)),0.004);show(mFar,PT.paulet,.06,w*(1-pr(T,53.2,54)));lab(PT.paulet,'陆地','',w*(1-pr(T,53.2,54)));
   const days=Math.round(300*eo(pr(T,49.6,52.4)))+(T>52.4?Math.round((T-52.4)*6):0);big.walk=[days,w*(1-pr(T,53.2,53.8))];
   const prog=0.06*pr(T,49.6,52.6);seg('walk',0,prog,0xf6cf78,.95*w*(1-pr(T,53.2,54)),0.006);}
  if(T>53){const np=curves.walk.getPoint(.08);const k=pop(T,53.6);show(mPin,np,.07*k);show(mRing,np,.04+.2*eo(pr(T,53.6,54.8)),1-pr(T,53.6,54.8));chip(np,'下一站',pr(T,53.6,54),30,-24);}
 }
 // ----- C: floe -> boats -> Elephant Island -> Caird route 77–89.5
 if(T>76&&T<90.5){seg('drift',0,1,0xf6cf78,.35,0.004);const ff=eio(pr(T,77.0,80.8));seg('floe',0,lerp(.12,1,ff));const fp=curves.floe.getPoint(lerp(.12,1,ff));
  if(T<81.4){show(mShip,fp,.06);show(mHalo,fp,.28,.35);lab(fp,'浮冰营地','',pr(T,77,77.5)*(1-pr(T,80.6,81.2)));}
  if(T>80.4){const bf=eio(pr(T,81.4,84.2));seg('boats',0,bf);mBoat.forEach((s,i)=>show(s,curves.boats.getPoint(Math.max(0,bf-i*.05)),.05));
   if(T>84.0){const k=pop(T,84.0);show(mEI,PT.EI,.08*k);show(mRing,PT.EI,.05+.4*eo(pr(T,84,85.6)),1-pr(T,84,85.6));lab(PT.EI,'象岛','1916.04.15',pr(T,84,84.4));}
   const days=Math.round(lerp(447,497,eo(pr(T,81.4,84.2))));big.d497=[days,pr(T,81.3,81.6)*(1-pr(T,85.0,85.4)),T>84.1];}
  if(T>85.2){const cf=eio(pr(T,85.6,88.6));seg('caird',0,cf);const cp=curves.caird.getPoint(cf);show(mShip,cp,.05);lab(PT.KHB,'南乔治亚岛','捕鲸站',pr(T,85.5,86),-30);show(mSG,PT.KHB,.06,pr(T,85.5,86));
   big.km=[Math.round(1288*cf),pr(T,85.6,86)*(1-pr(T,89.2,89.6)),pr(T,86.8,87.4)];}}
 // ----- D: crossing 97.6–101.6, Elephant Island wait 101.6–105.7
 if(T>97&&T<106.5){seg('caird',0,1,0xf6cf78,.5,0.004);segOff('boats');const xf=eio(pr(T,98.2,100.6));seg('cross',0,xf,0xffffff,.95,0.003);show(mShip,curves.cross.getPoint(xf),.03);
  lab(PT.STR,'捕鲸站','',pr(T,98,98.5)*(1-pr(T,101.8,102.3)),-20);big.hours=[Math.round(36*xf),pr(T,98,98.4)*(1-pr(T,101.4,101.8))];
  if(T>101.8){show(mEI,PT.EI,.07);show(mHalo,PT.EI,.3,.4);lab(PT.EI,'象岛','22 人',pr(T,102.2,102.8));big.wait=[Math.round(lerp(1,10,pr(T,102.4,105.6))),pr(T,102.4,102.8)];}}
 // ----- E: rescue attempts 109.7–113.8
 if(T>109&&T<114.2){show(mEI,PT.EI,.07);show(mHalo,PT.EI,.3,.4);lab(PT.EI,'象岛','22 人',1);
  [['r1',109.8],['r2',110.6],['r3',111.4]].forEach(([k,t0])=>{const f=eio(pr(T,t0,t0+1.0));seg(k,0,f,0xc9cfdb,.75*(1-.5*pr(T,t0+1.2,t0+1.8)),0.005);if(f>.7)chip(curves[k].getPoint(.66),'✕',pr(T,t0+.7,t0+.9)*(1-.5*pr(T,t0+1.2,t0+1.8)),-10,-20,'#ff8a7a');});
  const yf=eio(pr(T,112.2,113.4));seg('r4',0,yf,0xf6cf78,.95,0.007);if(yf>.98){show(mRing,PT.EI,.05+.35*eo(pr(T,113.3,114.2)),1-pr(T,113.3,114.2));}
  big.wait=[Math.round(lerp(105,137,pr(T,109.8,113.4))),1];big.att=[T<112.2?Math.min(3,1+Math.floor((T-109.8)/0.8)):4,pr(T,109.8,110.1)];}
 // ----- F: summary 117.8–121.9: the whole journey as stations
 if(T>117){segOff('r');['south','drift','floe','boats','caird','cross'].forEach((k,i)=>{const t0=118.2+i*0.42;seg(k,0,1,0xf6cf78,lerp(.25,.95,pr(T,t0,t0+0.3)),0.006);});
  [[PT.SG,118.0],[PT.beset,118.4],[PT.abandon,118.8],[PT.patience,119.3],[PT.EI,119.7],[PT.KHB,120.1],[PT.STR,120.4]].forEach(([p,t0],i)=>{const s=[mPin,mFar,mRing,mEI,mSG,mShip,mHalo][i];show(s,p,.055*pop(T,t0),1);if(s===mRing)s.material.map=dotTex;});
  gantt={T,mode:'sum'};}
 else mRing.material.map=ringTex;
 for(const id in tubes)if(!used.has(id)){mapS.remove(tubes[id].m);tubes[id].m.geometry.dispose();mapS.remove(tubes[id].g);tubes[id].g.geometry.dispose();delete tubes[id];}used.clear();
 return {H,big,gantt};}
/* ---------- 3D set-pieces ---------- */
const deep=await makeDeep(THREE,R),ship=await makeShip(THREE,R),sea=await makeSea(THREE,R);
/* ---------- 2D scenes ---------- */
const G='#F6CF78',BL='#8fb4ff',PK='#FF9DB0',RED='#ff6a5a';
const fx=$('fx'),X=fx.getContext('2d',{willReadFrequently:true});
let seed=11;const rng=()=>(seed=(seed*16807)%2147483647)/2147483647;
// K1: personal items < 1 kg
const COINS=Array.from({length:9},()=>[rng(),rng(),rng()]);
function K1(T,o){const fall=eio(pr(T,37.6,39.6));let h='';COINS.forEach(([a,b,c],i)=>{const x=760+a*400,y0=380+b*80,y=y0+fall*(420+c*200)+0*i;const op=1-pr(T,38.4+c*.6,39.8+c*.6);
  h+=`<div style="position:absolute;left:${x}px;top:${y}px;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3c4,#e9b84e 45%,#9a6a1c);box-shadow:0 0 24px rgba(246,207,120,.5);opacity:${op*pr(T,36.9,37.3)};transform:rotate(${fall*(c*300)}deg)"><div style="position:absolute;inset:10px;border-radius:50%;border:3px solid rgba(120,80,20,.45)"></div></div>`;});
 const ph=pr(T,38.2,38.8);const kg='0.9';
 return `<div class="lbl" style="left:960px;top:200px;transform:translateX(-50%)">每人私人物品 · 上限 2 磅</div>
 <div class="t serif" style="left:960px;top:236px;transform:translateX(-50%);font-size:120px;color:${G};line-height:1">${kg}<span style="font-size:48px"> kg</span></div>${h}
 <div style="position:absolute;left:1180px;top:${lerp(470,420,ph)}px;width:250px;height:190px;background:#efe6d2;border-radius:6px;padding:12px;box-shadow:0 0 60px rgba(246,207,120,${.2+.4*ph});opacity:${pr(T,37,37.4)};transform:rotate(${lerp(-6,3,ph)}deg)">
  <div style="width:100%;height:100%;background:linear-gradient(180deg,#8d9bb0,#3c475a 70%,#2a2f38);position:relative;overflow:hidden"><svg width="226" height="166" style="position:absolute;left:0;top:0"><path d="M0 130 L60 100 L110 118 L170 92 L226 112 L226 166 L0 166Z" fill="#20252e"/><circle cx="72" cy="104" r="9" fill="#14171d"/><rect x="66" y="112" width="12" height="30" fill="#14171d"/><circle cx="104" cy="108" r="8" fill="#14171d"/><rect x="99" y="115" width="11" height="26" fill="#14171d"/></svg></div></div>
 <div class="t" style="left:1180px;top:676px;font-size:32px;color:${G};opacity:${ph}">照片 · 留下</div><div class="t" style="left:760px;top:676px;font-size:32px;color:#9aa2b4;opacity:${pr(T,38.6,39)}">金币 · 扔掉</div>`;}
// K2: the book
function K2(T,o){const q='A man must shape himself to a new mark directly the old one goes to ground.';const n=Math.floor(q.length*pr(T,41.4,43.6));const op=pr(T,40.6,41.2);
 return `<div style="position:absolute;left:520px;top:170px;width:880px;height:600px;border-radius:8px;background:linear-gradient(135deg,#efe5cf,#e2d4b4 60%,#cdbb93);box-shadow:0 30px 80px rgba(0,0,0,.6),inset 0 0 80px rgba(120,90,40,.25);opacity:${op};transform:perspective(1600px) rotateX(${lerp(14,6,eo(pr(T,40.9,44.9)))}deg) scale(${lerp(.96,1.02,pr(T,40.9,44.9))})">
  <div class="serif" style="position:absolute;left:0;right:0;top:50px;text-align:center;font-size:30px;letter-spacing:14px;color:#6b5634;font-weight:700">SOUTH</div><div style="position:absolute;left:0;right:0;top:94px;text-align:center;font-size:20px;letter-spacing:6px;color:#8a7552">ERNEST SHACKLETON · 1919</div>
  <div style="position:absolute;left:300px;right:300px;top:140px;border-top:1px solid rgba(107,86,52,.4)"></div>
  <div class="serif" style="position:absolute;left:90px;right:90px;top:200px;font-size:48px;line-height:1.5;color:#2c2216;font-style:italic;font-weight:700">“${q.slice(0,n)}<span style="opacity:${n<q.length?(Math.sin(T*20)>0?1:0):0}">|</span>”</div>
  <div style="position:absolute;right:90px;bottom:60px;font-size:24px;color:#8a7552;opacity:${pr(T,43.6,44)}">—— 《South》，1915年10月27日夜</div></div>`;}
// K3: the experiment
function K3(T,o){const st=pr(T,57.2,57.8);const pages=Math.round(42*eo(pr(T,61.2,62.6)));let s='';for(let i=0;i<pages;i++)s+=`<div style="position:absolute;left:${300+((i*7)%5)-2}px;top:${800-i*8}px;width:220px;height:14px;background:${i%6===5&&T>73.2?'#f6cf78':'#e9e3d6'};border-radius:2px;box-shadow:0 2px 3px rgba(0,0,0,.4)"></div>`;
 const bars=[['远目标','“42页全做完”',55,65.4,'#c9cfdb'],['不定目标','',53,69.4,'#7d8597'],['近目标','“每次6页”',74,73.4,G]];
 let b='';bars.forEach(([n,s2,v,t0,c],i)=>{const g=eo(pr(T,t0,t0+1.2));const x=820+i*330,hh=v*5.4*g;const on=pr(T,t0,t0+.3);
  b+=`<div style="opacity:${on}"><div class="bar" style="left:${x}px;top:${790-hh}px;width:180px;height:${hh}px;border-radius:12px 12px 0 0;background:${c};${i===2?'box-shadow:0 0 50px rgba(246,207,120,.55)':''}"></div>
  <div class="t serif" style="left:${x+90}px;top:${790-hh-92}px;transform:translateX(-50%);font-size:${i===2?84:64}px;color:${c}">${Math.round(v*g)}%</div>
  <div class="t" style="left:${x+90}px;top:806px;transform:translateX(-50%);font-size:34px;color:#fff">${n}</div><div class="t" style="left:${x+90}px;top:852px;transform:translateX(-50%);font-size:24px;color:#9aa2b4;font-weight:700">${s2}</div></div>`;});
 const flags=T>73.4?Array.from({length:7},(_,k)=>`<div class="t" style="left:${530}px;top:${800-(k*6+5)*8-14}px;font-size:22px;color:${G};opacity:${pr(T,73.6+k*.12,73.9+k*.12)}">◀ ${k*6+6}</div>`).join(''):'';
 const farFlag=T>65.4?`<div class="t" style="left:530px;top:${800-41*8-30}px;font-size:26px;color:#c9cfdb;opacity:${pr(T,65.5,65.9)*(1-pr(T,73.2,73.6))}">◀ 42页</div>`:'';
 return `<div class="lbl" style="left:160px;top:200px;opacity:${st}">实验 · 1981</div><div class="t serif" style="left:150px;top:236px;font-size:58px;color:#fff;opacity:${st}">目标，定多远？</div>
 <div class="t" style="left:160px;top:320px;font-size:28px;color:#9aa2b4;font-weight:700;opacity:${pr(T,57.8,58.3)}">数学很差的孩子 · 减法练习</div>
 <div style="opacity:${pr(T,61.1,61.5)}">${s}${farFlag}${flags}<div class="t serif" style="left:410px;top:${800-pages*8-70}px;transform:translateX(-50%);font-size:48px;color:#fff">${pages}<span style="font-size:24px"> 页</span></div></div>
 <div class="lbl" style="left:820px;top:220px;opacity:${pr(T,65.2,65.6)}">第4次课后 · 完成了全部题目的</div>${b}
 <div class="t" style="left:1160px;top:900px;transform:translateX(-50%);font-size:22px;color:#7d8597;font-weight:700;opacity:${pr(T,66,66.6)}">Bandura &amp; Schunk (1981) · 小样本实验</div>`;}
// K4: Wild's tally — today
function K4(T,o){const n=Math.round(lerp(10,120,eio(pr(T,105.8,108.2))));let s='';const N=Math.min(n,120);
 for(let i=0;i<N;i++){const g=Math.floor(i/5),k=i%5;const x=300+(g%24)*54+(k<4?k*10:0),y=420+Math.floor(g/24)*110;s+=k<4?`<div style="position:absolute;left:${x}px;top:${y}px;width:4px;height:70px;background:#d8c9a4;border-radius:2px;transform:rotate(${(i*37%7)-3}deg)"></div>`:`<div style="position:absolute;left:${x-6}px;top:${y+30}px;width:52px;height:4px;background:#d8c9a4;transform:rotate(-28deg)"></div>`;}
 const today=pr(T,108.0,108.6);
 return `<div style="position:absolute;left:240px;top:360px;width:1440px;height:${130+110*Math.floor(Math.max(0,N-1)/120)}px;border-radius:10px;background:linear-gradient(180deg,#5a4532,#3e2e21);box-shadow:inset 0 0 40px rgba(0,0,0,.5),0 20px 60px rgba(0,0,0,.6)"></div>${s}
 <div class="lbl" style="left:960px;top:280px;transform:translateX(-50%)">象岛 · 等待的天数</div>
 <div style="position:absolute;left:1580px;top:400px;width:8px;height:110px;background:${G};border-radius:4px;box-shadow:0 0 30px ${G};opacity:${today}"></div>
 <div class="t serif" style="left:1584px;top:540px;transform:translateX(-50%) scale(${pop(T,108.1)});font-size:64px;color:${G}">今天</div>`;}
// K5: 28 / 28
function K5(T,o){let h='';const pos=i=>{if(i<22){return [700+(i%11)*60,470+Math.floor(i/11)*70];}const j=i-22;return [lerp(1500,700+((22+j)%11)*60,eio(pr(T,114.6,116))),lerp(400+j*30,470+Math.floor((22+j)/11)*70,eio(pr(T,114.6,116)))];};
 for(let i=0;i<28;i++){const [x,y]=pos(i);h+=`<div style="position:absolute;left:${x-16}px;top:${y-16}px;width:32px;height:32px;border-radius:50%;background:${i<22?G:'#ffb38a'};box-shadow:0 0 20px rgba(246,207,120,.6)"></div>`;}
 const n=T<114.8?22:Math.min(28,22+Math.floor((T-114.8)*5));
 return `${h}<div class="t serif" style="left:960px;top:190px;transform:translateX(-50%) scale(${T>116?pop(T,116):1});font-size:150px;color:${G};line-height:1">${n} / 28</div>
 <div class="t" style="left:960px;top:700px;transform:translateX(-50%);font-size:34px;color:#c9cfdb;opacity:${pr(T,116.2,116.6)}">坚忍号上的 28 人，一个不少</div>`;}
const SCN=[{w:[36.8,40.9],f:K1},{w:[40.9,44.9],f:K2},{w:[57.0,77.2],f:K3},{w:[105.7,109.7],f:K4},{w:[113.8,117.8],f:K5}];
/* ---------- HUD on the map ---------- */
const PH=[['驶入浮冰',44],['困在冰里',282],['冰上扎营',165],['小艇',6]];
function hud(T,M){let h='';const b=M.big;
 if(b.date){const [d,o,s]=b.date;h+=`<div style="opacity:${o}"><div class="lbl" style="left:120px;top:150px">${s}</div><div class="t serif" style="left:110px;top:180px;font-size:96px;color:${G};text-shadow:0 0 40px rgba(246,207,120,.4)">${d}</div></div>`;}
 if(b.walk){const [d,o]=b.walk;h+=`<div style="opacity:${o}"><div class="lbl" style="left:120px;top:150px">按当时的速度 · 走到陆地要</div><div class="t serif" style="left:110px;top:180px;font-size:110px;color:#ff9a8a">${d}<span style="font-size:44px"> 天</span></div></div>`;}
 if(b.d497){const [d,o,land]=b.d497;h+=`<div style="opacity:${o}"><div class="lbl" style="left:120px;top:150px">离开陆地的第</div><div class="t serif" style="left:110px;top:176px;transform-origin:0 50%;transform:scale(${land?pop(T,84.1,.4):1});font-size:130px;color:${G};text-shadow:0 0 50px rgba(246,207,120,.5)">${d}<span style="font-size:48px"> 天</span></div>
  <div class="t" style="left:120px;top:340px;font-size:38px;color:#fff;opacity:${land?pr(T,84.2,84.6):0}">第一次，踩到陆地</div></div>`;}
 if(b.km){const [k,o,c]=b.km;h+=`<div style="opacity:${o}"><div class="lbl" style="left:120px;top:150px">直线距离</div><div class="t serif" style="left:110px;top:180px;font-size:100px;color:${G}">${k.toLocaleString('en')}<span style="font-size:40px"> km</span></div>
  <div class="t" style="left:120px;top:310px;font-size:32px;color:#c9cfdb;opacity:${c}">比 北京 → 上海（约1070公里）还远</div></div>`;}
 if(b.hours){const [k,o]=b.hours;h+=`<div style="opacity:${o}"><div class="lbl" style="left:120px;top:150px">翻越没有地图的雪山</div><div class="t serif" style="left:110px;top:180px;font-size:110px;color:#fff">${k}<span style="font-size:44px"> 小时</span></div></div>`;}
 if(b.wait){const [k,o]=b.wait;h+=`<div style="opacity:${o}"><div class="lbl" style="left:120px;top:150px">象岛 · 等待第</div><div class="t serif" style="left:110px;top:180px;font-size:110px;color:${G}">${k}<span style="font-size:44px"> 天</span></div></div>`;}
 if(b.att){const [k,o]=b.att;h+=`<div style="opacity:${o}"><div class="t" style="left:1500px;top:330px;font-size:34px;color:#fff">救援 第 <span class="serif" style="font-size:72px;color:${k===4?G:'#ff8a7a'}">${k}</span> 次</div>${k===4?`<div class="t" style="left:1500px;top:430px;font-size:26px;color:#c9b98f;font-weight:700">智利海军 · 耶尔乔号 · 帕尔多</div>`:''}</div>`;}
 // phase bar (bottom)
 if(M.gantt){const g=M.gantt;const x0=360,W=1200,y=840;let acc=0;let s='';const total=497;
  PH.forEach(([n,d],i)=>{const x=x0+acc/total*W,w=d/total*W;acc+=d;let fill=0,op=.9;
   if(g.mode==='drift'){fill=i===0?pr(T,28.8,29.2):(i===1?pr(T,28.9,32.6):0);op=pr(T,28.6,29)*(1-pr(T,36.4,36.9));}
   else{const t0=118.2+i*0.5;fill=eo(pr(T,t0,t0+.45));op=pr(T,117.8,118.2);}
   s+=`<div style="position:absolute;left:${x+2}px;top:${y}px;width:${w-4}px;height:22px;border-radius:6px;background:rgba(255,255,255,.08);opacity:${op}"><div style="width:${fill*100}%;height:100%;border-radius:6px;background:${G};box-shadow:0 0 18px rgba(246,207,120,.5)"></div></div>`;
   if(w>60||g.mode==='sum')s+=`<div class="t" style="left:${x+w/2}px;top:${y-44}px;transform:translateX(-50%);font-size:24px;color:#e9e3d6;opacity:${op*(fill>0?1:.4)}">${n} <span class="serif" style="color:${G}">${d}</span>天</div>`;});
  if(g.mode==='sum'){s+=`<div class="t serif" style="left:${x0+W+30}px;top:${y-24}px;font-size:56px;color:${G};opacity:${pr(T,120.2,120.6)}">= 497</div>`;}
  h+=s;}
 return h;}
/* ---------- timing ---------- */
const LINES=[[0,4.4,'看不到头的时候，你靠什么[撑下去]？'],[4.4,8.5,'1915年，28个人被困在[南极的冰]里'],[8.5,12.5,'船被冰挤碎，他们[497天]没踩过陆地'],[12.5,16.4,'最后，坚忍号上的28人，[全部生还]'],
 [20.6,24.7,'靠的不是“咬牙坚持到底”'],[24.7,28.7,'而是一个你[今天]就能用的办法'],
 [28.7,32.8,'船被冰夹着，漂了[9个多月]'],[32.8,36.8,'1915年10月，船身被压裂，弃船'],[36.8,40.9,'私人物品只能带[不到1公斤]：金币扔，照片留'],[40.9,44.9,'沙克尔顿写：“旧目标一倒，马上定个[新目标]”'],[44.9,48.9,'从“横穿南极”，换成“[把人带回去]”'],
 [48.98,53.0,'拖着救生艇走去陆地？要[300多天]'],[53.0,57.0,'于是，终点换成了“[下一站]”'],
 [57.0,61.1,'这招有用吗？1981年，有个实验'],[61.1,65.1,'数学差的孩子，同样做[42页]题'],[65.2,69.2,'远目标“42页全做完”：[55%]'],[69.2,73.2,'不定目标：[53%]，几乎一样'],[73.2,77.2,'近目标“每次6页”：[74%]'],
 [77.2,81.3,'回到冰上：浮冰裂了，下一站是[小艇]'],[81.4,85.4,'3条小艇，5天多，登上[象岛]'],[85.4,89.5,'下一站：1000多公里外的[捕鲸站]'],
 [89.5,93.5,'6个人，一条[六七米长]的小艇'],[93.5,97.6,'以为云散了，其实是[巨浪]'],[97.6,101.6,'16天后靠岸，3人翻雪山[36小时]'],
 [101.6,105.7,'留在象岛的22人，等了[四个半月]'],[105.7,109.7,'怀尔德每天说：“老大[今天]可能就来”'],[109.7,113.8,'救援3次被冰挡回，[第4次]到了'],[113.8,117.8,'“大家都好吗？”“[都好]。”'],
 [117.8,121.9,'497天，被拆成了[一站一站]'],[121.9,125.4,'看不到终点时，只看[下一步]']];
window.LINES=LINES;
const SRC=[[28.7,36.8,'','Shackleton《South》(1919) · RGS 时间线'],[57.0,77.2,'实验','Bandura &amp; Schunk (1981) · J. Personality &amp; Social Psychology'],[101.6,117.8,'','Shackleton《South》(1919) · RGS · 英国皇家海军']];
// which 3D scene is on screen: [from,to,scene,fade]
const GLW=[[0,6.2,deep],[5.8,28.6,ship],[89.3,97.8,sea],[121.8,130,deep]];
window.renderAt=function(T){
 const act=[];for(const [a,b,s] of GLW){if(T>=a&&T<=b)act.push([s,pr(T,a,a+0.6)*(1-pr(T,b-0.6,b))]);}
 const mo=mapIn(T)?mapOp(T):0;let M={H:[],big:{},gantt:null};
 const list=[];for(const [s,o] of act)list.push([s.scene,s.cam,o,s]);if(mo>0){M=mapUpdate(T);list.push([mapS,mapC,mo,null]);}
 for(const [,,,s] of list)if(s)s.update(T);
 let flash=0;for(const [s] of act)if(s.flash)flash=Math.max(flash,s.flash(T));
 if(list.length===0){R.setRenderTarget(null);R.clear();}
 else{const a=list[0],b=list[1]||null;R.setRenderTarget(rtA);R.clear();R.render(a[0],a[1]);let f=0;if(b){R.setRenderTarget(rtB);R.clear();R.render(b[0],b[1]);const sa=a[2],sb=b[2];f=sb/Math.max(1e-4,sa+sb);if(sa>=.999&&sb<1)f=sb;if(sb>=.999)f=sa<1?1-sa:1;}
  qM.uniforms.f.value=b?f:0;qM.uniforms.ma.value=a[3]?1:0;qM.uniforms.mb.value=b&&b[3]?1:0;qM.uniforms.fl.value=flash;R.setRenderTarget(null);R.render(qS,qC);}
 const glOp=Math.max(mo,...act.map(x=>x[1]),0);R.domElement.style.opacity=glOp;
 X.setTransform(1,0,0,1,0,0);X.globalAlpha=1;X.clearRect(0,0,1920,1080);X.fillStyle='rgba(0,0,0,0.004)';X.fillRect(0,0,2,2);
 let h='',twoD=0;for(const s of SCN){const [a,b]=s.w;if(T<a-0.5||T>b+0.5)continue;const e=eio(pr(T,a-0.5,a+0.5)),x=eio(pr(T,b-0.5,b+0.5)),o=e*(1-x),sc=1+0.03*sst(pr(T,a,b));twoD=Math.max(twoD,o);
  h+=`<div class="sc" style="opacity:${o};transform:scale(${sc})">${s.f(T,o)}</div>`;}
 $('world').innerHTML=h;$('bg2').style.opacity=Math.min(1,twoD*1.2)*(1-0*glOp);
 let hh=M.H.join('');if(mo>0)hh=`<div style="opacity:${mo}">${hh}${hud(T,M)}</div>`;for(const s of [deep,ship,sea])if(s.hud)hh+=s.hud(T);$('hud').innerHTML=hh;
 $('dim').style.opacity=0;
 const sr=SRC.find(s=>T>=s[0]&&T<s[1]);$('src').style.opacity=sr?pr(T,sr[0],sr[0]+0.4)*(1-pr(T,sr[1]-0.3,sr[1])):0;if(sr)$('src').innerHTML=`${sr[2]?`<i>${sr[2]}</i>`:''}${sr[3]}`;
 const L=LINES.find(l=>T>=l[0]&&T<l[1]);$('sub').innerHTML=L&&T<125.4?'<span>'+L[2].replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';
 $('plaque').style.opacity=pr(T,16.58,16.9)*(1-pr(T,20.2,20.8));$('plaque').style.transform=`scale(${1.06-0.06*eo(pr(T,16.58,17.3))})`;
 $('end').style.opacity=pr(T,125.4,126.4);};
await document.fonts.load('900 60px "Noto Sans CJK SC"');await document.fonts.load('900 60px "Noto Serif CJK SC"');await document.fonts.ready;window.renderAt(0);window.READY=true;
