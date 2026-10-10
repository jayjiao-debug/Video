import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto(`http://127.0.0.1:${PORT}/probe3.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
const o=await p.evaluate(()=>camProbe());
// jerk: frame-to-frame change in speed / angular speed
let rep=[];for(let i=1;i<o.length;i++){const ds=Math.abs(o[i][1]-o[i-1][1]),da=Math.abs(o[i][2]-o[i-1][2]);if(ds>8||da>6)rep.push([o[i][0],o[i][1],o[i][2],+ds.toFixed(1),+da.toFixed(1)]);}
console.log('jerks',JSON.stringify(rep.slice(0,40)));
const top=[...o].sort((a,b)=>b[2]-a[2]).slice(0,8);console.log('max ang speed deg/s',JSON.stringify(top));
const tops=[...o].sort((a,b)=>b[1]-a[1]).slice(0,5);console.log('max lin speed m/s',JSON.stringify(tops));
await b.close();SRV.close();
