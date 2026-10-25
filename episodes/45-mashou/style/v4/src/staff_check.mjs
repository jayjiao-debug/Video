// node staff_check.mjs — body-logic check for the H1b staff (figure-rules R1–R7) on the film rig. Bundles staff45.ts for node,
// builds the two staff exactly as h1b_return.js does (h1b_staff.json is the single source; build.py inlines it as window.H1B_STAFF), prints every
// number and POSE CHECK: PASS / FAIL. Exit 1 on FAIL. (The Remotion pose_check.mjs cannot run here: ep45 is the three.js engine.)
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const ESB = path.resolve(here, '../../../film/node_modules/.bin/esbuild');
execFileSync(ESB, [path.join(here, 'staff45.ts'), '--bundle', '--format=iife', '--platform=neutral', `--outfile=${path.join(here, 'staff45.js')}`], {stdio: 'inherit'});
new Function(readFileSync(path.join(here, 'staff45.js'), 'utf8'))();
const cfg = JSON.parse(readFileSync(path.join(here, 'h1b_staff.json'), 'utf8'));
let fails = [];
for (const [who, o] of Object.entries(cfg)) {
	const r = globalThis.STAFF45(o), c = r.checks, f = (v) => (Array.isArray(v) ? v.map((x) => (+x).toFixed(2)).join(' / ') : (+v).toFixed(2));
	const rules = [
		['R1 legs-at-hip', c.R1_legs_at_hip_bu <= 0.08, `leg root ${f(c.R1_legs_at_hip_bu)} bu from the hip`],
		['R2 joint-range', c.R2_elbow_deg.every((a) => a >= 0 && a <= 150) && c.R2_knee_deg.every((a) => a >= 0 && a <= 140) && c.R2_lean_deg <= 20, `elbows ${f(c.R2_elbow_deg)}°, knees ${f(c.R2_knee_deg)}°, lean ${c.R2_lean_deg}°`],
		['R3 support', c.R3_soles_px.every((d) => Math.abs(d) <= 3), `soles ${f(c.R3_soles_px)} px from the floor`],
		['R5 hand-purpose', c.R5_hands_px.every((d) => d <= 4) && c.R5_hands_on_edge_px.every((d) => d <= 6), `palms ${f(c.R5_hands_px)} px from their targets; ${f(c.R5_hands_on_edge_px)} px from the leaf edge`],
		['R6 reachable', c.R6_reach_gap_bu.every((g) => g === 0), `reach gap ${f(c.R6_reach_gap_bu)} bu`],
		['push elbow ≤ 70°', c.push_elbow_deg <= 70, `pushing (near) arm bends ${f(c.push_elbow_deg)}° (0 = straight; ≤ 70° so the arm reaches and the forearm shows)`],
		['R7 balance', Math.abs(c.R7_chest_vs_feet_px) <= 0.2 * o.h, `chest ${f(c.R7_chest_vs_feet_px)} px ahead of the feet midpoint (push, hands on the leaf; limit ${0.2 * o.h} px)`],
	];
	console.log(`${who}: knee bend picked ${r.fk.lk}°; near shoulder at (${c.near_shoulder_at_torso_top.map((v) => v.toFixed(0))}), neck (${c.neck.map((v) => v.toFixed(0))})`);
	for (const [n, ok, msg] of rules) { console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${n}: ${msg}`); if (!ok) fails.push(`${who} ${n}`); }
}
console.log(fails.length ? `POSE CHECK: FAIL (${fails.join(', ')})` : 'POSE CHECK: PASS (h1b staff, film rig, R1–R7)');
process.exit(fails.length ? 1 : 0);
