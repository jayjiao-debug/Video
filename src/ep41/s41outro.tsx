import React from 'react';
import {W, H, SERIF, SANS, rnd, cl, sm, lerp, fio, fkPose, Rimmed, LOOK4, Glow, Pose, Look4} from './v3base';
import {Cam, ease, easeOut, seg} from './fx';
import {Voyager, RecordCover, voyRecordPos} from './voyager';
import {MilkyWay, StarField, hill} from './sky41';
/* Outro 172.935–188.1 (owner note 11: "people standing in space? the satellite is too cheap looking").
   1 · the Golden Record, close, its grooves catching light; a faint trace of her brain waves crosses it (O1).
   2 · pull back: the record is on the side of Voyager — the real spacecraft in detail — as the greeting plays (O2).
   3 · tilt down to Earth: on a hilltop at night everyone from the relay stands on the ground, looking up at one moving
       point of light. The title, then the question (O3). */
export const OUT_T = {pull: 4.4, voy: 5.4, recede: 8.6, tilt: 9.9, title: 10.4, q: 11.145, end: 15.165};
const GOLD = '#f2cf7a';
const VP = {x: 980, y: 470, s: 175, yaw: 0.3, pitch: -1.35, roll: 0.05};   // the hero framing: record faces us, dish behind
const REC = voyRecordPos(VP.x, VP.y, VP.s, VP.yaw, VP.pitch, VP.roll);

const Brain: React.FC<{x: number; y: number; w: number; t: number; k: number}> = ({x, y, w, t, k}) => k <= 0 ? null : <path
	d={Array.from({length: 121}, (_, i) => { const u = i / 120, v = Math.sin(u * 40 + t * 9) * 0.5 + Math.sin(u * 97 + t * 15) * 0.3 + Math.sin(u * 13 - t * 4) * 0.4; return `${i ? 'L' : 'M'}${(x - w / 2 + u * w).toFixed(1)},${(y + v * 14 * Math.sin(Math.PI * u)).toFixed(1)}`; }).join(' ')}
	stroke="#fff1c4" strokeWidth={2.2} fill="none" opacity={0.7 * k} style={{filter: 'drop-shadow(0 0 6px rgba(255,210,120,0.8))'}} />;

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

export const OUTRO3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const T = OUT_T;
	// 1–2 · record → Voyager: one continuous pull-back about the record's position
	if (tau < T.tilt) {
		const pull = ease(seg(tau, T.pull, T.voy + 1.2)), recede = ease(seg(tau, T.recede, T.tilt));
		const zoom = lerp(9, 1, pull) * lerp(1, 0.22, recede);
		const coverOp = 1 - sm(seg(tau, T.pull + 0.3, T.voy + 0.4));
		const fx = lerp(REC[0], 960, recede * 0.6), fy = lerp(REC[1], 470, recede * 0.6);
		return <g>
			<rect width={W} height={H} fill="#03040a" />
			<StarField t={t} n={320} maxY={H} op={0.9} seed={3} />
			<g transform={`rotate(${-6 + tau * 0.4} 960 540)`}><MilkyWay t={t} op={0.85} cx={900} cy={430} ang={-24} /></g>
			<Cam zoom={zoom} fx={fx} fy={fy}>
				<Voyager x={VP.x} y={VP.y} s={VP.s} yaw={VP.yaw + tau * 0.012} pitch={VP.pitch} roll={VP.roll} mag={0.9} glint={0.4 + 0.3 * Math.sin(t * 0.8)} recordGlow={0.12 + 0.2 * (1 - pull)} light={[-0.8, 0.35, 0.6]} />
			</Cam>
			{/* the record close: a full-frame cover that becomes the small disc on the bus as we pull back */}
			{coverOp > 0.01 && <g opacity={coverOp}><Cam zoom={lerp(1, 0.1, pull)} fx={960} fy={540} px={(REC[0] - 960) * pull} py={(REC[1] - 540) * pull}>
				<rect width={W} height={H} fill="#06050a" opacity={1 - pull} />
				<RecordCover x={960} y={540} r={410} t={t} glow={0.5} />
				<Brain x={960} y={540} w={620} t={t} k={fio(tau, 0.4, T.pull + 0.2, 0.6)} />
			</Cam></g>}
			{tau < 0.6 && <rect width={W} height={H} fill="#ffe6a8" opacity={0.35 * (1 - tau / 0.6)} />}
		</g>;
	}
	// 3 · the hilltop: everyone on the ground, looking up at one moving point of light
	const k = ease(seg(tau, T.tilt, T.tilt + 1.6)), hl = hill(W, H, 960, 830, 980, 1010), py = lerp(-700, 0, k);
	const star: [number, number] = [lerp(1060, 1180, seg(tau, T.tilt, T.end)), lerp(170, 150, seg(tau, T.tilt, T.end))];
	return <g>
		<defs><linearGradient id="oSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05040c" /><stop offset="0.55" stopColor="#14123a" /><stop offset="0.85" stopColor="#2e2a5a" /><stop offset="1" stopColor="#5a4a7a" /></linearGradient></defs>
		<g transform={`translate(0,${py})`}>
			<rect y={-800} width={W} height={H + 800} fill="url(#oSky)" />
			<StarField t={t} n={300} maxY={760} seed={5} />
			<MilkyWay t={t} op={0.9} cx={960} cy={300} ang={-32} />
			<Glow x={star[0]} y={star[1]} r={40} c="#fff4d8" o={0.8} id="oVoy" /><circle cx={star[0]} cy={star[1]} r={2.6} fill="#fff" />
			<path d={hl.d} fill="#07060c" />
			{CAST.map((c, i) => { const x = 420 + i * 98 + (i >= 10 ? 14 : 0), g = hl.yAt(x) + 3, h = 150 * (c.dh ?? 1);
				return <Rimmed key={i} x={x} ground={g} h={h} pose={c.pose} look={c.look} flip={c.flip} col="#050409" rim="#9fb0ff" rimOp={0.28} rimDx={0} rimDy={-1.5} T={t + i} />; })}
		</g>
		{/* title, then the question */}
		<g opacity={fio(tau, T.title, T.end + 1, 0.7)}>
			<text x={960} y={300} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 60, letterSpacing: '0.06em'}} fill="#fff">为了跟你说一句话，</text>
			<text x={960} y={384} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 60, letterSpacing: '0.06em'}} fill={GOLD} opacity={cl((tau - T.title - 0.5) / 0.5)}>人类努力了三千年。</text>
		</g>
		<g opacity={cl((tau - T.q) / 0.6)}>
			<text x={960} y={540} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 80}} fill={GOLD} stroke="rgba(0,0,0,0.4)" strokeWidth={5} paintOrder="stroke">你最想对谁说一句话？</text>
			<text x={960} y={612} textAnchor="middle" style={{fontFamily: SANS, fontSize: 32}} fill="#fff" opacity={0.85 * cl((tau - T.q - 0.8) / 0.6)}>写在评论区，也许，ta 会听见。</text>
		</g>
		{void rnd}{void easeOut}
	</g>;
};
