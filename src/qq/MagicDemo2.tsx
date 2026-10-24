import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

/* 魔法阵 · spectacle demo (10 s on the 七情 track grid): a summoning circle drawn on the floor layer by layer, the
   track's own dip before the first kick is the held breath, and on the 6.14 s kick the circle lifts, splits into a
   stack of glowing layers along a pillar of light and turns to face the camera. No lesson, all spectacle. */
const W = 1920, H = 1080, FPS = 30;
const BEAT = 0.5069, PH = 0.06, HIT = 6.133;
const SERIF = '"Noto Serif CJK SC", serif', SYM = '"DejaVu Sans", sans-serif';
const GOLD = '#f2cf7a', CYAN = '#8fe8ff', VIOLET = '#b48cff';
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const out3 = (u: number) => 1 - Math.pow(1 - cl01(u), 3);
const inOut = (u: number) => { const v = cl01(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const poly = (n: number, r: number, rot = -90, step = 1) => Array.from({length: n}, (_, i) => { const a = (rot + (i * step * 360) / n) * Math.PI / 180; return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ') + ' Z';
const circ = (r: number) => `M${r},0 A${r},${r} 0 1,1 ${-r},0 A${r},${r} 0 1,1 ${r},0`;
const beatAt = (k: number) => PH + k * BEAT;

/** a procedural rune: 2–4 strokes in a 20×28 box */
const rune = (i: number) => { const n = 2 + Math.floor(rnd(i, 1) * 3), pts = (j: number) => `${(rnd(i * 9 + j, 2) * 20 - 10).toFixed(1)},${(rnd(i * 9 + j, 3) * 28 - 14).toFixed(1)}`; let d = `M0,-14 L0,14`; for (let k = 0; k < n; k++) d += ` M${pts(k * 2)} L${pts(k * 2 + 1)}`; return d; };

const Draw: React.FC<{d: string; u: number; w?: number; col?: string; L?: number; glow?: number; dash?: string}> = ({d, u, w = 2.5, col = GOLD, L = 4000, glow = 1, dash}) => u <= 0 ? null : <g>
	{glow > 0 && <path d={d} fill="none" stroke={col} strokeWidth={w * 5} opacity={0.28 * glow} filter="url(#gM)" strokeDasharray={dash ?? L} strokeDashoffset={dash ? 0 : L * (1 - out3(u))} />}
	<path d={d} fill="none" stroke={col} strokeWidth={w} strokeDasharray={dash ?? L} strokeDashoffset={dash ? 0 : L * (1 - out3(u))} opacity={dash ? out3(u) : 1} strokeLinejoin="round" />
</g>;

/** one complete circle; `k(n)` says how far layer n has been drawn (0..1); `T` drives the turning */
const Sigil: React.FC<{T: number; k: (n: number) => number; pulse: number; id: string; tint?: number}> = ({T, k, pulse, id, tint = 0}) => {
	const g = tint ? CYAN : GOLD;
	return <g>
		<circle r={500} fill={GOLD} opacity={0.05 * k(0)} filter="url(#gL)" />
		<Draw d={circ(480)} u={k(0)} w={3.2} col={g} />
		<Draw d={circ(452)} u={k(0.5)} w={1.4} col={g} />
		{/* the outer script ring, turning */}
		{k(1) > 0 && <g transform={`rotate(${T * 9})`} opacity={k(1)}>
			<path id={`ring${id}`} d={circ(462)} fill="none" />
			<text style={{fontFamily: SERIF, fontWeight: 700, fontSize: 21, letterSpacing: '0.42em'}} fill={g}><textPath href={`#ring${id}`}>ARCANUM · IGNIS · AQUA · TERRA · AER · LUX · UMBRA · SOL · LUNA · STELLA · ARCANUM · IGNIS · AQUA · TERRA ·</textPath></text>
		</g>}
		{k(1.5) > 0 && <g transform={`rotate(${-T * 14})`}>{Array.from({length: 120}, (_, i) => <line key={i} transform={`rotate(${i * 3})`} x1={0} y1={-430} x2={0} y2={i % 10 === 0 ? -414 : -424} stroke={g} strokeWidth={1.3} opacity={cl01(k(1.5) * 120 - i)} />)}</g>}
		{/* hexagram */}
		<Draw d={poly(3, 420, -90)} u={k(2)} w={2.4} col={g} />
		<Draw d={poly(3, 420, 90)} u={k(2.3)} w={2.4} col={g} />
		{/* rune ring, counter-turning */}
		{k(3) > 0 && <g transform={`rotate(${-T * 20})`}>{Array.from({length: 36}, (_, i) => <g key={i} transform={`rotate(${i * 10}) translate(0,-330)`} opacity={cl01(k(3) * 36 - i)}><path d={rune(i)} stroke={VIOLET} strokeWidth={2.2} fill="none" strokeLinecap="round" /></g>)}</g>}
		<Draw d={circ(355)} u={k(3)} w={1.6} col={VIOLET} />
		<Draw d={circ(305)} u={k(3.2)} w={1.6} col={VIOLET} />
		{/* heptagram + seven satellite circles that turn on their own */}
		<Draw d={poly(7, 290, -90, 3)} u={k(4)} w={2} col={CYAN} />
		{k(4.5) > 0 && <g transform={`rotate(${T * 6})`}>{Array.from({length: 7}, (_, i) => { const a = (-90 + i * 360 / 7) * Math.PI / 180, u = cl01(k(4.5) * 7 - i); return u <= 0 ? null : <g key={i} transform={`translate(${Math.cos(a) * 395},${Math.sin(a) * 395}) rotate(${-T * 40 + i * 20})`}>
			<Draw d={circ(38)} u={u} w={1.8} col={g} glow={0.6} /><Draw d={poly(5, 34, -90, 2)} u={u} w={1.4} col={g} glow={0.4} /><circle r={5} fill="#fff" opacity={u} />
		</g>; })}</g>}
		{/* inner core: square-in-circle, pentagram, eye */}
		<Draw d={poly(4, 200, -45)} u={k(5)} w={2} col={g} />
		<Draw d={poly(4, 200, 0)} u={k(5.2)} w={2} col={g} />
		<Draw d={poly(5, 140, -90, 2)} u={k(5.5)} w={2.4} col={VIOLET} />
		<Draw d={circ(140)} u={k(5.5)} w={1.6} col={VIOLET} />
		<Draw d={circ(60)} u={k(6)} w={2.4} col={g} />
		{k(6.5) > 0 && <><circle r={180 * (1 + 0.15 * pulse)} fill="url(#core)" opacity={k(6.5)} /><circle r={10 + 6 * pulse} fill="#fff" opacity={k(6.5)} /></>}
	</g>;
};

export const MagicDemo2: React.FC = () => {
	const f = useCurrentFrame(), T = f / FPS;
	// the build: one layer per beat from beat 1, accelerating to half beats in bar 2; the dip 5.64–6.13 holds
	const sched = [beatAt(1), beatAt(2), beatAt(3), beatAt(4), beatAt(5), beatAt(5.5), beatAt(6), beatAt(6.5), beatAt(7), beatAt(7.5), beatAt(8), beatAt(8.5), beatAt(9), beatAt(9.5), beatAt(10)];
	const prog = (n: number) => { const i = Math.floor(n * 2), at = sched[Math.min(sched.length - 1, i)] + (n * 2 - i) * BEAT * 0.5; return cl01((T - at) / 0.45); };
	const bp = ((((T - PH) % BEAT) + BEAT) % BEAT) / BEAT, kick = T < 5.6 || T > HIT ? Math.max(0, 1 - bp / 0.18) : 0;
	const hit = T - HIT, on = hit >= 0, lift = on ? out3(hit / 1.4) : 0;
	const hold = T >= 5.64 && !on ? cl01((T - 5.64) / (HIT - 5.64)) : 0;          // the held breath: the circle sinks and dims a touch
	// camera: the circle lies on the floor (squashed), then lifts and turns toward us
	const tilt = 0.36, cy = (on ? lerp(760, 820, out3(hit / 1.6)) : lerp(600, 700, inOut(T / HIT))) + 14 * hold;
	const zoom = (on ? lerp(1.18, 1.05, out3(hit / 1.6)) : lerp(1.0, 1.25, inOut(T / HIT)) * (1 - 0.04 * hold)) * (1 + 0.02 * kick);
	const shake = on && hit < 0.2 ? 14 * (1 - hit / 0.2) * Math.sin(hit * 110) : 0;
	const layers = on ? 5 : 1;
	const turnAll = on ? hit * 8 : 0;                                                           // the stack splits on the hit
	return <AbsoluteFill style={{background: '#030205'}}>
		<svg width={W} height={H}>
			<defs>
				<filter id="gM" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
				<filter id="gL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
				<radialGradient id="bg" cx="0.5" cy="0.62" r="0.8"><stop offset="0" stopColor="#1e1638" /><stop offset="0.55" stopColor="#09070f" /><stop offset="1" stopColor="#020104" /></radialGradient>
				<radialGradient id="core"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.25" stopColor={GOLD} stopOpacity="0.8" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
				<linearGradient id="pillar" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={GOLD} stopOpacity="0.9" /><stop offset="0.5" stopColor={CYAN} stopOpacity="0.35" /><stop offset="1" stopColor={CYAN} stopOpacity="0" /></linearGradient>
			</defs>
			<rect width={W} height={H} fill="url(#bg)" />
			{Array.from({length: 90}, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i, 1) * H} r={0.6 + 1.6 * rnd(i, 2)} fill="#eef" opacity={(0.15 + 0.4 * rnd(i, 3)) * (0.6 + 0.4 * Math.sin(T * 2 + i))} />)}
			<g transform={`translate(${W / 2 + shake},${cy + shake * 0.5})`}>
				{/* pillar of light */}
				{on && <g opacity={0.6 * lift}><linearGradient id="pillarX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={GOLD} stopOpacity="0" /><stop offset="0.5" stopColor="#fff2c8" stopOpacity="0.9" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></linearGradient>
					<mask id="pillarM" maskUnits="userSpaceOnUse" x={-600} y={-1500} width={1200} height={1600}><rect x={-600} y={-1500} width={1200} height={1600} fill="url(#pillarV)" /></mask>
					<linearGradient id="pillarV" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff" /><stop offset="0.7" stopColor="#fff" stopOpacity="0.35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
					<rect x={-300 * lift} y={-1500} width={600 * lift} height={1500} fill="url(#pillarX)" mask="url(#pillarM)" /></g>}
				{/* the stack: on the hit copies of the circle rise up the pillar, smaller and fainter */}
				{Array.from({length: layers}, (_, j) => j).reverse().map((j) => { const rise = on ? -190 * j * lift : 0, sc = on ? 1 - 0.15 * j * lift : 1, op = j === 0 ? 1 : (0.8 - 0.12 * j) * lift;
					const turn = turnAll * (j % 2 ? -1.6 : 1) + j * 9;
					return <g key={j} transform={`translate(0,${rise}) scale(${zoom * sc},${zoom * sc * tilt}) rotate(${turn})`} opacity={op}>
						<Sigil T={T + j * 3} k={j === 0 ? prog : () => 1} pulse={kick} id={`s${j}`} tint={j % 2} />
					</g>; })}
				{/* shockwaves on the hit and on kicks after it */}
				{on && [0, 1, 2].map((r) => { const u = cl01((hit - r * 0.12) / 0.9); return u > 0 && u < 1 ? <ellipse key={r} rx={(500 + 900 * out3(u)) * zoom} ry={(500 + 900 * out3(u)) * zoom * tilt} fill="none" stroke={r === 1 ? CYAN : GOLD} strokeWidth={8 * (1 - u)} opacity={1 - u} /> : null; })}
				{/* sparks rising from the circle */}
				{Array.from({length: on ? 140 : 40}, (_, i) => { const life = 2.2, ph = ((T * (0.5 + rnd(i, 4) * 0.6) + rnd(i, 5)) % 1), a = rnd(i, 6) * Math.PI * 2, rr = 120 + 360 * rnd(i, 7);
					return <circle key={i} cx={Math.cos(a) * rr * zoom} cy={Math.sin(a) * rr * zoom * tilt - ph * (on ? 900 : 300)} r={1 + 2.4 * rnd(i, 8)} fill={i % 3 ? GOLD : CYAN} opacity={Math.sin(Math.PI * ph) * (on ? 1 : 0.5) * cl01(T / 1.5)} />; })}
			</g>
			{/* bloom on the hit: a gold glow from the centre, never a white frame */}
			{on && hit < 0.6 && <ellipse cx={W / 2} cy={cy} rx={800} ry={300} fill={GOLD} opacity={0.18 * (1 - hit / 0.6)} filter="url(#gL)" />}
			{on && <text x={W / 2} y={140} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 96, letterSpacing: '0.4em'}} fill={GOLD} opacity={cl01((hit - 1.4) / 0.6)}>魔法阵</text>}
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="MAGIC2" component={MagicDemo2} durationInFrames={300} fps={FPS} width={W} height={H} />);
