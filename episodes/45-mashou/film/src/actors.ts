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
import {jointAt, toScreen as figToScreen, ReachOpt, soleOf, shoePoints} from './figures';
export type Contact = {side: 'L' | 'R'; target: P; opt?: ReachOpt; name?: string};
/** contact log: per frame, the worst hand miss and foot miss (px); window.CONTACTS collects failures when window.CHECK is set */
export const CONTACTS: {t: number; who: string; what: string; err: number}[] = [];
(window as any).CONTACTS = CONTACTS;
let CHECK_T = 0; export const checkTime = (t: number) => { CHECK_T = t; };
const SEEN: Record<string, number> = {}; (window as any).CONTACT_SEEN = SEEN;   // every declared contact (for the checker's list)
const log = (who: string, what: string, err: number, lim: number) => { if (!(window as any).CHECK) return; const k = `${who} · ${what}`; SEEN[k] = Math.max(SEEN[k] ?? 0, err); if (err > lim) CONTACTS.push({t: CHECK_T, who, what, err: Math.round(err * 10) / 10}); };
/** put each shoe on ground(x) at its own x (keeping the swing foot's lift), turn the feet with the slope, drop the pelvis
 *  when a foot is out of reach, and re-solve each knee with two-bone IK, so the legs keep their lengths on ramps */
export const slopeFeet = (o: FigOpts, ground: (x: number) => number): FigOpts => {
	const p: Pose = {...o.pose}, sg = o.flip ? -1 : 1;
	const rot = (q: P, c: P, a: number): P => { const dx = q[0] - c[0], dy = q[1] - c[1], cs = Math.cos(a), sn = Math.sin(a); return [c[0] + dx * cs - dy * sn, c[1] + dx * sn + dy * cs]; };
	// leg lengths: the pose's own, held within ±2.5 % of the canonical thigh / shin (BL, the checker's reference)
	const cl = (v: number, bl: number) => Math.min(bl * 1.025, Math.max(bl * 0.975, v));
	const L0: Record<string, [number, number]> = {};
	for (const s of ['L', 'R']) { const up = p[`${s}Up`], kn = p[`${s}Knee`], an = p[`${s}Ank`]; L0[s] = [cl(Math.hypot(kn[0] - up[0], kn[1] - up[1]), 0.264), cl(Math.hypot(an[0] - kn[0], an[1] - kn[1]), 0.269)]; }
	const gb = (X: number) => -(ground(X) - o.ground) / o.h;                                       // ground height (body units) under screen x
	const shift: Record<string, number> = {};
	for (const s of ['L', 'R']) {
		// turn the foot with the ground under it (about its lowest point), then lift/lower it so its closest shoe point keeps the
		// clearance it had over flat ground (0 for the stance foot, the lift for a swinging one)
		const pts0 = shoePoints(p, s as any), lift = Math.min(...pts0.map((q) => q[1])), a0 = p[`${s}Ank`];
		const c = pts0.reduce((m, q) => (q[1] < m[1] ? q : m), pts0[0]), cx = figToScreen(o, c)[0];
		const ang = Math.atan(-((ground(cx + 6) - ground(cx - 6)) / 12) * sg);
		for (const j of [`${s}Ank`, `${s}Toe`]) p[j] = rot(p[j], c, ang);
		const gap = Math.min(...shoePoints(p, s as any).map((q) => q[1] - gb(figToScreen(o, q)[0])));
		for (const j of [`${s}Ank`, `${s}Toe`]) p[j] = [p[j][0], p[j][1] + (lift - gap)];
		shift[s] = p[`${s}Ank`][1] - a0[1];
	}
	// under a long robe the legs aren't drawn (the hull covers them): move each knee by half its foot's shift, as before
	if (['robe', 'gown'].includes((o.look as any).dress)) { for (const s of ['L', 'R']) p[`${s}Knee`] = [p[`${s}Knee`][0], p[`${s}Knee`][1] + shift[s] * 0.5]; return {...o, pose: p}; }
	// pelvis drop so the farther foot is reachable (legs ≤ 99.5 % straight)
	const upper = ['Hips', 'LUp', 'RUp', 'Spine1', 'Neck1', 'Head', 'Top', 'LSh', 'LElb', 'LHand', 'LTip', 'RSh', 'RElb', 'RHand', 'RTip'];
	let drop = 0;
	for (let it = 0; it < 4; it++) {
		let worst = 0;
		for (const s of ['L', 'R']) { const up = p[`${s}Up`], an = p[`${s}Ank`]; worst = Math.max(worst, Math.hypot(an[0] - up[0], an[1] - (up[1] - drop)) - (L0[s][0] + L0[s][1]) * 0.995); }
		if (worst <= 1e-5) break; drop += worst;
	}
	if (drop > 0) for (const j of upper) if (p[j]) p[j] = [p[j][0], p[j][1] - drop];
	// two-bone IK per leg; knees always bend forward (+x in body units, whatever way the figure faces)
	for (const s of ['L', 'R']) {
		const H = p[`${s}Up`], A = p[`${s}Ank`], [l1, l2] = L0[s];
		const dx = A[0] - H[0], dy = A[1] - H[1], n = Math.max(1e-6, Math.hypot(dx, dy)), dd = Math.min(n, l1 + l2 - 1e-6), ux = dx / n, uy = dy / n;
		const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
		const mx = H[0] + ux * a, my = H[1] + uy * a, k1: P = [mx - uy * h, my + ux * h], k2: P = [mx + uy * h, my - ux * h];
		p[`${s}Knee`] = k1[0] >= k2[0] ? k1 : k2;
	}
	return {...o, pose: p};
};
/** place a figure: aim its hands at screen targets, put its feet on the ground curve, and log contact errors */
export const rig = (o: FigOpts, contacts: Contact[], ground?: (x: number) => number, who = 'fig'): FigOpts => {
	// feet first (it may lower the pelvis on a ramp), then the hands reach from where the body really is
	let f: FigOpts = ground ? slopeFeet(o, ground) : o;
	let pose = f.pose;
	for (const c of contacts) pose = reach(pose, c.side, toBody(o, c.target), c.opt ?? {});
	f = {...f, pose};
	for (const c of contacts) { const h = handAt(f as any, c.side); log(who, `${c.name ?? c.side} hand`, Math.hypot(h[0] - c.target[0], h[1] - c.target[1]), 4); }
	if (ground) {
		// soles: ankle sits BL.ankle above the sole; the lower sole carries the weight and must touch; neither may sink
		// per foot: the smallest gap between any shoe point and the ground under it (screen px, + = above); slope-aware
		const gap = (s: string) => Math.min(...shoePoints(f.pose, s as any).map((q) => { const v = figToScreen(f, q); return ground(v[0]) - v[1]; }));
		const gL = gap('L'), gR = gap('R');
		log(who, 'stance foot', Math.abs(Math.min(gL, gR)), 3);
		for (const g2 of [gL, gR]) if (g2 < -3) log(who, 'foot sinks', -g2, 3);
		// limb lengths ±3 % where legs show (not under robes/gowns)
		const showsLegs = !['robe', 'gown'].includes((f.look as any).dress);
		if (showsLegs) for (const [a, b2, bl] of [['LUp', 'LKnee', 0.264], ['LKnee', 'LAnk', 0.269], ['RUp', 'RKnee', 0.264], ['RKnee', 'RAnk', 0.269]] as [string, string, number][]) {
			const p0 = f.pose[a], p1 = f.pose[b2]; const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); log(who, `${a}-${b2} length`, Math.abs(len / bl - 1) * 100, 3); }
	}
	return f;
};

// ------------------------------------------------------------------------------------------------ the under-arm carry (shared)
import {underArmRoll, gripOf} from './figures';
/** a roll clamped under the upper arm (pose made with underArm()): draws the roll and then the carrying arm again on top,
 *  so the order is body (cast layer) → roll → near arm, the upper arm over the roll's middle third and the hand at its front
 *  end. Logs both contacts for the checker. Call it on the prop layer (draw/drawW in world px); returns the roll's ends. */
export const drawCarriedRoll = (g: CanvasRenderingContext2D, fig: FigOpts, who: string, side: 'R' | 'L' = 'R', length = 0.29, r = 13, glow = 1, grey = false, col = SILHOUETTE) => {
	// the roll runs from the palm back to the armpit and stops there (it must not stick out behind the back, or it reads as going through the chest)
	const gp = gripOf(fig.pose, side), pit0: P = [fig.pose[`${side}Sh`][0], fig.pose[`${side}Sh`][1] - 0.11], toPit = Math.hypot(pit0[0] - gp[0], pit0[1] - gp[1]);
	const [r0, r1] = underArmRoll(fig.pose, side, Math.min(length, toPit + 0.01)), p0 = figToScreen(fig, r0), p1 = figToScreen(fig, r1);
	drawRoll(g, p0, p1, r, glow, grey); drawFig(g, {...fig, part: side}, col);
	const hand = figToScreen(fig, gripOf(fig.pose, side)), pit = figToScreen(fig, [fig.pose[`${side}Sh`][0], fig.pose[`${side}Sh`][1] - 0.11]);
	const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy), off = (q: P) => Math.abs((q[0] - p0[0]) * dy - (q[1] - p0[1]) * dx) / Math.max(1, L);
	log(who, 'roll in hand', off(hand), 4); log(who, 'roll under arm', off(pit), 4);
	return [p0, p1] as [P, P];
};
