import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const out = process.argv[2];
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'episodes/nobel/cover-entry.tsx'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
for (const id of ['CoverWide', 'CoverTall']) {
	const composition = await selectComposition({serveUrl, id, inputProps: {}, browserExecutable});
	await renderStill({serveUrl, composition, frame: 0, output: path.join(out, `${id}.png`), browserExecutable});
	console.log('done', id);
}
