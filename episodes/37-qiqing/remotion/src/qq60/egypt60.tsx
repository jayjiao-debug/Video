/* ep60 · Egyptian-styled brand pieces (owner 15:10: "Give the elements characters, J an egyptian look").
   JCartouche: the J as a pharaoh's crook (heqa, banded gold and lapis) inside a royal cartouche, a red sun disk on top. */
import React from 'react';
import {FC} from './frame60';

/** the J seal as a crook in a cartouche; (x, y) = centre, h = height in px */
export const JCartouche: React.FC<{x: number; y: number; h?: number; o?: number; glow?: number}> = ({x, y, h = 170, o = 1, glow = 0.5}) => {
	const J = 'M10 -50L10 26Q10 50 -12 50Q-32 50 -32 30';
	return <svg width={h} height={h} viewBox="-100 -100 200 200" style={{position: 'absolute', left: x - h / 2, top: y - h / 2, opacity: o, overflow: 'visible'}}>
		<defs>
			<linearGradient id="jc-lapis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24357A" /><stop offset="1" stopColor="#111A44" /></linearGradient>
			<radialGradient id="jc-glow"><stop offset="0" stopColor="#FFD98A" stopOpacity={0.55} /><stop offset="1" stopColor="#FFD98A" stopOpacity={0} /></radialGradient>
		</defs>
		{glow > 0 && <ellipse cx={0} cy={0} rx={96} ry={108} fill="url(#jc-glow)" opacity={glow} />}
		{/* the sun disk above the cartouche */}
		<circle cx={0} cy={-86} r={11} fill="#D8402A" stroke={FC.gold} strokeWidth={3.5} />
		{/* the cartouche: a stadium ring of gold rope, lapis inside, and the tie bar at the foot */}
		<rect x={-44} y={-72} width={88} height={140} rx={44} fill="#2A1912" />
		<rect x={-40} y={-68} width={80} height={132} rx={40} fill="url(#jc-lapis)" stroke={FC.gold} strokeWidth={6} />
		<rect x={-33} y={-61} width={66} height={118} rx={33} fill="none" stroke={FC.gold} strokeWidth={1.4} strokeDasharray="3 3" opacity={0.85} />
		<rect x={-50} y={68} width={100} height={12} rx={3} fill={FC.gold} stroke="#2A1912" strokeWidth={2.4} />
		{/* the J = a crook, banded gold / lapis like Osiris's */}
		<g transform={`scale(${0.95})`}>
			<path d={J} fill="none" stroke="#2A1912" strokeWidth={20} strokeLinecap="round" />
			<path d={J} fill="none" stroke={FC.gold} strokeWidth={15} strokeLinecap="round" />
			<path d={J} fill="none" stroke="#2C46A8" strokeWidth={15} strokeDasharray="7 9" strokeDashoffset={-4} />
			<rect x={-2} y={-58} width={24} height={10} rx={2} fill={FC.gold} stroke="#2A1912" strokeWidth={2.4} />
		</g>
	</svg>;
};

/** a small ankh (gold, ink outline); (x, y) = centre, h = height */
export const Ankh: React.FC<{h?: number; c?: string}> = ({h = 44, c = FC.gold}) => <svg width={h * 0.62} height={h} viewBox="-31 -50 62 100" style={{display: 'block', overflow: 'visible'}}>
	{[['#2A1912', 15], [c, 9]].map(([col, w]) => <g key={String(col)} fill="none" stroke={String(col)} strokeWidth={Number(w)} strokeLinecap="round">
		<ellipse cx={0} cy={-26} rx={14} ry={19} /><path d="M-26 0L26 0M0 -6L0 46" /></g>)}
</svg>;
/** the striped khekher band (blue / red / green between gold rules), vertical or horizontal */
const stripes = (dir: 'v' | 'h', step = 9) => `repeating-linear-gradient(${dir === 'v' ? 90 : 180}deg, #2C46A8 0 ${step}px, #C23A22 ${step}px ${2 * step}px, #2F8A5A ${2 * step}px ${3 * step}px)`;

/** the film title inside a horizontal royal cartouche: lapis faience, a double gold rope, the tie bar at the right end; engraved gold letters */
export const TitleCartouche: React.FC<{title: string; size?: number; o?: number; reveal?: number}> = ({title, size = 96, o = 1, reveal = 1}) => {
	const h = size * 1.62, w = title.length * size * 1.13 + size * 1.5;
	return <div style={{position: 'relative', width: w + 26, height: h, opacity: o}}>
		<svg width={w + 26} height={h} viewBox={`0 0 ${w + 26} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
			<defs><linearGradient id="tc-lapis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#263A86" /><stop offset="1" stopColor="#101943" /></linearGradient></defs>
			<rect x={3} y={3} width={w - 6} height={h - 6} rx={(h - 6) / 2} fill="#2A1912" transform="translate(0,5)" opacity={0.55} />
			<rect x={6} y={6} width={w - 12} height={h - 12} rx={(h - 12) / 2} fill="url(#tc-lapis)" stroke={FC.gold} strokeWidth={7} />
			<rect x={17} y={17} width={w - 34} height={h - 34} rx={(h - 34) / 2} fill="none" stroke={FC.gold} strokeWidth={1.8} strokeDasharray="4 4" opacity={0.9} />
			<rect x={4} y={4} width={w - 8} height={h - 8} rx={(h - 8) / 2} fill="none" stroke="#2A1912" strokeWidth={2.2} />
			{/* the knot: the tie bar across the right end */}
			<rect x={w - 4} y={h * 0.06} width={20} height={h * 0.88} rx={3} fill={FC.gold} stroke="#2A1912" strokeWidth={2.6} />
			<rect x={w + 1} y={h * 0.06 + 6} width={10} height={h * 0.88 - 12} fill="none" stroke="#9C7426" strokeWidth={1.5} />
		</svg>
		<div style={{position: 'absolute', left: 0, width: w, top: 0, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center',
			clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`}}>
			<div style={{fontFamily: "'Noto Serif CJK SC','Noto Serif CJK',serif", fontWeight: 900, fontSize: size, letterSpacing: '0.13em', marginRight: '-0.13em', whiteSpace: 'nowrap', lineHeight: 1,
				background: 'linear-gradient(180deg, #FFF3C4 0%, #F6D27A 38%, #C8902E 56%, #F3CF73 78%, #FFE7A6 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
				filter: 'drop-shadow(0 3px 0 #4A2E0A) drop-shadow(0 0 14px rgba(255,205,110,0.35))'}}>{title}</div>
		</div>
	</div>;
};

/** the follow line as a painted plaque: lapis between gold rules, khekher stripes at both ends, an ankh each side */
export const FollowPlaque: React.FC<{text: string; size?: number; o?: number}> = ({text, size = 40, o = 1}) =>
	<div style={{display: 'flex', alignItems: 'stretch', opacity: o, boxShadow: `0 0 0 2.5px ${FC.gold}, 0 0 0 5px #2A1912, 0 8px 18px rgba(5,8,25,0.55)`, borderRadius: 4}}>
		<div style={{width: 26, background: stripes('v', 9 / 3 * 3), borderRight: `3px solid ${FC.gold}`}} />
		<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '10px 26px', background: 'linear-gradient(180deg, #22347A, #141E50)'}}>
			<Ankh h={size * 1.15} />
			<div style={{fontFamily: "'Noto Serif CJK SC','Noto Serif CJK',serif", fontWeight: 900, fontSize: size, color: FC.cream, letterSpacing: '0.08em', whiteSpace: 'nowrap', lineHeight: 1.2}}>{text}</div>
			<Ankh h={size * 1.15} />
		</div>
		<div style={{width: 26, background: stripes('v', 9), borderLeft: `3px solid ${FC.gold}`}} />
	</div>;
