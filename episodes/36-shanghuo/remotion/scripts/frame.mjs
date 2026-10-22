// node scripts/film26.mjs stills <outDir> s1 s2 ...  (seconds)   |   node scripts/film26.mjs video <out.mp4> fromSec toSec
import {bundle} from '@remotion/bundler';
import {renderStill, renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import {createRequire} from 'node:module';
const [mode, out, ...a] = process.argv.slice(2);
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'src', process.env.ENTRY + '.tsx'), publicDir: path.join(root, 'public'), webpackOverride: (c) => { const webpack = createRequire(import.meta.url)('webpack'); return {...c, plugins: [...(c.plugins || []), new webpack.DefinePlugin({'process.env.NO_FX': JSON.stringify(process.env.NO_FX || ''), 'process.env.FX': JSON.stringify(process.env.FX || 'bdcvn')})]}; }});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({serveUrl, id: process.env.CID || 'FILM31', inputProps: {}, browserExecutable});
if (mode === 'stills') {
	for (const s of a.map(Number)) {
		await renderStill({serveUrl, composition, frame: Math.round(s * Number(process.env.SFPS || 30)), output: path.join(out, `f_${s.toFixed(1)}.${process.env.JPG ? 'jpg' : 'png'}`), imageFormat: process.env.JPG ? 'jpeg' : 'png', ...(process.env.JPG ? {jpegQuality: 85} : {}), scale: Number(process.env.SCALE || 1), browserExecutable, timeoutInMilliseconds: 300000, chromiumOptions: process.env.GL ? {gl: process.env.GL} : {}});
	}
	console.log('stills done');
} else {
	let last = 0;
	await renderMedia({serveUrl, composition, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', muted: true, outputLocation: out, browserExecutable, concurrency: Number(process.env.CONC || 2), chromiumOptions: process.env.GL ? {gl: process.env.GL} : {},
		frameRange: [Math.round(Number(a[0]) * 30), Math.round(Number(a[1]) * 30) - 1],
		onProgress: ({progress}) => { if (progress - last > 0.2) { last = progress; console.log(`${Math.round(progress * 100)}%`); } }});
	console.log('done', out);
}
