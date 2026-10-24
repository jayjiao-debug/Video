import React from 'react';
import {W, H, rnd, lerp, clamp, ease, easeOut, easeIn, seg, mixC, C, SKY, skyMix, Glow, Defs46, Sky46, Mountain46, Torches, Altar, Wall46, Hall46, Pave46, Stele46, Cypress46, Huai46,
	Stall46, Fire46, Field46, Sapling46, SmokeBank, Pot46, Truck46, Mound46, Slips46, Book46, Scroll46, Finish46, Shadow, WALL_BASE, SUMMIT, VText} from './kit46';
import {HanBai, treeAt, STRIP_MID, WEST_MID} from './tree46';
import {Story, Punch, Stamp, Brand, Counter, SealRow, SealState, TitleCard, EndCard, Src, plainLen, Row} from './skin46';
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
	torch?: number; torch2?: number; altar?: number; age?: number; west?: number; burn?: number; legend?: number; glow?: number; sap?: number; treeO?: number; stars?: number; drift?: number; huaiDead?: number; steleGlow?: number; idp: string};
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
		{wall > 0 && <g opacity={wall}><Wall46 /></g>}
		<Pave46 earth={c.earth ?? 0} snow={c.snow ?? 0} night={n} />
		<Field46 o={(c.earth ?? 0) * (1 - n * 0.6)} />
		{(c.huaiDead ?? -1) >= 0 && <Huai46 x={-560} g={WALL_BASE + 50} h={560} dead={c.huaiDead} />}
		<g opacity={wall}>
			<Cypress46 x={260} g={WALL_BASE + 40} h={520} seed={3} grey={c.nbGrey ?? 0} bare={c.nbBare ?? 0} night={n} />
			<Cypress46 x={1840} g={WALL_BASE + 30} h={480} seed={5} grey={c.nbGrey ?? 0} bare={c.nbBare ?? 0} night={n} />
			<Cypress46 x={-120} g={WALL_BASE + 20} h={430} seed={8} grey={c.nbGrey ?? 0} bare={c.nbBare ?? 0} night={n} />
		</g>
		{extra}
		{/* steles and people sorted by their ground line, so nobody walks through stone */}
		{[...STELES.map(([x, g, s], i): Depth => ({g, node: <Stele46 key={'st' + i} x={x} g={g} s={s} k={clamp((c.steles ?? 1) * STELES.length - i)} night={n} />})),
			...((c.qlStele ?? 0) > 0 ? [{g: 940, node: <Stele46 key="qls" x={880} g={940} s={0.95} carve="tree" k={c.qlStele} glowText={c.steleGlow ?? 0} night={n} />}] : []), ...people]
			.sort((a, b) => a.g - b.g).map((d, i) => <React.Fragment key={i}>{d.node}</React.Fragment>)}
		{(c.treeO ?? 1) > 0 && <g opacity={c.treeO ?? 1}><HanBai x={TX} g={TG} s={1} age={c.age ?? 1} west={c.west ?? 1} burn={c.burn ?? 0} legend={c.legend ?? 0} glow={c.glow ?? 1} sap={c.sap ?? 0} t={t} snow={c.snow ?? 0} night={n} autumn={c.autumn ?? 0} id={`${c.idp}tree`} /></g>}
		{children}
		{n > 0 && <rect x={-1400} y={-2400} width={W + 2800} height={4000} fill="#0B1022" opacity={0.18 * n} />}
	</g>;
};

/* ---------------- the people ---------------- */
/** 1762: Qianlong walks in with two attendants, stops at the painting table, paints (right hand on the paper) */
const TABLE = {x0: 720, x1: 960, y: 0};   // table top height is set from the body below
const qianlongDepth = (t: number, o: number): Depth[] => {
	const h = 300, g = 975, stopX = 712, t0 = 59.44, walkEnd = 61.9;
	const tableTop = g - 0.56 * h;   // a little above hip height for a standing painter
	const out: Depth[] = [];
	// table (side view): top + two legs, the paper on it
	out.push({g: g - 1, node: <g key="tb" opacity={o}><Shadow x={(TABLE.x0 + TABLE.x1) / 2 + 20} y={g + 2} rx={150} ry={12} o={0.3} />
		<rect x={TABLE.x0} y={tableTop} width={TABLE.x1 - TABLE.x0} height={14} fill="#6B4A32" />
		{[TABLE.x0 + 14, TABLE.x1 - 24].map((x) => <rect key={x} x={x} y={tableTop + 14} width={10} height={g - tableTop - 14} fill="#4E3626" />)}
		<rect x={TABLE.x0 + 40} y={tableTop - 4} width={160} height={5} fill={C.paper} /></g>});
	const walking = t < walkEnd;
	if (walking) {
		const lead = (walkEnd - t0) / 1.1 * STRIDE * h, {x, pose} = walkAt(stopX - lead, 1, t, t0, h);
		const xx = Math.min(x, stopX);
		out.push({g, node: <Person key="ql" who="qianlong" t={t} x={xx} ground={g} h={h} pose={pose} look={LOOK.emperor} intent="walk" hat="qing" o={o} />});
		[[-190, 0.6], [-350, 1.3]].forEach(([dx, ph], i) => { const w = walkAt(stopX + dx - (walkEnd - t0) / 1.1 * STRIDE * h * 0.94, 1, t, t0, h * 0.94, '08_04', ph);
			out.push({g: g + 12 + 8 * i, node: <Person key={'at' + i} who={'attendant' + i} t={t} x={Math.min(w.x, stopX + dx)} ground={g + 12 + 8 * i} h={h * 0.94} pose={w.pose} look={LOOK.attendant} intent="walk" hat="qing" o={o} />}); });
	} else {
		// painting: right hand on the paper, moving with the brush stroke
		const stroke = t < 64.53 ? Math.sin((t - walkEnd) * 5.2) : 0, tgtX = (TABLE.x0 + 56 + stroke * 16 - stopX) / h, tgtY = (g - (tableTop - 4)) / h;
		const pose = reachPose({hip: 0.655, lean: 22, neck: 16, lt: 6, lk: 6, rt: -8, rk: 4, la: 16, le: 24, ra: 40, re: 40}, [tgtX, tgtY], 'R');
		const hand = jointAt(pose, 'RHand', stopX, g, h);
		out.push({g, node: <Person key="ql" who="qianlong-paint" o={o} t={t} x={stopX} ground={g} h={h} pose={pose} look={LOOK.emperor} hat="qing" hands={[{joint: 'RHand', at: [TABLE.x0 + 56 + stroke * 16, tableTop - 4], tol: 14}]} />});
		out.push({g: g + 0.5, node: <g key="brush" opacity={o}><line x1={hand[0] + 2} y1={hand[1] + 6} x2={hand[0] + 8} y2={hand[1] - 34} stroke="#3A2A1E" strokeWidth={5} /><circle cx={hand[0] + 2} cy={hand[1] + 8} r={4} fill={C.ink} /></g>});
		[[-190, 0], [-350, 1]].forEach(([dx, i]) => out.push({g: g + 12 + 8 * i, node: <Person key={'at' + i} o={o} who={'attendant' + i} t={t} x={stopX + dx} ground={g + 12 + 8 * i} h={h * 0.94} pose={grounded({hip: 0.655, lean: 4, neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: -2, le: 12, ra: 3, re: 14})} look={LOOK.attendant} hat="qing" />}));
	}
	return out;
};
/** 1928: soldiers around two cooking fires */
const soldiersDepth = (t: number, o: number): Depth[] => {
	const g = 900, h = 250, fires = [430, 760];
	const st = (k: number) => grounded({hip: 0.655, lean: 6 + k, neck: 8, lt: 2, lk: 3, rt: -4, rk: 4, la: 4, le: 18, ra: -2, re: 12});
	const P = (who: string, x: number, gg: number, k: number, look: typeof LOOK.soldier, flip?: boolean): Depth => ({g: gg, node: <Person key={who} who={who} t={t} x={x} ground={gg} h={h} pose={st(k)} look={look} flip={flip} o={o} />});
	return [...fires.map((fx, i): Depth => ({g: g + 2, node: <g key={'f' + i} opacity={o}><Fire46 x={fx} g={g + 2} s={1.1} t={t + i} /></g>})),
		P('soldier-a', 320, g, 0, LOOK.soldier), P('soldier-b', 555, g + 10, 4, LOOK.soldier2, true), P('soldier-c', 650, g + 16, 2, LOOK.soldier), P('soldier-d', 890, g + 6, 6, LOOK.soldier2, true)];
};
/** 1928: the market — stalls and a few people standing/walking at the back */
const marketDepth = (t: number, o: number): Depth[] => {
	const g = 800, h = 150, out: Depth[] = [];
	[[160, '#C9B27E', 0.9], [420, '#B98A6A', 0.9], [700, '#A9B48A', 0.85], [1650, '#C9A27E', 0.85]].forEach(([x, c, sc], i) => out.push({g: g - 2, node: <g key={'s' + i} opacity={o}><Stall46 x={x as number} g={g} s={sc as number} c={c as string} /></g>}));
	[[60, 0.0, 1], [900, 0.4, -1], [1100, 0.8, 1]].forEach(([x0, ph, dir], i) => { const gg = g + 5 + i * 5, w = walkAt(x0, dir as 1 | -1, t, 77.55, h, '08_04', ph); out.push({g: gg, node: <Person key={'w' + i} who={'walker' + i} t={t} x={w.x} ground={gg} h={h} pose={w.pose} look={[LOOK.buyer, LOOK.buyer2, LOOK.vendor][i]} intent="walk" flip={dir < 0} o={o} />}); });
	out.push({g: g + 40, node: <Person key="b1" who="buyer-s" t={t} x={240} ground={g + 40} h={h} pose={grounded({hip: 0.655, lean: 8, neck: 10, lt: 2, lk: 2, rt: -3, rk: 3, la: 2, le: 14, ra: -3, re: 10})} look={LOOK.buyer} o={o} />});
	out.push({g: g + 36, node: <Person key="b2" who="buyer-s2" t={t} x={770} ground={g + 36} h={h} pose={grounded({hip: 0.655, lean: 4, neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: 3, le: 12, ra: 2, re: 12})} look={LOOK.buyer2} flip o={o} />});
	return out;
};
/** today: visitors walking behind the tree and a few standing with phones (the phone held at the face) */
const STRIDE = 0.9759;
const visitorsDepth = (t: number, o: number, fast = 1): Depth[] => {
	const g = 860, list: Depth[] = [];
	for (let i = 0; i < 7; i++) {
		const h = 175 * (0.88 + 0.12 * rnd(i, 3)), dir: 1 | -1 = i % 2 ? -1 : 1, v = STRIDE * h / 1.1 * fast, span = 2500, x0 = dir > 0 ? -300 : 2200;
		const dist = (((t - 123.97) * v + i * 380) % span + span) % span, x = x0 + dir * dist, u = dist / (STRIDE * h);
		list.push({g: 790 + i * 4, node: <Person key={i} who={'visitor' + i} t={t} x={x} ground={790 + i * 4} h={h} o={o} pose={reground(gaitPose('08_04', u))} look={[LOOK.tourist, LOOK.tourist2, LOOK.tourist3, LOOK.child][i % 4]} intent="walk" flip={dir < 0} />});
	}
	[[560, 0], [1820, 1]].forEach(([x, k]) => {
		const flip = k === 1, h = 210, base = {hip: 0.655, lean: 2, neck: -6, lt: 2, lk: 2, rt: -3, rk: 3, la: 4, le: 14, ra: 40, re: 40};
		const pose = reachPose(base, [0.13, 0.86], 'R'), hand = jointAt(pose, 'RHand', x, g + 20, h, flip);
		list.push({g: g + 20, node: <Person key={'ph' + k} o={o} who={'photo' + k} t={t} x={x} ground={g + 20} h={h} pose={pose} look={k ? LOOK.tourist2 : LOOK.tourist3} flip={flip} hands={[{joint: 'RHand', at: hand, tol: 4}]} />});
		const flash = (Math.sin(t * 2.3 + k * 3) > 0.96) ? 1 : 0;
		list.push({g: g + 20.5, node: <g key={'pp' + k} opacity={o}><rect x={hand[0] - 7} y={hand[1] - 22} width={14} height={24} rx={3} fill="#1C1C22" />{flash > 0 && <Glow x={hand[0]} y={hand[1] - 12} r={60} c="#FFFFFF" o={0.6} id={`fl${k}`} />}</g>});
	});
	return list;
};


/* ---------------- 2024: the journey and 茂陵 ---------------- */
const Journey: React.FC<{t: number; o: number}> = ({t, o}) => {
	const u = seg(t, 109.25, 117.17), tx = lerp(-300, 1180, easeOut(seg(t, 109.25, 114.6))), moundIn = ease(seg(t, 111.6, 114.0));
	return <g opacity={o}>
		<Sky46 id="jsky" c={skyMix('day', 'gold', u)} drift={t * 2} />
		<path d={`M-200,620 L${lerp(400, 0, u)},560 L${lerp(800, 300, u)},600 L2200,640 L2200,700 L-200,700 Z`} fill="#A9B9C7" opacity={1 - moundIn * 0.7} />
		<g opacity={moundIn}><Mound46 x={1500} g={700} s={0.9} /></g>
		<rect x={-200} y={690} width={2400} height={500} fill="#C8B583" />
		{Array.from({length: 26}, (_, i) => <path key={i} d={`M${-200 + i * 100},${700 + (i % 3) * 30} L${-100 + i * 100},${700 + (i % 3) * 30}`} stroke="#B09A62" strokeWidth={3} />)}
		{Array.from({length: 9}, (_, i) => { const x = ((i * 260 - t * 120 * (1 - moundIn * 0.8)) % 2400 + 2400) % 2400 - 200; return <g key={i}><rect x={x - 4} y={600} width={8} height={100} fill="#6B5A44" /><ellipse cx={x} cy={600} rx={26} ry={70} fill="#6F8A55" /></g>; })}
		<rect x={-200} y={830} width={2400} height={70} fill="#7C7468" /><line x1={-200} y1={865} x2={2200} y2={865} stroke="#E8E0CC" strokeWidth={4} strokeDasharray="40 30" strokeDashoffset={-t * 400 * (1 - seg(t, 114.0, 114.9))} />
		<Truck46 x={tx} g={852} s={1.2} t={t} />
	</g>;
};
const Maoling: React.FC<{t: number; o: number; glow: number}> = ({t, o, glow}) => <g opacity={o}>
	<Sky46 id="msky" c={skyMix('gold', 'dusk', seg(t, 114.9, 124))} sun={[1500, 430, 460]} drift={t * 2} />
	<path d="M-200,700 L300,640 L700,670 L1200,630 L1700,660 L2200,640 L2200,760 L-200,760 Z" fill="#A9A08E" opacity={0.7} />
	<Mound46 x={960} g={760} s={1.2} rim={glow * 0.8} />
	<rect x={-200} y={750} width={2400} height={500} fill="#BBA676" />
	<rect x={-200} y={750} width={2400} height={26} fill="#9FB07C" />
	{Array.from({length: 30}, (_, i) => { const x = -100 + rnd(i, 71) * 2200, y = 790 + Math.pow(rnd(i, 72), 1.5) * 280; return <path key={i} d={`M${x},${y} q-4,-14 -10,-20 M${x + 6},${y} q2,-16 6,-22 M${x + 12},${y} q6,-12 12,-16`} stroke="#8C9A62" strokeWidth={3} fill="none" />; })}
	{glow > 0 && <Glow x={960} y={820} r={1000} c={C.glow} o={0.4 * glow} id="mlg" />}
	{glow > 0.3 && Array.from({length: 14}, (_, i) => { const a = -Math.PI / 2 + (i - 6.5) * 0.15; return <path key={i} d={`M960,880 L${960 + Math.cos(a - 0.025) * 1500},${880 + Math.sin(a - 0.025) * 1500} L${960 + Math.cos(a + 0.025) * 1500},${880 + Math.sin(a + 0.025) * 1500} Z`} fill={C.glowCore} opacity={0.08 * glow} />; })}
	{Array.from({length: 6}, (_, i) => { const x = 585 + i * 150, appear = seg(t, 114.9 + i * 0.22, 115.4 + i * 0.22); return appear > 0 && <g key={i} opacity={appear} transform={`translate(0,${(1 - easeOut(appear)) * 30})`}><Sapling46 x={x} g={900 + (i % 2) * 8} s={1.2} glow={glow} id={`mp${i}`} t={t} /></g>; })}
	{glow > 0.3 && Array.from({length: 26}, (_, i) => { const k = ((t - 118.3) * 0.25 + rnd(i, 75)) % 1; return <circle key={'m' + i} cx={560 + rnd(i, 76) * 800 + Math.sin(k * 5 + i) * 20} cy={880 - k * 600} r={2.5 + 2 * rnd(i, 77)} fill={C.glowCore} opacity={glow * (1 - k) * 0.9} />; })}
</g>;

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
	if (p.punch) { const i = p.ids[0]; return <Punch s={L[i][2]} n={typed(t, i)} o={fadeOut * clamp((t - L[i][0]) / 0.12)} top={p.top} size={p.size} />; }
	const rows: Row[] = p.ids.filter((i) => t >= L[i][0]).map((i) => ({s: L[i][2], n: typed(t, i), o: clamp((t - L[i][0]) / 0.12)}));
	return <Story rows={rows} o={fadeOut} />;
};

/* ---------------- stamp + counter by time ---------------- */
const STAMPS: [number, string, string?, string?][] = [
	[0, '2026', '岱庙', '泰山脚下 · 汉柏院'], [2.83, '相传', '前110年', '汉武帝封禅泰山'], [5.10, ''], [7.36, '年代不详', '大火'], [9.06, '1762', '乾隆'], [10.76, '今天'],
	[13.4, ''], [15.85, '前110', '泰山', '汉武帝第一次封禅'], [26.61, '前110—前89', '泰山', '据《汉书·武帝纪》'], [31.14, '约6世纪', '北魏', '郦道元《水经注》'], [38.49, '相传'],
	[41.32, ''], [44.15, '前219', '秦始皇'], [46.98, '前110', '汉武帝'], [49.81, '56', '光武帝'], [50.66, '666', '唐高宗'], [51.51, '725', '唐玄宗'], [52.36, '1008', '宋真宗', '最后一位封禅的皇帝'],
	[56.04, ''], [59.44, '1762', '乾隆', '第三次南巡归途 · 岱庙'], [66.79, '1771', '乾隆', '画刻成碑 · 立于汉柏院'], [77.55, '1928', '岱庙', '前半部改为“中山市场”'], [80.38, '民国', '岱庙', '军队驻扎大殿'],
	[87.17, '民国', '唐槐院'], [91.14, '今天', '汉柏连理', '高11.5米 · 胸围3.4米'], [96.23, '年代不详', '西干', '曾遭火焚而枯'], [99.06, '今天', '东干', '靠北面一条树皮输送养分'], [105.29, '今天', '岱庙', '采集古树种子育苗'],
	[109.25, '2024年4月', '泰山 → 茂陵', '6株“汉柏连理”的种子苗'], [114.91, '2024', '茂陵', '汉武帝的陵墓'], [123.97, '今天', '泰山', '游客连续三年超800万人次'], [138.35, ''],
];
const stampAt = (t: number) => { let s = STAMPS[0]; for (const x of STAMPS) if (t >= x[0]) s = x; return s; };
const spin = (t: number, a: number, b: number, n0: number, n1: number) => Math.round(lerp(n0, n1, easeIn(seg(t, a, b)) * 0.4 + ease(seg(t, a, b)) * 0.6));
const counterAt = (t: number): number | string | null => {
	if (t < 2.83) return '2100多'; if (t < 5.10) return 0; if (t < 7.36) return spin(t, 5.1, 7.3, 0, 1117); if (t < 9.06) return '?'; if (t < 10.76) return 1871; if (t < 13.4) return '2100多';
	if (t < 15.85) return null; if (t < 24.34) return 0; if (t < 26.61) return Math.round(lerp(0, 21, seg(t, 24.34, 26.3))); if (t < 31.14) return 21; if (t < 38.49) return '约630'; if (t < 41.32) return '约630';
	if (t < 44.15) return null; if (t < 46.98) return '—'; if (t < 49.81) return 0; if (t < 50.66) return 165; if (t < 51.51) return 775; if (t < 52.36) return 834; if (t < 56.04) return 1117;
	if (t < 59.44) return spin(t, 56.04, 59.3, 1117, 1871); if (t < 66.79) return 1871; if (t < 77.55) return 1880; if (t < 91.14) return 2037; if (t < 109.25) return 2135; if (t < 123.97) return 2133;
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
		layers.push(<World key="A" t={t} c={{idp: 'A', sky, night: fire ? 1 : t >= 5.1 && t < 7.36 ? dayNight * 0.8 : 0, earth: han, wall: 1 - han, hall: 1 - han, steles: 1 - han, age, west: t < 7.36 ? 0 : 1, burn: fire,
			legend: t >= 2.83 && t < 5.1 ? 1 : 0, glow: fire ? 0.6 : 1, sap: today, torch: t >= 2.83 && t < 7.36 ? ((t - 2.83) / 1.1) % 1.2 : -1, torch2: t >= 5.1 && t < 7.36 ? ((t - 5.1) / 0.9 + 0.5) % 1.2 : -1, stars: fire ? 1 : 0}} />);
		if (t >= 9.06 && t < 10.76) layers.push(<g key="scroll" transform={`translate(${lerp(-400, 0, easeOut(seg(t, 9.06, 9.5)))},0)`}><Scroll46 x={520} y={130} s={0.72} open={easeOut(seg(t, 9.1, 9.6))} ink={paint} /></g>);
		cam = t < 2.83 ? mixCam(CAM0, {cx: 1040, cy: 520, z: 1.06}, ease(seg(t, 0, 2.83))) : t < 10.76 ? CAM0 : mixCam(CAM0, {cx: 1300, cy: 660, z: 1.75}, ease(seg(t, 10.76, 12.2)));
		if (t > 13.0) cam = mixCam(cam, CAM0, ease(seg(t, 13.0, 13.588)));
	}
	/* ===== title 13.588 – 15.85: rewind to 110 BC ===== */
	else if (t < 15.85) {
		const u = seg(t, 13.588, 15.6), age = lerp(1, 0.04, easeIn(u) * 0.3 + ease(u) * 0.7), flick = Math.sin(u * Math.PI * 9);
		layers.push(<World key="T" t={t} c={{idp: 'T', sky: skyMix('day', u > 0.5 ? 'han' : 'night', Math.abs(flick) * 0.5), earth: ease(seg(t, 14.6, 15.6)), wall: 1 - ease(seg(t, 14.6, 15.6)), hall: 1 - ease(seg(t, 14.4, 15.4)), steles: 1 - u * 1.2, age, west: u > 0.4 ? 0 : 1, legend: ease(seg(t, 15.0, 15.8)), glow: 1}} />);
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
		cam = mixCam(mixCam(CAM0, {cx: 860, cy: -250, z: 1.35}, up), {cx: TX - 40, cy: 780, z: 1.5}, ease(seg(t, 21.8, 23.4)) * (1 - ease(seg(t, 24.0, 25.2))));
		if (doc) {
			scrim = 0.35 * ease(seg(t, 26.61, 27.2)) * (1 - ease(seg(t, 38.2, 38.8)));
			const slipsO = ease(seg(t, 26.61, 27.0)) * (1 - ease(seg(t, 31.14, 31.6)));
			if (slipsO > 0) layers.push(<g key="slips" opacity={slipsO} transform={`translate(${lerp(-300, 0, easeOut(seg(t, 26.61, 27.2)))},0)`}><Slips46 x={560} y={340} s={0.88} u={seg(t, 26.61, 28.4)} lit={8} grey={ease(seg(t, 28.87, 29.6))} />
				{t >= 28.87 && <g opacity={ease(seg(t, 28.87, 29.4))}><rect x={945} y={400} width={92} height={330} rx={8} fill="none" stroke="#FFF2D2" strokeWidth={4} strokeDasharray="12 9" /><VText x={991} y={450} s="种树" size={60} fill="#FFF2D2" />
					<line x1={955} y1={720} x2={1027} y2={410} stroke="#FFD36E" strokeWidth={6} opacity={ease(seg(t, 29.6, 30.0))} /></g>}</g>);
			const bookO = ease(seg(t, 31.14, 31.6)) * (1 - ease(seg(t, 38.3, 38.9)));
			if (bookO > 0) layers.push(<g key="book" opacity={bookO} transform={`translate(${lerp(-200, 0, easeOut(seg(t, 31.14, 31.7)))},0)`}><Book46 x={700} y={340} s={0.85} u={seg(t, 31.4, 34.3)} hl={ease(seg(t, 34.4, 35.2))} />
				{t >= 36.8 && <g opacity={ease(seg(t, 36.8, 37.2))}><text x={1150} y={640} style={{fontFamily: "'Noto Serif CJK SC',serif", fontWeight: 900, fontSize: 120}} fill="#FFD36E" stroke="#2A1A0A" strokeWidth={6} paintOrder="stroke">盖 = 大概</text></g>}</g>);
		}
	}
	/* ===== C. the six emperors, 41.32 – 56.04 ===== */
	else if (t < 56.04) {
		const lightT = [49.81, 50.66, 51.51, 52.36], lit = lightT.map((a) => t >= a);
		const nLit = lit.filter(Boolean).length, ages = [0.32, 0.45, 0.75, 0.8, 0.86], age = t < 44.15 ? 0.32 : t < 46.98 ? 0 : t < 49.81 ? 0.32 : ages[nLit];
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
		const scrollO = ease(seg(t, 62.4, 62.9)) * (1 - ease(seg(t, 66.9, 67.6))), steleK = ease(seg(t, 66.9, 68.2)), figO = 1 - ease(seg(t, 67.0, 68.0));
		layers.push(<World key="E" t={t} c={{idp: 'E', sky: skyMix('day', 'noon', seg(t, 59.44, 77)), wall: 1, hall: 1, steles: 1, qlStele: steleK, steleGlow: ease(seg(t, 74.4, 75.2)), age: 0.97, west: 0, glow: 1 + 0.4 * Math.sin(seg(t, 71.32, 74.1) * Math.PI)}}
			people={figO > 0 ? qianlongDepth(t, figO) : []} />);
		if (scrollO > 0) layers.push(<g key="scr" opacity={scrollO}><path d="M800,795 L880,760 L930,760 Z" fill="#F3EBDA" opacity={0.9} /><rect x={808} y={276} width={244} height={490} rx={14} fill="#F3EBDA" opacity={0.92} /><Scroll46 x={930} y={300} s={0.44} open={easeOut(seg(t, 62.4, 63.0))} ink={seg(t, 62.6, 64.4)} inscr={seg(t, 64.6, 65.6)} /></g>);
		if (t >= 71.32 && t < 77.4) { const o = ease(seg(t, 71.5, 72.0)) * (1 - seg(t, 77.0, 77.4)), lab = (x: number, y: number, txt: string) => <text x={x} y={y} textAnchor="middle" style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 48}} fill="#FFF8EC" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke">{txt}</text>;
			layers.push(<g key="hg" opacity={o}>{lab(880, 560, '石碑里的你')}{lab(1420, 240, '真的你')}</g>); }
		if (t >= 71.32 && t < 74.3) { const u = ease(seg(t, 71.4, 72.6)); layers.push(<path key="sight" d={`M900,700 Q1100,${560 - 120 * u} ${lerp(900, 1240, u)},${lerp(700, 560, u)}`} stroke={C.glowCore} strokeWidth={4} strokeDasharray="8 10" fill="none" opacity={0.85 * (1 - seg(t, 73.8, 74.3))} />); }
		cam = t < 69.06 ? CAM0 : mixCam(CAM0, {cx: 1080, cy: 600, z: 1.18}, ease(seg(t, 69.06, 70.6)));
		if (t > 76.6) cam = mixCam(cam, CAM0, ease(seg(t, 76.6, 77.55)));
	}
	/* ===== F. 1928, 77.55 – 91.14 ===== */
	else if (t < 91.14) {
		const smoke = ease(seg(t, 80.6, 84.5)), grey = ease(seg(t, 83.9, 86.5)), pan = ease(seg(t, 87.17, 88.6)) * (1 - ease(seg(t, 90.3, 91.1)));
		layers.push(<World key="F" t={t} c={{idp: 'F', sky: skyMix('day', 'smoke', smoke), tint: smoke * 0.6, wall: 1, hall: 1, steles: 1, qlStele: 1, age: 1, west: 0, glow: lerp(1, 0.55, smoke), nbGrey: grey, nbBare: grey * 0.75, huaiDead: ease(seg(t, 88.2, 90.4))}}
			people={[...marketDepth(t, ease(seg(t, 77.6, 78.4))), ...(t >= 80.4 ? soldiersDepth(t, ease(seg(t, 80.4, 81.0))) : [])]}>
			<SmokeBank o={smoke * 0.8} t={t} y={480} />
			{grey > 0 && Array.from({length: 18}, (_, i) => { const k = ((t - 83.9) * 0.4 + rnd(i, 5)) % 1; return <ellipse key={i} cx={(i % 2 ? 260 : 1840) + (rnd(i, 6) - 0.5) * 300 + k * 60} cy={400 + k * 450} rx={6} ry={3} fill="#8C877C" opacity={grey * (1 - k)} />; })}
		</World>);
		cam = mixCam(CAM0, {cx: 200, cy: 540, z: 1.05}, pan);
	}
	/* ===== G. you survived; half alive, 91.14 – 105.29 ===== */
	else if (t < 105.29) {
		const clear = ease(seg(t, 91.14, 92.6)), push = ease(seg(t, 93.4, 94.8)) * (1 - ease(seg(t, 102.46, 103.8)));
		const westFocus = t >= 96.23 && t < 99.06 ? ease(seg(t, 96.23, 96.8)) * (1 - ease(seg(t, 98.6, 99.06))) : 0, eastFocus = t >= 99.06 ? 1 : 0;
		layers.push(<World key="G" t={t} c={{idp: 'G', sky: skyMix('smoke', 'day', clear), tint: 0.6 * (1 - clear), wall: 1, hall: 1, steles: 1, qlStele: 1, age: 1, west: ease(seg(t, 93.4, 95.2)), glow: 1 + 0.6 * Math.exp(-Math.max(0, t - 91.14) * 1.4), nbGrey: 1, nbBare: 0.75, sap: t >= 99.06 ? 1 : 0, burn: westFocus * 0.35}}>
			<SmokeBank o={0.8 * (1 - clear)} t={t} y={480} />
		</World>);
		cam = mixCam(CAM0, {cx: TX - 40, cy: 640, z: 1.55}, push);
		// labels on the trunk
		if (westFocus > 0) { const p = treeAt(TX, TG, 1, 1, WEST_MID); layers.push(<g key="wl" opacity={westFocus}><path d={`M${p[0] - 70},${p[1] - 160} L${p[0] - 70},${p[1] + 220}`} stroke="#FFF2D2" strokeWidth={3} strokeDasharray="8 8" />
			<text x={p[0] - 90} y={p[1] - 180} textAnchor="end" style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 52}} fill="#FFF8EC" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke">西干 · 死了</text></g>); }
		if (t >= 99.06 && t < 102.6) { const p = treeAt(TX, TG, 1, 1, STRIP_MID), o = ease(seg(t, 99.1, 99.5)) * (1 - seg(t, 102.2, 102.6));
			layers.push(<text key="eastname" x={p[0] + 100} y={p[1] - 70} style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 52}} fill="#FFF8EC" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke" opacity={o}>东干 · 活着</text>); }
		if (eastFocus > 0 && t < 102.6) { const p = treeAt(TX, TG, 1, 1, STRIP_MID), o = ease(seg(t, 99.3, 99.8)) * (1 - seg(t, 102.2, 102.6));
			layers.push(<g key="el" opacity={o}><path d={`M${p[0] + 20},${p[1] - 8} L${p[0] + 90},${p[1] - 8} M${p[0] + 20},${p[1] + 8} L${p[0] + 90},${p[1] + 8}`} stroke={C.glowCore} strokeWidth={3} />
				<text x={p[0] + 100} y={p[1] + 14} style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 56}} fill="#FFD36E" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke">32厘米</text></g>); }
		if (t >= 102.46) { const o = ease(seg(t, 102.9, 103.5)), top = TG - 740, hgt = ease(seg(t, 102.9, 104.0));
			layers.push(<g key="hb" opacity={o}><line x1={1720} y1={TG} x2={1720} y2={lerp(TG, top, hgt)} stroke="#FFF2D2" strokeWidth={4} /><line x1={1700} y1={TG} x2={1740} y2={TG} stroke="#FFF2D2" strokeWidth={4} /><line x1={1700} y1={top} x2={1740} y2={top} stroke="#FFF2D2" strokeWidth={4} opacity={hgt} />
				<text x={1750} y={(TG + top) / 2} style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontWeight: 900, fontSize: 60}} fill="#FFD36E" stroke="#2A1A0A" strokeWidth={7} paintOrder="stroke">11.5米</text></g>); }
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
	/* ===== I. 2024, journey & 茂陵 109.25 – 123.97 ===== */
	else if (t < 123.97) {
		const toM = ease(seg(t, 114.4, 115.2));
		if (t < 115.2) layers.push(<Journey key="J" t={t} o={1} />);
		if (t >= 114.4) layers.push(<Maoling key="M" t={t} o={toM} glow={t < 117.17 ? 0.25 : t < 118.307 ? 0.12 : lerp(0.3, 1, easeOut(seg(t, 118.307, 119.0)))} />);
		if (t >= 117.17 && t < 118.307) scrim = 0.25 * ease(seg(t, 117.17, 117.9));
		cam = t < 114.4 ? CAM0 : mixCam(CAM0, {cx: 960, cy: 700, z: 1.12}, ease(seg(t, 116.0, 118.3)) * (1 - 0.5 * ease(seg(t, 118.307, 121))));
		if (t > 123.2) cam = mixCam(cam, {cx: 960, cy: 820, z: 2.2}, ease(seg(t, 123.2, 123.97)));
	}
	/* ===== J. today, night, dawn, end 123.97 – 156.44 ===== */
	else {
		const dusk = seg(t, 133.59, 136.5), night = ease(seg(t, 135.0, 137.6)) * (1 - ease(seg(t, 140.0, 144.5))), dawn = seg(t, 140.0, 146);
		const sky: [string, string] = t < 133.59 ? SKY.day : t < 140.0 ? skyMix('dusk', 'night', night) : skyMix('night', 'dawn', dawn);
		const visO = (1 - ease(seg(t, 134.5, 136.0)));
		layers.push(<World key="K" t={t} c={{idp: 'K', sky: t < 133.59 ? SKY.day : t < 135 ? skyMix('day', 'dusk', dusk) : sky, night, stars: night, wall: 1, hall: 1, steles: 1, qlStele: 1, age: 1, west: 1, glow: 1 + 0.5 * night, sap: 0.4, drift: t * (t < 133.59 ? 8 : 2)}}
			people={visO > 0 ? visitorsDepth(t, visO, t < 127.36 ? 1 : lerp(1, 3, seg(t, 127.36, 128.5))) : []}>
			{t < 125.0 && <rect x={-1400} y={-2400} width={4800} height={4800} fill={C.glowCore} opacity={0.65 * (1 - ease(seg(t, 123.97, 125.0)))} />}
		</World>);
		cam = t < 125 ? mixCam({cx: TX, cy: 520, z: 1.9}, CAM0, ease(seg(t, 123.97, 126.2))) : t < 140.58 ? mixCam(CAM0, {cx: 1100, cy: 520, z: 1.06}, ease(seg(t, 133.59, 140))) : mixCam({cx: 1100, cy: 520, z: 1.06}, {cx: 1180, cy: 500, z: 1.14}, ease(seg(t, 140.58, 156.4)));
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
