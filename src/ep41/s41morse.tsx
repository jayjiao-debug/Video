import React from 'react';
import {staticFile} from 'remotion';
import {W, H, rnd, cl, sm, lerp, Sky, ridgeY, Layer, Walker, Rimmed, fkPose, mixPose, walkToStand, speed4, jointAt, Glow, Pose, Look4} from './v3base';
import {Figure4} from './figure4';
import {Whip, ease, easeIn, easeOut, seg, drift} from './fx';
import {TelegraphKey} from './props41';
/* 莫尔斯 1825 → 1844 (54.875–73.015, 18.14 s). Director's gate: open on the fold of Morse's wax-sealed 1825 sheet in his
   own hands (letter-fold match from Du Fu's folded letter); the seal breaks; pull back to the easel; he reads, the brush
   falls. Home through the snow, too late: the fresh grave, hat off (MO3). Crane up, nineteen years pass; poles rise one
   per beat, the wire strings itself (1844: no crossarms). The Capitol: Morse at the key, gold pulses out of the window
   (no paper tape). Ride the last pulse along the wire; the train merges and the straight wire trembles into the wavy
   trace that opens 斯科特 on soot. Nothing says the death inspired the telegraph: the moments sit side by side. */

/** scene-relative seconds; VO from vo_timeline_v3.md (film − 54.875) */
export const MORSE_T = {
	m1: 0.425, m1End: 3.425, m2: 4.025, m2End: 7.025, m3: 8.425, m3End: 12.475, mq: 12.925, mqEnd: 15.275, end: 18.14,
	seal: 0.95, open: 1.15, pull: 1.15, pullEnd: 2.9, brush: 3.0,           // studio: seal breaks on M1, pull back, brush falls
	road: 3.962, stopA: 5.55, stopB: 6.35, hatA: 6.45, hatB: 6.85, hatC: 7.45,   // MO3: walk, stop at the grave, hat off
	crane: 7.924, lapse: 8.55, spring: 9.25, springEnd: 10.15, pole0: 9.62, // crane up, 19 years, crane down; a pole per beat
	chamber: 11.887, press: 12.925, push: 13.55, window: 14.75, ride: 15.25, merge: 16.75, wave: 17.15,
};
const T = MORSE_T;
/** the trace both scenes share: the wire's tremble at the end of 莫尔斯 is the soot trace at the start of 斯科特 */
export const TRACE_Y = 540;
export const voiceWave = (x: number) => { const e = 0.5 + 0.5 * Math.abs(Math.sin(x * 0.0047 + 0.7)) * (0.6 + 0.4 * Math.sin(x * 0.0019 + 2.1));
	return e * (0.6 * Math.sin(x * 0.043) + 0.27 * Math.sin(x * 0.101 + 1.3) + 0.13 * Math.sin(x * 0.23 + 0.4)); };
export const tracePath = (phase: number, amp: number, y0 = TRACE_Y, x0 = -40, x1 = W + 40, step = 5) => { let d = '';
	for (let x = x0; x <= x1; x += step) d += `${d ? 'L' : 'M'}${x},${(y0 + amp * voiceWave(x + phase)).toFixed(1)}`; return d; };
/* the ride: camera speed along the wire (px/s), decelerating at the end into the drum's speed (斯科特 continues it) */
const rideV = (tau: number) => lerp(2300, 640, easeOut(seg(tau, T.wave, T.end)));
const integ = (f: (x: number) => number, a: number, b: number) => { let s = 0; const n = Math.max(1, Math.ceil((b - a) * 60)), d = (b - a) / n; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * d) * d; return s; };
export const MORSE_END = {phase: integ(rideV, T.ride, T.end), speed: rideV(T.end), amp: 46, col: '#FBEBC4'};
const traceAmp = (tau: number) => 46 * sm(seg(tau, T.wave, T.end - 0.15));

/* ---------- local helpers (shared-module requests are listed in the report) ---------- */
type FKA = Parameters<typeof fkPose>[0];
type P2 = [number, number];
/** world point (cx, cy) shown at screen centre, zoom z, roll in degrees */
export const CamC: React.FC<{z: number; cx: number; cy: number; roll?: number; children: React.ReactNode}> = ({z, cx, cy, roll = 0, children}) =>
	<g transform={`translate(${W / 2},${H / 2}) rotate(${roll}) scale(${z}) translate(${-cx},${-cy})`}>{children}</g>;
const D2R = Math.PI / 180;
/** two-bone IK: put the hand centre of arm `side` on target (body units, y up, +x forward). Elbow hangs below the reach line. */
export const reach = (base: FKA, side: 'l' | 'r', tgt: P2): FKA => {
	const P = fkPose(base), sh = side === 'l' ? P.LSh : P.RSh, L1 = 0.194, L2 = 0.135 + 0.034;
	const dx = tgt[0] - sh[0], dy = tgt[1] - sh[1], d = Math.min(Math.hypot(dx, dy), (L1 + L2) * 0.995), phi = Math.atan2(dx, -dy) / D2R;
	const alpha = Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * Math.max(d, 1e-4)), -1, 1)) / D2R, a = phi - alpha;
	const el: P2 = [sh[0] + Math.sin(a * D2R) * L1, sh[1] - Math.cos(a * D2R) * L1], b = Math.atan2(tgt[0] - el[0], -(tgt[1] - el[1])) / D2R;
	return side === 'l' ? {...base, la: a, le: b - a} : {...base, ra: a, re: b - a};
};
/** screen → body units for a figure at (x, ground, h) */
export const toBody = (s: P2, x: number, ground: number, h: number, flip = false): P2 => [(s[0] - x) / h * (flip ? -1 : 1), (ground - s[1]) / h];
/** falling snow in screen space; drift = extra leftward slide (camera motion) */
const Snow: React.FC<{t: number; n?: number; drift?: number; op?: number; seed?: number}> = ({t, n = 120, drift: dr = 0, op = 1, seed = 0}) => <g opacity={op}>
	{Array.from({length: n}, (_, i) => { const z = 0.35 + 0.65 * rnd(i, 3 + seed), x = ((rnd(i, 1 + seed) * 2300 - t * (40 + 30 * z) - dr * z + 20 * Math.sin(t * 1.3 + i)) % 2300 + 2300) % 2300 - 190, y = ((rnd(i, 2 + seed) * 1200 + t * (60 + 110 * z)) % 1200) - 60;
		return <circle key={i} cx={x} cy={y} r={1 + 2.6 * z * z} fill="#eef2f8" opacity={0.35 + 0.5 * z} />; })}
</g>;

/** 1825: a folded letter sheet with a red wax seal (no envelope). open 0 → 1 unfolds it; crack 0 → 1 breaks the seal. Origin = centre. */
const SealedLetter: React.FC<{x: number; y: number; s: number; open: number; crack: number; rot?: number}> = ({x, y, s, open, crack, rot = 0}) => {
	const w = lerp(120, 150, open), hh = lerp(76, 196, sm(open)), lines = sm(seg(open, 0.4, 1));
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-w / 2 + 3} y={-hh / 2 + 4} width={w} height={hh} fill="#000" opacity={0.18} />
		<rect x={-w / 2} y={-hh / 2} width={w} height={hh} fill="#ECE3CC" />
		<rect x={-w / 2} y={-hh / 2} width={w} height={hh * 0.5} fill="#F4ECD8" opacity={0.6} />
		{open < 0.5 && <g opacity={1 - open * 2}>
			<path d={`M${-w / 2},${-hh / 2} L0,${-hh * 0.08} L${w / 2},${-hh / 2}`} fill="none" stroke="#C8BB9C" strokeWidth={1.4} />
			<path d={`M${-w / 2},${hh * 0.18} L${w / 2},${hh * 0.18}`} stroke="#D6CAAC" strokeWidth={1} />
		</g>}
		{open > 0.3 && <g opacity={lines}>
			<path d={`M${-w / 2},${-hh / 6} L${w / 2},${-hh / 6} M${-w / 2},${hh / 6} L${w / 2},${hh / 6}`} stroke="#CFC2A2" strokeWidth={1} />
			{Array.from({length: 16}, (_, i) => { const yy = -hh / 2 + 22 + i * 10.4, len = (w - 34) * (i === 15 ? 0.45 : 0.75 + 0.25 * rnd(i, 7));
				let d = ''; for (let k = 0; k <= len; k += 1.6) d += `${d ? 'L' : 'M'}${(-w / 2 + 16 + k).toFixed(1)},${(yy + 1.6 * Math.sin(k * 0.9 + i) + 0.9 * Math.sin(k * 2.3 + i * 2) - (Math.sin(k * 0.45 + i) > 0.92 ? 3 : 0)).toFixed(1)}`;
				return <path key={i} d={d} stroke="#3A3026" strokeWidth={0.9} fill="none" opacity={0.8} strokeDasharray={`${14 + 10 * rnd(i, 4)} 3 ${9 + 8 * rnd(i, 5)} 3 ${20 + 6 * rnd(i, 6)} 3`} />; })}
		</g>}
		{/* the seal: one disc on the fold; it cracks and the halves part with the paper */}
		{[-1, 1].map((sd) => { const off = sd * (crack > 0 ? 2 + open * (w / 2 - 2) : 0), half = crack > 0.05;
			return <g key={sd} transform={`translate(${off},${lerp(0, -hh * 0.2, open)}) scale(${lerp(1, 0.7, open)})`}>
				<path d={half ? (sd < 0 ? 'M0,-13 A13,13 0 0,0 0,13 L2,6 L-2,0 L1,-6 Z' : 'M0,-13 A13,13 0 0,1 0,13 L2,6 L-2,0 L1,-6 Z') : (sd < 0 ? 'M0,-13 A13,13 0 0,0 0,13 Z' : 'M0,-13 A13,13 0 0,1 0,13 Z')} fill="#A8231B" />
				<path d={sd < 0 ? 'M-3,-8 A8,8 0 0,0 -3,8' : 'M3,-8 A8,8 0 0,1 3,8'} stroke="#D9574A" strokeWidth={1.4} fill="none" opacity={0.8} />
			</g>; })}
		{crack <= 0.05 && <circle cx={-4} cy={-5} r={3} fill="#F08A7A" opacity={0.6} />}
	</g>;
};
/** the studio easel with a full-length canvas (a standing figure blocked in, unfinished) */
const Easel: React.FC<{x: number; floor: number; t: number}> = ({x, floor, t}) => {
	const cw = 360, ch = 560, top = floor - 230 - ch;
	return <g>
		<path d={`M${x - 120},${floor} L${x - 40},${top - 50} L${x - 22},${top - 50} L${x - 96},${floor} Z M${x + 120},${floor} L${x + 40},${top - 50} L${x + 22},${top - 50} L${x + 96},${floor} Z M${x + 6},${floor - 8} L${x + 2},${top} L${x + 14},${top} L${x + 30},${floor - 8} Z`} fill="#2E241C" />
		<rect x={x - cw / 2 - 14} y={floor - 236} width={cw + 28} height={16} fill="#2E241C" />
		<g transform={`translate(${x},${top + ch / 2}) skewY(-2) translate(${-x},${-(top + ch / 2)})`}>
			<rect x={x - cw / 2} y={top} width={cw} height={ch} fill="#D9CDB0" />
			<rect x={x - cw / 2} y={top} width={cw} height={ch * 0.62} fill="#B79A72" opacity={0.55} />
			<rect x={x - cw / 2 + 16} y={top + 30} width={70} height={ch - 60} fill="#8C7356" opacity={0.35} />
			<ellipse cx={x + 90} cy={top + 150} rx={90} ry={60} fill="#E2B27A" opacity={0.45} />
			<g opacity={0.42}><Figure4 x={x + 4} ground={top + ch - 36} h={ch * 0.82} pose={fkPose({hip: 0.655, lean: 2, neck: -4, lt: 3, lk: 2, rt: -6, rk: 4, la: 6, le: 70, ra: -4, re: 12})} look={{dress: 'coat', head: 'short', build: 1.12}} col="#4A3A2C" /></g>
			<path d={`M${x - 120},${top + ch - 30} q60,-10 150,4 M${x - 40},${top + 70} q-10,90 6,180`} stroke="#6A5238" strokeWidth={2} fill="none" opacity={0.6} />
			<rect x={x - cw / 2} y={top} width={cw} height={ch} fill="none" stroke="#3A2E22" strokeWidth={6} />
		</g>
		<Glow x={x - 60} y={top + 200} r={260} c="#E6EEF6" o={0.08 + 0.02 * Math.sin(t * 0.7)} id="mEaselG" />
	</g>;
};
const Brush: React.FC<{x: number; y: number; a: number; h: number}> = ({x, y, a, h}) => { const L = 0.13 * h;
	return <g transform={`translate(${x},${y}) rotate(${a})`}><line x1={0} y1={-L * 0.25} x2={0} y2={L * 0.75} stroke="#1E1812" strokeWidth={3.4} strokeLinecap="round" /><rect x={-2.4} y={L * 0.62} width={4.8} height={L * 0.12} fill="#B9A27A" /><path d={`M-2.6,${L * 0.74} Q0,${L * 0.95} 2.6,${L * 0.74} Z`} fill="#8E3A24" /></g>; };

/* ---------- MO1–2: the studio ---------- */
const STUDIO_S = 1920 / 2048;
const MX = 1050, MG = 1004, MH = 650;          // Morse in the studio: faces the canvas (left)
const EASEL_X = 560;
const RECV: FKA = {hip: 0.655, lean: 6, neck: 22, lt: 3, lk: 3, rt: -5, rk: 5, la: 26, le: 104, ra: 58, re: 34};
const studioPose = (tau: number) => {
	const k = sm(seg(tau, T.brush - 0.3, T.brush + 0.25)), bow = sm(seg(tau, 2.9, 3.8));
	const base: FKA = {...RECV, neck: lerp(22, 32, bow), lean: lerp(6, 11, bow), ra: lerp(58, 10, k), re: lerp(34, 10, k)};
	const breath = Math.sin(tau * 1.8) * 0.004;
	return fkPose({...base, hip: base.hip + breath * 0.3});
};
const letterAt = (tau: number): P2 => { const p = studioPose(tau), hd = jointAt(p, 'LHand', MX, MG, MH, true); return [hd[0] - 0.035 * MH, hd[1] - 0.01 * MH]; };
const Studio: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const pose = studioPose(tau), L = letterAt(tau), rh = jointAt(pose, 'RHand', MX, MG, MH, true);
	const fl = 0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 5.3);
	// the brush: in his raised right hand, then it slips and falls to the boards
	const dt = tau - T.brush, fallT = 0.42; let bx = rh[0] - 6, by = rh[1] + 4, ba = 160;
	if (dt > 0) { const u = Math.min(dt, fallT); bx += -60 * u; by += 0.5 * 3600 * u * u; ba = 160 + 280 * (u / fallT); if (dt > fallT) { const b = dt - fallT; by = MG - 6 - 14 * Math.max(0, Math.sin(b * 14)) * Math.exp(-b * 6); ba = 90 + 6 * Math.exp(-b * 5) * Math.sin(b * 20); bx = rh[0] - 6 - 60 * fallT - 30 * (1 - Math.exp(-b * 4)); } by = Math.min(by, MG - 6); }
	return <g>
		<image href={staticFile('ep41/morse_studio.webp')} x={0} y={0} width={2048 * STUDIO_S} height={1152 * STUDIO_S} />
		<rect x={640} y={705} width={130} height={70} fill="#FF9A3A" opacity={0.08 * fl} />
		<Glow x={705} y={745} r={140} c="#FFB060" o={0.22 * fl} id="mStove" />
		{/* dust in the window light */}
		{Array.from({length: 40}, (_, i) => { const x = 160 + ((rnd(i, 1) * 560 + t * (6 + 8 * rnd(i, 2))) % 560), y = 160 + ((rnd(i, 3) * 620 - t * (4 + 6 * rnd(i, 4))) % 620 + 620) % 620;
			return <circle key={i} cx={x} cy={y} r={1 + rnd(i, 5) * 1.6} fill="#F2F5FA" opacity={0.18 + 0.2 * Math.sin(t * 2 + i)} />; })}
		<path d="M90,40 L470,40 L860,1080 L-200,1080 Z" fill="#E8EEF6" opacity={0.05} />
		<Easel x={EASEL_X} floor={MG - 2} t={t} />
		<Rimmed x={MX} ground={MG} h={MH} pose={pose} look={{dress: 'coat', head: 'short'}} flip col="#151A20" rimOp={0} T={tau} />
		<Brush x={bx} y={by} a={ba} h={MH} />
		<SealedLetter x={L[0]} y={L[1]} s={0.62} open={sm(seg(tau, T.open, T.open + 0.55))} crack={seg(tau, T.seal, T.seal + 0.12)} rot={-4 + 2 * sm(seg(tau, T.open, T.open + 0.6))} />
	</g>;
};

/* ---------- MO3: home through the snow, too late ---------- */
const RG = 900, RX = 760, RH = 470;                  // road ground, walker x, height
const LOOK_OUT: Look4 = {dress: 'coat', head: 'tophat', gait: '08_04'};
const LOOK_BARE: Look4 = {dress: 'coat', head: 'short', gait: '08_04'};
const V0 = speed4(LOOK_OUT, RH);
const roadV = (tau: number) => V0 * (1 - sm(seg(tau, T.stopA, T.stopB)));
const roadCam = (tau: number) => 900 + integ(roadV, T.road, Math.min(tau, T.stopB + 0.01));
const CAM_STOP = roadCam(T.stopB + 0.01);
const GRAVE_X = RX + 95 + CAM_STOP;                 // world x of the grave's foot (near layer, f = 1)
const STAND_FK: FKA = {hip: 0.655, lean: 4, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 12, ra: 4, re: 14};
const HAT = (s: number) => `M${-0.082 * s},${-0.04 * s} Q0,${-0.058 * s} ${0.078 * s},${-0.04 * s} L${0.054 * s},${-0.058 * s} L${0.058 * s},${-0.18 * s} L${-0.05 * s},${-0.18 * s} L${-0.05 * s},${-0.058 * s} Z`;
/** head centre and angle of a pose on screen (same maths as Figure4's head) */
const headFrame = (p: Pose, x: number, g: number, h: number, flip = false) => { const S = (n: string): P2 => jointAt(p, n, x, g, h, flip), n1 = S('Neck1'), hd = S('Head'), top = S('Top');
	return {c: [lerp(hd[0], top[0], 0.45), lerp(hd[1], top[1], 0.45)] as P2, ang: Math.atan2(top[1] - n1[1], top[0] - n1[0]) + Math.PI / 2}; };
const Headstone: React.FC<{x: number; g: number; s?: number; tilt?: number}> = ({x, g, s = 1, tilt = 0}) => <g transform={`translate(${x},${g}) rotate(${tilt}) scale(${s})`}>
	<path d="M-30,6 L-30,-72 Q-30,-84 -20,-86 Q-14,-104 0,-106 Q14,-104 20,-86 Q30,-84 30,-72 L30,6 Z" fill="#2A3038" />
	<path d="M-28,-74 Q-26,-84 -18,-84 Q-12,-100 0,-102 Q12,-100 18,-84 Q26,-84 28,-74 Q14,-80 0,-94 Q-14,-80 -28,-74 Z" fill="#DDE2E8" opacity={0.85} />
</g>;
const BareTree: React.FC<{x: number; g: number; s: number; col: string; seed: number}> = ({x, g, s, col, seed}) => { const br = (x0: number, y0: number, a: number, l: number, d: number, k: number): string => { if (d === 0) return ''; const x1 = x0 + Math.sin(a) * l, y1 = y0 - Math.cos(a) * l;
	return `M${x0.toFixed(1)},${y0.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)} ` + br(x1, y1, a - 0.45 - 0.2 * rnd(k, seed), l * 0.72, d - 1, k * 2 + 1) + br(x1, y1, a + 0.4 + 0.2 * rnd(k, seed + 1), l * 0.68, d - 1, k * 2 + 2); };
	return <g><path d={br(x, g + 4, 0.04 * (rnd(seed, 1) - 0.5), 70 * s, 6, 1)} stroke={col} strokeWidth={3.2 * s} fill="none" strokeLinecap="round" /><path d={`M${x - 7 * s},${g + 4} L${x - 3 * s},${g - 60 * s} L${x + 3 * s},${g - 60 * s} L${x + 7 * s},${g + 4} Z`} fill={col} /></g>; };
const Church: React.FC<{x: number; g: number; s: number; col: string; lit: number}> = ({x, g, s, col, lit}) => <g transform={`translate(${x},${g}) scale(${s})`}>
	<path d="M-90,8 L-90,-90 L0,-150 L90,-90 L90,8 Z" fill={col} />
	<path d="M-30,-90 L-30,-200 L30,-200 L30,-90 Z M-24,-200 L-24,-250 L24,-250 L24,-200 Z M-20,-250 L0,-360 L20,-250 Z" fill={col} />
	<path d="M-90,-90 L0,-150 L90,-90" stroke="#DDE2E8" strokeWidth={6} fill="none" opacity={0.7} />
	{[-58, 58].map((wx) => <rect key={wx} x={wx - 9} y={-70} width={18} height={40} rx={9} fill="#FFC97A" opacity={lit} />)}
	<rect x={-10} y={-180} width={20} height={26} rx={10} fill="#0E1218" />
</g>;
const House: React.FC<{x: number; g: number; s: number; col: string; i: number}> = ({x, g, s, col, i}) => <g transform={`translate(${x},${g}) scale(${s})`}>
	<path d="M-70,8 L-70,-70 L0,-120 L70,-70 L70,8 Z" fill={col} /><rect x={30} y={-138} width={16} height={40} fill={col} />
	<path d="M-70,-70 L0,-120 L70,-70" stroke="#DDE2E8" strokeWidth={7} fill="none" opacity={0.75} />
	{[-36, 0, 36].map((wx, k) => <rect key={wx} x={wx - 8} y={-52} width={16} height={22} fill="#FFC97A" opacity={rnd(i * 3 + k, 9) > 0.35 ? 0.9 : 0.15} />)}
</g>;
const WinterWorld: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const cam = roadCam(tau), walking = tau < T.stopB;
	const winterSky: [number, string][] = [[0, '#2E374E'], [0.5, '#5E6886'], [0.75, '#9C98A8'], [1, '#D2B49C']];
	// pose: walk → stand (walkToStand), then the near arm lifts the hat off, holds it at the chest; the head bows
	const kStop = seg(tau, T.stopA, T.stopB);
	const standP = fkPose(STAND_FK), bowK = sm(seg(tau, T.hatB, T.hatC + 0.35));
	let pose: Pose, look = LOOK_OUT, hat: React.ReactNode = null;
	if (tau < T.stopB) pose = walkToStand('08_04', tau - T.road, kStop, standP);
	else {
		const base: FKA = {...STAND_FK, neck: lerp(2, 26, bowK), lean: lerp(4, 9, bowK), hip: 0.655 + Math.sin(tau * 1.7) * 0.0015};
		const hf = headFrame(fkPose(base), RX, RG, RH), s = RH * 0.93;
		const brim: P2 = [hf.c[0] + 0.07 * RH, hf.c[1] - 0.03 * RH], chest: P2 = jointAt(fkPose(base), 'Spine1', RX, RG, RH); chest[0] += 0.15 * RH; chest[1] += 0.01 * RH;
		const rest = jointAt(standP, 'LHand', RX, RG, RH); rest[0] += 0.02 * RH; rest[1] += 0.03 * RH;
		const k1 = sm(seg(tau, T.hatA, T.hatB)), k2 = sm(seg(tau, T.hatB, T.hatC));
		const tgt: P2 = tau < T.hatB ? [lerp(rest[0], brim[0], k1), lerp(rest[1], brim[1], k1)] : [lerp(brim[0], chest[0], k2), lerp(brim[1], chest[1], k2)];
		pose = fkPose(tau < T.hatA ? base : reach(base, 'l', toBody(tgt, RX, RG, RH)));
		if (tau >= T.hatB) { look = LOOK_BARE; const hand = jointAt(pose, 'LHand', RX, RG, RH), kk = sm(seg(tau, T.hatB, T.hatB + 0.18));
			const hx = lerp(hf.c[0], hand[0] + 0.02 * RH, kk), hy = lerp(hf.c[1], hand[1] + 0.06 * RH, kk), a = lerp(hf.ang / D2R, 84, k2);
			hat = <path d={HAT(s)} fill="#151A20" transform={`translate(${hx},${hy}) rotate(${a}) translate(0,${0.11 * s * k2})`} />; }
	}
	return <g>
		<rect x={-200} y={-1400} width={W + 400} height={1500} fill="#2E374E" />
		<Sky id="mWinSky" stops={winterSky} />
		<Glow x={1500} y={690} r={520} c="#E8B890" o={0.35} id="mWinSun" />
		<Layer cam={cam} f={0.04} base={700} amp={70} seed={2} col="#7C8398" period={260} item={(x, gy, i) => <BareTree x={x} g={gy} s={0.35 + 0.15 * rnd(i, 4)} col="#6A7088" seed={i} />} />
		<Layer cam={cam} f={0.12} base={745} amp={55} seed={5} col="#646B80" period={180} item={(x, gy, i) => rnd(i, 6) > 0.4 ? <BareTree x={x} g={gy} s={0.5 + 0.2 * rnd(i, 4)} col="#565C70" seed={i + 9} /> : null} />
		<Layer cam={cam} f={0.3} base={800} amp={34} seed={8} col="#4F5668" period={520} item={(x, gy, i) => i % 4 === 1 ? <Church x={x} g={gy} s={0.55} col="#7E8698" lit={0.85} /> : i % 4 === 3 ? null : <House x={x} g={gy} s={0.5 + 0.1 * rnd(i, 3)} col="#3F4656" i={i} />} />
		<Layer cam={cam} f={0.6} base={862} amp={14} seed={11} col="#3C4350" period={300} item={(x, gy, i) => rnd(i, 2) > 0.45 ? <BareTree x={x} g={gy} s={1.1 + 0.4 * rnd(i, 5)} col="#2A303C" seed={i + 30} /> : null}
			front={<path d={(() => { const y = ridgeY(cam, 0.6, 862, 14, 11); let d = ''; for (let x = -24; x <= W + 24; x += 24) d += `${d ? 'L' : 'M'}${x},${(y(x) - 22 - 6 * Math.abs(Math.sin((x + cam * 0.6) * 0.05))).toFixed(1)}`; for (let x = W + 24; x >= -24; x -= 24) d += `L${x},${(y(x) + 2).toFixed(1)}`; return d + 'Z'; })()} fill="#2E3440" />} />
		{/* the churchyard on the near ground: old slate stones, and one fresh mound of earth */}
		{[[-900, 0.9, -3], [-620, 1, 2], [-330, 0.85, -2], [640, 1.05, 3], [900, 0.9, -4], [1180, 1, 1]].map(([dx, s, tl], i) => { const x = GRAVE_X + dx - cam; return x > -100 && x < W + 100 ? <Headstone key={i} x={x} g={RG - 6} s={s * 1.7} tilt={tl} /> : null; })}
		<rect x={-50} y={RG - 4} width={W + 100} height={H - RG + 60} fill="#8E97A8" />
		<path d={`M-50,${RG - 4} L${W + 50},${RG - 4}`} stroke="#C4CBD6" strokeWidth={5} />
		{Array.from({length: 40}, (_, i) => { const x = ((i * 137 - cam) % 2300 + 2300) % 2300 - 190; return <path key={i} d={`M${x},${RG + 40 + (i % 3) * 22} l${60 + (i % 5) * 20},0`} stroke="#6E788C" strokeWidth={3} opacity={0.6} />; })}
		{(() => { const x = GRAVE_X - cam; return <g><path d={`M${x},${RG - 2} Q${x + 30},${RG - 46} ${x + 120},${RG - 52} L${x + 300},${RG - 52} Q${x + 390},${RG - 46} ${x + 420},${RG - 2} Z`} fill="#3A2E26" />
			{Array.from({length: 26}, (_, i) => <circle key={i} cx={x + 40 + rnd(i, 3) * 340} cy={RG - 44 + rnd(i, 4) * 30} r={1.5 + rnd(i, 5) * 2} fill="#DDE2E8" opacity={0.55} />)}
			<path d={`M${x + 446},${RG} L${x + 446},${RG - 150} Q${x + 466},${RG - 172} ${x + 486},${RG - 150} L${x + 486},${RG} Z`} fill="#2E2620" /><path d={`M${x + 448},${RG - 152} Q${x + 466},${RG - 170} ${x + 484},${RG - 152}`} stroke="#DDE2E8" strokeWidth={4} fill="none" opacity={0.8} /></g>; })()}
		{walking && tau < T.stopA ? <Walker x={RX} ground={RG} h={RH} tau={tau - T.road} look={LOOK_OUT} col="#151A20" rimOp={0} />
			: <Rimmed x={RX} ground={RG} h={RH} pose={pose} look={look} col="#151A20" rimOp={0} T={tau} />}
		{hat}
		<rect x={-50} y={RG + 60} width={W + 100} height={H} fill="#1C2230" opacity={0.45} />
		<Snow t={t} n={140} drift={cam * 0.7} />
	</g>;
};

/* ---------- MO4: nineteen years later — the poles rise, the wire strings itself ---------- */
const PG = 905, POLE_H = 420, POLE_P = 430, NPOLE = 7;
const poleT = (i: number) => T.pole0 + i * 0.566 * 0.5 - (i > 2 ? 0 : 0);
const springCam = (tau: number) => 1100 * ease(seg(tau, T.spring, T.chamber + 0.3));
const poleTop = (i: number, cam: number): P2 => [260 + i * POLE_P - cam * 0.85, PG - POLE_H];
const SpringWorld: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const cam = springCam(tau);
	return <g>
		<rect x={-200} y={-1400} width={W + 400} height={1500} fill="#7FC4EC" />
		<image href={staticFile('ep41/morse_spring.webp')} x={-60 - cam * 0.05} y={-40} width={2100} height={1181} />
		<Layer cam={cam} f={0.85} base={PG + 2} amp={10} seed={4} col="#4E7A4C" period={400} item={(x, gy, i) => rnd(i, 3) > 0.55 ? <path d={`M${x - 60},${gy + 4} Q${x - 40},${gy - 26} ${x},${gy - 30} Q${x + 40},${gy - 26} ${x + 60},${gy + 4} Z`} fill="#45704A" /> : null}
			front={<g><path d={`M-50,${PG + 26} L${W + 50},${PG + 30}`} stroke="#A89470" strokeWidth={18} /><rect x={-50} y={PG + 40} width={W + 100} height={300} fill="#3E6440" /></g>} />
		{/* poles (no crossarms): each is raised upright on its beat, then the wire runs to it */}
		{Array.from({length: NPOLE}, (_, i) => { const [x, y] = poleTop(i, cam), k = seg(tau, poleT(i), poleT(i) + 0.42), a = -82 * (1 - (k <= 0 ? 0 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2)));
			if (k <= 0) return null;
			return <g key={i} transform={`rotate(${a} ${x} ${PG + 6})`}><path d={`M${x - 7},${PG + 8} L${x - 5},${y + 6} L${x + 5},${y + 6} L${x + 7},${PG + 8} Z`} fill="#2A2A24" /><rect x={x - 6} y={y - 4} width={12} height={10} rx={2} fill="#2A2A24" /><circle cx={x + 7} cy={y + 14} r={4} fill="#3A3A30" /></g>; })}
		{Array.from({length: NPOLE - 1}, (_, i) => { const a = poleTop(i, cam), b = poleTop(i + 1, cam), k = seg(tau, poleT(i + 1) + 0.3, poleT(i + 1) + 0.6);
			return k > 0 ? <path key={i} d={`M${a[0] + 7},${a[1] + 14} Q${(a[0] + b[0]) / 2},${a[1] + 50} ${b[0] + 7},${b[1] + 14}`} stroke="#22221C" strokeWidth={2.6} fill="none" pathLength={1} strokeDasharray={`${k} 1`} /> : null; })}
		<rect x={0} y={0} width={W} height={H} fill="url(#mTL)" />
	</g>;
};

/* ---------- MO5: the Capitol, 24 May 1844 — the key, the pulses ---------- */
const MORSE_CODE: Record<string, string> = {W: '.--', H: '....', A: '.-', T: '-', G: '--.', O: '---', D: '-..', R: '.-.', U: '..-'};
const UNIT = 0.1;
/** key-down intervals [start, dur] (scene seconds) for "WHAT HATH GOD WROUGHT" from the press */
export const PRESSES: [number, number][] = (() => { const out: [number, number][] = []; let t = T.press;
	for (const w of 'WHAT HATH GOD WROUGHT'.split(' ')) { for (const ch of w) { for (const s of MORSE_CODE[ch]) { const d = s === '.' ? UNIT : 3 * UNIT; out.push([t, d]); t += d + UNIT; } t += 2 * UNIT; } t += 4 * UNIT; }
	return out; })();
const keyDown = (tau: number) => { let k = 0; for (const [a, d] of PRESSES) { if (tau >= a - 0.03 && tau < a + d + 0.03) k = Math.max(k, cl((tau - a + 0.03) / 0.03) * cl((a + d + 0.03 - tau) / 0.03)); } return k; };
const CH = {x: 750, g: 1008, h: 600, keyX: 930, top: 712};
const WIRE_PTS: P2[] = [[CH.keyX + 76, CH.top - 10], [1080, 690], [1150, 700], [1176, 690], [1180, 560], [1186, 420], [1215, 330], [1260, 300]];
const polyLen = (pts: P2[]) => { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; };
const WL = polyLen(WIRE_PTS);
const subPoly = (pts: P2[], c: number[], s0: number, s1: number) => { const at = (s: number): P2 => { let i = 1; while (i < c.length - 1 && c[i] < s) i++; const u = cl((s - c[i - 1]) / (c[i] - c[i - 1] || 1)); return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]; };
	const a = cl(s0, 0, c[c.length - 1]), b = cl(s1, 0, c[c.length - 1]); if (b - a < 0.5) return ''; let d = `M${at(a).join(',')}`; for (let i = 1; i < c.length; i++) if (c[i] > a && c[i] < b) d += ` L${pts[i].join(',')}`; return d + ` L${at(b).join(',')}`; };
const PV = 700;   // pulse speed along the room wire (px/s)
const Chamber: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const press = keyDown(tau), knob: P2 = [CH.keyX - 72, CH.top - 41 + press * 9];
	const base: FKA = {hip: 0.37, lean: 12, neck: 12, lt: 86, lk: 90, rt: 82, rk: 84, la: 40, le: 60, ra: 34, re: 70};
	const pose = fkPose(reach(base, 'l', toBody([knob[0] - 4, knob[1] - 16], CH.x, CH.g, CH.h)));
	const gent = (x: number, g: number, h: number, look: Look4, fk: FKA, ph: number) => <Rimmed x={x} ground={g} h={h} pose={fkPose({...fk, hip: fk.hip + 0.003 * Math.sin(t * 1.6 + ph)})} look={look} col="#2E2C28" rimOp={0} />;
	return <g>
		<image href={staticFile('ep41/morse_chamber.webp')} x={0} y={0} width={1920} height={1080} />
		<rect width={W} height={H} fill="#3A2C1E" opacity={0.22} />
		<path d="M1170,260 L1360,260 L1700,1080 L900,1080 Z" fill="#FFF4DC" opacity={0.07 + 0.015 * Math.sin(t * 0.9)} />
		{gent(470, 948, 560, {dress: 'coat', head: 'short', beard: 'short', build: 1.05}, {hip: 0.655, lean: 9, neck: 14, lt: 3, lk: 4, rt: -5, rk: 5, la: -26, le: 60, ra: -30, re: 60}, 0)}
		{gent(320, 935, 540, {dress: 'coat', head: 'bald', build: 1.1}, {hip: 0.655, lean: 4, neck: 8, lt: 2, lk: 2, rt: -4, rk: 3, la: 10, le: 80, ra: 4, re: 14}, 2)}
		{/* chair */}
		<path d={`M${CH.x - 70},${CH.g} L${CH.x - 62},${CH.g - 210} L${CH.x - 80},${CH.g - 420} L${CH.x - 62},${CH.g - 420} L${CH.x - 44},${CH.g - 218} L${CH.x + 60},${CH.g - 218} L${CH.x + 62},${CH.g} L${CH.x + 50},${CH.g} L${CH.x + 46},${CH.g - 200} L${CH.x - 50},${CH.g - 200} L${CH.x - 56},${CH.g} Z`} fill="#24180F" />
		<Rimmed x={CH.x} ground={CH.g} h={CH.h} pose={pose} look={{dress: 'coat', head: 'short'}} col="#1A1E1A" rimOp={0} T={tau} />
		{/* table */}
		<rect x={820} y={CH.top} width={380} height={20} fill="#3E2A1A" /><rect x={820} y={CH.top} width={380} height={5} fill="#7A5A3C" />
		<rect x={830} y={CH.top + 20} width={360} height={26} fill="#2E1F13" />
		<rect x={834} y={CH.top + 46} width={16} height={CH.g - CH.top - 46} fill="#2E1F13" /><rect x={1170} y={CH.top + 46} width={16} height={CH.g - CH.top - 46} fill="#2E1F13" />
		<path d={subPoly(WIRE_PTS, WL, 0, WL[WL.length - 1])} stroke="#1A140E" strokeWidth={2.6} fill="none" />
		<g transform={`translate(${CH.keyX},${CH.top}) scale(-1,1) translate(${-CH.keyX},${-CH.top})`}><TelegraphKey x={CH.keyX} y={CH.top} s={0.9} col="#2A1E14" hi="#D9B36A" press={press} spark={press > 0.5 ? 0.6 + 0.4 * Math.sin(t * 60) : 0} /></g>
		{/* gold pulses: each key-down sends one along the wire and out of the window (dot short, dash long) */}
		{PRESSES.map(([a, d], i) => { if (tau < a) return null; const s1 = (tau - a) * PV, s0 = Math.max(0, (tau - a - d) * PV), path = subPoly(WIRE_PTS, WL, s0, s1); if (!path) return null;
			return <g key={i}><path d={path} stroke="#F2CF7A" strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.3} /><path d={path} stroke="#FFF1C8" strokeWidth={5} strokeLinecap="round" fill="none" /></g>; })}
		<rect x={0} y={0} width={W} height={H} fill="url(#mTL)" />
	</g>;
};

/* ---------- MO6: ride the last pulse along the wire; the wire trembles into the trace ---------- */
const RIDE_P = 820;
const Ride: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const camX = integ(rideV, T.ride, tau), night = sm(seg(tau, T.merge - 0.2, T.end - 0.1)), merge = sm(seg(tau, T.merge, T.merge + 0.5)), amp = traceAmp(tau), poleOp = 1 - sm(seg(tau, T.wave - 0.1, T.wave + 0.5));
	const ph = camX, spd = rideV(tau);
	// the code train ahead of us (screen space, fixed: it travels with the camera); "·−− ····" etc.
	const train: [number, number][] = []; { let x = 560; for (let i = PRESSES.length - 1; i >= 0 && x < W + 400; i--) { const L = PRESSES[i][1] / UNIT * 70; train.push([x, x + L]); x += L + 70 * lerp(1, 0, merge); } }
	return <g>
		<Sky id="mRideSky" stops={[[0, '#4F8CC4'], [0.55, '#9CC3E3'], [1, '#E9E2CC']]} />
		<image href={staticFile('ep41/morse_spring.webp')} x={-((camX * 0.05) % 1900) - 40} y={120} width={2100} height={1181} />
		<image href={staticFile('ep41/morse_spring.webp')} x={-((camX * 0.05) % 1900) + 2060} y={120} width={2100} height={1181} transform={`translate(${2 * (-((camX * 0.05) % 1900) + 2060) + 2100},0) scale(-1,1)`} />
		<Whip id="mRideW" amt={18}>{Array.from({length: 30}, (_, i) => { const x = ((i * 211 - camX * 0.7) % 2600 + 2600) % 2600 - 300; return <ellipse key={i} cx={x} cy={940 + (i % 4) * 30} rx={120} ry={34} fill={i % 2 ? '#3E6440' : '#4E7A4C'} />; })}</Whip>
		<rect x={0} y={0} width={W} height={H} fill="#07080F" opacity={night * 0.97} />
		{night > 0.2 && Array.from({length: 70}, (_, i) => <circle key={i} cx={((rnd(i, 1) * W - camX * 0.01) % W + W) % W} cy={rnd(i, 2) * 420} r={0.8 + rnd(i, 3) * 1.2} fill="#EEF0FF" opacity={(night - 0.2) * 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + i))} />)}
		<g opacity={poleOp}><Whip id="mPoleW" amt={lerp(34, 10, seg(tau, T.wave, T.end))}>{Array.from({length: 5}, (_, i) => { const x = ((i * RIDE_P - camX) % (RIDE_P * 4) + RIDE_P * 4) % (RIDE_P * 4) - 400;
			return <g key={i}><rect x={x - 16} y={TRACE_Y - 22} width={32} height={H} fill="#1E1E18" /><rect x={x - 18} y={TRACE_Y - 30} width={36} height={14} rx={4} fill="#1E1E18" /></g>; })}</Whip></g>
		{/* the wire */}
		{amp < 0.5 ? <path d={`M-40,${TRACE_Y} L${W + 40},${TRACE_Y}`} stroke={merge > 0 ? '#F2CF7A' : '#1A1A14'} strokeOpacity={merge > 0 ? merge : 1} strokeWidth={merge > 0 ? 4 : 3} />
			: <><path d={tracePath(ph, amp)} stroke="#F2CF7A" strokeWidth={12} fill="none" opacity={0.25} /><path d={tracePath(ph, amp)} stroke={MORSE_END.col} strokeWidth={4} fill="none" /></>}
		{merge < 1 && amp < 0.5 && <path d={`M-40,${TRACE_Y} L${W + 40},${TRACE_Y}`} stroke="#1A1A14" strokeWidth={3} opacity={1 - merge} />}
		{/* pulses: the last one with us, the rest ahead; they lengthen and merge into one line */}
		{amp < 6 && train.map(([a, b], i) => <g key={i} opacity={1 - sm(seg(tau, T.wave, T.wave + 0.3))}><path d={`M${a},${TRACE_Y} L${b},${TRACE_Y}`} stroke="#F2CF7A" strokeWidth={20} strokeLinecap="round" opacity={0.3} /><path d={`M${a},${TRACE_Y} L${b},${TRACE_Y}`} stroke="#FFF1C8" strokeWidth={7} strokeLinecap="round" /></g>)}
		<Glow x={560} y={TRACE_Y} r={180} c="#F2CF7A" o={0.35 * (1 - merge)} id="mLastP" />
		{merge > 0 && <rect x={0} y={TRACE_Y - 60} width={W} height={120} fill="url(#mWireGlow)" opacity={0.5 * merge} />}
		<defs><linearGradient id="mWireGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2CF7A" stopOpacity="0" /><stop offset="0.5" stopColor="#F2CF7A" stopOpacity="0.25" /><stop offset="1" stopColor="#F2CF7A" stopOpacity="0" /></linearGradient></defs>
		{void spd}
	</g>;
};

export const MORSE3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const defs = <defs><radialGradient id="mTL" cx="0.12" cy="0.1" r="0.55"><stop offset="0" stopColor="#0A0C12" stopOpacity="0.42" /><stop offset="1" stopColor="#0A0C12" stopOpacity="0" /></radialGradient></defs>;
	if (tau < T.road) {   // the fold fills the frame (match from Du Fu's letter) → the seal breaks → pull back to the easel → push in as he reads
		const L = letterAt(Math.min(tau, T.pullEnd)), d = drift(t, 1);
		const zp = Math.exp(lerp(Math.log(31), Math.log(1.12), ease(seg(tau, T.pull, T.pullEnd))));
		const z = zp * lerp(1, 1.2, ease(seg(tau, T.pullEnd, T.road))) * (1 + 0.02 * (1 - seg(tau, 0, T.pull)) * tau);
		const k = ease(seg(tau, T.pull + 0.4, T.pullEnd));
		const cx = lerp(L[0], 905, k) + lerp(0, 50, ease(seg(tau, T.pullEnd, T.road))), cy = lerp(L[1], 560, k) - lerp(0, 50, ease(seg(tau, T.pullEnd, T.road)));
		return <g>{defs}<CamC z={z} cx={cx + d.px * 0.3 / z} cy={cy + d.py * 0.3 / z} roll={d.roll * 0.5}><Studio tau={tau} t={t} /></CamC><rect width={W} height={H} fill="url(#mTL)" /></g>;
	}
	if (tau < T.crane + 0.9) {   // MO3 (+ crane up into the snowing sky)
		const d = drift(t, 0.8), cr = ease(seg(tau, T.crane, T.crane + 0.9)), stopK = seg(tau, T.stopB, T.crane);
		const z = lerp(1, 1.12, ease(seg(tau, T.stopA, T.crane))) * lerp(1, 1.05, cr), cx = lerp(960, 900, ease(stopK)), cy = lerp(560, 600, ease(stopK)) - cr * 1150;
		return <g>{defs}<CamC z={z} cx={cx + d.px} cy={cy + d.py} roll={d.roll}><WinterWorld tau={tau} t={t} /></CamC></g>;
	}
	if (tau < T.chamber) {   // the sky: nineteen years pass; crane down to the same country in May, poles rise
		const lap = seg(tau, T.lapse - 0.3, T.spring + 0.2), down = easeOut(seg(tau, T.spring, T.springEnd));
		const keys = ['#3A4460', '#0E1424', '#7FA9D6', '#16203A', '#8EC4EC', '#2A3654', '#8DCBF0'];
		const ki = lap * (keys.length - 1), i0 = Math.floor(Math.min(ki, keys.length - 2)), skyCol = mixHex(keys[i0], keys[i0 + 1], ki - i0);
		const d = drift(t, 1);
		return <g>{defs}
			{tau > T.spring - 0.05 && <CamC z={1.04} cx={960 + d.px} cy={540 - (1 - down) * 1150 + d.py} roll={d.roll}><SpringWorld tau={tau} t={t} /></CamC>}
			<g opacity={1 - sm(seg(tau, T.spring, T.spring + 0.5))}><rect width={W} height={H} fill={skyCol} />
				{Array.from({length: 14}, (_, i) => { const x = ((rnd(i, 1) * 2600 + (tau - T.lapse) * (900 + 600 * rnd(i, 2))) % 2600) - 340; return <ellipse key={i} cx={x} cy={120 + rnd(i, 3) * 760} rx={240 + 200 * rnd(i, 4)} ry={20 + 18 * rnd(i, 5)} fill="#EEF2F8" opacity={0.18 * Math.sin(Math.PI * lap)} />; })}
				<Snow t={t} n={120} op={1 - sm(seg(tau, T.lapse - 0.2, T.lapse + 0.4))} />
			</g>
		</g>;
	}
	if (tau < T.ride) {   // MO5: the Capitol; push from the key to the window, following the pulses out
		const d = drift(t, 1 - seg(tau, T.push, T.window)), p = ease(seg(tau, T.push, T.window)), w = easeIn(seg(tau, T.window, T.ride));
		const z = lerp(1.1, 1.22, ease(seg(tau, T.chamber, T.press))) * lerp(1, 2.4, p) * lerp(1, 6, w);
		const cx = lerp(lerp(900, 880, seg(tau, T.chamber, T.press)), 1250, p), cy = lerp(620, 330, p);
		return <g>{defs}<CamC z={z} cx={cx + d.px} cy={cy + d.py} roll={d.roll}><Chamber tau={tau} t={t} /></CamC><rect width={W} height={H} fill="#FFF6E0" opacity={0.3 * w} /></g>;
	}
	return <g>{defs}<Ride tau={tau} t={t} /><rect width={W} height={H} fill="#FFF6E0" opacity={0.3 * (1 - seg(tau, T.ride, T.ride + 0.35))} /></g>;
};
const mixHex = (a: string, b: string, u: number) => { const p = (c: string, i: number) => parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16); return '#' + [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), cl(u))).toString(16).padStart(2, '0')).join(''); };
void Glow; void mixPose;
