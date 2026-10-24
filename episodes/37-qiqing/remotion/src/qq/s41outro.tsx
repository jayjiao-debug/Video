import React from 'react';
import {W, H, SERIF, SANS, LATS, rnd, cl, sm, lerp, fio, fkPose, Rimmed, LOOK4, Glow, Pose, Look4} from './v3base';
import {Cam, ease, easeIn, seg} from './fx';
import {Voyager, RecordCover, voyRecordPos} from './voyager';
import {MilkyWay, StarField, hill} from './sky41';
import {reach, toBody} from './s41morse';
import {atEar} from './s41y1977';
/* Outro from film 172.64. r4 (owner, 24 Oct: "回到妈，浪漫的解释人类想沟通的心情"; "金唱片有啥特殊含义"):
   1 · the Golden Record close, her brain-wave trace (O1).
   2 · pull back: the record is on the side of Voyager; the Mandarin greeting (O2).
   3 · Voyager recedes into the stars until it is one point of light: 「这张金唱片，是写给外星人的一封信……可人类，还是把它寄了出去。」
   4 · the point of light becomes the ringing circle on the 23:47 phone from the cold open. The call connects. 妈：「喂？这么晚了，还没睡啊？」
   5 · wide: the caller on the edge of the bed by the window: 「妈，没什么事……就是，想你了。」 Push through the window into the sky.
   6 · the hilltop: everyone from the relay stands on the ground looking up at the moving point; last in the row, the caller,
       phone at the ear (N4: 「人类发明的每一种通讯，都是因为有人，想跟够不着的人，说一句话。」).
   7 · the Juno end card: title, 「现在，这句话，只要一秒钟。」, the question. */
export const OUT_T = {pull: 5.6, voy: 6.6, recede: 10.4, point: 15.4, phone: 18.3, connect: 19.7, room: 22.45, win: 26.5, hill: 27.6, title: 33.6, q: 37.3, end: 42.69};
const GOLD = '#f2cf7a';
const BRAIN_IN = 3.9;   // her brain-wave trace crosses the record when the line about it starts
const VP = {x: 980, y: 470, s: 175, yaw: 0.3, pitch: -1.35, roll: 0.05};   // the hero framing: record faces us, dish behind
const REC = voyRecordPos(VP.x, VP.y, VP.s, VP.yaw, VP.pitch, VP.roll);
/** where the 妈 avatar circle sits on screen in the phone shot (the phone is drawn rotated −4° about (960, 480)) */
const AV: [number, number] = [960 - 170 * Math.sin(4 * Math.PI / 180), 480 - 170 * Math.cos(4 * Math.PI / 180)];

const Brain: React.FC<{x: number; y: number; w: number; t: number; k: number}> = ({x, y, w, t, k}) => k <= 0 ? null : <path
	d={Array.from({length: 121}, (_, i) => { const u = i / 120, v = Math.sin(u * 40 + t * 9) * 0.5 + Math.sin(u * 97 + t * 15) * 0.3 + Math.sin(u * 13 - t * 4) * 0.4; return `${i ? 'L' : 'M'}${(x - w / 2 + u * w).toFixed(1)},${(y + v * 14 * Math.sin(Math.PI * u)).toFixed(1)}`; }).join(' ')}
	stroke="#fff1c4" strokeWidth={2.2} fill="none" opacity={0.7 * k} style={{filter: 'drop-shadow(0 0 6px rgba(255,210,120,0.8))'}} />;

/* ---------------------------------------------------------------- 1–3 · space */
const Space: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = OUT_T;
	const pull = ease(seg(tau, T.pull, T.voy + 1.2)), u = ease(seg(tau, T.recede, T.point));
	const ZR = 410 * 1.1 / (0.19 * VP.s);   // the close-up cover (r 410 × 1.1) is the bus's record (r 0.19·s) seen at this zoom
	const zoom = lerp(ZR, 1, pull) * Math.pow(0.004, u), coverS = pull > 0 ? lerp(ZR, 1, pull) / ZR * 1.1 : lerp(1, 1.1, ease(seg(tau, 0, T.pull)));
	const coverOp = 1 - sm(seg(tau, T.pull + 0.3, T.voy + 0.4));
	const fx = lerp(REC[0], AV[0], u), fy = lerp(REC[1], AV[1], u);
	const sx = (VP.x - fx) * zoom + fx, sy = (VP.y - fy) * zoom + fy, dot = cl((0.16 - zoom) / 0.1);   // the craft's centre on screen; a point of light takes over as it shrinks
	return <g>
		<rect width={W} height={H} fill="#03040a" />
		<Cam zoom={1 + 0.09 * ease(seg(tau, T.recede, T.phone + 0.7))} fx={AV[0]} fy={AV[1]}>
			<StarField t={t} n={320} maxY={H} op={0.9} seed={3} />
			<g transform={`rotate(${-6 + tau * 0.4} 960 540)`}><MilkyWay t={t} op={0.85} cx={900} cy={430} ang={-24} /></g>
		</Cam>
		{zoom > 0.012 && <Cam zoom={zoom} fx={fx} fy={fy} px={(960 - REC[0]) * (1 - pull)} py={(540 - REC[1]) * (1 - pull)}>   {/* the bus's record sits exactly under the close-up cover until the pull-back separates them */}
			<Voyager x={VP.x} y={VP.y} s={VP.s} yaw={VP.yaw + tau * 0.012} pitch={VP.pitch} roll={VP.roll} mag={0.9} glint={0.4 + 0.3 * Math.sin(t * 0.8)} recordGlow={0.12 + 0.2 * (1 - pull)} light={[-0.8, 0.35, 0.6]} />
		</Cam>}
		{dot > 0 && <><Glow x={sx} y={sy} r={34 + 5 * Math.sin(t * 2.3)} c="#fff4d8" o={(0.72 + 0.12 * Math.sin(t * 3.1)) * dot} id="oDot" /><circle cx={sx} cy={sy} r={2.6} fill="#fff" opacity={dot} />
			<path d={`M${sx - 16},${sy} L${sx + 16},${sy} M${sx},${sy - 16} L${sx},${sy + 16}`} stroke="#fff4d8" strokeWidth={1.2} opacity={0.4 * dot * (0.6 + 0.4 * Math.sin(t * 1.7))} transform={`rotate(${t * 6} ${sx} ${sy})`} /></>}
		{/* the record close: a full-frame cover that becomes the small disc on the bus as we pull back */}
		{coverOp > 0.01 && <g opacity={coverOp}><Cam zoom={coverS} fx={960} fy={540} px={(REC[0] - 960) * pull} py={(REC[1] - 540) * pull}>
			<rect width={W} height={H} fill="#06050a" opacity={1 - pull} />
			<RecordCover x={960} y={540} r={410} t={t} glow={0.5} />
			<Brain x={960} y={540} w={620} t={t} k={fio(tau, BRAIN_IN, T.pull + 0.3, 0.6)} />
		</Cam></g>}
		{tau < 0.6 && <rect width={W} height={H} fill="#ffe6a8" opacity={0.35 * (1 - tau / 0.6)} />}
	</g>;
};

/* ---------------------------------------------------------------- 4 · the 23:47 phone, now connecting */
const PhoneCall: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = OUT_T, cx = 960, cy = 480, pw = 420, ph = 860;
	const ringing = 1 - cl((tau - T.connect) / 0.25), ring = ((tau - T.phone) * 1.3) % 1, on = cl((tau - T.connect) / 0.3);
	const secs = Math.max(0, Math.floor(tau - T.connect + 1)), talk = fio(tau, T.connect + 0.15, T.connect + 2.6, 0.15);
	const z = lerp(1.0, 1.12, ease(seg(tau, T.phone, T.room + 0.6)));
	return <Cam zoom={z} fx={AV[0]} fy={AV[1] + 120}>
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#07080e" />
		{/* the same dark bedroom as the cold open: a window with the city at night behind */}
		<rect x={1250} y={120} width={520} height={600} fill="#0d1424" />
		{Array.from({length: 40}, (_, i) => <circle key={i} cx={1260 + rnd(i, 3) * 500} cy={300 + rnd(i, 4) * 400} r={6 + 14 * rnd(i, 5)} fill={i % 4 ? '#ffd9a0' : '#9fc8ff'} opacity={0.12 + 0.2 * rnd(i, 6)} />)}
		<rect x={1250} y={120} width={520} height={600} fill="none" stroke="#000" strokeWidth={18} />
		<Glow x={cx} y={cy} r={700} c={on > 0.5 ? '#7fe0a0' : '#6f9cff'} o={0.2} id="ph2Glow" />
		<g transform={`rotate(-4 ${cx} ${cy})`}>
			<rect x={cx - pw / 2 - 14} y={cy - ph / 2 - 14} width={pw + 28} height={ph + 28} rx={70} fill="#111318" stroke="#2a2d36" strokeWidth={3} />
			<defs><linearGradient id="ph2Scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d2a3f" /><stop offset="1" stopColor="#0a0f18" /></linearGradient></defs>
			<rect x={cx - pw / 2} y={cy - ph / 2} width={pw} height={ph} rx={58} fill="url(#ph2Scr)" />
			<rect x={cx - 60} y={cy - ph / 2 + 22} width={120} height={14} rx={7} fill="#05070a" />
			<text x={cx - pw / 2 + 40} y={cy - ph / 2 + 60} fill="#dfe6f2" style={{fontFamily: SANS, fontSize: 24, fontWeight: 600}}>23:47</text>
			{ringing > 0 && [0, 1, 2].map((k) => { const v = (ring + k / 3) % 1; return <circle key={k} cx={cx} cy={cy - 170} r={92 + v * 120} fill="none" stroke="#7fd99a" strokeWidth={3} opacity={(1 - v) * 0.6 * ringing} />; })}
			{on > 0 && <circle cx={cx} cy={cy - 170} r={100 + 40 * (1 - on)} fill="none" stroke="#7fd99a" strokeWidth={4} opacity={0.8 * on * (1 - 0.6 * cl((tau - T.connect - 0.5) / 0.6))} />}
			<circle cx={cx} cy={cy - 170} r={92} fill="#3a4a62" /><text x={cx} y={cy - 146} textAnchor="middle" fill="#fff" style={{fontFamily: SANS, fontSize: 72, fontWeight: 700}}>妈</text>
			<text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" style={{fontFamily: SANS, fontSize: 52, fontWeight: 700}}>妈</text>
			{ringing > 0.5
				? <text x={cx} y={cy + 48} textAnchor="middle" fill="#a9b6c9" style={{fontFamily: SANS, fontSize: 30}}>{'正在呼叫' + '…'.slice(0, 1) + '·'.repeat(1 + Math.floor(t * 3) % 3)}</text>
				: <text x={cx} y={cy + 48} textAnchor="middle" fill="#9fe6b4" style={{fontFamily: SANS, fontSize: 32, fontWeight: 600}}>{`00:${String(secs).padStart(2, '0')}`}</text>}
			{/* her voice: a small level meter under the timer while she speaks */}
			{talk > 0 && <g opacity={talk}>{Array.from({length: 9}, (_, i) => { const a = 0.25 + 0.75 * Math.abs(Math.sin(t * (7 + i * 1.7) + i * 1.3)) * (0.5 + 0.5 * Math.sin(t * 3.1 + i)); return <rect key={i} x={cx - 72 + i * 16} y={cy + 92 - 22 * a} width={8} height={44 * a} rx={4} fill="#9fe6b4" opacity={0.85} />; })}</g>}
			<circle cx={cx} cy={cy + ph / 2 - 140} r={58} fill="#e5483d" /><rect x={cx - 26} y={cy + ph / 2 - 146} width={52} height={12} rx={6} fill="#fff" />
		</g>
	</Cam>;
};

/* ---------------------------------------------------------------- 5 · the room: the caller on the edge of the bed by the window */
const NOW_LOOK: Look4 = {dress: 'shirt', head: 'short'};
const RF = {x: 742, ground: 992, h: 640};
const NOW_FK = {hip: 0.37, lean: 12, neck: 18, lt: 84, lk: 90, rt: 78, rk: 86, la: 22, le: 136, ra: 40, re: 30};
const NOW_SIT = fkPose(reach(NOW_FK, 'l', toBody(atEar(fkPose(NOW_FK), RF.x, RF.ground, RF.h, false).c, RF.x, RF.ground, RF.h, false)));
/** a smartphone held at the ear, its screen light spilling on the cheek */
const HeldPhone: React.FC<{pose: Pose; x: number; ground: number; h: number; flip?: boolean; glow?: number; id: string}> = ({pose, x, ground, h, flip = false, glow = 1, id}) => {
	const e = atEar(pose, x, ground, h, flip), L = 0.088 * h, w = 0.042 * h;
	return <g>
		<Glow x={e.c[0]} y={e.c[1]} r={0.16 * h} c="#bcd4ff" o={0.22 * glow} id={id} />
		<g transform={`translate(${e.c[0]},${e.c[1]}) rotate(${e.rot})`}><rect x={-L / 2} y={-w / 2} width={L} height={w} rx={w * 0.25} fill="#090b12" /><rect x={-L / 2 + 2} y={w / 2 - 3} width={L - 4} height={2} fill="#bcd4ff" opacity={0.5 * glow} /></g>
	</g>;
};
/** the city through the window, drawn like the cold open's "today" street: flat black towers, LED and warm windows */
const WIN = {x: 960, y: 130, w: 800, h: 730};
const CityNight: React.FC<{t: number}> = ({t}) => {
	const {x, y, w, h} = WIN, base = y + h;
	const tower = (i: number, layer: number) => { const n = [11, 6, 3][layer], cw = w / n * (layer === 2 ? 0.62 : layer === 1 ? 0.7 : 0.8), cx = x + (i + 0.5) * (w / n) + (rnd(i, 11 + layer) - 0.5) * 40,
		th = [h * 0.13, h * 0.24, h * 0.40][layer] * (0.7 + 0.55 * rnd(i, 12 + layer)), top = base - th, col = ['#141a2c', '#0b0f1c', '#05070d'][layer];
		const cols = Math.max(2, Math.floor(cw / [26, 34, 44][layer])), rows = Math.floor(th / [22, 30, 40][layer]);
		return <g key={`${layer}_${i}`}><rect x={cx - cw / 2} y={top} width={cw} height={th + 4} fill={col} />
			{layer > 0 && Array.from({length: rows}, (_, r) => Array.from({length: cols}, (_, c) => { const k = i * 97 + r * 13 + c * 7 + layer * 1000, lit = rnd(k, 3) < (layer === 2 ? 0.34 : 0.28) || (rnd(k, 5) < 0.04 && Math.sin(t * 0.4 + k) > 0.3);
				return lit ? <rect key={`${r}_${c}`} x={cx - cw / 2 + 10 + c * (cw - 16) / cols} y={top + 14 + r * [22, 30, 40][layer]} width={[0, 12, 18][layer]} height={[0, 10, 16][layer]} fill={rnd(k, 4) < 0.6 ? '#dfeaff' : '#ffd9a0'} opacity={layer === 1 ? 0.55 : 0.85} /> : null; }))}</g>; };
	return <g>
		<defs><linearGradient id="nowSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1020" /><stop offset="0.7" stopColor="#1b2440" /><stop offset="1" stopColor="#2a2f52" /></linearGradient>
			<clipPath id="nowWinClip"><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
		<g clipPath="url(#nowWinClip)">
			<rect x={x} y={y} width={w} height={h} fill="url(#nowSky)" />
			<Glow x={x + w / 2} y={base} r={w * 0.7} c="#ffcf9a" o={0.12} id="nowHaze" />
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={x + rnd(i, 21) * w} cy={y + rnd(i, 22) * h * 0.45} r={0.6 + 1.2 * rnd(i, 23) ** 3} fill="#eef0ff" opacity={0.25 + 0.5 * rnd(i, 24)} />)}
			{[0, 1, 2].map((L) => Array.from({length: [11, 6, 3][L]}, (_, i) => tower(i, L)))}
			{Array.from({length: 14}, (_, i) => <Glow key={i} x={x + 40 + rnd(i, 31) * (w - 80)} y={base - 6 - 30 * rnd(i, 32)} r={24} c={i % 3 ? '#ffd9a0' : '#bfe0ff'} o={0.35} id={`nowSt${i}`} />)}
		</g>
		{/* frame and mullions */}
		<rect x={x} y={y} width={w} height={h} fill="none" stroke="#03040a" strokeWidth={22} />
		<path d={`M${x + w / 3},${y} v${h} M${x + 2 * w / 3},${y} v${h} M${x},${y + h * 0.64} h${w}`} stroke="#03040a" strokeWidth={12} />
	</g>;
};
/** a dark modern bedroom in the cold open's flat style: window wall on the right, the bed on the left */
const NowRoom: React.FC<{t: number}> = ({t}) => <g>
	<defs><linearGradient id="nowWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c1020" /><stop offset="1" stopColor="#090b14" /></linearGradient></defs>
	<rect x={-400} y={-300} width={W + 800} height={H + 600} fill="url(#nowWall)" />
	<rect x={-400} y={900} width={W + 800} height={500} fill="#05060b" />
	<CityNight t={t} />
	<Glow x={WIN.x + WIN.w / 2} y={WIN.y + WIN.h * 0.6} r={760} c="#7fa6ff" o={0.1} id="nowWinG" />
	{/* window light falling on the floor */}
	<path d={`M${WIN.x},900 L${WIN.x + WIN.w},900 L${WIN.x + WIN.w + 260},1080 L${WIN.x - 240},1080 Z`} fill="#8fb0ff" opacity={0.06} />
	{/* curtain gathered at the window's left */}
	<path d={`M${WIN.x - 70},${WIN.y - 24} L${WIN.x + 18},${WIN.y - 24} L${WIN.x + 26},900 L${WIN.x - 82},900 Z`} fill="#0e1424" />
	<path d={`M${WIN.x - 44},${WIN.y - 20} L${WIN.x - 50},898 M${WIN.x - 16},${WIN.y - 20} L${WIN.x - 14},898 M${WIN.x + 6},${WIN.y - 20} L${WIN.x + 12},898`} stroke="#090d18" strokeWidth={6} />
	<rect x={WIN.x - 90} y={WIN.y - 34} width={WIN.w + 130} height={10} fill="#03040a" />
	{/* bed: headboard, frame, mattress, rumpled duvet lit along its top by the window, pillow; a bedside table */}
	<rect x={20} y={560} width={34} height={300} rx={6} fill="#10141f" />
	<rect x={40} y={790} width={700} height={52} rx={6} fill="#0b0e18" /><rect x={60} y={838} width={16} height={62} fill="#0b0e18" /><rect x={704} y={838} width={16} height={62} fill="#0b0e18" />
	<rect x={50} y={742} width={688} height={56} rx={16} fill="#1a2132" />
	<path d="M70,750 Q180,700 300,738 Q420,712 540,742 Q640,724 730,752 L734,800 L66,800 Z" fill="#212a3e" />
	<path d="M70,750 Q180,700 300,738 Q420,712 540,742 Q640,724 730,752" stroke="#3a4a6c" strokeWidth={4} fill="none" opacity={0.7} />
	<path d="M80,742 Q78,700 120,694 L236,690 Q270,694 268,730 Q262,748 230,750 L110,752 Q82,752 80,742 Z" fill="#2a3348" />
	<rect x={-60} y={690} width={64} height={210} fill="#0d111c" /><rect x={-40} y={640} width={10} height={50} fill="#0d111c" /><path d="M-62,640 L-8,640 L-20,604 L-50,604 Z" fill="#141a28" />
</g>;
const Room: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = OUT_T, push = ease(seg(tau, T.room, T.win)), dive = easeIn(seg(tau, T.win, T.hill + 0.3));
	const z = lerp(1.0, 1.1, push) * lerp(1, 7, dive), fx = lerp(820, 1360, dive), fy = lerp(640, 260, dive);
	const breathe = 0.004 * Math.sin(t * 1.6);
	return <Cam zoom={z} fx={fx} fy={fy}>
		<NowRoom t={t} />
		<g transform={`translate(0,${-breathe * RF.h})`}>
			<Rimmed x={RF.x} ground={RF.ground} h={RF.h} pose={NOW_SIT} look={NOW_LOOK} col="#070910" rim="#9fc0ff" rimOp={0.42} rimDx={2.4} rimDy={-1} T={tau} />
			<HeldPhone pose={NOW_SIT} x={RF.x} ground={RF.ground} h={RF.h} id="nowPh" />
		</g>
	</Cam>;
};

/* ---------------------------------------------------------------- 6–7 · the hilltop and the end card */
type Cast = {look: Look4; pose: Pose; flip?: boolean; dh?: number};
const up = (lean: number, neck: number, la: number, le: number, ra: number, re: number, step = 0): Pose => fkPose({hip: 0.655, lean, neck, lt: 3 + step, lk: 3, rt: -4 - step, rk: 4, la, le, ra, re});
const CAST: Cast[] = [
	{look: LOOK4.diviner, pose: up(-6, -30, 8, 20, -2, 10)},
	{look: LOOK4.du, pose: up(-4, -26, 4, 12, 0, 8, 2)},
	{look: {...LOOK4.morse, head: 'tophat'}, pose: up(-5, -28, 6, 14, -4, 10)},
	{look: LOOK4.scott, pose: up(-3, -24, 2, 10, 4, 14, 3)},
	{look: LOOK4.bell, pose: up(-6, -32, 10, 30, -2, 8)},
	{look: LOOK4.watson, pose: up(-4, -28, 4, 10, 2, 12, 2)},
	{look: LOOK4.marconi, pose: up(-5, -26, 3, 8, -3, 8)},
	{look: LOOK4.kemp, pose: up(-6, -30, 20, 70, -2, 10, 1)},
	{look: LOOK4.kline, pose: up(-4, -26, 2, 8, 2, 8)},
	{look: LOOK4.bj, pose: up(-5, -30, 4, 12, -2, 10, 2)},
	{look: LOOK4.druyan, pose: up(-6, -32, 6, 12, 22, 30)},
	{look: LOOK4.sagan, pose: up(-6, -30, 22, 30, -2, 8), flip: false},
];
const HL = hill(W, H, 960, 830, 980, 1010);
const NOW_X = 1640, NOW_G = HL.yAt(NOW_X) + 3, NOW_H = 150;
const NOW_UP_FK = {hip: 0.655, lean: -5, neck: -26, lt: 4, lk: 3, rt: -6, rk: 4, la: 24, le: 132, ra: -2, re: 10};
const NOW_STAND = fkPose(reach(NOW_UP_FK, 'l', toBody(atEar(fkPose(NOW_UP_FK), NOW_X, NOW_G, NOW_H, false).c, NOW_X, NOW_G, NOW_H, false)));
/* end-card layout: pixel-measured centring nudges, and the monogram + pill row (centred as one group on the hill) */
const DX = {t1: 23, t2: 19, q: 20, c: 9};
const PILL = {x: 960 - 400 / 2 + 40, w: 400};
/** the channel monogram (as in the Juno brand package): a gold ring, an italic J, a four-point spark; draw 0..1 */
const JMark: React.FC<{draw: number}> = ({draw}) => { const r = 54, c = 2 * Math.PI * r, spark = cl((draw - 0.6) / 0.4);
	return <g>
		<circle r={r} fill="none" stroke={GOLD} strokeWidth={2.5} strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, draw * 1.3))} transform="rotate(-90)" />
		<circle r={47} fill="none" stroke={GOLD} strokeWidth={1} opacity={0.35 * draw} />
		<text y={22} textAnchor="middle" style={{fontFamily: LATS, fontStyle: 'italic', fontWeight: 600, fontSize: 70}} fill={GOLD} opacity={cl((draw - 0.3) / 0.4)}>J</text>
		<path d="M0,-9 L2.2,-2.2 L9,0 L2.2,2.2 L0,9 L-2.2,2.2 L-9,0 L-2.2,-2.2 Z" fill="#fff4d6" transform={`translate(40,-40) scale(${spark * 1.4}) rotate(${draw * 90})`} />
	</g>; };
const Hill: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = OUT_T, k = ease(seg(tau, T.hill, T.hill + 2.4)), py = lerp(760, 0, k);
	const star: [number, number] = [lerp(1060, 1180, seg(tau, T.hill, T.end)), lerp(170, 150, seg(tau, T.hill, T.end))];
	return <g>
		<defs><linearGradient id="oSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05040c" /><stop offset="0.55" stopColor="#14123a" /><stop offset="0.85" stopColor="#2e2a5a" /><stop offset="1" stopColor="#5a4a7a" /></linearGradient></defs>
		<Cam zoom={1 + 0.07 * ease(seg(tau, T.hill + 2.0, T.end))} fx={960} fy={840}><g transform={`translate(0,${py})`}>
			<rect y={-800} width={W} height={H + 800} fill="url(#oSky)" />
			<StarField t={t} n={300} maxY={760} seed={5} /><g transform="translate(0,-780)"><StarField t={t} n={260} maxY={780} seed={9} /></g>
			<MilkyWay t={t} op={0.9} cx={960} cy={300} ang={-32} />
			<Glow x={star[0]} y={star[1]} r={40} c="#fff4d8" o={0.8} id="oVoy" /><circle cx={star[0]} cy={star[1]} r={2.6} fill="#fff" />
			<path d={HL.d} fill="#07060c" />
			{CAST.map((c, i) => { const x = 420 + i * 98 + (i >= 10 ? 14 : 0), g = HL.yAt(x) + 3, h = 150 * (c.dh ?? 1);
				return <Rimmed key={i} x={x} ground={g} h={h} pose={c.pose} look={c.look} flip={c.flip} col="#050409" rim="#9fb0ff" rimOp={0.28} rimDx={0} rimDy={-1.5} T={t + i} />; })}
			{/* last in the row: you, tonight, the phone at your ear */}
			<Rimmed x={NOW_X} ground={NOW_G} h={NOW_H} pose={NOW_STAND} look={NOW_LOOK} col="#050409" rim="#9fb0ff" rimOp={0.28} rimDx={0} rimDy={-1.5} T={t + 12} />
			<HeldPhone pose={NOW_STAND} x={NOW_X} ground={NOW_G} h={NOW_H} glow={1.4} id="nowPhH" />
		</g></Cam>
		{/* the Juno end card: title, the question, then (on the dark hill) the monogram + follow pill and the sources.
		   Lines ending in full-width punctuation are nudged right (DX) so the visible ink is centred. */}
		<g opacity={fio(tau, T.title, T.end + 1, 0.7)}>
			<text x={960 + DX.t1} y={300} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 60, letterSpacing: '0.06em'}} fill="#fff">为了跟你说一句话，</text>
			<text x={960 + DX.t2} y={384} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 60, letterSpacing: '0.06em'}} fill={GOLD} opacity={cl((tau - T.title - 0.5) / 0.5)}>人类努力了三千年。</text>
		</g>
		<g opacity={cl((tau - T.q) / 0.6)}>
			<text x={960 + DX.q} y={540} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 80}} fill={GOLD} stroke="rgba(0,0,0,0.4)" strokeWidth={5} paintOrder="stroke">你最想对谁说一句话？</text>
			<text x={960 + DX.c} y={612} textAnchor="middle" style={{fontFamily: SANS, fontSize: 32}} fill="#fff" opacity={0.85 * cl((tau - T.q - 0.8) / 0.6)}>写在评论区，也许，ta 会听见。</text>
		</g>
		<g opacity={cl((tau - T.q - 0.5) / 0.6)}>
			<g transform={`translate(${PILL.x - 50},928) scale(0.56)`}><JMark draw={cl((tau - T.q - 0.4) / 1.1)} /></g>
			<rect x={PILL.x} y={899} width={PILL.w} height={58} rx={29} fill="rgba(242,207,122,0.10)" stroke={GOLD} strokeOpacity={0.75} strokeWidth={2} />
			<text x={PILL.x + PILL.w / 2} y={938} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em'}} fill={GOLD}>关注 Juno · 一起看懂世界</text>
		</g>
		<g opacity={0.62 * cl((tau - T.q - 0.9) / 0.6)} style={{fontFamily: SERIF, fontSize: 19}} fill="#d8d2e8">
			<text x={960} y={1018} textAnchor="middle">资料：美国国会图书馆（贝尔笔记）· Watson 1913 · Marconi 1902 · Kleinrock / UCLA · Zorn 1988 · CNNIC · NASA / JPL · NPR</text>
			<text x={960} y={1046} textAnchor="middle">音频：First Sounds · firstsounds.org · CC BY（有剪辑） · 画面为示意 · 内容由AI生成</text>
		</g>
	</g>;
};

export const OUTRO3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = OUT_T;
	const phoneOp = cl((tau - T.phone) / 0.7), roomOp = cl((tau - T.room) / 0.5), hillOp = cl((tau - T.hill) / 0.7);
	return <g>
		{phoneOp < 1 && <Space tau={tau} t={t} />}
		{phoneOp > 0 && roomOp < 1 && <g opacity={phoneOp}><PhoneCall tau={tau} t={t} /></g>}
		{roomOp > 0 && hillOp < 1 && <g opacity={roomOp}><Room tau={tau} t={t} /></g>}
		{hillOp > 0 && <g opacity={hillOp}><Hill tau={tau} t={t} /></g>}
	</g>;
};
