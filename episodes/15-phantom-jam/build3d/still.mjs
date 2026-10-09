import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const [page,...ts]=process.argv.slice(2);const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text())});
await p.goto(`http://127.0.0.1:${PORT}/${page}`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
for(const t of ts){const t0=Date.now();await p.evaluate(t=>window.renderAt(+t),t);await p.screenshot({path:`st_${t}.jpg`,type:'jpeg',quality:88});console.log(t,Date.now()-t0,'ms');}
await b.close();SRV.close();
