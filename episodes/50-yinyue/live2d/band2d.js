// Kitten band (Canvas2D, Live2D-style). Four cats from the same illustration family, each cut into head / body / tail
// meshes and driven by one score (band.json): grey = bass, cream = drums, tuxedo = keys, Siamese = vocals.
// Shared rig: springs (head lags the body, ears flop, tail wags), eye blinks by squashing the eye region in the mesh,
// chubby no-elbow arms (style D) drawn in code, instruments drawn in code in the art's flat style.
const S = await (await fetch('./band.json')).json();
const W = 1920, H = 1080, LINE = '#5f3026', PINK = '#f5a3a0', CORAL = '#f08a6e', CREAM = '#fdf3df', GOLD = '#f2c46a', METAL = '#b9c0cc', STICK = '#e9b77d';
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; document.body.appendChild(cv); const ctx = cv.getContext('2d');
const img = async (src) => { const i = new Image(); i.src = src; await i.decode(); return i; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const SC = .92, OX = 960, OY = 1000;

// ---------- score helpers ----------
const ev = (i) => S.hits.filter((h) => h.i === i);
const tms = (i) => ev(i).map((h) => h.t);
const T = { kick: tms('kick'), snare: tms('snare'), hat: tms('hat'), crash: tms('crash'), bass: tms('bass'), keys: tms('keys'), lead: tms('lead') };
const E = { bass: ev('bass'), keys: ev('keys'), lead: ev('lead') };
const prevNext = (arr, t) => { let p = -1e9, n = 1e9; for (const x of arr) { if (x <= t + 1e-6) p = Math.max(p, x); else n = Math.min(n, x); } return [p, n]; };
const env = (arr, t, d) => { const [p] = prevNext(arr, t); return p < -1e8 ? 0 : Math.exp(-(t - p) / d); };
const active = (list, t) => { let a = null; for (const e of list) if (e.t <= t + 1e-6) a = e; return a; };
function stroke(arr, t, up) { const [p, n] = prevNext(arr, t), d1 = t - p, d2 = n - t, I_ = n - p, Aw = Math.min(.15, I_ * .45);
	const rest = (p < -1e8 ? .35 : .35 * sstep(0, .22, d1)) * up + (p < -1e8 ? 0 : .3 * up * Math.sin(Math.PI * clamp(d1 / .13)));
	if (n > 1e8) return rest; const wind = up * (1 - Math.pow(1 - clamp(d2 / Aw), 3)), wg = 1 - sstep(Aw, Aw + .18, d2); return rest + (wind - rest) * wg; }
const wob = (arr, t, amp, d, f) => { const [p] = prevNext(arr, t); return p < -1e8 ? 0 : amp * Math.exp(-(t - p) / d) * Math.sin((t - p) * f * 2 * Math.PI); };

// ---------- drawing helpers (local coordinates: each cat lives in the solo 1920x1080 layout, then gets placed) ----------
let BASE = new DOMMatrix();
const path = (f) => { ctx.beginPath(); f(); };
const fillStroke = (fill, w = 6) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (w) { ctx.strokeStyle = LINE; ctx.lineWidth = w; ctx.lineJoin = ctx.lineCap = 'round'; ctx.stroke(); } };
const circle = (x, y, r, fill, w = 6) => { path(() => ctx.arc(x, y, r, 0, Math.PI * 2)); fillStroke(fill, w); };
const ell = (x, y, rx, ry, a, fill, w = 6) => { path(() => ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2)); fillStroke(fill, w); };
const line = (x0, y0, x1, y1, col, w) => { path(() => { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); }); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); };
function tri(im, u0, u1, u2, p0, p1, p2) {
	const cx = (p0[0] + p1[0] + p2[0]) / 3, cy = (p0[1] + p1[1] + p2[1]) / 3, g = (p) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * 1.1, p[1] + dy / l * 1.1]; };
	const q0 = g(p0), q1 = g(p1), q2 = g(p2);
	ctx.save(); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.closePath(); ctx.clip();
	const [x0, y0] = u0, [x1, y1] = u1, [x2, y2] = u2, d = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
	const a = ((p1[0] - p0[0]) * (y2 - y0) - (p2[0] - p0[0]) * (y1 - y0)) / d, c = ((p2[0] - p0[0]) * (x1 - x0) - (p1[0] - p0[0]) * (x2 - x0)) / d;
	const b = ((p1[1] - p0[1]) * (y2 - y0) - (p2[1] - p0[1]) * (y1 - y0)) / d, dd = ((p2[1] - p0[1]) * (x1 - x0) - (p1[1] - p0[1]) * (x2 - x0)) / d;
	ctx.transform(a, b, c, dd, p0[0] - a * x0 - c * y0, p0[1] - b * x0 - dd * y0); ctx.drawImage(im, 0, 0); ctx.restore();
}
function grid(box, nx, ny) { const [x0, y0, x1, y1] = box, pts = []; for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) pts.push([x0 + (x1 - x0) * i / nx, y0 + (y1 - y0) * j / ny]); return { nx, ny, pts, box }; }
function drawMesh(im, m, f) { const [bx, by] = m.box, P = m.pts.map(([x, y]) => f(x, y)), U = m.pts.map(([x, y]) => [x - bx, y - by]), n = m.nx + 1;
	for (let j = 0; j < m.ny; j++) for (let i = 0; i < m.nx; i++) { const a = j * n + i, b = a + 1, c = a + n, d = c + 1; tri(im, U[a], U[b], U[c], P[a], P[b], P[c]); tri(im, U[b], U[d], U[c], P[b], P[d], P[c]); } }
// arm style D: a soft tapered arm, the shoulder hidden in the body; the paw drawn separately so it can sit on top of instruments
function armD(sh, paw, side, fur) {
	const dx = paw[0] - sh[0], dy = paw[1] - sh[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, r0 = 34, r1 = 23, bow = side * 10;
	const mid = [sh[0] + dx * .5 + nx * bow, sh[1] + dy * .5 + ny * bow];
	path(() => { ctx.moveTo(sh[0] + nx * r0, sh[1] + ny * r0); ctx.quadraticCurveTo(mid[0] + nx * (r0 + r1) / 2, mid[1] + ny * (r0 + r1) / 2, paw[0] + nx * r1, paw[1] + ny * r1);
		ctx.lineTo(paw[0] - nx * r1, paw[1] - ny * r1); ctx.quadraticCurveTo(mid[0] - nx * (r0 + r1) / 2, mid[1] - ny * (r0 + r1) / 2, sh[0] - nx * r0, sh[1] - ny * r0); ctx.closePath(); });
	fillStroke(fur, 6); circle(sh[0], sh[1], 30, fur, 0);
}
function pawDraw(p, fur, r = 29) { circle(p[0], p[1], r, fur, 6); for (const [dx, dy, rr] of [[-11, -8, 6.5], [0, -12, 6.5], [11, -8, 6.5], [0, 5, 10]]) circle(p[0] + dx * r / 31, p[1] + dy * r / 31, rr * r / 31, PINK, 0); }

// ---------- a cat ----------
const CFG = [
	{ name: 'grey', inst: 'bass', x: 370, y: 1068, k: .6, lean: 1, nod: .8, off: .0, fur: '#a9a6ab', paw: '#f6f1ea' },
	{ name: 'cream', inst: 'drums', x: 760, y: 805, k: .47, lean: .8, nod: 1, off: .05, fur: '#fbf4e4', paw: '#fbf4e4' },
	{ name: 'tux', inst: 'keys', x: 1185, y: 805, k: .47, lean: .6, nod: .9, off: .12, fur: '#3c3a40', paw: '#f6f1ea' },
	{ name: 'siamese', inst: 'vocal', x: 1560, y: 1068, k: .6, lean: 1.3, nod: .5, off: .2, fur: '#f1e3cf', paw: '#6a4b3e' },
];
const K = .42, PLACE_Y = 1012;
const cats = [];
for (const c of CFG) {
	const J = await (await fetch(`./${c.name}.json`)).json();
	const tex = { head: await img(`./${c.name}_head.png`), body: await img(`./${c.name}_body.png`), tail: await img(`./${c.name}_tail.png`) };
	cats.push({ ...c, J, tex, M: { head: grid(J.boxes.head, 28, 26), body: grid(J.boxes.body, 10, 10), tail: grid(J.boxes.tail, 5, 12) },
		SP: Object.fromEntries(Object.entries({ hx: [90, 9], hy: [140, 11], ha: [70, 8], earL: [120, 5], earR: [110, 5], tail: [30, 3.5], cheek: [260, 10] }).map(([k, [kk, cc]]) => [k, { x: 0, v: 0, k: kk * (1 + c.off), c: cc }])) });
}
let simT = 0;
function drivers(c, t) {
	const ph = (t - S.t0) / S.beat, on = t > S.t0 - .2;
	const acc = c.inst === 'drums' ? env(T.kick, t, .1) : c.inst === 'bass' ? env(T.bass, t, .12) * .8 : c.inst === 'keys' ? env(T.keys, t, .12) * .7 : env(T.lead, t, .2) * .4;
	return { ph, acc, sE: c.inst === 'drums' ? env(T.snare, t, .09) : 0, lean: on ? c.lean * Math.sin(Math.PI * (ph + c.off * 2)) : 0, nod: on ? c.nod * (.5 + .5 * Math.cos(2 * Math.PI * (ph - .1 - c.off))) : 0 };
}
function step(dt, t) { for (const c of cats) { const d = drivers(c, t), SP = c.SP;
	const tg = { hx: d.lean * 14, hy: d.nod * 12 + d.acc * 16, ha: d.lean * .05 + d.nod * .03, earL: 0, earR: 0, tail: Math.sin(Math.PI * d.ph * .5 + c.off * 9) * .35, cheek: d.acc };
	for (const [k, s] of Object.entries(SP)) { const a = s.k * (tg[k] - s.x) - s.c * s.v; s.v += a * dt; s.x += s.v * dt; }
	SP.earL.v += (-SP.hx.v * .012 - SP.hy.v * .01 + d.sE * 1.2) * dt * 24; SP.earR.v += (SP.hx.v * .012 - SP.hy.v * .01 - d.sE * 1.2) * dt * 24; } }
function advance(t) { if (t < simT - 1e-6) { simT = 0; for (const c of cats) for (const s of Object.values(c.SP)) { s.x = 0; s.v = 0; } } while (simT < t) { step(1 / 480, simT); simT += 1 / 480; } }
const I = (x, y) => [OX + (x - 512) * SC, OY + (y - 964) * SC];

function drawCat(c, t) {
	const d = drivers(c, t), SP = c.SP, J = c.J, sq = SP.cheek.x, lean = d.lean, [hcx, hcy, hrx, hry] = J.head;
	BASE = new DOMMatrix().translate(c.x, c.y).scale(c.k).translate(-OX, -OY); ctx.setTransform(BASE);
	ctx.fillStyle = 'rgba(160,110,140,.18)'; ctx.beginPath(); ctx.ellipse(960, 1005, 330, 40, 0, 0, 7); ctx.fill();
	const breath = .008 * Math.sin(t * 2 * Math.PI / 2.6 + c.off * 7);
	const bodyMap = (x, y) => { const hgt = (964 - y) / 540; let [sx, sy] = I(x, y); sx += lean * 26 * hgt * hgt; sy = OY - (OY - sy) * (1 - .04 * sq + breath); return [OX + (sx - OX) * (1 + .03 * sq), sy]; };
	drawMesh(c.tex.tail, c.M.tail, (x, y) => { const bx = 778, by = 872, rx = x - bx, ry = y - by, k = clamp(Math.hypot(rx, ry) / 230), a = SP.tail.x * k * 1.4;
		const [sx, sy] = I(bx + rx * Math.cos(a) - ry * Math.sin(a), by + rx * Math.sin(a) + ry * Math.cos(a)); return [sx + lean * 7, sy]; });
	// instrument parts that sit behind the body come first
	if (c.inst === 'keys') keysBack(c, t);
	drawMesh(c.tex.body, c.M.body, bodyMap);
	// head: springs + ears + slight turn + cheek squash + eye blinks (eye region squashed shut in the mesh)
	const nk = bodyMap(hcx, J.neckY), neck = [nk[0] + SP.hx.x, nk[1] + SP.hy.x - 4], ang = SP.ha.x, ca = Math.cos(ang), sa = Math.sin(ang), turn = lean * .9;
	const ear = hcy - hry * .55, eyeOpen = eyeOpenness(c, t), R = J.eyeR;
	const headMap = (x, y) => {
		if (eyeOpen < .999) for (const [ex, ey] of J.eyes) { const r = Math.hypot((x - ex) / (R * 1.3), (y - ey) / (R * 1.15)); if (r < 1) { const w = sstep(1, .45, r); y = y - (y - ey) * (1 - eyeOpen) * w; } }
		let dx = x - hcx, dy = y - J.neckY;
		if (y < ear && Math.abs(x - hcx) > 80) { const side = x < hcx ? -1 : 1, ex = hcx + side * 205 * hrx / 326, w = sstep(ear, ear - 140, y) * sstep(80, 200, Math.abs(x - hcx)) * .4, a = (side < 0 ? SP.earL.x : SP.earR.x) * w;
			const rx = x - ex, ry = y - ear; dx = ex + rx * Math.cos(a) - ry * Math.sin(a) - hcx; dy = ear + rx * Math.sin(a) + ry * Math.cos(a) - J.neckY; }
		const r2 = ((x - hcx) / hrx) ** 2 + ((y - hcy) / hry) ** 2; dx += turn * 20 * clamp(1 - r2);
		dy *= 1 - .05 * sq; dx *= 1 + .035 * sq * clamp((y - (hcy - 60)) / 300);
		return [neck[0] + (dx * ca - dy * sa) * SC, neck[1] + (dx * sa + dy * ca) * SC]; };
	drawMesh(c.tex.head, c.M.head, headMap);
	ctx.setTransform(BASE);
	// shoulders (on the body, below the cheeks)
	const sL = bodyMap(hcx - 172, J.neckY + 22), sR = bodyMap(hcx + 172, J.neckY + 22);
	INST[c.inst](c, t, { sL, sR, headMap, d });
}
// paws never enter the face: push a paw out of the head ellipse (with a margin) along the radius
function clearFace(c, p, headMap) { const [hcx, hcy, hrx, hry] = c.J.head, [qx, qy] = headMap(hcx, hcy), rx = hrx * SC * 1.12, ry = hry * SC * 1.12;
	const dx = (p[0] - qx) / rx, dy = (p[1] - qy) / ry, r = Math.hypot(dx, dy); if (r >= 1) return p; return [qx + dx / r * rx, qy + dy / r * ry]; }
function eyeOpenness(c, t) {
	const blinks = [1.9, 4.6, 7.2, 9.9].map((b) => b + c.off * 3.1);
	let o = 1; for (const b of blinks) o = Math.min(o, 1 - .92 * (1 - sstep(.0, .07, Math.abs(t - b))));
	if (c.inst === 'vocal') { const L = active(E.lead, t); if (L && L.d > S.beat * 1.2 && t > L.t + .15 && t < L.t + L.d) o = Math.min(o, .1); }   // eyes closed on long sung notes
	if (env(T.crash, t, .9) > .15) o = Math.min(o, .1);
	return o;
}
// ---------- instruments ----------
function strokePose(contactPaw, hit, h, lift = 62) {
	const paw = [contactPaw[0], contactPaw[1] - lift * h];
	const dn0 = [hit[0] - contactPaw[0], hit[1] - contactPaw[1]], l = Math.hypot(...dn0), dn = [dn0[0] / l, dn0[1] / l];
	const up = [dn[0] * .25, -.97], v = [dn[0] * (1 - h) + up[0] * h, dn[1] * (1 - h) + up[1] * h], vl = Math.hypot(...v);
	return [paw, [v[0] / vl, v[1] / vl], l * (.55 + .45 * vl)];
}
function stick(paw, sd, L) { const tip = [paw[0] + sd[0] * L, paw[1] + sd[1] * L]; line(paw[0] - sd[0] * 18, paw[1] - sd[1] * 18, tip[0], tip[1], LINE, 17); line(paw[0] - sd[0] * 18, paw[1] - sd[1] * 18, tip[0], tip[1], STICK, 9); circle(tip[0], tip[1], 9, STICK, 4); }
const INST = {
	drums(c, t, { sL, sR }) {
		const kE = env(T.kick, t, .1), sE = env(T.snare, t, .09), hatY = 752 - 6 * env(T.hat, t, .05), hatA = wob(T.hat, t, .05, .12, 7), crA = wob(T.crash, t, .28, .7, 3.2);
		for (const [x, y0] of [[1400, hatY], [565, 788], [520, 565]]) { line(x, y0, x, 1030, METAL, 10); line(x, 1030, x - 50, 1060, METAL, 8); line(x, 1030, x + 50, 1060, METAL, 8); }
		ell(520, 565, 150, 24, -.22 + crA, GOLD); ell(1400, hatY + 22, 120, 19, hatA * .3, GOLD); ell(1400, hatY, 120, 19, hatA, GOLD);
		const useCrash = t > S.t0 + 15.5 * S.beat;
		const [pL, dL, lL] = useCrash ? strokePose([640, 620], [530, 562], stroke(T.crash, t, 1.1)) : strokePose([650, 690], [580, 790], stroke(T.snare, t, 1));
		const [pR, dR, lR] = strokePose([1300, 672], [1385, 750], stroke(T.hat, t, .7));
		armD(sL, pL, -1, c.fur); armD(sR, pR, 1, c.fur);
		const sy = 788 + 4 * sE; path(() => ctx.roundRect(445, sy, 240, 80, 14)); fillStroke(CORAL, 6); ell(565, sy, 120 * (1 + .03 * sE), 30, 0, CREAM);
		const kr = 165 * (1 + .03 * kE); circle(960, 885, kr, CORAL, 7); circle(960, 885, kr - 24, CREAM, 5); circle(960, 885, 52, 'rgba(245,163,160,.8)', 0);
		for (const [dx, dy, r] of [[-30, -18, 12], [0, -30, 12], [30, -18, 12], [0, 10, 22]]) circle(960 + dx, 885 + dy, r, CREAM, 0);
		pawDraw(pL, c.paw); pawDraw(pR, c.paw); stick(pL, dL, lL); stick(pR, dR, lR);
		for (const [arr, x, y, col] of [[T.snare, 575, 788, CORAL], [T.crash, 520, 560, GOLD]]) { const e = env(arr, t, .12); if (e < .05) continue; ctx.globalAlpha = e;
			for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r0 = 40 + 50 * (1 - e), r1 = r0 + 30 * e; line(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * .6, x + Math.cos(a) * r1, y + Math.sin(a) * r1 * .6, col, 6); } ctx.globalAlpha = 1; }
	},
	bass(c, t, { sL, sR }) {
		// the bass hangs across the body: body low on the cat's left (screen right), neck up toward screen left
		const N = active(E.bass, t), pE = env(T.bass, t, .25), ang = .42, bc = [1035, 875];
		const toW = (u, v) => [bc[0] + 1.25 * (u * Math.cos(ang) - v * Math.sin(ang)), bc[1] + 1.25 * (u * Math.sin(ang) + v * Math.cos(ang))];
		// fretting paw slides along the neck to the note's position (eased just before the note)
		const fretU = (n) => -175 - ((n - 29) % 12 + 12) % 12 * 16;
		const [pN, nN] = prevNext(T.bass, t), next = E.bass.find((e) => Math.abs(e.t - nN) < 1e-6), cur = N || E.bass[0];
		let u = fretU(cur.n); if (next) u += (fretU(next.n) - u) * sstep(nN - .09, nN - .01, t);
		const fret = toW(u, -6), pluck0 = toW(30, 0), h = stroke(T.bass, t, .55), pluck = [pluck0[0] + 26 * h, pluck0[1] - 40 * h];
		armD(sL, fret, -1, c.fur); armD(sR, pluck, 1, c.fur);
		ctx.save(); ctx.translate(bc[0], bc[1]); ctx.rotate(ang); ctx.scale(1.25, 1.25);
		path(() => { ctx.ellipse(10, 0, 100, 78, 0, 0, 7); }); fillStroke('#7fb2e5', 6);
		path(() => { ctx.ellipse(-62, -4, 70, 58, 0, 0, 7); }); fillStroke('#7fb2e5', 6);
		path(() => { ctx.ellipse(10, 0, 100, 78, 0, 0, 7); ctx.ellipse(-62, -4, 70, 58, 0, 0, 7); }); ctx.fillStyle = '#7fb2e5'; ctx.fill();
		path(() => ctx.roundRect(-410, -13, 330, 26, 6)); fillStroke('#e3b27a', 5);
		for (let f = 0; f < 9; f++) line(-110 - f * 32, -13, -110 - f * 32, 13, '#a9763f', 3);
		path(() => ctx.roundRect(-470, -22, 66, 44, 10)); fillStroke('#5f3026', 0); circle(-460, -22, 5, METAL, 0); circle(-430, -22, 5, METAL, 0); circle(-460, 22, 5, METAL, 0); circle(-430, 22, 5, METAL, 0);
		path(() => ctx.roundRect(40, -20, 22, 40, 5)); fillStroke('#4a4458', 4);
		for (let s = 0; s < 4; s++) { const v0 = -9 + s * 6, w = pE * 3 * Math.sin(t * 90 + s) * (s === 1 ? 1 : .5); path(() => { ctx.moveTo(52, v0); ctx.quadraticCurveTo(-180, v0 + w, -405, v0); }); ctx.strokeStyle = '#eef1f6'; ctx.lineWidth = 2.5; ctx.stroke(); }
		ctx.restore(); ctx.setTransform(BASE);
		pawDraw(fret, c.paw); pawDraw(pluck, c.paw);
	},
	keys(c, t, { sL, sR }) {
		const K_ = active(E.keys, t), on = K_ && t < K_.t + K_.d, bar = K_ ? K_.bar : 0, hL = stroke(T.keys, t, .7), hR = stroke(T.keys.map((x) => x + .02), t, .7);
		const xL = 800 + [0, -30, -60, 20, -10][bar] , xR = 1110 + [0, 20, -20, 40, 30][bar];
		const pL = [xL, 770 - 46 * hL], pR = [xR, 770 - 46 * hR];
		armD(sL, pL, -1, c.fur); armD(sR, pR, 1, c.fur);
		// keyboard on an X stand
		line(700, 860, 1220, 1050, METAL, 10); line(1220, 860, 700, 1050, METAL, 10);
		path(() => ctx.roundRect(600, 760, 720, 100, 16)); fillStroke('#4a4458', 6);
		const kw = 660 / 22; for (let i = 0; i < 22; i++) { const x = 630 + i * kw, down = on && (Math.abs(x + kw / 2 - xL) < kw * 1.5 || Math.abs(x + kw / 2 - xR) < kw * 1.5) && (hL < .15 || hR < .15);
			path(() => ctx.roundRect(x + 1, 772 + (down ? 4 : 0), kw - 2, 76, 4)); fillStroke(down ? '#f5d9de' : '#ffffff', 2.5); }
		for (let i = 0; i < 21; i++) { if ([2, 6, 9, 13, 16, 20].includes(i)) continue; const x = 630 + (i + 1) * kw - 9; path(() => ctx.roundRect(x, 772, 18, 46, 3)); fillStroke('#2f2c38', 0); }
		pawDraw(pL, c.paw); pawDraw(pR, c.paw);
		const e = env(T.keys, t, .25); if (e > .05) { ctx.globalAlpha = e; for (const x of [xL, xR]) for (let i = 0; i < 3; i++) line(x - 30 + i * 30, 730 - 26 * (1 - e), x - 36 + i * 36, 708 - 40 * (1 - e), '#b79cf0', 6); ctx.globalAlpha = 1; }
	},
	vocal(c, t, { sL, sR, headMap }) {
		const L = active(E.lead, t), live = L && t < L.t + L.d + .05, open = live ? sstep(L.t, L.t + .05, t) * (1 - sstep(L.t + L.d - .05, L.t + L.d + .05, t)) * (.75 + .25 * Math.sin((t - L.t) * 18)) : 0;
		const [mx, my] = headMap(...c.J.mouth);
		// mouth: an open 'aah' over the little ω
		if (open > .05) { ell(mx, my + 4, 26 + 6 * open, 10 + 22 * open, 0, '#c8574f', 6); ell(mx, my + 10 + 10 * open, 14, 6 + 4 * open, 0, PINK, 0); }
		// the mic in the right paw, held just below and beside the mouth; the left paw rises with the pitch
		const mic = [mx + 105, my + 150], pitch = L ? (L.n - 76) : 0, pL = clearFace(c, [sL[0] - 150, sL[1] - 60 - pitch * 7 - 40 * open], headMap);
		armD(sR, mic, 1, c.fur); armD(sL, pL, -1, c.fur);
		line(mic[0], mic[1], mic[0] - 46, mic[1] - 70, '#4a4458', 22); circle(mic[0] - 52, mic[1] - 82, 26, '#8d93a3', 6); for (let i = -1; i <= 1; i++) line(mic[0] - 70, mic[1] - 82 + i * 9, mic[0] - 34, mic[1] - 82 + i * 9, '#6e7487', 3);
		pawDraw(mic, c.paw); pawDraw(pL, c.paw);
		// little notes float up from each sung note
		for (const e of E.lead) { const a = (t - e.t) / 1.5; if (a < 0 || a > 1) continue; const side = (E.lead.indexOf(e) % 2 ? 1 : -1);
			ctx.globalAlpha = 1 - a; ctx.fillStyle = side > 0 ? '#e88aa8' : '#8fb7e8'; ctx.font = `bold ${64 + 10 * Math.sin(a * 6)}px "Noto Sans CJK SC", sans-serif`; ctx.fillText('♪', mx + side * (90 + 120 * a) - 20, my - 120 - 260 * a); ctx.globalAlpha = 1; }
	},
};
function keysBack() {}

window.renderAt = (t) => {
	advance(t); ctx.setTransform(1, 0, 0, 1, 0, 0);
	const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fbeef4'); g.addColorStop(1, '#f2e2ee'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
	ctx.fillStyle = '#f6dbe6'; for (let y = 30; y < 640; y += 90) for (let x = (y / 90) % 2 ? 45 : 0; x < W; x += 90) { ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); }
	ctx.fillStyle = '#f0dbe8'; ctx.fillRect(0, 560, W, 260);                   // back riser top
	ctx.fillStyle = '#e8cfe0'; ctx.fillRect(0, 800, W, 30);                    // riser front edge
	ctx.fillStyle = '#efd8e6'; ctx.fillRect(0, 830, W, H - 830);               // front stage
	ctx.strokeStyle = '#d9bfd2'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 70 + 40 * Math.sin(x / W * Math.PI * 3) ** 2); ctx.stroke();
	const lightCols = ['#f5a3a0', '#f2c46a', '#9fd3c7', '#b79cf0'];
	for (let i = 0; i < 24; i++) { const x = 40 + i * 80, y = 78 + 40 * Math.sin(x / W * Math.PI * 3) ** 2, col = lightCols[i % 4], inst = ['drums', 'bass', 'keys', 'vocal'][i % 4];
		const c = cats.find((q) => q.inst === inst), e = inst === 'drums' ? env(T.kick, t, .2) : inst === 'bass' ? env(T.bass, t, .25) : inst === 'keys' ? env(T.keys, t, .3) : env(T.lead, t, .4);
		ctx.globalAlpha = .45 + .55 * e; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y + 18, 13 + 4 * e, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
	for (const c of cats) { const e = c.inst === 'drums' ? env(T.kick, t, .2) : c.inst === 'bass' ? env(T.bass, t, .25) : c.inst === 'keys' ? env(T.keys, t, .3) : env(T.lead, t, .4), cy = c.y - 330 * c.k / .44;
		const rg = ctx.createRadialGradient(c.x, cy, 20, c.x, cy, 320 * c.k / .44); rg.addColorStop(0, `rgba(255,255,255,${.5 + .3 * e})`); rg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = rg; ctx.fillRect(c.x - 400, cy - 400, 800, 800); }
	// the band's sign, hanging from two strings, swaying a little with the beat
	{ const sw = .025 * Math.sin(Math.PI * (t - S.t0) / S.beat), e = env(T.kick, t, .15); ctx.save(); ctx.translate(960, 190); ctx.rotate(sw);
		line(-260, -150, -200, -20, '#c9a9be', 4); line(260, -150, 200, -20, '#c9a9be', 4);
		path(() => ctx.roundRect(-300, -30, 600, 150, 40)); fillStroke('#fff8f2', 7);
		ctx.fillStyle = LINE; ctx.font = '900 92px "Noto Sans CJK SC", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('喵喵乐队', 0, 78 + 4 * e);
		for (const [x, y] of [[-250, 10], [250, 10]]) { circle(x, y, 18, PINK, 0); for (const [dx, dy] of [[-14, -18], [0, -24], [14, -18]]) circle(x + dx, y + dy, 7, PINK, 0); }
		ctx.restore(); ctx.textAlign = 'start'; }
	for (const c of [...cats].sort((p, q) => p.y - q.y)) drawCat(c, t);
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	return true;
};
window.grab = () => cv.toDataURL('image/jpeg', .93);
window.READY = true;
