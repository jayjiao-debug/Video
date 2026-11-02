/* ep55 何尊 · script v2 (2026-11-01 night): the ONE source of truth for card times, subtitle rows, stamps and the counter.
   Music: bgm_cut55b.wav = the owner's track with ONE inaudible bar-line join (track bar 21 → 53, 32 bars removed); the
   track's own ending is kept. Film length 181.67 s. Film bar j at BAR(j) = 1.4498 + 2.26415·j.
   Audible landmarks (measured on the file): drop 1 9.03 · join 49.00 · breakdown 73.90 · build 92.02 ·
   last bar 105.60 · SILENCE 108.20 → 109.78 · re-entry 109.78 · HARDEST DROP 118.84 (cut X1 at 118.83 = frame 3565) · outro 164.48 · end card 173.54 · end 181.67. */
export const BAR = (j: number) => 1.4498 + 2.26415 * j;
export const FILM_END = 181.67;
export const LM = {drop1: 9.03, join: 49.0, breakdown: 73.9, build: 92.02, silence: 108.2, reentry: 109.78, hardest: 118.84, outro: 164.48, endcard: 173.54};

export type St2 = {y?: string; place?: string; note: string};
export type Card2 = {
	id: string; t: number; act: string;
	rows?: string[];                 /* top-left subtitle rows; [x] = key word with the underline */
	mode?: 'tl' | 'big' | 'none';    /* big = centred big line (bigY) */
	bigY?: number;
	age?: string; roll?: boolean;    /* counter 「你 N 岁」; omit = no counter */
	st?: St2;                        /* top-right stamp; appears after the subtitle has typed */
};

export const CARDS_V2: Card2[] = [
	/* ---------- hook (intro, quiet) ---------- */
	{id: '1', t: 0.0, act: '1965 废品站：尊被扔上秤，30元', rows: ['最早写着“中国”两个字的国宝，', '曾在废品站里，只值[30块钱]。'], age: '约3000', st: {y: '1965', place: '宝鸡', note: '废品收购站'}},
	{id: '2', t: 5.98, act: '低机位滑过废铜堆，推到饕餮的眼', rows: ['假如说，', '你就是这件国宝。'], age: '约3000'},
	{id: 'T', t: 9.03, act: '标题砸在 drop 1', mode: 'none'},
	/* ---------- act 1: the story inside you (西周) ---------- */
	{id: 'A', t: 15.03, act: '黎明，武王在祭坛前举臂祷告', rows: ['三千多年前，周武王灭了商，', '向上天祷告：'], st: {note: '西周初 · 武王克商'}},
	{id: 'B', t: 19.56, act: '烟里升起金文“宅兹中或”', rows: ['“我要住在这天下的中心，', '从这里，治理万民。”']},
	{id: 'C', t: 24.09, act: '洛邑：夯土筑城，成王车驾入城', rows: ['后来，他的儿子周成王，', '在洛邑建成新都，搬了进去。'], st: {y: '西周', place: '成周', note: '今洛阳一带'}},
	{id: 'D', t: 28.62, act: '京室：一排宗小子跪听训话', rows: ['一天，成王召来年轻的宗族子弟，', '重提武王的那句祷告。'], st: {y: '成王五年', place: '成周', note: '京室训诰'}},
	{id: 'E', t: 33.15, act: '镜头停在一人：何抬头', rows: ['其中一个，', '名叫“何”。']},
	{id: 'F', t: 37.68, act: '贝壳一串串倒进何的手里', rows: ['训完话，成王赏给何——', '贝，[三十朋]。']},
	{id: 'G', t: 42.20, act: '何把贝交给铸工，陶范立在作坊', rows: ['何用这笔赏赐，铸了一件青铜酒器——', '就是你。']},
	{id: 'H', t: 46.73, act: '刻刀在泥芯上刻金文，金字飞进范里', rows: ['他把成王的这番话，铸进你的肚子里：', '12行，122个字。']},
	{id: 'I', t: 51.26, act: '坩埚倾倒，铜水灌进陶范', rows: ['铜水浇进陶范，', '你，在火里出生。'], age: '0', st: {note: '成王五年 · 铸造'}},
	/* ---------- why you look like this ---------- */
	{id: 'J', t: 55.79, act: '敲碎陶范，金色的尊在蒸汽里现身', rows: ['刚出生的你，是金色的。', '那时的人，管青铜叫“[吉金]”。'], age: '0'},
	{id: 'K', t: 60.32, act: '微距滑过兽面：巨眼、卷角伸向镜头', rows: ['你的肚子上，是一张兽面：', '巨眼，粗角，翘出器外。'], age: '0'},
	{id: 'L', t: 64.85, act: '金线描出饕餮的脸：有头无身', rows: ['这张脸，叫“[饕餮]”。', '古书说：它有头，没有身子。'], age: '0'},
	{id: 'M', t: 69.37, act: '升到正上方：圆口套方身，四道扉棱依次亮', rows: ['上圆，下方，四道扉棱——', '古人心中的“[天圆地方]”。'], age: '0'},
	/* ---------- act 2: lost and nearly destroyed ---------- */
	{id: 'N', t: 73.90, act: '延时：尊沉入土层，地面上朝代更替', rows: ['后来，你被埋进了土里。', '一埋，就是三千年。'], age: '1536', roll: true},
	{id: 'O', t: 78.43, act: '1963 雨夜，贾村土崖坍塌', rows: ['1963年，宝鸡贾村，下着雨，', '陈堆家后院的土崖，塌了。'], age: '约3000', st: {y: '1963', place: '宝鸡', note: '贾村'}},
	{id: 'P', t: 82.96, act: '崖面一点亮光，陈堆扒开泥土', rows: ['塌开的崖面上，', '有东西在发亮。'], age: '约3000'},
	{id: 'Q', t: 87.49, act: '农家墙角，粮食倒进尊里', rows: ['他把你挖出来，', '用来装粮食。'], age: '约3000'},
	{id: 'R', t: 92.02, act: '板车拉进废品站', rows: ['两年后，', '你流落到了废品收购站。'], age: '约3000', st: {y: '1965', place: '宝鸡', note: '废品收购站'}},
	{id: 'S', t: 96.54, act: '反打开场：扔上秤，秤杆晃，30元', rows: ['在这里，', '你只是一堆废铜。'], age: '约3000'},
	{id: 'U', t: 101.07, act: '铲废铜进炉，尊离火越来越近', rows: ['再晚一步——'], age: '约3000'},
	{id: 'V', t: 105.60, act: '火光里的眼，一只手伸过来', rows: ['你，就要被销毁了。'], mode: 'big', bigY: 150, age: '约3000'},
	{id: '停', t: 108.20, act: '静音：黑场，炉火一闪', mode: 'none'},
	{id: 'W1', t: 109.78, act: '日光里，专家停步、蹲下、擦去泥', rows: ['就在这时，一位专家，', '看见了你。'], age: '约3000', st: {y: '1965', place: '宝鸡', note: '宝鸡市博物馆'}},
	{id: 'W2', t: 112.40, act: '三十朋贝 ↔ 30元：两个“三十”', rows: ['三千年前，[三十朋]贝，铸成了你；', '三千年后，[三十块钱]，买回了你。'], age: '约3000'},
	/* ---------- act 3: the secret, and how 中国 became a country's name ---------- */
	{id: 'X1', t: 118.83, act: '故宫修复室：台灯一亮，倾尊看口', rows: ['1975年，你被送进北京故宫，', '除锈——'], age: '约3000', st: {y: '1975', place: '北京', note: '故宫除锈'}},
	{id: 'X2', t: 123.72, act: '俯视口内：锈壳一列列剥落', rows: ['锈层下面，', '露出了12行、122个字。'], age: '约3000'},
	{id: 'X3', t: 128.25, act: '“中”“或”点亮，光柱冲出尊口', rows: ['宅兹[中国]。'], mode: 'big', bigY: 150, age: '约3000'},
	{id: 'X4', t: 132.77, act: '沿光柱拉出：整尊锃亮，金文悬在光里', rows: ['这是目前所知，', '“中国”一词最早的文字记载。'], age: '约3000'},
	{id: 'X5', t: 137.30, act: '光柱里的皮影：洛邑盆地，“中”悬在城上', rows: ['那时的“中国”，', '说的是天下的中心：洛阳一带。']},
	{id: 'X6', t: 141.83, act: '光从中心铺开到整个中原', rows: ['后来，它指整个中原，', '和四方的“四夷”相对。']},
	{id: 'X7', t: 146.36, act: '城门换代：汉唐宋元明清，一拍一换', rows: ['两千多年，国号换了又换：', '汉、唐、宋、元、明、清……']},
	{id: 'X8', t: 150.89, act: '旗帜落下，只剩“中國”二字', rows: ['但“中国”，', '一直是它们共同的名字。']},
	{id: 'X9', t: 155.42, act: '尼布楚：两国使团在帐中用印', rows: ['1689年，“中国”作为国名，', '写进了《尼布楚条约》。'], st: {y: '1689', place: '尼布楚', note: '中俄条约'}},
	{id: 'X10', t: 159.95, act: '1909 条例的书页，“中國”一处处亮起', rows: ['1909年，清朝的国籍法正文里，', '没有一个“大清”，全是“[中国]”。']},
	{id: 'Y', t: 164.48, act: '字形飞回尊口：中或 → 中國 → 中国', rows: ['从“天下的中心”，到一个国家的名字，', '这两个字，走了[三千年]。'], age: '约3000'},
	{id: 'Z', t: 169.01, act: '博物院：展柜前人来人往，孩子指着它', rows: ['今天，你在宝鸡青铜器博物院，', '是首批禁止出境展览的文物。'], age: '约3000', st: {y: '今', place: '宝鸡', note: '宝鸡青铜器博物院'}},
	{id: 'END', t: 173.54, act: '片尾卡', mode: 'none'},
];

export const END_CARD = {
	title: ['“中国”两个字，', '最早出现在哪？'],
	question: '你家里，有没有一件被当成破烂的老东西？',
	pill: '关注 Juno · 一起看懂世界',
	sources: '资料：何尊铭文（李守奎释文）· 新华社 2023.7.9 · 人民日报 2024.9.18 · 黄兴涛《光明日报》2018.1.22 · 《吕氏春秋》',
};

export const card2 = (id: string) => CARDS_V2.find((c) => c.id === id)!;
export const nextT2 = (id: string) => { const i = CARDS_V2.findIndex((c) => c.id === id); return CARDS_V2[i + 1]?.t ?? FILM_END; };
export const cardAt2 = (t: number) => [...CARDS_V2].reverse().find((c) => t >= c.t) ?? CARDS_V2[0];
