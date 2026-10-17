import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Sub} from '../ep27/kit27';
import {JUNO} from '../brand/identity';
import {W, H, SANS, SERIF, Fly, Human, Dog, Cat, Chicken, Fish, Bee, Lab} from './paper28';

/* look B "木棍纸偶" (owner's reference): kraft-card puppets with an ink outline and a visible card edge, each on a
   wooden stick, in front of a warm, out-of-focus world (bokeh). Hearts = how much we care. */
const K = {kraft: '#dcc6a0', kraftDk: '#9c7b55', ink: '#3a2a20', stick: '#c9ab7e', stickDk: '#8e7150', red: '#d0473a', redDk: '#8f2a22', cream: '#f6ead2'};
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

const Defs: React.FC = () => (
	<defs>
		<filter id="puppet" x="-30%" y="-30%" width="160%" height="170%">
			<feMorphology in="SourceAlpha" operator="dilate" radius="4.6" result="d" />
			<feFlood floodColor={K.ink} /><feComposite in2="d" operator="in" result="outline" />
			<feOffset in="d" dx="3" dy="5" result="d2" />
			<feFlood floodColor={K.kraftDk} /><feComposite in2="d2" operator="in" result="edge" />
			<feGaussianBlur in="d" stdDeviation="9" result="b" /><feOffset in="b" dx="14" dy="18" result="bo" />
			<feFlood floodColor="#140b07" floodOpacity="0.55" /><feComposite in2="bo" operator="in" result="shadow" />
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
			<feColorMatrix in="n" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.22 0" result="n2" />
			<feComposite in="n2" in2="SourceAlpha" operator="in" result="grain" />
			<feMerge><feMergeNode in="shadow" /><feMergeNode in="edge" /><feMergeNode in="outline" /><feMergeNode in="SourceGraphic" /><feMergeNode in="grain" /></feMerge>
		</filter>
		<filter id="bk1" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10" /></filter>
		<filter id="bk2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="26" /></filter>
		<filter id="bk3" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="60" /></filter>
		<filter id="soft2" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="6" dy="8" stdDeviation="5" floodColor="#140b07" floodOpacity="0.5" /></filter>
	</defs>
);

/** warm out-of-focus world: base glow + bokeh discs; tone = 'amber' | 'sunset' | 'street' */
const Bokeh: React.FC<{tone?: 'amber' | 'sunset' | 'street'; seed?: number; n?: number}> = ({tone = 'amber', seed = 4, n = 46}) => {
	const R = rng(seed);
	const base = tone === 'sunset'
		? 'radial-gradient(ellipse 70% 55% at 72% 38%, #e8b07a 0%, #b8704e 30%, #5a3a33 62%, #261a17 100%)'
		: tone === 'street'
			? 'radial-gradient(ellipse 60% 50% at 62% 30%, #a98a66 0%, #5d4637 40%, #2b201c 75%, #1c1513 100%)'
			: 'radial-gradient(ellipse 75% 60% at 50% 40%, #7a5f4a 0%, #4e3a30 45%, #261c18 100%)';
	const discs: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) {
		const x = R() * W, y = R() * H * 0.8, rr = 24 + R() * 80, o = 0.05 + R() * 0.16, f = R() < 0.5 ? 'bk1' : 'bk2';
		discs.push(<circle key={i} cx={x} cy={y} r={rr} fill={tone === 'street' && R() < 0.3 ? '#ffd9a0' : '#f3d6a8'} opacity={o} filter={`url(#${f})`} />);
	}
	return (
		<>
			<AbsoluteFill style={{background: base}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				{tone === 'sunset' && <g filter="url(#bk3)"><circle cx={1380} cy={330} r={110} fill="#fff1c8" opacity={0.85} /><rect x={-100} y={560} width={2100} height={90} fill="#3a2621" opacity={0.7} /><ellipse cx={360} cy={600} rx={420} ry={60} fill="#2c1d19" opacity={0.8} /><ellipse cx={1600} cy={610} rx={380} ry={50} fill="#2c1d19" opacity={0.7} /></g>}
				{tone === 'street' && <g filter="url(#bk2)"><rect x={1260} y={60} width={24} height={700} fill="#22170f" opacity={0.6} /><circle cx={1210} cy={110} r={70} fill="#ffe6b8" opacity={0.8} /><rect x={0} y={760} width={W} height={320} fill="#1d1612" opacity={0.6} /></g>}
				{discs}
				<rect x={0} y={H * 0.72} width={W} height={H * 0.28} fill="#160f0c" opacity={0.35} filter="url(#bk2)" />
			</svg>
		</>
	);
};

/** a stick puppet: creature cut from kraft card + ink outline + card edge, on a wooden stick; y = where the figure's feet are */
const Puppet: React.FC<{C: React.FC<any>; x: number; y: number; s: number; stick?: number; children?: React.ReactNode; flip?: boolean; tilt?: number}> = ({C, x, y, s, stick = 260, children, flip, tilt = 0}) => (
	<g transform={`rotate(${tilt} ${x} ${y + stick})`}>
		<g filter="url(#soft2)"><rect x={x - 6} y={y - 30} width={12} height={stick + 30} rx={4} fill={K.stick} /><rect x={x + 1} y={y - 30} width={4} height={stick + 30} fill={K.stickDk} opacity={0.5} /></g>
		<g filter="url(#puppet)"><C x={x} y={y} s={s} f={K.kraft} shadow={false} flip={flip} /></g>
		<g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill="none" stroke={K.ink} strokeWidth={2.6 / s} strokeLinecap="round" strokeLinejoin="round">{children}</g>
	</g>
);

/* the rhino and the lying cat, drawn for the card look (body + head as one silhouette) */
const RhinoCard: React.FC<any> = ({x, y, s, f}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} fill={f}>
		<ellipse cx={-10} cy={-84} rx={100} ry={56} /><ellipse cx={46} cy={-100} rx={50} ry={44} />
		<path d="M 70 -128 C 110 -122 140 -100 160 -66 L 176 -42 C 172 -30 150 -30 136 -36 L 100 -50 Z" />
		<polygon points="150,-62 176,-120 166,-56" /><polygon points="124,-82 134,-108 140,-78" /><polygon points="86,-122 80,-148 98,-126" />
		<rect x={-86} y={-58} width={30} height={58} rx={8} /><rect x={-50} y={-58} width={28} height={56} rx={8} />
		<rect x={30} y={-58} width={30} height={58} rx={8} /><rect x={66} y={-60} width={28} height={56} rx={8} />
	</g>
);
const RhinoLines = () => <><path d="M 112 -92 q 8 5 16 0" /><path d="M 90 -118 l 4 10" /><path d="M -40 -40 q 10 6 22 0" opacity={0.6} /><path d="M 40 -40 q 10 6 22 0" opacity={0.6} /><path d="M 150 -46 q 6 4 12 2" /></>;
const CatLyingCard: React.FC<any> = ({x, y, s, f}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} fill={f}>
		<ellipse cx={0} cy={-20} rx={58} ry={20} /><circle cx={58} cy={-22} r={17} />
		<polygon points="50,-34 54,-54 64,-38" /><polygon points="64,-36 78,-50 74,-28" />
		<path d="M -54 -16 C -84 -12 -92 -2 -76 4 L -70 0 C -80 -6 -74 -8 -54 -8 Z" />
	</g>
);
const CatLyingLines = () => <><path d="M 52 -24 q 4 3 8 0" /><path d="M 64 -22 q 3 2 6 0" /><path d="M 20 -6 q 8 4 16 0" opacity={0.6} /></>;
const CatLines = () => <><path d="M 3 -78 q 4 3 8 0" /><path d="M 14 -78 q 4 3 8 0" /><path d="M 11 -70 l 0 3" /><path d="M -10 -20 q 8 6 16 0" opacity={0.6} /></>;
const FlyLines = () => <><ellipse cx={-6} cy={-30} rx={20} ry={8} transform="rotate(-28 -6 -30)" /><path d="M 14 -18 q 2 2 4 0" /></>;
const BeeLines = () => <><path d="M -8 -32 l 0 20 M 1 -32 l 0 20" /><path d="M 22 -26 q 2 2 4 0" /></>;
const HumanLines = ({f}: {f?: boolean}) => <><path d="M -7 -160 q 3 2 6 0 M 2 -160 q 3 2 6 0" /><path d="M -4 -150 q 4 3 8 0" />{f && <path d="M -16 -168 q 16 -18 32 0" />}</>;
const DogLines = () => <><path d="M 52 -82 q 3 2 6 0" /><path d="M -30 -42 q 8 5 16 0" opacity={0.6} /></>;
const ChickenLines = () => <><path d="M 26 -78 q 3 2 6 0" /><path d="M -10 -44 q 12 8 26 0" /></>;
const FishLines = () => <><path d="M 10 -30 q -6 10 0 20" /><path d="M -8 -24 q 8 4 16 0" opacity={0.6} /></>;
const Flower: React.FC<any> = ({x, y, s, f}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} fill={f}>
		<rect x={-4} y={-60} width={8} height={60} />
		{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-96} rx={14} ry={24} transform={`rotate(${a} 0 -80)`} />)}
		<circle cx={0} cy={-80} r={14} />
	</g>
);
const FlowerLines = () => <><circle cx={0} cy={-80} r={8} />{[0, 72, 144, 216, 288].map((a) => <path key={a} d="M 0 -94 l 0 -14" transform={`rotate(${a} 0 -80)`} />)}</>;

/** the heart: red fill rising to `level`, ink outline, a small highlight */
const HEART = 'M 0 0.35 C -0.62 -0.08 -0.5 -0.62 0 -0.27 C 0.5 -0.62 0.62 -0.08 0 0.35 Z';
const Heart: React.FC<{id: string; x: number; y: number; size: number; level: number}> = ({id, x, y, size, level}) => (
	<g transform={`translate(${x} ${y}) scale(${size})`} filter="url(#soft2)">
		<defs><clipPath id={`ph${id}`}><rect x={-1} y={0.35 - level * 0.72} width={2} height={1} /></clipPath></defs>
		<path d={HEART} fill={K.cream} />
		<path d={HEART} fill={K.red} clipPath={`url(#ph${id})`} />
		{level > 0.05 && level < 0.95 && <path d={`M -0.6 ${0.35 - level * 0.72} L 0.6 ${0.35 - level * 0.72}`} stroke={K.redDk} strokeWidth={0.025} clipPath={`url(#ph${id})`} />}
		<path d={HEART} fill="none" stroke={K.ink} strokeWidth={0.05} strokeLinejoin="round" />
		{level > 0.5 && <ellipse cx={-0.2} cy={-0.3} rx={0.08} ry={0.05} fill="#fff" opacity={0.55} transform="rotate(-30 -0.2 -0.3)" />}
	</g>
);
const Mark = () => <div style={{position: 'absolute', top: 40, right: 56, opacity: 0.6, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: K.cream}}>{JUNO.mark}</div>;
const Over: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Defs />{children}</svg>;

/* a dust snap frozen mid-way: cells to the right of `front` are gone and drift off as small card flecks */
const DustFrozen: React.FC<{box: [number, number, number, number]; front: number; cell: number; render: () => React.ReactNode; id: string}> = ({box, front, cell, render, id}) => {
	const [bx, by, bw, bh] = box; const R = rng(5);
	const dead: React.ReactNode[] = [], parts: React.ReactNode[] = [], clips: React.ReactNode[] = [];
	for (let gy = by; gy < by + bh; gy += cell) for (let gx = bx; gx < bx + bw; gx += cell) {
		const edge = front + (R() - 0.5) * 140;
		if (gx < edge) continue;
		const age = Math.min(1.8, (gx - edge) / 220 + R() * 0.3), key = `${gx}_${gy}`;
		dead.push(<rect key={key} x={gx - 0.5} y={gy - 0.5} width={cell + 1} height={cell + 1} fill="black" />);
		const a = age / 1.8; if (a >= 1) continue;
		const dx = age * 160 + age * age * 60, dy = -age * 120 - R() * 60 * age, cx = gx + cell / 2, cy = gy + cell / 2;
		clips.push(<clipPath key={key} id={`${id}${key}`}><rect x={gx} y={gy} width={cell} height={cell} /></clipPath>);
		parts.push(<g key={key} opacity={(1 - a) ** 1.5} transform={`translate(${dx} ${dy}) translate(${cx} ${cy}) rotate(${(R() - 0.5) * 200 * a}) scale(${1 - 0.8 * a}) translate(${-cx} ${-cy})`}><g clipPath={`url(#${id}${key})`}><use href={`#${id}src`} /></g></g>);
	}
	return (
		<g>
			<defs><g id={`${id}src`}>{render()}</g><mask id={`${id}m`} maskUnits="userSpaceOnUse" x={bx - 300} y={by - 300} width={bw + 600} height={bh + 600}><rect x={bx - 300} y={by - 300} width={bw + 600} height={bh + 600} fill="white" />{dead}</mask>{clips}</defs>
			<g mask={`url(#${id}m)`}>{render()}</g>{parts}
		</g>
	);
};

const P0: React.FC = () => (
	<AbsoluteFill><Bokeh tone="street" seed={8} />
		<Over><Puppet C={CatLyingCard} x={900} y={640} s={2.6} stick={400}><CatLyingLines /></Puppet></Over>
		<Sub t="路边，一只猫被车撞了" /><Mark /></AbsoluteFill>
);
const P1: React.FC = () => (
	<AbsoluteFill><Bokeh tone="sunset" seed={2} />
		<Over>
			<Puppet C={RhinoCard} x={860} y={600} s={2.2} stick={380} tilt={-1}><RhinoLines /></Puppet>
			<g filter="url(#soft2)"><rect x={1280} y={210} width={330} height={78} fill={K.cream} transform="rotate(2 1445 249)" /><text x={1445} y={264} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 800, fontSize: 44}} fill={K.ink} transform="rotate(2 1445 249)">苏丹 · 45岁</text></g>
		</Over>
		<Sub t="最后一只雄性北方白犀牛死了" /><Mark /></AbsoluteFill>
);
const Trio: React.FC = () => (
	<Over>
		<Puppet C={Fly} x={430} y={640} s={2.6} stick={300}><FlyLines /></Puppet>
		<Puppet C={Cat} x={900} y={640} s={2.0} stick={300}><CatLines /></Puppet>
		<Puppet C={RhinoCard} x={1430} y={640} s={1.45} stick={300}><RhinoLines /></Puppet>
		<Heart id="a" x={430} y={490} size={70} level={0.06} />
		<Heart id="b" x={900} y={370} size={130} level={0.5} />
		<Heart id="c" x={1450} y={330} size={210} level={1} />
	</Over>
);
const P2: React.FC = () => (<AbsoluteFill><Bokeh seed={4} /><Trio /><Sub t="为什么心疼的程度，差这么多？" /><Mark /></AbsoluteFill>);
const P3: React.FC = () => (
	<AbsoluteFill><Bokeh seed={11} n={60} />
		<Over>{LINE.map(([C, s, , lines], i) => <Puppet key={i} C={C} x={200 + i * 255} y={800} s={s} stick={200}>{lines}</Puppet>)}</Over>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 950px 300px at 50% 30%, rgba(24,16,12,0.72), rgba(24,16,12,0) 100%)'}} />
		<div style={{position: 'absolute', top: 140, width: '100%', textAlign: 'center'}}>
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em', color: JUNO.colors.gold}}>{JUNO.series}</div>
			<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 176, color: K.cream, letterSpacing: '0.06em', marginTop: 6, textShadow: '0 8px 34px rgba(20,12,8,0.8)'}}>生命平等吗？</div>
		</div>
		<Mark /></AbsoluteFill>
);
const LINE: [React.FC<any>, number, number, React.ReactNode, number][] = [
	[Human, 1.15, -1, <HumanLines key="h" />, 0], [Human, 1.0, -1, <HumanLines key="w" f />, 0], [Dog, 1.3, 0.95, <DogLines key="d" />, 0],
	[Chicken, 1.3, 0.75, <ChickenLines key="c" />, 0], [Fish, 1.5, 0.35, <FishLines key="f" />, 0], [Bee, 1.9, 0.12, <BeeLines key="b" />, 0], [Flower, 1.2, 0, <FlowerLines key="fl" />, 0],
];
const P4: React.FC = () => (
	<AbsoluteFill><Bokeh seed={11} n={60} />
		<Over>
			{LINE.map(([C, s, care, lines], i) => {
				const x = 200 + i * 255, y = 680;
				const top = [205, 180, 130, 125, 70, 95, 140][i];
				return <g key={i}><Puppet C={C} x={x} y={y} s={s * 1.25} stick={260}>{lines}</Puppet>{care > 0.02 && <Heart id={`l${i}`} x={x} y={y - top * 1.25 - 50} size={mix(50, 84, care)} level={care} />}</g>;
			})}
			<g filter="url(#soft2)"><rect x={1348} y={300} width={8} height={660} rx={3} fill={K.stick} /></g>
			<Lab x={1352} y={270} size={44} col={K.cream}>线画在哪？</Lab>
		</Over>
		<Sub t="和人类越近，越被同情" /><Mark /></AbsoluteFill>
);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const P5: React.FC = () => (
	<AbsoluteFill><Bokeh tone="sunset" seed={2} />
		<Over><DustFrozen id="dz" box={[580, 250, 900, 400]} front={1000} cell={20} render={() => <Puppet C={RhinoCard} x={860} y={600} s={2.2} stick={380} tilt={-1}><RhinoLines /></Puppet>} /></Over>
		<Sub t="全世界都为它难过" /><Mark /></AbsoluteFill>
);

const KEYS = [P0, P1, P5, P2, P3, P4];
const Keys: React.FC<{k: number}> = ({k}) => { const C = KEYS[k] ?? P0; return <C />; };
const Root: React.FC = () => <Composition id="PUPPET28" component={Keys} durationInFrames={1} fps={30} width={W} height={H} defaultProps={{k: 0}} />;
registerRoot(Root);
