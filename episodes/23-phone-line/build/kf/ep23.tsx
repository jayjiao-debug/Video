import React from 'react';
import {POSES, ikArm, jointsAt, type Pose} from '../art/Figure';
import {CAST} from '../art/cast';
import {Person} from '../art/poseCheck';
import {CardText, GOLD, GoldTitle, H, INK, Label, Pill, SANS, SERIF, W, hash, type KF} from './common';
import lines from './data/ep23.json';

export const LINES23 = lines;
const AMBER = '#ffb347';
const GREY = '#7d8590';

/* ---------- pieces ---------- */
const Laptop: React.FC<{dawn?: boolean; half?: number; found?: boolean}> = ({dawn, half = 0, found}) => (
	<g>
		<rect width={W} height={H} fill={dawn ? '#b9c6cf' : '#3c4a5c'} />
		{/* window with rain */}
		<rect x={1240} y={60} width={620} height={520} fill={dawn ? '#dfe6e6' : '#5a6f86'} stroke="#2a2f38" strokeWidth={10} />
		<line x1={1550} x2={1550} y1={60} y2={580} stroke="#2a2f38" strokeWidth={8} />
		{dawn ? (
			<g>
				{[1300, 1420, 1540, 1660, 1780].map((x) => <rect key={x} x={x} y={420} width={6} height={90} fill="#5a5a60" />)}
				<path d="M1240,440 Q1360,452 1420,440 T1660,440 T1860,440" stroke="#4a4a50" strokeWidth={2} fill="none" />
			</g>
		) : (
			Array.from({length: 40}, (_, i) => <line key={i} x1={1250 + hash(i, 1) * 600} x2={1246 + hash(i, 1) * 600} y1={70 + hash(i, 2) * 480} y2={96 + hash(i, 2) * 480} stroke="#cfe0f0" strokeWidth={2} opacity={0.6} />)
		)}
		<radialGradient id="kf23-lamp" cx="0.15" cy="0.25" r="0.6">
			<stop offset="0" stopColor="#ffe2a8" stopOpacity={dawn ? 0.15 : 0.5} />
			<stop offset="1" stopColor="#ffe2a8" stopOpacity="0" />
		</radialGradient>
		<rect width={W} height={H} fill="url(#kf23-lamp)" />
		<rect x={0} y={860} width={W} height={220} fill="#5a4636" />
		{/* laptop screen */}
		<rect x={220} y={120} width={1080} height={700} rx={22} fill="#1d1f24" />
		<rect x={250} y={150} width={1020} height={640} fill="#f4f5f7" />
		<rect x={250} y={150} width={1020} height={44} fill="#dfe3e8" />
		<text x={280} y={180} style={{fontFamily: SANS, fontSize: 22}} fill="#30343a">论文.docx</text>
		{Array.from({length: 9}, (_, i) => <rect key={i} x={290} y={230 + i * 34} width={380 - (i % 3) * 60} height={12} fill="#c9ced6" />)}
		{/* the services list */}
		<rect x={720} y={210} width={520} height={560} fill="#fff" stroke="#c4c9d0" strokeWidth={2} />
		<text x={740} y={244} style={{fontFamily: SANS, fontSize: 24, fontWeight: 700}} fill="#30343a">后台服务</text>
		{Array.from({length: 14}, (_, i) => {
			const off = half > 0 && i >= 14 - Math.round(14 * half);
			const hit = found && i === 9;
			return (
				<g key={i} transform={`translate(740 ${270 + i * 34})`}>
					<rect width={480} height={28} fill={hit ? AMBER : off ? '#e3e6ea' : '#fff8ec'} />
					<rect x={8} y={6} width={16} height={16} fill="none" stroke="#6a707a" strokeWidth={2} />
					{!off && !hit ? <path d="M11,14 L15,18 L22,9" stroke="#2f7a4a" strokeWidth={2.5} fill="none" /> : null}
					<rect x={36} y={10} width={180 + hash(i, 5) * 180} height={8} fill={off ? '#b0b6be' : '#6a707a'} />
				</g>
			);
		})}
		{half ? <line x1={730} x2={1230} y1={270 + 7 * 34 - 3} y2={270 + 7 * 34 - 3} stroke={AMBER} strokeWidth={4} /> : null}
		{!dawn && !half ? (
			[[330, 420], [380, 480], [430, 540]].map(([x, y], i) => (
				<g key={i} transform={`translate(${x} ${y})`}>
					<rect width={340} height={130} rx={8} fill="#fff" stroke="#9aa1aa" strokeWidth={2} />
					<rect width={340} height={34} rx={8} fill="#e6e9ee" />
					<circle cx={40} cy={80} r={20} fill="#d64b3f" />
					<text x={40} y={88} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24, fontWeight: 900}} fill="#fff">!</text>
					<text x={80} y={88} style={{fontFamily: SANS, fontSize: 22}} fill="#30343a">程序没有响应</text>
				</g>
			))
		) : null}
		{found ? (
			<g transform="translate(980 600)">
				<rect x={-240} y={-44} width={480} height={70} rx={12} fill="#1d1f24" opacity={0.85} />
				<text y={4} textAnchor="middle" style={{fontFamily: SANS, fontSize: 28, fontWeight: 700}} fill={AMBER}>某网盘同步服务 · 示意</text>
			</g>
		) : null}
	</g>
);

/** the pole line across dusk fields: n spans, `greyFrom/greyTo` spans greyed */
const PoleLine: React.FC<{y: number; n: number; grey: (i: number) => boolean; x0?: number; x1?: number; poles?: number}> = ({y, n, grey, x0 = 120, x1 = 1800, poles = 21}) => {
	const span = (x1 - x0) / n;
	return (
		<g>
			{Array.from({length: n}, (_, i) => <line key={i} x1={x0 + i * span} x2={x0 + (i + 1) * span} y1={y} y2={y} stroke={grey(i) ? GREY : AMBER} strokeWidth={6} />)}
			{Array.from({length: poles}, (_, i) => {
				const x = x0 + (i / (poles - 1)) * (x1 - x0);
				return <rect key={i} x={x - 4} y={y - 10} width={8} height={130} fill="#4a3826" />;
			})}
			{/* stations */}
			<g transform={`translate(${x0 - 60} ${y + 40})`}>
				<rect x={-50} y={-60} width={100} height={90} fill="#5a4a3a" />
				<path d="M-60,-60 L0,-100 L60,-60 Z" fill="#3a2e24" />
				<rect x={-14} y={-30} width={28} height={26} fill="#ffd27a" />
			</g>
			<g transform={`translate(${x1 + 60} ${y + 40})`}>
				<rect x={-50} y={-60} width={100} height={90} fill="#5a4a3a" />
				<path d="M-60,-60 L0,-100 L60,-60 Z" fill="#3a2e24" />
				<rect x={-14} y={-30} width={28} height={26} fill="#2a2a30" />
			</g>
		</g>
	);
};

const Dusk: React.FC = () => (
	<g>
		<defs>
			<linearGradient id="kf23-dusk" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#4a5a78" />
				<stop offset="0.6" stopColor="#8a8aa0" />
				<stop offset="1" stopColor="#b8a8a0" />
			</linearGradient>
		</defs>
		<rect width={W} height={H} fill="url(#kf23-dusk)" />
		<path d="M0,620 C400,590 900,610 1300,596 C1600,586 1800,600 1920,592 L1920,1080 L0,1080 Z" fill="#4e5e4c" />
		<path d="M0,700 C500,680 1000,700 1920,686 L1920,1080 L0,1080 Z" fill="#3e4e3e" />
		{Array.from({length: 60}, (_, i) => <line key={i} x1={hash(i, 7) * W} x2={hash(i, 7) * W - 4} y1={hash(i, 8) * 900} y2={hash(i, 8) * 900 + 26} stroke="#dfe8f2" strokeWidth={2} opacity={0.35} />)}
	</g>
);

const Counter: React.FC<{x: number; y: number; label: string; v: string; col?: string; size?: number}> = ({x, y, label, v, col = AMBER, size = 72}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect x={-20} y={-size - 30} width={460} height={size + 70} rx={14} fill="#0d1016" opacity={0.6} />
		<text x={0} y={-size + 4} style={{fontFamily: SANS, fontSize: 28, fontWeight: 500}} fill={INK}>{label}</text>
		<text x={0} y={22} style={{fontFamily: SANS, fontSize: size, fontWeight: 900, fontVariantNumeric: 'lining-nums'}} fill={col}>{v}</text>
	</g>
);

const TestPhone: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect x={-50} y={-70} width={100} height={70} rx={8} fill="#4a4a36" />
		<rect x={-30} y={-90} width={60} height={22} rx={10} fill="#2a2a20" />
		<circle cx={60} cy={-36} r={14} fill="none" stroke="#2a2a20" strokeWidth={5} />
		<line x1={60} y1={-36} x2={78} y2={-50} stroke="#2a2a20" strokeWidth={5} />
	</g>
);

/** the wireman at a mid-pole, both hands on the two cut ends of the wire */
const Wireman: React.FC<{at: [number, number]; s: number; id: string}> = ({at, s, id}) => {
	const base: Pose = {...POSES.stand, lean: 4, head: 6};
	const J = jointsAt(base);
	const nearT: [number, number] = [J.neck[0] + 70, J.neck[1] + 70];
	const farT: [number, number] = [J.neck[0] + 30, J.neck[1] + 72];
	const pose: Pose = {...base, armNear: ikArm(base, true, nearT), armFar: ikArm(base, false, farT)};
	const w = (p: [number, number]): [number, number] => [at[0] + p[0] * s, at[1] + p[1] * s];
	const [nx, ny] = w(nearT), [fx, fy] = w(farT);
	return (
		<g>
			{/* wire ends in his hands */}
			<path d={`M${fx - 420},${fy - 70} Q${fx - 200},${fy - 30} ${fx},${fy}`} stroke="#2e333a" strokeWidth={6} fill="none" />
			<path d={`M${nx},${ny} Q${nx + 200},${ny - 30} ${nx + 420},${ny - 60}`} stroke={AMBER} strokeWidth={5} fill="none" />
			<Person id={id} at={at} s={s} intent="stand" env={{ground: at[1], contacts: [{hand: 'near', at: [nx, ny], what: 'holding the right wire end'}, {hand: 'far', at: [fx, fy], what: 'holding the left wire end'}]}} look={CAST.soldier} pose={pose} expression="thinking" rim="warm" shadow={false} hands={{near: 'grip', far: 'grip'}} />
			<path d={`M${nx},${ny} Q${nx - 20},${at[1] - 40} ${at[0] + 150},${at[1] - 60}`} stroke="#2a2a20" strokeWidth={3} fill="none" />
			<TestPhone x={at[0] + 150} y={at[1]} />
		</g>
	);
};

/* ---------- frames ---------- */
export const FRAMES23: KF[] = [
	{
		sc: 'Sc1 冷开场', t: 0.6, note: '第一人称：深夜赶论文，电脑弹出一串报错；后台服务长长一列（踩第1拍弹出第一个报错）',
		draw: () => <Laptop />,
	},
	{
		sc: 'Sc1', t: 4.0, note: '微软官方建议：一次只开一半。列表从中间一刀，下半变灰（踩拍）',
		draw: () => (
			<g>
				<Laptop half={0.5} />
				<Pill x={1560} y={660} text="Microsoft 支持 · 干净启动" />
			</g>
		),
	},
	{
		sc: 'Sc1', t: 10.5, note: '分割线变成一根电话线，穿过雨夜田野：200段，测一半最多8次；两个计数器赛跑',
		draw: () => (
			<g>
				<Dusk />
				<PoleLine y={520} n={200} grey={(i) => i < 100 || i >= 150} poles={21} />
				<Pill x={960} y={440} text="10公里 · 每50米一根杆 · 示意" />
				<Counter x={260} y={300} label="二分（最坏情况）" v="3 / 8" />
				<Counter x={1240} y={300} label="一段段查" v="3 / 200" col="#c9ced6" />
			</g>
		),
	},
	{
		sc: 'Sc2 标题卡（drop 1）', t: 17.6, note: '主题化标题卡：标题挂在两根电线杆之间的电话线上，正中一个剪口亮起琥珀色，雨丝斜落',
		sub: null,
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#1c2230" />
				{Array.from({length: 80}, (_, i) => <line key={i} x1={hash(i, 9) * W} x2={hash(i, 9) * W - 5} y1={hash(i, 10) * H} y2={hash(i, 10) * H + 30} stroke="#cfe0f0" strokeWidth={2} opacity={0.18} />)}
				<rect x={150} y={330} width={22} height={750} fill="#3a2e24" />
				<rect x={1748} y={330} width={22} height={750} fill="#3a2e24" />
				<rect x={120} y={340} width={82} height={12} fill="#3a2e24" />
				<rect x={1718} y={340} width={82} height={12} fill="#3a2e24" />
				<path d="M160,346 Q560,402 950,404" stroke={GREY} strokeWidth={5} fill="none" />
				<path d="M970,404 Q1360,402 1760,346" stroke={AMBER} strokeWidth={5} fill="none" />
				<circle cx={960} cy={404} r={14} fill={AMBER} opacity={0.9} />
				<GoldTitle text="200段线，最多查8次" y={500} size={92} id="t23" />
				<CardText kicker="BINARY SEARCH · FIELD WIRE · GIT BISECT" tagline="坏在哪一段？最少要查几次？" en="Where is the break — and how few checks does it take?" y0={300} />
			</g>
		),
	},
	{
		sc: 'Sc3 走到一半', t: 28.5, note: '通信兵在中点电杆：剪开线、接上测试电话，往两边各试一次（双手各握一个线头，姿势已校验）',
		draw: () => (
			<g>
				<Dusk />
				<rect x={900} y={300} width={16} height={560} fill="#4a3826" />
				<Wireman at={[820, 860]} s={1.5} id="wireman-cut" />
				<Label x={380} y={330} size={40} col="#e9e3d6">← 这边？</Label>
				<Label x={1540} y={330} size={40} col="#e9e3d6">那边？ →</Label>
				<Pill x={960} y={170} text="美军通信兵教程 · SS0437" />
			</g>
		),
	},
	{
		sc: 'Sc3 摇手柄', t: 32.0, note: '摇手柄呼叫：左边总机的灯亮了，有人接 ——左半是好的，变灰；故障在右半',
		draw: () => (
			<g>
				<Dusk />
				<PoleLine y={500} n={40} grey={(i) => i < 20} poles={21} />
				<g transform="translate(60 380)">
					<rect x={-10} y={-80} width={150} height={60} rx={10} fill="#f4efe2" />
					<text x={65} y={-40} textAnchor="middle" style={{fontFamily: SANS, fontSize: 30, fontWeight: 700}} fill="#2a2620">喂？</text>
				</g>
				<circle cx={60} cy={530} r={60} fill="#ffd27a" opacity={0.35} />
				<Pill x={960} y={300} text="有人接 = 这边是好的" />
				<g transform="translate(1500 760)">
					<rect x={-160} y={-120} width={320} height={200} rx={16} fill="#0d1016" opacity={0.6} />
					<TestPhone x={0} y={40} />
					<text x={0} y={-70} textAnchor="middle" style={{fontFamily: SANS, fontSize: 26}} fill={INK}>摇手柄 = 呼叫对方</text>
				</g>
			</g>
		),
	},
	{
		sc: 'Sc4 为什么是8次', t: 46.5, note: '线拉直成200格：200→100→50→25→13→7→4→2→1，每拍灰掉一半；第8次只剩1段（最坏情况）',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#1d222b" />
				{Array.from({length: 200}, (_, i) => <rect key={i} x={160 + i * 8} y={520} width={6} height={60} fill={i >= 112 && i < 113 ? AMBER : GREY} opacity={i === 112 ? 1 : 0.6} />)}
				{['200', '100', '50', '25', '13', '7', '4', '2', '1'].map((v, k) => (
					<g key={k} transform={`translate(${200 + k * 180} 380)`}>
						<text textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 900, fontVariantNumeric: 'lining-nums'}} fill={k === 8 ? AMBER : INK}>{v}</text>
						{k > 0 ? <text y={50} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24}} fill="#a9b0ba">第{k}次</text> : null}
					</g>
				))}
				<Label x={960} y={740} size={40} col={INK} weight={500}>2⁸ = 256 ≥ 200　·　7次：128，不够</Label>
				<Pill x={960} y={250} text="最坏情况" />
			</g>
		),
	},
	{
		sc: 'Sc4 一百万', t: 60.0, note: '一百万个位置：逐个查最坏100万次，二分只要20次',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#1d222b" />
				<rect x={160} y={540} width={1600} height={50} fill={GREY} opacity={0.5} />
				<rect x={1203} y={540} width={4} height={50} fill={AMBER} />
				<Counter x={300} y={360} label="逐个查（最坏）" v="1,000,000" col="#c9ced6" size={84} />
				<Counter x={1180} y={360} label="二分" v="20 次" size={84} />
			</g>
		),
	},
	{
		sc: 'Sc5 drop 2', t: 82.6, note: '上万个软件版本排成一条：每拍对半灰掉，落在“≈15步”；来源卡注明是一位开发者的最好情况',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#16191f" />
				{Array.from({length: 160}, (_, i) => <rect key={i} x={160 + i * 10} y={500} width={8} height={90} rx={2} fill={i === 101 ? AMBER : GREY} opacity={i === 101 ? 1 : 0.45} />)}
				<Label x={960} y={380} size={120} col={AMBER} weight={900}>≈ 15 步</Label>
				<Label x={960} y={680} size={32} col="#c9ced6" weight={500} font={SANS}>git bisect：二分找出“改坏软件的那一版”</Label>
				<Pill x={960} y={790} text="据 Ingo Molnar · Linux 内核开发者 · Couder 2009 · 最好情况" size={24} />
			</g>
		),
	},
	{
		sc: 'Sc6 前提', t: 98.5, note: '判断错一次：听错“喂？”，真正的断点被灰进了错误的一半，搜索往另一边跑偏',
		draw: () => (
			<g>
				<Dusk />
				<PoleLine y={500} n={40} grey={(i) => i < 20} poles={21} />
				<g transform="translate(560 500)">
					<circle r={26} fill="none" stroke="#ff5a4e" strokeWidth={5} />
					<path d="M-8,-30 L8,30" stroke="#ff5a4e" strokeWidth={4} />
				</g>
				<Label x={560} y={420} size={34} col="#ff9a8e" weight={700}>真正的断点（被排除了）</Label>
				<Pill x={1400} y={420} text="错 1 次 → 后面全跑偏" />
				<Label x={1400} y={620} size={44} col={AMBER}>搜索 →→→</Label>
			</g>
		),
	},
	{
		sc: 'Sc7 天亮', t: 109.5, note: '回到电脑：天亮前找到了——一个同步服务（示意，无品牌）；窗外雨停，远处电线杆',
		draw: () => <Laptop dawn found half={0} />,
	},
];

export {SERIF};
