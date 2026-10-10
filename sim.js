// optimal-velocity ring: N cars on L metres. returns frames[step] = {x:Float64Array, v:Float64Array}
function ringSim(o){const N=o.N||22,L=o.L||230,dt=o.dt||0.02,T=o.T||120,a=o.a||1.0,vmax=o.vmax||11.1,w=o.w||3,hc=L/N,Vm=o.Vm||16.7;
 const V=h=>Math.max(0,Math.min(vmax,Vm/2*(Math.tanh((h-hc)/w)+Math.tanh(hc/w))));
 const x=new Float64Array(N),v=new Float64Array(N);for(let i=0;i<N;i++){x[i]=i*hc;v[i]=V(hc);}
 const out=[];const steps=Math.round(T/dt);const every=o.every||5;
 for(let s=0;s<=steps;s++){const t=s*dt;
  if(s%every===0)out.push({x:Float64Array.from(x),v:Float64Array.from(v)});
  const acc=new Float64Array(N);for(let i=0;i<N;i++){const j=(i+1)%N;let h=x[j]-x[i];if(h<0)h+=L;acc[i]=a*(V(h)-v[i]);
   if(o.kick&&i===o.kick.i&&t>=o.kick.t0&&t<o.kick.t1)acc[i]=Math.min(acc[i],-o.kick.dec);}
  for(let i=0;i<N;i++){v[i]=Math.max(0,v[i]+acc[i]*dt);x[i]+=v[i]*dt;}}
 return {frames:out,dt:dt*every,N,L,V};}
if(typeof module!=='undefined')module.exports={ringSim};
