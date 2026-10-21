// Checks every frame of the push (0:19 → the roll at bar 15) with the scenes' own formulas and the drawn figure's FK.
import {solvePush, rockOutline, restingCY, stepFeet2, fk, distToPoly, insidePoly} from './pushIK.mjs';
const FPS = 30;
const bt = (k) => 0.416 + 0.50625 * k, bar35 = (k) => 0.416 + 2.025 * k;
const cl01 = (x) => Math.max(0, Math.min(1, x));
const easeIO5 = (u) => { const v = cl01(u); return v < 0.5 ? 16 * v ** 5 : 1 - Math.pow(-2 * v + 2, 5) / 2; };
const slopeY2 = (x) => { if (x < -200) return 286; if (x < 500) return 420 + 0.38 * (x - 500) + 0.00027 * (x - 500) ** 2; if (x < 4800) return 420 + 0.38 * (x - 500); if (x < 5800) return 2054 + 0.38 * (x - 4800) - 0.00019 * (x - 4800) ** 2; return 2244; };
const ysV = (x) => 420 + 0.34 * x + 0.00011 * (x - 900) * (x - 900);
const PUSH_T0 = bar35(12), LN6 = bar35(12) + 0.06, LN5 = bar35(10) + 0.06, SUMMIT_A = bar35(14), ROLL0 = bar35(15);

function sceneAt(T) {
	if (T < LN6) {                                              // V2Hill (cold-open tail + line 5), drawn with a CSS zoom in Myth1
		const t = T - bt(29.5) + 0.4, heave = Math.max(0, Math.sin(t * 2.0)) ** 2, r = 200, k = 1.12, rx = 690 + 4 * heave;
		const rc = [rx, restingCY(rx, r, ysV)], rock = rockOutline(rc, r);
		const ref = solvePush({rock: rockOutline([690, restingCY(690, r, ysV)], r), ys: ysV, k, feet: {n: 40, f: -103}});
		const sol = solvePush({rock, ys: ysV, k, lean: 45 + 2 * heave, feet: {n: 0, f: 0}, worldFeet: ref.feetW});
		const zoom = T < 20.5 ? 1 : 1 + 0.18 * easeIO5(cl01((T - LN5) / 7));
		return {name: 'V2Hill', sol, rock, ys: ysV, k, px: zoom, lift: [0, 0], rockC: rc, r};
	}
	if (T < SUMMIT_A) {                                         // Push2
		const dt = T - PUSH_T0, ph = dt * 3.4, k = 1, R = 200;
		const rx = 3150 - 62 * dt - 5 * Math.max(0, Math.sin(ph * 2)), rot = (rx - 3150) / R * 57.3;
		const rc = [rx, restingCY(rx, R, slopeY2, 3, rot)], rock = rockOutline(rc, R, 3, rot);
		const o0 = solvePush({rock: rockOutline([3150, restingCY(3150, R, slopeY2, 3, 0)], R, 3, 0), ys: slopeY2, k, feet: {n: 0, f: 0}}).o[0];
		const travel = (o0 - solvePush({rock, ys: slopeY2, k, feet: {n: 0, f: 0}}).o[0]) / k;
		const st = stepFeet2(travel, 40, -86, -104, 0.15, 0.43, 0.753);
		const sol = solvePush({rock, ys: slopeY2, k, feet: {n: st.n.x, f: st.f.x, liftN: st.n.lift, liftF: st.f.lift}});
		return {name: 'Push2', sol, rock, ys: slopeY2, k, px: 1.12, lift: [st.n.lift, st.f.lift], rockC: rc, r: R, rot};
	}
	// Summit, before the roll
	const x = 560 - 40 * easeIO5(cl01((T - SUMMIT_A) / (ROLL0 - SUMMIT_A))), R = 200;
	const rot = -3 * Math.sin(T * 9) * (T > ROLL0 - 0.5 ? 1 : 0);
	const rc = [x, restingCY(x, R, slopeY2, 3, rot)], rock = rockOutline(rc, R, 3, rot);
	const o0 = solvePush({rock: rockOutline([560, restingCY(560, R, slopeY2, 3, 0)], R, 3, 0), ys: slopeY2, k: 1, feet: {n: 0, f: 0}}).o[0];
	const travel = o0 - solvePush({rock, ys: slopeY2, k: 1, feet: {n: 0, f: 0}}).o[0];
	const st = stepFeet2(travel, 40, -86, -104, 0.15, 0.70, 0.0);
	const sol = solvePush({rock, ys: slopeY2, k: 1, lean: 45 + 2 * Math.max(0, Math.sin(T * 6)), feet: {n: st.n.x, f: st.f.x, liftN: st.n.lift, liftF: st.f.lift}});
	return {name: 'Summit', sol, rock, ys: slopeY2, k: 1, px: 1.0, lift: [st.n.lift, st.f.lift], rockC: rc, r: R, rot};
}

const segPts = (a, b, n = 12) => Array.from({length: n + 1}, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
const signedGap = (p, poly) => (insidePoly(p, poly) ? -1 : 1) * distToPoly(p, poly);
function measure(sc) {
	const {sol, rock, ys, k, px} = sc, [ox, oy] = sol.o;
	const W = (p) => [ox - k * p[0], oy + k * p[1]];
	const F = fk(sol.pose);
	// hands: the hand segment (wrist→tip, cap radius 8.5→6.5) against the outline
	const hand = (h) => Math.min(...segPts(W(h.wr), W(h.tip)).map((p, i, a) => signedGap(p, rock) - k * (8.5 - 2 * i / (a.length - 1))));
	const hN = hand(F.handN), hF = hand(F.handF);
	// head: every point of the egg outside the rock
	const head = Math.min(...F.head.map((p) => signedGap(W(p), rock)));
	// every other part (arms up to 80 % of the forearm, legs, torso, pelvis): clearance minus its own thickness
	const parts = [];
	for (const a of [F.handN, F.handF]) { parts.push(...segPts(W(a.s), W(a.el)).map((p) => signedGap(p, rock) - k * 10)); parts.push(...segPts(W(a.el), W(a.wr)).slice(0, 10).map((p) => signedGap(p, rock) - k * 8)); }
	for (const l of [F.legN, F.legF]) { parts.push(...segPts(W(l.hip), W(l.knee)).map((p) => signedGap(p, rock) - k * 15)); parts.push(...segPts(W(l.knee), W(l.ank)).map((p) => signedGap(p, rock) - k * 11)); }
	parts.push(...F.body.map((p) => signedGap(W(p), rock) - k * 40));
	const other = Math.min(...parts);
	// feet: heel and toe against the ground line (perpendicular), only feet that are planted (not mid-step)
	const footGap = (l) => { const pts = [W(l.heel), W(l.toe)]; return Math.max(...pts.map(([x, y]) => { const s = (ys(x + 1) - ys(x - 1)) / 2; return Math.abs(ys(x) - y) / Math.hypot(1, s); })); };
	const fN = sc.lift[0] > 0 ? null : footGap(F.legN), fF = sc.lift[1] > 0 ? null : footGap(F.legF);
	// the boulder: how far its lowest point sits from the ground line (negative = into the ground)
	const rockGround = Math.min(...rock.map(([x, y]) => ys(x) - y));
	const elbowN = 180 - Math.abs(sol.pose.armN[1]), elbowF = 180 - Math.abs(sol.pose.armF[1]);
	const rearKnee = 180 - Math.abs((F.legN.ank[0] < F.legF.ank[0] ? sol.pose.legN : sol.pose.legF)[1]);
	return {hN: hN * px, hF: hF * px, head: head * px, other: other * px, fN: fN === null ? null : fN * px, fF: fF === null ? null : fF * px, rockGround: rockGround * px, elbowN, elbowF, rearKnee, lean: sol.pose.lean};
}

const t0 = 19.0, t1 = ROLL0 - 1 / FPS;
const worst = {hand: {v: 0}, head: {v: 1e9}, other: {v: 1e9}, foot: {v: 0}, rock: {v: 0}};
let n = 0, swing = 0;
const rows = [];
for (let f = Math.round(t0 * FPS); f <= Math.floor(t1 * FPS); f++) {
	const T = f / FPS, sc = sceneAt(T), m = measure(sc); n++;
	const hw = Math.max(Math.abs(m.hN), Math.abs(m.hF));
	if (hw > worst.hand.v) worst.hand = {v: hw, T, sc: sc.name, m};
	if (m.head < worst.head.v) worst.head = {v: m.head, T, sc: sc.name};
	if (m.other < worst.other.v) worst.other = {v: m.other, T, sc: sc.name};
	const fw = Math.max(m.fN ?? 0, m.fF ?? 0); if (m.fN === null || m.fF === null) swing++;
	if (fw > worst.foot.v) worst.foot = {v: fw, T, sc: sc.name};
	if (Math.abs(m.rockGround) > Math.abs(worst.rock.v)) worst.rock = {v: m.rockGround, T, sc: sc.name};
	if ([19.0, 22.0, 25.6, 29.8].some((x) => Math.abs(x - T) < 0.5 / FPS)) rows.push({T, sc: sc.name, ...m});
}
const fmt = (x) => (x === null ? '  (mid-step)' : x.toFixed(2).padStart(7));
console.log(`checked ${n} frames, ${(t0).toFixed(2)}s → ${t1.toFixed(2)}s (V2Hill, Push2, Summit before the roll); one foot mid-step in ${swing} frames (excluded from the foot check)`);
console.log(`hand ↔ rock outline   worst |gap| ${worst.hand.v.toFixed(2)} px at ${worst.hand.T.toFixed(3)}s (${worst.hand.sc})   limit ≤ 4`);
console.log(`head ↔ rock           worst gap   ${worst.head.v.toFixed(2)} px at ${worst.head.T.toFixed(3)}s (${worst.head.sc})   limit ≥ 15`);
console.log(`other body ↔ rock     worst gap   ${worst.other.v.toFixed(2)} px at ${worst.other.T.toFixed(3)}s (${worst.other.sc})   must be > 0 (only the hands touch)`);
console.log(`planted foot ↔ slope  worst gap   ${worst.foot.v.toFixed(2)} px at ${worst.foot.T.toFixed(3)}s (${worst.foot.sc})   limit ≤ 3`);
console.log(`boulder ↔ slope       worst       ${worst.rock.v.toFixed(2)} px at ${worst.rock.T.toFixed(3)}s (${worst.rock.sc})   (rests on the line, ~1–2 px in)`);
console.log('\nthe four stills:');
console.log('   T      scene    hand N   hand F    head    other   foot N   foot F  elbowN elbowF  rear knee');
for (const r of rows) console.log(`${r.T.toFixed(1).padStart(5)}  ${r.sc.padEnd(7)}${fmt(r.hN)}  ${fmt(r.hF)} ${fmt(r.head)} ${fmt(r.other)} ${fmt(r.fN)}  ${fmt(r.fF)}   ${r.elbowN.toFixed(0).padStart(4)}°  ${r.elbowF.toFixed(0).padStart(4)}°   ${r.rearKnee.toFixed(0)}°`);
const pass = worst.hand.v <= 4 && worst.head.v >= 15 && worst.other.v > 0 && worst.foot.v <= 3;
console.log(pass ? '\nALL CHECKS PASS' : '\nCHECKS FAIL');
