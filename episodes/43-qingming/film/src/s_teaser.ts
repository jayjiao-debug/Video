// Scenes 03–08: the fate teaser (T1–T4, glow-locked hard cuts on b4.5 / b6 / b7 / b8), the present day at 午门 (N1/N2:
// queue → gate passage → hall → the empty case + card) and S1 (宋 dusk crest; "lanterns in the glass" pane move b11.5→b11.75,
// lanterns light right→left, the direction rule drawn by shadow and light). Every frame is a pure function of t.
import {Stage, Live, D, W, H, svgDoc, svgToCanvas, bar, BEAT, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas, hash} from './core';
import {Crest, deck} from './crest';
import {RoomYuan, Store, Wumen, scrollHeap} from './rooms';
import {addScene, In} from './film';
import {Cast, look, drawRoll, glowBlob, rig, drawBundle, drawCarriedRoll} from './actors';
import {POSES, walkFor, underArm, underArmRoll, toScreen, FigOpts, Pose, P, gaitStride, stepFor, armsFrom, figurePaths, carryArmful, armfulAt, fkPose} from './figures';
import {paintSection, silkWeave} from './silk';
import {SIL, railing as railingSvg, skyline, dagoba} from './draw';

const b = bar;
export const LOCK: P = [960, 580];

// ------------------------------------------------------------------------------------------------ shared helpers
/** set the camera so the world point (wx, wy) at depth z lands on screen (sx, sy) at this zoom */
export const lockCam = (st: Stage, zoom: number, wx: number, wy: number, z: number, sx = LOCK[0], sy = LOCK[1]) => {
	const d = D / zoom;
	const cx = 960 + ((wx - 960) * (D - z) - (sx - 960) * (d - z)) / D;
	const cy = 540 - ((540 - wy) * (D - z) - (540 - sy) * (d - z)) / D;
	st.setCam(cx, cy, zoom);
	return [cx, cy] as P;
};
/** screen position of a world point at depth z for a camera (cx, cy, zoom) — same maths as three's projection */
export const projAt = (cx: number, cy: number, zoom: number, wx: number, wy: number, z: number): P => {
	const d = D / zoom;
	return [960 + ((wx - 960) * (D - z) - (cx - 960) * D) / (d - z), 540 - ((540 - wy) * (D - z) - (540 - cy) * D) / (d - z)];
};
/** tilt the upper body forward (deg) about the hips (body units, facing +x) */
const UPPER = ['Spine1', 'Neck1', 'Head', 'Top', 'LSh', 'LElb', 'LHand', 'LTip', 'RSh', 'RElb', 'RHand', 'RTip'];
export const bowUpper = (p: Pose, deg: number): Pose => {
	const o: Pose = {...p}, H = p.Hips, a = (-deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
	for (const k of UPPER) { const v = [p[k][0] - H[0], p[k][1] - H[1]]; o[k] = [H[0] + v[0] * c - v[1] * s, H[1] + v[0] * s + v[1] * c]; }
	return o;
};
/** the arm (+ hand + cuff) paths of a figure, to draw over a prop that sits in front of the body */
export const armPaths = (f: FigOpts, sides: ('R' | 'L')[] = ['R', 'L']) => sides.flatMap((s) => figurePaths({...f, part: s}));
/** the White Dagoba with a readable top: bell-shaped bronze canopy (华盖) and a small stupa finial (never a cross) */
const dagobaSil = (cx: number, base: number, sc: number, col: string) => {
	const p = (x: number, y: number) => `${(cx + x * sc).toFixed(1)},${(base - y * sc).toFixed(1)}`;
	let o = `<path fill="${col}" d="M${p(-120, 0)} L${p(120, 0)} L${p(120, 26)} L${p(96, 26)} L${p(96, 50)} L${p(-96, 50)} L${p(-96, 26)} L${p(-120, 26)} Z
	M${p(-80, 50)} L${p(80, 50)} L${p(70, 72)} L${p(-70, 72)} Z M${p(-70, 72)} C${p(-98, 122)} ${p(-88, 172)} ${p(-40, 188)} L${p(40, 188)} C${p(88, 172)} ${p(98, 122)} ${p(70, 72)} Z
	M${p(-36, 186)} L${p(36, 186)} L${p(28, 206)} L${p(-28, 206)} Z M${p(-26, 206)} L${p(26, 206)} L${p(12, 318)} L${p(-12, 318)} Z
	M${p(-60, 318)} Q${p(-50, 330)} ${p(-36, 346)} Q${p(0, 358)} ${p(36, 346)} Q${p(50, 330)} ${p(60, 318)} Z
	M${p(-7, 352)} C${p(-16, 362)} ${p(-12, 378)} ${p(0, 380)} C${p(12, 378)} ${p(16, 362)} ${p(7, 352)} Z M${p(-2.5, 378)} L${p(2.5, 378)} L${p(1, 398)} L${p(-1, 398)} Z"/>`;
	for (let i = 0; i < 9; i++) o += `<rect fill="${col}" x="${(cx - (27 - i * 1.6) * sc).toFixed(1)}" y="${(base - (214 + i * 11.5) * sc).toFixed(1)}" width="${((54 - i * 3.2) * sc).toFixed(1)}" height="${(4 * sc).toFixed(1)}"/>`;
	for (const x of [-56, -28, 28, 56]) o += `<rect fill="${col}" x="${(cx + x * sc - 1.5).toFixed(1)}" y="${(base - 318 * sc).toFixed(1)}" width="3" height="${(12 * sc).toFixed(1)}"/>`;
	return o;
};
/** walking under a long robe: keep the swing shin within 54° of vertical so the robe stays one A-line hull (no split legs) */
export const robeSafe = (p: Pose, max = 54): Pose => {
	const o: Pose = {...p};
	for (const s of ['L', 'R']) { const K = p[`${s}Knee`], A = p[`${s}Ank`], T = p[`${s}Toe`], v = [A[0] - K[0], A[1] - K[1]], ang = Math.atan2(Math.abs(v[0]), -v[1]) * 180 / Math.PI;
		if (ang <= max) continue; const d = (ang - max) * Math.PI / 180 * (v[0] < 0 ? -1 : 1), c = Math.cos(d), sn = Math.sin(d);
		const r = (q: P): P => { const w = [q[0] - K[0], q[1] - K[1]]; return [K[0] + w[0] * c - w[1] * sn, K[1] + w[0] * sn + w[1] * c]; };
		o[`${s}Ank`] = r(A); o[`${s}Toe`] = r(T); }
	return o;
};
const fillD = (g: CanvasRenderingContext2D, ds: string[], col = SIL) => { g.fillStyle = col; for (const d of ds) g.fill(new Path2D(d)); };
const k30 = (t: number) => `${Math.round(t * 30)}`;
/** a rolled scroll lying on a table, seen from above at a slant (vertical on screen): body + knobs */
const vRoll = (g: CanvasRenderingContext2D, x: number, y0: number, y1: number, r: number, kind: 'gold' | 'grey', lean = 0) => {
	g.save(); g.translate(x, (y0 + y1) / 2); g.rotate(lean); const hh = (y1 - y0) / 2;
	const gr = g.createLinearGradient(-r, 0, r, 0);
	if (kind === 'grey') { gr.addColorStop(0, '#6A665F'); gr.addColorStop(0.45, '#ABA69C'); gr.addColorStop(1, '#55524C'); }
	else { gr.addColorStop(0, '#E2B979'); gr.addColorStop(0.45, '#FFF3D8'); gr.addColorStop(1, '#D6A866'); }
	g.fillStyle = gr; g.beginPath(); g.roundRect(-r, -hh, 2 * r, 2 * hh, r * 0.5); g.fill();
	g.fillStyle = kind === 'grey' ? '#4A4E54' : '#34506A'; g.fillRect(-r, -hh, 2 * r, 2 * hh * 0.07); g.fillRect(-r, hh - 2 * hh * 0.07, 2 * r, 2 * hh * 0.07);
	g.fillStyle = kind === 'grey' ? '#9A968E' : '#EADCC0'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(0, s * (hh + 4), r * 0.7, r * 0.38, 0, 0, Math.PI * 2); g.fill(); }
	g.restore();
};

// ------------------------------------------------------------------------------------------------ boot
let riverMono: HTMLCanvasElement, riverGrey: HTMLCanvasElement;
// 03 · T1
let room: RoomYuan, t1Halo: Live, t1Body: Live, t1Arms: Live, t1Copy: Live, t1Silk: Live, t1Pool: Live;
export const bootTeaser = async () => {
	riverMono = paintSection('river', {width: 2048, height: 768, mode: 'mono', seed: 43});
	riverGrey = paintSection('river', {width: 2048, height: 768, mode: 'grey', seed: 43});
	await bootT1(); await bootT2(); await bootT3(); await bootT4();
};

// ================================================================================================ 03 · T1 (b4.5 → b6)
// ROOM-元 at night, recomposed: an elevated long table, your silk centred on the lock point. The craftsman stands behind
// the table at left. One move swaps you: he unrolls the grey copy rightward over your place while the same two hands
// roll you up ahead of it (b4.6 → b5.0: the copy lands on the lock point). He lifts your roll and hurries off right.
const TB = {back: 478, front: 690, apron: 722, bx0: 110, bx1: 1810, fx0: 60, fx1: 1860};      // table top (screen px at rest)
const SL = {x0: 660, x1: 1260, y0: 497, y1: 665};                                              // the open silk on the table
const T1Z = {floor: -200, body: -120, table: -80, pool: -79, copy: -78, silk: -77, arms: -70};
const CRAFT = look('yuanCraftsman'), CH = 520, CG = 884;
/** perspective squeeze of the table top: x scale at screen row y */
const tsq = (y: number) => 0.965 + 0.035 * clamp01((y - TB.back) / (TB.front - TB.back));
const tx = (X: number, y: number) => 960 + (X - 960) * tsq(y);
/** paint a section lying flat on the table: the painting spans table-X [X0,X1]; only [c0,c1] is drawn (the rest is rolled) */
const drawFlat = (g: CanvasRenderingContext2D, src: HTMLCanvasElement, X0: number, X1: number, c0: number, c1: number) => {
	c0 = Math.max(c0, X0); c1 = Math.min(c1, X1); if (c1 - c0 < 1) return;
	const hh = src.width / ((X1 - X0) / (SL.y1 - SL.y0)), sy0 = (src.height - hh) / 2 + 30, step = 3;
	for (let y = SL.y0; y < SL.y1; y += step) {
		const v0 = (y - SL.y0) / (SL.y1 - SL.y0), v1 = Math.min(1, (y + step - SL.y0) / (SL.y1 - SL.y0)), u0 = (c0 - X0) / (X1 - X0), u1 = (c1 - X0) / (X1 - X0);
		const xa = tx(c0, y + step / 2), xb = tx(c1, y + step / 2);
		g.drawImage(src, u0 * src.width, sy0 + v0 * hh, (u1 - u0) * src.width, (v1 - v0) * hh, xa, y, xb - xa, Math.min(step, SL.y1 - y) + 0.6);
	}
	// mount bands (blue-grey on the copy)
	const band = (ya: number, yb: number) => { g.beginPath(); g.moveTo(tx(c0, ya), ya); g.lineTo(tx(c1, ya), ya); g.lineTo(tx(c1, yb), yb); g.lineTo(tx(c0, yb), yb); g.closePath(); g.fill(); };
	g.fillStyle = src === riverGrey ? 'rgba(78,82,86,0.92)' : 'rgba(52,80,106,0.9)'; band(SL.y0, SL.y0 + 9); band(SL.y1 - 9, SL.y1);
};
const bootT1 = async () => {
	room = new RoomYuan('night'); await room.ready;
	const st = room.st; st.get('table').mesh.visible = false; st.get('outside').mesh.visible = false; st.get('osky').mesh.visible = false;
	// the moon window: a night sky a step lighter than the wall, the White Dagoba and roofs standing above the table line
	st.add('t1sky', canvasTex(gradCanvas([[0, '#2c3f4b'], [0.5, '#3d515b'], [0.85, '#5a6a6c'], [1, '#66716c']])), 1240, 400, 1400, 700, -2500);
	const out = svgDoc(`${skyline(900, 1600, 482, 26, 70, 51, '#18202a')}${dagobaSil(1345, 470, 0.62, '#18202a')}` +
		Array.from({length: 7}, (_, i) => `<rect x="${1000 + i * 83 + (i % 2) * 17}" y="${452 + (i % 3) * 6}" width="7" height="5" fill="#FFB868" fill-opacity="${0.45 + (i % 3) * 0.15}"/>`).join(''), W, H);
	st.add('t1out', canvasTex(await svgToCanvas(out, W, H, 0.6)), 960, 540, W, H, -1800, {fog: ['#3d515b', 0.18]});
	// floor behind the table (the craftsman stands on it; seen under the table top between the legs)
	st.add('t1floor', canvasTex(gradCanvas([[0, '#2a2622'], [0.25, '#24211d'], [1, '#141210']])), 960, 1060, 3600, 420, T1Z.floor);
	// the elevated long table: top (trapezoid), apron, four legs
	const cv = mkCanvas(1920, 1080), g = cv.getContext('2d')!;
	const top = g.createLinearGradient(0, TB.back, 0, TB.front); top.addColorStop(0, '#2b211a'); top.addColorStop(1, '#3a2c21');
	g.fillStyle = '#16100c'; for (const x of [TB.bx0 + 30, TB.bx1 - 60]) g.fillRect(x, TB.back + 10, 30, 905 - TB.back - 10);      // back legs
	g.fillStyle = top; g.beginPath(); g.moveTo(TB.bx0, TB.back); g.lineTo(TB.bx1, TB.back); g.lineTo(TB.fx1, TB.front); g.lineTo(TB.fx0, TB.front); g.closePath(); g.fill();
	g.strokeStyle = 'rgba(90,66,44,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(TB.bx0, TB.back + 1); g.lineTo(TB.bx1, TB.back + 1); g.stroke();
	for (let i = 0; i < 9; i++) { g.strokeStyle = `rgba(20,14,10,${0.18 + 0.05 * (i % 3)})`; g.lineWidth = 1.5; const y = TB.back + 18 + i * 22; g.beginPath(); g.moveTo(tx(TB.fx0 + 40, y), y); g.lineTo(tx(TB.fx1 - 40, y), y); g.stroke(); }
	g.fillStyle = '#1b140f'; g.fillRect(TB.fx0, TB.front, TB.fx1 - TB.fx0, TB.apron - TB.front);
	g.fillStyle = 'rgba(120,86,56,0.35)'; g.fillRect(TB.fx0, TB.front, TB.fx1 - TB.fx0, 3);
	g.fillStyle = SIL; for (const x of [TB.fx0 + 22, TB.fx1 - 62]) g.fillRect(x, TB.apron - 2, 40, 1010 - TB.apron);
	st.add('t1table', canvasTex(cv), 960, 540, 1920, 1080, T1Z.table, {rim: 0.5, rimPx: 4});
	t1Body = new Live(st, 't1body', 960, 640, 2600, 1100, T1Z.body, {rim: 1.0, rimPx: 6}, 1);
	t1Pool = new Live(st, 't1pool', 960, 540, 1920, 1080, T1Z.pool, {}, 0.5);
	t1Copy = new Live(st, 't1copy', 960, 600, 1920, 400, T1Z.copy, {}, 1);
	t1Silk = new Live(st, 't1silk', 1200, 600, 2600, 700, T1Z.silk, {emissive: 0.32}, 1);
	t1Halo = new Live(st, 't1halo', 1200, 600, 2600, 900, -76, {emissive: 1.0}, 0.5);
	t1Arms = new Live(st, 't1arms', 960, 640, 2600, 1100, T1Z.arms, {rim: 1.0, rimPx: 6}, 1);
};
// timing
const T1 = {go: 11.95, land: b(5), grab: 13.18, lift: 13.48};
/** the swap: roller position along the table (x of the two rollers at the seam) */
const t1Seam = (t: number) => lerp(SL.x0, SL.x1, easeInOut((t - T1.go) / (T1.land - T1.go)));
const strideC = () => gaitStride('08_04', stepFor(CRAFT)) * CH;
/** the craftsman's figure x and walk distance at t */
const t1Walk = (t: number) => {
	const off = 152;                                             // figure x behind the seam
	if (t < T1.lift) return {x: Math.min(t1Seam(t), SL.x1 + 8) - off, dist: Math.min(t1Seam(t), SL.x1 + 8) - SL.x0};
	// hurry off right: speeds up from the lift, out of frame before b5.75
	const u = t - T1.lift, v = 690, x0 = SL.x1 + 8 - off, x = x0 + v * (u * u / (2 * 0.35) * (u < 0.35 ? 1 : 0) + (u >= 0.35 ? 0.175 + (u - 0.35) : 0));
	return {x, dist: SL.x1 + 8 - SL.x0 + (x - x0)};
};
const t1Fig = (t: number) => {
	const w = t1Walk(t), seam = t1Seam(t), u = w.dist / strideC();
	const lean = t < T1.grab ? 24 : lerp(24, 6, smooth((t - T1.grab) / (T1.lift + 0.2 - T1.grab)));
	const base = bowUpper(robeSafe(walkFor(CRAFT, u)), lean);
	const o: FigOpts = {x: w.x, ground: CG, h: CH, pose: base, look: CRAFT};
	// the roll: lying at the seam until the grab, then lifted and turned level in front of the chest
	const rollX = seam + 9, rollLie: [P, P] = [[rollX, SL.y0 - 4], [rollX, SL.y1 + 4]];
	let roll = rollLie, contacts;
	if (t < T1.land) contacts = [{side: 'R' as const, target: [seam - 11, 612] as P, name: 'R on copy roller'}, {side: 'L' as const, target: [seam + 9, 548] as P, name: 'L on your roller'}];
	else {
		const k = smooth((t - T1.grab) / (T1.lift - T1.grab));
		const c0: P = [rollX, (SL.y0 + SL.y1) / 2], c1: P = [w.x + 0.25 * CH, CG - 0.64 * CH], c: P = [lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k) - 26 * Math.sin(Math.PI * k)];
		const ang = lerp(Math.PI / 2, 0.06, k), L = (SL.y1 - SL.y0 + 8) / 2, dv: P = [Math.cos(ang) * L, Math.sin(ang) * L];
		roll = [[c[0] - dv[0], c[1] - dv[1]], [c[0] + dv[0], c[1] + dv[1]]];
		const pa: P = [lerp(roll[0][0], roll[1][0], 0.3), lerp(roll[0][1], roll[1][1], 0.3)], pb: P = [lerp(roll[0][0], roll[1][0], 0.72), lerp(roll[0][1], roll[1][1], 0.72)];
		// before the lift the near hand moves from the copy roller onto your roll
		const kr = smooth((t - T1.land) / (T1.grab - T1.land));
		const rFrom: P = [SL.x1 - 2, 612], rTo = ang > 0.8 ? pb : pa;
		contacts = [{side: 'R' as const, target: (t < T1.grab ? [lerp(rFrom[0], pb[0], kr), lerp(rFrom[1], pb[1], kr) - 18 * Math.sin(Math.PI * kr)] : rTo) as P, name: 'R on your roll'}, {side: 'L' as const, target: (ang > 0.8 ? pa : pb) as P, name: 'L on your roll'}];
	}
	const f = rig(o, contacts, () => CG, 'T1 craftsman');
	return {f, roll, seam};
};
addScene({id: '03', a: b(4.5), z: b(6), draw: (t) => {
	const st = room.st;
	const zoom = lerp(1, 1.03, clamp01((t - b(4.5)) / (b(6) - b(4.5))));
	lockCam(st, zoom, LOCK[0], LOCK[1], T1Z.silk);
	const {f, roll, seam} = t1Fig(t), key = k30(t);
	const rolled = t >= T1.land;
	// glow position (hero): the silk's centre while it lies open, then the roll
	const openW = SL.x1 - Math.min(SL.x1, seam + 8), gx = rolled ? (roll[0][0] + roll[1][0]) / 2 : (seam + 8 + SL.x1) / 2, gy = rolled ? (roll[0][1] + roll[1][1]) / 2 : 581;
	const glowK = rolled ? 0.55 : 0.55 + 0.45 * openW / (SL.x1 - SL.x0);
	t1Body.drawW(key, (g) => fillD(g, figurePaths(f)));
	t1Arms.drawW(key, (g) => fillD(g, armPaths(f)));
	t1Copy.drawW(key, (g) => {
		drawFlat(g, riverGrey, SL.x0, SL.x1, SL.x0, seam - 10);
		vRoll(g, tx(seam - 12, 581), SL.y0 - 4, SL.y1 + 4, lerp(17, 9, clamp01((seam - SL.x0) / (SL.x1 - SL.x0))), 'grey', -(seam - 12 - 960) * 0.035 / (SL.y1 - SL.y0));
	});
	t1Silk.drawW(key, (g) => {
		if (!rolled || seam < SL.x1) drawFlat(g, riverMono, SL.x0, SL.x1, seam + 8, SL.x1);
		if (!rolled) { const r = lerp(9, 16, clamp01((seam - SL.x0) / (SL.x1 - SL.x0))); vRoll(g, tx(seam + 9, 581), SL.y0 - 4, SL.y1 + 4, r, 'gold', -(seam + 9 - 960) * 0.035 / (SL.y1 - SL.y0)); }
		else drawRoll(g, roll[0], roll[1], 16, 1);
		if (seam < SL.x1 - 4) { g.fillStyle = '#34506A'; const xr = SL.x1; g.beginPath(); g.moveTo(tx(xr, SL.y0) - 4, SL.y0 - 6); g.lineTo(tx(xr, SL.y0) + 6, SL.y0 - 6); g.lineTo(tx(xr, SL.y1) + 6, SL.y1 + 6); g.lineTo(tx(xr, SL.y1) - 4, SL.y1 + 6); g.closePath(); g.fill(); }
	});
	// the warm pool your light throws on the table, travelling with you
	t1Pool.drawW(`${Math.round(gx / 4)}:${Math.round(gy / 4)}:${glowK.toFixed(2)}`, (g) => {
		g.save(); g.beginPath(); g.moveTo(TB.bx0, TB.back); g.lineTo(TB.bx1, TB.back); g.lineTo(TB.fx1, TB.apron); g.lineTo(TB.fx0, TB.apron); g.closePath(); g.clip();
		glowBlob(g, [gx, gy + 30], 560, 220, 0.34 * glowK, '255,196,128'); g.restore();
	});
	t1Halo.drawW(key, (g) => rolled ? glowBlob(g, [gx, gy], 95, 60, 0.42) : glowBlob(g, [gx, gy], 70 + openW * 0.45, 125, 0.22));
	room.lamp.L.mat.uniforms.uEmissive.value = 0.8;
	room.lamp.draw('lamp', (g) => { const x = 905, y = 352; g.strokeStyle = SIL; g.lineWidth = 3; g.beginPath(); g.moveTo(x, -10); g.lineTo(x, y - 26); g.stroke(); g.fillStyle = SIL; g.fillRect(x - 20, y - 30, 40, 7);
		glowBlob(g, [x, y], 64, 64, 0.16, '255,184,104'); g.fillStyle = '#E9A35E'; g.beginPath(); g.ellipse(x, y, 17, 22, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = SIL; g.fillRect(x - 12, y + 19, 24, 5); });
	st.heroAt(gx, gy, T1Z.silk, rolled ? 560 : 760);
	return {st, grade: {vig: 0.42, exposure: 1}, bloom: 1};
}});

// ================================================================================================ 04 · T2 (b6 → b7)
// CREST CR-C at night, lanterns out, P-明. The eunuch walks right (出) with your roll under his arm, one step per beat;
// the camera tracks so your glow stays on the lock point (it is exactly there at both cuts).
let crestT2: Crest, castT2: Cast, propT2: Live, glowT2: Live;
const EUN = look('mingEunuch'), EH = 520, EZOOM = 1.12, T2X0 = 560;
/** mean roll-centre offset from the figure's (x, ground) over a gait cycle, body units — the camera follows this, not the bob */
let rollOff: P | null = null;
const meanRollOff = (lk: typeof EUN, side: 'R' = 'R'): P => {
	let sx = 0, sy = 0; const n = 16;
	for (let i = 0; i < n; i++) { let p = walkFor(lk, i / n); p = armsFrom(p, underArm(p), side); const [a, c] = underArmRoll(p, side, 0.29); sx += (a[0] + c[0]) / 2 / n; sy += (a[1] + c[1]) / 2 / n; }
	return [sx, sy];
};
const bootT2 = async () => {
	crestT2 = new Crest('t2-night', {sky: 'night', era: '明', lanterns: true, boat: false, bankCrowd: false}); await crestT2.ready;
	castT2 = new Cast(crestT2.st, 't2cast', 1200, 640, 3400, 1100, 20);
	propT2 = new Live(crestT2.st, 't2prop', 1200, 640, 3400, 1100, 23, {rim: 0}, 1);
	glowT2 = new Live(crestT2.st, 't2glow', 1200, 640, 3400, 1100, 24, {emissive: 1.0}, 0.5);
	rollOff = meanRollOff(EUN);
};
const t2Walk = (t: number) => { const u = (t - b(6) + 0.2) / (2 * BEAT); return {u, x: T2X0 + u * gaitStride('08_04', stepFor(EUN)) * EH}; };
const t2Fig = (t: number) => { const {u, x} = t2Walk(t); let p = robeSafe(walkFor(EUN, u)); p = armsFrom(p, underArm(p), 'R'); return rig({x, ground: deck(x) + 4, h: EH, pose: p, look: EUN}, [], deck, 'T2 eunuch'); };
addScene({id: '04', a: b(6), z: b(7), draw: (t) => {
	const st = crestT2.st, f = t2Fig(t), {x} = t2Walk(t), o = rollOff!;
	const target: P = [x + o[0] * EH, deck(x) + 4 - o[1] * EH];
	lockCam(st, EZOOM, target[0], target[1], 22);
	const key = k30(t); let roll: [P, P] = [[0, 0], [0, 0]];
	castT2.draw(key, [f]);
	propT2.L.mat.uniforms.uEmissive.value = 0.55;
	propT2.drawW(key, (g) => { roll = drawCarriedRoll(g, f, 'T2 eunuch', 'R', 0.29, 13, 1) as [P, P]; });
	const [r0, r1] = underArmRoll(f.pose, 'R', 0.29), c0 = toScreen(f, r0), c1 = toScreen(f, r1), hc: P = [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2];
	glowT2.drawW(key, (g) => glowBlob(g, hc, 95, 60, 0.42));
	crestT2.setLanterns(() => 0); crestT2.setStreak(hc[0], 0.5, t);
	st.heroAt(hc[0], hc[1], 22, 430);
	return {st, grade: {vig: 0.4, exposure: 1}, bloom: 1};
}});

// ================================================================================================ 05 · T3 (b7 → b8)
// CREST CR-B wide, SNOW-NIGHT, P-1923 with warm windows on the far bank, snow on the railing and the deck. A young man in a
// long gown and 瓜皮帽 crosses right hugging the cloth bundle; glow leaks through the cloth; a slow pan holds it on the lock point.
let crestT3: Crest, castT3: Cast, propT3: Live, glowT3: Live, armsT3: Live;
const YOUTH = look('youth1923'), YH = 470, YZOOM = 0.94, T3X0 = 640;
let bundleOff: P | null = null;
const bootT3 = async () => {
	crestT3 = new Crest('t3-snow', {sky: 'snow', era: '1923', lanterns: true, boat: false, bankCrowd: false, snow: true}); await crestT3.ready;
	const st = crestT3.st; st.get('sunglow').mat.uniforms.uOpacity.value = 0.22;
	// warm windows along the far bank (the one colour besides you): small lit panes in the palace wall and the town
	const fw = new Live(st, 't3farWin', 960, 850, 8400, 200, -2540, {emissive: 0.9}, 0.5);
	fw.drawW('w', (g) => { for (let i = 0; i < 60; i++) { const x = -1600 + i * 75 + hash(i * 3.3) * 50, y = 818 + hash(i * 7.1) * 26; if (hash(i * 1.9) < 0.35) continue; g.fillStyle = `rgba(255,184,104,${0.55 + 0.3 * hash(i)})`; g.fillRect(x, y, 9 + (i % 3) * 3, 6 + (i % 2) * 2); } });
	// snow lying on the deck (z 1, just in front of the arch) and on the railing (z 41, just in front of the rail)
	const dk = new Live(st, 't3deckSnow', 960, 1100, 4800, 1600, 1, {}, 0.5);
	dk.drawW('s', (g) => { g.fillStyle = '#C9D2D8'; g.beginPath(); const xs: number[] = []; for (let x = -1300; x <= 3200; x += 20) xs.push(x);
		xs.forEach((x, i) => (i ? g.lineTo(x, deck(x) - 6 - 2 * Math.sin(x * 0.05)) : g.moveTo(x, deck(x) - 6))); for (const x of xs.slice().reverse()) g.lineTo(x, deck(x) + 3); g.closePath(); g.fill(); });
	const rl = railingSvg(960, 906, 1700, 1400, 150, 116), dy = (x: number) => deck(x) + 6;
	const rs = new Live(st, 't3railSnow', 960, 1100, 4800, 1600, 41, {}, 0.5);
	rs.drawW('s', (g) => {
		g.fillStyle = '#D9E1E6';
		for (const [yo, th] of [[150, 7], [67.5, 4]] as [number, number][]) { g.beginPath(); const xs: number[] = []; for (let x = 960 - 1904; x <= 960 + 1904; x += 20) xs.push(x);
			xs.forEach((x, i) => { const y = dy(x) - yo - 4.5 - th * (0.7 + 0.3 * Math.sin(x * 0.031)); i ? g.lineTo(x, y) : g.moveTo(x, y); }); for (const x of xs.slice().reverse()) g.lineTo(x, dy(x) - yo - 3); g.closePath(); g.fill(); }
		for (const [x, y] of rl.posts) { g.beginPath(); g.ellipse(x, y - 13, 10, 5, 0, Math.PI, 0); g.fill(); }
	});
	castT3 = new Cast(st, 't3cast', 1200, 640, 3400, 1100, 20);
	propT3 = new Live(st, 't3prop', 1200, 640, 3400, 1100, 22, {rim: 0.4}, 1);
	glowT3 = new Live(st, 't3glow', 1200, 640, 3400, 1100, 24, {emissive: 1.0}, 0.5);
	armsT3 = new Live(st, 't3arms', 1200, 640, 3400, 1100, 23, {rim: 1.0, rimPx: 5}, 1);
	let sx = 0, sy = 0; for (let i = 0; i < 16; i++) { const a = armfulAt(carryArmful(walkFor(YOUTH, i / 16))); sx += a.c[0] / 16; sy += a.c[1] / 16; } bundleOff = [sx, sy];
};
const t3Walk = (t: number) => { const u = (t - b(7) + 0.2) / (2 * BEAT); return {u, x: T3X0 + u * gaitStride('08_04', stepFor(YOUTH)) * YH}; };
const t3Fig = (t: number) => {
	const {u, x} = t3Walk(t), base = carryArmful(robeSafe(walkFor(YOUTH, u))), a = armfulAt(base), o: FigOpts = {x, ground: deck(x) + 4, h: YH, pose: base, look: YOUTH};
	// contacts on the bundle: near forearm under it, far hand over its front (the same points carryArmful aims at)
	const R = toScreen(o, [a.c[0] + 0.03, a.c[1] - a.r - 0.014]), L = toScreen(o, [a.c[0] + a.r + 0.008, a.c[1] + 0.012]);
	const f = rig(o, [{side: 'R', target: R, name: 'R under bundle', opt: {dir: 12}}, {side: 'L', target: L, name: 'L round bundle', opt: {dir: -78}}], deck, 'T3 youth');
	return {f, c: toScreen(f, a.c), r: a.r * YH};
};
/** a cloth bundle (包袱) hugged to the chest: soft cloth over a long box, knotted on top; your light seeps through the thin cloth */
const clothBundle = (g: CanvasRenderingContext2D, c: P, r: number) => {
	const w = r * 2.9, h = r * 2.0, x0 = c[0] - w / 2, y0 = c[1] - h / 2;
	g.save();
	const gr = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], w * 0.6); gr.addColorStop(0, '#B8874E'); gr.addColorStop(0.55, '#6E4E30'); gr.addColorStop(1, '#3a2a1e');
	g.fillStyle = gr; g.beginPath(); g.roundRect(x0, y0, w, h, h * 0.42); g.fill();
	// folds + the knot (two ears) on top
	g.strokeStyle = 'rgba(30,22,16,0.7)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0 + w * 0.18, y0 + 3); g.quadraticCurveTo(c[0], c[1] + h * 0.1, x0 + w * 0.86, y0 + h - 4); g.stroke();
	g.fillStyle = '#4a3524'; g.beginPath(); g.ellipse(c[0] - 6, y0 - 2, 9, 6, -0.5, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(c[0] + 9, y0 - 4, 10, 6, 0.6, 0, Math.PI * 2); g.fill();
	g.strokeStyle = 'rgba(255,226,170,0.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(c[0] - 14, y0 + 3); g.quadraticCurveTo(c[0] + 2, y0 + 9, c[0] + 16, y0 + 2); g.stroke();
	g.restore();
};
addScene({id: '05', a: b(7), z: b(8), draw: (t) => {
	const st = crestT3.st, {f, c, r} = t3Fig(t), {x} = t3Walk(t), o = bundleOff!;
	lockCam(st, YZOOM, x + o[0] * YH, deck(x) + 4 - o[1] * YH, 22);
	const key = k30(t);
	castT3.draw(key, [f]);
	propT3.drawW(key, (g) => clothBundle(g, c, r));
	propT3.L.mat.uniforms.uEmissive.value = 0.35;
	armsT3.drawW(key, (g) => fillD(g, armPaths(f)));
	glowT3.drawW(key, (g) => { glowBlob(g, c, 120, 90, 0.34); glowBlob(g, c, 40, 30, 0.42, '255,226,170'); });
	crestT3.setLanterns(() => 0); crestT3.setStreak(c[0], 0.35, t);
	crestT3.motes?.update(t, [-900, -300, 3000, 1300], 70, 24, 0.85);
	st.heroAt(c[0], c[1], 22, 420);
	return {st, grade: {vig: 0.42, exposure: 1}, bloom: 1};
}});

// ================================================================================================ 06 · T4 (b8 → b9)
// STORE, lamp off. Heaps of rolled scrolls as dark shapes against the mid-tone wall, a cool spill from a high window out of
// frame (top right), dust in the beam, one faint glow buried in the heap on the lock point. Very slow push. The glow stops.
let store: Store, t4Glow: Live, t4Occl: Live, t4Beam: Live;
const T4Z = {heap: -150, glow: -149, occl: -148, beam: -200};
const bootT4 = async () => {
	store = new Store(); await store.ready; const st = store.st;
	// the cool spill: a soft shaft from above-right, landing on the heap
	const bc = mkCanvas(960, 540), g = bc.getContext('2d')!;
	const gr = g.createLinearGradient(640, 0, 430, 400); gr.addColorStop(0, 'rgba(176,196,206,0.30)'); gr.addColorStop(1, 'rgba(160,182,194,0.07)');
	g.filter = 'blur(14px)'; g.fillStyle = gr; g.beginPath(); g.moveTo(585, -20); g.lineTo(700, -20); g.lineTo(560, 470); g.lineTo(330, 470); g.closePath(); g.fill(); g.filter = 'none';
	t4Beam = new Live(st, 't4beam', 960, 540, 1920, 1080, T4Z.beam, {}, 0.5); t4Beam.draw('b', (q) => q.drawImage(bc, 0, 0, 1920, 1080));
	// the heap on the lock point: a long mound (cool-lit tops), the buried glow, rolls lying over it
	const heap = svgDoc(`${scrollHeap(860, 930, 1500, 430, 120, 31)}${scrollHeap(1180, 900, 700, 260, 46, 37)}`, 3600, 1500, '', -900, -100);
	st.add('t4heap', canvasTex(await svgToCanvas(heap, 3600, 1500, 0.6)), 900, 650, 3600, 1500, T4Z.heap, {rim: 0.35, rimPx: 4});
	t4Glow = new Live(st, 't4glow', 960, 580, 400, 300, T4Z.glow, {emissive: 0.9}, 1);
	t4Occl = new Live(st, 't4occl', 960, 580, 600, 400, T4Z.occl, {rim: 0.8, rimPx: 4}, 1);
	t4Occl.drawW('o', (q) => { const roll = (x: number, y: number, len: number, d: number, a: number) => { q.save(); q.translate(x, y); q.rotate(a); q.fillStyle = '#1b1612'; q.strokeStyle = SIL; q.lineWidth = 2; q.beginPath(); q.roundRect(-len / 2, -d / 2, len, d, d / 2); q.fill(); q.stroke(); q.restore(); };
		roll(900, 556, 230, 30, -0.12); roll(1030, 610, 220, 34, 0.1); roll(905, 612, 150, 28, 0.25); roll(1010, 548, 120, 26, -0.3); });
	t4Glow.drawW('g', (q) => { glowBlob(q, [962, 582], 70, 50, 0.55); q.fillStyle = '#FFE9C0'; q.beginPath(); q.ellipse(962, 582, 13, 18, 0, 0, Math.PI * 2); q.fill(); q.strokeStyle = '#E8B878'; q.lineWidth = 3; q.beginPath(); q.ellipse(962, 582, 6, 9, 0, 0, Math.PI * 2); q.stroke(); });
	// the desk lamp of scene 27, unlit, on the table
	store.lamp.draw('off', (q) => { q.fillStyle = SIL; q.fillRect(1296, 750, 52, 10); q.fillRect(1318, 690, 8, 62); q.beginPath(); q.moveTo(1292, 700); q.lineTo(1352, 700); q.lineTo(1338, 664); q.lineTo(1306, 664); q.closePath(); q.fill(); });
	store.lamp.L.mat.uniforms.uEmissive.value = 0;
};
addScene({id: '06', a: b(8), z: b(9), draw: (t) => {
	const st = store.st, k = clamp01((t - b(8)) / (b(9) - b(8)));
	lockCam(st, lerp(1.0, 1.035, k), LOCK[0], LOCK[1], T4Z.glow);
	store.dust.update(t, [380, 0, 1300, 900], 10, 5, 0.32);
	st.heroAt(962, 582, T4Z.glow, 330);
	return {st, grade: {vig: 0.38, exposure: 1}, bloom: 1};
}});
