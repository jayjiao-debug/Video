import React from 'react';
import {POSES, addPose, ikArm, jointsAt, type Pose} from '../art/Figure';
import {CAST} from '../art/cast';
import {Person} from '../art/poseCheck';
import {CardText, GOLD, GoldTitle, H, INK, Label, Pill, SANS, SERIF, W, YOU, hash, type KF} from './common';
import lines from './data/ep22.json';

export const LINES22 = lines;

/* ---------- pieces ---------- */
const TickMeter: React.FC<{x: number; y: number; lit: number; label?: string; n?: number; w?: number; col?: string}> = ({x, y, lit, label, n = 15, w = 520, col = GOLD}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect x={-30} y={-46} width={w + 60} height={label ? 132 : 92} rx={18} fill="#0d1016" opacity={0.6} />
		{Array.from({length: n}, (_, i) => (
			<circle key={i} cx={(i + 0.5) * (w / n)} cy={0} r={13} fill={i < lit ? col : 'none'} stroke={col} strokeOpacity={i < lit ? 1 : 0.4} strokeWidth={2.5} />
		))}
		{label ? (
			<text x={w / 2} y={62} textAnchor="middle" style={{fontFamily: SANS, fontSize: 28, fontWeight: 500}} fill={INK}>
				{label}
			</text>
		) : null}
	</g>
);

const Charcoal: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M-70,10 L-55,-38 L-10,-52 L30,-44 L68,-20 L74,18 L40,40 L-20,44 L-62,32 Z" fill="#1a1716" />
		<path d="M-55,-38 L-10,-52 L30,-44 L10,-20 L-30,-24 Z" fill="#2c2725" />
		<path d="M-40,-10 L20,-6 M-30,12 L40,10 M-10,-30 L-4,30" stroke="#3a3330" strokeWidth={2} />
	</g>
);

const MuseumCase: React.FC<{label?: string}> = ({label = '木炭 · 距今几千年'}) => (
	<g>
		<rect width={W} height={H} fill="#24222a" />
		<radialGradient id="m22-spot" cx="0.5" cy="0.2" r="0.6">
			<stop offset="0" stopColor="#f6e6c4" stopOpacity="0.55" />
			<stop offset="1" stopColor="#f6e6c4" stopOpacity="0" />
		</radialGradient>
		<rect x={520} y={120} width={880} height={720} fill="#2f2c35" stroke="#5a5560" strokeWidth={4} />
		<rect x={520} y={120} width={880} height={720} fill="url(#m22-spot)" />
		<path d="M560,140 L700,140 L560,520 Z" fill="#fff" opacity={0.06} />
		<rect x={760} y={620} width={400} height={220} fill="#3e3a44" />
		<rect x={740} y={600} width={440} height={30} fill="#4a4652" />
		<Charcoal x={960} y={560} s={1.3} />
		<rect x={850} y={680} width={220} height={60} fill="#e9e1cf" />
		<text x={960} y={720} textAnchor="middle" style={{fontFamily: SANS, fontSize: 26, fontWeight: 500}} fill="#2a2620">
			{label}
		</text>
	</g>
);

const PhoneUI: React.FC<{focus?: boolean; check?: boolean}> = ({focus, check}) => (
	<g>
		{/* bezel: the viewer's phone fills the frame */}
		<path d={`M0,0 H${W} V${H} H0 Z M60,50 H${W - 150} Q${W - 110},50 ${W - 110},90 V${H - 90} Q${W - 110},${H - 50} ${W - 150},${H - 50} H60 Q20,${H - 50} 20,${H - 90} V90 Q20,50 60,50 Z`} fill="#0b0b0e" fillRule="evenodd" />
		<circle cx={W - 62} cy={H / 2} r={34} fill="none" stroke="#f3f3f3" strokeWidth={5} />
		<circle cx={W - 62} cy={H / 2} r={26} fill="#f3f3f3" />
		<text x={W - 62} y={180} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20}} fill="#f3f3f3">
			拍照
		</text>
		{focus ? (
			<g stroke="#ffd23f" strokeWidth={4} fill="none">
				<path d="M860,470 h-30 v30 M1060,470 h30 v30 M860,650 h-30 v-30 M1060,650 h30 v-30" />
			</g>
		) : null}
		{check ? (
			<g transform="translate(1180 470)">
				<circle r={44} fill={GOLD} />
				<path d="M-20,2 L-6,16 L22,-14" stroke="#1b1b1b" strokeWidth={8} fill="none" strokeLinecap="round" />
			</g>
		) : null}
	</g>
);

const Rings: React.FC<{x: number; y: number; r: number; n?: number; glow?: number; dark?: boolean}> = ({x, y, r, n = 26, glow = -1, dark}) => (
	<g transform={`translate(${x} ${y})`}>
		<circle r={r + 14} fill={dark ? '#1c1714' : '#6a4a30'} />
		<circle r={r} fill={dark ? '#2c241e' : '#c9a072'} />
		{Array.from({length: n}, (_, i) => {
			const rr = r * (1 - i / n) * (0.98 + 0.02 * Math.sin(i));
			return <circle key={i} r={rr} fill="none" stroke={i === glow ? GOLD : dark ? '#4a3c32' : '#9a7450'} strokeWidth={i === glow ? 6 : 2} opacity={i === glow ? 1 : 0.8} />;
		})}
		<path d={`M0,0 L${r * 0.15},${-r * 0.9}`} stroke={dark ? '#120e0c' : '#7a5a3a'} strokeWidth={3} opacity={0.6} />
	</g>
);

const Tree: React.FC<{x: number; y: number; s?: number; ghost?: boolean}> = ({x, y, s = 1, ghost}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} opacity={ghost ? 0.45 : 1}>
		<path d="M-14,0 L-10,-170 L10,-170 L14,0 Z" fill={ghost ? '#7fd08a' : '#6a4a32'} />
		{[[-60, -230, 90], [40, -250, 100], [-10, -300, 110], [70, -190, 70], [-80, -180, 70]].map(([cx, cy, r], i) => (
			<circle key={i} cx={cx} cy={cy} r={r} fill={ghost ? '#7fd08a' : i % 2 ? '#4f7a4a' : '#5c8a52'} />
		))}
	</g>
);

const Axis: React.FC<{x0: number; y0: number; w: number; h: number}> = ({x0, y0, w, h}) => (
	<g stroke="#d9d2c4" strokeWidth={3}>
		<line x1={x0} y1={y0} x2={x0 + w} y2={y0} />
		<line x1={x0} y1={y0} x2={x0} y2={y0 - h} />
	</g>
);

/* ---------- frames ---------- */
const youPhone = (at: [number, number], s: number, id: string) => {
	const base: Pose = {...POSES.stand, head: 6};
	const J = jointsAt(base);
	const phone: [number, number] = [J.neck[0] + 46, J.neck[1] + 34];
	const pose: Pose = {...base, armNear: ikArm(base, true, phone), armFar: ikArm(base, false, [phone[0] - 6, phone[1] + 8])};
	const w = (p: [number, number]): [number, number] => [at[0] + p[0] * s, at[1] + p[1] * s];
	return (
		<g>
			<Person id={id} at={at} s={s} intent="stand" env={{ground: at[1], contacts: [{hand: 'near', at: w(phone), what: 'holding the phone'}, {hand: 'far', at: w([phone[0] - 6, phone[1] + 8]), what: 'holding the phone', tol: 14}]}} look={YOU} pose={pose} expression="thinking" rim="cool" shadow={false} hands={{near: 'grip', far: 'grip'}} />
			<rect x={w(phone)[0] - 6} y={w(phone)[1] - 40} width={16} height={58} rx={4} fill="#15151a" />
		</g>
	);
};

export const FRAMES22: KF[] = [
	{
		sc: 'Sc1 冷开场', t: 0.6, note: '第一人称：你的手机对准博物馆展柜，对焦框落在木炭上（踩第1拍）',
		draw: () => (
			<g>
				<MuseumCase />
				<PhoneUI focus />
			</g>
		),
	},
	{
		sc: 'Sc1', t: 6.5, note: '木炭里长出活着时的“鬼影树”；滴答表每拍亮一颗，共15颗',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#1d1b20" />
				<Tree x={960} y={640} s={1.6} ghost />
				<Charcoal x={960} y={660} s={2.6} />
				{Array.from({length: 14}, (_, i) => <circle key={i} cx={860 + hash(i, 3) * 200} cy={600 + hash(i, 4) * 110} r={5} fill={GOLD} opacity={i < 9 ? 0.9 : 0.25} />)}
				<TickMeter x={1240} y={300} lit={9} label="每克碳 · 每分钟 ≈ 15 下" w={520} />
			</g>
		),
	},
	{
		sc: 'Sc1 情感转折', t: 14.6, note: '展柜玻璃映出你自己（举着手机）；你身上也有一只滴答表，稳定在15',
		draw: () => (
			<g>
				<MuseumCase />
				<rect x={520} y={120} width={880} height={720} fill="#9fb4c8" opacity={0.1} />
				<g opacity={0.5}>{youPhone([1180, 840], 1.55, 'you-reflection')}</g>
				<TickMeter x={1440} y={250} lit={15} label="你 · 每分钟 ≈ 15 下" w={400} />
			</g>
		),
	},
	{
		sc: 'Sc2 标题卡（drop 1）', t: 17.6, note: '主题化标题卡：标题落在一截树轮横切面上，每一圈年轮依次点亮一颗金色滴答',
		sub: null,
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#15110f" />
				<Rings x={960} y={560} r={700} n={40} dark />
				<rect width={W} height={H} fill="#0b0807" opacity={0.45} />
				{Array.from({length: 18}, (_, i) => {
					const a = (i / 18) * Math.PI * 2, r = 200 + (i % 6) * 80;
					return <circle key={i} cx={960 + Math.cos(a) * r * 1.4} cy={560 + Math.sin(a) * r * 0.9} r={6} fill={GOLD} opacity={0.35 + (i % 3) * 0.2} />;
				})}
				<GoldTitle text="死后会变慢的钟" y={470} size={104} id="t22" />
				<g transform="translate(960 545)">
					<circle r={26} fill="none" stroke={GOLD} strokeWidth={2.4} />
					<circle r={16} fill="none" stroke={GOLD} strokeWidth={1.4} />
					<path d="M-34,0 A34,34 0 0 1 34,0" stroke={GOLD} strokeWidth={3} fill="none" strokeDasharray="4 6" />
				</g>
				<CardText kicker="RADIOCARBON DATING · LIBBY · 1949" tagline="一块木炭，怎么知道它多老？" en="How old is a piece of charcoal?" />
			</g>
		),
	},
	{
		sc: 'Sc3 活着时', t: 34.0, note: '空气 / 树 / 你 三只表同步在15；你咬一口树上的苹果（碳从空气→植物→你）',
		draw: () => {
			const base: Pose = {...POSES.stand, head: 4};
			const J = jointsAt(base);
			// forearm folded up toward the face: elbow by the ribs, hand just in front of the mouth
			const pose: Pose = {...base, armNear: [24, 138]};
			const mouth: [number, number] = jointsAt(pose).near.hand;
			const at: [number, number] = [1240, 860];
			const s = 1.45;
			const w = (p: [number, number]): [number, number] => [at[0] + p[0] * s, at[1] + p[1] * s];
			return (
				<g>
					<rect width={W} height={H} fill="#cfe0ea" />
					<rect y={760} width={W} height={320} fill="#8fb07a" />
					{Array.from({length: 120}, (_, i) => <circle key={i} cx={hash(i, 11) * W} cy={hash(i, 12) * 700} r={i % 17 === 0 ? 7 : 3} fill={i % 17 === 0 ? GOLD : '#8a98a6'} opacity={i % 17 === 0 ? 1 : 0.5} />)}
					<Tree x={760} y={860} s={2} />
					<Person id="you-apple" at={at} s={s} intent="stand" env={{ground: 860, contacts: [{hand: 'near', at: w(mouth), what: 'bringing the apple to the mouth'}]}} look={YOU} pose={pose} expression="smile" rim="warm" shadow={false} hands={{near: 'grip'}} />
					<circle cx={w(mouth)[0] + 8} cy={w(mouth)[1] - 4} r={13} fill="#c8433a" />
					<TickMeter x={150} y={150} lit={15} n={15} w={300} label="空气 · 15" />
					<TickMeter x={810} y={150} lit={15} n={15} w={300} label="树 · 15" />
					<TickMeter x={1470} y={150} lit={15} n={15} w={300} label="你 · 15" />
				</g>
			);
		},
	},
	{
		sc: 'Sc3 半衰', t: 46.0, note: '每过约5730年滴答少一半：½ 盖章踩拍，再½ → ¼；读数箭头从“剩多少”读到“多少年”（示意）',
		draw: () => {
			const x0 = 260, y0 = 820, w = 1320, h = 560;
			const pts = Array.from({length: 61}, (_, i) => {
				const k = i / 60;
				return [x0 + k * w, y0 - h * Math.pow(0.5, k * 3)];
			});
			return (
				<g>
					<rect width={W} height={H} fill="#1d2228" />
					<Axis x0={x0} y0={y0} w={w} h={h} />
					<path d={`M${pts.map((p) => p.join(',')).join(' L')}`} stroke={GOLD} strokeWidth={6} fill="none" />
					{[[0, '0'], [1 / 3, '5730年'], [2 / 3, '再过5730年']].map(([k, t], i) => (
						<g key={i}>
							<line x1={x0 + (k as number) * w} x2={x0 + (k as number) * w} y1={y0} y2={y0 + 14} stroke="#d9d2c4" strokeWidth={3} />
							<Label x={x0 + (k as number) * w} y={y0 + 56} size={32} weight={500} col="#e9e3d6">{t}</Label>
						</g>
					))}
					<Label x={x0 + w / 3 + 40} y={y0 - h / 2 - 20} size={64} col={GOLD} anchor="start">½</Label>
					<Label x={x0 + (2 * w) / 3 + 40} y={y0 - h / 4 - 20} size={64} col={GOLD} anchor="start">¼</Label>
					<path d={`M${x0 - 10},${y0 - h / 2} H${x0 + w / 3} V${y0}`} stroke="#9fd0ff" strokeWidth={3} strokeDasharray="10 8" fill="none" />
					<Label x={x0 + 20} y={y0 - h / 2 - 16} size={30} col="#9fd0ff" anchor="start" weight={500}>剩多少</Label>
					<Label x={x0 + w / 3} y={y0 + 100} size={30} col="#9fd0ff" weight={500}>多少年</Label>
					<TickMeter x={1210} y={180} lit={7} n={15} w={420} label="一半 · 示意" />
				</g>
			);
		},
	},
	{
		sc: 'Sc4 考一考（1949）', t: 61.0, note: '利比用年代已知的法老墓木头测试：表的读数与历史答案卡并排吻合；论文原话小字',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#e9e1cf" />
				<rect x={0} y={700} width={W} height={380} fill="#cdbf9f" />
				<g transform="translate(330 470)">
					<rect x={-190} y={-290} width={380} height={480} rx={12} fill="#f6f1e4" stroke="#b9ad96" strokeWidth={3} />
					<rect x={-168} y={-268} width={336} height={300} fill="#3a3448" />
					<clipPath id="kf22-libby"><rect x={-168} y={-268} width={336} height={300} /></clipPath>
					<g clipPath="url(#kf22-libby)">
						<Person id="libby-card" at={[-6, 470]} s={2.2} intent="portrait" look={CAST.economist} pose={{...POSES.stand, head: -3}} expression="neutral" rim="warm" shadow={false} />
					</g>
					<text x={0} y={90} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 40, fontWeight: 900}} fill="#2a2420">利比</text>
					<text x={0} y={134} textAnchor="middle" style={{fontFamily: SANS, fontSize: 22}} fill="#5a5048">美国化学家 · 碳14测年发明人</text>
				</g>
				<rect x={640} y={560} width={980} height={60} rx={8} fill="#b9ad96" />
				{[0, 1].map((k) => (
					<g key={k} transform={`translate(${880 + k * 480} 520)`}>
						<path d="M-110,30 L-90,-20 L80,-26 L110,20 L70,40 L-80,42 Z" fill="#8a6440" />
						<path d="M-80,0 L90,-6" stroke="#6a4a2e" strokeWidth={3} />
						<rect x={-120} y={-250} width={240} height={150} rx={10} fill="#fff" stroke="#2a2620" strokeWidth={2} />
						<text x={0} y={-200} textAnchor="middle" style={{fontFamily: SANS, fontSize: 26, fontWeight: 700}} fill="#2a2620">{k ? '斯尼夫鲁墓' : '左塞尔墓'}</text>
						<text x={0} y={-150} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24}} fill="#5a5048">{k ? '已知 约前2625年' : '已知 约前2700年'}</text>
						<g transform="translate(0 -320)">
							<circle r={34} fill="#2f7a4a" />
							<path d="M-14,2 L-4,12 L16,-10" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
						</g>
					</g>
				))}
				<Label x={1120} y={720} size={34} col="#2a2620" weight={500}>The agreement … is seen to be satisfactory.</Label>
				<Label x={1120} y={770} size={24} col="#5a5048" weight={500} font={SANS}>Arnold & Libby, Science 1949</Label>
				<g transform="translate(1660 220)">
					<circle r={70} fill={GOLD} stroke="#a77a2c" strokeWidth={4} />
					<text y={-6} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24, fontWeight: 700}} fill="#3a2a10">1960</text>
					<text y={28} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20}} fill="#3a2a10">诺贝尔化学奖</text>
				</g>
			</g>
		),
	},
	{
		sc: 'Sc5 中国（1965）', t: 73.5, note: '实验室门牌从空白填上；4块已知年代的木头逐一对上（不显示具体年代）',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#d9d2c0" />
				<rect x={0} y={760} width={W} height={320} fill="#a89c84" />
				<rect x={260} y={180} width={560} height={600} fill="#5a4a3a" />
				<rect x={290} y={210} width={500} height={570} fill="#6a5644" />
				<circle cx={740} cy={500} r={14} fill="#c9a35e" />
				<rect x={860} y={260} width={720} height={130} rx={8} fill="#f4efe2" stroke="#2a2620" strokeWidth={3} />
				<text x={1220} y={318} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 36, fontWeight: 900}} fill="#2a2620">中国科学院考古研究所</text>
				<text x={1220} y={366} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 32, fontWeight: 700}} fill="#8a2a1c">碳十四实验室 · 1965</text>
				{[0, 1, 2, 3].map((k) => (
					<g key={k} transform={`translate(${960 + k * 170} 600)`}>
						<rect x={-60} y={-80} width={120} height={150} rx={6} fill="#efe3c4" stroke="#8a7a5a" strokeWidth={3} />
						<path d="M-60,-80 L0,-30 L60,-80" stroke="#8a7a5a" strokeWidth={3} fill="none" />
						<g transform="translate(0 30)">
							<circle r={28} fill="#2f7a4a" />
							<path d="M-12,2 L-3,10 L13,-8" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
						</g>
					</g>
				))}
				<Pill x={1210} y={760} text="已知年代的木头 · 全都对上" />
			</g>
		),
	},
	{
		sc: 'Sc6 drop 2', t: 82.4, note: '“不变”的假设线被打断：1960年代中期大气碳14陡升到约×2（只画曲线，不画蘑菇云和国旗）',
		draw: () => {
			const x0 = 220, y0 = 800, w = 1480, h = 600;
			const base = y0 - h * 0.4;
			const pts = Array.from({length: 121}, (_, i) => {
				const k = i / 120;
				const yr = 1900 + k * 120;
				const spike = yr < 1955 ? 0 : yr < 1964 ? (yr - 1955) / 9 : Math.exp(-(yr - 1964) / 16);
				return [x0 + k * w, base - h * 0.4 * spike + Math.sin(k * 30) * 3];
			});
			return (
				<g>
					<rect width={W} height={H} fill="#1a1c22" />
					<Axis x0={x0} y0={y0} w={w} h={h} />
					<line x1={x0} x2={x0 + w} y1={base} y2={base} stroke="#d9d2c4" strokeWidth={3} strokeDasharray="14 10" opacity={0.5} />
					<Label x={x0 + 20} y={base + 44} size={28} weight={500} col="#c9c2b4" anchor="start">假设：一直不变</Label>
					<path d={`M${pts.map((p) => p.join(',')).join(' L')}`} stroke={GOLD} strokeWidth={7} fill="none" />
					<Label x={x0 + w * 0.6} y={base - h * 0.4 - 10} size={64} col={GOLD} anchor="start">约 ×2</Label>
					<Label x={x0 + w * 0.6} y={base - h * 0.4 + 40} size={28} col="#e9e3d6" weight={500} font={SANS} anchor="start">北半球 · 1960年代中期</Label>
					{[1900, 1950, 2000].map((y) => (
						<Label key={y} x={x0 + ((y - 1900) / 120) * w} y={y0 + 50} size={28} weight={500} col="#c9c2b4">{y}</Label>
					))}
				</g>
			);
		},
	},
	{
		sc: 'Sc7 对表', t: 99.0, note: '树轮每圈年份准确：测出每圈的碳14，排成对照表（校正曲线，示意）；木炭的读数落成一个年份区间',
		draw: () => (
			<g>
				<rect width={W} height={H} fill="#e9e1cf" />
				<g transform="translate(-60 0)">
					<Rings x={480} y={520} r={330} n={30} glow={8} />
				</g>
				{Array.from({length: 5}, (_, i) => (
					<g key={i} transform={`translate(860 ${240 + i * 90})`}>
						<rect width={760} height={72} rx={8} fill={i === 2 ? '#f6e3b3' : '#f6f1e4'} stroke="#b9ad96" strokeWidth={2} />
						<text x={40} y={48} style={{fontFamily: SANS, fontSize: 30}} fill="#2a2620">读数 ▸▸▸</text>
						<text x={720} y={48} textAnchor="end" style={{fontFamily: SANS, fontSize: 30}} fill="#2a2620">年份 ▸▸▸</text>
					</g>
				))}
				<Label x={1240} y={200} size={44} col="#2a2620">读数 → 年份 对照表</Label>
				<Pill x={1240} y={760} text="校正曲线 · 示意" />
				<path d="M560,520 L860,420" stroke="#8a2a1c" strokeWidth={3} strokeDasharray="8 6" />
			</g>
		),
	},
	{
		sc: 'Sc8 回到展柜', t: 113.0, note: '回到你的手机：木炭的滴答表和一小块树轮并排，一个金色对勾把它们连起来 ——“数滴答，再对表”',
		draw: () => (
			<g>
				<MuseumCase label="木炭 · 距今几千年" />
				<PhoneUI focus check />
				<TickMeter x={360} y={250} lit={6} n={15} w={300} />
				<g transform="translate(-140 -40)"><Rings x={1500} y={300} r={70} n={12} /></g>
			</g>
		),
	},
];
