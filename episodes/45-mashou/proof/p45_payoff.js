// ep45 proof 4 (script v8): the payoff, 89.4 – 98.5 s. R2's tail (「它离开了[160年]」, the drop's COURT) → C1 92.016 (bar 40):
// match on the horse's face back to the hook's RING (same screen point and size as R2's last frame), pull back to the frame-0
// composition; the counter returns, label 回国; seven heads light one per half-beat (牛 虎 猴 猪 鼠 兔, the horse last in copper),
// the five turn dashed → C2 94.846 (b165): the six lift and fly into the two cases (保利 ×4, 国博 ×2), the horse stays; row 2
// 「回园 1/12」 punches in centred and settles → the cases leave, a push onto the horse → 97.676 (b170) cut-in to CASE (R4,
// 「细看，它是红铜一次铸成的。」): the horse on its black block against the paper lattice; one highlight starts its run (b171).
(() => {
const P = window.P45, B = P.beat;
const C1 = B(160), C2 = B(165), R4 = B(170);
const LAND = {}; ['牛', '虎', '猴', '猪', '鼠', '兔'].forEach((k, i) => LAND[k] = C2 + 0.572 + 0.08 * i);
const R = P.makeRing({LIGHT: {牛: B(160), 虎: B(160.5), 猴: B(161), 猪: B(161.5), 鼠: B(162), 兔: B(162.5)}, FLARE: B(163), LIFT: C2, LAND,
	CASE_IN: [C2, C2 + 0.52], LAB_OUT: [96.55, 96.85], CASE_OUT: [96.95, 97.55], CASE_OUT_B: [96.55, 97.25], TRAIL_END: C2 + 1.42});   // v8.1: 保利 ×4 stays parked for V1; 国博 ×2 leaves alone
const {face, hero0, HL} = R;
// ---- the ring camera: the match with R2's last frame, the pull back, the reframe for the cases, the push before the cut-in
const D = P.DROP, cC = D.camCourt(C1), S = P.toScr(cC, D.FACE_C), zM = (D.HERO_C.h * cC.z) / hero0.h;
const ZP = 1.28, PUSH = [face[0] - (930 - 960) / ZP, face[1] - (560 - 540) / ZP, ZP];
const camRing = P.cam([face[0] - (S[0] - 960) / zM, face[1] - (S[1] - 540) / zM, zM], [
	{t0: C1, t1: 93.40, to: [960, 540, 1.0]},
	{t0: 93.40, t1: C2, to: [965, 560, 1.04]},
	{t0: C2, t1: 95.97, to: [1180, 600, 0.86]},
	{t0: 96.25, t1: R4, to: PUSH},
]);
// ---- CASE (inside the 文殊亭; the q_end set without the dial): the horse on its black block, paper lattice behind
const HS = 340 / 925, PL = {cx: 960, top: 700, base: 800, w: 260};
const heroC = {x: PL.cx - (922 - 836) * HS, y: PL.top, h: 340, curl: 1, glow: 0.9, key: 2.0, mood: 'warm', refl: '#C9C2B0', base: 'block', block: {w: PL.w / HS, h: (PL.base - PL.top) / HS}, earDetail: true};
const faceC = [heroC.x - 0.28 * heroC.h, heroC.y - 0.52 * heroC.h];
let lat = ''; for (let i = -30; i < 80; i++) lat += `M${i * 46},140 l${430},740 M${i * 46},140 l${-430},740 `;
const caseBase = `<defs><linearGradient id="paper" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8A5A36"/><stop offset=".6" stop-color="#B07A4A"/><stop offset="1" stop-color="#7A4A2A"/></linearGradient>
	<clipPath id="latc"><rect x="150" y="140" width="1620" height="765"/></clipPath></defs>
	<rect x="-600" y="-600" width="3120" height="2280" fill="#2A170E"/><rect x="150" y="140" width="1620" height="765" fill="url(#paper)"/>
	<g clip-path="url(#latc)"><path d="${lat}" stroke="#4A2A18" stroke-width="7" opacity=".55"/></g>
	${[150, 690, 1230, 1770].map((x) => `<rect x="${x - 18}" y="120" width="36" height="805" fill="#3A2216"/>`).join('')}<rect x="130" y="120" width="1660" height="24" fill="#3A2216"/>`;
const ZC = 2.15, cR4 = camRing(R4 - 1 / 30), SR = P.toScr(cR4, face);   // the cut-in keeps the face where the ring left it
const camCase = P.cam([faceC[0] - (SR[0] - 960) / ZC, faceC[1] - (SR[1] - 540) / ZC, ZC], [{t0: R4, t1: 100.79, to: [faceC[0] - (SR[0] - 960) / ZC + 40, faceC[1] - (SR[1] - 540) / ZC, ZC * 1.05], ease: 'mix'}]);
/** b171: one highlight runs over the whole surface without a break (muzzle → brow → poll → crest → mane → neck cut), 1.6 s */
const highlight = (t) => {
	const u = P.seg(t, B(171), B(171) + 1.6); if (u <= 0 || u >= 1) return '';
	const x0 = heroC.x - 1.0 * heroC.h, x1 = heroC.x + 0.4 * heroC.h, bx = P.lerp(x0, x1, P.smooth(u)), w = 0.12 * heroC.h, a = Math.sin(Math.PI * u);
	return `<defs><linearGradient id="hlg" gradientUnits="userSpaceOnUse" x1="${bx - w}" y1="${heroC.y - heroC.h}" x2="${bx + w}" y2="${heroC.y - heroC.h + 2 * w}"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
	<mask id="hlm" maskUnits="userSpaceOnUse" x="${heroC.x - 800}" y="${heroC.y - 900}" width="1600" height="1200"><rect x="${heroC.x - 800}" y="${heroC.y - 900}" width="1600" height="1200" fill="url(#hlg)"/></mask></defs>
	<g mask="url(#hlm)" opacity="${(0.85 * a).toFixed(3)}">${K.horseHead({...heroC, glow: 0, key: 3.0, rimK: 1.4, base: 'cut'})}</g>`;
};
const caseWorld = (t) => {
	const br = 1 + 0.04 * Math.sin(2 * Math.PI * (t - R4) / 2.26);
	return caseBase + `<defs><radialGradient id="chalo" cx="960" cy="560" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB070" stop-opacity="${(0.42 * br).toFixed(3)}"/><stop offset=".6" stop-color="#C8682F" stop-opacity=".1"/><stop offset="1" stop-color="#C8682F" stop-opacity="0"/></radialGradient></defs>
	<rect x="-600" y="-600" width="3120" height="2280" fill="url(#chalo)"/><rect x="-600" y="905" width="3120" height="700" fill="#24150E"/><path d="M-600,905 L2520,905" stroke="#C8783E" stroke-width="3" opacity=".5"/>
	${K.horseHead({...heroC, glow: 0.9 * br})}${highlight(t)}`;
};
const caseVig = `<radialGradient id="cvig2" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0A0605" stop-opacity="0"/><stop offset="1" stop-color="#0A0605" stop-opacity=".72"/></radialGradient>`;
const LINES = window.LINES45;
P.PUNCH_C2 = [830, 285];
let ROW2 = null;
const render = (t, o = {}) => {
	if (t < C1 - 0.5 / 30) { const r = P.SCENES.drop.render(t); r.meta.camId = 0; return r; }
	const meta = {events: []}, hud = [];
	let svg = '';
	const tl = Math.max(t, (t < R4 - 0.5 / 30 ? C1 : R4) + 1e-3), ln = P.lineAt(LINES, tl); if (ln) hud.push(P.subHtml(ln[2], tl, ln[0]));
	if (t < R4 - 0.5 / 30 || o.ring) {
		const cam = camRing(t); meta.cam = cam; meta.camId = 1;
		if (t < C1 + 0.5 / 30) meta.events.push({c1cut: t});
		svg += `<g transform="${P.camT(cam)}">${R.ringWorld(t)}</g>${R.casesSvg(t)}${R.flights(t, cam)}${P.ringVig(cam, HL)}`;
		Object.entries(R.T.LIGHT).forEach(([k, x]) => { if (t >= x && t < x + 1 / 30) meta.events.push({['light_' + k]: t}); });
		if (t >= R.T.FLARE && t < R.T.FLARE + 1 / 30) meta.events.push({flare: t});
		if (t >= C2 && t < C2 + 1 / 30) meta.events.push({lift: t});
		// HUD: counter back on C1 (回国, ticking with the lights); row 2 「回园 1/12」 punches in centred on C2 and settles to the corner
		hud.push(P.stampHtml('圆明园 · 十二兽首', '海晏堂 · 水力钟'));
		const rows = [{lab: '回国', num: `${R.lit(t)}/12`, dots: R.dots(t)}];
		const row2 = {lab: '回园', num: '1/12', dots: P.ZOD.map((z) => P.dot(z === '马' ? 'y' : 'e')).join('')};
		if (t >= C2) {
			if (!ROW2) { ROW2 = P.measure(P.hud([P.blockHtml([rows[0], row2], null)]), '.row2'); }
			rows.push({...row2, style: P.punchStyle(ROW2, t, C2, C2 + 0.5, C2 + 1.2, Math.min(1.45, 1500 / ROW2.w), P.PUNCH_C2)});   // v2: in the sky band, clear of the heads
			if (t < C2 + 1 / 30) meta.events.push({punch: t});
		}
		hud.push(P.blockHtml(rows, null, {op: P.seg(t, C1 - 0.5 / 30, C1 + 0.15)}));
	} else {
		const cam = camCase(t); meta.cam = cam; meta.camId = 2;
		if (t < R4 + 0.5 / 30) meta.events.push({r4cut: t});
		svg += `<defs>${caseVig}</defs><g transform="${P.camT(cam)}">${caseWorld(t)}</g><rect width="1920" height="1080" fill="url(#cvig2)"/>`;
		hud.push(P.stampHtml('圆明园 · 正觉寺', '失蜡法 · 一次铸成'));
		hud.push(P.blockHtml([], '当代'));
	}
	hud.push(P.sealHtml());
	return {svg, hud: P.hud(hud), meta};
};
P.SCENES.payoff = {t0: 89.4, t1: 98.5, render};
P.PAYOFF = {camRing, face, hero0};
})();
