import React from 'react';
import {Stage, Layer, FPath, Shape, Particles, Mist, FogBand, Glow, SkyGrad, Sun, Cam, INF, useFog, useGround, useProject, P, W, H, f1, lerp, rnd, noise1, spline, poly, mix, cl, sm, wrap} from './kit3';
import {iceBlockPts} from './props3';
import {Fig, IceRidge, IceCols, ICE_DAY, travel, travelStop} from './act2_kit';

/* ep59 v3 · act 2 · the Bering sea ice by day / at a low sun (after sets3b's Bering set, re-cut so the figures travel and the camera
   tracks them), and the polar bear. Ground: horizon hz, a ground row at depth D sits at y = hz + K/D. */
export const IB = {focus: 2.7, hz: 560, K: 720};
export const igY = (D: number) => IB.hz + IB.K / D;

/** a long flat cloud streak */
const streakD = (x: number, y: number, w: number, h: number, seed: number) => spline([
	...Array.from({length: 9}, (_, i) => [x - w / 2 + (i / 8) * w, y - h * (0.3 + 0.7 * Math.sin(Math.PI * i / 8)) * (0.6 + rnd(i, seed) * 0.8)] as P),
	[x + w / 2 + h, y + h * 0.15], [x, y + h * 0.35], [x - w / 2 - h, y + h * 0.15]], true);

export type Mood = {sky: [number, string][]; deckTop: string; deckMid: string; deckWarm: string; deckLow: string; streak: string; sunC: string; sunCore: string; sheen: string; sheen2: string; haze: string; bg: string};
export const DAY: Mood = {sky: [[0, '#1c2644'], [0.22, '#344068'], [0.38, '#6c6890'], [0.46, '#b38e9e'], [0.505, '#efc3a4'], [0.519, '#fbdcb5'], [0.52, '#f2d5c4'], [0.56, '#cdb6c4'], [0.7, '#9b9cc4'], [1, '#56679a']],
	deckTop: '#2a3157', deckMid: '#5b5378', deckWarm: '#ffc9a2', deckLow: '#d99b98', streak: '#ffd6b0', sunC: '#ffbe8a', sunCore: '#fff4e2', sheen: '#ffd2b0', sheen2: '#e9b9b6', haze: '#d4bccb', bg: '#202a48'};
/** the sun on the horizon: deeper, redder, longer shadows */
export const LOW: Mood = {sky: [[0, '#161c36'], [0.2, '#2c2f58'], [0.36, '#5d4c72'], [0.45, '#a8697a'], [0.5, '#e98f6e'], [0.518, '#ffc27e'], [0.52, '#f0b49c'], [0.56, '#c99aa8'], [0.7, '#8c85b0'], [1, '#4b5688']],
	deckTop: '#231f43', deckMid: '#53406a', deckWarm: '#ffad78', deckLow: '#d4806f', streak: '#ffb98a', sunC: '#ff9e62', sunCore: '#ffe8c8', sheen: '#ffb98e', sheen2: '#d99a9c', haze: '#c9a3b4', bg: '#1b2140'};

const CloudDeck: React.FC<{t: number; m: Mood; sun: P}> = ({t, m, sun}) => {
	const bands: [number, number, number, number][] = [[96, 40, 3, 0.45], [205, 54, 7, 0.7], [318, 26, 11, 0.6], [392, 18, 15, 0.6], [446, 11, 19, 0.55], [478, 7, 23, 0.5]];
	return <g>{bands.map(([yc, th, seed, o], b) => {
		const segs: string[] = [], dx = t * (6 - b);
		for (let x0 = -500 + rnd(b, seed) * 500, j = 0; x0 < W + 500; j++) { const len = (260 + Math.pow(rnd(j, seed), 2) * 1500) * (1 - b * 0.1), gap = (60 + Math.pow(rnd(j, seed + 1), 1.5) * 700) * (1 - b * 0.12), thj = 0.5 + rnd(j, seed + 2) * 0.9, yj = (rnd(j, seed + 3) - 0.5) * th * 0.8;
			const top: P[] = [], bot: P[] = [];
			for (let k = 0; k <= 16; k++) { const u = k / 16, x = x0 + u * len + dx, env = Math.pow(Math.sin(Math.PI * u), 0.5) * thj;
				top.push([x, yc + yj - th * env * (0.55 + 0.45 * Math.abs(noise1(x / (60 + b * 10), seed + b)))]); bot.push([x, yc + yj + th * 0.18 * env + noise1(x / 200, seed) * 2]); }
			segs.push(spline([...top, ...bot.reverse()], true)); x0 += len + gap; }
		const id = `a2cdk${b}`;
		return <g key={b}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={m.deckTop} /><stop offset="0.55" stopColor={m.deckMid} /><stop offset="1" stopColor={b > 2 ? m.deckWarm : m.deckLow} /></linearGradient></defs>
			<Shape d={segs.join(' ')} fill={`url(#${id})`} o={o} /></g>; })}
		<Glow x={sun[0]} y={420} r={700} ry={160} c={m.deckWarm} o={0.25} />
	</g>; };

const IceSky: React.FC<{t: number; m: Mood; sun: P; sunR?: number}> = ({t, m, sun, sunR = 23}) => <>
	<SkyGrad y0={0} y1={H} stops={m.sky} />
	<CloudDeck t={t} m={m} sun={sun} />
	{[[900, 506, 900, 8], [1700, 498, 700, 7], [420, 516, 600, 5], [1380, 520, 380, 4]].map(([x, y, w, h], i) => <path key={i} d={streakD(x - t * 1.2, y, w, h, i + 20)} fill={m.streak} opacity={0.55} />)}
	<Sun x={sun[0]} y={sun[1]} r={sunR} c={m.sunC} core={m.sunCore} bloom={11} bloomO={0.75} />
	<Glow x={sun[0]} y={IB.hz + 14} r={900} ry={70} c={m.sheen} o={0.75} />
	<Glow x={sun[0]} y={IB.hz + 120} r={700} ry={180} c={m.sheen2} o={0.35} />
</>;

/** an open lead of black water across the middle distance (ground decal) with the sun's streak on it */
const LeadDecal: React.FC<{t: number; sunX: number; streak: string}> = ({t, sunX, streak}) => {
	const g = useGround(IB.hz, IB.K), cl0: P[] = [[2900, 583], [2300, 586], [1900, 588], [1550, 592], [1300, 597], [1060, 601], [900, 607], [800, 616], [760, 626], [640, 638], [420, 645], [160, 660], [-300, 690], [-900, 700]];
	const half = (y: number, i = 0) => (y - IB.hz) * 0.24 * (0.65 + 0.7 * rnd(i, 17));
	const top = cl0.map(([x, y], i) => [x, y - half(y, i)] as P), bot = cl0.map(([x, y], i) => [x, y + half(y, i) * 0.8] as P);
	const water = spline([...top, ...bot.reverse()].map(g), true);
	const lip = spline([...top, ...top.slice().reverse().map(([x, y]) => [x, y - (y - IB.hz) * 0.06] as P)].map(g), true);
	const sk = Array.from({length: 7}, (_, i) => { const y = 593 + (i - 3) * 2.2, w = 18 + Math.sin(t * 2 + i) * 4 + (3 - Math.abs(i - 3)) * 8, x = sunX + Math.sin(t * 1.3 + i * 2) * 3;
		const a = g([x - w, y]), b = g([x + w, y]); return `M${f1(a[0])},${f1(a[1] - 0.8)} L${f1(b[0])},${f1(b[1] - 0.8)} L${f1(b[0])},${f1(b[1] + 0.8)} L${f1(a[0])},${f1(a[1] + 0.8)} Z`; }).join(' ');
	return <g>
		<defs><linearGradient id="a2leadw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1a2036" /><stop offset="0.55" stopColor="#2b2a40" /><stop offset="0.66" stopColor="#5a4650" /><stop offset="0.72" stopColor="#2b2a40" /><stop offset="1" stopColor="#1d2238" /></linearGradient></defs>
		<path d={water} fill="url(#a2leadw)" /><path d={lip} fill="#f6d8c6" opacity={0.7} /><path d={sk} fill={streak} opacity={0.95} />
	</g>; };

/** wind-carved ripples on the snow (ground decals) */
const Sastrugi: React.FC<{n: number; seed: number; y0: number; y1: number; x0?: number; x1?: number; sh?: string; hi?: string}> = ({n, seed, y0, y1, x0 = -900, x1 = W + 1400, sh = '#4c5a8c', hi = '#f5d7cc'}) => {
	const g = useGround(IB.hz, IB.K), S: string[] = [], Hh: string[] = [];
	for (let i = 0; i < n; i++) { const u = Math.pow(rnd(i, seed), 1.7), y = lerp(y0, y1, u), x = x0 + rnd(i, seed + 1) * (x1 - x0), d = y - IB.hz, L = d * (1.2 + rnd(i, seed + 2) * 2.2), th = d * 0.035;
		const a: P[] = [[x - L / 2, y], [x - L * 0.1, y - th * 0.6], [x + L / 2, y - th * 0.2], [x + L * 0.1, y + th * 0.5]];
		S.push(spline(a.map(g), true)); Hh.push(spline(a.map(([px, py]) => [px - L * 0.04, py - th * 0.5] as P).map(g), true)); }
	return <g><Shape d={S.join(' ')} fill={sh} o={0.42} /><Shape d={Hh.join(' ')} fill={hi} o={0.32} /></g>; };

/** sled tracks along a ground row (y at rest), from far left up to x1 (rest px at that row) */
const RowTracks: React.FC<{y: number; x1: number; c?: string}> = ({y, x1, c = '#3d4884'}) => {
	const g = useGround(IB.hz, IB.K), d = y - IB.hz, w = d * 0.016;
	const strip = (dy: number) => { const a = g([-1600, y + dy - w / 2]), b = g([x1, y + dy - w / 2]), c2 = g([x1, y + dy + w / 2]), e = g([-1600, y + dy + w / 2]); return poly([a, b, c2, e]); };
	return <path d={strip(-d * 0.05) + ' ' + strip(d * 0.05)} fill={c} opacity={0.55} />; };

/** a near snow drift with a wind-cut cornice */
const DriftFG: React.FC<{x0?: number}> = ({x0 = 1060}) => {
	const fog = useFog(), crest: P[] = [[x0, 1080], [x0 + 140, 990], [x0 + 340, 955], [x0 + 580, 935], [x0 + 840, 928], [x0 + 1400, 945]];
	const body = spline([...crest, [x0 + 1400, 1300], [x0 - 60, 1300]], true);
	const lip = spline([...crest, ...crest.slice().reverse().map(([x, y], i) => [x - 6, y + 7 + (i % 2) * 4] as P)], true);
	return <g><defs><linearGradient id="a2drf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={fog('#8b92c4')} /><stop offset="0.5" stopColor={fog('#5e6aa0')} /><stop offset="1" stopColor={fog('#46528a')} /></linearGradient></defs>
		<path d={body} fill="url(#a2drf)" /><path d={lip} fill={fog('#f7d9cc')} opacity={0.85} /></g>; };

/** out-of-focus foreground ice blocks */
const FgIce: React.FC<{blocks: [number, number, number, number, number][]}> = ({blocks}) => <g>{blocks.map(([x, y, w, h2, s], i) => { const p = iceBlockPts(x, y, w, h2, s);
	return <g key={i}><path d={poly(p)} fill={i % 2 ? '#252f5c' : '#2e3a6c'} /><path d={poly([p[2], p[3], p[4], [lerp(p[3][0], p[5][0], 0.5), lerp(p[3][1], p[5][1], 0.6)], [lerp(p[2][0], p[0][0], 0.2), lerp(p[2][1], p[0][1], 0.3)]])} fill="#7f8cc4" opacity={0.75} />
		<path d={poly([p[2], p[3], [p[3][0], p[3][1] + 18], [p[2][0] + 20, p[2][1] + 26]])} fill="#ffe6da" opacity={0.85} /></g>; })}</g>;

/** the sea-ice world. Slots: `ridge` (drawn on the D = 9 ridge layer, e.g. the bear), `figs` (the figure plane). */
export const IceWorld: React.FC<{t: number; cam: Cam; m: Mood; sun: P; sunR?: number; figs: React.ReactNode; ridge?: React.ReactNode; track?: {y: number; x1: number}[]; fg?: boolean | 'right'; spin?: number; ridgeX?: [number, number]}> = ({t, cam, m, sun, sunR, figs, ridge, track = [], fg = true, spin = 1, ridgeX = [1380, 3000]}) => {
	const cols: IceCols = m === DAY ? ICE_DAY : {lit: '#f4b9a0', shade: '#4f4f80', cap: '#ffe0cc'};
	return <Stage t={t} cam={cam} atm={{haze: m.haze, density: 0.028, focus: IB.focus, aperture: 1.6, rim: '#ffd6a8', lightDir: 8, grain: 0.055, vignette: 0.5, pp: [sun[0], IB.hz]}} bg={m.bg}>
		<Layer D={INF}><IceSky t={t} m={m} sun={sun} sunR={sunR} /></Layer>
		<Layer D={60}><IceRidge x0={-800} x1={2800} y={igY(60)} hmin={1} hmax={5} seed={2} cols={cols} rows={1} /></Layer>
		<Layer D={28}><IceRidge x0={-900} x1={1050} y={igY(28)} hmin={3} hmax={16} seed={5} cols={cols} rows={1} /><IceRidge x0={1620} x1={2800} y={igY(28)} hmin={3} hmax={12} seed={6} cols={cols} rows={1} /></Layer>
		<Layer D={INF}><LeadDecal t={t} sunX={sun[0]} streak={m.streak} /></Layer>
		<Layer D={11}><Mist n={7} seed={8} y0={590} y1={612} t={t} speed={14} o={0.5} c="#f7dccf" w={[300, 800]} h={[16, 36]} /></Layer>
		<Layer D={9}><IceRidge x0={ridgeX[0]} x1={ridgeX[1]} y={igY(9)} hmin={14} hmax={60} seed={9} cols={cols} />{ridge}</Layer>
		<Layer D={INF}><Sastrugi n={150} seed={4} y0={IB.hz + 30} y1={1120} />{track.map((k, i) => <RowTracks key={i} y={k.y} x1={k.x1} />)}</Layer>
		<Layer D={3.4}><IceRidge x0={-900} x1={430} y={igY(3.4)} hmin={30} hmax={165} seed={13} cols={cols} rows={4} />
			<FPath d={spline([[-900, igY(3.4) - 20], [0, igY(3.4) - 40], [300, igY(3.4) - 30], [560, igY(3.4) - 6], [700, igY(3.4) + 14], [-900, igY(3.4) + 40]], true)} c="#7884b6" /></Layer>
		{figs}
		<Particles kind="diamond" n={30} seed={21} D={[2.5, 10]} box={[700, 572, 1760, 820]} c="#fff1dc" o={0.9} size={0.9} />
		<Particles kind="spindrift" n={110} seed={22} D={[1.3, 9]} box={[-100, 600, W + 100, 1100]} c="#f8e6e2" o={0.65 * spin} wind={-600} />
		<Layer D={2.4}><IceRidge x0={1680} x1={3200} y={igY(2.4)} hmin={20} hmax={110} seed={41} cols={cols} rows={2} /></Layer>
		<Layer D={1.7}><DriftFG x0={1500} /></Layer>
		{fg && <Layer D={0.5} blur={13}><FgIce blocks={[...(fg === 'right' ? [] : [[80, 1200, 520, 420, 3], [-160, 1180, 420, 560, 9], [330, 1230, 300, 260, 5]] as [number, number, number, number, number][]), [2000, 1200, 480, 380, 7], [1780, 1250, 300, 230, 11]]} /></Layer>}
	</Stage>;
};

/* ===================================================== the polar bear =====================================================
   Side view, drawn facing +x in bear units (body ≈ 1 long, shoulder ≈ 0.55 high, ground y = 0, y up), mirrored by `facing`.
   A slow plantigrade walk (lateral sequence: hind L, fore L, hind R, fore R), the long neck swinging low, the head lifting to look.
   Back-lit: a warm rim all round (a stroke under the fill) and a brighter one along the top. */
type BP = [number, number];
/** the walk: lateral sequence, a slow plantigrade plod; each leg is [hip, knee, paw] in bear units */
const bearLegs = (ph: number, walking: number) => {
	// [hip x, hip y, phase offset, fore?, near?]
	const L: [number, number, number, boolean, boolean][] = [[-0.34, 0.4, 0.0, false, false], [0.2, 0.38, 0.25, true, false], [-0.34, 0.4, 0.5, false, true], [0.2, 0.38, 0.75, true, true]];
	return L.map(([hx, hy, off, fore, near]) => {
		const u = ((ph + off) % 1 + 1) % 1, stance = u < 0.64, step = 0.24 * walking, base = hx + (fore ? 0.03 : -0.01);
		const fx = stance ? base + step * (0.5 - u / 0.64) : base + step * (-0.5 + sm((u - 0.64) / 0.36)), fy = stance ? 0 : 0.07 * walking * Math.sin(Math.PI * (u - 0.64) / 0.36);
		const lift = stance ? 0 : Math.sin(Math.PI * (u - 0.64) / 0.36) * walking;
		// fore legs: the wrist flexes back while the paw swings; hind legs: the hock is high and set back
		const knee: BP = fore ? [lerp(hx, fx, 0.55) - 0.035 * lift, lerp(hy, fy, 0.5) + 0.02 * lift] : [lerp(hx, fx, 0.45) + 0.05 + 0.03 * lift, lerp(hy, fy, 0.48)];
		return {hip: [hx, hy] as BP, knee, paw: [fx, fy] as BP, fore, near};
	});
};
/** a polar bear, side on. Drawn facing +x in bear units (≈ 1.3 long nose to tail, hips ≈ 0.62 high), y up; s = px per unit.
    walk 0..1 (plodding), look 0..1 (stops, lifts the head and points the nose at the men). Lit from behind: warm cream on the top
    and the back, cold lavender underneath, a bright rim on the outline. */
export const Bear: React.FC<{x: number; y: number; s: number; t: number; walk: number; look: number; facing?: 1 | -1; rim?: string; o?: number}> = ({x, y, s, t, walk, look, facing = -1, rim = '#ffe6c4', o = 1}) => {
	const ph = t * 0.85 * walk + 0.13, bob = 0.01 * Math.sin(ph * 4 * Math.PI) * walk, br = 0.004 * Math.sin(t * 2.2);
	const S = (p: BP): P => [x + facing * p[0] * s, y - (p[1] + (p[1] > 0.25 ? bob + br : 0)) * s];
	const legs = bearLegs(ph, walk);
	const legD = (lg: ReturnType<typeof bearLegs>[number]) => { const w0 = lg.fore ? 0.085 : 0.11, wm = lg.fore ? 0.06 : 0.065, w1 = 0.052, pts: BP[] = [[lg.hip[0], lg.hip[1] + 0.06], lg.hip, lg.knee, lg.paw];
		const L: P[] = [], R: P[] = [];
		pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(3, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = i < 2 ? w0 : i === 2 ? wm : w1;
			L.push(S([p[0] - dy / l * w, p[1] + dx / l * w])); R.push(S([p[0] + dy / l * w, p[1] - dx / l * w])); });
		const pw = lg.paw, paw = ([[pw[0] - 0.06, pw[1] + 0.05], [pw[0] + 0.05, pw[1] + 0.045], [pw[0] + 0.095, pw[1] + 0.012], [pw[0] + 0.085, pw[1] - 0.002], [pw[0] - 0.065, pw[1] - 0.002]] as BP[]).map(S);
		return spline([...L, ...R.reverse()], true) + ' ' + spline(paw, true); };
	// the head swings low while it walks (nose to the ice); when it looks, the neck rises a little and the nose lifts toward the men
	const sw = 0.025 * Math.sin(ph * 2 * Math.PI) * walk, lk = look, a = (-8 + 26 * lk) * Math.PI / 180;
	const nb: BP = [0.3, 0.5], rot = (p: BP): BP => { const dx = p[0] - nb[0], dy = p[1] - nb[1]; return [nb[0] + dx * Math.cos(a) - dy * Math.sin(a), nb[1] + dx * Math.sin(a) + dy * Math.cos(a) + sw]; };
	const neckHead: BP[] = ([[0.42, 0.52], [0.56, 0.48], [0.62, 0.475], [0.68, 0.455], [0.76, 0.42], [0.81, 0.395], [0.83, 0.375], [0.815, 0.36], [0.76, 0.35], [0.69, 0.345], [0.6, 0.34], [0.5, 0.33], [0.42, 0.31]] as BP[]).map(rot);
	const bodyPts: BP[] = [[-0.6, 0.46], [-0.58, 0.55], [-0.5, 0.62], [-0.36, 0.645], [-0.18, 0.615], [0.0, 0.6], [0.16, 0.6], [0.28, 0.56], ...neckHead, [0.33, 0.27], [0.24, 0.22], [0.08, 0.2], [-0.12, 0.2], [-0.3, 0.24], [-0.48, 0.3], [-0.58, 0.37]];
	const bodyD = spline(bodyPts.map(S), true);
	const earB = rot([0.6, 0.47]), ear = spline(([[earB[0] - 0.025, earB[1] - 0.005], [earB[0] - 0.012, earB[1] + 0.04], [earB[0] + 0.018, earB[1] + 0.006]] as BP[]).map(S), true);
	const nose = rot([0.815, 0.38]), eye = rot([0.69, 0.43]);
	const far = legs.filter((l) => !l.near).map(legD).join(' '), near = legs.filter((l) => l.near).map(legD).join(' ');
	const top = y - 0.66 * s, bot = y, gid = `bearg${Math.round(x)}${Math.round(s)}`, sw2 = Math.max(1.6, s * 0.018);
	// the lit top: the back line, offset a little inside
	const backLit = spline(([[-0.57, 0.53], [-0.5, 0.62], [-0.36, 0.645], [-0.18, 0.615], [0.0, 0.6], [0.16, 0.6], [0.28, 0.56], ...[[0.42, 0.52], [0.56, 0.48], [0.62, 0.475]].map((p) => rot(p as BP)),
		...[[0.6, 0.445], [0.5, 0.47]].map((p) => rot(p as BP)), [0.27, 0.52], [0.15, 0.56], [0.0, 0.56], [-0.18, 0.575], [-0.36, 0.6], [-0.48, 0.575], [-0.55, 0.51]] as BP[]).map(S), true);
	return <g opacity={o}>
		<defs><linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={bot}><stop offset="0" stopColor="#f3d3c2" /><stop offset="0.35" stopColor="#c9adb6" /><stop offset="0.75" stopColor="#7a72a0" /><stop offset="1" stopColor="#5d5a8a" /></linearGradient></defs>
		<Glow x={x} y={y - s * 0.4} r={s * 1.2} ry={s * 0.62} c={rim} o={0.3} />
		<g fill={rim} stroke={rim} strokeWidth={sw2} strokeLinejoin="round"><path d={far} /><path d={bodyD} /><path d={ear} /><path d={near} /></g>
		<path d={far} fill="#5a5688" /><path d={bodyD} fill={`url(#${gid})`} /><path d={ear} fill="#d9bcb8" /><path d={near} fill={`url(#${gid})`} />
		<path d={backLit} fill="#fff0de" opacity={0.75} />
		<circle cx={S(nose)[0]} cy={S(nose)[1]} r={Math.max(1, s * 0.016)} fill="#151218" />
		<circle cx={S(eye)[0]} cy={S(eye)[1]} r={Math.max(0.8, s * 0.009)} fill="#151218" />
	</g>;
};

/* ===================================================== scenes =====================================================
   ice  : the vast frozen strait at the end of the polar day; Karl and Dimitri haul left → right; the camera cranes down out of the sky
          and trucks with them (they hold their place, the ice flows by). The beringIce print tosses in on beat 4.
   bear : the sun on the horizon; a polar bear on a pressure ridge far off, rim-lit; they slow and stop; the camera pushes toward the bear. */
const fgH = 232;
export const IceShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur}) => {
	const tr = travel('haulSled', t + 2, fgH, 1, 1, 0, 1), D2 = 3.3, h2 = fgH * IB.focus / D2;
	const u = cl(t / dur), e = sm(u);
	const cam: Cam = {x: tr.dx - 120 + 40 * e, y: lerp(-230, 10, Math.pow(e, 0.8)), z: lerp(-0.25, 0.22, e), zoom: lerp(1.0, 1.04, e), roll: lerp(-0.6, 0.15, e)};
	const kx = 860 + tr.dx, dx2 = tr.dx * IB.focus / D2, dX = 560 + dx2;
	const figs = <>
		<Fig x={dX} y={igY(D2)} h={h2} depth={D2} attire="ice" action="haulSled" phase={tr.phase + 0.37} rim="#ffd6a8" lightDir={12} shadow={{k: 0.3, skew: 2.6, o: 0.8, c: '#323d7c', blur: 1.2}} />
		<Fig x={kx} y={igY(IB.focus)} h={fgH} depth={IB.focus} attire="ice" action="haulSled" phase={tr.phase} rim="#ffd6a8" lightDir={12} shadow={{k: 0.3, skew: 2.6, o: 0.8, c: '#323d7c', blur: 1.2}} />
	</>;
	return <IceWorld t={t} cam={cam} m={DAY} sun={[1540, 536]} figs={figs} track={[{y: igY(D2), x1: dX - h2 * 0.95}, {y: igY(IB.focus), x1: kx - fgH * 0.95}]} />;
};

export const BearShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur, beat}) => {
	const h = 268, stop = 2 * beat;   // they halt by beat 2 (both feet down: the haul cycle at a whole phase)
	const tr = travelStop('haulSled', t, h, 0.9, 0, stop, 0);
	const ph = tr.phase, D2 = 3.25, h2 = h * IB.focus / D2;
	const u = cl(t / dur), e = sm(u);
	const cam: Cam = {x: tr.dx * 0.6 + lerp(-40, 120, e), y: lerp(20, -10, e), z: lerp(0, 0.5, e), zoom: 1, roll: lerp(0.3, -0.2, e)};
	const kx = 780 + tr.dx, dX = 500 + tr.dx * IB.focus / D2;
	const bearRest = 1240, look = sm((t - 4 * beat) / (2 * beat));
	const walk = 1 - sm((t - 3 * beat) / (1.2 * beat));
	const bx = bearRest - 30 * (Math.min(t, 3.6 * beat)) * 0.9;
	const ridge = <Bear x={bx} y={igY(9) - 44} s={150} t={t} walk={walk} look={look} facing={-1} rim="#ffd7a8" />;
	const figs = <>
		<Fig x={dX} y={igY(D2)} h={h2} depth={D2} attire="ice" action="haulSled" phase={ph + 0.5} rim="#ffcf98" lightDir={6} shadow={{k: 0.34, skew: 3.0, o: 0.8, c: '#2c2f6a', blur: 1.2}} />
		<Fig x={kx} y={igY(IB.focus)} h={h} depth={IB.focus} attire="ice" action="haulSled" phase={ph} rim="#ffcf98" lightDir={6} shadow={{k: 0.34, skew: 3.0, o: 0.8, c: '#2c2f6a', blur: 1.2}} />
	</>;
	return <IceWorld t={t + 3} cam={cam} m={LOW} sun={[1330, 548]} sunR={26} figs={figs} ridge={ridge} ridgeX={[860, 1760]} fg="right" track={[{y: igY(D2), x1: dX - h2 * 0.95}, {y: igY(IB.focus), x1: kx - h * 0.95}]} spin={0.5} />;
};
void FogBand; void useProject; void f1; void wrap;
