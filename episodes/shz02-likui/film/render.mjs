// shz02 renderer (Playwright Chromium).
//   node render.mjs stills <comp.mjs> <outdir> <t1,t2,...>          -> outdir/t_XXX.XX.jpg
//   node render.mjs video  <comp.mjs> <out.mp4> <f0> <f1>           -> frames [f0, f1) x264 crf 14, no audio
// comp module: export function frameSVG(t) -> full <svg> string; export const DUR. Static layers via ink.bake().
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { BAKES, CACHE, FPS, W, H } from './ink.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [mode, compPath, out, a4, a5] = process.argv.slice(2);
const comp = await import(path.resolve(compPath));
fs.mkdirSync(CACHE, { recursive: true });
const WENKAI = '/home/claude/video/episodes/36-shanghuo/remotion/public/fonts/wenkai/wenkai-bold.css';
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${WENKAI}">
<style>html,body{margin:0;padding:0;background:#000;overflow:hidden}#root{width:${W}px;height:${H}px}
@font-face{font-family:'Ma Shan Zheng';src:url('file:///root/.local/share/fonts/MaShanZheng-Regular.ttf')}
@font-face{font-family:'Zhi Mang Xing';src:url('file:///root/.local/share/fonts/ZhiMangXing-Regular.ttf')}</style></head>
<body><div id="root"></div><div style="position:absolute;left:-9999px;font-family:'LXGW WenKai';font-weight:700">水浒人物志李逵</div>
<div style="position:absolute;left:-9999px;font-family:'Ma Shan Zheng'">水浒人物志李逵武松</div></body></html>`;
const PAGE = `${CACHE}/page.html`; fs.writeFileSync(PAGE, html);
const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto('file://' + PAGE); await page.evaluate(() => document.fonts.ready);
const bpage = await browser.newPage({ viewport: { width: 512, height: 512 } });
await bpage.goto('file://' + PAGE);
const waitImgs = (pg) => pg.evaluate(async () => {
  const urls = [...new Set([...document.querySelectorAll('#root image')].map((im) => im.getAttribute('href')))].filter(Boolean);
  await Promise.all(urls.map((u) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = res; im.src = u; })));
  await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
});
async function flushBakes() {
  for (const [file, b] of BAKES) {
    await bpage.setViewportSize({ width: Math.ceil(b.w), height: Math.ceil(b.h) });
    await bpage.evaluate(([s, w, h]) => { document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent'; const r = document.getElementById('root'); r.style.width = w + 'px'; r.style.height = h + 'px'; r.innerHTML = s; }, [b.svg, Math.ceil(b.w), Math.ceil(b.h)]);
    await waitImgs(bpage);
    await bpage.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: Math.ceil(b.w), height: Math.ceil(b.h) } });
    BAKES.delete(file);
  }
}
const seen = new Set();
async function shot(t, opts) {
  let svg = comp.frameSVG(t);
  if (BAKES.size) { await flushBakes(); svg = comp.frameSVG(t); }
  const imgs = [...svg.matchAll(/href="(file:[^"]+)"/g)].map((m) => m[1]).filter((u) => !seen.has(u));
  await page.evaluate((s) => { document.getElementById('root').innerHTML = s; }, svg);
  if (imgs.length) { await waitImgs(page); imgs.forEach((u) => seen.add(u)); }
  return page.screenshot(opts);
}
if (mode === 'stills') {
  fs.mkdirSync(out, { recursive: true });
  for (const t of a4.split(',').map(Number)) { const t0 = Date.now(); await shot(t, { path: `${out}/t_${t.toFixed(2).padStart(6, '0')}.jpg`, type: 'jpeg', quality: 93 }); console.log('ok', t, Date.now() - t0, 'ms'); }
} else if (mode === 'video') {
  const f0 = +a4, f1 = +a5;
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const buf = await shot(f / FPS, { type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - f0) % 60 === 0) console.log('frame', f, ((Date.now() - t0) / (f - f0 + 1)).toFixed(0), 'ms/frame');
  }
  ff.stdin.end(); await new Promise((r) => ff.on('exit', r)); console.log('done', out);
}
await browser.close();
