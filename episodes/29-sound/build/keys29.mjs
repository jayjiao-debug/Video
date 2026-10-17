// node scripts/keys28.mjs <outDir> k1 k2 ...   (key-frame indices)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [out, ...ks] = process.argv.slice(2);
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/ep28/Keys29.tsx'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
for (const k of ks.map(Number)) {
	const inputProps = {k};
	const composition = await selectComposition({serveUrl, id: 'KEYS29', inputProps, browserExecutable});
	await renderStill({serveUrl, composition, inputProps, frame: 0, output: path.join(out, `k${String(k).padStart(2, "0")}.png`), browserExecutable, timeoutInMilliseconds: 120000});
	process.stdout.write(`k${k} `);
}
console.log('done');
