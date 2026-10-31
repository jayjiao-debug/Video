import React from 'react';
import {P, f1} from './cao54b';
import {limb} from './set54bs';
/* ep54 look B · THE DROP kit (set builder): 曹操 seen from the FRONT for the first time (46, the same face design as the profile rig:
   black hair greying at the temples, short greying beard trimmed along the jaw, the 帻 band and the lacquered gauze 武冠, 札甲, cape),
   lit by the fire: warm orange key on his left (screen right), the cool 石青 accent on his right (screen left).
   Front-running soldier silhouettes for the charge, and the fire palette (马首: flames #FFE9B0 → #FFB04E → #EA6028, smoke #3A2224).
   CaoFront local units: px at scale 1, chin at (0, 0), crown of the cap −265, soles +1352 (1 cm ≈ 8.9 u). */
export const FIRE = {core: '#FFE9B0', mid: '#FFB04E', out: '#EA6028', smoke: '#3A2224', ember: '#FFD08A'};
const FP = {skin: '#B9784F', skinS: '#6E4130', skinD: '#452619', skinH: '#F2A86C', skinHH: '#FFD39E', hair: '#15100E', grey: '#A09486',
	metal: '#3A3534', metalS: '#161212', metalH: '#D88A4C', metalC: '#5E8E98', lace: '#7A2C20', under: '#5A2C24', underS: '#2A1512', underH: '#C8643C',
	cape: '#2E1716', capeS: '#140A0A', capeH: '#C0542C', gold: '#D6A456', line: '#24140E', white: '#D8CDB8'};
const pp = (a: P[]) => a.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
const add = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];

/* ---------- the head, front view ---------- */
/* a strong chin and a square jaw (owner r2: the chin read retracted) */
const FACE = 'M-74,-150 C-80,-130 -82,-110 -80,-92 C-79,-74 -77,-54 -73,-36 C-68,-20 -58,-6 -42,6 C-30,14 -16,18 0,18 C16,18 30,14 42,6 C58,-6 68,-20 73,-36 C77,-54 79,-74 80,-92 C82,-110 80,-130 74,-150 C50,-172 -50,-172 -74,-150 Z';
const EARL = 'M-78,-108 C-92,-114 -100,-100 -98,-84 C-96,-68 -90,-56 -79,-58 Z', EARR = 'M78,-108 C92,-114 100,-100 98,-84 C96,-68 90,-56 79,-58 Z';
/* a short, dense, greying beard over the jaw and the chin, from the sideburns; the mouth and lower lip left clear */
const BEARD = 'M-83,-76 C-82,-52 -76,-30 -64,-10 C-50,12 -28,32 0,36 C28,32 50,12 64,-10 C76,-30 82,-52 83,-76 L73,-74 C71,-54 64,-38 52,-26 C44,-18 36,-13 27,-10 C20,-8 15,-3 12,1 C6,-1 -6,-1 -12,1 C-15,-3 -20,-8 -27,-10 C-36,-13 -44,-18 -52,-26 C-64,-38 -71,-54 -73,-74 Z';
const BSTR = Array.from({length: 34}, (_, i) => { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2) / 16, a = -1.45 + k * 1.45;
	const x0 = side * (78 - k * 46) * 0.98, y0 = -70 + k * 96 - (k > 0.8 ? (k - 0.8) * 60 : 0), dx = side * -Math.sin(a + 1.5) * 7, dy = 9 + k * 3;
	return `M${f1(x0)},${f1(y0)} l${f1(dx)},${f1(dy)}`; }).join(' ');
export const HeadF: React.FC<{id: string; look?: number}> = ({id, look = 0}) => { const c = FP, lx = look * 3;
	const eye = (s: number) => { const x = s * 37, y = -86;
		const alm = `M${x - 20},${y + 1} C${x - 12},${y - 6} ${x + 8},${y - 7} ${x + 20},${y - 2} C${x + 11},${y + 5} ${x - 9},${y + 6} ${x - 20},${y + 1} Z`;
		return <g key={s}>
			<defs><clipPath id={`${id}e${s}`}><path d={alm} /></clipPath></defs>
			<path d={`M${x - 26},${y - 4} C${x - 14},${y - 16} ${x + 12},${y - 17} ${x + 26},${y - 7} L${x + 24},${y + 2} C${x + 10},${y - 6} ${x - 12},${y - 5} ${x - 24},${y + 3} Z`} fill={c.skinD} opacity={s < 0 ? 0.7 : 0.45} />
			<path d={alm} fill={s < 0 ? '#8E7E6C' : '#DCC6AA'} />
			<g clipPath={`url(#${id}e${s})`}><circle cx={x + lx} cy={y + 0.5} r={7.6} fill="#2A1A12" /><circle cx={x + lx} cy={y + 0.5} r={4.2} fill="#0A0605" />
				<rect x={x - 22} y={y - 10} width={44} height={6.4} fill="#000" opacity={0.5} /></g>
			<circle cx={x + lx + 2.4} cy={y - 1.6} r={1.5} fill={s < 0 ? '#BFE6EC' : '#FFE2B8'} />
			<path d={`M${x - 22},${y + 2} C${x - 12},${y - 8} ${x + 9},${y - 9} ${x + 22},${y - 3}`} fill="none" stroke={c.line} strokeWidth={4.4} strokeLinecap="round" />
			<path d={`M${x - 16},${y + 4} C${x - 6},${y + 7} ${x + 8},${y + 6} ${x + 16},${y + 2}`} fill="none" stroke={c.line} strokeWidth={1.3} opacity={0.55} />
			<path d={`M${x - 15},${y + 12} C${x - 5},${y + 16} ${x + 8},${y + 15} ${x + 17},${y + 10}`} fill="none" stroke={c.line} strokeWidth={1.2} opacity={0.32} />
		</g>; };
	return <g>
		<defs><clipPath id={`${id}f`}><path d={FACE} /></clipPath><clipPath id={`${id}b`}><path d={BEARD} /></clipPath></defs>
		<path d="M-74,-168 C-82,-110 -66,-40 -34,8 M74,-168 C82,-110 66,-40 34,8" fill="none" stroke={c.hair} strokeWidth={3} opacity={0.8} />
		<path d={EARL} fill={c.skinS} /><path d="M-82,-100 C-90,-100 -92,-86 -88,-74" fill="none" stroke={c.skinD} strokeWidth={2} />
		<path d={EARR} fill={c.skin} /><path d="M80,-106 C92,-110 98,-98 96,-84 C95,-74 92,-66 86,-62 C88,-74 88,-94 80,-106 Z" fill={c.skinH} />
		<path d="M82,-100 C90,-100 92,-86 88,-74" fill="none" stroke={c.skinS} strokeWidth={2} />
		{/* the neck: a strong neck, shade, the lit side, the shadow under the jaw */}
		<path d="M-56,-14 C-58,14 -60,36 -64,60 L64,60 C60,36 58,14 56,-14 Z" fill={c.skinS} />
		<path d="M26,-4 C32,20 36,40 40,60 L64,60 C60,36 58,14 56,-14 Z" fill={c.skinH} opacity={0.7} />
		<ellipse cx={0} cy={26} rx={54} ry={16} fill={c.skinD} opacity={0.75} />
		<path d={FACE} fill={c.skin} />
		<g clipPath={`url(#${id}f)`}>
			<path d="M-4,-172 C-2,-128 -12,-96 -10,-70 C-8,-52 -16,-44 -14,-30 C-12,-14 -16,0 -12,20 L-110,20 L-110,-172 Z" fill={c.skinS} />
			<ellipse cx={-38} cy={-90} rx={30} ry={16} fill={c.skinD} opacity={0.55} />
			<ellipse cx={38} cy={-90} rx={28} ry={15} fill={c.skinS} opacity={0.55} />
			<path d="M24,-160 C50,-160 70,-150 76,-132 C76,-122 74,-114 70,-108 C56,-118 40,-126 24,-130 Z" fill={c.skinH} opacity={0.85} />
			<path d="M50,-80 C62,-82 74,-86 80,-92 C80,-74 78,-58 74,-42 C70,-32 64,-24 56,-18 C58,-36 56,-58 50,-80 Z" fill={c.skinH} />
			<path d="M60,-90 C70,-92 78,-96 81,-104 C82,-96 81,-90 80,-86 C74,-84 66,-84 60,-86 Z" fill={c.skinHH} opacity={0.8} />
			<path d="M4,-98 C8,-80 10,-62 14,-48 L6,-46 C4,-62 2,-80 0,-96 Z" fill={c.skinH} opacity={0.9} />
			<path d="M-74,-140 C-78,-110 -80,-80 -72,-50 L-82,-50 L-82,-140 Z" fill="#000" opacity={0.25} />
		</g>
		<path d="M-76,-150 C-86,-136 -88,-116 -84,-98 L-77,-104 C-78,-122 -75,-140 -68,-150 Z" fill={c.hair} />
		<path d="M76,-150 C86,-136 88,-116 84,-98 L77,-104 C78,-122 75,-140 68,-150 Z" fill={c.hair} />
		<path d="M-80,-140 C-83,-128 -83,-116 -81,-106 M-76,-146 C-79,-134 -80,-122 -79,-112 M80,-140 C83,-128 83,-116 81,-106 M76,-146 C79,-134 80,-122 79,-112" fill="none" stroke={c.grey} strokeWidth={1.4} opacity={0.7} />
		<path d="M-76,-116 C-60,-125 -36,-121 -12,-101 L-9,-94 C-16,-97 -22,-100 -30,-103 C-46,-109 -60,-111 -74,-109 Z" fill={c.hair} />
		<path d="M76,-116 C60,-125 36,-121 12,-101 L9,-94 C16,-97 22,-100 30,-103 C46,-109 60,-111 74,-109 Z" fill={c.hair} />
		<path d="M-72,-114 C-60,-120 -44,-120 -30,-112 M72,-114 C60,-120 44,-120 30,-112" fill="none" stroke={c.grey} strokeWidth={1} opacity={0.4} />
		<path d="M-6,-110 C-8,-102 -8,-94 -5,-86 M6,-110 C8,-102 8,-94 5,-86 M-8,-80 C-3,-78 3,-78 8,-80" fill="none" stroke={c.line} strokeWidth={1.9} opacity={0.6} />
		{eye(-1)}{eye(1)}
		<path d="M-8,-96 C-10,-76 -12,-60 -18,-46" fill="none" stroke={c.skinD} strokeWidth={2.4} opacity={0.6} />
		<path d="M-20,-44 C-16,-34 -6,-32 0,-35 C6,-32 16,-34 20,-44 C14,-40 8,-40 0,-42 C-8,-40 -14,-40 -20,-44 Z" fill={c.skinD} opacity={0.8} />
		<ellipse cx={-9} cy={-40} rx={5} ry={2.6} fill="#1A0C08" /><ellipse cx={9} cy={-40} rx={5} ry={2.6} fill="#2A140C" />
		<ellipse cx={7} cy={-52} rx={6} ry={4.4} fill={c.skinHH} opacity={0.75} />
		<path d="M-22,-46 C-32,-36 -36,-26 -36,-14" fill="none" stroke={c.skinD} strokeWidth={1.8} opacity={0.6} />
		<path d="M22,-46 C32,-36 36,-26 36,-14" fill="none" stroke={c.skinS} strokeWidth={1.6} opacity={0.6} />
		{/* the set mouth and the lower lip */}
		<path d="M-20,-13 C-12,-19 12,-19 20,-13 C12,-16 -12,-16 -20,-13 Z" fill="#2A120C" />
		<path d="M-12,-9 C-6,-11 6,-11 12,-9 C8,-4 -8,-4 -12,-9 Z" fill={c.skinS} /><path d="M2,-9 C6,-10 10,-9 12,-8 C9,-6 5,-5 2,-6 Z" fill={c.skinH} opacity={0.7} />
		{/* the beard: dense and short, greying; lit warm on his left, the cool accent on his right */}
		<path d={BEARD} fill="#2E2824" />
		<g clipPath={`url(#${id}b)`}>
			<path d="M-90,-80 L-6,-80 C-8,-40 -10,0 -8,40 L-90,40 Z" fill="#000" opacity={0.35} />
			<path d="M50,-60 C70,-60 84,-70 86,-80 L90,40 L30,40 C52,20 62,0 66,-20 C62,-36 56,-50 50,-60 Z" fill="#6A4A34" opacity={0.55} />
			<path d={BSTR} fill="none" stroke={c.grey} strokeWidth={2} strokeLinecap="round" opacity={0.9} />
			<path d="M-30,14 C-20,22 -10,26 0,27 M-16,24 l3,7 M-4,26 l1,8 M8,26 l-1,8 M20,22 l-2,7 M30,16 l-3,7" fill="none" stroke={c.grey} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
		</g>
		<path d="M83,-76 C82,-52 76,-30 64,-10 C50,12 28,32 0,36" fill="none" stroke={c.metalH} strokeWidth={2.4} opacity={0.75} />
		<path d="M-83,-76 C-82,-52 -76,-30 -64,-10 C-50,12 -28,32 0,36" fill="none" stroke="#8FD0DC" strokeWidth={1.6} opacity={0.45} />
		{/* the moustache joining the beard at the corners of the mouth */}
		<path d="M-2,-31 C-14,-34 -28,-29 -34,-10 C-30,-14 -20,-21 -3,-22 Z M2,-31 C14,-34 28,-29 34,-10 C30,-14 20,-21 3,-22 Z" fill="#2E2824" />
		<path d="M-28,-24 C-22,-27 -14,-28 -8,-27 M28,-24 C22,-27 14,-28 8,-27" fill="none" stroke={c.grey} strokeWidth={1.2} opacity={0.6} />
		{/* the 帻 band, the lacquered gauze 武冠 over the topknot */}
		<path d="M-60,-176 C-62,-196 -50,-206 0,-208 C50,-206 62,-196 60,-176 Z" fill={c.hair} />
		<path d="M-26,-196 C-30,-226 -20,-252 0,-256 C20,-252 30,-226 26,-196 Z" fill={c.hair} />
		<path d="M-70,-172 C-74,-226 -58,-272 -30,-290 C-10,-300 10,-300 30,-290 C58,-272 74,-226 70,-172 Z" fill="#0C0908" opacity={0.86} />
		<path d="M-56,-176 C-60,-222 -48,-262 -26,-282 M-28,-174 C-30,-226 -22,-268 -10,-294 M0,-174 L0,-298 M28,-174 C30,-226 22,-268 10,-294 M56,-176 C60,-222 48,-262 26,-282 M-70,-204 C-30,-214 30,-214 70,-204 M-68,-236 C-30,-246 30,-246 68,-236 M-54,-266 C-24,-276 24,-276 54,-266" fill="none" stroke="#B0A090" strokeOpacity={0.09} strokeWidth={1.4} />
		<path d="M30,-290 C58,-272 74,-226 70,-172" fill="none" stroke={c.metalH} strokeWidth={3} opacity={0.8} />
		<path d="M-30,-290 C-58,-272 -74,-226 -70,-172" fill="none" stroke="#8FD0DC" strokeWidth={2} opacity={0.55} />
		<path d="M-82,-148 C-50,-160 50,-160 82,-148 L82,-176 C50,-188 -50,-188 -82,-176 Z" fill={c.hair} />
		<path d="M-82,-150 C-50,-162 50,-162 82,-150" fill="none" stroke="#6A2A1E" strokeWidth={4} />
		<path d="M40,-182 C60,-180 74,-176 82,-170 L82,-160 C72,-166 58,-170 40,-172 Z" fill={c.metalH} opacity={0.35} />
	</g>; };

/* ---------- the body, front view ---------- */
/* the cuirass has a round neck opening; the robe under it shows the 交领 右衽 (his left panel over his right: a "y" at the throat) */
const TORSO = 'M-160,96 C-130,66 -92,50 -64,44 C-48,70 -24,92 0,96 C24,92 48,70 64,44 C92,50 130,66 160,96 C172,170 168,310 158,470 L-158,470 C-168,310 -172,170 -160,96 Z';
const PAUL = 'M-238,124 C-232,84 -190,60 -130,62 C-122,124 -128,192 -140,240 C-174,252 -214,246 -244,230 C-250,186 -248,150 -238,124 Z';
const PAUR = 'M238,124 C232,84 190,60 130,62 C122,124 128,192 140,240 C174,252 214,246 244,230 C250,186 248,150 238,124 Z';
const SKIRT = 'M-160,468 L160,468 L204,822 L-204,822 Z';
/** the right arm (screen left) toward the camera, foreshortened: fist at F (local), fist scale fs, the sword's point at T; bw = blade width at the guard */
export type ArmF = {F: P; fs: number; T: P; bw?: number; tipK?: number};
const LamP: React.FC<{id: string; s: number}> = ({id, s}) => <pattern id={id} width={12 * s} height={22 * s} patternUnits="userSpaceOnUse">
	<rect width={12 * s} height={22 * s} fill="#241E1C" />
	<path d={`M${s * 0.6},${s * 0.6} L${11.6 * s},${s * 0.6} L${11.6 * s},${17.5 * s} C${9 * s},${19.6 * s} ${3 * s},${19.6 * s} ${s * 0.6},${17.5 * s} Z`} fill={FP.metal} />
	<rect x={s * 0.6} y={s * 0.6} width={11 * s} height={2.4 * s} fill="#8A7A70" opacity={0.3} />
	<rect x={0} y={19.8 * s} width={12 * s} height={2.2 * s} fill={FP.lace} opacity={0.7} />
</pattern>;
/** the geometry of the hand and the 宝剑 for an arm pose */
const swordGeo = (arm: ArmF) => {
	const S: P = [-176, 118], F = arm.F, fs = arm.fs, d0 = [F[0] - S[0], F[1] - S[1]], L0 = Math.hypot(d0[0], d0[1]), u: P = [d0[0] / L0, d0[1] / L0], n: P = [-u[1], u[0]];
	const dT = [arm.T[0] - F[0], arm.T[1] - F[1]], LT = Math.hypot(dT[0], dT[1]), ub: P = [dT[0] / LT, dT[1] / LT], nb: P = [-ub[1], ub[0]];
	const G: P = add(F, ub, 50 * fs), bw = (arm.bw ?? 26) * fs, wT = bw * (arm.tipK ?? 1.2), T = arm.T, C1: P = add(T, ub, -wT * 1.9);
	return {S, F, fs, u, n, L0, ub, nb, G, bw, wT, T, C1, au: Math.atan2(u[1], u[0]) * 180 / Math.PI, ag: Math.atan2(ub[1], ub[0]) * 180 / Math.PI};
};
/** the 宝剑 from its guard to the point: straight, double-edged, a central ridge, wider toward the lens; a plain dark bronze guard with
    one thin gold inlay line; drawn in the figure's local frame (the caller places it), over the fist */
export const SwordF: React.FC<{id: string; arm: ArmF}> = ({id, arm}) => { const g = swordGeo(arm), {G, ub, nb, bw, wT, T, C1, fs} = g;
	const lA = add(G, nb, bw / 2), rA = add(G, nb, -bw / 2), lB = add(C1, nb, wT / 2), rB = add(C1, nb, -wT / 2);
	/* a proper sword point: the edges curve in (slightly convex) to a sharp point on the ridge line */
	const tl = Math.hypot(T[0] - C1[0], T[1] - C1[1]), cL = add(add(C1, ub, tl * 0.55), nb, wT * 0.46), cR = add(add(C1, ub, tl * 0.55), nb, -wT * 0.46);
	const q = (a: P) => `${f1(a[0])},${f1(a[1])}`;
	const gd = (k: number, w: number): P[] => [add(add(G, ub, k), nb, w), add(add(G, ub, k), nb, -w)];
	const [q1, q2] = gd(-7 * fs, 26 * fs), [q3, q4] = gd(6 * fs, 23 * fs), [q5, q6] = gd(-12 * fs, 14 * fs);
	return <g>
		<defs>
			<linearGradient id={`${id}sl`} x1={f1(G[0])} y1={f1(G[1])} x2={f1(T[0])} y2={f1(T[1])} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8A7060" /><stop offset="0.5" stopColor="#E0A46C" /><stop offset="1" stopColor="#FFE2B4" /></linearGradient>
			<linearGradient id={`${id}sd`} x1={f1(G[0])} y1={f1(G[1])} x2={f1(T[0])} y2={f1(T[1])} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#22262C" /><stop offset="0.65" stopColor="#3C4A54" /><stop offset="1" stopColor="#6E8E98" /></linearGradient>
		</defs>
		{/* the two faces of the blade meeting at the ridge: lit toward the fire, cool on the other side */}
		<path d={`M${q(G)} L${q(lA)} L${q(lB)} Q${q(cL)} ${q(T)} Z`} fill={`url(#${id}sd)`} />
		<path d={`M${q(G)} L${q(rA)} L${q(rB)} Q${q(cR)} ${q(T)} Z`} fill={`url(#${id}sl)`} />
		<path d={`M${q(G)} L${q(T)}`} fill="none" stroke="#FFF0D4" strokeWidth={1.8 * fs} opacity={0.9} />
		<path d={`M${q(lA)} L${q(lB)} Q${q(cL)} ${q(T)}`} fill="none" stroke="#8FD0DC" strokeWidth={1.5 * fs} opacity={0.75} />
		<path d={`M${q(rA)} L${q(rB)} Q${q(cR)} ${q(T)}`} fill="none" stroke="#FFF2D8" strokeWidth={2 * fs} opacity={0.95} />
		{/* one thin gold inlay line along the ridge just past the guard */}
		<path d={`M${q(add(G, ub, 12 * fs))} L${q(add(G, ub, 88 * fs))}`} fill="none" stroke="#E0B060" strokeWidth={2.4 * fs} opacity={0.95} />
		{/* the guard (剑格): a plain dark bronze bar, a lit edge */}
		<polygon points={pp([q1, q5, q2, q4, q3])} fill="#2E261E" />
		<polygon points={pp([q1, q5, q2, add(q2, ub, 4 * fs), add(q1, ub, 4 * fs)])} fill="#7A6040" opacity={0.85} />
		<polyline points={pp([q3, q4])} fill="none" stroke="#B08A50" strokeWidth={2 * fs} opacity={0.7} />
		{void q6}
	</g>; };
export const CaoFront: React.FC<{id: string; arm: ArmF; t: number; capeK?: number; legs?: boolean; part?: 'all' | 'body' | 'sword'}> = ({id, arm, t, capeK = 1, legs, part = 'all'}) => { const c = FP;
	if (part === 'sword') return <SwordF id={id} arm={arm} />;
	/* the cape: two flaps behind the shoulders, whipping out to screen right (the wind of the charge) */
	const w1 = Math.sin(t * 5.1) * 26 * capeK, w2 = Math.sin(t * 6.3 + 1.2) * 34 * capeK, w3 = Math.sin(t * 4.2 + 2.1) * 22 * capeK;
	const CAPER = `M120,72 C230,52 360,92 ${470 + w1},${170 + w1 * 0.4} C${560 + w2},${230 + w2 * 0.3} ${640 + w2},${330 + w3} ${700 + w3},${420 + w2 * 0.5} C${620 + w3},${430 + w1} ${560 + w1},${470 + w3} ${520 + w2 * 0.6},${560 + w1} C${440 + w1},${520} ${360},${560 + w3 * 0.5} ${300},${640} C${270},${480} ${240},${300} 150,170 Z`;
	const CAPEL = `M-120,72 C-200,80 -270,150 ${-320 + w3 * 0.6},${260 + w1 * 0.3} C${-360 + w1 * 0.5},${360} ${-380 + w2 * 0.4},${470} ${-400 + w3 * 0.5},${600} L-250,640 C-240,480 -220,300 -150,170 Z`;
	const g = swordGeo(arm), {S, F, fs, u, n, L0, ub} = g;
	const W: P = add(F, u, -38 * fs), BR0: P = add(W, u, -46 * fs);
	const sleeve = limb([S, add(S, u, L0 * 0.4), BR0], [54, 48 + 6 * fs, 40 * fs]);
	const bracer = limb([BR0, W], [40 * fs, 44 * fs]);
	/* the fist, in a frame along the grip (+x toward the point); the lit side is the one facing screen right */
	const litSide = (-ub[1] * 1 + ub[0] * 0) < 0 ? 1 : -1;      /* +y of the frame points (−ub_y, ub_x); lit when that is to the right */
	const fy = (y: number) => y * litSide;
	return <g>
		<defs>
			<LamP id={`${id}lm`} s={1.55} />
			<clipPath id={`${id}t`}><path d={TORSO} /></clipPath>
			<clipPath id={`${id}cr`}><path d={CAPER} /></clipPath>
			<clipPath id={`${id}nk`}><path d="M-84,20 L84,20 L64,44 C48,70 24,92 0,96 C-24,92 -48,70 -64,44 L-84,20 Z" /></clipPath>
		</defs>
		<path d={CAPEL} fill={c.cape} />
		<path d={`M-150,170 C-220,300 -240,480 -250,640 L-300,630 C-280,460 -250,300 -170,160 Z`} fill={c.capeS} />
		<path d={CAPER} fill={c.cape} />
		<g clipPath={`url(#${id}cr)`}>
			<path d={`M150,170 C240,300 270,480 300,640 L380,640 C340,470 300,320 210,150 Z`} fill={c.capeS} />
			<path d={`M200,90 C320,110 ${430 + w1},${190} ${520 + w2},${300} C${430 + w1},${250} 320,${180} 200,130 Z`} fill={c.capeH} opacity={0.55} />
			<path d={`M${470 + w1},${170 + w1 * 0.4} C${560 + w2},${230 + w2 * 0.3} ${640 + w2},${330 + w3} ${700 + w3},${420 + w2 * 0.5} L${660 + w3},${430 + w2 * 0.5} C${600 + w2},${340 + w3} ${530 + w2},${250} ${450 + w1},${200} Z`} fill={c.capeH} opacity={0.8} />
		</g>
		{/* full figure: heroic legs (8 heads): his right leg forward (screen left, lower = nearer), the left leg back; the robe below the
		    lamellar skirt, trousers, boots; soles at about +1620 */}
		{legs && <g>
			<path d={limb([[90, 800], [150, 1170], [196, 1500]], [74, 54, 40])} fill={c.under} />
			<path d={limb([[130, 820], [186, 1170], [226, 1480]], [18, 13, 9])} fill={c.underH} opacity={0.65} />
			<path d={limb([[-88, 800], [-160, 1180], [-228, 1540]], [76, 56, 42])} fill={c.under} />
			<path d={limb([[-120, 820], [-196, 1180], [-262, 1530]], [16, 12, 8])} fill="#6FA8B4" opacity={0.25} />
			<path d={limb([[-60, 820], [-128, 1180], [-196, 1540]], [26, 18, 12])} fill="#000" opacity={0.3} />
			<path d="M154,1380 L236,1380 C240,1450 246,1520 254,1570 C236,1594 166,1596 136,1584 C138,1520 146,1450 154,1380 Z" fill="#1A120E" />
			<path d="M218,1380 L236,1380 C240,1450 246,1520 254,1570 L236,1578 Z" fill={c.metalH} opacity={0.5} />
			<path d="M-268,1400 L-186,1400 C-182,1474 -176,1550 -168,1608 C-190,1636 -274,1638 -306,1620 C-290,1556 -276,1478 -268,1400 Z" fill="#120C0A" />
			<path d="M-196,1400 L-186,1400 C-182,1474 -176,1550 -168,1608 L-180,1614 Z" fill={c.metalH} opacity={0.35} />
			<path d="M-268,1400 L-186,1400 L-187,1416 L-268,1416 Z M154,1380 L236,1380 L237,1394 L154,1394 Z" fill="#2E2218" />
			{/* the robe under the armour, to below the knee, parted between the legs */}
			<path d="M-196,800 L196,800 C214,890 226,980 234,1070 L60,1070 L4,930 L-50,1080 L-252,1090 C-236,990 -216,890 -196,800 Z" fill={c.under} />
			<path d="M-196,800 L-50,800 L-50,1080 L-252,1090 C-236,990 -216,890 -196,800 Z" fill="#000" opacity={0.35} />
			<path d="M140,800 L196,800 C214,890 226,980 234,1070 L180,1070 Z" fill={c.underH} opacity={0.45} />
			<path d="M-252,1090 L-50,1080 L4,930 L60,1070 L234,1070 L234,1054 L60,1054 L4,910 L-50,1064 L-252,1074 Z" fill={c.underS} />
			<path fill={`url(#${id}lm)`} d={SKIRT} />
			<path d="M0,468 L0,822" stroke={c.metalS} strokeWidth={5} />
			<path d="M-204,822 L204,822 L202,804 L-202,804 Z" fill={c.lace} />
			<path d="M60,470 L170,470 L204,822 L86,822 Z" fill={c.metalH} opacity={0.32} />
			<path d="M-160,470 L-40,470 L-64,822 L-204,822 Z" fill="#000" opacity={0.42} />
		</g>}
		{/* the left arm (screen right) hanging at his side */}
		<path d={limb([[196, 150], [224, 370], [214, 600]], [44, 38, 34])} fill={c.under} />
		<path d={limb([[220, 160], [246, 370], [236, 600]], [14, 12, 10])} fill={c.underH} opacity={0.7} />
		<path d={limb([[222, 430], [214, 590]], [38, 37])} fill={c.metal} /><path d={limb([[242, 430], [236, 590]], [9, 8])} fill={c.metalH} opacity={0.75} />
		<path d="M186,592 C200,584 236,586 248,602 C256,624 248,650 224,656 C200,660 184,642 184,620 Z" fill={c.skinS} />
		<path d="M226,592 C242,594 252,608 250,628 C248,642 240,650 230,654 C238,636 240,612 226,592 Z" fill={c.skinH} />
		<path d="M190,620 C204,616 222,618 236,624 M192,636 C206,632 222,634 234,640" fill="none" stroke={c.skinD} strokeWidth={2} opacity={0.6} />
		{/* the cuirass: lamellar, shaded away from the fire, lit toward it, laced rows */}
		<path d={TORSO} fill={`url(#${id}lm)`} />
		<g clipPath={`url(#${id}t)`}>
			<path d="M-30,60 C-36,200 -40,340 -44,480 L-180,480 L-180,60 Z" fill="#000" opacity={0.5} />
			<path d="M80,64 C110,180 116,320 112,480 L180,480 L180,64 Z" fill={c.metalH} opacity={0.38} />
			<path d="M128,70 C150,180 156,320 152,480 L180,480 L180,70 Z" fill="#FFC890" opacity={0.3} />
			{[160, 250, 340].map((y) => <rect key={y} x={-180} y={y} width={360} height={4} fill={c.lace} opacity={0.6} />)}
		</g>
		<path d="M-160,96 C-130,66 -92,50 -64,44 C-48,70 -24,92 0,96 C24,92 48,70 64,44 C92,50 130,66 160,96" fill="none" stroke={c.lace} strokeWidth={7} />
		{/* the leather belt and its bronze 带钩 at the front */}
		<path d="M-162,438 L162,438 L164,476 L-164,476 Z" fill="#2A1A10" />
		<path d="M-162,438 L162,438 L162,444 L-162,444 Z" fill="#5A3A22" opacity={0.8} /><path d="M40,438 L162,438 L164,476 L40,476 Z" fill="#C07040" opacity={0.18} />
		<path d="M38,449 C44,452 46,462 38,467 C14,471 -14,467 -28,463 C-36,461 -42,460 -47,458 C-52,455 -51,450 -46,449 C-42,449 -40,452 -42,455 C-36,456 -30,455 -24,454 C-8,450 14,447 38,449 Z" fill="#7A5A30" />
		<path d="M38,449 C14,447 -8,450 -24,454 C-30,455 -36,456 -42,455 L-41,452 C-34,452 -26,451 -18,450 C0,447 20,445 38,449 Z" fill="#D6A456" opacity={0.85} />
		<path d="M38,467 C14,471 -14,467 -28,463" fill="none" stroke="#3A2A18" strokeWidth={2} />
		{/* the 披膊 over his left shoulder (screen right) */}
		<path d={PAUR} fill={`url(#${id}lm)`} />
		<path d="M200,70 C226,80 238,100 240,130 C246,170 246,200 242,230 L222,236 C226,190 222,130 196,82 Z" fill={c.metalH} opacity={0.5} />
		<path d="M242,230 C214,246 176,252 144,240" fill="none" stroke={c.lace} strokeWidth={8} />
		<g transform="translate(0,-18) scale(1.14)"><HeadF id={`${id}h`} /></g>
		{/* the robe in the neck opening, over the base of the neck: 交领 右衽 — his right panel's collar (a white inner collar, a dark
		    border) from his right, then his left panel crossing over it from his left shoulder down to his right side: a "y" at the throat */}
		<g clipPath={`url(#${id}nk)`}>
			<path d="M-80,30 C-40,22 40,22 80,30 L80,110 L-80,110 Z" fill={c.under} />
			<path d="M-66,40 C-46,50 -26,56 -6,64" fill="none" stroke="#24120E" strokeWidth={14} />
			<path d="M-62,32 C-42,42 -22,48 -2,56" fill="none" stroke={c.white} strokeWidth={8} opacity={0.85} />
			<path d="M62,30 C40,40 18,50 -2,58 C-24,68 -48,86 -70,108 L80,108 L80,30 Z" fill={c.under} />
			<path d="M80,30 C60,44 44,60 30,76 L80,76 Z" fill={c.underH} opacity={0.4} />
			<path d="M66,38 C44,48 22,58 2,66 C-20,76 -42,92 -62,112" fill="none" stroke="#24120E" strokeWidth={14} />
			<path d="M58,26 C36,36 14,46 -6,54 C-28,64 -52,82 -74,104" fill="none" stroke={c.white} strokeWidth={8} />
		</g>
		<path d="M-160,96 C-130,66 -92,50 -64,44 C-48,70 -24,92 0,96 C24,92 48,70 64,44 C92,50 130,66 160,96" fill="none" stroke={c.lace} strokeWidth={7} />
		{/* the right arm toward the camera: sleeve, the 披膊 over its root, the bracer and its cuff */}
		<path d={sleeve} fill={c.under} />
		<path d={limb([add(S, n, -34), add(BR0, n, -34 * fs)], [9, 10 * fs])} fill="#6FA8B4" opacity={0.3} />
		<path d={limb([add(S, n, 30), add(BR0, n, 30 * fs)], [10, 10 * fs])} fill={c.underS} opacity={0.6} />
		<path d={PAUL} fill={`url(#${id}lm)`} /><path d={PAUL} fill="#000" opacity={0.42} />
		<path d="M-244,230 C-214,246 -176,252 -140,240" fill="none" stroke={c.lace} strokeWidth={8} />
		<path d="M-238,124 C-232,84 -190,60 -130,62" fill="none" stroke="#8FD0DC" strokeWidth={3} opacity={0.5} />
		<path d={bracer} fill={c.metal} />
		<path d={limb([add(BR0, n, -32 * fs), add(W, n, -36 * fs)], [5 * fs, 6 * fs])} fill="#8FB8C0" opacity={0.45} />
		<path d={limb([add(BR0, n, 30 * fs), add(W, n, 34 * fs)], [6 * fs, 7 * fs])} fill={c.metalH} opacity={0.55} />
		<path d={limb([add(W, u, -6 * fs), add(W, u, 4 * fs)], [46 * fs, 46 * fs])} fill={c.lace} />
		{/* the hand: the wrist out of the cuff, the fist closed round the grip — four fingers wrapped round it, the knuckles, the thumb over
		    the fingers toward the guard; the cord-wrapped grip and the plain pommel showing at the heel of the hand */}
		<g transform={`translate(${f1(F[0])},${f1(F[1])}) scale(${fs.toFixed(3)}) rotate(${f1(g.ag)})`}>
			<path d={limb([[-62, fy(-14)], [-30, fy(-8)]], [30, 34])} fill={c.skinS} />
			<g transform={`translate(-46,${fy(30)})`}><rect x={-22} y={-9} width={30} height={18} rx={4} fill="#2A1C14" />
				{[-18, -10, -2, 6].map((x) => <path key={x} d={`M${x},-9 l5,18`} stroke="#6A4A30" strokeWidth={2} />)}
				<ellipse cx={-26} cy={0} rx={7} ry={14} fill="#3A2E22" /><ellipse cx={-27} cy={-4} rx={3} ry={7} fill="#9A7A4A" opacity={0.7} /></g>
			{/* the fist body */}
			<path d={`M-40,${fy(-44)} C-14,${fy(-54)} 22,${fy(-54)} 42,${fy(-42)} C54,${fy(-30)} 54,${fy(26)} 44,${fy(38)} C22,${fy(48)} -18,${fy(48)} -38,${fy(38)} C-50,${fy(24)} -52,${fy(-30)} -40,${fy(-44)} Z`} fill={c.skin} />
			{/* the curled fingers: four segments across the grip, creases between them */}
			{[-30, -10, 10, 30].map((x, i) => <g key={x}>
				<path d={`M${x - 10},${fy(-38)} C${x - 11},${fy(-14)} ${x - 10},${fy(8)} ${x - 8},${fy(22)} L${x + 8},${fy(22)} C${x + 10},${fy(8)} ${x + 11},${fy(-14)} ${x + 10},${fy(-38)} Z`} fill={i % 2 ? c.skin : '#B57650'} />
				{i < 3 && <path d={`M${x + 10},${fy(-36)} C${x + 11},${fy(-14)} ${x + 10},${fy(6)} ${x + 8},${fy(20)}`} fill="none" stroke={c.skinD} strokeWidth={1.6} opacity={0.5} />}
			</g>)}
			{/* the knuckle ridge, lit: one band with gentle bumps */}
			<path d={`M-42,${fy(-42)} C-36,${fy(-50)} -26,${fy(-50)} -20,${fy(-46)} C-14,${fy(-51)} -6,${fy(-51)} 0,${fy(-46)} C6,${fy(-51)} 14,${fy(-51)} 20,${fy(-46)} C26,${fy(-50)} 36,${fy(-50)} 44,${fy(-40)} L42,${fy(-32)} C20,${fy(-38)} -14,${fy(-38)} -40,${fy(-32)} Z`} fill={c.skinH} />
			{/* the line of the middle joints */}
			<path d={`M-40,${fy(-6)} C-14,${fy(-10)} 14,${fy(-10)} 40,${fy(-6)}`} fill="none" stroke={c.skinD} strokeWidth={1.8} opacity={0.5} />
			{/* the back of the hand toward the wrist, lit */}
			<path d={`M-40,${fy(-44)} C-50,${fy(-46)} -60,${fy(-40)} -66,${fy(-30)} L-60,${fy(-8)} C-50,${fy(-16)} -44,${fy(-30)} -40,${fy(-44)} Z`} fill={c.skinH} opacity={0.85} />
			{/* the thumb over the fingers, its tip toward the guard */}
			<path d={`M-44,${fy(30)} C-30,${fy(16)} 0,${fy(10)} 26,${fy(14)} C40,${fy(16)} 46,${fy(26)} 40,${fy(36)} C30,${fy(44)} 6,${fy(46)} -16,${fy(46)} C-34,${fy(46)} -46,${fy(40)} -44,${fy(30)} Z`} fill={c.skinS} />
			<path d={`M-36,${fy(22)} C-18,${fy(14)} 6,${fy(10)} 26,${fy(14)} C36,${fy(16)} 42,${fy(22)} 42,${fy(28)} C30,${fy(22)} 4,${fy(20)} -36,${fy(26)} Z`} fill={c.skinH} opacity={0.75} />
			<path d={`M20,${fy(42)} C30,${fy(42)} 38,${fy(38)} 40,${fy(36)}`} fill="none" stroke={c.skinD} strokeWidth={1.8} opacity={0.6} />
		</g>
		{part === 'all' && <SwordF id={id} arm={arm} />}
	</g>; };

/* ---------- a soldier running toward the camera (front view), cm, soles at 0; one fill (the caller sets it and the rim) ---------- */
export type RunKind = 'torch' | 'ji' | 'banner' | 'plain';
const rb = (ph: number) => -3 * Math.abs(Math.cos(ph));
export const RunnerF: React.FC<{ph: number; kind: RunKind}> = ({ph, kind}) => { const s = Math.sin(ph), b = rb(ph);
	const leg = (sg: number) => { const lift = Math.max(0, sg * s);
		return <path key={sg} d={limb([[sg * 8, -62 + b], [sg * 11, -32 - 24 * lift + b], [sg * 11, -3 - 38 * lift + b]], [8.4, 6.4, 4.6])} />; };
	const shoe = (sg: number) => { const lift = Math.max(0, sg * s); return <ellipse key={'s' + sg} cx={sg * 11} cy={-2 - 38 * lift + b} rx={6.4} ry={4.4 + lift * 3} />; };
	const swing = (sg: number, a: number) => <path key={'a' + sg} d={limb([[sg * 19, -138 + b], [sg * 23, -114 + 6 * a + b], [sg * 14, -94 + 12 * a + b]], [5.4, 4.6, 4])} />;
	return <g>
		{leg(-1)}{leg(1)}{shoe(-1)}{shoe(1)}
		<path d={`M-20,${-142 + b} C-12,${-148 + b} 12,${-148 + b} 20,${-142 + b} L18,${-104 + b} L24,${-58 + b} L-24,${-58 + b} L-18,${-104 + b} Z`} />
		<rect x={-5} y={-152 + b} width={10} height={12} />
		<ellipse cx={0} cy={-160 + b} rx={10.6} ry={12.6} /><ellipse cx={0} cy={-174 + b} rx={6} ry={5} />
		{kind === 'torch' && <g>{swing(-1, s)}<path d={limb([[19, -138 + b], [31, -158 + b], [27, -184 + b]], [5.4, 4.6, 4])} /><path d={limb([[27, -178 + b], [31, -214 + b]], [2, 2.4])} /></g>}
		{kind === 'plain' && <g>{swing(-1, s)}{swing(1, -s)}</g>}
		{kind === 'ji' && <g>
			<path d={limb([[19, -138 + b], [28, -116 + b], [16, -104 + b]], [5.4, 4.6, 4])} /><path d={limb([[-19, -138 + b], [-26, -122 + b], [-8, -134 + b]], [5.4, 4.6, 4])} />
			<path d={limb([[-36, -44 + b], [42, -262 + b]], [1.6, 1.6])} />
			<path d={`M42,${-262 + b} L50,${-292 + b} L46,${-258 + b} Z`} /><path d={`M41,${-252 + b} L60,${-246 + b} L62,${-240 + b} L40,${-246 + b} Z`} />
		</g>}
		{kind === 'banner' && <g>{swing(-1, s)}<path d={limb([[19, -138 + b], [30, -122 + b], [24, -110 + b]], [5.4, 4.6, 4])} /><path d={limb([[24, -40 + b], [24, -262 + b]], [2.2, 2.2])} /><path d={`M24,${-280 + b} L21,${-262 + b} L27,${-262 + b} Z`} /></g>}
	</g>; };
/** the local flame base of a running torch-bearer / the banner pole top */
export const runTop = (ph: number, kind: RunKind): P => kind === 'banner' ? [24, -260 + rb(ph)] : [31, -216 + rb(ph)];

/* ---------- fire: a flame tongue (outer orange, mid, core), flickering ---------- */
export const tongue = (x: number, y: number, w: number, h: number, sw: number) => `M${f1(x - w / 2)},${f1(y)} C${f1(x - w * 0.6)},${f1(y - h * 0.4)} ${f1(x - w * 0.2 + sw)},${f1(y - h * 0.68)} ${f1(x + sw)},${f1(y - h)} C${f1(x + w * 0.22 + sw * 0.5)},${f1(y - h * 0.6)} ${f1(x + w * 0.6)},${f1(y - h * 0.36)} ${f1(x + w / 2)},${f1(y)} Z`;
export const Flame3: React.FC<{x: number; y: number; w: number; h: number; t: number; seed: number}> = ({x, y, w, h, t, seed}) => {
	const fk = 1 + 0.13 * Math.sin(t * 12.7 + seed * 3.1) + 0.07 * Math.sin(t * 21.3 + seed), sw = w * 0.3 * Math.sin(t * 6.9 + seed * 1.7);
	return <g>
		<path d={tongue(x, y, w, h * fk, sw)} fill={FIRE.out} />
		<path d={tongue(x, y, w * 0.68, h * fk * 0.72, sw * 0.8)} fill={FIRE.mid} />
		<path d={tongue(x, y, w * 0.36, h * fk * 0.42, sw * 0.5)} fill={FIRE.core} />
	</g>; };
