import http from 'http';import fs from 'fs';import path from 'path';
const root=path.dirname(new URL(import.meta.url).pathname);
export function serve(){return new Promise(r=>{const s=http.createServer((q,res)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));
 fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'});res.end(d)})});
 s.listen(0,'127.0.0.1',()=>r(s))})}
