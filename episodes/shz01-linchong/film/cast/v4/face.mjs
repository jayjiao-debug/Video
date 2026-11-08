// Side-cast faces drawn with 林冲's face construction.
// faceFront / stubble / tearFront are a verbatim copy of chars/rig/linchong.mjs (lines 134-271, rig commit 2f58df3),
// so the eye, brow, nose and mouth shapes and every line weight match 林冲 exactly; the rig file is not touched
// (its output cannot change). Only these per-character parameters were added (o = options):
//   col      colour overrides on the rig's COL (skin / skinS / skinD per character, brow tint)
//   hair     'lin' | 'thin' | 'neat' | 'stubble' | 'none'   (facial hair; 'lin' runs the rig's own code)
//   smirk    0..1 one mouth corner up (+ smirkSide ±1) with a cheek crease (高衙内)
//   smile    0..1 lower lids pushed up into smiling eyes (陆谦)
//   crow     crow's feet + under-eye fold (张教头)
//   browTh, browArch   brow wedge thickness / arch factors
// Anchors F: { eyeR, eyeL (image-left / image-right eye), browR, browL ([inner, outer]), nose, mouth, chin, jaw[7], fw }.
import { COL } from '../../../chars/rig/linchong.mjs';

const f = (n) => (Math.round(n * 100) / 100).toString();
const P = (p) => `${f(p[0])},${f(p[1])}`;
let UID = 0;
const uid = (s) => `cf${s}${(UID++).toString(36)}`;

/** Face anchors in the rig's format from three measured points of a reference (eyes, mouth, chin), u = head scale vs 林冲.
 *  turn > 0: 3/4 view facing image-right (features slide right, far side narrower), < 0 facing left. */
export function anchors(eyes, mouth, chin, turn = 0) {
  const [[ax, ay], [bx, by]] = eyes;
  const u = (mouth[1] - (ay + by) / 2) / 52.5;           // 林冲: eye line to mouth = 52.5 px at fw 105
  // faceFront slides features by turn*10*u*k; pre-subtract so they land on the measured points
  const s = (x, k) => x - turn * 10 * u * k;
  const eyeR = [s(ax, 1), ay], eyeL = [s(bx, 1), by];
  const cx = (eyeR[0] + eyeL[0]) / 2;
  const B = (e, sgn, d) => [e[0] + sgn * d[0] * u, e[1] + d[1] * u];
  return {
    u, fw: 105 * u, turn,
    eyeR, eyeL,
    browR: [[s(ax, 0.95) + 21 * u, ay - 9.5 * u], [s(ax, 0.9) - 20 * u, ay - 22.5 * u]],
    browL: [[s(bx, 0.95) - 20 * u, by - 9.5 * u], [s(bx, 0.9) + 21 * u, by - 23.5 * u]],
    nose: [cx - 1.5 * u, (ay + by) / 2 + 37.5 * u],
    mouth: [s(mouth[0], 1.15), mouth[1]],
    chin: [chin[0], chin[1]],
    jaw: [[-49, -57], [-42, -37], [-28, -16], [0, 0], [28, -16], [42, -37], [48, -57]].map(([x, y]) => [chin[0] + x * u, chin[1] + y * u]),
  };
}

export function stubble(pts, u, col, seed = 7, dens = 1, len = 3.2) {
  let s = seed, out = '';
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const n = Math.round((Math.hypot(b[0] - a[0], b[1] - a[1]) / (1.7 * u)) * dens);
    const nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny) || 1;
    for (let j = 0; j < n; j++) {
      const t = (j + r()) / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      const L = (len * 0.6 + r() * len * 0.6) * u, sx = (nx / nl) * L * 0.55 + (r() - 0.5) * u, sy = Math.abs(ny / nl) * L * 0.5 + L * 0.7;
      const o = (r() - 0.3) * 1.6 * u;
      out += `M${f(x + (nx / nl) * o)},${f(y + (ny / nl) * o)}l${f(sx * 0.4)},${f(sy)}`;
    }
  }
  return `<path d="${out}" stroke="${col}" stroke-width="${f(0.55 * u)}" stroke-linecap="round" fill="none" opacity="0.55"/>`;
}

export function faceFront(F, E, o = {}) {
  const C = { ...COL, ...(o.col || {}) }, u = F.fw / 105;
  const L = (w) => `stroke="${C.line}" stroke-width="${f(w * u)}" stroke-linecap="round" stroke-linejoin="round"`;
  const turn = o.turn || 0; // features slide toward the turn side
  const sh = (p, k = 1) => [p[0] + turn * 10 * u * k, p[1]];
  const fore = (sgn) => 1 - (sgn * turn > 0 ? 0.34 : -0.05) * Math.min(1, Math.abs(turn)); // far side narrower
  let s = '';
  const add = (x) => (s += x);
  const id = uid('f');
  const k = E.brow;
  // ---- nose: shade stroke down the bridge and a small tip with nostrils
  const n = sh(F.nose, 1.35);
  add(`<path d="M${f(n[0] - 1.6 * u)},${f(n[1] - 31 * u)} C${f(n[0] - 2.2 * u)},${f(n[1] - 20 * u)} ${f(n[0] - 1.4 * u)},${f(n[1] - 9 * u)} ${f(n[0] - 0.4 * u)},${f(n[1] - 3 * u)}" stroke="${C.skinD}" stroke-width="${f(1.1 * u)}" fill="none" stroke-linecap="round" opacity="0.85"/>`);
  add(`<path d="M${f(n[0] - 7 * u)},${f(n[1] - 1.5 * u)} C${f(n[0] - 4.5 * u)},${f(n[1] + 1.2 * u)} ${f(n[0] - 2 * u)},${f(n[1] + 0.6 * u)} ${f(n[0])},${f(n[1] + 1.4 * u)} C${f(n[0] + 2 * u)},${f(n[1] + 0.6 * u)} ${f(n[0] + 4.5 * u)},${f(n[1] + 1.2 * u)} ${f(n[0] + 7 * u)},${f(n[1] - 1.5 * u)}" stroke="${C.skinD}" stroke-width="${f(1.1 * u)}" fill="none" stroke-linecap="round"/>`);
  add(`<path d="M${f(n[0] - 3 * u)},${f(n[1] + 1.2 * u)} C${f(n[0] - 1 * u)},${f(n[1] + 3 * u)} ${f(n[0] + 1 * u)},${f(n[1] + 3 * u)} ${f(n[0] + 3 * u)},${f(n[1] + 1.2 * u)}Z" fill="${C.skinS}" opacity="0.8"/>`);
  // ---- mouth
  const m = sh(F.mouth, 1.15), mw = 11.5 * u, op = Math.max(0, E.open), jaw = Math.max(0, E.jaw);
  const cy = m[1] - E.mouth * 2.6 * u;
  const cl = [m[0] - mw * (1 + 0.08 * jaw + 0.18 * op), cy], cr = [m[0] + mw * (1 + 0.08 * jaw + 0.18 * op), cy];
  if (o.smirk) { const sd = o.smirkSide || 1, c2 = sd > 0 ? cr : cl; c2[1] -= o.smirk * 3.2 * u; c2[0] += sd * o.smirk * 1.2 * u; }
  const drop = op * 17 * u; // lower lip / chin travel
  if (op > 0.04) {
    const up = m[1] - op * 2.2 * u, lo = m[1] + 2 + drop;
    const shape = `M${P(cl)} C${f(m[0] - mw * 0.5)},${f(up - 1 * u)} ${f(m[0] + mw * 0.5)},${f(up - 1 * u)} ${P(cr)} C${f(m[0] + mw * 0.7)},${f(lo)} ${f(m[0] - mw * 0.7)},${f(lo)} ${P(cl)}Z`;
    add(`<clipPath id="${id}m"><path d="${shape}"/></clipPath><path d="${shape}" fill="${C.mouth}"/>`);
    add(`<g clip-path="url(#${id}m)"><path d="M${f(cl[0])},${f(up - 4 * u)} L${f(cr[0])},${f(up - 4 * u)} L${f(cr[0])},${f(up + 2.6 * u + op * 1.2 * u)} C${f(m[0] + mw * 0.4)},${f(up + 3.6 * u + op * 1.2 * u)} ${f(m[0] - mw * 0.4)},${f(up + 3.6 * u + op * 1.2 * u)} ${f(cl[0])},${f(up + 2.6 * u + op * 1.2 * u)}Z" fill="${C.teeth}"/>` +
      (op > 0.35 ? `<path d="M${f(cl[0])},${f(lo + 4 * u)} L${f(cr[0])},${f(lo + 4 * u)} L${f(cr[0])},${f(lo - 2.4 * u)} C${f(m[0] + mw * 0.4)},${f(lo - 3.4 * u)} ${f(m[0] - mw * 0.4)},${f(lo - 3.4 * u)} ${f(cl[0])},${f(lo - 2.4 * u)}Z" fill="${C.teeth}"/>` : '') +
      `<path d="M${f(m[0] - mw * 0.25)},${f(up + 2.6 * u)} v${f(1.2 * u)} M${f(m[0] + mw * 0.25)},${f(up + 2.6 * u)} v${f(1.2 * u)}" stroke="#d8d0c2" stroke-width="${f(0.5 * u)}"/></g>`);
    add(`<path d="${shape}" fill="none" ${L(1.05)}/>`);
    add(`<path d="M${f(m[0] - mw * 0.45)},${f(lo + 2.2 * u)} C${f(m[0] - mw * 0.2)},${f(lo + 3.4 * u)} ${f(m[0] + mw * 0.2)},${f(lo + 3.4 * u)} ${f(m[0] + mw * 0.45)},${f(lo + 2.2 * u)}" stroke="${C.skinS}" stroke-width="${f(1.4 * u)}" fill="none" stroke-linecap="round"/>`);
  } else {
    const mid = m[1] + (0.9 - 0.7 * jaw) * u + E.mouth * 0.9 * u;
    add(`<path d="M${P(cl)} C${f(m[0] - mw * 0.45)},${f(mid)} ${f(m[0] + mw * 0.45)},${f(mid)} ${P(cr)}" fill="none" ${L(1.05 + 0.25 * jaw)}/>`);
    if (o.smirk) { const sd = o.smirkSide || 1, c2 = sd > 0 ? cr : cl; add(`<path d="M${f(c2[0] + sd * 1.4 * u)},${f(c2[1] - 2.2 * u)} C${f(c2[0] + sd * 2.6 * u)},${f(c2[1])} ${f(c2[0] + sd * 2.4 * u)},${f(c2[1] + 1.6 * u)} ${f(c2[0] + sd * 1.6 * u)},${f(c2[1] + 2.6 * u)}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.8 * u)}" stroke-linecap="round" opacity="0.7"/>`); }
    add(`<path d="M${f(m[0] - 5 * u)},${f(m[1] + (4.6 - 1.2 * jaw) * u)} C${f(m[0] - 2 * u)},${f(m[1] + (6.4 - 1.4 * jaw) * u)} ${f(m[0] + 2 * u)},${f(m[1] + (6.4 - 1.4 * jaw) * u)} ${f(m[0] + 5 * u)},${f(m[1] + (4.6 - 1.2 * jaw) * u)}" stroke="${C.skinS}" stroke-width="${f(1.6 * u)}" fill="none" stroke-linecap="round"/>`);
  }
  // jaw clench: masseter bulges at the jaw corners
  if (jaw > 0.15) {
    const j = F.jaw;
    add(`<path d="M${f(j[1][0] + 5 * u)},${f(j[1][1] - 6 * u)} C${f(j[1][0] + 7 * u)},${f(j[1][1] + 1 * u)} ${f(j[1][0] + 9 * u)},${f(j[1][1] + 5 * u)} ${f(j[1][0] + 12 * u)},${f(j[1][1] + 8 * u)}` +
      ` M${f(j[5][0] - 5 * u)},${f(j[5][1] - 6 * u)} C${f(j[5][0] - 7 * u)},${f(j[5][1] + 1 * u)} ${f(j[5][0] - 9 * u)},${f(j[5][1] + 5 * u)} ${f(j[5][0] - 12 * u)},${f(j[5][1] + 8 * u)}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.9 * u)}" stroke-linecap="round" opacity="${f(0.75 * jaw)}"/>`);
  }
  // ---- facial hair (o.hair): 'lin' = 林冲's stubble + goatee + drooping moustache (the rig's code, unchanged);
  //      'thin' = 陆谦's thin moustache (same strand, thinner, ends at the corners); 'neat' = small neat moustache;
  //      'stubble' = jaw stubble + short moustache (公人); 'none' (高衙内, 张教头 whose traced beard is kept)
  const hair = o.hair || 'none';
  if (hair === 'lin') {
    add(stubble(F.jaw.map((p) => sh(p, 0.6)), u, C.hair, 11, 1.1));
    add(stubble([[m[0] - 7 * u, m[1] + 8 * u], [m[0] + 7 * u, m[1] + 8 * u]], u, C.hair, 5, 0.9, 2.6));
    const g0 = m[1] + 6.5 * u + drop, gc = F.chin[1] + drop * 0.85, gt = F.chin[1] + 44 * u + drop * 0.8;
    const gx = m[0] + turn * 0.5 * u;
    add(`<path d="M${f(gx - 3.6 * u)},${f(g0)} C${f(gx - 5.8 * u)},${f(gc - 10 * u)} ${f(gx - 7.2 * u)},${f(gc + 2 * u)} ${f(gx - 5.2 * u)},${f(gc + 12 * u)} C${f(gx - 3.4 * u)},${f(gc + 24 * u)} ${f(gx - 1.2 * u)},${f(gt - 10 * u)} ${f(gx + 0.6 * u)},${f(gt)} C${f(gx + 1.6 * u)},${f(gt - 10 * u)} ${f(gx + 3.6 * u)},${f(gc + 24 * u)} ${f(gx + 5.4 * u)},${f(gc + 12 * u)} C${f(gx + 7.4 * u)},${f(gc + 2 * u)} ${f(gx + 6 * u)},${f(gc - 10 * u)} ${f(gx + 3.6 * u)},${f(g0)} C${f(gx + 1.2 * u)},${f(g0 + 1.4 * u)} ${f(gx - 1.2 * u)},${f(g0 + 1.4 * u)} ${f(gx - 3.6 * u)},${f(g0)}Z" fill="${C.hair}"/>`);
    add(`<path d="M${f(gx - 1.2 * u)},${f(gc + 2 * u)} C${f(gx - 0.6 * u)},${f(gc + 16 * u)} ${f(gx)},${f(gt - 12 * u)} ${f(gx + 0.4 * u)},${f(gt - 6 * u)}" stroke="#3a3530" stroke-width="${f(0.7 * u)}" fill="none" opacity="0.7"/>`);
    for (const sgn of [-1, 1]) {
      // thin strand from under the nose, out along the lip and then down past the mouth corner
      const root = [n[0] + sgn * 1.6 * u, n[1] + 4.8 * u];
      const end = [m[0] + sgn * (mw + 2.4 * u), cy + 9.5 * u - E.mouth * 1.6 * u];
      const th = 2.5 * u;
      add(`<path d="M${P(root)} C${P([root[0] + sgn * 9.5 * u, root[1] - 0.4 * u])} ${P([end[0] + sgn * 0.4 * u, end[1] - 8 * u])} ${P(end)} C${P([end[0] - sgn * 1.8 * u, end[1] - 6 * u])} ${P([root[0] + sgn * 8 * u, root[1] + th * 1.1])} ${P([root[0] - sgn * 0.3 * u, root[1] + th])}Z" fill="${C.hair}"/>`);
    }
  } else if (hair === 'thin' || hair === 'neat' || hair === 'stubble') {
    if (hair === 'stubble') { add(stubble((turn ? F.jaw.slice(2, 5) : F.jaw).map((p) => sh(p, 0.6)), u, C.hair, 11, 1.1)); add(stubble([[m[0] - 6 * u, m[1] + 9 * u], [m[0] + 6 * u, m[1] + 9 * u]], u, C.hair, 5, 1.2, 2.6)); }
    const reach = hair === 'thin' ? 1.05 : hair === 'neat' ? 0.6 : 0.85, drop2 = hair === 'thin' ? 3.4 : hair === 'neat' ? 1.6 : 2.4;
    for (const sgn of [-1, 1]) {
      const root = [n[0] + sgn * 1.4 * u, n[1] + 4.6 * u];
      const end = [m[0] + sgn * (mw * reach + 1.2 * u), root[1] + drop2 * u - E.mouth * 0.6 * u];
      const th = (hair === 'thin' ? 1.5 : 2.2) * u;
      add(`<path d="M${P(root)} C${P([root[0] + sgn * 6 * u, root[1] - 0.6 * u])} ${P([end[0] - sgn * 1 * u, end[1] - 3 * u])} ${P(end)} C${P([end[0] - sgn * 2 * u, end[1] - 2 * u])} ${P([root[0] + sgn * 5 * u, root[1] + th * 1.1])} ${P([root[0] - sgn * 0.3 * u, root[1] + th])}Z" fill="${C.hair}"/>`);
    }
  }
  // ---- eyes
  for (const sgn of [-1, 1]) {
    const c0 = sgn < 0 ? F.eyeR : F.eyeL;
    const c = sh(c0, 1);
    const inw = -sgn; // direction toward the nose
    const ew = 14.5 * u * fore(sgn), eo = Math.max(0, E.eye);
    const ci = [c[0] + inw * ew * 0.92, c[1] + 1.6 * u], co = [c[0] - inw * ew, c[1] - 1.2 * u];
    const lidH = 7.6 * u * Math.min(eo, 1.3), lowH = 5.2 * u * (eo > 0.05 ? 1 : 0.2) * (1 + Math.max(0, eo - 1) * 0.6);
    const u1 = [c[0] + inw * ew * 0.45, c[1] - lidH * 1.05], u2 = [c[0] - inw * ew * 0.45, c[1] - lidH * 1.1];
    const sm = (o.smile || 0) * 4.2 * u;
    const l1 = [c[0] - inw * ew * 0.5, c[1] + lowH - sm], l2 = [c[0] + inw * ew * 0.45, c[1] + lowH * 1.02 - sm];
    const wing = [co[0] - inw * 3.6 * u, co[1] - 2.4 * u];
    if (eo < 0.12) {
      // closed: lid line curving down, lashes at the outer corner
      add(`<path d="M${P(ci)} C${P([c[0] + inw * ew * 0.4, c[1] + 4 * u])} ${P([c[0] - inw * ew * 0.4, c[1] + 4.2 * u])} ${P(co)} L${P(wing)}" fill="none" ${L(1.9)}/>`);
      add(`<path d="M${P([c[0] - inw * ew * 0.1, c[1] - 4.5 * u])} C${P([c[0] - inw * ew * 0.5, c[1] - 5.5 * u])} ${P([c[0] - inw * ew * 0.8, c[1] - 4 * u])} ${P([co[0] + inw * 1 * u, co[1] - 2.5 * u])}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.8 * u)}" stroke-linecap="round" opacity="0.6"/>`);
      if (E.tear > 0.02) add(tearFront(ci, inw, u, E.tear));
      continue;
    }
    const shape = `M${P(ci)} C${P(u1)} ${P(u2)} ${P(co)} C${P(l1)} ${P(l2)} ${P(ci)}Z`;
    const cid = `${id}e${sgn}`;
    add(`<clipPath id="${cid}"><path d="${shape}"/></clipPath><path d="${shape}" fill="${C.white}"/>`);
    const ir = 5.7 * u * (eo > 1.1 ? 0.88 : 1);
    const ix = c[0] + (E.look[0] + turn * 0.4) * 4.2 * u + inw * 0.6 * u, iy = c[1] + 0.6 * u + E.look[1] * 2.6 * u;
    add(`<g clip-path="url(#${cid})"><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="${C.iris}"/><circle cx="${f(ix)}" cy="${f(iy + 0.3 * u)}" r="${f(ir * 0.5)}" fill="${C.irisD}"/>` +
      `<path d="${shape}" fill="none" stroke="#c9a088" stroke-width="${f(2.6 * u)}" opacity="0.45" transform="translate(0,${f(-1.6 * u)})"/>` +
      `<circle cx="${f(ix - ir * 0.35)}" cy="${f(iy - ir * 0.4)}" r="${f(ir * (E.tear > 0.02 ? 0.36 : 0.26))}" fill="#fff"/>` +
      (E.tear > 0.02 ? `<circle cx="${f(ix + ir * 0.35)}" cy="${f(iy + ir * 0.35)}" r="${f(ir * 0.16)}" fill="#fff" opacity="0.9"/><path d="M${P([co[0], co[1] + 1 * u])} C${P(l1)} ${P(l2)} ${P(ci)}" fill="none" stroke="${C.tear}" stroke-width="${f(2 * u)}" opacity="0.9"/>` : '') + '</g>');
    // heavy upper lid with the outer wing, light lower lid
    add(`<path d="M${P([ci[0] - inw * 0.6 * u, ci[1] - 0.6 * u])} C${P(u1)} ${P(u2)} ${P(co)} L${P(wing)}" fill="none" ${L(1.9)}/>`);
    add(`<path d="M${P([co[0] + inw * 1.2 * u, co[1] + 1.2 * u])} C${P([l1[0], l1[1] + 0.3 * u])} ${P([l2[0], l2[1] + 0.2 * u])} ${P([ci[0] - inw * 2 * u, ci[1] + 0.6 * u])}" fill="none" stroke="#8a5a44" stroke-width="${f(0.75 * u)}" stroke-linecap="round" opacity="0.85"/>`);
    // crease above the lid (sits higher when the eye is wide)
    add(`<path d="M${P([c[0] + inw * ew * 0.35, c[1] - lidH - 2.6 * u])} C${P([c[0], c[1] - lidH - 3.8 * u])} ${P([c[0] - inw * ew * 0.6, c[1] - lidH - 3.2 * u])} ${P([co[0] + inw * 1.5 * u, co[1] - 3.4 * u - lidH * 0.3])}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.75 * u)}" stroke-linecap="round" opacity="0.55"/>`);
    if (E.tear > 0.02) add(tearFront(ci, inw, u, E.tear));
    if (o.crow) for (const [dy, len] of [[-2.2, 6], [1, 7], [4, 5.5]]) add(`<path d="M${f(co[0] - inw * 2.4 * u)},${f(co[1] + dy * u)} l${f(-inw * len * u)},${f(dy * 0.6 * u)}" stroke="${C.skinD}" stroke-width="${f(0.75 * u)}" stroke-linecap="round" opacity="0.6"/>`);
    if (o.crow || o.smile) add(`<path d="M${f(c[0] - inw * ew * 0.55)},${f(c[1] + lowH + 2.6 * u - sm)} C${f(c[0] - inw * ew * 0.1)},${f(c[1] + lowH + 4.2 * u - sm)} ${f(c[0] + inw * ew * 0.4)},${f(c[1] + lowH + 3.6 * u - sm)} ${f(c[0] + inw * ew * 0.7)},${f(c[1] + lowH + 2 * u - sm)}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.7 * u)}" stroke-linecap="round" opacity="0.5"/>`);
  }
  // ---- brows (剑眉): sharp black wedges; k<0 lowers/knits the inner ends, k>0 lifts them
  for (const sgn of [-1, 1]) {
    const b = sgn < 0 ? F.browR : F.browL;
    const inw = -sgn;
    let bi = sh(b[0], 0.95), bo = sh(b[1], 0.9);
    bo = [bi[0] + (bo[0] - bi[0]) * fore(sgn), bo[1]];
    bi = [bi[0] + inw * (k < 0 ? -k * 2.2 : k * 0.8) * u, bi[1] + (k < 0 ? -k * 3.6 : -k * 8.5) * u];
    bo = [bo[0], bo[1] + (k < 0 ? k * 1.4 : k * 2.6) * u];
    const th = 5.4 * u * (o.browTh || 1);
    const dx = bo[0] - bi[0], dy = bo[1] - bi[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    const up = ny < 0 ? 1 : -1; // normal pointing up
    const at = (t, off) => [bi[0] + dx * t + nx * off * up, bi[1] + dy * t + ny * off * up];
    const arch = (k > 0 ? 1.2 : 2.4) * u * (o.browArch || 1), bend = k > 0 ? k * 2.4 * u : 0;
    const top0 = at(0, th * 0.62 + bend), bot0 = at(0, -th * 0.38);
    add(`<path d="M${P(bot0)} L${P(top0)} C${P(at(0.3, th * 0.6 + arch + bend * 0.6))} ${P(at(0.68, th * 0.42 + arch))} ${P(bo)} C${P(at(0.7, -th * 0.05 + arch * 0.4))} ${P(at(0.32, -th * 0.38 + arch * 0.2))} ${P(bot0)}Z" fill="${C.brow || C.hair}"/>`);
  }
  if (k < -0.3) {
    const mx = (F.browR[0][0] + F.browL[0][0]) / 2 + turn * 6 * u, my = (F.browR[0][1] + F.browL[0][1]) / 2 - k * 3.6 * u;
    add(`<path d="M${f(mx - 2.4 * u)},${f(my - 7 * u)} C${f(mx - 1.6 * u)},${f(my - 3 * u)} ${f(mx - 1.4 * u)},${f(my)} ${f(mx - 1.8 * u)},${f(my + 2 * u)} M${f(mx + 2.4 * u)},${f(my - 7 * u)} C${f(mx + 1.6 * u)},${f(my - 3 * u)} ${f(mx + 1.4 * u)},${f(my)} ${f(mx + 1.8 * u)},${f(my + 2 * u)}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.85 * u)}" stroke-linecap="round" opacity="${f(Math.min(1, -k) * 0.9)}"/>`);
  }
  if (k > 0.4) {
    const mx = (F.browR[0][0] + F.browL[0][0]) / 2 + turn * 6 * u, my = (F.browR[0][1] + F.browL[0][1]) / 2 - k * 9 * u;
    add(`<path d="M${f(mx - 5 * u)},${f(my - 3 * u)} C${f(mx - 2 * u)},${f(my - 4.6 * u)} ${f(mx + 2 * u)},${f(my - 4.6 * u)} ${f(mx + 5 * u)},${f(my - 3 * u)}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.8 * u)}" stroke-linecap="round" opacity="0.55"/>`);
  }
  return s;
}

export function tearFront(ci, inw, u, t) {
  const x = ci[0] - inw * 2.2 * u, y = ci[1] + 3.5 * u, run = 6 * u + t * 16 * u;
  return `<path d="M${f(x)},${f(y)} C${f(x - inw * 0.6 * u)},${f(y + run * 0.4)} ${f(x + inw * 0.4 * u)},${f(y + run * 0.7)} ${f(x)},${f(y + run)}" stroke="${COL.tear}" stroke-width="${f(1.5 * u)}" fill="none" stroke-linecap="round" opacity="0.85"/>` +
    `<path d="M${f(x)},${f(y + run - 1.6 * u)} C${f(x - 2.4 * u)},${f(y + run + 2 * u)} ${f(x - 1.6 * u)},${f(y + run + 4.2 * u)} ${f(x)},${f(y + run + 4.2 * u)} C${f(x + 1.6 * u)},${f(y + run + 4.2 * u)} ${f(x + 2.4 * u)},${f(y + run + 2 * u)} ${f(x)},${f(y + run - 1.6 * u)}Z" fill="${COL.tear}" stroke="#9cc8de" stroke-width="${f(0.5 * u)}"/>` +
    `<circle cx="${f(x - 0.7 * u)}" cy="${f(y + run + 1.8 * u)}" r="${f(0.7 * u)}" fill="#fff"/>`;
}
