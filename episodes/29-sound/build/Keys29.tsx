import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {JUNO} from '../brand/identity';
import spectra from './spectra29.json';

/* ep29 look "空气粒子场": deep navy space full of glowing air particles. Every principle is particles moving:
   squeezed and released by a speaker, circling a head seen from above, bursting on the drop.
   Colours: cyan = left ear / low, magenta = right ear / high, gold = the answer. Spectra are the track's real data. */
const W = 1920, H = 1080;
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';
const C = {bg0: '#0a1026', bg1: '#060914', cyan: '#5ce1e6', mag: '#ff5fa2', gold: '#f1c56d', ink: '#eaf2ff', dim: 'rgba(234,242,255,0.55)'};
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

const Defs = () => (
	<defs>
		<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
		<filter id="glow2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
		<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
		<radialGradient id="vig"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
		<linearGradient id="warm" x1="0" x2="1"><stop offset="0" stopColor={C.cyan} /><stop offset="1" stopColor={C.gold} /></linearGradient>
	</defs>
);
/** the air: particles whose density follows dens(x,y) in 0..1 */
const Air: React.FC<{n?: number; seed?: number; dens?: (x: number, y: number) => number; col?: (x: number, y: number) => string; o?: number}> = ({n = 1400, seed = 3, dens, col, o = 1}) => {
	const R = rng(seed); const out: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) {
		const x = R() * W, y = R() * H, k = R(), r = 0.8 + R() * 2.2, keep = R();
		const d = dens ? dens(x, y) : 0.5;
		if (keep > d) continue;
		out.push(<circle key={i} cx={x} cy={y} r={r} fill={col ? col(x, y) : C.ink} opacity={o * (0.15 + 0.6 * k) * (0.4 + 0.6 * d)} />);
	}
	return <g>{out}</g>;
};
const Frame: React.FC<{children: React.ReactNode; sub?: string; tint?: string}> = ({children, sub, tint}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${tint ?? C.bg0} 0%, ${C.bg1} 75%)`}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Defs />{children}<rect width={W} height={H} fill="url(#vig)" /></svg>
		{sub && <div style={{position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center'}}>
			<div style={{position: 'relative', padding: '26px 120px'}}>
				<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(4,6,14,0.55) 0%, rgba(4,6,14,0.3) 42%, rgba(4,6,14,0) 100%)', filter: 'blur(6px)'}} />
				<div style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fffaf0', WebkitTextStroke: '7px rgba(6,8,18,0.6)', paintOrder: 'stroke fill', textShadow: '0 2px 10px rgba(0,0,0,0.75), 0 0 28px rgba(0,0,0,0.45)'}}>{sub}</div>
			</div>
		</div>}
		<div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: C.ink}}>{JUNO.mark}</div>
	</AbsoluteFill>
);
const Lab: React.FC<{x: number; y: number; t: string; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; w?: number}> = ({x, y, t, s = 52, c = C.ink, a = 'middle', w = 800}) => (
	<text x={x} y={y} textAnchor={a} style={{fontFamily: SANS, fontWeight: w, fontSize: s}} fill={c} stroke="rgba(4,6,14,0.7)" strokeWidth={s * 0.12} paintOrder="stroke">{t}</text>
);
const wave = (x0: number, x1: number, y: number, amp: number, wl: number, env?: (x: number) => number, ph = 0) => {
	let d = '';
	for (let x = x0; x <= x1; x += 4) { const e = env ? env(x) : 1; d += `${x === x0 ? 'M' : 'L'} ${x} ${y + Math.sin(((x - x0) / wl) * Math.PI * 2 + ph) * amp * e} `; }
	return d;
};
/** a head seen from above, nose up; ears glow with the given colours */
const Head: React.FC<{x: number; y: number; s?: number; l?: string; r?: string; lo?: number; ro?: number}> = ({x, y, s = 1, l = C.cyan, r = C.mag, lo = 0.9, ro = 0.9}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<ellipse cx={0} cy={0} rx={92} ry={110} fill="#141a33" stroke="#9fb3d9" strokeWidth={3} opacity={0.95} />
		<path d="M -14 -106 L 0 -132 L 14 -106 Z" fill="#141a33" stroke="#9fb3d9" strokeWidth={3} />
		<ellipse cx={-96} cy={0} rx={16} ry={30} fill={l} opacity={lo} filter="url(#glow)" />
		<ellipse cx={96} cy={0} rx={16} ry={30} fill={r} opacity={ro} filter="url(#glow)" />
		<text x={-150} y={14} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}} fill={l}>L</text>
		<text x={150} y={14} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}} fill={r}>R</text>
	</g>
);
const Spectrum: React.FC<{data: number[]; cut?: number; mode?: 'low' | 'high' | 'ghost'; y0?: number}> = ({data, cut, mode, y0 = 760}) => {
	const edges = (spectra as any).edges as number[];
	const x0 = 160, x1 = 1760, bw = (x1 - x0) / data.length;
	const norm = (db: number) => Math.max(0, Math.min(1, (db + 15) / 75));
	const fx = (f: number) => x0 + ((Math.log(f) - Math.log(edges[0])) / (Math.log(edges[edges.length - 1]) - Math.log(edges[0]))) * (x1 - x0);
	const normal = (spectra as any).normal as number[];
	return (
		<g>
			{data.map((db, i) => {
				const f = Math.sqrt(edges[i] * edges[i + 1]); const h = 380 * norm(db), hn = 380 * norm(normal[i]);
				const low = f < 250;
				const ghost = mode === 'ghost' && f < 130;
				const col = low ? C.cyan : f > 2500 ? C.mag : '#9fb3ff';
				return (
					<g key={i}>
						{ghost ? <rect x={x0 + i * bw + 3} y={y0 - hn} width={bw - 6} height={hn} fill="none" stroke={C.cyan} strokeDasharray="6 6" strokeWidth={2.5} opacity={0.7} />
							: <rect x={x0 + i * bw + 3} y={y0 - Math.max(h, 3)} width={bw - 6} height={Math.max(h, 3)} rx={3} fill={col} opacity={0.9} filter="url(#glow)" />}
					</g>
				);
			})}
			<line x1={x0} x2={x1} y1={y0 + 4} y2={y0 + 4} stroke={C.dim} strokeWidth={2} />
			{[50, 100, 1000, 10000].map((f) => <text key={f} x={fx(f)} y={y0 + 48} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={C.dim}>{f >= 1000 ? `${f / 1000}k` : f}</text>)}
			{cut && <><line x1={fx(cut)} x2={fx(cut)} y1={y0 - 430} y2={y0 + 10} stroke={C.gold} strokeWidth={4} strokeDasharray="14 10" /><Lab x={fx(cut)} y={y0 - 450} t={`${cut} Hz`} s={44} c={C.gold} /></>}
		</g>
	);
};

/* ---------------------------------------------------------------- the frames */
const K1 = () => (
	<Frame sub="你听的这首歌，被放慢过">
		<Air n={900} seed={1} />
		<path d={wave(80, 1840, 470, 150, 560, (x) => Math.sin(((x - 80) / 1760) * Math.PI))} fill="none" stroke={C.cyan} strokeWidth={7} filter="url(#glow2)" />
		<Lab x={960} y={250} t="慢放：每一次振动都被拉长" s={52} c={C.cyan} />
	</Frame>
);
const K2 = () => (
	<Frame sub="声音一下子变高了">
		<Air n={1100} seed={2} col={(x) => (x > 960 ? C.gold : C.cyan)} />
		<path d={wave(80, 1840, 470, 150, 220, (x) => Math.sin(((x - 80) / 1760) * Math.PI))} fill="none" stroke="url(#warm)" strokeWidth={7} filter="url(#glow2)" />
		{[[300, '▶▶'], [1620, '◀◀']].map(([x, t]) => <Lab key={t as string} x={x as number} y={250} t={t as string} s={64} c={C.gold} />)}
		<Lab x={960} y={250} t="调快 ×1.26 → 音高 +4 个半音" s={52} c={C.gold} />
	</Frame>
);
const K3 = () => {
	const dens = (x: number) => (x < 380 ? 0.03 : Math.pow(0.5 + 0.5 * Math.cos(((x - 420) / 300) * Math.PI * 2), 2.2));
	return (
		<Frame sub="喇叭往前一推，空气被挤紧">
			<Air n={11000} seed={3} dens={dens} col={(x) => (Math.cos(((x - 420) / 300) * Math.PI * 2) > 0.5 ? C.cyan : C.ink)} />
			<g filter="url(#glow)">
				<rect x={150} y={330} width={70} height={300} rx={10} fill="#1c2546" stroke="#9fb3d9" strokeWidth={3} />
				<path d="M 220 360 L 330 280 L 330 680 L 220 600 Z" fill="#1c2546" stroke={C.cyan} strokeWidth={4} />
				<ellipse cx={335} cy={480} rx={18} ry={200} fill={C.cyan} opacity={0.5} />
			</g>
			<Lab x={380} y={250} t="推 →" s={52} c={C.cyan} />
			{[0, 1, 2, 3, 4].map((i) => <Lab key={i} x={420 + i * 300} y={830} t="挤紧" s={44} c={C.gold} />)}
			{[0, 1, 2, 3].map((i) => <Lab key={i} x={570 + i * 300} y={830} t="松开" s={44} c={C.dim} />)}
		</Frame>
	);
};
const K4 = () => (
	<Frame sub="只留最低的鼓声：每秒约45次">
		<Air n={700} seed={4} o={0.6} />
		<Spectrum data={(spectra as any).lp} cut={220} y0={720} />
		<g filter="url(#glow2)"><circle cx={360} cy={230} r={80} fill="none" stroke={C.cyan} strokeWidth={8} /><circle cx={360} cy={230} r={130} fill="none" stroke={C.cyan} strokeWidth={4} opacity={0.5} /></g>
		<Lab x={360} y={248} t="45 Hz" s={52} c={C.ink} />
	</Frame>
);
const K5 = () => (
	<Frame sub="低音全删了，你还听得见鼓吗？">
		<Air n={700} seed={5} o={0.6} />
		<Spectrum data={(spectra as any).phantom} cut={130} mode="ghost" y0={720} />
		<g opacity={0.8}><circle cx={360} cy={230} r={90} fill={C.cyan} opacity={0.12} filter="url(#soft)" /><circle cx={360} cy={230} r={80} fill="none" stroke={C.cyan} strokeWidth={4} strokeDasharray="10 10" /></g>
		<Lab x={360} y={248} t="45 Hz？" s={52} c={C.cyan} />
		<Lab x={1200} y={200} t="大脑从上面的泛音，补出了低音" s={48} c={C.gold} />
	</Frame>
);
const K6 = () => (
	<Frame sub="听到那个“呜哇”的摇晃了吗？">
		<Air n={800} seed={6} o={0.5} />
		{[0, 1, 2, 3].map((i) => <path key={i} d={wave(120, 760, 330 + i * 70, 22, 46, undefined, i)} fill="none" stroke={C.cyan} strokeWidth={4} opacity={0.75 - i * 0.12} filter="url(#glow)" />)}
		{[0, 1, 2, 3].map((i) => <path key={i} d={wave(1160, 1800, 330 + i * 70, 22, 45.2, undefined, i)} fill="none" stroke={C.mag} strokeWidth={4} opacity={0.75 - i * 0.12} filter="url(#glow)" />)}
		<Lab x={440} y={250} t="左耳 363 Hz" s={52} c={C.cyan} /><Lab x={1480} y={250} t="右耳 369 Hz" s={52} c={C.mag} />
		<Head x={960} y={440} s={1.15} />
		{[0, 1, 2].map((i) => <ellipse key={i} cx={960} cy={440} rx={40 + i * 26} ry={48 + i * 30} fill="none" stroke={C.gold} strokeWidth={5 - i} opacity={0.8 - i * 0.22} filter="url(#glow)" />)}
		<Lab x={960} y={690} t="6 Hz：只在你脑子里" s={52} c={C.gold} />
	</Frame>
);
const K7 = () => (
	<Frame sub="声音在左边 ←">
		<Air n={900} seed={7} o={0.5} />
		<g filter="url(#glow2)"><path d="M 1400 420 L 760 420 L 760 300 L 480 470 L 760 640 L 760 520 L 1400 520 Z" fill={C.ink} opacity={0.95} /></g>
		<Lab x={960} y={200} t="声音在左边" s={96} c={C.ink} w={900} />
	</Frame>
);
const K8 = () => {
	const arcs: React.ReactNode[] = [];
	for (let i = 0; i < 16; i++) {
		const y = 820 - i * 52, r = 230 + i * 10, o = 0.95 - i * 0.05;
		arcs.push(<ellipse key={i} cx={960} cy={y} rx={r} ry={r * 0.22} fill="none" stroke={i % 2 ? C.mag : C.cyan} strokeWidth={4} opacity={Math.max(0.1, o)} filter="url(#glow)" strokeDasharray={`${400 + i * 20} 300`} strokeDashoffset={i * 90} />);
	}
	const trail: React.ReactNode[] = [];
	for (let i = 0; i < 70; i++) { const a = i * 0.13; trail.push(<circle key={i} cx={960 + Math.cos(a) * 330} cy={470 + Math.sin(a) * 120} r={9 - i * 0.11} fill={C.gold} opacity={1 - i / 70} filter="url(#glow)" />); }
	return (
		<Frame sub="整首歌绕着你转——" tint="#160f30">
			<Air n={1600} seed={8} o={0.7} col={(x, y) => (Math.hypot(x - 960, (y - 470) * 2.5) < 420 ? C.gold : C.ink)} />
			{arcs}{trail}
			<Head x={960} y={470} s={0.8} />
			<Lab x={960} y={150} t="永远上升的音阶 ＋ 360° 旋转 ＋ 渐强" s={46} c={C.gold} />
		</Frame>
	);
};
const K9 = () => {
	const R = rng(9); const burst: React.ReactNode[] = [];
	for (let i = 0; i < 520; i++) { const a = R() * Math.PI * 2, d = 120 + Math.pow(R(), 0.6) * 900; burst.push(<line key={i} x1={960 + Math.cos(a) * d} y1={480 + Math.sin(a) * d * 0.62} x2={960 + Math.cos(a) * (d + 30 + R() * 50)} y2={480 + Math.sin(a) * (d + 30 + R() * 50) * 0.62} stroke={i % 3 ? C.ink : C.gold} strokeWidth={2 + R() * 2} opacity={0.3 + R() * 0.6} />); }
	return (
		<Frame tint="#1d1440">
			{burst}
			{[0, 1].map((i) => <ellipse key={i} cx={960} cy={480} rx={520 + i * 260} ry={(520 + i * 260) * 0.62} fill="none" stroke={i ? C.mag : C.gold} strokeWidth={30 - i * 16} opacity={0.55 - i * 0.2} filter="url(#glow2)" />)}
			<circle cx={960} cy={480} r={180} fill={C.gold} opacity={0.18} filter="url(#soft)" />
			<text x={960 + 44} y={540} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 176, letterSpacing: '0.06em'}} fill={C.gold} filter="url(#glow)">为什么好听<tspan dx="0">？</tspan></text>
			<text x={960} y={330} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em'}} fill={C.gold}>{JUNO.series}</text>
		</Frame>
	);
};
const K10 = () => {
	let liss = '';
	for (let i = 0; i <= 720; i++) { const a = (i / 720) * Math.PI * 2; liss += `${i ? 'L' : 'M'} ${1500 + Math.sin(3 * a) * 210} ${450 + Math.sin(2 * a + Math.PI / 2) * 210} `; }
	return (
		<Frame sub="高音走三步，低音走两步，就对齐">
			<Air n={600} seed={10} o={0.5} />
			<path d={wave(140, 1100, 330, 70, 240)} fill="none" stroke={C.cyan} strokeWidth={6} filter="url(#glow)" />
			<path d={wave(140, 1100, 560, 70, 160)} fill="none" stroke={C.mag} strokeWidth={6} filter="url(#glow)" />
			{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={140 + i * 480 / 2} x2={140 + i * 480 / 2} y1={240} y2={650} stroke={C.gold} strokeWidth={i % 2 ? 0 : 4} strokeDasharray="10 10" opacity={0.85} />)}
			<Lab x={120} y={345} t="363" s={40} c={C.cyan} a="end" /><Lab x={120} y={575} t="545" s={40} c={C.mag} a="end" />
			<path d={liss} fill="none" stroke={C.gold} strokeWidth={5} filter="url(#glow2)" />
			<Lab x={1500} y={760} t="3 : 2" s={72} c={C.gold} />
		</Frame>
	);
};
const K11 = () => {
	const trail: React.ReactNode[] = [];
	for (let i = 0; i < 90; i++) { const a = -0.6 - i * 0.05; trail.push(<circle key={i} cx={960 + Math.cos(a) * 420} cy={500 + Math.sin(a) * 160} r={10 - i * 0.1} fill="#9fc6ff" opacity={1 - i / 90} filter="url(#glow)" />); }
	const R = rng(11); const rain: React.ReactNode[] = [];
	for (let i = 0; i < 260; i++) { const x = R() * W, y = R() * H; rain.push(<line key={i} x1={x} y1={y} x2={x - 4} y2={y + 26 + R() * 30} stroke="#9fc6ff" strokeWidth={1.6} opacity={0.15 + R() * 0.35} />); }
	return (
		<Frame sub="再放慢一点——" tint="#0d1a2e">
			{rain}{trail}
			<Head x={960} y={500} s={0.9} l="#9fc6ff" r="#9fc6ff" lo={0.6} ro={0.6} />
			<Lab x={960} y={200} t="−2 个半音 · 每 8 秒绕一圈" s={46} c="#9fc6ff" />
		</Frame>
	);
};
const K12 = () => {
	const R = rng(12); const sph: React.ReactNode[] = [];
	for (let i = 0; i < 900; i++) { const a = R() * Math.PI * 2, b = Math.acos(2 * R() - 1), r = 330 + R() * 30; const x = 960 + r * Math.sin(b) * Math.cos(a), y = 470 + r * Math.cos(b) * 0.9; sph.push(<circle key={i} cx={x} cy={y} r={1.5 + R() * 2.5} fill={[C.cyan, C.mag, C.gold, C.ink][i % 4]} opacity={0.3 + 0.6 * Math.abs(Math.sin(b))} />); }
	return (
		<Frame sub="正在你耳朵里，排成一首歌" tint="#141436">
			<Air n={600} seed={13} o={0.4} />
			{[0, 1, 2].map((i) => <ellipse key={i} cx={960} cy={470} rx={430 + i * 140} ry={(430 + i * 140) * 0.55} fill="none" stroke={C.gold} strokeWidth={3} opacity={0.35 - i * 0.1} />)}
			{sph}
			<Head x={960} y={480} s={0.75} />
		</Frame>
	);
};
const KEYS = [K1, K2, K3, K4, K5, K6, K7, K8, K9, K10, K11, K12];
const Keys: React.FC<{k: number}> = ({k}) => { const X = KEYS[k] ?? K1; return <X />; };
const Root: React.FC = () => <Composition id="KEYS29" component={Keys} durationInFrames={1} fps={30} width={W} height={H} defaultProps={{k: 0}} />;
registerRoot(Root);
