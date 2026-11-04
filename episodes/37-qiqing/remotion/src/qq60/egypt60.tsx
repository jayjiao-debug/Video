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
