import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, HatchDefs, ZODIAC, Z} from './kit45';
import {Story, Punch, Stamp, Brand, Dial, dialFor, SubRow, Marked} from './skin45';
import {Film45, END, hourAt, B4_ORDER, b4Gone} from './film45';
import {LINES45, TL} from './lines45';
import {seg} from './demo45';
/* ep45 《马首回家，用了160年》 full film, 0–154.18 s (4625 frames). Picture only; the bed is muxed after (build45film.py). */
const FPS = 30;
type St = [number, string, string?, string?, string?];   // from time, year, place, l2, l3
const STAMPS: St[] = [
	[0, '2026', '圆明园', '正觉寺 · 文殊亭'], [TL.C2, '1860', '圆明园'], [TL.C3, '1989', '伦敦', '苏富比'], [TL.C4, '2007', '香港', '6910万港元'], [TL.C5, '2019', '北京', '捐给国家'],
	[TL.C6, '2020', '圆明园'], [TL.C7, '2026.10', '今天', '回国 7 · 未归 5'], [TL.C7 + 2.83, ''],
	[TL.A1, '乾隆年间', '圆明园', '红铜 · 失蜡法'], [TL.A3, '乾隆年间', '海晏堂', '圆明园 · 西洋楼'], [TL.A6, '12:00', '午时', '11:00–13:00 是你'],
	[TL.B1, '1860.10', '圆明园', '英法联军'], [TL.B2, '1860.10.18', '圆明园', '放火'], [TL.B4, '1860', '圆明园', '你被带走，去向不明'],
	[TL.D1, '1989', '伦敦', '苏富比'], [TL.D2, '1989', '伦敦', '几十万美元'], [TL.D3, '2000', '香港', '佳士得 · 苏富比'], [TL.D5, '2003', '猪首', '何鸿燊出资'],
	[TL.D6, '2007', '香港', '苏富比秋拍'], [TL.D7, '2007', '香港', '国家文物局：', '主张终止拍卖'], [TL.D8, '2007.9.20', '香港', '拍卖前私下成交'], [TL.D10, '1989 → 2007', '', '几十万 → 884万美元'],
	[TL.D11, '2009', '巴黎', '佳士得'], [TL.D12, '2009', '巴黎', '鼠首 + 兔首'], [TL.D14, '2013', '北京', '法国皮诺家族捐赠'],
	[TL.E1, '2007–2019', '香港 · 澳门'], [TL.E2, '2019.11.13', '国家博物馆'], [TL.E3, '2020.5', '香港', '何鸿燊去世，98岁'],
	[TL.H1a, '2020.12.1', '北京'], [TL.H1b, '2020.12.1', '圆明园', '正觉寺 · 文殊亭'], [TL.H2, '1860 → 2020', ''], [TL.H3, '2020', '回国 7'], [TL.H4, '今天', '回国 7 · 回家 1'],
	[TL.H5, '正觉寺', '', '1860、1900 两次幸免'], [TL.H7, '马首', '耳朵', '研究者观察'], [TL.K1, '12:00', '正午', '记忆里的水力钟'], [TL.K2, '今天', '', '保利 4 · 国博 2'], [TL.K4, '今天', '', '龙 蛇 羊 鸡 狗'],
	[TL.K5 - 0.566, '2018.12.17', '法国'], [TL.Q, ''],
];
const easeOutQ = (u: number) => 1 - (1 - u) * (1 - u);
const stampAt = (t: number) => { let s: St | undefined; for (const x of STAMPS) if (t >= x[0]) s = x; return s && s[1] ? s : undefined; };
const back = (zs: Z[]) => dialFor(new Set<Z>(zs));
const ALL = ZODIAC, R3: Z[] = ['牛', '猴', '虎'], R4: Z[] = [...R3, '猪'], R5: Z[] = [...R4, '马'], R7: Z[] = [...R5, '鼠', '兔'];
const dialAt = (t: number): React.ReactNode => {
	if (t < TL.C7 || (t >= TL.C7 + 2.83 && t < TL.A1) || t >= TL.Q) return null;
	if (t < TL.A1) return <Dial st={back(R7)} rows={[{label: '回国', n: 7}]} />;
	if (t < TL.B4) return <Dial st={dialFor(new Set<Z>(ALL))} rows={[{label: '在家', n: 12}]} hand={Math.min(6, hourAt(t)) * 30} />;
	if (t < TL.D4) { const n = b4Gone(t), gone = new Set<Z>(B4_ORDER.slice(0, n));
		const st = Object.fromEntries(ALL.map((z) => [z, gone.has(z) ? 'ghost' : z === '马' ? 'you' : 'lit'])) as ReturnType<typeof dialFor>;
		return <Dial st={st} rows={[{label: n >= 12 ? '回国' : '在家', n: n >= 12 ? 0 : 12 - n}]} hand={180} />; }
	const set = t < TL.D5 ? R3 : t < TL.D9 ? R4 : t < TL.D14 ? R5 : R7;
	const st = dialFor(new Set<Z>(set), set.includes('马'));
	if (t < TL.H4) return <Dial st={st} rows={[{label: '回国', n: set.length}]} hand={180} />;
	const pop = t < TL.H4 + 0.3 ? 1 + 0.7 * easeOutQ(seg(t, TL.H4 + 0.05, TL.H4 + 0.3)) : 1 + 0.7 * (1 - seg(t, TL.H4 + 1.6, TL.H4 + 2.4));
	return <Dial st={st} rows={[{label: '回国', n: 7, dim: true}, {label: '回家', n: 1, home: true}]} hand={180} scale={pop} />;
};
const subsAt = (t: number): {rows: SubRow[]; punch?: {s: string; n: number}; end?: string} => {
	const i = LINES45.findIndex((l) => t >= l.a && t < l.b); if (i < 0) return {rows: []};
	const l = LINES45[i], len = l.text.replace(/[[\]]/g, '').length, n = l.kind === 'cut' || l.kind === 'stack' ? len : Math.ceil(len * (l.a === 0 ? 0.35 + 0.65 * seg(t, 0, 0.35) : seg(t, l.a, l.a + 0.35)));
	if (l.kind === 'punch') return {rows: [], punch: {s: l.text, n}};
	if (l.kind === 'end') return {rows: [], end: l.text};
	if (l.kind === 'stack' && i > 0) return {rows: [{s: LINES45[i - 1].text, o: 0.65}, {s: l.text, n}]};
	return {rows: [{s: l.text, n}]};
};
const GOLD = '#E8C27A', cl = (v: number) => Math.max(0, Math.min(1, v));
/** the Juno end card in this film's skin: gold title, the question, J monogram + follow pill, sources — all in together */
const JMark: React.FC<{draw: number}> = ({draw}) => { const r = 54, c = 2 * Math.PI * r, spark = cl((draw - 0.6) / 0.4);
	return <g><circle r={r} fill="none" stroke={GOLD} strokeWidth={2.5} strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, draw * 1.3))} transform="rotate(-90)" />
		<circle r={47} fill="none" stroke={GOLD} strokeWidth={1} opacity={0.35 * draw} />
		<text y={22} textAnchor="middle" style={{fontFamily: '"DejaVu Serif", serif', fontStyle: 'italic', fontWeight: 600, fontSize: 70}} fill={GOLD} opacity={cl((draw - 0.3) / 0.4)}>J</text>
		<path d="M0,-9 L2.2,-2.2 L9,0 L2.2,2.2 L0,9 L-2.2,2.2 L-9,0 L-2.2,-2.2 Z" fill="#fff4d6" transform={`translate(40,-40) scale(${spark * 1.4}) rotate(${draw * 90})`} /></g>; };
const EndCard: React.FC<{t: number; q: string}> = ({t, q}) => { const u = t - TL.Q, a = cl(u / 0.4), b = cl((u - 0.25) / 0.4);
	return <>
		<div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 68, letterSpacing: '0.08em', color: GOLD, textShadow: TITLE_SH, opacity: a}}>马首回家，用了160年</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 74, letterSpacing: '0.04em', color: '#F3F6F2', textShadow: TITLE_SH, opacity: b}}><Marked s={q} pull /></div>
		<svg width={W} height={H} style={{position: 'absolute', opacity: b}}>
			<g transform="translate(772,880) scale(0.56)"><JMark draw={cl((u - 0.25) / 1.0)} /></g>
			<rect x={802} y={851} width={400} height={58} rx={29} fill="rgba(232,194,122,0.10)" stroke={GOLD} strokeOpacity={0.75} strokeWidth={2} />
			<text x={1002} y={890} textAnchor="middle" style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '0.1em'}} fill={GOLD}>关注 Juno · 一起看懂世界</text>
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 500, fontSize: 24, color: '#D3DFDC', opacity: 0.8 * b}}>资料：人民日报、新京报、中新网、中国日报、中央社、新华社、NYRB、MIT Visualizing Cultures</div>
	</>; };
const Grain: React.FC = () => <g pointerEvents="none"><rect width={W} height={H} filter="url(#paper)" opacity={0.16} style={{mixBlendMode: 'multiply'}} />
	<defs><radialGradient id="vf" cx="0.5" cy="0.5" r="0.8"><stop offset="0.62" stopColor="#0c1418" stopOpacity="0" /><stop offset="1" stopColor="#0c1418" stopOpacity="0.3" /></radialGradient></defs><rect width={W} height={H} fill="url(#vf)" /></g>;
const TITLE_SH = '0 0 2px rgba(14,20,24,0.95), 0 4px 10px rgba(14,20,24,0.8), 0 6px 40px rgba(14,20,24,0.6)';
export const Frame45: React.FC<{t: number}> = ({t}) => {
	const sub = subsAt(t), st = stampAt(t), titleOn = t >= TL.C7 + 3.395 && t < TL.A1, ti = t - (TL.C7 + 3.395);
	return <AbsoluteFill style={{background: '#22374A'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}><HatchDefs /><Film45 t={t} /><Grain /></svg>
		{titleOn && <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 118, letterSpacing: '0.08em', lineHeight: 1.25, color: '#F3F6F2', textShadow: TITLE_SH,
			transform: `scale(${1 + 0.22 * (1 - Math.min(1, ti / 0.12)) - 0.025 * Math.sin(Math.min(1, Math.max(0, (ti - 0.12) / 0.3)) * Math.PI * 2) * (1 - Math.min(1, ti / 0.5))})`}}>
			<div>马首回家，</div><div>用了<span style={{color: '#9FE6D8'}}>160</span>年</div></div>}
		<Story rows={sub.rows} />
		{sub.punch && <Punch s={sub.punch.s} n={sub.punch.n} top={sub.punch.s.includes('6910') ? 300 : 250} size={sub.punch.s.includes('6910') ? 132 : 76} />}
		{sub.end && <EndCard t={t} q={sub.end} />}
		<Brand />
		{st && <Stamp y={st[1]} place={st[2] || undefined} l2={st[3]} l3={st[4]} />}
		{dialAt(t)}
		{t > END - 2.0 && <div style={{position: 'absolute', inset: 0, background: '#0E1A20', opacity: seg(t, END - 1.2, END)}} />}
	</AbsoluteFill>;
};
const Film: React.FC = () => { const f = useCurrentFrame(); return <Frame45 t={f / FPS} />; };
registerRoot(() => <Composition id="FILM45" component={Film} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />);
