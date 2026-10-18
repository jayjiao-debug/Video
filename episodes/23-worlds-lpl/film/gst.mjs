import { chromium } from 'playwright-core';import { serve } from './serve.mjs';import fs from 'fs';
const [dir,...ts]=process.argv.slice(2);fs.mkdirSync(dir,{recursive:true});const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))console.error('CONSOLE',m.text().slice(0,300))});
await p.goto(`http://127.0.0.1:${PORT}/film.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:180000});
for(const t of ts){await p.evaluate(t=>window.renderAt(+t),t);await p.screenshot({path:`${dir}/t${String(t).padStart(6,'0')}.jpg`,type:'jpeg',quality:85});}
console.log(JSON.stringify(await p.evaluate(()=>window.G)));
await b.close();SRV.close();
