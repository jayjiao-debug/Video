import { chromium } from 'playwright-core';import { serve } from './serve.mjs';import fs from 'fs';
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto(`http://127.0.0.1:${PORT}/film.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:180000});
const res=await p.evaluate(()=>{const out=[];for(let f=0;f<=2715;f++){const r=window.check(f/30);if(r.bad.length)out.push(r);}return out;});
fs.writeFileSync('chk.json',JSON.stringify(res));
const groups={};for(const r of res)for(const k of r.bad){const key=k.split(' ')[0];(groups[key]=groups[key]||[]).push(r.T);}
for(const [k,v] of Object.entries(groups))console.log(k,v.length,'frames',v[0].toFixed(2),'→',v[v.length-1].toFixed(2));
console.log('total bad frames',res.length);await b.close();SRV.close();
