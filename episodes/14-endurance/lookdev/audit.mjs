import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto(`http://127.0.0.1:${PORT}/${process.argv[2]}`);await p.waitForFunction(()=>window.READY===true,null,{timeout:180000});
const r=await p.evaluate(()=>{const out=[];for(let f=0;f<360;f++){const t=f/24;window.renderAt&&0;const iss=window.audit(t);if(iss.length)out.push([t.toFixed(2),iss.join('; ')]);}return {INFO:window.INFO,out};});
console.log(JSON.stringify({shards:r.INFO.shards,rejected:r.INFO.rejected,issues:r.out.length,first:r.out.slice(0,8)}));await b.close();SRV.close();
