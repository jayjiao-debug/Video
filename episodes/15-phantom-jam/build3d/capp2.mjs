import { chromium } from 'playwright-core';import fs from 'fs';import { serve } from './serve.mjs';
const [,,page,out,dur,w,nw]=process.argv;fs.mkdirSync(out,{recursive:true});const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:4096,height:2048}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto(`http://127.0.0.1:${PORT}/${page}`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
const N=Math.round(+dur*30);for(let i=+w;i<N;i+=+nw){const f=`${out}/f${String(i).padStart(5,'0')}.jpg`;if(fs.existsSync(f))continue;await p.evaluate(t=>window.renderAt(t),i/30);await p.screenshot({path:f,type:'jpeg',quality:93});}
await b.close();SRV.close();
