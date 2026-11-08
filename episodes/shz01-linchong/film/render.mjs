// Renderer (Playwright Chromium, local).
//   node render.mjs stills <outdir> <t1,t2,...> [--check] [--clean]   times in seconds -> outdir/t_XXX.XX.jpg (+ checks)
//   node render.mjs sheet <out.jpg> <t0> <t1> <step>                     contact sheet (5 columns, 384 px thumbs)
//   node render.mjs video <out.mp4> <f0> <f1>                            frames [f0, f1) -> x264 crf 14 (no audio)
// Static heavy layers registered with lib.bake() are rendered once to PNG in /dev/shm/shz01/film/bake.
import { createRequire } from 'module';
import fs from 'fs';
import { spawn } from 'child_process';
import { BAKES, BAKE_DIR, ASSET, FPS, W, H } from './lib.mjs';
import { loadTakes, frameSVG } from './film.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [mode, out, a3, a4, a5] = process.argv.slice(2);
const flags = process.argv.slice(2).filter((x) => x.startsWith('--'));
fs.mkdirSync(BAKE_DIR, { recursive: true });
fs.mkdirSync(ASSET, { recursive: true });
if (!fs.existsSync(`${ASSET}/fibre.png`)) {
  await new Promise((res) => spawn('python3', [new URL('./tools/make_assets.py', import.meta.url).pathname, ASSET], { stdio: 'inherit' }).on('exit', res));
}

const WENKAI = '/home/claude/video/episodes/36-shanghuo/remotion/public/fonts/wenkai/wenkai-bold.css';
const PAGE = `${BAKE_DIR}/../page.html`;
fs.writeFileSync(PAGE, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${WENKAI}">
<style>html,body{margin:0;padding:0;background:#000;overflow:hidden}#root{width:${W}px;height:${H}px}
@font-face{font-family:'Ma Shan Zheng';src:url('file:///root/.local/share/fonts/MaShanZheng-Regular.ttf')}
@font-face{font-family:'Zhi Mang Xing';src:url('file:///root/.local/share/fonts/ZhiMangXing-Regular.ttf')}</style></head>
<body><div id="root"></div><div style="position:absolute;left:-9999px;font-family:'LXGW WenKai';font-weight:700">沧州草料场那年冬天大雪</div>
<div style="position:absolute;left:-9999px;font-family:'Ma Shan Zheng'">林冲休书依旧夫妻完聚已故半载白虎节堂豹子头</div></body></html>`);

const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto('file://' + PAGE);
await page.evaluate(() => document.fonts.ready);
const bpage = await browser.newPage({ viewport: { width: 512, height: 512 } });
await bpage.goto('file://' + PAGE);

async function flushBakes() {
  for (const [file, b] of BAKES) {
    if (!fs.existsSync(file)) {
      await bpage.setViewportSize({ width: Math.ceil(b.w), height: Math.ceil(b.h) });
      await bpage.evaluate(([s, w, h]) => {
        document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent';
        const r = document.getElementById('root');
        r.style.width = w + 'px'; r.style.height = h + 'px';
        r.innerHTML = s;
      }, [b.svg, Math.ceil(b.w), Math.ceil(b.h)]);
      await bpage.evaluate(() => document.fonts.ready);
      await bpage.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: Math.ceil(b.w), height: Math.ceil(b.h) } });
    }
    BAKES.delete(file);
  }
}

async function show(svg) {
  await page.evaluate(async (s) => {
    const r = document.getElementById('root');
    r.innerHTML = s;
    const imgs = [...r.querySelectorAll('image')].map((im) => im.getAttribute('href'));
    window.__imgs = window.__imgs || {};
    await Promise.all(imgs.filter((u) => !window.__imgs[u]).map((u) => new Promise((res) => {
      const im = new Image(); im.onload = im.onerror = () => { window.__imgs[u] = im; res(); }; im.src = u;
    })));
    await document.fonts.ready;
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }, svg);
}

async function check(t) {
  return page.evaluate(([W, H]) => {
    const out = [];
    const r = (el) => el.getBoundingClientRect();
    for (const fe of document.querySelectorAll('[data-face]')) {
      const q = r(fe);
      if (q.width < 4) continue;
      const vis = q.right > 0 && q.left < W && q.bottom > 0 && q.top < H;
      if (vis && (q.left < -2 || q.right > W + 2 || q.top < -2 || q.bottom > H + 2)) {
        if (!fe.closest('[data-allowcut]')) out.push(`face cut by frame (${Math.round(q.left)},${Math.round(q.top)})-(${Math.round(q.right)},${Math.round(q.bottom)})`);
      }
      const sub = document.querySelector('[data-sub]');
      if (sub && vis) {
        const s = r(sub.querySelector('text') || sub);
        if (!(s.right < q.left || s.left > q.right || s.bottom < q.top || s.top > q.bottom)) out.push('subtitle over a face');
      }
    }
    for (const c of document.querySelectorAll('[data-container]')) {
      const bx = c.querySelector('[data-box]');
      if (!bx) continue;
      const box = r(bx);
      for (const tx of c.querySelectorAll('[data-inbox]')) {
        const q = r(tx);
        if (q.left < box.left - 2 || q.right > box.right + 2 || q.top < box.top - 2 || q.bottom > box.bottom + 2) out.push(`text spills out of its paper: ${tx.textContent.slice(0, 6)}`);
      }
    }
    for (const g of document.querySelectorAll('g[data-layer]')) {
      const bl = g.dataset.bleed || '';
      if (bl === 'all' || /^(text|brand|snow|motes|embers)/.test(g.dataset.layer)) continue;
      const q = r(g);
      if (q.width === 0) continue;
      const cut = [];
      if (q.left > 2 && q.left < W - 2 && !bl.includes('L')) {} // inside: fine
      // a layer that should cover the frame but leaves a gap at an edge (set data-cover="1")
      if (g.dataset.cover && (q.left > 1 || q.top > 1 || q.right < W - 1 || q.bottom < H - 1)) cut.push(`does not cover the frame (${Math.round(q.left)},${Math.round(q.top)},${Math.round(q.right)},${Math.round(q.bottom)})`);
      if (cut.length) out.push(`layer ${g.dataset.layer}: ${cut.join(', ')}`);
    }
    return out;
  }, [W, H]);
}

const takes = await loadTakes();

if (mode === 'stills' || mode === 'sheet') {
  let times;
  const SHEETDIR = `${out}.thumbs`;
  if (mode === 'sheet') fs.mkdirSync(SHEETDIR, { recursive: true });
  if (mode === 'stills') { fs.mkdirSync(out, { recursive: true }); times = a3.split(',').map(Number); }
  else { times = []; for (let t = +a3; t < +a4 - 1e-6; t += +a5) times.push(+t.toFixed(3)); }
  const shots = [];
  for (const t of times) {
    const svg = frameSVG(takes, t, { clean: flags.includes('--clean') });
    await flushBakes();
    await show(svg);
    const file = mode === 'stills' ? `${out}/t_${t.toFixed(2).padStart(6, '0')}.jpg` : `${SHEETDIR}/s_${shots.length}.jpg`;
    await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
    shots.push([t, file]);
    if (flags.includes('--check') || mode === 'stills') {
      const iss = await check(t);
      if (iss.length) console.log(`t=${t.toFixed(2)}: ${iss.join(' | ')}`);
    }
  }
  if (mode === 'sheet') {
    const cols = 5, tw = 384, th = 216, rowsN = Math.ceil(shots.length / cols);
    const html = `<div style="display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:4px;background:#111;padding:4px;font:14px sans-serif;color:#ddd">` +
      shots.map(([t, f]) => `<div style="position:relative"><img src="file://${f}" width="${tw}" height="${th}"><span style="position:absolute;left:4px;top:2px;background:#000a;padding:0 4px">${t.toFixed(2)}</span></div>`).join('') + '</div>';
    const sp = await browser.newPage({ viewport: { width: cols * (tw + 4) + 4, height: rowsN * (th + 4) + 4 } });
    fs.writeFileSync(`${SHEETDIR}/sheet.html`, `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#111}</style></head><body>${html}</body></html>`);
    await sp.goto('file://' + `${SHEETDIR}/sheet.html`);
    await sp.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))));
    await sp.screenshot({ path: out, type: 'jpeg', quality: 85, fullPage: true });
  }
} else if (mode === 'video') {
  const f0 = +a3, f1 = +a4;
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const t = f / FPS;
    const svg = frameSVG(takes, t);
    await flushBakes();
    await show(svg);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((res) => ff.stdin.once('drain', res));
    if ((f - f0) % 150 === 0) console.log(`frame ${f} (${((Date.now() - t0) / 1000 / Math.max(1, f - f0)).toFixed(3)} s/frame)`);
  }
  ff.stdin.end();
  await new Promise((res) => ff.on('exit', res));
  console.log(`done ${out}: ${f1 - f0} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
await browser.close();
