import React from 'react';
import {W, H, cl, sm, lerp, rnd, fkPose, mixPose, Rimmed, jointAt, Glow, MONO, LATS} from './v3base';
import type {Look4, Pose} from './v3base';
import {Cam, ease, easeIn, easeOut, seg, drift} from './fx';
import {MATCH, mixC} from './s41marconi';
void H;
/* 阿帕网 1969 (owner note 9: "why did he stop walking, why are the lights wrong").
   UCLA 3420 Boelter Hall, night. Kline sits and types at a Teletype in a telephone headset; Sigma 7 cabinets with their
   indicator lamps ON the panels; the IMP; fluorescent troffers IN the ceiling. Split screen with Duvall at SRI: L, O …
   G never prints. The crash (director's ruling 6): no light goes out — the SRI panel lamps freeze, its teletype stalls,
   the SRI half desaturates; Kline lifts his hands and tilts his head to the headset. A4 closes on LO.
   Entrance: three gold dots (Marconi) = three amber panel lamps; pull back. Exit: LO centred → the 1987 CRT powers on. */
export const ARPA_T = {
	a1: 0.253, pullB: 3.6, a2: 3.753, toKline: 3.9, klineB: 6.0, dollyA: 7.4, dollyB: 8.9, chalk: 8.7, chalkB: 10.0,
	split: 10.1, splitB: 10.5, L: 10.853, Lp: 11.35, yes1: 12.003, O: 13.153, Op: 13.65, yes2: 14.303, G: 15.25,
	crash: 15.613, a3: 15.653, lift: 15.8, close: 16.15, closeB: 17.0, end: 17.203,
};
const LAMP = '#FFCF6A', LAMP_R = '#FF6A4A', FIG = '#0A1212';
const FLOOR_BACK = 800, CEIL = 210, SP = 24;
type Cab = {x: number; w: number; h: number; seed: number; tape?: boolean; tall?: boolean};
const UCLA_CABS: Cab[] = [{x: 60, w: 240, h: 540, seed: 1}, {x: 310, w: 240, h: 540, seed: 2}, {x: 560, w: 240, h: 540, seed: 3}, {x: 810, w: 240, h: 540, seed: 4, tape: true}];
const SRI_CABS: Cab[] = [{x: 980, w: 240, h: 540, seed: 7, tape: true}, {x: 1230, w: 240, h: 540, seed: 8}, {x: 1480, w: 240, h: 540, seed: 9}, {x: 1730, w: 240, h: 540, seed: 10}];
/** world position of panel lamp (r, c) of a cabinet */
const lampXY = (c: Cab, r: number, k: number): [number, number] => [c.x + 16 + 20 + k * SP, FLOOR_BACK - c.h + 30 + 20 + r * SP];
const MATCH_CAB = UCLA_CABS[1], MATCH_L = lampXY(MATCH_CAB, MATCH.row, MATCH.col);
/** a computer cabinet; its lamps sit ON the panel. `tl` = the clock the lamps blink by (hold it to freeze them) */
const Cabinet69: React.FC<{c: Cab; tl: number; only?: number; body?: string}> = ({c, tl, only = 0, body = '#3A4A4E'}) => {
	const top = FLOOR_BACK - c.h, rows = 4, cols = 8;
	return <g>
		<rect x={c.x} y={top} width={c.w} height={c.h} fill={body} stroke="#0b1010" strokeWidth={3} />
		<rect x={c.x + 16} y={top + 30} width={cols * SP + 16} height={rows * SP + 16} fill="#0D0E12" />
		{Array.from({length: rows * cols}, (_, i) => { const r = Math.floor(i / cols), k = i % cols, [x, y] = lampXY(c, r, k);
			const fixed = c === MATCH_CAB && r === MATCH.row && k >= MATCH.col - 2 && k <= MATCH.col;
			let on = rnd(i + c.seed * 50, Math.floor(tl * (1.5 + rnd(i, c.seed) * 5))) > 0.5;
			if (only > 0 && !fixed) on = on && rnd(i, 77) < 1 - only; if (fixed && only > 0) on = true;
			const col = r === 0 ? LAMP_R : LAMP;
			return <g key={i}>{on && <circle cx={x} cy={y} r={9} fill={col} opacity={0.25} />}<circle cx={x} cy={y} r={5} fill={on ? col : '#3a2f1a'} opacity={on ? 1 : 0.6} /></g>; })}
		{/* switch row and door seams below the panel */}
		{Array.from({length: 12}, (_, i) => <rect key={i} x={c.x + 22 + i * 17} y={top + 160} width={8} height={18} rx={2} fill="#c9cdc4" opacity={0.55} />)}
		{c.tape ? <g><rect x={c.x + 24} y={top + 200} width={c.w - 48} height={170} fill="#20282a" />
			{[0, 1].map((j) => { const cx = c.x + 70 + j * 100, cy = top + 285, a = tl * (j ? 140 : 90); return <g key={j}><circle cx={cx} cy={cy} r={40} fill="#0f1416" stroke="#8a9490" strokeWidth={3} />
				<path d={`M${cx},${cy} L${cx + 34 * Math.cos(a * Math.PI / 180)},${cy + 34 * Math.sin(a * Math.PI / 180)} M${cx},${cy} L${cx + 34 * Math.cos((a + 120) * Math.PI / 180)},${cy + 34 * Math.sin((a + 120) * Math.PI / 180)} M${cx},${cy} L${cx + 34 * Math.cos((a + 240) * Math.PI / 180)},${cy + 34 * Math.sin((a + 240) * Math.PI / 180)}`} stroke="#8a9490" strokeWidth={4} /></g>; })}</g>
			: <g><line x1={c.x + c.w / 2} y1={top + 196} x2={c.x + c.w / 2} y2={FLOOR_BACK - 16} stroke="#263234" strokeWidth={3} /><rect x={c.x + c.w / 2 - 22} y={top + 300} width={8} height={40} rx={3} fill="#1c2426" /><rect x={c.x + c.w / 2 + 14} y={top + 300} width={8} height={40} rx={3} fill="#1c2426" /></g>}
		<rect x={c.x + 10} y={FLOOR_BACK - 14} width={c.w - 20} height={14} fill="#0d1212" />
	</g>;
};
/** troffers set into the ceiling, in perspective; nearer rows are bigger and higher and slide faster (parallax) */
const Ceiling: React.FC<{cam: number; ceil: string; tint?: string}> = ({cam, ceil, tint = '#E8F4EC'}) => {
	const rows = [{y0: 176, y1: 196, wt: 150, wb: 134, f: 1.0, gap: 470}, {y0: 104, y1: 138, wt: 220, wb: 190, f: 1.25, gap: 560}, {y0: 8, y1: 62, wt: 330, wb: 280, f: 1.6, gap: 700}];
	return <g>
		<path d={`M-400,-600 L${W * 2 + 3000},-600 L${W * 2 + 3000},${CEIL} L-400,${CEIL} Z`} fill={ceil} />
		{Array.from({length: 9}, (_, i) => <line key={i} x1={-400} x2={W * 3} y1={CEIL - 8 - i * i * 3} y2={CEIL - 8 - i * i * 3} stroke="#000" strokeOpacity={0.12} strokeWidth={1.5} />)}
		{rows.map((r, j) => Array.from({length: 9}, (_, i) => { const cx = 180 + i * r.gap - cam * (r.f - 1); return <g key={`${j}_${i}`}>
			<path d={`M${cx - r.wt / 2 - 6},${r.y0 - 4} L${cx + r.wt / 2 + 6},${r.y0 - 4} L${cx + r.wb / 2 + 6},${r.y1 + 4} L${cx - r.wb / 2 - 6},${r.y1 + 4} Z`} fill="#0c1714" opacity={0.6} />
			<path d={`M${cx - r.wt / 2},${r.y0} L${cx + r.wt / 2},${r.y0} L${cx + r.wb / 2},${r.y1} L${cx - r.wb / 2},${r.y1} Z`} fill={tint} />
			<path d={`M${cx - r.wt / 6},${r.y0} L${cx - r.wb / 6},${r.y1} M${cx + r.wt / 6},${r.y0} L${cx + r.wb / 6},${r.y1}`} stroke="#9fb8ac" strokeWidth={1.5} opacity={0.6} /></g>; }))}
	</g>;
};
/** a lab: ceiling with troffers, lit wall, floor, cabinets. `cam` = lateral world offset (the caller translates) */
const Lab: React.FC<{t: number; tl: number; cam: number; cabs: Cab[]; wall: [string, string]; ceil: string; floor: string; only?: number; id: string; children?: React.ReactNode}> = ({tl, cam, cabs, wall, ceil, floor, only, id, children}) => <g>
	<defs><linearGradient id={`${id}Wall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={wall[0]} /><stop offset="1" stopColor={wall[1]} /></linearGradient></defs>
	<rect x={-400} y={CEIL} width={W * 3 + 400} height={FLOOR_BACK - CEIL} fill={`url(#${id}Wall)`} />
	{/* pools of troffer light on the upper wall */}
	{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={180 + i * 470} cy={CEIL + 30} rx={260} ry={120} fill="#e8f4ec" opacity={0.07} />)}
	<rect x={-400} y={FLOOR_BACK} width={W * 3 + 400} height={600} fill={floor} />
	{Array.from({length: 40}, (_, i) => { const x = -400 + i * 140; return <line key={i} x1={x} y1={FLOOR_BACK} x2={x + (x - cam - 960) * 1.4} y2={1300} stroke="#000" strokeOpacity={0.18} strokeWidth={2} />; })}
	{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-400} x2={W * 3} y1={FLOOR_BACK + 22 + i * i * 18} y2={FLOOR_BACK + 22 + i * i * 18} stroke="#000" strokeOpacity={0.15} strokeWidth={2} />)}
	<rect x={-400} y={FLOOR_BACK - 10} width={W * 3 + 400} height={10} fill="#0b1210" />
	<Ceiling cam={cam} ceil={ceil} />
	{cabs.map((c, i) => <Cabinet69 key={i} c={c} tl={tl} only={only} />)}
	{children}
</g>;

/* the Teletype (front view, so the paper reads), on its stand; the print head sits on the current line */
const TTY: React.FC<{x: number; g: number; text: string; t: number; head?: number; tint?: string}> = ({x, g, text, t, head = 0, tint = '#8e8a7c'}) => <g>
	<rect x={x - 92} y={g - 222} width={14} height={222} fill="#1a2020" /><rect x={x + 78} y={g - 222} width={14} height={222} fill="#1a2020" /><rect x={x - 92} y={g - 70} width={184} height={10} fill="#1a2020" />
	<rect x={x - 112} y={g - 318} width={224} height={100} rx={12} fill={tint} />
	<path d={`M${x - 124},${g - 226} L${x + 124},${g - 226} L${x + 112},${g - 252} L${x - 112},${g - 252} Z`} fill={mixC(tint, '#000000', 0.25)} />
	{Array.from({length: 3}, (_, r) => Array.from({length: 11 - r}, (_, i) => <rect key={`${r}_${i}`} x={x - 102 + i * 19 + r * 9} y={g - 249 + r * 7.5} width={13} height={5} rx={1.5} fill="#e8e2d0" opacity={0.5} />))}
	<rect x={x - 82} y={g - 410} width={164} height={96} fill="#E8E2D0" />
	{Array.from({length: 5}, (_, i) => <line key={i} x1={x - 82} x2={x + 82} y1={g - 400 + i * 14} y2={g - 400 + i * 14} stroke="#cfc8b4" strokeWidth={1} />)}
	<text x={x - 64} y={g - 334} style={{fontFamily: MONO, fontSize: 46, fontWeight: 700}} fill="#1c1c22">{text}</text>
	<rect x={x - 112} y={g - 322} width={224} height={14} rx={7} fill="#2a2a2e" />
	<rect x={x - 64 + head * 28 - 4} y={g - 326} width={30} height={20} rx={3} fill="#3a3a40" />
	<circle cx={x + 96} cy={g - 280} r={4} fill="#ffb347" opacity={0.6 + 0.4 * Math.sin(t * 8)} />
</g>;

/* a 1960s telephone headset (single earpiece + boom mic) drawn on a Figure4 head */
const Headset: React.FC<{pose: Pose; x: number; ground: number; h: number; flip?: boolean; col?: string}> = ({pose, x, ground, h, flip, col = '#0A1212'}) => {
	const S = (n: string): [number, number] => [x + pose[n][0] * h, ground - pose[n][1] * h];
	const n1 = S('Neck1'), hd = S('Head'), top = S('Top'), ang = Math.atan2(top[1] - n1[1], top[0] - n1[0]) + Math.PI / 2, hc: [number, number] = [lerp(hd[0], top[0], 0.45), lerp(hd[1], top[1], 0.45)], s = h * 0.93;
	const R = (px: number, py: number) => { const c = Math.cos(ang), sn = Math.sin(ang); return [hc[0] + px * s * c - py * s * sn, hc[1] + px * s * sn + py * s * c]; };
	const P = (px: number, py: number) => R(px, py).map((v) => v.toFixed(1)).join(',');
	const ear = R(-0.008, 0.004);
	return <g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>
		<path d={`M${P(-0.012, 0.0)} Q${P(-0.03, -0.1)} ${P(0.01, -0.092)}`} stroke={col} strokeWidth={h * 0.012} fill="none" />
		<path d={`M${P(-0.008, 0.004)} Q${P(0.03, 0.07)} ${P(0.082, 0.05)}`} stroke={col} strokeWidth={h * 0.007} fill="none" strokeLinecap="round" />
		<circle cx={R(0.084, 0.05)[0]} cy={R(0.084, 0.05)[1]} r={h * 0.008} fill={col} />
		<circle cx={ear[0]} cy={ear[1]} r={h * 0.024} fill={col} /><circle cx={ear[0]} cy={ear[1]} r={h * 0.024} fill="none" stroke="#9fb8ac" strokeWidth={1.5} opacity={0.55} />
		<path d={`M${ear[0]},${ear[1] + h * 0.02} Q${ear[0] - h * 0.06},${ear[1] + h * 0.2} ${ear[0] - h * 0.02},${ground - h * 0.3}`} stroke={col} strokeWidth={2} fill="none" />
	</g>;
};

/* poses: typing (hands on the keys), deliberate key press, hands lifted + head to the headset; Duvall reads the paper */
const typeP = (t: number, press: number, lift: number) => { const tap = 3 * Math.sin(t * 17) * (1 - lift), tap2 = 3 * Math.sin(t * 15 + 1.3) * (1 - lift);
	const base = fkPose({hip: 0.37, lean: 16, neck: 8, lt: 88, lk: 92, rt: 84, rk: 86, la: 52 + tap - press * 8, le: 50 - press * 6, ra: 46 + tap2, re: 56});
	const up = fkPose({hip: 0.37, lean: 6, neck: 14, lt: 88, lk: 92, rt: 84, rk: 86, la: 22, le: 150, ra: 40, re: 40});
	return mixPose(base, up, sm(lift)); };
const KLINE: Look4 = {dress: 'shirt', head: 'bowl'}, DUVALL: Look4 = {dress: 'shirt', head: 'short', build: 1.05};
const duvP = (t: number, nod: number, lean: number) => fkPose({hip: 0.37, lean: 14 + 6 * lean, neck: 12 + 10 * nod, lt: 88, lk: 92, rt: 84, rk: 86, la: 48, le: 46, ra: 40, re: 60});
/* UCLA world positions */
const U = {ttyX: 1540, g: 940, klX: 1290, h: 560};
const S_ = {ttyX: 1290, g: 940, dvX: 1540, h: 560};
const pressK = (tau: number, k: number) => seg(tau, k - 0.06, k) * (1 - seg(tau, k + 0.1, k + 0.22));
const nodK = (tau: number, k: number) => Math.sin(Math.PI * seg(tau, k, k + 0.5));

const Chalk: React.FC<{tau: number}> = ({tau}) => { const T = ARPA_T, fill = ease(seg(tau, T.chalk, T.chalkB));
	return <g>
		<rect x={2090} y={318} width={640} height={330} fill="#5a4a32" /><rect x={2104} y={332} width={612} height={302} fill="#1d2a24" />
		<rect x={2104} y={620} width={612} height={14} fill="#3a3226" />
		<text x={2140} y={430} style={{fontFamily: LATS, fontSize: 62, fontStyle: 'italic'}} fill="#e8e6dc" opacity={0.85}>UCLA</text>
		<text x={2570} y={430} style={{fontFamily: LATS, fontSize: 62, fontStyle: 'italic'}} fill="#e8e6dc" opacity={0.85}>SRI</text>
		<path d="M2320,412 L2550,412 M2525,396 L2552,412 L2525,428" stroke="#e8e6dc" strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round" />
		<path d={`M2320,412 L${2320 + 232 * fill},412`} stroke="#F2CF7A" strokeWidth={7} strokeLinecap="round" />
		{fill > 0.98 && <Glow x={2552} y={412} r={50} c="#F2CF7A" o={0.6} id="apChalkG" />}
		<text x={2250} y={560} style={{fontFamily: LATS, fontSize: 84, fontStyle: 'italic', letterSpacing: '0.12em'}} fill="#e8e6dc" opacity={0.9}>LOGIN</text>
	</g>; };

/** UCLA: the whole room (cam = lateral offset applied by the caller) */
const UCLA: React.FC<{t: number; tau: number; cam: number; only?: number}> = ({t, tau, cam, only}) => {
	const T = ARPA_T, lift = sm(seg(tau, T.lift, T.lift + 0.5)), press = Math.max(pressK(tau, T.L), pressK(tau, T.O), pressK(tau, T.G));
	const pose = typeP(t, press, lift), text = tau >= T.O + 0.05 ? 'LO' : tau >= T.L + 0.05 ? 'L' : '';
	return <Lab t={t} tl={t} cam={cam} cabs={UCLA_CABS} wall={['#46613f', '#2a4231']} ceil="#16302C" floor="#0f1a17" only={only} id="apU">
		{/* the IMP: a tall grey box beside the host */}
		<rect x={1760} y={860 - 585} width={205} height={585} fill="#4a5458" stroke="#0b1010" strokeWidth={3} />
		<rect x={1782} y={860 - 555} width={160} height={70} fill="#0D0E12" />
		{Array.from({length: 16}, (_, i) => <circle key={i} cx={1796 + (i % 8) * 19} cy={860 - 535 + Math.floor(i / 8) * 24} r={4} fill={rnd(i, Math.floor(t * 3)) > 0.5 ? LAMP : '#3a2f1a'} />)}
		<rect x={1770} y={846} width={185} height={14} fill="#0d1212" />
		{/* a night window: campus lights */}
		<rect x={1066} y={296} width={190} height={268} fill="#1a2422" />
		<rect x={1076} y={306} width={170} height={248} fill="#0b1430" />
		{Array.from({length: 8}, (_, i) => <circle key={i} cx={1086 + rnd(i, 61) * 150} cy={470 + rnd(i, 62) * 60} r={1.6 + rnd(i, 63) * 1.6} fill="#ffd9a0" opacity={0.5 + 0.3 * Math.sin(t * 0.7 + i)} />)}
		<path d="M1076,500 L1120,488 L1170,496 L1210,484 L1246,492 L1246,554 L1076,554 Z" fill="#070b18" />
		<path d="M1161,306 L1161,554 M1076,430 L1246,430" stroke="#1a2422" strokeWidth={7} />
		<Chalk tau={tau} />
		{/* the Teletype and Kline, seated and typing in a telephone headset */}
		<TTY x={U.ttyX} g={U.g} text={text} t={t} head={text.length} />
		<path d={`M${U.klX - 90},${U.g} L${U.klX - 82},${U.g - 240} M${U.klX - 82},${U.g - 210} L${U.klX + 60},${U.g - 210} L${U.klX + 54},${U.g}`} stroke="#141c1c" strokeWidth={12} fill="none" />
		<Rimmed x={U.klX} ground={U.g} h={U.h} pose={pose} look={KLINE} col={FIG} rim="#e8f4ec" rimOp={0.16} rimDx={0} rimDy={-2} T={t} />
		<Headset pose={pose} x={U.klX} ground={U.g} h={U.h} />
	</Lab>;
};
/** SRI: the same kit re-coloured, Duvall at his teletype facing left; frozen = the crash grade */
const SRI: React.FC<{t: number; tau: number; frozen: number}> = ({t, tau, frozen}) => {
	const T = ARPA_T, tl = tau >= T.crash ? 128.497 + T.crash : t;
	const text = tau >= T.Op ? 'LO' : tau >= T.Lp ? 'L' : '', stall = tau > T.G + 0.15 && tau < T.crash ? 0.3 * Math.sin(t * 40) : 0;
	const pose = duvP(t, Math.max(nodK(tau, T.yes1), nodK(tau, T.yes2)), sm(seg(tau, T.G, T.crash + 0.8)));
	return <Lab t={t} tl={tl} cam={0} cabs={SRI_CABS} wall={['#3a384c', '#24222f']} ceil="#1c1a26" floor="#121119" id="apS">
		<TTY x={S_.ttyX} g={S_.g} text={text} t={tau >= T.crash ? 128.497 + T.crash : t} head={text.length + stall} tint="#8a8680" />
		<path d={`M${S_.dvX + 90},${S_.g} L${S_.dvX + 82},${S_.g - 240} M${S_.dvX + 82},${S_.g - 210} L${S_.dvX - 60},${S_.g - 210} L${S_.dvX - 54},${S_.g}`} stroke="#16141c" strokeWidth={12} fill="none" />
		<Rimmed x={S_.dvX} ground={S_.g} h={S_.h} pose={pose} look={DUVALL} flip col="#0c0b12" rim="#e8f4ec" rimOp={0.16} rimDx={0} rimDy={-2} T={t} />
		<Headset pose={pose} x={S_.dvX} ground={S_.g} h={S_.h} flip col="#0c0b12" />
		{frozen > 0 && <rect x={-400} y={-600} width={W * 3} height={2000} fill="#1a2030" opacity={0.18 * frozen} />}
	</Lab>;
};

export const ARPA3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = ARPA_T, d = drift(t, 1);
	// A1 + A2: pull back from the three lamps; move to Kline; dolly right past the IMP to the chalkboard
	if (tau < T.splitB) {
		const u = ease(seg(tau, 0, T.pullB)), Z0 = MATCH.d / SP, zA = Math.pow(Z0, 1 - u), kA = (zA - 1) / (Z0 - 1);
		const camK = lerp(0, 520, ease(seg(tau, T.toKline, T.klineB))) + lerp(0, 820, ease(seg(tau, T.dollyA, T.dollyB))) - lerp(0, 1340 - 380, easeIn(seg(tau, T.split - 0.25, T.splitB)));
		const zK = lerp(1, 1.18, ease(seg(tau, T.toKline, T.klineB))) * lerp(1, 1 / 1.18, ease(seg(tau, T.dollyA, T.dollyB)));
		const only = 1 - seg(tau, 0.25, 0.9);
		const scene = <Cam zoom={zA * zK} fx={tau < T.pullB ? MATCH_L[0] : 960} fy={tau < T.pullB ? MATCH_L[1] : 600} px={(960 - MATCH_L[0]) * kA + d.px * (1 - kA)} py={(540 - MATCH_L[1]) * kA + d.py * (1 - kA)} roll={d.roll * (1 - kA)}>
			<g transform={`translate(${-camK},0)`}><UCLA t={t} tau={tau} cam={camK} only={only} /></g>
			{/* a near pillar sweeps past during the dolly (depth) */}
			<rect x={1990 - camK * 1.6} y={-600} width={90} height={2000} fill="#081010" />
		</Cam>;
		const fade = 1 - seg(tau, 0, 0.6);
		return <g>{scene}
			{fade > 0 && <g><rect width={W} height={H} fill="#000" opacity={fade * 0.92} />
				{Array.from({length: MATCH.rows * MATCH.cols}, (_, i) => { const r = Math.floor(i / MATCH.cols), c = i % MATCH.cols, fixed = r === MATCH.row && c >= MATCH.col - 2 && c <= MATCH.col;
					return <circle key={i} cx={MATCH.x + (c - MATCH.col) * MATCH.d} cy={MATCH.y + (r - MATCH.row) * MATCH.d} r={MATCH.r} fill={fixed ? LAMP : '#3a2f1a'} opacity={(fixed ? 1 : 0.6) * fade} />; })}</g>}
			{tau > T.split && <SplitPart tau={tau} t={t} />}
		</g>;
	}
	return <SplitPart tau={tau} t={t} />;
};
/** the split screen: UCLA left, SRI right, a thin gold line between; then the crash and the close on LO */
const SplitPart: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = ARPA_T, line = lerp(W, 960, easeOut(seg(tau, T.split, T.splitB))), frozen = sm(seg(tau, T.crash, T.crash + 0.5));
	const close = ease(seg(tau, T.close, T.closeB)), edge = lerp(line, 0, close), d = drift(t, 1);
	// UCLA framing (left half)
	const uz = 1.04, ufx = 1380, ufy = 560;
	// SRI framing (right half) → push in on the paper LO, ending with LO at the centre of the frame
	const paper: [number, number] = [S_.ttyX - 64 + 28, S_.g - 350], push = ease(seg(tau, T.close, T.end + 0.2));
	const sz = lerp(1.04, 3.1, push), sfx = lerp(1420, paper[0], sm(push * 1.4)), sfy = lerp(560, paper[1], sm(push * 1.4));
	const spx = lerp(1440 - 1420, 960 - paper[0], sm(push * 1.4)), spy = lerp(-20, 540 - paper[1], sm(push * 1.4));
	return <g>
		<defs><clipPath id="apL"><rect x={0} y={0} width={edge} height={H} /></clipPath><clipPath id="apR"><rect x={edge} y={0} width={W} height={H} /></clipPath>
			<filter id="apDesat" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values={`${1 - 0.85 * frozen}`} /></filter></defs>
		<g clipPath="url(#apL)"><Cam zoom={uz} fx={ufx} fy={ufy} px={480 - ufx + d.px} py={540 - ufy + d.py}><UCLA t={t} tau={tau} cam={0} /></Cam></g>
		<g clipPath="url(#apR)"><g filter={frozen > 0 ? 'url(#apDesat)' : undefined}><Cam zoom={sz} fx={sfx} fy={sfy} px={spx + d.px * (1 - push)} py={spy + d.py * (1 - push)}><SRI t={t} tau={tau} frozen={frozen} /></Cam></g></g>
		<rect x={edge - 2} y={0} width={4} height={H} fill="#F2CF7A" opacity={0.9 * (1 - close)} />
		<Glow x={edge} y={540} r={200} c="#F2CF7A" o={0.12 * (1 - close)} id="apSplitG" />
	</g>;
};
void cl; void rnd; void jointAt; void easeIn;
