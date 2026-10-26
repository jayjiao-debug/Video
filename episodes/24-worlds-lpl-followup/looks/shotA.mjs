import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
for(const [f,sv] of [['slam','0'],['turn','1'],['turn','2']]){await p.goto('file://'+process.cwd()+`/looks.html?look=A&f=${f}&sub=${sv}`);await p.waitForFunction(()=>window.READY===true);await p.evaluate(()=>{document.fonts.ready;document.querySelector('.tag').remove()});await p.waitForTimeout(300);await p.screenshot({path:`A2_${f}${sv==='0'?'':'_S'+sv}.jpg`,type:'jpeg',quality:88});}
await b.close();
