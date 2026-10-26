// shared helpers (ep25, look A 黑金决赛场)
export const B=n=>0.383+2.0248*n;           // s130f bar grid (118.5 bpm)
export const BEAT=0.5062;
export const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const sm=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t);};
export const lerp=(a,b,t)=>a+(b-a)*t;
export const eio=t=>{t=cl(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
export const eo=t=>{t=cl(t);return 1-Math.pow(1-t,3);};
export const vis=(T,a,b,f=.3)=>sm(a,a+f,T)*(1-sm(b-f,b,T));
export const back=(T,t0,d=.32)=>{if(T<t0)return 0;const e=cl((T-t0)/d);const c1=1.9,c3=c1+1;return 1+c3*Math.pow(e-1,3)+c1*Math.pow(e-1,2);};
export const H=(i,k=0)=>{let x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x);};
export const REGC={LPL:'#ff4560',LCK:'#4f9dff',LEC:'#30d8c4',LCS:'#b98dff',LCP:'#ffb84d',CBLOL:'#62de7c'};
export const GOLD='#F6CF78';
export let D=null;export async function loadData(){D=await (await fetch('data.json')).json();return D;}
