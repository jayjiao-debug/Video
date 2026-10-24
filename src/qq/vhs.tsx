import React from 'react';
/* VHS rewind signals (owner note 3): ◀◀ REW in on-screen-display type, a year counter spinning backwards,
   tracking-noise bands, scanlines, a head-switching strip at the bottom, horizontal tearing. All seeded by frame. */
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const OSD = '"DejaVu Sans Mono", "Noto Sans Mono CJK SC", monospace';
/** horizontal displacement for row y at frame f (apply to the picture as a skew/offset) */
export const vhsJitter = (f: number, amt = 1) => (rnd(f * 3.1) - 0.5) * 14 * amt;
export const VhsOverlay: React.FC<{f: number; W: number; H: number; amt?: number; label?: string; year?: string; showOsd?: boolean}> = ({f, W, H, amt = 1, label = '◀◀ REW', year, showOsd = true}) => {
	const bands = [0, 1].map((k) => ({y: ((f * (k ? 37 : 23) + k * 400 + rnd(Math.floor(f / 6) + k) * 300) % (H + 200)) - 100, h: 26 + 40 * rnd(f + k * 9)}));
	return <g style={{mixBlendMode: 'normal'}}>
		<defs><pattern id="vhsScan" width={4} height={4} patternUnits="userSpaceOnUse"><rect width={4} height={2} fill="#000" opacity={0.22} /></pattern>
			<linearGradient id="vhsVig" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.35" /><stop offset="0.2" stopColor="#000" stopOpacity="0" /><stop offset="0.8" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.4" /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#vhsScan)" opacity={amt} />
		<rect width={W} height={H} fill="url(#vhsVig)" opacity={amt} />
		{bands.map((b, k) => <g key={k} opacity={0.85 * amt}>
			{Array.from({length: 18}, (_, i) => { const y = b.y + (i / 18) * b.h, x = rnd(f * 7 + i * 13 + k) * W * 0.8; return <rect key={i} x={x} y={y} width={60 + rnd(i + f) * W * 0.4} height={1.5 + rnd(i * 3 + f) * 2.5} fill={i % 5 === 0 ? '#9ff' : i % 7 === 0 ? '#f8a' : '#fff'} opacity={0.35 + 0.6 * rnd(i * 5 + f * 2)} />; })}
			<rect x={0} y={b.y} width={W} height={b.h} fill="#fff" opacity={0.06} />
		</g>)}
		{/* head-switching noise at the bottom */}
		<g opacity={0.9 * amt}>{Array.from({length: 7}, (_, i) => <rect key={i} x={rnd(f + i) * 60 - 30} y={H - 22 + i * 3} width={W} height={2} fill="#ddd" opacity={0.15 + 0.4 * rnd(f * 2 + i)} />)}</g>
		{showOsd && <g fontFamily={OSD} fontWeight={700} fill="#f2f2f2" style={{filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.6))'}} opacity={amt}>
			<text x={90} y={110} fontSize={58} letterSpacing={4}>{label}</text>
			{year && <text x={W - 90} y={H - 90} fontSize={64} textAnchor="end" letterSpacing={3}>{year}</text>}
		</g>}
	</g>;
};
/** year shown while rewinding from y0 to y1 over u∈[0,1] (eases so it slows near the target); BC years are negative */
export const yearAt = (y0: number, y1: number, u: number) => { const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), 2.2); const y = Math.round(y0 + (y1 - y0) * e); return y < 0 ? `公元前 ${-y}` : `${y}`; };
