import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

/* 《悲伤五阶段》 look tests — three new art styles for the same voice (愤怒 Anger), so the series doesn't repeat 七情's
   neon line-art faces:  A stained glass (a cathedral window, the figure made of glass shards, light through it);
   B tarot / Art Nouveau (a Mucha-style card);  C marble bust with kintsugi (gold-mended cracks: grief as breaking
   and mending — the five stages become the statue cracking, burning, being glued, falling apart, healed in gold). */

const W = 1920, H = 1080, FPS = 30;
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const rnd = (i: number, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
type P = [number, number];
const SERIF = '"Noto Serif CJK SC", serif';
const GOLD = '#e6c47a';
const f2 = (p: P) => p[0].toFixed(1) + ',' + p[1].toFixed(1);

const FACE_F = 'M0,-170 C72,-170 118,-122 120,-54 C122,-6 114,40 98,78 C82,118 46,152 0,162 C-46,152 -82,118 -98,78 C-114,40 -122,-6 -120,-54 C-118,-122 -72,-170 0,-170 Z';
const BODY = 'M-46,120 C-46,180 -50,222 -60,244 C-122,262 -230,284 -292,340 C-326,372 -342,450 -350,660 L350,660 C342,450 326,372 292,340 C230,284 122,262 60,244 C50,222 46,180 46,120 Z';
/** storm hair rising from a hairline (same shape family as 七情's flame hair) */
const stormHair = (T: number, N = 9, h = 1) => {
	const tongues = Array.from({length: N}, (_, i) => { const u = i / (N - 1), x = lerp(-220, 220, u), peak = 1 - Math.abs(u - 0.5) * 2; return {x, tip: -200 - h * (90 * peak + 80 * peak * peak) - 18 * Math.sin(T * 4 + i * 1.7), lean: (u - 0.5) * 130 + 10 * Math.sin(T * 3 + i)}; });
	const valley = (i: number) => { const u = (i + 0.5) / (N - 1); return {x: lerp(-220, 220, u), y: -182 - 34 * (1 - Math.abs(u - 0.5) * 2)}; };
	const top = tongues.map(({x, tip, lean}, i) => { const vx = i < N - 1 ? valley(i) : {x: 170, y: -120}; return `Q${(x - 22 + lean * 0.3).toFixed(1)},${((tip - 140) * 0.5 - 40).toFixed(1)} ${(x + lean).toFixed(1)},${tip.toFixed(1)} Q${(x + 26 + lean * 0.4).toFixed(1)},${((tip + vx.y) / 2).toFixed(1)} ${vx.x.toFixed(1)},${vx.y.toFixed(1)}`; }).join(' ');
	return `M-124,-36 C-140,-80 -162,-110 -178,-126 ${top} C152,-100 136,-72 124,-36 C112,-92 70,-124 0,-128 C-70,-124 -112,-92 -124,-36 Z`;
};
/** jittered-grid triangles over a box: the glass shards */
const shards = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number, seed: number) => {
	const pt = (i: number, j: number): P => { const edge = i === 0 || j === 0 || i === nx || j === ny; const jx = edge ? 0 : (rnd(i * 31 + j, seed) - 0.5) * 0.8, jy = edge ? 0 : (rnd(i * 17 + j, seed + 1) - 0.5) * 0.8; return [lerp(x0, x1, (i + jx) / nx), lerp(y0, y1, (j + jy) / ny)]; };
	const out: {d: string; k: number}[] = [];
	for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
		const a = pt(i, j), b = pt(i + 1, j), c = pt(i + 1, j + 1), d = pt(i, j + 1), flip = rnd(i, j + seed) > 0.5;
		out.push({d: flip ? `M${f2(a)} L${f2(b)} L${f2(c)} Z` : `M${f2(a)} L${f2(b)} L${f2(d)} Z`, k: i * 7 + j * 3});
		out.push({d: flip ? `M${f2(a)} L${f2(c)} L${f2(d)} Z` : `M${f2(b)} L${f2(c)} L${f2(d)} Z`, k: i * 5 + j * 11 + 1});
	}
	return out;
};

/** the left-hand name block, shared by all three looks */
const NameBlock: React.FC<{col: string; grad: string; ink?: string}> = ({col, grad, ink = '#fff'}) => <g>
	<text x={150} y={330} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, letterSpacing: '0.16em'}} fill={ink} opacity={0.92}>悲伤的第二个阶段，它叫</text>
	<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 250}} fill={col} opacity={0.6} filter="url(#gL)">愤怒</text>
	<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 250}} fill={grad}>愤怒</text>
	<rect x={652} y={410} width={6} height={230} fill="url(#goldG)" />
	<text x={672} y={470} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 48, fontStyle: 'italic'}} fill={ink}>Anger</text>
	<text x={672} y={540} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 30, letterSpacing: '0.2em'}} fill={GOLD}>STAGE 2</text>
	<text x={150} y={770} style={{fontFamily: SERIF, fontWeight: 800, fontSize: 48}} fill={ink}>生气，是因为还放不下。</text>
</g>;
const BaseDefs: React.FC<{col: string; hot: string}> = ({col, hot}) => <>
	<filter id="gS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
	<filter id="gM" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10" /></filter>
	<filter id="gL" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="34" /></filter>
	<linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2c8" /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor="#a8823c" /></linearGradient>
	<linearGradient id="nameG" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor={hot} /><stop offset="1" stopColor={col} /></linearGradient>
</>;

// ---------------------------------------------------------------- A: stained glass
const LookA: React.FC = () => {
	const T = useCurrentFrame() / FPS, cx = 1350, k = 1.4, hair = stormHair(T);
	const fire = ['#ff3b2f', '#ff7a1a', '#c81e1e', '#ffb347', '#8b0f14', '#ff5a3a'], robe = ['#5a0e2a', '#3a0a3e', '#7a1230', '#2a0a30', '#8a2a1a'];
	const lead = '#120707';
	const arch = 'M935,1100 L935,330 Q935,52 1350,14 Q1765,52 1765,330 L1765,1100 Z';
	return <AbsoluteFill style={{background: '#050304'}}>
		<svg width={W} height={H}>
			<defs>
				<BaseDefs col="#ff3b2f" hot="#ffd0c4" />
				<clipPath id="archC"><path d={arch} /></clipPath>
				<clipPath id="hairC"><path d={hair} /></clipPath>
				<clipPath id="bodyC"><path d={BODY} /></clipPath>
				<linearGradient id="skinGlass" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#fff1e2" /><stop offset="1" stopColor="#f0b08c" /></linearGradient>
				<radialGradient id="winG" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stopColor="#ffd9a0" stopOpacity="0.9" /><stop offset="1" stopColor="#ff3b2f" stopOpacity="0" /></radialGradient>
			</defs>
			<rect width={W} height={H} fill="#070405" />
			<ellipse cx={cx} cy={420} rx={760} ry={620} fill="#ff4a2a" opacity={0.18} filter="url(#gL)" />
			{/* the window: a rose of glass wedges behind the head, in a gothic arch */}
			<g clipPath="url(#archC)">
				<rect x={900} y={0} width={900} height={1100} fill="#1a0606" />
				{Array.from({length: 3}, (_, ring) => Array.from({length: 24}, (_, i) => { const r0 = 120 + ring * 190, r1 = r0 + 190, a0 = (i / 24) * Math.PI * 2 + ring * 0.13, a1 = ((i + 1) / 24) * Math.PI * 2 + ring * 0.13, o = 420; const P_ = (a: number, r: number) => `${(cx + Math.cos(a) * r).toFixed(1)},${(o + Math.sin(a) * r).toFixed(1)}`; return <path key={ring + '-' + i} d={`M${P_(a0, r0)} L${P_(a0, r1)} L${P_(a1, r1)} L${P_(a1, r0)} Z`} fill={[ '#7a0c10', '#b8261a', '#d9661a', '#4a0a1a', '#e8a13a'][(i + ring * 2) % 5]} opacity={0.75 - ring * 0.12} stroke={lead} strokeWidth={6} />; }))}
				<circle cx={cx} cy={420} r={120} fill="url(#winG)" />
				{Array.from({length: 7}, (_, i) => <polygon key={i} points={`${cx - 600 + i * 90},-40 ${cx - 560 + i * 90},-40 ${cx + 120 + i * 60},1100 ${cx + 40 + i * 60},1100`} fill="#fff1d0" opacity={0.06} filter="url(#gM)" />)}
			</g>
			<path d={arch} fill="none" stroke="#2a2018" strokeWidth={34} /><path d={arch} fill="none" stroke="url(#goldG)" strokeWidth={4} transform="translate(0,0)" />
			{/* the figure, made of glass */}
			<g transform={`translate(${cx},${560}) scale(${k})`}>
				<g clipPath="url(#bodyC)">{shards(-360, 110, 360, 670, 8, 5, 7).map((s, i) => <path key={i} d={s.d} fill={robe[s.k % robe.length]} stroke={lead} strokeWidth={5} />)}</g>
				<path d={BODY} fill="none" stroke={lead} strokeWidth={8} />
				<path d="M-60,244 L0,330 L60,244" stroke="url(#goldG)" strokeWidth={8} fill="none" /><path d="M-60,244 L0,330 L60,244" stroke={lead} strokeWidth={2} fill="none" />
				<g clipPath="url(#hairC)">{shards(-300, -480, 300, -30, 9, 6, 3).map((s, i) => <path key={i} d={s.d} fill={fire[s.k % fire.length]} stroke={lead} strokeWidth={4.5} />)}</g>
				<path d={hair} fill="none" stroke={lead} strokeWidth={8} />
				<path d={FACE_F} fill="url(#skinGlass)" />
				{/* the face painted in grisaille on one piece of glass, the way old windows are */}
				{[1, -1].map((s) => <g key={s} transform={`translate(${s * 46},-22) scale(${s},1)`}>
					<path d="M-28,4 C-12,-6 12,-14 31,-14 C20,6 -10,14 -28,4 Z" fill="#fffaf2" stroke="#4a2414" strokeWidth={2.4} />
					<circle cx={6} cy={-3} r={7} fill="#a8241a" /><circle cx={6} cy={-3} r={3} fill="#2a0a06" />
					<path d="M-26,-22 C-8,-26 14,-38 36,-46" stroke="#4a2414" strokeWidth={4.5} strokeLinecap="round" fill="none" />
					<path d="M-22,-30 C-6,-34 14,-44 30,-52" stroke="#4a2414" strokeWidth={1.4} fill="none" opacity={0.6} />
					<path d="M-24,12 C-8,18 12,16 26,6" stroke="#4a2414" strokeWidth={1.2} fill="none" opacity={0.6} />
				</g>)}
				<path d="M-6,-8 C-12,20 -14,36 -8,46 C-2,50 6,50 12,46" stroke="#4a2414" strokeWidth={2.2} fill="none" />
				<ellipse cx={60} cy={20} rx={40} ry={90} fill="#a85a3a" opacity={0.22} filter="url(#gM)" />
				<path d="M-30,86 C-16,80 -6,82 0,84 C6,82 16,80 30,86" stroke="#4a2414" strokeWidth={3} fill="none" />
				<path d="M-22,94 C-8,100 8,100 22,94" stroke="#8a2a1a" strokeWidth={4} fill="none" />
				<path d={FACE_F} fill="none" stroke={lead} strokeWidth={8} />
				<path d="M-36,-110 L-18,-80 L-34,-52" stroke="#ff3b2f" strokeWidth={3} fill="none" opacity={0.8} />
			</g>
			<rect width={W} height={H} fill="url(#vigA)" />
			<radialGradient id="vigA" cx="0.62" cy="0.45" r="0.85"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.75" /></radialGradient>
			<NameBlock col="#ff3b2f" grad="url(#nameG)" />
		</svg>
	</AbsoluteFill>;
};

// ---------------------------------------------------------------- B: tarot / Art Nouveau card
const LookB: React.FC = () => {
	const T = useCurrentFrame() / FPS, cx = 1350, ink = '#1e0a06', cream = '#f4e2c8', wine = '#5a1416';
	const strip = (c: P[], w: (u: number) => number) => { const n = c.length - 1, L: P[] = [], R: P[] = []; c.forEach((p, i) => { const a = c[Math.max(0, i - 1)], b = c[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, h = w(i / n) / 2; L.push([p[0] + nx * h, p[1] + ny * h]); R.push([p[0] - nx * h, p[1] - ny * h]); }); return 'M' + L.map(f2).join(' L') + ' L' + R.reverse().map(f2).join(' L') + ' Z'; };
	// Mucha hair: big locks sweeping out from the crown and ending in curls
	const lock = (s: number, j: number) => { const c: P[] = Array.from({length: 40}, (_, i) => { const q = i / 39, x = 70 + (150 + j * 70) * Math.sin(q * Math.PI * 0.85) + 40 * Math.sin(q * Math.PI * 2.2 + j + T * 1.2) * q, y = -170 + (600 - j * 80) * q; return [s * x, y] as P; }); return strip(c, (q) => lerp(70 - j * 12, 14, q)); };
	return <AbsoluteFill style={{background: '#0a0405'}}>
		<svg width={W} height={H}>
			<defs>
				<BaseDefs col="#ff5a3a" hot="#ffe0c8" />
				<linearGradient id="cardG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a0c10" /><stop offset="1" stopColor="#1a0608" /></linearGradient>
				<clipPath id="cardC"><rect x={cx - 360} y={30} width={720} height={1020} rx={18} /></clipPath>
			</defs>
			<rect width={W} height={H} fill="#0a0405" />
			<ellipse cx={cx} cy={520} rx={600} ry={560} fill="#ff4a2a" opacity={0.12} filter="url(#gL)" />
			{/* the card */}
			<rect x={cx - 360} y={30} width={720} height={1020} rx={18} fill="url(#cardG)" stroke="url(#goldG)" strokeWidth={6} />
			<rect x={cx - 334} y={56} width={668} height={968} rx={10} fill="none" stroke={GOLD} strokeWidth={1.6} opacity={0.8} />
			<g clipPath="url(#cardC)">
				{/* the halo: a mosaic disc */}
				<circle cx={cx} cy={420} r={280} fill="#c9a24a" opacity={0.9} />
				<circle cx={cx} cy={420} r={280} fill="none" stroke={ink} strokeWidth={5} />
				<circle cx={cx} cy={420} r={236} fill="#e6c47a" stroke={ink} strokeWidth={4} />
				{Array.from({length: 40}, (_, i) => { const a = i / 40 * Math.PI * 2; return <circle key={i} cx={cx + Math.cos(a) * 258} cy={420 + Math.sin(a) * 258} r={9} fill={i % 2 ? wine : '#ff7a3a'} stroke={ink} strokeWidth={2} />; })}
				{Array.from({length: 16}, (_, i) => { const a = i / 16 * Math.PI * 2; return <line key={'l' + i} x1={cx + Math.cos(a) * 120} y1={420 + Math.sin(a) * 120} x2={cx + Math.cos(a) * 236} y2={420 + Math.sin(a) * 236} stroke={ink} strokeWidth={2} opacity={0.6} />; })}
				{/* ornamental flames curling round the halo */}
				{Array.from({length: 10}, (_, i) => { const a = -Math.PI + i / 9 * Math.PI, x = cx + Math.cos(a) * 330, y = 420 + Math.sin(a) * 330; return <path key={'f' + i} transform={`translate(${x},${y}) rotate(${a * 180 / Math.PI + 90})`} d={`M0,0 C-26,-30 -10,-70 0,-${80 + 10 * Math.sin(T * 3 + i)} C10,-70 26,-30 0,0 Z`} fill="#ff6a2a" stroke={ink} strokeWidth={3} />; })}
				<g transform={`translate(${cx},520) scale(1.12)`}>
					{[1, -1].map((s) => [0, 1, 2].map((j) => <path key={s + '-' + j} d={lock(s, j)} fill={j === 1 ? '#a8321c' : '#7a1a10'} stroke={ink} strokeWidth={3.5} />))}
					{/* drapery and a gold collar */}
					<path d={BODY} fill={wine} stroke={ink} strokeWidth={4} />
					{[-200, -120, 120, 200].map((x) => <path key={x} d={`M${x * 0.5},270 C${x * 0.8},400 ${x},520 ${x * 1.05},660`} stroke={ink} strokeWidth={2.4} fill="none" opacity={0.7} />)}
					<path d="M-120,262 C-60,320 60,320 120,262 L100,300 C40,350 -40,350 -100,300 Z" fill="#e6c47a" stroke={ink} strokeWidth={3} />
					{/* face */}
					<path d="M-124,-40 C-140,-160 -76,-214 0,-214 C76,-214 140,-160 124,-40 C110,-100 60,-128 0,-130 C-60,-128 -110,-100 -124,-40 Z" fill="#7a1a10" stroke={ink} strokeWidth={4} />
					<path d={FACE_F} fill={cream} stroke={ink} strokeWidth={4} />
					{[1, -1].map((s) => <g key={s} transform={`translate(${s * 46},-22) scale(${s},1)`}>
						<path d="M-28,4 C-12,-8 12,-14 31,-12 C20,8 -10,14 -28,4 Z" fill="#fff" stroke={ink} strokeWidth={3} />
						<circle cx={6} cy={-2} r={8} fill="#b8461a" /><circle cx={6} cy={-2} r={3.4} fill={ink} />
						<path d="M-26,-22 C-8,-26 14,-38 36,-46" stroke={ink} strokeWidth={5} strokeLinecap="round" fill="none" />
					</g>)}
					<path d="M-6,-6 C-10,20 -12,36 -6,46 L8,46" stroke={ink} strokeWidth={2.4} fill="none" />
					<path d="M-28,86 C-12,80 12,80 28,86 C16,96 -16,96 -28,86 Z" fill="#b8261a" stroke={ink} strokeWidth={2} />
					{[1, -1].map((s) => <ellipse key={'b' + s} cx={s * 70} cy={34} rx={22} ry={9} fill="#e88a6a" opacity={0.35} />)}
				</g>
				{/* the title banner */}
				<path d={`M${cx - 300},900 L${cx + 300},900 L${cx + 330},950 L${cx + 300},1000 L${cx - 300},1000 L${cx - 330},950 Z`} fill="#e6c47a" stroke={ink} strokeWidth={4} />
				<text x={cx} y={966} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 46, letterSpacing: '0.4em'}} fill={ink}>ANGER</text>
				<circle cx={cx} cy={92} r={34} fill="#e6c47a" stroke={ink} strokeWidth={3} />
				<text x={cx} y={106} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 36}} fill={ink}>II</text>
			</g>
			<NameBlock col="#ff5a3a" grad="url(#nameG)" />
		</svg>
	</AbsoluteFill>;
};

// ---------------------------------------------------------------- C: marble bust with kintsugi
const LookC: React.FC = () => {
	const T = useCurrentFrame() / FPS, cx = 1350, hair = stormHair(T * 0.15, 9, 0.75);
	const cracks = ['M-96,-150 L-60,-112 L-72,-70 L-40,-30 L-58,10 L-24,60 L-36,110', 'M-60,-112 L-30,-120 L-10,-104', 'M-40,-30 L-80,-20', 'M60,-160 L76,-120 L56,-84 L88,-40 L72,0', 'M30,96 L50,130 L36,170 L70,240 L52,300 L90,360', 'M36,170 L4,196', 'M-200,300 L-150,330 L-170,380 L-110,420', 'M120,-230 L104,-196 L132,-170'];
	const pulse = 0.75 + 0.25 * Math.sin(T * 4);
	return <AbsoluteFill style={{background: '#060506'}}>
		<svg width={W} height={H}>
			<defs>
				<BaseDefs col="#ff7a2a" hot="#ffe2b8" />
				<radialGradient id="marble" cx="0.36" cy="0.28" r="0.85"><stop offset="0" stopColor="#fbf8f2" /><stop offset="0.5" stopColor="#d8d2c8" /><stop offset="1" stopColor="#7c766e" /></radialGradient>
				<radialGradient id="marbleH" cx="0.4" cy="0.2" r="0.9"><stop offset="0" stopColor="#f2eee8" /><stop offset="0.6" stopColor="#bdb6ab" /><stop offset="1" stopColor="#6a645c" /></radialGradient>
				<clipPath id="faceC"><path d={FACE_F} /></clipPath>
				<linearGradient id="spot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff4e0" stopOpacity="0.35" /><stop offset="1" stopColor="#fff4e0" stopOpacity="0" /></linearGradient>
			</defs>
			<rect width={W} height={H} fill="#070607" />
			<polygon points={`${cx - 90},-20 ${cx + 90},-20 ${cx + 520},1100 ${cx - 520},1100`} fill="url(#spot)" filter="url(#gL)" />
			<ellipse cx={cx} cy={1040} rx={520} ry={60} fill="#000" opacity={0.6} filter="url(#gM)" />
			<g transform={`translate(${cx},540) scale(1.42)`}>
				{/* sculpted bust and drapery */}
				<path d={BODY} fill="url(#marbleH)" />
				{[-230, -150, 140, 220].map((x, i) => <path key={x} d={`M${x * 0.45},290 C${x * 0.8},380 ${x},500 ${x * 1.05},660`} stroke="#8a847b" strokeWidth={6} fill="none" opacity={0.55} filter="url(#gS)" />)}
				<path d="M-60,244 C-20,262 20,262 60,244" stroke="#6f6a62" strokeWidth={6} fill="none" opacity={0.6} filter="url(#gS)" />
				{/* hair carved in wind-blown waves */}
				<path d="M-140,-10 C-160,-170 -84,-250 0,-250 C84,-250 160,-170 140,-10 C126,-90 96,-140 0,-150 C-96,-140 -126,-90 -140,-10 Z" fill="url(#marbleH)" />
				{Array.from({length: 46}, (_, i) => { const a = lerp(-3.05, -0.09, (i % 23) / 22), r = i < 23 ? 228 : 182, x = Math.cos(a) * r * 0.66, y = -60 + Math.sin(a) * r * 0.78; return <g key={'c' + i} transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}><circle r={i < 23 ? 21 : 19} fill="url(#marbleH)" /><circle r={i < 23 ? 21 : 19} fill="none" stroke="#7a746b" strokeWidth={3} opacity={0.7} /><path d="M-8,4 C-8,-8 8,-10 9,0 C9,8 -2,8 -2,2" stroke="#6f6a62" strokeWidth={2.2} fill="none" /><circle cx={-6} cy={-8} r={5} fill="#fffaf2" opacity={0.6} /></g>; })}
				{false && Array.from({length: 10}, (_, j) => { const x0 = lerp(-110, 110, j / 9), x1 = lerp(-230, 230, j / 9); return <g key={j}><path d={`M${x0},-128 C${x0 * 1.2},-180 ${x1 * 0.9},-226 ${x1},${-252 - 60 * (1 - Math.abs(j - 4.5) / 4.5)}`} stroke="#857f76" strokeWidth={7} fill="none" opacity={0.6} filter="url(#gS)" /><path d={`M${x0 + 6},-130 C${x0 * 1.2 + 6},-182 ${x1 * 0.9 + 6},-228 ${x1 + 6},${-254 - 60 * (1 - Math.abs(j - 4.5) / 4.5)}`} stroke="#fffaf2" strokeWidth={2} fill="none" opacity={0.6} /></g>; })}
				{/* face, lit from above left */}
				<path d={FACE_F} fill="url(#marble)" />
				<g clipPath="url(#faceC)">
					<ellipse cx={86} cy={20} rx={70} ry={170} fill="#5f5a53" opacity={0.45} filter="url(#gM)" />
					{[1, -1].map((s) => <ellipse key={s} cx={s * 46} cy={-24} rx={38} ry={20} fill="#7a746c" opacity={0.55} filter="url(#gS)" />)}
					<path d="M6,-10 C10,18 14,34 18,46 L-4,50" stroke="#6a645c" strokeWidth={6} fill="none" opacity={0.6} filter="url(#gS)" />
					<ellipse cx={0} cy={120} rx={44} ry={16} fill="#6a645c" opacity={0.35} filter="url(#gS)" />
				</g>
				{[1, -1].map((s) => <g key={s} transform={`translate(${s * 46},-22) scale(${s},1)`}>
					<path d="M-28,4 C-12,-6 12,-12 31,-12 C20,8 -10,14 -28,4 Z" fill="#ece7df" stroke="#8a847b" strokeWidth={2} />
					<path d="M-28,-20 C-10,-24 14,-36 36,-44" stroke="#9b958c" strokeWidth={9} strokeLinecap="round" fill="none" filter="url(#gS)" />
					<path d="M-28,-24 C-10,-28 14,-40 36,-48" stroke="#fffaf2" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.7} />
				</g>)}
				<path d="M-26,84 C-10,78 10,78 26,84 C14,96 -14,96 -26,84 Z" fill="#b9b2a7" />
				<path d="M-28,84 C-10,88 10,88 28,84" stroke="#6f6a62" strokeWidth={2.4} fill="none" />
				{/* the cracks, still molten: anger — gold will mend them by the last stage */}
				{cracks.map((d, i) => <g key={i}>
					<path d={d} stroke="#ff6a1a" strokeWidth={16} fill="none" opacity={0.6 * pulse} filter="url(#gM)" strokeLinejoin="round" />
					<path d={d} stroke="#3a2208" strokeWidth={9} fill="none" strokeLinejoin="round" opacity={0.6} />
					<path d={d} stroke="url(#goldG)" strokeWidth={6} fill="none" strokeLinejoin="round" />
					<path d={d} stroke="#fff3d0" strokeWidth={1.4} fill="none" strokeLinejoin="round" />
				</g>)}
				{Array.from({length: 18}, (_, i) => { const ph = (T * 0.5 + rnd(i, 3)) % 1; return <circle key={'e' + i} cx={-180 + rnd(i, 4) * 360} cy={300 - ph * 600} r={1.6 + 2 * rnd(i, 5)} fill={i % 2 ? '#ffb070' : '#fff1c4'} opacity={Math.sin(Math.PI * ph)} />; })}
			</g>
			<rect width={W} height={H} fill="url(#vigC)" />
			<radialGradient id="vigC" cx="0.65" cy="0.45" r="0.85"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.8" /></radialGradient>
			<NameBlock col="#ff7a2a" grad="url(#nameG)" />
		</svg>
	</AbsoluteFill>;
};

registerRoot(() => <>
	<Composition id="LookA" component={LookA} durationInFrames={90} fps={FPS} width={W} height={H} />
	<Composition id="LookB" component={LookB} durationInFrames={90} fps={FPS} width={W} height={H} />
	<Composition id="LookC" component={LookC} durationInFrames={90} fps={FPS} width={W} height={H} />
</>);
