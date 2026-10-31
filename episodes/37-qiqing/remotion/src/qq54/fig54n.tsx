import React from 'react';
import {Head, Pal, Dao, P, f1, rnd} from './cao54b';
import {HEAD, ZE, NECK} from './npc54b';
import {npcWalk} from './rig54b';
import {Limb, PAL} from './set54bs';
/* ep54 demo · figures for the new scenes (card 5 黄巾, card 6 董卓废立, card 8 吕伯奢家), drawn in the look-B kit's grammar:
   warm-black silhouettes in one fill (the caller sets fill and the rim filter in screen space), 曹操 alone cel-shaded with a face.
   Units: cm (soles / floor at y = 0, facing +x) unless a component says Cao units (1 u ≈ 2 mm, soles y = 750). */
export const cl01 = (v: number) => Math.max(0, Math.min(1, v));
export const sstep = (a: number, b: number, v: number) => { const u = cl01((v - a) / (b - a)); return u * u * (3 - 2 * u); };

/** NpcWalk's torso transform (its own clock), so props and headgear can ride a walker's upper body (same formula as rig54b) */
export const npcTorsoT = (t1: number, L = 64, f = 1.8, t0 = 0, lean = 3) => { const t = t1 + t0, Wk = npcWalk(t, L, f), hx = Wk.hipX, dy = Wk.hipY + 89, nl = lean + 1.2 * Math.sin(Math.PI * ((t * f) % 1)) ** 2;
	return `rotate(${f1(nl)} ${f1(hx)} ${f1(-92 + dy)}) translate(${f1(hx)},${f1(dy)})`; };

/* ---------- headgear in NPC head coordinates (cm; crown ≈ −171, face toward +x) ---------- */
/** 进贤冠: the slanted 展筩 (front high, back low) over the 帻 */
export const JX = 'M9.6,-164 L8.6,-181 L5,-182 L-10,-173 L-10.6,-165 C-4,-167 3,-166.4 9.6,-164 Z';
/** the 冕 of the boy emperor: cap, the flat 綖 board tilted forward, 旒 bead strings front and back */
export const Mian: React.FC = () => <g>
	<path d="M-6,-173 L10,-173 L10,-179 L-6,-179 Z" />
	<path d="M-13,-182.6 L19,-178.6 L19,-176.4 L-13,-180.4 Z" />
	{[0, 1, 2].map((i) => <g key={i}><rect x={15.6 + i * 1.3} y={-178} width={0.5} height={10 - i} /><circle cx={15.85 + i * 1.3} cy={-168 - i} r={0.9} /><circle cx={15.85 + i * 1.3} cy={-172 - i * 0.6} r={0.8} /></g>)}
	{[0, 1].map((i) => <g key={i}><rect x={-12.6 + i * 1.4} y={-181} width={0.5} height={8} /><circle cx={-12.35 + i * 1.4} cy={-173} r={0.85} /></g>)}
</g>;
/** an iron 兜鍪 helmet with a neck guard and a knob */
export const Helmet = 'M-9.4,-160 C-10.6,-171 -6,-179.4 2,-179.6 C9.4,-179.6 13.4,-173.4 13.2,-166 L12.4,-163.4 L-2.6,-164.6 L-3.4,-157 L-11,-150 Z M0.6,-179 L2.6,-186.4 L4.8,-179 Z';
/** a 黄巾 headband with two tails (w = flutter, −1..1) */
export const band = (w: number) => `M-8.8,-167.4 C-2,-169.6 6,-169.6 12.4,-167.4 L12.2,-161.8 C6,-164 -2,-164 -8.6,-161.8 Z M-8.4,-166 C-13,${f1(-165.6 + w * 2)} -17,${f1(-162 + w * 3)} -22,${f1(-157 + w * 4)} L-20.6,${f1(-155 + w * 4)} C-16,${f1(-159 + w * 3)} -12.4,${f1(-161.6 + w * 2)} -8.2,-162.6 Z`;

/* ---------- kneeling officials (cm, facing +x, floor 0) ---------- */
const LAP = 'M-34,0 C-36,-14 -32,-30 -20,-37 C-2,-40 18,-33 30,-24 C37,-19 40,-10 39.6,0 Z';
const HEEL = 'M-36,-1 C-38,-6 -36,-10 -32,-10 L-26,-10 L-26,0 Z';
const TORSO = 'M-22,-34 C-25,-52 -22,-70 -13,-84 C-8,-90 0,-93 6,-91 C11,-81 14,-64 14,-48 L18,-32 Z';
const SLEEVE = 'M-6,-88 C6,-86 18,-78 28,-73 L32,-64 C30,-54 24,-46 14,-42 C4,-40 -6,-46 -10,-56 C-13,-68 -12,-82 -6,-88 Z';
const HU = 'M29.4,-64 L32.4,-64.6 L36.6,-99 L33.6,-99.4 Z';
/** an official kneeling (跪) in court robe and 进贤冠, bowed (bow: torso, hb: head, degrees forward), hands joined holding the 笏 */
export const Kneeler: React.FC<{bow?: number; hb?: number}> = ({bow = 24, hb = 16}) => <g>
	<path d={HEEL} /><path d={LAP} />
	<g transform={`rotate(${f1(bow)} -12 -34)`}>
		<path d={TORSO} /><path d={SLEEVE} /><path d={HU} /><circle cx={31} cy={-67} r={3.4} />
		<g transform={`rotate(${f1(hb)} 1 -90) translate(0,55)`}><path d={NECK} /><path d={HEAD} /><path d={ZE} /><path d={JX} /></g>
	</g>
</g>;

/* ---------- 曹操 kneeling (35, court robe, 进贤冠), cel-shaded; cm, facing +x; look = head angle (deg, negative = up) ---------- */
/** 进贤冠 in Head units (over cap 'ze') */
export const JinXian: React.FC<{c?: string; e?: string}> = ({c = '#141210', e = '#8A8A86'}) => <g>
	<path d="M33,-103 L29,-160 L20,-164 L-54,-136 L-56,-117 C-28,-124 6,-117 33,-103 Z" fill={c} />
	<path d="M29,-160 L20,-164 L-54,-136" fill="none" stroke={e} strokeOpacity={0.4} strokeWidth={2.4} />
	<path d="M30,-112 C2,-126 -30,-128 -54,-122" fill="none" stroke={e} strokeOpacity={0.22} strokeWidth={1.6} />
	<path d="M-24,-96 C-24,-60 -20,-24 -6,6 C2,14 12,16 20,13" fill="none" stroke={c} strokeWidth={2} opacity={0.85} />
</g>;
export const CaoKneel: React.FC<{id: string; look: number; bow?: number; pal?: Pal}> = ({id, look, bow = 6, pal = PAL}) => { const p = pal;
	return <g>
		<defs><clipPath id={`${id}l`}><path d={LAP} /></clipPath><clipPath id={`${id}t`}><path d={TORSO} /></clipPath><clipPath id={`${id}s`}><path d={SLEEVE} /></clipPath></defs>
		<path d={HEEL} fill="#120E0C" />
		<path d={LAP} fill={p.robe} />
		<g clipPath={`url(#${id}l)`}>
			<path d="M-40,-6 C-10,-2 20,-2 44,-4 L44,4 L-40,4 Z" fill={p.robeS} />
			<path d="M-20,-37 C-2,-40 18,-33 30,-24 C37,-19 40,-10 39.6,0 L34,0 C34,-10 30,-18 24,-22 C14,-29 -2,-34 -20,-33 Z" fill={p.robeH} opacity={0.75} />
			<path d="M-36,-14 C-22,-18 -8,-18 4,-14 M-10,-28 C4,-26 18,-20 28,-12" fill="none" stroke={p.robeS} strokeWidth={1} opacity={0.6} />
			<rect x={-40} y={-5} width={84} height={5} fill={p.trim} opacity={0.8} />
		</g>
		<g transform={`rotate(${f1(bow)} -12 -34)`}>
			<path d={TORSO} fill={p.robe} />
			<g clipPath={`url(#${id}t)`}>
				<path d="M-30,-30 C-28,-56 -22,-76 -10,-92 L-4,-92 C-14,-76 -18,-54 -16,-30 Z" fill={p.robeS} />
				<path d="M6,-92 C12,-80 14,-64 14,-48 L18,-30 L30,-30 L30,-92 Z" fill={p.robeH} opacity={0.6} />
			</g>
			<path d="M4,-91 C8,-86 10,-80 11,-74 L8,-73 C7,-79 5,-84 1,-89 Z" fill="#D8CDB8" />
			<path d="M6,-90 C2,-76 -4,-62 -12,-50 L-14,-52 C-6,-64 0,-78 3,-91 Z" fill={p.trim} />
			<path d="M-22,-44 L16,-46 L17,-41 L-22,-39 Z" fill="#1A120E" />
			{/* the head on its neck; look < 0 lifts the face toward the dais */}
			<g transform={`translate(4,-87.5) rotate(${f1(look)}) scale(0.205) translate(0,-44)`}>
				<Head old={false} mid pal={p} id={id} cap="ze" /><JinXian />
			</g>
			{/* the near arm in its wide sleeve, both hands joined at the chest holding the 笏 */}
			<path d={SLEEVE} fill={p.robe} />
			<g clipPath={`url(#${id}s)`}>
				<path d="M-14,-60 C-6,-48 6,-44 18,-40 L20,-30 L-20,-30 Z" fill={p.robeS} />
				<path d="M-4,-88 C8,-84 20,-78 28,-73 L30,-68 C20,-72 8,-78 -2,-82 Z" fill={p.robeH} opacity={0.8} />
			</g>
			<path d="M28,-73 L32,-64" stroke={p.trim} strokeWidth={2.2} />
			<path d={HU} fill="#CDBB92" /><path d="M33.6,-99.4 L36.6,-99 L35.4,-88 L32.6,-88.4 Z" fill="#EDE0C0" opacity={0.6} />
			<path d="M28.4,-70.4 C31,-72.6 35,-71.6 35.6,-68 C36,-65 33.6,-62.6 30.6,-63 C28,-63.6 27,-67.6 28.4,-70.4 Z" fill={p.skin} />
			<path d="M31,-71.6 C33.6,-71.6 35.4,-70 35.6,-68 L32,-68.6 Z" fill={p.skinH} />
		</g>
	</g>; };

/* ---------- 董卓: a massive, heavyset armoured man seen 3/4, facing −x (toward the hall); cm, soles 0; pt = pointing 0..1 ---------- */
/* the pointing arm in an armoured sleeve: 披膊 over the shoulder, the upper arm, the elbow, a forearm with its bracer, the robe
   sleeve drooping under it, and a hand that closes to a fist with the index finger out. Angles in degrees (0 = +x, 90 = down);
   jab = a small push at the end of the gesture, br = breath sway */
const ArmPoint: React.FC<{pt: number; jab: number; br: number}> = ({pt, jab, br}) => {
	const sh: P = [-50, -146], U = 30, F = 26;
	const a1 = 94 + 54 * pt + 4 * jab + 1.2 * br, a2 = 84 + 88 * pt - 2 * jab + 0.8 * br;
	const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180, d1: P = [Math.cos(r1), Math.sin(r1)], d2: P = [Math.cos(r2), Math.sin(r2)];
	const el: P = [sh[0] + U * d1[0], sh[1] + U * d1[1]], wr: P = [el[0] + F * d2[0], el[1] + F * d2[1]];
	const dn = (r: number): P => [Math.sin(r), -Math.cos(r)];
	const n1 = dn(r1), n2 = dn(r2), sag = 11 * Math.abs(Math.cos(r2)) + 1.2 * br;
	const p0: P = [sh[0] + d1[0] * 16 + n1[0] * 8, sh[1] + d1[1] * 16 + n1[1] * 8], p2: P = [wr[0] - d2[0] * 3 + n2[0] * 5, wr[1] - d2[1] * 3 + n2[1] * 5];
	const ext = sstep(0.45, 0.95, pt), fl = 1.5 + 9 * ext;
	const T = (p: P, a: number) => `translate(${f1(p[0])},${f1(p[1])}) rotate(${f1(a)})`;
	return <g>
		{/* the robe sleeve under the armour, hanging below the arm */}
		<path d={`M${f1(p0[0])},${f1(p0[1])} C${f1(p0[0] + d2[0] * 4)},${f1(p0[1] + sag * 1.3)} ${f1(p2[0] - d2[0] * 10)},${f1(p2[1] + sag * 1.2)} ${f1(p2[0])},${f1(p2[1])} L${f1(el[0])},${f1(el[1])} Z`} />
		{/* upper arm, tapering to the elbow */}
		<g transform={T(sh, a1)}><path d={`M-2,-9.6 C9,-10.4 20,-8.8 ${U},-7.4 L${U},7.4 C20,8.6 9,10 -2,9.6 Z`} /></g>
		<circle cx={f1(el[0])} cy={f1(el[1])} r={7.4} />
		{/* forearm, the bracer's lip at the wrist, the hand: a fist whose index finger opens out as he points */}
		<g transform={T(el, a2)}>
			<path d={`M0,-7.4 C8,-7 15,-6 20,-5.2 L21,-6.6 L${F},-6.2 L${F},6 L21,6.4 L20,5 C15,5.6 8,6.8 0,7.4 Z`} />
			<path d={`M${F - 1},-5.2 L${F + 7},-5.4 C${F + 9.6},-5 ${F + 11.2},-3.2 ${F + 11},-0.8 L${F + 10.4},1.2 L${F + 10 + fl},1.5 C${F + 11.4 + fl},1.7 ${F + 11.4 + fl},3.7 ${F + 10 + fl},3.9 L${F + 8},4.4 C${F + 6},5.6 ${F + 3},5.6 ${F + 1},5 L${F - 1},5 Z`} />
			<circle cx={F + 9.4} cy={-3.4} r={2.2} /><circle cx={F + 7} cy={-4.6} r={1.8} />
		</g>
		{/* 披膊: the lamellar shoulder guard lifts with the upper arm, its lower edge scalloped */}
		<g transform={T(sh, a1 * 0.7 + 94 * 0.3)}><path d="M-12,-11 C-2,-15.6 10,-15 17,-12.4 L19.4,-8.4 L17.2,-4.4 L19.4,-0.4 L17.2,3.6 L19.4,7.6 L16.6,11.8 C8,14.6 -4,15.4 -12,11.4 C-17,5 -17,-5 -12,-11 Z" /></g>
	</g>; };
export const Dong: React.FC<{pt: number; cape?: number; jab?: number; br?: number}> = ({pt, cape = 0, jab = 0, br = 0}) => {
	return <g>
		{/* the cape behind, flaring to the right */}
		<path d={`M-34,-158 C6,-164 46,-152 62,-120 C${f1(74 + cape * 4)},-88 ${f1(82 + cape * 8)},-40 ${f1(90 + cape * 10)},0 L-6,0 C2,-40 4,-100 -34,-158 Z`} />
		{/* legs in armoured boots, a wide stance */}
		<path d="M8,-100 L32,-100 L34,-56 L33,-12 L46,-6 L48,0 L14,0 L14,-10 L12,-56 Z" />
		<path d="M-36,-100 L-10,-100 L-12,-56 L-15,-12 L-13,0 L-52,0 L-50,-6 L-36,-12 L-38,-56 Z" />
		{/* the lamellar skirt (甲裙) */}
		<path d="M-54,-110 C-20,-116 22,-116 50,-110 L58,-52 C22,-45 -22,-45 -62,-52 Z" />
		{/* the trunk: a huge belly pushed forward under the cuirass, broad shoulders with 披膊 */}
		<path d="M-46,-152 C-62,-142 -70,-122 -66,-106 C-62,-96 -42,-92 -10,-92 C22,-92 42,-98 48,-108 C52,-126 50,-144 42,-154 C22,-162 -24,-162 -46,-152 Z" />
		<path d="M40,-160 C58,-156 64,-140 62,-126 L40,-132 Z" />
		{/* a 环首刀 at the right hip, his right hand on the hilt */}
		<path d="M30,-108 L64,-30 L60,-28 L26,-106 Z" /><circle cx={28} cy={-114} r={4.4} fill="none" stroke="currentColor" strokeWidth={1.8} />
		<Limb j={[[46, -146], [60, -122], [36, -110]]} w={[9, 7.4, 6]} /><circle cx={34} cy={-110} r={6.4} />
		{/* the thick neck, the big head turned toward the hall, a full beard, a crested 兜鍪 */}
		<path d="M-16,-156 L12,-156 L10,-170 L-14,-170 Z" />
		<path d="M-14,-166 C-20,-170 -25,-175 -24,-181 L-28,-185 L-24,-188 C-24,-197 -15,-205 -2,-205 C10,-205 17,-196 15,-184 L13,-166 Z" />
		<path d="M-26,-178 C-31,-168 -28,-155 -19,-149 C-10,-145 2,-147 8,-156 L5,-167 L-12,-172 Z" />
		<path d="M-22,-194 C-21,-211 2,-217 15,-205 C19,-200 20,-194 18,-188 L13,-186 C6,-195 -8,-198 -22,-194 Z" />
		<path d="M0,-214 C4,-226 14,-232 24,-231 C18,-225 13,-219 10,-211 Z" />
		{/* the left arm: hangs, then lifts to point (the order) */}
		<ArmPoint pt={pt} jab={jab} br={br} />
	</g>; };

/* ---------- 曹操 standing (35, plain robe and 帻, the travel bundle), Cao units, facing +x; a drawn 环首刀 lowered in the near hand ---------- */
export const FACE = 'M30,-98 C35,-90 38,-80 39,-70 C39.6,-64 39.4,-60 38.6,-56.5 C41,-50 45,-43 49,-37 C51.5,-34 52.5,-31 51.5,-28.8 C49.6,-26.6 47.4,-25.6 45.4,-25 C46.2,-22.4 47,-19.4 46.6,-16.4 C44.8,-13.6 43,-12.4 42,-11.6 C44.4,-9.6 45.6,-7.4 44.8,-5.2 C43.2,-3.4 41.4,-2.4 41.2,-0.6 C42.6,2.6 42.6,7 39.6,10.6 C33,14.6 20,15 8,13 C10,22 12,34 14,50 L-38,50 C-40,30 -42,8 -44,-12 C-38,-30 -30,-46 -26,-60 C-22,-72 -6,-86 12,-92 Z';
const ROBE = 'M-38,44 C-58,58 -70,100 -68,160 C-66,220 -60,260 -62,300 C-66,420 -76,600 -82,742 L96,742 C86,600 66,430 56,320 C54,290 52,282 50,272 C58,220 62,160 54,112 C48,82 36,60 14,46 Z';
export type StandProps = {id: string; pal: Pal; head: number; blade: number; breath: number; glint?: number; half?: string};
export const CaoStand: React.FC<StandProps> = ({id, pal, head, blade, breath, glint = -1, half}) => { const p = pal;
	const by = breath * 3;
	/* the near arm hangs, the hand low at the thigh holding the drawn blade, pointing down and forward */
	const sh: P = [12, 86 + by], el: P = [22, 214], hd: P = [46, 326];
	const ph = (34 + blade) * Math.PI / 180, d: P = [Math.sin(ph), Math.cos(ph)], a: P = [hd[0] - d[0] * 22, hd[1] - d[1] * 22], L = 430, b: P = [a[0] + d[0] * L, a[1] + d[1] * L];
	const [sx, sy] = sh, [ex, ey] = el, [hx, hy] = hd;
	const sl = `M${sx + 22},${sy - 12} C${sx + 34},${sy + 40} ${ex + 26},${ey - 40} ${ex + 26},${ey - 6} L${hx - 10},${hy - 22} C${hx - 2},${hy + 4} ${hx - 6},${hy + 30} ${hx - 18},${hy + 56} C${hx - 40},${hy + 86} ${ex - 14},${ey + 120} ${ex - 26},${ey + 50} C${ex - 32},${ey} ${sx - 30},${sy + 60} ${sx - 26},${sy + 10} Z`;
	const g0 = 70 + (L - 120) * cl01(glint), gop = glint < 0 || glint > 1 ? 0 : Math.sin(Math.PI * glint);
	return <g>
		<defs><clipPath id={`${id}rb`}><path d={ROBE} /></clipPath>
			<linearGradient id={`${id}hf`} x1="0" y1="-104" x2="0" y2="14" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={half ?? '#07090A'} stopOpacity="0.9" /><stop offset="0.45" stopColor={half ?? '#07090A'} stopOpacity="0.8" /><stop offset="0.62" stopColor={half ?? '#07090A'} stopOpacity="0.45" /><stop offset="0.8" stopColor={half ?? '#07090A'} stopOpacity="0.08" /><stop offset="1" stopColor={half ?? '#07090A'} stopOpacity="0" /></linearGradient></defs>
		{/* the bundle on his back (from K7) and its strap */}
		<path d="M-112,110 C-134,150 -130,214 -104,240 C-84,256 -54,252 -42,232 C-34,196 -40,150 -56,116 C-70,98 -96,96 -112,110 Z" fill="#3E352C" />
		<path d="M-112,110 C-134,150 -130,214 -104,240 C-96,246 -88,249 -80,249 C-104,222 -110,166 -98,112 Z" fill="#221E19" />
		<path d="M-100,130 C-90,170 -80,200 -60,224 M-84,112 C-74,150 -64,180 -48,200" fill="none" stroke="#221E19" strokeWidth={3} opacity={0.6} />
		<path d="M-92,104 C-86,90 -70,88 -62,100 C-70,108 -84,110 -92,104 Z M-80,98 L-70,78 L-62,84 Z" fill="#2E2822" />
		{/* shoes under the hem */}
		<path d="M-70,742 C-60,732 -20,732 -6,744 L-6,750 L-72,750 Z" fill="#0C0A08" />
		<path d="M50,742 C70,733 104,735 120,744 C112,752 82,754 50,750 Z" fill="#141110" />
		{/* the plain robe */}
		<path d={ROBE} fill={p.robe} />
		<g clipPath={`url(#${id}rb)`}>
			<path d="M-14,48 C-16,200 -22,500 -30,742 L-100,742 L-100,40 Z" fill={p.robeS} />
			<path d="M44,90 C56,150 52,230 48,280 C56,360 70,520 86,742 L100,742 L100,80 Z" fill={p.robeH} opacity={0.5} />
			<path d="M-6,330 C10,420 20,560 24,742" stroke={p.robeS} strokeWidth={4} fill="none" opacity={0.7} />
			<path d="M-40,330 C-44,460 -50,600 -54,742" stroke={p.robeS} strokeWidth={3} fill="none" opacity={0.6} />
			<rect x={-100} y={712} width={200} height={30} fill={p.trim} opacity={0.8} />
		</g>
		<path d="M14,46 C25,56 33,72 37,92 L29,96 C25,77 19,61 8,51 Z" fill="#9E9584" />
		<path d="M24,52 C8,104 -18,152 -48,196 L-58,186 C-28,146 -2,100 14,48 Z" fill={p.trim} />
		{/* a cloth sash, the bundle strap across the chest, the empty scabbard at the hip */}
		<path d="M-64,282 L54,272 L56,294 L-64,304 Z" fill="#26221D" />
		<path d="M40,64 C20,120 -20,190 -70,236 L-80,226 C-34,184 6,116 26,58 Z" fill="#4A3F33" />
				{/* the head on its neck: head = tilt (deg, + down) */}
		<g transform={`translate(0,${f1(49 + by * 0.6)}) rotate(${f1(head)} 0 -8) scale(0.88) translate(0,-40)`}>
			<Head old={false} mid pal={p} id={id} cap="ze" capC="#24211D" />
			<path d={FACE} fill={`url(#${id}hf)`} />
			<circle cx={29} cy={-54.6} r={1.5} fill="#F3DDB4" opacity={0.75} />
		</g>
		{/* the drawn blade, then the hand and the sleeve over the grip */}
		<Dao a={a} b={b} pal={p} drawn />
		{gop > 0.01 && <g opacity={gop}><line x1={a[0] + d[0] * g0} y1={a[1] + d[1] * g0 - 4} x2={a[0] + d[0] * (g0 + 60)} y2={a[1] + d[1] * (g0 + 60) - 4} stroke="#FFF6E6" strokeWidth={3} strokeLinecap="round" />
			<circle cx={a[0] + d[0] * (g0 + 30)} cy={a[1] + d[1] * (g0 + 30) - 4} r={10} fill="#FFF6E6" opacity={0.35} /></g>}
		<path d={sl} fill={p.robe} />
		<path d={`M${ex - 26},${ey + 50} C${ex - 14},${ey + 120} ${hx - 40},${hy + 86} ${hx - 18},${hy + 56} C${hx - 30},${hy + 60} ${ex - 4},${ey + 80} ${ex - 16},${ey + 30} Z`} fill={p.robeS} />
		<path d={`M${sx + 22},${sy - 12} C${sx + 34},${sy + 40} ${ex + 26},${ey - 40} ${ex + 26},${ey - 6} L${hx - 10},${hy - 22} L${hx - 14},${hy - 10} L${ex + 14},${ey + 6} C${ex + 12},${ey - 30} ${sx + 22},${sy + 40} ${sx + 10},${sy - 4} Z`} fill={p.robeH} opacity={0.55} />
		<path d={`M${hx - 10},${hy - 22} C${hx - 2},${hy + 4} ${hx - 6},${hy + 30} ${hx - 18},${hy + 56}`} fill="none" stroke={p.trim} strokeWidth={8} />
		<g transform={`translate(${f1(hd[0])},${f1(hd[1])}) rotate(${f1(90 - (34 + blade))})`}>
			<path d="M-12,-11 C0,-15 13,-10 14,0 C15,10 6,14 -5,13 C-13,11 -15,-4 -12,-11 Z" fill={p.skin} />
			<path d="M-5,13 C6,14 15,10 14,0 L9,0 C9,8 3,11 -4,10 Z" fill={p.skinS} />
			<path d="M2,-10 C6,-4 7,2 5,8 M8,-8 C11,-3 11,3 10,7" fill="none" stroke={p.line} strokeOpacity={0.35} strokeWidth={0.9} />
		</g>
	</g>; };

/* ---------- smoke column over a burning village: puffs rise on their own clock and widen, leaning with the wind ---------- */
const mix = (a: string, b: string, u: number) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * u).toString(16).padStart(2, '0')).join(''); };
export const Smoke: React.FC<{x: number; y: number; h: number; w: number; t: number; seed: number; start?: number; drift?: number; c0?: string; c1?: string; rate?: number; o?: number}> = ({x, y, h, w, t, seed, start = -99, drift = 160, c0 = '#2E2925', c1 = '#5E5850', rate = 0.15, o = 0.9}) => {
	const N = 18;
	return <g>{Array.from({length: N}, (_, i) => { const a0 = t * rate + i / N + rnd(seed, 3), a = a0 - Math.floor(a0), te = t - a / rate;
		const vis = cl01((te - start) * 2.5); if (vis <= 0) return null;
		const op = sstep(0, 0.1, a) * (1 - sstep(0.5, 1, a)) * o * vis;
		const k = Math.floor(a0) * N + i, wob = Math.sin(seed * 1.3 + k * 1.7) * w * 0.22 * a + Math.sin(t * 0.7 + k) * w * 0.05;
		const px = x - drift * a * a + wob, py = y - h * a, r = w * (0.2 + 1.25 * a) * (0.85 + 0.3 * rnd(k, seed));
		return <ellipse key={i} cx={f1(px)} cy={f1(py)} rx={f1(r * 1.15)} ry={f1(r)} fill={mix(c0, c1, Math.min(1, a * 1.3))} opacity={op} />; })}</g>; };

/* ---------- the boy emperor led away: a slim child in a long wide-sleeved 袍 to the ankles, hands hidden in the joined sleeves,
   head bowed under the 冕, upturned 舄 toes showing under the hem; no weapon. cm, soles 0, facing +x, walks on npcWalk ---------- */
export const BoyWalk: React.FC<{t: number; L: number; f: number; t0?: number; lean?: number; bow?: number}> = ({t: t1, L, f, t0 = 0, lean = 5, bow = 9}) => {
	const t = t1 + t0, Wk = npcWalk(t, L, f), Wl = npcWalk(t - 0.1, L, f), hx = Wk.hipX, dy = Wk.hipY + 89, X = (v: number) => hx + v, Y = (v: number) => v + dy;
	const nl = lean + 1.2 * Math.sin(Math.PI * ((t * f) % 1)) ** 2, ph = Math.sin(Math.PI * t * f);
	const lx = Wl.feet.map((q) => q.x + (hx - Wl.hipX)), fF = Math.max(...lx), fB = Math.min(...lx);
	const lift = Math.min(Wk.feet[0].y, Wk.feet[1].y), hemF = -4 + 0.5 * Math.min(0, lift), hemB = -3;
	const skirt = `M${f1(X(-9.6))},${f1(Y(-100))} C${f1(X(-12))},${f1(Y(-70))} ${f1(fB - 8)},${f1(Y(-34))} ${f1(fB - 13)},${f1(hemB)} C${f1((fB + fF) / 2 - 6)},${f1(hemB + 1.2)} ${f1(fF + 2)},${f1(hemF + 1)} ${f1(fF + 9)},${f1(hemF)} C${f1(fF + 6)},${f1(Y(-40))} ${f1(X(12))},${f1(Y(-70))} ${f1(X(10))},${f1(Y(-100))} Z`;
	const shoe = (q: {x: number; y: number; a: number}, i: number) => <path key={i} transform={`translate(${f1(q.x)},${f1(q.y - 7)}) rotate(${f1(q.a)})`} d="M-5,-1 L6,-2 C11,-1.6 15,0.4 17,3 C18.6,1.4 20.4,0.6 21.6,1.4 C21,4 19.4,6.4 17,7 L-5,7 Z" />;
	const bx = 3 * ph;
	return <g>
		{Wk.feet.map(shoe)}
		<path d={skirt} />
		<g transform={`rotate(${f1(nl)} ${f1(X(0))} ${f1(Y(-92))}) translate(${f1(X(0))},${f1(dy)})`}>
			<path d="M-3,-141 C-9,-140 -11,-135 -11,-127 C-11,-115 -10.4,-106 -10,-99 L10.6,-99 C11.4,-107 12.4,-116 11.8,-126 C11.4,-134 8,-140 4,-141 Z" />
			<g transform={`rotate(${f1(bow)} 1 -140) translate(1,-141) scale(1.08) translate(-1,141)`}><path d={NECK} /><path d={HEAD} /><path d={ZE} /><Mian /></g>
			{/* the near arm: the upper arm hangs, the forearm comes forward to the joined hands, the wide sleeve hangs in a deep bag */}
			<path d={`M1,-137 C9,-134 13,-124 14,-114 L21,-111 C23.6,-107 23.6,-100 21.4,-96 C${f1(19 + bx * 0.4)},-84 ${f1(13 + bx)},-70 ${f1(4 + bx)},-64 C${f1(-4 + bx)},-60 ${f1(-10 + bx * 0.6)},-65 -10,-75 C-10,-92 -9,-120 -5,-134 Z`} />
		</g>
	</g>; };
