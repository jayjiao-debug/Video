// 林冲 film engine: shared helpers. Every take returns an SVG string for one frame (1920x1080, global time t in s).
// Conventions (storyboard_v3 §3): a layer has a parallax depth d (0 sky .. 1 subject .. 1.6 foreground).
// Camera c = {x, y, zoom}: per layer translate(-x*d, -y*d) then scale about the frame centre by 1 + (zoom-1)*d.
import crypto from 'crypto';
import fs from 'fs';

export const W = 1920, H = 1080, FPS = 30, DUR = 148.5, NF = 4455;
export const ROOT = '/dev/shm/shz01/film';           // render-time assets (never committed)
export const BAKE_DIR = `${ROOT}/bake`;
export const ASSET = `${ROOT}/assets`;
export const furl = (p) => 'file://' + p;
export const LINE = '#2A1C17', INK = '#17120E', PAPER = '#F1E4C6', SEAL = '#B3302A', GOLD = '#C9A45C';

// ---------------------------------------------------------------- numbers
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const mix = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k));
export const f2 = (n) => (Math.round(n * 100) / 100).toString();
export const E = {
  lin: (x) => x,
  inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out: (x) => 1 - Math.pow(1 - x, 3),
  in: (x) => x * x * x,
  sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
/** 0..1 progress of t through [a, b] with easing. */
export const ramp = (t, a, b, ease = E.inOut) => (b <= a ? (t >= b ? 1 : 0) : ease(clamp((t - a) / (b - a))));
/** Piecewise keyframes: keys = [[t, v], ...] (v number or array); ease per segment. */
export function kf(t, keys, ease = E.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0, e0] = keys[i - 1], [t1, v1] = keys[i];
      return mix(v0, v1, (keys[i][2] || ease)(clamp((t - t0) / (t1 - t0))));
    }
  }
  return keys[keys.length - 1][1];
}
/** Exponential (constant-ratio) zoom between z0 and z1 over [a, b]. */
export const zexp = (t, a, b, z0, z1, ease = E.inOut) => z0 * Math.pow(z1 / z0, ramp(t, a, b, ease));
/** A short bump 0 -> 1 -> 0 around a hit (for squash/shake). */
export const pulse = (t, at, dur) => (t < at || t > at + dur ? 0 : Math.sin(((t - at) / dur) * Math.PI));
/** Shake offset (deterministic), only for the element that hits. */
export const shake = (t, at, frames = 3, amp = 3, seed = 1) => {
  const k = (t - at) * FPS;
  if (k < 0 || k > frames) return [0, 0];
  const fall = 1 - k / frames;
  return [Math.sin(k * 7.3 + seed) * amp * fall, Math.cos(k * 5.1 + seed * 2) * amp * fall];
};
export function rng(seed = 1) {
  let s = (Math.abs(seed) * 2654435761) % 4294967296 || 1;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}
/** Smooth 1D value noise in [-1, 1]. */
export function noise1(x, seed = 0) {
  const h = (i) => { const v = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return (v - Math.floor(v)) * 2 - 1; };
  const i = Math.floor(x), fr = x - i, u = fr * fr * (3 - 2 * fr);
  return lerp(h(i), h(i + 1), u);
}
export const fbm1 = (x, seed = 0) => noise1(x, seed) * 0.6 + noise1(x * 2.1, seed + 3) * 0.3 + noise1(x * 4.3, seed + 7) * 0.1;

// ---------------------------------------------------------------- camera and layers
export const CAM0 = { x: 0, y: 0, zoom: 1 };
let FID = 0;
const BLURS = new Map();
/** Gaussian blur filter id for a std deviation (rounded to 0.5 px), collected into defs by the film. */
export function blurId(sd) {
  const k = Math.round(sd * 2) / 2;
  if (k <= 0.25) return null;
  const id = `bl${String(k).replace('.', '_')}`;
  BLURS.set(id, k);
  return id;
}
export function blurDefs() {
  let s = '';
  for (const [id, k] of BLURS) s += `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${k}"/></filter>`;
  BLURS.clear();
  return s;
}
/**
 * One parallax layer. c = camera, d = depth. opts: {id, z, blur (px), focusD, blurK, bleed, op, extra}
 * Depth blur = blurK * |d - focusD| unless an explicit blur is given.
 */
export function L(c, d, content, opts = {}) {
  const s = 1 + ((c.zoom || 1) - 1) * d;
  const x = (c.x || 0) * d, y = (c.y || 0) * d;
  const rot = c.rot ? ` rotate(${f2(c.rot * d)})` : '';
  let blur = opts.blur;
  if (blur == null && c.blurK) blur = c.blurK * Math.abs(d - (c.focusD ?? 1));
  const fid = blur ? blurId(blur) : null;
  const tf = `translate(960 540) scale(${f2(s * 1000) / 1000})${rot} translate(${f2(-960 - x)} ${f2(-540 - y)})`;
  const attrs = [`data-layer="${opts.id || 'l' + FID++}"`, `data-z="${opts.z ?? Math.round(d * 100)}"`, `data-depth="${d}"`];
  if (opts.bleed) attrs.push(`data-bleed="${opts.bleed}"`);
  const op = opts.op != null && opts.op < 1 ? ` opacity="${f2(opts.op)}"` : '';
  const inner = fid ? `<g filter="url(#${fid})">${content}</g>` : content;
  return `<g ${attrs.join(' ')} transform="${tf}"${op}>${inner}</g>`;
}
/** Screen point of a world point (layer depth d) under camera c. */
export function toScreen(c, d, p) {
  const s = 1 + ((c.zoom || 1) - 1) * d;
  return [(p[0] - (c.x || 0) * d - 960) * s + 960, (p[1] - (c.y || 0) * d - 540) * s + 540];
}
/** World point that lands on screen point q for layer depth d. */
export function toWorld(c, d, q) {
  const s = 1 + ((c.zoom || 1) - 1) * d;
  return [(q[0] - 960) / s + 960 + (c.x || 0) * d, (q[1] - 540) / s + 540 + (c.y || 0) * d];
}
/** Camera that frames world point p (at depth 1) at screen point q with zoom z. */
export function camAt(p, q = [960, 540], z = 1, extra = {}) {
  // (p - x - 960) * z + 960 = q  ->  x = p - 960 - (q - 960) / z
  return { x: p[0] - 960 - (q[0] - 960) / z, y: p[1] - 540 - (q[1] - 540) / z, zoom: z, ...extra };
}

// ---------------------------------------------------------------- baking static layers to PNG
// bake(name, w, h, svgInner) -> <image> of a cached transparent PNG. The renderer collects BAKES in a dry pass.
export const BAKES = new Map();
export function bake(name, w, h, inner, opts = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${opts.vb || `0 0 ${w} ${h}`}"><defs>${opts.defs || ''}</defs>${inner}</svg>`;
  const hash = crypto.createHash('md5').update(svg).digest('hex').slice(0, 10);
  const file = `${BAKE_DIR}/${name}_${hash}.png`;
  if (!fs.existsSync(file)) BAKES.set(file, { svg, w, h, scale: opts.scale || 1 });
  const x = opts.x || 0, y = opts.y || 0;
  return `<image href="${furl(file)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>`;
}

// ---------------------------------------------------------------- gradients and common shapes
export const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
export const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5, extra = '') =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" ${extra}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
export const rect = (x, y, w, h, fill, extra = '') => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${fill}" ${extra}/>`;
export const full = (fill, op = 1) => `<rect x="-200" y="-200" width="2320" height="1480" fill="${fill}"${op < 1 ? ` opacity="${f2(op)}"` : ''}/>`;
/** A closed smooth blob through points (Catmull-Rom). */
export function smooth(pts, closed = true, k = 0.5) {
  const n = pts.length, P = (i) => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  let d = `M${f2(pts[0][0])},${f2(pts[0][1])}`;
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) * k) / 3, p1[1] + ((p2[1] - p0[1]) * k) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * k) / 3, p2[1] - ((p3[1] - p1[1]) * k) / 3];
    d += ` C${f2(c1[0])},${f2(c1[1])} ${f2(c2[0])},${f2(c2[1])} ${f2(p2[0])},${f2(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
/** Ink-wash mountain ridge path across [x0, x1] at base y with height h. */
export function ridge(seed, x0, x1, y, h, bottom = 1400, step = 24) {
  const pts = [];
  for (let x = x0; x <= x1 + step; x += step) {
    const n = fbm1(x / 380, seed) * 0.7 + fbm1(x / 120, seed + 9) * 0.3;
    pts.push([x, y - h * (0.55 + 0.45 * n)]);
  }
  return `M${x0},${bottom} ` + pts.map((p) => `L${f2(p[0])},${f2(p[1])}`).join(' ') + ` L${x1 + step},${bottom}Z`;
}

// ---------------------------------------------------------------- particles (deterministic in t, wrap in screen space)
/**
 * Snow band. o: {seed, n, d (depth, for parallax drift with camera), r:[min,max], fall (px/s), slant (deg),
 * sway, color, op, blur, area:[x0,y0,x1,y1] (screen), cam}
 * Returns plain shapes in SCREEN coordinates (put it outside camera layers, or in a layer with zoom 1).
 */
export function snow(t, o = {}) {
  const R = rng(o.seed || 7), n = o.n ?? 80, [rmin, rmax] = o.r || [2, 5];
  const [ax0, ay0, ax1, ay1] = o.area || [-60, -60, W + 60, H + 60];
  const aw = ax1 - ax0, ah = ay1 - ay0;
  const fall = o.fall ?? 90, sl = Math.tan(((o.slant || 0) * Math.PI) / 180);
  const cam = o.cam || CAM0, d = o.d ?? 1;
  const zs = 1 + ((cam.zoom || 1) - 1) * d;
  let s = '';
  for (let i = 0; i < n; i++) {
    const x0 = R() * aw, y0 = R() * ah, r = rmin + R() * (rmax - rmin), v = fall * (0.7 + R() * 0.6) * (r / rmax * 0.5 + 0.5);
    const ph = R() * 6.28, sw = (o.sway ?? 14) * (0.5 + R());
    const y = (((y0 + v * t - (cam.y || 0) * d) % ah) + ah) % ah;
    const x = (((x0 + y * sl + Math.sin(t * 1.3 + ph) * sw - (cam.x || 0) * d) % aw) + aw) % aw;
    s += `<circle cx="${f2(ax0 + x)}" cy="${f2(ay0 + y)}" r="${f2(r * zs)}"/>`;
  }
  const fid = o.blur ? blurId(o.blur) : null;
  return `<g data-layer="snow${o.seed || 7}" data-z="${o.z ?? 500}" data-bleed="all" fill="${o.color || '#fff'}" opacity="${o.op ?? 0.9}"${fid ? ` filter="url(#${fid})"` : ''}>${s}</g>`;
}
/** Dust motes drifting in a light shaft (screen coords). */
export function motes(t, o = {}) {
  const R = rng(o.seed || 3), n = o.n ?? 30, [x0, y0, x1, y1] = o.area || [0, 0, W, H];
  let s = '';
  for (let i = 0; i < n; i++) {
    const bx = x0 + R() * (x1 - x0), by = y0 + R() * (y1 - y0), r = 1 + R() * (o.rmax || 2.5), ph = R() * 6.28;
    const x = bx + Math.sin(t * 0.35 + ph) * 26 + t * (o.vx || 4), y = by + Math.cos(t * 0.27 + ph * 1.3) * 18 - t * (o.vy || 3);
    const xx = x0 + ((((x - x0) % (x1 - x0)) + (x1 - x0)) % (x1 - x0)), yy = y0 + ((((y - y0) % (y1 - y0)) + (y1 - y0)) % (y1 - y0));
    s += `<circle cx="${f2(xx)}" cy="${f2(yy)}" r="${f2(r)}" opacity="${f2(0.25 + 0.6 * Math.abs(Math.sin(t * 0.8 + ph)))}"/>`;
  }
  return `<g data-layer="motes${o.seed || 3}" data-z="600" data-bleed="all" fill="${o.color || '#FFF4DC'}" opacity="${o.op ?? 0.7}">${s}</g>`;
}
/** Rising embers/sparks (screen or world coords as you place them). */
export function embers(t, o = {}) {
  const R = rng(o.seed || 11), n = o.n ?? 40, [x0, y0, x1, y1] = o.area || [0, 300, W, H];
  const life = o.life || 2.2;
  let s = '';
  for (let i = 0; i < n; i++) {
    const bx = x0 + R() * (x1 - x0), off = R() * life, sp = (o.speed || 160) * (0.6 + R() * 0.8), ph = R() * 6.28, r = 1.2 + R() * (o.rmax || 3);
    const a = ((t + off) % life) / life;
    const x = bx + Math.sin((t + off) * 2.3 + ph) * 22 + a * (o.drift || 30), y = y1 - a * sp * life;
    if (y < y0) continue;
    const op = Math.sin(a * Math.PI) * (0.6 + 0.4 * Math.sin(t * 13 + ph));
    s += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r * (1 - a * 0.5))}" fill="${a < 0.5 ? '#FFE3A3' : '#FF8A3D'}" opacity="${f2(op)}"/>`;
  }
  return `<g data-layer="embers${o.seed || 11}" data-z="${o.z ?? 550}" data-bleed="all">${s}</g>`;
}
/** A field of flame tongues along a base line [x0, x1] at y, height h (world coords). */
export function flames(t, o = {}) {
  const { x0 = 0, x1 = W, y = 900, h = 300, n = 14, seed = 5 } = o;
  const cols = o.cols || ['#E04A1F', '#FF7A2E', '#FFB15E', '#FFE3A3'];
  let s = '';
  cols.forEach((col, li) => {
    const R = rng(seed + li * 13), sc = 1 - li * 0.2;
    for (let i = 0; i < n; i++) {
      const cx = lerp(x0, x1, (i + 0.5 + (R() - 0.5) * 0.6) / n), w = ((x1 - x0) / n) * (1.3 - li * 0.15) * (0.8 + R() * 0.4);
      const ph = R() * 10, hh = h * sc * (0.55 + 0.45 * (0.5 + 0.5 * noise1(t * 2.2 + ph, seed + i)));
      const sway = noise1(t * 3.1 + ph, seed + 50 + i) * w * 0.35;
      const tipx = cx + sway, tipy = y - hh;
      s += `<path d="M${f2(cx - w / 2)},${f2(y)} C${f2(cx - w * 0.55)},${f2(y - hh * 0.45)} ${f2(tipx - w * 0.2)},${f2(y - hh * 0.75)} ${f2(tipx)},${f2(tipy)} C${f2(tipx + w * 0.2)},${f2(y - hh * 0.75)} ${f2(cx + w * 0.55)},${f2(y - hh * 0.45)} ${f2(cx + w / 2)},${f2(y)}Z" fill="${col}"/>`;
    }
  });
  return s;
}

// ---------------------------------------------------------------- paper, ink, calligraphy
export const XIUSHU = ['东京八十万禁军教头林冲', '为因身犯重罪断配沧州', '去后存亡不保有妻张氏', '年少情愿立此休书任从', '改嫁永无争执委是自行', '情愿即非相逼'];
/** Vertical brush text column (right-to-left columns). Returns text elements; font Ma Shan Zheng. */
export function vtext(str, x, y, fs, o = {}) {
  const sp = o.sp || fs * 1.08;
  return [...str].map((ch, i) => `<text x="${f2(x)}" y="${f2(y + i * sp)}" font-family="${o.font || 'Ma Shan Zheng'}" font-size="${f2(fs)}" fill="${o.fill || INK}" text-anchor="middle" dominant-baseline="hanging"${o.op != null ? ` opacity="${f2(o.op)}"` : ''}>${ch}</text>`).join('');
}
/**
 * A brush reveal mask for one glyph box: progress p 0..1 wipes in direction dir ('down'|'right'|'left'|'up')
 * with a soft edge. Returns {defs, attr} — wrap the glyph in <g mask="url(#id)">.
 */
let MID = 0;
export function wipeMask(x, y, w, h, p, dir = 'down', soft = 0.18) {
  const id = `wm${MID++}`;
  const g = { down: [0, 0, 0, 1], up: [0, 1, 0, 0], right: [0, 0, 1, 0], left: [1, 0, 0, 0] }[dir];
  const a = clamp(p * (1 + soft)) - soft, b = a + soft;
  const defs = `<linearGradient id="${id}g" x1="${g[0]}" y1="${g[1]}" x2="${g[2]}" y2="${g[3]}"><stop offset="${f2(clamp(a))}" stop-color="#fff"/><stop offset="${f2(clamp(b))}" stop-color="#000"/></linearGradient>` +
    `<mask id="${id}" maskUnits="userSpaceOnUse" x="${f2(x - 20)}" y="${f2(y - 20)}" width="${f2(w + 40)}" height="${f2(h + 40)}"><rect x="${f2(x - 20)}" y="${f2(y - 20)}" width="${f2(w + 40)}" height="${f2(h + 40)}" fill="url(#${id}g)"/></mask>`;
  return { defs, id, attr: `mask="url(#${id})"` };
}
/** A red palm print (open hand, 手模) centred at (cx, cy), height hgt, rotation rot. */
export function palmPrint(cx, cy, hgt, rot = 0, op = 1, col = SEAL) {
  const k = hgt / 360;
  const fing = [[-78, -120, 26, 120, -14], [-28, -168, 25, 150, -4], [22, -172, 25, 156, 3], [68, -150, 23, 132, 10]];
  let s = `<path d="M-95,-40 C-110,40 -90,120 -40,165 C0,190 60,185 90,140 C118,95 112,10 100,-50 C70,-75 -60,-78 -95,-40Z"/>`;
  for (const [x, y, w, h, a] of fing) s += `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" transform="rotate(${a} ${x} ${y + h})"/>`;
  s += `<rect x="-18" y="-25" width="30" height="120" rx="15" transform="rotate(-52 -100 60) translate(-100 10)"/>`;
  // skin texture lines cut out of the print
  let lines = '';
  const R = rng(3);
  for (let i = 0; i < 26; i++) {
    const y = -60 + i * 9 + R() * 4, x0 = -95 + R() * 20, x1 = 95 - R() * 20;
    lines += `<path d="M${f2(x0)},${f2(y)} Q0,${f2(y + 6 + R() * 6)} ${f2(x1)},${f2(y + R() * 4)}" stroke="#F1E4C6" stroke-width="1.6" fill="none" opacity="0.35"/>`;
  }
  return `<g transform="translate(${f2(cx)} ${f2(cy)}) rotate(${rot}) scale(${f2(k)})" opacity="${f2(op)}"><g fill="${col}">${s}</g>${lines}</g>`;
}
/** The J seal (owner's red hand-pressed J). */
export const JSEAL = '/home/claude/video/docs/history-video-style/jseal.png';
export const jseal = (cx, cy, size, rot = -6, op = 0.9) =>
  `<image href="${furl(JSEAL)}" x="${f2(cx - size / 2)}" y="${f2(cy - size / 2)}" width="${f2(size)}" height="${f2(size)}" opacity="${f2(op)}" transform="rotate(${rot} ${f2(cx)} ${f2(cy)})"/>`;
/** Paper fibre overlay (static, multiply). */
export const fibre = (op = 0.06) => `<image href="${furl(ASSET + '/fibre.png')}" x="0" y="0" width="1920" height="1080" opacity="${op}" style="mix-blend-mode:multiply"/>`;
