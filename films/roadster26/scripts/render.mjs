// Render a composition to MP4 locally with the preinstalled Chromium (no browser download).
//   COMP=Test2D node scripts/render.mjs out/x.mp4
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
const [out] = process.argv.slice(2);
const browserExecutable = process.env.VE_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: process.env.COMP, browserExecutable, chromiumOptions: { gl: 'swangle' } });
await renderMedia({ composition, serveUrl, codec: 'h264', outputLocation: out, browserExecutable, chromiumOptions: { gl: 'swangle' }, crf: 16, muted: true, frameRange: process.env.FR ? process.env.FR.split(',').map(Number) : undefined,
  concurrency: 2, timeoutInMilliseconds: 180000, onProgress: ({ progress }) => { if (Math.round(progress * 100) % 10 === 0) process.stdout.write(`\r${Math.round(progress * 100)}%`); } });
console.log('\nsaved', out);
