// Scenes 03–08: the fate teaser (T1–T4, glow-locked hard cuts on b4.5 / b6 / b7 / b8), the present day at 午门 (N1/N2:
// queue → gate passage → hall → the empty case + card) and S1 (宋 dusk crest; "lanterns in the glass" pane move b11.5→b11.75,
// lanterns light right→left, the direction rule drawn by shadow and light). Every frame is a pure function of t.
import {Stage, Live, Motes, D, W, H, svgDoc, svgToCanvas, bar, BEAT, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas, hash} from './core';
import {Crest, deck} from './crest';
import {RoomYuan, Store, Wumen, scrollHeap} from './rooms';
import {addScene, In} from './film';
import {Cast, look, drawRoll, glowBlob, rig, drawBundle, drawCarriedRoll} from './actors';
import {POSES, gaitPose, walkFor, underArm, underArmRoll, toScreen, FigOpts, Pose, P, gaitStride, stepFor, armsFrom, figurePaths, carryArmful, armfulAt, fkPose} from './figures';
import {paintSection, silkWeave} from './silk';
import {SIL, railing as railingSvg, skyline, dagoba, hall as hallSvg, roof as roofSvg, tinyFig, boat as boatSvg} from './draw';
import {fillSvg} from './crest';
import {html} from './hud';

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
	M${p(-58, 316)} C${p(-56, 340)} ${p(-30, 352)} ${p(0, 354)} C${p(30, 352)} ${p(56, 340)} ${p(58, 316)} Z
	M${p(-16, 350)} C${p(-20, 366)} ${p(-10, 374)} ${p(0, 376)} C${p(10, 374)} ${p(20, 366)} ${p(16, 350)} Z"/>`;
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
	// and keep each thigh within 40° of vertical (rotate the whole leg about the hip), so the hull never splits
	for (const s of ['L', 'R']) { const U = o[`${s}Up`], K = o[`${s}Knee`], v = [K[0] - U[0], K[1] - U[1]], ang = Math.atan2(Math.abs(v[0]), -v[1]) * 180 / Math.PI;
		if (ang <= 40) continue; const d = (ang - 40) * Math.PI / 180 * (v[0] < 0 ? -1 : 1), c = Math.cos(d), sn = Math.sin(d);
		const r = (q: P): P => { const w = [q[0] - U[0], q[1] - U[1]]; return [U[0] + w[0] * c - w[1] * sn, U[1] + w[0] * sn + w[1] * c]; };
		for (const j of ['Knee', 'Ank', 'Toe']) o[`${s}${j}`] = r(o[`${s}${j}`]); }
	return o;
};
/** a neck about half the head's width, from the collar to the jaw (the kit draws a thin stalk under tall caps) */
const neck = (g: CanvasRenderingContext2D, f: FigOpts) => {
	const a = toScreen(f, f.pose.Neck1), c = toScreen(f, f.pose.Head), sp = toScreen(f, f.pose.Spine1), w = 0.034 * f.h;
	const dx = c[0] - sp[0], dy = c[1] - sp[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w, ny = dx / L * w;
	g.fillStyle = SIL; g.beginPath(); g.moveTo(sp[0] + nx * 1.5, sp[1] + ny * 1.5); g.lineTo(c[0] + nx, c[1] + ny); g.lineTo(c[0] - nx, c[1] - ny); g.lineTo(sp[0] - nx * 1.5, sp[1] - ny * 1.5); g.closePath(); g.fill(); void a;
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
	await bootT1(); await bootT2(); await bootT3(); await bootT4(); await bootN(); await bootS1();
};

// ================================================================================================ 03 · T1 (b4.5 → b6)
// ROOM-元 at night, recomposed: an elevated long table, your silk centred on the lock point. The craftsman stands behind
// the table at left. One move swaps you: he unrolls the grey copy rightward over your place while the same two hands
// roll you up ahead of it (b4.6 → b5.0: the copy lands on the lock point). He lifts your roll and hurries off right.
const TB = {back: 478, front: 690, apron: 722, bx0: 110, bx1: 1810, fx0: 60, fx1: 1860};      // table top (screen px at rest)
const SL = {x0: 660, x1: 1260, y0: 497, y1: 665};                                              // the open silk on the table
const T1Z = {floor: -200, body: -120, table: -80, pool: -79, copy: -78, silk: -77, arms: -70};
const CRAFT = look('yuanCraftsman'), CH = 560, CG = 905;   // feet on the floor line of the table's back legs
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
	{ const sh = g.createLinearGradient(0, TB.apron, 0, 920); sh.addColorStop(0, 'rgba(8,6,5,0.62)'); sh.addColorStop(1, 'rgba(8,6,5,0.25)'); g.fillStyle = sh; g.fillRect(TB.fx0 + 60, TB.apron, TB.fx1 - TB.fx0 - 120, 920 - TB.apron);
		g.fillStyle = '#1a1410'; g.fillRect(TB.fx0 + 60, 860, TB.fx1 - TB.fx0 - 120, 12); }      // shadow under the table + a low stretcher in front of his feet
	g.fillStyle = SIL; for (const x of [TB.fx0 + 22, TB.fx1 - 62]) g.fillRect(x, TB.apron - 2, 40, 1010 - TB.apron);
	st.add('t1table', canvasTex(cv), 960, 540, 1920, 1080, T1Z.table, {rim: 0.5, rimPx: 4});
	t1Body = new Live(st, 't1body', 1250, 640, 1900, 720, T1Z.body, {rim: 1.0, rimPx: 6}, 1);
	t1Pool = new Live(st, 't1pool', 960, 600, 1920, 320, T1Z.pool, {}, 0.4);
	t1Copy = new Live(st, 't1copy', 960, 580, 720, 230, T1Z.copy, {}, 1);
	t1Silk = new Live(st, 't1silk', 1250, 560, 1900, 520, T1Z.silk, {emissive: 0.32}, 1);
	t1Halo = new Live(st, 't1halo', 1250, 560, 1900, 520, -76, {emissive: 1.0}, 0.4);
	t1Arms = new Live(st, 't1arms', 1250, 560, 1900, 520, T1Z.arms, {rim: 1.0, rimPx: 6}, 1);
};
// timing
const T1 = {go: 11.72, land: b(5), grab: 12.95, lift: 13.3};
/** the swap: roller position along the table (x of the two rollers at the seam) */
const t1Seam = (t: number) => lerp(SL.x0, SL.x1, easeInOut((t - T1.go) / (T1.land - T1.go)));
const strideC = () => gaitStride('08_04', stepFor(CRAFT)) * CH;
/** the craftsman's figure x and walk distance at t */
const t1Walk = (t: number) => {
	const off = 112;                                             // figure x behind the seam
	if (t < T1.grab) return {x: Math.min(t1Seam(t), SL.x1 + 8) - off, dist: Math.min(t1Seam(t), SL.x1 + 8) - SL.x0};
	// hurry off right: he gathers you up as he steps off, speeding up; out of frame by b5.75 (only grey is left)
	const u = t - T1.grab, v = 700, a = 0.5, x0 = SL.x1 + 8 - off, x = x0 + v * (u < a ? u * u / (2 * a) : a / 2 + (u - a));
	return {x, dist: SL.x1 + 8 - SL.x0 + (x - x0)};
};
const t1Fig = (t: number) => {
	const w = t1Walk(t), seam = t1Seam(t), u = w.dist / strideC();
	const lean = t < T1.grab ? 14 : lerp(14, 4, smooth((t - T1.grab) / (T1.lift + 0.2 - T1.grab)));
	const base = bowUpper(robeSafe(walkFor(CRAFT, u)), lean);
	const o: FigOpts = {x: w.x, ground: CG, h: CH, pose: base, look: CRAFT};
	// the roll: lying at the seam until the grab, then lifted and turned level in front of the chest
	const rollX = seam + 9, rollLie: [P, P] = [[rollX, SL.y0 - 4], [rollX, SL.y1 + 4]];
	let roll = rollLie, contacts;
	if (t < T1.land) contacts = [{side: 'R' as const, target: [seam - 11, 594] as P, name: 'R on copy roller'}, {side: 'L' as const, target: [seam + 9, 540] as P, name: 'L on your roller'}];
	else {
		// the roll turns from lying in depth (vertical on screen) to level in front of the chest; roll[1] (the far end on the
		// table) becomes the front end, so the far (L) hand keeps it and the near (R) hand holds the middle — no crossed hands
		const k = smooth((t - T1.grab) / (T1.lift - T1.grab)), sh = toScreen(o, base.LSh);
		const c0: P = [rollX, (SL.y0 + SL.y1) / 2], c1: P = [sh[0] + 0.17 * CH, sh[1] + 0.2 * CH], c: P = [lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k) - 24 * Math.sin(Math.PI * k)];
		const ang = lerp(-Math.PI / 2, -0.06, k), L = (SL.y1 - SL.y0 + 8) / 2, dv: P = [Math.cos(ang) * L, Math.sin(ang) * L];
		roll = [[c[0] - dv[0], c[1] - dv[1]], [c[0] + dv[0], c[1] + dv[1]]];
		const at = (u: number): P => [lerp(roll[0][0], roll[1][0], u), lerp(roll[0][1], roll[1][1], u)];
		const pR = at(lerp(0.55, 0.36, k)), pL = at(lerp(0.85, 0.68, k));
		// between landing and the grab the near hand moves from the copy roller onto your roll
		const kr = smooth((t - T1.land) / (T1.grab - T1.land)), rFrom: P = [SL.x1 - 11, 594];
		contacts = [{side: 'R' as const, target: (t < T1.grab ? [lerp(rFrom[0], pR[0], kr), lerp(rFrom[1], pR[1], kr) - 14 * Math.sin(Math.PI * kr)] : pR) as P, name: 'R on your roll'}, {side: 'L' as const, target: pL, name: 'L on your roll'}];
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
	const glowK = (rolled ? 0.55 : 0.55 + 0.45 * openW / (SL.x1 - SL.x0)) * clamp01((1900 - gx) / 420);
	t1Body.drawW(key, (g) => fillD(g, figurePaths(f)));
	t1Arms.drawW(key, (g) => { g.save(); g.beginPath(); g.rect(0, TB.back + 1, 4000, 2000); g.clip(); fillD(g, armPaths(f)); g.restore(); });
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
		glowBlob(g, [gx, gy + 30], 560, 220, 0.34 * glowK, '255,196,128'); glowBlob(g, [905, 600], 300, 120, 0.1, '255,184,104'); g.restore();
	});
	t1Halo.drawW(key, (g) => glowK <= 0.01 ? undefined : rolled ? glowBlob(g, [gx, gy], 95, 60, 0.42) : glowBlob(g, [gx, gy], 70 + openW * 0.45, 125, 0.22));
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
	for (let i = 0; i < n; i++) { let p = robeSafe(gaitPose('08_04', i / n, 0.82)); p = armsFrom(p, underArm(p), side); const [a, c] = underArmRoll(p, side, 0.29); sx += (a[0] + c[0]) / 2 / n; sy += (a[1] + c[1]) / 2 / n; }
	return [sx, sy];
};
const bootT2 = async () => {
	crestT2 = new Crest('t2-night', {sky: 'night', era: '明', lanterns: true, boat: false, bankCrowd: false}); await crestT2.ready;
	castT2 = new Cast(crestT2.st, 't2cast', 1000, 700, 1700, 900, 20);
	propT2 = new Live(crestT2.st, 't2prop', 1000, 640, 1700, 500, 23, {rim: 0}, 1);
	glowT2 = new Live(crestT2.st, 't2glow', 1000, 640, 1700, 500, 24, {emissive: 1.0}, 0.4);
	rollOff = meanRollOff(EUN);
};
const t2Walk = (t: number) => { const u = (t - b(6) + 0.2) / (2 * BEAT); return {u, x: T2X0 + u * gaitStride('08_04', 0.82) * EH}; };
const t2Fig = (t: number) => { const {u, x} = t2Walk(t); let p = robeSafe(gaitPose('08_04', u, 0.82)); p = armsFrom(p, underArm(p), 'R'); return rig({x, ground: deck(x) + 4, h: EH, pose: p, look: EUN}, [], deck, 'T2 eunuch'); };
addScene({id: '04', a: b(6), z: b(7), draw: (t) => {
	const st = crestT2.st, f = t2Fig(t), {x} = t2Walk(t), o = rollOff!;
	const target: P = [x + o[0] * EH, deck(x) + 4 - o[1] * EH];
	lockCam(st, EZOOM, target[0], target[1], 22, LOCK[0] - 16, LOCK[1]);   // the roll's light sits forward of its centre (hand end + halo)
	const key = k30(t); let roll: [P, P] = [[0, 0], [0, 0]];
	castT2.draw(key, [f], (g) => neck(g, f));
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
	const dk = new Live(st, 't3deckSnow', 960, 1100, 4800, 1600, 1, {}, 0.35);
	dk.drawW('s', (g) => { g.fillStyle = '#C9D2D8'; g.beginPath(); const xs: number[] = []; for (let x = -1300; x <= 3200; x += 20) xs.push(x);
		xs.forEach((x, i) => (i ? g.lineTo(x, deck(x) - 6 - 2 * Math.sin(x * 0.05)) : g.moveTo(x, deck(x) - 6))); for (const x of xs.slice().reverse()) g.lineTo(x, deck(x) + 3); g.closePath(); g.fill(); });
	const rl = railingSvg(960, 906, 1700, 1400, 150, 116), dy = (x: number) => deck(x) + 6;
	const rs = new Live(st, 't3railSnow', 960, 1100, 4800, 1600, 41, {}, 0.4);
	rs.drawW('s', (g) => {
		g.fillStyle = '#D9E1E6';
		for (const [yo, th] of [[150, 7], [67.5, 4]] as [number, number][]) { g.beginPath(); const xs: number[] = []; for (let x = 960 - 1904; x <= 960 + 1904; x += 20) xs.push(x);
			xs.forEach((x, i) => { const y = dy(x) - yo - 4.5 - th * (0.7 + 0.3 * Math.sin(x * 0.031)); i ? g.lineTo(x, y) : g.moveTo(x, y); }); for (const x of xs.slice().reverse()) g.lineTo(x, dy(x) - yo - 3); g.closePath(); g.fill(); }
		for (const [x, y] of rl.posts) { g.beginPath(); g.ellipse(x, y - 13, 10, 5, 0, Math.PI, 0); g.fill(); }
	});
	castT3 = new Cast(st, 't3cast', 1000, 700, 1600, 800, 20);
	propT3 = new Live(st, 't3prop', 1000, 640, 1600, 500, 22, {rim: 0.4}, 1);
	glowT3 = new Live(st, 't3glow', 1000, 640, 1600, 500, 24, {emissive: 1.0}, 0.4);
	armsT3 = new Live(st, 't3arms', 1000, 640, 1600, 500, 23, {rim: 1.0, rimPx: 5}, 1);
	let sx = 0, sy = 0; for (let i = 0; i < 16; i++) { const a = armfulAt(carryArmful(bowUpper(robeSafe(gaitPose('08_04', i / 16, 0.82)), 5))); sx += a.c[0] / 16; sy += a.c[1] / 16; } bundleOff = [sx, sy];
};
const t3Walk = (t: number) => { const u = (t - b(7) + 0.2) / (2 * BEAT); return {u, x: T3X0 + u * gaitStride('08_04', 0.82) * YH}; };
const t3Fig = (t: number) => {
	const {u, x} = t3Walk(t), base = carryArmful(bowUpper(robeSafe(gaitPose('08_04', u, 0.82)), 5)), a = armfulAt(base), o: FigOpts = {x, ground: deck(x) + 4, h: YH, pose: base, look: YOUTH};
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
	const gr = g.createLinearGradient(640, 0, 430, 400); gr.addColorStop(0, 'rgba(176,196,206,0.2)'); gr.addColorStop(1, 'rgba(160,182,194,0.05)');
	g.filter = 'blur(14px)'; g.fillStyle = gr; g.beginPath(); g.moveTo(585, -20); g.lineTo(700, -20); g.lineTo(560, 470); g.lineTo(330, 470); g.closePath(); g.fill(); g.filter = 'none';
	t4Beam = new Live(st, 't4beam', 960, 540, 1920, 1080, T4Z.beam, {}, 0.5); t4Beam.draw('b', (q) => q.drawImage(bc, 0, 0, 1920, 1080));
	// the heap on the lock point: a long mound (cool-lit tops), the buried glow, rolls lying over it
	const heap = svgDoc(`${scrollHeap(860, 930, 1500, 430, 120, 31)}${scrollHeap(1180, 900, 700, 260, 46, 37)}`, 3600, 1500, '', -900, -100);
	st.add('t4heap', canvasTex(await svgToCanvas(heap, 3600, 1500, 0.6)), 900, 650, 3600, 1500, T4Z.heap, {rim: 0.35, rimPx: 4});
	t4Glow = new Live(st, 't4glow', 960, 580, 400, 300, T4Z.glow, {emissive: 0.9}, 1);
	t4Occl = new Live(st, 't4occl', 960, 580, 600, 400, T4Z.occl, {rim: 0.8, rimPx: 4}, 1);
	t4Occl.drawW('o', (q) => { const roll = (x: number, y: number, len: number, d: number, a: number) => { q.save(); q.translate(x, y); q.rotate(a); q.fillStyle = '#1b1612'; q.strokeStyle = SIL; q.lineWidth = 2; q.beginPath(); q.roundRect(-len / 2, -d / 2, len, d, d / 2); q.fill(); q.stroke(); q.restore(); };
		roll(900, 556, 230, 30, -0.12); roll(1030, 610, 220, 34, 0.1); roll(905, 612, 150, 28, 0.25); roll(1010, 548, 120, 26, -0.3); });
	t4Glow.drawW('g', (q) => { glowBlob(q, [962, 582], 80, 58, 0.7); q.fillStyle = '#FFE9C0'; q.beginPath(); q.ellipse(962, 582, 13, 18, 0, 0, Math.PI * 2); q.fill(); q.strokeStyle = '#E8B878'; q.lineWidth = 3; q.beginPath(); q.ellipse(962, 582, 6, 9, 0, 0, Math.PI * 2); q.stroke(); });
	// scene 27's table (top 690 → 756, x 800–1790, stool at its left end) and its green-enamel gooseneck lamp, unlit (copied
	// from s_peak.ts so the set matches when scene 27 turns the lamp on)
	st.get('table').mesh.visible = false;
	const tc = mkCanvas(1920, 1080), tg = tc.getContext('2d')!, TOPF = 756, TOPB = 690, FLOOR = 1040;
	tg.fillStyle = '#2b221a'; tg.beginPath(); tg.moveTo(812, TOPB); tg.lineTo(1760, TOPB); tg.lineTo(1790, TOPF); tg.lineTo(800, TOPF); tg.closePath(); tg.fill();
	tg.fillStyle = 'rgba(255,220,170,.05)'; for (let i = 0; i < 9; i++) tg.fillRect(812, TOPB + 6 + i * 7, 960, 1);
	tg.fillStyle = '#18120d'; tg.fillRect(800, TOPF, 990, 30); tg.fillRect(820, TOPF + 30, 24, FLOOR - TOPF - 30); tg.fillRect(1750, TOPF + 30, 24, FLOOR - TOPF - 30); tg.fillRect(844, TOPF + 30, 906, 14);
	tg.fillStyle = SIL; tg.fillRect(652, 796, 176, 14); tg.fillRect(664, 810, 12, FLOOR - 810); tg.fillRect(804, 810, 12, FLOOR - 810); tg.fillRect(676, 960, 128, 8);
	const bx = 1250, by = TOPB + 6;
	tg.fillStyle = SIL; tg.beginPath(); tg.ellipse(bx, by + 4, 40, 9, 0, 0, Math.PI * 2); tg.fill();
	tg.strokeStyle = SIL; tg.lineWidth = 7; tg.lineCap = 'round'; tg.beginPath(); tg.moveTo(bx, by); tg.lineTo(bx + 6, 610); tg.quadraticCurveTo(bx - 10, 572, 1190, 600); tg.stroke();
	tg.save(); tg.translate(1168, 616); tg.rotate(-0.55); tg.fillStyle = '#2f4a3a'; tg.beginPath(); tg.moveTo(-14, -34); tg.lineTo(14, -34); tg.lineTo(46, 26); tg.quadraticCurveTo(0, 38, -46, 26); tg.closePath(); tg.fill(); tg.fillStyle = '#4f6f58'; tg.fillRect(-12, -34, 24, 6); tg.restore();
	tg.strokeStyle = '#100c09'; tg.lineWidth = 3; tg.beginPath(); tg.moveTo(bx - 30, by + 4); tg.bezierCurveTo(1150, TOPB + 12, 1000, TOPB + 14, 914, TOPB + 14); tg.stroke();
	st.add('t4table', canvasTex(tc), 960, 540, 1920, 1080, 0, {rim: 1.0, rimPx: 5});
	store.lamp.L.mat.uniforms.uEmissive.value = 0;
};
addScene({id: '06', a: b(8), z: b(9), draw: (t) => {
	const st = store.st, k = clamp01((t - b(8)) / (b(9) - b(8)));
	lockCam(st, lerp(1.0, 1.035, k), LOCK[0], LOCK[1], T4Z.glow);
	store.dust.update(t, [380, 0, 1300, 900], 10, 5, 0.32);
	st.heroAt(962, 582, T4Z.glow, 330);
	return {st, grade: {vig: 0.38, exposure: 1}, bloom: 1};
}});

// ================================================================================================ 07 · N1/N2 (b9 → b11.5)
// 午门 at night: the queue snakes up the 马道 to the one warm point at the top (the exhibition hall's lit door = your case
// light, on the lock point at the b9 cut). b9 → b10 the camera cranes up the ramp toward it; b10 a match into the hall's deep
// door passage (warm-lit, far opening visible), through it by b10.25; the hall: you glowing in the glass case, profiles
// filing past lit only by you; b10.75 your glow goes out; the card; b11.5 the pane move into scene 08.
let hallDust: Motes, ext: Stage, extDoor: Live, extQueue: Live, pass: Stage, hallSt: Stage, hallSilk: Live, hallCrowd: Live, hallRefl: Live, hallCard: Live;
const DOOR = {x: 960, y: 604, w: 48, h: 72, z: -190};
const PANE = {x0: 660, x1: 1260, y0: 432, y1: 728, z: -290};
const HZ = {wall: -800, inner: -320, silk: -310, glass: -290, frame: -285, card: -280, floor: -400, refl: -395, crowd: 120};
// the queue path in the gate's plane: plaza (right → left), the 马道 ramp up to the platform, along it to the door
const rampY = (x: number) => 1100 - (x + 200) * (460 / 1080);
const QPATH: P[] = [[-480, rampY(-480) - 2], [880, rampY(880) - 2], [DOOR.x - 20, 638]];
const qLen = QPATH.slice(1).map((q, i) => Math.hypot(q[0] - QPATH[i][0], q[1] - QPATH[i][1]));
const qAt = (s: number): P | null => { if (s < 0) return null; for (let i = 0; i < qLen.length; i++) { if (s <= qLen[i]) { const u = s / qLen[i]; return [lerp(QPATH[i][0], QPATH[i + 1][0], u), lerp(QPATH[i][1], QPATH[i + 1][1], u)]; } s -= qLen[i]; } return null; };
const bootN = async () => {
	// ---------- exterior
	ext = new Stage('n1ext');
	ext.add('sky', canvasTex(gradCanvas([[0, '#1F2E38'], [0.42, '#2E404B'], [0.7, '#45565D'], [0.8, '#5A5A4C'], [1, '#4a4a40']])), 960, 420, 9000, 3200, -6000);
	const far = svgDoc(`${skyline(-2600, 4600, 760, 24, 70, 17, '#222a30')}` + Array.from({length: 40}, (_, i) => `<rect x="${-2400 + i * 170 + hash(i) * 80}" y="${728 + hash(i * 3) * 24}" width="8" height="5" fill="#FFB868" fill-opacity="${0.35 + 0.3 * hash(i * 7)}"/>`).join(''), 7400, 900, '', -2700, 0);
	ext.add('far', canvasTex(await svgToCanvas(far, 7400, 900, 0.5)), 950, 450, 7400, 900, -3000, {fog: ['#45565D', 0.3]});
	const wallG = `<defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2d2a"/><stop offset="0.6" stop-color="#46352f"/><stop offset="1" stop-color="#523e35"/></linearGradient>` +
		`<radialGradient id="fl"><stop offset="0" stop-color="#7a5a48" stop-opacity="0.4"/><stop offset="1" stop-color="#7a5a48" stop-opacity="0"/></radialGradient></defs>`;
	let gate = `<rect x="-1500" y="640" width="4900" height="560" fill="url(#wg)"/>`;
	for (let i = 0; i < 14; i++) gate += `<line x1="-1500" x2="3400" y1="${668 + i * 38}" y2="${668 + i * 38}" stroke="#2e1f1a" stroke-opacity="0.35" stroke-width="2"/>`;
	for (const x of [-500, 420, 1500, 2420]) gate += `<ellipse cx="${x}" cy="1180" rx="300" ry="260" fill="url(#fl)"/>`;
	for (let x = -1500; x < 3400; x += 34) gate += `<rect x="${x}" y="628" width="20" height="14" fill="#2c201c"/>`;
	for (const [ax, aw, ah] of [[960, 118, 200], [690, 84, 150], [1230, 84, 150]]) gate += `<path fill="#24170f" d="M${ax - aw / 2},1200 L${ax - aw / 2},${1200 - ah + aw / 2} A${aw / 2},${aw / 2} 0 0 1 ${ax + aw / 2},${1200 - ah + aw / 2} L${ax + aw / 2},1200 Z"/>`;
	// wings (雁翅楼) and pavilions on the platform, the main hall over the centre
	for (const sg of [-1, 1]) { gate += `<rect x="${sg < 0 ? 960 - 860 : 960 + 300}" y="598" width="560" height="44" fill="#17191c"/>` + roofSvg(960 + sg * 580, 570, 620, 34, 0.3, '#17191c') + hallSvg(960 + sg * 900, 642, 200, 130, 1, '#17191c'); }
	gate += hallSvg(960, 642, 400, 196, 2, '#17191c');
	ext.add('gate', canvasTex(await svgToCanvas(svgDoc(wallG + gate, 4900, 1200, '', -1500, 100), 4900, 1200, 0.6)), 950, 700, 4900, 1200, -200, {});
	// the 马道 ramp on the wall face (stone, its parapet), the plaza
	const ramp = `<path fill="#3d302b" d="M-200,1100 L880,640 L960,640 L960,654 L890,654 L-150,1110 Z"/><path fill="none" stroke="#17120f" stroke-width="7" d="M-200,1086 L880,628"/>` +
		Array.from({length: 26}, (_, i) => { const x = -160 + i * 40, y = 1086 - (x + 200) * (458 / 1080); return `<rect x="${x}" y="${y - 12}" width="4" height="12" fill="#17120f"/>`; }).join('');
	ext.add('ramp', canvasTex(await svgToCanvas(svgDoc(ramp, 2400, 700, '', -400, 560), 2400, 700, 0.6)), 800, 910, 2400, 700, -160, {});
	ext.add('plaza', canvasTex(gradCanvas([[0, '#2c2826'], [1, '#1b1918']])), 960, 1300, 6000, 420, -150);
	extDoor = new Live(ext, 'door', DOOR.x, DOOR.y, 400, 300, DOOR.z, {emissive: 0.85}, 1);
	extDoor.draw('d', (g) => { g.translate(200 - DOOR.x, 150 - DOOR.y);
		glowBlob(g, [DOOR.x, DOOR.y + 10], 150, 90, 0.35); const gr = g.createLinearGradient(0, DOOR.y - DOOR.h / 2, 0, DOOR.y + DOOR.h / 2); gr.addColorStop(0, '#E8A860'); gr.addColorStop(0.55, '#FFE2AE'); gr.addColorStop(1, '#F2C27E');
		g.fillStyle = gr; g.fillRect(DOOR.x - DOOR.w / 2, DOOR.y - DOOR.h / 2, DOOR.w, DOOR.h); g.fillStyle = 'rgba(255,248,230,0.9)'; g.beginPath(); g.ellipse(DOOR.x, DOOR.y + 12, 16, 9, 0, 0, Math.PI * 2); g.fill(); });
	extQueue = new Live(ext, 'queue', 950, 860, 2600, 700, -155, {rim: 0.5, rimPx: 3}, 0.75);
	// ---------- the door passage: warm-lit masonry rings receding to the far opening (the hall)
	pass = new Stage('n1pass');
	// a uniform tunnel: every ring has the same world-size arch hole (PH × PV); the far opening (z 0) shows the hall
	const PH = 78, PV = 112, PCY = 600;
	const farCv = mkCanvas(1920, 1080), fg = farCv.getContext('2d')!;   // drawn at full size, uploaded as a 960×540 copy below
	fg.fillStyle = '#41474d'; fg.fillRect(0, 0, 1920, 1080);
	{ const x0 = 960 - 110, y0 = PCY - 64, w = 220, h = 124; const gr = fg.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, '#3a4046'); gr.addColorStop(0.7, '#464C52'); gr.addColorStop(1, '#2c3135');
		fg.fillStyle = gr; fg.fillRect(x0, y0, w, h); fg.fillStyle = '#262b30'; fg.fillRect(960 - 34, PCY - 14, 68, 32); glowBlob(fg, [960, PCY], 60, 24, 0.6); fg.fillStyle = '#FFF0CF'; fg.fillRect(960 - 29, PCY - 4, 58, 10);
		fg.fillStyle = '#2a2f34'; fg.fillRect(960 - 36, PCY + 18, 72, 20); }
	const farS = mkCanvas(960, 540); farS.getContext('2d')!.drawImage(farCv, 0, 0, 960, 540); pass.add('far', canvasTex(farS), 960, 540, 1920, 1080, 0, {emissive: 0.2});
	const RZ = [250, 480, 700, 900, 1060, 1180, 1250];
	RZ.forEach((z, i) => { const c = mkCanvas(960, 540), g = c.getContext('2d')!, s2 = D / (D - z), hw = PH * s2 / 2, hh = PV * s2 / 2, cy = 540 / 2 + (PCY - 540) * s2 / 2, k = i / (RZ.length - 1);
		const lit = Math.round(lerp(150, 62, k)); g.fillStyle = `rgb(${lit},${Math.round(lit * 0.8)},${Math.round(lit * 0.64)})`; g.fillRect(0, 0, 960, 540);
		g.strokeStyle = `rgba(30,18,10,${0.25 + 0.2 * k})`; g.lineWidth = 1.5; for (let y = 6; y < 540; y += 14 * s2 / 2 + 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(960, y); g.stroke(); }
		g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(480 - hw, cy + hh); g.lineTo(480 - hw, cy - hh + hw); g.arc(480, cy - hh + hw, hw, Math.PI, 0); g.lineTo(480 + hw, cy + hh); g.closePath(); g.fill();
		g.globalCompositeOperation = 'source-over'; pass.add('ring' + i, canvasTex(c), 960, 540, 1920, 1080, z, {}); });
	// ---------- the hall
	hallSt = new Stage('n2hall');
	const hw = mkCanvas(960, 540), hg = hw.getContext('2d')!;
	const hgr = hg.createLinearGradient(0, 0, 0, 540); hgr.addColorStop(0, '#3a4046'); hgr.addColorStop(0.5, '#464C52'); hgr.addColorStop(1, '#4b5157'); hg.fillStyle = hgr; hg.fillRect(0, 0, 960, 540);
	for (const x of [120, 840]) { const r = hg.createRadialGradient(x, 200, 0, x, 200, 210); r.addColorStop(0, 'rgba(120,128,134,0.55)'); r.addColorStop(1, 'rgba(120,128,134,0)'); hg.fillStyle = r; hg.fillRect(0, 0, 960, 540); }
	hg.fillStyle = 'rgba(30,34,38,0.5)'; for (let x = 40; x < 960; x += 160) hg.fillRect(x, 0, 3, 540);
	hallSt.add('wall', canvasTex(hw), 960, 540, 2400 * 1.2, 1350 * 1.2, HZ.wall);
	hallSt.add('floor', canvasTex(gradCanvas([[0, '#3a3f44'], [0.2, '#2f3438'], [1, '#202428']])), 960, 1100, 4000, 520, HZ.floor);
	hallRefl = new Live(hallSt, 'refl', 960, 960, 1400, 300, HZ.refl, {emissive: 0.4}, 0.5);
	// the case: dark interior + inclined bed (behind the glass), the plinth, the frame around the pane
	const inner = mkCanvas(1920, 1080), ig = inner.getContext('2d')!;
	ig.fillStyle = '#262b30'; ig.fillRect(PANE.x0, PANE.y0, PANE.x1 - PANE.x0, PANE.y1 - PANE.y0);
	ig.fillStyle = '#3a4046'; ig.beginPath(); ig.moveTo(PANE.x0 + 30, 650); ig.lineTo(PANE.x1 - 30, 650); ig.lineTo(PANE.x1 - 50, 520); ig.lineTo(PANE.x0 + 50, 520); ig.closePath(); ig.fill();
	ig.fillStyle = '#2f353a'; ig.fillRect(PANE.x0 + 30, 650, PANE.x1 - PANE.x0 - 60, 22);
	hallSt.add('inner', canvasTex(inner), 960, 540, 1920, 1080, HZ.inner, {rim: 0.3});
	hallSilk = new Live(hallSt, 'silk', 960, 580, 700, 260, HZ.silk, {emissive: 0.32}, 1);
	const glass = mkCanvas(960, 540), gg = glass.getContext('2d')!;
	gg.strokeStyle = 'rgba(220,230,236,0.08)'; gg.lineWidth = 10; gg.beginPath(); gg.moveTo(PANE.x0 / 2 + 60, PANE.y1 / 2); gg.lineTo(PANE.x0 / 2 + 140, PANE.y0 / 2); gg.stroke();
	gg.lineWidth = 3; gg.beginPath(); gg.moveTo(PANE.x0 / 2 + 92, PANE.y1 / 2); gg.lineTo(PANE.x0 / 2 + 172, PANE.y0 / 2); gg.stroke();
	hallSt.add('glass', canvasTex(glass), 960, 540, 1920, 1080, HZ.glass, {});
	const fr = mkCanvas(1920, 1080), frg = fr.getContext('2d')!;
	frg.fillStyle = '#2a2f34'; frg.fillRect(PANE.x0 - 40, PANE.y1 + 10, PANE.x1 - PANE.x0 + 80, 200);                         // plinth
	frg.fillStyle = '#3c4248'; frg.fillRect(PANE.x0 - 40, PANE.y1 + 10, PANE.x1 - PANE.x0 + 80, 6);
	frg.fillStyle = '#1b1f23'; frg.fillRect(PANE.x0 - 12, PANE.y0 - 12, PANE.x1 - PANE.x0 + 24, 12); frg.fillRect(PANE.x0 - 12, PANE.y1, PANE.x1 - PANE.x0 + 24, 14);
	frg.fillRect(PANE.x0 - 12, PANE.y0 - 12, 12, PANE.y1 - PANE.y0 + 26); frg.fillRect(PANE.x1, PANE.y0 - 12, 12, PANE.y1 - PANE.y0 + 26);
	frg.fillStyle = 'rgba(200,210,218,0.35)'; frg.fillRect(PANE.x0, PANE.y0 - 1, PANE.x1 - PANE.x0, 2); frg.fillRect(PANE.x0 - 1, PANE.y0, 2, PANE.y1 - PANE.y0);   // the glass edge catching light
	frg.fillStyle = '#1b1f23'; frg.fillRect(PANE.x0 - 30, PANE.y0 - 40, PANE.x1 - PANE.x0 + 60, 28);                                 // the case top
	hallSt.add('frame', canvasTex(fr), 960, 540, 1920, 1080, HZ.frame, {rim: 0.6, rimPx: 4});
	hallCard = new Live(hallSt, 'card', 960, 800, 420, 160, HZ.card, {}, 1.5);

	hallDust = new Motes(hallSt, 140, 'dust', -200, 6, '#C9CED2', false);
	hallCrowd = new Live(hallSt, 'crowd', 960, 770, 2700, 620, HZ.crowd, {rim: 1.0, rimPx: 6}, 0.8);
};
const N = {cut: b(9), passA: b(10), hallA: b(10.25), out: b(10.75), card: b(11), pane: b(11.5), paneZ: b(11.75)};
/** the queue steps forward on each beat b9 → b10 (time-lapse), shuffles slowly after */
const qStep = (t: number) => { const bt = (t - N.cut) / BEAT; if (bt < 0) return bt * 0.25; const n = Math.floor(Math.min(bt, 4)), f = Math.min(bt, 4) - n; return n + easeOut(Math.min(1, f / 0.35)) + Math.max(0, bt - 4) * 0.25; };
const extZoom = (t: number) => Math.exp(lerp(Math.log(0.86), Math.log(3.2), easeInOut(clamp01((t - N.cut - 0.15) / (N.passA - N.cut - 0.15)))));   // eases in and lands on b10 (no whip)
const passZoom = (t: number) => Math.exp(lerp(Math.log(0.9), Math.log(1.45), easeInOut(clamp01((t - N.passA) / (N.hallA - N.passA)))));   // a gentle drift down the passage; cut on b10.25 into the hall
/** hall camera zoom: out of the passage (0.9 → 1), slow push to b11.5, then through the pane (scene 08's mask grows with it) */
const hallZoom = (t: number) => {
	if (t < b(10.5)) return lerp(0.9, 1.0, easeOut((t - N.hallA) / (b(10.5) - N.hallA)));
	if (t < N.pane) return lerp(1.0, 1.08, smooth((t - b(10.5)) / (N.pane - b(10.5))));
	return Math.exp(lerp(Math.log(1.08), Math.log(30), easeIn(clamp01((t - N.pane) / (N.paneZ - N.pane)))));
};
const VIS = [look('visitor'), look('visitorW')];
/** the queue on the 马道: profile visitors facing up the ramp toward the door, uneven spacing and heights, a few children;
 *  on each beat the line takes a step (walk phase), between beats they stand with their weight shifted */
const queueDraw = (g: CanvasRenderingContext2D, st: number, tot: number) => {
	const fr = st - Math.floor(st), stepping = fr > 0.001 && fr < 0.999;
	for (let j = Math.floor(st) - 1; j < Math.floor(st) + 80; j++) {
		const jit = (hash(j * 3.7) - 0.5) * 14, s0 = tot - (j + 1) * 38 + jit + st * 38, q = qAt(s0); if (!q) continue;
		const child = hash(j * 5.3) < 0.1, lk = child ? look('visitorW') : VIS[hash(j * 2.1) < 0.5 ? 0 : 1], h = child ? 30 : 41 + 9 * hash(j * 1.7);
		const pose = stepping ? walkFor(lk, fr * 0.5 + hash(j) * 0.1) : fkPose({hip: 0.655, lean: 2 + 4 * hash(j * 9.1), lt: 4 * hash(j), lk: 3, rt: -4, rk: 4, la: -4 + 8 * hash(j * 4.4), le: 12, ra: 6, re: 16 + 30 * hash(j * 6.6)});
		fillD(g, figurePaths({x: q[0], ground: q[1] + 1, h, pose, look: lk}), '#120e0b');
	}
};
/** visitors filing past right → left in front of the case, thinning out; the last leaves the frame on b10.75 */
const crowdAt = (t: number) => {
	const out: FigOpts[] = [], u0 = t - N.hallA;
	const X0 = [60, 380, 640, 930, 1180, 1430, 1700], V = [1850, 1950, 1800, 2000, 1880, 1960, 1900], HS = [480, 455, 500, 470, 492, 450, 486];
	X0.forEach((x0, i) => {
		const lk = VIS[(i * 3) % 2 ? 1 : 0], h = HS[i], xx = x0 + 260 - u0 * V[i];
		if (xx < -280 || xx > 2250) return;
		const ph = (x0 - xx) / (gaitStride('08_04', stepFor(lk)) * h) + [0, 0.31, 0.62, 0.17, 0.83, 0.46, 0.71][i], gy = 1010 + (i % 2) * 16;
		out.push(rig({x: xx, ground: gy, h, pose: walkFor(lk, ph), look: lk, flip: true}, [], () => gy, 'N visitor ' + i));
	});
	return out;
};
// the pane transition (scene 08's IN) reads its rect from here; scene 07's draw updates it from its own camera every frame
const IN08: In = {mode: 9, a: N.pane, z: N.paneZ, pt: [0.5, 0.5], dir: [0.16, 0.14], ease: (u) => u < 0.07 ? 0.74 * smooth(u / 0.07) : 0.74 + 0.26 * smooth((u - 0.07) / 0.93)};
addScene({id: '07', a: N.cut, z: N.pane, draw: (t) => {
	if (t < N.passA) {           // ---- exterior: the queue up the 马道, the warm door on the lock point; crane up toward it
		const zoom = extZoom(t), rise = 40 * smooth((t - N.cut) / (N.passA - N.cut));
		lockCam(ext, zoom, DOOR.x, DOOR.y, DOOR.z, 960, 580 + rise);
		const st = qStep(t), sp = 31;
		const tot = qLen.reduce((a, c) => a + c, 0) - 4;
		extQueue.drawW(`${Math.round(st * 40)}`, (g) => queueDraw(g, st, tot));
		ext.heroAt(DOOR.x, DOOR.y, DOOR.z, 900);
		return {st: ext, grade: {vig: 0.38, exposure: 1}, bloom: 1};
	}
	if (t < N.hallA) {           // ---- the door passage
		pass.setCam(960, 540, passZoom(t));
		return {st: pass, grade: {vig: 0.45, exposure: 1}, bloom: 1};
	}
	// ---- the hall
	const zoom = hallZoom(t), st = hallSt;
	lockCam(st, zoom, 960, 580, HZ.glass);
	const outK = clamp01((t - N.out) / 0.28), on = 1 - smooth(outK);
	const crowd = crowdAt(t), key = k30(t), cardK = smooth((t - N.card) / 0.2);
	hallCard.drawW(`${cardK.toFixed(2)}`, (g) => { g.fillStyle = '#cfc8b8'; g.fillRect(820, 752, 280, 96); g.strokeStyle = '#8a8478'; g.lineWidth = 2; g.strokeRect(826, 758, 268, 84); g.textAlign = 'center';
		if (cardK < 1) { g.globalAlpha = 1 - cardK; g.fillStyle = '#2b2a28'; g.font = '900 30px "Noto Serif CJK SC"'; g.fillText('清明上河图', 960, 796); g.font = '700 21px "Noto Serif CJK SC"'; g.fillText('北宋 · 张择端', 960, 828); }
		if (cardK > 0) { g.globalAlpha = cardK; g.fillStyle = '#cfc8b8'; g.fillRect(828, 760, 264, 80); g.fillStyle = '#2b2a28'; g.font = '900 34px "Noto Serif CJK SC"'; g.fillText('撤展回库', 960, 796); g.font = '700 22px "Noto Serif CJK SC"'; g.fillText('下次展出：未公布', 960, 830); }
		g.globalAlpha = 1; });
	hallCrowd.drawW(key, (g) => { for (const f of crowd) fillD(g, figurePaths(f)); });
	hallSilk.L.mat.uniforms.uEmissive.value = 0.32 * on;
	// your glow goes out, you stay in the case (unlit silk in the dim case)
	hallSilk.drawW(`${on.toFixed(2)}`, (g) => { g.fillStyle = '#FFF3D8'; g.fillRect(700, 545, 520, 82); const hh = riverMono.width / (520 / 82); g.drawImage(riverMono, 0, (riverMono.height - hh) / 2, riverMono.width, hh, 700, 545, 520, 82);
		g.fillStyle = 'rgba(52,80,106,0.9)'; g.fillRect(700, 545, 520, 6); g.fillRect(700, 621, 520, 6); if (on > 0) glowBlob(g, [960, 586], 330, 110, 0.35 * on);
		g.fillStyle = `rgba(30,34,38,${(0.72 * (1 - on)).toFixed(3)})`; g.fillRect(700, 545, 520, 82); });
	hallRefl.drawW(`${on.toFixed(2)}`, (g) => { glowBlob(g, [960, 900], 420, 50, 0.22 * on, '255,214,150'); });
	hallDust.update(t, [420, 260, 1500, 940], 9, 4, 0.3);
	st.heroAt(960, 586, HZ.silk, 1100 * on + 1);
	// the pane rect for scene 08's IN mask (screen uv, y up) from this camera
	const a = st.toScreen(st.at(PANE.x0, PANE.y0, HZ.glass)), c = st.toScreen(st.at(PANE.x1, PANE.y1, HZ.glass));
	IN08.pt = [((a.x + c.x) / 2) / 1920, 1 - ((a.y + c.y) / 2) / 1080]; IN08.dir = [((c.x - a.x) / 2) / 1920, ((c.y - a.y) / 2) / 1080];
	return {st, grade: {vig: 0.36, exposure: 1}, bloom: 1};
}});

// ================================================================================================ 08 · S1 (b11.5 → b13)
// CREST CR-B wide, 宋 DUSK, P-宋 gate far left: the empty stage. Seen first through the case's pane (lanterns lighting right →
// left in the dark glass), the push through the glass eases into the locked wide by b11.75. b12.0 a shadow runs right along
// the deck into the road (出); b12.5 the warm light runs left toward the palace (进). The tally draws itself (HUD).
let crestS1: Crest, s1Shade: Live, s1Light: Live, s1Boat: Live;
const LANT_ON: [number, number][] = [[1832, b(11.5)], [1600, b(11.5)], [1368, b(11.75)], [1136, b(11.75)], [904, b(12.0)], [672, b(12.0)], [440, b(12.25)], [208, b(12.25)], [-24, b(12.5)], [-256, b(12.55)], [2064, b(11.5)], [2296, b(11.5)]];
const bootS1 = async () => {
	crestS1 = new Crest('s1-dusk', {sky: 'dusk', era: '宋', lanterns: true, boat: true, bankCrowd: true}); await crestS1.ready;
	s1Boat = new Live(crestS1.st, 's1boat', 1560, 780, 700, 660, -520, {fog: ['#C9A47A', 0.22], rim: 0}, 0.6);
	s1Boat.drawW('b', (g) => fillSvg(g, boatSvg(1560, 1010, 520, 0, SIL, 5)));
	s1Shade = new Live(crestS1.st, 's1shade', 1300, 1100, 5200, 1600, 44, {}, 0.25);
	s1Light = new Live(crestS1.st, 's1light', 960, 1100, 5200, 1600, 43, {emissive: 0.55}, 0.25);
};
const deckBand = (g: CanvasRenderingContext2D, x0: number, x1: number, up: number, dn: number) => { g.beginPath(); for (let x = x0; x <= x1; x += 24) g.lineTo(x, deck(x) - up); for (let x = x1; x >= x0; x -= 24) g.lineTo(x, deck(x) + dn); g.closePath(); };
addScene({id: '08', a: N.pane, z: b(13), in: IN08, draw: (t) => {
	const st = crestS1.st;
	// camera: inside the pane it starts low and wide (the lanterns sit in the glass), easing into the CR-B rest by b11.75
	const k = easeOut(clamp01((t - N.pane) / (N.paneZ - N.pane)));
	st.setCam(960, lerp(745, 540, k), Math.exp(lerp(Math.log(0.74), 0, k)));
	crestS1.setLanterns((i, x) => { const r = LANT_ON.find(([lx]) => Math.abs(lx - x) < 60); const at = r ? r[1] : b(12.6); return smooth((t - at) / 0.12); });
	crestS1.setBoat(1640, 0); crestS1.setStreak(0, 0, t);
	// b12.0 → b12.45: the shadow runs right along the deck into the road; b12.5 → b12.95: the light runs left to the palace
	const sh = clamp01((t - b(12)) / (b(12.45) - b(12))), lt = clamp01((t - b(12.5)) / (b(12.95) - b(12.5)));
	s1Shade.drawW(`${sh.toFixed(3)}`, (g) => { if (sh <= 0) return; const xe = lerp(960, 3400, easeInOut(sh));
		const gr = g.createLinearGradient(960, 0, xe, 0), L = xe - 960, a0 = clamp01(260 / L), a1 = clamp01(1 - 140 / L); gr.addColorStop(0, 'rgba(12,9,7,0)'); if (a1 > a0) { gr.addColorStop(a0, 'rgba(12,9,7,0.4)'); gr.addColorStop(a1, 'rgba(12,9,7,0.4)'); } gr.addColorStop(1, 'rgba(12,9,7,0)');
		g.fillStyle = gr; deckBand(g, 960, xe, 175, 320); g.fill(); });
	s1Light.drawW(`${lt.toFixed(3)}`, (g) => { if (lt <= 0) return; const xe = lerp(960, -1500, easeInOut(lt));
		const L = 960 - xe, gr = g.createLinearGradient(xe, 0, 960, 0); gr.addColorStop(0, 'rgba(255,200,130,0)'); gr.addColorStop(clamp01(50 / L), 'rgba(255,222,160,0.62)'); gr.addColorStop(clamp01(200 / L), 'rgba(255,196,128,0.26)'); gr.addColorStop(clamp01(1 - 260 / L), 'rgba(255,190,120,0.2)'); gr.addColorStop(1, 'rgba(255,190,120,0)');
		g.fillStyle = gr; deckBand(g, xe, 960, 6, 10); g.fill(); g.save(); g.translate(0, -150); g.globalAlpha = 0.7; deckBand(g, xe, 960, 6, 6); g.fill(); g.restore(); });
	st.setHero(-9999, 0, 1);
	// dusk luma 75–100: dim the world layers (not the lanterns or the running light) with their tint, not the exposure
	const keep = new Set([crestS1.lanternsLive.L.mat, crestS1.glowLive.L.mat, s1Light.L.mat]);
	for (const m of st.mats) if (!keep.has(m)) m.uniforms.uTint.value.setRGB(0.82, 0.81, 0.79);
	const tr = t < N.paneZ;
	return {st, grade: {vig: 0.32, exposure: 1}, bloom: 1, hud: tr ? (hud) => glassLine(hud, t) : undefined};
}});
/** the glass: one thin highlight line crossing the pane as the camera pushes through it (under the subtitles) */
const glassLine = (hud: HTMLElement, t: number) => {
	const u = clamp01((t - N.pane) / (N.paneZ - N.pane)), [px, py] = IN08.pt!, [hx, hy] = IN08.dir!;
	const x0 = (px - hx) * 1920, y0 = (1 - py - hy) * 1080, w = hx * 2 * 1920, h = hy * 2 * 1080, pos = lerp(18, 112, easeIn(u)), a = 0.55 * (1 - smooth((u - 0.8) / 0.2));
	hud.insertAdjacentHTML('afterbegin', `<div style="position:absolute;left:${x0.toFixed(1)}px;top:${y0.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;overflow:hidden;pointer-events:none;` +
		`background:radial-gradient(ellipse 18% 26% at ${(30 - 12 * u).toFixed(1)}% 34%, rgba(196,206,214,${(0.1 * (1 - u)).toFixed(3)}), rgba(196,206,214,0) 100%), radial-gradient(ellipse 14% 22% at ${(78 + 10 * u).toFixed(1)}% 30%, rgba(196,206,214,${(0.07 * (1 - u)).toFixed(3)}), rgba(196,206,214,0) 100%), linear-gradient(112deg, rgba(255,246,230,0) ${pos - 6}%, rgba(255,246,230,${(a * 0.18).toFixed(3)}) ${pos - 2}%, rgba(255,248,236,${a.toFixed(3)}) ${pos}%, rgba(255,246,230,${(a * 0.18).toFixed(3)}) ${pos + 0.8}%, rgba(255,246,230,0) ${pos + 5}%)"></div>`);
};
