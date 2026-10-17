import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Sub} from '../ep27/kit27';
import {JUNO} from '../brand/identity';
import lines from './lines28.json';
import {W, H, FPS, SANS, SERIF, P, PaperDefs, Fly, Human, Ape, Dog, Cat, Chicken, Lizard, Fish, Octopus, Bee, Worm, Jelly, Mushroom, Tag, Lab} from './paper28';

/* ep28 《生命平等吗？》 opening v2, one continuous shot over a paper table.
   Three paper dioramas (roadside cat · Sudan · windowsill fly). Each creature lowers its head, then turns to dust
   and drifts away (the "snap"), leaving its little stage empty. Pull back: the three come back as they were, each with
   a heart showing how much we care. "是我们太冷血了吗？" → all three turn to dust together. Cards → the title slams on
   the 42.47 drop while the cards fly into a ruler, which gets hearts too. */
export const FILM_END = 53.0;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const k = cl(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const r = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lin = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const DROP = 42.47;

/* camera moves [start, end, cx, cy, scale]; holds drift slowly */
const MOVES: [number, number, number, number, number][] = [
	[0, 0, 720, 600, 1.0],
	[5.6, 7.6, 2200, 590, 1.0],
	[17.0, 18.7, 3720, 540, 1.05],
	[22.4, 24.8, 2190, 470, 0.42],
];
const camAt = (t: number) => {
	let [cx, cy, s] = [MOVES[0][2], MOVES[0][3], MOVES[0][4]];
	let since = 0;
	for (const [a, b, x, y, z] of MOVES) {
		if (t >= b) { [cx, cy, s] = [x, y, z]; since = b; }
		else if (t > a) { const k = r(t, a, b); return {cx: mix(cx, x, k), cy: mix(cy, y, k), s: mix(s, z, k)}; }
	}
	return {cx, cy, s: s * (1 + Math.min(t - since, 12) * (s < 0.6 ? 0.002 : 0.004))};
};

/* ---------- the snap: a creature turns to dust, cell by cell, and drifts off on the air ---------- */
const Dust: React.FC<{id: string; box: [number, number, number, number]; cell: number; t: number; t0: number; dur: number; seed?: number; wind?: number; render: (shadow: boolean) => React.ReactNode}> = ({id, box, cell, t, t0, dur, seed = 7, wind = 1, render}) => {
	if (t < t0) return <>{render(true)}</>;
	const [bx, by, bw, bh] = box;
	const R = rng(seed);
	const life = 1.9;
	const dead: React.ReactNode[] = [], parts: React.ReactNode[] = [], clips: React.ReactNode[] = [];
	let alive = 0;
	for (let gy = by; gy < by + bh; gy += cell) for (let gx = bx; gx < bx + bw; gx += cell) {
		const j = R(), sp = R(), ph = R() * 6, up = R();
		const death = t0 + ((gx - bx) / bw) * dur * 0.65 + ((by + bh - gy) / bh) * dur * 0.1 + j * dur * 0.25;
		if (t < death) { alive++; continue; }
		const key = `${gx}_${gy}`;
		dead.push(<rect key={key} x={gx - 0.5} y={gy - 0.5} width={cell + 1} height={cell + 1} fill="black" />);
		const age = t - death;
		if (age > life) continue;
		const a = age / life;
		const dx = wind * (age * (70 + sp * 110) + age * age * 40) + Math.sin(age * 3 + ph) * 12;
		const dy = -age * (50 + up * 90) - age * age * 30;
		const k = mix(1, 0.15, a), cx = gx + cell / 2, cy = gy + cell / 2;
		clips.push(<clipPath key={key} id={`${id}c${key}`}><rect x={gx} y={gy} width={cell} height={cell} /></clipPath>);
		parts.push(
			<g key={key} opacity={(1 - a) * (1 - a)} transform={`translate(${dx} ${dy}) translate(${cx} ${cy}) rotate(${age * (sp - 0.5) * 160}) scale(${k}) translate(${-cx} ${-cy})`}>
				<g clipPath={`url(#${id}c${key})`}><use href={`#${id}src`} /></g>
			</g>,
		);
	}
	return (
		<g>
			<defs>
				<g id={`${id}src`}>{render(false)}</g>
				<mask id={`${id}m`} maskUnits="userSpaceOnUse" x={bx - 200} y={by - 200} width={bw + 400} height={bh + 400}>
					<rect x={bx - 200} y={by - 200} width={bw + 400} height={bh + 400} fill="white" />{dead}
				</mask>
				{clips}
			</defs>
			{alive > 0 && <g mask={`url(#${id}m)`}>{render(true)}</g>}
			{parts}
		</g>
	);
};

/* ---------- hearts: how much we care (fill level 0..1) ---------- */
const HEART = 'M 0 0.35 C -0.62 -0.08 -0.5 -0.62 0 -0.27 C 0.5 -0.62 0.62 -0.08 0 0.35 Z';
const Heart: React.FC<{id: string; x: number; y: number; size: number; level: number; pop: number; o?: number}> = ({id, x, y, size, level, pop, o = 1}) => {
	if (pop <= 0) return null;
	const sc = pop < 0.7 ? mix(0, 1.18, pop / 0.7) : mix(1.18, 1, (pop - 0.7) / 0.3);
	return (
		<g transform={`translate(${x} ${y}) scale(${size * sc})`} opacity={o}>
			<defs><clipPath id={`h${id}`}><rect x={-1} y={0.35 - level * 0.72} width={2} height={1} /></clipPath></defs>
			<path d={HEART} fill={P.cream} opacity={0.28} />
			<path d={HEART} fill={P.red} clipPath={`url(#h${id})`} />
			<path d={HEART} fill="none" stroke={P.cream} strokeWidth={0.045} strokeLinejoin="round" />
		</g>
	);
};

/* ---------- pieces ---------- */
const Pool: React.FC<{x: number; y: number; rx: number; ry: number; k: number}> = ({x, y, rx, ry, k}) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#pool28)" opacity={k} />;
const Motes: React.FC<{x: number; y: number; rx: number; ry: number; t: number; n?: number; seed?: number; o?: number}> = ({x, y, rx, ry, t, n = 22, seed = 3, o = 1}) => {
	const R = rng(seed); const out: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) {
		const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 0.8, sp = 0.2 + R() * 0.5, ph = R() * 6;
		const px = x + Math.cos(a) * d * rx + Math.sin(t * sp + ph) * 14, py = y + Math.sin(a) * d * ry - ((t * 8 * sp + ph * 20) % 60);
		out.push(<circle key={i} cx={px} cy={py} r={1.6 + R() * 2} fill="#fff6dd" opacity={o * (0.25 + R() * 0.4)} />);
	}
	return <g>{out}</g>;
};
const shadow = (x: number, y: number, rx: number, o = 0.3) => <ellipse cx={x} cy={y + 4} rx={rx} ry={rx * 0.12} fill="#2a1a16" opacity={o} />;
const sh = (on: boolean) => (on ? 'url(#cutShadow)' : undefined);

/** the roadside cat, lying; head lowers (head: -1 lifted … 1 resting) */
const CatK: React.FC<{x: number; y: number; s: number; head: number; shadowOn: boolean}> = ({x, y, s, head, shadowOn}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} fill={P.cut} filter={sh(shadowOn)}>
		<path d="M -54 -14 C -84 -10 -92 -2 -76 4" fill="none" stroke={P.cut} strokeWidth={9} strokeLinecap="round" />
		<ellipse cx={0} cy={-20} rx={58} ry={20} />
		<path d="M 30 -6 L 62 2 M 20 -4 L 50 4" stroke={P.cut} strokeWidth={8} strokeLinecap="round" />
		<g transform={`rotate(${head * 13} 44 -26)`}>
			<circle cx={58} cy={-22} r={17} />
			<polygon points="58,-36 62,-54 70,-38" /><polygon points="68,-34 80,-48 78,-28" />
		</g>
	</g>
);
/** Sudan: kneels (down 0..1), lowers his head (headDown 0..1) */
const RhinoK: React.FC<{x: number; y: number; s: number; down: number; headDown: number; breathe: number; shadowOn: boolean}> = ({x, y, s, down, headDown, breathe, shadowOn}) => {
	const lift = 44 * down, leg = 1 - 0.78 * down;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} fill={P.cut} filter={sh(shadowOn)}>
			{[[-86, 30], [-50, 28], [30, 30], [66, 28]].map(([lx, w], i) => <rect key={i} x={lx} y={-58 * leg} width={w} height={58 * leg} rx={8} />)}
			<g transform={`translate(0 ${lift})`}>
				<g transform={`translate(0 ${-84}) scale(1 ${1 + breathe * 0.012}) translate(0 84)`}>
					<ellipse cx={-10} cy={-84} rx={100} ry={56} /><ellipse cx={46} cy={-100} rx={50} ry={44} />
				</g>
				<g transform={`rotate(${headDown * 16} 82 -104)`}>
					<path d="M 70 -128 C 110 -122 140 -100 160 -66 L 176 -42 C 172 -30 150 -30 136 -36 L 100 -50 Z" />
					<polygon points="150,-62 176,-120 166,-56" /><polygon points="124,-82 134,-108 140,-78" />
					<polygon points="86,-122 80,-148 98,-126" />
				</g>
				<path d="M -106 -96 L -118 -60" stroke={P.cut} strokeWidth={5} strokeLinecap="round" />
			</g>
		</g>
	);
};
const Acacia: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} fill={P.cutDim} opacity={0.75}>
		<path d="M -6 0 L -4 -150 L -40 -200 L -34 -204 L 0 -164 L 30 -214 L 38 -210 L 6 -150 L 8 0 Z" />
		<ellipse cx={0} cy={-224} rx={170} ry={30} /><ellipse cx={-70} cy={-212} rx={90} ry={22} /><ellipse cx={80} cy={-210} rx={80} ry={20} />
	</g>
);
const Hand: React.FC<{x: number; y: number; o: number}> = ({x, y, o}) => (
	<g transform={`translate(${x} ${y})`} opacity={o} fill="#1b1218" style={{filter: 'blur(14px)'}}>
		<ellipse cx={0} cy={0} rx={150} ry={120} />
		{[-110, -55, 0, 55].map((dx, i) => <ellipse key={i} cx={dx} cy={-150 - (i === 1 || i === 2 ? 30 : 0)} rx={30} ry={90} />)}
		<ellipse cx={150} cy={-30} rx={30} ry={80} transform="rotate(40 150 -30)" />
	</g>
);

/* ---------- the 52 cards → the ruler ---------- */
const TYPES: [React.FC<any>, number][] = [[Human, 0.4], [Ape, 0.45], [Dog, 0.48], [Cat, 0.5], [Chicken, 0.55], [Lizard, 0.55], [Fish, 0.65], [Octopus, 0.55], [Bee, 0.85], [Fly, 0.9], [Worm, 0.65], [Jelly, 0.6], [Mushroom, 0.6]];
const RULER_S = [1.0, 1.1, 1.1, 1.05, 1.15, 1.0, 1.25, 1.15, 1.6, 1.7, 1.3, 1.25, 1.15];
const RULER_H = [175, 145, 125, 112, 110, 36, 52, 100, 62, 78, 36, 108, 115];
const CARE = [-1, 1, 0.95, 0.9, 0.7, 0.45, 0.4, 0.35, 0.2, 0.08, 0.18, 0.05, 0];     // -1 = us, no heart
const RX0 = 200, RX1 = 1740, RY = 700;
const slotX = (i: number) => RX0 + ((RX1 - RX0) * i) / (TYPES.length - 1);
const CW = 112, CH = 128, COLS = 13;
const cardPos = (i: number) => ({x: 960 + ((i % COLS) - 6) * (CW + 16), y: 200 + Math.floor(i / COLS) * (CH + 20)});
const typeOf = (i: number) => (i * 5 + Math.floor(i / COLS)) % TYPES.length;
const PICK = [15, 31];   // jellyfish (left) and ape (right), lifted for "只能救一个"
const DEAL = 33.3, LIFT = 35.9;

const Cards: React.FC<{t: number}> = ({t}) => {
	const out: React.ReactNode[] = [];
	const lift = r(t, LIFT, LIFT + 0.9);
	const order = [...Array.from({length: 52}, (_, i) => i).filter((i) => !PICK.includes(i)), ...PICK];
	for (const i of order) {
		const ty = typeOf(i), [C, s] = TYPES[ty];
		const appear = r(t, DEAL + i * 0.028, DEAL + 0.35 + i * 0.028);
		if (appear <= 0) continue;
		let {x, y} = cardPos(i), sc = 1, o = appear;
		y -= (1 - appear) * 50;
		const pi = PICK.indexOf(i);
		if (pi >= 0) { x = mix(x, pi ? 1190 : 730, lift); y = mix(y, 330, lift); sc = mix(1, 2.1, lift); }
		else o *= mix(1, 0.3, lift);
		const go = r(t, DROP + (i % COLS) * 0.012, DROP + 0.75 + (i % COLS) * 0.012);
		if (go > 0) { x = mix(x, slotX(ty), go); y = mix(y + CH / 2, RY - 40, go) - CH / 2; sc = mix(sc, 0.35, go); o = mix(pi >= 0 ? 1 : appear * 0.3, 0, lin(go, 0.6, 1)); }
		if (o <= 0.01) continue;
		out.push(
			<g key={i} transform={`translate(${x} ${y}) scale(${sc})`} opacity={o}>
				<g filter="url(#cutShadow)"><rect x={-CW / 2} y={0} width={CW} height={CH} rx={6} fill={P.cream} /></g>
				<C x={0} y={CH - 22} s={s} shadow={false} />
			</g>,
		);
	}
	// the votes: small hearts pile onto the ape card, one lonely heart on the jellyfish
	const votes: React.ReactNode[] = [];
	if (t > 39.1 && t < DROP + 0.4) {
		const fade = 1 - lin(t, DROP, DROP + 0.3);
		const R = rng(21);
		for (let v = 0; v < 14; v++) {
			const vx = 1190 + (R() - 0.5) * 200, vy = 300 + (R() - 0.5) * 170;
			votes.push(<Heart key={v} id={`v${v}`} x={vx} y={vy} size={46} level={1} pop={lin(t, 39.3 + v * 0.16, 39.65 + v * 0.16)} o={fade} />);
		}
		votes.push(<Heart key="j" id="vj" x={730} y={300} size={46} level={1} pop={lin(t, 40.6, 40.95)} o={fade} />);
	}
	return <g>{out}{votes}</g>;
};
const mixHex = (a: string, b: string, k: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const A = p(a), B = p(b);
	return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
const Ruler: React.FC<{t: number}> = ({t}) => {
	const k = r(t, DROP, DROP + 0.4);
	if (k <= 0) return null;
	const lit = 620, dimK = r(t, 43.2, 44.4);
	return (
		<g opacity={k}>
			<g filter="url(#cutShadow)"><rect x={110} y={RY + 6} width={1720} height={64} rx={6} fill={P.cream} /></g>
			{Array.from({length: 69}, (_, i) => <line key={i} x1={130 + i * 24.8} x2={130 + i * 24.8} y1={RY + 8} y2={RY + (i % 5 ? 24 : 40)} stroke={P.ink} strokeWidth={i % 5 ? 2 : 3} opacity={0.6} />)}
			{TYPES.map(([C], i) => {
				const x = slotX(i), land = r(t, DROP + 0.45 + i * 0.05, DROP + 0.8 + i * 0.05);
				const dim = cl((x - lit) / 380);
				return (
					<g key={i}>
						<g opacity={land} transform={`translate(0 ${(1 - land) * -18})`}>{shadow(x, RY, 40 * RULER_S[i] + 10, 0.3 * (1 - dim))}<C x={x} y={RY} s={RULER_S[i]} f={mixHex(P.cut, P.cutDim, dim * dimK)} o={1 - 0.35 * dim * dimK} /></g>
						{CARE[i] >= 0 && <Heart id={`r${i}`} x={x} y={RY - RULER_H[i] - 44} size={mix(40, 74, CARE[i])} level={CARE[i]} pop={lin(t, 45.4 + i * 0.12, 45.75 + i * 0.12)} />}
					</g>
				);
			})}
		</g>
	);
};

const subAt = (t: number) => {
	for (const [s, e, txt] of lines as [number, number, string][]) if (t >= s && t < e) return {txt, o: Math.min(lin(t, s, s + 0.15), 1 - lin(t, e - 0.15, e))};
	return null;
};

/* the three as they were, for the pull-back (with hearts), and their dust */
const SNAP_ALL = 31.75;
const Spirits: React.FC<{t: number}> = ({t}) => {
	const come = (d: number) => r(t, 22.9 + d, 24.0 + d);
	const hp = (d: number) => lin(t, 27.0 + d, 27.4 + d);
	const after = t >= SNAP_ALL;
	const heartO = 1 - lin(t, SNAP_ALL, SNAP_ALL + 0.6);
	const fade = (k: number, node: React.ReactNode) => <g opacity={k} transform={`translate(0 ${(1 - k) * 14})`}>{node}</g>;
	return (
		<g>
			<Dust id="sf" box={[3712, 600, 132, 112]} cell={14} t={t} t0={SNAP_ALL + 0.4} dur={1.0} seed={31} render={(s) => fade(after ? 1 : come(0), <Fly x={3780} y={706} s={2.2} shadow={s} />)} />
			<Dust id="sc" box={[548, 584, 154, 168]} cell={16} t={t} t0={SNAP_ALL + 0.15} dur={1.3} seed={32} render={(s) => fade(after ? 1 : come(0.35), <Cat x={650} y={748} s={1.5} shadow={s} />)} />
			<Dust id="sr" box={[1938, 462, 572, 292]} cell={26} t={t} t0={SNAP_ALL} dur={1.7} seed={33} render={(s) => fade(after ? 1 : come(0.7), <RhinoK x={2170} y={750} s={1.9} down={0} headDown={0} breathe={0} shadowOn={s} />)} />
			<Heart id="tf" x={3780} y={540} size={120} level={0.08} pop={hp(0)} o={heartO} />
			<Heart id="tc" x={640} y={480} size={240} level={0.55} pop={hp(0.25)} o={heartO} />
			<Heart id="tr" x={2210} y={330} size={400} level={1} pop={hp(0.5)} o={heartO} />
		</g>
	);
};

export const Film28: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const cam = camAt(t);
	// a short, damped jolt when the title lands (no flash)
	const j = t >= DROP ? Math.exp(-(t - DROP) * 9) : 0;
	const shakeX = Math.sin((t - DROP) * 70) * 14 * j, shakeY = Math.cos((t - DROP) * 55) * 9 * j;
	const world = `translate(${960 - cam.cx * cam.s} ${540 - cam.cy * cam.s}) scale(${cam.s})`;
	const cardsOn = t >= 32.9;
	const worldO = 1 - r(t, 32.9, 34.0);
	const sudanGrow = r(t, 13.7, 16.5);
	const flyLamp = mix(0.28, 0.42, r(t, 22.4, 24.8));
	const flyIn = r(t, 17.0, 18.3);
	const fx = mix(4320, 3780, flyIn), fy = mix(260, 706, flyIn) - Math.sin(flyIn * Math.PI) * 120;
	const slap = r(t, 19.6, 19.82), unslap = r(t, 20.3, 21.0);
	const flyDead = t >= 19.8;
	const titleIn = lin(t, DROP, DROP + 0.22), titleOut = r(t, 45.0, 45.5);
	const titleK = titleIn * (1 - titleOut);
	const tsc = t < DROP + 0.22 ? mix(1.7, 0.97, ease(titleIn)) : mix(0.97, 1, lin(t, DROP + 0.22, DROP + 0.4));
	const s = subAt(t);
	const solo = t < 22.4;    // the three solo deaths happen before the pull-back
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, ${P.duskTop}, ${P.dusk} 55%, ${P.duskLow})`}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<PaperDefs />
				<defs>
					<radialGradient id="pool28">
						<stop offset="0" stopColor={P.lampHi} stopOpacity="1" /><stop offset="0.45" stopColor={P.lamp} stopOpacity="0.92" />
						<stop offset="0.8" stopColor={P.lampLo} stopOpacity="0.35" /><stop offset="1" stopColor={P.lampLo} stopOpacity="0" />
					</radialGradient>
					<linearGradient id="road" x1="0" x2="1"><stop offset="0" stopColor="#2e2a36" stopOpacity="0" /><stop offset="0.15" stopColor="#2e2a36" /><stop offset="0.85" stopColor="#2e2a36" /><stop offset="1" stopColor="#2e2a36" stopOpacity="0" /></linearGradient>
					<linearGradient id="earth" x1="0" x2="1"><stop offset="0" stopColor="#4a3c3a" stopOpacity="0" /><stop offset="0.18" stopColor="#4a3c3a" stopOpacity="0.8" /><stop offset="0.82" stopColor="#4a3c3a" stopOpacity="0.8" /><stop offset="1" stopColor="#4a3c3a" stopOpacity="0" /></linearGradient>
				</defs>
				<g transform={`translate(${shakeX} ${shakeY})`}>
				<g transform={world} opacity={worldO}>
					{/* A · roadside */}
					<Pool x={mix(760, 680, r(t, 22.4, 24.8))} y={720} rx={mix(600, 400, r(t, 22.4, 24.8))} ry={mix(300, 220, r(t, 22.4, 24.8))} k={mix(1, 0.85, r(t, 22.4, 24.8))} />
					<rect x={-100} y={760} width={1700} height={300} fill="url(#road)" opacity={0.8} />
					<rect x={0} y={748} width={1500} height={16} fill="#8d8378" opacity={0.8} />
					{[0, 1, 2, 3].map((i) => <rect key={i} x={60 + i * 380} y={900} width={190} height={12} fill={P.cream} opacity={0.32} />)}
					<g filter="url(#cutShadow)" fill={P.cut}><rect x={1152} y={150} width={16} height={600} /><path d="M 1160 160 Q 1140 120 1060 128 L 1030 140 L 1060 150 Q 1130 146 1152 170 Z" /></g>
					<path d="M 1040 150 L 760 750 L 1300 750 Z" fill="#fff1cf" opacity={0.07} />
					{[0, 1, 2].map((i) => { const k = lin(t, 0.0 + i * 0.12, 1.6 + i * 0.12); return <rect key={i} x={mix(-700, 1700, k)} y={812 + i * 24} width={620 - i * 140} height={7} rx={3} fill="#ffe2b0" opacity={(0.32 - i * 0.07) * Math.sin(k * Math.PI)} style={{filter: 'blur(3px)'}} />; })}
					{solo && <>
						<g opacity={1 - r(t, 3.6, 5.0)}>{shadow(660, 748, 90, 0.35)}</g>
						<Dust id="dc" box={[500, 652, 300, 106]} cell={10} t={t} t0={3.5} dur={1.6} seed={5} render={(sh2) => <CatK x={650} y={748} s={1.5} head={mix(-1, 1, r(t, 1.3, 2.9))} shadowOn={sh2} />} />
					</>}
					<Motes x={760} y={600} rx={420} ry={200} t={t} seed={5} />

					{/* B · Sudan */}
					<Pool x={2200} y={650} rx={mix(620, 780, sudanGrow)} ry={mix(400, 480, sudanGrow)} k={mix(0.92, 1, sudanGrow)} />
					<rect x={1450} y={748} width={1500} height={250} fill="url(#earth)" />
					<Acacia x={2720} y={750} s={1.1} />
					{solo && <>
						<g opacity={1 - r(t, 14.6, 16.4)}>{shadow(2190, 748, mix(300, 330, r(t, 8.0, 10.2)), 0.35)}</g>
						<Dust id="dr" box={[1930, 440, 600, 320]} cell={16} t={t} t0={14.4} dur={2.2} seed={9} render={(sh2) => <RhinoK x={2170} y={750} s={1.9} down={r(t, 8.2, 10.6)} headDown={r(t, 10.0, 12.2)} breathe={t < 8.2 ? Math.sin(t * 2.4) : 0} shadowOn={sh2} />} />
					</>}
					{[[1760, 760], [1900, 768], [2520, 762], [2620, 770], [2060, 770]].map(([gx, gy], i) => <path key={i} d={`M ${gx - 14} ${gy} L ${gx - 6} ${gy - 26} L ${gx} ${gy - 6} L ${gx + 6} ${gy - 30} L ${gx + 14} ${gy}`} fill={P.cut} opacity={0.8} />)}
					<g opacity={r(t, 5.8, 6.4) * (1 - r(t, 22.4, 23.4))}><Tag x={1700} y={330} size={42}>2018 · 肯尼亚</Tag></g>
					<g opacity={r(t, 11.5, 12.1) * (1 - r(t, 22.4, 23.4))}><Tag x={2700} y={350} size={44} rot={2}>苏丹 · 45岁</Tag></g>
					<Motes x={2200} y={560} rx={560} ry={300} t={t} n={30} seed={11} o={mix(0.8, 1.2, sudanGrow)} />

					{/* C · windowsill */}
					<Pool x={3720} y={700} rx={mix(260, 200, r(t, 20.6, 22))} ry={120} k={flyLamp} />
					<g opacity={0.92}>
						<rect x={3220} y={150} width={1000} height={500} fill="#3c4a66" />
						{[0, 1].map((i) => <rect key={i} x={3220 + (i + 1) * 333 - 7} y={150} width={14} height={500} fill={P.cut} />)}
						<rect x={3220} y={393} width={1000} height={14} fill={P.cut} />
						<rect x={3204} y={134} width={1032} height={516} fill="none" stroke={P.cut} strokeWidth={18} />
					</g>
					{Array.from({length: 16}, (_, i) => <circle key={i} cx={3260 + ((i * 211) % 920)} cy={180 + ((i * 97) % 200)} r={2 + (i % 2)} fill="#fff2d6" opacity={0.55} />)}
					<g filter="url(#cutShadow)"><rect x={3100} y={650} width={1240} height={70} rx={6} fill="#cdb48e" /><rect x={3100} y={718} width={1240} height={22} fill="#9a7856" /></g>
					{solo && t >= 16.8 && (flyDead
						? <Dust id="df" box={[3712, 668, 136, 118]} cell={7} t={t} t0={20.7} dur={1.2} seed={13} render={(sh2) => <g transform="translate(3780 694) rotate(180) translate(0 14)"><Fly x={0} y={0} s={2.2} shadow={sh2} /></g>} />
						: <g transform={`rotate(${Math.sin(t * 40) * (1 - flyIn) * 8} ${fx} ${fy})`}><Fly x={fx} y={fy} s={2.2} /></g>)}
					{t > 19.4 && t < 21.2 && <Hand x={3800} y={mix(-500, 640, slap) - unslap * 900} o={0.6 * (1 - unslap)} />}

					{/* the three, as they were, with their hearts */}
					{!solo && <Spirits t={t} />}
				</g>

				{/* the 52 cards and the ruler (screen space) */}
				{cardsOn && <Pool x={mix(960, 420, r(t, DROP, DROP + 1.1))} y={mix(470, 680, r(t, DROP, DROP + 1.1))} rx={mix(1000, 900, r(t, DROP, DROP + 1.1))} ry={520} k={r(t, 32.9, 33.8)} />}
				{cardsOn && <Ruler t={t} />}
				{cardsOn && <Cards t={t} />}
				{t > 33.2 && t < DROP && <g opacity={r(t, 33.6, 34.1) * (1 - r(t, LIFT, LIFT + 0.4))}><Tag x={960} y={120} size={44} rot={-1}>52种生物 · 3500多人</Tag></g>}
				{t > LIFT && t < 39.4 && <g opacity={r(t, LIFT + 0.6, LIFT + 1.0) * (1 - r(t, 39.0, 39.3))}><text x={960} y={375} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 120}} fill={P.ink}>？</text></g>}
				{t > 47.6 && <g opacity={r(t, 47.9, 48.5)}>
					<Lab x={200} y={850} size={52}>像我们</Lab>
					<Lab x={1700} y={850} size={52} col={P.cream} o={0.9}>不像我们</Lab>
					<path d="M 340 832 L 1520 832" stroke={P.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray="2 18" opacity={0.4} />
				</g>}
				</g>

				<rect width={W} height={H} filter="url(#fiber)" opacity={0.55} style={{mixBlendMode: 'multiply'}} />
				<rect width={W} height={H} filter="url(#grain)" opacity={0.22} style={{mixBlendMode: 'multiply'}} />
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(18,14,24,0.45) 100%)'}} />

			{titleK > 0.001 && (
				<>
					<AbsoluteFill style={{opacity: titleK, background: 'radial-gradient(ellipse 950px 320px at 50% 27%, rgba(30,24,36,0.7), rgba(30,24,36,0) 100%)'}} />
					<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: titleK, transform: `translate(${shakeX * 0.5}px, ${shakeY * 0.5}px) scale(${tsc})`}}>
						<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em', color: JUNO.colors.gold}}>{JUNO.series}</div>
						<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 176, color: P.cream, letterSpacing: '0.06em', marginTop: 10, textShadow: '0 8px 34px rgba(20,12,16,0.7)'}}>生命平等吗？</div>
					</div>
					<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: titleK}}>
						<path d="M 650 456 Q 960 480 1280 448" fill="none" stroke={P.red} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - r(t, DROP + 0.15, DROP + 0.7)} />
					</svg>
				</>
			)}
			{s && <div style={{opacity: s.o}}><Sub t={s.txt} /></div>}
			<div style={{position: 'absolute', top: 40, right: 56, opacity: 0.6, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: P.cream}}>{JUNO.mark}</div>
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM28" component={Film28} durationInFrames={Math.round(FILM_END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
