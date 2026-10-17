import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Sub} from '../ep27/kit27';
import {JUNO} from '../brand/identity';
import lines from './lines28.json';
import {W, H, FPS, SANS, SERIF, P, PaperDefs, CatLying, Fly, Human, Ape, Dog, Cat, Chicken, Lizard, Fish, Octopus, Bee, Worm, Jelly, Mushroom, Tag, Lab} from './paper28';

/* ep28 《生命平等吗？》 opening, one continuous shot over a paper table.
   World: three paper dioramas side by side (roadside cat · Sudan · windowsill fly), each under its own lamp.
   Camera visits them in order (always moving right), then pulls back to show all three lights at once. */
export const FILM_END = 48.0;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const k = cl(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const r = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lin = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

/* camera: [start, end, cx, cy, scale] moves; holds drift slowly */
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
	const drift = 1 + Math.min(t - since, 12) * (s < 0.6 ? 0.002 : 0.004);      // slow push-in while holding
	return {cx, cy, s: s * drift};
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

/** Sudan: the rhino, able to kneel (down 0..1) */
const RhinoK: React.FC<{x: number; y: number; s: number; down: number; breathe: number}> = ({x, y, s, down, breathe}) => {
	const lift = 44 * down, leg = 1 - 0.78 * down;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} fill={P.cut} filter="url(#cutShadow)">
			{[[-86, 30], [-50, 28], [30, 30], [66, 28]].map(([lx, w], i) => <rect key={i} x={lx} y={-58 * leg} width={w} height={58 * leg} rx={8} />)}
			<g transform={`translate(0 ${lift}) rotate(${down * 4} 140 -40)`}>
				<g transform={`translate(0 ${-84}) scale(1 ${1 + breathe * 0.012}) translate(0 84)`}>
					<ellipse cx={-10} cy={-84} rx={100} ry={56} /><ellipse cx={46} cy={-100} rx={50} ry={44} />
				</g>
				<path d="M 70 -128 C 110 -122 140 -100 160 -66 L 176 -42 C 172 -30 150 -30 136 -36 L 100 -50 Z" />
				<polygon points="150,-62 176,-120 166,-56" /><polygon points="124,-82 134,-108 140,-78" />
				<polygon points="86,-122 80,-148 98,-126" />
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
const RX0 = 200, RX1 = 1740, RY = 700;
const slotX = (i: number) => RX0 + ((RX1 - RX0) * i) / (TYPES.length - 1);
const CW = 112, CH = 128, COLS = 13;
const cardPos = (i: number) => ({x: 960 + ((i % COLS) - 6) * (CW + 16), y: 200 + Math.floor(i / COLS) * (CH + 20)});
const typeOf = (i: number) => (i * 5 + Math.floor(i / COLS)) % TYPES.length;
const PICK = [15, 31];   // the two cards lifted for "只能救一个"

const Cards: React.FC<{t: number}> = ({t}) => {
	const out: React.ReactNode[] = [];
	const lift = r(t, 39.7, 40.6), drop = 42.47;
	const order = [...Array.from({length: 52}, (_, i) => i).filter((i) => !PICK.includes(i)), ...PICK];
	for (const i of order) {
		const ty = typeOf(i), [C, s] = TYPES[ty];
		const appear = r(t, 36.9 + i * 0.028, 37.25 + i * 0.028);
		if (appear <= 0) continue;
		let {x, y} = cardPos(i), sc = 1, o = appear;
		y -= (1 - appear) * 50;
		const pi = PICK.indexOf(i);
		if (pi >= 0) { x = mix(x, pi ? 1190 : 730, lift); y = mix(y, 330, lift); sc = mix(1, 2.1, lift); }
		else o *= mix(1, 0.3, lift);
		// the drop: every card flies to its creature's place on the ruler and becomes that cut-out
		const go = r(t, drop + (i % COLS) * 0.012, drop + 0.75 + (i % COLS) * 0.012);
		if (go > 0) { x = mix(x, slotX(ty), go); y = mix(y + CH / 2, RY - 40, go) - CH / 2; sc = mix(sc, 0.35, go); o = mix(pi >= 0 ? 1 : o / mix(1, 0.3, lift), 0, lin(go, 0.6, 1)) ; }
		if (o <= 0.01) continue;
		out.push(
			<g key={i} transform={`translate(${x} ${y}) scale(${sc})`} opacity={o}>
				<g filter="url(#cutShadow)"><rect x={-CW / 2} y={0} width={CW} height={CH} rx={6} fill={P.cream} /></g>
				<C x={0} y={CH - 22} s={s} shadow={false} />
			</g>,
		);
	}
	return <g>{out}</g>;
};
const Ruler: React.FC<{t: number}> = ({t}) => {
	const k = r(t, 42.47, 42.9);
	if (k <= 0) return null;
	const lit = 620;
	return (
		<g opacity={k}>
			<g filter="url(#cutShadow)"><rect x={110} y={RY + 6} width={1720} height={64} rx={6} fill={P.cream} /></g>
			{Array.from({length: 69}, (_, i) => <line key={i} x1={130 + i * 24.8} x2={130 + i * 24.8} y1={RY + 8} y2={RY + (i % 5 ? 24 : 40)} stroke={P.ink} strokeWidth={i % 5 ? 2 : 3} opacity={0.6} />)}
			{TYPES.map(([C], i) => {
				const x = slotX(i), land = r(t, 42.47 + 0.45 + (i * 0.05), 42.47 + 0.8 + i * 0.05);
				const dim = cl((x - lit) / 380);
				const fcol = mixHex(P.cut, P.cutDim, dim * r(t, 43.2, 44.4));
				return <g key={i} opacity={land} transform={`translate(0 ${(1 - land) * -18})`}>{shadow(x, RY, 40 * RULER_S[i] + 10, 0.3 * (1 - dim))}<C x={x} y={RY} s={RULER_S[i]} f={fcol} o={1 - 0.35 * dim * r(t, 43.2, 44.4)} /></g>;
			})}
		</g>
	);
};
const mixHex = (a: string, b: string, k: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const A = p(a), B = p(b);
	return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

const subAt = (t: number) => {
	for (const [s, e, txt] of lines as [number, number, string][]) if (t >= s && t < e) return {txt, o: Math.min(lin(t, s, s + 0.15), 1 - lin(t, e - 0.15, e))};
	return null;
};

export const Film28: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const cam = camAt(t);
	const world = `translate(${960 - cam.cx * cam.s} ${540 - cam.cy * cam.s}) scale(${cam.s})`;
	const cardsOn = t >= 36.5;
	const worldO = 1 - r(t, 36.3, 37.6);                // dioramas step back when the cards are dealt
	const titleK = r(t, 31.7, 32.4) * (1 - r(t, 35.8, 36.6));
	const dimTitle = 1 - 0.35 * titleK;
	// lights
	const sudanGrow = r(t, 13.7, 16.5);
	const flyLamp = mix(0.28, 0.42, r(t, 22.4, 24.8));
	// fly: lands 17.0–18.2, slapped at 19.6
	const flyIn = r(t, 17.0, 18.3);
	const fx = mix(4320, 3780, flyIn), fy = mix(260, 706, flyIn) - Math.sin(flyIn * Math.PI) * 120;
	const slap = r(t, 19.6, 19.82), unslap = r(t, 20.3, 21.0);
	const dead = t >= 19.8;
	const s = subAt(t);
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
				<g transform={world} opacity={worldO}>
					{/* A · roadside */}
					<Pool x={mix(760, 680, r(t, 22.4, 24.8))} y={720} rx={mix(600, 400, r(t, 22.4, 24.8))} ry={mix(300, 220, r(t, 22.4, 24.8))} k={mix(1, 0.85, r(t, 22.4, 24.8)) * dimTitle} />
					<rect x={-100} y={760} width={1700} height={300} fill="url(#road)" opacity={0.8} />
					<rect x={0} y={748} width={1500} height={16} fill="#8d8378" opacity={0.8} />
					{[0, 1, 2, 3].map((i) => <rect key={i} x={60 + i * 380} y={900} width={190} height={12} fill={P.cream} opacity={0.32} />)}
					<g filter="url(#cutShadow)" fill={P.cut}><rect x={1152} y={150} width={16} height={600} /><path d="M 1160 160 Q 1140 120 1060 128 L 1030 140 L 1060 150 Q 1130 146 1152 170 Z" /></g>
					<path d="M 1040 150 L 760 750 L 1300 750 Z" fill="#fff1cf" opacity={0.07} />
					{[0, 1, 2].map((i) => { const k = lin(t, 0.0 + i * 0.12, 1.6 + i * 0.12); return <rect key={i} x={mix(-700, 1700, k)} y={812 + i * 24} width={620 - i * 140} height={7} rx={3} fill="#ffe2b0" opacity={(0.32 - i * 0.07) * Math.sin(k * Math.PI)} style={{filter: 'blur(3px)'}} />; })}
					{shadow(660, 748, 90, 0.35)}
					<CatLying x={650} y={748} s={1.5} />
					<Motes x={760} y={600} rx={420} ry={200} t={t} seed={5} />

					{/* B · Sudan */}
					<Pool x={2200} y={650} rx={mix(620, 780, sudanGrow)} ry={mix(400, 480, sudanGrow)} k={mix(0.92, 1, sudanGrow) * dimTitle} />
					<rect x={1450} y={748} width={1500} height={250} fill="url(#earth)" />
					<Acacia x={2720} y={750} s={1.1} />
					{shadow(2190, 748, mix(300, 330, r(t, 8.0, 10.2)), 0.35)}
					<RhinoK x={2170} y={750} s={1.9} down={r(t, 8.2, 10.6)} breathe={t < 8.2 ? Math.sin(t * 2.4) : 0} />
					{[[1760, 760], [1900, 768], [2520, 762], [2620, 770], [2060, 770]].map(([gx, gy], i) => <path key={i} d={`M ${gx - 14} ${gy} L ${gx - 6} ${gy - 26} L ${gx} ${gy - 6} L ${gx + 6} ${gy - 30} L ${gx + 14} ${gy}`} fill={P.cut} opacity={0.8} />)}
					<g opacity={r(t, 5.8, 6.4) * (1 - r(t, 22.4, 23.4))}><Tag x={1700} y={330} size={42}>2018 · 肯尼亚</Tag></g>
					<g opacity={r(t, 11.5, 12.1) * (1 - r(t, 22.4, 23.4))}><Tag x={2700} y={350} size={44} rot={2}>苏丹 · 45岁</Tag></g>
					<Motes x={2200} y={560} rx={560} ry={300} t={t} n={30} seed={11} o={mix(0.8, 1.2, sudanGrow)} />

					{/* C · windowsill */}
					<Pool x={3720} y={700} rx={mix(260, 200, r(t, 20.6, 22))} ry={120} k={flyLamp * dimTitle} />
					<g opacity={0.92}>
						<rect x={3220} y={150} width={1000} height={500} fill="#3c4a66" />
						{[0, 1].map((i) => <rect key={i} x={3220 + (i + 1) * 333 - 7} y={150} width={14} height={500} fill={P.cut} />)}
						<rect x={3220} y={393} width={1000} height={14} fill={P.cut} />
						<rect x={3204} y={134} width={1032} height={516} fill="none" stroke={P.cut} strokeWidth={18} />
					</g>
					{Array.from({length: 16}, (_, i) => <circle key={i} cx={3260 + ((i * 211) % 920)} cy={180 + ((i * 97) % 200)} r={2 + (i % 2)} fill="#fff2d6" opacity={0.55} />)}
					<g filter="url(#cutShadow)"><rect x={3100} y={650} width={1240} height={70} rx={6} fill="#cdb48e" /><rect x={3100} y={718} width={1240} height={22} fill="#9a7856" /></g>
					{t >= 16.8 && (dead
						? <g transform={`translate(${3780} ${694}) rotate(180) translate(0 14)`}><Fly x={0} y={0} s={2.2} f={P.cut} /></g>
						: <g transform={`rotate(${Math.sin(t * 40) * (1 - flyIn) * 8} ${fx} ${fy})`}><Fly x={fx} y={fy} s={2.2} /></g>)}
					{t > 19.4 && t < 21.2 && <Hand x={3800} y={mix(-500, 640, slap) - unslap * 900} o={0.6 * (1 - unslap)} />}
				</g>

				{/* the 52 cards and the ruler (screen space) */}
				{cardsOn && <Pool x={mix(960, 420, r(t, 42.47, 43.6))} y={mix(470, 680, r(t, 42.47, 43.6))} rx={mix(1000, 900, r(t, 42.47, 43.6))} ry={mix(520, 520, 0)} k={r(t, 36.5, 37.4)} />}
				{cardsOn && <Ruler t={t} />}
				{cardsOn && <Cards t={t} />}
				{t > 36.8 && t < 42.6 && <g opacity={r(t, 37.1, 37.6) * (1 - r(t, 39.7, 40.2))}><Tag x={960} y={120} size={44} rot={-1}>52种生物 · 3500多人</Tag></g>}
				{t > 40 && t < 42.6 && <g opacity={r(t, 40.4, 40.9) * (1 - r(t, 42.3, 42.5))}><text x={960} y={505} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 120}} fill={P.ink}>？</text></g>}
				{t > 44.6 && <g opacity={r(t, 44.6, 45.3)}>
					<Lab x={200} y={850} size={52}>像我们</Lab>
					<Lab x={1700} y={850} size={52} col={P.cream} o={0.9}>不像我们</Lab>
					<path d="M 340 832 L 1520 832" stroke={P.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray="2 18" opacity={0.4} />
				</g>}

				<rect width={W} height={H} filter="url(#fiber)" opacity={0.55} style={{mixBlendMode: 'multiply'}} />
				<rect width={W} height={H} filter="url(#grain)" opacity={0.22} style={{mixBlendMode: 'multiply'}} />
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(18,14,24,0.45) 100%)'}} />

			{titleK > 0.001 && (
				<>
					<AbsoluteFill style={{opacity: titleK, background: 'radial-gradient(ellipse 900px 300px at 50% 28%, rgba(30,24,36,0.62), rgba(30,24,36,0) 100%)'}} />
					<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: titleK, transform: `scale(${mix(1.06, 1, r(t, 31.7, 32.6))})`}}>
						<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em', color: JUNO.colors.gold}}>{JUNO.series}</div>
						<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 168, color: P.cream, letterSpacing: '0.06em', marginTop: 10, textShadow: '0 6px 30px rgba(20,12,16,0.6)'}}>生命平等吗？</div>
					</div>
					<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: titleK}}>
						<path d="M 660 450 Q 960 474 1270 442" fill="none" stroke={P.red} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - r(t, 32.0, 32.9)} />
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
