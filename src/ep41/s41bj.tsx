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
   the engineer's finger hovers → Enter on the hit (154.095) → a line of gold light leaves through the window, over the
   hutong roofs, along the Great Wall on its own ridge at night, climbs into the sky and becomes one star; the sky then
   turns backwards (1987 → 1977, director's approved #14; set `trails` past `end` to drop it).
   Entrance: the CRT power-on line (match on text: LO left the frame at the same spot). */
export const BJ_T = {
	on: 0, onB: 0.35, j1: 0.5, typeA: 0.75, typeB: 2.9, pullA: 2.0, pullB: 3.75,
	j2: 3.9, tears: [3.867, 4.433, 4.999, 5.565, 6.131, 6.697], retype: 6.95, ready: 7.3, push: 7.0, hover: 7.6,
	enter: 8.395, out: 8.5, win: 9.25, roofsB: 10.75, wall: 11.05, wallB: 13.5, climb: 13.45, star: 14.25, trails: 14.3, end: 15.185,
};
const GOLD = '#F2CF7A', CRT = '#8DFFAE', FIG = '#0B0A12';
const LINE1 = 'Ueber die Grosse Mauer erreichen wir alle';
const LINE1b = 'Ecken der Welt.';
const SENT = 'Across the Great Wall we can reach every corner in the world.';
const SENT_A = 'Across the Great Wall we can reach every', SENT_B = 'corner in the world.';
/* room geometry (world, zoom 1) */
const SCR = {x: 1185, y: 410, w: 310, h: 230}, SCRC: [number, number] = [SCR.x + SCR.w / 2, SCR.y + SCR.h / 2];
const WIN = {x: 140, y: 220, w: 620, h: 349}, WINC: [number, number] = [WIN.x + WIN.w / 2, WIN.y + WIN.h / 2];
const DESK = 690, FLOOR = 960, WALLB = 870, EX = 960, EH = 600, ENTER: [number, number] = [1302, 694];
const ENG: Look4 = {dress: 'jacket', head: 'glasses'}, ELDER: Look4 = {dress: 'jacket', head: 'short', build: 1.05};
const DAYS = ['14', '15', '16', '17', '18', '19', '20'], WEEK = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
const dayIdx = (tau: number) => BJ_T.tears.filter((x) => tau >= x).length;
const dayness = (tau: number) => { const a = BJ_T.tears[0], b = BJ_T.tears[5]; if (tau <= a || tau >= b) return 0; return 0.5 - 0.5 * Math.cos(2 * Math.PI * (tau - a) / 0.566); };

/* engineer poses: typing, arms crossed, chin on hand, leaning back, the reach to Enter */
const TYPE = (t: number, k = 1) => fkPose({hip: 0.37, lean: 16, neck: 8, lt: 88, lk: 92, rt: 84, rk: 86, la: 56 + 3 * Math.sin(t * 16) * k, le: 44, ra: 50 + 3 * Math.sin(t * 14 + 1) * k, re: 52});
const CROSS = fkPose({hip: 0.37, lean: -4, neck: 6, lt: 88, lk: 92, rt: 84, rk: 86, la: 60, le: 120, ra: 56, re: 116});
const CHIN = fkPose({hip: 0.37, lean: 20, neck: 4, lt: 88, lk: 92, rt: 84, rk: 86, la: 30, le: 140, ra: 52, re: 60});
const BACK = fkPose({hip: 0.37, lean: -10, neck: -6, lt: 80, lk: 84, rt: 76, rk: 80, la: 150, le: 150, ra: 146, re: 150});
const REACH = (tr: number, press: number) => fkPose({hip: 0.37, lean: 20, neck: 12, lt: 88, lk: 92, rt: 84, rk: 86, la: 40, le: 50, ra: 80 + tr - press * 4, re: 6 + press * 8});
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
		<rect x={-200} y={0} width={W + 400} height={WALLB} fill="#2E2A3A" />
		<rect x={-200} y={0} width={W + 400} height={70} fill="#1d1a26" />
		{/* the fluorescent tube in the ceiling */}
		<path d="M820,18 L1240,18 L1226,46 L834,46 Z" fill="#141220" /><path d="M836,24 L1224,24 L1214,40 L846,40 Z" fill="#F2F6E8" opacity={hum} />
		<ellipse cx={1030} cy={150} rx={620} ry={200} fill="#F2F6E8" opacity={0.06} />
		{/* window: night (or day) over the hutong roofs */}
		<rect x={WIN.x - 14} y={WIN.y - 14} width={WIN.w + 28} height={WIN.h + 28} fill="#1a1722" />
		<g clipPath="url(#bjWinC)"><WindowView tau={tau} t={t} d={d} x={WIN.x} y={WIN.y} s={WIN.w / W} /></g>
		<path d={`M${WIN.x + WIN.w / 2},${WIN.y} L${WIN.x + WIN.w / 2},${WIN.y + WIN.h} M${WIN.x},${WIN.y + WIN.h * 0.38} L${WIN.x + WIN.w},${WIN.y + WIN.h * 0.38}`} stroke="#1a1722" strokeWidth={9} />
		<rect x={WIN.x - 24} y={WIN.y + WIN.h + 10} width={WIN.w + 48} height={14} fill="#221f2c" />
		<rect x={0} y={0} width={W} height={WALLB} fill="#9fc0e8" opacity={0.08 * d} />
		{/* tall machine cabinets along the back wall (the mainframe's peripherals), no logos */}
		{[1560, 1730].map((cx, i) => <g key={i}><rect x={cx} y={WALLB - 560} width={160} height={560} fill="#3a3846" stroke="#141220" strokeWidth={3} />
			<rect x={cx + 16} y={WALLB - 530} width={128} height={44} fill="#0d0e12" />{Array.from({length: 10}, (_, j) => <circle key={j} cx={cx + 28 + (j % 5) * 26} cy={WALLB - 518 + Math.floor(j / 5) * 20} r={3.5} fill={rnd(j + i * 10, Math.floor(t * 2)) > 0.5 ? '#ffcf6a' : '#3a2f1a'} />)}
			<line x1={cx + 80} y1={WALLB - 470} x2={cx + 80} y2={WALLB - 10} stroke="#24222e" strokeWidth={3} /></g>)}
		<rect x={-200} y={WALLB} width={W + 400} height={300} fill="#1a1820" />
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
/** the view through the window (the plate), with a day grade */
const WindowView: React.FC<{tau: number; t: number; d: number; x: number; y: number; s: number}> = ({d, x, y, s}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<image href={staticFile('ep41/bj_night.webp')} x={0} y={0} width={W} height={1080} preserveAspectRatio="none" />
	{d > 0 && <g><rect x={0} y={0} width={W} height={1080} fill="#6E9BD0" opacity={0.62 * d} /><rect x={0} y={0} width={W} height={330} fill="#a8c8ec" opacity={0.6 * d} /><Glow x={1500} y={160} r={160} c="#fff4d8" o={0.8 * d} id="bjSun" /></g>}
</g>;

/* ---------- the flight: over the roofs, along the Wall, into the sky ---------- */
const glowLine = (pts: [number, number][], w: number, op = 1) => { const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
	return <g opacity={op}><path d={d} stroke={GOLD} strokeWidth={w * 4} fill="none" opacity={0.18} strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke={GOLD} strokeWidth={w * 1.6} fill="none" opacity={0.6} strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke="#fff6d8" strokeWidth={w * 0.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>; };
const bez = (a: [number, number], c: [number, number], b: [number, number], u: number): [number, number] => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
const Roofs: React.FC<{t: number; tau: number}> = ({t, tau}) => {
	const T = BJ_T, u = easeOut(seg(tau, T.win - 0.1, T.roofsB)), A: [number, number] = [380, 1200], C: [number, number] = [640, 520], B: [number, number] = [1010, 336];
	const pts = Array.from({length: 40}, (_, i) => bez(A, C, B, (i / 39) * u)), head = bez(A, C, B, u);
	const cv = seg(tau, T.win - 0.6, T.wall + 0.4), cy = lerp(1080, 560, cv), cx = lerp(870, 548, cv), ch = lerp(150, 34, cv);
	return <g>
		<rect x={-200} y={-800} width={W + 400} height={900} fill="#21243c" />
		<image href={staticFile('ep41/bj_night.webp')} x={0} y={0} width={W} height={1080} preserveAspectRatio="none" />
		<Sprite k="cyclist" x={cx} y={cy} h={ch} c="#14121c" sink={2} />
		<Glow x={head[0]} y={head[1]} r={240 * (1 - 0.6 * u)} c={GOLD} o={0.35} id="bjRoofG" />
		{glowLine(pts, lerp(16, 5, u))}
		<Glow x={head[0]} y={head[1]} r={46} c="#fff6d8" o={0.9} id="bjHeadG" />
	</g>;
};
const WALL_L = {f: 0.45, base: 860, amp: 400, seed: 5};
const Wall: React.FC<{t: number; tau: number; cam: number; py: number}> = ({t, tau, cam, py}) => {
	const T = BJ_T, ry = ridgeY(cam, WALL_L.f, WALL_L.base, WALL_L.amp, WALL_L.seed), top = (x: number) => ry(x) - 24;
	const hx = lerp(-60, 1460, ease(seg(tau, T.wall - 0.1, T.wallB)));
	let wall = `M-40,${ry(-40) + 8}`; for (let x = -40; x <= W + 40; x += 12) wall += ` L${x},${top(x).toFixed(1)}`; for (let x = W + 40; x >= -40; x -= 12) wall += ` L${x},${(ry(x) + 8).toFixed(1)}`; wall += ' Z';
	const cren = Array.from({length: Math.ceil((W + 80) / 14)}, (_, i) => { const x = -40 + i * 14; return <rect key={i} x={x} y={top(x) - 7} width={7} height={8} fill="#222842" />; });
	const per = 380, off = cam * WALL_L.f, i0 = Math.floor((off - 200) / per), i1 = Math.ceil((off + W + 200) / per);
	const towers = Array.from({length: i1 - i0 + 1}, (_, k) => { const i = i0 + k, x = i * per - off + 90 * rnd(i, 7); const base = Math.max(ry(x - 32), ry(x), ry(x + 32)) + 6, tt = Math.min(top(x - 32), top(x + 32)) - 50, lit = hx > x ? sm(seg(hx - x, 0, 120)) : 0;
		return <g key={i}><rect x={x - 32} y={tt} width={64} height={base - tt} fill="#262c4a" />{[-28, -12, 4, 20].map((dx, j) => <rect key={j} x={x + dx} y={tt - 9} width={9} height={10} fill="#262c4a" />)}
			<path d={`M${x - 8},${tt + 50} L${x - 8},${tt + 30} Q${x},${tt + 22} ${x + 8},${tt + 30} L${x + 8},${tt + 50} Z`} fill={lit > 0 ? '#ffcf8a' : '#0c0e1c'} opacity={lit > 0 ? 0.4 + 0.6 * lit : 1} />
			{lit > 0 && <Glow x={x} y={tt + 20} r={110} c={GOLD} o={0.35 * lit} id={`bjTw${i}`} />}</g>; });
	const pts: [number, number][] = []; for (let x = -60; x <= hx; x += 10) pts.push([x, top(x) - 10]);
	return <g>
		<g transform={`translate(0,${py * 0.1})`}>
			<defs><linearGradient id="bjNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04050d" /><stop offset="0.7" stopColor="#10142c" /><stop offset="1" stopColor="#1c2244" /></linearGradient></defs>
			<rect x={-100} y={-900} width={W + 200} height={2100} fill="url(#bjNight)" />
			<StarField n={240} maxY={900} t={t} seed={3} />
		</g>
		<g transform={`translate(0,${py * 0.3})`}><Layer cam={cam} f={0.15} base={700} amp={230} seed={2} col="#11152a" /></g>
		<g transform={`translate(0,${py * 0.6})`}><Layer cam={cam} f={WALL_L.f} base={WALL_L.base} amp={WALL_L.amp} seed={WALL_L.seed} col="#0e1122" front={<g><path d={wall} fill="#1e2440" />{cren}{towers}{pts.length > 1 && glowLine(pts, 6)}{pts.length > 1 && <Glow x={pts[pts.length - 1][0]} y={pts[pts.length - 1][1]} r={70} c="#fff6d8" o={0.9} id="bjWallHead" />}</g>} /></g>
		<g transform={`translate(0,${py})`}><Layer cam={cam} f={1.0} base={1150} amp={250} seed={9} col="#06070e" period={170} item={(x, gy, i) => rnd(i, 4) > 0.45 ? <g><path d={`M${x},${gy - 70 - 40 * rnd(i, 5)} L${x + 26},${gy + 4} L${x - 26},${gy + 4} Z`} fill="#06070e" /></g> : <ellipse cx={x} cy={gy - 24} rx={40} ry={34} fill="#06070e" />} /></g>
	</g>;
};

export const BJ3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = BJ_T, d = drift(t, 1);
	// the room: power-on CU → pull back → locked time-lapse → push to the hand → Enter → follow the light to the window
	if (tau < T.win) {
		const pow = seg(tau, T.on, T.onB), di = dayIdx(tau), poses = DAY_POSES(t);
		let pose = tau < T.tears[0] ? TYPE(t) : mixPose(poses[Math.max(0, di - 1)], poses[di], sm(seg(tau, T.tears[di - 1] ?? 0, (T.tears[di - 1] ?? 0) + 0.14)));
		const tr = 1.2 * Math.sin(t * 9) * (1 - seg(tau, T.enter - 0.1, T.enter)), press = seg(tau, T.enter - 0.05, T.enter) * (1 - seg(tau, T.enter + 0.3, T.enter + 0.5));
		if (tau >= T.retype) pose = mixPose(mixPose(poses[6], TYPE(t), sm(seg(tau, T.retype, T.retype + 0.2))), REACH(tr, press), sm(seg(tau, T.hover - 0.35, T.hover)));
		const finger = sm(seg(tau, T.hover - 0.3, T.hover)) * (1 - seg(tau, T.out + 0.4, T.out + 0.7));
		const elder = di % 2 === 1 && di < 6 ? sm(seg(tau, T.tears[di - 1], T.tears[di - 1] + 0.1)) : 0;
		// camera: CRT close-up (fills the frame) → room
		const Z0 = W / SCR.w, u = ease(seg(tau, T.pullA, T.pullB)), zA = Math.pow(Z0, 1 - u), kA = (zA - 1) / (Z0 - 1);
		const pk = ease(seg(tau, T.push, T.hover + 0.2)), zP = lerp(1, 2.3, pk), out = ease(seg(tau, T.out, T.win));
		const PF: [number, number] = [1150, 560];
		const shake = tau > T.enter && tau < T.enter + 0.1 ? 6 * Math.sin(t * 200) : 0;
		// after the press: pan to the window, push through it until the window fills the frame (= the roofs plate)
		const zOut = lerp(zP, W / WIN.w, easeIn(out)), fxO = lerp(PF[0], WINC[0], ease(out)), fyO = lerp(PF[1], WINC[1], ease(out));
		const zoom = tau < T.pullB ? zA : tau < T.out ? zP : zOut;
		const fx = tau < T.pullB ? SCRC[0] : tau < T.out ? lerp(960, PF[0], sm(pk * 2)) : fxO, fy = tau < T.pullB ? SCRC[1] : tau < T.out ? lerp(560, PF[1], sm(pk * 2)) : fyO;
		const px = tau < T.pullB ? (960 - SCRC[0]) * kA + d.px * (1 - kA) : tau < T.out ? lerp(0, 960 - PF[0], sm(pk * 2)) + d.px : lerp(960 - PF[0], 960 - WINC[0], ease(out)) + d.px * (1 - out);
		const py = tau < T.pullB ? (540 - SCRC[1]) * kA + d.py * (1 - kA) : tau < T.out ? lerp(0, 540 - PF[1], sm(pk * 2)) + d.py : lerp(540 - PF[1], 540 - WINC[1], ease(out)) + d.py * (1 - out);
		// the light: from the screen across the room and out of the window
		const lu = easeIn(seg(tau, T.enter + 0.1, T.win - 0.15));
		const LA: [number, number] = [SCRC[0] - 60, 548], LC: [number, number] = [900, 160], LB: [number, number] = [WINC[0] + 60, WINC[1] - 40];
		const lpts = lu > 0 ? Array.from({length: 30}, (_, i) => bez(LA, LC, LB, (i / 29) * lu)) : [];
		return <g><Cam zoom={zoom} fx={fx} fy={fy} px={px + shake} py={py}>
			<Room t={t} tau={tau} pow={pow} pose={pose} finger={finger} elder={elder} />
			{lpts.length > 1 && glowLine(lpts, 5)}{lpts.length > 1 && <Glow x={lpts[lpts.length - 1][0]} y={lpts[lpts.length - 1][1]} r={50} c="#fff6d8" o={0.95} id="bjLHead" />}
		</Cam></g>;
	}
	// over the roofs → the Wall → up into the sky
	if (tau < T.wall + 0.35) {
		const z = lerp(1, 1.5, easeIn(seg(tau, T.win, T.wall + 0.35))), mix = seg(tau, T.wall - 0.05, T.wall + 0.35);
		return <g><Cam zoom={z} fx={1010} fy={336} px={d.px} py={d.py - 40 * seg(tau, T.win, T.wall)}><Roofs t={t} tau={tau} /></Cam>
			{mix > 0 && <g opacity={mix}><Wall t={t} tau={tau} cam={(tau - T.wall) * 420} py={0} /></g>}</g>;
	}
	const cam = (tau - T.wall) * 420, tilt = ease(seg(tau, T.climb, T.end)), py = tilt * 520;
	const cu = ease(seg(tau, T.climb, T.star)), ry = ridgeY(cam, WALL_L.f, WALL_L.base, WALL_L.amp, WALL_L.seed);
	const A: [number, number] = [1460, ry(1460) - 34 + py * 0.6], STAR: [number, number] = [1120, 250], C: [number, number] = [1560, 420];
	const pts = cu > 0 ? Array.from({length: 30}, (_, i) => bez(A, C, STAR, (i / 29) * cu)) : [];
	const starK = seg(tau, T.star - 0.15, T.star + 0.3), lineOut = 1 - seg(tau, T.star, T.star + 0.6);
	const rot = -32 * easeIn(seg(tau, T.trails, T.end)), pole: [number, number] = [700, 140];
	return <g>
		<g transform={`rotate(${rot} ${pole[0]} ${pole[1]})`}><Wall t={t} tau={tau} cam={cam} py={py} /></g>
		{/* the reversing sky: short trail arcs about the pole (1987 → 1977) */}
		{tau > T.trails && <g opacity={sm(seg(tau, T.trails, T.trails + 0.3))}>{Array.from({length: 90}, (_, i) => { const r = 60 + rnd(i, 51) * 1100, a0 = rnd(i, 52) * Math.PI * 2, da = rot * Math.PI / 180;
			const p0 = [pole[0] + r * Math.cos(a0), pole[1] + r * Math.sin(a0)], p1 = [pole[0] + r * Math.cos(a0 + da), pole[1] + r * Math.sin(a0 + da)];
			return p0[1] < 820 ? <path key={i} d={`M${p0[0]},${p0[1]} A${r},${r} 0 0,0 ${p1[0]},${p1[1]}`} stroke="#dfe6ff" strokeWidth={1.2} fill="none" opacity={0.35} /> : null; })}</g>}
		{pts.length > 1 && glowLine(pts, 5, lineOut)}
		{starK > 0 && <g transform={`rotate(${rot} ${pole[0]} ${pole[1]})`}><Glow x={STAR[0]} y={STAR[1]} r={90} c="#fff4d8" o={0.55 * starK} id="bjStarG" /><circle cx={STAR[0]} cy={STAR[1]} r={4.5 * starK} fill="#fff8e8" />
			<path d={`M${STAR[0] - 34},${STAR[1]} L${STAR[0] + 34},${STAR[1]} M${STAR[0]},${STAR[1] - 34} L${STAR[0]},${STAR[1] + 34}`} stroke="#fff4d8" strokeWidth={1.5} opacity={starK * (0.6 + 0.4 * Math.sin(t * 6))} /></g>}
		{pts.length > 1 && cu < 1 && <Glow x={pts[pts.length - 1][0]} y={pts[pts.length - 1][1]} r={50} c="#fff6d8" o={0.9} id="bjClimbHead" />}
	</g>;
};
void cl; void lerp; void easeOut;
