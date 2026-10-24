// node tools/silksheet.mjs                       -> film/tools/silksheet.png (contact sheet of every silk.ts output)
// node tools/silksheet.mjs crop <section> <mode> <x> <y> <w> <h> <out.png> [patch] [scale]
//                                                -> a full-resolution crop (4096x1536 design px) for close inspection
// Bundles src/silk.ts with esbuild, paints in headless Chromium, prints timings (ms at 4096x1536).
import { build } from 'esbuild';
import { chromium } from 'playwright-core';
import fs from 'fs'; import path from 'path'; import os from 'os';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const FILM = path.resolve(HERE, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'silksheet-'));
const bundle = path.join(tmp, 'silk.js');
await build({ entryPoints: [path.join(FILM, 'src/silk.ts')], bundle: true, format: 'iife', globalName: 'SILK', outfile: bundle, target: 'es2020', logLevel: 'warning' });
const js = fs.readFileSync(bundle, 'utf8');

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
page.on('pageerror', e => console.log('PAGEERR', e.message));
page.on('console', m => console.log('LOG', m.text().slice(0, 400)));
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#222"><script>${js}</script></body></html>`);
await page.evaluate(async () => { await document.fonts.load('100px "Noto Serif CJK SC"'); await document.fonts.load('900 100px "Noto Serif CJK SC"'); });

const save = async (dataUrl, out) => { fs.writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64')); console.log('wrote', out, (fs.statSync(out).size / 1e6).toFixed(2), 'MB'); };

if (process.argv[2] === 'crop') {
  const [, , , name, mode, x, y, w, h, out, patch, scale] = process.argv;
  const url = await page.evaluate(({ name, mode, x, y, w, h, patch, scale }) => {
    const t0 = performance.now();
    let c = name === 'relief' || name === 'sprites' ? null : SILK.paintSection(name, { mode, patch: patch || undefined });
    if (name === 'sprites') { c = SILK.paintSection('river', { mode, sprites: false }); const sp = SILK.paintRiverSprites({ mode }); const g = c.getContext('2d'); const ks = (patch || '0.2,1,0.55').split(',').map(Number); sp.cart(g, ks[2]); sp.railing(g, ks[1]); sp.mast(g, ks[0]); }
    if (name === 'relief') { const ls = SILK.paintRelief('river', { mode }); c = document.createElement('canvas'); c.width = 4096; c.height = 1536; const g = c.getContext('2d'); ls.forEach(l => g.drawImage(l, 0, 0)); }
    console.log('paint ms', Math.round(performance.now() - t0));
    const s = +scale || 1; const o = document.createElement('canvas'); o.width = +w * s; o.height = +h * s;
    o.getContext('2d').drawImage(c, +x, +y, +w, +h, 0, 0, +w * s, +h * s); return o.toDataURL('image/png');
  }, { name, mode, x, y, w, h, patch, scale });
  await save(url, out);
} else {
  const res = await page.evaluate(() => {
    const T = {}; const tiles = [];
    const time = (k, f) => { const t0 = performance.now(); const v = f(); T[k] = Math.round(performance.now() - t0); return v; };
    for (const n of ['river', 'gate', 'shed', 'end', 'colophon']) tiles.push([n + ' · mono', time(n, () => SILK.paintSection(n, { mode: 'mono' }))]);
    tiles.splice(1, 0, ['river · colour', time('river colour', () => SILK.paintSection('river', { mode: 'colour' }))], ['river · grey', time('river grey', () => SILK.paintSection('river', { mode: 'grey' }))]);
    for (const p of ['ears', 'donkey', 'peeled']) tiles.push(['shed · ' + p, time('shed ' + p, () => SILK.paintSection('shed', { mode: 'mono', patch: p }))]);
    const small = time('river 2048x768', () => SILK.paintSection('river', { mode: 'mono', width: 2048, height: 768 }));
    tiles.push(['river · mono · 2048x768', small]);
    const base = time('river sprites:false', () => SILK.paintSection('river', { mode: 'mono', sprites: false }));
    tiles.push(['river · mono · sprites:false (base)', base]);
    const sp = time('paintRiverSprites setup', () => SILK.paintRiverSprites({ mode: 'mono' }));
    const comp = document.createElement('canvas'); comp.width = 4096; comp.height = 1536; const cg = comp.getContext('2d'); cg.drawImage(base, 0, 0);
    const per = (k, f) => { const t0 = performance.now(); for (let i = 0; i < 10; i++) f(i / 9); T[k] = +((performance.now() - t0) / 10).toFixed(1); };
    const scratch = document.createElement('canvas'); scratch.width = 4096; scratch.height = 1536; const sg2 = scratch.getContext('2d');
    per('sprite mast (ms/frame)', k => sp.mast(sg2, k)); per('sprite railing (ms/frame)', k => sp.railing(sg2, k)); per('sprite cart (ms/frame)', k => sp.cart(sg2, k));
    sp.cart(cg, 0.62); sp.railing(cg, 1); sp.mast(cg, 0.15);
    const R = sp.rects; cg.lineWidth = 4; cg.strokeStyle = 'rgba(200,0,0,0.6)'; for (const r of [R.mast, R.railing, R.cart]) cg.strokeRect(r.x, r.y, r.w, r.h);
    tiles.push(['base + sprites (mast k=.15 · railing k=1 · cart k=.62), sprite rects in red', comp]);
    const layers = time('relief colour (5 layers, ghost + shadow)', () => SILK.paintRelief('river', { mode: 'colour', shadow: true }));
    // relief composited with a small parallax offset per layer so the lift shows
    const rc = document.createElement('canvas'); rc.width = 4096; rc.height = 1536; const rg = rc.getContext('2d');
    layers.forEach((l, i) => { rg.save(); const s = 1 + i * 0.012; rg.translate(2048, 900); rg.scale(s, s); rg.translate(-2048 - i * 14, -900 + i * 10); rg.drawImage(l, 0, 0); rg.restore(); });
    tiles.push(['relief · colour · 5 layers composited (parallax offset)', rc]);
    const strip = document.createElement('canvas'); strip.width = 4096; strip.height = 1536; const sg = strip.getContext('2d');
    for (let i = 0; i < 5; i++) { const x = i * 819, y = 400; for (let a = 0; a < 819; a += 24) for (let b = 0; b < 307; b += 24) { sg.fillStyle = ((a + b) / 24) % 2 ? '#777' : '#555'; sg.fillRect(x + a, y + b, 24, 24); } sg.drawImage(layers[i], x, y, 819, 307); sg.fillStyle = '#fff'; sg.font = '60px sans-serif'; sg.fillText('L' + i, x + 20, y - 20); }
    // seals
    const seals = [SILK.paintSeal('', { seed: 1, style: 'zhu' }), SILK.paintSeal('', { seed: 2, style: 'bai' }), SILK.paintSeal('毕沅秘藏', { style: 'bai' }), SILK.paintSeal('毕泷审定', { style: 'zhu' }), SILK.paintSeal('', { seed: 9, style: 'bai', fade: 0.6 }), SILK.paintSeal('嘉庆御览之宝', { style: 'zhu', seed: 4 })];
    seals.forEach((s, i) => sg.drawImage(s, 60 + i * 330, 860, 280, 280 * s.height / s.width));
    tiles.push(['relief layers L0..L4 on checker · seals', strip]);
    const TW = 1200, TH = 450, pad = 16, cols = 2, rows = Math.ceil(tiles.length / cols);
    const sh = document.createElement('canvas'); sh.width = cols * (TW + pad) + pad; sh.height = rows * (TH + 44 + pad) + pad; const g = sh.getContext('2d');
    g.fillStyle = '#1b1b1b'; g.fillRect(0, 0, sh.width, sh.height);
    tiles.forEach(([label, c], i) => {
      const x = pad + (i % cols) * (TW + pad), y = pad + Math.floor(i / cols) * (TH + 44 + pad);
      g.fillStyle = '#ddd'; g.font = '26px sans-serif'; g.fillText(label, x, y + 28);
      g.imageSmoothingQuality = 'high'; g.drawImage(c, x, y + 40, TW, TH);
    });
    return { url: sh.toDataURL('image/png'), T };
  });
  console.log('TIMINGS_MS', JSON.stringify(res.T));
  await save(res.url, path.join(HERE, 'silksheet.png'));
}
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
