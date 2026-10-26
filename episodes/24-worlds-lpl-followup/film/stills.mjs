import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto('file://'+process.cwd()+'/film.html');await p.waitForFunction(()=>window.READY===true);await p.evaluate(()=>document.fonts.ready);
const T=process.argv.slice(2).map(Number);
for(const t of T){await p.evaluate(t=>renderAt(t),t);await p.waitForTimeout(80);await p.screenshot({path:`s_${t}.jpg`,type:'jpeg',quality:85});}
await b.close();
