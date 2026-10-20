import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/ep31/Cover31.tsx'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
for (const [id, name] of [['COVER31W', 'wide'], ['COVER31T', 'tall']]) {
	const composition = await selectComposition({serveUrl, id, inputProps: {}, browserExecutable});
	await renderStill({serveUrl, composition, frame: 0, output: path.join(process.argv[2], `cover_${name}.png`), browserExecutable});
}
console.log('covers done');
