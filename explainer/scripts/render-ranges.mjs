// Re-render only some frame ranges of an episode (one bundle), for splicing into an existing render:
//   node scripts/render-ranges.mjs <episode> <outDir> a-b [a-b ...]   (b exclusive)
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const [episode, outDir, ...ranges] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const inputProps = {episode};
const composition = await selectComposition({serveUrl, id: 'Episode', inputProps, browserExecutable});
for (const r of ranges) {
	const [a, b] = r.split('-').map(Number);
	const t0 = Date.now();
	await renderMedia({serveUrl, composition, inputProps, codec: 'h264', crf: 18, pixelFormat: 'yuv420p', imageFormat: 'jpeg', jpegQuality: 94, outputLocation: path.join(outDir, `seg-${a}-${b}.mp4`), frameRange: [a, b - 1], concurrency: 1, browserExecutable, timeoutInMilliseconds: 300000, muted: true});
	console.log(`seg ${a}-${b} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
console.log('DONE');
