// node scripts/check47.mjs — body-logic check (figure-rules R2/R3/R5/R7) for every person in the ep47 film, every 0.1 s
import {build} from 'esbuild';
import path from 'node:path';
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const out = path.join(root, 'node_modules', '.check47.cjs');
await build({stdin: {contents: `import {renderToString} from 'react-dom/server'; import React from 'react'; import {SCENES} from './src/qq47/timeline47'; import {FIGS} from './src/qq47/pose47';
const T = []; for (const s of SCENES) { const b = Math.min(s.b, 146); for (let t = s.a; t < b; t += 0.1) { const n0 = FIGS.length; renderToString(React.createElement('svg', null, React.createElement(s.C, {u: t - s.a, d: s.b - s.a}))); for (let i = n0; i < FIGS.length; i++) T.push(+t.toFixed(1)); } }
export {FIGS, T};`, resolveDir: root, loader: 'tsx'}, bundle: true, platform: 'node', format: 'cjs', outfile: out, loader: {'.tsx': 'tsx', '.ts': 'ts'}, logLevel: 'error', jsx: 'automatic', external: ['remotion']});
const {createRequire} = await import('node:module'); const req = createRequire(root + '/');
const {FIGS, T} = req(out);
const bad = new Map();
const add = (k, t) => { if (!bad.has(k)) bad.set(k, [t, t]); else bad.get(k)[1] = t; };
const seg = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
const ang = (a, b, c) => { const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]]; return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)))) * 180 / Math.PI; };
FIGS.forEach((f, i) => {
	const p = f.pose, id = `${f.frame}/${f.who}`, t = T[i], low = Math.min(p.LToe[1], p.RToe[1], p.LAnk[1] - 0.045, p.RAnk[1] - 0.045) * f.h;   // toe or heel
	if (Math.abs(low) > 2) add(`${id} R3 feet ${low.toFixed(1)} px off the floor`, t);
	for (const s of ['L', 'R']) { const kn = ang(p[s + 'Up'], p[s + 'Knee'], p[s + 'Ank']), el = ang(p[s + 'Sh'], p[s + 'Elb'], p[s + 'Hand']);
		if (kn < 25) add(`${id} R2 ${s} knee folded`, t); if (el < 25) add(`${id} R2 ${s} elbow folded`, t);
		const d = seg(p[s + 'Hand'], p.Hips, p.Neck1); if (d < 0.05) add(`${id} R5 ${s} hand inside the torso`, t); }
	/* R7 balance: chest (Neck1) x within the feet span ± 0.12 body units */
	const xs = [p.LAnk[0], p.RAnk[0], p.LToe[0], p.RToe[0]], lo = Math.min(...xs) - 0.12, hi = Math.max(...xs) + 0.12;
	if (p.Neck1[0] < lo || p.Neck1[0] > hi) add(`${id} R7 chest not over the feet`, t);
});
console.log(`${FIGS.length} figure-frames checked`); for (const [k, [a, b]] of bad) console.log(`  ${k}  (t ${a}–${b})`); console.log(bad.size ? 'POSE CHECK: FAIL' : 'POSE CHECK: PASS');
