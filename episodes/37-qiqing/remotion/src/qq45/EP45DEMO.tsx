import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, HatchDefs, ZODIAC, RETURNED, Z} from './kit45';
import {Story, Punch, Stamp, Brand, Dial, dialFor, SubRow} from './skin45';
import {T45, seg, beat, S1, S2, S3, S4, S5, S6, S7, Rewind, S8, S9, S10, hourHand} from './demo45';
/* ep45 demo: film 0–34.53 s (1036 frames), lines C1–C7 + A1–A5 of lines.json v2.1. Picture only; music muxed after. */
const FPS = 30, END = T45.end;
type L = [number, number, string, 'typed' | 'cut' | 'punch'];
const LINES: L[] = [
	[0, T45.c2, '假如说，你是圆明园的[马首]。', 'typed'], [T45.c2, T45.c3, '1860年，你被[抢走]，', 'cut'], [T45.c3, T45.c4, '在伦敦，被[拍卖]，', 'cut'],
	[T45.c4, T45.c5, '又被人花[6910万港元]买下，', 'cut'], [T45.c5, T45.c6, '又被[捐了出去]。', 'cut'], [T45.c6, T45.c7, '2020年，你[回家]了。', 'typed'],
	[T45.c7, T45.rew + 0.3, '可十二个里，还有[五个]没回来。', 'punch'],
	[T45.a1, T45.a3, '乾隆年间，你由红铜[一次铸成]。', 'typed'], [T45.a3, T45.a4, '你和十一个兄弟，坐在[水池两边]。', 'typed'],
	[T45.a4, T45.a5, '每两小时，轮到谁，[谁就喷水]。', 'typed'], [T45.a5, END, '人们叫你们：[水力钟]。', 'typed'],
];
const STAMPS: [number, number, string, string?, string?][] = [
	[0, T45.c2, '2026', '圆明园', '正觉寺 · 文殊亭'], [T45.c2, T45.c3, '1860', '圆明园'], [T45.c3, T45.c4, '1989', '伦敦', '苏富比'], [T45.c4, T45.c5, '2007', '香港', '苏富比'],
	[T45.c5, T45.c6, '2019', '北京', '捐给国家'], [T45.c6, T45.c7, '2020', '圆明园', '正觉寺 · 文殊亭'], [T45.c7, T45.rew, '2026.10', '今天', '回国 7 · 未归 5'],
	[T45.a1, T45.a3, '乾隆年间', '圆明园', '红铜 · 失蜡法'], [T45.a3, END, '乾隆年间', '海晏堂', '圆明园 · 西洋楼'],
];
const subsAt = (t: number): {rows: SubRow[]; punch?: {s: string; n: number}} => {
	const l = LINES.find(([a, b]) => t >= a && t < b); if (!l) return {rows: []};
	const [a, , s, k] = l, len = s.replace(/[[\]]/g, '').length, n = k === 'cut' ? len : Math.ceil(len * (a === 0 ? 0.35 + 0.65 * seg(t, 0, 0.35) : seg(t, a, a + 0.35)));
	return k === 'punch' ? {rows: [], punch: {s, n}} : {rows: [{s, n}]};
};
const Film45: React.FC<{t: number}> = ({t}) => {
	const S = t < T45.c2 ? S1 : t < T45.c3 ? S2 : t < T45.c4 ? S3 : t < T45.c5 ? S4 : t < T45.c6 ? S5 : t < T45.c7 ? S6 : t < T45.rew ? S7 : t < T45.title ? Rewind : t < T45.a1 ? S8 : t < T45.a3 ? S9 : S10;
	return <S t={t} />;
};
const Grain45: React.FC<{seed: number}> = ({seed}) => <g pointerEvents="none">
	<defs><radialGradient id="v45" cx="0.5" cy="0.5" r="0.78"><stop offset="0.6" stopColor="#0c1418" stopOpacity="0" /><stop offset="1" stopColor="#0c1418" stopOpacity="0.32" /></radialGradient>
		<filter id="g45" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={seed} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45" /></filter></defs>
	<rect width={W} height={H} fill="url(#v45)" /><rect width={W} height={H} filter="url(#g45)" opacity={0.04} style={{mixBlendMode: 'overlay'}} />
</g>;
const Demo: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS, sub = subsAt(t), st = STAMPS.find(([a, b]) => t >= a && t < b), fade = seg(t, beat(56), END);
	const titleOn = t >= T45.title && t < T45.a1, back7 = dialFor(RETURNED), home = dialFor(new Set<Z>(ZODIAC));
	return <AbsoluteFill style={{background: '#22374A'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}><HatchDefs /><Film45 t={t} /><Grain45 seed={3 + (f % 6)} /></svg>
		{titleOn && <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 118, letterSpacing: '0.08em', lineHeight: 1.25, color: '#F3F6F2', textShadow: '0 0 2px rgba(14,20,24,0.95), 0 4px 10px rgba(14,20,24,0.8), 0 6px 40px rgba(14,20,24,0.6)',
			transform: `scale(${1 + 0.22 * (1 - Math.min(1, (t - T45.title) / 0.12)) - 0.025 * Math.sin(Math.min(1, Math.max(0, (t - T45.title - 0.12) / 0.3)) * Math.PI * 2) * (1 - Math.min(1, (t - T45.title) / 0.5))})`}}>
			<div>马首回家，</div><div>用了<span style={{color: '#9FE6D8'}}>160</span>年</div></div>}
		<Story rows={sub.rows} />
		{sub.punch && <Punch s={sub.punch.s} n={sub.punch.n} top={250} />}
		<Brand />
		{st && <Stamp y={st[2]} place={st[3]} l2={st[4]} />}
		{t >= T45.c7 && t < T45.rew && <Dial st={back7} rows={[{label: '回国', n: 7}]} />}
		{t >= T45.a1 && <Dial st={home} rows={[{label: '在家', n: 12}]} hand={hourHand(t)} />}
		{fade > 0 && <div style={{position: 'absolute', inset: 0, background: '#0E1A20', opacity: fade}} />}
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP45DEMO" component={Demo} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />);
