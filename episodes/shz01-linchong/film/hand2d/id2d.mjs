// Render the hidden 3D guide as flat part-ID passes, one per drawing (on twos) -> ids/d_XXX.png + ids/meta.json
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import fs from 'fs';
import * as A from './anim2d.mjs';
const OUT = './ids';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.log('err', e.message));
await p.goto('http://127.0.0.1:8765/hand.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 30000 });
// solve the offset so the palm centre lands on PRINT_TARGET at contact
for (let it = 0; it < 3; it++) {
  const H = A.handAt2(A.T_CONTACT);
  const pts = await p.evaluate(([ps, pl]) => { window.pose(ps); window.place(pl); return { w: window.screenOf('wrist'), m: window.screenOf('middle-finger-phalanx-proximal') }; }, [H.ps, H.pl]);
  const pc = [pts.w[0] + (pts.m[0] - pts.w[0]) * 0.62, pts.w[1] + (pts.m[1] - pts.w[1]) * 0.62];
  A.OFFSET[0] += A.PRINT_TARGET[0] - pc[0];
  A.OFFSET[1] -= A.PRINT_TARGET[1] - pc[1]; // gl y is up
}
const meta = { offset: A.OFFSET.slice(), drawings: [] };
const nd = A.N / 2;
for (let i = 0; i < nd; i++) {
  const t = (i * 2) / A.FPS;
  const H = A.handAt2(t);
  const r = await p.evaluate(([ps, pl]) => window.idPass(ps, pl), [H.ps, H.pl]);
  fs.writeFileSync(`${OUT}/d_${String(i).padStart(3, '0')}.png`, Buffer.from(r.url.split(',')[1], 'base64'));
  meta.drawings.push({ i, t, meta: H.meta, pts: r.pts, s: H.pl.s });
}
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta));
console.log('id passes', nd, 'offset', A.OFFSET);
await b.close();
