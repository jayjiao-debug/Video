/* ep59 《他走路回家，走了28年》: the music grid and the timed lines (script.md, v2 beat sheet + the 19:04 rework notes), on film time (s).
   Track: DJ remix, 140.8 BPM. Downbeats D(n) = 0.144 + 1.70444·n; beat = 0.42611 s. Cuts land on downbeats, hits on beats.
   Energy: dense from bar 1 to bar 45 (kick on every beat); the break is bars 45–49 (no kick from 46, a dip in 49); drops at 50 and 83.
   On-screen wording follows facts.md ✓ rows. [ ] = key word (cream with the gold underline). Rows ≤ 16 字.
   This file covers part 1 (bars 0–50); part 2 (bars 50–95) is the other builder's (src/qq59sb, played by EP59FULL from bar 50). */
export const FPS = 30;
export const BAR = 1.70444, BEAT = BAR / 4, D0 = 0.144;
/** downbeat of bar n */
export const D = (n: number) => D0 + BAR * n;
/** bar n, beat b (0-based, may be fractional) */
export const BT = (n: number, b = 0) => D(n) + b * BEAT;
export const fr = (t: number) => Math.round(t * FPS);

/** a subtitle row: text with [key] markup; `at` = when it starts typing; `chunks` = [chars visible, time] steps (typing in beats) */
export type Row59 = {s: string; at: number; chunks?: [number, number][]};
/** a line = what is on screen between a and b: stacked rows (layout D), or a centred punch, or the title */
export type Line59 = {bar: number; a: number; b: number; rows: Row59[]; punch?: boolean; title?: boolean; note?: string; out?: number};

export const LINES59: Line59[] = [
	{bar: 0, a: 0, b: D(2), rows: [{s: '28年后，他走到[妈妈家门口]。', at: 0}], note: 'over the real photo, then the drawn street'},
	{bar: 2, a: D(2), b: D(3), rows: [{s: '妈妈的第一句话是——', at: D(2)}]},
	{bar: 3, a: D(3), b: D(5), rows: [{s: '「你去哪儿了？」', at: D(3)}], punch: true, out: 7.82, note: 'fades before the crane rises (the hard hold, then the rise)'},
	{bar: 5, a: D(5), b: D(7), rows: [{s: '这一趟，他走了[约5万公里]。', at: D(5)}]},
	{bar: 7, a: D(7), b: D(9), rows: [], title: true},
	{bar: 9, a: D(9), b: D(10), rows: [{s: '[1998年]，智利最南端。', at: D(9)}]},
	{bar: 10, a: D(10), b: D(12), rows: [{s: '29岁的英国退伍伞兵卡尔，', at: D(10)}, {s: '[出发了]。', at: BT(10, 3)}], note: 'row 2 lands with his first step'},
	{bar: 12, a: D(12), b: D(14), rows: [{s: '目标：一路走回[英国老家]。', at: D(12)}]},
	{bar: 14, a: D(14), b: D(16), rows: [{s: '规矩只有两条：', at: D(14)}, {s: '不坐任何[机动交通工具]，', at: D(15)}]},
	{bar: 16, a: D(16), b: D(17), rows: [{s: '不走到家，[不回家]。', at: D(16)}]},
	{bar: 17, a: D(17), b: D(19), rows: [{s: '行李：[一顶帐篷]、[几百美元]、', at: D(17), chunks: [[3, D(17)], [8, BT(17, 1)], [13, BT(17, 2)]]}, {s: '一台[塑料相机]。', at: D(18)}],
		note: 'each item types in with its pop'},
	{bar: 19, a: D(19), b: D(21), rows: [{s: '他原以为，[十来年]就能到家。', at: D(19)}]},
	{bar: 21, a: D(21), b: D(22), rows: [{s: '先往北，穿过[达连隘口]：', at: D(21)}], note: 'the chase north along the Andes, the dive into the canopy'},
	{bar: 22, a: D(22), b: D(24), rows: [{s: '先往北，穿过[达连隘口]：', at: D(21)}, {s: '没有路，只有沼泽和丛林。', at: D(22)}]},
	{bar: 24, a: D(24), b: D(26), rows: [{s: '出了丛林，', at: D(24)}, {s: '他在巴拿马坐了[18天]牢。', at: BT(24, 2)}]},
	{bar: 26, a: D(26), b: D(28), rows: [{s: '再一路向北：', at: D(26)}, {s: '[美国]、[加拿大]、[阿拉斯加]。', at: D(27) + 0.05, chunks: [[3, D(27) + 0.05], [7, BT(27, 1.5)], [12, BT(27, 2.9)]]}],
		note: 'the photo on bar 26; the three names type as the gold head passes them'},
	{bar: 28, a: D(28), b: D(30), rows: [{s: '[2006年]，', at: D(28)}, {s: '他走到了美洲的尽头。', at: BT(28, 2)}]},
	{bar: 30, a: D(30), b: D(32), rows: [{s: '海面结了冰，', at: D(30)}, {s: '他就[踩着冰]过海。', at: D(31)}]},
	{bar: 32, a: D(32), b: D(34), rows: [{s: '走了[约两周]，走到了亚洲。', at: D(32)}]},
	{bar: 34, a: D(34), b: D(36), rows: [{s: '一上岸，就被俄罗斯边防扣下。', at: D(34)}]},
	{bar: 36, a: D(36), b: D(38), rows: [{s: '签证：每180天，', at: D(36)}, {s: '只能待[90天]。', at: BT(36, 2)}]},
	{bar: 38, a: D(38), b: D(40), rows: [{s: '2008年，[赞助商]全撤了。', at: D(38)}]},
	{bar: 40, a: D(40), b: D(42), rows: [{s: '2012年，俄罗斯[拒签]。', at: D(40)}]},
	{bar: 42, a: D(42), b: D(44), rows: [{s: '2012年，俄罗斯[拒签]。', at: D(40)}, {s: '他没有回家。', at: D(42)}]},
	{bar: 44, a: D(44), b: D(48), rows: [{s: '他在美国，一个人', at: D(44)}, {s: '走了[约5000公里]——', at: D(45)}], note: 'the break: one long take, the counter rolls to 5,000'},
	{bar: 48, a: D(48), b: D(50), rows: [{s: '走了[约5000公里]——', at: D(45)}, {s: '走到[俄罗斯大使馆]门口——', at: D(48)}], note: 'the build: one step per beat'},
];
/** part 1 ends on the bar-50 drop; EP59FULL hands over to part 2 there */
export const PART2_AT = D(50);
/** the demo (EP59DEMO) still ends on the bar-21 downbeat */
export const DEMO_END = D(21);
/** the whole film: the end card runs bars 91–95 */
export const FULL_END = D(95);

/** top-right stamp: [from, to, year, place, note (≤ 10 字)]; changes on the cut that starts its line */
export type Stamp59 = {a: number; b: number; y: string; place: string; note: string};
export const STAMPS59: Stamp59[] = [
	{a: 0, b: D(5), y: '2026', place: '英国 赫尔', note: '11月2日 妈妈家门口'},
	{a: D(5), b: D(7), y: '1998 → 2026', place: '智利 → 英国', note: '途经约30个国家'},
	{a: D(9), b: D(12), y: '1998', place: '智利 蓬塔阿雷纳斯', note: '11月1日 出发'},
	{a: D(12), b: D(14), y: '1998', place: '智利 → 英国', note: '终点：赫尔，妈妈家'},
	{a: D(14), b: D(16), y: '1998', place: '智利 巴塔哥尼亚', note: '据他本人的网站'},
	{a: D(16), b: D(17), y: '1998', place: '英国 赫尔', note: '妈妈家'},
	{a: D(17), b: D(19), y: '1998', place: '智利 蓬塔阿雷纳斯', note: '出发时的行李'},
	{a: D(19), b: D(20) + 0.6, y: '1998', place: '智利 巴塔哥尼亚', note: '他当时的估计'},
	{a: D(21), b: D(24), y: '2000–01', place: '达连隘口', note: '南北美洲之间，没有路'},
	{a: D(24), b: D(26), y: '2001', place: '巴拿马', note: '关了18天'},
	{a: D(26), b: D(28), y: '2001 → 2006', place: '美洲', note: '一路向北，到阿拉斯加'},
	{a: D(28), b: D(30), y: '2006', place: '美国 阿拉斯加', note: '美洲的尽头：白令海峡'},
	{a: D(30), b: D(32), y: '2006.3', place: '白令海峡', note: '和同伴一起，踩着海冰'},
	{a: D(32), b: D(34), y: '2006.3', place: '白令海峡', note: '直线约90公里'},
	{a: D(34), b: D(36), y: '2006.4', place: '俄罗斯 楚科奇', note: '护照上没有入境章'},
	{a: D(36), b: D(38), y: '2006 →', place: '俄罗斯', note: '回来时，从原地接着走'},
	{a: D(38), b: D(40), y: '2008', place: '金融危机', note: '赞助商撤资，停了约两年'},
	{a: D(40), b: D(44), y: '2012', place: '俄罗斯', note: '签证被拒'},
	{a: D(44), b: D(48), y: '2012', place: '美国', note: '洛杉矶 → 华盛顿'},
	{a: D(48), b: D(50), y: '2012', place: '美国 华盛顿', note: '俄罗斯大使馆门口'},
];
/* bottom-left counter 「第 N 年 · 他 N 岁」, driven by a date (fractional year): N = ⌊date − 1998.83⌋ + 1, age = ⌊date − 1969.2⌋ (born March 1969).
   Keys [time, date]: between keys with `roll` the date moves (the digits roll); otherwise it holds. EP59.tsx drives the title's rewind
   from the picture (demo59 comet/dateAt) so the numbers follow the light along the route. */
export type DKey = {t: number; date: number; roll?: boolean};
export const DATES59: DKey[] = [
	{t: 0, date: 2026.79},
	{t: D(7), date: 2026.79},                       // the title: the rewind (EP59.tsx, from the comet)
	{t: D(9) - 0.05, date: 1998.84},
	{t: D(20) + 0.6, date: 1998.95},
	{t: D(21), date: 2001.12, roll: true},          // the chase north: 1998 → the Darién, 2001
	{t: D(26) + 0.2, date: 2001.15},
	{t: D(28) - 0.1, date: 2006.2, roll: true},     // up through the Americas to Alaska
	{t: D(36) + 0.1, date: 2006.3},
	{t: D(38) - 0.1, date: 2008.3, roll: true},     // the visa years
	{t: D(40) - 0.35, date: 2008.6},
	{t: D(40) + 0.15, date: 2012.4, roll: true},    // 2008 → 2012
	{t: D(50), date: 2012.5},
];
export const yearN = (date: number) => Math.floor(date - 1998.83 + 1e-6) + 1;
export const ageAt = (date: number) => Math.floor(date - 1969.2 + 1e-6);
