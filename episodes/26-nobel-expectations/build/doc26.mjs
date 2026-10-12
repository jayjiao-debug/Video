// node scripts/looks26.mjs <outDir> [i...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [outDir, ...idx] = process.argv.slice(2);
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/looks26/Doc.tsx'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const list = idx.length ? idx.map(Number) : [0, 1];
for (const i of list) {
	const inputProps = {i};
	const composition = await selectComposition({serveUrl, id: 'DOC26', inputProps, browserExecutable, chromiumOptions: {gl: 'swangle'}});
	await renderStill({serveUrl, composition, inputProps, frame: 0, output: path.join(outDir, `doc26_${i + 1}.png`), imageFormat: 'png', browserExecutable, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 240000});
	console.log('done', i + 1);
}
