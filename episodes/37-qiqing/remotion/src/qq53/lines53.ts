/* ep53 越王勾践剑 · the 26 lines, verbatim from episodes/53-goujian/lines_read.json (v2, approved 2026-10-29 17:46),
   with the stamp column of script.md. Times are PROVISIONAL: the music retime to bars will grow them a little;
   everything in the key frames and the storyboard is keyed by line ID, not by time. */
export type Stamp53 = {y: string; place?: string; note: string} | null;
export type Line53 = {id: string; a: number; b: number; s: string; q?: boolean; st: Stamp53};
export const LINES53: Line53[] = [
	{id: 'H1', a: 0.0, b: 5.25, s: '你家菜刀，沾水不擦就会锈。\n这把剑埋了两千多年，还是[亮]的。', st: {y: '2026', place: '你家厨房', note: '一把普通的菜刀'}},
	{id: 'H2', a: 5.25, b: 8.5, s: '主人，是卧薪尝胆的越王勾践。', st: {y: '春秋末年', place: '越', note: '长55.6厘米 · 重875克'}},
	{id: 'S1', a: 10.5, b: 14.75, s: '如今它在湖北省博物馆，\n有一间自己的独立展厅。', st: {y: '2026', place: '湖北省博物馆', note: '南馆二楼 独立展厅'}},
	{id: 'S3', a: 14.75, b: 19.25, s: '有一种流传很广的说法：\n它表面[镀了铬]，所以不锈。', st: {y: '2026', place: '湖北省博物馆', note: '一种说法'}},
	{id: 'S4', a: 19.25, b: 22.25, s: '是不是真的？先回到它出土那天。', st: {y: '2026 → 1965', note: '回到出土那天'}},
	{id: 'D1', a: 22.25, b: 26.5, s: '1965年冬，湖北江陵，\n修水渠时，挖出一片楚墓。', st: {y: '1965', place: '湖北江陵', note: '修水渠时发现古墓群'}},
	{id: 'D2', a: 26.5, b: 30.75, s: '其中一座，深[10.8米]，\n用夯土和白膏泥层层封住。', st: {y: '1965', place: '望山1号墓', note: '夯土·青灰泥·白膏泥'}},
	{id: 'D3', a: 30.75, b: 33.25, s: '两千多年，从没被盗过。', st: {y: '1965', place: '望山1号墓', note: '至1965年从未被盗'}},
	{id: 'D4', a: 33.25, b: 35.75, s: '木椁里，套着两层棺。', st: {y: '1965', place: '望山1号墓', note: '单椁重棺'}},
	{id: 'D5', a: 35.75, b: 39.75, s: '内棺里，墓主人左边，\n一把剑插在黑漆鞘里。', st: {y: '1965', place: '望山1号墓', note: '内棺 · 人骨架左侧'}},
	{id: 'D6', a: 39.75, b: 43.25, s: '洗净剑鞘，拔出来：\n寒光闪闪。', st: {y: '1965年12月', place: '江陵', note: '洗净剑鞘，拔剑'}},
	{id: 'I0', a: 43.25, b: 47.75, s: '越王鸠浅，自作用剑。\n{越王"鸠浅"，为自己做的剑}', q: true, st: {y: '约2500年前', place: '越', note: '剑上自己写着主人'}},
	{id: 'I1', a: 47.75, b: 52.0, s: '十几位学者，写了40多封信，\n才认定：鸠浅，就是勾践。', st: {y: '1966', place: '书信往来', note: '唐兰读出，郭沫若认同'}},
	{id: 'B1', a: 52.0, b: 56.75, s: '1977年拍科教片，拿它试过：\n30多张纸，一下划破20多张。', st: {y: '1977', place: '科教片《古剑》', note: '据亲历者陈振裕'}},
	{id: 'M1', a: 56.75, b: 61.0, s: '不锈的原因之一，是[料好]：\n含锡约18–20%，铅几乎为零。', st: {y: '湖北省博物馆', note: '据博物馆 江旭东'}},
	{id: 'M2', a: 61.0, b: 65.5, s: '镀铬？博物馆研究了7年多，\n结论是：菱形花纹，热镀[锡]。', st: {y: '2017–2025', place: '湖北省博物馆', note: '7年多无损检测'}},
	{id: 'M3', a: 65.5, b: 68.5, s: '那它，到底为什么不锈？', st: {y: '2017–2025', place: '湖北省博物馆', note: '7年多无损检测'}},
	{id: 'T1', a: 69.25, b: 71.75, s: '其实，它也[锈]了。', st: {y: '1965', place: '出土时', note: '据研究员后德俊'}},
	{id: 'T2', a: 71.75, b: 75.5, s: '只是锈得很轻，\n轻到人眼几乎看不出来。', st: {y: '1965', place: '出土时', note: '锈蚀"十分轻微"'}},
	{id: 'T3', a: 75.5, b: 79.5, s: '保住它的，不是什么秘方，\n主要是那座[墓]。', st: {y: '战国中期', place: '望山1号墓', note: '"主要是保存环境"'}},
	{id: 'E1', a: 79.5, b: 83.25, s: '同一座墓里的其他剑，\n也几乎没锈。', st: {y: '战国中期', place: '望山1号墓', note: '据文保中心江旭东'}},
	{id: 'L1', a: 83.25, b: 88.0, s: '剑鞘、两层棺、木椁、白膏泥，\n一层层，把空气隔绝在外。', st: {y: '战国中期', place: '望山1号墓', note: '层层隔绝空气'}},
	{id: 'R2', a: 88.0, b: 91.25, s: '出土几十年，它反而[没那么亮]了。', st: {y: '1965 → 2026', note: '出土后慢慢变暗'}},
	{id: 'R3', a: 91.25, b: 94.5, s: '再好的保管，也没法让锈完全停下。', st: {y: '2026', place: '湖北省博物馆', note: '锈蚀"难以绝对阻止"'}},
	{id: 'P1', a: 94.5, b: 98.75, s: '它不是不会锈，\n是那座墓，替它挡了[两千多年]。', st: {y: '2026', place: '今天', note: '本片归纳'}},
	{id: 'END', a: 99.75, b: 103.75, s: '你第一次见到它，是在哪？', st: null},
];
export const lineById = (id: string) => { const L = LINES53.find((l) => l.id === id); if (!L) throw new Error(`no line ${id}`); return L; };
export const TITLE53: [string, string] = ['越王勾践剑', '真的没锈吗？'];
export const TITLE_T53: [number, number] = [8.5, 10.5];
export const SOURCES53 = '资料：湖北省博物馆（2025研究成果）· 光明日报（陈振裕 2016；江旭东 2025）· 北京日报（后德俊 2016）';
