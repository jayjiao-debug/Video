import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';

/* ep31 《薄肌说明书》 covers — the film's own hero (the ridgeline body scan, abs visible at low body fat) on the
   film's navy blueprint, with a 2-line hook in gold serif. Wide 1440×1080, tall 1080×1440 (lower 18% kept clear). */
const C = {bg: '#081127', bg2: '#0c1834', cy: '#6ee7ef', gold: '#f5c76b', ink: '#eef6ff', dim: 'rgba(220,235,255,0.62)'};
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const g = (x: number, y: number, cx: number, cy: number, sx: number, sy: number, a: number) => a * Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));
const halfW = (y: number) => (y > 0.95 ? 0.32 : y > 0.8 ? mix(1.04, 0.32, (y - 0.8) / 0.15) : y > 0.25 ? mix(0.93, 1.04, (y - 0.25) / 0.55) : mix(0.64, 0.93, (y + 1.25) / 1.5));
const torsoZ = (x: number, y: number, m: number, f: number) => {
	const hw = halfW(y) * (1 + 0.12 * f), u = x / hw;
	if (Math.abs(u) >= 1 || y > 1.12 || y < -1.25) return 0;
	const base = Math.sqrt(1 - u * u) * 0.42;
	let D = 0;
	for (const s of [-1, 1]) {
		D += g(x, y, s * 0.42, 0.42, 0.34, 0.19, 0.17); D += g(x, y, s * 0.96, 0.72, 0.17, 0.17, 0.12); D -= g(x, y, s * 0.42, 0.83, 0.3, 0.035, 0.04);
		D += g(x, y, s * 0.64, -0.22, 0.09, 0.32, 0.05);
		for (const ay of [0.02, -0.3, -0.6]) D += g(x, y, s * 0.15, ay, 0.105, 0.115, 0.075);
		D += g(x, y, s * 0.14, -0.88, 0.1, 0.12, 0.04);
	}
	D -= g(x, y, 0, -0.38, 0.028, 0.75, 0.05);
	const F = g(x, y, 0, -0.55, 0.78, 0.55, 0.2) + 0.04;
	return 0.75 * base + 2.8 * m * (1 - 0.9 * f) * D + f * F;
};
const Torso: React.FC<{cx: number; cy: number; s: number; m: number; f: number; t: number; tint?: string; o?: number}> = ({cx, cy, s, m, f, t, tint = C.cy, o = 1}) => {
	const rows = 54, cols = 150, y0 = 1.02, y1 = -1.25, amp = 0.42 * s, H2 = s * 2.4;
	const out: React.ReactNode[] = [];
	for (let r = 0; r < rows; r++) {
		const y = mix(y0, y1, r / (rows - 1)), py = cy - H2 / 2 + (r / (rows - 1)) * H2, hw = halfW(y) * (1 + 0.12 * f);
		let d = ''; let lx = 0, rx = 0;
		for (let c = 0; c <= cols; c++) {
			const x = mix(-hw, hw, c / cols), z = torsoZ(x * 0.999, y, m, f), X = cx + x * s, Y = py - z * amp;
			d += `${c ? 'L' : 'M'}${X.toFixed(1)},${Y.toFixed(1)}`; if (!c) lx = X; if (c === cols) rx = X;
		}
		const fill = d + `L${rx.toFixed(1)},${(py + 30).toFixed(1)}L${lx.toFixed(1)},${(py + 30).toFixed(1)}Z`;
		const scan = Math.exp(-Math.pow((r / rows - ((t * 0.32) % 1.4 - 0.2)) / 0.06, 2)), edge = 0.5 + 0.5 * Math.sin(Math.PI * r / (rows - 1));
		out.push(<g key={r}><path d={fill} fill={C.bg} /><path d={d} fill="none" stroke={tint} strokeWidth={7} opacity={(0.06 + 0.22 * scan) * edge} strokeLinecap="round" /><path d={d} fill="none" stroke={tint} strokeWidth={1.9} opacity={(0.5 + 0.5 * scan) * (0.55 + 0.45 * edge)} strokeLinecap="round" /></g>);
	}
	return <g opacity={o}>{out}</g>;
};

const Cover: React.FC<{layout: 'wide' | 'tall'}> = ({layout}) => {
	const wide = layout === 'wide', W = wide ? 1440 : 1080, H = wide ? 1080 : 1440;
	const tx = wide ? 470 : W / 2, ty = wide ? 470 : 860;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at ${wide ? '68% 45%' : '50% 30%'}, #12244a 0%, ${C.bg} 55%, #040915 100%)`}}>
			<svg width={W} height={H}>
				<defs><filter id="glow"><feGaussianBlur stdDeviation="18" /></filter></defs>
				{Array.from({length: 40}, (_, i) => <line key={'v' + i} x1={i * 48} y1={0} x2={i * 48} y2={H} stroke="rgba(120,170,255,0.05)" />)}
				{Array.from({length: 40}, (_, i) => <line key={'h' + i} x1={0} y1={i * 48} x2={W} y2={i * 48} stroke="rgba(120,170,255,0.05)" />)}
				<ellipse cx={wide ? 1010 : W / 2} cy={wide ? 540 : 350} rx={300} ry={360} fill="rgba(110,231,239,0.10)" filter="url(#glow)" />
				<Torso cx={wide ? 1010 : W / 2} cy={wide ? 560 : 360} s={wide ? 300 : 230} m={1} f={0.1} t={1.9} />
			</svg>
			<div style={{position: 'absolute', left: wide ? 90 : 0, right: wide ? 'auto' : 0, top: wide ? 300 : 650, textAlign: wide ? 'left' : 'center', whiteSpace: 'nowrap'}}>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: wide ? 34 : 34, color: C.dim, letterSpacing: '0.3em', marginBottom: 26}}>VIBE知识大赏</div>
				<div style={{fontFamily: SERIF, fontWeight: 900, fontSize: wide ? 112 : 108, lineHeight: 1.16, color: C.ink, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>孙宇晨的</div>
				<div style={{fontFamily: SERIF, fontWeight: 900, fontSize: wide ? 112 : 108, lineHeight: 1.16, color: C.ink, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>薄肌方案</div>
				<div style={{fontFamily: SERIF, fontWeight: 900, fontSize: wide ? 112 : 108, lineHeight: 1.16, background: 'linear-gradient(180deg, #ffe39b 0%, #f5c76b 45%, #c9913a 100%)', WebkitBackgroundClip: 'text', color: 'transparent', textShadow: 'none'} as any}>论文打几分<span style={{marginRight: '-0.5em'}}>？</span></div>
				<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: C.cy, letterSpacing: '0.2em', marginTop: 30}}>《薄肌说明书》</div>
			</div>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />
		</AbsoluteFill>
	);
};
const Root: React.FC = () => (<>
	<Composition id="COVER31W" component={Cover} durationInFrames={1} fps={30} width={1440} height={1080} defaultProps={{layout: 'wide' as const}} />
	<Composition id="COVER31T" component={Cover} durationInFrames={1} fps={30} width={1080} height={1440} defaultProps={{layout: 'tall' as const}} />
</>);
registerRoot(Root);
