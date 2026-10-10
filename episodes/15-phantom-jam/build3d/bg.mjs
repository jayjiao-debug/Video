import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const n of [0,2])for(const o of [0,1,2]){const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${PORT}/scenes2.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
 await p.evaluate(([n,o])=>window.shot(n,o),[n,o]);await p.screenshot({path:`bg_${n}_${o}.png`});await p.close();}
await b.close();SRV.close();
