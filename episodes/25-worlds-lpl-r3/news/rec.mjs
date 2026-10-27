import { chromium } from 'playwright-core';
import fs from 'fs';
const FPS=30,DUR=129.97,[a,b]=[+(process.argv[2]||0),+(process.argv[3]||Math.round(FPS*DUR))];fs.mkdirSync('fr',{recursive:true});
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await br.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto('file://'+process.cwd()+'/film.html');await p.waitForFunction(()=>window.READY===true);await p.evaluate(()=>document.fonts.ready);
if(a===0)fs.writeFileSync('events.json',JSON.stringify(await p.evaluate(()=>window.EVENTS)));
for(let i=a;i<b;i++){await p.evaluate(t=>renderAt(t),i/FPS);await p.screenshot({path:`fr/${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});}
await br.close();console.log('done',a,b);
