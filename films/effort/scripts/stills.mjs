// Render QA stills from any composition at given times (seconds).
//   COMP=Ep5 SCALE=0.5 node stills.mjs <outdir> 12.5 30 61.2
// Run from the Remotion project root. Uses SwiftShader WebGL so three.js scenes render headless.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [dir, ...rest] = process.argv.slice(2);
const times = rest.map(Number);
fs.mkdirSync(dir, { recursive: true });
const browserExecutable = process.env.VE_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: process.env.COMP, browserExecutable, chromiumOptions: { gl: 'swangle' } });
for (const t of times) {
  const frame = Math.round(t * composition.fps);
  await renderStill({ composition, serveUrl, frame, output: `${dir}/t${t.toFixed(2).padStart(6, '0')}.png`, browserExecutable,
    scale: Number(process.env.SCALE || 0.5), chromiumOptions: { gl: 'swangle' }, timeoutInMilliseconds: 180000,
    onBrowserLog: (l) => { if (process.env.LOGS && (l.type === 'error' || l.type === 'warning')) console.log('[browser]', l.type, l.text.slice(0, 300)); } });
  console.log('ok', t);
}
