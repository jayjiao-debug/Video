import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
const browserExecutable = process.env.VE_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: process.env.COMP, browserExecutable });
await renderMedia({ composition, serveUrl, codec: 'h264', crf: 22, scale: Number(process.env.SCALE || 0.5), outputLocation: process.argv[2], browserExecutable, concurrency: 2, muted: true, timeoutInMilliseconds: 180000 });
console.log('done');
