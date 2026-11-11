// shz02 cut-out figures: a side-view skeleton (absolute segment angles, the same quantities film/mocap/mocap2d.py writes)
// dressed with flat-colour shapes and an ink outline, a turned (3/4) head from faces.mjs, simple mitten hands.
// pose (degrees): spine, neck (from straight up, + = forward); thighR/L, shinR/L, upperR/L, foreR/L (from straight down,
// + = forward); footR/L (sole pitch, + = toes down). R = the near side (the figure faces +x; flip mirrors it).
import { capsule, circle, frame, P, smooth, poly, f2, DEG, lerp, rng } from './ink.mjs';
import { likuiBust, LKEX, LK, motherBust, MO, wusongBust, WS } from './faces.mjs';
export const LINE = '#1d1410';
const up = (a) => [Math.sin(a * DEG), -Math.cos(a * DEG)], dn = (a) => [Math.sin(a * DEG), Math.cos(a * DEG)];
const add = (p, v, l) => [p[0] + v[0] * l, p[1] + v[1] * l];
export function shade(hex, k) { const n = parseInt(hex.slice(1), 16), c = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join(''); }

/** a group of shapes that share one outline: all outlines first, then all fills (so joints between them show no line) */
class Group {
  constructor(ow, dim = 1) { this.ow = ow; this.dim = dim; this.s = []; }
  add(d, fill) { this.s.push([d, this.dim < 1 ? shade(fill, this.dim) : fill]); return this; }
  /** limb with a shadow band along one side (side = +1 / -1 picks which) */
  limb(a, b, ra, rb, fill, side = -1) {
    this.add(capsule(a, b, ra, rb), fill);
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, n = [(-dy / l) * side, (dx / l) * side];
    this.sh = this.sh || []; this.sh.push([capsule([a[0] + n[0] * ra * 0.34, a[1] + n[1] * ra * 0.34], [b[0] + n[0] * rb * 0.34, b[1] + n[1] * rb * 0.34], ra * 0.64, rb * 0.64), shade(this.dim < 1 ? shade(fill, this.dim) : fill, 0.8)]);
    return this;
  }
  svg() { return this.s.map(([d]) => `<path d="${d}" fill="${LINE}" stroke="${LINE}" stroke-width="${f2(this.ow * 2)}" stroke-linejoin="round"/>`).join('') + this.s.map(([d, c]) => `<path d="${d}" fill="${c}"/>`).join('') + (this.sh || []).map(([d, c]) => `<path d="${d}" fill="${c}"/>`).join(''); }
}
const stroke = (d, w, col = LINE, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f2(w)}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;

export const REST = { spine: 4, neck: 4, thighR: 4, shinR: -2, footR: 0, thighL: -4, shinL: -8, footL: 0, upperR: 6, foreR: 16, upperL: -8, foreL: 6 };

/**
 * figure(S, pose, o) -> { svg, J }   S = character spec (below); o = { x, y (ground), flip, expr, turn, headTilt,
 * near/far/back/front: extra SVG builders (ctx) -> string, hold: prop drawn in the near hand, noGround, hipY }
 */
export function figure(S, pose, o = {}) {
  const p = { ...REST, ...pose }, H = S.H, ow = S.ow ?? Math.max(1.6, H * 0.045);
  const hip = [0, 0];
  const chest = add(hip, up(p.spine), S.spine * H), headP = add(chest, up(p.neck), S.neck * H);
  const J = { hip, chest, head: headP };
  for (const [s, off] of [['R', 0.1], ['L', -0.1]]) {
    const hj = add(hip, up(p.spine + 90), off * H * (S.hipOff ?? 1));
    const knee = add(hj, dn(p['thigh' + s]), S.thigh * H), ankle = add(knee, dn(p['shin' + s]), S.shin * H);
    const fa = p['foot' + s] * DEG, toe = [ankle[0] + Math.cos(fa) * S.foot * H, ankle[1] + S.ankleH * H + Math.sin(fa) * S.foot * H], heel = [ankle[0] - Math.cos(fa) * 0.3 * H, ankle[1] + S.ankleH * H - Math.sin(fa) * 0.3 * H];
    const sh = add(add(chest, up(p.spine), -0.3 * H), up(p.spine + 90), (off * 1.6 * (S.shOff ?? 1) - 0.12) * H);
    const elbow = add(sh, dn(p['upper' + s]), S.upper * H), wrist = add(elbow, dn(p['fore' + s]), S.fore * H), hand = add(wrist, dn(p['fore' + s]), 0.22 * H);
    Object.assign(J, { ['hip' + s]: hj, ['knee' + s]: knee, ['ankle' + s]: ankle, ['toe' + s]: toe, ['heel' + s]: heel, ['sh' + s]: sh, ['elbow' + s]: elbow, ['wrist' + s]: wrist, ['hand' + s]: hand });
  }
  // ground: the lowest sole point sits on y = 0 unless the caller places the hips
  const low = Math.max(J.toeR[1], J.heelR[1], J.toeL[1], J.heelL[1]);
  const gy = o.noGround ? (o.hipY ?? 0) : -low;
  const ctx = { S, p, H, J, ow, o };
  const leg = (s, dim) => {
    const g = new Group(ow, dim), C = S.col;
    if (!S.skirt) g.limb(J['hip' + s], J['knee' + s], S.rThigh[0] * H, S.rThigh[1] * H, C.pants, 1).limb(J['knee' + s], J['ankle' + s], S.rShin[0] * H, S.rShin[1] * H, C.pants, 1);
    let out = g.svg();
    if (S.wrap) { const a = [lerp(J['knee' + s][0], J['ankle' + s][0], 0.45), lerp(J['knee' + s][1], J['ankle' + s][1], 0.45)]; out += new Group(ow, dim).add(capsule(a, J['ankle' + s], (S.rShin[0] * 0.55 + S.rShin[1] * 0.45) * H * 0.92, S.rShin[1] * H * 1.02), C.wrap).svg(); }
    // shoe: sole along the foot pitch, a rounded toe
    const fa = p['foot' + s], F = frame([J['ankle' + s][0], J['ankle' + s][1]], fa), k = H;
    const shoe = smooth([F(-0.34 * k, S.ankleH * k), F(-0.36 * k, 0.02 * k), F(-0.2 * k, -0.16 * k), F(0.16 * k, -0.14 * k), F(0.5 * k, 0.02 * k), F(S.foot * k, S.ankleH * k * 0.55), F(S.foot * k * 1.02, S.ankleH * k), F(0.2 * k, S.ankleH * k * 1.04)], true, 0.6);
    out += new Group(ow, dim).add(shoe, C.shoe).svg();
    return out;
  };
  const arm = (s, dim) => {
    const g = new Group(ow, dim), C = S.col;
    g.limb(J['sh' + s], J['elbow' + s], S.rUpper[0] * H, S.rUpper[1] * H, C.sleeve || C.skin, 1).limb(J['elbow' + s], J['wrist' + s], S.rFore[0] * H, S.rFore[1] * H, C.sleeveLow || C.sleeve || C.skin, 1);
    let out = g.svg();
    if (S.cuff) { const a = [lerp(J['elbow' + s][0], J['wrist' + s][0], 0.6), lerp(J['elbow' + s][1], J['wrist' + s][1], 0.6)]; out += new Group(ow, dim).add(capsule(a, J['wrist' + s], S.rFore[1] * H * 1.12, S.rFore[1] * H * 1.08), C.cuff).svg(); }
    // mitten hand: a rounded fist with a thumb bump on the forward side
    const F = frame(J['wrist' + s], 90 - p['fore' + s]);   // x along the forearm (downward at rest)
    const r = S.rHand * H;
    out += new Group(ow, dim).add(smooth([F(-0.1 * r, -r * 0.82), F(0.9 * r, -r * 0.95), F(1.75 * r, -r * 0.6), F(1.95 * r, 0.1 * r), F(1.6 * r, 0.85 * r), F(0.7 * r, 0.95 * r), F(-0.1 * r, 0.8 * r)], true, 0.7), C.skin).svg();
    out += stroke(`M${P(F(0.75 * r, -r * 0.9))} Q${P(F(1.2 * r, -r * 0.2))} ${P(F(0.95 * r, 0.25 * r))}`, ow * 0.8, LINE, 0.75);
    return out;
  };
  // torso layers in the spine frame: u = up along the spine, v = forward (H units)
  const T = (u, v) => { const a = add(hip, up(p.spine), u * H); return add(a, up(p.spine + 90), v * H); };
  ctx.T = T;
  let torso = '';
  for (const L of S.torso) { torso += new Group(ow).add(smooth(L.pts.map(([u, v]) => T(u, v)), true, L.k ?? 0.55), L.fill).svg(); if (L.lines) for (const ln of L.lines) torso += stroke('M' + ln.pts.map(([u, v]) => P(T(u, v))).join('L'), (ln.w ?? 1) * ow, ln.col || LINE, ln.op ?? 1); }
  // head: the bust drawing scaled so that its head height (366 units) = H, neck pivot (300, 560) on the head joint
  const k = (H / 366) * (S.headK ?? 1.4), tilt = (p.neck + (o.headTilt || 0)) * 0.6;
  const headSvg = `<g transform="translate(${f2(headP[0])} ${f2(headP[1])}) rotate(${f2(tilt)}) scale(${f2(k * 1000) / 1000}) translate(-300 ${-(S.headPivot ?? 548)})">${S.head(o.expr, { headOnly: true, turn: o.turn ?? 0.75 })}</g>`;
  const neck = new Group(ow).add(capsule(add(chest, up(p.spine), 0.05 * H), add(headP, up(p.neck), 0.1 * H), S.rNeck * H, S.rNeck * H * 0.92), S.col.skin).svg();
  let s = '';
  s += (o.farBehind ? o.farBehind(ctx) : '') + arm('L', 0.72) + (S.skirt ? '' : leg('L', 0.72)) + (o.back ? o.back(ctx) : '') + (S.back ? S.back(ctx) : '');
  const skirt = S.skirt ? S.skirt(ctx) : '';
  s += neck + torso + (S.skirt ? leg('L', 0.8) : '') + leg('R', 1) + skirt + (S.front ? S.front(ctx) : '') + (o.front ? o.front(ctx) : '') + headSvg + (o.hold ? o.hold(ctx) : '') + (o.noNearArm ? '' : arm('R', 1)) + (o.near ? o.near(ctx) : '');
  const sx = o.flip ? -1 : 1, X = o.x ?? 0, Y = (o.y ?? 0) + gy;
  const Jw = {}; for (const key of Object.keys(J)) Jw[key] = [X + sx * J[key][0], Y + J[key][1]];
  return { svg: `<g transform="translate(${f2(X)} ${f2(Y)}) scale(${sx} 1)">${s}</g>`, J: Jw, local: J, gy };
}

// ================================================================ props
const blade = (F, k, col = '#c9c4ba') => smooth([F(0, -0.1 * k), F(0.9 * k, -0.34 * k), F(1.9 * k, -0.3 * k), F(2.35 * k, 0.02 * k), F(1.6 * k, 0.26 * k), F(0, 0.12 * k)], true, 0.5);
/** 朴刀: a long pole with a broad blade. base = grip point, ang = direction of the blade end (deg, 0 = +x, -90 = up) */
export function podao(grip, ang, H, o = {}) {
  const F = frame(grip, ang), L = (o.len ?? 6.4) * H, g = o.grip ?? 0.42, ow = Math.max(1.6, H * 0.045);
  let s = new Group(ow).add(capsule(F(-L * g, 0), F(L * (1 - g) - 2.2 * H, 0), 0.085 * H, 0.085 * H), '#5a3d28').svg();
  const B = frame(F(L * (1 - g) - 2.3 * H, 0), ang);
  s += new Group(ow).add(blade(B, H), '#cfcac0').svg() + stroke(`M${P(B(0.2 * H, 0.02 * H))} L${P(B(2.0 * H, -0.12 * H))}`, ow * 0.7, '#8d8a84', 0.8);
  s += new Group(ow).add(capsule(B(-0.12 * H, 0), B(0.1 * H, 0), 0.17 * H, 0.17 * H), '#8a6a3a').svg();
  return s;
}
/** 板斧: short handle, broad crescent blade. base = lower end of the handle, ang = direction of the head */
export function axe(base, ang, H) {
  const F = frame(base, ang), ow = Math.max(1.6, H * 0.045), L = 2.2 * H;
  let s = new Group(ow).add(capsule(F(0, 0), F(L, 0), 0.085 * H, 0.085 * H), '#5a3d28').svg();
  // the head: a narrow neck on the handle fanning out to a long curved edge
  const hd = smooth([F(L - 0.52 * H, 0.1 * H), F(L - 0.56 * H, -0.2 * H), F(L - 0.78 * H, -0.62 * H), F(L - 1.0 * H, -1.02 * H), F(L - 0.62 * H, -1.2 * H), F(L - 0.2 * H, -1.26 * H), F(L + 0.2 * H, -1.2 * H), F(L + 0.5 * H, -1.02 * H), F(L + 0.24 * H, -0.62 * H), F(L + 0.04 * H, -0.2 * H), F(L, 0.1 * H)], true, 0.35);
  s += new Group(ow).add(hd, '#a9a59c').svg();
  s += stroke(`M${P(F(L - 0.92 * H, -1.0 * H))} Q${P(F(L - 0.22 * H, -1.34 * H))} ${P(F(L + 0.42 * H, -1.0 * H))}`, ow * 2.2, '#eeeae0', 1) + stroke(`M${P(F(L - 1.0 * H, -1.02 * H))} Q${P(F(L - 0.22 * H, -1.42 * H))} ${P(F(L + 0.5 * H, -1.02 * H))}`, ow, LINE);
  s += new Group(ow).add(capsule(F(L - 0.56 * H, 0), F(L + 0.06 * H, 0), 0.14 * H, 0.14 * H), '#6b5a3a').svg();
  return s;
}
/** 腰刀 in its scabbard, hung at the hip */
export function saber(at, ang, H) {
  const F = frame(at, ang), ow = Math.max(1.6, H * 0.045);
  return new Group(ow).add(smooth([F(-0.7 * H, -0.12 * H), F(0.6 * H, -0.16 * H), F(1.9 * H, -0.02 * H), F(2.5 * H, 0.3 * H), F(1.8 * H, 0.22 * H), F(0.6 * H, 0.1 * H), F(-0.7 * H, 0.1 * H)], true, 0.5), '#3a2a22').svg() +
    new Group(ow).add(capsule(F(-1.25 * H, 0), F(-0.7 * H, 0), 0.1 * H, 0.1 * H), '#8a6a3a').svg() + new Group(ow).add(capsule(F(-0.72 * H, -0.22 * H), F(-0.72 * H, 0.22 * H), 0.06 * H, 0.06 * H), '#b08a4a').svg();
}

// ================================================================ 李逵
const tail = (ctx, u, v, len, w, col, sway = 0) => { // a hanging cloth tail from the torso point (u, v)
  const { T, H, ow } = ctx, a = T(u, v), sp = ctx.p.spine * DEG;
  const d = [Math.sin(sway * DEG) * 1, Math.cos(sway * DEG)], n = [d[1], -d[0]];
  const pts = [[a[0] - n[0] * w * H * 0.5, a[1] - n[1] * w * H * 0.5], [a[0] + n[0] * w * H * 0.5, a[1] + n[1] * w * H * 0.5], [a[0] + d[0] * len * H + n[0] * w * H * 0.7, a[1] + d[1] * len * H + n[1] * w * H * 0.7], [a[0] + d[0] * len * H * 1.08, a[1] + d[1] * len * H * 1.08], [a[0] + d[0] * len * H - n[0] * w * H * 0.6, a[1] + d[1] * len * H - n[1] * w * H * 0.6]];
  void sp; return new Group(ow).add(poly(pts), col).svg();
};
export const LIKUI = {
  H: 100, headK: 1.5, headPivot: 520, spine: 2.35, neck: 0.3, thigh: 1.75, shin: 1.7, foot: 0.95, ankleH: 0.3, upper: 1.5, fore: 1.35, hipOff: 1.3, shOff: 1.2,
  rThigh: [0.6, 0.44], rShin: [0.42, 0.27], rUpper: [0.4, 0.33], rFore: [0.33, 0.25], rHand: 0.27, rNeck: 0.5, wrap: true, cuff: true,
  col: { skin: LK.skin, pants: '#4b4038', wrap: '#cdbf9f', shoe: '#201a18', cuff: '#3a2a22', jacket: LK.vest, trim: LK.trim, sash: LK.sash },
  torso: [
    // the body: barrel chest, a belly, heavy back and shoulders
    { fill: LK.skin, pts: [[-0.45, 0.5], [0.2, 0.92], [0.9, 1.0], [1.6, 0.92], [2.15, 0.7], [2.5, 0.3], [2.62, -0.2], [2.4, -0.72], [1.7, -0.84], [0.8, -0.74], [0, -0.74], [-0.5, -0.55]],
      lines: [{ pts: [[1.72, 0.9], [1.6, 0.45]], w: 0.7, op: 0.55 }, { pts: [[1.3, 0.6], [1.25, 0.75], [1.05, 0.7]], w: 0.6, op: 0.5 }] },
    // the open jacket: covers the back and the side, leaves the chest and belly bare
    { fill: LK.vest, pts: [[-0.75, 0.2], [0.3, 0.42], [1.2, 0.36], [2.0, 0.2], [2.52, 0.12], [2.64, -0.22], [2.4, -0.74], [1.7, -0.86], [0.8, -0.76], [0, -0.78], [-0.8, -0.74]], k: 0.5,
      lines: [{ pts: [[-0.75, 0.2], [0.3, 0.42], [1.2, 0.36], [2.0, 0.2], [2.52, 0.12]], w: 2.2, col: LK.trim }] },
  ],
  front(ctx) { // red sash round the waist, knot and two tails in front
    const { T, H, ow, o } = ctx, sw = o.sway || 0;
    let s = new Group(ow).add(smooth([T(0.62, 0.99), T(0.62, -0.78), T(0.22, -0.8), T(0.18, 0.95)], true, 0.3), LK.sash).svg();
    s += tail(ctx, 0.3, 0.86, 1.25, 0.3, LK.sash, -8 + sw) + tail(ctx, 0.32, 0.7, 1.0, 0.26, shade(LK.sash, 0.8), 6 + sw * 1.3);
    s += new Group(ow).add(circle(T(0.4, 0.86), 0.2 * H), LK.sash).svg();
    return s;
  },
  head: (expr, o) => likuiBust(expr || LKEX.平常, o),
};
/** the two 板斧 crossed in the back of his sash (the picture everyone has of 李逵) */
export const axesOnBack = (ctx) => { const { T, H, p } = ctx; return axe(T(0.25, -0.35), -90 + p.spine - 34, H) + axe(T(0.3, -0.6), -90 + p.spine - 8, H); };

// ================================================================ 娘
export const MOTHER = {
  H: 74, headK: 1.45, headPivot: 520, spine: 2.0, neck: 0.22, thigh: 1.5, shin: 1.45, foot: 0.7, ankleH: 0.22, upper: 1.2, fore: 1.1, hipOff: 0.6, shOff: 0.7,
  rThigh: [0.62, 0.6], rShin: [0.6, 0.56], rUpper: [0.3, 0.27], rFore: [0.27, 0.2], rHand: 0.2, rNeck: 0.24,
  col: { skin: MO.skin, pants: MO.robe, shoe: '#2a2428', sleeve: MO.robe, sleeveLow: MO.robe },
  torso: [{ fill: MO.robe, pts: [[-0.5, 0.5], [0.4, 0.62], [1.2, 0.6], [1.8, 0.48], [2.08, 0.18], [2.1, -0.25], [1.7, -0.6], [0.9, -0.62], [0, -0.6], [-0.55, -0.55]],
    lines: [{ pts: [[2.05, 0.2], [1.2, 0.52], [0.2, 0.3]], w: 2, col: MO.robeS }, { pts: [[0.42, 0.62], [0.4, -0.6]], w: 1.6, col: MO.robeS }] }],
  skirt(ctx) { // one long skirt from the waist to the ankles, following the knees (standing or sitting)
    const { T, H, J, ow } = ctx, bk = J.kneeL[0] < J.kneeR[0] ? J.kneeL : J.kneeR, fk = J.kneeL[0] < J.kneeR[0] ? J.kneeR : J.kneeL, ba = J.ankleL[0] < J.ankleR[0] ? J.ankleL : J.ankleR, fa = J.ankleL[0] < J.ankleR[0] ? J.ankleR : J.ankleL;
    const pts = [T(0.5, 0.6), T(0.5, -0.6), T(-0.2, -0.66), [bk[0] - 0.55 * H, bk[1]], [ba[0] - 0.6 * H, ba[1] + 0.12 * H], [fa[0] + 0.62 * H, fa[1] + 0.12 * H], [fk[0] + 0.6 * H, fk[1]], T(-0.1, 0.62)];
    return new Group(ow).add(smooth(pts, true, 0.5), MO.robe).svg() + stroke(`M${P(T(0.3, 0.2))} L${P([fa[0] + 0.1 * H, fa[1]])}`, ow * 0.7, MO.robeS, 0.9) + stroke(`M${P(T(0.2, -0.3))} L${P([ba[0] - 0.2 * H, ba[1]])}`, ow * 0.7, MO.robeS, 0.9) +
      new Group(ow).add(smooth([T(0.62, 0.62), T(0.62, -0.62), T(0.36, -0.62), T(0.36, 0.62)], true, 0.3), MO.robeS).svg();
  },
  head: (expr, o) => motherBust(expr || {}, o),
};

// ================================================================ ordinary men (guests, hunters, carriers, the robber)
const plainHead = (v) => (expr, o) => {
  // one construction for every side character: the same face, told apart by hat, hair and beard
  const sk = v.skin || '#e2b792', skS = shade(sk, 0.82), hair = v.hair || '#1c1a20', tx = (o.turn || 0) * 34;
  let s = `<path d="M300,212 C366,212 402,262 402,338 C402,400 394,446 374,488 C356,530 332,556 300,556 C268,556 244,530 226,488 C206,446 198,400 198,338 C198,262 234,212 300,212Z" fill="${sk}" stroke="${LINE}" stroke-width="5"/>`;
  s += `<path d="M196,350 C192,268 236,206 300,206 C364,206 408,268 404,350 C394,300 360,268 300,268 C240,268 206,300 196,350Z" fill="${hair}" stroke="${LINE}" stroke-width="4"/>`;
  let f = '';
  for (const cx of [252, 348]) f += `<ellipse cx="${cx}" cy="372" rx="11" ry="${v.shut ? 2 : 12}" fill="#1a1210"/><path d="M${cx - 28},${v.brow === 'sad' ? 340 : 334} L${cx + 28},${v.brow === 'sad' ? 332 : (cx < 300 ? 342 : 326)}" stroke="${hair}" stroke-width="8" stroke-linecap="round" fill="none" transform="${cx > 300 ? `translate(${2 * cx} 0) scale(-1 1)` : ''}"/>`;
  f += `<path d="M294,384 C292,418 284,432 282,440 C288,450 312,450 318,440" fill="none" stroke="${LINE}" stroke-width="3.6" stroke-linecap="round"/>`;
  f += v.mouth === 'open' ? `<ellipse cx="300" cy="496" rx="22" ry="16" fill="#4a1512" stroke="${LINE}" stroke-width="3.5"/>` : `<path d="M274,494 Q300,${v.mouth === 'smile' ? 510 : 498} 326,494" fill="none" stroke="#6a3a30" stroke-width="5" stroke-linecap="round"/>`;
  if (v.beard) f += `<path d="M252,470 Q300,452 348,470 Q360,540 300,${v.beard === 'long' ? 640 : 580} Q240,540 252,470Z" fill="${hair}" stroke="${LINE}" stroke-width="3.5"/>` + (v.mouth === 'open' ? `<ellipse cx="300" cy="500" rx="18" ry="12" fill="#4a1512"/>` : '');
  s += `<g transform="translate(${f2(tx + 300)} 0) scale(${f2(1 - 0.16 * Math.abs(o.turn || 0))} 1) translate(-300 0)">${f}</g>`;
  if (v.hat === 'cloth') s += `<path d="M194,300 C200,220 250,186 300,186 C350,186 400,220 406,300 C370,270 230,270 194,300Z" fill="${v.hatCol || '#3d465c'}" stroke="${LINE}" stroke-width="5"/><path d="M270,190 C276,150 324,150 330,190Z" fill="${v.hatCol || '#3d465c'}" stroke="${LINE}" stroke-width="4"/>`;
  else if (v.hat === 'bun') s += `<path d="M262,214 C262,166 338,166 338,214Z" fill="${hair}" stroke="${LINE}" stroke-width="4"/><path d="M256,206 L344,206 L344,220 L256,220Z" fill="${v.hatCol || '#8a6a3a'}" stroke="${LINE}" stroke-width="3"/>`;
  else if (v.hat === 'red') s += `<path d="M190,306 C196,226 250,196 300,196 C350,196 404,226 410,306 C370,280 230,280 190,306Z" fill="#b3302a" stroke="${LINE}" stroke-width="5"/><path d="M404,270 C440,286 452,330 440,372 L424,360 C430,330 422,304 404,296Z" fill="#b3302a" stroke="${LINE}" stroke-width="4"/>`;
  else if (v.hat === 'straw') s += `<path d="M96,300 C170,258 430,258 504,300 C430,280 170,280 96,300Z" fill="#c9b27a" stroke="${LINE}" stroke-width="5"/><path d="M200,278 C230,170 370,170 400,278 C340,262 260,262 200,278Z" fill="#d9c48c" stroke="${LINE}" stroke-width="5"/>`;
  return s;
};
export function man(v = {}) {
  const robe = v.robe || '#5a6a7a', pants = v.pants || shade(robe, 0.7), long = v.long;
  return {
    H: v.H || 84, headK: 1.4, headPivot: 520, spine: 2.3, neck: 0.25, thigh: 1.75, shin: 1.7, foot: 0.85, ankleH: 0.26, upper: 1.4, fore: 1.25, hipOff: 1, shOff: 1,
    rThigh: long ? [0.56, 0.52] : [0.46, 0.34], rShin: long ? [0.52, 0.5] : [0.33, 0.22], rUpper: [0.33, 0.28], rFore: [0.3, 0.22], rHand: 0.22, rNeck: 0.3, wrap: !long && v.wrap !== false,
    col: { skin: v.skin || '#e2b792', pants: long ? robe : pants, wrap: '#cdbf9f', shoe: '#201a18', sleeve: robe, sleeveLow: robe },
    torso: [{ fill: robe, pts: [[-0.6, 0.48], [0.3, 0.62], [1.2, 0.64], [1.9, 0.52], [2.36, 0.22], [2.42, -0.24], [2.1, -0.62], [1.0, -0.62], [0, -0.6], [-0.65, -0.52]],
      lines: [{ pts: [[2.3, 0.26], [1.3, 0.56], [0.3, 0.36]], w: 2, col: shade(robe, 0.72) }] },
    { fill: v.sash || shade(robe, 0.6), pts: [[0.55, 0.66], [0.55, -0.62], [0.25, -0.62], [0.22, 0.63]], k: 0.3 }],
    head: plainHead(v),
  };
}
export const WUSONG = { ...man({ robe: WS.coat, pants: '#3b3a41', H: 92, sash: WS.sash }), head: (expr, o) => wusongBust(o) };
