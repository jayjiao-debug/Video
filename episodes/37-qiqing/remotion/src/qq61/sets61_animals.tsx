import React from 'react';
import {PAL, sp, poly, lerp, cl, sm} from '../qq60/geo60';
import {Croc} from '../qq60/act60b_kit';
import {Ox} from '../qq60/props60b';
import {SetP, at, ck, Ck, S61, Sd, Ln, Rod, rect, sps, phaseOf, wave, blip, rng} from './sets61_kit';
import {Ripples} from './sets61_nature';

/* ep61 · SET-DRESSING library — ANIMALS (small, secondary, always alive). Profile, facing +x (flip = -1 mirrors); origin = where the
   feet / belly meet the ground or the waterline; units = figure grid units (a cat sits ~3.4 tall next to Ani's 20). */
const F = (x: number, y: number, s: number, flip: number) => at(x, y, s, flip);
const eye = (x: number, y: number, r: number, c: Ck, iris = '#F2C649', shut = 0) => <g>
	<ellipse cx={x} cy={y} rx={r} ry={r * (1 - 0.9 * shut)} fill={iris} stroke={PAL.ink} strokeWidth={c.LW} />
	{shut < 0.6 && <circle cx={x + r * 0.15} cy={y} r={r * 0.45} fill={PAL.ink} />}</g>;

/* ---------------- falcon ---------------- */
/** Horus's falcon. mode 'perch': standing on a block perch, the head turns in jerks, the tail bobs, wings fold; mode 'fly': wings
    beating (wingtip feathers spread), body level. Origin = feet (perch: foot of the perch block). */
export const Falcon: React.FC<SetP & {mode?: 'perch' | 'fly'; flip?: 1 | -1; seed?: number; perch?: boolean}> = ({x, y, s, t = 0, mode = 'perch', flip = 1, seed = 0, perch = true}) => {
	const c = ck(s), ph = phaseOf(seed, 11);
	if (mode === 'fly') {
		const f = Math.sin(t * 6 + ph), u = 0.5 + 0.5 * f;
		/* the wing as a long feathered blade from the shoulder: tip swings from just under the body (down-stroke) to high above (up-stroke) */
		const wing = (back: boolean) => { const k = back ? 0.86 : 1, ty = lerp(0.9, -3.9, u) * k, tx = lerp(-1.6, -0.9, u) - (back ? 0.5 : 0), mx_ = lerp(-0.2, 0.1, u), my = ty * 0.5 - 0.3;
			const fing = [0, 1, 2].map((j) => [tx - 0.35 * j, ty + (ty < 0 ? 0.25 : -0.25) * j] as [number, number]);
			return <g><Sd d={sps([[1.1, -0.35, 1], [mx_ + 0.9, my], [fing[0][0] + 0.4, fing[0][1], 1], fing[0], [fing[1][0], fing[1][1], 1], [fing[2][0], fing[2][1], 1], [mx_ - 1.2, my + 0.5], [-0.9, 0.15, 1]], 0.16)} f={back ? PAL.falcon2 : PAL.falcon} c={c} k={0.8} />
				{!back && [0.3, 0.55].map((v) => <path key={v} d={`M${lerp(0.6, fing[1][0], v)} ${lerp(-0.2, fing[1][1], v)}L${lerp(-0.6, fing[2][0], v)} ${lerp(0.05, fing[2][1], v) + 0.3}`} stroke={PAL.falcon2} strokeWidth={c.LW * 1.4} />)}</g>; };
		return <g transform={F(x, y + 0.3 * s * Math.sin(t * 6 + ph + 1.2), s, flip)}>
			{wing(true)}
			<Sd d={sps([[-2.6, 0.2], [-1.6, -0.15], [0.6, -0.45], [1.8, -0.55], [2.4, -0.3], [2.5, 0.15], [1.6, 0.5], [-1.2, 0.5], [-2.6, 0.7, 1]], 0.2)} f={PAL.falcon} c={c} />
			<path d={poly([[-2.6, 0.2], [-3.6, -0.1], [-3.7, 0.9], [-2.5, 0.7]])} fill={PAL.falcon2} stroke={PAL.ink} strokeWidth={c.LW} />
			<path d="M2.5 -0.1L2.85 0.1L2.45 0.3" fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
			{eye(2.05, -0.15, 0.13, c)}
			{wing(false)}
		</g>;
	}
	const turn = Math.round(Math.sin(t * 0.5 + ph) * 1.5) / 1.5, bob = 0.06 * Math.sin(t * 2.2 + ph);
	return <g transform={F(x, y, s, flip)}>
		{perch && <><Sd d={rect(-1.1, -1.6, 1.1, 0)} f={PAL.gold} c={c} /><Sd d={rect(-1.4, -1.9, 1.4, -1.55)} f={PAL.red} c={c} k={0.8} /></>}
		<g transform={`translate(0,${perch ? -1.9 : 0})`}>
			{/* tail */}
			<path d={poly([[-0.9, -1.6], [-1.6, 0.4 + bob * 3], [-0.9, 0.5 + bob * 3], [-0.3, -1.3]])} fill={PAL.falcon2} stroke={PAL.ink} strokeWidth={c.LW} />
			{/* body + folded wing */}
			<Sd d={sps([[-0.8, 0, 1], [0.7, 0, 1], [1.2, -1.0], [1.3, -2.4], [0.9, -3.4], [-0.2, -3.6], [-1.0, -2.8], [-1.3, -1.4]], 0.2)} f={'#E9E1C8'} c={c} />
			{Array.from({length: 6}, (_, i) => <path key={i} d={`M${0.2 + (i % 2) * 0.35} ${-0.6 - i * 0.4}l0.15 0.12`} stroke={PAL.ink} strokeWidth={c.LW} />)}
			<Sd d={sps([[-1.3, -3.2], [-0.2, -3.5], [0.4, -2.4], [0.0, -0.9], [-1.4, 0.3], [-1.6, -1.6]], 0.2)} f={PAL.falcon} c={c} />
			{[-0.9, -0.5].map((xx) => <path key={xx} d={`M${xx} -2.8L${xx - 0.4} -0.2`} stroke={PAL.falcon2} strokeWidth={c.LW * 1.6} />)}
			{/* legs */}
			{[0.0, 0.35].map((lx) => <path key={lx} d={`M${lx} -0.2L${lx + 0.05} 0.05l0.35 0`} stroke={PAL.gold} strokeWidth={c.LW * 2} />)}
			{/* head (turns in jerks: a narrow squash) */}
			<g transform={`translate(0.4,-3.6) scale(${1 - 0.25 * Math.abs(turn)},1)`}>
				<Sd d={sps([[-0.8, 0.2], [-0.6, -0.7], [0.1, -1.1], [0.8, -0.9], [1.1, -0.45], [0.9, 0.2], [0.2, 0.4]], 0.22)} f={PAL.falcon} c={c} />
				<path d="M0.9 -0.55L1.35 -0.35L1.0 -0.05Z" fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
				<path d="M0.15 -0.4Q0.3 0.2 0.0 0.5" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 2.4} />
				{eye(0.4, -0.5, 0.17, c, '#F2C649', blip(t, 3.7, 0.18, ph))}
			</g>
		</g>
	</g>;
};

/* ---------------- ibis (wading) ---------------- */
/** the sacred ibis wading: white body, black head and neck, the curved beak; it steps slowly and dips the beak into the water now and
    then (every ~5 s). Origin = feet at the waterline/ground. */
export const Ibis: React.FC<SetP & {flip?: 1 | -1; seed?: number; water?: boolean}> = ({x, y, s, t = 0, flip = 1, seed = 0, water = true}) => {
	const c = ck(s), ph = phaseOf(seed, 13), dip = sm(cl(blip(t, 5.2, 1.6, ph) * 1.6)), step = Math.sin(t * 0.9 + ph);
	const neckBase: [number, number] = [1.0, -4.6], head: [number, number] = [lerp(1.8, 3.1, dip), lerp(-6.4, -2.6, dip)];
	return <g>{water && dip > 0.6 && <Ripples x={x + flip * (head[0] + 1.5) * s} y={y} s={s} t={t} n={2} p={1.4} r={1.6} seed={seed} />}<g transform={F(x, y, s, flip)}>
		{[[-0.1, step], [0.5, -step]].map(([lx, k], i) => <g key={i}><path d={`M${lx} -3.4L${lx + 0.3 * k} -1.8L${lx + 0.1 + 0.4 * k} 0`} fill="none" stroke={PAL.ink} strokeWidth={0.2} strokeLinejoin="round" />
			<path d={`M${lx + 0.4 * k - 0.3} 0l0.9 0`} stroke={PAL.ink} strokeWidth={0.12} /></g>)}
		<Sd d={sps([[-1.9, -4.0], [-0.6, -5.0], [1.0, -5.0], [1.6, -4.3], [1.1, -3.3], [-0.4, -3.1], [-2.4, -3.5, 1]], 0.2)} f={PAL.linen} c={c} />
		<path d={poly([[-2.4, -3.5], [-1.0, -4.1], [-0.6, -3.3]])} fill={PAL.ibis} />
		<path d={`M${neckBase[0]} ${neckBase[1]}Q${lerp(1.0, 2.6, dip)} ${lerp(-6.6, -4.4, dip)} ${head[0]} ${head[1]}`} fill="none" stroke={PAL.ink} strokeWidth={0.62} strokeLinecap="round" />
		<path d={`M${neckBase[0]} ${neckBase[1]}Q${lerp(1.0, 2.6, dip)} ${lerp(-6.6, -4.4, dip)} ${head[0]} ${head[1]}`} fill="none" stroke={PAL.ibis} strokeWidth={0.42} strokeLinecap="round" />
		<g transform={`translate(${head[0]},${head[1]}) rotate(${lerp(0, 70, dip)})`}>
			<circle cx={0} cy={0} r={0.42} fill={PAL.ibis} stroke={PAL.ink} strokeWidth={c.LW} />
			<path d="M0.3 -0.1Q1.4 0.0 2.0 1.2" fill="none" stroke={PAL.ink} strokeWidth={0.2} strokeLinecap="round" />
			<circle cx={0.1} cy={-0.12} r={0.08} fill={PAL.gold} />
		</g>
	</g></g>;
};

/* ---------------- cat (sitting) ---------------- */
/** a seated cat (the bronze-cat pose: upright, forelegs together, tail curled round), the tail tip flicks, the ears twitch, it blinks
    slowly. Gold earring optional. Origin = feet. */
export const Cat61: React.FC<SetP & {flip?: 1 | -1; seed?: number; color?: string; earring?: boolean}> = ({x, y, s, t = 0, flip = 1, seed = 0, color = '#A8957A', earring = false}) => {
	const c = ck(s), ph = phaseOf(seed, 17), fl = Math.sin(t * 3.4 + ph) * Math.max(0, Math.sin(t * 0.7 + ph)), ear = blip(t, 4.3, 0.25, ph) * 14, bl = blip(t, 3.1, 0.22, ph * 2);
	return <g transform={F(x, y, s, flip)}>
		{/* tail around the feet, the tip flicking */}
		<path d={`M-1.2 -0.3Q0.2 0.25 1.6 0.0Q2.3 -0.15 ${2.4 + 0.3 * fl} ${-0.6 - 0.25 * fl}`} fill="none" stroke={PAL.ink} strokeWidth={0.5 + 2 * c.OW} strokeLinecap="round" />
		<path d={`M-1.2 -0.3Q0.2 0.25 1.6 0.0Q2.3 -0.15 ${2.4 + 0.3 * fl} ${-0.6 - 0.25 * fl}`} fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
		<Sd d={sps([[-1.4, 0, 1], [1.3, 0, 1], [1.1, -0.6], [1.0, -1.8], [1.1, -2.6], [0.8, -3.0], [-0.2, -3.0], [-1.0, -2.2], [-1.6, -1.0]], 0.2)} f={color} c={c} />
		<path d="M0.85 -0.05L0.9 -2.2" stroke={PAL.ink} strokeWidth={c.LW} /><path d="M0.4 -0.05L0.55 -1.6" stroke={PAL.ink} strokeWidth={c.LW} opacity={0.6} />
		{/* head */}
		<g transform="translate(0.55,-3.1)">
			<g transform={`rotate(${-ear} -0.15 -0.75)`}><Sd d={poly([[-0.55, -0.55], [-0.2, -1.45], [0.1, -0.6]])} f={color} c={c} k={0.8} /></g>
			<Sd d={poly([[0.05, -0.62], [0.45, -1.5], [0.7, -0.5]])} f={color} c={c} k={0.8} />
			<Sd d={sps([[-0.7, 0.15], [-0.75, -0.45], [-0.3, -0.75], [0.4, -0.78], [0.85, -0.5], [1.15, -0.2], [1.05, 0.05], [0.6, 0.3], [-0.1, 0.35]], 0.2)} f={color} c={c} />
			{eye(0.42, -0.35, 0.14, c, '#7CC07A', bl)}
			<path d="M1.08 -0.12L0.95 0.0" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
			{earring && <circle cx={-0.35} cy={-0.55} r={0.12} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 1.8} />}
		</g>
	</g>;
};

/* ---------------- cobra / uraeus ---------------- */
/** a rearing cobra: the coil on the ground, the body rising, the hood that flares open (flare 0..1; auto = breathes open every ~4 s),
    the head sways, the tongue flicks. Origin = centre of the coil on the ground. */
export const Cobra: React.FC<SetP & {flip?: 1 | -1; seed?: number; flare?: number; gold?: boolean}> = ({x, y, s, t = 0, flip = 1, seed = 0, flare, gold = false}) => {
	const c = ck(s), ph = phaseOf(seed, 19), fl = flare ?? sm(cl(0.25 + 1.2 * wave(t, 4, ph))), sw = 0.25 * Math.sin(t * 1.4 + ph), body = gold ? PAL.gold : '#8C6A2E', belly = gold ? PAL.goldHi : '#D9B66A';
	const hx = 0.4 + sw, hy = -4.6, hw = lerp(0.35, 0.95, fl);
	return <g transform={F(x, y, s, flip)}>
		<Sd d={sps([[-1.8, 0, 1], [1.6, 0, 1], [1.9, -0.5], [1.0, -0.95], [-1.2, -0.9], [-2.0, -0.5]], 0.25)} f={body} c={c} />
		<path d="M-1.4 -0.45Q0 -0.75 1.4 -0.45" fill="none" stroke={PAL.ink} strokeWidth={c.LW} opacity={0.5} />
		<path d={`M0.6 -0.8Q0.2 -2.4 ${0.5 + sw * 0.5} -3.4Q${hx} -4.0 ${hx} ${hy}`} fill="none" stroke={PAL.ink} strokeWidth={0.55 + 2 * c.OW} strokeLinecap="round" />
		<path d={`M0.6 -0.8Q0.2 -2.4 ${0.5 + sw * 0.5} -3.4Q${hx} -4.0 ${hx} ${hy}`} fill="none" stroke={body} strokeWidth={0.55} strokeLinecap="round" />
		{/* hood (seen in profile it widens forward and back) */}
		<Sd d={sps([[hx - 0.2, hy + 1.6], [hx - hw * 0.8, hy + 0.6], [hx - hw * 0.6, hy - 0.4], [hx, hy - 0.7], [hx + hw * 0.7, hy - 0.3], [hx + hw * 0.6, hy + 0.7], [hx + 0.25, hy + 1.6]], 0.22)} f={body} c={c} />
		<path d={sps([[hx + 0.05, hy + 1.5], [hx + hw * 0.35, hy + 0.6], [hx + hw * 0.3, hy - 0.2], [hx + 0.1, hy - 0.3], [hx - 0.05, hy + 0.6]], 0.2)} fill={belly} opacity={0.9} />
		{[0.0, 0.4, 0.8].map((u) => <path key={u} d={`M${hx + 0.02} ${hy + 0.1 + u}l${hw * 0.3} -0.05`} stroke={PAL.red} strokeWidth={c.LW * 1.6} />)}
		<Sd d={sps([[hx - 0.25, hy - 0.4], [hx + 0.2, hy - 0.95], [hx + 0.85, hy - 0.85], [hx + 1.0, hy - 0.6], [hx + 0.5, hy - 0.35]], 0.2)} f={body} c={c} k={0.8} />
		<circle cx={hx + 0.35} cy={hy - 0.7} r={0.08} fill={PAL.ink} />
		{blip(t, 1.3, 0.35, ph) > 0.2 && <path d={`M${hx + 1.0} ${hy - 0.6}l0.5 0.02l0.2 -0.15M${hx + 1.5} ${hy - 0.58}l0.2 0.12`} fill="none" stroke={PAL.red} strokeWidth={c.LW * 1.2} />}
	</g>;
};

/* ---------------- scarab pushing its ball ---------------- */
/** a dung beetle (Khepri's scarab) walking backwards on its forelegs, pushing the ball with its hind legs; the ball rolls, six legs
    step in a tripod gait. Origin = ground under the beetle; moves `speed` units/s to +x (0 = in place). */
export const Scarab61: React.FC<SetP & {flip?: 1 | -1; speed?: number; seed?: number; sun?: boolean}> = ({x, y, s, t = 0, flip = 1, speed = 0, seed = 0, sun = false}) => {
	const c = ck(s), ph = phaseOf(seed, 23), g = t * 7 + ph, dx = speed * t, rb = 0.9, roll = (dx / rb) * 57.3 + t * 40;
	const leg = (bx: number, by: number, k: number, len: number, back: boolean) => { const sw = 0.35 * Math.sin(g + k * Math.PI), lift = Math.max(0, Math.sin(g + k * Math.PI)) * 0.25;
		return <path key={`${bx}${k}`} d={`M${bx} ${by}L${bx + (back ? -len * 0.7 : len * 0.5) + sw} ${by + 0.35 - lift}L${bx + (back ? -len : len * 0.8) + sw} ${0 - lift}`} fill="none" stroke={PAL.ink} strokeWidth={0.12} strokeLinejoin="round" />; };
	return <g transform={F(x + dx * s * flip, y, s, flip)}>
		{/* the ball behind (beetle faces +x and pushes the ball backwards with its hind legs) */}
		<g transform={`translate(-2.05,${-rb}) rotate(${-roll})`}><circle r={rb} fill={sun ? PAL.red : S61.mud} stroke={PAL.ink} strokeWidth={c.OW * 1.6} />{sun && <circle r={rb * 0.72} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2} />}
			<path d="M-0.5 -0.3l0.3 0.1M0.2 0.4l0.25 -0.1M0.1 -0.6l0.2 0.2" stroke={S61.mud2} strokeWidth={c.LW * 1.6} /></g>
		{leg(-0.4, -0.7, 0, 1.1, true)}{leg(0.1, -0.6, 1, 0.8, false)}{leg(0.6, -0.65, 0, 0.9, false)}
		<Sd d={sps([[-1.0, -0.55], [-0.6, -1.3], [0.4, -1.45], [0.9, -1.1], [0.9, -0.55], [-0.6, -0.45]], 0.2)} f={S61.faience2} c={c} />
		<path d="M-0.7 -0.95Q0.1 -1.25 0.85 -1.0" fill="none" stroke={PAL.ink} strokeWidth={c.LW} />
		<path d="M-0.5 -1.15L0.6 -1.3" stroke="#9FE0C0" strokeWidth={c.LW * 1.6} opacity={0.6} />
		<Sd d={sps([[0.85, -0.6], [1.0, -1.15], [1.35, -1.1], [1.55, -0.75], [1.35, -0.55]], 0.2)} f={S61.faience2} c={c} k={0.8} />
		{[1.4, 1.6].map((xx, i) => <path key={i} d={`M${xx} -0.75l0.25 ${-0.18 + i * 0.18}`} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />)}
		{leg(-0.5, -0.65, 1, 1.25, true)}{leg(0.3, -0.6, 0, 0.85, false)}{leg(0.75, -0.65, 1, 0.95, false)}
	</g>;
};

/* ---------------- crocodile in the water ---------------- */
/** a crocodile gliding with only its back, eyes and snout above the waterline (wraps the ep60 Croc, clipped at the water), drifting
    `speed` units/s, ripples trailing. Origin = waterline under the croc's middle. */
export const CrocWater: React.FC<SetP & {flip?: 1 | -1; speed?: number; seed?: number; sink?: number}> = ({x, y, s, t = 0, flip = 1, speed = 0.4, seed = 0, sink = 1.3}) => {
	const ph = phaseOf(seed, 29), dx = speed * Math.sin(t * 0.25 + ph) * 4, bob = 0.08 * Math.sin(t * 1.3 + ph), id = `cw-${seed}-${Math.round(x)}`;
	const px = x + dx * s * flip;
	return <g>
		<defs><clipPath id={id}><rect x={px - 14 * s} y={y - 6 * s} width={28 * s} height={6 * s} /></clipPath></defs>
		<g clipPath={`url(#${id})`}><Croc x={px} y={y + (sink + bob) * s} s={s} face={flip} t={t} /></g>
		<path d={`M${px - 9 * s} ${y + 0.05 * s}L${px + 9 * s} ${y + 0.05 * s}`} stroke={S61.waterHi} strokeWidth={Math.max(1.2, 0.12 * s)} opacity={0.6} />
		<Ripples x={px + flip * 6.5 * s} y={y} s={s} t={t} n={2} p={2.2} r={1.8} seed={seed} />
		<Ripples x={px - flip * 6 * s} y={y} s={s} t={t + 1} n={2} p={2.6} r={2.4} seed={seed + 1} />
	</g>;
};

/* ---------------- geese flying in a line ---------------- */
/** a skein of geese (the Meidum geese's colours: grey-brown backs, white-barred necks, red-orange bills) flying +x in a line or a V,
    each beating out of step. Origin = the lead goose. */
export const Geese: React.FC<SetP & {n?: number; v?: boolean; gap?: number; flip?: 1 | -1; seed?: number; travel?: number}> = ({x, y, s, t = 0, n = 5, v = false, gap = 3.6, flip = 1, seed = 0, travel = 0}) => {
	const c = ck(s);
	const goose = (i: number) => { const ph = phaseOf(i + seed * 13, 31), f = Math.sin(t * 5.2 + ph), gx = -i * gap, gy = v ? (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.9 + Math.ceil(i / 2) * 0.9 : i * 0.25 + 0.3 * Math.sin(t * 0.8 + i);
		const wing = (k: number, f2: string) => { const ty = lerp(0.7, -2.6, 0.5 + 0.5 * f) * k; return <Sd d={sps([[0.6, -0.25, 1], [0.2, ty * 0.6 - 0.2], [-1.0, ty, 1], [-0.8, ty * 0.45], [-0.6, 0.0, 1]], 0.2)} f={f2} c={c} k={0.7} />; };
		return <g key={i} transform={`translate(${gx + travel * t},${gy})`}>
			{wing(0.8, '#6E6258')}
			<Sd d={sps([[-1.8, 0.1], [-0.6, -0.4], [0.9, -0.35], [1.5, -0.6, 1], [2.6, -0.75], [2.7, -0.55], [1.6, -0.2], [0.8, 0.35], [-1.0, 0.45]], 0.2)} f="#8A7A6A" c={c} k={0.8} />
			<path d="M1.6 -0.55L1.4 -0.2M1.9 -0.62L1.75 -0.3" stroke={PAL.linen} strokeWidth={c.LW * 1.4} />
			<path d="M2.6 -0.75L3.0 -0.65L2.65 -0.52Z" fill="#E0642A" stroke={PAL.ink} strokeWidth={c.LW * 0.7} />
			<circle cx={2.35} cy={-0.68} r={0.06} fill={PAL.ink} />
			{wing(1, '#9A8B78')}
		</g>; };
	return <g transform={F(x, y, s, flip)}>{Array.from({length: n}, (_, i) => goose(n - 1 - i))}</g>;
};

/* ---------------- cow ---------------- */
/** an Egyptian cow (lyre horns, white hide with black patches) grazing: shuffling forward, head nodding (wraps the ep60 Ox). Origin = ground under the chest */
export const Cow: React.FC<SetP & {flip?: 1 | -1; seed?: number; hide?: 'spot' | 'red'}> = ({x, y, s, t = 0, flip = 1, seed = 0, hide = 'spot'}) => {
	const ph = phaseOf(seed, 37);
	return <Ox x={x} y={y} s={s} ph={0.35 * Math.sin(t * 0.9 + ph)} t={t} hide={hide} flip={flip} />;
};

/* ---------------- jackal lying on a shrine ---------------- */
/** Anubis as a recumbent black jackal on a gilded shrine-chest with carrying poles (the Tutankhamun type): ears twitch, the gold collar
    and ear-lining glint, a breath lifts the ribs. Origin = foot centre of the chest. */
export const JackalShrine: React.FC<SetP & {flip?: 1 | -1; seed?: number; poles?: boolean}> = ({x, y, s, t = 0, flip = 1, seed = 0, poles = true}) => {
	const c = ck(s), ph = phaseOf(seed, 41), br = 0.06 * Math.sin(t * 1.4 + ph), ear = blip(t, 3.6, 0.3, ph) * 10, top = -4.6;
	return <g transform={F(x, y, s, flip)}>
		{/* the shrine-chest */}
		<Sd d={rect(-5.6, -0.6, 5.6, 0)} f={S61.wood2} c={c} />
		<Sd d={rect(-5.2, top, 5.2, -0.6)} f={PAL.gold} c={c} k={1.1} />
		{[-4.2, -1.4, 1.4, 4.2].map((px) => <g key={px}><rect x={px - 1.1} y={top + 0.6} width={2.2} height={2.9} fill="none" stroke={PAL.gold2} strokeWidth={c.LW * 1.6} />
			<path d={`M${px} ${top + 0.9}L${px} ${top + 3.2}M${px - 0.5} ${top + 1.6}Q${px} ${top + 1.1} ${px + 0.5} ${top + 1.6}`} fill="none" stroke={PAL.blue} strokeWidth={c.LW * 1.6} /></g>)}
		<Sd d={rect(-5.4, top - 0.45, 5.4, top)} f={PAL.gold2} c={c} />
		{poles && <Rod a={[-8.6, -1.6]} b={[8.6, -1.6]} w={0.36} f={S61.wood} c={c} />}
		{/* the jackal, recumbent, facing +x */}
		<g transform={`translate(0,${top - 0.45})`}>
			<path d="M-3.6 -0.3Q-5.0 -0.1 -4.6 0.0" fill="none" stroke={PAL.ink} strokeWidth={0.5} strokeLinecap="round" />
			<Sd d={sps([[-4.0, 0, 1], [1.6, 0, 1], [2.0, -1.2], [1.6, -2.2 - br], [-1.0, -2.0 - br], [-3.2, -2.3 - br], [-4.1, -1.4]], 0.2)} f={PAL.jackal} c={c} />
			<Sd d={sps([[-3.8, 0, 1], [-1.6, 0, 1], [-1.6, -0.6], [-2.6, -1.6], [-3.6, -1.2]], 0.25)} f={PAL.jackal2} c={c} k={0.8} />
			<Sd d={sps([[0.8, 0, 1], [3.8, 0, 1], [3.9, -0.35], [3.3, -0.45], [1.6, -0.6]], 0.15)} f={PAL.jackal} c={c} k={0.8} />
			{/* neck + head */}
			<Sd d={sps([[0.6, -1.4], [1.4, -2.6], [1.6, -3.6], [2.4, -4.0], [3.6, -3.7], [4.5, -3.55], [4.5, -3.3], [3.4, -3.0], [2.6, -2.5], [2.1, -1.3]], 0.2)} f={PAL.jackal} c={c} />
			<g transform={`rotate(${-ear} 2.0 -4.0)`}><Sd d={poly([[1.6, -3.9], [1.9, -5.6], [2.6, -3.9]])} f={PAL.jackal} c={c} k={0.8} /><path d={poly([[1.85, -4.0], [1.95, -5.1], [2.3, -4.0]])} fill={PAL.gold} /></g>
			<path d="M2.6 -3.75Q2.9 -3.95 3.2 -3.75Q2.9 -3.6 2.6 -3.75Z" fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
			<path d="M1.35 -2.7Q2.0 -2.1 2.5 -2.55" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 3} />
			<path d="M1.4 -2.45Q1.9 -1.95 2.35 -2.3" fill="none" stroke={PAL.red} strokeWidth={c.LW * 2} />
		</g>
	</g>;
};

/* ---------------- fish ---------------- */
/** a Nile tilapia (inet fish) or a Nile perch, swimming: body wiggle, tail beat. Origin = fish centre; faces +x. */
export const Fish: React.FC<SetP & {kind?: 'tilapia' | 'perch'; flip?: 1 | -1; seed?: number}> = ({x, y, s, t = 0, kind = 'tilapia', flip = 1, seed = 0}) => {
	const c = ck(s), ph = phaseOf(seed, 43), tb = 12 * Math.sin(t * 6 + ph), L = kind === 'perch' ? 1.4 : 1.0;
	const body = kind === 'tilapia' ? sps([[-1.0, 0], [-0.5, -0.65], [0.5, -0.7], [1.2, -0.3], [1.35, 0.0], [1.1, 0.3], [0.3, 0.55], [-0.6, 0.45]], 0.22)
		: sps([[-1.4, 0], [-0.7, -0.45], [0.6, -0.5], [1.6, -0.2], [1.75, 0.05], [1.5, 0.25], [0.4, 0.4], [-0.8, 0.35]], 0.22);
	return <g transform={`${F(x, y, s, flip)} rotate(${2 * Math.sin(t * 3 + ph)})`}>
		<g transform={`rotate(${tb} ${-L} 0)`}><Sd d={poly([[-L + 0.05, 0], [-L - 0.75, -0.55], [-L - 0.6, 0], [-L - 0.75, 0.55]])} f={kind === 'tilapia' ? S61.faience2 : '#8B9AA8'} c={c} k={0.7} /></g>
		<Sd d={body} f={kind === 'tilapia' ? S61.faience : '#B8C2CC'} c={c} k={0.8} />
		<path d={kind === 'tilapia' ? 'M-0.6 -0.6Q0.2 -1.1 0.8 -0.62' : 'M-0.4 -0.45Q0.2 -0.85 0.7 -0.48'} fill={kind === 'tilapia' ? S61.faience2 : '#8B9AA8'} stroke={PAL.ink} strokeWidth={c.LW} />
		{Array.from({length: 4}, (_, i) => <path key={i} d={`M${-0.5 + i * 0.35} -0.35l0 0.6`} stroke={PAL.ink} strokeWidth={c.LW * 0.6} opacity={0.5} />)}
		<circle cx={kind === 'tilapia' ? 0.95 : 1.3} cy={-0.12} r={0.1} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 0.7} />
	</g>;
};
/** a few fish swimming back and forth under the water (px x, y = centre of the school; w = range in units) */
export const FishSchool: React.FC<SetP & {w?: number; n?: number; seed?: number}> = ({x, y, s, t = 0, w = 16, n = 4, seed = 0}) => {
	const R = rng(seed + 50);
	return <g>{Array.from({length: n}, (_, i) => { const ph = R() * 6.28, sp_ = 0.12 + R() * 0.1, u = Math.sin(t * sp_ + ph), dir = Math.cos(t * sp_ + ph) >= 0 ? 1 : -1;
		return <Fish key={i} x={x + u * w * 0.45 * s} y={y + (R() - 0.5) * 2.2 * s} s={s * (0.8 + R() * 0.4)} t={t} flip={dir as 1 | -1} kind={i % 3 === 2 ? 'perch' : 'tilapia'} seed={i + seed} />; })}</g>;
};
export const _aniKeep = {Ln, Rod, sp};
