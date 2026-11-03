import React from 'react';
import {Stage, Layer, FPath, Shape, FigureSlot, Particles, Mist, FogFoot, Glow, SkyGrad, Sun, INF, useFog, useGround, useStage, P, W, H, f1, lerp, rnd, noise1, fbm, ridge, spline, taper, mix} from './kit3';
import {camelD, tuftD, bareTreeD, CloudBands, moundD} from './props3';
import {SetProps} from './sets3a';

/* ep59 v3 · hero sets C: the Gobi at sunset, the Caspian Sea at dawn. */

/* ===================================================== 4 · GOBI AT SUNSET =====================================================
   2017, Mongolia. The sun sits on the far dunes at the right third; light rakes in from the right, so every dune splits into a gold
   windward face and a violet slip face. Karl leads a small camel caravan across a lit sand saddle toward the sun; their shadows run
   long to the left. Mountains of the Gobi Altai far off; a big dune sweeps in from the left foreground; saxaul twigs frame the corner. */
const GB = {focus: 6, hz: 646, K: 444, sun: [1540, 612] as P};
const ggY = (D: number) => GB.hz + GB.K / D;

const GobiSky: React.FC<{t: number}> = ({t}) => <>
	<SkyGrad y0={0} y1={H} stops={[[0, '#22163a'], [0.16, '#45204a'], [0.32, '#86304a'], [0.45, '#cc5a3b'], [0.53, '#ef9045'], [0.585, '#ffcb78'], [0.598, '#ffe0a0'], [0.6, '#f0a464'], [1, '#6a2f3e']]} />
	<CloudBands id="gcb" t={t} top="#3a1b44" mid="#7e3150" under="#c9584a" warm="#ffb66a" warmFrom={3}
		bands={[[110, 36, 3, 0.45], [214, 44, 7, 0.65], [318, 26, 11, 0.6], [410, 16, 15, 0.65], [474, 10, 19, 0.7], [522, 6, 23, 0.7]]} />
	<Sun x={GB.sun[0]} y={GB.sun[1]} r={44} c="#ffc05e" core="#fff3d0" bloom={9} bloomO={0.85} />
</>;

/** a band of side-lit dune mounds at one depth (drawn left → right so each overlaps the last) */
const Dunes: React.FC<{x0?: number; x1?: number; y: number; amp: number; wl: number; seed: number; shade: string; lit: string; extra?: number}> = ({x0 = -400, x1 = W + 400, y, amp, wl, seed, shade, lit, extra = 0}) => {
	const fog = useFog(), out: React.ReactNode[] = [];
	for (let x = x0, i = 0; x < x1; i++) { const w = wl * (0.7 + rnd(i, seed) * 0.8), hh = amp * (0.45 + rnd(i, seed + 1) * 0.55), sx = x + w * (0.35 + rnd(i, seed + 2) * 0.3);
		const m = moundD(x, sx, y - hh, x + w, y + rnd(i, seed + 3) * amp * 0.1, 1, 0.25 + rnd(i, seed + 4) * 0.2);
		out.push(<g key={i}><path d={m.body} fill={fog(shade, extra)} /><path d={m.lit} fill={fog(lit, extra)} /><path d={m.crest} fill={fog('#fff0c8', extra)} opacity={0.6} /></g>);
		x += w * (0.45 + rnd(i, seed + 5) * 0.3); }
	return <g>{out}</g>; };
/** one big hand-placed dune (foreground) */
const BigDune: React.FC<{lx: number; sx: number; sy: number; rx: number; by: number; shade: string; lit: string; bend?: number; ext?: number}> = ({lx, sx, sy, rx, by, shade, lit, bend = 0.35, ext = 900}) => {
	const fog = useFog(), m = moundD(lx, sx, sy, rx, by, 1, bend, ext), id = `bd${Math.round(sx)}`;
	return <g><defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={sy} x2="0" y2={Math.min(by, sy + 400)}><stop offset="0" stopColor={fog(mix(lit, '#fff0c0', 0.35))} /><stop offset="1" stopColor={fog(mix(lit, shade, 0.35))} /></linearGradient></defs>
		<path d={m.body} fill={fog(shade)} /><path d={m.lit} fill={`url(#${id})`} /><path d={m.crest} fill={fog('#ffe2a6')} opacity={0.8} /></g>; };

/** wind ripples on lit sand (ground decals): thin dark crescents, denser and finer toward the horizon */
const Ripples: React.FC<{n: number; seed: number; y0: number; y1: number; x0?: number; x1?: number; c: string; o?: number}> = ({n, seed, y0, y1, x0 = -300, x1 = W + 300, c, o = 0.35}) => {
	const g = useGround(GB.hz, GB.K), out: string[] = [];
	for (let i = 0; i < n; i++) { const u = Math.pow(rnd(i, seed), 1.4), y = lerp(y0, y1, u), x = lerp(x0, x1, rnd(i, seed + 1)), d = y - GB.hz, L = d * (0.8 + rnd(i, seed + 2) * 1.6), th = d * 0.02;
		out.push(spline(([[x - L / 2, y], [x, y - th], [x + L / 2, y + th * 0.3], [x, y + th * 0.4]] as P[]).map(g), true)); }
	return <Shape d={out.join(' ')} fill={c} o={o} />; };

/** a walking camel with its long shadow (to the left, on the lit sand) */
const Camel: React.FC<{x: number; y: number; h: number; phase: number; pack?: boolean; rim: string}> = ({x, y, h, phase, pack = true, rim}) => {
	const c = camelD(x, y, h, phase, pack), dark = '#130c12';
	const sk = 3.4, k = 0.26, m = `matrix(1,0,${sk},${-k},${f1(-sk * y)},${f1((1 + k) * y)})`;
	return <g>
		<g transform={m} opacity={0.75}><Shape d={c.far + ' ' + c.body + ' ' + c.pack} fill="#4a1d38" /></g>
		<Shape d={c.far} fill="#0b070b" />
		<g transform="translate(2.4,-1.4)"><Shape d={c.body + ' ' + c.pack} fill={rim} o={0.85} /></g>
		<Shape d={c.body} fill={dark} /><Shape d={c.pack} fill="#2a1a1c" />
	</g>; };

/** small saxaul bushes on the plain, each with a long shadow to the left (ground decal-like skew) */
const Bushes: React.FC<{items: [number, number, number][]}> = ({items}) => { const fog = useFog();
	return <g>{items.map(([x, y, s], i) => { const br = bareTreeD(x, y, 46 * s, 30 + i, {w: 5 * s, spread: 50, depth: 3, droop: 8}).join(' '), m = `matrix(1,0,3.4,-0.26,${f1(-3.4 * y)},${f1(1.26 * y)})`;
		return <g key={i}><g transform={m} opacity={0.6}><Shape d={br} fill={fog('#4a1d38')} /></g><Shape d={br} fill={fog('#1c0f16')} />
			<path d={`M${f1(x - 16 * s)},${f1(y + 1)} Q${f1(x)},${f1(y - 7 * s)} ${f1(x + 16 * s)},${f1(y + 1)} Z`} fill={fog('#2a1420')} /></g>; })}</g>; };

/** saxaul twigs and dry grass in the corner (foreground, out of focus) */
const Saxaul: React.FC<{t: number}> = ({t}) => {
	const br = bareTreeD(1960, 1180, 420, 5, {w: 22, spread: 40, depth: 4, droop: -6, lean: -34}).concat(bareTreeD(1840, 1230, 300, 9, {w: 16, spread: 44, depth: 3, lean: 10}));
	return <g transform={`rotate(${(Math.sin(t * 0.8) * 0.8).toFixed(2)} 1800 1180)`}><Shape d={br.join(' ')} fill="#1a0e14" />
		<path d={tuftD(120, 1120, 30, 220, 300, 3, 10) + ' ' + tuftD(380, 1150, 18, 160, 200, 7, 14)} fill="#24121a" /></g>; };

export const Gobi: React.FC<SetProps> = ({t, cam}) => {
	const D = GB.focus, y = ggY(D), ph = t / 1.4, h = 160;
	return <Stage t={t} cam={cam} atm={{haze: '#ec9a62', density: 0.032, focus: D, aperture: 1.8, rim: '#ffcf7a', lightDir: 12, grain: 0.06, vignette: 0.55, pp: [GB.sun[0], GB.hz]}} bg="#2a1630">
		<Layer D={INF}><GobiSky t={t} /></Layer>
		<Layer D={45}><FPath d={ridge(-400, W + 400, (x) => -(GB.hz - 26 - Math.abs(fbm(x, 420, 60, 3, 4, 0.55)) - (x < 1100 ? 18 : 0)), GB.hz + 8, 10)} c="#5e2c55" /></Layer>
		<Layer D={22}><Dunes y={ggY(22) + 6} amp={30} wl={300} seed={5} shade="#80384f" lit="#f4a25c" /></Layer>
		<Layer D={13}><Dunes y={ggY(13) + 10} amp={56} wl={460} seed={9} shade="#6a2c47" lit="#f39a52" /><FogFoot y0={ggY(13) - 70} y1={ggY(13) + 10} o={0.35} c="#ffcf8f" /></Layer>
		{/* the lit saddle the caravan crosses, with ripples and their long shadows */}
		<Layer D={INF}>
			<defs><linearGradient id="gsad" gradientUnits="userSpaceOnUse" x1="0" y1={ggY(11)} x2="0" y2={ggY(4)}><stop offset="0" stopColor="#ffc982" /><stop offset="0.5" stopColor="#f0a35f" /><stop offset="1" stopColor="#c87452" /></linearGradient></defs>
			<path d={`M-400,${f1(ggY(11))} L${W + 400},${f1(ggY(11))} L${W + 400},${H + 200} L-400,${H + 200} Z`} fill="url(#gsad)" />
			<Glow x={GB.sun[0] - 200} y={ggY(7)} r={900} ry={60} c="#fff0c0" o={0.55} />
			<Ripples n={260} seed={4} y0={ggY(11) + 4} y1={ggY(3.5)} c="#a2513e" o={0.38} />
		</Layer>
		{[[640, 0.0, true], [460, 0.31, true], [290, 0.62, false]].map(([cx, po, pk], i) =>
			<Layer key={i} D={D + 0.15 * (i + 1)}><Camel x={cx as number} y={y + 1} h={h * 1.2} phase={ph * 0.8 + (po as number)} pack={pk as boolean} rim="#ffcf7a" /></Layer>)}
		<FigureSlot x={860} y={y} h={h} attire="americas" action="lead" phase={ph} facing={1} shadow={{k: 0.26, skew: 3.4, o: 0.75, c: '#4a1d38', blur: 0.8}} backlit />
		<Layer D={6}><path d={`M${f1(860 + 0.05 * h)},${f1(y - 0.52 * h)} Q${f1(780)},${f1(y - 0.2 * h)} ${f1(640 + 0.85 * h * 1.2)},${f1(y - 0.86 * h * 1.2)}`} fill="none" stroke="#1a0f14" strokeWidth={1.8} /></Layer>
		<Particles kind="dust" n={60} seed={41} D={[2, 12]} box={[700, 300, 1900, 800]} c="#ffe2a8" o={0.8} size={1} />
		<Particles kind="sand" n={90} seed={42} D={[1.6, 7]} box={[-100, 620, W + 100, 1080]} c="#ffd79a" o={0.45} wind={-300} />
		<Layer D={7.5}><Bushes items={[[1110, ggY(7.5) + 2, 0.8], [1700, ggY(7.5) + 4, 0.75]]} /></Layer>
		<Layer D={5}><Bushes items={[[150, ggY(5) + 10, 1.1]]} /></Layer>
		<Layer D={4.6}><BigDune lx={900} sx={1290} sy={ggY(4.6) - 90} rx={2100} by={ggY(4.6) + 4} shade="#5a2440" lit="#f6ab62" bend={0.28} ext={4} /></Layer>
		<Layer D={3.2}><BigDune lx={-800} sx={60} sy={ggY(3.2) + 40} rx={1050} by={ggY(3.2) + 300} shade="#4a1d36" lit="#e98b4c" bend={0.5} /></Layer>
		<Layer D={2.1}><BigDune lx={900} sx={1640} sy={ggY(2.1) + 30} rx={2700} by={ggY(2.1) + 260} shade="#3d1730" lit="#d98048" bend={0.4} /><Ripples n={40} seed={9} y0={ggY(2.1) + 70} y1={1080} x0={1500} x1={2300} c="#7a3438" o={0.3} /></Layer>
		<Layer D={0.6} blur={9}><Saxaul t={t} /></Layer>
	</Stage>;
};

/* ===================================================== 5 · CASPIAN SEA AT DAWN =====================================================
   2024. Open water to the horizon, the sun just clearing it; its glitter path runs straight down the frame and Karl swims in it —
   a dark head and one arm against the gold. Swell lines in perspective, low sea-mist, the support boat waiting off to the right,
   a big swell rising across the foreground. */
const CS = {focus: 3, hz: 505, K: 555, sun: [1080, 488] as P};
const cgY = (D: number) => CS.hz + CS.K / D;

const SeaSky: React.FC<{t: number}> = ({t}) => <>
	<SkyGrad y0={0} y1={H} stops={[[0, '#232c48'], [0.18, '#414b6c'], [0.33, '#7d7896'], [0.41, '#c9a1a0'], [0.452, '#f3c9a2'], [0.4676, '#ffe2b4'], [1, '#ffe2b4']]} />
	<CloudBands id="ccb" t={t} top="#36385e" mid="#7b6f8e" under="#c79a9e" warm="#ffcf9a" warmFrom={3} drift={3}
		bands={[[90, 30, 31, 0.35], [190, 36, 35, 0.5], [300, 24, 39, 0.55], [380, 14, 43, 0.6], [438, 9, 47, 0.7], [470, 5, 51, 0.75]]} />
	<Sun x={CS.sun[0]} y={CS.sun[1]} r={30} c="#ffcf8e" core="#fff6e2" bloom={10} bloomO={0.85} />
</>;

/** the sea: base gradient (sky reflected), swell lines and the sun's glitter path, all ground decals (true parallax) */
const Sea: React.FC<{t: number}> = ({t}) => {
	const g = useGround(CS.hz, CS.K), hi: string[] = [], lo: string[] = [], gl: string[] = [];
	for (let i = 0; i < 260; i++) { const u = Math.pow(rnd(i, 3), 1.9), y = lerp(CS.hz + 2, 1120, u), d = y - CS.hz, x = -300 + ((rnd(i, 4) * (W + 600) + t * 8 * (0.4 + u)) % (W + 600)), L = d * (1.5 + rnd(i, 5) * 3), th = Math.max(0.6, d * 0.022);
		hi.push(spline(([[x - L / 2, y], [x, y - th], [x + L / 2, y], [x, y - th * 0.35]] as P[]).map(g), true));
		lo.push(spline(([[x - L * 0.45, y + th * 0.3], [x, y + th * 1.4], [x + L * 0.5, y + th * 0.3], [x, y + th * 0.6]] as P[]).map(g), true)); }
	for (let i = 0; i < 900; i++) { const u = Math.pow(rnd(i, 11), 1.35), y = lerp(CS.hz + 1, 1100, u), d = y - CS.hz, spread = 20 + d * 0.42, x = CS.sun[0] + (rnd(i, 12) + rnd(i, 13) + rnd(i, 15) - 1.5) * spread * 1.5, tw = Math.pow(Math.max(0, Math.sin(t * (2 + rnd(i, 14) * 3) + i)), 2), L = (5 + d * 0.1) * (0.4 + tw), th = Math.max(0.6, d * 0.007);
		if (tw < 0.05) continue; gl.push(spline(([[x - L, y], [x, y - th], [x + L, y], [x, y + th]] as P[]).map(g), true)); }
	return <g>
		<defs><linearGradient id="csea" gradientUnits="userSpaceOnUse" x1="0" y1={CS.hz} x2="0" y2={H}><stop offset="0" stopColor="#f1cfb2" /><stop offset="0.07" stopColor="#c7a3a6" /><stop offset="0.28" stopColor="#77738f" /><stop offset="0.6" stopColor="#3a4364" /><stop offset="1" stopColor="#1a2139" /></linearGradient>
			<linearGradient id="cpath" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffd9a0" stopOpacity="0" /><stop offset="0.5" stopColor="#ffd9a0" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></linearGradient></defs>
		<rect x={-400} y={CS.hz} width={W + 800} height={H} fill="url(#csea)" />
		<Glow x={CS.sun[0]} y={CS.hz + 150} r={190} ry={170} c="#ffdcaa" o={0.45} falloff={[[0, 1], [0.5, 0.5], [1, 0]]} />
		<Glow x={CS.sun[0]} y={CS.hz + 420} r={420} ry={360} c="#ffd6a0" o={0.3} falloff={[[0, 1], [0.5, 0.45], [1, 0]]} />
		<Shape d={lo.join(' ')} fill="#232b48" o={0.5} />
		<Shape d={hi.join(' ')} fill="#e9c2b0" o={0.4} />
		<Shape d={gl.join(' ')} fill="#fff0c6" o={0.95} />
		<Glow x={CS.sun[0]} y={CS.hz + 6} r={300} ry={14} c="#fff3d6" o={0.9} />
	</g>; };

/** the support boat: a small trawler-like hull, wheelhouse, mast, a lit window; its reflection */
const Boat: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => {
	const fog = useFog(), c = fog('#1d2033'), bob = Math.sin(t * 1.1) * 1.5 * s, roll = Math.sin(t * 0.9) * 1.2;
	const hull = `M${-130 * s},${-18 * s} L${120 * s},${-22 * s} Q${150 * s},${-22 * s} ${142 * s},${-10 * s} L${118 * s},${4 * s} L${-118 * s},${4 * s} Z`;
	const cab = `M${-70 * s},${-18 * s} L${-70 * s},${-52 * s} L${-10 * s},${-56 * s} L${5 * s},${-20 * s} Z M${-50 * s},${-56 * s} L${-50 * s},${-110 * s} L${-46 * s},${-110 * s} L${-46 * s},${-56 * s} Z M${-50 * s},${-90 * s} L${-20 * s},${-70 * s} L${-22 * s},${-67 * s} L${-50 * s},${-84 * s} Z M${60 * s},${-22 * s} L${62 * s},${-62 * s} L${65 * s},${-62 * s} L${66 * s},${-22 * s} Z`;
	return <g transform={`translate(${f1(x)},${f1(y + bob)}) rotate(${roll.toFixed(2)})`}>
		<g transform="scale(1,-0.6)" opacity={0.35}><path d={hull + ' ' + cab} fill={c} /></g>
		<path d={hull} fill={c} /><Shape d={cab} fill={c} />
		<rect x={-62 * s} y={-46 * s} width={16 * s} height={10 * s} fill="#ffc46a" opacity={0.9} />
		<Glow x={-47 * s} y={-108 * s} r={14 * s} c="#ffd28a" o={0.8} /><circle cx={-48 * s} cy={-108 * s} r={2.2 * s} fill="#fff1d0" />
	</g>; };

/** a big swell rising across the foreground: dark body, a lit lip, foam */
const NearSwell: React.FC<{t: number}> = ({t}) => {
	const lip = Array.from({length: 26}, (_, i) => { const x = -300 + i * (W + 600) / 25; return [x, 930 + Math.sin(x / 260 + t * 0.8) * 26 + Math.sin(x / 90 + t * 1.6) * 7] as P; });
	const body = spline([...lip, [W + 300, H + 300], [-300, H + 300]], true);
	const hi = spline([...lip, ...lip.slice().reverse().map(([x, y]) => [x, y + 10 + Math.sin(x / 50) * 3] as P)], true);
	return <g><defs><linearGradient id="nsw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4566" /><stop offset="0.4" stopColor="#1d2540" /><stop offset="1" stopColor="#111729" /></linearGradient></defs>
		<path d={body} fill="url(#nsw)" /><path d={hi} fill="#d8b4a6" opacity={0.55} />
		{Array.from({length: 40}, (_, i) => { const x = 760 + (rnd(i, 61) + rnd(i, 62) - 1) * 520, k = Math.round(((x + 300) / (W + 600)) * 25), p = lip[Math.max(0, Math.min(25, k))], tw = Math.pow(Math.max(0, Math.sin(t * 3 + i * 1.7)), 2);
			return <ellipse key={i} cx={x} cy={p[1] + 6 + rnd(i, 63) * 26} rx={6 + tw * 14} ry={1.6 + tw} fill="#ffe2b0" opacity={0.25 + tw * 0.6} />; })}</g>; };

/** the swimmer's wake: a V of foam lines spreading behind him, a churn at the kick */
const Wake: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => {
	const lines = [-1, 1].map((sd) => taper(Array.from({length: 8}, (_, i) => [x - 20 * s - i * 34 * s, y + sd * (2 + i * 3.4) * s * 0.35 + Math.sin(t * 3 + i) * s * 0.6] as P), 3.2 * s, 0.4)).join(' ');
	const churn = Array.from({length: 6}, (_, i) => `M${f1(x - 30 * s - i * 9 * s)},${f1(y + (rnd(i, 3) - 0.5) * 4 * s)} m-${f1(6 * s)},0 a${f1(6 * s)},${f1(1.8 * s)} 0 1,0 ${f1(12 * s)},0 a${f1(6 * s)},${f1(1.8 * s)} 0 1,0 -${f1(12 * s)},0 Z`).join(' ');
	return <g><Shape d={lines} fill="#ffe6c4" o={0.55} /><path d={churn} fill="#fff1dc" opacity={0.7} /></g>; };

/** gulls far off: tiny m-shapes, flapping */
const Gulls: React.FC<{t: number}> = ({t}) => <g fill="none" stroke="#3a3550" strokeWidth={1.6} strokeLinecap="round">{[[1380, 330, 1], [1420, 352, 0.8], [1340, 360, 0.7]].map(([x, y, s], i) => { const f = Math.sin(t * 5 + i * 2) * 4 * s, xx = x + t * 14;
	return <path key={i} d={`M${f1(xx - 9 * s)},${f1(y - f)} Q${f1(xx - 4 * s)},${f1(y - 5 * s - f * 0.5)} ${f1(xx)},${f1(y)} Q${f1(xx + 4 * s)},${f1(y - 5 * s - f * 0.5)} ${f1(xx + 9 * s)},${f1(y - f)}`} />; })}</g>;

export const Caspian: React.FC<SetProps> = ({t, cam}) => {
	const D = CS.focus, ph = t / 1.6;
	return <Stage t={t} cam={cam} atm={{haze: '#e8c9b8', density: 0.03, focus: D, aperture: 1.8, rim: '#ffd59a', lightDir: 70, grain: 0.055, vignette: 0.55, pp: [CS.sun[0], CS.hz]}} bg="#1a2139">
		<Layer D={INF}><SeaSky t={t} /><Gulls t={t} /></Layer>
		<Layer D={INF}><Sea t={t} /></Layer>
		<Layer D={60}><FPath d={'M250,505 L250,470 L262,470 L262,505 Z M300,505 L300,470 L312,470 L312,505 Z M232,470 L352,470 L352,458 L232,458 Z M262,458 L268,420 L274,420 L280,458 Z M320,458 L322,396 L328,396 L336,458 Z M240,458 L240,446 L270,446 L270,458 Z'} c="#3a3a52" extra={-0.25} /><Glow x={325} y={398} r={10} c="#ffb870" o={0.8} /></Layer>
		<Layer D={16}><Boat x={1520} y={cgY(16)} s={0.95} t={t} /></Layer>
		<Layer D={9}><Mist n={8} seed={6} y0={CS.hz + 6} y1={CS.hz + 40} t={t} speed={7} o={0.45} c="#f5dcc8" w={[400, 1100]} h={[16, 40]} /></Layer>
		<Layer D={D}><Wake x={1030} y={cgY(D)} s={3} t={t} /></Layer>
		<FigureSlot x={1030} y={cgY(D)} h={330} attire="swim" action="swim" phase={0.08 + ph * 0} facing={1} rimO={0.95} />
		<Particles kind="spray" n={50} seed={51} D={[D * 0.95, D * 1.05]} box={[1060, cgY(D) - 40, 1160, cgY(D)]} c="#fff0d8" o={0.95} size={1.3} />
		<Layer D={2}><Mist n={5} seed={9} y0={cgY(2) - 30} y1={cgY(2) + 30} t={t} speed={10} o={0.25} c="#f2d7c6" w={[700, 1500]} h={[40, 90]} /></Layer>
		<Layer D={1.1} blur={6}><NearSwell t={t} /></Layer>
	</Stage>;
};
