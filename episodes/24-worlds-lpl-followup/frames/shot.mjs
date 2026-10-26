import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
for(let f=1;f<=8;f++){await p.goto('file://'+process.cwd()+`/frames.html?f=${f}`);await p.waitForFunction(()=>window.READY===true);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);await p.screenshot({path:`F${f}.jpg`,type:'jpeg',quality:88});}
await b.close();
