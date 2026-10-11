// node scripts/kf_stills.mjs <ep> <count> <outDir>  — renders every key frame, prints body-logic violations
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [ep, count, outDir] = process.argv.slice(2);
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/kf/index.ts'), publicDir: path.join(root, 'public')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
let bad = 0;
for (let i = 0; i < Number(count); i++) {
	const inputProps = {ep, i, poseDebug: Boolean(process.env.DEBUG)};
	const composition = await selectComposition({serveUrl, id: `KF${ep}`, inputProps, browserExecutable});
	await renderStill({serveUrl, composition, inputProps, frame: 0, output: path.join(outDir, `kf${ep}_${String(i + 1).padStart(2, '0')}.png`), imageFormat: 'png', browserExecutable,
		onBrowserLog: (l) => { if (l.text.includes('POSECHECK')) { bad++; console.log(`frame ${i + 1}: ${l.text.slice(l.text.indexOf('{'))}`); } }});
	process.stdout.write('.');
}
console.log(bad ? `\nPOSE CHECK: FAIL (${bad})` : '\nPOSE CHECK: PASS');
