import React from 'react';
import {AbsoluteFill, Audio, Composition, Easing, interpolate, registerRoot, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {K, W, H, SANS, Air, Sub, Lab} from './kit27';
import {Car, Plume, NOZZLES} from './Car27';
import {CURL, CEIL_Y, Curl, Flood, Horizon, Lineup} from './World27';
import {EndCard} from '../brand/Brand';
import {JUNO} from '../brand/identity';
import LINES from './lines27.json';

/* ep27 《这辆车，凭什么能开上天花板？》 · look "看得见的空气" · music: owner's track, 139.2 s, ~92 bpm, untouched.
   Sections: groove 0–21.0 · hush 21.0–28.8 · groove 28.8–69.45 · breakdown 69.45–77.25 · drop 77.25 · outro fade 126–139. */
export const FPS = 30, FILM_END = 139.2, END_AT = 123.74;

const EZ = {io: Easing.bezier(0.65, 0, 0.35, 1), out: Easing.bezier(0.16, 1, 0.3, 1), in: Easing.bezier(0.7, 0, 0.84, 0), cam: Easing.bezier(0.45, 0, 0.55, 1), lin: (x: number) => x};
const r = (t: number, a: number, b: number, e = EZ.io) => interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (p: number, a: number, b: number) => a + (b - a) * p;
/** scene envelope: fade in over [a, a+fi], out over [b-fo, b] */
const env = (t: number, a: number, b: number, fi = 0.8, fo = 0.8) => r(t, a, a + fi) * (1 - r(t, b - fo, b));
const rise = (p: number): React.CSSProperties => ({opacity: p, transform: `translateY(${(1 - p) * 24}px)`});
const subAt = (t: number) => {
	for (const [s, e, x] of LINES as [number, number, string][]) if (t >= s && t < e) return x;
	return '';
};
/** smooth path through keys [t, ...values] (cubic Hermite, finite-difference tangents) */
const track = (keys: number[][], t: number) => {
	if (t <= keys[0][0]) return keys[0].slice(1);
	const n = keys.length;
	if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
	let i = 0;
	while (keys[i + 1][0] < t) i++;
	const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(n - 1, i + 2)];
	const h = k2[0] - k1[0], u = (t - k1[0]) / h;
	const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
	return k1.slice(1).map((_, j) => {
		const v1 = k1[j + 1], v2 = k2[j + 1];
		const m1 = i === 0 ? 0 : ((v2 - k0[j + 1]) / (k2[0] - k0[0])) * h * 0.85;
		const m2 = i + 2 >= n ? 0 : ((k3[j + 1] - v1) / (k3[0] - k1[0])) * h * 0.85;
		return h00 * v1 + h10 * m1 + h01 * v2 + h11 * m2;
	});
};
const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, ...style}}>{children}</svg>;

/* ================= the site world: one continuous place for 0–54 s and 77–82 s ================= */
const S = 0.5, HALF = 122 * S; // car scale on site; pivot = car centre (local y 170), 122 local px above the wheel line
const GROUND = 940, SEG_A = 1330, SEG_B = Math.PI * CURL.r, SEG_C = CURL.cx - CURL.lipX, D = SEG_A + SEG_B + SEG_C;
type CarState = {x: number; y: number; rot: number; fx: number; fy: number; spin: number; jets: number; xray: number; shadow: number};
/** route: ground (x −150 → 1180) → up the quarter-pipe → along the ceiling to the lip. Returns the wheel-contact point. */
const route = (d: number) => {
	if (d <= SEG_A) return {x: -150 + d, y: GROUND, rot: 0};
	if (d <= SEG_A + SEG_B) {
		const th = 90 - ((d - SEG_A) / CURL.r) * (180 / Math.PI);
		const a = (th * Math.PI) / 180;
		return {x: CURL.cx + CURL.r * Math.cos(a), y: CURL.cy + CURL.r * Math.sin(a), rot: th - 90};
	}
	return {x: CURL.cx - (d - SEG_A - SEG_B), y: CEIL_Y, rot: 180};
};
const centre = (p: {x: number; y: number; rot: number}) => {
	const a = (p.rot * Math.PI) / 180;
	return {x: p.x + Math.sin(a) * HALF, y: p.y - Math.cos(a) * HALF};
};
const D_HANG = SEG_A + SEG_B + (CURL.cx - 900), D_CREEP = SEG_A + SEG_B + (CURL.cx - 700);
const LAND_X = -120, JUMP_X = -420, JUMP_TO = -2700, STOP_X = -2850;
const carAt = (t: number): CarState => {
	const base = {fx: 1, fy: 1, jets: 0, xray: 0, shadow: 1};
	if (t >= 77) { const c = centre(route(SEG_A + SEG_B + (CURL.cx - 760))); return {...base, ...c, rot: 180, spin: 0}; }
	if (t < 39.0) {
		let d: number;
		if (t < 15.2) d = D_HANG;
		else if (t < 26.0) d = mix(r(t, 15.2, 26.0, EZ.io), D_HANG, D_CREEP);
		else if (t < 28.8) d = mix(r(t, 26.0, 28.4, EZ.io), D_CREEP, 0);
		else if (t < 32.0) d = mix(r(t, 28.8, 32.0, Easing.bezier(0.5, 0, 0.9, 1)), 0, SEG_A);
		else if (t < 35.2) d = mix((t - 32.0) / 3.2, SEG_A, SEG_A + SEG_B);
		else d = mix(r(t, 35.2, 39.0, Easing.bezier(0.3, 0.3, 0.6, 1)), SEG_A + SEG_B, D);
		const p = route(d);
		return {...base, ...centre(p), rot: p.rot, spin: d * 0.9, shadow: p.y === GROUND ? 1 : 0};
	}
	if (t < 42.2) { // off the lip, barrel roll (seen from the side: the car flips top-for-bottom), land
		const u = (t - 39.0) / 3.2;
		const fy = u < 0.15 ? -1 : u > 0.65 ? 1 : -Math.cos((Math.PI * (u - 0.15)) / 0.5);
		const y0 = CEIL_Y + HALF, y1 = GROUND - HALF;
		return {...base, x: mix(u, CURL.lipX, LAND_X), y: y0 + (y1 - y0) * u * u, rot: 0, fx: -1, fy, spin: 600 + u * 400,
			jets: Math.max(1 - r(t, 39.0, 39.9), r(t, 41.1, 41.6) * (1 - r(t, 41.9, 42.4))), shadow: r(t, 41.6, 42.2)};
	}
	if (t < 45.4) { const x = mix(r(t, 42.2, 45.4, Easing.bezier(0.3, 0, 0.7, 1)), LAND_X, JUMP_X); return {...base, x, y: GROUND - HALF, rot: 0, fx: -1, spin: -x * 0.9}; }
	if (t < 48.5) { // the jump over the line-up
		const u = (t - 45.4) / 3.1;
		return {...base, x: mix(u, JUMP_X, JUMP_TO), y: GROUND - HALF - 560 * Math.sin(Math.PI * u), rot: 10 * Math.cos(Math.PI * u), fx: -1, spin: 1400 + u * 600,
			jets: 0.55 + 0.45 * Math.max(1 - r(u, 0, 0.25), r(u, 0.75, 0.95)), shadow: 1 - Math.sin(Math.PI * u)};
	}
	const x = mix(r(t, 48.5, 49.6, EZ.out), JUMP_TO, STOP_X);
	return {...base, x, y: GROUND - HALF, rot: 0, fx: -1, spin: -x * 0.9, xray: r(t, 49.4, 50.2), jets: 0};
};
/** world point of a car-local point */
const carPt = (c: CarState, lx: number, ly: number, s = S) => {
	const a = (c.rot * Math.PI) / 180, px = (lx - 510) * s * c.fx, py = (ly - 170) * s * c.fy;
	return {x: c.x + px * Math.cos(a) - py * Math.sin(a), y: c.y + px * Math.sin(a) + py * Math.cos(a)};
};
const CAM = [
	[0, 1300, 880, 1.9], [4.6, 880, 380, 1.45], [9.9, 860, 420, 1.3], [15.2, 860, 500, 1.08], [21.0, 960, 540, 1.0], [26.0, 900, 560, 0.94],
	[28.8, 900, 560, 0.92], [35.2, 900, 530, 0.95], [39.0, 560, 560, 0.95], [42.2, 0, 600, 0.88], [45.4, -800, 620, 0.9], [47.0, -1560, 600, 0.88],
	[49.2, -2620, 760, 1.0], [50.8, -2850, 930, 1.5], [54.4, -2850, 930, 1.62],
	[77.0, 760, 330, 1.7], [82.4, 900, 500, 1.05],
];
const SiteWorld: React.FC<{t: number}> = ({t}) => {
	const c = carAt(t);
	const [cx, cy, z] = track(t >= 77 ? CAM.slice(15) : CAM.slice(0, 15), t);
	const jetsAt = c.jets > 0.02 && Math.abs(c.fy) > 0.45;
	const jdir = c.fy > 0 ? 90 + c.rot : -90 + c.rot;
	const lab = r(t, 50.0, 50.7, EZ.out) * (1 - r(t, 53.6, 54.3));
	const fan = carPt(c, 510, 218), noz = carPt(c, 905, 232);
	return (
		<Svg>
			<defs>
				<linearGradient id="fsky" x1="0" y1="-1400" x2="0" y2="880" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#0d1628" /><stop offset="0.45" stopColor={K.skyTop} /><stop offset="0.75" stopColor={K.skyMid} />
					<stop offset="0.95" stopColor={K.skyLow} /><stop offset="1" stopColor={K.glow} />
				</linearGradient>
				<linearGradient id="fgnd" x1="0" y1="880" x2="0" y2="1500" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#2a313c" /><stop offset="0.12" stopColor={K.ground} /><stop offset="1" stopColor="#141920" />
				</linearGradient>
			</defs>
			<g transform={`translate(${W / 2} ${H / 2}) scale(${z}) translate(${-cx} ${-cy})`}>
				<rect x={-4200} y={-1400} width={7600} height={2281} fill="url(#fsky)" />
				<ellipse cx={1200} cy={880} rx={1400} ry={90} fill="#ffbe8c" opacity={0.18} />
				<rect x={-4200} y={880} width={7600} height={700} fill="url(#fgnd)" />
				<Horizon hy={880} />
				<Horizon hy={880} dx={-2000} />
				<Horizon hy={880} dx={-3700} />
				<Curl id="fc" />
				<rect x={-4200} y={GROUND + 4} width={7600} height={700} fill="url(#fgnd)" />
				<rect x={-4200} y={GROUND} width={CURL.cx + 4200} height={5} fill="#d9e1ea" opacity={0.3} />
				{[-3600, -2200, -800].map((x) => <rect key={x} x={x} y={GROUND + 60} width={260} height={8} fill="#d9e1ea" opacity={0.12} />)}
				<Flood id="ff1" sx={1500} sy={990} tx={760} ty={CEIL_Y + 80} spread={0.17} motes={150} t={t} />
				<Flood id="ff2" sx={-1300} sy={1010} tx={-1560} ty={380} spread={0.26} motes={120} t={t} o={0.9} />
				<Lineup x={-2400} y={GROUND + 2} s={0.92} />
				{/* the jump's arc, drawn as the car flies it */}
				{t > 45.2 && t < 50 && <path d={`M ${JUMP_X} ${GROUND - 60} Q ${(JUMP_X + JUMP_TO) / 2} ${GROUND - 1180} ${JUMP_TO} ${GROUND - 60}`} stroke={K.amber} strokeWidth={4} strokeDasharray="6 22" strokeLinecap="round" fill="none"
					opacity={0.55 * r(t, 45.4, 46.0) * (1 - r(t, 49.0, 49.8))} pathLength={1} style={{strokeDasharray: `${0.006} ${0.022}`}} />}
				{jetsAt && NOZZLES.slice(0, 4).map(([lx, ly], i) => {
					const q = carPt(c, lx, ly);
					return <Plume key={i} id={`fp${i}`} x={q.x} y={q.y} a={jdir + (i - 1.5) * 3} L={(160 + i * 18) * (0.6 + 0.4 * c.jets)} w={0.24} o={c.jets * Math.min(1, (Math.abs(c.fy) - 0.45) * 3)} seed={i + Math.floor(t * 10) % 5} />;
				})}
				<Car id="fcar" x={c.x} y={c.y} s={S} rot={c.rot} fx={c.fx} fy={c.fy} py={170} spin={c.spin} xray={c.xray} fan={c.xray} tanks={0} shadow={c.shadow} />
				{lab > 0 && (
					<g opacity={lab}>
						<path d={`M ${fan.x} ${fan.y + 6} L ${fan.x} ${fan.y + 60}`} stroke={K.xray} strokeWidth={2.5} />
						<Lab x={fan.x} y={fan.y + 100} size={34} col={K.xray}>风扇 → 吸住</Lab>
						<path d={`M ${noz.x} ${noz.y + 6} L ${noz.x - 60} ${noz.y + 60}`} stroke={K.amber} strokeWidth={2.5} />
						<Lab x={noz.x - 120} y={noz.y + 100} size={34} col={K.amber}>喷口 → 飞</Lab>
					</g>
				)}
			</g>
		</Svg>
	);
};

/* ================= the phone and its column of air (CSS 3D) ================= */
const PhoneScene: React.FC<{t: number}> = ({t}) => {
	const pw = 380, pd = 780;
	const ch = 2000 * r(t, 54.5, 56.8, EZ.out), ch2 = 1300 * r(t, 60.8, 62.6, EZ.out);
	const lift = r(t, 60.6, 61.8), tableO = 1 - r(t, 60.6, 61.6);
	const ry = mix(r(t, 54.2, 66.8, EZ.lin), -36, -26), oy = mix(lift, 700, 600);
	const face = (w: number, h: number, up: boolean): React.CSSProperties => ({position: 'absolute', width: w, height: h, top: up ? -h : 0, background: `linear-gradient(${up ? 0 : 180}deg, rgba(191,227,255,0.26), rgba(191,227,255,0.03) 85%)`, borderLeft: '2px solid rgba(191,227,255,0.55)', borderRight: '2px solid rgba(191,227,255,0.55)'});
	const dots = (seed: number, h: number, up: boolean) => (
		<svg width={pw} height={Math.max(1, h)} style={{position: 'absolute', inset: 0}}>
			<Air x={0} y={0} w={pw} h={Math.max(1, h)} n={Math.round(260 * h / 1000)} seed={seed} t={t} r={3.2} o={0.9} drift={[0, up ? 14 : -14]} density={(_, yy) => (up ? 0.15 + 0.85 * (yy / Math.max(1, h)) ** 2 : 0.15 + 0.85 * (1 - yy / Math.max(1, h)) ** 2)} />
		</svg>
	);
	const col = (h: number, up: boolean, sd: number) => h > 2 && (
		<>
			<div style={{...face(pw, h, up), left: -pw / 2, transform: `translateZ(${pd / 2}px)`}}>{dots(sd, h, up)}</div>
			<div style={{...face(pw, h, up), left: -pw / 2, transform: `translateZ(${-pd / 2}px)`}} />
			<div style={{...face(pd, h, up), left: -pd / 2, transform: `translateX(${-pw / 2}px) rotateY(90deg)`}} />
			<div style={{...face(pd, h, up), left: -pd / 2, transform: `translateX(${pw / 2}px) rotateY(90deg)`}}>{dots(sd + 3, h, up)}</div>
			<div style={{position: 'absolute', left: -pw / 2, top: up ? -h : 0, width: pw, height: h}}>{dots(sd + 7, h, up)}</div>
		</>
	);
	const a1 = r(t, 57.3, 58.0, EZ.out), a2 = r(t, 61.4, 62.2, EZ.out), eq = r(t, 63.9, 64.5, EZ.out);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #172640 0%, #2b4062 55%, #3a4a63 100%)'}}>
			<AbsoluteFill style={{background: 'radial-gradient(700px 500px at 45% 70%, rgba(255,214,170,0.26), rgba(255,214,170,0) 70%)'}} />
			<div style={{position: 'absolute', inset: 0, perspective: 1700, perspectiveOrigin: '50% 30%'}}>
				<div style={{position: 'absolute', left: 820, top: oy, transformStyle: 'preserve-3d', transform: `translateZ(-900px) rotateX(-28deg) rotateY(${ry}deg)`}}>
					<div style={{position: 'absolute', left: -1900, top: -1900, width: 3800, height: 3800, opacity: tableO, transform: 'translateY(14px) rotateX(90deg)',
						background: 'radial-gradient(1300px 1100px at 50% 50%, #8a6a52 0%, #5e4a3c 35%, #3b3029 70%, #2c2520 100%)'}} />
					<div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateY(${-90 * lift}px)`}}>
						<div style={{position: 'absolute', left: -pw / 2 - 6, top: -pd / 2 - 6, width: pw + 12, height: pd + 12, borderRadius: 64, background: '#0a0d12', transform: 'translateY(13px) rotateX(90deg)'}} />
						<div style={{position: 'absolute', left: -pw / 2, top: -pd / 2, width: pw, height: pd, borderRadius: 58, background: '#0d1117', transform: 'rotateX(90deg)', padding: 12, boxSizing: 'border-box'}}>
							<div style={{width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', position: 'relative', background: 'linear-gradient(160deg, #6fb6ff 0%, #4a63d8 55%, #2a2f7a 100%)'}}>
								<div style={{position: 'absolute', top: 18, left: '50%', marginLeft: -60, width: 120, height: 34, borderRadius: 17, background: '#000'}} />
								<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.85)'}}>10月16日 星期五</div>
								<div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 130, color: '#fff'}}>21:04</div>
								<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 40%)'}} />
							</div>
						</div>
						{col(ch, true, 5)}
						{col(ch2, false, 21)}
					</div>
				</div>
			</div>
			<Svg>
				{a1 > 0 && (
					<g opacity={a1}>
						<Lab x={1330} y={300} anchor="start" size={56}>上面这一柱空气</Lab>
						<text x={1320} y={450} style={{fontFamily: SANS, fontWeight: 900, fontSize: 140, paintOrder: 'stroke'}} stroke="rgba(8,12,20,0.5)" strokeWidth={8} fill={K.amber}>≈100<tspan style={{fontSize: 66}} dx={12}>公斤</tspan></text>
						<Lab x={1330} y={540} anchor="start" size={42} weight={600} col={K.mute} o={1 - a2}>一直通到大气层顶</Lab>
						<g transform={`translate(0 ${(1 - a1) * -40})`}>
							<path d="M 820 150 L 820 330" stroke={K.amber} strokeWidth={16} strokeLinecap="round" />
							<path d="M 778 300 L 820 352 L 862 300" stroke={K.amber} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
						</g>
					</g>
				)}
				{a2 > 0 && (
					<g opacity={a2}>
						<Lab x={1330} y={640} anchor="start" size={56}>下面的空气，也往上推</Lab>
						<text x={1320} y={780} style={{fontFamily: SANS, fontWeight: 900, fontSize: 110, paintOrder: 'stroke'}} stroke="rgba(8,12,20,0.5)" strokeWidth={8} fill={K.amber}>≈100<tspan style={{fontSize: 56}} dx={12}>公斤</tspan></text>
						<g transform={`translate(0 ${(1 - a2) * 40})`}>
							<path d="M 860 850 L 860 690" stroke={K.amber} strokeWidth={16} strokeLinecap="round" />
							<path d="M 818 720 L 860 668 L 902 720" stroke={K.amber} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
						</g>
					</g>
				)}
				{eq > 0 && (
					<g opacity={eq} transform={`translate(${380 - (1 - eq) * 30} 540)`}>
						<rect x={-150} y={-62} width={300} height={100} rx={50} fill="#0b1220" opacity={0.7} />
						<text x={0} y={8} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 60}} fill={K.ink}>抵消 ✓</text>
					</g>
				)}
			</Svg>
		</AbsoluteFill>
	);
};

/* ================= x-ray under the ceiling, then the 5 % board ================= */
const CeilScene: React.FC<{t: number}> = ({t}) => {
	const cy = 230, x = 960, rot = 180;
	const b = r(t, 71.8, 72.9, EZ.io);
	const s = mix(b, 1.25, 0.86) * mix(r(t, 66.8, 71.8, EZ.lin), 1.04, 1);
	const floorY = cy + (292 - 230) * s, half = 470 * s;
	const a = (rot * Math.PI) / 180;
	const rear = {x: x + (40 - 510) * s * Math.cos(a) - (204 - 292) * s * Math.sin(a), y: cy + (40 - 510) * s * Math.sin(a) + (204 - 292) * s * Math.cos(a)};
	const thin = mix(r(t, 67.0, 69.0), 1, 0.1);
	const arrows = r(t, 69.45, 70.3, EZ.out) * (1 - b);
	const lab1 = r(t, 67.6, 68.3, EZ.out) * (1 - b);
	const bar = r(t, 72.4, 73.8, EZ.io), slice = r(t, 74.7, 75.2, EZ.out);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #1b2d48 0%, #2d4566 55%, #3b5070 100%)'}}>
			<Svg>
				<defs>
					<linearGradient id="cceil" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={K.steelDk} /><stop offset="0.8" stopColor={K.steel} /><stop offset="1" stopColor={K.steelHi} />
					</linearGradient>
				</defs>
				<Air x={0} y={cy} w={W} h={H - cy} n={1700} seed={9} t={t - 60} r={2.1} o={mix(b, 0.6, 0.32)} density={(xx, yy) => (yy < floorY + 2 && Math.abs(xx - x) < half ? thin : 1)} />
				<rect x={x - half} y={cy} width={half * 2} height={floorY - cy} fill="#08101d" opacity={0.38 * (1 - thin) / 0.9} />
				<rect width={W} height={cy} fill="url(#cceil)" />
				{Array.from({length: 22}, (_, i) => <line key={i} x1={i * 92 + 20 - ((t * 6) % 92)} y1={0} x2={i * 92 + 20 - ((t * 6) % 92)} y2={cy} stroke="rgba(20,26,36,0.4)" strokeWidth={3} />)}
				<rect x={0} y={cy - 3} width={W} height={3} fill="#f3f7fb" opacity={0.9} />
				<Car id="ccar" x={x} y={cy} s={s} rot={rot} xray={1} fan={1} tanks={0} spin={t * 400} />
				<Plume id="cex" x={rear.x} y={rear.y} a={0} L={mix(b, 300, 200) * (0.4 + 0.6 * (1 - thin) / 0.9)} w={0.2} o={0.5} seed={Math.floor(t * 8) % 6 + 2} />
				{lab1 > 0 && (
					<g opacity={lab1}>
						<Lab x={x} y={130} size={50} weight={900} col={K.ink} scrim={0.6}>车底：空气被抽薄</Lab>
						<path d={`M ${x} 150 L ${x} ${cy + (floorY - cy) / 2}`} stroke={K.ink} strokeWidth={3} />
						<circle cx={x} cy={cy + (floorY - cy) / 2} r={7} fill={K.ink} />
					</g>
				)}
				{arrows > 0 && (
					<g opacity={arrows} transform={`translate(0 ${(1 - arrows) * 60})`}>
						{[460, 1460].map((ax) => (
							<g key={ax}>
								<path d={`M ${ax} 880 L ${ax} ${floorY + 250}`} stroke={K.amber} strokeWidth={18} strokeLinecap="round" />
								<path d={`M ${ax - 46} ${floorY + 296} L ${ax} ${floorY + 240} L ${ax + 46} ${floorY + 296}`} stroke={K.amber} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" fill="none" />
							</g>
						))}
						<Lab x={960} y={790} size={54}>外面的空气多，把车往上推</Lab>
					</g>
				)}
				{b > 0 && (
					<g opacity={b}>
						<Lab x={960} y={560} size={56}>车底约4平方米，空气能推约<tspan fill={K.amber}>40吨</tspan></Lab>
						<rect x={260} y={630} width={1400} height={90} rx={14} fill="none" stroke={K.air} strokeWidth={3} />
						<rect x={260} y={630} width={1400 * bar} height={90} rx={14} fill="#bfe3ff" opacity={0.28} />
						{Array.from({length: 19}, (_, i) => <line key={i} x1={260 + (i + 1) * 70} y1={634} x2={260 + (i + 1) * 70} y2={716} stroke={K.air} strokeWidth={1.5} opacity={0.35 * (bar * 20 > i + 1 ? 1 : 0)} />)}
						<Lab x={1660} y={790} anchor="end" size={40} weight={600} col={K.mute} o={bar}>每一格 = 2吨</Lab>
						{slice > 0 && (
							<g opacity={slice}>
								<rect x={260} y={630 - (1 - slice) * 40} width={70} height={90} rx={14} fill={K.amber} />
								<path d="M 295 730 L 295 770" stroke={K.amber} strokeWidth={4} />
								<Lab x={275} y={830} anchor="start" size={52}>车重约2吨 = <tspan fill={K.amber} style={{fontSize: 80, fontWeight: 900}}>5%</tspan></Lab>
							</g>
						)}
					</g>
				)}
			</Svg>
		</AbsoluteFill>
	);
};

/* ================= balloon → tanks → nozzles → hop ================= */
const TankScene: React.FC<{t: number}> = ({t}) => {
	const x = 1120, gy = 760, s = 1.05;
	const bu = r(t, 82.4, 86.2, EZ.lin);
	const bx = mix(bu, 160, 760) + 70 * Math.sin(bu * 9), by = mix(bu, 840, 240) + 50 * Math.sin(bu * 13 + 1);
	const vx = 600 + 630 * Math.cos(bu * 9), vy = -600 + 650 * Math.cos(bu * 13 + 1);
	const bang = (Math.atan2(vy, vx) * 180) / Math.PI, bsc = mix(r(t, 82.4, 86.4), 1, 0.62), bO = 1 - r(t, 86.6, 87.6);
	const carO = r(t, 86.3, 87.2, EZ.out);
	const tankN = 5 * r(t, 87.0, 92.0, EZ.lin) * 1.0001;
	const nozN = 6 * r(t, 94.85, 96.6, EZ.lin);
	const jets = r(t, 97.4, 97.8) * (1 - r(t, 100.5, 100.9));
	const hop = r(t, 97.6, 99.6, EZ.out) * (1 - r(t, 100.7, 101.4, EZ.in)) + 0.04 * Math.sin(Math.PI * r(t, 101.4, 101.9)) * -1;
	const cy = gy - 130 * hop;
	const headO = 1 - r(t, 96.6, 97.3);
	const q = r(t, 103.8, 104.6, EZ.out);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #172a45 0%, #2a4263 70%, #34496a 100%)'}}>
			<Svg>
				{Array.from({length: 26}, (_, i) => <line key={`v${i}`} x1={i * 80 - ((t * 4) % 80)} y1={0} x2={i * 80 - ((t * 4) % 80)} y2={H} stroke={K.xray} strokeWidth={1} opacity={0.07} />)}
				{Array.from({length: 15}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 80} x2={W} y2={i * 80} stroke={K.xray} strokeWidth={1} opacity={0.07} />)}
				<rect x={0} y={gy} width={W} height={4} fill={K.air} opacity={0.35} />
				{/* balloon */}
				{bO > 0 && (
					<g opacity={bO}>
						<g transform={`translate(${bx} ${by}) rotate(${bang + 90}) scale(${bsc})`}>
							<Plume id="tb" x={0} y={80} a={90} L={bu < 1 ? 160 : 40} w={0.2} o={0.75} seed={Math.floor(t * 12) % 7 + 1} />
							<ellipse cx={0} cy={0} rx={70} ry={86} fill="#ff7a5c" />
							<ellipse cx={-22} cy={-30} rx={16} ry={26} fill="#fff" opacity={0.45} />
							<path d="M -10 84 L 10 84 L 0 72 Z" fill="#d4553b" />
						</g>
						<Lab x={300} y={960 - 120} size={46} weight={700} col={K.mute} o={r(t, 82.8, 83.4)}>松手的气球</Lab>
					</g>
				)}
				{carO > 0 && (
					<g opacity={carO}>
						<path d={`M 790 300 C 860 300, 930 340, 960 420`} stroke={K.amber} strokeWidth={4} strokeDasharray="8 14" fill="none" opacity={1 - r(t, 92, 93)} />
						{jets > 0 && NOZZLES.slice(0, 4).map(([lx, ly], i) => {
							const p = {x: x + (lx - 510) * s, y: cy + (ly - 292) * s};
							return <Plume key={i} id={`tp${i}`} x={p.x} y={p.y} a={90} L={(150 + 110 * hop) * jets} w={0.26} seed={i + (Math.floor(t * 10) % 5)} o={jets} />;
						})}
						<ellipse cx={x} cy={gy + 6} rx={470 * s} ry={12} fill="#000" opacity={0.35 * (1 - hop)} />
						<Car id="tcar" x={x} y={cy} s={s} xray={1} tanks={1} tankN={tankN} nozzles={1} nozN={nozN} shadow={0} />
						<Lab x={1120} y={300} size={56} o={r(t, 88.0, 88.7, EZ.out) * headO}>高压气瓶，塞满每个空隙</Lab>
						<Lab x={1120} y={390} size={46} weight={700} col={K.mute} o={r(t, 93.5, 94.2, EZ.out) * headO}>据报道：10个喷口 · 600升压缩空气</Lab>
					</g>
				)}
				{q > 0 && (
					<g opacity={q}>
						<path d={`M ${x - 520} ${gy - 30} Q ${x} ${gy - 720} ${x + 520} ${gy - 30}`} stroke={K.amber} strokeWidth={4} strokeDasharray="6 20" fill="none" strokeLinecap="round" />
						<text x={x} y={gy - 420} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 150}} fill={K.amber} transform={`translate(0 ${(1 - q) * 30})`}>？</text>
						<Lab x={300} y={300} anchor="start" size={48} weight={800}>飞多高：没公布</Lab>
						<Lab x={300} y={380} anchor="start" size={48} weight={800}>飞多久：没公布</Lab>
					</g>
				)}
			</Svg>
		</AbsoluteFill>
	);
};

/* ================= the three versions ================= */
const TrimScene: React.FC<{t: number}> = ({t}) => {
	const cols = [
		{x: 340, name: 'Performance', l1: '能倒挂，不会飞', l2: '定金 5万美元', fly: false},
		{x: 960, name: 'Thrust', l1: '车尾喷气', l2: '加速更猛', fly: false},
		{x: 1580, name: 'Rocket', l1: '会"飞" · 单座', l2: '仅邀请 · 不能上路', fly: true},
	];
	const hiRocket = t < 114.4, hiPerf = t >= 114.4 && t < 121.1;
	const stamp = r(t, 117.6, 117.95, Easing.bezier(0.2, 1.6, 0.4, 1));
	const push = mix(r(t, 107.9, 123.74, EZ.lin), 1, 1.05);
	return (
		<AbsoluteFill style={{transform: `scale(${push})`}}>
			<AbsoluteFill style={{background: `linear-gradient(180deg, ${K.skyTop} 0%, ${K.skyMid} 40%, ${K.skyLow} 52%, ${K.glow} 55.5%, ${K.ground} 55.7%, #1a2029 100%)`}} />
			<Svg>
				<Horizon hy={600} />
				<Flood id="tf" sx={960} sy={-40} tx={960} ty={560} spread={0.62} o={0.8} />
				{cols.map((c, i) => {
					const inn = r(t, 107.9 + i * 0.35, 108.7 + i * 0.35, EZ.out);
					const hi = (hiRocket && i === 2) || (hiPerf && i === 0) || (!hiRocket && !hiPerf);
					const dim = mix(r(t, 108.8, 109.4), 1, hi ? 1 : 0.45) * (t >= 121.1 ? 1 : 1);
					const y = c.fly ? 470 + 10 * Math.sin(t * 2.2) : 560;
					const sc = 0.44;
					const red = i === 2 ? r(t, 111.2, 111.6, EZ.out) * (t < 114.4 ? 1 : 0.6) : 0;
					return (
						<g key={i} opacity={inn * (t >= 121.1 ? 1 : dim)} transform={`translate(0 ${(1 - inn) * 30})`}>
							{c.fly && NOZZLES.slice(0, 4).map(([lx, ly], j) => (
								<Plume key={j} id={`trp${j}`} x={c.x + (lx - 510) * sc} y={y + (ly - 292) * sc} a={90} L={110} w={0.25} seed={j + (Math.floor(t * 10) % 5)} o={0.85} />
							))}
							{i === 1 && <Plume id="trr" x={c.x + (26 - 510) * sc} y={560 + (186 - 292) * sc} a={180} L={170} w={0.2} seed={Math.floor(t * 10) % 5 + 1} />}
							<Car id={`trc${i}`} x={c.x} y={y} s={sc} spin={t * 200} shadow={c.fly ? 0 : 1} />
							<Lab x={c.x} y={680} size={56} weight={900}>{c.name}</Lab>
							<Lab x={c.x} y={760} size={44} weight={700} col={c.fly ? K.amber : K.ink}>{c.l1}</Lab>
							<Lab x={c.x} y={826} size={44} weight={700} col={red > 0 ? K.red : K.mute}>{c.l2}</Lab>
						</g>
					);
				})}
				{stamp > 0 && (
					<g transform={`translate(1590 200) rotate(-6) scale(${mix(stamp, 1.6, 1)})`} opacity={Math.min(1, stamp * 1.5)}>
						<rect x={-230} y={-70} width={460} height={120} rx={14} fill="rgba(10,16,28,0.55)" stroke={K.amber} strokeWidth={6} />
						<text x={0} y={18} textAnchor="middle" style={{fontFamily: SANS, fontSize: 64, fontWeight: 900}} fill={K.amber}>2028年才量产</text>
					</g>
				)}
			</Svg>
		</AbsoluteFill>
	);
};

const END_V = {id: 'ep27', src: '', title: '凭什么能开上天花板？', kicker: '', tagline: '', taglineEn: '', motif: 'bars' as const, card: [21.0, 24.6] as [number, number], extend: 0,
	question: '这车要是真卖了，你敢坐吗？', sources: '来源：TechCrunch、Fox Business、Electrek、Benzinga 2026.10；McMurtry 2025；“约”为估算', duration: 0};

export const Film27: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const site = t < 55.4 ? env(t, -1, 55.4, 0.01, 1.2) : env(t, 77.0, 83.0, 0.5, 0.8);
	const phone = env(t, 54.2, 67.6, 1.2, 0.9);
	const ceil = env(t, 66.8, 77.7, 0.9, 0.55);
	const tanks = env(t, 82.3, 108.6, 0.7, 0.7);
	const trims = env(t, 107.9, END_AT + 0.6, 0.7, 0.6);
	const airO = r(t, 51.6, 54.0) * (1 - r(t, 55.2, 56.6)) + r(t, 77.1, 77.6) * (1 - r(t, 80.0, 81.6));
	const title = r(t, 21.0, 21.8, EZ.out) * (1 - r(t, 24.0, 24.7));
	const date = r(t, 25.0, 25.6, EZ.out) * (1 - r(t, 34.6, 35.4));
	const rew = r(t, 25.9, 26.3, EZ.out) * (1 - r(t, 28.6, 29.2));
	const mark = r(t, 1.0, 1.6) * (1 - r(t, END_AT - 0.5, END_AT));
	return (
		<AbsoluteFill style={{background: '#0d1628'}}>
			{site > 0.001 && <AbsoluteFill style={{opacity: site}}><SiteWorld t={t} /></AbsoluteFill>}
			{phone > 0.001 && <AbsoluteFill style={{opacity: phone}}><PhoneScene t={t} /></AbsoluteFill>}
			{ceil > 0.001 && <AbsoluteFill style={{opacity: ceil}}><CeilScene t={t} /></AbsoluteFill>}
			{tanks > 0.001 && <AbsoluteFill style={{opacity: tanks}}><TankScene t={t} /></AbsoluteFill>}
			{trims > 0.001 && <AbsoluteFill style={{opacity: trims}}><TrimScene t={t} /></AbsoluteFill>}
			{airO > 0.001 && (
				<Svg style={{opacity: airO}}>
					<Air x={0} y={0} w={W} h={H} n={800} seed={31} t={t * 3} r={2.6} o={0.85} col={t > 70 ? '#ffe2b8' : K.air} drift={[10, -6]} />
				</Svg>
			)}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(4,8,16,0.5) 100%)', pointerEvents: 'none'}} />
			{title > 0 && (
				<div style={{position: 'absolute', left: 120, top: 540, fontFamily: SANS, fontWeight: 900, color: '#fff', textShadow: '0 4px 30px rgba(8,14,26,0.8)', ...rise(title)}}>
					<div style={{fontSize: 96, letterSpacing: '0.04em'}}>凭什么</div>
					<div style={{fontSize: 128, letterSpacing: '0.02em', marginTop: -6}}>能开上<span style={{color: K.amber}}>天花板</span>？</div>
				</div>
			)}
			{date > 0 && <div style={{position: 'absolute', left: 110, top: 96, fontFamily: SANS, fontWeight: 700, fontSize: 44, color: K.mute, textShadow: '0 2px 16px rgba(8,12,20,0.9)', ...rise(date)}}>2026.10.15 · 美国得州 · SpaceX 测试场</div>}
			{rew > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 56, color: K.amber, letterSpacing: '0.1em', textShadow: '0 2px 18px rgba(8,12,20,0.9)', opacity: rew}}>⟲ 倒回去，从头看</div>}
			<Sequence from={Math.round(END_AT * FPS)}><EndCard v={END_V} cfg={{videos: []}} dur={Math.round((FILM_END - END_AT) * FPS)} /></Sequence>
			{t < END_AT && <Sub t={subAt(t)} />}
			<div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: '#f3ede2', textShadow: '0 1px 6px rgba(0,0,0,0.6)'}}>{JUNO.mark}</div>
			<Audio src={staticFile('ep27_bgm.mp3')} />
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM27" component={Film27} durationInFrames={Math.round(FILM_END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
