import React from 'react';
import {W, H, rnd, lerp, clamp, ease, easeOut, easeIn, seg, mixC, C, SKY, skyMix, Glow, Defs46, Sky46, Mountain46, Torches, Altar, Wall46, Hall46, Pave46, Stele46, Cypress46, Huai46,
	Stall46, Fire46, Field46, Sapling46, SmokeBank, Pot46, Truck46, Mound46, Slips46, Book46, Scroll46, ScrollStand, SlipStand, Tablet, Climbers, Finish46, Shadow, WALL_BASE, WALL_TOP, SUMMIT, VText} from './kit46';
import {HanBai, treeAt, STRIP_MID, WEST_MID} from './tree46';
import {Story, Punch, PeakLine, Stamp, Brand, Counter, SealRow, SealState, TitleCard, EndCard, Src, plainLen, Row} from './skin46';
import {Person, LOOK, walkAt, grounded, reachPose, jointAt, POSES, reground, gaitPose} from './people46';
import LINES from './lines46.json';
/* ep46 《汉柏的孩子，去守汉武帝》 — the film. Every frame is a pure function of t (seconds).
   Music: episodes/46-hanbai/music/build46.py (anchors46.json): title on the first crash 13.588, stop HIT 107.552,
   DROP 118.307, coda 127.364, dead stop 138.352, intro return 140.037, final hit 149.097, end 156.445. */
export const DUR = 156.44;
const L = LINES as [number, number, string][];
const TX = 1300, TG = 900;   // the tree

/* ---------------- camera ---------------- */
type Cam = {cx: number; cy: number; z: number};
const CAM0: Cam = {cx: 960, cy: 540, z: 1};
const mixCam = (a: Cam, b: Cam, u: number): Cam => ({cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), z: lerp(a.z, b.z, u)});
const Camera: React.FC<{c: Cam; children: React.ReactNode}> = ({c, children}) => <g transform={`translate(960,540) scale(${c.z}) translate(${-c.cx},${-c.cy})`}>{children}</g>;
/** camera keyframes: [t, cam] with smooth easing between */
const camPath = (t: number, keys: [number, Cam][]): Cam => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) if (t < keys[i + 1][0]) return mixCam(keys[i][1], keys[i + 1][1], ease(seg(t, keys[i][0], keys[i + 1][0]))); return keys[keys.length - 1][1]; };

/* ---------------- the courtyard (岱庙 汉柏院) at a given state ---------------- */
type Court = {sky: [string, string]; night?: number; snow?: number; autumn?: number; tint?: number; earth?: number; wall?: number; hall?: number; steles?: number; qlStele?: number; nbGrey?: number; nbBare?: number;
	torch?: number; torch2?: number; altar?: number; age?: number; west?: number; burn?: number; legend?: number; glow?: number; sap?: number; treeO?: number; stars?: number; drift?: number; huaiDead?: number; huaiO?: number; steleGlow?: number; idp: string};
export const STELES: [number, number, number][] = [[430, 875, 0.72], [150, 940, 0.9], [1760, 965, 0.8], [620, 845, 0.55]];
type Depth = {g: number; node: React.ReactNode};
const World: React.FC<{c: Court; t: number; children?: React.ReactNode; extra?: React.ReactNode; people?: Depth[]}> = ({c, t, children, extra, people = []}) => {
	const n = c.night ?? 0, wall = c.wall ?? 1;
	return <g>
		<Sky46 id={`${c.idp}sky`} c={c.sky} stars={c.stars ?? 0} drift={c.drift ?? t} />
		<Mountain46 id={`${c.idp}mt`} tint={c.tint ?? 0} snow={c.snow ?? 0} night={n} />
		{(c.torch ?? -1) >= 0 && <Torches u={c.torch!} seed={1} />}
		{(c.torch2 ?? -1) >= 0 && <Torches u={c.torch2!} seed={7} n={10} />}
		{(c.altar ?? 0) > 0 && <Altar o={c.altar} t={t} />}
		{(c.hall ?? 0) > 0 && <g opacity={wall}><Hall46 cx={520} w={1000} k={c.hall} night={n} /></g>}
		{(c.huaiO ?? 0) > 0 && <g opacity={c.huaiO}><Huai46 x={560} g={WALL_TOP + 120} h={620} dead={c.huaiDead ?? 0} /></g>}
		{wall > 0 && <g opacity={wall}><Wall46 /></g>}
		<Pave46 earth={c.earth ?? 0} snow={c.snow ?? 0} night={n} />
		<Field46 o={(c.earth ?? 0) * (1 - n * 0.6)} />
		<g opacity={wall}>
			<Cypress46 x={260} g={WALL_BASE + 40} h={520} seed={3} grey={c.nbGrey ?? 0} bare={c.nbBare ?? 0} night={n} />
			<Cypress46 x={1840} g={WALL_BASE + 30} h={480} seed={5} grey={c.nbGrey ?? 0} bare={c.nbBare ?? 0} night={n} />
			<Cypress46 x={-120} g={WALL_BASE + 20} h={430} seed={8} grey={c.nbGrey ?? 0} bare={c.nbBare ?? 0} night={n} />
		</g>
		{extra}
		{/* steles and people sorted by their ground line, so nobody walks through stone */}
		{[...STELES.map(([x, g, s], i): Depth => ({g, node: <Stele46 key={'st' + i} x={x} g={g} s={s} variant={i} k={clamp((c.steles ?? 1) * STELES.length - i)} />})),
			...((c.qlStele ?? 0) > 0 ? [{g: 940, node: <Stele46 key="qls" x={880} g={940} s={0.9} carve="tree" variant={3} pavilion k={c.qlStele} glowText={c.steleGlow ?? 0} />}] : []), ...people]
			.sort((a, b) => a.g - b.g).map((d, i) => <React.Fragment key={i}>{d.node}</React.Fragment>)}
		{n > 0 && <rect x={-1400} y={-2400} width={W + 2800} height={4000} fill="#141B33" opacity={0.45 * n} />}
		{(c.treeO ?? 1) > 0 && <g opacity={c.treeO ?? 1}><HanBai x={TX} g={TG} s={1} age={c.age ?? 1} west={c.west ?? 1} burn={c.burn ?? 0} legend={c.legend ?? 0} glow={c.glow ?? 1} sap={c.sap ?? 0} t={t} snow={c.snow ?? 0} night={n} autumn={c.autumn ?? 0} id={`${c.idp}tree`} /></g>}
		{children}
	</g>;
};

/* ---------------- the people ---------------- */
/* People are drawn to the tree's scale (11.5 m ≈ 740 px → a person ≈ 150–165 px at the tree's depth, ≈ 110 px by the
   back wall). Every hand that holds something is solved (IK) to that thing; every figure stands clear of the others. */
const STRIDE = 0.9759;
const STAND = {hip: 0.655, lean: 3, neck: 4, lt: 2, lk: 2, rt: -3, rk: 3, la: -2, le: 12, ra: 3, re: 14};
const TABLE = {x0: 775, x1: 920};
/** 1762: Qianlong looks at the tree, then paints it at a table; two attendants stand behind him */
const qianlongDepth = (t: number, o: number): Depth[] => {
	const h = 165, g = 905, X = 760, tableTop = g - 0.56 * h, out: Depth[] = [];
	out.push({g: g - 1, node: <g key="tb" opacity={o}><Shadow x={(TABLE.x0 + TABLE.x1) / 2 + 12} y={g + 2} rx={88} ry={8} o={0.3} />
		<rect x={TABLE.x0} y={tableTop} width={TABLE.x1 - TABLE.x0} height={9} fill="#6B4A32" />
		{[TABLE.x0 + 30, TABLE.x1 - 14].map((x) => <rect key={x} x={x} y={tableTop + 9} width={7} height={g - tableTop - 9} fill="#4E3626" />)}
		<rect x={TABLE.x0 + 12} y={tableTop - 3} width={100} height={3.5} fill={C.paper} /></g>});
	const paint = ease(seg(t, 62.0, 62.6)), active = t >= 62.6 && t < 64.6;
	const sx = active ? 8 * Math.sin((t - 62.6) * 6.1) : 0;
	const target: [number, number] = [TABLE.x0 + 30 + sx, tableTop - 3];
	const look = grounded({...STAND, lean: -2, neck: -18, la: -2, ra: 2});
	const pp = reachPose({hip: 0.655, lean: 22, neck: 16, lt: 6, lk: 6, rt: -8, rk: 4, la: 16, le: 24, ra: 40, re: 40}, [(target[0] - X) / h, (g - target[1]) / h], 'R');
	const pose = paint <= 0 ? look : paint >= 1 ? pp : reground(mixPoseP(look, pp, paint));
	out.push({g, node: <Person key="ql" who={paint >= 1 ? 'qianlong-paint' : 'qianlong'} o={o} t={t} x={X} ground={g} h={h} pose={pose} look={LOOK.emperor} hat="qing" rim="#FFD36E" rimOp={0.75}
		hands={paint >= 1 ? [{joint: 'RHand', at: target, tol: 8}] : undefined} />});
	if (paint >= 1) { const hand = jointAt(pp, 'RHand', X, g, h); out.push({g: g + 0.5, node: <g key="brush" opacity={o}><line x1={hand[0] + 1} y1={hand[1] + 4} x2={hand[0] + 5} y2={hand[1] - 20} stroke="#3A2A1E" strokeWidth={3.5} /><circle cx={hand[0] + 1} cy={hand[1] + 5} r={2.6} fill={C.ink} /></g>}); }
	[[-160, 0], [-300, 1]].forEach(([dx, i]) => out.push({g: g + 6 + 6 * i, node: <Person key={'at' + i} o={o} who={'attendant' + i} t={t} x={X + dx} ground={g + 6 + 6 * i} h={h * 0.9} pose={grounded({...STAND, lean: 5, neck: 8})} look={LOOK.attendant} hat="qing" />}));
	return out;
};
const mixPoseP = (a: Record<string, [number, number]>, b: Record<string, [number, number]>, k: number) => { const o: Record<string, [number, number]> = {}; for (const n of Object.keys(a)) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };
/** a standing (or kneeling) person whose right hand reaches a world point */
const reacher = (x: number, g: number, h: number, base: Parameters<typeof grounded>[0], at: [number, number], flip = false) => {
	const pose = reachPose(base, [(flip ? x - at[0] : at[0] - x) / h, (g - at[1]) / h], 'R'), hand = jointAt(pose, 'RHand', x, g, h, flip);
	return {pose, hand};
};
/** 1928: soldiers cooking at two fires — one feeds the fire, two stir the pots with ladles, one eats from a bowl */
const soldiersDepth = (t: number, o: number): Depth[] => {
	const g = 905, h = 158, F1 = 385, F2 = 765, fs = 0.7, potTop = g - 46 * fs, out: Depth[] = [];
	[F1, F2].forEach((fx, i) => out.push({g: g + 1, node: <g key={'f' + i} opacity={o}><Fire46 x={fx} g={g + 1} s={fs} t={t + i} />
		{Array.from({length: 4}, (_, j) => { const k = ((t * 0.5 + j / 4 + i * 0.3) % 1); return <ellipse key={j} cx={fx + Math.sin(k * 5 + j) * 6} cy={potTop - 8 - k * 70} rx={6 + 10 * k} ry={4 + 6 * k} fill="#F4F0E8" opacity={(1 - k) * 0.5} filter="url(#k3)" />; })}</g>}));
	const cy = soldier;
	// 1: kneels and feeds a stick into fire 1
	{ const x = 306, at: [number, number] = [x + 0.26 * h, g - 0.3 * h], r = reacher(x, g, h, {hip: 0.36, lean: 18, neck: 10, lt: 94, lk: 94, rt: 0, rk: 90, rf: 160, la: 40, le: 40, ra: 50, re: 30}, at);
		out.push({g, node: <Person key="s1" who="soldier-feed" t={t} x={x} ground={g} h={h} pose={r.pose} look={cy} o={o} hands={[{joint: 'RHand', at, tol: 6}]} />});
		out.push({g: g + 0.4, node: <line key="stick" x1={r.hand[0] - 8} y1={r.hand[1] - 4} x2={F1 - 2} y2={g - 4} stroke="#5A4230" strokeWidth={4} opacity={o} />}); }
	// 2: stirs pot 1 with a ladle (faces left)
	{ const x = 458, st = Math.sin(t * 3.2) * 5, at: [number, number] = [x - 0.22 * h + st * 0.4, g - 0.56 * h], r = reacher(x, g, h, {...STAND, lean: 14, neck: 12, ra: 50, re: 40}, at, true);
		out.push({g, node: <Person key="s2" who="soldier-stir1" t={t} x={x} ground={g} h={h} pose={r.pose} look={cy} flip o={o} hands={[{joint: 'RHand', at, tol: 6}]} />});
		out.push({g: g + 0.4, node: <g key="ladle1" opacity={o}><line x1={r.hand[0]} y1={r.hand[1]} x2={F1 + 4 + st} y2={potTop + 6} stroke="#4A3A2C" strokeWidth={3.5} /><ellipse cx={F1 + 4 + st} cy={potTop + 6} rx={6} ry={3} fill="#4A3A2C" /></g>}); }
	// 3: holds a bowl at the chest (faces right, toward fire 2)
	{ const x = 678, at: [number, number] = [x + 0.2 * h, g - 0.6 * h], r = reacher(x, g, h, {...STAND, lean: 6, neck: 14, ra: 50, re: 60}, at);
		out.push({g, node: <Person key="s3" who="soldier-bowl" t={t} x={x} ground={g} h={h} pose={r.pose} look={LOOK.soldier2} o={o} hands={[{joint: 'RHand', at, tol: 6}]} />});
		out.push({g: g + 0.4, node: <path key="bowl" d={`M${r.hand[0] - 11},${r.hand[1] - 6} Q${r.hand[0]},${r.hand[1] + 8} ${r.hand[0] + 11},${r.hand[1] - 6} Z`} fill="#D9D2C2" stroke="#6E6658" strokeWidth={1.5} opacity={o} />}); }
	// 4: stirs pot 2 (faces left)
	{ const x = 838, st = Math.sin(t * 2.7 + 1) * 5, at: [number, number] = [x - 0.22 * h + st * 0.4, g - 0.56 * h], r = reacher(x, g, h, {...STAND, lean: 14, neck: 12, ra: 50, re: 40}, at, true);
		out.push({g, node: <Person key="s4" who="soldier-stir2" t={t} x={x} ground={g} h={h} pose={r.pose} look={cy} flip o={o} hands={[{joint: 'RHand', at, tol: 6}]} />});
		out.push({g: g + 0.4, node: <g key="ladle2" opacity={o}><line x1={r.hand[0]} y1={r.hand[1]} x2={F2 + 4 + st} y2={potTop + 6} stroke="#4A3A2C" strokeWidth={3.5} /><ellipse cx={F2 + 4 + st} cy={potTop + 6} rx={6} ry={3} fill="#4A3A2C" /></g>}); }
	return out;
};
const soldier = LOOK.soldier;
/** 1928: the market at the back — bamboo stalls, two shoppers, one passer-by on the right */
const marketDepth = (t: number, o: number): Depth[] => {
	const g = 812, h = 112, out: Depth[] = [];
	[[180, '#C9B27E'], [520, '#B98A6A'], [1640, '#A9B48A']].forEach(([x, c], i) => out.push({g: g - 6, node: <g key={'s' + i} opacity={o}><Stall46 x={x as number} g={g - 6} s={0.62} c={c as string} /></g>}));
	out.push({g, node: <Person key="b1" who="buyer-s" t={t} x={250} ground={g} h={h} pose={grounded({...STAND, lean: 8, neck: 12})} look={LOOK.buyer} flip o={o} />});
	out.push({g, node: <Person key="b2" who="buyer-s2" t={t} x={590} ground={g} h={h} pose={grounded({...STAND, lean: 6, neck: 10})} look={LOOK.buyer2} flip o={o} />});
	if (t < 87.0) { const w = walkAt(1060, 1, t, 77.55, h); out.push({g: g + 2, node: <Person key="w" who="walker" t={t} x={w.x} ground={g + 2} h={h} pose={w.pose} look={LOOK.buyer} intent="walk" o={o} />}); }
	return out;
};
/** today: visitors on the back lane (one steady speed, evenly spaced, two lanes for the two directions) and two
   people photographing the tree with a clear line to it */
const visitorsDepth = (t: number, o: number, fast = 1): Depth[] => {
	const list: Depth[] = [], h = 108, v = STRIDE * h / 1.1 * fast, span = 2600;
	const looks = [LOOK.tourist, LOOK.tourist2, LOOK.tourist3, LOOK.child, LOOK.tourist2, LOOK.tourist, LOOK.tourist3, LOOK.tourist, LOOK.tourist2, LOOK.child, LOOK.tourist3];
	for (let i = 0; i < 11; i++) {
		const right = i < 6, n = right ? 6 : 5, k = right ? i : i - 6, g = right ? 798 : 814, hh = looks[i] === LOOK.child ? h * 0.7 : h;
		const dist = (((t - 123.97) * v + k * span / n + (right ? 0 : 200)) % span + span) % span, x = right ? -300 + dist : 2300 - dist, u = dist / (STRIDE * hh);
		list.push({g, node: <Person key={i} who={'visitor' + i} t={t} x={x} ground={g} h={hh} o={o} pose={reground(gaitPose('08_04', u))} look={looks[i]} intent="walk" flip={!right} />});
	}
	[[1000, false], [1610, true]].forEach(([x, flip], k) => {
		const X = x as number, F = flip as boolean, g = 905, hh = 158, pose = reachPose({...STAND, lean: 2, neck: -8, ra: 40, re: 40}, [0.17, 0.86], 'R'), hand = jointAt(pose, 'RHand', X, g, hh, F);
		list.push({g, node: <Person key={'ph' + k} o={o} who={'photo' + k} t={t} x={X} ground={g} h={hh} pose={pose} look={k ? LOOK.tourist2 : LOOK.tourist3} flip={F} hands={[{joint: 'RHand', at: hand, tol: 4}]} />});
		const flash = (Math.sin(t * 2.3 + k * 3) > 0.96) ? 1 : 0, dir = F ? -1 : 1;
		list.push({g: g + 0.5, node: <g key={'pp' + k} opacity={o}><rect x={hand[0] + dir * 3 - 2} y={hand[1] - 15} width={5} height={18} rx={1.5} fill="#2A2A30" stroke="#C9CDD6" strokeWidth={1} />
			{flash > 0 && <Glow x={hand[0] + dir * 6} y={hand[1] - 8} r={46} c="#FFFFFF" o={0.65} id={`fl${k}`} />}</g>});
	});
	return list;
};
/* ---------------- 2024: six seedlings travel west to 茂陵 (glowing points, the reverse of the torch line) ---------------- */
const SEED_X = [440, 640, 840, 1080, 1280, 1480], SEED_G = [902, 888, 880, 880, 888, 902];
const Journey: React.FC<{t: number; o: number}> = ({t, o}) => {
	const u = seg(t, 110.4, 114.9), moundIn = ease(seg(t, 111.8, 114.0)), drift = (t - 110.4) * 140;
	return <g opacity={o}>
		<Sky46 id="jsky" c={skyMix('day', 'gold', u)} drift={t * 6} />
		{/* 泰山 left behind on the right horizon */}
		<path d="M1500,640 L1640,560 L1720,500 L1780,470 L1840,500 L1960,560 L2100,640 Z" fill="#9AA6AE" opacity={1 - u} />
		<g opacity={moundIn}><Mound46 x={760} g={700} s={0.8} /></g>
		<path d={`M-300,700 Q400,${676} 900,690 T2300,690 L2300,720 L-300,720 Z`} fill="#A9B39A" />
		<rect x={-300} y={700} width={2600} height={600} fill="#C9B88A" />
		{Array.from({length: 18}, (_, i) => { const y = 712 + Math.pow(i / 17, 1.6) * 380, sp = 0.3 + i / 17; return <line key={i} x1={-300} y1={y} x2={2300} y2={y} stroke="#B3A271" strokeWidth={2 + i * 0.15} opacity={0.6} strokeDasharray={`${120 * sp} ${60 * sp}`} strokeDashoffset={-drift * sp} />; })}
		{Array.from({length: 10}, (_, i) => { const x = ((i * 260 + drift * 0.6) % 2600) - 300; return <g key={i}><rect x={x - 3} y={650} width={6} height={52} fill="#6B5A44" /><ellipse cx={x} cy={648} rx={16} ry={30} fill="#6F8A55" /></g>; })}
		{SEED_X.map((sx, i) => { const k = ease(seg(t, 110.4 + i * 0.08, 114.9 + i * 0.05)), x = lerp(1950 + i * 30, sx, k), y = lerp(260 + (i % 3) * 40, SEED_G[i] - 40, easeIn(k)) - Math.sin(k * Math.PI) * 120;
			return <g key={i}>{[0.05, 0.1, 0.15].map((d, j) => { const kk = ease(seg(t - d * 2, 110.4 + i * 0.08, 114.9 + i * 0.05)); return <circle key={j} cx={lerp(1950 + i * 30, sx, kk)} cy={lerp(260 + (i % 3) * 40, SEED_G[i] - 40, easeIn(kk)) - Math.sin(kk * Math.PI) * 120} r={7 - j * 2} fill={C.glowCore} opacity={0.4 - j * 0.1} />; })}
				<Glow x={x} y={y} r={46} c={C.glow} o={0.8} id={`js${i}`} /><circle cx={x} cy={y} r={8} fill={C.glowCore} /></g>; })}
	</g>;
};
/** the seedlings: small copies of 你 (same pads, same warm light) */
const Seedling: React.FC<{i: number; grow: number; glow: number; t: number}> = ({i, grow, glow, t}) => grow <= 0 ? null :
	<g transform={`translate(${SEED_X[i]},${SEED_G[i]}) scale(${lerp(0.15, 1, easeOut(grow))}) translate(${-SEED_X[i]},${-SEED_G[i]})`}>
		<HanBai x={SEED_X[i]} g={SEED_G[i]} s={0.36} age={0.55} west={0} glow={glow} t={t + i} id={`sd${i}`} />
	</g>;
const Maoling: React.FC<{t: number; o: number; glow: number}> = ({t, o, glow}) => {
	const drop = t >= 118.307 ? 1 : 0, big = ease(seg(t, 118.307, 119.4));
	return <g opacity={o}>
		<Sky46 id="msky" c={skyMix('gold', 'dusk', seg(t, 114.9, 124))} sun={[1500, 430, 460]} drift={t * 2} />
		{/* 你, huge and translucent in the sky behind the mound, on the drop */}
		{big > 0 && <g opacity={0.42 * big}><HanBai x={980} g={880} s={0.95} age={1} west={1} glow={1} t={t} id="ghostTree" /></g>}
		<path d="M-200,700 L300,640 L700,670 L1200,630 L1700,660 L2200,640 L2200,760 L-200,760 Z" fill="#A9A08E" opacity={0.7} />
		<Mound46 x={960} g={760} s={1.2} rim={glow * 0.8} />
		{/* 相传: the man said to have planted you, a dashed ghost on the mound */}
		{t >= 114.91 && <g opacity={0.5 * ease(seg(t, 114.91, 115.6)) * (1 - 0.6 * big)}>
			<Person who="legend-wudi" t={t} x={960} ground={402} h={210} pose={grounded({hip: 0.655, lean: 2, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -2, le: 12, ra: 3, re: 14})} look={{dress: 'robe', head: 'guan', sleeves: 'wide', beard: 'long'}} col={C.glow} rim={C.glowCore} rimOp={0.6} />
			<text x={1050} y={330} textAnchor="start" style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 44}} fill="#FFF8EC" stroke="#2A1A0A" strokeWidth={6} paintOrder="stroke">相传</text>
		</g>}
		<rect x={-200} y={750} width={2400} height={500} fill="#BBA676" />
		<rect x={-200} y={750} width={2400} height={26} fill="#9FB07C" />
		{Array.from({length: 30}, (_, i) => { const x = -100 + rnd(i, 71) * 2200, y = 790 + Math.pow(rnd(i, 72), 1.5) * 280; return <path key={i} d={`M${x},${y} q-4,-14 -10,-20 M${x + 6},${y} q2,-16 6,-22 M${x + 12},${y} q6,-12 12,-16`} stroke="#8C9A62" strokeWidth={3} fill="none" />; })}
		{glow > 0 && <Glow x={960} y={820} r={1000} c={C.glow} o={0.35 * glow} id="mlg" />}
		{drop > 0 && Array.from({length: 14}, (_, i) => { const a = -Math.PI / 2 + (i - 6.5) * 0.15; return <path key={i} d={`M960,880 L${960 + Math.cos(a - 0.025) * 1500},${880 + Math.sin(a - 0.025) * 1500} L${960 + Math.cos(a + 0.025) * 1500},${880 + Math.sin(a + 0.025) * 1500} Z`} fill={C.glowCore} opacity={0.08 * glow} />; })}
		{SEED_X.map((_, i) => <Seedling key={i} i={i} t={t} grow={seg(t, 114.95 + i * 0.12, 116.2 + i * 0.12)} glow={drop ? lerp(0.5, 1.3, easeOut(seg(t, 118.307, 118.7))) : 0.35} />)}
		{drop > 0 && Array.from({length: 30}, (_, i) => { const k = ((t - 118.3) * 0.25 + rnd(i, 75)) % 1; return <circle key={'m' + i} cx={360 + rnd(i, 76) * 1200 + Math.sin(k * 5 + i) * 20} cy={880 - k * 650} r={2.5 + 2 * rnd(i, 77)} fill={C.glowCore} opacity={glow * (1 - k) * 0.9} />; })}
	</g>;
};

/* ---------------- subtitles: pages that stack ---------------- */
const PAGES: {ids: number[]; punch?: boolean; top?: number; size?: number}[] = [
	{ids: [0, 1, 2]}, {ids: [3, 4, 5]}, {ids: [6, 7]}, {ids: [8, 9]}, {ids: [10, 11]}, {ids: [12, 13]}, {ids: [14, 15]}, {ids: [16, 17]}, {ids: [18, 19]}, {ids: [20]},
	{ids: [21, 22]}, {ids: [23]}, {ids: [24, 25]}, {ids: [26]}, {ids: [27], punch: true, top: 300}, {ids: [28, 29, 30]}, {ids: [31]}, {ids: [32], punch: true}, {ids: [33, 34]}, {ids: [35, 36]}, {ids: [37]},
	{ids: [38, 39, 40]}, {ids: [41], punch: true, top: 330, size: 80}, {ids: [42, 43]}, {ids: [44]}, {ids: [45], punch: true, top: 420, size: 96}, {ids: [46], punch: true, top: 430, size: 74},
];
const typed = (t: number, i: number) => { const [s, e, txt] = L[i], n = plainLen(txt), dur = Math.min(0.55, (e - s) * 0.35); return Math.floor(n * clamp((t - s) / dur)) + (t >= s ? 1 : 0); };
const Subs: React.FC<{t: number}> = ({t}) => {
	const pi = PAGES.findIndex((p, k) => t >= L[p.ids[0]][0] && (k === PAGES.length - 1 || t < L[PAGES[k + 1].ids[0]][0]) && t < L[p.ids[p.ids.length - 1]][1] + 0.01);
	if (pi < 0) return null;
	const p = PAGES[pi], end = L[p.ids[p.ids.length - 1]][1], fadeOut = 1 - seg(t, end - 0.18, end);
	if (p.ids[0] === 41) { const i = 41, o = fadeOut * clamp((t - L[i][0]) / 0.12); return <PeakLine o={o} n={typed(t, i)} />; }
	if (p.punch) { const i = p.ids[0]; return <Punch s={L[i][2]} n={typed(t, i)} o={fadeOut * clamp((t - L[i][0]) / 0.12)} top={p.top} size={p.size} />; }
	const rows: Row[] = p.ids.filter((i) => t >= L[i][0]).map((i) => ({s: L[i][2], n: typed(t, i), o: clamp((t - L[i][0]) / 0.12)}));
	return <Story rows={rows} o={fadeOut} />;
};

/* ---------------- stamp + counter by time ---------------- */
const STAMPS: [number, string, string?, string?][] = [
	[0, '2026', '岱庙', '泰山脚下 · 汉柏院'], [2.83, '相传', '前110年', '汉武帝封禅泰山'], [5.10, ''], [7.36, '年代不详', '大火'], [9.06, '1762', '乾隆'], [10.76, '今天'],
	[13.4, ''], [15.85, '前110', '泰山', '汉武帝第一次封禅'], [26.61, '前110—前89', '泰山', '据《汉书·武帝纪》'], [31.14, '北魏', '郦道元', '《水经注》卷二十四'], [38.49, '相传'],
	[41.32, ''], [44.15, '前219', '秦始皇'], [46.98, '前110', '汉武帝'], [49.81, '56', '光武帝'], [50.66, '666', '唐高宗'], [51.51, '725', '唐玄宗'], [52.36, '1008', '宋真宗', '最后一位封禅的皇帝'],
	[56.04, ''], [59.44, '1762', '乾隆', '第三次南巡归途 · 岱庙'], [66.79, '1771', '乾隆', '画刻成碑 · 立于汉柏院'], [77.55, '1928', '岱庙', '前半部改为“中山市场”'], [80.38, '民国', '岱庙', '军队驻扎大殿'],
	[87.17, '民国', '唐槐院'], [91.14, '民国', '岱庙'], [93.40, '今天', '汉柏连理', '高11.5米 · 胸围3.4米'], [96.23, '年代不详', '西干', '曾遭火焚而枯'], [99.06, '今天', '东干', '靠北面一条树皮输送养分'], [102.46, ''], [105.29, '今天', '岱庙', '采集古树种子育苗'],
	[109.25, '2024年4月', '泰山 → 茂陵', '6株“汉柏连理”的种子苗'], [114.91, '2024', '茂陵', '汉武帝的陵墓'], [123.97, '今天', '泰山', '游客连续三年超800万人次'], [138.35, ''],
];
const stampAt = (t: number) => { let s = STAMPS[0]; for (const x of STAMPS) if (t >= x[0]) s = x; return s; };
const spin = (t: number, a: number, b: number, n0: number, n1: number) => Math.round(lerp(n0, n1, easeIn(seg(t, a, b)) * 0.4 + ease(seg(t, a, b)) * 0.6));
const counterAt = (t: number): number | string | null => {
	if (t < 2.83) return '2100多'; if (t < 5.10) return 0; if (t < 7.36) return spin(t, 5.1, 7.3, 0, 1117); if (t < 9.06) return '?'; if (t < 10.76) return 1871; if (t < 13.4) return '2100多';
	if (t < 15.85) return null; if (t < 24.34) return 0; if (t < 26.61) return Math.round(lerp(0, 21, seg(t, 24.34, 26.3))); if (t < 31.14) return 21; if (t < 38.49) return '?'; if (t < 41.32) return '?';
	if (t < 44.15) return null; if (t < 46.98) return '—'; if (t < 49.81) return 0; if (t < 50.66) return 165; if (t < 51.51) return 775; if (t < 52.36) return 834; if (t < 56.04) return 1117;
	if (t < 59.44) return spin(t, 56.04, 59.3, 1117, 1871); if (t < 66.79) return 1871; if (t < 77.55) return 1880; if (t < 93.40) return 2037; if (t < 109.25) return 2135; if (t < 123.97) return 2133;
	if (t < 149.09) return 2135; return null;
};

/* ---------------- the film ---------------- */
export const Film46: React.FC<{t: number}> = ({t}) => {
	const layers: React.ReactNode[] = [];
	let cam: Cam = CAM0, seals: React.ReactNode = null, extraHtml: React.ReactNode = null, scrim = 0;
	const wind = 1 + 2.5 * Math.exp(-Math.max(0, t - 0.555) * 3) * (t > 0.555 ? 1 : 0);

	/* ===== A. cold open 0 – 13.588 ===== */
	if (t < 13.588) {
		const u1 = seg(t, 2.83, 3.4), grow = seg(t, 5.1, 7.2), fire = t >= 7.36 && t < 9.06 ? 1 : 0, paint = seg(t, 9.06, 10.4), today = seg(t, 10.76, 11.2);
		const cyc = t >= 5.1 && t < 7.36 ? (t - 5.1) / 2.26 : 0, dayNight = Math.sin(cyc * Math.PI * 4) * 0.5 + 0.5;
		const age = t < 2.83 ? 1 : t < 5.1 ? lerp(1, 0.04, easeOut(u1)) : t < 7.36 ? lerp(0.04, 1, ease(grow)) : 1;
		const han = t >= 2.83 && t < 5.1 ? 1 : t >= 5.1 && t < 7.36 ? 1 - ease(seg(t, 5.1, 6.6)) : 0;
		const sky = t < 2.83 ? skyMix('dawn', 'day', seg(t, 0, 2.8)) : t < 5.1 ? SKY.han : t < 7.36 ? skyMix('day', 'night', dayNight) : fire ? SKY.night : t < 10.76 ? SKY.day : skyMix('day', 'gold', today);
		layers.push(<World key="A" t={t} c={{idp: 'A', sky, night: fire ? 1 : t >= 5.1 && t < 7.36 ? dayNight * 0.8 : 0, earth: han, wall: 1 - han, hall: 1 - han, steles: 1 - han, age, west: t < 2.83 ? 1 : t < 7.36 ? 0 : fire ? lerp(0, 1, seg(t, 7.6, 8.9)) : t < 10.76 ? 0 : 1, burn: fire,
			legend: t >= 2.83 && t < 5.1 ? 1 : 0, glow: fire ? 0.6 : 1, sap: today, torch: t >= 2.83 && t < 7.36 ? ((t - 2.83) / 1.1) % 1.2 : -1, torch2: t >= 5.1 && t < 7.36 ? ((t - 5.1) / 0.9 + 0.5) % 1.2 : -1, stars: fire ? 1 : 0}} />);
		if (t >= 9.06 && t < 10.76) layers.push(<g key="scroll" transform={`translate(${lerp(-400, 0, easeOut(seg(t, 9.06, 9.5)))},0)`}><ScrollStand x={760} g={905} s={0.5} open={easeOut(seg(t, 9.1, 9.6))} ink={paint} /></g>);
		cam = t < 2.83 ? mixCam({cx: 1230, cy: 640, z: 1.6}, {cx: 1040, cy: 540, z: 1.06}, ease(seg(t, 0.4, 2.83))) : t < 10.76 ? CAM0 : mixCam(CAM0, {cx: 1300, cy: 660, z: 1.75}, ease(seg(t, 10.76, 12.2)));
		if (t > 13.0) cam = mixCam(cam, CAM0, ease(seg(t, 13.0, 13.588)));
	}
	/* ===== title 13.588 – 15.85: rewind to 110 BC ===== */
	else if (t < 15.85) {
		const u = seg(t, 13.588, 15.6), age = lerp(1, 0.04, easeIn(u) * 0.3 + ease(u) * 0.7), flick = Math.sin(u * Math.PI * 9);
		layers.push(<World key="T" t={t} c={{idp: 'T', sky: skyMix('day', u > 0.5 ? 'han' : 'night', Math.abs(flick) * 0.5), earth: ease(seg(t, 14.6, 15.6)), wall: 1 - ease(seg(t, 14.6, 15.6)), hall: 1 - ease(seg(t, 14.4, 15.4)), steles: 1 - u * 1.2, age, west: u > 0.25 ? 0 : 1, legend: ease(seg(t, 15.0, 15.8)), glow: 1}} />);
		extraHtml = <TitleCard t={t} t0={13.588} t1={15.85} num={lerp(2026, -109, ease(seg(t, 13.75, 15.55)))} />;
	}
	/* ===== B. Han, 15.85 – 41.32 ===== */
	else if (t < 41.32) {
		const up = ease(seg(t, 18.68, 20.3)) * (1 - ease(seg(t, 21.51, 23.0)));
		const visits = t >= 24.34 && t < 26.61 ? (t - 24.34) / 2.27 : 0;
		const ageB = t < 24.34 ? 0.04 : t < 31.14 ? lerp(0.04, 0.1, seg(t, 24.34, 26.61)) : lerp(0.1, 0.32, seg(t, 31.14, 41.0));
		const doc = t >= 26.61 && t < 38.6;
		layers.push(<World key="B" t={t} c={{idp: 'B', sky: t < 24.34 ? SKY.han : t < 26.61 ? skyMix('han', 'dusk', Math.abs(Math.sin(visits * Math.PI * 8)) * 0.6) : SKY.han, earth: 1, wall: 0, hall: 0, steles: 0,
			age: ageB, west: 0, legend: t < 38.49 ? 1 : 0.7 + 0.3 * Math.sin(t * 6), glow: 1, torch: t < 21.6 ? lerp(0, 1.15, seg(t, 15.85, 20.6)) : t >= 24.34 && t < 26.61 ? (visits * 8) % 1.2 : -1, altar: seg(t, 19.3, 20.2) * (1 - seg(t, 22.5, 23.2)), stars: 0}} />);
		cam = mixCam(mixCam(CAM0, {cx: 420, cy: 250, z: 0.8}, up), {cx: TX - 40, cy: 780, z: 1.5}, ease(seg(t, 21.8, 23.4)) * (1 - ease(seg(t, 24.0, 25.2))));
		if (doc) {
			scrim = 0.35 * ease(seg(t, 26.61, 27.2)) * (1 - ease(seg(t, 38.2, 38.8)));
			const slipsO = ease(seg(t, 26.61, 27.0)) * (1 - ease(seg(t, 31.14, 31.6)));
			if (slipsO > 0) layers.push(<g key="slips" opacity={slipsO} transform={`translate(${lerp(-300, 0, easeOut(seg(t, 26.61, 27.2)))},0)`}><SlipStand x={560} g={905} u={seg(t, 26.61, 28.4)} grey={ease(seg(t, 28.87, 29.6))} empty={ease(seg(t, 28.87, 29.4))} cross={ease(seg(t, 29.6, 30.0))} /></g>);
			const bookO = ease(seg(t, 31.14, 31.6)) * (1 - ease(seg(t, 38.3, 38.9)));
			if (bookO > 0) layers.push(<g key="book" opacity={bookO} transform={`translate(${lerp(-200, 0, easeOut(seg(t, 31.14, 31.7)))},0)`}><Tablet x={700} g={905} u={seg(t, 31.4, 34.3)} hl={ease(seg(t, 34.4, 35.2))} />
				{t >= 36.8 && <g opacity={ease(seg(t, 36.8, 37.2))}><text x={1010} y={600} style={{fontFamily: "'Noto Serif CJK SC',serif", fontWeight: 900, fontSize: 120}} fill="#FFD36E" stroke="#2A1A0A" strokeWidth={6} paintOrder="stroke">盖 = 大概</text></g>}</g>);
		}
	}
	/* ===== C. the six emperors, 41.32 – 56.04 ===== */
	else if (t < 56.04) {
		const lightT = [49.81, 50.66, 51.51, 52.36], lit = lightT.map((a) => t >= a);
		const nLit = lit.filter(Boolean).length, ages = [0.04, 0.45, 0.75, 0.8, 0.86], age = t < 44.15 ? 0.32 : t < 46.98 ? 0 : t < 49.81 ? 0.04 : ages[nLit];
		const song = seg(t, 52.36, 53.4);
		layers.push(<World key="C" t={t} c={{idp: 'C', sky: nLit >= 4 ? skyMix('han', 'day', song) : SKY.han, earth: 1 - ease(song), wall: ease(song), hall: ease(seg(t, 52.6, 54.2)), steles: 0.15 * song,
			age, west: 0, legend: t < 49.81 ? 1 : 0, glow: 1, treeO: t >= 44.15 && t < 46.98 ? 0 : 1,
			torch: t >= 44.15 && t < 46.98 ? lerp(0, 1.15, seg(t, 44.15, 46.5)) : t >= 46.98 && t < 49.81 ? lerp(0, 1.15, seg(t, 46.98, 49.3)) : nLit > 0 ? lerp(0, 1.15, seg(t, lightT[nLit - 1], lightT[nLit - 1] + 0.85)) : -1}}
			extra={t >= 44.15 && t < 46.98 ? <ellipse cx={TX} cy={TG} rx={70} ry={16} fill="none" stroke="#FFF2D2" strokeWidth={3} strokeDasharray="10 8" opacity={0.8} /> : null} />);
		scrim = 0.32 * ease(seg(t, 41.32, 41.8)) * (1 - ease(seg(t, 55.4, 56.0)));
		const st: SealState[] = [t >= 44.15 ? 'before' : 'off', t >= 46.98 ? 'legend' : 'off', ...lit.map((x): SealState => x ? 'lit' : 'off')];
		if (t < 44.15) st.forEach((_, i) => { st[i] = t >= 41.32 + i * 0.12 ? 'ghost' : 'off'; });
		seals = <SealRow st={st} o={1 - ease(seg(t, 55.4, 56.0))} seventh={seg(t, 53.21, 53.6) * (1 - seg(t, 55.0, 55.8))} pop={[seg(t, 44.15, 44.4), seg(t, 46.98, 47.2), ...lightT.map((a) => seg(t, a, a + 0.25))]} />;
	}
	/* ===== D. time-lapse 56.04 – 59.44 ===== */
	else if (t < 59.44) {
		const u = seg(t, 56.04, 59.3), season = (u * 4) % 1, phase = Math.floor(u * 4) % 4;
		const sky: [string, string] = [SKY.day, SKY.snow, SKY.blossom, SKY.autumn][phase];
		layers.push(<World key="D" t={t} c={{idp: 'D', sky: skyMix(phase === 0 ? 'day' : phase === 1 ? 'snow' : phase === 2 ? 'blossom' : 'autumn', 'day', season * 0.3), snow: phase === 1 ? Math.sin(season * Math.PI) : 0, autumn: phase === 3 ? Math.sin(season * Math.PI) * 0.7 : 0,
			earth: 0, wall: 1, hall: 1, steles: lerp(0.15, 1, ease(u)), age: lerp(0.86, 0.97, u), west: 0, glow: 1, drift: t * 25}} />);
		void sky;
	}
	/* ===== E. Qianlong, 59.44 – 77.55 ===== */
	else if (t < 77.55) {
		const scrollO = ease(seg(t, 62.4, 62.9)) * (1 - ease(seg(t, 66.2, 66.8))), steleK = ease(seg(t, 66.9, 68.2)), figO = 1 - ease(seg(t, 66.0, 66.7));
		layers.push(<World key="E" t={t} c={{idp: 'E', sky: skyMix('day', 'noon', seg(t, 59.44, 77)), wall: 1, hall: 1, steles: 1, qlStele: steleK, steleGlow: ease(seg(t, 74.4, 75.2)), age: 0.97, west: 0, glow: 1 + 0.4 * Math.sin(seg(t, 71.32, 74.1) * Math.PI)}}
			people={figO > 0 ? qianlongDepth(t, figO) : []} />);
		if (scrollO > 0) layers.push(<g key="scr" opacity={scrollO}><ScrollStand x={1010} g={905} s={0.27} open={easeOut(seg(t, 62.4, 63.0))} ink={seg(t, 62.6, 64.4)} inscr={seg(t, 64.6, 65.6)} /></g>);
		if (t >= 71.32 && t < 77.4) { const o = ease(seg(t, 71.5, 72.0)) * (1 - seg(t, 77.0, 77.4)), lab = (x: number, y: number, txt: string) => <text x={x} y={y} textAnchor="middle" style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 48}} fill="#FFF8EC" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke">{txt}</text>;
			layers.push(<g key="hg" opacity={o}>{lab(880, 560, '石碑里的你')}{lab(1420, 240, '真的你')}</g>); }
		if (t >= 71.32 && t < 74.3) { const u = ease(seg(t, 71.4, 72.6)); layers.push(<path key="sight" d={`M900,700 Q1100,${560 - 120 * u} ${lerp(900, 1240, u)},${lerp(700, 560, u)}`} stroke={C.glowCore} strokeWidth={4} strokeDasharray="8 10" fill="none" opacity={0.85 * (1 - seg(t, 73.8, 74.3))} />); }
		cam = t < 69.06 ? mixCam(CAM0, {cx: 880, cy: 700, z: 1.55}, ease(seg(t, 61.6, 62.8)) * (1 - ease(seg(t, 66.0, 67.4)))) : mixCam(CAM0, {cx: 1080, cy: 600, z: 1.18}, ease(seg(t, 69.06, 70.6)));
		if (t > 76.6) cam = mixCam(cam, CAM0, ease(seg(t, 76.6, 77.55)));
	}
	/* ===== F. 1928, 77.55 – 91.14 ===== */
	else if (t < 91.14) {
		const smoke = ease(seg(t, 80.6, 84.5)), grey = ease(seg(t, 83.9, 86.5)), huai = ease(seg(t, 87.17, 88.0)) * (1 - ease(seg(t, 90.4, 91.1)));
		layers.push(<World key="F" t={t} c={{idp: 'F', sky: skyMix('day', 'smoke', smoke), tint: smoke * 0.6, wall: 1, hall: 1, steles: 1, qlStele: 1, age: 1, west: 0, glow: lerp(1, 0.55, smoke), nbGrey: grey, nbBare: grey * 0.75, huaiO: 1, huaiDead: ease(seg(t, 87.6, 90.6))}}
			people={[...marketDepth(t, ease(seg(t, 77.6, 78.4))), ...(t >= 80.4 ? soldiersDepth(t, ease(seg(t, 80.4, 81.0))) : [])]}>
			<SmokeBank o={smoke * 0.8} t={t} y={480} />
			{grey > 0 && Array.from({length: 18}, (_, i) => { const k = ((t - 83.9) * 0.4 + rnd(i, 5)) % 1; return <ellipse key={i} cx={(i % 2 ? 260 : 1840) + (rnd(i, 6) - 0.5) * 300 + k * 60} cy={400 + k * 450} rx={6} ry={3} fill="#8C877C" opacity={grey * (1 - k)} />; })}
		</World>);
		const cook = ease(seg(t, 80.2, 81.2)) * (1 - ease(seg(t, 83.6, 84.8)));
		cam = mixCam(mixCam(CAM0, {cx: 600, cy: 740, z: 1.6}, cook), {cx: 760, cy: 470, z: 1.18}, huai);
		if (huai > 0) layers.push(<text key="huailab" x={560} y={330} textAnchor="middle" style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 48}} fill="#FFF8EC" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke" opacity={huai}>唐槐</text>);
	}
	/* ===== G. you survived; half alive, 91.14 – 105.29 ===== */
	else if (t < 105.29) {
		const clear = ease(seg(t, 91.14, 92.6)), today = t >= 93.4 ? 1 : 0, push = ease(seg(t, 93.4, 94.8)) * (1 - ease(seg(t, 102.46, 103.8)));
		const westFocus = t >= 96.23 && t < 99.06 ? ease(seg(t, 96.23, 96.8)) * (1 - ease(seg(t, 98.6, 99.06))) : 0, eastFocus = t >= 99.06 ? 1 : 0;
		layers.push(<World key="G" t={t} c={{idp: 'G', sky: today ? SKY.day : skyMix('smoke', 'day', clear * 0.7), tint: today ? 0 : 0.6 * (1 - clear * 0.7), wall: 1, hall: 1, steles: 1, qlStele: 1, age: 1, west: today, glow: 1 + 0.6 * Math.exp(-Math.max(0, t - 91.14) * 1.4), nbGrey: today ? 0 : 1, nbBare: today ? 0 : 0.75, sap: t >= 99.06 ? 1 : 0}}>
			<SmokeBank o={today ? 0 : 0.8 * (1 - clear)} t={t} y={480} />
		</World>);
		cam = mixCam(CAM0, {cx: TX - 40, cy: 640, z: 1.55}, push);
		// labels on the trunk
		if (westFocus > 0) { const p = treeAt(TX, TG, 1, 1, WEST_MID); layers.push(<g key="wl" opacity={westFocus}><path d={`M${p[0] - 70},${p[1] - 160} L${p[0] - 70},${p[1] + 220}`} stroke="#FFF2D2" strokeWidth={3} />
			<text x={p[0] - 100} y={p[1] + 150} textAnchor="end" style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 52}} fill="#FFF8EC" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke">西干 · 死了</text></g>); }
		if (t >= 99.06 && t < 102.6) { const p = treeAt(TX, TG, 1, 1, STRIP_MID), o = ease(seg(t, 99.1, 99.5)) * (1 - seg(t, 102.2, 102.6));
			layers.push(<text key="eastname" x={p[0] + 100} y={p[1] - 70} style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 52}} fill="#FFF8EC" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke" opacity={o}>东干 · 活着</text>); }
		if (eastFocus > 0 && t < 102.6) { const p = treeAt(TX, TG, 1, 1, STRIP_MID), o = ease(seg(t, 99.3, 99.8)) * (1 - seg(t, 102.2, 102.6));
			layers.push(<g key="el" opacity={o}><path d={`M${p[0] - 20},${p[1]} L${p[0] + 16},${p[1]} M${p[0] - 20},${p[1] - 12} L${p[0] - 20},${p[1] + 12} M${p[0] + 16},${p[1] - 12} L${p[0] + 16},${p[1] + 12} M${p[0] + 16},${p[1]} L${p[0] + 90},${p[1]}`} stroke="#FFF8EC" strokeWidth={4} />
				<text x={p[0] + 100} y={p[1] + 14} style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 56}} fill="#FFD36E" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke">32厘米</text></g>); }
		if (t >= 102.46) { const o = ease(seg(t, 102.9, 103.5)), top = TG - 830, hgt = ease(seg(t, 102.9, 104.0));
			layers.push(<g key="hb" opacity={o}><line x1={1660} y1={TG} x2={1660} y2={lerp(TG, top, hgt)} stroke="#FFF2D2" strokeWidth={4} /><line x1={1640} y1={TG} x2={1680} y2={TG} stroke="#FFF2D2" strokeWidth={4} /><line x1={1640} y1={top} x2={1680} y2={top} stroke="#FFF2D2" strokeWidth={4} opacity={hgt} /><line x1={1430} y1={top} x2={1640} y2={top} stroke="#FFF2D2" strokeWidth={2} opacity={0.6 * hgt} />
				<text x={1690} y={(TG + top) / 2} style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 64}} fill="#FFD36E" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke">11.5米</text></g>); }
	}
	/* ===== H. seeds, 105.29 – 109.25 ===== */
	else if (t < 109.25) {
		const still = t >= 107.552 ? 1 : 0;
		layers.push(<World key="H" t={t} c={{idp: 'H', sky: SKY.day, wall: 1, hall: 1, steles: 1, qlStele: 1, age: 1, west: 1, glow: 1, nbGrey: 0.3, sap: 0.6}}
			extra={<g>
				<Shadow x={1040} y={952} rx={90} ry={12} o={0.35} />
				<path d="M960,900 L1120,900 L1104,950 L976,950 Z" fill="#B48A52" /><path d="M960,900 L1120,900" stroke="#8A6438" strokeWidth={6} />
				{Array.from({length: 7}, (_, i) => <line key={i} x1={972 + i * 22} y1={904} x2={980 + i * 21} y2={948} stroke="#8A6438" strokeWidth={2} />)}
			</g>}>
			{Array.from({length: 9}, (_, i) => { const t0 = 105.4 + i * 0.25, k = clamp((t - t0) / 1.0), x0 = 1200 + (rnd(i, 81) - 0.5) * 300, y0 = 300 + rnd(i, 82) * 120, x1 = 990 + i * 15, y1 = 902;
				if (t < t0) return null; const kk = still ? Math.min(k, 1) : k; return <g key={i}><ellipse cx={lerp(x0, x1, kk)} cy={lerp(y0, y1, easeIn(kk))} rx={7} ry={9} fill="#7A6A4A" stroke="#4E4232" strokeWidth={2} /></g>; })}
			{still > 0 && <Glow x={1040} y={900} r={160} c={C.glow} o={0.5 * (1 - seg(t, 108.8, 109.25)) + 0.2} id="seedg" />}
		</World>);
		cam = mixCam(CAM0, {cx: 1080, cy: 760, z: 1.45}, ease(seg(t, 105.6, 107.4)));
	}
	/* ===== I. 2024: six lights leave the tree, cross the plain, land before 茂陵 and grow; the drop 118.307 ===== */
	else if (t < 123.97) {
		if (t < 110.9) {
			const lift = seg(t, 109.25, 110.6);
			layers.push(<World key="I0" t={t} c={{idp: 'I0', sky: SKY.day, wall: 1, hall: 1, steles: 1, qlStele: 1, age: 1, west: 1, glow: 1.2, sap: 0.6}}>
				{SEED_X.map((_, i) => { const k = ease(seg(t, 109.3 + i * 0.1, 110.7)), x = lerp(1250 + i * 30, -200 - i * 40, k), y = lerp(420 + (i % 3) * 30, 160 + i * 20, k) - Math.sin(k * Math.PI) * 80;
					return <g key={i} opacity={clamp(lift * 4)}><Glow x={x} y={y} r={50} c={C.glow} o={0.85} id={`ls${i}`} /><circle cx={x} cy={y} r={9} fill={C.glowCore} /></g>; })}
			</World>);
			cam = mixCam(CAM0, {cx: 1100, cy: 480, z: 1.08}, ease(seg(t, 109.25, 110.6)));
		}
		if (t >= 110.6 && t < 115.3) layers.push(<Journey key="J" t={t} o={ease(seg(t, 110.6, 110.95))} />);
		if (t >= 114.6) layers.push(<Maoling key="M" t={t} o={ease(seg(t, 114.6, 115.3)) * (1 - ease(seg(t, 123.2, 123.97)))} glow={t < 117.17 ? 0.25 : t < 118.307 ? 0.12 : lerp(0.3, 1, easeOut(seg(t, 118.307, 119.0)))} />);
		if (t >= 117.17 && t < 118.307) scrim = 0.22 * ease(seg(t, 117.17, 117.9));
		if (t >= 114.6) cam = mixCam(CAM0, {cx: 960, cy: 640, z: 1.1}, ease(seg(t, 115.5, 118.3)) * (1 - 0.6 * ease(seg(t, 118.307, 121.5))));
		if (t >= 123.2) layers.push(<g key="K0" opacity={ease(seg(t, 123.2, 123.97))}><World t={t} c={{idp: 'K0', sky: SKY.day, wall: 1, hall: 1, steles: 1, qlStele: 1, age: 1, west: 1, glow: 1.4, sap: 0.4}} /></g>);
	}
	/* ===== J. today, night, dawn, end 123.97 – 156.44 ===== */
	else {
		const dusk = seg(t, 133.59, 136.5), night = ease(seg(t, 135.0, 137.6)) * (1 - ease(seg(t, 140.0, 144.5))), dawn = seg(t, 140.0, 146);
		const sky: [string, string] = t < 133.59 ? SKY.day : t < 140.0 ? skyMix('dusk', 'night', night) : skyMix('night', 'dawn', dawn);
		const visO = (1 - ease(seg(t, 134.5, 136.0)));
		layers.push(<World key="K" t={t} c={{idp: 'K', sky: t < 133.59 ? SKY.day : t < 135 ? skyMix('day', 'dusk', dusk) : sky, night, stars: night, wall: 1, hall: 1, steles: 1, qlStele: 1, age: 1, west: 1, glow: 1 + 0.5 * night, sap: 0.4, drift: t * (t < 133.59 ? 8 : 2)}}
			extra={<Climbers t={t} o={(1 - ease(seg(t, 127.6, 130.0)) * 0.7) * (1 - night)} />} people={visO > 0 ? visitorsDepth(t, visO, t < 127.36 ? 1 : lerp(1, 3, seg(t, 127.36, 128.5))) : []}>
			
		</World>);
		cam = t < 126.2 ? mixCam({cx: 1150, cy: 520, z: 1.2}, CAM0, ease(seg(t, 123.97, 126.2))) : t < 140.58 ? mixCam(CAM0, {cx: 1100, cy: 520, z: 1.06}, ease(seg(t, 133.59, 140))) : mixCam({cx: 1100, cy: 520, z: 1.06}, {cx: 1180, cy: 500, z: 1.14}, ease(seg(t, 140.58, 156.4)));
		if (t >= 149.097) scrim = 0.35 * ease(seg(t, 149.097, 149.6));
	}

	const st = stampAt(t), cnt = counterAt(t), endOn = t >= 149.097;
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Defs46 />
			<Camera c={cam}>{layers}</Camera>
			{scrim > 0 && <rect width={W} height={H} fill="#1A140E" opacity={scrim} />}
			<Finish46 rays={t > 133.6 && t < 141 ? 0.2 : 0.45} />
		</svg>
		{!endOn && <Subs t={t} />}
		{seals}
		{!endOn && st[1] && st[1] !== '' && <Stamp y={st[1]} place={st[2]} l2={st[3]} />}
		{t >= 83.78 && t < 87.17 && <Src s="据《齐鲁晚报》2015" top={132 + 87 * 3 + 8} o={seg(t, 84.0, 84.4)} />}
		{!endOn && cnt !== null && <Counter n={cnt} note={t >= 2.83 && t < 5.1 ? '从前110年汉武帝首次封禅算起 · 估算' : t >= 15.85 && t < 24.34 ? '从前110年算起 · 估算' : undefined} />}
		<Brand />
		{extraHtml}
		{endOn && <EndCard t={t} t0={149.097} />}
	</>;
};
void Huai46; void SUMMIT; void POSES;
