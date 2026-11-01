import React from 'react';
import {W, H, P, f2, rnd, sm, poly, ribbon, tube, lp, add, rot, build, Built, Pose, HEADP, FACE, DU_OUT, duMarks, DU_L, DU_W, B1, B2, B3} from './kit55';
import {RimF} from '../qq54/cao54b';
import {Npc} from '../qq54/npc54b';
/* LOOK A 「篝火 · 主角刻画」 — the ep54 / 马首 family on this story. Flat-vector 2.5D layered sets with haze between the
   planes, one warm key per scene (the fire; at home the 牍 itself; in the tomb the work lamp). The four family members are
   drawn characters: flat cel shading (a base, a core-shade band on the side away from the key), a warm key rim and a cool
   石青 accent rim on the back edges. Everyone else is a warm-black silhouette rimmed by the key. The 牍 is the one glowing
   object in every frame. */
const SIL = '#160F0C', KEY = '#FFD9A6', ACC = '#86CAD6', RIMW = '#FFB070';
export type PalA = {skin: string; skinS: string; skinH: string; hair: string; robe: string; robeS: string; trim: string; trousers: string; wrap: string; shoe: string;
	metal: string; metalH: string; lace: string; line: string; band?: string};
const SOLDIER: PalA = {skin: '#B97E58', skinS: '#6E4430', skinH: '#F2C290', hair: '#151010', robe: '#55402E', robeS: '#2C2018', trim: '#7A3426', trousers: '#2E2824', wrap: '#5E5040', shoe: '#1C1512', metal: '#3B3532', metalH: '#8E8478', lace: '#9A3E2A', line: '#2A160E', band: '#A8402C'};
const ARMOUR: PalA = {...SOLDIER, robe: '#6A3026', robeS: '#36160F', trim: '#2E3A30'};
const MOTHER: PalA = {skin: '#B88262', skinS: '#6A4434', skinH: '#F4C9A0', hair: '#4E4842', robe: '#5E4A3C', robeS: '#2E241C', trim: '#7E3A2A', trousers: '#2E2824', wrap: '#5E5040', shoe: '#1C1512', metal: '#3B3532', metalH: '#8E8478', lace: '#9A3E2A', line: '#2A160E'};
const FARMER: PalA = {...SOLDIER, robe: '#46503E', robeS: '#232A20', trim: '#2E2A24', hair: '#121010'};

/* ---------- filters: per-part core shade (the side away from a key at local +x), and the figure rims ---------- */
const ToonDefs: React.FC<{id: string; d: number; c: string; o: number; lx?: number; ly?: number}> = ({id, d, c, o, lx = 0.94, ly = -0.34}) => <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
	<feOffset in="SourceAlpha" dx={lx * d} dy={ly * d} result="o" />
	<feComposite in="SourceAlpha" in2="o" operator="out" result="band" />
	<feGaussianBlur in="band" stdDeviation={0.25} result="bb" />
	<feFlood floodColor={c} floodOpacity={o} result="f" />
	<feComposite in="f" in2="bb" operator="in" result="s1" />
	<feComposite in="s1" in2="SourceAlpha" operator="in" result="s" />
	<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="s" /></feMerge>
</filter>;
export const FigDefs: React.FC<{p: string}> = ({p}) => <>
	<ToonDefs id={`${p}tL`} d={7.5} c="#120806" o={0.5} />
	<ToonDefs id={`${p}tS`} d={3.6} c="#120806" o={0.5} />
	<ToonDefs id={`${p}tF`} d={4} c="#3A1A10" o={0.55} />
	<pattern id={`${p}lam`} width={5.2} height={6.4} patternUnits="userSpaceOnUse">
		<rect width={5.2} height={6.4} fill="#14110F" />
		<path d="M0.3,0.3 L4.9,0.3 L4.9,5.0 C4,5.7 1.2,5.7 0.3,5.0 Z" fill="#3A3430" />
		<path d="M0.3,0.3 L4.9,0.3 L4.9,1.2 L0.3,1.2 Z" fill="#8E8478" opacity={0.4} />
		<path d="M4.2,0.3 L4.9,0.3 L4.9,5 L4.2,5.2 Z" fill="#000" opacity={0.35} />
		{[[1.3, 2.2], [3.9, 2.2], [1.3, 4.0], [3.9, 4.0]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={0.36} fill="#C9A46A" opacity={0.85} />)}
		<rect x={0} y={5.6} width={5.2} height={0.8} fill="#8A3424" />
		<path d="M2.6,5.6 L2.6,6.4" stroke="#C8604A" strokeWidth={0.3} />
	</pattern>
	<RimF id={`${p}rimH`} lx={1} ly={-0.3} k={0.75} c={KEY} o={0.95} lx2={-1} ly2={-0.25} k2={0.6} c2={ACC} o2={0.95} blur={0.18} />
	<RimF id={`${p}rimS`} lx={1} ly={-0.3} k={0.6} c={RIMW} o={0.9} blur={0.2} />
</>;
/** a drawn figure (hero) or a one-tone silhouette (sil); the caller transforms it and applies the rim */
/** fL / fS override the per-part filters ('' = none); ink = an outline on every part (look B); silC = the silhouette tone */
export const FigA: React.FC<{b: Built; pal: PalA; p: string; id: string; sil?: boolean; fL?: string; fS?: string; ink?: {c: string; w: number}; silC?: string; eye?: string}> = ({b, pal, p, id, sil, fL, fS, ink, silC, eye}) => {
	const P0 = b.pose, F = (c: string) => (sil ? silC ?? SIL : c), flt = (o: string | undefined, d: string) => (sil ? undefined : o === undefined ? d : o === '' ? undefined : o);
	const tl = flt(fL, `url(#${p}tL)`), ts = flt(fS, `url(#${p}tS)`);
	const st = ink && !sil ? {stroke: ink.c, strokeWidth: ink.w, strokeLinejoin: 'round' as const} : {};
	const arm = (a: Built['armN'], far: boolean, flap?: string) => <g filter={ts}>
		<path d={a.up} fill={F(far ? pal.robeS : pal.robe)} {...st} /><path d={a.lo} fill={F(far ? pal.robeS : pal.robe)} {...st} />
		{flap && <g><path d={flap} fill={sil ? silC ?? SIL : `url(#${p}lam)`} /><path d={flap} fill="none" stroke={F('#0E0B0A')} strokeWidth={0.5} /></g>}
		<path d={a.cuff} fill={F(far ? '#2A1A14' : pal.trim)} />
		<path d={a.hand} fill={F(far ? pal.skinS : pal.skin)} {...st} />
		{!sil && !far && <path d={a.hand} fill={pal.skinH} opacity={0.35} transform={`translate(0.6,-0.8)`} clipPath={`url(#${id}hc)`} />}
	</g>;
	const leg = (l: Built['legN'], far: boolean) => <g filter={ts}>
		<path d={l.thigh} fill={F(far ? pal.robeS : pal.trousers)} {...st} />
		<path d={l.shin} fill={F(far ? pal.robeS : pal.wrap)} {...st} />
		{!sil && <path d={l.wraps} stroke="#1A140F" strokeWidth={0.45} opacity={0.55} fill="none" />}
		<path d={l.shoe} fill={F(pal.shoe)} {...st} />
	</g>;
	const woman = P0.kind === 'woman';
	return <g>
		<defs><clipPath id={`${id}hc`}><path d={b.armN.hand} /></clipPath><clipPath id={`${id}fc`}><path d={FACE(woman ? 11.2 : 12)} /></clipPath></defs>
		{arm(b.armF, true, b.flapF)}
		{leg(b.legF, true)}{leg(b.legN, false)}
		<path d={b.skirt} fill={F(pal.robe)} filter={tl} {...st} />
		{!sil && <path d={b.skirt} fill="none" stroke={pal.robeS} strokeWidth={0.5} opacity={0.5} />}
		<path d={b.torso} fill={F(pal.robe)} filter={tl} {...st} />
		{b.cuirass ? <g filter={tl}><path d={b.cuirass} fill={sil ? silC ?? SIL : `url(#${p}lam)`} /></g> : null}
		{b.cuirass && !sil && <path d={b.cuirass} fill="none" stroke="#0E0B0A" strokeWidth={0.6} />}
		{!b.cuirass && <path d={b.belt} fill={F('#1E1612')} />}
		<path d={b.collar} fill={F(woman ? pal.trim : pal.robeS)} />
		{b.scarf && <path d={b.scarf} fill={F(pal.trim)} />}
		{/* the head */}
		<g transform={b.headT}>
			{woman ? <path d={HEADP.bunW} fill={F(pal.hair)} /> : P0.kind === 'farmer' ? null : <>
				<path d={ribbon(HEADP.braid, () => 1.3)} fill={F(pal.hair)} />
				<path d={HEADP.bunM} fill={F(pal.hair)} />
				<path d={HEADP.ribbon} fill={F(pal.band ?? pal.trim)} /></>}
			<g filter={tl}><path d={FACE(woman ? 11.2 : 12)} fill={F(pal.skin)} {...st} /></g>
			{!sil && <g clipPath={`url(#${id}fc)`}>
				<path d={HEADP.jaw} fill="none" stroke={pal.skinS} strokeWidth={0.7} opacity={0.6} />
				<path d="M10.2,-23.4 L9.6,-22.2 L12,-17.4 L11.2,-17.2 L9.2,-21.6 Z" fill={pal.skinH} opacity={0.65} />
				<path d="M7.4,-31.2 C9.4,-29 10.2,-26.4 10.1,-23.6 L9.2,-23.6 C9.2,-26 8.4,-28.6 6.6,-30.4 Z" fill={pal.skinH} opacity={0.55} />
				<path d="M10.4,-12.8 C10.5,-11.2 10,-9.4 8.2,-8.9 L8.2,-10 C9.2,-10.6 9.5,-11.6 9.5,-12.8 Z" fill={pal.skinH} opacity={0.5} />
			</g>}
			<path d={woman ? HEADP.hairW : HEADP.hairM} fill={F(pal.hair)} />
			{P0.kind === 'farmer' && <path d={HEADP.wrap} fill={F('#141210')} />}
			{woman && !sil && <path d={HEADP.pin} stroke="#C9A46A" strokeWidth={0.5} />}
			{P0.old && !sil && <path d="M-9,-30 C-6,-33.4 0,-34.6 5,-32.4 M-10.6,-26 C-8,-31 -2,-33 4,-31.6 M-11,-21 C-9,-27 -4,-30.6 2,-30" fill="none" stroke="#9A948C" strokeWidth={0.45} opacity={0.75} />}
			<path d={HEADP.ear} fill={F(pal.skin)} {...st} />
			{!sil && <>
				<path d={HEADP.ear} fill={pal.skinS} opacity={0.45} />
				<path d={HEADP.eye} fill={eye ?? '#1A100C'} />
				<path d={HEADP.lid} fill="none" stroke={pal.line} strokeWidth={0.45} />
				<path d={HEADP.brow} fill="none" stroke={pal.hair} strokeWidth={0.75} strokeLinecap="round" />
				<path d={HEADP.mouth} fill="none" stroke={pal.line} strokeWidth={0.4} strokeLinecap="round" />
				{P0.moust && <path d={HEADP.moust} fill={pal.hair} />}
				{P0.old && <path d="M9.4,-18.6 C8.4,-17.2 8.2,-15.6 8.6,-14.4 M6.2,-20.2 C7,-19.7 7.9,-19.7 8.6,-20.1" fill="none" stroke={pal.skinS} strokeWidth={0.4} opacity={0.8} />}
			</>}
		</g>
		{arm(b.armN, false, b.flapN)}
	</g>; };

/* ---------- the 牍 ---------- */
export const DuA: React.FC<{age?: number; cols?: number; glow?: number; id: string}> = ({age = 0, cols = 3, glow = 1, id}) => <g>
	<defs>
		<radialGradient id={`${id}g`}><stop offset="0" stopColor="#FFE8B8" stopOpacity={0.62 * glow} /><stop offset="0.3" stopColor="#FFD08A" stopOpacity={0.22 * glow} /><stop offset="1" stopColor="#FFC27A" stopOpacity="0" /></radialGradient>
		<linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={age ? '#22170F' : '#D9BC86'} /><stop offset="0.5" stopColor={age ? '#3A2A1C' : '#F6E2B4'} /><stop offset="1" stopColor={age ? '#1A120C' : '#C7A671'} /></linearGradient>
	</defs>
	{glow > 0 && <ellipse cx={0} cy={-DU_L / 2} rx={DU_L * 0.95} ry={DU_L * 1.05} fill={`url(#${id}g)`} />}
	<path d={DU_OUT} fill={`url(#${id}w)`} />
	{age > 0 && Array.from({length: 5}, (_, i) => <path key={i} d={`M${f2(-DU_W / 2 + 0.4 + i * 0.66)},-0.6 C${f2(-DU_W / 2 + 0.6 + i * 0.66)},${-DU_L * 0.4} ${f2(-DU_W / 2 + 0.2 + i * 0.66)},${-DU_L * 0.7} ${f2(-DU_W / 2 + 0.5 + i * 0.66)},${-DU_L + 0.6}`} stroke="#0C0806" strokeWidth={0.12} opacity={0.6} fill="none" />)}
	<path d={duMarks(cols, 3)} stroke={age ? '#0A0604' : '#2A1A0E'} strokeWidth={age ? 0.36 : 0.3} strokeLinecap="round" fill="none" opacity={age ? 0.75 : 0.9} />
	<path d={`M${DU_W / 2 - 0.25},-0.3 L${DU_W / 2 - 0.25},${-DU_L + 0.3}`} stroke={age ? '#C08A52' : '#FFF6DE'} strokeWidth={0.32} opacity={age ? 0.7 : 0.8} />
</g>;
/** a brush (毛笔): bamboo shaft and a dark tip, from a (end) to b (tip) */
export const Brush: React.FC<{a: P; b: P; k?: number}> = ({a, b}) => { const tip = lp(b, a, 0.15);
	return <g><path d={tube(a, tip, 0.42, 0.42)} fill="#8A6A40" /><path d={tube(tip, b, 0.5, 0.12)} fill="#120C08" /></g>; };

/* ---------- fire ---------- */
export const Fire: React.FC<{x: number; y: number; s: number; t?: number; ids: string}> = ({x, y, s, t = 0, ids}) => {
	const tongues = [[-46, 150, -0.2], [-20, 250, 0.05], [8, 300, 0.12], [34, 210, 0.3], [-62, 96, -0.4], [58, 120, 0.5], [-4, 190, -0.1]];
	return <g>
		<defs><radialGradient id={`${ids}fg`}><stop offset="0" stopColor="#FFC27A" stopOpacity="0.55" /><stop offset="0.25" stopColor="#FF9A4A" stopOpacity="0.22" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient></defs>
		<circle cx={x} cy={y - 120 * s} r={560 * s} fill={`url(#${ids}fg)`} />
		{/* logs */}
		<g fill="#1C120C"><path d={tube([x - 130 * s, y + 10 * s], [x + 60 * s, y - 30 * s], 15 * s, 13 * s)} /><path d={tube([x + 120 * s, y + 14 * s], [x - 50 * s, y - 34 * s], 14 * s, 12 * s)} />
			<path d={tube([x - 20 * s, y + 24 * s], [x + 10 * s, y - 40 * s], 12 * s, 10 * s)} /></g>
		<path d={tube([x - 110 * s, y + 4 * s], [x + 50 * s, y - 30 * s], 4 * s, 3 * s)} fill="#E8742C" opacity={0.7} />
		{tongues.map(([dx, h, l], i) => { const w = Math.sin(t * 9 + i * 1.7) * 8 * s, bx = x + dx * s, hh = h * s * (1 + 0.08 * Math.sin(t * 13 + i));
			const T = (k: number, c: string, ww: number) => <path key={k} d={`M${f2(bx - ww * s)},${f2(y)} C${f2(bx - ww * 1.1 * s)},${f2(y - hh * 0.35 * k)} ${f2(bx + l * hh * 0.3 * k + w)},${f2(y - hh * 0.6 * k)} ${f2(bx + l * hh * 0.45 * k + w * 1.4)},${f2(y - hh * k)} C${f2(bx + ww * 0.5 * s + w)},${f2(y - hh * 0.55 * k)} ${f2(bx + ww * 1.2 * s)},${f2(y - hh * 0.3 * k)} ${f2(bx + ww * s)},${f2(y)} Z`} fill={c} />;
			return <g key={i}>{T(1, '#E8682A', 30)}{T(0.72, '#FFA848', 20)}{T(0.42, '#FFE6AE', 11)}</g>; })}
		<ellipse cx={x} cy={y + 4 * s} rx={120 * s} ry={22 * s} fill="#FFD08A" opacity={0.5} />
		{Array.from({length: 16}, (_, i) => { const px = x + (rnd(i, 1) - 0.5) * 260 * s, py = y - 200 * s - rnd(i, 2) * 380 * s; return <circle key={i} cx={px} cy={py} r={(1.4 + rnd(i, 3) * 2) * s} fill="#FFD9A0" opacity={0.3 + rnd(i, 4) * 0.6} />; })}
	</g>; };

/* ---------- small set pieces ---------- */
const tent = (x: number, y: number, w: number, h: number, dep: number) => `M${x - w / 2},${y} L${x},${y - h} L${x + dep},${y - h - dep * 0.18} L${x + w / 2 + dep},${y - dep * 0.18} L${x + w / 2},${y} Z`;
const banner = (x: number, y: number, h: number, fw: number, fh: number, wave: number) => `M${x - 1.6},${y} L${x - 1.6},${y - h} L${x + 1.6},${y - h} L${x + 1.6},${y} Z M${x + 1.6},${y - h + 6} L${x + fw},${y - h + 4 + wave} L${x + fw + wave * 0.5},${y - h + fh} L${x + fw * 0.66},${y - h + fh - 6} L${x + fw * 0.4},${y - h + fh + 2} L${x + 1.6},${y - h + fh - 4} Z`;

/* ============================== beat 1: the camp at night ============================== */
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>{children}</svg>;
const at = (x: number, y: number, k: number, flip = false) => `translate(${x},${y}) scale(${flip ? -k : k},${k})`;
export const Look1: React.FC = () => { const S = B1, hb = build(S.heifu.pose), jb = build(S.jing.pose), hf = S.heifu;
	const duP: P = [hf.x + S.du.at[0] * hf.k, hf.y + S.du.at[1] * hf.k];
	/* the mid-ground group: three seated soldiers round a second fire */
	const npcs = [{x: 200, y: 776, k: 2.2, pose: {kind: 'soldier', seat: 'log', lean: 8, neck: 6, thN: 78, shN: 8, thF: 84, shF: 14, hN: [34, 2], hF: [28, 4]} as Pose},
		{x: 548, y: 780, k: 2.2, flip: true, pose: {kind: 'armour', seat: 'log', lean: 14, neck: 10, thN: 76, shN: 10, thF: 80, shF: 14, hN: [36, -4], hF: [30, 0]} as Pose}];
	return <Svg>
		<defs>
			<linearGradient id="a1sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E171D" /><stop offset="0.5" stopColor="#18262C" /><stop offset="0.62" stopColor="#2E3A38" /></linearGradient>
			<linearGradient id="a1gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A231E" /><stop offset="1" stopColor="#120D0A" /></linearGradient>
			<radialGradient id="a1pool" cx="1530" cy="1000" r="900" gradientUnits="userSpaceOnUse" gradientTransform="translate(1530 1000) scale(1 0.42) translate(-1530 -1000)"><stop offset="0" stopColor="#FFB060" stopOpacity="0.55" /><stop offset="0.4" stopColor="#C8743A" stopOpacity="0.2" /><stop offset="1" stopColor="#C8743A" stopOpacity="0" /></radialGradient>
			<radialGradient id="a1warm" cx="1530" cy="820" r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FF9A50" stopOpacity="0.32" /><stop offset="0.5" stopColor="#B05A2A" stopOpacity="0.1" /><stop offset="1" stopColor="#B05A2A" stopOpacity="0" /></radialGradient>
			<linearGradient id="a1haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#56645E" stopOpacity="0" /><stop offset="0.6" stopColor="#56645E" stopOpacity="0.42" /><stop offset="1" stopColor="#56645E" stopOpacity="0" /></linearGradient>
			<radialGradient id="a1vig" cx="0.55" cy="0.55" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<radialGradient id="a1df"><stop offset="0" stopColor="#FFC27A" stopOpacity="0.7" /><stop offset="0.3" stopColor="#FF9A4A" stopOpacity="0.2" /><stop offset="1" stopColor="#FF9A4A" stopOpacity="0" /></radialGradient>
			<filter id="a1b3" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="2.6" /></filter>
			<filter id="a1b8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
			<filter id="a1b1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1" /></filter>
			<RimF id="a1rimFar" lx={1} ly={-0.4} k={1.6} c={RIMW} o={0.7} />
			<RimF id="a1rimLog" lx={1} ly={-0.6} k={3} c="#FFB070" o={0.85} lx2={-0.6} ly2={-1} k2={2} c2={ACC} o2={0.4} />
			<FigDefs p="a1" />
		</defs>
		<rect width={W} height={H} fill="url(#a1sky)" />
		{Array.from({length: 40}, (_, i) => { const x = 1100 + rnd(i, 1) * 820, y = 40 + rnd(i, 2) * 420; return <circle key={i} cx={x} cy={y} r={0.7 + rnd(i, 3)} fill="#DDE6E0" opacity={0.2 + rnd(i, 4) * 0.45} />; })}
		{/* P1 far: low wooded ridge across the 淮 plain, hazed */}
		<g filter="url(#a1b3)"><path d="M-20,600 C200,570 380,586 560,572 C760,556 980,580 1180,566 C1380,552 1620,578 1940,560 L1940,680 L-20,680 Z" fill="#1C2626" />
			{Array.from({length: 30}, (_, i) => <ellipse key={i} cx={i * 68 + rnd(i, 5) * 30} cy={580 - rnd(i, 6) * 18} rx={30 + rnd(i, 7) * 26} ry={18 + rnd(i, 8) * 12} fill="#1C2626" />)}</g>
		<rect y={520} width={W} height={180} fill="url(#a1haze)" />
		{/* the camp: rows of tents, the palisade, black 秦 banners, far fires and their smoke */}
		<g fill="#1A1513" filter="url(#a1rimFar)">
			{Array.from({length: 26}, (_, i) => { const x = 20 + i * 76 + rnd(i, 9) * 40, y = 650 + rnd(i, 10) * 12, s2 = 0.7 + rnd(i, 11) * 0.5; return rnd(i, 13) < 0.18 ? null : <path key={i} d={tent(x, y, 70 * s2, 44 * s2, 26 * s2)} />; })}
			{Array.from({length: 120}, (_, i) => <rect key={i} x={i * 16.4} y={658 - (i % 3)} width={3.2} height={22 + (i % 3) * 2} />)}
			<rect x={0} y={666} width={W} height={4} />
			{[[300, 664, 150, 30, 58, 3], [980, 664, 170, 34, 64, -2], [1240, 664, 150, 30, 56, 4], [1820, 664, 160, 32, 60, 2]].map(([x, y, h, fw, fh, wv], i) => <path key={i} d={banner(x, y, h, fw, fh, wv)} />)}
		</g>
		{[[180, 664, 1], [720, 660, 0.8], [1700, 664, 1.1], [1120, 662, 0.7]].map(([x, y, s], i) => <g key={i}>
			<circle cx={x} cy={y - 4} r={70 * s} fill="url(#a1df)" />
			<path d={`M${x - 4 * s},${y} C${x - 5 * s},${y - 8 * s} ${x},${y - 12 * s} ${x + 1},${y - 18 * s} C${x + 3 * s},${y - 10 * s} ${x + 5 * s},${y - 6 * s} ${x + 4 * s},${y} Z`} fill="#FFD08A" />
			<path d={`M${x},${y - 20} C${x - 14},${y - 80} ${x + 26},${y - 140} ${x + 10},${y - 230}`} stroke="#4A5250" strokeWidth={16 * s} strokeLinecap="round" fill="none" opacity={0.22} filter="url(#a1b8)" /></g>)}
		{/* the ground */}
		<rect y={676} width={W} height={H - 676} fill="url(#a1gnd)" />
		<rect width={W} height={H} fill="url(#a1warm)" />
		<rect y={676} width={W} height={H - 676} fill="url(#a1pool)" />
		{/* P2 mid: soldiers round another fire, sentries with 戈 at the palisade */}
		<g fill={SIL} filter="url(#a1rimFar)">
			<Npc x={96} y={676} k={0.4} kind="ji" /><Npc x={128} y={677} k={0.4} kind="ji" /><Npc x={1330} y={674} k={0.38} kind="ji" flip /><Npc x={760} y={676} k={0.4} kind="torch" />
		</g>
		<Fire x={374} y={796} s={0.26} ids="a1f2" />
		{npcs.map((n, i) => { const b = build(n.pose); return <g key={i} transform={at(n.x, n.y, n.k, n.flip)} filter="url(#a1rimS)"><FigA b={b} pal={SOLDIER} p="a1" id={`a1n${i}`} sil /></g>; })}
		{/* P3 near: the log and the stone, the two brothers, the fire */}
		<g filter="url(#a1rimLog)">
			<path d="M560,1080 L540,930 C540,904 560,892 600,892 L790,890 C820,890 834,904 834,930 L850,1080 Z" fill="#241A14" />
			<path d={`M760,1090 C756,1010 770,950 820,936 C900,926 1080,930 1200,934 C1250,936 1270,970 1268,1090 Z`} fill="#2A1E16" />
		</g>
		<path d="M820,950 C900,940 1080,944 1200,948" stroke="#FFB070" strokeOpacity={0.25} strokeWidth={3} fill="none" />
		{/* a 釜 on three stones by the fire, a water jar */}
		<g filter="url(#a1rimLog)"><path d="M1300,1012 C1296,990 1310,972 1336,970 C1362,972 1376,990 1372,1012 Z" fill="#1E1714" /><rect x={1324} y={960} width={24} height={12} rx={3} fill="#1E1714" /></g>
		<g transform={at(S.jing.x, S.jing.y, S.jing.k)} filter="url(#a1rimH)"><FigA b={jb} pal={ARMOUR} p="a1" id="a1j" /></g>
		<g transform={at(hf.x, hf.y, hf.k)} filter="url(#a1rimH)">
			<FigA b={hb} pal={SOLDIER} p="a1" id="a1h" />
		</g>
		{/* the 牍 on his knee and the brush in his hand, over the figure */}
		<g transform={`translate(${duP[0]},${duP[1]}) rotate(${S.du.tilt}) scale(${hf.k * S.du.s})`}><DuA id="a1du" cols={3} /></g>
		<g transform={at(hf.x, hf.y, hf.k)}>
			<Brush a={S.brush.a} b={S.brush.b} />
			<path d={hb.armN.hand} fill={SOLDIER.skin} /><path d={hb.armN.hand} fill={SOLDIER.skinH} opacity={0.4} transform="translate(0.8,-0.6)" />
		</g>
		<Fire x={S.fire.x} y={S.fire.y} s={S.fire.s} ids="a1f" />
		<rect width={W} height={H} fill="url(#a1vig)" />
	</Svg>; };

/* ============================== beat 2: home, 安陆, dusk ============================== */
export const Look2: React.FC = () => { const S = B2, mb = build(S.mother.pose), zb = build(S.zhong.pose), m = S.mother;
	const duP: P = [m.x - S.du.at[0] * m.k, m.y + S.du.at[1] * m.k];
	return <Svg>
		<defs>
			<linearGradient id="a2sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16222C" /><stop offset="0.42" stopColor="#3A4650" /><stop offset="0.62" stopColor="#8C7464" /><stop offset="0.7" stopColor="#C8905E" /></linearGradient>
			<radialGradient id="a2sun" cx="260" cy="640" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFC27A" stopOpacity="0.5" /><stop offset="0.4" stopColor="#E09060" stopOpacity="0.16" /><stop offset="1" stopColor="#E09060" stopOpacity="0" /></radialGradient>
			<linearGradient id="a2gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A3028" /><stop offset="1" stopColor="#17110D" /></linearGradient>
			<linearGradient id="a2wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4E3E30" /><stop offset="1" stopColor="#2E241C" /></linearGradient>
			<radialGradient id="a2du" cx={duP[0]} cy={duP[1] - 60} r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFD9A0" stopOpacity="0.55" /><stop offset="0.3" stopColor="#FFB870" stopOpacity="0.2" /><stop offset="1" stopColor="#FFB870" stopOpacity="0" /></radialGradient>
			<linearGradient id="a2haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B08A70" stopOpacity="0" /><stop offset="0.6" stopColor="#B08A70" stopOpacity="0.35" /><stop offset="1" stopColor="#B08A70" stopOpacity="0" /></linearGradient>
			<radialGradient id="a2vig" cx="0.55" cy="0.5" r="0.78"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
			<filter id="a2b3" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3" /></filter>
			<filter id="a2b10" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
			<RimF id="a2rimSky" lx={-1} ly={-0.6} k={2} c="#F2B880" o={0.7} />
			<RimF id="a2rimDu" lx={-1} ly={-0.3} k={2.4} c="#FFD9A0" o={0.6} lx2={0} ly2={-1} k2={1.6} c2="#D8B898" o2={0.4} />
			<FigDefs p="a2" />
		</defs>
		<rect width={W} height={H} fill="url(#a2sky)" />
		<rect width={W} height={H} fill="url(#a2sun)" />
		{/* far hills and the village: roofs, kitchen smoke */}
		<g filter="url(#a2b3)"><path d="M-20,640 C160,600 340,590 520,612 C700,580 900,586 1080,606 C1300,580 1560,590 1940,600 L1940,700 L-20,700 Z" fill="#4A4448" />
			<path d="M-20,668 C300,650 700,652 1100,660 L1100,700 L-20,700 Z" fill="#3A3436" />
			{[[120, 666], [210, 660], [600, 664], [700, 668]].map(([x, y], i) => <path key={i} d={`M${x - 36},${y} L${x - 30},${y - 18} L${x + 30},${y - 18} L${x + 36},${y} Z`} fill="#2E282A" />)}</g>
		{[[205, 640], [610, 644]].map(([x, y], i) => <path key={i} d={`M${x},${y} C${x - 20},${y - 80} ${x + 40},${y - 150} ${x + 20},${y - 260}`} stroke="#C8B8A8" strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.18} filter="url(#a2b10)" />)}
		<rect y={560} width={W} height={160} fill="url(#a2haze)" />
		{/* the courtyard wall (夯土) with its thatch coping, a mulberry behind it */}
		<g fill="#1E1714" filter="url(#a2rimSky)">
			<path d="M700,620 C690,560 720,500 780,480 C800,430 880,420 920,450 C980,430 1040,470 1030,520 C1070,560 1040,610 1000,620 Z" />
			<path d="M846,700 L852,600 L862,600 L868,700 Z" />
			<path d="M-20,690 L-20,640 L1110,640 L1110,690 Z" /><path d="M-30,644 C300,628 800,628 1120,640 L1120,630 C800,616 300,614 -30,630 Z" />
		</g>
		{Array.from({length: 4}, (_, i) => <path key={i} d={`M-20,${652 + i * 10} L1110,${652 + i * 10}`} stroke="#000" strokeOpacity={0.25} strokeWidth={1.2} />)}
		<rect y={688} width={W} height={H - 688} fill="url(#a2gnd)" />
		{/* the well with its 桔槔: a post, the lever (bucket end over the well), the counterweight stone */}
		<g fill="#191311" filter="url(#a2rimSky)">
			<path d="M320,850 C320,830 380,822 440,822 C500,822 560,830 560,850 L556,900 C530,914 350,914 324,900 Z" />
			<path d="M640,900 L646,560 L660,560 L666,900 Z" /><path d="M634,566 L672,566 L668,548 L638,548 Z" />
			<path d="M372,424 L900,676 L896,686 L368,434 Z" />
			<path d="M876,664 C900,652 932,664 932,688 C930,712 896,716 880,704 C868,694 866,674 876,664 Z" />
			<path d="M372,430 L428,780 L432,779 L376,429 Z" /><path d="M412,780 L448,780 L444,812 L416,812 Z" />
		</g>
		{/* the house: rammed-earth walls in courses, a deep thatch roof, the dark doorway, the raised step */}
		<path d="M1060,930 L1060,470 L1960,470 L1960,930 Z" fill="url(#a2wall)" />
		{Array.from({length: 18}, (_, i) => <path key={i} d={`M1060,${492 + i * 25} L1960,${492 + i * 25 + (i % 2 ? 1 : -1)}`} stroke="#000" strokeOpacity={0.2} strokeWidth={1.4} />)}
		{Array.from({length: 18}, (_, i) => <path key={'h' + i} d={`M1060,${494 + i * 25} L1960,${494 + i * 25}`} stroke="#F2C890" strokeOpacity={0.05} strokeWidth={1} />)}
		<path d="M1250,930 L1250,580 L1520,580 L1520,930 Z" fill="#0E0A08" />
		<path d="M1250,580 L1520,580 L1520,600 L1250,600 Z" fill="#2A1E16" />
		<path d="M1500,930 L1500,600 L1560,612 L1560,930 Z" fill="#3A2A1E" /><path d="M1500,600 L1560,612 L1560,618 L1500,606 Z" fill="#F2C890" opacity={0.2} />
		<path d="M1700,700 L1820,700 L1820,770 L1700,770 Z" fill="#120C0A" />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1712 + i * 22} y={700} width={5} height={70} fill="#3A2A1E" />)}
		<g filter="url(#a2rimSky)"><path d="M990,512 C1000,498 1060,470 1160,410 C1240,362 1300,330 1340,300 L1960,300 L1960,526 C1700,540 1300,538 1000,530 C984,528 982,518 990,512 Z" fill="#3A2C1E" /></g>
		{Array.from({length: 70}, (_, i) => { const u = i / 69, x0 = 1000 + u * 960, x1 = 1340 + u * 620; return <path key={i} d={`M${f2(x0 + (rnd(i, 1) - 0.5) * 8)},${f2(528 + rnd(i, 2) * 6)} L${f2(x1 + (rnd(i, 3) - 0.5) * 14)},${300 + rnd(i, 4) * 60}`} stroke={i % 3 ? '#1E160E' : '#6A5236'} strokeOpacity={i % 3 ? 0.4 : 0.35} strokeWidth={1.6} />; })}
		<path d="M992,520 C1300,534 1700,538 1960,526 L1960,540 C1700,552 1300,548 992,532 Z" fill="#1A120C" />
		<path d="M1000,520 C1300,530 1700,534 1960,522" stroke="#F2B880" strokeOpacity={0.3} strokeWidth={3} fill="none" />
		<path d="M1040,930 L1980,930 L1980,1000 L1020,1000 Z" fill="#2A2018" /><path d="M1040,930 L1980,930 L1980,936 L1040,936 Z" fill="#F2C890" opacity={0.15} />
		<rect width={W} height={H} fill="url(#a2du)" />
		<path d="M1240,995 L1560,995 L1580,1004 L1220,1004 Z" fill="#4A3826" />
		{/* the bundle of cloth by the door (the family's answer to "send cloth"): a folded bolt on the step */}
		<g filter="url(#a2rimDu)"><path d="M1590,994 L1596,948 C1640,940 1700,940 1744,948 L1750,994 Z" fill="#5A4A3A" /><path d="M1596,958 C1640,950 1700,950 1744,958" stroke="#2E241C" strokeWidth={2} fill="none" /><path d="M1596,972 C1640,964 1700,964 1744,972" stroke="#2E241C" strokeWidth={2} fill="none" /></g>
		{/* the two of them */}
		<g transform={at(S.zhong.x, S.zhong.y, S.zhong.k)} filter="url(#a2rimH)"><FigA b={zb} pal={FARMER} p="a2" id="a2z" /></g>
		<g transform={at(m.x, m.y, m.k, true)} filter="url(#a2rimH)"><FigA b={mb} pal={MOTHER} p="a2" id="a2m" /></g>
		<g transform={`translate(${duP[0]},${duP[1]}) rotate(${-S.du.tilt}) scale(${m.k * S.du.s})`}><DuA id="a2du" cols={4} glow={1.4} /></g>
		<g transform={at(m.x, m.y, m.k, true)}><path d={mb.armN.hand} fill={MOTHER.skin} /><path d={mb.armN.hand} fill={MOTHER.skinH} opacity={0.45} transform="translate(0.6,-0.6)" /></g>
		<rect width={W} height={H} fill="url(#a2vig)" />
	</Svg>; };

/* ============================== beat 3: 睡虎地 4号墓, 1975–76 ============================== */
/** a gloved hand seen from above, palm up, fingers (one mitten) pointing away (−y); wrist at 0, cm. The sleeve runs to +y.
    left: the thumb on the −x side (a left hand), else +x. Returns the parts so the board can sit between palm and thumb. */
export const GLOVE = {
	sleeve: 'M-6.4,3 C-7.4,14 -9,30 -11,52 L13,52 C11,30 8.8,14 7.2,3 Z',
	cuff: 'M-4.6,0 L4.8,0 L5.6,4.6 L-5.4,4.6 Z',
	palm: 'M-3.8,0.4 C-4.4,-4 -4.5,-9 -4.3,-13.6 C-4.2,-15.4 -2.4,-16.4 0,-16.4 C2.4,-16.4 4.2,-15.4 4.3,-13.6 C4.5,-9 4.4,-4 3.8,0.4 Z',
	hollow: 'M-2.4,-2.4 C-3,-4.6 -2.6,-6.8 -1,-7.4 C1,-7.6 2.6,-6.4 2.8,-4.2 C2.6,-2.6 1.4,-1.8 0,-1.8 C-1.2,-1.8 -2,-2 -2.4,-2.4 Z',
	crease: 'M-4.2,-9.6 C-1.6,-10.4 1.6,-10.4 4.2,-9.6',
	/* the fingers curled up over the board's far edge (one rounded band, no separate fingertips) */
	curl: 'M-4.2,-14.6 C-4.3,-15.6 -2.4,-16.2 0,-16.2 C2.4,-16.2 4.3,-15.6 4.2,-14.6 C2.4,-13.9 -2.4,-13.9 -4.2,-14.6 Z',
	thumb: 'M4,-2.4 C6.6,-4 8.4,-7 8.8,-10.6 C9,-13.2 8.2,-15 6.8,-15.2 C5.4,-15.2 4.8,-13.6 4.8,-11.4 C4.6,-8.8 4,-6.4 3.2,-5 Z',
};
/** a Han/Qin lacquer 耳杯: oval cup with two flat ears; black outside, cinnabar inside */
export const EarCup: React.FC<{x: number; y: number; s: number; ang: number; out: string; inn: string; rim?: string}> = ({x, y, s, ang, out, inn, rim = '#E0A070'}) => <g transform={`translate(${x},${y}) rotate(${ang}) scale(${s})`}>
	<path d="M-60,0 C-60,-26 -30,-38 0,-38 C30,-38 60,-26 60,0 C60,26 30,38 0,38 C-30,38 -60,26 -60,0 Z" fill={out} />
	<path d="M-24,-36 C-20,-52 20,-52 24,-36 Z M-24,36 C-20,52 20,52 24,36 Z" fill={out} />
	<path d="M-50,0 C-50,-20 -26,-30 0,-30 C26,-30 50,-20 50,0 C50,20 26,30 0,30 C-26,30 -50,20 -50,0 Z" fill={inn} />
	<path d="M-50,0 C-50,-20 -26,-30 0,-30 C26,-30 50,-20 50,0" fill="none" stroke={rim} strokeWidth={2} opacity={0.5} />
</g>;
/** the 马灯 (hurricane lantern) of the 1970s dig: base, glass globe, guard wires, top cap and the bail */
export const Lantern: React.FC<{x: number; y: number; s: number; body: string; glass: string; flame: string}> = ({x, y, s, body, glass, flame}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<path d="M-46,0 L46,0 L42,-26 L-42,-26 Z" fill={body} />
	<path d="M-30,-26 C-44,-60 -44,-100 -26,-128 L26,-128 C44,-100 44,-60 30,-26 Z" fill={glass} />
	<path d="M-4,-50 C-8,-60 -2,-72 0,-82 C3,-72 8,-60 4,-50 Z" fill={flame} />
	<path d="M-34,-26 C-48,-62 -48,-98 -30,-130 M34,-26 C48,-62 48,-98 30,-130 M0,-26 L0,-130" stroke={body} strokeWidth={3.4} fill="none" />
	<path d="M-36,-128 L36,-128 L28,-150 L-28,-150 Z" fill={body} /><path d="M-14,-150 L14,-150 L10,-162 L-10,-162 Z" fill={body} />
	<path d="M-40,-140 C-50,-200 50,-200 40,-140" stroke={body} strokeWidth={3} fill="none" />
</g>;
export const Look3: React.FC = () => { const D = B3.du, L: P = [1530, 400], k = D.k;
	/* the hands, wrist positions (px) and angle; each thumb crosses the board's near (lower) edge */
	const HL = {x: 830, y: 905, a: 6}, HR = {x: 1150, y: 880, a: -8};
	const hand = (h: {x: number; y: number; a: number}, left: boolean, part: 'under' | 'thumb') => <g transform={`translate(${h.x},${h.y}) rotate(${h.a}) scale(${left ? -k : k},${k})`}>
		{part === 'under' ? <g>
			<path d={GLOVE.sleeve} fill="#2E4A62" filter="url(#a3t)" />
			<path d="M-6.4,3 C-7.4,14 -9,30 -11,52 L-6,52 C-4,30 -3,14 -2.4,3 Z" fill="#1A2C3C" opacity={0.7} />
			<path d={GLOVE.cuff} fill="#C8C0B2" />
			<path d={GLOVE.palm} fill="#E8E2D6" filter="url(#a3t)" />
			<path d={GLOVE.hollow} fill="#B8B0A2" opacity={0.3} />
			<path d={GLOVE.crease} stroke="#9A9284" strokeWidth={0.22} fill="none" opacity={0.7} />
		</g> : <g><path d={GLOVE.thumb} fill="#ECE6DA" filter="url(#a3t)" /><path d="M6.8,-15.2 C5.4,-15.2 4.8,-13.6 4.8,-11.4 L5.6,-11.4 C5.8,-13 6.2,-14.4 7.2,-14.8 Z" fill="#FFFFFF" opacity={0.6} /></g>}
	</g>;
	return <Svg>
		<defs>
			<linearGradient id="a3wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#140E0B" /><stop offset="0.6" stopColor="#261A13" /><stop offset="1" stopColor="#34241A" /></linearGradient>
			<radialGradient id="a3lamp" cx={L[0]} cy={L[1]} r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFD9A0" stopOpacity="0.5" /><stop offset="0.3" stopColor="#F0B070" stopOpacity="0.22" /><stop offset="0.65" stopColor="#B07040" stopOpacity="0.06" /><stop offset="1" stopColor="#B07040" stopOpacity="0" /></radialGradient>
			<radialGradient id="a3lg"><stop offset="0" stopColor="#FFF0D0" stopOpacity="0.85" /><stop offset="0.25" stopColor="#FFD9A0" stopOpacity="0.25" /><stop offset="1" stopColor="#FFD9A0" stopOpacity="0" /></radialGradient>
			<radialGradient id="a3vig" cx="0.55" cy="0.55" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.72" /></radialGradient>
			<filter id="a3b4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
			<filter id="a3b8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
			<RimF id="a3rim" lx={0.7} ly={-0.7} k={2.6} c="#FFD9A0" o={0.85} lx2={-0.8} ly2={0.3} k2={2.2} c2={ACC} o2={0.7} />
			<RimF id="a3rimO" lx={0.7} ly={-0.7} k={2} c="#FFC890" o={0.6} />
			<ToonDefs id="a3t" d={3.2} c="#283038" o={0.4} lx={0.6} ly={-0.8} />
		</defs>
		<rect width={W} height={H} fill="url(#a3wood)" />
		{/* the 椁 seen from above: thick floor boards running away from us, the side wall and its top edge, the partition of the 头箱 */}
		{Array.from({length: 9}, (_, i) => { const x = -160 + i * 270; return <g key={i}>
			<path d={`M${x},${H + 20} L${x + 120},236 L${x + 380},236 L${x + 270},${H + 20} Z`} fill={i % 2 ? '#2A1D15' : '#231810'} />
			<path d={`M${x},${H + 20} L${x + 120},236`} stroke="#0A0605" strokeWidth={5} />
			{Array.from({length: 5}, (_, j) => <path key={j} d={`M${x + 40 + j * 46},${H + 20} C${x + 90 + j * 40},700 ${x + 140 + j * 44},420 ${x + 160 + j * 42},236`} stroke="#120C08" strokeOpacity={0.32} strokeWidth={1.4} fill="none" />)}</g>; })}
		<path d="M-20,-20 L1960,-20 L1960,236 L-20,236 Z" fill="#150F0B" />
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M-20,${14 + i * 26} L1960,${18 + i * 26}`} stroke="#060403" strokeOpacity={0.55} strokeWidth={2.4} />)}
		<path d="M-20,236 L1960,236 L1960,262 L-20,262 Z" fill="#33241A" /><path d="M-20,236 L1960,236 L1960,241 L-20,241 Z" fill="#FFD9A0" opacity={0.12} />
		<rect width={W} height={H} fill="url(#a3lamp)" />
		{/* grave goods of the 头箱: lacquer 耳杯, a round 漆奁, a wooden comb, a pottery jar — kept low and to the sides */}
		<g filter="url(#a3rimO)">
			<EarCup x={300} y={640} s={1.25} ang={-18} out="#1A0E0C" inn="#7E2418" />
			<EarCup x={420} y={850} s={1.05} ang={14} out="#1A0E0C" inn="#6E2016" />
			<g transform="translate(1600,860)"><ellipse cx={0} cy={0} rx={160} ry={96} fill="#140A08" /><ellipse cx={0} cy={-16} rx={160} ry={96} fill="#221110" />
				<ellipse cx={0} cy={-16} rx={124} ry={72} fill="none" stroke="#7E2418" strokeWidth={8} /><ellipse cx={0} cy={-16} rx={88} ry={50} fill="none" stroke="#7E2418" strokeWidth={3} opacity={0.8} />
				<path d="M-60,-30 C-40,-50 -10,-40 0,-20 C10,0 40,6 60,-10" stroke="#A04632" strokeWidth={3} fill="none" opacity={0.7} /></g>
			<g transform="translate(1760,600) rotate(-20)"><path d="M-40,0 C-40,-50 -30,-60 0,-60 C30,-60 40,-50 40,0 Z" fill="#2A1C12" />{Array.from({length: 14}, (_, i) => <rect key={i} x={-36 + i * 5.2} y={0} width={2.6} height={46} fill="#2A1C12" />)}</g>
			<g transform="translate(190,400)"><ellipse cx={0} cy={30} rx={86} ry={50} fill="#2A1E16" /><ellipse cx={0} cy={-10} rx={60} ry={36} fill="#34281E" /><ellipse cx={0} cy={-10} rx={34} ry={20} fill="#100A07" /></g>
		</g>
		{/* the 马灯 on the 椁's edge */}
		<circle cx={L[0]} cy={L[1] - 70} r={300} fill="url(#a3lg)" />
		<Lantern x={L[0]} y={L[1] + 10} s={1.05} body="#141210" glass="#FFE2B0" flame="#FFFFFF" />
		{/* palms, the board's shadow on them, the board, the thumbs */}
		<g filter="url(#a3rim)">{hand(HL, true, 'under')}{hand(HR, false, 'under')}</g>
		<g transform={`translate(${D.x + 14},${D.y + 26}) rotate(${D.ang + 90}) scale(${k})`} opacity={0.45} filter="url(#a3b8)"><path d={DU_OUT} transform={`translate(0,${DU_L / 2})`} fill="#000" /></g>
		<g transform={`translate(${D.x},${D.y}) rotate(${D.ang + 90}) scale(${k}) translate(0,${DU_L / 2})`}>
			<path d={DU_OUT} transform="translate(0.18,0.3)" fill="#0A0604" />
			<DuA id="a3du" age={1} cols={4} glow={0.7} />
		</g>
		<g filter="url(#a3rim)">{hand(HL, true, 'thumb')}{hand(HR, false, 'thumb')}</g>
		<rect width={W} height={H} fill="url(#a3vig)" />
	</Svg>; };
