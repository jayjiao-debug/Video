import React from 'react';
import {AbsoluteFill, Composition, OffthreadVideo, Img, registerRoot, staticFile, useCurrentFrame, Sequence} from 'remotion';
import {EndCard} from '../brand/Brand';
import INTRO from './intro31.json';
import QENV from './quote_env.json';

/* ep31 《薄肌说明书》 (script v9, look "说明书": a premium manual on one continuous canvas).
   0–14.5 s the owner's 薄肌 montage (intro v4, zoom-cropped to hide the source's burned-in subtitles) → the question
   → title on the drum hit at 17.0 (the BGM enters at its 16.616 s drum, so every downbeat is 17.0 + k·2.025 s).
   The camera glides between stations on downbeats (horizontal motion blur, bokeh parallax). Glass panels, serif display
   type, one idea per station, big numbers, a step tracker top-left. Hero: a ridgeline body scan — fat smooths it,
   muscle deepens it, the abs rise as fat drops. Original-voice quotes appear as a picture-in-picture with a live waveform. */
const FPS = 30, W = 1920, H = 1080, BAR = 2.025, DB0 = 17.0;
const db = (k: number) => DB0 + k * BAR;                                  // film downbeat k
const END = 128.4, CARD = 126.4;
const C = {bg: '#081127', bg2: '#0c1834', cy: '#6ee7ef', gold: '#f5c76b', ink: '#eef6ff', dim: 'rgba(220,235,255,0.58)', faint: 'rgba(220,235,255,0.32)', red: '#ff8a80', pale: '#b9c8e6', green: '#7ef0b0'};
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';
const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const io = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const out3 = (u: number) => 1 - Math.pow(1 - u, 3);
const ea = (t: number, a: number, d = 0.6) => out3(lin(t, a, a + d));      // ease-out from a over d
const ei = (t: number, a: number, d = 0.8) => io(lin(t, a, a + d));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const g = (x: number, y: number, cx: number, cy: number, sx: number, sy: number, a: number) => a * Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));
const pop = (t: number, a: number) => (t < a ? 0 : 1);                                       // owner: assets stay fixed (no scale pops)

// ---------------------------------------------------------------- lines (subtitles) — script v10: 孙宇晨's own plan, scored step by step
type L = [number, number, string, ('q' | undefined)?];
const LINES: L[] = [
	[19.1, 21.9, '先翻译：薄肌＝体脂低，肌肉刚好'], [22.0, 24.9, '好消息：不用药，普通人也练得到'], [25.1, 28.9, '只做两件事：长一点肌肉，降一点体脂'],
	[29.3, 32.3, '孙宇晨刚开始练，播客里讲了他的方案'], [32.4, 35.1, '我们拿论文，逐条打分'],
	[35.5, 39.8, '「训练日和非训练日，是刚好一天交叉一次的」', 'q'], [40.0, 43.2, '论文说：每个部位每周10组，分两天练更好'], [43.3, 46.6, '练完后肌肉合成升高一天多，36小时左右回落'], [46.7, 49.3, '所以隔天练，正好接上 ✓'],
	[49.6, 52.1, '「加一点，对吧？再加一点啊，加一点」', 'q'], [52.3, 55.3, '这叫渐进超负荷：每次比上次多一点 ✓'], [55.4, 59.3, '重量不用很重，练到接近力竭就行'],
	[59.7, 63.15, '「现在定的140吧，150克蛋白质」', 'q'], [63.3, 66.4, '论文说：每公斤体重1.6克就够，再多也不多长'], [66.5, 69.4, '150克，够一个约94公斤的人 ✓'], [69.5, 73.5, '最好分成4顿，每顿30多克'],
	[73.9, 77.85, '「600卡以内，就说是燃烧脂肪」', 'q'], [78.0, 81.6, '每天缺600卡，一周大约减半公斤'], [81.7, 85.7, '正好是"慢慢减"：研究里这样减的那组，瘦体重还涨了2% ✓'],
	[86.0, 87.5, '「同时增肌减脂」', 'q'], [87.7, 89.8, '新手确实做得到 ✓'], [89.9, 93.8, '腹肌就是这样"降"出来的，不是卷出来的'],
	[94.1, 97.7, '「就是抓一下这个睡眠的指标」', 'q'], [97.9, 101.0, '同样节食，每晚少睡3小时'], [101.1, 104.4, '脂肪少减一半，瘦肉多掉六成'], [104.5, 106.0, '睡眠，确实值得盯 ✓'],
	[106.2, 107.9, '最后：什么时候开始？'], [108.0, 109.8, '「你七十岁再练来不及了呀」', 'q'], [110.2, 112.4, '这句不对：90岁都来得及'], [112.5, 116.1, '10位约90岁的老人练了8周，力量涨了174%'],
	[116.3, 120.1, '只是越早开始，存得越多'], [120.4, 122.4, '所以，薄肌没有玄学'], [122.5, 126.3, '就这五行，收好这本说明书'],
];
// original-voice quotes: [film in, film out, still, label]  (QA–QF are 孙宇晨 describing his routine, podcast 03:03–04:53)
const SUN = '孙宇晨 · 播客原声';
const QUOTES: Record<string, [number, number, string, string]> = {
	QA: [35.5, 39.8, 'S.jpg', SUN], QB: [49.6, 52.1, 'S.jpg', SUN], QC: [59.7, 63.15, 'S.jpg', SUN], QD: [73.9, 77.85, 'S.jpg', SUN],
	QE: [86.0, 87.48, 'S.jpg', SUN], QF: [94.1, 97.68, 'S.jpg', SUN], Q2: [108.0, 109.78, 'Q2.jpg', '播客原声'],
};

// ---------------------------------------------------------------- stations & camera (the camera only glides; nothing zooms)
const SX = (i: number) => i * 2400 + 960;
const KEYS: [number, number][] = [[17.0, 0], [db(1), 1], [db(4), 2], [db(6), 3], [db(9), 4], [db(16), 5], [db(21), 6], [db(28), 7], [db(34), 8], [db(38), 9], [db(44), 10], [db(49), 11], [db(51), 12]];
const NST = 13;
const GLIDE = 0.85;
const camAt = (t: number) => {
	let x = SX(0);
	for (let k = 1; k < KEYS.length; k++) { const [tk, i] = KEYS[k], [, ip] = KEYS[k - 1]; if (t >= tk) x = mix(SX(ip), SX(i), io(lin(t, tk, tk + GLIDE))); }
	return x;
};
const STEP_AT: [number, number][] = [[db(9), 0], [db(21), 1], [db(28), 2], [db(38), 3], [db(44), 4]];
const STEPS = ['练', '吃', '减', '睡', '开始'];

// ---------------------------------------------------------------- shared pieces
const T: React.FC<{x: number; y: number; t: string; s?: number; c?: string; f?: string; w?: number; a?: 'start' | 'middle' | 'end'; o?: number; ls?: number}> = ({x, y, t, s = 40, c = C.ink, f = SANS, w = 700, a = 'middle', o = 1, ls = 0.02}) =>
	o > 0.001 ? <text x={x} y={y} textAnchor={a} opacity={o} style={{fontFamily: f, fontWeight: w, fontSize: s, letterSpacing: `${ls}em`}} fill={c}>{t}</text> : null;
let gid = 0;
const Glass: React.FC<{x: number; y: number; w: number; h: number; sweep?: number; o?: number; children?: React.ReactNode; r?: number}> = ({x, y, w, h, sweep = -1, o = 1, children, r = 26}) => {
	const id = `g${x | 0}_${y | 0}_${w | 0}`;
	if (o <= 0.001) return null;
	return (
		<g opacity={o}>
			<defs>
				<linearGradient id={`gl${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(255,255,255,0.085)" /><stop offset="1" stopColor="rgba(255,255,255,0.018)" /></linearGradient>
				<linearGradient id={`sw${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="rgba(255,255,255,0)" /><stop offset="0.5" stopColor="rgba(255,255,255,0.15)" /><stop offset="1" stopColor="rgba(255,255,255,0)" /></linearGradient>
				<clipPath id={`cp${id}`}><rect x={x} y={y} width={w} height={h} rx={r} /></clipPath>
			</defs>
			<rect x={x + 8} y={y + 22} width={w} height={h} rx={r} fill="rgba(0,0,0,0.32)" filter="url(#soft)" />
			<rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#gl${id})`} stroke="rgba(160,225,255,0.30)" strokeWidth={1.5} />
			<rect x={x + r} y={y + 1} width={w - 2 * r} height={1.6} fill="rgba(255,255,255,0.25)" />
			{sweep >= 0 && sweep <= 1 && <g clipPath={`url(#cp${id})`}><rect x={x - w * 0.6 + sweep * w * 2.2} y={y - 60} width={w * 0.32} height={h + 120} fill={`url(#sw${id})`} transform="skewX(-18)" /></g>}
			{children}
		</g>
	);
};
const StepHead: React.FC<{x: number; y: number; n: string; t: string; o: number}> = ({x, y, n, t, o}) => (
	<g opacity={o}>
		<T x={x} y={y} t={n} s={92} c={C.cy} f={SERIF} w={900} a="start" />
		<T x={x + 150} y={y - 6} t={t} s={64} c={C.ink} f={SERIF} w={900} a="start" ls={0.08} />
		<line x1={x} y1={y + 34} x2={x + 520} y2={y + 34} stroke="rgba(160,225,255,0.3)" strokeWidth={1.5} />
	</g>
);
const Bar: React.FC<{x: number; base: number; w: number; h: number; c: string; label?: string; val?: string; o?: number; vc?: string}> = ({x, base, w, h, c, label, val, o = 1, vc}) => (
	<g opacity={o}>
		<rect x={x} y={base - h} width={w} height={Math.max(0, h)} rx={12} fill={c} />
		{val && <T x={x + w / 2} y={base - h - 22} t={val} s={44} c={vc || c} f={SERIF} w={900} />}
		{label && <T x={x + w / 2} y={base + 46} t={label} s={30} c={C.dim} w={500} />}
	</g>
);

// ---------------------------------------------------------------- the torso scan
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
// a tiny friendly figure for "10 位约 90 岁的老人" (no face)
const Elder: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
	<g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
		<circle cx={0} cy={-120} r={30} fill={C.pale} /><path d="M-30,-128 A30,30 0 0 1 30,-128" fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" />
		<rect x={-38} y={-82} width={76} height={110} rx={30} fill={C.pale} /><rect x={-30} y={30} width={24} height={86} rx={12} fill={C.pale} /><rect x={6} y={30} width={24} height={86} rx={12} fill={C.pale} />
	</g>
);

// ---------------------------------------------------------------- stations (each draws around its centre cx; t = film time)
const Check: React.FC<{x: number; y: number; o: number; s?: number; ok?: boolean}> = ({x, y, o, s = 1, ok = true}) => (
	<g opacity={o} transform={`translate(${x} ${y})`}>
		<circle cx={0} cy={0} r={34 * s} fill={ok ? 'rgba(126,240,176,0.16)' : 'rgba(255,138,128,0.16)'} stroke={ok ? C.green : C.red} strokeWidth={3} />
		<T x={0} y={14 * s} t={ok ? '✓' : '✗'} s={40 * s} c={ok ? C.green : C.red} w={900} />
	</g>
);
const Station: React.FC<{i: number; t: number}> = ({i, t}) => {
	const cx = SX(i), L = cx - 960;
	switch (i) {
		case 0: { // the manual cover, drops on the drum hit (slides, no zoom)
			const d = ea(t, 17.0, 0.45), shake = t > 17 && t < 17.35 ? Math.sin(t * 95) * 7 * (1 - lin(t, 17, 17.35)) : 0;
			return <g opacity={d} transform={`translate(${shake} ${(1 - d) * -60})`}>
				<Glass x={L + 560} y={150} w={800} h={740} sweep={lin(t, 17.25, 18.3)}>
					<T x={cx} y={240} t="MANUAL · 使用说明" s={28} c={C.dim} w={400} ls={0.35} />
					<line x1={cx - 200} y1={270} x2={cx + 200} y2={270} stroke="rgba(160,225,255,0.25)" />
					<T x={cx} y={530} t="薄肌" s={250} c={C.ink} f={SERIF} w={900} ls={0.06} />
					<T x={cx} y={672} t="说 明 书" s={86} c={C.cy} f={SERIF} w={700} ls={0.3} />
					<line x1={cx - 200} y1={742} x2={cx + 200} y2={742} stroke="rgba(160,225,255,0.25)" />
					<T x={cx} y={800} t="型号 · 薄肌　　适用 · 普通人　　无需用药" s={26} c={C.dim} w={400} ls={0.12} />
				</Glass>
			</g>;
		}
		case 1: { // what 薄肌 means, and the drug-free ceiling
			const ox = L + 360, oy = 800, gw = 1240, gh = 560, k = ei(t, 19.2, 0.8);
			const dk = ei(t, 20.4, 1.0), dx = ox + mix(1050, 445, dk), dy = oy - mix(110, 345, dk);
			return <Glass x={L + 220} y={150} w={1480} h={760} sweep={lin(t, 19.6, 20.8)} o={ea(t, 19.0, 0.4)}>
				<line x1={ox} y1={oy} x2={ox + gw * k} y2={oy} stroke={C.ink} strokeWidth={2} opacity={0.75} />
				<line x1={ox} y1={oy} x2={ox} y2={oy - gh * k} stroke={C.ink} strokeWidth={2} opacity={0.75} />
				<T x={ox + gw} y={oy + 54} t="体脂率　低 ← → 高" s={36} c={C.dim} a="end" w={600} o={k} />
				<T x={ox - 26} y={oy - gh + 12} t="肌肉量" s={36} c={C.dim} a="end" w={600} o={k} />
				<rect x={ox + 70} y={oy - 390} width={430} height={250} rx={24} fill="rgba(110,231,239,0.10)" stroke={C.cy} strokeWidth={2} opacity={ei(t, 19.9, 0.6)} />
				<T x={ox + 285} y={oy - 238} t="薄肌" s={84} c={C.cy} f={SERIF} w={900} o={ei(t, 20.0, 0.6)} />
				<T x={ox + 285} y={oy - 178} t="体脂低 · 肌肉刚好" s={26} c={C.cy} w={500} o={ei(t, 20.2, 0.6)} />
				<line x1={ox} y1={oy - gh + 60} x2={ox + gw * ei(t, 22.0, 0.8)} y2={oy - gh + 60} stroke={C.red} strokeWidth={2.5} strokeDasharray="14 12" />
				<T x={ox + gw} y={oy - gh + 40} t="天花板：不用药，很难超过这条线（FFMI 25）" s={28} c={C.red} a="end" w={500} o={ea(t, 22.5, 0.5)} />
				<circle cx={dx} cy={dy} r={16} fill={C.gold} opacity={lin(t, 20.3, 20.5)} />
				<circle cx={dx} cy={dy} r={30 + 10 * Math.sin(t * 4)} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.4 * lin(t, 20.3, 20.5)} />
				<T x={ox + 540} y={dy + 12} t="← 普通人 ✓ 练得到" s={34} c={C.gold} a="start" w={700} o={ea(t, 23.0, 0.5)} />
			</Glass>;
		}
		case 2: case 8: { // the torso scan: fat down, muscle up
			const t0 = i === 2 ? 25.6 : 86.2, dur = i === 2 ? 3.0 : 6.0, f0 = i === 2 ? 1 : 0.9, m0 = i === 2 ? 0.7 : 0.9;
			const k = ei(t, t0, dur), fat = mix(f0, 0.13, k), mus = mix(m0, 1, k), bf = Math.round(mix(i === 2 ? 25 : 22, 12, k));
			return <g>
				<Torso cx={cx - 260} cy={500} s={300} m={mus} f={fat} t={t} />
				<Glass x={cx + 280} y={270} w={520} h={470} sweep={lin(t, t0 - 0.3, t0 + 0.8)} o={ea(t, t0 - 0.4, 0.5)}>
					<T x={cx + 540} y={350} t="体脂率" s={30} c={C.dim} w={500} ls={0.2} />
					<T x={cx + 540} y={500} t={`${bf}%`} s={140} c={C.gold} f={SERIF} w={900} />
					{i === 2 ? <><T x={cx + 540} y={590} t="长一点肌肉 ↑" s={36} c={C.cy} w={700} /><T x={cx + 540} y={650} t="降一点体脂 ↓" s={36} c={C.gold} w={700} /></>
						: <><T x={cx + 540} y={590} t="同时增肌减脂 ✓" s={36} c={C.green} w={700} /><T x={cx + 540} y={650} t="腹肌：是降出来的" s={30} c={C.dim} w={600} o={ea(t, 89.9, 0.4)} /></>}
				</Glass>
			</g>;
		}
		case 3: { // 孙宇晨's plan, as he described it — the four lines we will score
			const rows: [string, string][] = [['练', '隔天练，每次加一点'], ['吃', '每天 150 克蛋白质'], ['减', '每天热量缺口 600 卡以内'], ['睡', '戴戒指，盯睡眠']];
			return <Glass x={L + 360} y={160} w={1200} h={740} sweep={lin(t, 29.4, 30.4)} o={ea(t, 29.2, 0.4)}>
				<T x={cx} y={250} t="孙宇晨的薄肌方案" s={60} c={C.ink} f={SERIF} w={900} />
				<T x={cx} y={300} t="（播客里他自己讲的）" s={26} c={C.dim} w={500} />
				{rows.map(([a, b], j) => { const o = ea(t, 29.7 + j * BAR / 4, 0.4), y = 410 + j * 115;
					return <g key={a} opacity={o} transform={`translate(${(1 - o) * 30} 0)`}>
						<rect x={L + 470} y={y - 62} width={980} height={92} rx={18} fill="rgba(255,255,255,0.035)" stroke="rgba(160,225,255,0.18)" />
						<T x={L + 540} y={y} t={a} s={48} c={C.cy} f={SERIF} w={900} />
						<T x={L + 610} y={y - 2} t={b} s={40} c={C.ink} w={600} a="start" />
						<rect x={L + 1350} y={y - 42} width={60} height={52} rx={10} fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray="6 6" opacity={ea(t, 32.5, 0.4)} />
					</g>; })}
				<T x={L + 1380} y={360} t="论文打分" s={24} c={C.gold} w={700} o={ea(t, 32.5, 0.4)} />
			</Glass>;
		}
		case 4: { // 01 练 — 10 sets a week split over two days + the synthesis curve
			const days = ['一', '二', '三', '四', '五', '六', '日'], x0 = L + 230, dw = 210, split = ei(t, 41.5, 0.8);
			const blocks = Array.from({length: 10}, (_, b) => {
				const appear = ea(t, 40.1 + b * 0.08, 0.35), tgtDay = b < 5 ? 0 : 3;
				const x = mix(x0 + 520, x0 + tgtDay * dw + 20, split), y = mix(830 - b * 34, 640 - (b % 5) * 34, split);
				return <rect key={b} x={x} y={y - 26} width={150} height={26} rx={8} fill={C.cy} opacity={appear} />;
			});
			const ck = lin(t, 43.4, 46.4), pts: string[] = [];
			for (let n = 0; n <= 300; n++) {
				const u = n / 300; if (u > ck) break;
				const day = u * 7, x = x0 + day * dw; let v = 0;
				for (const s0 of [0.55, 3.55]) { const h = (day - s0) * 24; if (h > 0) v += h < 12 ? h / 12 : Math.exp(-Math.pow((h - 12) / 16, 2)); }
				pts.push(`${n ? 'L' : 'M'}${x.toFixed(1)},${(860 - 120 * v).toFixed(1)}`);
			}
			return <g>
				<StepHead x={L + 230} y={235} n="01" t="练" o={ea(t, 35.3, 0.5)} />
				{days.map((d, j) => <g key={j} opacity={ea(t, 39.9 + j * 0.04, 0.4)}>
					<rect x={x0 + j * dw} y={300} width={190} height={70} rx={14} fill={j === 0 || j === 3 ? `rgba(110,231,239,${0.12 * split})` : 'rgba(255,255,255,0.03)'} stroke="rgba(160,225,255,0.28)" />
					<T x={x0 + j * dw + 95} y={346} t={`周${d}`} s={32} c={(j === 0 || j === 3) && split > 0.5 ? C.cy : C.dim} w={600} />
				</g>)}
				{blocks}
				<T x={x0 + 595} y={880} t="本周 10 组" s={34} c={C.cy} w={700} o={ea(t, 40.6, 0.4) * (1 - split)} />
				<T x={x0 + 95} y={700} t="5 组" s={34} c={C.cy} w={800} o={split} />
				<T x={x0 + 3 * dw + 95} y={700} t="5 组" s={34} c={C.cy} w={800} o={split} />
				<line x1={x0} y1={860} x2={x0 + 7 * dw - 20} y2={860} stroke="rgba(160,225,255,0.25)" opacity={lin(t, 43.3, 43.6)} />
				<path d={pts.join('')} fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" />
				<T x={x0 + 7 * dw - 20} y={760} t="肌肉合成" s={30} c={C.gold} a="end" w={700} o={lin(t, 43.6, 44.0)} />
				<g opacity={ea(t, 44.8, 0.5)}><line x1={x0 + 0.55 * dw} y1={880} x2={x0 + 2.05 * dw} y2={880} stroke={C.dim} strokeWidth={2} /><T x={x0 + 1.3 * dw} y={918} t="约 36 小时回落" s={28} c={C.dim} w={600} /></g>
				<Check x={x0 + 6.5 * dw} y={230} o={ea(t, 46.8, 0.3)} s={1.4} />
				<T x={x0 + 6.5 * dw - 60} y={244} t="隔天练" s={34} c={C.green} w={800} a="end" o={ea(t, 46.8, 0.3)} />
			</g>;
		}
		case 5: { // progressive overload + near failure
			const steps = Math.floor(cl((t - 52.4) / (BAR / 4), 0, 6));
			const reps = Math.min(12, Math.floor(lin(t, 55.6, 57.8) * 12.999)), fill = reps / 12;
			return <g>
				<Glass x={L + 1000} y={200} w={760} h={640} sweep={lin(t, 52.3, 53.3)} o={ea(t, 52.2, 0.4)}>
					{Array.from({length: 6}, (_, s) => <g key={s}>
						<rect x={L + 1070 + s * 105} y={760 - (s + 1) * 70} width={105} height={(s + 1) * 70} fill={s < steps ? 'rgba(110,231,239,0.22)' : 'rgba(255,255,255,0.04)'} stroke="rgba(160,225,255,0.3)" />
						<T x={L + 1122 + s * 105} y={745 - (s + 1) * 70} t="+1" s={26} c={s < steps ? C.cy : C.faint} w={700} />
					</g>)}
					<circle cx={L + 1122 + Math.max(0, steps - 1) * 105} cy={735 - Math.max(1, steps) * 70 - 40} r={16} fill={C.gold} opacity={steps > 0 ? 1 : 0} />
					<T x={L + 1380} y={300} t="渐进超负荷" s={44} c={C.ink} f={SERIF} w={900} />
					<T x={L + 1380} y={350} t="多 1 下，或多 1 公斤" s={28} c={C.dim} w={500} />
					<Check x={L + 1680} y={290} o={ea(t, 53.0, 0.3)} />
				</Glass>
				<Glass x={L + 160} y={200} w={760} h={640} sweep={lin(t, 55.5, 56.5)} o={ea(t, 55.3, 0.4)}>
					<g transform={`translate(${L + 420} 470)`}>
						<rect x={-150} y={-10} width={300} height={20} rx={10} fill={C.pale} />
						{[-1, 1].map((s) => <g key={s}><rect x={s * 150 - (s > 0 ? 0 : 36)} y={-55} width={36} height={110} rx={10} fill={C.cy} /><rect x={s * 190 - (s > 0 ? 0 : 22)} y={-38} width={22} height={76} rx={8} fill={C.cy} opacity={0.7} /></g>)}
					</g>
					<T x={L + 420} y={600} t="轻重量也行" s={40} c={C.ink} f={SERIF} w={900} />
					<rect x={L + 760} y={300} width={60} height={440} rx={30} fill="rgba(255,255,255,0.05)" stroke="rgba(160,225,255,0.3)" />
					<rect x={L + 760} y={740 - 440 * fill} width={60} height={440 * fill} rx={30} fill={fill > 0.8 ? C.red : C.cy} opacity={0.85} />
					<T x={L + 790} y={280} t="接近力竭" s={28} c={C.red} w={700} o={lin(fill, 0.75, 0.95)} />
					<T x={L + 420} y={720} t={`第 ${Math.max(1, reps)} 下`} s={36} c={C.gold} w={700} o={lin(t, 55.6, 55.8)} />
				</Glass>
			</g>;
		}
		case 6: { // 02 吃 — 1.6 g/kg plateau, 150 g fits ~94 kg, four meals
			const pk = ei(t, 63.4, 1.2), curve: string[] = [];
			for (let n = 0; n <= 100; n++) { const u = n / 100; if (u > pk) break; const v = u * 3 < 1.6 ? u * 3 / 1.6 : 1; curve.push(`${n ? 'L' : 'M'}${(L + 300 + u * 600).toFixed(1)},${(760 - 300 * Math.sqrt(v)).toFixed(1)}`); }
			return <g>
				<StepHead x={L + 230} y={235} n="02" t="吃" o={ea(t, 59.6, 0.5)} />
				<Glass x={L + 200} y={330} w={800} h={560} o={ea(t, 63.2, 0.4)}>
					<line x1={L + 300} y1={760} x2={L + 920} y2={760} stroke={C.pale} strokeWidth={2} opacity={0.7} />
					<line x1={L + 300} y1={760} x2={L + 300} y2={420} stroke={C.pale} strokeWidth={2} opacity={0.7} />
					<path d={curve.join('')} fill="none" stroke={C.cy} strokeWidth={5} strokeLinecap="round" />
					<line x1={L + 620} y1={430} x2={L + 620} y2={760} stroke={C.gold} strokeWidth={2} strokeDasharray="8 8" opacity={lin(t, 64.0, 64.4)} />
					<T x={L + 620} y={410} t="1.6 克 / 公斤" s={34} c={C.gold} w={800} o={lin(t, 64.0, 64.4)} />
					<T x={L + 800} y={440} t="再多，也不多长" s={28} c={C.dim} w={500} o={lin(t, 64.8, 65.2)} />
					<T x={L + 610} y={820} t="每天吃的蛋白质 →" s={26} c={C.dim} w={500} />
					<T x={L + 280} y={430} t="肌肉增长" s={26} c={C.dim} w={500} a="end" />
				</Glass>
				<g opacity={ea(t, 66.5, 0.5)}>
					<T x={L + 1440} y={420} t="150 克 ÷ 1.6" s={56} c={C.ink} f={SERIF} w={900} />
					<T x={L + 1440} y={530} t="≈ 94 公斤的人" s={70} c={C.gold} f={SERIF} w={900} />
					<Check x={L + 1760} y={410} o={ea(t, 67.0, 0.3)} />
				</g>
				{[0, 1, 2, 3].map((p) => { const a = ea(t, 69.6 + p * (BAR / 4), 0.35), x = L + 1140 + p * 200;
					return <g key={p} opacity={a} transform={`translate(${x} 730)`}>
						<circle cx={0} cy={0} r={82} fill="none" stroke={C.pale} strokeWidth={4} /><circle cx={0} cy={0} r={58} fill="rgba(255,255,255,0.04)" stroke="rgba(160,225,255,0.3)" />
						<T x={0} y={14} t="37克" s={36} c={C.cy} f={SERIF} w={900} /><T x={0} y={128} t={`第${'一二三四'[p]}顿`} s={26} c={C.dim} w={500} />
					</g>; })}
			</g>;
		}
		case 7: { // 03 减 — the deficit math, then slow vs fast
			const sk = ei(t, 81.9, 1.2);
			return <g>
				<StepHead x={L + 230} y={235} n="03" t="减" o={ea(t, 73.8, 0.5)} />
				<Glass x={L + 220} y={330} w={760} h={560} o={ea(t, 77.9, 0.4)}>
					<T x={L + 600} y={430} t="每天 −600 卡" s={56} c={C.ink} f={SERIF} w={900} />
					<T x={L + 600} y={520} t="× 7 天 = −4200 卡" s={44} c={C.dim} f={SERIF} w={700} o={ea(t, 78.6, 0.4)} />
					<line x1={L + 360} y1={570} x2={L + 840} y2={570} stroke="rgba(160,225,255,0.3)" opacity={ea(t, 79.2, 0.4)} />
					<T x={L + 600} y={680} t="≈ 半公斤脂肪 / 周" s={56} c={C.gold} f={SERIF} w={900} o={ea(t, 79.4, 0.4)} />
					<T x={L + 600} y={760} t="（1 公斤脂肪 ≈ 7700 卡，约数）" s={24} c={C.faint} w={500} o={ea(t, 79.6, 0.4)} />
				</Glass>
				<Glass x={L + 1060} y={330} w={660} h={560} o={ea(t, 81.7, 0.4)}>
					<T x={L + 1390} y={400} t="减重速度 vs 瘦体重" s={34} c={C.dim} w={600} />
					<rect x={L + 1170} y={790 - 230 * sk} width={160} height={230 * sk} rx={12} fill={C.cy} />
					<T x={L + 1250} y={770 - 230 * sk} t="+2%" s={56} c={C.cy} f={SERIF} w={900} o={lin(sk, 0.3, 0.7)} />
					<T x={L + 1250} y={840} t="慢：每周 −0.7%" s={26} c={C.cy} w={700} />
					<rect x={L + 1450} y={760} width={160} height={30} rx={12} fill="rgba(185,200,230,0.5)" opacity={sk} />
					<T x={L + 1530} y={735} t="基本没涨" s={34} c={C.pale} f={SERIF} w={900} o={sk} />
					<T x={L + 1530} y={840} t="快：每周 −1.4%" s={26} c={C.red} w={700} />
				</Glass>
			</g>;
		}
		case 9: { // 04 睡
			const k = ei(t, 101.2, 1.2);
			return <g>
				<StepHead x={L + 230} y={235} n="04" t="睡" o={ea(t, 94.0, 0.5)} />
				<T x={cx} y={340} t="同样节食两周 · 只改睡眠" s={34} c={C.dim} w={500} o={ea(t, 97.9, 0.4)} />
				{[0, 1].map((j) => { const x = L + 330 + j * 700, good = j === 0;
					return <Glass key={j} x={x} y={380} w={560} h={500} o={ea(t, 98.1 + j * 0.25, 0.4)}>
						<circle cx={x + 90} cy={450} r={26} fill={good ? C.cy : C.red} /><circle cx={x + 104} cy={440} r={24} fill={C.bg} />
						<T x={x + 140} y={464} t={good ? '每晚 8.5 小时' : '每晚 5.5 小时'} s={40} c={good ? C.cy : C.red} w={800} a="start" />
						<Bar x={x + 110} base={810} w={140} h={(good ? 1.4 : 0.6) * 100 * k} c={C.gold} val={`${good ? 1.4 : 0.6} kg`} label="减掉的脂肪" o={k > 0 ? 1 : 0} />
						<Bar x={x + 310} base={810} w={140} h={(good ? 1.5 : 2.4) * 100 * k} c={C.pale} val={`${good ? 1.5 : 2.4} kg`} label="掉的瘦肉" o={k > 0 ? 1 : 0} />
					</Glass>; })}
				<Check x={L + 1760} y={230} o={ea(t, 104.5, 0.3)} s={1.4} />
			</g>;
		}
		case 10: { // 05 什么时候开始 — 90-year-olds
			const k = ei(t, 112.6, 1.2);
			return <g>
				<StepHead x={L + 230} y={235} n="05" t="什么时候开始？" o={ea(t, 106.1, 0.5)} />
				<T x={cx} y={700} t="？" s={420} c="rgba(110,231,239,0.10)" f={SERIF} w={900} o={ea(t, 106.3, 0.6) * (1 - lin(t, 109.9, 110.3))} />
				<g opacity={ea(t, 110.2, 0.4)}>
					{Array.from({length: 10}, (_, j) => <Elder key={j} x={L + 300 + j * 82} y={640} s={0.62} o={ea(t, 110.3 + j * 0.05, 0.3)} />)}
					<T x={L + 670} y={780} t="10 位约 90 岁的老人 · 练 8 周" s={32} c={C.pale} w={600} />
				</g>
				<Glass x={L + 1160} y={300} w={560} h={600} o={ea(t, 112.4, 0.4)}>
					<Bar x={L + 1240} base={800} w={160} h={120} c="rgba(185,200,230,0.5)" label="练之前" />
					<Bar x={L + 1480} base={800} w={160} h={120 + 330 * k} c={C.gold} label="8 周后" val={k > 0.5 ? '+174%' : ''} />
				</Glass>
			</g>;
		}
		case 11: { // the earlier you start, the more you keep
			const k = ei(t, 116.4, 1.4), ages = [30, 40, 50, 60, 70, 80];
			const yA = (a: number, early: boolean) => 840 - 540 * (early ? 1 : 0.78) * Math.pow(0.86, (a - 30) / 10);
			const path = (early: boolean) => ages.map((a, j) => { const u = j / (ages.length - 1); if (u > k + 1e-6) return ''; return `${j ? 'L' : 'M'}${L + 360 + u * 1100},${yA(a, early).toFixed(1)}`; }).join('');
			return <Glass x={L + 220} y={170} w={1480} h={740} o={ea(t, 116.3, 0.4)}>
				<T x={cx} y={250} t="肌肉，从 30 岁到 80 岁" s={40} c={C.ink} f={SERIF} w={900} />
				<line x1={L + 360} y1={850} x2={L + 1460} y2={850} stroke={C.pale} strokeWidth={2} opacity={0.6} />
				{ages.map((a, j) => <T key={a} x={L + 360 + j * 220} y={893} t={`${a}岁`} s={28} c={C.dim} w={500} />)}
				<path d={path(true)} fill="none" stroke={C.cy} strokeWidth={6} strokeLinecap="round" />
				<path d={path(false)} fill="none" stroke="rgba(185,200,230,0.55)" strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" />
				<T x={L + 1480} y={yA(80, true) - 20} t="早开始" s={32} c={C.cy} w={800} a="end" o={lin(k, 0.9, 1)} />
				<T x={L + 1480} y={yA(80, false) + 46} t="晚开始" s={30} c={C.pale} w={600} a="end" o={lin(k, 0.9, 1)} />
				<T x={L + 800} y={(yA(50, true) + yA(50, false)) / 2 + 10} t="↕ 多存下的" s={32} c={C.gold} w={700} o={lin(k, 0.6, 0.9)} />
			</Glass>;
		}
		case 12: { // the outro: the manual, in five lines
			const rows = ['每个部位每周 10 组，隔天练', '每次多一点，练到接近力竭', '蛋白质每公斤 1.6 克，分 4 顿', '每天缺几百卡，慢慢减', '睡够；什么时候开始都不晚'];
			return <Glass x={L + 360} y={130} w={1200} h={790} sweep={lin(t, 120.5, 121.5)} o={ea(t, 120.3, 0.4)}>
				<T x={cx} y={235} t="薄 肌 说 明 书" s={64} c={C.ink} f={SERIF} w={900} ls={0.1} />
				<line x1={cx - 260} y1={270} x2={cx + 260} y2={270} stroke="rgba(160,225,255,0.3)" />
				{rows.map((r, j) => { const o = ea(t, 120.8 + j * BAR / 2, 0.4), y = 370 + j * 112;
					return <g key={j} opacity={o} transform={`translate(${(1 - o) * 30} 0)`}>
						<T x={L + 500} y={y} t={`${j + 1}`} s={56} c={C.cy} f={SERIF} w={900} />
						<T x={L + 570} y={y - 4} t={r} s={44} c={C.ink} w={700} a="start" />
						<Check x={L + 1450} y={y - 18} o={ea(t, 121.1 + j * BAR / 2, 0.3)} s={0.8} />
					</g>; })}
			</Glass>;
		}
	}
	return null;
};

// ---------------------------------------------------------------- the picture-in-picture for original-voice quotes
const QuotePip: React.FC<{t: number}> = ({t}) => {
	for (const [k, [a, b, img, label]] of Object.entries(QUOTES)) {
		if (t < a - 0.3 || t > b + 0.35) continue;
		const o = ea(t, a - 0.3, 0.3) * (1 - lin(t, b + 0.05, b + 0.35)), env = (QENV as any)[k] as number[];
		const fi = Math.floor((t - a) * 30);
		return <AbsoluteFill style={{opacity: o}}>
			<AbsoluteFill style={{background: 'rgba(4,9,22,0.72)'}} />
			<div style={{position: 'absolute', left: 560, top: 150, width: 800, height: 450, borderRadius: 26, overflow: 'hidden', border: '1.5px solid rgba(160,225,255,0.35)', boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
				<Img src={staticFile(`ep31/${img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) brightness(0.92)'}} />
				<div style={{position: 'absolute', left: 22, top: 18, padding: '6px 16px', borderRadius: 999, background: 'rgba(8,17,39,0.78)', color: C.gold, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em'}}>{label}</div>
			</div>
			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
				{Array.from({length: 48}, (_, j) => { const v = env[cl(fi - 24 + j, 0, env.length - 1)] ?? 0, h = 6 + 70 * v * (t >= a && t <= b ? 1 : 0.1);
					return <rect key={j} x={720 + j * 10} y={680 - h / 2} width={5} height={h} rx={2.5} fill={C.cy} opacity={j === 24 ? 1 : 0.6} />; })}
			</svg>
		</AbsoluteFill>;
	}
	return null;
};

// ---------------------------------------------------------------- the intro montage overlays
const Intro: React.FC<{t: number}> = ({t}) => {
	const cuts = (INTRO as any).cuts as number[], n = cuts.filter((c) => c <= t).length, last = cuts.length - 1;
	const slowed = n - 1 === last, c0 = cuts[Math.max(0, n - 1)];
	const late = cl((n - 18) / 12), jitter = late * 6;
	const jx = Math.sin(t * 61) * jitter, jy = Math.cos(t * 47) * jitter;
	const p = pop(t, c0);
	return <AbsoluteFill>
		{/* the source picture band only (y 12.5%–75% of the frame): a wide letterbox, so the burned-in subtitles below it never show */}
		<div style={{position: 'absolute', left: 0, top: (H - 675) / 2, width: W, height: 675, overflow: 'hidden', background: '#000'}}>
			<div style={{position: 'absolute', left: jx, top: -0.125 * H + jy, width: W, height: H, filter: slowed ? `saturate(${1 - 0.8 * lin(t, c0, c0 + 0.4)}) brightness(0.8)` : 'none'}}>
				<OffthreadVideo src={staticFile('ep31/intro.mp4')} muted style={{width: W, height: H}} />
			</div>
		</div>
		{slowed && <AbsoluteFill style={{background: `rgba(16,34,80,${0.4 * lin(t, c0, c0 + 0.4)})`}} />}
		
		{!slowed && <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 280, color: '#fff', letterSpacing: '0.04em', transform: `scale(${p})`,
			WebkitTextStroke: '10px rgba(8,17,39,0.9)', paintOrder: 'stroke fill', textShadow: `${3 * late}px 0 rgba(255,80,80,${0.7 * late}), ${-3 * late}px 0 rgba(80,240,255,${0.7 * late}), 0 10px 40px rgba(0,0,0,0.5)`} as any}>薄肌</div>}
		{!slowed && <div style={{position: 'absolute', right: 70, top: 56, fontFamily: SERIF, fontWeight: 900, fontSize: 68, color: C.gold, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}>×{n}</div>}
		
	</AbsoluteFill>;
};

// ---------------------------------------------------------------- the film
const Film: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const camX = camAt(t), vel = Math.abs(camAt(t + 1 / FPS) - camX);
	const push = 1;
	let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
	const bok = Array.from({length: 46}, () => ({x: rnd() * (SX(NST - 1) + 2400), y: rnd() * H, r: 6 + rnd() * 30, o: 0.04 + rnd() * 0.11, sp: 0.2 + rnd() * 0.5}));
	const line = LINES.find(([a, b]) => t >= a && t < b);
	const stepIdx = STEP_AT.filter(([a]) => t >= a).length - 1;
	const fadeEnd = lin(t, CARD - 1.2, CARD);
	const worldOn = t >= 16.95 && t < CARD;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${C.bg2} 0%, ${C.bg} 60%, #050a18 100%)`}}>
			{worldOn && <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{filter: fadeEnd > 0 ? `saturate(${1 - 0.7 * fadeEnd}) brightness(${1 - 0.35 * fadeEnd})` : undefined}}>
				<defs>
					<filter id="soft"><feGaussianBlur stdDeviation="22" /></filter>
					<filter id="bok"><feGaussianBlur stdDeviation="6" /></filter>
					<filter id="mb" x="-5%" y="0" width="110%" height="100%"><feGaussianBlur stdDeviation={`${Math.min(42, vel * 0.5).toFixed(1)} 0`} /></filter>
				</defs>
				<g transform={`translate(${-(camX - 960) * 0.35} 0)`} filter="url(#bok)">
					{bok.map((b, i) => <circle key={i} cx={b.x * 0.4} cy={b.y + Math.sin(t * b.sp + i) * 14} r={b.r} fill={i % 5 ? C.cy : C.gold} opacity={b.o} />)}
				</g>
				<g filter={vel > 0.5 ? 'url(#mb)' : undefined} transform={`translate(960 540) scale(${push}) translate(${-camX} -540)`}>
					{Array.from({length: Math.ceil(5200 / 48)}, (_, i) => { const x = Math.floor((camX - 2600) / 48) * 48 + i * 48; return <line key={'v' + i} x1={x} y1={-200} x2={x} y2={H + 200} stroke="rgba(120,170,255,0.045)" />; })}
					{Array.from({length: 30}, (_, i) => <line key={'h' + i} x1={camX - 2600} y1={i * 48 - 200} x2={camX + 2600} y2={i * 48 - 200} stroke="rgba(120,170,255,0.045)" />)}
					{Array.from({length: NST}, (_, i) => (Math.abs(SX(i) - camX) < 2700 ? <Station key={i} i={i} t={t} /> : null))}
				</g>
			</svg>}
			{t < 14.49 && <Intro t={t} />}
			{t >= 14.49 && t < 17.0 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{textAlign: 'center', fontFamily: SERIF, fontWeight: 900, color: C.ink, opacity: 1 - lin(t, 16.75, 17.0)}}>
					<div style={{fontSize: 56, color: C.dim, opacity: ea(t, 14.75, 0.4), letterSpacing: '0.12em'}}>今天我们就说说</div>
					<div style={{fontSize: 104, marginTop: 26, opacity: ea(t, 15.25, 0.45), transform: `translateY(${(1 - ea(t, 15.25, 0.45)) * 20}px)`, letterSpacing: '0.04em'}}>到底怎么才能练成<span style={{color: C.cy}}>薄肌</span></div>
				</div>
			</AbsoluteFill>}
			<QuotePip t={t} />
			{/* the step tracker */}
			{stepIdx >= 0 && t < CARD && <div style={{position: 'absolute', left: 48, top: 36, display: 'flex', gap: 10, opacity: ea(t, STEP_AT[0][0], 0.5) * (1 - fadeEnd)}}>
				{STEPS.map((s, j) => <div key={s} style={{padding: '8px 18px', borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.08em',
					color: j === stepIdx ? C.bg : j < stepIdx ? C.cy : C.faint, background: j === stepIdx ? C.cy : 'rgba(255,255,255,0.04)', border: `1.5px solid ${j <= stepIdx ? 'rgba(110,231,239,0.6)' : 'rgba(160,225,255,0.18)'}`}}>{`0${j + 1} ${s}`}</div>)}
			</div>}
			{line && t < CARD && <div style={{position: 'absolute', left: 120, right: 120, bottom: 70, textAlign: 'center', fontFamily: line[3] === 'q' ? SERIF : SANS, fontWeight: line[3] === 'q' ? 900 : 700, fontSize: line[3] === 'q' ? 50 : 52,
				color: line[3] === 'q' ? C.gold : C.ink, letterSpacing: '0.02em', textShadow: '0 2px 16px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)', opacity: ea(t, line[0], 0.15) * (1 - lin(t, line[1] - 0.12, line[1]))}}>{line[2]}</div>}
			{t >= 14.49 && t < CARD && <div style={{position: 'absolute', right: 42, top: 30, fontFamily: SANS, fontSize: 20, color: C.dim, letterSpacing: '0.2em'}}>Juno · VIBE知识大赏</div>}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)', pointerEvents: 'none'}} />
			<Sequence from={Math.round(CARD * FPS)}><EndCard speed={2.5} v={{id: 'ep31', src: '', title: '薄肌说明书', kicker: '', tagline: '', taglineEn: '', motif: 'wave', card: [0, 0], extend: 0, question: '你今天练了吗？评论区报个体脂',
				sources: '来源：Kouri 1995；Volpi 2004；Schoenfeld 2016, 2017；MacDougall 1995；Morton 2018 (BJSM)；Schoenfeld & Aragon 2018；Garthe 2011；Barakat 2020；Nedeltcheva 2010；Fiatarone 1990 (JAMA)；播客：邵艾伦×孙宇晨 2026', duration: 0} as any} cfg={{videos: []} as any} dur={Math.round((END - CARD) * FPS)} /></Sequence>
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM31" component={Film} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
