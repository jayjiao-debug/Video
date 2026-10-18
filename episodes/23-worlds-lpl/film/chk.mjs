import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto(`http://127.0.0.1:${PORT}/film.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:180000});
console.log(JSON.stringify(await p.evaluate(()=>window.check())));
// subtitle widths
console.log(JSON.stringify(await p.evaluate(()=>window.LINES.map(l=>{window.renderAt(l[0]+.5);const s=document.querySelector('#sub span');return [l[0],s?Math.round(s.getBoundingClientRect().width):0];}).filter(x=>x[1]>1700))));
await b.close();SRV.close();
