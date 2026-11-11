// shz02 engine core: maths, noise, SVG helpers, the silhouette filters, parallax layers, bakes.
// One look for the whole film (brief.md): ink-wash landscape in depth + solid ink silhouettes with a rim light.
import fs from 'fs';
export const W = 1920, H = 1080, FPS = 30;
export const CACHE = '/dev/shm/shz02/bake';
export const f2 = (n) => (Math.round(n * 100) / 100).toString();
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const DEG = Math.PI / 180;
export const E = {
  in: (x) => x * x * x, out: (x) => 1 - Math.pow(1 - x, 3), io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  sine: (x) => 0.5 - 0.5 * Math.cos(Math.PI * x), back: (x) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2),
};
export const ramp = (t, a, b, e = E.io) => (b <= a ? (t >= b ? 1 : 0) : e(clamp((t - a) / (b - a))));
export function rng(seed = 1) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const hash = (n, seed) => { const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
export function noise1(x, seed = 0) { const i = Math.floor(x), u = x - i, s = u * u * (3 - 2 * u); return lerp(hash(i, seed), hash(i + 1, seed), s) * 2 - 1; }
export const fbm = (x, seed = 0) => noise1(x, seed) * 0.6 + noise1(x * 2.13, seed + 3) * 0.28 + noise1(x * 4.3, seed + 7) * 0.12;
/** keyframes: [[t, v], ...] -> value (numbers or arrays), eased between keys */
export function kf(t, keys, e = E.io) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [t0, a] = keys[i - 1], [t1, b] = keys[i], k = (keys[i][2] || e)((t - t0) / (t1 - t0));
    return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], k)) : lerp(a, b, k);
  }
  return keys[keys.length - 1][1];
}
/** pose interpolation: objects of numbers */
export const mixPose = (a, b, k) => { const o = { ...a }; for (const key of Object.keys(b)) o[key] = typeof b[key] === 'number' ? lerp(a[key] ?? b[key], b[key], k) : b[key]; return o; };

// ---------------------------------------------------------------- paths
export const P = (p) => `${f2(p[0])},${f2(p[1])}`;
/** closed smooth path through points (Catmull-Rom -> cubic Bezier) */
export function smooth(pts, closed = true, k = 0.5) {
  const n = pts.length; if (n < 2) return '';
  const g = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += ` C${P([p1[0] + (p2[0] - p0[0]) * k / 3, p1[1] + (p2[1] - p0[1]) * k / 3])} ${P([p2[0] - (p3[0] - p1[0]) * k / 3, p2[1] - (p3[1] - p1[1]) * k / 3])} ${P(p2)}`;
  }
  return d + (closed ? 'Z' : '');
}
export const poly = (pts) => 'M' + pts.map(P).join('L') + 'Z';
/** tapered capsule from a (radius ra) to b (radius rb): the hull of two circles */
export function capsule(a, b, ra, rb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
  if (d < 1e-3 || d <= Math.abs(ra - rb)) { const r = Math.max(ra, rb), c = ra > rb ? a : b; return `M${f2(c[0] - r)},${f2(c[1])}a${f2(r)},${f2(r)} 0 1,0 ${f2(2 * r)},0a${f2(r)},${f2(r)} 0 1,0 ${f2(-2 * r)},0Z`; }
  const th = Math.atan2(dy, dx), al = Math.acos(clamp((ra - rb) / d, -1, 1));
  const pt = (c, r, ang) => [c[0] + r * Math.cos(ang), c[1] + r * Math.sin(ang)];
  const a1 = pt(a, ra, th + al), a2 = pt(a, ra, th - al), b1 = pt(b, rb, th + al), b2 = pt(b, rb, th - al);
  return `M${P(a1)}L${P(b1)}A${f2(rb)},${f2(rb)} 0 ${al > Math.PI / 2 ? 1 : 0},0 ${P(b2)}L${P(a2)}A${f2(ra)},${f2(ra)} 0 ${al < Math.PI / 2 ? 1 : 0},0 ${P(a1)}Z`;
}
export const circle = (c, r) => `M${f2(c[0] - r)},${f2(c[1])}a${f2(r)},${f2(r)} 0 1,0 ${f2(2 * r)},0a${f2(r)},${f2(r)} 0 1,0 ${f2(-2 * r)},0Z`;
/** point from a base point, an angle (deg, 0 = +x, 90 = down) and a length */
export const polar = (p, deg, len) => [p[0] + Math.cos(deg * DEG) * len, p[1] + Math.sin(deg * DEG) * len];
/** local frame: origin o, x axis at angle deg -> maps [u, v] to world */
export const frame = (o, deg) => { const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG); return (u, v) => [o[0] + u * c - v * s, o[1] + u * s + v * c]; };

// ---------------------------------------------------------------- gradients, filters
export const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, units = '') =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${units}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('')}</linearGradient>`;
export const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5, units = '') =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" ${units}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('')}</radialGradient>`;
const USED = new Map();
/** silhouette filter: fill colour + a rim of light on the side the light comes from (dx, dy = direction TO the light) */
export function silFilter(col, rim, dx = -3, dy = -3, soft = 0.6, rimOp = 1) {
  const id = 'sil' + [col, rim, dx, dy, soft, rimOp].join('_').replace(/[^a-zA-Z0-9]/g, '');
  if (!USED.has(id)) USED.set(id, `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">` +
    `<feFlood flood-color="${col}" result="c"/><feComposite in="c" in2="SourceAlpha" operator="in" result="body"/>` +
    (rim ? `<feOffset in="SourceAlpha" dx="${-dx}" dy="${-dy}" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="edge"/>` +
      `<feGaussianBlur in="edge" stdDeviation="${soft}" result="eb"/><feFlood flood-color="${rim}" flood-opacity="${rimOp}"/><feComposite in2="eb" operator="in" result="rimc"/>` +
      `<feComposite in="rimc" in2="SourceAlpha" operator="in" result="rimin"/><feMerge><feMergeNode in="body"/><feMergeNode in="rimin"/></feMerge>` : '') + `</filter>`);
  return id;
}
export function blurFilter(sd) { const id = 'bl' + String(sd).replace('.', '_'); if (!USED.has(id)) USED.set(id, `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}"/></filter>`); return id; }
export function defsOnce(id, svg) { if (!USED.has(id)) USED.set(id, svg); return id; }
export function flushDefs() { const s = [...USED.values()].join(''); USED.clear(); return s; }

// ---------------------------------------------------------------- camera / parallax
/** layer at depth d (0 = far … 1 = subject plane, >1 = foreground) under camera {x, y, z}: content in world px */
export function layer(cam, d, content, o = {}) {
  const z = 1 + (cam.z - 1) * (o.zk ?? Math.min(1.25, 0.35 + 0.65 * d));
  const tx = 960 - (960 + cam.x * d) * z, ty = 540 - (540 + cam.y * d) * z;
  const filt = o.blur ? ` filter="url(#${blurFilter(o.blur)})"` : '';
  return `<g transform="translate(${f2(tx)} ${f2(ty)}) scale(${f2(z * 1000) / 1000})"${filt}${o.op !== undefined ? ` opacity="${f2(o.op)}"` : ''}>${content}</g>`;
}

// ---------------------------------------------------------------- bakes (static heavy layers -> PNG once)
export const BAKES = new Map();
export function bake(key, w, h, inner) {
  const file = `${CACHE}/${key}.png`;
  if (!fs.existsSync(file) && !BAKES.has(file)) {
    const content = typeof inner === 'function' ? inner() : inner;   // registers its filters in USED
    BAKES.set(file, { w, h, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${[...USED.values()].join('')}</defs>${content}</svg>` });
  }
  return (x = 0, y = 0, extra = '') => `<image href="file://${file}" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
}
