// Scenes 32–37, the ending (b64 → 184.30):
//  32  E3 beat cuts: 偷 / 换 / 藏 re-render scenes 04 / 03 / 18 (glow on the lock point, 3–4-frame directional smears), then
//      抄: your one glowing copy on the lock point pulls back to the WALL of ~100 grey copies; push into it → iris.
//  33  E4 flip-book on the crest (CR-C, T2's framing): 宋 fire (cart) · 元 night (权贵) · 明 night (eunuch) · 1923 snow
//      (bundle), one per beat, your glow held on the lock point; b67 the camera stops, the 1923 carrier leaves right.
//  34  daybreak (light-edged wipe between matched stages): the standing crowd loses its hats; today's visitors walk left,
//      the camera trucks with them; the gate's masonry wall slides across (foreground wipe) into the 午门 hall, where you
//      lie open in the case and the queue files past behind it, looking in. Nobody carries you.
//  35  the hall empties and the lights die row by row; two staff roll you up; you are laid in a storage box and the lid
//      comes down (a hand on it); the closed box on a shelf in the storage aisle, glow at its seams, slow pull-back.
//  36  rectangle match: the box face → the empty case; the card 撤展回库 / 下次展出：未公布; slow push.
//  37  reverse crane out through the warm-lit gate passage, rising over the empty 马道 ramp; the Juno end card, Q types
//      into its slot on b76.5.
import {Stage, Live, Motes, D, W, H, bar, BEAT, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas, svgDoc, svgToCanvas, hash} from './core';
import {addScene, SCENES, Frame, In, LINES} from './film';
import {Crest, deck, fillSvg} from './crest';
import {Cast, look, drawRoll, drawFig, glowBlob, rig, Contact, drawCarriedRoll} from './actors';
import {POSES, FigOpts, Pose, P, LookQ, gaitPose, gaitStride, walkFor, stepFor, underArm, underArmRoll, armsFrom, carryArmful, armfulAt, toScreen, mixPose, figurePaths} from './figures';
import {paintSection} from './silk';
import {SIL, skyline, roof as roofSvg, hall as hallSvg} from './draw';
import {endCard} from './hud';
import {lockCam, robeSafe, bowUpper, armPaths} from './s_teaser';

const b = bar;
const k30 = (t: number) => `${Math.round(t * 30)}`;
const fillD = (g: CanvasRenderingContext2D, ds: string[], col = SIL) => { g.fillStyle = col; for (const d of ds) g.fill(new Path2D(d)); };
const booted = (grp: string) => { const o = (window as any).ONLY as string[] | undefined; return !o || o.includes(grp); };
/** the camera centre (frame px at depth 0) that puts world (wx, wy) at depth z on screen (sx, sy) at this zoom (lockCam's maths) */
const lockAt = (zoom: number, wx: number, wy: number, z: number, sx = 960, sy = 580): [number, number] => {
	const d = D / zoom; return [960 + ((wx - 960) * (D - z) - (sx - 960) * (d - z)) / D, 540 - ((540 - wy) * (D - z) - (540 - sy) * (d - z)) / D];
};
/** extra walked time for a carrier who quickens his step from t0 (k = extra rate, eased in over `ramp` s) */
const quicken = (t: number, t0: number, k: number, ramp: number) => { const u = Math.max(0, t - t0); return k * (u < ramp ? (u * u) / (2 * ramp) : u - ramp / 2); };
/** world dims, practicals keep their light (uTint on every layer but the kept ones) */
const dimWorld = (st: Stage, k: number, keep: Set<any> = new Set(), warm = [1, 1, 1]) => { for (const m of st.mats) { if (keep.has(m)) m.uniforms.uTint.value.setRGB(1, 1, 1); else m.uniforms.uTint.value.setRGB(k * warm[0], k * warm[1], k * warm[2]); } };
const P2 = (a: P, c: P, u: number): P => [lerp(a[0], c[0], u), lerp(a[1], c[1], u)];

let riverMono: HTMLCanvasElement & {silk: any}, riverGrey: HTMLCanvasElement & {silk: any};

// ================================================================================================ boot
export const bootEnd = async () => {
	try {      // a failure here must not stop the rest of the film from booting
		riverMono = paintSection('river', {width: 2048, height: 768, mode: 'mono', seed: 43});
		riverGrey = paintSection('river', {width: 2048, height: 768, mode: 'grey', seed: 43});
		await Promise.all([bootWall(), bootFlip(), bootToday(), bootHall(), bootAisle(), bootExt()]);
	} catch (e: any) { console.error('BOOT end', e?.message || e, e?.stack); }
};

// ================================================================================================ 32 · E3 beat cuts
// 偷 / 换 / 藏: earlier shots re-rendered from their own scene functions (glow on the lock point), each arriving with a 3–4-
// frame directional smear whose switch lands on the beat. If a module isn't booted (dev runs), a flip-book era stands in.
const reRender = (id: string, tt: number, fallback: () => Frame, after?: (f: Frame) => void): Frame => {
	const s = SCENES.find((q) => q.id === id);
	if (s) { try { const f = s.draw(tt); after?.(f); return {st: f.st, grade: f.grade, bloom: f.bloom}; } catch (e) { /* module not booted */ } }
	return fallback();
};
/** translate a frame's camera so the world point (wx, wy, z) lands on the lock point (no rotation, no zoom change) */
const nudgeTo = (st: Stage, wx: number, wy: number, z: number, sx = 960, sy = 580, k = 1) => {
	const s = st.toScreen(st.at(wx, wy, z)), c = st.cam, d = c.position.z - z;
	c.position.x += ((s.x - sx) * d / D) * k; c.position.y -= ((s.y - sy) * d / D) * k; c.updateMatrixWorld(true);
};
/** an in-transition: smear that switches on the beat `at` (k = 0.5 there); `pre` s before it, `post` s after */
const smearIn = (at: number, pre: number, post: number, dir: [number, number]): In => ({mode: 10, a: at - pre, z: at + post, dir,
	ease: (u) => { const m = pre / (pre + post); return u < m ? 0.5 * (u / Math.max(1e-6, m)) : 0.5 + 0.5 * (u - m) / (1 - m); }});
const fallbackEra = (e: number, t: number) => () => flipDraw(eraT0(e) + 0.05 + (((t - b(64)) % 0.25) + 0.25) % 0.25, e);
addScene({id: '32a', a: b(64), z: b(64.25) - 0.05, in: booted('resto') ? smearIn(b(64), 0, 0.11, [1, 0]) : undefined,
	draw: (t) => reRender('04', b(6.3) + (t - b(64)), fallbackEra(2, t))});
addScene({id: '32b', a: b(64.25) - 0.05, z: b(64.5) - 0.05, in: smearIn(b(64.25), 0.05, 0.07, [1, 0]),
	draw: (t) => reRender('03', 12.2 + (t - b(64.25)) * 0.7, fallbackEra(1, t))});
addScene({id: '32c', a: b(64.5) - 0.05, z: b(64.75) - 0.05, in: smearIn(b(64.5), 0.05, 0.07, [1, 0]),
	draw: (t) => reRender('18', b(30.36) + (t - b(64.5)) * 0.82, fallbackEra(3, t), (f) => nudgeTo(f.st, 1540, 640, -315))});

// ------------------------------------------------------------------------------------------------ WALL (抄)
// a long gallery wall (#3E454A, warm picture-light spill): four slanted shelves of grey copies lying half-open, each a grey
// 虹桥 (~100 in frame), one glowing — yours — on the lock point.
let wallSt: Stage, wallYou: Live, wallHalo: Live;
const WROWS = [478, 608, 738, 868], WPITCH = 80, WX0 = -313, WN = 33;
/** a half-open copy on a slanted shelf: the unrolled panel (facing us) and the roll standing at its right end */
const copyAt = (g: CanvasRenderingContext2D, cx: number, yb: number, art: HTMLCanvasElement, grey: boolean, seed: number) => {
	const x0 = cx - 34, x1 = cx + 20, y0 = yb - 50, y1 = yb - 12, lean = 5;
	g.save(); g.beginPath(); g.moveTo(x0, y1); g.lineTo(x1, y1); g.lineTo(x1 + lean, y0); g.lineTo(x0 + lean, y0); g.closePath(); g.clip();
	g.fillStyle = grey ? '#8f8b83' : '#FFF3D8'; g.fillRect(x0 - 2, y0 - 2, x1 - x0 + lean + 4, y1 - y0 + 4);
	const br = art.silk?.bridge ?? {x: art.width * 0.35, y: art.height * 0.2, w: art.width * 0.3, h: art.height * 0.5};
	const sw = br.w * (1.1 + 0.25 * hash(seed)), sh = sw * (y1 - y0) / (x1 - x0), sx = br.x + br.w / 2 - sw / 2 + (hash(seed * 3) - 0.5) * br.w * 0.2, sy = br.y + br.h * 0.45 - sh / 2;
	g.globalAlpha = grey ? 0.85 : 0.92; g.drawImage(art, sx, sy, sw, sh, x0, y0, x1 - x0 + lean, y1 - y0); g.globalAlpha = 1;
	g.fillStyle = grey ? 'rgba(78,82,86,0.9)' : 'rgba(52,80,106,0.9)'; g.fillRect(x0, y0, x1 - x0 + lean, 3); g.fillRect(x0, y1 - 3, x1 - x0 + lean, 3);
	g.restore();
	g.fillStyle = grey ? '#4a4e54' : '#34506A'; g.fillRect(x0 - 2, y0 + 1, 3, y1 - y0 - 1);                               // the free end's stick
	const gr = g.createLinearGradient(x1 - 2, 0, x1 + 14, 0);                                                          // the roll, standing
	if (grey) { gr.addColorStop(0, '#6A665F'); gr.addColorStop(0.45, '#ABA69C'); gr.addColorStop(1, '#55524C'); } else { gr.addColorStop(0, '#E2B979'); gr.addColorStop(0.45, '#FFF3D8'); gr.addColorStop(1, '#D6A866'); }
	g.fillStyle = gr; g.beginPath(); g.roundRect(x1 - 2, y0 - 6, 16, y1 - y0 + 10, 5); g.fill();
	g.fillStyle = grey ? '#4a4e54' : '#34506A'; g.fillRect(x1 - 2, y0 - 6, 16, 4); g.fillRect(x1 - 2, y1, 16, 4);
	g.fillStyle = grey ? '#9A968E' : '#EADCC0'; g.beginPath(); g.ellipse(x1 + 6, y0 - 8, 6, 3, 0, 0, Math.PI * 2); g.fill();
};
const bootWall = async () => {
	const st = wallSt = new Stage('wall32');
	st.add('wall', canvasTex(gradCanvas([[0, '#343a3f'], [0.3, '#3c4348'], [0.65, '#3E454A'], [1, '#33383c']])), 960, 560, 7000, 3600, -500);
	const c = mkCanvas(3000, 820), g = c.getContext('2d')!, OX = -540, OY = 300, X = (x: number) => x - OX, Y = (y: number) => y - OY;
	g.translate(-OX, -OY);
	// the shelving: back panel, uprights every four copies, slanted ledges
	g.fillStyle = '#353b40'; g.fillRect(OX, 392, 3000, 500);
	for (let i = 0; i <= WN; i += 4) { const x = WX0 + i * WPITCH - 44; g.fillStyle = '#1f2326'; g.fillRect(x - 6, 384, 12, 506); }
	g.fillStyle = '#1f2326'; g.fillRect(OX, 384, 3000, 14);
	for (const yb of WROWS) { g.fillStyle = '#262a2e'; g.fillRect(OX, yb - 12, 3000, 14); g.fillStyle = '#4c5257'; g.fillRect(OX, yb - 12, 3000, 2); g.fillStyle = '#1a1d20'; g.fillRect(OX, yb + 2, 3000, 6); }
	// the copies (yours is left out: it lives on its own glowing layer)
	for (let r = 0; r < WROWS.length; r++) for (let i = 0; i < WN; i++) { const cx = WX0 + i * WPITCH; if (r === 1 && Math.abs(cx - 967) < 2) continue; copyAt(g, cx + (hash(i * 7 + r) - 0.5) * 6, WROWS[r], riverGrey, true, i * 13 + r * 5); }
	// warm spill from the picture lights on the shelving's top rail
	for (const lx of [200, 1000, 1800]) { const gr = g.createRadialGradient(lx, 420, 0, lx, 520, 520); gr.addColorStop(0, 'rgba(255,196,128,0.22)'); gr.addColorStop(0.5, 'rgba(255,190,120,0.08)'); gr.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = gr; g.fillRect(lx - 600, 392, 1200, 520); }
	g.fillStyle = '#16191b'; for (const lx of [200, 1000, 1800]) { g.fillRect(lx - 40, 372, 80, 12); g.fillRect(lx - 3, 360, 6, 14); }
	void X; void Y;
	st.add('shelves', canvasTex(c), OX + 1500, OY + 410, 3000, 820, 0, {rim: 0});
	const lamps = new Live(st, 'lamps', 1000, 380, 2400, 40, 1, {emissive: 1.1}, 1);
	lamps.drawW('l', (q) => { for (const lx of [200, 1000, 1800]) { q.fillStyle = '#FFB868'; q.fillRect(lx - 34, 382, 68, 4); glowBlob(q, [lx, 386], 60, 10, 0.4, '255,184,104'); } });
	st.add('floor', canvasTex(gradCanvas([[0, '#2c3034'], [1, '#1c1f22']])), 960, 1200, 7000, 640, -200);
	wallYou = new Live(st, 'you', 980, 580, 200, 160, 2, {emissive: 0.32}, 4);
	wallYou.drawW('y', (q) => copyAt(q, 967, WROWS[1], riverMono, false, 7));
	wallHalo = new Live(st, 'halo', 960, 580, 600, 400, 3, {emissive: 1.0}, 0.5);
};
const wallCam = (t: number) => {
	const t0 = b(64.75), t1 = b(65.0) + 0.15, t2 = b(65.75), t3 = b(65.9) + 0.12;
	if (t < t0) return 5.6;
	if (t < t1) return Math.exp(lerp(Math.log(5.6), 0, easeOut((t - t0) / (t1 - t0))));
	if (t < t2) return lerp(1, 1.05, smooth((t - t1) / (t2 - t1)));
	return Math.exp(lerp(Math.log(1.05), Math.log(9), easeIn(clamp01((t - t2) / (t3 - t2)))));
};
const drawWall = (t: number): Frame => {
	const st = wallSt, z = wallCam(t);
	lockCam(st, z, 960, 580, 2, 960, 580 - 10 * smooth((t - b(65)) / (b(65.75) - b(65))));
	const push = clamp01((t - b(65.75)) / (b(65.9) + 0.12 - b(65.75)));
	wallHalo.draw(`${push.toFixed(2)}`, (q) => { q.translate(-660, -380); glowBlob(q, [960, 580], 90 + 60 * push, 60 + 40 * push, 0.38 + 0.25 * push); });
	st.heroAt(960, 580, 2, 600);
	return {st, grade: {vig: 0.36, vigCol: '#100c0a', corners: 0.7, cornersTop: 0, cornersBand: [0, 305, 520, 1]}, bloom: 1};
};
addScene({id: '32d', a: b(64.75) - 0.05, z: b(65.9), in: smearIn(b(64.75), 0.05, 0.07, [1, 0]), draw: drawWall});

// ================================================================================================ 33 · E4 flip-book
const FH = 420, FZOOM = 1.12;
const LK = {song: look('refugee'), yuan: look('yuanNoble'), ming: look('mingEunuch'), youth: look('youth1923')};
const eraT0 = (e: number) => b(66 + 0.25 * e);
type EraSet = {crest: Crest; cast: Cast; prop: Live; glow: Live; arms?: Live; crowd?: Cast};
const ERAS: EraSet[] = [];
let OFF_UA: Record<string, P> = {}, OFF_BUNDLE: P = [0, 0];
/** today's light, the daybreak camera both matched stages share (b67.5 → b68.5) */
const CAM_DB: [number, number, number] = [200, 660, 1.0];
// the standing crowd on the bridge (1923: gowns, Qing caps; after the daybreak: today's visitors) — same places, same sizes
const CROWD = [{x: -170, h: 410}, {x: 70, h: 398}, {x: 300, h: 425}, {x: 342, h: 262, child: true}, {x: 560, h: 404}, {x: 790, h: 412}, {x: 1030, h: 420}];
const L1923: LookQ[] = [{head: 'qingcap', dress: 'robe', sleeves: 'narrow', surcoat: true}, {head: 'guapi', dress: 'gown', sleeves: 'narrow'}, {head: 'qingcap', dress: 'robe', sleeves: 'narrow', beard: 'moustache'},
	{head: 'guapi', dress: 'gown', sleeves: 'narrow', build: 0.9}, {head: 'guapi', dress: 'gown', sleeves: 'narrow', build: 1.05}, {head: 'qingcap', dress: 'robe', sleeves: 'narrow', surcoat: true, beard: 'short'}, {head: 'guapi', dress: 'gown', sleeves: 'narrow'}];
const deckFar = (x: number) => deck(x) - 6;
const bootFlip = async () => {
	const defs: [string, any][] = [['e4-song', {sky: 'fire', era: '宋', lanterns: true, boat: false, bankCrowd: true, embers: true}], ['e4-yuan', {sky: 'night', era: '元', lanterns: true, boat: false, bankCrowd: false}],
		['e4-ming', {sky: 'night', era: '明', lanterns: true, boat: false, bankCrowd: false}], ['e4-1923', {sky: 'snow', era: '1923', lanterns: true, boat: false, bankCrowd: true, snow: true}]];
	const crests = defs.map(([n, o]) => new Crest(n, o)); await Promise.all(crests.map((c) => c.ready));
	crests.forEach((crest, e) => {
		const st = crest.st, s: EraSet = {crest, cast: new Cast(st, 'e4cast', 1000, 700, 3200, 1000, 20), prop: new Live(st, 'e4prop', 1000, 700, 3200, 1000, 23, {rim: 0.3}, 1), glow: new Live(st, 'e4glow', 1000, 700, 3200, 1000, 24, {emissive: 1.0}, 0.4)};
		if (e === 0) st.get('sunglow').mat.uniforms.uOpacity.value = 0.8;
		if (e === 3) {
			s.arms = new Live(st, 'e4arms', 1000, 700, 3200, 1000, 23.5, {rim: 1.0, rimPx: 5}, 1);
			s.crowd = new Cast(st, 'e4crowd', 900, 700, 3400, 1000, 10, {rim: 0.7, rimPx: 4});
			st.get('sunglow').mat.uniforms.uOpacity.value = 0.22;
			const fw = new Live(st, 'farWin', 960, 850, 8400, 200, -2540, {emissive: 0.9}, 0.5);
			fw.drawW('w', (g) => { for (let i = 0; i < 60; i++) { const x = -1600 + i * 75 + hash(i * 3.3) * 50, y = 818 + hash(i * 7.1) * 26; if (hash(i * 1.9) < 0.35) continue; g.fillStyle = `rgba(255,184,104,${0.55 + 0.3 * hash(i)})`; g.fillRect(x, y, 9 + (i % 3) * 3, 6 + (i % 2) * 2); } });
			const dk = new Live(st, 'deckSnow', 960, 1100, 4800, 1600, 1, {}, 0.35);
			dk.drawW('s', (g) => { g.fillStyle = '#C9D2D8'; g.beginPath(); const xs: number[] = []; for (let x = -1300; x <= 3200; x += 20) xs.push(x);
				xs.forEach((x, i) => (i ? g.lineTo(x, deck(x) - 6 - 2 * Math.sin(x * 0.05)) : g.moveTo(x, deck(x) - 6))); for (const x of xs.slice().reverse()) g.lineTo(x, deck(x) + 3); g.closePath(); g.fill(); });
		}
		ERAS.push(s);
	});
	const mean = (f: (u: number) => P): P => { let sx = 0, sy = 0; for (let i = 0; i < 16; i++) { const p = f(i / 16); sx += p[0] / 16; sy += p[1] / 16; } return [sx, sy]; };
	for (const k of ['yuan', 'ming'] as const) OFF_UA[k] = mean((u) => { let p = robeSafe(walkFor(LK[k], u)); p = armsFrom(p, underArm(p), 'R'); const [a, c] = underArmRoll(p, 'R', 0.29); return [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]; });
	OFF_BUNDLE = mean((u) => armfulAt(carryArmful(robeSafe(walkFor(LK.youth, u)))).c);
};
// ---- the 宋 refugee handcart (you in its bed, nobody's hand on you)
type Cart = {ax: number; ay: number; r: number; ang: number; bed: (s: number, up?: number) => P; hand: P};
const cartGeo = (ax: number, groundY: number, hand: P, h: number): Cart => {
	const r = 0.15 * h, ay = groundY - r + 2, piv: P = [ax, ay - r * 0.25], ang = Math.atan2(hand[1] - piv[1], hand[0] - piv[0]), ca = Math.cos(ang), sa = Math.sin(ang);
	return {ax, ay, r, ang, hand, bed: (s, up = 0) => [piv[0] + ca * s * h + sa * up * h, piv[1] + sa * s * h - ca * up * h]};
};
const wheel = (g: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, col = SIL) => {
	g.strokeStyle = col; g.lineWidth = r * 0.16; g.beginPath(); g.arc(x, y, r * 0.92, 0, Math.PI * 2); g.stroke(); g.lineWidth = r * 0.07;
	for (let i = 0; i < 6; i++) { const a = rot + (i * Math.PI) / 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); g.stroke(); }
	g.fillStyle = col; g.beginPath(); g.arc(x, y, r * 0.16, 0, Math.PI * 2); g.fill();
};
const poly = (g: CanvasRenderingContext2D, pts: P[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); g.fill(); };
const cartBack = (g: CanvasRenderingContext2D, c: Cart, h: number) => {
	wheel(g, c.ax + 0.05 * h, c.ay - 0.012 * h, c.r * 0.96, c.ax / c.r, '#120d0a');
	const B = c.bed; poly(g, [B(-0.3, 0), B(0.36, 0), B(0.36, 0.035), B(-0.3, 0.035)], SIL);
	g.strokeStyle = SIL; g.lineWidth = 0.022 * h; g.lineCap = 'round'; g.beginPath(); g.moveTo(...B(0.3, 0.02)); g.lineTo(c.hand[0], c.hand[1]); g.stroke();
	poly(g, [B(-0.3, 0.03), B(-0.27, 0.03), B(-0.27, 0.15), B(-0.3, 0.15)], SIL);
	for (const [s, rr, up] of [[-0.24, 0.07, 0.1], [0.27, 0.065, 0.1]] as [number, number, number][]) { const p = B(s, up); g.fillStyle = '#1d1712'; g.beginPath(); g.ellipse(p[0], p[1], rr * h, rr * h * 0.72, c.ang, 0, Math.PI * 2); g.fill(); }
};
const cartFront = (g: CanvasRenderingContext2D, c: Cart, h: number) => {
	const B = c.bed; poly(g, [B(-0.3, 0.0), B(0.36, 0.0), B(0.36, 0.085), B(-0.3, 0.085)], '#17110d');
	wheel(g, c.ax, c.ay, c.r, c.ax / c.r);
};
/** a cloth bundle (包袱) hugged to the chest: soft cloth over a long box, knotted on top; your light seeps through */
const clothBundle = (g: CanvasRenderingContext2D, c: P, r: number) => {
	const w = r * 2.9, h = r * 2.0, x0 = c[0] - w / 2, y0 = c[1] - h / 2;
	const gr = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], w * 0.6); gr.addColorStop(0, '#B8874E'); gr.addColorStop(0.55, '#6E4E30'); gr.addColorStop(1, '#3a2a1e');
	g.fillStyle = gr; g.beginPath(); g.roundRect(x0, y0, w, h, h * 0.42); g.fill();
	g.strokeStyle = 'rgba(30,22,16,0.7)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0 + w * 0.18, y0 + 3); g.quadraticCurveTo(c[0], c[1] + h * 0.1, x0 + w * 0.86, y0 + h - 4); g.stroke();
	g.fillStyle = '#4a3524'; g.beginPath(); g.ellipse(c[0] - 6, y0 - 2, 9, 6, -0.5, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(c[0] + 9, y0 - 4, 10, 6, 0.6, 0, Math.PI * 2); g.fill();
};
/** walk parameter and x of the carrier in era e at t (1923 quickens his step after b67) */
const eraWalk = (e: number, t: number, lk: LookQ) => {
	const extra = e === 3 ? quicken(t, b(67), 0.75, 0.3) : 0, u = (t - eraT0(e) + 0.25 + extra) / (2 * BEAT);
	const x0 = e === 0 ? 1150 : e === 3 ? 760 : 700;
	return {u, x: x0 + u * gaitStride('08_04', stepFor(lk)) * FH};
};
type EraPose = {figs: FigOpts[]; glowC: P; target: P; draw: (g: CanvasRenderingContext2D) => void; front?: (g: CanvasRenderingContext2D) => void; arms?: FigOpts};
const eraPose = (e: number, t: number): EraPose => {
	if (e === 0) {
		const lk = LK.song, {u, x} = eraWalk(0, t, lk), o: FigOpts = {x, ground: deck(x), h: FH, pose: walkFor(lk, u), look: lk};
		const hand = toScreen(o, [-0.02, 0.54]), ax = x - 0.92 * FH, cg = cartGeo(ax, deck(ax), [hand[0] - 2, hand[1] + 2], FH);
		const f = rig(o, [{side: 'R', target: [hand[0] - 2, hand[1] + 2], name: 'shaft'}, {side: 'L', target: [hand[0] - 9, hand[1] + 4], name: 'shaft'}], deck, 'E4 宋 puller');
		const you: [P, P] = [cg.bed(-0.2, 0.085), cg.bed(0.2, 0.095)], c = P2(you[0], you[1], 0.5);
		return {figs: [f], glowC: c, target: c, draw: (g) => { cartBack(g, cg, FH); drawFig(g, f); }, front: (g) => { drawRoll(g, you[0], you[1], 0.03 * FH, 1); cartFront(g, cg, FH); }};
	}
	if (e === 1 || e === 2) {
		const k = e === 1 ? 'yuan' : 'ming', lk = LK[k], {u, x} = eraWalk(e, t, lk); let p = robeSafe(walkFor(lk, u)); p = armsFrom(p, underArm(p), 'R');
		const f = rig({x, ground: deck(x), h: FH, pose: p, look: lk}, [], deck, `E4 ${k} carrier`);
		const [r0, r1] = underArmRoll(f.pose, 'R', 0.29), c = P2(toScreen(f, r0), toScreen(f, r1), 0.5), off = OFF_UA[k];
		return {figs: [f], glowC: c, target: [x + off[0] * FH, deck(x) - off[1] * FH], draw: (g) => drawFig(g, f), front: (g) => { drawCarriedRoll(g, f, `E4 ${k} carrier`, 'R', 0.29, 13 * FH / 520, 1); }};
	}
	const lk = LK.youth, {u, x} = eraWalk(3, t, lk), base = carryArmful(robeSafe(walkFor(lk, u))), a = armfulAt(base), o: FigOpts = {x, ground: deck(x), h: FH, pose: base, look: lk};
	const R = toScreen(o, [a.c[0] + 0.03, a.c[1] - a.r - 0.014]), L = toScreen(o, [a.c[0] + a.r + 0.008, a.c[1] + 0.012]);
	const f = rig(o, [{side: 'R', target: R, name: 'R under bundle', opt: {dir: 12}}, {side: 'L', target: L, name: 'L round bundle', opt: {dir: -78}}], deck, 'E4 1923 youth');
	const c = toScreen(f, a.c), r = a.r * FH;
	return {figs: [f], glowC: c, target: [x + OFF_BUNDLE[0] * FH, deck(x) - OFF_BUNDLE[1] * FH], draw: (g) => drawFig(g, f), front: (g) => clothBundle(g, c, r), arms: f};
};
/** the 1923 standing crowd (facing right, toward where he goes) */
const crowd1923 = () => CROWD.map((c, i) => rig({x: c.x, ground: deckFar(c.x), h: c.h, pose: POSES.stand, look: L1923[i]}, [], deckFar, `1923 crowd ${i}`));
const flipCam = (e: number, t: number, ep: EraPose): [number, number, number] => {
	const [cx, cy] = lockAt(FZOOM, ep.target[0], ep.target[1], 22);
	if (e < 3 || t < b(67)) return [cx, cy, FZOOM];
	// b67: the camera stops following you and eases back toward the bank-side framing the daybreak needs
	const ep0 = eraPose(3, b(67)), [x0, y0] = lockAt(FZOOM, ep0.target[0], ep0.target[1], 22), k = smooth(clamp01((t - b(67)) / (b(67.5) - b(67))));
	return [lerp(x0, CAM_DB[0], k), lerp(y0, CAM_DB[1], k), Math.exp(lerp(Math.log(FZOOM), Math.log(CAM_DB[2]), k))];
};
function flipDraw(t: number, eForce?: number): Frame {
	const e = eForce ?? (t < eraT0(1) ? 0 : t < eraT0(2) ? 1 : t < eraT0(3) ? 2 : 3), S = ERAS[e], st = S.crest.st, ep = eraPose(e, t);
	const [cx, cy, zm] = flipCam(e, t, ep); st.setCam(cx, cy, zm);
	const key = k30(t);
	S.cast.draw(key, [], (g) => ep.draw(g));
	S.prop.L.mat.uniforms.uEmissive.value = e === 3 ? 0.35 : 0.55;
	S.prop.drawW(key, (g) => ep.front?.(g));
	S.arms?.drawW(key, (g) => { if (ep.arms) fillD(g, armPaths(ep.arms)); });
	S.crowd?.draw('c', crowd1923());
	S.glow.drawW(key, (g) => { if (e === 3) { glowBlob(g, ep.glowC, 120, 90, 0.34); glowBlob(g, ep.glowC, 40, 30, 0.42, '255,226,170'); } else glowBlob(g, ep.glowC, e === 0 ? 130 : 95, e === 0 ? 70 : 60, 0.42); });
	S.crest.setLanterns(() => 0); S.crest.setStreak(ep.glowC[0], 0.45, t);
	S.crest.motes?.update(t, e === 3 ? [-900, -300, 3000, 1300] : [-400, 200, 2400, 1100], e === 3 ? 70 : 60, e === 3 ? 24 : 40, e === 3 ? 0.85 : 0.7);
	st.heroAt(ep.glowC[0], ep.glowC[1], 22, 430);
	return {st, grade: {vig: 0.4, exposure: 1}, bloom: 1};
}
addScene({id: '33', a: b(65.9), z: b(67.5), in: {mode: 5, a: b(65.9), z: b(66) + 0.04, pt: [0.5, 1 - 580 / 1080], soft: 0.06, ease: easeIn}, draw: (t) => flipDraw(t)});

// ================================================================================================ 34 · daybreak, today, the hall
let today: Crest, todayCast: Cast, wipeSt: Stage, wipeL: Live;
const VLOOK = {man: look('visitor'), woman: look('visitorW'), old: {head: 'short', dress: 'jacket', build: 1.04} as LookQ, child: {head: 'modern', dress: 'zip', build: 0.92, pack: 'backpack'} as LookQ,
	woman2: {head: 'ponytail', dress: 'jacket', build: 0.95} as LookQ, man2: {head: 'modern', dress: 'jacket'} as LookQ};
const TODAY_L: LookQ[] = [VLOOK.man2, VLOOK.woman, VLOOK.man, VLOOK.child, VLOOK.old, VLOOK.woman2, VLOOK.man];
const bootToday = async () => {
	today = new Crest('e5-today', {sky: 'day', era: '1950', lanterns: false, boat: true, bankCrowd: true}); await today.ready;
	todayCast = new Cast(today.st, 'e5cast', 900, 700, 5200, 1000, 10, {rim: 0});
	// the far-bank gate's open passage, warm-lit (no plaque), and the near banks continued below the frame
	const gp = new Live(today.st, 'gatePass', -300, 800, 200, 160, -2590, {emissive: 0.5}, 2, -1990);
	gp.draw('g', (g) => { const cx = 100, base = 140, w = 52, h = 94; const arch = (s: number, oy = 0) => { g.beginPath(); g.moveTo(cx - w * s / 2, base - oy); g.lineTo(cx - w * s / 2, base - oy - h * s + w * s / 2); g.arc(cx, base - oy - h * s + w * s / 2, w * s / 2, Math.PI, 0); g.lineTo(cx + w * s / 2, base - oy); g.closePath(); };
		const gr = g.createLinearGradient(0, base - h, 0, base); gr.addColorStop(0, '#6a4526'); gr.addColorStop(1, '#a8703c'); g.fillStyle = gr; arch(1); g.fill(); g.fillStyle = '#E9D9B0'; arch(0.46, 6); g.fill(); });
	// the masonry wipe: an overlay stage (screen px) with the gate wall in cross-section
	wipeSt = new Stage('e5wipe'); wipeSt.clearAlpha = 0;
	wipeL = new Live(wipeSt, 'wall', 960, 540, W, H, 0, {}, 0.5);
};
/** the gate wall in cross-section, its passage-side jamb at x = edge (screen px); side 'R' = the wall lies left of the edge */
const masonry = (g: CanvasRenderingContext2D, x0: number, x1: number) => {
	if (x1 <= x0) return;
	const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#644036'); gr.addColorStop(0.5, '#6e4638'); gr.addColorStop(1, '#5f3c33');
	g.fillStyle = gr; g.fillRect(x0, -20, x1 - x0, 1120);
	g.fillStyle = 'rgba(40,18,12,0.35)'; for (let y = 18; y < 1080; y += 38) g.fillRect(x0, y, x1 - x0, 3);
	for (let r = 0; r < 29; r++) for (let x = x0 + ((r % 2) * 46) - 92; x < x1; x += 92) if (x > x0) g.fillRect(x, 21 + r * 38, 3, 35);
	// the jambs: dressed stone edges, the passage side warm-lit
	for (const [ex, s] of [[x0, 1], [x1, -1]] as [number, number][]) { const jg = g.createLinearGradient(ex, 0, ex + s * 70, 0); jg.addColorStop(0, '#b08a62'); jg.addColorStop(0.4, '#8c6a4c'); jg.addColorStop(1, 'rgba(110,58,44,0)'); g.fillStyle = jg; g.fillRect(Math.min(ex, ex + s * 70), -20, 70, 1120);
		g.fillStyle = 'rgba(255,200,140,0.18)'; g.fillRect(s > 0 ? ex : ex - 10, -20, 10, 1120); }
};
const WIPE = {in0: b(68.72), in1: b(69) - 0.02, out0: b(69), out1: b(69.3)};
/** the visitors on the bridge: standing (facing the palace) until b68.25, then walking left as a queue */
const visitorsToday = (t: number) => {
	const tau = t - b(68.25), V = gaitStride('08_04', 1) * 420 / (2 * BEAT), dist = tau <= 0 ? 0 : V * (tau < 0.35 ? (tau * tau) / 0.7 : tau - 0.175), k = smooth(clamp01(tau / 0.35));
	return CROWD.map((c, i) => {
		const lk = TODAY_L[i], x = c.x - dist, u = 0.13 + i * 0.28 + dist / (gaitStride('08_04', 1) * c.h);
		const pose = k <= 0 ? POSES.stand : k >= 1 ? walkFor(lk, u) : mixPose(POSES.stand, walkFor(lk, u), k);
		return rig({x, ground: deckFar(x), h: c.h, pose, look: lk, flip: true}, [], deckFar, `E5 visitor ${i}`);
	});
};
const camToday = (t: number): [number, number, number] => { const tau = t - b(68.5), V = gaitStride('08_04', 1) * 420 / (2 * BEAT), d = tau <= 0 ? 0 : V * (tau < 0.3 ? (tau * tau) / 0.6 : tau - 0.15); return [CAM_DB[0] - d, CAM_DB[1], CAM_DB[2]]; };
const drawToday = (t: number): Frame => {
	const st = today.st, [cx, cy, zm] = camToday(t); st.setCam(cx, cy, zm);
	todayCast.draw(k30(t), visitorsToday(t));
	today.setBoat(1650 - (t - b(67.5)) * 40, 60); today.setStreak(0, 0, t); today.setLanterns(() => 0);
	st.setHero(-9999, 0, 1);
	const grade = {vig: 0.22, exposure: 1.0, corners: 1, cornersTop: 0.55, cornersBand: [0, 300, 470, 0.8] as [number, number, number, number]};
	if (t < WIPE.in0) return {st, grade, bloom: 1};
	const e = lerp(-60, 1990, easeIn(clamp01((t - WIPE.in0) / (WIPE.in1 - WIPE.in0))));
	wipeL.draw(`${Math.round(e)}`, (g) => masonry(g, -400, e));
	return {st: wipeSt, under: st, blurUnder: 0, grade, bloom: 1};
};
addScene({id: '34', a: b(67.5), z: b(69), in: {mode: 12, a: b(67.5), z: b(68), dir: [1, 0], soft: 0.07, ease: easeInOut}, draw: drawToday});

// ------------------------------------------------------------------------------------------------ the 午门 exhibition hall
// Side-on: the long case (front pane between mullions, the scroll on its bed seen through it, the plinth below), the queue
// walking left BEHIND the case (their lower bodies hidden by it), leaning to look in; ceiling spots in a soffit at the very
// top, their pools on the wall above the case. The case's central pane (x 760–1160, y 512–690) is the rectangle the storage
// box's face matches at b74.
const HZ = {wall: -800, pools: -790, ceil: -700, floor: -420, crowd: -216, inner: -215, silk: -210, card: -209, rollers: -208, glass: -200, frame: -195, box: -197, staff: -194, halo: -193};
const CASE = {x0: 240, x1: 1680, top: 494, rail: 512, pane1: 690, base: 900, mull: [600, 760, 1160, 1320], band0: 548, band1: 612, sx0: 300, sx1: 1620};
const PANE_C: P = [960, 601], PANE_W = 400;
const HG = 800;                                   // the floor line behind the case (rest px at the crowd's depth)
const FIX = [210, 510, 810, 1110, 1410, 1710];    // ceiling spots
let hallSt: Stage, hallCeil: Live, hallPools: Live, hallCrowd: Cast, hallSilk: Live, hallHalo: Live, hallCard: Live, hallRollers: Live, hallBox: Live, hallStaff: Live, hallDust: Motes, hallSconce: Live;
const bootHall = async () => {
	const st = hallSt = new Stage('e5hall');
	st.add('wall', canvasTex(gradCanvas([[0, '#30363b'], [0.25, '#3a4046'], [0.55, '#464C52'], [1, '#4b5157']])), 960, 400, 4600, 2800, HZ.wall);
	// faint wall panelling
	{ const c = mkCanvas(1150, 700), g = c.getContext('2d')!; g.fillStyle = 'rgba(30,34,38,0.45)'; for (let x = 20; x < 1150; x += 96) g.fillRect(x, 0, 2, 700); g.fillStyle = 'rgba(30,34,38,0.35)'; g.fillRect(0, 560, 1150, 3);
		st.add('panels', canvasTex(c), 960, 400, 4600, 2800, HZ.wall + 2); }
	hallPools = new Live(st, 'pools', 960, 420, 2400, 700, HZ.pools, {}, 0.4);
	hallCeil = new Live(st, 'ceil', 960, -300, 4000, 720, HZ.ceil, {emissive: 1.0}, 0.5);
	st.add('floor', canvasTex(gradCanvas([[0, '#3a3f44'], [0.25, '#30353a'], [1, '#202428']])), 960, 1150, 5000, 720, HZ.floor);
	hallCrowd = new Cast(st, 'crowd', 960, 560, 3200, 900, HZ.crowd, {rim: 1.0, rimPx: 6}, 0.8);
	// the case interior behind the front pane: dark well, the inclined bed
	{ const c = mkCanvas(1920, 1080), g = c.getContext('2d')!;
		g.fillStyle = '#23282d'; g.fillRect(CASE.x0, CASE.rail, CASE.x1 - CASE.x0, CASE.pane1 - CASE.rail);
		g.fillStyle = '#353c42'; g.beginPath(); g.moveTo(CASE.x0 + 30, 640); g.lineTo(CASE.x1 - 30, 640); g.lineTo(CASE.x1 - 46, 532); g.lineTo(CASE.x0 + 46, 532); g.closePath(); g.fill();
		g.fillStyle = '#2b3136'; g.fillRect(CASE.x0 + 30, 640, CASE.x1 - CASE.x0 - 60, 18);
		st.add('inner', canvasTex(c), 960, 540, 1920, 1080, HZ.inner, {rim: 0.2}); }
	hallSilk = new Live(st, 'silk', 960, 570, 1400, 220, HZ.silk, {emissive: 0.32}, 1.4);
	hallCard = new Live(st, 'card', 960, 582, 260, 110, HZ.card, {}, 2);
	hallCard.drawW('c', (g) => { g.fillStyle = '#20252a'; g.fillRect(944, 612, 32, 8); g.fillStyle = '#cfc8b8'; g.fillRect(862, 548, 196, 66); g.strokeStyle = '#8a8478'; g.lineWidth = 1.5; g.strokeRect(867, 553, 186, 56);
		g.fillStyle = '#2b2a28'; g.textAlign = 'center'; g.font = '900 28px "Noto Serif CJK SC"'; g.fillText('撤展回库', 960, 582); g.font = '700 16px "Noto Serif CJK SC"'; g.fillText('下次展出：未公布', 960, 603); });
	hallRollers = new Live(st, 'rollers', 960, 570, 1400, 260, HZ.rollers, {emissive: 0.2}, 1.4);
	// the front: glass sheen, top rail, mullions, plinth
	{ const c = mkCanvas(960, 540), g = c.getContext('2d')!; g.scale(0.5, 0.5);
		for (let i = 0; i < 5; i++) { const x0 = [CASE.x0, ...CASE.mull][i], x1 = [...CASE.mull, CASE.x1][i]; g.strokeStyle = 'rgba(220,230,236,0.07)'; g.lineWidth = 14; g.beginPath(); g.moveTo(x0 + 40, CASE.pane1); g.lineTo(x0 + 120, CASE.rail); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(x0 + 78, CASE.pane1); g.lineTo(x0 + 158, CASE.rail); g.stroke(); void x1; }
		st.add('glass', canvasTex(c), 960, 540, 1920, 1080, HZ.glass, {}); }
	{ const c = mkCanvas(1920, 1080), g = c.getContext('2d')!;
		g.fillStyle = '#2a2f34'; g.fillRect(CASE.x0 - 20, CASE.pane1, CASE.x1 - CASE.x0 + 40, CASE.base - CASE.pane1);
		g.fillStyle = '#3c4248'; g.fillRect(CASE.x0 - 20, CASE.pane1, CASE.x1 - CASE.x0 + 40, 6); g.fillStyle = '#1d2125'; g.fillRect(CASE.x0 - 10, CASE.base - 14, CASE.x1 - CASE.x0 + 20, 14);
		g.fillStyle = '#1b1f23'; g.fillRect(CASE.x0 - 12, CASE.top, CASE.x1 - CASE.x0 + 24, CASE.rail - CASE.top); g.fillRect(CASE.x0 - 12, CASE.top, 12, CASE.pane1 - CASE.top); g.fillRect(CASE.x1, CASE.top, 12, CASE.pane1 - CASE.top);
		for (const x of CASE.mull) g.fillRect(x - 4, CASE.rail, 8, CASE.pane1 - CASE.rail);
		g.fillStyle = 'rgba(200,210,218,0.3)'; g.fillRect(CASE.x0, CASE.rail, CASE.x1 - CASE.x0, 2);
		st.add('frame', canvasTex(c), 960, 540, 1920, 1080, HZ.frame, {rim: 0.6, rimPx: 4}); }
	hallBox = new Live(st, 'box', 400, 450, 400, 200, HZ.box, {rim: 0.5, rimPx: 3}, 3);
	hallStaff = new Live(st, 'staff', 960, 560, 2000, 900, HZ.staff, {rim: 1.0, rimPx: 6}, 1);
	hallHalo = new Live(st, 'halo', 960, 560, 1800, 500, HZ.halo, {emissive: 1.0}, 0.4);
	hallSconce = new Live(st, 'sconce', 960, 430, 3400, 200, HZ.wall + 4, {emissive: 0.9}, 0.5);
	hallSconce.drawW('s', (g) => { for (const x of [-420, 2340]) { g.fillStyle = '#1b1f23'; g.fillRect(x - 16, 400, 32, 50); g.fillStyle = '#E8D2A8'; g.fillRect(x - 10, 406, 20, 36); glowBlob(g, [x, 424], 120, 90, 0.25, '232,214,180'); } });
	hallDust = new Motes(st, 140, 'dust', -200, 6, '#C9CED2', false);
};
/** spot i's light level at t (the rows go out right → left on b72.0 → b72.25); 'out' after; 36 keeps them off */
const spotLevel = (i: number, t: number) => { const at = b(72) + (5 - i) * 0.09; return t < at ? 1 : t < at + 0.05 ? (Math.round((t - at) * 120) % 2 ? 0.4 : 0.7) : 0; };
type HallMode = {t: number; spots: (i: number) => number; you: number; card: number; crowd: FigOpts[]; wallK: number; staff?: {A: FigOpts; B: FigOpts; clipY: number; clipArms?: boolean}; rollers?: {xl: number; xr: number; lift: number; r: number}; box?: {lid: number; roll: number}};
const drawHall = (m: HallMode) => {
	const lv = FIX.map((_, i) => m.spots(i)), key = lv.map((v) => v.toFixed(2)).join(',');
	hallCeil.drawW(key, (g) => { g.fillStyle = '#1a1d21'; g.fillRect(-1100, -660, 4200, 716); g.fillStyle = '#23272b'; g.fillRect(-1100, 50, 4200, 8);
		FIX.forEach((x, i) => { g.fillStyle = '#101214'; g.fillRect(x - 28, 36, 56, 12); if (lv[i] > 0) { g.fillStyle = `rgba(255,240,214,${(0.85 * lv[i]).toFixed(2)})`; g.fillRect(x - 20, 46, 40, 5); glowBlob(g, [x, 50], 46, 14, 0.5 * lv[i], '255,236,206'); } }); });
	hallPools.drawW(key, (g) => FIX.forEach((x, i) => { if (lv[i] <= 0) return; const gr = g.createRadialGradient(x, 470, 0, x, 470, 280); gr.addColorStop(0, `rgba(236,226,206,${(0.2 * lv[i]).toFixed(3)})`); gr.addColorStop(1, 'rgba(236,226,206,0)'); g.fillStyle = gr; g.fillRect(x - 300, 120, 600, 400); }));
	const rl = m.rollers, bedOpen = !rl && !m.box && m.card <= 0 && m.you > 0, sk = rl ? `${rl.xl.toFixed(1)}:${rl.xr.toFixed(1)}:${rl.lift.toFixed(1)}` : bedOpen ? 'open' : 'none';
	hallSilk.L.mesh.visible = true; hallSilk.L.mat.uniforms.uOpacity.value = 1; hallSilk.L.mat.uniforms.uEmissive.value = 0.32 * m.you;
	hallSilk.drawW(sk, (g) => { if (!rl && !bedOpen) return; const x0 = rl ? rl.xl : CASE.sx0, x1 = rl ? rl.xr : CASE.sx1, dy = rl ? -rl.lift : 0; if (x1 - x0 < 2) return;
		g.save(); g.beginPath(); g.rect(x0, CASE.band0 + dy, x1 - x0, CASE.band1 - CASE.band0); g.clip(); g.fillStyle = '#FFF3D8'; g.fillRect(x0, CASE.band0 + dy, x1 - x0, CASE.band1 - CASE.band0);
		const hh = riverMono.width / ((CASE.sx1 - CASE.sx0) / (CASE.band1 - CASE.band0)), u0 = (x0 - CASE.sx0) / (CASE.sx1 - CASE.sx0), u1 = (x1 - CASE.sx0) / (CASE.sx1 - CASE.sx0);
		g.drawImage(riverMono, u0 * riverMono.width, (riverMono.height - hh) / 2, (u1 - u0) * riverMono.width, hh, x0, CASE.band0 + dy, x1 - x0, CASE.band1 - CASE.band0);
		g.fillStyle = 'rgba(52,80,106,0.9)'; g.fillRect(x0, CASE.band0 + dy, x1 - x0, 5); g.fillRect(x0, CASE.band1 + dy - 5, x1 - x0, 5); g.restore(); });
	hallCard.L.mat.uniforms.uOpacity.value = m.card;
	hallRollers.L.mesh.visible = !!rl;
	if (rl) hallRollers.drawW(sk, (g) => { for (const x of [rl.xl, rl.xr]) vRollG(g, x, CASE.band0 - 8 - rl.lift, CASE.band1 + 8 - rl.lift, rl.r); });
	hallBox.L.mesh.visible = !!m.box;
	if (m.box) hallBox.drawW(`${m.box.lid.toFixed(3)}:${m.box.roll.toFixed(2)}`, (g) => storageBox(g, m.box!.lid, m.box!.roll));
	hallStaff.L.mesh.visible = !!m.staff;
	const fk = k30(m.t);
	if (m.staff) { const s = m.staff; hallStaff.drawW(`${fk}:${s.A.x.toFixed(1)}`, (g) => { g.save(); g.beginPath(); g.rect(-2000, -2000, 6000, 2000 + s.clipY); g.clip(); drawFig(g, s.A); drawFig(g, s.B); if (s.clipArms) { fillD(g, armPaths(s.A)); fillD(g, armPaths(s.B)); } g.restore();
		if (!s.clipArms) { fillD(g, armPaths(s.A)); fillD(g, armPaths(s.B)); } }); }   // arms that reach into the case pass over its top; any others stay behind it
	hallCrowd.draw(fk + ':' + m.crowd.length, m.crowd);
	const inBox = !!m.box && m.box.roll >= 0, yc: P = rl ? [(rl.xl + rl.xr) / 2, 580 - rl.lift] : inBox ? [BOX35.x0 + BOX35.w / 2, BOX35.top - 4] : [960, 580];
	const yc0: P = m.box ? [BOX35.x0 + BOX35.w / 2, BOX35.top - 4] : rl ? [(rl.xl + rl.xr) / 2, 580 - rl.lift] : [960, 580];
	hallHalo.drawW(`${m.you.toFixed(2)}:${yc[0].toFixed(0)}:${yc[1].toFixed(0)}:${rl ? (rl.xr - rl.xl).toFixed(0) : 'o'}:${m.box ? m.box.lid.toFixed(2) : ''}`, (g) => {
		if (m.you <= 0) return; const w = rl ? Math.max(60, (rl.xr - rl.xl) * 0.6 + 60) : inBox ? 80 : 340; glowBlob(g, yc, w, inBox ? 40 * (0.3 + 0.7 * m.box!.lid) : rl ? 70 : 110, (inBox ? 0.18 + 0.2 * m.box!.lid : 0.35) * m.you); });
	void yc0;
	dimWorld(hallSt, m.wallK, new Set([hallSilk.L.mat, hallHalo.L.mat, hallCeil.L.mat, hallSconce.L.mat, hallRollers.L.mat, hallBox.L.mat]));
	hallSt.heroAt(yc[0], yc[1], HZ.silk, 1100 * m.you + 1);
};
/** a rolled scroll lying across the bed in depth (vertical on screen): body + knobs, thicker as more silk winds on */
const vRollG = (g: CanvasRenderingContext2D, x: number, y0: number, y1: number, r: number) => {
	const hh = (y1 - y0) / 2, gr = g.createLinearGradient(x - r, 0, x + r, 0); gr.addColorStop(0, '#E2B979'); gr.addColorStop(0.45, '#FFF3D8'); gr.addColorStop(1, '#D6A866');
	g.save(); g.translate(x, (y0 + y1) / 2); g.fillStyle = gr; g.beginPath(); g.roundRect(-r, -hh, 2 * r, 2 * hh, r * 0.5); g.fill();
	g.fillStyle = '#34506A'; g.fillRect(-r, -hh, 2 * r, 2 * hh * 0.08); g.fillRect(-r, hh - 2 * hh * 0.08, 2 * r, 2 * hh * 0.08);
	g.fillStyle = '#EADCC0'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(0, s * (hh + 4), r * 0.7, r * 0.38, 0, 0, Math.PI * 2); g.fill(); } g.restore();
};
// ---- the storage box on the case top (35): front face 140 × 62 (the aspect of the case's central pane), lid hinged at the back
const BOX35 = {x0: 340, w: 120, top: 440, h: 53, rim: 7, lid: 40};
const storageBox = (g: CanvasRenderingContext2D, lid: number, roll: number) => {
	const {x0, w, top, h, rim} = BOX35, x1 = x0 + w, back = top - rim, th = lid * 100 * Math.PI / 180;      // lid 1 = open (100°), 0 = shut
	// the cavity seen from a little above: the far inner wall + the bed (warm with your light), you lying in it
	if (lid > 0.02) { const gr = g.createLinearGradient(0, back, 0, top); gr.addColorStop(0, '#6a4a30'); gr.addColorStop(1, '#9a6c42'); g.fillStyle = gr; g.fillRect(x0 + 4, back, w - 8, rim + 2);
		if (roll >= 0) { const ry = top - 4 - 18 * (1 - roll); drawRoll(g, [x0 + 13, ry], [x1 - 13, ry], 9, 1); } }
	// the box body (dark lacquered wood, brass corners)
	const bg = g.createLinearGradient(0, top, 0, top + h); bg.addColorStop(0, '#4a3628'); bg.addColorStop(1, '#2e2219'); g.fillStyle = bg; g.fillRect(x0, top, w, h);
	g.fillStyle = '#5c4532'; g.fillRect(x0, top, w, 3); g.fillStyle = '#8a7250'; for (const [x, y] of [[x0, top], [x1 - 9, top], [x0, top + h - 9], [x1 - 9, top + h - 9]]) g.fillRect(x, y, 9, 9);
	g.fillStyle = '#b8a888'; g.fillRect(x0 + w / 2 - 18, top + 17, 36, 15); g.fillStyle = '#5a5248'; g.fillRect(x0 + w / 2 - 13, top + 22, 26, 2); g.fillRect(x0 + w / 2 - 10, top + 26, 20, 2);
	// the lid: open, its underside lit warm by you; shut, the top board and a warm seam
	const yf = back - BOX35.lid * Math.sin(th) + BOX35.lid * 0.24 * Math.cos(th);
	if (yf < back - 1) { const ug = g.createLinearGradient(0, yf, 0, back); ug.addColorStop(0, `rgba(120,84,52,1)`); ug.addColorStop(1, `rgb(${Math.round(150 + 60 * lid)},${Math.round(104 + 40 * lid)},${Math.round(62 + 20 * lid)})`);
		g.fillStyle = ug; g.fillRect(x0, yf, w, back - yf); g.fillStyle = '#3a2a1e'; g.fillRect(x0, yf - 4, w, 4); }
	else { g.fillStyle = '#3e2e22'; g.fillRect(x0 - 1, back, w + 2, Math.max(2, yf - back + 1)); }
	if (lid <= 0.02) { g.fillStyle = 'rgba(255,200,130,0.55)'; g.fillRect(x0 + 6, top - 1, w - 12, 1.5); }
};
/** the B staff's hand point on the lid (its free edge, right end) */
const lidEdge = (lid: number): P => { const th = lid * 100 * Math.PI / 180, back = BOX35.top - BOX35.rim; return [BOX35.x0 + BOX35.w + 3, back - BOX35.lid * Math.sin(th) + BOX35.lid * 0.24 * Math.cos(th) + 2]; };

// ---- the queue in the hall: walking left behind the case with short steps, leaning to look in
const QL: LookQ[] = [VLOOK.man, VLOOK.woman, VLOOK.old, VLOOK.woman2, VLOOK.man2, VLOOK.woman, VLOOK.man, VLOOK.old, VLOOK.woman2, VLOOK.man2, VLOOK.woman];
const QSP = 236, QV = 118, QSTEP = 0.5, QSPAN = QL.length * QSP;
const hallQueue = (t: number, T0 = b(69) - 1.2): FigOpts[] => QL.map((lk, i) => {
	const h = 452 + 26 * hash(i * 5.1), s = QV * (t - T0) + i * QSP + 40 * hash(i * 2.3), x = 2350 - (((s % QSPAN) + QSPAN) % QSPAN);
	const u = s / (gaitStride('08_04', QSTEP) * h) + i * 0.37;
	return rig({x, ground: HG, h, pose: bowUpper(gaitPose('08_04', u, QSTEP), 9 + 4 * hash(i)), look: lk, flip: true}, [], () => HG, `hall visitor ${i}`);
});
// ---- 34b: the hall while you are on show (b69 → b72)
const hallCam34 = (t: number) => { const k = smooth(clamp01((t - b(71)) / (b(72) - b(71)))); lockCam(hallSt, lerp(1.0, 0.86, k), 960, 580, HZ.silk); };
const draw34b = (t: number): Frame => {
	hallCam34(t);
	drawHall({t, spots: () => 1, you: 1, card: 0, crowd: hallQueue(t), wallK: 1});
	hallDust.update(t, [300, 260, 1700, 900], 9, 4, 0.3);
	const grade = {vig: 0.36, exposure: 1};
	if (t < WIPE.out1) { const e = lerp(-30, 1990, easeOut(clamp01((t - WIPE.out0) / (WIPE.out1 - WIPE.out0)))); wipeL.draw(`o${Math.round(e)}`, (g) => masonry(g, e, 2400)); return {st: wipeSt, under: hallSt, blurUnder: 0, grade, bloom: 1}; }
	return {st: hallSt, grade, bloom: 1};
};
addScene({id: '34b', a: b(69), z: b(72), draw: draw34b});

// ================================================================================================ 35 · lights out, roll-up, the lid, the aisle
// 35a (b72 → b72.25): a time cut on the beat to the same framing after closing — the hall empty, the spots go out row by row
addScene({id: '35a', a: b(72), z: b(72.25), draw: (t) => {
	lockCam(hallSt, 0.86, 960, 580, HZ.silk);
	drawHall({t, spots: (i) => spotLevel(i, t), you: 1, card: 0, crowd: [], wallK: lerp(1, 0.84, clamp01((t - b(72)) / (b(72.25) - b(72))))});
	hallDust.update(t, [300, 260, 1700, 900], 9, 4, 0.25);
	return {st: hallSt, grade: {vig: 0.38, exposure: 1}, bloom: 1};
}});
// 35b (b72.25 → b72.75): two staff behind the case, each with both hands on a roller, roll you up toward the middle and lift you
const STAFF: LookQ[] = [{head: 'short', dress: 'smock'}, {head: 'ponytail', dress: 'smock', build: 0.95}];
const rollUp = (t: number) => {
	// each with both hands near the top of a roller; the rollers lift a little as they wind in, then the whole roll comes up
	const k = smooth(clamp01((t - b(72.3)) / (b(72.6) - b(72.3)))), lift = 16 * k + 40 * smooth(clamp01((t - b(72.6)) / 0.16));
	const xl = lerp(840, 947, k), xr = lerp(1080, 973, k), yT = 532 - lift, yB = 556 - lift, lean = 35 + 10 * k - 12 * clamp01((lift - 16) / 40);
	const A = rig({x: 770, ground: HG, h: 470, pose: bowUpper(POSES.stand, lean), look: STAFF[0]}, [{side: 'R', target: [xl - 4, yT], name: 'roller'}, {side: 'L', target: [xl - 4, yB], name: 'roller'}], () => HG, 'staff A');
	const B = rig({x: 1150, ground: HG, h: 462, pose: bowUpper(POSES.stand, lean), look: STAFF[1], flip: true}, [{side: 'R', target: [xr + 4, yT], name: 'roller'}, {side: 'L', target: [xr + 4, yB], name: 'roller'}], () => HG, 'staff B');
	return {A, B, rl: {xl, xr, lift, r: lerp(11, 16, k)}};
};
addScene({id: '35b', a: b(72.25), z: b(72.75), draw: (t) => {
	lockCam(hallSt, 1.35, 960, 580, HZ.silk, 960, 650);
	const R = rollUp(t);
	drawHall({t, spots: () => 0, you: 1, card: 0, crowd: [], wallK: 0.84, staff: {A: R.A, B: R.B, clipY: CASE.top}, rollers: R.rl, box: {lid: 1, roll: -1}});
	return {st: hallSt, grade: {vig: 0.4, exposure: 1}, bloom: 1};
}});
// 35c (b72.75 → b73.0): you are laid in the box on the case top (A's hands on you), B brings the lid down by its edge; push in
const layLid = (t: number) => {
	const roll = smooth(clamp01((t - b(72.75)) / 0.1)), lid = 1 - easeInOut(clamp01((t - (b(72.75) + 0.12)) / (b(73) - 0.03 - (b(72.75) + 0.12))));
	const ry = BOX35.top - 3 - 18 * (1 - roll), rel = smooth(clamp01((t - (b(72.75) + 0.1)) / 0.12));
	const Aup = bowUpper(POSES.stand, 8), Ain = bowUpper(POSES.stand, 34);
	const aC: Contact[] = rel < 0.02 ? [{side: 'R', target: [BOX35.x0 + 26, ry - 4], name: 'roll'}, {side: 'L', target: [BOX35.x0 + 62, ry - 4], name: 'roll'}] : [];
	const A = rig({x: 272, ground: HG, h: 470, pose: rel < 0.02 ? Ain : mixPose(Ain, Aup, rel), look: STAFF[0]}, aC, () => HG, 'staff A box');
	const e = lidEdge(lid), B = rig({x: 548, ground: HG, h: 462, pose: bowUpper(POSES.stand, lerp(30, 12, lid)), look: STAFF[1], flip: true}, [{side: 'R', target: e, name: 'lid edge'}], () => HG, 'staff B lid');
	return {A, B, lid, roll};
};
addScene({id: '35c', a: b(72.75), z: b(73), draw: (t) => {
	const zm = Math.exp(lerp(Math.log(1.7), Math.log(4.2), easeIn(clamp01((t - (b(72.75) + 0.1)) / (b(73) - b(72.75) - 0.1)))));
	lockCam(hallSt, zm, BOX35.x0 + BOX35.w / 2, BOX35.top + 6, HZ.box, 960, lerp(640, 590, clamp01((zm - 1.7) / 2.5)));
	const L = layLid(t);
	drawHall({t, spots: () => 0, you: 1, card: 0, crowd: [], wallK: 0.84, staff: {A: L.A, B: L.B, clipY: CASE.top, clipArms: true}, box: {lid: L.lid, roll: L.roll}});
	return {st: hallSt, grade: {vig: 0.42, exposure: 1}, bloom: 1};
}});
// 35d (b73 → b74): the storage aisle (#3E454A): a wall of shelved boxes face-on, yours glowing faintly at its seams on the
// lock point, the aisle's far end lit (right); a slow pull-back that lands the box face on the case pane's rectangle at b74
let aisleSt: Stage, aisleSeam: Live;
const ABOX = {cx: 960, cy: 601, w: 234, h: 104};
const AISLE_Z1 = 1.6;
const bootAisle = async () => {
	const st = aisleSt = new Stage('aisle');
	st.add('wall', canvasTex(gradCanvas([[0, '#30363b'], [0.4, '#3E454A'], [1, '#353b40']])), 960, 540, 6000, 3400, -600);
	// the far end: a lit opening beyond the last shelving unit (right), light spilling on the floor
	{ const c = mkCanvas(800, 1100), g = c.getContext('2d')!, gr = g.createLinearGradient(0, 0, 800, 0); gr.addColorStop(0, '#8c8270'); gr.addColorStop(0.5, '#cdbf9f'); gr.addColorStop(1, '#a89c84');
		g.fillStyle = gr; g.fillRect(40, 60, 520, 960); g.fillStyle = 'rgba(40,36,30,0.35)'; for (let x = 120; x < 560; x += 110) g.fillRect(x, 60, 4, 960);
		g.fillStyle = '#2a2f33'; g.fillRect(0, 0, 40, 1100); g.fillRect(560, 0, 240, 1100); g.fillRect(0, 0, 800, 60);
		st.add('farEnd', canvasTex(c), 1440 + 400, 560, 800, 1100, -300, {emissive: 0.12}); }
	// the shelving (face-on): uprights, boards, rows of storage boxes
	const c = mkCanvas(2400, 1300), g = c.getContext('2d')!, OX = -1000, OY = -60; g.translate(-OX, -OY);
	g.fillStyle = '#353b40'; g.fillRect(OX, OY, 2440, 1300);
	const boards = [263, 463, 653, 843, 1033];
	for (const yb of boards) { g.fillStyle = '#23272b'; g.fillRect(OX, yb, 2440, 16); g.fillStyle = '#50565b'; g.fillRect(OX, yb, 2440, 2); }
	for (let x = -980; x <= 1440; x += 610) { g.fillStyle = '#1e2225'; g.fillRect(x - 10, OY, 20, 1300); }
	for (let r = 0; r < boards.length; r++) { const yb = boards[r]; let x = -960 + hash(r * 3.1) * 40;
		while (x < 1400) { const w = 200 + hash(x * 0.13 + r) * 60, h = 86 + hash(x * 0.7 + r) * 28; const mine = r === 2 && x < ABOX.cx + ABOX.w / 2 + 14 && x + w > ABOX.cx - ABOX.w / 2 - 14;
			if (!mine && x + w < 1420) { const bg = g.createLinearGradient(0, yb - h, 0, yb); bg.addColorStop(0, '#4a3a2c'); bg.addColorStop(1, '#33281f'); g.fillStyle = bg; g.fillRect(x, yb - h, w, h);
				g.fillStyle = '#5c4834'; g.fillRect(x, yb - h, w, 3); g.fillStyle = 'rgba(20,14,10,0.6)'; g.fillRect(x, yb - h + 14, w, 1.5);
				g.fillStyle = '#a89a80'; g.fillRect(x + w / 2 - 20, yb - h * 0.55, 40, 16); g.fillStyle = '#5a5248'; g.fillRect(x + w / 2 - 14, yb - h * 0.55 + 6, 28, 2); }
			x += w + 24; } }
	// your box: the same kind, a touch longer; its seams are on the emissive layer
	{ const x0 = ABOX.cx - ABOX.w / 2, y0 = ABOX.cy - ABOX.h / 2; const bg = g.createLinearGradient(0, y0, 0, y0 + ABOX.h); bg.addColorStop(0, '#4e3c2c'); bg.addColorStop(1, '#35291f'); g.fillStyle = bg; g.fillRect(x0, y0, ABOX.w, ABOX.h);
		g.fillStyle = '#8a7250'; for (const [x, y] of [[x0, y0], [x0 + ABOX.w - 14, y0], [x0, y0 + ABOX.h - 14], [x0 + ABOX.w - 14, y0 + ABOX.h - 14]]) g.fillRect(x, y, 14, 14);
		g.fillStyle = '#b8a888'; g.fillRect(ABOX.cx - 30, y0 + 34, 60, 26); g.fillStyle = '#5a5248'; g.fillRect(ABOX.cx - 22, y0 + 42, 44, 3); g.fillRect(ABOX.cx - 16, y0 + 49, 32, 3); }
	st.add('shelving', canvasTex(c), OX + 1200, OY + 650, 2400, 1300, 0, {rim: 0.3, rimPx: 3});
	st.add('floor', canvasTex(gradCanvas([[0, '#2e3236'], [1, '#1c1f22']])), 960, 1500, 6000, 900, -100);
	aisleSeam = new Live(st, 'seam', ABOX.cx, ABOX.cy, ABOX.w + 120, ABOX.h + 120, 1, {emissive: 1.0}, 2);
	aisleSeam.drawW('s', (q) => { const x0 = ABOX.cx - ABOX.w / 2, y0 = ABOX.cy - ABOX.h / 2; q.fillStyle = 'rgba(255,206,140,0.8)'; q.fillRect(x0 + 8, y0 + 13, ABOX.w - 16, 2); q.fillStyle = 'rgba(255,206,140,0.45)'; q.fillRect(x0 + 2, y0 + 16, 1.5, ABOX.h - 20); q.fillRect(x0 + ABOX.w - 3.5, y0 + 16, 1.5, ABOX.h - 20);
		glowBlob(q, [ABOX.cx, y0 + 14], ABOX.w * 0.55, 16, 0.22); });
};
addScene({id: '35d', a: b(73), z: b(74), draw: (t) => {
	const k = easeOut(clamp01((t - b(73)) / (b(74) - b(73)))), zm = Math.exp(lerp(Math.log(3.4), Math.log(AISLE_Z1), k));
	lockCam(aisleSt, zm, ABOX.cx, ABOX.cy, 0, 960, 601);
	aisleSt.heroAt(ABOX.cx, ABOX.cy - 40, 0, 300);
	return {st: aisleSt, grade: {vig: 0.42, vigCol: '#0e0c0b', corners: 0.6, cornersTop: 1, cornersBand: [0, 300, 470, 0.7]}, bloom: 1};
}});

// ================================================================================================ 36 · the empty case
// the box face's screen rectangle at b74 → the case's central pane in the same rectangle; a slow push; the card
const Z36 = (() => { const sBox = AISLE_Z1, sPane = (sBox * ABOX.w) / PANE_W, d = D / sPane + HZ.glass; return D / d; })();
const cam36 = (t: number) => Math.exp(lerp(Math.log(Z36), Math.log(Z36 * 1.38), easeInOut(clamp01((t - b(74)) / (b(76) - b(74))))));
addScene({id: '36', a: b(74), z: b(76), draw: (t) => {
	lockCam(hallSt, cam36(t), PANE_C[0], PANE_C[1], HZ.glass, 960, 601);
	drawHall({t, spots: () => 0, you: 0, card: 1, crowd: [], wallK: 0.92});
	hallDust.update(t, [500, 360, 1400, 820], 7, 3, 0.26);
	return {st: hallSt, grade: {vig: 0.4, exposure: 1}, bloom: 1};
}});

// ================================================================================================ 37 · reverse crane + end card
// out of the hall, back through the warm-lit gate passage (its far opening = the hall), up and away from the 午门 door at
// the top of the empty 马道 ramp; the Juno end card over the scene, which dims (nothing gets brighter after this).
let ext: Stage, extDoor: Live, pass: Stage;
const DOOR = {x: 960, y: 604, w: 48, h: 72, z: -190};
const bootExt = async () => {
	ext = new Stage('e8ext');
	ext.add('sky', canvasTex(gradCanvas([[0, '#1F2E38'], [0.42, '#2E404B'], [0.7, '#45565D'], [0.8, '#5A5A4C'], [1, '#4a4a40']])), 960, 420, 9000, 3200, -6000);
	const far = svgDoc(`${skyline(-2600, 4600, 760, 24, 70, 17, '#222a30')}` + Array.from({length: 40}, (_, i) => `<rect x="${-2400 + i * 170 + hash(i) * 80}" y="${728 + hash(i * 3) * 24}" width="8" height="5" fill="#FFB868" fill-opacity="${0.35 + 0.3 * hash(i * 7)}"/>`).join(''), 7400, 900, '', -2700, 0);
	ext.add('far', canvasTex(await svgToCanvas(far, 7400, 900, 0.5)), 950, 450, 7400, 900, -3000, {fog: ['#45565D', 0.3]});
	const defs = `<defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2d2a"/><stop offset="0.6" stop-color="#46352f"/><stop offset="1" stop-color="#523e35"/></linearGradient></defs>`;
	let gate = `<rect x="-1500" y="640" width="4900" height="560" fill="url(#wg)"/>`;
	for (let i = 0; i < 14; i++) gate += `<line x1="-1500" x2="3400" y1="${668 + i * 38}" y2="${668 + i * 38}" stroke="#2e1f1a" stroke-opacity="0.35" stroke-width="2"/>`;
	for (let x = -1500; x < 3400; x += 34) gate += `<rect x="${x}" y="628" width="20" height="14" fill="#2c201c"/>`;
	for (const [ax, aw, ah] of [[960, 118, 200], [690, 84, 150], [1230, 84, 150]]) gate += `<path fill="#24170f" d="M${ax - aw / 2},1200 L${ax - aw / 2},${1200 - ah + aw / 2} A${aw / 2},${aw / 2} 0 0 1 ${ax + aw / 2},${1200 - ah + aw / 2} L${ax + aw / 2},1200 Z"/>`;
	for (const sg of [-1, 1]) gate += `<rect x="${sg < 0 ? 960 - 860 : 960 + 300}" y="598" width="560" height="44" fill="#17191c"/>` + roofSvg(960 + sg * 580, 570, 620, 34, 0.3, '#17191c') + hallSvg(960 + sg * 900, 642, 200, 130, 1, '#17191c');
	gate += hallSvg(960, 642, 400, 196, 2, '#17191c');
	ext.add('gate', canvasTex(await svgToCanvas(svgDoc(defs + gate, 4900, 1200, '', -1500, 100), 4900, 1200, 0.6)), 950, 700, 4900, 1200, -200, {});
	const ramp = `<path fill="#3d302b" d="M-200,1100 L880,640 L960,640 L960,654 L890,654 L-150,1110 Z"/><path fill="none" stroke="#17120f" stroke-width="7" d="M-200,1086 L880,628"/>` +
		Array.from({length: 26}, (_, i) => { const x = -160 + i * 40, y = 1086 - (x + 200) * (458 / 1080); return `<rect x="${x}" y="${y - 12}" width="4" height="12" fill="#17120f"/>`; }).join('');
	ext.add('ramp', canvasTex(await svgToCanvas(svgDoc(ramp, 2400, 700, '', -400, 560), 2400, 700, 0.6)), 800, 910, 2400, 700, -160, {});
	ext.add('plaza', canvasTex(gradCanvas([[0, '#2c2826'], [1, '#1b1918']])), 960, 1300, 6000, 420, -150);
	extDoor = new Live(ext, 'door', DOOR.x, DOOR.y, 400, 300, DOOR.z, {emissive: 0.55}, 1);
	extDoor.draw('d', (g) => { g.translate(200 - DOOR.x, 150 - DOOR.y); glowBlob(g, [DOOR.x, DOOR.y + 10], 120, 70, 0.22, '255,190,120');
		const gr = g.createLinearGradient(0, DOOR.y - DOOR.h / 2, 0, DOOR.y + DOOR.h / 2); gr.addColorStop(0, '#9a6a3c'); gr.addColorStop(0.55, '#c8945a'); gr.addColorStop(1, '#a87848');
		g.fillStyle = gr; g.fillRect(DOOR.x - DOOR.w / 2, DOOR.y - DOOR.h / 2, DOOR.w, DOOR.h); g.fillStyle = '#5a5e62'; g.fillRect(DOOR.x - 12, DOOR.y + 4, 24, 14); });
	// the passage: warm-lit masonry rings receding to the far opening (the hall, its case dark)
	pass = new Stage('e8pass');
	const PH = 78, PV = 112, PCY = 600, farCv = mkCanvas(960, 540), fg = farCv.getContext('2d')!; fg.scale(0.5, 0.5);
	fg.fillStyle = '#3a4046'; fg.fillRect(0, 0, 1920, 1080);
	{ const x0 = 960 - 110, y0 = PCY - 64, w = 220, h = 124, gr = fg.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, '#353b40'); gr.addColorStop(0.7, '#41474c'); gr.addColorStop(1, '#2a2f33');
		fg.fillStyle = gr; fg.fillRect(x0, y0, w, h); fg.fillStyle = '#23282d'; fg.fillRect(960 - 40, PCY - 10, 80, 20); fg.fillStyle = '#2a2f34'; fg.fillRect(960 - 42, PCY + 10, 84, 26); fg.fillStyle = '#9a9488'; fg.fillRect(960 - 8, PCY - 5, 16, 6); }
	pass.add('far', canvasTex(farCv), 960, 540, 1920, 1080, 0, {});
	[250, 480, 700, 900, 1060, 1180, 1250].forEach((z, i, RZ) => { const c = mkCanvas(960, 540), g = c.getContext('2d')!, s2 = D / (D - z), hw = PH * s2 / 2, hh = PV * s2 / 2, cy = 540 / 2 + (PCY - 540) * s2 / 2, k = i / (RZ.length - 1);
		const lit = Math.round(lerp(104, 50, k)); g.fillStyle = `rgb(${lit},${Math.round(lit * 0.8)},${Math.round(lit * 0.64)})`; g.fillRect(0, 0, 960, 540);
		g.strokeStyle = `rgba(30,18,10,${0.25 + 0.2 * k})`; g.lineWidth = 1.5; for (let y = 6; y < 540; y += 14 * s2 / 2 + 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(960, y); g.stroke(); }
		g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(480 - hw, cy + hh); g.lineTo(480 - hw, cy - hh + hw); g.arc(480, cy - hh + hw, hw, Math.PI, 0); g.lineTo(480 + hw, cy + hh); g.closePath(); g.fill();
		g.globalCompositeOperation = 'source-over'; pass.add('ring' + i, canvasTex(c), 960, 540, 1920, 1080, z, {}); });
};
const E37 = {a: b(76), hallZ: b(76) + 0.3, passZ: b(76) + 0.78, extSettle: b(77.5)};
const Q_LINE = (LINES.find((l) => l[2].startsWith('要是排')) ?? [174.657, 184.3, '要是排[五小时]看两分钟，你去吗？'])[2];
const SOURCES = '资料：故宫博物院 · 余辉（故宫博物院院刊 2012；光明日报 2017）· 朱鸿文（光明日报 2026）· 王文锋（长春日报 2020）· 许忠陵《清明上河图装裱记》· 北京晚报 2015';
const endHud = (t: number) => (hud: HTMLElement) => {
	const o = smooth(clamp01((t - b(76)) / 0.5)), n = [...Q_LINE].filter((c) => c !== '[' && c !== ']').length, qT = clamp01((t - b(76.5)) / 0.4) * n + (t >= b(76.5) ? 1 : 0);
	endCard(hud, o, t < b(76.5) ? '' : Q_LINE, SOURCES, t < b(76.5) ? 0 : Math.floor(qT + 1e-6), smooth(clamp01((t - b(78)) / 0.3)), smooth(clamp01((t - b(78.5)) / 0.3)));
};
addScene({id: '37', a: b(76), z: 184.3 + 1, draw: (t) => {
	const dimK = lerp(1, 0.5, smooth(clamp01((t - b(76.2)) / (b(77.6) - b(76.2)))));
	if (t < E37.hallZ) {           // ---- out of the hall (the camera backs away from the empty case toward the door)
		const k = easeIn(clamp01((t - E37.a) / (E37.hallZ - E37.a)));
		lockCam(hallSt, Math.exp(lerp(Math.log(Z36 * 1.38), Math.log(0.62), k)), PANE_C[0], PANE_C[1], HZ.glass, 960, lerp(601, 580, k));
		drawHall({t, spots: () => 0, you: 0, card: 1, crowd: [], wallK: 0.92});
		return {st: hallSt, grade: {vig: 0.42, exposure: 1}, bloom: 1, hideFurniture: true, hud: endHud(t)};
	}
	if (t < E37.passZ) {           // ---- back through the passage (its far opening is the hall)
		const k = easeOut(clamp01((t - E37.hallZ) / (E37.passZ - E37.hallZ)));
		pass.setCam(960, 540, Math.exp(lerp(Math.log(12), 0, k)));
		return {st: pass, grade: {vig: 0.45, exposure: 1}, bloom: 1, hideFurniture: true, hud: endHud(t)};
	}
	// ---- outside: the door at the top of the empty ramp; the crane settles, then a slow rise to the end
	const k = easeOut(clamp01((t - E37.passZ) / (E37.extSettle - E37.passZ))), rise = smooth(clamp01((t - E37.extSettle) / (184.3 - E37.extSettle)));
	const zoom = k < 1 ? Math.exp(lerp(Math.log(9), Math.log(1.0), k)) : lerp(1.0, 0.9, rise);
	lockCam(ext, zoom, DOOR.x, DOOR.y, DOOR.z, 960, 580 + 40 * k + 150 * rise);
	ext.heroAt(DOOR.x, DOOR.y, DOOR.z, 700);
	dimWorld(ext, dimK, new Set(), [1, 0.99, 0.98]); extDoor.L.mat.uniforms.uTint.value.setRGB(0.4 + 0.6 * dimK, 0.4 + 0.6 * dimK, 0.4 + 0.6 * dimK);
	return {st: ext, grade: {vig: 0.38 + 0.1 * rise, exposure: 1}, bloom: 1, hideFurniture: true, hud: endHud(t)};
}});
