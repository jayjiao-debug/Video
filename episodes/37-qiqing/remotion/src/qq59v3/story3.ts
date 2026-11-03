/* ep59 v3: the story timeline (episodes/59-bushby/script_v3.md, draft 2) and its layout on a music track.

   The film is built ONCE and rendered against two tracks (owner 21:27: "try my non-DJ music, I want to see which fits"):
   - 'dj'   : 《把回忆拼好给你》 DJ version (public/ep59/song.wav), 140.81 BPM, downbeats 0.144 + 1.70444·n;
   - 'orig' : the original version (public/ep59/orig.wav) — grid filled in when the owner sends it.
   Each scene has a NOMINAL length in seconds. layout(track) stretches the scenes between the track's musical anchors (the drops,
   the near-silence) and snaps every cut to the nearest downbeat (half-bar if closer), so a scene's real length `dur` differs a
   little per track (within ~0.85–1.2× nominal). Scenes must therefore animate from (t, dur) and put their hits on `g.beat`
   multiples, never on absolute film times.

   Lines: `at` = seconds after the scene starts (snapped to the nearest beat at render time). [key] = cream with the gold underline
   (≈ 1 line in 3). Rows ≤ 16 字. Every line is a ✓ row of facts.md (numbers in script_v3.md). */

export const FPS = 30;

export type Track = {
	id: 'dj' | 'orig';
	file: string;          // in public/ (never committed)
	beat: number;          // seconds per beat
	d0: number;            // time of the first downbeat (bar 0)
	gain: number;          // dB to reach −14 LUFS
	anchors: Partial<Record<Anchor, number>>;   // anchor → bar number
	endFade?: number;      // seconds of fade at the end
};
export type Anchor = 'title' | 'drop1' | 'quiet' | 'drop2';

export const TRACKS: Record<'dj' | 'orig', Track> = {
	dj: {id: 'dj', file: 'ep59/song.wav', beat: 0.42611, d0: 0.144, gain: -4.5, anchors: {drop1: 50, quiet: 74, drop2: 83}, endFade: 2.5},
	orig: {id: 'orig', file: 'ep59/orig.wav', beat: 0.5, d0: 0, gain: 0, anchors: {}, endFade: 2.5},   // TODO: fill from the owner's file
};
export const barOf = (tr: Track) => tr.beat * 4;
export const downbeat = (tr: Track, n: number) => tr.d0 + barOf(tr) * n;
/** snap a time to the nearest beat of the track */
export const snapBeat = (tr: Track, t: number) => tr.d0 + Math.round((t - tr.d0) / tr.beat) * tr.beat;

export type Row = {s: string; at: number};
export type Scene = {
	id: string;
	nominal: number;               // seconds
	anchor?: Anchor;               // this scene STARTS on that musical anchor
	rows: Row[];                   // subtitle rows (layout D, stacked); [] = none
	punch?: boolean;               // a centred line (questions, the big quotes)
	voice?: string;                // a clip of Karl's real voice (public/ep59/voice/<id>.wav), placed by the master
	photo?: string;                // key of PH3 shown as a Print3 in this scene (position chosen by the scene)
	date?: number | [number, number];   // decimal year for the counter (or a roll from → to across the scene)
	stamp?: [string, string];      // top-right stamp: 「年份 · 国家 城市」, note ≤ 10 字
	note: string;                  // what the picture does (the scene's brief)
};

export const SCENES: Scene[] = [
	{id: 'print', nominal: 7, rows: [{s: '他叫[卡尔·布什比]。', at: 0.3}, {s: '他用了28年，走了[约5万公里]，', at: 2.4}, {s: '只为了走回家。', at: 4.9}], photo: 'nowFace', date: 2026.84,
		stamp: ['2026 · 英国 赫尔', '11月2日'], note: 'dark field; his 2026 print tosses in left of centre (~40 % of the frame), slow push; a gold km counter 0 → 50,000 under the lines'},
	{id: 'door', nominal: 4.5, rows: [{s: '2026年11月2日，', at: 0}, {s: '他走到了[妈妈面前]。', at: 1.6}], date: 2026.84,
		note: 'the print slides off; the drawn Hull street at dawn; the door opens; his mum in the warm light; they face each other'},
	{id: 'title', nominal: 5, rows: [], date: [2026.84, 1998.84], note: 'crane up through cloud to the globe; the route lights from Hull back to Chile; the title holds ≥ 2.5 s; the counter rolls back'},
	{id: 'patagonia', nominal: 4.5, rows: [{s: '[1998年]，29岁的退伍伞兵，', at: 0}, {s: '从南美洲最南边出发。', at: 1.8}], photo: 'young1998', date: 1998.84,
		stamp: ['1998 · 智利 蓬塔阿雷纳斯', '11月1日 出发'], note: 'a gale: he and the hi-vis cart lean at 45°, grass and dust streaming (row 73)'},
	{id: 'rules', nominal: 4, rows: [{s: '两条规矩：不坐任何交通工具；', at: 0}, {s: '走不到家，[就不回家]。', at: 1.9}], date: 1998.9,
		note: 'a bus pulls up beside him, its door opens; he waves it on and walks'},
	{id: 'plain', nominal: 2.5, rows: [{s: '他以为，十来年就能到家。', at: 0}], date: 1999.5, note: 'sunset; tiny on a vast plain'},
	{id: 'darien', nominal: 4.5, rows: [{s: '第一关：[达连隘口]。', at: 0}, {s: '进去之前，爸爸让他先立了遗嘱。', at: 1.5}], date: 2001.05,
		stamp: ['2001 · 哥伦比亚 / 巴拿马', '达连隘口'], note: 'the jungle wall at dusk; the will signed on his pack lid; he steps in'},
	{id: 'jungle', nominal: 5, rows: [{s: '没有路，只有沼泽、鳄鱼和游击队。', at: 0}, {s: '他扮成漂在水上的杂物，顺河漂过去。', at: 2.3}], photo: 'jungle', date: 2001.08,
		note: 'jungle wade + machete; then a black river among mangroves, only his head among drifting branches; crocodile eyes on the surface'},
	{id: 'journal', nominal: 3.5, rows: [{s: '他在日记里写：', at: 0}, {s: '「今天可能是我[生命的最后一天]。」', at: 1.0}], date: 2001.08,
		note: 'night, a headlamp on a journal page'},
	{id: 'jail', nominal: 4, rows: [{s: '走出丛林，迎接他的是[枪口]，', at: 0}, {s: '在巴拿马被关了[18天]。', at: 1.8}], date: 2001.13,
		note: 'out of the trees into torchlight and rifles (threat only); bar shadows close; tally marks on the beats'},
	{id: 'bowl', nominal: 3, rows: [{s: '狱友把大碗让给他：', at: 0}, {s: '「你比我更需要。」', at: 1.2}], date: 2001.14, note: 'the crowded cell; a cellmate slides his bigger bowl across'},
	{id: 'alaska', nominal: 3.5, rows: [{s: '阿拉斯加，[零下51度]，', at: 0}, {s: '他瘦了约18公斤。', at: 1.5}], photo: 'americas', date: 2004.97,
		stamp: ['2004 · 美国 阿拉斯加', '零下51度'], note: 'blue night, a thermometer, his breath freezing'},
	{id: 'ice', nominal: 4, rows: [{s: '2006年3月，海面结了冰，', at: 0}, {s: '他[踩着冰]，走向亚洲。', at: 1.7}], photo: 'beringIce', date: 2006.2,
		stamp: ['2006 · 白令海峡', '和 Dimitri 一起'], note: 'the Bering sea ice (kit3 ice); Karl + Dimitri hauling sleds; vast'},
	{id: 'bear', nominal: 3.5, rows: [{s: '冰上，遇到过北极熊。', at: 0}], voice: 'V4', date: 2006.21,
		note: 'low sun; a polar bear far off on a ridge; they stop. His voice: "Polar bear dream, but a human nightmare." (subtitle: 北极熊的天堂，/ 人类的噩梦。)'},
	{id: 'tent', nominal: 2.5, rows: [{s: '半夜，帐篷底下的冰[裂开了]。', at: 0}], date: 2006.21, note: 'night; a crack runs under the tent; they scramble out with headlamps'},
	{id: 'lead', nominal: 3, rows: [{s: '冰缝太宽，', at: 0}, {s: '就穿着防水服游过去。', at: 1.0}], photo: 'beringDusk', date: 2006.22,
		note: 'a wide lead of black water; they swim across in dry suits, towing the sleds'},
	{id: 'drift', nominal: 2.5, rows: [{s: '洋流把他们往北拖了约80公里——', at: 0}], date: 2006.22, note: 'top shot: the floe field drifting north, their line bending'},
	{id: 'freeze', nominal: 5, rows: [{s: '直到气温骤降到零下35度，', at: 0}, {s: '烂冰冻成了[一条路]。', at: 1.6}, {s: '「像看着摩西分开红海。」', at: 3.1}], date: 2006.23,
		note: 'the wind drops; frost races across the slush; a road of ice opens ahead in low gold light'},
	{id: 'strait', nominal: 2.5, rows: [{s: '走了约两周，他走到了[亚洲]。', at: 0}], date: 2006.24, note: 'pull up: two dots cross the white strait from 美洲 to 亚洲 (labels only, no borders)'},
	{id: 'arrest', nominal: 3.5, rows: [{s: '一上岸，就被俄罗斯边防扣下，', at: 0}, {s: '关了近两个月。', at: 1.8}], date: 2006.25,
		note: 'night shore, a searchlight, two guards walk in; hands raised; a door shuts. CLEAR, no passport'},
	{id: 'stops', nominal: 5, rows: [{s: '接下来十几年，', at: 0}, {s: '签证、禁令、金融危机、疫情……', at: 1.2}, {s: '他一次次[被迫停下]。', at: 3.0}], date: [2006.3, 2016.0],
		note: 'one clear montage: the cart at a stake under falling snow; seasons cycle on the beats; the counter rolls; signs pass: 签证 ✕ · 禁止入境 ✕ · 2008 金融危机 · 疫情'},
	{id: 'resume', nominal: 3, anchor: 'drop1', rows: [{s: '但每次回来，都从停下的地方[接着走]。', at: 0}], date: 2016.0,
		note: 'spring: he walks back into frame to the same stake, pulls it, and walks on — the DROP lands as he steps off'},
	{id: 'siberia', nominal: 4, rows: [{s: '在俄罗斯，他只在冬天走：', at: 0}, {s: '河冻住了，[才有路]。', at: 1.7}], photo: 'frostFace', date: 2016.1,
		stamp: ['俄罗斯 远东', '只在冬天走'], note: 'Siberian winter road (kit3 Siberia), ice fog, a frozen river'},
	{id: 'gobi', nominal: 4, rows: [{s: '2017年，[10峰骆驼]，', at: 0}, {s: '走了一千多公里戈壁。', at: 1.5}], date: 2017.8,
		stamp: ['2017 · 蒙古 戈壁', '驼队'], note: 'the Gobi at sunset (kit3 Gobi), the caravan, long shadows'},
	{id: 'border', nominal: 3.5, rows: [{s: '伊朗进不去，疫情又来了，', at: 0}, {s: '陆路走不通。', at: 1.6}], date: 2020.2,
		note: 'a closed border gate at dusk; then an empty road; he reaches a grey shore'},
	{id: 'sea', nominal: 2, rows: [{s: '那就[游过去]。', at: 0}], punch: true, date: 2024.4, note: 'close on him looking at the sea'},
	{id: 'noswim', nominal: 3.5, rows: [{s: '可他不会游泳：', at: 0}, {s: '「我根本不会游泳，也不喜欢游泳。」', at: 1.2}], date: 2024.4, note: 'he looks down at the water'},
	{id: 'caspian', nominal: 3.5, rows: [{s: '2024年，穿着救生衣，', at: 0}, {s: '一半漂，一半游，', at: 1.5}], photo: 'caspian', date: 2024.6,
		stamp: ['2024 · 里海', '哈萨克斯坦 → 阿塞拜疆'], note: 'Caspian dawn (kit3 Caspian): swim front crawl, then float; the support boat behind'},
	{id: 'boat', nominal: 3.5, rows: [{s: '每天上午游3小时，下午3小时，', at: 0}, {s: '晚上睡在船上。', at: 1.8}], date: 2024.65, note: 'rough sea at night, the boat rocking, him wrapped up aboard'},
	{id: 'caspianShore', nominal: 3, rows: [{s: '31天，近300公里，他游过了[里海]。', at: 0}], date: 2024.7, note: 'dawn again, the far shore; he wades out'},
	{id: 'bosphorus', nominal: 3, rows: [{s: '2025年，他走过博斯普鲁斯大桥，', at: 0}, {s: '进入[欧洲]。', at: 1.6}], photo: 'bosphorus', date: 2025.33,
		stamp: ['2025 · 土耳其 伊斯坦布尔', '徒步过桥'], note: 'the bridge at dawn, closed to walkers, him alone on it'},
	{id: 'channel', nominal: 5, rows: [{s: '海底隧道不让走，', at: 0}, {s: '他就游过[英吉利海峡]：', at: 1.2}, {s: '3天，泡在水里约20小时。', at: 2.8}], photo: 'swimDawn', date: 2026.75,
		stamp: ['2026 · 英吉利海峡', '法国 → 英国'], note: 'a tunnel mouth with a red ✕; cut to the Channel at dawn, the swim'},
	{id: 'dover', nominal: 4, rows: [], voice: 'V3', photo: 'dover', date: 2026.76,
		note: 'white cliffs, Shakespeare Beach; he wades onto the shingle. His voice: "Feels good to have UK soil under my feet after all these years." (subtitle: 这么多年了，/ 终于又踩在英国的土地上。)'},
	{id: 'humber', nominal: 4.5, anchor: 'quiet', rows: [{s: '11月1日，大雾，亨伯桥。', at: 0}, {s: '桥两边，[站满了人]。', at: 1.6}], date: 2026.83,
		stamp: ['2026 · 英国 亨伯桥', '11月1日'], note: 'Humber Bridge in thick fog (kit3 Humber), crowds lining both sides, phones up'},
	{id: 'street', nominal: 3, rows: [{s: '门口挂着：[欢迎回家，儿子]。', at: 0}], date: 2026.84, stamp: ['2026 · 英国 赫尔', '11月2日'], note: 'the Hull street, the banner, warm windows, press crowd'},
	{id: 'window', nominal: 2.5, rows: [{s: '妈妈已经[十年]没见过他了。', at: 0}], date: 2026.84, note: 'mum at the window'},
	{id: 'son', nominal: 4, rows: [{s: '他走时，儿子8岁；', at: 0}, {s: '如今，儿子[36岁]。', at: 1.5}], photo: 'young1998+nowFace', date: 2026.84,
		note: 'two small prints side by side: Karl 1998 / Karl 2026'},
	{id: 'door2', nominal: 4, anchor: 'drop2', rows: [{s: '她的第一句话是：', at: 0}, {s: '「你去哪儿了？」', at: 1.3}], date: 2026.84,
		note: 'the door opens on the DROP; light spills; they face each other'},
	{id: 'hug', nominal: 3.5, rows: [{s: '她抱着他，[哭了]。', at: 0}], photo: 'hug', date: 2026.84, note: 'the drawn hug, then the real hug photo as a large print'},
	{id: 'world', nominal: 5, rows: [], voice: 'V1', date: 2026.84,
		note: 'over the crowd. His voice: "They say it takes a village but literally it took a world to get me here." (subtitle: 都说养大一个人要一个村子；/ 送我回家的，是整个世界。)'},
	{id: 'totals', nominal: 4, rows: [{s: '约5万公里，约30个国家，', at: 0}, {s: '[10,229天]。', at: 1.6}], date: 2026.84, note: 'pull up to the globe, the whole route lit; counters'},
	{id: 'end', nominal: 6.5, rows: [{s: '你上一次回家，是什么时候？', at: 0}], punch: true, date: 2026.84,
		note: 'the house end card: dim to ~30 %, J stamp, title, the question, pill 「关注 Juno · 一起探索世界」, sources; hold ≥ 5.5 s; fade'},
];

export const SOURCES = '资料：AP · Reuters · BBC · AFP · NPR · Explorersweb · karlbushby.world ｜ 照片/声音：Karl Bushby · Reuters · ITV · NPR · 网络 ｜ 音乐：《把回忆拼好给你》';

/** the voice clips' subtitles (the owner screen-records the clips; the master places the audio) */
export const VOICE: Record<string, {en: string; zh: string[]}> = {
	V4: {en: 'Polar bear dream, but a human nightmare.', zh: ['北极熊的天堂，', '人类的噩梦。']},
	V3: {en: 'Feels good to have UK soil under my feet after all these years.', zh: ['这么多年了，', '终于又踩在英国的土地上。']},
	V1: {en: 'They say it takes a village but literally it took a world to get me here.', zh: ['都说养大一个人要一个村子；', '送我回家的，是整个世界。']},
};

export type Placed = Scene & {a: number; b: number; dur: number};
/** lay the scenes out on a track: anchored scenes start on their anchor's downbeat; the scenes between anchors are stretched to fit,
    then each cut is snapped to the nearest half-bar. The first scene starts at 0. */
export const layout = (tr: Track): Placed[] => {
	const half = barOf(tr) / 2;
	const snap = (t: number) => tr.d0 + Math.round((t - tr.d0) / half) * half;
	// the fixed points: [scene index, time]
	const fixed: [number, number][] = [[0, 0]];
	SCENES.forEach((s, i) => { if (s.anchor && tr.anchors[s.anchor] !== undefined) fixed.push([i, downbeat(tr, tr.anchors[s.anchor]!)]); });
	const starts: number[] = new Array(SCENES.length).fill(0);
	for (let k = 0; k < fixed.length; k++) {
		const [i0, t0] = fixed[k];
		const next = fixed[k + 1];
		if (!next) {   // after the last anchor: nominal lengths
			let t = t0;
			for (let i = i0; i < SCENES.length; i++) { starts[i] = i === i0 ? t0 : snap(t); t += SCENES[i].nominal; }
			break;
		}
		const [i1, t1] = next;
		const nom = SCENES.slice(i0, i1).reduce((s, x) => s + x.nominal, 0);
		const k_ = (t1 - t0) / nom;
		let t = t0;
		for (let i = i0; i < i1; i++) { starts[i] = i === i0 ? t0 : snap(t); t += SCENES[i].nominal * k_; }
	}
	const lastEnd = starts[SCENES.length - 1] + SCENES[SCENES.length - 1].nominal;
	return SCENES.map((s, i) => {
		const a = starts[i], b = i + 1 < SCENES.length ? starts[i + 1] : lastEnd;
		return {...s, a, b, dur: b - a};
	});
};
export const filmEnd = (tr: Track) => { const L = layout(tr); return L[L.length - 1].b; };
