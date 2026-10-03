import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {GlowDefs, Stage, T, countUp} from '../../src/components/Stage';
import {ease, mix, prog, useBeat, useCue, useLayout, useScene, useTimeline} from '../../src/lib/context';
import {color} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {FLEET, Holes, PlaneShape, SURVIVOR, holesIn} from './plane';

const useStage = () => useLayout().stage;
const at = (x: number, y: number, s = 1, r = 0) => `translate(${x},${y}) rotate(${r}) scale(${s})`;

/** Head-and-shoulders silhouette, optional round glasses, in a circular frame of radius r. */
const Bust: React.FC<{r: number; glasses?: boolean; ring?: string; id: string}> = ({r, glasses, ring = color.line, id}) => (
	<g>
		<defs>
			<clipPath id={`bust-${id}`}>
				<circle r={r} />
			</clipPath>
		</defs>
		<circle r={r} fill="#10131c" />
		<g clipPath={`url(#bust-${id})`} transform={`scale(${r / 70})`}>
			<circle cx={0} cy={-14} r={25} fill="#2a2f3d" />
			<path d="M-56,74 C-54,30 -28,16 0,16 C28,16 54,30 56,74 Z" fill="#2a2f3d" />
			{glasses ? (
				<g stroke={color.gold} strokeWidth={2} fill="none" opacity={0.85}>
					<circle cx={-10} cy={-14} r={7} />
					<circle cx={10} cy={-14} r={7} />
					<line x1={-3} y1={-14} x2={3} y2={-14} />
				</g>
			) : null}
		</g>
		<circle r={r} fill="none" stroke={ring} strokeWidth={2.5} />
	</g>
);

const Cat: React.FC<{ink?: string; dashed?: boolean; legs?: number}> = ({ink = color.text, dashed, legs = 0}) => {
	const st = {stroke: ink, strokeWidth: 3, fill: dashed ? 'none' : ink, strokeDasharray: dashed ? '5 5' : undefined};
	return (
		<g>
			<ellipse cx={0} cy={6} rx={30} ry={17} {...st} />
			<circle cx={28} cy={-12} r={13} {...st} />
			<path d="M20,-22 L22,-36 L30,-24 Z M32,-24 L38,-36 L40,-20 Z" {...st} />
			<path d="M-28,4 C-48,-6 -50,-26 -40,-34" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" strokeDasharray={st.strokeDasharray} />
			{[-18, -6, 10, 22].map((x, i) => (
				<line key={x} x1={x} y1={18} x2={x + legs * (i < 2 ? -12 : 12)} y2={34 - legs * 6} stroke={ink} strokeWidth={5} strokeLinecap="round" strokeDasharray={st.strokeDasharray} />
			))}
		</g>
	);
};

const Person: React.FC<{fill: string; s?: number}> = ({fill, s = 1}) => (
	<g transform={`scale(${s})`}>
		<circle cx={0} cy={-26} r={11} fill={fill} />
		<path d="M-17,14 C-17,-6 -10,-12 0,-12 C10,-12 17,-6 17,14 Z" fill={fill} />
	</g>
);

// ---------------------------------------------------------------- 1. hook

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const fly = prog(f, 0, 100, ease.out);
	const holes = prog(f, cue(1) - 4, 80, ease.inOut);
	const ask = prog(f, cue(2) + 20, 22);
	const sweep = Math.sin(f / 45);
	const active = Math.floor(Math.max(0, f - cue(2) - 20) / 22) % 3;
	const callouts: [number, number, number, string][] = [
		[-205, -8, 62, '机翼？'],
		[0, 50, 70, '机身？'],
		[140, -42, 50, '发动机？'],
	];
	return (
		<Stage push={0.05}>
			<GlowDefs />
			<defs>
				<linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
					<stop offset="0%" stopColor="#fff2d6" stopOpacity="0.16" />
					<stop offset="100%" stopColor="#fff2d6" stopOpacity="0" />
				</linearGradient>
			</defs>
			{[-1, 1].map((side) => (
				<polygon
					key={side}
					points={`${W / 2 + side * 760},${H + 40} ${W / 2 + side * (520 - 260 * sweep * side)},-60 ${W / 2 + side * (300 - 260 * sweep * side)},-60`}
					fill="url(#beam)"
				/>
			))}
			{new Array(9).fill(0).map((_, i) => {
				const y = ((i * 110 + f * 14 * (1 - fly)) % 990) - 120;
				return <rect key={i} x={W / 2 - 4} y={y} width={8} height={54} fill={color.faint} opacity={0.5 * (1 - 0.6 * fly)} />;
			})}
			<g transform={at(W / 2, mix(-240, H / 2 + 20, fly), mix(0.3, 1.12, fly))}>
				<PlaneShape />
				<Holes holes={SURVIVOR} p={holes} />
				{callouts.map(([x, y, r, label], i) => (
					<g key={label} opacity={ask}>
						<circle
							cx={x}
							cy={y}
							r={r * (1 + 0.06 * (active === i ? 1 : 0))}
							fill="none"
							stroke={active === i ? color.gold : color.dim}
							strokeWidth={active === i ? 3 : 2}
							strokeDasharray="8 8"
						/>
						<T x={x + (i === 0 ? -20 : i === 2 ? 70 : 0)} y={i === 1 ? y + r + 30 : y - r - 26} size={30} tone={active === i ? 'gold' : 'dim'}>
							{label}
						</T>
					</g>
				))}
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- 2. cold open

const MEMBERS: [string, string, boolean][] = [
	['沃利斯', 'W. A. Wallis', false],
	['霍特林', 'H. Hotelling', false],
	['瓦尔德', 'A. Wald', false],
	['弗里德曼', 'M. Friedman', true],
	['萨维奇', 'L. J. Savage', false],
];

const ColdOpen: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const year = Math.round(mix(1939, 1943, prog(f, 4, 40, ease.out)));
	const lit = prog(f, cue(0) + 30, 30);
	const flicker = 0.85 + 0.15 * Math.sin(f / 3.1) * Math.sin(f / 7.3);
	const members = prog(f, cue(2) - 6, 24);
	const bx = W * 0.6;
	const by = 70;
	const cols = 6;
	const rows = 8;
	return (
		<Stage>
			<GlowDefs />
			<g opacity={1 - members}>
				<T x={W * 0.3} y={H * 0.4} size={250} family="latin" weight={600} tone="gold" filter="url(#glow-gold)" opacity={prog(f, 0, 20)}>
					{year}
				</T>
				<T x={W * 0.3} y={H * 0.4 + 150} size={34} family="latinItalic" weight={500} tone="dim" track={0.18} opacity={prog(f, 20, 25)}>
					New York · 401 West 118th Street
				</T>
				<g opacity={prog(f, 10, 30)}>
					<rect x={bx} y={by} width={400} height={H - by} fill="#0c0e15" stroke={color.line} strokeWidth={2} />
					{/* the water tower on the roof */}
					<g stroke={color.line} strokeWidth={2} fill="#0c0e15">
						<path d={`M${bx + 290},${by - 70} h56 v52 h-56 Z`} />
						<path d={`M${bx + 284},${by - 70} L${bx + 318},${by - 98} L${bx + 352},${by - 70} Z`} />
						<line x1={bx + 296} y1={by - 18} x2={bx + 292} y2={by} />
						<line x1={bx + 340} y1={by - 18} x2={bx + 344} y2={by} />
					</g>
					{new Array(cols * rows).fill(0).map((_, i) => {
						const c = i % cols;
						const r = Math.floor(i / cols);
						const hero = c === 2 && r === 3;
						const x = bx + 26 + c * 62;
						const y = by + 28 + r * 76;
						return (
							<g key={i}>
								{hero ? <circle cx={x + 18} cy={y + 24} r={110} fill="url(#spot-gold)" opacity={lit * flicker * 0.8} /> : null}
								<rect
									x={x}
									y={y}
									width={36}
									height={48}
									fill={hero ? `rgba(255,190,100,${0.08 + 0.85 * lit * flicker})` : `rgba(255,220,160,${0.03 + 0.03 * random(`w${i}`)})`}
									stroke={color.line}
									strokeWidth={1}
								/>
							</g>
						);
					})}
					{['∑', '∫', 'σ²', 'p(x)', 'n!', '√n', 'x̄', 'H₀', 'E[X]'].map((s, i) => {
						const t0 = cue(1) + i * 9;
						const p = prog(f, t0, 90, ease.out);
						if (f < t0) return null;
						return (
							<T
								key={i}
								x={bx + 2 * 62 + 44 + (i - 4) * 34 + 60 * Math.sin(i * 2.1) * p}
								y={by + 3 * 76 + 40 - 260 * p}
								size={28 + (i % 3) * 6}
								family="latinItalic"
								tone="gold"
								opacity={(1 - p) * 0.9}
							>
								{s}
							</T>
						);
					})}
				</g>
			</g>
			<g opacity={members}>
				{MEMBERS.map(([zh, en, star], i) => {
					const x = W / 2 + (i - 2) * 300;
					const p = prog(f, cue(2) + i * 5, 22);
					return (
						<g key={zh} transform={at(x, H * 0.42 + (1 - p) * 30)} opacity={p}>
							{star ? <circle r={120} fill="url(#spot-gold)" /> : null}
							<Bust r={88} id={`m${i}`} glasses={i === 2} ring={star ? color.gold : color.line} />
							<T y={140} size={40} tone={star ? 'gold' : 'text'} weight={700}>
								{zh}
							</T>
							<T y={186} size={28} family="latinItalic" tone="dim">
								{en}
							</T>
							{star ? (
								<T y={-130} size={26} family="sans" tone="gold" weight={500} track={0.1}>
									1976 诺贝尔经济学奖
								</T>
							) : null}
						</g>
					);
				})}
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- 3. the data

const BARS: [string, string, number, number][] = [
	['机身', 'Fuselage', 1.73, 1],
	['燃油系统', 'Fuel system', 1.55, 1],
	['发动机', 'Engine', 1.11, 2],
];

const HoleData: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const starts = [cue(1), cue(1) + 50, cue(2)];
	const armor = prog(f, cue(3) + 18, 30);
	const stamp = prog(f, cue(3) + 40, 14, ease.back);
	const focus = f >= cue(2) ? 2 : f >= starts[1] ? 1 : f >= starts[0] ? 0 : -1;
	return (
		<Stage>
			<GlowDefs />
			<g transform={at(W * 0.29, H * 0.5, 1.28)}>
				<PlaneShape armor={armor} />
				<Holes holes={SURVIVOR} p={1} size={0.9} only={focus === 0 ? ['fuselage'] : focus === 1 ? ['wing'] : undefined} pulse={useBeat(8) * (focus >= 0 && focus < 2 ? 1 : 0)} />
				{focus >= 0 && focus < 2 ? <Holes holes={SURVIVOR} p={1} size={0.9} tone="rgba(255,90,78,0.25)" only={focus === 0 ? ['wing', 'tail'] : ['fuselage', 'tail']} /> : null}
				{focus === 2
					? [-140, -70, 70, 140].map((x) => (
							<circle key={x} cx={x} cy={-40} r={40 + 4 * Math.sin(f / 6)} fill="none" stroke={color.steel} strokeWidth={2.5} strokeDasharray="6 6" />
						))
					: null}
				<T x={-230} y={200} size={22} family="sans" tone="faint" track={0.2}>
					示意图
				</T>
			</g>
			<g opacity={stamp} transform={at(W * 0.29 - 250, H * 0.12, mix(1.6, 1, stamp), -8)}>
				<rect x={-118} y={-34} width={236} height={68} fill="none" stroke={color.red} strokeWidth={4} />
				<T size={36} tone="red" weight={900} track={0.2}>
					加固这里
				</T>
			</g>
			<T x={W * 0.58} y={H * 0.12} size={26} family="sans" tone="dim" textAnchor="start" track={0.2} opacity={prog(f, cue(0), 20)}>
				每平方英尺 · 平均弹孔数
			</T>
			{BARS.map(([zh, en, v, tone], i) => {
				const p = prog(f, starts[i], 34);
				const y = H * (0.3 + i * 0.22);
				const x0 = W * 0.58;
				const len = (v / 1.9) * 620 * p;
				const c = tone === 2 ? color.steel : color.red;
				const dim = focus >= 0 && focus !== i ? 0.45 : 1;
				return (
					<g key={zh} opacity={prog(f, cue(0) + i * 6, 20) * dim}>
						<T x={x0} y={y - 44} size={34} textAnchor="start" weight={700}>
							{zh}
						</T>
						<T x={x0 + 22 + zh.length * 34} y={y - 42} size={26} family="latinItalic" tone="dim" textAnchor="start">
							{en}
						</T>
						<rect x={x0} y={y - 14} width={620} height={28} rx={14} fill="rgba(255,255,255,0.05)" />
						<rect x={x0} y={y - 14} width={len} height={28} rx={14} fill={c} opacity={0.9} />
						<T x={x0 + 640 + 10} y={y + 2} size={64} family="latin" weight={600} tone={tone === 2 ? 'steel' : 'red'} textAnchor="start">
							{countUp(f, v, starts[i], 34, 2)}
						</T>
					</g>
				);
			})}
		</Stage>
	);
};

// ---------------------------------------------------------------- 4. the twist

const Twist: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const card = prog(f, cue(0) - 8, 30);
	const strike = prog(f, cue(1), 26, ease.in);
	const glow = prog(f, cue(2) + 6, 30);
	const why = prog(f, cue(3), 30);
	const pulse = useBeat(10);
	return (
		<Stage>
			<GlowDefs />
			<defs>
				<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#ffe9c2" stopOpacity="0.22" />
					<stop offset="100%" stopColor="#ffe9c2" stopOpacity="0" />
				</linearGradient>
			</defs>
			<T x={W * 0.68} y={H * 0.48} size={520} family="latin" weight={500} tone="gold" opacity={0.1 * why}>
				?
			</T>
			<g opacity={card}>
				<polygon points={`${W * 0.27 - 60},-80 ${W * 0.27 + 60},-80 ${W * 0.27 + 260},${H} ${W * 0.27 - 260},${H}`} fill="url(#cone)" />
				<g transform={at(W * 0.27, H * 0.36 + (1 - card) * 20)}>
					<ellipse rx={150} ry={185} fill="none" stroke={color.goldDeep} strokeWidth={2} />
					<ellipse rx={138} ry={173} fill="none" stroke={color.line} strokeWidth={1} />
					<g transform="translate(0, 12)">
						<Bust r={120} id="wald" glasses ring="none" />
					</g>
				</g>
				<T x={W * 0.27} y={H * 0.36 + 235} size={50} weight={900} tone="gold" filter="url(#glow-gold)">
					亚伯拉罕·瓦尔德
				</T>
				<T x={W * 0.27} y={H * 0.36 + 292} size={32} family="latinItalic" tone="dim">
					Abraham Wald · 1902 – 1950
				</T>
			</g>
			<g transform={at(W * 0.68, H * 0.52, 1.15)} opacity={prog(f, cue(0) + 20, 30) * (0.55 + 0.45 * glow)}>
				<PlaneShape armor={1} armorStrike={strike} engineGlow={glow * (0.75 + 0.25 * pulse)} />
				<Holes holes={SURVIVOR} p={1} size={0.85} />
				{glow > 0
					? [-140, -70, 70, 140].map((x) => (
							<circle key={x} cx={x} cy={-40} r={46 + 30 * ((f / 40) % 1)} fill="none" stroke={color.gold} strokeWidth={2} opacity={glow * (1 - ((f / 40) % 1))} />
						))
					: null}
				<g opacity={glow}>
					<T y={-262} size={40} tone="gold" weight={900} track={0.2}>
						加固这里
					</T>
					{[-105, 105].map((x) => (
						<path key={x} d={`M${x * 0.35},-228 Q${x * 0.8},-190 ${x},-116`} fill="none" stroke={color.gold} strokeWidth={2.5} strokeDasharray="6 6" />
					))}
				</g>
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- 5 + 6. the fleet

const fleetSlot = (i: number, W: number, H: number) => ({x: W / 2 + ((i % 6) - 2.5) * 300, y: H * (i < 6 ? 0.29 : 0.73)});

const Mechanism: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const scene = useScene();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const hits = prog(f, cue(0) + 6, cue(1) + 45 - cue(0), ease.inOut);
	const reveal = prog(f, cue(2), 20);
	const dread = prog(f, cue(3), scene.duration - cue(3), ease.in);
	return (
		<Stage push={0.06}>
			<GlowDefs />
			{f < cue(1) + 50
				? new Array(18).fill(0).map((_, k) => {
						const t0 = cue(0) + 6 + k * 9;
						const p = prog(f, t0, 10, ease.in);
						if (p <= 0 || p >= 1) return null;
						const x = random(`tx${k}`) * W;
						return <line key={k} x1={x - 300 + 300 * p} y1={-60 + 500 * p} x2={x - 260 + 300 * p} y2={-20 + 500 * p} stroke="#ffd9a0" strokeWidth={3} opacity={0.7} />;
					})
				: null}
			{FLEET.map((pl, i) => {
				const {x, y} = fleetSlot(i, W, H);
				const p = prog(f, i * 2, 18);
				const shake = pl.lost ? dread * 6 : 0;
				const jx = shake * (random(`jx${i}${f}`) - 0.5);
				const jy = shake * (random(`jy${i}${f}`) - 0.5);
				const ink = pl.lost && reveal > 0 ? `rgba(255,90,78,${0.5 + 0.45 * reveal})` : 'rgba(243,237,226,0.7)';
				return (
					<g key={i} transform={at(x + jx, y + jy, 0.5)} opacity={p * (pl.lost ? 1 : 1 - 0.45 * reveal)}>
						<PlaneShape ink={ink} weight={2} />
						<Holes holes={pl.holes} p={Math.min(1, Math.max(0, hits * 1.15 - i * 0.012))} size={1.6} only={['wing', 'fuselage', 'tail']} />
						<Holes holes={pl.holes} p={Math.min(1, Math.max(0, hits * 1.15 - i * 0.012))} size={1.6 + 0.5 * reveal} pulse={reveal * Math.abs(Math.sin(f / 5))} only={['engine']} />
					</g>
				);
			})}
		</Stage>
	);
};

const Reveal: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const move = prog(f, 4, 40, ease.inOut);
	const fall = prog(f, 0, 30, ease.in);
	const survivors = FLEET.map((p, i) => ({...p, i})).filter((p) => !p.lost);
	const lost = FLEET.map((p, i) => ({...p, i})).filter((p) => p.lost);
	const upLabel = prog(f, cue(1), 20);
	const downLabel = prog(f, cue(2), 20);
	const pulse = useBeat(8);
	return (
		<Stage fadeIn={2}>
			<GlowDefs />
			{lost.map((pl, k) => {
				const from = fleetSlot(pl.i, W, H);
				const to = {x: W / 2 + (k - (lost.length - 1) / 2) * 300, y: H * 0.74};
				const dropY = Math.sin(fall * Math.PI) * 120;
				const x = mix(from.x, to.x, move);
				const y = mix(from.y, to.y, move) + dropY;
				return (
					<g key={pl.i} transform={at(x, y, 0.5, (1 - move) * (k % 2 ? 18 : -18) * fall)} opacity={0.95}>
						<PlaneShape ghost ink="rgba(255,90,78,0.85)" weight={2.2} />
						<Holes holes={pl.holes} p={1} size={1.6 + 0.6 * pulse} only={['engine']} />
					</g>
				);
			})}
			{survivors.map((pl, k) => {
				const from = fleetSlot(pl.i, W, H);
				const to = {x: W / 2 + (k - (survivors.length - 1) / 2) * 260, y: H * 0.29};
				return (
					<g key={pl.i} transform={at(mix(from.x, to.x, move), mix(from.y, to.y, move), 0.46)}>
						<PlaneShape ink={upLabel > 0 ? `rgba(241,197,109,${0.55 + 0.45 * upLabel})` : 'rgba(243,237,226,0.7)'} weight={2} />
						<Holes holes={pl.holes} p={1} size={1.6} />
					</g>
				);
			})}
			<g opacity={upLabel}>
				<T x={W / 2} y={H * 0.29 - 112} size={34} tone="gold" weight={700} track={0.12}>
					返航 · 机身中弹，还能回家
				</T>
			</g>
			<g opacity={downLabel}>
				<T x={W / 2} y={H * 0.74 - 112} size={34} tone="red" weight={700} track={0.12}>
					未返航 · 发动机中弹
				</T>
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- 7. the name

const Concept: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const title = '幸存者偏差';
	const sieve = prog(f, cue(1) - 6, 20);
	return (
		<Stage>
			<GlowDefs />
			{[...title].map((ch, i) => {
				const p = prog(f, cue(0) + 18 + i * 4, 22);
				return (
					<T key={i} x={W / 2 + (i - 2) * 170} y={H * 0.3 + (1 - p) * 24} size={150} weight={900} tone="gold" filter="url(#glow-gold)" opacity={p}>
						{ch}
					</T>
				);
			})}
			<T x={W / 2} y={H * 0.3 + 130} size={40} family="latin" weight={600} tone="dim" track={0.5} opacity={prog(f, cue(0) + 40, 25)}>
				SURVIVORSHIP BIAS
			</T>
			<g opacity={sieve}>
				<line x1={W / 2 - 520} y1={H * 0.86} x2={W / 2 + 520} y2={H * 0.86} stroke={color.goldDeep} strokeWidth={3} strokeDasharray="14 10" />
				{new Array(60).fill(0).map((_, i) => {
					const pass = i % 8 === 3;
					const t0 = cue(1) + random(`s${i}`) * 70;
					const p = prog(f, t0, 34, ease.in);
					if (f < t0) return null;
					const x = W / 2 + (random(`sx${i}`) - 0.5) * 1000;
					const y = mix(H * 0.6, H * 0.86, p);
					const below = pass ? prog(f, t0 + 34, 16) : 0;
					return (
						<circle
							key={i}
							cx={x}
							cy={y + below * 40}
							r={pass ? 9 : 6}
							fill={pass ? color.gold : color.steel}
							opacity={pass ? 1 : 0.6 * (1 - prog(f, t0 + 30, 8))}
							filter={pass && below > 0 ? 'url(#glow-gold)' : undefined}
						/>
					);
				})}
				<T x={W / 2 + 640} y={H * 0.86 + 40} size={28} tone="gold" textAnchor="start" opacity={prog(f, cue(1) + 90, 20)}>
					← 你看到的
				</T>
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- 8. the cats

const CURVE: [number, number][] = [
	[2, 0.3], [3, 0.44], [4, 0.58], [5, 0.7], [6, 0.82], [7, 0.9], [8, 0.86], [10, 0.74], [12, 0.64], [15, 0.55], [18, 0.5], [21, 0.47],
];

const Cats: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const bx = 170;
	const top = 30;
	const floorH = (H - top - 20) / 21;
	const floorY = (n: number) => H - 20 - n * floorH;
	const loop = ((f % 75) / 75);
	const fallY = mix(floorY(14), floorY(0) - 30, loop * loop);
	const righting = prog(f, cue(2), 30);
	const cx0 = 820;
	const cw = 860;
	const cy0 = H * 0.82;
	const ch = H * 0.62;
	const px = (fl: number) => cx0 + ((fl - 2) / 19) * cw;
	const py = (v: number) => cy0 - v * ch;
	const draw = prog(f, cue(1) - 10, 60, ease.inOut);
	const alt = prog(f, cue(3) + 10, 40, ease.inOut);
	const pts = CURVE.map(([fl, v]) => `${px(fl)},${py(v)}`);
	const len = 1500;
	return (
		<Stage>
			<GlowDefs />
			<g opacity={prog(f, 0, 20)}>
				<rect x={bx} y={floorY(20)} width={240} height={floorY(0) - floorY(20)} fill="#0c0e15" stroke={color.line} strokeWidth={2} />
				{new Array(20).fill(0).map((_, n) => (
					<g key={n}>
						<line x1={bx} y1={floorY(n + 1)} x2={bx + 240} y2={floorY(n + 1)} stroke={color.line} strokeWidth={1} />
						{[0, 1, 2].map((c) => (
							<rect key={c} x={bx + 24 + c * 72} y={floorY(n + 1) + 6} width={48} height={floorH - 12} fill={`rgba(255,220,160,${0.025 + 0.05 * random(`cw${n}${c}`)})`} />
						))}
						{(n + 1) % 5 === 0 || n + 1 === 7 ? (
							<T x={bx - 30} y={floorY(n + 1) + floorH / 2} size={22} family="latin" tone={n + 1 === 7 ? 'gold' : 'faint'} textAnchor="end">
								{`${n + 1}F`}
							</T>
						) : null}
					</g>
				))}
				<line x1={bx - 10} y1={floorY(7)} x2={bx + 330} y2={floorY(7)} stroke={color.gold} strokeWidth={2} strokeDasharray="8 8" opacity={prog(f, cue(1), 20)} />
				<g transform={at(bx + 300, fallY, 0.9, mix(loop * 540, 0, righting))}>
					<Cat ink={color.text} legs={righting} />
				</g>
			</g>
			<g opacity={prog(f, cue(0) + 10, 20)}>
				<T x={cx0 + cw - 330} y={H * 0.1} size={110} family="latin" weight={600} tone="gold" textAnchor="end" filter="url(#glow-gold)">
					{countUp(f, 132, cue(0) + 10, 40)}
				</T>
				<T x={cx0 + cw - 310} y={H * 0.1 + 8} size={30} tone="dim" textAnchor="start">
					只坠楼的猫 · 5 个月
				</T>
			</g>
			<g opacity={prog(f, cue(1) - 10, 20)}>
				<line x1={cx0} y1={cy0} x2={cx0 + cw} y2={cy0} stroke={color.dim} strokeWidth={2} />
				<line x1={cx0} y1={cy0} x2={cx0} y2={cy0 - ch - 20} stroke={color.dim} strokeWidth={2} />
				{[2, 7, 12, 17, 21].map((fl) => (
					<T key={fl} x={px(fl)} y={cy0 + 30} size={24} family="latin" tone={fl === 7 ? 'gold' : 'faint'}>
						{fl === 21 ? '20+' : `${fl}F`}
					</T>
				))}
				<T x={cx0 + cw} y={cy0 + 62} size={24} family="sans" tone="dim" textAnchor="end">
					坠落楼层
				</T>
				<T x={cx0 + 14} y={cy0 - ch - 30} size={24} family="sans" tone="dim" textAnchor="start">
					平均受伤程度（示意）
				</T>
				<polyline points={pts.join(' ')} fill="none" stroke={color.text} strokeWidth={4} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} strokeLinejoin="round" />
				<polyline points={pts.slice(5).join(' ')} fill="none" stroke={color.gold} strokeWidth={6} opacity={prog(f, cue(1) + 40, 20)} filter="url(#glow-gold)" />
				<T x={px(17)} y={py(0.55) - 48} size={34} tone="gold" weight={700} opacity={prog(f, cue(1) + 50, 20)}>
					更轻？
				</T>
				<polyline
					points={[`${px(7)},${py(0.9)}`, `${px(10)},${py(0.97)}`, `${px(14)},${py(1.02)}`, `${px(21)},${py(1.06)}`].join(' ')}
					fill="none"
					stroke={color.red}
					strokeWidth={4}
					strokeDasharray="12 10"
					opacity={alt}
				/>
				<T x={px(21) + 30} y={py(1.06)} size={44} tone="red" weight={900} opacity={alt}>
					?
				</T>
				{[0, 1, 2, 3, 4].map((k) => (
					<g key={k} transform={at(px(9 + k * 2.6), cy0 + 92, 0.55)} opacity={prog(f, cue(3) + 30 + k * 6, 18)}>
						<Cat ink="rgba(255,90,78,0.8)" dashed />
					</g>
				))}
				<T x={px(9) - 70} y={cy0 + 96} size={24} tone="red" textAnchor="end" opacity={prog(f, cue(3) + 30, 18)}>
					没被送来的
				</T>
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- 9. everyday life

const World: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const fade = prog(f, cue(2), 30);
	const panels = [prog(f, cue(0), 24), prog(f, cue(0) + 40, 24), prog(f, cue(1), 24)];
	const dim = 0.28 * (1 - 0.8 * fade);
	const xs = [W * 0.2, W * 0.5, W * 0.8];
	const caps = ['辍学创业', '老房子', '成功学讲台'];
	return (
		<Stage>
			<GlowDefs />
			{xs.map((x, k) => (
				<g key={k} opacity={panels[k]}>
					<rect x={x - 260} y={20} width={520} height={H - 110} rx={18} fill="rgba(20,24,36,0.55)" stroke={color.line} strokeWidth={1.5} />
					<T x={x} y={H - 40} size={32} weight={700} tone="dim" track={0.2}>
						{caps[k]}
					</T>
				</g>
			))}
			<g opacity={panels[0]}>
				{new Array(35).fill(0).map((_, i) => {
					const c = i % 7;
					const r = Math.floor(i / 7);
					const hero = i === 17;
					return (
						<g key={i} transform={at(xs[0] - 195 + c * 65, 120 + r * 98)} opacity={hero ? 1 : dim}>
							{hero ? <circle r={60} fill="url(#spot-gold)" /> : null}
							<Person fill={hero ? color.gold : color.steel} s={1.1} />
						</g>
					);
				})}
			</g>
			<g opacity={panels[1]}>
				{new Array(6).fill(0).map((_, i) => {
					const c = i % 3;
					const r = Math.floor(i / 3);
					const hero = i === 4;
					const x = xs[1] - 150 + c * 150;
					const y = 220 + r * 230;
					return (
						<g key={i} transform={at(x, y, 1, hero ? 0 : (i % 2 ? 9 : -12) * (0.4 + 0.6 * fade))} opacity={hero ? 1 : dim * 1.4}>
							{hero ? <circle r={90} fill="url(#spot-gold)" /> : null}
							<path
								d="M-50,60 L-50,-10 L0,-55 L50,-10 L50,60 Z M-14,60 L-14,22 L14,22 L14,60"
								fill={hero ? 'rgba(241,197,109,0.15)' : 'none'}
								stroke={hero ? color.gold : color.steel}
								strokeWidth={3}
								strokeDasharray={hero ? undefined : '7 7'}
								strokeLinejoin="round"
							/>
						</g>
					);
				})}
			</g>
			<g opacity={panels[2]}>
				<polygon points={`${xs[2] - 40},20 ${xs[2] + 40},20 ${xs[2] + 110},250 ${xs[2] - 110},250`} fill="url(#spot-gold)" opacity={0.6} />
				<rect x={xs[2] - 90} y={250} width={180} height={70} fill="#1a1e2b" stroke={color.goldDeep} strokeWidth={2} />
				<g transform={at(xs[2], 215)}>
					<Person fill={color.gold} s={1.5} />
				</g>
				{new Array(21).fill(0).map((_, i) => {
					const c = i % 7;
					const r = Math.floor(i / 7);
					return (
						<g key={i} transform={at(xs[2] - 195 + c * 65 + (r % 2) * 30, 410 + r * 70)} opacity={dim}>
							<Person fill={color.steel} />
						</g>
					);
				})}
			</g>
			{xs.map((x, k) => (
				<g key={k} transform={at(x + (k === 1 ? 0 : 0), k === 0 ? 30 : k === 1 ? 60 : -10, 0.16)} opacity={fade}>
					<PlaneShape ink={color.gold} />
				</g>
			))}
		</Stage>
	);
};

// ---------------------------------------------------------------- 10. three questions

const Tips: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const {w: W, h: H} = useStage();
	const items = (scene.props.items as string[]) ?? [];
	const ghostHoles = holesIn('tipghost', {engine: 2});
	return (
		<Stage>
			<GlowDefs />
			{items.map((text, i) => {
				const p = 0.35 * prog(f, cue(0) + i * 6, 20) + 0.65 * prog(f, cue(i + 1) - 6, 22);
				const filled = prog(f, cue(i + 1) - 6, 22);
				const active = f >= cue(i + 1) && (i === items.length - 1 || f < cue(i + 2));
				const x = W * (0.2 + i * 0.3);
				const y = H * 0.5 + (1 - p) * 40 - (active ? 10 : 0);
				return (
					<g key={i} opacity={p * (active || f > cue(-1) + 70 ? 1 : 0.55)}>
						<rect x={x - 255} y={y - 230} width={510} height={460} rx={22} fill="rgba(20,24,36,0.82)" stroke={active ? color.goldDeep : color.line} strokeWidth={active ? 2.5 : 1.5} />
						<T x={x} y={y - 150} size={110} family="latin" weight={600} tone="gold" opacity={active ? 1 : 0.7}>
							{`0${i + 1}`}
						</T>
						<g transform={at(x, y + 10)} opacity={filled}>
							{i === 0 ? (
								<g transform="scale(0.4)">
									<PlaneShape ghost ink="rgba(255,90,78,0.9)" weight={2.2} />
									<Holes holes={ghostHoles} p={1} size={2.6} />
								</g>
							) : i === 1 ? (
								<g stroke={color.gold} strokeWidth={3} fill="none">
									<path d="M-80,-50 L80,-50 L18,20 L18,60 L-18,70 L-18,20 Z" strokeLinejoin="round" />
									{[-50, -20, 10, 40].map((dx) => (
										<circle key={dx} cx={dx} cy={-70} r={6} fill={dx === 10 ? color.gold : color.steel} stroke="none" />
									))}
								</g>
							) : (
								<g>
									<T y={-28} size={60} family="latin" weight={600} tone="gold">
										1
									</T>
									<line x1={-60} y1={6} x2={60} y2={6} stroke={color.text} strokeWidth={3} />
									<T y={48} size={60} family="latin" weight={600} tone="dim">
										N
									</T>
								</g>
							)}
						</g>
						<T x={x} y={y + 160} size={40} weight={700} opacity={filled}>
							{text}
						</T>
					</g>
				);
			})}
		</Stage>
	);
};

// ---------------------------------------------------------------- 11. callback + end card

const Callback: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const scene = useScene();
	const cue = useCue();
	const {w: W, h: H} = useStage();
	const ignite = (k: number) => prog(f, cue(1) + 10 + k * 10, 20);
	const end = prog(f, cue(2) - 10, 30);
	const {series} = useTimeline();
	const formation = [
		[0.18, 0.62, 0.3], [0.32, 0.3, 0.36], [0.47, 0.68, 0.28], [0.6, 0.24, 0.4],
		[0.74, 0.58, 0.32], [0.88, 0.3, 0.26], [0.1, 0.22, 0.22], [0.92, 0.75, 0.22],
	];
	return (
		<Stage fadeOut={24}>
			<GlowDefs />
			<g opacity={1 - 0.8 * end}>
				{formation.map(([fx, fy, s], k) => {
					const drift = f * (0.25 + s);
					const g = ignite(k);
					return (
						<g key={k} transform={at(W * fx + drift * 0.6, H * fy - drift, s)} opacity={(0.6 + 0.4 * g) * prog(f, k * 5, 30)}>
							<PlaneShape ghost ink={g > 0 ? `rgba(241,197,109,${0.5 + 0.5 * g})` : 'rgba(243,237,226,0.5)'} engineGlow={g} weight={2.2} />
							<Holes holes={FLEET[[1, 4, 6, 9, 10][k % 5]].holes} p={1} size={1.4} only={['engine']} tone={g > 0 ? 'url(#spot-gold)' : undefined} />
						</g>
					);
				})}
			</g>
			<g opacity={end}>
				<T x={W / 2} y={H * 0.4} size={120} weight={900} tone="gold" filter="url(#glow-gold)" track={0.08}>
					飞回来的飞机
				</T>
				<line x1={W / 2 - 300 * end} y1={H * 0.4 + 92} x2={W / 2 + 300 * end} y2={H * 0.4 + 92} stroke={color.goldDeep} strokeWidth={2} />
				<T x={W / 2} y={H * 0.4 + 150} size={36} family="latinItalic" tone="dim" track={0.2}>
					Survivorship Bias · 1943
				</T>
				<T x={W / 2} y={H * 0.4 + 230} size={30} family="sans" tone="dim" track={0.4} opacity={prog(f, cue(2) + 30, 30)}>
					{`◆ ${series} · 下期见`}
				</T>
			</g>
			<rect x={-200} y={-400} width={W + 400} height={H + 800} fill="#000" opacity={prog(f, scene.duration - 30, 30, ease.in)} />
		</Stage>
	);
};

export const scenes: SceneMap = {Hook, ColdOpen, HoleData, Twist, Mechanism, Reveal, Concept, Cats, World, Tips, Callback};
