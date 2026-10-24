import React from 'react';
import {W, H, SANS, rnd, cl, sm, lerp, mixPose, Glow} from './v3base';
import {Cam, Whip, Flash, ease, easeIn, easeOut, seg} from './fx';
import {RoomA, LEAN, STAND, FUNNEL} from './s41bell';
import {Moon} from './sky41';
import {Iris} from './fx';
/* Cold open 0–9.30 (owner note 2: the first frames must move and promise).
   Your phone calls 妈 → dive into the earpiece → the call races back along a wire through older and older streets →
   the wire reaches a lit top-floor window in Boston, 1876 → push in on Bell about to speak → freeze at 9.30. */
export const OPEN_T = {dive: 0.75, fibre: 1.25, copper: 1.75, eras: [1.75, 2.55, 3.3, 4.0], house: 4.75, window: 5.75, room: 6.2, end: 9.3};

/* 1 · the phone */
const Phone: React.FC<{t: number}> = ({t}) => {
	const cx = 960, cy = 480, pw = 420, ph = 860, ring = (t * 1.3) % 1;
	return <g>
		<rect width={W} height={H} fill="#07080e" />
		{/* a dark bedroom: a window with a blurred city at night behind */}
		<rect x={1250} y={120} width={520} height={600} fill="#0d1424" />
		{Array.from({length: 40}, (_, i) => <circle key={i} cx={1260 + rnd(i, 3) * 500} cy={300 + rnd(i, 4) * 400} r={6 + 14 * rnd(i, 5)} fill={i % 4 ? '#ffd9a0' : '#9fc8ff'} opacity={0.12 + 0.2 * rnd(i, 6)} />)}
		<rect x={1250} y={120} width={520} height={600} fill="none" stroke="#000" strokeWidth={18} />
		<Glow x={cx} y={cy} r={700} c="#6f9cff" o={0.22} id="phGlow" />
		<g transform={`rotate(-4 ${cx} ${cy})`}>
			<rect x={cx - pw / 2 - 14} y={cy - ph / 2 - 14} width={pw + 28} height={ph + 28} rx={70} fill="#111318" stroke="#2a2d36" strokeWidth={3} />
			<defs><linearGradient id="phScr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d2a3f" /><stop offset="1" stopColor="#0a0f18" /></linearGradient></defs>
			<rect x={cx - pw / 2} y={cy - ph / 2} width={pw} height={ph} rx={58} fill="url(#phScr)" />
			<rect x={cx - 60} y={cy - ph / 2 + 22} width={120} height={14} rx={7} fill="#05070a" />{/* earpiece slot */}
			<text x={cx - pw / 2 + 40} y={cy - ph / 2 + 60} fill="#dfe6f2" style={{fontFamily: SANS, fontSize: 24, fontWeight: 600}}>23:47</text>
			{[0, 1, 2].map((k) => { const u = (ring + k / 3) % 1; return <circle key={k} cx={cx} cy={cy - 170} r={92 + u * 120} fill="none" stroke="#7fd99a" strokeWidth={3} opacity={(1 - u) * 0.6} />; })}
			<circle cx={cx} cy={cy - 170} r={92} fill="#3a4a62" /><text x={cx} y={cy - 146} textAnchor="middle" fill="#fff" style={{fontFamily: SANS, fontSize: 72, fontWeight: 700}}>妈</text>
			<text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" style={{fontFamily: SANS, fontSize: 52, fontWeight: 700}}>妈</text>
			<text x={cx} y={cy + 48} textAnchor="middle" fill="#a9b6c9" style={{fontFamily: SANS, fontSize: 30}}>{'正在呼叫' + '…'.slice(0, 1) + '·'.repeat(1 + Math.floor(t * 3) % 3)}</text>
			<circle cx={cx} cy={cy + ph / 2 - 140} r={58} fill="#e5483d" /><rect x={cx - 26} y={cy + ph / 2 - 146} width={52} height={12} rx={6} fill="#fff" />
		</g>
	</g>;
};

/* 2 · eras the wire races through, from now back to 1876 (camera travels left = back in time) */
type Era = {sky: [string, string]; bld: [number, number]; win: string; winP: number; lamp?: string; neon?: boolean; chimney?: boolean; moon?: boolean};
const ERAS: Era[] = [
	{sky: ['#0b1020', '#1b2440'], bld: [260, 620], win: '#dfeaff', winP: 0.5, lamp: '#e8f0ff'},                // today: towers, LED
	{sky: ['#0d0c1c', '#251a33'], bld: [160, 320], win: '#ffd6a0', winP: 0.35, lamp: '#ffe2b0', neon: true},   // mid-century neon
	{sky: ['#0b0a14', '#1f1820'], bld: [120, 210], win: '#ffcf86', winP: 0.25, lamp: '#ffc46a', chimney: true}, // 1900, gas lamps
	{sky: ['#070812', '#191a2c'], bld: [110, 190], win: '#ffc778', winP: 0.12, lamp: '#ffb85a', chimney: true, moon: true}, // 1876
];
const Street: React.FC<{e: Era; cam: number; t: number; seed: number}> = ({e, cam, t, seed}) => {
	const per = 170, off = ((-cam * 0.45) % per + per) % per;
	return <g>
		<defs><linearGradient id={`esky${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={e.sky[0]} /><stop offset="1" stopColor={e.sky[1]} /></linearGradient></defs>
		<rect width={W} height={H} fill={`url(#esky${seed})`} />
		{e.moon && <Moon x={1460} y={210} r={52} id="omoon" />}
		{Array.from({length: Math.ceil(W / per) + 2}, (_, k) => { const i = Math.floor((-cam * 0.45) / per) - k + 6, x = W - k * per - off + per, hh = lerp(e.bld[0], e.bld[1], rnd(i, seed)), y = 900 - hh, w = per - 8;
			return <g key={k}><rect x={x - w} y={y} width={w} height={hh + 200} fill="#06060a" />
				{e.chimney && <rect x={x - w + 20 + 60 * rnd(i, 7)} y={y - 34} width={16} height={34} fill="#06060a" />}
				{Array.from({length: Math.floor(hh / 46)}, (_, r) => Array.from({length: 3}, (_, c) => rnd(i * 31 + r * 7 + c, seed + 1) < e.winP ? <rect key={`${r}_${c}`} x={x - w + 18 + c * 50} y={y + 22 + r * 46} width={22} height={26} fill={e.win} opacity={0.85} /> : null))}
				{e.neon && rnd(i, 9) > 0.4 && <rect x={x - w + 20} y={y + 30} width={90} height={34} rx={6} fill="none" stroke={rnd(i, 10) > 0.5 ? '#ff4fa8' : '#4ff0ff'} strokeWidth={5} style={{filter: 'drop-shadow(0 0 8px currentColor)'}} />}
			</g>; })}
		<rect x={0} y={900} width={W} height={180} fill="#040406" />
	</g>;
};
const WireRace: React.FC<{t: number; tau: number}> = ({t, tau}) => {
	const O = OPEN_T, k = O.eras.filter((s) => tau >= s).length - 1, e = ERAS[Math.max(0, k)], start = O.eras[Math.max(0, k)];
	const v = lerp(5200, 1400, ease(seg(tau, O.copper, O.house))), cam = -(tau - O.copper) * v;   // fast, slowing toward 1876
	const swap = Math.max(...O.eras.slice(1).map((s) => 1 - Math.min(1, Math.abs(tau - s) / 0.09)));
	const per = 640, off = ((-cam) % per + per) % per, wireY = 430;
	return <g>
		<Whip id="owhip" amt={v / 260}><Street e={e} cam={cam} t={t} seed={k + 1} />
			{e.lamp && Array.from({length: 8}, (_, i) => { const x = ((i * 300 - cam * 0.8) % 2400 + 2400) % 2400 - 200; return <g key={i}><rect x={x - 3} y={760} width={6} height={140} fill="#050507" /><Glow x={x} y={756} r={70} c={e.lamp!} o={0.55} id={`olamp${k}`} /></g>; })}
		</Whip>
		{/* poles and the wire in the foreground, sharp, moving left→right past us */}
		<Whip id="owhip2" amt={v / 120}>{Array.from({length: 5}, (_, i) => { const x = W + per - i * per - off; return <g key={i}><rect x={x - 9} y={wireY - 30} width={18} height={H} fill="#030304" /><rect x={x - 70} y={wireY - 26} width={140} height={12} fill="#030304" /></g>; })}</Whip>
		<line x1={0} y1={wireY} x2={W} y2={wireY} stroke={tau < O.copper + 0.4 ? '#bfe8ff' : '#c98a4a'} strokeWidth={4} />
		{/* the call, a pulse of light racing ahead of us along the wire */}
		<Glow x={W * 0.18} y={wireY} r={150} c="#ffe9b8" o={0.9} id="opulse" /><circle cx={W * 0.18} cy={wireY} r={9} fill="#fff" />
		<Flash k={swap * 0.3} col="#fff4dc" />
		<YearTicker tau={tau} />
	</g>;
};
/** the year runs back 2026 → 1876 while the call races along the wire (≥ 72 px) */
const YearTicker: React.FC<{tau: number}> = ({tau}) => { const O = OPEN_T, u = seg(tau, O.copper, O.house), y = Math.round(2026 - 150 * (1 - Math.pow(1 - u, 1.6)));
	return <g><text x={W - 90} y={150} textAnchor="end" style={{fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 84, letterSpacing: '0.04em'}} fill="#f4ead2" opacity={0.92} stroke="rgba(0,0,0,0.5)" strokeWidth={5} paintOrder="stroke">{y}</text></g>; };
/* 3 · the boarding house: the wire runs to one lit top-floor window */
const House: React.FC<{t: number; tau: number}> = ({t, tau}) => {
	const O = OPEN_T, u = seg(tau, O.house, O.room), zoom = lerp(1, 9, easeIn(seg(tau, O.house + 0.35, O.room))), wx = 1180, wy = 430;
	return <Cam zoom={zoom} fx={wx} fy={wy} px={lerp(-200, 0, easeOut(seg(tau, O.house, O.house + 0.6)))}>
		<Street e={ERAS[3]} cam={-(tau - O.copper) * 1400} t={t} seed={4} />
		<path d={`M0,${wy - 160} Q${W * 0.5},${wy - 110} ${W},${wy - 170}`} stroke="#c98a4a" strokeWidth={3} fill="none" opacity={0.8} />
		<rect x={980} y={300} width={520} height={800} fill="#08070b" />
		<path d="M960,300 L1240,170 L1520,300 Z" fill="#08070b" /><rect x={1350} y={150} width={40} height={110} fill="#08070b" />
		{[[1060, 560], [1180, 560], [1300, 560], [1060, 760], [1300, 760]].map(([x, y], i) => <rect key={i} x={x - 30} y={y - 50} width={60} height={100} fill="#1a1520" />)}
		<Glow x={wx} y={wy} r={240} c="#ffc46a" o={0.55} id="ohwin" />
		<rect x={wx - 34} y={wy - 56} width={68} height={112} fill="#ffcf7a" />
		<path d={`M${wx},${wy - 56} v112 M${wx - 34},${wy} h68`} stroke="#3a2614" strokeWidth={5} />
		{/* a silhouette at the window, bending */}
		<circle cx={wx - 4} cy={wy - 4} r={13} fill="#1a120c" opacity={sm(u * 3)} />
	</Cam>;
};

export const OPEN3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const O = OPEN_T;
	if (tau < O.fibre) { const z = lerp(1, 1.8, ease(seg(tau, 0, O.dive))) * lerp(1, 60, easeIn(seg(tau, O.dive, O.fibre)));
		return <g><Cam zoom={z} fx={935} fy={80} ><Phone t={t} /></Cam></g>; }
	if (tau < O.copper) {   // inside the fibre: light streaks
		const u = seg(tau, O.fibre, O.copper);
		return <g><rect width={W} height={H} fill="#000" /><Iris id="oFib" x={W / 2} y={540} r={30 + ease(seg(tau, O.fibre, O.fibre + 0.35)) * 1200}><rect width={W} height={H} fill="#02040a" />
			{Array.from({length: 40}, (_, i) => { const y = 540 + (rnd(i, 1) - 0.5) * 700 * (1 - u * 0.8), x = ((rnd(i, 2) * W - u * 6000 * (0.6 + rnd(i, 3))) % W + W) % W; return <line key={i} x1={x} y1={y} x2={x + 300 + 400 * rnd(i, 4)} y2={y} stroke={i % 3 ? '#9fe8ff' : '#fff'} strokeWidth={1 + 3 * rnd(i, 5)} opacity={0.3 + 0.5 * rnd(i, 6)} />; })}
			<line x1={0} y1={540 - (1 - u) * 110} x2={W} y2={540 - (1 - u) * 110} stroke="#dff6ff" strokeWidth={4} opacity={u} transform={`translate(0,${-u * 0})`} />
			</Iris><Flash k={seg(tau, O.copper - 0.12, O.copper) * 0.3} col="#fff4dc" /></g>; }
	if (tau < O.house) return <WireRace t={t} tau={tau} />;
	if (tau < O.room) return <g><House t={t} tau={tau} /></g>;
	// 4 · Bell's room: he leans in, the camera pushes to his lips; frozen at 9.30 by the caller
	const pose = mixPose(STAND, LEAN, sm(seg(tau, O.room - 0.2, O.room + 2.0)));
	const zoom = lerp(1.15, 2.35, ease(seg(tau, O.room, O.end)));
	return <g><Cam zoom={zoom} fx={FUNNEL[0] - 50} fy={lerp(560, FUNNEL[1] - 10, ease(seg(tau, O.room, O.end)))}>
		<RoomA t={t} tau={tau} pose={pose} vib={0} rings={0} door={0} />
	</Cam>{tau < O.room + 0.45 && <g opacity={1 - ease(seg(tau, O.room, O.room + 0.45))}><House t={t} tau={O.room - 0.001} /></g>}</g>;
};
void cl;
