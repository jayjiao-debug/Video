// 林冲 vector rig, traced from the painted references (chars/rig/build/*.py -> chars/rig/data/*.json).
//
//   lin({ view: 'front'|'side', costume: 'A'|'C', expr, pose, flip, height, x, y, props })
//     -> '<g>…</g>' SVG string. Local system: feet (ground point under the body) at (x, y),
//        y grows downward, the figure stands above y; `height` = pixels for 1.80 m (default 680,
//        the FS scale of model_sheet §7). Skull top to sole = 7.5 H, H = height / 7.5.
//   expr : { brow, eye, look:[x,y], mouth, open, tear, jaw }   (see NE / EX below, same meaning
//          as chars/manhua.mjs: brow -1 knit/lowered .. +1 inner ends raised; eye 0 closed .. 1
//          normal .. 1.25 wide; look iris offset -1..1; mouth -1 corners down .. +1 up;
//          open 0..1 mouth opening; tear 0..1 tear run; jaw 0..1 clench)
//   pose : { headTurn -1..1 (yaw: features slide), headTilt deg, shoulderR, elbowR, wristR,
//            shoulderL, elbowL, wristL (deg). Front view: shoulder + raises the arm outward,
//            elbow + keeps turning the forearm the same way (out and up: a fist by the ear is
//            shoulder 80 / elbow 100), elbow − folds it in across the body. Side view: + swings
//            forward and up (flexion) for shoulder and elbow alike.
//            fistR, fistL (bool), legR, legL (side view stride, deg, + = forward) }
//   props: { spear: { hand:'R'|'L', angle, grip 0..1 (fraction of the shaft below the hand),
//            gourd: true } }  angle in degrees from vertical; side view + = tip forward (90 = level
//            thrust, −40 = carried over the shoulder, tip and gourd behind); front view + = tip to
//            the viewer's right. The holding hand closes into a fist automatically.
//   hat (C, default true), tattoo 0..1, headCloth:'plain' (no jade rings), cangue (bool),
//   col: { robe, sash, cloak, coat, headscarf } recolour families, sleeve:'rigid' to disable the
//   draped wide sleeve of costume A.
//   flip : mirror (side views face left by default; flip makes them face right).
//
// Every face carries an invisible <rect data-face> for the frame checker (render6.mjs).
import fs from 'fs';

const DIR = new URL('./data/', import.meta.url);
const CACHE = {};
function data(view, costume) {
  const k = `${costume}_${view}`;
  if (!CACHE[k]) CACHE[k] = JSON.parse(fs.readFileSync(new URL(`lc_${k}.json`, DIR), 'utf8'));
  return CACHE[k];
}

const f = (n) => (Math.round(n * 100) / 100).toString();
const P = (p) => `${f(p[0])},${f(p[1])}`;
let UID = 0;
const uid = (s) => `lc${s}${(UID++).toString(36)}`;

// ------------------------------------------------------------------ expressions
export const NE = { brow: 0, eye: 1, look: [0, 0], mouth: 0, open: 0, tear: 0, jaw: 0 };
export const EX = {
  平静: { ...NE, brow: -0.1 },
  隐忍: { ...NE, brow: -0.75, eye: 0.72, look: [0.05, 0.6], mouth: -0.3, jaw: 1 },
  怒: { ...NE, brow: -1, eye: 1.22, look: [0, -0.05], mouth: -0.4, open: 0.75 },
  悲: { ...NE, brow: 0.95, eye: 0.7, look: [-0.1, 0.55], mouth: -0.6, tear: 1 },
};
export const blink = (e = NE) => ({ ...e, eye: 0 });

export const COL = {
  line: '#1e1612', hair: '#151312', skin: '#efb58e', skinS: '#d29a76', skinD: '#b9785a', lip: '#c47a62',
  white: '#fbf8f0', iris: '#2c1a12', irisD: '#0e0806', mouth: '#4a1d18', teeth: '#fbf7ee', tongue: '#a8463e',
  tear: '#d6eefa', jade: '#f4f6ee', jadeS: '#a9c0b4',
  hat: '#d9d1c3', hatS: '#b3a998', hatU: '#9c917f', hatBand: '#857a69', snow: '#ffffff', cord: '#b8322a', cordS: '#7d1f19',
  shaft: '#7a5232', shaftS: '#553722', steel: '#d9dde0', steelS: '#8d969c', tassel: '#c8322a', tasselS: '#8f1f1a',
  gourd: '#c99a55', gourdS: '#9a6f36', gourdD: '#6e4c22', gcord: '#5a3a22',
};

// ------------------------------------------------------------------ 2D affine helpers
const I = [1, 0, 0, 1, 0, 0];
const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
const rot = (deg, cx = 0, cy = 0) => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy]; };
const tr = (x, y) => [1, 0, 0, 1, x, y];
const sc = (x, y = x) => [x, 0, 0, y, 0, 0];
const ap = (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const mstr = (m) => `matrix(${m.map((v) => f(v * 1)).join(' ')})`;
const angOf = (m) => (Math.atan2(m[1], m[0]) * 180) / Math.PI;

// ------------------------------------------------------------------ traced part rendering
// colour families of the traced palette, for opts.col overrides (recolour a costume)
const FAM = {
  robe: (h, sl, l) => h >= 105 && h <= 180 && sl > 0.1 && l < 0.6,
  sash: (h, sl, l) => (h <= 22 || h >= 345) && sl > 0.3 && l < 0.42,
  cloak: (h, sl, l) => h > 8 && h <= 40 && sl > 0.1 && sl < 0.55 && l >= 0.2 && l < 0.5,
  coat: (h, sl, l) => h >= 215 && h <= 290 && l < 0.36 && sl > 0.06,
  headscarf: (h, sl, l) => sl < 0.1 && l < 0.24,
};
const hex2rgb = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const rgb2hex = (r) => '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function hsl(c) {
  const [r, g, b] = hex2rgb(c).map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, sl = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, sl, l];
}
const lum = (c) => { const [r, g, b] = hex2rgb(c); return 0.299 * r + 0.587 * g + 0.114 * b + 1; };
function recolour(D, col) {
  if (!col || !Object.keys(col).length) return D.palette;
  const key = JSON.stringify(col);
  D._rc = D._rc || {};
  if (D._rc[key]) return D._rc[key];
  // frequency of each palette entry (fills), to find each family's base colour
  const freq = new Array(D.palette.length).fill(0);
  for (const p of Object.values(D.parts)) for (const [c, d] of p.fills) freq[c] += d.length;
  const out = D.palette.slice();
  for (const [fam, target] of Object.entries(col)) {
    const test = FAM[fam];
    if (!test) continue;
    const members = D.palette.map((c, i) => [i, hsl(c)]).filter(([, h]) => test(...h)).map(([i]) => i);
    if (!members.length) continue;
    const base = members.reduce((a, b) => (freq[b] > freq[a] ? b : a));
    const T = hex2rgb(target), lb = lum(D.palette[base]);
    for (const i of members) {
      const r = lum(D.palette[i]) / lb;
      out[i] = rgb2hex(T.map((v) => v * r + (r > 1 ? (255 - v) * (r - 1) * 0.15 : 0)));
    }
  }
  D._rc[key] = out;
  return out;
}

function partSVG(D, name, extra = '', pal = D.palette) {
  const p = D.parts[name];
  if (!p) return '';
  let s = '';
  for (const [c, d] of p.fills) s += `<path d="${d}" fill="${pal[c]}"/>`;
  if (p.inks.length) {
    s += '<g fill="none" stroke-linecap="round" stroke-linejoin="round">';
    for (const [c, w, d] of p.inks) s += `<path d="${d}" stroke="${pal[c]}" stroke-width="${w}"/>`;
    s += '</g>';
  }
  if (p.holes && p.holes.length) {
    const hid = uid('h');
    s = `<clipPath id="${hid}"><path clip-rule="evenodd" d="M-3000,-3000H4000V5000H-3000Z ${p.holes.join(' ')}"/></clipPath><g clip-path="url(#${hid})">${s}</g>`;
  }
  return s + extra;
}

// ------------------------------------------------------------------ face, front view
function stubble(pts, u, col, seed = 7, dens = 1, len = 3.2) {
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

function faceFront(F, E, o = {}) {
  const C = COL, u = F.fw / 105;
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
    add(`<path d="M${f(m[0] - 5 * u)},${f(m[1] + (4.6 - 1.2 * jaw) * u)} C${f(m[0] - 2 * u)},${f(m[1] + (6.4 - 1.4 * jaw) * u)} ${f(m[0] + 2 * u)},${f(m[1] + (6.4 - 1.4 * jaw) * u)} ${f(m[0] + 5 * u)},${f(m[1] + (4.6 - 1.2 * jaw) * u)}" stroke="${C.skinS}" stroke-width="${f(1.6 * u)}" fill="none" stroke-linecap="round"/>`);
  }
  // jaw clench: masseter bulges at the jaw corners
  if (jaw > 0.15) {
    const j = F.jaw;
    add(`<path d="M${f(j[1][0] + 5 * u)},${f(j[1][1] - 6 * u)} C${f(j[1][0] + 7 * u)},${f(j[1][1] + 1 * u)} ${f(j[1][0] + 9 * u)},${f(j[1][1] + 5 * u)} ${f(j[1][0] + 12 * u)},${f(j[1][1] + 8 * u)}` +
      ` M${f(j[5][0] - 5 * u)},${f(j[5][1] - 6 * u)} C${f(j[5][0] - 7 * u)},${f(j[5][1] + 1 * u)} ${f(j[5][0] - 9 * u)},${f(j[5][1] + 5 * u)} ${f(j[5][0] - 12 * u)},${f(j[5][1] + 8 * u)}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.9 * u)}" stroke-linecap="round" opacity="${f(0.75 * jaw)}"/>`);
  }
  // ---- facial hair: jaw stubble, long pointed goatee, thin drooping moustache
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
  // ---- eyes
  for (const sgn of [-1, 1]) {
    const c0 = sgn < 0 ? F.eyeR : F.eyeL;
    const c = sh(c0, 1);
    const inw = -sgn; // direction toward the nose
    const ew = 14.5 * u * fore(sgn), eo = Math.max(0, E.eye);
    const ci = [c[0] + inw * ew * 0.92, c[1] + 1.6 * u], co = [c[0] - inw * ew, c[1] - 1.2 * u];
    const lidH = 7.6 * u * Math.min(eo, 1.3), lowH = 5.2 * u * (eo > 0.05 ? 1 : 0.2) * (1 + Math.max(0, eo - 1) * 0.6);
    const u1 = [c[0] + inw * ew * 0.45, c[1] - lidH * 1.05], u2 = [c[0] - inw * ew * 0.45, c[1] - lidH * 1.1];
    const l1 = [c[0] - inw * ew * 0.5, c[1] + lowH], l2 = [c[0] + inw * ew * 0.45, c[1] + lowH * 1.02];
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
  }
  // ---- brows (剑眉): sharp black wedges; k<0 lowers/knits the inner ends, k>0 lifts them
  for (const sgn of [-1, 1]) {
    const b = sgn < 0 ? F.browR : F.browL;
    const inw = -sgn;
    let bi = sh(b[0], 0.95), bo = sh(b[1], 0.9);
    bo = [bi[0] + (bo[0] - bi[0]) * fore(sgn), bo[1]];
    bi = [bi[0] + inw * (k < 0 ? -k * 2.2 : k * 0.8) * u, bi[1] + (k < 0 ? -k * 3.6 : -k * 8.5) * u];
    bo = [bo[0], bo[1] + (k < 0 ? k * 1.4 : k * 2.6) * u];
    const th = 5.4 * u;
    const dx = bo[0] - bi[0], dy = bo[1] - bi[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    const up = ny < 0 ? 1 : -1; // normal pointing up
    const at = (t, off) => [bi[0] + dx * t + nx * off * up, bi[1] + dy * t + ny * off * up];
    const arch = (k > 0 ? 1.2 : 2.4) * u, bend = k > 0 ? k * 2.4 * u : 0;
    const top0 = at(0, th * 0.62 + bend), bot0 = at(0, -th * 0.38);
    add(`<path d="M${P(bot0)} L${P(top0)} C${P(at(0.3, th * 0.6 + arch + bend * 0.6))} ${P(at(0.68, th * 0.42 + arch))} ${P(bo)} C${P(at(0.7, -th * 0.05 + arch * 0.4))} ${P(at(0.32, -th * 0.38 + arch * 0.2))} ${P(bot0)}Z" fill="${C.hair}"/>`);
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

function tearFront(ci, inw, u, t) {
  const x = ci[0] - inw * 2.2 * u, y = ci[1] + 3.5 * u, run = 6 * u + t * 16 * u;
  return `<path d="M${f(x)},${f(y)} C${f(x - inw * 0.6 * u)},${f(y + run * 0.4)} ${f(x + inw * 0.4 * u)},${f(y + run * 0.7)} ${f(x)},${f(y + run)}" stroke="${COL.tear}" stroke-width="${f(1.5 * u)}" fill="none" stroke-linecap="round" opacity="0.85"/>` +
    `<path d="M${f(x)},${f(y + run - 1.6 * u)} C${f(x - 2.4 * u)},${f(y + run + 2 * u)} ${f(x - 1.6 * u)},${f(y + run + 4.2 * u)} ${f(x)},${f(y + run + 4.2 * u)} C${f(x + 1.6 * u)},${f(y + run + 4.2 * u)} ${f(x + 2.4 * u)},${f(y + run + 2 * u)} ${f(x)},${f(y + run - 1.6 * u)}Z" fill="${COL.tear}" stroke="#9cc8de" stroke-width="${f(0.5 * u)}"/>` +
    `<circle cx="${f(x - 0.7 * u)}" cy="${f(y + run + 1.8 * u)}" r="${f(0.7 * u)}" fill="#fff"/>`;
}

// ------------------------------------------------------------------ face, side view (data faces left)
function faceSide(F, E, o = {}) {
  // returns { head, back, jaw, front }: head-frame features, the mouth interior (between head and
  // jaw), the parts that ride on the lower jaw (lower lip, stubble, goatee), and the closed-mouth line
  const C = COL, u = F.fw / 105;
  const L = (w) => `stroke="${C.line}" stroke-width="${f(w * u)}" stroke-linecap="round" stroke-linejoin="round"`;
  let s = '', back = '', jw = '', front = '';
  const add = (x) => (s += x);
  const id = uid('s');
  const k = E.brow, op = Math.max(0, E.open), jaw = Math.max(0, E.jaw);
  const tmj = o.tmj || F.ear, th = o.theta || 0;
  const R = (p) => ap(rot(th, tmj[0], tmj[1]), p);
  const m = F.mouth, cn = [F.corner[0], F.corner[1] - E.mouth * 2.4 * u];
  if (op > 0.04) {
    const Uf = [m[0] - 2.2 * u, m[1] - 0.4 * u];
    const Lf = R([m[0] - 1.2 * u, m[1] + 1.2 * u]), Lc = R([cn[0] - 1.5 * u, cn[1] + 0.8 * u]);
    const wedge = `M${P(Uf)} C${f(m[0] + 4 * u)},${f(m[1] + 0.4 * u)} ${f(cn[0] - 5 * u)},${f(cn[1])} ${P(cn)} L${P(Lc)} C${P([Lc[0] - 6 * u, Lc[1] + 1 * u])} ${P([Lf[0] + 4 * u, Lf[1] + 1.2 * u])} ${P(Lf)} C${P([Lf[0] - 2.2 * u, Lf[1] - 2 * u])} ${P([Uf[0] - 1.6 * u, Uf[1] + 2 * u])} ${P(Uf)}Z`;
    back += `<clipPath id="${id}w"><path d="${wedge}"/></clipPath><path d="${wedge}" fill="${C.mouth}"/>`;
    back += `<g clip-path="url(#${id}w)"><path d="M${f(Uf[0] - 4 * u)},${f(m[1] - 3 * u)} L${f(cn[0] + 2 * u)},${f(cn[1] - 3 * u)} L${f(cn[0] - 3 * u)},${f(cn[1] + 2.4 * u)} L${f(Uf[0] - 4 * u)},${f(m[1] + 2.8 * u)}Z" fill="${C.teeth}"/>` +
      (op > 0.3 ? `<path d="M${P([Lf[0] - 4 * u, Lf[1] + 3 * u])} L${P([Lc[0] + 2 * u, Lc[1] + 3 * u])} L${P([Lc[0] - 2 * u, Lc[1] - 2.2 * u])} L${P([Lf[0] - 4 * u, Lf[1] - 2.4 * u])}Z" fill="${C.teeth}"/>` : '') +
      `<path d="M${P([Uf[0] + 3 * u, m[1] + 2.6 * u])} v${f(-1.2 * u)} M${P([Uf[0] + 7 * u, m[1] + 2.8 * u])} v${f(-1.2 * u)}" stroke="#d8d0c2" stroke-width="${f(0.5 * u)}"/></g>`;
    back += `<path d="${wedge}" fill="none" ${L(0.9)}/>`;
  } else {
    front += `<path d="M${f(m[0] - 0.5 * u)},${f(m[1])} C${f(m[0] + 6 * u)},${f(m[1] + (1.5 - jaw) * u)} ${f(cn[0] - 6 * u)},${f(cn[1] - 0.5 * u)} ${P(cn)}" fill="none" ${L(1 + 0.2 * jaw)}/>`;
  }
  jw += `<path d="M${f(m[0] + 2 * u)},${f(m[1] + 5 * u)} C${f(m[0] + 5 * u)},${f(m[1] + 6.4 * u)} ${f(m[0] + 9 * u)},${f(m[1] + 6 * u)} ${f(m[0] + 11 * u)},${f(m[1] + 4.6 * u)}" fill="none" stroke="${C.skinS}" stroke-width="${f(1.4 * u)}" stroke-linecap="round"/>`;
  if (jaw > 0.15) {
    const j = F.jaw[1];
    add(`<path d="M${f(j[0] - 4 * u)},${f(j[1] - 12 * u)} C${f(j[0] - 6 * u)},${f(j[1] - 6 * u)} ${f(j[0] - 7 * u)},${f(j[1] - 2 * u)} ${f(j[0] - 10 * u)},${f(j[1] + 2 * u)}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.9 * u)}" stroke-linecap="round" opacity="${f(0.75 * jaw)}"/>`);
  }
  // ---- nostril
  const ns = F.nostril;
  add(`<path d="M${f(ns[0] - 4 * u)},${f(ns[1] + 0.5 * u)} C${f(ns[0] - 2 * u)},${f(ns[1] - 2.6 * u)} ${f(ns[0] + 2.2 * u)},${f(ns[1] - 2.4 * u)} ${f(ns[0] + 2.4 * u)},${f(ns[1] + 0.6 * u)}" fill="none" stroke="${C.skinD}" stroke-width="${f(1.1 * u)}" stroke-linecap="round"/>`);
  // ---- facial hair: jaw stubble, long goatee from the chin, thin moustache drooping past the corner
  jw += stubble(F.jaw.map((p) => [p[0], p[1] - 1 * u]), u, C.hair, 13, 1.2);
  const ch = [F.chin[0], F.chin[1]];
  const g0 = [m[0] + 3.5 * u, m[1] + 7 * u];                 // under the lower lip
  const gt = [ch[0] - 3 * u, ch[1] + 44 * u];                // point, as long as the front goatee
  jw += `<path d="M${f(g0[0] - 2.4 * u)},${f(g0[1])} C${f(ch[0] - 7.4 * u)},${f(ch[1] - 8 * u)} ${f(ch[0] - 8 * u)},${f(ch[1] + 6 * u)} ${f(ch[0] - 6 * u)},${f(ch[1] + 14 * u)} C${f(ch[0] - 4.6 * u)},${f(ch[1] + 26 * u)} ${f(gt[0] - 1.4 * u)},${f(gt[1] - 10 * u)} ${P(gt)} C${f(gt[0] + 1.8 * u)},${f(gt[1] - 10 * u)} ${f(ch[0] + 2.6 * u)},${f(ch[1] + 24 * u)} ${f(ch[0] + 3.4 * u)},${f(ch[1] + 12 * u)} C${f(ch[0] + 4 * u)},${f(ch[1] + 4 * u)} ${f(ch[0] + 2 * u)},${f(ch[1] - 4 * u)} ${f(g0[0] + 2.6 * u)},${f(g0[1] + 0.6 * u)} C${f(g0[0] + 1 * u)},${f(g0[1] + 1.4 * u)} ${f(g0[0] - 1 * u)},${f(g0[1] + 1.2 * u)} ${f(g0[0] - 2.4 * u)},${f(g0[1])}Z" fill="${C.hair}"/>`;
  jw += `<path d="M${f(ch[0] - 2 * u)},${f(ch[1] + 2 * u)} C${f(ch[0] - 2 * u)},${f(ch[1] + 16 * u)} ${f(gt[0] + 0.4 * u)},${f(gt[1] - 14 * u)} ${f(gt[0] + 0.2 * u)},${f(gt[1] - 6 * u)}" stroke="#3a3530" stroke-width="${f(0.7 * u)}" fill="none" opacity="0.7"/>`;
  {
    const root = [F.nostril[0] - 2 * u, F.nostril[1] + 5 * u];
    const end = [cn[0] + 3.5 * u, cn[1] + 9 * u];
    add(`<path d="M${P(root)} C${f(root[0] + 7 * u)},${f(root[1] - 0.5 * u)} ${f(end[0] - 1 * u)},${f(end[1] - 9 * u)} ${P(end)} C${f(end[0] - 2.2 * u)},${f(end[1] - 7 * u)} ${f(root[0] + 6 * u)},${f(root[1] + 2.2 * u)} ${f(root[0] - 1 * u)},${f(root[1] + 2 * u)}Z" fill="${C.hair}"/>`);
  }
  // ---- eye (profile wedge, iris at the front)
  const F0 = F.eye, B0 = F.eyeBack, eo = Math.max(0, E.eye);
  const dx = B0[0] - F0[0];
  const Fp = [F0[0] + 0.5 * u, F0[1]], Bp = B0;
  if (eo < 0.12) {
    add(`<path d="M${P(Fp)} C${f(Fp[0] + dx * 0.35)},${f(Fp[1] + 3 * u)} ${f(Bp[0] - dx * 0.25)},${f(Bp[1] + 3 * u)} ${P(Bp)} l${f(3 * u)},${f(-2.4 * u)}" fill="none" ${L(1.8)}/>`);
  } else {
    const lid = 6.4 * u * Math.min(eo, 1.3), low = 4 * u * (1 + Math.max(0, eo - 1) * 0.6);
    const shape = `M${P(Fp)} C${f(Fp[0] + dx * 0.2)},${f(Fp[1] - lid)} ${f(Bp[0] - dx * 0.35)},${f(Bp[1] - lid * 0.7)} ${P(Bp)} C${f(Bp[0] - dx * 0.3)},${f(Bp[1] + low)} ${f(Fp[0] + dx * 0.3)},${f(Fp[1] + low * 0.9)} ${P(Fp)}Z`;
    add(`<clipPath id="${id}e"><path d="${shape}"/></clipPath><path d="${shape}" fill="${C.white}"/>`);
    const ix = Fp[0] + 6.6 * u - E.look[0] * 1.6 * u, iy = Fp[1] - 0.6 * u + E.look[1] * 2.4 * u;
    add(`<g clip-path="url(#${id}e)"><ellipse cx="${f(ix)}" cy="${f(iy)}" rx="${f(3.9 * u)}" ry="${f(5.6 * u)}" fill="${C.iris}"/><ellipse cx="${f(ix - 0.6 * u)}" cy="${f(iy)}" rx="${f(2 * u)}" ry="${f(3.2 * u)}" fill="${C.irisD}"/>` +
      `<circle cx="${f(ix + 0.8 * u)}" cy="${f(iy - 2.2 * u)}" r="${f(1.3 * u * (E.tear > 0.02 ? 1.3 : 1))}" fill="#fff"/>` +
      (E.tear > 0.02 ? `<path d="M${P(Bp)} C${f(Bp[0] - dx * 0.3)},${f(Bp[1] + low)} ${f(Fp[0] + dx * 0.3)},${f(Fp[1] + low * 0.9)} ${P(Fp)}" fill="none" stroke="${C.tear}" stroke-width="${f(1.8 * u)}"/>` : '') + '</g>');
    add(`<path d="M${f(Fp[0] - 0.4 * u)},${f(Fp[1] + 0.8 * u)} C${f(Fp[0] + dx * 0.2)},${f(Fp[1] - lid)} ${f(Bp[0] - dx * 0.35)},${f(Bp[1] - lid * 0.7)} ${P(Bp)} l${f(3.2 * u)},${f(-2.6 * u)}" fill="none" ${L(1.8)}/>`);
    add(`<path d="M${f(Bp[0] - 1 * u)},${f(Bp[1] + 1.5 * u)} C${f(Bp[0] - dx * 0.3)},${f(Bp[1] + low + 0.3 * u)} ${f(Fp[0] + dx * 0.35)},${f(Fp[1] + low)} ${f(Fp[0] + 2 * u)},${f(Fp[1] + 1.6 * u)}" fill="none" stroke="#8a5a44" stroke-width="${f(0.7 * u)}" stroke-linecap="round"/>`);
    add(`<path d="M${f(Fp[0] + dx * 0.25)},${f(Fp[1] - lid - 2.4 * u)} C${f(Fp[0] + dx * 0.55)},${f(Fp[1] - lid - 3 * u)} ${f(Bp[0] - dx * 0.1)},${f(Bp[1] - lid * 0.7 - 1.8 * u)} ${f(Bp[0] + 1 * u)},${f(Bp[1] - 2.8 * u)}" fill="none" stroke="${C.skinD}" stroke-width="${f(0.7 * u)}" stroke-linecap="round" opacity="0.5"/>`);
  }
  if (E.tear > 0.02) {
    const x = Fp[0] + 4 * u, y = Fp[1] + 4.5 * u, run = 5 * u + E.tear * 16 * u;
    add(`<path d="M${f(x)},${f(y)} C${f(x + 0.8 * u)},${f(y + run * 0.4)} ${f(x - 0.6 * u)},${f(y + run * 0.7)} ${f(x + 0.4 * u)},${f(y + run)}" stroke="${C.tear}" stroke-width="${f(1.5 * u)}" fill="none" stroke-linecap="round" opacity="0.85"/>`);
    add(`<path d="M${f(x + 0.4 * u)},${f(y + run - 1.6 * u)} C${f(x - 2 * u)},${f(y + run + 2 * u)} ${f(x - 1.2 * u)},${f(y + run + 4.2 * u)} ${f(x + 0.4 * u)},${f(y + run + 4.2 * u)} C${f(x + 2 * u)},${f(y + run + 4.2 * u)} ${f(x + 2.8 * u)},${f(y + run + 2 * u)} ${f(x + 0.4 * u)},${f(y + run - 1.6 * u)}Z" fill="${C.tear}" stroke="#9cc8de" stroke-width="${f(0.5 * u)}"/>`);
  }
  // ---- brow: thick wedge, front end heavy
  {
    let bf = F.brow[0], bb = F.brow[1];
    bf = [bf[0] + (k < 0 ? 1 * u * -k : 0), bf[1] + (k < 0 ? -k * 3.4 : -k * 7.5) * u];
    bb = [bb[0], bb[1] + (k < 0 ? k * 1 : k * 2.6) * u];
    const th = 5.2 * u;
    add(`<path d="M${f(bf[0])},${f(bf[1] + th * 0.4)} L${f(bf[0] - 0.6 * u)},${f(bf[1] - th * 0.6)} C${f(bf[0] + 12 * u)},${f(bf[1] - th - 2.6 * u - k * 1.5 * u)} ${f(bb[0] - 14 * u)},${f(bb[1] - 3 * u)} ${P(bb)} C${f(bb[0] - 14 * u)},${f(bb[1] + 0.4 * u)} ${f(bf[0] + 12 * u)},${f(bf[1] + 0.2 * u)} ${f(bf[0])},${f(bf[1] + th * 0.4)}Z" fill="${C.hair}"/>`);
  }
  return o.split ? { head: s, back, jaw: jw, front } : s + back + jw + front;
}

// ------------------------------------------------------------------ hat (毡笠), rings, tattoo
function hatFront(H, u, back) {
  const C = COL, cx = H.cx, y = H.y, bw = H.brim / 2, cw = H.crown / 2, ch = H.crownH;
  const L = (w) => `stroke="${C.line}" stroke-width="${f(w * u)}" stroke-linecap="round" stroke-linejoin="round"`;
  if (back) {
    // the far half of the brim's underside shows behind the head
    return `<path d="M${f(cx - bw)},${f(y)} C${f(cx - bw * 0.7)},${f(y - 9 * u)} ${f(cx + bw * 0.7)},${f(y - 9 * u)} ${f(cx + bw)},${f(y)} C${f(cx + bw * 0.6)},${f(y + 5 * u)} ${f(cx - bw * 0.6)},${f(y + 5 * u)} ${f(cx - bw)},${f(y)}Z" fill="${C.hatU}"/>`;
  }
  let s = '';
  // brim: flat ellipse, top surface + darker underside lip
  const top = `M${f(cx - bw)},${f(y)} C${f(cx - bw * 0.72)},${f(y - 10 * u)} ${f(cx - cw * 1.2)},${f(y - 13 * u)} ${f(cx)},${f(y - 13 * u)} C${f(cx + cw * 1.2)},${f(y - 13 * u)} ${f(cx + bw * 0.72)},${f(y - 10 * u)} ${f(cx + bw)},${f(y)} C${f(cx + bw * 0.6)},${f(y + 7.5 * u)} ${f(cx - bw * 0.6)},${f(y + 7.5 * u)} ${f(cx - bw)},${f(y)}Z`;
  s += `<path d="M${f(cx - bw)},${f(y)} C${f(cx - bw * 0.6)},${f(y + 7.5 * u)} ${f(cx + bw * 0.6)},${f(y + 7.5 * u)} ${f(cx + bw)},${f(y)} C${f(cx + bw * 0.62)},${f(y + 11 * u)} ${f(cx - bw * 0.62)},${f(y + 11 * u)} ${f(cx - bw)},${f(y)}Z" fill="${C.hatU}" ${L(1.1)}/>`;
  s += `<path d="${top}" fill="${C.hat}" ${L(1.1)}/>`;
  s += `<path d="M${f(cx + bw * 0.25)},${f(y + 5.6 * u)} C${f(cx + bw * 0.6)},${f(y + 4.2 * u)} ${f(cx + bw * 0.86)},${f(y + 2 * u)} ${f(cx + bw)},${f(y)} C${f(cx + bw * 0.85)},${f(y - 4 * u)} ${f(cx + bw * 0.6)},${f(y - 1 * u)} ${f(cx + bw * 0.25)},${f(y + 2.5 * u)}Z" fill="${C.hatS}" opacity="0.8"/>`;
  // snow along the brim edge
  s += `<path d="M${f(cx - bw * 0.86)},${f(y - 3.5 * u)} C${f(cx - bw * 0.7)},${f(y - 7 * u)} ${f(cx - bw * 0.55)},${f(y - 8.5 * u)} ${f(cx - bw * 0.42)},${f(y - 9.4 * u)} M${f(cx + bw * 0.4)},${f(y - 9.6 * u)} C${f(cx + bw * 0.52)},${f(y - 8.8 * u)} ${f(cx + bw * 0.62)},${f(y - 8 * u)} ${f(cx + bw * 0.72)},${f(y - 6.6 * u)}" fill="none" stroke="${C.snow}" stroke-width="${f(2.2 * u)}" stroke-linecap="round" stroke-dasharray="${f(12 * u)} ${f(5 * u)}"/>`;
  // crown: low dome with a darker band at its base, snow on top
  const cb = y - 8 * u;
  s += `<path d="M${f(cx - cw)},${f(cb)} C${f(cx - cw)},${f(cb - ch * 0.75)} ${f(cx - cw * 0.55)},${f(cb - ch)} ${f(cx)},${f(cb - ch)} C${f(cx + cw * 0.55)},${f(cb - ch)} ${f(cx + cw)},${f(cb - ch * 0.75)} ${f(cx + cw)},${f(cb)} C${f(cx + cw * 0.5)},${f(cb + 4.5 * u)} ${f(cx - cw * 0.5)},${f(cb + 4.5 * u)} ${f(cx - cw)},${f(cb)}Z" fill="${C.hat}" ${L(1.1)}/>`;
  s += `<path d="M${f(cx + cw * 0.35)},${f(cb - ch * 0.96)} C${f(cx + cw * 0.85)},${f(cb - ch * 0.8)} ${f(cx + cw)},${f(cb - ch * 0.4)} ${f(cx + cw)},${f(cb)} C${f(cx + cw * 0.8)},${f(cb + 2.6 * u)} ${f(cx + cw * 0.6)},${f(cb + 3.4 * u)} ${f(cx + cw * 0.5)},${f(cb + 3.6 * u)} C${f(cx + cw * 0.62)},${f(cb - ch * 0.4)} ${f(cx + cw * 0.56)},${f(cb - ch * 0.75)} ${f(cx + cw * 0.35)},${f(cb - ch * 0.96)}Z" fill="${C.hatS}"/>`;
  s += `<path d="M${f(cx - cw * 0.99)},${f(cb - 6 * u)} C${f(cx - cw * 0.5)},${f(cb - 1.5 * u)} ${f(cx + cw * 0.5)},${f(cb - 1.5 * u)} ${f(cx + cw * 0.99)},${f(cb - 6 * u)} L${f(cx + cw)},${f(cb)} C${f(cx + cw * 0.5)},${f(cb + 4.5 * u)} ${f(cx - cw * 0.5)},${f(cb + 4.5 * u)} ${f(cx - cw)},${f(cb)}Z" fill="${C.hatBand}" ${L(0.9)}/>`;
  s += `<path d="M${f(cx - cw * 0.66)},${f(cb - ch * 0.72)} C${f(cx - cw * 0.4)},${f(cb - ch * 0.98)} ${f(cx + cw * 0.05)},${f(cb - ch * 1.02)} ${f(cx + cw * 0.3)},${f(cb - ch * 0.94)} C${f(cx + cw * 0.05)},${f(cb - ch * 0.86)} ${f(cx - cw * 0.3)},${f(cb - ch * 0.82)} ${f(cx - cw * 0.56)},${f(cb - ch * 0.58)}Z" fill="${C.snow}"/>`;
  return s;
}

function hatSide(H, u, back) {
  // profile, data faces left: brim tilted forward (front edge lower), crown low dome
  const C = COL, cx = H.cx, y = H.y, bw = H.brim / 2, cw = H.crown / 2, ch = H.crownH;
  const L = (w) => `stroke="${C.line}" stroke-width="${f(w * u)}" stroke-linecap="round" stroke-linejoin="round"`;
  const t = `rotate(${H.tilt || -8} ${cx} ${y})`;
  if (back) return '';
  let s = `<g transform="${t}">`;
  s += `<path d="M${f(cx - bw)},${f(y)} C${f(cx - bw * 0.6)},${f(y - 4.5 * u)} ${f(cx + bw * 0.6)},${f(y - 4.5 * u)} ${f(cx + bw)},${f(y)} C${f(cx + bw + 2 * u)},${f(y + 2 * u)} ${f(cx + bw)},${f(y + 4 * u)} ${f(cx + bw - 2 * u)},${f(y + 4 * u)} C${f(cx + bw * 0.6)},${f(y + 6.5 * u)} ${f(cx - bw * 0.6)},${f(y + 6.5 * u)} ${f(cx - bw + 2 * u)},${f(y + 4 * u)} C${f(cx - bw)},${f(y + 4 * u)} ${f(cx - bw - 2 * u)},${f(y + 2 * u)} ${f(cx - bw)},${f(y)}Z" fill="${C.hat}" ${L(1.1)}/>`;
  s += `<path d="M${f(cx - bw + 2 * u)},${f(y + 2.6 * u)} C${f(cx - bw * 0.6)},${f(y + 5 * u)} ${f(cx + bw * 0.6)},${f(y + 5 * u)} ${f(cx + bw - 2 * u)},${f(y + 2.6 * u)} L${f(cx + bw - 2 * u)},${f(y + 4 * u)} C${f(cx + bw * 0.6)},${f(y + 6.5 * u)} ${f(cx - bw * 0.6)},${f(y + 6.5 * u)} ${f(cx - bw + 2 * u)},${f(y + 4 * u)}Z" fill="${C.hatU}"/>`;
  s += `<path d="M${f(cx - bw * 0.8)},${f(y - 2 * u)} C${f(cx - bw * 0.5)},${f(y - 3.8 * u)} ${f(cx - cw * 1.3)},${f(y - 4.2 * u)} ${f(cx - cw * 1.1)},${f(y - 4.3 * u)} M${f(cx + cw * 1.2)},${f(y - 4.2 * u)} C${f(cx + bw * 0.5)},${f(y - 3.8 * u)} ${f(cx + bw * 0.7)},${f(y - 2.6 * u)} ${f(cx + bw * 0.85)},${f(y - 1.6 * u)}" fill="none" stroke="${C.snow}" stroke-width="${f(1.8 * u)}" stroke-linecap="round" stroke-dasharray="${f(12 * u)} ${f(5 * u)}"/>`;
  const cb = y - 3.4 * u;
  s += `<path d="M${f(cx - cw)},${f(cb)} C${f(cx - cw)},${f(cb - ch * 0.75)} ${f(cx - cw * 0.55)},${f(cb - ch)} ${f(cx)},${f(cb - ch)} C${f(cx + cw * 0.55)},${f(cb - ch)} ${f(cx + cw)},${f(cb - ch * 0.75)} ${f(cx + cw)},${f(cb)}Z" fill="${C.hat}" ${L(1.1)}/>`;
  s += `<path d="M${f(cx - cw * 0.35)},${f(cb - ch * 0.96)} C${f(cx - cw * 0.85)},${f(cb - ch * 0.8)} ${f(cx - cw)},${f(cb - ch * 0.4)} ${f(cx - cw)},${f(cb)} L${f(cx - cw * 0.55)},${f(cb)} C${f(cx - cw * 0.62)},${f(cb - ch * 0.4)} ${f(cx - cw * 0.56)},${f(cb - ch * 0.75)} ${f(cx - cw * 0.35)},${f(cb - ch * 0.96)}Z" fill="${C.hatS}"/>`;
  s += `<path d="M${f(cx - cw * 0.995)},${f(cb - 6 * u)} L${f(cx + cw * 0.995)},${f(cb - 6 * u)} L${f(cx + cw)},${f(cb)} L${f(cx - cw)},${f(cb)}Z" fill="${C.hatBand}" ${L(0.9)}/>`;
  s += `<path d="M${f(cx - cw * 0.3)},${f(cb - ch * 0.97)} C${f(cx)},${f(cb - ch * 1.03)} ${f(cx + cw * 0.5)},${f(cb - ch * 0.98)} ${f(cx + cw * 0.8)},${f(cb - ch * 0.66)} C${f(cx + cw * 0.4)},${f(cb - ch * 0.86)} ${f(cx)},${f(cb - ch * 0.9)} ${f(cx - cw * 0.3)},${f(cb - ch * 0.97)}Z" fill="${C.snow}"/>`;
  return s + '</g>';
}

function cordFront(F, u, E) {
  // red chin cord: from inside the brim, down beside the cheeks, tied under the chin
  const C = COL, H = F.hat, j = F.jaw, drop = Math.max(0, E.open) * 10 * u;
  const knot = [F.chin[0], F.chin[1] + 4 * u + drop * 0.8];
  const a = [H.cx - 52 * u, H.y + 4 * u], b = [H.cx + 52 * u, H.y + 4 * u];
  let s = `<path d="M${P(a)} C${f(j[0][0] + 2 * u)},${f(j[0][1] - 10 * u)} ${f(j[1][0] + 3 * u)},${f(j[1][1] + 12 * u)} ${P(knot)} C${f(j[5][0] - 3 * u)},${f(j[5][1] + 12 * u)} ${f(j[6][0] - 2 * u)},${f(j[6][1] - 10 * u)} ${P(b)}" fill="none" stroke="${C.cord}" stroke-width="${f(1.6 * u)}" stroke-linecap="round"/>`;
  s += `<path d="M${f(knot[0] - 3 * u)},${f(knot[1])} C${f(knot[0] - 5 * u)},${f(knot[1] + 8 * u)} ${f(knot[0] - 4 * u)},${f(knot[1] + 16 * u)} ${f(knot[0] - 6 * u)},${f(knot[1] + 24 * u)} M${f(knot[0] + 3 * u)},${f(knot[1])} C${f(knot[0] + 4 * u)},${f(knot[1] + 9 * u)} ${f(knot[0] + 6 * u)},${f(knot[1] + 15 * u)} ${f(knot[0] + 5 * u)},${f(knot[1] + 22 * u)}" fill="none" stroke="${C.cord}" stroke-width="${f(1.5 * u)}" stroke-linecap="round"/>`;
  s += `<ellipse cx="${f(knot[0])}" cy="${f(knot[1])}" rx="${f(3.4 * u)}" ry="${f(2.4 * u)}" fill="${C.cord}" stroke="${C.cordS}" stroke-width="${f(0.7 * u)}"/>`;
  return s;
}

function cordSide(F, u, E) {
  const C = COL, H = F.hat, drop = Math.max(0, E.open) * 10 * u;
  const top = [F.ear[0] + 3 * u, H.y + 3 * u], knot = [F.ear[0] - 16 * u, F.chin[1] + 14 * u + drop * 0.3];
  return `<path d="M${P(top)} C${f(top[0] - 2 * u)},${f(top[1] + 40 * u)} ${f(knot[0] + 6 * u)},${f(knot[1] - 40 * u)} ${P(knot)}" fill="none" stroke="${C.cord}" stroke-width="${f(1.6 * u)}" stroke-linecap="round"/>` +
    `<path d="M${P(knot)} c${f(-2 * u)},${f(8 * u)} ${f(1 * u)},${f(14 * u)} ${f(-1 * u)},${f(22 * u)} M${P(knot)} c${f(2 * u)},${f(7 * u)} ${f(4 * u)},${f(12 * u)} ${f(4 * u)},${f(19 * u)}" fill="none" stroke="${C.cord}" stroke-width="${f(1.4 * u)}" stroke-linecap="round"/>` +
    `<ellipse cx="${f(knot[0])}" cy="${f(knot[1])}" rx="${f(3 * u)}" ry="${f(2.2 * u)}" fill="${C.cord}" stroke="${C.cordS}" stroke-width="${f(0.7 * u)}"/>`;
}

function hairCap(F, view, u) {
  // skull top, hairline and topknot when the hat is off (the reference only shows the hat).
  // Filled without a stroke on the lower edge, so it merges with the traced hair below it.
  const C = COL, H = F.hat;
  const st = `fill="none" stroke="${C.line}" stroke-width="${f(1.1 * u)}" stroke-linecap="round"`;
  const hi = (d) => `<path d="${d}" fill="none" stroke="#3e3a48" stroke-width="${f(3 * u)}" stroke-linecap="round"/>`;
  const knot = (x, y) => `<path d="M${f(x - 14 * u)},${f(y + 4 * u)} C${f(x - 15 * u)},${f(y - 18 * u)} ${f(x + 15 * u)},${f(y - 18 * u)} ${f(x + 14 * u)},${f(y + 4 * u)}Z" fill="${C.hair}" ${st.replace('fill="none" ', '')}/>`;
  if (view === 'front') {
    // dome over the skull, coming down in a curve to the tops of the ears (covers the temple hair)
    const cx = H.cx, hw = 70 * u, top = H.y - 56 * u, ear = H.y + 38 * u, hl = H.y + 6 * u;
    const outer = `M${f(cx - hw + 4 * u)},${f(ear)} C${f(cx - hw - 3 * u)},${f(ear - 22 * u)} ${f(cx - hw)},${f(top + 24 * u)} ${f(cx - hw * 0.62)},${f(top + 6 * u)} C${f(cx - hw * 0.35)},${f(top - 1 * u)} ${f(cx + hw * 0.35)},${f(top - 1 * u)} ${f(cx + hw * 0.62)},${f(top + 6 * u)} C${f(cx + hw)},${f(top + 24 * u)} ${f(cx + hw + 3 * u)},${f(ear - 22 * u)} ${f(cx + hw - 4 * u)},${f(ear)}`;
    return knot(cx, top + 1 * u) + `<path d="${outer} C${f(cx + hw - 12 * u)},${f(ear - 14 * u)} ${f(cx + hw * 0.55)},${f(hl + 2 * u)} ${f(cx)},${f(hl)} C${f(cx - hw * 0.55)},${f(hl + 2 * u)} ${f(cx - hw + 12 * u)},${f(ear - 14 * u)} ${f(cx - hw + 4 * u)},${f(ear)}Z" fill="${C.hair}"/>` +
      `<path d="${outer}" ${st}/>` + hi(`M${f(cx - 34 * u)},${f(top + 12 * u)} C${f(cx - 20 * u)},${f(top + 5 * u)} ${f(cx - 6 * u)},${f(top + 3 * u)} ${f(cx + 4 * u)},${f(top + 3 * u)}`);
  }
  const fx = F.brow[0][0] - 6 * u, fy = F.brow[0][1] - 8 * u, bx = F.ear[0] + 94 * u, by = F.ear[1] + 6 * u;
  const top = H.y - 58 * u, cx = (fx + bx) / 2 - 6 * u;
  const outer = `M${f(fx)},${f(fy)} C${f(fx - 4 * u)},${f(top + 26 * u)} ${f(cx - 56 * u)},${f(top)} ${f(cx)},${f(top)} C${f(cx + 60 * u)},${f(top)} ${f(bx + 4 * u)},${f(top + 40 * u)} ${f(bx)},${f(by)}`;
  return knot(cx + 18 * u, top + 2 * u) + `<path d="${outer} L${f(F.ear[0] + 6 * u)},${f(F.ear[1] - 20 * u)} C${f(F.ear[0] - 10 * u)},${f(fy - 4 * u)} ${f(fx + 30 * u)},${f(fy - 6 * u)} ${f(fx)},${f(fy)}Z" fill="${C.hair}"/>` +
    `<path d="${outer}" ${st}/>` + hi(`M${f(cx - 40 * u)},${f(top + 16 * u)} C${f(cx - 24 * u)},${f(top + 6 * u)} ${f(cx)},${f(top + 4 * u)} ${f(cx + 14 * u)},${f(top + 6 * u)}`);
}

function tattoo(p, u) {
  // 金印 (model_sheet §6): two short columns of small irregular squarish dabs, ink soaked into the
  // skin (#2A3A55, feathered), never readable characters
  const fid = uid('t');
  const dabs = [[-1.9, -3.6, 1.9, 1.6, -8], [1.7, -3.9, 1.5, 1.7, 10], [-2.1, -0.9, 1.6, 1.9, 6], [1.9, -0.6, 1.9, 1.5, -12],
    [-1.7, 2.0, 2.0, 1.5, 14], [1.6, 2.4, 1.5, 1.8, -5], [-2.0, 4.8, 1.4, 1.3, -10], [1.8, 5.0, 1.7, 1.2, 8]];
  let s = `<filter id="${fid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${f(0.32 * u)}"/></filter><g filter="url(#${fid})" fill="#2a3a55" opacity="0.85">`;
  for (const [x, y, w, h, a] of dabs) {
    const cx = p[0] + x * u * 0.9, cy = p[1] + y * u * 0.9, W = w * u, Hh = h * u;
    s += `<path d="M${f(-W / 2)},${f(-Hh / 2 + 0.15 * u)} L${f(W / 2 - 0.1 * u)},${f(-Hh / 2)} L${f(W / 2)},${f(Hh / 2 - 0.2 * u)} L${f(-W / 2 + 0.2 * u)},${f(Hh / 2)}Z" transform="translate(${f(cx)},${f(cy)}) rotate(${a})"/>`;
  }
  return s + '</g>';
}

function jadeRing(c, u, r = 4.2) {
  return `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * u)}" fill="none" stroke="${COL.line}" stroke-width="${f(3.4 * u)}"/><circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * u)}" fill="none" stroke="${COL.jade}" stroke-width="${f(2.1 * u)}"/>` +
    `<path d="M${f(c[0] - r * 0.7 * u)},${f(c[1] + r * 0.7 * u)} A${f(r * u)},${f(r * u)} 0 0 0 ${f(c[0] + r * 0.7 * u)},${f(c[1] + r * 0.7 * u)}" fill="none" stroke="${COL.jadeS}" stroke-width="${f(1 * u)}"/>`;
}

// ------------------------------------------------------------------ hands: fist (drawn), props
const HANDCOL = { skin: '#efb58e', skinS: '#d3a485', line: '#8a5238' };
function fistShape(w, mirror = false) {
  // local frame: wrist at (0,0), +y toward the knuckles; palm side toward the viewer
  const C = HANDCOL, L = `stroke="${C.line}" stroke-width="${f(w * 0.028)}" stroke-linejoin="round" stroke-linecap="round"`;
  let s = `<g transform="scale(${mirror ? -1 : 1},1)">`;
  s += `<path d="M${f(-0.34 * w)},${f(-0.06 * w)} L${f(0.32 * w)},${f(-0.06 * w)} C${f(0.38 * w)},${f(0.2 * w)} ${f(0.44 * w)},${f(0.4 * w)} ${f(0.46 * w)},${f(0.58 * w)} L${f(-0.46 * w)},${f(0.58 * w)} C${f(-0.44 * w)},${f(0.38 * w)} ${f(-0.4 * w)},${f(0.18 * w)} ${f(-0.34 * w)},${f(-0.06 * w)}Z" fill="${C.skin}" ${L}/>`;
  const xs = [-0.345, -0.115, 0.115, 0.345], tops = [0.9, 0.98, 0.99, 0.93];
  xs.forEach((x, i) => {
    const x0 = (x - 0.118) * w, x1 = (x + 0.118) * w, t = tops[i] * w;
    s += `<path d="M${f(x0)},${f(0.44 * w)} L${f(x0)},${f(t - 0.1 * w)} C${f(x0)},${f(t + 0.02 * w)} ${f(x1)},${f(t + 0.02 * w)} ${f(x1)},${f(t - 0.1 * w)} L${f(x1)},${f(0.44 * w)}Z" fill="${C.skin}" ${L}/>`;
    s += `<path d="M${f(x0 + 0.03 * w)},${f(t - 0.25 * w)} C${f(x0 + 0.08 * w)},${f(t - 0.21 * w)} ${f(x1 - 0.08 * w)},${f(t - 0.21 * w)} ${f(x1 - 0.03 * w)},${f(t - 0.25 * w)}" fill="none" stroke="${C.line}" stroke-width="${f(w * 0.018)}" stroke-linecap="round" opacity="0.7"/>`;
    s += `<path d="M${f(x0 + 0.02 * w)},${f(0.5 * w)} L${f(x1 - 0.02 * w)},${f(0.5 * w)} L${f(x1 - 0.02 * w)},${f(0.58 * w)} L${f(x0 + 0.02 * w)},${f(0.58 * w)}Z" fill="${C.skinS}"/>`;
  });
  // thumb across the middle phalanges
  s += `<path d="M${f(-0.47 * w)},${f(0.3 * w)} C${f(-0.5 * w)},${f(0.5 * w)} ${f(-0.36 * w)},${f(0.66 * w)} ${f(-0.12 * w)},${f(0.68 * w)} L${f(0.12 * w)},${f(0.67 * w)} C${f(0.2 * w)},${f(0.66 * w)} ${f(0.22 * w)},${f(0.55 * w)} ${f(0.13 * w)},${f(0.53 * w)} L${f(-0.18 * w)},${f(0.5 * w)} C${f(-0.26 * w)},${f(0.42 * w)} ${f(-0.3 * w)},${f(0.3 * w)} ${f(-0.47 * w)},${f(0.3 * w)}Z" fill="${C.skin}" ${L}/>`;
  s += `<path d="M${f(0.04 * w)},${f(0.545 * w)} C${f(0.12 * w)},${f(0.55 * w)} ${f(0.15 * w)},${f(0.6 * w)} ${f(0.11 * w)},${f(0.64 * w)}" fill="none" stroke="${C.line}" stroke-width="${f(w * 0.016)}" opacity="0.6"/>`;
  s += `<path d="M${f(-0.3 * w)},${f(0.06 * w)} C${f(-0.2 * w)},${f(0.2 * w)} ${f(-0.22 * w)},${f(0.32 * w)} ${f(-0.3 * w)},${f(0.4 * w)}" fill="none" stroke="${C.skinS}" stroke-width="${f(w * 0.05)}" stroke-linecap="round" opacity="0.8"/>`;
  return s + '</g>';
}

function spearSVG(Lr, u, H) {
  // local: butt at (0,0), shaft along -y (pointing up), length Lr (2.30 m); sizes in cm (model_sheet §6)
  const C = COL, cm = H / 24, d = 2.6 * cm, head = 25 * cm, blade = 20 * cm, bw = 2.4 * cm;
  const lw = Math.max(0.9 * u, 0.12 * cm);
  const L = (w = 1) => `stroke="${C.line}" stroke-width="${f(lw * w)}" stroke-linejoin="round" stroke-linecap="round"`;
  const yb = -(Lr - head); // top of the shaft (base of the socket)
  let s = `<path d="M${f(-d / 2)},${f(-3 * cm)} L${f(-d / 2)},${f(yb)} L${f(d / 2)},${f(yb)} L${f(d / 2)},${f(-3 * cm)}Z" fill="${C.shaft}" ${L()}/>`;
  s += `<path d="M${f(d * 0.18)},${f(-4 * cm)} L${f(d * 0.18)},${f(yb + 1 * cm)}" stroke="${C.shaftS}" stroke-width="${f(d * 0.32)}"/>`;
  s += `<path d="M${f(-d * 0.3)},${f(-4 * cm)} L${f(-d * 0.3)},${f(yb + 1 * cm)}" stroke="#9a6a44" stroke-width="${f(d * 0.14)}" opacity="0.8"/>`;
  s += `<path d="M${f(-d * 0.62)},0 L${f(-d * 0.56)},${f(-4 * cm)} L${f(d * 0.56)},${f(-4 * cm)} L${f(d * 0.62)},0Z" fill="${C.steelS}" ${L()}/>`;
  // socket, then the red tassel hanging from its base
  const ys = yb - 5 * cm;
  let t = '';
  for (let i = 0; i < 11; i++) {
    const a = -1 + (i / 10) * 2;
    t += `M${f(a * d * 0.45)},${f(yb + 0.5 * cm)} C${f(a * 3 * cm)},${f(yb + 7 * cm)} ${f(a * 5 * cm)},${f(yb + 13 * cm)} ${f(a * 4.4 * cm + (i % 2 ? 0.8 : -0.6) * cm)},${f(yb + 20 * cm + (i % 3) * 1.2 * cm)} `;
  }
  s += `<path d="M${f(-d * 0.7)},${f(yb + 0.5 * cm)} C${f(-4 * cm)},${f(yb + 8 * cm)} ${f(-5.4 * cm)},${f(yb + 15 * cm)} ${f(-4.4 * cm)},${f(yb + 19 * cm)} C${f(-2 * cm)},${f(yb + 21 * cm)} ${f(2 * cm)},${f(yb + 21 * cm)} ${f(4.4 * cm)},${f(yb + 19 * cm)} C${f(5.4 * cm)},${f(yb + 15 * cm)} ${f(4 * cm)},${f(yb + 8 * cm)} ${f(d * 0.7)},${f(yb + 0.5 * cm)}Z" fill="${C.tassel}" ${L(0.9)}/>`;
  s += `<path d="${t}" fill="none" stroke="${C.tasselS}" stroke-width="${f(Math.max(0.5 * u, 0.22 * cm))}" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M${f(-d * 0.75)},${f(yb + 1.5 * cm)} L${f(-d * 0.62)},${f(ys)} L${f(d * 0.62)},${f(ys)} L${f(d * 0.75)},${f(yb + 1.5 * cm)}Z" fill="${C.steelS}" ${L()}/>`;
  s += `<path d="M${f(-d * 0.8)},${f(yb + 0.5 * cm)} L${f(d * 0.8)},${f(yb + 0.5 * cm)} L${f(d * 0.8)},${f(yb - 1.2 * cm)} L${f(-d * 0.8)},${f(yb - 1.2 * cm)}Z" fill="#6c7378" ${L(0.8)}/>`;
  // leaf-shaped steel blade with a central ridge
  const ht = -Lr;
  s += `<path d="M${f(-d * 0.45)},${f(ys)} C${f(-bw * 1.1)},${f(ys - blade * 0.18)} ${f(-bw)},${f(ys - blade * 0.55)} 0,${f(ht)} C${f(bw)},${f(ys - blade * 0.55)} ${f(bw * 1.1)},${f(ys - blade * 0.18)} ${f(d * 0.45)},${f(ys)}Z" fill="${C.steel}" ${L()}/>`;
  s += `<path d="M0,${f(ys)} C${f(bw * 0.9)},${f(ys - blade * 0.18)} ${f(bw * 0.85)},${f(ys - blade * 0.55)} 0,${f(ht + 0.5 * cm)}Z" fill="${C.steelS}" opacity="0.45"/>`;
  s += `<path d="M0,${f(ys - 0.5 * cm)} L0,${f(ht + 2 * cm)}" stroke="#6c7378" stroke-width="${f(Math.max(0.6 * u, 0.25 * cm))}" stroke-linecap="round"/>`;
  return s;
}

function gourdSVG(u, H) {
  // hangs from (0,0): cord then the gourd, top bulb Ø 11 cm, bottom bulb Ø 16 cm, total 28 cm
  const C = COL, cm = H / 24; // reference px per cm
  const cord = 12 * cm, top = cord, r1 = 5.5 * cm, r2 = 8 * cm, neck = 2.4 * cm;
  const y1 = top + 1.5 * cm + r1, y2 = top + 28 * cm - r2;
  const L = `stroke="${C.line}" stroke-width="${f(1 * u)}" stroke-linejoin="round"`;
  let s = `<path d="M0,0 C${f(1.2 * u)},${f(cord * 0.4)} ${f(-1 * u)},${f(cord * 0.7)} 0,${f(top)}" fill="none" stroke="${C.gcord}" stroke-width="${f(1.3 * u)}"/>`;
  s += `<path d="M${f(-1.4 * cm)},${f(top + 0.4 * cm)} L${f(1.4 * cm)},${f(top + 0.4 * cm)} L${f(1.6 * cm)},${f(top + 2 * cm)} L${f(-1.6 * cm)},${f(top + 2 * cm)}Z" fill="${C.gourdD}" ${L}/>`;
  const body = `M${f(-neck)},${f(top + 1.8 * cm)} C${f(-r1 * 1.25)},${f(y1 - r1 * 0.6)} ${f(-r1 * 1.15)},${f(y1 + r1 * 0.8)} ${f(-neck * 1.1)},${f(y1 + r1 * 1.05)} C${f(-r2 * 1.35)},${f(y2 - r2 * 0.75)} ${f(-r2 * 1.2)},${f(y2 + r2 * 1.05)} 0,${f(y2 + r2)} C${f(r2 * 1.2)},${f(y2 + r2 * 1.05)} ${f(r2 * 1.35)},${f(y2 - r2 * 0.75)} ${f(neck * 1.1)},${f(y1 + r1 * 1.05)} C${f(r1 * 1.15)},${f(y1 + r1 * 0.8)} ${f(r1 * 1.25)},${f(y1 - r1 * 0.6)} ${f(neck)},${f(top + 1.8 * cm)}Z`;
  s += `<path d="${body}" fill="${C.gourd}" ${L}/>`;
  s += `<path d="M${f(neck * 0.4)},${f(top + 2.2 * cm)} C${f(r1 * 1.1)},${f(y1 - r1 * 0.5)} ${f(r1 * 1.0)},${f(y1 + r1 * 0.7)} ${f(neck * 0.6)},${f(y1 + r1 * 1.05)} C${f(r2 * 1.2)},${f(y2 - r2 * 0.7)} ${f(r2 * 1.05)},${f(y2 + r2 * 0.95)} ${f(r2 * 0.1)},${f(y2 + r2 * 0.98)} C${f(r2 * 0.75)},${f(y2 + r2 * 0.5)} ${f(r2 * 0.8)},${f(y2 - r2 * 0.4)} ${f(neck * 0.3)},${f(y1 + r1 * 1.1)} C${f(r1 * 0.7)},${f(y1 + r1 * 0.4)} ${f(r1 * 0.75)},${f(y1 - r1 * 0.4)} ${f(neck * 0.4)},${f(top + 2.2 * cm)}Z" fill="${C.gourdS}"/>`;
  s += `<path d="M${f(-neck * 1.15)},${f(y1 + r1 * 1.0)} C${f(-neck * 0.5)},${f(y1 + r1 * 1.18)} ${f(neck * 0.5)},${f(y1 + r1 * 1.18)} ${f(neck * 1.15)},${f(y1 + r1 * 1.0)}" fill="none" stroke="${C.gcord}" stroke-width="${f(1.6 * u)}"/>`;
  s += `<ellipse cx="${f(-r2 * 0.45)}" cy="${f(y2 - r2 * 0.25)}" rx="${f(r2 * 0.18)}" ry="${f(r2 * 0.32)}" fill="#e6c48c" opacity="0.7"/>`;
  return s;
}

// ------------------------------------------------------------------ cangue (团头铁叶护身枷, model_sheet §6)
// One board 90 × 42 × 3 cm, neck hole Ø13 cm 28 cm from the back end, iron plates at both ends,
// a paper seal across the join. The board is split at the hole: the board (with the hole cut out),
// then the neck coming up through the hole, then the head (beard in front). Returns { board, neck }.
function neckColour(D) {
  if (!D._neckc) {
    const p = D.parts.neck, cnt = {};
    if (p) for (const [c, d] of p.fills) cnt[c] = (cnt[c] || 0) + d.length;
    const best = Object.entries(cnt).sort((x, y) => y[1] - x[1])[0];
    D._neckc = best ? D.palette[best[0]] : COL.skinS;
  }
  return D._neckc;
}

function cangueSVG(D, view, Href, u, drop = 0) {
  const C = { wood: '#9a7048', woodT: '#a97c51', woodS: '#7a5534', woodE: '#5a3d24', iron: '#45474d', ironS: '#2c2d31', paper: '#efe9dc', red: '#c4372f', dark: '#2a1c14' };
  const cm = Href / 24, F = D.meta.face;
  const lw = Math.max(1 * u, 0.14 * cm);
  const L = (w = 1) => `stroke="#1e1612" stroke-width="${f(lw * w)}" stroke-linejoin="round" stroke-linecap="round"`;
  const skin = neckColour(D), id = uid('cg');
  let board = '', neck = '';
  if (view === 'front') {
    // seen from slightly above; the long end (62 cm) comes toward us and down
    const nx = F.chin[0], ny = F.chin[1] + drop + 0.17 * Href;        // hole centre, right under the jaw
    const hw = 21 * cm, far = ny - 4.6 * cm, near = ny + 10 * cm, th = 3 * cm;
    const hx = 6.6 * cm, hy = 2.0 * cm;                                 // hole ellipse
    const nw = 5.6 * cm;                                                // half neck width in the hole
    const top = `M${f(nx - hw)},${f(far)} C${f(nx - hw * 0.5)},${f(far - 1.2 * cm)} ${f(nx + hw * 0.5)},${f(far - 1.2 * cm)} ${f(nx + hw)},${f(far)} L${f(nx + hw * 1.07)},${f(near - 4 * cm)} C${f(nx + hw * 1.05)},${f(near + 1 * cm)} ${f(nx + hw * 0.5)},${f(near + 2 * cm)} ${f(nx)},${f(near + 2 * cm)} C${f(nx - hw * 0.5)},${f(near + 2 * cm)} ${f(nx - hw * 1.05)},${f(near + 1 * cm)} ${f(nx - hw * 1.07)},${f(near - 4 * cm)}Z`;
    const hole = `M${f(nx - hx)},${f(ny)} A${f(hx)},${f(hy)} 0 1 0 ${f(nx + hx)},${f(ny)} A${f(hx)},${f(hy)} 0 1 0 ${f(nx - hx)},${f(ny)}Z`;
    // front face (thickness) of the near end
    board += `<path d="M${f(nx - hw * 1.07)},${f(near - 4 * cm)} C${f(nx - hw * 1.05)},${f(near + 1 * cm)} ${f(nx - hw * 0.5)},${f(near + 2 * cm)} ${f(nx)},${f(near + 2 * cm)} C${f(nx + hw * 0.5)},${f(near + 2 * cm)} ${f(nx + hw * 1.05)},${f(near + 1 * cm)} ${f(nx + hw * 1.07)},${f(near - 4 * cm)} L${f(nx + hw * 1.07)},${f(near - 4 * cm + th)} C${f(nx + hw * 1.05)},${f(near + 1 * cm + th)} ${f(nx + hw * 0.5)},${f(near + 2 * cm + th)} ${f(nx)},${f(near + 2 * cm + th)} C${f(nx - hw * 0.5)},${f(near + 2 * cm + th)} ${f(nx - hw * 1.05)},${f(near + 1 * cm + th)} ${f(nx - hw * 1.07)},${f(near - 4 * cm + th)}Z" fill="${C.woodE}" ${L()}/>`;
    // top face with the hole cut out, a light grain, the join through the hole
    board += `<path fill-rule="evenodd" d="${top} ${hole}" fill="${C.wood}" ${L(1.1)}/>`;
    board += `<path d="M${f(nx - hw * 0.85)},${f(far + 3 * cm)} C${f(nx - hw * 0.4)},${f(far + 3.8 * cm)} ${f(nx - hw * 0.2)},${f(far + 2.6 * cm)} ${f(nx - hx * 1.4)},${f(far + 3.4 * cm)} M${f(nx + hx * 1.4)},${f(far + 3 * cm)} C${f(nx + hw * 0.3)},${f(far + 2.4 * cm)} ${f(nx + hw * 0.6)},${f(far + 3.6 * cm)} ${f(nx + hw * 0.88)},${f(far + 3 * cm)} M${f(nx - hw * 0.8)},${f(near - 6 * cm)} C${f(nx - hw * 0.3)},${f(near - 5 * cm)} ${f(nx + hw * 0.3)},${f(near - 6.6 * cm)} ${f(nx + hw * 0.85)},${f(near - 5.4 * cm)}" fill="none" stroke="${C.woodS}" stroke-width="${f(lw * 0.8)}" opacity="0.7"/>`;
    board += `<path d="M${f(nx)},${f(ny + hy)} L${f(nx)},${f(near + 2 * cm)} M${f(nx)},${f(ny - hy)} L${f(nx)},${f(far - 1 * cm)}" stroke="${C.woodE}" stroke-width="${f(lw)}"/>`;
    // iron plates across both ends, iron leaves on the side edges
    board += `<path d="M${f(nx - hw * 0.995)},${f(far + 0.4 * cm)} C${f(nx - hw * 0.5)},${f(far - 0.8 * cm)} ${f(nx + hw * 0.5)},${f(far - 0.8 * cm)} ${f(nx + hw * 0.995)},${f(far + 0.4 * cm)} L${f(nx + hw * 1.0)},${f(far + 2.4 * cm)} C${f(nx + hw * 0.5)},${f(far + 1.2 * cm)} ${f(nx - hw * 0.5)},${f(far + 1.2 * cm)} ${f(nx - hw * 1.0)},${f(far + 2.4 * cm)}Z" fill="${C.iron}" ${L(0.8)}/>`;
    // near-end iron plate: a narrow band along the rounded near edge, then down over the end face
    board += `<path d="M${f(nx - hw * 1.07)},${f(near - 4 * cm)} C${f(nx - hw * 1.06)},${f(near - 0.6 * cm)} ${f(nx - hw * 0.5)},${f(near + 0.3 * cm)} ${f(nx)},${f(near + 0.3 * cm)} C${f(nx + hw * 0.5)},${f(near + 0.3 * cm)} ${f(nx + hw * 1.06)},${f(near - 0.6 * cm)} ${f(nx + hw * 1.07)},${f(near - 4 * cm)} C${f(nx + hw * 1.05)},${f(near + 1 * cm)} ${f(nx + hw * 0.5)},${f(near + 2 * cm)} ${f(nx)},${f(near + 2 * cm)} C${f(nx - hw * 0.5)},${f(near + 2 * cm)} ${f(nx - hw * 1.05)},${f(near + 1 * cm)} ${f(nx - hw * 1.07)},${f(near - 4 * cm)}Z" fill="${C.iron}" ${L(0.7)}/>`;
    for (const sg of [-1, 1]) for (const t of [0.25, 0.55]) board += `<circle cx="${f(nx + sg * hw * (1.0 + 0.06 * t) - sg * 1.2 * cm)}" cy="${f(far + (near - far) * t)}" r="${f(0.55 * cm)}" fill="${C.ironS}"/>`;
    board += `<path d="M${f(nx - hw * 0.4)},${f(near + 2 * cm)} L${f(nx - hw * 0.4)},${f(near + 2 * cm + th)} M${f(nx + hw * 0.4)},${f(near + 2 * cm)} L${f(nx + hw * 0.4)},${f(near + 2 * cm + th)}" stroke="${C.ironS}" stroke-width="${f(1.6 * cm)}"/>`;
    // 封皮: paper seal across the join on the near half
    const sy = ny + 2.6 * cm;
    board += `<path d="M${f(nx - 16 * cm)},${f(sy)} L${f(nx + 16 * cm)},${f(sy - 0.4 * cm)} L${f(nx + 16.3 * cm)},${f(sy + 2.6 * cm)} L${f(nx - 15.7 * cm)},${f(sy + 3 * cm)}Z" fill="${C.paper}" ${L(0.7)}/>`;
    board += `<rect x="${f(nx + 6 * cm)}" y="${f(sy + 0.5 * cm)}" width="${f(2.4 * cm)}" height="${f(1.8 * cm)}" fill="none" stroke="${C.red}" stroke-width="${f(lw * 0.9)}"/><path d="M${f(nx - 12 * cm)},${f(sy + 1.1 * cm)} h${f(9 * cm)} M${f(nx - 12 * cm)},${f(sy + 2 * cm)} h${f(6 * cm)}" stroke="#3a3530" stroke-width="${f(lw * 0.6)}" opacity="0.5"/>`;
    // the neck rising through the hole: dark gap around it, skin column up to the chin
    board += `<path d="${hole}" fill="${C.dark}"/>`;
    neck += `<clipPath id="${id}n"><path d="M${f(nx - hw)},${f(F.chin[1] + drop - 0.3 * Href)} L${f(nx + hw)},${f(F.chin[1] + drop - 0.3 * Href)} L${f(nx + hw)},${f(ny)} L${f(nx - hw)},${f(ny)}Z ${hole}"/></clipPath>`;
    const nt = F.chin[1] + drop - 0.05 * Href, nb = ny + hy;
    neck += `<g clip-path="url(#${id}n)"><path d="M${f(nx - nw * 0.82)},${f(nt)} C${f(nx - nw * 0.84)},${f(nt + (nb - nt) * 0.5)} ${f(nx - nw * 0.95)},${f(nb - 2 * cm)} ${f(nx - nw)},${f(nb)} L${f(nx + nw)},${f(nb)} C${f(nx + nw * 0.95)},${f(nb - 2 * cm)} ${f(nx + nw * 0.84)},${f(nt + (nb - nt) * 0.5)} ${f(nx + nw * 0.82)},${f(nt)}Z" fill="${skin}"/>` +
      `<path d="M${f(nx + nw * 0.25)},${f(nt)} C${f(nx + nw * 0.35)},${f(nt + (nb - nt) * 0.5)} ${f(nx + nw * 0.5)},${f(nb - 2 * cm)} ${f(nx + nw * 0.55)},${f(nb)} L${f(nx + nw)},${f(nb)} C${f(nx + nw * 0.95)},${f(nb - 2 * cm)} ${f(nx + nw * 0.84)},${f(nt + (nb - nt) * 0.5)} ${f(nx + nw * 0.82)},${f(nt)}Z" fill="#000" opacity="0.12"/>` +
      `<path d="M${f(nx - nw * 0.82)},${f(nt)} C${f(nx - nw * 0.84)},${f(nt + (nb - nt) * 0.5)} ${f(nx - nw * 0.95)},${f(nb - 2 * cm)} ${f(nx - nw)},${f(nb)} M${f(nx + nw)},${f(nb)} C${f(nx + nw * 0.95)},${f(nb - 2 * cm)} ${f(nx + nw * 0.84)},${f(nt + (nb - nt) * 0.5)} ${f(nx + nw * 0.82)},${f(nt)}" fill="none" stroke="#a36c49" stroke-width="${f(lw * 0.9)}"/></g>`;
  } else {
    // profile (data faces left): 90 cm board, long end forward and 30° down, top face seen from a bit above
    const a = (30 * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const nx = F.ear[0] - 8 * u, ny = F.chin[1] + drop + 0.2 * Href;    // neck centre, right under the jaw
    const Q = (d, o) => [nx - d * cm * ca + o * cm * sa, ny + d * cm * sa + o * cm * ca]; // d forward, o down (cm)
    const W = 10, T = 3.2;                                               // projected top-face width, thickness
    const pth = (pts) => 'M' + pts.map(P).join(' L') + 'Z';
    const topF = `M${P(Q(-27, -W))} L${P(Q(60, -W))} C${P(Q(63, -W))} ${P(Q(63.5, 0))} ${P(Q(61, 0))} L${P(Q(-26, 0))} C${P(Q(-29, 0))} ${P(Q(-29.5, -W))} ${P(Q(-27, -W))}Z`;
    const hole = (() => { const c = Q(0, -W / 2); return `M${f(c[0] - 6.4 * cm)},${f(c[1])} A${f(6.4 * cm)},${f(3.4 * cm)} 0 1 0 ${f(c[0] + 6.4 * cm)},${f(c[1])} A${f(6.4 * cm)},${f(3.4 * cm)} 0 1 0 ${f(c[0] - 6.4 * cm)},${f(c[1])}Z`; })();
    board += `<path d="M${P(Q(-26, 0))} L${P(Q(61, 0))} C${P(Q(63.5, 0))} ${P(Q(63.5, T))} ${P(Q(61, T))} L${P(Q(-26, T))} C${P(Q(-29, T))} ${P(Q(-29, 0))} ${P(Q(-26, 0))}Z" fill="${C.woodE}" ${L()}/>`;
    board += `<g transform="rotate(${f(-30)} ${f(Q(0, -W / 2)[0])} ${f(Q(0, -W / 2)[1])})"></g>`;
    board += `<path fill-rule="evenodd" d="${topF} ${hole}" fill="${C.wood}" ${L(1.1)}/>`;
    board += `<path d="${pth([Q(-24, -W * 0.7), Q(-8, -W * 0.72)])} M${P(Q(8, -W * 0.3))} L${P(Q(52, -W * 0.28))}" fill="none" stroke="${C.woodS}" stroke-width="${f(lw * 0.8)}" opacity="0.7"/>`;
    for (const [d0, d1] of [[-26.5, -21.5], [55, 60.5]]) board += `<path d="${pth([Q(d0, -W), Q(d1, -W), Q(d1, T), Q(d0, T)])}" fill="${C.iron}" ${L(0.8)}/>` + `<circle cx="${f(Q((d0 + d1) / 2, -W / 2)[0])}" cy="${f(Q((d0 + d1) / 2, -W / 2)[1])}" r="${f(0.6 * cm)}" fill="${C.ironS}"/>`;
    board += `<path d="${pth([Q(14, -W * 0.85), Q(30, -W * 0.85), Q(30, -W * 0.2), Q(14, -W * 0.2)])}" fill="${C.paper}" ${L(0.6)}/><path d="${pth([Q(24, -W * 0.7), Q(27, -W * 0.7), Q(27, -W * 0.38), Q(24, -W * 0.38)])}" fill="none" stroke="${C.red}" stroke-width="${f(lw * 0.8)}"/>`;
    board += `<path d="${hole}" fill="${C.dark}"/>`;
    const hc = Q(0, -W / 2), nw = 6 * cm;
    neck += `<clipPath id="${id}n"><path d="M${f(hc[0] - 12 * cm)},${f(F.chin[1] + drop - 0.3 * Href)} L${f(hc[0] + 12 * cm)},${f(F.chin[1] + drop - 0.3 * Href)} L${f(hc[0] + 12 * cm)},${f(hc[1])} L${f(hc[0] - 12 * cm)},${f(hc[1])}Z ${hole}"/></clipPath>`;
    const nt = F.chin[1] + drop + 0.02 * Href, nb = hc[1] + 3.4 * cm;
    neck += `<g clip-path="url(#${id}n)"><path d="M${f(hc[0] - nw * 0.7)},${f(nt)} C${f(hc[0] - nw * 0.85)},${f((nt + nb) / 2)} ${f(hc[0] - nw)},${f(nb - 2 * cm)} ${f(hc[0] - nw)},${f(nb)} L${f(hc[0] + nw)},${f(nb)} C${f(hc[0] + nw)},${f(nb - 2 * cm)} ${f(hc[0] + nw * 0.9)},${f((nt + nb) / 2)} ${f(hc[0] + nw * 0.8)},${f(nt)}Z" fill="${skin}"/>` +
      `<path d="M${f(hc[0] - nw * 0.7)},${f(nt)} C${f(hc[0] - nw * 0.85)},${f((nt + nb) / 2)} ${f(hc[0] - nw)},${f(nb - 2 * cm)} ${f(hc[0] - nw)},${f(nb)}" fill="none" stroke="#a36c49" stroke-width="${f(lw * 0.9)}"/></g>`;
  }
  return { board, neck };
}

// ------------------------------------------------------------------ wide sleeve (costume A) on a raised forearm
// A rigid wide sleeve would point at the sky; instead the sleeve slides back to the elbow and its
// fabric hangs under gravity. Drawn in world coordinates in the traced robe colours.
function robeColours(D, PAL) {
  if (!D._robe) {
    const freq = new Array(D.palette.length).fill(0);
    for (const p of Object.values(D.parts)) for (const [c, d] of p.fills) freq[c] += d.length;
    const mem = D.palette.map((c, i) => [i, hsl(c)]).filter(([, h]) => FAM.robe(...h)).map(([i]) => i);
    const base = mem.reduce((a, b) => (freq[b] > freq[a] ? b : a));
    const byL = mem.slice().sort((a, b) => lum(D.palette[a]) - lum(D.palette[b]));
    const lb = lum(D.palette[base]);
    const shade = byL.filter((i) => lum(D.palette[i]) < lb * 0.93 && lum(D.palette[i]) > lb * 0.7).reduce((a, b) => (freq[b] > freq[a] ? b : a), byL[0]);
    const line = byL.find((i) => { const h = hsl(D.palette[i]); return h[1] > 0.15 && h[0] > 115 && h[0] < 175; }) ?? byL[0];
    D._robe = { base, shade, line };
  }
  const r = D._robe;
  return { base: PAL[r.base], shade: PAL[r.shade], line: PAL[r.line] };
}

function wideSleeve(S, E, W, H, u, RC) {
  const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const add2 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const fv = norm([W[0] - E[0], W[1] - E[1]]), nv = [-fv[1], fv[0]];
  const uv = norm([E[0] - S[0], E[1] - S[1]]), un = [-uv[1], uv[0]];
  const Lf = Math.hypot(W[0] - E[0], W[1] - E[1]);
  const Mc = add2(E, fv, 0.34 * Lf), mw = 0.2 * H, r0 = 0.19 * H;
  const rimA = add2(Mc, nv, mw), rimB = add2(Mc, nv, -mw);
  const eA = add2(E, un, r0), eB = add2(E, un, -r0);
  const back = add2(E, uv, -0.32 * H), bA = add2(back, un, r0 * 0.95), bB = add2(back, un, -r0 * 0.95);
  const L = `stroke="${RC.line}" stroke-width="${f(1.1 * u)}" stroke-linejoin="round" stroke-linecap="round"`;
  let s = '';
  // hanging drape: between the lowest anchors, down under gravity
  const anchors = [rimA, rimB, eA, eB, bA, bB].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const xl = Math.min(...anchors.map((p) => p[0])), xr = Math.max(...anchors.map((p) => p[0]));
  const left = anchors.reduce((a, b) => (b[0] < a[0] ? b : a)), right = anchors.reduce((a, b) => (b[0] > a[0] ? b : a));
  const ymax = Math.max(left[1], right[1]);
  const lean = (Mc[0] - E[0]) * 0.25;
  const bot = [(xl + xr) / 2 + lean, ymax + 0.82 * H];
  const wdt = xr - xl;
  const drape = `M${P(left)} C${f(left[0] - 0.06 * H)},${f(left[1] + 0.35 * H)} ${f(bot[0] - wdt * 0.55)},${f(bot[1] - 0.08 * H)} ${P(bot)} C${f(bot[0] + wdt * 0.45)},${f(bot[1] - 0.18 * H)} ${f(right[0] + 0.04 * H)},${f(right[1] + 0.3 * H)} ${P(right)} L${P(rimA)} L${P(rimB)} L${P(eA)} L${P(eB)} L${P(bA)} L${P(bB)}Z`;
  s += `<path d="${drape}" fill="${RC.base}" ${L}/>`;
  // inner side of the drape (shade) and the darker hem band
  s += `<path d="M${f(left[0] + wdt * 0.18)},${f(left[1] + 0.1 * H)} C${f(left[0] + wdt * 0.12)},${f(left[1] + 0.4 * H)} ${f(bot[0] - wdt * 0.3)},${f(bot[1] - 0.12 * H)} ${f(bot[0] - wdt * 0.05)},${f(bot[1] - 0.02 * H)} C${f(bot[0] - wdt * 0.15)},${f(bot[1] - 0.2 * H)} ${f(left[0] + wdt * 0.32)},${f(left[1] + 0.35 * H)} ${f(left[0] + wdt * 0.36)},${f(left[1] + 0.12 * H)}Z" fill="${RC.shade}" opacity="0.9"/>`;
  s += `<path d="M${f(bot[0] - wdt * 0.42)},${f(bot[1] - 0.1 * H)} C${f(bot[0] - wdt * 0.3)},${f(bot[1] - 0.01 * H)} ${f(bot[0] - wdt * 0.12)},${f(bot[1] + 0.01 * H)} ${P(bot)} C${f(bot[0] + wdt * 0.2)},${f(bot[1] - 0.06 * H)} ${f(bot[0] + wdt * 0.35)},${f(bot[1] - 0.12 * H)} ${f(bot[0] + wdt * 0.42)},${f(bot[1] - 0.2 * H)} L${f(bot[0] + wdt * 0.38)},${f(bot[1] - 0.26 * H)} C${f(bot[0] + wdt * 0.2)},${f(bot[1] - 0.14 * H)} ${f(bot[0])},${f(bot[1] - 0.08 * H)} ${f(bot[0] - wdt * 0.38)},${f(bot[1] - 0.16 * H)}Z" fill="${RC.line}" opacity="0.85"/>`;
  s += `<path d="M${f(left[0] + wdt * 0.5)},${f(left[1] + 0.12 * H)} C${f(left[0] + wdt * 0.48)},${f(left[1] + 0.4 * H)} ${f(bot[0] + wdt * 0.05)},${f(bot[1] - 0.3 * H)} ${f(bot[0] + wdt * 0.1)},${f(bot[1] - 0.12 * H)}" fill="none" stroke="${RC.line}" stroke-width="${f(0.9 * u)}" stroke-linecap="round" opacity="0.8"/>`;
  // sleeve over the elbow, from the upper arm end to the mouth
  const tube = `M${P(bA)} L${P(eA)} C${P(add2(eA, fv, 0.12 * H))} ${P(add2(rimA, fv, -0.1 * H))} ${P(rimA)} L${P(rimB)} C${P(add2(rimB, fv, -0.1 * H))} ${P(add2(eB, fv, 0.12 * H))} ${P(eB)} L${P(bB)}Z`;
  s += `<path d="${tube}" fill="${RC.base}" ${L}/>`;
  s += `<path d="M${P(add2(eB, un, 0.05 * H))} C${P(add2(add2(eB, un, 0.05 * H), fv, 0.12 * H))} ${P(add2(add2(rimB, nv, 0.05 * H), fv, -0.1 * H))} ${P(add2(rimB, nv, 0.05 * H))}" fill="none" stroke="${RC.shade}" stroke-width="${f(0.06 * H)}" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M${P(add2(E, un, 0.04 * H))} C${P(add2(E, fv, 0.1 * H))} ${P(add2(Mc, fv, -0.12 * H))} ${P(add2(add2(Mc, nv, 0.05 * H), fv, -0.04 * H))}" fill="none" stroke="${RC.line}" stroke-width="${f(0.8 * u)}" stroke-linecap="round" opacity="0.7"/>`;
  // mouth: dark lining, the bare forearm out of it, then the near rim
  const ang = (Math.atan2(nv[1], nv[0]) * 180) / Math.PI;
  s += `<ellipse cx="${f(Mc[0])}" cy="${f(Mc[1])}" rx="${f(mw)}" ry="${f(0.065 * H)}" transform="rotate(${f(ang)} ${f(Mc[0])} ${f(Mc[1])})" fill="${RC.line}" ${L}/>`;
  const a0 = add2(Mc, fv, -0.02 * H), w0 = 0.075 * H, w1 = 0.062 * H;
  const fa = `M${P(add2(a0, nv, w0))} L${P(add2(W, nv, w1))} C${P(add2(add2(W, nv, w1), fv, 0.04 * H))} ${P(add2(add2(W, nv, -w1), fv, 0.04 * H))} ${P(add2(W, nv, -w1))} L${P(add2(a0, nv, -w0))}Z`;
  s += `<path d="${fa}" fill="${HANDCOL.skin}" stroke="${HANDCOL.line}" stroke-width="${f(1 * u)}" stroke-linejoin="round"/>`;
  s += `<path d="M${P(add2(add2(a0, nv, -w0 * 0.55), fv, 0.03 * H))} L${P(add2(W, nv, -w1 * 0.55))}" stroke="${HANDCOL.skinS}" stroke-width="${f(0.035 * H)}" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M${P(rimA)} C${P(add2(add2(Mc, nv, mw * 0.55), fv, 0.075 * H))} ${P(add2(add2(Mc, nv, -mw * 0.55), fv, 0.075 * H))} ${P(rimB)} C${P(add2(add2(Mc, nv, -mw * 0.55), fv, 0.03 * H))} ${P(add2(add2(Mc, nv, mw * 0.55), fv, 0.03 * H))} ${P(rimA)}Z" fill="${RC.base}" ${L}/>`;
  return s;
}

function sleeveUpper(S, E, H, u, RC) {
  // a raised upper arm in a wide sleeve: tube from shoulder to elbow, the cloth sagging below it
  const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const add2 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const uv = norm([E[0] - S[0], E[1] - S[1]]);
  let un = [-uv[1], uv[0]];
  if (un[1] < 0) un = [-un[0], -un[1]]; // un points down (the side the cloth hangs on)
  const rs = 0.16 * H, re = 0.2 * H;
  const sU = add2(S, un, -rs), sD = add2(S, un, rs), eU = add2(E, un, -re), eD = add2(E, un, re);
  const sag = 0.24 * H * Math.min(1, Math.abs(uv[0]) * 1.3 + 0.2);
  const mid = add2(lerp(sD, eD, 0.62), [0, 1], sag);
  const L = `stroke="${RC.line}" stroke-width="${f(1.1 * u)}" stroke-linejoin="round" stroke-linecap="round"`;
  const a0 = (Math.atan2(uv[1], uv[0]) * 180) / Math.PI;
  let s = `<path d="M${P(sD)} A${f(rs)},${f(rs)} 0 0 1 ${P(sU)} L${P(eU)} L${P(eD)} C${P(add2(eD, [0, 1], sag * 0.5))} ${P(add2(mid, uv, 0.25 * H))} ${P(mid)} C${P(add2(mid, uv, -0.3 * H))} ${P(add2(sD, [0, 1], sag * 0.4))} ${P(sD)}Z" fill="${RC.base}"/>`;
  s += `<path d="M${P(lerp(sD, eD, 0.25))} C${P(add2(lerp(sD, eD, 0.4), [0, 1], sag * 0.7))} ${P(add2(mid, uv, -0.1 * H))} ${P(add2(mid, [0, -1], 0.04 * H))} C${P(add2(mid, uv, 0.12 * H))} ${P(add2(eD, [0, 1], sag * 0.2))} ${P(lerp(eD, eU, 0.3))}" fill="${RC.shade}" opacity="0.9"/>`;
  s += `<path d="M${P(lerp(sU, eU, 0.35))} L${P(eU)} M${P(eD)} C${P(add2(eD, [0, 1], sag * 0.5))} ${P(add2(mid, uv, 0.25 * H))} ${P(mid)} C${P(add2(mid, uv, -0.3 * H))} ${P(add2(sD, [0, 1], sag * 0.4))} ${P(lerp(sD, S, 0.3))}" fill="none" ${L}/>`;
  s += `<path d="M${P(lerp(sD, eD, 0.45))} C${P(add2(lerp(sD, eD, 0.5), [0, 1], sag * 0.5))} ${P(add2(mid, uv, 0.05 * H))} ${P(add2(mid, [0, -1], 0.02 * H))} M${P(lerp(S, E, 0.55))} C${P(lerp(S, E, 0.7))} ${P(add2(lerp(S, E, 0.8), un, 0.06 * H))} ${P(add2(lerp(S, E, 0.92), un, 0.1 * H))}" fill="none" stroke="${RC.line}" stroke-width="${f(0.8 * u)}" stroke-linecap="round" opacity="0.75"/>`;
  void a0;
  return s;
}

// ------------------------------------------------------------------ assembly
export function lin(opt = {}) {
  const view = opt.view === 'side' ? 'side' : 'front', costume = opt.costume === 'C' ? 'C' : 'A';
  const D = data(view, costume);
  const E = { ...NE, ...(opt.expr || {}) };
  const pose = { ...(opt.pose || {}) };
  const M = D.meta;
  const height = opt.height || 680;
  // the head sits a little lower than in the painting (owner: shorter neck); the figure is then
  // normalised so that skull to sole is still 7.5 H
  const H0 = (M.sole - M.chin[1]) / 6.5;
  const drop = (view === 'front' ? 0.075 : 0.05) * H0;
  const Href = (M.sole - M.chin[1] - drop) / 6.5; // reference px per head
  const k = height / 7.5 / Href;
  const flip = !!opt.flip;
  const root = mul(tr(opt.x || 0, opt.y || 0), mul(sc(flip ? -k : k, k), tr(-M.origin_x, -M.sole)));
  const u = M.face.fw / 105;
  const PAL = recolour(D, opt.col);
  if (opt.props && opt.props.spear && !pose.spear) pose.spear = opt.props.spear;
  if (pose.spear) {
    const hs = pose.spear.hand || (view === 'side' ? (flip ? 'R' : 'L') : 'R');
    if (pose[`fist${hs}`] === undefined) pose[`fist${hs}`] = true;
  }
  const O = { hat: opt.hat !== false, tattoo: opt.tattoo ?? (costume === 'C' ? 1 : 0), rings: opt.headCloth !== 'plain', cangue: !!opt.cangue };
  const ang = jointAngles(D, view, pose, flip);
  let SF = null;
  if (view === 'side') {
    const jp = D.parts.jaw, theta = jp ? -14 * Math.max(0, E.open) : 0;
    if (jp) ang.jaw = theta;
    SF = faceSide(M.face, E, { split: true, tmj: jp ? jp.pivot : null, theta });
    if (!jp) { SF.head += SF.back + SF.jaw + SF.front; SF.back = SF.jaw = SF.front = ''; }
    O.sideFace = SF;
  }
  const W = {};
  const wm = (n) => {
    if (W[n]) return W[n];
    const p = D.parts[n];
    const par = p.parent && D.parts[p.parent] ? wm(p.parent) : I;
    const a = ang[n] || 0;
    const own = a && p.pivot ? rot(a, p.pivot[0], p.pivot[1]) : I;
    W[n] = n === 'head' ? mul(par, mul(tr(0, drop), own)) : a && p.pivot ? mul(par, own) : par;
    return W[n];
  };
  const id = uid('r');
  let defs = '';
  const items = []; // [z, svg]
  const nearSide = view === 'side' ? (flip ? 'R' : 'L') : null;
  const draped = {}, handItems = {};
  const partOrder = Object.keys(D.parts).sort((a, b) => (/^hand/.test(a) ? 1 : 0) - (/^hand/.test(b) ? 1 : 0));
  for (const n of partOrder) {
    const p = D.parts[n];
    let inner = partSVG(D, n, '', PAL);
    const side = /^(arm|hand)/.test(n) ? (view === 'side' ? nearSide : n.slice(-1)) : null;
    if (n === 'head') inner = headBack(D, view, costume, E, pose, O) + inner + headExtras(D, view, costume, E, pose, O);
    if (n === 'jaw' && SF) {
      inner += SF.jaw;
      if (SF.back) items.push([D.parts.head.z + 0.1, `<g data-part="mouth" transform="${mstr(wm('head'))}">${SF.back}</g>`]);
      if (SF.front) items.push([p.z + 0.05, `<g data-part="mouthLine" transform="${mstr(wm('head'))}">${SF.front}</g>`]);
    }
    if (/^hand/.test(n) && pose[`fist${side}`]) inner = fistFor(D, n, view, Href);
    if (n === 'torso' && M.torso_clip) {
      const cid = uid('tc');
      inner = `<clipPath id="${cid}"><path d="M${M.torso_clip.map(P).join(' L')}Z"/></clipPath><g clip-path="url(#${cid})">${inner}</g>`;
    }
    let g = `<g data-part="${n}" transform="${mstr(wm(n))}">${inner}</g>`;
    let z = n === 'head' && O.cangue ? 26 : p.z;
    if (costume === 'A' && /^arm._up$/.test(n) && opt.sleeve !== 'rigid' && p.pivot) {
      const lo = D.parts[n.replace('_up', '_lo')];
      const Sw = ap(wm(n), p.pivot), Ew = ap(wm(n), lo.pivot);
      const down = (Math.acos(Math.max(-1, Math.min(1, (Ew[1] - Sw[1]) / Math.hypot(Ew[0] - Sw[0], Ew[1] - Sw[1])))) * 180) / Math.PI;
      if (down > 50) g = `<g data-part="${n}" data-sleeve="draped">${sleeveUpper(Sw, Ew, Href, u, robeColours(D, PAL))}</g>`;
    }
    if (costume === 'A' && /^arm._lo$/.test(n) && opt.sleeve !== 'rigid') {
      const hn = 'hand' + n[3];
      const Ew = ap(wm(n), p.pivot), Ww = ap(wm(n), D.parts[hn].pivot), Sw = ap(wm(D.parts[n].parent), D.parts[p.parent].pivot);
      const down = (Math.acos(Math.max(-1, Math.min(1, (Ww[1] - Ew[1]) / Math.hypot(Ww[0] - Ew[0], Ww[1] - Ew[1])))) * 180) / Math.PI;
      if (down > 55) { g = `<g data-part="${n}" data-sleeve="draped">${wideSleeve(Sw, Ew, Ww, Href, u, robeColours(D, PAL))}</g>`; draped[hn] = true; }
    }
    if (M.arm_clip && /^(arm|hand)/.test(n)) g = `<g clip-path="url(#${id}ac)">${g}</g>`;
    if (/^hand/.test(n)) handItems[n] = [z, g];
    else items.push([z, g]);
  }
  if (O.cangue) {
    // board (hole cut out) over the shoulders and arms, then the neck rising through the hole,
    // then the head and beard (raised to z 26 above both)
    const cg = cangueSVG(D, view, Href, u, drop), mt = mstr(wm(D.parts.torso ? 'torso' : 'neck'));
    items.push([25, `<g data-part="cangue" transform="${mt}">${cg.board}</g>`]);
    items.push([25.5, `<g data-part="cangueNeck" transform="${mt}">${cg.neck}</g>`]);
  }
  for (const [hn, it] of Object.entries(handItems)) items.push(draped[hn] ? [D.parts['arm' + hn.slice(-1) + '_lo'].z + 0.5, it[1]] : it);
  if (M.arm_clip) defs += `<clipPath id="${id}ac"><path clip-rule="evenodd" d="M-2000,-2000H3000V4000H-2000Z ${M.arm_clip.join(' ')}"/></clipPath>`;
  // far arm in the side view: the near arm's drawing hung from the far shoulder, darker
  if (view === 'side' && M.far) {
    const fs_ = flip ? 'L' : 'R';
    const sh = pose[`shoulder${fs_}`] ?? M.far.rest.shoulder, el = pose[`elbow${fs_}`] ?? M.far.rest.elbow;
    const up = D.parts.armL_up, lo = D.parts.armL_lo;
    const base = tr(M.far.shoulder[0] - up.pivot[0], M.far.shoulder[1] - up.pivot[1]);
    const mUp = mul(base, rot(sh, up.pivot[0], up.pivot[1]));
    const mLo = mul(mUp, rot(el, lo.pivot[0], lo.pivot[1]));
    const handInner = pose[`fist${fs_}`] ? fistFor(D, 'handL', view, Href) : partSVG(D, 'handL', '', PAL);
    const mHand = mul(mLo, rot(pose[`wrist${fs_}`] || 0, D.parts.handL.pivot[0], D.parts.handL.pivot[1]));
    defs += `<filter id="${id}dk" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="0.8"/><feFuncG type="linear" slope="0.8"/><feFuncB type="linear" slope="0.84"/></feComponentTransfer></filter>`;
    items.push([0.5, `<g data-part="farArm" filter="url(#${id}dk)"><g transform="${mstr(mUp)}">${partSVG(D, 'armL_up', '', PAL)}</g><g transform="${mstr(mLo)}">${partSVG(D, 'armL_lo', '', PAL)}</g><g transform="${mstr(mHand)}">${handInner}</g></g>`]);
    W.__farHand = mHand;
  }
  // props: spear (+ gourd) in a hand
  if (pose.spear) {
    const F = M.face, hm = costume === 'C' && F.hat && O.hat ? (view === 'front' ? hatFront(F.hat, u, false) : hatSide(F.hat, u, false)) : '';
    items.push(...spearItems(D, view, pose, W, wm, Href, u, flip, nearSide, hm.replace(/fill="[^"]*"/g, 'fill="#000"').replace(/stroke="[^"]*"/g, 'stroke="#000"')));
  }
  items.sort((a, b) => a[0] - b[0]);
  return `<g data-rig="linchong" data-view="${view}" data-costume="${costume}" transform="${mstr(root)}"><defs>${defs}</defs>${items.map((x) => x[1]).join('')}</g>`;
}

function jointAngles(D, view, pose, flip) {
  const a = {};
  if (view === 'front') {
    for (const side of ['R', 'L']) {
      const S = side === 'R' ? 1 : -1; // raising the right arm outward turns it clockwise on screen
      a[`arm${side}_up`] = S * (pose[`shoulder${side}`] || 0);
      a[`arm${side}_lo`] = S * (pose[`elbow${side}`] || 0);
      a[`hand${side}`] = S * (pose[`wrist${side}`] || 0);
    }
  } else {
    // data faces left: raising the near arm forward turns it clockwise on screen
    const ns = flip ? 'R' : 'L';
    a.armL_up = pose[`shoulder${ns}`] || 0;
    a.armL_lo = pose[`elbow${ns}`] || 0;
    a.handL = pose[`wrist${ns}`] || 0;
    const fs_ = flip ? 'L' : 'R';
    a.legNear = pose[`leg${ns}`] || 0;
    a.legFar = pose[`leg${fs_}`] || 0;
  }
  if (view === 'front') { a.legR = pose.legR || 0; a.legL = -(pose.legL || 0); }
  a.head = pose.headTilt || 0;
  return a;
}

function headBack(D, view, costume, E, pose, O) {
  const F = D.meta.face, u = F.fw / 105;
  let s = '';
  if (costume === 'A' && F.rings && view === 'front' && O.rings) s += F.rings.map((c) => jadeRing(c, u, 3.6)).join('');
  if (costume === 'C' && F.hat && view === 'front' && O.hat) s += hatFront(F.hat, u, true);

  return s;
}

function headExtras(D, view, costume, E, pose, O) {
  const F = D.meta.face, u = F.fw / 105;
  let s = '';
  const tat = F.tattoo || (view === 'front' ? [F.eyeL[0] + 6 * u, F.eyeL[1] + 22 * u] : [F.ear[0] - 40 * u, F.ear[1] + 38 * u]);
  if (view === 'front') {
    s += faceFront(F, E, { turn: pose.headTurn || 0 });
    if (O.tattoo > 0) s += `<g opacity="${f(Math.min(1, O.tattoo))}">${tattoo([tat[0] + (pose.headTurn || 0) * 8 * u, tat[1]], u)}</g>`;
    if (costume === 'C' && F.hat && O.hat) s += cordFront(F, u, E) + hatFront(F.hat, u, false);
    if (costume === 'C' && F.hat && !O.hat) s += hairCap(F, view, u);
  } else {
    s += O.sideFace ? O.sideFace.head : faceSide(F, E, {});
    if (costume === 'A' && F.rings && O.rings) s += F.rings.map((c) => jadeRing(c, u, 3.8)).join('');
    if (O.tattoo > 0) s += `<g opacity="${f(Math.min(1, O.tattoo))}">${tattoo(tat, u)}</g>`;
    if (costume === 'C' && F.hat && O.hat) s += cordSide(F, u, E) + hatSide(F.hat, u, false);
    if (costume === 'C' && F.hat && !O.hat) s += hairCap(F, view, u);
  }
  // face box for the frame checker
  const pts = view === 'front' ? [...F.jaw, F.browR[1], F.browL[1], F.chin] : [...F.jaw, F.brow[0], F.brow[1], F.nose, F.chin];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs) - 4 * u, x1 = Math.max(...xs) + 4 * u, y0 = Math.min(...ys) - 12 * u, y1 = Math.max(...ys) + 8 * u;
  s += `<rect data-face="1" x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" fill="none"/>`;
  return s;
}

function handAxis(D, n) {
  // wrist pivot and the forearm direction (elbow -> wrist) in rest coordinates
  const h = D.parts[n], lo = D.parts[D.parts[n].parent];
  const dx = h.pivot[0] - lo.pivot[0], dy = h.pivot[1] - lo.pivot[1], l = Math.hypot(dx, dy);
  return { p: h.pivot, ang: (Math.atan2(dy, dx) * 180) / Math.PI - 90, dir: [dx / l, dy / l] };
}

function fistFor(D, n, view, Href) {
  const ax = handAxis(D, n), w = 0.3 * Href;
  const mirror = view === 'front' ? n.endsWith('L') : false;
  return `<g transform="translate(${f(ax.p[0])},${f(ax.p[1])}) rotate(${f(ax.ang)})">${fistShape(w, mirror)}</g>`;
}

function spearItems(D, view, pose, W, wm, Href, u, flip, nearSide, headMaskExtra = '') {
  const sp = pose.spear, side = sp.hand || (view === 'side' ? nearSide : 'R');
  let hn = view === 'side' ? 'handL' : `hand${side}`;
  let hm = view === 'side' && side !== nearSide ? W.__farHand : wm(hn);
  if (!hm) return [];
  const ax = handAxis(D, hn), w = 0.3 * Href;
  const gripLocal = [ax.p[0] + ax.dir[0] * 0.72 * w, ax.p[1] + ax.dir[1] * 0.72 * w];
  const g = ap(hm, gripLocal);
  const Lr = (2.3 / 1.8) * 7.5 * Href; // 2.30 m
  const gr = sp.grip ?? 0.42;
  // degrees from vertical. Side view: + tips the spear forward (toward the face), 90 = level
  // thrust, negative = tip back over the shoulder. Front view: + leans the tip to the viewer's right.
  const angle = view === 'side' ? -(sp.angle ?? 0) : sp.angle ?? 0;
  const m = mul(tr(g[0], g[1]), mul(rot(angle), tr(0, gr * Lr)));
  let s = `<g data-part="spear" transform="${mstr(m)}">${spearSVG(Lr, u, Href)}</g>`;
  const behind = sp.behindHead ?? (view === 'front' ? true : (sp.angle ?? 0) < 0);
  if (behind && D.parts.head) {
    const mid = uid('m'), hp = D.parts.head;
    const sil = hp.fills.map(([, d]) => `<path d="${d}"/>`).join('');
    s = `<mask id="${mid}" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="9000" height="9000"><rect x="-3000" y="-3000" width="9000" height="9000" fill="#fff"/><g fill="#000" transform="${mstr(W.head || wm('head'))}">${sil}${headMaskExtra}</g></mask><g mask="url(#${mid})">${s}</g>`;
  }
  if (sp.gourd !== false) {
    const hang = ap(m, [0, -(Lr - 31 * (Href / 24))]);
    s += `<g data-part="gourd" transform="translate(${f(hang[0])},${f(hang[1])})">${gourdSVG(u, Href)}</g>`;
  }
  const zHand = view === 'side' && side !== nearSide ? 0.45 : D.parts[hn].z;
  return [[zHand - 0.05, s]];
}

export function sheetSVG(body, w, h, bg = '#efe9df') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${bg}"/>${body}</svg>`;
}
