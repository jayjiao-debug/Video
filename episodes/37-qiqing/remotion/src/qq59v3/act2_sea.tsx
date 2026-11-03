import React from 'react';
import {Stage, Layer, FPath, Shape, Particles, Mist, Glow, SkyGrad, Sun, Cam, INF, useGround, useStage, P, W, H, f1, lerp, rnd, noise1, spline, poly, mix, cl, sm, wrap} from './kit3';
import {Fig, IceRidge, IceCols, travel, jolt, pulse} from './act2_kit';
import {gaitJoints, Sled} from './act2_karl';

/* ep59 v3 · act 2 · night on the ice (the tent and the crack) and the open lead at dusk (the swim, towing the sleds). */

/* ===================================================== tent: night, the ice breaks under the tent =====================================================
   A moonlit floe under stars and a faint aurora; a small dome tent glows gold from the lamp inside, the sleds beside it. On beat 2 a
   crack races in from the right, under the tent, with a flash along its edge and a jolt of the camera; the slabs part, black water
   opens and the tent lurches; on beat 3 the two of them scramble out of the door and run left, headlamps cutting the dark. */
const NB = {focus: 2.7, hz: 560, K: 720};
const ngY = (D: number) => NB.hz + NB.K / D;
const NIGHT: IceCols = {lit: '#8496c8', shade: '#1d2750', cap: '#b4c3e8'};

const NightSky: React.FC<{t: number}> = ({t}) => <>
	<SkyGrad y0={0} y1={H} stops={[[0, '#03050d'], [0.3, '#071028'], [0.47, '#11204a'], [0.52, '#24365f'], [0.5201, '#1d2a52'], [0.62, '#24315c'], [1, '#33427a']]} />
	{/* stars */}
	<g fill="#eaf0ff">{Array.from({length: 150}, (_, i) => { const x = rnd(i, 1) * (W + 200) - 100, y = Math.pow(rnd(i, 2), 1.4) * 520, r = 0.6 + Math.pow(rnd(i, 3), 3) * 1.8, tw = 0.45 + 0.55 * Math.pow(Math.abs(Math.sin(t * (0.8 + rnd(i, 4) * 2) + i)), 2);
		return <circle key={i} cx={f1(x)} cy={f1(y)} r={r.toFixed(2)} opacity={(tw * (0.3 + 0.7 * rnd(i, 5)) * (1 - y / 700)).toFixed(3)} />; })}</g>
	{/* the aurora: two soft curtains, green at the foot fading up, waving slowly */}
	<defs><linearGradient id="a2aur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6affc0" stopOpacity="0" /><stop offset="0.55" stopColor="#58e8b0" stopOpacity="0.22" /><stop offset="0.86" stopColor="#9affd6" stopOpacity="0.5" /><stop offset="1" stopColor="#9affd6" stopOpacity="0" /></linearGradient></defs>
	{[0, 1].map((k) => { const pts: P[] = [], bot: P[] = [];
		for (let i = 0; i <= 24; i++) { const x = -200 + i * 100, w = Math.sin(x / 380 + t * 0.35 + k * 2) * 60 + Math.sin(x / 150 - t * 0.6 + k) * 18;
			const yb = 330 + k * 40 + w + (x - 900) * (k ? 0.05 : -0.08); pts.push([x, yb - 210 - k * 40 + Math.sin(x / 90 + t + k) * 20]); bot.push([x, yb]); }
		const streaks = pts.map(([x, y], i) => { const b = bot[i], w = 6 + rnd(i, k + 40) * 16; return `M${f1(x - w)},${f1(y + 30)} L${f1(x + w)},${f1(y + 30)} L${f1(b[0] + w)},${f1(b[1] - 8)} L${f1(b[0] - w)},${f1(b[1] - 8)} Z`; }).join(' ');
		return <g key={k} opacity={k ? 0.45 : 0.7}><path d={spline([...pts, ...bot.slice().reverse()], true)} fill="url(#a2aur)" /><path d={streaks} fill="url(#a2aur)" opacity={0.35 + 0.25 * Math.sin(t * 2 + k)} /></g>; })}
	<Glow x={1490} y={190} r={140} c="#cfdcff" o={0.4} /><circle cx={1490} cy={190} r={17} fill="#f4f7ff" /><circle cx={1497} cy={186} r={15} fill="#dfe6f8" opacity={0.5} />
	<Glow x={900} y={440} r={1500} ry={150} c="#2c5f78" o={0.4} />
	<Glow x={960} y={NB.hz + 6} r={1300} ry={60} c="#5d73b0" o={0.5} />
</>;

const NightSastrugi: React.FC<{n: number; seed: number}> = ({n, seed}) => {
	const g = useGround(NB.hz, NB.K), S: string[] = [], Hh: string[] = [];
	for (let i = 0; i < n; i++) { const u = Math.pow(rnd(i, seed), 1.7), y = lerp(NB.hz + 30, 1120, u), x = -900 + rnd(i, seed + 1) * 3700, d = y - NB.hz, L = d * (1.2 + rnd(i, seed + 2) * 2.2), th = d * 0.035;
		const a: P[] = [[x - L / 2, y], [x - L * 0.1, y - th * 0.6], [x + L / 2, y - th * 0.2], [x + L * 0.1, y + th * 0.5]];
		S.push(spline(a.map(g), true)); Hh.push(spline(a.map(([px, py]) => [px - L * 0.04, py - th * 0.5] as P).map(g), true)); }
	return <g><Shape d={S.join(' ')} fill="#162147" o={0.5} /><Shape d={Hh.join(' ')} fill="#8496cc" o={0.28} /></g>; };

/** the crack (a ground decal): runs in from the right to `p` (0..1); `gap` opens it (black water between the slabs) */
const CRACK: P[] = [[2300, 930], [1900, 900], [1640, 878], [1420, 858], [1240, 846], [1060, 832], [900, 820], [720, 806], [520, 793], [300, 781], [40, 771], [-300, 760], [-700, 752]];
const Crack: React.FC<{p: number; gap: number; t: number}> = ({p, gap, t}) => {
	const g = useGround(NB.hz, NB.K);
	// densify with a jagged zig-zag
	const pts: P[] = [];
	for (let i = 0; i < CRACK.length - 1; i++) for (let k = 0; k < 6; k++) { const u = k / 6, a = CRACK[i], b = CRACK[i + 1], x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), d = y - NB.hz;
		pts.push([x + (rnd(i * 6 + k, 3) - 0.5) * d * 0.25, y + (rnd(i * 6 + k, 4) - 0.5) * d * 0.05]); }
	const n = Math.max(2, Math.floor(p * pts.length)), vis = pts.slice(0, n);
	if (p <= 0) return null;
	const front = vis[vis.length - 1], wid = (y: number) => (y - NB.hz) * (0.012 + gap * 0.11);
	const upper = vis.map(([x, y]) => [x, y - wid(y) * 0.35] as P), lower = vis.map(([x, y]) => [x, y + wid(y) * 0.65] as P);
	const water = poly([...upper, ...lower.reverse()].map(g));
	const lip = poly([...vis.map(([x, y]) => [x, y + wid(y) * 0.65] as P), ...vis.slice().reverse().map(([x, y]) => [x, y + wid(y) * 0.65 + (y - NB.hz) * 0.012] as P)].map(g));
	const glint = poly([...upper, ...upper.slice().reverse().map(([x, y]) => [x, y - (y - NB.hz) * 0.006] as P)].map(g));
	const fp = g(front);
	return <g>
		<path d={water} fill="#02040b" />
		<path d={lip} fill="#5f74b4" opacity={0.85 * gap + 0.3} />
		<path d={glint} fill="#d6ecff" opacity={0.9} />
		{p < 1 && <Glow x={fp[0]} y={fp[1]} r={90} ry={30} c="#bfe2ff" o={0.9} />}
		{/* ice dust thrown up along the fresh crack */}
		{p > 0 && Array.from({length: 26}, (_, i) => { const q = vis[Math.floor(rnd(i, 7) * vis.length)], a = g(q), age = cl((t * 3 + rnd(i, 8)) % 1);
			return <circle key={i} cx={f1(a[0] + (rnd(i, 9) - 0.5) * 30)} cy={f1(a[1] - age * 40 * (q[1] - NB.hz) / 260)} r={(1 + rnd(i, 10) * 1.8).toFixed(1)} fill="#e4f0ff" opacity={((1 - age) * 0.7 * (1 - gap * 0.6)).toFixed(2)} />; })}
	</g>; };

/** the dome tent (side on), lit from inside; door on the left, open. (x, y) = the middle of its base; tilt in degrees about the right foot */
const Tent: React.FC<{x: number; y: number; w: number; tilt: number; lamp: number}> = ({x, y, w, tilt, lamp}) => {
	const h = w * 0.55, L = x - w / 2, R = x + w / 2;
	const shell = spline([[L, y], [L + w * 0.04, y - h * 0.5], [L + w * 0.2, y - h * 0.9], [x, y - h], [R - w * 0.2, y - h * 0.9], [R - w * 0.04, y - h * 0.5], [R, y], [x, y + 4]], true);
	const door = spline([[L + w * 0.1, y], [L + w * 0.12, y - h * 0.45], [L + w * 0.26, y - h * 0.72], [L + w * 0.4, y - h * 0.5], [L + w * 0.42, y]], true);
	const fl = 0.9 + 0.1 * Math.sin(lamp * 23) * Math.sin(lamp * 7);
	return <g transform={`rotate(${tilt.toFixed(2)} ${R} ${y})`}>
		<defs><radialGradient id="a2tent" gradientUnits="userSpaceOnUse" cx={x - w * 0.08} cy={y - h * 0.45} r={w * 0.62}><stop offset="0" stopColor="#ffe9b0" /><stop offset="0.45" stopColor="#f6a44e" /><stop offset="0.85" stopColor="#b5552a" /><stop offset="1" stopColor="#7b3420" /></radialGradient></defs>
		<Glow x={x} y={y - h * 0.4} r={w * 1.5} ry={w * 0.7} c="#ffb45a" o={0.42 * fl} />
		<path d={shell} fill="url(#a2tent)" opacity={fl} />
		{/* poles / seams */}
		{[0.32, 0.68].map((k, i) => <path key={i} d={`M${f1(L + w * k * 0.6)},${f1(y)} Q${f1(lerp(L, R, k))},${f1(y - h * 1.35)} ${f1(R - w * (1 - k) * 0.6)},${f1(y)}`} stroke="#6a2c16" strokeWidth={2.4} fill="none" opacity={0.6} />)}
		<path d={door} fill="#fff4cf" opacity={0.95} />
		<path d={`M${f1(L + w * 0.1)},${f1(y)} L${f1(L - w * 0.05)},${f1(y - h * 0.18)} L${f1(L + w * 0.13)},${f1(y - h * 0.42)} Z`} fill="#8a3c1e" />
		<path d={`M${f1(L)},${f1(y)} L${f1(R)},${f1(y)} L${f1(R - 4)},${f1(y - 7)} L${f1(L + 4)},${f1(y - 7)} Z`} fill="#5a2414" opacity={0.85} />
		{/* guy lines */}
		<path d={`M${f1(L + w * 0.08)},${f1(y - h * 0.6)} L${f1(L - w * 0.28)},${f1(y + 6)} M${f1(R - w * 0.08)},${f1(y - h * 0.6)} L${f1(R + w * 0.3)},${f1(y + 8)}`} stroke="#c7a27a" strokeWidth={1.3} opacity={0.6} />
	</g>; };

/** a headlamp: a cone of light from the forehead (screen coords inside the figure's layer), pointing at angle a (deg, 0 = +x, + down) */
const Beam: React.FC<{x: number; y: number; a: number; len: number; spread?: number; o?: number; id: string}> = ({x, y, a, len, spread = 13, o = 1, id}) => {
	const r = (d: number): P => [x + Math.cos((a + d) * Math.PI / 180) * len, y + Math.sin((a + d) * Math.PI / 180) * len];
	const e = r(0);
	return <g opacity={o}>
		<defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={e[0]} y2={e[1]}><stop offset="0" stopColor="#f2f7ff" stopOpacity="0.85" /><stop offset="0.35" stopColor="#d8e6ff" stopOpacity="0.32" /><stop offset="1" stopColor="#c8dcff" stopOpacity="0" /></linearGradient></defs>
		<path d={poly([[x, y - 2], r(-spread), r(spread), [x, y + 2]])} fill={`url(#${id})`} />
		<path d={poly([[x, y - 1], r(-spread * 0.4), r(spread * 0.4), [x, y + 1]])} fill={`url(#${id})`} opacity={0.8} />
		<circle cx={x} cy={y} r={4.5} fill="#ffffff" /><Glow x={x} y={y} r={26} c="#e6f0ff" o={0.9} />
	</g>; };

export const TentShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur, beat}) => {
	const tc = 2 * beat, p = sm((t - tc) / 0.3), gap = sm((t - tc - 0.2) / (3 * beat)), e = sm(cl(t / dur));
	const [jx, jy] = jolt(t, tc + 0.1, 11, 2);
	const cam: Cam = {x: lerp(-40, 50, e) + jx, y: lerp(10, -14, e) + jy, z: lerp(0, 0.3, e), zoom: 1, roll: lerp(0, -0.3, e) + 0.9 * gap};
	const flash = pulse(t, tc, 0.04, 0.35);
	const te = tc + beat * 1.1, h = 272, Dk = NB.focus, D2 = 3.15, h2 = h * NB.focus / D2;
	const run = (t0: number, hh: number, x0: number, D: number, seed: number, key: string) => {
		const tt = t - t0; if (tt < -0.05) return null;
		const tr = travel('walk', Math.max(0, tt), hh, 1.7, 1.7, 0, 1, seed), x = x0 - tr.dx, y = ngY(D);
		const j = gaitJoints('walk', tr.phase, x, y, hh), hd = j.Head, lamp: P = [2 * x - (hd[0] + hh * 0.045), hd[1] - hh * 0.01];
		const sweep = Math.sin(tt * 5 + seed * 3) * 6;
		return <Fig key={key} x={x} y={y} h={hh} depth={D} attire="ice" action="walk" phase={tr.phase} facing={-1} rim="#a9c4ff" lightDir={40}
			over={<Beam x={lamp[0]} y={lamp[1]} a={180 - 14 + sweep} len={hh * 2.6} id={`a2bm${key}`} o={sm(tt / 0.15)} />} />;
	};
	return <Stage t={t} cam={cam} atm={{haze: '#26335e', density: 0.03, focus: NB.focus, aperture: 1.5, rim: '#a9c4ff', lightDir: 40, grain: 0.06, vignette: 0.6, pp: [960, NB.hz]}} bg="#060a18">
		<Layer D={INF}><NightSky t={t} /></Layer>
		<Layer D={60}><IceRidge x0={-800} x1={2800} y={ngY(60)} hmin={1} hmax={5} seed={2} cols={NIGHT} rows={1} /></Layer>
		<Layer D={24}><IceRidge x0={-900} x1={700} y={ngY(24)} hmin={4} hmax={22} seed={5} cols={NIGHT} rows={1} /><IceRidge x0={1300} x1={2800} y={ngY(24)} hmin={3} hmax={16} seed={6} cols={NIGHT} rows={1} /></Layer>
		<Layer D={INF}><rect x={-1000} y={NB.hz} width={W + 2000} height={H} fill="#24315d" opacity={0.35} /><NightSastrugi n={140} seed={4} />
			<Glow x={960} y={ngY(2.7) - 10} r={560} ry={90} c="#ffb45a" o={0.28 * (1 - gap * 0.3)} />
			<Crack p={p} gap={gap} t={t} /></Layer>
		<Layer D={8}><IceRidge x0={1500} x1={3000} y={ngY(8)} hmin={14} hmax={70} seed={9} cols={NIGHT} /></Layer>
		<Layer D={Dk}>
			<Sled x={1430} y={ngY(Dk) + 4} h={h * 0.95} rim="#a9c4ff" lightDir={40} />
			<Sled x={1600} y={ngY(Dk) + 14} h={h} rim="#a9c4ff" lightDir={40} />
		</Layer>
		{run(te + 0.22, h2, 905, D2, 0.4, 'd')}
		<Layer D={Dk}><Tent x={1010} y={ngY(Dk)} w={380} tilt={-3.4 * gap} lamp={t} /></Layer>
		{run(te, h, 880, Dk, 0, 'k')}
		<Particles kind="snow" n={50} seed={31} D={[1, 9]} c="#dfe8ff" o={0.45} wind={-60} size={0.6} />
		<Layer D={1.6}><IceRidge x0={-700} x1={420} y={ngY(1.6)} hmin={40} hmax={190} seed={13} cols={NIGHT} rows={3} /></Layer>
		{flash > 0.01 && <rect x={0} y={0} width={W} height={H} fill="#cfe4ff" opacity={0.35 * flash} />}
	</Stage>;
};

/* ===================================================== lead: dusk, swimming the open lead =====================================================
   Looking down a lead of black water between two floes to the setting sun (one-point perspective: the floe edges, their ice faces
   and the glitter path all run to it). Mid-crossing, the two of them swim left → right in dry suits, each towing his red sled on a
   line; brash ice floats about them; sea smoke curls off the water. */
const LB = {focus: 1.95, hz: 455, K: 700, vpx: 860, XL: -470, XR: 430, fb: 0.085};
const lgY = (D: number) => LB.hz + LB.K / D;
/** x of a lateral offset X (px at the focus plane) on ground row y */
const latX = (X: number, y: number) => LB.vpx + X * (y - LB.hz) / (LB.K / LB.focus);
const ROWS = [LB.hz + 1, 458, 462, 467, 474, 484, 498, 518, 545, 580, 625, 685, 760, 860, 990, 1160, 1400];
const LCOL: IceCols = {lit: '#f0a990', shade: '#454273', cap: '#ffd2bc'};

const LeadSky: React.FC<{t: number}> = ({t}) => <>
	<SkyGrad y0={0} y1={H} stops={[[0, '#141633'], [0.2, '#2b2850'], [0.32, '#5b3f63'], [0.39, '#a2566a'], [0.415, '#e27c5c'], [0.4205, '#ffb26e'], [0.4215, '#3a3150'], [1, '#14182c']]} />
	{[[150, 30, 1600], [235, 18, 1200], [315, 12, 900], [385, 8, 700]].map(([y, th, w], i) => <g key={i}>{Array.from({length: 4}, (_, k) => { const x = wrap(rnd(k, i + 3) * 2600 - 300 + t * (5 - i), -700, W + 700);
		return <ellipse key={k} cx={x} cy={y + (rnd(k, i) - 0.5) * 30} rx={w * (0.3 + rnd(k, i + 9) * 0.4)} ry={th * (0.6 + rnd(k, i + 4) * 0.6)} fill={i > 1 ? '#f39a74' : '#6a4466'} opacity={0.55} />; })}</g>)}
	<Sun x={LB.vpx} y={LB.hz - 5} r={30} c="#ff9a5a" core="#fff0d6" bloom={10} bloomO={0.85} />
	<Glow x={LB.vpx} y={LB.hz} r={1200} ry={130} c="#ff9d66" o={0.5} />
</>;

const jag = (y: number, s: number) => (noise1(y / 23, s) * 50 + noise1(y / 7, s + 3) * 18) * (y - LB.hz) / 300;
/** the lead: black water between the two floe edges (ground decals), their ice faces, the glitter path, ripples, brash ice */
const LeadWater: React.FC<{t: number}> = ({t}) => {
	const g = useGround(LB.hz, LB.K);
	const edge = (X: number, s: number) => ROWS.map((y) => [latX(X, y) + jag(y, s), y] as P);
	const Le = edge(LB.XL, 1), Re = edge(LB.XR, 5);
	const water = poly([...Le, ...Re.slice().reverse()].map(g));
	const up = (pts: P[], k: number) => pts.map(([x, y]) => [x, y - (y - LB.hz) * k] as P);
	const leftTop = poly(([...up(Le, LB.fb), [-4000, 1400], [-4000, LB.hz + 1]] as P[]).map(g)), rightTop = poly(([...up(Re, LB.fb), [5000, 1400], [5000, LB.hz + 1]] as P[]).map(g));
	const leftFace = poly([...Le, ...up(Le, LB.fb).reverse()].map(g)), rightFace = poly([...Re, ...up(Re, LB.fb).reverse()].map(g));
	const lipL = poly([...up(Le, LB.fb), ...up(Le, LB.fb + 0.012).reverse()].map(g)), lipR = poly([...up(Re, LB.fb), ...up(Re, LB.fb + 0.012).reverse()].map(g));
	const gl: string[] = [];
	for (let i = 0; i < 80; i++) { const y = LB.hz + 2 + Math.pow(rnd(i, 11), 1.8) * 620, d = y - LB.hz, fl = rnd(i, Math.floor(t * 8 + i * 0.3));
		if (fl < 0.35) continue; const x = LB.vpx + (rnd(i, 12) - 0.5) * (10 + d * 0.45), w = 4 + d * 0.1 * rnd(i, 13), hh = 0.6 + d * 0.008;
		gl.push(`M${f1(x - w)},${f1(y)} L${f1(x + w)},${f1(y)} L${f1(x + w * 0.8)},${f1(y + hh)} L${f1(x - w * 0.8)},${f1(y + hh)} Z`); }
	const rip: string[] = [];
	for (let i = 0; i < 46; i++) { const y = LB.hz + 8 + Math.pow(rnd(i, 21), 1.5) * 650, d = y - LB.hz, x = latX((rnd(i, 22) - 0.5) * 800, y), w = 10 + d * 0.5 * rnd(i, 23);
		rip.push(`M${f1(x - w)},${f1(y)} Q${f1(x)},${f1(y - 1.5 - d * 0.004)} ${f1(x + w)},${f1(y)} Q${f1(x)},${f1(y + 0.6)} ${f1(x - w)},${f1(y)} Z`); }
	const pans: React.ReactNode[] = [];
	for (let i = 0; i < 22; i++) { const Z = wrap(1 / (0.07 + rnd(i, 31) * 0.6) - t * 0.22, 1.3, 15), y = LB.hz + LB.K / Z, X = (rnd(i, 32) - 0.5) * 780, x = latX(X, y), s = (y - LB.hz) * (0.04 + rnd(i, 33) * 0.06);
		const pts: P[] = Array.from({length: 6}, (_, k) => { const a = k / 6 * Math.PI * 2; return [x + Math.cos(a) * s * (0.7 + rnd(i * 6 + k, 34) * 0.6), y + Math.sin(a) * s * 0.28 * (0.7 + rnd(i * 6 + k, 35) * 0.6)] as P; });
		pans.push(<g key={i}><path d={poly(pts.map(([px, py]) => [px, py + s * 0.09] as P))} fill="#2e3058" /><path d={poly(pts)} fill={mix('#e9c6c2', '#8d86b0', cl((Z - 2) / 12))} /></g>); }
	return <g>
		<defs><linearGradient id="a2lw" gradientUnits="userSpaceOnUse" x1="0" y1={LB.hz} x2="0" y2={H}><stop offset="0" stopColor="#d07a6a" /><stop offset="0.05" stopColor="#5a3a58" /><stop offset="0.28" stopColor="#1e1d36" /><stop offset="1" stopColor="#090b18" /></linearGradient>
			<linearGradient id="a2lt" gradientUnits="userSpaceOnUse" x1="0" y1={LB.hz} x2="0" y2={H}><stop offset="0" stopColor="#f4b7a0" /><stop offset="0.2" stopColor="#c99aae" /><stop offset="1" stopColor="#5e5c90" /></linearGradient></defs>
		<path d={water} fill="url(#a2lw)" />
		<path d={gl.join(' ')} fill="#ffcf8a" opacity={0.9} />
		<path d={rip.join(' ')} fill="#b89aa8" opacity={0.22} />
		{pans}
		<path d={leftTop} fill="url(#a2lt)" /><path d={rightTop} fill="url(#a2lt)" />
		<path d={leftFace} fill="#4a4c80" /><path d={rightFace} fill="#2b2e5c" />
		<path d={lipL} fill="#ffd9c4" opacity={0.8} /><path d={lipR} fill="#f6c6b8" opacity={0.55} />
		<FloeTexture />
	</g>; };
/** wind ripples and hummocks on the floe tops either side of the lead (ground decals, raised a little) */
const FloeTexture: React.FC = () => {
	const g = useGround(LB.hz, LB.K), sh: string[] = [], hi: string[] = [];
	for (let i = 0; i < 170; i++) { const y = LB.hz + 3 + Math.pow(rnd(i, 71), 1.7) * 640, d = y - LB.hz, side = rnd(i, 72) < 0.5 ? -1 : 1;
		const edge = side < 0 ? latX(LB.XL, y) : latX(LB.XR, y), x = edge + side * (40 + rnd(i, 73) * 1600) * d / 300, yy = y - d * LB.fb, L = d * (0.8 + rnd(i, 74) * 2.4), th = d * 0.03;
		const a: P[] = [[x - L / 2, yy], [x - L * 0.1, yy - th * 0.7], [x + L / 2, yy - th * 0.2], [x + L * 0.1, yy + th * 0.5]];
		sh.push(spline(a.map(g), true)); hi.push(spline(a.map(([px, py]) => [px - L * 0.05, py - th * 0.55] as P).map(g), true)); }
	return <g><Shape d={sh.join(' ')} fill="#6a5f92" o={0.4} /><Shape d={hi.join(' ')} fill="#ffe0cc" o={0.35} /></g>; };

/** a red pulk afloat (nose at x, the water line at y), low in the water, with the tow line from the swimmer's waist */
const FloatSled: React.FC<{x: number; y: number; h: number; t: number; tow: P}> = ({x, y, h, t, tow}) => {
	const L = h * 0.62, bob = Math.sin(t * 2.4) * h * 0.006, y0 = y + bob, top = y0 - h * 0.05;
	const deck = spline([[x, y0 + h * 0.006], [x - L * 0.05, top], [x - L * 0.5, top - h * 0.008], [x - L * 0.95, top], [x - L, y0 + h * 0.006]], true);
	const cover = spline([[x - L * 0.12, top + 1], [x - L * 0.2, top - h * 0.022], [x - L * 0.75, top - h * 0.026], [x - L * 0.86, top + 1]], true);
	const sag: P = [(x + tow[0]) / 2, Math.max(y0, tow[1]) + h * 0.008];
	return <g>
		<path d={`M${f1(tow[0])},${f1(tow[1])} Q${f1(sag[0])},${f1(sag[1])} ${f1(x - 2)},${f1(top + h * 0.012)}`} stroke="#120c10" strokeWidth={Math.max(1.4, h * 0.005)} fill="none" />
		<path d={deck} fill="#4e1618" /><path d={cover} fill="#7e2a26" />
		{[0.3, 0.55].map((k, i) => <path key={i} d={`M${f1(x - L * k)},${f1(top - h * 0.022)} L${f1(x - L * k - 3)},${f1(top + 2)}`} stroke="#220c0e" strokeWidth={2} />)}
		<path d={`M${f1(x + h * 0.02)},${f1(y0)} Q${f1(x - L * 0.5)},${f1(y0 + h * 0.01)} ${f1(x - L - h * 0.03)},${f1(y0)}`} stroke="#f1d8d2" strokeWidth={Math.max(1, h * 0.005)} fill="none" opacity={0.7} />
		{[0, 1, 2].map((k) => { const a = ((t * 0.9 + k / 3) % 1); return <ellipse key={k} cx={x - L * 0.5} cy={y0 + 2} rx={L * (0.55 + a * 0.5)} ry={h * (0.01 + a * 0.016)} fill="none" stroke="#e8d0cc" strokeWidth={1} opacity={0.3 * (1 - a)} />; })}
	</g>; };

/** pressure rubble along both floe edges at depth D (its own parallax layer) */
const EdgeRubble: React.FC<{D: number; seed: number; k?: number}> = ({D, seed, k = 1}) => {
	const y = lgY(D), s = LB.focus / D, fb = (y - LB.hz) * LB.fb, xl = latX(LB.XL, y) + jag(y, 1), xr = latX(LB.XR, y) + jag(y, 5);
	return <>
		<IceRidge x0={xl - 300 * s} x1={xl + 10 * s} y={y - fb + 2} hmin={10 * s * k} hmax={80 * s * k} seed={seed} cols={LCOL} rows={2} />
		<IceRidge x0={xr - 10 * s} x1={xr + 320 * s} y={y - fb + 2} hmin={10 * s * k} hmax={70 * s * k} seed={seed + 50} cols={LCOL} rows={2} flip />
	</>; };

export const LeadShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur}) => {
	const e = sm(cl(t / dur)), h = 600, Dk = 1.95, D2 = 2.8, h2 = h * Dk / D2;
	const tk = travel('swim', t + 0.6, h, 1, 1, 0, 1), td = travel('swim', t + 0.3, h2, 1, 1, 0, 1, 0.45);
	const cam: Cam = {x: tk.dx * 0.8 + lerp(-30, 20, e), y: lerp(-24, 10, e), z: lerp(0, 0.2, e), zoom: 1, roll: lerp(-0.5, 0.3, e) + Math.sin(t * 0.9) * 0.2};
	const kx = 1010 + tk.dx, dx2 = 640 + td.dx * Dk / D2;
	const swimmer = (x: number, y: number, hh: number, ph: number, D: number, key: string) => <Fig key={key} x={x} y={y} h={hh} depth={D} attire="swim" action="swim" phase={ph} rim="#ffc49a" lightDir={160}
		foam="#f3ded6" waterHi="#a98aa0" underO={0.16} pitch={Math.sin(t * 1.7 + (key === 'k' ? 0 : 2)) * 2}
		under={<FloatSled x={x - hh * 0.58} y={y + hh * 0.004} h={hh} t={t + (key === 'k' ? 0 : 1)} tow={[x - hh * 0.36, y - hh * 0.015]} />} />;
	const Ds = Array.from({length: 22}, (_, i) => 52 * Math.pow(0.86, i)).filter((D) => D > 2.95);
	return <Stage t={t} cam={cam} atm={{haze: '#b58a9a', density: 0.035, focus: LB.focus, aperture: 1.6, rim: '#ffc49a', lightDir: 160, grain: 0.06, vignette: 0.55, pp: [LB.vpx, LB.hz]}} bg="#14182c">
		<Layer D={INF}><LeadSky t={t} /></Layer>
		<Layer D={INF}><LeadWater t={t} /></Layer>
		{Ds.map((D, i) => <Layer key={i} D={D}><EdgeRubble D={D} seed={11 + i * 7} /></Layer>)}
		<Layer D={6}><Mist n={8} seed={5} y0={lgY(6) - 20} y1={lgY(3.4)} t={t} speed={10} o={0.38} c="#e9b2a8" w={[300, 700]} h={[30, 70]} /></Layer>
		{swimmer(dx2, lgY(D2), h2, td.phase, D2, 'd')}
		<Layer D={2.35}><EdgeRubble D={2.35} seed={61} /></Layer>
		{swimmer(kx, lgY(Dk), h, tk.phase, Dk, 'k')}
		<Layer D={1.6}><EdgeRubble D={1.6} seed={71} k={0.9} /><Mist n={4} seed={9} y0={lgY(1.7) - 40} y1={lgY(1.7) + 40} t={t} speed={16} o={0.2} c="#f0c0b4" w={[500, 900]} h={[40, 90]} /></Layer>
		<Layer D={1.15}><EdgeRubble D={1.15} seed={81} k={0.8} /></Layer>
		<Particles kind="dust" n={40} seed={41} D={[1.2, 8]} c="#ffd9c0" o={0.5} />
	</Stage>;
};
void FPath; void useStage;
