/* ep60 · THE heart, shared by every shot.
   History: owner 17:07 asked for "a more accurate heart" and v3 drew a stylised anatomical heart; at 17:59 he said "lets stick to the
   old heart". So this draws the OLD heart again — the jar-shaped heart of the papyri (the hieroglyph ib, as on the kit's balance):
   red body with an ink outline, two little handles at the neck, a gold band, a soft highlight — with the same props as before, so every
   shot that uses <Heart60/> reverted without code changes. The optional face (talking heart, shot 36) sits on the jar.
   <Heart60 x y h /> is an SVG <g>: (x, y) = the centre of the heart, h = total height in px. */
import React from 'react';
import {heartD} from './props60';
import {PAL} from './geo60';

const INK = '#2A1912';
export type HeartFace = {eyes?: number; mouth?: number; look?: number; brow?: number; smile?: number};
export const Heart60: React.FC<{x: number; y: number; h: number; rot?: number; beat?: number; gold?: boolean; glow?: number; face?: HeartFace; id?: string; o?: number}> =
	({x, y, h, rot = 0, beat = 0, gold = true, glow = 0, face, id = 'h60', o = 1}) => {
	// heartD spans y = -1.78 (handles) .. 0 (base), x = ±0.78; centre it and scale to h
	const k = (h / 1.78) * (1 + 0.07 * beat), ow = 0.032;   // line widths in the heart's own units, so they scale with it
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k}) translate(0,0.89)`} opacity={o}>
		<defs>
			<radialGradient id={`${id}-b`} cx="0.36" cy="0.3" r="0.85"><stop offset="0" stopColor="#E0583C" /><stop offset="0.55" stopColor={PAL.red} /><stop offset="1" stopColor={PAL.red2} /></radialGradient>
			<radialGradient id={`${id}-g`}><stop offset="0" stopColor="#FF6A3A" stopOpacity={0.75} /><stop offset="1" stopColor="#FF6A3A" stopOpacity={0} /></radialGradient>
		</defs>
		{glow > 0 && <ellipse cx={0} cy={-0.85} rx={1.45} ry={1.5} fill={`url(#${id}-g)`} opacity={glow} />}
		<path d={heartD} fill={INK} stroke={INK} strokeWidth={2 * ow} strokeLinejoin="round" />
		<path d={heartD} fill={`url(#${id}-b)`} />
		{gold && <path d="M-0.38 -1.42Q0 -1.32 0.38 -1.42" fill="none" stroke={PAL.gold} strokeWidth={ow * 2.6} strokeLinecap="round" />}
		<path d="M-0.5 -0.45Q0 -0.3 0.5 -0.45" fill="none" stroke={PAL.red2} strokeWidth={ow * 1.8} strokeLinecap="round" />
		<path d="M-0.55 -1.1Q-0.6 -0.7 -0.4 -0.35" fill="none" stroke="#F08A70" strokeWidth={ow * 2} strokeLinecap="round" opacity={0.85} />
		{face && <HeartFaceG f={face} ow={ow} />}
	</g>;
};
/** eyes and mouth on the jar heart (talking heart) */
const HeartFaceG: React.FC<{f: HeartFace; ow: number}> = ({f, ow}) => {
	const eyes = f.eyes ?? 1, mouth = f.mouth ?? 0, look = f.look ?? 0, brow = f.brow ?? 0, smile = f.smile ?? 0;
	return <g>
		{[-0.26, 0.26].map((ex, i) => <g key={i}>
			<ellipse cx={ex} cy={-0.98} rx={0.13} ry={0.16 * Math.max(0.08, eyes)} fill="#FFF7EC" stroke={INK} strokeWidth={ow * 1.4} />
			{eyes > 0.25 && <circle cx={ex + 0.045 * look} cy={-0.96} r={0.065} fill={INK} />}
			<path d={`M${ex - 0.14} ${-1.2 - 0.07 * brow}Q${ex} ${-1.27 - 0.09 * brow} ${ex + 0.14} ${-1.2 - 0.07 * brow}`} fill="none" stroke={INK} strokeWidth={ow * 1.8} strokeLinecap="round" />
		</g>)}
		{mouth > 0.05
			? <ellipse cx={0} cy={-0.62} rx={0.12 + 0.04 * mouth} ry={0.035 + 0.15 * mouth} fill="#4A0E12" stroke={INK} strokeWidth={ow * 1.4} />
			: <path d={`M-0.16 ${-0.66 - 0.05 * smile}Q0 ${-0.58 + 0.1 * smile} 0.16 ${-0.66 - 0.05 * smile}`} fill="none" stroke={INK} strokeWidth={ow * 1.8} strokeLinecap="round" />}
	</g>;
};
