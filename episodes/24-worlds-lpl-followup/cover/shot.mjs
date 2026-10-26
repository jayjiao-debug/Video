import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [l,W,H] of [['wide',1440,1080],['tall',1080,1440]]){const p=await b.newPage({viewport:{width:W,height:H}});
 await p.goto('file://'+process.cwd()+'/cover.html?l='+l);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
 await p.screenshot({path:`cover_${l}.png`});}
await b.close();
