import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

/* ep31 《薄肌说明书》 — premium look test (10 s). One continuous "manual" canvas; the camera glides between sections
   with horizontal motion blur and parallax. Glass panels with light sweeps, serif titles, floating bokeh.
   The hero: a torso drawn as a ridgeline body scan — fat smooths the relief, muscle deepens it; as fat drops the abs rise. */
const FPS = 30, W = 1920, H = 1080;
const C = {bg: '#081127', bg2: '#0c1834', cy: '#6ee7ef', gold: '#f5c76b', ink: '#eef6ff', dim: 'rgba(220,235,255,0.55)', red: '#ff8080', line: 'rgba(140,210,255,0.28)'};
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';
const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const io = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);        // ease in-out cubic
const out3 = (u: number) => 1 - Math.pow(1 - u, 3);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const g = (x: number, y: number, cx: number, cy: number, sx: number, sy: number, a: number) => a * Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));

// ---------------------------------------------------------------- the torso scan (identity-free, no head)
const halfW = (y: number) => (y > 0.95 ? 0.32 : y > 0.8 ? mix(1.04, 0.32, (y - 0.8) / 0.15) : y > 0.25 ? mix(0.93, 1.04, (y - 0.25) / 0.55) : mix(0.64, 0.93, (y + 1.25) / 1.5));
const torsoZ = (x: number, y: number, m: number, f: number) => {
	const hw = halfW(y) * (1 + 0.12 * f), u = x / hw;
	if (Math.abs(u) >= 1 || y > 1.12 || y < -1.25) return 0;
	const base = Math.sqrt(1 - u * u) * 0.42;
	let D = 0;
	for (const s of [-1, 1]) {
		D += g(x, y, s * 0.42, 0.42, 0.34, 0.19, 0.17);                       // pecs
		D += g(x, y, s * 0.96, 0.72, 0.17, 0.17, 0.12);                       // delts
		D -= g(x, y, s * 0.42, 0.83, 0.3, 0.035, 0.04);                       // clavicles
		D += g(x, y, s * 0.64, -0.22, 0.09, 0.32, 0.05);                      // serratus / obliques
		for (const ay of [0.02, -0.3, -0.6]) D += g(x, y, s * 0.15, ay, 0.105, 0.115, 0.075);   // abs
		D += g(x, y, s * 0.14, -0.88, 0.1, 0.12, 0.04);
	}
	D -= g(x, y, 0, -0.38, 0.028, 0.75, 0.05);                                 // linea alba
	const F = g(x, y, 0, -0.55, 0.78, 0.55, 0.2) + 0.04;                       // the fat layer: a smooth belly + thickness
	return 0.75 * base + 2.8 * m * (1 - 0.9 * f) * D + f * F;
};
const Torso: React.FC<{cx: number; cy: number; s: number; m: number; f: number; t: number}> = ({cx, cy, s, m, f, t}) => {
	// ridgeline body scan: each row is a horizontal slice lifted by the surface height; only the part inside the body is drawn
	const rows = 54, cols = 160, y0 = 1.02, y1 = -1.25, amp = 0.42 * s, H2 = s * 2.4;
	const paths: React.ReactNode[] = [];
	for (let r = 0; r < rows; r++) {
		const y = mix(y0, y1, r / (rows - 1)), py = cy - H2 / 2 + (r / (rows - 1)) * H2;
		const hw = halfW(y) * (1 + 0.12 * f);
		let d = '', fill = '', first = true, lx = 0, rx = 0;
		for (let c = 0; c <= cols; c++) {
			const x = mix(-hw, hw, c / cols), z = torsoZ(x * 0.999, y, m, f) * 1.0;
			const X = cx + x * s, Y = py - z * amp;
			d += `${first ? 'M' : 'L'}${X.toFixed(1)},${Y.toFixed(1)}`; first = false;
			if (c === 0) lx = X; if (c === cols) rx = X;
		}
		fill = d + `L${rx.toFixed(1)},${(py + 30).toFixed(1)}L${lx.toFixed(1)},${(py + 30).toFixed(1)}Z`;
		const scan = Math.exp(-Math.pow(((r / rows) - ((t * 0.35) % 1.4 - 0.2)) / 0.06, 2));
		const edge = 0.5 + 0.5 * Math.sin(Math.PI * r / (rows - 1));
		paths.push(<g key={r}>
			<path d={fill} fill={C.bg} />
			<path d={d} fill="none" stroke={C.cy} strokeWidth={7} opacity={(0.06 + 0.22 * scan) * edge} strokeLinecap="round" />
			<path d={d} fill="none" stroke={C.cy} strokeWidth={1.9} opacity={(0.5 + 0.5 * scan) * (0.55 + 0.45 * edge)} strokeLinecap="round" />
		</g>);
	}
	return <g>{paths}</g>;
};
// ---------------------------------------------------------------- glass panel with a light sweep
const Glass: React.FC<{x: number; y: number; w: number; h: number; sweep: number; id: string; children?: React.ReactNode}> = ({x, y, w, h, sweep, id, children}) => (
	<g>
		<defs>
			<linearGradient id={`gl${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(255,255,255,0.09)" /><stop offset="1" stopColor="rgba(255,255,255,0.02)" /></linearGradient>
			<linearGradient id={`sw${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="rgba(255,255,255,0)" /><stop offset="0.5" stopColor="rgba(255,255,255,0.16)" /><stop offset="1" stopColor="rgba(255,255,255,0)" /></linearGradient>
			<clipPath id={`cp${id}`}><rect x={x} y={y} width={w} height={h} rx={28} /></clipPath>
		</defs>
		<rect x={x + 10} y={y + 26} width={w} height={h} rx={28} fill="rgba(0,0,0,0.35)" filter="url(#soft)" />
		<rect x={x} y={y} width={w} height={h} rx={28} fill={`url(#gl${id})`} stroke="rgba(160,225,255,0.32)" strokeWidth={1.5} />
		<rect x={x + 1} y={y + 1} width={w - 2} height={2} rx={1} fill="rgba(255,255,255,0.22)" />
		<g clipPath={`url(#cp${id})`}><rect x={x - w * 0.6 + sweep * w * 2.2} y={y - 50} width={w * 0.35} height={h + 100} fill={`url(#sw${id})`} transform={`skewX(-18)`} /></g>
		{children}
	</g>
);
const T: React.FC<{x: number; y: number; t: string; s?: number; c?: string; f?: string; w?: number; a?: 'start' | 'middle' | 'end'; o?: number; ls?: number}> = ({x, y, t, s = 40, c = C.ink, f = SANS, w = 700, a = 'middle', o = 1, ls = 0.02}) =>
	o > 0.001 ? <text x={x} y={y} textAnchor={a} opacity={o} style={{fontFamily: f, fontWeight: w, fontSize: s, letterSpacing: `${ls}em`}} fill={c}>{t}</text> : null;

const Test: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	// camera on the world canvas: three stations, glides between them on downbeats (0.3 s = the drum hit in the film)
	const st = [{x: 960, s: 1.0}, {x: 3160, s: 1.0}, {x: 5360, s: 1.0}];
	const g1 = io(lin(t, 2.4, 3.3)), g2 = io(lin(t, 5.6, 6.5));
	const camX = mix(mix(st[0].x, st[1].x, g1), st[2].x, g2);
	const vel = Math.abs((mix(mix(st[0].x, st[1].x, io(lin(t + 1 / FPS, 2.4, 3.3))), st[2].x, io(lin(t + 1 / FPS, 5.6, 6.5)))) - camX);
	const push = 1 + 0.035 * ((t % 3.2) / 3.2) + 0.05 * Math.sin(Math.PI * g1) * 0 ;
	const drop = out3(lin(t, 0.3, 0.75)), shake = t > 0.3 && t < 0.62 ? Math.sin(t * 90) * 8 * (1 - lin(t, 0.3, 0.62)) : 0;
	// bokeh (parallax 0.35)
	let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
	const bok = Array.from({length: 40}, () => ({x: rnd() * 7200 - 300, y: rnd() * H, r: 6 + rnd() * 30, o: 0.05 + rnd() * 0.12, sp: 0.2 + rnd() * 0.5}));
	const fat = mix(1, 0.12, io(lin(t, 6.9, 9.2))), mus = mix(0.75, 1, io(lin(t, 6.9, 9.2)));
	const bf = Math.round(mix(25, 12, io(lin(t, 6.9, 9.2))));
	const sub = t < 2.3 ? '' : t < 5.5 ? '先翻译：薄肌＝体脂低，肌肉刚好' : '只做两件事：长一点肌肉，降一点体脂';
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${C.bg2} 0%, ${C.bg} 60%, #050a18 100%)`}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<defs>
					<filter id="soft"><feGaussianBlur stdDeviation="22" /></filter>
					<filter id="bok"><feGaussianBlur stdDeviation="6" /></filter>
					<filter id="mb" x="-5%" y="0" width="110%" height="100%"><feGaussianBlur stdDeviation={`${Math.min(40, vel * 0.55).toFixed(1)} 0`} /></filter>
				</defs>
				{/* far layer: bokeh, slow parallax */}
				<g transform={`translate(${-(camX - 960) * 0.35} 0)`} filter="url(#bok)">
					{bok.map((b, i) => <circle key={i} cx={b.x} cy={b.y + Math.sin(t * b.sp + i) * 14} r={b.r} fill={i % 5 ? C.cy : C.gold} opacity={b.o} />)}
				</g>
				{/* the world canvas */}
				<g filter={vel > 0.5 ? 'url(#mb)' : undefined} transform={`translate(${960 + shake} 540) scale(${push}) translate(${-camX} -540)`}>
					{/* faint blueprint grid, full width */}
					{Array.from({length: 150}, (_, i) => <line key={'v' + i} x1={i * 48 - 200} y1={-200} x2={i * 48 - 200} y2={H + 200} stroke="rgba(120,170,255,0.05)" />)}
					{Array.from({length: 30}, (_, i) => <line key={'h' + i} x1={-200} y1={i * 48 - 200} x2={7400} y2={i * 48 - 200} stroke="rgba(120,170,255,0.05)" />)}
					{/* station 1 · the manual cover (drops on the drum hit) */}
					<g transform={`translate(0 ${(1 - drop) * -140}) `} opacity={drop}>
						<g transform={`translate(960 520) scale(${mix(1.12, 1, drop)}) translate(-960 -520)`}>
							<Glass x={560} y={150} w={800} h={740} sweep={lin(t, 0.55, 1.5)} id="c">
								<T x={960} y={238} t="MANUAL · 使用说明" s={28} c={C.dim} w={400} ls={0.35} />
								<line x1={760} y1={268} x2={1160} y2={268} stroke="rgba(160,225,255,0.25)" />
								<T x={960} y={520} t="薄肌" s={250} c={C.ink} f={SERIF} w={900} ls={0.06} />
								<T x={960} y={665} t="说 明 书" s={86} c={C.cy} f={SERIF} w={700} ls={0.3} />
								<line x1={760} y1={735} x2={1160} y2={735} stroke="rgba(160,225,255,0.25)" />
								<T x={960} y={790} t="型号 · 薄肌　　适用 · 普通人　　无需用药" s={26} c={C.dim} w={400} ls={0.12} />
								<T x={960} y={840} t="VOL. 31" s={22} c={C.gold} w={500} ls={0.4} />
							</Glass>
						</g>
					</g>
					{/* station 2 · the grid */}
					<Glass x={2300} y={170} w={1720} h={700} sweep={lin(t, 3.2, 4.4)} id="g">
						{(() => { const ox = 2440, oy = 800, gw = 1440, gh = 560, k = io(lin(t, 3.0, 3.8));
							return <g>
								<line x1={ox} y1={oy} x2={ox + gw * k} y2={oy} stroke={C.ink} strokeWidth={2} opacity={0.7} />
								<line x1={ox} y1={oy} x2={ox} y2={oy - gh * k} stroke={C.ink} strokeWidth={2} opacity={0.7} />
								<T x={ox + gw} y={oy + 46} t="体脂率 →" s={30} c={C.dim} a="end" w={500} />
								<T x={ox - 24} y={oy - gh + 10} t="肌肉量" s={30} c={C.dim} a="end" w={500} />
								<line x1={ox} y1={oy - gh + 60} x2={ox + gw * io(lin(t, 3.6, 4.4))} y2={oy - gh + 60} stroke={C.red} strokeWidth={2.5} strokeDasharray="14 12" />
								<T x={ox + gw} y={oy - gh + 40} t="天花板 · FFMI 25　再往上：药" s={28} c={C.red} a="end" w={500} o={lin(t, 4.1, 4.5)} />
								<rect x={ox + 70} y={oy - 380} width={420} height={250} rx={24} fill="rgba(110,231,239,0.10)" stroke={C.cy} strokeWidth={2} opacity={io(lin(t, 4.0, 4.6))} />
								<T x={ox + 280} y={oy - 232} t="薄肌" s={84} c={C.cy} f={SERIF} w={900} o={io(lin(t, 4.1, 4.7))} />
								<circle cx={ox + mix(1200, 300, io(lin(t, 4.4, 5.3)))} cy={oy - mix(120, 300, io(lin(t, 4.4, 5.3)))} r={16} fill={C.gold} opacity={lin(t, 4.3, 4.5)} />
								<circle cx={ox + mix(1200, 300, io(lin(t, 4.4, 5.3)))} cy={oy - mix(120, 300, io(lin(t, 4.4, 5.3)))} r={34} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.4 * lin(t, 4.3, 4.5)} />
							</g>; })()}
					</Glass>
					{/* station 3 · the torso scan */}
					<Torso cx={5120} cy={500} s={300} m={mus} f={fat} t={t} />
					<Glass x={5820} y={300} w={460} h={430} sweep={lin(t, 6.6, 7.6)} id="t">
						<T x={6050} y={380} t="体脂率" s={30} c={C.dim} w={500} ls={0.2} />
						<T x={6050} y={520} t={`${bf}%`} s={130} c={C.gold} f={SERIF} w={900} />
						<T x={6050} y={610} t="肌肉 ↑　脂肪 ↓" s={34} c={C.cy} w={600} ls={0.1} />
						<T x={6050} y={680} t="腹肌，是降出来的" s={28} c={C.dim} w={500} />
					</Glass>
				</g>
			</svg>
			{/* subtitle + watermark (screen space) */}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 92, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 52, color: C.ink, textShadow: '0 2px 16px rgba(0,0,0,0.7)', opacity: sub ? 1 : 0, letterSpacing: '0.02em'}}>{sub}</div>
			<div style={{position: 'absolute', right: 42, top: 30, fontFamily: SANS, fontSize: 20, color: C.dim, letterSpacing: '0.2em'}}>Juno · VIBE知识大赏</div>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="TEST31" component={Test} durationInFrames={10 * FPS} fps={FPS} width={W} height={H} />;
registerRoot(Root);
