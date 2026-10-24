// Scenes 27–29: the 沈阳 storeroom (lamp on, the copies, the battered roll), THE PEAK (unroll + burst, dive into the 虹桥,
// colour floods, the painted quarter lifts into relief, bridge match onto the real arch), and the 1950s day crest (R1, 进⑤).
import {Stage, Live, bar, BEAT, W, H, D, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas} from './core';
import {addScene} from './film';
import {Store} from './rooms';
import {Crest, deck} from './crest';
import {Cast, look, drawRoll, glowBlob, rig, Contact} from './actors';
import {POSES, FigOpts, walkFor, gaitStride, stepFor} from './figures';
import {paintSection, paintRelief, paintRiverSprites, layerShadow} from './silk';

const b = bar, T0 = 123.40;                         // the hardest drop's audible bass (b54 grid = 123.71)
const FLOOR = 1040, TOPF = 756, TOPB = 690;           // store floor; table top front / back edge (world px)
const SX = 900, SW = 620, SH1 = 232.5;               // the battered strip on the table: left x, full width, full height (aspect of the painting)
const FW = 2880, FH = 1080, FX0 = 960 - FW / 2;       // the painting plane on the PEAK stage (world px)
const SEC = FW / 4096;                                // section px (4096 × 1536) → peak world px
const lk50 = look('cadre1950');

let store: Store, cast: Cast, rolls: Live, strip: Live, glow: Live;
let monoBase: HTMLCanvasElement, greyArt: HTMLCanvasElement, colBase: HTMLCanvasElement & {silk: any};
let sprC: ReturnType<typeof paintRiverSprites>;
let peak: Stage, pMono: Live, pCol: Live;
const relief: {L: any; sh?: any}[] = [];
let BR = {x: 0, y: 0, w: 0, h: 0}, UB = 0.5, VB = 0.4;
let day: Crest, dayCast: Cast, dayRoll: Live, gateGlow: Live;

// ------------------------------------------------------------------------------------------------ boot
export const bootPeak = async () => {
	store = new Store(); day = new Crest('day-1950', {sky: 'day', era: '1950', lanterns: false, boat: true, bankCrowd: true});
	await Promise.all([store.ready, day.ready]);
	const st = store.st;
	st.get('table').mesh.visible = false;                                 // our own table (a visible top, the researcher at its end)
	st.add('crate', canvasTex(crateCanvas()), 960, 540, W, H, -40, {rim: 0.9, rimPx: 5});
	st.add('mytable', canvasTex(tableCanvas()), 960, 540, W, H, 0, {rim: 1.0, rimPx: 5});
	st.add('lampbody', canvasTex(lampCanvas()), 960, 540, W, H, 2, {rim: 0.7, rimPx: 4});
	rolls = new Live(st, 'rolls', 960, 540, W, H, 3, {rim: 0.8, rimPx: 4}, 1.5);
	cast = new Cast(st, 'researcher', 960, 540, W, H, 5);
	strip = new Live(st, 'strip', SX + 330, 640, 800, 340, 0, {emissive: 0.0}, 5, 6);
	glow = new Live(st, 'pglow', 960, 540, W, H, 9, {emissive: 1.0}, 0.5);
	// the art (painted once): the copies' picture, the strip / peak mono base, the colour base + its three moving sprites
	const sp = {mast: 0.2, railK: 0.3, cartK: 0.52};          // the cart starts clear of the mast tip (gate-3 open note 9)
	monoBase = paintSection('river', {width: 4096, height: 1536, mode: 'mono', seed: 43, ...sp});
	greyArt = paintSection('river', {width: 1024, height: 384, mode: 'grey', seed: 61});
	colBase = paintSection('river', {width: 4096, height: 1536, mode: 'colour', seed: 43, sprites: false});
	sprC = paintRiverSprites({width: 4096, height: 1536, mode: 'colour', seed: 43});
	BR = colBase.silk.bridge; UB = (BR.x + BR.w * 0.5) / 4096; VB = (BR.y + BR.h * 0.42) / 1536;
	// the PEAK stage
	peak = new Stage('peak');
	peak.add('back', canvasTex(gradCanvas([[0, '#d6c6a3'], [1, '#c4b18c']])), 960, 540, 9000, 5000, -3000);
	pMono = new Live(peak, 'mono', 960, 540, FW, FH, 0, {emissive: 0.16}, 1.4, 2);
	pCol = new Live(peak, 'col', 960, 540, FW, FH, 0, {emissive: 0.16}, 1.4, 3);
	const rel = paintRelief('river', {width: 4096, height: 1536, mode: 'colour', seed: 43, mast: 1, railK: 1, cartK: cartAt(b(56)), ghost: 0.26});
	for (let i = 0; i < 5; i++) {
		let sh: any;
		if (i > 0) { const s0 = layerShadow(rel[i], {blur: 26, dx: 0, dy: 0, alpha: 0.5, mode: 'colour'}), sm = mkCanvas(1024, 384); sm.getContext('2d')!.drawImage(s0, 0, 0, 1024, 384);
			sh = peak.add(`relsh${i}`, canvasTex(sm), 960, 540, FW, FH, 0, {opacity: 0}, 10 + i * 2); }
		const L = peak.add(`rel${i}`, canvasTex(rel[i]), 960, 540, FW, FH, 0, {emissive: 0.16, opacity: 0}, 11 + i * 2);
		relief.push({L, sh});
	}
	// the day crest: staff + your roll, and the warm-lit gate passage on the far bank
	dayCast = new Cast(day.st, 'dayCast', 960, 900, 7000, 1800, 20);
	dayRoll = new Live(day.st, 'dayRoll', 960, 900, 7000, 1800, 22, {emissive: 0.55}, 0.6);
	gateGlow = new Live(day.st, 'gateGlow', -300, 800, 200, 160, -2590, {emissive: 0.5}, 2);
	gateGlow.draw('g', (g) => drawPassage(g));
};

// ------------------------------------------------------------------------------------------------ store set pieces (static)
const tableCanvas = () => {
	const c = mkCanvas(W, H), g = c.getContext('2d')!;
	// the table: researcher at its left end (x 800); top seen slightly from above (back edge y 690 → front edge y 756)
	g.fillStyle = '#2b221a'; g.beginPath(); g.moveTo(812, TOPB); g.lineTo(1760, TOPB); g.lineTo(1790, TOPF); g.lineTo(800, TOPF); g.closePath(); g.fill();
	g.fillStyle = 'rgba(255,220,170,.05)'; for (let i = 0; i < 9; i++) g.fillRect(812, TOPB + 6 + i * 7, 960, 1);       // plank grain
	g.fillStyle = '#18120d'; g.fillRect(800, TOPF, 990, 30);                                                               // front slab
	g.fillRect(820, TOPF + 30, 24, FLOOR - TOPF - 30); g.fillRect(1750, TOPF + 30, 24, FLOOR - TOPF - 30); g.fillRect(844, TOPF + 30, 906, 14);
	// stool under the researcher
	g.fillStyle = '#15100C'; g.fillRect(612, 796, 176, 14); g.fillRect(624, 810, 12, FLOOR - 810); g.fillRect(764, 810, 12, FLOOR - 810); g.fillRect(636, 960, 128, 8);
	return c;
};
const crateCanvas = () => {
	const c = mkCanvas(W, H), g = c.getContext('2d')!;
	g.fillStyle = '#1d1712'; g.fillRect(840, 640, 250, 400); g.strokeStyle = '#2e261e'; g.lineWidth = 3;
	for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(840, 668 + k * 30); g.lineTo(1090, 668 + k * 30); g.stroke(); }
	// the reject pile: dark rolls, ends toward us, some at angles
	const ends: [number, number, number][] = [[866, 628, 13], [896, 632, 12], [930, 626, 14], [962, 633, 12], [994, 627, 13], [1026, 632, 12], [1058, 628, 12], [884, 612, 11], [948, 611, 12], [1012, 612, 11], [1046, 610, 10]];
	for (const [x, y, r] of ends) { g.fillStyle = '#2a231c'; g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3a3027'; g.beginPath(); g.ellipse(x, y, r * 0.45, r * 0.36, 0, 0, Math.PI * 2); g.fill(); }
	g.save(); g.translate(1000, 618); g.rotate(-0.12); g.fillStyle = '#231d17'; g.fillRect(-90, -8, 170, 14); g.restore();
	return c;
};
const LAMP = {base: [1250, TOPF - 10] as [number, number], sw: [884, TOPF - 8] as [number, number], bulb: [1150, 648] as [number, number]};
const lampCanvas = () => {
	const c = mkCanvas(W, H), g = c.getContext('2d')!, [bx, by] = LAMP.base;
	g.fillStyle = '#15100C'; g.beginPath(); g.ellipse(bx, by + 4, 40, 9, 0, 0, Math.PI * 2); g.fill();
	g.strokeStyle = '#15100C'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + 6, 610); g.quadraticCurveTo(bx - 10, 572, 1190, 600); g.stroke();
	// green enamel shade, tipped toward the table centre
	g.save(); g.translate(1168, 616); g.rotate(-0.55); g.fillStyle = '#2f4a3a'; g.beginPath(); g.moveTo(-14, -34); g.lineTo(14, -34); g.lineTo(46, 26); g.quadraticCurveTo(0, 38, -46, 26); g.closePath(); g.fill();
	g.fillStyle = '#4f6f58'; g.fillRect(-12, -34, 24, 6); g.restore();
	// cord along the table front to the inline switch by the researcher, then off the edge to the floor
	g.strokeStyle = '#100c09'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx - 30, by + 6); g.bezierCurveTo(1100, TOPF - 2, 980, TOPF - 1, LAMP.sw[0] + 16, LAMP.sw[1]); g.stroke();
	g.beginPath(); g.moveTo(LAMP.sw[0] - 14, LAMP.sw[1]); g.bezierCurveTo(820, TOPF + 4, 805, TOPF + 60, 806, FLOOR); g.stroke();
	g.fillStyle = '#2a221b'; g.beginPath(); g.roundRect(LAMP.sw[0] - 16, LAMP.sw[1] - 7, 32, 13, 4); g.fill();                     // the switch
	return c;
};

// ------------------------------------------------------------------------------------------------ store action
const ROLLY = [TOPF - 6, TOPF - 22, TOPF - 38], ROLLX = [905, 925, 945];   // three copies, front → back (overlapped in depth)
const openAt = (i: number) => b(51.25 + 0.25 * (2 - i));                       // back roll first
/** x of copy i's free end: opens a hand's width (90 px) toward him on its beat */
const freeEnd = (i: number, t: number) => ROLLX[i] - 90 * smooth(clamp01((t - openAt(i) + 0.12) / 0.24));
const unrollAt = (t: number) => { const u = clamp01((t - T0) / 0.9); return u < 0.35 ? (u / 0.35) * 0.72 : 0.72 + 0.28 * easeOut((u - 0.35) / 0.65); };   // fast then slow
/** the battered roll: on top of the reject pile (lock point) → drawn onto the table at b53.5 (left end at the strip start) */
const batteredAt = (t: number): [number, number] => { const k = smooth(clamp01((t - b(53.5)) / 0.32)); return [lerp(905, SX, k), lerp(600, TOPF - 12, k) - Math.sin(k * Math.PI) * 30]; };
/** the researcher, seated at the table's left end facing right; hands on what the board says, beat by beat */
const researcher = (t: number): FigOpts => {
	const o: FigOpts = {x: 700, ground: FLOOR, h: 700, pose: POSES.sit, look: lk50};
	const c: Contact[] = [];
	if (t < b(50.4)) c.push({side: 'R', target: [LAMP.sw[0], LAMP.sw[1] - 4], name: 'switch'});
	else if (t < b(51.25) - 0.18) { /* hands in the lap */ }
	else if (t < b(53.5) - 0.2) { const i = t < openAt(1) - 0.05 ? 2 : t < openAt(0) - 0.05 ? 1 : 0; c.push({side: 'R', target: [freeEnd(i, t), ROLLY[i] - 4], name: 'roller'}); }
	else if (t < T0) { const p = batteredAt(t); c.push({side: 'R', target: [p[0] + 6, p[1] - 12], name: 'battered'}); }
	else { c.push({side: 'R', target: [SX + 8, TOPF - 4], name: 'silk edge'}); if (t < T0 + 0.035) c.push({side: 'L', target: [SX + 14 + SW * unrollAt(t), TOPF - 16], name: 'roller'}); }   // L hand only on the push: the roll then runs out of reach
	return rig(o, c, () => FLOOR, 'researcher');
};

/** a copy's roll: matte silk (it doesn't glow; only you do), grey once it is shown to be a copy */
const dullRoll = (g: CanvasRenderingContext2D, x: number, y: number, L: number, r: number, grey: boolean) => {
	const gr = g.createLinearGradient(0, y - r, 0, y + r);
	if (grey) { gr.addColorStop(0, '#77736b'); gr.addColorStop(0.45, '#9a958c'); gr.addColorStop(1, '#4e4a44'); } else { gr.addColorStop(0, '#8a7558'); gr.addColorStop(0.45, '#b49b76'); gr.addColorStop(1, '#5e4d39'); }
	g.fillStyle = gr; g.beginPath(); g.roundRect(x, y - r, L, 2 * r, r * 0.4); g.fill();
	g.fillStyle = grey ? '#4a4a4a' : '#2c3e52'; g.fillRect(x, y - r, L * 0.06, 2 * r); g.fillRect(x + L * 0.94, y - r, L * 0.06, 2 * r);
	g.fillStyle = grey ? '#8a867e' : '#b8aa90'; for (const xx of [x - r * 0.25, x + L + r * 0.25]) { g.beginPath(); g.ellipse(xx, y, r * 0.35, r * 0.7, 0, 0, Math.PI * 2); g.fill(); }
};
const drawCopies = (g: CanvasRenderingContext2D, t: number) => {
	for (let i = 2; i >= 0; i--) {
		const x0 = freeEnd(i, t), y = ROLLY[i], grey = i > 0 && t >= b(53 + 0.25 * (i - 1)), rx = ROLLX[i];
		if (rx - x0 > 2) {      // the opened hand's width lies on the table: a foreshortened panel showing a 虹桥
			const ph = 46; g.save(); g.beginPath(); g.moveTo(x0, y); g.lineTo(rx, y); g.lineTo(rx + 8, y - ph); g.lineTo(x0 + 8, y - ph); g.closePath(); g.clip();
			g.fillStyle = grey ? '#8f8a82' : '#cdbd9c'; g.fillRect(x0 - 4, y - ph - 2, rx - x0 + 16, ph + 4);
			g.globalAlpha = 0.8; g.drawImage(grey ? greyArt : monoBase, grey ? 330 : 1320, grey ? 70 : 280, grey ? 380 : 1520, grey ? 190 : 760, rx - 230, y - ph - 6, 240, ph + 10); g.globalAlpha = 1; g.restore();
			g.fillStyle = '#34506A'; g.fillRect(x0 - 3, y - ph + 2, 6, ph - 2);              // the free end's stick
		}
		dullRoll(g, rx, y - 10, 210, 11, grey);
		if (i > 0) { g.fillStyle = grey ? '#8f8a80' : '#E8DCC0'; g.fillRect(rx + 120, y - 30, 18, 40); g.fillStyle = grey ? '#5c5850' : '#B42E22';
			g.font = '700 14px "Noto Serif CJK SC"'; g.fillText('真', rx + 121, y - 14); g.fillText('迹', rx + 121, y + 2); }
	}
};

/** store camera: slow push b50 → T0; the dive b54 → b54.5 lands on the matched framing of the PEAK's first frame */
const DIVE_A = b(54), DIVE_Z = b(54.5) - 0.1;
const stripRect = (t: number) => { const dv = easeIn(clamp01((t - DIVE_A) / (DIVE_Z - DIVE_A))); const sh = lerp(46, SH1, smooth(dv)); return {x: SX, y: TOPF - sh, w: SW * unrollAt(t), h: sh, dv}; };
/** a view of the painting: centre (u, v) as fractions, f = visible width fraction */
type View = {u: number; v: number; f: number};
const V0 = (): View => ({u: UB - 0.012, v: VB, f: 0.42});
const storeCam = (t: number): [number, number, number] => {
	const push = smooth(clamp01((t - b(50)) / (T0 - b(50)))), cx0 = lerp(990, 1010, push), cy0 = lerp(600, 655, push), z0 = lerp(1.04, 1.3, push);
	if (t < DIVE_A) return [cx0, cy0, z0];
	const r = stripRect(DIVE_Z), v = V0(), cx1 = r.x + v.u * SW, cy1 = r.y + v.v * r.h, z1 = 1920 / (v.f * SW);
	const k = easeIn(clamp01((t - DIVE_A) / (DIVE_Z - DIVE_A)));
	return [lerp(cx0, cx1, k), lerp(cy0, cy1, k), Math.exp(lerp(Math.log(z0), Math.log(z1), k))];
};

const storeDraw = (t: number) => {
	const st = store.st, on = t >= b(50) + 0.067 ? 1 : 0;
	const burst = clamp01((t - T0) / 0.5), [cx, cy, zm] = storeCam(t);
	const shake = t > T0 && t < T0 + 0.1 ? (Math.round((t - T0) * 30) % 2 ? 5 : -5) : 0;
	st.setCam(cx + shake, cy + shake * 0.4, zm);
	const fk = `${Math.round(t * 30)}`;
	cast.draw(fk, [researcher(t)]);
	rolls.draw(fk, (g) => drawCopies(g, t));
	// the battered roll / the strip
	const r = stripRect(t), bp = batteredAt(t), unrolled = t >= T0;
	const tremble = t > b(53.75) && t < T0 ? Math.sin(t * 70) * (t > 123.13 ? 2.4 : 0.9) : 0;
	strip.L.mat.uniforms.uEmissive.value = unrolled ? 0.08 + 0.12 * burst * (1 - r.dv) + 0.08 * r.dv : 0.06;
	strip.drawW(`${fk}:${r.h.toFixed(1)}`, (g) => {
		if (unrolled && r.w > 2) {
			g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip(); g.fillStyle = '#F3E6CA'; g.fillRect(r.x, r.y, r.w, r.h);
			g.drawImage(monoBase, 0, 0, 4096 * (r.w / SW), 1536, r.x, r.y, r.w, r.h); g.restore();
			g.fillStyle = 'rgba(30,22,16,.75)';                                             // torn edges (top and bottom margins)
			for (let i = 0; i < 40; i++) { const x = r.x + (i / 40) * r.w, d = (Math.sin(i * 12.9898) * 43758.5) % 1; g.fillRect(x, r.y, r.w / 40 + 1, Math.abs(d) * r.h * 0.035); g.fillRect(x, r.y + r.h - Math.abs(d * 1.7 % 1) * r.h * 0.03, r.w / 40 + 1, r.h * 0.03); }
			const ex = r.x + r.w; g.fillStyle = '#d9c39c'; g.beginPath(); g.roundRect(ex - 4, r.y + 2, 22, r.h - 4, 9); g.fill();   // what's left of the roll, lying across the table's depth
			g.fillStyle = '#2c3e52'; g.fillRect(ex - 4, r.y + 2, 22, Math.min(10, r.h * 0.08)); g.fillRect(ex - 4, r.y + r.h - 2 - Math.min(10, r.h * 0.08), 22, Math.min(10, r.h * 0.08));
		} else { drawRoll(g, [bp[0] + tremble, bp[1]], [bp[0] + 150 + tremble, bp[1] - 6], 13, 0.3, false);
			g.fillStyle = 'rgba(28,20,14,.85)'; for (const [dx, w] of [[18, 7], [52, 5], [83, 9], [121, 6]]) { g.beginPath(); g.moveTo(bp[0] + dx + tremble, bp[1] - 13 - dx * 0.04); g.lineTo(bp[0] + dx + w + tremble, bp[1] - 13 - dx * 0.04); g.lineTo(bp[0] + dx + w * 0.4 + tremble, bp[1] - 5 - dx * 0.04); g.closePath(); g.fill(); } }
	});
	glow.draw(fk, (g) => {
		const a0 = t >= b(50.5) && !unrolled ? 0.10 + 0.03 * Math.sin(t * 7) + (t > b(53.5) ? 0.06 + (t > 123.13 ? 0.06 : 0) : 0) : 0;
		glowBlob(g, [bp[0] + 75, bp[1]], 110, 50, a0);
		if (unrolled) glowBlob(g, [r.x + r.w / 2, r.y + r.h / 2], 260 + 260 * burst, 70 + r.h * 0.8, 0.2 * burst * (1 - r.dv));
	});
	store.lamp.draw(`${on}`, (g) => { if (!on) return; glowBlob(g, LAMP.bulb, 60, 46, 0.55, '255,196,120'); glowBlob(g, [1080, TOPF - 30], 300, 70, 0.22, '255,190,110'); });
	store.dust.update(t, [300, 120, 1800, 1000], 22 + 30 * burst, 5, 0.18 + 0.55 * burst);
	if (!unrolled) st.heroAt(on ? (t > b(50.5) ? bp[0] + 75 : LAMP.bulb[0]) : 960, on ? (t > b(50.5) ? bp[1] : LAMP.bulb[1]) : 580, 6, on ? 700 : 300);
	else st.heroAt(r.x + r.w / 2, r.y + r.h / 2, 0, 700 + 900 * burst);
	return {st, grade: {vig: 0.42, vigCol: '#140e0a', exposure: on ? 1 + 0.06 * burst : 0.6, corners: 0.5 + 0.5 * clamp01((t - DIVE_A) / 0.3)}, bloom: 1 + 0.25 * burst};
};
addScene({id: '27', a: b(50), z: b(54.5) - 0.1, draw: storeDraw});

// ------------------------------------------------------------------------------------------------ the PEAK (painting stage)
function cartAt(t: number) { return 0.52 + 0.33 * clamp01((t - b(54.5)) / (b(56) - b(54.5))); }
const camOf = (v: View): [number, number, number] => [FX0 + v.u * FW, v.v * FH, 1920 / (v.f * FW)];
const clampV = (v: View): View => { const zm = 1920 / (v.f * FW), hh = 540 / zm / FH; return {...v, v: Math.min(1 - hh, Math.max(hh, v.v))}; };
/** scene 29's first camera (the crest arch spans the frame): the peak's exit lands the painted arch on it */
const C29: [number, number, number] = [960, 790, 0.62];
const peakCam = (t: number): [number, number, number] => {
	const v0 = V0(), dr = easeOut(clamp01((t - DIVE_Z) / (b(56) - DIVE_Z)));
	const vd: View = {u: lerp(v0.u, UB + 0.022, dr), v: lerp(v0.v, VB + 0.012, dr), f: lerp(v0.f, 0.31, dr)};
	const cr = easeInOut(clamp01((t - b(56)) / (b(56.75) - b(56))));
	const vc = clampV({u: lerp(vd.u, UB + 0.01, cr), v: lerp(vd.v, VB - 0.07, cr), f: lerp(vd.f, 0.52, cr)});
	const [x1, y1, z1] = camOf(vc);
	if (t < b(56.75)) return [x1, y1, z1];
	// exit: the crane settles into a slow push; scene 29's camera does the matching (the real arch is framed onto the painted one)
	const k = easeOut(clamp01((t - b(56.75)) / (b(57) + 0.1 - b(56.75))));
	const [x2, y2, z2] = camOf(clampV({u: vc.u, v: vc.v + 0.01, f: 0.47}));
	return [lerp(x1, x2, k), lerp(y1, y2, k), Math.exp(lerp(Math.log(z1), Math.log(z2), k))];
};
/** the crest camera that puts the real arch's apex + span on the painted arch's apex + span as framed at time t */
const crestMatch = (t: number): [number, number, number] => {
	const [cx, cy, zm] = peakCam(t), ax = FX0 + (BR.x + BR.w * 0.5) * SEC, ay = BR.y * SEC + 134;   // BR.y is the crowd's top; +134 world px = the deck / arch-facade line
	const sx = 960 + (ax - cx) * zm, sy = 540 + (ay - cy) * zm, half = BR.w * SEC * 0.5 * zm, zc = half / 1700;
	return [960 - (sx - 960) / zc, 900 - (sy - 540) / zc, zc];
};
const peakDraw = (t: number) => {
	const st = peak, [cx, cy, zm] = peakCam(t); st.setCam(cx, cy, zm);
	const flood = easeOut(clamp01((t - b(54.5)) / 0.65));
	const mastK = 0.2 + 0.8 * clamp01((t - b(54.5)) / 2.6), railK = 0.3 + 0.7 * clamp01((t - b(54.5)) / 1.0), cartK = cartAt(t);
	const rel = t >= b(56);
	pMono.L.mesh.visible = pCol.L.mesh.visible = !rel;
	pMono.draw('mono', (g) => g.drawImage(monoBase, 0, 0, 4096, 1536, 0, 0, FW, FH));
	if (!rel && flood > 0) pCol.draw(`${mastK.toFixed(3)}:${railK.toFixed(3)}:${cartK.toFixed(3)}:${flood.toFixed(3)}`, (g) => {
		g.save(); g.scale(SEC, SEC); g.drawImage(colBase, 0, 0); sprC.cart(g, cartK); sprC.railing(g, railK); sprC.mast(g, mastK); g.restore();
		if (flood < 1) { const fx = UB * FW, fy = VB * FH, r = 40 + flood * 1900, gr = g.createRadialGradient(fx, fy, r * 0.7, fx, fy, r);
			gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalCompositeOperation = 'destination-in'; g.fillStyle = gr; g.fillRect(0, 0, FW, FH); g.globalCompositeOperation = 'source-over'; }
	});
	pCol.L.mat.uniforms.uOpacity.value = flood > 0 ? 1 : 0;
	// relief: 5 layers part in depth around the bridge layer (L3 stays at z 0); shadows grow with the lift
	const cr = easeInOut(clamp01((t - b(56)) / (b(56.75) - b(56)))), SEP = 300;
	for (let i = 0; i < 5; i++) {
		const r = relief[i], z = (i - 3) * SEP * cr, s = (D - z) / D;
		r.L.mat.uniforms.uOpacity.value = rel ? 1 : 0; r.L.mesh.position.copy(st.at(960, 540, z)); r.L.mesh.scale.set(s, s, 1);
		if (r.sh) { const zs = z - 6, ss = (D - zs) / D; r.sh.mat.uniforms.uOpacity.value = rel ? 0.85 * cr : 0; r.sh.mesh.position.copy(st.at(960 + 14 * cr, 540 + 22 * cr, zs)); r.sh.mesh.scale.set(ss, ss, 1); }
	}
	st.setHero(960, 540, 2400);
	const hide = t >= b(56);
	return {st, grade: {vig: 0.32, vigCol: '#1c140e', corners: 1 - clamp01((t - b(56)) / 0.3), exposure: 0.93}, bloom: 0.8, hideFurniture: hide};
};
addScene({id: '28', a: b(54.5) - 0.1, z: b(57) - 0.12, draw: peakDraw, in: {mode: 7, a: b(54.5) - 0.1, z: b(54.5), soft: 0.5}});

// ------------------------------------------------------------------------------------------------ scene 29: the 1950s day crest, 进⑤
const STR = gaitStride('08_04', stepFor(lk50)) * 560;
const staffX = (t: number) => 1250 - ((t - b(57)) / (2 * BEAT)) * STR;
const ground29 = (x: number) => (x < -740 ? 1380 : deck(x));
const cam29 = (t: number): [number, number, number] => {
	const xs = staffX(Math.min(t, b(58.25)));
	const cx = lerp(C29[0], xs - 300, smooth(clamp01((t - b(57)) / 0.9)));
	const p = easeIn(clamp01((t - b(58.25)) / (b(58.75) - b(58.25))));
	const wide: [number, number, number] = [lerp(cx, -2250, p), lerp(C29[1], 760, p), Math.exp(lerp(Math.log(C29[2]), Math.log(1.5), p))];
	// bridge match: the scene opens on the camera that lays the real arch over the painted one, then settles into CR-B
	const s0 = b(57) - 0.12, k = smooth(clamp01((t - s0) / 0.85));
	if (k >= 1) return wide;
	const m = crestMatch(Math.min(t, b(57) + 0.1));
	return [lerp(m[0], wide[0], k), lerp(m[1], wide[1], k), Math.exp(lerp(Math.log(m[2]), Math.log(wide[2]), k))];
};
const drawPassage = (g: CanvasRenderingContext2D) => {
	// the 午门 centre passage (52 × 94 at s 0.9, base 860): warm lamplit vault, its far opening a bright arch
	const cx = 100, base = 140, w = 52, h = 94;
	const arch = (s: number, oy = 0) => { g.beginPath(); g.moveTo(cx - w * s / 2, base - oy); g.lineTo(cx - w * s / 2, base - oy - h * s + w * s / 2); g.arc(cx, base - oy - h * s + w * s / 2, w * s / 2, Math.PI, 0); g.lineTo(cx + w * s / 2, base - oy); g.closePath(); };
	const gr = g.createLinearGradient(0, base - h, 0, base); gr.addColorStop(0, '#6a4526'); gr.addColorStop(1, '#a8703c'); g.fillStyle = gr; arch(1); g.fill();
	g.fillStyle = '#E9D9B0'; arch(0.46, 6); g.fill();
};
addScene({id: '29', a: b(57) - 0.12, z: b(58.5), in: {mode: 7, a: b(57) - 0.12, z: b(57) + 0.06, soft: 0.5}, draw: (t) => {
	const st = day.st, [cx, cy, zm] = cam29(t); st.setCam(cx, cy, zm);
	const u = (t - b(57)) / (2 * BEAT), x1 = staffX(t), x2 = x1 + 330, H2 = 560;
	// front staff carries you in both hands at chest height; the second walks a step behind
	const rc: [number, number] = [x1 - 0.16 * H2, ground29(x1) - 0.66 * H2];
	const rl = 0.24 * H2, e0: [number, number] = [rc[0] - rl / 2, rc[1] + 4], e1: [number, number] = [rc[0] + rl / 2, rc[1] - 4];
	const f1 = rig({x: x1, ground: ground29(x1), h: H2, pose: walkFor(lk50, u), look: lk50, flip: true}, [{side: 'L', target: [e0[0] + 6, e0[1] + 8], name: 'roll end'}, {side: 'R', target: [e1[0] - 6, e1[1] + 8], name: 'roll end'}], ground29, 'staff1');
	const f2 = rig({x: x2, ground: ground29(x2), h: H2 + 8, pose: walkFor(lk50, u + 0.5), look: lk50, flip: true}, [], ground29, 'staff2');
	dayCast.draw(`${Math.round(t * 30)}`, [f2, f1]);
	dayRoll.drawW(`${Math.round(t * 30)}`, (g) => { glowBlob(g, rc, 120, 60, 0.35); drawRoll(g, e0, e1, 15, 1); });
	day.setBoat(1650 - (t - b(57)) * 40, 60); day.setStreak(rc[0], 0.25, t); day.setLanterns(() => 0);
	st.heroAt(rc[0], rc[1], 22, 650);
	return {st, grade: {vig: 0.22, exposure: 1.0}, bloom: 1, hideFurniture: t < b(57)};
}});
