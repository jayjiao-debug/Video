// Live2D-style drummer cat: a 2D illustration cut into head / body / tail, each a deformable mesh driven by code.
// Same clock as the audio (hits.json). Arms, sticks, drums and expressions are drawn in code in the art's flat style.
// Motion: wind-up → contact on the sound → rebound for every stroke; a nod on each beat, a lean over two beats;
// springs make the head lag the body, the ears flop, the tail wag, and the cheeks squash on the kick.
import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';
const S = await (await fetch('./hits.json')).json(), PJ = await (await fetch('./parts.json')).json();
const W = 1920, H = 1080, LINE = 0x5f3026, FUR = 0xfbf4e4, PINK = 0xf5a3a0, CORAL = 0xf08a6e, CREAM = 0xfdf3df, GOLD = 0xf2c46a, METAL = 0xb9c0cc;
const app = new PIXI.Application(); await app.init({ width: W, height: H, antialias: true, backgroundAlpha: 1, background: 0xfbeef2, preference: 'webgl', preserveDrawingBuffer: true });
document.body.appendChild(app.canvas);
const tex = {}; for (const k of ['head', 'body', 'tail']) tex[k] = await PIXI.Assets.load(`./${k}.png`);

// image (1024 px illustration) → screen
const SC = .92, OX = 960, OY = 1000, I = (x, y) => [OX + (x - 512) * SC, OY + (y - 964) * SC];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// ---------- background ----------
const bg = new PIXI.Graphics(); app.stage.addChild(bg);
bg.rect(0, 0, W, H).fill({ color: 0xfbeef2 });
for (let y = 0; y < 760; y += 90) for (let x = (y / 90) % 2 ? 45 : 0; x < W; x += 90) bg.circle(x, y, 7).fill({ color: 0xf6dbe6 });
bg.rect(0, 760, W, H - 760).fill({ color: 0xf3dfe8 }); bg.ellipse(960, 1010, 560, 60).fill({ color: 0xe9cbd8 });

// ---------- deformable parts ----------
function plane(texture, box, nx, ny) {
	const m = new PIXI.MeshPlane({ texture, verticesX: nx, verticesY: ny }); app.stage.addChild(m);
	const pos = m.geometry.getAttribute('aPosition').buffer; const base = Float32Array.from(pos.data);
	return { m, pos, base, box };
}
const tailP = plane(tex.tail, PJ.boxes.tail, 6, 14), bodyP = plane(tex.body, PJ.boxes.body, 12, 12);
const armsG = new PIXI.Graphics(); app.stage.addChild(armsG);   // arms behind the head, in front of the body
const headP = plane(tex.head, PJ.boxes.head, 20, 18);
const faceG = new PIXI.Graphics(); app.stage.addChild(faceG);   // blinks / mouth drawn over the face
const kitG = new PIXI.Graphics(); app.stage.addChild(kitG);     // drums in front
const fxG = new PIXI.Graphics(); app.stage.addChild(fxG);
// write a part's vertices: f(x, y) maps illustration coords → screen coords
function deform(P, f) { const d = P.pos.data, b = P.base, [x0, y0] = P.box;
	for (let i = 0; i < d.length; i += 2) { const [sx, sy] = f(x0 + b[i], y0 + b[i + 1]); d[i] = sx; d[i + 1] = sy; } P.pos.update(); }

// ---------- timing helpers ----------
const times = (i) => S.hits.filter((h) => h.i === i).map((h) => h.t);
const T = { kick: times('kick'), snare: times('snare'), hat: times('hat'), crash: times('crash') };
const prevNext = (arr, t) => { let p = -1e9, n = 1e9; for (const x of arr) { if (x <= t + 1e-6) p = Math.max(p, x); else n = Math.min(n, x); } return [p, n]; };
const env = (arr, t, d) => { const [p] = prevNext(arr, t); return p < -1e8 ? 0 : Math.exp(-(t - p) / d); };
function stroke(arr, t, up) { const [p, n] = prevNext(arr, t), d1 = t - p, d2 = n - t, I_ = n - p, Aw = Math.min(.15, I_ * .45);
	const rest = (p < -1e8 ? .35 : .35 * sstep(0, .22, d1)) * up + (p < -1e8 ? 0 : .3 * up * Math.sin(Math.PI * clamp(d1 / .13)));
	if (n > 1e8) return rest; const wind = up * (1 - Math.pow(1 - clamp(d2 / Aw), 3)), wg = 1 - sstep(Aw, Aw + .18, d2); return rest + (wind - rest) * wg; }
const wob = (arr, t, amp, d, f) => { const [p] = prevNext(arr, t); return p < -1e8 ? 0 : amp * Math.exp(-(t - p) / d) * Math.sin((t - p) * f * 2 * Math.PI); };

// ---------- springs (integrated forward in time; frames are rendered in order) ----------
const spring = (k, c) => ({ x: 0, v: 0, k, c });
const SP = { hx: spring(90, 9), hy: spring(140, 11), ha: spring(70, 8), earL: spring(120, 5), earR: spring(110, 5), tail: spring(30, 3.5), cheek: spring(260, 10) };
let simT = 0, prev = null;
function drivers(t) {   // targets the springs chase
	const ph = (t - S.t0) / S.beat, on = t > S.t0 - .2;
	const kE = env(T.kick, t, .1), sE = env(T.snare, t, .09);
	return { ph, kE, sE, lean: on ? Math.sin(Math.PI * ph) : 0, nod: on ? .5 + .5 * Math.cos(2 * Math.PI * (ph - .1)) : 0 };
}
function step(dt, t) {
	const d = drivers(t), lp = prev || d;
	const tg = { hx: d.lean * 14, hy: d.nod * 12 + d.kE * 16, ha: d.lean * .05 + d.nod * .03, earL: 0, earR: 0, tail: Math.sin(Math.PI * d.ph * .5) * .35, cheek: d.kE };
	for (const [k, s] of Object.entries(SP)) { const a = s.k * (tg[k] - s.x) - s.c * s.v; s.v += a * dt; s.x += s.v * dt; }
	// ears are kicked by the head's motion (inertia) and by the snare
	SP.earL.v += (-(SP.hx.v) * .012 - (SP.hy.v) * .01 + d.sE * 1.2) * dt * 60 * .4; SP.earR.v += ((SP.hx.v) * .012 - (SP.hy.v) * .01 - d.sE * 1.2) * dt * 60 * .4;
	prev = d;
}
function advance(t) { if (t < simT - 1e-6) { simT = 0; prev = null; for (const s of Object.values(SP)) { s.x = 0; s.v = 0; } } const dt = 1 / 480; while (simT < t) { step(dt, simT); simT += dt; } }

// ---------- drawing helpers in the art's flat style ----------
const outlined = (g, drawPath, fill, w = 6) => { drawPath(g); g.fill({ color: fill }); drawPath(g); g.stroke({ color: LINE, width: w, join: 'round', cap: 'round' }); };
function arm(g, sh, paw, stickDir, h) {
	// upper arm: a soft tube from the shoulder to the paw (outline then fill), the paw with toe beans, then the stick
	g.moveTo(sh[0], sh[1]).quadraticCurveTo((sh[0] + paw[0]) / 2, Math.max(sh[1], paw[1]) + 18, paw[0], paw[1]).stroke({ color: LINE, width: 58, cap: 'round' });
	g.moveTo(sh[0], sh[1]).quadraticCurveTo((sh[0] + paw[0]) / 2, Math.max(sh[1], paw[1]) + 18, paw[0], paw[1]).stroke({ color: FUR, width: 46, cap: 'round' });
	const tip = [paw[0] + stickDir[0] * 170, paw[1] + stickDir[1] * 170];
	g.moveTo(paw[0], paw[1]).lineTo(tip[0], tip[1]).stroke({ color: LINE, width: 17, cap: 'round' }); g.moveTo(paw[0], paw[1]).lineTo(tip[0], tip[1]).stroke({ color: 0xe9b77d, width: 9, cap: 'round' });
	g.circle(tip[0], tip[1], 9).fill({ color: 0xe9b77d }).stroke({ color: LINE, width: 4 });
	outlined(g, (q) => q.circle(paw[0], paw[1], 33), FUR, 6);
	for (const [dx, dy, r] of [[-12, -8, 7], [0, -13, 7], [12, -8, 7], [0, 6, 11]]) g.circle(paw[0] + dx, paw[1] + dy, r).fill({ color: PINK });
}
function strokePose(shoulder, contactPaw, hit, h) {
	const paw = [contactPaw[0] + (contactPaw[0] - shoulder[0]) * -.08 * h, contactPaw[1] - 95 * h];
	const down = [hit[0] - contactPaw[0], hit[1] - contactPaw[1]], l = Math.hypot(...down), dn = [down[0] / l, down[1] / l];
	const upd = [dn[0] * .35, -1], ul = Math.hypot(...upd), un = [upd[0] / ul, upd[1] / ul];
	const sd = [dn[0] * (1 - h) + un[0] * h, dn[1] * (1 - h) + un[1] * h], sl = Math.hypot(...sd);
	return [paw, [sd[0] / sl, sd[1] / sl]];
}

window.renderAt = (t) => {
	advance(t); const d = drivers(t), kE = d.kE, sE = d.sE;
	const lean = d.lean, sq = SP.cheek.x;
	// body: lean as a shear growing with height, squash on the kick, gentle breathing
	const breath = .008 * Math.sin(t * 2 * Math.PI / 2.6);
	deform(bodyP, (x, y) => { const hgt = (964 - y) / 540; let [sx, sy] = I(x, y);
		sx += lean * 26 * hgt * hgt; sy = OY - (OY - sy) * (1 - .04 * sq + breath); sx = OX + (sx - OX) * (1 + .03 * sq); return [sx, sy]; });
	// neck (where the head sits) after the body's deformation
	const [nx0, ny0] = I(512, 640), neck = [nx0 + lean * 26 * (324 / 540) ** 2 + SP.hx.x, OY - (OY - ny0) * (1 - .04 * sq + breath) + SP.hy.x - 4];
	const ang = SP.ha.x, ca = Math.cos(ang), sa = Math.sin(ang), turn = lean * .9;
	const headMap = (x, y) => {
		let dx = x - 512, dy = y - 640;
		// ears: rotate about their base with their own springs, more toward the tip
		if (y < 270 && Math.abs(x - 512) > 70) { const side = x < 512 ? -1 : 1, ex = 512 + side * 205, ey = 270, w = clamp((270 - y) / 180) * sstep(70, 170, Math.abs(x - 512)), a = (side < 0 ? SP.earL.x : SP.earR.x) * w;
			const rx = x - ex, ry = y - ey; dx = ex + rx * Math.cos(a) - ry * Math.sin(a) - 512; dy = ey + rx * Math.sin(a) + ry * Math.cos(a) - 640; }
		// a slight head turn: the middle of the face shifts more than the silhouette (Live2D parallax)
		const r2 = ((x - 512) / 330) ** 2 + ((y - 400) / 260) ** 2; dx += turn * 20 * clamp(1 - r2);
		// cheeks squash on the kick
		dy *= 1 - .05 * sq; dx *= 1 + .035 * sq * clamp((y - 330) / 300);
		return [neck[0] + (dx * ca - dy * sa) * SC, neck[1] + (dx * sa + dy * ca) * SC];
	};
	deform(headP, headMap);
	// tail wags from its base, bending more toward the tip
	deform(tailP, (x, y) => { const bx = 772, by = 872, rx = x - bx, ry = y - by, k = clamp(Math.hypot(rx, ry) / 230), a = SP.tail.x * k * 1.4;
		let [sx, sy] = I(bx + rx * Math.cos(a) - ry * Math.sin(a), by + rx * Math.sin(a) + ry * Math.cos(a)); sx += lean * 18 * .4; return [sx, sy]; });
	// face: blink now and then; happy ^ ^ eyes and an open mouth on the final crash
	faceG.clear(); const crashE = env(T.crash, t, .9), blink = [1.9, 4.6, 7.2, 9.9].some((b) => Math.abs(t - b) < .06);
	if (blink || crashE > .15) for (const ex of [378, 650]) {
		const [cx, cy] = headMap(ex, 440); faceG.ellipse(cx, cy, 64 * SC, 64 * SC).fill({ color: FUR });
		if (crashE > .15) faceG.moveTo(cx - 34, cy + 10).quadraticCurveTo(cx, cy - 34, cx + 34, cy + 10).stroke({ color: LINE, width: 9, cap: 'round' });
		else faceG.moveTo(cx - 34, cy).quadraticCurveTo(cx, cy + 16, cx + 34, cy).stroke({ color: LINE, width: 9, cap: 'round' });
	}
	if (crashE > .15) { const [mx, my] = headMap(512, 512); faceG.ellipse(mx, my + 6, 26, 22).fill({ color: 0xc8574f }).stroke({ color: LINE, width: 6 }); faceG.ellipse(mx, my + 16, 14, 8).fill({ color: PINK }); }
	// drums (screen coords)
	kitG.clear();
	const hatY = 690 - 6 * env(T.hat, t, .05), hatA = wob(T.hat, t, .05, .12, 7), crA = wob(T.crash, t, .28, .7, 3.2);
	for (const [x, y0, y1] of [[1230, hatY, 1030], [640, 760, 1030], [560, 520, 1030]]) kitG.moveTo(x, y0).lineTo(x, y1).stroke({ color: METAL, width: 10 });
	kitG.moveTo(1230, 1030).lineTo(1180, 1060).moveTo(1230, 1030).lineTo(1280, 1060).moveTo(640, 1030).lineTo(590, 1060).moveTo(640, 1030).lineTo(690, 1060).stroke({ color: METAL, width: 8 });
	// crash (top left) and hi-hat (right)
	kitG.ellipse(0, 0, 150, 26).fill({ color: GOLD }).stroke({ color: LINE, width: 6 }); kitG.position.set(0, 0);
	const cym = (x, y, rx, a) => { const g = new PIXI.Graphics(); return g; };
	kitG.setFromMatrix?.(new PIXI.Matrix());
	kitG.clear();
	for (const [x, y0, y1] of [[1230, hatY, 1030], [640, 760, 1030], [560, 520, 1030]]) kitG.moveTo(x, y0).lineTo(x, y1).stroke({ color: METAL, width: 10 });
	const ell = (cx, cy, rx, ry, a, fill) => { const pts = []; for (let i = 0; i < 48; i++) { const q = i / 48 * 2 * Math.PI, ex = rx * Math.cos(q), ey = ry * Math.sin(q); pts.push(cx + ex * Math.cos(a) - ey * Math.sin(a), cy + ex * Math.sin(a) + ey * Math.cos(a)); } kitG.poly(pts).fill({ color: fill }).stroke({ color: LINE, width: 6 }); };
	ell(560, 520, 160, 26, -.25 + crA, GOLD); kitG.circle(560, 520, 8).fill({ color: LINE });
	ell(1230, hatY + 22, 130, 20, hatA * .3, GOLD); ell(1230, hatY, 130, 20, hatA, GOLD); kitG.circle(1230, hatY - 4, 7).fill({ color: LINE });
	// snare (left)
	const sy = 760 + 4 * sE; kitG.roundRect(520, sy, 240, 80, 14).fill({ color: CORAL }).stroke({ color: LINE, width: 6 });
	for (let i = 0; i < 5; i++) kitG.moveTo(545 + i * 48, sy + 8).lineTo(545 + i * 48, sy + 72).stroke({ color: 0xffffff, width: 4, alpha: .6 });
	kitG.ellipse(640, sy, 120 * (1 + .03 * sE), 30).fill({ color: CREAM }).stroke({ color: LINE, width: 6 });
	// kick drum (front)
	const kr = 165 * (1 + .03 * kE); kitG.circle(960, 885, kr).fill({ color: CORAL }).stroke({ color: LINE, width: 7 });
	kitG.circle(960, 885, kr - 24).fill({ color: CREAM }).stroke({ color: LINE, width: 5 });
	kitG.circle(960, 885, 52).fill({ color: PINK, alpha: .8 });
	// a paw print logo on the kick
	for (const [dx, dy, r] of [[-30, -18, 12], [0, -30, 12], [30, -18, 12], [0, 10, 22]]) kitG.circle(960 + dx, 885 + dy, r).fill({ color: CREAM });
	// arms: the cat's right paw (screen left) plays the snare, the left paw the hi-hat; the crash at the end
	armsG.clear();
	const [shLx, shLy] = I(405, 655), [shRx, shRy] = I(619, 655);
	const shL = [shLx + lean * 10, shLy + 6 * sq], shR = [shRx + lean * 10, shRy + 6 * sq];
	const useCrash = t > S.t0 + 15.5 * S.beat;
	const [pawL, sdL] = useCrash ? strokePose(shL, [600, 560], [560, 515], stroke(T.crash, t, 1.2)) : strokePose(shL, [640, 700], [650, 762], stroke(T.snare, t, 1));
	const [pawR, sdR] = strokePose(shR, [1150, 640], [1235, 690], stroke(T.hat, t, .6));
	// the arms are drawn in front of the drums so the strokes read; kit first, arms on top
	app.stage.setChildIndex(armsG, app.stage.children.length - 2);
	arm(armsG, shL, pawL, sdL); arm(armsG, shR, pawR, sdR);
	// hit sparks
	fxG.clear();
	for (const [arr, x, y, c] of [[T.snare, 650, 755, 0xffffff], [T.crash, 560, 510, GOLD]]) { const e = env(arr, t, .12); if (e < .05) continue;
		for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r0 = 40 + 50 * (1 - e), r1 = r0 + 30 * e; fxG.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * .6).lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 * .6).stroke({ color: c === 0xffffff ? CORAL : c, width: 6, cap: 'round', alpha: e }); } }
	app.renderer.render(app.stage);
	return true;
};
window.READY = true;
