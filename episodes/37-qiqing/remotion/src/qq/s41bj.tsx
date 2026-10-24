import React from 'react';
import {staticFile} from 'remotion';
import {W, H, cl, sm, lerp, rnd, fkPose, mixPose, Rimmed, jointAt, Glow, Sprite, Layer, ridgeY, MONO, SANS, SERIF} from './v3base';
import type {Look4, Pose} from './v3base';
import {Cam, ease, easeIn, easeOut, seg, drift} from './fx';
import {StarField} from './sky41';
void H;
/* 北京 1987 (the climax). ICA Beijing, a computer room at night (Siemens mainframe era: a CRT terminal, green text).
   The sentence types onto the screen on 14 Sep → the mail program deadlocks: the tear-off calendar tears 14 → 20 on the
   beats while the window cycles day/night → on the 20th the status clears and the cursor blinks again (director #14) →
   the engineer's finger hovers → Enter on the drop (154.54) → the sentence lifts off the screen as a gold light and the
   camera follows it, unbroken (r4, owner notes on r3): across the room and in through the window (the window shows the
   hutong plate 1:1), down over the roofs and up the lane, over the trees into the sky (the city falls away), down onto the
   Great Wall, along its ridge to the horizon, on up in one arc into the night where it settles as a star; the sky then
   turns backwards (1987 → 1977, director's approved #14; set `trails` past `end` to drop it).
   Entrance: the CRT power-on line (match on text: LO left the frame at the same spot). */
export const BJ_T = {   // retimed (producer) to the measured drop at film 154.54 = tau 9.11; tears on the beats counted back from it
	on: 0, onB: 0.35, j1: 0.555, typeA: 0.75, typeB: 2.9, pullA: 2.0, pullB: 3.75,
	j2: 4.955, tears: [4.582, 5.148, 5.714, 6.28, 6.846, 7.412], retype: 7.66, ready: 8.0, push: 7.7, hover: 8.3,
	// the flight: win = window fills the frame, roofsB = light clears the trees, wall = hand-off under open sky,
	// wallB = lands on the Wall, climb = leaves the wall at the horizon, star = settles
	enter: 9.11, out: 9.215, win: 10.2, roofsB: 11.1, wall: 11.95, wallB: 12.95, climb: 14.3, star: 14.9, trails: 14.72, end: 15.24,
};
const GOLD = '#F2CF7A', CRT = '#8DFFAE', FIG = '#0B0A12';
const LINE1 = 'Ueber die Grosse Mauer erreichen wir alle';
const LINE1b = 'Ecken der Welt.';
const SENT = 'Across the Great Wall we can reach every corner in the world.';
const SENT_A = 'Across the Great Wall we can reach every', SENT_B = 'corner in the world.';
/* room geometry (world, zoom 1) */
const SCR = {x: 1185, y: 410, w: 310, h: 230}, SCRC: [number, number] = [SCR.x + SCR.w / 2, SCR.y + SCR.h / 2];
const WIN = {x: 140, y: 220, w: 620, h: 349}, WINC: [number, number] = [WIN.x + WIN.w / 2, WIN.y + WIN.h / 2];
const DESK = 690, FLOOR = 960, WALLB = 870, EX = 1040, EH = 600, ENTER: [number, number] = [1302, 694];
const ENG: Look4 = {dress: 'jacket', head: 'glasses'}, ELDER: Look4 = {dress: 'jacket', head: 'short', build: 1.05};
const DAYS = ['14', '15', '16', '17', '18', '19', '20'], WEEK = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
const dayIdx = (tau: number) => BJ_T.tears.filter((x) => tau >= x).length;
const dayness = (tau: number) => { const a = BJ_T.tears[0], b = BJ_T.tears[5]; if (tau <= a || tau >= b) return 0; return 0.5 - 0.5 * Math.cos(2 * Math.PI * (tau - a) / 0.566); };

/* engineer poses: typing, arms crossed, chin on hand, leaning back, the reach to Enter */
const TYPE = (t: number, k = 1) => fkPose({hip: 0.37, lean: 16, neck: 8, lt: 88, lk: 92, rt: 84, rk: 86, la: 56 + 3 * Math.sin(t * 16) * k, le: 44, ra: 50 + 3 * Math.sin(t * 14 + 1) * k, re: 52});
const CROSS = fkPose({hip: 0.37, lean: -4, neck: 6, lt: 88, lk: 92, rt: 84, rk: 86, la: 60, le: 120, ra: 56, re: 116});
const CHIN = fkPose({hip: 0.37, lean: 20, neck: 4, lt: 88, lk: 92, rt: 84, rk: 86, la: 30, le: 140, ra: 52, re: 60});
const BACK = fkPose({hip: 0.37, lean: -10, neck: -6, lt: 80, lk: 84, rt: 76, rk: 80, la: 150, le: 150, ra: 146, re: 150});
const REACH = (tr: number, press: number) => fkPose({hip: 0.37, lean: 20, neck: 12, lt: 88, lk: 92, rt: 84, rk: 86, la: 40, le: 50, ra: 80 + tr - press * 3, re: -12 - press * 8});
const DAY_POSES = (t: number): Pose[] => [TYPE(t), CROSS, CHIN, TYPE(t, 0.3), BACK, CROSS, TYPE(t, 0.15)];
const HB = fkPose({hip: 0.655, lean: 2, neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: -28, le: 60, ra: -26, re: 64});

/** the green phosphor screen; `pow` = power-on (0..1); text grows; status line */
const Screen: React.FC<{t: number; tau: number; pow: number}> = ({t, tau, pow}) => {
	const T = BJ_T, n = Math.floor(SENT.length * seg(tau, T.typeA, T.typeB)), typedA = SENT.slice(0, Math.min(n, SENT_A.length)), typedB = n > SENT_A.length + 1 ? SENT.slice(SENT_A.length + 1, n) : '';
	const stuck = tau >= T.tears[0] && tau < T.ready, sent = tau >= T.enter, blink = stuck ? 1 : (Math.floor(t * 3) % 2 === 0 ? 1 : 0);
	const fs = 7.2, x0 = SCR.x + 14, lift = seg(tau, T.enter, T.enter + 0.35);
	const curX = x0 + (n > SENT_A.length ? typedB.length : typedA.length) * fs * 0.602, curY = n > SENT_A.length ? 560 : 548;
	const status = sent ? 'MAIL SENT  >  KARLSRUHE' : tau >= T.ready ? 'READY' : stuck ? 'MAIL WAITING ...' : '';
	const sy = pow < 1 ? Math.max(0.006, easeOut(seg(pow, 0.25, 1))) : 1;
	return <g>
		<rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill="#031008" />
		<g transform={`translate(0,${SCRC[1]}) scale(1,${sy}) translate(0,${-SCRC[1]})`} opacity={pow < 1 ? 1 : 1}>
			<rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill={CRT} opacity={0.05 + 0.5 * (1 - seg(pow, 0.3, 1))} />
			<g style={{fontFamily: MONO, fontSize: fs}} fill={CRT}>
				<text x={x0} y={488}>Date: Mon, 14 Sep 87 21:07 China Time</text>
				<text x={x0} y={512}>{LINE1}</text><text x={x0} y={524}>{LINE1b}</text>
				<g opacity={1 - lift}><text x={x0} y={548}>{typedA}</text><text x={x0} y={560}>{typedB}</text></g>
				{tau > T.typeA - 0.3 && <rect x={curX + 1} y={curY - fs + 1} width={fs * 0.6} height={fs} opacity={blink} />}
				{status && <text x={x0} y={600} opacity={0.9}>{status}</text>}
			</g>
			{lift > 0 && <g opacity={1 - seg(tau, T.enter + 0.2, T.enter + 0.5)}><rect x={x0} y={541} width={SENT_A.length * fs * 0.602 * (1 - lift * 0.3)} height={3} fill={GOLD} /><Glow x={SCRC[0]} y={550} r={120} c={GOLD} o={0.5 * (1 - lift)} id="bjLiftG" /></g>}
		</g>
		{Array.from({length: 58}, (_, i) => <rect key={i} x={SCR.x} y={SCR.y + i * 4} width={SCR.w} height={1.4} fill="#000" opacity={0.25} />)}
		{pow < 1 && <g><rect x={SCR.x} y={SCRC[1] - 1.2} width={SCR.w} height={2.4} fill="#f4fff6" opacity={1 - seg(pow, 0.5, 1)} /><Glow x={SCRC[0]} y={SCRC[1]} r={160} c="#c8ffd8" o={0.6 * (1 - seg(pow, 0.4, 1))} id="bjOnG" /></g>}
		<rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill="url(#bjTube)" />
	</g>;
};
const Calendar: React.FC<{tau: number}> = ({tau}) => {
	const T = BJ_T, x = 1700, y = 548, w = 124, h = 136, di = dayIdx(tau);
	const page = (i: number) => { const sun = i === 6; return <g>
		<rect x={x} y={y} width={w} height={h} fill="#F4EFE4" />
		<rect x={x} y={y} width={w} height={22} fill="#C8281E" />
		<text x={x + w / 2} y={y + 16} textAnchor="middle" style={{fontFamily: SANS, fontSize: 13, fontWeight: 700}} fill="#F4EFE4">1987 九月</text>
		<text x={x + w / 2} y={y + 98} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 70, fontWeight: 900}} fill={sun ? '#C8281E' : '#1a1a1a'}>{DAYS[i]}</text>
		<text x={x + w / 2} y={y + 124} textAnchor="middle" style={{fontFamily: SANS, fontSize: 15, fontWeight: 700}} fill={sun ? '#C8281E' : '#333'}>{WEEK[i]}</text></g>; };
	return <g>
		<path d={`M${x - 10},${DESK} L${x + 6},${y + 20} L${x + w - 6},${y + 20} L${x + w + 10},${DESK} Z`} fill="#3a2a20" />
		<rect x={x - 4} y={y - 6} width={w + 8} height={h + 12} fill="#d8d0bc" />
		{page(Math.min(6, di))}
		{/* the page torn off at each tear flutters down */}
		{T.tears.map((tk, i) => { const u = seg(tau, tk, tk + 0.5); if (u <= 0 || u >= 1) return null;
			return <g key={i} transform={`translate(${-30 * u + 40 * Math.sin(u * 6)},${u * u * 300}) rotate(${-50 * u} ${x + w / 2} ${y})`} opacity={1 - seg(u, 0.7, 1)}>{page(i)}</g>; })}
	</g>;
};
/** the room. `d` = dayness (0 night … 1 day) */
const Room: React.FC<{t: number; tau: number; pow: number; pose: Pose; finger: number; elder: number}> = ({t, tau, pow, pose, finger, elder}) => {
	const d = dayness(tau), hum = 0.96 + 0.04 * Math.sin(t * 50);
	const hand = jointAt(pose, 'RHand', EX, FLOOR, EH);
	return <g>
		<defs><radialGradient id="bjTube" cx="0.5" cy="0.5" r="0.7"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.7" /></radialGradient>
			<clipPath id="bjWinC"><rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} /></clipPath></defs>
		<rect x={-300} y={-300} width={W + 600} height={WALLB + 300} fill="#2E2A3A" />
		<rect x={-300} y={-300} width={W + 600} height={370} fill="#1d1a26" />
		{/* the fluorescent tube in the ceiling */}
		<path d="M820,18 L1240,18 L1226,46 L834,46 Z" fill="#141220" /><path d="M836,24 L1224,24 L1214,40 L846,40 Z" fill="#F2F6E8" opacity={hum} />
		<ellipse cx={1030} cy={150} rx={620} ry={200} fill="#F2F6E8" opacity={0.06} />
		{/* window: night (or day) over the hutong roofs */}
		<rect x={WIN.x - 14} y={WIN.y - 14} width={WIN.w + 28} height={WIN.h + 28} fill="#1a1722" />
		<g clipPath="url(#bjWinC)"><WindowView tau={tau} t={t} d={d} x={WIN.x} y={WIN.y} s={WIN.w / W} /></g>
		<rect x={WIN.x - 24} y={WIN.y + WIN.h + 10} width={WIN.w + 48} height={14} fill="#221f2c" />
		<rect x={0} y={0} width={W} height={WALLB} fill="#9fc0e8" opacity={0.08 * d} />
		{/* tall machine cabinets along the back wall (the mainframe's peripherals), no logos */}
		{[1560, 1730].map((cx, i) => <g key={i}><rect x={cx} y={WALLB - 560} width={160} height={560} fill="#3a3846" stroke="#141220" strokeWidth={3} />
			<rect x={cx + 16} y={WALLB - 530} width={128} height={44} fill="#0d0e12" />{Array.from({length: 10}, (_, j) => <circle key={j} cx={cx + 28 + (j % 5) * 26} cy={WALLB - 518 + Math.floor(j / 5) * 20} r={3.5} fill={rnd(j + i * 10, Math.floor(t * 2)) > 0.5 ? '#ffcf6a' : '#3a2f1a'} />)}
			<line x1={cx + 80} y1={WALLB - 470} x2={cx + 80} y2={WALLB - 10} stroke="#24222e" strokeWidth={3} /></g>)}
		<rect x={-300} y={WALLB} width={W + 600} height={500} fill="#1a1820" />
		<rect x={-200} y={WALLB - 8} width={W + 400} height={8} fill="#121019" />
		{/* the thermos on the floor */}
		<g><rect x={706} y={FLOOR - 186} width={58} height={176} rx={8} fill="#7a2a24" /><rect x={714} y={FLOOR - 206} width={42} height={22} rx={4} fill="#3a2a20" /><rect x={700} y={FLOOR - 12} width={70} height={12} fill="#2a1a18" /><rect x={716} y={FLOOR - 150} width={8} height={110} fill="#e8b0a0" opacity={0.25} /></g>
		{/* the elder (some days), standing by the window */}
		{elder > 0 && <g opacity={elder}><Rimmed x={620} ground={WALLB + 30} h={560} pose={HB} look={ELDER} col="#0d0c14" rimOp={0} T={t} /></g>}
		{/* desk */}
		<rect x={820} y={DESK} width={1100} height={20} fill="#3a2e26" /><rect x={1480} y={DESK + 20} width={400} height={FLOOR - DESK - 20} fill="#211a17" />
		<rect x={840} y={DESK + 20} width={20} height={FLOOR - DESK - 20} fill="#211a17" />
		{/* the CRT terminal */}
		<rect x={1270} y={660} width={140} height={30} fill="#4e4a40" />
		<rect x={1150} y={380} width={380} height={282} rx={18} fill="#5e5a4e" /><rect x={1168} y={396} width={344} height={258} rx={14} fill="#26251f" />
		<Screen t={t} tau={tau} pow={pow} />
		<Glow x={SCRC[0]} y={SCRC[1] + 60} r={420} c={CRT} o={0.12} id="bjCrtG" />
		{/* keyboard in front of the screen; the Enter key on the right */}
		<path d="M1078,712 L1336,712 L1328,688 L1088,688 Z" fill="#4e4a40" />
		{Array.from({length: 3}, (_, r) => Array.from({length: 11}, (_, i) => <rect key={`${r}_${i}`} x={1092 + i * 19 + r * 3} y={691 + r * 6.5} width={14} height={4.5} rx={1} fill="#c8c0a8" opacity={0.55} />))}
		<rect x={ENTER[0] - 12} y={ENTER[1] - 3 + finger * 2} width={26} height={11} rx={2} fill="#d8d0b8" opacity={0.85} />
		{/* tea in a glass jar */}
		<g><rect x={1592} y={604} width={54} height={86} rx={8} fill="#5a6a3a" opacity={0.45} /><rect x={1592} y={624} width={54} height={66} rx={6} fill="#8a7a2a" opacity={0.5} />
			{Array.from({length: 7}, (_, i) => <ellipse key={i} cx={1600 + rnd(i, 3) * 38} cy={660 + rnd(i, 4) * 26 + 2 * Math.sin(t + i)} rx={6} ry={2.5} fill="#3a4a1a" opacity={0.8} />)}
			<rect x={1588} y={596} width={62} height={12} rx={3} fill="#3a3a44" /><rect x={1596} y={612} width={6} height={70} fill="#ffffff" opacity={0.18} /></g>
		<Calendar tau={tau} />
		{/* the engineer, seated */}
		<path d={`M${EX - 96},${FLOOR} L${EX - 88},${FLOOR - 250} M${EX - 88},${FLOOR - 214} L${EX + 54},${FLOOR - 214} L${EX + 48},${FLOOR}`} stroke="#15131c" strokeWidth={12} fill="none" />
		<Rimmed x={EX} ground={FLOOR} h={EH} pose={pose} look={ENG} col={FIG} rim={CRT} rimOp={0.18} rimDx={2.2} rimDy={-0.6} T={t} />
		{/* the index finger (part of his hand): pointing down at Enter */}
		{finger > 0 && <path d={`M${hand[0] + 6},${hand[1] + 8} Q${hand[0] + 16},${hand[1] + 20} ${hand[0] + 14},${hand[1] + 30} L${hand[0] + 8},${hand[1] + 31} Q${hand[0] + 6},${hand[1] + 20} ${hand[0] - 4},${hand[1] + 12} Z`} fill={FIG} />}
	</g>;
};
/* ---------- the flight (r4, owner notes on r3): ONE camera and ONE light from the Enter key to the star ----------
   World units = the hutong plate's pixels. The window in the room is 16:9 and shows exactly this plate, so pushing the
   camera into the window until it fills the frame lands 1:1 on the plate: no cut. The light is one path in these units:
   screen → across the room → in through the window → down over the roofs, up the lane → over the trees into the sky.
   The camera tilts up after it until the frame holds only sky (the city falls away below). The sky (gradient + stars) is
   shared, so under it the plate gives way to the mountains (FL.hand: nothing in frame changes), and the camera tilts down
   after the light onto the Great Wall, which runs from the near hills to the horizon. The light runs the ridge to the
   horizon, carries on in the same line into one rising arc (camera tilting up after it) and settles as a star at screen
   (1152, 216): where the 1977 scene opens, on Ann's moon. */
type V2 = [number, number];
const SW = WIN.w / W;                                                              // room px per plate px
const r2p = (x: number, y: number): V2 => [(x - WIN.x) / SW, (y - WIN.y) / SW];   // room → plate/world
export const FL = {l0: 9.12, inWin: BJ_T.win, hand: BJ_T.wall, land: BJ_T.wallB, mid: 13.65, edge: BJ_T.climb, star: BJ_T.star};

/** monotone cubic through (xs, ys): no overshoot; end slopes m0, m1 (0 = ease) */
const mono = (xs: number[], ys: number[], m0 = 0, m1 = 0) => {
	const n = xs.length, h: number[] = [], dd: number[] = [], m: number[] = new Array(n).fill(0);
	for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; dd[i] = (ys[i + 1] - ys[i]) / h[i]; }
	m[0] = m0; m[n - 1] = m1;
	for (let i = 1; i < n - 1; i++) { if (dd[i - 1] * dd[i] <= 0) m[i] = 0; else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / dd[i - 1] + w2 / dd[i]); } }
	return (x: number) => {
		if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
		let i = 0; while (x > xs[i + 1]) i++;
		const u = (x - xs[i]) / h[i], u2 = u * u, u3 = u2 * u;
		return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h[i] * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h[i] * m[i + 1];
	};
};
/** Catmull–Rom through P at knots K (Barry–Goldman): knots = times gives C1 motion. P[0] and P[n-1] only shape the ends. */
const crAt = (P: number[][], K: number[], k: number): number[] => {
	const n = P.length; k = Math.max(K[1], Math.min(K[n - 2], k));
	let i = 1; while (i < n - 3 && k > K[i + 1]) i++;
	const mix = (a: number[], b: number[], ta: number, tb: number) => a.map((v, j) => ((tb - k) * v + (k - ta) * b[j]) / (tb - ta));
	const A1 = mix(P[i - 1], P[i], K[i - 1], K[i]), A2 = mix(P[i], P[i + 1], K[i], K[i + 1]), A3 = mix(P[i + 1], P[i + 2], K[i + 1], K[i + 2]);
	return mix(mix(A1, A2, K[i - 1], K[i + 1]), mix(A2, A3, K[i], K[i + 2]), K[i], K[i + 1]);
};
const centripetal = (P: number[][]) => { const K = [0]; for (let i = 1; i < P.length; i++) K.push(K[i - 1] + Math.sqrt(Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]))); return K; };

/* ---- the Great Wall country, laid out in its own frame ("B", 1920×1080 as seen when the light lands); world = B + (BX, BY) ---- */
const BX = 1800, BY = -170;
const farY = (x: number) => 476 - 30 * (0.5 + 0.5 * Math.sin(x * 0.0043 + 0.7)) - 12 * Math.sin(x * 0.0131 + 2.1);
const midY = (x: number) => 552 - 58 * (0.5 + 0.5 * Math.sin(x * 0.0029 + 2.0)) - 16 * Math.sin(x * 0.0093 + 0.4);
const footY = (x: number) => lerp(1100, 700, sm((x - 560) / 520)) - 26 * Math.sin(x * 0.0061 + 1.1) - 14 * Math.sin(x * 0.017);
const nearY = (x: number) => 908 - 52 * (0.5 + 0.5 * Math.sin(x * 0.0037 + 1.3)) - 14 * Math.sin(x * 0.011);
const range = (x0: number, x1: number, f: (x: number) => number, bot = 1800) => { let d = `M${x0},${bot} L${x0},${f(x0).toFixed(1)}`; for (let x = x0 + 30; x <= x1; x += 30) d += ` L${x},${f(x).toFixed(1)}`; return d + ` L${x1},${bot} Z`; };
const FAR_D = range(-2800, 4800, farY), MID_D = range(-2400, 4600, midY), FOOT_D = range(300, 4600, footY), NEAR_D = range(-2000, 4800, nearY);
/* the wall's ridge from the near hills (k = scale 1.3) to the horizon (k ≈ 0.08): peaks carry towers. Phantom ends. */
const XEND = 1272;
const RIDGE: number[][] = [[-900, 1190, 1.5], [-560, 1040, 1.3], [-200, 905, 1.12], [80, 800, 1.0], [330, 862, 0.85], [560, 722, 0.68], [722, 762, 0.55], [862, 650, 0.43], [962, 680, 0.35], [1050, 592, 0.27], [1110, 606, 0.22], [1165, 550, 0.17], [1205, 556, 0.14], [1242, 512, 0.11], [XEND, farY(XEND + 64) + 3, 0.085], [1300, farY(XEND + 64) - 8, 0.07]];
const TOWERS = [3, 5, 7, 9, 11, 13];   // indices into RIDGE (peaks)
const RK = centripetal(RIDGE);
/** ridge samples: x, y, k, v (v = RIDGE index, fractional) */
const RS: number[][] = (() => { const out: number[][] = []; for (let i = 1; i < RIDGE.length - 2; i++) for (let j = 0; j < 24; j++) { const u = j / 24, p = crAt(RIDGE, RK, lerp(RK[i], RK[i + 1], u)); out.push([p[0], p[1], p[2], i + u]); }
	const p = RIDGE[RIDGE.length - 2]; out.push([p[0], p[1], p[2], RIDGE.length - 2]); return out; })();
const walkY = (y: number, k: number) => y - 27 * k;                                // the light rides on the wall-walk
const ridgeAtV = (v: number) => { const i = Math.max(0, Math.min(RS.length - 2, RS.findIndex((s) => s[3] > v) - 1)), a = RS[i], b = RS[i + 1], u = cl((v - a[3]) / (b[3] - a[3])); return a.map((q, j) => lerp(q, b[j], u)); };
const V_LAND = 3.4;   // on the down-slope just past the first tower: the light arrives moving the way the wall runs
const LAND = ((p) => [p[0] + BX, walkY(p[1], p[2]) + BY])(ridgeAtV(V_LAND));
/* the star: B (1395, −170); the last camera puts it at screen (1152, 216) */
const STAR_B: V2 = [1395, -170], STAR: V2 = [STAR_B[0] + BX, STAR_B[1] + BY], ZF = 1.1;
const CAMF: V2 = [STAR[0] - (1152 - 960) / ZF, STAR[1] - (216 - 540) / ZF];
/** the run: the wall-walk from the landing to the horizon, then the lift-off arc (B coords): x, y, k, v, s */
const RUN: number[][] = (() => {
	const out: number[][] = [((p) => [p[0], walkY(p[1], p[2]), p[2], V_LAND, 0])(ridgeAtV(V_LAND)), ...RS.filter((s) => s[3] > V_LAND + 0.005).map((s) => [s[0], walkY(s[1], s[2]), s[2], s[3], 0])];
	const F = out[out.length - 1], E = out[out.length - 4], tl = Math.hypot(F[0] - E[0], F[1] - E[1]), tg = [(F[0] - E[0]) / tl, (F[1] - E[1]) / tl], L = Math.hypot(STAR_B[0] - F[0], STAR_B[1] - F[1]);
	const C1 = [F[0] + tg[0] * 0.36 * L, F[1] + tg[1] * 0.36 * L], C2 = [STAR_B[0] + 0.02 * L, STAR_B[1] + 0.42 * L];
	for (let j = 1; j <= 60; j++) { const u = j / 60, a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, e = u ** 3; out.push([a * F[0] + b * C1[0] + c * C2[0] + e * STAR_B[0], a * F[1] + b * C1[1] + c * C2[1] + e * STAR_B[1], F[2], 99, 0]); }
	for (let i = 1; i < out.length; i++) { const a = out[i - 1], b = out[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]); out[i][4] = a[4] + len / Math.pow(Math.max(0.1, b[2]), 0.5); }   // same measure on wall and arc: no speed jump at the horizon
	return out; })();
const S_EDGE = RUN.find((r) => r[3] === 99)![4], S_END = RUN[RUN.length - 1][4];
const runAt = (s: number) => { let i = 0; while (i < RUN.length - 2 && RUN[i + 1][4] < s) i++; const a = RUN[i], b = RUN[i + 1], u = cl((s - a[4]) / (b[4] - a[4])); return a.map((q, j) => lerp(q, b[j], u)); };

/* ---- the light's path through the room, the hutong and the sky: [t, x, y, size] in plate/world units ---- */
const P1R: V2 = [1285, 541], P2R: V2 = [1160, 352], Q0 = ((0.12 / 0.22) ** 2);   // phantom chosen so the light starts from rest on the text
const CH: number[][] = [
	[9.0, ...r2p(P1R[0] + (P2R[0] - P1R[0]) * Q0, P1R[1] + (P2R[1] - P1R[1]) * Q0), 150],
	[9.12, ...r2p(...P1R), 150], [9.34, ...r2p(...P2R), 150], [9.55, ...r2p(920, 262), 145], [9.75, ...r2p(700, 300), 135],   // off the screen → over his head → in at the window
	[9.93, 1480, 540, 112], [10.12, 1230, 770, 88], [10.32, 850, 900, 66], [10.52, 700, 760, 50], [10.72, 600, 600, 40],   // down over the roofs, up the lane
	[10.92, 590, 410, 33], [11.12, 660, 200, 29], [11.34, 840, -30, 27], [11.6, 980, -290, 26], [11.86, 1200, -440, 26],   // over the trees, up into the sky
	[12.1, 1460, -470, 26], [12.37, 1630, -300, 28], [12.62, 1735, 110, 30], [12.8, 1850, 465, 32], [FL.land, LAND[0], LAND[1], 33],   // over the top, down, skimming the first tower onto the wall
	[FL.land + 0.14, ...((p) => [p[0] + BX, walkY(p[1], p[2]) + BY])(ridgeAtV(V_LAND + 0.5)), 31],
];
const CHK = CH.map((c) => c[0]), CHP = CH.map((c) => c.slice(1));
const chainAt = (tau: number) => crAt(CHP, CHK, tau);
const V_ARR = ((a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) / 0.01)(chainAt(FL.land), chainAt(FL.land - 0.01));   // arrival speed on the wall
const RUN_S = mono([FL.land, FL.mid, FL.edge, FL.edge + 0.32, FL.star], [0, 0.56 * S_EDGE, S_EDGE, S_EDGE + 0.6 * (S_END - S_EDGE), S_END], V_ARR, 0);
/** the light at time tau: world x, y, size; v = position on the wall (−1 before it lands, 99 after it leaves) */
const lightAt = (tau: number) => {
	if (tau < FL.land) { const p = chainAt(tau); return {x: p[0], y: p[1], r: p[2], v: -1, s: -1}; }
	const s = RUN_S(tau), p = runAt(s), lift = p[3] >= 99 ? cl((s - S_EDGE) / (S_END - S_EDGE)) : 0;
	return {x: p[0] + BX, y: p[1] + BY, r: p[3] >= 99 ? lerp(Math.max(8, 36 * p[2]), 11, lift) : Math.max(8, 36 * p[2]), v: p[3], s};
};

/* ---- the camera: [t, cx, cy, zoom] (world point at the centre of the frame) ---- */
const PFP = r2p(1150, 560), WCP = r2p(590, 385), PBK = r2p(900, 410);
const CAMK: number[][] = [
	[9.0, PFP[0], PFP[1], 2.3 * SW], [9.215, PFP[0], PFP[1], 2.3 * SW],          // = the push on his hand (r3 camera at T.out)
	[9.55, PBK[0], PBK[1], 1.85 * SW], [9.88, WCP[0], WCP[1], 2.45 * SW],         // ease back to follow the light across the room, then in at the window
	[FL.inWin, 960, 540, 1.03],                                                     // the window fills the frame = the plate
	[10.55, 1060, 600, 1.15], [10.9, 880, 560, 1.22], [11.25, 900, 170, 1.1],      // over the roofs and up the lane → tilt up
	[11.6, 965, -200, 1.07], [11.8, 985, -360, 1.04],                               // the city drops out of the bottom of the frame
	[12.08, 1300, -480, 1.0], [12.5, 1780, -130, 1.0],                              // only sky (hand-off); then tilt down after the light
	[FL.land, 520 + BX, 560 + BY, 1.0], [FL.mid, 760 + BX, 520 + BY, 1.05], [FL.edge, 980 + BX, 470 + BY, 1.1],   // along the wall
	[FL.star, CAMF[0], CAMF[1] + 24, ZF], [BJ_T.end, CAMF[0], CAMF[1], ZF], [15.6, CAMF[0], CAMF[1] - 24, ZF],   // tilt up after the climb, still creeping on the star
];
const camX = mono(CAMK.map((c) => c[0]), CAMK.map((c) => c[1])), camY = mono(CAMK.map((c) => c[0]), CAMK.map((c) => c[2])), camZ = mono(CAMK.map((c) => c[0]), CAMK.map((c) => Math.log(c[3])));
const camAt = (tau: number) => { let cx = camX(tau), cy = camY(tau); const z = Math.exp(camZ(tau));
	if (tau >= FL.inWin && tau < FL.hand) {   // safety: while the plate is in frame its edges stay outside it
		const m = 14 / z, bot = cy + 540 / z, k = sm(seg(bot, 140, 200));
		const lo = 960 / z + m, hi = W - 960 / z - m; cx = lerp(cx, lo < hi ? Math.max(lo, Math.min(hi, cx)) : W / 2, k);
		cy = Math.min(cy, 1080 - 540 / z - m);
	}
	return {cx, cy, z}; };
const PB_X = camX(FL.edge);   // parallax reference: the layers line up exactly when the light reaches the horizon

/* ---- shared sky (world-fixed): one gradient and one star field for the window, the rise, and the Wall ---- */
const SKY_STOPS: [number, string][] = [[-1500, '#06071a'], [-700, '#0f1129'], [-200, '#1b1e3a'], [0, '#21243c'], [120, '#272b3f'], [200, '#2b2c42'], [255, '#2e2d43'], [330, '#302f47']];
const SkyBg: React.FC<{rc: number[]}> = ({rc}) => <g>
	<defs><linearGradient id="bjSkyW" gradientUnits="userSpaceOnUse" x1={0} y1={SKY_STOPS[0][0]} x2={0} y2={SKY_STOPS[SKY_STOPS.length - 1][0]}>
		{SKY_STOPS.map(([y, c], i) => <stop key={i} offset={(y - SKY_STOPS[0][0]) / (SKY_STOPS[SKY_STOPS.length - 1][0] - SKY_STOPS[0][0])} stopColor={c} />)}</linearGradient></defs>
	<rect x={rc[0]} y={rc[1]} width={rc[2] - rc[0]} height={rc[3] - rc[1]} fill="url(#bjSkyW)" /></g>;
/** stars fixed in the world (cells of 220): drawn as short streaks along the camera's move (motion blur) */
const Stars: React.FC<{rc: number[]; t: number; mv?: V2; rot?: number; trails?: number}> = ({rc, t, mv = [0, 0], rot = 0, trails = 0}) => {
	const C = 220, out: React.ReactNode[] = [], tr: React.ReactNode[] = [], streak = Math.hypot(mv[0], mv[1]) > 4, sk = 0.3;
	for (let gx = Math.floor(rc[0] / C); gx <= Math.floor(rc[2] / C); gx++) for (let gy = Math.floor(rc[1] / C); gy <= Math.min(1, Math.floor(rc[3] / C)); gy++) for (let j = 0; j < 5; j++) {
		const id = gx * 7919 + gy * 104729 + j * 13, x = (gx + rnd(id, 40)) * C, y = (gy + rnd(id, 41)) * C; if (y > 300) continue;
		const b = rnd(id, 42), tw = 0.6 + 0.4 * Math.sin(t * (0.8 + 2 * rnd(id, 43)) + id), r = 0.7 + 1.8 * b ** 4, op = (0.2 + 0.7 * b) * tw * (1 - 0.6 * sm(seg(y, 120, 300)));
		out.push(streak ? <line key={id} x1={x} y1={y} x2={x + mv[0] * sk} y2={y + mv[1] * sk} stroke="#eef0ff" strokeWidth={2 * r} strokeLinecap="round" opacity={op} /> : <circle key={id} cx={x} cy={y} r={r} fill="#eef0ff" opacity={op} />);
		if (b > 0.975 && !streak) out.push(<path key={`g${id}`} d={`M${x - 10},${y} L${x + 10},${y} M${x},${y - 10} L${x},${y + 10}`} stroke="#eef0ff" strokeWidth={0.9} opacity={0.5 * tw} />);
		if (trails > 0 && b > 0.35) { const dx = x - STAR[0], dy = y - STAR[1], rr = Math.hypot(dx, dy), a0 = Math.atan2(dy, dx), a1 = a0 + rot * Math.PI / 180;
			if (rr > 30) tr.push(<path key={`t${id}`} d={`M${(STAR[0] + rr * Math.cos(a0)).toFixed(1)},${(STAR[1] + rr * Math.sin(a0)).toFixed(1)} A${rr.toFixed(1)},${rr.toFixed(1)} 0 0,1 ${(STAR[0] + rr * Math.cos(a1)).toFixed(1)},${(STAR[1] + rr * Math.sin(a1)).toFixed(1)}`} stroke="#dfe6ff" strokeWidth={0.6 + r * 0.5} fill="none" opacity={0.45 * op * trails} />); }
	}
	return <g>{tr.length > 0 && <g>{tr}</g>}<g transform={rot ? `rotate(${rot} ${STAR[0]} ${STAR[1]})` : undefined}>{out}</g></g>;
};
/** a few thin clouds high over the city, lit faintly from below (shared by both worlds, world-fixed: they give the rise depth) */
const CLOUDS: number[][] = [[620, -150, 520, 34, 0.16], [1260, -330, 640, 40, 0.14], [430, -520, 460, 30, 0.1], [1720, -560, 700, 46, 0.13], [2240, -300, 560, 36, 0.12], [1020, -760, 600, 40, 0.09], [2620, -620, 520, 34, 0.1], [3050, -180, 640, 40, 0.11]];
const Clouds: React.FC<{t: number}> = ({t}) => <g>
	<defs><radialGradient id="bjCld"><stop offset="0" stopColor="#8a7f9a" stopOpacity="1" /><stop offset="0.55" stopColor="#6a6482" stopOpacity="0.5" /><stop offset="1" stopColor="#4a4866" stopOpacity="0" /></radialGradient></defs>
	{CLOUDS.map(([x, y, w, h, o], i) => { const dx = 6 * (t - 150); return <g key={i} opacity={o}>
		<ellipse cx={x + dx} cy={y} rx={w} ry={h} fill="url(#bjCld)" /><ellipse cx={x + dx - w * 0.35} cy={y + h * 0.35} rx={w * 0.55} ry={h * 0.7} fill="url(#bjCld)" /><ellipse cx={x + dx + w * 0.4} cy={y - h * 0.2} rx={w * 0.5} ry={h * 0.6} fill="url(#bjCld)" /></g>; })}
</g>;
/** the hutong plate: its painted sky melts into the shared sky (mask), a cyclist rides up the lane */
const PlateA: React.FC<{tau: number}> = ({tau}) => { const e = Math.pow(seg(tau, 8.6, 12.4), 0.85);
	return <g>
		<defs><linearGradient id="bjPlMG" gradientUnits="userSpaceOnUse" x1={0} y1={165} x2={0} y2={258}><stop offset="0" stopColor="#000" /><stop offset="1" stopColor="#fff" /></linearGradient>
			<mask id="bjPlM" maskUnits="userSpaceOnUse" x={-10} y={-10} width={W + 20} height={1100}><rect x={-10} y={-10} width={W + 20} height={1100} fill="url(#bjPlMG)" /></mask></defs>
		<image href={staticFile('ep41/bj_night.webp')} x={0} y={0} width={W} height={1080} preserveAspectRatio="none" mask="url(#bjPlM)" />
		<Sprite k="cyclist" x={lerp(872, 566, e)} y={lerp(1125, 592, e)} h={lerp(158, 36, e)} c="#14121c" sink={2} />
	</g>; };
/** the view through the window during the time-lapse (same plate, same sky), with a day grade */
const WindowView: React.FC<{tau: number; t: number; d: number; x: number; y: number; s: number}> = ({tau, t, d, x, y, s}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<SkyBg rc={[0, 0, W, 1080]} /><Stars rc={[0, 0, W, 300]} t={t} /><Clouds t={t} /><PlateA tau={tau} />
	{d > 0 && <g><rect x={0} y={0} width={W} height={1080} fill="#6E9BD0" opacity={0.62 * d} /><rect x={0} y={0} width={W} height={330} fill="#a8c8ec" opacity={0.6 * d} /><Glow x={1500} y={160} r={160} c="#fff4d8" o={0.8 * d} id="bjSun" /></g>}
</g>;

/** the Great Wall country (world units). off(f): horizontal parallax of a layer at depth f against the camera */
const LandB: React.FC<{cx: number; t: number; tau: number; v: number}> = ({cx, t, tau, v}) => {
	const off = (f: number) => (cx - PB_X) * (1 - f);
	let top = '', bot = ''; RS.forEach((s, i) => { top += `${i ? 'L' : 'M'}${s[0].toFixed(1)},${(s[1] - 22 * s[2]).toFixed(1)} `; }); for (let i = RS.length - 1; i >= 0; i--) bot += `L${RS[i][0].toFixed(1)},${(RS[i][1] + 10 * RS[i][2]).toFixed(1)} `;
	const end = RS[RS.length - 1];
	let mount = `M${RS[0][0]},${RS[0][1] + 4}`; RS.forEach((s) => { mount += ` L${s[0].toFixed(1)},${(s[1] + 4 * s[2]).toFixed(1)}`; });
	mount += ` L${end[0] + 140},${end[1] + 22} L${end[0] + 420},${end[1] + 92} L${end[0] + 800},${end[1] + 200} L${end[0] + 1300},${end[1] + 360} L${end[0] + 2200},1800 L-2400,1800 L-2400,${RS[0][1] + 60} Z`;
	const cren: React.ReactNode[] = []; let acc = 0; for (let i = 1; i < RS.length; i++) { const a = RS[i - 1], b = RS[i]; acc += Math.hypot(b[0] - a[0], b[1] - a[1]); const st = 15 * b[2]; if (acc >= st) { acc = 0; cren.push(<rect key={i} x={b[0] - 4 * b[2]} y={b[1] - 22 * b[2] - 9 * b[2]} width={8 * b[2]} height={10 * b[2]} fill="url(#bjWallC)" />); } }
	const towers = TOWERS.map((ti) => { const s = ridgeAtV(ti), k = s[2], x = s[0], y = s[1], w = 84 * k, hgt = 74 * k, lit = ti < V_LAND ? sm(seg(tau, FL.land - 0.12, FL.land + 0.2)) : sm(seg(v, ti - 0.15, ti + 0.25)), tt = y - 22 * k - hgt;
		return <g key={ti}><rect x={x - w / 2} y={tt} width={w} height={hgt + 30 * k} fill="#454d77" />{[-0.48, -0.26, -0.04, 0.18, 0.4].map((dx, j) => <rect key={j} x={x + dx * w} y={tt - 11 * k} width={0.12 * w} height={12 * k} fill="#454d77" />)}
			<rect x={x - w / 2} y={tt} width={w} height={2.5 * k} fill="#6a74a6" opacity={0.6} />
			<path d={`M${x - 8 * k},${tt + 52 * k} L${x - 8 * k},${tt + 32 * k} Q${x},${tt + 24 * k} ${x + 8 * k},${tt + 32 * k} L${x + 8 * k},${tt + 52 * k} Z`} fill={lit > 0 ? '#ffcf8a' : '#0c0e1c'} opacity={lit > 0 ? 0.35 + 0.65 * lit : 1} />
			{lit > 0 && <Glow x={x} y={tt + 36 * k} r={130 * k} c={GOLD} o={0.4 * lit} id={`bjTw${ti}`} />}</g>; });
	const trees = Array.from({length: 40}, (_, i) => { const x = -1600 + i * 160 + 90 * rnd(i, 4), gy = nearY(x) + 4, hh = 50 + 50 * rnd(i, 5);
		return rnd(i, 6) > 0.25 ? <path key={i} d={`M${x},${gy - hh} L${x + 22},${gy + 6} L${x - 22},${gy + 6} Z`} fill="#06070d" /> : <ellipse key={i} cx={x} cy={gy - 10} rx={24} ry={18} fill="#06070d" />; });
	void t;
	return <g>
		<defs><linearGradient id="bjWallC" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={XEND} y2={0}><stop offset="0.1" stopColor="#3e4568" /><stop offset="1" stopColor="#2a2f4e" /></linearGradient>
			<linearGradient id="bjMtnC" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={XEND + 300} y2={0}><stop offset="0.1" stopColor="#0c0f24" /><stop offset="1" stopColor="#1b1f3b" /></linearGradient>
			<linearGradient id="bjFootC" gradientUnits="userSpaceOnUse" x1={0} y1={640} x2={0} y2={980}><stop offset="0" stopColor="#141831" /><stop offset="1" stopColor="#0b0d1e" /></linearGradient>
			<linearGradient id="bjHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3a5a" stopOpacity="0" /><stop offset="0.5" stopColor="#3a3a5a" stopOpacity="0.32" /><stop offset="1" stopColor="#3a3a5a" stopOpacity="0" /></linearGradient></defs>
		<g transform={`translate(${off(0.86)},0)`}><path d={FAR_D} fill="#20243f" /></g>
		<rect x={-3000} y={430} width={8000} height={90} fill="url(#bjHaze)" />
		<g transform={`translate(${off(0.93)},0)`}><path d={MID_D} fill="#161a33" /></g>
		<path d={mount} fill="url(#bjMtnC)" />
		<path d={top + bot + 'Z'} fill="url(#bjWallC)" />
		<path d={top} fill="none" stroke="#6a74a6" strokeWidth={1.6} opacity={0.55} />
		{cren}{towers}
		<g transform={`translate(${off(1.05)},0)`}><path d={FOOT_D} fill="url(#bjFootC)" /></g>
		<g transform={`translate(${off(1.12)},0)`}><path d={NEAR_D} fill="#07080f" />{trees}</g>
	</g>;
};

/* ---- drawing the light ---- */
const strokeSet = (pts: number[][], wf: (i: number) => number, op = 1, key = 'c') =>
	([[4, GOLD, 0.16], [1.6, GOLD, 0.6], [0.6, '#fff6d8', 1]] as [number, string, number][]).map(([mul, col, o], pi) => <g key={`${key}${pi}`} opacity={o * op}>
		{pts.slice(0, -1).map((p, i) => { const q = pts[i + 1], w = wf(i) * mul; return w < 0.05 ? null : <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={col} strokeWidth={w} strokeLinecap="round" />; })}</g>);
/** the light in world units: comet tail + head; on the wall the lit wall-walk stays behind it; then the climb and the star */
const LightFx: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	if (tau < FL.l0) return null;
	const N = 24, dt = 1 / 90, tail: number[][] = [];
	for (let j = 0; j <= N; j++) { const tj = tau - j * dt; if (tj < FL.l0 - 0.02) break; const L = lightAt(tj); tail.push([L.x, L.y, L.r]); }
	const H0 = lightAt(tau), starK = sm(seg(tau, FL.star - 0.2, FL.star + 0.15)), fade = 1 - seg(tau, FL.star, FL.star + 0.3);
	const parts: React.ReactNode[] = [];
	if (H0.s > 0) {   // the lit wall-walk and the climb, kept as a trail
		const pts = RUN.filter((r) => r[4] <= H0.s).map((r) => [r[0] + BX, r[1] + BY, r[2], r[3]]); pts.push([H0.x, H0.y, H0.r / 36, H0.v]);
		const wall = pts.filter((p) => p[3] < 99), climb = pts.filter((p, i) => p[3] >= 99 || (i + 1 < pts.length && pts[i + 1][3] >= 99));
		const dim = 1 - 0.35 * seg(tau, FL.edge, FL.star + 0.3);
		parts.push(...strokeSet(wall, (i) => Math.max(0.9, 6.5 * wall[i][2]), 0.85 * dim, 'w'));
		if (climb.length > 1) parts.push(...strokeSet(climb, (i) => 1.5 * (0.45 + 0.55 * i / climb.length), 0.9 * (1 - 0.75 * seg(tau, FL.star - 0.05, FL.star + 0.34)), 'k'));
	}
	parts.push(...strokeSet(tail, (i) => tail[i][2] * 0.13 * Math.pow(1 - i / N, 0.8), 1, 'h'));
	const r = H0.r * (0.25 + 0.75 * sm(seg(tau, FL.l0, FL.l0 + 0.12)));
	return <g>{parts}
		<Glow x={H0.x} y={H0.y} r={r * 2.6} c={GOLD} o={0.3 * fade + 0.1} id="bjHdA" />
		<Glow x={H0.x} y={H0.y} r={r} c="#fff6d8" o={0.95} id="bjHdB" />
		{starK > 0 && <g>
			<Glow x={STAR[0]} y={STAR[1]} r={84} c="#fff4d8" o={0.5 * starK} id="bjStarG" />
			<circle cx={STAR[0]} cy={STAR[1]} r={4.2} fill="#fff8e8" opacity={starK} />
			<path d={`M${STAR[0] - 30},${STAR[1]} L${STAR[0] + 30},${STAR[1]} M${STAR[0]},${STAR[1] - 30} L${STAR[0]},${STAR[1] + 30}`} stroke="#fff4d8" strokeWidth={1.4} opacity={starK * (0.6 + 0.4 * Math.sin(t * 6))} /></g>}
	</g>;
};

export const BJ3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = BJ_T, d = drift(t, 1);
	// the room: power-on CU → pull back → locked time-lapse → push to the hand → Enter → follow the light into the window
	if (tau < FL.inWin) {
		const pow = seg(tau, T.on, T.onB), di = dayIdx(tau), poses = DAY_POSES(t);
		let pose = tau < T.tears[0] ? TYPE(t) : mixPose(poses[Math.max(0, di - 1)], poses[di], sm(seg(tau, T.tears[di - 1] ?? 0, (T.tears[di - 1] ?? 0) + 0.14)));
		const tr = 1.2 * Math.sin(t * 9) * (1 - seg(tau, T.enter - 0.1, T.enter)), press = seg(tau, T.enter - 0.05, T.enter) * (1 - seg(tau, T.enter + 0.3, T.enter + 0.5));
		if (tau >= T.retype) pose = mixPose(mixPose(poses[6], TYPE(t), sm(seg(tau, T.retype, T.retype + 0.2))), REACH(tr, press), sm(seg(tau, T.hover - 0.35, T.hover)));
		const finger = sm(seg(tau, T.hover - 0.3, T.hover)) * (1 - seg(tau, T.out + 0.4, T.out + 0.7));
		const elder = di % 2 === 1 && di < 6 ? sm(seg(tau, T.tears[di - 1], T.tears[di - 1] + 0.1)) : 0;
		let zoom: number, fx: number, fy: number, px: number, py: number;
		if (tau < T.out) {   // camera: CRT close-up (fills the frame) → room → push to the hand (unchanged from r3)
			const Z0 = W / SCR.w, u = ease(seg(tau, T.pullA, T.pullB)), zA = Math.pow(Z0, 1 - u), kA = (zA - 1) / (Z0 - 1);
			const pk = ease(seg(tau, T.push, T.hover + 0.2)), zP = lerp(1, 2.3, pk), PF: [number, number] = [1150, 560];
			const shake = tau > T.enter && tau < T.enter + 0.1 ? 6 * Math.sin(t * 200) : 0;
			zoom = tau < T.pullB ? zA : zP;
			fx = tau < T.pullB ? SCRC[0] : lerp(960, PF[0], sm(pk * 2)); fy = tau < T.pullB ? SCRC[1] : lerp(560, PF[1], sm(pk * 2));
			px = (tau < T.pullB ? (960 - SCRC[0]) * kA + d.px * (1 - kA) : lerp(0, 960 - PF[0], sm(pk * 2)) + d.px) + shake;
			py = tau < T.pullB ? (540 - SCRC[1]) * kA + d.py * (1 - kA) : lerp(0, 540 - PF[1], sm(pk * 2)) + d.py;
		} else {   // the flight camera, seen in room units
			const c = camAt(tau), rc: V2 = [WIN.x + c.cx * SW, WIN.y + c.cy * SW];
			zoom = c.z / SW; fx = rc[0]; fy = rc[1]; px = 960 - rc[0] + d.px; py = 540 - rc[1] + d.py;
		}
		return <g><Cam zoom={zoom} fx={fx} fy={fy} px={px} py={py}>
			<Room t={t} tau={tau} pow={pow} pose={pose} finger={finger} elder={elder} />
			<g transform={`translate(${WIN.x},${WIN.y}) scale(${SW})`}><LightFx tau={tau} t={t} /></g>
		</Cam></g>;
	}
	// outside: the plate, the sky, the Wall — one world, one camera
	const c = camAt(tau), p = camAt(tau - 1 / 60), mv: V2 = [c.cx - p.cx, c.cy - p.cy];
	const hw = 960 / c.z + 60, hh = 540 / c.z + 60, rot = 22 * easeIn(seg(tau, T.trails, T.end)), trails = sm(seg(tau, T.trails, T.trails + 0.2));
	const rc = [c.cx - hw - (rot ? 600 : 0), c.cy - hh - (rot ? 600 : 0), c.cx + hw + (rot ? 600 : 0), c.cy + hh];
	const bl: V2 = [Math.max(0, Math.abs(mv[0]) - 6) * 0.22, Math.max(0, Math.abs(mv[1]) - 6) * 0.22], blur = Math.max(bl[0], bl[1]) > 0.8;
	const L = lightAt(tau);
	return <g transform={`translate(${960 + d.px},${540 + d.py}) scale(${c.z}) translate(${-c.cx},${-c.cy})`}>
		<SkyBg rc={rc} />
		<Stars rc={rc} t={t} mv={rot ? [0, 0] : mv} rot={rot} trails={trails} />
		<Clouds t={t} />
		{blur && <defs><filter id="bjMB" filterUnits="userSpaceOnUse" x={rc[0]} y={rc[1]} width={rc[2] - rc[0]} height={rc[3] - rc[1]}><feGaussianBlur stdDeviation={`${bl[0].toFixed(2)} ${bl[1].toFixed(2)}`} /></filter></defs>}
		<g filter={blur ? 'url(#bjMB)' : undefined}>
			{tau < FL.hand ? <PlateA tau={tau} /> : <g transform={`translate(${BX},${BY})`}><LandB cx={c.cx} t={t} tau={tau} v={L.v} /></g>}
		</g>
		<LightFx tau={tau} t={t} />
	</g>;
};
void cl; void lerp; void easeOut; void StarField;
