import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {loadEpisodeFonts} from '../../../src/lib/fonts';
import {font} from '../../../src/lib/theme';
import {Bean, CAFFEINE, ADENOSINE, Cherry, Cup, DNA, Flower, Globe, Leaf, Molecule, Saucer, Steam, Table} from './props3d';
import {Lights, Stage3D} from './stage3d';

/** v4 prop review: one hero prop per panel, turning under the house light */
export const PROP_PANEL = 90;

type Panel = {en: string; zh: string; note: string; render: (f: number) => React.ReactNode; cam: [number, number, number]; target?: [number, number, number]; fov?: number};

const ROUTES: [number, number][] = [
	[43.25, 13.32], // Mocha
	[75.7, 13.4], // Chikmagalur
	[4.9, 52.37], // Amsterdam
	[2.35, 48.85], // Paris
	[-61.0, 14.6], // Martinique
];

const PANELS: Panel[] = [
	{
		en: 'the cup',
		zh: '杯子 · 釉面陶瓷 + 实时咖啡液面',
		note: '开头拉回 / 结尾窗边',
		cam: [0, 1.6, 3.4],
		target: [0, 0.45, 0],
		render: (f) => (
			<>
				<Table />
				<group rotation={[0, -0.6 + f / 90, 0]}>
					<Saucer />
					<Cup position={[0, 0.05, 0]} t={f / 30} />
				</group>
				<Steam t={f / 30} position={[0, 1.0, 0]} o={0.35} />
			</>
		),
	},
	{
		en: 'the bean',
		zh: '咖啡豆 · 生豆 → 深烘（颜色和油光随温度变化）',
		note: '烘焙 / 七颗种子',
		cam: [0, 1.6, 3.2],
		target: [0, 0, 0],
		render: (f) =>
			[0, 0.3, 0.55, 0.78, 1].map((r, i) => <Bean key={i} roast={r} position={[(i - 2) * 0.62, 0, 0]} rotation={[-1.1 + 0.3 * Math.sin(f / 30 + i), f / 40 + i * 0.7, 0.2]} scale={0.34} />),
	},
	{
		en: 'adenosine vs caffeine',
		zh: '腺苷 vs 咖啡因 · 同一个骨架（金色）',
		note: '睡意那段的分子镜头',
		cam: [0, 0, 16],
		render: (f) => (
			<>
				<Molecule mol={ADENOSINE} core={0.8} position={[-4.2, 1.2, 0]} rotation={[0.3, f / 50, 0]} scale={0.85} />
				<Molecule mol={CAFFEINE} core={0.8} position={[4.2, 0, 0]} rotation={[0.3, f / 50 + 1, 0]} scale={0.85} />
			</>
		),
	},
	{
		en: 'the globe',
		zh: '地球 · 真实海岸线 + 3D 航线',
		note: '七颗种子的旅程',
		cam: [0, 0.4, 3.3],
		render: (f) => (
			<Globe
				rotation={[0.25, -0.9 + f / 200, 0]}
				routes={ROUTES.slice(0, -1).map((a, i) => ({from: a, to: ROUTES[i + 1], p: 1}))}
				cities={ROUTES.map((at) => ({at, o: 1}))}
			/>
		),
	},
	{
		en: 'dna',
		zh: 'DNA · 代谢快慢写在基因里',
		note: '身体那段',
		cam: [0, 0, 9],
		render: (f) => <DNA rotation={[0, 0, 0.35]} t={f / 20} />,
	},
	{
		en: 'branch',
		zh: '咖啡枝 · 油亮叶片 + 红果',
		note: '起源 / 防身术',
		cam: [0, 0.2, 4.2],
		render: (f) => (
			<group rotation={[0, f / 80, 0]}>
				<Leaf position={[-0.6, 0.3, 0]} rotation={[0.4, 0.3, 0.9]} scale={0.7} />
				<Leaf position={[0.7, 0.2, -0.2]} rotation={[0.3, -0.4, -0.95]} scale={0.65} color="#244f26" />
				<mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 2 - 0.15]}>
					<cylinderGeometry args={[0.03, 0.04, 2.6, 12]} />
					<meshStandardMaterial color="#4a3020" roughness={0.8} />
				</mesh>
				{Array.from({length: 11}, (_, i) => {
					const a = (i / 11) * Math.PI * 2;
					const x = -0.25 + 0.5 * (i % 2) + Math.cos(a) * 0.05;
					return <Cherry key={i} ripe={[1, 1, 0.9, 0.6, 1, 0.3, 1, 0.8, 1, 0.5, 1][i]} position={[x + Math.cos(a) * 0.12, -0.12 - x * 0.15 + Math.sin(a) * 0.14, Math.sin(a * 2) * 0.12]} rotation={[0, 0, a]} scale={0.9} />;
				})}
			</group>
		),
	},
	{
		en: 'the flower',
		zh: '咖啡花 · 花蜜里藏着咖啡因',
		note: '开花 / 蜜蜂',
		cam: [0, 0, 2.4],
		render: (f) => (
			<group rotation={[0.5, f / 70, 0]}>
				<Flower glow={0.15} />
				<Flower position={[0.7, -0.3, -0.4]} rotation={[0.2, 0.4, 0.5]} scale={0.8} open={0.7} />
			</group>
		),
	},
];

export const PROPS3D_N = PANELS.length * PROP_PANEL;

export const XumingProps3D: React.FC = () => {
	loadEpisodeFonts('xuming');
	const frame = useCurrentFrame();
	const i = Math.min(PANELS.length - 1, Math.floor(frame / PROP_PANEL));
	const f = frame - i * PROP_PANEL;
	const P = PANELS[i];
	return (
		<AbsoluteFill style={{background: '#05060b'}}>
			<Stage3D cam={{pos: P.cam, target: P.target ?? [0, 0, 0], fov: P.fov ?? 35}} bloom={0.7}>
				<Lights />
				{P.render(f)}
			</Stage3D>
			<div style={{position: 'absolute', left: 120, top: 90, color: '#efe4d0'}}>
				<div style={{fontFamily: font.sans, fontSize: 18, letterSpacing: '0.32em', color: '#c99a5a', textTransform: 'uppercase'}}>{`${i + 1} / ${PANELS.length} · ${P.en}`}</div>
				<div style={{fontFamily: font.serif, fontSize: 40, fontWeight: 700, marginTop: 14}}>{P.zh}</div>
				<div style={{fontFamily: font.sans, fontSize: 22, opacity: 0.55, marginTop: 10}}>{P.note}</div>
			</div>
		</AbsoluteFill>
	);
};
