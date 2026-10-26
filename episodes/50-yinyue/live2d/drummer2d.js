// Live2D-style drummer cat, Canvas2D version (CPU; fast to capture headless). Same rig and motion as drummer.js:
// the illustration is cut into head / body / tail; each is a triangle mesh warped per frame and texture-mapped.
// Arms, sticks, drums and expressions are drawn in code in the art's flat style. One clock with the audio (hits.json).
const S = await (await fetch('./hits.json')).json(), PJ = await (await fetch('./parts.json')).json();
const W = 1920, H = 1080, LINE = '#5f3026', FUR = '#fbf4e4', PINK = '#f5a3a0', CORAL = '#f08a6e', CREAM = '#fdf3df', GOLD = '#f2c46a', METAL = '#b9c0cc', STICK = '#e9b77d';
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; document.body.appendChild(cv);
const ctx = cv.getContext('2d');
const img = async (k) => { const i = new Image(); i.src = `./${k}.png`; await i.decode(); return i; };
const tex = { head: await img('head'), body: await img('body'), tail: await img('tail') };
const SC = .92, OX = 960, OY = 1000, I = (x, y) => [OX + (x - 512) * SC, OY + (y - 964) * SC];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// ---------- meshes ----------
function grid(k, nx, ny) { const [x0, y0, x1, y1] = PJ.boxes[k], pts = [];
	for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) pts.push([x0 + (x1 - x0) * i / nx, y0 + (y1 - y0) * j / ny]);
	return { k, nx, ny, pts, box: [x0, y0] }; }
const M = { body: grid('body', 10, 10), head: grid('head', 18, 16), tail: grid('tail', 5, 12) };
// draw one textured triangle: map (u0,u1,u2) in texture px to (p0,p1,p2) on screen
function tri(im, u0, u1, u2, p0, p1, p2) {
	const cx = (p0[0] + p1[0] + p2[0]) / 3, cy = (p0[1] + p1[1] + p2[1]) / 3, g = (p) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * .7, p[1] + dy / l * .7]; };
	const q0 = g(p0), q1 = g(p1), q2 = g(p2);
	ctx.save(); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.closePath(); ctx.clip();
	const [x0, y0] = u0, [x1, y1] = u1, [x2, y2] = u2, d = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
	const a = ((p1[0] - p0[0]) * (y2 - y0) - (p2[0] - p0[0]) * (y1 - y0)) / d, c = ((p2[0] - p0[0]) * (x1 - x0) - (p1[0] - p0[0]) * (x2 - x0)) / d;
	const b = ((p1[1] - p0[1]) * (y2 - y0) - (p2[1] - p0[1]) * (y1 - y0)) / d, dd = ((p2[1] - p0[1]) * (x1 - x0) - (p1[1] - p0[1]) * (x2 - x0)) / d;
	ctx.setTransform(a, b, c, dd, p0[0] - a * x0 - c * y0, p0[1] - b * x0 - dd * y0); ctx.drawImage(im, 0, 0); ctx.restore();
}
function drawMesh(m, f) {
	const im = tex[m.k], [bx, by] = m.box, P = m.pts.map(([x, y]) => f(x, y)), U = m.pts.map(([x, y]) => [x - bx, y - by]), n = m.nx + 1;
	for (let j = 0; j < m.ny; j++) for (let i = 0; i < m.nx; i++) { const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
		tri(im, U[a], U[b], U[c], P[a], P[b], P[c]); tri(im, U[b], U[d], U[c], P[b], P[d], P[c]); }
}

// ---------- timing ----------
const times = (i) => S.hits.filter((h) => h.i === i).map((h) => h.t);
const T = { kick: times('kick'), snare: times('snare'), hat: times('hat'), crash: times('crash') };
const prevNext = (arr, t) => { let p = -1e9, n = 1e9; for (const x of arr) { if (x <= t + 1e-6) p = Math.max(p, x); else n = Math.min(n, x); } return [p, n]; };
const env = (arr, t, d) => { const [p] = prevNext(arr, t); return p < -1e8 ? 0 : Math.exp(-(t - p) / d); };
function stroke(arr, t, up) { const [p, n] = prevNext(arr, t), d1 = t - p, d2 = n - t, I_ = n - p, Aw = Math.min(.15, I_ * .45);
	const rest = (p < -1e8 ? .35 : .35 * sstep(0, .22, d1)) * up + (p < -1e8 ? 0 : .3 * up * Math.sin(Math.PI * clamp(d1 / .13)));
	if (n > 1e8) return rest; const wind = up * (1 - Math.pow(1 - clamp(d2 / Aw), 3)), wg = 1 - sstep(Aw, Aw + .18, d2); return rest + (wind - rest) * wg; }
const wob = (arr, t, amp, d, f) => { const [p] = prevNext(arr, t); return p < -1e8 ? 0 : amp * Math.exp(-(t - p) / d) * Math.sin((t - p) * f * 2 * Math.PI); };

// ---------- springs ----------
const spring = (k, c) => ({ x: 0, v: 0, k, c });
const SP = { hx: spring(90, 9), hy: spring(140, 11), ha: spring(70, 8), earL: spring(120, 5), earR: spring(110, 5), tail: spring(30, 3.5), cheek: spring(260, 10) };
let simT = 0;
const drivers = (t) => { const ph = (t - S.t0) / S.beat, on = t > S.t0 - .2;
	return { ph, kE: env(T.kick, t, .1), sE: env(T.snare, t, .09), lean: on ? Math.sin(Math.PI * ph) : 0, nod: on ? .5 + .5 * Math.cos(2 * Math.PI * (ph - .1)) : 0 }; };
function step(dt, t) { const d = drivers(t);
	const tg = { hx: d.lean * 14, hy: d.nod * 12 + d.kE * 16, ha: d.lean * .05 + d.nod * .03, earL: 0, earR: 0, tail: Math.sin(Math.PI * d.ph * .5) * .35, cheek: d.kE };
	for (const [k, s] of Object.entries(SP)) { const a = s.k * (tg[k] - s.x) - s.c * s.v; s.v += a * dt; s.x += s.v * dt; }
	SP.earL.v += (-SP.hx.v * .012 - SP.hy.v * .01 + d.sE * 1.2) * dt * 24; SP.earR.v += (SP.hx.v * .012 - SP.hy.v * .01 - d.sE * 1.2) * dt * 24; }
function advance(t) { if (t < simT - 1e-6) { simT = 0; for (const s of Object.values(SP)) { s.x = 0; s.v = 0; } } const dt = 1 / 480; while (simT < t) { step(dt, simT); simT += dt; } }

// ---------- flat-style drawing helpers ----------
const path = (f) => { ctx.beginPath(); f(); };
const fillStroke = (fill, w = 6) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (w) { ctx.strokeStyle = LINE; ctx.lineWidth = w; ctx.lineJoin = ctx.lineCap = 'round'; ctx.stroke(); } };
const circle = (x, y, r, fill, w = 6) => { path(() => ctx.arc(x, y, r, 0, Math.PI * 2)); fillStroke(fill, w); };
const ell = (x, y, rx, ry, a, fill, w = 6) => { path(() => ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2)); fillStroke(fill, w); };
const line = (x0, y0, x1, y1, col, w) => { path(() => { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); }); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); };
function elbowOf(sh, paw, side, a = 96, b = 90) {   // 2-bone IK; the elbow bends outward (side = -1 left, +1 right) and down
	let dx = paw[0] - sh[0], dy = paw[1] - sh[1], d = Math.hypot(dx, dy); const dc = clamp(d, Math.abs(a - b) + 2, a + b - 2);
	const ux = dx / d, uy = dy / d, A = Math.acos(clamp((a * a + dc * dc - b * b) / (2 * a * dc), -1, 1));
	const cand = [1, -1].map((s) => [sh[0] + a * (ux * Math.cos(s * A) - uy * Math.sin(s * A)), sh[1] + a * (ux * Math.sin(s * A) + uy * Math.cos(s * A))]);
	return cand.sort((p, q) => ((q[0] - p[0]) * side * .5 + (q[1] - p[1])))[0];
}
// arm styles (chibi-friendly, no visible elbow): A rubber-hose curve · B stubby nub + long sticks · C floating paws · D chubby tapered arm
const ARM = new URLSearchParams(location.search).get('arm') || 'A';
function pawDraw(p, r = 31) { circle(p[0], p[1], r, FUR, 6); for (const [dx, dy, rr] of [[-11, -8, 6.5], [0, -12, 6.5], [11, -8, 6.5], [0, 5, 10]]) circle(p[0] + dx * r / 31, p[1] + dy * r / 31, rr * r / 31, PINK, 0); }
function merge(sh) { circle(sh[0], sh[1], 24, FUR, 0); }   // hide the arm's cap where it meets the body
function arm(sh, paw, side) {
	if (ARM === 'C') { pawDraw(paw, 34); return; }
	if (ARM === 'A') {
		const c1 = [sh[0] + side * 38, sh[1] + 34], c2 = [paw[0] + side * 34, paw[1] + 46];
		for (const [c, w] of [[LINE, 52], [FUR, 40]]) { path(() => { ctx.moveTo(sh[0], sh[1]); ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], paw[0], paw[1]); }); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); }
		merge(sh); pawDraw(paw); return; }
	if (ARM === 'B') {
		for (const [c, w] of [[LINE, 56], [FUR, 44]]) line(sh[0], sh[1], paw[0], paw[1], c, w);
		merge(sh); pawDraw(paw, 30); return; }
	// D: a soft teardrop from a wide shoulder to the paw, slightly curved
	const dx = paw[0] - sh[0], dy = paw[1] - sh[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, r0 = 36, r1 = 24, bow = side * 10;
	const mid = [sh[0] + dx * .5 + nx * bow, sh[1] + dy * .5 + ny * bow];
	path(() => { ctx.moveTo(sh[0] + nx * r0, sh[1] + ny * r0); ctx.quadraticCurveTo(mid[0] + nx * (r0 + r1) / 2, mid[1] + ny * (r0 + r1) / 2, paw[0] + nx * r1, paw[1] + ny * r1);
		ctx.lineTo(paw[0] - nx * r1, paw[1] - ny * r1); ctx.quadraticCurveTo(mid[0] - nx * (r0 + r1) / 2, mid[1] - ny * (r0 + r1) / 2, sh[0] - nx * r0, sh[1] - ny * r0); ctx.closePath(); });
	fillStroke(FUR, 6); merge(sh); circle(sh[0], sh[1], 30, FUR, 0); pawDraw(paw, 29);
}
// B keeps the paw close to the body: the arm is a short nub and the stick does the reaching
function nub(sh, paw, hit) { if (ARM !== 'B') return null; const dx = paw[0] - sh[0], dy = paw[1] - sh[1], L = Math.hypot(dx, dy), k = 74 / L; return [sh[0] + dx * k, sh[1] + dy * k]; }
function stick(paw, sd, L = 170) { const tip = [paw[0] + sd[0] * L, paw[1] + sd[1] * L];
	line(paw[0] - sd[0] * 18, paw[1] - sd[1] * 18, tip[0], tip[1], LINE, 17); line(paw[0] - sd[0] * 18, paw[1] - sd[1] * 18, tip[0], tip[1], STICK, 9); circle(tip[0], tip[1], 9, STICK, 4); }
function strokePose(shoulder, contactPaw, hit, h) {
	// the paw lifts a little; the stick swings from pointing at the drum to pointing up, passing through "toward the camera"
	// (so it looks shorter mid-swing, like a real stick seen from the front)
	const paw = [contactPaw[0], contactPaw[1] - 62 * h];
	const dn0 = [hit[0] - contactPaw[0], hit[1] - contactPaw[1]], l = Math.hypot(...dn0), dn = [dn0[0] / l, dn0[1] / l];
	const up = [dn[0] * .25, -.97], v = [dn[0] * (1 - h) + up[0] * h, dn[1] * (1 - h) + up[1] * h], vl = Math.hypot(...v);
	return [paw, [v[0] / vl, v[1] / vl], l * (.55 + .45 * vl)];
}

window.renderAt = (t) => {
	advance(t); const d = drivers(t), kE = d.kE, sE = d.sE, lean = d.lean, sq = SP.cheek.x;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	// background
	ctx.fillStyle = '#fbeef2'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#f6dbe6';
	for (let y = 0; y < 760; y += 90) for (let x = (y / 90) % 2 ? 45 : 0; x < W; x += 90) { ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); }
	ctx.fillStyle = '#f3dfe8'; ctx.fillRect(0, 760, W, H - 760); ell(960, 1010, 560, 60, 0, '#e9cbd8', 0);
	// tail, body
	const breath = .008 * Math.sin(t * 2 * Math.PI / 2.6);
	drawMesh(M.tail, (x, y) => { const bx = 772, by = 872, rx = x - bx, ry = y - by, k = clamp(Math.hypot(rx, ry) / 230), a = SP.tail.x * k * 1.4;
		const [sx, sy] = I(bx + rx * Math.cos(a) - ry * Math.sin(a), by + rx * Math.sin(a) + ry * Math.cos(a)); return [sx + lean * 7, sy]; });
	const bodyMap = (x, y) => { const hgt = (964 - y) / 540; let [sx, sy] = I(x, y); sx += lean * 26 * hgt * hgt; sy = OY - (OY - sy) * (1 - .04 * sq + breath); return [OX + (sx - OX) * (1 + .03 * sq), sy]; };
	drawMesh(M.body, bodyMap);
	// head
	const nk = bodyMap(512, 640), neck = [nk[0] + SP.hx.x, nk[1] + SP.hy.x - 4];
	const ang = SP.ha.x, ca = Math.cos(ang), sa = Math.sin(ang), turn = lean * .9;
	const headMap = (x, y) => { let dx = x - 512, dy = y - 640;
		if (y < 250 && Math.abs(x - 512) > 80) { const side = x < 512 ? -1 : 1, ex = 512 + side * 205, ey = 250, w = sstep(250, 110, y) * sstep(80, 200, Math.abs(x - 512)) * .4, a = (side < 0 ? SP.earL.x : SP.earR.x) * w;
			const rx = x - ex, ry = y - ey; dx = ex + rx * Math.cos(a) - ry * Math.sin(a) - 512; dy = ey + rx * Math.sin(a) + ry * Math.cos(a) - 640; }
		const r2 = ((x - 512) / 330) ** 2 + ((y - 400) / 260) ** 2; dx += turn * 20 * clamp(1 - r2);
		dy *= 1 - .05 * sq; dx *= 1 + .035 * sq * clamp((y - 330) / 300);
		return [neck[0] + (dx * ca - dy * sa) * SC, neck[1] + (dx * sa + dy * ca) * SC]; };
	drawMesh(M.head, headMap); ctx.setTransform(1, 0, 0, 1, 0, 0);
	// face: blinks; happy eyes + open mouth on the final crash
	const crashE = env(T.crash, t, .9), blink = [1.9, 4.6, 7.2, 9.9].some((b) => Math.abs(t - b) < .06), happy = crashE > .15;
	if (blink || happy) { for (const ex of [366, 660]) { const [cx, cy] = headMap(ex, 432); ell(cx, cy, 80 * SC, 72 * SC, 0, FUR, 0); }
		for (const ex of [318, 708]) { const [bx, by] = headMap(ex, 522); const gr = ctx.createRadialGradient(bx, by, 4, bx, by, 52); gr.addColorStop(0, 'rgba(244,160,160,.55)'); gr.addColorStop(1, 'rgba(244,160,160,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(bx, by, 56, 40, 0, 0, 7); ctx.fill(); } }
	if (blink || happy) for (const ex of [372, 652]) { const [cx, cy] = headMap(ex, 440);
		path(() => { if (happy) { ctx.moveTo(cx - 34, cy + 10); ctx.quadraticCurveTo(cx, cy - 34, cx + 34, cy + 10); } else { ctx.moveTo(cx - 34, cy); ctx.quadraticCurveTo(cx, cy + 16, cx + 34, cy); } }); fillStroke(null, 9); }
	if (happy) { const [mx, my] = headMap(512, 512); ell(mx, my + 6, 26, 22, 0, '#c8574f', 6); ell(mx, my + 16, 14, 8, 0, PINK, 0); }
	// drums
	const hatY = 752 - 6 * env(T.hat, t, .05), hatA = wob(T.hat, t, .05, .12, 7), crA = wob(T.crash, t, .28, .7, 3.2);
	for (const [x, y0] of [[1400, hatY], [565, 788], [520, 565]]) { line(x, y0, x, 1030, METAL, 10); line(x, 1030, x - 50, 1060, METAL, 8); line(x, 1030, x + 50, 1060, METAL, 8); }
	ell(520, 565, 150, 24, -.22 + crA, GOLD); circle(520, 565, 8, LINE, 0);
	ell(1400, hatY + 22, 120, 19, hatA * .3, GOLD); ell(1400, hatY, 120, 19, hatA, GOLD); circle(1400, hatY - 4, 7, LINE, 0);
	// arms: behind the drums, so the elbows tuck behind the kick and only forearms and paws reach over
	const sL = bodyMap(338, 652), sR = bodyMap(686, 652), useCrash = t > S.t0 + 15.5 * S.beat;
	let [pawL, sdL, lenL] = useCrash ? strokePose(sL, [640, 620], [530, 562], stroke(T.crash, t, 1.1)) : strokePose(sL, [650, 690], [580, 790], stroke(T.snare, t, 1));
	let [pawR, sdR, lenR] = strokePose(sR, [1300, 672], [1385, 750], stroke(T.hat, t, .7));
	if (ARM === 'B') {   // re-aim the sticks from the short-arm paws so the tips still land on the drums
		const fix = (sh, pw, sd, len, hit, contact) => { const np = nub(sh, pw), cp = nub(sh, contact), L = Math.hypot(hit[0] - cp[0], hit[1] - cp[1]); return [np, sd, L]; };
		[pawL, sdL, lenL] = useCrash ? fix(sL, pawL, sdL, lenL, [530, 562], [640, 620]) : fix(sL, pawL, sdL, lenL, [580, 790], [650, 690]);
		[pawR, sdR, lenR] = fix(sR, pawR, sdR, lenR, [1385, 750], [1300, 672]);
		const aim = (p, hit, h) => { const dn0 = [hit[0] - p[0], hit[1] - p[1]], l = Math.hypot(...dn0), dn = [dn0[0] / l, dn0[1] / l], up = [dn[0] * .25, -.97], v = [dn[0] * (1 - h) + up[0] * h, dn[1] * (1 - h) + up[1] * h], vl = Math.hypot(...v); return [[v[0] / vl, v[1] / vl], vl]; };
		let v; [sdL, v] = useCrash ? aim(nub(sL, [640, 620]), [530, 562], stroke(T.crash, t, 1.1)) : aim(nub(sL, [650, 690]), [580, 790], stroke(T.snare, t, 1)); lenL *= .55 + .45 * v;
		[sdR, v] = aim(nub(sR, [1300, 672]), [1385, 750], stroke(T.hat, t, .7)); lenR *= .55 + .45 * v;
	}
	arm(sL, pawL, -1); arm(sR, pawR, 1);
	const sy = 788 + 4 * sE; path(() => ctx.roundRect(445, sy, 240, 80, 14)); fillStroke(CORAL, 6);
	for (let i = 0; i < 5; i++) line(470 + i * 48, sy + 10, 470 + i * 48, sy + 70, 'rgba(255,255,255,.6)', 4);
	ell(565, sy, 120 * (1 + .03 * sE), 30, 0, CREAM);
	const kr = 165 * (1 + .03 * kE); circle(960, 885, kr, CORAL, 7); circle(960, 885, kr - 24, CREAM, 5); circle(960, 885, 52, 'rgba(245,163,160,.8)', 0);
	for (const [dx, dy, r] of [[-30, -18, 12], [0, -30, 12], [30, -18, 12], [0, 10, 22]]) circle(960 + dx, 885 + dy, r, CREAM, 0);
	stick(pawL, sdL, lenL); stick(pawR, sdR, lenR);
	// sparks on the snare and the crash
	for (const [arr, x, y, c] of [[T.snare, 575, 788, CORAL], [T.crash, 520, 560, GOLD]]) { const e = env(arr, t, .12); if (e < .05) continue; ctx.globalAlpha = e;
		for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r0 = 40 + 50 * (1 - e), r1 = r0 + 30 * e; line(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * .6, x + Math.cos(a) * r1, y + Math.sin(a) * r1 * .6, c, 6); } ctx.globalAlpha = 1; }
	return true;
};
window.grab = () => cv.toDataURL('image/jpeg', .93);
window.READY = true;
