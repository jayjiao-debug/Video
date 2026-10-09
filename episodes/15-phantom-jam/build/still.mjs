import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const ts=process.argv.slice(2).map(Number);const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto(`http://127.0.0.1:${PORT}/jam.html`);await p.waitForFunction(()=>window.READY===true);await p.evaluate(()=>document.fonts.ready);
for(const t of ts){await p.evaluate(t=>window.renderAt(t),t);await p.screenshot({path:`st_${t}.jpg`,type:'jpeg',quality:88});}
await b.close();SRV.close();
