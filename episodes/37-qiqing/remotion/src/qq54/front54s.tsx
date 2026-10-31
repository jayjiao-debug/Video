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
const FACE = 'M-74,-150 C-80,-130 -82,-110 -80,-92 C-79,-74 -76,-56 -68,-34 C-60,-16 -42,-2 -22,4 C-10,7 10,7 22,4 C42,-2 60,-16 68,-34 C76,-56 79,-74 80,-92 C82,-110 80,-130 74,-150 C50,-172 -50,-172 -74,-150 Z';
const EARL = 'M-78,-108 C-92,-114 -100,-100 -98,-84 C-96,-68 -90,-56 -79,-58 Z', EARR = 'M78,-108 C92,-114 100,-100 98,-84 C96,-68 90,-56 79,-58 Z';
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
		<defs><clipPath id={`${id}f`}><path d={FACE} /></clipPath></defs>
		{/* the chin tie of the cap, behind the face, and the ears */}
		<path d="M-74,-168 C-82,-110 -64,-40 -30,4 M74,-168 C82,-110 64,-40 30,4" fill="none" stroke={c.hair} strokeWidth={3} opacity={0.8} />
		<path d={EARL} fill={c.skinS} /><path d="M-82,-100 C-90,-100 -92,-86 -88,-74" fill="none" stroke={c.skinD} strokeWidth={2} />
		<path d={EARR} fill={c.skin} /><path d="M80,-106 C92,-110 98,-98 96,-84 C95,-74 92,-66 86,-62 C88,-74 88,-94 80,-106 Z" fill={c.skinH} />
		<path d="M82,-100 C90,-100 92,-86 88,-74" fill="none" stroke={c.skinS} strokeWidth={2} />
		{/* the neck: shade, the lit side, the shadow under the jaw */}
		<path d="M-50,-14 C-52,14 -54,36 -60,60 L60,60 C54,36 52,14 50,-14 Z" fill={c.skinS} />
		<path d="M24,-6 C30,20 34,40 38,60 L60,60 C54,36 52,14 50,-14 Z" fill={c.skinH} opacity={0.75} />
		<ellipse cx={0} cy={10} rx={46} ry={18} fill={c.skinD} opacity={0.7} />
		<path d={FACE} fill={c.skin} />
		<g clipPath={`url(#${id}f)`}>
			{/* the shade side (his right, screen left) follows the nose bridge; the sockets under the brow ridge */}
			<path d="M-4,-172 C-2,-128 -12,-96 -10,-70 C-8,-52 -16,-44 -14,-30 C-12,-14 -16,-2 -12,12 L-110,12 L-110,-172 Z" fill={c.skinS} />
			<ellipse cx={-38} cy={-90} rx={30} ry={16} fill={c.skinD} opacity={0.55} />
			<ellipse cx={38} cy={-90} rx={28} ry={15} fill={c.skinS} opacity={0.55} />
			{/* the lit planes toward the fire: forehead, cheekbone, jaw, the nose's right flank */}
			<path d="M24,-160 C50,-160 70,-150 76,-132 C76,-122 74,-114 70,-108 C56,-118 40,-126 24,-130 Z" fill={c.skinH} opacity={0.85} />
			<path d="M50,-80 C62,-82 74,-86 80,-92 C80,-74 78,-60 72,-44 C68,-34 62,-24 54,-16 C56,-34 54,-58 50,-80 Z" fill={c.skinH} />
			<path d="M60,-90 C70,-92 78,-96 81,-104 C82,-96 81,-90 80,-86 C74,-84 66,-84 60,-86 Z" fill={c.skinHH} opacity={0.8} />
			<path d="M4,-98 C8,-80 10,-62 14,-48 L6,-46 C4,-62 2,-80 0,-96 Z" fill={c.skinH} opacity={0.9} />
			<path d="M-74,-140 C-78,-110 -80,-80 -72,-50 L-82,-50 L-82,-140 Z" fill="#000" opacity={0.25} />
		</g>
		{/* hair at the temples under the band, greying */}
		<path d="M-76,-150 C-86,-136 -88,-116 -84,-98 L-77,-104 C-78,-122 -75,-140 -68,-150 Z" fill={c.hair} />
		<path d="M76,-150 C86,-136 88,-116 84,-98 L77,-104 C78,-122 75,-140 68,-150 Z" fill={c.hair} />
		<path d="M-80,-140 C-83,-128 -83,-116 -81,-106 M-76,-146 C-79,-134 -80,-122 -79,-112 M80,-140 C83,-128 83,-116 81,-106 M76,-146 C79,-134 80,-122 79,-112" fill="none" stroke={c.grey} strokeWidth={1.4} opacity={0.7} />
		{/* brows: thick, drawn down toward the centre; the frown */}
		<path d="M-76,-116 C-60,-125 -36,-121 -12,-101 L-9,-94 C-16,-97 -22,-100 -30,-103 C-46,-109 -60,-111 -74,-109 Z" fill={c.hair} />
		<path d="M76,-116 C60,-125 36,-121 12,-101 L9,-94 C16,-97 22,-100 30,-103 C46,-109 60,-111 74,-109 Z" fill={c.hair} />
		<path d="M-72,-114 C-60,-120 -44,-120 -30,-112 M72,-114 C60,-120 44,-120 30,-112" fill="none" stroke={c.grey} strokeWidth={1} opacity={0.4} />
		<path d="M-6,-110 C-8,-102 -8,-94 -5,-86 M6,-110 C8,-102 8,-94 5,-86 M-8,-80 C-3,-78 3,-78 8,-80" fill="none" stroke={c.line} strokeWidth={1.9} opacity={0.6} />
		<path d="M-24,-138 C-8,-142 8,-142 24,-138" fill="none" stroke={c.line} strokeWidth={1.2} opacity={0.3} />
		{eye(-1)}{eye(1)}
		{/* nose: the bridge's shadow, the base, nostrils; the folds */}
		<path d="M-8,-96 C-10,-76 -12,-60 -18,-46" fill="none" stroke={c.skinD} strokeWidth={2.4} opacity={0.6} />
		<path d="M-20,-44 C-16,-34 -6,-32 0,-35 C6,-32 16,-34 20,-44 C14,-40 8,-40 0,-42 C-8,-40 -14,-40 -20,-44 Z" fill={c.skinD} opacity={0.8} />
		<ellipse cx={-9} cy={-40} rx={5} ry={2.6} fill="#1A0C08" /><ellipse cx={9} cy={-40} rx={5} ry={2.6} fill="#2A140C" />
		<ellipse cx={7} cy={-52} rx={6} ry={4.4} fill={c.skinHH} opacity={0.75} />
		<path d="M-22,-46 C-32,-34 -36,-22 -34,-8" fill="none" stroke={c.skinD} strokeWidth={1.8} opacity={0.6} />
		<path d="M22,-46 C32,-34 36,-22 34,-8" fill="none" stroke={c.skinS} strokeWidth={1.6} opacity={0.6} />
		{/* short greying beard: the jaw line, moustache, the chin tuft */}
		<path d="M-81,-66 C-76,-42 -62,-16 -32,-2 C-20,4 -10,6 0,6 C10,6 20,4 32,-2 C62,-16 76,-42 81,-66 L74,-64 C70,-42 58,-22 30,-10 C18,-6 -18,-6 -30,-10 C-58,-22 -70,-42 -74,-64 Z" fill={c.hair} />
		<path d="M-2,-30 C-14,-33 -28,-28 -36,-12 C-30,-16 -18,-21 -4,-22 Z M2,-30 C14,-33 28,-28 36,-12 C30,-16 18,-21 4,-22 Z" fill={c.hair} />
		<path d="M-21,-11 C-12,-18 12,-18 21,-11 C12,-15 -12,-15 -21,-11 Z" fill="#2A120C" />
		<path d="M-14,-10 C-10,-12 10,-12 14,-10 C10,-7 -10,-7 -14,-10 Z" fill={c.skinS} />
		<path d="M-16,-6 C-20,8 -14,26 0,34 C14,26 20,8 16,-6 C8,-3 -8,-3 -16,-6 Z" fill={c.hair} />
		<path d="M-8,4 C-8,14 -4,24 0,30 M6,2 C7,12 5,22 2,30 M-28,-6 C-40,-14 -52,-26 -62,-44 M30,-6 C42,-14 54,-26 64,-44 M-30,-20 C-24,-24 -16,-26 -8,-26 M30,-20 C24,-24 16,-26 8,-26" fill="none" stroke={c.grey} strokeWidth={1.3} opacity={0.6} />
		<path d="M64,-40 C56,-24 44,-12 30,-6 M16,-6 C18,10 12,24 4,32" fill="none" stroke={c.metalH} strokeWidth={2} opacity={0.6} />
		{/* the 帻 band across the forehead with its red trim, then the lacquered gauze 武冠 over the topknot */}
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
const TORSO = 'M-160,96 C-130,66 -84,50 -52,44 L52,44 C84,50 130,66 160,96 C172,170 168,310 158,470 L-158,470 C-168,310 -172,170 -160,96 Z';
const PAUL = 'M-238,124 C-232,84 -190,60 -130,62 C-122,124 -128,192 -140,240 C-174,252 -214,246 -244,230 C-250,186 -248,150 -238,124 Z';
const PAUR = 'M238,124 C232,84 190,60 130,62 C122,124 128,192 140,240 C174,252 214,246 244,230 C250,186 248,150 238,124 Z';
const SKIRT = 'M-160,468 L160,468 L196,800 L-196,800 Z';
/** the right arm (screen left) toward the camera, foreshortened: fist at F (local), fist scale fs, blade to the tip T; bw = blade width at the guard */
export type ArmF = {F: P; fs: number; T: P; bw?: number; tipK?: number};
const LamP: React.FC<{id: string; s: number}> = ({id, s}) => <pattern id={id} width={12 * s} height={22 * s} patternUnits="userSpaceOnUse">
	<rect width={12 * s} height={22 * s} fill="#241E1C" />
	<path d={`M${s * 0.6},${s * 0.6} L${11.6 * s},${s * 0.6} L${11.6 * s},${17.5 * s} C${9 * s},${19.6 * s} ${3 * s},${19.6 * s} ${s * 0.6},${17.5 * s} Z`} fill={FP.metal} />
	<rect x={s * 0.6} y={s * 0.6} width={11 * s} height={2.4 * s} fill="#8A7A70" opacity={0.3} />
	<rect x={0} y={19.8 * s} width={12 * s} height={2.2 * s} fill={FP.lace} opacity={0.7} />
</pattern>;
export const CaoFront: React.FC<{id: string; arm: ArmF; t: number; capeK?: number; legs?: boolean; glint?: number}> = ({id, arm, t, capeK = 1, legs, glint = 0}) => { const c = FP;
	/* the cape: two flaps behind the shoulders, whipping out to screen right (the wind of the charge) */
	const w1 = Math.sin(t * 5.1) * 26 * capeK, w2 = Math.sin(t * 6.3 + 1.2) * 34 * capeK, w3 = Math.sin(t * 4.2 + 2.1) * 22 * capeK;
	const CAPER = `M120,72 C230,52 360,92 ${470 + w1},${170 + w1 * 0.4} C${560 + w2},${230 + w2 * 0.3} ${640 + w2},${330 + w3} ${700 + w3},${420 + w2 * 0.5} C${620 + w3},${430 + w1} ${560 + w1},${470 + w3} ${520 + w2 * 0.6},${560 + w1} C${440 + w1},${520} ${360},${560 + w3 * 0.5} ${300},${640} C${270},${480} ${240},${300} 150,170 Z`;
	const CAPEL = `M-120,72 C-200,80 -270,150 ${-320 + w3 * 0.6},${260 + w1 * 0.3} C${-360 + w1 * 0.5},${360} ${-380 + w2 * 0.4},${470} ${-400 + w3 * 0.5},${600} L-250,640 C-240,480 -220,300 -150,170 Z`;
	/* the extended arm: the sleeve from under the 披膊, a short bracer ending in its round cuff toward us, the fist */
	const S: P = [-176, 118], F = arm.F, fs = arm.fs, d0 = [F[0] - S[0], F[1] - S[1]], L0 = Math.hypot(d0[0], d0[1]), u: P = [d0[0] / L0, d0[1] / L0], n: P = [-u[1], u[0]];
	const W: P = add(F, u, -34 * fs), BR0: P = add(W, u, -46 * fs);
	const sleeve = limb([S, add(S, u, L0 * 0.4), BR0], [54, 48 + 6 * fs, 40 * fs]);
	const bracer = limb([BR0, W], [40 * fs, 46 * fs]);
	const au = Math.atan2(u[1], u[0]) * 180 / Math.PI;
	/* the 环首刀: straight single-edged blade, wider toward the lens; the oblique point on the edge side */
	const dT = [arm.T[0] - F[0], arm.T[1] - F[1]], LT = Math.hypot(dT[0], dT[1]), ub: P = [dT[0] / LT, dT[1] / LT], nb: P = [-ub[1], ub[0]];
	const G: P = add(F, ub, 16 * fs), bw = (arm.bw ?? 18) * fs, tk = arm.tipK ?? 2.6, T = arm.T, wT = bw * tk, tl = wT * 0.95;
	const C1: P = add(add(T, nb, -wT / 2), ub, -tl);
	const spineA = add(G, nb, -bw / 2), spineB = add(C1, nb, -wT / 2), edgeA = add(G, nb, bw / 2), edgeB = add(C1, nb, wT / 2), midA = add(G, nb, bw * 0.1), midB = add(C1, nb, wT * 0.1);
	const ag = Math.atan2(ub[1], ub[0]) * 180 / Math.PI;
	return <g>
		<defs>
			<LamP id={`${id}lm`} s={1.55} />
			<clipPath id={`${id}t`}><path d={TORSO} /></clipPath>
			<clipPath id={`${id}cr`}><path d={CAPER} /></clipPath>
			<linearGradient id={`${id}bl`} x1={f1(G[0])} y1={f1(G[1])} x2={f1(T[0])} y2={f1(T[1])} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8A6A58" /><stop offset="0.5" stopColor="#D89A64" /><stop offset="1" stopColor="#FFDCA8" /></linearGradient>
			<linearGradient id={`${id}bd`} x1={f1(G[0])} y1={f1(G[1])} x2={f1(T[0])} y2={f1(T[1])} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#24262A" /><stop offset="0.7" stopColor="#3E4C54" /><stop offset="1" stopColor="#6A8A94" /></linearGradient>
			<radialGradient id={`${id}gl`}><stop offset="0" stopColor="#FFF6E0" stopOpacity="1" /><stop offset="0.2" stopColor="#FFD08A" stopOpacity="0.6" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient>
		</defs>
		{/* the cape behind */}
		<path d={CAPEL} fill={c.cape} />
		<path d={`M-150,170 C-220,300 -240,480 -250,640 L-300,630 C-280,460 -250,300 -170,160 Z`} fill={c.capeS} />
		<path d={CAPER} fill={c.cape} />
		<g clipPath={`url(#${id}cr)`}>
			<path d={`M150,170 C240,300 270,480 300,640 L380,640 C340,470 300,320 210,150 Z`} fill={c.capeS} />
			<path d={`M200,90 C320,110 ${430 + w1},${190} ${520 + w2},${300} C${430 + w1},${250} 320,${180} 200,130 Z`} fill={c.capeH} opacity={0.55} />
			<path d={`M${470 + w1},${170 + w1 * 0.4} C${560 + w2},${230 + w2 * 0.3} ${640 + w2},${330 + w3} ${700 + w3},${420 + w2 * 0.5} L${660 + w3},${430 + w2 * 0.5} C${600 + w2},${340 + w3} ${530 + w2},${250} ${450 + w1},${200} Z`} fill={c.capeH} opacity={0.8} />
		</g>
		{/* legs (full figure only): crimson trousers into dark boots, a wide stance */}
		{legs && <g>
			<path d="M-176,760 C-196,900 -206,1040 -214,1170 L-62,1170 C-56,1040 -40,900 -16,760 Z" fill={c.underS} />
			<path d="M16,760 C40,900 56,1040 62,1170 L214,1170 C206,1040 196,900 176,760 Z" fill={c.under} /><path d="M130,760 C150,900 170,1040 180,1170 L214,1170 C206,1040 196,900 176,760 Z" fill={c.underH} opacity={0.5} />
			<path d="M-120,900 C-110,960 -104,1040 -104,1120 M110,900 C112,960 116,1040 120,1120" fill="none" stroke="#1A0C0A" strokeWidth={4} opacity={0.5} />
			<path d="M-222,1150 L-64,1150 L-58,1320 C-70,1354 -200,1358 -238,1340 C-236,1280 -230,1210 -222,1150 Z" fill="#120C0A" />
			<path d="M64,1150 L222,1150 C230,1210 236,1280 238,1340 C200,1358 70,1354 58,1320 Z" fill="#1A120E" /><path d="M186,1150 L222,1150 C230,1210 236,1280 238,1340 L210,1346 Z" fill={c.metalH} opacity={0.35} />
			<path d="M-222,1150 L-64,1150 L-64,1170 L-222,1170 Z M64,1150 L222,1150 L222,1170 L64,1170 Z" fill="#2E2218" />
			<path fill={`url(#${id}lm)`} d={SKIRT} />
			<path d="M0,468 L0,800" stroke={c.metalS} strokeWidth={5} />
			<path d="M-196,800 L196,800 L194,782 L-194,782 Z" fill={c.lace} />
			<path d="M60,470 L170,470 L196,800 L84,800 Z" fill={c.metalH} opacity={0.32} />
			<path d="M-160,470 L-40,470 L-64,800 L-196,800 Z" fill="#000" opacity={0.42} />
		</g>}
		{/* the left arm (screen right) hanging at his side under the 披膊 */}
		<path d={limb([[196, 150], [224, 370], [214, 600]], [44, 38, 34])} fill={c.under} />
		<path d={limb([[220, 160], [246, 370], [236, 600]], [14, 12, 10])} fill={c.underH} opacity={0.7} />
		<path d={limb([[222, 430], [214, 590]], [38, 37])} fill={c.metal} /><path d={limb([[242, 430], [236, 590]], [9, 8])} fill={c.metalH} opacity={0.75} />
		<path d="M188,594 C206,586 236,588 246,604 C252,624 244,648 222,652 C200,654 186,638 186,620 Z" fill={c.skinS} /><path d="M226,594 C240,594 250,606 248,626 C246,640 238,648 228,650 C236,634 238,612 226,594 Z" fill={c.skinH} />
		{/* the cuirass: lamellar, shaded away from the fire, lit toward it, laced rows, the belt */}
		<path d={TORSO} fill={`url(#${id}lm)`} />
		<g clipPath={`url(#${id}t)`}>
			<path d="M-30,60 C-36,200 -40,340 -44,480 L-180,480 L-180,60 Z" fill="#000" opacity={0.5} />
			<path d="M80,64 C110,180 116,320 112,480 L180,480 L180,64 Z" fill={c.metalH} opacity={0.38} />
			<path d="M128,70 C150,180 156,320 152,480 L180,480 L180,70 Z" fill="#FFC890" opacity={0.3} />
			{[150, 240, 330].map((y) => <rect key={y} x={-180} y={y} width={360} height={4} fill={c.lace} opacity={0.6} />)}
			<path d="M-180,96 C-100,72 100,72 180,96 L180,112 C100,88 -100,88 -180,112 Z" fill={c.metalS} opacity={0.7} />
		</g>
		<path d="M-162,440 L162,440 L164,476 L-164,476 Z" fill="#160E0A" /><path d="M40,440 L162,440 L164,448 L40,448 Z" fill={c.metalH} opacity={0.5} />
		<ellipse cx={30} cy={458} rx={16} ry={12} fill={c.gold} /><ellipse cx={34} cy={454} rx={6} ry={4} fill="#FFE6B0" opacity={0.7} />
		{/* the neck opening: crimson under-robe collar, the white inner collar crossing */}
		<path d="M-78,40 C-40,30 40,30 78,40 L46,112 L0,140 L-46,112 Z" fill={c.under} />
		<path d="M-60,38 L-4,124 L4,124 L-24,38 Z" fill={c.white} opacity={0.8} /><path d="M60,38 L4,124 L-4,114 L26,38 Z" fill={c.white} />
		<path d="M36,38 L4,124 L-4,124 L22,38 Z" fill="#FFE2C0" opacity={0.6} />
		<path d="M-78,40 L-46,112 L0,140 L46,112 L78,40" fill="none" stroke={c.underS} strokeWidth={6} />
		{/* the 披膊 over both shoulders */}
		<path d={PAUR} fill={`url(#${id}lm)`} />
		<path d="M200,70 C226,80 238,100 240,130 C246,170 246,200 242,230 L222,236 C226,190 222,130 196,82 Z" fill={c.metalH} opacity={0.5} />
		<path d="M242,230 C214,246 176,252 144,240" fill="none" stroke={c.lace} strokeWidth={8} />
		{/* the head */}
		<g transform="translate(0,-18) scale(1.14)"><HeadF id={`${id}h`} /></g>
		{/* the right arm toward the camera: the sleeve, the 披膊 over its root, the bracer and its cuff, the fist */}
		<path d={sleeve} fill={c.under} />
		<path d={limb([add(S, n, -34), add(BR0, n, -34 * fs)], [9, 10 * fs])} fill="#6FA8B4" opacity={0.3} />
		<path d={limb([add(S, n, 30), add(BR0, n, 30 * fs)], [10, 10 * fs])} fill={c.underS} opacity={0.6} />
		<path d={PAUL} fill={`url(#${id}lm)`} /><path d={PAUL} fill="#000" opacity={0.42} />
		<path d="M-244,230 C-214,246 -176,252 -140,240" fill="none" stroke={c.lace} strokeWidth={8} />
		<path d="M-238,124 C-232,84 -190,60 -130,62" fill="none" stroke="#8FD0DC" strokeWidth={3} opacity={0.5} />
		<path d={bracer} fill={c.metal} />
		<path d={limb([add(BR0, n, -32 * fs), add(W, n, -38 * fs)], [5 * fs, 6 * fs])} fill="#8FB8C0" opacity={0.45} />
		<path d={limb([add(BR0, n, 30 * fs), add(W, n, 36 * fs)], [6 * fs, 7 * fs])} fill={c.metalH} opacity={0.55} />
		<ellipse cx={W[0]} cy={W[1]} rx={46 * fs} ry={17 * fs} transform={`rotate(${f1(au + 90)} ${f1(W[0])} ${f1(W[1])})`} fill={c.lace} />
		<ellipse cx={W[0]} cy={W[1]} rx={40 * fs} ry={13 * fs} transform={`rotate(${f1(au + 90)} ${f1(W[0])} ${f1(W[1])})`} fill={c.underS} />
		{/* the fist seen along the grip: four finger rolls stacked toward the guard, knuckles lit by the fire, the thumb over the front */}
		<g transform={`translate(${f1(F[0])},${f1(F[1])}) scale(${fs.toFixed(3)}) rotate(${f1(au - 90)})`}>
			<path d="M-40,-42 C-22,-56 30,-56 44,-40 C56,-14 56,30 42,50 C22,62 -22,60 -40,44 C-52,20 -52,-22 -40,-42 Z" fill={c.skinS} />
			{[-30, -10, 10, 30].map((y, i) => <g key={y}>
				<path d={`M-34,${y - 10} C-4,${y - 15} 34,${y - 14} 48,${y - 4} C52,${y + 6} 46,${y + 11} 32,${y + 11} C2,${y + 11} -26,${y + 10} -36,${y + 4} Z`} fill={i % 2 ? c.skin : '#B47450'} />
				<path d={`M30,${y - 12} C42,${y - 10} 50,${y - 4} 50,${y + 4} C48,${y + 9} 42,${y + 11} 36,${y + 11} C42,${y + 4} 40,${y - 6} 30,${y - 12} Z`} fill={c.skinH} />
				<path d={`M-34,${y + 4} C-26,${y + 10} 2,${y + 11} 32,${y + 11}`} fill="none" stroke={c.skinD} strokeWidth={2} opacity={0.7} /></g>)}
			<path d="M-50,22 C-46,6 -26,2 -6,12 C8,20 12,34 4,44 C-10,50 -34,48 -48,38 Z" fill={c.skinS} />
			<path d="M-6,12 C8,20 12,34 4,44 C0,32 -4,22 -14,14 Z" fill={c.skinH} opacity={0.8} />
			<path d="M-48,38 C-34,48 -10,50 4,44" fill="none" stroke={c.skinD} strokeWidth={2} />
		</g>
		{/* the guard in front of the fist, then the blade toward the lens (nearer than the fist, so over it) */}
		<ellipse cx={G[0]} cy={G[1]} rx={34 * fs} ry={13 * fs} transform={`rotate(${f1(ag + 90)} ${f1(G[0])} ${f1(G[1])})`} fill="#7A5A2A" />
		<ellipse cx={G[0] - ub[0] * 3 * fs} cy={G[1] - ub[1] * 3 * fs} rx={33 * fs} ry={11 * fs} transform={`rotate(${f1(ag + 90)} ${f1(G[0])} ${f1(G[1])})`} fill={c.gold} />
		<ellipse cx={G[0] - ub[0] * 3 * fs + 8} cy={G[1] - ub[1] * 3 * fs - 6} rx={16 * fs} ry={4 * fs} transform={`rotate(${f1(ag + 90)} ${f1(G[0])} ${f1(G[1])})`} fill="#FFE6B0" opacity={0.6} />
		<polygon points={pp([spineA, spineB, T, midB, midA])} fill={`url(#${id}bd)`} />
		<polygon points={pp([midA, midB, T, edgeB, edgeA])} fill={`url(#${id}bl)`} />
		<polygon points={pp([midB, T, edgeB])} fill="#FFE6BE" opacity={0.7} />
		<polyline points={pp([edgeA, edgeB, T])} fill="none" stroke="#FFF2D8" strokeWidth={2.6 * fs} strokeLinejoin="round" opacity={0.95} />
		<polyline points={pp([spineA, spineB, T])} fill="none" stroke="#8FD0DC" strokeWidth={1.8 * fs} strokeLinejoin="round" opacity={0.7} />
		{glint > 0.01 && <g opacity={glint}>
			<circle cx={T[0]} cy={T[1]} r={120 * fs} fill={`url(#${id}gl)`} />
			<path d={`M${T[0] - 150 * fs},${T[1]} L${T[0]},${T[1] - 3 * fs} L${T[0] + 150 * fs},${T[1]} L${T[0]},${T[1] + 3 * fs} Z M${T[0]},${T[1] - 110 * fs} L${T[0] + 2.4 * fs},${T[1]} L${T[0]},${T[1] + 110 * fs} L${T[0] - 2.4 * fs},${T[1]} Z`} fill="#FFF6E0" />
		</g>}
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
