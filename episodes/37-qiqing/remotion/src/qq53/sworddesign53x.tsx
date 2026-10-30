import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {SANS} from '../qq50/kit50';
import {Sword as SwordNow} from './props53';
import {SwordFlatX, PommelFaceX, Map2} from './swordflat53x';
import {VARIANTS, Look, A} from './swordspec53x';
/* ep53 · SWORDDESIGN — three accurate design options for the 越王勾践剑 (test composition, not in the film).
   frame 0 = option A 博物馆写实, 1 = option B 清晰主角, 2 = option C 课本金, 3 = comparison with the CURRENT sword (props53.Sword,
   the flat renderer of swordspec53s) at the same views. Every option is ONE geometry (swordspec53x) + a Look (VARIANTS).
   Each option frame: the whole sword flat (≥ 85 % of the width), then four close-ups at fixed scales (the same for all options):
   guard + inscription (tip up, 5 px/mm) with the guard's back face, the pommel face (7 px/mm), the grip and hoops (5 px/mm) with
   a 30 %-width preview, and the blade pattern at macro scale (11 px/mm). Style B「漆」: dark warm ground, the sword brightest. */
const BG = '#140B07', INK = '#E9DBBE', DIM = '#9C8566', RULE = '#3A2516';
const TITLES: Record<string, [string, string]> = {
	A: ['方案 A · 博物馆写实', '照片里的样子：黄黑色（橄榄铜灰）剑身、炭黑菱格、近格处锈斑发暗；黑色剑格剑柄，小块蓝琉璃'],
	B: ['方案 B · 清晰主角', '同一几何与细节；剑身提亮提暖、菱格与星点加粗、白字加暗边、轮廓补光——手机上 30% 画幅仍看得清'],
	C: ['方案 C · 课本金（推荐）', '课本 / 展柜灯下的记忆：金色剑身 + 近黑星形菱格 + 黑柄黑格 + 亮蓝琉璃 + 白色鸟篆'],
};
/** horizontal map: pommel end at (x0, y), tip to the right, w up */
const H = (x0: number, y: number, k: number): Map2 => (a, w) => [x0 + a * k, y - w * k];
/** tip-up map: the point a = aB at (cx, yB), the tip up; w > 0 to the viewer's LEFT (so the 越王鸠浅 column is on the right) */
const V = (cx: number, yB: number, aB: number, k: number): Map2 => (a, w) => [cx - w * k, yB - (a - aB) * k];

const Panel: React.FC<{x: number; y: number; w: number; h: number; t: string; id: string; children: React.ReactNode}> = ({x, y, w, h, t, id, children}) => <g>
	<defs><clipPath id={`pc${id}`}><rect x={x} y={y} width={w} height={h} rx={10} /></clipPath></defs>
	<rect x={x} y={y} width={w} height={h} rx={10} fill="#0E0705" stroke={RULE} strokeWidth={1.5} />
	<g clipPath={`url(#pc${id})`}>{children}</g>
	<rect x={x + 6} y={y + 6} width={t.length * 15 + 26} height={32} rx={6} fill="#0A0503" opacity={0.82} />
	<text x={x + 14} y={y + 28} fill={DIM} fontSize={19} fontFamily={SANS}>{t}</text>
</g>;
const Band: React.FC<{t: string; s: string}> = ({t, s}) => <g>
	<rect x={0} y={0} width={1920} height={58} fill="#0A0503" /><rect x={0} y={58} width={1920} height={1.5} fill={RULE} />
	<text x={40} y={39} fill={INK} fontSize={27} fontWeight={700} fontFamily={SANS}>{t}</text>
	<text x={40 + t.length * 27 + 30} y={38} fill={DIM} fontSize={20} fontFamily={SANS}>{s}</text>
</g>;
const Glow: React.FC<{cx: number; cy: number; rx: number; ry: number; id: string; o?: number}> = ({cx, cy, rx, ry, id, o = 0.5}) => <g>
	<defs><radialGradient id={`gl${id}`}><stop offset="0" stopColor="#4A2A14" stopOpacity={o} /><stop offset="1" stopColor="#4A2A14" stopOpacity="0" /></radialGradient></defs>
	<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#gl${id})`} /></g>;

const OptionFrame: React.FC<{look: Look}> = ({look: L}) => { const id = L.key, [t, s] = TITLES[id];
	const k0 = 1660 / A.L;                                         // 2.99 px/mm → 1660 px = 86 % of 1920
	return <svg width={1920} height={1080}>
		<Glow cx={960} cy={215} rx={1100} ry={190} id={`o${id}`} />
		<SwordFlatX M={H(130, 212, k0)} look={L} id={`w${id}`} />
		<text x={1790} y={300} fill={DIM} fontSize={17} fontFamily={SANS} textAnchor="end">通长 55.6 cm · 剑身 47.3 cm · 茎 8.4 cm · 格宽 5 cm · 剑身宽 4.6 cm</text>
		{/* 1 · guard + inscription, tip up, 5 px/mm */}
		<Panel x={40} y={330} w={330} h={720} t="剑格 + 铭文 · 5 px/mm" id={`p1${id}`}>
			<Glow cx={205} cy={700} rx={220} ry={380} id={`p1g${id}`} o={0.35} />
			<SwordFlatX M={V(205, 1030, 72, 5)} look={L} id={`g${id}`} />
		</Panel>
		{/* 2 · pommel face 7 px/mm, and the guard's back face (turquoise) */}
		<Panel x={390} y={330} w={340} h={720} t="剑首正面 · 11 道同心圆 · 7 px/mm" id={`p2${id}`}>
			<Glow cx={560} cy={540} rx={220} ry={220} id={`p2g${id}`} o={0.4} />
			<PommelFaceX cx={560} cy={540} k={7} look={L} id={`pf${id}`} />
			<text x={404} y={800} fill={DIM} fontSize={19} fontFamily={SANS}>剑格背面 · 绿松石 · 5 px/mm</text>
			<defs><clipPath id={`bk${id}`}><rect x={390} y={815} width={340} height={235} /></clipPath></defs>
			<g clipPath={`url(#bk${id})`}><SwordFlatX M={V(560, 1020, 76, 5)} look={L} id={`b${id}`} back marks={false} /></g>
		</Panel>
		{/* 3 · grip with the two hoops, 5 px/mm; below it the whole sword at 30 % of the frame width */}
		<Panel x={750} y={330} w={560} h={720} t="剑茎 + 两道箍 + 剑首侧面 · 5 px/mm" id={`p3${id}`}>
			<Glow cx={1030} cy={480} rx={330} ry={140} id={`p3g${id}`} o={0.4} />
			<SwordFlatX M={H(770, 480, 5)} look={L} id={`h${id}`} />
			<rect x={750} y={660} width={560} height={1.5} fill={RULE} />
			<text x={764} y={694} fill={DIM} fontSize={19} fontFamily={SANS}>手机预览：剑长 = 30% 画幅宽（576 px）</text>
			<Glow cx={1030} cy={860} rx={330} ry={90} id={`p3h${id}`} o={0.45} />
			<SwordFlatX M={H(1030 - 288, 860, 576 / A.L)} look={L} id={`s${id}`} />
		</Panel>
		{/* 4 · the blade pattern at macro scale, tip up, 11 px/mm, around s ≈ 215–275 */}
		<Panel x={1330} y={330} w={550} h={720} t="剑身菱格（微距）· 11 px/mm" id={`p4${id}`}>
			<SwordFlatX M={V(1605, 1050, A.blade0 + 205, 11)} look={L} id={`m${id}`} hilt={false} marks={false} />
		</Panel>
		<Band t={t} s={s} />
	</svg>; };

const Compare: React.FC = () => { const cells: {key: string; t: string; x: number; y: number}[] = [
	{key: 'NOW', t: '现在的剑（swordspec53s · props53.Sword）', x: 0, y: 60}, {key: 'A', t: 'A · 博物馆写实', x: 960, y: 60},
	{key: 'B', t: 'B · 清晰主角', x: 0, y: 570}, {key: 'C', t: 'C · 课本金（推荐）', x: 960, y: 570}];
	const k = 860 / A.L;                                           // 1.55 px/mm, the same for all four
	return <svg width={1920} height={1080}>
		{cells.map((c) => { const x0 = c.x + 50, y = c.y + 150;
			return <g key={c.key}>
				<Glow cx={c.x + 480} cy={y} rx={560} ry={110} id={`c${c.key}`} o={0.45} />
				<text x={c.x + 40} y={c.y + 50} fill={INK} fontSize={24} fontWeight={700} fontFamily={SANS}>{c.t}</text>
				{c.key === 'NOW' ? <SwordNow x={x0} y={y} k={k * 10} rot={90} id="now0" />
					: <SwordFlatX M={H(x0, y, k)} look={VARIANTS[c.key as 'A' | 'B' | 'C']} id={`c0${c.key}`} />}
				{/* the guard end at 4 px/mm and the sword at 30 % width */}
				<defs><clipPath id={`cc${c.key}`}><rect x={c.x + 40} y={c.y + 250} width={420} height={230} rx={8} /></clipPath></defs>
				<rect x={c.x + 40} y={c.y + 250} width={420} height={230} rx={8} fill="#0E0705" stroke={RULE} />
				<g clipPath={`url(#cc${c.key})`}>{c.key === 'NOW' ? <SwordNow x={c.x + 40 - 10 * 4} y={c.y + 365} k={40} rot={90} id="now1" />
					: <SwordFlatX M={H(c.x + 40 - 10 * 4, c.y + 365, 4)} look={VARIANTS[c.key as 'A' | 'B' | 'C']} id={`c1${c.key}`} />}</g>
				<text x={c.x + 52} y={c.y + 272} fill={DIM} fontSize={16} fontFamily={SANS}>剑柄 + 剑格 · 4 px/mm</text>
				{c.key === 'NOW' ? <SwordNow x={c.x + 490} y={c.y + 365} k={576 * 0.75 / A.L * 10} rot={90} id="now2" />
					: <SwordFlatX M={H(c.x + 490, c.y + 365, 576 / A.L * 0.75)} look={VARIANTS[c.key as 'A' | 'B' | 'C']} id={`c2${c.key}`} />}
				<text x={c.x + 490} y={c.y + 420} fill={DIM} fontSize={16} fontFamily={SANS}>30% 画幅宽 × 0.75（432 px）</text>
			</g>; })}
		<rect x={959} y={60} width={2} height={1020} fill={RULE} /><rect x={0} y={569} width={1920} height={2} fill={RULE} />
		<Band t="对比 · 现在 vs A / B / C" s="同一视角、同一比例（整剑 1.55 px/mm，近景 4 px/mm）" />
	</svg>; };

const Sheet: React.FC = () => { const f = useCurrentFrame();
	return <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, #2A170D 0%, ${BG} 70%)`}}>
		{f < 3 ? <OptionFrame look={VARIANTS[(['A', 'B', 'C'] as const)[f]]} /> : <Compare />}
	</AbsoluteFill>; };
const Root: React.FC = () => <Composition id="SWORDDESIGN" component={Sheet} width={1920} height={1080} fps={30} durationInFrames={4} />;
registerRoot(Root);
