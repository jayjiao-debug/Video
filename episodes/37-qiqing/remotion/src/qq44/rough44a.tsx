import React from 'react';
import {W, H, rnd, lerp, Glow, Rimmed, fkPose, Look4, Pose, B, jointAt, Sky, BRAIN_D, HeadGlow, Jar} from './kit44';
import {SANS, MONO, ROSE, INK} from './skin44';
import {Shaft, Motes, Pendant, Shelf, Frame, Wallpaper, Curtain, Cloud, Clock} from './bg44';
import {seg, ease, eo, ei, sm, cl, Cam, Sticker, ColdBrain, skullBack, GLOW_BACK} from './demo44';
/* ep44 full rough cut, part A: film 35.5–95.5 (lines 12–30 of lines.json v2, film = +0.5 s).
   Same family as the demo: flat-vector sets with layered dressing, a camera on every shot, rose-gold only for 你.
   你/他 glow rule: the head glow flares on 你 lines and dims on 他 lines. Each scene takes film time t. */
type P2 = [number, number];
const RIMB = '#ffc4a0';
const STAND = {hip: 0.655, lean: 3, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14};
const LK: Record<string, Look4> = {
	ein: {dress: 'jacket', head: 'young', beard: 'mous2'}, einOld: {dress: 'jacket', head: 'wild', beard: 'mous2', build: 1.05},
	doctor: {dress: 'coat', head: 'glasses'}, harvey: {dress: 'coat', head: 'short'}, son: {dress: 'jacket', head: 'short', build: 1.04},
	levy: {dress: 'jacket', head: 'bowl'}, harveyOld: {dress: 'jacket', head: 'baldf', build: 1.05}, astro: {dress: 'jacket', head: 'hat'},
};
const headC = (pose: Pose, x: number, g: number, h: number, flip = false): P2 => { const hd = jointAt(pose, 'Head', x, g, h, flip), tp = jointAt(pose, 'Top', x, g, h, flip); return [lerp(hd[0], tp[0], 0.45), lerp(hd[1], tp[1], 0.45)]; };
/** a figure carrying 你: rim-lit silhouette + the glow in the head */
const Carrier: React.FC<{x: number; g: number; h: number; pose: Pose; look: Look4; flip?: boolean; id: string; glow: number; col?: string; rimOp?: number}> = ({x, g, h, pose, look, flip, id, glow, col = '#120e10', rimOp = 0.6}) => {
	const c = skullBack(pose, x, g, h, flip, GLOW_BACK);
	return <g><Rimmed x={x} ground={g} h={h} pose={pose} look={look} flip={flip} col={col} rim={RIMB} rimOp={rimOp} rimDx={flip ? 2.4 : -2.4} />
		<HeadGlow x={c[0]} y={c[1]} r={h * 0.048 * (0.75 + 0.35 * glow)} id={id} o={cl(glow, 0, 1.4)} /></g>; };
/** a plain walk built on the same skeleton; arms can be overridden (carrying) */
const walkP = (ph: number, arms?: {la: number; le: number; ra: number; re: number}, lean = 5) => fkPose({hip: 0.655 - 0.01 * Math.abs(Math.cos(ph)), lean, neck: 4,
	lt: 20 * Math.sin(ph), lk: 6 + 26 * Math.max(0, Math.sin(ph + 1.7)), rt: -20 * Math.sin(ph), rk: 6 + 26 * Math.max(0, Math.sin(ph + 1.7 + Math.PI)),
	la: arms?.la ?? -16 * Math.sin(ph), le: arms?.le ?? 16, ra: arms?.ra ?? 16 * Math.sin(ph), re: arms?.re ?? 16});
const Streaks: React.FC<{k: number; seed?: number}> = ({k, seed = 0}) => k <= 0.01 ? null : <g opacity={k}>{Array.from({length: 28}, (_, i) =>
	<rect key={i} x={-200 + rnd(i, 7 + seed) * W} y={rnd(i, 8 + seed) * H} width={300 + 600 * rnd(i, 9)} height={2 + 5 * rnd(i, 10)} fill={i % 4 ? '#d8d2c8' : B.mid} opacity={0.25 + 0.35 * rnd(i, 11)} />)}</g>;
const Stars: React.FC<{n: number; x: number; y: number; w: number; h: number; seed?: number; t?: number; o?: number}> = ({n, x, y, w, h, seed = 0, t = 0, o = 1}) => <g>{Array.from({length: n}, (_, i) =>
	<circle key={i} cx={x + rnd(i, 11 + seed) * w} cy={y + rnd(i, 12 + seed) * h} r={0.8 + 1.6 * rnd(i, 13 + seed) ** 3} fill="#eef0ff" opacity={o * (0.25 + 0.5 * rnd(i, 14 + seed)) * (0.75 + 0.25 * Math.sin(t * 2 + i))} />)}</g>;
/** a window with mullions; `sky` is drawn inside */
const Win: React.FC<{x: number; y: number; w: number; h: number; sky: React.ReactNode; frame?: string; id: string}> = ({x, y, w, h, sky, frame = '#14100e', id}) => <g>
	<defs><clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath></defs><g clipPath={`url(#${id})`}>{sky}</g>
	<rect x={x} y={y} width={w} height={h} fill="none" stroke={frame} strokeWidth={16} /><path d={`M${x + w / 2},${y} V${y + h} M${x},${y + h * 0.48} H${x + w}`} stroke={frame} strokeWidth={9} /></g>;
const txt = (fam: string, size: number, weight: number | string = 700, extra: React.CSSProperties = {}): React.CSSProperties => ({fontFamily: fam, fontSize: size, fontWeight: weight as React.CSSProperties['fontWeight'], ...extra});
const SERIF = "'DejaVu Serif',serif";

/* ================= E1a/E1b 35.5–41.0: the 1919 eclipse; starlight bends; 你对了，他红了 ================= */
const SUN: P2 = [1180, 430];
/** the bent ray: from a star behind the sun, round the limb, down to the island (drawn exaggerated, no number) */
/* round 2 (owner note 4): Eddington kneels at a telescope on a low tripod, his eye on the eyepiece, both hands on the tube; the tube
   is aimed at the eclipsed sun (its axis runs from the eyepiece through SUN), and the bent starlight ends in its objective. */
const OBS = {x: 560, g: 858, h: 300};
const OBS_K = {hip: 0.36, lean: 34, neck: -58, lt: 94, lk: 94, rt: 0, rk: 90, rf: 160};
/** 2-bone IK in pose units (y up): the upper-arm angle a and elbow bend e (fkPose convention) that put the hand on `tg`, elbow down */
const armIK = (sh: P2, tg: P2): {a: number; e: number} => { const U = 0.194, F = 0.135, vx = tg[0] - sh[0], vy = tg[1] - sh[1], D = Math.min(Math.hypot(vx, vy), (U + F) * 0.995);
	const base = Math.atan2(vx, -vy) * 180 / Math.PI, al = Math.acos(cl((U * U + D * D - F * F) / (2 * U * D), -1, 1)) * 180 / Math.PI;
	const opts = [base + al, base - al].map((a) => { const r = a * Math.PI / 180, el: P2 = [sh[0] + Math.sin(r) * U, sh[1] - Math.cos(r) * U], fa = Math.atan2(tg[0] - el[0], -(tg[1] - el[1])) * 180 / Math.PI; return {a, e: fa - a, ey: el[1]}; });
	const o = opts[0].ey < opts[1].ey ? opts[0] : opts[1]; return {a: o.a, e: o.e}; };
export const SCOPE = (() => {
	const {x, g, h} = OBS, p0 = fkPose({...OBS_K, la: 0, le: 0, ra: 0, re: 0});
	const n1 = jointAt(p0, 'Neck1', x, g, h), hd = jointAt(p0, 'Head', x, g, h), tp = jointAt(p0, 'Top', x, g, h), ang = Math.atan2(tp[1] - n1[1], tp[0] - n1[0]) + Math.PI / 2;
	const hc: P2 = [lerp(hd[0], tp[0], 0.45), lerp(hd[1], tp[1], 0.45)], s = h * 0.93, R = (px: number, py: number): P2 => [hc[0] + (px * Math.cos(ang) - py * Math.sin(ang)) * s, hc[1] + (px * Math.sin(ang) + py * Math.cos(ang)) * s];
	const E = R(0.072, -0.002), dl = Math.hypot(SUN[0] - E[0], SUN[1] - E[1]), d: P2 = [(SUN[0] - E[0]) / dl, (SUN[1] - E[1]) / dl], nn: P2 = [-d[1], d[0]];   // nn: the tube's underside
	const at = (k: number, o = 0): P2 => [E[0] + d[0] * k + nn[0] * o, E[1] + d[1] * k + nn[1] * o];
	const toPose = (q: P2): P2 => [(q[0] - x) / h, (g - q[1]) / h];
	/* each hand takes the farthest grip along the tube it can reach (a little short of full stretch) */
	const grip = (sh: P2, k0: number, k1: number) => { let best = k0; for (let k = k0; k <= k1; k += 2) { const q = toPose(at(k, 12)); if (Math.hypot(q[0] - sh[0], q[1] - sh[1]) < 0.3) best = k; } return best; };
	const kNear = grip(p0.LSh, 30, 70), kFar = grip(p0.RSh, kNear + 30, 150);
	const L = armIK(p0.LSh, toPose(at(kNear, 10))), Rr = armIK(p0.RSh, toPose(at(kFar, 10)));
	const pose = fkPose({...OBS_K, la: L.a, le: L.e, ra: Rr.a, re: Rr.e});
	const pivot = at(150, 22);
	return {pose, E, d, nn, at, pivot, O: at(300), ang: Math.atan2(d[1], d[0]) * 180 / Math.PI};
})();
const RAY = `M1760,170 C1500,250 1300,300 ${SUN[0] + 20},${SUN[1] - 112} C1060,${SUN[1] - 96} ${SCOPE.O[0] + SCOPE.d[0] * 320},${SCOPE.O[1] + SCOPE.d[1] * 320 - 30} ${SCOPE.O[0]},${SCOPE.O[1]}`;
/** the telescope: tube from the eyepiece (E) along d, dew cap at the objective, a low tripod under the pivot */
const Telescope: React.FC<{col: string; rim: string}> = ({col, rim}) => { const {E, pivot, ang} = SCOPE, g = OBS.g;
	return <g>
		<g stroke={col} strokeWidth={7} strokeLinecap="round"><path d={`M${pivot[0]},${pivot[1]} L${pivot[0] - 78},${g} M${pivot[0]},${pivot[1]} L${pivot[0] + 70},${g} M${pivot[0]},${pivot[1]} L${pivot[0] + 8},${g + 4}`} /></g>
		<rect x={pivot[0] - 9} y={pivot[1] - 16} width={18} height={24} rx={3} fill={col} />
		<g transform={`translate(${E[0]},${E[1]}) rotate(${ang})`}>
			<path d="M24,-15 L250,-17 L250,17 L24,15 Z" fill={col} /><rect x={244} y={-21} width={58} height={42} rx={4} fill={col} />
			<rect x={2} y={-7} width={24} height={14} rx={3} fill={col} /><rect x={20} y={-11} width={18} height={22} rx={3} fill={col} />
			<rect x={120} y={-20} width={16} height={40} rx={3} fill={col} />
			<path d="M24,-15 L250,-17 M244,-21 L302,-21" stroke={rim} strokeWidth={2} opacity={0.35} fill="none" />
			<rect x={300} y={-19} width={3} height={38} fill="#e8e4f0" opacity={0.5} />
		</g>
	</g>; };
const Eclipse: React.FC<{t: number}> = ({t}) => {
	const u = t - 35.5, cut = t >= 38.75, draw = ease(seg(t, 35.9, 37.7)), ghost = sm(seg(t, 37.6, 38.2));
	if (!cut) {
		const k = ease(seg(u, 0, 2.4)), cx = lerp(1300, 1020, k) + 12 * Math.sin(u * 0.6), cy = lerp(380, 520, k), z = lerp(1.65, 1.06, k) + 0.01 * u;
		return <g>
			<Sky id="e1s" stops={[[0, '#070b16'], [0.55, '#141c30'], [0.85, '#2e2e3c'], [1, '#221e1a']]} />
			<Cam cx={cx} cy={cy} z={z}>
				<Stars n={90} x={-200} y={-100} w={2400} h={800} t={t} />
				<g transform={`translate(${SUN[0]},${SUN[1]})`}>
					<Glow x={0} y={0} r={300} c="#f4f0e4" o={0.42} id="e1c" />
					{Array.from({length: 28}, (_, i) => { const a = i * Math.PI / 14 + 0.05 * Math.sin(t + i), l = 128 + 80 * rnd(i, 2) + 10 * Math.sin(t * 1.3 + i); return <path key={i} d={`M${Math.cos(a) * 100},${Math.sin(a) * 100} L${Math.cos(a + 0.04) * l},${Math.sin(a + 0.04) * l}`} stroke="#f4f0e4" strokeWidth={3.5} opacity={0.32} />; })}
					<circle r={100} fill="#04050a" /><circle r={102} fill="none" stroke="#fffaf0" strokeWidth={3} opacity={0.9} />
				</g>
				{/* the straight path it "should" take, and the real one, bending round the sun */}
				<path d={`M1760,170 L${SCOPE.O[0]},${SCOPE.O[1]}`} stroke="#fff4dc" strokeWidth={2} fill="none" strokeDasharray="3 12" opacity={0.3 * sm(seg(t, 35.7, 36.2))} />
				<path d={RAY} stroke="#fff4dc" strokeWidth={4} fill="none" pathLength={1} strokeDasharray={`${draw} 1`} opacity={0.9} />
				<path d={RAY} stroke="#fff4dc" strokeWidth={14} fill="none" pathLength={1} strokeDasharray={`${draw} 1`} opacity={0.12} />
				<circle cx={1760} cy={170} r={7} fill="#fff" /><Glow x={1760} y={170} r={46} c="#ffffff" o={0.85} id="e1st" />
				{/* where the star seems to be from the island: shifted outward */}
				<g opacity={ghost}><circle cx={1840} cy={92} r={7} fill="none" stroke="#fff4dc" strokeWidth={2.5} /><path d="M1775,158 Q1800,112 1828,100" stroke="#fff4dc" strokeWidth={2.5} fill="none" strokeDasharray="6 6" /><path d="M1828,100 l-14,2 l8,10 Z" fill="#fff4dc" />
					<path d={`M${SUN[0] + 20},${SUN[1] - 112} L1840,92`} stroke="#fff4dc" strokeWidth={1.5} strokeDasharray="4 8" opacity={0.6} /></g>
				{/* Príncipe: palms, the observers' telescope; waves */}
				<path d="M-300,860 Q300,800 900,830 Q1500,850 2300,812 L2300,1300 L-300,1300 Z" fill="#12110e" />
				<path d="M-300,880 Q400,860 2300,872" stroke="#3a3a40" strokeWidth={3} fill="none" opacity={0.5} />
				{[[1560, 840], [1820, 826], [-60, 850]].map(([x, y], i) => <g key={i} fill="#12110e"><path d={`M${x},${y} Q${x + 10},${y - 170} ${x - 6},${y - 320} L${x + 6},${y - 320} Q${x + 24},${y - 170} ${x + 14},${y} Z`} />{Array.from({length: 7}, (_, k) => { const a = (-170 + k * 30 + 4 * Math.sin(t * 1.1 + k + i)) * Math.PI / 180; return <path key={k} d={`M${x},${y - 320} q${Math.cos(a) * 60},${Math.sin(a) * 40 - 10} ${Math.cos(a) * 140},${Math.sin(a) * 60 + 40}`} stroke="#12110e" strokeWidth={14} fill="none" strokeLinecap="round" />; })}</g>)}
				<Telescope col="#12110e" rim="#e8e4f0" />
				<Rimmed x={OBS.x} ground={OBS.g} h={OBS.h} pose={SCOPE.pose} look={LK.astro} col="#12110e" rim="#e8e4f0" rimOp={0.3} rimDx={-2.2} />
				<Motes t={t} x={0} y={700} w={1900} h={300} n={18} o={0.25} col="#e8eaf8" />
			</Cam>
		</g>;
	}
	/* E1b, cut on the beat: Berlin, under the same sky. 你对了 → the glow flares; 他红了 → headlines stack, flashbulbs */
	const v = t - 38.75, flare = Math.exp(-Math.max(0, v - 0.25) / 0.45) * sm(seg(v, 0, 0.18)), glow = 0.7 + 0.9 * flare;
	const cx = 900 + 40 * v, cy = 560, z = 1.08 + 0.025 * v;
	const pose = fkPose({...STAND, lean: 4, neck: lerp(-6, 8, ease(seg(v, 0.9, 1.4))), la: 34, le: 70, ra: 40, re: 66});
	/* round 2 (owner note 5): every line fits inside the paper's 400 px rule with margin (DejaVu Serif Bold, measured): LIGHT BENT 381,
	   EINSTEIN 299, LIGHTS ALL ASKEW 370 at 32 px (was 463 at 40), IN THE HEAVENS 263 at 26, MORNING EDITION 378 at 0.08em (was 396) */
	const HEADS: {a: number; x: number; y: number; r: number; s: number; mast: string; head: string; cn?: boolean; sub?: string; hs?: number; ss?: number; mls?: string}[] = [
		{a: 1.0, x: 1240, y: 300, r: -8, s: 0.82, mast: 'THE GAZETTE', head: 'LIGHT BENT'}, {a: 1.42, x: 1560, y: 420, r: 7, s: 0.86, mast: 'EVENING NEWS', head: 'EINSTEIN'},
		{a: 1.84, x: 1330, y: 590, r: -3, s: 1.1, mast: 'MORNING EDITION', head: 'LIGHTS ALL ASKEW', sub: 'IN THE HEAVENS', hs: 32, ss: 26, mls: '0.08em'}];
	return <g>
		<Sky id="e2s" stops={[[0, '#0a0e1a'], [0.6, '#1a2032'], [0.62, '#221e20'], [1, '#141210']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<Stars n={60} x={-200} y={-100} w={2400} h={700} seed={3} t={t} o={0.7} />
			{/* Berlin roofline, gas lamps */}
			<path d="M-300,700 L-300,520 L-80,520 L-80,460 L60,460 L60,540 L260,540 L300,480 L420,480 L460,540 L700,540 L700,430 L760,400 L820,430 L820,560 L1100,560 L1100,500 L1400,500 L1400,580 L1700,580 L1700,520 L2300,520 L2300,700 Z" fill="#1c1e26" />
			{Array.from({length: 22}, (_, i) => <rect key={i} x={-260 + i * 112} y={570 + 30 * rnd(i, 3)} width={18} height={26} fill="#e8d0a0" opacity={0.18 + 0.25 * rnd(i, 4)} />)}
			<rect x={-300} y={700} width={2600} height={500} fill="#141210" /><path d="M-300,700 H2300" stroke="#3a3430" strokeWidth={3} />
			{[180, 1960].map((x, i) => <g key={i}><rect x={x - 4} y={420} width={8} height={290} fill="#0e0c0c" /><path d={`M${x - 22},420 L${x + 22},420 L${x + 14},390 L${x - 14},390 Z`} fill="#0e0c0c" /><Glow x={x} y={410} r={120} c="#ffe2b0" o={0.3} id={`e2l${i}`} /></g>)}
			<Motes t={t} x={200} y={300} w={1500} h={500} n={20} o={0.3} />
			{/* the headlines stack over the sky, one per beat */}
			{HEADS.map((hd, i) => { const k = eo(seg(v, hd.a, hd.a + 0.22)); if (k <= 0) return null;
				return <g key={i} transform={`translate(${hd.x + (1 - k) * 260},${hd.y - (1 - k) * 120}) rotate(${hd.r + (1 - k) * 20}) scale(${hd.s * lerp(1.25, 1, k)})`} opacity={k}>
					<rect x={-220} y={-150} width={440} height={300} fill="#e8e0cc" stroke="#7a705c" strokeWidth={2} />
					<text x={0} y={-104} textAnchor="middle" style={txt(hd.cn ? SANS : SERIF, 30, 900, {letterSpacing: hd.mls ?? '0.12em'})} fill="#2a2420">{hd.mast}</text>
					<rect x={-200} y={-90} width={400} height={3} fill="#2a2420" /><rect x={-200} y={-84} width={400} height={1.5} fill="#2a2420" />
					<text x={0} y={-30} textAnchor="middle" style={txt(hd.cn ? SANS : SERIF, hd.hs ?? 52, 900)} fill="#1e1a16">{hd.head}</text>
					{hd.sub && <text x={0} y={6} textAnchor="middle" style={txt(SERIF, hd.ss ?? 30, 900)} fill="#1e1a16">{hd.sub}</text>}
					<text x={-200} y={hd.sub ? 30 : 4} style={txt(MONO, 14, 400)} fill="#5a5448">1919</text>
					{Array.from({length: 6}, (_, r) => [0, 1, 2].map((c) => <rect key={`${r}_${c}`} x={-200 + c * 138} y={20 + r * 18} width={124 - (r % 2) * 20} height={5} fill="#8a8274" />))}
				</g>; })}
			<Carrier x={560} g={1010} h={600} pose={pose} look={LK.ein} id="e2g" glow={glow} />
			{flare > 0.02 && (() => { const c = skullBack(pose, 560, 1010, 600, false, GLOW_BACK); return <><Glow x={c[0]} y={c[1]} r={420 * (0.6 + 0.4 * flare)} c={B.mid} o={0.55 * flare} id="e2fl" />{Array.from({length: 12}, (_, i) => { const a = i * Math.PI / 6 + 0.2, l = 60 + 200 * flare; return <line key={i} x1={c[0] + Math.cos(a) * 40} y1={c[1] + Math.sin(a) * 40} x2={c[0] + Math.cos(a) * l} y2={c[1] + Math.sin(a) * l} stroke={B.core} strokeWidth={3} opacity={0.5 * flare} strokeLinecap="round" />; })}</>; })()}
			{(() => { const h = jointAt(pose, 'RHand', 560, 1010, 600); return <g transform={`translate(${h[0] + 10},${h[1] - 30}) rotate(-10)`}><rect x={-10} y={-80} width={160} height={124} fill="#d8d0bc" /><rect x={6} y={-66} width={128} height={14} fill="#3a342c" />{Array.from({length: 6}, (_, i) => <rect key={i} x={6} y={-40 + i * 12} width={60 + (i % 3) * 20} height={4} fill="#8a8274" />)}</g>; })()}
			{/* flashbulbs: 他红了 */}
			{[1.05, 1.47, 1.9, 2.1].map((a, i) => { const f = v >= a ? Math.exp(-(v - a) / 0.12) : 0; const fx = [300, 980, 120, 860][i], fy = [560, 470, 420, 640][i];
				return f > 0.01 ? <g key={i}><Glow x={fx} y={fy} r={260} c="#ffffff" o={0.75 * f} id={`e2f${i}`} /><circle cx={fx} cy={fy} r={18} fill="#fff" opacity={f} /></g> : null; })}
		</Cam>
		<rect width={W} height={H} fill="#fff8ec" opacity={0.18 * Math.max(...[1.05, 1.47, 1.9].map((a) => (v >= a ? Math.exp(-(v - a) / 0.08) : 0)))} />
		<rect width={W} height={H} fill={B.core} opacity={0.16 * flare} />
	</g>;
};

/* ================= N1 41.0–44.5: the prize, for the photoelectric effect; 你的相对论 sits unlit ================= */
const Paper: React.FC<{title?: string; lit?: number; w?: number; h?: number; year?: string}> = ({title, lit = 0, w = 180, h = 240, year = '1905'}) => <g>
	<rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#efe8d8" stroke="#8a8070" strokeWidth={1.5} />
	{lit > 0 && <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#fff4e4" opacity={lit} />}
	{title && <text x={0} y={-h / 2 + 38} textAnchor="middle" style={txt(SANS, 19, 900)} fill="#2a2420">{title}</text>}
	<text x={0} y={-h / 2 + 64} textAnchor="middle" style={txt(MONO, 13, 400)} fill="#6a6258">{year}</text>
	{Array.from({length: 9}, (_, i) => <rect key={i} x={-w / 2 + 22} y={-h / 2 + 84 + i * 15} width={100 + (i % 3) * 18} height={4} fill="#8a8274" />)}
</g>;
const Nobel: React.FC<{t: number}> = ({t}) => {
	const u = t - 41.0, slide = ease(seg(u, 0.05, 0.85)), lit = sm(seg(t, 41.9, 42.4)), unlit = sm(seg(t, 43.1, 43.9));
	const cx = lerp(1180, 860, ease(seg(u, 0.6, 3.5))), cy = 540 - 10 * u, z = lerp(1.32, 1.12, ease(seg(u, 0, 3.5)));
	const pose = fkPose({...STAND, lean: 8, neck: 10, la: 20, le: 40, ra: 30, re: 50}), dx = lerp(1700, 1120, slide);
	return <g>
		<Sky id="n1s" stops={[[0, '#2e2622'], [0.66, '#3a302a'], [0.67, '#221a16'], [1, '#161210']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<Wallpaper id="n1w" x={-300} y={-200} w={2600} h={900} col="#4e3e34" o={0.45} s={1.4} />
			<rect x={-300} y={600} width={2600} height={100} fill="#2a201a" /><rect x={-300} y={594} width={2600} height={8} fill="#1e1612" />
			<Win x={1500} y={120} w={300} h={380} id="n1win" sky={<Sky id="n1ws" x={1500} y={120} w={300} h={380} stops={[[0, '#8a96a0'], [1, '#c8c8c0']]} />} frame="#1e1612" />
			<Curtain x={1430} y={110} w={100} h={500} col="#3a2a22" /><Curtain x={1770} y={110} w={100} h={500} col="#3a2a22" flip />
			<Shaft id="n1sh" a={[1500, 500]} b={[1800, 500]} c={[1500, 1000]} d={[900, 1000]} col="#f2e6d2" o={0.08} />
			<Frame x={420} y={160} w={170} h={210} col="#241a14" oval /><Frame x={700} y={200} w={220} h={150} col="#241a14" />
			<Clock x={1120} y={180} r={34} t={t} />
			<Motes t={t} x={500} y={300} w={1300} h={500} n={26} o={0.35} />
			<Pendant x={980} y={40} len={110} id="n1p" o={0.55} />
			{/* the table */}
			<path d="M240,720 L1680,720 L1620,660 L300,660 Z" fill="#4a3a2c" /><rect x={240} y={720} width={1440} height={24} fill="#3a2a1e" /><rect x={280} y={744} width={18} height={300} fill="#2a1e16" /><rect x={1620} y={744} width={18} height={300} fill="#2a1e16" />
			<Rimmed x={300} ground={1000} h={640} pose={pose} look={LK.ein} col="#130f0e" rim={RIMB} rimOp={0.5} />
			{(() => { const c = skullBack(pose, 300, 1000, 640, false, GLOW_BACK); return <HeadGlow x={c[0]} y={c[1]} r={30} id="n1h" o={lerp(0.6, 0.38, unlit)} />; })()}
			{/* 你的相对论: the 1905 sheet from the office, its glow going out */}
			<g transform="translate(700,560) rotate(-4)">
				<Glow x={0} y={0} r={260} c={B.halo} o={0.35 * (1 - unlit)} id="n1rg" />
				<Paper title="论动体的电动力学" lit={0.3 * (1 - unlit)} />
				<text x={0} y={-150} textAnchor="middle" style={txt(SANS, 44, 900, {letterSpacing: '0.06em'})} fill={ROSE} opacity={0.85 * (1 - unlit) + 0.15} stroke="rgba(12,8,5,0.55)" strokeWidth={4} paintOrder="stroke">相对论</text>
				<rect x={-90} y={-120} width={180} height={240} fill="#141010" opacity={0.42 * unlit} />
			</g>
			{/* the diploma slides in; one line lights: 光电效应 */}
			<g transform={`translate(${dx},520) rotate(${lerp(10, 2, slide)})`}>
				<Glow x={60} y={80} r={300} c="#fff2d8" o={0.35 * lit} id="n1d" />
				<rect x={-200} y={-250} width={400} height={500} fill="#ece2c8" stroke="#6a5a3a" strokeWidth={3} />
				<rect x={-180} y={-230} width={360} height={460} fill="none" stroke="#8a7448" strokeWidth={2} /><rect x={-172} y={-222} width={344} height={444} fill="none" stroke="#8a7448" strokeWidth={1} />
				{[[-180, -230], [180, -230], [-180, 230], [180, 230]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill="none" stroke="#8a7448" strokeWidth={2} />)}
				<text x={0} y={-160} textAnchor="middle" style={txt(SANS, 44, 900, {letterSpacing: '0.06em'})} fill="#3a2e1e">1921年度</text>
				<rect x={-120} y={-130} width={240} height={3} fill="#8a7448" />
				{Array.from({length: 4}, (_, i) => <rect key={i} x={-130} y={-100 + i * 22} width={260 - (i % 2) * 60} height={6} fill="#9a8c70" />)}
				<g transform="translate(0,40)">
					<rect x={-150} y={-30} width={300} height={56} rx={6} fill="#fff6e0" opacity={0.85 * lit} />
					<text x={0} y={10} textAnchor="middle" style={txt(SANS, 36, 900, {letterSpacing: '0.12em'})} fill="#2a2016">光电效应</text>
					<rect x={-110} y={22} width={220} height={4} fill="#2a2016" opacity={0.4 + 0.5 * lit} />
				</g>
				{Array.from({length: 3}, (_, i) => <rect key={i} x={-130} y={110 + i * 22} width={200 - i * 30} height={6} fill="#9a8c70" />)}
				<circle cx={120} cy={170} r={44} fill="#a88a4a" opacity={0.75} /><circle cx={120} cy={170} r={34} fill="none" stroke="#ece2c8" strokeWidth={2} opacity={0.6} />
			</g>
			<g fill="#0a0808"><path d="M-300,1080 L-300,820 Q-200,790 -100,830 L-60,1080 Z" /></g>
		</Cam>
	</g>;
};

/* ================= W1/W2 44.5–50.75: the typed letter; pull back; he signs by lamplight ================= */
const signP = (t: number) => fkPose({hip: 0.37, lean: 22, neck: 20, lt: 86, lk: 90, rt: 82, rk: 86, la: 46, le: 62, ra: 52 + 2 * Math.sin(t * 5), re: 74});
const DESK = {x: 760, g: 912, h: 600};
const TYPED = 'August 2nd, 1939';
/** the signature, page units: x runs under "Yours very truly," */
const sigAt = (k: number): P2 => [120 + 300 * k, 505 + 16 * Math.sin(k * 15) - 6 * k];
/* final pass (logic 4): the page is an insert of the flat letter seen from above (it never stands in the air); a hand with a pen
   enters and signs in the blank under "Yours very truly,"; the pull-back finds the page flat on the desk, the pen in his hand. */
const Letter: React.FC<{t: number}> = ({t}) => {
	const back = ease(seg(t, 49.05, 49.9)), sp = signP(t), hand = jointAt(sp, 'RHand', DESK.x, DESK.g, DESK.h);
	const sig = seg(t, 48.15, 49.0), pan = ease(seg(t, 47.2, 47.9)), hk = ease(seg(t, 47.75, 48.15)) * (1 - ease(seg(t, 49.0, 49.3)));
	const ch = Math.floor(TYPED.length * seg(t, 44.65, 45.55)), lines = Math.floor(12 * seg(t, 45.3, 47.3));
	const ps = 0.7, px = 1300, py = 700 - 150 * pan;   // right of the subtitle rows
	const cx = lerp(960 + 10 * (t - 44.5), 900 + 15 * (t - 49.05), back), cy = lerp(560 - 20 * Math.min(t - 44.5, 2.7), 560, back), z = lerp(1.04, (1.12 + 0.01 * (t - 49.05)) * 1.06, back);
	const glow = lerp(0.62, 0.32, sm(seg(t, 47.75, 48.6))), nib = sigAt(sig);
	/* on the desk: the page lies flat, its signature under his pen hand */
	const flatW = 170, flatH = 46, fx = hand[0] - 30, fy = 706 + 4;
	return <g>
		<Sky id="w1s" stops={[[0, '#1e2228'], [0.64, '#2a2a2c'], [0.65, '#1a1614'], [1, '#100c0a']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<g opacity={back}>
				<Win x={1240} y={160} w={360} h={420} id="w1win" sky={<g><rect x={1240} y={160} width={360} height={420} fill="#0e1626" /><Stars n={16} x={1240} y={170} w={360} h={260} seed={21} t={t} /><path d="M1240,520 Q1420,490 1600,510 L1600,580 L1240,580 Z" fill="#1a2a30" /></g>} />
				<Curtain x={1170} y={150} w={110} h={480} col="#2a201c" /><Curtain x={1560} y={150} w={110} h={480} col="#2a201c" flip />
				<Shelf x={140} y={300} w={520} kind="books" col="#16120f" tone="#241c16" seed={7} /><Shelf x={140} y={470} w={520} kind="books" col="#16120f" tone="#241c16" seed={8} />
				<Clock x={1130} y={330} r={30} t={t} />
				<Glow x={1180} y={600} r={560} c="#ffcf8a" o={0.3} id="w1l" />
				<Motes t={t} x={700} y={300} w={800} h={500} n={22} o={0.35} />
				<path d={`M${DESK.x - 10},706 L${DESK.x + 650},706 L${DESK.x + 630},690 L${DESK.x + 10},690 Z`} fill="#4a3826" />
				<rect x={DESK.x} y={706} width={640} height={18} fill="#3a2a1e" /><rect x={DESK.x + 30} y={724} width={16} height={190} fill="#3a2a1e" /><rect x={DESK.x + 600} y={724} width={16} height={190} fill="#3a2a1e" />
				<g transform="translate(1180,706)"><rect x={-8} y={-110} width={16} height={110} fill="#2a1e14" /><path d="M-70,-110 L70,-110 L44,-170 L-44,-170 Z" fill="#3a5a40" opacity={0.85} /><Glow x={0} y={-100} r={90} c="#fff0c8" o={0.8} id="w1b" /></g>
				<g transform="translate(1290,706)"><rect x={-40} y={-30} width={80} height={30} rx={4} fill="#1c1612" /><rect x={-30} y={-46} width={60} height={18} rx={3} fill="#241c16" /></g>
				{/* the letter, flat on the desk top */}
				<path d={`M${fx - flatW / 2},${fy - 2} L${fx + flatW / 2 - 14},${fy - 2} L${fx + flatW / 2},${fy - 2 - flatH * 0.3} L${fx - flatW / 2 + 14},${fy - 2 - flatH * 0.3} Z`} fill="#f0eadc" opacity={0.95} />
				{Array.from({length: 4}, (_, i) => <rect key={i} x={fx - flatW / 2 + 22} y={fy - 4 - flatH * 0.3 + 2 + i * 2.6} width={100 - 14 * i} height={1.2} fill="#5a5448" opacity={0.6} />)}
				<Carrier x={DESK.x} g={DESK.g} h={DESK.h} pose={sp} look={LK.einOld} id="w1c" glow={glow} />
				{/* the pen in his hand, nib on the page */}
				<path d={`M${hand[0] + 16},${hand[1] - 22} L${hand[0] + 30},${fy - 6}`} stroke="#0e0a08" strokeWidth={5} strokeLinecap="round" />
				<g fill="#0a0808"><rect x={-300} y={912} width={2600} height={300} /><path d="M1880,200 L2300,200 L2300,1200 L1820,1200 Z" /></g>
			</g>
			{/* the insert: the flat page from above */}
			{back < 1 && <g opacity={1 - back}>
				<rect x={-400} y={-300} width={2800} height={1700} fill="#3a2a1e" />
				{Array.from({length: 9}, (_, i) => <rect key={i} x={-400} y={-300 + i * 190} width={2800} height={3} fill="#2e2016" opacity={0.6} />)}
				<g transform={`translate(${px},${py}) scale(${ps})`}>
					<rect x={-430} y={-560} width={860} height={1180} fill="#f0eadc" stroke="#9a907c" strokeWidth={2 / ps} />
					<defs><radialGradient id="w1pg" cx="0.75" cy="0.2" r="1"><stop offset="0" stopColor="#ffcf8a" stopOpacity="0.16" /><stop offset="1" stopColor="#2a1a10" stopOpacity="0.4" /></radialGradient></defs>
					<rect x={-430} y={-560} width={860} height={1180} fill="url(#w1pg)" />
					<text x={360} y={-430} textAnchor="end" style={txt(MONO, 44, 700)} fill="#2a2420">{TYPED.slice(0, ch)}{ch < TYPED.length && t > 44.6 && Math.floor(t * 4) % 2 === 0 ? '▌' : ''}</text>
					<text x={-360} y={-330} style={txt(MONO, 36, 400)} fill="#2a2420" opacity={sm(seg(t, 45.0, 45.2))}>F.D. Roosevelt,</text>
					<text x={-360} y={-290} style={txt(MONO, 36, 400)} fill="#2a2420" opacity={sm(seg(t, 45.1, 45.3))}>President of the United States,</text>
					<text x={-360} y={-220} style={txt(MONO, 36, 400)} fill="#2a2420" opacity={sm(seg(t, 45.25, 45.4))}>Sir:</text>
					{Array.from({length: 12}, (_, i) => i < lines ? <rect key={i} x={-360 + (i % 4 === 0 ? 50 : 0)} y={-176 + i * 40} width={i % 4 === 3 ? 380 : 700 - (i % 4 === 0 ? 50 : 0) - 30 * rnd(i, 2)} height={10} fill="#5a5448" opacity={0.7} /> : null)}
					<text x={120} y={430} style={txt(MONO, 30, 400)} fill="#2a2420" opacity={sm(seg(t, 47.2, 47.5))}>Yours very truly,</text>
					<path d={Array.from({length: 41}, (_, i) => { const p = sigAt(i / 40 * sig); return `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`; }).join(' ')} stroke="#1a1612" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={sig > 0 ? 1 : 0} />
					{/* his hand and pen enter from the lower right; the nib rides the signature */}
					{hk > 0.01 && <g transform={`translate(${lerp(nib[0] + 420, nib[0], hk)},${lerp(nib[1] + 520, nib[1], hk)})`}>
						{/* sleeve and shirt cuff from the lower right, the back of the hand, index finger along the pen, thumb opposite */}
						<path d="M150,250 L250,190 L520,620 L380,700 Z" fill="#17110f" />
						<path d="M150,250 L250,190 L272,226 L172,286 Z" fill="#d8d0c0" opacity={0.85} />
						<path d="M70,128 Q60,170 96,212 Q140,256 196,236 Q248,214 236,170 Q222,126 176,104 Q120,82 70,128 Z" fill="#1d1512" />
						<path d="M70,128 Q60,170 96,212 Q140,256 196,236" stroke={RIMB} strokeWidth={3} fill="none" opacity={0.45} />
						<path d="M0,0 L170,216" stroke="#0e0a08" strokeWidth={13} strokeLinecap="round" /><path d="M0,0 L20,25" stroke="#c8b070" strokeWidth={6} strokeLinecap="round" />
						<path d="M30,46 Q24,36 34,30 Q44,28 50,38 L104,112 L80,126 Z" fill="#1d1512" stroke="#4a3a32" strokeWidth={2} />
						<path d="M46,72 Q36,66 40,56 Q50,50 60,58 L120,134 L98,146 Z" fill="#1d1512" stroke="#4a3a32" strokeWidth={2} />
						<path d="M150,108 Q148,96 158,92 Q168,92 172,102" stroke="#4a3a32" strokeWidth={2} fill="none" />
						<path d="M110,110 Q120,104 130,112 M140,128 Q150,122 160,130" stroke="#4a3a32" strokeWidth={2} fill="none" opacity={0.8} />
					</g>}
				</g>
			</g>}
		</Cam>
	</g>;
};

/* ================= W3 50.75–54.25: years later, at a window; the letter's ghost in the glass ================= */
const Regret: React.FC<{t: number}> = ({t}) => {
	const u = t - 50.75, z = (1.06 + 0.06 * ease(seg(u, 0, 3.5))) * 1.06, cx = 1000 + 30 * u, cy = 520, ghost = sm(seg(t, 51.5, 52.6)), droop = ease(seg(t, 52.7, 53.5));
	const pose = fkPose({...STAND, lean: 5 + 4 * droop, neck: 4 + 18 * droop, la: 30, le: 100, ra: 34, re: 96});
	return <g>
		<Sky id="w3s" stops={[[0, '#181c22'], [0.66, '#20242a'], [0.67, '#14120f'], [1, '#0e0c0a']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<Wallpaper id="w3w" x={-300} y={-200} w={2600} h={900} col="#2c2a2c" o={0.5} s={1.6} />
			<rect x={-300} y={700} width={2600} height={500} fill="#141210" />
			<Win x={1000} y={130} w={520} h={540} id="w3win" frame="#0e0c0a" sky={<g>
				<Sky id="w3ws" x={1000} y={130} w={520} h={540} stops={[[0, '#1a2434'], [0.7, '#3a4048'], [1, '#4a4a4a']]} />
				<Stars n={18} x={1000} y={140} w={520} h={260} seed={31} t={t} o={0.6} />
				{/* bare branches, no city */}
				<g stroke="#0c0e12" fill="none" strokeLinecap="round"><path d="M1560,690 Q1450,520 1380,380 M1450,520 Q1360,470 1290,480 M1410,440 Q1460,360 1440,280 M1380,380 Q1330,300 1250,270" strokeWidth={10} /><path d="M1290,480 l-50,-10 M1250,270 l-30,-30 M1440,280 l10,-40 M1330,330 l-40,-6" strokeWidth={4} /></g>
				{/* the letter's ghost in the glass */}
				<g opacity={0.22 * ghost} transform="translate(1150,250) rotate(-3)"><rect x={0} y={0} width={190} height={250} fill="none" stroke="#e8e4d8" strokeWidth={2} />
					<text x={176} y={26} textAnchor="end" style={txt(MONO, 13, 400)} fill="#e8e4d8">August 2nd, 1939</text>{Array.from({length: 9}, (_, i) => <rect key={i} x={16} y={50 + i * 18} width={150 - (i % 3) * 20} height={3} fill="#e8e4d8" />)}
					<path d="M110,220 c10,-14 18,6 26,-6 s16,-10 22,4" stroke="#e8e4d8" strokeWidth={2} fill="none" /></g>
			</g>} />
			<Shaft id="w3sh" a={[1000, 670]} b={[1520, 670]} c={[1300, 1100]} d={[500, 1100]} col="#c8d0e0" o={0.05} />
			<Curtain x={930} y={120} w={110} h={600} col="#24201e" />
			<Shelf x={60} y={330} w={600} kind="books" col="#110e0c" tone="#1e1a16" seed={12} /><Shelf x={60} y={500} w={600} kind="books" col="#110e0c" tone="#1e1a16" seed={13} />
			<Frame x={700} y={220} w={140} h={180} col="#1a1412" oval />
			<g transform="translate(560,720)"><rect x={-110} y={0} width={220} height={12} fill="#241a14" /><rect x={-96} y={12} width={10} height={200} fill="#241a14" /><rect x={86} y={12} width={10} height={200} fill="#241a14" /><path d="M-30,0 L-20,-70 L20,-70 L30,0 Z" fill="#2a2420" /><path d="M-50,-70 L50,-70 L36,-110 L-36,-110 Z" fill="#3a3a30" /></g>
			<Motes t={t} x={900} y={250} w={700} h={500} n={18} o={0.3} col="#e0e6f0" />
			<Carrier x={880} g={980} h={700} pose={pose} look={LK.einOld} id="w3c" glow={lerp(0.4, 0.3, droop)} rimOp={0.45} />
			<g fill="#080706"><rect x={-300} y={980} width={2600} height={200} /><path d="M-300,-200 L-120,-200 L-160,1200 L-300,1200 Z" /></g>
		</Cam>
	</g>;
};

/* ================= S1–D2 54.25–66.0: the hospital at night; he declines; the stop; 你没有 ================= */
const D1 = 60.5, D2 = 63.0;
const Hospital: React.FC<{t: number}> = ({t}) => {
	const tf = t < D1 ? t : t < D2 ? D1 : D1 + (t - D2), live = t >= D2;   // the clock of the room stops at D1, the camera too; it resumes at D2
	const grey = sm(seg(t, D1, D1 + 0.35)), after = sm(seg(t, D2, D2 + 0.5)), pulse = t >= D2 ? Math.exp(-(t - D2) / 0.5) : 0;
	const pale = sm(seg(Math.min(t, D1), 57.0, 60.5));
	const shake = (Math.sin((Math.min(t, D1) - 57.4) * 9) * 5) * seg(Math.min(t, D1), 57.4, 57.6) * (1 - seg(Math.min(t, D1), 58.4, 58.9));
	const urge = Math.min(t, D1), docP = fkPose({...STAND, lean: lerp(10, 4, seg(urge, 57.4, 58.4)), neck: 10, la: 10, le: 20,
		ra: lerp(lerp(20, 60 + 10 * Math.sin(urge * 4), sm(seg(urge, 54.5, 54.9))), 10, sm(seg(urge, 57.3, 58.0))), re: lerp(40, 20, sm(seg(urge, 57.3, 58.0)))});
	const u = tf - 54.25;
	let cx = 880 + 20 * u, cy = 560, z = (1.05 + 0.02 * u) * 1.06;
	const push = ease(seg(tf, 57.0, 60.5)); cx = lerp(cx, 760, push); cy = lerp(cy, 640, push); z = lerp(z, 1.3, push);
	if (live) { const k = ease(seg(t, D2, D2 + 3)); cx = lerp(cx, 520, k); cy = lerp(cy, 690, k); z = lerp(z, 1.75, k); }
	const HEAD: P2 = [470, 702], gl = 0.62 + 0.08 * Math.sin(t * 2.2) + 0.7 * pulse;
	const bodyC = grey > 0 ? '#3e444c' : '#14181e';
	return <g>
		<Sky id="h1s" stops={[[0, '#121a24'], [0.7, '#1a2430'], [0.71, '#12161c'], [1, '#0c1014']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<rect x={-400} y={-200} width={2800} height={900} fill="#1a2028" opacity={0.6} />
			{Array.from({length: 10}, (_, i) => <rect key={i} x={-300 + i * 260} y={-200} width={3} height={900} fill="#2a323c" opacity={0.6} />)}
			<Win x={1180} y={170} w={420} h={520} id="h1win" frame="#0a0c10" sky={<g>
				<rect x={1180} y={170} width={420} height={520} fill="#0a1222" />
				<rect x={1180} y={170} width={420} height={520} fill="#7a8ea4" opacity={0.42 * pale} />
				<Stars n={30} x={1190} y={180} w={400} h={380} seed={41} t={tf} o={1 - 0.6 * pale} />
				<circle cx={1290} cy={400} r={34} fill="#e8e4d6" opacity={0.9} /><Glow x={1290} y={400} r={150} c="#e8eaf4" o={0.25} id="h1m" />
				<path d="M1180,600 Q1300,570 1400,590 Q1500,600 1600,575 L1600,690 L1180,690 Z" fill="#0c1018" />
			</g>} />
			<path d="M1180,690 L1600,690 L1760,1080 L1000,1080 Z" fill="#c8d4e8" opacity={0.05 + 0.04 * pale} />
			<Clock x={1040} y={250} r={30} t={tf} />
			<g transform="translate(1720,560)"><rect x={-60} y={0} width={120} height={360} fill="#1a2028" /><rect x={-50} y={20} width={100} height={60} fill="#222a34" /><rect x={-40} y={-80} width={10} height={80} fill="#1a2028" /><path d="M-35,-80 Q0,-150 40,-100" stroke="#1a2028" strokeWidth={6} fill="none" /></g>
			{/* the drip stand */}
			<g transform="translate(240,930)"><rect x={-4} y={-480} width={8} height={480} fill="#1a2028" /><rect x={-50} y={-480} width={100} height={8} fill="#1a2028" /><rect x={-30} y={-470} width={30} height={60} rx={8} fill="#8a9aaa" opacity={0.35} /><rect x={-40} y={-4} width={80} height={8} fill="#1a2028" /></g>
			<Motes t={tf} x={300} y={250} w={1200} h={600} n={26} o={0.28} col="#dfe6f0" />
			{/* the doctor, beside the foot of the bed, facing the patient (final pass, logic 5) */}
			<g opacity={(1 - 0.5 * grey) * (1 - after)}><Rimmed x={1250} ground={960} h={640} pose={docP} look={LK.doctor} flip col={grey > 0 ? '#2a3038' : '#10141a'} rim="#c8d4e8" rimOp={0.35 * (1 - grey)} rimDx={2.4} /></g>
			{/* the bed; he lies under the sheet; 你, a light that does not go out */}
			<rect x={360} y={760} width={760} height={40} rx={10} fill="#2a3240" /><rect x={380} y={800} width={16} height={130} fill="#1a2028" /><rect x={1090} y={800} width={16} height={130} fill="#1a2028" />
			<rect x={340} y={640} width={26} height={290} rx={6} fill="#1a2028" />
			<rect x={380} y={712} width={170} height={56} rx={24} fill="#b8c2d0" opacity={0.55} />
			<g opacity={1 - 0.7 * after}>
				<g transform={`rotate(${shake} ${HEAD[0] + 20} ${HEAD[1] + 30})`}>
					<ellipse cx={HEAD[0]} cy={HEAD[1]} rx={52} ry={44} fill={bodyC} />
					{Array.from({length: 7}, (_, i) => <circle key={i} cx={HEAD[0] - 50 + 10 * Math.cos(i)} cy={HEAD[1] - 30 + i * 9} r={16 + 4 * rnd(i, 3)} fill={bodyC} />)}
					<path d={`M${HEAD[0] + 44},${HEAD[1] - 20} q14,10 10,24 q-4,6 4,10 q-6,8 -14,10`} fill={bodyC} />
					<path d={`M${HEAD[0] - 20},${HEAD[1] - 44} Q${HEAD[0] + 30},${HEAD[1] - 52} ${HEAD[0] + 50},${HEAD[1] - 16}`} stroke={RIMB} strokeWidth={3} fill="none" opacity={0.6 * (1 - grey)} />
				</g>
				<path d="M470,752 Q510,688 600,690 Q680,676 760,698 Q840,688 900,700 Q960,682 1010,694 Q1050,664 1080,684 Q1110,700 1120,722 L1120,800 L440,800 Z" fill={grey > 0 ? '#6a7480' : '#9aa6b8'} opacity={0.6} />
				<path d="M510,688 Q600,676 680,684 Q760,696 840,690 Q960,682 1010,694 Q1050,664 1080,684" stroke="#dfe6f0" strokeWidth={3} fill="none" opacity={0.35 * (1 - grey)} />
			</g>
			<rect x={-400} y={-300} width={2800} height={1600} fill="#05070a" opacity={0.5 * after} />
			<HeadGlow x={HEAD[0] - 20} y={HEAD[1] - 4} r={30 * (1 + 0.5 * pulse)} id="h1g" o={cl(gl, 0, 1.3)} />
			{live && <Motes t={t} x={300} y={500} w={500} h={300} n={14} o={0.5 * after} col={B.mid} seed={3} />}
		</Cam>
	</g>;
};

/* ================= A1 66.0–69.5: a corridor; the door closes, its lamp goes out; Harvey comes out with you ================= */
const Door: React.FC<{t: number}> = ({t}) => {
	const u = t - 66.0, lampOff = t >= 67.0 ? 1 : 0, reopen = ease(seg(t, 67.45, 67.75)), gap = reopen * 0.85;
	const wx = lerp(960, 1500, seg(t, 67.55, 69.7)), ph = (t - 67.55) * 7.2, wp = walkP(ph, {la: 54, le: 70, ra: 58, re: 66}, 4), wv = t >= 67.5, wIn = sm(seg(t, 67.5, 67.85));   // he steps out of the lit doorway
	const hand = jointAt(wp, 'RHand', wx, 930, 620), jar: P2 = [hand[0] + 6, hand[1] - 6];
	const cx = lerp(930, wx - 80, ease(seg(t, 67.6, 69.4))) + 10 * u, cy = 540, z = lerp(1.18, 1.1, ease(seg(u, 0, 3.5))) * 1.04;
	const clockA = 36 * 60 * ease(seg(t, 66.6, 67.4));
	return <g>
		<Sky id="a1s" stops={[[0, '#1c2226'], [0.7, '#262c30'], [0.71, '#161a1c'], [1, '#0e1012']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<rect x={-400} y={-200} width={2900} height={900} fill="#2a3034" /><rect x={-400} y={520} width={2900} height={180} fill="#232a2e" /><rect x={-400} y={514} width={2900} height={8} fill="#1a1e20" />
			{Array.from({length: 6}, (_, i) => { const x = -200 + i * 480; return <g key={i}><rect x={x - 60} y={-10} width={120} height={14} fill="#c8d0d0" opacity={0.6} /><path d={`M${x - 60},4 L${x + 60},4 L${x + 220},700 L${x - 220},700 Z`} fill="#e8f0f0" opacity={0.035} /></g>; })}
			<rect x={-400} y={700} width={2900} height={500} fill="#1a1e20" />{Array.from({length: 14}, (_, i) => <path key={i} d={`M${-400 + i * 220},700 L${-600 + i * 260},1200`} stroke="#14181a" strokeWidth={3} />)}
			<Clock x={600} y={260} r={32} t={0} />
			<g transform="translate(600,260)"><line x1={0} y1={0} x2={0} y2={-24} stroke="#262422" strokeWidth={5} transform={`rotate(${30 + clockA / 12})`} /></g>
			{/* a bench, a notice board */}
			<g transform="translate(260,700)" fill="#121618"><rect x={-120} y={-80} width={240} height={14} /><rect x={-110} y={-66} width={10} height={66} /><rect x={100} y={-66} width={10} height={66} /></g>
			<rect x={1360} y={280} width={200} height={150} fill="#3a4044" /><rect x={1376} y={296} width={60} height={70} fill="#c8c2b4" opacity={0.35} /><rect x={1450} y={300} width={90} height={40} fill="#c8c2b4" opacity={0.3} />
			{/* the door */}
			<g transform="translate(860,220)">
				<rect x={-16} y={-16} width={252} height={512} fill="#14181a" />
				<rect x={0} y={0} width={220} height={480} fill="#e8ecdc" opacity={0.9 * gap} />
				<Glow x={110} y={300} r={300} c="#e8f0e0" o={0.25 * gap} id="a1in" />
				<g transform={`translate(${220 * gap},0)`}><rect x={0} y={0} width={220 * (1 - gap) + 0.01} height={480} fill="#3a4246" /><rect x={30 * (1 - gap)} y={50} width={160 * (1 - gap) + 0.01} height={130} fill="#a8b4b0" opacity={0.55} />
					{gap < 0.3 && <text x={110 * (1 - gap)} y={124} textAnchor="middle" style={txt(SERIF, 17, 700, {letterSpacing: '0.04em'})} fill="#2a3034" textLength={130 * (1 - gap)} lengthAdjust="spacingAndGlyphs">PATHOLOGY</text>}
					<circle cx={190 * (1 - gap)} cy={270} r={7} fill="#8a8e88" /></g>
				<g transform="translate(110,-60)"><rect x={-40} y={-18} width={80} height={30} rx={6} fill="#1a1e20" /><rect x={-32} y={-12} width={64} height={18} rx={4} fill={lampOff ? '#3a3e3a' : '#fff0d0'} />{!lampOff && <Glow x={0} y={-2} r={120} c="#fff0d0" o={0.5} id="a1lamp" />}</g>
			</g>
			<path d={`M860,700 L${860 + 220 * gap},700 L${960 + 300 * gap},1100 L760,1100 Z`} fill="#e8f0e0" opacity={0.08 * gap} />
			<Motes t={t} x={500} y={300} w={1200} h={500} n={22} o={0.3} col="#e0e8e8" />
			{wv && <g opacity={wIn}>
				<Rimmed x={wx} ground={930} h={620} pose={wp} look={LK.harvey} col="#101416" rim="#ffd8c0" rimOp={0.55} rimDx={-2.4} />
				<Glow x={jar[0]} y={jar[1] - 40} r={220} c={B.halo} o={0.45} id="a1jg" />
				<g transform={`translate(${jar[0]},${jar[1]})`}><rect x={-34} y={-82} width={68} height={86} rx={12} fill="#cfe2e6" opacity={0.22} stroke="#e8f2f4" strokeWidth={2} strokeOpacity={0.6} /><rect x={-28} y={-94} width={56} height={14} rx={3} fill="#8a8e94" /></g>
				<g transform={`translate(${jar[0]},${jar[1] - 40}) scale(0.085)`}><path d={BRAIN_D} fill={B.mid} opacity={0.7} /><path d={BRAIN_D} fill="none" stroke={B.core} strokeWidth={16} /></g>
				<Glow x={jar[0]} y={jar[1] - 40} r={50} c={B.core} o={0.7} id="a1jc" />
			</g>}
			<g fill="#090b0c"><path d="M-400,1080 L-400,860 Q-300,830 -200,860 L-180,1080 Z" /></g>
		</Cam>
	</g>;
};

/* ================= A2/A3 69.5–75.75: the form; the family line is blank; later, the son signs: 只许用于科学 =================
   final pass (director note 3, logic 3): the form is a real-size sheet lying flat on the desk. Two inserts look straight down at it
   (its top always below y = 340 on screen, clear of the subtitles); between them a wide shot finds the son leaning over the desk,
   a normal pen in his hand, its nib on the Family line. */
const FORM: P2 = [900, 560];
const FormSheet: React.FC<{t: number; sig: number; stamp: number; blink: number}> = ({t, sig, stamp, blink}) => <g transform={`translate(${FORM[0]},${FORM[1]}) rotate(-2)`}>
	<rect x={-236} y={-294} width={472} height={540} fill="#000" opacity={0.25} />
	<rect x={-230} y={-300} width={460} height={540} fill="#ece6d6" stroke="#8a8070" strokeWidth={1.5} />
	<text x={0} y={-238} textAnchor="middle" style={txt(SERIF, 34, 700, {letterSpacing: '0.24em'})} fill="#2a2420">CONSENT</text>
	<rect x={-150} y={-218} width={300} height={2} fill="#2a2420" />
	<text x={-190} y={-180} style={txt(MONO, 15, 400)} fill="#5a5448">1955</text>
	{Array.from({length: 7}, (_, i) => <rect key={i} x={-190} y={-150 + i * 26} width={360 - (i % 3) * 50} height={6} fill="#8a8274" />)}
	<text x={-190} y={150} style={txt(SERIF, 22, 700)} fill="#2a2420">Family:</text>
	<rect x={-90} y={148} width={270} height={2.5} fill="#2a2420" />
	{t < 72.2 && <rect x={-96} y={110} width={282} height={50} rx={4} fill="none" stroke="#3a3430" strokeWidth={2.5} strokeDasharray="8 7" opacity={0.75 * blink * sm(seg(t, 70.0, 70.4))} />}
	<path d="M-60,140 C-40,110 -20,150 0,124 S40,110 56,140 S100,116 126,136 L170,130" stroke="#1a1a3a" strokeWidth={3.5} fill="none" pathLength={1} strokeDasharray={`${sig} 1`} strokeLinecap="round" />
	{stamp > 0 && <g transform={`translate(20,10) rotate(-7) scale(${lerp(1.5, 1, ei(stamp))})`} opacity={0.85 * stamp}>
		<rect x={-170} y={-44} width={340} height={88} rx={6} fill="none" stroke="#2c3550" strokeWidth={6} /><rect x={-160} y={-34} width={320} height={68} rx={4} fill="none" stroke="#2c3550" strokeWidth={2} />
		<text x={0} y={16} textAnchor="middle" style={txt(SANS, 46, 900, {letterSpacing: '0.1em'})} fill="#2c3550">只许用于科学</text></g>}
</g>;
const sonP = fkPose({...STAND, lean: 40, neck: 22, la: 10, le: 20, ra: 8, re: 12});
const Form: React.FC<{t: number}> = ({t}) => {
	const later = sm(seg(t, 72.1, 72.6)), wide = sm(seg(t, 72.15, 72.4)) * (1 - sm(seg(t, 73.75, 73.95)));
	const sig = seg(t, 72.85, 73.6), stamp = seg(t, 74.05, 74.2), slam = t >= 74.12 ? Math.exp(-(t - 74.12) / 0.1) : 0, blink = 0.5 + 0.5 * Math.sin(t * 6);
	const u = t - 69.5, ins2 = t >= 73.8;
	/* the inserts: straight down on the sheet; top edge at screen y ≥ 340 */
	const iz = ins2 ? 1.28 + 0.01 * (t - 73.8) : 1.3 + 0.02 * u, icx = FORM[0] + 40 + (ins2 ? 6 : 10 * u) + 6 * slam * Math.sin(t * 90), icy = ins2 ? 380 : 420 - 4 * u;
	/* the wide: the son leaning over the desk */
	const wcx = 1000 + 10 * (t - 72.2), wcy = 600, wz = 1.18 * 1.05;
	const SX = 1150, SG = 990, hand = jointAt(sonP, 'RHand', SX, SG, 660, true), nib: P2 = [hand[0] - 14 + 14 * Math.sin(sig * 30) * (sig > 0 && sig < 1 ? 1 : 0), 744];
	return <g>
		<Sky id="a2s" stops={[[0, '#262624'], [0.66, '#30302c'], [0.67, '#1e1c18'], [1, '#141210']]} />
		{wide < 1 && <g opacity={1 - wide}>
			<Cam cx={icx} cy={icy} z={iz}>
				<rect x={-300} y={-300} width={2600} height={1800} fill="#3e3226" />
				{Array.from({length: 10}, (_, i) => <rect key={i} x={-300} y={-300 + i * 170} width={2600} height={3} fill="#2e241a" opacity={0.7} />)}
				<Glow x={520} y={300} r={700} c="#fff0c8" o={0.18 + 0.08 * later} id="a2il" />
				<FormSheet t={t} sig={ins2 ? 1 : 0} stamp={stamp} blink={blink} />
				{/* the fountain pen resting by the sheet (A2: nobody has signed) */}
				{!ins2 && <g transform="translate(1260,700) rotate(-28)"><rect x={-90} y={-7} width={180} height={14} rx={7} fill="#141414" /><path d="M90,-7 L122,0 L90,7 Z" fill="#c8b070" /></g>}
			</Cam>
		</g>}
		{wide > 0 && <g opacity={wide}>
			<rect width={W} height={H} fill="#e8d8b8" opacity={0.06 * later} />
			<Cam cx={wcx} cy={wcy} z={wz}>
				<rect x={-300} y={-200} width={2600} height={940} fill="#2c2c28" />
				<Win x={1380} y={120} w={300} h={360} id="a2win" frame="#1a1a16" sky={<rect x={1380} y={120} width={300} height={360} fill="#7a8a90" />} />
				<Shelf x={180} y={300} w={560} kind="files" col="#1a1a16" tone="#262420" seed={21} /><Shelf x={180} y={450} w={560} kind="files" col="#1a1a16" tone="#262420" seed={22} />
				<Clock x={1180} y={200} r={30} t={t * 40} />
				<Motes t={t} x={500} y={250} w={1100} h={500} n={22} o={0.3} />
				<rect x={-300} y={740} width={2600} height={500} fill="#1e1c18" />
				<path d="M300,780 L1600,780 L1550,720 L350,720 Z" fill="#3e3226" /><rect x={300} y={780} width={1300} height={22} fill="#2e241a" /><rect x={340} y={802} width={16} height={190} fill="#221a12" /><rect x={1540} y={802} width={16} height={190} fill="#221a12" />
				<g transform="translate(520,720)"><rect x={-6} y={-140} width={12} height={140} fill="#221a12" /><path d="M-56,-140 L56,-140 L38,-190 L-38,-190 Z" fill="#3a4038" /><Glow x={0} y={-120} r={300} c="#fff0c8" o={0.42} id="a2l" /></g>
				<g transform="translate(1440,750)"><Glow x={0} y={-70} r={200} c={B.halo} o={0.4} id="a2jg" /><rect x={-40} y={-120} width={80} height={120} rx={12} fill="#cfe2e6" opacity={0.2} stroke="#e8f2f4" strokeWidth={2} strokeOpacity={0.55} /><rect x={-34} y={-134} width={68} height={16} rx={3} fill="#8a8e94" />
					<g transform="translate(0,-60) scale(0.1)"><path d={BRAIN_D} fill={B.mid} opacity={0.7} /><path d={BRAIN_D} fill="none" stroke={B.core} strokeWidth={14} /></g><Glow x={0} y={-60} r={50} c={B.core} o={0.6} id="a2jc" /></g>
				{/* the sheet, flat on the desk top (real size), the Family line under his nib */}
				<path d={`M${nib[0] - 70},${nib[1] + 10} L${nib[0] + 60},${nib[1] + 10} L${nib[0] + 52},${nib[1] - 22} L${nib[0] - 62},${nib[1] - 22} Z`} fill="#ece6d6" />
				<rect x={nib[0] - 40} y={nib[1] - 1} width={80} height={1.6} fill="#2a2420" />
				{Array.from({length: 4}, (_, i) => <rect key={i} x={nib[0] - 52} y={nib[1] - 18 + i * 4} width={96 - 8 * i} height={1.2} fill="#8a8274" />)}
				<Rimmed x={SX} ground={SG} h={660} pose={sonP} look={LK.son} flip col="#121212" rim={RIMB} rimOp={0.4} rimDx={2.4} />
				<path d={`M${hand[0] + 4},${hand[1] + 20} L${nib[0]},${nib[1]}`} stroke="#0c0a08" strokeWidth={5} strokeLinecap="round" />
				<g fill="#090908"><rect x={-300} y={1000} width={2600} height={300} /></g>
			</Cam>
		</g>}
	</g>;
};

/* ================= A4 75.75–79.25: the ashes go into an open, unplaced sky; you are not in them ================= */
/** the open sky (no sun, no horizon, no marker). Exported so RoughB's T1 can match on it (ash = 0). */
export const AshSky: React.FC<{t: number; ash?: number; x?: number; y?: number; w?: number; h?: number; id?: string}> = ({t, ash = 1, x = 0, y = 0, w = W, h = H, id = 'ash'}) => {
	const sx = w / W, sy = h / H;
	return <g transform={`translate(${x},${y}) scale(${sx},${sy})`}>
		<Sky id={`${id}s`} stops={[[0, '#2c3846'], [0.45, '#56626e'], [0.8, '#8a8c90'], [1, '#a29a94']]} />
		<Glow x={1300} y={700} r={900} c="#e8dccc" o={0.18} id={`${id}h`} />
		{[[200, 240, 1.6, 0.4], [900, 160, 2.2, 0.35], [1600, 300, 1.4, 0.4], [500, 560, 2.6, 0.3], [1350, 640, 2.0, 0.3], [-100, 820, 2.4, 0.28], [1800, 900, 2.0, 0.26]].map(([cx0, cy0, s, o], i) =>
			<Cloud key={i} x={((cx0 + t * (14 + 6 * i)) % 2400) - 240} y={cy0} s={s} col={i < 3 ? '#6a7480' : '#9a9a9c'} o={o} />)}
		{ash > 0 && Array.from({length: 140}, (_, i) => { const a = 75.9 + 0.9 * rnd(i, 51), k = seg(t, a, a + 2.6 + rnd(i, 52)), px = 760 + 260 * (rnd(i, 53) - 0.5) + k * (500 + 700 * rnd(i, 54)) + 40 * Math.sin(t * 1.5 + i), py = 1120 - k * (700 + 500 * rnd(i, 55));
			return k > 0 && k < 1 ? <circle key={i} cx={px} cy={py} r={(1.5 + 3 * rnd(i, 56)) * (1 + 1.5 * k)} fill="#d8d4ce" opacity={ash * 0.65 * (1 - k) * Math.min(1, k * 8)} /> : null; })}
	</g>; };
const WIN_A = {x: 640, y: 160, w: 640, h: 360};
const Ashes: React.FC<{t: number}> = ({t}) => {
	const out = ease(seg(t, 77.4, 78.7)), zIn = WIN_A.w / W * 0.0 + W / WIN_A.w, wc: P2 = [WIN_A.x + WIN_A.w / 2, WIN_A.y + WIN_A.h / 2];
	const cx = lerp(wc[0], 1060 + 30 * (t - 78), out), cy = lerp(wc[1] - 6 * (t - 75.75), 520, out), z = lerp(zIn * (1.04 - 0.01 * (t - 75.75)), 1.12, out);
	return <g>
		<Sky id="a4s" stops={[[0, '#1a1e22'], [1, '#101214']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<rect x={-300} y={-200} width={2600} height={940} fill="#22262a" /><rect x={-300} y={740} width={2600} height={500} fill="#141618" />
			<defs><clipPath id="a4wc"><rect x={WIN_A.x} y={WIN_A.y} width={WIN_A.w} height={WIN_A.h} /></clipPath></defs>
			<g clipPath="url(#a4wc)"><AshSky t={t} x={WIN_A.x} y={WIN_A.y} w={WIN_A.w} h={WIN_A.h} id="a4a" /></g>
			<rect x={WIN_A.x} y={WIN_A.y} width={WIN_A.w} height={WIN_A.h} fill="none" stroke="#0e1012" strokeWidth={14} />
			<path d={`M${WIN_A.x},${WIN_A.y + WIN_A.h} L${WIN_A.x + WIN_A.w},${WIN_A.y + WIN_A.h} L${WIN_A.x + WIN_A.w + 240},1080 L${WIN_A.x - 40},1080 Z`} fill="#dfe4e8" opacity={0.06} />
			{/* the shelf where you are */}
			<Shelf x={1440} y={420} w={420} kind="jars" col="#101214" tone="#262a2e" seed={31} /><Shelf x={60} y={420} w={480} kind="books" col="#101214" tone="#262a2e" seed={32} />
			<rect x={1380} y={640} width={520} height={14} fill="#2a2e32" />
			<g transform="translate(1600,640)"><Glow x={0} y={-80} r={260} c={B.halo} o={0.5} id="a4jg" /><rect x={-50} y={-150} width={100} height={150} rx={14} fill="#cfe2e6" opacity={0.2} stroke="#e8f2f4" strokeWidth={2.5} strokeOpacity={0.55} /><rect x={-42} y={-166} width={84} height={18} rx={4} fill="#8a8e94" />
				<g transform="translate(0,-74) scale(0.13)"><path d={BRAIN_D} fill={B.mid} opacity={0.7} /><path d={BRAIN_D} fill="none" stroke={B.core} strokeWidth={12} /></g><Glow x={0} y={-74} r={60} c={B.core} o={0.6 + 0.1 * Math.sin(t * 2)} id="a4jc" /></g>
			<Motes t={t} x={1300} y={300} w={500} h={400} n={14} o={0.4} col={B.mid} />
			<g fill="#08090a"><rect x={-300} y={980} width={2600} height={300} /></g>
		</Cam>
	</g>;
};

/* ================= A5 79.25–82.25: on the scale: about 1.2 kg, inside the ordinary band ================= */
const kgA = (kg: number) => -210 + 120 * kg;
const DIAL: P2 = [1230, 600], DR = 120;
const Scale: React.FC<{t: number}> = ({t}) => {
	const u = t - 79.25, settle = 1.23 + 0.55 * Math.exp(-Math.max(0, u - 0.6) / 0.35) * Math.cos(Math.max(0, u - 0.6) * 9), kg = u < 0.3 ? 0 : lerp(0, settle, ease(seg(u, 0.3, 0.6)));
	const push = ease(seg(u, 0.7, 2.0)), cx = lerp(980 + 15 * u, DIAL[0] - 110, push), cy = lerp(560, DIAL[1] + 30, push), z = (lerp(1.06, 1.6, push) + 0.01 * u) * 1.06;
	const band = sm(seg(u, 1.0, 1.4)), tag = sm(seg(u, 1.5, 1.9)), baby = Math.exp(-(((t - 81.15) / 0.18) ** 2));
	const hp = fkPose({...STAND, lean: 6, neck: 12, la: 50, le: 80, ra: 60, re: 70});
	const arc = (a0: number, a1: number, r0: number, r1: number) => { const p = (a: number, r: number) => `${Math.cos(a * Math.PI / 180) * r},${Math.sin(a * Math.PI / 180) * r}`; return `M${p(a0, r1)} A${r1},${r1} 0 0 1 ${p(a1, r1)} L${p(a1, r0)} A${r0},${r0} 0 0 0 ${p(a0, r0)} Z`; };
	return <g>
		<Sky id="a5s" stops={[[0, '#2a3034'], [0.66, '#384044'], [0.67, '#20262a'], [1, '#161a1c']]} />
		<Cam cx={cx} cy={cy} z={z}>
			{Array.from({length: 9}, (_, i) => <rect key={i} x={i * 240 - 100} y={-100} width={3} height={820} fill="#4a5458" opacity={0.5} />)}
			<Win x={300} y={140} w={280} h={300} id="a5win" frame="#1c2226" sky={<rect x={300} y={140} width={280} height={300} fill="#5a6a70" opacity={0.7} />} />
			<Shaft id="a5sh" a={[300, 440]} b={[580, 440]} c={[900, 1000]} d={[360, 1000]} col="#e8f0f0" o={0.07} />
			<Shelf x={1460} y={260} w={480} kind="jars" col="#14181a" tone="#30383c" seed={41} /><Shelf x={1460} y={420} w={480} kind="books" col="#14181a" tone="#30383c" seed={42} />
			<Pendant x={980} y={60} len={140} id="a5p" o={0.55} col="#e8f0ec" />
			<Motes t={t} x={500} y={300} w={1000} h={500} n={22} o={0.3} col="#e8eef0" />
			<rect x={620} y={720} width={860} height={20} fill="#4a5054" /><rect x={640} y={740} width={18} height={220} fill="#30363a" /><rect x={1442} y={740} width={18} height={220} fill="#30363a" />
			{/* the pan, the dome, you */}
			<g transform="translate(960,720)"><rect x={-120} y={-40} width={240} height={40} rx={8} fill="#6a7074" /><rect x={-150} y={-60 + 6 * Math.min(1, kg)} width={300} height={20} rx={8} fill="#8a9094" /></g>
			<g transform={`translate(960,${660 + 6 * Math.min(1, kg)})`}><path d="M-110,0 L-110,-200 Q-110,-224 -86,-232 L86,-232 Q110,-224 110,-200 L110,0 Z" fill="#cfe2e6" opacity={0.14} stroke="#e8f2f4" strokeWidth={3} strokeOpacity={0.55} /></g>
			<g transform={`translate(960,${560 + 6 * Math.min(1, kg)}) scale(0.3)`}><Glow x={0} y={0} r={520} c={B.halo} o={0.4} id="a5bh" /><path d={BRAIN_D} fill={B.mid} opacity={0.55} /><path d={BRAIN_D} fill="none" stroke={B.core} strokeWidth={8} /></g>
			<path d="M1060,700 L1140,680 L1160,640" stroke="#5a6064" strokeWidth={8} fill="none" />
			{/* the dial */}
			<g transform={`translate(${DIAL[0]},${DIAL[1]})`}>
				<circle r={DR + 12} fill="#3a4044" /><circle r={DR} fill="#e8e4d8" />
				<path d={arc(kgA(1.15), kgA(1.65), DR * 0.58, DR * 0.9)} fill="#9a8a70" opacity={0.5 * band} />
				{Array.from({length: 21}, (_, i) => { const a = kgA(i / 10) * Math.PI / 180, l = i % 5 ? 0.86 : 0.76; return <line key={i} x1={Math.cos(a) * DR * 0.94} y1={Math.sin(a) * DR * 0.94} x2={Math.cos(a) * DR * l} y2={Math.sin(a) * DR * l} stroke="#2a2a2a" strokeWidth={i % 5 ? 2 : 3.5} />; })}
				{[0, 1, 2].map((k) => { const a = kgA(k) * Math.PI / 180; return <text key={k} x={Math.cos(a) * DR * 0.6} y={Math.sin(a) * DR * 0.6 + 8} textAnchor="middle" style={txt("'DejaVu Sans',sans-serif", 22, 700)} fill="#2a2a2a">{k}</text>; })}
				<text x={0} y={DR * 0.5} textAnchor="middle" style={txt("'DejaVu Sans',sans-serif", 20, 700)} fill="#2a2a2a">kg</text>
				{/* the baby's big head flashes on the dial for one beat */}
				{baby > 0.02 && <g opacity={0.8 * baby} transform={`translate(${-6},${DR * 0.18}) scale(0.62)`}><path d="M-78,-44 L-50,-84 L10,-84 Q46,-76 50,-36 Q54,-14 44,4 Q36,22 10,26 L-56,26 L-84,-6 Z" fill="#3a2e28" stroke={RIMB} strokeWidth={3} /></g>}
				<line x1={0} y1={0} x2={Math.cos(kgA(kg) * Math.PI / 180) * DR * 0.86} y2={Math.sin(kgA(kg) * Math.PI / 180) * DR * 0.86} stroke="#1e1e1e" strokeWidth={5} strokeLinecap="round" /><circle r={10} fill="#2a2a2a" />
			</g>
			<rect x={DIAL[0] - 34} y={DIAL[1] + DR + 10} width={68} height={130} fill="#4a5054" />
			{/* labels */}
			<g opacity={band}><path d={`M${DIAL[0] + 80},${DIAL[1] - 50} L${DIAL[0] + 160},${DIAL[1] - 20} L${DIAL[0] + 180},${DIAL[1] - 20}`} stroke={INK} strokeWidth={2.5} fill="none" />
				<text x={DIAL[0] + 188} y={DIAL[1] - 10} style={txt(SANS, 30, 900)} fill={INK} stroke="rgba(12,8,5,0.6)" strokeWidth={5} paintOrder="stroke">普通人的范围</text></g>
			<g opacity={tag}><path d={`M${DIAL[0] - 10},${DIAL[1] - 40} L${DIAL[0] - 150},${DIAL[1] + 150} L${DIAL[0] - 190},${DIAL[1] + 150}`} stroke={ROSE} strokeWidth={2.5} fill="none" />
				<text x={DIAL[0] - 198} y={DIAL[1] + 160} textAnchor="end" style={txt(SANS, 32, 900)} fill={ROSE} stroke="rgba(12,8,5,0.6)" strokeWidth={5} paintOrder="stroke">约1.2公斤</text></g>
			<Rimmed x={250} ground={960} h={660} pose={hp} look={LK.harvey} col="#121616" rim={RIMB} rimOp={0.5} />
			{(() => { const hh = jointAt(hp, 'RHand', 250, 960, 660); return <g transform={`rotate(10 ${hh[0]} ${hh[1]})`}><rect x={hh[0] - 10} y={hh[1] - 74} width={72} height={96} fill="#e8e4d8" />{Array.from({length: 5}, (_, i) => <rect key={i} x={hh[0] - 2} y={hh[1] - 60 + i * 14} width={50} height={3} fill="#8a8274" />)}</g>; })()}
			<g fill="#0a0c0c"><rect x={-300} y={960} width={2600} height={300} /></g>
		</Cam>
	</g>;
};

/* ================= A6 82.25–85.75: the cold open's shot, paid off: a photo, then the grid, then numbered cubes ================= */
const Section: React.FC<{t: number}> = ({t}) => {
	const tc = Math.min(3.4, Math.max(0, t - 83.0) * 1.08), flash = t >= 82.5 ? Math.exp(-(t - 82.5) / 0.16) : 0, print = ease(seg(t, 82.6, 83.3));
	return <g>
		<ColdBrain t={tc} />
		{/* the Exakta on a tripod, foreground left */}
		<g transform={`translate(${lerp(170, 120, seg(t, 82.25, 85.75))},1000)`} fill="#080a0b">
			<path d="M0,0 L-70,140 M0,0 L60,140 M0,0 L0,150" stroke="#080a0b" strokeWidth={10} />
			<rect x={-70} y={-110} width={150} height={96} rx={10} /><rect x={60} y={-90} width={60} height={56} rx={8} /><rect x={-50} y={-130} width={60} height={24} rx={4} />
			<path d="M-80,-60 L-70,-60" stroke="#c8c2b4" strokeWidth={2} opacity={0.4} />
		</g>
		{flash > 0.01 && <><Glow x={290} y={900} r={340} c="#ffffff" o={0.85 * flash} id="a6f" /><circle cx={290} cy={900} r={26} fill="#fff" opacity={flash} /></>}
		{/* the black-and-white photo, pinned top-right: kept for later (the 2012 rep) */}
		{print > 0 && <g transform={`translate(${lerp(300, 1560, print)},${lerp(900, 330, print)}) rotate(${lerp(-30, 6, print)}) scale(${lerp(0.3, 1, print)})`}>
			<rect x={-150} y={-110} width={300} height={232} fill="#e8e6e0" /><rect x={-136} y={-96} width={272} height={180} fill="#3a3a3a" />
			<g transform="translate(0,-6) scale(0.34)"><path d={BRAIN_D} fill="#8a8a8a" /><path d={BRAIN_D} fill="none" stroke="#d8d8d8" strokeWidth={9} />{['M-220,-40 C-160,-90 -100,-60 -60,-110', 'M-40,-160 C0,-110 60,-150 110,-120', 'M140,-60 C180,-20 230,-60 250,0', 'M-200,60 C-140,30 -90,80 -30,50', 'M20,40 C70,0 120,60 170,30'].map((d, i) => <path key={i} d={d} stroke="#c8c8c8" strokeWidth={7} fill="none" />)}</g>
			<text x={-130} y={110} style={txt(MONO, 14, 400)} fill="#5a5a5a">1955</text>
			<circle cx={0} cy={-104} r={7} fill="#5a4a3a" />
		</g>}
	</g>;
};

/* ================= A7 85.75–89.0: 23 years: two jars on a basement shelf; the news yellows; Harvey takes them away ================= */
const SEASONS = ['#9ab890', '#e8e0b0', '#d8985a', '#e8eef4'];
const Basement: React.FC<{t: number}> = ({t}) => {
	const u = t - 85.75, run = seg(t, 86.0, 88.5), sIdx = run * 8, si = Math.floor(sIdx) % 4, sf = sIdx - Math.floor(sIdx), col = SEASONS[si], ncol = SEASONS[(si + 1) % 4];
	const yel = run, wx = lerp(-100, 1900, seg(t, 87.75, 89.4)), ph = (t - 87.75) * 8, carry = seg(t, 88.15, 88.4);
	const wp = walkP(ph, carry > 0 ? {la: 60, le: 70, ra: 64, re: 64} : undefined, 5), hand = jointAt(wp, 'RHand', wx, 920, 640);
	const whip = ei(seg(t, 88.6, 89.1));
	const cx = 960 + 40 * u + whip * 700, cy = 520, z = (1.14 - 0.02 * u) * 1.06;
	const jarAt = (home: P2): P2 => { const k = ease(carry); return [lerp(home[0], hand[0] + 24, k), lerp(home[1], hand[1] + 8, k)]; };
	const J1 = jarAt([840, 640]), J2: P2 = [1040, 640];   // final pass (logic 7): one jar at a time, carried on his palm
	return <g>
		<Sky id="a7s" stops={[[0, '#262420'], [0.62, '#2e2a26'], [0.63, '#1c1a16'], [1, '#121110']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<rect x={-300} y={-200} width={2600} height={920} fill="#2e2b27" />{Array.from({length: 12}, (_, r) => Array.from({length: 16}, (_, c) => <rect key={`${r}_${c}`} x={-300 + c * 170 + (r % 2) * 85} y={-200 + r * 80} width={166} height={76} fill="#34302b" opacity={0.6} />))}
			{/* the high window: seasons flicker past */}
			<g><rect x={1240} y={90} width={360} height={150} fill={col} opacity={0.55} /><rect x={1240} y={90} width={360} height={150} fill={ncol} opacity={0.55 * sf} /><rect x={1240} y={90} width={360} height={150} fill="none" stroke="#141210" strokeWidth={14} /><path d="M1420,90 V240" stroke="#141210" strokeWidth={8} /></g>
			<path d={`M1240,240 L1600,240 L${1300 - 300 * Math.sin(run * 6)},1000 L${700 - 300 * Math.sin(run * 6)},1000 Z`} fill={col} opacity={0.08} />
			<g transform="translate(300,520)"><rect x={-6} y={-400} width={12} height={400} fill="#1a1814" /><rect x={-60} y={-20} width={120} height={20} fill="#1a1814" /></g>
			<Pendant x={600} y={20} len={100} id="a7p" o={0.45} />
			<Motes t={t} x={500} y={200} w={1200} h={600} n={30} o={0.4} />
			{/* boxes and pipes */}
			<rect x={-300} y={140} width={2600} height={14} fill="#1e1c18" /><rect x={-300} y={170} width={2600} height={8} fill="#1e1c18" />
			<g transform="translate(1500,900)"><rect x={0} y={-140} width={220} height={140} fill="#4a3c2c" /><rect x={30} y={-260} width={180} height={120} fill="#3e3224" /><rect x={-260} y={-110} width={200} height={110} fill="#44372a" /></g>
			{/* the shelf */}
			<rect x={620} y={640} width={720} height={16} fill="#3a342c" /><rect x={640} y={656} width={14} height={280} fill="#2a2620" /><rect x={1306} y={656} width={14} height={280} fill="#2a2620" />
			<g opacity={sm(seg(t, 86.3, 87.6)) * (1 - carry)}><path d="M1320,656 L1250,656 L1320,600 Z M1320,630 L1280,656 M1300,656 L1320,620" stroke="#c8c2b4" strokeWidth={1} fill="none" opacity={0.4} /></g>
			{/* the 1955 paper, yellowing */}
			<g transform="translate(1200,640) rotate(-8)"><rect x={-70} y={-170} width={150} height={170} fill="#e8e2d4" /><rect x={-70} y={-170} width={150} height={170} fill="#a8844a" opacity={0.6 * yel} />
				<text x={5} y={-138} textAnchor="middle" style={txt(MONO, 12, 700)} fill="#3a3024">1955</text>
				<text x={5} y={-104} textAnchor="middle" style={txt(SANS, 19, 900)} fill="#2a2016">几天内</text><text x={5} y={-80} textAnchor="middle" style={txt(SANS, 19, 900)} fill="#2a2016">开始研究</text>
				{Array.from({length: 5}, (_, i) => <rect key={i} x={-56} y={-62 + i * 12} width={100 + (i % 2) * 20} height={4} fill="#6a5e4a" />)}</g>
			<Glow x={(J1[0] + J2[0]) / 2} y={J1[1] - 120} r={420} c={B.halo} o={0.3} id="a7g" />
			{carry <= 0 && <><Jar x={J1[0]} y={J1[1]} s={0.7} id="a7j1" n0={3} /><Jar x={J2[0]} y={J2[1]} s={0.7} id="a7j2" n0={120} /></>}
			{/* dust settles on the lids */}
			{[J1, J2].map((j, i) => <rect key={i} x={j[0] - 50} y={j[1] - 205} width={100} height={4} rx={2} fill="#c8c2b4" opacity={0.5 * yel * (i === 0 ? 1 - carry : 1)} />)}
			{carry > 0 && <Jar x={J2[0]} y={J2[1]} s={0.7} id="a7j2" n0={120} />}
			{t >= 87.75 && <Rimmed x={wx} ground={920} h={640} pose={wp} look={LK.harvey} col="#121110" rim={RIMB} rimOp={0.5} rimDx={-2.4} />}
			{carry > 0 && <Jar x={J1[0]} y={J1[1]} s={0.7} id="a7j1" n0={3} />}
			<g fill="#090807"><rect x={-300} y={930} width={2600} height={300} /></g>
		</Cam>
		<Streaks k={whip} seed={5} />
	</g>;
};

/* ================= A8 89.0–92.25: 1978: the reporter drives across the Kansas plain to Wichita ================= */
const roll = (t: number) => { const u = t - 89.0, k = seg(t, 91.2, 92.0); return u < 2.2 ? 900 * u : 1980 + 360 * (2 * k - k * k); };
const BLD = 3700;
const Plains: React.FC<{t: number}> = ({t}) => {
	const s = roll(t), u = t - 89.0, carX = 760, bob = Math.sin(t * 22) * 1.5 * (1 - seg(t, 91.6, 92.0)), whipIn = 1 - eo(seg(t, 89.0, 89.35));
	const bx = BLD - s, push = ease(seg(t, 91.6, 92.5)), win: P2 = [bx + 120, 690];
	const cx = lerp(960 + 20 * u, win[0], push), cy = lerp(540, win[1], push), z = lerp(1.05, 2.4, push);
	return <g>
		<Sky id="a8s" stops={[[0, '#6a7884'], [0.45, '#9aa2a4'], [0.6, '#c8c0b0']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<Glow x={1300} y={500} r={700} c="#f4ead8" o={0.2} id="a8h" />
			{[[200, 220, 1.5], [900, 160, 2], [1600, 260, 1.3], [2300, 200, 1.7]].map(([x, y, sc], i) => <Cloud key={i} x={((x - s * 0.03 - u * 10) % 2600 + 2600) % 2600 - 300} y={y} s={sc} col="#8a929a" o={0.5} />)}
			{/* far: a flat horizon, a grain elevator, a water tower */}
			<rect x={-300} y={600} width={2600} height={700} fill="#8a8470" />
			<g fill="#6a6a62">{[[400, 0], [1900, 1]].map(([x0, k]) => { const x = ((x0 - s * 0.05) % 2600 + 2600) % 2600 - 300; return k ? <g key={x0}><rect x={x - 4} y={520} width={8} height={80} /><ellipse cx={x} cy={515} rx={34} ry={22} /></g> : <g key={x0}><rect x={x} y={470} width={90} height={130} /><rect x={x + 90} y={520} width={60} height={80} /><path d={`M${x},470 L${x + 45},440 L${x + 90},470 Z`} /></g>; })}</g>
			{/* fields in bands, scrolling at their depth */}
			{[[610, 0.15, '#7e7a62'], [650, 0.35, '#74705a'], [710, 0.6, '#6a6650']].map(([y, f, c], i) => <g key={i}><rect x={-300} y={y as number} width={2600} height={120} fill={c as string} />
				{Array.from({length: 20}, (_, k) => { const x = ((k * 160 - s * (f as number)) % 3200 + 3200) % 3200 - 400; return <rect key={k} x={x} y={(y as number) + 4} width={90} height={2} fill="#d8ccb0" opacity={0.25} />; })}</g>)}
			{/* telephone poles */}
			{Array.from({length: 7}, (_, i) => { const x = ((i * 420 - s * 0.8) % 2940 + 2940) % 2940 - 300; return <g key={i} fill="#3a3832"><rect x={x - 4} y={560} width={8} height={240} /><rect x={x - 30} y={574} width={60} height={6} /></g>; })}
			<path d={Array.from({length: 40}, (_, i) => `${i ? 'L' : 'M'}${-300 + i * 70},${580 + 12 * Math.cos(((i * 70 + s * 0.8) % 420) / 420 * Math.PI * 2)}`).join(' ')} stroke="#3a3832" strokeWidth={1.5} fill="none" opacity={0.6} />
			{/* the low office building at the end of the road */}
			<g transform={`translate(${bx},800)`}>
				<rect x={-60} y={-200} width={520} height={200} fill="#4a4a46" /><rect x={-80} y={-214} width={560} height={18} fill="#3a3a36" />
				{[0, 1, 2, 3].map((i) => <rect key={i} x={-20 + i * 120} y={-150} width={80} height={60} fill={i === 1 ? '#e8d8b0' : '#2e3436'} opacity={i === 1 ? 0.8 : 1} />)}
				<Glow x={120} y={-110} r={120} c="#ffe2b0" o={0.4} id="a8w" />
				<rect x={380} y={-120} width={50} height={120} fill="#2a2a28" />
			</g>
			{/* the road and the WICHITA sign */}
			<rect x={-300} y={800} width={2600} height={90} fill="#3a3a38" /><path d="M-300,800 H2300" stroke="#d8d0b8" strokeWidth={3} opacity={0.45} />
			{Array.from({length: 16}, (_, i) => { const x = ((i * 180 - s) % 2880 + 2880) % 2880 - 300; return <rect key={i} x={x} y={842} width={90} height={5} fill="#d8cfb0" opacity={0.6} />; })}
			<g transform={`translate(${2500 - s},800)`}><rect x={-6} y={-260} width={12} height={260} fill="#2a2a28" /><rect x={-170} y={-380} width={340} height={130} rx={10} fill="#3e5a50" stroke="#e8ece4" strokeWidth={6} />
				<text x={0} y={-296} textAnchor="middle" style={txt("'DejaVu Sans',sans-serif", 54, 800, {letterSpacing: '0.08em'})} fill="#eef0ea">WICHITA</text></g>
			{/* the car (side view, late-70s sedan); the reporter in silhouette */}
			<g transform={`translate(${carX},${806 + bob})`}>
				<ellipse cx={0} cy={8} rx={250} ry={14} fill="#000" opacity={0.3} />
				<path d="M-240,-10 L-236,-60 Q-230,-74 -200,-78 L-130,-82 L-80,-140 Q-70,-150 -50,-150 L90,-150 Q110,-150 122,-140 L170,-86 L222,-80 Q244,-76 246,-56 L248,-10 Z" fill="#5e4a3a" />
				<path d="M-70,-136 L-10,-136 L-10,-88 L-118,-88 Z" fill="#9aa4a8" opacity={0.6} /><path d="M2,-136 L104,-136 L150,-88 L2,-88 Z" fill="#9aa4a8" opacity={0.6} />
				<g fill="#141210"><circle cx={66} cy={-106} r={16} /><rect x={50} y={-96} width={34} height={10} /><circle cx={-44} cy={-108} r={0} /></g>
				<rect x={-240} y={-58} width={488} height={6} fill="#c8c0b0" opacity={0.5} />
				<rect x={232} y={-56} width={16} height={12} rx={3} fill="#e8e0c8" />
				{[-150, 150].map((x) => <g key={x}><circle cx={x} cy={-10} r={36} fill="#121212" /><circle cx={x} cy={-10} r={14} fill="#6a6a66" /><line x1={x} y1={-10} x2={x + 12 * Math.cos(s / 36)} y2={-10 + 12 * Math.sin(s / 36)} stroke="#2a2a2a" strokeWidth={4} /></g>)}
			</g>
			{Array.from({length: 10}, (_, i) => { const x = ((i * 300 - s * 1.6) % 3000 + 3000) % 3000 - 300; return <path key={i} d={`M${x},1080 q10,-${140 + 50 * rnd(i, 2)} 26,-${170 + 60 * rnd(i, 3)} q-2,70 6,170 Z M${x + 40},1080 q-8,-90 -40,-${120 + 30 * rnd(i, 4)} q30,40 48,120 Z`} fill="#2a2820" />; })}
			<rect x={-300} y={960} width={2600} height={200} fill="#2a2820" />
		</Cam>
		<Streaks k={0.9 * whipIn} seed={8} />
	</g>;
};

/* ================= A9 92.25–95.62: the CIDER box, the cold-open shot continued: Harvey passes the cooler, lifts the top box; you glow up ================= */
const CiderLong: React.FC<{t: number}> = ({t}) => {
	const u = t - 92.25, wx = lerp(260, 700, ease(seg(t, 92.25, 93.25))), walking = t < 93.25, ph = u * 7.5;
	const lift = ease(seg(t, 93.35, 93.95)), flap = ease(seg(t, 93.9, 94.2)), rise = ease(seg(t, 94.05, 94.75)), jy = lerp(905, 690, rise), push = ease(seg(t, 94.7, 95.45));
	const hp = walking ? walkP(ph, undefined, 6) : fkPose({...STAND, lean: lerp(6, 24, lift) - 14 * seg(t, 93.95, 94.3), neck: 14, la: lerp(10, 66, lift), le: 30, ra: lerp(14, 70, lift), re: 26});
	const topBox: P2 = [lerp(980, 640, ease(seg(t, 93.5, 94.0))), lerp(660, 905, ease(seg(t, 93.5, 94.0))) - 120 * Math.sin(Math.PI * seg(t, 93.5, 94.0))];
	const levyP = fkPose({...STAND, lean: lerp(6, 20, ease(seg(t, 94.2, 94.9))), neck: lerp(8, 24, ease(seg(t, 94.2, 94.9))), ra: 50, re: 70, la: 30, le: 80});
	const target: P2 = [980, jy - 85];
	const cx = lerp(900 + 25 * u, target[0], push), cy = lerp(520, target[1], push), z = lerp(1.06 + 0.02 * u, 3.0, push);
	return <g>
		<Sky id="a9s" stops={[[0, '#33332f'], [0.62, '#433f38'], [0.63, '#26221e'], [1, '#191715']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<rect x={140} y={170} width={360} height={380} fill="#2a2826" /><rect x={150} y={180} width={340} height={360} fill="#4e5c64" opacity={0.55} /><path d="M320,180 V540 M150,360 H490" stroke="#2a2826" strokeWidth={10} />
			<Shaft id="a9sh" a={[150, 540]} b={[490, 540]} c={[900, 905]} d={[300, 905]} col="#dfe6e8" o={0.1} />
			<Motes t={t} x={200} y={400} w={900} h={480} n={22} o={0.35} />
			<Frame x={640} y={210} w={170} h={120} col="#1e1c1a" /><Frame x={860} y={240} w={90} h={110} col="#1e1c1a" />
			<g transform="translate(1600,300)"><rect x={-6} y={-60} width={12} height={60} fill="#1a1816" /><path d="M-40,-60 L40,-60 L26,-96 L-26,-96 Z" fill="#2a2a26" /><Glow x={0} y={-50} r={160} c="#ffe6c0" o={0.25} id="a9l" /></g>
			<rect x={1420} y={300} width={360} height={370} fill="#352f28" /><rect x={1440} y={330} width={320} height={10} fill="#26221c" /><rect x={1440} y={460} width={320} height={10} fill="#26221c" />
			{/* the red plastic cooler on the floor (muted), ignored */}
			<g transform="translate(470,905)"><rect x={-130} y={-120} width={260} height={120} rx={14} fill="#5e4440" /><rect x={-140} y={-140} width={280} height={34} rx={10} fill="#6e504a" /><rect x={-40} y={-158} width={80} height={20} rx={8} fill="#c8c2b8" opacity={0.7} /></g>
			<Glow x={980} y={jy - 140} r={420} c={B.halo} o={0.12 + 0.4 * rise} id="a9g" />
			{/* bottom box: back flap, the jar, front face */}
			<g transform="translate(980,905)"><rect x={-230} y={-260} width={460} height={30} fill="#5a4430" /><path d={`M-230,-245 L${lerp(-230, -200, flap)},${lerp(-245, -330, flap)} L${lerp(230, 200, flap)},${lerp(-245, -330, flap)} L230,-245 Z`} fill="#6a5034" /></g>
			<Jar x={980} y={jy} s={1.05} id="a9j" n0={12} />
			<g transform="translate(980,905)">
				<rect x={-230} y={-245} width={460} height={245} fill="#86684a" /><rect x={-230} y={-245} width={460} height={12} fill="#6a5236" />
				<path d={`M-230,-245 L${lerp(-232, -290, flap)},${lerp(-245, -300, flap)} L${lerp(-230, -200, flap)},${lerp(-247, -312, flap)} L-200,-245 Z`} fill="#9c7c58" /><path d={`M230,-245 L${lerp(232, 290, flap)},${lerp(-245, -300, flap)} L${lerp(230, 200, flap)},${lerp(-247, -312, flap)} L200,-245 Z`} fill="#7a5e40" />
				<rect x={-230} y={-245} width={460} height={60} fill={B.mid} opacity={0.15 * rise} />
				<text x={0} y={-110} textAnchor="middle" style={{fontFamily: "'DejaVu Sans',sans-serif", fontWeight: 800, fontSize: 52, letterSpacing: '0.14em'}} fill="#3a2614" opacity={0.85}>CIDER</text>
				<rect x={-160} y={-80} width={320} height={6} fill="#3a2614" opacity={0.55} />
			</g>
			{/* the top box (plain), lifted aside */}
			<g transform={`translate(${topBox[0]},${topBox[1]}) rotate(${-12 * Math.sin(Math.PI * seg(t, 93.5, 94.0))})`}><rect x={-210} y={-200} width={420} height={200} fill="#7a6044" /><rect x={-210} y={-200} width={420} height={10} fill="#5e4a34" /><rect x={-30} y={-200} width={60} height={200} fill="#c8b890" opacity={0.25} /></g>
			<g transform="translate(1250,905)"><rect x={0} y={-330} width={150} height={330} fill="#24221f" />{[0, 1, 2].map((k) => <g key={k}><rect x={10} y={-318 + k * 106} width={130} height={96} fill="#2e2b27" /><rect x={58} y={-280 + k * 106} width={34} height={10} fill="#a8a294" opacity={0.4} /></g>)}</g>
			<Rimmed x={wx} ground={905} h={600} pose={hp} look={LK.harveyOld} col="#14100e" rim={RIMB} rimOp={0.6} rimDx={-2.4} />
			<Rimmed x={1480} ground={905} h={590} pose={levyP} look={LK.levy} flip col="#14100e" rim={RIMB} rimOp={0.6} rimDx={2.4} />
			{(() => { const h = jointAt(levyP, 'LHand', 1480, 905, 590, true); return <rect x={h[0] - 30} y={h[1] - 34} width={36} height={46} fill="#e8e0d0" transform={`rotate(16 ${h[0]} ${h[1]})`} />; })()}
			<g fill="#0a0908"><path d="M1820,1080 L1820,760 Q1860,730 1920,740 L2000,1080 Z" /><rect x={1760} y={880} width={300} height={30} rx={8} /></g>
		</Cam>
		<BigBlock t={t} o={sm(seg(t, 95.05, 95.45))} />
	</g>;
};
/** the hand-off: one glowing numbered block (№ 40), centred; RoughB opens on it as a thin slide under the lens */
export const BLOCK_N = 40;
export const BigBlock: React.FC<{t: number; o?: number}> = ({t, o = 1}) => o <= 0.01 ? null : <g opacity={o}>
	<rect width={W} height={H} fill="#1a1210" />
	<Glow x={960} y={540} r={760} c={B.halo} o={0.5} id="bbh" />
	<defs><radialGradient id="bbf" cx="0.45" cy="0.42" r="0.7"><stop offset="0" stopColor={B.core} stopOpacity="0.95" /><stop offset="0.6" stopColor={B.mid} stopOpacity="0.75" /><stop offset="1" stopColor={B.halo} stopOpacity="0.55" /></radialGradient></defs>
	<g transform={`translate(960,540) scale(${1 + 0.05 * (t - 95.1)}) rotate(${-4 + 2 * (t - 95.1)})`}>
		<rect x={-250} y={-250} width={500} height={500} rx={40} fill="url(#bbf)" stroke={B.core} strokeWidth={8} />
		<rect x={-170} y={-70} width={340} height={150} rx={8} fill="#f3ece0" stroke="#6a4a3a" strokeWidth={3} />
		<text x={0} y={-30} textAnchor="middle" style={txt(MONO, 22, 700, {letterSpacing: '0.1em'})} fill="#5a3a2a">CEREBRAL CORTEX</text>
		<text x={0} y={52} textAnchor="middle" style={txt(MONO, 76, 700)} fill="#3a2018">{BLOCK_N}</text>
	</g>
	<Glow x={960} y={540} r={300} c={B.core} o={0.25} id="bbc" />
</g>;

/* ================= the reel ================= */
type Sc = {a: number; b: number; C: React.FC<{t: number}>; x: number};
/** [start, end, scene, dissolve-in length]; boundaries are camera moves or matches, never a solid card */
const SC: Sc[] = [
	{a: 35.3, b: 41.0, C: Eclipse, x: 0}, {a: 41.0, b: 44.5, C: Nobel, x: 0}, {a: 44.5, b: 50.75, C: Letter, x: 0.3}, {a: 50.75, b: 54.25, C: Regret, x: 0.4},
	{a: 54.25, b: 66.0, C: Hospital, x: 0.4}, {a: 66.0, b: 69.5, C: Door, x: 0.3}, {a: 69.5, b: 75.75, C: Form, x: 0.3}, {a: 75.75, b: 79.25, C: Ashes, x: 0.4},
	{a: 79.25, b: 82.25, C: Scale, x: 0.3}, {a: 82.25, b: 85.75, C: Section, x: 0.24}, {a: 85.75, b: 89.0, C: Basement, x: 0.24}, {a: 89.0, b: 92.25, C: Plains, x: 0.14}, {a: 92.25, b: 95.7, C: CiderLong, x: 0.36},
];
export const RoughA: React.FC<{t: number}> = ({t}) => {
	const parts: React.ReactNode[] = [];
	SC.forEach((S, i) => { const x0 = S.x / 2, x1 = (SC[i + 1]?.x ?? 0) / 2;
		if (t < S.a - x0 || t >= S.b + x1) return;
		const o = x0 > 0 ? sm(seg(t, S.a - x0, S.a + x0)) : 1;
		parts.push(<g key={i} opacity={o}><S.C t={Math.max(S.a - x0, Math.min(S.b + x1, t))} /></g>); });
	return <>{parts}</>;
};
void H; void Pendant; void Curtain;
