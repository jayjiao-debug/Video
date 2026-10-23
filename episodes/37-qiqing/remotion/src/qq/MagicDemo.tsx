import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

/* 魔法阵 look test: a magic circle built layer by layer (one layer per beat in the film). Stills only. */
const W = 1920, H = 1080, FPS = 30;
const SERIF = '"Noto Serif CJK SC", serif', SYM = '"DejaVu Sans", sans-serif';
const GOLD = '#e8c372';
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const out3 = (u: number) => 1 - Math.pow(1 - cl01(u), 3);
const poly = (n: number, r: number, rot = -90, step = 1) => Array.from({length: n}, (_, i) => { const a = (rot + (i * step * 360) / n) * Math.PI / 180; return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ') + ' Z';
const PLANETS = ['☉', '☽', '☿', '♀', '♂', '♃', '♄'];
const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

/** a stroke that draws itself */
const Draw: React.FC<{d: string; u: number; w?: number; col?: string; L?: number; glow?: boolean}> = ({d, u, w = 2.5, col = GOLD, L = 6000, glow = true}) => u <= 0 ? null : <g>
	{glow && <path d={d} fill="none" stroke={col} strokeWidth={w * 4} opacity={0.25} filter="url(#gM)" strokeDasharray={L} strokeDashoffset={L * (1 - out3(u))} />}
	<path d={d} fill="none" stroke={col} strokeWidth={w} strokeDasharray={L} strokeDashoffset={L * (1 - out3(u))} strokeLinejoin="round" />
</g>;

const circ = (r: number) => `M${r},0 A${r},${r} 0 1,1 ${-r},0 A${r},${r} 0 1,1 ${r},0`;

const Circle: React.FC<{T: number; layers: number; label?: string; sub?: string}> = ({T, layers, label, sub}) => {
	const L = (k: number) => cl01(layers - k);            // how far layer k is drawn
	const spin = T * 6;
	return <svg width={W} height={H}>
		<defs>
			<filter id="gM" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
			<filter id="gL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
			<radialGradient id="bg" cx="0.5" cy="0.5" r="0.75"><stop offset="0" stopColor="#1b1430" /><stop offset="0.6" stopColor="#09070f" /><stop offset="1" stopColor="#030205" /></radialGradient>
			<radialGradient id="core"><stop offset="0" stopColor="#fff4d6" /><stop offset="0.3" stopColor={GOLD} stopOpacity="0.7" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
		</defs>
		<rect width={W} height={H} fill="url(#bg)" />
		{Array.from({length: 70}, (_, k) => <circle key={k} cx={(k * 977) % W} cy={(k * 613) % H} r={0.8 + (k % 3) * 0.6} fill="#eef" opacity={0.2 + (k % 5) * 0.08} />)}
		<g transform={`translate(${W / 2},${H / 2})`}>
			<circle r={470} fill={GOLD} opacity={0.06 * L(0)} filter="url(#gL)" />
			{/* 1: the boundary — two concentric circles */}
			<Draw d={circ(440)} u={L(0)} w={3} />
			<Draw d={circ(410)} u={L(0)} w={1.6} />
			{/* 2: the outer ring of signs between them (zodiac), slowly turning */}
			{L(1) > 0 && <g transform={`rotate(${spin})`} opacity={L(1)}>
				{ZODIAC.map((z, i) => { const a = i * 30 - 90; return <g key={z} transform={`rotate(${a}) translate(0,-425) rotate(${-a - spin})`}><text y={9} textAnchor="middle" style={{fontFamily: SYM, fontSize: 24}} fill={GOLD}>{z}</text></g>; })}
				{Array.from({length: 72}, (_, i) => <line key={i} transform={`rotate(${i * 5})`} x1={0} y1={-410} x2={0} y2={i % 6 === 0 ? -398 : -404} stroke={GOLD} strokeWidth={1.2} />)}
			</g>}
			{/* 3: the hexagram (two triangles: fire △ and water ▽) */}
			<Draw d={poly(3, 400, -90)} u={L(2)} w={2.4} />
			<Draw d={poly(3, 400, 90)} u={L(2.3)} w={2.4} />
			{/* 4: the inner circle and the seven planets on the points of a heptagram */}
			<Draw d={circ(230)} u={L(3)} w={2} />
			<Draw d={poly(7, 228, -90, 3)} u={L(3.3)} w={1.8} col="#b9d4ff" />
			{L(3.6) > 0 && PLANETS.map((p, i) => { const a = (-90 + i * 360 / 7) * Math.PI / 180; return <g key={p} transform={`translate(${Math.cos(a) * 285},${Math.sin(a) * 285})`} opacity={L(3.6)}>
				<circle r={30} fill="#09070f" stroke={GOLD} strokeWidth={1.6} /><text y={11} textAnchor="middle" style={{fontFamily: SYM, fontSize: 30}} fill="#fff4d6">{p}</text></g>; })}
			{/* 5: the centre: a small circle and the point (the "eye") — the circle wakes up */}
			<Draw d={circ(70)} u={L(4)} w={2.2} />
			{L(4.5) > 0 && <><circle r={150} fill="url(#core)" opacity={0.9 * L(4.5)} /><circle r={9} fill="#fff" opacity={L(4.5)} /></>}
		</g>
		{label && <text x={150} y={170} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 72}} fill="#fff">{label}</text>}
		{sub && <text x={150} y={240} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 36}} fill={GOLD}>{sub}</text>}
	</svg>;
};

const STAGES: [number, string, string][] = [[1, '第一层：圆', '边界：里面是你的，外面不是'], [2.6, '第二层：符号之环', '黄道十二宫，把天空写在边上'], [3.8, '第三层：六芒星', '火△与水▽，上与下重合'], [6, '魔法阵', '一层一层，就这样画出来']];
export const MagicDemo: React.FC = () => {
	const f = useCurrentFrame(), s = STAGES[Math.min(STAGES.length - 1, Math.floor(f / 10))];
	return <AbsoluteFill style={{background: '#030205'}}><Circle T={f / FPS} layers={s[0]} label={s[1]} sub={s[2]} /></AbsoluteFill>;
};
registerRoot(() => <Composition id="MAGIC" component={MagicDemo} durationInFrames={40} fps={FPS} width={W} height={H} />);
