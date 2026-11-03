/* ep59 v3 · act 1, scenes print / door / title.
   print : the hook — a dusk crowd out of focus (bokeh of phones, flashes, lit windows), his 2026 print tossed in on the first beat
           centre-right, a slow push; a gold odometer rolls 0 → 50,000 km under the lines.
   door  : the print becomes a window onto the drawn Hull street at dawn (the camera starts tight on the drawn Karl where the real
           face was, then opens out); the door opens on the beat, his mother in the gold light; they hold.
   title : the camera cranes up off the same street, through dawn cloud, out to the Earth; the route lights from Hull back to Chile;
           the title holds; a dive toward Punta Arenas cuts to Patagonia. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage, Layer, Shape, FigureSlot, Particles, Glow, SkyGrad, INF, W, H, P, f1, lerp, rnd, cl, sm, eio, wrap, mix, poly, taper, spline,
	useStage, useWorld, wpt, World, layerTransform, Cam, CAM0, addCam, drift, GOLD, useUid, noise1} from './kit3';
import {Mum as RigMum, Cart} from './karl3';
import {Print3, PH3} from './photo3';
import {Tally, Title, useFonts59} from '../qq59/skin59';
import {Earth, Space, followAt, HULL, PUNTA, SatView} from '../qq59/globe59';
import {CloudBands, personD} from './props3';
import type {SceneProps, SceneDef} from './EP59V3';
import {sceneOf, beatOff, hit, ein, eout, trap, useFogD} from './act1_kit';

/* ======================================================= PRINT ======================================================= */
/** the hero print's resting geometry (shared with the door's reveal) */
export const PG = {cx: 1300, cy: 672, w: 450, rot: -2.5};
const NOW = PH3.nowFace;

/** bokeh discs: flat discs with a brighter rim and a soft edge (one gradient per colour), drifting */
const Bokeh: React.FC<{n: number; seed: number; box: [number, number, number, number]; r: [number, number]; t: number; vx?: number; o?: number; cols: string[]}> = ({n, seed, box, r, t, vx = 6, o = 0.5, cols}) => {
	const id = useUid('bk'), [x0, y0, x1, y1] = box;
	return <g>
		<defs>{cols.map((c, i) => <radialGradient key={i} id={`${id}${i}`}><stop offset="0" stopColor={c} stopOpacity="0.5" /><stop offset="0.7" stopColor={c} stopOpacity="0.58" /><stop offset="0.9" stopColor={c} stopOpacity="0.85" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient>)}</defs>
		{Array.from({length: n}, (_, i) => { const rr = lerp(r[0], r[1], Math.pow(rnd(i, seed), 1.6)), x = wrap(x0 + rnd(i, seed + 1) * (x1 - x0) + t * vx * (0.4 + rnd(i, seed + 2)), x0, x1), y = y0 + rnd(i, seed + 3) * (y1 - y0) + Math.sin(t * 0.5 + i) * 4;
			const fl = 0.7 + 0.3 * Math.sin(t * (0.7 + rnd(i, seed + 4) * 1.8) + i * 1.7);
			return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(rr)} fill={`url(#${id}${Math.floor(rnd(i, seed + 5) * cols.length)})`} opacity={(o * (0.35 + 0.65 * rnd(i, seed + 6)) * fl).toFixed(3)} />; })}
	</g>;
};
/** a terrace roofline against the dusk: gables, chimney stacks with pots, lit windows */
const Roofline: React.FC<{y: number; seed: number; col: string; win: string}> = ({y, seed, col, win}) => {
	let d = `M-400,${H + 300}`; const wins: string[] = [], dark: string[] = [];
	for (let x = -400, i = 0; x < W + 400; i++) { const w = 150 + rnd(i, seed) * 120, ry = y - 30 * rnd(i, seed + 1);
		d += ` L${f1(x)},${f1(ry + 40)} L${f1(x + w * 0.5)},${f1(ry)} L${f1(x + w)},${f1(ry + 40)}`;
		if (rnd(i, seed + 2) > 0.3) { const cx = x + w * (0.2 + 0.6 * rnd(i, seed + 3)), cy = ry + 40 * Math.abs(cx - x - w * 0.5) / (w * 0.5);
			d += ` L${f1(cx - 18)},${f1(cy)} L${f1(cx - 18)},${f1(cy - 46)} L${f1(cx - 12)},${f1(cy - 46)} L${f1(cx - 12)},${f1(cy - 58)} L${f1(cx - 4)},${f1(cy - 58)} L${f1(cx - 4)},${f1(cy - 46)} L${f1(cx + 4)},${f1(cy - 46)} L${f1(cx + 4)},${f1(cy - 56)} L${f1(cx + 12)},${f1(cy - 56)} L${f1(cx + 12)},${f1(cy - 46)} L${f1(cx + 18)},${f1(cy - 46)} L${f1(cx + 18)},${f1(cy)}`; }
		for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) { const wx = x + w * (0.22 + k * 0.38), wy = ry + 70 + r * 90; (rnd(i * 4 + r * 2 + k, seed + 5) > 0.35 ? wins : dark).push(`M${f1(wx)},${f1(wy)} h34 v46 h-34 Z`); }
		x += w; }
	d += ` L${W + 400},${H + 300} Z`;
	return <g><path d={d} fill={col} /><path d={wins.join(' ')} fill={win} /><path d={dark.join(' ')} fill={mix(col, '#000', 0.3)} /></g>;
};
/** an out-of-focus crowd: heads and shoulders, some arms up with a lit phone */
const Crowd: React.FC<{n: number; seed: number; y: number; h: [number, number]; col: string; rim: string; phone: string; t: number; x0?: number; x1?: number}> = ({n, seed, y, h, col, rim, phone, t, x0 = -150, x1 = W + 150}) => {
	const ds: string[] = [], rims: string[] = [], ph: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) { const hh = lerp(h[0], h[1], rnd(i, seed)), x = lerp(x0, x1, (i + rnd(i, seed + 1) * 0.7) / n), yy = y + rnd(i, seed + 2) * 40 + Math.sin(t * 1.3 + i) * 3, arm = rnd(i, seed + 3) > 0.62 ? (rnd(i, seed + 4) > 0.5 ? 1 : -1) : 0;
		const d = personD(x, yy, hh, seed + i, arm); ds.push(d); rims.push(d);
		if (arm) { const ax = x + arm * hh * 0.24 * 0.45 + arm * hh * 0.06, ay = yy - hh * 0.8 - hh * 0.36; ph.push(<g key={i}><rect x={f1(ax - hh * 0.03)} y={f1(ay - hh * 0.06)} width={f1(hh * 0.06)} height={f1(hh * 0.1)} rx={3} fill={phone} opacity={0.95} /><Glow x={ax} y={ay - hh * 0.01} r={hh * 0.16} c={phone} o={0.45} /></g>); } }
	return <g><g transform="translate(3,-3)"><Shape d={rims.join(' ')} fill={rim} o={0.55} /></g><Shape d={ds.join(' ')} fill={col} />{ph}</g>;
};
const PrintField: React.FC<{t: number; cam: Cam; dur: number; off: number; beat: number}> = ({t, cam, off, beat}) => {
	const FX = [960, 1560, 420, 1720, 880, 300], FY = [560, 760, 820, 690, 860, 700];
	const flashes = [1, 2, 5, 7, 10, 13].map((k, i) => { const e = hit(t, off + k * beat, 0.16); return e > 0.01 ? <g key={i} opacity={e}><Glow x={FX[i]} y={FY[i]} r={i ? 260 : 420} c="#eef3ff" o={i ? 0.75 : 0.6} /><Glow x={FX[i]} y={FY[i]} r={34} c="#ffffff" o={1} /></g> : null; });
	return <Stage t={t} cam={cam} atm={{haze: '#2a2a44', density: 0.045, focus: 4, aperture: 3.2, rim: '#ffcf8a', lightDir: 150, grain: 0.085, vignette: 0.75}} bg="#0a0c16">
		<Layer D={INF}>
			<SkyGrad stops={[[0, '#060914'], [0.3, '#10172e'], [0.5, '#232848'], [0.6, '#43354e'], [0.66, '#6b4650'], [0.72, '#3c2c3c'], [1, '#0d0d16']]} />
			<Glow x={1180} y={640} r={1100} ry={300} c="#ff9a5c" o={0.32} />
			<Glow x={420} y={200} r={700} ry={380} c="#2b3d78" o={0.35} />
		</Layer>
		<Layer D={18} blur={5}><Roofline y={560} seed={4} col="#141526" win="#ffc27a" /><Glow x={960} y={700} r={1300} ry={160} c="#ff9c5a" o={0.25} /></Layer>
		<Layer D={10} blur={0}><Bokeh n={46} seed={2} box={[-100, 420, W + 100, 820]} r={[6, 20]} t={t} vx={5} o={0.75} cols={['#ffc77a', '#ffb060', '#ffe2b0', '#cfe0ff', '#ff8a5a']} /></Layer>
		<Layer D={5.5} blur={0}><Bokeh n={30} seed={7} box={[-150, 300, W + 150, 980]} r={[22, 58]} t={t} vx={8} o={0.55} cols={['#ffc77a', '#ffd9a0', '#cfe0ff', '#ffa05a']} /></Layer>
		<Layer D={2.8} blur={6}><Crowd n={19} seed={11} y={1190} h={[520, 640]} col="#0c0d16" rim="#e0a36a" phone="#d7e6ff" t={t} /></Layer>
		<g>{flashes}</g>
		<Particles kind="dust" n={60} seed={21} D={[2, 9]} box={[-60, 200, W + 60, 1000]} c="#ffd9a0" o={0.6} size={1.1} />
		<Layer D={1.15} blur={16}><Bokeh n={7} seed={13} box={[-200, 200, W + 200, 1100]} r={[90, 170]} t={t} vx={10} o={0.28} cols={['#ffc77a', '#cfe0ff']} />
			<path d={personD(140, 1500, 1100, 3) + ' ' + personD(1880, 1520, 1000, 8)} fill="#06070c" /></Layer>
	</Stage>;
};
const PrintScene: React.FC<SceneProps> = ({t, dur, beat, tr}) => {
	const off = beatOff(tr, 'print'), tp = t - off, u = cl(t / dur);
	const cam = addCam({...CAM0, x: lerp(-24, 24, u), y: lerp(10, -8, u), z: 0.55 * sm(u * 0.9 + 0.1) - 0.05}, drift(t, 0.7));
	// the odometer: appears on beat 4, rolls from beat 5 to beat 8 (with the line 「走了约5万公里」), a gold pulse as it lands
	const kmO = sm((tp - 4 * beat + 0.1) / 0.3), roll = eout((tp - 5 * beat) / (3 * beat)), land = hit(tp, 8 * beat, 0.35);
	const push = 1 + 0.045 * sm(u);
	return <AbsoluteFill>
		<PrintField t={t} cam={cam} dur={dur} off={off} beat={beat} />
		<AbsoluteFill style={{transform: `scale(${push.toFixed(4)})`, transformOrigin: `${PG.cx}px ${PG.cy}px`}}>
			<Print3 src={NOW.src} pos={NOW.pos} aspect={NOW.aspect} t={tp} dur={99} w={PG.w} cx={PG.cx} cy={PG.cy} rot={PG.rot} from="right" />
		</AbsoluteFill>
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><Glow x={400} y={760} r={420} ry={160} c={GOLD} o={0.35 * land * kmO} /></svg>
		<Tally pre="已走约" v={50000 * roll} unit="公里" x={186} y={688} size={78} sep o={kmO} bar={roll} barL="1998 · 智利" barR="2026 · 英国" />
	</AbsoluteFill>;
};

/* ======================================================= THE HULL STREET AT DAWN (door, title) ======================================================= */
/* World in metres: camera 1.55 m up, looking down the street (vanishing point upper left); the terrace on the right side (façade plane
   X = FX) recedes toward it; mum's door at D 3.5–4.4 m; Karl on the pavement 1.3 m out from the wall, facing the door. */
const DW: World = {hz: 470, vpx: 330, S: 1000, camH: 1.55};
const DF = 3.9, FX = 3.0, DOOR: [number, number] = [3.5, 4.4], KX = 1.7, MD = 3.97, HOUSE = 5.4, H0 = 1.2;
const DATM = {haze: '#5b5f84', density: 0.045, focus: DF, aperture: 1.6, rim: '#ffcf7a', lightDir: 12, grain: 0.075, vignette: 0.62, pp: [DW.vpx, DW.hz] as P};

/** the right-hand terrace (façade plane X = FX): brick walls with courses, bay and sash windows, doors, eaves, roofs, chimney stacks */
const Facade: React.FC<{X: number; from: number; to: number; side: 1 | -1; mum?: boolean; lit: number}> = ({X, from, to, side, mum, lit}) => {
	const wp = useWorld(DW), fog = useFogD();
	const q = (x0: number, d0: number, d1: number, y0: number, y1: number) => poly([wp(x0, y0, d0), wp(x0, y0, d1), wp(x0, y1, d1), wp(x0, y1, d0)]);
	const out: React.ReactNode[] = [], starts: number[] = [];
	for (let d = from; d < to; d += HOUSE) starts.push(d);
	for (let i = starts.length - 1; i >= 0; i--) { const d = starts[i];
		const d1 = d + HOUSE, dm = d + HOUSE / 2, isMum = mum && i === 0;
		const wall = fog('#4f2a25', dm), dark = fog('#15131b', dm), trim = fog('#8a7a70', dm), win = fog('#ffc983', dm, -0.25), roof = fog('#2b2f44', dm);
		const door: [number, number] = isMum ? DOOR : [d + HOUSE * 0.62, d + HOUSE * 0.8], bay: [number, number] = [d + HOUSE * 0.1, d + HOUSE * 0.42];
		const on = (k: number) => isMum || rnd(i * 5 + k, 7) > 0.3;
		out.push(<g key={i}>
			<path d={poly([wp(X, 6.4, d), wp(X, 6.4, d1), wp(X + side * 3.2, 8.7, d1), wp(X + side * 3.2, 8.7, d)])} fill={roof} />
			<path d={poly([wp(X + side * 1.5, 7.9, d - 0.05), wp(X + side * 1.5, 7.9, d + 0.55), wp(X + side * 1.5, 9.9, d + 0.55), wp(X + side * 1.5, 9.9, d - 0.05)])} fill={fog('#3a2420', dm)} />
			<path d={q(X, d, d1, 0, 6.4)} fill={wall} />
			{d < 12 && <path d={Array.from({length: 19}, (_, k) => q(X, d, d1, 0.3 + k * 0.32, 0.325 + k * 0.32)).join(' ')} fill={fog('#2e1817', dm)} opacity={0.45} />}
			<path d={q(X, d, d1, 6.4, 6.65) + ' ' + q(X, d, d1, 2.75, 2.87) + ' ' + q(X, d, d + 0.05, 0, 6.4)} fill={trim} />
			<path d={q(X, bay[0], bay[1], 0.65, 2.35)} fill={on(0) ? win : dark} opacity={on(0) ? (isMum ? 0.5 + 0.25 * lit : 0.9) : 1} />
			{isMum && <path d={q(X, bay[0], bay[0] + 0.35, 0.65, 2.35) + ' ' + q(X, bay[1] - 0.35, bay[1], 0.65, 2.35) + ' ' + q(X, bay[0], bay[1], 2.1, 2.35)} fill={fog('#5a2c2a', dm)} opacity={0.85} />}
			<path d={q(X, (bay[0] + bay[1]) / 2 - 0.03, (bay[0] + bay[1]) / 2 + 0.03, 0.65, 2.35) + ' ' + q(X, bay[0], bay[1], 1.7, 1.76) + ' ' + q(X, bay[0] - 0.08, bay[1] + 0.08, 0.55, 0.65) + ' ' + q(X, bay[0] - 0.08, bay[1] + 0.08, 2.35, 2.48)} fill={trim} />
			{[[1, 0.1, 0.4], [2, 0.55, 0.85]].map(([k, u0, u1]) => { const a = d + HOUSE * u0, b = d + HOUSE * u1;
				return <g key={k}><path d={q(X, a, b, 3.5, 5.3)} fill={on(k) ? win : dark} opacity={on(k) ? 0.85 : 1} /><path d={q(X, a, b, 4.38, 4.44) + ' ' + q(X, (a + b) / 2 - 0.02, (a + b) / 2 + 0.02, 3.5, 5.3) + ' ' + q(X, a - 0.06, b + 0.06, 3.4, 3.5)} fill={trim} /></g>; })}
			{!isMum && <g><path d={q(X, door[0], door[1], 0, 2.15)} fill={fog('#1b1f22', dm)} /><path d={q(X, door[0] + 0.05, door[1] - 0.05, 2.2, 2.5)} fill={win} opacity={0.8} /></g>}
		</g>);
	}
	return <g>{out}</g>;
};
/** the wet street: road, kerbs, pavements; lit windows and the door's light doubled in the wet surface */
const DStreet: React.FC<{open: number}> = ({open}) => {
	const wp = useWorld(DW), fog = useFogD(), strip = (X0: number, X1: number, D0 = 0.6, D1 = 300) => poly([wp(X0, 0, D0), wp(X1, 0, D0), wp(X1, 0, D1), wp(X0, 0, D1)]);
	const refl = Array.from({length: 14}, (_, i) => { const D = H0 + 0.9 + i * HOUSE * 0.5, a = wp(FX - 0.2, 0, D), len = 600 / D;
		return <Glow key={i} x={a[0] - 30 / D * 10} y={a[1] + len * 0.25} r={Math.max(6, 160 / D)} ry={len * 0.55} c="#ffb860" o={0.28 * (1 - i / 16)} />; });
	const dm = wp(FX - 0.3, 0, 3.95);
	return <g>
		<defs><linearGradient id="a1road" gradientUnits="userSpaceOnUse" x1="0" y1={DW.hz} x2="0" y2={H}><stop offset="0" stopColor="#8a7f96" /><stop offset="0.12" stopColor="#4a4a62" /><stop offset="0.45" stopColor="#262838" /><stop offset="1" stopColor="#14151f" /></linearGradient></defs>
		<path d={strip(-3.6, 1.0)} fill="url(#a1road)" />
		<path d={strip(1.0, FX + 0.1)} fill={fog('#3a3640', 4)} /><path d={strip(-4.7, -3.6)} fill={fog('#3a3640', 12)} />
		<path d={strip(0.95, 1.08)} fill="#77727c" opacity={0.8} /><path d={strip(-3.65, -3.52)} fill="#77727c" opacity={0.6} />
		<path d={strip(-1.32, -1.22, 4, 300)} fill="#9a96a4" opacity={0.25} />
		{refl}
		<Glow x={dm[0] - 60} y={dm[1] + 70} r={240} ry={60} c={GOLD} o={0.55 * open} />
	</g>;
};
/** mum's doorway: the gold hall, the door leaf swinging in (hinged on its near edge), the step, the spill; and mum herself */
const DoorWay: React.FC<{open: number; t: number; mumOn: boolean}> = ({open, t, mumOn}) => {
	const wp = useWorld(DW), {cam, atm} = useStage(), id = useUid('dw');
	const [a, b] = DOOR, Y0 = 0.15, Y1 = 2.2, op = poly([wp(FX, Y0, a), wp(FX, Y0, b), wp(FX, Y1, b), wp(FX, Y1, a)]);
	const ang = 68 * open * Math.PI / 180, fx = FX + 0.9 * Math.sin(ang), fd = a + 0.9 * Math.cos(ang);
	const leaf = poly([wp(FX, Y0, a), wp(FX, Y1, a), wp(fx, Y1, fd), wp(fx, Y0, fd)]);
	const step = poly([wp(FX - 0.32, Y0, a - 0.05), wp(FX - 0.32, Y0, b + 0.05), wp(FX, Y0, b + 0.05), wp(FX, Y0, a - 0.05)]), stepF = poly([wp(FX - 0.32, 0, a - 0.05), wp(FX - 0.32, 0, b + 0.05), wp(FX - 0.32, Y0, b + 0.05), wp(FX - 0.32, Y0, a - 0.05)]);
	const spill = poly([wp(FX - 0.32, 0, a), wp(FX - 0.32, 0, b), wp(0.9, 0, b + 0.8), wp(1.0, 0, a - 0.55)]);
	const frame = [poly([wp(FX, 0, a - 0.12), wp(FX, 0, a), wp(FX, Y1 + 0.42, a), wp(FX, Y1 + 0.42, a - 0.12)]), poly([wp(FX, 0, b), wp(FX, 0, b + 0.12), wp(FX, Y1 + 0.42, b + 0.12), wp(FX, Y1 + 0.42, b)]), poly([wp(FX, Y1, a - 0.12), wp(FX, Y1, b + 0.12), wp(FX, Y1 + 0.08, b + 0.12), wp(FX, Y1 + 0.08, a - 0.12)]), poly([wp(FX, Y1 + 0.38, a - 0.12), wp(FX, Y1 + 0.38, b + 0.12), wp(FX, Y1 + 0.46, b + 0.12), wp(FX, Y1 + 0.46, a - 0.12)])].join(' ');
	const fan = poly([wp(FX, Y1 + 0.08, a), wp(FX, Y1 + 0.08, b), wp(FX, Y1 + 0.38, b), wp(FX, Y1 + 0.38, a)]);
	const dc = wp(FX, 1.2, (a + b) / 2), sp0 = wp(FX - 0.3, 0, (a + b) / 2);
	const [mx, my] = wpt(DW, FX - 0.02, Y0, MD), mh = 1.6 * DW.S / MD;
	return <g>
		<defs>
			<linearGradient id={`${id}h`} gradientUnits="userSpaceOnUse" x1={wp(FX, 1, b)[0]} y1="0" x2={wp(FX, 1, a)[0]} y2="0"><stop offset="0" stopColor="#fff0c8" /><stop offset="0.6" stopColor="#ffd68c" /><stop offset="1" stopColor="#e89a48" /></linearGradient>
			<linearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1={sp0[0]} y1={sp0[1]} x2={wp(1.0, 0, 4)[0]} y2={wp(1.0, 0, 4)[1]}><stop offset="0" stopColor={GOLD} stopOpacity="0.8" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></linearGradient>
			<clipPath id={`${id}c`}><path d={op} /></clipPath>
		</defs>
		<path d={spill} fill={`url(#${id}s)`} opacity={open} />
		<path d={op} fill={`url(#${id}h)`} />
		<g clipPath={`url(#${id}c)`}>
			{/* the hall: a stair rail and the far wall's shadow */}
			<path d={poly([wp(FX + 0.6, Y0, b - 0.05), wp(FX + 0.6, 1.0, b - 0.05), wp(FX + 2.6, 2.6, b - 0.05), wp(FX + 2.6, Y0, b - 0.05)])} fill="#c98a46" opacity={0.35} />
			{mumOn && <g transform={layerTransform(cam, MD, atm.focus, atm.pp)}><RigMum x={mx} y={my} h={mh} action="stand" phase={t / 4.6 + 0.2} facing={-1} rim="#fff0c0" lightDir={8} rimO={1} /></g>}
			<path d={leaf} fill="#1d2824" /><path d={leaf} fill="#e6b060" opacity={0.08 + 0.12 * open} />
		</g>
		<path d={frame} fill="#cfc6b8" /><path d={fan} fill="#ffd68c" opacity={0.6 + 0.4 * open} />
		<path d={stepF} fill="#5d5660" /><path d={step} fill="#9a8f88" /><path d={step} fill={GOLD} opacity={0.35 * open} />
		<Glow x={dc[0] - 40} y={dc[1]} r={330} ry={380} c={GOLD} o={0.22 + 0.33 * open} />
	</g>;
};
/** bunting across the street (strings of small flags, per-point projected) */
const DBunting: React.FC<{t: number}> = ({t}) => {
	const wp = useWorld(DW), out: React.ReactNode[] = [];
	[6.5, 10, 14.5, 21, 30].forEach((D, j) => { const n = 16, cols = ['#d8c8a4', '#8a3a36', '#3e4f6e', '#e8e0cc'];
		const pts = Array.from({length: n + 1}, (_, i) => { const u = i / n, X = lerp(-4.6, FX, u), DD = D + u * 1.2; return wp(X, 5.2 - Math.sin(Math.PI * u) * 0.7, DD); });
		out.push(<path key={`s${j}`} d={'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} fill="none" stroke="#2a2a36" strokeWidth={Math.max(0.7, 9 / D)} />);
		pts.slice(0, n).forEach((p, i) => { const q = pts[i + 1], len = 260 / D, sw = Math.sin(t * 2.2 + i + j) * len * 0.12;
			out.push(<path key={`f${j}_${i}`} d={poly([[lerp(p[0], q[0], 0.12), lerp(p[1], q[1], 0.12)], [lerp(p[0], q[0], 0.88), lerp(p[1], q[1], 0.88)], [(p[0] + q[0]) / 2 + sw, (p[1] + q[1]) / 2 + len]])} fill={mix(cols[(i + j) % 4], '#4a4c6c', cl(D / 45))} />); }); });
	return <g>{out}</g>;
};
const DLamp: React.FC<{X: number; D: number; o?: number}> = ({X, D, o = 1}) => { const wp = useWorld(DW), fog = useFogD(), b = wp(X, 0, D), tp = wp(X, 5.4, D), s = Math.abs(b[1] - tp[1]) / 5.4;
	return <g><path d={poly([[b[0] - 0.07 * s, b[1]], [b[0] + 0.07 * s, b[1]], [tp[0] + 0.05 * s, tp[1]], [tp[0] - 0.05 * s, tp[1]]])} fill={fog('#1a1a26', D)} />
		<path d={poly([[tp[0] - 0.2 * s, tp[1]], [tp[0] + 0.2 * s, tp[1]], [tp[0] + 0.1 * s, tp[1] - 0.45 * s], [tp[0] - 0.1 * s, tp[1] - 0.45 * s]])} fill={fog('#1a1a26', D)} />
		<Glow x={tp[0]} y={tp[1] + 0.12 * s} r={2.4 * s} c="#ffc37a" o={0.45 * o} /><Glow x={tp[0]} y={tp[1] + 0.12 * s} r={0.4 * s} c="#fff0d0" o={0.9 * o} /></g>; };

/** the street at dawn; `open` 0 → 1 = the door swinging in; mumOn = she is in the doorway */
export const DawnStreet: React.FC<{t: number; cam: Cam; open: number; karlRim: number}> = ({t, cam, open, karlRim}) => {
	const [kx, ky] = wpt(DW, KX, 0, DF), kh = 1.8 * DW.S / DF, [cx, cy] = wpt(DW, 1.25, 0, 5.6);
	return <Stage t={t} cam={cam} atm={DATM} bg="#141a30">
		<Layer D={INF}>
			<SkyGrad y0={-600} y1={DW.hz + 40} stops={[[0, '#0c1228'], [0.35, '#1b2650'], [0.62, '#3c4878'], [0.82, '#8a7898'], [0.93, '#e6a68a'], [1, '#ffd2a0']]} />
			<CloudBands id="a1dc" t={t} bands={[[60, 50, 3, 0.55], [190, 40, 5, 0.5], [320, 30, 9, 0.6], [410, 22, 13, 0.7]]} top="#26325c" mid="#4c5482" under="#9a86a6" warm="#f0a888" warmFrom={2} drift={4} />
			<Glow x={DW.vpx} y={DW.hz - 10} r={760} ry={260} c="#ffb27a" o={0.55} />
			<Glow x={DW.vpx} y={DW.hz - 10} r={140} c="#fff0d2" o={0.7} />
		</Layer>
		<DStreet open={open} />
		<Facade X={-4.6} from={7.6} to={90} side={-1} lit={1} />
		<Facade X={FX} from={H0} to={95} side={1} mum lit={open} />
		<DBunting t={t} />
		<DLamp X={-4.0} D={13} o={0.8} /><DLamp X={2.2} D={22} o={0.7} /><DLamp X={2.2} D={8.2} />
		<DoorWay open={open} t={t} mumOn={open > 0.01} />
		<g transform={layerTransform(cam, 5.6, DF, DATM.pp)}><Cart x={cx} y={cy} h={1.8 * DW.S / 5.6} kind="orange" facing={1} rim="#ffcf7a" lightDir={12} rimO={0.5 + 0.4 * open} /></g>
		<FigureSlot x={kx} y={ky} h={kh} attire="home2026" action="stand" phase={t / 4.2 + 0.4} facing={1} rim="#ffd690" lightDir={10} rimO={karlRim} reflect={{wy: ky + 2, o: 0.22}} contact={0.35} />
		<Particles kind="rain" n={70} seed={31} D={[1.2, 14]} c="#c9d2e6" o={0.22} wind={-90} />
		<Particles kind="dust" n={26} seed={32} D={[2.5, 6]} box={[700, 200, 1400, 900]} c="#ffe0a0" o={0.6 * open} size={1} />
	</Stage>;
};
/** the door scene's camera: tight on the drawn Karl where the print's face was, opening out to the two-shot, then a slow push */
const DPUSH = {x: 26, y: -10, z: 0.48};
/** the push's progress: eases in, leaves at 1.5× its mean speed (the title's crane carries that speed on) */
const pushE = (u: number) => { const x = cl(u); return x * x * (1.5 - 0.5 * x); };
const doorCam = (t: number, dur: number): Cam => {
	const e1 = eio((t + 0.5) / 1.3), e2 = pushE(t / dur);
	return {x: lerp(-433, 0, e1) + DPUSH.x * e2, y: lerp(-58, 0, e1) + DPUSH.y * e2, zoom: lerp(1.5, 1, e1), roll: 0, z: DPUSH.z * e2};
};
const doorOpen = (t: number, beat: number) => eio((t - 2 * beat) / (1.7 * beat));
const DoorScene: React.FC<SceneProps> = ({t, dur, beat, tr}) => {
	const cam = addCam(doorCam(t, dur), drift(t, 0.5, 5)), open = doorOpen(t, beat);
	const pic = <DawnStreet t={t} cam={cam} open={open} karlRim={0.45 + 0.5 * open} />;
	if (t >= 0) return pic;
	// the reveal (t from −ov to 0): the drawn street fades up inside the print's picture, then the window opens out to the frame
	const ov = ACT1A.door.ov ?? 0.5, u = cl((t + ov) / ov), pd = sceneOf(tr, 'print').dur, tp = pd + t - beatOff(tr, 'print');
	const s = 1 + 0.045 * sm(cl((pd + t) / pd)), dx = 6 * Math.sin(tp * 0.8), hw = PG.w / 2 * s, hh = PG.w / NOW.aspect / 2 * s, r = PG.rot * Math.PI / 180;
	const corner = (sx: number, sy: number): P => [PG.cx + dx * s + sx * hw * Math.cos(r) - sy * hh * Math.sin(r), PG.cy + sx * hw * Math.sin(r) + sy * hh * Math.cos(r)];
	const frame: P[] = [[-20, -20], [W + 20, -20], [W + 20, H + 20], [-20, H + 20]], open1 = eio((u - 0.3) / 0.7);
	const pts = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)].map((p, i) => [lerp(p[0], frame[i][0], open1), lerp(p[1], frame[i][1], open1)]);
	return <AbsoluteFill style={{clipPath: `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(', ')})`, opacity: sm(u / 0.32)}}>{pic}</AbsoluteFill>;
};

/* ======================================================= TITLE ======================================================= */
/** dawn cloud the camera rises through: soft puffs streaming down past the lens, densest at tm */
const CloudPass: React.FC<{t: number; t0: number; tm: number; t1: number}> = ({t, t0, tm, t1}) => {
	const id = useUid('cp'); if (t < t0 || t > t1) return null;
	const u = (t - t0) / (t1 - t0), dens = t < tm ? sm((t - t0) / (tm - t0)) : 1 - sm((t - tm) / (t1 - tm));
	return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
		<defs><radialGradient id={`${id}a`}><stop offset="0" stopColor="#f7e6dc" stopOpacity="1" /><stop offset="0.45" stopColor="#d9c8d0" stopOpacity="0.8" /><stop offset="1" stopColor="#9a92b0" stopOpacity="0" /></radialGradient>
			<radialGradient id={`${id}b`}><stop offset="0" stopColor="#c4b8cc" stopOpacity="0.9" /><stop offset="0.5" stopColor="#8e88a8" stopOpacity="0.6" /><stop offset="1" stopColor="#6a6a90" stopOpacity="0" /></radialGradient></defs>
		{Array.from({length: 34}, (_, i) => { const k = rnd(i, 3), sc = 0.5 + 2.2 * k, y = lerp(H + 500, -700, cl(u * (0.8 + 0.9 * k) + rnd(i, 4) * 0.5 - 0.3)), x = rnd(i, 5) * (W + 400) - 200 + (rnd(i, 6) - 0.5) * 300 * u;
			return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={f1(340 * sc)} ry={f1(170 * sc)} fill={`url(#${id}${i % 3 ? 'a' : 'b'})`} opacity={(0.9 * cl(dens * 1.6)).toFixed(3)} />; })}
		<rect x={0} y={0} width={W} height={H} fill="#e6dade" opacity={Math.pow(dens, 3) * 0.7} />
	</svg>;
};
const TitleScene: React.FC<SceneProps> = ({t, dur, tr}) => {
	useFonts59('英国赫尔智利蓬塔阿雷纳斯');
	const dd = sceneOf(tr, 'door').dur, c0 = doorCam(dd, dd), crane = ein(t / 1.05), k = 1.5 * t / dd;
	const street = t < 1.05 ? <DawnStreet t={dd + t} cam={addCam({...c0, x: c0.x + DPUSH.x * k, y: c0.y + DPUSH.y * k - 1500 * crane, z: (c0.z ?? 0) + DPUSH.z * k + 0.2 * crane}, drift(dd + t, 0.5, 5))} open={1} karlRim={0.95} /> : null;
	// the Earth: from just above Hull out to the whole globe, then the route lights backward to Chile, then a dive toward Punta Arenas
	const pull = eout((t - 0.75) / 1.7), alt0 = Math.exp(lerp(Math.log(0.045), Math.log(2.15), pull));
	const pA = 1.35, pB = dur - 0.6, p = 1 - trap((t - pA) / (pB - pA), 0.18), dive = ein((t - (dur - 0.62)) / 0.62);
	const fo = followAt(Math.min(0.9999, p), 0.02, 0.02), mixC = sm((t - pA + 0.25) / 0.6);
	let lon = lerp(HULL[0] - 360, fo[0], mixC), lat = lerp(HULL[1], fo[1], mixC);
	if (dive > 0) { lon = lerp(lon, PUNTA[0], sm(dive * 1.4)); lat = lerp(lat, PUNTA[1], sm(dive * 1.4)); }
	const alt = Math.exp(lerp(Math.log(alt0), Math.log(0.22), dive));
	const v: SatView = {lon, lat, alt, cx: 960, cy: lerp(400, 540, dive), tilt: 0, roll: 0};
	const titleU = (t - 1.25) / 1.0, titleO = 1 - sm((t - (dur - 0.42)) / 0.32);
	return <AbsoluteFill style={{background: '#060912'}}>
		{t >= 0.7 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			<Space id="a1sp" drift={t * 6} />
			<Earth id="a1e" v={v} route={{p0: Math.max(0, p), p1: 1, head: Math.max(0, p)}} home={sm((t - 0.8) / 0.4)} clouds={0.9}
				pins={[{ll: HULL, label: '英国 赫尔', kind: 'home', o: sm((t - 1.0) / 0.3) * (1 - sm((t - 2.6) / 0.4)), dy: -30}, {ll: PUNTA, label: '智利 蓬塔阿雷纳斯', kind: 'start', o: sm((0.06 - p) / 0.05) * (1 - dive), dy: 44}]} />
		</svg>}
		{street && <AbsoluteFill style={{opacity: 1 - sm((t - 0.82) / 0.2)}}>{street}</AbsoluteFill>}
		<CloudPass t={t} t0={0.3} tm={0.92} t1={1.6} />
		{titleU > 0 && <Title u={titleU} o={titleO} push={1 + 0.035 * sm((t - 1.25) / (dur - 1.25))} top={690} />}
	</AbsoluteFill>;
};

export const ACT1A: Record<'print' | 'door' | 'title', SceneDef> = {
	print: {C: PrintScene},
	door: {C: DoorScene, tin: 'own', ov: 0.5},
	title: {C: TitleScene, noCounter: true},
};
