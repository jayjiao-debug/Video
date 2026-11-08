// node clip.mjs <out.mp4> [stillsDir t1,t2,...]  — 5 s toon 3D hand test over the 休书 (S01 look)
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { spawn } from 'child_process';
import fs from 'fs';
const FILM = '/home/claude/video/episodes/shz01-linchong/film';
const { kf, E, ramp, clamp, f2, shake, lerp } = await import(FILM + '/lib.mjs');
const { xiushu } = await import(FILM + '/cast/xiushu.mjs');
const { palmSVG } = await import(FILM + '/cast/palm.mjs');
const [out, stillDir, stillTimes] = process.argv.slice(2);
const FPS = 30, N = 150;

// ---------------------------------------------------------------- hand animation
const FIST = { index: [88, 100, 60], middle: [90, 102, 62], ring: [92, 104, 62], pinky: [94, 104, 60] };
const OPEN = { index: [14, 22, 10], middle: [13, 21, 10], ring: [16, 25, 12], pinky: [19, 27, 13] }; // relaxed, not a V sign
const SPF = { index: 4, middle: 1, ring: -3, pinky: -7 }, SPO = { index: -2, middle: 0, ring: 2, pinky: 5 };
const TF = { opp: -95, abd: 5, flex1: 55, flex2: 55 }, TO = { opp: -58, abd: 2, flex1: 22, flex2: 26 };
const mixA = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const T_CONTACT = 3.6;
function handAt(t) {
  // finger opening: index+middle first, then ring+little, then the thumb (fingers move, never fade)
  const tr = t < 0.9 ? Math.sin(t * 2 * Math.PI * 8) * 1.5 * (1 - ramp(t, 0.7, 0.9)) : 0; // tremble while clenched
  const kIM = ramp(t, 0.9, 1.68, E.inOut), kRL = ramp(t, 0.92, 1.72, E.inOut), kT = ramp(t, 1.0, 1.85, E.inOut);
  const fingers = {
    index: mixA(FIST.index, OPEN.index, kIM), middle: mixA(FIST.middle, OPEN.middle, kIM),
    ring: mixA(FIST.ring, OPEN.ring, kRL), pinky: mixA(FIST.pinky, OPEN.pinky, kRL),
  };
  // a slight extra uncurl overshoot right after the grip goes (the hand "gives")
  const spread = Object.fromEntries(Object.keys(SPF).map((k) => [k, lerp(SPF[k], SPO[k], k === 'ring' || k === 'pinky' ? kRL : kIM)]));
  const thumb = Object.fromEntries(Object.keys(TF).map((k) => [k, lerp(TF[k], TO[k], kT)]));
  // fingers flatten for the press
  const kFlat = ramp(t, 3.2, 3.6, E.out);
  if (kFlat > 0) {
    for (const f of Object.keys(fingers)) fingers[f] = fingers[f].map((v) => v * (1 - 0.7 * kFlat));
    // pressing flat spreads the thumb and fingers a little, like the print
    thumb.opp = lerp(thumb.opp, -14, kFlat); thumb.abd = lerp(thumb.abd, -12, kFlat); thumb.flex1 *= 1 - 0.6 * kFlat; thumb.flex2 *= 1 - 0.6 * kFlat;
    for (const f of Object.keys(spread)) spread[f] = lerp(spread[f], { index: -5, middle: 0, ring: 4, pinky: 9 }[f], kFlat);
  }
  const ps = { fingers, spread, thumb };
  // placement: 3/4 fist (palm toward camera, turned to the thumb side) -> rolls to palm-down over the paper
  const kRoll = ramp(t, 2.05, 3.15, E.inOut);
  const ang = kf(t, [[0, 8], [0.9, 8], [1.95, 52, E.inOut], [3.15, 180, E.inOut]]) * Math.PI / 180;  // N rotates about the long (up) axis: 30° -> 180° (palm away)
  const Nv = [Math.sin(ang), 0, Math.cos(ang)];
  const A = [lerp(0.12, 0, kRoll), 1, lerp(0.25, 0.0, kRoll)];
  const x = kf(t, [[0, 1400], [2.0, 1390], [3.15, 1010, E.inOut], [T_CONTACT, 1000], [4.1, 1000], [4.9, 1540, E.inOut]]);
  const y = kf(t, [[0, 60], [2.0, 80], [3.15, 250, E.inOut], [T_CONTACT, 238], [4.1, 238], [4.9, 130, E.inOut]]);
  // depth: hovering hand is a little bigger (closer to the lens), lands at 1.0, lifts back toward the lens
  let s = 3300 * kf(t, [[0, 1.32], [2.1, 1.28], [3.15, 1.07, E.inOut], [3.45, 1.08], [T_CONTACT, 1.0, E.in], [4.1, 1.0], [4.6, 1.1, E.inOut], [5, 1.12]]);
  const squash = 0.14 * Math.max(0, 1 - Math.abs((t - T_CONTACT) * FPS) / 3) ;
  const [sx, sy] = shake(t, T_CONTACT, 2, 3, 3);
  return { ps, pl: { A, N: Nv, x: x + tr * 0.6 + sx, y: y + tr + -sy, s, squash, light: [-0.55, 0.75, 0.85], outline: 3.0 }, shakeXY: [sx, sy] };
}

// ---------------------------------------------------------------- background (SVG, y down)
const PAPER = { x: 690, y: 150, w: 680, h: 760, rot: -4 };
function table() {
  let s = `<defs><linearGradient id="wd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5536"/><stop offset="1" stop-color="#4e3421"/></linearGradient>` +
    `<radialGradient id="pool" cx="0.48" cy="0.42" r="0.6"><stop offset="0" stop-color="#FFF1D2" stop-opacity="0.35"/><stop offset="1" stop-color="#FFF1D2" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="hsh" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2a1a10" stop-opacity="0.55"/><stop offset="1" stop-color="#2a1a10" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#wd)"/>`;
  for (let i = 0; i < 9; i++) s += `<path d="M-20,${60 + i * 125} C600,${50 + i * 125} 1300,${78 + i * 125} 1960,${62 + i * 125}" stroke="#3b2717" stroke-width="3" opacity="0.5" fill="none"/>`;
  s += `<rect width="1920" height="1080" fill="url(#pool)"/>`;
  // inkstone and paste dish (right, like S01)
  s += `<rect x="1500" y="140" width="230" height="150" rx="34" fill="#2b2a2c"/><rect x="1530" y="168" width="170" height="70" rx="22" fill="#121112"/>`;
  s += `<ellipse cx="1610" cy="430" rx="92" ry="80" fill="#e6dccb" stroke="#2A1C17" stroke-width="3"/><ellipse cx="1610" cy="426" rx="70" ry="60" fill="#b3302a"/><ellipse cx="1590" cy="410" rx="22" ry="12" fill="#fff" opacity="0.3"/>`;
  return s;
}
let PRINT = null; // {cx, cy, h, rot} filled from the contact frame
function bg(t, H) {
  const [sx, sy] = H.shakeXY;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">${table()}`;
  s += `<g transform="translate(${f2(sx)} ${f2(sy)}) translate(${PAPER.x} ${PAPER.y}) rotate(${PAPER.rot} ${PAPER.w / 2} ${PAPER.h / 2})">${xiushu({ w: PAPER.w, h: PAPER.h, id: 'xsT', sign: 1, print: 0 })}</g>`;
  if (PRINT && t >= 4.08) {
    const k = PRINT.h / 760, soak = ramp(t, 4.2, 4.7);
    s += `<g transform="translate(${f2(PRINT.cx + sx)} ${f2(PRINT.cy + sy)}) rotate(${f2(PRINT.rot)}) scale(${f2(k * 2)}) translate(-150 -220)" opacity="${f2(0.95)}">${palmSVG({ soak })}</g>`;
    // wet sheen just after the lift
    const wet = 1 - ramp(t, 4.1, 4.9);
    if (wet > 0) s += `<ellipse cx="${f2(PRINT.cx + 20)}" cy="${f2(PRINT.cy - 10)}" rx="${f2(PRINT.h * 0.16)}" ry="${f2(PRINT.h * 0.22)}" fill="#fff" opacity="${f2(0.14 * wet)}" transform="rotate(-20 ${f2(PRINT.cx)} ${f2(PRINT.cy)})"/>`;
  }
  // the hand's soft shadow on the table/paper (light from the top left -> shadow down-right), sharper near contact
  if (H.palm) {
    const hgt = clamp((H.pl.s / 3300 - 1) / 0.3);  // 0 at contact, 1 when lifted
    const ox = 30 + 70 * hgt, oy = 26 + 60 * hgt;
    s += `<ellipse cx="${f2(H.palm[0] + ox)}" cy="${f2(H.palm[1] + oy)}" rx="${f2(170 + 50 * hgt)}" ry="${f2(230 + 50 * hgt)}" fill="url(#hsh)" opacity="${f2(0.75 - 0.4 * hgt)}"/>`;
  }
  return s.replace(/file:\/\/\/dev\/shm\/shz01\/film\/assets\//g, './assets/') + '</svg>';
}

// ---------------------------------------------------------------- render
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.log('err', e.message));
await p.goto('http://127.0.0.1:8765/hand.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 30000 });
// contact frame -> print placement
{
  const H = handAt(T_CONTACT + 0.0001);
  await p.evaluate(([ps, pl]) => { window.pose(ps); window.place(pl); }, [H.ps, H.pl]);
  const w = await p.evaluate(() => window.screenOf('wrist')), m = await p.evaluate(() => window.screenOf('middle-finger-phalanx-proximal')), tip = await p.evaluate(() => window.screenOf('middle-finger-tip'));
  const h = Math.hypot(tip[0] - w[0], tip[1] - w[1]);
  PRINT = { cx: lerp(w[0], m[0], 0.82) + 26, cy: lerp(w[1], m[1], 0.82), h: h * 0.88, rot: Math.atan2(tip[0] - w[0], -(tip[1] - w[1])) * 180 / Math.PI };
  console.log('print', PRINT);
}
async function render(t) {
  const H = handAt(t);
  await p.evaluate(([ps, pl]) => { window.pose(ps); window.place(pl); }, [H.ps, H.pl]);
  if (t > 2.4) {
    const w = await p.evaluate(() => window.screenOf('wrist')), m = await p.evaluate(() => window.screenOf('middle-finger-phalanx-proximal'));
    H.palm = [(w[0] + m[0]) / 2, (w[1] + m[1]) / 2];
  }
  await p.evaluate(([svg, ps, pl]) => window.frame(svg, ps, pl), [bg(t, H), H.ps, H.pl]);
}
if (stillDir) {
  fs.mkdirSync(stillDir, { recursive: true });
  for (const ts of stillTimes.split(',')) { await render(+ts); await p.screenshot({ path: `${stillDir}/hand_${(+ts).toFixed(2)}.png` }); console.log('still', ts); }
}
if (out && out !== '-') {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await render(f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise((r) => ff.on('exit', r));
  console.log(`done ${out} in ${((Date.now() - t0) / 1000).toFixed(1)} s (${((Date.now() - t0) / N / 1000).toFixed(3)} s/frame)`);
}
await b.close();
