import { chromium } from 'playwright-core';import { serve } from './serve.mjs';
const [lay,T,cx,cy,cz,lx,ly,lz,out]=process.argv.slice(2);const W=lay==='wide'?1440:1080,H=lay==='wide'?1080:1440;
const SRV=await serve();const PORT=SRV.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:W,height:H}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto(`http://127.0.0.1:${PORT}/cover3.html?cover=${lay}`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
await p.evaluate(a=>window.coverAt(a[0],[a[1],a[2],a[3]],[a[4],a[5],a[6]]),[+T,+cx,+cy,+cz,+lx,+ly,+lz]);await p.screenshot({path:out,type:'png'});await b.close();SRV.close();
