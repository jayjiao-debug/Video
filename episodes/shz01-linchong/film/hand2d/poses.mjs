// Designed 2D hand key poses for the 林冲 film (right hand; flip:true mirrors it into a left hand).
// Every pose is hand-designed geometry (the 3D renders in ../hand3d were only proportion/pose guides):
// a palm block, four fingers built as joint chains with set widths, and the thumb always as its own shape.
//
//   hand(pose, { x, y, size, rot, flip, sleeve, sleeveCol, t, layer, light }) -> '<g>…</g>'
//     pose     'fist' | 'loose' | 'open' | 'press' | 'brush' | 'grip' | 'shoulder' | 'stone'
//              or 'fist>open' with t 0..2 (0 = fist, 1 = loose, 2 = open; the three share one structure, so in-betweens interpolate)
//     x, y     wrist centre on screen; size = wrist to middle fingertip in px (S01 open hand ≈ 353)
//     rot      degrees (0 = fingers up); flip mirrors (left hand)
//     sleeve   true (default) draws the forearm sleeve with its cuff; sleeveCol (default convict slate #3B4356)
//     layer    'all' (default) | 'back' | 'front' — for poses that sit around a prop (grip: fingers behind the paper,
//              thumb in front; brush: the shaft is drawn inside the hand between layers; shoulder: fingertips behind)
//     light    screen direction the light comes FROM (default up-left [-0.7, -0.7]); the cel shadow sits opposite
// Style: flat skin #efb58e, one hard graphic cel shadow #d29a76 (offset crescent, not 3D shading),
// ink #2A1C17 with weight variation (heavier away from the light, thinner in concave corners, tapered open ends).

const SKIN = '#efb58e', SHADE = '#d29a76', INK = '#2A1C17', NAIL = '#f6c9a6';
let UID = 0;
const f = (n) => (Math.round(n * 100) / 100).toString();
const lerp = (a, b, k) => a + (b - a) * k;
const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]], mul: (a, k) => [a[0] * k, a[1] * k],
  len: (a) => Math.hypot(a[0], a[1]), norm: (a) => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; },
  perp: (a) => [-a[1], a[0]],
};

// ---------------------------------------------------------------- geometry helpers
// Catmull-Rom resampling of a polyline (closed or open), n samples per segment
function cr(pts, closed = true, n = 10) {
  const out = [], m = pts.length, P = (i) => pts[closed ? (i + m) % m : Math.max(0, Math.min(m - 1, i))];
  const segs = closed ? m : m - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  if (!closed) out.push(pts[m - 1]);
  return out;
}
const pathOf = (pts, closed = true) => 'M' + pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' L') + (closed ? 'Z' : '');
function signedArea(p) { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; }

// A finger/thumb from a joint chain c[0..n] (base -> tip) with half-widths r[0..n]: a clean capsule chain.
// Returns { pts (closed outline), s (0 at the base .. 1 at the tip, per point) }.
function chain(c, r, { base = 'flat' } = {}) {
  const n = c.length, L = [], R = [], sL = [], sR = [];
  let acc = [0];
  for (let i = 1; i < n; i++) acc.push(acc[i - 1] + V.len(V.sub(c[i], c[i - 1])));
  const tot = acc[n - 1] || 1;
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    let d = V.norm(V.sub(b, a));
    const nrm = V.perp(d);
    L.push(V.add(c[i], V.mul(nrm, r[i]))); R.push(V.sub(c[i], V.mul(nrm, r[i])));
    sL.push(acc[i] / tot); sR.push(acc[i] / tot);
  }
  // round tip
  const dT = V.norm(V.sub(c[n - 1], c[n - 2])), nT = V.perp(dT), tip = [];
  for (let k = 1; k < 8; k++) {
    const a = Math.PI * k / 8;
    tip.push(V.add(c[n - 1], V.add(V.mul(nT, Math.cos(a) * r[n - 1]), V.mul(dT, Math.sin(a) * r[n - 1]))));
  }
  let pts = [...L, ...tip, ...R.reverse()], s = [...sL, ...tip.map(() => 1), ...sR.reverse()];
  if (base === 'round') {
    const d0 = V.norm(V.sub(c[1], c[0])), n0 = V.perp(d0), bs = [];
    for (let k = 1; k < 8; k++) { const a = Math.PI * k / 8; bs.push(V.add(c[0], V.add(V.mul(n0, -Math.cos(a) * r[0]), V.mul(d0, -Math.sin(a) * r[0])))); }
    pts = [...pts, ...bs]; s = [...s, ...bs.map(() => 0)];
  }
  // smooth: resample with Catmull-Rom, carry s along
  const sm = cr(pts, true, 6), ss = [];
  for (let i = 0; i < pts.length; i++) for (let k = 0; k < 6; k++) ss.push(lerp(s[i], s[(i + 1) % pts.length], k / 6));
  return { pts: sm, s: ss };
}
function blob(ctrl) { const pts = cr(ctrl, true, 10); return { pts, s: pts.map(() => 0.5) }; }

// variable-width ink ring/strip along an outline; skip(i) hides ink there; open runs get tapered ends
function ink(shape, w0, light, { skip = null, scale = 1 } = {}) {
  let p = shape.pts;
  const n = p.length, ori = signedArea(p) > 0 ? 1 : -1;
  const away = V.norm([-light[0], -light[1]]);
  const w = new Array(n), on = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = p[(i - 2 + n) % n], b = p[(i + 2) % n];
    const t = V.norm(V.sub(b, a));
    const nout = V.mul([t[1], -t[0]], ori);
    const d = nout[0] * away[0] + nout[1] * away[1];
    const t1 = V.sub(p[i], p[(i - 3 + n) % n]), t2 = V.sub(p[(i + 3) % n], p[i]);
    const crs = (t1[0] * t2[1] - t1[1] * t2[0]) * ori / ((V.len(t1) * V.len(t2)) || 1);
    w[i] = w0 * (0.62 + 0.75 * Math.pow(Math.max(0, d * 0.5 + 0.5), 1.4)) * (crs < -0.3 ? 0.55 : 1);
    on[i] = !(skip && skip(i, shape));
  }
  // smooth widths
  const ws = w.map((_, i) => (w[(i - 2 + n) % n] + w[(i - 1 + n) % n] * 2 + w[i] * 3 + w[(i + 1) % n] * 2 + w[(i + 2) % n]) / 9);
  // runs
  const runs = [];
  if (on.every(Boolean)) runs.push({ idx: [...Array(n).keys()], closed: true });
  else {
    let start = on.findIndex((v, i) => v && !on[(i - 1 + n) % n]);
    if (start < 0) return '';
    let i = start, cur = null, guard = 0;
    do {
      if (on[i]) { if (!cur) cur = []; cur.push(i); } else if (cur) { runs.push({ idx: cur, closed: false }); cur = null; }
      i = (i + 1) % n; guard++;
    } while (i !== start && guard <= n + 1);
    if (cur) runs.push({ idx: cur, closed: false });
  }
  let out = '';
  for (const r of runs) {
    const m = r.idx.length;
    if (m < 4) continue;
    const A = [], B = [];
    for (let k = 0; k < m; k++) {
      const i = r.idx[k];
      const a = p[(i - 1 + n) % n], b = p[(i + 1) % n];
      const t = V.norm(V.sub(b, a)), nn = [t[1], -t[0]];
      let ww = ws[i];
      if (!r.closed) { const e = Math.min(k, m - 1 - k) / Math.min(10, m / 2); ww *= Math.min(1, 0.25 + 0.75 * e); }
      A.push(V.add(p[i], V.mul(nn, ww / 2))); B.push(V.sub(p[i], V.mul(nn, ww / 2)));
    }
    out += r.closed ? `<path d="${pathOf(A)} ${pathOf(B.reverse())}" fill="${INK}" fill-rule="evenodd"/>` : `<path d="${pathOf([...A, ...B.reverse()])}" fill="${INK}"/>`;
  }
  return out;
}
// thin tapered crease line through points
function crease(pts, w) {
  const p = cr(pts, false, 6), n = p.length, A = [], B = [];
  for (let i = 0; i < n; i++) {
    const t = V.norm(V.sub(p[Math.min(n - 1, i + 1)], p[Math.max(0, i - 1)])), nn = [t[1], -t[0]];
    const ww = w * (0.2 + 0.8 * Math.sin(Math.PI * i / (n - 1)));
    A.push(V.add(p[i], V.mul(nn, ww / 2))); B.push(V.sub(p[i], V.mul(nn, ww / 2)));
  }
  return `<path d="${pathOf([...A, ...B.reverse()])}" fill="${INK}"/>`;
}
// hard graphic cel shadow: the shape in SHADE minus a copy shifted toward the light (offset crescent)
function cel(shape, d, light, extraClip = '') {
  const id = `hs${UID++}`, P = pathOf(shape.pts);
  const lx = light[0] * d, ly = light[1] * d;  // light points FROM up-left -> shift the skin copy toward the light
  return `<clipPath id="${id}"><path d="${P}"/></clipPath><g clip-path="url(#${id})"><path d="${P}" fill="${SHADE}"/><path d="${P}" fill="${SKIN}" transform="translate(${f(lx)} ${f(ly)})"/>${extraClip}</g>`;
}
// a part = fill + cel shadow + ink
function part(shape, { d = 3, w0, light, skip = null, fill = SKIN, noShadow = false, extra = '' }) {
  let s = `<path d="${pathOf(shape.pts)}" fill="${fill}"/>`;
  if (!noShadow) s += cel(shape, d, light);
  s += extra;
  s += ink(shape, w0, light, { skip });
  return s;
}
// cast shadow of a front part onto what's behind it (clipped to the behind shape)
function cast(front, behind, d, light) {
  const id = `hc${UID++}`;
  return `<clipPath id="${id}"><path d="${pathOf(behind.pts)}"/></clipPath><path d="${pathOf(front.pts)}" fill="${SHADE}" clip-path="url(#${id})" transform="translate(${f(-light[0] * d)} ${f(-light[1] * d)})"/>`;
}

// ---------------------------------------------------------------- pose data (local units: wrist centre (0,0), fingers up = -y,
// wrist -> middle fingertip ≈ 100). Fingers: chain [MCP, PIP, DIP, tip] + half-widths. Thumb: [CMC, MCP, IP, tip].
const FW = { index: [6.0, 5.3, 4.8, 4.4], middle: [6.2, 5.5, 5.0, 4.5], ring: [5.8, 5.2, 4.7, 4.3], pinky: [5.1, 4.5, 4.1, 3.8] };
const TW = [8.4, 7.0, 6.0, 5.2];
const ORDER3 = ['pinky', 'ring', 'middle', 'index'];   // back -> front for the side views (thumb side faces camera)

// 1 / 2 / 3 share one structure (palm control points, four chains, thumb chain) so they interpolate.
const P1 = { // fist, 3/4 from the thumb side: knuckle row on top, the four middle phalanges as separate bars on the front, thumb across them
  palm: [[-13, 2], [13, 2], [22, -10], [27, -22], [26, -34], [16, -42], [4, -45], [-8, -44], [-15, -32], [-15, -12]],
  f: {
    index: [[-4, -40], [5, -47], [6, -26], [0, -22]],
    middle: [[3, -42], [13, -48], [14, -27], [8, -23]],
    ring: [[10, -41], [21, -46], [22, -28], [16, -24]],
    pinky: [[16, -38], [27, -42], [28, -29], [22, -25]],
  },
  w: { index: [6.2, 6.0, 5.7, 5.0], middle: [6.2, 6.0, 5.6, 4.9], ring: [5.8, 5.6, 5.3, 4.6], pinky: [5.2, 5.0, 4.7, 4.2] },
  thumb: [[-8, -10], [-5, -21], [5, -27], [16, -29]],
};
const P1b = { // releasing: the grip has just let go — fingers swing forward, tips still curled (a designed in-between)
  palm: [[-13, 2], [12.5, 2], [20, -12], [23, -25], [20, -36], [11, -43], [0, -45], [-10, -42], [-15, -29], [-15, -11]],
  f: {
    index: [[-4, -40], [4, -52], [12, -44], [13, -36]],
    middle: [[2, -42], [11, -54], [19, -45], [20, -37]],
    ring: [[8, -41], [17, -51], [24, -43], [24, -36]],
    pinky: [[13, -38], [22, -46], [27, -39], [27, -33]],
  },
  w: { index: [6.1, 5.6, 5.1, 4.6], middle: [6.2, 5.7, 5.2, 4.7], ring: [5.8, 5.4, 4.9, 4.4], pinky: [5.1, 4.8, 4.3, 4.0] },
  thumb: [[-8, -10], [-8, -24], [-2, -33], [6, -39]],
};
const P2 = { // loosening: fingers half open with a gentle curl, thumb lifted clear and upright
  palm: [[-13, 2], [12, 2], [17, -14], [18, -28], [14, -39], [6, -44], [-4, -45], [-12, -40], [-16, -26], [-15, -10]],
  f: {
    index: [[-5, -40], [-1, -60], [6, -70], [12, -76]],
    middle: [[1, -42], [6, -63], [14, -72], [20, -77]],
    ring: [[6, -41], [11, -59], [18, -66], [23, -70]],
    pinky: [[10, -38], [15, -52], [21, -57], [25, -60]],
  },
  w: FW,
  thumb: [[-8, -10], [-10, -26], [-8, -38], [-4, -48]],
};
const P3 = { // open relaxed hand, side
  palm: [[-13, 2], [12, 2], [16, -16], [17, -30], [13, -40], [5, -45], [-5, -45], [-12, -40], [-16, -26], [-15, -10]],
  f: {
    index: [[-5, -40], [-6, -64], [-4, -77], [-1, -87]],
    middle: [[1, -42], [2, -68], [5, -82], [9, -92]],
    ring: [[6, -41], [9, -64], [13, -76], [17, -84]],
    pinky: [[10, -38], [14, -55], [17, -63], [20, -70]],
  },
  w: FW,
  thumb: [[-8, -10], [-13, -26], [-15, -39], [-14, -50]],
};
const lerpPose = (A, B, k) => ({
  palm: A.palm.map((p, i) => [lerp(p[0], B.palm[i][0], k), lerp(p[1], B.palm[i][1], k)]),
  f: Object.fromEntries(Object.keys(A.f).map((n) => [n, A.f[n].map((p, i) => [lerp(p[0], B.f[n][i][0], k), lerp(p[1], B.f[n][i][1], k)])])),
  w: Object.fromEntries(Object.keys(A.w).map((n) => [n, A.w[n].map((v, i) => lerp(v, B.w[n][i], k))])),
  thumb: A.thumb.map((p, i) => [lerp(p[0], B.thumb[i][0], k), lerp(p[1], B.thumb[i][1], k)]),
});

function drawSide(P, o) {
  // palm block behind; fingers back->front over it (their bases inside the palm carry no ink); thumb in front
  const palm = blob(P.palm), L = o.light, W = o.w0;
  let s = part(palm, { d: 4.5, w0: W, light: L });
  const fingers = {};
  for (const n of ORDER3) {
    const sh = chain(P.f[n], P.w[n]);
    fingers[n] = sh;
    s += part(sh, { d: 2.4, w0: W * 0.9, light: L, skip: (i, S) => S.s[i] < 0.16 });
  }
  const th = chain(P.thumb, TW, { base: 'flat' });
  s += cast(th, palm, 2.2, L);
  for (const n of ORDER3) s += cast(th, fingers[n], 2.2, L);
  s += part(th, { d: 2.6, w0: W, light: L, skip: (i, S) => S.s[i] < 0.22 });
  // knuckle creases on bent fingers (one per finger at the PIP, graphic)
  for (const n of []) {
    const c = P.f[n], d1 = V.norm(V.sub(c[1], c[0])), d2 = V.norm(V.sub(c[2], c[1]));
    const bend = Math.acos(Math.max(-1, Math.min(1, d1[0] * d2[0] + d1[1] * d2[1])));
    if (bend > 0.5) {
      const nn = V.perp(V.norm(V.add(d1, d2))), r = P.w[n][1] * 0.55;
      s += crease([V.add(c[1], V.mul(nn, -r)), V.add(c[1], V.mul(V.norm(V.sub(d1, d2)), r * 0.35)), V.add(c[1], V.mul(nn, r))], W * 0.42);
    }
  }
  return s;
}

const POSES = {
  press(o) { // palm down, flat: back of the right hand, thumb to the left
    const L = o.light, W = o.w0;
    const palm = blob([[-16, 2], [15, 2], [20, -18], [21, -36], [14, -44], [4, -47], [-5, -48], [-13, -46], [-19, -38], [-20, -22], [-18, -8]]);
    const F = {
      index: [[-12, -42], [-15, -64], [-16.5, -77], [-17.5, -87]], middle: [[-3, -44], [-4, -69], [-4.5, -83], [-5, -94]],
      ring: [[6, -43], [8.5, -66], [10, -78], [11, -88]], pinky: [[14, -39], [18, -56], [20, -66], [21.5, -74]],
    };
    const th = chain([[-11, -8], [-23, -22], [-31, -33], [-36, -42]], [7.8, 6.0, 5.1, 4.5]);
    let s = part(th, { d: 2.6, w0: W, light: L, skip: (i, S) => S.s[i] < 0.25 });
    for (const n of ['pinky', 'ring', 'middle', 'index']) {
      const sh = chain(F[n], FW[n]);
      s += part(sh, { d: 2.2, w0: W * 0.9, light: L, skip: (i, S) => S.s[i] < 0.1 });
      // knuckle wrinkles (PIP) as two short creases
      const c = F[n], dd = V.norm(V.sub(c[2], c[0])), nn = V.perp(dd), r = FW[n][1] * 0.5;
      s += crease([V.add(c[1], V.mul(nn, -r)), V.add(c[1], V.mul(dd, -1.2)), V.add(c[1], V.mul(nn, r))], W * 0.34);
    }
    // palm over the finger bases and the thumb base; no ink on the knuckle edge or where the thumb joins
    const pk = palm.pts;
    s += part(palm, { d: 4.5, w0: W, light: L, skip: (i) => pk[i][1] < -40 || (pk[i][0] < -16 && pk[i][1] < -6 && pk[i][1] > -34) });
    // knuckle bumps (small arcs over each MCP)
    for (const n of ['index', 'middle', 'ring']) { const c = F[n][0]; s += crease([[c[0] - 3.2, c[1] + 1.2], [c[0], c[1] - 0.6], [c[0] + 3.2, c[1] + 1.2]], W * 0.32); }
    return s;
  },
  brush(o) { // holding a writing brush (执笔): shaft vertical between thumb (near) and index/middle (hooked over it)
    const L = o.light, W = o.w0, k = o.k;
    const palm = blob([[-3, 2], [17, -2], [23, -20], [19, -38], [7, -48], [-5, -46], [-11, -34], [-10, -16]]);
    const F = {
      pinky: [[15, -35], [10, -41], [5, -38], [4, -33]], ring: [[11, -40], [4, -49], [-3, -45], [-5, -40]],
      middle: [[6, -44], [-3, -56], [-13, -53], [-16, -47]], index: [[0, -45], [-8, -63], [-18, -62], [-21, -55]],
    };
    const shaft = (layerTop) => {
      const x0 = -11.5, top = -96, bot = 22;
      let s = `<rect x="${f(x0 - 2.4)}" y="${f(top)}" width="4.8" height="${f(bot - top)}" rx="2.2" fill="#a07a48"/>` +
        `<rect x="${f(x0 + 0.4)}" y="${f(top)}" width="1.6" height="${f(bot - top)}" fill="#7a5a32" opacity="0.7"/>`;
      for (const yy of [-96, -70, -18]) s += `<rect x="${f(x0 - 2.4)}" y="${f(yy)}" width="4.8" height="1.4" fill="#6b4c28"/>`;
      // hair tip
      s += `<path d="M${f(x0 - 3)},${f(bot)} C${f(x0 - 3.6)},${f(bot + 8)} ${f(x0 - 1)},${f(bot + 15)} ${f(x0)},${f(bot + 19)} C${f(x0 + 1)},${f(bot + 15)} ${f(x0 + 3.6)},${f(bot + 8)} ${f(x0 + 3)},${f(bot)}Z" fill="#1d1712"/>`;
      s += `<rect x="${f(x0 - 2.4)}" y="${f(top)}" width="4.8" height="${f(bot - top)}" rx="2.2" fill="none" stroke="${INK}" stroke-width="${f(W * 0.6)}"/>`;
      return s;
    };
    let back = part(palm, { d: 4.5, w0: W, light: L });
    for (const n of ['pinky', 'ring']) back += part(chain(F[n], FW[n]), { d: 2.2, w0: W * 0.9, light: L, skip: (i, S) => S.s[i] < 0.2 });
    let front = '';
    for (const n of ['middle', 'index']) front += part(chain(F[n], FW[n]), { d: 2.2, w0: W * 0.9, light: L, skip: (i, S) => S.s[i] < 0.2 });
    const th = chain([[6, -6], [-2, -19], [-8, -28], [-10, -36]], TW);  // thumb pad presses the shaft from the near side, below the index
    front += part(th, { d: 2.6, w0: W, light: L, skip: (i, S) => S.s[i] < 0.24 });
    return o.layer === 'back' ? back + shaft() : o.layer === 'front' ? front : back + shaft() + front;
  },
  grip(o) { // gripping a paper edge (paper edge at y ≈ -50): fingers behind the paper, thumb in front on the paper
    const L = o.light, W = o.w0;
    const palm = blob([[-15, 2], [14, 2], [18, -18], [17, -38], [10, -50], [-6, -52], [-15, -44], [-18, -24]]);
    const F = {
      index: [[-8, -46], [-9, -64], [-9, -75], [-9, -83]], middle: [[-1, -48], [0, -67], [0.5, -79], [1, -87]],
      ring: [[6, -46], [8, -63], [9, -73], [10, -80]], pinky: [[12, -42], [15, -56], [16, -64], [17, -70]],
    };
    let back = '';
    for (const n of ['pinky', 'ring', 'middle', 'index']) back += part(chain(F[n], FW[n]), { d: 2.2, w0: W * 0.9, light: L, skip: (i, S) => S.s[i] < 0.12 });
    const pk = palm.pts;
    back += part(palm, { d: 4.5, w0: W, light: L, skip: (i) => pk[i][1] < -46 });
    const th = chain([[14, -16], [18, -34], [14, -50], [8, -60]], [8, 6.4, 5.4, 4.6]);
    const front = part(th, { d: 2.6, w0: W, light: L, skip: (i, S) => S.s[i] < 0.22 }) +
      `<path d="${pathOf(cr([[6, -61.5], [8.4, -63.6], [11, -62]], false, 4), false)}" stroke="${INK}" stroke-width="${f(W * 0.35)}" fill="none" stroke-linecap="round"/>`;
    return o.layer === 'back' ? back : o.layer === 'front' ? front : back + front;
  },
  shoulder(o) { // resting on a shoulder: back of the hand, fingers going over and down (tips behind the shoulder line)
    const L = o.light, W = o.w0;
    const palm = blob([[-16, 2], [15, 2], [20, -18], [20, -34], [13, -42], [3, -45], [-6, -45], [-14, -43], [-19, -34], [-20, -18]]);
    const F = { // foreshortened: proximal visible, the rest curls away (and down past the shoulder line)
      index: [[-12, -40], [-14, -56], [-14, -63], [-13.5, -67]], middle: [[-3, -42], [-4, -60], [-4, -67], [-3.5, -71]],
      ring: [[6, -41], [8, -57], [8.6, -64], [9, -68]], pinky: [[13, -37], [16, -51], [17, -57], [17.5, -61]],
    };
    let back = '', front = '';
    for (const n of ['pinky', 'ring', 'middle', 'index']) {
      const c = F[n];
      const sh = chain(c, [FW[n][0], FW[n][1], FW[n][2] * 0.95, FW[n][3] * 0.95]);
      back += part(sh, { d: 2.2, w0: W * 0.9, light: L, skip: (i, S) => S.s[i] < 0.12 });
      const dd = V.norm(V.sub(c[2], c[0])), nn = V.perp(dd), r = FW[n][1] * 0.5;
      back += crease([V.add(c[1], V.mul(nn, -r)), V.add(c[1], V.mul(dd, -1)), V.add(c[1], V.mul(nn, r))], W * 0.32);
    }
    const th = chain([[-12, -8], [-22, -16], [-29, -21], [-34, -24]], [7.4, 5.8, 5.0, 4.4]);
    const pk = palm.pts;
    front += part(th, { d: 2.6, w0: W, light: L, skip: (i, S) => S.s[i] < 0.25 });
    front += part(palm, { d: 4.5, w0: W, light: L, skip: (i) => pk[i][1] < -39 || (pk[i][0] < -17 && pk[i][1] < -8 && pk[i][1] > -30) });
    for (const n of ['index', 'middle', 'ring']) { const c = F[n][0]; front += crease([[c[0] - 3.2, c[1] + 1.2], [c[0], c[1] - 0.6], [c[0] + 3.2, c[1] + 1.2]], W * 0.32); }
    return o.layer === 'back' ? back : o.layer === 'front' ? front : back + front;
  },
  stone(o) { // pushing flat against a stone face on the right (x ≈ 15): heel of the hand pressed, fingers up the stone
    const L = o.light, W = o.w0;
    const palm = blob([[-6, 4], [8, 0], [14, -6], [15, -24], [14, -40], [8, -47], [-2, -48], [-9, -40], [-10, -20], [-9, -4]]);
    const F = {
      pinky: [[9, -40], [11, -58], [12, -67], [12.5, -74]], ring: [[6, -43], [8.5, -65], [9.5, -77], [10, -86]],
      middle: [[3, -45], [5, -70], [6, -83], [6.5, -94]], index: [[-2, -43], [0, -66], [1, -79], [1.5, -88]],
    };
    let s = '';
    for (const n of ['pinky', 'ring', 'middle']) s += part(chain(F[n], FW[n]), { d: 2.2, w0: W * 0.9, light: L, skip: (i, S) => S.s[i] < 0.14 });
    const pk = palm.pts;
    s += part(palm, { d: 4.5, w0: W, light: L, skip: (i) => pk[i][1] < -42 && pk[i][0] > -1 });
    s += part(chain(F.index, FW.index), { d: 2.2, w0: W * 0.9, light: L, skip: (i, S) => S.s[i] < 0.14 });
    const th = chain([[-4, -8], [-11, -22], [-11, -34], [-8, -43]], TW);
    s += cast(th, palm, 2.2, L) + part(th, { d: 2.6, w0: W, light: L, skip: (i, S) => S.s[i] < 0.24 });
    // the heel pressing: a short pressure crease at the palm's base
    s += crease([[4, -6], [9, -9], [12, -14]], W * 0.4);
    return s;
  },
};

// sleeve with cuff (local: from the wrist downward, +y), dir lets a pose bend the wrist (stone: forearm from the lower left)
function sleeveSVG(o, angle = 0) {
  const W = o.w0, L = o.light, col = o.sleeveCol || '#3B4356';
  const sh = blob([[-15.5, -2], [15.5, -2], [18, 30], [20, 75], [-20, 75], [-18, 30]]);
  const cuff = blob([[-16.5, -3.5], [16.5, -3.5], [17.2, 3], [-17.2, 3]]);
  const id = `sl${UID++}`;
  let s = `<g transform="rotate(${f(angle)})"><path d="${pathOf(sh.pts)}" fill="${col}"/>` +
    `<clipPath id="${id}"><path d="${pathOf(sh.pts)}"/></clipPath><path d="${pathOf(sh.pts)}" fill="#000" opacity="0.18" clip-path="url(#${id})" transform="translate(${f(-L[0] * 7)} ${f(-L[1] * 7)}) scale(0.94 1)"/>` +
    ink(sh, W, L, { skip: (i) => sh.pts[i][1] > 70 }) + `<path d="${pathOf(cuff.pts)}" fill="${col}"/><path d="${pathOf(cuff.pts)}" fill="#000" opacity="0.28"/>` + ink(cuff, W * 0.8, L) + '</g>';
  return s;
}

export const POSE_NAMES = ['fist', 'loose', 'open', 'press', 'brush', 'grip', 'shoulder', 'stone'];
export function hand(pose, o = {}) {
  const size = o.size || 350, k = size / 100, rot = o.rot || 0, flip = !!o.flip;
  // light in local coordinates (undo rotation and mirror) so the cel shadow stays screen-consistent
  const Ls = V.norm(o.light || [-0.7, -0.7]);
  const r = -rot * Math.PI / 180;
  let Ll = [Ls[0] * Math.cos(r) - Ls[1] * Math.sin(r), Ls[0] * Math.sin(r) + Ls[1] * Math.cos(r)];
  if (flip) Ll = [-Ll[0], Ll[1]];
  const ctx = { light: Ll, w0: (o.ink || Math.max(2.6, size * 0.0105)) / k, k, layer: o.layer || 'all', sleeveCol: o.sleeveCol };
  let body = '';
  if (pose === 'fist>open' || pose === 'fist' || pose === 'loose' || pose === 'open') {
    // t: 0 fist, 0.35 release (designed in-between), 1 loose, 2 open; slight overshoot past 2 extrapolates
    const t = pose === 'fist' ? 0 : pose === 'loose' ? 1 : pose === 'open' ? 2 : Math.max(0, Math.min(2.15, o.t || 0));
    const P = t <= 0.35 ? lerpPose(P1, P1b, t / 0.35) : t <= 1 ? lerpPose(P1b, P2, (t - 0.35) / 0.65) : lerpPose(P2, P3, t - 1);
    body = drawSide(P, ctx);
  } else body = POSES[pose](ctx);
  const showSleeve = o.sleeve !== false && ctx.layer !== 'front';
  const sl = showSleeve ? sleeveSVG(ctx, pose === 'stone' ? 38 : pose === 'brush' ? -55 : 0) : '';
  return `<g data-hand="${pose}" transform="translate(${f(o.x || 0)} ${f(o.y || 0)}) rotate(${f(rot)}) scale(${f(flip ? -k : k)} ${f(k)})">${body}${sl}</g>`;  // cuff over the wrist
}
