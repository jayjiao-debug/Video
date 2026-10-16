// node scripts/keys27.mjs <outDir> [frames...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [out, ...fr] = process.argv.slice(2);
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/ep27/Keys27.tsx'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({serveUrl, id: 'KEYS27', inputProps: {}, browserExecutable});
const frames = fr.length ? fr.map(Number) : Array.from({length: composition.durationInFrames}, (_, i) => i);
for (const f of frames) {
	await renderStill({serveUrl, composition, frame: f, output: path.join(out, `K${f + 1}.png`), browserExecutable, timeoutInMilliseconds: 120000});
	console.log('K' + (f + 1));
}
