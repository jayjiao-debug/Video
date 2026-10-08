import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const SRV=await serve();const PORT=SRV.address().port;const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1920,height:1080}});await p.addInitScript(()=>{window.LINES=[]});
await p.goto(`http://127.0.0.1:${PORT}/film2d.html`);await p.waitForFunction(()=>window.READY===true);await p.evaluate(()=>document.fonts.ready);
await p.evaluate(()=>{window.renderAt(7.6);document.getElementById('mark').style.display='none';});await p.screenshot({path:'cover_bg.png'});
await b.close();SRV.close();
