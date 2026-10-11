import React from 'react';
import {CardText, GOLD, GoldTitle, H, INK, Label, Pill, SANS, SERIF, W, hash, type KF} from './common';
import lines from './data/ep25.json';

export const LINES25 = lines;
const FIELD = '#c9b98a';
const CAPC = '#4f6b3a';
const PAPER = '#efe4c8';
const INKC = '#2e2620';

/* ---------- pieces ---------- */
const Cap: React.FC<{x: number; y: number; s?: number; gold?: boolean; you?: boolean; dim?: boolean}> = ({x, y, s = 1, gold, you, dim}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} opacity={dim ? 0.25 : 1}>
		<ellipse cx={0} cy={9} rx={13} ry={6} fill={gold ? '#b8862a' : '#3d5530'} />
		<circle r={12} fill={gold ? GOLD : CAPC} />
		{you ? <circle r={20} fill="none" stroke={GOLD} strokeWidth={4} /> : null}
	</g>
);

const Field: React.FC = () => (
	<g>
		<rect width={W} height={H} fill={FIELD} />
		{Array.from({length: 24}, (_, i) => <line key={i} x1={0} x2={W} y1={i * 46} y2={i * 46} stroke="#bba976" strokeWidth={2} opacity={0.4} />)}
	</g>
);

/** n caps in rows of k, leftover caps gold */
const Rows: React.FC<{n: number; k: number; x: number; y: number; gap?: number; s?: number; label?: string}> = ({n, k, x, y, gap = 30, s = 0.9, label}) => {
	const full = Math.floor(n / k) * k;
	return (
		<g>
			{Array.from({length: n}, (_, i) => {
				const row = Math.floor(i / k), col = i % k;
				return <Cap key={i} x={x + row * gap} y={y + col * gap} s={s} gold={i >= full} />;
			})}
			{label ? <Label x={x + (Math.ceil(n / k) * gap) / 2} y={y - 30} size={30} col={INKC} weight={700}>{label}</Label> : null}
		</g>
	);
};

const Scroll: React.FC<{x: number; y: number; w: number; h: number; children?: React.ReactNode}> = ({x, y, w, h, children}) => (
	<g>
		<rect x={x} y={y} width={w} height={h} fill={PAPER} stroke="#b9ad96" strokeWidth={3} />
		<rect x={x - 24} y={y - 10} width={24} height={h + 20} rx={10} fill="#8a6440" />
		<rect x={x + w} y={y - 10} width={24} height={h + 20} rx={10} fill="#8a6440" />
		{children}
	</g>
);

/** vertical classical text, columns right → left */
const VText: React.FC<{x: number; y: number; cols: string[]; size?: number; hi?: string[]}> = ({x, y, cols, size = 42, hi = []}) => (
	<g>
		{cols.map((c, ci) => (
			<g key={ci}>
				{[...c].map((ch, i) => (
					<text key={i} x={x - ci * size * 1.5} y={y + i * size * 1.12} textAnchor="middle" style={{fontFamily: SERIF, fontSize: size, fontWeight: 700}} fill={hi.some((h) => c.includes(h) && h.includes(ch)) ? '#b8862a' : INKC}>
						{ch}
					</text>
				))}
			</g>
		))}
	</g>
);

const Block: React.FC<{x: number; y: number; v: string; w?: number; gold?: boolean}> = ({x, y, v, w = 150, gold}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect x={-w / 2} y={-50} width={w} height={84} rx={10} fill={gold ? GOLD : '#a0784a'} stroke="#5a3e28" strokeWidth={3} />
		<text y={10} textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 900, fontVariantNumeric: 'lining-nums'}} fill={gold ? '#3a2a10' : '#fff7e6'}>{v}</text>
	</g>
);

/* ---------- frames ---------- */
export const FRAMES25: KF[] = [
	{
		sc: 'Sc1 冷开场', t: 0.6, note: '俯视操场：约128顶军帽（只画帽子），报数气泡一路跑到“58、5…”时变红断掉；金圈那顶是“你”（示意）',
		draw: () => (
			<g>
				<Field />
				{Array.from({length: 128}, (_, i) => {
					const r = Math.floor(i / 16), c = i % 16;
					return <Cap key={i} x={480 + c * 62 + (hash(i, 1) - 0.5) * 22} y={180 + r * 78 + (hash(i, 2) - 0.5) * 20} s={1.4} you={i === 70} />;
				})}
				{['56', '57', '58', '5…'].map((t, k) => (
					<g key={k} transform={`translate(${620 + k * 130} ${150})`}>
						<rect x={-44} y={-34} width={88} height={52} rx={26} fill={k === 3 ? '#d64b3f' : '#fff'} />
						<text y={2} textAnchor="middle" style={{fontFamily: SANS, fontSize: 30, fontWeight: 700}} fill={k === 3 ? '#fff' : INKC}>{t}</text>
					</g>
				))}
				<Pill x={1700} y={180} text="示意" dark={false} />
			</g>
		),
	},
	{
		sc: 'Sc1', t: 9.5, note: '排三次队：3人一排多2、5人一排多3、7人一排多2（多出来的是金色）；方框依次填 2 · 3 · 2，金色“128”盖章',
		draw: () => (
			<g>
				<Field />
				<Rows n={20} k={3} x={140} y={340} label="三人一排" />
				<Rows n={23} k={5} x={760} y={300} label="五人一排" />
				<Rows n={23} k={7} x={1350} y={260} label="七人一排" />
				{['2', '3', '2'].map((v, k) => (
					<g key={k} transform={`translate(${380 + k * 600} 760)`}>
						<rect x={-50} y={-60} width={100} height={100} rx={10} fill="#fff8e6" stroke={INKC} strokeWidth={3} />
						<text y={10} textAnchor="middle" style={{fontFamily: SANS, fontSize: 60, fontWeight: 900}} fill="#b8862a">{v}</text>
					</g>
				))}
				<Label x={960} y={640} size={110} col={GOLD} weight={900}>128</Label>
				<Pill x={960} y={860} text="示意：画面只排了一部分人" dark={false} size={24} />
			</g>
		),
	},
	{
		sc: 'Sc1 传说', t: 12.2, note: '水墨军营，一面写着“韩”的旗；标签“传说”（不画兵器）',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#e9e3d4" />
				<path d="M0,700 C400,640 800,690 1200,650 C1500,630 1700,660 1920,640 L1920,1080 L0,1080 Z" fill="#cfc6b2" />
				<path d="M0,560 C300,520 700,560 1100,520 C1400,500 1700,530 1920,510 L1920,700 L0,700 Z" fill="#bcb39e" opacity={0.6} />
				{Array.from({length: 7}, (_, i) => (
					<g key={i} transform={`translate(${300 + i * 210} ${680 - (i % 2) * 20})`}>
						<path d="M-60,0 L0,-70 L60,0 Z" fill="#8a8274" opacity={0.7} />
					</g>
				))}
				<line x1={960} y1={760} x2={960} y2={250} stroke="#3a2e24" strokeWidth={10} />
				<path d="M966,260 L1180,280 L1160,440 L966,430 Z" fill="#a8322b" />
				<text x={1068} y={385} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 110, fontWeight: 900}} fill="#f6efe2">韩</text>
				<Pill x={1300} y={220} text="传说" dark={false} size={34} />
			</g>
		),
	},
	{
		sc: 'Sc2 标题卡（drop 1）', t: 17.6, note: '主题化标题卡：一块木质令牌砸下，标题刻在令牌上；背后军帽重新排成整齐方阵',
		sub: null,
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#2a2418" />
				{Array.from({length: 105}, (_, i) => <Cap key={i} x={160 + (i % 21) * 80} y={140 + Math.floor(i / 21) * 190} s={1.3} gold={i % 21 === 20} dim />)}
				<rect width={W} height={H} fill="#140f08" opacity={0.45} />
				<path d="M360,340 Q360,300 400,300 H1520 Q1560,300 1560,340 V600 Q1560,640 1520,640 H400 Q360,640 360,600 Z" fill="#5a3a22" stroke="#c8913a" strokeWidth={6} />
				<path d="M390,330 H1530 V610 H390 Z" fill="none" stroke="#8a6440" strokeWidth={2} />
				<GoldTitle text="不数人头，怎么点兵？" y={500} size={100} id="t25" />
				<CardText kicker="物不知数 · 孙子算经 · 秦九韶 1247" tagline="只看三个余数，能拼回人数吗？" en="Can three leftovers rebuild a number?" y0={270} />
			</g>
		),
	},
	{
		sc: 'Sc3 筛选', t: 27.0, note: '100到199共100格：三个筛子一个个过——100 → 33 → 6 → 1；此刻剩6格在闪（113 · 128 · 143 · 158 · 173 · 188）',
		draw: () => {
			const keep = new Set([113, 128, 143, 158, 173, 188]);
			return (
				<g>
					<rect width={W} height={H} fill="#f2ead6" />
					{Array.from({length: 100}, (_, i) => {
						const v = 100 + i, on = keep.has(v), r = Math.floor(i / 10), c = i % 10;
						return (
							<g key={i} transform={`translate(${520 + c * 92} ${160 + r * 70})`}>
								<rect x={-40} y={-28} width={80} height={56} rx={6} fill={on ? GOLD : '#d9cfb8'} opacity={on ? 1 : 0.45} />
								<text y={11} textAnchor="middle" style={{fontFamily: SANS, fontSize: 28, fontWeight: on ? 900 : 500, fontVariantNumeric: 'lining-nums'}} fill={INKC} opacity={on ? 1 : 0.5}>{v}</text>
							</g>
						);
					})}
					<g transform="translate(180 300)">
						<rect x={-130} y={-80} width={260} height={150} rx={14} fill="#2e2620" />
						<text y={-30} textAnchor="middle" style={{fontFamily: SANS, fontSize: 26}} fill={INK}>还剩可能</text>
						<text y={40} textAnchor="middle" style={{fontFamily: SANS, fontSize: 70, fontWeight: 900}} fill={GOLD}>6</text>
					</g>
					<Pill x={180} y={520} text="五人一排 · 多3" />
				</g>
			);
		},
	},
	{
		sc: 'Sc4 原书', t: 40.0, note: '一卷古书展开：《孙子算经》卷下原文竖排，“剩二·剩三·剩二”依次变金；书里没有人、没有兵',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#e3d8bf" />
				<Scroll x={360} y={120} w={1200} h={720}>
					<VText x={1400} y={210} size={44} cols={['今有物不知其数', '三三数之剩二', '五五数之剩三', '七七数之剩二', '问物几何']} hi={['剩二', '剩三']} />
					<text x={420} y={220} style={{fontFamily: SERIF, fontSize: 40, fontWeight: 900}} fill="#8a2a1c">《孙子算经》卷下</text>
					<text x={420} y={290} style={{fontFamily: SANS, fontSize: 26}} fill="#5a5048">成书约公元3—5世纪（学界说法不一）</text>
					<text x={420} y={340} style={{fontFamily: SANS, fontSize: 26}} fill="#5a5048">作者生平不详，不是写兵法的孙武</text>
				</Scroll>
			</g>
		),
	},
	{
		sc: 'Sc5 70 · 21 · 15（breakdown）', t: 49.5, note: '70人三人一排多1、五人七人排满；三块算筹 70 · 21 · 15 落在书上',
		draw: () => (
			<g>
				<Field />
				<Rows n={70} k={3} x={160} y={420} gap={34} s={0.95} label="70 · 三人一排：多1" />
				<Block x={1280} y={260} v="70" gold />
				<Block x={1480} y={260} v="21" />
				<Block x={1680} y={260} v="15" />
				<Label x={1480} y={420} size={34} col={INKC} weight={500}>70：只在三人一排时多1</Label>
				<Label x={1480} y={480} size={34} col={INKC} weight={500}>21：只在五人一排时多1</Label>
				<Label x={1480} y={540} size={34} col={INKC} weight={500}>15：只在七人一排时多1</Label>
			</g>
		),
	},
	{
		sc: 'Sc5 都对', t: 61.0, note: '105个座位围成一圈：23、128、233依次点亮 ——每隔105，一个答案',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#f2ead6" />
				{Array.from({length: 105}, (_, i) => {
					const a = (i / 105) * Math.PI * 2 - Math.PI / 2;
					const lit = i === 23 % 105;
					return <Cap key={i} x={960 + Math.cos(a) * 340} y={490 + Math.sin(a) * 340} s={1.1} gold={lit} />;
				})}
				<Label x={960} y={460} size={64} col={INKC}>23 · 128 · 233</Label>
				<Label x={960} y={540} size={34} col="#5a5048" weight={500}>每隔105，一个答案</Label>
			</g>
		),
	},
	{
		sc: 'Sc6 求一（1247）', t: 68.5, note: '时间线只往前走：1247 · 南宋 · 秦九韶《数书九章》，牌匾“大衍求一术”；35乘2 = 70，除以3剩1',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#e3d8bf" />
				<line x1={0} x2={W} y1={860} y2={860} stroke="#8a6440" strokeWidth={6} />
				{[['3—5世纪', 240], ['1247', 960], ['今天', 1700]].map(([t, x]) => (
					<g key={t as string}>
						<circle cx={x as number} cy={860} r={12} fill={t === '1247' ? GOLD : '#8a6440'} />
						<Label x={x as number} y={850 - 24} size={28} col={INKC} weight={500}>{t}</Label>
					</g>
				))}
				<rect x={560} y={150} width={800} height={160} rx={10} fill="#5a3a22" stroke="#c8913a" strokeWidth={5} />
				<text x={960} y={260} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 88, fontWeight: 900}} fill="#f6efe2">大衍<tspan fill={GOLD}>求一</tspan>术</text>
				<Pill x={960} y={370} text="1247 · 南宋 · 秦九韶《数书九章》" dark={false} />
				<Block x={680} y={560} v="35 × 1" w={220} />
				<Block x={960} y={560} v="35 × 2" w={220} gold />
				<Label x={680} y={660} size={32} col="#5a5048" weight={500}>÷3 剩2</Label>
				<Label x={960} y={660} size={32} col="#b8862a">÷3 剩1 → 70</Label>
				<Label x={1360} y={580} size={30} col="#5a5048" weight={500} font={SANS}>35 = 5×7：五人、七人都排满</Label>
			</g>
		),
	},
	{
		sc: 'Sc7 钥匙里的三个数', t: 78.0, note: '今天：RSA 解密钥匙展开成字段卡（无真实密钥内容），最后三行 dP · dQ · qInv 依次亮起，旁注标准原文“CRT …”',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#1b1f27" />
				<rect x={560} y={130} width={800} height={700} rx={18} fill="#262c36" stroke="#4a5262" strokeWidth={3} />
				<text x={600} y={190} style={{fontFamily: SANS, fontSize: 30, fontWeight: 700}} fill={INK}>RSA 解密钥匙（字段示意）</text>
				{[['n', ''], ['e', ''], ['d', ''], ['p', ''], ['q', ''], ['dP', 'CRT exponent'], ['dQ', 'CRT exponent'], ['qInv', 'CRT coefficient']].map(([k, v], i) => (
					<g key={k} transform={`translate(600 ${250 + i * 70})`}>
						<rect width={720} height={54} rx={8} fill={i >= 5 ? '#3a3220' : '#2e343f'} />
						<text x={24} y={37} style={{fontFamily: '"DejaVu Sans Mono", monospace', fontSize: 28, fontWeight: 700}} fill={i >= 5 ? GOLD : '#c9ced6'}>{k}</text>
						<text x={160} y={37} style={{fontFamily: '"DejaVu Sans Mono", monospace', fontSize: 24}} fill="#6a7280">{'▒'.repeat(14)}</text>
						{v ? <text x={700} y={37} textAnchor="end" style={{fontFamily: SANS, fontSize: 22}} fill="#a9b0ba">{v}</text> : null}
					</g>
				))}
				<Pill x={960} y={890} text="IETF RFC 8017 · PKCS #1" size={24} />
			</g>
		),
	},
	{
		sc: 'Sc7 drop 2', t: 82.4, note: '三个“CRT”飞到一起展开：Chinese Remainder Theorem → 金色大字“中国剩余定理”；古卷在后面展开',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#1b1f27" />
				<g opacity={0.35}>
					<Scroll x={360} y={160} w={1200} h={620}>
					</Scroll>
				</g>
				<Label x={960} y={380} size={44} col="#c9ced6" weight={500} font={SANS}>Chinese Remainder Theorem</Label>
				<Label x={960} y={540} size={130} col={GOLD} weight={900}>中国剩余定理</Label>
			</g>
		),
	},
	{
		sc: 'Sc8 前提', t: 104.5, note: '除数不能有公因数：4人一排剩1（单数）、6人一排剩2（双数），同一群人不可能既单又双 → ✕ 无解（示意）',
		draw: () => (
			<g>
				<Field />
				<Rows n={13} k={4} x={300} y={330} gap={40} s={1.2} label="四人一排 · 剩1" />
				<Rows n={14} k={6} x={1200} y={300} gap={40} s={1.2} label="六人一排 · 剩2" />
				<Label x={460} y={680} size={44} col={INKC}>单数</Label>
				<Label x={1300} y={680} size={44} col={INKC}>双数</Label>
				<g transform="translate(900 470)">
					<path d="M-60,-60 L60,60 M60,-60 L-60,60" stroke="#b8322b" strokeWidth={16} strokeLinecap="round" />
				</g>
				<Pill x={900} y={800} text="4 和 6 都含 2 · 示意" dark={false} />
			</g>
		),
	},
	{
		sc: 'Sc9 结尾', t: 113.5, note: '回到操场：队伍整整齐齐，三人一排，最后2个金色帽子一闪；“你”那顶帽子不再低头。计数：128',
		draw: () => (
			<g>
				<Field />
				{Array.from({length: 128}, (_, i) => {
					const r = i % 3, c = Math.floor(i / 3);
					return <Cap key={i} x={230 + c * 34} y={360 + r * 60} s={1.15} gold={i >= 126} you={i === 70} />;
				})}
				<Label x={960} y={260} size={110} col={GOLD} weight={900}>128</Label>
			</g>
		),
	},
];
