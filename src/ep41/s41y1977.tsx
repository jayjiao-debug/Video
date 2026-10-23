import React from 'react';
import {staticFile} from 'remotion';
import {W, H, SANS, rnd, sm, lerp, POSES, mixPose, fkPose, Rimmed, jointAt, LOOK4, Glow} from './v3base';
import {Cam, Whip, Flash, ease, easeIn, easeOut, seg, drift} from './fx';
/* 1977 (owner note 10: "this scene could be much more powerful").
   1 Jun 1977: Ann Druyan, at night, finds the Chinese song and phones Carl Sagan; he is away in Tucson — the hotel takes a
   message ("Annie called"); he calls back. Split screen, the two of them on one line; on "they were engaged" the
   divider dissolves and the two rooms become one frame; the warm light between them becomes the golden record. */
export const Y77_T = {annIn: 0, lift: 0.9, race: 2.4, carl: 4.0, slip: 4.0, callBack: 5.2, split: 6.6, merge: 8.6, engaged: 10.2, record: 11.2, end: 12.05};
const PS = 1920 / 2048;
const GOLD = '#f2cf7a';
// Ann's room (plate y77_ann): desk top y≈811; lamp at (499,768); turntable 557–806; moon (1152,216)
const ANN = {x: 430, ground: 1190, h: 820}, A_PHONE: [number, number] = [880, 806];
// Carl's hotel room (plate y77_carl): nightstand top y≈686, lamp (922,595); bed edge; moon (312,259)
const CARL = {x: 760, ground: 1078, h: 700}, C_PHONE: [number, number] = [880, 684];
const SIT = fkPose({hip: 0.37, lean: 8, neck: 8, lt: 86, lk: 92, rt: 80, rk: 84, la: 22, le: 136, ra: 34, re: 22});
const STAND_PH = POSES.phoneStand;

const Handset: React.FC<{x: number; y: number; rot: number; s?: number; col?: string}> = ({x, y, rot, s = 1, col = '#0d0a12'}) =>
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}><path d="M-46,-10 Q-50,6 -36,12 L-24,10 Q-14,4 -10,-2 L10,-2 Q14,4 24,10 L36,12 Q50,6 46,-10 Q40,-20 -40,-20 Z" fill={col} /></g>;
const Coil: React.FC<{a: [number, number]; b: [number, number]; col?: string; n?: number}> = ({a, b, col = '#0d0a12', n = 22}) => {
	const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
	const d = Array.from({length: n * 6 + 1}, (_, i) => { const u = i / (n * 6), sag = Math.sin(Math.PI * u) * L * 0.18, r = 7 * Math.sin(u * n * Math.PI * 2);
		return `${i ? 'L' : 'M'}${(a[0] + dx * u + nx * r).toFixed(1)},${(a[1] + dy * u + ny * r + sag).toFixed(1)}`; }).join(' ');
	return <path d={d} stroke={col} strokeWidth={2.2} fill="none" />;
};
const Phone77: React.FC<{x: number; y: number; s?: number; col?: string; cradled?: boolean}> = ({x, y, s = 1, col = '#120d0a', cradled}) =>
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-60,0 L-48,-46 Q-46,-52 -40,-52 L40,-52 Q46,-52 48,-46 L60,0 Z" fill={col} />
		<circle cx={0} cy={-26} r={19} fill="none" stroke="#e8d8b0" strokeOpacity={0.3} strokeWidth={2.5} />
		{Array.from({length: 10}, (_, i) => { const a = -Math.PI / 2 + (i / 10) * Math.PI * 1.6; return <circle key={i} cx={Math.cos(a) * 13} cy={-26 + Math.sin(a) * 13} r={2.2} fill="#e8d8b0" opacity={0.3} />; })}
		{cradled && <Handset x={0} y={-60} rot={0} s={1.25} col={col} />}
	</g>;

/** Ann's room; ox shifts the plate and figures together (for the split screen) */
const AnnRoom: React.FC<{t: number; tau: number; ox?: number; lift: number; part?: 'bg' | 'fig' | 'all'}> = ({t, tau, ox = 0, lift, part = 'all'}) => {
	const pose = mixPose(POSES.stand, STAND_PH, sm(lift)), hand = jointAt(pose, 'LHand', ANN.x + ox, ANN.ground, ANN.h);
	const rest: [number, number] = [A_PHONE[0] + ox, A_PHONE[1] - 66], hs: [number, number] = [lerp(rest[0], hand[0] + 10, sm(lift)), lerp(rest[1], hand[1] - 8, sm(lift))];
	const bg = part !== 'fig', fg = part !== 'bg';
	return <g>{bg && <>
		<image href={staticFile('ep41/y77_ann.webp')} x={ox} y={0} width={2048 * PS} height={1152 * PS} />
		{/* the record turning: a moving highlight on the vinyl */}
		<ellipse cx={681 + ox} cy={746} rx={64} ry={10} fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={2} strokeDasharray="30 170" strokeDashoffset={-t * 260} />
		<Glow x={640 + ox} y={560} r={260} c="#ffc48a" o={0.12 + 0.02 * Math.sin(t * 7)} id="y77lampA" />
		<Phone77 x={A_PHONE[0] + ox} y={A_PHONE[1]} s={0.95} /></>}{fg && <>
		<Coil a={[A_PHONE[0] + ox + 40, A_PHONE[1] - 20]} b={[hs[0] + 20, hs[1] + 14]} />
		<Handset x={hs[0]} y={hs[1]} rot={lerp(0, -70, sm(lift))} s={1.2} col="#0d0a12" />
		<Rimmed x={ANN.x + ox} ground={ANN.ground} h={ANN.h} pose={pose} look={LOOK4.druyan} col="#0d0a12" rim="#ffd9a8" rimOp={0} rimDx={-2} rimDy={-1} T={tau} /></>}
	</g>;
};
const CarlRoom: React.FC<{t: number; tau: number; ox?: number; lift: number; slip?: number; part?: 'bg' | 'fig' | 'all'}> = ({t, tau, ox = 0, lift, slip = 0, part = 'all'}) => {
	const pose = mixPose(fkPose({hip: 0.37, lean: 10, neck: 14, lt: 86, lk: 92, rt: 80, rk: 84, la: 30, le: 70, ra: 26, re: 64}), SIT, sm(lift));
	const hand = jointAt(pose, 'LHand', CARL.x + ox, CARL.ground, CARL.h, true);
	const rest: [number, number] = [C_PHONE[0] + ox, C_PHONE[1] - 58], hs: [number, number] = [lerp(rest[0], hand[0] - 8, sm(lift)), lerp(rest[1], hand[1] - 6, sm(lift))];
	const bg = part !== 'fig', fg = part !== 'bg';
	return <g>{bg && <>
		<image href={staticFile('ep41/y77_carl.webp')} x={ox} y={0} width={2048 * PS} height={1152 * PS} />
		<Glow x={922 + ox} y={600} r={220} c="#ffc48a" o={0.1 + 0.02 * Math.sin(t * 6)} id="y77lampC" />
		{/* the hotel message slip by the lamp */}
		<g transform={`translate(${968 + ox},${672}) rotate(-6)`} opacity={1 - slip}><rect x={-34} y={-14} width={68} height={22} fill="#f2ead6" /><text x={0} y={2} textAnchor="middle" style={{fontFamily: '"DejaVu Serif", serif', fontSize: 9, fontStyle: 'italic'}} fill="#3a3020">Annie called</text></g>
		<Phone77 x={C_PHONE[0] + ox} y={C_PHONE[1]} s={0.7} /></>}{fg && <>
		<Coil a={[C_PHONE[0] + ox - 30, C_PHONE[1] - 16]} b={[hs[0] - 10, hs[1] + 12]} />
		<Handset x={hs[0]} y={hs[1]} rot={lerp(0, 70, sm(lift))} s={0.85} col="#0d0a12" />
		<g fill="#0d0a12"><rect x={CARL.x + ox - 70} y={CARL.ground - 0.37 * CARL.h + 6} width={150} height={16} rx={4} /><rect x={CARL.x + ox - 62} y={CARL.ground - 0.37 * CARL.h + 20} width={10} height={0.37 * CARL.h - 20} /><rect x={CARL.x + ox + 62} y={CARL.ground - 0.37 * CARL.h - 150} width={12} height={0.37 * CARL.h + 150} /><rect x={CARL.x + ox + 40} y={CARL.ground - 0.37 * CARL.h - 150} width={40} height={90} rx={6} /></g>
		<Rimmed x={CARL.x + ox} ground={CARL.ground} h={CARL.h} pose={pose} look={LOOK4.sagan} flip col="#0d0a12" rim="#ffd9a8" rimOp={0} rimDx={2} rimDy={-1} T={tau} /></>}
	</g>;
};
/** the hotel's message slip, close: WHILE YOU WERE OUT · Annie called */
const Slip: React.FC<{t: number}> = ({t}) => <g>
	<rect width={W} height={H} fill="#2a1c10" />
	<Glow x={1300} y={300} r={900} c="#ffc48a" o={0.35} id="y77slipglow" />
	<g transform={`translate(960,560) rotate(${-4 + Math.sin(t) * 0.4})`}>
		<rect x={-420} y={-250} width={840} height={500} fill="#f4ecd8" />
		<text x={-370} y={-170} style={{fontFamily: '"DejaVu Sans", sans-serif', fontSize: 30, fontWeight: 700, letterSpacing: '0.12em'}} fill="#a33a2a">WHILE YOU WERE OUT</text>
		<line x1={-370} y1={-140} x2={370} y2={-140} stroke="#a33a2a" strokeWidth={3} />
		<text x={-370} y={-80} style={{fontFamily: '"DejaVu Sans", sans-serif', fontSize: 22}} fill="#7a6a58">FOR  Dr. Sagan</text>
		<text x={-370} y={40} style={{fontFamily: '"DejaVu Serif", serif', fontSize: 92, fontStyle: 'italic'}} fill="#1f2a5a">Annie called</text>
		<text x={-370} y={140} style={{fontFamily: '"DejaVu Sans", sans-serif', fontSize: 22}} fill="#7a6a58">PLEASE CALL  ✓</text>
	</g>
</g>;
/** the line across the continent at night: cities, then the desert */
const LineRace: React.FC<{u: number; t: number}> = ({u, t}) => {
	const cam = u * 9000, per = 560, off = cam % per, wy = 360, desert = u > 0.5;
	return <g>
		<defs><linearGradient id="y77sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1030" /><stop offset="1" stopColor={desert ? '#46406a' : '#2c3260'} /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#y77sky)" />
		<Whip id="y77w" amt={14}>{Array.from({length: 24}, (_, i) => { const x = ((i * 137 - cam * 0.25) % 2200 + 2200) % 2200 - 140;
			return desert ? <path key={i} d={`M${x},900 l0,-${60 + 40 * rnd(i, 3)} m0,30 l-18,0 l0,-22 m18,10 l16,0 l0,-26`} stroke="#07070e" strokeWidth={10} fill="none" />
				: <g key={i}><rect x={x} y={900 - 60 - 120 * rnd(i, 4)} width={110} height={300} fill="#07070e" />{Array.from({length: 4}, (_, k) => <rect key={k} x={x + 15 + (k % 2) * 50} y={900 - 40 - 100 * rnd(i, 4) + Math.floor(k / 2) * 30} width={16} height={12} fill="#ffcf8a" opacity={rnd(i * 7 + k, 5) > 0.35 ? 0.95 : 0} />)}</g>; })}
			<rect y={895} width={W} height={200} fill="#05050a" /></Whip>
		<Whip id="y77w2" amt={60}>{Array.from({length: 6}, (_, i) => { const x = W + per - i * per - off; return <g key={i}><rect x={x - 8} y={wy - 20} width={16} height={H} fill="#030306" /><rect x={x - 80} y={wy - 16} width={160} height={10} fill="#030306" /><rect x={x - 60} y={wy + 26} width={120} height={8} fill="#030306" /></g>; })}</Whip>
		<line x1={0} y1={wy} x2={W} y2={wy} stroke="#2a2a36" strokeWidth={3} />
		<Glow x={W * 0.2} y={wy} r={130} c={GOLD} o={0.9} id="y77pulse" /><circle cx={W * 0.2} cy={wy} r={8} fill="#fff" />
		<Glow x={1500} y={160} r={160} c="#fff3d6" o={0.25} id="y77moonR" /><circle cx={1500} cy={160} r={44} fill="#f3ecd6" />
		{void t}
	</g>;
};

export const Y1977: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = Y77_T, d = drift(t, 0.8);
	if (tau < T.race) {   // Ann's room: from her moon, pull back; she lifts the receiver
		const z = lerp(2.3, 1.08, easeOut(seg(tau, 0, 1.8)));
		return <g><Cam zoom={z} fx={1152} fy={216} px={d.px} py={d.py}><AnnRoom t={t} tau={tau} lift={seg(tau, T.lift, T.lift + 0.8)} /></Cam>
			</g>;
	}
	if (tau < T.carl) { const u = seg(tau, T.race, T.carl); return <g><LineRace u={u} t={t} /></g>; }
	if (tau < T.split) {   // the slip, then Carl calls back
		if (tau < T.callBack) return <Cam zoom={lerp(1.0, 1.08, seg(tau, T.carl, T.callBack))}><Slip t={t} /></Cam>;
		return <Cam zoom={lerp(1.3, 1.1, ease(seg(tau, T.callBack, T.split)))} fx={CARL.x} fy={560} px={d.px} py={d.py}><CarlRoom t={t} tau={tau} lift={seg(tau, T.callBack + 0.2, T.callBack + 0.9)} slip={0} /></Cam>;
	}
	// split screen → one frame
	const m = sm(seg(tau, T.merge, T.engaged + 0.4)), split = 1 - m, push = lerp(1, 1.12, ease(seg(tau, T.split, T.end)));
	const ax = lerp(0, 90, m), cx = lerp(560, 390, m);   // the rooms slide toward each other
	const glow = sm(seg(tau, T.engaged, T.engaged + 0.8)), toRec = easeIn(seg(tau, T.record, T.end));
	const aH = jointAt(STAND_PH, 'LHand', ANN.x + ax, ANN.ground, ANN.h), cH = jointAt(SIT, 'LHand', CARL.x + cx, CARL.ground, CARL.h, true);
	const mid: [number, number] = [(aH[0] + cH[0]) / 2, Math.min(aH[1], cH[1]) - 40];
	return <g>
		<Cam zoom={push * lerp(1, 6, toRec)} fx={mid[0]} fy={mid[1]}>
			<defs>
				<linearGradient id="y77fade" x1="0" x2="1"><stop offset="0" stopColor="#fff" /><stop offset={0.5 - 0.12 * m} stopColor="#fff" /><stop offset={0.5 + 0.12 * m + 0.0005} stopColor="#000" /><stop offset="1" stopColor="#000" /></linearGradient>
				<mask id="y77M" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect width={W} height={H} fill="url(#y77fade)" /></mask>
			</defs>
			{/* Carl's room underneath; Ann's room on top, its edge going from a hard line to a soft blend */}
			<CarlRoom t={t} tau={tau} ox={cx} lift={1} slip={1} part="bg" />
			<g mask="url(#y77M)"><AnnRoom t={t} tau={tau} ox={ax} lift={1} part="bg" /></g>
			<CarlRoom t={t} tau={tau} ox={cx} lift={1} slip={1} part="fig" />
			<AnnRoom t={t} tau={tau} ox={ax} lift={1} part="fig" />
			<line x1={960} y1={0} x2={960} y2={H} stroke="#000" strokeWidth={10} opacity={split} />
			{/* the line between them: a gold arc that shortens to nothing as the rooms join */}
			<path d={`M${aH[0] + 14},${aH[1] - 10} Q960,${180 + 160 * m} ${cH[0] - 10},${cH[1] - 8}`} stroke={GOLD} strokeWidth={3} fill="none" strokeDasharray="12 14" strokeDashoffset={-t * 70} opacity={0.85 * (1 - glow)} />
			<Glow x={mid[0]} y={mid[1]} r={120 + 380 * glow} c="#ffd98a" o={0.75 * glow} id="y77warm" />
			<circle cx={mid[0]} cy={mid[1]} r={30 * glow} fill="#fff4d6" opacity={glow * 0.9} />
		</Cam>
		<Flash k={seg(tau, T.end - 0.35, T.end) * 0.35} col="#ffe6a8" />
		{void SANS}
	</g>;
};
