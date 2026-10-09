import { chromium } from 'playwright-core';import fs from 'fs';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.error('C',m.text())});
await p.goto(`http://127.0.0.1:${PORT}/flat.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
for(const v of ['sfx','orbit']){const t0=Date.now();const b64=await p.evaluate(v=>window.renderAudio(v),v);fs.writeFileSync(`aud_${v}.f32`,Buffer.from(b64,'base64'));console.log(v,Date.now()-t0,'ms');}
await b.close();SRV.close();
