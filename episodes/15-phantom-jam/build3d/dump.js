const {ringSim}=require('./sim.js');const K=1.8,KICK=6.4*K,DUR=16.58;
const r=ringSim({N:22,L:230,T:40,dt:0.02,every:1,kick:{i:0,t0:KICK,t1:KICK+2.0,dec:3.5}});
const OFF=-(r.frames[Math.round(KICK/r.dt)].x[0]/230)*2*Math.PI;const out={hz:120,OFF,x:[],v:[]};
for(let n=0;n<=DUR*120;n++){const s=n/120*K;const k=s/r.dt;const i=Math.floor(k),f=k-i;const A=r.frames[i],B=r.frames[i+1];
 out.x.push([...A.x].map((x,j)=>x+(B.x[j]-x)*f));out.v.push([...A.v].map((v,j)=>v+(B.v[j]-v)*f));}
require('fs').writeFileSync('cars.json',JSON.stringify(out));console.log('ok',out.x.length,OFF);
