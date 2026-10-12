import React from 'react';
import {AbsoluteFill, Composition, Img, Sequence, registerRoot, spring, staticFile, useCurrentFrame, Easing, interpolate} from 'remotion';
import {Sub, lineAt} from '../kf/common';
import L from './ep26v4_lines.json';
import Open26, {Room, Grain, Vignette, Banner, Bing, Phone, StatusBar, lerp, GOLD, SANS, SERIF, W, H, FPS, T} from './Open26';
import {EndCard} from '../brand/Brand';
import {JUNO} from '../brand/identity';

/* ep26 v4 · full film, built scene by scene on the opening's look (night room, phone light, gold ideas). */
const lines = L as {start: number; end: number; text: string}[];
const st = (n: number) => lines[n - 1].start; // line n (1-based) start, seconds
/** the latest line that has started and not yet ended (+0.2 s hold, never past the next line's start) */
const subAt = (t: number) => { for (let i = lines.length - 1; i >= 0; i--) if (t >= lines[i].start) return t < lines[i].end + 0.2 ? lines[i].text : ''; return ''; };
const CREAM = '#efe6d2', DIM = '#8f8674', RED = '#e8574a', AMBER = '#ffb347';
const tx = (size: number, weight = 900, font = SANS) => ({fontFamily: font, fontSize: size, fontWeight: weight, fontVariantNumeric: 'lining-nums' as const});
const rnd = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
/** fade 0→1 over d seconds starting at time a (t in seconds) */
const on = (t: number, a: number, d = 0.4) => lerp(t, a, a + d, 0, 1);
const off = (t: number, a: number, d = 0.4) => lerp(t, a, a + d, 1, 0);

const Plate: React.FC<{x: number; y: number; text: string; sub?: string; o?: number; anchor?: 'start' | 'end'}> = ({x, y, text, sub, o = 1, anchor = 'start'}) => (
	<g opacity={o}>
		<text x={x} y={y} textAnchor={anchor} style={tx(44, 900)} fill={CREAM}>{text}</text>
		{sub && <text x={x} y={y + 44} textAnchor={anchor} style={tx(26, 500)} fill={DIM} letterSpacing="0.12em">{sub}</text>}
	</g>
);
const Tag: React.FC<{x: number; y: number; text: string; o?: number}> = ({x, y, text, o = 1}) => (
	<g opacity={o}>
		<rect x={x} y={y - 34} width={[...text].length * 22 + 36} height={48} rx={24} fill="none" stroke={GOLD} strokeOpacity={0.7} strokeWidth={1.5} />
		<text x={x + 18} y={y} style={tx(26, 700)} fill={GOLD} letterSpacing="0.08em">{text}</text>
	</g>
);

/* a skyline: near buildings around the centre, a far row behind; windows light up as phones */
const BLD: {x: number; y: number; w: number; far: boolean}[] = [];
const CITY: {x: number; y: number; s: number; lit: number; ph: number; cool: boolean}[] = [];
{
	const r = rnd(11);
	for (const far of [true, false]) {
		let x = -1700;
		while (x < 3600) {
			const w = far ? 90 + r() * 140 : 150 + r() * 200;
			const top = far ? 360 + r() * 260 : 300 + r() * 420;
			const near = Math.abs(x + w / 2 - 960) < 200 && !far;
			const y = near ? 300 : top;
			BLD.push({x, y, w, far});
			const s = far ? 12 : 22, gx = far ? 22 : 38, gy = far ? 28 : 46;
			for (let wy = y + 40; wy < 1060; wy += gy) for (let wx = x + 24; wx < x + w - 16; wx += gx) {
				const d = Math.hypot(wx - 960, wy - 520);
				CITY.push({x: wx, y: wy, s, lit: Math.min(0.999, r() * 0.7 + d / 4000), ph: r() * 6, cool: r() < 0.25});
			}
			x += w + (far ? 6 : 26);
		}
	}
}

/* ---------- scene 2 · Hall (20.7–49.0) ---------- */
const Hall: React.FC<{t: number}> = ({t}) => {
	const x0 = 240, x1 = 1680, yb = 700, xNews = 640, xPay = 1300, lo = 600, hi = 380;
	const axis = on(t, 20.8, 0.6);
	// old belief: spending jumps when the money lands
	const oldP = lerp(t, st(8), st(8) + 1.6, 0, 1);
	const oldPts = (p: number) => {
		const xe = x0 + (x1 - x0) * p;
		const pts = [[x0, lo]];
		if (xe > xPay) pts.push([xPay, lo], [xPay + 30, hi], [xe, hi]); else pts.push([xe, lo]);
		return pts.map((q) => q.join(',')).join(' ');
	};
	// the data (Hall 1978): spending moves on the news, not on payday
	const realP = lerp(t, st(10), st(10) + 1.4, 0, 1);
	const realPts = (p: number) => {
		const xe = x0 + (x1 - x0) * p;
		const pts = [[x0, lo]];
		if (xe > xNews) pts.push([xNews, lo], [xNews + 30, hi], [xe, hi]); else pts.push([xe, lo]);
		return pts.map((q) => q.join(',')).join(' ');
	};
	const cross = lerp(t, st(10) + 1.0, st(10) + 1.3, 0, 1);
	const scan = lerp(t, st(9) + 0.3, st(9) + 2.2, x0, x1);
	const chartO = off(t, st(12) - 0.1, 0.5);
	// line 12: the cart holds "以后"
	const cartO = on(t, st(12), 0.5) * off(t, st(13) - 0.1, 0.4);
	// lines 13–16: the city
	const cityO = on(t, st(13) - 0.1, 0.6);
	const pull = lerp(t, st(13), st(14) + 1.8, 1.6, 0.4, Easing.inOut(Easing.cubic));
	const wins = CITY;
	const litFrac = lerp(t, st(13), st(14) + 1.6, 0.1, 0.6);
	const bossO = on(t, st(15), 0.4) * off(t, st(16) - 0.2, 0.5);
	const nation = on(t, st(16), 0.3);
	return (
		<AbsoluteFill>
			<Room glow={0.8} gx={900} gy={500} />
			{/* chart */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: chartO}}>
				<g opacity={axis}>
					<line x1={x0} x2={x0 + (x1 - x0) * axis} y1={yb} y2={yb} stroke={GOLD} strokeOpacity={0.45} strokeWidth={2} />
					<text x={x0} y={lo - 30} style={tx(30, 700)} fill={DIM}>你花的钱</text>
					{[[xNews, '听说要涨工资', '今天'], [xPay, '钱真正到账', '明年']].map(([x, a, b]) => (
						<g key={a as string}>
							<line x1={x as number} x2={x as number} y1={yb} y2={300} stroke={GOLD} strokeOpacity={0.25} strokeDasharray="4 8" />
							<circle cx={x as number} cy={yb} r={9} fill={GOLD} />
							<text x={x as number} y={yb + 60} textAnchor="middle" style={tx(44)} fill={CREAM}>{b as string}</text>
							<text x={x as number} y={yb + 104} textAnchor="middle" style={tx(30, 500)} fill="#bdb29a">{a as string}</text>
						</g>
					))}
				</g>
				<Plate x={x0} y={180} text="以前的经济学家" sub="教科书上的说法" o={on(t, 20.9, 0.5) * off(t, st(9), 0.4)} />
				{/* old belief, grey dashed */}
				<polyline points={oldPts(oldP)} fill="none" stroke="#9a9184" strokeWidth={5} strokeDasharray="14 10" opacity={t < st(8) ? 0 : 1} />
				<g opacity={on(t, st(8) + 1.4)}>
					<text x={xPay + 50} y={hi - 30} style={tx(36, 800)} fill="#b5ab98">以前以为：到账才多花</text>
				</g>
				{/* Hall's data check: a scan line */}
				{t > st(9) && t < st(10) + 0.2 && <rect x={scan - 3} y={260} width={6} height={yb - 260} fill={GOLD} opacity={0.5} />}
				<Plate x={x1} y={180} text="霍尔 · 斯坦福大学" sub="1978 年 · 用真实消费数据检验" anchor="end" o={on(t, st(9), 0.4)} />
				{/* the real line, gold */}
				<polyline points={realPts(realP)} fill="none" stroke={AMBER} strokeWidth={7} opacity={t < st(10) ? 0 : 1} style={{filter: 'drop-shadow(0 0 10px rgba(255,179,71,0.6))'}} />
				{/* X over the old jump */}
				<g opacity={cross}>
					<line x1={xPay - 40} x2={xPay + 70} y1={hi - 20} y2={lo + 30} stroke={RED} strokeWidth={8} strokeLinecap="round" />
					<line x1={xPay + 70} x2={xPay - 40} y1={hi - 20} y2={lo + 30} stroke={RED} strokeWidth={8} strokeLinecap="round" />
				</g>
				<g opacity={on(t, st(10) + 1.2)}>
					<rect x={xPay - 120} y={yb - 74} width={240} height={52} rx={26} fill="#000" opacity={0.5} />
					<text x={xPay} y={yb - 36} textAnchor="middle" style={tx(32, 800)} fill={CREAM}>到账这天：不变</text>
				</g>
				{/* the jump is on the news day */}
				<g opacity={on(t, st(11), 0.35)}>
					<circle cx={xNews + 15} cy={(lo + hi) / 2} r={90 + 8 * Math.sin(t * 5)} fill="none" stroke={GOLD} strokeWidth={3} />
					<text x={xNews - 120} y={hi - 40} style={tx(52)} fill={GOLD}>听说那天，就变了</text>
				</g>
			</svg>
			{/* cart of 以后 */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: cartO}}>
				<g transform={`translate(960 470) scale(${lerp(t, st(12), st(12) + 0.6, 0.85, 1)})`}>
					<circle r={330} fill="url(#cartGlow)" />
					<defs><radialGradient id="cartGlow"><stop offset="0" stopColor={GOLD} stopOpacity={0.22} /><stop offset="1" stopColor={GOLD} stopOpacity={0} /></radialGradient></defs>
					{/* cart */}
					<path d="M-260 -150 h70 l60 230 h300 l60 -180 h-390" fill="none" stroke={CREAM} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
					<circle cx={-110} cy={130} r={26} fill="none" stroke={CREAM} strokeWidth={12} />
					<circle cx={150} cy={130} r={26} fill="none" stroke={CREAM} strokeWidth={12} />
					{/* calendar page 明年 inside */}
					<g transform="translate(20 -150) rotate(-6)">
						<rect x={-100} y={-90} width={200} height={190} rx={14} fill="#f6efe0" />
						<rect x={-100} y={-90} width={200} height={50} rx={14} fill={RED} />
						<rect x={-100} y={-55} width={200} height={15} fill={RED} />
						<text x={0} y={-52} textAnchor="middle" style={tx(30, 800)} fill="#fff">2027</text>
						<text x={0} y={60} textAnchor="middle" style={tx(68, 900, SERIF)} fill="#3a2a1a">明年</text>
					</g>
				</g>
				<text x={960} y={830} textAnchor="middle" style={tx(40, 700)} fill={DIM}>你的购物车里，装的是「以后」</text>
			</svg>
			{/* city / nation */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: cityO}}>
				<defs>
					<radialGradient id="win"><stop offset="0" stopColor="#ffe6a8" /><stop offset="1" stopColor="#ffb347" stopOpacity={0} /></radialGradient>
				</defs>
				<g transform={`translate(960 620) scale(${pull}) translate(-960 -620)`}>
					{BLD.map((b, i) => <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={1400 - b.y} fill={b.far ? '#0f0c09' : '#16110c'} stroke="#2a2016" strokeWidth={2} />)}
					{wins.map((w, i) => {
						const isLit = w.lit < litFrac;
						const bub = isLit && nation > 0 ? 0.6 + 0.4 * Math.sin(t * 3 + w.ph) : 0;
						return (
							<g key={i}>
								<rect x={w.x - w.s / 2} y={w.y - w.s * 0.65} width={w.s} height={w.s * 1.3} fill={isLit ? (w.cool ? '#bcd0ff' : '#f7c56a') : '#231b12'} opacity={isLit ? 0.9 : 1} />
								{bub > 0 && <circle cx={w.x} cy={w.y - w.s * 1.6} r={w.s * 0.4} fill={GOLD} opacity={bub * nation} />}
							</g>
						);
					})}
				</g>
				<g opacity={on(t, st(13) + 0.3)}>
					<text x={960} y={110} textAnchor="middle" style={tx(44, 700)} fill={CREAM} opacity={off(t, st(14) - 0.2)}>每扇亮着的窗，都有一个看手机的人</text>
				</g>
				<g opacity={on(t, st(14) + 0.3) * off(t, st(15) - 0.2)}>
					<text x={960} y={120} textAnchor="middle" style={tx(64)} fill={GOLD}>几亿人，同一个「以后」</text>
				</g>
			</svg>
			{/* the speaker: boss → the people in charge of the nation's money */}
			<AbsoluteFill style={{opacity: bossO}}>
				<div style={{position: 'absolute', left: 960 - 200, top: 120, width: 400, height: 160, transform: 'scale(1.3)'}}>
					<Banner y={0} light />
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: nation}}>
				<div style={{position: 'absolute', left: 560, top: 90, width: 800, borderRadius: 34, padding: '22px 28px', background: 'rgba(250,250,250,0.96)', display: 'flex', gap: 22, alignItems: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', transform: `scale(${lerp(t, st(16), st(16) + 0.4, 0.9, 1)})`}}>
					<div style={{width: 84, height: 84, borderRadius: 22, background: 'linear-gradient(160deg,#e0b354,#a8761e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 46, fontWeight: 900, color: '#fff'}}>¥</div>
					<div style={{flex: 1, fontFamily: SANS}}>
						<div style={{fontSize: 34, fontWeight: 900, color: '#161616'}}>管着全国钱的人</div>
						<div style={{fontSize: 40, fontWeight: 900, color: '#999', letterSpacing: 8}}>{['·', '··', '···'][Math.floor(t * 3) % 3]}</div>
					</div>
				</div>
			</AbsoluteFill>
			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};


/* ---------- engraved paper ---------- */
const PAPER = '#ece2c8', INKB = '#4a3420';
const IOU: React.FC<{x: number; y: number; w?: number; h?: number; name: string; line2?: string; o?: number; rot?: number; stamp?: number}> = ({x, y, w = 520, h = 300, name, line2 = '欠下一大笔债', o = 1, rot = 0, stamp = 0}) => (
	<g opacity={o} transform={`rotate(${rot} ${x} ${y})`}>
		<rect x={x - w / 2 + 14} y={y - h / 2 + 20} width={w} height={h} fill="#000" opacity={0.5} style={{filter: 'blur(12px)'}} />
		<rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={PAPER} />
		<rect x={x - w / 2 + 12} y={y - h / 2 + 12} width={w - 24} height={h - 24} fill="none" stroke={INKB} strokeWidth={4} />
		<rect x={x - w / 2 + 20} y={y - h / 2 + 20} width={w - 40} height={h - 40} fill="none" stroke={INKB} strokeWidth={1} />
		{[0, 1, 2].map((i) => <circle key={i} cx={x - w / 2 + 70} cy={y} r={30 + i * 12} fill="none" stroke={INKB} strokeOpacity={0.35} strokeWidth={1.2} />)}
		<text x={x + 30} y={y - h * 0.22} textAnchor="middle" style={tx(h * 0.09, 700, SERIF)} fill={INKB} letterSpacing="0.6em">借 条</text>
		<text x={x + 30} y={y + h * 0.1} textAnchor="middle" style={tx(h * 0.25, 900, SERIF)} fill="#2e1f12">{name}</text>
		<text x={x + 30} y={y + h * 0.3} textAnchor="middle" style={tx(h * 0.085, 500)} fill={INKB}>{line2}</text>
		<rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill="url(#paperShade)" />
		{stamp > 0 && (
			<g opacity={stamp} transform={`rotate(-12 ${x + w * 0.3} ${y - h * 0.25}) translate(${x + w * 0.3} ${y - h * 0.25}) scale(${1.6 - 0.6 * stamp}) translate(${-(x + w * 0.3)} ${-(y - h * 0.25)})`}>
				<rect x={x + w * 0.3 - 70} y={y - h * 0.25 - 36} width={140} height={64} rx={8} fill="none" stroke={RED} strokeWidth={5} />
				<text x={x + w * 0.3} y={y - h * 0.25 + 12} textAnchor="middle" style={tx(40, 900)} fill={RED}>到期</text>
			</g>
		)}
	</g>
);
const PaperDefs = () => (
	<defs>
		<linearGradient id="paperShade" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#fff6dc" stopOpacity={0.12} />
			<stop offset="0.6" stopColor="#000" stopOpacity={0.05} />
			<stop offset="1" stopColor="#000" stopOpacity={0.4} />
		</linearGradient>
		<radialGradient id="redGlow"><stop offset="0" stopColor={RED} stopOpacity={0.35} /><stop offset="1" stopColor={RED} stopOpacity={0} /></radialGradient>
		<radialGradient id="warmGlow"><stop offset="0" stopColor="#ffcf7a" stopOpacity={0.3} /><stop offset="1" stopColor="#ffcf7a" stopOpacity={0} /></radialGradient>
	</defs>
);
const Bag: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
	<g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M-34 -30 q34 -24 68 0 l-10 8 q24 16 22 46 q-2 34 -46 34 q-44 0 -46 -34 q-2 -30 22 -46z" fill="#c9a24e" stroke="#7a5a1c" strokeWidth={3} />
		<text x={0} y={34} textAnchor="middle" style={tx(40, 900)} fill="#5a3e10">¥</text>
	</g>
);
const Pill: React.FC<{x: number; y: number; text: string; col?: string; o?: number; size?: number; fill?: string}> = ({x, y, text, col = CREAM, o = 1, size = 36, fill = 'rgba(0,0,0,0.55)'}) => {
	const w = [...text].length * size + 56;
	return (
		<g opacity={o}>
			<rect x={x - w / 2} y={y - size * 0.95} width={w} height={size * 1.55} rx={size * 0.78} fill={fill} stroke={col} strokeOpacity={0.8} strokeWidth={2} />
			<text x={x} y={y + size * 0.05} textAnchor="middle" style={tx(size, 800)} fill={col}>{text}</text>
		</g>
	);
};

/* ---------- the loop (Europe's spiral) · used at 49–63 (forming), 75–76 (calming), 87–98 (why it stopped) ---------- */
const CX = 960, CY = 440, RX = 450, RY = 290;
const angPt = (a: number) => [CX + RX * Math.cos(a), CY + RY * Math.sin(a)];
const arcPath = (a0: number, a1: number) => {
	const n = 30, pts = Array.from({length: n + 1}, (_, i) => angPt(a0 + ((a1 - a0) * i) / n));
	return 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L');
};
const NODES = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]; // top, right, bottom, left
const Loop: React.FC<{t: number}> = ({t}) => {
	const calm = t >= st(26) - 0.3, why = t >= st(30) - 0.3;
	const n = [on(t, st(18)), on(t, st(18) + 0.9), on(t, st(19)), on(t, st(20))];
	const draw = [lerp(t, st(18) + 0.4, st(18) + 1.1, 0, 1), lerp(t, st(19), st(19) + 0.6, 0, 1), lerp(t, st(20), st(20) + 0.6, 0, 1), lerp(t, st(20) + 0.6, st(20) + 1.2, 0, 1)];
	const spinA = st(20) + 1.2;
	const fear = calm ? lerp(t, st(26), st(26) + 1.4, 1, 0) : lerp(t, st(20), st(21) + 1.5, 0, 1);
	const spinOff = t < spinA ? 0 : calm ? (st(26) - spinA) ** 2 * 260 + (t - st(26)) * 40 : (t - spinA) ** 2 * 260;
	const arrowO = why ? lerp(t, st(33), st(33) + 1.2, 0.5, 0) : 1;
	const labels3 = why && t >= st(31) ? '大家信了：它真会出手' : calm ? '大家不慌了' : '大家怕，不敢借';
	const col3 = why && t >= st(31) ? GOLD : calm ? CREAM : RED;
	const bagsBack = calm ? lerp(t, st(26), st(26) + 1.2, 0, 1) : 0;
	const bagsOut = lerp(t, st(19) + 0.3, st(19) + 1.6, 0, 1) * (1 - bagsBack);
	const bing = calm ? on(t, st(26) - 0.3, 0.4) : 0;
	const net = why ? lerp(t, st(32), st(32) + 1.0, 0, 1) : 0;
	const shake = !calm && t > st(21) ? Math.sin(t * 40) * 3 * fear : 0;
	const col = (k: number) => (calm || why ? '#9a9184' : `rgb(${200 + 32 * k},${110 - 40 * k},${90 - 30 * k})`);
	const others = !calm ? on(t, st(21), 0.6) : off(t, st(26), 0.6);
	return (
		<AbsoluteFill>
			<Room glow={0.7} gx={960} gy={440} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<PaperDefs />
				<ellipse cx={CX} cy={CY} rx={700} ry={520} fill="url(#redGlow)" opacity={fear} />
				{why && <ellipse cx={CX} cy={CY} rx={700} ry={520} fill="url(#warmGlow)" opacity={on(t, st(31), 1)} />}
				{/* the rest of Europe, faint */}
				<g opacity={others * 0.45}>
					<IOU x={260} y={170} w={300} h={170} name="意大利" line2="" rot={-8} />
					<IOU x={1680} y={200} w={300} h={170} name="葡萄牙" line2="" rot={7} />
					<IOU x={1650} y={760} w={260} h={150} name="希腊" line2="" rot={-5} />
				</g>
				<Tag x={110} y={110} text="2012 · 欧洲" o={on(t, 49.1) * (calm ? 0 : 1)} />
				{/* safety net under the IOU */}
				{net > 0 && (
					<g opacity={net}>
						{Array.from({length: 9}, (_, i) => <path key={`v${i}`} d={`M${CX - 340 + i * 85} ${CY + 120} q 0 ${60} ${0} ${80}`} stroke={GOLD} strokeWidth={2.5} fill="none" />)}
						{[0, 1, 2].map((k) => <path key={`h${k}`} d={`M${CX - 340} ${CY + 130 + k * 30} Q ${CX} ${CY + 190 + k * 30} ${CX + 340} ${CY + 130 + k * 30}`} stroke={GOLD} strokeWidth={2.5} fill="none" />)}
						<text x={CX + 380} y={CY + 200} style={tx(44, 900)} fill={GOLD}>有人兜底</text>
					</g>
				)}
				<g transform={`translate(${shake} 0)`}>
					<IOU x={CX} y={CY - 10} w={440} h={250} name="西班牙" stamp={lerp(t, st(18) + 0.2, st(18) + 0.5, 0, 1)} o={on(t, 49.1, 0.5)} />
				</g>
				{bing > 0 && (
					<g opacity={bing * (1 - net)}>
						<Bing x={CX} y={CY - 10} r={110} />
						<text x={CX} y={CY + 6} textAnchor="middle" style={tx(40, 900, SERIF)} fill="#4a2a10">我来借</text>
					</g>
				)}
				{/* arrows between nodes */}
				<g opacity={arrowO}>
					{[0, 1, 2, 3].map((k) => {
						const a0 = NODES[k] + 0.32, a1 = NODES[k] + Math.PI / 2 - 0.32;
						const d = arcPath(a0, a1);
						const [ex, ey] = angPt(a1), [px, py] = angPt(a1 - 0.05);
						const ang = (Math.atan2(ey - py, ex - px) * 180) / Math.PI;
						return draw[k] > 0 && (
							<g key={k}>
								<path d={d} fill="none" stroke={col(fear)} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw[k]} 1`} />
								{t > spinA && <path d={d} fill="none" stroke="#fff" strokeOpacity={0.5 * (calm ? 0.2 : 1)} strokeWidth={3} strokeDasharray="10 60" strokeDashoffset={-spinOff} />}
								{draw[k] > 0.95 && <polygon points="0,-16 30,0 0,16" fill={col(fear)} transform={`translate(${ex} ${ey}) rotate(${ang})`} />}
							</g>
						);
					})}
				</g>
				{/* nodes */}
				{[['旧债到期', CREAM], ['得借新钱来还', CREAM], [labels3, col3], ['更还不上', calm || why ? '#9a9184' : RED]].map(([txt, c], k) => {
					const [x, y] = angPt(NODES[k]);
					return <Pill key={k} x={x} y={y + 12} text={txt as string} col={c as string} o={n[k]} size={k === 2 && why && t >= st(31) ? 46 : 42} />;
				})}
				{/* lenders' money bags around the bottom node */}
				{[-1, 1].map((sd) => [0, 1].map((j) => (
					<Bag key={`${sd}${j}`} x={CX + sd * (340 + j * 110 + bagsOut * 160)} y={CY + RY + 10 + j * 20} s={0.8} o={n[2] * (1 - bagsOut * 0.55)} />
				)))}
				{calm && !why && (
					<g opacity={on(t, st(26) + 0.6)}>
						<text x={1500} y={820} style={tx(34, 700)} fill={CREAM}>借钱的利息</text>
						<path d="M1700 790 l0 50 m-18 -18 l18 18 l18 -18" stroke={GOLD} strokeWidth={6} fill="none" strokeLinecap="round" />
					</g>
				)}
				{why && <text x={1560} y={250} textAnchor="middle" style={tx(60, 900)} fill={GOLD} opacity={on(t, st(33) + 0.4, 0.6)}>漩涡停了</text>}
			</svg>
			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};

/* ---------- the central bank and Draghi's 饼 (63.2–75) ---------- */
const Bank: React.FC<{t: number}> = ({t}) => {
	const bo = on(t, st(22) - 0.1, 0.5);
	const lit = lerp(t, st(22), st(22) + 1.2, 0.2, 1);
	const bx = 560, by = 760;
	const notes = Array.from({length: 14}, (_, i) => {
		const a = st(23) + 0.15 * i;
		const p = lerp(t, a, a + 0.8, 0, 1);
		return {p, x: interpolate(p, [0, 1], [bx, 1000 + (i % 2) * 14]), y: interpolate(p, [0, 1], [by - 150, by - 24 - i * 9]) - Math.sin(p * Math.PI) * 140, r: (i * 23) % 14 - 7};
	});
	const bingO = on(t, st(24), 0.5);
	const words = on(t, st(25), 0.4);
	return (
		<AbsoluteFill>
			<Room glow={lit} gx={bx} gy={520} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<PaperDefs />
				<g opacity={bo} stroke={CREAM} strokeOpacity={0.85} fill="none" strokeWidth={3}>
					<ellipse cx={bx} cy={by - 260} rx={420} ry={360} fill="url(#warmGlow)" stroke="none" opacity={lit} />
					<path d={`M${bx - 280} ${by - 430} L${bx} ${by - 560} L${bx + 280} ${by - 430} Z`} fill="#1a140d" />
					<rect x={bx - 290} y={by - 430} width={580} height={36} fill="#1a140d" />
					{Array.from({length: 6}, (_, i) => <rect key={i} x={bx - 250 + i * 92} y={by - 390} width={40} height={300} fill="#1a140d" />)}
					<rect x={bx - 310} y={by - 90} width={620} height={30} fill="#1a140d" />
					<rect x={bx - 340} y={by - 60} width={680} height={30} fill="#1a140d" />
					<rect x={bx - 70} y={by - 250} width={140} height={160} fill={`rgba(255,207,122,${0.35 * lit})`} />
				</g>
				<text x={bx} y={by + 70} textAnchor="middle" style={tx(56, 900)} fill={CREAM} opacity={bo}>欧洲央行</text>
				{/* euro notes */}
				{t > st(23) && notes.map((nn, i) => nn.p > 0 && (
					<g key={i} transform={`translate(${nn.x} ${nn.y}) rotate(${nn.r * (1 - nn.p) + (i % 3) - 1})`}>
						<rect x={-80} y={-40} width={160} height={80} fill="#d8e3cf" stroke="#3c5a46" strokeWidth={3} />
						<circle cx={-40} cy={0} r={22} fill="none" stroke="#3c5a46" strokeOpacity={0.5} />
						<text x={30} y={16} textAnchor="middle" style={tx(46, 900)} fill="#2f4a39">€</text>
					</g>
				))}
				<g opacity={on(t, st(23) + 0.3) * (1 - bingO)}>
					<text x={1000} y={by + 70} textAnchor="middle" style={tx(48, 900)} fill={GOLD}>能印钱</text>
				</g>
				{/* Draghi + 饼 */}
				<g opacity={bingO}>
					<Plate x={1780} y={150} text="德拉吉 · 欧洲央行行长" sub="2012 年 7 月 · 伦敦" anchor="end" />
					<circle cx={1330} cy={430} r={330} fill="url(#warmGlow)" />
					<Bing x={1330} y={430 + Math.sin(t * 2) * 6} r={lerp(t, st(24), st(24) + 0.6, 90, 170)} />
					<g opacity={words}>
						<text x={1330} y={450 + Math.sin(t * 2) * 6} textAnchor="middle" style={tx(60, 900, SERIF)} fill="#4a2a10">我来借</text>
						<Pill x={1330} y={700} text="要多少，给多少 · 上限 ∞" col={GOLD} size={38} />
					</g>
				</g>
			</svg>
			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};

/* ---------- the strongbox (76–83.7) ---------- */
const Vault: React.FC<{t: number}> = ({t}) => {
	const open = t >= 81.43;
	const push = open ? lerp(t, 81.43, 84, 1.04, 1.1, Easing.linear) : lerp(t, st(27), 81.43, 1.0, 1.08, Easing.linear);
	const flash = open ? lerp(t, 81.43, 81.7, 0.6, 0) : 0;
	const q = on(t, st(27) + 0.3, 0.4) * off(t, 79.2, 0.3);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `scale(${push})`}}>
				<Img src={staticFile(open ? 'ep26/vault_open.png' : 'ep26/vault_shut.png')} style={{width: W, height: H}} />
			</AbsoluteFill>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<text x={960} y={250} textAnchor="middle" fill={GOLD} opacity={q} style={{...tx(160, 900, SERIF), filter: 'drop-shadow(0 0 20px rgba(241,197,109,0.6))'}}>？</text>
			</svg>
			<AbsoluteFill style={{background: '#fff4dc', opacity: flash}} />
			<Grain />
		</AbsoluteFill>
	);
};

/* ---------- the blank ledger (83.7–86.8) ---------- */
const Ledger: React.FC<{t: number}> = ({t}) => {
	const st0 = st(29);
	const stamp = lerp(t, st0 + 0.7, st0 + 0.95, 0, 1);
	return (
		<AbsoluteFill>
			<Room glow={0.8} gx={960} gy={460} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<PaperDefs />
				<g transform={`rotate(-2 960 470)`}>
					<rect x={600} y={130} width={720} height={700} fill={PAPER} />
					<rect x={600} y={130} width={720} height={700} fill="url(#paperShade)" />
					<text x={960} y={220} textAnchor="middle" style={tx(52, 900, SERIF)} fill="#2e1f12">借款记录</text>
					<text x={960} y={270} textAnchor="middle" style={tx(28, 500)} fill={INKB}>欧洲央行 · 2012 年起的那个计划</text>
					{Array.from({length: 9}, (_, i) => <line key={i} x1={650} x2={1270} y1={330 + i * 54} y2={330 + i * 54} stroke={INKB} strokeOpacity={0.35} strokeWidth={1.5} />)}
					<line x1={820} x2={820} y1={300} y2={790} stroke={INKB} strokeOpacity={0.3} />
				</g>
				<g opacity={stamp} transform={`translate(1060 560) rotate(-14) scale(${1.5 - 0.5 * stamp})`}>
					<rect x={-150} y={-70} width={300} height={130} rx={12} fill="none" stroke={RED} strokeWidth={8} />
					<text x={0} y={38} textAnchor="middle" style={tx(96, 900)} fill={RED}>0 次</text>
				</g>
			</svg>
			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};

/* ---------- Woodford: the scale (98.5–111.2) ---------- */
const Scale: React.FC<{t: number}> = ({t}) => {
	const tilt = lerp(t, st(36), st(36) + 1.0, 6, -10, Easing.inOut(Easing.cubic)); // degrees; + = left (money) heavier
	const so = on(t, st(35) - 0.1, 0.5);
	const bookO = on(t, st(34), 0.5) * off(t, st(35) - 0.2, 0.4);
	const cool = lerp(t, st(37), st(37) + 0.8, 0, 1);
	const bulb = on(t, st(37) + 0.4, 0.5) * (0.85 + 0.15 * Math.sin(t * 7));
	const cx = 960, cy = 330, arm = 380;
	const la = (tilt * Math.PI) / 180;
	const lx = cx - arm * Math.cos(la), ly = cy + arm * Math.sin(la), rx = cx + arm * Math.cos(la), ry = cy - arm * Math.sin(la);
	return (
		<AbsoluteFill>
			<Room glow={1 - 0.6 * cool} gx={960} gy={460} />
			<AbsoluteFill style={{background: '#0b1630', opacity: 0.35 * cool, mixBlendMode: 'screen'}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<PaperDefs />
				<Plate x={1780} y={150} text="伍德福德 · 哥伦比亚大学" sub="另一位 2026 年得主" anchor="end" o={on(t, st(34), 0.5) * off(t, st(37), 0.5)} />
				{/* the book */}
				<g opacity={bookO} transform={`translate(760 470) rotate(-4)`}>
					<rect x={-190} y={-250} width={380} height={500} fill="#2c4a3c" stroke={GOLD} strokeWidth={3} />
					<rect x={-160} y={-220} width={320} height={440} fill="none" stroke={GOLD} strokeOpacity={0.6} />
					<text x={0} y={-60} textAnchor="middle" style={tx(64, 900, SERIF)} fill={GOLD}>利息与价格</text>
					<line x1={-90} x2={90} y1={-20} y2={-20} stroke={GOLD} strokeOpacity={0.6} />
					<text x={0} y={30} textAnchor="middle" style={tx(30, 500)} fill={CREAM}>伍德福德 著</text>
					<text x={0} y={170} textAnchor="middle" style={tx(36, 700)} fill={GOLD}>2003</text>
				</g>
				<g opacity={bookO}>
					<text x={1150} y={450} style={tx(42, 700)} fill={CREAM}>研究的是：</text>
					<text x={1150} y={520} style={tx(52, 900)} fill={GOLD}>央行该怎么说话</text>
				</g>
				{/* the scale */}
				<g opacity={so}>
					<line x1={cx} x2={cx} y1={cy} y2={cy + 430} stroke={CREAM} strokeWidth={10} />
					<path d={`M${cx - 120} ${cy + 450} h240`} stroke={CREAM} strokeWidth={14} strokeLinecap="round" />
					<polygon points={`${cx - 26},${cy - 20} ${cx + 26},${cy - 20} ${cx},${cy + 20}`} fill={CREAM} />
					<line x1={lx} y1={ly} x2={rx} y2={ry} stroke={CREAM} strokeWidth={10} strokeLinecap="round" />
					{[[lx, ly], [rx, ry]].map(([x, y], i) => (
						<g key={i}>
							<line x1={x} y1={y} x2={x - 110} y2={y + 170} stroke={CREAM} strokeOpacity={0.6} strokeWidth={2} />
							<line x1={x} y1={y} x2={x + 110} y2={y + 170} stroke={CREAM} strokeOpacity={0.6} strokeWidth={2} />
							<path d={`M${x - 140} ${y + 170} q140 70 280 0`} fill="#3a2e20" stroke={CREAM} strokeWidth={3} />
						</g>
					))}
					{/* money on the left */}
					{Array.from({length: 5}, (_, i) => (
						<g key={i} transform={`translate(${lx} ${ly + 150 - i * 22})`}>
							<rect x={-80} y={-18} width={160} height={36} fill="#d8e3cf" stroke="#3c5a46" strokeWidth={3} />
							<text x={0} y={12} textAnchor="middle" style={tx(28, 900)} fill="#2f4a39">€</text>
						</g>
					))}
					<text x={lx} y={ly + 290} textAnchor="middle" style={tx(44, 900)} fill={CREAM}>钱</text>
					{/* the promise on the right */}
					<g transform={`translate(${rx} ${ry + 120})`}>
						<rect x={-100} y={-60} width={200} height={110} fill={PAPER} />
						<text x={0} y={12} textAnchor="middle" style={tx(46, 900, SERIF)} fill="#2e1f12">一句话</text>
					</g>
					<text x={rx} y={ry + 290} textAnchor="middle" style={tx(48, 900)} fill={GOLD} opacity={on(t, st(36) + 0.4)}>承诺</text>
				</g>
				{/* the bulb: belief */}
				<g opacity={bulb}>
					<line x1={rx} y1={0} x2={rx} y2={70} stroke={CREAM} strokeOpacity={0.5} strokeWidth={2} />
					<circle cx={rx} cy={120} r={140} fill="url(#warmGlow)" />
					<circle cx={rx} cy={120} r={48} fill="#ffe3a0" />
					<rect x={rx - 20} y={64} width={40} height={20} fill="#777" />
					<text x={rx} y={137} textAnchor="middle" style={tx(46, 900)} fill="#6b4410">信</text>
					<text x={rx - 90} y={135} textAnchor="end" style={tx(44, 900)} fill={GOLD}>前提：有人信</text>
				</g>
			</svg>
			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};

/* ---------- Woodford: 我保证 vs 我觉得 (111.2–123.6) ---------- */
const Cards: React.FC<{t: number}> = ({t}) => {
	const sure = on(t, st(38), 0.4);
	const think = on(t, st(39), 0.4);
	const weather = lerp(t, st(39) + 1.3, st(39) + 2.0, 0, 1);
	const sig = lerp(t, st(40) + 0.2, st(40) + 1.4, 0, 1);
	const brk = lerp(t, st(41) + 0.3, st(41) + 1.2, 0, 1, Easing.out(Easing.cubic));
	const dark = lerp(t, st(41) + 0.6, st(41) + 1.6, 0, 0.55);
	const sx = 1220, sy = 470;
	return (
		<AbsoluteFill>
			<Room glow={0.9} gx={sx} gy={sy} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<PaperDefs />
				{/* 我觉得 → weather forecast */}
				<g opacity={think * (1 - brk * 0.6)} transform="translate(560 470) rotate(-4)">
					<rect x={-230} y={-170} width={460} height={340} fill="#6d675d" opacity={1 - weather} />
					<text x={0} y={30} textAnchor="middle" style={tx(84, 900, SERIF)} fill="#d6d0c4" opacity={1 - weather}>我觉得</text>
					<g opacity={weather}>
						<rect x={-230} y={-170} width={460} height={340} rx={30} fill="#2a3f63" />
						<circle cx={-80} cy={-40} r={60} fill="#f5c45a" />
						<ellipse cx={0} cy={-10} rx={110} ry={56} fill="#e8edf5" />
						<ellipse cx={-60} cy={10} rx={80} ry={44} fill="#e8edf5" />
						<text x={0} y={120} textAnchor="middle" style={tx(42, 800)} fill="#fff">明天 · 降雨 70%</text>
					</g>
					<text x={0} y={250} textAnchor="middle" style={tx(40, 700)} fill={DIM} opacity={weather}>说错了，不负责</text>
				</g>
				{/* 我保证, signed */}
				<g opacity={sure} transform={`translate(${sx} ${sy}) rotate(3)`}>
					<circle r={360} fill="url(#warmGlow)" />
					{(
						<g opacity={1 - brk * 0.45}>
							<g transform={`translate(${-brk * 60} ${brk * 30}) rotate(${-brk * 10})`}>
								<path d="M-260 -180 h260 l-30 120 l40 90 l-30 150 h-240 z" fill={PAPER} />
							</g>
							<g transform={`translate(${brk * 60} ${brk * 40}) rotate(${brk * 12})`}>
								<path d="M0 -180 h260 v360 h-280 l30 -150 l-40 -90 z" fill={PAPER} />
							</g>
							<g opacity={1 - brk}>
								<rect x={-260} y={-180} width={520} height={360} fill="url(#paperShade)" />
								<rect x={-240} y={-160} width={480} height={320} fill="none" stroke={INKB} strokeWidth={3} />
								<text x={0} y={-10} textAnchor="middle" style={tx(96, 900, SERIF)} fill="#2e1f12">我保证</text>
								<line x1={-150} x2={150} y1={100} y2={100} stroke={INKB} strokeOpacity={0.5} />
								<path d="M-140 90 c30 -40 50 30 80 -10 s40 -30 60 10 s50 -20 70 0 s40 10 70 -10" fill="none" stroke="#1d3a8a" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={`${sig} 1`} />
							</g>
						</g>
					)}
				</g>
				<text x={sx} y={sy + 290} textAnchor="middle" style={tx(42, 800)} fill={GOLD} opacity={on(t, st(40) + 1.0) * (1 - brk)}>做不到，就丢信用</text>
				<text x={sx} y={sy + 290} textAnchor="middle" style={tx(46, 900)} fill={RED} opacity={on(t, st(41) + 0.9)}>下次，没人信了</text>
			</svg>
			<AbsoluteFill style={{background: '#000', opacity: dark}} />
			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};

/* ---------- the spiral near you (123.6–135.7) ---------- */
const MiniScreen: React.FC<{children: React.ReactNode; light?: boolean}> = ({children, light}) => (
	<div style={{position: 'absolute', inset: 0, background: light ? '#f4efe7' : 'radial-gradient(120% 80% at 30% 10%, #2c3a5c 0%, #121726 55%, #090b12 100%)'}}>
		<StatusBar dark={light} />
		{children}
	</div>
);
const Note: React.FC<{who: string; msg: string; icon?: string; col?: string; y?: number; o?: number}> = ({who, msg, icon = '!', col = 'linear-gradient(160deg,#ff8a5b,#d4482b)', y = 44, o = 1}) => (
	<div style={{position: 'absolute', left: 14, right: 14, top: y, opacity: o, borderRadius: 26, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center', background: 'rgba(250,250,250,0.96)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
		<div style={{width: 58, height: 58, borderRadius: 15, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontFamily: SANS, fontSize: 32, fontWeight: 900}}>{icon}</div>
		<div style={{flex: 1, fontFamily: SANS, color: '#161616'}}>
			<div style={{fontSize: 23, fontWeight: 800}}>{who}</div>
			<div style={{fontSize: 29, fontWeight: 700, marginTop: 4}}>{msg}</div>
		</div>
	</div>
);
const Near: React.FC<{t: number}> = ({t}) => {
	const sky = off(t, st(43) - 0.2, 0.5);
	const scene = on(t, st(43) - 0.2, 0.5);
	const layoff = spring({frame: Math.round((t - st(43)) * FPS), fps: FPS, config: {damping: 16, stiffness: 120}});
	const cart = Math.round(lerp(t, st(43) + 0.8, st(43) + 1.6, 58, 0));
	const shopLit = lerp(t, st(44) + 0.3, st(44) + 1.8, 1, 0.25);
	const sign = on(t, st(45) + 0.3, 0.3);
	const a1 = lerp(t, st(44), st(44) + 0.7, 0, 1), a2 = lerp(t, st(45) + 0.6, st(45) + 1.3, 0, 1);
	return (
		<AbsoluteFill>
			<Room glow={0.8} gx={960} gy={480} />
			{/* establishing: the same loop over your city */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: sky}}>
				<g transform={`translate(960 620) scale(0.42) translate(-960 -620)`}>
					{BLD.map((b, i) => <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={1400 - b.y} fill={b.far ? '#0f0c09' : '#16110c'} stroke="#2a2016" strokeWidth={2} />)}
					{CITY.map((w, i) => w.lit < 0.45 && <rect key={i} x={w.x - w.s / 2} y={w.y - w.s * 0.65} width={w.s} height={w.s * 1.3} fill={w.cool ? '#bcd0ff' : '#f7c56a'} opacity={0.85} />)}
				</g>
				<ellipse cx={960} cy={520} rx={620} ry={250} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="60 30" strokeDashoffset={-t * 120} opacity={0.85} />
				<text x={960} y={200} textAnchor="middle" style={tx(56, 900)} fill={RED}>同一个漩涡</text>
			</svg>
			<AbsoluteFill style={{opacity: scene}}>
				{/* your phone */}
				<div style={{position: 'absolute', left: 230, top: 90, transform: 'scale(1.02)', transformOrigin: '0 0'}}>
					<Phone>
						<MiniScreen light>
							<div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: SANS}}>
								<div style={{fontSize: 30, color: '#666'}}>购物车</div>
								<div style={{fontSize: 110, fontWeight: 900, color: cart === 0 ? '#999' : '#e8553a'}}>¥{cart}</div>
								<div style={{fontSize: 30, fontWeight: 800, color: '#999', opacity: cart === 0 ? 1 : 0}}>已清空 · 钱先存着</div>
							</div>
							<Note who="公司通知" msg="明年可能要裁员" y={interpolate(layoff, [0, 1], [-140, 44])} o={layoff} />
						</MiniScreen>
					</Phone>
				</div>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<PaperDefs />
					{/* the shop downstairs */}
					<g transform="translate(1340 520)">
						<circle r={360} fill="url(#warmGlow)" opacity={shopLit} />
						<rect x={-300} y={-200} width={600} height={420} fill="#1a140d" stroke={CREAM} strokeOpacity={0.6} strokeWidth={3} />
						{Array.from({length: 7}, (_, i) => <path key={i} d={`M${-300 + i * 86} -200 h86 l-10 70 q-33 26 -66 0 z`} fill={i % 2 ? '#c94b35' : '#efe6d2'} opacity={0.4 + 0.6 * shopLit} />)}
						<rect x={-240} y={-90} width={480} height={240} fill={`rgba(255,207,122,${0.55 * shopLit})`} />
						<text x={0} y={-235} textAnchor="middle" style={tx(48, 900)} fill={CREAM}>楼下小面馆</text>
						<text x={0} y={60} textAnchor="middle" style={tx(40, 800)} fill="#3a2410" opacity={shopLit}>营业中</text>
						<g opacity={sign} transform="rotate(-5)">
							<rect x={-150} y={-30} width={300} height={130} fill={PAPER} />
							<text x={0} y={24} textAnchor="middle" style={tx(40, 900, SERIF)} fill="#2e1f12">暂停招聘</text>
							<text x={0} y={72} textAnchor="middle" style={tx(26, 600)} fill={INKB}>下月起不招人了</text>
						</g>
					</g>
					{/* the two arrows of the loop */}
					<path d="M720 300 Q 960 180 1080 300" fill="none" stroke={RED} strokeWidth={7} pathLength={1} strokeDasharray={`${a1} 1`} />
					<text x={900} y={200} textAnchor="middle" style={tx(40, 900)} fill={RED} opacity={a1}>你少花</text>
					<path d="M1060 780 Q 900 880 740 790" fill="none" stroke={RED} strokeWidth={7} pathLength={1} strokeDasharray={`${a2} 1`} />
					<text x={900} y={870} textAnchor="middle" style={tx(40, 900)} fill={RED} opacity={a2}>它裁人</text>
				</svg>
			</AbsoluteFill>
			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};

/* ---------- back to you (135.7–154.3) ---------- */
const Chat: React.FC<{t: number}> = ({t}) => {
	const hist = lerp(t, st(47), st(47) + 0.9, 0, 1, Easing.inOut(Easing.cubic));
	const bubble = (who: 'boss' | 'me' | 'sys', txt: string, key: string, o = 1) => (
		<div key={key} style={{alignSelf: who === 'me' ? 'flex-end' : who === 'sys' ? 'center' : 'flex-start', maxWidth: '80%', opacity: o, margin: '10px 16px', padding: who === 'sys' ? '4px 10px' : '14px 18px', borderRadius: 20,
			background: who === 'me' ? '#f1c56d' : who === 'sys' ? 'transparent' : '#fff', color: who === 'sys' ? '#999' : '#1b1b1b', fontFamily: SANS, fontSize: who === 'sys' ? 20 : 27, fontWeight: who === 'sys' ? 600 : 700, boxShadow: who === 'sys' ? 'none' : '0 3px 10px rgba(0,0,0,0.08)'}}>
			{txt}
		</div>
	);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#ece6dc'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120, background: '#f7f3ec', borderBottom: '1px solid #ddd'}} />
			<StatusBar dark />
			<div style={{position: 'absolute', top: 64, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 28, fontWeight: 800, color: '#1b1b1b'}}>老板</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', flexDirection: 'column', transform: `translateY(${-30 + 30 * (1 - hist)}px)`}}>
				<div style={{opacity: hist, display: 'flex', flexDirection: 'column'}}>
					{bubble('sys', '去年 10 月', 'a')}
					{bubble('boss', '明年给你涨工资', 'b')}
					{bubble('me', '谢谢老板！', 'c')}
					{bubble('sys', '……之后，再没提过', 'd')}
				</div>
				{bubble('sys', '今天 21:04', 'e')}
				{bubble('boss', '明年给你涨工资', 'f')}
			</div>
		</div>
	);
};
const Back: React.FC<{t: number}> = ({t}) => {
	const flip = t >= st(50) - 0.2;
	const q = on(t, st(46) + 0.3);
	const crack = on(t, st(47) + 1.0, 0.4);
	const price = on(t, st(48), 0.4) * off(t, st(49) - 0.1, 0.3);
	const two = on(t, st(49), 0.4) * off(t, st(50) - 0.3, 0.3);
	const ticks = Array.from({length: 5}, (_, i) => on(t, st(51) + 0.3 + i * 0.35, 0.25));
	const sent = spring({frame: Math.round((t - st(50)) * FPS), fps: FPS, config: {damping: 15, stiffness: 120}});
	const toGold = lerp(t, 153.2, 154.3, 0, 1);
	return (
		<AbsoluteFill>
			<Room glow={1} gx={600} gy={540} />
			<div style={{position: 'absolute', left: 230, top: 90, transform: 'scale(1.02)', transformOrigin: '0 0'}}>
				<Phone>
					{!flip ? <Chat t={t} /> : (
						<div style={{position: 'absolute', inset: 0, background: '#ece6dc'}}>
							<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120, background: '#f7f3ec', borderBottom: '1px solid #ddd'}} />
							<StatusBar dark />
							<div style={{position: 'absolute', top: 64, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 28, fontWeight: 800, color: '#1b1b1b'}}>朋友</div>
							<div style={{position: 'absolute', right: 18, top: interpolate(sent, [0, 1], [700, 300]), opacity: sent, maxWidth: '80%', padding: '18px 24px', borderRadius: 24, background: GOLD, fontFamily: SANS, fontSize: 40, fontWeight: 900, color: '#2a1d08'}}>我保证</div>
							<div style={{position: 'absolute', right: 22, top: 392, opacity: on(t, st(50) + 0.6), fontFamily: SANS, fontSize: 20, color: '#888'}}>已发送</div>
						</div>
					)}
				</Phone>
			</div>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<PaperDefs />
				{/* the boss's 饼, now with a question / a crack */}
				<g opacity={(1 - price) * (1 - two) * (flip ? 0 : 1)}>
					<circle cx={1300} cy={430} r={320} fill="url(#warmGlow)" opacity={1 - crack * 0.7} />
					<g style={{filter: crack > 0 ? `grayscale(${crack * 0.8})` : undefined}}>
						<Bing x={1300} y={430} r={170} bite={1} />
					</g>
					<path d="M1250 270 l40 80 l-30 50 l50 70 l-20 60" stroke="#2a1608" strokeWidth={7} fill="none" opacity={crack} />
					<text x={1300} y={720} textAnchor="middle" style={tx(110, 900, SERIF)} fill={GOLD} opacity={q * (1 - crack)}>？</text>
					<text x={1300} y={700} textAnchor="middle" style={tx(46, 900)} fill={DIM} opacity={crack}>去年那张，没兑现</text>
				</g>
				{/* this time you don't spend */}
				<g opacity={price}>
					<text x={1080} y={470} style={tx(96, 900)} fill="#8f8674">¥58</text>
					<line x1={1075} x2={1290} y1={440} y2={440} stroke="#8f8674" strokeWidth={6} />
					<text x={1320} y={470} style={tx(96, 900)} fill="#8f8674">→</text>
					<text x={1450} y={480} style={tx(140, 900)} fill={CREAM}>¥26</text>
					<text x={1080} y={580} style={tx(40, 700)} fill={DIM}>这次，一分都不多花</text>
				</g>
				{/* kept vs broken */}
				<g opacity={two}>
					<circle cx={1120} cy={430} r={250} fill="url(#warmGlow)" />
					<Bing x={1120} y={430} r={140} />
					<Pill x={1120} y={650} text="说到做到" col={GOLD} size={40} />
					<g style={{filter: 'grayscale(0.85)'}} opacity={0.6}><Bing x={1560} y={430} r={140} bite={1} /></g>
					<path d="M1520 300 l30 70 l-25 40 l40 60 l-15 50" stroke="#2a1608" strokeWidth={6} fill="none" opacity={0.7} />
					<Pill x={1560} y={650} text="说了不做" col={DIM} size={40} />
				</g>
				{/* your record */}
				<g opacity={flip ? on(t, st(50) + 0.2) : 0}>
					<text x={1300} y={330} textAnchor="middle" style={tx(52, 900)} fill={CREAM}>你说出去的话</text>
					{ticks.map((k, i) => (
						<g key={i} opacity={k} transform={`translate(${1060 + i * 120} 470) scale(${0.6 + 0.4 * k})`}>
							<circle r={46} fill="none" stroke={GOLD} strokeWidth={4} />
							<path d="M-20 0 l14 16 l26 -30" stroke={GOLD} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
					))}
					<text x={1300} y={620} textAnchor="middle" style={tx(46, 800)} fill={GOLD} opacity={on(t, st(51) + 1.6)}>兑现一次，就多值一分</text>
				</g>
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 60% 45%, rgba(241,197,109,0.55), rgba(0,0,0,0) 60%)', opacity: toGold}} />
			<Vignette />
			<Grain />
		</AbsoluteFill>
	);
};

const END_V = {id: 'ep26', src: '', title: '画饼，到底有没有用？', kicker: '', tagline: '', taglineEn: '', motif: 'coin' as const, card: [16.6, 20.7] as [number, number], extend: 0, question: '老板画的饼，你吃过几次？',
	sources: '来源：诺贝尔奖委员会 2026；Hall 1978；Woodford 2003、2012；欧洲央行 2012–2013；BIS；欧盟法院 2015', duration: 0};
const End: React.FC<{t: number}> = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#05060b'}}>
			<Sequence from={Math.round(END_AT * FPS)}><EndCard v={END_V} cfg={{videos: []}} dur={Math.round((FILM_END - END_AT) * FPS)} /></Sequence>
		</AbsoluteFill>
	);
};
const END_AT = 154.34;

const SCENES: {from: number; to: number; C: React.FC<{t: number}>}[] = [
	{from: 20.73, to: 49.0, C: Hall},
	{from: 49.0, to: 63.2, C: Loop},
	{from: 63.2, to: st(26) - 0.3, C: Bank},
	{from: st(26) - 0.3, to: st(27) - 0.1, C: Loop},
	{from: st(27) - 0.1, to: st(29) - 0.1, C: Vault},
	{from: st(29) - 0.1, to: st(30) - 0.2, C: Ledger},
	{from: st(30) - 0.2, to: st(34) - 0.1, C: Loop},
	{from: st(34) - 0.1, to: st(38) - 0.15, C: Scale},
	{from: st(38) - 0.15, to: st(42) - 0.1, C: Cards},
	{from: st(42) - 0.1, to: st(46) - 0.1, C: Near},
	{from: st(46) - 0.1, to: END_AT, C: Back},
	{from: END_AT, to: 999, C: End},
];

const Film26: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	if (f < T.end) return <Open26 />;
	const sc = SCENES.find((s) => t >= s.from && t < s.to);
	const fadeIn = sc ? (sc.C === End ? 1 : lerp(t, sc.from, sc.from + 0.25, 0, 1)) : 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{sc && <AbsoluteFill style={{opacity: fadeIn}}><sc.C t={t} /></AbsoluteFill>}
			{t < END_AT && <svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Sub t={subAt(t)} /></svg>}
			<div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55 * lerp(t, 21, 21.6, 0, 1) * lerp(t, END_AT - 0.4, END_AT, 1, 0), fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: '#f3ede2', textShadow: '0 1px 6px rgba(0,0,0,0.6)'}}>{JUNO.mark}</div>
		</AbsoluteFill>
	);
};

export const FILM_END = 163.0;
const Root: React.FC = () => <Composition id="FILM26" component={Film26} durationInFrames={Math.round(FILM_END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
