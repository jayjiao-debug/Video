// node scripts/check46.mjs [step] — body-logic check (figure-rules R2/R3/R5/R7/R8) for every person in the ep46 film,
// sampled every `step` seconds over the scenes with people. Prints POSE CHECK: PASS/FAIL.
import {build} from 'esbuild';
import path from 'node:path';
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const out = path.join(root, 'node_modules', '.check46.cjs');
const step = Number(process.argv[2] || 0.1);
await build({stdin: {contents: `import {renderToString} from 'react-dom/server'; import React from 'react'; import {Film46, STELES} from './src/qq46/film46'; import {FIGS} from './src/qq46/people46';
export {STELES}; export const run = (ts) => { for (const t of ts) renderToString(React.createElement(Film46, {t})); return FIGS; };`, resolveDir: root, loader: 'tsx'}, bundle: true, platform: 'node', format: 'cjs', outfile: out,
	loader: {'.tsx': 'tsx', '.ts': 'ts', '.json': 'json'}, logLevel: 'error', jsx: 'automatic', external: ['remotion']});
const {createRequire} = await import('node:module'); const req = createRequire(root + '/');
const {run, STELES} = req(out);
const SOLIDS = [...STELES.map(([x, g, s]) => ({name: 'stele@' + x, x0: x - 100 * s, x1: x + 100 * s, g})), {name: 'qianlong stele', x0: 785, x1: 975, g: 940}, {name: 'tree base', x0: 1300 - 170, x1: 1300 + 210, g: 900}];
const ts = []; for (const [a, b] of [[59.44, 68.0], [77.55, 91.2], [123.97, 136.5]]) for (let t = a; t < b; t += step) ts.push(Number(t.toFixed(3)));
const FIGS = run(ts);
const bad = new Map(); const add = (k, v) => { if (!bad.has(k)) bad.set(k, v); };
const segD = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy); };
const ang = (a, b, c) => { const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]]; return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)))) * 180 / Math.PI; };
for (const f of FIGS) {
	const p = f.pose, id = `${f.who}`, low = Math.min(p.LToe[1], p.RToe[1]) * f.h;
	if (Math.abs(low) > 2) add(`${id} R3 feet off the floor`, `${low.toFixed(1)} px at t=${f.t}`);
	for (const s of ['L', 'R']) { const kn = ang(p[s + 'Up'], p[s + 'Knee'], p[s + 'Ank']), el = ang(p[s + 'Sh'], p[s + 'Elb'], p[s + 'Hand']);
		if (kn < 25) add(`${id} R2 ${s} knee folded`, `${kn.toFixed(0)}° t=${f.t}`); if (el < 25) add(`${id} R2 ${s} elbow folded`, `${el.toFixed(0)}° t=${f.t}`);
		const d = segD(p[s + 'Hand'], p.Hips, p.Neck1); if (d < 0.05) add(`${id} R5 ${s} hand inside the torso`, `${(d * f.h).toFixed(0)} px t=${f.t}`); }
	if (f.intent === 'stand') { const chest = p.Neck1[0], fl = Math.min(p.LToe[0], p.RToe[0], p.LAnk[0], p.RAnk[0]) - 0.08, fr = Math.max(p.LToe[0], p.RToe[0], p.LAnk[0], p.RAnk[0]) + 0.08; if (chest < fl || chest > fr) add(`${id} R7 chest not over the feet`, `t=${f.t}`); }
	{ const feet = ['LToe', 'RToe', 'LAnk', 'RAnk'].map((n) => f.x + (f.flip ? -1 : 1) * p[n][0] * f.h);
		for (const so of SOLIDS) if (Math.abs(f.ground - so.g) < 22 && feet.some((fx) => fx > so.x0 && fx < so.x1) && !(so.name === 'qianlong stele' && f.t < 66.9)) add(`${id} R4 standing inside ${so.name}`, `t=${f.t}`); }
	for (const hnd of f.hands || []) { const j = p[hnd.joint], wx = f.x + (f.flip ? -1 : 1) * j[0] * f.h, wy = f.ground - j[1] * f.h, d = Math.hypot(wx - hnd.at[0], wy - hnd.at[1]); if (d > (hnd.tol ?? 6)) add(`${id} R8 ${hnd.joint} not at its target`, `${d.toFixed(0)} px t=${f.t}`); }
}
console.log(`${FIGS.length} figure-frames checked over ${ts.length} times`); for (const [k, v] of bad) console.log('  ' + k + ': ' + v); console.log(bad.size ? 'POSE CHECK: FAIL' : 'POSE CHECK: PASS');
