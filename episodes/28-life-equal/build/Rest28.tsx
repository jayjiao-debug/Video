import React from 'react';
import {W, H, SANS, SERIF, P, Fly, Human, Ape, Dog, Cat, Chicken, Lizard, Frog, Fish, Octopus, Bee, Worm, Jelly, Mushroom, Bat, Robe, Hippo, Tag} from './paper28';

/* ep28 《生命平等吗？》 0:52 → end, v2.
   Every hand-over is a different, motivated move, and the outgoing scene's labels and props leave BEFORE the move:
   ruler → (a fish leaps, the river rises) → bridge → (push into the moon) → night & bat → (the man, cat and fly walk
   onto the ruler) → ruler & red line → (the lamp gathers up into the setting sun) → river → (the sun sets, ripples)
   → circles → (the circles burst on the 2:48 drop) → the great field, everyone in the light. */
const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const k = cl(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const smooth = (x: number) => { const u = cl(x); return u * u * u * (u * (u * 6 - 15) + 10); };
const r = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const s5 = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const lin = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const mixHex = (a: string, b: string, k: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const A = p(a), B = p(b);
	return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * cl(k)).toString(16).padStart(2, '0')).join('');
};
const fadeIO = (t: number, a: number, b: number, c: number, d: number) => r(t, a, b) * (1 - r(t, c, d));

const HEART = 'M 0 0.35 C -0.62 -0.08 -0.5 -0.62 0 -0.27 C 0.5 -0.62 0.62 -0.08 0 0.35 Z';
export const Heart: React.FC<{id: string; x: number; y: number; size: number; level: number; pop?: number; o?: number}> = ({id, x, y, size, level, pop = 1, o = 1}) => {
	if (pop <= 0 || o <= 0.01) return null;
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
const Pool: React.FC<{x: number; y: number; rx: number; ry: number; k: number}> = ({x, y, rx, ry, k}) => (k > 0.005 ? <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#pool28)" opacity={k} /> : null);
const shadow = (x: number, y: number, rx: number, o = 0.3) => <ellipse cx={x} cy={y + 4} rx={rx} ry={rx * 0.12} fill="#2a1a16" opacity={o} />;
const motes = (t: number, x: number, y: number, rx: number, ry: number, n: number, seed: number, o = 1) => {
	if (o <= 0.01) return null;
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
const Ripple: React.FC<{cx: number; cy: number; t: number; t0: number; dur: number; r0: number; r1: number; sq?: number; o?: number; w?: number}> = ({cx, cy, t, t0, dur, r0, r1, sq = 0.6, o = 0.7, w = 3}) => {
	const k = lin(t, t0, t0 + dur); if (k <= 0 || k >= 1) return null;
	const rr = mix(r0, r1, 1 - Math.pow(1 - k, 2));
	return <ellipse cx={cx} cy={cy} rx={rr} ry={rr * sq} fill="none" stroke={P.cream} strokeWidth={w} opacity={o * (1 - k)} />;
};

/* ============================================================ 1 · the bridge (52.0–63.6) */
const Bridge: React.FC<{t: number}> = ({t}) => {
	const water = s5(t, 52.15, 53.4);                 // the river rises over the ruler
	const wy = mix(1120, 640, water);
	const bridgeIn = s5(t, 53.0, 54.3) * (1 - s5(t, 62.7, 63.5));
	const labels = fadeIO(t, 53.6, 54.2, 62.5, 63.0);
	// the ruler's fish leaps into the rising river
	const jump = lin(t, 51.9, 53.3);
	const jx = mix(970, 640, jump), jy = 660 - Math.sin(jump * Math.PI) * 300 + jump * 200;
	const leap = lin(t, 56.3, 57.7);
	const lx = mix(380, 660, leap), ly = 820 - Math.sin(leap * Math.PI) * 270;
	const q = fadeIO(t, 58.6, 59.2, 62.5, 63.0);
	const sky = s5(t, 52.6, 53.8);
	return (
		<g>
			<g opacity={sky}><Pool x={940} y={470} rx={660} ry={340} k={1 - s5(t, 62.7, 63.5)} /><Pool x={1560} y={200} rx={160} ry={160} k={0.75} /><circle cx={1560} cy={200} r={70} fill="#fbeccb" opacity={0.6} /></g>
			<g opacity={bridgeIn} transform={`translate(0 ${(1 - bridgeIn) * 90})`}>
				<g filter="url(#cutShadow)" fill={P.cut}>
					<path d="M 160 640 Q 940 330 1720 640 L 1720 680 Q 940 380 160 680 Z" />
					{Array.from({length: 12}, (_, i) => { const x = 360 + i * 105; const tt = (x - 160) / 1560, deck = 640 - 620 * tt * (1 - tt); const t2 = (x - 300) / 1280, rail = 528 - 580 * t2 * (1 - t2); return <rect key={i} x={x - 5} y={rail} width={10} height={deck - rail + 4} />; })}
					<path d="M 300 590 Q 940 300 1580 590" fill="none" stroke={P.cut} strokeWidth={8} transform="translate(0 -62)" />
				</g>
				<g opacity={r(t, 53.6, 54.4)}>
					<Robe x={830} y={490} s={1.15} point={t > 55.9} />
					<Robe x={1070} y={491} s={1.15} flip point={t > 58.5 && t < 61.5} />
				</g>
			</g>
			{[0, 1, 2, 3].map((i) => <rect key={i} x={0} y={wy + i * 72} width={W} height={72 + (i === 3 ? 400 : 0)} fill={P.water} opacity={0.32 + i * 0.12} />)}
			<rect x={0} y={wy - 3} width={W} height={6} fill={P.cream} opacity={0.25} />
			{[[300, 60], [620, 120], [1200, 80], [1500, 150], [880, 190], [1700, 60]].map(([x, dy], i) => <path key={i} d={`M ${x - 70 + ((t * 18 + i * 40) % 60)} ${wy + dy} q 35 -10 70 0 t 70 0`} fill="none" stroke={P.cream} strokeWidth={3} opacity={0.42 * water} />)}
			<g opacity={r(t, 53.4, 54.2) * (1 - r(t, 62.8, 63.4))}>
				<Fish x={1180 + Math.sin(t * 0.6) * 120} y={880} s={1.2} f={P.cream} flip />
				<Fish x={900 + ((t - 52) * 38) % 600} y={900 + Math.sin(t * 1.3) * 8} s={1.0} f={P.gold} o={0.85} />
			</g>
			{jump > 0 && jump < 1 && <g transform={`rotate(${mix(-30, 60, jump)} ${jx} ${jy})`}><Fish x={jx} y={jy + 20} s={1.25} f={P.cut} /></g>}
			{jump >= 1 && t < 56.3 && <Fish x={380 + Math.sin(t * 1.2) * 20 + (1 - lin(t, 53.3, 54.6)) * 260} y={835} s={1.5} f={mixHex(P.cut, P.gold, lin(t, 53.3, 54.4))} />}
			{leap > 0 && leap < 1 && <g transform={`rotate(${mix(-40, 40, leap)} ${lx} ${ly})`}><Fish x={lx} y={ly + 20} s={1.5} f={P.gold} /></g>}
			{leap >= 1 && <Fish x={700 + (t - 57.7) * 30} y={850} s={1.5} f={P.gold} o={1 - r(t, 62.8, 63.4)} />}
			<Ripple cx={640} cy={wy + 4} t={t} t0={53.25} dur={1.3} r0={20} r1={160} sq={0.18} />
			{[0, 1].map((i) => <Ripple key={i} cx={i ? 660 : 380} cy={645} t={t} t0={56.3 + i * 1.4} dur={0.9} r0={30} r1={120} sq={0.18} />)}
			<g opacity={labels}><Tag x={800} y={250} size={44} rot={-3}>庄子</Tag><Tag x={1100} y={250} size={44} rot={2}>惠子</Tag></g>
			<text x={1180} y={mix(400, 360, q)} textAnchor="middle" opacity={q} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 96}} fill={P.ink}>？</text>
		</g>
	);
};

/* ============================================================ 2 · night: what is it like to be a bat (63.9–77.6) */
const MOON = {x: 960, y: 430, r: 280};
const HangingBat: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} fill={P.cut} filter="url(#cutShadow)">
		<path d="M -8 0 L -6 22 M 8 0 L 6 22" stroke={P.cut} strokeWidth={4} strokeLinecap="round" />
		<ellipse cx={0} cy={66} rx={36} ry={58} /><ellipse cx={0} cy={60} rx={22} ry={46} fill="#2a1c18" />
		<circle cx={0} cy={124} r={19} /><polygon points="-14,132 -20,152 -6,138" /><polygon points="14,132 20,152 6,138" />
	</g>
);
const WingedMan: React.FC<{x: number; y: number; s: number; flap: number}> = ({x, y, s, flap}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<g transform={`rotate(${-12 - flap * 18} -20 -120)`}><path d="M -20 -120 Q -90 -170 -150 -120 Q -130 -110 -128 -96 Q -110 -108 -96 -96 Q -80 -108 -64 -94 Q -44 -104 -22 -96 Z" fill={P.cut} /></g>
		<g transform={`rotate(${12 + flap * 18} 20 -120)`}><path d="M 20 -120 Q 90 -170 150 -120 Q 130 -110 128 -96 Q 110 -108 96 -96 Q 80 -108 64 -94 Q 44 -104 22 -96 Z" fill={P.cut} /></g>
		<Human x={0} y={0} s={1} />
	</g>
);
const BatScene: React.FC<{t: number}> = ({t}) => {
	const moonIn = 1, nightOut = 1 - r(t, 77.0, 77.8);
	const flyK = s5(t, 64.7, 66.4);
	const bxF = (1 - flyK) * (1 - flyK) * 1980 + 2 * flyK * (1 - flyK) * 640 + flyK * flyK * 1110;
	const byF = (1 - flyK) * (1 - flyK) * 560 + 2 * flyK * (1 - flyK) * 640 + flyK * flyK * 300;
	const flap = 0.7 + 0.3 * Math.sin(t * 13);
	const hang = r(t, 66.2, 66.7), batOut = r(t, 71.8, 72.5);
	const sonar = fadeIO(t, 66.6, 67.0, 71.6, 72.2);
	const humanIn = s5(t, 68.4, 69.6), hx = mix(240, 520, humanIn);
	const bubble = fadeIO(t, 69.3, 69.9, 71.8, 72.4);
	const comp = fadeIO(t, 72.4, 73.2, 77.1, 77.6);
	const meter = (k: number, x: number, y: number) => (
		<g opacity={comp}>
			<text x={x - 150} y={y + 24} textAnchor="end" style={{fontFamily: SANS, fontWeight: 900, fontSize: 52}} fill={P.cream}>像我</text>
			<rect x={x - 130} y={y} width={260} height={30} rx={15} fill={P.cream} opacity={0.3} />
			<rect x={x - 130} y={y} width={260 * k * r(t, 73.0, 74.4)} height={30} rx={15} fill={P.gold} />
		</g>
	);
	return (
		<g>
			<g opacity={nightOut}>
				{Array.from({length: 40}, (_, i) => <circle key={i} cx={(i * 397) % W} cy={40 + ((i * 131) % 520)} r={1.5 + (i % 3)} fill="#fff2d6" opacity={0.3 + 0.25 * Math.sin(t * 1.5 + i)} />)}
				<Pool x={MOON.x} y={MOON.y} rx={MOON.r * 1.9} ry={MOON.r * 1.9} k={0.7 * mix(1, 0.55, comp)} />
				<circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="#fbeccb" opacity={mix(0.92, 0.5, comp) * moonIn} />
				<circle cx={MOON.x - 90} cy={MOON.y - 60} r={46} fill="#e9d3a8" opacity={0.5 * mix(1, 0.5, comp)} /><circle cx={MOON.x + 110} cy={MOON.y + 80} r={30} fill="#e9d3a8" opacity={0.45 * mix(1, 0.5, comp)} />
				{/* the branch, coming in from the right */}
				<g opacity={1 - batOut} fill={P.cut}>
					<path d="M 1960 150 Q 1500 170 1240 230 Q 1150 250 1060 240 L 1062 252 Q 1160 262 1250 244 Q 1500 186 1960 176 Z" />
					<path d="M 1500 172 Q 1530 120 1590 100" stroke={P.cut} strokeWidth={8} fill="none" strokeLinecap="round" />
					<path d="M 1330 214 Q 1350 270 1400 300" stroke={P.cut} strokeWidth={6} fill="none" strokeLinecap="round" />
				</g>
				{hang < 1 && flyK > 0 && <g opacity={1 - hang} transform={`translate(${bxF} ${byF}) scale(1 ${flap}) translate(${-bxF} ${-byF})`}><Bat x={bxF} y={byF + 80} s={2.4} /></g>}
				{hang > 0 && <g opacity={hang * (1 - batOut)}><HangingBat x={1110} y={246} s={1.25} /></g>}
				{sonar > 0 && [0, 1, 2, 3].map((i) => { const k = ((t - 66.6 + i * 0.45) % 1.8) / 1.8; const rr = 30 + k * 300; return <path key={i} d={`M ${1110 - rr * 0.8} ${410 + rr * 0.3} A ${rr} ${rr} 0 0 1 ${1110 + rr * 0.8} ${410 + rr * 0.3}`} transform={`rotate(180 1110 410)`} fill="none" stroke="#fff4dc" strokeWidth={4} opacity={sonar * (1 - k) * 0.8} />; })}
				<g opacity={sonar}><Tag x={1520} y={640} size={44} rot={2}>它用回声“看”世界</Tag></g>
				{/* ground for the man */}
				<rect x={0} y={820} width={W} height={260} fill="#2e2a36" opacity={0.55} />
			</g>
			<Pool x={hx} y={800} rx={340} ry={120} k={0.8 * humanIn * (1 - r(t, 77.1, 77.6))} />
			{t < 77.7 && humanIn > 0 && <g opacity={humanIn}>{shadow(hx, 820, 46)}<Human x={hx} y={820} s={1.2} /></g>}
			{bubble > 0 && <g opacity={bubble} transform={`translate(${hx} 0)`}>
				{[[40, 560, 14], [70, 510, 22]].map(([dx, y, rr], i) => <circle key={i} cx={dx} cy={y} r={rr} fill={P.cream} opacity={0.92} />)}
				<g filter="url(#cutShadow)"><ellipse cx={150} cy={330} rx={320} ry={190} fill={P.cream} opacity={0.94} /></g>
				<WingedMan x={150} y={470} s={0.95} flap={Math.sin(t * 6)} />
				<text x={380} y={250} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 72}} fill={P.ink}>？</text>
			</g>}
			<g opacity={fadeIO(t, 70.0, 70.5, 71.8, 72.3)}><Tag x={hx + 150} y={110} size={48} rot={-2}>想象 ≠ 成为</Tag></g>
			{t < 77.7 && comp > 0 && <g opacity={comp}>
				{shadow(1150, 820, 66)}<Cat x={1150} y={820} s={1.4} />
				{shadow(1570, 820, 46)}<Fly x={1570} y={820} s={2.4} />
				<path d={`M ${hx + 20} 600 Q 840 470 1010 600`} fill="none" stroke={P.cream} strokeWidth={3} strokeDasharray="4 14" opacity={0.6} />
				<path d={`M ${hx + 20} 600 Q 1100 430 1430 640`} fill="none" stroke={P.cream} strokeWidth={3} strokeDasharray="4 14" opacity={0.6} />
			</g>}
			{meter(0.72, 1150, 600)}{meter(0.1, 1570, 660)}
			<Heart id="bc" x={1150} y={510} size={110} level={0.75} pop={lin(t, 75.4, 75.8)} o={1 - r(t, 77.1, 77.6)} />
			<Heart id="bf" x={1570} y={575} size={70} level={0.04} pop={lin(t, 75.7, 76.1)} o={1 - r(t, 77.1, 77.6)} />
		</g>
	);
};

/* ============================================================ 3 · the ruler and the red line (77.6–126.4) */
const TYPES: [React.FC<any>, number][] = [[Human, 1.0], [Ape, 1.1], [Dog, 1.1], [Cat, 1.05], [Chicken, 1.15], [Lizard, 1.0], [Fish, 1.25], [Octopus, 1.15], [Bee, 1.6], [Fly, 1.7], [Worm, 1.3], [Jelly, 1.25], [Mushroom, 1.15]];
const RULER_H = [175, 145, 125, 112, 110, 36, 52, 100, 62, 78, 36, 108, 115];
const CARE = [-1, 1, 0.95, 0.9, 0.7, 0.45, 0.4, 0.35, 0.2, 0.08, 0.18, 0.05, 0];
const RY = 700;
const slotX = (i: number) => 200 + (1540 * i) / 12;
const KANT = 264, BENTHAM = 1163, SCHWEITZER = 1860;
// the three that walk over from the night scene: [index, from x, from scale]
const WALKERS: Record<number, [number, number]> = {0: [520, 1.2], 3: [1150, 1.4], 9: [1570, 2.4]};
const litAt = (t: number) => {
	if (t < 84.6) return 620;
	if (t < 97.8) return mix(620, KANT, r(t, 84.6, 85.6));
	if (t < 123.4) return mix(KANT, BENTHAM, r(t, 97.8, 99.0));
	return mix(BENTHAM, SCHWEITZER + 200, r(t, 123.4, 124.8));
};
const RedLine: React.FC<{x: number; t0: number; t: number; ghost: number; label: string; lx?: number; ly?: number; out: number}> = ({x, t0, t, ghost, label, lx, ly = 200, out}) => {
	const draw = r(t, t0, t0 + 0.7);
	if (draw <= 0) return null;
	const o = mix(0.95, 0.38, ghost);
	return (
		<g opacity={1 - out}>
			<path d={`M ${x} 250 L ${x + 4} 800`} fill="none" stroke={P.red} strokeWidth={mix(13, 8, ghost)} strokeLinecap="round" pathLength={1} strokeDasharray={ghost > 0.5 ? '0.03 0.025' : '1 1'} strokeDashoffset={ghost > 0.5 ? 0 : 1 - draw} opacity={o} />
			<g opacity={r(t, t0 + 0.3, t0 + 0.8) * mix(1, 0.55, ghost)}><Tag x={lx ?? x} y={ly} size={44} rot={-2}>{label}</Tag></g>
		</g>
	);
};
const RulerScene: React.FC<{t: number}> = ({t}) => {
	const lit = litAt(t);
	const walk = s5(t, 77.5, 79.1);                        // the three walk onto the ruler
	const rulerDraw = s5(t, 77.9, 79.0);
	const cold = r(t, 95.3, 96.6) * (1 - r(t, 98.0, 99.5));
	const seek = t < 84.6 ? (t < 82.0 ? 760 + Math.sin((t - 78.6) * 1.2) * 420 : 760 + Math.sin((82.0 - 78.6) * 1.2) * 420) : 0;
	const scaleIn = r(t, 108.9, 109.8) * (1 - r(t, 122.6, 123.3));
	const tilt = mix(-11, 0, r(t, 112.4, 113.6));
	const pulse = t > 103.2 && t < 106.4;
	// leaving for the river: labels and hearts go first, then the ruler sinks while the lamp gathers into a sun
	const tagsOut = r(t, 124.9, 125.4), heartsOut = r(t, 125.0, 125.5), sink = s5(t, 125.0, 125.9);
	const gather = s5(t, 125.2, 126.5);
	const px = Math.max(420, (lit + 80) / 2), prx = Math.max(520, lit / 2 + 300);
	return (
		<g>
			<Pool x={mix(px, 1250, gather)} y={mix(660, 560, gather)} rx={mix(prx, 150, gather)} ry={mix(560, 150, gather)} k={mix(t < 79.2 ? Math.max(0.55 * s5(t, 77.4, 78.4), rulerDraw) : 1, 1, gather)} />
			<g transform={`translate(0 ${sink * 420})`} opacity={1 - sink}>
				<g filter="url(#cutShadow)"><rect x={110} y={RY + 6} width={1720 * rulerDraw} height={64} rx={6} fill={P.cream} /></g>
				{Array.from({length: 69}, (_, i) => (130 + i * 24.8 < 110 + 1720 * rulerDraw ? <line key={i} x1={130 + i * 24.8} x2={130 + i * 24.8} y1={RY + 8} y2={RY + (i % 5 ? 24 : 40)} stroke={P.ink} strokeWidth={i % 5 ? 2 : 3} opacity={0.6} /> : null))}
				{TYPES.map(([C, s], i) => {
					let x = slotX(i), y = RY, sc = s, o = 1;
					const wk = WALKERS[i];
					if (wk && walk < 1) { x = mix(wk[0], x, walk); y = mix(820, RY, walk); sc = mix(wk[1], s, walk); }
					if (!wk) o = s5(t, 78.4 + i * 0.07, 79.0 + i * 0.07);
					if (o <= 0) return null;
					const dim = cl((x - lit) / 300) * (wk ? walk : 1);
					const fcol = i === 0 && cold > 0 ? mixHex(P.cut, '#5f7896', cold) : mixHex(P.cut, P.cutDim, dim);
					return (
						<g key={i} opacity={o}>
							{shadow(x, y, 40 * sc + 10, 0.3 * (1 - dim))}
							<C x={x} y={y} s={sc} f={fcol} o={1 - 0.4 * dim} />
							{CARE[i] > 0.02 && <Heart id={`q${i}`} x={x} y={RY - RULER_H[i] - 44} size={mix(40, 74, CARE[i])} level={CARE[i]} pop={lin(t, 79.2 + i * 0.05, 79.6 + i * 0.05)} o={(1 - 0.45 * dim) * (1 - heartsOut)} />}
							{pulse && i > 0 && x < BENTHAM && [0, 1].map((j) => { const k = ((t - 103.2 + j * 0.6 + i * 0.13) % 1.2) / 1.2; return <circle key={j} cx={x} cy={RY - RULER_H[i] / 2} r={20 + k * 70} fill="none" stroke={P.red} strokeWidth={3} opacity={0.55 * (1 - k)} />; })}
						</g>
					);
				})}
				{cold > 0 && Array.from({length: 7}, (_, j) => <path key={j} d={`M ${200 + Math.cos(j) * 46} ${560 + Math.sin(j * 2) * 60} l 6 -10 l 6 10 l -6 10 z`} fill="#dfefff" opacity={0.8 * cold} />)}
			</g>
			{t < 85 && <g opacity={r(t, 79.0, 79.8) * (1 - r(t, 84.4, 84.8))}><path d={`M ${seek} 250 L ${seek + 4} 800`} stroke={P.red} strokeWidth={9} strokeLinecap="round" strokeDasharray="22 22" opacity={0.6} /><text x={seek} y={226} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 72}} fill={P.ink}>？</text></g>}
			<RedLine x={KANT} t0={84.6} t={t} ghost={r(t, 97.8, 98.6)} label="康德：会思考" lx={420} out={tagsOut} />
			<RedLine x={BENTHAM} t0={97.8} t={t} ghost={r(t, 123.4, 124.2)} label="边沁：会不会痛" lx={1330} ly={180} out={tagsOut} />
			<RedLine x={SCHWEITZER} t0={123.4} t={t} ghost={0} label="史怀哲：活着本身" lx={1640} ly={290} out={tagsOut} />
			{cold > 0 && <g opacity={cold}><Tag x={330} y={340} size={42} rot={2} bg="#cfe0ef">对动物狠 → 对人也冷</Tag></g>}
			<g opacity={r(t, 106.2, 106.9) * (1 - r(t, 122.6, 123.3))}><Tag x={1520} y={330} size={44} rot={-2}>1975 · 辛格《动物解放》</Tag></g>
			{scaleIn > 0 && <g opacity={scaleIn} transform={`translate(0 ${(1 - scaleIn) * -60})`}>
				<rect x={694} y={250} width={12} height={200} fill={P.cut} /><path d="M 640 452 L 760 452 L 730 430 L 670 430 Z" fill={P.cut} />
				<g transform={`rotate(${tilt} 700 250)`}>
					<rect x={460} y={244} width={480} height={12} rx={6} fill={P.cut} />
					{([[472, 'L'], [928, 'R']] as [number, string][]).map(([x, side]) => (
						<g key={side} transform={`rotate(${-tilt} ${x} 250)`}>
							<path d={`M ${x} 250 L ${x - 70} 360 M ${x} 250 L ${x + 70} 360`} stroke={P.cut} strokeWidth={3} />
							<path d={`M ${x - 90} 360 Q ${x} 400 ${x + 90} 360 Z`} fill={P.cut} />
							{side === 'L' ? <Chicken x={x} y={362} s={0.85} /> : <Dog x={x} y={362} s={0.8} />}
						</g>
					))}
				</g>
			</g>}
			<Stamp x={700} y={330} text="物种歧视" size={78} k={lin(t, 118.2, 118.7) * (1 - r(t, 122.6, 123.3))} />
			<Stamp x={470} y={480} text="种族歧视" size={44} k={lin(t, 120.6, 121.0) * (1 - r(t, 122.6, 123.3))} rot={4} col="#6b5a66" />
			<Stamp x={930} y={480} text="性别歧视" size={44} k={lin(t, 120.9, 121.3) * (1 - r(t, 122.6, 123.3))} rot={-3} col="#6b5a66" />
		</g>
	);
};

/* ============================================================ 4 · the river at sunset (125.6–147.5) */
const River: React.FC<{t: number}> = ({t}) => {
	const skyIn = s5(t, 125.6, 126.7), skyOut = s5(t, 146.0, 147.4);
	const sunY = mix(560, 575, lin(t, 126, 145)) + s5(t, 145.3, 146.8) * 170;
	const hills = s5(t, 125.9, 127.0);
	const waterIn = s5(t, 126.2, 127.1);
	const boatIn = s5(t, 126.2, 127.8), boatOut = s5(t, 145.6, 147.0);
	const boat = mix(560, 1160, lin(t, 126.0, 145.6)) - (1 - boatIn) * 700 + boatOut * 900;
	const words = fadeIO(t, 131.4, 132.6, 144.6, 145.2);
	const tag = fadeIO(t, 126.6, 127.4, 144.6, 145.1);
	const heartsO = 1 - r(t, 145.0, 145.5);
	const hearts = (d: number) => lin(t, 140.0 + d, 140.4 + d);
	const sinkH = s5(t, 145.3, 146.3);
	const HIPPOS: [number, number, number, boolean][] = [[380, 770, 1.1, false], [700, 860, 1.3, true], [1520, 800, 1.2, false], [1740, 905, 0.9, true]];
	const birds = Array.from({length: 5}, (_, i) => ({x: ((t - 126) * (40 + i * 6) + i * 260) % 2200 - 100, y: 200 + i * 34 + Math.sin(t + i) * 10}));
	return (
		<g opacity={1 - skyOut * 0.0}>
			<defs><linearGradient id="sunset" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4a3a5a" /><stop offset="0.38" stopColor="#b4646a" /><stop offset="0.56" stopColor="#f0a35e" /><stop offset="0.6" stopColor="#f6c27a" /><stop offset="0.61" stopColor="#6c5a70" /><stop offset="1" stopColor="#46405a" /></linearGradient></defs>
			<rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#sunset)" opacity={skyIn * (1 - skyOut)} />
			<circle cx={1250} cy={sunY} r={120} fill="#ffd89a" opacity={0.95 * r(t, 126.0, 126.6) * (1 - skyOut)} />
			<g transform={`translate(0 ${(1 - hills) * 260})`} opacity={hills * (1 - skyOut * 0.7)}>
				<path d="M -40 600 Q 200 520 420 570 T 820 560 T 1240 590 T 1960 560 L 1960 662 L -40 662 Z" fill="#3e2c3e" />
				<path d="M -40 640 Q 300 600 640 630 T 1300 620 T 1960 640 L 1960 662 L -40 662 Z" fill="#2e2232" />
			</g>
			<g opacity={waterIn * (1 - skyOut)}>
				{Array.from({length: 14}, (_, i) => <rect key={i} x={1060 + (i % 4) * 30 - i * 6 + Math.sin(t * 1.4 + i) * 10} y={690 + i * 22} width={300 - i * 14} height={5} fill="#ffd89a" opacity={(0.5 - i * 0.03) * (1 - sinkH)} />)}
				{birds.map((b, i) => <path key={i} d={`M ${b.x - 14} ${b.y} q 7 -8 14 0 q 7 -8 14 0`} fill="none" stroke={P.cut} strokeWidth={3} opacity={0.8} />)}
				{HIPPOS.map(([x, y, s, f], i) => <g key={i} opacity={(1 - sinkH)} transform={`translate(0 ${Math.sin(t * 1.1 + i * 1.7) * 4 + (1 - s5(t, 126.6 + i * 0.15, 127.6 + i * 0.15)) * 50 + sinkH * 45})`}><Hippo x={x} y={y} s={s} flip={f} /></g>)}
				<g transform={`translate(${boat - 1000} ${Math.sin(t * 1.3) * 3})`}>
					<g filter="url(#cutShadow)" fill={P.cut}><path d="M 760 760 Q 1000 800 1240 752 L 1222 784 Q 1000 822 780 790 Z" /></g>
					<Robe x={900} y={778} s={0.62} /><Robe x={1010} y={782} s={0.7} /><Robe x={1110} y={776} s={0.62} flip />
					<path d={`M 1130 740 L ${1180 + Math.sin(t * 1.6) * 20} 830`} stroke={P.cut} strokeWidth={5} strokeLinecap="round" />
				</g>
			</g>
			<g opacity={tag}><Tag x={430} y={140} size={42} rot={-2}>1915 · 非洲 · 奥果韦河</Tag></g>
			{words > 0 && <text x={960} y={mix(380, 350, words)} textAnchor="middle" opacity={words} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 150, letterSpacing: '0.2em'}} fill="#fff1d0" stroke="rgba(90,40,30,0.35)" strokeWidth={2}>敬畏生命</text>}
			{t > 134 && t < 145.6 && motes(t, 960, 760, 900, 160, 50, 41, r(t, 134.4, 136.0) * (1 - r(t, 145.0, 145.6)))}
			<Heart id="rv0" x={380} y={680} size={70} level={1} pop={hearts(0)} o={heartsO} /><Heart id="rv1" x={700} y={765} size={70} level={1} pop={hearts(0.15)} o={heartsO} />
			<Heart id="rv2" x={1520} y={705} size={70} level={1} pop={hearts(0.3)} o={heartsO} /><Heart id="rv3" x={boat} y={630} size={70} level={1} pop={hearts(0.45)} o={heartsO} />
			<Heart id="rv4" x={birds[1].x} y={birds[1].y - 50} size={50} level={1} pop={hearts(0.6)} o={heartsO} />
		</g>
	);
};

/* ============================================================ 5 · the growing circles (146.2–168.2) */
const RINGS = ['家人', '阶层', '国家', '全人类', '动物'];
const Rings: React.FC<{t: number}> = ({t}) => {
	const cx = 960, cy = 500, sq = 0.6;
	const ringT = [149.6, 152.3, 153.1, 153.9, 154.9];
	const grow = 1 + 0.22 * r(t, 162.4, 166.0) + 0.18 * s5(t, 166.0, 167.9);
	const R = (i: number) => (130 + i * 112) * grow;
	const ringK = (i: number) => r(t, ringT[i], ringT[i] + 0.8);
	const people: [number, number, number, number][] = [[0, 40, 0.5, 0], [-190, 70, 0.4, 0], [180, 60, 0.38, 0], [-300, -40, 0.34, 1], [320, 150, 0.34, 2], [-260, 200, 0.32, 2], [400, -30, 0.3, 3], [-430, 110, 0.3, 3], [120, 270, 0.3, 3]];
	const careRing = [1, 0.8, 0.6, 0.45, 0.2];
	const labelsOut = r(t, 165.3, 166.0);
	const lampIn = s5(t, 146.4, 147.6);
	return (
		<g>
			<Pool x={cx} y={cy} rx={mix(mix(60, 360, lampIn), 900, r(t, 149.0, 155.6)) * grow} ry={mix(mix(40, 240, lampIn), 520, r(t, 149.0, 155.6)) * grow} k={lampIn * (1 + 0.3 * s5(t, 166.2, 167.9))} />
			{/* the sun has set: ripples spread from where it went down, and the first one stays as 家人 */}
			{[0, 1, 2].map((i) => <Ripple key={i} cx={cx} cy={cy} t={t} t0={146.4 + i * 0.5} dur={2.2} r0={20} r1={700} sq={sq} o={0.55} />)}
			{RINGS.map((name, i) => {
				const k = ringK(i); if (k <= 0) return null;
				const last = i === RINGS.length - 1;
				return last
					? <ellipse key={i} cx={cx} cy={cy} rx={R(i)} ry={R(i) * sq} fill="none" stroke={P.red} strokeWidth={10 + 6 * s5(t, 166.6, 167.9)} strokeLinecap="round" pathLength={100} strokeDasharray={`${mix(0, 78, k) + 22 * r(t, 162.4, 165.4)} 100`} strokeDashoffset={-30} opacity={0.9} />
					: <ellipse key={i} cx={cx} cy={cy} rx={R(i) * mix(0.6, 1, k)} ry={R(i) * sq * mix(0.6, 1, k)} fill="none" stroke={P.ink} strokeWidth={4} opacity={0.5 * k} />;
			})}
			{people.map(([dx, dy, s, ring], i) => { const k = ringK(ring); return k > 0 ? <g key={i} opacity={k}><Human x={cx + dx * grow} y={cy + dy * grow} s={s} /></g> : null; })}
			{(() => { const k = ringK(4); return k > 0 ? <g opacity={k}>
				<Cat x={cx - 590 * grow} y={cy + 120 * grow} s={0.9} /><Dog x={cx + 600 * grow} y={cy + 60 * grow} s={0.85} /><Chicken x={cx + 420 * grow} y={cy + 300 * grow} s={0.85} /><Fish x={cx - 380 * grow} y={cy + 330 * grow} s={0.9} />
			</g> : null; })()}
			<g opacity={r(t, 162.6, 164.6)}><Fly x={cx - 560 * grow} y={cy - 150 * grow} s={1.4} /></g>
			<g opacity={1 - labelsOut}>
				{RINGS.map((name, i) => { const k = ringK(i); if (k <= 0) return null; const last = i === RINGS.length - 1; return <g key={name} opacity={k}><Tag x={cx + (i % 2 ? 16 : -16)} y={cy - R(i) * sq + 14} size={last ? 46 : 40} rot={i % 2 ? 2 : -2} bg={last ? P.cream : '#efdfc0'} col={last ? P.red : P.ink}>{name}</Tag></g>; })}
				<g opacity={fadeIO(t, 147.4, 148.0, 165.3, 166.0)}><Tag x={330} y={150} size={42} rot={-2}>1869 · 莱基</Tag></g>
			</g>
			{RINGS.map((_, i) => <Heart key={i} id={`rg${i}`} x={cx + R(i) * 0.72} y={cy + R(i) * sq * 0.72} size={mix(70, 40, i / 4)} level={careRing[i]} pop={lin(t, 159.6 + i * 0.18, 160.0 + i * 0.18)} o={1 - r(t, 165.0, 165.8)} />)}
		</g>
	);
};

/* ============================================================ 6 · the drop (2:47.9): the circle bursts, everyone is in the light */
export const DROP2 = 167.9;
const GX = 1600, GY = 780;
type G = {C: React.FC<any>; x: number; s: number; care: number; hy: number; y?: number; flip?: boolean};
const GRAND: G[] = [
	{C: Frog, x: 330, s: 1.4, care: 0.4, hy: 80}, {C: Lizard, x: 500, s: 1.3, care: 0.45, hy: 60}, {C: Ape, x: 700, s: 1.2, care: 1, hy: 180},
	{C: Human, x: 900, s: 1.15, care: 1, hy: 220}, {C: Dog, x: 1080, s: 1.2, care: 0.95, hy: 150}, {C: Cat, x: 1260, s: 1.3, care: 0.9, hy: 150},
	{C: Chicken, x: 2080, s: 1.3, care: 0.7, hy: 140}, {C: Hippo, x: 2330, s: 1.0, care: 0.6, hy: 70, y: 812, flip: true}, {C: Fish, x: 2510, s: 1.1, care: 0.4, hy: 60, y: 840},
	{C: Mushroom, x: 2650, s: 1.2, care: 0.05, hy: 140},
];
const FLY = {x: 2860, y: 772};
const camG = (t: number) => {
	const moves: [number, number, number, number, number][] = [[DROP2, DROP2, 1600, 560, 0.62], [170.3, 172.5, 2680, 640, 1.0], [175.6, 178.9, 1620, 520, 0.53]];
	let [cx, cy, s] = [moves[0][2], moves[0][3], moves[0][4]];
	for (const [a, b, x, y, z] of moves) {
		if (t >= b) [cx, cy, s] = [x, y, z];
		else if (t > a) { const k = smooth((t - a) / (b - a)); return {cx: mix(cx, x, k), cy: mix(cy, y, k), s: mix(s, z, k) * (1 + 0.012 * (t - DROP2))}; }
	}
	return {cx, cy, s: s * (1 + 0.012 * (t - DROP2))};
};
const Grand: React.FC<{t: number}> = ({t}) => {
	const cam = camG(t);
	const burst = s5(t, DROP2, DROP2 + 0.9);
	const seen = s5(t, 173.1, 174.6), one = s5(t, 175.8, 177.8);
	const R = rng(5);
	const lanterns: React.ReactNode[] = [];
	const emitters = [...GRAND.map((g) => ({x: g.x, y: (g.y ?? GY) - g.hy - 60, from: DROP2 + 0.5})), {x: GX + 20, y: GY - 360, from: DROP2 + 0.2}, {x: FLY.x, y: FLY.y - 150, from: 173.6}];
	emitters.forEach((e, i) => {
		for (let k = 0; k < 7; k++) {
			const st = e.from + R() * 1.4 + k * mix(2.2, 1.2, one), life = 5.5, sw = R() * 6;
			const a = (t - st) / life; if (a <= 0 || a >= 1) continue;
			lanterns.push(<Heart key={`${i}_${k}`} id={`ln${i}_${k}`} x={e.x + Math.sin(a * 5 + sw) * 30 + a * 60} y={e.y - a * 520} size={mix(34, 22, a)} level={1} o={Math.sin(a * Math.PI) * 0.85} />);
		}
	});
	return (
		<g transform={`translate(${960 - cam.cx * cam.s} ${540 - cam.cy * cam.s}) scale(${cam.s})`}>
			{/* night field */}
			{Array.from({length: 60}, (_, i) => <circle key={i} cx={-300 + ((i * 397) % 3800)} cy={-200 + ((i * 131) % 700)} r={2 + (i % 3)} fill="#fff2d6" opacity={0.35 + 0.25 * Math.sin(t * 1.3 + i)} />)}
			<path d="M -600 700 Q 200 640 900 690 T 2200 680 T 3800 700 L 3800 790 L -600 790 Z" fill="#3b3446" opacity={0.8} />
			<rect x={-600} y={GY} width={4400} height={700} fill="#3a3040" />
			<Pool x={GX} y={640} rx={mix(1000, 1350, burst)} ry={mix(460, 560, burst)} k={1} />
			<Pool x={GX} y={560} rx={1900} ry={900} k={0.75 * (1 - s5(t, DROP2 + 0.2, DROP2 + 2.4))} />
			<Pool x={FLY.x} y={700} rx={mix(120, 420, seen)} ry={mix(80, 260, seen)} k={mix(0.15, 1, seen)} />
			<Pool x={1700} y={600} rx={2500} ry={900} k={0.9 * one} />
			<ellipse cx={2420} cy={836} rx={250} ry={44} fill={P.water} opacity={0.75} />
			<ellipse cx={FLY.x} cy={GY + 6} rx={70} ry={26} fill="#4a3c3a" />
			{/* the bat flies over, birds go home */}
			<g transform={`translate(${2150 - (t - DROP2) * 60} ${260 + Math.sin(t * 2) * 14}) scale(1 ${0.72 + 0.28 * Math.sin(t * 12)})`}><Bat x={0} y={60} s={1.2} /></g>
			{GRAND.map((g, i) => {
				const d = Math.abs(g.x - GX) / 1400;
				const o = s5(t, DROP2 + 0.05 + d * 0.5, DROP2 + 0.5 + d * 0.5);
				const y = g.y ?? GY;
				return (
					<g key={i}>
						<g opacity={o}>{g.y ? null : shadow(g.x, y, 40 * g.s + 10, 0.3)}<g.C x={g.x} y={y} s={g.s} flip={g.flip} /></g>
						{g.care > 0.02 && <Heart id={`gr${i}`} x={g.x} y={y - g.hy - 40} size={mix(60, 96, g.care)} level={mix(g.care, 1, one)} pop={lin(t, DROP2 + 0.25 + d * 0.9, DROP2 + 0.65 + d * 0.9)} />}
					</g>
				);
			})}
			{shadow(GX, GY, 330, 0.35)}
			<g transform={`translate(${GX} ${GY}) scale(${mix(0.92, 1, burst)}) translate(${-GX} ${-GY})`}>
				<g transform={`translate(${GX - 20} ${GY})`}><g transform="scale(2.3)" fill={P.cut} filter="url(#cutShadow)">
					<ellipse cx={-10} cy={-84} rx={100} ry={56} /><ellipse cx={46} cy={-100} rx={50} ry={44} />
					<path d="M 70 -128 C 110 -122 140 -100 160 -66 L 176 -42 C 172 -30 150 -30 136 -36 L 100 -50 Z" />
					<polygon points="150,-62 176,-120 166,-56" /><polygon points="124,-82 134,-108 140,-78" /><polygon points="86,-122 80,-148 98,-126" />
					{[[-86, 30], [-50, 28], [30, 30], [66, 28]].map(([lx, w], i) => <rect key={i} x={lx} y={-58} width={w} height={58} rx={8} />)}
				</g></g>
			</g>
			<Heart id="gsudan" x={GX + 20} y={GY - 430} size={230} level={1} pop={lin(t, DROP2 + 0.1, DROP2 + 0.55)} />
			{/* the fly, at the edge, where the light has not reached yet */}
			<g>{shadow(FLY.x, FLY.y, 40, 0.3 * seen)}<Fly x={FLY.x} y={FLY.y} s={2.6} f={mixHex(P.cutDim, P.cut, seen)} /></g>
			<Heart id="gfly" x={FLY.x} y={FLY.y - 150} size={mix(60, 110, seen)} level={mix(0.06, 1, seen)} pop={lin(t, 170.6, 171.0)} />
			{seen > 0 && seen < 1 && <ellipse cx={FLY.x} cy={FLY.y - 40} rx={mix(30, 260, seen)} ry={mix(20, 170, seen)} fill="none" stroke="#fff3d6" strokeWidth={4} opacity={0.7 * (1 - seen)} />}
			{lanterns}
			{motes(t, 1700, 520, 1800, 380, 90, 61, 0.6 + 0.6 * one)}
		</g>
	);
};
/* screen-space build-up and burst around the drop */
const Burst: React.FC<{t: number}> = ({t}) => {
	if (t < 166.0 || t > DROP2 + 2.2) return null;
	const R = rng(99); const out: React.ReactNode[] = [];
	const cx = 960, cy = 520;
	for (let i = 0; i < 140; i++) {
		const a = R() * Math.PI * 2, d0 = 500 + R() * 700, sp = 0.6 + R() * 0.8, rad = 2 + R() * 3.5;
		if (t < DROP2) {      // gathering in
			const k = Math.pow(lin(t, 166.0 + R() * 0.6, DROP2), 2.2);
			if (k <= 0) continue;
			const d = d0 * (1 - k);
			out.push(<circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.7} r={rad} fill="#fff1d2" opacity={0.85 * Math.min(1, k * 3)} />);
		} else {              // thrown out
			const k = (t - DROP2) * sp;
			const d = 40 + (1 - Math.exp(-k * 2.2)) * d0 * 1.4;
			const o = Math.max(0, 1 - (t - DROP2) / 2.0);
			out.push(<circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.7} r={rad * (1 + k * 0.4)} fill={i % 3 ? '#fff1d2' : '#f6cf86'} opacity={o * 0.9} />);
		}
	}
	const wave = (dly: number, w: number) => { const k = lin(t, DROP2 + dly, DROP2 + dly + 1.0); if (k <= 0 || k >= 1) return null; const rr = mix(300, 2300, 1 - Math.pow(1 - k, 2.4)); return <ellipse cx={cx} cy={cy} rx={rr} ry={rr * 0.6} fill="none" stroke={dly ? '#fff1d2' : P.red} strokeWidth={w * (1 - k) + 4} opacity={0.75 * (1 - k)} />; };
	const bloom = t >= DROP2 ? Math.exp(-(t - DROP2) * 1.6) * Math.min(1, (t - DROP2) / 0.25) : 0;
	return <g>{bloom > 0.01 && <ellipse cx={cx} cy={cy} rx={1100} ry={640} fill="url(#pool28)" opacity={0.45 * bloom} />}{out}{wave(0, 60)}{wave(0.14, 26)}</g>;
};

/* ============================================================ the hand-overs */
export const Rest: React.FC<{t: number}> = ({t}) => {
	if (t < 51.8) return null;
	const stages: React.ReactNode[] = [];
	// bridge → (push into the moon) → night: the bridge scene scales up around its moon until the moon becomes the big moon
	if (t < 65.2) {
		const push = s5(t, 63.3, 64.9);
		const mx = mix(960, 1560, push), my = mix(540, 200, push), z = mix(1, 4.0, push);
		const tx = mix(960, MOON.x, push), ty = mix(540, MOON.y, push);
		stages.push(<g key="br" opacity={1 - r(t, 64.75, 65.1)} transform={`translate(${tx} ${ty}) scale(${z}) translate(${-mx} ${-my})`}><Bridge t={t} /></g>);
	}
	if (t > 64.5 && t < 79.5) stages.push(<g key="bat" opacity={r(t, 64.6, 65.0)}><BatScene t={t} /></g>);
	if (t > 77.4 && t < 126.6) stages.push(<g key="ru"><RulerScene t={t} /></g>);
	if (t > 125.5 && t < 147.6) stages.push(<g key="rv"><River t={t} /></g>);
	if (t > 146.2 && t < 169.0) stages.push(<g key="rg" opacity={1 - s5(t, DROP2, DROP2 + 0.9)}><Rings t={t} /></g>);
	if (t >= DROP2 - 0.05) stages.push(<g key="gd" opacity={r(t, DROP2 - 0.05, DROP2 + 0.3) * (1 - 0.8 * r(t, 181.0, 181.8))}><Grand t={t} /></g>);
	stages.push(<Burst key="bu" t={t} />);
	return <g>{stages}</g>;
};
