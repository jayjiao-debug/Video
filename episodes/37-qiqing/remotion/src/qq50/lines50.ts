/* ep50 timeline: subtitles from 50-qian/lines_read.json (film seconds; subtitle-only), stamps and counters from script.md v3
   (〃 resolved). Generated; edit lines_read.json + the tables in the generator, not by hand.
   q = classical (Q) line: period face + a {gloss} row shown with it. c = centred (C1, the Q lines, the end-card question).
   The last line (120.5–126.5) is the end-card question: drawn by the end card (PartB), not by the subtitle layer. */
export type Stamp50 = {y: string; place: string; note: string};
export type Line50 = {a: number; b: number; s: string; q: boolean; c: boolean; st: Stamp50 | null; ct: {era: string; year: string} | null};
export const FILM_END = 127.0, FPS50 = 30, CARD_T = 120.5, TITLE_T: [number, number] = [9.25, 12.25];
export const LINES50: Line50[] = [
	{a: 0.0, b: 3.0, s: "财、货、贵，都带个“贝”，\n偏偏“钱”，是[金]字旁。", q: false, c: false, st: null, ct: {era: "", year: "2026"}},
	{a: 3.0, b: 6.5, s: "你扫码付的钱，\n倒回一千年，只是一张[纸]。", q: false, c: false, st: {y: "1024", place: "成都", note: "官府开始发行交子"}, ct: {era: "", year: "1024"}},
	{a: 6.5, b: 9.25, s: "倒回三千多年，钱是一枚贝壳。", q: false, c: false, st: {y: "商代晚期", place: "殷", note: "拿海贝当钱"}, ct: {era: "", year: "约前1300"}},
	{a: 12.25, b: 14.75, s: "贝壳从很远的海边运来，", q: false, c: false, st: {y: "商代晚期", place: "殷", note: "贝来自远方海边"}, ct: {era: "", year: "约前1300"}},
	{a: 14.75, b: 16.75, s: "稀少、结实，又好带。", q: false, c: false, st: {y: "商代晚期", place: "殷", note: "贝来自远方海边"}, ct: {era: "", year: "约前1300"}},
	{a: 16.75, b: 19.5, s: "商代晚期，还有了青铜铸的贝。", q: false, c: false, st: {y: "商代晚期", place: "殷", note: "铜铸的仿贝"}, ct: {era: "", year: "约前1300"}},
	{a: 19.5, b: 22.0, s: "那“钱”，为什么是金字旁？", q: false, c: true, st: null, ct: {era: "", year: "约前1300"}},
	{a: 23.5, b: 27.25, s: "钱，铫也，古田器也。\n{钱，是一种古代农具}", q: true, c: true, st: {y: "《说文解字》", place: "", note: "据《太平御览》引"}, ct: {era: "商周", year: ""}},
	{a: 27.25, b: 29.5, s: "原来，“钱”是一把[铲子]。", q: false, c: false, st: {y: "商周", place: "田间", note: "国博：铲子叫“钱”"}, ct: {era: "商周", year: ""}},
	{a: 29.5, b: 32.25, s: "东周时，人们照着铲子铸铜币，", q: false, c: false, st: {y: "东周", place: "中原", note: "铲形货币：布币"}, ct: {era: "东周", year: ""}},
	{a: 32.25, b: 34.25, s: "名字也跟着叫“钱”。", q: false, c: false, st: {y: "东周", place: "中原", note: "国博：也叫“钱”"}, ct: {era: "东周", year: ""}},
	{a: 34.25, b: 37.0, s: "战国各国的钱，\n有刀、铲、圆、贝。", q: false, c: false, st: {y: "战国", place: "", note: "各国钱不一样"}, ct: {era: "战国", year: ""}},
	{a: 37.0, b: 39.5, s: "秦统一六国，也统一了钱。", q: false, c: false, st: {y: "秦统一六国后", place: "", note: "以半两统一货币"}, ct: {era: "", year: "前221"}},
	{a: 39.5, b: 42.25, s: "钱上写着“半两”，\n就得重[半两]。", q: false, c: false, st: {y: "秦统一六国后", place: "", note: "《史记》：重如其文"}, ct: {era: "", year: "前221"}},
	{a: 42.25, b: 45.0, s: "汉朝的“五铢”，名字也是重量，", q: false, c: false, st: {y: "前118年", place: "西汉", note: "汉武帝始铸五铢"}, ct: {era: "", year: "前118"}},
	{a: 45.0, b: 47.75, s: "一用七百多年，从汉用到唐。", q: false, c: false, st: {y: "前118年", place: "西汉", note: "七百多年"}, ct: {era: "唐", year: "621"}},
	{a: 47.75, b: 52.25, s: "废五铢钱，行开元通宝钱。\n{不用五铢了，改用开元通宝}", q: true, c: true, st: {y: "621年", place: "唐", note: "《旧唐书》武德四年"}, ct: {era: "唐", year: "621"}},
	{a: 52.25, b: 54.75, s: "新钱的名字，不再是[重量]。", q: false, c: false, st: {y: "621年", place: "唐", note: "据《人民周刊》：更靠信用"}, ct: {era: "唐", year: "621"}},
	{a: 54.75, b: 57.25, s: "北宋的四川，用的是铁钱。", q: false, c: false, st: {y: "北宋", place: "四川", note: "蜀地用铁钱"}, ct: {era: "北宋", year: ""}},
	{a: 57.25, b: 60.0, s: "一串一千文，\n重[二十五斤八两]。", q: false, c: false, st: {y: "北宋初", place: "嘉州、邛州", note: "《宋史》：早期标准"}, ct: {era: "北宋", year: ""}},
	{a: 60.0, b: 64.75, s: "患蜀人铁钱重，不便贸易。\n{四川的铁钱太重，买卖不方便}", q: true, c: true, st: {y: "北宋", place: "四川", note: "《宋史·食货志》"}, ct: {era: "北宋", year: ""}},
	{a: 64.75, b: 67.5, s: "川蜀铁钱十枚，才抵一枚铜钱。", q: false, c: false, st: {y: "北宋", place: "四川", note: "《宋史》：铁钱十直铜钱一"}, ct: {era: "北宋", year: ""}},
	{a: 67.5, b: 69.5, s: "于是有了[交子]：", q: false, c: false, st: {y: "北宋", place: "四川", note: "一交一缗"}, ct: {era: "北宋", year: ""}},
	{a: 69.5, b: 71.75, s: "一张纸，能换一千文。", q: false, c: false, st: {y: "北宋", place: "四川", note: "一交一缗"}, ct: {era: "北宋", year: ""}},
	{a: 71.75, b: 74.25, s: "起初，16家富户发交子，", q: false, c: false, st: {y: "北宋初", place: "益州", note: "富民十六户主之"}, ct: {era: "北宋", year: ""}},
	{a: 74.25, b: 76.75, s: "后来[换不回钱]，官司不断。", q: false, c: false, st: {y: "北宋初", place: "益州", note: "不能偿所负"}, ct: {era: "北宋", year: ""}},
	{a: 76.75, b: 79.0, s: "1024年，官府接手交子。", q: false, c: false, st: {y: "1024", place: "成都", note: "益州交子务"}, ct: {era: "", year: "1024"}},
	{a: 79.0, b: 81.75, s: "它是世界上最早的[纸币之一]。", q: false, c: false, st: {y: "1024", place: "成都", note: "据光明日报"}, ct: {era: "", year: "1024"}},
	{a: 81.75, b: 84.5, s: "红黑套印，暗藏编号，\n防人伪造。", q: false, c: false, st: {y: "1024", place: "成都", note: "《楮币谱》：朱墨间错"}, ct: {era: "", year: "1024"}},
	{a: 84.5, b: 86.5, s: "明初，官府印[宝钞]：", q: false, c: false, st: {y: "明初", place: "洪武年间", note: "官府发行宝钞"}, ct: {era: "明初", year: ""}},
	{a: 86.5, b: 89.25, s: "一贯，等于一千文，等于一两银。", q: false, c: false, st: {y: "明初", place: "洪武年间", note: "《明史·食货志》"}, ct: {era: "明初", year: ""}},
	{a: 89.25, b: 92.0, s: "可官府印得[太多]，又收不回来。", q: false, c: false, st: {y: "永乐年间", place: "陈瑛奏", note: "出钞太多，收敛无法"}, ct: {era: "明", year: ""}},
	{a: 92.0, b: 96.5, s: "钞一贯不能直钱一文。\n{那时，一贯钞连一文钱都不值}", q: true, c: true, st: {y: "明", place: "《明史·食货志》", note: "一贯不值一文"}, ct: {era: "明", year: ""}},
	{a: 98.5, b: 101.25, s: "纸不灵了，明朝人改用[白银]。", q: false, c: false, st: {y: "明中晚期", place: "", note: "白银成了钱"}, ct: {era: "明中晚期", year: ""}},
	{a: 101.25, b: 103.25, s: "白银每次都要称，", q: false, c: false, st: {y: "明中晚期", place: "", note: "银锭刻地名、匠名、重量"}, ct: {era: "明中晚期", year: ""}},
	{a: 103.25, b: 105.5, s: "钱又回到了看重量。", q: false, c: false, st: {y: "明中晚期", place: "", note: "银锭刻地名、匠名、重量"}, ct: {era: "明中晚期", year: ""}},
	{a: 105.5, b: 107.5, s: "1948年，人民币来了。", q: false, c: false, st: {y: "1948.12.01", place: "石家庄", note: "人民银行成立"}, ct: {era: "", year: "1948"}},
	{a: 107.5, b: 110.0, s: "如今，[10.17亿]人用网络支付。", q: false, c: false, st: {y: "2025年12月", place: "中国", note: "占网民90.3%"}, ct: {era: "", year: "2025"}},
	{a: 110.0, b: 111.75, s: "钱越变越轻：", q: false, c: false, st: {y: "2026", place: "今天", note: "本片归纳"}, ct: {era: "", year: "2026"}},
	{a: 111.75, b: 114.5, s: "贝壳、铜、纸，最后是一串数字。", q: false, c: false, st: {y: "2026", place: "今天", note: "本片归纳"}, ct: {era: "", year: "2026"}},
	{a: 114.5, b: 117.0, s: "纸和数字本身不值钱，", q: false, c: false, st: {y: "2026", place: "今天", note: "本片归纳"}, ct: {era: "", year: "2026"}},
	{a: 117.0, b: 119.5, s: "值钱的是，大家都[信]它。", q: false, c: false, st: {y: "2026", place: "今天", note: "本片归纳"}, ct: {era: "", year: "2026"}},
	{a: 120.5, b: 126.5, s: "你上一次用[纸币]，是什么时候？", q: false, c: false, st: null, ct: null},
];
/** index of the line on screen at t (−1 = none) */
export const lineAt = (t: number) => LINES50.findIndex((l) => t >= l.a && t < l.b);
/** the last line that has started by t (stamps and counters hold through gaps) */
export const lastLine = (t: number) => { let k = -1; for (let i = 0; i < LINES50.length; i++) if (LINES50[i].a <= t) k = i; return k; };
