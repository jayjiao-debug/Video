import React from 'react';
import {W, H} from '../qq50/kit50';
import {Cao, Head, RimF, Lamel, Dao, Pal, P, f1, rnd, strand, qpts} from './cao54b';
import {HEAD, NECK, TUNIC, ZE} from './npc54b';
import {NpcWalk, npcWalk, Flame} from './rig54b';
import {SIL, ACC, PAL, Banner, Limb} from './set54bs';
import {Helmet} from './fig54n';
import {BAR} from './demo54core';
/* ep54 full film · section B (drums out, melody only), cards 10–13. t = FILM time (s). Mood: defeat and desolation; slow, quiet camera.
   Xingyang = cards 10–11 (BAR 18–22): A 36.51–40.49 the 汴水 at dusk, 徐荣's banners advance, arrows fall, 曹操's men scatter; cut on
     the downbeat 40.49 to B: night, 曹操 wounded (an arrow shaft in the shoulder), his wounded horse stumbles, torches crest the rise.
   Hong = card 12 (BAR 22–24): 曹洪 (silhouette) has dismounted and holds out his reins; 曹操 looks at him; the torches close behind.
   Haoli = card 13 (BAR 24–26): grey dawn over an abandoned village (broken walls, a fallen well, a dead tree, crows); 曹操 small on a
     rise; a slow push that settles to a held breath before the drums return at 52.45.
   The key is always on the right (the afterglow, the pursuers' torches, the dawn), so 曹操 looks into it and his 石青 rim is on the
   left. Torches are warm ivory (no orange before the drop). No blood, no bodies, no hit shown. Overlay zones kept calm. */
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>{children}</svg>;
const Blur: React.FC<{id: string; s: number}> = ({id, s}) => <filter id={id} x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation={s} /></filter>;
const at = (x: number, y: number, k: number, flip?: boolean) => `translate(${f1(x)},${f1(y)}) scale(${(flip ? -k : k).toFixed(4)},${k.toFixed(4)})`;
const cl = (v: number) => Math.max(0, Math.min(1, v));
const sst = (a: number, b: number, v: number) => { const u = cl((v - a) / (b - a)); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** 2.5D camera: push z and pan px at depth p (0 = sky … 1 = the hero plane … 1.3 = the near foreground) */
const camOf = (z: number, fx: number, fy: number, px: number, py = 0) => (p: number) => `translate(${f1(fx - px * p)},${f1(fy - py * p)}) scale(${(1 + z * p).toFixed(5)}) translate(${-fx},${-fy})`;
const B18 = BAR(18), B20 = BAR(20), B22 = BAR(22), B24 = BAR(24), B26 = BAR(26);
const NPAL: Pal = {...PAL, skin: '#BE8A62', skinS: '#94634A', skinH: '#E2B58A'};

/* ============================ the horse (own rig: the kit's Han horse body, legs on IK so it can shy and stumble) ============================ */
/* cm, facing +x, hooves at y = 0; the body pitches about the hind hip; the neck turns about its base */
const HB = 'M38,-142 C22,-135 2,-131 -18,-132 C-36,-133 -52,-140 -66,-135 C-74,-132 -80,-124 -81,-112 C-82,-100 -76,-90 -66,-86 L-48,-82 C-30,-80 -10,-79 10,-80 C26,-80 40,-79 52,-82 C62,-86 70,-95 72,-106 C66,-118 58,-130 50,-138 C46,-141 42,-142 38,-142 Z';
const HN = 'M50,-100 C60,-92 70,-95 72,-106 C74,-116 79,-130 88,-145 C94,-154 99,-159 103,-162 C109,-158 117,-149 123,-139 C126,-135 130,-131 134,-132 C138,-134 139,-139 136,-145 C129,-158 119,-172 109,-184 C105,-188 101,-191 96,-191 C84,-185 66,-167 52,-153 C46,-148 40,-146 30,-140 C32,-124 40,-110 50,-100 Z';
const MANE = 'M93,-188 L90,-203 L98,-191 Z M98,-189 L99,-201 L103,-190 Z M100,-190 C106,-188 110,-184 111,-179 C106,-182 102,-184 98,-185 Z M96,-191 C84,-186 66,-169 50,-155 L46,-160 L48,-165 L44,-163 C58,-176 78,-192 96,-196 Z';
const TAILK = 'M-68,-133 C-78,-138 -88,-134 -91,-124 C-94,-112 -91,-100 -88,-90 L-84,-91 C-86,-102 -88,-112 -86,-121 C-84,-127 -78,-130 -71,-128 Z';
const HP: P = [-42, -104], NP: P = [50, -122];
const rotP = (p: P, c: P, deg: number): P => { const r = deg * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; };
const ik2 = (A: P, F: P, T: number, S: number, s: number): P => { const dx = F[0] - A[0], dy = F[1] - A[1], d = Math.max(1e-3, Math.min(Math.hypot(dx, dy), T + S - 0.01)), th = Math.atan2(dy, dx);
	const al = Math.acos(Math.max(-1, Math.min(1, (T * T + d * d - S * S) / (2 * T * d)))); return [A[0] + T * Math.cos(th + s * al), A[1] + T * Math.sin(th + s * al)]; };
export type HorseS = {th: number; nk: number; dy?: number; bF?: number; bF2?: number; tail?: number; liftH?: number};
const bodyPt = (s: HorseS, p: P): P => { const q = rotP(p, HP, s.th); return [q[0], q[1] + (s.dy ?? 0)]; };
const bodyT = (s: HorseS) => `translate(0,${f1(s.dy ?? 0)}) rotate(${s.th.toFixed(3)} ${HP[0]} ${HP[1]})`;
/** a leg from its attach A (body) to the hoof H (planted; buckle b folds a fore leg: hoof back and up, knee forward and down) */
const legJ = (A: P, H0: P, front: boolean, b: number, lift = 0) => {
	let Hh: P = front ? [H0[0] - 30 * b, H0[1] - 16 * b - lift] : [H0[0], H0[1] - lift];
	const T = front ? 53 : 56, S = front ? 29 : 35.2;
	let F: P = [Hh[0] - 3.5 + 8 * b, Hh[1] - 10 + 3 * b];
	const d = Math.hypot(F[0] - A[0], F[1] - A[1]);
	if (d > T + S - 0.6) { const u = (T + S - 0.6) / d; const F2: P = [A[0] + (F[0] - A[0]) * u, A[1] + (F[1] - A[1]) * u]; Hh = [Hh[0] + F2[0] - F[0], Hh[1] + F2[1] - F[1]]; F = F2; }
	const K = ik2(A, F, T, S, front ? -1 : 1), M: P = [A[0] + (K[0] - A[0]) * 0.45, A[1] + (K[1] - A[1]) * 0.45];
	const ang = Math.atan2(Hh[1] - F[1], Hh[0] - F[0]) * 180 / Math.PI - 70.7;
	return {j: [A, M, K, F, Hh] as P[], w: front ? [11, 7.5, 5.6, 4.6, 3.8] : [15, 10, 5.4, 4.6, 3.8], ang};
};
const LegR: React.FC<{l: ReturnType<typeof legJ>; fill?: string}> = ({l, fill}) => { const h = l.j[4];
	return <g fill={fill}><Limb j={l.j} w={l.w} /><g transform={`translate(${f1(h[0])},${f1(h[1])}) rotate(${f1(l.ang)})`}><path d="M-4.6,-2.6 L4.4,-2.6 L7.4,5.2 L-5.2,5.2 Z" /></g>
		<circle cx={l.j[2][0]} cy={l.j[2][1]} r={l.w[2] + 0.6} /></g>; };
/** the horse in one silhouette fill (the caller sets fill and the rim filter); arrow = a shaft lodged in the near haunch */
const HorseR: React.FC<{s: HorseS; farFill?: string; arrow?: boolean; bridle?: boolean}> = ({s, farFill = '#241A15', arrow, bridle = true}) => {
	const nf = legJ(bodyPt(s, [52, -96]), [61, -5], true, s.bF ?? 0, 0), ff = legJ(bodyPt(s, [46, -96]), [49, -5], true, s.bF2 ?? 0, 0);
	const nh = legJ(bodyPt(s, [-40, -104]), [-47, -5], false, 0, s.liftH ?? 0), fh = legJ(bodyPt(s, [-45, -104]), [-56, -5], false, 0, 0);
	return <g>
		<LegR l={ff} fill={farFill} /><LegR l={fh} fill={farFill} />
		<g transform={bodyT(s)}>
			<g transform={`rotate(${f1(s.tail ?? 0)} -70 -132)`}><path d={TAILK} /><ellipse cx={-89} cy={-120} rx={5} ry={4.2} /></g>
			<path d={HB} />
			<g transform={`rotate(${f1(s.nk)} ${NP[0]} ${NP[1]})`}><path d={HN} /><path d={MANE} />
				{bridle && <path d="M101,-160 C110,-156 120,-146 128,-136 M106,-186 C112,-170 120,-156 128,-138" fill="none" strokeWidth={1.4} stroke="currentColor" />}</g>
			{/* a low Han saddle pad with its girth */}
			<path d="M-24,-131 C-12,-138 14,-138 24,-133 L26,-124 C10,-128 -12,-128 -26,-123 Z" />
			{arrow && <g><path d="M-44,-112 L-86,-136" stroke="#0A0706" strokeWidth={2.6} strokeLinecap="round" /><path d="M-44,-112 L-86,-136" stroke="#7A6850" strokeWidth={1.3} strokeLinecap="round" />
				<path d="M-78,-132 L-90,-132 L-90,-142 Z M-80,-134 L-93,-139 L-85,-128 Z" fill="#9C9486" /></g>}
		</g>
		<LegR l={nh} /><LegR l={nf} />
	</g>; };
/** where a point of the neck/head (horse cm) ends up */
const neckPt = (s: HorseS, p: P): P => bodyPt(s, rotP(p, NP, s.nk));
const MOUTH: P = [131, -135];

/* ============================ 曹操 riding (Cao units; seated on the horse at horse cm (2, −137)) ============================ */
const RIDECLIP = 'M-500,52 L500,52 L500,332 L-64,332 L-64,900 L-500,900 Z';
const RIDE_T = 'translate(2,-211) scale(0.2)';
/** hand (Cao units) → horse cm */
const rideToHorse = (p: P): P => [2 + p[0] * 0.2, -211 + p[1] * 0.2];
const ShoulderArrow: React.FC<{a?: number}> = ({a = 0}) => <g transform={`rotate(${f1(a)} -30 96)`}>
	<path d="M-24,98 L-246,-30" stroke="#1A120C" strokeWidth={8} strokeLinecap="round" />
	<path d="M-24,98 L-246,-30" stroke="#8A7556" strokeWidth={4.4} strokeLinecap="round" />
	<path d="M-60,77 L-246,-30" stroke="#B19C78" strokeWidth={1.4} opacity={0.8} />
	{/* three vanes near the nock */}
	<path d="M-200,-4 L-252,-24 L-236,-46 L-196,-14 Z" fill="#B8B0A0" /><path d="M-204,-10 L-246,-32 L-220,-44 Z" fill="#7E776C" />
	<path d="M-246,-30 L-256,-34" stroke="#1A120C" strokeWidth={5} />
</g>;
type RideP = {id: string; pal?: Pal; lean: number; arm: {sh: P; el: P; hd: P}; cape: number; headFlip?: boolean; tilt: number; arrow?: boolean; leg?: number};
const CaoRide: React.FC<RideP> = ({id, pal = NPAL, lean, arm, cape, headFlip, tilt, arrow, leg = 0}) => {
	const knee: P = [118 + leg * 6, 420], ank: P = [98 + leg * 10, 588];
	return <g>
		<defs><clipPath id={`${id}rc`}><path d={RIDECLIP} /></clipPath></defs>
		<g transform={`rotate(${f1(lean)} 0 360)`}>
			<g clipPath={`url(#${id}rc)`}><Cao pal={pal} id={id} old={false} armour arm={arm} cape={cape} dao={false} /></g>
			<g transform={`translate(0,49) rotate(${f1(tilt)} 0 -8) scale(${headFlip ? -0.88 : 0.88},0.88) translate(0,-40)`}><Head old={false} mid pal={pal} id={`${id}h`} cap="wu" /></g>
			{arrow && <ShoulderArrow />}
		</g>
		<Dao a={[46, 306]} b={[-150, 420]} pal={pal} />
		{/* the near leg along the horse's flank: thigh, the lamellar skirt flap over it, shin, boot */}
		<path d={strand(qpts([0, 344], [60, 372], knee, 6), (u) => 36 - u * 8)} fill={pal.under} />
		<path d={strand(qpts([0, 356], [60, 386], [knee[0] - 4, knee[1] + 10], 6), (u) => 14 - u * 4)} fill={pal.underS} opacity={0.8} />
		<path d={`M-52,310 L58,300 C88,330 112,370 132,420 L104,452 C70,430 20,410 -40,392 Z`} fill="url(#lamel)" />
		<path d={`M-52,310 L58,300 C88,330 112,370 132,420 L104,452 C70,430 20,410 -40,392 Z`} fill={pal.metal} opacity={0.25} />
		<path d="M104,452 C70,430 20,410 -40,392" fill="none" stroke={pal.lace} strokeWidth={7} />
		<path d={strand(qpts(knee, [knee[0] + 6, (knee[1] + ank[1]) / 2], ank, 6), (u) => 22 - u * 6)} fill="#1C1410" />
		<path d={strand(qpts([knee[0] + 10, knee[1] + 10], [knee[0] + 16, (knee[1] + ank[1]) / 2], [ank[0] + 10, ank[1] - 8], 5), () => 3.5)} fill={pal.robeH} opacity={0.45} />
		<path d={`M${ank[0] - 18},${ank[1] - 10} C${ank[0] - 14},${ank[1] + 14} ${ank[0] + 30},${ank[1] + 18} ${ank[0] + 58},${ank[1] + 12} L${ank[0] + 54},${ank[1] - 4} C${ank[0] + 30},${ank[1] - 6} ${ank[0] + 10},${ank[1] - 12} ${ank[0] + 4},${ank[1] - 22} Z`} fill="#16100C" />
	</g>; };

/* ============================ shared bits ============================ */
/** an arrow in flight (screen px), centre (x, y), direction angle a (rad), length L */
const ArrowF: React.FC<{x: number; y: number; a: number; L: number; c?: string}> = ({x, y, a, L, c = '#120C09'}) => {
	const ux = Math.cos(a), uy = Math.sin(a), tx = x + ux * L / 2, ty = y + uy * L / 2, bx = x - ux * L / 2, by = y - uy * L / 2, nx = -uy, ny = ux;
	return <g>
		<line x1={f1(bx)} y1={f1(by)} x2={f1(tx)} y2={f1(ty)} stroke={c} strokeWidth={L * 0.055} strokeLinecap="round" />
		<path d={`M${f1(tx + ux * L * 0.1)},${f1(ty + uy * L * 0.1)} L${f1(tx - ux * L * 0.04 + nx * L * 0.05)},${f1(ty - uy * L * 0.04 + ny * L * 0.05)} L${f1(tx - ux * L * 0.04 - nx * L * 0.05)},${f1(ty - uy * L * 0.04 - ny * L * 0.05)} Z`} fill={c} />
		<path d={`M${f1(bx)},${f1(by)} L${f1(bx + ux * L * 0.16 + nx * L * 0.05)},${f1(by + uy * L * 0.16 + ny * L * 0.05)} L${f1(bx + ux * L * 0.2)},${f1(by + uy * L * 0.2)} L${f1(bx + ux * L * 0.16 - nx * L * 0.05)},${f1(by + uy * L * 0.16 - ny * L * 0.05)} Z`} fill={c} opacity={0.85} />
	</g>; };
/** a crowd band of silhouettes (heads, shoulders) with 戟 shafts, standing on y, scale k (px per cm) */
const Ranks: React.FC<{y: number; k: number; x0: number; x1: number; seed: number; spears?: number}> = ({y, k, x0, x1, seed, spears = 0.5}) => {
	const sp = 30 * k, n = Math.ceil((x1 - x0) / sp); let d = `M${f1(x0)},${f1(y + 3)} `; const poles: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) { const x = x0 + i * sp + (rnd(i, seed) - 0.5) * sp * 0.6, hy = y - (166 + rnd(i, seed + 1) * 14) * k, sw = y - (134 + rnd(i, seed + 1) * 10) * k;
		d += `L${f1(x)},${f1(sw)} L${f1(x + sp * 0.3)},${f1(hy + 8 * k)} Q${f1(x + sp * 0.5)},${f1(hy - 8 * k)} ${f1(x + sp * 0.7)},${f1(hy + 8 * k)} L${f1(x + sp)},${f1(sw)} `;
		if (rnd(i, seed + 2) < spears) { const px = x + sp * 0.5, top = y - (250 + rnd(i, seed + 3) * 30) * k, ln = (rnd(i, seed + 4) - 0.5) * 18 * k;
			poles.push(<g key={i}><line x1={f1(px)} y1={f1(hy)} x2={f1(px + ln)} y2={f1(top)} strokeWidth={Math.max(1, 2.6 * k)} stroke="currentColor" />
				<path d={`M${f1(px + ln)},${f1(top - 16 * k)} L${f1(px + ln - 2 * k)},${f1(top)} L${f1(px + ln + 2 * k)},${f1(top)} Z M${f1(px + ln)},${f1(top + 6 * k)} L${f1(px + ln + 12 * k)},${f1(top + 9 * k)} L${f1(px + ln)},${f1(top + 11 * k)} Z`} /></g>); } }
	d += `L${f1(x1 + 40)},${f1(y + 3)} Z`;
	return <g><path d={d} />{poles}</g>; };
/** a standing silhouette figure, cm (soles 0, facing +x): torso, head, 平上帻 or helmet, optional torch held up / 戟 */
const Stand: React.FC<{kind?: 'torch' | 'ji' | 'plain'; helm?: boolean}> = ({kind = 'plain', helm}) => <g>
	<path d="M-6,-52 L-8,-6 L4,-6 L4,-52 Z M3,-52 L8,-6 L18,-6 L13,-52 Z" /><path d="M-12,-6 L4,-6 L5,0 L-12,0 Z M7,-6 L20,-5 L21,0 L7,0 Z" />
	<path d={TUNIC} /><path d={NECK} /><path d={HEAD} />
	{helm ? <path d={Helmet} /> : <path d="M-8,-161 C-8.8,-167 -7,-171.6 -1.6,-173.2 L8.4,-173.4 C11,-172 12,-169 12,-166 C8,-167 3,-167 -1,-165 Z M-8.8,-162.4 L-9.6,-175.6 L-3.4,-175.8 L-1.2,-171 Z" />}
	{kind === 'torch' ? <g><path d="M2,-134 L12,-114 L24,-126 L27,-122 L13,-106 L-3,-128 Z" /><circle cx={25} cy={-125} r={4} /><path d="M21,-118 L33,-156 L36.4,-155 L24.6,-117 Z" /></g>
		: kind === 'ji' ? <g><path d="M2,-134 L8,-110 L15,-100 L11,-97 L3,-106 L-3,-130 Z" /><rect x={13.8} y={-252} width={2.6} height={250} /><path d="M15.1,-270 C16.6,-264 17,-258 16.4,-252 L13.8,-252 C13.2,-258 13.6,-264 15.1,-270 Z" /><path d="M16.2,-246 L30,-243 C33,-242.4 34,-240 33,-238.4 L16.2,-241.4 Z" /></g>
		: <path d="M2,-134 L5,-106 L6,-82 L1,-82 L-2,-106 L-3,-130 Z" />}
</g>;
/** torch head of a Stand 'torch' figure (cm) */
const TORCH_TIP: P = [35, -158];
/** a rider silhouette with a torch on a still horse (cm, facing +x) for the far crest: the legs stay hidden behind the crest */
const FarRider: React.FC = () => <g>
	<path d={HB} /><path d={HN} /><path d={MANE} />
	<path d="M-14,-138 C-16,-160 -10,-182 -4,-196 C0,-202 10,-202 14,-196 C18,-184 16,-160 14,-140 Z" />
	<path d="M2,-198 L10,-198 L11,-206 L1,-206 Z" /><path d="M-4,-218 C-4,-226 2,-230 7,-230 C12,-230 15,-226 15,-221 L16,-216 C16,-212 14,-208 10,-207 L1,-206 C-2,-209 -4,-213 -4,-218 Z" />
	<path d={Helmet} transform="translate(4,-57) scale(1)" />
	<path d="M8,-192 L22,-200 L30,-226 L34,-224 L26,-196 L10,-186 Z" /><path d="M28,-222 L36,-262 L39.4,-261 L31,-221 Z" />
</g>;
const RIDER_TORCH: P = [38, -266];

/* ============================ card 10 · 汴水 · dusk (36.51–40.49) ============================ */
type Run = {x: number; y: number; k: number; L: number; f: number; t0: number; kind: 'plain' | 'ji'; wet: boolean; i: number};
const RUNS: Run[] = [
	{x: 1380, y: 714, k: 0.4, L: 74, f: 2.1, t0: 0.3, kind: 'ji', wet: true, i: 0}, {x: 1640, y: 700, k: 0.36, L: 70, f: 2.0, t0: 0.9, kind: 'plain', wet: true, i: 1},
	{x: 1150, y: 730, k: 0.44, L: 76, f: 2.2, t0: 0.5, kind: 'plain', wet: true, i: 2}, {x: 1900, y: 708, k: 0.38, L: 72, f: 2.0, t0: 0.1, kind: 'plain', wet: true, i: 3},
	{x: 820, y: 748, k: 0.48, L: 78, f: 2.1, t0: 0.7, kind: 'ji', wet: true, i: 4}, {x: 2120, y: 722, k: 0.42, L: 74, f: 2.2, t0: 0.4, kind: 'plain', wet: true, i: 10},
	{x: 1560, y: 838, k: 0.66, L: 84, f: 2.3, t0: 0.2, kind: 'plain', wet: false, i: 5}, {x: 2060, y: 850, k: 0.7, L: 86, f: 2.2, t0: 0.6, kind: 'ji', wet: false, i: 6},
	{x: 1320, y: 930, k: 0.92, L: 88, f: 2.4, t0: 0.0, kind: 'plain', wet: false, i: 7}, {x: 700, y: 826, k: 0.62, L: 84, f: 2.2, t0: 0.4, kind: 'plain', wet: false, i: 8},
	{x: 2300, y: 960, k: 1.0, L: 90, f: 2.3, t0: 0.8, kind: 'ji', wet: false, i: 9}, {x: 1900, y: 818, k: 0.6, L: 82, f: 2.1, t0: 0.15, kind: 'plain', wet: false, i: 11},
];
type Shot = {t0: number; D: number; x0: number; y0: number; x1: number; y1: number; h: number};
const VOLLEY: Shot[] = Array.from({length: 26}, (_, i) => ({t0: 35.6 + i * 0.19 + rnd(i, 61) * 0.25, D: 1.5 + rnd(i, 62) * 0.3, x0: 1980 + rnd(i, 63) * 260, y0: 600 + rnd(i, 64) * 30,
	x1: 420 + rnd(i, 65) * 1300, y1: 760 + rnd(i, 66) * 150, h: 230 + rnd(i, 67) * 90}));
const shotAt = (s: Shot, t: number) => { const u = (t - s.t0) / s.D; if (u < 0) return null; const v = Math.min(u, 1);
	const x = lerp(s.x0, s.x1, v), y = lerp(s.y0, s.y1, v) - 4 * s.h * v * (1 - v), dx = s.x1 - s.x0, dy = (s.y1 - s.y0) - 4 * s.h * (1 - 2 * v);
	return {x, y, a: Math.atan2(dy, dx), landed: u >= 1}; };
const Runner: React.FC<{r: Run; u: number}> = ({r, u}) => { const hx0 = npcWalk(r.t0, r.L, r.f).hipX, X = r.x + r.k * hx0;
	return <g transform={at(X, r.y, r.k, true)} fill="#110C09" color="#110C09" filter="url(#xaRim)"><NpcWalk t={u} kind={r.kind} L={r.L} f={r.f} t0={r.t0} lean={11} swing={1.4} /></g>; };
const XyA: React.FC<{t: number}> = ({t}) => {
	const u = t - B18, C = camOf(0.035 * sst(0, 4, u), 980, 640, 16 * u), dusk = sst(-0.5, 4.4, u);
	const HXc = 905, HYc = 874, HK = 1.52;
	/* the horse shies as the volley lands (38.2): nose up, a hind step, then settles, still restless */
	const sh = sst(38.05, 38.45, t) - 0.75 * sst(38.6, 39.5, t);
	const hs: HorseS = {th: -6.5 * sh + 0.4 * Math.sin(t * 2.3), nk: -9 * sh + 3 * Math.sin(t * 1.7 + 0.4), tail: 4 * Math.sin(t * 2.1), bF: 0, liftH: 0};
	const lean = -5 * sh + 1.2 * Math.sin(t * 1.9), cape = 0.42 + 0.16 * Math.sin(t * 1.8) + 0.08 * Math.sin(t * 4.1 + 1);
	const pull = sh;
	const arm = {sh: [10, 84] as P, el: [30 - 10 * pull, 196] as P, hd: [96 - 30 * pull, 236 - 12 * pull] as P};
	const hand = rideToHorse(arm.hd), mouth = neckPt(hs, MOUTH);
	const handB = bodyPt(hs, rotP(hand, [2, -139], lean));
	return <Svg>
		<defs>
			<linearGradient id="xaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16212A" /><stop offset="0.42" stopColor="#2A363B" /><stop offset="0.72" stopColor="#535349" /><stop offset="0.88" stopColor="#7B6C56" /><stop offset="1" stopColor="#8F7D61" /></linearGradient>
			<radialGradient id="xaGlow" cx="1520" cy="590" r="900" gradientUnits="userSpaceOnUse" gradientTransform="translate(1520 590) scale(1 0.42) translate(-1520 -590)"><stop offset="0" stopColor="#E6CBA0" stopOpacity="0.62" /><stop offset="0.25" stopColor="#C8AA80" stopOpacity="0.3" /><stop offset="1" stopColor="#C8AA80" stopOpacity="0" /></radialGradient>
			<linearGradient id="xaRiv" x1="0" y1="630" x2="0" y2="790" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#6E6656" /><stop offset="0.3" stopColor="#4C4C44" /><stop offset="1" stopColor="#262A2A" /></linearGradient>
			<linearGradient id="xaBank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2520" /><stop offset="1" stopColor="#0D0A08" /></linearGradient>
			<linearGradient id="xaHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9C8E74" stopOpacity="0" /><stop offset="0.5" stopColor="#9C8E74" stopOpacity="0.35" /><stop offset="1" stopColor="#9C8E74" stopOpacity="0" /></linearGradient>
			<radialGradient id="xaVig" cx="0.55" cy="0.5" r="0.78"><stop offset="0.58" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
			<Blur id="xab2" s={2} /><Blur id="xab4" s={4} /><Blur id="xab10" s={10} /><Blur id="xab6" s={6} />
			<RimF id="xaFar" lx={0.5} ly={-1} k={1.2} c="#E2C69A" o={0.7} />
			<RimF id="xaRim" lx={1} ly={-0.45} k={2} c="#E8CDA0" o={0.85} lx2={-0.3} ly2={-1} k2={1.2} c2="#9FB8B6" o2={0.3} />
			<RimF id="xaHero" lx={1} ly={-0.4} k={4.4} c="#F2D8AE" o={0.9} lx2={-1} ly2={-0.15} k2={3.6} c2={ACC} o2={0.95} blur={1} />
			<Lamel pal={NPAL} />
		</defs>
		{/* P0 the dusk sky, the afterglow low in the west (the key, behind 徐荣's host) */}
		<g transform={C(0.02)}><rect x={-200} y={-100} width={2400} height={760} fill="url(#xaSky)" /><rect x={-200} y={-100} width={2400} height={760} fill="url(#xaGlow)" opacity={1 - 0.35 * dusk} />
			<g filter="url(#xab10)" opacity={0.7}>{[[400, 470, 420, 9], [1100, 430, 520, 8], [1650, 500, 380, 7], [800, 540, 600, 6]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={f1(x - u * (4 + i))} cy={y} rx={rx} ry={ry} fill="#3A3832" opacity={0.6} />)}</g></g>
		{/* P1 the far hills */}
		<g transform={C(0.15)} filter="url(#xab2)"><path d="M-200,604 C80,588 260,578 470,590 C700,572 920,582 1120,596 C1320,580 1500,584 1700,596 C1880,588 2050,592 2300,600 L2300,640 L-200,640 Z" fill="#3E403A" /></g>
		<rect y={560} width={W} height={90} fill="url(#xaHaze)" />
		{/* P2 the far bank: 徐荣's host advancing, banners 徐, backlit by the afterglow */}
		<g transform={C(0.32)}>
			<path d="M-200,628 L2300,628 L2300,648 L-200,648 Z" fill="#1E1B17" />
			<g transform={`translate(${f1(-11 * u)},0)`}>
				<g fill="#1B1511" color="#1B1511" filter="url(#xaFar)"><Ranks y={628} k={0.24} x0={1000} x1={2400} seed={5} spears={0.55} /></g>
				{[[1100, 0.44, 0], [1330, 0.5, 1], [1560, 0.46, 2], [1800, 0.52, 3], [2040, 0.46, 4], [1450, 0.36, 5], [1920, 0.38, 6], [1230, 0.36, 7]].map(([x, k, i]) =>
					<g key={i} transform={at(x, 634, k)} fill="#1E1612" color="#1E1612" filter="url(#xaFar)"><Banner h={430} w={60} ch="徐" cloth="#4E201B" clothS="#2E120F" ink="#CDB48C" wave={5 * Math.sin(t * 1.7 + i * 1.3)} /></g>)}
				<g fill="#140F0C" color="#140F0C" filter="url(#xaFar)"><Ranks y={642} k={0.31} x0={1060} x1={2400} seed={9} spears={0.45} /></g>
			</g>
		</g>
		{/* P3 the 汴水: the sky in it, the afterglow streak, ripples drifting; the fallen 曹 banner adrift */}
		<g transform={C(0.45)}>
			<rect x={-200} y={640} width={2400} height={150} fill="url(#xaRiv)" />
			<ellipse cx={1500} cy={668} rx={340} ry={16} fill="#E8CFA2" opacity={0.3 * (1 - 0.4 * dusk)} filter="url(#xab6)" />
			{Array.from({length: 34}, (_, i) => { const y = 648 + rnd(i, 71) * 130, x = ((rnd(i, 72) * 2400 + u * (10 + rnd(i, 73) * 8)) % 2400) - 200, w = 20 + rnd(i, 74) * 70 * (y - 620) / 100;
				return <rect key={i} x={f1(x)} y={f1(y)} width={f1(w)} height={1.6} fill="#C9B894" opacity={0.18 + 0.12 * Math.sin(t * 1.3 + i)} />; })}
			<g transform={`translate(${f1(560 - 9 * u)},${f1(728 + 2 * Math.sin(t * 1.4))}) rotate(-72) scale(0.42)`} fill="#17110D" color="#17110D"><Banner h={300} w={60} ch="曹" cloth="#3E1A16" clothS="#24100D" ink="#9C8466" wave={2 * Math.sin(t * 1.1)} /></g>
			<ellipse cx={f1(560 - 9 * u)} cy={732} rx={60} ry={4} fill="#9C8E74" opacity={0.25} />
			{/* men wading back across: the water hides their legs (patches in the river's own gradient) */}
			{RUNS.filter((r) => r.wet).map((r) => { const hx0 = npcWalk(r.t0, r.L, r.f).hipX, X = r.x + r.k * hx0, wx = r.x - r.k * (npcWalk(u + r.t0, r.L, r.f).hipX - hx0);
				return <g key={r.i}><g transform={at(X, r.y, r.k, true)} fill="#15100D" color="#15100D" filter="url(#xaRim)"><NpcWalk t={u} kind={r.kind} L={r.L} f={r.f} t0={r.t0} lean={9} swing={1.3} /></g>
					<rect x={f1(wx - 60 * r.k)} y={f1(r.y - 62 * r.k)} width={f1(130 * r.k)} height={f1(64 * r.k + 2)} fill="url(#xaRiv)" />
					<ellipse cx={f1(wx)} cy={f1(r.y - 62 * r.k)} rx={f1(26 * r.k)} ry={f1(3 * r.k)} fill="none" stroke="#C9B894" strokeOpacity={0.35} strokeWidth={1.2} /></g>; })}
		</g>
		{/* the volley: arrows arc out of the west and fall on the river and the near bank */}
		<g transform={C(0.6)}>{VOLLEY.map((s, i) => { const p = shotAt(s, t); if (!p) return null;
			return <g key={i} opacity={p.landed ? 0.9 : 1}><ArrowF x={p.x} y={p.y} a={p.a} L={p.landed ? 34 : 46} c={p.landed ? '#0E0A08' : '#130D0A'} /></g>; })}</g>
		{/* P4 the near bank */}
		<g transform={C(0.85)}>
			<path d="M-200,778 C200,770 500,764 820,770 C1100,778 1500,772 2300,780 L2300,1180 L-200,1180 Z" fill="url(#xaBank)" />
			<path d="M-200,778 C200,770 500,764 820,770 C1100,778 1500,772 2300,780" fill="none" stroke="#B9A47E" strokeOpacity={0.2} strokeWidth={2} />
			{Array.from({length: 18}, (_, i) => { const x = 140 + i * 110 + rnd(i, 81) * 60, y = 800 + rnd(i, 82) * 120, a = -38 - rnd(i, 83) * 26, L = 26 + (y - 780) * 0.08;
				return <g key={i} transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(a)})`}><line x1={0} y1={0} x2={L} y2={0} stroke="#0C0907" strokeWidth={2} /><path d={`M${f1(L - 9)},0 L${f1(L + 1)},-4 L${f1(L - 1)},0 L${f1(L + 1)},4 Z`} fill="#0C0907" /></g>; })}
			{RUNS.filter((r) => !r.wet && r.y < HYc).map((r) => <Runner key={r.i} r={r} u={u} />)}
			<ellipse cx={HXc + 10} cy={HYc + 4} rx={230} ry={10} fill="#050403" opacity={0.5} />
			<g transform={at(HXc, HYc, HK)} fill="#120D0A" color="#120D0A" filter="url(#xaRim)"><HorseR s={hs} /></g>
			<g filter="url(#xaHero)"><g transform={at(HXc, HYc, HK)}><g transform={bodyT(hs)}><g transform={RIDE_T}>
				<CaoRide id="xac" lean={lean} arm={arm} cape={cape} tilt={-2 - 2 * sh} /></g></g></g></g>
			<g transform={at(HXc, HYc, HK)}><path d={`M${f1(handB[0])},${f1(handB[1])} Q${f1((handB[0] + mouth[0]) / 2)},${f1((handB[1] + mouth[1]) / 2 + 6 - 4 * pull)} ${f1(mouth[0])},${f1(mouth[1])}`} fill="none" stroke="#0E0A08" strokeWidth={1.3} /></g>
			{/* his men running past on the near bank */}
			{RUNS.filter((r) => !r.wet && r.y >= HYc).map((r) => <Runner key={r.i} r={r} u={u} />)}
		</g>
		{/* P5 reeds in the near foreground, out of focus */}
		<g transform={C(1.3)} filter="url(#xab4)" fill="#080605">
			<path d="M-200,1080 C0,1010 200,1000 420,1030 C520,1046 600,1060 660,1080 Z" />
			{Array.from({length: 22}, (_, i) => { const x = -60 + i * 30 + rnd(i, 91) * 20, h = 90 + rnd(i, 92) * 120, sw = 6 * Math.sin(t * 1.3 + i * 0.7);
				return <path key={i} d={`M${f1(x)},1080 Q${f1(x + 4 + sw / 2)},${f1(1080 - h / 2)} ${f1(x + 10 + sw)},${f1(1080 - h)} L${f1(x + 14 + sw)},${f1(1080 - h + 4)} Q${f1(x + 10 + sw / 2)},${f1(1080 - h / 2)} ${f1(x + 9)},1080 Z`} />; })}
			<path d="M1640,1080 C1720,1030 1840,1020 2000,1040 L2000,1080 Z" />
		</g>
		{/* dusk turning to night */}
		<rect width={W} height={H} fill="#0A1117" opacity={0.26 * dusk} />
		<rect width={W} height={H} fill="url(#xaVig)" />
	</Svg>; };

/* ============================ card 11 · night · the wound, the stumble, torches on the rise (40.49–44.48) ============================ */
type Pur = {x: number; y: number; k: number; t0: number; v: number; rider: boolean; i: number};
const PURS: Pur[] = [
	{x: 1420, y: 0, k: 0.62, t0: 40.3, v: 12, rider: false, i: 0}, {x: 1600, y: 0, k: 0.6, t0: 40.5, v: 10, rider: true, i: 1}, {x: 1760, y: 0, k: 0.64, t0: 41.1, v: 13, rider: false, i: 2},
	{x: 1930, y: 0, k: 0.56, t0: 40.9, v: 9, rider: true, i: 3}, {x: 2060, y: 0, k: 0.6, t0: 41.7, v: 12, rider: false, i: 4}, {x: 1300, y: 0, k: 0.66, t0: 42.2, v: 14, rider: false, i: 5},
	{x: 1520, y: 0, k: 0.58, t0: 42.6, v: 11, rider: false, i: 6}, {x: 1850, y: 0, k: 0.62, t0: 42.0, v: 12, rider: false, i: 7}, {x: 2160, y: 0, k: 0.56, t0: 43.0, v: 10, rider: true, i: 8},
];
const crestY = (x: number) => x < 820 ? 724 - (x + 200) * 0.004 : x < 1360 ? 720 - (x - 820) * 0.21 : 607 - (x - 1360) * 0.012;
const XyB: React.FC<{t: number}> = ({t}) => {
	const u = t - B20, C = camOf(0.05 * sst(0, 4.2, u), 900, 640, -10 * u);
	const HXc = 700, HYc = 946, HK = 2.42;
	/* limping in place, then the near fore buckles (41.85), the forehand drops; it struggles half up and stands trembling */
	const bk = sst(41.8, 42.15, t) - 0.4 * sst(42.6, 43.3, t), tr = 0.5 * Math.sin(t * 17) * sst(42.4, 43, t);
	const limp = (1 - sst(41.7, 41.9, t)) * Math.max(0, Math.sin(t * 4.4));
	const hs: HorseS = {th: 13 * bk + 1.2 * limp + tr * 0.5, nk: 20 * bk + 4 * Math.sin(t * 1.6) + 3 * limp, dy: 4 * bk, bF: 0.95 * bk + 0.25 * limp, bF2: 0.3 * bk, tail: -3 + 3 * Math.sin(t * 1.4), liftH: 0};
	const jolt = sst(41.88, 42.3, t) - 0.55 * sst(42.4, 43.1, t);
	const lean = 6 + 14 * jolt + 0.8 * Math.sin(t * 2.2), cape = 0.3 + 0.1 * Math.sin(t * 1.5);
	const arm = {sh: [10, 84] as P, el: [36, 196] as P, hd: [104 + 10 * jolt, 248 + 14 * jolt] as P};
	const hand = rideToHorse(arm.hd), mouth = neckPt(hs, MOUTH), handB = bodyPt(hs, rotP(hand, [2, -139], lean));
	const glow = 0.25 + 0.75 * sst(40.3, 43.5, t);
	return <Svg>
		<defs>
			<linearGradient id="xbSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#111B22" /><stop offset="0.45" stopColor="#1F2C33" /><stop offset="0.62" stopColor="#33403F" /><stop offset="0.7" stopColor="#3E4842" /></linearGradient>
			<radialGradient id="xbTor" cx="1650" cy="590" r="760" gradientUnits="userSpaceOnUse" gradientTransform="translate(1650 590) scale(1 0.5) translate(-1650 -590)"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.45" /><stop offset="0.3" stopColor="#E8CFA0" stopOpacity="0.16" /><stop offset="1" stopColor="#E8CFA0" stopOpacity="0" /></radialGradient>
			<linearGradient id="xbHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#262420" /><stop offset="1" stopColor="#141210" /></linearGradient>
			<linearGradient id="xbGnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C1A17" /><stop offset="0.5" stopColor="#14120F" /><stop offset="1" stopColor="#0A0807" /></linearGradient>
			<radialGradient id="xbPool" cx="1200" cy="760" r="900" gradientUnits="userSpaceOnUse" gradientTransform="translate(1200 760) scale(1 0.3) translate(-1200 -760)"><stop offset="0" stopColor="#A89474" stopOpacity="0.2" /><stop offset="1" stopColor="#A89474" stopOpacity="0" /></radialGradient>
			<radialGradient id="xbVig" cx="0.52" cy="0.52" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
			<Blur id="xbb2" s={2} /><Blur id="xbb5" s={5} /><Blur id="xbb12" s={12} />
			<RimF id="xbFar" lx={0} ly={-1} k={1.3} c="#F3DDB4" o={0.8} lx2={-1} ly2={0} k2={1} c2="#E8CFA0" o2={0.5} />
			<RimF id="xbCrest" lx={0} ly={-1} k={2} c="#E8CFA0" o={0.7} />
			<RimF id="xbRim" lx={1} ly={-0.5} k={2.4} c="#F0D6A8" o={0.85} lx2={-0.4} ly2={-1} k2={1.4} c2="#9FB8B6" o2={0.4} />
			<RimF id="xbHero" lx={1} ly={-0.35} k={4.6} c="#F3DDB4" o={0.92} lx2={-1} ly2={-0.25} k2={3.8} c2={ACC} o2={0.95} blur={1} />
			<Lamel pal={NPAL} />
		</defs>
		<g transform={C(0.02)}><rect x={-200} y={-100} width={2400} height={900} fill="url(#xbSky)" />
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={f1(rnd(i, 11) * 2000)} cy={f1(320 + rnd(i, 12) * 260)} r={0.8 + rnd(i, 13) * 0.9} fill="#D8DCD4" opacity={0.25 + 0.2 * Math.sin(t * 2 + i)} />)}
			<g filter="url(#xbb12)">{[[300, 420, 500, 10], [1000, 380, 600, 9], [1600, 460, 420, 8]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={f1(x - u * 5)} cy={y} rx={rx} ry={ry} fill="#2A3436" opacity={0.7} />)}</g></g>
		<g transform={C(0.18)} filter="url(#xbb2)"><path d="M-200,690 C200,676 500,672 800,684 C1100,690 1400,680 2300,690 L2300,760 L-200,760 Z" fill="#262A28" /></g>
		{/* P2 the rise behind: the pursuers come up over its crest, torches first */}
		<g transform={C(0.4)}>
			<rect x={-200} y={300} width={2400} height={500} fill="url(#xbTor)" opacity={glow} />
			{PURS.map((p) => { const e = sst(p.t0, p.t0 + 1.6, t), x = p.x - p.v * (t - 40.5), y = crestY(x) + ((1 - e) * 170 + (p.rider ? 96 : 50)) * p.k * 1.22 + 2.4 * Math.sin(t * 7 + p.i) * p.k;
				const tip = p.rider ? RIDER_TORCH : TORCH_TIP;
				return <g key={p.i}>
					<g transform={at(x, y, p.k * 1.22, true)} fill="#130D0A" color="#130D0A" filter="url(#xbFar)">{p.rider ? <FarRider /> : <Stand kind="torch" helm={p.i % 2 === 0} />}</g>
					{e > 0.05 && <Flame x={x - tip[0] * p.k * 1.22} y={y + tip[1] * p.k * 1.22} s={p.k * 1.15} t={t} seed={p.i * 7 + 3} ivory glow={1.3 * e} />}</g>; })}
			<g filter="url(#xbCrest)"><path d={`M-200,840 L-200,724 ${Array.from({length: 27}, (_, i) => { const x = -200 + i * 100; return `L${x},${f1(crestY(x) + 3 * Math.sin(i * 1.7))}`; }).join(' ')} L2600,590 L2600,840 Z`} fill="url(#xbHill)" />
				{Array.from({length: 30}, (_, i) => { const x = 700 + i * 52 + rnd(i, 44) * 30, y = crestY(x); return <path key={i} d={`M${f1(x)},${f1(y + 2)} l${f1(-3 + rnd(i, 45) * 6)},${f1(-7 - rnd(i, 46) * 9)} M${f1(x + 4)},${f1(y + 2)} l${f1(2 + rnd(i, 47) * 4)},${f1(-5 - rnd(i, 48) * 6)}`} stroke="#1A1714" strokeWidth={1.6} />; })}</g>
		</g>
		{/* P3 the open ground where he has stopped */}
		<g transform={C(0.8)}>
			<path d="M-200,806 C300,796 900,792 1500,802 C1900,808 2100,812 2300,816 L2300,1200 L-200,1200 Z" fill="url(#xbGnd)" />
			<rect x={-200} y={760} width={2400} height={200} fill="url(#xbPool)" opacity={glow} />
		</g>
		<g transform={C(1)}>
			<ellipse cx={HXc - 20} cy={HYc + 4} rx={280} ry={12} fill="#050403" opacity={0.55} />
			<g transform={at(HXc, HYc, HK, true)} fill="#110C09" color="#110C09" filter="url(#xbRim)"><HorseR s={hs} arrow /></g>
			<g filter="url(#xbHero)"><g transform={at(HXc, HYc, HK, true)}><g transform={bodyT(hs)}><g transform={RIDE_T}>
				<CaoRide id="xbc" lean={lean} arm={arm} cape={cape} headFlip tilt={-lean - 4 + 4 * jolt + 1.5 * Math.sin(t * 1.3)} arrow /></g></g></g></g>
			<g transform={at(HXc, HYc, HK, true)}><path d={`M${f1(handB[0])},${f1(handB[1])} Q${f1((handB[0] + mouth[0]) / 2)},${f1((handB[1] + mouth[1]) / 2 + 8)} ${f1(mouth[0])},${f1(mouth[1])}`} fill="none" stroke="#0E0A08" strokeWidth={1.2} /></g>
		</g>
		{/* near: a broken spear and grass, out of focus */}
		<g transform={C(1.3)} filter="url(#xbb5)" fill="#070504">
			<path d="M1400,1080 C1500,1036 1700,1024 2000,1040 L2000,1080 Z" /><path d="M1460,1060 L1880,930 L1886,940 L1466,1068 Z" />
			{Array.from({length: 16}, (_, i) => <path key={i} d={`M${1480 + i * 30},1070 l${f1(-8 + rnd(i, 41) * 16)},${f1(-50 - rnd(i, 42) * 50)} l6,0 Z`} />)}
			<path d="M-200,1080 C-60,1050 120,1046 300,1064 L320,1080 Z" />
		</g>
		<rect width={W} height={H} fill="url(#xbVig)" />
	</Svg>; };
export const Xingyang: React.FC<{t: number}> = ({t}) => t < B20 ? <XyA t={t} /> : <XyB t={t} />;

/* ============================ card 12 · 曹洪让马 (44.48–48.46) ============================ */
/** 曹洪, dismounted (cm, facing +x): helmet, armoured tunic, a short cape, the near arm held out with the reins; head bowed b (deg) */
const HongFig: React.FC<{reach: number; b: number; cape: number}> = ({reach, b, cape}) => {
	const sh: P = [2, -134], el: P = [lerp(6, 24, reach), lerp(-108, -122, reach)], hd: P = [lerp(10, 48, reach), lerp(-84, -124, reach)];
	return <g>
		<path d={`M-8,-138 C-20,-120 ${-26 - cape * 10},-80 ${-30 - cape * 16},-40 C-20,-36 -12,-38 -6,-44 C-8,-80 -6,-110 -2,-134 Z`} />
		<path d={strand([[-2, -134], [-6, -106], [-3, -84]], () => 4.6)} />
		<path d="M-6,-52 L-8,-6 L4,-6 L4,-52 Z M3,-52 L9,-6 L19,-6 L13,-52 Z" /><path d="M-12,-6 L4,-6 L5,0 L-12,0 Z M8,-6 L21,-5 L22,0 L8,0 Z" />
		<path d={TUNIC} /><path d="M-14,-128 C-6,-134 8,-134 15,-128 L14,-118 C6,-122 -6,-122 -13,-118 Z" />
		<path d="M10,-100 L-24,-64 L-22.4,-62.4 L11.6,-98.4 Z" /><path d="M-15,-103 L15,-105 L15.4,-99 L-14.6,-97 Z" />
		<g transform={`rotate(${f1(b)} 2 -146)`}><path d={NECK} /><path d={HEAD} /><path d={ZE} /></g>
		<path d="M-10,-140 C-2,-146 12,-144 16,-134 C18,-126 16,-118 12,-112 L-6,-114 C-12,-122 -14,-132 -10,-140 Z" />
		<path d={strand([sh, el], (u) => 5.4 - u * 0.6)} /><path d={strand([el, hd], (u) => 4.8 - u * 1)} /><circle cx={hd[0]} cy={hd[1]} r={4.2} />
	</g>; };
const HONG_HAND = (reach: number): P => [lerp(10, 48, reach), lerp(-84, -124, reach)];
const Hong_: React.FC<{t: number}> = ({t}) => {
	const u = t - B22, C = camOf(0.06 * sst(0, 4.4, u), 760, 600, 6 * u);
	/* 曹洪 has his arm out from the start; 曹操 raises his face to him (44.9–46.0), then his hand rises to the reins (46.1–47.3) and holds */
	const look = sst(44.8, 46.0, t), take = sst(46.1, 47.4, t), breath = Math.sin(t * 2.0);
	const S = 0.6, CX = 610, CY = 972, NK = S * 4.98, HX = 900, HY = 972;
	const reach = 0.92 + 0.08 * sst(44.5, 45.6, t) - 0.04 * take;
	const hh = HONG_HAND(reach), hongHand: P = [HX - hh[0] * NK, HY + hh[1] * NK];
	/* 曹操's near arm: hanging, then up and out; the hand ends at 曹洪's hand (Cao units relative to his origin) */
	const tgt: P = [(hongHand[0] - CX) / S - 52, (hongHand[1] - (CY - 750 * S)) / S + 84];
	const hd: P = [lerp(60, tgt[0], take), lerp(262, tgt[1], take)], el: P = [lerp(30, (10 + tgt[0]) / 2 + 4, take), lerp(200, (84 + tgt[1]) / 2 + 34, take)];
	const arm = {sh: [10, 84] as P, el, hd};
	const hS: HorseS = {th: 0.3 * Math.sin(t * 1.1), nk: 6 + 2.5 * Math.sin(t * 0.9), tail: 3 * Math.sin(t * 1.3)};
	const HRX = 1290, HRY = 948, HRK = 2.7;
	const mouthS = (() => { const m = neckPt(hS, MOUTH); return [HRX - m[0] * HRK, HRY + m[1] * HRK] as P; })();
	const caoHandS: P = [CX + hd[0] * S, CY - 750 * S + hd[1] * S];
	const near = sst(44.5, 48.5, t);
	return <Svg>
		<defs>
			<linearGradient id="hgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101A21" /><stop offset="0.5" stopColor="#1C2930" /><stop offset="0.66" stopColor="#2E3836" /></linearGradient>
			<radialGradient id="hgTor" cx="1500" cy="640" r="760" gradientUnits="userSpaceOnUse" gradientTransform="translate(1500 640) scale(1 0.55) translate(-1500 -640)"><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.5" /><stop offset="0.3" stopColor="#E8CFA0" stopOpacity="0.2" /><stop offset="1" stopColor="#E8CFA0" stopOpacity="0" /></radialGradient>
			<linearGradient id="hgGnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24211C" /><stop offset="0.4" stopColor="#171410" /><stop offset="1" stopColor="#0A0807" /></linearGradient>
			<radialGradient id="hgPool" cx="1100" cy="900" r="900" gradientUnits="userSpaceOnUse" gradientTransform="translate(1100 900) scale(1 0.28) translate(-1100 -900)"><stop offset="0" stopColor="#B49E7A" stopOpacity="0.22" /><stop offset="1" stopColor="#B49E7A" stopOpacity="0" /></radialGradient>
			<radialGradient id="hgVig" cx="0.5" cy="0.52" r="0.74"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.62" /></radialGradient>
			<Blur id="hgb2" s={2} /><Blur id="hgb3" s={3} /><Blur id="hgb12" s={12} />
			<RimF id="hgFar" lx={0} ly={-1} k={1.4} c="#F3DDB4" o={0.8} lx2={-1} ly2={0} k2={1} c2="#E8CFA0" o2={0.5} />
			<RimF id="hgCrest" lx={0} ly={-1} k={2.2} c="#EAD2A6" o={0.75} />
			<RimF id="hgRim" lx={1} ly={-0.45} k={3.2} c="#F5DCB0" o={0.92} lx2={-0.4} ly2={-1} k2={1.6} c2="#9FB8B6" o2={0.4} />
			<RimF id="hgHero" lx={1} ly={-0.3} k={5} c="#F5DDB4" o={0.95} lx2={-1} ly2={-0.2} k2={4.2} c2={ACC} o2={0.95} blur={1.1} />
			<clipPath id="hgBody"><rect x={-500} y={52} width={1000} height={900} /></clipPath>
			<Lamel pal={NPAL} />
		</defs>
		<g transform={C(0.02)}><rect x={-200} y={-100} width={2400} height={900} fill="url(#hgSky)" />
			{Array.from({length: 34}, (_, i) => <circle key={i} cx={f1(rnd(i, 21) * 2000)} cy={f1(330 + rnd(i, 22) * 240)} r={0.8 + rnd(i, 23)} fill="#D8DCD4" opacity={0.22 + 0.18 * Math.sin(t * 1.8 + i)} />)}
			<g filter="url(#hgb12)">{[[500, 440, 600, 9], [1300, 400, 560, 8]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={f1(x - u * 4)} cy={y} rx={rx} ry={ry} fill="#28322F" opacity={0.7} />)}</g></g>
		{/* P1 the ridge close behind, the torches now near: a line of them coming down */}
		<g transform={C(0.35)}>
			<rect x={-200} y={300} width={2400} height={600} fill="url(#hgTor)" opacity={0.75 + 0.25 * near} />
			{Array.from({length: 11}, (_, i) => { const x = 1060 + i * 82 + rnd(i, 31) * 40 - 14 * u * (0.6 + rnd(i, 32) * 0.5), k = 0.42 + rnd(i, 33) * 0.1, y = 676 - (x - 1000) * 0.07 + 30 * k + 3 * Math.sin(t * 6.5 + i) * k, fl = rnd(i, 34) < 0.75;
				return <g key={i}><g transform={at(x, y, k, true)} fill="#130D0A" color="#130D0A" filter="url(#hgFar)"><Stand kind={fl ? 'torch' : 'ji'} helm={i % 3 === 0} /></g>
					{fl && <Flame x={x - TORCH_TIP[0] * k} y={y + TORCH_TIP[1] * k} s={k * 0.95} t={t} seed={i * 5 + 1} ivory glow={1.25} />}</g>; })}
			<g filter="url(#hgCrest)"><path d="M-200,820 L-200,700 C200,694 600,690 1000,684 C1300,676 1600,650 1900,640 L2400,630 L2400,820 Z" fill="#1A1714" /></g>
		</g>
		<g transform={C(0.75)}><path d="M-200,820 C400,808 1000,804 1600,812 L2300,820 L2300,1200 L-200,1200 Z" fill="url(#hgGnd)" /><rect x={-200} y={780} width={2400} height={260} fill="url(#hgPool)" /></g>
		{/* P4 the pair: 曹洪's horse, 曹洪 holding out the reins, 曹操 */}
		<g transform={C(1)}>
			<ellipse cx={1240} cy={HRY + 4} rx={300} ry={12} fill="#050403" opacity={0.5} />
			<g transform={at(HRX, HRY, HRK, true)} fill="#120C09" color="#120C09" filter="url(#hgRim)"><HorseR s={hS} /></g>
			<ellipse cx={HX} cy={HY + 3} rx={70} ry={8} fill="#050403" opacity={0.6} />
			<g transform={at(HX, HY, NK, true)} fill="#130D0A" color="#130D0A" filter="url(#hgRim)"><HongFig reach={reach} b={10 + 1.5 * breath} cape={0.4 + 0.15 * Math.sin(t * 1.6)} /></g>
			{/* the reins: from the bit to 曹洪's hand, the slack hanging in a loop that 曹操's hand closes on */}
			{(() => { const g = sst(0.72, 1, take), lb: P = [lerp(hongHand[0] - 14, caoHandS[0] + 4, g), lerp(hongHand[1] + 74, caoHandS[1] + 6, g)];
				const r1 = `M${f1(mouthS[0])},${f1(mouthS[1])} Q${f1((mouthS[0] + hongHand[0]) / 2 + 10)},${f1(Math.max(mouthS[1], hongHand[1]) + 46)} ${f1(hongHand[0])},${f1(hongHand[1])}`;
				const r2 = `M${f1(hongHand[0] - 2)},${f1(hongHand[1] + 2)} C${f1(hongHand[0] - 6)},${f1(hongHand[1] + 40)} ${f1(lb[0] - 4)},${f1(lb[1] + 6)} ${f1(lb[0])},${f1(lb[1])} C${f1(lb[0] + 12)},${f1(lb[1] - 4)} ${f1(hongHand[0] + 8)},${f1(hongHand[1] + 34)} ${f1(hongHand[0] + 3)},${f1(hongHand[1] + 3)}`;
				return <g fill="none" strokeLinecap="round"><path d={r1} stroke="#2A1D15" strokeWidth={4} /><path d={r1} stroke="#B89A72" strokeWidth={1.2} opacity={0.55} transform="translate(0.6,-1.6)" />
					<path d={r2} stroke="#2A1D15" strokeWidth={4} /><path d={r2} stroke="#C8AA80" strokeWidth={1.2} opacity={0.6} transform="translate(0.8,-1.4)" /></g>; })()}
			<ellipse cx={CX} cy={CY + 3} rx={90} ry={9} fill="#050403" opacity={0.6} />
			<g filter="url(#hgHero)"><g transform={`translate(${CX},${f1(CY - 750 * S)}) scale(${S})`}>
				<g transform={`rotate(${f1(3 - 2 * look + 0.4 * breath)} 0 700)`}>
					<g clipPath="url(#hgBody)"><Cao pal={NPAL} id="hgc" old={false} armour arm={arm} cape={0.25 + 0.08 * Math.sin(t * 1.5)} /></g>
					<g transform={`translate(0,49) rotate(${f1(9 - 13 * look + 0.6 * breath)} 0 -8) scale(0.88) translate(0,-40)`}><Head old={false} mid pal={NPAL} id="hgh" cap="wu" /></g>
					<ShoulderArrow a={-6} />
				</g></g></g>
		</g>
		<g transform={C(1.3)} filter="url(#hgb3)" fill="#060403">
			<path d="M-200,1080 C0,1046 200,1040 380,1060 L420,1080 Z" /><path d="M1560,1080 C1680,1040 1840,1034 2100,1050 L2100,1080 Z" />
		</g>
		<rect width={W} height={H} fill="url(#hgVig)" />
	</Svg>; };
export const Hong: React.FC<{t: number}> = ({t}) => <Hong_ t={t} />;

/* ============================ card 13 · 蒿里行 · grey dawn (48.46–52.45) ============================ */
/** a crow in flight (px), flap phase ph */
const Crow: React.FC<{x: number; y: number; s: number; ph: number; dir?: number}> = ({x, y, s, ph, dir = 1}) => { const w = Math.sin(ph), up = -9 * w * s, d = dir;
	return <g transform={`translate(${f1(x)},${f1(y)}) scale(${d},1)`}>
		<path d={`M${f1(-7 * s)},0 C${f1(-3 * s)},${f1(-2 * s)} ${f1(4 * s)},${f1(-2 * s)} ${f1(8 * s)},${f1(-0.6 * s)} L${f1(10.5 * s)},0 L${f1(8 * s)},${f1(1 * s)} C${f1(4 * s)},${f1(2.4 * s)} ${f1(-3 * s)},${f1(2 * s)} ${f1(-7 * s)},${f1(1 * s)} L${f1(-11 * s)},${f1(2.4 * s)} L${f1(-10 * s)},0 Z`} />
		<path d={`M${f1(-2 * s)},${f1(-0.5 * s)} Q${f1(-6 * s)},${f1(up * 0.6 - 4 * s)} ${f1(-12 * s)},${f1(up - 2 * s)} Q${f1(-4 * s)},${f1(up * 0.4)} ${f1(3 * s)},${f1(-0.5 * s)} Z`} />
		<path d={`M${f1(0)},${f1(-0.5 * s)} Q${f1(-2 * s)},${f1(up * 0.6 - 3 * s)} ${f1(-6 * s)},${f1(up * 0.9 - 1 * s)} Q${f1(0)},${f1(up * 0.3)} ${f1(4 * s)},${f1(-0.5 * s)} Z`} opacity={0.8} />
	</g>; };
/** a perched crow (px): body, tail, beak; peck = head dip */
const Perch: React.FC<{x: number; y: number; s: number; d?: number; peck?: number}> = ({x, y, s, d = 1, peck = 0}) => <g transform={`translate(${f1(x)},${f1(y)}) scale(${d * s},${s})`}>
	<path d="M-6,-1 C-6,-6 -2,-9 3,-9 C6,-9 8,-7 8,-4 L6,0 Z M-6,-2 L-12,3 L-10,4 L-4,0 Z" /><path d="M-1,0 L-2,4 M2,0 L2,4" stroke="currentColor" strokeWidth={0.8} />
	<g transform={`rotate(${f1(peck * 30)} 5 -8)`}><circle cx={6} cy={-10} r={3} /><path d="M8,-11 L13,-9.6 L8,-8.6 Z" /></g></g>;
/** a roofless rammed-earth house (px): front wall with a broken top and a breach, the lit side wall toward the dawn, an empty doorway
    and window, the last rafters of the roof frame, one fallen across the wall */
const Shell: React.FC<{x: number; y: number; w: number; h: number; d: number; seed: number; lit: string; body: string; dark: string; frame?: boolean}> = ({x, y, w, h, d, seed, lit, body, dark, frame = true}) => {
	const n = 8, br = 2 + Math.floor(rnd(1, seed) * 4), top = (i: number) => (i === br || i === br + 1 ? 0.34 : 0.62 + 0.38 * rnd(i, seed)) * h;
	const edge = Array.from({length: n + 1}, (_, i) => `L${f1(x + (w * i) / n + (i > 0 && i < n ? (rnd(i, seed + 2) - 0.5) * 8 : 0))},${f1(y - top(i))}`).join(' ');
	const hs = top(n);
	return <g>
		<path d={`M${f1(x + w)},${y} L${f1(x + w + d)},${f1(y - d * 0.3)} L${f1(x + w + d)},${f1(y - d * 0.3 - hs * 0.7)} L${f1(x + w + d * 0.5)},${f1(y - d * 0.15 - hs * 1.06)} L${f1(x + w)},${f1(y - hs)} Z`} fill={lit} />
		{frame && (() => { const G: P = [x + w + d * 0.5, y - d * 0.15 - hs * 1.06], R: P = [x + w * 0.5, G[1] + 8], lw = Math.max(1.6, h * 0.035);
			return <g stroke={dark} strokeWidth={lw} strokeLinecap="round">
				<line x1={f1(G[0])} y1={f1(G[1])} x2={f1(R[0])} y2={f1(R[1])} />
				{[0.18, 0.45, 0.72].map((a) => { const rx = R[0] + (G[0] - R[0]) * a, ry = R[1] + (G[1] - R[1]) * a; return <line key={a} x1={f1(rx)} y1={f1(ry)} x2={f1(rx - w * 0.1)} y2={f1(y - h * 0.86)} />; })}
				<line x1={f1(R[0] - 2)} y1={f1(R[1] + 2)} x2={f1(x + w * 0.3)} y2={f1(y - h * 0.08)} /></g>; })()}
		<path d={`M${x},${y} ${edge} L${f1(x + w)},${y} Z`} fill={body} />
		{Array.from({length: 5}, (_, i) => <rect key={i} x={x} y={f1(y - h * (0.12 + i * 0.16))} width={w} height={Math.max(1, h * 0.012)} fill={dark} opacity={0.3} />)}
		<rect x={f1(x + w * 0.18)} y={f1(y - h * 0.58)} width={f1(w * 0.15)} height={f1(h * 0.58)} fill={dark} />
		<rect x={f1(x + w * 0.62)} y={f1(y - h * 0.5)} width={f1(w * 0.12)} height={f1(h * 0.14)} fill={dark} />
		<path d={`M${f1(x + w * 0.05)},${y} L${f1(x + w * 0.1)},${f1(y - h * 0.08)} L${f1(x + w * 0.16)},${y} Z M${f1(x + w * 0.5)},${y} L${f1(x + w * 0.56)},${f1(y - h * 0.1)} L${f1(x + w * 0.64)},${f1(y - h * 0.04)} L${f1(x + w * 0.68)},${y} Z`} fill={body} />
	</g>; };
const CROWS = Array.from({length: 6}, (_, i) => ({x0: 1180 + rnd(i, 51) * 600, y0: 360 + rnd(i, 52) * 150, v: 14 + rnd(i, 53) * 12, s: 1.3 + rnd(i, 54) * 0.7, f: 5.5 + rnd(i, 55) * 2.5, i}));
const Haoli_: React.FC<{t: number}> = ({t}) => {
	const u = t - B24, push = sst(-0.3, 3.7, u), C = camOf(0.075 * push, 1060, 700, 26 * push, 0);
	const S = 0.215, CX = 560, CY = 846, cape = 0.3 + 0.12 * Math.sin(t * 1.3) * (1 - 0.6 * sst(51.3, 52.4, t));
	const dawn = sst(-0.5, 4, u);
	const LIT = '#A09684', BODY = '#68635A', DARK = '#36332E';
	return <Svg>
		<defs>
			<linearGradient id="hlSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3B4446" /><stop offset="0.4" stopColor="#5A6262" /><stop offset="0.6" stopColor="#7E8078" /><stop offset="0.68" stopColor="#9C9686" /></linearGradient>
			<radialGradient id="hlDawn" cx="1580" cy="620" r="900" gradientUnits="userSpaceOnUse" gradientTransform="translate(1580 620) scale(1 0.35) translate(-1580 -620)"><stop offset="0" stopColor="#D6C6A6" stopOpacity="0.6" /><stop offset="0.3" stopColor="#BEB096" stopOpacity="0.25" /><stop offset="1" stopColor="#BEB096" stopOpacity="0" /></radialGradient>
			<linearGradient id="hlField" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7A766A" /><stop offset="0.3" stopColor="#5C584E" /><stop offset="1" stopColor="#3A3630" /></linearGradient>
			<linearGradient id="hlRise" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E2B26" /><stop offset="1" stopColor="#14120F" /></linearGradient>
			<linearGradient id="hlHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B0AA9A" stopOpacity="0" /><stop offset="0.5" stopColor="#B0AA9A" stopOpacity="0.45" /><stop offset="1" stopColor="#B0AA9A" stopOpacity="0" /></linearGradient>
			<radialGradient id="hlVig" cx="0.55" cy="0.5" r="0.78"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.42" /></radialGradient>
			<Blur id="hlb2" s={2} /><Blur id="hlb3" s={3} /><Blur id="hlb5" s={5} /><Blur id="hlb12" s={12} />
			<RimF id="hlRim" lx={1} ly={-0.5} k={1.6} c="#D8CAAA" o={0.7} />
			<RimF id="hlHero" lx={1} ly={-0.4} k={3.4} c="#E6D8B8" o={0.9} lx2={-1} ly2={-0.2} k2={3} c2={ACC} o2={0.95} blur={0.9} />
			<clipPath id="hlBody"><rect x={-500} y={52} width={1000} height={900} /></clipPath>
			<Lamel pal={NPAL} />
		</defs>
		<g transform={C(0.02)}><rect x={-200} y={-100} width={2400} height={820} fill="url(#hlSky)" /><rect x={-200} y={-100} width={2400} height={820} fill="url(#hlDawn)" opacity={0.75 + 0.25 * dawn} />
			<g filter="url(#hlb12)">{[[300, 360, 560, 12], [1000, 300, 640, 10], [1500, 420, 520, 11], [700, 470, 700, 8]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={f1(x - u * (3 + i))} cy={y} rx={rx} ry={ry} fill="#6A6E6A" opacity={0.55} />)}</g></g>
		{/* P1 far bare hills */}
		<g transform={C(0.12)} filter="url(#hlb3)"><path d="M-200,640 C100,600 320,590 560,612 C800,580 1060,586 1300,610 C1520,590 1760,596 2300,616 L2300,700 L-200,700 Z" fill="#6A6C66" /></g>
		<rect y={590} width={W} height={110} fill="url(#hlHaze)" />
		{/* P2 the empty fields running to the village; furrows gone to weed */}
		<g transform={C(0.4)}>
			<path d="M-200,656 L2300,656 L2300,1200 L-200,1200 Z" fill="url(#hlField)" />
			{Array.from({length: 26}, (_, i) => { const x = -400 + i * 110; return <path key={i} d={`M${x},1100 L${f1(1060 + (x - 1060) * 0.12)},660`} stroke="#3E3A33" strokeOpacity={0.16} strokeWidth={2} strokeDasharray={`${f1(40 + rnd(i, 66) * 120)} ${f1(14 + rnd(i, 67) * 60)}`} />; })}
			{Array.from({length: 60}, (_, i) => { const x = rnd(i, 61) * 2200 - 100, y = 670 + rnd(i, 62) ** 1.6 * 300, h = 4 + (y - 650) * 0.06;
				return <path key={i} d={`M${f1(x)},${f1(y)} l${f1(-2 + rnd(i, 63) * 4)},${f1(-h)} M${f1(x + 3)},${f1(y)} l${f1(1 + rnd(i, 64) * 3)},${f1(-h * 0.8)}`} stroke="#4A463E" strokeWidth={1.4} />; })}
		</g>
		{/* P3 the village: roofless houses, the breached enclosure wall, the dead tree with crows */}
		<g transform={C(0.5)}>
			<g filter="url(#hlb2)" opacity={0.8}>
				<Shell x={1700} y={690} w={120} h={52} d={26} seed={9} lit="#9A9282" body="#77736A" dark="#5A564E" frame={false} />
				<Shell x={1550} y={696} w={100} h={46} d={22} seed={4} lit="#9A9282" body="#77736A" dark="#5A564E" />
				<Shell x={760} y={694} w={110} h={48} d={22} seed={6} lit="#9A9282" body="#77736A" dark="#5A564E" frame={false} />
			</g>
			<Shell x={900} y={716} w={160} h={78} d={36} seed={3} lit={LIT} body={BODY} dark={DARK} />
			<Shell x={1300} y={706} w={140} h={66} d={30} seed={12} lit={LIT} body={BODY} dark={DARK} frame={false} />
			<Shell x={1090} y={736} w={200} h={100} d={44} seed={7} lit={LIT} body={BODY} dark={DARK} />
			{/* the enclosure wall, breached in three places */}
			<path d="M700,752 L700,730 L760,728 L790,734 L830,726 L860,732 L862,752 Z M940,758 L940,738 L990,732 L1030,740 L1046,758 Z M1330,756 L1330,734 L1380,730 L1420,736 L1440,728 L1500,734 L1510,756 Z M1580,750 L1580,732 L1640,728 L1700,736 L1702,750 Z" fill={BODY} />
			<path d="M862,752 L880,744 L906,752 Z M1046,758 L1062,748 L1090,758 Z M1510,756 L1528,748 L1552,756 Z" fill={DARK} />
			{/* the dead tree */}
			<g fill="#2C2823" stroke="#2C2823" strokeLinecap="round">
				<path d="M1462,768 C1458,720 1456,660 1462,600 C1464,580 1466,560 1470,540 L1480,540 C1478,570 1478,620 1480,660 C1482,700 1486,740 1492,768 Z" />
				<path d="M1466,640 C1440,606 1410,584 1372,566 M1472,600 C1490,566 1520,540 1556,526 M1468,560 C1456,526 1446,500 1428,474 M1476,556 C1488,520 1494,494 1490,460 M1384,572 C1368,556 1356,548 1340,544 M1546,532 C1560,512 1572,502 1590,496 M1434,484 C1426,468 1416,458 1404,452 M1490,470 C1502,452 1512,444 1526,440" fill="none" strokeWidth={5} />
				<path d="M1372,566 C1360,560 1348,558 1334,560 M1556,526 C1570,522 1584,522 1598,528 M1428,474 C1432,458 1434,446 1430,436 M1490,460 C1484,446 1482,436 1486,424 M1340,544 C1332,536 1326,532 1316,532 M1590,496 C1598,486 1604,480 1614,478" fill="none" strokeWidth={2.4} />
			</g>
			<g fill="#1C1916" color="#1C1916"><Perch x={1378} y={567} s={2.2} peck={0.5 + 0.5 * Math.sin(t * 2.2)} /><Perch x={1548} y={528} s={2.1} d={-1} /><Perch x={1488} y={463} s={2} peck={sst(49.6, 49.9, t) - sst(50.3, 50.6, t)} /><Perch x={1600} y={498} s={1.9} d={-1} /></g>
		</g>
		{/* the well in the near field: its stone curb cracked, the frame fallen across it */}
		<g transform={C(0.72)}>
			<g transform="translate(1180,860)">
				<ellipse cx={4} cy={4} rx={86} ry={9} fill="#2A2721" opacity={0.4} />
				<path d="M-58,0 L-58,-30 C-40,-38 40,-38 58,-30 L58,0 C40,6 -40,6 -58,0 Z" fill="#6A655A" />
				<path d="M20,-36 L58,-30 L58,0 C48,3 34,4 22,5 Z" fill={LIT} />
				<ellipse cx={0} cy={-31} rx={58} ry={9} fill="#7A7468" /><ellipse cx={0} cy={-31} rx={46} ry={6.4} fill="#1A1714" />
				<path d="M-24,-40 L-4,-40 L-8,-26 L-20,-28 Z" fill="#7A7468" /><path d="M-26,-38 L-6,-38 L-10,-30 L-22,-31 Z" fill="#1A1714" />
				{Array.from({length: 6}, (_, i) => <path key={i} d={`M${-50 + i * 20},-28 L${-52 + i * 20},0`} stroke="#4A463E" strokeWidth={1.4} opacity={0.6} />)}
				<path d="M-48,-30 L-44,-112 L-36,-112 L-40,-28 Z" fill="#3A352E" /><path d="M-48,-112 L-30,-112 L-34,-104 L-46,-104 Z" fill="#3A352E" />
				<path d="M-38,-104 L136,6 L130,12 L-42,-98 Z" fill="#3A352E" /><path d="M70,-6 L118,-14 L126,8 L110,10 Z" fill="#3A352E" />
				<path d="M96,4 C104,-6 120,-6 126,2 L124,8 L98,8 Z" fill="#4A453C" /><ellipse cx={111} cy={8} rx={15} ry={3} fill="#2A2721" opacity={0.5} />
			</g>
		</g>
		{/* crows wheeling slowly over the village */}
		<g transform={C(0.5)} fill="#1C1916">{CROWS.map((c) => <Crow key={c.i} x={c.x0 - c.v * u - (c.i % 2) * 8 * u} y={c.y0 + 10 * Math.sin(t * 0.7 + c.i)} s={c.s} ph={t * c.f + c.i * 1.9} dir={-1} />)}</g>
		<rect y={700} width={W} height={60} fill="url(#hlHaze)" opacity={0.6} />
		{/* P4 the rise and 曹操 alone on it, small, looking over the village */}
		<g transform={C(0.9)}>
			<path d="M-200,836 C100,826 360,818 560,826 C720,832 860,852 980,890 C1080,922 1160,980 1240,1080 L-200,1080 Z" fill="url(#hlRise)" />
			<path d="M-200,836 C100,826 360,818 560,826 C720,832 860,852 980,890 C1080,922 1160,980 1240,1080" fill="none" stroke="#B8AE96" strokeOpacity={0.28} strokeWidth={2} />
			{Array.from({length: 24}, (_, i) => { const x = -100 + i * 50 + rnd(i, 71) * 30, y = 834 + rnd(i, 72) * 8 + (x > 600 ? (x - 600) * 0.12 : 0); return <path key={i} d={`M${f1(x)},${f1(y)} l${f1(-3 + rnd(i, 73) * 6)},${f1(-8 - rnd(i, 74) * 10)} M${f1(x + 4)},${f1(y)} l${f1(2 + rnd(i, 75) * 5)},${f1(-6 - rnd(i, 76) * 7)}`} stroke="#25221D" strokeWidth={1.6} />; })}
			<ellipse cx={CX + 14} cy={CY + 2} rx={44} ry={4} fill="#14120F" opacity={0.6} />
			<g filter="url(#hlHero)"><g transform={`translate(${CX},${f1(CY - 750 * S)}) scale(${S})`}>
				<g clipPath="url(#hlBody)"><Cao pal={NPAL} id="hlc" old={false} armour arm={{sh: [10, 84], el: [22, 200], hd: [54, 266]}} cape={cape} /></g>
				<g transform={`translate(0,49) rotate(${f1(7 + 2 * sst(49.0, 50.5, t))} 0 -8) scale(0.88) translate(0,-40)`}><Head old={false} mid pal={NPAL} id="hlh" cap="wu" /></g>
			</g></g>
		</g>
		<g transform={C(1.3)} filter="url(#hlb5)" fill="#100E0C">
			<path d="M1500,1080 C1620,1040 1800,1030 2100,1046 L2100,1080 Z" />
			{Array.from({length: 12}, (_, i) => { const x = 1560 + i * 34, sw = 4 * Math.sin(t * 0.9 + i); return <path key={i} d={`M${x},1080 Q${f1(x + 4 + sw)},1030 ${f1(x + 10 + sw * 2)},${f1(990 - rnd(i, 81) * 40)} L${f1(x + 13 + sw * 2)},${f1(994 - rnd(i, 81) * 40)} Q${f1(x + 8 + sw)},1030 ${x + 7},1080 Z`} />; })}
		</g>
		<rect width={W} height={H} fill="#D8D2C4" opacity={0.05} />
		<rect width={W} height={H} fill="url(#hlVig)" />
	</Svg>; };
export const Haoli: React.FC<{t: number}> = ({t}) => <Haoli_ t={t} />;
void B26; void SIL;
