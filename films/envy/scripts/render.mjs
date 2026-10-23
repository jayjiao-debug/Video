// COMP=Demo node scripts/render.mjs out/demo.mp4
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
const out = process.argv[2];
const browserExecutable = process.env.VE_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: process.env.COMP, browserExecutable, chromiumOptions: { gl: 'swangle' } });
let last = 0;
await renderMedia({ composition, serveUrl, codec: 'h264', crf: 18, outputLocation: out, browserExecutable, concurrency: 2, chromiumOptions: { gl: 'swangle' }, muted: true, timeoutInMilliseconds: 180000,
  onProgress: ({ progress }) => { if (progress - last > 0.2) { last = progress; console.log(Math.round(progress * 100) + '%'); } } });
console.log('done', out);
