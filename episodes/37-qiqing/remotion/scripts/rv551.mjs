// builder 1: render from an EXISTING bundle without rebundling: node scripts/rv551.mjs <bundleDir> <CID> <out.mp4> <fromSec> <toSec>
import path from 'node:path';
import {renderMedia, selectComposition} from '@remotion/renderer';
const [bdir, cid, out, a, b] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({serveUrl: bdir, id: cid, inputProps: {}, browserExecutable});
let last = 0;
await renderMedia({serveUrl: bdir, composition, codec: 'h264', crf: Number(process.env.CRF || 16), pixelFormat: 'yuv420p', muted: true, outputLocation: out, browserExecutable, concurrency: Number(process.env.CONC || 2),
	frameRange: [Math.round(Number(a) * 30), Math.round(Number(b) * 30) - 1], onProgress: ({progress}) => { if (progress - last > 0.25) { last = progress; console.log(`${cid} ${Math.round(progress * 100)}%`); } }});
console.log('done', out);
