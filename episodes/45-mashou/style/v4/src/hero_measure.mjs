// node hero_measure.mjs — r4 numbers for gate 2b r3 notes 1–3 (mane geometry, mouth, jowl/neck), from hero3.js itself.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
globalThis.K = {uid: () => 'x'}; new Function(readFileSync(path.join(here, 'hero3.js'), 'utf8'))();
const {LOCKS, CLUMPS, hp, CUT} = K.HERO3_GEO, f = (v, d = 2) => (+v).toFixed(d);
console.log(`MANE (n1): ${LOCKS.length} near locks in ${CLUMPS.length} clumps`);
const dirs = LOCKS.map((L) => { const dx = L.tip[0] - L.root[0], dy = L.tip[1] - L.root[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; });
const mean = dirs.reduce((a, d) => [a[0] + d[0] / dirs.length, a[1] + d[1] / dirs.length], [0, 0]);
console.log(`  direction root→tip: mean (${f(mean[0])}, ${f(mean[1])}); range x ${f(Math.min(...dirs.map((d) => d[0])))}…${f(Math.max(...dirs.map((d) => d[0])))}`);
CLUMPS.forEach((c, ci) => { const ls = LOCKS.filter((L) => L.ci === ci), d = dirs.filter((_, k) => LOCKS[k].ci === ci);
	console.log(`  clump ${ci + 1}: tip ≈ (${c.tip}), ${ls.length} locks, length ${ls.map((L) => f(L.L, 0)).join('/')}, dir (${f(d.reduce((a, v) => a + v[0], 0) / d.length)}, ${f(d.reduce((a, v) => a + v[1], 0) / d.length)}), amp/len ${ls.map((L) => f(L.amp / L.L)).join('/')}, waves ${ls.map((L) => f(L.waves, 1)).join('/')}`); });
const len = LOCKS.map((L) => L.L), ar = LOCKS.map((L) => L.amp / L.L), wv = LOCKS.map((L) => L.waves);
console.log(`  length ${f(Math.min(...len), 0)}–${f(Math.max(...len), 0)} (target 280–420); amplitude ${f(Math.min(...ar))}–${f(Math.max(...ar))} × length (0.10–0.14); waves ${f(Math.min(...wv), 2)}–${f(Math.max(...wv), 2)} (1–1.5)`);
const ty = CLUMPS.map((c) => c.tip[1]); console.log(`  clump tip heights y = ${ty.join(', ')} (spread ${Math.max(...ty) - Math.min(...ty)}; no level fringe)`);
// crest (rear edge) x at a given y, and how far each clump's tips flare past it
const CREST = [[772, 150], [884, 192], [974, 302], [1032, 444], [1064, 620], [1084, CUT - 20]];
const crestX = (y) => { for (let k = 0; k < CREST.length - 1; k++) { const a = CREST[k], b = CREST[k + 1]; if (y >= a[1] && y <= b[1]) return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); } return y < 150 ? 772 : 1090; };
console.log(`  tips past the rear edge (units): ${CLUMPS.map((c) => f(c.tip[0] - crestX(Math.min(c.tip[1], CUT - 20)), 0)).join(', ')}`);
// the neck front (throat line) and the mane's front edge at a few heights
const neckFront = (y) => { const a = [848, CUT - 14], b = [912, 708]; return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); };
const maneFront = (y) => { let m = 1e9; for (const L of LOCKS) for (const p of [...L.L1, ...L.R1]) if (Math.abs(p[1] - y) < 4) m = Math.min(m, p[0]); return m; };
for (const y of [720, 760, 800]) { const nf = neckFront(y), mf = maneFront(y), cx = 1080; console.log(`  y ${y}: neck front ${f(nf, 0)}, mane front ${f(mf, 0)} → bare bronze ${f(mf - nf, 0)} units; mane covers the back ${f(100 * (cx - mf) / (cx - nf), 0)} % of the neck width`); }
console.log('MOUTH (n2), screen = after the −20° head rotation (y down):');
const fr = hp([-584, 206]), co = hp([-452, 262]), lo = hp([-561, 233]);
console.log(`  front of the slit (${fr.map((v) => f(v, 0))}), corner (${co.map((v) => f(v, 0))}): corner is ${f(co[1] - fr[1], 0)} units ${co[1] > fr[1] ? 'BELOW' : 'above'} the front (r3: 69 above)`);
console.log(`  lower-lip front is ${f(-584 - -561 < 0 ? 23 : 0, 0)} units behind the upper lip (head-local x −561 vs −584); on screen ${f(lo[0] - fr[0], 0)} units behind`);
console.log(`  front gap at the lower-lip front (x −561): upper lip y ≈ 210 → lower lip y 233 = 23 units (≤ 25, room for the A4 spout); CHIN_LIT removed`);
