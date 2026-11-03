import React from 'react';
import {Img} from 'remotion';
import {Story, Punch, Stamp, Counter, Seal, SubRow, SEAL_SRC, TITLE_L1, TITLE_L2, INK, GOLD, SANS, KAI, YEAR, useFonts59, visLen, seg, sm} from '../qq59/skin59';
import {PhotoSlam, PHOTOS} from '../qq59/photo59';
import {W, H, D, BEAT} from './kit59';
import * as A from './p2a';
import * as B from './p2b';
/* ep59 《他走路回家，走了28年》 · PART 2 = bars 50–95 (film 85.37 s → 162.07 s), final pass after the owner's notes (19:04–19:05).
   Part2({t}): t = seconds since the bar-50 downbeat. It draws the whole frame: the SVG picture, the real-photo layer (HTML),
   the furniture (skin59: story rows, centred lines, stamp, counter, seal) and the end card. Film time inside = D(50) + t.
   Layers: picture | photos | furniture, each its own compositor layer (as EP59.tsx does). */
const BT = A.BT;
type Seg = {a: number; b: number; C: React.FC<{T: number}>; fade?: number};
/** the picture timeline: a scene is drawn on [a, b); `fade` = it dissolves in over that many seconds on top of what is under it */
const SEGS: Seg[] = [
	{a: D(50), b: D(51), C: A.SignScene},
	{a: D(51), b: D(53), C: A.RussiaScene},
	{a: D(53), b: BT(53, 2.9), C: A.GlobeAScene},
	{a: BT(53, 2.5), b: BT(54, 2), C: A.SteppeScene},
	{a: BT(54, 2), b: D(55), C: A.ChinaScene},
	{a: D(55), b: D(58) + 0.3, C: A.GateScene},
	{a: D(58) - 0.15, b: D(59), C: A.ShoreScene, fade: 0.42},
	{a: D(59), b: D(60), C: A.PackDropScene},
	{a: D(60), b: D(61), C: A.WadeScene},
	{a: D(61), b: D(62), C: A.GlobeBScene},
	{a: D(62), b: BT(63, 3.1), C: A.SeaLapseScene},
	{a: BT(63, 3), b: BT(64, 2.9), C: A.GlobeCScene},
	{a: BT(64, 2.7), b: D(66), C: A.TunnelScene},
	{a: D(66), b: D(68), C: A.ChannelScene},
	{a: D(68), b: D(70), C: B.HumberScene},
	{a: D(70), b: D(72), C: B.FarEndScene},
	{a: D(72), b: D(74) + 0.3, C: B.StreetScene},
	{a: D(74), b: D(76) + 0.3, C: B.BannerScene, fade: 0.3},
	{a: D(76), b: D(78) + 0.3, C: B.WindowScene, fade: 0.3},
	{a: D(78), b: D(80), C: B.DoorScene, fade: 0.3},
	{a: D(80), b: D(83), C: B.HugScene},
	{a: D(83), b: D(85) + 0.05, C: B.GlobeDScene},
	{a: D(85), b: D(87) + 0.4, C: B.TwoSelvesScene},
	{a: D(87), b: D(89), C: B.GlobeEScene, fade: 0.4},
	{a: D(89), b: D(95) + 1, C: B.NightScene},
];
const OVERLAYS: React.FC<{T: number}>[] = [A.CamelWipe, A.WaveWipe];
export const Picture2: React.FC<{T: number}> = ({T}) => <>
	{SEGS.map((s, i) => (T >= s.a && T < s.b ? <g key={i} opacity={s.fade ? sm(seg(T, s.a, s.a + s.fade)) : 1}><s.C T={T} /></g> : null))}
	{OVERLAYS.map((O, i) => <O key={`o${i}`} T={T} />)}
</>;

/* ---------- the lines (script v2 + the owner's 19:04 fix: the tunnel was refused in June, the Channel swim was in October) ---------- */
type Row = {s: string; at: number; chunks?: [number, number][]};
type Line = {a: number; b: number; rows: Row[]; punch?: boolean; top?: number; out?: number};
export const LINES2: Line[] = [
	{a: D(50), b: D(51), rows: [{s: '走到[俄罗斯大使馆]门口——', at: D(50) - 9}, {s: '举着牌子[抗议]。', at: D(50)}]},
	{a: D(51), b: D(53), rows: [{s: '光是俄罗斯，', at: D(51)}, {s: '他就走了[将近10年]。', at: D(52)}]},
	{a: D(53), b: D(55), rows: [{s: '[2017年]蒙古，[2018年]中国。', at: D(53), chunks: [[8, D(53)], [15, BT(54, 2)]]}]},
	{a: D(55), b: D(57), rows: [{s: '然后伊朗拒签，', at: D(55)}, {s: '接着又是[疫情]。', at: D(56)}]},
	{a: D(57), b: D(58), rows: [{s: '路又断了。', at: D(57)}]},
	{a: D(58), b: D(59), rows: [{s: '没有路，怎么办？', at: D(58)}]},
	{a: D(59), b: D(61), rows: [{s: '规矩不能破——', at: D(59)}, {s: '那就[游过去]。', at: D(60)}]},
	{a: D(61), b: D(64), rows: [{s: '2024年，他游过[里海]：', at: D(61)}, {s: '近300公里，游了[约一个月]。', at: D(62)}]},
	{a: D(64), b: D(66), rows: [{s: '一路走到法国，', at: D(64)}, {s: '海底隧道[不让走]，', at: BT(64, 2.6)}]},
	{a: D(66), b: D(68), rows: [{s: '今年10月，他游过了英吉利海峡，', at: D(66)}, {s: '游了[3天]。', at: D(67)}]},
	{a: D(68), b: D(70), rows: [{s: '11月1日，大雾，[亨伯大桥]。', at: D(68)}]},
	{a: D(70), b: D(72), rows: [{s: '家，就在桥的那一头。', at: D(70)}]},
	{a: D(72), b: D(74), rows: [{s: '第二天，他走进了那条街。', at: D(72)}]},
	{a: D(74), b: D(76), rows: [{s: '门口挂着：[欢迎回家，儿子]。', at: D(74)}]},
	{a: D(76), b: D(78), rows: [{s: '妈妈已经[十年]没见过他了。', at: D(76)}]},
	{a: D(78), b: D(80), rows: [{s: '她的第一句话是——', at: D(78)}]},
	{a: D(80), b: D(81), rows: [{s: '「你去哪儿了？」', at: D(80)}], punch: true, top: 300, out: D(81) - 0.16},
	{a: D(83), b: D(85), rows: [{s: '[约5万公里]，[约30个国家]。', at: D(83)}]},
	{a: D(85), b: D(87), rows: [{s: '出发时29岁，到家时57岁。', at: D(85)}]},
	{a: D(87), b: D(89), rows: [{s: '他用[28年]，走完了一条回家的路。', at: D(87)}]},
	{a: D(89), b: D(95) + 1, rows: [{s: '你上一次回家，是什么时候？', at: D(89)}], punch: true, top: 560},
];
const TYPE = 0.3;
const rowsAt = (T: number) => {
	const L = LINES2.find((l) => T >= l.a && T < l.b); if (!L) return null;
	const rows: SubRow[] = [];
	for (const r of L.rows) { if (T < r.at) continue; const len = visLen(r.s);
		let n = Math.ceil(len * seg(T, r.at, r.at + TYPE));
		if (r.chunks) { n = 0; let prev = 0; for (const [c, at] of r.chunks) { if (T >= at) n = Math.ceil(lerpN(prev, c, seg(T, at, at + 0.2))); prev = c; } }
		rows.push({s: r.s, n}); }
	return {L, rows};
};
const lerpN = (a: number, b: number, u: number) => a + (b - a) * u;

/* ---------- the stamp: [from, to, year ('' = none), place, note ≤ 10 字] (facts.md ✓ rows) ---------- */
type St = {a: number; b: number; y: string; place: string; note: string};
export const STAMPS2: St[] = [
	{a: D(50), b: D(51), y: '2012', place: '美国 华盛顿', note: '俄罗斯大使馆门口'},
	{a: D(51), b: D(53), y: '2006 → 2016', place: '俄罗斯', note: '每180天只能待90天'},
	{a: D(53), b: BT(54, 2), y: '2017', place: '蒙古', note: '牵着骆驼穿越戈壁'},
	{a: BT(54, 2), b: D(55), y: '2018', place: '中国', note: '他独自走进中国'},
	{a: D(55), b: D(56), y: '2018', place: '土库曼斯坦', note: '伊朗签证没批下来'},
	{a: D(56), b: D(58), y: '2020', place: '疫情', note: '又停了下来'},
	{a: D(58), b: D(59), y: '2024', place: '哈萨克斯坦', note: '里海边：陆路走不通'},
	{a: D(59), b: D(61), y: '2024', place: '哈萨克斯坦 里海边', note: '他说：我根本不会游泳'},
	{a: D(61), b: D(62), y: '2024', place: '里海', note: '哈萨克斯坦→阿塞拜疆'},
	{a: D(62), b: BT(63, 3), y: '2024', place: '里海', note: '白天游，晚上睡在船上'},
	{a: BT(63, 3), b: BT(64, 2.7), y: '2024 → 2026', place: '欧洲', note: '巴库 → 伊斯坦布尔 → 法国'},
	{a: BT(64, 2.7), b: D(66), y: '2026.6', place: '法国 加来', note: '隧道方：没法安排'},
	{a: D(66), b: D(68), y: '2026.10', place: '英吉利海峡', note: '泡在水里约20小时'},
	{a: D(68), b: D(70), y: '2026.11.1', place: '英国 亨伯大桥', note: '浓雾，桥上站满了人'},
	{a: D(70), b: D(72), y: '2026.11.1', place: '英国 亨伯大桥', note: '桥那头，就是赫尔'},
	{a: D(72), b: D(76), y: '2026.11.2', place: '英国 赫尔', note: '妈妈家那条街'},
	{a: D(76), b: D(78), y: '2026.11.2', place: '英国 赫尔', note: '妈妈 七十多岁'},
	{a: D(78), b: D(80), y: '2026.11.2', place: '英国 赫尔', note: '妈妈家门口'},
	{a: D(83), b: D(85), y: '1998 → 2026', place: '智利 → 英国', note: '4个大洲'},
	{a: D(87), b: D(89), y: '2026.11.2', place: '英国 赫尔', note: '到家了'},
];
const QUIET = '0 0 2px rgba(8,8,12,0.9), 0 1px 5px rgba(8,8,12,0.7), 0 2px 14px rgba(8,8,12,0.45)';
/** the skin's stamp without a year (same type and rule) */
const StampPlace: React.FC<{place: string; note: string; o: number}> = ({place, note, o}) => { useFonts59(`${place}${note}`);
	return <div style={{position: 'absolute', top: 58 + 8, right: 120 + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${GOLD}`, opacity: 0.92 * o, color: INK, textShadow: QUIET, whiteSpace: 'nowrap'}}>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, lineHeight: 1.6, letterSpacing: '0.05em'}}>{place}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 27, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.06em', opacity: 0.8}}>{note}</div></div>; };

/* ---------- the counter (year · 他 N 岁 · 已走 N 公里): follows the story; rolls through the decade in Russia and with the globe moments ---------- */
const snapRoll = (v: number) => { const a = Math.floor(v), f = v - a; return a + Math.max(0, (f - 0.82) / 0.18); };
type Cn = {year: number; age: number; km: number | null; approx: boolean; blur: number; o: number};
const counterAt = (T: number): Cn => {
	const c = (year: number, age: number, extra: Partial<Cn> = {}): Cn => ({year, age, km: null, approx: false, blur: 0, o: 1, ...extra});
	const roll = (y0: number, y1: number, a0: number, t0: number, t1: number) => { const k = sm(seg(T, t0, t1)), y = y0 + (y1 - y0) * k, sp = Math.abs(y1 - y0) / (t1 - t0) * (k > 0 && k < 1 ? 1 : 0);
		return c(snapRoll(y), snapRoll(a0 + (y - y0)), {blur: Math.min(1.5, sp / 6)}); };
	if (T < D(51)) return c(2012, 43);
	if (T < D(53)) return roll(2006, 2016, 37, D(51) + 0.05, D(53) - 0.2);
	if (T < BT(54, 2)) return c(2017, 48);
	if (T < D(56)) return c(2018, 49);
	if (T < D(58)) return c(2020, 51);
	if (T < D(64)) return roll(2020, 2024, 51, D(58) + 0.05, D(58) + 0.7);
	if (T < D(83)) return roll(2024, 2026, 55, BT(63, 3.1), BT(64, 1.9));
	const km = 50000 * sm(seg(T, D(83) + 0.05, BT(84, 1))), o = 1 - sm(seg(T, D(89), D(89) + 0.5));
	return c(2026, 57, {km, approx: true, o, blur: T < BT(84, 1) && T > D(83) ? 1.2 : 0});
};

/* ---------- the real photos: three, each on a strong beat (frost face · the dawn wetsuit · the hug) ---------- */
const PH = [
	{at: D(52), dur: BT(52, 3.45) - D(52), p: PHOTOS.frostFace, w: 820, cx: 1330, cy: 600, rot: -3, aspect: 1320 / 803, out: 'fly' as const},
	{at: D(67), dur: BT(67, 3.3) - D(67), p: PHOTOS.swimDawn, w: 840, cx: 1300, cy: 600, rot: 2.5, aspect: 1320 / 799, out: 'fly' as const},
	{at: D(81), dur: D(83) - D(81), p: PHOTOS.hug, w: 900, cx: 1030, cy: 572, rot: -1.5, aspect: 1130 / 837, out: 'cut' as const, caption: '2026.11.2 · 赫尔', end: D(83)},
];
const Photos: React.FC<{T: number}> = ({T}) => <>{PH.map((q, i) => (T >= q.at - 0.01 && T < (q.end ?? 1e9) ? <PhotoSlam key={i} src={q.p.src} pos={q.p.pos} t={T - q.at} dur={q.dur} w={q.w} cx={q.cx} cy={q.cy} rot={q.rot} aspect={q.aspect} out={q.out} caption={q.caption} dim={0.5} /> : null))}</>;

/* ---------- the end card (bars 91–95): the night window dimmed to 30 %, the J seal, the title in two lines, the question (already
   centred since bar 89), the pill, the sources; holds ≥ 5.5 s, then fades to black on the last bar ---------- */
const SRC1 = '资料：AP · Reuters · BBC · AFP · Explorersweb · karlbushby.world';
const SRC2 = '照片：Karl Bushby / 网络 · 音乐：《把回忆拼好给你》DJ版';
const EndCard: React.FC<{T: number}> = ({T}) => {
	useFonts59(`${TITLE_L1}${TITLE_L2}关注Juno·一起探索世界`);
	const k = sm(seg(T, D(91), D(91) + 0.45)), k2 = sm(seg(T, D(91) + 0.15, D(91) + 0.6)), k3 = sm(seg(T, D(91) + 0.3, D(91) + 0.75));
	if (k <= 0) return null;
	return <>
		<Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 66, top: 92, width: 132, height: 132, opacity: k2, transform: `rotate(-6deg) scale(${(1.15 - 0.15 * k2).toFixed(3)})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', fontFamily: SANS, fontWeight: 900, color: INK, opacity: k2, whiteSpace: 'nowrap',
			textShadow: '0 0 2px rgba(8,8,12,0.95), 0 2px 10px rgba(8,8,12,0.7)'}}>
			<div style={{fontSize: 54, lineHeight: 1.3, letterSpacing: '0.08em'}}>{TITLE_L1}</div>
			<div style={{fontSize: 92, lineHeight: 1.12, letterSpacing: '0.06em'}}>走了<span style={{color: GOLD}}>28年</span></div></div>
		<div style={{position: 'absolute', left: 960 - 230, top: 742, width: 460, height: 60, borderRadius: 30, border: `2px solid ${GOLD}`, background: 'rgba(255,194,74,0.08)', textAlign: 'center', lineHeight: '60px',
			fontFamily: KAI, fontWeight: 700, fontSize: 30, letterSpacing: '0.1em', color: GOLD, opacity: k3}}>关注 Juno · 一起探索世界</div>
		<div style={{position: 'absolute', left: 120, right: 120, top: 858, textAlign: 'center', fontFamily: SANS, fontSize: 23, lineHeight: 1.65, color: '#D8CCB6', opacity: 0.88 * k3, whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>
			{SRC1}<br />{SRC2}</div>
	</>;
};
void TITLE_L2; void YEAR;

export const Furniture2: React.FC<{T: number}> = ({T}) => {
	const R = rowsAt(T), st = STAMPS2.find((s) => T >= s.a && T < s.b), c = counterAt(T), end = T >= D(91);
	const stO = st ? sm(seg(T, st.a, st.a + 0.1)) : 0;
	let punch: React.ReactNode = null, story: React.ReactNode = null;
	if (R && R.L.punch) { const o0 = R.L.out ?? 1e9, o = sm(seg(T, R.L.a, R.L.a + 0.12)) * (1 - sm(seg(T, o0, o0 + 0.16)));
		if (o > 0.001) punch = <Punch s={R.rows[0]?.s ?? ''} o={o} top={R.L.top} size={R.L.top === 560 ? 76 : 80} />; }
	else if (R && R.rows.length) story = <Story rows={R.rows} />;
	return <>
		{story}{punch}
		{st && !end && (st.y ? <Stamp y={st.y} place={st.place} note={st.note} o={stO} /> : <StampPlace place={st.place} note={st.note} o={stO} />)}
		{c.o > 0.01 && <Counter year={c.year} age={c.age} km={c.km} kmApprox={c.approx} blur={c.blur} o={c.o} />}
		<EndCard T={T} />
		{!end && <Seal />}
	</>;
};

/** the whole of bars 50–95; t = seconds since the bar-50 downbeat */
export const Part2: React.FC<{t: number}> = ({t}) => {
	const T = D(50) + t, black = sm(seg(T, D(95) - 0.75, D(95) - 0.05));
	return <div style={{position: 'absolute', inset: 0, background: '#08090b', overflow: 'hidden'}}>
		<svg width={W} height={H} style={{position: 'absolute', willChange: 'transform'}}><Picture2 T={T} /><Vig /></svg>
		<div style={{position: 'absolute', inset: 0, willChange: 'transform'}}><Photos T={T} />
			{/* the end card dims the last shot to ~30 % (the picture only: the question and the card stay bright) */}
			{T >= D(91) && <div style={{position: 'absolute', inset: 0, background: '#06060a', opacity: 0.7 * sm(seg(T, D(91), D(91) + 0.45))}} />}</div>
		<div style={{position: 'absolute', inset: 0, willChange: 'transform'}}><Furniture2 T={T} /></div>
		{black > 0 && <div style={{position: 'absolute', inset: 0, background: '#000', opacity: black}} />}
	</div>;
};
const Vig: React.FC = () => <g pointerEvents="none"><defs><radialGradient id="v59p2" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.42" /></radialGradient></defs><rect width={W} height={H} fill="url(#v59p2)" /></g>;
export const P2_FRAMES = Math.round((D(95) - D(50)) * 30);
void BEAT;
