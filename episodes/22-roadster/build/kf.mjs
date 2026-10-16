import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const ks=process.argv.slice(2);const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.error('CONSOLE',m.text().slice(0,300))});
await p.goto(`http://127.0.0.1:${PORT}/film.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:180000});
for(const k of ks){const t0=Date.now();await p.evaluate(k=>window.renderKF(k),k);await p.screenshot({path:`kf_${k}.jpg`,type:'jpeg',quality:90});console.log(k,Date.now()-t0,'ms');}
await b.close();SRV.close();
