import React from 'react';
import {W, H, cl, seg, rnd, KAI} from '../qq50/kit50';
import {useStampFonts} from '../qq44/skin44';
import {RimF, P, f1} from './cao54b';
import {HDefs} from './d1hero54a';
import {HeadT, HeadDefs} from './d1head54a';
import {BRUSH, useBrush} from './ttl54b';
/* ep54 · title option D 「白脸」 (film 12.606 → 16.590, bar 6 → bar 8). In 京剧 曹操 is the 水白脸 of the 奸臣: that is the picture most
   people carry, and it is the 「奸雄」 the film questions. A code-drawn, generic traditional white face (white ground; long thin brows
   rising to the temples; slanted eyes with long black tails and 鱼尾纹; fine 奸纹 across the forehead; the 印堂 lines; 法令纹; a
   thin down-turned mouth; the black 水纱 and cap) fills the left two-thirds of a dark stage. On the slam it CRACKS, and the pieces round
   its right eye fall away: behind the paint the film's own 曹操 (the approved D1 head, d1head54a, read-only, mirrored so his lit near
   side is the one revealed) looks out, warm-lit, with his sideways glare. More of the paint falls on the beats of the hold.
   Right: 曹操 in brush calligraphy (the mask's white, a red shadow) and the question, 英雄 gold / 奸雄 red.
   Motion (T0 = the slam):
   - T0: hard cut to the intact white face under a top light; on the same frame the crack runs down it (2 frames) with a white flash
     and a camera kick; 曹操 slams in (scale 1.16 → 1). +1 / +3 frames: the two eye shards break loose and fall (they tumble off the
     bottom in ~0.5 s), chips fly; the real eye is there.
   - +9 → +17 frames: the question wipes in left → right.
   - bar 7 (14.598): the jaw shard falls (the real moustache and beard); bar 7 + 2 beats (15.594): the forehead shard (the iron
     helmet's rim under the paint). Each fall: a 3 px shake. Hold: a slow push-in (+3%), stage dust drifting in the light, the plume.
   - exit: 16.18 → 16.50 everything fades to black (gone by 16.52). */
export const T0 = 0.654 + 1.99203 * 6, TB = 0.654 + 1.99203 * 8, BEAT = 1.99203 / 4, BAR7 = T0 + 1.99203;
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const pts = (a: P[]) => a.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' ');
const poly = (a: P[], close = true) => `M${pts(a).replace(/ /g, ' L')}${close ? ' Z' : ''}`;
/** a tapered ribbon along a quadratic-ish polyline: half-width w(u) */
const ribbon = (a: P[], w: (u: number) => number) => { const L: P[] = [], R: P[] = [], n = a.length;
	a.forEach((p, i) => { const q = a[Math.min(i + 1, n - 1)], o = a[Math.max(i - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, ww = w(i / (n - 1));
		L.push([p[0] - (dy / d) * ww, p[1] + (dx / d) * ww]); R.push([p[0] + (dy / d) * ww, p[1] - (dx / d) * ww]); });
	return poly([...L, ...R.reverse()]); };
/** a quadratic bezier sampled: a → b with control c */
const qb = (a: P, c: P, b: P, n = 16): P[] => Array.from({length: n + 1}, (_, i) => { const u = i / n, m = 1 - u; return [m * m * a[0] + 2 * m * u * c[0] + u * u * b[0], m * m * a[1] + 2 * m * u * c[1] + u * u * b[1]] as P; });
const mir = (a: P[]): P[] => a.map(([x, y]) => [-x, y] as P);

/* ---------- the mask, local units (origin between the eyes; the face spans x ±410, y −560 … +590) ---------- */
const MX = 720, MY = 528, MS = 0.82;                 // its placement on screen
const FACE = 'M-380,-470 C-300,-530 300,-530 380,-470 C404,-330 420,-160 418,0 C416,150 394,290 334,398 C272,500 164,574 0,590 C-164,574 -272,500 -334,398 C-394,290 -416,150 -418,0 C-420,-160 -404,-330 -380,-470 Z';
const INK = '#151012';
/* half-features (the right side, x > 0); the left is the mirror */
const BROW = qb([42, -122], [150, -232], [346, -272], 14);
const LIDU = qb([50, -10], [140, -96], [262, -74], 14).concat(qb([262, -74], [300, -88], [340, -116], 5).slice(1));
const LIDL = qb([58, -2], [150, 14], [246, -60], 12);
const EYE = [...qb([54, -8], [140, -84], [256, -70], 10), ...qb([250, -62], [150, 8], [58, -2], 10).slice(1)];
const CROW = [qb([256, -62], [300, -66], [360, -50], 6), qb([250, -48], [296, -34], [350, -2], 6), qb([236, -32], [276, -6], [318, 40], 6)];
const UNDER = [qb([84, 34], [160, 40], [232, 0], 8), qb([110, 66], [180, 66], [244, 26], 8)];
const NOSEW = qb([28, 168], [78, 206], [30, 250], 10);
const FALING = qb([66, 214], [124, 290], [150, 382], 10);
const CHEEK = qb([268, 120], [312, 190], [298, 282], 8);
/* the 奸纹 across the forehead: shallow waves, full width */
const FORE = [-318, -368, -418].map((y, k) => Array.from({length: 25}, (_, i) => { const x = -270 + (540 * i) / 24, c = Math.abs(x) / 270;
	return [x, y + 26 * c * c - 10 * Math.cos((x / 270) * Math.PI * 2) * (1 - c) + k * 4 * c] as P; }));

const MaskArt: React.FC = () => <g>
	{/* the white ground, its cel shade (key from the top-left), the lit forehead */}
	<path d={FACE} fill="#EEE8DD" />
	<g clipPath="url(#tdFc)">
		<g filter="url(#tdFe)">
			<path d="M180,-520 C300,-420 360,-200 352,40 C344,240 290,400 190,520 L460,640 L460,-560 Z" fill="#B9B2A6" opacity={0.75} />
			<path d="M-300,-150 C-200,-130 -100,-140 -10,-170 C80,-140 200,-130 300,-150 L300,-40 C200,-30 80,-40 0,-60 C-80,-40 -200,-30 -300,-40 Z" fill="#D9D2C6" opacity={0.7} />
			<path d="M-40,40 C-20,120 -20,200 -50,250 L-110,240 C-80,170 -70,100 -90,40 Z" fill="#D6CFC2" opacity={0.8} />
			<path d="M-200,420 C-120,520 120,520 200,420 L240,620 L-240,620 Z" fill="#B9B2A6" opacity={0.6} />
			<path d="M-260,-500 C-160,-540 60,-540 140,-500 C120,-420 20,-380 -100,-380 C-200,-390 -260,-430 -260,-500 Z" fill="#FFFFFF" opacity={0.55} />
			<ellipse cx={-210} cy={110} rx={90} ry={60} fill="#FFFFFF" opacity={0.35} />
		</g>
	</g>
	{/* the black 水纱 and cap over the top, the hair at the temples */}
	<path d="M-440,-420 C-390,-560 390,-560 440,-420 L470,-900 L-470,-900 Z" fill="#0E0B0C" />
	<path d="M-440,-420 C-390,-560 390,-560 440,-420" fill="none" stroke="#3A3236" strokeWidth={6} />
	<path d="M-420,-470 C-360,-560 360,-560 420,-470 L420,-500 C360,-590 -360,-590 -420,-500 Z" fill="#5A1A16" />
	<path d="M-300,-540 C-120,-580 120,-580 300,-540" fill="none" stroke="#C8A060" strokeWidth={3} opacity={0.6} />
	{[1, -1].map((s) => <path key={s} d={`M${s * 378},-470 C${s * 402},-400 ${s * 414},-320 ${s * 414},-226 L${s * 438},-250 C${s * 444},-340 ${s * 440},-420 ${s * 424},-480 Z`} fill="#0E0B0C" />)}
	{/* the 帽正: a jade plaque in a gilt frame at the front of the cap */}
	<rect x={-30} y={-528} width={60} height={40} rx={9} fill="#5E9A82" stroke="#C8A060" strokeWidth={4} />
	<rect x={-20} y={-522} width={22} height={9} rx={4} fill="#B8E0CC" opacity={0.7} />
	{/* the forehead: the 奸纹 waves, the 印堂 lines */}
	{FORE.map((a, k) => <path key={k} d={ribbon(a, (u) => 3.2 * Math.pow(Math.sin(Math.PI * u), 0.6) + 0.4)} fill={INK} />)}
	<path d={ribbon(qb([-14, -250], [-20, -190], [-12, -128], 8), (u) => 1 + 3 * Math.sin(Math.PI * u))} fill={INK} />
	<path d={ribbon(qb([14, -250], [20, -190], [12, -128], 8), (u) => 1 + 3 * Math.sin(Math.PI * u))} fill={INK} />
	{[1, -1].map((s) => { const m = (a: P[]) => (s > 0 ? a : mir(a));
		return <g key={s}>
			{/* the brow: long and thin, rising to the temple */}
			<path d={ribbon(m(BROW), (u) => 16 * (1 - u) * (0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, u * 2))) + 1.5)} fill={INK} />
			{/* the eye: the opening, the iris (both look to screen right), the heavy upper lid with its long tail, the lower lid */}
			<path d={poly(m(EYE))} fill="#F4EFE6" />
			<g clipPath={`url(#tdE${s})`}><circle cx={s > 0 ? 196 : -98} cy={-34} r={30} fill="#2A1A14" /><circle cx={s > 0 ? 196 : -98} cy={-34} r={15} fill="#060404" />
				<path d={poly(m(EYE))} fill="none" stroke="#000" strokeWidth={22} opacity={0.25} /></g>
			<circle cx={s > 0 ? 206 : -88} cy={-44} r={5} fill="#FFFFFF" />
			<path d={ribbon(m(LIDU), (u) => 2.5 + 12 * Math.sin(Math.PI * Math.min(1, u * 1.3)) * (1 - u * 0.55))} fill={INK} />
			<path d={ribbon(m(LIDL), (u) => 0.8 + 3 * Math.sin(Math.PI * u))} fill={INK} />
			{CROW.map((a, i) => <path key={i} d={ribbon(m(a), (u) => 0.5 + 2.4 * (1 - u))} fill={INK} />)}
			{UNDER.map((a, i) => <path key={'u' + i} d={ribbon(m(a), (u) => 0.5 + 2.4 * Math.sin(Math.PI * u))} fill={INK} opacity={0.9} />)}
			{/* the nose wing, the nostril, the 法令纹, the cheek line */}
			<path d={ribbon(m(NOSEW), (u) => 1 + 4 * Math.sin(Math.PI * u))} fill={INK} />
			<ellipse cx={s * 30} cy={240} rx={13} ry={7} fill={INK} transform={`rotate(${s * 20},${s * 30},240)`} />
			<path d={ribbon(m(FALING), (u) => 0.6 + 4 * Math.sin(Math.PI * u))} fill={INK} />
			<path d={ribbon(m(CHEEK), (u) => 0.5 + 2.6 * Math.sin(Math.PI * u))} fill={INK} opacity={0.85} />
		</g>; })}
	{/* the mouth: thin and down-turned, a dark red lower lip; the chin line */}
	<path d="M-60,338 C-30,356 30,356 60,338 C30,346 -30,346 -60,338 Z" fill="#8E2A22" />
	<path d={ribbon([...qb([-128, 352], [-70, 316], [0, 322], 10), ...qb([0, 322], [70, 316], [128, 352], 10).slice(1)], (u) => 1 + 4.5 * Math.sin(Math.PI * u))} fill={INK} />
	<path d={ribbon(qb([-50, 470], [0, 488], [50, 470], 10), (u) => 0.5 + 2.4 * Math.sin(Math.PI * u))} fill={INK} opacity={0.8} />
	{/* the rims: the cool 石青 on the shadow side, the warm key on the lit top-left */}
	<path d="M380,-470 C404,-330 420,-160 418,0 C416,150 394,290 334,398 C272,500 164,574 40,588" fill="none" stroke="#8FD0DC" strokeWidth={5} opacity={0.7} />
	<path d="M-418,0 C-420,-160 -404,-330 -380,-470" fill="none" stroke="#FFE6C0" strokeWidth={4} opacity={0.6} />
</g>;

/* ---------- the break: the main crack and the shards on its right (local units) ---------- */
const C: P[] = [[70, -640], [40, -470], [95, -350], [30, -220], [75, -95], [25, 30], [85, 150], [40, 290], [105, 420], [70, 640]];
/* the hole stays inside the face: a strip of paint is left on its outer edge (so the helmet's cheek guard stays hidden) */
const B1: P[] = [C[4], [190, -150], [300, -172]];
const R1: P[] = [[300, -172], [334, -80], [302, 10], [326, 90], [300, 175]];
const BM: P[] = [C[5], [150, 0], [302, 10]];
const B2: P[] = [C[6], [210, 120], [300, 175]];
const R2: P[] = [[300, 175], [332, 300], [284, 428]];
const BB: P[] = [C[8], [190, 462], [284, 428]];
const RC: P[] = [[300, -172], [332, -210], [330, -300]];
const B3: P[] = [C[2], [220, -380], [330, -300]];
const rev = (a: P[]) => a.slice().reverse();
type Shard = {id: string; pts: P[]; tf: number; edges: {p: P[]; nb: string}[]; spin: number; vx: number; burst?: number};
/* fall times: the eye shards on the slam (+1, +3 frames), the jaw on bar 7, the forehead two beats later */
const SH: Shard[] = [
	{id: 'a', pts: [C[4], C[5], BM[1], BM[2], R1[1], R1[0], B1[1]], tf: T0 + 1 / 30, spin: -38, vx: 160, burst: 1,
		edges: [{p: [C[4], C[5]], nb: 'L'}, {p: BM, nb: 'b'}, {p: R1.slice(0, 3), nb: 'L'}, {p: B1, nb: 'c'}]},
	{id: 'b', pts: [C[5], C[6], B2[1], B2[2], R1[3], R1[2], BM[1]], tf: T0 + 3 / 30, spin: 30, vx: 110, burst: 0.8,
		edges: [{p: [C[5], C[6]], nb: 'L'}, {p: B2, nb: 'd'}, {p: R1.slice(2), nb: 'L'}, {p: BM, nb: 'a'}]},
	{id: 'd', pts: [C[6], C[7], C[8], BB[1], BB[2], R2[1], R2[0], B2[1]], tf: BAR7, spin: 22, vx: 90,
		edges: [{p: [C[6], C[7], C[8]], nb: 'L'}, {p: BB, nb: 'L'}, {p: R2, nb: 'L'}, {p: B2, nb: 'b'}]},
	{id: 'c', pts: [C[2], C[3], C[4], B1[1], B1[2], RC[1], RC[2], B3[1]], tf: BAR7 + 2 * BEAT, spin: -26, vx: 130,
		edges: [{p: [C[2], C[3], C[4]], nb: 'L'}, {p: B1, nb: 'a'}, {p: RC, nb: 'L'}, {p: B3, nb: 'L'}]},
];
const cen = (a: P[]): P => [a.reduce((s, p) => s + p[0], 0) / a.length, a.reduce((s, p) => s + p[1], 0) / a.length];
/** a shard's pose d s after it breaks: a small pop outward, then the fall (gravity), the tumble, a slight growth toward the lens */
const fallT = (s: Shard, d: number) => { const c = cen(s.pts), b = s.burst ?? 0, pop = eo(d / 0.06), g = 4800, dd = Math.max(0, d - 0.03);
	/* the slam's pieces burst out toward the lens (fast, growing); the later ones break loose and drop */
	const dx = 10 * pop + (s.vx + 260 * b) * dd, dy = -6 * pop + (120 + 380 * b) * dd + 0.5 * g * dd * dd, r = s.spin * dd * (2.2 + 1.5 * b), k = 1 + (0.3 + 1.6 * b) * dd;
	return `translate(${f1(c[0] + dx)},${f1(c[1] + dy)}) rotate(${f1(r)}) scale(${k.toFixed(3)}) translate(${f1(-c[0])},${f1(-c[1])})`; };
/* the hairline cracks that spread into the paint that stays (they appear with the break) */
const HAIR: P[][] = [[[40, -470], [-60, -430], [-150, -470], [-240, -440]], [[30, -220], [-50, -262], [-130, -244]], [[25, 30], [-40, 76], [-118, 58], [-170, 96]],
	[[40, 290], [-60, 326], [-130, 300]], [[105, 420], [20, 470], [-40, 520]], [[330, -300], [380, -360]], [[334, -80], [400, -60]], [[332, 300], [390, 330]], [[220, -380], [250, -450], [330, -480]], [[200, 470], [230, 540]]];

/* the real head behind the paint: the approved D1 head at 4×, mirrored (his lit near side is the one revealed), its nose root at local
   (70, −78). Drawn in its own <svg> layer that CSS mirrors (scaleX(−1) about x = 960): an SVG negative scale breaks the head's own
   blur filters in Chrome (hard-edged bands), a CSS mirror of the finished layer does not. The hole is a CSS clip-path in screen px. */
const NR: P = [1380, 253], HS = 4.0, HR = 27, HO: P = [70, -78];
const Q: [string, string][] = [['到底是', 'c'], ['英雄', 'g'], ['，', 'c']];
const Q2: [string, string][] = [['还是', 'c'], ['奸雄', 'r'], ['？', 'c']];
const QC: Record<string, string> = {c: '#F2E8D6', g: '#F0C460', r: '#E0402C'};
const TX = 1508;                                       // the type block's centre

export const TitleOpt: React.FC<{t: number}> = ({t}) => {
	useBrush(); useStampFonts('到底是英雄，还是奸雄？');
	const fr = (t - T0) * 30;
	const out = eo(seg(t, TB - BEAT, TB - 0.09)), on = 1 - out;   /* the exit: from the last beat (16.092) to 16.50 */
	/* the camera: a kick on the break, 3 px shakes on the later falls, a slow push-in */
	const kick = fr < 0 ? 0 : 0.035 * Math.exp(-fr / 3.5);
	const push = 1 + 0.03 * seg(t, T0, TB), z = push * (1 + kick);
	const shk = (t0: number, a: number) => { const f = (t - t0) * 30; return f < 0 || f > 6 ? [0, 0] : [a * (1 - f / 6) * Math.sin(f * 2.9), a * (1 - f / 6) * Math.cos(f * 3.3)]; };
	const s0 = shk(T0, 8), s1 = shk(BAR7, 3), s2 = shk(BAR7 + 2 * BEAT, 3), shx = s0[0] + s1[0] + s2[0], shy = s0[1] + s1[1] + s2[1];
	const cam = `translate(${f1(MX + shx)},${f1(540 + shy)}) scale(${z.toFixed(5)}) translate(${-MX},-540)`;
	const place = `translate(${MX},${MY}) scale(${MS})`;
	/* local → screen (cam ∘ place) */
	const scr = ([x, y]: P): P => [MX + shx + z * MS * x, 540 + shy + z * (MY + MS * y - 540)];
	const crackU = cl(fr / 2.2), hairU = cl((fr - 1) / 4);
	const fallen = SH.filter((s) => t >= s.tf), gone = (id: string) => fallen.some((s) => s.id === id), holeD = fallen.map((s) => poly(s.pts)).join(' ');
	const holeS = fallen.map((s) => poly(s.pts.map(scr))).join(' ');
	/* the head layer, drawn mirrored so that CSS's mirror puts it right: screen = (ax − s·q.x, ay + s·q.y) for the rotated drawing point q */
	const hs = z * MS * HS, ax = MX + shx + z * MS * HO[0], ay = 540 + shy + z * (MY - 540) + z * MS * HO[1];
	const headT = `translate(${f1(W - ax)},${f1(ay)}) scale(${hs.toFixed(4)}) rotate(${HR}) translate(${-NR[0]},${-NR[1]})`;
	const flash = fr < 0 ? 0 : 0.55 * Math.exp(-fr / 2.5);
	const nameS = fr < 0 ? 0 : 1 + 0.16 * Math.pow(1 - cl(fr / 5), 2), nameO = cl(fr / 1.5);
	const qU = cl((fr - 9) / 8), qX = 1240 + 640 * eo(qU);
	const abs: React.CSSProperties = {position: 'absolute', left: 0, top: 0};
	return <div style={{...abs, width: W, height: H}}>
		{/* 1 · the stage and its dust */}
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={abs}>
			<defs>
				<radialGradient id="tdStage" cx={MX} cy={300} r={980} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#3A1A16" /><stop offset="0.45" stopColor="#1C0B0A" /><stop offset="1" stopColor="#060303" /></radialGradient>
				<radialGradient id="tdSpot" cx={MX - 60} cy={-120} r={900} gradientUnits="userSpaceOnUse" gradientTransform={`translate(${MX - 60} -120) scale(0.8 1.3) translate(${-MX + 60} 120)`}><stop offset="0" stopColor="#FFE8C0" stopOpacity="0.22" /><stop offset="0.6" stopColor="#FFE0B0" stopOpacity="0.06" /><stop offset="1" stopColor="#FFE0B0" stopOpacity="0" /></radialGradient>
			</defs>
			<rect width={W} height={H} fill="url(#tdStage)" />
			<rect width={W} height={H} fill="url(#tdSpot)" />
			<g opacity={on} transform={cam}>
				{Array.from({length: 26}, (_, i) => { const u = ((t * (8 + rnd(i, 1) * 14)) / 300 + rnd(i, 2)) % 1, x = MX - 520 + rnd(i, 3) * 1040 + Math.sin(t * 0.7 + i) * 30, y = -40 + u * 1160;
					return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(1 + rnd(i, 4) * 2)} fill="#FFE8C8" opacity={(0.32 * Math.sin(Math.PI * u)).toFixed(3)} />; })}
			</g>
		</svg>
		{/* 2 · the real man, seen only through the holes */}
		{fallen.length > 0 && <div style={{...abs, width: W, height: H, clipPath: `path('${holeS}')`, opacity: on}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{...abs, transform: 'scaleX(-1)'}}>
				<defs><HDefs /><HeadDefs />
					<filter id="tdWarm" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1.12 0.04 0 0 0.01  0.02 1.02 0 0 0  0 0.02 0.86 0 0  0 0 0 1 0" /></filter></defs>
				<rect width={W} height={H} fill="#120A08" />
				<g filter="url(#tdWarm)"><g transform={headT}><HeadT t={t} /></g></g>
			</svg>
		</div>}
		{/* 3 · the paint, the cracks, the falling pieces, the type */}
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={abs}>
			<defs>
				<clipPath id="tdFc"><path d={FACE} /></clipPath>
				<clipPath id="tdE1"><path d={poly(EYE)} /></clipPath>
				<clipPath id="tdE-1"><path d={poly(mir(EYE))} /></clipPath>
				<clipPath id="tdHole"><path d={holeD || 'M0,0 Z'} /></clipPath>
				{SH.map((s) => <clipPath key={s.id} id={`tdS${s.id}`}><path d={poly(s.pts)} /></clipPath>)}
				<mask id="tdKeep" maskUnits="userSpaceOnUse" x={-600} y={-1000} width={1200} height={1800}><rect x={-600} y={-1000} width={1200} height={1800} fill="#fff" />{holeD && <path d={holeD} fill="#000" stroke="#000" strokeWidth={0.6} />}</mask>
				<filter id="tdFe" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={18} /></filter>
				<filter id="tdBl" filterUnits="userSpaceOnUse" x={-700} y={-900} width={1400} height={1800}><feGaussianBlur stdDeviation={16} /></filter>
				<RimF id="tdRim" lx={-0.6} ly={-1} k={5} c="#FFF4E0" o={0.6} lx2={1} ly2={0.2} k2={5} c2="#8FD0DC" o2={0.55} blur={1.2} />
				<radialGradient id="tdHoleL" cx={200} cy={40} r={460} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFB060" stopOpacity="0.2" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient>
				<filter id="tdTsh" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="8" /><feOffset dy="5" /><feComponentTransfer><feFuncA type="linear" slope="0.9" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
				<linearGradient id="tdQw" x1={qX - 140} x2={qX} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
				<mask id="tdQm" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect width={W} height={H} fill="url(#tdQw)" /></mask>
				<g id="tdArt"><MaskArt /></g>
			</defs>
			<g opacity={on}>
				<g transform={cam}>
					<g transform={place}>
						{/* in the holes: a warm light on him, the inner shadow and the raw broken edge of the paint shell */}
						{fallen.length > 0 && <g clipPath="url(#tdHole)">
							<rect x={-500} y={-700} width={1000} height={1400} fill="url(#tdHoleL)" opacity={0.75 + 0.25 * Math.sin(t * 9.3) * Math.sin(t * 3.7 + 1)} />
							{fallen.map((s) => s.edges.filter((e) => e.nb === 'L' || !gone(e.nb)).map((e, i) => <g key={s.id + i}>
								<path d={poly(e.p, false)} fill="none" stroke="#000" strokeWidth={60} opacity={0.55} filter="url(#tdBl)" />
								<path d={poly(e.p, false)} fill="none" stroke="#6E655A" strokeWidth={16} strokeLinejoin="round" />
								<path d={poly(e.p, false)} fill="none" stroke="#A39A8C" strokeWidth={5} strokeLinejoin="round" transform="translate(2,3)" opacity={0.8} />
							</g>))}
						</g>}
						{/* the paint that stays */}
						<g mask="url(#tdKeep)" filter="url(#tdRim)"><use href="#tdArt" /></g>
						{/* the warm light of the hole spilling onto the broken paint round it */}
						{fallen.length > 0 && <g mask="url(#tdKeep)" clipPath="url(#tdFc)"><path d={holeD} fill="none" stroke="#FFB868" strokeWidth={34} strokeLinejoin="round" filter="url(#tdBl)" opacity={0.42 + 0.1 * Math.sin(t * 9.3) * Math.sin(t * 3.7 + 1)} /></g>}
						{/* the cracks still closed: the main crack and the branches, drawn on in the first frames; hairlines spreading into the paint */}
						{fr >= 0 && <g mask="url(#tdKeep)" clipPath="url(#tdFc)">
							{[C, B1, BM, B2, B3, R1, R2, BB, RC].map((a, i) => { const n = Math.max(2, Math.ceil(a.length * (i === 0 ? crackU : cl(crackU * 1.4 - 0.2)))), q = a.slice(0, n);
								return <g key={i}><path d={poly(q, false)} fill="none" stroke="#2A1E1A" strokeWidth={i === 0 ? 7 : 5} strokeLinejoin="round" />
									<path d={poly(q, false)} fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" opacity={0.85} transform="translate(-2,-2)" /></g>; })}
							{HAIR.map((a, i) => { const n = Math.max(2, Math.ceil(a.length * hairU)); return hairU > 0 && <path key={'h' + i} d={poly(a.slice(0, n), false)} fill="none" stroke="#3A2E2A" strokeWidth={2.4} strokeLinejoin="round" opacity={0.85} />; })}
						</g>}
						{/* the break's flash along the main crack */}
						{fr >= 0 && fr < 9 && <path d={poly(C.slice(0, Math.max(2, Math.ceil(C.length * crackU))), false)} fill="none" stroke="#FFF2DA" strokeWidth={26} strokeLinejoin="round" filter="url(#tdBl)" opacity={0.9 * (1 - fr / 9)} clipPath="url(#tdFc)" />}
						{/* the falling pieces: the paint on a thick broken shell */}
						{fallen.map((s) => { const d = t - s.tf; if (d > 0.9) return null;
							return <g key={s.id} transform={fallT(s, d)}>
								<g transform="translate(7,10)" clipPath={`url(#tdS${s.id})`}><path d={FACE} fill="#6A6156" /></g>
								<g clipPath={`url(#tdS${s.id})`}><use href="#tdArt" /></g>
							</g>; })}
						{/* chips thrown off the crack on the break */}
						{fr >= 0 && fr < 26 && Array.from({length: 22}, (_, i) => { const a = -Math.PI / 2 + (rnd(i, 21) - 0.3) * 2.4, v = 300 + rnd(i, 22) * 700, d = fr / 30, y0 = C[3 + (i % 5)][1];
							const x = C[3 + (i % 5)][0] + Math.cos(a) * v * d, y = y0 + Math.sin(a) * v * d + 0.5 * 3200 * d * d, r = 3 + rnd(i, 23) * 7;
							return <rect key={i} x={f1(x - r)} y={f1(y - r * 0.6)} width={f1(2 * r)} height={f1(1.2 * r)} fill={i % 3 ? '#EEE8DD' : '#6E655A'} transform={`rotate(${f1(rnd(i, 24) * 360 + fr * 40)},${f1(x)},${f1(y)})`} />; })}
					</g>
					{flash > 0.01 && <rect width={W} height={H} fill="#FFF8EC" opacity={flash} />}
				</g>
				{/* the type: 曹操 in brush, the mask's white with a red shadow; the question under it */}
				<g transform={`translate(${TX},420) scale(${nameS.toFixed(4)}) translate(${-TX},-420)`} opacity={nameO}>
					<text x={TX + 10} y={538} textAnchor="middle" fontFamily={BRUSH} fontSize={250} letterSpacing={6} fill="#A3221A">曹操</text>
					<g filter="url(#tdTsh)"><text x={TX} y={528} textAnchor="middle" fontFamily={BRUSH} fontSize={250} letterSpacing={6} fill="#F3EEE4" stroke="#0A0606" strokeWidth={10} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>曹操</text></g>
				</g>
				{fr >= 9 && <g mask="url(#tdQm)" filter="url(#tdTsh)">
					{[[Q, 676], [Q2, 790]].map(([q, y], k) => <text key={k} x={TX} y={y as number} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={84} letterSpacing={8} stroke="#0A0604" strokeWidth={9} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>
						{(q as [string, string][]).map(([s, c], i) => <tspan key={i} fill={QC[c]} fontSize={c === 'c' ? 84 : 96}>{s}</tspan>)}</text>)}
				</g>}
			</g>
		</svg>
	</div>; };
