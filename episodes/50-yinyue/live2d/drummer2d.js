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
function arm(sh, paw, sd) {
	const mx = (sh[0] + paw[0]) / 2, my = Math.max(sh[1], paw[1]) + 18;
	for (const [c, w] of [[LINE, 58], [FUR, 46]]) { path(() => { ctx.moveTo(sh[0], sh[1]); ctx.quadraticCurveTo(mx, my, paw[0], paw[1]); }); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); }
	const tip = [paw[0] + sd[0] * 170, paw[1] + sd[1] * 170];
	line(paw[0], paw[1], tip[0], tip[1], LINE, 17); line(paw[0], paw[1], tip[0], tip[1], STICK, 9); circle(tip[0], tip[1], 9, STICK, 4);
	circle(paw[0], paw[1], 33, FUR, 6);
	for (const [dx, dy, r] of [[-12, -8, 7], [0, -13, 7], [12, -8, 7], [0, 6, 11]]) circle(paw[0] + dx, paw[1] + dy, r, PINK, 0);
}
function strokePose(shoulder, contactPaw, hit, h) {
	const paw = [contactPaw[0] + (contactPaw[0] - shoulder[0]) * -.08 * h, contactPaw[1] - 95 * h];
	const dn0 = [hit[0] - contactPaw[0], hit[1] - contactPaw[1]], l = Math.hypot(...dn0), dn = [dn0[0] / l, dn0[1] / l];
	const up0 = [dn[0] * .35, -1], ul = Math.hypot(...up0), un = [up0[0] / ul, up0[1] / ul];
	const sd = [dn[0] * (1 - h) + un[0] * h, dn[1] * (1 - h) + un[1] * h], sl = Math.hypot(...sd);
	return [paw, [sd[0] / sl, sd[1] / sl]];
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
		if (y < 270 && Math.abs(x - 512) > 70) { const side = x < 512 ? -1 : 1, ex = 512 + side * 205, ey = 270, w = clamp((270 - y) / 180) * sstep(70, 170, Math.abs(x - 512)), a = (side < 0 ? SP.earL.x : SP.earR.x) * w;
			const rx = x - ex, ry = y - ey; dx = ex + rx * Math.cos(a) - ry * Math.sin(a) - 512; dy = ey + rx * Math.sin(a) + ry * Math.cos(a) - 640; }
		const r2 = ((x - 512) / 330) ** 2 + ((y - 400) / 260) ** 2; dx += turn * 20 * clamp(1 - r2);
		dy *= 1 - .05 * sq; dx *= 1 + .035 * sq * clamp((y - 330) / 300);
		return [neck[0] + (dx * ca - dy * sa) * SC, neck[1] + (dx * sa + dy * ca) * SC]; };
	drawMesh(M.head, headMap); ctx.setTransform(1, 0, 0, 1, 0, 0);
	// face: blinks; happy eyes + open mouth on the final crash
	const crashE = env(T.crash, t, .9), blink = [1.9, 4.6, 7.2, 9.9].some((b) => Math.abs(t - b) < .06), happy = crashE > .15;
	if (blink || happy) for (const ex of [378, 650]) { const [cx, cy] = headMap(ex, 440); ell(cx, cy, 64 * SC, 64 * SC, 0, FUR, 0);
		path(() => { if (happy) { ctx.moveTo(cx - 34, cy + 10); ctx.quadraticCurveTo(cx, cy - 34, cx + 34, cy + 10); } else { ctx.moveTo(cx - 34, cy); ctx.quadraticCurveTo(cx, cy + 16, cx + 34, cy); } }); fillStroke(null, 9); }
	if (happy) { const [mx, my] = headMap(512, 512); ell(mx, my + 6, 26, 22, 0, '#c8574f', 6); ell(mx, my + 16, 14, 8, 0, PINK, 0); }
	// drums
	const hatY = 690 - 6 * env(T.hat, t, .05), hatA = wob(T.hat, t, .05, .12, 7), crA = wob(T.crash, t, .28, .7, 3.2);
	for (const [x, y0] of [[1230, hatY], [640, 760], [560, 520]]) { line(x, y0, x, 1030, METAL, 10); line(x, 1030, x - 50, 1060, METAL, 8); line(x, 1030, x + 50, 1060, METAL, 8); }
	ell(560, 520, 160, 26, -.25 + crA, GOLD); circle(560, 520, 8, LINE, 0);
	ell(1230, hatY + 22, 130, 20, hatA * .3, GOLD); ell(1230, hatY, 130, 20, hatA, GOLD); circle(1230, hatY - 4, 7, LINE, 0);
	const sy = 760 + 4 * sE; path(() => ctx.roundRect(520, sy, 240, 80, 14)); fillStroke(CORAL, 6);
	for (let i = 0; i < 5; i++) line(545 + i * 48, sy + 10, 545 + i * 48, sy + 70, 'rgba(255,255,255,.6)', 4);
	ell(640, sy, 120 * (1 + .03 * sE), 30, 0, CREAM);
	const kr = 165 * (1 + .03 * kE); circle(960, 885, kr, CORAL, 7); circle(960, 885, kr - 24, CREAM, 5); circle(960, 885, 52, 'rgba(245,163,160,.8)', 0);
	for (const [dx, dy, r] of [[-30, -18, 12], [0, -30, 12], [30, -18, 12], [0, 10, 22]]) circle(960 + dx, 885 + dy, r, CREAM, 0);
	// arms (in front of the drums so every stroke reads)
	const sL = bodyMap(405, 655), sR = bodyMap(619, 655), useCrash = t > S.t0 + 15.5 * S.beat;
	const [pawL, sdL] = useCrash ? strokePose(sL, [600, 560], [560, 515], stroke(T.crash, t, 1.2)) : strokePose(sL, [640, 700], [650, 762], stroke(T.snare, t, 1));
	const [pawR, sdR] = strokePose(sR, [1150, 640], [1235, 690], stroke(T.hat, t, .6));
	arm(sL, pawL, sdL); arm(sR, pawR, sdR);
	// sparks on the snare and the crash
	for (const [arr, x, y, c] of [[T.snare, 650, 755, CORAL], [T.crash, 560, 510, GOLD]]) { const e = env(arr, t, .12); if (e < .05) continue; ctx.globalAlpha = e;
		for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r0 = 40 + 50 * (1 - e), r1 = r0 + 30 * e; line(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * .6, x + Math.cos(a) * r1, y + Math.sin(a) * r1 * .6, c, 6); } ctx.globalAlpha = 1; }
	return true;
};
window.grab = () => cv.toDataURL('image/jpeg', .93);
window.READY = true;
