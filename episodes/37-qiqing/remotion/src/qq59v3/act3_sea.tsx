import React from 'react';
import {Karl, mixHex, KARL_CYCLE, Attire} from './karl3';
import {W, H, f1, rnd, lerp, cl, sm} from './kit3';

/* ep59 v3 · act 3 · open water (built on the karl3sea idea: a low camera, the sea drawn as depth rows of a sum of travelling swells,
   painted far → near so the swimmer sits between the rows behind him and the rows in front).
   Units: metres in the world (X across the screen, Z away from the camera, zeta up); a camera at height `cam` above mean water,
   horizon at screen y HZ, focal f (px · m): a point at depth Z is f/Z px per metre.
   Used by: caspian (close tracking swim, then the float), boat (rough night sea, the escort boat), channel (the Channel swim). */

export type Wave = {A: number; L: number; dir: number; ph: number};
/** the calm dawn sea (the character builder's set: a long swell rolling in, a wind sea across, chop, ripples) */
export const CALM: Wave[] = [{A: 0.09, L: 13, dir: 1.9, ph: 0.3}, {A: 0.05, L: 6.5, dir: 0.32, ph: 1.7}, {A: 0.028, L: 2.4, dir: 2.5, ph: 4.1}, {A: 0.012, L: 1.05, dir: 0.9, ph: 2.2}];
/** a rough night sea: a big swell, a steep wind sea, chop */
export const ROUGH: Wave[] = [{A: 0.62, L: 30, dir: 1.72, ph: 0.3}, {A: 0.3, L: 13, dir: 0.5, ph: 1.7}, {A: 0.11, L: 5, dir: 2.3, ph: 4.1}, {A: 0.04, L: 1.7, dir: 0.9, ph: 2.2}];
const G = 9.81;
export const zeta = (ws: Wave[], X: number, Z: number, t: number, k = 1) => {
	let z = 0; for (const w of ws) { const kk = 2 * Math.PI / w.L, om = Math.sqrt(G * kk); z += w.A * k * Math.sin(kk * (X * Math.cos(w.dir) + Z * Math.sin(w.dir)) - om * t + w.ph); }
	return z; };
const zetaDX = (ws: Wave[], X: number, Z: number, t: number, k = 1) => (zeta(ws, X + 0.05, Z, t, k) - zeta(ws, X - 0.05, Z, t, k)) / 0.1;

export type SeaCam = {HZ: number; cam: number; f: number; Xcam: number};
export const proj = (c: SeaCam, X: number, Z: number, z: number): [number, number] => { const s = c.f / Z; return [W / 2 + (X - c.Xcam) * s, c.HZ + (c.cam - z) * s]; };

/** a sea look: the row colours by nearness (log scale, far → near), crest highlights, glints, sky, sun, haze */
export type SeaLook = {
	sky: [number, string][];         // over 0 (frame top) → 1 (horizon)
	rows: [number, string][];        // u = 0 far … 1 near
	crest: string; bandTint: string; glint: string;
	sun?: {x: number; dy: number; r: number; core: string; glow: string; o: number};
	haze: string; hazeO: number;
	cloud: string; cloudLit: string; vig: number;
};
export const DAWN_CASPIAN: SeaLook = {
	sky: [[0, '#1c2440'], [0.3, '#38406a'], [0.58, '#86708c'], [0.78, '#d39a88'], [0.92, '#f2c094'], [1, '#ffdcaa']],
	rows: [[0, '#f0c2a0'], [0.2, '#cf9e96'], [0.36, '#8c7a8c'], [0.5, '#56566e'], [0.66, '#353d55'], [0.82, '#232b3e'], [1, '#141a28']],
	crest: '#ffdcb8', bandTint: '#ffd2ac', glint: '#fff8ea',
	sun: {x: 1380, dy: -62, r: 30, core: '#fff6e4', glow: '#ffe2b0', o: 1},
	haze: '#ffd8b0', hazeO: 0.55, cloud: '#4a4566', cloudLit: '#ffb98c', vig: 0.55,
};
export const DAWN_CHANNEL: SeaLook = {
	sky: [[0, '#1b2433'], [0.32, '#3a4a60'], [0.6, '#7d8a98'], [0.8, '#c4b8aa'], [0.93, '#ead2b0'], [1, '#f6e2c0']],
	rows: [[0, '#e6d6bc'], [0.2, '#b3b2a8'], [0.36, '#7f8a8e'], [0.5, '#4f5e68'], [0.66, '#33434e'], [0.82, '#202d37'], [1, '#121b23']],
	crest: '#f4e2c6', bandTint: '#e8dcc4', glint: '#fffaf0',
	sun: {x: 420, dy: -48, r: 26, core: '#fff8ea', glow: '#ffe6c0', o: 1},
	haze: '#efdcc0', hazeO: 0.6, cloud: '#3c4658', cloudLit: '#f2c69a', vig: 0.55,
};
export const NIGHT: SeaLook = {
	sky: [[0, '#05070d'], [0.5, '#0b1120'], [0.85, '#15203a'], [1, '#1e2a44']],
	rows: [[0, '#1c2740'], [0.25, '#141d31'], [0.5, '#0e1525'], [0.75, '#0a101c'], [1, '#070b14']],
	crest: '#8ea6c8', bandTint: '#39507a', glint: '#ffd28a',
	haze: '#1e2a44', hazeO: 0.5, cloud: '#0e1424', cloudLit: '#3a4c70', vig: 0.65,
};

const stopsAt = (stops: [number, string][], u: number) => { const v = cl(u);
	for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) return mixHex(stops[i - 1][1], stops[i][1], (v - stops[i - 1][0]) / ((stops[i][0] - stops[i - 1][0]) || 1));
	return stops[stops.length - 1][1]; };
const rowU = (n: number) => cl((Math.log(n) - Math.log(0.035)) / (Math.log(6.5) - Math.log(0.035)));

export type Light = {x: number; col: string; spread: number; k: number};
/** sea rows at nearness ns (= Zs / Z), painted far → near; each a wavy crest line filled down past the frame, a crest band,
    a highlight line, and glints near each light's x (the sun's path, or the boat's lamps at night) */
export const Rows: React.FC<{c: SeaCam; Zs: number; t: number; ns: number[]; ws: Wave[]; k: number; look: SeaLook; lights: Light[]; keyp: string; crestK?: number}> = ({c, Zs, t, ns, ws, k, look, lights, keyp, crestK = 1}) => <>{ns.map((n, j) => {
	const Z = Zs / n, s = c.f / Z, pts: [number, number][] = [], step = n > 2 ? 28 : n > 0.6 ? 40 : n > 0.2 ? 64 : 96;
	for (let x = -160; x <= W + 160; x += step) { const X = c.Xcam + (x - W / 2) / s; pts.push([x, c.HZ + (c.cam - zeta(ws, X, Z, t, k)) * s]); }
	let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
	for (let i = 1; i < pts.length - 1; i++) d += ` Q${f1(pts[i][0])},${f1(pts[i][1])} ${f1((pts[i][0] + pts[i + 1][0]) / 2)},${f1((pts[i][1] + pts[i + 1][1]) / 2)}`;
	const crest = d + ` L${f1(pts[pts.length - 1][0])},${f1(pts[pts.length - 1][1])}`;
	const u = rowU(n), fill = stopsAt(look.rows, u), band = Math.min(30, 1.5 + 5.5 * n), bandCol = mixHex(stopsAt(look.rows, rowU(n * 0.45)), look.bandTint, 0.18);
	let bd = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
	for (let i = 1; i < pts.length - 1; i++) bd += ` Q${f1(pts[i][0])},${f1(pts[i][1])} ${f1((pts[i][0] + pts[i + 1][0]) / 2)},${f1((pts[i][1] + pts[i + 1][1]) / 2)}`;
	bd += ` L${f1(pts[pts.length - 1][0])},${f1(pts[pts.length - 1][1] + band * 0.6)}`;
	for (let i = pts.length - 2; i > 0; i--) { const kk = 0.55 + 0.45 * rnd(i, j + 7); bd += ` Q${f1(pts[i][0])},${f1(pts[i][1] + band * kk)} ${f1((pts[i][0] + pts[i - 1][0]) / 2)},${f1((pts[i][1] + pts[i - 1][1]) / 2 + band * kk)}`; }
	bd += ' Z';
	const hiO = cl(0.55 - 0.12 * Math.log(n + 0.3), 0.12, 0.7) * crestK, hw = Math.max(0.8, Math.min(2.8, 0.7 * n));
	const gl: React.ReactNode[] = [];
	if (n > 0.1) lights.forEach((L, li) => { const spread = L.spread * (0.25 + Math.min(n, 3.5));
		for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], dx = Math.abs(x - L.x); if (dx > spread) continue;
			const kk = 1 - dx / spread;
			for (let q = 0; q < 2; q++) { const fl = rnd(i * 2 + q + j * 31 + li * 977, Math.floor(t * 9 + j * 0.37 + q * 0.5)); if (fl > (0.2 + 0.7 * kk * kk) * L.k) continue;
				const wdt = (8 + 34 * rnd(i + q, j) * kk) * Math.min(2.4, 0.4 + n * 0.55);
				gl.push(<ellipse key={`${li}_${i}_${q}`} cx={f1(x + (rnd(i + q * 7, j + 1) - 0.5) * step)} cy={f1(y + 1 + band * 0.5 * rnd(i + q, j + 3))} rx={f1(wdt / 2)} ry={f1(Math.max(0.8, 0.6 + 0.6 * Math.min(n, 3)))} fill={L.col} opacity={f1(cl(0.5 + 0.5 * kk))} />); } } });
	return <g key={keyp + j}>
		<path d={crest + ` L${W + 300},${H + 600} L-300,${H + 600} Z`} fill={fill} />
		<path d={bd} fill={bandCol} opacity={0.75} />
		<path d={crest} stroke={look.crest} strokeWidth={f1(hw)} fill="none" opacity={f1(hiO)} />
		{gl}
	</g>; })}</>;

/** sky, clouds lit from below, the sun and the horizon haze (they ride the camera's horizon) */
export const SeaSky: React.FC<{c: SeaCam; look: SeaLook; id: string; t: number; clouds?: [number, number, number, number][]}> = ({c, look, id, t, clouds}) => {
	const cl0 = clouds ?? [[300, 150, 700, 18], [1100, 210, 900, 14], [620, 290, 600, 10], [1500, 300, 520, 9], [180, 340, 420, 7]];
	const sun = look.sun, dy = c.HZ - 430;
	return <g>
		<defs>
			<linearGradient id={`${id}sk`} gradientUnits="userSpaceOnUse" x1="0" y1={-300} x2="0" y2={c.HZ}>{look.sky.map(([o, col], i) => <stop key={i} offset={o} stopColor={col} />)}</linearGradient>
			<radialGradient id={`${id}sn`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={sun?.core ?? '#fff'} stopOpacity={0.95} /><stop offset="0.12" stopColor={sun?.glow ?? '#fff'} stopOpacity={0.7} /><stop offset="0.45" stopColor={sun?.glow ?? '#fff'} stopOpacity={0.22} /><stop offset="1" stopColor={sun?.glow ?? '#fff'} stopOpacity={0} /></radialGradient>
			<linearGradient id={`${id}hz`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={look.haze} stopOpacity={0} /><stop offset="0.5" stopColor={look.haze} stopOpacity={look.hazeO} /><stop offset="1" stopColor={look.haze} stopOpacity={0} /></linearGradient>
		</defs>
		<rect x={-300} y={-400} width={W + 600} height={c.HZ + 460} fill={`url(#${id}sk)`} />
		<g transform={`translate(${f1(-t * 6)},${f1(dy)})`}>{cl0.map(([x, y, w, th], i) =>
			<g key={i}><path d={`M${x},${y} Q${x + w * 0.3},${y - th * 1.4} ${x + w * 0.62},${y - th * 0.5} Q${x + w * 0.85},${y - th} ${x + w},${y + th * 0.3} Q${x + w * 0.5},${y + th * 0.9} ${x},${y} Z`} fill={look.cloud} opacity={0.75} />
				<path d={`M${x + w * 0.08},${y + th * 0.35} Q${x + w * 0.5},${y + th * 1.0} ${x + w * 0.96},${y + th * 0.35}`} stroke={look.cloudLit} strokeWidth={2.2} fill="none" opacity={0.6} /></g>)}</g>
		{sun && <><circle cx={sun.x} cy={c.HZ + sun.dy} r={420} fill={`url(#${id}sn)`} opacity={sun.o} /><circle cx={sun.x} cy={c.HZ + sun.dy} r={sun.r} fill={sun.core} opacity={sun.o} /></>}
		<rect x={-300} y={c.HZ - 60} width={W + 600} height={90} fill={`url(#${id}hz)`} />
	</g>; };

/* ---------------- the escort boat (metres: x forward, y up, waterline y = 0, about 14 m long) ---------------- */
type BoatCols = {hull: string; hullHi: string; cabin: string; win: string; winO: number; mast: string; lamp: number};
const HULL = 'M-6.6,-0.5 L-6.9,0.2 L-7.05,1.5 L-3,1.62 L1,1.78 L4.5,2.02 L7.25,2.45 L7.0,1.6 L6.3,0.4 L5.6,-0.5 Z';
const BULWARK_HI = 'M-7.05,1.5 L-3,1.62 L1,1.78 L4.5,2.02 L7.25,2.45 L7.2,2.3 L4.5,1.88 L1,1.64 L-3,1.48 L-7.02,1.36 Z';
const CABIN = 'M-1.4,1.6 L-1.4,3.75 L2.4,3.75 L3.6,2.2 L3.6,1.8 Z M-1.6,3.75 L2.6,3.75 L2.6,3.95 L-1.6,3.95 Z';
const MAST = 'M0.45,3.95 L0.6,7.4 L0.72,7.4 L0.8,3.95 Z M-0.4,6.2 L1.9,6.2 L1.9,6.32 L-0.4,6.32 Z M1.6,3.95 L1.66,5.4 L1.72,5.4 L1.76,3.95 Z';
const RAIL = (() => { let d = 'M-6.95,2.32 L-3,2.44 L1,2.6 L1,2.68 L-3,2.52 L-6.95,2.4 Z'; for (const x of [-6.9, -5.6, -4.3, -3.0, -1.7]) { const y = 1.5 + (x + 7) * 0.03; d += ` M${x},${y} L${x},${y + 0.86} L${x + 0.06},${y + 0.86} L${x + 0.06},${y} Z`; } return d; })();
/** the far parts (cabin, mast, the stern gantry) — drawn behind a figure on deck */
export const BoatBack: React.FC<{cols: BoatCols; t: number; night?: boolean}> = ({cols, t, night}) => <g>
	<path d={CABIN} fill={cols.cabin} /><path d={MAST} fill={cols.mast} />
	<path d="M-6.4,1.4 L-6.2,4.3 L-6.05,4.3 L-6.25,1.4 Z M-5.0,1.4 L-5.4,4.3 L-5.25,4.3 L-4.85,1.4 Z M-6.3,4.2 L-5.2,4.2 L-5.2,4.34 L-6.3,4.34 Z" fill={cols.mast} />
	{[[-0.9, 2.55, 0.9], [0.35, 2.55, 0.9], [1.6, 2.55, 0.78]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={0.6} fill={cols.win} opacity={cols.winO * (i === 2 ? 0.8 : 1)} />)}
	<path d="M2.45,3.75 L3.55,2.25 L3.2,2.25 L2.25,3.55 Z" fill={cols.win} opacity={cols.winO * 0.6} />
	{night && <><circle cx={0.66} cy={7.55} r={0.12} fill="#fff6e4" /><circle cx={1.7} cy={5.5} r={0.08} fill="#ff6a5a" /></>}
	{/* the life ring on the cabin wall */}
	<circle cx={-0.6} cy={2.0} r={0.28} fill="none" stroke={night ? '#a8442c' : mixHex(cols.cabin, '#c0502c', 0.4)} strokeWidth={0.12} />
</g>;
/** the near parts: the hull side, the bulwark highlight, the rail — drawn over a figure's legs */
export const BoatFront: React.FC<{cols: BoatCols}> = ({cols}) => <g>
	<path d={HULL} fill={cols.hull} />
	<path d={BULWARK_HI} fill={cols.hullHi} />
	<path d={RAIL} fill={cols.mast} />
	{[-5.5, -3.6, -1.6, 0.6].map((x, i) => <ellipse key={i} cx={x} cy={1.0} rx={0.22} ry={0.3} fill={mixHex(cols.hull, '#000000', 0.4)} />)}
</g>;
/** a small escort boat in the distance (one piece, cabin lit) */
export const BoatFar: React.FC<{x: number; y: number; s: number; t: number; cols: BoatCols; refl?: number}> = ({x, y, s, t, cols, refl = 0.3}) => {
	const pitch = 1.4 * Math.sin(t * 1.3) + 0.6 * Math.sin(t * 2.7 + 1);
	return <g transform={`translate(${f1(x)},${f1(y + 1.5 * Math.sin(t * 1.1))}) rotate(${f1(pitch)}) scale(${(s).toFixed(3)},${(-s).toFixed(3)})`}>
		{refl > 0 && <g transform="scale(1,-0.55)" opacity={refl}><path d={HULL + ' ' + CABIN} fill={cols.hull} /></g>}
		<BoatBack cols={cols} t={t} /><BoatFront cols={cols} />
	</g>; };
export const BOAT_DAWN: BoatCols = {hull: '#262a3c', hullHi: '#5a5466', cabin: '#2c3044', win: '#FFC24A', winO: 0.95, mast: '#2a2e40', lamp: 0};

/* ---------------- the swim shot ---------------- */
export type SwimProps = {
	t: number; dur: number; mode: 'swim' | 'float'; h: number; look: SeaLook; ws?: Wave[]; k?: number;
	camH?: number; HZ?: number; sx?: [number, number]; Zs?: number; attire?: Attire;
	boat?: {dX: number; Z: number; refl?: number};
	/** something on the horizon (far land / cliffs), given the camera */
	far?: (c: SeaCam) => React.ReactNode;
	/** the camera rides up out of a swell at the start (a wave wipes off the lens) */
	surface?: number;
	id: string;
};
export const SwimShot: React.FC<SwimProps> = ({t, dur, mode, h, look, ws = CALM, k = 0.75, camH = 0.32, HZ: HZ0 = 440, sx = [880, 960], Zs = 5, attire = 'swim', boat, far, surface = 0, id}) => {
	const camBob = 9 * Math.sin(t * 0.95 + 0.4) + 3.5 * Math.sin(t * 2.1), pxm = h / 1.8, f = pxm * Zs;
	const sec = KARL_CYCLE[mode].sec, phase = t / sec + 0.15, v = mode === 'swim' ? 0.42 * 1.8 / sec : 0.03;
	const Xs = v * t, sxScreen = lerp(sx[0], sx[1], sm(t / dur)), Xcam = Xs - (sxScreen - W / 2) / pxm;
	const zs0 = zeta(ws, Xs, Zs, t, k), follow = 0.66 * zs0 * (f / Zs);
	const c: SeaCam = {HZ: HZ0 + camBob + follow, cam: camH, f, Xcam};
	const slope = zetaDX(ws, Xs, Zs, t, k), [kx, ky] = proj(c, Xs, Zs, zs0);
	const roll = 0.7 * Math.sin(t * 0.8 + 1.1) + 0.25 * Math.sin(t * 1.9);
	const lights: Light[] = look.sun ? [{x: look.sun.x, col: look.glint, spread: 50, k: 1}] : [];
	const far0 = Array.from({length: 16}, (_, i) => 0.035 * Math.pow(0.97 / 0.035, i / 15));
	const near = Array.from({length: 14}, (_, i) => 1.05 * Math.pow(7 / 1.05, i / 13));
	let boatEl: React.ReactNode = null;
	if (boat) { const bX = Xs + boat.dX, bz = zeta(ws, bX, boat.Z, t, k * 0.5), [bx, by] = proj(c, bX, boat.Z, bz); boatEl = <BoatFar x={bx} y={by} s={c.f / boat.Z} t={t} cols={BOAT_DAWN} refl={boat.refl ?? 0.3} />; }
	const split = boat ? Math.max(1, far0.findIndex((n) => Zs / n < boat.Z)) : 5;
	// the breath: the head turns up out of the water (the rig's breath window ≈ 0.46 … 0.9 of the stroke), a puff of spray as he exhales
	const u = ((phase % 1) + 1) % 1, puff = mode === 'swim' ? Math.max(0, Math.sin(Math.PI * cl((u - 0.5) / 0.32))) : 0;
	const head: [number, number] = [kx + 0.08 * h, ky - 0.07 * h];
	// the surfacing wipe: a dark swell face rises over the lens and drops away
	const sw = surface > 0 ? 1 - sm(t / surface) : 0;
	return <g transform={`rotate(${f1(roll)} ${W / 2} ${H / 2})`}>
		<SeaSky c={c} look={look} id={id} t={t} />
		{far && far(c)}
		<Rows c={c} Zs={Zs} t={t} ns={far0.slice(0, split)} ws={ws} k={k} look={look} lights={lights} keyp="fa" />
		{boatEl}
		<Rows c={c} Zs={Zs} t={t} ns={far0.slice(split)} ws={ws} k={k} look={look} lights={lights} keyp="fb" />
		{look.sun && <g opacity={0.5}><ellipse cx={look.sun.x} cy={c.HZ + 90} rx={240} ry={200} fill={look.sun.glow} opacity={0.18} /></g>}
		<Karl x={kx} y={ky} h={h} attire={attire} action={mode} phase={phase} t={t} pitch={-slope * 57.3 * 0.55} rim={mode === 'swim' ? '#ffd2a2' : '#ffd8b0'} lightDir={35} rimO={0.95} foam="#fff2e4" waterHi="#e2bca6" underO={0} />
		{puff > 0.02 && Array.from({length: 7}, (_, i) => { const a = cl((u - 0.5) / 0.32), r = (0.012 + 0.03 * a) * h * (0.6 + 0.6 * rnd(i, 3));
			return <ellipse key={i} cx={f1(head[0] + (0.02 + 0.09 * a + 0.03 * rnd(i, 1)) * h)} cy={f1(head[1] - (0.01 + 0.05 * a * rnd(i, 2)) * h)} rx={f1(r * 1.4)} ry={f1(r)} fill="#fff6ea" opacity={f1(0.32 * puff * (0.5 + 0.5 * rnd(i, 4)))} />; })}
		<Rows c={c} Zs={Zs} t={t} ns={near} ws={ws} k={k} look={look} lights={lights} keyp="nr" />
		{/* spray off the near crests, and big droplets drifting past the lens (soft) */}
		{Array.from({length: 22}, (_, i) => { const a = (t * (0.25 + 0.2 * rnd(i, 2)) + rnd(i, 1)) % 1, x = lerp(-60, W + 60, (rnd(i, 3) + a * 0.35) % 1), y = lerp(H - 120, H - 460, rnd(i, 4)) - 160 * a * a + 40 * Math.sin(a * 9);
			return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(1.4 + 3 * rnd(i, 5))} fill="#fff1e2" opacity={f1(0.55 * Math.sin(Math.PI * a))} />; })}
		{Array.from({length: 5}, (_, i) => { const a = (t * (0.18 + 0.1 * rnd(i, 12)) + rnd(i, 11)) % 1, x = lerp(80, W - 80, rnd(i, 13)), y = lerp(-40, H + 60, a), r = 14 + 26 * rnd(i, 14);
			return <circle key={'b' + i} cx={f1(x)} cy={f1(y)} r={f1(r)} fill="#fff4e4" opacity={f1(0.07 + 0.06 * rnd(i, 15))} />; })}
		{sw > 0 && <g><path d={`M-300,${f1(lerp(-200, H + 300, 1 - sw))} Q${W / 2},${f1(lerp(-320, H + 120, 1 - sw))} ${W + 300},${f1(lerp(-200, H + 300, 1 - sw))} L${W + 300},${H + 600} L-300,${H + 600} Z`} fill="#121a2a" />
			<path d={`M-300,${f1(lerp(-200, H + 300, 1 - sw))} Q${W / 2},${f1(lerp(-320, H + 120, 1 - sw))} ${W + 300},${f1(lerp(-200, H + 300, 1 - sw))}`} stroke="#ffe2c0" strokeWidth={5} fill="none" opacity={0.6} /></g>}
	</g>; };

/* ---------------- the night boat ---------------- */
const BOAT_NIGHT: BoatCols = {hull: '#151b2a', hullHi: '#3a4560', cabin: '#1b2234', win: '#FFC24A', winO: 1, mast: '#1d2436', lamp: 1};
/** a blanket round his shoulders down to the knees (body units of his height, facing +x, y up from the feet) */
const blanketD = (x: number, y: number, h: number, facing: number, br: number) => {
	const P = (u: number, v: number) => `${f1(x + facing * u * h)},${f1(y - v * h - br)}`;
	return {body: `M${P(-0.06, 0.875)} Q${P(-0.15, 0.86)} ${P(-0.16, 0.74)} L${P(-0.17, 0.5)} Q${P(-0.17, 0.36)} ${P(-0.13, 0.31)} L${P(0.02, 0.29)} L${P(0.15, 0.33)} Q${P(0.17, 0.46)} ${P(0.155, 0.62)} Q${P(0.14, 0.78)} ${P(0.09, 0.84)} Q${P(0.03, 0.87)} ${P(-0.06, 0.875)} Z`,
		fold: `M${P(0.11, 0.8)} Q${P(0.07, 0.6)} ${P(0.1, 0.33)} L${P(0.125, 0.33)} Q${P(0.1, 0.6)} ${P(0.135, 0.79)} Z`,
		fold2: `M${P(-0.1, 0.78)} Q${P(-0.08, 0.55)} ${P(-0.11, 0.33)} L${P(-0.09, 0.32)} Q${P(-0.06, 0.55)} ${P(-0.085, 0.78)} Z`,
		hands: `M${P(0.13, 0.66)} m-${f1(0.03 * h)},0 a${f1(0.03 * h)},${f1(0.026 * h)} 0 1,0 ${f1(0.06 * h)},0 a${f1(0.03 * h)},${f1(0.026 * h)} 0 1,0 -${f1(0.06 * h)},0 Z`}; };

export const NightBoat: React.FC<{t: number; dur: number; id: string}> = ({t, dur, id}) => {
	const ws = ROUGH, k = 1, Zb = 15, camH = 2.2, f = 1950;
	const camBob = 22 * Math.sin(t * 0.62 + 0.4) + 6 * Math.sin(t * 1.5), roll = 2.2 * Math.sin(t * 0.55 + 0.8) + 0.6 * Math.sin(t * 1.3);
	const Xb = 0.6 * t, Xcam = Xb + 0.6 - 1.6 * sm(t / dur);
	const c: SeaCam = {HZ: 470 + camBob, cam: camH, f, Xcam};
	// the boat rides the swell: heave from the mean under it, pitch from bow vs stern
	const zb = (zeta(ws, Xb - 4, Zb, t, k) + zeta(ws, Xb, Zb, t, k) + zeta(ws, Xb + 4, Zb, t, k)) / 3, pitch = Math.atan2(zeta(ws, Xb + 5, Zb, t, k) - zeta(ws, Xb - 5, Zb, t, k), 10) * 57.3 * 0.8;
	const [bx, by] = proj(c, Xb, Zb, zb), s = f / Zb;
	const L = (u: number, v: number): [number, number] => { const a = -pitch * Math.PI / 180, x = u * s, y = -v * s; return [bx + x * Math.cos(a) - y * Math.sin(a), by + x * Math.sin(a) + y * Math.cos(a)]; };
	// the lamp swings on its bracket at the back of the wheelhouse (a pendulum lagging the pitch)
	const swing = -pitch * 1.6 + 9 * Math.sin(t * 2.1), piv = L(-1.75, 3.55), lampLen = 0.55 * s, la = (swing) * Math.PI / 180;
	const lamp: [number, number] = [piv[0] + Math.sin(la) * lampLen, piv[1] + Math.cos(la) * lampLen];
	const kh = 1.8 * s, [kx, ky] = L(-4.3, 1.12), br = Math.sin(t * 1.4) * 0.004 * kh;
	const B = blanketD(kx, ky, kh, -1, br);
	const lights: Light[] = [{x: L(0.3, 2.8)[0], col: '#FFC24A', spread: 70, k: 1}, {x: lamp[0], col: '#ffe0a8', spread: 50, k: 0.9}];
	const far0 = Array.from({length: 14}, (_, i) => 0.05 * Math.pow(0.97 / 0.05, i / 13)), near = Array.from({length: 12}, (_, i) => 1.04 * Math.pow(5.5 / 1.04, i / 11));
	const tf = `translate(${f1(bx)},${f1(by)}) rotate(${f1(-pitch)}) scale(${f1(s)},${f1(-s)})`;
	return <g transform={`rotate(${f1(roll)} ${W / 2} ${H / 2})`}>
		<SeaSky c={c} look={NIGHT} id={id} t={t} clouds={[[200, 120, 900, 30], [1000, 200, 1100, 26], [500, 300, 700, 16], [1350, 330, 600, 12]]} />
		{/* stars and a moon glow behind cloud */}
		{Array.from({length: 60}, (_, i) => <circle key={i} cx={f1(rnd(i, 1) * W)} cy={f1(rnd(i, 2) * (c.HZ - 120))} r={f1(0.6 + rnd(i, 3) * 1.1)} fill="#dfe8ff" opacity={f1(0.25 + 0.5 * rnd(i, 4) * (0.6 + 0.4 * Math.sin(t * 3 + i)))} />)}
		<ellipse cx={1500} cy={c.HZ - 300} rx={260} ry={200} fill="#4a5c86" opacity={0.25} />
		<Rows c={c} Zs={Zb} t={t} ns={far0} ws={ws} k={k} look={NIGHT} lights={lights} keyp="nf" crestK={0.6} />
		{/* the boat's far parts, the light pool of the lamp, Karl in his blanket, then the hull side over his legs */}
		<g transform={tf}><BoatBack cols={BOAT_NIGHT} t={t} night /></g>
		<defs><radialGradient id={`${id}lp`}><stop offset="0" stopColor="#ffe2a8" stopOpacity={0.55} /><stop offset="0.4" stopColor="#ffcf80" stopOpacity={0.2} /><stop offset="1" stopColor="#ffcf80" stopOpacity={0} /></radialGradient></defs>
		<ellipse cx={f1(lamp[0])} cy={f1(lamp[1] + 0.9 * s)} rx={f1(2.6 * s)} ry={f1(1.9 * s)} fill={`url(#${id}lp)`} />
		<g transform={`rotate(${f1(-pitch)} ${f1(kx)} ${f1(ky)})`}>
			<Karl x={kx} y={ky} h={kh} attire="home2026" action="stand" phase={t / 4.2 + 0.2} t={t} facing={-1} rim="#ffd79a" lightDir={lamp[0] > kx ? 'right' : 'left'} rimO={1} />
			<path d={B.body} fill="#2a3346" /><path d={B.fold} fill="#4a5470" opacity={0.85} /><path d={B.fold2} fill="#1c2232" opacity={0.9} /><path d={B.hands} fill="#0d0c10" />
			<path d={B.body} fill="none" stroke="#ffd18a" strokeWidth={2} opacity={0.35} transform={`translate(${f1(lamp[0] > kx ? 2 : -2)},-1)`} />
		</g>
		<g transform={tf}><BoatFront cols={BOAT_NIGHT} /></g>
		{/* the lamp itself: bracket, cord, a hot bulb and its halo */}
		<line x1={f1(piv[0])} y1={f1(piv[1])} x2={f1(lamp[0])} y2={f1(lamp[1])} stroke="#0e121c" strokeWidth={2.4} />
		<circle cx={f1(lamp[0])} cy={f1(lamp[1])} r={130} fill={`url(#${id}lp)`} />
		<path d={`M${f1(lamp[0] - 12)},${f1(lamp[1] + 2)} Q${f1(lamp[0])},${f1(lamp[1] - 16)} ${f1(lamp[0] + 12)},${f1(lamp[1] + 2)} Z`} fill="#20283a" transform={`rotate(${f1(-swing)} ${f1(lamp[0])} ${f1(lamp[1])})`} />
		<circle cx={f1(lamp[0])} cy={f1(lamp[1] + 4)} r={6} fill="#fff4dc" />
		{/* the mast light's halo; the windows' glow on the water */}
		{(() => { const m = L(0.66, 7.55); return <circle cx={f1(m[0])} cy={f1(m[1])} r={40} fill={`url(#${id}lp)`} opacity={0.8} />; })()}
		<Rows c={c} Zs={Zb} t={t} ns={near} ws={ws} k={k} look={NIGHT} lights={lights} keyp="nn" crestK={0.9} />
		{/* spray thrown up by the bow, wind-blown spray and rain streaks */}
		{Array.from({length: 26}, (_, i) => { const a = (t * 0.9 + rnd(i, 1)) % 1, p = L(5.5 + rnd(i, 2) * 1.5, 1.6); const x = p[0] + a * (60 + 160 * rnd(i, 3)) - a * 220, y = p[1] - Math.sin(Math.PI * a) * (60 + 120 * rnd(i, 4));
			return <circle key={'bs' + i} cx={f1(x)} cy={f1(y)} r={f1(1.5 + 3 * rnd(i, 5))} fill="#cfdcf0" opacity={f1(0.6 * Math.sin(Math.PI * a))} />; })}
		{Array.from({length: 90}, (_, i) => { const a = (t * (1.1 + 0.6 * rnd(i, 7)) + rnd(i, 6)) % 1, x = lerp(-100, W + 200, rnd(i, 8)) - a * 260, y = lerp(-80, H + 80, a), L2 = 22 + 30 * rnd(i, 9);
			return <line key={'r' + i} x1={f1(x)} y1={f1(y)} x2={f1(x + L2 * 0.35)} y2={f1(y - L2)} stroke="#9fb2d2" strokeWidth={1.2} opacity={f1(0.12 + 0.18 * rnd(i, 10))} />; })}
	</g>; };
