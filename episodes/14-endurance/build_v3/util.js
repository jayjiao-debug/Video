const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),pr=(t,a,b)=>cl((t-a)/(b-a)),eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,eo=x=>1-Math.pow(1-x,3),sst=x=>x*x*(3-2*x),lerp=(a,b,f)=>a+(b-a)*f;
const pop=(T,t0,d=0.35)=>{const k=pr(T,t0,t0+d);return k<=0?0:(k>=1?1:eo(k)*(1+0.15*Math.sin(Math.PI*k)));};
export const U={cl,pr,eio,eo,sst,lerp,pop};
