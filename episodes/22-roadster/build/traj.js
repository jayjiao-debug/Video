// Car trajectory for the whole film as a pure function of film time T (precomputed table, interpolated).
// Phases: climb the spiral wall → stop on the ceiling → launch off the lip → mid-air freeze → roll upright → hover-brake → land
// → drive → jump the clay row with a kickflip (slow-mo) → land → thrust burst → hard stop → parked.
import * as THREE from 'three';
import {SLEN} from './world.js';
export const B=k=>0.12+3.474*k;
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const sm=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t);};
export const HIT={stop:12.50,launch:B(10),freeze0:37.3,flip:40.31,brake:B(13),land1:47.04,jump:54.22,land2:B(17),burst:B(18),halt:68.12};
export const S_STOP=139, V_CLIMB=6.0;
// ---- climb: constant 6 m/s, cosine brake over the last 4 s, stop exactly on the 12.50 fill
const TB0=8.5;const D_CLIMB=V_CLIMB*TB0+V_CLIMB*4*2/Math.PI;export const S0=S_STOP-D_CLIMB;
function climbS(T){if(T<=TB0)return S0+V_CLIMB*T;const u=Math.min(1,(T-TB0)/4);return S0+V_CLIMB*TB0+V_CLIMB*4*2/Math.PI*Math.sin(u*Math.PI/2);}
// ---- launch along the ceiling: a=9 from the stop to the lip
const A_L=9;const DL=SLEN-S_STOP;const TLIP=HIT.launch+Math.sqrt(2*DL/A_L);export const V_LIP=A_L*(TLIP-HIT.launch);
// ---- time warp (film time → action time) for the two slow-motion moments
function warp(T){return 1-.96*sm(HIT.freeze0,HIT.freeze0+.35,T)*(1-sm(HIT.flip-.25,HIT.flip+.05,T))-.65*sm(54.45,54.75,T)*(1-sm(58.45,58.75,T));}
const DT=1/240;const N=Math.ceil(92/DT);const TAU=new Float64Array(N+1);for(let i=1;i<=N;i++)TAU[i]=TAU[i-1]+warp((i-.5)*DT)*DT;
export const tau=T=>{const f=cl(T/DT,0,N-1);const i=Math.floor(f);return TAU[i]+(TAU[i+1]-TAU[i])*(f-i);};
// monotone cubic through keys
function mono(pts){const n=pts.length,x=pts.map(p=>p[0]),y=pts.map(p=>p[1]);const d=[],m=new Array(n).fill(0);for(let i=0;i<n-1;i++)d.push((y[i+1]-y[i])/(x[i+1]-x[i]));
 m[0]=d[0];m[n-1]=d[n-2];for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
 for(let i=0;i<n-1;i++){if(d[i]===0){m[i]=m[i+1]=0;continue;}const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;if(s>9){const t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i];}}
 return u=>{if(u<=x[0])return y[0]+m[0]*(u-x[0]);if(u>=x[n-1])return y[n-1];let i=0;while(u>x[i+1])i++;const h=x[i+1]-x[i],t=(u-x[i])/h,t2=t*t,t3=t2*t;
  return (2*t3-3*t2+1)*y[i]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*y[i+1]+(t3-t2)*h*m[i+1];};}
// ---- flight 1 (in action time from the lip)
export const LIP={x:104,y:21.0};// filled in by main from the true ramp pose
const t1=tau(TLIP);const tFlip=tau(HIT.flip)-t1;const tLand=tau(HIT.land1)-t1;
export const F1={t1,tFlip,tLand,TLIP};
let fx1,fy1;export function initFlight(lipX,lipY){LIP.x=lipX;LIP.y=lipY;
 const vx0=V_LIP,vx1=5.5;const k=(vx0-vx1)/(2*tLand);fx1=t=>lipX+vx0*t-k*t*t;
 fy1=mono([[0,lipY],[.45,lipY-1.0],[tFlip,lipY-2.6],[tFlip+1.6,lipY-7.5],[tLand*.62,4.2],[tLand-.6,.35],[tLand,0]]);}
export const vxAt1=t=>{const k=(V_LIP-5.5)/(2*tLand);return V_LIP-2*k*t;};
// ---- ground run 1 → jump 2
const T_L1=HIT.land1;const A1=.905;let X_L1=0,X_T=0,ROW_C=0;
const tj0=tau(HIT.jump),tj1=tau(HIT.land2);export const JD=tj1-tj0;const VXJ=5.5+A1*(HIT.jump-T_L1);const VY0=9.81*JD/2;
export const JUMP={VXJ,VY0,JD};
export function initGround(){X_L1=fx1(tLand);X_T=X_L1+5.5*(HIT.jump-T_L1)+.5*A1*(HIT.jump-T_L1)**2;ROW_C=X_T+VXJ*JD*.5;return {X_L1,X_T,ROW_C,X_L2:X_T+VXJ*JD};}
// after landing 2: cruise at VXJ, burst at B(18) (+16 m/s in 1 s), hard stop at 68.12 (0.0 at ~69.4)
function run2(T){const t=T-HIT.land2;const X_L2=X_T+VXJ*JD;const tb=HIT.burst-HIT.land2;const th=HIT.halt-HIT.land2;
 // v(t): VXJ until tb, +16 over 1 s (eased), hold, then brake to 0 over 1.3 s from th
 const vAt=u=>{let v=VXJ+16*sm(tb,tb+1.0,u);if(u>th)v*=1-sm(th,th+1.3,u);return v;};
 let x=X_L2,uu=0;const st=1/120;while(uu+st<=t){x+=vAt(uu+st/2)*st;uu+=st;}x+=vAt(uu)*(t-uu);return {x,v:vAt(t)};}
// ---- state at T
const Q=new THREE.Quaternion(),E=new THREE.Euler();
export function stateAt(T){
 if(T<HIT.launch){const s=T<HIT.stop?climbS(T):S_STOP;return {mode:'ramp',s,spin:s/.355,jets:[],t:tau(T)};}
 if(T<TLIP){const u=T-HIT.launch;const s=S_STOP+.5*A_L*u*u;return {mode:'ramp',s,spin:s/.355,jets:[[0,.25*sm(0,.4,u)],[1,.25*sm(0,.4,u)],[2,.25*sm(0,.4,u)],[3,.25*sm(0,.4,u)]],t:tau(T)};}
 const ta=tau(T);
 if(T<HIT.land1){const t=ta-t1;const x=fx1(t),y=fy1(t);
  // roll from inverted (π) to upright (0) between tFlip and tFlip+1.15, small pitch with the descent
  const r=Math.PI*(1-sm(tFlip,tFlip+1.15,t));const vy=(fy1(t+.01)-fy1(t))/.01;const pitch=cl(vy*.02,-.25,.1);
  E.set(r,0,pitch,'XYZ');Q.setFromEuler(E);
  const jets=[];const fl=sm(tFlip-.02,tFlip+.05,t)*(1-sm(tFlip+.75,tFlip+1.0,t));if(fl>0){jets.push([4,fl],[6,fl]);}
  const hover=sm(tFlip+.9,tFlip+1.4,t)*(1-sm(tLand-.05,tLand+.2,t));const brake=sm(tau(HIT.brake)-t1-.2,tau(HIT.brake)-t1+.3,t);
  if(hover>0)for(const i of [4,5,6,7])jets.push([i,hover*(.45+.55*brake)]);
  return {mode:'free',pos:new THREE.Vector3(x,y,0),quat:Q.clone(),spin:(SLEN+x-LIP.x)/.355,jets,t:ta,air:true,hgt:y};}
 if(T<HIT.jump){const u=T-T_L1;const x=X_L1+5.5*u+.5*A1*u*u;const land=Math.exp(-u*5)*.05;E.set(0,0,-land,'XYZ');Q.setFromEuler(E);
  const charge=sm(HIT.jump-1.96,HIT.jump,T);const jets=charge>0?[[4,.15*charge],[5,.15*charge],[6,.15*charge],[7,.15*charge]]:[];
  return {mode:'free',pos:new THREE.Vector3(x,0,0),quat:Q.clone(),spin:(x)/.355,jets,t:ta,v:5.5+A1*u,ground:true};}
 if(T<HIT.land2){const t=ta-tj0;const x=X_T+VXJ*t;const y=VY0*t-4.905*t*t;
  // kickflip: full roll (2π) about the forward axis in the middle of the flight
  const r=2*Math.PI*sm(JD*.2,JD*.8,t);E.set(r,0,.1*Math.sin(Math.PI*t/JD)-.05,'XYZ');Q.setFromEuler(E);const cen=new THREE.Vector3(0,.6,0),off=cen.clone().applyQuaternion(Q);
  const up=1-sm(.0,.45,t);const att=Math.max(sm(JD*.18,JD*.24,t)*(1-sm(JD*.26,JD*.32,t)),sm(JD*.72,JD*.76,t)*(1-sm(JD*.8,JD*.86,t)));const br=sm(JD-.55,JD-.35,t)*(1-sm(JD-.05,JD+.1,t));
  const jets=[];const dn=Math.max(up,br);if(dn>0)for(const i of [4,5,6,7])jets.push([i,dn]);if(att>0)jets.push([8,att],[9,att]);
  return {mode:'free',pos:new THREE.Vector3(x,Math.max(0,y)+.6,0).sub(off),quat:Q.clone(),spin:x/.355,jets,t:ta,air:true,hgt:y};}
 const {x,v}=run2(T);const u=T-HIT.land2;const dip=-.06*sm(HIT.halt-HIT.land2,HIT.halt-HIT.land2+.25,u)*(1-sm(HIT.halt-HIT.land2+.9,HIT.halt-HIT.land2+1.8,u))+.03*Math.exp(-u*6);
 const squat=.035*sm(HIT.burst-HIT.land2,HIT.burst-HIT.land2+.2,u)*(1-sm(HIT.burst-HIT.land2+.6,HIT.burst-HIT.land2+1.2,u));
 E.set(0,0,dip+squat,'XYZ');Q.setFromEuler(E);
 const bu=sm(HIT.burst,HIT.burst+.08,T)*(1-sm(HIT.burst+.9,HIT.burst+1.3,T));const jets=bu>0?[[0,bu],[1,bu],[2,bu],[3,bu]]:[];
 return {mode:'free',pos:new THREE.Vector3(x,0,0),quat:Q.clone(),spin:x/.355,jets,t:ta,v,ground:true};}
