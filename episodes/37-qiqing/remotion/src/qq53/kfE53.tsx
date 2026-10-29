import React from 'react';
import {W, H, rnd, lerp, cl, SANS, KAI} from '../qq50/kit50';
import {B, Pool} from '../qq50/styleB';
import {SealHollow} from '../qq51/master51';
import {Frame53, Sub53, Stamp53, Tag, Scrim, mix, lookAt, proj, poly, latticeCells, V3} from './parts53';
import {Sword, BZ, LAT, SW, bladeHW, birdMark, LB} from './props53';
const LB_MM = LB * 10;
import {Glint} from './kfA53';
/* ep53 key frames, part E (2-D, the sword prop of props53 at large scale):
   KF07 D6 — 「洗净剑鞘，拔出来：寒光闪闪」: two gloved hands, one on the washed black lacquer sheath, one drawing the sword by its grip;
   the exposed blade throws a cold flash. Sword level, tip left inside the sheath, pommel right (the draw goes right/toward us).
   KF08 I1 — the inscription near the guard, read on a phone: two rows of four bird-script marks (abstract, NOT traced glyphs);
   the two nearest the guard on the lower row (鸠浅) glow; plain type 鸠浅 ＝ 勾践 below; the 1966 letters in the blade's polish.
   KF09 B1 — 1977, the science film 《古剑》: the blade's tip half, edge down, has gone through the top 20-odd of 30-odd sheets. */


/** an abstract 鸟篆-style glyph (ornament, NOT a character): a curved main stroke with a hooked foot, one or two cross strokes
    with curled ends, a side stroke, and a bird — head with a beak and a crest — sitting on top, a tail curl at the bottom.
    Box: width ≈ 0.64 s, height s, centred on (0, 0); y down. Returns stroke paths and the eye dots. */
export const birdGlyph = (s: number, seed: number) => { const r = (k: number) => rnd(seed * 13 + k, 29), f = (v: number) => (v * s).toFixed(1), P = (u: number, v: number) => `${f(u)},${f(v)}`;
	const m = r(1) > 0.5 ? 1 : -1, a = (r(2) - 0.5) * 0.12, d: string[] = [];
	d.push(`M${P(a, -0.3)} C${P(a + m * 0.16, -0.08)} ${P(a - m * 0.16, 0.16)} ${P(a, 0.38)} q${f(m * 0.02)},${f(0.1)} ${f(m * 0.13)},${f(0.06)}`);           // main stroke, hooked foot
	const n = r(3) > 0.45 ? 2 : 1;
	for (let i = 0; i < n; i++) { const v = n === 1 ? 0.02 : -0.1 + i * 0.24, w = 0.22 + 0.06 * r(4 + i);
		d.push(`M${P(-w, v + 0.03)} Q${P(0, v - 0.05)} ${P(w, v + 0.02)} q${f(0.05)},${f(0.05)} ${f(0.0)},${f(0.1)}`); }                                   // cross strokes, curled right end
	const sx = -m * (0.2 + 0.05 * r(6));
	d.push(`M${P(sx, 0.08)} L${P(sx, 0.34)} q${f(-m * 0.0)},${f(0.08)} ${f(-m * 0.08)},${f(0.06)}`);                                                          // side stroke
	const hx = a + m * 0.04, hy = -0.4;
	d.push(`M${P(hx - m * 0.05, hy + 0.1)} Q${P(hx - m * 0.08, hy)} ${P(hx, hy - 0.02)}`);                                                                // neck to head
	d.push(`M${P(hx + m * 0.05, hy - 0.01)} L${P(hx + m * 0.14, hy + 0.01)} L${P(hx + m * 0.05, hy + 0.035)}`);                                             // beak
	d.push(`M${P(hx - m * 0.02, hy - 0.05)} q${f(-m * 0.06)},${f(-0.09)} ${f(-m * 0.15)},${f(-0.04)} q${f(-m * 0.04)},${f(0.04)} ${f(m * 0.0)},${f(0.06)}`);   // crest curl
	d.push(`M${P(a + m * 0.12, 0.44)} q${f(m * 0.1)},${f(0.02)} ${f(m * 0.1)},${f(-0.08)} q${f(0)},${f(-0.06)} ${f(-m * 0.05)},${f(-0.04)}`);                 // tail curl
	return {d, head: [hx * s, hy * s] as [number, number], r: 0.05 * s}; };
const Glyph: React.FC<{x: number; y: number; s: number; seed: number; rot: number; col: string; w: number; o?: number}> = ({x, y, s, seed, rot, col, w, o = 1}) => { const g = birdGlyph(s, seed);
	return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>{g.d.map((p, i) => <path key={i} d={p} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />)}
		<circle cx={g.head[0]} cy={g.head[1]} r={g.r} fill="none" stroke={col} strokeWidth={w * 0.8} /></g>; };

/* ---------- a gloved hand wrapped round a horizontal bar (seen from above), its sleeve running off the frame edge ---------- */
const Glove: React.FC<{x: number; y: number; w: number; bar: number; sleeveTo: [number, number]; id: string; rot?: number}> = ({x, y, w, bar, sleeveTo, id, rot = 0}) => {
	const hw = w / 2, hh = bar * 0.95;   // the wrap is a little taller than the bar it holds
	const wr: [number, number] = [x, y + hh * 0.9], sx = sleeveTo[0], sy = sleeveTo[1], nx = -(sy - wr[1]), ny = sx - wr[0], nl = Math.hypot(nx, ny) || 1, sw = w * 0.42;
	const sleeve = `M${wr[0] + nx / nl * sw},${wr[1] + ny / nl * sw} L${sx + nx / nl * sw * 1.5},${sy + ny / nl * sw * 1.5} L${sx - nx / nl * sw * 1.5},${sy - ny / nl * sw * 1.5} L${wr[0] - nx / nl * sw},${wr[1] - ny / nl * sw} Z`;
	return <g>
		<defs><linearGradient id={`gv${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A4C52" /><stop offset="0.5" stopColor="#2C2E34" /><stop offset="1" stopColor="#1A1B20" /></linearGradient></defs>
		<defs><linearGradient id={`sl${id}`} gradientUnits="userSpaceOnUse" x1={wr[0]} y1={wr[1]} x2={sx} y2={sy}><stop offset="0" stopColor="#262833" /><stop offset="1" stopColor="#101118" /></linearGradient></defs>
		<path d={sleeve} fill={`url(#sl${id})`} />
		{[0.35, 0.62].map((u) => { const cx = lerp(wr[0], sx, u), cy = lerp(wr[1], sy, u); return <path key={u} d={`M${cx + nx / nl * sw * (1 + u * 0.5) * 0.8},${cy + ny / nl * sw * (1 + u * 0.5) * 0.8} Q${cx + 10},${cy + 14} ${cx - nx / nl * sw * 0.3},${cy - ny / nl * sw * 0.3}`} stroke="#07080C" strokeOpacity={0.55} strokeWidth={3} fill="none" />; })}
		<path d={`M${wr[0] + nx / nl * sw},${wr[1] + ny / nl * sw} L${sx + nx / nl * sw * 1.5},${sy + ny / nl * sw * 1.5}`} stroke="#FFD49A" strokeOpacity={0.3} strokeWidth={2} />
		<g transform={`rotate(${rot} ${x} ${y})`}>
			{/* the cuff, the wrap of four fingers over the bar, the thumb along the top */}
			<rect x={x - hw * 0.8} y={y + hh * 0.55} width={w * 0.8} height={hh * 0.7} rx={hh * 0.25} fill="#23252C" />
			<path d={`M${x - hw},${y - hh * 0.2} Q${x - hw},${y - hh} ${x - hw * 0.4},${y - hh} L${x + hw * 0.5},${y - hh} Q${x + hw},${y - hh} ${x + hw},${y - hh * 0.25} L${x + hw},${y + hh * 0.55} Q${x + hw},${y + hh * 0.9} ${x + hw * 0.6},${y + hh * 0.9} L${x - hw * 0.6},${y + hh * 0.9} Q${x - hw},${y + hh * 0.9} ${x - hw},${y + hh * 0.5} Z`} fill={`url(#gv${id})`} />
			{[-0.5, 0, 0.5].map((u) => <path key={u} d={`M${x + u * hw},${y - hh * 0.95} L${x + u * hw},${y + hh * 0.2}`} stroke="#14151A" strokeWidth={2.5} strokeOpacity={0.7} />)}
			<path d={`M${x - hw * 0.9},${y - hh * 0.75} Q${x - hw * 0.3},${y - hh * 1.25} ${x + hw * 0.55},${y - hh * 1.05}`} stroke="#3C3E46" strokeWidth={hh * 0.42} strokeLinecap="round" fill="none" />
			<path d={`M${x - hw},${y - hh * 0.2} Q${x - hw},${y - hh} ${x - hw * 0.4},${y - hh} L${x + hw * 0.5},${y - hh}`} fill="none" stroke="#FFD49A" strokeOpacity={0.45} strokeWidth={2} />
		</g>
	</g>; };

/* ===================== KF07 · D6 the draw ===================== */
const K7 = 27, P7: [number, number] = [1610, 650];   // px per cm; the pommel end
export const KF07: React.FC = () => {
	const ax = (a: number): [number, number] => [P7[0] - a * K7, P7[1]];          // a point on the axis, a cm from the pommel end
	const mouthA = SW.bladeA + 17.5, mouth = ax(mouthA), tipA = SW.L + 2.2;
	const sheathHW = (a: number) => (bladeHW(Math.min(SW.L - SW.bladeA - 0.5, a - SW.bladeA)) + 0.55) * K7;
	const sh = Array.from({length: 40}, (_, i) => lerp(mouthA, tipA, i / 39));
	const top = sh.map((a, i) => `${ax(a)[0].toFixed(1)},${(P7[1] - (i === 39 ? 0.3 * K7 : sheathHW(a))).toFixed(1)}`), bot = sh.map((a, i) => `${ax(a)[0].toFixed(1)},${(P7[1] + (i === 39 ? 0.3 * K7 : sheathHW(a))).toFixed(1)}`).reverse();
	const sheath = `M${top.join('L')}L${bot.join('L')}Z`;
	const g0 = ax(SW.guardA)[0], m0 = mouth[0];
	const drops = Array.from({length: 22}, (_, i) => { const a = lerp(mouthA + 1, tipA - 2, rnd(i, 11)), [x] = ax(a), y = P7[1] + (rnd(i, 12) - 0.5) * 1.6 * sheathHW(a), r = 2.5 + 5 * rnd(i, 13);
		return <g key={i}><ellipse cx={x} cy={y} rx={r} ry={r * 0.8} fill="#9AA2A6" opacity={0.35} /><circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#F4F8F8" opacity={0.85} /></g>; });
	return <Frame53 id="k7" sheen={0.15} vig={0.55} over={<><Sub53 id="D6" /><Stamp53 id="D6" /><SealHollow /></>}>
		<defs><linearGradient id="k7cold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E8F4FF" stopOpacity="0" /><stop offset="0.35" stopColor="#E8F4FF" stopOpacity="0.75" /><stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.95" /><stop offset="0.8" stopColor="#D8ECFF" stopOpacity="0.4" /><stop offset="1" stopColor="#D8ECFF" stopOpacity="0" /></linearGradient>
			<linearGradient id="k7sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2A24" /><stop offset="0.2" stopColor="#140C0A" /><stop offset="0.75" stopColor="#0C0706" /><stop offset="1" stopColor="#1E1410" /></linearGradient>
			<clipPath id="k7bl"><rect x={m0} y={P7[1] - 120} width={g0 - m0} height={240} /></clipPath>
			<filter id="k7b" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9" /></filter></defs>
		{/* the lamp's pool on the wet cloth where they work; water still running off */}
		<Pool id="k7p" x={980} y={P7[1] + 30} rx={940} ry={330} a={0.3} col="#FFB868" />
		<path d={`M-40,${P7[1] + 230} Q900,${P7[1] + 200} ${W + 40},${P7[1] + 250} V${H + 40} H-40 Z`} fill="#2A1E16" opacity={0.6} />
		<ellipse cx={1000} cy={P7[1] + 120} rx={760} ry={40} fill="#000" opacity={0.45} filter="url(#k7b)" />
		{/* the sword: the blade's covered part is hidden under the sheath (drawn on top), the exposed part flashes */}
		<Sword x={P7[0]} y={P7[1]} k={K7} rot={-90} id="k7s" spec={0.5} />
		<g clipPath="url(#k7bl)"><rect x={m0} y={P7[1] - 80} width={g0 - m0} height={160} fill="url(#k7cold)" opacity={0.85} /></g>
		{/* the black lacquer sheath, washed and still wet: a thin red lacquer line runs along it */}
		<path d={sheath} fill="url(#k7sh)" stroke="#060403" strokeWidth={2} />
		<path d={`M${top.slice(2, 37).join('L')}`} fill="none" stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={3} transform="translate(0,7)" />
		<path d={`M${sh.slice(1, 37).map((a) => `${ax(a)[0].toFixed(1)},${(P7[1] + sheathHW(a) * 0.55).toFixed(1)}`).join('L')}`} fill="none" stroke="#7A2A1A" strokeOpacity={0.7} strokeWidth={2.5} />
		<path d={`M${sh.slice(1, 37).map((a) => `${ax(a)[0].toFixed(1)},${(P7[1] - sheathHW(a) * 0.55).toFixed(1)}`).join('L')}`} fill="none" stroke="#7A2A1A" strokeOpacity={0.7} strokeWidth={2.5} />
		<rect x={m0 - 18} y={P7[1] - sheathHW(mouthA) - 4} width={22} height={2 * sheathHW(mouthA) + 8} rx={6} fill="#1E1410" stroke="#5A3A28" strokeWidth={2} />
		{drops}
		{/* the hands: the left holds the sheath just behind its mouth, the right draws the sword by the grip */}
		<Glove x={m0 - 110} y={P7[1]} w={150} bar={sheathHW(mouthA)} sleeveTo={[m0 - 420, H + 60]} id="gl" />
		<Glove x={ax(4.6)[0]} y={P7[1]} w={138} bar={0.95 * K7} sleeveTo={[ax(4.6)[0] + 180, H + 60]} id="gr" />
		{/* the cold flash, and its star where the edge leaves the mouth */}
		<Glint x={m0 + 40} y={P7[1] - 0.6 * K7} r={44} />
		<Glint x={lerp(m0, g0, 0.62)} y={P7[1] + 1.1 * K7} r={20} o={0.8} />
	</Frame53>; };

/* ===================== KF08 · I1 the inscription and the letters ===================== */
const K8 = 76, GX = 236, AY = 640;   // px per cm; the guard's blade-side face at x ≈ GX; the axis at y = AY
export const KF08: React.FC = () => { const px = GX - SW.guardA * K8;   // pommel end (off frame left)
	const mark = (side: number, n: number) => { const lx = side * 0.92 * K8, ly = -(SW.bladeA + 2.2 + n * 1.5) * K8; return {x: px - ly, y: AY + lx}; };   // rotate(90): (x, y) → (−y, x)
	const glow = [mark(1, 1), mark(1, 0)];   // 鸠 (n = 1), 浅 (n = 0): the lower row, nearest the guard
	const env = (x: number, y: number, r: number, i: number) => <g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
		<rect x={-46} y={-92} width={92} height={184} rx={4} fill="#E8DCC0" /><rect x={-22} y={-66} width={44} height={130} fill="none" stroke="#B8402A" strokeWidth={4} />
		<path d={`M-8,-52 v104 M8,-44 v80`} stroke="#3A2A20" strokeWidth={5} strokeLinecap="round" strokeDasharray="12 8" /><rect x={-38} y={-84} width={20} height={24} fill="none" stroke="#B8402A" strokeWidth={2.5} /></g>;
	const bladeClip = (() => { const n = 60, s1 = 30; const pts = Array.from({length: n + 1}, (_, i) => { const s = s1 * i / n; return [px + (SW.bladeA + s) * K8, AY - bladeHW(s) * K8]; });
		const pb = [...pts].reverse().map(([x, y]) => [x, 2 * AY - y]); return 'M' + [...pts, ...pb].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z'; })();
	return <Frame53 id="k8" sheen={0.2} vig={0.55} over={<><Sub53 id="I1" /><Stamp53 id="I1" /><SealHollow /></>}>
		<defs><filter id="k8g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter><clipPath id="k8c"><path d={bladeClip} /></clipPath>
			<filter id="k8r" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2" /></filter></defs>
		<Pool id="k8p" x={900} y={AY} rx={1100} ry={330} a={0.28} col="#FFC070" />
		<Sword x={px} y={AY} k={K8} rot={90} id="k8s" spec={0.22} marks={false} lw={0.55} />
		{[1, -1].flatMap((side) => [0, 1, 2, 3].map((n) => { const m = mark(side, n), lit = side === 1 && n <= 1; return <Glyph key={`${side}${n}`} x={m.x} y={m.y} s={1.42 * K8} seed={n + (side > 0 ? 4 : 0) + 3} rot={90} col={lit ? '#FFF2C8' : '#2A160A'} w={0.085 * K8} o={lit ? 1 : 0.88} />; }))}
		{/* the 1966 letters, settled, mirrored in the blade's polish (vertical envelopes with the red address frame) */}
		<g clipPath="url(#k8c)" opacity={0.42} filter="url(#k8r)">{[[1180, 600, -14], [1290, 640, -4], [1400, 610, 8], [1510, 650, 16], [1610, 620, 24]].map(([x, y, r], i) => env(x, y, r, i))}</g>
		{/* the two marks nearest the guard on the lower row glow: 鸠浅 */}
		<g filter="url(#k8g)">{glow.map((m, i) => <ellipse key={i} cx={m.x} cy={m.y} rx={66} ry={52} fill="#FFC860" opacity={0.6} />)}</g>
		{/* a gold bracket under the pair, and the reading in plain type */}
		<path d={`M${glow[1].x - 52},${AY + 205} V${AY + 222} H${glow[0].x + 52} V${AY + 205}`} fill="none" stroke={B.goldL} strokeWidth={3} />
		<path d={`M${(glow[0].x + glow[1].x) / 2},${AY + 222} V${AY + 250}`} stroke={B.goldL} strokeWidth={3} />
		<Scrim id="k8t" x={(glow[0].x + glow[1].x) / 2 + 230} y={AY + 318} rx={520} ry={120} a={0.6} />
		<text x={(glow[0].x + glow[1].x) / 2 - 104} y={AY + 352} fontFamily={SANS} fontWeight={900} fontSize={104} fill={B.goldL} stroke={B.lac} strokeWidth={10} strokeOpacity={0.85} style={{paintOrder: 'stroke'}}>鸠浅<tspan fill={B.cream} dx={22}>＝</tspan><tspan dx={22} fill="#FFF6E6">勾践</tspan></text>
		<Tag id="k8n" x={1660} y={430} s="40多封信" fs={72} anchor="end" col={B.cream} />
	</Frame53>; };

/* ===================== KF09 · B1 the paper test, 1977 ===================== */
/* Seen from the front-right and a little above: a stack of 32 sheets on the table (thickness drawn larger than life so the
   sheets can be counted), the blade standing on its edge in the cut. The end face shows the slot: the top 23 sheets are cut
   through (their halves pushed apart at the top), the bottom 9 are whole; the tip pokes out past the end of the stack.
   The hilt and the hand holding it are off frame left. World units: cm. */
const SHT = 0.11, NS = 32, NC = 23, SX0 = 10.5, SX1 = -10.5, SY = 7;   // SX1 = the end face we see (the camera convention mirrors x)
const CAM9 = lookAt([-26, -30, 12], [-2, 0, 2.4], 2300, 960, 600);
export const KF09: React.FC = () => { const c = CAM9, zE = (NS - NC) * SHT, zT = NS * SHT;
	/* the blade on edge in the plane y = 0: local s from the blade base, w across; the tip at x = 16.5 */
	const tipX = -14.5, baseX = tipX + LBc, zA = (w: number) => zE + 2.0 + w;
	const bl = (s: number, w: number): V3 => [baseX - s, 0, zA(w)];
	const outline = [...Array.from({length: 61}, (_, i) => { const s = LBc * i / 60; return bl(s, bladeHW(s)); }), ...Array.from({length: 61}, (_, i) => { const s = LBc * (60 - i) / 60; return bl(s, -bladeHW(s)); })];
	const cells = latticeCells(0, 1, 0, 0).map((cc) => ({...cc, q: cc.q.map(([a, w]) => bl(a / 10, w / 10)), inner: cc.inner.map(([a, w]) => bl(a / 10, w / 10)), core: cc.core.map(([a, w]) => bl(a / 10, w / 10))}));
	const sheetLines = (x: number, y0: number, y1: number, z0: number, z1: number) => Array.from({length: Math.round((z1 - z0) / SHT) + 1}, (_, i) => { const z = z0 + i * SHT; return <path key={`${x}${y0}${i}`} d={poly(c, [[x, y0, z], [x, y1, z]], false)} stroke="#A8A090" strokeOpacity={0.55} strokeWidth={1} fill="none" />; });
	const frontLines = (y: number) => Array.from({length: NS + 1}, (_, i) => { const z = i * SHT; return <path key={`f${i}`} d={poly(c, [[SX0, y, z], [SX1, y, z]], false)} stroke="#A8A090" strokeOpacity={0.5} strokeWidth={1} fill="none" />; });
	/* the slot: 0.3 wide at the edge, opening to 1.6 at the top where the cut halves were pushed apart */
	const gap = (z: number) => lerp(0.14, 0.7, Math.pow(cl((z - zE) / (zT - zE)), 1.4));
	const endHalf = (sgn: 1 | -1): V3[] => [[SX1, sgn * gap(zE), zE], [SX1, sgn * SY, zE], [SX1, sgn * SY, zT], [SX1, sgn * gap(zT), zT], ...Array.from({length: 8}, (_, i) => { const z = lerp(zT, zE, (i + 1) / 9); return [SX1, sgn * gap(z), z] as V3; })];
	const topHalf = (sgn: 1 | -1): V3[] => [[SX0, sgn * gap(zT), zT], [SX1, sgn * gap(zT), zT], [SX1, sgn * SY, zT], [SX0, sgn * SY, zT]];
	return <Frame53 id="k9" sheen={0.25} vig={0.55} over={<><Sub53 id="B1" /><Stamp53 id="B1" /><SealHollow /></>}>
		<defs><linearGradient id="k9beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4DC" stopOpacity="0.24" /><stop offset="0.6" stopColor="#FFF0D0" stopOpacity="0.06" /><stop offset="1" stopColor="#FFF0D0" stopOpacity="0" /></linearGradient>
			<clipPath id="k9c"><path d={poly(c, outline)} /></clipPath></defs>
		{/* the film set: dark backdrop; the film light on its stand at the right throws a hard beam across the stack */}
		<path d={`M1540,240 L1670,170 L1240,${H} L520,${H} Z`} fill="url(#k9beam)" />
		<g transform="translate(1590,232) rotate(-26)"><rect x={-70} y={-60} width={150} height={120} rx={12} fill="#2A2420" stroke="#5A5048" strokeWidth={3} /><circle cx={-70} cy={0} r={48} fill="#FFF6E2" /><circle cx={-70} cy={0} r={34} fill="#FFFFFF" />
			<path d="M-70,-60 L-128,-92 M-70,60 L-128,92" stroke="#3A3430" strokeWidth={10} strokeLinecap="round" /></g>
		<path d="M1640,290 L1660,1100" stroke="#2A2420" strokeWidth={10} />
		{/* table top */}
		<path d={poly(c, [[-40, -30, -0.05], [30, -30, -0.05], [30, 30, -0.05], [-40, 30, -0.05]])} fill="#33251B" />
		<path d={poly(c, [[-40, -30, -0.05], [30, -30, -0.05]], false)} stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} fill="none" />
		<path d={poly(c, [[SX0, -SY, 0], [SX1 - 0.8, -SY, 0], [SX1 - 0.8, SY, 0], [SX0, SY, 0]].map(([x, y, z]) => [x - 0.6, y + 0.8, z] as V3))} fill="#000" opacity={0.4} />
		{/* the back half of the stack: its top and its end face (behind the blade) */}
		<path d={poly(c, topHalf(1))} fill="#ECE6D8" /><path d={poly(c, endHalf(1))} fill="#D8D0C0" />{sheetLines(SX1, gap(zT) + 0.05, SY, zE, zT)}
		{/* the uncut 9 sheets under the edge, across the whole end face */}
		<path d={poly(c, [[SX1, -SY, 0], [SX1, SY, 0], [SX1, SY, zE], [SX1, -SY, zE]])} fill="#D2CABA" />{sheetLines(SX1, -SY, SY, 0, zE)}
		{/* the blade on its edge in the cut */}
		<path d={poly(c, outline)} fill="#E2B464" />
		<g clipPath="url(#k9c)">{cells.map((cc, i) => <g key={i}>{cc.pale && <path d={poly(c, cc.inner)} fill="#FFF0CC" opacity={0.4} />}<path d={poly(c, cc.q)} fill="none" stroke="#22140A" strokeWidth={1.6} strokeOpacity={0.75} />{!cc.pale && <path d={poly(c, cc.core)} fill="#22140A" opacity={0.6} />}</g>)}</g>
		<path d={poly(c, outline)} fill="none" stroke="#FFF3CF" strokeWidth={2} strokeOpacity={0.7} />
		<path d={poly(c, [bl(0.3, 0), bl(LBc - 1.2, 0)], false)} stroke="#FFF3CF" strokeWidth={2} strokeOpacity={0.8} fill="none" />
		{/* the front half of the stack, in front of the blade: top, front face, end face (the cut halves pushed apart) */}
		<path d={poly(c, topHalf(-1))} fill="#F6F2E8" />
		<path d={poly(c, [[SX0, -SY, 0], [SX1, -SY, 0], [SX1, -SY, zT], [SX0, -SY, zT]])} fill="#E6E0D2" />{frontLines(-SY)}
		<path d={poly(c, endHalf(-1))} fill="#DCD4C4" />{sheetLines(SX1, -SY, -gap(zT) - 0.05, zE, zT)}
		<path d={poly(c, Array.from({length: 10}, (_, i) => { const z = lerp(zT, zE, i / 9); return [SX1, -gap(z), z] as V3; }), false)} stroke="#6A6458" strokeWidth={1.5} fill="none" />
		<Glint x={proj(c, [SX1 - 0.6, 0, zE + 0.1])[0]} y={proj(c, [SX1 - 0.6, 0, zE + 0.1])[1]} r={24} />
		{/* the count on the end face: a bracket for the cut sheets, one for the whole sheets */}
		{(() => { const a = proj(c, [SX1, -SY, zT]), b = proj(c, [SX1, -SY, zE]), d = proj(c, [SX1, -SY, 0]);
			return <g><path d={`M${a[0] - 4},${a[1]} h-16 V${b[1] - 3} h16`} fill="none" stroke={B.goldL} strokeWidth={4} /><path d={`M${b[0] - 4},${b[1] + 3} h-16 V${d[1]} h16`} fill="none" stroke={B.cream} strokeWidth={3} />
				<Tag id="k9a" x={a[0] - 14} y={(a[1] + b[1]) / 2 + 20} s="划破20多张" fs={56} col={B.goldL} anchor="end" />
				<Tag id="k9b" x={b[0] - 14} y={(b[1] + d[1]) / 2 + 30} s="共30多张" fs={44} col={B.cream} anchor="end" /></g>; })()}
		{/* the clapper slate for 《古剑》, set down on the table after the take */}
		<g transform="translate(240,800) rotate(-7)"><rect x={0} y={0} width={230} height={160} rx={6} fill="#1E1C1A" stroke="#6A625A" strokeWidth={3} />
			<path d="M0,-6 L230,-6 L230,-38 L0,-38 Z" fill="#1E1C1A" />{Array.from({length: 6}, (_, i) => <path key={i} d={`M${i * 38 + 6},-36 l24,28`} stroke="#E8E2D6" strokeWidth={11} />)}
			<text x={115} y={82} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={54} fill="#E8E2D6">古剑</text><text x={115} y={138} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={32} fill="#B8B0A4">1977</text></g>
	</Frame53>; };
const LBc = LB_MM / 10;
void H; void cl; void mix; void BZ; void LAT;
