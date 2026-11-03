import React from 'react';
import {Karl, GOLD, mixHex} from './karl3';

/* ep59 v3 · the open-water shot for Karl's swim and float tests (and reusable for the Caspian / Channel scenes).
   A low camera (≈45 cm above the water) looking across a dawn sea: the surface is a sum of travelling swells, drawn as depth rows painted
   far → near, so the swimmer sits between the rows behind him and the rows in front (which now and then crest over his kick and his waist).
   He rides the surface at his own position (bob + pitch), the camera tracks him with parallax, the escort boat sits on the horizon with its
   cabin lit (the one gold accent), the low sun lays a glitter path. Units: metres in the world; the swimmer stands 1.8 m = h px. */
const W = 1920, H = 1080;
const f1 = (v: number) => v.toFixed(1);
const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

type Wave = {A: number; L: number; dir: number; ph: number};
const WAVES: Wave[] = [
	{A: 0.09, L: 13, dir: 1.9, ph: 0.3},     // the long swell, rolling in diagonally toward the camera
	{A: 0.05, L: 6.5, dir: 0.32, ph: 1.7},    // a wind sea running across the frame (the rows undulate)
	{A: 0.028, L: 2.4, dir: 2.5, ph: 4.1},    // chop
	{A: 0.012, L: 1.05, dir: 0.9, ph: 2.2},   // ripples
];
const G = 9.81;
/** sea-surface elevation (m) at world (X along the screen, Z away from the camera) and time t; calm scales the waves */
export const seaZeta = (X: number, Z: number, t: number, calm = 1) => {
	let z = 0;
	for (const w of WAVES) { const k = 2 * Math.PI / w.L, om = Math.sqrt(G * k); z += w.A * calm * Math.sin(k * (X * Math.cos(w.dir) + Z * Math.sin(w.dir)) - om * t + w.ph); }
	return z;
};
const zetaDX = (X: number, Z: number, t: number, calm = 1) => (seaZeta(X + 0.05, Z, t, calm) - seaZeta(X - 0.05, Z, t, calm)) / 0.1;

export type SeaCam = {HZ: number; cam: number; f: number; Xcam: number; Zs: number; roll: number};
/** screen of a world point: n = Zs/Z (nearness, 1 at the swimmer) */
const proj = (c: SeaCam, X: number, Z: number, zeta: number): [number, number] => { const s = c.f / Z; return [W / 2 + (X - c.Xcam) * s, c.HZ + (c.cam - zeta) * s]; };

/* the dawn palette */
const SKY: [number, string][] = [[0, '#18203a'], [0.32, '#36406a'], [0.6, '#8a7088'], [0.8, '#d89a84'], [0.93, '#f4bf92'], [1, '#ffdcaa']];
const rowCol = (n: number) => { const u = clamp((Math.log(n) - Math.log(0.04)) / (Math.log(6) - Math.log(0.04)));
	const stops: [number, string][] = [[0, '#f0c2a0'], [0.2, '#cf9e96'], [0.36, '#8c7a8c'], [0.5, '#56566e'], [0.66, '#353d55'], [0.82, '#232b3e'], [1, '#141a28']];
	for (let i = 1; i < stops.length; i++) if (u <= stops[i][0]) return mixHex(stops[i - 1][1], stops[i][1], (u - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
	return stops[stops.length - 1][1]; };

/** sea rows between nearness n0..n1 (painter's order far → near): each a wavy crest line filled down past the frame */
const Rows: React.FC<{c: SeaCam; t: number; ns: number[]; sunX: number; calm: number; keyp: string}> = ({c, t, ns, sunX, calm, keyp}) => <>{ns.map((n, j) => {
	const Z = c.Zs / n, s = c.f / Z, pts: [number, number][] = [], step = n > 2 ? 30 : n > 0.6 ? 40 : n > 0.2 ? 64 : 96;
	for (let x = -120; x <= W + 120; x += step) { const X = c.Xcam + (x - W / 2) / s; pts.push([x, c.HZ + (c.cam - seaZeta(X, Z, t, calm)) * s]); }
	let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
	for (let i = 1; i < pts.length - 1; i++) d += ` Q${f1(pts[i][0])},${f1(pts[i][1])} ${f1((pts[i][0] + pts[i + 1][0]) / 2)},${f1((pts[i][1] + pts[i + 1][1]) / 2)}`;
	const crest = d + ` L${f1(pts[pts.length - 1][0])},${f1(pts[pts.length - 1][1])}`;
	const fill = rowCol(n), band = Math.min(26, 1.5 + 5.5 * n), bandCol = mixHex(rowCol(n * 0.45), '#ffd2ac', 0.18);
	let bd = `M${f1(pts[0][0])},${f1(pts[0][1])}`;   // the crest band: the crest line, back along itself a band lower
	for (let i = 1; i < pts.length - 1; i++) bd += ` Q${f1(pts[i][0])},${f1(pts[i][1])} ${f1((pts[i][0] + pts[i + 1][0]) / 2)},${f1((pts[i][1] + pts[i + 1][1]) / 2)}`;
	bd += ` L${f1(pts[pts.length - 1][0])},${f1(pts[pts.length - 1][1] + band * 0.6)}`;
	for (let i = pts.length - 2; i > 0; i--) { const k = 0.55 + 0.45 * rnd(i, j + 7); bd += ` Q${f1(pts[i][0])},${f1(pts[i][1] + band * k)} ${f1((pts[i][0] + pts[i - 1][0]) / 2)},${f1((pts[i][1] + pts[i - 1][1]) / 2 + band * k)}`; }
	bd += ' Z';
	const hiO = clamp(0.55 - 0.12 * Math.log(n + 0.3), 0.12, 0.7), hw = Math.max(0.8, Math.min(2.6, 0.7 * n));
	const gl: React.ReactNode[] = [], spread = 40 + 170 * Math.min(n, 3.5);
	if (n > 0.12) for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], dx = Math.abs(x - sunX); if (dx > spread) continue;
		const k = 1 - dx / spread;
		for (let q = 0; q < 2; q++) { const fl = rnd(i * 2 + q + j * 31, Math.floor(t * 9 + j * 0.37 + q * 0.5)); if (fl > 0.2 + 0.7 * k * k) continue;
			const wdt = (8 + 34 * rnd(i + q, j) * k) * Math.min(2.4, 0.4 + n * 0.55);
			gl.push(<ellipse key={`${i}_${q}`} cx={f1(x + (rnd(i + q * 7, j + 1) - 0.5) * step)} cy={f1(y + 1 + band * 0.5 * rnd(i + q, j + 3))} rx={f1(wdt / 2)} ry={f1(Math.max(0.8, 0.6 + 0.6 * Math.min(n, 3)))} fill="#fff8ea" opacity={f1(clamp(0.5 + 0.5 * k))} />); } }
	return <g key={keyp + j}>
		<path d={crest + ` L${W + 200},${H + 400} L-200,${H + 400} Z`} fill={fill} />
		<path d={bd} fill={bandCol} opacity={0.75} />
		<path d={crest} stroke="#ffdcb8" strokeWidth={f1(hw)} fill="none" opacity={f1(hiO)} />
		{gl}
	</g>; })}</>;

/** the escort boat on the horizon: hull, wheelhouse with lit windows (gold), mast light, a figure watching at the stern */
const Boat: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => {
	const pitch = 1.4 * Math.sin(t * 1.3) + 0.6 * Math.sin(t * 2.7 + 1), col = '#2b3040', lit = GOLD;
	return <g transform={`translate(${f1(x)},${f1(y + 1.5 * Math.sin(t * 1.1))}) rotate(${f1(pitch)}) scale(${(s / 140).toFixed(3)})`}>
		<path d="M-74,-2 L66,-2 Q74,-2 76,-12 L70,-14 L-60,-14 Q-74,-12 -74,-2 Z" fill={col} />
		<path d="M-70,-2 L68,-2 L64,5 L-62,5 Z" fill={mixHex(col, '#000000', 0.25)} />
		<path d="M-10,-14 L-10,-36 Q-8,-40 -2,-40 L30,-40 L38,-14 Z" fill={col} />
		<rect x={-4} y={-34} width={10} height={8} fill={lit} opacity={0.95} /><rect x={10} y={-34} width={10} height={8} fill={lit} opacity={0.85} /><rect x={24} y={-34} width={6} height={8} fill={lit} opacity={0.6} />
		<rect x={6} y={-74} width={2.2} height={36} fill={col} /><rect x={-6} y={-60} width={26} height={1.6} fill={col} />
		<circle cx={7} cy={-76} r={2.4} fill="#fff4e0" opacity={0.9} />
		<path d="M-52,-14 L-52,-26 Q-52,-30 -49,-30 Q-46,-30 -46,-26 L-46,-14 Z" fill={col} /><circle cx={-49} cy={-33} r={3} fill={col} />
		<path d="M-60,-14 L-60,-20 L-30,-20 L-30,-14" stroke={col} strokeWidth={1.4} fill="none" />
	</g>;
};

/** a full open-water frame: sky, sun, boat, the sea in rows, Karl swimming (or floating) at the water line, then the rows in front */
export const SeaShot: React.FC<{t: number; mode: 'swim' | 'float'; h?: number; dur?: number}> = ({t, mode, h = 560, dur = 6}) => {
	const calm = mode === 'float' ? 0.55 : 0.72;
	const camBob = 7 * Math.sin(t * 0.95 + 0.4) + 3 * Math.sin(t * 2.1), roll = 0.55 * Math.sin(t * 0.8 + 1.1) + 0.2 * Math.sin(t * 1.9);
	const HZ = (mode === 'float' ? 360 : 420) + camBob, pxm = h / 1.8, Zs = 5, f = pxm * Zs, cam = mode === 'float' ? 0.44 : 0.36;
	// he swims at his natural pace; the camera follows him with a little lag (he drifts right across the frame)
	const sec = mode === 'swim' ? 1.75 : 1.5, phase = t / sec + 0.15, v = mode === 'swim' ? 0.42 * 1.8 / 1.75 : 0.03;
	const Xs = v * t, sxScreen = (mode === 'swim' ? 900 : 860) + (mode === 'swim' ? 90 : 16) * (t / dur), Xcam = Xs - (sxScreen - W / 2) / pxm;
	const zs0 = seaZeta(Xs, Zs, t, calm), follow = 0.66 * zs0 * (f / Zs);   // px
	const c: SeaCam = {HZ: HZ + follow, cam, f, Xcam, Zs, roll};
	const zs = zs0, slope = zetaDX(Xs, Zs, t, calm), [sx, sy] = proj(c, Xs, Zs, zs);
	const sunX = 1380, sunY = c.HZ - 64;
	// rows: nearness (Zs/Z): far ones up to the swimmer, then the ones in front of him
	const far = Array.from({length: 15}, (_, i) => 0.035 * Math.pow(0.97 / 0.035, i / 14));
	const near = Array.from({length: 13}, (_, i) => 1.06 * Math.pow(6.5 / 1.06, i / 12));
	const skyStops = SKY.map(([o, col], i) => <stop key={i} offset={o} stopColor={col} />);
	const boatZ = 110, boatX = Xcam + (360 - W / 2) / (f / boatZ), [bx, by] = proj(c, boatX, boatZ, seaZeta(boatX, boatZ, t, calm) * 0.4);
	return <g transform={`rotate(${f1(roll)} ${W / 2} ${H / 2})`}>
		<defs>
			<linearGradient id="sea_sky" x1="0" x2="0" y1="0" y2="1">{skyStops}</linearGradient>
			<radialGradient id="sea_sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff6e0" stopOpacity={0.95} /><stop offset="0.12" stopColor="#ffe2b0" stopOpacity={0.7} /><stop offset="0.45" stopColor="#ffc890" stopOpacity={0.22} /><stop offset="1" stopColor="#ffb080" stopOpacity={0} /></radialGradient>
			<linearGradient id="sea_haze" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ffd8b0" stopOpacity={0} /><stop offset="0.5" stopColor="#ffd8b0" stopOpacity={0.55} /><stop offset="1" stopColor="#ffd8b0" stopOpacity={0} /></linearGradient>
			<radialGradient id="sea_col" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe6bf" stopOpacity={0.55} /><stop offset="0.35" stopColor="#ffd8a8" stopOpacity={0.2} /><stop offset="1" stopColor="#ffd0a0" stopOpacity={0} /></radialGradient>
			<clipPath id="sea_below"><rect x={-300} y={c.HZ + 2} width={W + 600} height={H} /></clipPath>
			<radialGradient id="sea_vig" cx="0.5" cy="0.48" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#05060c" stopOpacity={0.55} /></radialGradient>
		</defs>
		<rect x={-200} y={-300} width={W + 400} height={c.HZ + 340} fill="url(#sea_sky)" />
		{/* long cloud streaks, lit from below (they ride the camera bob with the horizon) */}
		<g transform={`translate(0,${f1(c.HZ - HZ)})`}>{[[300, 150, 700, 18], [1100, 210, 900, 14], [620, 290, 600, 10], [1500, 300, 520, 9], [180, 340, 420, 7]].map(([x, y, w, th], i) =>
			<g key={i}><path d={`M${x},${y} Q${x + w * 0.3},${y - th * 1.4} ${x + w * 0.62},${y - th * 0.5} Q${x + w * 0.85},${y - th} ${x + w},${y + th * 0.3} Q${x + w * 0.5},${y + th * 0.9} ${x},${y} Z`} fill="#4a4566" opacity={0.75} />
				<path d={`M${x + w * 0.08},${y + th * 0.35} Q${x + w * 0.5},${y + th * 1.0} ${x + w * 0.96},${y + th * 0.35}`} stroke="#ffb98c" strokeWidth={2.2} fill="none" opacity={0.6} /></g>)}</g>
		<circle cx={sunX} cy={sunY} r={420} fill="url(#sea_sun)" />
		<circle cx={sunX} cy={sunY} r={30} fill="#fff6e4" />
		<rect x={-200} y={c.HZ - 60} width={W + 400} height={90} fill="url(#sea_haze)" />
		{/* the far sea, then the escort boat sitting on it */}
		<Rows c={c} t={t} ns={far.slice(0, 5)} sunX={sunX} calm={calm} keyp="fa" />
		<Boat x={bx} y={by} s={150} t={t} />
		<Rows c={c} t={t} ns={far.slice(5)} sunX={sunX} calm={calm} keyp="fb" />
		<g clipPath="url(#sea_below)"><ellipse cx={sunX} cy={c.HZ} rx={330} ry={520} fill="url(#sea_col)" /></g>
		<Karl x={sx} y={sy} h={h} attire="swim" action={mode} phase={phase} t={t} pitch={-slope * 57.3 * 0.55} rim="#ffd2a2" lightDir={35} rimO={0.95} foam="#fff2e4" waterHi="#e2bca6" underO={0.0} />
		<Rows c={c} t={t} ns={near} sunX={sunX} calm={calm} keyp="nr" />
		{/* spindrift off the nearest crests, drifting through */}
		{Array.from({length: 18}, (_, i) => { const a = (t * (0.25 + 0.2 * rnd(i, 2)) + rnd(i, 1)) % 1, x = lerp(-60, W + 60, (rnd(i, 3) + a * 0.35) % 1), y = lerp(H - 120, H - 420, rnd(i, 4)) - 160 * a * a + 40 * Math.sin(a * 9);
			return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(1.2 + 2.6 * rnd(i, 5))} fill="#fff1e2" opacity={f1(0.5 * Math.sin(Math.PI * a))} />; })}
		<rect x={-200} y={-300} width={W + 400} height={H + 600} fill="url(#sea_vig)" />
	</g>;
};
