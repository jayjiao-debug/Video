import { chromium } from 'playwright-core';
import {serve} from './serve.mjs'; const SRV=await serve(); const PORT=SRV.address().port;
import fs from 'fs';
const [,, outDir, fps='24', from='0', to='110', step='1', worker='0', nworkers='1'] = process.argv;
const lines = JSON.parse(fs.readFileSync('/home/claude/video/episodes/14-endurance/lines.json','utf8'));
fs.mkdirSync(outDir,{recursive:true});
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p = await b.newPage({viewport:{width:960,height:540}});
p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.addInitScript(l=>{window.LINES=l},lines);
await p.goto('http://127.0.0.1:'+PORT+'/index.html');
await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
const F=+fps, a=Math.round(+from*F), z=Math.round(+to*F);
for(let i=a+ +worker;i<z;i+= +nworkers*+step){
  await p.evaluate(t=>window.renderAt(t), i/F);
  await p.screenshot({path:`${outDir}/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:82});
}
await b.close();SRV.close();
