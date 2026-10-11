import React from 'react';
import {POSES, ikArm, jointsAt, type Look, type Pose} from '../art/Figure';
import {CAST} from '../art/cast';
import {Person, type Surface} from '../art/poseCheck';
import {CardText, GOLD, GoldTitle, H, INK, Label, Pill, SANS, SERIF, W, hash, type KF} from './common';
import lines from './data/ep24.json';

export const LINES24 = lines;
const PARCH = '#efe4c8';
const INKC = '#3a2e22';

/* ---------- pieces ---------- */
const NightSky: React.FC<{comet?: boolean}> = ({comet = true}) => (
	<g>
		<defs>
			<linearGradient id="kf24-night" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#141a33" />
				<stop offset="1" stopColor="#3a3f5e" />
			</linearGradient>
			<linearGradient id="kf24-tail" x1="1" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#fff6dc" stopOpacity="0.95" />
				<stop offset="1" stopColor="#bcd6ff" stopOpacity="0" />
			</linearGradient>
		</defs>
		<rect width={W} height={H} fill="url(#kf24-night)" />
		{Array.from({length: 90}, (_, i) => <circle key={i} cx={hash(i, 1) * W} cy={hash(i, 2) * 700} r={1 + hash(i, 3) * 1.8} fill="#fff" opacity={0.3 + hash(i, 4) * 0.6} />)}
		{comet ? (
			<g>
				<path d="M1260,300 L560,640 L600,700 Z" fill="url(#kf24-tail)" opacity={0.85} />
				<circle cx={1260} cy={300} r={16} fill="#fffaf0" />
				<circle cx={1260} cy={300} r={40} fill="#fff6dc" opacity={0.25} />
			</g>
		) : null}
	</g>
);

const Rooftops: React.FC<{y?: number}> = ({y = 820}) => (
	<g>
		{Array.from({length: 9}, (_, i) => {
			const x = i * 230 - 40, h = 140 + (i % 3) * 50;
			return (
				<g key={i}>
					<rect x={x} y={y - h} width={210} height={h + 300} fill="#1c1f2e" />
					<path d={`M${x - 10},${y - h} L${x + 105},${y - h - 80} L${x + 220},${y - h} Z`} fill="#141625" />
					<rect x={x + 80} y={y - h + 40} width={40} height={46} fill={i % 2 ? '#ffd27a' : '#2a2d3e'} />
				</g>
			);
		})}
	</g>
);

const PhoneEdge: React.FC<{stamp: string}> = ({stamp}) => (
	<g>
		<path d={`M0,0 H${W} V${H} H0 Z M120,90 H${W - 120} V${H - 40} H120 Z`} fill="#0b0b0e" fillRule="evenodd" opacity={0.92} />
		<rect x={120} y={90} width={W - 240} height={50} fill="#000" opacity={0.35} />
		<text x={160} y={124} style={{fontFamily: SANS, fontSize: 24}} fill="#fff">{stamp}</text>
		<circle cx={W - 160} cy={115} r={9} fill="#ff4d4d" />
	</g>
);

const Parchment: React.FC = () => (
	<g>
		<rect width={W} height={H} fill={PARCH} />
		{Array.from({length: 30}, (_, i) => <circle key={i} cx={hash(i, 21) * W} cy={hash(i, 22) * H} r={40 + hash(i, 23) * 120} fill="#d9c9a4" opacity={0.12} />)}
	</g>
);

/** orbit diagram: sun at (cx,cy), comet ellipse */
const Ellipse: React.FC<{cx: number; cy: number; rx: number; ry: number; rot?: number; col?: string; w?: number; dash?: string; o?: number}> = ({cx, cy, rx, ry, rot = -12, col = INKC, w = 3, dash, o = 1}) => (
	<ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill="none" stroke={col} strokeWidth={w} strokeDasharray={dash} opacity={o} />
);

const Sun: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<circle cx={x} cy={y} r={34} fill="#f0b23c" />
		<circle cx={x} cy={y} r={52} fill="#f0b23c" opacity={0.2} />
	</g>
);

/** a seated person at a desk: seat surface, hands on the desk; returns the element (pose-checked) */
const seatedAt = (id: string, look: Look, x: number, seatY: number, deskY: number, s: number, opts: {head?: number; lean?: number; reachX?: number; expr?: 'neutral' | 'thinking' | 'smile'} = {}) => {
	const base: Pose = {...POSES.sit, lean: opts.lean ?? 10, head: opts.head ?? 14, legNear: [84, 86], legFar: [80, 88]};
	const J = jointsAt(base);
	const at: [number, number] = [x, seatY - 12 * s - J.hip[1] * s];
	const fig = (p: [number, number]): [number, number] => [(p[0] - at[0]) / s, (p[1] - at[1]) / s];
	const nearW: [number, number] = [x + (opts.reachX ?? 100) * s, deskY - 4];
	const farW: [number, number] = [x + ((opts.reachX ?? 100) - 34) * s, deskY - 6];
	const pose: Pose = {...base, armNear: ikArm(base, true, fig(nearW)), armFar: ikArm(base, false, fig(farW))};
	const seat: Surface = {x0: x - 50 * s, x1: x + 40 * s, y: seatY, depth: 20, name: 'chair'};
	return {
		el: (
			<g>
				{/* chair */}
				<rect x={seat.x0} y={seatY} width={seat.x1 - seat.x0} height={14} fill="#5a3e28" />
				<rect x={seat.x0} y={seatY - 120 * s} width={12} height={120 * s} fill="#5a3e28" />
				<rect x={seat.x0 + 4} y={seatY} width={10} height={70 * s} fill="#4a3220" />
				<rect x={seat.x1 - 14} y={seatY} width={10} height={70 * s} fill="#4a3220" />
				<Person id={id} at={at} s={s} intent="sit" env={{seat, contacts: [{hand: 'near', at: nearW, what: 'writing on the desk'}, {hand: 'far', at: farW, what: 'resting on the desk'}]}} look={look} pose={pose} expression={opts.expr ?? 'thinking'} rim="warm" shadow={false} hands={{near: 'pinch', far: 'relaxed'}} />
			</g>
		),
		pen: nearW,
	};
};

const Desk: React.FC<{x0: number; x1: number; y: number}> = ({x0, x1, y}) => (
	<g>
		<rect x={x0} y={y} width={x1 - x0} height={18} fill="#6a4a30" />
		<rect x={x0 + 20} y={y + 18} width={14} height={1080 - y} fill="#4a3220" />
		<rect x={x1 - 34} y={y + 18} width={14} height={1080 - y} fill="#4a3220" />
	</g>
);

const HALLEY: Look = {...CAST.bach, top: '#3a3040', accent: '#6a5a4a'};

/* ---------- frames ---------- */
export const FRAMES24: KF[] = [
	{
		sc: 'Sc1 冷开场', t: 0.6, note: '第一人称：你的手机对着屋顶上空一颗亮彗星（只露手机边框，不画手）；踩第1拍彗尾一亮',
		draw: () => (
			<g>
				<NightSky />
				<Rooftops />
				<PhoneEdge stamp="● REC" />
			</g>
		),
	},
	{
		sc: 'Sc1 转折', t: 5.0, note: '两条人生尺：你的一生 vs 预言者（1656—）；年龄计数跑到102；1742年之后变成虚线，标“推算”',
		draw: () => (
			<g>
				<NightSky comet={false} />
				<g transform="translate(260 420)">
					<text y={-30} style={{fontFamily: SANS, fontSize: 30}} fill={INK}>你的一生（示意）</text>
					<rect width={980} height={26} rx={13} fill="#7fa7d8" />
				</g>
				<g transform="translate(260 600)">
					<text y={-30} style={{fontFamily: SANS, fontSize: 30}} fill="#f0dcb0">预言者 · 1656 —</text>
					<rect width={1000} height={26} rx={13} fill="#c9a35e" />
					<line x1={1000} x2={1340} y1={13} y2={13} stroke="#c9a35e" strokeWidth={10} strokeDasharray="12 10" opacity={0.6} />
					<Label x={1000} y={80} size={30} col="#f0dcb0" weight={500}>1742</Label>
					<Label x={1340} y={80} size={30} col={GOLD}>1758</Label>
					<Label x={1170} y={-24} size={26} col="#c9c2b4" weight={500} font={SANS}>推算</Label>
					<Label x={1380} y={0} size={72} col={GOLD} anchor="start">102岁</Label>
				</g>
			</g>
		),
	},
	{
		sc: 'Sc1 1705', t: 9.0, note: '烛光书桌：哈雷坐着用羽毛笔写下预言（坐在椅子上、手在纸上，姿势已校验）',
		draw: () => {
			const h = seatedAt('halley-writing', HALLEY, 760, 760, 760 - 62 * 1.5, 1.5, {reachX: 84, lean: 14});
			return (
				<g>
					<rect width={W} height={H} fill="#2a2018" />
					<rect x={1100} y={120} width={520} height={420} fill="#1b2140" stroke="#5a4632" strokeWidth={14} />
					<circle cx={1460} cy={230} r={8} fill="#fffaf0" />
					<path d="M1460,230 L1180,400" stroke="#fff6dc" strokeWidth={10} opacity={0.4} />
					<radialGradient id="kf24-candle" cx="0.55" cy="0.55" r="0.5">
						<stop offset="0" stopColor="#ffd27a" stopOpacity="0.45" />
						<stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
					</radialGradient>
					<rect width={W} height={H} fill="url(#kf24-candle)" />
					<Desk x0={850} x1={1500} y={667} />
					<rect x={1300} y={627} width={18} height={40} fill="#efe4c8" />
					<path d="M1309,609 q6,10 0,18 q-6,-8 0,-18 Z" fill="#ffcf5a" />
					<rect x={900} y={657} width={260} height={10} fill={PARCH} />
					{h.el}
					<line x1={h.pen[0]} y1={h.pen[1]} x2={h.pen[0] + 26} y2={h.pen[1] - 60} stroke="#f4efe2" strokeWidth={4} />
					<Pill x={1280} y={110} text="1705 · 天文学家 哈雷" />
				</g>
			);
		},
	},
	{
		sc: 'Sc2 标题卡（drop 1）', t: 17.6, note: '主题化标题卡：一页18世纪星图，金色彗星绕过太阳，彗尾扫成标题的下划线',
		sub: null,
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#1e1a14" />
				<rect x={60} y={40} width={W - 120} height={H - 80} fill="#2c2418" stroke="#6a5634" strokeWidth={3} />
				{Array.from({length: 40}, (_, i) => <circle key={i} cx={100 + hash(i, 31) * 1720} cy={80 + hash(i, 32) * 920} r={2 + hash(i, 33) * 3} fill="#d9c9a4" opacity={0.5} />)}
				{Array.from({length: 8}, (_, i) => <line key={i} x1={100 + hash(i, 34) * 1700} y1={80 + hash(i, 35) * 900} x2={100 + hash(i + 3, 34) * 1700} y2={80 + hash(i + 3, 35) * 900} stroke="#8a7650" strokeWidth={1} opacity={0.4} />)}
				<Ellipse cx={960} cy={560} rx={760} ry={300} col="#8a7650" w={2} dash="6 8" />
				<Sun x={300} y={680} />
				<path d="M420,520 Q960,560 1500,530" stroke={GOLD} strokeWidth={4} fill="none" opacity={0.8} />
				<circle cx={420} cy={520} r={12} fill="#fff6dc" />
				<GoldTitle text="他走后16年，它回来了" y={470} size={92} id="t24" />
				<CardText kicker="COMET HALLEY · SYNOPSIS · 1705" tagline="他没等到的预言，会应验吗？" en="Can a prediction outlive the one who made it?" y0={300} />
			</g>
		),
	},
	{
		sc: 'Sc3 同一颗', t: 33.0, note: '24条轨道里，三条几乎重合：1531 · 1607 · 1682 —— 滑到一起，合成一条金色椭圆',
		draw: () => (
			<g>
				<Parchment />
				<Sun x={700} y={540} />
				{Array.from({length: 18}, (_, i) => <Ellipse key={i} cx={760 + hash(i, 40) * 300} cy={520 + hash(i, 41) * 60} rx={200 + hash(i, 42) * 500} ry={80 + hash(i, 43) * 200} rot={-60 + hash(i, 44) * 120} w={1.5} o={0.2} />)}
				<Ellipse cx={1060} cy={500} rx={560} ry={190} rot={-10} col="#a07a3a" w={3} o={0.6} />
				<Ellipse cx={1066} cy={506} rx={556} ry={186} rot={-11} col="#a07a3a" w={3} o={0.6} />
				<Ellipse cx={1063} cy={503} rx={558} ry={188} rot={-10.5} col={GOLD} w={7} />
				{[['1531', 1500, 300], ['1607', 1560, 380], ['1682', 1620, 460]].map(([t, x, y]) => <Label key={t as string} x={x as number} y={y as number} size={40} col={INKC}>{t}</Label>)}
				<circle cx={1610} cy={420} r={14} fill={GOLD} stroke={INKC} strokeWidth={2} />
				<Label x={1060} y={830} size={44} col={INKC}>不是三颗，是同一颗</Label>
			</g>
		),
	},
	{
		sc: 'Sc3 不等的间隔', t: 43.0, note: '间隔不等：76年、75年（≠）；木星轨道亮起，1681年彗星靠近木星，被拉了一下',
		draw: () => (
			<g>
				<Parchment />
				<Sun x={560} y={460} />
				<circle cx={560} cy={460} r={300} fill="none" stroke="#8a6a3a" strokeWidth={4} />
				<circle cx={860} cy={460} r={22} fill="#c98a4a" />
				<Label x={860} y={410} size={32} col={INKC}>木星</Label>
				<Ellipse cx={1000} cy={430} rx={600} ry={200} rot={-8} col={GOLD} w={6} />
				<path d="M880,470 L940,520" stroke="#b8322b" strokeWidth={5} markerEnd="" />
				<Pill x={1000} y={560} text="1681 · 靠近木星" dark={false} />
				<g transform="translate(300 820)">
					<line x1={0} x2={1300} y1={0} y2={0} stroke={INKC} strokeWidth={4} />
					{[['1531', 0], ['1607', 520], ['1682', 1030]].map(([t, x]) => (
						<g key={t as string}>
							<line x1={x as number} x2={x as number} y1={-14} y2={14} stroke={INKC} strokeWidth={4} />
							<Label x={x as number} y={60} size={32} col={INKC} weight={500}>{t}</Label>
						</g>
					))}
					<Label x={260} y={-30} size={44} col="#8a2a1c">76年</Label>
					<Label x={775} y={-30} size={44} col="#8a2a1c">75年</Label>
					<Label x={520} y={-80} size={40} col="#b8322b">≠</Label>
				</g>
			</g>
		),
	},
	{
		sc: 'Sc4 他没等到（breakdown）', t: 51.0, note: '白天的书桌：空椅子、熄灭的蜡烛、合上的书；窗外虚线椭圆上，金点还没到。卡片“1742”（不画人、不画遗体）',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#d9cdb4" />
				<rect x={1100} y={120} width={520} height={420} fill="#b9cbe0" stroke="#7a6248" strokeWidth={14} />
				<Ellipse cx={1360} cy={330} rx={200} ry={70} col="#5a6a80" w={2} dash="6 6" />
				<circle cx={1200} cy={300} r={8} fill={GOLD} />
				<Desk x0={860} x1={1500} y={640} />
				<rect x={1300} y={600} width={18} height={40} fill="#efe4c8" />
				<rect x={960} y={612} width={200} height={28} fill="#5a3e28" />
				<rect x={600} y={760} width={130} height={14} fill="#5a3e28" />
				<rect x={600} y={580} width={14} height={180} fill="#5a3e28" />
				<rect x={606} y={774} width={12} height={110} fill="#4a3220" />
				<rect x={716} y={774} width={12} height={110} fill="#4a3220" />
				<Pill x={420} y={200} text="1742" dark={false} size={40} />
			</g>
		),
	},
	{
		sc: 'Sc4 巴黎接力', t: 56.5, note: '巴黎书房：三人围桌计算，名牌写明分工（克莱罗·提出算法 / 拉朗德·计算 / 勒波特夫人·计算），三人都坐着、手在纸上',
		draw: () => {
			// desk top ~62 units above the seat (a real table height), hands ~80 units in front of the hip
			const D = 760 - 62 * 1.25;
			const a = seatedAt('clairaut', CAST.merchant, 360, 760, D, 1.25, {reachX: 82, lean: 14});
			const b = seatedAt('lalande', CAST.economist, 860, 760, D, 1.25, {reachX: 82, head: 20, lean: 14});
			const c = seatedAt('lepaute', CAST.melitta, 1360, 760, D, 1.25, {reachX: 82, head: 18, lean: 14});
			return (
				<g>
					<rect width={W} height={H} fill="#e3d6bc" />
					<rect x={0} y={880} width={W} height={200} fill="#b9a888" />
					<Desk x0={430} x1={1880} y={D} />
					{[480, 980, 1480].map((x) => <rect key={x} x={x} y={D - 10} width={220} height={10} fill={PARCH} stroke="#b9ad96" />)}
					{a.el}
					{b.el}
					{c.el}
					{[['克莱罗 · 提出算法', 380], ['拉朗德 · 计算', 880], ['勒波特夫人 · 计算', 1380]].map(([t, x]) => <Pill key={t as string} x={x as number} y={220} text={t as string} />)}
				</g>
			);
		},
	},
	{
		sc: 'Sc5 518 + 100 = 618', t: 69.5, note: '虚影点“照上一圈的节奏”跑在前面；金点被木星、土星拉住落后：+518天 · 木星，+100天 · 土星 → 比上一圈晚618天',
		draw: () => (
			<g>
				<Parchment />
				<Sun x={420} y={540} />
				<Ellipse cx={960} cy={540} rx={640} ry={260} rot={-6} col={INKC} w={3} />
				<circle cx={1430} cy={330} r={16} fill="none" stroke={INKC} strokeWidth={3} strokeDasharray="4 4" />
				<Label x={1430} y={290} size={38} col={INKC} weight={700}>照上一圈的节奏</Label>
				<Label x={1430} y={250} size={24} col="#6a5a46" weight={500} font={SANS}>1607→1682</Label>
				<circle cx={1250} cy={300} r={16} fill={GOLD} stroke={INKC} strokeWidth={2} />
				<g transform="translate(960 820)">
					<rect x={-520} y={-70} width={1040} height={110} rx={14} fill="#2a2418" opacity={0.85} />
					<text x={-320} y={10} textAnchor="middle" style={{fontFamily: SANS, fontSize: 42, fontWeight: 900}} fill="#f0dcb0">+518天 · 木星</text>
					<text x={40} y={10} textAnchor="middle" style={{fontFamily: SANS, fontSize: 42, fontWeight: 900}} fill="#f0dcb0">+100天 · 土星</text>
					<text x={380} y={10} textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 900}} fill={GOLD}>= 618天</text>
				</g>
				<Pill x={960} y={170} text="拉朗德、勒波特计算 · 克莱罗方法" dark={false} />
			</g>
		),
	},
	{
		sc: 'Sc6 drop 2', t: 82.0, note: '静默之后：望远镜目镜里，星空中出现一个模糊的光斑，金点落在上面（踩 drop 2）',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#050608" />
				<circle cx={960} cy={480} r={380} fill="#0d1226" />
				{Array.from({length: 26}, (_, i) => {
					const a = hash(i, 51) * Math.PI * 2, r = hash(i, 52) * 360;
					return <circle key={i} cx={960 + Math.cos(a) * r} cy={480 + Math.sin(a) * r} r={1.5 + hash(i, 53) * 1.5} fill="#fff" opacity={0.7} />;
				})}
				<circle cx={1040} cy={430} r={30} fill="#e9eef6" opacity={0.35} />
				<circle cx={1040} cy={430} r={9} fill={GOLD} />
				<circle cx={960} cy={480} r={380} fill="none" stroke="#2a2a30" strokeWidth={30} />
				<Label x={960} y={940 - 70} size={30} col="#c9c2b4" weight={500} font={SANS}>示意</Label>
			</g>
		),
	},
	{
		sc: 'Sc6 一位农民', t: 85.5, note: '德累斯顿附近的雪夜：农民帕利奇站在反射望远镜旁，眼睛贴目镜、一只手扶镜筒（姿势已校验）',
		draw: () => {
			const at: [number, number] = [760, 900];
			const s = 1.5;
			const base: Pose = {...POSES.stand, lean: 6, head: -10};
			const J = jointsAt(base);
			const eye = [at[0] + J.head[0] * s + 34, at[1] + J.head[1] * s];
			const tube: [number, number] = [at[0] + (J.neck[0] + 70) * s, at[1] + (J.neck[1] + 16) * s];
			const fig = (p: [number, number]): [number, number] => [(p[0] - at[0]) / s, (p[1] - at[1]) / s];
			const pose: Pose = {...base, armNear: ikArm(base, true, fig(tube))};
			return (
				<g>
					<NightSky comet={false} />
					<circle cx={1250} cy={260} r={22} fill="#e9eef6" opacity={0.3} />
					<circle cx={1250} cy={260} r={6} fill="#fffaf0" />
					<rect y={860} width={W} height={220} fill="#e8edf3" />
					<path d="M1300,860 L1300,700 L1460,640 L1620,700 L1620,860 Z" fill="#3a3040" />
					<rect x={1430} y={760} width={40} height={50} fill="#ffd27a" />
					{/* reflector: tube points up to the sky, eyepiece on the side near the top */}
					<g transform={`translate(${eye[0] + 40} ${eye[1] + 10}) rotate(-38)`}>
						<rect x={-50} y={-30} width={420} height={70} rx={8} fill="#6a4a30" />
						<rect x={-60} y={-38} width={20} height={86} fill="#4a3220" />
					</g>
					<rect x={eye[0] + 6} y={eye[1] - 8} width={34} height={18} fill="#2a2a30" />
					<line x1={eye[0] + 120} y1={eye[1] + 60} x2={eye[0] + 60} y2={900} stroke="#4a3220" strokeWidth={10} />
					<line x1={eye[0] + 120} y1={eye[1] + 60} x2={eye[0] + 220} y2={900} stroke="#4a3220" strokeWidth={10} />
					<Person id="palitzsch" at={at} s={s} intent="stand" env={{ground: 900, contacts: [{hand: 'near', at: tube, what: 'steadying the tube'}]}} look={CAST.drover} pose={pose} expression="surprise" rim="cool" shadow={false} hands={{near: 'open'}} />
					<Pill x={600} y={200} text="帕利奇 · 业余观星的农民 · 德累斯顿附近" />
					<Pill x={1500} y={200} text="1758年12月25日夜" />
				</g>
			);
		},
	},
	{
		sc: 'Sc7 并不准点', t: 105.0, note: '史书长卷上，每次回归一个金色刻度（盖“有记录”红印）；间隔不均：79年 · 451→530，74年 · 1835→1910；“平均76年”缩成小标签',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#e8dcc0" />
				<rect x={60} y={380} width={1800} height={240} fill={PARCH} stroke="#b9ad96" strokeWidth={3} />
				<line x1={100} x2={1820} y1={500} y2={500} stroke={INKC} strokeWidth={3} />
				{Array.from({length: 30}, (_, i) => {
					const x = 120 + i * 57 + (hash(i, 61) - 0.5) * 18;
					return (
						<g key={i}>
							<line x1={x} x2={x} y1={470} y2={530} stroke={GOLD} strokeWidth={5} />
							{i % 4 !== 3 ? <rect x={x - 9} y={540} width={18} height={18} fill="#b8322b" opacity={0.8} /> : null}
						</g>
					);
				})}
				<Label x={120} y={450} size={30} col={INKC} weight={500}>公元前240</Label>
				<Label x={1700} y={450} size={30} col={INKC} weight={500}>1910</Label>
				<g transform="translate(520 300)">
					<path d="M-80,40 v-20 h160 v20" stroke="#8a2a1c" strokeWidth={4} fill="none" />
					<Label x={0} y={0} size={40} col="#8a2a1c">79年 · 451→530</Label>
				</g>
				<g transform="translate(1400 300)">
					<path d="M-70,40 v-20 h140 v20" stroke="#8a2a1c" strokeWidth={4} fill="none" />
					<Label x={0} y={0} size={40} col="#8a2a1c">74年 · 1835→1910</Label>
				</g>
				<Pill x={960} y={720} text="平均 76年 ≠ 每一圈" dark={false} />
			</g>
		),
	},
	{
		sc: 'Sc8 轮到你', t: 113.5, note: '首尾呼应：同一片屋顶，你的手机时间戳写着2061；哈雷的虚线人生尺在画面边缘淡出',
		draw: () => (
			<g>
				<NightSky />
				<Rooftops />
				<PhoneEdge stamp="2061" />
				<line x1={140} x2={600} y1={980} y2={980} stroke="#c9a35e" strokeWidth={8} strokeDasharray="12 10" opacity={0.35} />
			</g>
		),
	},
];

export {SERIF};
