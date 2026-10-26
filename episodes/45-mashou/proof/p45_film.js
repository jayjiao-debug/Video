// ep45 FULL FILM (script v8.1): the master timeline. Each time range is one scene module (pure functions of t); the HUD (typed
// subtitles from lines_v81s.json, the stamp, the era chip, the counter, the J seal, the end card) follows the board's tables.
// 0 hook (RING → title → noon match-cut) · 15.3 POOL · 29.2 SALE · 47.87 DESK/PRICE · 56.7 PARIS/PRESS · 67.96 HALL · 75.6 DESK
// at night · 83.3 ROAD/COURT (drop) · 92.016 RING payoff · 97.676 CASE (reunion, ear, shadow-play, dragon, dial) · 130.298 END.
(() => {
const P = window.P45, F = P.FILM, rnd = K.rnd;
const LINES = window.LINES45, CT = F.CT;
const STAMPS = [[11.638, '乾隆年间 · 海晏堂', '圆明园 · 水力钟'], [15.318, '12:00 · 正午', '乾隆年间 · 海晏堂'], [18.714, '1860 · 圆明园', '英法联军'], [22.393, '1860.10 · 圆明园', '劫掠 · 焚园'],
	[29.469, '1989 · 伦敦', '苏富比拍卖'], [38.242, '2007 · 香港', '苏富比 · 拍卖前'], [45.035, '2007 · 香港', '国家文物局 · 反对拍卖'], [48.148, '2007.9.20 · 香港', '私下成交'], [53.808, '1989 → 2007', '伦敦 · 香港'],
	[56.921, '2009.@ · 巴黎', '佳士得 · 电话竞拍'], [64.563, '2009.3.2 · 北京', '买家记者会'], [68.242, '2013.6.28 · 北京', '国家博物馆 · 皮诺家族'], [72.205, '2019.11.13 · 北京', '国家博物馆 · 捐赠仪式'],
	[76.165, '2020.5.26 · 香港', '何鸿燊去世'], [82.959, '2020.12.1 · 北京', '运回圆明园'], [CT.V1, '2023.10 · 圆明园正觉寺', '牛 虎 猴 猪 · 来自保利艺术博物馆'], [CT.V2, '2023.10 · 圆明园正觉寺', '2023.10.18 – 10.29 · 回到保利'],
	[CT.R4, '圆明园 · 正觉寺', '失蜡法 · 一次铸成'], [CT.R5, '圆明园 · 正觉寺', '马首 · 近处这只耳朵'], [CT.R6, '圆明园 · 正觉寺', '研究者观察'], [CT.K1, '12:00 · 正午', '记忆里的水力钟'],
	[CT.K4, '2018.12.17 · 法国', '疑似龙首 · 240万欧元'], [CT.K5, '2018.12.17 · 法国', '真伪仍存疑'], [CT.Q, '圆明园 · 正觉寺', '还差五个没回中国']];
const stampAt = (t) => { let s = null; for (const x of STAMPS) if (t >= x[0] - 0.5 / 30) s = x; if (!s) return ''; return P.stampHtml(s[1].replace('@', F.parisDate(t)), s[2]); };
// v2 RR: 「回来了 ?/12」 punches in at the centre on 26.356 (the C2 grammar), holds, then flies into its slot
let PR = null;
const poolRow = (t) => { const c = F.poolCounter(t), RR = F.POOLT.RR; if (t < RR || t >= 28.4) return c;
	if (!PR) PR = P.measure(P.hud([P.blockHtml([c], '清')]), '.tally > div');
	return {...c, style: P.punchStyle(PR, t, RR, 27.75, 28.35, Math.min(2.2, 1640 / PR.w), [960, 560])}; };
const eraAt = (t) => (t < 29.469 ? '清' : '当代');
const ZO = P.ZOD;
const caseCounter = (t) => {
	if (t < CT.K1 + 0.3) return [];
	const d = (z) => ['龙', '蛇', '羊', '鸡', '狗'].indexOf(z), dt = (z) => CT.DASH0 + d(z) * P.BEAT / 2;
	const r1 = ZO.map((z) => z === '马' ? P.dot('y') : d(z) >= 0 ? P.dot('d', P.seg(t, dt(z), dt(z) + 0.2)) : P.dot('r')).join('');
	return [{lab: '回国', num: '7/12', dots: r1}, {lab: '回园', num: '1/12', dots: ZO.map((z) => P.dot(z === '马' ? 'y' : 'e')).join('')}];
};
const filmHud = (t, o = {}) => {
	const hud = [], ln = P.lineAt(LINES, t + 1e-3);
	if (ln && t < CT.END) hud.push(P.subHtml(ln[2], t + 1e-3, ln[0]));
	if (t < CT.END) {
		hud.push(stampAt(t));
		const rows = o.rows ?? [];
		hud.push(P.blockHtml(rows, eraAt(t), {op: o.blockOp ?? 1}));
		hud.push(P.sealHtml());
	}
	if (o.extra) hud.push(o.extra);
	hud.push(F.endCard(t));
	return P.hud(hud);
};
// v2: the CASE camera starts matched to the ring's last frame: the horse's face at the same screen point AND the same size
const ringStart = () => { const R = P.PAYOFF, c = R.camRing(CT.V1 - 1 / 30), s = P.toScr(c, R.face), z = R.hero0.h * c.z / 340, fc = F.CASE.faceC;
	return [fc[0] - (s[0] - 960) / z, fc[1] - (s[1] - 540) / z, z]; };
const DIS = [CT.V1 - 0.2, CT.V1 + 0.2];   // the 0.4 s dissolve ring → CASE on the matched horse
const render = (t) => {
	let r;
	if (t < 15.3) return P.SCENES.hook.render(t);
	if (t < F.SALET.INK0) { r = F.poolRender(t); return {svg: r.svg, hud: filmHud(t, {rows: t < 29.469 ? [poolRow(t)] : []}), meta: r.meta}; }
	if (t < F.BT.IRIS[0]) { r = F.saleRender(t); const rows = t < 29.469 ? [F.poolCounter(t)] : []; return {svg: r.svg, hud: filmHud(t, {rows, blockOp: t < 29.469 ? 1 - P.seg(t, 29.3, 29.469) : 1}), meta: r.meta}; }
	if (t < F.BT.WIPE[0]) { r = F.deskRender(t); return {svg: r.svg, hud: filmHud(t), meta: r.meta}; }
	if (t < F.BT.CLOTH[0]) { r = F.parisRender(t); return {svg: r.svg, hud: filmHud(t), meta: r.meta}; }
	if (t < F.BT.MATCH - 0.5 / 30) { r = F.hallRender(t); return {svg: r.svg, hud: filmHud(t), meta: r.meta}; }
	if (t < F.BT.IRIS2[1]) { r = F.nightRender(t); return {svg: r.svg, hud: filmHud(t), meta: r.meta}; }
	if (t < 92.016 - 0.5 / 30) { r = P.SCENES.drop.render(t); r.meta.camId = t < 87.17 - 0.5 / 30 ? 17 : 18; return r; }
	if (t < DIS[0]) { r = P.SCENES.payoff.render(t); r.meta.camId = 19; return r; }
	r = F.caseRender(t, ringStart());
	if (t < DIS[1]) { const p = P.SCENES.payoff.render(t, {ring: true}), u = P.smooth(P.seg(t, ...DIS));
		const svg = `${p.svg}<g opacity="${u.toFixed(3)}">${r.svg}</g>`;
		if (t < CT.V1 - 0.5 / 30) return {svg, hud: p.hud, meta: {...p.meta, camId: 19}};
		return {svg, hud: filmHud(t, {rows: caseCounter(t), extra: F.dayTag(t)}), meta: r.meta}; }
	return {svg: r.svg, hud: filmHud(t, {rows: caseCounter(t), extra: F.dayTag(t)}), meta: r.meta};
};
P.SCENES.film = {t0: 0, t1: CT.FILM_END, render};
})();
