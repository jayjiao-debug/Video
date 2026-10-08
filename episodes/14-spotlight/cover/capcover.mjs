import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1500,height:2600}});await p.goto(`http://127.0.0.1:${PORT}/cover/cover.html`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await (await p.$('#wide')).screenshot({path:'cover/封面_横版4比3.png'});await (await p.$('#tall')).screenshot({path:'cover/封面_竖版3比4.png'});
await b.close();SRV.close();
