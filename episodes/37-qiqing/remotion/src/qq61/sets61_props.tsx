import React from 'react';
import {PAL, sp, poly, lerp, cl, sm} from '../qq60/geo60';
import {Embers} from '../qq60/frame60';
import {CanopicJar, JarHead, LionBier, Barque, Skiff} from '../qq60/props60b';
import {SetP, at, ck, Ck, S61, Sd, Ln, Rod, rect, sps, Glyphs, phaseOf, wave, blip, rng, flick} from './sets61_kit';
import {SmokeCurl} from './sets61_nature';
import {WingSmall} from './sets61_arch';

/* ep61 · SET-DRESSING library — PROPS. Origin = foot centre on the floor (held things: noted); units = figure grid units
   (Ani 20.1 tall: an offering table stands ~4, a beer jar ~2.4, a lamp stand ~4.5). */

/* ---------------- a living flame in unit space (lamps, braziers, torches) ---------------- */
/** teardrop flame with a hot core, flickering and leaning; (x, y) = base of the flame, h = height (units); glow = warm halo */
export const FlameU: React.FC<{x: number; y: number; h: number; t: number; seed?: number; c: Ck; glow?: number}> = ({x, y, h, t, seed = 0, c, glow = 1}) => {
	const f = flick(t, seed), hh = h * (1 + 0.14 * f), w = h * 0.34, ln = h * 0.12 * Math.sin(t * 5.3 + seed);
	const outer = sps([[x - w, y, 1], [x - w * 0.9, y - hh * 0.35], [x - w * 0.3 + ln * 0.5, y - hh * 0.75], [x + ln, y - hh, 1], [x + w * 0.45 + ln * 0.4, y - hh * 0.62], [x + w * 0.95, y - hh * 0.3], [x + w, y, 1]], 0.2);
	const inner = sps([[x - w * 0.5, y, 1], [x - w * 0.42, y - hh * 0.3], [x + ln * 0.6, y - hh * 0.62, 1], [x + w * 0.45, y - hh * 0.28], [x + w * 0.5, y, 1]], 0.2);
	return <g>
		{glow > 0 && <ellipse cx={x} cy={y - hh * 0.4} rx={h * 3.2 * glow * (1 + 0.08 * f)} ry={h * 3.2 * glow * (1 + 0.08 * f)} fill="url(#g60-warm)" opacity={0.5 + 0.1 * f} style={{mixBlendMode: 'screen'}} />}
		<path d={outer} fill={S61.flame} stroke={PAL.ink} strokeWidth={c.LW * 1.1} strokeLinejoin="round" />
		<path d={inner} fill={S61.flame2} />
		<ellipse cx={x} cy={y - hh * 0.18} rx={w * 0.22} ry={hh * 0.12} fill={S61.flame3} />
	</g>;
};

/* ---------------- offering table ---------------- */
/** the heaped offering table: a reed-mat (hetep) on a pedestal, piled with conical and round loaves, a trussed goose, a bowl of figs,
    a bunch of grapes, onions, beer jars on ring stands either side, and a lotus bouquet laid over the top (the blooms nod, t). Origin = floor centre; ~9 tall */
export const OfferingPile: React.FC<SetP & {jars?: boolean}> = ({x, y, s, t = 0, jars = true}) => {
	const c = ck(s), top = -3.8;
	const loafC = (lx: number, h: number, w: number, k: string, f = S61.bread) => <Sd key={k} d={sps([[lx - w, top, 1], [lx + w, top, 1], [lx + w * 0.4, top - h * 0.7], [lx, top - h, 1], [lx - w * 0.4, top - h * 0.7]], 0.18)} f={f} c={c} k={0.8} />;
	const loafR = (lx: number, ly: number, r: number, k: string) => <g key={k}><Sd d={sps([[lx - r, ly, 1], [lx + r, ly, 1], [lx + r * 0.8, ly - r * 0.6], [lx, ly - r * 0.8], [lx - r * 0.8, ly - r * 0.6]], 0.22)} f={S61.bread2} c={c} k={0.8} />
		<path d={`M${lx - r * 0.5} ${ly - r * 0.4}Q${lx} ${ly - r * 0.6} ${lx + r * 0.5} ${ly - r * 0.4}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW} opacity={0.5} /></g>;
	const lotus = (lx: number, ly: number, a: number, i: number) => { const sw = a + 5 * Math.sin(t * 1.2 + i * 1.3);
		return <g key={'lo' + i} transform={`translate(${lx},${ly}) rotate(${sw})`}><path d="M0 0Q0.3 1.6 0.1 3.2" fill="none" stroke={PAL.green} strokeWidth={0.16} />
			<Sd d={poly([[-0.65, -0.9], [-0.3, 0.05], [0.3, 0.05], [0.65, -0.9], [0.28, -0.45], [0, -1.15], [-0.28, -0.45]])} f={i % 2 ? S61.lotusB : PAL.blue} c={c} k={0.7} /></g>; };
	return <g transform={at(x, y, s)}>
		{jars && [-4.4, 4.4].map((jx, k) => <g key={jx}><BeerJarU x={jx} y={0} c={c} k={k} stand /></g>)}
		{/* pedestal + the reed mat (the hetep sign) */}
		<Sd d={sps([[-0.6, 0, 1], [0.6, 0, 1], [0.42, top + 0.5], [1.4, top + 0.12, 1], [-1.4, top + 0.12, 1], [-0.42, top + 0.5]], 0.2)} f={PAL.gold} c={c} />
		<Sd d={rect(-3.2, top - 0.3, 3.2, top + 0.15)} f={S61.reed} c={c} />
		{Array.from({length: 12}, (_, i) => <path key={i} d={`M${-3.0 + i * 0.55} ${top - 0.28}l0 0.4`} stroke={PAL.ink} strokeWidth={c.LW * 0.6} opacity={0.6} />)}
		{/* the heap */}
		{loafC(-2.4, 2.4, 0.55, 'a')}{loafC(-1.4, 3.0, 0.6, 'b', S61.bread2)}{loafC(2.5, 2.2, 0.55, 'c')}
		<Sd d={sps([[-0.8, top - 0.3, 1], [1.9, top - 0.3, 1], [1.7, top - 1.3], [0.6, top - 1.5], [-0.6, top - 1.3]], 0.22)} f={'#C08A3E'} c={c} k={0.8} />
		{[[-0.3, -1.6], [0.2, -1.75], [0.7, -1.7], [1.2, -1.6], [0.45, -2.1], [-0.05, -2.05], [0.95, -2.05]].map(([fx, fy], i) => <circle key={i} cx={fx} cy={top + fy} r={0.28} fill="#7A4A6A" stroke={PAL.ink} strokeWidth={c.LW * 0.7} />)}
		{loafR(1.6, top - 2.2, 0.9, 'r1')}{loafR(-0.4, top - 2.4, 1.0, 'r2')}
		{/* the trussed goose on top */}
		<g transform={`translate(0.2,${top - 3.05})`}>
			<Sd d={sps([[-1.8, 0.3], [0.4, 0.4], [1.5, 0.0], [1.6, -0.6], [1.0, -1.1], [-0.8, -1.2], [-1.7, -0.6]], 0.2)} f={'#EDE3CC'} c={c} />
			<path d="M-1.7 -0.4Q-2.6 -0.3 -2.9 0.4L-2.6 0.5" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 2.2} />
			<path d="M0.2 -1.15L0.5 0.35M-0.6 -1.15L-0.4 0.35" stroke={PAL.red} strokeWidth={c.LW * 1.6} />
			<path d="M1.5 -0.2L2.0 0.6M1.2 0.0L1.6 0.8" stroke="#E0642A" strokeWidth={c.LW * 2} />
		</g>
		{/* grapes + onions */}
		{[[-2.9, -2.9], [-2.6, -3.1], [-2.3, -2.9], [-2.75, -2.6], [-2.45, -2.6], [-2.6, -2.3]].map(([gx, gy], i) => <circle key={'g' + i} cx={gx} cy={top + gy - 0.4} r={0.22} fill="#5A3A7A" stroke={PAL.ink} strokeWidth={c.LW * 0.7} />)}
		{[2.6, 3.0].map((ox, i) => <g key={'o' + i}><Sd d={sps([[ox - 0.35, top - 2.3], [ox + 0.35, top - 2.3], [ox + 0.4, top - 2.7], [ox, top - 3.3, 1], [ox - 0.4, top - 2.7]], 0.25)} f={PAL.linen} c={c} k={0.6} />
			<path d={`M${ox} ${top - 3.3}l${0.15 - i * 0.3} -0.9`} stroke={PAL.green} strokeWidth={0.12} /></g>)}
		{/* the lotus bouquet laid across */}
		{lotus(-1.6, top - 4.4, -38, 0)}{lotus(0.4, top - 4.9, 8, 1)}{lotus(2.0, top - 4.1, 40, 2)}
	</g>;
};

/* ---------------- beer jars ---------------- */
/** one beer jar (unit space helper): ovoid, mud stopper, rope band; stand = ring stand under it */
export const BeerJarU: React.FC<{x: number; y: number; c: Ck; k?: number; stand?: boolean; h?: number}> = ({x, y, c, k = 0, stand = false, h = 3.1}) => {
	const b = stand ? 0.7 : 0, hh = h, w = h * 0.36;
	return <g transform={`translate(${x},${y})`}>
		{stand && <Sd d={sps([[-0.75, 0, 1], [0.75, 0, 1], [0.55, -0.35], [0.75, -b, 1], [-0.75, -b, 1], [-0.55, -0.35]], 0.2)} f={S61.wood} c={c} k={0.8} />}
		<Sd d={sps([[-0.3, -b, 1], [0.3, -b, 1], [w, -b - hh * 0.35], [w * 0.92, -b - hh * 0.7], [w * 0.45, -b - hh * 0.86], [w * 0.5, -b - hh * 0.92, 1], [-w * 0.5, -b - hh * 0.92, 1], [-w * 0.45, -b - hh * 0.86], [-w * 0.92, -b - hh * 0.7], [-w, -b - hh * 0.35]], 0.2)} f={k % 2 ? PAL.red : '#C9874A'} c={c} />
		<path d={`M${-w * 0.9} ${-b - hh * 0.62}Q0 ${-b - hh * 0.55} ${w * 0.9} ${-b - hh * 0.62}`} fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} />
		<Sd d={sps([[-w * 0.55, -b - hh * 0.9, 1], [w * 0.55, -b - hh * 0.9, 1], [w * 0.45, -b - hh * 1.02], [0, -b - hh * 1.1], [-w * 0.45, -b - hh * 1.02]], 0.25)} f={S61.mud} c={c} k={0.8} />
	</g>;
};
/** a group of beer jars with mud stoppers: one on a ring stand, two on the floor, one tipped in a pot-stand. Origin = floor centre */
export const BeerJars: React.FC<SetP> = ({x, y, s}) => {
	const c = ck(s);
	return <g transform={at(x, y, s)}>
		<BeerJarU x={-1.6} y={0} c={c} k={1} h={2.8} />
		<BeerJarU x={1.6} y={0} c={c} k={0} h={2.6} />
		<BeerJarU x={0} y={0.05} c={c} k={2} stand />
	</g>;
};

/* ---------------- incense ---------------- */
/** a standing incense burner: a tall papyrus-stem stand with a bowl of glowing resin, the smoke rising and curling (t). Origin = floor; ~4.6 tall + smoke */
export const IncenseStand: React.FC<SetP & {seed?: number; smoke?: number; smokeColor?: string}> = ({x, y, s, t = 0, seed = 1, smoke = 8, smokeColor}) => {
	const c = ck(s), g = 0.5 + 0.3 * flick(t, seed);
	return <g>
		<SmokeCurl x={x} y={y - 4.6 * s} s={s} t={t} h={smoke} seed={seed} color={smokeColor} />
		<g transform={at(x, y, s)}>
			<Sd d={sps([[-0.9, 0, 1], [0.9, 0, 1], [0.3, -0.5], [0.22, -3.6], [0.7, -4.1, 1], [-0.7, -4.1, 1], [-0.22, -3.6], [-0.3, -0.5]], 0.2)} f={PAL.gold} c={c} />
			{[-1.0, -2.0, -3.0].map((yy) => <rect key={yy} x={-0.3} y={yy} width={0.6} height={0.22} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />)}
			<Sd d={sps([[-1.0, -4.1, 1], [1.0, -4.1, 1], [0.9, -4.5], [0.0, -4.65], [-0.9, -4.5]], 0.25)} f={PAL.gold2} c={c} k={0.8} />
			{[-0.4, 0, 0.4].map((px, i) => <circle key={i} cx={px} cy={-4.55} r={0.2} fill="#FF8A2A" opacity={g + 0.2 * Math.sin(t * 3 + i)} />)}
			<ellipse cx={0} cy={-4.6} rx={1.6} ry={1.2} fill="url(#g60-ember)" opacity={g * 0.6} style={{mixBlendMode: 'screen'}} />
		</g>
	</g>;
};
/** the arm-shaped censer priests hold out before a god: a falcon-headed handle, the pellet box, a hand holding the cup of burning
    incense. Origin = the grip (middle of the arm); faces +x, length ~6; smoke rises from the cup. */
export const Censer: React.FC<SetP & {seed?: number; smoke?: boolean; a?: number; smokeColor?: string}> = ({x, y, s, t = 0, seed = 2, smoke = true, a = 0, smokeColor}) => {
	const c = ck(s), cup: [number, number] = [3.0, -0.55];
	const ca = Math.cos(a * Math.PI / 180), sa = Math.sin(a * Math.PI / 180), cw: [number, number] = [x + (cup[0] * ca - cup[1] * sa) * s, y + (cup[0] * sa + cup[1] * ca) * s];
	return <g>
		<g transform={`${at(x, y, s)} rotate(${a})`}>
			<Rod a={[-3.0, 0]} b={[2.4, 0]} w={0.26} f={PAL.gold} c={c} />
			<Sd d={sps([[-3.6, 0.15], [-3.4, -0.35], [-2.9, -0.4], [-2.7, -0.1], [-2.95, 0.2]], 0.25)} f={PAL.gold} c={c} k={0.8} />
			<path d="M-3.6 -0.05L-3.85 0.05L-3.6 0.12" fill={PAL.gold2} stroke={PAL.ink} strokeWidth={c.LW} />
			<Sd d={sps([[-0.7, -0.15, 1], [0.1, -0.15, 1], [0.1, -0.85, 1], [-0.7, -0.85, 1]], 0.2)} f={PAL.gold2} c={c} k={0.8} />
			<Sd d={sps([[2.3, 0.15], [2.6, -0.2], [3.0, -0.35], [3.4, -0.3], [3.1, 0.0], [2.6, 0.2]], 0.25)} f={PAL.gold} c={c} k={0.8} />
			<Sd d={sps([[2.55, -0.35, 1], [3.45, -0.35, 1], [3.3, -0.7], [2.7, -0.7]], 0.2)} f={PAL.gold2} c={c} k={0.8} />
			<circle cx={3.0} cy={-0.72} r={0.16} fill="#FF8A2A" opacity={0.7 + 0.3 * flick(t, seed)} />
		</g>
		{smoke && <SmokeCurl x={cw[0]} y={cw[1] - 0.2 * s} s={s} t={t} h={6} seed={seed + 10} o={0.6} color={smokeColor} />}
	</g>;
};

/* ---------------- lamps & braziers ---------------- */
/** an oil lamp: a pottery saucer with its wick flame on a tall slender stand (or on the floor: stand = false). Origin = floor */
export const OilLamp: React.FC<SetP & {seed?: number; stand?: boolean}> = ({x, y, s, t = 0, seed = 0, stand = true}) => {
	const c = ck(s), h = stand ? 4.2 : 0;
	return <g transform={at(x, y, s)}>
		{stand && <><Sd d={sps([[-0.9, 0, 1], [0.9, 0, 1], [0.25, -0.5], [0.18, -h + 0.4], [0.5, -h, 1], [-0.5, -h, 1], [-0.18, -h + 0.4], [-0.25, -0.5]], 0.2)} f={S61.wood} c={c} />
			{[-1.4, -2.6].map((yy) => <rect key={yy} x={-0.24} y={yy} width={0.48} height={0.2} fill={PAL.red} />)}</>}
		<Sd d={sps([[-0.9, -h - 0.45, 1], [0.95, -h - 0.45, 1], [1.3, -h - 0.75, 1], [0.6, -h], [-0.6, -h]], 0.2)} f={'#C9874A'} c={c} />
		<FlameU x={1.05} y={-h - 0.7} h={0.95} t={t} seed={seed} c={c} />
	</g>;
};
/** a brazier: a bronze bowl on a tall three-legged stand, flames dancing and sparks flying up (t). Origin = floor; ~5 tall + flames */
export const Brazier61: React.FC<SetP & {seed?: number; sparks?: boolean}> = ({x, y, s, t = 0, seed = 0, sparks = true}) => {
	const c = ck(s);
	return <g>
		<g transform={at(x, y, s)}>
			{/* pottery fire-stand: a flared foot, a tall waisted stand, the bowl (Met 36.3.165 type) */}
			<Sd d={sps([[-1.5, 0, 1], [1.5, 0, 1], [0.75, -0.9], [0.55, -2.6], [0.95, -4.1, 1], [-0.95, -4.1, 1], [-0.55, -2.6], [-0.75, -0.9]], 0.2)} f={'#C9874A'} c={c} />
			{[-1.2, -2.0, -2.8].map((yy, i) => <path key={yy} d={`M${-0.62 - (i === 0 ? 0.15 : 0)} ${yy}L${0.62 + (i === 0 ? 0.15 : 0)} ${yy}`} stroke={i === 1 ? PAL.blue : PAL.red} strokeWidth={c.LW * 2} />)}
			<Sd d={sps([[-2.3, -5.4, 1], [2.3, -5.4, 1], [1.7, -4.4], [0, -4.0], [-1.7, -4.4]], 0.2)} f={'#B8653A'} c={c} />
			<path d="M-2.2 -5.25L2.2 -5.25" stroke="#E8A060" strokeWidth={c.LW * 2} />
			{[-1.3, -0.45, 0.45, 1.3].map((fx, i) => <FlameU key={i} x={fx} y={-5.35} h={1.4 + 0.5 * Math.sin(t * 2.3 + i * 1.9 + seed)} t={t} seed={seed + i} c={c} glow={i === 1 ? 1 : 0} />)}
		</g>
		{sparks && <Embers t={t} x={x} y={y - 6.5 * s} n={10} seed={seed + 3} h={s * 9} spread={s * 2.4} s={s / 26} />}
	</g>;
};

/* ---------------- canopic jars ---------------- */
/** the four canopic jars with the heads of the sons of Horus (Imsety human, Hapy baboon, Duamutef jackal, Qebehsenuef falcon) — wraps the
    ep60 CanopicJar. Origin = floor centre of the row */
export const CanopicSet: React.FC<SetP & {gap?: number; glow?: number}> = ({x, y, s, t = 0, gap = 3.0, glow = 0}) => <g>
	{(['human', 'baboon', 'jackal', 'falcon'] as JarHead[]).map((h, i) => <CanopicJar key={h} x={x + (i - 1.5) * gap * s} y={y} s={s} head={h} t={t} glow={glow} />)}
</g>;

/* ---------------- papyrus scrolls ---------------- */
/** a papyrus roll part-open: the roll on the right, the open sheet with columns of cursive text and a small vignette, the free edge
    curling in the draught (t). Origin = bottom-left of the open sheet; w × h units */
export const ScrollOpen: React.FC<SetP & {w?: number; h?: number; seed?: number}> = ({x, y, s, t = 0, w = 8, h = 3.6, seed = 3}) => {
	const c = ck(s), curl = 0.18 * Math.sin(t * 1.6 + seed);
	return <g transform={at(x, y, s)}>
		<Sd d={sps([[0, 0, 1], [w, 0, 1], [w, -h, 1], [0.2, -h], [-0.2 + curl, -h * 0.5], [0, 0, 1]], 0.2)} f={PAL.linen} c={c} />
		<Glyphs x={0.6} y={-h + 0.4} cols={Math.floor((w - 3.6) / 0.62)} rows={Math.floor((h - 0.8) / 0.5)} cell={0.42} seed={seed} color={PAL.ink} o={0.75} rule={false} />
		<rect x={w - 2.9} y={-h + 0.4} width={2.0} height={h - 0.8} fill="none" stroke={PAL.red} strokeWidth={c.LW} />
		<g transform={`translate(${w - 1.9},${-0.6}) scale(0.38)`}>
			<Sd d={sps([[-0.8, 0, 1], [0.8, 0, 1], [0.6, -3.0], [0.9, -4.6], [0.2, -5.6], [-0.6, -5.0], [-0.7, -3.0]], 0.2)} f={PAL.skinM} c={c} k={0.6} />
			<Sd d={sps([[-0.7, -4.6], [0.2, -5.7], [0.6, -5.1], [0.0, -4.4]], 0.2)} f={PAL.wig} c={c} k={0.6} />
		</g>
		<path d={`M0.4 ${-h + 0.15}L${w - 0.3} ${-h + 0.15}M0.4 -0.15L${w - 0.3} -0.15`} stroke={PAL.red} strokeWidth={c.LW * 1.2} />
		<Sd d={sps([[w - 0.2, 0.1, 1], [w + 0.9, 0.1, 1], [w + 1.05, -h * 0.5], [w + 0.9, -h - 0.1, 1], [w - 0.2, -h - 0.1, 1]], 0.2)} f={'#E6D3A6'} c={c} />
		<ellipse cx={w + 0.35} cy={-h - 0.1} rx={0.55} ry={0.22} fill={'#D2BA88'} stroke={PAL.ink} strokeWidth={c.LW} />
		<path d={`M${w + 0.35} ${-h - 0.1}m-0.25 0a0.25 0.1 0 1 0 0.5 0`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 0.8} />
	</g>;
};
/** a rolled papyrus tied with a red cord, lying on the floor (or with a seal). Origin = floor centre; len units */
export const ScrollRolled: React.FC<SetP & {len?: number; tie?: string}> = ({x, y, s, len = 4, tie = PAL.red}) => {
	const c = ck(s), r = 0.45;
	return <g transform={at(x, y, s)}>
		<Sd d={sps([[-len / 2, 0, 1], [len / 2, 0, 1], [len / 2 + 0.1, -r * 2, 1], [-len / 2 - 0.1, -r * 2, 1]], 0.2)} f={'#E6D3A6'} c={c} />
		<ellipse cx={len / 2} cy={-r} rx={0.18} ry={r} fill={'#D2BA88'} stroke={PAL.ink} strokeWidth={c.LW} />
		{[-0.6, 0.6].map((u) => <path key={u} d={`M${u * len / 4} 0L${u * len / 4} ${-r * 2}`} stroke={tie} strokeWidth={0.16} />)}
		<circle cx={0} cy={-r} r={0.28} fill={S61.mud} stroke={PAL.ink} strokeWidth={c.LW} />
	</g>;
};

/* ---------------- scribe's palette ---------------- */
/** a scribe's kit: the long palette with a red and a black ink cake and the slot of reed pens, the water pot and the pen case.
    Origin = floor centre (the palette lies on the floor/table; seen from the side, tilted up to show its face). */
export const ScribeKit: React.FC<SetP> = ({x, y, s, t = 0}) => {
	const c = ck(s);
	return <g transform={at(x, y, s)}>
		<g transform="translate(-0.8,-0.3) rotate(-14)">
			<Sd d={rect(-2.4, -0.7, 2.4, 0)} f={'#EBDDB8'} c={c} />
			<circle cx={-1.9} cy={-0.35} r={0.22} fill={PAL.black} stroke={PAL.ink} strokeWidth={c.LW} />
			<circle cx={-1.35} cy={-0.35} r={0.22} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW} />
			<rect x={-0.9} y={-0.48} width={3.0} height={0.26} fill={'#C8B080'} stroke={PAL.ink} strokeWidth={c.LW * 0.7} />
			{[0, 1, 2].map((i) => <path key={i} d={`M${-0.8 + i * 0.1} ${-0.36 - i * 0.03}L${2.0} ${-0.4 - i * 0.02}`} stroke={'#8A5626'} strokeWidth={0.06} />)}
			<Glyphs x={-0.6} y={-0.2} cols={4} rows={1} cell={0.18} seed={2} color={PAL.ink} rule={false} o={0.6} />
		</g>
		<Sd d={sps([[1.9, 0, 1], [3.1, 0, 1], [3.25, -0.6], [3.0, -1.2], [3.1, -1.35, 1], [1.9, -1.35, 1], [2.0, -1.2], [1.75, -0.6]], 0.2)} f={'#C9874A'} c={c} />
		<ellipse cx={2.5} cy={-1.35} rx={0.55} ry={0.12} fill={S61.water} opacity={0.6 + 0.2 * wave(t, 3)} />
		<g transform="translate(-3.4,0) rotate(-70)"><Sd d={rect(0, -0.18, 3.0, 0.18)} f={S61.wood} c={c} k={0.8} /><path d="M2.6 -0.18L2.6 0.18" stroke={PAL.red} strokeWidth={0.12} /></g>
	</g>;
};

/* ---------------- senet ---------------- */
/** a senet game: the board's top (3 × 10 squares, the marked squares near the end) above the box with its drawer, on lion-legged feet;
    cone and spool pieces, the throw sticks beside it; every few seconds one piece hops ahead (t). Origin = floor centre; ~10 wide */
export const Senet: React.FC<SetP & {seed?: number}> = ({x, y, s, t = 0, seed = 0}) => {
	const c = ck(s), W = 9, sq = W / 10, top = -1.6, bh = 0.9 * 3 * 0.42;
	const per = 3.2, k = Math.floor((t + seed) / per), u = ((t + seed) % per) / per, hop = sm(cl((u - 0.55) / 0.3));
	const pieces = [[0, 0, 'cone'], [2, 0, 'spool'], [4, 1, 'cone'], [5, 2, 'spool'], [7, 1, 'cone'], [8, 0, 'spool']] as [number, number, 'cone' | 'spool'][];
	const mover = k % pieces.length;
	return <g transform={at(x, y, s)}>
		{/* box */}
		<Sd d={rect(-W / 2, top, W / 2, -0.5)} f={S61.wood} c={c} k={1.1} />
		<rect x={-1.0} y={top + 0.25} width={2.0} height={0.6} fill={S61.wood2} stroke={PAL.ink} strokeWidth={c.LW} />
		<circle cx={0} cy={top + 0.55} r={0.1} fill={PAL.gold} />
		{[-W / 2 + 0.3, W / 2 - 0.6].map((lx) => <Sd key={lx} d={sps([[lx, -0.5, 1], [lx + 0.3, -0.5, 1], [lx + 0.35, -0.15], [lx + 0.55, 0, 1], [lx - 0.05, 0, 1], [lx, -0.2]], 0.2)} f={S61.wood2} c={c} k={0.7} />)}
		{/* board top (seen from above) */}
		<Sd d={rect(-W / 2, top - bh, W / 2, top)} f={'#EBDDB8'} c={c} />
		{Array.from({length: 30}, (_, i) => { const cx_ = i % 10, cy = Math.floor(i / 10), marked = cy === 1 && cx_ >= 5 ? false : (cy === 2 && cx_ >= 5);
			return <rect key={i} x={-W / 2 + cx_ * sq} y={top - bh + cy * (bh / 3)} width={sq} height={bh / 3} fill={marked ? '#F3E3B8' : 'none'} stroke={PAL.ink} strokeWidth={c.LW * 0.7} />; })}
		{[5, 6, 7, 8, 9].map((cx_, i) => <path key={i} d={`M${-W / 2 + (cx_ + 0.3) * sq} ${top - bh / 6 - 0.1}l${sq * 0.4} 0`} stroke={[PAL.red, PAL.blue, PAL.ink, PAL.blue, PAL.red][i]} strokeWidth={c.LW * 1.6} />)}
		{pieces.map(([px, py, kind], i) => { const mv = i === mover, ox = mv ? hop * 1 : 0, oy = mv ? -Math.sin(Math.PI * hop) * 0.9 : 0, cx_ = -W / 2 + (px + 0.5 + ox) * sq, cy = top - bh + (py + 0.75) * (bh / 3) + oy;
			return kind === 'cone' ? <Sd key={i} d={sps([[cx_ - 0.28, cy, 1], [cx_ + 0.28, cy, 1], [cx_, cy - 0.75, 1]], 0.2)} f={PAL.blue} c={c} k={0.7} />
				: <Sd key={i} d={sps([[cx_ - 0.22, cy, 1], [cx_ + 0.22, cy, 1], [cx_ + 0.12, cy - 0.3], [cx_ + 0.25, cy - 0.6, 1], [cx_ - 0.25, cy - 0.6, 1], [cx_ - 0.12, cy - 0.3]], 0.2)} f={PAL.white} c={c} k={0.7} />; })}
		{/* throw sticks */}
		{[0, 1, 2, 3].map((i) => <g key={'ts' + i} transform={`translate(${W / 2 + 0.6 + i * 0.12},${-0.06 - i * 0.12}) rotate(${-8 + i * 5})`}><Sd d={rect(0, -0.12, 2.0, 0.08)} f={i % 2 ? PAL.linen : S61.wood} c={c} k={0.5} /></g>)}
	</g>;
};

/* ---------------- sistrum ---------------- */
/** Hathor's naos-sistrum: the handle with the cow-eared Hathor face, the little shrine on top with the rods and their metal discs
    that jingle when shaken (shake 0..1; auto = shaken in bursts). Origin = the bottom of the handle; ~6 tall standing. */
export const Sistrum61: React.FC<SetP & {shake?: number; seed?: number}> = ({x, y, s, t = 0, shake, seed = 0}) => {
	const c = ck(s), sh = shake ?? Math.max(0, Math.sin(t * 1.2 + seed)) ** 2, rot = 8 * sh * Math.sin(t * 14 + seed);
	return <g transform={`${at(x, y, s)} rotate(${rot} 0 -0.2)`}>
		<Sd d={sps([[-0.25, 0, 1], [0.25, 0, 1], [0.22, -2.4], [-0.22, -2.4]], 0.2)} f={PAL.gold} c={c} />
		{/* Hathor face with cow ears */}
		{[-1, 1].map((sg) => <Sd key={sg} d={sps([[sg * 0.55, -3.25], [sg * 1.15, -3.45], [sg * 1.0, -3.0], [sg * 0.6, -2.95]], 0.25)} f={PAL.gold} c={c} k={0.7} />)}
		<Sd d={sps([[-0.6, -3.6], [0.6, -3.6], [0.62, -2.9], [0.3, -2.45], [-0.3, -2.45], [-0.62, -2.9]], 0.25)} f={PAL.gold} c={c} />
		{[-0.25, 0.25].map((ex) => <path key={ex} d={`M${ex - 0.12} -3.1Q${ex} -3.18 ${ex + 0.12} -3.1`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />)}
		<path d="M-0.12 -2.7Q0 -2.64 0.12 -2.7" fill="none" stroke={PAL.ink} strokeWidth={c.LW} />
		{[-1, 1].map((sg) => <path key={'w' + sg} d={`M${sg * 0.6} -3.5Q${sg * 0.9} -2.8 ${sg * 0.55} -2.4`} fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.4} />)}
		{/* the naos with its rods and jingles */}
		<Sd d={rect(-0.95, -6.2, 0.95, -3.6)} f={PAL.gold} c={c} />
		<rect x={-0.6} y={-5.7} width={1.2} height={1.8} fill="#2A1A12" />
		<WingSmall x={0} y={-6.45} w={2.2} c={c} />
		{[-5.3, -4.8, -4.3].map((yy, i) => { const j = 0.1 * sh * Math.sin(t * 22 + i * 2); return <g key={yy}><path d={`M-0.9 ${yy}L0.9 ${yy}`} stroke={PAL.ink} strokeWidth={0.07} />
			{[-0.3, 0.3].map((dx) => <ellipse key={dx} cx={dx + j} cy={yy} rx={0.1} ry={0.18} fill={PAL.goldHi} stroke={PAL.ink} strokeWidth={c.LW * 0.7} />)}</g>; })}
		{[-1, 1].map((sg) => <Sd key={'u' + sg} d={sps([[sg * 1.0, -3.65, 1], [sg * 1.25, -3.65, 1], [sg * 1.3, -5.0], [sg * 1.15, -5.4], [sg * 0.95, -5.2]], 0.2)} f={PAL.gold} c={c} k={0.6} />)}
	</g>;
};

/* ---------------- life, dominion, stability ---------------- */
type EmblemP = SetP & {h?: number; glint?: boolean};
const Glint: React.FC<{t: number; h: number; w: number; ph?: number}> = ({t, h, w, ph = 0}) => { const u = ((t * 0.25 + ph) % 1); return u > 0.35 ? null :
	<path d={poly([[-w + (u / 0.35) * 2 * w - 0.25, 0], [-w + (u / 0.35) * 2 * w + 0.1, 0], [-w + (u / 0.35) * 2 * w + 0.6, -h], [-w + (u / 0.35) * 2 * w + 0.25, -h]])} fill="#FFF6D8" opacity={0.55 * Math.sin(Math.PI * u / 0.35)} style={{mixBlendMode: 'screen'}} />; };
/** the ankh (life) as a gilded cult object on a small stand; a glint runs over it (t). Origin = foot of the stand; h = height */
export const Ankh61: React.FC<EmblemP> = ({x, y, s, t = 0, h = 4.2, glint = true}) => {
	const c = ck(s), k = h / 4.2, id = `ak-${Math.round(x)}-${Math.round(y)}`;
	const loop = sps([[0, -2.75], [0.65, -3.15], [0.82, -3.75], [0.5, -4.25], [0, -4.38], [-0.5, -4.25], [-0.82, -3.75], [-0.65, -3.15]], 0.2);
	const hole = sps([[0, -3.1], [0.33, -3.45], [0.38, -3.8], [0.2, -4.08], [0, -4.12], [-0.2, -4.08], [-0.38, -3.8], [-0.33, -3.45]], 0.2);
	const body = rect(-1.2, -3.0, 1.2, -2.5), stem = poly([[-0.24, -2.6], [0.24, -2.6], [0.38, -0.5], [-0.38, -0.5]]);
	return <g transform={`${at(x, y, s)} scale(${k})`}>
		<Sd d={rect(-0.9, -0.5, 0.9, 0)} f={S61.wood} c={c} />
		<defs><clipPath id={id}><path d={loop + body + stem} /></clipPath></defs>
		{[loop, body, stem].map((d, i) => <path key={i} d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW / k} strokeLinejoin="round" />)}
		{[loop, body, stem].map((d, i) => <path key={'f' + i} d={d} fill={PAL.gold} />)}
		<path d={hole} fill={PAL.plaster} stroke={PAL.ink} strokeWidth={c.LW / k} />
		{glint && <g clipPath={`url(#${id})`}><Glint t={t} h={4.4} w={1.4} /></g>}
	</g>;
};
/** the was sceptre (dominion): forked foot, straight shaft, the Set-animal head at the top; stands in a socket. Origin = foot; h = height */
export const Was61: React.FC<EmblemP> = ({x, y, s, t = 0, h = 7}) => {
	const c = ck(s);
	return <g transform={at(x, y, s)}>
		<Sd d={rect(-0.8, -0.4, 0.8, 0)} f={S61.wood} c={c} />
		<Sd d={poly([[-0.14, -0.9], [0.14, -0.9], [0.14, -h + 0.5], [-0.14, -h + 0.5]])} f={PAL.gold} c={c} />
		<Sd d={poly([[-0.14, -1.0], [0.14, -1.0], [0.42, -0.55], [0.42, -0.4], [0.24, -0.4], [0.1, -0.6], [-0.1, -0.6], [-0.24, -0.4], [-0.42, -0.4], [-0.42, -0.55]])} f={PAL.gold} c={c} k={0.8} />
		<Sd d={sps([[-0.14, -h + 0.6, 1], [-0.2, -h], [0.25, -h - 0.4], [1.1, -h - 0.4], [1.25, -h - 0.2, 1], [0.55, -h - 0.08], [0.2, -h + 0.15], [0.14, -h + 0.6, 1]], 0.18)} f={PAL.gold} c={c} k={0.8} />
		{[0.3, 0.55, 0.8].map((u) => <rect key={u} x={-0.15} y={-h * u - 0.1} width={0.3} height={0.2} fill={PAL.blue} />)}
		<circle cx={0.5} cy={-h - 0.25} r={0.07} fill={PAL.ink} />
		<g opacity={0.8}><Glint t={t} h={h} w={0.4} ph={0.3} /></g>
	</g>;
};
/** the djed pillar (stability, Osiris's backbone): the shaft with four crossbars on top, painted bands; glint (t). Origin = foot; h = height */
export const Djed61: React.FC<EmblemP> = ({x, y, s, t = 0, h = 5}) => {
	const c = ck(s), k = h / 5;
	return <g transform={`${at(x, y, s)} scale(${k})`}>
		<Sd d={rect(-0.9, -0.4, 0.9, 0)} f={S61.wood} c={c} />
		<Sd d={sps([[-0.55, -0.4, 1], [0.55, -0.4, 1], [0.5, -3.1], [0.75, -3.3, 1], [-0.75, -3.3, 1], [-0.5, -3.1]], 0.2)} f={PAL.gold} c={c} />
		{[-1.2, -1.8, -2.4].map((yy, i) => <rect key={yy} x={-0.52} y={yy} width={1.04} height={0.18} fill={[PAL.red, PAL.blue, PAL.red][i]} />)}
		{[0, 1, 2, 3].map((i) => <Sd key={i} d={rect(-1.05, -3.45 - i * 0.42, 1.05, -3.25 - i * 0.42)} f={i % 2 ? PAL.blue : PAL.gold} c={c} k={0.7} />)}
		<Sd d={rect(-0.75, -5.0, 0.75, -4.95 + 0.15)} f={PAL.gold} c={c} k={0.7} />
		<Glint t={t} h={5} w={1.0} ph={0.6} />
	</g>;
};

/* ---------------- the sun barque & a papyrus skiff ---------------- */
/** Ra's barque on the sky-river: the papyriform hull, the shrine with the sun disc blazing in it, the steering oar, Mehen arching over
    (wraps the ep60 Barque; it rocks and bobs, t). Origin = waterline centre; ~32 long */
export const SunBarque: React.FC<SetP & {glow?: number}> = ({x, y, s, t = 0, glow = 1}) => {
	const c = ck(s), pulse = 0.9 + 0.1 * Math.sin(t * 2.2);
	return <Barque x={x} y={y} s={s} t={t} glow={glow}>
		<circle cx={0} cy={-6.6} r={6} fill="url(#g60-gold)" opacity={0.7 * glow * pulse} style={{mixBlendMode: 'screen'}} />
		<circle cx={0} cy={-6.6} r={2.9} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.OW * 1.6} />
		<circle cx={0} cy={-6.6} r={2.2} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2.4} />
		<Sd d={sps([[-0.25, -3.6, 1], [0.25, -3.6, 1], [0.3, -4.2], [0.45, -4.6], [0.1, -4.9], [-0.25, -4.6]], 0.2)} f={PAL.gold} c={c} k={0.6} />
	</Barque>;
};
/** a light papyrus skiff with bound bundles, a punting pole laid along it (wraps the ep60 Skiff; rocks, t). Origin = waterline centre; len units */
export const Skiff61: React.FC<SetP & {len?: number}> = ({x, y, s, t = 0, len = 11}) => <g>
	<Skiff x={x} y={y} s={s} t={t} len={len} />
</g>;

/* ---------------- the funerary bed ---------------- */
/** the lion bed of the embalming / the tomb: lion head at the foot end, lion legs with paws on drums, tail curled (wraps the ep60 LionBier).
    Origin = floor under the bed's tail end; len units */
export const LionBed: React.FC<SetP & {len?: number; flip?: 1 | -1}> = ({x, y, s, len = 20.2, flip = 1}) => <LionBier x={x} y={y} s={s} len={len} flip={flip} />;

/* ---------------- chests & baskets ---------------- */
/** a wooden chest on short legs with a gabled (shrine-roof) lid, painted panels, the two knobs tied with cord and sealed. Origin = floor centre */
export const Chest61: React.FC<SetP & {w?: number; h?: number; paint?: string}> = ({x, y, s, w = 4.4, h = 2.6, paint = PAL.blue}) => {
	const c = ck(s);
	return <g transform={at(x, y, s)}>
		{[-w / 2 + 0.2, w / 2 - 0.6].map((lx) => <Sd key={lx} d={rect(lx, -0.45, lx + 0.4, 0)} f={S61.wood2} c={c} k={0.7} />)}
		<Sd d={rect(-w / 2, -h, w / 2, -0.45)} f={S61.wood} c={c} />
		{[0, 1].map((i) => <rect key={i} x={-w / 2 + 0.3 + i * (w / 2)} y={-h + 0.3} width={w / 2 - 0.6} height={h - 1.05} fill={paint} stroke={PAL.ink} strokeWidth={c.LW} opacity={0.85} />)}
		{[0, 1].map((i) => <path key={'d' + i} d={`M${-w / 2 + 0.5 + i * (w / 2)} ${-h + 0.6}l${(w / 2 - 1.0)} ${h - 1.65}M${-w / 2 + 0.5 + i * (w / 2)} ${-0.75}l${(w / 2 - 1.0)} ${-(h - 1.65)}`} stroke={PAL.gold} strokeWidth={c.LW * 1.2} opacity={0.8} />)}
		<Sd d={poly([[-w / 2 - 0.15, -h], [w / 2 + 0.15, -h], [w / 2 - 0.2, -h - 0.9], [-w / 2 + 0.2, -h - 0.9]])} f={S61.wood2} c={c} />
		<circle cx={w * 0.12} cy={-h + 0.15} r={0.14} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} /><circle cx={w * 0.12} cy={-h - 0.45} r={0.14} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
		<path d={`M${w * 0.12} ${-h + 0.15}L${w * 0.12 + 0.1} ${-h - 0.45}`} stroke={PAL.red} strokeWidth={0.07} />
		<circle cx={w * 0.12 + 0.3} cy={-h - 0.1} r={0.16} fill={S61.mud} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />
	</g>;
};
/** a woven basket (unit-space helper): kind 'tall' | 'round' (lidded) | 'flat' (a tray of bread / figs) */
export const BasketU: React.FC<{x: number; y: number; c: Ck; kind?: 'tall' | 'round' | 'flat'; fill?: string; w?: number}> = ({x, y, c, kind = 'tall', fill, w = 2}) => {
	const h = kind === 'tall' ? w * 0.9 : kind === 'round' ? w * 0.6 : w * 0.28;
	return <g transform={`translate(${x},${y})`}>
		{fill && kind !== 'round' && <Sd d={sps([[-w * 0.45, -h, 1], [w * 0.45, -h, 1], [w * 0.3, -h - w * 0.32], [0, -h - w * 0.4], [-w * 0.3, -h - w * 0.32]], 0.25)} f={fill} c={c} k={0.7} />}
		<Sd d={sps([[-w / 2, -h, 1], [w / 2, -h, 1], [w * 0.44, -h * 0.35], [w * 0.32, 0, 1], [-w * 0.32, 0, 1], [-w * 0.44, -h * 0.35]], 0.2)} f={'#C08A3E'} c={c} />
		{[0.33, 0.66].map((u) => <path key={u} d={`M${-w * (0.48 - u * 0.1)} ${-h + u * h}L${w * (0.48 - u * 0.1)} ${-h + u * h}`} stroke={'#8A5A2E'} strokeWidth={c.LW * 1.4} />)}
		{Array.from({length: 6}, (_, i) => <path key={i} d={`M${-w * 0.42 + i * w * 0.17} ${-h + 0.05}L${-w * 0.28 + i * w * 0.11} -0.05`} stroke={'#8A5A2E'} strokeWidth={c.LW} opacity={0.7} />)}
		{kind === 'round' && <><Sd d={sps([[-w * 0.52, -h, 1], [w * 0.52, -h, 1], [w * 0.4, -h - w * 0.22], [0, -h - w * 0.3], [-w * 0.4, -h - w * 0.22]], 0.25)} f={PAL.red} c={c} k={0.8} />
			<path d={`M${-w * 0.35} ${-h - w * 0.12}Q0 ${-h - w * 0.24} ${w * 0.35} ${-h - w * 0.12}`} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 1.6} /></>}
	</g>;
};
/** three baskets: a tall one heaped with figs, a lidded round one, a flat tray of loaves. Origin = floor centre */
export const Baskets: React.FC<SetP> = ({x, y, s}) => {
	const c = ck(s);
	return <g transform={at(x, y, s)}>
		<BasketU x={-2.4} y={0} c={c} kind="tall" fill={'#7A4A6A'} w={2.2} />
		<BasketU x={2.5} y={0} c={c} kind="flat" fill={S61.bread} w={2.8} />
		<BasketU x={0.1} y={0} c={c} kind="round" w={2.2} />
	</g>;
};

/* ---------------- ostrich-feather fan ---------------- */
/** the royal flabellum: a long gilded handle ending in a half-round palm holding a fan of ostrich plumes (white and brown alternating);
    held upright it sways and the plumes ripple (t). Origin = the foot of the handle; h = length */
export const FeatherFan: React.FC<SetP & {h?: number; seed?: number; a?: number}> = ({x, y, s, t = 0, h = 9, seed = 0, a}) => {
	const c = ck(s), ph = phaseOf(seed, 47), sw = a ?? 3 * Math.sin(t * 0.9 + ph);
	return <g transform={`${at(x, y, s)} rotate(${sw})`}>
		<Rod a={[0, 0]} b={[0, -h + 1.4]} w={0.28} f={PAL.gold} c={c} />
		{[0.25, 0.5, 0.75].map((u) => <rect key={u} x={-0.2} y={-(h - 1.4) * u - 0.1} width={0.4} height={0.2} fill={PAL.blue} />)}
		{Array.from({length: 11}, (_, i) => { const aa = (-80 + i * 16 + 3 * Math.sin(t * 2.4 + i * 0.8 + ph)) * Math.PI / 180, L = 3.0, bx = 0, by = -h + 1.5, ex = bx + Math.sin(aa) * L, ey = by - Math.cos(aa) * L;
			const nx = Math.cos(aa) * 0.55, ny = Math.sin(aa) * 0.55;
			return <Sd key={i} d={sps([[bx, by, 1], [bx + (ex - bx) * 0.5 + nx, by + (ey - by) * 0.5 + ny], [ex + nx * 0.4, ey + ny * 0.4], [ex - nx * 0.3, ey - ny * 0.3 - 0.05], [bx + (ex - bx) * 0.5 - nx * 0.6, by + (ey - by) * 0.5 - ny * 0.6]], 0.22)} f={i % 2 ? '#8A6A4A' : PAL.white} c={c} k={0.6} />; })}
		<Sd d={sps([[-1.1, -h + 1.4, 1], [1.1, -h + 1.4, 1], [0.9, -h + 2.0], [0, -h + 2.3], [-0.9, -h + 2.0]], 0.22)} f={PAL.gold} c={c} />
		<path d={`M-0.8 ${-h + 1.75}L0.8 ${-h + 1.75}`} stroke={PAL.red} strokeWidth={c.LW * 1.6} />
	</g>;
};
export const _propKeep = {Ln, rng, blip, sp, lerp};
