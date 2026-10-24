// Scenes 22–25 (清 → 1923). 22: the 清 dusk crest framed low from the water behind a near boat lowering its mast; a procession
// of Qing officials carries boxes left (进④), one box is you. 23: the scroll's start — five 嘉庆 seal impressions slam onto the
// mounting silk / the first join / the blank opening edge (G2: never on the painted 虹桥), slow pull-back, palace eaves close
// over you to a slit. 24: roofline match onto the far-bank 紫禁城 in snow; the young man hugs the glowing bundle out right
// (出④, T3's framing). 25: snow-gust wipe to a deck-level track — four bundle-carriers one per beat (the 2nd glows), four lines
// of footprints; the camera looks down into the snow, which becomes the ledger page; pull back to the 清宫 night room; the lid
// comes down on your box; into the slats (scene 26 pulls back out of the 伪满 library).
import {Stage, Live, Layer, bar, BEAT, W, H, D, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas, svgDoc, svgToCanvas, hash} from './core';
import {addScene, In, Frame} from './film';
import {Crest, deck, HORIZON, fillSvg} from './crest';
import {Desk} from './rooms';
import {SIL, hall, jiaolou, railing as railingSvg} from './draw';
import {Cast, look, glowBlob, rig, drawBundle, drawFig, Contact} from './actors';
import {LOOKS, LookQ, FigOpts, Pose, P, walkFor, gaitStride, stepFor, toScreen, figurePaths, carryArmful, armfulAt, fkPose, POSES} from './figures';
import {paintSection, paintSeal, silkWeave} from './silk';
import {robeSafe, bowUpper} from './s_teaser';

const b = bar;
export type Cam = [number, number, number];
export const k30 = (t: number) => `${Math.round(t * 30)}`;
export const fillD = (g: CanvasRenderingContext2D, ds: string[], col = SIL) => { g.fillStyle = col; for (const d of ds) g.fill(new Path2D(d)); };
/** screen px of world point (px, py) at depth z under camera cam */
export const proj = (cam: Cam, px: number, py: number, z: number): P => { const [cx, cy, Z] = cam, d = D / Z; return [960 + ((px - 960) * (D - z) - (cx - 960) * D) / (d - z), 540 - ((540 - py) * (D - z) - (540 - cy) * D) / (d - z)]; };
/** world px at depth z that lands on screen (sx, sy) under camera cam */
export const unproj = (cam: Cam, sx: number, sy: number, z: number): P => { const [cx, cy, Z] = cam, d = D / Z; return [960 + ((sx - 960) * (d - z) + (cx - 960) * D) / (D - z), 540 - ((540 - sy) * (d - z) + (540 - cy) * D) / (D - z)]; };
/** screen px per world px for a layer at depth z */
export const scaleAt = (cam: Cam, z: number) => (D - z) / (D / cam[2] - z);
/** the camera (zoom Z) that puts world (wx, wy) at depth z on screen (sx, sy) */
export const camLock = (Z: number, wx: number, wy: number, z: number, sx = 960, sy = 540): Cam => { const d = D / Z; return [960 + ((wx - 960) * (D - z) - (sx - 960) * (d - z)) / D, 540 - ((540 - wy) * (D - z) - (540 - sy) * (d - z)) / D, Z]; };
/** blend two cameras (log zoom) */
export const camMix = (a: Cam, c: Cam, k: number): Cam => [lerp(a[0], c[0], k), lerp(a[1], c[1], k), Math.exp(lerp(Math.log(a[2]), Math.log(c[2]), k))];
export const setCam = (st: Stage, c: Cam) => st.setCam(c[0], c[1], c[2]);
/** place a W×H layer so it exactly covers the screen under camera cam (then draw() in screen px) */
export const fitScreen = (st: Stage, L: Layer, cam: Cam) => { const [cx, cy, Z] = cam, z = L.z, d = D / Z; st.place(L, 960 + ((cx - 960) * D) / (D - z), 540 + ((cy - 540) * D) / (D - z), (d - z) / (D - z)); };
/** canvas transform: draw in reference-screen px on a layer at depth z (world px drawW context) */
export const refTx = (g: CanvasRenderingContext2D, cam: Cam, z: number) => { const o = unproj(cam, 0, 0, z), A = scaleAt(cam, z); g.transform(1 / A, 0, 0, 1 / A, o[0], o[1]); };
/** dim every world material of a stage except the kept ones */
const dimWorld = (st: Stage, keep: Set<any>, r: number, g = r, bl = r) => { for (const m of st.mats) if (!keep.has(m)) m.uniforms.uTint.value.setRGB(r, g, bl); };

// ================================================================================================ shared art
/** the 紫禁城 frontage on the far bank: a long wall with its coping, single hall roofs behind it, a 角楼 (frame px, base = wall foot) */
const HALLS: [number, number, number][] = [[-1180, 380, 168], [-820, 300, 150], [150, 420, 178], [560, 540, 206], [1000, 380, 160], [1390, 320, 150], [1780, 420, 172], [2160, 340, 156]];
const palaceSvg = (x0: number, x1: number, base: number, s: number, col = SIL, ox = 0, sx = 1) => {
	const wallH = 64 * s, X = (x: number) => ox + x * sx;
	let o = `<rect fill="${col}" x="${X(x0).toFixed(1)}" y="${(base - wallH).toFixed(1)}" width="${((x1 - x0) * sx).toFixed(1)}" height="${(wallH + 900).toFixed(1)}"/>`;
	o += `<rect fill="${col}" x="${X(x0).toFixed(1)}" y="${(base - wallH - 10 * s).toFixed(1)}" width="${((x1 - x0) * sx).toFixed(1)}" height="${(13 * s).toFixed(1)}"/>`;
	o += `<rect fill="${col}" x="${X(x0).toFixed(1)}" y="${(base - wallH - 104 * s).toFixed(1)}" width="${((x1 - x0) * sx).toFixed(1)}" height="${(104 * s).toFixed(1)}"/>`;   // the courts behind the wall
	for (const [cx, w, h] of HALLS) if (cx > x0 && cx < x1) o += hall(X(cx), base - wallH, w * s * sx, h * s, 1, col);
	o += jiaolou(X(-360), base - wallH + 4 * s, 0.6 * s * sx, col);
	return o;
};
/** lit windows of the palace frontage (warm, small): rects [x, y, w, h] */
const palaceWindows = (base: number, s: number, ox = 0, sx = 1) => {
	const out: [number, number, number, number][] = []; const wallH = 64 * s;
	HALLS.forEach(([cx, w, h], i) => { const bh = h * s * 0.55, ww = w * s * sx; for (let k = 0; k < 5; k++) { if (hash(i * 7.3 + k * 1.9) < 0.5) continue;
		out.push([ox + cx * sx - ww * 0.33 + k * ww * 0.15, base - wallH - bh * 0.5, ww * 0.035, bh * 0.26]); } });
	return out;
};
/** a cloth bundle hugged to the chest: the kit's bundle; glow = your light leaking through the cloth (else a grey copy) */
const bundle = (g: CanvasRenderingContext2D, c: P, r: number, glow: number, grey = false) => {
	const w = r * 2.9, h = r * 2.0;
	if (grey) { g.save(); g.fillStyle = '#5c5954'; g.beginPath(); g.ellipse(c[0], c[1], w / 2, h / 2, -0.08, 0, Math.PI * 2); g.fill();
		g.strokeStyle = '#3a3834'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(c[0] - w * 0.1, c[1] - h / 2); g.quadraticCurveTo(c[0] + w * 0.05, c[1] - h * 0.65, c[0] + w * 0.12, c[1] - h * 0.48); g.stroke(); g.restore(); return; }
	drawBundle(g, c, w, h);
	if (glow > 0) { g.save(); g.beginPath(); g.ellipse(c[0], c[1], w / 2 - 1, h / 2 - 1, -0.08, 0, Math.PI * 2); g.clip();
		const gr = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], w * 0.55); gr.addColorStop(0, `rgba(255,214,150,${0.85 * glow})`); gr.addColorStop(0.55, `rgba(214,150,84,${0.55 * glow})`); gr.addColorStop(1, 'rgba(90,60,36,0)');
		g.fillStyle = gr; g.fillRect(c[0] - w, c[1] - h, 2 * w, 2 * h);
		g.strokeStyle = `rgba(60,40,26,${0.6 * glow})`; g.lineWidth = 2.5; g.beginPath(); g.moveTo(c[0] - w * 0.32, c[1] - h * 0.3); g.quadraticCurveTo(c[0], c[1] + h * 0.15, c[0] + w * 0.36, c[1] + h * 0.32); g.stroke(); g.restore(); }
};
/** carryArmful-style hug of a bundle while walking: returns the rigged figure and the bundle centre / radius (screen) */
const hugWalk = (lk: LookQ, u: number, x: number, h: number, ground: (x: number) => number, who: string, flip = false) => {
	const base = carryArmful(robeSafe(walkFor(lk, u))), a = armfulAt(base), o: FigOpts = {x, ground: ground(x), h, pose: base, look: lk, flip};
	const R = toScreen(o, [a.c[0] + 0.03, a.c[1] - a.r - 0.014]), L = toScreen(o, [a.c[0] + a.r + 0.008, a.c[1] + 0.012]);
	const f = rig(o, [{side: 'R', target: R, name: 'R under bundle', opt: {dir: 12}}, {side: 'L', target: L, name: 'L round bundle', opt: {dir: -78}}], ground, who);
	return {f, c: toScreen(f, a.c), r: a.r * h};
};
/** arms (+ hands, cuffs) of a figure, to draw over a held prop */
const armPaths = (f: FigOpts) => [...figurePaths({...f, part: 'R'}), ...figurePaths({...f, part: 'L'})];
/** the slatted box face (scene 25's end and 26's start share it): face rect, 5 horizontal boards with 4 gaps; leak = light inside */
export const SLAT = {w: 200, h: 78};
export const slatFace = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, leak: number, wood = '#4a3a2b', dark = '#1a140f') => {
	g.save(); g.fillStyle = dark; g.fillRect(x, y, w, h);
	if (leak > 0) { const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, `rgba(255,196,120,${0.55 * leak})`); gr.addColorStop(0.5, `rgba(255,226,170,${leak})`); gr.addColorStop(1, `rgba(255,196,120,${0.55 * leak})`); g.fillStyle = gr; g.fillRect(x, y, w, h); }
	const n = 5, gap = h * 0.055, bh = (h - gap * (n - 1)) / n;
	for (let i = 0; i < n; i++) { const yy = y + i * (bh + gap);
		const gr = g.createLinearGradient(0, yy, 0, yy + bh); gr.addColorStop(0, '#5a4733'); gr.addColorStop(0.18, wood); gr.addColorStop(1, '#30251b'); g.fillStyle = gr; g.fillRect(x, yy, w, bh);
		g.strokeStyle = 'rgba(25,18,12,0.35)'; g.lineWidth = Math.max(0.6, h * 0.006); for (let k = 0; k < 6; k++) { const gy = yy + bh * (0.2 + 0.12 * k) + Math.sin(i * 3 + k) * bh * 0.03; g.beginPath(); g.moveTo(x, gy); g.bezierCurveTo(x + w * 0.3, gy + bh * 0.04, x + w * 0.6, gy - bh * 0.05, x + w, gy + bh * 0.02); g.stroke(); } }
	g.fillStyle = '#2a2016'; g.fillRect(x, y, w * 0.045, h); g.fillRect(x + w * 0.955, y, w * 0.045, h);          // end battens
	g.fillStyle = '#6b5236'; for (const xx of [x + w * 0.0225, x + w * 0.9775]) for (let i = 0; i < n; i++) { g.beginPath(); g.arc(xx, y + i * (bh + gap) + bh / 2, Math.max(1, h * 0.012), 0, Math.PI * 2); g.fill(); }   // nail heads
	g.restore();
};
/** snow flakes of a gust, drawn in screen px around the wipe edge at screen x ex (same field in both stages) */
const gustFlakes = (g: CanvasRenderingContext2D, ex: number, t: number, k: number) => {
	g.clearRect(0, 0, W, H); if (k <= 0) return;
	for (let i = 0; i < 70; i++) {
		const a = hash(i * 3.17), c = hash(i * 7.31), d = hash(i * 1.93), r = 14 + c * 52, y = a * 1180 - 50 + Math.sin(t * 3 + i) * 20, x = ex + (d - 0.5) * 520 * (0.6 + c) + (t * 900 * (0.4 + c)) % 60;
		const al = (0.35 + 0.5 * c) * k * (1 - Math.abs(d - 0.5) * 1.3);
		if (al <= 0) continue;
		const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(236,242,246,${al})`); gr.addColorStop(0.5, `rgba(226,234,240,${al * 0.55})`); gr.addColorStop(1, 'rgba(220,230,236,0)');
		g.fillStyle = gr; g.save(); g.translate(x, y); g.scale(1.9, 1); g.translate(-x, -y); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore();
	}
};

// ================================================================================================ 22 · Q1 (b37.5 → b39)
// CR-D: the look-point low (the water line), zoomed; the near boat plane (z 330) in front of the arch lowers its mast from b37.75;
// the procession of Qing officials crosses left above (进④ on b38); the 紫禁城 under the span. The horizon layers of this crest are
// lowered to the low eye line, so the far bank shows under the arch (a low camera sees the far bank below the span).
let c22: Crest, cast22: Cast, box22: Live, arms22: Live, glow22: Live, boat22: Live, crewL22: Live, refl22: Live;
const A22 = b(37.25), H22 = 300, Z22 = 0.66;
const LK22: LookQ[] = [{...LOOKS.qingOfficial, beard: 'short'}, {...LOOKS.qingOfficial}, {...LOOKS.qingOfficial, build: 1.05}, {...LOOKS.qingOfficial, beard: 'long', build: 0.97}];
const STR22 = gaitStride('08_04', 0.72) * H22;
const OFF22 = [-262, 0, 258, 520], PH22 = [0.25, 0, 0.625, 0.375];            // phases 0.125 apart mod ½ (no two stride as one)
const xYou22 = (t: number) => 960 - ((t - b(38)) / (2 * BEAT)) * STR22;            // you top the crest on b38 (进④)
const cam22 = (t: number): Cam => {
	const k = smooth((t - A22) / (b(37.8) - A22)), dy = lerp(420, 500, k), Z = lerp(0.70, Z22, k);
	return [1040 + (xYou22(t) - 960) * 0.3, 900 - (dy - 540) / Z, Z];
};
const REF22 = (): Cam => cam22(b(38));
const BOXH = {ox: 0.14, oy: -0.15, hw: 0.105, hh: 0.046};
const ground22 = (x: number) => deck(x) + 4;
const proc22 = (t: number) => {
	const out: {f: FigOpts; c: P; you: boolean}[] = [];
	OFF22.forEach((dx, i) => {
		const x = xYou22(t) + dx, u = (t - b(38)) / (2 * BEAT) + PH22[i], lk = LK22[i];
		const base = robeSafe(walkFor(lk, u)), cb: P = [base.LSh[0] + BOXH.ox, base.LSh[1] + BOXH.oy];
		const o: FigOpts = {x, ground: ground22(x), h: H22 * (i === 2 ? 1.03 : i === 3 ? 0.98 : 1), pose: base, look: lk, flip: true};
		const R = toScreen(o, [cb[0] - 0.035, cb[1] - BOXH.hh - 0.012]), L = toScreen(o, [cb[0] + BOXH.hw + 0.006, cb[1] - 0.006]);
		const f = rig(o, [{side: 'R', target: R, name: 'R under box', opt: {dir: 8}}, {side: 'L', target: L, name: 'L at box end', opt: {dir: -84}}], ground22, `Q1 official ${i}`);
		out.push({f, c: toScreen(f, cb), you: i === 1});
	});
	return out;
};
/** a palace box carried at the chest: dark lacquer, brass corners; yours leaks warm light at the lid seam */
const palaceBox = (g: CanvasRenderingContext2D, c: P, w: number, h: number, you: boolean) => {
	g.save(); g.translate(c[0], c[1]);
	g.fillStyle = '#2e2218'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 2); g.fill();
	g.fillStyle = '#3e2d20'; g.fillRect(-w / 2, -h / 2, w, h * 0.34);
	g.fillStyle = '#7a5e3a'; for (const sx of [-1, 1]) for (const sy of [-1, 1]) g.fillRect(sx * w / 2 - (sx > 0 ? 4 : 0), sy * h / 2 - (sy > 0 ? 4 : 0), 4, 4);
	if (you) { g.fillStyle = '#FFE2A8'; g.fillRect(-w / 2 + 2, -h / 2 + h * 0.34 - 1, w - 4, 2.2); }
	g.restore();
};
/** the near boat in reference-screen px: hull, matting cabin, mast pivoting at (MX, MY) toward the stern (right) */
const NB = {wl: 1012, x0: 470, x1: 2300, MX: 1400, MY: 958, L: 620};
const mast22 = (t: number) => 64 * easeInOut(clamp01((t - b(37.75)) / (b(39) + 0.25 - b(37.75))));
const mastTop = (deg: number): P => [NB.MX + Math.sin((deg * Math.PI) / 180) * NB.L, NB.MY - Math.cos((deg * Math.PI) / 180) * NB.L];
const drawNearBoat = (g: CanvasRenderingContext2D, deg: number, t: number) => {
	const {wl, x0, x1} = NB;
	g.fillStyle = SIL;
	g.beginPath(); g.moveTo(x0, wl - 70); g.quadraticCurveTo(x0 + 40, wl - 10, x0 + 160, wl + 6); g.lineTo(x1, wl + 10); g.lineTo(x1, wl - 40); g.lineTo(x0 + 120, wl - 44); g.quadraticCurveTo(x0 + 50, wl - 50, x0 + 6, wl - 92); g.closePath(); g.fill();
	g.fillRect(x0 + 100, wl - 52, x1 - x0 - 100, 10);                                                              // gunwale
	// the matting cabin (篷): arched roof, ribs
	g.beginPath(); g.moveTo(1580, wl - 46); g.lineTo(1580, wl - 120); g.quadraticCurveTo(1810, wl - 196, 2130, wl - 132); g.lineTo(2130, wl - 46); g.closePath(); g.fill();
	g.strokeStyle = 'rgba(70,52,34,0.55)'; g.lineWidth = 3; for (let x = 1610; x < 2120; x += 46) { g.beginPath(); g.moveTo(x, wl - 50); g.lineTo(x, wl - 118 - Math.sin(((x - 1580) / 550) * Math.PI) * 50); g.stroke(); }
	// rudder post, sweep oar at the stern
	g.strokeStyle = SIL; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(2180, wl - 60); g.lineTo(2300, wl + 60); g.stroke();
	// mast (tabernacle at its foot) + its stay to the bow
	const tp = mastTop(deg); g.fillRect(NB.MX - 12, NB.MY - 30, 24, 40);
	g.lineWidth = 13; g.beginPath(); g.moveTo(NB.MX, NB.MY); g.lineTo(tp[0], tp[1]); g.stroke();
	g.lineWidth = 6; g.beginPath(); const yd = tp[1] + 30; g.moveTo(tp[0] - 26, yd); g.lineTo(tp[0] + 26, yd); g.stroke();   // yard stub
	// water line ripple under the hull
	g.fillStyle = 'rgba(200,170,120,0.18)'; for (let i = 0; i < 9; i++) { const x = x0 + 120 + i * 140 + Math.sin(t * 2 + i) * 12; g.fillRect(x, wl + 14 + (i % 2) * 6, 70, 3); }
};
/** the bow hand easing the forestay: rope from the mast top through both hands to a cleat at the bow */
const CREW = {x: 1225, ground: 962, h: 196, cleat: [1120, 960] as P};
const crew22 = (deg: number) => {
	const top = mastTop(deg), base = fkPose({hip: 0.62, lean: -10, neck: -4, lt: 18, lk: 8, rt: -12, rk: 6, la: 30, le: 30, ra: 34, re: 30});
	const o: FigOpts = {x: CREW.x, ground: CREW.ground, h: CREW.h, pose: base, look: {head: 'bun', dress: 'tunic'} as LookQ};
	const sh = toScreen(o, base.LSh), dx = top[0] - sh[0], dy = top[1] - sh[1], n = Math.hypot(dx, dy), u: P = [dx / n, dy / n];
	const p2: P = [sh[0] + u[0] * 0.27 * CREW.h, sh[1] + u[1] * 0.27 * CREW.h + 0.03 * CREW.h], p1: P = [sh[0] + u[0] * 0.16 * CREW.h, sh[1] + u[1] * 0.16 * CREW.h + 0.07 * CREW.h];
	const f = rig(o, [{side: 'R', target: p2, name: 'R on stay'}, {side: 'L', target: p1, name: 'L on stay'}], () => CREW.ground, 'Q1 boatman');
	return {f, rope: [top, p2, p1, CREW.cleat] as P[]};
};
/** your light on the water: a broken warm streak (on the lowered river) */
const drawRefl = (g: CanvasRenderingContext2D, x: number, y0: number, k: number, t: number) => {
	for (let i = 0; i < 8; i++) { const y = y0 + i * 26 + i * i * 2, w = 50 + i * 22 + Math.sin(t * 2 + i * 1.7) * 12, a = k * (0.5 - i * 0.05); if (a <= 0) continue;
		const gr = g.createLinearGradient(x - w, 0, x + w, 0); gr.addColorStop(0, 'rgba(255,208,138,0)'); gr.addColorStop(0.5, `rgba(255,208,138,${a})`); gr.addColorStop(1, 'rgba(255,208,138,0)');
		g.fillStyle = gr; g.fillRect(x - w + Math.sin(t * 1.3 + i) * 10, y, w * 2, 3 + i * 0.7); }
};
const boot22 = async () => {
	c22 = new Crest('q1-dusk', {sky: 'dusk', era: '清', lanterns: true, boat: false, bankCrowd: true}); await c22.ready;
	const st = c22.st;
	// the low eye line: the far bank, haze, river and its ripples sit lower (so they show under the span); the streak is replaced
	for (const [n, dy] of [['far', 72], ['willows', 72], ['haze', 64], ['river', 96], ['ripples', 96], ['sunglow', 60]] as [string, number][]) { const L = st.get(n); st.place(L, L.cx, L.cy + dy); }
	st.get('streak').mesh.visible = false;
	// the 紫禁城 under the span (a crisp layer in front of the far bank)
	const pal = svgDoc(palaceSvg(-700, 2500, 904, 0.62), 4200, 1200, '', -1200, 0);
	st.add('pal22', canvasTex(await svgToCanvas(pal, 4200, 1200, 0.8)), 900, 600, 4200, 1200, -2350, {fog: [HORIZON.dusk, 0.36]});
	refl22 = new Live(st, 'refl22', 1000, 1300, 3200, 900, -1300, {emissive: 0.9}, 0.4);
	cast22 = new Cast(st, 'cast22', 960, 700, 3000, 900, 20);
	box22 = new Live(st, 'box22', 960, 700, 3000, 900, 21, {rim: 0.5, rimPx: 3}, 1);
	arms22 = new Live(st, 'arms22', 960, 700, 3000, 900, 22, {rim: 1.0, rimPx: 4}, 1);
	glow22 = new Live(st, 'glow22', 960, 700, 3000, 900, 24, {emissive: 1.0}, 0.5);
	boat22 = new Live(st, 'boat22', 1700, 1600, 3600, 2200, 330, {rim: 0.35, rimPx: 6}, 0.6);
	crewL22 = new Live(st, 'crew22', 1700, 1600, 3600, 2200, 331, {rim: 0.6, rimPx: 5}, 0.8);
};
const IN22: In = {mode: 4, a: A22, z: b(37.5), pt: [0.5, 0.4]};
addScene({id: '22', a: A22, z: b(39), in: IN22, draw: (t): Frame => {
	const st = c22.st, cam = cam22(t); setCam(st, cam);
	const P = proc22(t), key = k30(t), you = P[1];
	cast22.draw(key, P.map((p) => p.f));
	const bw = BOXH.hw * 2 * H22, bh = BOXH.hh * 2 * H22;
	box22.drawW(key, (g) => { for (const p of P) palaceBox(g, p.c, bw, bh, p.you); });
	arms22.drawW(key, (g) => { for (const p of P) fillD(g, armPaths(p.f)); });
	glow22.drawW(key, (g) => { glowBlob(g, you.c, 95, 62, 0.42); glowBlob(g, [you.c[0], you.c[1] - bh * 0.16], 30, 8, 0.5, '255,236,190'); });
	c22.setLanterns(() => 1);
	// the near boat + its boatman, drawn in reference-screen px (the boat plane parallaxes with the camera)
	const deg = mast22(t), ref = REF22();
	boat22.drawW(`${deg.toFixed(2)}:${Math.round(t * 10)}`, (g) => { refTx(g, ref, 330); drawNearBoat(g, deg, t); });
	const cr = crew22(deg);
	crewL22.drawW(deg.toFixed(2), (g) => { refTx(g, ref, 331); g.strokeStyle = '#2a1f17'; g.lineWidth = 2.5; g.beginPath(); cr.rope.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke(); drawFig(g, cr.f); });
	refl22.drawW(`${Math.round(you.c[0] / 4)}:${Math.floor(t * 8)}`, (g) => drawRefl(g, you.c[0], 1000, 0.55, t));
	st.heroAt(you.c[0], you.c[1], 21, 700);
	return {st, grade: {vig: 0.34, vigCol: '#1a1410', exposure: 1}, bloom: 1};
}});

// ================================================================================================ 23 · Q2 (b39 → b41)
// SILK insert: the scroll's START. From right to left: the blue brocade wrapper, the front mounting silk (隔水), the first join,
// the blank opening edge of the painting, then the countryside opening (the painter's 'shed' section, its right part). Five
// 嘉庆 impressions slam in one per beat (b39 … b40), on the mounting silk, across the join and in the blank opening edge — never
// on painted figures, never on the 虹桥 (G2). Then a slow pull-back while palace eaves close from top and bottom (b40 → b40.75).
let st23: Stage, seals23: Live, eaves23: Live, eaveTop: HTMLCanvasElement, eaveBot: HTMLCanvasElement;
const SC = {w: 3200, h: 1200, join: 1880, mount1: 2600, k: 1.1};          // canvas px; world px per canvas px
const c2w = (x: number, y: number): P => [960 + (x - SC.w / 2) * SC.k, 540 + (y - SC.h / 2) * SC.k];
// the five seals of 五玺全 (G2), their legends exact; size in canvas px; where: mounting / the join (骑缝) / the blank opening edge
const SEALS: {text: string; x: number; y: number; size: number; style: 'zhu' | 'bai'; tall?: boolean; beat: number; rot: number}[] = [
	{text: '嘉庆御览之宝', x: 2250, y: 590, size: 200, style: 'zhu', beat: 39.0, rot: -0.01},
	{text: '石渠宝笈', x: SC.join, y: 700, size: 172, style: 'zhu', tall: true, beat: 39.25, rot: 0.015},
	{text: '三希堂精鉴玺', x: 2470, y: 556, size: 172, style: 'bai', tall: true, beat: 39.5, rot: -0.012},
	{text: '宜子孙', x: 2470, y: 738, size: 112, style: 'bai', beat: 39.75, rot: 0.01},
	{text: '嘉庆鉴赏', x: 1772, y: 520, size: 124, style: 'zhu', beat: 40.0, rot: -0.008},
];
let sealCvs: HTMLCanvasElement[] = [];
const cam23 = (t: number): Cam => {
	const drift = clamp01((t - b(39)) / (b(40) - b(39))), pull = easeInOut(clamp01((t - b(40)) / (b(41) - b(40))));
	const c0 = c2w(2150, 615), c1 = c2w(1930, 600);
	return camMix([lerp(c0[0], c0[0] - 30, drift), c0[1], lerp(1.15, 1.12, drift)], [c1[0], c1[1], 0.86], pull);
};
const startCanvas = () => {
	const cv = mkCanvas(SC.w, SC.h), g = cv.getContext('2d')!;
	// the painting: blank silk, then the countryside of the opening (the shed section's right half, fading out into the blank edge)
	g.fillStyle = '#EFE0BF'; g.fillRect(0, 0, SC.join, SC.h);
	const shed = paintSection('shed', {width: 2400, height: 900, mode: 'mono', patch: 'donkey', seed: 43, weave: 0});
	const tmp = mkCanvas(SC.join, SC.h), tg = tmp.getContext('2d')!;
	tg.drawImage(shed, 820, 0, 1580, 900, -40, 0, 1580 * (SC.h / 900), SC.h);
	tg.globalCompositeOperation = 'destination-in'; const fade = tg.createLinearGradient(0, 0, SC.join, 0);
	fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(0.76, 'rgba(0,0,0,1)'); fade.addColorStop(0.9, 'rgba(0,0,0,0)'); tg.fillStyle = fade; tg.fillRect(0, 0, SC.join, SC.h);
	g.drawImage(tmp, 0, 0);
	// the opening's mist: a soft wash over the blank edge
	const mist = g.createLinearGradient(SC.join - 400, 0, SC.join, 0); mist.addColorStop(0, 'rgba(236,222,190,0)'); mist.addColorStop(1, 'rgba(236,222,190,0.6)'); g.fillStyle = mist; g.fillRect(SC.join - 600, 0, 600, SC.h);
	// the front mounting silk (隔水): a cool pale damask, a faint lozenge twill with small four-petal flowers
	g.fillStyle = '#E4DCC8'; g.fillRect(SC.join, 0, SC.mount1 - SC.join, SC.h);
	g.save(); g.beginPath(); g.rect(SC.join, 0, SC.mount1 - SC.join, SC.h); g.clip(); g.strokeStyle = 'rgba(140,128,104,0.13)'; g.lineWidth = 2;
	for (let k = -1400; k < 2000; k += 64) { g.beginPath(); g.moveTo(SC.join + k, 0); g.lineTo(SC.join + k + SC.h, SC.h); g.stroke(); g.beginPath(); g.moveTo(SC.join + k + SC.h, 0); g.lineTo(SC.join + k, SC.h); g.stroke(); }
	g.fillStyle = 'rgba(140,128,104,0.16)'; for (let yy = 0; yy < SC.h; yy += 64) for (let xx = SC.join + ((yy / 64) % 2) * 32; xx < SC.mount1; xx += 64) for (let p = 0; p < 4; p++) { g.beginPath(); g.ellipse(xx + Math.cos(p * Math.PI / 2) * 6, yy + 32 + Math.sin(p * Math.PI / 2) * 6, 5, 3, p * Math.PI / 2, 0, Math.PI * 2); g.fill(); }
	g.restore();
	// the outer brocade (blue) and the stave edge at the right end
	g.fillStyle = '#34506A'; g.fillRect(SC.mount1, 0, SC.w - SC.mount1, SC.h);
	g.fillStyle = '#2E4760'; g.fillRect(SC.mount1, 0, SC.w - SC.mount1, SC.h);
	g.strokeStyle = 'rgba(196,164,104,0.28)'; g.lineWidth = 2; for (let yy = 20; yy < SC.h; yy += 40) for (let xx = SC.mount1 + 20 + ((yy / 40) % 2) * 20; xx < SC.w - 50; xx += 40) { g.beginPath(); g.moveTo(xx - 6, yy); g.lineTo(xx, yy - 6); g.lineTo(xx + 6, yy); g.lineTo(xx, yy + 6); g.closePath(); g.stroke(); }
	g.fillStyle = '#2a3e52'; g.fillRect(SC.w - 46, 0, 46, SC.h);
	// joins: a thin seam and a slight overlap shadow
	for (const jx of [SC.join, SC.mount1]) { g.fillStyle = 'rgba(80,62,40,0.35)'; g.fillRect(jx - 2, 0, 4, SC.h); g.fillStyle = 'rgba(80,62,40,0.12)'; g.fillRect(jx + 2, 0, 10, SC.h); }
	// the scroll's top and bottom edge bindings
	g.fillStyle = 'rgba(70,56,40,0.55)'; g.fillRect(0, 0, SC.w, 10); g.fillRect(0, SC.h - 10, SC.w, 10);
	silkWeave(cv, 1, {mode: 'mono', seed: 47});
	return cv;
};
/** the top eave: a palace eave seen from below — brackets, rafter ends, a row of tile ends and drip tiles, corners swept up */
const eaveTopCanvas = () => {
	const c = mkCanvas(W, 640), g = c.getContext('2d')!, eY = (x: number) => 560 - 60 * Math.pow(Math.max(0, 1 - x / 260), 2) - 60 * Math.pow(Math.max(0, 1 - (W - x) / 260), 2);
	g.fillStyle = '#1b1511'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); for (let x = W; x >= 0; x -= 8) g.lineTo(x, eY(x)); g.closePath(); g.fill();
	g.fillStyle = '#251d17'; for (let x = 14; x < W; x += 34) { const y = eY(x); g.beginPath(); g.arc(x, y - 8, 13, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(x + 6, y - 2); g.lineTo(x + 28, y - 2); g.lineTo(x + 17, y + 14); g.closePath(); g.fill(); }
	g.fillStyle = '#120d0a'; for (let x = 20; x < W; x += 22) g.fillRect(x, eY(x) - 70, 12, 34);                          // rafter ends
	g.fillStyle = '#0f0b08'; for (let x = 60; x < W; x += 180) { const y = eY(x) - 120; g.fillRect(x, y, 90, 26); g.fillRect(x + 20, y - 26, 50, 26); g.fillRect(x + 35, y + 26, 20, 20); }   // bracket sets
	return c;
};
const boot23 = async () => {
	st23 = new Stage('q2-start');
	st23.add('table', canvasTex(gradCanvas([[0, '#2a2119'], [0.5, '#3a2e22'], [1, '#231b14']])), 960, 540, 7000, 4000, -300);
	const cv = startCanvas();
	st23.add('silk', canvasTex(cv), 960, 540, SC.w * SC.k, SC.h * SC.k, 0, {emissive: 0.14});
	seals23 = new Live(st23, 'seals23', 960, 540, SC.w * SC.k, SC.h * SC.k, 1, {}, 0.6);
	sealCvs = SEALS.map((s, i) => paintSeal(s.text, {size: Math.round(s.size * 1.3), style: s.style, seed: 811 + i * 17, tall: s.tall, fade: 0.05}));
	eaves23 = new Live(st23, 'eaves23', 960, 540, W, H, 400, {rim: 0.55, rimPx: 6}, 1);
	eaveTop = eaveTopCanvas();
	eaveBot = await svgToCanvas(svgDoc(palaceSvg(-1700, 2600, 860, 1, '#1b1511'), W, H), W, H, 1);
};
const sealAt = (t: number, beat: number) => { const u = t - b(beat); if (u < 0) return 0; return 1 + 0.12 * Math.exp(-u * 16) * Math.cos(u * 40); };
const eaveK = (t: number) => smooth(clamp01((t - b(40)) / (b(40.75) - b(40))));
addScene({id: '23', a: b(39), z: b(41), draw: (t): Frame => {
	const st = st23; let cam = cam23(t);
	const sh = t >= b(39) && t < b(39) + 0.1 ? (Math.round((t - b(39)) * 30) % 2 ? 6 : -6) : 0;      // 3-frame shake on the first seal
	cam = [cam[0] + sh, cam[1] + sh * 0.5, cam[2]]; setCam(st, cam);
	const sk = SEALS.map((s) => sealAt(t, s.beat).toFixed(3)).join(',');
	seals23.drawW(sk, (g) => { SEALS.forEach((s, i) => { const k = sealAt(t, s.beat); if (k <= 0) return; const cv = sealCvs[i], [x, y] = c2w(s.x, s.y), w = (cv.width / 1.3) * SC.k * k, h = (cv.height / 1.3) * SC.k * k;
		g.save(); g.translate(x, y); g.rotate(s.rot); g.globalAlpha = 0.93; g.globalCompositeOperation = 'multiply'; g.drawImage(cv, -w / 2, -h / 2, w, h); g.restore(); }); });
	// the eaves, in screen px on a layer that covers the screen; the bottom one is the far-bank roofline of scene 24's first frame
	const ek = eaveK(t); fitScreen(st, eaves23.L, cam); eaves23.L.mesh.visible = ek > 0;
	eaves23.draw(ek.toFixed(3), (g) => { if (ek <= 0) return; g.drawImage(eaveTop, 0, lerp(-650, -110, ek)); g.drawImage(eaveBot, 0, lerp(560, 0, ek)); });
	st.setHero(960, 540, 1100);
	return {st, grade: {vig: 0.4, vigCol: '#1c140e', corners: 1, exposure: 0.96}, bloom: 0.9};
}});

// ================================================================================================ 24 · P1 (b41 → b42.5)
// Opens on the far-bank 紫禁城 roofline in snow at rest framing (= the eave that closed over you), snow begins on the bass; the
// young man in a long gown and 瓜皮帽 comes from the palace side hugging the glowing bundle and crosses right (出④ on b42); the
// camera settles into T3's framing (bundle on the lock point, zoom 0.94).
let c24: Crest, cast24: Cast, prop24: Live, arms24: Live, glow24: Live, gust24: Live, win24: Live;
const YOUTH = LOOKS.youth1923, YH = 470, YZOOM = 0.94;
const STRY = gaitStride('08_04', stepFor(YOUTH)) * YH;
const x24 = (t: number) => 900 - ((b(42.5) - t) / (2 * BEAT)) * STRY;                 // reaches x 900 on b42.5 (enters from the left ≈ b41.3)
let hugOff: P = [0.128, 0.715];
const lock24 = (t: number): Cam => { const x = x24(t); return camLock(YZOOM, x - hugOff[0] * YH * 1, deck(x) + 4 - hugOff[1] * YH, 22, 960, 580); };
const cam24 = (t: number): Cam => {
	const rest: Cam = [960, 540, lerp(1, 1.012, clamp01((t - b(41)) / 0.9))];
	const k = smooth(clamp01((t - b(41.45)) / (b(42.05) - b(41.45))));
	return camMix(rest, lock24(t), k);
};
const snowDeck = async (st: Stage, z: number, back = 6) => {
	const dk = new Live(st, `deckSnow${z}`, 960, 1100, 4800, 1600, z, {}, 0.5);
	dk.drawW('s', (g) => { g.fillStyle = '#C9D2D8'; g.beginPath(); const xs: number[] = []; for (let x = -1300; x <= 3200; x += 20) xs.push(x);
		xs.forEach((x, i) => (i ? g.lineTo(x, deck(x) - back - 2 * Math.sin(x * 0.05)) : g.moveTo(x, deck(x) - back))); for (const x of xs.slice().reverse()) g.lineTo(x, deck(x) + 3); g.closePath(); g.fill(); });
	return dk;
};
const snowRail = (st: Stage, name: string) => {
	const rl = railingSvg(960, 906, 1700, 1400, 150, 116), dy = (x: number) => deck(x) + 6;
	const rs = new Live(st, name, 960, 1100, 4800, 1600, 41, {}, 0.5);
	rs.drawW('s', (g) => { g.fillStyle = '#D9E1E6';
		for (const [yo, th] of [[150, 7], [67.5, 4]] as [number, number][]) { g.beginPath(); const xs: number[] = []; for (let x = 960 - 1904; x <= 960 + 1904; x += 20) xs.push(x);
			xs.forEach((x, i) => { const y = dy(x) - yo - 4.5 - th * (0.7 + 0.3 * Math.sin(x * 0.031)); i ? g.lineTo(x, y) : g.moveTo(x, y); }); for (const x of xs.slice().reverse()) g.lineTo(x, dy(x) - yo - 3); g.closePath(); g.fill(); }
		for (const [x, y] of rl.posts) { g.beginPath(); g.ellipse(x, y - 13, 10, 5, 0, Math.PI, 0); g.fill(); } });
	return rs;
};
const boot24 = async () => {
	c24 = new Crest('p1-snow', {sky: 'snow', era: '1923', lanterns: true, boat: false, bankCrowd: false, snow: true}); await c24.ready;
	const st = c24.st; st.get('sunglow').mat.uniforms.uOpacity.value = 0.22;
	// the far-bank frontage in snow (crisp): a snow-colour silhouette with the dark one 4 px lower, so snow caps every edge
	const dark = await svgToCanvas(svgDoc(palaceSvg(-1700, 2600, 860, 1), 4400, 1100, '', -1800, 0), 4400, 1100, 1);
	const snow = await svgToCanvas(svgDoc(palaceSvg(-1700, 2600, 860, 1, '#C3CCD2'), 4400, 1100, '', -1800, 0), 4400, 1100, 1);
	const pc = mkCanvas(4400, 1100), pg = pc.getContext('2d')!; pg.drawImage(snow, 0, 0); pg.drawImage(dark, 0, 4);
	st.add('pal24', canvasTex(pc), -1800 + 2200, 550, 4400, 1100, -2400, {fog: [HORIZON.snow, 0.12]});
	win24 = new Live(st, 'win24', 400, 550, 4400, 1100, -2398, {emissive: 0.9}, 1);
	win24.drawW('w', (g) => { for (const [x, y, w, h] of palaceWindows(860, 1)) { g.fillStyle = `rgba(255,184,104,${(0.32 + 0.22 * hash(x)).toFixed(2)})`; g.fillRect(x, y + 4, w, h); } });
	st.get('far').mesh.visible = false;                                          // the stock far bank's gate tower would break the roofline match
	await snowDeck(st, 1); snowRail(st, 'railSnow24');
	cast24 = new Cast(st, 'cast24', 1200, 640, 3600, 1100, 20);
	prop24 = new Live(st, 'prop24', 1200, 640, 3600, 1100, 22, {rim: 0.4, emissive: 0.35}, 1);
	arms24 = new Live(st, 'arms24', 1200, 640, 3600, 1100, 23, {rim: 1.0, rimPx: 5}, 1);
	glow24 = new Live(st, 'glow24', 1200, 640, 3600, 1100, 24, {emissive: 1.0}, 0.5);
	gust24 = new Live(st, 'gust24', 960, 540, W, H, 600, {}, 0.5, 9800);
	let sx = 0, sy = 0; for (let i = 0; i < 16; i++) { const a = armfulAt(carryArmful(walkFor(YOUTH, i / 16))); sx += a.c[0] / 16; sy += a.c[1] / 16; } hugOff = [sx, sy];
};
/** the snow-gust wipe 24 → 25 (scene 25's IN): a light-edged wipe left → right with big flakes riding the edge */
const GUST: In = {mode: 12, a: b(42.5) - 0.24, z: b(42.5) + 0.05, dir: [1, 0], soft: 0.075, ease: smooth};
const gustEdge = (t: number) => { const k = smooth(clamp01((t - GUST.a) / (GUST.z - GUST.a))), s = GUST.soft!; return (k * (1 + 2 * s) - s) * W; };
const gustK = (t: number) => clamp01((t - GUST.a + 0.06) / 0.08) * clamp01((GUST.z + 0.08 - t) / 0.08);
const drawGust = (st: Stage, L: Live, cam: Cam, t: number) => { const k = gustK(t); L.L.mesh.visible = k > 0; if (k <= 0) return; fitScreen(st, L.L, cam); L.draw(k30(t), (g) => gustFlakes(g, gustEdge(t), t, k)); };
addScene({id: '24', a: b(41), z: GUST.a, draw: (t): Frame => {
	const st = c24.st, cam = cam24(t); setCam(st, cam);
	const u = (t - b(41)) / (2 * BEAT), x = x24(t), key = k30(t);
	const h = hugWalk(YOUTH, u, x, YH, (q) => deck(q) + 4, 'P1 youth');
	cast24.draw(key, [h.f]);
	prop24.drawW(key, (g) => bundle(g, h.c, h.r, 1));
	arms24.drawW(key, (g) => fillD(g, armPaths(h.f)));
	glow24.drawW(key, (g) => { glowBlob(g, h.c, 120, 90, 0.34); glowBlob(g, h.c, 40, 30, 0.42, '255,226,170'); });
	c24.setLanterns(() => 0); c24.setStreak(h.c[0], 0.35, t);
	c24.motes?.update(t, [-1200, -300, 3200, 1300], 70, 24, 0.85 * smooth(clamp01((t - b(41)) / 0.35)));
	drawGust(st, gust24, cam, t);
	st.heroAt(h.c[0], h.c[1], 22, 430);
	return {st, grade: {vig: 0.4, exposure: 1}, bloom: 1};
}});

// ================================================================================================ 25 · P2 → P3 (b42.5 → b46)
// (a) deck-level side-on track in the snow: four gowned figures cross left → right one per beat (a time-lapse: 25 days), each
// hugging a bundle; the 2nd glows (you, 1923-01-04), the others are grey. Their footprints press into the snow on the deck top
// in four lines. b43.5 → b44.5 nothing new. b44.5 the camera looks down into the snow: the deck top fills the frame (a crane-up
// tilt faked by the deck surface opening up), then the white field becomes paper (b) — the ledger page on its stand in the
// 清宫 night room: the two 「张择端清明上河图一卷」 entries ink in warm (b45, b45.25), the other two stay unlit; pull back to the desk:
// the grey roll beside it, the young man already holding the lid over the open slatted box with your glow inside; the lid
// comes down (b45.5 → b45.75); into the slats (b45.75 → b46): the cut to scene 26 hides in the close-up.
let c25: Crest, cast25: Cast, prop25: Live, arms25: Live, glow25: Live, gust25: Live, top25: Live, prints25: Live, rail25: Layer[] = [];
const Z25 = 0.84, H25 = 470, STR25 = gaitStride('08_04', stepFor(YOUTH)) * H25, V25 = 840;       // world px/s: a 2.5× time-lapse
const ROWS = [1, 3, 0, 2];                                                                         // deck-top row of each crossing (0 = front)
const enter25 = (i: number) => b(42.5 + 0.25 * i) - 0.12;
const tilt25 = (t: number) => easeInOut(clamp01((t - b(44.5)) / (b(44.75) - b(44.5) + 0.04)));
const camX25 = (t: number) => 980 + (t - b(42.5)) * 34;
const XL25 = (i: number) => unproj([camX25(enter25(i)), 0, Z25], -170, 0, 20)[0];
const x25 = (i: number, t: number) => XL25(i) + (t - enter25(i)) * V25;
/** the deck top as a surface: front edge at deck + 6, back edge rising as the camera looks down (q 0 → 1) */
const topBack = (x: number, q: number) => deck(x) - 40 - 640 * q;
const rowY = (x: number, r: number, q: number) => { const yf = deck(x) + 6, yb = topBack(x, q); return yf + (yb - yf) * ((r + 0.7) / 4.6); };
const cam25 = (t: number): Cam => {
	const q = tilt25(t), cx = camX25(Math.min(t, b(44.5))), x = cx;
	const look: Cam = [cx, 900 - (782 - 540) / Z25, Z25];
	const yf = deck(x) + 6, yb = topBack(x, 1), down: Cam = [cx + 40, (yf + yb) / 2 - 10, 1080 * 1.12 / (yf - yb) * 1.0];
	return camMix(look, down, q);
};
const boot25a = async () => {
	c25 = new Crest('p2-snow', {sky: 'snow', era: '1923', lanterns: true, boat: false, bankCrowd: false, snow: true}); await c25.ready;
	const st = c25.st; st.get('sunglow').mat.uniforms.uOpacity.value = 0.22;
	const fw = new Live(st, 'farWin25', 960, 850, 8400, 200, -2540, {emissive: 0.9}, 0.5);
	fw.drawW('w', (g) => { for (let i = 0; i < 60; i++) { const x = -1600 + i * 75 + hash(i * 3.3) * 50, y = 818 + hash(i * 7.1) * 26; if (hash(i * 1.9) < 0.35) continue; g.fillStyle = `rgba(255,184,104,${0.55 + 0.3 * hash(i)})`; g.fillRect(x, y, 9 + (i % 3) * 3, 6 + (i % 2) * 2); } });
	top25 = new Live(st, 'top25', 1200, 900, 3600, 1800, 1, {}, 0.6);
	prints25 = new Live(st, 'prints25', 1200, 900, 3600, 1800, 2, {}, 0.6);
	snowRail(st, 'railSnow25');
	rail25 = [st.get('rail'), st.get('railSnow25'), st.get('lanterns'), st.get('lglow')];
	cast25 = new Cast(st, 'cast25', 1200, 640, 4400, 1100, 20);
	prop25 = new Live(st, 'prop25', 1200, 640, 4400, 1100, 22, {rim: 0.4, emissive: 0.0}, 1);
	arms25 = new Live(st, 'arms25', 1200, 640, 4400, 1100, 23, {rim: 1.0, rimPx: 5}, 1);
	glow25 = new Live(st, 'glow25', 1200, 640, 4400, 1100, 24, {emissive: 1.0}, 0.5);
	gust25 = new Live(st, 'gust25', 960, 540, W, H, 600, {}, 0.5, 9800);
};
/** footprints: the stance positions of crossing i up to its current x (dark dents, softened by settling snow) */
const prints = (g: CanvasRenderingContext2D, i: number, t: number, q: number) => {
	if (t < enter25(i)) return; const xNow = x25(i, t), r = ROWS[i], half = STR25 / 2, x0 = XL25(i);
	const set = clamp01((t - b(43.5)) / (b(44.5) - b(43.5)));                       // snow settling into them
	for (let n = 0; ; n++) { const x = x0 + (n + 0.35) * half + (n % 2 ? 10 : -10); if (x > xNow - 30) break;
		const y = rowY(x, r, q), s = 1 + q * 9, a = 0.7 - 0.25 * set;
		g.fillStyle = `rgba(52,58,64,${a})`; g.beginPath(); g.ellipse(x, y, 13 * s * 0.8, 3.2 * s, 0, 0, Math.PI * 2); g.fill();
		g.fillStyle = `rgba(240,244,246,${0.5 * a})`; g.beginPath(); g.ellipse(x + 1, y - 2.2 * s, 12 * s * 0.8, 1.4 * s, 0, 0, Math.PI); g.fill(); }
};
const draw25a = (t: number): Frame => {
	const st = c25.st, cam = cam25(t), q = tilt25(t); setCam(st, cam);
	const key = k30(t), figs: FigOpts[] = [], held: {c: P; r: number; i: number}[] = [];
	for (let i = 3; i >= 0; i--) { if (t < enter25(i)) continue; const x = x25(i, t); if (x > 4000) continue; const r = ROWS[i], hh = H25 * (1 - 0.02 * r);
		const gr = (xx: number) => rowY(xx, r, 0) + 1;
		const hw = hugWalk(YOUTH, (x - XL25(i)) / STR25 + i * 0.281, x, hh, gr, `P2 carrier ${i}`);
		figs.push(hw.f); held.push({c: hw.c, r: hw.r, i}); }
	const show = q < 0.02;
	cast25.L.L.mesh.visible = prop25.L.mesh.visible = arms25.L.mesh.visible = glow25.L.mesh.visible = show;
	cast25.draw(key, figs);
	prop25.drawW(key, (g) => { for (const h of held) bundle(g, h.c, h.r, h.i === 1 ? 1 : 0, h.i !== 1); });
	prop25.L.mat.uniforms.uEmissive.value = 0.3;
	arms25.drawW(key, (g) => { for (const f of figs) fillD(g, armPaths(f)); });
	const you = held.find((h) => h.i === 1);
	glow25.drawW(key, (g) => { if (!you) return; glowBlob(g, you.c, 120, 90, 0.34); glowBlob(g, you.c, 40, 30, 0.42, '255,226,170'); });
	// the deck top: snow surface (opens up as the camera looks down) + the four lines of footprints
	top25.drawW(q.toFixed(3), (g) => { const xs: number[] = []; for (let x = -1000; x <= 3400; x += 20) xs.push(x);
		const gr = g.createLinearGradient(0, deck(960) - 40 - 640 * q, 0, deck(960) + 6); gr.addColorStop(0, '#AEB9C0'); gr.addColorStop(1, '#D3DBE0'); g.fillStyle = gr;
		g.beginPath(); xs.forEach((x, i) => (i ? g.lineTo(x, topBack(x, q)) : g.moveTo(x, topBack(x, q)))); for (const x of xs.slice().reverse()) g.lineTo(x, deck(x) + 6); g.closePath(); g.fill();
		if (q > 0) { g.globalAlpha = 0.35 * q; for (let k = 0; k < 900; k++) { const x = -800 + hash(k * 1.7) * 4000, f = hash(k * 3.1), y = topBack(x, q) + f * (deck(x) + 6 - topBack(x, q)); g.fillStyle = k % 3 ? '#E8EEF1' : '#9EA9B0'; g.fillRect(x, y, 3 + 5 * q, 2 + 3 * q); } g.globalAlpha = 1; } });
	prints25.drawW(`${key}:${q.toFixed(3)}`, (g) => { for (let i = 0; i < 4; i++) prints(g, i, t, q); });
	// looking down: the near railing drops out of the bottom of the frame
	for (const L of rail25) { st.place(L, L.cx, (L === rail25[0] || L === rail25[1] ? 1100 : 1100) + q * 900); }
	c25.setLanterns(() => 0); c25.setStreak(you ? you.c[0] : 0, you ? 0.3 : 0, t);
	c25.motes?.update(t, [-1200, -300, 3600, 1600], 70, 24, 0.85);
	drawGust(st, gust25, cam, t);
	if (you) st.heroAt(you.c[0], you.c[1], 22, 430); else st.setHero(-9999, 0, 1);
	return {st, grade: {vig: 0.4, exposure: 1}, bloom: 1};
};
addScene({id: '25', a: GUST.a, z: b(44.66), in: GUST, draw: draw25a});

// ---------------------------------------------------------------------------------------------------- 25 (b): the ledger, the box
let desk25: Desk, page25: Live, roll25: Live, box25: Live, lid25: Live, cast25b: Cast, arms25b: Live, glow25b: Live;
const PG = {x0: 560, x1: 980, y0: 456, y1: 716, z: -34};                                         // the open ledger on its stand (world px)
const BX = {x0: 1250, y0: 690, w: SLAT.w, h: SLAT.h, z: -31};                                      // the slatted box on the desk (front face)
const TOP25 = 768;                                                                                  // desk top (front edge) in this set
const ENTRIES = [{s: '仇英仿张择端清明上河图一卷', lit: -1}, {s: '张择端清明上河图一卷', lit: 45.0}, {s: '谢遂仿明人清明上河图一卷', lit: -1}, {s: '张择端清明上河图一卷', lit: 45.25}];
/** stand-in brush strokes for the unlit entries and the rest of the list (never legible) */
const scribble = (g: CanvasRenderingContext2D, cx: number, cy: number, s: number, seed: number, col: string) => {
	g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = s * 0.09; const r = (k: number) => hash(seed * 3.7 + k * 1.3);
	for (let k = 0; k < 3 + Math.floor(r(0) * 3); k++) { const y = cy - s * 0.4 + r(k + 1) * s * 0.8, x0 = cx - s * 0.42 + r(k + 7) * s * 0.2; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + s * (0.5 + r(k + 3) * 0.3), y - s * 0.05); g.stroke(); }
	if (r(9) < 0.8) { const x = cx - s * 0.1 + r(10) * s * 0.2; g.beginPath(); g.moveTo(x, cy - s * 0.45); g.lineTo(x + s * 0.02, cy + s * 0.45); g.stroke(); }
};
const ledgerArt = (g: CanvasRenderingContext2D, t: number) => {
	const {x0, x1, y0, y1} = PG, w = x1 - x0, h = y1 - y0;
	// the stand: two legs and a ledge on the desk top, leaning back
	g.fillStyle = SIL; g.fillRect(x0 + 30, y1 - 6, w - 60, 14); g.beginPath(); g.moveTo(x0 + 60, y1 + 8); g.lineTo(x0 + 80, TOP25); g.lineTo(x0 + 96, TOP25); g.lineTo(x0 + 78, y1 + 8); g.fill(); g.beginPath(); g.moveTo(x1 - 60, y1 + 8); g.lineTo(x1 - 80, TOP25); g.lineTo(x1 - 96, TOP25); g.lineTo(x1 - 78, y1 + 8); g.fill();
	// the open register: two leaves, a slight gutter, ruled columns, a thin cover edge
	g.fillStyle = '#3a2f26'; g.fillRect(x0 - 8, y0 - 6, w + 16, h + 10);
	const pg = g.createLinearGradient(x0, 0, x1, 0); pg.addColorStop(0, '#DDCFAE'); pg.addColorStop(0.48, '#E9DDBE'); pg.addColorStop(0.5, '#C9BB98'); pg.addColorStop(0.52, '#E9DDBE'); pg.addColorStop(1, '#E2D5B4'); g.fillStyle = pg; g.fillRect(x0, y0, w, h);
	g.strokeStyle = 'rgba(110,88,62,0.35)'; g.lineWidth = 0.8; const cw = w / 2 / 6;
	for (let s = 0; s < 2; s++) { const lx = x0 + s * w / 2; g.strokeRect(lx + 10, y0 + 14, w / 2 - 20, h - 28); for (let c = 1; c < 6; c++) { g.beginPath(); g.moveTo(lx + 10 + c * (w / 2 - 20) / 6, y0 + 14); g.lineTo(lx + 10 + c * (w / 2 - 20) / 6, y1 - 14); g.stroke(); } }
	// columns right → left on the right leaf: the four entries; the left leaf: the rest of the list (stand-ins)
	const colX = (c: number, leaf: number) => x0 + leaf * w / 2 + 10 + (5.5 - c) * (w / 2 - 20) / 6, gs = 19.5, pitch = 20.8;
	ENTRIES.forEach((e, c) => {
		const lit = e.lit > 0 ? clamp01((t - b(e.lit)) / 0.24) : 0, chars = [...e.s], n = chars.length, x = colX(c + 1, 1);
		if (e.lit < 0) { for (let i = 0; i < n; i++) scribble(g, x, y0 + 30 + i * pitch, gs * 0.9, c * 31 + i, 'rgba(70,58,44,0.32)'); return; }
		g.font = `600 ${gs}px "Noto Serif CJK SC"`; g.textAlign = 'center'; g.textBaseline = 'middle';
		for (let i = 0; i < n; i++) { const a = clamp01(lit * n - i); g.fillStyle = `rgba(150,120,90,0.2)`; if (lit <= 0) scribble(g, x, y0 + 30 + i * pitch, gs * 0.9, c * 31 + i, 'rgba(70,58,44,0.28)');
			if (a > 0) { g.fillStyle = `rgba(42,31,23,${a})`; g.fillText(chars[i], x, y0 + 30 + i * pitch); } }
	});
	for (let c = 0; c < 6; c++) for (let i = 0; i < 10; i++) scribble(g, colX(c, 0), y0 + 30 + i * pitch, gs * 0.85, 400 + c * 13 + i, 'rgba(70,58,44,0.3)');
	scribble(g, colX(0, 1), y0 + 30, gs * 0.9, 900, 'rgba(70,58,44,0.3)'); scribble(g, colX(0, 1), y0 + 30 + pitch, gs * 0.9, 901, 'rgba(70,58,44,0.3)');
};
/** the young man behind the desk holding the lid: lid y (world) as it comes down */
const LIDY = (t: number) => lerp(BX.y0 - 96, BX.y0 - 6, easeInOut(clamp01((t - b(45.5)) / (b(45.75) - b(45.5)))));
const packer = (t: number) => {
	const ly = LIDY(t), down = clamp01((ly - (BX.y0 - 96)) / 90), o: FigOpts = {x: 1610, ground: 1086, h: 760, pose: bowUpper(POSES.stand, 8 + 24 * down), look: YOUTH, flip: true};
	return rig(o, [{side: 'L', target: [BX.x0 + 34, ly + 4], name: 'L on lid'}, {side: 'R', target: [BX.x0 + BX.w - 22, ly + 4], name: 'R on lid'}], () => 1086, 'P3 packer');
};
const cam25b = (t: number): Cam => {
	const close = camLock(4.15, (PG.x0 + PG.x1) / 2 + 60, (PG.y0 + PG.y1) / 2 + 4, PG.z, 960, 560);
	const wide: Cam = [1060, 600, 1.12];
	const fc = (BX.x0 + BX.w / 2), slats = camLock(12.5, fc, BX.y0 + BX.h / 2, BX.z, 960, 560);
	if (t < b(45.25)) return camMix(close, [close[0] - 10, close[1] + 4, close[2] * 1.03], clamp01((t - b(44.66)) / (b(45.25) - b(44.66))));
	if (t < b(45.75)) return camMix(close, wide, easeInOut(clamp01((t - b(45.25)) / (b(45.5) - b(45.25)))));
	return camMix(wide, slats, easeIn(clamp01((t - b(45.75)) / (b(46) - b(45.75)))) ** 0.8);
};
const boot25b = async () => {
	desk25 = new Desk('qing'); await desk25.ready;
	const st = desk25.st;
	desk25.lamp.L.mat.uniforms.uEmissive.value = 0.9;
	desk25.lamp.draw('lamp', (g) => { const x = 392, y = 700; g.fillStyle = SIL; g.fillRect(x - 26, TOP25 - 12, 52, 12); g.fillRect(x - 5, y, 10, TOP25 - y); g.beginPath(); g.ellipse(x, y - 30, 30, 40, 0, 0, Math.PI * 2); g.fill();
		g.fillStyle = '#E9A35E'; g.beginPath(); g.ellipse(x, y - 30, 22, 31, 0, 0, Math.PI * 2); g.fill(); glowBlob(g, [x, y - 30], 120, 120, 0.22, '255,184,104'); });
	page25 = new Live(st, 'page25', (PG.x0 + PG.x1) / 2, 620, 520, 340, PG.z, {rim: 0.3, emissive: 0.05}, 4.2);
	roll25 = new Live(st, 'roll25', 1080, 740, 300, 60, -33, {rim: 0.6}, 2);
	roll25.drawW('r', (g) => { const y = TOP25 - 15, gr = g.createLinearGradient(0, y - 11, 0, y + 11); gr.addColorStop(0, '#8E8A82'); gr.addColorStop(0.45, '#B7B2A8'); gr.addColorStop(1, '#5E5A54');
		g.fillStyle = gr; g.beginPath(); g.roundRect(985, y - 11, 190, 22, 6); g.fill(); g.fillStyle = '#4A4E54'; g.fillRect(985, y - 11, 12, 22); g.fillRect(1163, y - 11, 12, 22); g.fillStyle = '#9A968E'; for (const x of [981, 1179]) { g.beginPath(); g.ellipse(x, y, 4, 8, 0, 0, Math.PI * 2); g.fill(); } });
	box25 = new Live(st, 'box25', BX.x0 + BX.w / 2, BX.y0 + 20, 300, 180, BX.z, {rim: 0.5}, 9);
	lid25 = new Live(st, 'lid25', BX.x0 + BX.w / 2, 640, 340, 280, -30, {rim: 0.8, rimPx: 4}, 3);
	cast25b = new Cast(st, 'cast25b', 1400, 700, 900, 1000, -45);
	arms25b = new Live(st, 'arms25b', 1400, 700, 900, 1000, -29, {rim: 1.0, rimPx: 5}, 1);
	glow25b = new Live(st, 'glow25b', 1100, 640, 1400, 700, -28, {emissive: 1.0}, 0.6);
};
/** the open box (seen side-on, a little from above): your glow inside; then the lid closes */
const drawBox25 = (g: CanvasRenderingContext2D, t: number, leak: number) => {
	const {x0, y0, w, h} = BX, ly = LIDY(t), open = clamp01((y0 - 6 - ly) / 90);
	g.fillStyle = '#241b13'; g.fillRect(x0 - 2, y0 - 10, w + 4, 12);                                                     // the open top edge (inside)
	if (open > 0) { const gr = g.createLinearGradient(0, y0 - 10, 0, y0 + 2); gr.addColorStop(0, `rgba(255,226,170,${0.95 * open})`); gr.addColorStop(1, `rgba(255,190,110,${0.4 * open})`); g.fillStyle = gr; g.fillRect(x0 + 6, y0 - 9, w - 12, 9); }
	slatFace(g, x0, y0, w, h, leak);
};
const draw25b = (t: number): Frame => {
	const st = desk25.st, cam = cam25b(t); setCam(st, cam);
	page25.drawW(`${clamp01((t - b(45)) / 0.24).toFixed(2)}:${clamp01((t - b(45.25)) / 0.24).toFixed(2)}`, (g) => ledgerArt(g, t));
	const lidOpen = clamp01((BX.y0 - 6 - LIDY(t)) / 90), into = clamp01((t - b(45.75)) / (b(46) - b(45.75)));
	const leak = (0.35 + 0.65 * (1 - lidOpen)) * (1 - smooth(clamp01((t - (b(46) - 0.1)) / 0.1)));         // the light dims as the lid shuts it in (scene 26 has none)
	box25.drawW(`${LIDY(t).toFixed(1)}:${leak.toFixed(2)}`, (g) => drawBox25(g, t, leak));
	box25.L.mat.uniforms.uEmissive.value = 0.25 * leak;
	const f = packer(t), key = k30(t), ly = LIDY(t);
	cast25b.draw(key, [f]);
	lid25.drawW(ly.toFixed(1), (g) => { g.fillStyle = '#3a2d20'; g.fillRect(BX.x0 - 6, ly - 10, BX.w + 12, 14); g.fillStyle = '#4c3b2a'; g.fillRect(BX.x0 - 6, ly - 10, BX.w + 12, 4);
		g.fillStyle = '#2a2016'; for (let k = 0; k < 6; k++) g.fillRect(BX.x0 + k * (BX.w / 5) - 2, ly - 10, 3, 14); });
	arms25b.drawW(key, (g) => fillD(g, armPaths(f)));
	const gc: P = [BX.x0 + BX.w / 2, BX.y0 - 8];
	glow25b.drawW(`${lidOpen.toFixed(2)}:${leak.toFixed(2)}`, (g) => { glowBlob(g, gc, 150, 70 + 50 * lidOpen, 0.3 * (0.4 + 0.6 * lidOpen) * leak); glowBlob(g, [(PG.x0 + PG.x1) / 2, (PG.y0 + PG.y1) / 2], 300, 200, 0.06 * (1 - into)); });
	st.heroAt(gc[0], gc[1] - 10, BX.z, 520 + 300 * lidOpen);
	const cl = clamp01((t - b(44.66)) / 0.01) * (1 - easeInOut(clamp01((t - b(45.25)) / (b(45.5) - b(45.25)))));
	return {st, grade: {vig: 0.42, vigCol: '#140e0a', exposure: 1, corners: 0.85 * cl}, bloom: 1};
};
addScene({id: '25b', a: b(44.66), z: b(46), in: {mode: 7, a: b(44.66), z: b(44.66) + 0.13, ease: smooth}, draw: draw25b});

// ================================================================================================ boot
export const bootQing = async () => { await boot22(); await boot23(); await boot24(); await boot25a(); await boot25b(); (window as any).QDBG = {desk25, c25}; };
