import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from './kit44';
import {LINES44F} from './lines44full';
import {T, seg, sm, ease, ColdBrain, CiderBox, Microscope, Highway, Storage, House, Needle, Meadow, Office} from './demo44';
import {Story, Punch, Stamp, Seal, Counter, SubRow, Skin, SkinCtx} from './skin44';
import {RoughA} from './rough44a';
import {RoughB} from './rough44b';
/* ep44 full cut: film 0–164.5 (4935 frames). Picture: the approved demo (0–35.5 story, EP44DEMO's scenes on their v1 clock),
   then RoughA (35.5–95.5 story) and RoughB (95.5–162.5 story, end card from 152.75). Furniture for the whole film is drawn here, once.
   Story time = lines.json + 0.5 s for every line after line 1 (line 1 runs 0–4.0). Every part runs on story time.
   FILM ↔ STORY (final pass, owner note "title flashes by"): story = film up to HOLD_AT (title settled by 14.0);
   the story clock then pauses for HOLD = 2.0 s while the title holds (the picture keeps moving on `hold`);
   from film HOLD_AT + 2.0 on, story = film − 2.0 (birth line story 15.25 = film 17.25; end card story 152.75–162.5 = film 154.75–164.5). */
export const FPS = 30;
const SH = 0.5, L1 = 4.0, END = 162.5, HOLD_AT = 14.25, HOLD = 2.0, FILM_END = END + HOLD;
export const FRAMES = Math.round(FILM_END * FPS);
export const storyOf = (ft: number): {s: number; hold: number} => (ft < HOLD_AT ? {s: ft, hold: 0} : ft < HOLD_AT + HOLD ? {s: HOLD_AT, hold: ft - HOLD_AT} : {s: ft - HOLD, hold: HOLD});
const sceneT = (t: number) => (t < L1 ? t * T.box / L1 : t - SH);
const film = (v1: number) => (v1 <= T.box ? v1 * L1 / T.box : v1 + SH);
const LINES: [number, number, string][] = LINES44F.map(([a, b, s], i) => (i === 0 ? [0, L1, s] : [a + SH, b + SH, s]));
LINES[48][1] = END;   // the question holds to the end; everything fades together
/* ---------- picture ---------- */
type Sc = {a: number; b: number; C: React.FC<{t: number; hold?: number}>};
const DEMO: Sc[] = [
	{a: 0, b: T.box, C: ColdBrain}, {a: T.box, b: T.mic, C: CiderBox}, {a: T.mic, b: T.car, C: Microscope}, {a: T.car, b: T.room, C: Highway},
	{a: T.room, b: T.title, C: Storage}, {a: T.title, b: T.think, C: House}, {a: T.think, b: T.light, C: Needle}, {a: T.light, b: T.office, C: Meadow}, {a: T.office, b: T.end + 1, C: Office},
];
const XF = [0, 0.3, 0.24, 0.14, 0.3, 0.3, 0.24, 0.3, 0.3];
const Demo44: React.FC<{t: number; hold?: number}> = ({t, hold = 0}) => {
	const parts: React.ReactNode[] = [];
	DEMO.forEach((S, i) => { const x0 = XF[i] / 2, x1 = (XF[i + 1] ?? 0) / 2;
		if (t < S.a - x0 || t >= S.b + x1) return;
		const o = x0 > 0 ? sm(seg(t, S.a - x0, S.a + x0)) : 1;
		parts.push(<g key={i} opacity={o}><S.C t={Math.max(S.a, Math.min(S.b + x1, t))} hold={hold} /></g>); });
	return <>{parts}</>;
};
/** hand-offs: the demo → A dissolves on the glow of the 相对论 sheet; A → B is a match on one glowing block */
const A0 = 35.5, B0 = 95.5, XA = 0.36, XB = 0.24;
const Picture: React.FC<{t: number; hold: number}> = ({t, hold}) => <>
	{t < A0 + XA / 2 && <Demo44 t={sceneT(Math.min(t, A0 + XA / 2))} hold={hold} />}
	{t >= A0 - XA / 2 && t < B0 + XB / 2 && <g opacity={sm(seg(t, A0 - XA / 2, A0 + XA / 2))}><RoughA t={Math.min(t, B0 + XB / 2)} /></g>}
	{t >= B0 - XB / 2 && <g opacity={sm(seg(t, B0 - XB / 2, B0 + XB / 2))}><RoughB t={Math.max(B0, t)} /></g>}
</>;
/* ---------- subtitles ---------- */
const CUT_ON = new Set([1, 2, 3, 4, 12, 19, 20, 36, 39, 40, 48]), PUNCH = new Set([4, 20, 48]);
const STACK: Record<number, number> = {7: 6, 10: 9, 12: 11, 15: 14, 18: 17, 23: 22, 29: 28, 31: 30, 34: 33, 36: 35, 38: 37, 40: 39, 42: 41, 45: 44, 47: 46};
/** F2 sets 一定【深藏着什么】 exactly where K2 had it (K2's prefix is 4 字 longer) */
const INDENT: Record<number, number> = {45: 4};
const ATTRIB: Record<number, string> = {46: '——爱因斯坦', 47: '——爱因斯坦'};
const TYPE = 0.35, STAMP_AT = 0.45, COUNT_AT = 0.8;
const subsAt = (t: number): {rows: SubRow[]; punch?: {s: string; o: number}} => {
	const i = LINES.findIndex(([a, b]) => t >= a && t < b); if (i < 0) return {rows: []};
	const [a, , s] = LINES[i], len = s.replace(/[[\]]/g, '').length, typed = CUT_ON.has(i) ? len : Math.ceil(len * (i === 0 ? 0.35 + 0.65 * seg(t, 0, TYPE) : seg(t, a, a + TYPE)));
	if (PUNCH.has(i)) return {rows: [], punch: {s, o: sm(seg(t, a, a + 0.12))}};
	const rows: SubRow[] = []; const top = STACK[i];
	if (top !== undefined) rows.push({s: LINES[top][2], indent: INDENT[top]});
	rows.push({s, n: typed, indent: INDENT[i]});
	if (ATTRIB[i]) rows.push({s: ATTRIB[i], small: true, o: i === 46 ? sm(seg(t, a + 0.6, a + 1.0)) : 1});
	return {rows};
};
/* ---------- stamp: [line, year, place, note]; the cold open (0–12.75) keeps year-only stamps ---------- */
const STAMPS: [number, string, string?, string?][] = [
	[0, '1955'], [1, '1978'], [2, '1985'], [3, '1997'], [4, '2026'],
	[5, '1879', '德国 乌尔姆', '后脑勺又大又方'], [6, '约1884', '德国 慕尼黑', '爸爸给他看指南针'], [8, '1895', '瑞士 阿劳', '16岁的追光问题'],
	[9, '1902', '瑞士 伯尔尼', '专利局三级技术员'], [10, '1905', '瑞士 伯尔尼', '这一年：4篇论文'],
	[11, '1919', '普林西比岛', '爱丁顿观测日全食'], [12, '1919.11', '伦敦', '观测结果公布'], [13, '1922', '诺贝尔物理学奖', '理由：光电效应'],
	[14, '1939', '美国', '致罗斯福的信 8月2日'], [16, '1954', '美国 普林斯顿', '对鲍林说'],
	[17, '1955', '美国 普林斯顿', '据秘书杜卡斯回忆'], [19, '1955.4.18', '普林斯顿医院', '凌晨1点多'],
	[21, '1955', '普林斯顿医院', '值班病理医生 哈维'], [22, '1955', '美国 普林斯顿', '长子汉斯·阿尔伯特'],
	[24, '1955.4.18', '当天火化', '骨灰撒掉：不想被朝拜'], [25, '1955', '普林斯顿医院', '称重：1230克'],
	[26, '1955', '美国 费城', '切前先拍了几十张照片'], [27, '1955 → 1978', undefined, '报纸：几天内开始研究'],
	[28, '1978', '美国 威奇托', '记者 列维 找到你'],
	[30, '1985', '美国 伯克利', '对照：11个男性大脑'], [33, '1997', '美国公路', '作家帕特尼蒂租车同行'], [35, '1997', '美国 伯克利', '爱因斯坦的孙女伊芙琳'],
	[37, '1999', '《柳叶刀》', '对照：35个男性大脑'], [39, '2012', '美国 佛罗里达', '右额叶：4道褶'],
	[41, '1955–2015', undefined, '6篇正式论文'], [43, '2026', '今天', '切片：两家医学博物馆'],
	[44, '1955 → 今天', undefined, '研究你的人'], [45, '约1884', '德国 慕尼黑', '那只指南针'], [46, '柏林', undefined, '纪念牌上，他自己的原话'],
];
/** cold-open stamps (lines 1–4) change on the hard cut, the same frame the counter starts to roll */
const ON_CUT = new Set([1, 2, 3, 4, 8, 9, 12, 13]);   // lines that start on a hard picture cut: the stamp (and era tag) change on the cut
const stAt = (i: number) => (i === 0 ? 0 : ON_CUT.has(i) ? LINES[i][0] : LINES[i][0] + STAMP_AT);
const stampAt = (t: number) => { if (t >= film(T.title) && t < stAt(5)) return null; if (t >= LINES[48][0]) return null;
	let cur: (typeof STAMPS)[number] | null = null; for (const s of STAMPS) if (t >= stAt(s[0])) cur = s;
	if (!cur) return null; const a = cur[0] === 0 ? -1 : stAt(cur[0]); return {s: cur, o: sm(seg(t, a, a + (ON_CUT.has(cur[0]) ? 0.06 : 0.15)))}; };
/* ---------- counter: [story time, value, era, roll s, date (fractional year) or undefined, date frozen] ---------- */
const lc = (i: number) => LINES[i][0] + COUNT_AT;
const D1 = LINES[19][0], D2 = LINES[20][0], A7 = LINES[27][0], B0C = LINES[5][0];
const CK: [number, number, string | undefined, number, number?, boolean?][] = [[0, 76, undefined, 0], [LINES[1][0], 99, undefined, 0.2], [LINES[2][0], 106, undefined, 0.2], [LINES[3][0], 117, undefined, 0.2], [LINES[4][0], 147, undefined, 0.2],
	[film(T.title) + 0.1, 0, undefined, 1.35], [LINES[5][0], 0, '出生', 0], [lc(6), 4, '童年', 0.3], [film(20.3), 5, '童年', 0.3], [LINES[8][0], 16, '少年', 0.4], [LINES[9][0], 23, '青年', 0.4], [lc(10), 26, '青年', 0.4],
	[lc(11), 40, '壮年', 0.5], [lc(13), 43, '壮年', 0.3], [lc(14), 60, '晚年', 0.5], [lc(16), 75, '晚年', 0.4], [lc(17), 76, '晚年', 0.3],
	[D1, 76, undefined, 0], [D2, 76, undefined, 0, 1955.2945, true], [A7 + 0.3, 99, undefined, 2.6, 1978.58],
	[lc(30), 106, undefined, 2.4, 1985.4], [lc(33), 117, undefined, 0.4, 1997.15], [lc(37), 120, undefined, 0.3, 1999.45], [lc(39), 133, undefined, 0.25, 2012.87],
	[lc(41), 136, undefined, 0.3, 2015.5], [lc(43), 147, undefined, 0.4, 2026.81]];
const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const fmtDate = (y: number) => { const yr = Math.floor(y); let d = Math.floor((y - yr) * 365), m = 0; while (m < 11 && d >= MD[m]) { d -= MD[m]; m++; }
	return `${yr}.${String(m + 1).padStart(2, '0')}.${String(d + 1).padStart(2, '0')}`; };
const counterAt = (t: number) => { let i = 0; while (i + 1 < CK.length && t >= CK[i + 1][0]) i++;
	const [a, v, era, roll, dt, frozen] = CK[i], prev = i > 0 ? CK[i - 1][1] : v, k = roll > 0 ? ease(seg(t, a, a + roll)) : 1, val = prev + (v - prev) * k;
	const k2 = roll > 0 ? ease(seg(t + 1 / 30, a, a + roll)) : 1, speed = Math.abs((v - prev) * (k2 - k)) * 30;
	let date: string | undefined;
	if (dt !== undefined) { const pd = i > 0 && CK[i - 1][4] !== undefined ? CK[i - 1][4]! + (CK[i - 1][5] ? 0 : 0.0045 * (a - CK[i - 1][0])) : dt, hold = (t - a - roll) * 0.0045;
		const last = i === CK.length - 1;   // today: the date stops at the present
		date = frozen ? fmtDate(dt) : fmtDate(roll > 0 ? pd + (dt - pd) * k + (last ? 0 : Math.max(0, hold)) : dt + Math.max(0, t - a) * 0.0045); }
	return {val, era, blur: Math.min(5, speed / 25), date}; };
const Furniture: React.FC<{t: number}> = ({t}) => {
	const sub = subsAt(t), st = stampAt(t), c = counterAt(t);
	const dimC = t >= LINES[44][0] ? 0.55 : 1, hideC = 1 - sm(seg(t, LINES[48][0] - 0.3, LINES[48][0]));
	/* round 2 (owner note 7): 他 N 岁 while he lives (birth → the death beat), 你 N 岁 before (the cold open is after his death; the rewind
	   counts 你 147 → 0) and after (from 「你没有」 on: the grey 他 76 lifts away, 你 76 carries on). At birth 你 dissolves into 他 in 0.3 s. */
	const alive = t >= B0C && t < D2, who = alive ? '他' : '你', whoK = alive ? sm(seg(t, B0C, B0C + 0.3)) : 1;
	const frozen = t >= D1 && t < D2, ghost = t >= D2 ? 1 - sm(seg(t, D2 + 0.4, D2 + 1.6)) : 0, pulse = t >= D2 ? Math.exp(-(t - D2) / 0.35) : 0;
	return <>
		<Story rows={sub.rows} />
		{sub.punch && <Punch s={sub.punch.s} o={sub.punch.o} />}
		{st && <Stamp y={st.s[1]} place={st.s[2]} note={st.s[3]} o={st.o} />}
		{ghost > 0.01 && <Counter who="他" v={76} grey o={0.75 * ghost} lift={78 + 40 * (1 - ghost)} />}
		{hideC > 0.01 && <Counter who={who} whoFrom={whoK < 1 ? '你' : undefined} whoK={whoK} era={c.era} v={c.val} blur={c.blur} grey={frozen} pulse={pulse} o={dimC * hideC} date={c.date ? c.date : undefined} />}
		{t < LINES[48][0] && <Seal />}
	</>;
};
/** the vignette only (QA / owner row 44: no film grain) */
const Vignette: React.FC = () => <g pointerEvents="none"><defs><radialGradient id="v44m" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient></defs><rect width={W} height={H} fill="url(#v44m)" /></g>;
/** `skin` picks the caption-layout test variant (SKINTEST.tsx); EP44ROUGH itself always renders skin A */
export const Rough: React.FC<{skin?: Skin}> = ({skin = 'D'}) => {
	const f = useCurrentFrame(), ft = f / FPS, {s: t, hold} = storyOf(ft), fade = sm(seg(ft, FILM_END - 1.0, FILM_END - 0.03));
	return <AbsoluteFill style={{background: '#0c1012'}}>
		{/* round 2 (owner note 1, the 0:17 "second nursery"): that frame was not drawn twice. In pic.mp4, frames 521, 524–525 and 528–529
		    (film 17.37–17.63, while 「刚出生…」 types in) carry a pixel copy of the same frame's rows 286 px lower pasted into rows 287–420;
		    the identical frames rendered as stills are clean. It is a raster/capture glitch in the sequential render, set off when the
		    subtitle layer (CSS blur pool + per-frame typing) repaints over this heavy SVG. The picture and the furniture now sit on their
		    own compositor layers, so subtitle repaints no longer re-raster the picture's tiles (pixels unchanged). */}
		<svg width={W} height={H} style={{position: 'absolute', willChange: 'transform'}}><Picture t={t} hold={hold} /><Vignette /></svg>
		<div style={{position: 'absolute', inset: 0, willChange: 'transform'}}><SkinCtx.Provider value={skin}><Furniture t={t} /></SkinCtx.Provider></div>
		{fade > 0 && <AbsoluteFill style={{background: '#06080a', opacity: fade}} />}
	</AbsoluteFill>;
};
/* SKINTEST.tsx imports this file for `Rough` and registers its own root (it sets the flag first, in skinflag44.ts) */
if (!(globalThis as {__EP44_NO_ROOT?: boolean}).__EP44_NO_ROOT) registerRoot(() => <Composition id="EP44ROUGH" component={Rough} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />);
