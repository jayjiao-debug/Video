import { chromium } from 'playwright-core';import http from 'http';import fs from 'fs';import path from 'path';
const [dir,...ts]=process.argv.slice(2);fs.mkdirSync(dir,{recursive:true});
const root=process.cwd();const srv=http.createServer((q,res)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':'application/octet-stream'});res.end(d)})});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.error('PAGEERR',e.message));
await p.goto(`http://127.0.0.1:${PORT}/film.html`);await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
for(const t of ts){await p.evaluate(t=>window.renderAt(+t),t);await p.screenshot({path:`${dir}/t${String(t).padStart(6,'0')}.jpg`,type:'jpeg',quality:85});}
await b.close();srv.close();
