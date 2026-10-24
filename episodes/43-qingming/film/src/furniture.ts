// Screen furniture for ep43 as data (storyboard r3 + script v2.3.1): stamps, era chip + age counter, tally, labels.
// Everything is a pure function of film time t.
import {bar, clamp01, smooth, easeInOut} from './core';
import {Stamp, Age, stamp, age, tally, label, mark} from './hud';

const b = bar;
type SRow = [number, number, Stamp];
/** stamps: [from, to, stamp] — a stamp "arrives" (drop-in) at its from time */
export const STAMPS: SRow[] = [
	[0, b(2.5), {s1: '— 《清明上河图》'}],
	[b(4.5), b(6), {s1: '— 元 · 1351年前'}],
	[b(6), b(7), {s1: '— 1578 · 紫禁城'}],
	[b(7), b(8), {s1: '— 1923 · 紫禁城'}],
	[b(8), b(9), {s1: '— 约1950 · 沈阳'}],
	[b(9), b(10.75), {s1: '— 2025 · 故宫午门', s2: '故宫百年 · 展了一个月'}],
	[b(10.75), b(11.5), {s1: '— 2025年10月30日', s2: '撤展回库'}],
	[b(13), b(14.5), {s1: '— 北宋末年 · 汴京', s2: '画成，未署名'}],
	[b(14.5), b(15.5), {s1: '— 北宋 · 宫廷', s2: '首次入宫（故宫博物院）'}],
	[b(15.5), b(17.5), {s1: '— 1127 · 汴京', s2: '靖康之变，流入金国'}],
	[b(17.5), b(19), {s1: '— 1186 · 金国', s2: '张著题跋（今在卷尾）', s3: '落款：清明后一日'}],
	[b(19), b(23.5), {s1: '— 1186 · 金国', s2: '张著题跋（今在卷尾）', s3: '落款：清明后一日'}],
	[b(23.5), b(25), {s1: '— 元初 · 元朝宫廷', s2: '再次入宫（故宫博物院）'}],
	[b(25), b(28), {s1: '— 元 · 1351年前', s2: '裱画匠调包（杨准记）', s3: '杨准原话："以似本易去"'}],
	[b(28), b(29.5), {s1: '— 1351 · 江西泰和', s2: '文人杨准买下，次年题跋'}],
	[b(29.5), b(31), {s1: '— 明 · 正德年间 · 苏州', s2: '陆完藏画友人家（余辉考）'}],
	[b(31), b(32.5), {s1: '— 明 · 中期', s2: '辗转归严嵩（故宫博物院）'}],
	[b(32.5), b(34), {s1: '— 明 · 严家被抄', s2: '你入宫（故宫博物院）'}],
	[b(34), b(37.5), {s1: '— 1578 · 紫禁城', s2: '冯保偷盗而出（故宫博物院）', s3: '冯保跋："心思爽然"'}],
	[b(37.5), b(39), {s1: '— 1799 · 紫禁城', s2: '毕沅家被抄，你入宫'}],
	[b(39), b(41), {s1: '— 嘉庆 · 延春阁', s2: '五玺全（《石渠宝笈三编》）'}],
	[b(41), b(42.5), {s1: '— 1923 · 紫禁城', s2: '以赏弟弟溥杰为名（清宫档案）'}],
	[b(42.5), b(46), {s1: '— 1923 · 紫禁城', s2: '25天内 · 4卷（清宫档案）'}],
	[b(46), b(47.5), {s1: '— 伪满时期 · 长春', s2: '存于伪满皇宫图书楼'}],
	[b(47.5), b(49), {s1: '— 1945年8月 · 长春', s2: '伪满覆灭'}],
	[b(49), b(50), {s1: '— 1945年8月', s2: '下落不明（伪满皇宫博物院）'}],
	[b(50), b(56), {s1: '— 约1950 · 沈阳', s2: '东北博物馆 · 杨仁恺'}],
	[b(57), b(58.5), {s1: '— 1950年代 · 北京', s2: '回到故宫博物院'}],
	[b(58.5), b(60.5), {s1: '— 明代', s2: '裱画师误补（故宫装裱记录）'}],
	[b(60.5), b(62), {s1: '— 1973 · 故宫', s2: '重新装裱（故宫装裱记录）'}],
	[b(62), b(64.75), {s1: '— 1186 · 张著题跋', s2: '你身上：几十方印 · 14段题跋'}],
	[b(64.75), b(66), {s1: '— 今天', s2: '约百卷仿本（余辉估）'}],
	[b(66), b(67.5), {s1: '— 宋 · 元 · 明 · 清', s2: '四次出宫（故宫博物院）'}],
	[b(67.5), b(72), {s1: '— 1950年代至今 · 故宫博物院', s2: '结束流离（故宫博物院）'}],
	[b(72), b(75.5), {s1: '— 故宫规定', s2: '展后静养三年以上（北京晚报）'}],
];
/** age rows: [from, to, era, value-from, value-to, roll start, roll end, pre, post]; hidden outside rows */
type ARow = {a: number; z: number; era: string; v0: number; v1: number; r0?: number; r1?: number; pre?: string; post?: string};
export const AGES: ARow[] = [
	{a: b(13), z: b(15.5), era: '北宋', v0: 0, v1: 0},
	{a: b(15.5), z: b(16), era: '金', v0: 0, v1: 27, r0: b(15.5), r1: b(16), pre: '约'},
	{a: b(16), z: b(23.5), era: '金', v0: 27, v1: 86, r0: b(16.2), r1: b(17.5), pre: '约'},
	{a: b(23.5), z: b(25), era: '元', v0: 86, v1: 170, r0: b(23.5), r1: b(24.1), post: '多'},
	{a: b(25), z: b(28.5), era: '元', v0: 170, v1: 200, r0: b(25), r1: b(25.5), post: '多'},
	{a: b(28.5), z: b(29.5), era: '元', v0: 200, v1: 251, r0: b(28.5), r1: b(29.1), pre: '约'},
	{a: b(29.5), z: b(32.5), era: '明', v0: 251, v1: 400, r0: b(29.5), r1: b(30.1), post: '多'},
	{a: b(32.5), z: b(33.75), era: '明', v0: 400, v1: 470, r0: b(32.5), r1: b(33), pre: '约'},
	{a: b(33.75), z: b(37.5), era: '明', v0: 470, v1: 478, r0: b(33.75), r1: b(34.1), pre: '约'},
	{a: b(37.5), z: b(41), era: '清', v0: 478, v1: 699, r0: b(37.5), r1: b(38.1), pre: '约'},
	{a: b(41), z: b(46), era: '民国', v0: 699, v1: 823, r0: b(41), r1: b(41.6), pre: '约'},
	{a: b(46), z: b(47.5), era: '民国', v0: 823, v1: 830, r0: b(46), r1: b(46.4), post: '多'},
	{a: b(47.5), z: b(49), era: '民国', v0: 830, v1: 845, r0: b(47.5), r1: b(48), pre: '约'},
	{a: b(49), z: b(50), era: '民国', v0: 845, v1: 850, r0: 112.8, r1: 114.25, pre: '约'},   // still 民国 through the silence (1945); 新中国 from the lamp reveal
	{a: b(50), z: b(56), era: '新中国', v0: 850, v1: 850, pre: '约'},
	{a: b(57), z: b(58.5), era: '新中国', v0: 850, v1: 850, post: '多'},
	{a: b(58.5), z: b(60.5), era: '明', v0: -1, v1: -1},                 // chip only, counter hidden (undated Ming flashback)
	{a: b(60.5), z: b(62), era: '新中国', v0: 850, v1: 873, r0: b(60.5), r1: b(61), pre: '约'},
	{a: b(62), z: b(66), era: '新中国', v0: 873, v1: 900, r0: b(62.25), r1: b(62.75), post: '多'},
	{a: b(67.5), z: b(75.5), era: '新中国', v0: 900, v1: 900, post: '多'},
];
/** the 四出五进 tally: events in order */
const TALLY: [number, 'in' | 'out'][] = [[b(15), 'in'], [b(15.75), 'out'], [b(24.5), 'in'], [b(27.5), 'out'], [b(33.5), 'in'], [b(35.25), 'out'], [b(38), 'in'], [b(42), 'out'], [b(57.5), 'in']];
const TALLY_ON: [number, number][] = [[b(12), b(56)], [b(57), b(75.5)]];
const LABELS: [number, number, number, number, string][] = [[b(13.5), b(14.25), 300, 640, '5米多长'], [b(14), b(14.25), 300, 730, '几百个人'], [b(65), b(65.75), 1200, 700, '约一百卷 · 只有一卷是你']];

const within = (t: number, a: number, z: number) => t >= a && t < z;
export const drawFurniture = (hud: HTMLElement, t: number, opts: {hideAll?: boolean} = {}) => {
	mark(hud);
	if (opts.hideAll) return;
	const S = STAMPS.find(([a, z]) => within(t, a, z));
	if (S) { const [a, z, st] = S; const prev = STAMPS.find(([, z2]) => Math.abs(z2 - a) < 1e-3); const same = prev && prev[2].s1 === st.s1 && prev[2].s2 === st.s2;
		stamp(hud, st, t, same || a === 0 ? a - 1 : a, clamp01((z - t) / 0.15) + (STAMPS.some(([a2]) => Math.abs(a2 - z) < 1e-3) ? 1 : 0)); }
	const A = AGES.find((r) => within(t, r.a, r.z));
	if (A) {
		if (A.v0 < 0) html_chip(hud, A.era);
		else { const k = A.r0 !== undefined ? easeInOut(clamp01((t - A.r0) / Math.max(1e-3, A.r1! - A.r0))) : 1; let v = A.v0 + (A.v1 - A.v0) * k; if (v > 249.5 && v < 250.5) v = 250.6;
			age(hud, {era: A.era, v, pre: A.pre, post: A.post}); }
	}
	if (TALLY_ON.some(([a, z]) => within(t, a, z))) {
		let outN = 0, inN = 0; for (const [tt, kind] of TALLY) { const f = clamp01((t - tt) / 0.12); if (kind === 'in') inN += f; else outN += f; }
		const draw = clamp01((t - b(12)) / (b(12.5) - b(12)));
		const flashAll = clamp01(1 - Math.abs(t - b(58)) / 0.5);
		const flashOut = [66, 66.25, 66.5, 66.75].reduce((m, x) => Math.max(m, clamp01(1 - Math.abs(t - b(x)) / 0.2)), 0);
		tally(hud, outN, inN, draw, flashAll, flashOut);
	}
	for (const [a, z, x, y, text] of LABELS) if (within(t, a - 0.2, z + 0.2)) label(hud, x, y, text, clamp01((t - a) / 0.2) * clamp01((z - t) / 0.2));
};
/** chip alone (counter hidden) */
const html_chip = (hud: HTMLElement, era: string) => hud.insertAdjacentHTML('beforeend', `<div class="age sh"><div class="era">${era}</div></div>`);
