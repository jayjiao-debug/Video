// OV ring with a stopping distance hs (cars never overlap: V(hs)=0, hard floor at hmin)
function ringSim2(o){const N=o.N||22,L=o.L||230,dt=o.dt||0.02,T=o.T||200,a=o.a||1.0,vmax=o.vmax||11.1,w=o.w||2.2,hc=L/N,hs=o.hs||5.8,Vm=o.Vm||18,every=o.every||1;
 const base=Math.tanh((hc-hs)/w);const V=h=>Math.max(0,Math.min(vmax,Vm/2*(Math.tanh((h-hc)/w)+base)));
 const x=new Float64Array(N),v=new Float64Array(N);for(let i=0;i<N;i++){x[i]=i*hc;v[i]=V(hc);}
 const out=[];const steps=Math.round(T/dt);
 for(let s=0;s<=steps;s++){const t=s*dt;if(s%every===0)out.push({x:Float64Array.from(x),v:Float64Array.from(v)});
  const acc=new Float64Array(N);for(let i=0;i<N;i++){const j=(i+1)%N;let h=x[j]-x[i];if(h<0)h+=L;acc[i]=a*(V(h)-v[i]);if(o.kick&&i===o.kick.i&&t>=o.kick.t0&&t<o.kick.t1)acc[i]=Math.min(acc[i],-o.kick.dec);}
  for(let i=0;i<N;i++){v[i]=Math.max(0,v[i]+acc[i]*dt);x[i]+=v[i]*dt;}
  for(let i=0;i<N;i++){const j=(i+1)%N;let h=x[j]-x[i];if(h<0)h+=L;if(h<o.hmin){x[i]-=(o.hmin-h);v[i]=Math.min(v[i],v[j]);}}}
 return {frames:out,dt:dt*every,N,L,V};}
if(typeof module!=='undefined')module.exports={ringSim2};
