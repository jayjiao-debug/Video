/* ep60 · THE heart (owner 17:07: "This doesnt look like a heart, make it resemble more of an accurate heart").
   One shared, recognisable heart for every shot: a stylised anatomical heart (body with the apex low right, the aortic arch with its
   three branches, the pulmonary trunk, the blue vena cava, the coronary groove), flat-vector with an ink outline and an optional gold
   rim and glow. No gore: clean, glossy, a little jewel-like. Optional face for the talking heart (shot 36).
   <Heart60 x y h /> is an SVG <g>: (x, y) = the centre of the heart's body, h = total height in px (vessels included). */
import React from 'react';

const INK = '#2A1912';
export type HeartFace = {eyes?: number; mouth?: number; look?: number; brow?: number; smile?: number};
export const Heart60: React.FC<{x: number; y: number; h: number; rot?: number; beat?: number; gold?: boolean; glow?: number; face?: HeartFace; id?: string; o?: number}> =
	({x, y, h, rot = 0, beat = 0, gold = true, glow = 0, face, id = 'h60', o = 1}) => {
	const k = (h / 150) * (1 + 0.07 * beat), ow = 2.6;
	const body = 'M2 -28C-26 -40 -52 -18 -48 10C-44 36 -16 56 20 72C34 52 52 30 52 2C52 -24 30 -36 2 -28Z';
	const lobe = 'M-30 -22C-44 -10 -44 14 -32 30C-26 12 -22 -6 -12 -24Z';
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} opacity={o}>
		<defs>
			<radialGradient id={`${id}-b`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#F06A5C" /><stop offset="0.45" stopColor="#C8312C" /><stop offset="1" stopColor="#7E1A1E" /></radialGradient>
			<linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B82E2E" /><stop offset="0.5" stopColor="#E25A4C" /><stop offset="1" stopColor="#A92828" /></linearGradient>
			<radialGradient id={`${id}-g`}><stop offset="0" stopColor="#FF6A3A" stopOpacity={0.75} /><stop offset="1" stopColor="#FF6A3A" stopOpacity={0} /></radialGradient>
		</defs>
		{glow > 0 && <ellipse cx={0} cy={6} rx={110} ry={115} fill={`url(#${id}-g)`} opacity={glow} />}
		{/* behind the body: the blue vena cava (viewer's left) and the pulmonary trunk */}
		<path d="M-30 -24L-32 -62" stroke={INK} strokeWidth={17 + ow} strokeLinecap="round" fill="none" />
		<path d="M-30 -24L-32 -62" stroke="#4E62B0" strokeWidth={17} strokeLinecap="round" fill="none" />
		<path d="M-33 -60L-31 -40" stroke="#7C90D6" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.8} />
		{/* the aortic arch and its three branches */}
		{[[-6, -58, -10, -78], [4, -62, 4, -82], [14, -60, 18, -78]].map(([a, b, c, d], i) => <g key={i}>
			<path d={`M${a} ${b}L${c} ${d}`} stroke={INK} strokeWidth={8 + ow} strokeLinecap="round" />
			<path d={`M${a} ${b}L${c} ${d}`} stroke="#C8392F" strokeWidth={8} strokeLinecap="round" /></g>)}
		<path d="M-4 -26C-6 -52 -2 -64 14 -66C32 -68 40 -54 36 -36" fill="none" stroke={INK} strokeWidth={20 + ow} strokeLinecap="round" />
		<path d="M-4 -26C-6 -52 -2 -64 14 -66C32 -68 40 -54 36 -36" fill="none" stroke={`url(#${id}-a)`} strokeWidth={20} strokeLinecap="round" />
		<path d="M0 -44C0 -56 6 -61 15 -62" fill="none" stroke="#F59080" strokeWidth={4} strokeLinecap="round" opacity={0.75} />
		<path d="M14 -24C20 -36 28 -42 38 -44" fill="none" stroke={INK} strokeWidth={15 + ow} strokeLinecap="round" />
		<path d="M14 -24C20 -36 28 -42 38 -44" fill="none" stroke="#9E3354" strokeWidth={15} strokeLinecap="round" />
		{/* the body */}
		<path d={body} fill={`url(#${id}-b)`} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
		<path d={lobe} fill="#F28474" opacity={0.45} />
		{/* the coronary groove and a few vessels */}
		<path d="M12 -26C6 -4 8 30 18 66" fill="none" stroke="#7A161C" strokeWidth={4.5} strokeLinecap="round" />
		<path d="M12 -26C6 -4 8 30 18 66" fill="none" stroke="#E8B04A" strokeWidth={1.8} strokeLinecap="round" opacity={gold ? 0.9 : 0} />
		{[[9, 0, -10, 14], [9, 20, 28, 34], [8, -12, 30, -6]].map(([a, b, c, d], i) => <path key={i} d={`M${a} ${b}Q${(a + c) / 2} ${(b + d) / 2 - 6} ${c} ${d}`} fill="none" stroke="#7A161C" strokeWidth={2.6} strokeLinecap="round" />)}
		<ellipse cx={-22} cy={-12} rx={9} ry={5} fill="#FFE2D6" opacity={0.55} transform="rotate(-30 -22 -12)" />
		{gold && <path d={body} fill="none" stroke="#E8B04A" strokeWidth={1.4} transform="scale(0.93) translate(1,1)" opacity={0.85} />}
		{face && <HeartFaceG f={face} />}
	</g>;
};
/** eyes and mouth on the heart's body (talking heart) */
const HeartFaceG: React.FC<{f: HeartFace}> = ({f}) => {
	const eyes = f.eyes ?? 1, mouth = f.mouth ?? 0, look = f.look ?? 0, brow = f.brow ?? 0, smile = f.smile ?? 0;
	return <g>
		{[-16, 12].map((ex, i) => <g key={i}>
			<ellipse cx={ex} cy={6} rx={7.5} ry={9 * Math.max(0.08, eyes)} fill="#FFF7EC" stroke={INK} strokeWidth={1.8} />
			{eyes > 0.25 && <circle cx={ex + 2.4 * look} cy={7} r={3.8} fill={INK} />}
			<path d={`M${ex - 8} ${-6 - 4 * brow + (i ? -2 * brow : 0)}Q${ex} ${-10 - 5 * brow} ${ex + 8} ${-6 - 4 * brow}`} fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
		</g>)}
		{mouth > 0.05
			? <ellipse cx={-2} cy={30} rx={7 + 2 * mouth} ry={2 + 9 * mouth} fill="#4A0E12" stroke={INK} strokeWidth={1.8} />
			: <path d={`M-10 ${28 - 3 * smile}Q-2 ${32 + 6 * smile} 7 ${28 - 3 * smile}`} fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />}
	</g>;
};
