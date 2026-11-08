// node render6.mjs <outdir> [ids]: render 16:9 storyboard frames + automatic layer/clip check
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import fs from 'fs';
import { FRAMES, W, H } from './scenes16.mjs';
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const only = process.argv[3] ? process.argv[3].split(',') : null;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H } });
const report = [];
for (const fr of FRAMES) {
  if (only && !only.includes(fr.id)) continue;
  const svg = fr.make().replace('<svg ', `<svg width="${W}" height="${H}" `);
  await p.setContent(`<html><head><meta charset="utf-8"><style>body{margin:0;background:#000}</style></head><body>${svg}</body></html>`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const issues = await p.evaluate(([W, H]) => {
    const out = [];
    const r = (el) => el.getBoundingClientRect();
    for (const g of document.querySelectorAll('g[data-layer]')) {
      const bl = g.dataset.bleed || '';
      if (bl === 'all') continue;
      const q = r(g);
      if (q.width === 0) continue;
      const cut = [];
      if (q.left < -2 && !bl.includes('l')) cut.push('left ' + Math.round(q.left));
      if (q.right > W + 2 && !bl.includes('r')) cut.push('right ' + Math.round(q.right - W));
      if (q.top < -2 && !bl.includes('t')) cut.push('top ' + Math.round(q.top));
      if (q.bottom > H + 2 && !bl.includes('b')) cut.push('bottom ' + Math.round(q.bottom - H));
      if (cut.length) out.push(`layer ${g.dataset.layer} crosses the frame: ${cut.join(', ')}`);
    }
    for (const c of document.querySelectorAll('[data-container]')) {
      const box = r(c.querySelector('[data-box]'));
      for (const t of c.querySelectorAll('[data-inbox]')) {
        const q = r(t);
        if (q.left < box.left - 2 || q.right > box.right + 2 || q.top < box.top - 2 || q.bottom > box.bottom + 2) out.push(`text spills out of its paper: ${t.textContent.slice(0, 6)}…`);
      }
    }
    const faces = [...document.querySelectorAll('[data-face]')].map(r);
    for (const fc of faces) {
      const inAll = false;
      if (fc.left < 0 || fc.right > W || fc.top < 0 || fc.bottom > H) out.push(`face cut by frame (${Math.round(fc.left)},${Math.round(fc.top)})-(${Math.round(fc.right)},${Math.round(fc.bottom)})`);
    }
    // faces covered by a higher layer: hit-test a grid of points inside each face (shapes, not boxes)
    const layers = [...document.querySelectorAll('g[data-layer]')];
    for (const g of layers) if (/^(fx|snow|text|bars|dim|question|rays)/.test(g.dataset.layer)) g.style.pointerEvents = 'none';
    layers.forEach((g) => {
      const z = +g.dataset.z;
      for (const fe of g.querySelectorAll('[data-face]')) {
        const fc = r(fe);
        let hit = 0, n = 0;
        for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) {
          const x = fc.left + (fc.width * i) / 10, y = fc.top + (fc.height * j) / 10;
          if (x < 0 || y < 0 || x > W || y > H) continue;
          n++;
          const el = document.elementFromPoint(x, y);
          const lg = el && el.closest('g[data-layer]');
          if (lg && +lg.dataset.z > z) hit++;
        }
        if (n && hit / n > 0.08) out.push(`face in layer ${g.dataset.layer} covered (${Math.round((100 * hit) / n)}% of it) by a higher layer`);
      }
    });
    for (const t of document.querySelectorAll('[data-sub]')) {
      const q = r(t);
      if (q.left < 96 || q.right > W - 96) out.push(`subtitle outside the side safe area: ${t.textContent}`);
      if (q.bottom > H - 20) out.push(`subtitle too low: ${t.textContent}`);
      for (const fc of faces) {
        const ix = Math.min(q.right, fc.right) - Math.max(q.left, fc.left), iy = Math.min(q.bottom, fc.bottom) - Math.max(q.top, fc.top);
        if (ix > 0 && iy > 0) out.push(`subtitle over a face: ${t.textContent}`);
      }
    }
    return out;
  }, [W, H]);
  report.push({ id: fr.id, issues });
  await p.screenshot({ path: `${out}/${fr.id}.png` });
}
await b.close();
fs.writeFileSync(`${out}/qa.json`, JSON.stringify(report, null, 1));
for (const r of report) console.log(r.id, r.issues.length ? r.issues.join(' | ') : 'ok');
