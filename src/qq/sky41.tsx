import React from 'react';
/* Night sky for the finale (owner note 11: people must stand on ground, under the sky — not in space). */
const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
/** the Milky Way as a tilted band: soft glows, a dark dust lane, and dense small stars concentrated on the band */
export const MilkyWay: React.FC<{W?: number; H?: number; ang?: number; cx?: number; cy?: number; t?: number; op?: number; drift?: number}> = ({W = 1920, H = 1080, ang = -28, cx = 960, cy = 420, t = 0, op = 1, drift = 0}) => {
	const N = 900, tw = (i: number) => 0.55 + 0.45 * Math.sin(t * (1 + rnd(i, 9) * 3) + i);
	return <g opacity={op} transform={`rotate(${ang + drift} ${cx} ${cy})`}>
		<defs>
			<radialGradient id="mwGlow"><stop offset="0" stopColor="#d9d2ff" stopOpacity="0.38" /><stop offset="0.5" stopColor="#8f86c8" stopOpacity="0.14" /><stop offset="1" stopColor="#5a5490" stopOpacity="0" /></radialGradient>
			<radialGradient id="mwCore"><stop offset="0" stopColor="#ffe9c8" stopOpacity="0.45" /><stop offset="1" stopColor="#ffd7a0" stopOpacity="0" /></radialGradient>
			<radialGradient id="mwDust"><stop offset="0" stopColor="#05040c" stopOpacity="0.75" /><stop offset="1" stopColor="#05040c" stopOpacity="0" /></radialGradient>
		</defs>
		{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={cx - 1300 + i * 330} cy={cy + 30 * Math.sin(i * 1.3)} rx={420} ry={150 + 40 * rnd(i, 3)} fill="url(#mwGlow)" />)}
		<ellipse cx={cx + 250} cy={cy + 10} rx={360} ry={130} fill="url(#mwCore)" />
		{Array.from({length: 7}, (_, i) => <ellipse key={i} cx={cx - 900 + i * 320} cy={cy + 8 + 20 * Math.sin(i * 2.1)} rx={260} ry={34 + 14 * rnd(i, 4)} fill="url(#mwDust)" />)}
		{Array.from({length: N}, (_, i) => { const x = cx - 1500 + rnd(i, 1) * 3000, g = (rnd(i, 2) + rnd(i, 3) + rnd(i, 4) - 1.5) * 240, y = cy + g;
			return <circle key={i} cx={x} cy={y} r={0.5 + 1.1 * rnd(i, 5) ** 3} fill="#f4f1ff" opacity={(0.25 + 0.6 * rnd(i, 6)) * tw(i)} />; })}
	</g>;
};
/** sparse stars over the whole sky, bright ones with a cross glint */
export const StarField: React.FC<{W?: number; H?: number; n?: number; maxY?: number; t?: number; op?: number; seed?: number}> = ({W = 1920, H = 1080, n = 260, maxY = 760, t = 0, op = 1, seed = 0}) =>
	<g opacity={op}>{Array.from({length: n}, (_, i) => { const x = rnd(i, 40 + seed) * W, y = rnd(i, 41 + seed) * maxY, b = rnd(i, 42 + seed), tw = 0.6 + 0.4 * Math.sin(t * (0.8 + 2 * rnd(i, 43)) + i);
		return <g key={i}><circle cx={x} cy={y} r={0.6 + 1.6 * b ** 4} fill="#eef0ff" opacity={(0.2 + 0.7 * b) * tw} />
			{b > 0.97 && <path d={`M${x - 9},${y} L${x + 9},${y} M${x},${y - 9} L${x},${y + 9}`} stroke="#eef0ff" strokeWidth={0.8} opacity={0.5 * tw} />}</g>; })}</g>;
/** a hill silhouette whose top is a smooth curve; returns the path and a function giving the ground height at x */
export const hill = (W: number, H: number, peakX: number, peakY: number, spread: number, base: number) => {
	const yAt = (x: number) => base - (base - peakY) * Math.exp(-(((x - peakX) / spread) ** 2));
	let d = `M0,${H} L0,${yAt(0)}`; for (let x = 0; x <= W; x += 24) d += ` L${x},${yAt(x).toFixed(1)}`; d += ` L${W},${H} Z`;
	return {d, yAt};
};
/** a textured moon (maria, soft limb, halo ≤ 0.18); phase: 1 = full, lit = 'left' | 'right' for gibbous; never a blown white disc */
export const Moon: React.FC<{x: number; y: number; r: number; phase?: number; lit?: 'left' | 'right'; halo?: number; id?: string}> = ({x, y, r, phase = 1, lit = 'left', halo = 0.16, id = 'moon'}) => {
	const shadowX = (lit === 'left' ? 1 : -1) * r * 2 * phase;   // a dark disc offset to carve the phase
	return <g>
		<defs>
			<radialGradient id={`${id}H`}><stop offset="0.3" stopColor="#fff3d6" stopOpacity={halo} /><stop offset="1" stopColor="#fff3d6" stopOpacity="0" /></radialGradient>
			<radialGradient id={`${id}F`} cx="0.42" cy="0.4" r="0.65"><stop offset="0" stopColor="#f8f1dc" /><stop offset="0.8" stopColor="#e9dfc4" /><stop offset="1" stopColor="#cfc3a4" /></radialGradient>
			<clipPath id={`${id}C`}><circle cx={x} cy={y} r={r} /></clipPath>
		</defs>
		<circle cx={x} cy={y} r={r * 3.2} fill={`url(#${id}H)`} />
		<circle cx={x} cy={y} r={r} fill={`url(#${id}F)`} />
		<g clipPath={`url(#${id}C)`} fill="#b9ad8e" opacity={0.55}>
			<ellipse cx={x - r * 0.28} cy={y - r * 0.22} rx={r * 0.34} ry={r * 0.26} /><ellipse cx={x + r * 0.18} cy={y - r * 0.32} rx={r * 0.22} ry={r * 0.18} />
			<ellipse cx={x + r * 0.05} cy={y + r * 0.12} rx={r * 0.26} ry={r * 0.2} /><ellipse cx={x - r * 0.45} cy={y + r * 0.3} rx={r * 0.2} ry={r * 0.24} />
			<ellipse cx={x + r * 0.42} cy={y + r * 0.05} rx={r * 0.12} ry={r * 0.16} /><circle cx={x + r * 0.1} cy={y + r * 0.62} r={r * 0.07} fill="#efe6cf" />
		</g>
		{phase < 0.999 && <g clipPath={`url(#${id}C)`}><circle cx={x + shadowX} cy={y} r={r * 1.05} fill="#0a0d1e" opacity={0.92} /></g>}
	</g>;
};
