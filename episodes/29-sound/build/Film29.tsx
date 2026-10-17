import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Sequence} from 'remotion';
import {JUNO} from '../brand/identity';
import {EndCard} from '../brand/Brand';
import TM from './timing29.json';
import lines from './lines29.json';
import live from './live29.json';
import spectra from './spectra29.json';
import TT from './title29.json';

/* ep29 《为什么好听？》 — look "空气粒子场": deep navy space full of glowing air particles; every principle is
   particles moving. Cyan = left ear / low, magenta = right ear / high, gold = the answer.
   Everything that reacts to the sound (spectrum bars, which ear glows, the kick pulse) is driven by live29.json,
   a per-frame analysis of the finished soundtrack, so what you see is what you hear. */
const FPS = 30, W = 1920, H = 1080;
const T = TM as any;
const END = T.end[0] as number, OUTRO = 152.16;
const BEAT = 0.510839, BAR = 4 * BEAT;
const OB = (k: number) => T.bars[String(k)] as number;
const g = (k: string, i = 0) => T[k][i] as number;
const DROP = g('drop');
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';
const C = {cyan: '#5ce1e6', mag: '#ff5fa2', gold: '#f1c56d', ink: '#eaf2ff', dim: 'rgba(234,242,255,0.6)', blue: '#9fc6ff', red: '#ff7a59'};

const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const sm = (x: number) => x * x * (3 - 2 * x);
const r = (t: number, a: number, b: number) => sm(lin(t, a, b));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const cosr = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * cl(u));
const win = (t: number, a: number, b: number, fi = 0.4, fo = 0.4) => (fi <= 0 ? (t >= a ? 1 : 0) : r(t, a, a + fi)) * (1 - r(t, b - fo, b));
const BARS = Object.keys(T.bars).map(Number).sort((a, b) => a - b).map((k) => T.bars[String(k)] as number);
const beatPh = (t: number, div = 1) => {
	let k = 0; while (k < BARS.length - 2 && BARS[k + 1] <= t) k++;
	const bl = (BARS[k + 1] - BARS[k]) / 4 / div;
	return ((((t - BARS[k]) / bl) % 1) + 1) % 1;
};
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerpC = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], k))).join(',')})`; };

// ------------------------------------------------------------------ live data from the soundtrack
const LV = live as {spec: number[][]; L: number[]; R: number[]; low: number[]};
const fi = (t: number) => cl(Math.round(t * FPS), 0, LV.L.length - 1);
const earLv = (db: number) => cl((db + 44) / 30);
const lowAt = (t: number) => LV.low[fi(t)];

// ------------------------------------------------------------------ the sound's own motion (same formulas as process_v2.py)
const thBuild = (t: number) => { const [a, b] = T.rot_build; return 2 * Math.PI * 3 * Math.pow(lin(t, a, b), 1.7); };
const amBuild = (t: number) => { const [a, b] = T.rot_build; return cosr((t - a) / (BAR * 0.5)) * (1 - cosr((t - (b - 0.5 - 0.2)) / 0.2)); };
const thSlow = (t: number) => 2 * Math.PI * (t - g('rot_slow')) / (4 * BAR);
const thEnd = (t: number) => 2 * Math.PI * (t - g('rot_end')) / (2 * BAR);
const ageFc = (t: number) => { const [a, b, c] = T.age; const k = cosr((t - a) / (b - a)) * (1 - cosr((t - c + 0.25) / 0.25)); return Math.exp(Math.log(18000) + (Math.log(2500) - Math.log(18000)) * k); };
const openK = (t: number) => cosr((t - g('open')) / (g('open', 1) - g('open')));
// the film's own clock: it holds still in the 0.42 s of silence before the drop
const GAP = DROP - 0.42;
const te = (t: number) => t;   // owner: no freeze before the drop (it read as a stutter)

// ------------------------------------------------------------------ shared pieces
const Defs = () => (
	<defs>
		<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
		<filter id="glow2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
		<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
		<radialGradient id="vig"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
	</defs>
);
const Lab: React.FC<{x: number; y: number; t: string; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; w?: number; o?: number}> = ({x, y, t, s = 52, c = C.ink, a = 'middle', w = 800, o = 1}) => (
	o <= 0.001 ? null : <text x={x} y={y} textAnchor={a} opacity={o} style={{fontFamily: SANS, fontWeight: w, fontSize: s}} fill={c} stroke="rgba(4,6,14,0.72)" strokeWidth={s * 0.12} paintOrder="stroke">{t}</text>
);
/** labels that hand over to each other at fixed times: [start, end, text, colour?] */
const Labs: React.FC<{t: number; y: number; items: [number, number, string, string?][]; s?: number; x?: number}> = ({t, y, items, s = 52, x = 960}) => (
	<g>{items.map(([a, b, txt, c], i) => <Lab key={i} x={x} y={y} t={txt} s={s} c={c ?? C.ink} o={win(t, a, b, 0.25, 0.25)} />)}</g>
);
const wave = (x0: number, x1: number, y: number, amp: number, wl: number, env?: (x: number) => number, ph = 0, step = 4) => {
	let d = '';
	for (let x = x0; x <= x1; x += step) { const e = env ? env(x) : 1; d += `${x === x0 ? 'M' : 'L'} ${x.toFixed(1)} ${(y + Math.sin(((x - x0) / wl) * Math.PI * 2 - ph) * amp * e).toFixed(1)} `; }
	return d;
};
/** a head seen from above, nose up; ears glow 0..1 */
const Head: React.FC<{x: number; y: number; s?: number; l?: string; r?: string; lo?: number; ro?: number; core?: number}> = ({x, y, s = 1, l = C.cyan, r: rc = C.mag, lo = 0.9, ro = 0.9, core = 0}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<ellipse cx={0} cy={0} rx={92} ry={110} fill="#141a33" stroke="#9fb3d9" strokeWidth={3} opacity={0.96} />
		<path d="M -14 -106 L 0 -132 L 14 -106 Z" fill="#141a33" stroke="#9fb3d9" strokeWidth={3} />
		{core > 0 && <ellipse cx={0} cy={0} rx={70} ry={86} fill={C.gold} opacity={0.35 * core} filter="url(#soft)" />}
		<ellipse cx={-96} cy={0} rx={16 + 6 * lo} ry={30 + 8 * lo} fill={l} opacity={0.2 + 0.8 * lo} filter="url(#glow)" />
		<ellipse cx={96} cy={0} rx={16 + 6 * ro} ry={30 + 8 * ro} fill={rc} opacity={0.2 + 0.8 * ro} filter="url(#glow)" />
		<text x={-150} y={14} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}} fill={l}>L</text>
		<text x={150} y={14} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}} fill={rc}>R</text>
	</g>
);
const Phones: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = C.gold}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={c} strokeWidth={4} strokeLinecap="round">
		<path d="M -18 6 L -18 -2 A 18 18 0 0 1 18 -2 L 18 6" />
		<rect x={-24} y={2} width={10} height={16} rx={4} fill={c} />
		<rect x={14} y={2} width={10} height={16} rx={4} fill={c} />
	</g>
);
const Pill: React.FC<{t: string; o: number}> = ({t, o}) => {
	if (o <= 0.001) return null;
	const w = t.length * 44 + 150;
	return (
		<g opacity={o}>
			<rect x={960 - w / 2} y={72} width={w} height={76} rx={38} fill="rgba(8,12,28,0.72)" stroke={C.gold} strokeOpacity={0.75} strokeWidth={2.5} />
			<Phones x={960 - w / 2 + 62} y={108} s={1.3} />
			<text x={960 - w / 2 + 112} y={126} style={{fontFamily: SANS, fontWeight: 800, fontSize: 44}} fill={C.gold}>{t}</text>
		</g>
	);
};

// ------------------------------------------------------------------ the air (always there, drifting)
const AIR = (() => { const R = rng(7); return Array.from({length: 760}, () => ({x: R() * W, y: R() * H, r: 0.8 + R() * 2.2, o: 0.15 + 0.6 * R(), ph: R() * 6.28, v: 4 + R() * 10})); })();
const Air: React.FC<{t: number}> = ({t}) => {
	const e = te(t), lw = lowAt(t);
	// swirl with the 360° rotations, contract in the silence, blow outward on the drop
	const swirl = 0.12 * (t > g('rot_build') - 1 && t < DROP + 4 ? thBuild(Math.min(t, DROP)) : 0) + 0.08 * (t > g('rot_slow') ? thSlow(Math.min(t, g('rot_slow', 1))) : 0) + 0.08 * (t > g('rot_end') ? thEnd(t) : 0);
	const gapK = 0;
	const blow = t >= DROP ? sm(lin(t, DROP, DROP + 0.7)) * (1 - r(t, DROP + 1.2, DROP + 6)) : 0;
	const sc = (1 + 0.014 * lw) * (1 - 0.1 * gapK) * (1 + 0.45 * blow);
	return (
		<g>
			{AIR.map((p, i) => {
				let x = (((p.x + e * p.v + Math.sin(e * 0.3 + p.ph) * 18) % W) + W) % W, y = p.y + Math.cos(e * 0.25 + p.ph) * 14;
				const dx = x - 960, dy = y - 480, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx) + swirl * (420 / (d + 260));
				x = 960 + Math.cos(a) * d * sc; y = 480 + Math.sin(a) * d * sc;
				return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={p.r} fill={C.ink} opacity={p.o * 0.55} />;
			})}
		</g>
	);
};

// ------------------------------------------------------------------ spectrum (live)
const EDGES = (spectra as any).edges as number[];
const SX0 = 160, SX1 = 1760, SY = 720;
const fx = (f: number) => SX0 + ((Math.log(f) - Math.log(EDGES[0])) / (Math.log(EDGES[48]) - Math.log(EDGES[0]))) * (SX1 - SX0);
const Spectrum: React.FC<{t: number; cut?: number; cutO?: number; ghost?: number; fc?: number}> = ({t, cut, cutO = 1, ghost = 0, fc}) => {
	const data = LV.spec[fi(t)], normal = (spectra as any).normal as number[];
	const bw = (SX1 - SX0) / 48, norm = (db: number) => cl((db + 15) / 75);
	return (
		<g>
			{data.map((db, i) => {
				const f = Math.sqrt(EDGES[i] * EDGES[i + 1]), h = 380 * norm(db), hn = 380 * norm(normal[i]);
				const col = f < 250 ? C.cyan : f > 2500 ? C.mag : '#9fb3ff';
				return (
					<g key={i}>
						{ghost > 0 && f < 130 && <rect x={SX0 + i * bw + 3} y={SY - hn} width={bw - 6} height={hn} fill="none" stroke={C.cyan} strokeDasharray="6 6" strokeWidth={2.5} opacity={0.75 * ghost} />}
						<rect x={SX0 + i * bw + 3} y={SY - Math.max(h, 3)} width={bw - 6} height={Math.max(h, 3)} rx={3} fill={col} opacity={ghost > 0 && f < 130 ? 0.9 - 0.65 * ghost : 0.9} filter="url(#glow)" />
					</g>
				);
			})}
			<line x1={SX0} x2={SX1} y1={SY + 4} y2={SY + 4} stroke={C.dim} strokeWidth={2} />
			{[50, 100, 1000, 10000].map((f) => <text key={f} x={fx(f)} y={SY + 48} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={C.dim}>{f >= 1000 ? `${f / 1000}k` : f}</text>)}
			<text x={SX1} y={SY + 48} textAnchor="end" style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={C.dim}>Hz</text>
			{cut && cutO > 0 && <g opacity={cutO}><line x1={fx(cut)} x2={fx(cut)} y1={SY - 430} y2={SY + 10} stroke={C.gold} strokeWidth={4} strokeDasharray="14 10" /><Lab x={fx(cut)} y={SY - 450} t={`${cut} Hz`} s={52} c={C.gold} /></g>}
			{fc && <g>
				<rect x={fx(fc)} y={SY - 440} width={SX1 + 60 - fx(fc)} height={450} fill="#05070f" opacity={0.78} />
				<line x1={fx(fc)} x2={fx(fc)} y1={SY - 440} y2={SY + 10} stroke={C.gold} strokeWidth={4} />
				<Lab x={fx(fc) - 20} y={SY - 300} t={`${Math.round(fc / 100) * 100} Hz`} s={96} c={C.gold} a="end" w={900} /><Lab x={fx(fc) - 20} y={SY - 410} t="你还听得见吗？" s={52} c={C.gold} a="end" />
			</g>}
		</g>
	);
};

// ================================================================== scenes (each takes the film time t)
// 1 · the slowed song, sped up, slowed back (varispeed)
const SPD = (t: number) => (t < 8.4 ? 1 + 0.26 * cosr((t - 4.45) / 0.5) : 1 + 0.26 * (1 - cosr((t - 8.4) / 1.0)));
const PH = (() => { const a = [0]; for (let i = 1; i < 340; i++) a.push(a[i - 1] + (SPD(i / FPS) * 2 * Math.PI * 0.55) / FPS); return a; })();
const S1Wave: React.FC<{t: number}> = ({t}) => {
	const s = SPD(t), k = (s - 1) / 0.26, wl = 560 / Math.pow(s, 2.6);
	const env = (x: number) => Math.sin(((x - 80) / 1760) * Math.PI);
	const amp = 150 * (1 + 0.1 * lowAt(t));
	return (
		<g transform={`translate(960 470) scale(${mix(1, 0.12, sm(lin(t, 9.0, 9.6)))}) translate(-960 -470)`}>
			<path d={wave(80, 1840, 520, amp, wl, env, PH[cl(Math.round(t * FPS), 0, 339)])} fill="none" stroke={lerpC(C.cyan, C.gold, k)} strokeWidth={7} filter="url(#glow2)" />
			<Labs t={t} y={280} items={[[-1, 4.45, '慢放：每一次振动都被拉长', C.cyan], [4.5, 8.4, '调快 ×1.26 → 波变密 → 音变高', C.gold], [8.45, 9.25, '放回原速 → 波变稀 → 又变低', C.cyan]]} />
		</g>
	);
};
// 2 · ping-pong between the ears (the ear that glows is the ear that has the sound)
const Rings: React.FC<{t: number; div: number; x: number; y: number; s: number}> = ({t, div, x, y, s}) => {
	const ph = beatPh(t, div), out: React.ReactNode[] = [];
	for (let j = 0; j < 3; j++) {
		const p = ph + j, tb = t - p * (BEAT / div) + 0.12, side = LV.L[fi(tb)] > LV.R[fi(tb)] ? -1 : 1;
		out.push(<ellipse key={j} cx={x + side * 106 * s} cy={y} rx={(30 + 230 * p / div) * s} ry={(40 + 260 * p / div) * s} fill="none" stroke={side < 0 ? C.cyan : C.mag} strokeWidth={6 - j * 1.5} opacity={cl(1 - p / 3) * 0.85} filter="url(#glow)" />);
	}
	return <g>{out}</g>;
};
const S2Ping: React.FC<{t: number}> = ({t}) => {
	const i = fi(t);
	return (
		<g>
			<g transform={`translate(${mix(0, -680, sm(lin(t, 15.0, 15.8)))} 0) translate(960 470) scale(${mix(0.4, 1, sm(lin(t, 9.3, 9.9))) * mix(1, 0.5, sm(lin(t, 15.0, 15.8)))}) translate(-960 -470)`}>
				<Rings t={t} div={1} x={960} y={470} s={1.1} />
				<Head x={960} y={470} s={1.1} lo={earLv(LV.L[i])} ro={earLv(LV.R[i])} />
			</g>
			<Labs t={t} y={230} items={[[9.6, 12.6, '声音每拍换一只耳朵'], [12.6, 15.0, '每一圈，都是空气在振动', C.gold]]} />
		</g>
	);
};
// 3 · the speaker pushes the air: compressions leave the cone on every kick
const PUMP = (() => { const R = rng(31); return Array.from({length: 5200}, () => ({x: 370 + R() * 1600, y: 150 + R() * 760, r: 1 + R() * 2.2, o: R()})); })();
const S3Pump: React.FC<{t: number}> = ({t}) => {
	const lam = 300, k = (2 * Math.PI) / lam, w = (2 * Math.PI) / BEAT, A = 38 * r(t, 15.5, 16.2), tau = t - OB(8);
	const cone = A * Math.sin(-w * tau + Math.PI);
	const squeeze = Math.cos(w * tau) > 0, sq = sm(lin(t, 24.2, 25.0));
	return (
		<g transform={`translate(0 ${SY}) scale(1 ${1 - 0.95 * sq}) translate(0 ${-SY})`}>
			{PUMP.map((p, i) => {
				const phi = k * (p.x - 360) - w * tau + Math.PI, x = p.x + A * Math.sin(phi), c = Math.cos(phi);
				const dens = c < -0.55;
				return <circle key={i} cx={x.toFixed(1)} cy={p.y.toFixed(1)} r={p.r} fill={dens ? C.cyan : C.ink} opacity={(dens ? 0.55 : 0.18) + 0.35 * p.o * (dens ? 1 : 0.4)} />;
			})}
			<g filter="url(#glow)" transform={`translate(${cone * 0.6} 0)`}>
				<rect x={150} y={330} width={70} height={300} rx={10} fill="#1c2546" stroke="#9fb3d9" strokeWidth={3} />
				<path d="M 220 360 L 330 280 L 330 680 L 220 600 Z" fill="#1c2546" stroke={C.cyan} strokeWidth={4} />
				<ellipse cx={335} cy={480} rx={18} ry={200} fill={C.cyan} opacity={squeeze ? 0.75 : 0.3} />
			</g>
			<Lab x={300} y={240} t="推 → 挤紧" s={52} c={C.gold} o={(squeeze ? 1 : 0.3) * (1 - r(t, 23.9, 24.3))} />
			<Lab x={300} y={790} t="退 ← 松开" s={52} c={C.ink} o={(squeeze ? 0.3 : 1) * (1 - r(t, 23.9, 24.3))} />
			<Labs t={t} x={1150} y={120} s={52} items={[[15.9, 21.1, '一挤一松，一路传到你耳朵'], [21.18, 24.4, '1 秒挤松 N 次 = N 赫兹（Hz）', C.gold]]} />
		</g>
	);
};
// 4 · take the music apart: bass only, treble only, the phantom bass (the bars are the live spectrum)
const S4Spec: React.FC<{t: number}> = ({t}) => {
	const [lpA, lpB] = T.lp, [hpA, hpB] = T.hp, [phA, phB] = T.phantom, lw = lowAt(t);
	const ghost = win(t, phA + 0.2, phB, 0.4, 0.3), pulse = 1 - beatPh(t);
	return (
		<g>
			<g transform={`translate(0 ${SY}) scale(1 ${sm(lin(t, 24.5, 25.3))}) translate(0 ${-SY})`}><Spectrum t={t} cut={t < hpA ? 220 : t < phA ? 3000 : 130} cutO={win(t, lpA, phB, 0.3, 0.3)} ghost={ghost} /></g>
			<Labs t={t} y={150} items={[[24.85, lpA, '把整首歌按频率摊开'], [lpA, hpA, '只留 220 Hz 以下：鼓和贝斯', C.cyan], [hpA, phA, '只留 3000 Hz 以上：镲片、齿音', C.mag], [phA, phA + 2.0, '删掉 130 Hz 以下的一切'], [phA + 1.6, phB - 0.1, '大脑从上面的泛音，补出了低音', C.gold]]} />
			<g opacity={win(t, lpA, hpA, 0.3, 0.3)} filter="url(#glow2)">
				<circle cx={fx(45) + 40} cy={250} r={100 + 26 * lw} fill="none" stroke={C.cyan} strokeWidth={7} />
				<Lab x={fx(45) + 40} y={280} t="45 Hz" s={80} w={900} />
			</g>
			<g opacity={win(t, hpA, phA, 0.3, 0.3)}>
				<Lab x={fx(9000)} y={205} t="每秒上万次" s={72} c={C.mag} w={900} />
			</g>
			<g opacity={ghost}>
				<circle cx={fx(45) + 40} cy={250} r={100 + 20 * pulse} fill={C.cyan} opacity={0.1 + 0.15 * pulse} filter="url(#soft)" />
				<circle cx={fx(45) + 40} cy={250} r={100 + 20 * pulse} fill="none" stroke={C.cyan} strokeWidth={4} strokeDasharray="10 10" />
				<Lab x={fx(45) + 40} y={280} t="45 Hz？" s={80} c={C.cyan} w={900} />
			</g>
		</g>
	);
};
// 5 · the stereo stage: subtract the channels and the middle vanishes; then the 8× ratio
const SRC = [
	{a: -62, d: 470, n: '和声', c: C.mag, mid: false}, {a: 62, d: 470, n: '混响', c: C.mag, mid: false},
	{a: -30, d: 520, n: '', c: C.blue, mid: false}, {a: 30, d: 520, n: '', c: C.blue, mid: false},
	{a: 0, d: 470, n: '主旋律', c: C.gold, mid: true}, {a: 0, d: 250, n: '鼓·贝斯', c: C.cyan, mid: true},
];
const Stage: React.FC<{t: number; gone: number; back?: number}> = ({t, gone, back = 0}) => {
	const lw = lowAt(t), R = rng(5);
	return (
		<g transform="translate(960 790) scale(1.14) translate(-960 -790)">
			{gone > 0.05 && <g opacity={gone}><circle cx={960} cy={310} r={64} fill="none" stroke={C.gold} strokeWidth={4} strokeDasharray="12 10" /><circle cx={960} cy={530} r={56} fill="none" stroke={C.cyan} strokeWidth={4} strokeDasharray="12 10" /><Lab x={960} y={430} t="这里空了" s={56} c={C.gold} /></g>}
			<path d="M 470 780 A 520 520 0 0 1 1450 780" fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="4 14" />
			{SRC.map((s, i) => {
				const a = (s.a * Math.PI) / 180, x = 960 + Math.sin(a) * s.d, y = 780 - Math.cos(a) * s.d;
				const side = s.a < 0 ? earLv(LV.L[fi(t)]) : s.a > 0 ? earLv(LV.R[fi(t)]) : 0;
				const o = s.mid ? 1 - gone : 1, rad = (s.mid ? (s.n === '主旋律' ? 46 : 38) : 26) * (1 + 0.12 * lw + 0.3 * side * (s.mid ? 0 : 1));
				const bits = s.mid && gone > 0.01 ? Array.from({length: 26}, (_, j) => { const b = R() * 6.28 + t * 0.15, d = 20 + gone * (90 + R() * 160 + (t % 6) * 0); return <circle key={j} cx={x + Math.cos(b) * d} cy={y + Math.sin(b) * d} r={2.5} fill={s.c} opacity={(1 - gone) * 0.9 + 0.1} />; }) : null;
				return (
					<g key={i}>
						{bits}
						<circle cx={x} cy={y} r={rad} fill={s.c} opacity={0.85 * o} filter="url(#glow2)" />
						{back > 0 && s.mid && <circle cx={x} cy={y} r={rad + 220 * back} fill="none" stroke={s.c} strokeWidth={6} opacity={(1 - back) * 0.8} />}
						{s.n && <Lab x={x} y={y - rad - 22} t={s.n} s={52} c={s.c} o={s.mid ? o : 1} />}
					</g>
				);
			})}
			<Head x={960} y={800} s={0.55} lo={earLv(LV.L[fi(t)])} ro={earLv(LV.R[fi(t)])} />
		</g>
	);
};
const S5Stage: React.FC<{t: number}> = ({t}) => {
	const [cA, cB] = T.cancel;
	const gone = r(t, cA, cA + 0.6) * (1 - lin(t, cB, cB + 0.05));
	const back = t > cB ? lin(t, cB, cB + 1.0) : 0;
	return (
		<g>
			<Stage t={t} gone={gone} back={back} />
			<Labs t={t} y={100} items={[[cA - 0.1, cB, '左声道 − 右声道：正中间的声音互相抵消'], [cB, cB + 2.6, '合回来！主音 ≈ 363 Hz', C.gold]]} />
		</g>
	);
};
const S5Ratio: React.FC<{t: number}> = ({t}) => {
	const a = 45.3, d = r(t, a, a + 1.4), ph = (t - a) * 0.6;
	const ticks = [];
	for (let n = 0; n < 8; n++) ticks.push(<Lab key={n} x={300 + 175 * n + 175 / 4} y={540} t={String(n + 1)} s={44} c={C.gold} o={r(t, a + 0.3 + n * 0.14, a + 0.5 + n * 0.14)} />);
	return (
		<g>
			<g opacity={win(t, 44.95, 48.45, 0.3, 0.35)}>
			<path d={wave(300, 1700, 400, 120, 1400, undefined, 0)} fill="none" stroke={C.cyan} strokeWidth={9} filter="url(#glow)" />
			<path d={wave(300, 1700, 680, 60, 175, undefined, ph * 0)} fill="none" stroke={C.gold} strokeWidth={6} filter="url(#glow)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} />
			</g>
			<g opacity={win(t, 45.3, 48.15, 0.25, 0.3)}>
			<Lab x={300} y={250} t="鼓 45 Hz：振 1 次" s={56} c={C.cyan} a="start" />
			<Lab x={300} y={830} t="主音 363 Hz：振 8 次" s={56} c={C.gold} a="start" o={r(t, a + 0.4, a + 0.8)} />
			{ticks}
			<Lab x={1700} y={830} t="× 8" s={96} c={C.gold} a="end" w={900} o={r(t, a + 1.4, a + 1.8)} />
			</g>
		</g>
	);
};
// 6 · the binaural beat: 363 in the left ear, 369 in the right, a 6 Hz wobble that exists only in the head
const S6Bin: React.FC<{t: number}> = ({t}) => {
	const [bA, bB] = T.binaural, [mA, mB] = T.bin_mute, mute = win(t, mA, mB, 0.08, 0.08), i = fi(t), wob = Math.sin(2 * Math.PI * 6 * (t - bA)) * (1 - mute), on = win(t, bA, bB + 2.6, 0.5, 0.4);
	return (
		<g>
			{[0, 1, 2, 3].map((j) => <path key={`l${j}`} d={wave(120, 760, 330 + j * 70, 22, 46, (x) => cl((x - 120) / 120), t * 9 + j)} fill="none" stroke={C.cyan} strokeWidth={4} opacity={(0.75 - j * 0.12) * on} filter="url(#glow)" />)}
			{[0, 1, 2, 3].map((j) => <path key={`r${j}`} d={wave(1160, 1800, 330 + j * 70, 22, 45.25, (x) => cl((1800 - x) / 120), -t * 9 + j)} fill="none" stroke={C.mag} strokeWidth={4} opacity={(0.75 - j * 0.12) * on * (1 - 0.85 * mute)} filter="url(#glow)" />)}
			<Lab x={440} y={250} t="左耳 363 Hz" s={52} c={C.cyan} o={win(t, 48.5, 60.0, 0.3, 0.3)} /><Lab x={1480} y={250} t="右耳 369 Hz" s={52} c={C.mag} o={win(t, 48.5, 60.0, 0.3, 0.3)} />
			<Head x={960} y={440} s={1.15} lo={earLv(LV.L[i])} ro={earLv(LV.R[i])} core={r(t, 57.4, 58.2)} />
			{[0, 1, 2].map((j) => <ellipse key={j} cx={960} cy={440} rx={(40 + j * 26) * (1 + 0.12 * wob * on)} ry={(48 + j * 30) * (1 + 0.12 * wob * on)} fill="none" stroke={C.gold} strokeWidth={5 - j} opacity={(0.8 - j * 0.22) * on} filter="url(#glow)" />)}
			<Lab x={640} y={590} t="只有 363" s={52} c={C.cyan} o={win(t, 54.3, 59.95, 0.3, 0.3)} /><Lab x={1280} y={590} t="只有 369" s={52} c={C.mag} o={win(t, 54.3, 59.95, 0.3, 0.3)} />
			<Lab x={960} y={760} t="6 Hz" s={110} c={C.gold} w={900} o={win(t, 51.0, 60.0, 0.3, 0.3)} /><Labs t={t} y={850} s={52} items={[[51.0, 54.27, '369 − 363 = 6', C.gold], [54.27, 55.75, '右耳一停 → 摇晃消失', C.gold], [55.75, 57.54, '只在你的脑子里', C.gold], [57.54, 59.95, '大脑自己算出来的', C.gold]]} />
		</g>
	);
};
// 7 · age: the top of the hearing range closes in (the curtain is the soundtrack's own filter)
const S7Age: React.FC<{t: number}> = ({t}) => {
	const fc = ageFc(t);
	return (
		<g>
			<Spectrum t={t} fc={fc < 15500 ? fc : undefined} />
			<Labs t={t} y={150} items={[[60.45, 64.4, '年纪越大，高处的声音先消失']]} />
		</g>
	);
};
// 8 · the prank: the arrow says left, the sound is in the right ear (and back)
const Arrow: React.FC<{dir: -1 | 1; k: number; pulse: number}> = ({dir, k, pulse}) => (
	<g transform={`translate(${960 + dir * (1 - k) * -500} 470) scale(${-dir * (1 + 0.015 * pulse)} ${1 + 0.015 * pulse})`} opacity={k}>
		<g filter="url(#glow)"><path d="M 420 -50 L -200 -50 L -200 -170 L -480 0 L -200 170 L -200 50 L 420 50 Z" fill="#cfe0ff" opacity={0.82} /></g>
	</g>
);
const S8Gotcha: React.FC<{t: number}> = ({t}) => {
	const [a, b, c] = T.gotcha, p = 1 - beatPh(t);
	return (
		<g>
			{t < c + 0.1 && (() => {
				// one arrow that flips on the bar (it never disappears), then slides away under the reveal
				const flip = mix(-1, 1, sm(lin(t, b - 0.09, b + 0.09))), k = r(t, a - 0.25, a + 0.12), out = r(t, c - 0.15, c + 0.1);
				return <g opacity={k * (1 - out)} transform={`translate(${960 - (1 - k) * 500 * -1 + out * 300 * flip} 470) scale(${-flip * (1 + 0.015 * p)} ${1 + 0.015 * p})`}>
					<g filter="url(#glow)"><path d="M 420 -50 L -200 -50 L -200 -170 L -480 0 L -200 170 L -200 50 L 420 50 Z" fill="#cfe0ff" opacity={0.82} /></g>
				</g>;
			})()}
			<Lab x={960} y={230} t="声音在左边" s={96} w={900} o={win(t, a - 0.05, b + 0.05, 0.15, 0.15)} />
			<Lab x={960} y={230} t="现在在右边" s={96} w={900} o={win(t, b - 0.05, c - 0.02, 0.15, 0.15)} />
			<g opacity={win(t, c - 0.05, 70.45, 0.25, 0.25)}>
				<Lab x={960} y={260} t="骗你的！" s={110} c={C.gold} w={900} />
				<Lab x={960} y={400} t="← 那一下，声音其实只在右耳" s={52} c={C.mag} />
				<Lab x={960} y={480} t="→ 那一下，声音其实只在左耳" s={52} c={C.cyan} />
				<Head x={960} y={690} s={0.75} lo={earLv(LV.L[fi(t)])} ro={earLv(LV.R[fi(t)])} />
			</g>
		</g>
	);
};
// 9 · precedence: equally loud, one ear 18 ms late → the sound sits on the early side
const S9Prec: React.FC<{t: number}> = ({t}) => {
	const [p0, p1] = T.prec, early = t < p1 ? -1 : 1, ph = beatPh(t);
	const ring = (side: number, lag: number) => { const q = ph - lag; if (q < 0) return null; return <ellipse cx={960 + side * 160} cy={520} rx={40 + 300 * q} ry={52 + 330 * q} fill="none" stroke={side < 0 ? C.cyan : C.mag} strokeWidth={5} opacity={(1 - q) * 0.85} filter="url(#glow)" />; };
	const sw = r(t, p1 - 0.15, p1 + 0.15), ex = mix(-1, 1, sw);
	return (
		<g>
			{ring(early, 0)}{ring(-early, 0.12)}
			<Head x={960} y={520} s={1.5} lo={0.9} ro={0.9} />
			<circle cx={960 + ex * 600} cy={520} r={44} fill={C.gold} filter="url(#glow2)" opacity={0.9} />
			<Lab x={960 + ex * 600} y={440} t="听起来在这边" s={52} c={C.gold} />
			<Lab x={960 + early * 200} y={800} t="先到" s={72} c={C.gold} w={900} />
			<Lab x={960 - early * 230} y={800} t="晚 0.02 秒" s={72} c={C.ink} w={900} />
			<Labs t={t} y={200} items={[[p0 + 1.5, 73.2, '第二招：两耳一样响，只差一点点时间'], [73.2, 74.95, '大脑只信先到的那只耳朵', C.gold]]} />
		</g>
	);
};
// 10 · the combo: an endlessly rising scale + the music circling the head faster and faster + opening up
const S10Combo: React.FC<{t: number}> = ({t}) => {
	const [sA] = T.shepard, e = te(t), bright = 0.3 + 0.7 * openK(e), gapK = 0;
	const climb = 0.11 * (e - sA) + 0.11 * Math.max(0, e - (g('shepard', 1) - BAR));
	const rings: React.ReactNode[] = [];
	const N = 14;
	for (let i = 0; i < N; i++) {
		const h = (((i / N + climb) % 1) + 1) % 1, y = 900 - h * 760, rx = 170 + 300 * Math.sin(h * Math.PI) + 60 * h;
		rings.push(<ellipse key={i} cx={960} cy={y} rx={rx} ry={rx * 0.2} fill="none" stroke={i % 2 ? C.mag : C.cyan} strokeWidth={4} opacity={Math.pow(Math.sin(Math.PI * h), 1.5) * bright} filter="url(#glow)" />);
	}
	const am = amBuild(Math.min(e, DROP)), headO = r(t, g('rot_build') - 0.4, g('rot_build') + 0.3);
	const pos = (th: number) => [960 + Math.sin(th) * 380, 470 - Math.cos(th) * 150];
	const trail: React.ReactNode[] = [];
	for (let j = 0; j < 46; j++) { const tt = Math.max(g('rot_build'), e - j * 0.018); const [x, y] = pos(thBuild(tt)); trail.push(<circle key={j} cx={x} cy={y} r={11 - j * 0.2} fill={C.gold} opacity={(1 - j / 46) * am} filter={j < 3 ? 'url(#glow2)' : undefined} />); }
	const i = fi(t);
	return (
		<g opacity={1 - 0.22 * gapK} transform={`translate(960 480) scale(${1 - 0.06 * gapK}) translate(-960 -480)`}>
			{rings}
			<g opacity={headO}>{trail}<Head x={960} y={470} s={0.8} lo={earLv(LV.L[i])} ro={earLv(LV.R[i])} /></g>
			{[[75.3, '① 永远在上升的音阶', 380], [76.2, '② ＋ 360° 绕头转', 960], [77.4, '③ ＋ 越来越亮、越响', 1540]].map(([a, txt, x], j) => (
				<Lab key={j} x={x as number} y={160} t={txt as string} s={52} c={j === 2 ? C.gold : C.ink} o={r(t, a as number, (a as number) + 0.3)} />
			))}
			<Lab x={300} y={330} t="↑ 高处慢慢淡出" s={52} c={C.dim} o={win(t, 75.6, 79.6, 0.4, 0.4)} />
			<Lab x={300} y={860} t="低处悄悄补进 ↑" s={52} c={C.dim} o={win(t, 75.6, 79.6, 0.4, 0.4)} />
		</g>
	);
};
// 11 · the drop: the air bursts outward, the title lands
const RAYS = (() => { const R = rng(9); return Array.from({length: 480}, (_, i) => ({a: R() * 6.283, d: 60 + Math.pow(R(), 0.6) * 500, l: 30 + R() * 60, w: 2 + R() * 2, o: 0.3 + R() * 0.6, gold: i % 3 === 0, sp: 0.6 + R() * 0.8})); })();
const S11Drop: React.FC<{t: number}> = ({t}) => {
	const u = t - DROP, fade = 1 - r(t, DROP + 2.2, DROP + 5.0);
	return (
		<g>
			{RAYS.map((p, i) => {
				const d = p.d + 1100 * p.sp * (1 - Math.exp(-u * 1.6)), c = Math.cos(p.a), s = Math.sin(p.a) * 0.62;
				return <line key={i} x1={960 + c * d} y1={480 + s * d} x2={960 + c * (d + p.l)} y2={480 + s * (d + p.l)} stroke={p.gold ? C.gold : C.ink} strokeWidth={p.w} opacity={p.o * fade} />;
			})}
			{[0, 1].map((j) => { const q = Math.max(0, u - j * 0.15); const R = 160 + 1200 * (1 - Math.exp(-q * 1.5)); return <ellipse key={j} cx={960} cy={480} rx={R} ry={R * 0.62} fill="none" stroke={j ? C.mag : C.gold} strokeWidth={26 - j * 12} opacity={0.6 * Math.exp(-q * 0.7)} filter="url(#glow2)" />; })}
			<circle cx={960} cy={480} r={200} fill={C.gold} opacity={0.16 * fade} filter="url(#soft)" />
		</g>
	);
};
/* the title is made of the same air: on the drop, particles from a wide ring slam into the letters (left half
   cyan, centre gold, right half magenta — the two ears and the answer), breathe with the kick, ride a gold sound
   wave, and blow back into the air when the title leaves. */
const TP = (TT as any).pts as number[][];
const TPX = (() => { const R = rng(41); return TP.map(([x, y]) => { const f = cl((x - 336) / 1248); return {x, y, a: R() * 6.283, d: 760 + R() * 520, s: 2.4 + R() * 1.4, ph: R() * 6.28, c: f < 0.5 ? lerpC(C.cyan, C.gold, f * 2) : lerpC(C.gold, C.mag, (f - 0.5) * 2), ox: (x - 960) / 700, oy: (y - 440) / 300 - 0.6}; }); })();
const PTitle: React.FC<{t: number}> = ({t}) => {
	const u = t - DROP;
	if (u < 0 || t > 87.6) return null;
	const k = 1 - Math.pow(1 - cl(u / 0.26), 3), out = sm(lin(t, 85.0, 86.6)), lw = lowAt(t), gone = r(t, 86.8, 87.5);
	const lab = r(t, DROP + 0.2, DROP + 0.5) * (1 - r(t, 85.0, 85.4));
	const env = (x: number) => Math.sin(cl((x - 300) / 1320) * Math.PI);
	const sW = 60 * t, wy = (x: number) => 330 + Math.sin(((x - 140) / 240) * Math.PI * 2 - (2 * Math.PI * sW) / 240) * 70;
	return (
		<g>
			<g filter="url(#glow)">
				{TPX.map((p, i) => {
					const sx = 960 + Math.cos(p.a) * p.d, sy = 440 + Math.sin(p.a) * p.d * 0.62;
					// exit: every particle pours onto the 363 Hz wave of the next scene (staggered left → right)
					const q = sm(cl((out * 1.6) - (i / TPX.length) * 0.6)), tx = 140 + (i / TPX.length) * 960;
					const x = mix(mix(sx, p.x, k) + Math.sin(t * 5 + p.ph) * 1.1, tx, q), y = mix(mix(sy, p.y, k) + Math.cos(t * 4 + p.ph) * 1.1, wy(tx), q);
					return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={(p.s * (1 + 0.28 * lw) * (1 - 0.35 * q)).toFixed(2)} fill={q > 0.7 ? C.cyan : p.c} opacity={(0.55 + 0.45 * k) * (1 - gone)} />;
				})}
			</g>
			<text x={968} y={286} textAnchor="middle" opacity={lab} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em'}} fill={C.gold}>{JUNO.series}</text>
			<path d={wave(300, 1620, 618, 22 * (0.35 + lw), 92, env, t * 7)} fill="none" stroke={C.gold} strokeWidth={5} opacity={lab} filter="url(#glow)" />
		</g>
	);
};
const Title: React.FC<{t: number}> = ({t}) => {
	const k = lin(t, DROP, DROP + 0.22) * (1 - r(t, 85.1, 85.7));
	if (k <= 0.001) return null;
	const j = Math.exp(-(t - DROP) * 9), sx = Math.sin((t - DROP) * 70) * 14 * j, sy = Math.cos((t - DROP) * 55) * 9 * j;
	const sc = t < DROP + 0.22 ? mix(1.6, 0.97, sm(lin(t, DROP, DROP + 0.22))) : mix(0.97, 1, lin(t, DROP + 0.22, DROP + 0.4));
	return (
		<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', opacity: k, transform: `translate(${sx}px, ${sy}px) scale(${sc})`}}>
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em', color: C.gold}}>{JUNO.series}</div>
			<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 176, letterSpacing: '0.06em', marginTop: 6, whiteSpace: 'nowrap', background: 'linear-gradient(180deg, #fff3d2 0%, #f1c56d 55%, #c8913a 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 26px rgba(241,197,109,0.45)) drop-shadow(0 6px 20px rgba(4,6,14,0.8))'}}>为什么好听<span style={{marginRight: '-0.5em'}}>？</span></div>
		</div>
	);
};
// 12 · harmony: root, octave 2:1, fifth 3:2, a clash, resolved
const Liss: React.FC<{p: number; q: number; drift: number; draw: number; col: string; cycles?: number}> = ({p, q, drift, draw, col, cycles = 1}) => {
	let d = '';
	const n = 900 * cycles;
	for (let i = 0; i <= n; i++) { const a = (i / 900) * Math.PI * 2; d += `${i ? 'L' : 'M'} ${(1500 + Math.sin(p * a + drift) * 200).toFixed(1)} ${(450 + Math.sin(q * a + Math.PI / 2) * 200).toFixed(1)} `; }
	return <path d={d} fill="none" stroke={col} strokeWidth={cycles > 1 ? 2.5 : 5} filter="url(#glow)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />;
};
const S12Harm: React.FC<{t: number}> = ({t}) => {
	const [rA] = T.root, [oA] = T.oct, [fA] = T.fifth, [cA, cB] = T.clash;
	const wl2 = t < fA - 0.2 ? 120 : t < cA ? mix(120, 160, r(t, fA - 0.2, fA + 0.2)) : t < 108.2 ? mix(160, 226.5, r(t, cA, cA + 0.3)) : mix(226.5, 160, r(t, 108.2, 108.8));
	const clash = t >= cA && t < 108.8 ? r(t, cA, cA + 0.3) * (1 - r(t, 108.2, 108.8)) : 0;
	const s = 60 * t, w1 = r(t, 86.6, 87.4), w2 = r(t, 88.95, 89.6);
	const L = wl2 < 140 ? 240 : 480, aligned = 1 - clash;
	const lines: React.ReactNode[] = [];
	for (let x = 140 + (((s % L) + L) % L); x <= 1100; x += L) lines.push(<line key={x} x1={x} x2={x} y1={240} y2={650} stroke={C.gold} strokeWidth={4} strokeDasharray="10 10" opacity={0.85 * aligned * w2} />);
	const c2 = lerpC(C.mag, C.red, clash);
	const which = t < fA - 0.1 ? 0 : t < cA ? 1 : t < 108.2 ? 2 : 3;
	const drawK = (a: number) => r(t, a, a + 1.4);
	const lissO = w2 * (1 - r(t, 113.0, 113.6));
	return (
		<g>
			<path d={wave(140, 1100, 330, 70, 240, undefined, (2 * Math.PI * s) / 240)} fill="none" stroke={C.cyan} strokeWidth={6} filter="url(#glow)" opacity={w1} />
			{w2 > 0 && <path d={wave(140, 1100, 560, 70 * w2, wl2, undefined, (2 * Math.PI * s) / wl2)} fill="none" stroke={c2} strokeWidth={6} filter="url(#glow)" />}
			{lines}
			<Lab x={120} y={345} t="363" s={40} c={C.cyan} a="end" o={w1} />
			<Lab x={120} y={575} t={which === 0 ? '726' : which === 2 ? '384' : '544'} s={40} c={c2} a="end" o={w2} />
			<g opacity={lissO}>
				{which === 0 && <Liss p={2} q={1} drift={0} draw={drawK(89.2)} col={C.gold} />}
				{(which === 1 || which === 3) && <Liss p={3} q={2} drift={0} draw={which === 1 ? drawK(fA) : drawK(108.4)} col={C.gold} />}
				{which === 2 && <Liss p={1.0606} q={1} drift={(t - cA) * 1.2} draw={1} col={C.red} cycles={8} />}
				<Lab x={1500} y={760} t={which === 0 ? '2 : 1' : which === 2 ? '对不齐' : '3 : 2'} s={72} c={which === 2 ? C.red : C.gold} w={900} />
			</g>
			<Labs t={t} x={620} y={180} items={[[rA - 0.2, oA - 2.1, '主音：363 Hz', C.cyan], [oA - 2.1, fA, '＋ 高八度 726 Hz：2 比 1'], [fA, cA, '＋ 五度 544 Hz：3 比 2'], [cA, 108.45, '＋ 384 Hz：只差半音，打架', C.red], [108.49, 113.7, '这首歌的和弦：比例都简单', C.gold]]} />
		</g>
	);
};
// 13 · the sad part: slower, lower, circling slowly (rain falls slower when the song slows)
const RAIN = (() => { const R = rng(11); return Array.from({length: 260}, () => ({x: R() * W, y: R() * H, l: 26 + R() * 30, o: 0.15 + R() * 0.35, v: 160 + R() * 120})); })();
const MOTES = (() => { const R = rng(17); return Array.from({length: 140}, () => ({x: R() * W, y: R() * H, r: 1.5 + R() * 3, v: 30 + R() * 50, ph: R() * 6})); })();
const S13Sad: React.FC<{t: number}> = ({t}) => {
	const [rA, rB] = T.rot_slow, [slA, slB] = T.slow;
	const slowK = win(t, slA, slB, 0.6, 0.6);
	const rt = (t - rA) - 0.4 * Math.max(0, Math.min(t, slB) - slA);           // rain clock slows during the slow-down
	const am = cosr((t - rA) / BAR) * (1 - cosr((t - (rB - BAR)) / BAR));
	const pos = (th: number) => [960 + Math.sin(th) * 420, 520 - Math.cos(th) * 170];
	const trail: React.ReactNode[] = [];
	for (let j = 0; j < 80; j++) { const tt = Math.max(rA, t - j * 0.045); const [x, y] = pos(thSlow(tt)); trail.push(<circle key={j} cx={x} cy={y} r={15 - j * 0.15} fill={C.blue} opacity={(1 - j / 80) * am} filter={j < 2 ? 'url(#glow2)' : undefined} />); }
	const chills = r(t, 127.6, 128.4);
	const i = fi(t);
	return (
		<g>
			{RAIN.map((p, j) => { const y = ((p.y + rt * p.v) % (H + 80)) - 40; return <line key={j} x1={p.x} y1={y} x2={p.x - 4} y2={y + p.l} stroke={C.blue} strokeWidth={1.6} opacity={p.o * (1 - 0.3 * slowK)} />; })}
			{chills > 0 && MOTES.map((p, j) => { const y = H - (((H - p.y) + (t - 127.6) * p.v) % H); return <circle key={j} cx={p.x + Math.sin(t + p.ph) * 10} cy={y} r={p.r} fill={C.gold} opacity={chills * 0.7} />; })}
			{trail}
			<Head x={960} y={520} s={1.15} l={C.blue} r={C.blue} lo={earLv(LV.L[i])} ro={earLv(LV.R[i])} core={0.55} />
			<Labs t={t} y={200} items={[[rA, 116.6, '慢放：更慢、更低', C.blue], [116.66, slA, '又慢又低 → 常被听成悲伤', C.blue], [slA, slB, '再降 2 个半音 · 更慢', C.blue], [slB, 127.5, '难过时，说话也变慢、变低', C.blue], [127.6, 130.4, '慢慢绕着你转 → 更容易起鸡皮疙瘩', C.gold]]} />
			<Labs t={t} y={270} s={40} items={[[116.66, 127.5, '研究：Juslin & Laukka 2003', C.dim], [127.6, 130.4, '研究：Honda 等 2020', C.dim]]} />
		</g>
	);
};
// 14 · recap: one bar each (bass, treble, no middle, left-right, around you)
const S14Recap: React.FC<{t: number}> = ({t}) => {
	const R = T.recap as number[];
	const seg = (j: number) => (j === 0 ? win(t, R[0] - 0.25, R[2] + 0.15, 0.3, 0.3) : j === 2 ? win(t, R[2] - 0.15, R[3] + 0.15, 0.25, 0.3) : win(t, R[j] - 0.3, R[j + 1] + 0.15, 0.25, 0.3));
	const push = (j: number, node: React.ReactNode) => { const k = seg(j); if (k <= 0.001) return null; const s = mix(0.94, 1, sm(lin(t, R[j], R[j] + 0.4))); return <g key={j} opacity={k} transform={`translate(960 480) scale(${s}) translate(-960 -480)`}>{node}</g>; };
	const i = fi(t), th = t > g('rot_end') ? thEnd(t) : 0, [cx, cy] = [960 + Math.sin(th) * 380, 470 - Math.cos(th) * 150];
	return (
		<g>
			{push(0, <><Spectrum t={t} cut={t < R[1] ? 220 : 3000} /><Lab x={960} y={150} t="220 Hz 以下" c={C.cyan} o={win(t, R[0] - 0.1, R[1], 0.2, 0.15)} /><Lab x={960} y={150} t="3000 Hz 以上" c={C.mag} o={win(t, R[1], R[2], 0.15, 0.2)} /></>)}
			{push(2, <><Stage t={t} gone={1} /><Lab x={960} y={100} t="左 − 右：中间没了" /></>)}
			{seg(3) + seg(4) > 0.001 && (() => { const up = sm(lin(t, R[3] - 0.15, R[3] + 0.3)), hx = 960, hy = mix(790, 470, up), hs = mix(0.63, 1.0, up); const o3 = seg(3), o4 = win(t, R[4] - 0.1, R[5] + 0.2, 0.25, 0.3); return (
				<g>
					<g opacity={o3}><Rings t={t} div={2} x={hx} y={hy} s={hs} /></g>
					<g opacity={o4}><circle cx={cx} cy={cy} r={16} fill={C.gold} filter="url(#glow2)" /><Lab x={960} y={150} t="360°" c={C.gold} o={1 - r(t, 140.2, 140.5)} /></g>
					<g opacity={Math.max(o3, o4)}><Head x={hx} y={hy} s={hs} lo={earLv(LV.L[i])} ro={earLv(LV.R[i])} /></g>
				</g>
			); })()}
		</g>
	);
};
// 15 · finale: a sphere of air around your head, which lines up into one wave — the song
const SPH = (() => { const R = rng(12); return Array.from({length: 900}, (_, i) => ({a: R() * 6.283, b: Math.acos(2 * R() - 1), r: 330 + R() * 30, c: [C.cyan, C.mag, C.gold, C.ink][i % 4], s: 1.5 + R() * 2.5})); })();
const S15Fin: React.FC<{t: number}> = ({t}) => {
	const th = 0.5 * thEnd(t), lw = lowAt(t), m = sm(lin(t, OB(73), OB(73) + 1.6)), headO = 1 - r(t, OB(73) - 0.3, OB(73) + 0.5);
	return (
		<g>
			{[0, 1, 2].map((j) => <ellipse key={j} cx={960} cy={470} rx={430 + j * 140} ry={(430 + j * 140) * 0.55} fill="none" stroke={C.gold} strokeWidth={3} opacity={(0.35 - j * 0.1) * (1 - m)} />)}
			{SPH.map((p, i) => {
				const a = p.a + th, rad = p.r * (1 + 0.05 * lw), z = Math.sin(p.b) * Math.sin(a);
				const sx = 960 + rad * Math.sin(p.b) * Math.cos(a), sy = 470 + rad * Math.cos(p.b) * 0.9;
				const u = i / SPH.length, wx = 160 + u * 1600, wy = 470 + Math.sin(u * Math.PI * 2 * 7 - (t - OB(73)) * 3) * 130 * Math.sin(u * Math.PI);
				const x = mix(sx, wx, m), y = mix(sy, wy, m), o = mix(0.3 + 0.6 * (0.5 + 0.5 * z), 0.95, m);
				return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={mix(p.s * (0.8 + 0.4 * (0.5 + 0.5 * z)), 3, m)} fill={m > 0.6 ? C.gold : p.c} opacity={o} />;
			})}
			<g opacity={headO}><Head x={960} y={480} s={0.75} lo={earLv(LV.L[fi(t)])} ro={earLv(LV.R[fi(t)])} /></g>
		</g>
	);
};

// ------------------------------------------------------------------ film
const BG: [number, string][] = [[0, '#121a3a'], [72.5, '#121a3a'], [76, '#1c1340'], [80.6, '#24194f'], [86, '#151c42'], [112.8, '#151c42'], [115, '#13243f'], [130.2, '#13243f'], [131, '#121a3a'], [140.5, '#121a3a'], [143, '#1a1a46']];
const bgAt = (t: number) => { for (let i = 1; i < BG.length; i++) if (t < BG[i][0]) return lerpC(BG[i - 1][1], BG[i][1], sm(lin(t, BG[i - 1][0], BG[i][0]))); return BG[BG.length - 1][1]; };
const subAt = (t: number) => { for (const [s, e, txt] of lines as [number, number, string][]) if (t >= s && t < e) return {txt, o: Math.min(s <= 0 ? 1 : lin(t, s, s + 0.15), 1 - lin(t, e - 0.15, e))}; return null; };
const Sub: React.FC<{t: string}> = ({t}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center'}}>
		<div style={{position: 'relative', padding: '26px 120px'}}>
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(4,6,14,0.55) 0%, rgba(4,6,14,0.3) 42%, rgba(4,6,14,0) 100%)', filter: 'blur(6px)'}} />
			<div style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fffaf0', letterSpacing: '0.03em', WebkitTextStroke: '7px rgba(6,8,18,0.6)', paintOrder: 'stroke fill', textShadow: '0 2px 10px rgba(0,0,0,0.75), 0 0 28px rgba(0,0,0,0.45)'}}>{t}</div>
		</div>
	</div>
);
type Sc = [React.FC<{t: number}>, number, number, number, number];
const SCENES: Sc[] = [
	[S1Wave, 0, 9.65, 0, 0.25], [S2Ping, 9.25, 15.85, 0.35, 0.3], [S3Pump, 15.35, 25.1, 0.4, 0.3], [S4Spec, 24.45, 38.35, 0.15, 0.45],
	[S5Stage, 37.95, 45.3, 0.45, 0.35], [S5Ratio, 44.9, 48.5, 0.01, 0.01], [S6Bin, 48.0, 60.35, 0.4, 0.4], [S7Age, 60.0, 64.8, 0.4, 0.3],
	[S8Gotcha, 64.5, 70.5, 0.0, 0.3], [S9Prec, 70.15, 75.4, 0.35, 0.45], [S10Combo, 75.0, DROP, 0.5, 0], [S11Drop, DROP, 87.6, 0, 0.8],
	[S12Harm, 86.5, 113.8, 0.01, 0.5], [S13Sad, 113.45, 130.65, 0.55, 0.35], [S14Recap, 130.2, 140.95, 0.01, 0.3], [S15Fin, 140.45, END, 0.6, 0],
];
export const Film29: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const s = subAt(t);
	const j = t >= DROP ? Math.exp(-(t - DROP) * 9) : 0;
	const shake = `translate(${Math.sin((t - DROP) * 70) * 10 * j} ${Math.cos((t - DROP) * 55) * 7 * j})`;
	const outro = 1 - 0.35 * r(t, OUTRO + 0.3, OUTRO + 1.4);
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${bgAt(t)} 0%, #060914 75%)`}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<g transform={shake} opacity={outro}>
					<Air t={t} />
					{SCENES.map(([S, a, b, fin, fout], i) => { if (t < a || t > b) return null; const o = win(t, a, b, fin, fout); return o > 0.001 ? <g key={i} opacity={o}><S t={t} /></g> : null; })}
					<PTitle t={t} />
				</g>
				<Pill t="戴上耳机，效果最佳" o={win(t, -1, 9.3, 0.4, 0.4)} />
				<Pill t="接下来几段，一定要戴耳机" o={win(t, 45.35, 48.3, 0.35, 0.35)} />
				<rect width={W} height={H} fill="url(#vig)" />
			</svg>
			{s && t < OUTRO && <div style={{opacity: s.o}}><Sub t={s.txt} /></div>}
			<Sequence from={Math.round(OUTRO * FPS)}><EndCard v={{id: 'ep29', src: '', title: '为什么好听？', kicker: '', tagline: '', taglineEn: '', motif: 'wave', card: [0, 0], extend: 0, question: '你单曲循环最多的是哪首歌？评论区说说', sources: '来源：NIDCD；SFU Sonic Studio Handbook；Oster 1973；Litovsky 等 1999；Juslin & Laukka 2003；Honda 等 2020；本曲频谱实测', duration: 0} as any} cfg={{videos: []} as any} dur={Math.round((END - OUTRO) * FPS)} /></Sequence>
			<div style={{position: 'absolute', top: 40, right: 56, opacity: t < OUTRO ? 0.55 : 0, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: C.ink}}>{JUNO.mark}</div>
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM29" component={Film29} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
