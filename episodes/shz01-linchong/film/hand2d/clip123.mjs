// node clip123.mjs <out.mp4> [strip.png] — 3 s: fist -> loosening -> open, drawn on twos with anticipation and overshoot
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { spawn } from 'child_process';
const { hand } = await import('./poses.mjs?v=' + Date.now());
const [out, strip] = process.argv.slice(2);
const FPS = 30, N = 90;
const eo = (x) => 1 - Math.pow(1 - x, 3), clamp = (v) => Math.max(0, Math.min(1, v));
function tAt(t) {               // pose parameter: 0 fist, 1 loose, 2 open (slight overshoot past 2, then settle)
  if (t < 0.75) return 0;
  if (t < 1.55) return eo(clamp((t - 0.75) / 0.8));
  if (t < 2.35) return 1 + 1.08 * eo(clamp((t - 1.55) / 0.8));
  return 2.08 - 0.08 * clamp((t - 2.35) / 0.35);
}
function frame(f) {
  const d = Math.floor(f / 2) * 2, t = d / FPS;                 // on twos
  const tremble = t < 0.6 ? ((d / 2) % 2 ? 1.5 : -1.5) : 0;
  const squeeze = t >= 0.6 && t < 0.75 ? 0.975 : 1;              // anticipation: the grip tightens before it goes
  const size = 560 * squeeze;
  const tilt = t < 0.75 ? 0 : -6 * clamp((t - 0.75) / 1.2);       // the wrist eases back as the hand opens
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#6b4a30"/>` +
    `<rect x="0" y="0" width="1920" height="1080" fill="#FFF1D2" opacity="0.08"/>` +
    hand('fist>open', { t: tAt(t), x: 960 + tremble * 0.6, y: 900 + tremble, size, rot: tilt }) + '</svg>';
}
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const show = async (f) => { await p.setContent(`<html><body style="margin:0">${frame(f)}</body></html>`); };
if (out && out !== '-') {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) { await show(f); const buf = await p.screenshot({ type: 'jpeg', quality: 93 }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('exit', r)); console.log('wrote', out);
}
if (strip) {
  const fr = [0, 20, 24, 28, 32, 36, 40, 46, 52, 58, 64, 70, 76, 88];
  const shots = [];
  for (const f of fr) { await show(f); shots.push((await p.screenshot({ clip: { x: 610, y: 260, width: 700, height: 820 } })).toString('base64')); }
  const html = `<div style="display:grid;grid-template-columns:repeat(7,280px);gap:4px;background:#222;padding:4px">` + shots.map((s, i) => `<div style="position:relative"><img src="data:image/png;base64,${s}" width="280" height="328"><span style="position:absolute;left:4px;top:2px;color:#ff0;font:14px sans-serif;background:#000a">f${fr[i]} t=${(Math.floor(fr[i] / 2) * 2 / 30).toFixed(2)}</span></div>`).join('') + '</div>';
  const sp = await b.newPage({ viewport: { width: 7 * 284 + 4, height: 2 * 332 + 4 } }); await sp.setContent(html); await sp.waitForTimeout(300); await sp.screenshot({ path: strip });
  console.log('wrote', strip);
}
await b.close();
