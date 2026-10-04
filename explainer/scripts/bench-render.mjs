// Time a frame range of a composition: COMPOSITION=X PROPS={} REMOTION_GL_*=… node scripts/bench-render.mjs out.mp4 <from> <to> <concurrency>
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const root = '/home/user/Video/explainer';
const [out, a, b, conc] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER;
const inputProps = process.env.PROPS ? JSON.parse(process.env.PROPS) : {episode: 'xuming'};
const composition = await selectComposition({serveUrl, id: process.env.COMPOSITION || 'Episode', inputProps, browserExecutable});
const t0 = Date.now();
await renderMedia({serveUrl, composition, inputProps, codec: 'h264', outputLocation: out, frameRange: [Number(a), Number(b)], concurrency: Number(conc), browserExecutable, timeoutInMilliseconds: 300000, muted: true, envVariables: Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('REMOTION_')))});
console.log('TIME', ((Date.now() - t0) / 1000).toFixed(1));
