// 2,250 volunteers as points of light. Random pings; 46.9% drift away (mind wandering) and cool down; then the camera dives into one warm "now".
import {U} from './util.js';
const {pr,eio,eo,lerp,cl,sst}=U;
export async function makePhones(THREE,R){
 const S=new THREE.Scene();S.background=new THREE.Color(0x02030a);S.fog=new THREE.FogExp2(0x02030a,.018);
 const cam=new THREE.PerspectiveCamera(36,16/9,.05,500);
 const N=2250;let sd=21;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const P=[];for(let i=0;i<N;i++){const r=Math.sqrt(rn())*34,a=rn()*6.283;P.push({x:Math.cos(a)*r,z:Math.sin(a)*r-6,y:rn()*.4,s:rn(),w:false,up:2+rn()*7});}
 // pick exactly 46.9% as wanderers (1055 of 2250)
 const idx=[...Array(N).keys()];for(let i=N-1;i>0;i--){const j=Math.floor(rn()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]];}for(let k=0;k<1055;k++)P[idx[k]].w=true;
 const g=new THREE.BufferGeometry();const pos=new Float32Array(N*3),col=new Float32Array(N*3),sz=new Float32Array(N);g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('sz',new THREE.BufferAttribute(sz,1));
 const M=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`attribute vec3 color;attribute float sz;varying vec3 vc;void main(){vc=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=sz*(60./-mv.z);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying vec3 vc;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);float a=smoothstep(.5,.0,r);a=a*a+smoothstep(.12,0.,r);gl_FragColor=vec4(vc*a,1.);}`});
 S.add(new THREE.Points(g,M));
 // wander trails: faint vertical lines from the ground point up to the drifted point
 const tg=new THREE.BufferGeometry();const tp=new Float32Array(1055*6);tg.setAttribute('position',new THREE.BufferAttribute(tp,3));const tl=new THREE.LineSegments(tg,new THREE.LineBasicMaterial({color:0x5a78b8,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));S.add(tl);
 // ping rings
 const ringTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.strokeStyle='#fff';x.lineWidth=6;x.beginPath();x.arc(128,128,110,0,7);x.stroke();return new THREE.CanvasTexture(c);})();
 const rings=Array.from({length:40},()=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:ringTex,color:0xf6cf78,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));m.rotation.x=-Math.PI/2;S.add(m);return m;});
 const PINGS=[24.9,25.6,26.3,27.0,27.7];
 // focal "now" point
 const F=P.find(p=>!p.w&&Math.hypot(p.x,p.z+6)<6);
 const gold=new THREE.Color(0xf6cf78),warm=new THREE.Color(0xffe2a8),cool=new THREE.Color(0x5c78b0),white=new THREE.Color(0xe9e3d6);
 function update(T){const sep=eio(pr(T,28.9,31.4)),dim=pr(T,32.8,34.2),foc=eio(pr(T,37.0,40.9));
  let ti=0;for(let i=0;i<N;i++){const p=P[i];const tw=.75+.25*Math.sin(T*2.2+p.s*30);let y=p.y,c=white.clone(),s=2.2+p.s*1.6;
   const app=pr(T,20.4+p.s*1.6,21.2+p.s*1.6);
   if(p.w){y+=sep*p.up+Math.sin(T*.7+p.s*9)*.3*sep;c.lerp(cool,sep);s*=lerp(1,.75,dim);c.multiplyScalar(lerp(1,.45,dim));tp[ti*6]=p.x;tp[ti*6+1]=p.y;tp[ti*6+2]=p.z;tp[ti*6+3]=p.x;tp[ti*6+4]=y;tp[ti*6+5]=p.z;ti++;}
   else{c.lerp(warm,sep);c.multiplyScalar(lerp(1,1.35,dim));}
   if(p===F){s*=lerp(1,6,foc);c=gold.clone().multiplyScalar(1+foc);}
   else c.multiplyScalar(1-.85*foc);
   pos[i*3]=p.x;pos[i*3+1]=y;pos[i*3+2]=p.z;col[i*3]=c.r*tw*app;col[i*3+1]=c.g*tw*app;col[i*3+2]=c.b*tw*app;sz[i]=s;}
  g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;g.attributes.sz.needsUpdate=true;tg.attributes.position.needsUpdate=true;tl.material.opacity=.07*sep*(1-foc);
  rings.forEach((m,k)=>{const pi=Math.floor(k/8),j=k%8;const t0=PINGS[pi];const u=pr(T,t0+j*.03,t0+1.3+j*.03);m.visible=u>0&&u<1;if(!m.visible)return;const p=P[(k*137+11)%N];m.position.set(p.x,.05,p.z);const sc=.2+2.6*eo(u);m.scale.set(sc,sc,1);m.material.opacity=(1-u)*.9;});
  // camera: glide over the field, rise to see the drift, then dive into the focal point
  const a=eio(pr(T,20.4,28.7)),b=eio(pr(T,28.7,36.8));let cp=new THREE.Vector3(lerp(-4,6,a),lerp(3.2,4.0,a)+b*5,lerp(30,18,a)+b*4),lk=new THREE.Vector3(0,lerp(.5,1.0,a)+b*2.6,-8);
  if(T>36.8){const fp=new THREE.Vector3(F.x,F.y,F.z);cp=cp.clone().lerp(fp.clone().add(new THREE.Vector3(.2,.25,1.2)),foc);lk=lk.clone().lerp(fp,eio(pr(T,36.8,38.4)));}
  cam.position.copy(cp);cam.lookAt(lk);}
 const flash=T=>T>40.2&&T<41.4?0.85*Math.exp(-Math.pow((T-40.75)/0.3,2)):0;
 function hud(T){if(T<20.6||T>41)return '';let h='';const G='#F6CF78';
  const o1=pr(T,24.8,25.2)*(1-pr(T,28.4,28.8));if(o1>0){const n=Math.round(2250*eo(pr(T,24.8,27.8)));h+=`<div style="position:absolute;left:120px;top:150px;opacity:${o1}"><div class="lbl" style="position:static">随机提醒 · “你现在开心吗？”</div><div class="t serif" style="position:static;font-size:110px;color:${G};line-height:1.15">${n.toLocaleString('en')}<span style="font-size:40px"> 人</span></div></div>`;}
  const o2=pr(T,28.9,29.3)*(1-pr(T,36.4,36.9));if(o2>0){const v=(46.9*eo(pr(T,29.0,31.4))).toFixed(1);h+=`<div style="position:absolute;left:120px;top:150px;opacity:${o2}"><div class="lbl" style="position:static">清醒时间里，在走神</div><div class="t serif" style="position:static;font-size:130px;color:#a9bde8;line-height:1.1">${v}<span style="font-size:52px">%</span></div>
   <div style="opacity:${pr(T,33,33.5)};margin-top:18px;font-size:34px;font-weight:900;color:#fff"><span style="color:#a9bde8">● 走神</span>：通常更不开心<br><span style="color:${G}">● 专注当下</span>：更开心</div></div>`;}
  const o3=pr(T,37.4,37.9)*(1-pr(T,40.2,40.7));if(o3>0)h+=`<div class="t serif" style="left:960px;top:330px;transform:translateX(-50%);font-size:96px;color:${G};opacity:${o3};text-shadow:0 0 50px rgba(246,207,120,.6)">此刻</div>`;
  return h;}
 return {scene:S,cam,update,flash,hud};}
