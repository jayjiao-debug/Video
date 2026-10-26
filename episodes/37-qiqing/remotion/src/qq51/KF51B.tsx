import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Subs, Counter, grounded, walkPose, shop, lerp, rnd, SANS, KAI} from '../qq50/kit50';
import {B, BG, thB, curl, Pool, RimFig, SealB, SilverGrad} from '../qq50/styleB';
import {seated} from '../qq47/pose47';

import {P2, LOOKS51, ikArm, toBody, J, StampK, SubsQ, Label, Ground, Frame, ICE, IceBlock, MeltBlock, IceHeap, Glint, Chips, QingFig, Umbrella, SilverBowl, SilverBasin, Picker, IceChest, FridgeIcon} from './partsB51';
/* ep51 key frames, Builder B: KF09–KF14 in the ep50 look B (漆, night) + the one cool accent (ice, blue-white).
   KF51B-ALL renders frame i = KF09 + i. Subtitles verbatim from 51-bing/lines_read.json. */
const rows = (s: string) => s.split('\n').map((r) => ({s: r}));
const NEUT = '#120A07';   // other people: one tone, a touch darker than the walker

/* ===================== KF09 · 48.0 s · Q3 — the Tang ice mountain ===================== */
type Peak = [number, number, number, number];   // cx, half width, height, apex lean
const IceMountain: React.FC<{x: number; base: number; s?: number}> = ({x, base, s = 1}) => {
	const back: Peak[] = [[-150, 120, 300, 10], [150, 130, 335, -12], [10, 100, 395, 4]];
	const front: Peak[] = [[-215, 115, 235, 14], [-60, 95, 175, -6], [0, 175, 430, 0], [80, 90, 205, 8], [230, 125, 270, -14], [320, 70, 140, -6]];
	const peak = (pk: Peak, k: number, o: number, dim: boolean) => { const [cx0, hw0, hh0, ln] = pk, cx = x + cx0 * s, hw = hw0 * s, hh = hh0 * s, ax = cx + ln * s, ay = base - hh, mx = cx + hw * 0.08;
		const sh = (u: number, v: number): P2 => [lerp(lerp(cx - hw, ax, v), lerp(mx, ax, v), u), lerp(base, ay, v)];   // a point on the lit face
		const SL: P2 = [lerp(cx - hw, ax, 0.55) - hw * 0.16, lerp(base, ay, 0.55)], SR: P2 = [lerp(cx + hw, ax, 0.4) + hw * 0.14, lerp(base, ay, 0.4)];
		const f1 = sh(0.15, 0.35), f2 = sh(0.7, 0.62), f3 = sh(0.35, 0.82);
		return <g key={k} opacity={o}>
			<path d={`M${cx - hw},${base} L${SL[0]},${SL[1]} L${ax},${ay} L${mx},${base} Z`} fill="url(#iceLit)" />
			<path d={`M${ax},${ay} L${SR[0]},${SR[1]} L${cx + hw},${base} L${mx},${base} Z`} fill="url(#iceShd)" />
			{/* carved facets: a lighter cut on the lit face, a darker one on the shade face */}
			<path d={`M${f1[0]},${f1[1]} L${f3[0]},${f3[1]} L${f2[0]},${f2[1]} Z`} fill="#FFFFFF" opacity={dim ? 0.18 : 0.32} />
			<path d={`M${ax},${ay + hh * 0.12} L${lerp(ax, cx + hw, 0.55)},${lerp(ay, base, 0.5)} L${lerp(ax, mx, 0.45)},${lerp(ay, base, 0.42)} Z`} fill="#4A82A0" opacity={dim ? 0.25 : 0.4} />
			{/* inner highlight streak + a hairline crack */}
			<path d={`M${lerp(cx - hw, ax, 0.25) + hw * 0.18},${lerp(base, ay, 0.22)} L${lerp(cx - hw, ax, 0.7) + hw * 0.1},${lerp(base, ay, 0.68)}`} stroke="#FFFFFF" strokeWidth={Math.max(2, hw * 0.05)} strokeLinecap="round" opacity={dim ? 0.3 : 0.6} />
			<path d={`M${lerp(ax, mx, 0.3)},${lerp(ay, base, 0.3)} l${-hw * 0.08},${hh * 0.12} l${hw * 0.07},${hh * 0.1}`} fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.5} />
			{/* chisel marks along the ridge */}
			<g stroke={ICE.deep} strokeWidth={2.2} strokeLinecap="round" opacity={dim ? 0.35 : 0.7}>{[0.25, 0.45, 0.65].map((v, i) => { const p = [lerp(mx, ax, v), lerp(base, ay, v)]; return <path key={i} d={`M${p[0] - 2},${p[1]} l${-hw * 0.14},${hh * 0.03}`} />; })}</g>
			{/* bright edges: the lit contour and the ridge */}
			<path d={`M${cx - hw},${base} L${SL[0]},${SL[1]} L${ax},${ay} L${mx},${base}`} fill="none" stroke="#FFFFFF" strokeWidth={dim ? 1.6 : 3} strokeLinejoin="round" opacity={dim ? 0.6 : 0.95} />
			<path d={`M${ax},${ay} L${SR[0]},${SR[1]} L${cx + hw},${base}`} fill="none" stroke="#DFF1FA" strokeWidth={1.5} opacity={0.5} />
		</g>; };
	return <g>
		{back.map((p, i) => peak(p, i, 0.72, true))}
		{front.map((p, i) => peak(p, 10 + i, 0.9, false))}
		{/* the plinth of the carving: one long block */}
		<IceBlock x={x - 360 * s} y={base + 42 * s} w={720 * s} h={42 * s} d={40 * s} o={0.95} seed={5} />
	</g>; };
const Mist: React.FC<{pts: [number, number, number, number][]; o?: number}> = ({pts, o = 0.5}) => <g>
	<g filter="url(#mist)" opacity={o * 0.8}>{pts.map(([x, y, r, d], i) => <ellipse key={i} cx={x + d * r * 1.2} cy={y + r * 0.1} rx={r * 2.4} ry={r * 0.55} fill="#DCEFF9" opacity={0.35} />)}</g>
	<g fill="none" stroke="#E4F4FC" strokeLinecap="round" opacity={o}>{pts.map(([x, y, r, d], i) => <path key={i} d={curl(x, y, r, d, 3.2, 0.4)} strokeWidth={Math.max(2, r * 0.09)} />)}</g>
</g>;
/** a seated guest on a crescent stool, leaning back from the cold (flip = faces left) */
const Guest: React.FC<{x: number; g: number; h: number; flip?: boolean; lean?: number; look?: {dress: 'robe' | 'dress'; head: 'futou' | 'bun' | 'long'}}> = ({x, g, h, flip, lean = -16, look = {dress: 'robe', head: 'futou'}}) => {
	const {pose, seat} = seated({lean, neck: -10, la: 50, le: 80, ra: -10, re: 30, lt: 80, rt: 76});
	const sy = g - seat * h, hx = J(pose, 'Hips', x, g, h, flip)[0];
	return <g>
		<path d={`M${hx - 0.13 * h},${sy} Q${hx},${sy + 0.05 * h} ${hx + 0.13 * h},${sy} L${hx + 0.1 * h},${sy + 0.03 * h} L${hx + 0.08 * h},${g} L${hx + 0.05 * h},${g} L${hx},${sy + 0.06 * h} L${hx - 0.05 * h},${g} L${hx - 0.08 * h},${g} L${hx - 0.1 * h},${sy + 0.03 * h} Z`} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.2} />
		<RimFig x={x} ground={g} h={h} pose={pose} look={look} col={NEUT} flip={flip} dx={flip ? -2.5 : 2.5} dy={-2} rimO={0.6} />
	</g>; };
/** a craftsman chiselling a peak: chisel tip on the ice (L hand), mallet raised (R hand) */
const Carver: React.FC<{x: number; g: number; h: number; tip: P2; flip?: boolean}> = ({x, g, h, tip, flip}) => {
	const sgn = flip ? -1 : 1, grip: P2 = [tip[0] - sgn * 34, tip[1] + 14], back: P2 = [tip[0] - sgn * 62, tip[1] + 25];
	let p = grounded({lean: 14, neck: -12, lt: 10, lk: 12, rt: -10, rk: 8, la: 40, le: 40, ra: 150, re: 30});
	p = ikArm(p, 'L', toBody(grip[0], grip[1], x, g, h, flip));
	const mh: P2 = [x + sgn * 0.27 * h, g - 1.0 * h];
	p = ikArm(p, 'R', toBody(mh[0], mh[1], x, g, h, flip));
	const rh = J(p, 'RHand', x, g, h, flip), mEnd: P2 = [rh[0] - sgn * 34, rh[1] - 50];
	return <g>
		{/* mallet behind the raised hand, chisel in the near hand */}
		<path d={`M${rh[0] + sgn * 6},${rh[1] + 10} L${mEnd[0]},${mEnd[1]}`} stroke="#8A6232" strokeWidth={7} strokeLinecap="round" />
		<rect x={mEnd[0] - 22} y={mEnd[1] - 14} width={44} height={28} rx={5} fill="#5A3A20" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.5} transform={`rotate(${sgn * -36},${mEnd[0]},${mEnd[1]})`} />
		<path d={`M${back[0]},${back[1]} L${tip[0]},${tip[1]}`} stroke="#9AA4AB" strokeWidth={7} strokeLinecap="round" />
		<path d={`M${back[0]},${back[1]} L${lerp(back[0], tip[0], 0.45)},${lerp(back[1], tip[1], 0.45)}`} stroke="#6B4A2A" strokeWidth={10} strokeLinecap="round" />
		<RimFig x={x} ground={g} h={h} pose={p} look={{dress: 'tunic', legs: 'trousers', head: 'bun'}} col={NEUT} flip={flip} dx={flip ? -2.5 : 2.5} dy={-2} rimO={0.65} />
		<Chips x={tip[0]} y={tip[1]} s={70} seed={flip ? 3 : 1} dir={-sgn} />
	</g>; };
const KF09: React.FC = () => { const g = 905, mx = 990, base = 820;
	const wp = ikArm(grounded({lean: -2, neck: -22, lt: 4, lk: 4, rt: -6, rk: 5, la: 6, le: 20, ra: 4, re: 12}), 'L', [0.12, 0.42]);
	return <Frame id="k9" over={<><SubsQ row="取大冰，使匠琢为山。" gloss="唐朝权贵：让工匠把大冰雕成山" /><StampK y="唐" note="《开元天宝遗事》" /><Counter era="唐" th={thB} /><SealB /></>}>
		{/* the hall: back wall, bamboo blinds glowing with summer light, columns and a beam */}
		<rect x={-40} y={330} width={W + 80} height={g - 330} fill={BG.wall} />
		{[[180, 420], [1480, 420]].map(([x0, w], i) => <g key={i}><rect x={x0} y={360} width={w} height={300} fill="#5A3018" opacity={0.55} />
			<path d={Array.from({length: 26}, (_, k) => `M${x0},${372 + k * 11} h${w}`).join(' ')} stroke="#2A140C" strokeWidth={4} opacity={0.75} />
			<rect x={x0} y={360} width={w} height={300} fill="none" stroke={BG.lineS} strokeWidth={2} /></g>)}
		<rect x={-40} y={310} width={W + 80} height={34} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		{[110, 650, 1340, 1830].map((x0, i) => <rect key={i} x={x0} y={344} width={44} height={g - 344} fill="#2E130D" stroke={BG.line} strokeWidth={1.2} />)}
		<Pool id="k9" x={mx} y={600} rx={760} ry={430} a={0.3} />
		{/* the low dais and its lacquer tray */}
		<rect x={mx - 420} y={base + 42} width={840} height={g - base - 42} fill="#2A1710" stroke={B.gold} strokeOpacity={0.35} strokeWidth={1.5} />
		<path d={`M${mx - 420},${base + 60} H${mx + 420}`} stroke={B.gold} strokeOpacity={0.25} strokeWidth={1.2} />
		<IceMountain x={mx} base={base} />
		<Ground g={g} />
		{/* low tables with dishes beside the guests */}
		{[[1560, -1]].map(([x0], i) => <g key={i}><rect x={x0 - 80} y={g - 64} width={160} height={14} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.2} /><rect x={x0 - 70} y={g - 50} width={10} height={50} fill={BG.post} /><rect x={x0 + 60} y={g - 50} width={10} height={50} fill={BG.post} />
			<path d={`M${x0 - 50},${g - 64} q20,-22 40,0 Z M${x0 + 10},${g - 64} q22,-18 44,0 Z`} fill="#3A2116" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.2} /></g>)}
		{/* the walker (Tang robe), a step back, looking up at the mountain */}
		<RimFig x={175} ground={g} h={540} pose={wp} look={LOOKS51.tang} col={B.lac} dx={3} dy={-2.5} rimO={0.75} />
		<Guest x={420} g={g} h={500} />
		<Guest x={1660} g={g} h={500} flip />
		<Guest x={1500} g={g} h={470} flip look={{dress: 'dress', head: 'bun'}} lean={-20} />
		<Carver x={640} g={g - 30} h={470} tip={[749, 637]} />
		<Carver x={1340} g={g - 30} h={470} tip={[1257, 640]} flip />
		<rect x={570} y={g - 30} width={150} height={30} fill="#2A1710" stroke={B.gold} strokeOpacity={0.35} strokeWidth={1.2} />
		<rect x={1265} y={g - 30} width={150} height={30} fill="#2A1710" stroke={B.gold} strokeOpacity={0.35} strokeWidth={1.2} />
		{/* the cold mist rolls off the plinth across the mats toward the guests */}
		<Mist pts={[[mx - 380, 860, 40, -1], [mx - 470, 885, 32, -1], [mx + 380, 860, 40, 1], [mx + 470, 885, 32, 1], [mx - 180, 870, 26, -1], [mx + 200, 872, 26, 1]]} o={0.55} />
	</Frame>; };

/* ===================== KF10 · 61.5 s · S3 [银器] — the Song silver stall, June day ===================== */
const KF10: React.FC = () => { const g = 905, CT = 712;
	const wx = 880, wh = 560, vx = 1210, vh = 520, bowl: P2 = [1050, 560];
	let wp = grounded({lean: 4, neck: 6, lt: 4, lk: 4, rt: -6, rk: 5, la: 50, le: 40, ra: 4, re: 12});
	wp = ikArm(wp, 'L', toBody(bowl[0] - 64, bowl[1] + 30, wx, g, wh));
	let vp = grounded({lean: 10, neck: 8, lt: 3, lk: 4, rt: -4, rk: 4, la: 50, le: 30, ra: -8, re: 6});
	vp = ikArm(vp, 'L', toBody(bowl[0] + 92, bowl[1] + 12, vx, g, vh, true));
	const day = <defs><linearGradient id="dayS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24120B" /><stop offset="0.5" stopColor="#5A2F1A" /><stop offset="0.72" stopColor="#6E3D20" /><stop offset="1" stopColor="#2A150D" /></linearGradient></defs>;
	const far = Array.from({length: 8}, (_, i) => shop(-260 + i * 330, 600, 300, 110 + 50 * rnd(i, 3)));
	const mid = [shop(-120, 790, 470, 300), shop(420, 790, 440, 280), shop(1640, 790, 440, 300)];
	return <Frame id="k10" sheen={0.45} vig={0.6} over={<><Subs rows={rows('卖得最好的两家，全用[银器]。')} th={thB} /><StampK y="北宋" place="汴京" note="悉用银器" /><Counter era="北宋" th={thB} /><SealB /></>}>
		{day}<rect width={W} height={H} fill="url(#dayS)" opacity={0.75} />
		{/* hot June light from above: one big warm pool over the street */}
		<Pool id="k10s" x={1000} y={330} rx={1200} ry={560} a={0.42} col="#FFC070" />
		<g fill="#2C170F">{far.map((s, i) => <path key={i} d={s.roof} />)}</g>
		<rect x={-40} y={600} width={W + 80} height={300} fill="#2C170F" />
		{mid.map((s, i) => <g key={i}><path d={s.roof} fill={BG.roof} stroke={BG.lineS} strokeWidth={2} /><path d={s.tiles} stroke={BG.line} strokeWidth={1.4} opacity={0.6} />
			<path d={s.posts} fill={BG.post} stroke={BG.line} strokeWidth={1} /><path d={s.beam} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} /><path d={s.shutter} stroke="#170B08" strokeWidth={6} /></g>)}
		<rect x={-40} y={790} width={W + 80} height={115} fill="#241209" />
		{/* the row of blue cloth umbrellas down the road, vendors scooping from tubs, buyers with bowls */}
		{[[150, 560, 120], [560, 575, 110], [1640, 560, 120]].map(([x, y, r], i) => <g key={i}>
			<Umbrella x={x} y={y} r={r} g={800} o={0.9} />
			<RimFig x={x + 30} ground={800} h={230} pose={grounded({lean: 14, neck: 10, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 30, ra: 6, re: 20})} look={{dress: 'tunic', legs: 'trousers', head: 'futou'}} col={NEUT} flip dx={-2} dy={-2} rimO={0.4} />
			<path d={`M${x - 40},${800} L${x - 34},${758} H${x + 4} L${x + 10},${800} Z`} fill="#3A2416" stroke={BG.lineS} strokeWidth={1.2} />
			<ellipse cx={x - 15} cy={757} rx={22} ry={5} fill={ICE.body} opacity={0.8} />
			<RimFig x={x - 95} ground={800} h={220} pose={ikArm(grounded({lean: 4, neck: 6, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 50, ra: 4, re: 12}), 'L', [0.2, 0.55])} look={{dress: 'robe', head: i === 1 ? 'bun' : 'futou'}} col={NEUT} dx={2} dy={-2} rimO={0.4} />
		</g>)}
		{/* the other of the two best stalls (back left): its silver catches the light too */}
		<rect x={250} y={735} width={230} height={65} fill={BG.beam} stroke={BG.lineS} strokeWidth={1.2} />
		<SilverBasin x={310} y={732} w={70} id="sv2a" /><SilverBowl x={400} y={724} w={46} id="sv2b" heap={10} /><SilverBowl x={448} y={727} w={40} id="sv2c" />
		<Glint x={333} y={727} r={14} o={0.85} />
		<Ground g={g} />
		<Pool id="k10f" x={wx + 60} y={g + 4} rx={360} ry={44} a={0.3} />
		{/* the best stall: its big umbrella, the keeper behind the counter, every vessel silver */}
		<Umbrella x={1440} y={430} r={340} g={CT} />
		<RimFig x={vx} ground={g} h={vh} pose={vp} look={{dress: 'robe', head: 'futou', build: 1.04}} col={NEUT} flip dx={-2.5} dy={-2} rimO={0.55} />
		<rect x={1110} y={CT} width={560} height={22} fill="#3A2116" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} /><path d={`M1125,${CT + 22} H1655 V${g} H1125 Z`} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<path d={Array.from({length: 6}, (_, i) => `M${1160 + i * 90},${CT + 50} h50 v130 h-50 Z`).join(' ')} fill="none" stroke={BG.line} strokeWidth={1.2} />
		<SilverBasin x={1480} y={CT - 50} w={190} id="svB" />
		<rect x={1400} y={CT - 50} width={160} height={50} fill="none" />
		{[0, 1, 2].map((i) => <SilverBowl key={i} x={1300} y={CT - 22 - i * 14} w={86 - i * 2} id={`svS${i}`} k={0.5 + 0.05 * i} />)}
		<defs><SilverGrad id="svE" x0={1600} x1={1660} k={0.5} /></defs>
		<path d={`M1610,${CT} Q1586,${CT - 40} 1604,${CT - 70} L1600,${CT - 96} H1630 L1626,${CT - 70} Q1646,${CT - 40} 1622,${CT} Z M1604,${CT - 62} Q1580,${CT - 70} 1574,${CT - 92}`} fill="url(#svE)" stroke="#6D7880" strokeWidth={1.5} />
		<path d="M1440,632 L1468,600" stroke="url(#svB)" strokeWidth={6} strokeLinecap="round" />
		<Glint x={1555} y={CT - 56} r={16} o={0.8} />
		{/* the bowl handed across: both mittens on it, the glint on its rim the brightest thing on screen */}
		<SilverBowl x={bowl[0]} y={bowl[1]} w={164} id="svH" heap={50} k={0.66} />
		<RimFig x={wx} ground={g} h={wh} pose={wp} look={LOOKS51.song} col={B.lac} dx={3} dy={-2.5} />
		<Glint x={bowl[0] + 30} y={bowl[1] + 7} r={66} />
	</Frame>; };

/* ===================== KF11 · 65.0 s · Q4 — night, the frozen moat under the vermilion wall ===================== */
const KF11: React.FC = () => { const g = 950;
	const flakes = Array.from({length: 40}, (_, i) => [rnd(i, 21) * W, 300 + rnd(i, 22) * 700, 2 + 3 * rnd(i, 23)]);
	return <Frame id="k11" sheen={0.2} over={<><SubsQ row="于夜内凿之，声如錾石。" gloss="清朝北京：夜里凿冰，声音像凿石头" /><StampK y="清" place="北京" note="《燕京岁时记》" /><Counter era="清" th={thB} /><SealB /></>}>
		{/* the vermilion wall with its tiled coping */}
		<defs><linearGradient id="verm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E2618" /><stop offset="1" stopColor="#3E140C" /></linearGradient></defs>
		<rect x={-40} y={380} width={W + 80} height={250} fill="url(#verm)" />
		<path d={`M-40,380 H${W + 40}`} stroke={B.gold} strokeOpacity={0.4} strokeWidth={2} />
		<path d={`M-40,350 L-20,330 H${W + 20} L${W + 40},350 V384 H-40 Z`} fill="#1E120A" stroke={B.gold} strokeOpacity={0.45} strokeWidth={2} />
		<path d={Array.from({length: 66}, (_, i) => `M${-20 + i * 30},334 V380`).join(' ')} stroke={B.gold} strokeOpacity={0.14} strokeWidth={2} />
		{/* the bank, then the frozen moat (dark ice, a cool sheen only where it is cut) */}
		<rect x={-40} y={630} width={W + 80} height={26} fill="#22150F" stroke={BG.lineS} strokeWidth={1.5} />
		<defs><linearGradient id="moat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#17151A" /><stop offset="1" stopColor="#0E0B0C" /></linearGradient></defs>
		<rect x={-40} y={656} width={W + 80} height={H - 656 + 40} fill="url(#moat)" />
		<path d={Array.from({length: 14}, (_, i) => `M${rnd(i, 31) * W - 100},${680 + i * 26 + 8 * rnd(i, 32)} h${120 + 240 * rnd(i, 33)}`).join(' ')} stroke={ICE.shade} strokeOpacity={0.14} strokeWidth={2} strokeLinecap="round" />
		{/* the cut: a channel of black water, blocks lifted out and stacked on the ice */}
		<path d="M560,700 L1460,700 L1490,742 L540,742 Z" fill="#050405" />
		<path d="M560,700 L1460,700" stroke={ICE.core} strokeWidth={3} opacity={0.85} /><path d="M540,742 L1490,742" stroke={ICE.body} strokeWidth={2} opacity={0.5} />
		<path d={Array.from({length: 8}, (_, i) => `M${640 + i * 110},700 l-6,42`).join(' ')} stroke={ICE.body} strokeWidth={1.5} opacity={0.35} />
		{/* lanterns on the bank and their warm pools on the ice */}
		{/* paper lanterns hung from the wall's eave on short cords: oval, warm, with small top and bottom caps */}
		{[360, 1620].map((lx, i) => <g key={i}>
			<defs><radialGradient id={`lan${i}`} cx="0.42" cy="0.45" r="0.6"><stop offset="0" stopColor="#FFE6B0" /><stop offset="0.55" stopColor="#F2A55A" /><stop offset="1" stopColor="#B85A2A" /></radialGradient></defs>
			<path d={`M${lx},384 V438`} stroke="#3A2416" strokeWidth={3} />
			<ellipse cx={lx} cy={492} rx={36} ry={40} fill="#FFB060" opacity={0.18} filter="url(#mistS)" />
			<rect x={lx - 14} y={438} width={28} height={10} rx={2} fill="#2A1710" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.2} />
			<ellipse cx={lx} cy={490} rx={30} ry={42} fill={`url(#lan${i})`} />
			<path d={`M${lx - 22},462 Q${lx},458 ${lx + 22},462 M${lx - 29},480 Q${lx},476 ${lx + 29},480 M${lx - 29},500 Q${lx},496 ${lx + 29},500 M${lx - 22},518 Q${lx},514 ${lx + 22},518`} fill="none" stroke="#9A4A22" strokeWidth={1.5} opacity={0.55} />
			<rect x={lx - 12} y={530} width={24} height={9} rx={2} fill="#2A1710" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.2} />
			<path d={`M${lx},539 V556`} stroke="#B8432A" strokeWidth={3} strokeLinecap="round" /></g>)}
		<Pool id="k11a" x={380} y={700} rx={420} ry={160} a={0.3} /><Pool id="k11b" x={1640} y={700} rx={420} ry={160} a={0.3} />
		<Pool id="k11c" x={860} y={820} rx={560} ry={260} a={0.24} />
		<IceBlock x={1440} y={790} w={110} h={70} d={40} seed={3} />
		<IceBlock x={1560} y={790} w={100} h={66} d={40} seed={4} />
		<IceBlock x={1490} y={722} w={104} h={64} d={36} seed={6} />
		{/* the row of workers, chisels ringing on the beat (two strike, two lift) */}
		<Picker x={230} g={790} h={300} up={false} seed={2} />
		<Picker x={440} g={790} h={290} up seed={4} />
		<Picker x={1150} g={790} h={300} up={false} seed={6} flip />
		<Picker x={1335} g={790} h={290} up flip />
		{/* the walker (Qing robe) takes the chisel for one swing: the 周 gesture again */}
		<Pool id="k11w" x={830} y={g + 4} rx={320} ry={44} a={0.3} />
		<Picker x={760} g={g} h={560} up walker col={B.lac} />
		<Chips x={985} y={g - 6} s={110} seed={9} dir={1} n={8} />
		<g fill="#F2F6F8" opacity={0.55}>{flakes.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
	</Frame>; };

/* ===================== KF12 · 75.0 s · C3 — the half-underground vault, section ===================== */
const KF12: React.FC = () => {
	const street = 760, floor = 860, wallTop = 460, T = 133;   // wall 400 px tall = 6 m, so 2 m = 133 px; floor 100 px (¼) below the street
	const L0 = 360, L1 = L0 + T, R0 = 1427, R1 = R0 + T, ax = (L1 + R0) / 2;
	const hatch = (x0: number, x1: number, y0: number, y1: number, id: string) => <g>
		<clipPath id={id}><rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} /></clipPath>
		<g clipPath={`url(#${id})`} stroke={B.gold} strokeOpacity={0.16} strokeWidth={1.5}>{Array.from({length: 40}, (_, i) => <path key={i} d={`M${x0 - 400 + i * 26},${y1} l400,-400`} />)}</g></g>;
	const stackX = 620, bw = 92, rowH = 50, gaugeT = 520, gaugeB = floor - 10, gx = 1350;
	const fill = gaugeB - (gaugeB - gaugeT) / 3;
	return <Frame id="k12" sheen={0.2} over={<><Subs rows={rows('存三份，化两份，剩下[一份]。')} th={thB} /><StampK y="清" place="故宫" note="估算：3 − 2 = 1" /><Counter era="清" th={thB} /><SealB /></>}>
		{/* outside: the earth (section) up to the street line, both sides */}
		<rect x={-40} y={street} width={L0 + 40} height={H - street + 40} fill="#1C100B" /><rect x={R1} y={street} width={W - R1 + 40} height={H - street + 40} fill="#1C100B" />
		<rect x={L0} y={floor} width={R1 - L0} height={H - floor + 40} fill="#1C100B" />
		<g fill={B.ochre} opacity={0.22}>{Array.from({length: 70}, (_, i) => { const side = i % 3, x = side === 0 ? rnd(i, 41) * (L0 - 20) : side === 1 ? R1 + 20 + rnd(i, 41) * (W - R1 - 20) : L0 + rnd(i, 41) * (R1 - L0), y = (side === 2 ? floor + 46 : street + 16) + rnd(i, 42) * 200; return <circle key={i} cx={x} cy={y} r={2.2} />; })}</g>
		<path d={`M-40,${street} H${L0} M${R1},${street} H${W + 40}`} stroke={B.goldL} strokeWidth={3} opacity={0.75} />
		<Label x={150} y={street - 16} s="地面" fs={40} col={B.goldL} />
		<Label x={R1 + 30} y={street - 16} s="地面" fs={40} col={B.goldL} />
		{/* the vault: the barrel arch and its tiled roof */}
		<path d={`M${L0},${wallTop} Q${ax},${wallTop - 270} ${R1},${wallTop} Z`} fill="#2A1712" stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
		<path d={`M${L0 - 50},${wallTop + 6} L${ax},${wallTop - 210} L${R1 + 50},${wallTop + 6} L${R1 + 40},${wallTop + 14} L${ax},${wallTop - 196} L${L0 - 40},${wallTop + 14} Z`} fill="#140A07" stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
		{/* interior: the arched room, a cool pool of light (the cold kept in) */}
		<path d={`M${L1},${floor} V${wallTop} Q${ax},${wallTop - 190} ${R0},${wallTop} V${floor} Z`} fill="#160E0D" />
		<Pool id="k12c" x={ax} y={floor - 120} rx={520} ry={260} a={0.2} col="#9FD2EA" />
		{/* the 2 m walls in section (stone courses + section hatch) */}
		{[[L0, L1], [R0, R1]].map(([a, b], i) => <g key={i}><rect x={a} y={wallTop} width={b - a} height={floor - wallTop + 30} fill="#3A2318" stroke={B.goldL} strokeOpacity={0.7} strokeWidth={2.5} />
			{hatch(a, b, wallTop, floor + 30, `hw${i}`)}
			{Array.from({length: 8}, (_, k) => <path key={k} d={`M${a},${wallTop + 50 * (k + 1)} H${b}`} stroke={B.gold} strokeOpacity={0.18} strokeWidth={1.2} />)}</g>)}
		<path d={`M${L1},${floor} H${R0}`} stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
		{/* the 两米 dimension line across the left wall */}
		<g>
			<path d={`M${L0},${wallTop - 6} V${wallTop - 70} M${L1},${wallTop - 6} V${wallTop - 70}`} stroke={B.cream} strokeWidth={2} opacity={0.8} />
			<path d={`M${L0 + 2},${wallTop - 50} H${L1 - 2}`} stroke={B.cream} strokeWidth={3} />
			<path d={`M${L0 + 2},${wallTop - 50} l16,-9 v18 Z M${L1 - 2},${wallTop - 50} l-16,-9 v18 Z`} fill={B.cream} />
		</g>
		<Label x={(L0 + L1) / 2 - 40} y={wallTop - 90} s="两米" fs={52} col={B.cream} anchor="middle" />
		{/* the stack after the summer: one third left; the dashed line is where it stood in winter */}
		{[0, 1].map((r) => [0, 1, 2, 3].map((c) => <IceBlock key={`${r}${c}`} x={stackX + c * bw} y={floor - r * rowH} w={bw - 4} h={rowH - 4} d={18} seed={r * 4 + c} marks={r === 1} />))}
		{/* the gauge on the wall: down to about a third, 「约2/3 化掉」 over the emptied part */}
		<rect x={gx} y={gaugeT} width={34} height={gaugeB - gaugeT} rx={17} fill="#0D0909" stroke={B.cream} strokeWidth={2.5} />
		<rect x={gx + 6} y={fill} width={22} height={gaugeB - fill - 6} rx={11} fill={ICE.body} />
		<rect x={gx + 6} y={gaugeT + 6} width={22} height={fill - gaugeT - 6} rx={11} fill={ICE.body} opacity={0.12} />
		{[0, 1, 2, 3].map((k) => <path key={k} d={`M${gx + 34},${gaugeT + (gaugeB - gaugeT) * k / 3} h14`} stroke={B.cream} strokeWidth={2} />)}
		<path d={`M${gx - 14},${gaugeT + 4} h-12 V${fill - 4} h12`} fill="none" stroke={B.goldL} strokeWidth={3} />
		<g transform={`translate(${gx - 40},${(gaugeT + fill) / 2})`}><rect x={-268} y={-40} width={256} height={62} rx={8} fill="#0E0705" stroke={B.gold} strokeOpacity={0.6} strokeWidth={2} />
			<text x={-140} y={6} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={44} fill={B.cream}>约2/3 化掉</text></g>
		{/* the three Zhou blocks ghost in: two melt away, one stays; the 「？」 pops */}
		<MeltBlock x={626} y={floor - 2 * rowH - 4} w={108} h={88} k={0.5} o={0.95} seed={4} />
		<MeltBlock x={746} y={floor - 2 * rowH - 4} w={108} h={88} k={0.26} o={0.9} seed={5} />
		<IceBlock x={866} y={floor - 2 * rowH - 4} w={108} h={88} d={44} seed={11} />
		<g transform="translate(800,560)">
			{Array.from({length: 10}, (_, i) => { const a = i * Math.PI / 5; return <path key={i} d={`M${Math.cos(a) * 52},${Math.sin(a) * 52} L${Math.cos(a) * 84},${Math.sin(a) * 84}`} stroke={B.goldL} strokeWidth={4} strokeLinecap="round" opacity={0.85} />; })}
			<text x={0} y={30} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={88} fill={B.goldL} opacity={0.9}>？</text></g>
		{/* the walker, small, inside the vault (scale: 1.7 m) */}
		<QingFig x={1180} ground={floor} h={128} pose={grounded({lean: 2, neck: 6, lt: 3, lk: 3, rt: -4, rk: 4, la: 4, le: 14, ra: 4, re: 12})} flip />
	</Frame>; };

/* ===================== KF13 · 92.0 s · K2 — 乾隆's cloisonné ice chest ===================== */
const KF13: React.FC = () => { const g = 905, cx = 1040, top = 548, ch = 180, cw = 324, standTop = top + ch;
	const wx = 680, wh = 640;
	let wp = grounded({lean: 6, neck: 14, lt: 4, lk: 4, rt: -6, rk: 5, la: 60, le: 30, ra: 4, re: 12});
	wp = ikArm(wp, 'L', toBody(cx - 150, top - 50, wx, g, wh));
	return <Frame id="k13" over={<><Subs rows={rows('箱里装冰，凉气从铜钱孔冒出，')} th={thB} /><StampK y="清" place="乾隆" note="故宫藏 · 高45厘米" /><Counter era="清 · 乾隆" th={thB} /><SealB /></>}>
		{/* the hall: hot summer light through the lattice windows, columns, a gold-brick floor */}
		<rect x={-40} y={300} width={W + 80} height={g - 300} fill={BG.wall} />
		{[[210, 380], [1330, 380]].map(([x0, w], i) => <g key={i}>
			<rect x={x0} y={340} width={w} height={360} fill="#C9782E" opacity={0.42} />
			<path d={[...Array.from({length: 9}, (_, k) => `M${x0 + (k + 1) * w / 10},340 V700`), ...Array.from({length: 8}, (_, k) => `M${x0},${340 + (k + 1) * 40} H${x0 + w}`)].join(' ')} stroke="#2A140C" strokeWidth={6} />
			<rect x={x0} y={340} width={w} height={360} fill="none" stroke={B.gold} strokeOpacity={0.4} strokeWidth={3} />
			<path d={`M${x0 + 20},700 L${x0 + w - 20},700 L${x0 + w + 180},${g} L${x0 + 140},${g} Z`} fill="#FFB060" opacity={0.07} /></g>)}
		{[120, 780, 1220, 1820].map((x0, i) => <rect key={i} x={x0} y={260} width={50} height={g - 260} fill="#3A140E" stroke={BG.line} strokeWidth={1.2} />)}
		<rect x={-40} y={262} width={W + 80} height={40} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<Pool id="k13" x={cx - 60} y={600} rx={640} ry={420} a={0.34} />
		<Ground g={g} lattice={false} />
		<path d={Array.from({length: 5}, (_, i) => `M-40,${g + 20 + i * 36} H${W + 40}`).join(' ') + ' ' + Array.from({length: 22}, (_, i) => `M${-40 + i * 96},${g} l${(i - 11) * 12},180`).join(' ')} stroke={B.gold} strokeOpacity={0.1} strokeWidth={1.5} />
		{/* the stand */}
		<rect x={cx - cw / 2 - 20} y={standTop} width={cw + 40 + 60} height={20} fill="#2E1610" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
		<path d={`M${cx - cw / 2 - 6},${standTop + 20} Q${cx - cw / 2 - 20},${standTop + 110} ${cx - cw / 2 + 4},${g} H${cx - cw / 2 + 20} Q${cx - cw / 2 + 6},${standTop + 100} ${cx - cw / 2 + 18},${standTop + 20} Z M${cx + cw / 2 + 44},${standTop + 20} Q${cx + cw / 2 + 58},${standTop + 110} ${cx + cw / 2 + 34},${g} H${cx + cw / 2 + 18} Q${cx + cw / 2 + 32},${standTop + 100} ${cx + cw / 2 + 20},${standTop + 20} Z`} fill="#2E1610" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.2} />
		<path d={`M${cx - cw / 2},${standTop + 20} Q${cx + 30},${standTop + 54} ${cx + cw / 2 + 30},${standTop + 20}`} fill="none" stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} />
		<IceChest x={cx} top={top} w={cw} h={ch} />
		{/* cold air pooling on the floor around the stand */}
		<g filter="url(#mist)" opacity={0.4}><ellipse cx={cx - 160} cy={g - 8} rx={150} ry={16} fill="#DCEFF9" /><ellipse cx={cx + 220} cy={g - 8} rx={150} ry={16} fill="#DCEFF9" /></g>
		<Pool id="k13f" x={wx + 40} y={g + 4} rx={280} ry={40} a={0.26} />
		{/* the walker (Qing robe) holds his palm over the breath */}
		<QingFig x={wx} ground={g} h={wh} pose={wp} />
	</Frame>; };

/* ===================== KF14 · 100.0 s · M2 — 1990, 100 village windows, 1.22 lit ===================== */
const KF14: React.FC = () => { const g = 935;
	const gx0 = 150, gy0 = 288, cw = 96, chh = 60, lit = [5, 3], sliver = [5, 4], frac = 0.22;
	const stars = Array.from({length: 40}, (_, i) => [rnd(i, 51) * W, 250 + rnd(i, 52) * 120, 1 + 1.5 * rnd(i, 53)]);
	const houses: React.ReactNode[] = [];
	for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
		const x = gx0 + c * cw, y = gy0 + r * chh, wall = y + chh * 0.42, ww = cw * 0.78, wx0 = x + (cw - ww) / 2, isLit = r === lit[0] && c === lit[1], isSl = r === sliver[0] && c === sliver[1];
		const roofK = rnd(r * 10 + c, 61), win = {x: x + cw / 2 - 17, y: wall + 6, w: 34, h: 20};
		houses.push(<g key={`${r}-${c}`}>
			<rect x={wx0} y={wall} width={ww} height={chh - (wall - y) - 4} fill="#33201A" stroke={B.gold} strokeOpacity={0.18} strokeWidth={1} />
			<path d={roofK > 0.5 ? `M${wx0 - 6},${wall + 2} L${x + cw / 2},${y + 4} L${wx0 + ww + 6},${wall + 2} Z` : `M${wx0 - 8},${wall + 2} Q${x + cw / 2},${y + 2} ${wx0 + ww + 8},${wall + 2} Z`} fill="#1E100B" stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.4} />
			<rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#140A07" stroke="#C9A060" strokeOpacity={0.75} strokeWidth={1.6} />
			{isLit && <>
				<rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#EAF6FF" stroke="#FFFFFF" strokeWidth={1.5} />
				<rect x={win.x + 9} y={win.y + 3} width={10} height={15} fill="#BFD6E0" /></>}
			{isSl && <rect x={win.x} y={win.y} width={win.w * frac} height={win.h} fill="#EAF6FF" />}
		</g>);
	}
	return <Frame id="k14" sheen={0.15} over={<><Subs rows={rows('1990年，农村每百户只有[1.22台]。')} th={thB} /><StampK y="1990" place="中国农村" note="国家统计局" /><Counter year="1990" th={thB} /><SealB /></>}>
		<g fill="#E8E0D0" opacity={0.35}>{stars.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
		<path d={`M-40,${gy0 + 30} Q400,${gy0 - 40} 900,${gy0 + 10} Q1400,${gy0 + 50} 1960,${gy0 - 10} V${H} H-40 Z`} fill="#1A0E0A" />
		<path d={`M-40,${gy0 + 30} Q400,${gy0 - 40} 900,${gy0 + 10} Q1400,${gy0 + 50} 1960,${gy0 - 10}`} fill="none" stroke={B.gold} strokeOpacity={0.2} strokeWidth={1.5} />
		{houses}
		{/* the one fridge's cold light spills out of its window (drawn over the neighbours), then the window again */}
		{(() => { const x = gx0 + lit[1] * cw, y = gy0 + lit[0] * chh, wy = y + chh * 0.42 + 7; return <g>
			<ellipse cx={x + cw / 2} cy={wy + 9} rx={cw * 0.9} ry={chh * 0.75} fill="url(#iceGlow)" />
			<rect x={x + cw / 2 - 17} y={wy - 1} width={34} height={20} fill="#EAF6FF" stroke="#FFFFFF" strokeWidth={1.5} /><rect x={x + cw / 2 - 6} y={wy + 2} width={11} height={17} fill="#BFD6E0" /></g>; })()}
		<Ground g={g} />
		<Pool id="k14w" x={1420} y={g + 4} rx={240} ry={34} a={0.26} />
		{/* the number on a dark panel */}
		<g transform="translate(1210,300)"><rect x={0} y={0} width={500} height={250} rx={12} fill="#0E0705" stroke={B.gold} strokeOpacity={0.6} strokeWidth={2.5} />
			<text x={250} y={70} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={56} fill={B.cream}>农村 · 每百户</text>
			<FridgeIcon x={44} y={110} h={110} />
			<text x={290} y={204} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={132} fill={B.goldL}>1.22<tspan fontSize={64} dx={10}>台</tspan></text></g>
		<RimFig x={1400} ground={g} h={355} pose={grounded({lean: 0, neck: -18, lt: 3, lk: 3, rt: -4, rk: 4, la: 4, le: 14, ra: 4, re: 12})} look={LOOKS51.today} col={B.lac} flip dx={-3} dy={-2.5} />
	</Frame>; };

/* ===================== registration ===================== */
const KFS: React.FC[] = [KF09, KF10, KF11, KF12, KF13, KF14];
const one = (C: React.FC): React.FC => () => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KF51B-ALL" component={All} width={W} height={H} fps={30} durationInFrames={KFS.length} />
	{KFS.map((C, i) => <Composition key={i} id={`KF51B-${String(i + 9).padStart(2, '0')}`} component={one(C)} width={W} height={H} fps={30} durationInFrames={1} />)}
</>;
registerRoot(Root);
void walkPose; void ICE;
