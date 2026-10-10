const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(1920,1080);R.outputColorSpace=THREE.SRGBColorSpace;document.body.prepend(R.domElement);
const C={teal:0x22A699,black:0x26282b,amber:0xE89A12,blue:0x2E6FD8,red:0xE5493A,white:0xF4F5F2};
const basic=c=>new THREE.MeshBasicMaterial({color:c});const lam=c=>new THREE.MeshLambertMaterial({color:c});
function ctex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function scene(bg=0xE4E6E1,night=false){const S=new THREE.Scene();S.background=new THREE.Color(bg);
 if(!night){S.add(new THREE.HemisphereLight(0xffffff,0xc9cec6,1.7));const d=new THREE.DirectionalLight(0xffffff,1.6);d.position.set(-20,40,25);S.add(d);}
 else{S.add(new THREE.HemisphereLight(0x8090b0,0x101418,0.5));}
 const gt=ctex(256,256,(g)=>{g.fillStyle=night?'#0f1316':'#E4E6E1';g.fillRect(0,0,256,256);g.fillStyle=night?'rgba(255,255,255,.07)':'rgba(60,70,65,.30)';for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.beginPath();g.arc(x*64+32,y*64+32,2.4,0,7);g.fill();}});
 gt.wrapS=gt.wrapT=THREE.RepeatWrapping;gt.repeat.set(100,100);const m=new THREE.Mesh(new THREE.PlaneGeometry(800,800),new THREE.MeshBasicMaterial({map:gt}));m.rotation.x=-Math.PI/2;S.add(m);return S;}
const shMat=new THREE.MeshBasicMaterial({color:0x1c2522,transparent:true,opacity:.16,depthWrite:false});
function shadow(w,l){const g=new THREE.PlaneGeometry(w,l);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,shMat);m.position.set(0.12,0.01,0.12);return m;}
function lane(S,x,z0,z1,col,w=0.55){const g=new THREE.PlaneGeometry(w,Math.abs(z1-z0));g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,basic(col));m.position.set(x,0.03,(z0+z1)/2);S.add(m);}
/* ---------------- CAR DESIGNS (length along -z = forward) ---------------- */
const darkGlass=0x2c3a45;
const darkGlass=0x2c3a45;
function lights(g,mode,len,yy,wid){ // tail lights at +z, headlights at -z
 const tl=new THREE.MeshBasicMaterial({color:mode==='brake'?0xFF3020:0x7a2018});
 for(const x of [-wid,wid]){const t=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.07,0.03),tl);t.position.set(x,yy,len/2+0.005);g.add(t);
  const h=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.06,0.03),basic(0xFFF6D8));h.position.set(x,yy,-len/2-0.005);g.add(h);}
 if(mode==='brake'){const gl=ctex(64,64,(c)=>{const r=c.createLinearGradient(0,0,0,64);r.addColorStop(0,'rgba(255,60,40,.55)');r.addColorStop(1,'rgba(255,60,40,0)');c.fillStyle=r;c.fillRect(0,0,64,64);});
  const p=new THREE.PlaneGeometry(wid*2+0.3,0.55);p.rotateX(-Math.PI/2);const m=new THREE.Mesh(p,new THREE.MeshBasicMaterial({map:gl,transparent:true,depthWrite:false}));m.position.set(0,0.02,len/2+0.3);g.add(m);}}
function sensor(g,y){const d=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,0.1,20),basic(0x22A699));d.position.set(0,y+0.05,0.05);g.add(d);
 const r=new THREE.Mesh(new THREE.RingGeometry(1.15,1.25,48),basic(0x22A699));r.rotation.x=-Math.PI/2;r.position.y=0.02;g.add(r);}
// A: clean capsule — one low rounded body, glass inset, no visible wheels
function carB(col,mode='drive'){const g=new THREE.Group();const c=new THREE.Color(col);
 const L=1.9,Wd=0.86;const sh=new THREE.Shape();// profile in (z,y): z from -L/2 (front) to L/2 (rear)
 sh.moveTo(-0.95,0.12);sh.lineTo(0.95,0.12);sh.lineTo(0.95,0.36);sh.lineTo(0.62,0.40);sh.lineTo(-0.62,0.40);sh.lineTo(-0.95,0.33);sh.closePath();
 const body=new THREE.ExtrudeGeometry(sh,{depth:Wd,bevelEnabled:true,bevelSize:0.04,bevelThickness:0.04,bevelSegments:2});body.translate(0,0,-Wd/2);body.rotateY(Math.PI/2);
 g.add(new THREE.Mesh(body,lam(c)));
 const gh=new THREE.Shape();gh.moveTo(-0.38,0.40);gh.lineTo(0.48,0.40);gh.lineTo(0.30,0.62);gh.lineTo(-0.16,0.62);gh.closePath();
 const ghG=new THREE.ExtrudeGeometry(gh,{depth:Wd-0.14,bevelEnabled:false});ghG.translate(0,0,-(Wd-0.14)/2);ghG.rotateY(Math.PI/2);g.add(new THREE.Mesh(ghG,lam(darkGlass)));
 const roof=new THREE.Mesh(new THREE.BoxGeometry(Wd-0.18,0.03,0.42),lam(c));roof.position.set(0,0.635,-0.07);g.add(roof);
 const wg=[];for(const x of [-0.44,0.44])for(const z of [-0.6,0.6]){const w=new THREE.CylinderGeometry(0.14,0.14,0.1,16);w.rotateZ(Math.PI/2);w.translate(x,0.14,z);wg.push(w);}
 g.add(new THREE.Mesh(mergeGeometries(wg),lam(0x1d1f21)));lights(g,mode,1.98,0.28,0.28);g.add(shadow(1.0,2.05));if(mode==='auto')sensor(g,0.65);return g;}
// C: navigation-app icon — extruded top outline, roof lighter, windscreens dark, very readable from above
function led(g,lines,W,H,pitch){g.fillStyle='#0e100f';g.fillRect(0,0,W,H);const c=document.createElement('canvas');c.width=Math.floor(W/pitch);c.height=Math.floor(H/pitch);const q=c.getContext('2d');q.fillStyle='#000';q.fillRect(0,0,c.width,c.height);q.textBaseline='middle';q.textAlign='center';
 lines.forEach((l,i)=>{q.font=`900 ${Math.floor(c.height/lines.length*0.8)}px "Noto Sans CJK SC"`;q.fillStyle=l.c;q.fillText(l.t,c.width/2,(i+0.5)*c.height/lines.length+1);});
 const d=q.getImageData(0,0,c.width,c.height).data;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const k=(y*c.width+x)*4;const on=d[k]+d[k+1]+d[k+2]>150;g.fillStyle=on?(d[k]>200&&d[k+1]<120?'#FF4A3A':'#FFB21A'):'#1d1a14';g.fillRect(x*pitch+0.5,y*pitch+0.5,pitch-1,pitch-1);}}
function frontA(){const G=new THREE.Group();const post=lam(0x9aa09a);for(const x of [-3.8,3.8]){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,6.2,12),post);p.position.set(x,3.1,0);G.add(p);}
 const b=new THREE.Mesh(new THREE.BoxGeometry(7.9,0.3,0.3),post);b.position.y=5.9;G.add(b);
 const t=ctex(1024,300,(g,w,h)=>{g.fillStyle='#1D7A4C';rr(g,0,0,w,h,26);g.fill();g.strokeStyle='#fff';g.lineWidth=10;rr(g,16,16,w-32,h-32,16);g.stroke();g.fillStyle='#fff';g.textAlign='center';g.font='900 132px "Noto Sans CJK SC"';g.fillText('最前面',w/2,175);g.font='700 42px "Noto Sans CJK SC"';g.fillText('FRONT OF THE QUEUE',w/2,250);});
 const p=new THREE.Mesh(new THREE.PlaneGeometry(6.6,1.95),new THREE.MeshBasicMaterial({map:t}));p.position.set(0,5.0,0.2);G.add(p);return G;}
