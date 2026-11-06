/* ep61 v2 · three small scenes the comprehension pass asked for:
   CurseBounce (line 23): the red curse flies at the five gold days and shatters on them ("these 5 days aren't in any year").
   SetMeasures (line 30): Set sneaks behind Osiris with a knotted cord and measures his height (Plutarch 13 "secretly measured").
   GateWalk (line 35, first 1.8 s): the revived Osiris walks through a glowing gate into the underworld. t = seconds from their start. */
import React from 'react';
import {PAL} from '../qq60/geo60';
import {walkPose, STRIDE} from '../qq60/cast60';
import {God61, P61} from './cast61';
import {GY} from './shots61';
import {Night, Stars, cl, sm, lerp, u_, Smoke} from './mystic61';

export const CurseBounce: React.FC<{t: number}> = ({t}) => {
	const fly = sm(t / 1.0), hit = cl((t - 1.0) / 0.9), x = lerp(150, 720, fly), y = lerp(110, 200, fly) - 60 * Math.sin(fly * Math.PI), sh = Math.max(0, 1 - Math.abs(t - 1.02) / 0.3);
	return <g>
		{hit === 0 && <g transform={`translate(${x},${y}) rotate(${t * 220})`}><circle r={46} fill="#FF3A1C" opacity={0.35} filter="url(#my14)" />
			<circle r={30} fill="none" stroke="#FF5A3A" strokeWidth={6} /><path d="M-18 -18L18 18M18 -18L-18 18" stroke="#FF5A3A" strokeWidth={8} strokeLinecap="round" /></g>}
		{hit > 0 && Array.from({length: 10}, (_, i) => { const a = -Math.PI * 0.95 + (i / 9) * Math.PI * 0.9, d = 30 + 260 * hit; return <path key={i} d="M-10 -4L10 0L-10 4Z"
			transform={`translate(${720 + Math.cos(a) * d},${200 + Math.sin(a) * d * 0.7 - 40 * hit}) rotate(${(a * 180) / Math.PI + hit * 300})`} fill="#FF5A3A" opacity={1 - hit} />; })}
		<path d="M600 230 A150 150 0 0 1 840 230" stroke="#FFE9A8" strokeWidth={10} fill="none" opacity={sh} filter="url(#my4)" />
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
