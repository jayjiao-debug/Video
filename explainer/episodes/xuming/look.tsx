import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Liquid} from '../../src/art/glow/Liquid';
import {AMBER, Ember, Finish, GlowDefs, Label, Motes, Night, Ring, Statement} from '../../src/art/glow/kit';
import {ADENOSINE, CAFFEINE, Molecule} from '../../src/art/glow/molecules';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';

/**
 * 《续命》 v2 art direction: the Amber Night look. No characters: light,
 * liquid, molecules, silhouettes and carved stone. One frame per look; render
 * with COMPOSITION=XumingLook node scripts/stills.mjs xuming <dir> 0 1 2 ...
 */

export const W = 1920;
export const H = 1080;

/** Bottom subtitle in the reference's weight: heavy serif, keyword in amber. */
export const Sub: React.FC<{text: string; o?: number}> = ({text, o = 1}) => <Statement text={text} y={1000} size={40} o={o} />;

// ---------------------------------------------------------------- pieces reused by the episode

/** A ridge line across the frame from 2D noise. */
export const ridge = (seed: string, base: number, amp: number, freq = 1, step = 16) => {
	let d = `M-40,${H + 40} `;
	for (let x = -40; x <= W + 40; x += step) d += `L${x},${base - amp * (0.5 + 0.5 * noise2D(seed, (x / 600) * freq, 0)) - 0.25 * amp * noise2D(seed + 'f', (x / 120) * freq, 0)} `;
	return d + `L${W + 40},${H + 40} Z`;
};

/** Backlit forest: layered canopy silhouettes against a low sun. */
export const Forest: React.FC<{f: number; sun?: number}> = ({f, sun = 1}) => {
	const trees = (seed: string, n: number, y: number, s: number, fill: string, o = 1) => (
		<g fill={fill} opacity={o}>
			{Array.from({length: n}, (_, i) => {
				const x = (i / n) * (W + 200) - 100 + random(`${seed}${i}`) * 80;
				const h = (260 + random(`${seed}h${i}`) * 260) * s;
				const sway = Math.sin(f / 50 + i) * 2;
				return (
					<g key={i} transform={`translate(${x},${y}) rotate(${sway * 0.3})`}>
						<rect x={-5 * s} y={-h} width={10 * s} height={h} />
						{Array.from({length: 6}, (_, k) => (
							<ellipse
								key={k}
								cx={(random(`${seed}cx${i}${k}`) - 0.5) * 140 * s}
								cy={-h + (random(`${seed}cy${i}${k}`) - 0.3) * 80 * s}
								rx={(60 + random(`${seed}rx${i}${k}`) * 70) * s}
								ry={(30 + random(`${seed}ry${i}${k}`) * 30) * s}
							/>
						))}
					</g>
				);
			})}
		</g>
	);
	return (
		<g>
			<defs>
				<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#0d0805" />
					<stop offset="0.55" stopColor="#4a240c" />
					<stop offset="0.75" stopColor="#b8621e" />
					<stop offset="1" stopColor="#2a1408" />
				</linearGradient>
			</defs>
			<rect width={W} height={H} fill="url(#dusk)" />
			<circle cx={1180} cy={760} r={520} fill="url(#ember)" opacity={0.55 * sun} />
			<circle cx={1180} cy={760} r={90} fill="#fff0c8" opacity={0.9 * sun} filter="url(#g-md)" />
			{/* mist bands */}
			{[700, 780].map((y, i) => (
				<rect key={y} x={-200 + ((f * (0.4 + i * 0.3)) % 400)} y={y} width={W + 400} height={70} fill="#e8a050" opacity={0.08} filter="url(#g-lg)" />
			))}
			{trees('fa', 22, 860, 0.7, '#2a160b', 0.85)}
			{trees('fb', 14, 930, 1.0, '#170c06')}
			<path d={ridge('fg', 960, 60, 1.4)} fill="#0b0604" />
		</g>
	);
};

/** A coffee shrub in silhouette, branches with paired leaves and cherries as red embers. */
export const Shrub: React.FC<{f: number; ripe?: number; glow?: number}> = ({f, ripe = 1, glow = 1}) => {
	const branches = [
		[-10, -320, -260, -380],
		[0, -250, 280, -330],
		[-5, -180, -300, -210],
		[5, -120, 260, -140],
		[0, -400, 120, -520],
	];
	return (
		<g>
			<path d="M0,0 C-10,-150 10,-300 0,-460" stroke="#0a0503" strokeWidth={16} fill="none" />
			{branches.map(([x0, y0, x1, y1], i) => {
				const sw = Math.sin(f / 40 + i) * 4;
				return (
					<g key={i}>
						<path d={`M${x0},${y0} Q${(x0 + x1) / 2},${(y0 + y1) / 2 - 30} ${x1},${y1 + sw}`} stroke="#0a0503" strokeWidth={6} fill="none" />
						{Array.from({length: 5}, (_, k) => {
							const u = (k + 1) / 6;
							const x = x0 + (x1 - x0) * u;
							const y = y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 30 + sw * u;
							const dir = x1 > x0 ? 1 : -1;
							return (
								<g key={k} transform={`translate(${x},${y})`}>
									<ellipse cx={dir * 18} cy={-26} rx={38} ry={13} transform={`rotate(${-50 * dir})`} fill="#0a0503" />
									<ellipse cx={dir * 18} cy={22} rx={36} ry={12} transform={`rotate(${40 * dir})`} fill="#0a0503" />
									{k % 2 === 0
										? [0, 1].map((c) => (
												<g key={c}>
													<circle cx={(c - 0.5) * 16} cy={12 + c * 6} r={14} fill="url(#ember-red)" opacity={0.8 * glow * ripe} />
													<circle cx={(c - 0.5) * 16} cy={12 + c * 6} r={6} fill={ripe > 0.5 ? '#ff6a40' : '#8ab04a'} />
												</g>
											))
										: null}
								</g>
							);
						})}
					</g>
				);
			})}
		</g>
	);
};

/** Carved relief on stone: shapes drawn in `children` are raised out of the rock. */
export const Relief: React.FC<{children: React.ReactNode; light?: number}> = ({children, light = 1}) => (
	<g>
		<defs>
			<filter id="relief" x="-10%" y="-10%" width="120%" height="120%">
				<feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="b" />
				<feDiffuseLighting in="b" surfaceScale={7} lightingColor="#f0c890" result="lit">
					<feDistantLight azimuth={225} elevation={40} />
				</feDiffuseLighting>
				<feComposite in="lit" in2="SourceAlpha" operator="in" />
			</filter>
		</defs>
		<rect width={W} height={H} fill="#5a3e28" />
		<rect width={W} height={H} filter="url(#stone)" opacity={0.85} />
		<g filter="url(#relief)" style={{mixBlendMode: 'overlay'}} opacity={light}>
			{children}
		</g>
		<circle cx={760} cy={300} r={900} fill="url(#warm-pool)" opacity={0.55} style={{mixBlendMode: 'screen'}} />
	</g>
);

/** Line-art coffee bean (front view) with the centre cut. */
export const BeanLine: React.FC<{r?: number; color?: string; fill?: string; w?: number}> = ({r = 120, color = AMBER.green, fill = 'none', w = 5}) => (
	<g filter="url(#g-sm)">
		<ellipse rx={r * 0.72} ry={r} fill={fill} stroke={color} strokeWidth={w} />
		<path d={`M${-r * 0.06},${-r * 0.92} C${r * 0.3},${-r * 0.4} ${-r * 0.3},${r * 0.4} ${r * 0.06},${r * 0.92}`} fill="none" stroke={color} strokeWidth={w} />
	</g>
);

/** Phylogeny of a few eudicots: caffeine appears three separate times. */
export const Tree: React.FC<{lit?: number | number[]; draw?: number}> = ({lit = 1, draw = 1}) => {
	const litOf = (name: string) => (Array.isArray(lit) ? (lit[['可可', '茶', '咖啡'].indexOf(name)] ?? 0) : lit);
	// tips: x positions; three caffeine makers in gold
	const tips = [
		{x: -640, name: '可可', en: 'Theobroma', caf: true},
		{x: -440, name: '棉花', en: 'Gossypium'},
		{x: -240, name: '葡萄', en: 'Vitis'},
		{x: -40, name: '茶', en: 'Camellia', caf: true},
		{x: 160, name: '番茄', en: 'Solanum'},
		{x: 360, name: '咖啡', en: 'Coffea', caf: true},
		{x: 560, name: '向日葵', en: 'Helianthus'},
	];
	const node = (a: number, b: number, y: number) => `M${a},${y} L${b},${y}`;
	return (
		<g strokeLinecap="round" fill="none">
			<g stroke={AMBER.dim} strokeWidth={3} opacity={0.8 * draw}>
				<path d="M-40,380 L-40,300" />
				<path d={node(-540, 360, 300)} />
				<path d="M-540,300 L-540,180 M360,300 L360,230" />
				<path d={node(-640, -340, 180)} />
				<path d="M-340,180 L-340,120" />
				<path d={node(-440, -240, 120)} />
				<path d={node(60, 560, 230)} />
				<path d="M60,230 L60,150" />
				<path d={node(-40, 160, 150)} />
				{tips.map((t) => {
					const y0 = t.x === -640 ? 180 : t.x === -440 || t.x === -240 ? 120 : t.x === -40 || t.x === 160 ? 150 : 230;
					return <path key={t.x} d={`M${t.x},${y0} L${t.x},0`} />;
				})}
			</g>
			{tips.map((t) => {
				const lit = litOf(t.name);
				return (
					<g key={t.name} transform={`translate(${t.x},0)`} opacity={Math.min(1, draw * 1.5)}>
					{t.caf ? <Ember x={0} y={-6} r={60 * lit} o={lit} /> : null}
					<circle r={9} fill={t.caf ? AMBER.gold : AMBER.dim} opacity={t.caf ? 0.4 + 0.6 * lit : 0.6} />
					<text y={-46} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 34, fill: t.caf ? AMBER.gold : AMBER.dim}} opacity={t.caf ? 0.5 + 0.5 * lit : 0.7}>
						{t.name}
					</text>
					<text y={-88} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 22, fill: AMBER.dim}}>
						{t.en}
					</text>
					</g>
				);
			})}
		</g>
	);
};

// ---------------------------------------------------------------- the look sheet

const Frame: React.FC<{i: number; f: number}> = ({i, f}) => {
	if (i === 0)
		// hook: liquid coffee light, statement at left
		return (
			<>
				<rect width={W} height={H} fill="url(#left-scrim)" />
				<Motes f={f} n={70} seed="h" ring o={0.8} />
				<Statement text="每天早上，" x={190} y={430} anchor="start" size={46} o={0.85} />
				<Statement text="有[二十多亿]杯咖啡被同时端起。" x={190} y={520} anchor="start" size={76} />
			</>
		);
	if (i === 1)
		// adenosine piling into receptors on a neuron
		return (
			<>
				<Night cool x={960} y={820} r={900} />
				<path d="M-40,820 C400,760 900,860 1960,780" stroke={AMBER.cyan} strokeWidth={3} fill="none" opacity={0.6} filter="url(#g-sm)" />
				<path d="M-40,840 C400,780 900,880 1960,800 L1960,1120 L-40,1120 Z" fill="#0b1c22" opacity={0.7} />
				{[280, 620, 960, 1300, 1640].map((x, k) => (
					<g key={x}>
						<Ring x={x} y={812 - 10 * Math.sin(k)} r={46} color={AMBER.cyan} dash="10 9" w={3} fill={0.05} />
						{k < 3 ? <Ember x={x} y={812 - 10 * Math.sin(k)} r={30} /> : null}
					</g>
				))}
				{Array.from({length: 60}, (_, k) => (
					<circle key={k} cx={random(`ad${k}`) * W} cy={160 + random(`ady${k}`) * 560} r={4 + random(`adr${k}`) * 4} fill={AMBER.amber} opacity={0.35 + 0.5 * random(`ado${k}`)} filter="url(#g-sm)" />
				))}
				<Label en="Adenosine · A1 receptor" zh="腺苷与受体 · 神经元突触示意" />
				<Sub text="你醒着的每一分钟，大脑都在积攒一种分子：[腺苷]。" />
			</>
		);
	if (i === 2)
		// the key and the lock: same purine core
		return (
			<>
				<Night x={960} y={500} r={800} />
				<g transform="translate(600,430) scale(1.3)">
					<Molecule mol={ADENOSINE} color={AMBER.cream} coreColor={AMBER.cyan} coreGlow={1} w={3.5} />
				</g>
				<g transform="translate(1400,500) scale(1.3)">
					<Molecule mol={CAFFEINE} color={AMBER.gold} coreColor={AMBER.cyan} coreGlow={1} w={3.5} />
				</g>
				<text x={540} y={880} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 40, fill: AMBER.cream}}>
					腺苷
				</text>
				<text x={1360} y={880} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 40, fill: AMBER.gold}}>
					咖啡因
				</text>
				<Label en="Purine core" zh="同一个嘌呤骨架 · 青色部分" />
				<Sub text="咖啡因的骨架，和它[几乎一模一样]。" />
			</>
		);
	if (i === 3)
		// Ethiopia, the cradle
		return (
			<>
				<Forest f={f} />
				<g transform="translate(560,1080) scale(1.25)">
					<Shrub f={f} />
				</g>
				<Motes f={f} n={50} seed="fo" o={0.7} />
				<Label en="Coffea arabica · SW Ethiopia" zh="埃塞俄比亚西南高地森林 · 约 60 万年前" />
				<Sub text="六十万年前，埃塞俄比亚的森林里，[阿拉比卡]诞生了。" />
			</>
		);
	if (i === 4)
		// three independent inventions
		return (
			<>
				<Night x={960} y={600} r={900} />
				<g transform="translate(1000,420)">
					<Tree />
				</g>
				<Label en="Convergent evolution" zh="趋同演化 · Denoeud et al., Science 2014" />
				<Sub text="茶、可可、咖啡，相隔万里，[各自]发明了同一种分子。" />
			</>
		);
	if (i === 5)
		// roasting: the first crack
		return (
			<>
				<Night x={960} y={540} r={760} />
				{/* temperature arc */}
				<g transform="translate(960,620) scale(0.9)">
					{Array.from({length: 41}, (_, k) => {
						const a = (-210 + (k / 40) * 240) * (Math.PI / 180);
						const big = k % 5 === 0;
						const c = ['#8ab04a', '#c9b45a', '#c88a3a', '#9a5a26', '#5a3418'][Math.min(4, Math.floor(k / 9))];
						return <line key={k} x1={Math.cos(a) * 380} y1={Math.sin(a) * 380} x2={Math.cos(a) * (big ? 340 : 356)} y2={Math.sin(a) * (big ? 340 : 356)} stroke={c} strokeWidth={big ? 4 : 2} />;
					})}
					{[150, 170, 190, 210, 230].map((tc, k) => {
						const a = (-210 + ((tc - 150) / 80) * 240) * (Math.PI / 180);
						return (
							<text key={tc} x={Math.cos(a) * 300} y={Math.sin(a) * 300 + 8} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 26, fill: AMBER.dim}}>
								{tc}°
							</text>
						);
					})}
					{(() => {
						const a = (-210 + ((196 - 150) / 80) * 240) * (Math.PI / 180);
						return (
							<g>
								<line x1={0} y1={0} x2={Math.cos(a) * 330} y2={Math.sin(a) * 330} stroke={AMBER.gold} strokeWidth={4} filter="url(#g-sm)" />
								<Ember x={Math.cos(a) * 380} y={Math.sin(a) * 380} r={70} />
							</g>
						);
					})()}
					<g transform="translate(0,20)">
						<BeanLine r={130} color={AMBER.amber} fill="#2a1408" />
						{Array.from({length: 14}, (_, k) => {
							const a = (k / 14) * Math.PI * 2;
							return <line key={k} x1={Math.cos(a) * 170} y1={Math.sin(a) * 200} x2={Math.cos(a) * 215} y2={Math.sin(a) * 250} stroke={AMBER.gold} strokeWidth={4} strokeLinecap="round" />;
						})}
					</g>
				</g>
				<text x={1500} y={560} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 64, fill: AMBER.gold}} filter="url(#g-sm)">
					一爆
				</text>
				<text x={1500} y={620} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 40, fill: AMBER.cream}} opacity={0.8}>
					≈ 196 °C
				</text>
				<Label en="First crack" zh="烘焙 · 一爆" />
				<Sub text="加热到两百度左右，豆子里的水汽撑破细胞——[啪]。" />
			</>
		);
	if (i === 6)
		// Yemen, 15th century, carved in stone
		return (
			<>
				<Relief>
					{/* a dallah pot and three small cups, a crescent, a lamp */}
					<g transform="translate(960,560)" fill="#000">
						<path d="M-60,160 L60,160 L80,40 C80,-20 40,-50 30,-80 L-30,-80 C-40,-50 -80,-20 -80,40 Z" />
						<path d="M70,30 C150,0 170,-70 210,-110 L222,-98 C190,-60 170,10 86,70 Z" />
						<path d="M-28,-80 L28,-80 L18,-130 L0,-150 L-18,-130 Z" />
						<path d="M-80,10 C-140,10 -140,100 -74,110" stroke="#000" strokeWidth={14} fill="none" />
						{[-360, -260, 260].map((x) => (
							<path key={x} d={`M${x - 36},120 L${x + 36},120 L${x + 26},170 L${x - 26},170 Z`} />
						))}
						<path d="M-520,-260 A90,90 0 1,0 -430,-150 A70,70 0 1,1 -520,-260 Z" />
						<rect x={-760} y={210} width={1520} height={22} />
						<rect x={-760} y={-330} width={1520} height={16} />
					</g>
				</Relief>
				<rect y={900} width={W} height={180} fill="#000" opacity={0.5} filter="url(#g-lg)" />
				<rect x={120} y={96} width={470} height={80} rx={10} fill="#140d08" opacity={0.55} />
				<Label en="Yemen · Sufi lodges" zh="也门 · 苏菲派修道所 · 15 世纪" />
				<Sub text="十五世纪，也门的修士用它，[熬过整夜]的祈祷。" />
			</>
		);
	// 7: the cup, top down, stirred
	return (
		<>
			<Night x={960} y={540} r={700} />
			<circle cx={960} cy={540} r={430} fill="#e9dcc4" opacity={0.08} />
			<circle cx={960} cy={540} r={430} fill="none" stroke={AMBER.cream} strokeWidth={3} opacity={0.35} />
			<circle cx={960} cy={540} r={392} fill="none" stroke={AMBER.cream} strokeWidth={2} opacity={0.25} />
			<Motes f={f} n={30} seed="cu" o={0.5} />
			<Label en="Good morning" zh="早安" />
			<Sub text="替你挡住的，[一点疲惫]。" />
		</>
	);
};

export const LOOKS = 8;

export const XumingLook: React.FC = () => {
	loadEpisodeFonts('xuming');
	const i = useCurrentFrame();
	const f = 120;
	return (
		<AbsoluteFill style={{background: AMBER.ink}}>
			{i === 0 ? <Liquid t={14} light={[0.72, 0.32, 0.55]} gain={1.15} /> : null}
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<GlowDefs />
				<defs>
					<linearGradient id="left-scrim" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#000" stopOpacity="0.7" />
						<stop offset="0.6" stopColor="#000" stopOpacity="0" />
					</linearGradient>
					<radialGradient id="ember-red" cx="50%" cy="50%" r="50%">
						<stop offset="0" stopColor="#ffb08a" />
						<stop offset="0.35" stopColor="#d5452e" />
						<stop offset="1" stopColor="#d5452e" stopOpacity="0" />
					</radialGradient>
				</defs>
				<Frame i={i} f={f} />
			</svg>
			{i === 7 ? (
				<div style={{position: 'absolute', left: 960 - 392, top: 540 - 392, width: 784, height: 784, borderRadius: '50%', overflow: 'hidden'}}>
					<Liquid t={6} width={784} height={784} res={0.6} swirl={4} scale={2.6} light={[0.4, 0.35, 0.6]} gain={1.1} />
				</div>
			) : null}
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<GlowDefs />
				<text x={1770} y={64} textAnchor="end" style={{fontFamily: font.sans, fontSize: 20, fill: AMBER.cream, letterSpacing: '0.1em'}} opacity={0.55}>
					◆ Juno · VIBE知识大赏
				</text>
				<Finish />
			</svg>
		</AbsoluteFill>
	);
};
