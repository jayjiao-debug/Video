import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text().slice(0,200))});
const [page,looks,fs_,t]=process.argv.slice(2);
for(const L of looks.split(''))for(const f of fs_.split(',')){await p.goto(`http://127.0.0.1:${PORT}/${page}?look=${L}&f=${f}`);await p.waitForFunction(()=>window.READY===true,null,{timeout:120000});await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(t=>window.renderAt(+t),t||9);await p.waitForTimeout(200);await p.screenshot({path:`${L}_${f}.jpg`,type:'jpeg',quality:88});}
await b.close();SRV.close();
