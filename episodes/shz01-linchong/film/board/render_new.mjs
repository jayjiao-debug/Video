// Render the new v4 keyframes (film/board/v4new.mjs KEYS) to /dev/shm/shz01/board/new/<KEY>.jpg
//   node film/board/render_new.mjs [K16,K26,...]
import { createRequire } from 'module';
import fs from 'fs';
import { spawn } from 'child_process';
import { BAKES, BAKE_DIR, ASSET, W, H, blurDefs } from '../lib.mjs';
import { KEYS } from './v4new.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = '/dev/shm/shz01/board/new';
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(BAKE_DIR, { recursive: true }); fs.mkdirSync(ASSET, { recursive: true });
if (!fs.existsSync(`${ASSET}/fibre.png`)) await new Promise((r) => spawn('python3', [new URL('../tools/make_assets.py', import.meta.url).pathname, ASSET], { stdio: 'inherit' }).on('exit', r));
const WENKAI = '/home/claude/video/episodes/36-shanghuo/remotion/public/fonts/wenkai/wenkai-bold.css';
const PAGE = `${BAKE_DIR}/../page_board.html`;
fs.writeFileSync(PAGE, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${WENKAI}">
<style>html,body{margin:0;padding:0;background:#000;overflow:hidden}#root{width:${W}px;height:${H}px}
@font-face{font-family:'Ma Shan Zheng';src:url('file:///root/.local/share/fonts/MaShanZheng-Regular.ttf')}</style></head><body><div id="root"></div></body></html>`);
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto('file://' + PAGE);
const bpage = await browser.newPage({ viewport: { width: 512, height: 512 } });
await bpage.goto('file://' + PAGE);
async function flush() {
  for (const [file, b] of BAKES) {
    if (!fs.existsSync(file)) {
      await bpage.setViewportSize({ width: Math.ceil(b.w), height: Math.ceil(b.h) });
      await bpage.evaluate(([s, w, h]) => { document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent'; const r = document.getElementById('root'); r.style.width = w + 'px'; r.style.height = h + 'px'; r.innerHTML = s; }, [b.svg, Math.ceil(b.w), Math.ceil(b.h)]);
      await bpage.evaluate(() => document.fonts.ready);
      await bpage.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: Math.ceil(b.w), height: Math.ceil(b.h) } });
    }
    BAKES.delete(file);
  }
}
const only = process.argv[2] ? process.argv[2].split(',') : Object.keys(KEYS);
for (const k of only) {
  const body = KEYS[k]();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${blurDefs()}</defs><rect width="1920" height="1080" fill="#000"/>${body}</svg>`;
  await flush();
  await page.evaluate(async (s) => {
    const r = document.getElementById('root'); r.innerHTML = s;
    await Promise.all([...r.querySelectorAll('image')].map((im) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = im.getAttribute('href'); })));
    await document.fonts.ready; await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }, svg);
  await page.screenshot({ path: `${OUT}/${k}.jpg`, type: 'jpeg', quality: 92 });
  console.log('ok', k);
}
await browser.close();
