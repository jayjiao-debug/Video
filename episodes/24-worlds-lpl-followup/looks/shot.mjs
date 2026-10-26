import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
for(const L of (process.argv[2]||'ABC').split(''))for(const f of ['slam','turn']){await p.goto('file://'+process.cwd()+`/looks.html?look=${L}&f=${f}`);await p.waitForFunction(()=>window.READY===true);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);await p.screenshot({path:`${L}_${f}.jpg`,type:'jpeg',quality:88});}
await b.close();
