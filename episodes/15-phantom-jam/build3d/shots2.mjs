import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const n of (process.argv[2]||'0,1,2,3,4,5,6').split(',').map(Number)){const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',n,e.message));
 await p.goto(`http://127.0.0.1:${PORT}/scenes2.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
 await p.evaluate(n=>window.shot(n),n);await p.screenshot({path:`s2_${n}.png`});await p.close();console.log('shot',n);}
await b.close();SRV.close();
