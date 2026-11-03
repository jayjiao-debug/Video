import React from 'react';
import {Stage, Layer, Shape, Particles, Mist, Glow, SkyGrad, Sun, Cam, INF, useGround, P, W, H, f1, lerp, rnd, noise1, spline, poly, mix, cl, sm} from './kit3';
import {Fig, IceRidge, IceCols, travel} from './act2_kit';

/* ep59 v3 · act 2 · freeze: 「像看着摩西分开红海」.
   A grey, windy dusk over a field of slush and open water; the two men stand at its edge. The wind drops (the spindrift dies away),
   then on beat 2.5 the frost races across the slush from left to right — a crystal-growth wipe: feathery white dendrites at the front,
   hard ice behind it. On beat 5 the overcast parts over the sun like a curtain, low gold light floods in and lights a straight road of
   new ice running between two walls of pressure rubble to the sun, with black steaming water beyond the walls. On beat 6 they lean into
   the traces and walk on up the road; the camera cranes up a little and follows. One Stage; every colour blends on k (the light). */
const FB = {focus: 2.7, hz: 520, K: 800, vpx: 1320};
const fgY = (D: number) => FB.hz + FB.K / D;
const KF = FB.K / FB.focus;
/** screen x of the lateral offset X (focus px) on ground row y */
const fX = (X: number, y: number) => FB.vpx + X * (y - FB.hz) / KF;
const ROAD = {XL: -640, XR: -170};
const ROWS = [FB.hz + 1, 523, 527, 533, 541, 552, 567, 588, 616, 655, 708, 780, 880, 1020, 1220, 1500];

const SkyF: React.FC<{t: number; k: number}> = ({t, k}) => {
	const c = (a: string, b: string) => mix(a, b, k);
	const stops: [number, string][] = [[0, c('#323646', '#141a3a')], [0.25, c('#454a5e', '#2c2a55')], [0.38, c('#5d6174', '#6a4a72')], [0.44, c('#727487', '#c56b62')], [0.475, c('#878898', '#f39b5c')], [0.4805, c('#9a9aa6', '#ffd08a')], [0.4815, c('#5b6070', '#7b5a6a')], [1, c('#3a4152', '#2a2440')]];
	// the overcast deck: heavy bands that part over the sun (left half slides left, right half right) as the light comes
	const bands: [number, number, number][] = [[60, 70, 1], [170, 64, 2], [270, 52, 3], [352, 40, 4], [418, 28, 5], [462, 16, 6]];
	return <>
		<SkyGrad y0={0} y1={H} stops={stops} />
		{/* rays through the gap */}
		{k > 0.02 && <g opacity={k * 0.55}>{Array.from({length: 9}, (_, i) => { const a = -170 + i * 20 + Math.sin(t * 0.3 + i) * 2, a1 = (a - 3.5) * Math.PI / 180, a2 = (a + 3.5) * Math.PI / 180, L = 1500;
			return <path key={i} d={poly([[FB.vpx, 505], [FB.vpx + Math.cos(a1) * L, 505 + Math.sin(a1) * L], [FB.vpx + Math.cos(a2) * L, 505 + Math.sin(a2) * L]])} fill="#ffd9a0" opacity={0.08 + 0.06 * rnd(i, 3)} />; })}</g>}
		<Sun x={FB.vpx} y={503} r={26} c="#ffb070" core="#fff3dc" bloom={12} bloomO={0.9 * k} />
		{bands.map(([y, th, s]) => { const segs: string[] = [];
			for (let j = 0, x0 = -800 + rnd(s, 1) * 300; x0 < W + 800; j++) { const len = 500 + rnd(j, s) * 900, top: P[] = [], bot: P[] = [];
				for (let q = 0; q <= 10; q++) { const u = q / 10, x = x0 + u * len, env = Math.pow(Math.sin(Math.PI * u), 0.5); top.push([x, y - th * env * (0.6 + 0.4 * Math.abs(noise1(x / 90, s)))]); bot.push([x, y + th * 0.35 * env]); }
				segs.push(spline([...top, ...bot.reverse()], true)); x0 += len * 0.86; }
			const sp = sm(k * 1.15), dxL = -2400 * sp * (1 - s * 0.05), dxR = 1900 * sp * (1 - s * 0.05);
			const col = mix('#2f3344', '#4a3a5c', k), under = mix('#6a6c7c', '#ffb07a', k);
			const id = `a2fz${s}`;
			return <g key={s}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} /><stop offset="0.7" stopColor={mix(col, under, 0.4)} /><stop offset="1" stopColor={under} /></linearGradient>
				<clipPath id={`${id}L`}><rect x={-2000} y={-100} width={2000 + FB.vpx} height={700} /></clipPath><clipPath id={`${id}R`}><rect x={FB.vpx} y={-100} width={3000} height={700} /></clipPath></defs>
				<g transform={`translate(${f1(dxL + t * 4)},0)`}><g clipPath={`url(#${id}L)`}><Shape d={segs.join(' ')} fill={`url(#${id})`} o={0.92 - 0.3 * k} /></g></g>
				<g transform={`translate(${f1(dxR + t * 4)},0)`}><g clipPath={`url(#${id}R)`}><Shape d={segs.join(' ')} fill={`url(#${id})`} o={0.92 - 0.3 * k} /></g></g></g>; })}
		<Glow x={FB.vpx} y={FB.hz} r={1300} ry={110} c="#ffb47a" o={0.6 * k} />
		<Glow x={FB.vpx} y={FB.hz} r={500} ry={40} c="#fff0d0" o={0.7 * k} />
	</>; };

/** the frost front (screen x) on ground row y at progress f (−0.1 … 1.1) */
const frontX = (y: number, f: number) => lerp(-500, 2500, f) - (1080 - y) * 0.55 + noise1(y / 18, 7) * 40 + noise1(y / 5, 9) * 12;

/** the ground: slush everywhere; behind the frost front, hard ice (the road glassy and gold, the rest white crusted pans on dark new ice) */
const GroundF: React.FC<{t: number; k: number; f: number}> = ({t, k, f}) => {
	const g = useGround(FB.hz, FB.K);
	const strip = (XL: number, XR: number) => poly([...ROWS.map((y) => [fX(XL, y) + noise1(y / 30, XL) * (y - FB.hz) * 0.12, y] as P), ...ROWS.slice().reverse().map((y) => [fX(XR, y) + noise1(y / 30, XR) * (y - FB.hz) * 0.12, y] as P)].map(g));
	// slush clumps (pancakes), perspective-sized
	const pans = (seed: number, n: number) => { const out: string[] = [];
		for (let i = 0; i < n; i++) { const y = FB.hz + 3 + Math.pow(rnd(i, seed), 1.9) * 620, d = y - FB.hz, x = -400 + rnd(i, seed + 1) * 2800 + Math.sin(t * 0.6 + i) * d * 0.02 * (1 - f), s = d * (0.05 + rnd(i, seed + 2) * 0.09);
			out.push(spline(Array.from({length: 7}, (_, q) => { const a = q / 7 * Math.PI * 2; return [x + Math.cos(a) * s * (0.75 + rnd(i * 7 + q, seed + 3) * 0.5), y + Math.sin(a) * s * 0.26 * (0.75 + rnd(i * 7 + q, seed + 4) * 0.5)] as P; }).map(g), true)); }
		return out.join(' '); };
	const P1 = pans(3, 230);
	// the clip: everything left of the front
	const fr = ROWS.map((y) => [frontX(y, f), y] as P), clipD = poly([[-3000, FB.hz - 1], ...fr, [frontX(1500, f), 1500], [-3000, 1500]]);
	// dendrites along the front: a feathery stem with side barbs, growing forward
	const den: string[] = [];
	if (f > -0.1 && f < 1.15) for (let i = 0; i < 46; i++) { const y = FB.hz + 4 + Math.pow(i / 45, 1.6) * 600, d = y - FB.hz, x0 = frontX(y, f) - d * 0.2, L = d * (0.5 + rnd(i, 51) * 0.6), a = (rnd(i, 52) - 0.5) * 0.5, w = Math.max(0.6, d * 0.006);
		const pt = (u: number, side = 0, l = 0): P => [x0 + Math.cos(a) * L * u + side * l * 0.5, y + Math.sin(a) * L * u * 0.25 - Math.abs(side) * l * 0.18 * (side > 0 ? 1 : -1)];
		den.push(`M${f1(x0)},${f1(y - w)} L${f1(pt(1)[0])},${f1(pt(1)[1])} L${f1(x0)},${f1(y + w)} Z`);
		for (let b = 1; b <= 5; b++) { const u = b / 6, base = pt(u), l = L * 0.32 * (1 - u * 0.6);
			for (const sd of [-1, 1]) den.push(`M${f1(base[0])},${f1(base[1] - w * 0.6)} L${f1(base[0] + l * 0.55)},${f1(base[1] + sd * l * 0.16)} L${f1(base[0])},${f1(base[1] + w * 0.6)} Z`); } }
	const roadGlow = strip(ROAD.XL + 40, ROAD.XR - 40);
	// the sun's streak on the road (glassy)
	const streak = poly([g([FB.vpx - 6, FB.hz + 2]), g([FB.vpx + 6, FB.hz + 2]), g([fX(-330, 1080) + 120, 1080]), g([fX(-330, 1080) - 120, 1080])]);
	return <g>
		<defs>
			<linearGradient id="a2fzw" gradientUnits="userSpaceOnUse" x1="0" y1={FB.hz} x2="0" y2={H}><stop offset="0" stopColor={mix('#8a8c9c', '#e7a07a', k)} /><stop offset="0.12" stopColor={mix('#3e4456', '#4a3a58', k)} /><stop offset="1" stopColor={mix('#1e2432', '#151628', k)} /></linearGradient>
			<linearGradient id="a2fzr" gradientUnits="userSpaceOnUse" x1="0" y1={FB.hz} x2="0" y2={H}><stop offset="0" stopColor={mix('#c9ccd8', '#fff1d6', k)} /><stop offset="0.25" stopColor={mix('#b4b9c8', '#ffd09a', k)} /><stop offset="0.7" stopColor={mix('#9aa0b4', '#e9a98c', k)} /><stop offset="1" stopColor={mix('#868ca2', '#b7849a', k)} /></linearGradient>
			<linearGradient id="a2fzs" gradientUnits="userSpaceOnUse" x1="0" y1={FB.hz} x2="0" y2={H}><stop offset="0" stopColor="#fff6dc" stopOpacity="0.95" /><stop offset="1" stopColor="#ffc27a" stopOpacity="0" /></linearGradient>
			<clipPath id="a2fzc"><path d={clipD} /></clipPath>
		</defs>
		{/* before: water + grey slush */}
		<rect x={-2000} y={FB.hz} width={W + 4000} height={H} fill="url(#a2fzw)" />
		<Shape d={P1} fill={mix('#7d8496', '#9a8aa0', k)} o={0.85} />
		{/* after (behind the front) */}
		<g clipPath="url(#a2fzc)">
			<rect x={-2000} y={FB.hz} width={W + 4000} height={H} fill={mix('#252b3c', '#221d36', k)} />
			<Shape d={P1} fill={mix('#dfe4ee', '#f6d6c4', k)} o={0.95} />
			<path d={strip(ROAD.XL, ROAD.XR)} fill="url(#a2fzr)" />
			<path d={roadGlow} fill="#fff4dc" opacity={0.18 + 0.25 * k} />
			<path d={streak} fill="url(#a2fzs)" opacity={k} />
			{/* frost feathers on the new ice */}
			<Shape d={den.join(' ')} fill="#ffffff" o={0.25} />
		</g>
		{/* the front itself */}
		<Shape d={den.join(' ')} fill="#f6fbff" o={0.95} />
		{f > -0.05 && f < 1.1 && ROWS.slice(2, 13).map((y, i) => { const x = frontX(y, f); return <Glow key={i} x={x} y={y} r={(y - FB.hz) * 0.9 + 20} ry={(y - FB.hz) * 0.18 + 6} c="#e6f4ff" o={0.55} />; })}
	</g>; };

/** the walls of rubble along both road edges at depth D */
const Walls: React.FC<{D: number; seed: number; cols: IceCols; k?: number}> = ({D, seed, cols, k = 1}) => {
	const y = fgY(D), s = FB.focus / D, xl = FB.vpx + ROAD.XL * s, xr = FB.vpx + ROAD.XR * s;
	return <>
		<IceRidge x0={xl - 420 * s} x1={xl + 8 * s} y={y + 2} hmin={20 * s * k} hmax={150 * s * k} seed={seed} cols={cols} rows={2} />
		<IceRidge x0={xr - 8 * s} x1={xr + 380 * s} y={y + 2} hmin={20 * s * k} hmax={130 * s * k} seed={seed + 40} cols={cols} rows={2} flip />
	</>; };

export const FreezeShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur, beat}) => {
	const f = cl((t - 2.5 * beat) / (4 * beat), -0.1, 1.15), k = sm((t - 5 * beat) / (3 * beat)), wind = 1 - sm(t / (2.5 * beat));
	const go = 6 * beat;
	const tk = travel('haulSled', t, 250, 0, 1, go, go + 2 * beat, 0.5), td = travel('haulSled', t, 250, 0, 1, go + 0.15, go + 0.15 + 2 * beat, 0.0);
	const cyK = tk.phase - 0.5, cyD = td.phase;
	const DK = 2.7 + cyK * 0.6, DD = 3.6 + cyD * 0.6;
	const XK = -420, XD = -470, hK = 250 * FB.focus / 2.7, hD = 250 * FB.focus / 2.7;
	const e = sm(cl(t / dur)), w2 = sm((t - go) / (dur - go));
	const cam: Cam = {x: lerp(-40, 10, e) + 60 * w2, y: lerp(10, -30, e) - 40 * w2, z: lerp(0, 0.12, e) + 0.75 * Math.pow(w2, 1.2), zoom: 1, roll: lerp(-0.3, 0.2, e)};
	const c = (a: string, b: string) => mix(a, b, k);
	const cols: IceCols = {lit: c('#9aa1b6', '#ffc28e'), shade: c('#3a4156', '#4b4070'), cap: c('#c8ccd8', '#fff0d8')};
	const Ds = [30, 22, 16, 12, 9, 7, 5.4, 4.2, 3.3, 2.6, 2.05, 1.6, 1.25];
	const fig = (D: number, X: number, h0: number, ph: number, key: string) => <Fig key={key} x={FB.vpx + X * FB.focus / D} y={fgY(D)} h={h0 * FB.focus / D} depth={D} attire="ice" action="haulSled" phase={ph}
		rim={c('#c8d2e8', '#ffd09a')} rimO={0.5 + 0.45 * k} lightDir={20} shadow={{k: 0.25 + 0.2 * k, skew: -1.4, o: 0.35 + 0.45 * k, c: c('#3a4258', '#5a3c6a'), blur: 1.4}} />;
	void hK; void hD;
	return <Stage t={t} cam={cam} atm={{haze: c('#8d90a0', '#e0a890'), density: 0.03, focus: FB.focus, aperture: 1.5, rim: '#ffd09a', lightDir: 20, grain: 0.06, vignette: 0.5, pp: [FB.vpx, FB.hz]}} bg="#2a2f3e">
		<Layer D={INF}><SkyF t={t} k={k} /></Layer>
		<Layer D={INF}><GroundF t={t} k={k} f={f} /></Layer>
		<Layer D={40}><Mist n={8} seed={3} y0={fgY(40) - 14} y1={fgY(14)} t={t} speed={6} o={0.35 + 0.25 * k} c={c('#9aa0b0', '#ffc9a8')} w={[300, 900]} h={[20, 50]} /></Layer>
		{Ds.slice(0, 9).map((D, i) => <Layer key={i} D={D}><Walls D={D} seed={7 + i * 9} cols={cols} /></Layer>)}
		<Layer D={6}><Mist n={7} seed={8} y0={fgY(6) - 60} y1={fgY(3)} t={t} speed={9} o={0.3 + 0.2 * k} c={c('#a4a8b6', '#ffc6a4')} w={[400, 900]} h={[40, 100]} /></Layer>
		{fig(DD, XD, 250, cyD, 'd')}
		{Ds.slice(9, 10).map((D, i) => <Layer key={'b' + i} D={D}><Walls D={D} seed={88 + i * 9} cols={cols} /></Layer>)}
		{fig(DK, XK, 250, tk.phase, 'k')}
		{Ds.slice(10).map((D, i) => <Layer key={'c' + i} D={D}><Walls D={D} seed={120 + i * 9} cols={cols} k={0.9} /></Layer>)}
		<Particles kind="spindrift" n={140} seed={22} D={[1.2, 9]} box={[-100, 480, W + 100, 1100]} c="#e6e8f0" o={0.75 * wind} wind={-760} />
		<Particles kind="diamond" n={60} seed={23} D={[1.4, 9]} box={[300, 300, 1900, 900]} c="#fff1d6" o={k} size={1} />
		<Particles kind="snow" n={40} seed={24} D={[1, 8]} c="#ffffff" o={0.4 * (1 - k)} wind={-300 * wind} size={0.6} />
	</Stage>;
};
