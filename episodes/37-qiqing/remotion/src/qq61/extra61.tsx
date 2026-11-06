/* ep61 v2 · three small scenes the comprehension pass asked for:
   CurseBounce (line 23): the red curse flies at the five gold days and shatters on them ("these 5 days aren't in any year").
   SetMeasures (line 30): Set sneaks behind Osiris with a knotted cord and measures his height (Plutarch 13 "secretly measured").
   GateWalk (line 35, first 1.8 s): the revived Osiris walks through a glowing gate into the underworld. t = seconds from their start. */
import React from 'react';
import {PAL} from '../qq60/geo60';
import {POSES} from '../qq60/rig60';
import {walkPose, STRIDE} from '../qq60/cast60';
import {God61, P61} from './cast61';
import {GY} from './shots61';
import {Night, Stars, cl, sm, lerp, u_, Smoke} from './mystic61';

export const CurseBounce: React.FC<{t: number}> = ({t}) => {
	const fly = sm(t / 1.0), hit = cl((t - 1.0) / 0.9), x = lerp(150, 720, fly), y = lerp(110, 200, fly) - 60 * Math.sin(fly * Math.PI), sh = Math.max(0, 1 - Math.abs(t - 1.02) / 0.3);
	return <g>
		{hit === 0 && <g transform={`translate(${x},${y}) rotate(${t * 220}) scale(1.8)`}><circle r={46} fill="#FF3A1C" opacity={0.35} filter="url(#my14)" />
			<circle r={30} fill="none" stroke="#FF5A3A" strokeWidth={6} /><path d="M-18 -18L18 18M18 -18L-18 18" stroke="#FF5A3A" strokeWidth={8} strokeLinecap="round" /></g>}
		{hit > 0 && Array.from({length: 10}, (_, i) => { const a = -Math.PI * 0.95 + (i / 9) * Math.PI * 0.9, d = 30 + 260 * hit; return <path key={i} d="M-10 -4L10 0L-10 4Z"
			transform={`translate(${720 + Math.cos(a) * d},${200 + Math.sin(a) * d * 0.7 - 40 * hit}) rotate(${(a * 180) / Math.PI + hit * 300})`} fill="#FF5A3A" opacity={1 - hit} />; })}
		<path d="M560 236 A190 190 0 0 1 880 236" stroke="#FFE9A8" strokeWidth={14} fill="none" opacity={sh} filter="url(#my4)" />
		<circle cx={720} cy={200} r={90} fill="#FFE9A8" opacity={0.5 * sh + 0.18 * u_(t, 1.0, 0.6)} filter="url(#my14)" />
	</g>;
};

/** the banquet hall of shot 13 (dark red, gold band, lamps, guests' silhouettes) */
const Hall: React.FC<{T: number}> = ({T}) => <g>
	<rect x={-600} y={-500} width={2640} height={2080} fill="#3A1A12" /><rect x={-600} y={150} width={2640} height={10} fill={PAL.gold} />
	{[260, 720, 1180].map((x, i) => <g key={x}><path d={`M${x} 160V230`} stroke={PAL.gold} strokeWidth={4} /><circle cx={x} cy={250} r={20} fill="#FFB45A" />
		<circle cx={x} cy={250} r={70} fill="#FFB45A" opacity={0.22 * (1 + 0.3 * Math.sin(T * 7 + i * 2))} /></g>)}
	<rect x={-600} y={868} width={2640} height={700} fill="#4A2E14" />
</g>;
export const SetMeasures: React.FC<{t: number}> = ({t}) => {
	const T = t + 107, grow = u_(t, 0.4, 1.4), s = 30, ox = 860, top = GY - 19.2 * s, cy = lerp(GY, top, grow), close = t > 3.2;
	const z = close ? 1.55 : 1.08, cx = close ? 760 : 720, ccy = close ? 470 : 486;
	return <g transform={`translate(720,486) scale(${z}) translate(${-cx},${-ccy})`}>
		<Hall T={T} />
		{Array.from({length: 10}, (_, i) => <g key={i} opacity={0.75}><circle cx={60 + i * 150} cy={560} r={20} fill="#1A0C08" /><rect x={44 + i * 150} y={580} width={32} height={70} rx={8} fill="#1A0C08" /></g>)}
		<God61 id="smo" who="osiris" pose={{...P61.rest(T), head: 2}} x={ox} y={GY} s={s} t={T} />
		<path d={`M${ox - 70} ${GY}V${cy}`} stroke="#E8C25A" strokeWidth={5} />
		{Array.from({length: 7}, (_, i) => { const y = GY - (i + 1) * (GY - top) / 8; return y > cy ? <circle key={i} cx={ox - 70} cy={y} r={6} fill="#E8C25A" stroke="#3A1A12" strokeWidth={2} /> : null; })}
		<God61 id="sms" who="set" pose={{...P61.menace(), fs: lerp(40, 150, grow), fe: 10}} x={640} y={GY} s={s} sneer={u_(t, 1.6, 0.4)} t={T} />
		<Smoke x={1200} y={980} T={T} o={0.25} />
	</g>;
};

export const GateWalk: React.FC<{t: number}> = ({t}) => {
	const T = t + 128, s = 30, dist = 260 * cl(t / 1.8), ph = dist / (STRIDE * s), x = 520 + dist, glow = 0.75 + 0.15 * Math.sin(T * 3);
	return <g>
		<Night T={T} /><Stars seed={27} n={60} T={T} o={0.6} />
		<rect x={-600} y={GY} width={2640} height={700} fill="#140C08" />
		<g transform="translate(980 0)">
			<path d="M-230 868V300L-150 270V868ZM230 868V300L150 270V868Z" fill="#2A1C14" stroke="#0A0604" strokeWidth={4} />
			<rect x={-150} y={330} width={300} height={538} fill="#FFE2A0" opacity={glow} />
			<ellipse cx={0} cy={600} rx={260} ry={360} fill="#FFD27A" opacity={0.45 * glow} filter="url(#my50)" />
			<rect x={-170} y={300} width={340} height={30} fill="#3A2A1C" stroke="#0A0604" strokeWidth={4} /></g>
		<God61 id="gw" who="osiris" pose={walkPose(ph, {stride: 0.8})} x={x} y={GY} s={s} t={T} />
	</g>;
};

/* BoxScene (lines 31–32, the v2.1 rebuild after the review: "the murder plot has no action"): the banquet; Osiris stands by the chest,
   then lies down in it, a perfect fit; the lid slams; Set hammers three nails (sparks on the clangs); the chest tips into the river and
   floats away, the camera following. t = seconds from the block start (line 31); line 32 starts at L2. Keeps every head in frame. */
export const BOX_L2 = 4.0;
export const BOX_STRIKES = [0.42, 0.87, 1.32].map((d) => BOX_L2 + d);
export const BoxScene: React.FC<{t: number}> = ({t}) => {
	const T = t + 112, L2 = BOX_L2, CW = 520, CH = 140, X0 = 600, BASE = GY - 4, s = 24;
	const lieK = u_(t, 2.3, 1.0), lid = 1 - u_(t, L2 - 0.55, 0.4), slam = Math.max(0, 1 - Math.abs(t - (L2 - 0.15)) / 0.15);
	const hits = BOX_STRIKES.map((a) => Math.max(0, 1 - Math.abs(t - a) / 0.14)), hit = Math.max(...hits), tip = u_(t, L2 + 1.75, 2.3);
	const dx = 640 * tip, dy = 70 * Math.min(1, tip * 1.6) + 6 * Math.sin(T * 2.4) * tip, rot = -5 * Math.sin(Math.min(1, tip * 2) * Math.PI) ;
	const close = t >= L2 && t < L2 + 1.65, z = t < L2 ? 1.0 + 0.04 * sm(t / L2) : close ? 1.22 : 1.12, cx = t < L2 ? 720 : close ? 760 : lerp(780, 1180, tip), cy = t < L2 ? 486 : close ? 560 : 540;
	const armUp = BOX_STRIKES.reduce((m, a) => (t > a - 0.32 && t < a ? Math.max(m, sm((t - (a - 0.32)) / 0.25)) : m), 0);
	const hinge: [number, number] = [X0 - CW / 2, BASE - CH];
	/* the lid (hinged at the back-left top): behind Osiris while open, in front once it closes */
	const LID = <g transform={`rotate(${-78 * lid} ${hinge[0]} ${hinge[1]})`}><path d={`M${hinge[0]} ${hinge[1]}V${hinge[1] - 30}Q${X0} ${hinge[1] - 52} ${X0 + CW / 2} ${hinge[1] - 30}V${hinge[1]}Z`} fill={PAL.wood} stroke="#2A1408" strokeWidth={5} />
				<path d={`M${hinge[0]} ${hinge[1] - 16}H${X0 + CW / 2}`} stroke={PAL.gold} strokeWidth={6} />
				{BOX_STRIKES.map((a, i) => t > a - 0.02 ? <circle key={i} cx={hinge[0] + CW * (0.2 + 0.3 * i)} cy={hinge[1] - 22} r={6} fill="#1A0C08" /> : null)}</g>;
	/* the chest with its lid, Osiris and the nails; drawn behind Set until it tips into the river, then in front of him */
	const CHEST = <g transform={`translate(${dx},${dy}) rotate(${rot} ${X0} ${BASE})`}>
			{lid >= 0.5 && LID}
			{/* Osiris lying in it (head left, face up), clipped to the chest; body hidden by the front panel */}
			<defs><clipPath id="boxin"><rect x={X0 - CW / 2 + 6} y={BASE - CH - 140} width={CW - 12} height={CH + 140} /></clipPath></defs>
			{lieK > 0 && lid >= 0.5 && <g clipPath="url(#boxin)" opacity={lieK}><g transform={`translate(0,${(1 - lieK) * -40}) rotate(-90 ${X0 + CW / 2 - 22} ${BASE - CH + 18})`}>
				<God61 id="bxo" who="osiris" pose={{...POSES.rest, fs: -6, fe: 4, bs: -2, be: 4, head: -4}} x={X0 + CW / 2 - 22} y={BASE - CH + 18} s={s} t={T} /></g></g>}
			{/* the front panel */}
			<rect x={X0 - CW / 2} y={BASE - CH} width={CW} height={CH} fill={PAL.wood} stroke="#2A1408" strokeWidth={6} />
			<rect x={X0 - CW / 2} y={BASE - CH} width={CW} height={14} fill={PAL.gold} /><rect x={X0 - CW / 2} y={BASE - 34} width={CW} height={12} fill={PAL.gold} />
			{[0.2, 0.4, 0.6, 0.8].map((u) => <path key={u} d={`M${X0 - CW / 2 + CW * u} ${BASE - CH + 30}v60M${X0 - CW / 2 + CW * u - 12} ${BASE - CH + 52}h24`} stroke={PAL.gold} strokeWidth={5} opacity={0.8} />)}
			{lid < 0.5 && LID}
			{/* sparks on the nails */}
			{hits.map((h, i) => h > 0 && <g key={i} opacity={h}>{Array.from({length: 8}, (_, k) => { const a = (k / 8) * Math.PI * 2, x = hinge[0] + CW * (0.2 + 0.3 * i), y = hinge[1] - 22;
				return <path key={k} d={`M${x + Math.cos(a) * 10} ${y + Math.sin(a) * 10}L${x + Math.cos(a) * (26 + 30 * (1 - h))} ${y + Math.sin(a) * (26 + 30 * (1 - h))}`} stroke="#FFE0A0" strokeWidth={4} strokeLinecap="round" />; })}</g>)}
			<rect x={X0 - CW / 2 - 20} y={BASE - CH - 70} width={CW + 40} height={CH + 80} fill="#FFE0A0" opacity={0.25 * slam} />
		</g>;
	return <g transform={`translate(720,486) scale(${z}) translate(${-cx},${-cy})`}>
		<Hall T={T} />
		{Array.from({length: 12}, (_, i) => <g key={i} opacity={0.7}><circle cx={40 + i * 150} cy={560} r={20} fill="#1A0C08" /><rect x={24 + i * 150} y={580} width={32} height={70} rx={8} fill="#1A0C08" /></g>)}
		{/* the river along the front */}
		<rect x={-600} y={GY + 14} width={2640} height={300} fill="#22457E" />
		{[GY + 26, GY + 44].map((y, i) => <path key={y} d={`M-600 ${y}` + Array.from({length: 60}, (_, k) => `q22 ${i ? 7 : -7} 44 0`).join('')} transform={`translate(${-((T * 30 + i * 20) % 44)},0)`} stroke="#5A86C8" strokeWidth={4} fill="none" />)}
		{tip <= 0 && CHEST}
		{/* Osiris before he lies down: standing by the chest, admiring it */}
		{lieK < 1 && <g opacity={1 - lieK}><God61 id="bxs" who="osiris" pose={{...P61.rest(T), head: 6}} x={250} y={GY} s={28} t={T} /></g>}
		{/* Set: presents the chest (line 31), then hammers (line 32); a mallet in his raised hand */}
		<God61 id="bxset" who="set" pose={{...P61.menace(), fs: t < L2 ? 60 + 10 * Math.sin(T * 2) : lerp(70, 150, armUp), fe: 20}} x={t < L2 ? 1000 : 960} y={GY} s={28} face={-1} sneer={u_(t, 1.0, 0.4)} t={T} />
		{t >= L2 - 0.3 && t < L2 + 1.6 && <g transform={`translate(${hinge[0] + CW * (0.2 + 0.3 * Math.min(2, Math.floor((t - L2 - 0.1) / 0.45 + 0.0001)))},${hinge[1] - 40 - 70 * armUp}) rotate(${-30 * armUp})`}>
			<rect x={-6} y={-6} width={12} height={70} rx={4} fill="#6A4A2A" stroke="#2A1408" strokeWidth={3} /><rect x={-22} y={-26} width={44} height={26} rx={5} fill="#8A6A3A" stroke="#2A1408" strokeWidth={3} /></g>}
		{tip > 0 && CHEST}
		<Smoke x={1300} y={980} T={T} o={0.22} />
	</g>;
};
