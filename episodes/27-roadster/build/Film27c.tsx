import React from 'react';
import {AbsoluteFill, Composition, Easing, interpolate, registerRoot, Sequence, useCurrentFrame} from 'remotion';
import {K, W, H, SANS, Sub, Lab, rng} from './kit27';
import {Car, Plume, NOZZLES} from './Car27';
import {Flood, Horizon, Lineup} from './World27';
import {EndCard} from '../brand/Brand';
import {JUNO} from '../brand/identity';
import LINES from './lines27c.json';

/* ep27 v3 · one take, ~1:30, opens mid-climb. Principles are taken apart on the car in "focus mode":
   time slows or stops, the world falls back (dim, blue, soft), the car turns to glass and the air is drawn as moving flow.
   Music: owner's track from 0:00; story ends 82.25, end card to 89.86, audio fade over the last bar (applied at mux). */
export const FPS = 30, FILM_END = 89.86, END_AT = 82.25;

const EZ = {io: Easing.bezier(0.65, 0, 0.35, 1), out: Easing.bezier(0.16, 1, 0.3, 1), in: Easing.bezier(0.7, 0, 0.84, 0), lin: (x: number) => x};
const r = (t: number, a: number, b: number, e = EZ.io) => interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (p: number, a: number, b: number) => a + (b - a) * p;
const pop = (t: number, a: number, d = 0.35) => r(t, a, a + d, Easing.bezier(0.2, 1.5, 0.4, 1));
const pw = (t: number, pts: [number, number][]) => interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const subAt = (t: number) => { for (const [s, e, x] of LINES as [number, number, string][]) if (t >= s && t < e) return x; return ''; };
const smooth = (keys: number[][], t: number) => {
	if (t <= keys[0][0]) return keys[0].slice(1);
	const n = keys.length;
	if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
	let i = 0;
	while (keys[i + 1][0] < t) i++;
	const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(n - 1, i + 2)];
	const h = k2[0] - k1[0], u = (t - k1[0]) / h;
	const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
	return k1.slice(1).map((_, j) => {
		const m1 = i === 0 ? 0 : ((k2[j + 1] - k0[j + 1]) / (k2[0] - k0[0])) * h * 0.8;
		const m2 = i + 2 >= n ? 0 : ((k3[j + 1] - k1[j + 1]) / (k3[0] - k1[0])) * h * 0.8;
		return h00 * k1[j + 1] + h10 * m1 + h01 * k2[j + 1] + h11 * m2;
	});
};

/* ---------------- the course ---------------- */
const S = 0.45, WB = 285 * S;
const C = {cx: 1500, cy: 340, r: 600, band: 70, lipX: 300};
const GROUND = C.cy + C.r, CEIL = C.cy - C.r;
const SAG = C.r - Math.sqrt(C.r * C.r - WB * WB);
const LAND_X = -1000, KICK_X = -1700, JUMP_TO = -3900, PARK_X = -7400;
const HALF = (292 - 170) * S;
type St = {x: number; y: number; rot: number; fx: number; fy: number; spin: number; jets: number; top: number; xray: number; shadow: number};
const fromWheel = (wx: number, wy: number, rot: number) => { const a = (rot * Math.PI) / 180; return {x: wx + Math.sin(a) * HALF, y: wy - Math.cos(a) * HALF}; };
const base: St = {x: 0, y: 0, rot: 0, fx: 1, fy: 1, spin: 0, jets: 0, top: 0, xray: 0, shadow: 1};
/* timeline anchors (beats) */
const T = {top: 2.6, freeze: 5.13, thaw: 21.0, go: 28.8, launch: 31.42, land: 41.42, jump: 44.02, jland: 49.09, stop: 54.22, gas: 56.63, hop: 74.67, drop: 77.25};
const carAt = (t: number): St => {
	if (t < T.top) { // already climbing at frame 0
		const th = mix(r(t, 0, T.top, Easing.bezier(0.3, 0.2, 0.6, 1)), 28, -90);
		const a = (th * Math.PI) / 180, rr = C.r - SAG, rot = th - 90;
		return {...base, ...fromWheel(C.cx + rr * Math.cos(a), C.cy + rr * Math.sin(a), rot), rot, spin: 2000 + t * 900, shadow: 0};
	}
	if (t < T.launch) {
		let x: number;
		if (t < T.freeze) x = mix(r(t, T.top, T.freeze, EZ.out), C.cx, 1160);
		else if (t < T.thaw) x = mix((t - T.freeze) / (T.thaw - T.freeze), 1160, 1130);
		else if (t < T.go) x = mix(r(t, T.thaw, T.go, EZ.io), 1130, 1040);
		else x = mix(r(t, T.go, T.launch, Easing.bezier(0.5, 0, 0.95, 0.9)), 1040, C.lipX);
		return {...base, ...fromWheel(x, CEIL, 180), rot: 180, spin: 5200 - x * 1.2, shadow: 0, xray: r(t, T.freeze, T.freeze + 0.5) * (1 - r(t, 21.6, 23.0))};
	}
	if (t < T.land) { // off the lip: push away, slow-motion roll, brake, land
		const u = pw(t, [[T.launch, 0], [32.0, 0.2], [40.4, 0.74], [T.land, 1]]);
		const roll = r(t, 34.6, 36.9, EZ.io);
		const fy = -Math.cos(Math.PI * roll);
		const y0 = CEIL + HALF, y1 = GROUND - HALF;
		return {...base, x: mix(u, C.lipX, LAND_X), y: y0 + (y1 - y0) * u * u, fx: -1, fy, spin: 6000 + u * 300,
			jets: Math.max(1 - r(t, 31.6, 32.3), r(t, 39.5, 39.9) * (1 - r(t, 41.2, 41.5))), top: r(t, 34.4, 34.8) * (1 - r(t, 36.6, 37.0)),
			xray: r(t, 31.8, 32.4) * (1 - r(t, 39.6, 40.4)), shadow: r(u, 0.85, 1)};
	}
	if (t < T.jump) { const x = mix(r(t, T.land, T.jump, EZ.lin), LAND_X, KICK_X); return {...base, ...fromWheel(x, GROUND, 0), fx: -1, spin: -x}; }
	if (t < T.jland) {
		const u = pw(t, [[T.jump, 0], [45.2, 0.3], [47.9, 0.7], [T.jland, 1]]);
		return {...base, ...fromWheel(mix(u, KICK_X, JUMP_TO), GROUND - 720 * Math.sin(Math.PI * u), 0), rot: 9 * Math.cos(Math.PI * u), fx: -1, spin: 1800 + u * 400,
			jets: 0.6 + 0.4 * Math.max(1 - r(u, 0, 0.2), r(u, 0.8, 0.95)), shadow: 1 - Math.sin(Math.PI * u)};
	}
	if (t < T.stop) { const x = mix(r(t, T.jland, T.stop, Easing.bezier(0.5, 0, 0.2, 1)), JUMP_TO, PARK_X); return {...base, ...fromWheel(x, GROUND, 0), fx: -1, spin: -x}; }
	const small = Math.sin(Math.PI * r(t, T.hop, T.hop + 1.2, EZ.lin));
	const big = r(t, T.drop, T.drop + 1.6, EZ.out) * (1 - r(t, 80.3, 81.6, EZ.in));
	const lift = 110 * small + 380 * big;
	return {...base, ...fromWheel(PARK_X, GROUND - lift, 0), fx: -1, spin: -PARK_X, xray: r(t, T.gas, T.gas + 0.5) * (1 - r(t, 61.2, 62.0)),
		jets: small > 0.02 ? 0.85 : big > 0.01 ? 0.7 + 0.3 * (1 - r(t, 78.6, 80.0)) + 0.3 * r(t, 80.6, 81.0) * (1 - r(t, 81.4, 81.7)) : 0, shadow: 1 - Math.min(0.8, lift / 400)};
};
const carPt = (c: St, lx: number, ly: number) => {
	const a = (c.rot * Math.PI) / 180, px = (lx - 510) * S * c.fx, py = (ly - 170) * S * c.fy;
	return {x: c.x + px * Math.cos(a) - py * Math.sin(a), y: c.y + px * Math.sin(a) + py * Math.cos(a)};
};
const carT = (c: St) => `translate(${c.x} ${c.y}) rotate(${c.rot}) scale(${S * c.fx} ${S * c.fy}) translate(-510 -170)`;

const CAMK = [
	// t, dx, dy (offset from the smoothed car centre), zoom, roll
	[0, -180, 60, 1.0, -20], [1.3, -120, 110, 1.05, -10], [2.6, -60, 150, 1.25, -2], [T.freeze, 0, 20, 1.7, 0], [7.7, 0, 20, 1.8, 0], [13.2, 20, 40, 1.68, 0],
	[18.4, 20, 50, 1.55, 0], [T.thaw, 40, 160, 1.25, 0], [24.9, 60, 380, 0.82, 0], [T.go, -80, 250, 1.0, 0], [T.launch, -100, 80, 1.4, 0], [32.2, 0, 0, 1.9, 0],
	[36.0, 0, 0, 2.0, 0], [40.4, -60, -40, 1.6, 0], [T.land, -150, -100, 1.4, 0], [T.jump, -250, -150, 1.1, 0], [46.6, -100, 380, 1.0, 0], [T.jland, -200, -120, 1.4, 0],
	[51.6, -300, -100, 1.6, 0], [T.stop, -120, -120, 1.7, 0], [T.gas, 0, -40, 1.9, 0], [64.2, 40, -60, 1.7, 0], [72.1, 100, -110, 1.45, 0], [T.drop, 120, -140, 1.2, 0], [80.5, 140, -300, 0.85, 0], [82.6, 160, -420, 0.72, 0],
];
const camAt = (t: number) => {
	let sx = 0, sy = 0;
	const N = 9;
	for (let i = 0; i < N; i++) { const c = carAt(t + (i - 4) * 0.12); sx += c.x; sy += c.y; }
	const [dx, dy, z, roll] = smooth(CAMK, t);
	return {cx: sx / N + dx, cy: sy / N + dy, z, roll};
};
/** focus mode: the world falls back while a principle is taken apart */
const focusAt = (t: number) => Math.max(
	r(t, T.freeze, T.freeze + 0.6) * (1 - r(t, 21.2, 22.8)),
	r(t, 31.8, 32.5) * (1 - r(t, 39.8, 40.8)),
	0.75 * r(t, 45.3, 45.9) * (1 - r(t, 47.8, 48.6)),
	r(t, T.gas, T.gas + 0.6) * (1 - r(t, 61.4, 62.4)),
);

/* ---------------- world ---------------- */
const Course: React.FC = () => {
	const R = C.r + C.band, topO = CEIL - C.band;
	const arcBand = `M ${C.cx} ${GROUND} A ${C.r} ${C.r} 0 0 0 ${C.cx} ${CEIL} L ${C.cx} ${topO} A ${R} ${R} 0 0 1 ${C.cx} ${C.cy + R} Z`;
	const flatBand = `M ${C.lipX} ${CEIL} L ${C.cx + 1} ${CEIL} L ${C.cx + 1} ${topO} L ${C.lipX} ${topO} Z`;
	const ribs: React.ReactNode[] = [];
	for (let d = 90; d >= -90; d -= 8) { const a = (d * Math.PI) / 180; ribs.push(<line key={d} x1={C.cx + C.r * Math.cos(a)} y1={C.cy + C.r * Math.sin(a)} x2={C.cx + R * Math.cos(a)} y2={C.cy + R * Math.sin(a)} stroke="rgba(20,26,36,0.5)" strokeWidth={3} />); }
	for (let x = C.cx - 80; x > C.lipX; x -= 80) ribs.push(<line key={'f' + x} x1={x} y1={CEIL} x2={x} y2={topO} stroke="rgba(20,26,36,0.5)" strokeWidth={3} />);
	const beamY = topO - 300, lt = C.lipX - 260, rt = C.cx + R + 120;
	const tower = (x: number) => {
		const parts: React.ReactNode[] = [<rect key="a" x={x} y={beamY} width={10} height={GROUND - beamY} />, <rect key="b" x={x + 70} y={beamY} width={10} height={GROUND - beamY} />];
		for (let y = beamY, i = 0; y < GROUND; y += 80, i++) parts.push(<line key={i} x1={x + 5} y1={y} x2={x + 75} y2={y + 80} stroke="#1b2738" strokeWidth={5} />, <line key={'r' + i} x1={x + 75} y1={y} x2={x + 5} y2={y + 80} stroke="#1b2738" strokeWidth={5} />);
		return <g key={x}>{parts}</g>;
	};
	return (
		<g>
			<defs>
				<radialGradient id="cband" cx={C.cx} cy={C.cy} r={R} gradientUnits="userSpaceOnUse"><stop offset={(C.r - 2) / R} stopColor={K.steelHi} /><stop offset={(C.r + 14) / R} stopColor={K.steel} /><stop offset="1" stopColor={K.steelDk} /></radialGradient>
				<linearGradient id="cflat" x1="0" y1={topO} x2="0" y2={CEIL} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={K.steelDk} /><stop offset={1 - 14 / C.band} stopColor={K.steel} /><stop offset="1" stopColor={K.steelHi} /></linearGradient>
			</defs>
			<g fill="#1b2738">{tower(lt)}{tower(rt)}<rect x={lt} y={beamY} width={rt - lt + 80} height={30} />{[C.lipX + 150, C.lipX + 550, C.lipX + 950].map((x) => <rect key={x} x={x - 5} y={beamY + 20} width={10} height={topO - beamY - 20} />)}</g>
			<path d={arcBand} fill="url(#cband)" /><path d={flatBand} fill="url(#cflat)" />{ribs}
			<path d={`M ${C.cx} ${GROUND} A ${C.r} ${C.r} 0 0 0 ${C.cx} ${CEIL} L ${C.lipX} ${CEIL}`} fill="none" stroke="#f3f7fb" strokeWidth={3} opacity={0.9} />
			<path d={`M ${C.cx} ${GROUND - 6} A ${C.r - 6} ${C.r - 6} 0 0 0 ${C.cx} ${CEIL + 6} L ${C.lipX} ${CEIL + 6}`} fill="none" stroke={K.amber} strokeWidth={4} strokeDasharray="40 34" opacity={0.75} />
			<rect x={C.lipX - 4} y={topO} width={8} height={C.band} fill={K.amber} />
		</g>
	);
};
const Stars: React.FC = () => {
	const R = rng(5);
	return <g>{Array.from({length: 160}, (_, i) => <circle key={i} cx={-9000 + R() * 12000} cy={-1700 + R() * 1900} r={1.2 + R() * 2.2} fill="#eaf2ff" opacity={0.25 + R() * 0.55} />)}</g>;
};

/* the air, drawn as flow in car-local space (inverted car on the ceiling: local +y points at the ceiling) */
const BODY_TOP: [number, number][] = [[30, 150], [230, 112], [440, 62], [642, 112], [930, 168], [996, 210]];
const topAt = (x: number) => { for (let i = 0; i < BODY_TOP.length - 1; i++) { const [a, b] = BODY_TOP[i], [c, d] = BODY_TOP[i + 1]; if (x >= a && x <= c) return b + ((d - b) * (x - a)) / (c - a); } return 230; };
const AirFlow: React.FC<{t: number; thin: number; push: number; o: number}> = ({t, thin, push, o}) => {
	const R = rng(41), dots: React.ReactNode[] = [];
	for (let i = 0; i < 260; i++) {
		const x = -300 + R() * 1600, y0 = -560 + R() * 520, ph = R(), sz = R();
		if (x > 20 && x < 1000 && y0 > topAt(x) - 10) continue;
		const y = y0 + ((t * 40 * push + ph * 120) % 120) - 60;
		const fall = Math.max(0, Math.min(1, 1.25 - Math.hypot((x - 510) / 800, (y + 120) / 480)));
		if (fall <= 0) continue;
		dots.push(<g key={i} opacity={fall * (0.45 + sz * 0.5)}><circle cx={x} cy={y} r={12 + sz * 8} fill={K.air} opacity={0.12} /><circle cx={x} cy={y} r={3.5 + sz * 3} fill="#eaf6ff" /></g>);
	}
	const lines = [60, 200, 340, 500, 660, 800, 940].map((x, i) => {
		const top = topAt(x) - 26, bot = -560;
		const sway = 18 * Math.sin(i * 1.7);
		return (
			<path key={i} d={`M ${x + sway} ${bot} C ${x - sway} ${bot + 180}, ${x + sway} ${top - 160}, ${x} ${top}`} stroke="url(#flowG)" strokeWidth={7} fill="none" strokeLinecap="round"
				strokeDasharray="60 46" strokeDashoffset={-t * 220 * push - i * 30} opacity={push} />
		);
	});
	const gap = Array.from({length: 22}, (_, i) => {
		const k = rng(i + 90); const yy = 238 + k() * 48, len = 60 + k() * 80;
		const x = 990 - ((t * 520 * thin + k() * 950) % 950);
		return <line key={i} x1={x} y1={yy} x2={x + len} y2={yy} stroke="#9fe2ff" strokeWidth={5} strokeLinecap="round" opacity={0.85 * thin} />;
	});
	return (
		<g opacity={o}>
			<defs><linearGradient id="flowG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={K.amber} stopOpacity="0.95" /><stop offset="1" stopColor={K.amber} stopOpacity="0" /></linearGradient></defs>
			{dots}{lines}
			<rect x={40} y={232} width={950} height={56} rx={20} fill="#061426" opacity={0.55 * thin} />
			{gap}
		</g>
	);
};

/* glass read-out card */
const Card: React.FC<{x: number; y: number; w?: number; o: number; title?: string; children: React.ReactNode}> = ({x, y, w = 560, o, title, children}) => o > 0.001 ? (
	<div style={{position: 'absolute', left: x, top: y, width: w, opacity: Math.min(1, o), transform: `translateY(${(1 - Math.min(1, o)) * 18}px) scale(${mix(Math.min(1, o), 0.96, 1)})`, transformOrigin: 'left top',
		background: 'linear-gradient(160deg, rgba(24,40,70,0.72), rgba(10,18,36,0.62))', border: '1.5px solid rgba(191,227,255,0.32)', borderRadius: 26, padding: '24px 32px 26px',
		boxShadow: '0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', fontFamily: SANS, color: K.ink}}>
		{title && <div style={{fontSize: 40, fontWeight: 800, color: K.xray, letterSpacing: '0.04em', marginBottom: 14}}>{title}</div>}
		{children}
	</div>
) : null;
const Bar: React.FC<{label: string; val: string; frac: number; col: string; p: number}> = ({label, val, frac, col, p}) => (
	<div style={{marginBottom: 16}}>
		<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 44, fontWeight: 800}}><span>{label}</span><span style={{color: col, fontWeight: 900}}>{val}</span></div>
		<div style={{height: 22, borderRadius: 11, background: 'rgba(191,227,255,0.14)', marginTop: 10}}><div style={{height: '100%', width: `${Math.max(0.02, frac * p) * 100}%`, borderRadius: 11, background: col, boxShadow: `0 0 18px ${col}`}} /></div>
	</div>
);

/* ---------------- film ---------------- */
export const Film27c: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const c = carAt(t), cam = camAt(t), fo = focusAt(t);
	const onCeil = t < T.launch && t >= T.top - 0.5;
	const thin = r(t, 10.56, 12.4) * (1 - r(t, 21.5, 23.0));
	const push = r(t, 13.17, 13.8, EZ.out) * (1 - r(t, 21.5, 23.0));
	const airO = r(t, 7.6, 8.4) * (1 - r(t, 21.8, 23.2));
	const scan = t > T.freeze - 0.1 && t < T.freeze + 0.8 ? r(t, T.freeze, T.freeze + 0.55) : -1;
	const fly = t >= T.launch && t < T.land;
	const parked = t >= T.stop;
	const jdir = c.fy > 0 ? 90 + c.rot : -90 + c.rot;
	const sl = (px: number) => px / cam.z;
	const world = `translate(${W / 2} ${H / 2}) rotate(${cam.roll}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`;
	const ccx = W / 2 + (c.x - cam.cx) * cam.z, ccy = H / 2 + (c.y - cam.cy) * cam.z; // car on screen (roll ≈ 0 whenever focus is on)
	const title = r(t, T.freeze, T.freeze + 0.4, Easing.bezier(0.2, 1.4, 0.4, 1)) * (1 - r(t, 7.3, 7.8));
	const speed = Math.min(60, 60 * r(t, 51.6, 52.5, EZ.lin));
	const gas = 1 - r(t, 57.2, 60.6, EZ.io) * 0.82;
	const mark = r(t, 0.4, 1.0) * (1 - r(t, END_AT - 0.5, END_AT));
	return (
		<AbsoluteFill style={{background: '#0b1324'}}>
			{/* background world: dims and softens in focus mode */}
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, filter: fo > 0.01 ? `blur(${fo * 3.5}px) saturate(${1 - fo * 0.35})` : undefined}}>
				<defs>
					<linearGradient id="csky" x1="0" y1="-1800" x2="0" y2="880" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#070d1c" /><stop offset="0.5" stopColor={K.skyTop} /><stop offset="0.82" stopColor={K.skyMid} /><stop offset="0.96" stopColor={K.skyLow} /><stop offset="1" stopColor={K.glow} /></linearGradient>
					<linearGradient id="cgnd" x1="0" y1="880" x2="0" y2="1600" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#2a313c" /><stop offset="0.1" stopColor={K.ground} /><stop offset="1" stopColor="#12171e" /></linearGradient>
				</defs>
				<g transform={world}>
					<rect x={-10000} y={-2000} width={13500} height={2881} fill="url(#csky)" />
					<Stars />
					<rect x={-10000} y={880} width={13500} height={900} fill="url(#cgnd)" />
					{[0, -1700, -3400, -5100, -6800, -8500].map((dx) => <Horizon key={dx} hy={880} dx={dx} />)}
					<Course />
					<rect x={-10000} y={GROUND + 3} width={13500} height={900} fill="url(#cgnd)" />
					<rect x={-10000} y={GROUND} width={C.cx + 10000} height={4} fill="#d9e1ea" opacity={0.3} />
					{Array.from({length: 40}, (_, i) => <rect key={i} x={-9800 + i * 300} y={GROUND + 70} width={150} height={8} fill="#d9e1ea" opacity={0.14} />)}
					<Flood id="cf1" sx={1000} sy={1010} tx={1100} ty={CEIL + 60} spread={0.2} motes={90} t={t} />
					<Flood id="cf2" sx={-2200} sy={1020} tx={-2800} ty={300} spread={0.26} motes={70} t={t} o={0.85} />
					<Flood id="cf3" sx={-6800} sy={1020} tx={-7400} ty={700} spread={0.3} motes={60} t={t} o={0.9} />
					<Lineup x={-3700} y={GROUND + 2} s={1.0} />
				</g>
			</svg>
			{/* focus wash: deep blue, a pool of light on the car, a faint drafting grid */}
			{fo > 0.01 && (
				<AbsoluteFill style={{opacity: fo, background: `radial-gradient(760px 520px at ${ccx}px ${ccy}px, rgba(30,70,120,0.10), rgba(6,14,30,0.62) 70%, rgba(4,9,20,0.82) 100%)`}}>
					<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.5}}>
						{Array.from({length: 25}, (_, i) => <line key={`v${i}`} x1={i * 80 - ((cam.cx * cam.z * 0.3) % 80)} y1={0} x2={i * 80 - ((cam.cx * cam.z * 0.3) % 80)} y2={H} stroke={K.xray} strokeWidth={1} opacity={0.08} />)}
						{Array.from({length: 15}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 80 - ((cam.cy * cam.z * 0.3) % 80)} x2={W} y2={i * 80 - ((cam.cy * cam.z * 0.3) % 80)} stroke={K.xray} strokeWidth={1} opacity={0.08} />)}
					</svg>
				</AbsoluteFill>
			)}
			{/* foreground: the car and everything explained on it */}
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<g transform={world}>
					{onCeil && fo > 0.01 && (
						<g opacity={fo}>
							{/* re-draw the strip of ceiling the car hangs from, crisp */}
							<rect x={c.x - 900} y={CEIL - C.band} width={1800} height={C.band} fill="url(#cflat)" />
							<rect x={c.x - 900} y={CEIL - 3} width={1800} height={3} fill="#f3f7fb" />
						</g>
					)}
					{(t > T.jland && t < T.stop) && Array.from({length: 14}, (_, i) => {
						const k = rng(i + 3); const yy = c.y - 120 + k() * 260; const len = 200 + k() * 400; const dir = t < 3 ? 1 : 1;
						return <line key={i} x1={c.x + dir * (260 + k() * 300)} y1={yy} x2={c.x + dir * (260 + k() * 300 + len)} y2={yy} stroke="#e8f1ff" strokeWidth={2.5} opacity={0.22} strokeLinecap="round" />;
					})}
					{onCeil && airO > 0 && <g transform={carT(c)}><AirFlow t={t} thin={thin} push={push} o={airO} /></g>}
					{c.jets > 0.02 && Math.abs(c.fy) > 0.45 && NOZZLES.slice(0, 4).map(([lx, ly], i) => {
						const q = carPt(c, lx, ly);
						return <Plume key={i} id={`cj${i}`} x={q.x} y={q.y} a={jdir + (i - 1.5) * 3} L={(170 + i * 15) * (0.55 + 0.45 * c.jets)} w={0.25} o={c.jets * Math.min(1, (Math.abs(c.fy) - 0.45) * 3)} seed={i + (f % 5)} />;
					})}
					{c.top > 0.02 && [[250, 108], [720, 140]].map(([lx, ly], i) => {
						const q = carPt(c, lx, ly);
						return <Plume key={i} id={`ct${i}`} x={q.x} y={q.y} a={(c.fy > 0 ? -90 : 90) + c.rot + (i ? 20 : -20)} L={170} w={0.24} o={c.top} seed={i + 7 + (f % 4)} />;
					})}
					{/* glow under the car in focus */}
					{fo > 0.01 && <ellipse cx={c.x} cy={c.y} rx={560 * S * 1.2} ry={240 * S * 1.2} fill={K.xray} opacity={0.10 * fo} style={{filter: 'blur(30px)'}} />}
					<Car id="ccar" x={c.x} y={c.y} s={S} rot={c.rot} fx={c.fx} fy={c.fy} py={170} spin={c.spin} fanSpin={t * 900} xray={c.xray} fan={onCeil ? c.xray : 0}
						tanks={fly || parked ? 1 : 0} tankN={fly ? 5 * r(t, 32.0, 34.0, EZ.lin) : 5} nozzles={fly || parked ? c.xray : 0} nozN={fly ? 6 * r(t, 37.1, 38.6, EZ.lin) : 6} shadow={c.shadow} />
					{scan >= 0 && (() => { const a = carPt(c, 1010 - scan * 1020, -40), b = carPt(c, 1010 - scan * 1020, 310); return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e6f7ff" strokeWidth={sl(5)} opacity={Math.sin(Math.PI * scan)} style={{filter: 'drop-shadow(0 0 8px #7fd1ff)'}} />; })()}
					{onCeil && (() => {
						const fan = carPt(c, 510, 218), gp = carPt(c, 300, 262), out = carPt(c, 900, -380);
						const o1 = pop(t, 7.73) * (1 - r(t, 21.4, 22.2)), o2 = pop(t, 10.56) * (1 - r(t, 21.4, 22.2)), o3 = pop(t, 13.17) * (1 - r(t, 21.4, 22.2));
						return (
							<g>
								{o1 > 0.01 && <g opacity={Math.min(1, o1)}><circle cx={fan.x} cy={fan.y} r={sl(40) * Math.min(1, o1)} fill="none" stroke={K.xray} strokeWidth={sl(4)} /><path d={`M ${fan.x + sl(44)} ${fan.y} L ${c.x + sl(470)} ${fan.y}`} stroke={K.xray} strokeWidth={sl(3)} /><Lab x={c.x + sl(490)} y={fan.y + sl(16)} anchor="start" size={sl(46)} col={K.xray} scrim={0.45}>风扇</Lab></g>}
								{o2 > 0.01 && <g opacity={Math.min(1, o2)}><path d={`M ${gp.x} ${gp.y} L ${c.x - sl(470)} ${gp.y}`} stroke="#9fe2ff" strokeWidth={sl(3)} /><Lab x={c.x - sl(490)} y={gp.y + sl(16)} anchor="end" size={sl(42)} col="#9fe2ff" scrim={0.45}>车底：空气少</Lab></g>}
								{o3 > 0.01 && <Lab x={out.x} y={out.y} size={sl(42)} col={K.amber} o={Math.min(1, o3)} scrim={0.45}>外面：空气多</Lab>}
							</g>
						);
					})()}
					{fly && (() => {
						const tk = carPt(c, 520, 196), nz = carPt(c, 905, 232);
						const dn = c.fy > 0 ? 1 : -1;
						const o1 = r(t, 32.1, 32.6, EZ.out) * (1 - r(t, 34.2, 34.6)), o2 = r(t, 37.2, 37.7, EZ.out) * (1 - r(t, 39.6, 40.1));
						return (
							<g>
								{o1 > 0.01 && <g opacity={o1}><path d={`M ${tk.x} ${tk.y} L ${tk.x} ${tk.y - dn * sl(110)}`} stroke={K.frost} strokeWidth={sl(3)} /><Lab x={tk.x} y={tk.y - dn * sl(130)} size={sl(44)} col={K.frost} scrim={0.45}>高压气瓶 ×5</Lab></g>}
								{o2 > 0.01 && <g opacity={o2}><path d={`M ${nz.x} ${nz.y} L ${nz.x - sl(40)} ${nz.y + dn * sl(110)}`} stroke={K.amber} strokeWidth={sl(3)} /><Lab x={nz.x - sl(60)} y={nz.y + dn * sl(160)} size={sl(44)} col={K.amber} scrim={0.45}>喷口</Lab></g>}
							</g>
						);
					})()}
				</g>
			</svg>
			{/* read-outs */}
			<Card x={60} y={440} w={520} o={pop(t, 15.79, 0.45) * (1 - r(t, 21.4, 22.2))} title="谁在托住它">
				<Bar label="外面空气往上推" val="≈40吨" frac={1} col={K.amber} p={r(t, 15.8, 16.8, EZ.out)} />
				<Bar label="车重" val="≈2吨" frac={0.05} col={K.frost} p={r(t, 16.4, 16.9, EZ.out)} />
			</Card>
			<Card x={1360} y={440} w={500} o={pop(t, 18.39, 0.45) * (1 - r(t, 21.4, 22.2))} title="车底的空气">
				<div style={{fontSize: 44, fontWeight: 700}}>只比外面少</div>
				<div style={{fontSize: 150, fontWeight: 900, color: K.amber, lineHeight: 1.0, textShadow: `0 0 30px rgba(255,181,71,0.35)`}}>约5%</div>
			</Card>
			<Card x={110} y={760} w={1060} o={r(t, 21.0, 21.6, EZ.out) * (1 - r(t, 26.6, 27.4))}>
				<div style={{fontSize: 44, fontWeight: 700, color: K.mute}}>2026.10.15 · 美国得州 · SpaceX 测试场</div>
			</Card>
			{['3', '2', '1'].map((n, i) => {
				const a = 29.47 + i * 0.65, o = pop(t, a, 0.25) * (1 - r(t, a + 0.5, a + 0.65));
				return o > 0.01 ? <div key={n} style={{position: 'absolute', left: 1360, top: 470, width: 300, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 240, color: K.amber, opacity: Math.min(1, o), transform: `scale(${mix(Math.min(1, o), 1.4, 1)})`, textShadow: '0 6px 30px rgba(4,8,16,0.8)'}}>{n}</div> : null;
			})}
			<Card x={1250} y={150} w={580} o={pop(t, 46.6, 0.45) * (1 - r(t, 48.4, 49.0))} title="特斯拉的说法">
				<Bar label="轮胎抓地力" val="1×" frac={0.22} col={K.frost} p={r(t, 46.7, 47.2, EZ.out)} />
				<Bar label="喷气推力" val="4–5×" frac={1} col={K.amber} p={r(t, 46.9, 47.8, EZ.out)} />
			</Card>
			<Card x={1240} y={140} w={600} o={r(t, 51.4, 51.8, EZ.out) * (1 - r(t, 55.8, 56.5))} title="0 → 60 英里/时（≈97 km/h）">
				<div style={{fontSize: 170, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(speed)}<span style={{fontSize: 56, marginLeft: 12}}>mph</span></div>
				<div style={{fontSize: 52, fontWeight: 900, color: K.amber, marginTop: 8, opacity: r(t, 52.5, 52.8)}}>不到1秒 <span style={{fontSize: 40, color: K.mute, fontWeight: 600}}>（特斯拉称）</span></div>
			</Card>
			<Card x={1240} y={140} w={600} o={r(t, T.gas, T.gas + 0.5, EZ.out) * (1 - r(t, 61.2, 61.9))} title="气瓶剩余">
				<div style={{height: 34, borderRadius: 17, background: 'rgba(191,227,255,0.14)'}}><div style={{height: '100%', width: `${gas * 100}%`, borderRadius: 17, background: gas < 0.35 ? K.red : K.frost, boxShadow: `0 0 18px ${gas < 0.35 ? K.red : K.frost}`}} /></div>
				<div style={{fontSize: 44, fontWeight: 800, marginTop: 18, opacity: r(t, 59.2, 59.7)}}>飞多高、飞多久：<span style={{color: K.amber}}>没公布</span></div>
			</Card>
			<Card x={110} y={130} w={1060} o={pop(t, 61.8, 0.45) * (1 - r(t, 71.6, 72.4))} title="三个版本">
				{[['Performance', '能倒挂，不会飞 · 定金5万美元', 66.8], ['Thrust', '车尾喷气，加速更猛', 62.4], ['Rocket', '会"飞" · 单座 · 仅邀请 · 不能上路', 61.8]].map(([n, d, a], i) => (
					<div key={i} style={{whiteSpace: 'nowrap', opacity: r(t, a as number, (a as number) + 0.35) * (i === 2 || t >= 66.8 ? 1 : 0.55), marginBottom: 10}}>
						<span style={{fontSize: 48, fontWeight: 900, color: i === 2 ? K.amber : K.ink}}>{n}</span>
						<span style={{fontSize: 40, fontWeight: 700, color: i === 2 && t >= 64.2 ? K.red : K.mute, marginLeft: 18}}>{d}</span>
					</div>
				))}
			</Card>
			{t > 69.2 && t < 74.8 && (
				<div style={{position: 'absolute', right: 120, top: 190, transform: `rotate(-6deg) scale(${mix(pop(t, 69.45, 0.3), 1.6, 1)})`, opacity: Math.min(1, pop(t, 69.45, 0.3) * 1.5) * (1 - r(t, 74.0, 74.6)), border: `6px solid ${K.amber}`, borderRadius: 16, padding: '6px 30px', background: 'rgba(10,16,28,0.6)', fontFamily: SANS, fontWeight: 900, fontSize: 72, color: K.amber}}>2028年才量产</div>
			)}
			{title > 0.01 && (
				<div style={{position: 'absolute', left: 120, top: 600, fontFamily: SANS, fontWeight: 900, color: '#fff', textShadow: '0 4px 30px rgba(8,14,26,0.85)', opacity: Math.min(1, title), transform: `scale(${mix(Math.min(1, title), 1.15, 1)})`, transformOrigin: 'left center'}}>
					<div style={{fontSize: 96}}>凭什么</div>
					<div style={{fontSize: 128, marginTop: -6}}>能开上<span style={{color: K.amber}}>天花板</span>？</div>
				</div>
			)}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(4,8,16,0.45) 100%)', pointerEvents: 'none'}} />
			<Sequence from={Math.round(END_AT * FPS)}><EndCard v={{id: 'ep27', src: '', title: '凭什么能开上天花板？', kicker: '', tagline: '', taglineEn: '', motif: 'bars', card: [T.freeze, 7.7], extend: 0, question: '这车要是真卖了，你敢坐吗？', sources: '来源：TechCrunch、Fox Business、Electrek、Benzinga 2026.10；“约”为估算', duration: 0}} cfg={{videos: []}} dur={Math.round((FILM_END - END_AT) * FPS)} /></Sequence>
			{t < END_AT && <Sub t={subAt(t)} />}
			<div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: '#f3ede2'}}>{JUNO.mark}</div>
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM27C" component={Film27c} durationInFrames={Math.round(FILM_END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
