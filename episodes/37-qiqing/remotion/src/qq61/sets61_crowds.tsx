import React from 'react';
import {God, Cast, Pose, POSES, solve, reach, wristTo} from '../qq60/rig60';
import {walkPose} from '../qq60/cast60';
import {gripOf, FistOver} from '../qq60/act60b_kit';
import {PAL, ap, lerp, sm, cl, V} from '../qq60/geo60';
import {Barque} from '../qq60/props60b';
import {SetP, at, ck, S61, Sd, Rod, rect, sps, phaseOf, wave} from './sets61_kit';
import {Censer, BasketU, Sistrum61, FeatherFan} from './sets61_props';

/* ep61 · SET-DRESSING library — CROWDS. Rows of extras built from the ep60 god rig (same bones, same paint as the cast, so they sit
   with the actors at the same `s`). Every figure runs on its own phase (phaseOf) — a crowd never moves in unison. Faces +x (face -1
   mirrors); origin (x, y) = the feet of the FIRST (leading) figure; the row trails back along -x by `gap` units per figure.
   `march` = units/s the whole row advances (0 = walking on the spot, for loops and catalogues). */
type CrowdP = SetP & {n?: number; gap?: number; face?: 1 | -1; march?: number; seed?: number; id?: string};
const P = PAL as Record<string, string>;
const mk = (name: string, o: Partial<Cast>): Cast => ({name, skin: 'skinM', skin2: 'skinM2', head: 'human', wig: 'none', crown: 'none', dress: 'kilt', apron: false, collar: 'plain', bHand: 'fist', fHand: 'fist', ...o});
export const EXTRAS: Record<'priest' | 'lector' | 'mourner' | 'worker' | 'musician' | 'soldier' | 'dancer', Cast> = {
	priest: mk('Priest', {dress: 'longkilt', bHand: 'fist', fHand: 'fist'}),
	lector: mk('Lector', {dress: 'longkilt', bHand: 'fist', fHand: 'fist'}),
	mourner: mk('Mourner', {skin: 'skinF', skin2: 'gold2', wig: 'tri', wigColor: 'wigH', dress: 'gown', female: true, bHand: 'open', fHand: 'open'}),
	worker: mk('Worker', {wig: 'none', dress: 'kilt'}),
	musician: mk('Musician', {skin: 'skinF', skin2: 'gold2', wig: 'tri', wigColor: 'wigH', crown: 'cone', dress: 'gown', female: true, bHand: 'fist', fHand: 'fist'}),
	soldier: mk('Soldier', {wig: 'duplex', wigColor: 'wigH', dress: 'kilt'}),
	dancer: mk('Dancer', {skin: 'skinF', skin2: 'gold2', wig: 'tri', wigColor: 'wigH', dress: 'sheath', female: true, bHand: 'open', fHand: 'open'}),
};
/** world px of a point in a bone frame of a posed figure */
const W = (pose: Pose, x: number, y: number, s: number, face: 1 | -1, bone: 'fH' | 'bH' | 'head' | 'fU' | 'bU' | 'torso', p: V, female = false): V => { const q = ap(solve(pose, female)[bone], p); return [x + face * s * q[0], y + s * q[1]]; };
const shoulderOf = (p: Pose, side: 'b' | 'f', female = false): V => ap(solve(p, female)[side === 'b' ? 'bU' : 'fU'], [0, 0]);
/** the row layout: figure i's x (px) and its own clock */
/** mirror a px-space piece about the vertical line x when face = -1 */
const Flip: React.FC<{x: number; face: number; children: React.ReactNode}> = ({x, face, children}) => <g transform={face < 0 ? `translate(${2 * x},0) scale(-1,1)` : undefined}>{children}</g>;
const row = (x: number, s: number, i: number, gap: number, face: number, march: number, t: number, jitter: number, seed: number) => x - face * i * gap * s + face * march * t * s + jitter * Math.sin(phaseOf(i, seed)) * s;

/* ---------------- procession of priests carrying the barque shrine ---------------- */
/** shaven priests in long kilts walk in step-but-not-in-unison with the portable barque of the god on carrying poles at shoulder height
    (the veiled shrine amidships); a lector priest leads with the arm-censer smoking. n carriers (≥ 2). */
export const PriestProcession: React.FC<CrowdP & {shrine?: boolean; censer?: boolean}> = ({x, y, s, t = 0, n = 6, gap = 5.0, face = 1, march = 0, seed = 1, id = 'pp', shrine = true, censer = true}) => {
	const out: React.ReactNode[] = [], poleY = -17.1, cast = EXTRAS.priest, c = {OW: 2.7 / s, LW: 1.5 / s};
	const lead = censer ? 1 : 0, xs: number[] = [];
	for (let i = 0; i < n + lead; i++) xs.push(row(x, s, i, gap, face, march, t, 0.15, seed));
	const carriers = xs.slice(lead), x0 = carriers[carriers.length - 1], x1 = carriers[0], bob = 0.12 * Math.sin(t * 3.2 + seed);
	// the poles + the barque (drawn behind the near arms: carriers' back arms are behind, front arms in front)
	const poleL = Math.min(x0, x1) - 2.2 * s, poleR = Math.max(x0, x1) + 2.2 * s, py = y + (poleY + bob) * s;
	const barque = shrine && <g key="bq">
		{[-1, 1].map((sg) => <Rod key={sg} a={[(x0 + x1) / 2 + sg * 2.6 * s, py]} b={[(x0 + x1) / 2 + sg * 2.0 * s, py - 4.6 * s]} w={0.3 * s} f={PAL.gold} c={{OW: 2.4, LW: 1.4}} />)}
		<Barque x={(x0 + x1) / 2} y={py - 5.0 * s} s={s * 0.42} t={0} glow={0}>
			<g transform="translate(0,-1)"><Sd d={rect(-4.4, -12.0, 4.4, 0.4)} f={PAL.linen} c={ck(s * 0.42)} /><path d="M-4.4 -6L4.4 -6M-4.4 -3L4.4 -3" stroke={PAL.blue} strokeWidth={0.4} />
				{[-2.6, 0, 2.6].map((u) => <path key={u} d={`M${u} -11.6L${u + 0.4 * Math.sin(t * 1.5 + u)} 0`} stroke={PAL.gold} strokeWidth={0.25} opacity={0.7} />)}</g>
		</Barque>
	</g>;
	const poles = shrine && <Rod key="pole" a={[poleL, py]} b={[poleR, py]} w={0.42 * s} f={S61.wood} c={{OW: 2.4, LW: 1.4}} />;
	const figs = xs.map((fx, i) => { const ph = phaseOf(i, seed) + t * 2.6, carrier = i >= lead;
		let p: Pose = walkPose(ph, {lean: carrier ? 1 : 3, stride: 0.7, arm: carrier ? 0 : 0.8});
		if (carrier) { const sh = shoulderOf(p, 'f'); p = wristTo(reach(p, 'f', [sh[0] + 0.9, poleY + bob + 0.2]), 'f', -80); const sb = shoulderOf(p, 'b'); p = wristTo(reach(p, 'b', [sb[0] - 0.6, poleY + bob + 0.25]), 'b', -100); }
		else { const sh = shoulderOf(p, 'f'); p = wristTo(reach(p, 'f', [sh[0] + 4.2, sh[1] + 2.6]), 'f', 0); }
		return {fx, p, i, carrier}; });
	figs.slice().reverse().forEach(({fx, p, i, carrier}) => {
		out.push(<God key={i} id={`${id}${i}`} cast={i === 0 && censer ? EXTRAS.lector : cast} pose={p} x={fx} y={y} s={s} face={face} sec={{t: t + i}} />);
		if (!carrier) { const g = gripOf(p, 'f'); out.push(<g key={'c' + i}><Flip x={fx + face * g[0] * s} face={face}><Censer x={fx + face * g[0] * s} y={y + g[1] * s} s={s * 0.9} t={t} seed={seed} /></Flip>
			<g transform={`translate(${fx},${y}) scale(${s * face},${s})`}><FistOver pose={p} side="f" c={c} skin={P.skinM} /></g></g>); }
	});
	return <g>{barque}{out}{poles}</g>;
};

/* ---------------- mourners ---------------- */
/** professional mourners (the Ramose type): women in white with loose dark hair, arms thrown up over their heads, bodies swaying; each
    raises and drops her arms on her own beat; kneel = every other one kneels in front. */
export const Mourners: React.FC<CrowdP & {kneel?: boolean}> = ({x, y, s, t = 0, n = 5, gap = 3.8, face = 1, march = 0, seed = 2, id = 'mo', kneel = false}) => {
	const cast = EXTRAS.mourner;
	return <g>{Array.from({length: n}, (_, i) => n - 1 - i).map((i) => {
		const ph = phaseOf(i, seed), u = 0.55 + 0.45 * wave(t, 1.4 + 0.3 * Math.sin(ph), ph), kn = kneel && i % 2 === 1, fx = row(x, s, i, gap, face, march, t, 0.25, seed);
		let p: Pose = kn ? {...POSES.kneel, rt: -10, rk: 100, rf: 40, at: 118, ak: 124, lean: 10 + 6 * u, neck: 4, head: 8} : {...POSES.rest, lean: 2 + 5 * u + 1.2 * Math.sin(t * 1.1 + ph), neck: 2, head: 4 + 6 * u, rt: -5, at: 7, rk: 2, ak: 1};
		const sh = shoulderOf(p, 'f', true);
		p = wristTo(reach(p, 'f', [sh[0] + lerp(1.4, 0.6, u), sh[1] - lerp(2.6, 5.2, u)], true), 'f', lerp(150, 175, u));
		const sb = shoulderOf(p, 'b', true);
		p = wristTo(reach(p, 'b', [sb[0] + lerp(0.6, 0.2, u), sb[1] - lerp(2.2, 5.0, u)], true), 'b', lerp(150, 170, u));
		return <God key={i} id={`${id}${i}`} cast={cast} pose={p} x={fx + (kn ? face * 1.6 * s : 0)} y={y} s={s} face={face} sec={{t: t + i}} />; })}</g>;
};

/* ---------------- workers ---------------- */
/** a hauling team: men leaning into the ropes drag a great stone block on a wooden sledge (a man pours water before the runners); they
    heave on their own rhythms. The block sits behind the team (at -x). */
export const Haulers: React.FC<CrowdP & {block?: boolean}> = ({x, y, s, t = 0, n = 5, gap = 4.4, face = 1, seed = 3, id = 'ha', block = true}) => {
	const cast = EXTRAS.worker, ropeY = -11.8, xs = Array.from({length: n}, (_, i) => row(x, s, i, gap, face, 0, t, 0.2, seed));
	const bx = xs[n - 1] - face * 7 * s, c = ck(s);
	return <g>
		{block && <g transform={at(bx, y, s, face)}>
			<Sd d={sps([[-5.6, 0, 1], [4.2, 0, 1], [5.2, -0.6], [4.6, -1.0, 1], [-5.6, -1.0, 1]], 0.2)} f={S61.wood} c={c} />
			<Sd d={rect(-4.8, -7.6, 3.6, -1.0)} f={S61.granite} c={c} k={1.2} />
			<path d="M-4.8 -4.2L3.6 -4.6" stroke={S61.granite2} strokeWidth={c.LW * 1.4} />
			{[[-2, -6], [1, -2.6], [-3.4, -2.2]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={0.12} fill={S61.granite2} />)}
		</g>}
		{xs.map((fx, i) => i).reverse().map((i) => { const fx = xs[i], ph = phaseOf(i, seed), heave = wave(t, 2.2 + 0.25 * Math.sin(ph), ph), k = (fx - (bx + face * 4.6 * s)) / ((xs[0] + face * 1.6 * s) - (bx + face * 4.6 * s));
			const ry = lerp(-0.8, ropeY - 0.1, k);
			let p: Pose = {...walkPose(ph * 0.3 + t * 0.9, {lean: 20 + 8 * heave, stride: 0.6, arm: 0}), neck: -6, head: -10};
			p = wristTo(reach(p, 'f', [1.6, ry + 0.3]), 'f', 20); p = wristTo(reach(p, 'b', [0.4, ry + 0.4]), 'b', 10);
			return <God key={i} id={`${id}${i}`} cast={cast} pose={p} x={fx} y={y} s={s} face={face} sec={{t: t + i}} />; })}
		{/* the rope, over the team (held at the hands) */}
		<path d={`M${bx + face * 4.6 * s} ${y - 0.8 * s}L${xs[0] + face * 1.6 * s} ${y + (ropeY - 0.1) * s}`} stroke={PAL.ink} strokeWidth={0.42 * s} strokeLinecap="round" />
		<path d={`M${bx + face * 4.6 * s} ${y - 0.8 * s}L${xs[0] + face * 1.6 * s} ${y + (ropeY - 0.1) * s}`} stroke="#C9A060" strokeWidth={0.24 * s} strokeLinecap="round" />
	</g>;
};
/** basket carriers: men walking with baskets on their heads, one hand up steadying the load. */
export const BasketCarriers: React.FC<CrowdP> = ({x, y, s, t = 0, n = 4, gap = 4.6, face = 1, march = 0, seed = 4, id = 'bc'}) => {
	const cast = EXTRAS.worker, c = ck(s), fills = ['#7A4A6A', S61.bread, PAL.green, '#C9874A'];
	return <g>{Array.from({length: n}, (_, i) => n - 1 - i).map((i) => {
		const ph = phaseOf(i, seed) + t * 2.8, fx = row(x, s, i, gap, face, march, t, 0.2, seed);
		let p: Pose = walkPose(ph, {lean: 1, stride: 0.75, arm: 0.6});
		const hd = ap(solve(p).head, [0.2, -2.55]);
		const sh = shoulderOf(p, 'f'); p = wristTo(reach(p, 'f', [hd[0] + 0.9, hd[1] + 0.2]), 'f', 175); void sh;
		const top = W(p, fx, y, s, face, 'head', [0.2, -2.55]);
		return <g key={i}><God id={`${id}${i}`} cast={cast} pose={p} x={fx} y={y} s={s} face={face} sec={{t: t + i}} />
			<g transform={at(top[0], top[1] + 0.15 * s, s, face)}><BasketU x={0} y={0} c={c} kind="tall" fill={fills[i % fills.length]} w={2.6} /></g></g>; })}</g>;
};

/* ---------------- musicians & dancers ---------------- */
/** a band: a kneeling harpist plucking an arched harp, women shaking sistra, and dancers kicking and swaying with raised arms. */
export const Musicians: React.FC<CrowdP & {dancers?: number}> = ({x, y, s, t = 0, face = 1, seed = 5, id = 'mu', dancers = 2}) => {
	const c = ck(s), m = EXTRAS.musician, d = EXTRAS.dancer, out: React.ReactNode[] = [];
	// harpist (kneeling, facing +x, the harp in front)
	const hx = x, ph0 = phaseOf(0, seed);
	let hp: Pose = {...POSES.kneel, rt: -10, rk: 100, rf: 40, at: 118, ak: 124, lean: 6 + 1.2 * Math.sin(t * 1.1), neck: 2, head: 4};
	const pl = (k: number) => 0.6 * Math.sin(t * 5 + ph0 + k);
	hp = wristTo(reach(hp, 'f', [3.6 + pl(0) * 0.6, -11.5 + pl(1)], true), 'f', 70); hp = wristTo(reach(hp, 'b', [3.0 + pl(2) * 0.5, -9.0 + pl(3)], true), 'b', 60);
	const harp = <g key="harp" transform={at(hx, y, s, face)}>
		<path d="M3.0 -0.6Q2.2 -9 5.4 -16.4" fill="none" stroke={PAL.ink} strokeWidth={0.75 + 2 * c.OW} strokeLinecap="round" />
		<path d="M3.0 -0.6Q2.2 -9 5.4 -16.4" fill="none" stroke={S61.wood} strokeWidth={0.75} strokeLinecap="round" />
		<Sd d={sps([[2.2, 0, 1], [4.4, 0, 1], [4.2, -1.6], [3.0, -2.2], [2.4, -1.4]], 0.25)} f={PAL.red} c={c} />
		{Array.from({length: 8}, (_, k) => { const yy = -2.6 - k * 1.65, xx = 3.0 + (k / 8) ** 1.6 * 2.3, vib = Math.abs(pl(k)) > 0.45 ? 0.08 * Math.sin(t * 60 + k) : 0; return <path key={k} d={`M${xx} ${yy}Q${(xx + 5.4) / 2 + vib} ${(yy - 16.0) / 2} 5.3 -16.0`} fill="none" stroke="#F3E3B8" strokeWidth={0.06} opacity={0.9} />; })}
		<path d="M5.2 -16.2L3.6 -1.8" stroke={PAL.ink} strokeWidth={0.32} /><path d="M5.2 -16.2L3.6 -1.8" stroke={S61.wood2} strokeWidth={0.18} />
	</g>;
	out.push(harp, <God key="h" id={`${id}h`} cast={m} pose={hp} x={hx} y={y} s={s} face={face} sec={{t}} />);
	// sistrum players
	[1, 2].forEach((k) => { const fx = x - face * (4.4 + k * 4.8) * s, ph = phaseOf(k, seed), sh = wave(t, 0.5, ph);
		let p: Pose = {...POSES.rest, lean: 1 + 1.5 * Math.sin(t * 1.4 + ph), neck: 0, head: 2 * Math.sin(t * 1.4 + ph), rt: -6, at: 9, rk: 2, ak: 1};
		const s0 = shoulderOf(p, 'f', true); p = wristTo(reach(p, 'f', [s0[0] + 3.4, s0[1] + 1.0 - 0.7 * sh], true), 'f', -20 + 20 * sh);
		const s1 = shoulderOf(p, 'b', true); p = wristTo(reach(p, 'b', [s1[0] + 1.2, s1[1] + 6.2], true), 'b', 0);
		const g = gripOf(p, 'f', true);
		out.push(<g key={'s' + k}><God id={`${id}s${k}`} cast={m} pose={p} x={fx} y={y} s={s} face={face} sec={{t: t + k}} />
			<Flip x={fx + face * g[0] * s} face={face}><Sistrum61 x={fx + face * g[0] * s} y={y + (g[1] + 0.9) * s} s={s * 0.62} t={t} shake={0.4 + 0.6 * sh} seed={k} /></Flip>
			<g transform={`translate(${fx},${y}) scale(${s * face},${s})`}><FistOver pose={p} side="f" c={{OW: 2.7 / s, LW: 1.5 / s}} skin={P.skinF} female /></g></g>); });
	// dancers: high kick and raised arms, each on her own count
	for (let k = 0; k < dancers; k++) { const fx = x - face * (18.8 + k * 5.0) * s, ph = phaseOf(k + 5, seed), u = wave(t, 1.2, ph), kick = sm(cl(u * 1.4 - 0.2));
		let p: Pose = {...POSES.rest, lean: lerp(-2, -10, kick), neck: -2, head: -4, rt: -4, rk: 2, at: lerp(10, 72, kick), ak: lerp(4, 10, kick)};
		const s0 = shoulderOf(p, 'f', true); p = wristTo(reach(p, 'f', [s0[0] + lerp(2.4, 1.0, u), s0[1] - lerp(3.6, 5.0, u)], true), 'f', 160);
		const s1 = shoulderOf(p, 'b', true); p = wristTo(reach(p, 'b', [s1[0] - lerp(0.4, 1.4, u), s1[1] - lerp(3.6, 5.0, u)], true), 'b', 170);
		out.push(<God key={'d' + k} id={`${id}d${k}`} cast={d} pose={p} x={fx} y={y} s={s} face={face} sec={{t: t + k * 2}} />); }
	return <g>{out.slice().reverse()}</g>;
};

/* ---------------- soldiers ---------------- */
/** a file of spearmen (the Middle-Kingdom model-soldier kit): short dark wigs, kilts, a tall round-topped cowhide shield on the back arm
    and a spear held upright in the front fist; they march (on the spot or advancing at `march`), each on his own foot. */
export const Soldiers: React.FC<CrowdP> = ({x, y, s, t = 0, n = 5, gap = 4.4, face = 1, march = 0, seed = 6, id = 'so'}) => {
	const cast = EXTRAS.soldier, c = ck(s), cf = {OW: 2.7 / s, LW: 1.5 / s};
	return <g>{Array.from({length: n}, (_, i) => n - 1 - i).map((i) => {
		const ph = phaseOf(i, seed) * 0.35 + t * 3.0 + i * 0.4, fx = row(x, s, i, gap, face, march, t, 0.1, seed);
		let p: Pose = walkPose(ph, {lean: 2, stride: 0.8, arm: 0});
		const sf = shoulderOf(p, 'f'); p = wristTo(reach(p, 'f', [sf[0] + 1.9, sf[1] + 4.8]), 'f', 92);
		const sb = shoulderOf(p, 'b'); p = wristTo(reach(p, 'b', [sb[0] - 0.4, sb[1] + 4.0]), 'b', 60);
		const g = gripOf(p, 'f'), gb = gripOf(p, 'b');
		const spots = [[-0.6, -1.0], [0.5, -2.2], [-0.3, -3.4], [0.6, -0.2]];
		return <g key={i}>
			{/* shield on the back arm (behind the body) */}
			<g transform={`translate(${fx},${y}) scale(${s * face},${s}) translate(${gb[0] - 0.6},${gb[1] + 2.6})`}>
				<Sd d={sps([[-1.3, 0, 1], [1.3, 0, 1], [1.3, -3.6], [0.9, -4.6], [0, -5.0], [-0.9, -4.6], [-1.3, -3.6]], 0.2)} f={'#EFE6D2'} c={c} />
				{spots.map(([a, b], k) => <ellipse key={k} cx={a} cy={b} rx={0.5} ry={0.35} fill={i % 2 ? '#2A2224' : '#8A4A2A'} />)}
				<rect x={-1.3} y={-5.0} width={2.6} height={5.0} fill="none" stroke={PAL.ink} strokeWidth={cf.LW * 0.8} opacity={0} />
			</g>
			<God id={`${id}${i}`} cast={cast} pose={p} x={fx} y={y} s={s} face={face} sec={{t: t + i}} />
			<g transform={`translate(${fx},${y}) scale(${s * face},${s})`}>
				<Rod a={[g[0], -0.4]} b={[g[0], -23.2]} w={0.26} f={S61.wood} c={c} />
				<Sd d={sps([[g[0] - 0.3, -23.0, 1], [g[0] + 0.3, -23.0, 1], [g[0] + 0.2, -24.2], [g[0], -25.2, 1], [g[0] - 0.2, -24.2]], 0.2)} f={'#C9C2B0'} c={c} k={0.8} />
				<FistOver pose={p} side="f" c={cf} skin={P.skinM} />
			</g>
		</g>; })}</g>;
};
/** fan-bearers flanking a king / god: men holding the ostrich-feather fans aloft (sway out of step). */
export const FanBearers: React.FC<CrowdP> = ({x, y, s, t = 0, n = 2, gap = 4.2, face = 1, seed = 7, id = 'fb'}) => {
	const cast = EXTRAS.priest, cf = {OW: 2.7 / s, LW: 1.5 / s};
	return <g>{Array.from({length: n}, (_, i) => n - 1 - i).map((i) => { const fx = row(x, s, i, gap, face, 0, t, 0.2, seed), ph = phaseOf(i, seed);
		let p: Pose = {...POSES.rest, lean: 1 + Math.sin(t * 0.9 + ph), rt: -8, at: 11, rk: 3, ak: 2};
		const sf = shoulderOf(p, 'f'); p = wristTo(reach(p, 'f', [sf[0] + 1.6, sf[1] - 2.8]), 'f', 95);
		const g = gripOf(p, 'f');
		return <g key={i}><God id={`${id}${i}`} cast={cast} pose={p} x={fx} y={y} s={s} face={face} sec={{t: t + i}} />
			<Flip x={fx + face * g[0] * s} face={face}><FeatherFan x={fx + face * g[0] * s} y={y + (g[1] + 5.2) * s} s={s} t={t} h={14} seed={i + seed} a={6 + 3 * Math.sin(t * 0.9 + ph)} /></Flip>
			<g transform={`translate(${fx},${y}) scale(${s * face},${s})`}><FistOver pose={p} side="f" c={cf} skin={P.skinM} /></g></g>; })}</g>;
};
