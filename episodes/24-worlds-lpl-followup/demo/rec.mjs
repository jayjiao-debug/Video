import { chromium } from 'playwright-core';
import fs from 'fs';
const FPS=30,DUR=17.6;fs.mkdirSync('fr',{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto('file://'+process.cwd()+'/intro.html');await p.waitForFunction(()=>window.READY===true);await p.evaluate(()=>document.fonts.ready);
const N=Math.round(FPS*DUR);const t0=Date.now();
for(let i=0;i<N;i++){await p.evaluate(t=>renderAt(t),i/FPS);await p.screenshot({path:`fr/${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
console.log('frames',N,'sec',(Date.now()-t0)/1000);await b.close();
