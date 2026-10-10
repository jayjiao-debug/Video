import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const [n,ink] of [[9,0],[9,1],[0,1],[2,1],[1,1],[5,1]]){const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${PORT}/scenes3.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
 await p.evaluate(([n,ink])=>{window.INK.on=!!ink;window.shot(n,0);},[n,ink]);await p.screenshot({path:`ink_${n}_${ink}.png`});await p.close();console.log(n,ink);}
await b.close();SRV.close();
