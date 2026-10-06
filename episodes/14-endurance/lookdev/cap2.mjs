import { chromium } from 'playwright-core';import fs from 'fs';import { serve } from './serve.mjs';
const [,,page,outDir,dur,worker,nw]=process.argv;fs.mkdirSync(outDir,{recursive:true});
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto(`http://127.0.0.1:${PORT}/${page}`);await p.waitForFunction(()=>window.READY===true,null,{timeout:240000});
const N=Math.round(+dur*24);for(let i=+worker;i<N;i+=+nw){if(fs.existsSync(`${outDir}/f${String(i).padStart(5,"0")}.jpg`))continue;await p.evaluate(t=>window.renderAt(t),i/24);await p.screenshot({path:`${outDir}/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:90});}
await b.close();SRV.close();
