/* ep59 《他走路回家，走了28年》: the music grid and the timed lines (script.md, v2 beat sheet), on film time (s).
   Track: DJ remix, 140.8 BPM. Downbeats D(n) = 0.144 + 1.70444·n; beat = 0.42611 s. Cuts land on downbeats, hits on beats.
   On-screen wording follows facts.md ✓ rows. [ ] = key word (cream with the gold underline). */
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
	{bar: 0, a: 0, b: D(2), rows: [{s: '28年后，他走到[妈妈家门口]。', at: 0}]},
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
];
/** the demo ends on the bar-21 downbeat (the Darién match cut starts there) */
export const DEMO_END = D(21);

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
	{a: D(19), b: D(21), y: '1998', place: '智利 巴塔哥尼亚', note: '他当时的估计'},
];
/* bottom-left counter: year · 他 N 岁 · 已走 N 公里 (km only while it means something).
   Keys: [time, year, age, km (null = hidden), roll s]. EP59.tsx drives the values from the picture (craneQ / comet / dateAt in demo59)
   so the numbers move exactly with the gold line; these keys document the beats (key 1's time is read for when the km appear). */
export type CKey = {t: number; year: number; age: number; km: number | null; roll: number; approx?: boolean};
export const COUNTER59: CKey[] = [
	{t: 0, year: 2026, age: 57, km: null, roll: 0},
	{t: 10.45, year: 2026, age: 57, km: 0, roll: 0},                              // the km appear when the gold line starts out of Hull
	{t: 10.45, year: 2026, age: 57, km: 50000, roll: 1.55, approx: true},         // … and land on 50,000 as the line ends (demo59 craneQ)
	{t: 12.1, year: 1998, age: 29, km: 0, roll: 2.85, approx: true},              // the rewind light: date/age follow it along the route (demo59 comet, dateAt)
	{t: D(9) - 0.05, year: 1998, age: 29, km: null, roll: 0},
];
