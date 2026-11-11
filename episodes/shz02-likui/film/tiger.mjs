// shz02 tiger: a side-view quadruped, flat colour + ink outline, the picture everyone has of a tiger: orange coat,
// black stripes, white muzzle and ruff, the 王 on the brow (the big one is 吊睛白额: slanted eyes, a white forehead).
// pose: { body (pitch of hip->shoulder, deg, 0 = level, - = front up), arch (spine arch, + = hunched),
//         neck, head (deg), jaw 0..1, fl/fr/hl/hr: [upper, lower, paw] angles from straight down (+ = forward),
//         tail: [base angle, curl], ear: 0..1 (1 = flattened) }
import { capsule, circle, frame, P, smooth, poly, f2, DEG, lerp, rng } from './ink.mjs';
const LINE = '#1d1410';
const C = { coat: '#d9822b', coatS: '#b5631c', belly: '#f3e6cb', stripe: '#1d1410', nose: '#c9736a', eye: '#f2d24a', mouth: '#5a1512', tooth: '#fbf5e6' };
const dn = (a) => [Math.sin(a * DEG), Math.cos(a * DEG)];
const add = (p, v, l) => [p[0] + v[0] * l, p[1] + v[1] * l];
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0')).join(''); };
const out = (d, fill, ow) => `<path d="${d}" fill="${fill}" stroke="${LINE}" stroke-width="${f2(ow)}" stroke-linejoin="round"/>`;
const fillp = (d, fill) => `<path d="${d}" fill="${fill}"/>`;
const strokep = (d, w, col = LINE, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f2(w)}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
export const TP = {
  stand: { body: 0, arch: 0, neck: -18, head: 8, jaw: 0, fr: [6, -6, 0], fl: [-10, 4, 0], hr: [10, -34, 0], hl: [-12, -20, 0], tail: [150, 40], ear: 0 },
  prowl: { body: 6, arch: -0.1, neck: 4, head: 14, jaw: 0.15, fr: [30, 10, 0], fl: [-24, -8, 0], hr: [24, -40, 0], hl: [-30, -10, 0], tail: [170, 20], ear: 0.4 },
  crouch: { body: -8, arch: 0.25, neck: -6, head: 4, jaw: 0.3, fr: [42, -60, 30], fl: [34, -56, 30], hr: [62, -96, 20], hl: [54, -92, 20], tail: [160, -30], ear: 0.8 },
  leap: { body: -24, arch: -0.22, neck: 6, head: 18, jaw: 1, fr: [78, 60, 40], fl: [64, 48, 40], hr: [-48, -70, 60], hl: [-60, -84, 60], tail: [190, 30], ear: 1 },
  roar: { body: -4, arch: 0.05, neck: -30, head: -6, jaw: 1, fr: [10, -8, 0], fl: [-8, 2, 0], hr: [14, -38, 0], hl: [-10, -22, 0], tail: [130, 60], ear: 0.9 },
  dead: { body: 3, arch: 0, neck: 30, head: 40, jaw: 0.2, fr: [80, 70, 60], fl: [70, 80, 60], hr: [70, 50, 50], hl: [84, 62, 50], tail: [175, 5], ear: 0.3 },
};
let UID = 0;
/** tiger(pose, o) -> { svg, J }; o = { x, y (ground under the hind feet unless noGround), u (unit px, default 120), flip, cub, white (white brow), noGround } */
export function tiger(pose, o = {}) {
  const p = { ...TP.stand, ...pose }, u = o.u ?? 120, ow = Math.max(1.8, u * 0.035), id = 'tg' + (UID++);
  const hip = [0, 0], L = (o.cub ? 2.4 : 3.3) * u;
  const dir = [Math.cos(p.body * DEG), Math.sin(p.body * DEG)], nrm = [-dir[1], dir[0]];
  const sh = add(hip, dir, L);
  const B = (t, v) => { const a = add(hip, dir, t * L); const arch = -p.arch * Math.sin(Math.PI * t) * u * 1.6; return [a[0] + nrm[0] * (v * u + arch), a[1] + nrm[1] * (v * u + arch)]; };
  // body outline (t along hip->shoulder, v down+): rump, back, withers, chest, belly, flank
  const body = [B(-0.16, -0.25), B(-0.06, -0.82), B(0.25, -0.9), B(0.6, -0.84), B(0.92, -0.98), B(1.1, -0.7), B(1.16, 0.05), B(1.02, 0.78), B(0.72, 0.86), B(0.4, 0.62), B(0.12, 0.6), B(-0.12, 0.5)];
  const bodyD = smooth(body, true, 0.55);
  const legj = (root, a, len, far) => { const k = add(root, dn(a[0]), len[0] * u), w = add(k, dn(a[1]), len[1] * u), pw = add(w, dn(a[1] + a[2] + 70), len[2] * u); return { root, k, w, pw, far }; };
  const FL = [1.15, 1.05, 0.36], HL = [1.2, 1.15, 0.4];
  const legs = { fr: legj(B(0.95, 0.35), p.fr, FL, 0), fl: legj(B(1.0, 0.3), p.fl, FL, 1), hr: legj(B(0.06, 0.15), p.hr, HL, 0), hl: legj(B(0.1, 0.1), p.hl, HL, 1) };
  const drawLeg = (lg, hind) => {
    const col = lg.far ? shade(C.coat, 0.74) : C.coat, r0 = (hind ? 0.5 : 0.42) * u, r1 = (hind ? 0.3 : 0.3) * u, r2 = 0.22 * u;
    let s = `<path d="${capsule(lg.root, lg.k, r0, r1)}${capsule(lg.k, lg.w, r1, r2)}" fill="${LINE}" stroke="${LINE}" stroke-width="${f2(ow * 2)}" stroke-linejoin="round"/><path d="${capsule(lg.root, lg.k, r0, r1)}${capsule(lg.k, lg.w, r1, r2)}" fill="${col}"/>`;
    // stripes on the leg
    for (const [a, b, t] of [[lg.root, lg.k, 0.45], [lg.root, lg.k, 0.75], [lg.k, lg.w, 0.35], [lg.k, lg.w, 0.65]]) { const c = [lerp(a[0], b[0], t), lerp(a[1], b[1], t)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, n = [-dy / l, dx / l], w = lerp(r0, r1, t) * 0.8; s += strokep(`M${P([c[0] - n[0] * w, c[1] - n[1] * w])} L${P([c[0] + n[0] * w * 0.2, c[1] + n[1] * w * 0.2])}`, u * 0.085, lg.far ? '#120c0a' : C.stripe); }
    s += out(capsule(lg.w, lg.pw, r2 * 1.05, r2 * 0.95), col, ow) + fillp(circle(lg.pw, r2 * 0.8), lg.far ? shade(C.belly, 0.78) : C.belly) + strokep(`M${P(add(lg.pw, [0.3, -1], r2 * 0.7))} L${P(add(lg.pw, [0.5, 1], r2 * 0.6))}`, ow * 0.7, LINE, 0.7);
    return s;
  };
  // tail: a chain curling up, black rings, black tip
  let tail = ''; { let a = p.tail[0], q = B(-0.12, -0.35); const n = 7, seg = 0.5 * u, pts = [q]; for (let i = 0; i < n; i++) { q = add(q, [Math.cos(a * DEG), -Math.sin(a * DEG)], seg); pts.push(q); a -= p.tail[1] / n * (1 + i * 0.2); }
    let d = ''; for (let i = 0; i < n; i++) d += capsule(pts[i], pts[i + 1], (0.2 - i * 0.012) * u, (0.19 - i * 0.012) * u);
    tail = `<path d="${d}" fill="${LINE}" stroke="${LINE}" stroke-width="${f2(ow * 2)}" stroke-linejoin="round"/><path d="${d}" fill="${C.coat}"/>`;
    for (let i = 1; i < n; i++) tail += fillp(circle(pts[i], (0.19 - i * 0.012) * u), i >= n - 1 ? C.stripe : 'none') + strokep(`M${P(add(pts[i], [0, -1], 0.17 * u))} L${P(add(pts[i], [0, 1], 0.17 * u))}`, u * 0.1, C.stripe);
    tail += fillp(capsule(pts[n - 1], pts[n], 0.12 * u, 0.1 * u), C.stripe); }
  // stripes on the body, clipped to it
  let stripes = ''; { const R = rng(o.seed ?? 4);
    for (let i = 0; i < 9; i++) { const t = 0.04 + i * 0.115 + (R() - 0.5) * 0.03, w = 0.035 + R() * 0.02, a = B(t - w, -1.1), b = B(t + w, -1.1), tip = B(t + 0.05 * (R() - 0.3), -0.1 + R() * 0.35); stripes += `<path d="M${P(a)} L${P(b)} L${P(tip)}Z"/>`; }
    for (let i = 0; i < 5; i++) { const t = 0.2 + i * 0.17, tip = B(t, 0.25 + R() * 0.2), a = B(t - 0.03, 1.0), b = B(t + 0.03, 1.0); stripes += `<path d="M${P(a)} L${P(b)} L${P(tip)}Z" opacity="0.9"/>`; } }
  const belly = smooth([B(-0.1, 0.5), B(0.12, 0.6), B(0.4, 0.62), B(0.72, 0.86), B(1.02, 0.78), B(1.12, 0.3), B(0.9, 0.5), B(0.6, 0.4), B(0.3, 0.36), B(0.05, 0.3)], true, 0.5);
  // head
  const neckA = p.body + p.neck, nb = B(1.08, -0.35), hc = add(nb, [Math.cos(neckA * DEG), Math.sin(neckA * DEG)], 0.95 * u);
  const HF = frame(hc, p.body + p.neck + p.head), k = u * (o.cub ? 0.95 : 1.22);
  const neck = `<path d="${capsule(B(1.0, -0.3), hc, 0.78 * u, 0.7 * k)}" fill="${LINE}" stroke="${LINE}" stroke-width="${f2(ow * 2)}"/><path d="${capsule(B(1.0, -0.3), hc, 0.78 * u, 0.7 * k)}" fill="${C.coat}"/>`;
  let head = '';
  const jaw = p.jaw, JF = frame(HF(0.25 * k, 0.28 * k), p.body + p.neck + p.head + jaw * 34);
  // lower jaw (behind the muzzle)
  head += out(smooth([JF(-0.3 * k, -0.05 * k), JF(0.5 * k, -0.04 * k), JF(0.95 * k, 0.06 * k), JF(0.9 * k, 0.3 * k), JF(0.3 * k, 0.42 * k), JF(-0.35 * k, 0.3 * k)], true, 0.5), C.belly, ow);
  if (jaw > 0.2) { head += fillp(smooth([HF(0.2 * k, 0.26 * k), HF(0.95 * k, 0.3 * k), JF(0.86 * k, 0.04 * k), JF(0.2 * k, 0.02 * k)], true, 0.3), C.mouth); head += fillp(poly([JF(0.7 * k, 0.03 * k), JF(0.8 * k, 0.03 * k), JF(0.76 * k, -0.2 * k * jaw)]), C.tooth) + fillp(poly([JF(0.5 * k, 0.03 * k), JF(0.58 * k, 0.03 * k), JF(0.54 * k, -0.1 * k)]), C.tooth); }
  // ears (behind the skull): rounded, black backs with a white spot; flatten back when angry
  const ear = (dx, far) => { const E = frame(HF((-0.34 + dx) * k, -0.62 * k), p.body + p.neck + p.head - 20 - p.ear * 55); return out(smooth([E(-0.16 * k, 0.1 * k), E(-0.1 * k, -0.22 * k), E(0.1 * k, -0.24 * k), E(0.2 * k, 0.1 * k)], true, 0.6), far ? shade(C.coat, 0.74) : C.stripe, ow) + (far ? '' : fillp(circle(E(0.02 * k, -0.08 * k), 0.06 * k), '#f3e6cb')); };
  head = ear(0.3, 1) + head;
  // skull and ruff
  const ruff = []; { const R = rng(9); for (let i = 0; i <= 8; i++) { const a = 60 + i * 15, r = (0.86 + (i % 2 ? 0.2 : 0) + R() * 0.05) * k; ruff.push(HF(Math.cos(a * DEG) * r * 0.95 - 0.1 * k, Math.sin(a * DEG) * r * 0.9 + 0.02 * k)); } }
  head += out(poly([HF(-0.5 * k, -0.2 * k), HF(0.3 * k, 0.3 * k), ...ruff]), C.belly, ow);
  head += out(smooth([HF(-0.72 * k, 0.1 * k), HF(-0.7 * k, -0.42 * k), HF(-0.25 * k, -0.74 * k), HF(0.3 * k, -0.66 * k), HF(0.62 * k, -0.34 * k), HF(0.7 * k, 0.0), HF(0.3 * k, 0.34 * k), HF(-0.3 * k, 0.5 * k)], true, 0.55), C.coat, ow);
  // muzzle: white, the nose, whisker pad
  head += out(smooth([HF(0.3 * k, -0.3 * k), HF(0.8 * k, -0.26 * k), HF(1.04 * k, -0.08 * k), HF(1.02 * k, 0.2 * k), HF(0.7 * k, 0.32 * k), HF(0.26 * k, 0.32 * k), HF(0.18 * k, 0.0)], true, 0.55), C.belly, ow);
  head += out(smooth([HF(0.9 * k, -0.24 * k), HF(1.08 * k, -0.2 * k), HF(1.08 * k, -0.02 * k), HF(0.94 * k, -0.04 * k)], true, 0.6), C.nose, ow * 0.8);
  head += strokep(`M${P(HF(0.98 * k, -0.02 * k))} Q${P(HF(0.86 * k, 0.16 * k))} ${P(HF(0.6 * k, 0.22 * k))}`, ow, LINE) + [0, 1, 2].map((i) => fillp(circle(HF((0.66 + i * 0.1) * k, (0.06 + (i % 2) * 0.05) * k), 0.022 * k), LINE)).join('');
  if (jaw > 0.2) head += fillp(poly([HF(0.74 * k, 0.28 * k), HF(0.86 * k, 0.28 * k), HF(0.8 * k, 0.28 * k + 0.26 * k * jaw)]), C.tooth) + fillp(poly([HF(0.5 * k, 0.3 * k), HF(0.6 * k, 0.3 * k), HF(0.55 * k, 0.42 * k)]), C.tooth);
  // white brow patch (吊睛白额), the eye slanted up, the 王
  if (o.white !== false) head += fillp(smooth([HF(0.0, -0.62 * k), HF(0.4 * k, -0.6 * k), HF(0.5 * k, -0.36 * k), HF(0.1 * k, -0.34 * k)], true, 0.6), '#fbf5e6');
  head += strokep(`M${P(HF(0.06 * k, -0.6 * k))} L${P(HF(0.32 * k, -0.6 * k))} M${P(HF(0.04 * k, -0.5 * k))} L${P(HF(0.36 * k, -0.5 * k))} M${P(HF(0.08 * k, -0.4 * k))} L${P(HF(0.34 * k, -0.4 * k))} M${P(HF(0.2 * k, -0.62 * k))} L${P(HF(0.2 * k, -0.38 * k))}`, u * 0.05, C.stripe);
  head += out(smooth([HF(0.22 * k, -0.2 * k), HF(0.4 * k, -0.34 * k), HF(0.62 * k, -0.3 * k), HF(0.5 * k, -0.14 * k)], true, 0.6), C.eye, ow * 0.9) + fillp(circle(HF(0.45 * k, -0.24 * k), 0.055 * k), '#111');
  head += strokep(`M${P(HF(0.16 * k, -0.24 * k))} L${P(HF(0.66 * k, -0.38 * k))}`, u * 0.07, C.stripe);
  // cheek stripes
  head += strokep(`M${P(HF(-0.5 * k, -0.2 * k))} L${P(HF(-0.2 * k, -0.1 * k))} M${P(HF(-0.56 * k, 0.05 * k))} L${P(HF(-0.26 * k, 0.1 * k))} M${P(HF(-0.4 * k, -0.5 * k))} L${P(HF(-0.16 * k, -0.36 * k))}`, u * 0.07, C.stripe);
  head += ear(0, 0);
  let s = drawLeg(legs.fl, 0) + drawLeg(legs.hl, 1) + tail;
  s += `<defs><clipPath id="${id}"><path d="${bodyD}"/></clipPath></defs>` + out(bodyD, C.coat, ow * 1.2) + `<g clip-path="url(#${id})"><path d="${belly}" fill="${C.belly}"/><g fill="${C.stripe}">${stripes}</g></g>` + strokep(bodyD, ow * 1.2);
  s += drawLeg(legs.hr, 1) + neck + drawLeg(legs.fr, 0) + head;
  const low = o.noGround ? 0 : Math.max(legs.hr.pw[1], legs.hl.pw[1], legs.fr.pw[1], legs.fl.pw[1]) + 0.26 * u;
  const sx = o.flip ? -1 : 1, X = o.x ?? 0, Y = (o.y ?? 0) - low;
  return { svg: `<g transform="translate(${f2(X)} ${f2(Y)}) scale(${sx} 1)">${s}</g>`, J: { head: [X + sx * hc[0], Y + hc[1]], hip: [X, Y], sh: [X + sx * sh[0], Y + sh[1]] } };
}
