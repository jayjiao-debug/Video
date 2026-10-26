import { chromium } from 'playwright-core';import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+process.cwd()+'/film.html');await p.waitForFunction(()=>window.READY===true);
const L=await p.evaluate(()=>[...document.querySelectorAll('.sub span')].map((s,i)=>s.innerHTML));
const T=await p.evaluate(()=>LINES.map(l=>[+l[0].toFixed(3),+l[1].toFixed(3)]));
fs.writeFileSync('lines.json',JSON.stringify(T.map((t,i)=>[t[0],t[1],L[i].replace(/<b>/g,'[').replace(/<\/b>/g,']')]),null,1));await b.close();
