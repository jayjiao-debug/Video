// Render several stills in one bundle: node scripts/stills.mjs <episode> <outDir> <frame> [frame...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [episode, outDir, ...frames] = process.argv.slice(2);
const id = process.env.COMPOSITION || 'Episode';
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const inputProps = {episode};
const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
for (const [i, fr] of frames.entries()) {
	const output = path.join(outDir, `${String(i).padStart(3, '0')}.jpg`);
	await renderStill({serveUrl, composition, inputProps, frame: Number(fr), output, imageFormat: 'jpeg', jpegQuality: 88, browserExecutable});
	process.stdout.write('.');
}
console.log(`\n${frames.length} stills -> ${outDir}`);
