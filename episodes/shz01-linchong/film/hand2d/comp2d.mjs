// Compose the 2D hand drawings (svg/d_XXX.svg, held on twos) over the S01 table + 休书 -> mp4 + stills
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { spawn } from 'child_process';
import fs from 'fs';
import * as A from './anim2d.mjs';
const FILM = '/home/claude/video/episodes/shz01-linchong/film';
const { f2, ramp } = await import(FILM + '/lib.mjs');
const { xiushu } = await import(FILM + '/cast/xiushu.mjs');
const [out, stillDir, stillTimes] = process.argv.slice(2);
const meta = JSON.parse(fs.readFileSync('ids/meta.json', 'utf8'));
const drawings = meta.drawings.map((d) => fs.readFileSync(`svg/d_${String(d.i).padStart(3, '0')}.svg`, 'utf8'));
const PRINT = fs.existsSync('svg/print.svg') ? fs.readFileSync('svg/print.svg', 'utf8') : '';
const contact = meta.drawings[Math.round(A.T_CONTACT * 15)];
const palmC = (() => { const w = contact.pts.wrist, m = contact.pts['middle-finger-phalanx-proximal']; return [w[0] + (m[0] - w[0]) * 0.62, w[1] + (m[1] - w[1]) * 0.62]; })();
const PAPER = { x: 690, y: 150, w: 680, h: 760, rot: -4 };
function table() {
  let s = `<defs><linearGradient id="wd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5536"/><stop offset="1" stop-color="#4e3421"/></linearGradient>` +
    `<radialGradient id="pool" cx="0.48" cy="0.42" r="0.6"><stop offset="0" stop-color="#FFF1D2" stop-opacity="0.35"/><stop offset="1" stop-color="#FFF1D2" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#wd)"/>`;
  for (let i = 0; i < 9; i++) s += `<path d="M-20,${60 + i * 125} C600,${50 + i * 125} 1300,${78 + i * 125} 1960,${62 + i * 125}" stroke="#3b2717" stroke-width="3" opacity="0.5" fill="none"/>`;
  s += `<rect width="1920" height="1080" fill="url(#pool)"/>`;
  s += `<rect x="1500" y="140" width="230" height="150" rx="34" fill="#2b2a2c"/><rect x="1530" y="168" width="170" height="70" rx="22" fill="#121112"/>`;
  s += `<ellipse cx="1610" cy="430" rx="92" ry="80" fill="#e6dccb" stroke="#2A1C17" stroke-width="3"/><ellipse cx="1610" cy="426" rx="70" ry="60" fill="#b3302a"/><ellipse cx="1590" cy="410" rx="22" ry="12" fill="#fff" opacity="0.3"/>`;
  return s;
}
const TABLE = table();
function frameSVG(f) {
  const t = f / A.FPS, di = Math.min(drawings.length - 1, Math.floor(f / 2));
  const fx = A.drawFx(t, f);
  const shk = t >= A.T_CONTACT && t < A.T_CONTACT + 2 / A.FPS ? fx.dx : 0;   // paper shakes with the press only
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">${TABLE}`;
  s += `<g transform="translate(${f2(shk)} ${f2(shk * 0.5)}) translate(${PAPER.x} ${PAPER.y}) rotate(${PAPER.rot} ${PAPER.w / 2} ${PAPER.h / 2})">${xiushu({ w: PAPER.w, h: PAPER.h, id: 'xsT', sign: 1, print: 0 })}</g>`;
  if (PRINT && t >= 4.08) s += `<g transform="translate(${f2(shk)} ${f2(shk * 0.5)})">${PRINT}</g>`;
  // the hand's contact shadow on the paper near the press (graphic, hard-edged)
  const near = 1 - Math.min(1, Math.abs(t - A.T_CONTACT) / 0.5);
  if (near > 0 && t > 3.2 && t < 4.4) s += `<ellipse cx="${f2(palmC[0] + 34)}" cy="${f2(palmC[1] + 30)}" rx="${f2(120 + 40 * (1 - near))}" ry="${f2(160 + 40 * (1 - near))}" fill="#3a2414" opacity="${f2(0.22 * near)}"/>`;
  // the drawing, with squash about the palm and the shake / tremble on the drawing only
  const sq = fx.squash;
  const tf = `translate(${f2(fx.dx)} ${f2(fx.dy)})` + (sq ? ` translate(${f2(palmC[0])} ${f2(palmC[1])}) scale(${f2(1 + sq * 0.5)} ${f2(1 - sq)}) translate(${f2(-palmC[0])} ${f2(-palmC[1])})` : '');
  s += `<g transform="${tf}">${drawings[di]}</g>`;
  return s.replace(/file:\/\/\/dev\/shm\/shz01\/film\/assets\//g, './assets/') + '</svg>';
}
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('http://127.0.0.1:8765/blank2d.html');
async function show(f) {
  await p.evaluate(async (s) => { document.body.innerHTML = s; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, frameSVG(f));
}
if (stillDir) {
  fs.mkdirSync(stillDir, { recursive: true });
  for (const ts of stillTimes.split(',')) { await show(Math.round(+ts * A.FPS)); await p.screenshot({ path: `${stillDir}/hand2d_${(+ts).toFixed(2)}.png` }); console.log('still', ts); }
}
if (out && out !== '-') {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(A.FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < A.N; f++) {
    await show(f);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise((r) => ff.on('exit', r));
  console.log(`done ${out} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
await b.close();
