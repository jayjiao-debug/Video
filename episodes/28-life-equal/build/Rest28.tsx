import React from 'react';
import {W, H, SANS, SERIF, P, Fly, Human, Ape, Dog, Cat, Chicken, Lizard, Fish, Octopus, Bee, Worm, Jelly, Mushroom, Bat, Robe, Hippo, Tag, Lab} from './paper28';

/* ep28 《生命平等吗？》 0:52 → 2:47, screen-space stages that hand over to each other without a cut:
   bridge (庄子) → night & bat (内格尔) → the ruler again, where each thinker moves the red line (康德 边沁 辛格 史怀哲)
   → the river at sunset (史怀哲) → the growing circles (莱基). The finale returns to the opening's three lamps. */
const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const k = cl(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const r = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lin = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const mixHex = (a: string, b: string, k: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const A = p(a), B = p(b);
	return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * cl(k)).toString(16).padStart(2, '0')).join('');
};

const HEART = 'M 0 0.35 C -0.62 -0.08 -0.5 -0.62 0 -0.27 C 0.5 -0.62 0.62 -0.08 0 0.35 Z';
export const Heart: React.FC<{id: string; x: number; y: number; size: number; level: number; pop?: number; o?: number}> = ({id, x, y, size, level, pop = 1, o = 1}) => {
	if (pop <= 0) return null;
	const sc = pop < 0.7 ? mix(0, 1.18, pop / 0.7) : mix(1.18, 1, (pop - 0.7) / 0.3);
	return (
		<g transform={`translate(${x} ${y}) scale(${size * sc})`} opacity={o}>
			<defs><clipPath id={`rh${id}`}><rect x={-1} y={0.35 - level * 0.72} width={2} height={1} /></clipPath></defs>
			<path d={HEART} fill={P.cream} opacity={0.28} />
			<path d={HEART} fill={P.red} clipPath={`url(#rh${id})`} />
			<path d={HEART} fill="none" stroke={P.cream} strokeWidth={0.045} strokeLinejoin="round" />
		</g>
	);
};
const Pool: React.FC<{x: number; y: number; rx: number; ry: number; k: number}> = ({x, y, rx, ry, k}) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#pool28)" opacity={k} />;
const shadow = (x: number, y: number, rx: number, o = 0.3) => <ellipse cx={x} cy={y + 4} rx={rx} ry={rx * 0.12} fill="#2a1a16" opacity={o} />;
const motes = (t: number, x: number, y: number, rx: number, ry: number, n: number, seed: number, o = 1) => {
	const R = rng(seed); const out: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) {
		const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 0.85, sp = 0.2 + R() * 0.5, ph = R() * 6;
		out.push(<circle key={i} cx={x + Math.cos(a) * d * rx + Math.sin(t * sp + ph) * 14} cy={y + Math.sin(a) * d * ry - ((t * 9 * sp + ph * 20) % 70)} r={1.6 + R() * 2.2} fill="#fff6dd" opacity={o * (0.25 + R() * 0.45)} />);
	}
	return <g>{out}</g>;
};
const Stamp: React.FC<{x: number; y: number; text: string; size: number; k: number; rot?: number; col?: string}> = ({x, y, text, size, k, rot = -6, col = P.red}) => {
	if (k <= 0) return null;
	const w = [...text].length * size * 1.05 + size * 0.9, h = size * 1.5;
	const sc = mix(1.5, 1, ease(Math.min(1, k * 1.4)));
	return (
		<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={Math.min(1, k * 2)}>
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={P.cream} opacity={0.92} />
			<rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 12} height={h - 12} rx={4} fill="none" stroke={col} strokeWidth={5} />
			<text x={0} y={size * 0.36} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: size}} fill={col}>{text}</text>
		</g>
	);
};

/* ------------------------------------------------------------ 1 · the bridge (52.8–63.8) */
const Bridge: React.FC<{t: number}> = ({t}) => {
	const leap = lin(t, 56.3, 57.7);
	const lx = mix(380, 660, leap), ly = 820 - Math.sin(leap * Math.PI) * 270;
	const q = r(t, 58.6, 59.2) * (1 - r(t, 63.0, 63.4));
	return (
		<g>
			<Pool x={940} y={470} rx={660} ry={340} k={1} /><Pool x={1560} y={200} rx={160} ry={160} k={0.75} />
			<circle cx={1560} cy={200} r={70} fill="#fbeccb" opacity={0.55} />
			{[0, 1, 2, 3].map((i) => <rect key={i} x={0} y={640 + i * 72} width={W} height={72} fill={P.water} opacity={0.32 + i * 0.12} />)}
			{[[300, 700], [620, 760], [1200, 720], [1500, 790], [880, 830], [1700, 700]].map(([x, y], i) => <path key={i} d={`M ${x - 70 + ((t * 18 + i * 40) % 60)} ${y} q 35 -10 70 0 t 70 0`} fill="none" stroke={P.cream} strokeWidth={3} opacity={0.42} />)}
			<Fish x={1180 + Math.sin(t * 0.6) * 120} y={880} s={1.2} f={P.cream} flip />
			<Fish x={900 + ((t - 52) * 38) % 600} y={900 + Math.sin(t * 1.3) * 8} s={1.0} f={P.gold} o={0.85} />
			{leap > 0 && leap < 1 && <g transform={`rotate(${mix(-40, 40, leap)} ${lx} ${ly})`}><Fish x={lx} y={ly + 20} s={1.5} f={P.gold} /></g>}
			{leap <= 0 && <Fish x={380 + Math.sin(t * 1.2) * 20} y={835} s={1.5} f={P.gold} />}
			{leap >= 1 && <Fish x={700 + (t - 57.7) * 30} y={850} s={1.5} f={P.gold} />}
			{[0, 1].map((i) => { const k = lin(t, 56.3 + i * 1.4, 57.1 + i * 1.4); return k > 0 && k < 1 ? <ellipse key={i} cx={i ? 660 : 380} cy={645} rx={30 + k * 90} ry={(30 + k * 90) * 0.18} fill="none" stroke={P.cream} strokeWidth={3} opacity={0.7 * (1 - k)} /> : null; })}
			<g filter="url(#cutShadow)" fill={P.cut}>
				<path d="M 160 640 Q 940 330 1720 640 L 1720 680 Q 940 380 160 680 Z" />
				{Array.from({length: 12}, (_, i) => { const x = 360 + i * 105; const tt = (x - 160) / 1560, deck = 640 - 620 * tt * (1 - tt); const t2 = (x - 300) / 1280, rail = 528 - 580 * t2 * (1 - t2); return <rect key={i} x={x - 5} y={rail} width={10} height={deck - rail + 4} />; })}
				<path d="M 300 590 Q 940 300 1580 590" fill="none" stroke={P.cut} strokeWidth={8} transform="translate(0 -62)" />
			</g>
			<Robe x={830} y={490} s={1.15} point={t > 55.9} />
			<Robe x={1070} y={491} s={1.15} flip point={t > 58.5 && t < 61.5} />
			<g opacity={r(t, 53.2, 53.8)}><Tag x={800} y={250} size={44} rot={-3}>庄子</Tag><Tag x={1100} y={250} size={44} rot={2}>惠子</Tag></g>
			<text x={1180} y={mix(400, 360, q)} textAnchor="middle" opacity={q} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 96}} fill={P.ink}>？</text>
		</g>
	);
};

/* ------------------------------------------------------------ 2 · night, the bat (63.9–78.5) */
const BatScene: React.FC<{t: number}> = ({t}) => {
	const fly = r(t, 64.0, 67.4), out = r(t, 72.3, 73.8);
	const bx = mix(mix(2050, 1180, fly), 2150, out), by = mix(mix(150, 400, fly), -150, out) + Math.sin(t * 2.2) * 12 * fly;
	const flap = 0.72 + 0.28 * Math.sin(t * 11);
	const walk = r(t, 69.1, 70.7), back = r(t, 72.3, 73.4);
	const hx = mix(mix(420, 815, walk) - Math.sin(lin(t, 70.6, 71.1) * Math.PI) * 18, 520, back);
	const glass = r(t, 68.9, 69.6) * (1 - r(t, 72.1, 72.7));
	const others = r(t, 72.6, 73.6);
	const meter = (k: number, x: number, y: number) => (
		<g opacity={others}>
			<rect x={x - 90} y={y} width={180} height={22} rx={11} fill={P.cream} opacity={0.35} />
			<rect x={x - 90} y={y} width={180 * k * r(t, 73.0, 74.4)} height={22} rx={11} fill={P.gold} />
			<text x={x - 104} y={y + 19} textAnchor="end" style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}} fill={P.cream}>像</text>
		</g>
	);
	return (
		<g>
			<Pool x={1500} y={280} rx={260} ry={260} k={0.85} />
			<circle cx={1500} cy={280} r={130} fill="#fbeccb" opacity={0.75} />
			<circle cx={1450} cy={250} r={26} fill="#e9d3a8" opacity={0.6} /><circle cx={1540} cy={320} r={18} fill="#e9d3a8" opacity={0.5} />
			{Array.from({length: 30}, (_, i) => <circle key={i} cx={(i * 397) % W} cy={60 + ((i * 131) % 380)} r={1.5 + (i % 3)} fill="#fff2d6" opacity={0.35 + 0.25 * Math.sin(t * 1.5 + i)} />)}
			<Pool x={900} y={760} rx={760} ry={250} k={0.9} />
			<rect x={0} y={760} width={W} height={320} fill="#2e2a36" opacity={0.45} />
			<g transform={`translate(${bx} ${by}) scale(1 ${flap}) translate(${-bx} ${-by})`}><Bat x={bx} y={by + 70} s={1.9} /></g>
			<g opacity={r(t, 64.2, 64.8)}><Tag x={460} y={200} size={44} rot={-2}>1974 · 内格尔</Tag></g>
			{shadow(hx, 760, 40)}<Human x={hx} y={760} s={1.05} />
			{glass > 0 && <g opacity={glass}>
				<rect x={905} y={330} width={22} height={430} fill="#dfe9f2" opacity={0.18} />
				<line x1={916} y1={330} x2={916} y2={760} stroke="#eef6ff" strokeWidth={3} opacity={0.7} />
				<line x1={924} y1={380} x2={924} y2={520} stroke="#fff" strokeWidth={2} opacity={0.6} />
				<line x1={924} y1={560} x2={924} y2={620} stroke="#fff" strokeWidth={2} opacity={0.5} />
			</g>}
			{others > 0 && <g opacity={others}>
				{shadow(1110, 760, 60)}<Cat x={1110} y={760} s={1.35} />
				{shadow(1530, 760, 40)}<Fly x={1530} y={760} s={2.3} />
				<path d={`M ${hx + 20} 610 Q 820 470 1060 560`} fill="none" stroke={P.cream} strokeWidth={3} strokeDasharray="4 14" opacity={0.6} />
				<path d={`M ${hx + 20} 610 Q 1000 420 1500 640`} fill="none" stroke={P.cream} strokeWidth={3} strokeDasharray="4 14" opacity={0.6} />
				<Tag x={hx - 10} y={540} size={40} rot={-2}>像不像我？</Tag>
			</g>}
			{meter(0.72, 1110, 540)}{meter(0.1, 1530, 600)}
			<Heart id="bc" x={1110} y={470} size={110} level={0.75} pop={lin(t, 75.4, 75.8)} />
			<Heart id="bf" x={1530} y={540} size={70} level={0.04} pop={lin(t, 75.7, 76.1)} />
		</g>
	);
};

/* ------------------------------------------------------------ 3 · the ruler and the red line (78.6–126) */
const TYPES: [React.FC<any>, number][] = [[Human, 1.0], [Ape, 1.1], [Dog, 1.1], [Cat, 1.05], [Chicken, 1.15], [Lizard, 1.0], [Fish, 1.25], [Octopus, 1.15], [Bee, 1.6], [Fly, 1.7], [Worm, 1.3], [Jelly, 1.25], [Mushroom, 1.15]];
const RULER_H = [175, 145, 125, 112, 110, 36, 52, 100, 62, 78, 36, 108, 115];
const CARE = [-1, 1, 0.95, 0.9, 0.7, 0.45, 0.4, 0.35, 0.2, 0.08, 0.18, 0.05, 0];
const RY = 700;
const slotX = (i: number) => 200 + (1540 * i) / 12;
const KANT = 264, BENTHAM = 1163, SCHWEITZER = 1860;
const litAt = (t: number) => {
	if (t < 84.6) return 620;
	if (t < 97.8) return mix(620, KANT, r(t, 84.6, 85.6));
	if (t < 123.4) return mix(KANT, BENTHAM, r(t, 97.8, 99.0));
	return mix(BENTHAM, SCHWEITZER + 200, r(t, 123.4, 124.8));
};
const RedLine: React.FC<{x: number; t0: number; t: number; ghost: number; label: string; lx?: number; ly?: number}> = ({x, t0, t, ghost, label, lx, ly = 200}) => {
	const draw = r(t, t0, t0 + 0.7);
	if (draw <= 0) return null;
	const o = mix(0.95, 0.38, ghost);
	return (
		<g>
			<path d={`M ${x} 250 L ${x + 4} 800`} fill="none" stroke={P.red} strokeWidth={mix(13, 8, ghost)} strokeLinecap="round" pathLength={1} strokeDasharray={ghost > 0.5 ? '0.03 0.025' : '1 1'} strokeDashoffset={ghost > 0.5 ? 0 : 1 - draw} opacity={o} />
			<g opacity={r(t, t0 + 0.3, t0 + 0.8) * mix(1, 0.55, ghost)}><Tag x={lx ?? x} y={ly} size={44} rot={-2}>{label}</Tag></g>
		</g>
	);
};
const RulerScene: React.FC<{t: number}> = ({t}) => {
	const lit = litAt(t);
	const cold = r(t, 95.3, 96.6) * (1 - r(t, 98.0, 99.5));
	const seek = t < 84.6 ? (t < 82.0 ? 760 + Math.sin((t - 78.6) * 1.2) * 420 : 760 + Math.sin((82.0 - 78.6) * 1.2) * 420) : 0;
	const scaleIn = r(t, 108.9, 109.8) * (1 - r(t, 122.6, 123.3));
	const tilt = mix(-11, 0, r(t, 112.4, 113.6));
	const pulse = t > 103.2 && t < 106.4;
	return (
		<g>
			<Pool x={Math.max(420, (lit + 80) / 2)} y={660} rx={Math.max(520, lit / 2 + 300)} ry={560} k={1} />
			<g filter="url(#cutShadow)"><rect x={110} y={RY + 6} width={1720} height={64} rx={6} fill={P.cream} /></g>
			{Array.from({length: 69}, (_, i) => <line key={i} x1={130 + i * 24.8} x2={130 + i * 24.8} y1={RY + 8} y2={RY + (i % 5 ? 24 : 40)} stroke={P.ink} strokeWidth={i % 5 ? 2 : 3} opacity={0.6} />)}
			{TYPES.map(([C, s], i) => {
				const x = slotX(i), dim = cl((x - lit) / 300);
				const fcol = i === 0 && cold > 0 ? mixHex(P.cut, '#5f7896', cold) : mixHex(P.cut, P.cutDim, dim);
				return (
					<g key={i}>
						{shadow(x, RY, 40 * s + 10, 0.3 * (1 - dim))}
						<C x={x} y={RY} s={s} f={fcol} o={1 - 0.4 * dim} />
						{CARE[i] > 0.02 && <Heart id={`q${i}`} x={x} y={RY - RULER_H[i] - 44} size={mix(40, 74, CARE[i])} level={CARE[i]} o={1 - 0.45 * dim} />}
						{pulse && i > 0 && x < BENTHAM && [0, 1].map((j) => { const k = ((t - 103.2 + j * 0.6 + i * 0.13) % 1.2) / 1.2; return <circle key={j} cx={x} cy={RY - RULER_H[i] / 2} r={20 + k * 70} fill="none" stroke={P.red} strokeWidth={3} opacity={0.55 * (1 - k)} />; })}
					</g>
				);
			})}
			{cold > 0 && Array.from({length: 7}, (_, j) => <path key={j} d={`M ${200 + Math.cos(j) * 46} ${560 + Math.sin(j * 2) * 60} l 6 -10 l 6 10 l -6 10 z`} fill="#dfefff" opacity={0.8 * cold} />)}
			{t < 85 && <g opacity={r(t, 78.8, 79.6) * (1 - r(t, 84.4, 84.8))}><path d={`M ${seek} 250 L ${seek + 4} 800`} stroke={P.red} strokeWidth={9} strokeLinecap="round" strokeDasharray="22 22" opacity={0.6} /><text x={seek} y={226} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 72}} fill={P.ink}>？</text></g>}
			<RedLine x={KANT} t0={84.6} t={t} ghost={r(t, 97.8, 98.6)} label="康德：会思考" lx={420} />
			<RedLine x={BENTHAM} t0={97.8} t={t} ghost={r(t, 123.4, 124.2)} label="边沁：会不会痛" lx={1330} ly={180} />
			<RedLine x={SCHWEITZER} t0={123.4} t={t} ghost={0} label="史怀哲：活着本身" lx={1640} ly={290} />
			{cold > 0 && <g opacity={cold}><Tag x={330} y={340} size={42} rot={2} bg="#cfe0ef">对动物狠 → 对人也冷</Tag></g>}
			{/* 辛格 */}
			<g opacity={r(t, 106.2, 106.9) * (1 - r(t, 122.6, 123.3))}><Tag x={1520} y={330} size={44} rot={-2}>1975 · 辛格《动物解放》</Tag></g>
			{scaleIn > 0 && <g opacity={scaleIn} transform={`translate(0 ${(1 - scaleIn) * -60})`}>
				<rect x={694} y={250} width={12} height={200} fill={P.cut} /><path d="M 640 452 L 760 452 L 730 430 L 670 430 Z" fill={P.cut} />
				<g transform={`rotate(${tilt} 700 250)`}>
					<rect x={460} y={244} width={480} height={12} rx={6} fill={P.cut} />
					{[[472, 'L'], [928, 'R']].map(([px, side]) => {
						const x = px as number, a = (tilt * Math.PI) / 180, dy = ((x - 700) * Math.sin(a));
						return (
							<g key={side as string} transform={`rotate(${-tilt} ${x} 250)`}>
								<path d={`M ${x} 250 L ${x - 70} 360 M ${x} 250 L ${x + 70} 360`} stroke={P.cut} strokeWidth={3} />
								<path d={`M ${x - 90} 360 Q ${x} 400 ${x + 90} 360 Z`} fill={P.cut} />
								{side === 'L' ? <Chicken x={x} y={362} s={0.85} /> : <Dog x={x} y={362} s={0.8} />}
								{void dy}
							</g>
						);
					})}
				</g>
			</g>}
			<Stamp x={700} y={330} text="物种歧视" size={78} k={lin(t, 118.2, 118.7) * (1 - r(t, 122.6, 123.3))} />
			<Stamp x={470} y={480} text="种族歧视" size={44} k={lin(t, 120.6, 121.0) * (1 - r(t, 122.6, 123.3))} rot={4} col="#6b5a66" />
			<Stamp x={930} y={480} text="性别歧视" size={44} k={lin(t, 120.9, 121.3) * (1 - r(t, 122.6, 123.3))} rot={-3} col="#6b5a66" />
		</g>
	);
};

/* ------------------------------------------------------------ 4 · the river at sunset (126.3–147) */
const River: React.FC<{t: number}> = ({t}) => {
	const boat = mix(560, 1180, lin(t, 126.0, 147.0));
	const words = r(t, 131.4, 132.6);
	const hearts = (d: number) => lin(t, 140.0 + d, 140.4 + d);
	const HIPPOS: [number, number, number, boolean][] = [[380, 770, 1.1, false], [700, 860, 1.3, true], [1520, 800, 1.2, false], [1740, 905, 0.9, true]];
	const birds = Array.from({length: 5}, (_, i) => ({x: ((t - 126) * (40 + i * 6) + i * 260) % 2200 - 100, y: 200 + i * 34 + Math.sin(t + i) * 10}));
	return (
		<g>
			<defs><linearGradient id="sunset" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4a3a5a" /><stop offset="0.38" stopColor="#b4646a" /><stop offset="0.56" stopColor="#f0a35e" /><stop offset="0.6" stopColor="#f6c27a" /><stop offset="0.61" stopColor="#6c5a70" /><stop offset="1" stopColor="#46405a" /></linearGradient></defs>
			<rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#sunset)" />
			<circle cx={1250} cy={mix(540, 575, lin(t, 126, 147))} r={120} fill="#ffd89a" opacity={0.95} />
			<path d="M -40 600 Q 200 520 420 570 T 820 560 T 1240 590 T 1960 560 L 1960 662 L -40 662 Z" fill="#3e2c3e" />
			<path d="M -40 640 Q 300 600 640 630 T 1300 620 T 1960 640 L 1960 662 L -40 662 Z" fill="#2e2232" />
			{Array.from({length: 14}, (_, i) => <rect key={i} x={1060 + (i % 4) * 30 - i * 6 + Math.sin(t * 1.4 + i) * 10} y={690 + i * 22} width={300 - i * 14} height={5} fill="#ffd89a" opacity={0.5 - i * 0.03} />)}
			{birds.map((b, i) => <path key={i} d={`M ${b.x - 14} ${b.y} q 7 -8 14 0 q 7 -8 14 0`} fill="none" stroke={P.cut} strokeWidth={3} opacity={0.8} />)}
			{HIPPOS.map(([x, y, s, f], i) => <g key={i} transform={`translate(0 ${Math.sin(t * 1.1 + i * 1.7) * 4})`}><Hippo x={x} y={y} s={s} flip={f} /></g>)}
			<g transform={`translate(${boat - 1000} ${Math.sin(t * 1.3) * 3})`}>
				<g filter="url(#cutShadow)" fill={P.cut}><path d="M 760 760 Q 1000 800 1240 752 L 1222 784 Q 1000 822 780 790 Z" /></g>
				<Robe x={900} y={778} s={0.62} /><Robe x={1010} y={782} s={0.7} /><Robe x={1110} y={776} s={0.62} flip />
				<path d={`M 1130 740 L ${1180 + Math.sin(t * 1.6) * 20} 830`} stroke={P.cut} strokeWidth={5} strokeLinecap="round" />
			</g>
			<g opacity={r(t, 126.6, 127.4)}><Tag x={430} y={140} size={42} rot={-2}>1915 · 非洲 · 奥果韦河</Tag></g>
			{words > 0 && <text x={960} y={mix(380, 350, words)} textAnchor="middle" opacity={words} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 150, letterSpacing: '0.2em'}} fill="#fff1d0" stroke="rgba(90,40,30,0.35)" strokeWidth={2}>敬畏生命</text>}
			{t > 134 && motes(t, 960, 760, 900, 160, 50, 41, r(t, 134.4, 136.0))}
			<Heart id="rv0" x={380} y={680} size={70} level={1} pop={hearts(0)} /><Heart id="rv1" x={700} y={765} size={70} level={1} pop={hearts(0.15)} />
			<Heart id="rv2" x={1520} y={705} size={70} level={1} pop={hearts(0.3)} /><Heart id="rv3" x={boat} y={630} size={70} level={1} pop={hearts(0.45)} />
			<Heart id="rv4" x={(birds[1].x)} y={birds[1].y - 50} size={50} level={1} pop={hearts(0.6)} />
		</g>
	);
};

/* ------------------------------------------------------------ 5 · the growing circles (147.1–166.4) */
const RINGS = ['家人', '阶层', '国家', '全人类', '动物'];
const Rings: React.FC<{t: number}> = ({t}) => {
	const cx = 960, cy = 500, sq = 0.6;
	const ringT = [149.6, 152.3, 153.1, 153.9, 154.9];
	const grow = 1 + 0.22 * r(t, 162.4, 166.4);
	const R = (i: number) => (130 + i * 112) * grow;
	const ringK = (i: number) => r(t, ringT[i], ringT[i] + 0.8);
	const people: [number, number, number, number][] = [[0, 40, 0.5, 0], [-190, 70, 0.4, 0], [180, 60, 0.38, 0], [-300, -40, 0.34, 1], [320, 150, 0.34, 2], [-260, 200, 0.32, 2], [400, -30, 0.3, 3], [-430, 110, 0.3, 3], [120, 270, 0.3, 3]];
	const careRing = [1, 0.8, 0.6, 0.45, 0.2];
	return (
		<g>
			<Pool x={cx} y={cy} rx={mix(360, 900, r(t, 149.0, 155.6)) * grow} ry={mix(240, 520, r(t, 149.0, 155.6)) * grow} k={1} />
			{RINGS.map((name, i) => {
				const k = ringK(i); if (k <= 0) return null;
				const last = i === RINGS.length - 1;
				return last
					? <ellipse key={i} cx={cx} cy={cy} rx={R(i)} ry={R(i) * sq} fill="none" stroke={P.red} strokeWidth={10} strokeLinecap="round" pathLength={100} strokeDasharray={`${mix(0, 78, k) + 22 * r(t, 162.4, 165.4)} 100`} strokeDashoffset={-30} opacity={0.9} />
					: <ellipse key={i} cx={cx} cy={cy} rx={R(i) * mix(0.6, 1, k)} ry={R(i) * sq * mix(0.6, 1, k)} fill="none" stroke={P.ink} strokeWidth={4} opacity={0.5 * k} />;
			})}
			{people.map(([dx, dy, s, ring], i) => { const k = ringK(ring); return k > 0 ? <g key={i} opacity={k}><Human x={cx + dx * grow} y={cy + dy * grow} s={s} /></g> : null; })}
			{(() => { const k = ringK(4); return k > 0 ? <g opacity={k}>
				<Cat x={cx - 590 * grow} y={cy + 120 * grow} s={0.9} /><Dog x={cx + 600 * grow} y={cy + 60 * grow} s={0.85} /><Chicken x={cx + 420 * grow} y={cy + 300 * grow} s={0.85} /><Fish x={cx - 380 * grow} y={cy + 330 * grow} s={0.9} />
			</g> : null; })()}
			<g opacity={r(t, 162.6, 164.6)}><Fly x={cx - 560 * grow} y={cy - 150 * grow} s={1.4} /></g>
			{RINGS.map((name, i) => { const k = ringK(i); if (k <= 0) return null; const last = i === RINGS.length - 1; return <g key={name} opacity={k}><Tag x={cx + (i % 2 ? 16 : -16)} y={cy - R(i) * sq + 14} size={last ? 46 : 40} rot={i % 2 ? 2 : -2} bg={last ? P.cream : '#efdfc0'} col={last ? P.red : P.ink}>{name}</Tag></g>; })}
			{RINGS.map((_, i) => <Heart key={i} id={`rg${i}`} x={cx + R(i) * 0.72} y={cy + R(i) * sq * 0.72} size={mix(70, 40, i / 4)} level={careRing[i]} pop={lin(t, 159.6 + i * 0.18, 160.0 + i * 0.18)} o={1 - r(t, 165.0, 166.0)} />)}
			<g opacity={r(t, 147.3, 148.0)}><Tag x={330} y={150} size={42} rot={-2}>1869 · 莱基</Tag></g>
		</g>
	);
};

/* ------------------------------------------------------------ the hand-overs between stages */
export const Rest: React.FC<{t: number}> = ({t}) => {
	if (t < 52.2 || t > 168.5) return null;
	const stages: React.ReactNode[] = [];
	// bridge: comes down from above (camera tilts up from the ruler), leaves downward as we tilt up to the moon
	if (t < 64.8) { const a = r(t, 52.4, 53.8), b = r(t, 63.2, 64.6); stages.push(<g key="br" opacity={r(t, 52.3, 53.2)} transform={`translate(0 ${-760 * (1 - a) + 760 * b})`}><Bridge t={t} /></g>); }
	if (t > 63.0 && t < 79.4) { const a = r(t, 63.2, 64.6), b = r(t, 77.9, 79.2); stages.push(<g key="bat" transform={`translate(0 ${-760 * (1 - a) - 760 * b})`}><BatScene t={t} /></g>); }
	if (t > 77.7 && t < 127.2) { const a = r(t, 77.9, 79.2), b = r(t, 125.4, 127.0); stages.push(<g key="ru" transform={`translate(${-1920 * b} ${760 * (1 - a)})`}><RulerScene t={t} /></g>); }
	if (t > 125.2 && t < 148.2) { const a = r(t, 125.4, 127.0), b = r(t, 146.4, 148.0); stages.push(<g key="rv" opacity={1 - b} transform={`translate(${1920 * (1 - a)} 0) translate(960 540) scale(${mix(1, 1.12, b)}) translate(-960 -540)`}><River t={t} /></g>); }
	if (t > 146.2) { const a = r(t, 146.4, 148.0), b = r(t, 165.8, 167.8); stages.push(<g key="rg" opacity={a * (1 - b)} transform={`translate(960 520) scale(${mix(0.55, 1, a) * mix(1, 0.35, b)}) translate(-960 -520)`}><Rings t={t} /></g>); }
	return <g>{stages}</g>;
};
