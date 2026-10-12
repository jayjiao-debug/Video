import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Lights, Stage3D, envProps, useEnv} from '../../episodes/xuming/three/stage3d';
import {Sub} from '../kf/common';

/* ep26 gate 2a round 2: three non-cartoon looks × two frames (hook 2.6 s · key 61 s). */
const W = 1920, H = 1080;
const SANS = '"Noto Sans CJK SC", sans-serif';
const MONO = '"DejaVu Sans Mono", "Noto Sans CJK SC", monospace';
const GOLD = '#f1c56d';
const t = (size: number, weight = 900) => ({fontFamily: SANS, fontSize: size, fontWeight: weight, fontVariantNumeric: 'lining-nums' as const});
const SUB1 = '钱还没到，你今晚就多花了一点';
const SUB2 = '钱还没出，先给一个[承诺]';

const Tag: React.FC<{x: number; y: number; text: string; light?: boolean; size?: number}> = ({x, y, text, light, size = 26}) => {
	const w = [...text].reduce((n, c) => n + (c.charCodeAt(0) > 255 ? size * 1.05 : size * 0.6), 0) + 44;
	return (
		<g>
			<rect x={x - w / 2} y={y - size * 1.15} width={w} height={size * 1.7} rx={size * 0.85} fill={light ? '#f4efe2' : '#0b0d12'} opacity={light ? 0.85 : 0.55} />
			<text x={x} y={y} textAnchor="middle" style={t(size, 500)} fill={light ? '#2a2620' : '#efe6d2'}>{text}</text>
		</g>
	);
};
const Note: React.FC<{a: string; b: string}> = ({a, b}) => (
	<g>
		<rect x={30} y={26} width={Math.min(1240, 70 + [...b].length * 23)} height={84} rx={10} fill="#000" opacity={0.5} />
		<text x={52} y={62} style={t(27, 700)} fill="#ffd36e">{a}</text>
		<text x={52} y={96} style={t(22, 400)} fill="#e8e4da">{b}</text>
	</g>
);

/* ================= D 央行讲台 · cinematic 3D ================= */
const Gold: React.FC<{position: [number, number, number]; r?: number; h?: number}> = ({position, r = 0.13, h = 0.022}) => {
	const e = useEnv();
	return (
		<mesh position={position}>
			<cylinderGeometry args={[r, r, h, 48]} />
			<meshPhysicalMaterial color="#b9852c" metalness={0.9} roughness={0.32} {...envProps(e, 0.8)} />
		</mesh>
	);
};
const Phone: React.FC = () => {
	const e = useEnv();
	return (
		<group position={[0, 0.012, 0.05]} rotation={[0, 0.35, 0]}>
			<mesh>
				<boxGeometry args={[0.42, 0.024, 0.86]} />
				<meshPhysicalMaterial color="#0d0e12" metalness={0.4} roughness={0.25} clearcoat={1} {...envProps(e, 1.5)} />
			</mesh>
			<mesh position={[0, 0.0125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[0.39, 0.82]} />
				<meshBasicMaterial color="#1c2638" />
			</mesh>
			{/* notification card on the screen */}
			<mesh position={[0, 0.0135, -0.24]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[0.34, 0.14]} />
				<meshBasicMaterial color="#c9d2e2" />
			</mesh>
			<mesh position={[0, 0.0135, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[0.34, 0.12]} />
				<meshBasicMaterial color="#c9823a" />
			</mesh>
		</group>
	);
};
const Desk: React.FC<{color?: string}> = ({color = '#2a170c'}) => (
	<mesh rotation={[-Math.PI / 2, 0, 0]}>
		<planeGeometry args={[40, 40]} />
		<meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.7} clearcoatRoughness={0.2} />
	</mesh>
);

const D1: React.FC = () => (
	<AbsoluteFill style={{background: '#05060b'}}>
		<Stage3D cam={{pos: [0.75, 1.05, 1.45], target: [-0.12, 0, -0.12], fov: 36}} bg="#07080d" env={0.8} focus={1.75} aperture={0.0018} bloom={0.55} threshold={0.85} vig={0.8}>
			<Lights keyPos={[-0.3, 1.2, 0.6]} keyColor="#ffd2a0" keyI={7} rim={[-1.2, 0.8, -1.4]} rimColor="#7fa6ff" rimI={5} fill={0.08} />
			<pointLight position={[0.05, 0.3, 0.1]} color="#bcd4ff" intensity={0.35} decay={2} />
			<Desk />
			<Phone />
			{Array.from({length: 7}, (_, i) => <Gold key={i} position={[-0.52, 0.011 + i * 0.022, -0.18]} />)}
			{Array.from({length: 3}, (_, i) => <Gold key={'b' + i} position={[-0.3, 0.011 + i * 0.022, -0.42]} />)}
			<mesh position={[0.62, 0.003, -0.45]} rotation={[-Math.PI / 2, 0, 0.2]}>
				<planeGeometry args={[0.5, 0.32]} />
				<meshStandardMaterial color="#e9e0cc" roughness={0.9} />
			</mesh>
		</Stage3D>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
			<g>
				<rect x={1160} y={250} width={520} height={150} rx={22} fill="#ffffff" opacity={0.94} />
				<text x={1192} y={300} style={t(26, 700)} fill="#6b6457">老板</text>
				<text x={1192} y={366} style={t(46)} fill="#1d1b18">明年给你涨工资</text>
				<line x1={1250} y1={400} x2={1080} y2={540} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2} />
			</g>
			<Tag x={1420} y={720} text="今晚的外卖：升级套餐" />
			<Note a="Look D 央行讲台（3D 电影感） · 开场 2.6s" b="真实光影的 3D：夜里的桌面，手机屏幕的冷光，旁边一摞金币；景深虚化，无卡通人物" />
			<Sub t={SUB1} />
		</svg>
	</AbsoluteFill>
);

const Chair: React.FC<{position: [number, number, number]}> = ({position}) => (
	<group position={position}>
		<mesh position={[0, 0.45, 0]}>
			<boxGeometry args={[0.5, 0.06, 0.48]} />
			<meshStandardMaterial color="#4a2220" roughness={0.6} />
		</mesh>
		<mesh position={[0, 0.85, 0.22]}>
			<boxGeometry args={[0.5, 0.75, 0.06]} />
			<meshStandardMaterial color="#5a2a27" roughness={0.55} />
		</mesh>
	</group>
);
const D2: React.FC = () => {
	const e = useEnv;
	return (
		<AbsoluteFill style={{background: '#05060b'}}>
			<Stage3D cam={{pos: [0, 2.0, 5.4], target: [0, 1.15, 0], fov: 30}} bg="#0b0e16" env={0.6} fog={[7, 20]} focus={5.4} aperture={0.004} bloom={0.8} threshold={0.7} vig={0.7}>
				<Lights keyPos={[0.4, 3.0, 1.2]} keyColor="#ffd09a" keyI={45} rim={[0, 2.4, -2.0]} rimColor="#8fb0ff" rimI={22} fill={0.12} />
				<pointLight position={[0, 1.2, 4]} color="#ffb880" intensity={6} decay={2} />
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[60, 60]} />
					<meshPhysicalMaterial color="#120c0a" roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.15} />
				</mesh>
				<mesh position={[0, 4, -3]}>
					<planeGeometry args={[40, 8]} />
					<meshStandardMaterial color="#121620" roughness={0.9} />
				</mesh>
				{/* a soft ring of light on the back wall (no emblem) */}
				<mesh position={[0, 2.6, -2.98]}>
					<ringGeometry args={[1.5, 1.56, 96]} />
					<meshBasicMaterial color="#e9c06a" toneMapped={false} transparent opacity={0.28} />
				</mesh>
				{/* podium */}
				<mesh position={[0, 0.6, 0]}>
					<boxGeometry args={[1.0, 1.2, 0.6]} />
					<meshPhysicalMaterial color="#3a2414" roughness={0.35} clearcoat={0.6} />
				</mesh>
				<mesh position={[0, 1.22, 0.02]} rotation={[-0.25, 0, 0]}>
					<boxGeometry args={[1.1, 0.06, 0.7]} />
					<meshPhysicalMaterial color="#4a2e18" roughness={0.3} clearcoat={0.7} />
				</mesh>
				{/* the sheet: the promise */}
				<mesh position={[0, 1.262, 0.05]} rotation={[-0.25 - Math.PI / 2, 0, 0]}>
					<planeGeometry args={[0.42, 0.3]} />
					<meshStandardMaterial color="#f1e8d2" roughness={0.85} />
				</mesh>
				{/* microphone */}
				<mesh position={[0.18, 1.42, 0.12]} rotation={[0.5, 0, -0.15]}>
					<cylinderGeometry args={[0.008, 0.008, 0.42, 12]} />
					<meshStandardMaterial color="#202226" metalness={0.8} roughness={0.3} />
				</mesh>
				<mesh position={[0.15, 1.62, 0.24]}>
					<sphereGeometry args={[0.035, 24, 16]} />
					<meshStandardMaterial color="#15161a" metalness={0.5} roughness={0.5} />
				</mesh>
				<mesh position={[0.19, 1.27, 0.06]}>
					<sphereGeometry args={[0.008, 8, 8]} />
					<meshBasicMaterial color="#ff3b30" toneMapped={false} />
				</mesh>
				{/* the spotlight beam */}
				<mesh position={[0, 3.4, 0.4]}>
					<cylinderGeometry args={[0.05, 1.3, 4.6, 48, 1, true]} />
					<meshBasicMaterial color="#ffd9a0" transparent opacity={0.1} depthWrite={false} toneMapped={false} />
				</mesh>
				{/* empty chairs in the foreground, out of focus */}
				{Array.from({length: 2}, (_, r) => Array.from({length: 9}, (_, c) => <Chair key={`${r}-${c}`} position={[(c - 4) * 0.8 + (r % 2) * 0.4, 0, 2.6 + r * 1.0]} />))}
			</Stage3D>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<text x={W / 2} y={210} textAnchor="middle" style={t(104)} fill={GOLD} stroke="#0a0b10" strokeOpacity={0.5} strokeWidth={10} paintOrder="stroke">“不惜一切代价”</text>
				<Tag x={W / 2} y={300} text="德拉吉 · 欧洲央行 · 2012年7月26日" size={28} />
				<Note a="Look D 央行讲台（3D 电影感） · 关键帧 61s" b="空荡的会场，一束顶光打在讲台和话筒上，台上只有一张纸（承诺）；前景空椅子虚化" />
				<Sub t={SUB2} />
			</svg>
		</AbsoluteFill>
	);
};

/* ================= E 行情终端 · market data screen ================= */
const AMBER = '#ffb347', GREEN = '#3ddc97', RED = '#ff5a4f', GRID = '#1b2430';
const Term: React.FC<{children: React.ReactNode}> = ({children}) => (
	<g>
		<rect width={W} height={H} fill="#06080c" />
		{Array.from({length: 40}, (_, i) => <line key={i} x1={0} x2={W} y1={i * 27} y2={i * 27} stroke="#0c1118" strokeWidth={1} />)}
		{children}
		<rect width={W} height={H} fill="url(#e-vig)" />
	</g>
);
const EDefs = () => (
	<defs>
		<radialGradient id="e-vig" cx="50%" cy="50%" r="75%">
			<stop offset="0.55" stopColor="#000" stopOpacity="0" />
			<stop offset="1" stopColor="#000" stopOpacity="0.7" />
		</radialGradient>
		<filter id="e-glow" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur stdDeviation="4" result="b" />
			<feMerge>
				<feMergeNode in="b" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>
);
const Panel: React.FC<{x: number; y: number; w: number; h: number; title: string; children?: React.ReactNode}> = ({x, y, w, h, title, children}) => (
	<g>
		<rect x={x} y={y} width={w} height={h} fill="#0a0e14" stroke={GRID} strokeWidth={2} />
		<rect x={x} y={y} width={w} height={42} fill="#101722" />
		<text x={x + 18} y={y + 29} style={{...t(22, 700), fontFamily: SANS}} fill={AMBER}>{title}</text>
		{children}
	</g>
);
const E1: React.FC = () => {
	// two lines: 工资 (flat until "明年") and 你的消费 (steps up tonight); schematic
	const x0 = 160, x1 = 1180, yb = 760;
	const spend = [0, 0, 0, 0, 0, 0, 0, 60, 70, 70];
	return (
		<AbsoluteFill>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<EDefs />
				<Term>
					<Panel x={110} y={150} w={1120} h={680} title="你 · 个人账户  （示意）">
						{Array.from({length: 6}, (_, i) => <line key={i} x1={x0} x2={x1} y1={yb - i * 90} y2={yb - i * 90} stroke={GRID} />)}
						<polyline filter="url(#e-glow)" points={spend.map((v, i) => `${x0 + (i * (x1 - x0)) / 9},${yb - 200 - v * 4}`).join(' ')} fill="none" stroke={AMBER} strokeWidth={5} />
						<polyline points={`${x0},${yb - 120} ${x1},${yb - 120}`} fill="none" stroke={GREEN} strokeWidth={4} strokeDasharray="14 10" />
						<text x={x1 - 10} y={yb - 140} textAnchor="end" style={t(30, 700)} fill={GREEN}>工资：还没变（明年才涨）</text>
						<text x={x1 - 10} y={yb - 520} textAnchor="end" style={t(30, 700)} fill={AMBER}>今晚的消费 ▲</text>
						<line x1={x0 + (7 * (x1 - x0)) / 9} x2={x0 + (7 * (x1 - x0)) / 9} y1={yb} y2={yb - 470} stroke="#ffffff" strokeOpacity={0.35} strokeDasharray="6 8" />
						<text x={x0 + (7 * (x1 - x0)) / 9 + 12} y={yb - 440} style={t(24, 500)} fill="#d8d2c4">收到消息</text>
					</Panel>
					<Panel x={1290} y={150} w={520} h={300} title="新消息">
						<text x={1320} y={260} style={t(26, 500)} fill="#9aa4b2">老板 · 21:04</text>
						<text x={1320} y={330} style={t(48)} fill="#f4efe2" filter="url(#e-glow)">明年给你涨工资</text>
						<rect x={1320} y={370} width={14} height={40} fill={AMBER} />
					</Panel>
					<Panel x={1290} y={490} w={520} h={340} title="订单">
						<text x={1320} y={580} style={t(30, 500)} fill="#6d7684" textDecoration="line-through">普通套餐</text>
						<text x={1320} y={650} style={t(44)} fill={AMBER}>升级套餐 ▲</text>
						<text x={1320} y={720} style={{fontFamily: MONO, fontSize: 30}} fill="#9aa4b2">STATUS: 已下单</text>
					</Panel>
					<text x={110} y={110} style={{fontFamily: MONO, fontSize: 26}} fill="#5c6b7c">EXPECTATIONS TERMINAL · 2026</text>
				</Term>
				<Note a="Look E 行情终端 · 开场 2.6s" b="全片像一块金融行情屏：深色、等宽数字、琥珀/绿/红三色线；人的生活也是一张走势图" />
				<Sub t={SUB1} />
			</svg>
		</AbsoluteFill>
	);
};
const E2: React.FC = () => {
	const x0 = 150, x1 = 1250, yb = 820, top = 260;
	// schematic rise to the 7% line, then the marker
	const pts = [0.35, 0.38, 0.42, 0.4, 0.5, 0.58, 0.55, 0.66, 0.74, 0.8, 0.86, 0.93, 0.97];
	const px = (i: number) => x0 + (i * (x1 - x0 - 200)) / (pts.length - 1);
	const py = (v: number) => yb - v * (yb - top);
	return (
		<AbsoluteFill>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<EDefs />
				<Term>
					<rect x={0} y={130} width={W} height={60} fill="#1a0f05" />
					<text x={40} y={172} style={t(36)} fill={AMBER} filter="url(#e-glow)">● 快讯 · 伦敦  欧洲央行行长：“在职责范围内，不惜一切代价保住欧元。相信我，这就够了。”</text>
					<Panel x={110} y={220} w={1180} h={640} title="西班牙 · 借10年钱的利息 %  （示意，只标真实的7%）">
						<line x1={x0} x2={x1} y1={py(0.95)} y2={py(0.95)} stroke={RED} strokeDasharray="10 8" strokeWidth={2} />
						<text x={x1 - 10} y={py(0.95) - 12} textAnchor="end" style={t(30, 700)} fill={RED}>7%</text>
						<polyline filter="url(#e-glow)" points={pts.map((v, i) => `${px(i)},${py(v)}`).join(' ')} fill="none" stroke={RED} strokeWidth={5} />
						<line x1={px(12)} x2={px(12)} y1={yb} y2={top} stroke={AMBER} strokeWidth={3} />
						<rect x={px(12) - 70} y={top - 6} width={140} height={44} fill={AMBER} />
						<text x={px(12)} y={top + 26} textAnchor="middle" style={t(26)} fill="#1a1006">7月26日</text>
					</Panel>
					<Panel x={1340} y={220} w={470} h={300} title="央行出手">
						<text x={1575} y={400} textAnchor="middle" style={t(120)} fill={GREEN} filter="url(#e-glow)">0</text>
						<text x={1575} y={470} textAnchor="middle" style={t(30, 700)} fill="#9aa4b2">已花的钱</text>
					</Panel>
					<Panel x={1340} y={560} w={470} h={300} title="市场情绪">
						<text x={1575} y={730} textAnchor="middle" style={t(110)} fill={AMBER} filter="url(#e-glow)">承诺</text>
					</Panel>
				</Term>
				<Note a="Look E 行情终端 · 关键帧 61s" b="一句话像快讯滚过屏幕；利率线冲到7%红线时停住；右边“已花的钱：0”" />
				<Sub t={SUB2} />
			</svg>
		</AbsoluteFill>
	);
};

/* ================= F 钞票版画 · banknote engraving (money is itself a promise) ================= */
const INKG = '#1f4a3c', INKS = '#5a3b22', PAPER = '#efe6cf';
const Guilloche: React.FC<{cx: number; cy: number; R: number; r: number; d: number; n?: number; col?: string; o?: number; sw?: number}> = ({cx, cy, R, r, d, n = 720, col = INKG, o = 0.55, sw = 1}) => {
	const pts: string[] = [];
	const k = (R - r) / r;
	for (let i = 0; i <= n; i++) {
		const a = (i / n) * Math.PI * 2 * r;
		pts.push(`${cx + (R - r) * Math.cos(a) + d * Math.cos(k * a)},${cy + (R - r) * Math.sin(a) - d * Math.sin(k * a)}`);
	}
	return <polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={sw} opacity={o} />;
};
const Rosette: React.FC<{cx: number; cy: number; s?: number; col?: string}> = ({cx, cy, s = 1, col = INKG}) => (
	<g>
		{[0, 1, 2, 3, 4].map((i) => (
			<Guilloche key={i} cx={cx} cy={cy} R={(120 - i * 14) * s} r={(17 + i) * s} d={(62 - i * 8) * s} col={col} o={0.5 - i * 0.05} sw={1.1} n={1400} />
		))}
	</g>
);
const Waves: React.FC<{y: number; h: number; col?: string}> = ({y, h, col = INKG}) => (
	<g opacity={0.35}>
		{Array.from({length: 26}, (_, k) => (
			<path key={k} d={`M0,${y + (k * h) / 26} ${Array.from({length: 49}, (_, i) => `L${i * 40},${y + (k * h) / 26 + Math.sin(i * 0.5 + k * 0.4) * 9}`).join(' ')}`} fill="none" stroke={col} strokeWidth={1} />
		))}
	</g>
);
const Note2: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; col?: string}> = ({x, y, w, h, children, col = INKG}) => (
	<g>
		<rect x={x + 14} y={y + 18} width={w} height={h} fill="#000" opacity={0.35} />
		<rect x={x} y={y} width={w} height={h} fill={PAPER} />
		<rect x={x + 22} y={y + 22} width={w - 44} height={h - 44} fill="none" stroke={col} strokeWidth={6} />
		<rect x={x + 34} y={y + 34} width={w - 68} height={h - 68} fill="none" stroke={col} strokeWidth={1.5} />
		{children}
	</g>
);
const FBack: React.FC = () => (
	<g>
		<rect width={W} height={H} fill="#1d2a26" />
		<Waves y={0} h={H} col="#4f6f62" />
		<rect width={W} height={H} fill="url(#f-vig)" />
	</g>
);
const FDefs = () => (
	<defs>
		<radialGradient id="f-vig" cx="50%" cy="45%" r="75%">
			<stop offset="0.4" stopColor="#000" stopOpacity="0" />
			<stop offset="1" stopColor="#000" stopOpacity="0.75" />
		</radialGradient>
	</defs>
);
const F1: React.FC = () => (
	<AbsoluteFill>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
			<FDefs />
			<FBack />
			<g transform="rotate(-3 960 520)">
				<Note2 x={300} y={200} w={1320} h={620} col={INKS}>
					<Waves y={240} h={540} col={INKS} />
					<Rosette cx={540} cy={510} s={1.5} col={INKS} />
					<text x={1100} y={370} textAnchor="middle" style={t(40, 700)} fill={INKS} letterSpacing="0.3em">工 资 通 知</text>
					<text x={1100} y={520} textAnchor="middle" style={t(120)} fill={INKS}>明年涨工资</text>
					<text x={1100} y={610} textAnchor="middle" style={t(34, 500)} fill={INKS}>到账日期：明年</text>
					<text x={1480} y={760} textAnchor="end" style={{fontFamily: MONO, fontSize: 30}} fill="#9a3b2c">No. 000000</text>
					<text x={360} y={760} style={t(26, 500)} fill={INKS} opacity={0.8}>示意</text>
				</Note2>
			</g>
			<Tag x={1510} y={900} text="钱还没到账，消费先变了" light />
			<Note a="Look F 钞票版画 · 开场 2.6s" b="全片用钞票的雕版印刷语言：扭索纹、细线网、编号；“钱本身就是一张承诺”" />
			<Sub t={SUB1} />
		</svg>
	</AbsoluteFill>
);
const F2: React.FC = () => (
	<AbsoluteFill>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
			<FDefs />
			<FBack />
			<Note2 x={190} y={150} w={1540} h={700}>
				<Waves y={190} h={620} />
				<Rosette cx={390} cy={500} s={1.3} />
				<Rosette cx={1530} cy={500} s={1.3} />
				<text x={960} y={300} textAnchor="middle" style={t(36, 700)} fill={INKG} letterSpacing="0.4em">欧 洲 央 行 · 承 诺</text>
				<text x={960} y={470} textAnchor="middle" style={t(112)} fill={INKG}>不惜一切代价</text>
				<text x={960} y={560} textAnchor="middle" style={t(52, 700)} fill={INKG}>保住欧元</text>
				<text x={960} y={650} textAnchor="middle" style={t(30, 500)} fill={INKG}>伦敦 · 2012年7月26日</text>
				<g transform="translate(1320 700) rotate(-12)">
					<rect x={-130} y={-56} width={260} height={92} fill="none" stroke="#a8322a" strokeWidth={6} />
					<text x={0} y={16} textAnchor="middle" style={t(54)} fill="#a8322a">已兑付：0</text>
				</g>
				<text x={420} y={760} textAnchor="middle" style={{fontFamily: MONO, fontSize: 30}} fill="#9a3b2c">No. 20120726</text>
			</Note2>
			<Note a="Look F 钞票版画 · 关键帧 61s" b="那句话被印成一张“钞票”：钞票本来就是一张承诺；红章“已兑付：0”留给揭晓" />
			<Sub t={SUB2} />
		</svg>
	</AbsoluteFill>
);

const LOOKS: React.FC[] = [D1, D2, E1, E2, F1, F2];
const LookFrame: React.FC<{i: number}> = ({i}) => {
	const C = LOOKS[i];
	return <C />;
};
const Root: React.FC = () => <Composition id="L26" component={LookFrame} durationInFrames={1} fps={30} width={W} height={H} defaultProps={{i: 0}} />;
registerRoot(Root);
