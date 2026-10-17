// node scripts/film26.mjs stills <outDir> s1 s2 ...  (seconds)   |   node scripts/film26.mjs video <out.mp4> fromSec toSec
import {bundle} from '@remotion/bundler';
import {renderStill, renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [mode, out, ...a] = process.argv.slice(2);
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/ep28/Film29.tsx'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({serveUrl, id: 'FILM29', inputProps: {}, browserExecutable});
if (mode === 'stills') {
	for (const s of a.map(Number)) {
		await renderStill({serveUrl, composition, frame: Math.round(s * 30), output: path.join(out, `f_${s.toFixed(1)}.png`), browserExecutable, timeoutInMilliseconds: 120000});
	}
	console.log('stills done');
} else {
	let last = 0;
	await renderMedia({serveUrl, composition, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', muted: true, outputLocation: out, browserExecutable, concurrency: Number(process.env.CONC || 2),
		frameRange: [Math.round(Number(a[0]) * 30), Math.round(Number(a[1]) * 30) - 1],
		onProgress: ({progress}) => { if (progress - last > 0.2) { last = progress; console.log(`${Math.round(progress * 100)}%`); } }});
	console.log('done', out);
}
