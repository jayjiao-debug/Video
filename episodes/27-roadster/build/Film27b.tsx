import React from 'react';
import {AbsoluteFill, Audio, Composition, Easing, interpolate, registerRoot, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {K, W, H, SANS, Air, Sub, Lab, rng} from './kit27';
import {Car, Plume, NOZZLES} from './Car27';
import {Flood, Horizon, Lineup} from './World27';
import {EndCard} from '../brand/Brand';
import {JUNO} from '../brand/identity';
import LINES from './lines27b.json';

/* ep27 v2 · one take. The car runs the whole test site; every principle is explained ON the car, in real time:
   time slows / freezes, the car turns x-ray where it matters, then the run continues.
   Music: owner's track from 0:00, film ends 100.06 (fade over the last bar 97.45–100.06).
   Sections used: groove 0–21.0 · hush 21.0–28.8 · groove 28.8–69.45 (accents 39.0, 54.2, 66.8) · hush 69.45–77.25 · drop 77.25 */
export const FPS = 30, FILM_END = 100.06, END_AT = 93.5;

const EZ = {io: Easing.bezier(0.65, 0, 0.35, 1), out: Easing.bezier(0.16, 1, 0.3, 1), in: Easing.bezier(0.7, 0, 0.84, 0), lin: (x: number) => x};
const r = (t: number, a: number, b: number, e = EZ.io) => interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (p: number, a: number, b: number) => a + (b - a) * p;
const pop = (t: number, a: number, d = 0.35) => r(t, a, a + d, Easing.bezier(0.2, 1.5, 0.4, 1));
/** piecewise-linear map through [t, v] points */
const pw = (t: number, pts: [number, number][]) => interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const subAt = (t: number) => {
	for (const [s, e, x] of LINES as [number, number, string][]) if (t >= s && t < e) return x;
	return '';
};
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
const S = 0.45, WB = 285 * S; // car scale; half wheelbase in world px
const C = {cx: 1500, cy: 340, r: 600, band: 70, lipX: 300};
const GROUND = C.cy + C.r, CEIL = C.cy - C.r; // 940, −260
const SAG = C.r - Math.sqrt(C.r * C.r - WB * WB); // wheel chord sits this far inside the arc: both wheels touch, nothing clips
const LAND_X = -1000, KICK_X = -1700, JUMP_TO = -3900, RUN_TO = -7600, PARK_X = -8000;
const HALF = (292 - 170) * S; // wheel line → car centre

type St = {x: number; y: number; rot: number; fx: number; fy: number; spin: number; jets: number; top: number; xray: number; shadow: number};
/** wheel-line midpoint + rotation → car centre */
const fromWheel = (wx: number, wy: number, rot: number, fy = 1) => {
	const a = (rot * Math.PI) / 180;
	return {x: wx + Math.sin(a) * HALF * fy, y: wy - Math.cos(a) * HALF * fy};
};
const base: St = {x: 0, y: 0, rot: 0, fx: 1, fy: 1, spin: 0, jets: 0, top: 0, xray: 0, shadow: 1};
const carAt = (t: number): St => {
	if (t < 3.3) { // charging the ramp
		const x = mix(r(t, 0, 3.3, Easing.bezier(0.4, 0, 1, 1)), -1100, C.cx);
		return {...base, ...fromWheel(x, GROUND, 0), spin: x * 1.2};
	}
	if (t < 6.5) { // up the wall and over: on the arc, wheel chord inset by SAG
		const th = 90 - 180 * ((t - 3.3) / 3.2);
		const a = (th * Math.PI) / 180, rr = C.r - SAG;
		const rot = th - 90;
		return {...base, ...fromWheel(C.cx + rr * Math.cos(a), C.cy + rr * Math.sin(a), rot), rot, spin: 2600 + (t - 3.3) * 900, shadow: 0};
	}
	if (t < 39.0) { // along the ceiling: brake into the freeze, creep through the explanation, then floor it to the lip
		const x = pw(t, [[6.5, C.cx], [10.56, 1120], [21.0, 1090], [28.8, 1010], [39.0, C.lipX]]);
		const xx = t >= 28.8 ? mix(r(t, 28.8, 39.0, Easing.bezier(0.5, 0, 0.9, 0.9)), 1010, C.lipX) : t >= 6.5 && t < 10.56 ? mix(r(t, 6.5, 10.56, EZ.out), C.cx, 1120) : x;
		return {...base, ...fromWheel(xx, CEIL, 180), rot: 180, spin: 5500 - xx * 1.2, shadow: 0, xray: r(t, 10.56, 11.1) * (1 - r(t, 22.0, 23.5))};
	}
	if (t < 51.6) { // off the lip: push away, roll in slow motion, brake with the jets, land
		const u = pw(t, [[39.0, 0], [41.4, 0.27], [49.1, 0.72], [51.6, 1]]);
		const fy = u < 0.3 ? -1 : u > 0.6 ? 1 : -Math.cos((Math.PI * (u - 0.3)) / 0.3);
		const y0 = CEIL + HALF, y1 = GROUND - HALF;
		return {...base, x: mix(u, C.lipX, LAND_X), y: y0 + (y1 - y0) * u * u, fx: -1, fy, spin: 6000 + u * 300,
			jets: Math.max(1 - r(u, 0.05, 0.2), r(u, 0.74, 0.8) * (1 - r(u, 0.97, 1))), top: r(u, 0.3, 0.36) * (1 - r(u, 0.55, 0.6)),
			xray: r(t, 41.2, 41.8) * (1 - r(t, 50.3, 51.2)), shadow: r(u, 0.85, 1)};
	}
	if (t < 54.2) { const x = mix(r(t, 51.6, 54.2, EZ.lin), LAND_X, KICK_X); return {...base, ...fromWheel(x, GROUND, 0), fx: -1, spin: -x}; }
	if (t < 59.2) { // jump the line-up, slow at the top
		const u = pw(t, [[54.2, 0], [55.4, 0.3], [58.0, 0.7], [59.2, 1]]);
		const w = fromWheel(mix(u, KICK_X, JUMP_TO), GROUND - 720 * Math.sin(Math.PI * u), 0);
		return {...base, ...w, rot: 9 * Math.cos(Math.PI * u), fx: -1, spin: 1800 + u * 400, jets: 0.6 + 0.4 * Math.max(1 - r(u, 0, 0.2), r(u, 0.8, 0.95)), shadow: 1 - Math.sin(Math.PI * u)};
	}
	if (t < 67.6) { const x = mix(r(t, 59.2, 67.6, Easing.bezier(0.5, 0, 0.2, 1)), JUMP_TO, PARK_X); return {...base, ...fromWheel(x, GROUND, 0), fx: -1, spin: -x}; }
	// parked: x-ray for the gas, a last little hop on 86.6
	const hop = Math.sin(Math.PI * r(t, 86.6, 88.0, EZ.lin));
	return {...base, ...fromWheel(PARK_X, GROUND - 150 * hop, 0), fx: -1, spin: -PARK_X, xray: r(t, 69.6, 70.3) * (1 - r(t, 76.8, 77.6)), jets: hop > 0.01 ? 0.9 : 0, shadow: 1 - hop * 0.6};
};
/** world point of a car-local point */
const carPt = (c: St, lx: number, ly: number) => {
	const a = (c.rot * Math.PI) / 180, px = (lx - 510) * S * c.fx, py = (ly - 170) * S * c.fy;
	return {x: c.x + px * Math.cos(a) - py * Math.sin(a), y: c.y + px * Math.sin(a) + py * Math.cos(a)};
};
const carT = (c: St) => `translate(${c.x} ${c.y}) rotate(${c.rot}) scale(${S * c.fx} ${S * c.fy}) translate(-510 -170)`;

/* camera: follows a smoothed car centre plus keyed offset / zoom / roll */
const CAMK = [
	// t, dx, dy, zoom, roll   (offset from the smoothed car centre)
	[0, 200, -60, 1.9, 0], [2.6, 300, -100, 1.3, 0], [3.6, 100, -200, 0.85, -6], [5.0, -80, 0, 0.78, -14], [6.5, -150, 150, 0.9, -4], [8.4, -40, 120, 1.4, 0],
	[10.56, 0, 110, 1.75, 0], [13.2, 0, 130, 1.75, 0], [18.4, 60, 150, 1.6, 0], [21.0, 40, 170, 1.35, 0], [24.9, 60, 380, 0.8, 0], [28.8, -60, 250, 1.0, 0],
	[33.0, -120, 120, 1.4, 0], [36.4, -100, 60, 1.6, 0], [39.0, -80, 60, 1.5, 0], [41.4, 0, 0, 1.9, 0], [45.0, 0, 0, 2.0, 0], [49.1, -60, -40, 1.6, 0], [51.6, -150, -100, 1.4, 0],
	[54.2, -250, -150, 1.1, 0], [56.6, -100, 380, 1.0, 0], [59.2, -200, -120, 1.4, 0], [62.0, -300, -100, 1.6, 0], [66.8, -120, -120, 1.7, 0],
	[69.45, 0, -40, 1.9, 0], [77.25, 0, -60, 1.7, 0], [84.0, 150, -150, 1.3, 0], [90.0, 160, -420, 0.75, 0], [93.6, 160, -520, 0.62, 0],
];
const camAt = (t: number) => {
	let sx = 0, sy = 0;
	const N = 9;
	for (let i = 0; i < N; i++) { const c = carAt(t + (i - (N - 1) / 2) * 0.12); sx += c.x; sy += c.y; }
	const [dx, dy, z, roll] = smooth(CAMK, t);
	return {cx: sx / N + dx, cy: sy / N + dy, z, roll};
};

/* ---------------- world pieces ---------------- */
const Course: React.FC = () => {
	const R = C.r + C.band, topO = CEIL - C.band;
	const arcBand = `M ${C.cx} ${GROUND} A ${C.r} ${C.r} 0 0 0 ${C.cx} ${CEIL} L ${C.cx} ${topO} A ${R} ${R} 0 0 1 ${C.cx} ${C.cy + R} Z`;
	const flatBand = `M ${C.lipX} ${CEIL} L ${C.cx + 1} ${CEIL} L ${C.cx + 1} ${topO} L ${C.lipX} ${topO} Z`;
	const ribs: React.ReactNode[] = [];
	for (let d = 90; d >= -90; d -= 8) {
		const a = (d * Math.PI) / 180;
		ribs.push(<line key={d} x1={C.cx + C.r * Math.cos(a)} y1={C.cy + C.r * Math.sin(a)} x2={C.cx + R * Math.cos(a)} y2={C.cy + R * Math.sin(a)} stroke="rgba(20,26,36,0.5)" strokeWidth={3} />);
	}
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
				<radialGradient id="cband" cx={C.cx} cy={C.cy} r={R} gradientUnits="userSpaceOnUse">
					<stop offset={(C.r - 2) / R} stopColor={K.steelHi} /><stop offset={(C.r + 14) / R} stopColor={K.steel} /><stop offset="1" stopColor={K.steelDk} />
				</radialGradient>
				<linearGradient id="cflat" x1="0" y1={topO} x2="0" y2={CEIL} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor={K.steelDk} /><stop offset={1 - 14 / C.band} stopColor={K.steel} /><stop offset="1" stopColor={K.steelHi} />
				</linearGradient>
			</defs>
			<g fill="#1b2738">
				{tower(lt)}{tower(rt)}
				<rect x={lt} y={beamY} width={rt - lt + 80} height={30} />
				{[C.lipX + 150, C.lipX + 550, C.lipX + 950].map((x) => <rect key={x} x={x - 5} y={beamY + 20} width={10} height={topO - beamY - 20} />)}
			</g>
			<path d={arcBand} fill="url(#cband)" />
			<path d={flatBand} fill="url(#cflat)" />
			{ribs}
			<path d={`M ${C.cx} ${GROUND} A ${C.r} ${C.r} 0 0 0 ${C.cx} ${CEIL} L ${C.lipX} ${CEIL}`} fill="none" stroke="#f3f7fb" strokeWidth={3} opacity={0.9} />
			<path d={`M ${C.cx} ${GROUND - 6} A ${C.r - 6} ${C.r - 6} 0 0 0 ${C.cx} ${CEIL + 6} L ${C.lipX} ${CEIL + 6}`} fill="none" stroke={K.amber} strokeWidth={4} strokeDasharray="40 34" opacity={0.75} />
			<rect x={C.lipX - 4} y={topO} width={8} height={C.band} fill={K.amber} />
		</g>
	);
};

/** air around the inverted car, drawn in car-local space: thin in the gap under the floor, streaming out of the exhaust */
const BODY_TOP: [number, number][] = [[30, 150], [230, 112], [440, 62], [642, 112], [930, 168], [996, 210]];
const topAt = (x: number) => { for (let i = 0; i < BODY_TOP.length - 1; i++) { const [a, b] = BODY_TOP[i], [c, d] = BODY_TOP[i + 1]; if (x >= a && x <= c) return b + ((d - b) * (x - a)) / (c - a); } return 999; };
const CarAir: React.FC<{t: number; thin: number; o: number}> = ({t, thin, o}) => {
	const R = rng(77), out: React.ReactNode[] = [];
	for (let i = 0; i < 900; i++) {
		const px = R(), py = R(), pr = R(), keep = R();
		const x = -260 + px * 1520;
		let y = -420 + py * 712; // −420 … 292 (292 = the ceiling)
		const inGap = x > 40 && x < 990 && y > 228;
		if (inGap) {
			if (keep > mix(thin, 1, 0.12)) continue;
			const xs = ((x - 40 - t * 260 * thin) % 950 + 950) % 950 + 40; // drifting to the rear, out of the exhaust
			out.push(<circle key={i} cx={xs} cy={y} r={3 + pr * 3} fill={K.xray} opacity={0.85} />);
			continue;
		}
		if (x > 30 && x < 996 && y > topAt(x) - 6 && y < 236) continue; // inside the body
		y += Math.sin(t * 1.3 + px * 40) * 5;
		const fall = Math.max(0, Math.min(1, 1.35 - Math.hypot((x - 510) / 760, (y - 40) / 440)));
		if (fall <= 0) continue;
		out.push(<circle key={i} cx={x + Math.cos(t + py * 30) * 5} cy={y} r={3 + pr * 3.5} fill={K.air} opacity={0.75 * (0.4 + pr * 0.6) * fall} />);
	}
	return <g opacity={o}>{out}</g>;
};

const HUD: React.FC<{children: React.ReactNode; x: number; y: number; o: number; w?: number}> = ({children, x, y, o, w = 520}) => o > 0.001 ? (
	<div style={{position: 'absolute', left: x, top: y, width: w, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, fontFamily: SANS, color: K.ink}}>{children}</div>
) : null;
const Bar: React.FC<{label: string; val: string; frac: number; col: string; p: number}> = ({label, val, frac, col, p}) => (
	<div style={{marginBottom: 18}}>
		<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 44, fontWeight: 800, textShadow: '0 2px 12px rgba(4,8,16,0.9)'}}><span>{label}</span><span style={{color: col, fontWeight: 900}}>{val}</span></div>
		<div style={{height: 26, borderRadius: 13, background: 'rgba(191,227,255,0.16)', marginTop: 8}}><div style={{height: '100%', width: `${frac * p * 100}%`, borderRadius: 13, background: col}} /></div>
	</div>
);

/* ---------------- the film ---------------- */
export const Film27b: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const c = carAt(t);
	const cam = camAt(t);
	const onCeil = t >= 6.5 && t < 39.0;
	const thin = r(t, 13.3, 15.4) * (1 - r(t, 22.5, 24.5));
	const airO = r(t, 12.9, 13.6) * (1 - r(t, 23.0, 24.6));
	const arrows = pop(t, 15.79, 0.5) * (1 - r(t, 22.0, 23.0));
	const scan = t > 10.4 && t < 11.3 ? r(t, 10.56, 11.1, EZ.io) : -1;
	const fly = t >= 39.0 && t < 51.6;
	const jdirDown = c.fy > 0 ? 90 + c.rot : -90 + c.rot;
	const tanksN = fly ? 5 * r(t, 41.4, 43.4, EZ.lin) : t >= 69 ? 5 * (1 - 0) : 0;
	const gas = t >= 69.45 ? 1 - r(t, 70.2, 74.4, EZ.io) * 0.82 : 1;
	const title = r(t, 10.56, 10.95, Easing.bezier(0.2, 1.4, 0.4, 1)) * (1 - r(t, 12.7, 13.2));
	const speed = t >= 59.2 && t < 67.6 ? Math.min(60, 60 * r(t, 61.8, 62.7, EZ.lin)) : 0;
	const mark = r(t, 0.6, 1.2) * (1 - r(t, END_AT - 0.5, END_AT));
	const sl = (px: number) => px / cam.z; // keep in-world labels at a constant screen size
	return (
		<AbsoluteFill style={{background: '#0d1628'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="bsky" x1="0" y1="-1600" x2="0" y2="880" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#0b1324" /><stop offset="0.5" stopColor={K.skyTop} /><stop offset="0.8" stopColor={K.skyMid} /><stop offset="0.96" stopColor={K.skyLow} /><stop offset="1" stopColor={K.glow} />
					</linearGradient>
					<linearGradient id="bgnd" x1="0" y1="880" x2="0" y2="1600" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#2a313c" /><stop offset="0.1" stopColor={K.ground} /><stop offset="1" stopColor="#12171e" />
					</linearGradient>
				</defs>
				<g transform={`translate(${W / 2} ${H / 2}) rotate(${cam.roll}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>
					<rect x={-10000} y={-1800} width={13500} height={2681} fill="url(#bsky)" />
					<rect x={-10000} y={880} width={13500} height={900} fill="url(#bgnd)" />
					{[0, -1700, -3400, -5100, -6800, -8500].map((dx) => <Horizon key={dx} hy={880} dx={dx} />)}
					<Course />
					<rect x={-10000} y={GROUND + 3} width={13500} height={900} fill="url(#bgnd)" />
					<rect x={-10000} y={GROUND} width={C.cx + 10000} height={4} fill="#d9e1ea" opacity={0.3} />
					{Array.from({length: 40}, (_, i) => <rect key={i} x={-9800 + i * 300} y={GROUND + 70} width={150} height={8} fill="#d9e1ea" opacity={0.14} />)}
					<Flood id="bf1" sx={1000} sy={1010} tx={1100} ty={CEIL + 60} spread={0.2} motes={110} t={t} />
					<Flood id="bf2" sx={-2200} sy={1020} tx={-2800} ty={300} spread={0.26} motes={90} t={t} o={0.85} />
					<Flood id="bf3" sx={-7300} sy={1020} tx={-8000} ty={700} spread={0.3} motes={70} t={t} o={0.9} />
					<Lineup x={-3700} y={GROUND + 2} s={1.0} />
					{/* speed streaks on the hard runs */}
					{(t < 3.3 || (t > 59.2 && t < 66.8)) && Array.from({length: 14}, (_, i) => {
						const k = rng(i + 3); const yy = c.y - 120 + k() * 260; const len = 200 + k() * 400;
						return <line key={i} x1={c.x + (c.fx > 0 ? -1 : 1) * (260 + k() * 300)} y1={yy} x2={c.x + (c.fx > 0 ? -1 : 1) * (260 + k() * 300 + len)} y2={yy} stroke="#e8f1ff" strokeWidth={2.5} opacity={0.25 * (t < 3.3 ? r(t, 0.3, 1.5) : 1)} strokeLinecap="round" />;
					})}
					{/* air around the car while it hangs (real-time breakdown 1) */}
					{onCeil && airO > 0 && <g transform={carT(c)}><CarAir t={t} thin={thin} o={airO} /></g>}
					{/* jets */}
					{c.jets > 0.02 && Math.abs(c.fy) > 0.45 && NOZZLES.slice(0, 4).map(([lx, ly], i) => {
						const q = carPt(c, lx, ly);
						return <Plume key={i} id={`bj${i}`} x={q.x} y={q.y} a={jdirDown + (i - 1.5) * 3} L={(170 + i * 15) * (0.55 + 0.45 * c.jets)} w={0.25} o={c.jets * Math.min(1, (Math.abs(c.fy) - 0.45) * 3)} seed={i + (f % 5)} />;
					})}
					{c.top > 0.02 && [[250, 108], [720, 140]].map(([lx, ly], i) => {
						const q = carPt(c, lx, ly);
						return <Plume key={i} id={`bt${i}`} x={q.x} y={q.y} a={(c.fy > 0 ? -90 : 90) + c.rot + (i ? 20 : -20)} L={170} w={0.24} o={c.top} seed={i + 7 + (f % 4)} />;
					})}
					<Car id="bcar" x={c.x} y={c.y} s={S} rot={c.rot} fx={c.fx} fy={c.fy} py={170} spin={c.spin} fanSpin={t * 900} xray={c.xray} fan={onCeil ? c.xray : 0} tanks={fly || t >= 69 ? 1 : 0} tankN={tanksN} nozzles={fly || t >= 69 ? c.xray : 0} nozN={fly ? 6 * r(t, 44.0, 45.4, EZ.lin) : 6} shadow={c.shadow} />
					{scan >= 0 && (() => { const a = carPt(c, 1000 - scan * 1000, -40), b = carPt(c, 1000 - scan * 1000, 300); return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#dff4ff" strokeWidth={sl(5)} opacity={Math.sin(Math.PI * scan)} />; })()}
					{/* pressure arrows: room-side air pushing the car into the ceiling */}
					{onCeil && arrows > 0.01 && [180, 510, 840].map((lx, i) => {
						const p0 = carPt(c, lx, -360), p1 = carPt(c, lx, -130 - (1 - arrows) * 120);
						const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x), hx = Math.cos(ang), hy = Math.sin(ang), w = sl(16);
						return (
							<g key={i} opacity={Math.min(1, arrows)}>
								<line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={K.amber} strokeWidth={w} strokeLinecap="round" />
								<path d={`M ${p1.x - hx * sl(46) - hy * sl(34)} ${p1.y - hy * sl(46) + hx * sl(34)} L ${p1.x + hx * sl(8)} ${p1.y + hy * sl(8)} L ${p1.x - hx * sl(46) + hy * sl(34)} ${p1.y - hy * sl(46) - hx * sl(34)}`} stroke={K.amber} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" fill="none" />
							</g>
						);
					})}
					{onCeil && (() => {
						const o = pop(t, 13.17) * (1 - r(t, 15.4, 15.9)), fan = carPt(c, 510, 218), g = carPt(c, 300, 262);
						const o2 = pop(t, 14.0) * (1 - r(t, 22.0, 22.8));
						return (
							<g>
								{o > 0.01 && <g opacity={Math.min(1, o)}><circle cx={fan.x} cy={fan.y} r={sl(46) * o} fill="none" stroke={K.xray} strokeWidth={sl(4)} /><Lab x={fan.x} y={fan.y - sl(70)} size={sl(50)} col={K.xray}>风扇</Lab></g>}
								{o2 > 0.01 && <Lab x={g.x - sl(10)} y={g.y + sl(-4)} size={sl(36)} col={K.xray} o={Math.min(1, o2)} anchor="middle">← 空气被抽走</Lab>}
							</g>
						);
					})()}
					{fly && (() => {
						const tk = carPt(c, 520, 210), nz = carPt(c, 905, 232);
						const o1 = r(t, 41.4, 41.9, EZ.out) * (1 - r(t, 43.9, 44.3)), o2 = r(t, 44.0, 44.5, EZ.out) * (1 - r(t, 46.4, 46.8));
						return (
							<g>
								<Lab x={tk.x} y={tk.y + sl(c.fy > 0 ? 90 : -70)} size={sl(46)} col={K.frost} o={o1}>高压气瓶</Lab>
								<Lab x={nz.x} y={nz.y + sl(c.fy > 0 ? 90 : -70)} size={sl(46)} col={K.amber} o={o2}>喷口</Lab>
							</g>
						);
					})()}
					{/* the jump: tire grip vs thrust */}
					{t > 55.2 && t < 58.6 && (() => {
						const o = pop(t, 56.6) * (1 - r(t, 58.0, 58.6)), w0 = carPt(c, 220, 300);
						return (
							<g opacity={Math.min(1, o)}>
								{NOZZLES.slice(0, 4).map(([lx, ly], i) => { const q = carPt(c, lx, ly + 40); return <path key={i} d={`M ${q.x} ${q.y + sl(150)} L ${q.x} ${q.y + sl(20)}`} stroke={K.amber} strokeWidth={sl(14)} strokeLinecap="round" />; })}
								<Lab x={w0.x - sl(120)} y={w0.y + sl(230)} size={sl(44)} col={K.amber}>喷气推力 ≈ 轮胎的4–5倍</Lab>
								<Lab x={w0.x - sl(120)} y={w0.y + sl(290)} size={sl(32)} weight={600} col={K.mute}>（特斯拉的说法）</Lab>
							</g>
						);
					})()}
				</g>
			</svg>
			{/* breakdown 1 read-outs */}
			<HUD x={110} y={620} o={pop(t, 18.39, 0.4) * (1 - r(t, 23.6, 24.4))} w={640}>
				<Bar label="外面空气往上推" val="≈40吨" frac={1} col={K.amber} p={r(t, 18.39, 19.2, EZ.out)} />
				<Bar label="车重" val="≈2吨" frac={0.05} col={K.frost} p={r(t, 19.0, 19.5, EZ.out)} />
			</HUD>
			<HUD x={1240} y={170} o={pop(t, 21.0, 0.4) * (1 - r(t, 23.6, 24.4))} w={600}>
				<div style={{fontSize: 44, fontWeight: 800, textShadow: '0 2px 12px rgba(4,8,16,0.9)'}}>车底的空气，只比外面少</div>
				<div style={{fontSize: 150, fontWeight: 900, color: K.amber, lineHeight: 1.05, textShadow: '0 4px 24px rgba(4,8,16,0.8)'}}>约5%</div>
			</HUD>
			{/* gas gauge (hush 2) */}
			<HUD x={1240} y={180} o={r(t, 69.6, 70.2, EZ.out) * (1 - r(t, 76.8, 77.4))} w={560}>
				<div style={{fontSize: 44, fontWeight: 800, textShadow: '0 2px 12px rgba(4,8,16,0.9)'}}>气瓶剩余</div>
				<div style={{height: 34, borderRadius: 17, background: 'rgba(191,227,255,0.16)', marginTop: 12}}><div style={{height: '100%', width: `${gas * 100}%`, borderRadius: 17, background: gas < 0.35 ? K.red : K.frost}} /></div>
				<div style={{fontSize: 40, fontWeight: 700, color: K.mute, marginTop: 14, opacity: r(t, 72.1, 72.6)}}>飞多高、飞多久：没公布</div>
			</HUD>
			{/* 0–60 */}
			<HUD x={1280} y={160} o={r(t, 61.6, 62.0, EZ.out) * (1 - r(t, 66.4, 67.2))} w={560}>
				<div style={{fontSize: 40, fontWeight: 700, color: K.mute}}>0 → 60 英里/时（≈97 km/h）</div>
				<div style={{fontSize: 160, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(speed)}<span style={{fontSize: 56, marginLeft: 12}}>mph</span></div>
				<div style={{fontSize: 52, fontWeight: 900, color: K.amber, opacity: r(t, 62.7, 63.0)}}>不到1秒 <span style={{fontSize: 36, color: K.mute, fontWeight: 600}}>（特斯拉称）</span></div>
			</HUD>
			{/* the three versions + date, on the drop */}
			<HUD x={110} y={150} o={pop(t, 77.25, 0.4) * (1 - r(t, 89.6, 90.4))} w={1100}>
				{[['Performance', '能倒挂，不会飞', 77.25], ['Thrust', '车尾喷气，加速更猛', 77.9], ['Rocket', '会"飞"·单座·仅邀请·不能上路', 78.55]].map(([n, d, a], i) => (
					<div key={i} style={{whiteSpace: 'nowrap', opacity: r(t, a as number, (a as number) + 0.3), marginBottom: 14, textShadow: '0 2px 12px rgba(4,8,16,0.9)'}}>
						<span style={{fontSize: 48, fontWeight: 900, color: i === 2 ? K.amber : K.ink}}>{n}</span>
						<span style={{fontSize: 38, fontWeight: 700, color: K.mute, marginLeft: 18}}>{d}</span>
					</div>
				))}
			</HUD>
			{t > 82 && t < 90.5 && (
				<div style={{position: 'absolute', right: 120, top: 180, transform: `rotate(-6deg) scale(${mix(pop(t, 82.25, 0.3), 1.6, 1)})`, opacity: Math.min(1, pop(t, 82.25, 0.3) * 1.5) * (1 - r(t, 89.6, 90.4)), border: `6px solid ${K.amber}`, borderRadius: 16, padding: '6px 30px', background: 'rgba(10,16,28,0.55)', fontFamily: SANS, fontWeight: 900, fontSize: 68, color: K.amber}}>2028年才量产</div>
			)}
			{/* date tag in the hush */}
			<HUD x={110} y={96} o={r(t, 24.9, 25.4, EZ.out) * (1 - r(t, 30.5, 31.2))} w={1200}>
				<div style={{fontSize: 44, fontWeight: 700, color: K.mute, textShadow: '0 2px 16px rgba(8,12,20,0.9)'}}>2026.10.15 · 美国得州 · SpaceX 测试场</div>
			</HUD>
			{/* countdown to the lip */}
			{['3', '2', '1'].map((n, i) => {
				const a = 36.4 + i * 0.65, o = pop(t, a, 0.25) * (1 - r(t, a + 0.5, a + 0.65));
				return o > 0.01 && <div key={n} style={{position: 'absolute', left: 1380, top: 520, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 240, color: K.amber, opacity: Math.min(1, o), transform: `scale(${mix(Math.min(1, o), 1.4, 1)})`, textShadow: '0 6px 30px rgba(4,8,16,0.8)'}}>{n}</div>;
			})}
			{title > 0.01 && (
				<div style={{position: 'absolute', left: 120, top: 600, fontFamily: SANS, fontWeight: 900, color: '#fff', textShadow: '0 4px 30px rgba(8,14,26,0.85)', opacity: Math.min(1, title), transform: `scale(${mix(Math.min(1, title), 1.15, 1)})`, transformOrigin: 'left center'}}>
					<div style={{fontSize: 96}}>凭什么</div>
					<div style={{fontSize: 128, marginTop: -6}}>能开上<span style={{color: K.amber}}>天花板</span>？</div>
				</div>
			)}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(4,8,16,0.5) 100%)', pointerEvents: 'none'}} />
			<Sequence from={Math.round(END_AT * FPS)}><EndCard v={{id: 'ep27', src: '', title: '凭什么能开上天花板？', kicker: '', tagline: '', taglineEn: '', motif: 'bars', card: [10.56, 13.2], extend: 0, question: '这车要是真卖了，你敢坐吗？', sources: '来源：TechCrunch、Fox Business、Electrek、Benzinga 2026.10；“约”为估算', duration: 0}} cfg={{videos: []}} dur={Math.round((FILM_END - END_AT) * FPS)} /></Sequence>
			{t < END_AT && <Sub t={subAt(t)} />}
			<div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: '#f3ede2'}}>{JUNO.mark}</div>
			<Audio src={staticFile('ep27_bgm.mp3')} />
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM27B" component={Film27b} durationInFrames={Math.round(FILM_END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
