// node scripts/check45.mjs — body-logic check (figure-rules R2/R3/R5) for every person registered in the ep45 frames
import {build} from 'esbuild';
import path from 'node:path';
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const out = path.join(root, 'node_modules', '.check45.cjs');
await build({stdin: {contents: `import {renderToString} from 'react-dom/server'; import React from 'react'; import {FRAMES45} from './src/qq45/frames45'; import {FIGS, BUTT} from './src/qq45/pose45';
import * as D from './src/qq45/demo45';
FRAMES45.forEach((f) => renderToString(React.createElement('svg', null, f.scene)));
const T = D.T45, sc = [[D.S3, T.c3, T.c4], [D.S4, T.c4, T.c5], [D.S5, T.c5, T.c6]];
for (const [C, a, b] of sc) for (let t = a; t < b; t += 0.1) renderToString(React.createElement('svg', null, React.createElement(C, {t})));
export {FIGS, BUTT};`, resolveDir: root, loader: 'tsx'}, bundle: true, platform: 'node', format: 'cjs', outfile: out, loader: {'.tsx': 'tsx', '.ts': 'ts'}, logLevel: 'error', jsx: 'automatic', external: ['remotion']});
const {createRequire} = await import('node:module'); const req = createRequire(root + '/');
const {FIGS, BUTT} = req(out);
const bad = []; const seg = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
const ang = (a, b, c) => { const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]]; return Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)) * 180 / Math.PI; };
const seen = new Set(); for (const f of FIGS) {
	const p = f.pose, id = `${f.frame}/${f.who}`, low = Math.min(p.LToe[1], p.RToe[1]) * f.h;
	if (Math.abs(low) > 2) bad.push(`${id} R3 feet ${low.toFixed(1)} px off the floor`);
	if (f.intent === 'sit') { const hipY = f.ground - p.Hips[1] * f.h, gap = f.seatY - hipY - BUTT * f.h; if (Math.abs(gap) > 2) bad.push(`${id} R3 hip ${gap.toFixed(1)} px off the seat`); }
	for (const s of ['L', 'R']) { const kn = ang(p[s + 'Up'], p[s + 'Knee'], p[s + 'Ank']), el = ang(p[s + 'Sh'], p[s + 'Elb'], p[s + 'Hand']);
		if (kn < 25) bad.push(`${id} R2 ${s} knee folded ${kn.toFixed(0)}°`); if (el < 25) bad.push(`${id} R2 ${s} elbow folded ${el.toFixed(0)}°`);
		const d = seg(p[s + 'Hand'], p.Hips, p.Neck1); if (d < 0.05) bad.push(`${id} R5 ${s} hand inside the torso (${(d * f.h).toFixed(0)} px)`); }
}
console.log(`${FIGS.length} figures checked`); bad.forEach((b) => console.log('  ' + b)); console.log(bad.length ? 'POSE CHECK: FAIL' : 'POSE CHECK: PASS');
