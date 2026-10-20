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
const END = 127.0, CARD = 125.0;
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
const pop = (t: number, a: number) => (t < a ? 0 : 1 + 0.14 * Math.exp(-(t - a) * 14) * Math.cos((t - a) * 20));   // scale pop on landing

// ---------------------------------------------------------------- lines (subtitles)
type L = [number, number, string, ('q' | undefined)?];
const LINES: L[] = [
	[19.1, 21.9, '先翻译：薄肌＝体脂低，肌肉刚好'], [22.0, 24.9, '好消息：不用药，普通人也练得到'], [25.1, 28.9, '只做两件事：长一点肌肉，降一点体脂'],
	[29.9, 33.0, '每个部位，一周练够10组'], [33.2, 36.1, '而且最好分两天练，别一次练完'], [36.3, 39.1, '因为练完之后，肌肉合成只升高一天多'], [39.3, 41.1, '36小时左右，就回落了'],
	[41.3, 44.2, '重量不用很重，练到接近力竭就行'], [44.4, 47.2, '每次，比上次多一点点'], [47.4, 49.2, '还有：酸痛不等于有效'], [49.4, 52.2, '刚开始练，身体忙着修补损伤'], [52.4, 55.3, '真正变粗，要等几周以后'],
	[56.0, 59.3, '蛋白质：每公斤体重1.6克，再多也不多长'], [59.5, 62.3, '70公斤的人，一天约110克'], [62.5, 65.4, '最好分成4顿，每顿约28克'],
	[65.6, 69.3, '「没有想过这个主动健康管理，没有想过这个热量缺口」', 'q'],
	[69.9, 72.6, '这句说对了：腹肌不是"卷"出来的'], [72.8, 75.6, '连卷6周腹，肚子上的脂肪一点没少'], [75.8, 79.6, '腹肌，是靠热量缺口"降"出来的'],
	[79.8, 81.7, '但要慢慢减'], [81.8, 85.7, '每周减体重0.7%的那组，瘦体重还涨了2%'], [85.85, 87.8, '减得快一倍的那组，基本没涨'],
	[88.4, 91.8, '同样节食两周，每晚少睡3小时'], [91.95, 95.9, '脂肪少减一半，瘦肉多掉六成'],
	[96.5, 99.9, '有氧会掉肌肉吗？43项研究的结论：不会'], [100.05, 104.0, '肌肉和力量照样长，只是爆发力会受点影响'],
	[104.2, 105.95, '什么时候开始？'], [106.1, 107.9, '「你七十岁再练来不及了呀」', 'q'], [108.3, 110.0, '其实，90岁都来得及'], [110.15, 114.0, '10位约90岁的老人练了8周，力量涨了174%'],
	[114.2, 116.1, '只是越早开始，存得越多'], [116.3, 118.4, '「可以理解为，薄肌是财富自由的第一步」', 'q'], [118.8, 120.2, '这句，查不到任何论文'],
	[120.3, 122.2, '薄肌不是财富自由的第一步'], [122.3, 125.0, '是老了还能自由的第一步'],
];
const QUOTES: Record<string, [number, number, string]> = {Q5: [65.6, 69.26, 'Q5.jpg'], Q2: [106.1, 107.88, 'Q2.jpg'], Q4: [116.3, 118.29, 'Q4.jpg']};

// ---------------------------------------------------------------- stations & camera
const SX = (i: number) => i * 2400 + 960;                                 // station centre x on the canvas
const KEYS: [number, number][] = [[17.0, 0], [db(1), 1], [db(4), 2], [db(6), 3], [db(12), 4], [db(15), 5], [db(19), 6], [db(26), 7], [db(29), 8], [db(31), 9], [db(35), 10], [db(39), 11], [db(43), 12], [db(48), 13], [db(49), 14], [db(52), 15]];
const GLIDE = 0.85;
const camAt = (t: number) => {
	let x = SX(0);
	for (let k = 1; k < KEYS.length; k++) { const [tk, i] = KEYS[k], [, ip] = KEYS[k - 1]; if (t >= tk) x = mix(SX(ip), SX(i), io(lin(t, tk, tk + GLIDE))); }
	return x;
};
const STEP_AT: [number, number][] = [[db(6), 0], [db(19), 1], [db(35), 2], [db(39), 3], [db(43), 4]];
const STEPS = ['练', '吃', '睡', '有氧', '开始'];

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
const Station: React.FC<{i: number; t: number}> = ({i, t}) => {
	const cx = SX(i), L = cx - 960;                    // L = the station's left edge in canvas coordinates
	switch (i) {
		case 0: { // the manual cover, drops on the drum hit
			const d = ea(t, 17.0, 0.45), shake = t > 17 && t < 17.35 ? Math.sin(t * 95) * 7 * (1 - lin(t, 17, 17.35)) : 0;
			return <g opacity={d} transform={`translate(${shake} ${(1 - d) * -150}) translate(${cx} 520) scale(${mix(1.12, 1, d)}) translate(${-cx} -520)`}>
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
		case 1: { // the grid: what 薄肌 means, and the drug-free ceiling
			const ox = L + 360, oy = 800, gw = 1240, gh = 560, k = ei(t, 19.2, 0.8);
			const dk = ei(t, 20.4, 1.0), dx = ox + mix(1050, 445, dk), dy = oy - mix(110, 345, dk);
			return <g>
				<Glass x={L + 220} y={150} w={1480} h={760} sweep={lin(t, 19.6, 20.8)} o={ea(t, 19.0, 0.4)}>
					<line x1={ox} y1={oy} x2={ox + gw * k} y2={oy} stroke={C.ink} strokeWidth={2} opacity={0.75} />
					<line x1={ox} y1={oy} x2={ox} y2={oy - gh * k} stroke={C.ink} strokeWidth={2} opacity={0.75} />
					<T x={ox + gw} y={oy + 54} t="体脂率　低 ← → 高" s={36} c={C.dim} a="end" w={600} o={k} />
					<T x={ox - 26} y={oy - gh + 12} t="肌肉量" s={36} c={C.dim} a="end" w={600} o={k} />
					<rect x={ox + 70} y={oy - 390} width={430} height={250} rx={24} fill="rgba(110,231,239,0.10)" stroke={C.cy} strokeWidth={2} opacity={ei(t, 19.9, 0.6)} />
					<T x={ox + 285} y={oy - 238} t="薄肌" s={84} c={C.cy} f={SERIF} w={900} o={ei(t, 20.0, 0.6)} />
					<T x={ox + 285} y={oy - 178} t="体脂低 · 肌肉刚好" s={26} c={C.cy} w={500} o={ei(t, 20.2, 0.6)} />
					<line x1={ox} y1={oy - gh + 60} x2={ox + gw * ei(t, 22.0, 0.8)} y2={oy - gh + 60} stroke={C.red} strokeWidth={2.5} strokeDasharray="14 12" />
					<T x={ox + gw} y={oy - gh + 40} t="天花板：不用药，很难超过这条线（FFMI 25）" s={28} c={C.red} a="end" w={500} o={ea(t, 22.5, 0.5)} />
					<circle cx={dx} cy={dy} r={16 * pop(t, 21.4)} fill={C.gold} opacity={lin(t, 20.3, 20.5)} />
					<circle cx={dx} cy={dy} r={30 + 10 * Math.sin(t * 4)} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.4 * lin(t, 20.3, 20.5)} />
					<T x={ox + 540} y={dy + 12} t="← 普通人 ✓ 练得到" s={34} c={C.gold} a="start" w={700} o={ea(t, 23.0, 0.5)} />
				</Glass>
			</g>;
		}
		case 2: case 8: case 15: { // the torso scan: fat down, muscle up
			const t0 = i === 2 ? 25.6 : i === 8 ? 76.0 : 122.6, dur = i === 15 ? 1.6 : 3.0;
			const f0 = i === 2 ? 1 : i === 8 ? 0.9 : 0.15, m0 = i === 2 ? 0.7 : i === 8 ? 0.95 : 1;
			const k = ei(t, t0, dur), fat = mix(f0, i === 15 ? 0.12 : 0.13, k), mus = mix(m0, 1, k), bf = Math.round(mix(i === 2 ? 25 : i === 8 ? 22 : 12, 12, k));
			return <g>
				<Torso cx={cx - 260} cy={500} s={300} m={mus} f={fat} t={t} />
				<Glass x={cx + 280} y={270} w={520} h={470} sweep={lin(t, t0 - 0.3, t0 + 0.8)} o={ea(t, t0 - 0.4, 0.5)}>
					<T x={cx + 540} y={350} t="体脂率" s={30} c={C.dim} w={500} ls={0.2} />
					<T x={cx + 540} y={500} t={`${bf}%`} s={140} c={C.gold} f={SERIF} w={900} />
					{i === 2 && <><T x={cx + 540} y={590} t="长一点肌肉 ↑" s={36} c={C.cy} w={700} /><T x={cx + 540} y={650} t="降一点体脂 ↓" s={36} c={C.gold} w={700} /></>}
					{i === 8 && <><T x={cx + 540} y={590} t="热量缺口" s={44} c={C.cy} f={SERIF} w={900} /><T x={cx + 540} y={650} t="脂肪降下去，腹肌才露出来" s={28} c={C.dim} w={500} /></>}
					{i === 15 && <><T x={cx + 540} y={590} t="练够 · 吃对 · 睡够" s={36} c={C.cy} w={700} /><T x={cx + 540} y={650} t="老了，还能自由" s={30} c={C.gold} w={700} /></>}
				</Glass>
			</g>;
		}
		case 3: { // 01 练 — 10 sets a week, split over two days, and the synthesis curve
			const days = ['一', '二', '三', '四', '五', '六', '日'], x0 = L + 230, dw = 210;
			const split = ei(t, 33.3, 0.8);
			const blocks = Array.from({length: 10}, (_, b) => {
				const appear = ea(t, 29.9 + b * 0.09, 0.35);
				const pileX = x0, pileY = 830 - b * 34;
				const tgtDay = b < 5 ? 0 : 3, tgtY = 640 - (b % 5) * 34;
				const x = mix(pileX + 520, x0 + tgtDay * dw + 30, split), y = mix(pileY, tgtY, split);
				return <rect key={b} x={x} y={y - 26 - (1 - appear) * 60} width={150} height={26} rx={8} fill={C.cy} opacity={appear * (1 - 0.0)} />;
			});
			const ck = lin(t, 36.4, 40.4);
			const pts: string[] = [];
			for (let n = 0; n <= 300; n++) {
				const u = n / 300; if (u > ck) break;
				const day = u * 7, x = x0 + day * dw; let v = 0;
				for (const s0 of [0.55, 3.55]) { const h = (day - s0) * 24; if (h > 0) v += h < 12 ? h / 12 : Math.exp(-Math.pow((h - 12) / 16, 2)); }
				pts.push(`${n ? 'L' : 'M'}${x.toFixed(1)},${(860 - 120 * v).toFixed(1)}`);
			}
			return <g>
				<StepHead x={L + 230} y={235} n="01" t="练" o={ea(t, 29.2, 0.5)} />
				{days.map((d, j) => <g key={j} opacity={ea(t, 29.6 + j * 0.05, 0.4)}>
					<rect x={x0 + j * dw} y={300} width={190} height={70} rx={14} fill={j === 0 || j === 3 ? `rgba(110,231,239,${0.12 * split})` : 'rgba(255,255,255,0.03)'} stroke="rgba(160,225,255,0.28)" />
					<T x={x0 + j * dw + 95} y={346} t={`周${d}`} s={32} c={(j === 0 || j === 3) && split > 0.5 ? C.cy : C.dim} w={600} />
				</g>)}
				{blocks}
				<T x={x0 + 520 + 75} y={880} t="本周 10 组" s={34} c={C.cy} w={700} o={ea(t, 30.6, 0.4) * (1 - split)} />
				<T x={x0 + 105} y={700} t="5 组" s={34} c={C.cy} w={800} o={split} />
				<T x={x0 + 3 * dw + 105} y={700} t="5 组" s={34} c={C.cy} w={800} o={split} />
				<line x1={x0} y1={860} x2={x0 + 7 * dw - 20} y2={860} stroke="rgba(160,225,255,0.25)" opacity={lin(t, 36.3, 36.6)} />
				<path d={pts.join('')} fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" />
				<T x={x0 + 7 * dw - 20} y={760} t="肌肉合成" s={30} c={C.gold} a="end" w={700} o={lin(t, 36.6, 37.0)} />
				<g opacity={ea(t, 39.3, 0.5)}>
					<line x1={x0 + 0.55 * dw} y1={880} x2={x0 + 2.05 * dw} y2={880} stroke={C.dim} strokeWidth={2} />
					<T x={x0 + 1.3 * dw} y={918} t="约 36 小时回落" s={28} c={C.dim} w={600} />
				</g>
			</g>;
		}
		case 4: { // 力竭 + progressive overload
			const reps = Math.min(12, Math.floor(lin(t, 41.6, 43.9) * 12.999)), fill = reps / 12;
			const steps = Math.floor(cl((t - 44.6) / (BAR / 4), 0, 6));
			return <g>
				<Glass x={L + 160} y={200} w={760} h={640} sweep={lin(t, 41.4, 42.4)} o={ea(t, 41.3, 0.4)}>
					<g transform={`translate(${L + 420} 470)`}>
						<rect x={-150} y={-10} width={300} height={20} rx={10} fill={C.pale} />
						{[-1, 1].map((s) => <g key={s}><rect x={s * 150 - (s > 0 ? 0 : 36)} y={-55} width={36} height={110} rx={10} fill={C.cy} /><rect x={s * 190 - (s > 0 ? 0 : 22)} y={-38} width={22} height={76} rx={8} fill={C.cy} opacity={0.7} /></g>)}
					</g>
					<T x={L + 420} y={600} t="轻重量也行" s={40} c={C.ink} f={SERIF} w={900} />
					<rect x={L + 760} y={300} width={60} height={440} rx={30} fill="rgba(255,255,255,0.05)" stroke="rgba(160,225,255,0.3)" />
					<rect x={L + 760} y={740 - 440 * fill} width={60} height={440 * fill} rx={30} fill={fill > 0.8 ? C.red : C.cy} opacity={0.85} />
					<T x={L + 790} y={280} t="接近力竭" s={28} c={C.red} w={700} o={lin(fill, 0.75, 0.95)} />
					<T x={L + 420} y={720} t={`第 ${Math.max(1, reps)} 下`} s={36} c={C.gold} w={700} o={lin(t, 41.6, 41.8)} />
				</Glass>
				<Glass x={L + 1000} y={200} w={760} h={640} o={ea(t, 44.3, 0.4)}>
					{Array.from({length: 6}, (_, s) => <g key={s}>
						<rect x={L + 1070 + s * 105} y={760 - (s + 1) * 70} width={105} height={(s + 1) * 70} fill={s < steps ? 'rgba(110,231,239,0.22)' : 'rgba(255,255,255,0.04)'} stroke="rgba(160,225,255,0.3)" />
						<T x={L + 1122 + s * 105} y={745 - (s + 1) * 70} t="+1" s={26} c={s < steps ? C.cy : C.faint} w={700} />
					</g>)}
					<circle cx={L + 1122 + Math.max(0, steps - 1) * 105} cy={735 - Math.max(1, steps) * 70 - 40} r={16 * pop(t, 44.6 + Math.max(0, steps - 1) * BAR / 4)} fill={C.gold} opacity={steps > 0 ? 1 : 0} />
					<T x={L + 1380} y={300} t="每次多一点" s={40} c={C.ink} f={SERIF} w={900} />
					<T x={L + 1380} y={348} t="多 1 下，或多 1 公斤" s={28} c={C.dim} w={500} />
				</Glass>
			</g>;
		}
		case 5: { // 酸痛 ≠ 有效
			const wk = Math.max(1, Math.min(10, 1 + Math.floor(lin(t, 52.6, 54.6) * 9.999))), grow = 1 + 0.18 * ei(t, 52.6, 2.0);
			const fib = [] as React.ReactNode[]; let n = 0;
			for (let r = -4; r <= 4; r++) for (let c = -5; c <= 5; c++) {
				const x = c * 46 + (r % 2 ? 23 : 0), y = r * 40; if (x * x + y * y > 210 * 210) continue; n++;
				const dmg = (n * 37) % 7 === 0;
				fib.push(<g key={`${r}_${c}`}><circle cx={x} cy={y} r={19} fill="rgba(110,231,239,0.18)" stroke={C.cy} strokeWidth={1.6} />
					{dmg && <path d={`M${x - 10},${y - 6} L${x + 2},${y + 2} L${x - 4},${y + 8}`} fill="none" stroke={C.red} strokeWidth={3} opacity={ea(t, 49.5, 0.4) * (1 - ei(t, 51.6, 1.0))} />}</g>);
			}
			return <g>
				<g opacity={ea(t, 47.4, 0.4)} transform={`translate(${L + 230} 230)`}>
					<path d="M0,40 L44,-36 L88,40 Z" fill="none" stroke={C.gold} strokeWidth={5} strokeLinejoin="round" /><T x={44} y={28} t="!" s={44} c={C.gold} w={900} />
					<T x={120} y={30} t="酸痛 ≠ 有效" s={64} c={C.ink} f={SERIF} w={900} a="start" />
				</g>
				<g transform={`translate(${cx - 120} 560) scale(${grow})`} opacity={ea(t, 47.6, 0.6)}>
					<circle cx={0} cy={0} r={235} fill="none" stroke="rgba(160,225,255,0.35)" strokeWidth={3} />{fib}
				</g>
				<Glass x={cx + 260} y={360} w={460} h={360} o={ea(t, 49.4, 0.4)}>
					<T x={cx + 490} y={450} t={t < 52.4 ? '修补损伤' : '肌纤维变粗'} s={46} c={t < 52.4 ? C.red : C.cy} f={SERIF} w={900} />
					<T x={cx + 490} y={580} t={`第 ${t < 52.4 ? 1 : wk} 周`} s={96} c={C.gold} f={SERIF} w={900} />
					<T x={cx + 490} y={650} t={t < 52.4 ? '前几周：主要在修' : '几周以后：才真正在长'} s={28} c={C.dim} w={500} />
				</Glass>
			</g>;
		}
		case 6: { // 02 吃 — 1.6 g/kg (plateau), 110 g, four plates
			const pk = ei(t, 56.2, 1.2);
			const curve: string[] = [];
			for (let n = 0; n <= 100; n++) { const u = n / 100; if (u > pk) break; const gpk = u * 3, v = gpk < 1.6 ? gpk / 1.6 : 1; curve.push(`${n ? 'L' : 'M'}${(L + 300 + u * 600).toFixed(1)},${(760 - 300 * Math.sqrt(v)).toFixed(1)}`); }
			const show2 = ea(t, 59.5, 0.5), show3 = t >= 62.5;
			return <g>
				<StepHead x={L + 230} y={235} n="02" t="吃" o={ea(t, 55.5, 0.5)} />
				<Glass x={L + 200} y={330} w={800} h={560} o={ea(t, 55.9, 0.4)}>
					<line x1={L + 300} y1={760} x2={L + 920} y2={760} stroke={C.pale} strokeWidth={2} opacity={0.7} />
					<line x1={L + 300} y1={760} x2={L + 300} y2={420} stroke={C.pale} strokeWidth={2} opacity={0.7} />
					<path d={curve.join('')} fill="none" stroke={C.cy} strokeWidth={5} strokeLinecap="round" />
					<line x1={L + 620} y1={430} x2={L + 620} y2={760} stroke={C.gold} strokeWidth={2} strokeDasharray="8 8" opacity={lin(t, 56.8, 57.2)} />
					<T x={L + 620} y={410} t="1.6 克 / 公斤" s={34} c={C.gold} w={800} o={lin(t, 56.8, 57.2)} />
					<T x={L + 800} y={440} t="再多，也不多长" s={28} c={C.dim} w={500} o={lin(t, 57.6, 58.0)} />
					<T x={L + 610} y={820} t="每天吃的蛋白质 →" s={26} c={C.dim} w={500} />
					<T x={L + 280} y={430} t="肌肉增长" s={26} c={C.dim} w={500} a="end" />
				</Glass>
				<g opacity={show2}>
					<T x={L + 1440} y={430} t="70 公斤" s={56} c={C.ink} f={SERIF} w={900} />
					<T x={L + 1440} y={540} t="≈ 110 克 / 天" s={76} c={C.gold} f={SERIF} w={900} />
				</g>
				{[0, 1, 2, 3].map((p) => { const a = show3 ? ea(t, 62.6 + p * (BAR / 4), 0.35) : 0, x = L + 1140 + p * 200;
					return <g key={p} opacity={a} transform={`translate(${x} 730) scale(${0.8 + 0.2 * a})`}>
						<circle cx={0} cy={0} r={82} fill="none" stroke={C.pale} strokeWidth={4} /><circle cx={0} cy={0} r={58} fill="rgba(255,255,255,0.04)" stroke="rgba(160,225,255,0.3)" />
						<T x={0} y={14} t="28克" s={36} c={C.cy} f={SERIF} w={900} /><T x={0} y={128} t={`第${'一二三四'[p]}顿`} s={26} c={C.dim} w={500} />
					</g>; })}
			</g>;
		}
		case 7: { // crunches don't burn belly fat
			const fillN = Math.floor(lin(t, 72.9, 75.3) * 30.999);
			return <g>
				<g opacity={ea(t, 69.9, 0.4)}>
					<T x={L + 260} y={260} t="卷腹 ≠ 腹肌" s={72} c={C.ink} f={SERIF} w={900} a="start" />
									</g>
				<Glass x={L + 220} y={330} w={820} h={560} o={ea(t, 72.6, 0.4)}>
					<T x={L + 630} y={400} t="一项实验：每周 5 天，连练 6 周腹" s={30} c={C.dim} w={500} />
					{Array.from({length: 30}, (_, c) => { const r = Math.floor(c / 5), q = c % 5; const on = c < fillN;
						return <g key={c}><rect x={L + 330 + q * 120} y={440 + r * 66} width={100} height={52} rx={10} fill={on ? 'rgba(110,231,239,0.22)' : 'rgba(255,255,255,0.04)'} stroke="rgba(160,225,255,0.25)" />
							{on && <T x={L + 380 + q * 120} y={477 + r * 66} t="✓" s={28} c={C.cy} w={800} />}</g>; })}
				</Glass>
				<Glass x={L + 1120} y={330} w={600} h={560} o={ea(t, 72.8, 0.4)}>
					<T x={L + 1420} y={410} t="腹部脂肪" s={34} c={C.dim} w={600} />
					<path d={`M${L + 1250},${720} A170,170 0 0 1 ${L + 1590},${720}`} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={22} strokeLinecap="round" />
					{(() => { const a = Math.PI * (0.62 + 0.012 * Math.sin(t * 9)); return <line x1={L + 1420} y1={720} x2={L + 1420 - Math.cos(a) * 150} y2={720 - Math.sin(a) * 150} stroke={C.gold} strokeWidth={8} strokeLinecap="round" />; })()}
					<circle cx={L + 1420} cy={720} r={14} fill={C.gold} />
					<T x={L + 1420} y={820} t="一点没少" s={52} c={C.red} f={SERIF} w={900} o={ea(t, 75.0, 0.4)} />
				</Glass>
			</g>;
		}
		case 9: { // slow vs fast
			const sk = ei(t, 82.0, 1.2), fk = ei(t, 86.0, 0.8);
			return <g>
				<T x={cx} y={250} t="减重速度 vs 瘦体重" s={56} c={C.ink} f={SERIF} w={900} o={ea(t, 79.8, 0.4)} />
				{[0, 1].map((j) => { const x = L + 300 + j * 720, slow = j === 0, k = slow ? sk : fk;
					return <Glass key={j} x={x} y={320} w={600} h={560} o={ea(t, slow ? 80.0 : 80.3, 0.4)}>
						<T x={x + 300} y={400} t={slow ? '慢：每周 −0.7%' : '快：每周 −1.4%'} s={40} c={slow ? C.cy : C.red} w={800} />
						<line x1={x + 120} y1={460} x2={x + 120 + (slow ? 200 : 400)} y2={460} stroke={slow ? C.cy : C.red} strokeWidth={6} strokeLinecap="round" />
						<path d={`M${x + 120 + (slow ? 200 : 400)},446 l20,14 l-20,14`} fill={slow ? C.cy : C.red} />
						<rect x={x + 220} y={800 - (slow ? 220 * k : 30)} width={160} height={slow ? 220 * k : 30} rx={12} fill={slow ? C.cy : 'rgba(185,200,230,0.5)'} opacity={slow ? 1 : k} />
						<T x={x + 300} y={760 - (slow ? 220 * k : 30) - 6} t={slow ? '+2%' : '基本没涨'} s={slow ? 64 : 40} c={slow ? C.cy : C.pale} f={SERIF} w={900} o={slow ? lin(k, 0.3, 0.7) : k} />
						<T x={x + 300} y={850} t="瘦体重" s={28} c={C.dim} w={500} />
					</Glass>; })}
			</g>;
		}
		case 10: { // 03 睡
			const k = ei(t, 92.0, 1.2);
			return <g>
				<StepHead x={L + 230} y={235} n="03" t="睡" o={ea(t, 87.9, 0.5)} />
				<T x={cx} y={340} t="同样节食两周 · 只改睡眠" s={34} c={C.dim} w={500} o={ea(t, 88.4, 0.4)} />
				{[0, 1].map((j) => { const x = L + 330 + j * 700, good = j === 0;
					return <Glass key={j} x={x} y={380} w={560} h={500} o={ea(t, 88.6 + j * 0.25, 0.4)}>
						<circle cx={x + 90} cy={450} r={26} fill={good ? C.cy : C.red} /><circle cx={x + 104} cy={440} r={24} fill={C.bg} />
						<T x={x + 140} y={464} t={good ? '每晚 8.5 小时' : '每晚 5.5 小时'} s={40} c={good ? C.cy : C.red} w={800} a="start" />
						<Bar x={x + 110} base={810} w={140} h={(good ? 1.4 : 0.6) * 100 * k} c={C.gold} val={`${good ? 1.4 : 0.6} kg`} label="减掉的脂肪" o={k > 0 ? 1 : 0} />
						<Bar x={x + 310} base={810} w={140} h={(good ? 1.5 : 2.4) * 100 * k} c={C.pale} val={`${good ? 1.5 : 2.4} kg`} label="掉的瘦肉" o={k > 0 ? 1 : 0} />
					</Glass>; })}
			</g>;
		}
		case 11: { // 04 有氧
			const flip = lin(t, 96.6, 99.0) * 43;
			const k = ei(t, 100.1, 1.0);
			return <g>
				<StepHead x={L + 230} y={235} n="04" t="有氧会掉肌肉吗？" o={ea(t, 96.0, 0.5)} />
				<Glass x={L + 220} y={330} w={760} h={560} o={ea(t, 96.3, 0.4)}>
					<T x={L + 600} y={400} t="43 项研究" s={40} c={C.ink} f={SERIF} w={900} />
					{Array.from({length: 43}, (_, c) => { const r = Math.floor(c / 9), q = c % 9, on = c < flip;
						return <rect key={c} x={L + 300 + q * 66} y={440 + r * 66} width={52} height={52} rx={10} fill={on ? 'rgba(126,240,176,0.35)' : 'rgba(255,255,255,0.05)'} stroke={on ? C.green : 'rgba(160,225,255,0.2)'} />; })}
					<T x={L + 600} y={850} t="结论：不会" s={48} c={C.green} f={SERIF} w={900} o={ea(t, 99.0, 0.4)} />
				</Glass>
				<Glass x={L + 1060} y={330} w={660} h={560} o={ea(t, 100.0, 0.4)}>
					<Bar x={L + 1130} base={790} w={130} h={280 * k} c={C.cy} val="✓" label="肌肉" vc={C.green} />
					<Bar x={L + 1325} base={790} w={130} h={280 * k} c={C.cy} val="✓" label="力量" vc={C.green} />
					<Bar x={L + 1520} base={790} w={130} h={220 * k} c="rgba(185,200,230,0.55)" val="略受影响" label="爆发力" vc={C.pale} />
				</Glass>
			</g>;
		}
		case 12: { // 05 什么时候开始 — 90-year-olds
			const k = ei(t, 110.3, 1.2);
			return <g>
				<StepHead x={L + 230} y={235} n="05" t="什么时候开始？" o={ea(t, 104.1, 0.5)} />
				<T x={cx} y={700} t="？" s={420} c="rgba(110,231,239,0.10)" f={SERIF} w={900} o={ea(t, 104.3, 0.6) * (1 - lin(t, 108.1, 108.5))} />
				<g opacity={ea(t, 108.3, 0.4)}>
					{Array.from({length: 10}, (_, j) => <Elder key={j} x={L + 300 + j * 82} y={640} s={0.62} o={ea(t, 108.4 + j * 0.05, 0.3)} />)}
					<T x={L + 670} y={780} t="10 位约 90 岁的老人 · 练 8 周" s={32} c={C.pale} w={600} />
				</g>
				<Glass x={L + 1160} y={300} w={560} h={600} o={ea(t, 110.1, 0.4)}>
					<Bar x={L + 1240} base={800} w={160} h={120} c="rgba(185,200,230,0.5)" label="练之前" />
					<Bar x={L + 1480} base={800} w={160} h={120 + 330 * k} c={C.gold} label="8 周后" val={k > 0.5 ? '+174%' : ''} />
				</Glass>
			</g>;
		}
		case 13: { // the earlier you start, the more you keep
			const k = ei(t, 114.4, 1.4), ages = [30, 40, 50, 60, 70, 80];
			const yA = (a: number, early: boolean) => 840 - 540 * (early ? 1 : 0.78) * Math.pow(0.86, (a - 30) / 10);
			const path = (early: boolean) => ages.map((a, j) => { const u = j / (ages.length - 1); if (u > k + 1e-6) return ''; return `${j ? 'L' : 'M'}${L + 360 + u * 1100},${yA(a, early).toFixed(1)}`; }).join('');
			return <Glass x={L + 220} y={170} w={1480} h={740} o={ea(t, 114.2, 0.4)}>
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
		case 14: { // the viral line: 财富自由 → 查无论文 → struck out
			const shine = (t * 0.6) % 1.6, strike = ei(t, 120.35, 0.6);
			return <g>
				<Glass x={L + 360} y={240} w={1200} h={380} o={ea(t, 116.3, 0.4)} sweep={shine <= 1 ? shine : -1}>
					<T x={cx} y={330} t="网传 · 转发最多的一句" s={28} c={C.dim} w={500} ls={0.2} />
					<T x={cx} y={470} t="薄肌 ＝ 财富自由的第一步" s={84} c={C.gold} f={SERIF} w={900} />
					<line x1={L + 440} y1={448} x2={L + 440 + 1040 * strike} y2={448} stroke={C.red} strokeWidth={8} />
					<T x={cx} y={560} t="✗" s={60} c={C.red} w={900} o={strike} />
				</Glass>
				<Glass x={L + 660} y={680} w={600} h={180} o={ea(t, 118.8, 0.4)}>
					<T x={cx} y={790} t="论文支持：无" s={56} c={C.ink} f={SERIF} w={900} />
				</Glass>
			</g>;
		}
	}
	return null;
};

// ---------------------------------------------------------------- the picture-in-picture for original-voice quotes
const QuotePip: React.FC<{t: number}> = ({t}) => {
	for (const [k, [a, b, img]] of Object.entries(QUOTES)) {
		if (t < a - 0.3 || t > b + 0.35) continue;
		const o = ea(t, a - 0.3, 0.3) * (1 - lin(t, b + 0.05, b + 0.35)), env = (QENV as any)[k] as number[];
		const fi = Math.floor((t - a) * 30);
		return <AbsoluteFill style={{opacity: o}}>
			<AbsoluteFill style={{background: 'rgba(4,9,22,0.72)'}} />
			<div style={{position: 'absolute', left: 560, top: 150, width: 800, height: 450, borderRadius: 26, overflow: 'hidden', border: '1.5px solid rgba(160,225,255,0.35)', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', transform: `scale(${mix(0.94, 1, ea(t, a - 0.3, 0.4))})`}}>
				<Img src={staticFile(`ep31/${img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) brightness(0.92)'}} />
				<div style={{position: 'absolute', left: 22, top: 18, padding: '6px 16px', borderRadius: 999, background: 'rgba(8,17,39,0.75)', color: C.gold, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.15em'}}>播客原声</div>
			</div>
			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
				{Array.from({length: 48}, (_, j) => { const v = env[cl(fi - 24 + j, 0, env.length - 1)] ?? 0, h = 6 + 70 * v * (t >= a && t <= b ? 1 : 0.1);
					return <rect key={j} x={720 + j * 10} y={680 - h / 2} width={5} height={h} rx={2.5} fill={C.cy} opacity={0.35 + 0.65 * (j === 24 ? 1 : 0.6)} />; })}
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
		<AbsoluteFill style={{transform: `translate(${jx}px, ${jy}px) scale(${slowed ? 1.33 + 0.06 * lin(t, c0, 14.49) : 1.33})`, transformOrigin: '50% 22%', filter: slowed ? `saturate(${1 - 0.8 * lin(t, c0, c0 + 0.4)}) brightness(0.8)` : 'none'}}>
			<OffthreadVideo src={staticFile('ep31/intro.mp4')} muted style={{width: W, height: H}} />
		</AbsoluteFill>
		{slowed && <AbsoluteFill style={{background: `rgba(16,34,80,${0.4 * lin(t, c0, c0 + 0.4)})`}} />}
		{slowed && <><div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 130 * ea(t, c0, 0.5), background: '#000'}} /><div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 130 * ea(t, c0, 0.5), background: '#000'}} /></>}
		{!slowed && <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 280, color: '#fff', letterSpacing: '0.04em', transform: `scale(${p})`,
			WebkitTextStroke: '10px rgba(8,17,39,0.9)', paintOrder: 'stroke fill', textShadow: `${3 * late}px 0 rgba(255,80,80,${0.7 * late}), ${-3 * late}px 0 rgba(80,240,255,${0.7 * late}), 0 10px 40px rgba(0,0,0,0.5)`} as any}>薄肌</div>}
		{!slowed && <div style={{position: 'absolute', right: 70, top: 56, fontFamily: SERIF, fontWeight: 900, fontSize: 68, color: C.gold, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}>×{n}</div>}
		
	</AbsoluteFill>;
};

// ---------------------------------------------------------------- the film
const Film: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const camX = camAt(t), vel = Math.abs(camAt(t + 1 / FPS) - camX);
	const push = 1 + 0.03 * (((t - DB0) % (BAR * 2)) / (BAR * 2)) * (t > DB0 ? 1 : 0);
	let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
	const bok = Array.from({length: 46}, () => ({x: rnd() * (SX(15) + 2400), y: rnd() * H, r: 6 + rnd() * 30, o: 0.04 + rnd() * 0.11, sp: 0.2 + rnd() * 0.5}));
	const line = LINES.find(([a, b]) => t >= a && t < b);
	const stepIdx = STEP_AT.filter(([a]) => t >= a).length - 1;
	const fadeEnd = lin(t, 123.6, 125.0);
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
					{Array.from({length: 16}, (_, i) => (Math.abs(SX(i) - camX) < 2700 ? <Station key={i} i={i} t={t} /> : null))}
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
				sources: '来源：Kouri 1995；Volpi 2004；Leong 2015 (Lancet)；Schoenfeld 2016, 2017；MacDougall 1995；Damas 2016；Morton 2018 (BJSM)；Schoenfeld & Aragon 2018；Vispute 2012；Garthe 2011；Nedeltcheva 2010；Schumann 2022；Fiatarone 1990 (JAMA)；播客：邵艾伦×孙宇晨 2026', duration: 0} as any} cfg={{videos: []} as any} dur={Math.round((END - CARD) * FPS)} /></Sequence>
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM31" component={Film} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
