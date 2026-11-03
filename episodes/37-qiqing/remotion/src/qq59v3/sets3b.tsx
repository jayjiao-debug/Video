import React from 'react';
import {Stage, Layer, FPath, Shape, FigureSlot, Particles, Mist, FogBand, FogFoot, Glow, SkyGrad, Sun, Cam, INF, useFog, useGround, useProject, GroundShape, P, W, H, f1, lerp, rnd, noise1, fbm, spline, taper, poly, mix, cl} from './kit3';
import {iceBlockPts, bareTreeD, coniferD, forestD, tuftD, leafD} from './props3';
import {SetProps} from './sets3a';

/* ep59 v3 · hero sets B: the Bering Strait sea ice, the Siberian winter road. */

/* ---------- shared: pressure-ridge ice blocks lit from one side ---------- */
type IceCols = {lit: string; shade: string; cap: string};
/** a row of tumbled ice blocks on base line y: shadow faces, faces lit from the right (sun) and snow caps */
const IceRidge: React.FC<{x0: number; x1: number; y: number; hmin: number; hmax: number; seed: number; cols: IceCols; rows?: number; extra?: number; wide?: number}> = ({x0, x1, y, hmin, hmax, seed, cols, rows = 2, extra = 0, wide = 1}) => {
	const fog = useFog(), shade: string[] = [], lit: string[][] = [[], [], []], cap: string[] = [];
	for (let r = 0; r < rows; r++) {
		const yr = y - (rows - 1 - r) * hmax * 0.1, sc = 1 - r / rows * 0.45;
		for (let x = x0 + (r % 2) * hmax * 0.3, i = 0; x < x1; i++) {
			const env = Math.pow(Math.sin(Math.PI * cl((x - x0) / (x1 - x0))), 0.6), h = (hmin + (hmax - hmin) * Math.pow(rnd(i, seed + r * 7), 1.5) * env) * sc, w = h * (0.6 + rnd(i, seed + 1 + r) * 0.9) * wide, sd = seed * 31 + i * 7 + r * 101;
			const pts = iceBlockPts(x + w / 2, yr + rnd(i, seed + 3) * h * 0.12, w, h, sd);
			const [p0, , p2, p3, p4, p5] = pts;
			shade.push(poly(pts));
			const mid: P = [(p0[0] + p5[0]) / 2 + w * 0.12, yr];
			lit[Math.floor(rnd(i, seed + 9 + r) * 3)].push(poly([p3, p4, p5, mid, [lerp(p2[0], p3[0], 0.3), lerp(p2[1], p3[1], 0.3) + h * 0.12]]));
			cap.push(poly([p2, p3, [p3[0], p3[1] + h * 0.07], [lerp(p2[0], p3[0], 0.5), lerp(p2[1], p3[1], 0.5) + h * 0.16], [p2[0] + w * 0.05, p2[1] + h * 0.1]]));
			x += w * (0.4 + rnd(i, seed + 5) * 0.4);
		}
	}
	return <g><Shape d={shade.join(' ')} fill={fog(cols.shade, extra)} />{lit.map((l, k) => <Shape key={k} d={l.join(' ')} fill={fog(mix(cols.lit, cols.shade, k * 0.28), extra)} />)}<Shape d={cap.join(' ')} fill={fog(cols.cap, extra)} /></g>; };

/** a long flat cloud streak (spline blob) */
const streakD = (x: number, y: number, w: number, h: number, seed: number) => spline([
	...Array.from({length: 9}, (_, i) => [x - w / 2 + (i / 8) * w, y - h * (0.3 + 0.7 * Math.sin(Math.PI * i / 8)) * (0.6 + rnd(i, seed) * 0.8)] as P),
	[x + w / 2 + h, y + h * 0.15], [x, y + h * 0.35], [x - w / 2 - h, y + h * 0.15]], true);

/* ===================================================== 2 · BERING STRAIT =====================================================
   March 2006, the frozen strait at the end of a polar day. The sun sits low on the right third; an open lead of black water
   snakes across the middle distance under it (gold streak, sea smoke). Two tiny figures haul sleds left → right toward it, their
   shadows long on the snow; their sled tracks lead in from the bottom left. A pressure ridge frames the left, ice blocks the corners. */
const IB = {focus: 5, hz: 560, K: 720, sun: [1300, 534] as P};
const igY = (D: number) => IB.hz + IB.K / D;
const ICE: IceCols = {lit: '#efc9ba', shade: '#59628f', cap: '#fbe9df'};

const IceSky: React.FC<{t: number}> = ({t}) => {
	const dr = t * 4;
	return <>
		<SkyGrad y0={0} y1={H} stops={[[0, '#1c2644'], [0.22, '#344068'], [0.38, '#6c6890'], [0.46, '#b38e9e'], [0.505, '#efc3a4'], [0.519, '#fbdcb5'], [0.52, '#f2d5c4'], [0.56, '#cdb6c4'], [0.7, '#9b9cc4'], [1, '#56679a']]} />
		{/* an altocumulus deck in rows, lit pink-gold from below by the low sun; smaller and denser toward the horizon */}
		<CloudDeck t={t} />
		{/* low lit streaks near the horizon */}
		{[[900, 506, 900, 8], [1700, 498, 700, 7], [420, 516, 600, 5], [1380, 520, 380, 4]].map(([x, y, w, h], i) => <path key={i} d={streakD(x - dr * 0.3, y, w, h, i + 20)} fill="#ffd6b0" opacity={0.55} />)}
		<Sun x={IB.sun[0]} y={IB.sun[1]} r={23} c="#ffbe8a" core="#fff4e2" bloom={11} bloomO={0.75} />
		{/* the ice plain: a warm sheen under the sun, cooler toward us */}
		<Glow x={IB.sun[0]} y={IB.hz + 14} r={900} ry={70} c="#ffd2b0" o={0.75} />
		<Glow x={IB.sun[0]} y={IB.hz + 120} r={700} ry={180} c="#e9b9b6" o={0.35} />
	</>; };

/** cloud bands: long broken strata with bumpy tops and flat lit undersides (gradient: dark blue top → warm underside), in perspective */
const CloudDeck: React.FC<{t: number}> = ({t}) => {
	const bands: [number, number, number, number][] = [[96, 40, 3, 0.45], [205, 54, 7, 0.7], [318, 26, 11, 0.6], [392, 18, 15, 0.6], [446, 11, 19, 0.55], [478, 7, 23, 0.5]];
	return <g>{bands.map(([yc, th, seed, o], b) => {
		const segs: string[] = [], dx = t * (6 - b);
		for (let x0 = -300 + rnd(b, seed) * 500, j = 0; x0 < W + 300; j++) { const len = (260 + Math.pow(rnd(j, seed), 2) * 1500) * (1 - b * 0.1), gap = (60 + Math.pow(rnd(j, seed + 1), 1.5) * 700) * (1 - b * 0.12), thj = 0.5 + rnd(j, seed + 2) * 0.9, yj = (rnd(j, seed + 3) - 0.5) * th * 0.8;
			const top: P[] = [], bot: P[] = [];
			for (let k = 0; k <= 16; k++) { const u = k / 16, x = x0 + u * len + dx, env = Math.pow(Math.sin(Math.PI * u), 0.5) * thj;
				top.push([x, yc + yj - th * env * (0.55 + 0.45 * Math.abs(noise1(x / (60 + b * 10), seed + b)))]); bot.push([x, yc + yj + th * 0.18 * env + noise1(x / 200, seed) * 2]); }
			segs.push(spline([...top, ...bot.reverse()], true)); x0 += len + gap; }
		const id = `cdk${b}`;
		return <g key={b}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a3157" /><stop offset="0.55" stopColor="#5b5378" /><stop offset="1" stopColor={b > 2 ? '#ffc9a2' : '#d99b98'} /></linearGradient></defs>
			<Shape d={segs.join(' ')} fill={`url(#${id})`} o={o} /></g>; })}
		<Glow x={IB.sun[0]} y={420} r={700} ry={160} c="#ffcfa0" o={0.25} />
	</g>; };

/** the open lead: a winding band of black water across the middle distance (ground decal), with the sun's streak and a lit far edge */
const Lead: React.FC<{t: number}> = ({t}) => {
	const g = useGround(IB.hz, IB.K), cl0: P[] = [[2300, 583], [1900, 588], [1550, 592], [1300, 597], [1060, 601], [900, 607], [800, 616], [760, 626], [640, 638], [420, 645], [160, 660], [-300, 700]];
	const half = (y: number, i = 0) => (y - IB.hz) * 0.24 * (0.65 + 0.7 * rnd(i, 17));
	const top = cl0.map(([x, y], i) => [x, y - half(y, i)] as P), bot = cl0.map(([x, y], i) => [x, y + half(y, i) * 0.8] as P);
	const water = spline([...top, ...bot.reverse()].map(g), true);
	const lip = spline([...top, ...top.slice().reverse().map(([x, y]) => [x, y - (y - IB.hz) * 0.06] as P)].map(g), true);
	const streak = Array.from({length: 7}, (_, i) => { const y = 596 + (i - 3) * 2.2, w = 18 + Math.sin(t * 2 + i) * 4 + (3 - Math.abs(i - 3)) * 8, x = IB.sun[0] + Math.sin(t * 1.3 + i * 2) * 3;
		const a = g([x - w, y]), b = g([x + w, y]); return `M${f1(a[0])},${f1(a[1] - 0.8)} L${f1(b[0])},${f1(b[1] - 0.8)} L${f1(b[0])},${f1(b[1] + 0.8)} L${f1(a[0])},${f1(a[1] + 0.8)} Z`; }).join(' ');
	const pans = Array.from({length: 7}, (_, i) => { const k = 1 + Math.floor(rnd(i, 4) * 5), [x, y] = cl0[k], u = rnd(i, 5) - 0.5, s = (y - IB.hz) * 0.12;
		return spline(([[x + u * 200 - s * 2, y], [x + u * 200, y - s * 0.5], [x + u * 200 + s * 2.4, y - s * 0.2], [x + u * 200 + s * 1.5, y + s * 0.6]] as P[]).map(g), true); }).join(' ');
	return <g>
		<defs><linearGradient id="leadw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1a2036" /><stop offset="0.55" stopColor="#2b2a40" /><stop offset="0.66" stopColor="#5a4650" /><stop offset="0.72" stopColor="#2b2a40" /><stop offset="1" stopColor="#1d2238" /></linearGradient></defs>
		<path d={water} fill="url(#leadw)" />
		<path d={lip} fill="#f6d8c6" opacity={0.75} />
		<path d={streak} fill="#ffd79a" opacity={0.95} />
		<Shape d={pans} fill="#d9c3cf" o={0.85} />
	</g>; };

/** sastrugi: wind-carved ripples on the snow (ground decals): a blue shadow crescent under a pink lit lip */
const Sastrugi: React.FC<{n: number; seed: number; y0: number; y1: number}> = ({n, seed, y0, y1}) => {
	const g = useGround(IB.hz, IB.K), sh: string[] = [], hi: string[] = [];
	for (let i = 0; i < n; i++) { const u = Math.pow(rnd(i, seed), 1.7), y = lerp(y0, y1, u), x = -300 + rnd(i, seed + 1) * (W + 600), d = y - IB.hz, L = d * (1.2 + rnd(i, seed + 2) * 2.2), th = d * 0.035;
		const a: P[] = [[x - L / 2, y], [x - L * 0.1, y - th * 0.6], [x + L / 2, y - th * 0.2], [x + L * 0.1, y + th * 0.5]];
		sh.push(spline(a.map(g), true)); hi.push(spline(a.map(([px, py]) => [px - L * 0.04, py - th * 0.5] as P).map(g), true)); }
	return <g><Shape d={sh.join(' ')} fill="#4c5a8c" o={0.42} /><Shape d={hi.join(' ')} fill="#f5d7cc" o={0.32} /></g>; };

/** the sled tracks and footprints, from the bottom left to the sleds (ground decals) */
const Tracks: React.FC = () => {
	const g = useGround(IB.hz, IB.K), path: P[] = [[980, 1200], [900, 1020], [800, 880], [720, 790], [660, 740], [620, 712]];
	const lines = [-1, 1].map((s) => { const L = path.map(([x, y]) => [x + s * (y - IB.hz) * 0.07, y] as P), R = path.map(([x, y]) => [x + s * (y - IB.hz) * 0.07 + (y - IB.hz) * 0.012, y] as P).reverse();
		return spline([...L, ...R].map(g), false); });
	const prints = Array.from({length: 26}, (_, i) => { const u = i / 25, k = Math.min(path.length - 2, Math.floor(u * (path.length - 1))), f = u * (path.length - 1) - k, x = lerp(path[k][0], path[k + 1][0], f), y = lerp(path[k][1], path[k + 1][1], f), d = y - IB.hz, side = i % 2 ? 1 : -1;
		const c: P = [x + side * d * 0.035 + d * 0.006, y]; return spline(([[c[0] - d * 0.012, c[1]], [c[0], c[1] - d * 0.006], [c[0] + d * 0.012, c[1]], [c[0], c[1] + d * 0.007]] as P[]).map(g), true); }).join(' ');
	return <g><path d={lines.join(' ')} fill="#3d4884" opacity={0.6} /><Shape d={prints} fill="#3d4884" o={0.45} /></g>; };

/** a near snow drift with a sharp wind-cut cornice (bottom right) */
const Drift: React.FC = () => {
	const fog = useFog(), crest: P[] = [[1060, 1080], [1200, 990], [1400, 955], [1640, 935], [1900, 928], [2300, 945]];
	const body = spline([...crest, [2300, 1300], [1000, 1300]], true);
	const lip = spline([...crest, ...crest.slice().reverse().map(([x, y], i) => [x - 6, y + 7 + (i % 2) * 4] as P)], true);
	return <g><defs><linearGradient id="drf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={fog('#8b92c4')} /><stop offset="0.5" stopColor={fog('#5e6aa0')} /><stop offset="1" stopColor={fog('#46528a')} /></linearGradient></defs>
		<path d={body} fill="url(#drf)" /><path d={lip} fill={fog('#f7d9cc')} opacity={0.85} /></g>; };

/** out-of-focus foreground ice blocks in the lower corners (translucent blue with bright edges) */
const FgIce: React.FC = () => {
	const blk = (x: number, y: number, w: number, h2: number, s: number) => iceBlockPts(x, y, w, h2, s);
	const L = [blk(80, 1200, 520, 420, 3), blk(-160, 1180, 420, 560, 9), blk(330, 1230, 300, 260, 5)], R = [blk(1900, 1200, 480, 380, 7), blk(1660, 1240, 300, 230, 11)];
	return <g>{[...L, ...R].map((p, i) => <g key={i}><path d={poly(p)} fill={i % 2 ? '#252f5c' : '#2e3a6c'} /><path d={poly([p[2], p[3], p[4], [lerp(p[3][0], p[5][0], 0.5), lerp(p[3][1], p[5][1], 0.6)], [lerp(p[2][0], p[0][0], 0.2), lerp(p[2][1], p[0][1], 0.3)]])} fill="#7f8cc4" opacity={0.75} />
		<path d={poly([p[2], p[3], [p[3][0], p[3][1] + 18], [p[2][0] + 20, p[2][1] + 26]])} fill="#ffe6da" opacity={0.85} /></g>)}</g>; };

export const Ice: React.FC<SetProps> = ({t, cam}) => {
	const ph = t / 1.25, D = 5.2, y = igY(D);
	return <Stage t={t} cam={cam} atm={{haze: '#d4bccb', density: 0.028, focus: IB.focus, aperture: 1.6, rim: '#ffd6a8', lightDir: 8, grain: 0.055, vignette: 0.5, pp: [IB.sun[0], IB.hz]}} bg="#202a48">
		<Layer D={INF}><IceSky t={t} /></Layer>
		<Layer D={60}><IceRidge x0={-300} x1={2300} y={igY(60)} hmin={1} hmax={5} seed={2} cols={ICE} rows={1} /></Layer>
		<Layer D={28}><IceRidge x0={-300} x1={1050} y={igY(28)} hmin={3} hmax={16} seed={5} cols={ICE} rows={1} /><IceRidge x0={1620} x1={2300} y={igY(28)} hmin={3} hmax={12} seed={6} cols={ICE} rows={1} /></Layer>
		<Layer D={INF}><Lead t={t} /></Layer>
		<Layer D={11}><Mist n={7} seed={8} y0={590} y1={612} t={t} speed={14} o={0.5} c="#f7dccf" w={[300, 800]} h={[16, 36]} /></Layer>
		<Layer D={9}><IceRidge x0={1380} x1={2300} y={igY(9)} hmin={14} hmax={60} seed={9} cols={ICE} /></Layer>
		<Layer D={INF}><Sastrugi n={125} seed={4} y0={IB.hz + 30} y1={1120} /><Tracks /></Layer>
		<Layer D={3.4}><IceRidge x0={-320} x1={540} y={igY(3.4)} hmin={30} hmax={165} seed={13} cols={ICE} rows={4} />
			<FPath d={spline([[-320, igY(3.4) - 20], [0, igY(3.4) - 40], [300, igY(3.4) - 30], [560, igY(3.4) - 6], [700, igY(3.4) + 14], [-320, igY(3.4) + 40]], true)} c="#7884b6" /></Layer>
		<FigureSlot x={760} y={y + 3} h={108} depth={D + 0.5} attire="ice" action="sled" phase={ph + 0.37} facing={1} shadow={{k: 0.34, skew: 3.2, o: 0.85, c: '#323d7c', blur: 1.2}} />
		<FigureSlot x={930} y={y} h={112} depth={D} attire="ice" action="sled" phase={ph} facing={1} shadow={{k: 0.34, skew: 3.2, o: 0.85, c: '#323d7c', blur: 1.2}} />
		<Particles kind="diamond" n={30} seed={21} D={[2.5, 10]} box={[860, 572, 1760, 820]} c="#fff1dc" o={0.9} size={0.9} />
		<Particles kind="spindrift" n={125} seed={22} D={[1.3, 9]} box={[-100, 600, W + 100, 1100]} c="#f8e6e2" o={0.7} wind={-600} />
		<Layer D={2.4}><IceRidge x0={1480} x1={2250} y={igY(2.4)} hmin={20} hmax={110} seed={41} cols={ICE} rows={2} /></Layer>
		<Layer D={1.7}><Drift /></Layer>
		<Layer D={0.5} blur={13}><FgIce /></Layer>
	</Stage>;
};

/* ===================================================== 3 · SIBERIA, −40 °C =====================================================
   A winter road through birch and larch in ice fog. The pale sun sits low over the road's vanishing point with a 22° halo, sun dogs
   and a pillar; diamond dust glitters. One-point perspective: the road, its tyre ruts, the telegraph poles and the birches all converge
   on it. Karl hauls the cart toward the light, breath freezing. */
const SB = {focus: 2.2, hz: 606, K: 563, vp: [1440, 606] as P, sun: [1380, 318] as P};
const sgY = (D: number) => SB.hz + SB.K / D;
const sX = (X: number, D: number) => SB.vp[0] + X * SB.focus / D;

const SibSky: React.FC = () => <>
	<SkyGrad y0={0} y1={H} stops={[[0, '#7c8498'], [0.2, '#a3a8b6'], [0.38, '#cfcdcb'], [0.5, '#e6dccf'], [0.566, '#ece3d7'], [0.567, '#dcd9d6'], [0.7, '#c9ccd3'], [1, '#aab0bf']]} />
	<Sun x={SB.sun[0]} y={SB.sun[1]} r={30} c="#fff0d8" core="#fffbf2" bloom={7} bloomO={0.8} halo={250} dogs pillar={380} />
</>;

/** the road: snow-packed surface, tyre ruts with icy glints, banks on both sides (all ground decals) */
const Road: React.FC = () => {
	const g = useGround(SB.hz, SB.K), at = (X: number, y: number): P => [SB.vp[0] + X * (y - SB.hz) / (SB.K / SB.focus), y];   // a lateral offset X (focus px) at screen row y
	const strip = (X0: number, X1: number, y0 = SB.hz + 1.5, y1 = 1300) => [at(X0, y0), at(X1, y0), at(X1, y1), at(X0, y1)];
	const P2 = (pts: P[]) => poly(pts.map(g));
	const ruts = [-900, -770, -400, -270].map((X, i) => [0, 1, 2, 3].map((k) => P2(strip(X + k * 3, X + k * 3 + 26, SB.hz + 2 + k * k * 30 + i * 8, 640 + k * 160 + rnd(i * 4 + k, 3) * 160))).join(' '));
	const glint = [-878, -378].map((X) => P2(strip(X, X + 6, SB.hz + 3, 1300)));
	/** a snow berm along a road edge: its road-facing side (lit on the left bank, shaded on the right) and a white top */
	const berm = (Xi: number, Xo: number, face: string) => { const rows = [SB.hz + 2, 640, 680, 740, 820, 920, 1060, 1300], hgt = (y: number) => (y - SB.hz) * 0.16;
		const foot = rows.map((y) => at(Xi, y)), crest = rows.map((y, i) => [at(lerp(Xi, Xo, 0.2), y)[0], y - hgt(y) * (0.7 + 0.3 * rnd(i, Xi))] as P), outer = rows.map((y) => [at(Xo, y)[0], y - hgt(y) * 0.6] as P);
		return <g><path d={spline([...foot, ...crest.slice().reverse()].map(g), true)} fill={face} /><path d={spline([...crest, ...outer.slice().reverse()].map(g), true)} fill="#f3f1ee" /></g>; };
	return <g>
		<defs><linearGradient id="sroad" gradientUnits="userSpaceOnUse" x1="0" y1={SB.hz} x2="0" y2={H}><stop offset="0" stopColor="#d9d6d3" /><stop offset="0.3" stopColor="#c3c5cc" /><stop offset="1" stopColor="#a2a9ba" /></linearGradient></defs>
		<path d={P2(strip(-1120, -40))} fill="url(#sroad)" />
		<path d={ruts.join(' ')} fill="#8a92a8" opacity={0.35} />
		<path d={glint.join(' ')} fill="#fff6ea" opacity={0.55} />
		{berm(-1120, -1300, '#ebe6de')}{berm(-40, 120, '#c3c8d4')}
	</g>; };

/** one birch on the left roadside at depth D (its own layer for parallax) */
const Birch: React.FC<{X: number; D: number; seed: number; hgt?: number}> = ({X, D, seed, hgt = 2700}) => {
	const fog = useFog(), x = sX(X, D), y = sgY(D), s = SB.focus / D, h = hgt * s;
	const tree = bareTreeD(x, y + 4, h, seed, {w: 40 * s, spread: 26, depth: 4, droop: 14, lean: (rnd(seed, 2) - 0.5) * 6});
	const marks = Array.from({length: 14}, (_, i) => { const yy = y - h * (0.05 + i * 0.045) - rnd(i, seed) * 20 * s, ww = 40 * s * (0.4 + rnd(i, seed + 1) * 0.6); return `M${f1(x - ww / 2)},${f1(yy)} L${f1(x + ww * 0.2)},${f1(yy - 3 * s)} L${f1(x + ww * 0.1)},${f1(yy + 4 * s)} Z`; }).join(' ');
	return <g><Shape d={tree.slice(1).join(' ')} fill={fog('#2f2c33')} /><path d={tree[0]} fill={fog('#efece6')} /><path d={marks} fill={fog('#2a272c')} />
		<path d={`M${f1(x - 60 * s)},${f1(y + 6 * s)} Q${f1(x)},${f1(y - 14 * s)} ${f1(x + 70 * s)},${f1(y + 6 * s)} Z`} fill={fog('#f4f2ef')} /></g>; };

/** one telegraph pole on the right at depth D */
const Pole: React.FC<{X: number; D: number}> = ({X, D}) => {
	const fog = useFog(), x = sX(X, D), y = sgY(D), s = SB.focus / D, h = 1150 * s, c = fog('#3a3434');
	return <g fill={c}><path d={poly([[x - 9 * s, y + 4], [x + 9 * s, y + 4], [x + 6 * s, y - h], [x - 6 * s, y - h]])} />
		<path d={poly([[x - 70 * s, y - h * 0.94], [x + 70 * s, y - h * 0.94], [x + 70 * s, y - h * 0.94 + 9 * s], [x - 70 * s, y - h * 0.94 + 9 * s]])} />
		<path d={poly([[x - 9 * s, y - h * 0.4], [x - 70 * s, y + 4], [x - 60 * s, y + 4], [x - 5 * s, y - h * 0.38]])} opacity={0.9} />
		<path d={`M${f1(x - 26 * s)},${f1(y + 6 * s)} Q${f1(x)},${f1(y - 12 * s)} ${f1(x + 30 * s)},${f1(y + 6 * s)} Z`} fill={fog('#eeecea')} /></g>; };
const POLES = [1.25, 1.8, 2.6, 3.8, 5.5, 8, 11.5, 17, 25].map((D) => ({X: 330, D}));
/** the wires between successive pole tops, projected per frame (they span depths) */
const Wires: React.FC = () => {
	const pr = useProject(), fogc = '#3e3a3d';
	const tops = POLES.map(({X, D}) => { const s = SB.focus / D; return [-60, 60].map((dx) => pr(D, [sX(X, D) + dx * s, sgY(D) - 1150 * s * 0.94]).p); });
	let d = '';
	for (let i = 0; i < tops.length - 1; i++) for (let k = 0; k < 2; k++) { const a = tops[i][k], b = tops[i + 1][k], sag = (a[1] - SB.hz) * 0.08 + 4;
		d += `M${f1(a[0])},${f1(a[1])} Q${f1((a[0] + b[0]) / 2)},${f1((a[1] + b[1]) / 2 + sag)} ${f1(b[0])},${f1(b[1])} `; }
	return <path d={d} fill="none" stroke={fogc} strokeWidth={1.6} opacity={0.75} />; };

/** a frosted birch branch hanging into the top left corner (foreground, out of focus) */
const FgBranch: React.FC<{t: number}> = ({t}) => {
	const br = bareTreeD(-120, -260, 900, 77, {w: 46, spread: 34, depth: 4, droop: 30, lean: 128});
	const frost = Array.from({length: 40}, (_, i) => { const a = rnd(i, 8) * 6.28, r = 120 + rnd(i, 9) * 520; return `M${f1(-60 + Math.cos(a * 0.3) * r)},${f1(-120 + Math.abs(Math.sin(a)) * r * 0.55)} m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0 Z`; }).join(' ');
	return <g transform={`rotate(${(Math.sin(t * 0.5) * 0.6).toFixed(2)} -120 -260) translate(-60,-40)`}><Shape d={br.join(' ')} fill="#6d6872" /><path d={frost} fill="#fbfaf8" opacity={0.9} /></g>; };

export const Siberia: React.FC<SetProps> = ({t, cam}) => {
	const ph = t / 1.15;
	const birches: [number, number][] = [[-1500, 2.0], [-1420, 2.6], [-1600, 3.3], [-1450, 4.3], [-1650, 5.6], [-1480, 7.4], [-1620, 9.8], [-1460, 13], [-1650, 18], [-1500, 25]];
	return <Stage t={t} cam={cam} atm={{haze: '#d7d6d5', density: 0.085, focus: SB.focus, aperture: 1.4, rim: '#fff0d6', lightDir: 40, grain: 0.06, vignette: 0.45, pp: SB.vp}} bg="#9aa0ae">
		<Layer D={INF}><SibSky /></Layer>
		<Layer D={30}><FPath d={forestD(-300, 1380, sgY(30), 150, 22, 3, sgY(30) + 3)} c="#556070" /><FPath d={forestD(1520, 2300, sgY(30), 120, 24, 4, sgY(30) + 3)} c="#556070" /></Layer>
		<Layer D={16}><FPath d={forestD(-300, 1250, sgY(16), 260, 30, 5, sgY(16) + 3)} c="#3e4552" /><FPath d={forestD(1660, 2300, sgY(16), 200, 34, 6, sgY(16) + 3)} c="#3e4552" /><FogFoot y0={sgY(16) - 120} y1={sgY(16)} o={0.6} /></Layer>
		<Layer D={INF}><Road /></Layer>
		<Layer D={9}><FPath d={forestD(-300, 700, sgY(9), 420, 44, 7, sgY(9) + 3)} c="#2e333c" /><FogFoot y0={sgY(9) - 160} y1={sgY(9) + 2} o={0.55} /></Layer>
		<Layer D={8}><Mist n={6} seed={3} y0={SB.hz - 40} y1={SB.hz + 30} t={t} speed={8} o={0.55} c="#f0ece6" w={[600, 1400]} h={[50, 110]} /></Layer>
		{[...birches].reverse().map(([X, D], i) => <Layer key={`b${i}`} D={D}><Birch X={X} D={D} seed={11 + i * 5} /></Layer>)}
		{[...POLES].reverse().map(({X, D}, i) => <Layer key={`p${i}`} D={D}><Pole X={X} D={D} /></Layer>)}
		<Layer D={INF}><Wires /></Layer>
		<Layer D={3}><Mist n={4} seed={9} y0={SB.hz + 40} y1={SB.hz + 140} t={t} speed={10} o={0.3} c="#f2eee8" w={[700, 1500]} h={[60, 140]} /></Layer>
		<FigureSlot x={760} y={sgY(SB.focus)} h={290} attire="russia" action="cart" phase={ph} facing={1} breath shadow={{k: 0.1, skew: 1.3, o: 0.22, c: '#6f7890', blur: 3}} />
		<Particles kind="diamond" n={70} seed={31} D={[1.2, 8]} box={[500, 0, 1900, 900]} c="#fff8ea" o={1} size={1.1} />
		<Particles kind="snow" n={70} seed={32} D={[0.8, 10]} c="#ffffff" o={0.55} wind={30} size={0.7} />
		<Layer D={1.25}><FPath d={tuftD(80, sgY(1.25) + 10, 26, 120, 260, 4, 8) + ' ' + tuftD(1880, sgY(1.25) + 30, 18, 90, 200, 6, -8)} c="#5b5148" />
			<FPath d={spline([[-200, 1300], [-200, 990], [200, 1000], [420, 1060], [520, 1300]], true)} c="#eceae8" /></Layer>
	</Stage>;
};
