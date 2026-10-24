// Actors: figures on live canvas layers, and "you" (the scroll) as open silk between rollers, a rolled roll, a bundle.
import {Stage, Live, PaintOpts} from './core';
import {figurePaths, FigOpts, LOOKS, LookName, Pose, handAt, toBody, reach, P} from './figures';

export const SILHOUETTE = '#15100C';
/** draw a figure on a canvas context in world px */
export const drawFig = (g: CanvasRenderingContext2D, o: FigOpts, col = SILHOUETTE) => { g.fillStyle = col; for (const d of figurePaths(o)) g.fill(new Path2D(d)); };
export const look = (n: LookName) => LOOKS[n];

/** a figure layer (rimmed by the hero) covering a world box */
export class Cast {
	L: Live;
	constructor(st: Stage, name: string, cx: number, cy: number, w: number, h: number, z: number, o: PaintOpts = {}, res = 1) { this.L = new Live(st, name, cx, cy, w, h, z, {rim: 1.0, rimPx: 6, ...o}, res); }
	/** draw several figures (and any extra paint) — key decides when to redraw */
	draw(key: string, figs: FigOpts[], extra?: (g: CanvasRenderingContext2D) => void, col = SILHOUETTE) { this.L.drawW(key, (g) => { for (const f of figs) drawFig(g, f, col); extra?.(g); }); }
}

/** roller (vertical, for an open scroll) with blue mount and ivory knobs */
export const drawRoller = (g: CanvasRenderingContext2D, x: number, yc: number, h: number, w = 18) => {
	g.fillStyle = '#34506A'; g.strokeStyle = '#D2AE6A'; g.lineWidth = 2; const r = w * 0.4;
	g.beginPath(); g.roundRect(x - w / 2, yc - h / 2, w, h, r); g.fill(); g.stroke();
	g.fillStyle = '#EADCC0'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x, yc + s * (h / 2 + 3), w * 0.62, w * 0.34, 0, 0, Math.PI * 2); g.fill(); }
};
/** open silk between two roller x positions; source = a painted canvas, sx = horizontal window into it (0..1) */
export const drawSilk = (g: CanvasRenderingContext2D, x0: number, x1: number, yc: number, h: number, src: HTMLCanvasElement | null, sx0 = 0.3, sx1 = 0.55, glow = 1) => {
	const w = x1 - x0; if (w <= 2) return;
	g.save(); g.beginPath(); g.rect(x0, yc - h / 2, w, h); g.clip();
	g.fillStyle = '#FFF3D8'; g.fillRect(x0, yc - h / 2, w, h);
	if (src) { const sw = src.width * (sx1 - sx0), sh = src.height; g.globalAlpha = 0.92; g.drawImage(src, src.width * sx0, 0, sw, sh, x0, yc - h / 2, w, h); g.globalAlpha = 1; }
	// mount borders top/bottom
	g.fillStyle = 'rgba(52,80,106,0.85)'; g.fillRect(x0, yc - h / 2, w, h * 0.07); g.fillRect(x0, yc + h / 2 - h * 0.07, w, h * 0.07);
	if (glow < 1) { g.fillStyle = `rgba(20,16,12,${(1 - glow).toFixed(3)})`; g.fillRect(x0, yc - h / 2, w, h); }
	g.restore();
};
/** a rolled scroll (horizontal cylinder) from p0 to p1 with radius r: glowing silk body + mount ends */
export const drawRoll = (g: CanvasRenderingContext2D, p0: P, p1: P, r: number, glow = 1, grey = false) => {
	const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
	g.save(); g.translate(p0[0], p0[1]); g.rotate(a);
	const gr = g.createLinearGradient(0, -r, 0, r);
	if (grey) { gr.addColorStop(0, '#8E8A82'); gr.addColorStop(0.45, '#B7B2A8'); gr.addColorStop(1, '#5E5A54'); }
	else { gr.addColorStop(0, '#F6D9A2'); gr.addColorStop(0.45, '#FFF3D8'); gr.addColorStop(1, '#D9B07A'); }
	g.globalAlpha = grey ? 1 : 0.35 + 0.65 * glow; g.fillStyle = gr; g.beginPath(); g.roundRect(0, -r, L, 2 * r, r * 0.4); g.fill(); g.globalAlpha = 1;
	g.fillStyle = '#34506A'; g.fillRect(0, -r, L * 0.06, 2 * r); g.fillRect(L * 0.94, -r, L * 0.06, 2 * r);
	g.fillStyle = '#EADCC0'; for (const x of [-r * 0.25, L + r * 0.25]) { g.beginPath(); g.ellipse(x, 0, r * 0.35, r * 0.7, 0, 0, Math.PI * 2); g.fill(); }
	g.restore();
};
/** a cloth bundle (for 1923) with glow leaking through */
export const drawBundle = (g: CanvasRenderingContext2D, c: P, w: number, h: number, glow = 1) => {
	g.save(); g.fillStyle = '#2b2620'; g.beginPath(); g.ellipse(c[0], c[1], w / 2, h / 2, -0.08, 0, Math.PI * 2); g.fill();
	g.strokeStyle = '#191510'; g.lineWidth = 3; g.beginPath(); g.moveTo(c[0] - w * 0.1, c[1] - h / 2); g.quadraticCurveTo(c[0] + w * 0.05, c[1] - h * 0.65, c[0] + w * 0.12, c[1] - h * 0.48); g.stroke(); g.restore();
	return glow;
};
/** emissive glow helpers (drawn on an emissive layer) */
export const glowBlob = (g: CanvasRenderingContext2D, c: P, rx: number, ry: number, a: number, col = '255,214,150') => {
	if (a <= 0) return; const gr = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], Math.max(rx, ry));
	gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.5, `rgba(${col},${a * 0.35})`); gr.addColorStop(1, `rgba(${col},0)`);
	g.save(); g.translate(c[0], c[1]); g.scale(1, ry / rx); g.translate(-c[0], -c[1]); g.fillStyle = gr; g.beginPath(); g.arc(c[0], c[1], rx, 0, Math.PI * 2); g.fill(); g.restore();
};
export {reach, handAt, toBody};
export type {Pose, FigOpts, P};

// ------------------------------------------------------------------------------------------------ rig + contact check
import {jointAt, toScreen as figToScreen, ReachOpt} from './figures';
export type Contact = {side: 'L' | 'R'; target: P; opt?: ReachOpt; name?: string};
/** contact log: per frame, the worst hand miss and foot miss (px); window.CONTACTS collects failures when window.CHECK is set */
export const CONTACTS: {t: number; who: string; what: string; err: number}[] = [];
(window as any).CONTACTS = CONTACTS;
let CHECK_T = 0; export const checkTime = (t: number) => { CHECK_T = t; };
const log = (who: string, what: string, err: number, lim: number) => { if (err > lim && (window as any).CHECK) CONTACTS.push({t: CHECK_T, who, what, err: Math.round(err * 10) / 10}); };
/** shift each foot (ankle, toe; knee by half) so the shoe rests on ground(x) at its own x — robes hide the small leg stretch */
export const slopeFeet = (o: FigOpts, ground: (x: number) => number): FigOpts => {
	const p: Pose = {...o.pose};
	for (const s of ['L', 'R']) {
		const ax = figToScreen(o, p[`${s}Ank`])[0], tx = figToScreen(o, p[`${s}Toe`])[0];
		const gy = ground((ax + tx) / 2), d = -(gy - o.ground) / o.h;           // body units, y up
		for (const [j, k] of [[`${s}Ank`, 1], [`${s}Toe`, 1], [`${s}Knee`, 0.5]] as [string, number][]) p[j] = [p[j][0], p[j][1] + d * k];
	}
	return {...o, pose: p};
};
/** place a figure: aim its hands at screen targets, put its feet on the ground curve, and log contact errors */
export const rig = (o: FigOpts, contacts: Contact[], ground?: (x: number) => number, who = 'fig'): FigOpts => {
	let pose = o.pose;
	for (const c of contacts) pose = reach(pose, c.side, toBody(o, c.target), c.opt ?? {});
	let f: FigOpts = {...o, pose};
	if (ground) f = slopeFeet(f, ground);
	for (const c of contacts) { const h = handAt(f as any, c.side); log(who, `${c.name ?? c.side} hand`, Math.hypot(h[0] - c.target[0], h[1] - c.target[1]), 4); }
	if (ground) {
		// soles: ankle sits BL.ankle above the sole; the lower sole carries the weight and must touch; neither may sink
		const sole = (s: string) => { const a = jointAt(f as any, `${s}Ank`), tp = jointAt(f as any, `${s}Toe`); const x = (a[0] + tp[0]) / 2; return {x, y: Math.max(a[1] + 0.045 * f.h, tp[1] + 0.004 * f.h), g: ground(x)}; };
		const L = sole('L'), R = sole('R'), st = (L.y - L.g) > (R.y - R.g) ? L : R;
		log(who, 'stance foot', Math.abs(st.y - st.g), 3);
		for (const q of [L, R]) if (q.y - q.g > 3) log(who, 'foot sinks', q.y - q.g, 3);
		// limb lengths ±3 % where legs show (not under robes/gowns)
		const showsLegs = !['robe', 'gown'].includes((f.look as any).dress);
		if (showsLegs) for (const [a, b2, bl] of [['LUp', 'LKnee', 0.264], ['LKnee', 'LAnk', 0.269], ['RUp', 'RKnee', 0.264], ['RKnee', 'RAnk', 0.269]] as [string, string, number][]) {
			const p0 = f.pose[a], p1 = f.pose[b2]; const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); log(who, `${a}-${b2} length`, Math.abs(len / bl - 1) * 100, 3); }
	}
	return f;
};
