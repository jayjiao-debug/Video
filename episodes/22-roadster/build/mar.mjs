import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage();await p.goto(`http://127.0.0.1:${PORT}/film.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:180000});
console.log(JSON.stringify(await p.evaluate(()=>window.margins())));await b.close();SRV.close();
