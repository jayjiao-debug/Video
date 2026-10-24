import React from 'react';
/* Period-correct props for ep41 v3 (owner notes 1 and 5: era-correct, recognisable, nothing unexplained).
   Each prop is drawn in the scene's silhouette colour `col` with a few lit details (`hi`), local origin at its base. */
type PP = {x: number; y: number; s?: number; col?: string; hi?: string; t?: number};
const C = '#0b0a12';

/** 商: turtle plastron with drilled hollows; cracks grow with k (0..1); carved marks appear with ink (0..1) */
export const Plastron: React.FC<PP & {k?: number; ink?: number; glow?: number}> = ({x, y, s = 1, k = 0, ink = 0, glow = 0}) => {
	const crack = (cx: number, cy: number, dir: number, i: number) => { const L = 26 * Math.min(1, k * 1.4 - i * 0.08); if (L <= 0) return null;
		return <path key={i} d={`M${cx},${cy} l0,${-L * 0.9} M${cx},${cy - L * 0.45} l${dir * L * 0.7},${-L * 0.25}`} stroke="#2a1608" strokeWidth={2.2} fill="none" strokeLinecap="round" />; };
	const holes: [number, number, number][] = [[-30, -40, 1], [30, -40, -1], [-34, 0, 1], [34, 0, -1], [-30, 40, 1], [30, 40, -1], [-18, -70, 1], [18, -70, -1]];
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		{glow > 0 && <ellipse cx={0} cy={0} rx={140} ry={160} fill="#ff9a3a" opacity={0.18 * glow} />}
		<path d="M0,-118 C40,-118 62,-96 66,-60 C80,-50 82,-30 70,-22 C74,10 74,40 66,62 C80,70 78,92 62,96 C50,118 24,126 0,126 C-24,126 -50,118 -62,96 C-78,92 -80,70 -66,62 C-74,40 -74,10 -70,-22 C-82,-30 -80,-50 -66,-60 C-62,-96 -40,-118 0,-118 Z" fill="#d9c49a" stroke="#8a6a3a" strokeWidth={3} />
		<path d="M0,-118 L0,126 M-66,-58 Q0,-48 66,-58 M-70,-20 Q0,-8 70,-20 M-66,62 Q0,52 66,62" stroke="#a8875a" strokeWidth={2} fill="none" />
		{holes.map(([hx, hy], i) => <ellipse key={i} cx={hx} cy={hy} rx={5} ry={8} fill="#7a5a32" />)}
		{holes.map(([hx, hy, d], i) => crack(hx, hy, d, i))}
		{ink > 0 && <g stroke="#3a2210" strokeWidth={2.4} fill="none" opacity={Math.min(1, ink)} strokeLinecap="round">
			{/* carved marks in columns beside the cracks (shapes only; not legible glyphs) */}
			{[[-52, -10], [-52, 14], [-52, 38], [48, -10], [48, 14]].map(([gx, gy], i) => <path key={i} d={`M${gx},${gy} l8,0 M${gx + 4},${gy - 6} l0,12 M${gx},${gy + 8} l8,-3`} />)}
		</g>}
	</g>;
};
/** a small fire / brand: flickers with t */
export const Fire: React.FC<PP & {r?: number}> = ({x, y, s = 1, t = 0, r = 1}) => { const fl = (i: number) => 1 + 0.18 * Math.sin(t * (9 + i) + i * 2) + 0.1 * Math.sin(t * 23 + i);
	return <g transform={`translate(${x},${y}) scale(${s * r})`}>
		<ellipse cx={0} cy={-30} rx={160} ry={120} fill="#ff8a2a" opacity={0.16} />
		<path d={`M-30,0 Q-34,${-40 * fl(1)} -10,${-70 * fl(2)} Q-6,${-40 * fl(3)} 0,${-90 * fl(4)} Q10,${-50 * fl(5)} 18,${-64 * fl(6)} Q30,${-30 * fl(7)} 30,0 Z`} fill="#ff9b2e" />
		<path d={`M-16,0 Q-16,${-30 * fl(8)} -2,${-48 * fl(9)} Q6,${-28 * fl(1)} 14,${-40 * fl(2)} Q18,-14 16,0 Z`} fill="#ffe08a" />
		<path d="M-44,4 L44,-4 M-40,-4 L42,6" stroke="#2a1608" strokeWidth={9} strokeLinecap="round" />
	</g>; };

/** 唐: a folded letter — paper with brush columns, tied with a cord (no Western envelope) */
export const TangLetter: React.FC<PP & {open?: number; rot?: number}> = ({x, y, s = 1, open = 0, rot = 0}) => {
	const w = 70 + 130 * open;
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-w / 2} y={-46} width={w} height={92} fill="#efe2c2" stroke="#b39a6a" strokeWidth={1.5} />
		{open > 0.2 && Array.from({length: Math.floor(8 * open)}, (_, i) => <path key={i} d={`M${w / 2 - 14 - i * 16},-34 l0,${50 + 18 * Math.sin(i * 3)}`} stroke="#2a2018" strokeWidth={3} strokeDasharray="7 4" opacity={0.85} />)}
		{open < 0.5 && <path d={`M${-w / 2},-8 L${w / 2},-8 M0,-46 L0,46`} stroke="#8a2a1a" strokeWidth={3} opacity={1 - open * 2} />}
	</g>;
};

/** 1844: Morse's telegraph key on a wooden base; press 0..1 */
export const TelegraphKey: React.FC<PP & {press?: number; spark?: number}> = ({x, y, s = 1, col = C, hi = '#d9b36a', press = 0, spark = 0}) =>
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-90} y={-18} width={180} height={18} rx={3} fill={col} />
		<rect x={-70} y={-34} width={16} height={16} fill={hi} opacity={0.7} />
		<g transform={`rotate(${press * 4} -60 -38)`}><rect x={-64} y={-44} width={140} height={10} rx={4} fill={hi} /><ellipse cx={80} cy={-46} rx={22} ry={11} fill={col} /></g>
		<rect x={58} y={-30} width={10} height={12} fill={hi} opacity={0.8} />
		{spark > 0 && <circle cx={63} cy={-31} r={10 * spark} fill="#bfe8ff" opacity={spark} />}
	</g>;
/** telegraph line on poles across the frame, with an electric pulse at fraction p */
export const PoleLine: React.FC<{cam: number; f?: number; y0: number; h: number; col?: string; period?: number; pulse?: number; W?: number; wires?: number}> = ({cam, f = 1, y0, h, col = C, period = 520, pulse = -1, W = 1920, wires = 2}) => {
	const off = ((cam * f) % period + period) % period, xs = Array.from({length: Math.ceil(W / period) + 3}, (_, i) => -period + i * period - off);
	return <g>
		{xs.map((px, i) => <g key={i}><rect x={px - 5} y={y0 - h} width={10} height={h} fill={col} /><rect x={px - 34} y={y0 - h + 10} width={68} height={7} fill={col} /></g>)}
		{Array.from({length: wires}, (_, w) => <path key={w} d={xs.slice(0, -1).map((px, i) => `${i ? '' : `M${px + (w ? 28 : -28)},${y0 - h + 12}`} Q${px + period / 2 + (w ? 28 : -28)},${y0 - h + 34} ${xs[i + 1] + (w ? 28 : -28)},${y0 - h + 12}`).join(' ')} stroke={col} strokeWidth={2} fill="none" />)}
		{pulse >= 0 && <circle cx={pulse * W} cy={y0 - h + 22} r={9} fill="#cfefff" opacity={0.95} />}
	</g>;
};

/** 1860: Scott's phonautograph — a big parabolic horn, membrane, stylus on a soot-blackened drum turned by a crank */
export const Phonautograph: React.FC<PP & {crank?: number; trace?: number}> = ({x, y, s = 1, col = C, hi = '#e9dcc0', t = 0, crank = 0, trace = 0}) =>
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-230} y={-16} width={460} height={16} fill={col} />
		<rect x={-200} y={-100} width={14} height={86} fill={col} /><rect x={160} y={-100} width={14} height={86} fill={col} />
		<path d="M-260,-250 Q-120,-210 -40,-172 L-40,-128 Q-120,-90 -260,-50 Z" fill={col} />
		<ellipse cx={-258} cy={-150} rx={18} ry={100} fill="#2a2630" />
		{/* drum: soot-black paper with the white trace */}
		<rect x={-30} y={-160} width={200} height={70} rx={10} fill="#141216" stroke={hi} strokeOpacity={0.4} />
		<path d={Array.from({length: 61}, (_, i) => `${i ? 'L' : 'M'}${-26 + i * 3.2},${-125 + (i / 60 < trace ? 10 * Math.sin(i * 0.9 + t * 3) * Math.sin(i * 0.23) : 0)}`).join(' ')} stroke={hi} strokeWidth={1.6} fill="none" opacity={0.9} />
		<line x1={-40} y1={-150} x2={-22} y2={-127} stroke={hi} strokeWidth={2} />
		<g transform={`translate(190,-125) rotate(${crank * 360})`}><rect x={-4} y={-4} width={36} height={8} fill={col} /><circle cx={32} cy={0} r={7} fill={col} /></g>
	</g>;

/** 1876: Bell's liquid transmitter — speak down into the funnel; a needle on the diaphragm dips into acidulated water */
export const LiquidTransmitter: React.FC<PP & {vib?: number}> = ({x, y, s = 1, col = C, hi = '#cfe6ff', t = 0, vib = 0}) =>
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-70} y={-14} width={140} height={14} fill={col} />
		<rect x={44} y={-190} width={14} height={180} fill={col} /><rect x={-26} y={-190} width={84} height={12} fill={col} />
		<path d="M-44,-250 L28,-250 L2,-196 L-18,-196 Z" fill={col} />
		<ellipse cx={-8} cy={-250} rx={36} ry={7} fill="#26222c" />
		<line x1={-8} y1={-196} x2={-8} y2={-58 + vib * 2 * Math.sin(t * 60)} stroke={hi} strokeWidth={2} opacity={0.8} />
		<path d="M-34,-66 L-30,-14 L14,-14 L18,-66" fill="none" stroke={hi} strokeOpacity={0.55} strokeWidth={3} />
		<rect x={-31} y={-48} width={46} height={32} fill={hi} opacity={0.18} />
		{vib > 0 && <circle cx={-8} cy={-56} r={6 + 4 * vib} fill={hi} opacity={0.5 * vib} />}
	</g>;
/** Watson's reed receiver: an electromagnet in a short brass tube with a membrane, held to the ear */
export const ReedReceiver: React.FC<PP & {rot?: number; glow?: number}> = ({x, y, s = 1, col = C, hi = '#e3b45a', rot = 0, glow = 0}) =>
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		{glow > 0 && <circle cx={0} cy={0} r={70} fill="#ffd27a" opacity={0.3 * glow} />}
		<rect x={-26} y={-18} width={52} height={36} rx={5} fill={col} />
		<rect x={-30} y={-22} width={6} height={44} fill={hi} opacity={0.75} />
		<rect x={26} y={-6} width={60} height={12} rx={5} fill={col} />
	</g>;

/** 1901: a Baden-Powell hexagonal "Levitor" kite (Signal Hill) */
export const HexKite: React.FC<PP & {rot?: number}> = ({x, y, s = 1, col = C, rot = 0}) =>
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<path d="M0,-60 L44,-30 L44,30 L0,60 L-44,30 L-44,-30 Z" fill={col} opacity={0.92} />
		<path d="M0,-60 L0,60 M-44,-30 L44,30 M44,-30 L-44,30" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={2} />
	</g>;
/** a sagging wire between two points */
export const Wire: React.FC<{a: [number, number]; b: [number, number]; sag?: number; col?: string; w?: number; op?: number}> = ({a, b, sag = 40, col = C, w = 2, op = 1}) =>
	<path d={`M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2},${(a[1] + b[1]) / 2 + sag} ${b[0]},${b[1]}`} stroke={col} strokeWidth={w} fill="none" opacity={op} />;

/** 1969: Teletype Model 33 on its pedestal (paper roll on top, keyboard in front) */
export const Teletype: React.FC<PP & {paperText?: string; typed?: number}> = ({x, y, s = 1, col = C, hi = '#e8e2d0', paperText = '', t = 0}) =>
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-70} y={-150} width={140} height={150} fill={col} />
		<rect x={-110} y={-250} width={220} height={100} rx={10} fill={col} />
		<path d="M-120,-150 L120,-150 L132,-118 L-108,-118 Z" fill={col} />
		{Array.from({length: 4}, (_, r) => Array.from({length: 11 - r}, (_, i) => <rect key={`${r}_${i}`} x={-98 + i * 18 + r * 9} y={-148 + r * 7.5} width={12} height={5} rx={1.5} fill={hi} opacity={0.22} />))}
		<rect x={-80} y={-300} width={150} height={52} fill={hi} opacity={0.92} />
		<text x={-60} y={-264} fontFamily='"DejaVu Sans Mono", monospace' fontSize={26} fill="#222">{paperText}</text>
		<circle cx={90} cy={-262} r={4} fill="#ffb347" opacity={0.6 + 0.4 * Math.sin(t * 8)} />
	</g>;
/** a computer cabinet bank with a control panel of indicator lamps (SDS Sigma 7 style) */
export const Cabinet: React.FC<PP & {w?: number; h?: number; lamps?: boolean; seed?: number; dead?: number}> = ({x, y, s = 1, col = '#1a1c22', hi = '#ffcf6a', t = 0, w = 260, h = 520, lamps = true, seed = 0, dead = 0}) => {
	const rnd = (i: number) => { const v = Math.sin((i + seed * 31) * 127.1) * 43758.5; return v - Math.floor(v); };
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={0} y={-h} width={w} height={h} fill={col} stroke="#000" strokeWidth={3} />
		<rect x={10} y={-h + 14} width={w - 20} height={150} fill="#0d0e12" />
		{lamps && Array.from({length: 6}, (_, r) => Array.from({length: 10}, (_, c) => { const on = rnd(r * 10 + c + Math.floor(t * (2 + rnd(r + c) * 6))) > 0.45 && dead < 0.5;
			return <circle key={`${r}_${c}`} cx={24 + c * ((w - 48) / 9)} cy={-h + 34 + r * 22} r={5} fill={on ? hi : '#3a2f1a'} opacity={on ? 1 : 0.6} />; }))}
		<rect x={10} y={-h + 180} width={w - 20} height={h - 200} fill="#000" opacity={0.18} />
		<line x1={w / 2} y1={-h + 180} x2={w / 2} y2={-20} stroke="#000" strokeOpacity={0.5} strokeWidth={2} />
	</g>;
};
/** fluorescent ceiling panels seen in perspective; they light the room from above */
export const CeilingLights: React.FC<{W?: number; y?: number; n?: number; on?: number; flick?: number}> = ({W = 1920, y = 0, n = 5, on = 1, flick = 0}) =>
	<g opacity={on * (1 - flick)}>{Array.from({length: n}, (_, i) => { const w = 360 - i * 50, yy = y + 30 + i * 38 - i * i * 3; return <g key={i}><rect x={W / 2 - w / 2 + (i % 2 ? -420 : 420) * (1 - i * 0.15)} y={yy} width={w} height={14 - i * 2} rx={3} fill="#eef6ff" /><ellipse cx={W / 2 + (i % 2 ? -420 : 420) * (1 - i * 0.15)} cy={yy + 40} rx={w * 0.9} ry={60} fill="#dfefff" opacity={0.06} /></g>; })}</g>;

/** 1977: a desk telephone with a coiled cord */
export const DeskPhone: React.FC<PP & {lift?: number}> = ({x, y, s = 1, col = C, hi = '#e8d8b0', lift = 0}) =>
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-70,0 L-56,-56 L56,-56 L70,0 Z" fill={col} />
		<circle cx={0} cy={-30} r={22} fill="none" stroke={hi} strokeOpacity={0.35} strokeWidth={3} />
		{lift < 0.5 && <path d="M-74,-62 Q-74,-82 -54,-82 L54,-82 Q74,-82 74,-62 L64,-60 Q60,-70 50,-70 L-50,-70 Q-60,-70 -64,-60 Z" fill={col} />}
	</g>;
