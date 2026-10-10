import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const n of [1,2,3]){const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${PORT}/props.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
 await p.evaluate(n=>window.sheet(n),n);await p.screenshot({path:`props_${n}.png`});await p.close();console.log('sheet',n);}
await b.close();SRV.close();
