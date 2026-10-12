// node scripts/open26.mjs stills <outDir> f1 f2 ...   |   node scripts/open26.mjs video <out.mp4>
import {bundle} from '@remotion/bundler';
import {renderStill, renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [mode, out, ...fr] = process.argv.slice(2);
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/looks26/b/openc-entry.tsx'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({serveUrl, id: 'OPENC', inputProps: {}, browserExecutable});
if (mode === 'stills') {
	for (const f of fr.map(Number)) {
		await renderStill({serveUrl, composition, frame: f, output: path.join(out, `o_${String(f).padStart(3, '0')}.png`), browserExecutable, timeoutInMilliseconds: 120000});
		console.log('done', f);
	}
} else {
	let last = 0;
	await renderMedia({serveUrl, composition, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', muted: true, outputLocation: out, browserExecutable, concurrency: Number(process.env.CONC || 2),
		onProgress: ({progress}) => { if (progress - last > 0.1) { last = progress; console.log(`${Math.round(progress * 100)}% ${new Date().toISOString().slice(11, 19)}`); } }});
	console.log('done', out);
}
