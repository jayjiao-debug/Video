import { chromium } from 'playwright';import fs from 'fs';import { serve } from './serve.mjs';
const [,,page,out,a,b,w,nw]=process.argv;fs.mkdirSync(out,{recursive:true});const SRV=await serve();const PORT=SRV.address().port;
const br=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await br.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto(`http://127.0.0.1:${PORT}/${page}`);await p.waitForFunction(()=>window.READY===true,null,{timeout:180000});
for(let i=+a+ +w;i<+b;i+=+nw){const f=`${out}/f${String(i).padStart(5,'0')}.jpg`;await p.evaluate(t=>window.renderAt(t),i/30);await p.screenshot({path:f,type:'jpeg',quality:94});}
await br.close();SRV.close();
