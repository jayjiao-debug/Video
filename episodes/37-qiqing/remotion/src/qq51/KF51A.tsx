import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Img} from 'remotion';
import {W, H, Subs, Counter, grounded, walkPose, lerp, rnd, KAI, SANS, SERIF, SAFE_X, SAFE_Y} from '../qq50/kit50';
import {B, BG, thB, curl, LacDefs, Lacquer, Vignette, Pool, SealB, ScrollBand} from '../qq50/styleB';
import {ikArm, toBody, J} from '../qq50/props50';
import {Pose} from '../qq44/figure44';
import {useStampFonts, YEAR, SEAL_SRC} from '../qq44/skin44';
import {Defs51, ICE, BRZ, SNOW, IceBlock, IceCubes, IcePool, Chisel, Cup, Snow, FrozenRiver, Jianfou, jfGeom, Fridge, fridgeGeom, LOOKS51, Walker51, Forearm, P2} from './props51';
/* ep51 key frames, Builder A: CHARS, KF01–KF08, KF15, KF16 in the ep50 look (B v3 「漆」, night) + the one cool accent (ice).
   KF51A-ALL renders frame i = [CHARS, KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF15, KF16][i]. */

/** subtitles are verbatim from 51-bing/lines_read.json; ASCII quote pairs become curly “ ” */
const cq = (s: string) => { let k = 0; return s.replace(/"/g, () => (k++ % 2 === 0 ? '“' : '”')); };
const rows = (s: string) => cq(s).split('\n').map((r) => ({s: r}));
const Fonts: React.FC<{s: string}> = ({s}) => { useStampFonts(s); return null; };

/* ---------- furniture ---------- */
const StampK: React.FC<{y: string; place?: string; note: string}> = ({y, place, note}) => { useStampFonts(`${y}${place ?? ''}${note}·—〃`);
	const num = /^[0-9.]+$/.test(y);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: num ? YEAR : KAI, fontWeight: num ? 600 : 700, fontSize: num ? 48 : 38}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.88}}>{note}</div>
	</div>; };
const Label: React.FC<{x: number; y: number; s: string; fs?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; o?: number; font?: string}> = ({x, y, s, fs = 40, col = B.cream, anchor = 'start', o = 1, font = KAI}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={font === KAI ? 700 : 900} fontSize={fs} fill={col} opacity={o} stroke={B.lac} strokeWidth={Math.max(5, fs * 0.14)} style={{paintOrder: 'stroke'}}>{s}</text>;
/** a number tag on a dark panel: label (≥ 56 px) + numeral (≥ 96 px) */
const NumTag: React.FC<{x: number; y: number; label: string; num: string; w: number}> = ({x, y, label, num, w}) => <g transform={`translate(${x},${y})`}>
	<rect x={0} y={0} width={w} height={140} rx={10} fill="#0E0705" fillOpacity={0.9} stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
	<text x={28} y={98} fontFamily={KAI} fontWeight={700} fontSize={58} fill={B.cream}>{label}</text>
	<text x={w - 28} y={106} textAnchor="end" fontFamily={SANS} fontWeight={900} fontSize={104} fill={B.goldL}>{num}</text></g>;
const Frame: React.FC<{id: string; children: React.ReactNode; over?: React.ReactNode; sheen?: number}> = ({id, children, over, sheen = 0.3}) => <>
	<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><Defs51 /><Lacquer sheen={sheen} id={id} />{children}<Vignette id={id} /></svg>{over}</>;
const Ground: React.FC<{g: number; lattice?: boolean}> = ({g, lattice = true}) => <g>
	<rect x={-40} y={g} width={W + 80} height={H - g + 40} fill={BG.ground} /><rect x={-40} y={g} width={W + 80} height={3} fill={B.gold} opacity={0.28} />
	{lattice && <path d={Array.from({length: 24}, (_, i) => `M${-60 + i * 90},${g + 30} l45,40 l-45,40 l-45,-40 Z`).join(' ')} fill="none" stroke={B.gold} strokeWidth={1.5} opacity={0.1} />}
</g>;
/** centred Q/end-card style row with the ½-em trailing-punctuation pull */
const SubsC: React.FC<{s: string; y: number; fs?: number}> = ({s, y, fs = 65}) => { const t = cq(s), len = t.length, tw = fs * len * 1.03, last = t.slice(-1), pull = /[。？！，]/.test(last) ? 0.53 : 0;
	return <>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: y - 150, width: tw + 520, height: fs * 1.5 + 300, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			{pull ? <>{t.slice(0, -1)}<span style={{marginRight: `${-pull}em`}}>{last}</span></> : t}</div></>; };

/* ---------- pose helpers ---------- */
const stand = (k: Partial<{lean: number; neck: number; la: number; le: number; ra: number; re: number}> = {}) => grounded({lean: 3, neck: 4, lt: 3, lk: 3, rt: -4, rk: 4, la: -3, le: 10, ra: 4, re: 14, ...k});
const reach = (p: Pose, s: 'L' | 'R', X: number, Y: number, x: number, g: number, h: number, flip = false) => ikArm(p, s, toBody(X, Y, x, g, h, flip));
/** a bundle of bamboo slips (tally), held upright: (x, y) = bottom centre */
const Tally: React.FC<{x: number; y: number; h: number; rot?: number}> = ({x, y, h, rot = 0}) => <g transform={`translate(${x},${y}) rotate(${rot})`}>
	{[-1, 0, 1].map((i) => <rect key={i} x={i * h * 0.075 - h * 0.035} y={-h} width={h * 0.07} height={h} rx={1.5} fill="#C9A86A" stroke="#6E5530" strokeWidth={1} />)}
	<path d={`M${-h * 0.15},${-h * 0.72} H${h * 0.15} M${-h * 0.15},${-h * 0.28} H${h * 0.15}`} stroke="#5A3A18" strokeWidth={1.6} /></g>;

/* ---------- small cold-thing icons (KF15) ---------- */
const IceMountain: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	const d = `M${-60 * k},0 L${-42 * k},${-46 * k} L${-30 * k},${-38 * k} L${-12 * k},${-96 * k} L${4 * k},${-64 * k} L${18 * k},${-82 * k} L${40 * k},${-30 * k} L${60 * k},0 Z`;
	return <g transform={`translate(${x},${y})`}>
		<path d={d} fill="url(#ice51F)" opacity={0.92} stroke={ICE.line} strokeWidth={2} strokeLinejoin="round" />
		<path d={`M${-12 * k},${-96 * k} L${-6 * k},${-20 * k} L${4 * k},${-64 * k} M${18 * k},${-82 * k} L${14 * k},${-18 * k} M${-42 * k},${-46 * k} L${-34 * k},${-8 * k}`} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={2} fill="none" />
		<path d={`M${-12 * k},${-96 * k} L${-22 * k},${-40 * k} L${-16 * k},${-40 * k} Z`} fill="#FFFFFF" opacity={0.6} />
		<ellipse cx={0} cy={2} rx={70 * k} ry={8 * k} fill="none" stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} /></g>; };
const SuShan: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	/* a small dish with three piped/drizzled cream peaks: spiral bands across each cone, tips tinted red / green */
	const peak = (cx: number, base: number, ht: number, wd: number, tint: string, i: number) => { const top = base - ht;
		const body = `M${cx - wd / 2},${base} Q${cx - wd * 0.46},${base - ht * 0.45} ${cx - wd * 0.14},${top + ht * 0.2} Q${cx - wd * 0.02},${top - ht * 0.04} ${cx + wd * 0.12},${top + ht * 0.05} Q${cx + wd * 0.1},${top + ht * 0.16} ${cx + wd * 0.16},${top + ht * 0.24} Q${cx + wd * 0.46},${base - ht * 0.45} ${cx + wd / 2},${base} Z`;
		const bands = [0.22, 0.45, 0.68].map((u) => { const yy = top + ht * (0.18 + u * 0.8), hw = wd * (0.12 + 0.4 * u); return `M${cx - hw},${yy} Q${cx},${yy + ht * 0.12} ${cx + hw},${yy - ht * 0.04}`; }).join(' ');
		return <g key={i}><path d={body} fill={B.cream} stroke="#BFA77C" strokeWidth={1.5} />
			<path d={bands} stroke="#C9B08A" strokeWidth={2.4 * k} fill="none" strokeLinecap="round" />
			<path d={`M${cx - wd * 0.14},${top + ht * 0.2} Q${cx - wd * 0.02},${top - ht * 0.04} ${cx + wd * 0.12},${top + ht * 0.05} Q${cx + wd * 0.1},${top + ht * 0.16} ${cx + wd * 0.16},${top + ht * 0.24}`} fill="none" stroke={tint} strokeWidth={5 * k} strokeLinecap="round" opacity={0.75} />
			<path d={`M${cx + wd * 0.18},${top + ht * 0.4} q${3 * k},${8 * k} 0,${14 * k}`} stroke="#E8DCC0" strokeWidth={2.5 * k} fill="none" strokeLinecap="round" /></g>; };
	return <g transform={`translate(${x},${y})`}>
		<ellipse cx={0} cy={-6 * k} rx={64 * k} ry={13 * k} fill="#2A1710" stroke={B.gold} strokeOpacity={0.7} strokeWidth={2} />
		<ellipse cx={0} cy={-9 * k} rx={54 * k} ry={9 * k} fill="#3A2116" />
		{peak(-30 * k, -8 * k, 52 * k, 40 * k, '#C8503A', 0)}{peak(28 * k, -8 * k, 48 * k, 38 * k, '#5E9A6A', 1)}{peak(0, -4 * k, 76 * k, 48 * k, '#C8503A', 2)}
	</g>; };
const SilverBowl: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	/* a wide, shallow silver bowl on a low foot ring, a heaped mound of shaved ice above the rim, a bright glint */
	const rimY = -30 * k, rw = 66 * k;
	return <g transform={`translate(${x},${y})`}>
		<path d={`M${-18 * k},0 L${-14 * k},${-8 * k} L${14 * k},${-8 * k} L${18 * k},0 Z`} fill="url(#slv51)" stroke="#59636A" strokeWidth={1.2} />
		<path d={`M${-rw},${rimY} Q${-rw * 0.9},${-8 * k} ${-14 * k},${-8 * k} L${14 * k},${-8 * k} Q${rw * 0.9},${-8 * k} ${rw},${rimY} Z`} fill="url(#slv51)" stroke="#59636A" strokeWidth={1.5} />
		<path d={`M${-rw},${rimY} Q${-30 * k},${-82 * k} ${-4 * k},${-80 * k} Q${10 * k},${-90 * k} ${24 * k},${-74 * k} Q${52 * k},${-62 * k} ${rw},${rimY} Z`} fill="url(#ice51T)" stroke={ICE.line} strokeWidth={1.8} />
		{Array.from({length: 22}, (_, i) => <circle key={i} cx={(-50 + 100 * rnd(i, 3)) * k} cy={(-36 - 34 * rnd(i, 4) * (1 - Math.abs(rnd(i, 3) - 0.5))) * k} r={1.8 * k} fill={i % 3 ? ICE.shade : '#FFFFFF'} opacity={0.7} />)}
		<ellipse cx={0} cy={rimY} rx={rw} ry={6 * k} fill="none" stroke="#F4F8FA" strokeWidth={2.5} />
		<path d={`M${-rw * 0.62},${rimY + 8 * k} Q${-rw * 0.5},${rimY + 17 * k} ${-rw * 0.24},${rimY + 20 * k}`} stroke="#FFFFFF" strokeWidth={5 * k} fill="none" strokeLinecap="round" />
		<g transform={`translate(${rw * 0.44},${rimY + 10 * k})`} fill="#FFFFFF"><path d={`M0,${-14 * k} L${2.2 * k},${-2.2 * k} L${14 * k},0 L${2.2 * k},${2.2 * k} L0,${14 * k} L${-2.2 * k},${2.2 * k} L${-14 * k},0 L${-2.2 * k},${-2.2 * k} Z`} /></g>
	</g>; };
const IceTicket: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	return <g transform={`translate(${x},${y}) rotate(-4)`}>
		<rect x={-30 * k} y={-110 * k} width={60 * k} height={110 * k} fill="#EFE2C4" stroke="#8A6A3A" strokeWidth={1.5} />
		<rect x={-24 * k} y={-104 * k} width={48 * k} height={98 * k} fill="none" stroke="#22150F" strokeWidth={1.4} />
		{[-12, 0, 12].map((dx, i) => <path key={i} d={`M${dx * k},${-94 * k} v${14 * k} m0,${6 * k} v${10 * k} m0,${6 * k} v${16 * k}`} stroke="#22150F" strokeWidth={3 * k} strokeLinecap="round" />)}
		<rect x={-14 * k} y={-38 * k} width={28 * k} height={28 * k} fill="#BF3420" opacity={0.9} /></g>; };
const PlumBowl: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => { const k = s / 100;
	return <g transform={`translate(${x},${y})`}>
		<path d={`M${-46 * k},${-40 * k} Q${-40 * k},${-8 * k} ${-16 * k},${-4 * k} L${-14 * k},0 L${14 * k},0 L${16 * k},${-4 * k} Q${40 * k},${-8 * k} ${46 * k},${-40 * k} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.5} />
		<ellipse cx={0} cy={-40 * k} rx={46 * k} ry={10 * k} fill="#3A120C" stroke={BRZ.hi} strokeWidth={2} />
		<ellipse cx={-6 * k} cy={-42 * k} rx={30 * k} ry={5 * k} fill="#6A2418" opacity={0.8} />
		<g transform={`translate(${12 * k},${-46 * k}) rotate(12)`}><rect x={-9 * k} y={-9 * k} width={18 * k} height={18 * k} rx={3} fill="url(#ice51F)" stroke={ICE.line} strokeWidth={1.2} /></g></g>; };
const EnamelBox: React.FC<{x: number; y: number; s: number; breath?: number}> = ({x, y, s, breath = 1}) => { const k = s / 100;
	return <g transform={`translate(${x},${y})`}>
		<path d={`M${-50 * k},0 L${-44 * k},${-18 * k} L${44 * k},${-18 * k} L${50 * k},0 Z`} fill="#2A1710" stroke={B.gold} strokeOpacity={0.6} strokeWidth={1.5} />
		<rect x={-46 * k} y={-84 * k} width={92 * k} height={66 * k} fill="#1F4E7A" stroke="#E8BC66" strokeWidth={2} />
		<path d={`M${-40 * k},${-76 * k} h${80 * k} v${50 * k} h${-80 * k} Z M${-20 * k},${-52 * k} q${20 * k},${-20 * k} ${40 * k},0 q${-20 * k},${20 * k} ${-40 * k},0`} fill="none" stroke="#E8BC66" strokeWidth={1.5} opacity={0.9} />
		<path d={`M${-52 * k},${-84 * k} L${52 * k},${-84 * k} L${46 * k},${-96 * k} L${-46 * k},${-96 * k} Z`} fill="#2C6494" stroke="#E8BC66" strokeWidth={2} />
		{[-26, 0, 26].map((dx, i) => <g key={i}><circle cx={dx * k} cy={-90 * k} r={5 * k} fill="#0E0705" stroke="#E8BC66" strokeWidth={1.2} /><rect x={dx * k - 2 * k} y={-92 * k} width={4 * k} height={4 * k} fill="#E8BC66" /></g>)}
		{breath > 0 && [-26, 0, 26].map((dx, i) => <path key={i} d={curl(dx * k + 4, -110 * k, 9 * k, i % 2 ? -1 : 1, 1.6, 0.4)} fill="none" stroke="#DCEFF8" strokeOpacity={0.6 * breath} strokeWidth={2.5} strokeLinecap="round" />)}</g>; };

/* =========================================== KEY FRAMES =========================================== */
/* KF01 · 0.0 · H1 — frame 0, first person: your one-tone forearm pulls the fridge door open; the iced drink in your other
   hand; inside, in place of shelves, the bronze 鉴缶, warm-rimmed, the brightest thing. KF02 · 2.9: the fridge light is dead,
   the vessel stays lit, row 2 typed, counter 战国早期, stamp on. */
const FridgeShot: React.FC<{t: number; light: number}> = ({t, light}) => {
	const x0 = 820, y0 = -40, fw = 680, fh = 1060, G = fridgeGeom(x0, y0, fw, fh), vx = (G.bx0 + G.bx1) / 2, vy = G.iy1 - 18, vw = 380;
	const r1 = '2400多年前，中国就有"冰箱"了。', r2 = '可它自己，[不会冷]。';
	return <Frame id={`f${light}`} sheen={0.15} over={<><Subs rows={light > 0.5 ? rows(r1) : rows(`${r1}\n${r2}`)} th={thB} />
		{light > 0.5 ? <Counter year="2026" th={thB} /> : <><StampK y="战国早期" place="湖北随州" note="曾侯乙墓的铜鉴缶" /><Counter era="战国早期" th={thB} /></>}<SealB /></>}>
		{/* your kitchen at night: a dark wall, a counter run on the left with a gold hairline, a tiled splash */}
		<rect x={-40} y={0} width={W + 80} height={H} fill="#140A07" opacity={0.5} />
		<rect x={-40} y={700} width={880} height={400} fill="#1E100B" /><rect x={-40} y={700} width={880} height={3} fill={B.gold} opacity={0.3} />
		<path d={Array.from({length: 10}, (_, i) => `M${-40 + i * 90},420 V700`).join(' ') + ' M-40,510 H840 M-40,600 H840'} stroke={B.gold} strokeOpacity={0.06} strokeWidth={1.5} />
		<rect x={1500} y={700} width={460} height={400} fill="#1E100B" /><rect x={1500} y={700} width={460} height={3} fill={B.gold} opacity={0.3} />
		<Fridge x0={x0} y0={y0} w={fw} h={fh} open={0.92} light={light} id={`fr${light}`}>
			{/* the vessel stands where the shelves would be; its own warm light stays on */}
			<Pool id={`v${light}`} x={vx} y={vy - 170} rx={330} ry={260} a={light > 0.5 ? 0.22 : 0.34} />
			<ellipse cx={vx} cy={vy + 4} rx={vw * 0.62} ry={16} fill="#000" opacity={0.35} />
			<g filter="url(#sh51)"><Jianfou x={vx} y={vy} w={vw} glow={1} id={`jf${light}`} /></g>
		</Fridge>
		{/* left forearm from the bottom-left, the mitten closed on the door's free edge */}
		<Forearm el={[120, 1180]} wr={[546, 674]} size={36} thumb={-1} />
		{/* the iced drink in the right hand */}
		<Cup x={1560} y={905} w={112} frost={0.6} />
		<Forearm el={[1640, 1200]} wr={[1574, 894]} size={34} thumb={1} sleeve />
		{void t}
	</Frame>; };
const KF01: React.FC = () => <FridgeShot t={0} light={1} />;
const KF02: React.FC = () => <FridgeShot t={2.9} light={0} />;

/* KF03 · 9.0 · H3 end of the rewind: the frozen river at night, snow, the ice block on the ice, the walker revealed (周 padded
   winter robe) with his chisel resting on the block */
const RiverWalker: React.FC<{t: number; title?: boolean}> = ({t, title}) => {
	const g = title ? 900 : 880, h = title ? 470 : 540, x = title ? 800 : 860, bx = title ? 1040 : 1110, bw = 240, bh = 150;
	const tip: P2 = [bx - 70, g - bh - 12], butt: P2 = [tip[0] - 52 * h / 540, tip[1] - 168 * h / 540];
	let p = stand({lean: 8, neck: 18, la: 10, le: 20, ra: 4, re: 16});
	p = reach(p, 'L', butt[0] + 10, butt[1] + 26, x, g, h);
	const rot = Math.atan2(tip[1] - butt[1], tip[0] - butt[0]) * 180 / Math.PI, L = Math.hypot(tip[0] - butt[0], tip[1] - butt[1]);
	return <>
		<FrozenRiver g={g} t={t} id={title ? 'r4' : 'r3'} />
		<Pool id={title ? 'r4' : 'r3'} x={x + 60} y={640} rx={520} ry={420} a={0.24} />
		<Pool id={title ? 'r4f' : 'r3f'} x={x} y={g + 4} rx={260} ry={36} a={0.22} />
		<IcePool x={bx + 20} y={g + 6} rx={240} />
		<IceBlock x={bx} y={g} w={bw} h={bh} d={110} seed={3} />
		{/* the chips where the block was cut out of the sheet */}
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M0,0 l${6 + 6 * rnd(i, 2)},${-4 - 4 * rnd(i, 3)} l${4 + 4 * rnd(i, 4)},${6 + 3 * rnd(i, 5)} Z`} transform={`translate(${bx - 170 + 360 * rnd(i, 7)},${g + 6 + 26 * rnd(i, 8)})`} fill={ICE.body} opacity={0.75} />)}
		<path d={`M${bx - 190},${g + 34} L${bx + 210},${g + 34} L${bx + 260},${g + 8} L${bx - 140},${g + 8} Z`} fill="#0C0605" opacity={0.6} />
		<Walker51 x={x} g={g} h={h} pose={p} look={LOOKS51.zhou.look} />
		<Chisel x={butt[0]} y={butt[1]} L={L} rot={rot} />
		{/* the mitten closes over the handle */}
		<circle cx={J(p, 'LHand', x, g, h)[0] + 4} cy={J(p, 'LHand', x, g, h)[1] + 4} r={15} fill={B.lac} stroke={BG.rim} strokeOpacity={0.6} strokeWidth={1.5} />
		<Snow t={t} n={150} seed={3} />
	</>; };
const KF03: React.FC = () => <Frame id="k3" sheen={0.2} over={<><Subs rows={rows('从冬天，一直撑到夏天。')} th={thB} /><Counter era="周" th={thB} /><SealB /></>}><RiverWalker t={9.0} /></Frame>;

/* KF04 · 11.0 · TITLE: the ep50 plaque above the walker on the frozen river, snow drifting; no subtitle, no stamp */
const TitlePlaque: React.FC = () => { const fs = 116, ls = 0.06, PX = 960, PY = 206, PW = 1180, PH2 = 296;
	const curlD = (x: number, y: number, r: number, dir = 1) => { const pts: string[] = []; for (let i = 0; i <= 30; i++) { const th = (i / 30) * 2.2 * Math.PI, rr = r * (0.15 + 0.85 * i / 30); pts.push(`${(x + dir * rr * Math.cos(th)).toFixed(1)},${(y - rr * Math.sin(th)).toFixed(1)}`); } return 'M' + pts.join('L'); };
	return <div style={{position: 'absolute', inset: 0}}>
		<div style={{position: 'absolute', left: PX - PW / 2 - 120, top: PY - PH2 / 2 - 90, width: PW + 240, height: PH2 + 180, background: 'radial-gradient(closest-side, rgba(10,5,3,0.82), rgba(10,5,3,0.72) 60%, rgba(10,5,3,0))'}} />
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			<rect x={PX - PW / 2} y={PY - PH2 / 2} width={PW} height={PH2} fill="none" stroke={B.gold} strokeOpacity={0.55} strokeWidth={2} />
			<rect x={PX - PW / 2 + 10} y={PY - PH2 / 2 + 10} width={PW - 20} height={PH2 - 20} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.2} />
			{[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], k) => <path key={k} d={curlD(PX + dx * (PW / 2 - 34), PY + dy * (PH2 / 2 - 34), 20, -dx)} fill="none" stroke={B.goldL} strokeOpacity={0.7} strokeWidth={2.2} strokeLinecap="round" />)}
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: 84, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.12, letterSpacing: `${ls}em`, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			<div style={{color: '#FFF6E6'}}><span style={{position: 'relative', left: `${ls / 2}em`}}>古代没有冰箱</span></div>
			<div style={{color: B.gold}}><span style={{position: 'relative', left: `${(0.5 + ls) / 2}em`}}>夏天怎么吃冰？</span></div>
		</div></div>; };
const KF04: React.FC = () => <Frame id="k4" sheen={0.25} over={<><TitlePlaque /><Counter era="周" th={thB} /><SealB /></>}><RiverWalker t={11.0} title /></Frame>;

/* KF05 · 19.5 · Z1 row 2: by the dark pit mouth (冰窖), two robed officials with bamboo tallies check the blocks in; a file of
   80 small labourers hauls blocks on ropes from the river; tag 干活的 × 80; the walker passing in front */
const haulPose = (ph: number) => ikArm(ikArm(grounded({lean: 24 + 3 * Math.sin(ph), neck: -12, lt: 26 + 8 * Math.sin(ph), lk: 18, rt: -18 - 8 * Math.sin(ph), rk: 14, la: -30, le: 10, ra: -26, re: 14}), 'L', [-0.12, 0.5]), 'R', [-0.1, 0.48]);
/** one labourer hauling a block on a sledge (CHARS) */
const Hauler: React.FC<{x: number; g: number; h: number; ph: number; o?: number}> = ({x, g, h, ph, o = 1}) => {
	const p = haulPose(ph), hand = J(p, 'LHand', x, g, h), bw = h * 0.42, bx = x - h * 0.75;
	return <g opacity={o}>
		<path d={`M${hand[0]},${hand[1]} L${bx + bw * 0.5},${g - h * 0.12}`} stroke="#A88A5C" strokeWidth={Math.max(1, h * 0.012)} />
		<rect x={bx - bw * 0.55} y={g - h * 0.03} width={bw * 1.1} height={h * 0.03} fill="#3A2116" />
		<IceBlock x={bx} y={g - h * 0.03} w={bw} h={bw * 0.6} d={bw * 0.35} marks={h > 80} seed={Math.round(x)} />
		<Walker51 x={x} g={g} h={h} pose={p} look={{dress: 'tunic', legs: 'bare', head: 'bun'}} col="#100806" rimO={0.55} />
	</g>; };
/** a team of four hauling one block on a sledge; x = the lead hauler, dir = walking direction */
const Team: React.FC<{x: number; g: number; h: number; dir: 1 | -1; seed: number}> = ({x, g, h, dir, seed}) => {
	const gap = 0.36 * h, bw = 0.8 * h, bx = x - dir * (3 * gap + 0.75 * h), ropeY = g - h * 0.12, flip = dir === -1;
	const ps = [0, 1, 2, 3].map((k) => ({x: x - dir * k * gap, p: haulPose(seed + k * 1.7)}));
	const hands = ps.map((o) => J(o.p, 'LHand', o.x, g, h, flip));
	return <g>
		<path d={`M${hands[0][0]},${hands[0][1]} ${hands.slice(1).map((q) => `L${q[0]},${q[1]}`).join(' ')} L${bx + dir * bw * 0.5},${ropeY}`} stroke="#A88A5C" strokeWidth={Math.max(1, h * 0.02)} fill="none" />
		<rect x={bx - bw * 0.6} y={g - h * 0.04} width={bw * 1.2} height={h * 0.04} fill="#3A2116" />
		<IceBlock x={bx} y={g - h * 0.04} w={bw} h={bw * 0.62} d={bw * 0.35} marks={h > 55} seed={seed} side={dir} />
		{ps.map((o, k) => <Walker51 key={k} x={o.x} g={g} h={h} pose={o.p} look={{dress: 'tunic', legs: 'bare', head: 'bun'}} col="#100806" flip={flip} rimO={0.5} />)}
	</g>; };
const KF05: React.FC = () => { const g = 960, h = 480, wx = 300;
	/* 20 teams × 4 = 80, on a switchback path from the river (far, small) down to the pit mouth (right) */
	const rowsT: {g: number; h: number; dir: 1 | -1; xs: number[]}[] = [
		{g: 655, h: 34, dir: 1, xs: Array.from({length: 9}, (_, i) => 250 + i * 100)},
		{g: 712, h: 48, dir: -1, xs: Array.from({length: 6}, (_, i) => 1010 - i * 142)},
		{g: 790, h: 66, dir: 1, xs: Array.from({length: 5}, (_, i) => 300 + i * 180)},
	];
	const o1 = ikArm(ikArm(stand({lean: 6, neck: 18, la: 40, le: 60, ra: 50, re: 70}), 'L', [0.2, 0.66]), 'R', [0.16, 0.6]);
	const o2 = ikArm(stand({lean: 2, neck: 10, la: 50, le: 70, ra: 6, re: 12}), 'L', [0.22, 0.68]);
	const wp = walkPose(0.2);
	return <Frame id="k5" sheen={0.2} over={<><Fonts s="冰窖干活的×80" /><Subs rows={rows('还设了专管冰的官，\n手下光干活的，就有80人。')} th={thB} /><StampK y="《周礼·天官》" note="冰官手下：徒八十人" /><Counter era="周" th={thB} /><SealB /></>}>
		{/* far bank and the frozen river behind */}
		<path d={`M-40,600 Q300,540 620,580 Q980,520 1320,570 Q1640,530 1960,580 V640 H-40 Z`} fill={B.far} />
		<path d={`M-40,600 Q300,540 620,580 Q980,520 1320,570 Q1640,530 1960,580`} fill="none" stroke={SNOW} strokeOpacity={0.18} strokeWidth={3} />
		<rect x={-40} y={630} width={W + 80} height={400} fill="#1A120F" />
		<path d="M-40,632 H1960" stroke={SNOW} strokeOpacity={0.2} strokeWidth={3} />
		<Pool id="k5" x={1100} y={720} rx={720} ry={300} a={0.22} />
		{/* the trodden switchback path, ending at the ramp */}
		<path d="M140,658 H1150 Q1220,668 1150,700 H140 Q60,730 140,770 H1000 Q1060,780 1080,850" fill="none" stroke="#3A2A20" strokeWidth={22} strokeLinejoin="round" opacity={0.8} />
		{/* the pit: a hole in the ground plane. Far inner wall (earth courses, lit at the top, fading down), a black depth,
		    a pale lip round the opening, and a ramp running down into it from the left with a block going in */}
		<defs>
			<linearGradient id="k5wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7A5434" /><stop offset="0.35" stopColor="#4A3020" /><stop offset="0.75" stopColor="#1E110A" /><stop offset="1" stopColor="#050202" /></linearGradient>
			<radialGradient id="k5hole" cx="0.5" cy="0.75" r="0.7"><stop offset="0" stopColor="#020101" /><stop offset="0.7" stopColor="#080403" /><stop offset="1" stopColor="#1A0E09" /></radialGradient>
			<clipPath id="k5open"><path d="M1200,822 L1560,822 L1630,904 L1150,904 Z" /></clipPath>
			<linearGradient id="k5ramp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A2A20" /><stop offset="1" stopColor="#0A0504" /></linearGradient>
		</defs>
		<path d="M1200,822 L1560,822 L1630,904 L1150,904 Z" fill="url(#k5hole)" />
		<g clipPath="url(#k5open)">
			<path d="M1200,822 L1560,822 L1540,884 L1222,884 Z" fill="url(#k5wall)" />
			<path d="M1560,822 L1630,904 L1590,904 L1540,884 Z" fill="#2A1A10" />
			<path d="M1200,822 L1222,884 L1190,904 L1150,904 Z" fill="#1A0F09" />
			{[836, 852, 868].map((y) => <path key={y} d={`M1190,${y} H1570`} stroke="#0E0705" strokeOpacity={0.5} strokeWidth={1.5} />)}
			{[1222, 1540].map((x, i) => <path key={i} d={`M${i ? 1560 : 1200},822 L${x},884`} stroke="#8A6040" strokeOpacity={0.5} strokeWidth={2} />)}
			<Pool id="k5p" x={1380} y={830} rx={200} ry={30} a={0.25} />
			{/* the ramp going down from the left edge into the dark */}
			<path d="M1150,904 L1196,826 L1330,872 L1300,904 Z" fill="url(#k5ramp)" />
		</g>
		<path d="M1060,846 L1196,826 L1150,904 L1050,890 Z" fill="#3A2A20" />
		<path d="M1200,822 L1560,822 L1630,904 L1150,904 Z" fill="none" stroke={SNOW} strokeOpacity={0.32} strokeWidth={3} strokeLinejoin="round" />
		<path d="M1196,822 L1564,822" stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} />
		<g clipPath="url(#k5open)"><IceBlock x={1272} y={926} w={90} h={52} d={30} seed={41} rot={14} /></g>
		
		<Label x={1400} y={806} s="冰窖" fs={52} anchor="middle" col={B.goldL} />
		{rowsT.map((r, ri) => r.xs.map((x, i) => <Team key={`${ri}-${i}`} x={x} g={r.g} h={r.h} dir={r.dir} seed={ri * 10 + i} />))}
		{/* the two officials on the ground beside the pit, tallies in hand, facing the file */}
		<Walker51 x={1262} g={814} h={280} pose={o2} look={{dress: 'robe', head: 'guan', beard: 'long'}} col="#0F0806" flip rimO={0.6} />
		<Tally x={1262 - 0.22 * 280} y={814 - 0.62 * 280} h={72} rot={-10} />
		<Walker51 x={1664} g={884} h={320} pose={o1} look={{dress: 'robe', head: 'guan', beard: 'short'}} col="#0F0806" flip rimO={0.6} />
		<Tally x={1664 - 0.2 * 320} y={884 - 0.6 * 320} h={84} rot={8} />
		<NumTag x={560} y={420} label="干活的 ×" num="80" w={430} />
		<rect x={-40} y={g} width={W + 80} height={H - g + 40} fill={BG.ground} /><rect x={-40} y={g} width={W + 80} height={3} fill={B.gold} opacity={0.28} />
		<Pool id="k5f" x={wx} y={g + 4} rx={240} ry={34} a={0.25} />
		<Walker51 x={wx} g={g} h={h} pose={wp} look={LOOKS51.zhou.look} />
		<Snow t={19.5} n={80} seed={5} o={0.6} />
	</Frame>; };

/* KF06 · 22.5 · Z3 「凿冰，要备足[三倍]的量。」 section of the pit: three blocks side by side on the straw, tag ×3, a small ？
   hangs over them from the pit's roof beam; the walker at the rim */
const PitSection: React.FC<{t: number; id: string}> = ({id}) => { const gs = 560, pf = 950;
	return <g>
		<path d={`M-40,${gs - 40} Q400,${gs - 90} 900,${gs - 60} Q1400,${gs - 100} 1960,${gs - 50} V${gs} H-40 Z`} fill={B.far} />
		<path d={`M-40,${gs - 40} Q400,${gs - 90} 900,${gs - 60} Q1400,${gs - 100} 1960,${gs - 50}`} fill="none" stroke={SNOW} strokeOpacity={0.16} strokeWidth={3} />
		{/* earth in section: courses of rammed earth, dim */}
		<rect x={-40} y={gs} width={W + 80} height={H - gs + 40} fill="#21110C" />
		{Array.from({length: 14}, (_, i) => <path key={i} d={`M-40,${gs + 36 * (i + 1)} H${W + 40}`} stroke={B.ochre} strokeOpacity={0.1} strokeWidth={1.5} />)}
		<path d={`M-40,${gs} H${W + 40}`} stroke={SNOW} strokeOpacity={0.35} strokeWidth={4} />
		{/* the pit: a dark chamber with a straw floor */}
		<path d={`M520,${gs} L1500,${gs} L1470,${pf} L550,${pf} Z`} fill="#0A0504" stroke={B.gold} strokeOpacity={0.4} strokeWidth={2.5} />
		<Pool id={id} x={1010} y={820} rx={560} ry={240} a={0.16} />
		<path d={`M552,${pf - 18} Q1010,${pf - 34} 1468,${pf - 18} L1470,${pf} L550,${pf} Z`} fill="#6A5028" opacity={0.7} />
		<path d={Array.from({length: 40}, (_, i) => `M${560 + i * 23},${pf - 4} l${8 + 6 * rnd(i, 2)},${-12 - 8 * rnd(i, 3)}`).join(' ')} stroke="#B89656" strokeOpacity={0.5} strokeWidth={1.5} />
		{/* the roof beam over the mouth */}
		<rect x={500} y={gs - 16} width={1020} height={18} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} />
	</g>; };
const KF06: React.FC = () => { const gs = 560, pf = 950, wx = 430, h = 300;
	const p = stand({lean: 12, neck: 34, la: 8, le: 24, ra: -4, re: 16});
	return <Frame id="k6" sheen={0.2} over={<><Subs rows={rows('凿冰，要备足[三倍]的量。')} th={thB} /><StampK y="《周礼·天官》" note="令斩冰，三其凌" /><Counter era="周" th={thB} /><SealB /></>}>
		<PitSection t={22.5} id="k6" />
		{[730, 1010, 1290].map((bx, i) => <g key={i}><IcePool x={bx} y={pf - 14} rx={160} ry={20} /><IceBlock x={bx} y={pf - 16} w={210} h={170} d={80} seed={10 + i} /></g>)}
		{/* the ？ on a thread from the beam */}
		<path d={`M1010,${gs + 2} L1010,${gs + 74}`} stroke={B.cream} strokeOpacity={0.5} strokeWidth={2} />
		<g transform={`translate(1010,${gs + 74}) rotate(6)`}><circle r={40} fill="#0E0705" stroke={B.gold} strokeOpacity={0.6} strokeWidth={2} /><text x={2} y={22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={62} fill={B.goldL}>？</text></g>
		{/* ×3 tag */}
		<g transform="translate(1530,600)"><rect x={0} y={0} width={170} height={140} rx={10} fill="#0E0705" fillOpacity={0.9} stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
			<text x={85} y={106} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={104} fill={B.goldL}>×3</text></g>
		<Pool id="k6w" x={wx} y={gs - 160} rx={260} ry={200} a={0.2} />
		<Walker51 x={wx} g={gs} h={h} pose={p} look={LOOKS51.zhou.look} />
		<Snow t={22.5} n={70} seed={6} y1={gs} o={0.6} />
	</Frame>; };

/* KF07 · 33.5 · J3 「冰，就塞在盆和罐的中间。」 the banquet room; the 鉴缶 on a low stand in section: basin, jar, the ice ring in
   the gap, frost on the bronze, an arrow to the gap, labels 鉴 · 盆 / 缶 · 罐; the walker packs his block into the gap */
const Room: React.FC<{id: string}> = ({id}) => <g>
	<rect x={-40} y={300} width={W + 80} height={605} fill={BG.wall} />
	{/* a lacquer screen across the back: dark panels, a cinnabar-dim cloud band, gold hairlines */}
	{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={160 + i * 330} y={340} width={320} height={500} fill="#1A0D09" stroke={BG.line} strokeWidth={1.5} />
		<rect x={176 + i * 330} y={356} width={288} height={468} fill="none" stroke={B.gold} strokeOpacity={0.12} strokeWidth={1.2} /></g>)}
	<ScrollBand y={420} x0={160} x1={1810} h={44} flow={20} fill="#2A120C" />
	<rect x={-40} y={300} width={W + 80} height={4} fill={B.gold} opacity={0.18} />
	<Ground g={905} />
	<Pool id={id} x={1060} y={640} rx={640} ry={400} a={0.3} />
</g>;
const Stand: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => <g>
	<rect x={x - w / 2} y={y} width={w} height={22} fill="#2E1610" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
	<rect x={x - w / 2 + 10} y={y + 22} width={w - 20} height={10} fill={B.redD} opacity={0.6} />
	{[x - w / 2 + 24, x + w / 2 - 44].map((lx, i) => <path key={i} d={`M${lx},${y + 32} h20 l-2,${905 - y - 32} h-16 Z`} fill="#26120D" stroke={BG.line} strokeWidth={1.2} />)}
</g>;
const KF07: React.FC = () => { const g = 960, h = 600, wx = 786, vx = 1140, vy = 880, vw = 420, Gm = jfGeom(vx, vy, vw);
	const gapC = Gm.gapL, bw = Gm.gapW * 0.86, bh = 112, bTop = Gm.yt - 26;
	let p = stand({lean: 14, neck: 24});
	p = reach(reach(p, 'L', gapC - bw * 0.45, bTop + 40, wx, g, h), 'R', gapC + bw * 0.05, bTop + 26, wx, g, h);
	return <Frame id="k7" sheen={0.25} over={<><Fonts s="鉴·盆缶罐" /><Subs rows={rows('冰，就塞在盆和罐的中间。')} th={thB} /><StampK y="战国早期" place="湖北随州" note="冰在夹层里" /><Counter era="战国早期" th={thB} /><SealB /></>}>
		<Room id="k7" />
		<Stand x={vx} y={vy} w={620} />
		<Jianfou x={vx} y={vy} w={vw} mode="section" ice={0.62} lid={false} frost={0.8} wine={false} id="k7j"
			slot={<IceBlock x={gapC} y={bTop + bh} w={bw} h={bh} d={22} seed={77} />} />
		{/* he stands beside the stand, his mittens pressing the block down into the gap */}
		<Walker51 x={wx} g={g} h={h} pose={p} look={LOOKS51.zhanguo.look} />
		{/* arrow into the right gap */}
		{(() => { const gx = Gm.gapR, ty = Gm.yt + 60; return <g>
			<path d={`M${gx + 70},${ty - 120} Q${gx + 30},${ty - 90} ${gx + 6},${ty - 10}`} fill="none" stroke={B.goldL} strokeWidth={4} strokeLinecap="round" />
			<path d={`M${gx - 8},${ty - 26} L${gx + 4},${ty + 4} L${gx + 24},${ty - 20}`} fill="none" stroke={B.goldL} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /></g>; })()}
		{/* labels with leader lines */}
		<path d={`M${vx + vw / 2 + 4},${Gm.yt + 230} L1486,${Gm.yt + 230}`} stroke={B.cream} strokeOpacity={0.6} strokeWidth={2} />
		<Label x={1496} y={Gm.yt + 250} s="鉴 · 盆" fs={58} />
		<path d={`M${vx + 0.2 * vw},${Gm.yt + 40} L1486,${Gm.neckTop - 10}`} stroke={B.cream} strokeOpacity={0.6} strokeWidth={2} />
		<Label x={1496} y={Gm.neckTop + 10} s="缶 · 罐" fs={58} />
	</Frame>; };

/* KF08 · 36.0 · 先猜？ same room, no subtitle, no stamp: the prompt by the jar, three options over the jar mouth */
const KF08: React.FC = () => { const g = 960, h = 600, wx = 660, vx = 1140, vy = 880, vw = 420, Gm = jfGeom(vx, vy, vw);
	const p = reach(stand({lean: 4, neck: 6, la: 40, le: 90}), 'L', wx + 0.16 * h, g - 0.86 * h, wx, g, h);
	const opts = ['肉？', '瓜果？', '酒？'], xs = [vx - 250, vx, vx + 230], oy = Gm.neckTop - 110;
	return <Frame id="k8" sheen={0.28} over={<><Fonts s="先猜？肉瓜果酒" /><Counter era="战国早期" th={thB} /><SealB /></>}>
		<Room id="k8" />
		<Stand x={vx} y={vy} w={620} />
		<Jianfou x={vx} y={vy} w={vw} mode="section" ice={0.85} frost={0.8} wine={false} id="k8j" />
		<Walker51 x={wx} g={g} h={h} pose={p} look={LOOKS51.zhanguo.look} />
		{opts.map((o, i) => <g key={i}><path d={`M${xs[i]},${oy + 18} Q${lerp(xs[i], vx, 0.6)},${oy + 60} ${vx + (i - 1) * 30},${Gm.neckTop - 40}`} stroke={B.cream} strokeOpacity={0.25} strokeWidth={2} fill="none" strokeDasharray="5 7" />
			<Label x={xs[i]} y={oy} s={o} fs={56} anchor="middle" o={0.88} /></g>)}
		<g transform={`translate(1430,${Gm.yt + 90}) rotate(-4)`}><rect x={0} y={0} width={220} height={84} rx={42} fill={B.goldL} /><text x={110} y={60} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={52} fill={B.lac}>先猜？</text></g>
	</Frame>; };

/* KF15 · 107.5 · P1 「古人的"冰箱"里，装的是[冬天]。」 the pull-back: the whole walk as one line, each cold thing where he left it,
   snow falling inside each one */
const P1Line: React.FC<{t: number; dim?: boolean}> = ({t, dim}) => { const g = 800;
	const xs = [190, 355, 525, 690, 850, 1005, 1160, 1320, 1500];
	const eras = ['周', '战国', '唐', '唐', '北宋', '清', '清', '乾隆', '今天'];
	const props: React.ReactNode[] = [
		<IceBlock key={0} x={xs[0]} y={g} w={120} h={90} d={50} seed={3} />,
		<Jianfou key={1} x={xs[1]} y={g} w={140} id="p1j" />,
		<IceMountain key={2} x={xs[2]} y={g} s={140} />,
		<SuShan key={3} x={xs[3]} y={g} s={130} />,
		<SilverBowl key={4} x={xs[4]} y={g} s={130} />,
		<IceTicket key={5} x={xs[5]} y={g} s={120} />,
		<PlumBowl key={6} x={xs[6]} y={g} s={120} />,
		<EnamelBox key={7} x={xs[7]} y={g} s={130} />,
		<Fridge key={8} x0={xs[8] - 75} y0={g - 290} w={150} h={290} open={0.8} light={1} frost={0.6} id="p1f" />,
	];
	const tops = [110, 150, 150, 120, 120, 130, 100, 140, 300];
	const wp = stand({lean: 2, neck: 6, la: 4, le: 18}), wx = 1640, wh = 330;
	return <g>
		<Ground g={g} lattice={false} />
		<path d={`M120,${g + 2} H1580`} stroke={B.goldL} strokeOpacity={0.55} strokeWidth={2.5} />
		{xs.map((x, i) => <g key={i}>
			<Pool id={`p1${i}${dim ? 'd' : ''}`} x={x} y={g - 60} rx={110} ry={150} a={0.16} />
			<circle cx={x} cy={g + 2} r={5} fill={B.goldL} />
			{props[i]}
			{/* winter inside each: snow falling within the thing's own space */}
			<defs><clipPath id={`sn${i}${dim ? 'd' : ''}`}><ellipse cx={x} cy={g - tops[i] / 2 - 10} rx={i === 8 ? 72 : 78} ry={tops[i] / 2 + 34} /></clipPath></defs>
			<g clipPath={`url(#sn${i}${dim ? 'd' : ''})`}><Snow x0={x - 80} x1={x + 80} y0={g - tops[i] - 50} y1={g} n={26} t={t} seed={i + 1} size={1.05} o={1} /></g>
			<Label x={x} y={g + 64} s={eras[i]} fs={40} anchor="middle" o={0.9} />
		</g>)}
		<Pool id={`p1w${dim ? 'd' : ''}`} x={wx} y={g + 2} rx={140} ry={26} a={0.3} />
		<Walker51 x={wx} g={g} h={wh} pose={wp} look={LOOKS51.today.look} flip />
	</g>; };
const KF15: React.FC = () => <Frame id="k15" sheen={0.2} over={<><Fonts s="周战国唐北宋清乾隆今天·" /><Subs rows={rows('古人的"冰箱"里，装的是[冬天]。')} th={thB} /><StampK y="2026" place="今天" note="本片归纳" /><Counter year="2026" th={thB} /><SealB /></>}>
	<P1Line t={107.5} />
</Frame>;

/* KF16 · 115.0 · END: the Juno end card over the dimmed P2 shot (today's fridge frosting by itself) */
const P2Shot: React.FC = () => { const x0 = 700, y0 = 160, fw = 520, fh = 860;
	return <g>
		<rect x={-40} y={700} width={W + 80} height={400} fill="#1E100B" />
		<Ground g={1020} lattice={false} />
		<Fridge x0={x0} y0={y0} w={fw} h={fh} open={0.9} light={1} frost={1} id="p2f" />
		<g opacity={0.5}><P1Mini /></g>
	</g>; };
const P1Mini: React.FC = () => <g>{[220, 380, 1460, 1620].map((x, i) => <circle key={i} cx={x} cy={1000} r={5} fill={B.goldL} />)}<path d="M100,1002 H700 M1220,1002 H1820" stroke={B.goldL} strokeOpacity={0.5} strokeWidth={2} /></g>;
const SOURCES = ['资料：《诗经》《周礼》（南京博物院《十三经》本）《太平御览》《东京梦华录》 · 《开元天宝遗事》《燕京岁时记》《清稗类钞》',
	'（据解放日报2025、中新网2022、新京报2026、《人民周刊》2019引） · 中国国家博物馆 · 湖北省博物馆（中新社2025） · 新华社（2025） · 宝鸡市文物局',
	'故宫博物院周乾 · 北京大学李零（澎湃2017） · 上海社科院程鹏（中新网2022） · 国家统计局'];
const KF16: React.FC = () => { const fs = 76, q = '你家冰箱里，现在冻着什么？', tw = fs * 13 * 1.03;
	return <>
		<Frame id="k16" sheen={0.2}><P2Shot /></Frame>
		<div style={{position: 'absolute', inset: 0, background: 'rgba(8,4,3,0.72)'}} />
		<Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, transform: 'rotate(-6deg)', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo}}>古代没有冰<span style={{marginRight: '-0.05em'}}>箱</span><br />夏天怎么吃冰<span style={{marginRight: '-0.55em'}}>？</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>{q.slice(0, -1)}<span style={{marginRight: '-0.53em'}}>？</span></div>
		<div style={{position: 'absolute', left: 760, top: 790, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold}}>关注 Juno · 一起看懂世界</div>
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 905, textAlign: 'center', fontFamily: SANS, fontSize: 21, lineHeight: 1.6, color: '#F2E6CC', opacity: 0.72}}>{SOURCES.map((s, i) => <div key={i}>{s}</div>)}</div>
	</>; };

/* =========================================== CHARACTER SHEET =========================================== */
const CharSheet: React.FC = () => { const g1 = 420, g2 = 712, g3 = 978;
	const lab = (x: number, y: number, s: string, fs = 26) => <Label x={x} y={y} s={s} fs={fs} anchor="middle" />;
	/* row 1: the walker (周) — stand, walk, chisel, carry; then the 周 officials and a labourer */
	const h1 = 250;
	const chP = (() => { const x = 630, tip: P2 = [x + 104, g1 - 58], butt: P2 = [tip[0] - 26, tip[1] - 86]; const p = reach(stand({lean: 10, neck: 18}), 'L', butt[0] + 6, butt[1] + 12, x, g1, h1); return {x, p, tip, butt}; })();
	const carry = (() => { const x = 860; let p = stand({lean: -3, neck: 6}); p = reach(reach(p, 'L', x + 0.15 * h1, g1 - 0.5 * h1, x, g1, h1), 'R', x + 0.26 * h1, g1 - 0.52 * h1, x, g1, h1); return {x, p}; })();
	const off1 = ikArm(ikArm(stand({lean: 4, neck: 14}), 'L', [0.2, 0.66]), 'R', [0.16, 0.6]);
	const off2 = ikArm(stand({lean: 2, neck: 10}), 'L', [0.22, 0.68]);
	/* row 2 cast */
	const h2 = 220;
	const noble = ikArm(stand({lean: -2, neck: 4}), 'L', [0.22, 0.84]);
	const vendor = ikArm(ikArm(stand({lean: 14, neck: 20}), 'L', [0.3, 0.5]), 'R', [0.24, 0.52]);
	const clerk = ikArm(ikArm(stand({lean: 10, neck: 14}), 'L', [0.3, 0.6]), 'R', [0.24, 0.58]);
	const seller = ikArm(stand({lean: 2, neck: 6}), 'L', [0.22, 0.86]);
	const eras = ['zhou', 'zhanguo', 'tang', 'song', 'qing', 'today'];
	const props: Record<string, string> = {zhou: '凿 · 冰块', zhanguo: '鉴缶 · 冰块', tang: '酥山', song: '银碗冰雪', qing: '冰票 · 酸梅汤', today: '冰块杯'};
	const cw = {x: 1000, y0: g2 - 196, y1: g2 - 56};
	return <svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><Defs51 /><Lacquer sheen={0.3} id="cs" />
		<Fonts s="ep51角色设定·行路人（漆夜）一色剪影暖轮廓光无五官手为简化手掌约8头身同形走完全片只换衣冠侧面站行走凿冰搬冰周冰官竹签手下劳力拖冰唐权贵北宋卖冰雪的清窖口发冰票吏酸梅汤贩敲两只铜碗战国今天絮袍发髻深衣圆领袍幞头短褐软脚长袍瓜皮帽辫夹克短发凿冰块鉴缶酥山银碗冰雪冰票酸梅汤冰块杯冰为唯一冷色扶" />
		<text x={120} y={80} fontFamily={SANS} fontWeight={900} fontSize={40} fill={B.cream}>ep51 角色设定 · 行路人（漆 · 夜）</text>
		<text x={120} y={118} fontFamily={KAI} fontWeight={700} fontSize={24} fill={B.cream} opacity={0.7}>一色剪影 + 暖轮廓光 · 无五官 · 手为简化手掌 · 约 8 头身 · 同一身形走完全片，只换衣冠 · 冰为唯一冷色</text>
		<Pool id="cs1" x={560} y={g1 - 130} rx={560} ry={220} a={0.16} />
		<Walker51 x={200} g={g1} h={h1} pose={stand()} look={LOOKS51.zhou.look} />{lab(205, g1 + 36, '侧面 · 站')}
		<Walker51 x={400} g={g1} h={h1} pose={walkPose(0.22)} look={LOOKS51.zhou.look} />{lab(410, g1 + 36, '侧面 · 行走')}
		<IceBlock x={chP.x + 130} y={g1} w={96} h={56} d={40} seed={4} />
		<Walker51 x={chP.x} g={g1} h={h1} pose={chP.p} look={LOOKS51.zhou.look} />
		<Chisel x={chP.butt[0]} y={chP.butt[1]} L={Math.hypot(chP.tip[0] - chP.butt[0], chP.tip[1] - chP.butt[1])} rot={Math.atan2(chP.tip[1] - chP.butt[1], chP.tip[0] - chP.butt[0]) * 180 / Math.PI} />
		{(() => { const q = J(chP.p, 'LHand', chP.x, g1, h1); return <ellipse cx={q[0] + 3} cy={q[1] + 3} rx={7} ry={8} fill={B.lac} stroke={BG.rim} strokeOpacity={0.6} />; })()}
		{lab(chP.x + 60, g1 + 36, '凿冰 · 手扶凿')}
		{(() => { const a = J(carry.p, 'LHand', carry.x, g1, h1), b = J(carry.p, 'RHand', carry.x, g1, h1); return <IceBlock x={(a[0] + b[0]) / 2 + 4} y={Math.min(a[1], b[1]) + 4} w={74} h={50} d={24} seed={8} />; })()}
		<Walker51 x={carry.x} g={g1} h={h1} pose={carry.p} look={LOOKS51.zhou.look} />
		{lab(carry.x + 20, g1 + 36, '搬冰')}
		<Walker51 x={1130} g={g1} h={h1} pose={off1} look={{dress: 'robe', head: 'guan', beard: 'short'}} col="#0F0806" flip rimO={0.75} />
		<Tally x={1130 - 0.2 * h1} y={g1 - 0.6 * h1} h={62} rot={8} />
		<Walker51 x={1270} g={g1} h={h1 * 0.97} pose={off2} look={{dress: 'robe', head: 'guan', beard: 'long'}} col="#0F0806" flip rimO={0.75} />
		<Tally x={1270 - 0.22 * h1 * 0.97} y={g1 - 0.62 * h1 * 0.97} h={58} rot={-10} />
		{lab(1200, g1 + 36, '周 · 冰官（竹签）')}
		<Hauler x={1640} g={g1} h={h1 * 0.95} ph={0} />
		{lab(1540, g1 + 36, '手下劳力 · 拖冰')}
		<path d={`M120,${g1 + 58} H1800`} stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.5} />
		{/* row 2: the cast */}
		<Walker51 x={290} g={g2} h={h2} pose={noble} look={{dress: 'robe', head: 'futou', beard: 'short', build: 1.2}} col="#0F0806" flip rimO={0.75} />
		{(() => { const q = J(noble, 'LHand', 290, g2, h2, true); return <g transform={`translate(${q[0] - 4},${q[1] - 6})`}><path d="M-15,-14 Q-13,2 0,4 Q13,2 15,-14 Z" fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.2} /><ellipse cx={0} cy={-14} rx={15} ry={3.5} fill="#5A1E14" /><ellipse cx={1} cy={6} rx={8} ry={7} fill="#0F0806" /></g>; })()}
		{lab(290, g2 + 36, '唐 · 权贵')}
		{/* Song vendor at a tub under a cloth umbrella */}
		<path d="M520,500 Q620,440 720,500 Z" fill="#283A4C" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.5} /><rect x={618} y={482} width={4} height={g2 - 482} fill={BG.post} />
		<rect x={630} y={g2 - 76} width={110} height={76} rx={6} fill="#3A2116" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
		<path d={`M636,${g2 - 76} Q685,${g2 - 106} 734,${g2 - 76} Z`} fill="url(#ice51T)" stroke={ICE.line} strokeWidth={1.5} />
		<Walker51 x={560} g={g2} h={h2} pose={vendor} look={{dress: 'tunic', legs: 'trousers', head: 'bun', beard: 'short'}} col="#0F0806" rimO={0.75} />
		{(() => { const q = J(vendor, 'LHand', 560, g2, h2); return <path d={`M${q[0]},${q[1]} L${666},${g2 - 90}`} stroke="#C9A86A" strokeWidth={4} strokeLinecap="round" />; })()}
		{lab(630, g2 + 36, '北宋 · 卖冰雪的')}
		{/* Qing clerk behind the cellar window */}
		<defs><clipPath id="cwin"><rect x={cw.x - 130} y={cw.y0} width={260} height={cw.y1 - cw.y0} /></clipPath></defs>
		<rect x={cw.x - 150} y={cw.y0 - 20} width={300} height={cw.y1 - cw.y0 + 76} fill="#2A1710" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.5} />
		<rect x={cw.x - 130} y={cw.y0} width={260} height={cw.y1 - cw.y0} fill="#0A0504" />
		<g clipPath="url(#cwin)"><Pool id="cw" x={cw.x} y={cw.y1 - 40} rx={160} ry={110} a={0.25} />
			<Walker51 x={cw.x + 50} g={g2 + 70} h={h2 * 1.05} pose={clerk} look={{...LOOKS51.qing.look, beard: 'short', build: 1.08}} qing col="#0F0806" flip rimO={0.7} /></g>
		<rect x={cw.x - 160} y={cw.y1} width={320} height={16} fill="#3A2116" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
		<g transform={`translate(${cw.x - 70},${cw.y1 - 20}) rotate(-6)`}><rect x={0} y={0} width={44} height={24} fill="#EFE2C4" /><rect x={16} y={6} width={12} height={12} fill="#BF3420" /></g>
		{lab(cw.x, g2 + 36, '清 · 窖口发冰票的吏')}
		{/* 酸梅汤 seller with two brass bowls */}
		<Walker51 x={1380} g={g2} h={h2} pose={seller} look={{...LOOKS51.qing.look, dress: 'tunic', legs: 'trousers'}} qing col="#0F0806" rimO={0.75} />
		{(() => { const hd = J(seller, 'LHand', 1380, g2, h2); return <g><path d={`M${hd[0] - 17},${hd[1] - 4} Q${hd[0] - 14},${hd[1] + 9} ${hd[0]},${hd[1] + 9} Q${hd[0] + 14},${hd[1] + 9} ${hd[0] + 17},${hd[1] - 4} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.2} />
			<path d={`M${hd[0] - 15},${hd[1] - 22} Q${hd[0] - 12},${hd[1] - 10} ${hd[0] + 1},${hd[1] - 10} Q${hd[0] + 14},${hd[1] - 10} ${hd[0] + 17},${hd[1] - 22} Z`} fill="url(#brz51v)" stroke={BRZ.line} strokeWidth={1.2} transform={`rotate(-14,${hd[0]},${hd[1] - 14})`} />
			<ellipse cx={hd[0] + 1} cy={hd[1] + 1} rx={6} ry={7} fill="#0F0806" />
			<path d={`M${hd[0] + 22},${hd[1] - 30} l10,-8 M${hd[0] + 26},${hd[1] - 18} l13,-2`} stroke={B.goldL} strokeWidth={2} strokeLinecap="round" opacity={0.8} /></g>; })()}
		<g transform={`translate(1500,${g2})`}><path d="M-34,-56 L34,-56 L28,0 L-28,0 Z" fill="#3A2116" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} /><ellipse cx={0} cy={-56} rx={34} ry={8} fill="#3A120C" /></g>
		{lab(1430, g2 + 36, '清 · 酸梅汤贩（敲两只铜碗）')}
		<path d={`M120,${g2 + 58} H1800`} stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.5} />
		{/* row 3: the walk, costume by era */}
		{eras.map((k, i) => { const x = 210 + i * 280;
			return <g key={k}><Pool id={`ce${i}`} x={x} y={g3 - 80} rx={100} ry={110} a={0.14} />
				<Walker51 x={x} g={g3} h={165} pose={walkPose(0.18 + 0.1 * (i % 2))} look={LOOKS51[k].look} qing={LOOKS51[k].qing} />
				<text x={x + 74} y={g3 - 112} fontFamily={KAI} fontWeight={700} fontSize={30} fill={B.cream}>{LOOKS51[k].label}</text>
				<text x={x + 74} y={g3 - 78} fontFamily={KAI} fontWeight={700} fontSize={19} fill={B.cream} opacity={0.65}>{LOOKS51[k].note}</text>
				<text x={x + 74} y={g3 - 50} fontFamily={KAI} fontWeight={700} fontSize={19} fill={B.goldL} opacity={0.9}>{props[k]}</text></g>; })}
	</svg>; };

/* =========================================== registration =========================================== */
const KFS: [string, React.FC][] = [['CHARS', CharSheet], ['01', KF01], ['02', KF02], ['03', KF03], ['04', KF04], ['05', KF05], ['06', KF06], ['07', KF07], ['08', KF08], ['15', KF15], ['16', KF16]];
const one = (C: React.FC): React.FC => () => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)][1]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KF51A-ALL" component={All} width={W} height={H} fps={30} durationInFrames={KFS.length} />
	{KFS.map(([n, C]) => <Composition key={n} id={n === 'CHARS' ? 'KF51A-CHARS' : `KF51A-${n}`} component={one(C)} width={W} height={H} fps={30} durationInFrames={1} />)}
</>;
registerRoot(Root);
void IceCubes; void Img;
