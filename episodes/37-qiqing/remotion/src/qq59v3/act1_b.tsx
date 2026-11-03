/* ep59 v3 · act 1, scenes patagonia / rules / plain: the Patagonian steppe (1998).
   One set (Steppe) in three lights: a dawn gale (wind-flagged lenga trees, lenticular clouds, the Torres-like range under haze, the
   gravel road bending north toward the low sun, tussock grass streaming), a windy morning (the bus), and a sunset (the vast plain).
   World in metres (camera camH up, horizon hz); the road and the fence are projected per point (drawn outside Layers). */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage, Layer, Shape, FigureSlot, Particles, Glow, SkyGrad, Sun, INF, W, H, P, f1, lerp, rnd, cl, sm, eio, mix, poly, taper, spline, ridge, fbm, noise1,
	useStage, useWorld, useProject, World, Cam, CAM0, addCam, drift, GOLD, useUid, karlTravel, FogBand, Mist} from './kit3';
import {Cart} from './karl3';
import {Print3, PH3} from './photo3';
import {tuftD, blobD, CloudBands} from './props3';
import type {SceneProps, SceneDef} from './EP59V3';
import {hit, ein, eout, shotAt, useFogD} from './act1_kit';

type Pal = {sky: [number, string][]; sun: [number, number, number]; sunC: string; haze: string; density: number; mtn: string; snow: string; hill: string; plain: string; ground: [string, string];
	grass: string; grassHi: string; tree: string; rim: string; lightDir: number; lens: [string, string, string]; road: string; dust: string};
const PAL: Record<'dawn' | 'morning' | 'sunset', Pal> = {
	dawn: {sky: [[0, '#171c3c'], [0.22, '#2c3262'], [0.4, '#5c5584'], [0.5, '#a7758c'], [0.545, '#eaa58c'], [0.56, '#ffd2a0']], sun: [1090, 438, 24], sunC: '#ffcf96', haze: '#b495a4', density: 0.03,
		mtn: '#4b4468', snow: '#f0c4bc', hill: '#3e344e', plain: '#7a6460', ground: ['#8a6c58', '#2a1e1e'], grass: '#3a2f26', grassHi: '#e9b47a', tree: '#1c1a1e', rim: '#ffd29a', lightDir: 12,
		lens: ['#3b3a66', '#8f6f92', '#ffc29a'], road: '#6a5650', dust: '#f1d2b0'},
	morning: {sky: [[0, '#21406e'], [0.3, '#47699a'], [0.5, '#88a4c2'], [0.59, '#d6d2c4']], sun: [260, -120, 40], sunC: '#fff2d8', haze: '#a9b6c4', density: 0.028,
		mtn: '#55627e', snow: '#f4f4f2', hill: '#46506a', plain: '#9a8a62', ground: ['#a8915e', '#4a3a24'], grass: '#5e4a2c', grassHi: '#f0d590', tree: '#232420', rim: '#fff0cf', lightDir: 150,
		lens: ['#6c86aa', '#c9d2dc', '#f6efe4'], road: '#8e7c66', dust: '#efe2c4'},
	sunset: {sky: [[0, '#140f2c'], [0.25, '#36204a'], [0.45, '#7e3450'], [0.57, '#d25c46'], [0.64, '#ff9a4c'], [0.66, '#ffcb78']], sun: [1210, 528, 40], sunC: '#ffb860', haze: '#a8566a', density: 0.03,
		mtn: '#4a2a48', snow: '#ff9a7c', hill: '#3a2038', plain: '#6a3644', ground: ['#6a3a3c', '#1c1014'], grass: '#2a1a1a', grassHi: '#ffb35a', tree: '#140e14', rim: '#ffbe6a', lightDir: 8,
		lens: ['#3a2350', '#a14460', '#ffb070'], road: '#7a4a48', dust: '#ffcf96'},
};

/** wind gusts: 0.5 ± 0.5, moving across the frame right → left */
const gust = (t: number, x: number) => 0.55 + 0.45 * noise1(t * 1.6 + x / 380, 7);

/** a lenticular cloud: a stack of smooth lenses, lit from below */
const Lenticular: React.FC<{x: number; y: number; w: number; h: number; n: number; cols: [string, string, string]; t: number}> = ({x, y, w, h, n, cols, t}) => {
	const id = useUid('ln');
	return <g><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={cols[0]} /><stop offset="0.6" stopColor={cols[1]} /><stop offset="1" stopColor={cols[2]} /></linearGradient></defs>
		{Array.from({length: n}, (_, i) => { const ww = w * (1 - i * 0.16), yy = y - i * h * 0.55, xx = x + (i - n / 2) * w * 0.03 + Math.sin(t * 0.2 + i) * 3, hh = h * (1 - i * 0.1);
			return <path key={i} d={`M${f1(xx - ww / 2)},${f1(yy)} C${f1(xx - ww * 0.25)},${f1(yy - hh)} ${f1(xx + ww * 0.25)},${f1(yy - hh)} ${f1(xx + ww / 2)},${f1(yy)} C${f1(xx + ww * 0.2)},${f1(yy + hh * 0.32)} ${f1(xx - ww * 0.2)},${f1(yy + hh * 0.32)} ${f1(xx - ww / 2)},${f1(yy)} Z`} fill={`url(#${id})`} opacity={0.9 - i * 0.12} />; })}</g>;
};
/** a far range: a fractal ridge with Torres-like spires, snow above a line (clipped), a lit edge toward the sun */
const Range: React.FC<{y: number; amp: number; seed: number; col: string; snow: string; spires?: [number, number, number][]; litDx: number; snowY: number}> = ({y, amp, seed, col, snow, spires = [], litDx, snowY}) => {
	const id = useUid('rg'), fog = (c: string) => c;
	const fn = (x: number) => amp * 0.55 + fbm(x, 420, amp * 0.45, seed, 5, 0.55) + spires.reduce((s, [sx, sw, sh]) => s + sh * Math.exp(-Math.pow((x - sx) / sw, 2)) * (1 + 0.15 * Math.sin(x / 9)), 0);
	const d = ridge(-300, W + 300, (x) => fn(x) - y, y + 800, 8);
	return <g><defs><clipPath id={id}><path d={d} /></clipPath></defs>
		<g transform={`translate(${litDx},-2)`}><path d={d} fill={snow} opacity={0.35} /></g>
		<path d={d} fill={fog(col)} />
		<rect x={-300} y={-400} width={W + 600} height={snowY + 400} fill={snow} opacity={0.55} clipPath={`url(#${id})`} />
	</g>;
};
/** a wind-flagged lenga: a trunk bent to leeward, every branch streaming left, foliage flags fluttering in the gusts */
const flagTree = (x: number, y: number, h: number, seed: number, g: number): string[] => {
	const lean = 0.8 + 0.25 * g, out: string[] = [];
	const tp: P[] = [[x, y], [x - h * 0.03 * lean, y - h * 0.3], [x - h * 0.13 * lean, y - h * 0.58], [x - h * 0.32 * lean, y - h * 0.8], [x - h * 0.55 * lean, y - h * 0.9]];
	out.push(taper(tp, h * 0.075, h * 0.018));
	for (let k = 0; k < 6; k++) { const u = 0.38 + k * 0.1, i = Math.min(3, Math.floor(u * 4)), f = u * 4 - i, b: P = [lerp(tp[i][0], tp[i + 1][0], f), lerp(tp[i][1], tp[i + 1][1], f)], L = h * (0.42 - k * 0.03) * (0.8 + 0.4 * rnd(k, seed));
		const tip: P = [b[0] - L, b[1] + L * (0.05 - 0.06 * rnd(k, seed + 1)) - g * h * 0.015];
		out.push(taper([b, [lerp(b[0], tip[0], 0.5), b[1] - L * 0.06], tip], h * 0.02, h * 0.006));
		out.push(blobD(lerp(b[0], tip[0], 0.62) - g * h * 0.02, b[1] - h * 0.03 + Math.sin(g * 6 + k) * h * 0.005, L * 0.5, h * (0.045 + 0.02 * rnd(k, seed + 2)), seed + k * 3, 11, 0.32)); }
	out.push(blobD(tp[4][0] - h * 0.18, tp[4][1] - h * 0.01, h * 0.26, h * 0.05, seed + 40, 11, 0.3));
	return out; };
/** a band of tussocks (coirón) along base y at one depth: blades bent by the wind; lit tips toward the sun */
const Tussocks: React.FC<{y: number; n: number; seed: number; hgt: number; col: string; hi: string; t: number; spread?: number; x0?: number; x1?: number; hiO?: number; wind: number}> = ({y, n, seed, hgt, col, hi, t, spread = 60, x0 = -200, x1 = W + 200, hiO = 0.5, wind}) => {
	const ds: string[] = [];
	for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + rnd(i, seed) * 0.9) / n), yy = y + (rnd(i, seed + 1) - 0.5) * hgt * 0.3, g = gust(t, x);
		ds.push(tuftD(x, yy, hgt < 25 ? 5 : 7, hgt * (0.6 + 0.6 * rnd(i, seed + 2)), spread, seed + i, -wind * (14 + 34 * g))); }
	const d = ds.join(' ');
	return <g><g transform="translate(2,-1.5)"><Shape d={d} fill={hi} o={hiO} /></g><Shape d={d} fill={col} /></g>; };

export type SteppeOpt = {pal: keyof typeof PAL; world: World; focus: number; wind: number; road?: 'north' | 'side' | 'none'; roadD?: number; fence?: boolean; trees?: boolean; aperture?: number};
/** the road as a ground ribbon through (X, D) centre points (metres), width w */
const Road: React.FC<{w: World; pts: [number, number][]; width: number; col: string; edge: string}> = ({w, pts, width, col, edge}) => {
	const wp = useWorld(w), fog = useFogD();
	const L: P[] = [], R: P[] = [], LE: P[] = [], RE: P[] = [];
	pts.forEach(([X, D], i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dd = b[1] - a[1], l = Math.hypot(dx, dd) || 1, nx = -dd / l, nd = dx / l;
		L.push(wp(X + nx * width / 2, 0, D + nd * width / 2)); R.push(wp(X - nx * width / 2, 0, D - nd * width / 2));
		LE.push(wp(X + nx * (width / 2 - 0.25), 0, D + nd * (width / 2 - 0.25))); RE.push(wp(X - nx * (width / 2 - 0.25), 0, D - nd * (width / 2 - 0.25))); });
	const mid = pts.map(([X, D]) => wp(X, 0, D));
	const rut = (k: number) => 'M' + pts.map(([X, D], i) => { const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)], dx = c[0] - a[0], dd = c[1] - a[1], l = Math.hypot(dx, dd) || 1, q = wp(X - dd / l * k, 0, D + dx / l * k); return `${f1(q[0])},${f1(q[1])}`; }).join(' L');
	return <g>
		<path d={spline([...L, ...R.slice().reverse()], true)} fill={fog(col, 6)} />
		<path d={spline([...LE, ...L.slice().reverse()], true) + ' ' + spline([...R, ...RE.slice().reverse()], true)} fill={fog(edge, 6)} opacity={0.6} />
		<path d={'M' + mid.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} fill="none" stroke={fog(edge, 6)} strokeWidth={3} opacity={0.3} />
		{[-1.1, -0.75, 0.75, 1.1].map((k) => <path key={k} d={rut(k)} fill="none" stroke={fog(mix(col, '#000', 0.35), 6)} strokeWidth={Math.abs(k) > 1 ? 2.2 : 3.2} opacity={0.55} />)}
	</g>; };
/** fence posts and wires along a line of (X, D) points */
const Fence: React.FC<{w: World; pts: [number, number][]; col: string}> = ({w, pts, col}) => {
	const wp = useWorld(w), fog = useFogD();
	const posts = pts.map(([X, D]) => { const b = wp(X, 0, D), tp = wp(X, 1.2, D), wd = Math.max(1.2, Math.abs(b[1] - tp[1]) * 0.06); return {b, tp, wd, D}; });
	return <g>
		{[0.55, 1.0].map((hy, k) => <path key={k} d={'M' + pts.map(([X, D]) => { const p = wp(X, hy, D); return `${f1(p[0])},${f1(p[1])}`; }).join(' L')} fill="none" stroke={fog(col, 8)} strokeWidth={1.1} opacity={0.6} />)}
		{posts.map((p, i) => <path key={i} d={poly([[p.b[0] - p.wd, p.b[1]], [p.b[0] + p.wd, p.b[1]], [p.tp[0] + p.wd * 0.8, p.tp[1]], [p.tp[0] - p.wd * 0.8, p.tp[1]]])} fill={fog(col, p.D)} />)}
	</g>; };
/** leans a figure forward about its feet (a skew keeps the planted feet and the wheels on the ground) */
const Lean: React.FC<{x: number; y: number; D: number; deg: number; children: React.ReactNode}> = ({x, y, D, deg, children}) => {
	const pr = useProject(), q = pr(D, [x, y]).p;
	return <g transform={`translate(${f1(q[0])},${f1(q[1])}) skewX(${(-deg).toFixed(2)}) translate(${f1(-q[0])},${f1(-q[1])})`}>{children}</g>; };

/** the steppe: everything but the figures (`fig` is drawn between the near grass bands; `mid` behind the near grass, in front of the road) */
export const Steppe: React.FC<{t: number; cam: Cam; o: SteppeOpt; fig?: React.ReactNode; mid?: React.ReactNode; far?: React.ReactNode}> = ({t, cam, o, fig, mid, far}) => {
	const p = PAL[o.pal], w = o.world, hz = w.hz, gy = (D: number) => hz + w.camH * w.S / D, wx = (X: number, D: number) => w.vpx + X * w.S / D;
	const lit = o.pal === 'morning' ? -3 : 3;
	const roadPts: [number, number][] = o.road === 'north' ? [[-18, 6.3], [-8, 6.4], [-2, 6.6], [1.6, 7.3], [3.4, 9.4], [4.5, 13], [5.1, 20], [5.5, 35], [5.7, 70], [5.8, 300]]
		: o.road === 'side' ? Array.from({length: 13}, (_, i) => [-40 + i * 7, (o.roadD ?? 6.5) + 0.004 * (i - 6) * (i - 6)] as [number, number]) : [];
	const fencePts: [number, number][] = o.road === 'north' ? Array.from({length: 18}, (_, i) => { const D = 6 * Math.pow(1.32, i); return [8.4 - 3.0 * Math.exp(-D / 9) + 0.0 * D, D] as [number, number]; })
		: o.road === 'side' ? Array.from({length: 30}, (_, i) => [-40 + i * 3.2, (o.roadD ?? 6.5) + 4.2] as [number, number]) : [];
	return <Stage t={t} cam={cam} atm={{haze: p.haze, density: p.density, focus: o.focus, aperture: o.aperture ?? 1.15, rim: p.rim, lightDir: p.lightDir, grain: 0.075, vignette: 0.6, pp: [w.vpx, hz]}} bg="#120f18">
		<Layer D={INF}>
			<SkyGrad y0={-500} y1={hz + 30} stops={p.sky} />
			{p.sun[1] > 0 && <Sun x={p.sun[0]} y={p.sun[1]} r={p.sun[2]} c={p.sunC} bloom={9} bloomO={0.75} pillar={o.pal === 'sunset' ? 90 : undefined} />}
			{p.sun[1] < 0 && <Glow x={p.sun[0]} y={60} r={1100} ry={600} c={p.sunC} o={0.35} />}
			<CloudBands id={`a1sb${o.pal}`} t={t} bands={[[hz - 330, 26, 4, 0.45], [hz - 190, 18, 8, 0.5], [hz - 95, 12, 12, 0.6]]} top={p.lens[0]} mid={p.lens[1]} under={p.lens[1]} warm={p.lens[2]} warmFrom={1} drift={-30 * o.wind - 4} />
			<Lenticular x={1240 - t * 4} y={hz - 380} w={760} h={60} n={4} cols={p.lens} t={t} />
			<Lenticular x={420 - t * 3} y={hz - 470} w={620} h={44} n={3} cols={p.lens} t={t} />
			<Lenticular x={1700 - t * 4} y={hz - 250} w={420} h={30} n={3} cols={p.lens} t={t} />
		</Layer>
		<Layer D={160}><Range y={hz + 4} amp={150} seed={3} col={mix(p.mtn, p.haze, 0.35)} snow={p.snow} litDx={lit} snowY={hz - 105} spires={[[1420, 26, 120], [1480, 20, 160], [1530, 24, 110], [520, 60, 70]]} /></Layer>
		<Layer D={70}><Range y={hz + 6} amp={70} seed={9} col={p.hill} snow={p.hill} litDx={lit} snowY={-999} />
			<FogBand y={hz - 6} h={70} o={0.55} /></Layer>
		<Layer D={40}>
			<path d={`M-600,${hz - 2} L${W + 600},${hz - 2} L${W + 600},${H + 600} L-600,${H + 600} Z`} fill={mix(p.plain, p.haze, 0.35)} />
			<defs><linearGradient id={`a1gr${o.pal}`} gradientUnits="userSpaceOnUse" x1="0" y1={hz} x2="0" y2={H}><stop offset="0" stopColor={p.ground[0]} /><stop offset="1" stopColor={p.ground[1]} /></linearGradient></defs>
			<path d={`M-600,${hz + 6} L${W + 600},${hz + 6} L${W + 600},${H + 600} L-600,${H + 600} Z`} fill={`url(#a1gr${o.pal})`} />
			{o.pal !== 'morning' && <ellipse cx={p.sun[0] - 120} cy={hz + 12} rx={380} ry={7} fill={p.sunC} opacity={0.4} />}
		</Layer>
		{o.trees !== false && <Layer D={20}><Shape d={flagTree(wx(-12, 20), gy(20), 6 * w.S / 20, 5, gust(t, 300)).join(' ') + ' ' + flagTree(wx(-10, 17), gy(17), 4.6 * w.S / 17, 9, gust(t, 360)).join(' ')} fill={mix(p.tree, p.haze, 0.35)} />
			<Tussocks y={gy(20)} n={20} seed={41} hgt={14} col={mix(p.grass, p.haze, 0.45)} hi={p.grassHi} hiO={0.25} t={t} spread={50} wind={o.wind} /></Layer>}
		{far}
		{o.trees !== false && <Layer D={15}><Tussocks y={gy(15)} n={28} seed={45} hgt={20} col={mix(p.grass, p.haze, 0.38)} hi={p.grassHi} hiO={0.3} t={t} spread={60} wind={o.wind} /></Layer>}
		{roadPts.length > 0 && <Road w={w} pts={roadPts} width={4.4} col={p.road} edge={mix(p.road, '#ffffff', 0.18)} />}
		{fencePts.length > 0 && o.fence !== false && <Fence w={w} pts={fencePts} col="#2a2224" />}
		<Layer D={10.5}><Tussocks y={gy(10.5)} n={32} seed={51} hgt={30} col={mix(p.grass, p.haze, 0.3)} hi={p.grassHi} hiO={0.35} t={t} spread={70} wind={o.wind} /></Layer>
		{o.trees !== false && <Layer D={7.5}><Shape d={flagTree(wx(-6.2, 7.5), gy(7.5), 7 * w.S / 7.5, 13, gust(t, 60)).join(' ')} fill={mix(p.tree, p.haze, 0.18)} /></Layer>}
		{mid}
		{fig}
		<Layer D={3.3}><Tussocks y={gy(3.3)} n={26} seed={66} hgt={44} col={mix(p.grass, p.haze, 0.08)} hi={p.grassHi} hiO={0.5} t={t} spread={90} wind={o.wind} /></Layer>
		<Particles kind="sand" n={80} seed={61} D={[1.5, 12]} box={[-100, hz - 300, W + 100, H + 40]} c={p.dust} o={0.6 * o.wind} size={1.3} wind={-1300 * o.wind} />
		<Particles kind="spindrift" n={26} seed={62} D={[2, 9]} box={[-100, hz - 420, W + 100, H]} c={p.dust} o={0.32 * o.wind} size={0.9} wind={-1700 * o.wind} />
		<Layer D={2.6}><Tussocks y={gy(2.6)} n={16} seed={71} hgt={95} col={p.grass} hi={p.grassHi} hiO={0.55} t={t} spread={120} wind={o.wind} /></Layer>
		<Layer D={1.15} blur={9}><Tussocks y={H + 60} n={7} seed={81} hgt={420} col={mix(p.grass, '#000', 0.4)} hi={p.grassHi} hiO={0.3} t={t} spread={260} x0={-300} x1={W + 300} wind={o.wind} /></Layer>
	</Stage>;
};

/* ======================================================= PATAGONIA ======================================================= */
const PW: World = {hz: 600, vpx: 960, S: 1000, camH: 1.0};
const PF = 4.55, Y98 = PH3.young1998;
const PatagoniaScene: React.FC<SceneProps> = ({t, dur, beat}) => {
	const u = cl(t / dur), h = 1.8 * PW.S / PF, tr = karlTravel('pushCart', t + 0.4, h, 0.45), x0 = PW.vpx - 2.25 * PW.S / PF, kx = x0 + tr.dx, ky = PW.hz + PW.camH * PW.S / PF;
	const cam = addCam({...CAM0, x: lerp(-40, 150, u), y: lerp(16, -6, u), z: 0.5 * u}, drift(t, 1.1, 2));
	const g = gust(t, kx), lean = 9 + 4 * g;
	const fig = <Lean x={kx} y={ky} D={PF} deg={lean}><FigureSlot x={kx} y={ky} h={h} attire="start1998" action="pushCart" phase={tr.phase} facing={1} rimO={0.95} contact={0.3} /></Lean>;
	return <AbsoluteFill>
		<Steppe t={t} cam={cam} o={{pal: 'dawn', world: PW, focus: PF, wind: 1, road: 'north'}} fig={fig} />
		<Print3 src={Y98.src} pos={Y98.pos} aspect={Y98.aspect} t={t - 2 * beat} dur={2.4} w={320} cx={1475} cy={430} rot={3} from="right" caption="1998 · 智利" />
	</AbsoluteFill>;
};

/* ======================================================= RULES: the bus ======================================================= */
const RW: World = {hz: 640, vpx: 960, S: 1000, camH: 1.0};
const RF = 6.0, RB = 9.6;   // Karl on the near shoulder; the bus in the lane behind him
/** a 1990s intercity coach in profile (rest px at depth RB): body, livery stripe, windows lit, the folding front door, wheels */
const Bus: React.FC<{x: number; y: number; s: number; door: number; t: number; v: number}> = ({x, y, s, door, t, v}) => {
	const id = useUid('bus'), L = 12 * s, Hh = 3.35 * s, x0 = x - L, wR = 0.5 * s, fog = (c: string) => c;
	const body = `M${f1(x0)},${f1(y - 0.45 * s)} L${f1(x0)},${f1(y - Hh + 0.2 * s)} Q${f1(x0)},${f1(y - Hh)} ${f1(x0 + 0.3 * s)},${f1(y - Hh)} L${f1(x - 0.7 * s)},${f1(y - Hh)} Q${f1(x - 0.12 * s)},${f1(y - Hh + 0.1 * s)} ${f1(x - 0.05 * s)},${f1(y - Hh * 0.55)} L${f1(x)},${f1(y - 0.6 * s)} Q${f1(x)},${f1(y - 0.45 * s)} ${f1(x - 0.15 * s)},${f1(y - 0.45 * s)} Z`;
	const wins: string[] = []; for (let k = 0; k < 7; k++) { const a = x0 + 0.5 * s + k * 1.42 * s; if (a + 1.25 * s > x - 2.3 * s) break; wins.push(`M${f1(a)},${f1(y - Hh + 0.55 * s)} h${f1(1.28 * s)} v${f1(1.0 * s)} h${f1(-1.28 * s)} Z`); }
	const dx0 = x - 1.95 * s, dw = 0.95 * s, dy0 = y - Hh + 0.45 * s, dy1 = y - 0.42 * s, half = dw / 2 * (1 - door * 0.82);
	const wheel = (cx: number) => { const sp = t * v / (wR) ; return <g key={cx}><circle cx={cx} cy={y - wR} r={wR} fill="#121014" /><circle cx={cx} cy={y - wR} r={wR * 0.5} fill="#4a4648" />
		{[0, 1, 2, 3, 4].map((k) => { const a = sp + k * 1.2566; return <line key={k} x1={cx} y1={y - wR} x2={cx + Math.cos(a) * wR * 0.46} y2={y - wR + Math.sin(a) * wR * 0.46} stroke="#2a2628" strokeWidth={s * 0.05} />; })}</g>; };
	return <g>
		<defs><linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d8d0c0" /><stop offset="0.7" stopColor="#b3aa98" /><stop offset="1" stopColor="#7d7666" /></linearGradient>
			<linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe2a6" /><stop offset="1" stopColor="#f0a24e" /></linearGradient></defs>
		<ellipse cx={x - L / 2} cy={y + 2} rx={L * 0.55} ry={0.18 * s} fill="#000" opacity={0.35} />
		<path d={body} fill={`url(#${id}b)`} />
		<path d={`M${f1(x0)},${f1(y - 1.25 * s)} L${f1(x - 0.02 * s)},${f1(y - 1.25 * s)} L${f1(x - 0.02 * s)},${f1(y - 1.0 * s)} L${f1(x0)},${f1(y - 1.0 * s)} Z`} fill="#8a2e2a" />
		<path d={`M${f1(x0)},${f1(y - 0.92 * s)} L${f1(x - 0.02 * s)},${f1(y - 0.92 * s)} L${f1(x - 0.02 * s)},${f1(y - 0.84 * s)} L${f1(x0)},${f1(y - 0.84 * s)} Z`} fill="#c9873a" />
		<path d={wins.join(' ')} fill="#2c3240" /><path d={wins.join(' ')} fill="#ffcf8a" opacity={0.18 + 0.25 * door} />
		<path d={`M${f1(x - 1.0 * s)},${f1(y - Hh + 0.3 * s)} L${f1(x - 0.18 * s)},${f1(y - Hh + 0.3 * s)} Q${f1(x - 0.06 * s)},${f1(y - Hh * 0.75)} ${f1(x - 0.07 * s)},${f1(y - Hh * 0.52)} L${f1(x - 1.0 * s)},${f1(y - Hh * 0.52)} Z`} fill="#3a4252" />
		<path d={`M${f1(x0 + 0.4 * s)},${f1(y - Hh - 0.02 * s)} h${f1(L - 1.6 * s)} v${f1(0.06 * s)} h${f1(-(L - 1.6 * s))} Z`} fill="#efe8da" opacity={0.6} />
		{/* the door: the lit stairwell, and the two leaves folding to the sides */}
		<path d={`M${f1(dx0)},${f1(dy0)} h${f1(dw)} v${f1(dy1 - dy0)} h${f1(-dw)} Z`} fill={`url(#${id}d)`} />
		<path d={`M${f1(dx0 + 0.1 * s)},${f1(dy1 - 0.3 * s)} h${f1(dw * 0.8)} v${f1(0.06 * s)} h${f1(-dw * 0.8)} Z M${f1(dx0 + 0.18 * s)},${f1(dy1 - 0.6 * s)} h${f1(dw * 0.7)} v${f1(0.06 * s)} h${f1(-dw * 0.7)} Z`} fill="#b07436" opacity={0.7} />
		<path d={`M${f1(dx0)},${f1(dy0)} h${f1(half)} v${f1(dy1 - dy0)} h${f1(-half)} Z M${f1(dx0 + dw - half)},${f1(dy0)} h${f1(half)} v${f1(dy1 - dy0)} h${f1(-half)} Z`} fill="#3a4252" />
		<path d={`M${f1(dx0)},${f1(dy0)} h${f1(dw)} v${f1(dy1 - dy0)} h${f1(-dw)} Z`} fill="none" stroke="#5a5650" strokeWidth={s * 0.04} />
		{door > 0.05 && <Glow x={dx0 + dw / 2} y={dy1 - 0.2 * s} r={2.4 * s} ry={1.0 * s} c={GOLD} o={0.5 * door} />}
		<text x={x - 0.6 * s} y={y - Hh + 0.22 * s} textAnchor="end" style={{fontFamily: "'Inter Display', 'DejaVu Sans', sans-serif", fontWeight: 800, fontSize: 0.2 * s}} fill="#ffcf6a" opacity={0.9}>PUERTO NATALES</text>
		{[x0 + 2.4 * s, x0 + 3.6 * s, x - 2.9 * s].map(wheel)}
		<path d={`M${f1(x - 0.06 * s)},${f1(y - 1.1 * s)} h${f1(0.08 * s)} v${f1(0.22 * s)} h${f1(-0.08 * s)} Z`} fill="#fff4d0" />
		<Glow x={x + 0.02 * s} y={y - 1.0 * s} r={0.9 * s} c="#fff2c8" o={0.6} />
	</g>;
};
/** the far arm raised, waving the bus on (drawn under the body: in profile it reads as the far arm) */
const WaveArm: React.FC<{x: number; y: number; h: number; u: number; wave: number; rim: string}> = ({x, y, h, u, wave, rim}) => {
	if (u <= 0.01) return null;
	const sh: P = [x + 0.015 * h, y - 0.8 * h], el: P = [x + lerp(0.02, 0.13, u) * h, y - lerp(0.62, 0.9, u) * h], wa = lerp(-80, 25 + 18 * wave, u) * Math.PI / 180;
	const hd: P = [el[0] + Math.sin(wa) * 0.15 * h, el[1] - Math.cos(wa) * 0.15 * h * (u > 0.5 ? 1 : -1)];
	const arm = taper([sh, el], 0.075 * h, 0.06 * h) + ' ' + taper([el, hd], 0.058 * h, 0.045 * h) + ` M${f1(hd[0] - 0.026 * h)},${f1(hd[1])} a${f1(0.026 * h)},${f1(0.032 * h)} 0 1,0 ${f1(0.052 * h)},0 a${f1(0.026 * h)},${f1(0.032 * h)} 0 1,0 ${f1(-0.052 * h)},0 Z`;
	return <g><g transform="translate(2.2,-1.2)"><path d={arm} fill={rim} opacity={0.7} /></g><path d={arm} fill="#121116" /></g>;
};
const RulesScene: React.FC<SceneProps> = ({t, dur, beat}) => {
	const b = beat, cutB = 4 * b, cutC = 7 * b, shot = shotAt(t, [cutB, cutC]), h = 1.8 * RW.S / RF, ky = RW.hz + RW.camH * RW.S / RF, by = RW.hz + RW.camH * RW.S / RB, bs = RW.S / RB;
	// the bus (front x, rest px at RB): rolls in decelerating, stops; the door folds open; closes; pulls away
	const tStop = 3 * b, tGo = 5.6 * b, bx = t < tStop ? 1330 - 0.5 * 700 * Math.pow(tStop - t, 2) : t < tGo ? 1330 : 1330 + 0.5 * 1500 * Math.pow(t - tGo, 2);
	const bv = t < tStop ? 700 * (tStop - t) : t < tGo ? 0 : 1500 * (t - tGo);
	const door = t < 5 * b ? eio((t - tStop) / (1.1 * b)) : 1 - eio((t - 5 * b) / (0.6 * b));
	// Karl: pushes (shot A), stands and waves (B), pushes on (C)
	const xA = 300, trA = karlTravel('pushCart', t, h, 0.75), xStop = xA + karlTravel('pushCart', cutB, h, 0.75).dx, trC = karlTravel('pushCart', Math.max(0, t - cutC), h, 0.8);
	const kx = shot === 0 ? xA + trA.dx : shot === 1 ? xStop : xStop + trC.dx;
	const armU = eout((t - cutB - 0.5 * b) / (0.9 * b)), wave = Math.sin(Math.PI * 2 * (t - cutB) / (2 * b));
	const k = shot === 1 ? 1 : 0, u = cl(t / dur);
	const camW = addCam({...CAM0, x: lerp(-40, 60, u), z: 0.15 * u}, drift(t, 0.9, 4));
	const kxs = 960 + (kx - 960), camB: Cam = {x: kxs - 960 + 230, y: 40, zoom: 1.75 + 0.08 * cl((t - cutB) / (cutC - cutB)), roll: 0, z: 0};
	const cam = k ? addCam(camB, drift(t, 0.6, 4)) : camW;
	const busEl = <Layer D={RB}><Bus x={bx} y={by} s={bs} door={door} t={t} v={bv} /></Layer>;
	const fig = shot === 1
		? <><Cart x={kx + 0.62 * h} y={ky} h={h} kind="beast98" facing={1} rimO={0.9} lightDir={150} rim="#fff0cf" />
			<FigureSlot x={kx} y={ky} h={h} attire="start1998" action="stand" phase={t / 4.2} facing={1} rimO={0.9} contact={0.3} under={<WaveArm x={kx} y={ky} h={h} u={armU} wave={wave} rim="#fff0cf" />} /></>
		: <FigureSlot x={kx} y={ky} h={h} attire="start1998" action="pushCart" phase={shot === 0 ? trA.phase : trC.phase + 0.3} facing={1} rimO={0.9} contact={0.3} />;
	return <Steppe t={t} cam={cam} o={{pal: 'morning', world: RW, focus: RF, wind: 0.65, road: 'side', roadD: 7.7, trees: true}} mid={busEl} fig={k ? <g>{fig}</g> : fig} />;
};

/* ======================================================= PLAIN: sunset ======================================================= */
const SW: World = {hz: 690, vpx: 960, S: 1000, camH: 1.0};
const SF = 24;
const PlainScene: React.FC<SceneProps> = ({t, dur}) => {
	const u = cl(t / dur), h = 1.8 * SW.S / SF, tr = karlTravel('pushCart', t + 3, h, 0.85), kx = 700 + tr.dx, ky = SW.hz + SW.camH * SW.S / SF;
	const cam = addCam({...CAM0, x: lerp(-40, 40, u), y: lerp(-10, 6, u), z: 0.6 * u}, drift(t, 0.8, 6));
	const fig = <FigureSlot x={kx} y={ky} h={h} attire="start1998" action="pushCart" phase={tr.phase} facing={1} rimO={1} rim="#ffc070" lightDir={5} shadow={{k: 3.0, skew: 2.4, o: 0.55, blur: 1.2}} />;
	return <Steppe t={t} cam={cam} o={{pal: 'sunset', world: SW, focus: SF, wind: 0.35, road: 'side', roadD: SF, trees: true, fence: true, aperture: 0.45}} fig={fig} />;
};

export const ACT1B: Record<'patagonia' | 'rules' | 'plain', SceneDef> = {
	patagonia: {C: PatagoniaScene},
	rules: {C: RulesScene},
	plain: {C: PlainScene, tin: 'dissolve', ov: 0.3},
};
