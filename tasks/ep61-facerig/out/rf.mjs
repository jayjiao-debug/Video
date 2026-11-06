// node rf.mjs <entry e.g. qq61/sheets61> <CID> <outDir> <prefix> frame1 frame2 ...   (run from episodes/37-qiqing/remotion)
import path from 'node:path';
import {createRequire} from 'node:module';
const root = process.cwd();
const req = createRequire(path.join(root, 'package.json'));
const {bundle} = await import(req.resolve('@remotion/bundler'));
const {renderStill, selectComposition} = await import(req.resolve('@remotion/renderer'));
const [entry, cid, out, prefix, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.join(root, 'src', entry + '.tsx'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: cid, inputProps: JSON.parse(process.env.PROPS || '{}')});
for (const f of frames.map(Number)) {
	const o = path.join(out, `${prefix}_${String(f).padStart(5, '0')}.png`);
	await renderStill({serveUrl, composition, inputProps: JSON.parse(process.env.PROPS || '{}'), frame: f, output: o, imageFormat: 'png', scale: Number(process.env.SCALE || 1), timeoutInMilliseconds: 300000});
	console.log(o);
}
