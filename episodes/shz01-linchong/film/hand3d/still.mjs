// node still.mjs <out.png> '<json {ps, pl}>'  — render one pose over a plain warm background
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [out, json] = process.argv.slice(2);
const cfgs = JSON.parse(json);
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.log('err', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.log('console', m.text()); });
await p.goto('http://127.0.0.1:8765/hand.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 30000 });
const bg = `<svg width="1920" height="1080"><rect width="1920" height="1080" fill="#6b4a30"/><rect x="560" y="140" width="800" height="820" fill="#F1E4C6"/></svg>`;
let i = 0;
for (const c of (Array.isArray(cfgs) ? cfgs : [cfgs])) {
  await p.evaluate(([bg, c]) => window.frame(bg, c.ps, c.pl), [bg, c]);
  const f = cfgs.length > 1 ? out.replace('.png', `_${i++}.png`) : out;
  await p.screenshot({ path: f });
  console.log('wrote', f);
}
await b.close();
