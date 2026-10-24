import React from 'react';
/* Camera and transition helpers for ep41 v3 (owner note 12: "different transitions besides people walking, be creative with 运镜, 转场"). */
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (u: number) => { const x = clamp(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
export const easeIn = (u: number) => Math.pow(clamp(u), 3);
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
/** camera: zoom about the screen point (fx, fy) — that point stays put; then pan (px, py) and roll (deg) */
export const Cam: React.FC<{zoom?: number; fx?: number; fy?: number; px?: number; py?: number; roll?: number; W?: number; H?: number; children: React.ReactNode}> = ({zoom = 1, fx = 960, fy = 540, px = 0, py = 0, roll = 0, W = 1920, H = 1080, children}) =>
	<g transform={`translate(${W / 2 + px},${H / 2 + py}) rotate(${roll}) translate(${-W / 2},${-H / 2}) translate(${fx},${fy}) scale(${zoom}) translate(${-fx},${-fy})`}>{children}</g>;
/** a gentle hand-held drift so no frame is ever static */
export const drift = (t: number, amt = 1) => ({px: amt * (6 * Math.sin(t * 0.37) + 3 * Math.sin(t * 0.91 + 1)), py: amt * (4 * Math.sin(t * 0.29 + 2) + 2 * Math.sin(t * 1.13)), roll: amt * 0.25 * Math.sin(t * 0.21)});
/** circular iris: shows children inside a circle at (x,y) of radius r */
export const Iris: React.FC<{id: string; x: number; y: number; r: number; children: React.ReactNode}> = ({id, x, y, r, children}) => <g>
	<defs><clipPath id={id}><circle cx={x} cy={y} r={Math.max(0.01, r)} /></clipPath></defs><g clipPath={`url(#${id})`}>{children}</g></g>;
/** wipe: shows children on one side of a moving line (angle deg); pos 0..1 across the frame */
export const Wipe: React.FC<{id: string; pos: number; angle?: number; W?: number; H?: number; feather?: number; children: React.ReactNode}> = ({id, pos, angle = 0, W = 1920, H = 1080, children}) => {
	const d = Math.hypot(W, H), x = -d / 2 + pos * d * 1.0;
	return <g><defs><clipPath id={id}><rect x={-d} y={-d} width={d + x} height={3 * d} transform={`translate(${W / 2},${H / 2}) rotate(${angle})`} /></clipPath></defs><g clipPath={`url(#${id})`}>{children}</g></g>;
};
/** horizontal motion blur for whip pans; amount in px */
export const Whip: React.FC<{id: string; amt: number; children: React.ReactNode}> = ({id, amt, children}) => amt < 0.5 ? <>{children}</> : <g>
	<defs><filter id={id} x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation={`${amt} 0`} /></filter></defs><g filter={`url(#${id})`}>{children}</g></g>;
/** flash of light (white or warm) */
export const Flash: React.FC<{k: number; col?: string; W?: number; H?: number}> = ({k, col = '#fff6e0', W = 1920, H = 1080}) => k <= 0.001 ? null : <rect width={W} height={H} fill={col} opacity={clamp(k)} />;
/** letterbox bars (2.39:1 inside 16:9) for the film's big moments */
export const Letterbox: React.FC<{k: number; W?: number; H?: number}> = ({k, W = 1920, H = 1080}) => { const b = ((H - W / 2.39) / 2) * clamp(k); return k <= 0 ? null : <g><rect width={W} height={b} fill="#000" /><rect y={H - b} width={W} height={b} fill="#000" /></g>; };
/** film grain + vignette for every frame */
export const Grain: React.FC<{f: number; W?: number; H?: number; vig?: number; grain?: number}> = ({f, W = 1920, H = 1080, vig = 0.55, grain = 0.06}) => <g pointerEvents="none">
	<defs>
		<radialGradient id="fxVig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity={vig} /></radialGradient>
		<filter id="fxGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 97} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45" /></filter>
	</defs>
	<rect width={W} height={H} fill="url(#fxVig)" />
	{grain > 0 && <rect width={W} height={H} filter="url(#fxGrain)" opacity={grain} style={{mixBlendMode: 'overlay'}} />}
</g>;

/** inside the wire (owner note 6): a copper conductor seen from inside — rings rush past, the voice travels as light.
    u: 0..1 through the tunnel. Draw on black; the caller irises in from the wire's cut end and out through the earpiece. */
export const WireTunnel: React.FC<{u: number; t: number; W?: number; H?: number; wave?: number}> = ({u, t, W = 1920, H = 1080, wave = 1}) => {
	const cx = W / 2 + 40 * Math.sin(u * 5), cy = H / 2 + 26 * Math.sin(u * 3.7 + 1), rings = 26, speed = u * 22;
	return <g>
		<defs>
			<radialGradient id="wtCore" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff2cf" stopOpacity="0.95" /><stop offset="0.25" stopColor="#ffb35a" stopOpacity="0.45" /><stop offset="1" stopColor="#ff7a1a" stopOpacity="0" /></radialGradient>
			<radialGradient id="wtWall" cx="0.5" cy="0.5" r="0.5"><stop offset="0.0" stopColor="#120804" /><stop offset="0.6" stopColor="#3b1a08" /><stop offset="1" stopColor="#8a4a1c" /></radialGradient>
		</defs>
		<rect width={W} height={H} fill="url(#wtWall)" />
		{Array.from({length: rings}, (_, i) => { const z = ((i - speed) % rings + rings) % rings / rings, d = 0.06 + z * z * 1.7, r = 70 + d * W * 0.6, op = clamp(z * 1.6) * clamp((1 - z) * 6);
			const x = W / 2 + (cx - W / 2) * (1 - z), y = H / 2 + (cy - H / 2) * (1 - z);
			return <g key={i} opacity={op}><ellipse cx={x} cy={y} rx={r} ry={r * 0.96} fill="none" stroke={i % 3 ? '#c9773a' : '#f0a860'} strokeWidth={2 + d * 16} /><ellipse cx={x} cy={y} rx={r * 1.04} ry={r} fill="none" stroke="#2a1206" strokeWidth={1 + d * 6} opacity={0.6} /></g>; })}
		{/* strands of the stranded conductor, spiralling */}
		{Array.from({length: 7}, (_, k) => { const a = k / 7 * Math.PI * 2 + u * 9; return <path key={k} d={`M${W / 2 + Math.cos(a) * 1300},${H / 2 + Math.sin(a) * 1300} Q${W / 2 + Math.cos(a + 0.9) * 500},${H / 2 + Math.sin(a + 0.9) * 500} ${cx + Math.cos(a + 1.6) * 30},${cy + Math.sin(a + 1.6) * 30}`} stroke="#d88a44" strokeOpacity={0.35} strokeWidth={10} fill="none" />; })}
		<circle cx={cx} cy={cy} r={260} fill="url(#wtCore)" />
		{/* the voice: a waveform of light racing toward us */}
		{wave > 0 && Array.from({length: 5}, (_, k) => { const z = ((u * 3 + k / 5) % 1), r = 40 + z * z * 1100, n = 90;
			const d = Array.from({length: n + 1}, (_, i) => { const a = (i / n) * Math.PI * 2, rr = r * (1 + 0.08 * Math.sin(a * 9 + t * 14 + k) * Math.sin(a * 3 + k)); return `${i ? 'L' : 'M'}${(cx + (W / 2 - cx) * z + Math.cos(a) * rr).toFixed(1)},${(cy + (H / 2 - cy) * z + Math.sin(a) * rr).toFixed(1)}`; }).join(' ') + 'Z';
			return <path key={k} d={d} fill="none" stroke="#fff4d6" strokeWidth={2 + z * 7} opacity={wave * clamp(z * 3) * clamp((1 - z) * 4)} />; })}
	</g>;
};
