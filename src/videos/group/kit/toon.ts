// Friends film kit: copied from vasa/toon.ts (the Vasa construction: superellipse heads, bean torsos, single-stroke
// limbs, thick-thin plum outline, painted crescents) and extended at the bottom of this file with the modern adult cast
// of 你的朋友，有几个也把你当朋友？ (outfits, hair, glasses, lanyard, 你 tag, an IK pose rig with front / side / back
// views, lying poses, props and pop-up fx). The Vasa part above the FRIENDS section is kept as it was, apart from the
// extra expressions (sad, deadpan, sleep, huff, happy) and the closed-eye kind they use.
// Original Vasa header: our own flat 2D cartoon cast (riflemen, officer, townsfolk, kid, parent) + 2D effects, drawn on a canvas.
// Construction v2 (characters.md, our own cast): superellipse heads (pointed crown 1.75 / full jaw 2.3, chin taper,
// seeded side bulge + tilt), bean torsos, single-stroke limbs with ink-dot hands, a thick-thin plum outline weighted
// away from the light, soft painted crescents, deadpan lidded eyes, no blush, no catchlights.
// Design space 600 x 1000 units (soles at y = 975); the canvas transform scales it.
export const INK = "#241726";
export const SKIN = "#ffe2c2";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
type C3 = [number, number, number];
const SH_SKIN: C3 = [0.96, 0.86, 0.84]; // measured shadow/lit ratio on skin heads
const SH_CLOTH: C3 = [0.64, 0.66, 0.74]; // torsos: lit side -> far side ~0.65
const SH_FELT: C3 = [0.62, 0.62, 0.7];

export type Build = "adult" | "stout" | "kid";
export type Outfit = {
  jacket: string; pants: string; boots: string; hat?: string | null; hatMax?: number; belt?: string | null; buttons?: string; rifle?: boolean;
  sash?: string; sword?: boolean; moustache?: string; skin?: string; head?: number; cap?: string; hair?: string; dress?: string; plume?: string;
  /** wide-hat size (promotion gag) and a medal on the chest */
  hatK?: number; medal?: boolean;
  /** horizontal stripes over the jacket colour (sailor shirt) */
  stripes?: string;
  build?: Build;
};
type P2 = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mul = (c: string, m: C3) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number, k: number) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255, m[0])}${ch((n >> 8) & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c: string, k: number) => mul(c, [k, k, k]);
export const mix = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
/** deterministic per-character random in [0, 1) */
const rnd = (seed: number, k: number) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const rotPts = (pts: P2[], a: number, cx: number, cy: number): P2[] =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const rotAbout = (q: P2, a: number, c: P2): P2 => rotPts([q], a, c[0], c[1])[0];
const lerp2 = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** smooth curve from a through (near) k to b, as a polyline */
const curve = (a: P2, k: P2, b: P2, n = 10): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};
/** quadratic bezier with `c` as the control point (not a point on the curve) */
const curveC = (a: P2, c: P2, b: P2, n = 6): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); }
  return out;
};

/** straight a->k, a small round corner at k (k is its control point, so the corner stays inside the bend: a forearm
 *  on a desk or a thigh on a seat never dips below its line), straight k->b. A single bezier through a / k / b sags
 *  (~.12 of the drop) between k and b and bulges between a and k. */
const bentPath = (a: P2, k: P2, b: P2, r0: number): P2[] => {
  const r = Math.min(r0, 0.4 * Math.hypot(k[0] - a[0], k[1] - a[1]), 0.4 * Math.hypot(b[0] - k[0], b[1] - k[1]));
  const toK = (q: P2): P2 => { const L0 = Math.hypot(k[0] - q[0], k[1] - q[1]) || 1; return [k[0] + ((q[0] - k[0]) * r) / L0, k[1] + ((q[1] - k[1]) * r) / L0]; };
  const k1 = toK(a), k2 = toK(b);
  return [a, lerp2(a, k1, 0.5), ...curveC(k1, k, k2, 6), lerp2(k2, b, 0.5), b];
};

export const RIFLEMAN: Outfit = { jacket: "#357650", pants: "#3d4440", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true };
export const OFFICER: Outfit = { ...RIFLEMAN, hat: "shako_tall", buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#4a3020", rifle: false, belt: null, build: "stout" };
export const KID: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };
export const PARENT: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a" };
export const SKINS = [SKIN, "#f5c9a0", "#ecd0b6", "#c99067"];

export const soldier = (v = 0, extra: Partial<Outfit> = {}): Outfit => {
  const o: Outfit = { ...RIFLEMAN, skin: SKINS[v % 4] };
  if (v % 4 === 1) o.moustache = "#4a3426";
  if (v % 4 === 3) o.moustache = "#2a201a";
  return { ...o, ...extra };
};

export const townsfolk = (v = 0): Outfit => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o: Outfit = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "tophat" };
};

export class Pen {
  g: CanvasRenderingContext2D;
  ol = 12;
  /** [angle, cx, cy] rotation about (cx, cy), optional post-translation [.., dx, dy] */
  rot: number[] | null = null;
  constructor(g: CanvasRenderingContext2D) { this.g = g; }
  P(x: number, y: number): P2 {
    if (!this.rot) return [x, y];
    const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s + dx, cy + (x - cx) * s + (y - cy) * c + dy];
  }
  path(pts: P2[], close: boolean) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => { const [x, y] = this.P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }
  /** filled shape with an ink outline; fill=null draws the outline only */
  poly(pts: P2[], fill: string | null, ol?: number) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx: number, cy: number, rx: number, ry: number, fill: string | null, ol?: number, a0 = 0, a1 = 360, rot = 0) {
    this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
  }
  /** thick round-capped limb with an ink rim (effects, rope) */
  line(pts: P2[], fill: string, w: number, ink = true) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    if (ink) { this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * this.ol * 0.9; g.stroke(); }
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  stroke(pts: P2[], w: number, fill = INK) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, w: number, fill = INK) {
    const pts: P2[] = [];
    for (let i = 0; i <= 24; i++) pts.push([cx + rx * Math.cos(rad(a0 + ((a1 - a0) * i) / 24)), cy + ry * Math.sin(rad(a0 + ((a1 - a0) * i) / 24))]);
    this.stroke(pts, w, fill);
  }
  dot(cx: number, cy: number, r: number, fill = INK) {
    const [x, y] = this.P(cx, cy);
    this.g.beginPath(); this.g.arc(x, y, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
  }
  /** draw with a closed shape as clip */
  clip(pts: P2[], fn: () => void) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** flat fill + soft crescent on the side away from the light (light = canvas angle the light comes FROM).
   *  Radial ramp centred `shift` R toward the light: flat out to ~0.6 R on the far side, full shadow by ~0.8 R. */
  shadedFill(pts: P2[], base: string, shadow: string, light: number, R: number, shift = 0.45, r0 = 1.05, r1 = 1.25) {
    const g = this.g, n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
    gr.addColorStop(0, base); gr.addColorStop(r0 / r1, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** broad gradient across a shape along the light: lit edge = base, far edge = shadow (torsos, coats) */
  gradFill(pts: P2[], base: string, shadow: string, light: number, flat = 0.22) {
    const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
    let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const dc = cx * dx + cy * dy;
    const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
    const gr = g.createLinearGradient(ax, ay, bx, by);
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** thick-thin ink ring: w(θ) = w0 (1 + k cos(θ − thick)), θ from the contour centroid (canvas angles) */
  inkRing(pts: P2[], w0: number, thick: number, k = 0.62, col = INK) {
    const n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const out: P2[] = [], inn: P2[] = [];
    pts.forEach((q, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; // outward normal for clockwise-on-screen contours
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
      out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]);
    });
    const g = this.g;
    const trace = (r: P2[]) => { r.forEach(([x0, y0], i) => { const [x, y] = this.P(x0, y0); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.beginPath(); trace(out); trace(inn.reverse());
    g.fillStyle = col; g.fill("evenodd");
  }
  /** flat strap with a thin ink rim (cross belts, sash, rifle, handles) */
  band(pts: P2[], fill: string, w: number, rim: number, cap: CanvasLineCap = "butt") {
    const g = this.g; g.lineCap = cap; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * rim; g.stroke();
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
    g.lineCap = "round";
  }
}

const ellPts = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, rot = 0, n = 48): P2[] => {
  const r = rad(rot), pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

const rrect = (x0: number, y0: number, x1: number, y1: number, r: number, n = 8): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

/** tapered stroke, thick end at a: brows, moustache halves */
const taper = (p: Pen, a: P2, b: P2, wa: number, wb: number, col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};

// ---------------- contours ----------------
export type Blob = { a: number; b: number; nTop: number; nBot: number; egg: number; asym: number; rot: number; noise: number; seed: number };

/** superellipse "bean": separate crown / jaw exponents, egg taper (neg = narrower chin), one-side bulge, soft noise.
 *  Points run right -> down -> left -> up (clockwise on screen). */
export const blobPts = (cx: number, cy: number, B: Blob, n = 72): P2[] => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
    const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
    const x = B.a * X * r, y = B.b * Y * r;
    pts.push([cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)]);
  }
  return pts;
};

/** measured head: H/W 0.94, slightly pointed crown (1.75), fuller jaw (2.3), chin taper -0.12, 8 % bulge to the facing side */
// v2 (owner: "not perfect round heads"): wider spread per seed: squat to tall, pointed to flat crowns, big chin taper,
// 8-16 % one-side bulge, up to +-7 deg tilt, and low-order lumps of about +-4 %, so no two heads are the same circle.
// v3 (owner: the king's head "too extreme, aim for more normal proportions"): about half the v2 spread. Still no two
// heads alike (a little squat or tall, a softer or fuller jaw, a 3-7 % bulge, +-3 deg tilt, +-1.5 % lumps).
export const headBlob = (seed: number, a = 118, facing = 0): Blob => {
  const k = 0.97 + 0.06 * rnd(seed, 21);
  return {
    a: a * k, b: a * k * (0.9 + 0.1 * rnd(seed, 1)),
    nTop: 1.65 + 0.4 * rnd(seed, 2), nBot: 2.15 + 0.4 * rnd(seed, 3),
    egg: -0.18 + 0.14 * rnd(seed, 4),
    asym: (0.03 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
    rot: rad(6 * (rnd(seed, 7) - 0.5)), noise: 0.01 + 0.006 * rnd(seed, 8), seed,
  };
};
/** per-character build quirks: leg length, torso width / shape, a lean, a head tilt, uneven knees and feet */
export const quirk = (seed: number) => ({
  legs: 0.9 + 0.2 * rnd(seed, 22), tw: 0.86 + 0.32 * rnd(seed, 23), torso: 0.94 + 0.12 * rnd(seed, 24),
  egg: 0.22 * (rnd(seed, 25) - 0.35), lean: 4 * (rnd(seed, 26) - 0.5), headTilt: 6 * (rnd(seed, 27) - 0.5),
  knee: [rnd(seed, 28) - 0.5, rnd(seed, 29) - 0.5], foot: [rnd(seed, 30) - 0.5, rnd(seed, 31) - 0.5],
  arm: [rnd(seed, 32) - 0.5, rnd(seed, 33) - 0.5],
});
/** hand-drawn limb: tapered from w0 to w1, a slight wobble in the line and its width, round caps */
const limb = (p: Pen, pts: P2[], w0: number, w1: number, col: string, seed: number, wob = 1) => {
  const n = pts.length, L = [0];
  for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = L[n - 1] || 1, ph = rnd(seed, 41) * 6.283, left: P2[] = [], right: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let nx = a[1] - b[1], ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const t = L[i] / tot, hw = 0.5 * (w0 + (w1 - w0) * t) * (1 + 0.1 * Math.sin(t * 7 + ph));
    const off = wob * 0.32 * w0 * Math.sin(t * Math.PI * 2 + ph) * Math.sin(t * Math.PI);
    const cx = pts[i][0] + nx * off, cy = pts[i][1] + ny * off;
    left.push([cx + nx * hw, cy + ny * hw]); right.push([cx - nx * hw, cy - ny * hw]);
  }
  p.poly([...left, ...right.reverse()], col, 0);
  p.dot(pts[0][0], pts[0][1], w0 / 2, col); p.dot(pts[n - 1][0], pts[n - 1][1], w1 / 2, col);
};

/** thickest outline direction: away from the light, pulled toward the ground (64 deg measured for upper-left light) */
export const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);

// ---------------- faces ----------------
export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed"
  | "pained" | "smile" | "smile_closed" | "lick" | "sigh" | "wince" | "smug" | "sad" | "deadpan" | "sleep" | "huff" | "happy" | "focus";
type EyeK = "dot" | "small" | "lid" | "slit" | "happy" | "dash" | "squeeze" | "shock" | "shockHalf" | "spiral" | "closed" | "down";
type MouthK = "dash" | "frown" | "smirk" | "smile" | "smileWide" | "grin" | "laugh" | "o" | "O" | "wave" | "teeth" | "lick";
/** eyes [back, front], brows [inner, outer] offsets in u (+ = down), mouth kind */
const FACE: Record<Expr, { eye: [EyeK, EyeK]; brow: [number, number]; mouth: MouthK }> = {
  neutral: { eye: ["lid", "lid"], brow: [0, -1], mouth: "dash" },
  stern: { eye: ["lid", "lid"], brow: [3, -2], mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: [-3, -3], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-4, -4], mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: [-2, -4], mouth: "o" },
  nervous: { eye: ["small", "small"], brow: [-3, 2], mouth: "wave" },
  shock: { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: [-3, 2], mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: [-3, 2], mouth: "teeth" },
  smile: { eye: ["dot", "dot"], brow: [0, -1], mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -1], mouth: "smile" },
  lick: { eye: ["dot", "dot"], brow: [0, -1], mouth: "lick" },
  sigh: { eye: ["dash", "dash"], brow: [-6, 4], mouth: "o" },
  wince: { eye: ["squeeze", "squeeze"], brow: [-5, 3], mouth: "teeth" },
  smug: { eye: ["lid", "lid"], brow: [2, -6], mouth: "smirk" },
  // friends film
  sad: { eye: ["down", "down"], brow: [-5, 4], mouth: "frown" },
  deadpan: { eye: ["slit", "slit"], brow: [1, 1], mouth: "dash" },
  sleep: { eye: ["closed", "closed"], brow: [0, 1], mouth: "o" },
  huff: { eye: ["lid", "lid"], brow: [4, -4], mouth: "o" },
  happy: { eye: ["happy", "happy"], brow: [-2, -2], mouth: "smile" },
  // concentrating on the page: lids lowered to the desk, brows a little knit (not the stern V), a flat mouth
  focus: { eye: ["down", "down"], brow: [1, -0.5], mouth: "dash" },
};
const halfLid = (k: EyeK): EyeK => (k === "dot" || k === "small" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k);
const eyeKind = (k: EyeK, lid: number): EyeK =>
  lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" && k !== "closed" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b: boolean | number | undefined) => (b === true ? 1 : Number(b) || 0);

const eye = (p: Pen, kind: EyeK, x: number, ey: number, u: number, side: number, look: number, skin: string) => {
  const lx = x + look * 3 * u, lw = 3.8 * u;
  switch (kind) {
    case "dot": p.ell(lx, ey, 3.8 * u, 5.5 * u, INK, 0); break;
    case "small": p.ell(lx, ey, 3 * u, 4.4 * u, INK, 0); break;
    case "lid": p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey - u], [x + 9 * u, ey - u]], lw); break;
    case "slit": p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey], [x + 9 * u, ey]], lw); break;
    case "happy": p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw); break;
    case "closed": p.arc(x, ey - 2 * u, 8 * u, 5 * u, 20, 160, lw); break;
    case "down": p.ell(lx, ey + 2.5 * u, 6.5 * u, 4.2 * u, INK, 0, 0, 180); p.stroke([[x - 8.5 * u, ey + 2.5 * u], [x + 8.5 * u, ey + 2.5 * u]], lw); break;
    case "dash": p.stroke([[x - 8.5 * u, ey], [x + 8.5 * u, ey]], lw); break;
    case "squeeze": p.stroke([[x + 6 * u * side, ey - 5 * u], [x - 6 * u * side, ey], [x + 6 * u * side, ey + 5 * u]], lw); break;
    case "shock": case "shockHalf":
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u); p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 3 * u);
      if (kind === "shockHalf") { p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360); p.stroke([[x - 11 * u, ey], [x + 11 * u, ey]], 2.6 * u); }
      break;
    default: {
      const s: P2[] = [];
      for (let t = 1; t < 15; t++) s.push([x + Math.cos(t * 0.9) * t * 0.55 * u, ey + Math.sin(t * 0.9) * t * 0.55 * u]);
      p.stroke(s, 2.4 * u);
    }
  }
};

/** open "D" mouth with a white teeth band (+ tongue) */
const dmouth = (p: Pen, mx: number, y: number, rx: number, ry: number, u: number, tongue = false) => {
  p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
  p.clip([[mx - rx, y], [mx + rx, y], [mx + rx, y + 3 * u], [mx - rx, y + 3 * u]], () => p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
  if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
  p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};

const mouth = (p: Pen, kind: MouthK, mx: number, my: number, u: number, k = 1) => {
  const mw = 4 * u;
  switch (kind) {
    case "dash": p.stroke([[mx - 5.5 * u * k, my], [mx + 5.5 * u * k, my - 0.8 * u]], mw); break;
    case "frown": p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw); break;
    case "smirk": p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw); break;
    case "smile": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); break;
    case "smileWide": p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw); break;
    case "grin": dmouth(p, mx, my - u, 12 * u * k, 8 * u, u); break;
    case "laugh": dmouth(p, mx, my, 16 * u * k, 11 * u, u, true); break;
    case "o": p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u); break;
    case "O": p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u); break;
    case "wave": { const s: P2[] = []; for (let i = 0; i <= 12; i++) s.push([mx - 9 * u * k + i * 1.5 * u * k, my + 1.5 * u * Math.sin(i * 1.3)]); p.stroke(s, 3 * u); break; }
    case "teeth":
      p.poly([[mx - 12 * u * k, my - 4 * u], [mx + 12 * u * k, my - 4 * u], [mx + 11 * u * k, my + 4 * u], [mx - 11 * u * k, my + 4 * u]], WHITE, 3 * u);
      for (const j of [-1, 0, 1]) p.stroke([[mx + j * 6 * u * k, my - 4 * u], [mx + j * 6 * u * k, my + 4 * u]], 1.5 * u);
      break;
    case "lick": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u); break;
  }
};

/** face v2 (front / 3-4). u = 1 % of the head path width W. Eyes 26u apart on the centre line, brows 20u up, mouth 20u
 *  down, everything slid toward the facing side. No blush, no catchlights. */
const faceFront = (p: Pen, cx: number, cy: number, W: number, expr: Expr, facing: number, look: number, lid: number, brim: boolean,
  skin: string, moustache?: string, stout = false, lookUp = 0) => {
  const u = W / 100, F = FACE[expr], fx = cx + 7 * u * facing;
  const ex = (F.eye[0] === "shock" ? 12 : 13) * u, ey = cy - 3.5 * u * lookUp;
  for (const side of [-1, 1]) {
    const x = fx + side * ex;
    const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
    eye(p, kind, x, ey, u, side, look, skin);
    const [dI, dO] = F.brow, by = ey - (brim ? 17 : 20) * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], 5 * u, 2.5 * u);
  }
  const mx = cx + 8 * u * facing, my = cy + 20 * u;
  mouth(p, F.mouth, mx, my, u);
  if (moustache) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * (stout ? 19 : 15) * u, cy + (stout ? 10.5 : 15) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

/** profile face (facing screen-right): one eye, brow, nose tick, mouth near the front edge; no skin bump nose, no ear */
const faceSide = (p: Pen, hx: number, hy: number, W: number, expr: Expr, lid: number, brim: boolean, skin: string, moustache?: string, stout = false) => {
  const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy;
  const kind = eyeKind(F.eye[1], lid);
  eye(p, kind, ex, ey, u, 1, 0.6, skin);
  const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], 5 * u, 2.5 * u);
  p.stroke([[hx + 44 * u, hy + 4 * u], [hx + 47.5 * u, hy + 9 * u], [hx + 43 * u, hy + 10 * u]], 3 * u);
  mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
  if (moustache) taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + (stout ? 11.5 : 16) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

// ---------------- hats ----------------
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
/** parts of a hat that sit behind the head (bonnet) */
const hatBehind = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, light: number, thick: number, ow: number, side: boolean) => {
  if (o.hat !== "bonnet") return;
  const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, { ...H, a: H.a * 1.17, b: H.b * 1.13, asym: 0, egg: 0.04, seed: H.seed + 3 });
  p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
  p.inkRing(bb, ow * 0.85, thick);
};

/** v3: the part of the head above a hat's base line, in the hat's own (unrotated) frame: x span and the top */
const headAbove = (hp: P2[], a: number, cx: number, hc: number, yb: number) => {
  const c = Math.cos(-a), s = Math.sin(-a);
  let x0 = Infinity, x1 = -Infinity, top = Infinity;
  const pts: P2[] = [];
  for (const [x, y] of hp) {
    const X = cx + (x - cx) * c - (y - hc) * s, Y = hc + (x - cx) * s + (y - hc) * c;
    if (Y > yb) continue;
    pts.push([X, Y]); x0 = Math.min(x0, X); x1 = Math.max(x1, X); top = Math.min(top, Y);
  }
  return { x0, x1, top, pts };
};
const hatOn = (p: Pen, o: Outfit, hp: P2[], H: Blob, cx0: number, hc: number, light: number, seed: number, facing: number, side: boolean) => {
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
  const a = H.rot + rad(2 * (rnd(seed, 20) - 0.5)); // tilt with the head, +-1 deg extra
  const R = (pts: P2[]) => rotPts(pts, a, cx0, hc);
  let cx = cx0;
  const sag = (yb: number, wb: number): P2[] => {
    const base: P2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; base.push([cx + wb * (2 * t - 1), yb + 3 * u * (1 - (2 * t - 1) ** 2)]); }
    return base;
  };
  if (o.hat === "shako" || o.hat === "shako_tall") {
    const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
    if (tall) p.clip(body, () => p.band(R([[cx - wt - 5 * u, yb - ht + 0.07 * HH], [cx + wt + 5 * u, yb - ht + 0.07 * HH]]), "#e8c45a", 0.06 * HH, 1.5 * u));
    p.poly(body, null, ow);
    const deg = (a * 180) / Math.PI;
    if (side) {
      p.poly(R([[cx + 36 * u, yb - 1 * u], [cx + 60 * u, yb + 8 * u], [cx + 34 * u, yb + 6 * u]]), "#16171b", 2.5 * u);
      const [tx, ty] = R([[cx + 24 * u, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
    } else {
      const [px, py] = R([[cx + 3 * u * facing, yb + 3 * u]])[0];
      p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg); // peak
      const [bx, by] = R([[cx, yb - 0.45 * ht]])[0];
      p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg); // badge plate
      p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
      const [tx, ty] = R([[cx, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u); // green tuft
    }
  } else if (o.hat === "cap" || o.hat === "hair") {
    const cut = crown + (o.hat === "cap" ? 0.3 : 0.42) * HH;
    const keep = (x: number, y: number) => y < cut || (side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b);
    // start the arc at the first kept point after a dropped one, so the kept run is contiguous and the cut closes it
    const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
    if (arc.length < 3) return;
    if (o.hat === "hair") { // scalloped lower edge
      const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
      for (let i = 1; i < 6; i++) arc.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
    }
    const col = o.hat === "cap" ? o.cap! : o.hair!;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    if (o.hat === "hair") {
      const s = side ? -1 : facing || 1;
      p.stroke([[cx + s * 10 * u, cut - 30 * u], [cx + s * 2 * u, cut - 12 * u]], 1.2 * u);
    }
    if (o.hat === "cap") {
      const deg = (a * 180) / Math.PI;
      if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else {
        const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([[cx + s * 4 * u, cut + 1.5 * u]])[0];
        p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
      }
    }
  } else if (o.hat === "chef") {
    // tall puffy toque: three overlapping puffs over a white band (backtest kit)
    const yb = crown + 0.24 * HH, wb = 0.33 * W, deg = (a * 180) / Math.PI;
    for (const [px, py, pr] of [[-0.24, -0.5, 0.25], [0.24, -0.5, 0.25], [0, -0.62, 0.29]] as [number, number, number][]) {
      const [x, y] = R([[cx + px * W, yb + py * HH]])[0];
      p.ell(x, y, pr * W, pr * W * 0.92, "#ffffff", ow, 0, 360, deg);
    }
    const band = R([[cx - wb, yb], [cx + wb, yb], [cx + wb * 1.04, yb - 0.3 * HH], [cx - wb * 1.04, yb - 0.3 * HH]]);
    p.shadedFill(band, "#ffffff", "#d9dee6", light, wb, 0.3);
    p.poly(band, null, ow);
    for (const k of [-0.5, 0, 0.5]) p.stroke(R([[cx + k * wb, yb - 0.04 * HH], [cx + k * wb * 1.02, yb - 0.24 * HH]]), 1.6 * u);
  } else if (o.hat === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "wide") {
    // 1620s wide felt hat: broad brim, low rounded crown, coloured band, optional plume sweeping back
    const K = o.hatK ?? 1, col = o.cap ?? "#2a2220", yb = crown + 0.24 * HH, deg = (a * 180) / Math.PI;
    const dx = side ? 5 * u : 0;
    // the crown must cover every bit of head above the brim (v2 let bulging heads poke out beside the crown)
    const ha = headAbove(hp, a, cx0, hc, yb + 1.5 * u);
    if (!side && ha.pts.length) cx = 0.5 * (ha.x0 + ha.x1);
    const ht = Math.max(0.4 * HH * K, ha.pts.length ? (yb - ha.top) / 0.8 + 2 * u : 0);
    let wb = 0.3 * W * K;
    for (const [x, y] of ha.pts) {
      const sn = Math.min(0.97, (Math.max(0, yb - y) / ht) ** (1 / 0.7)), cs = Math.sqrt(1 - sn * sn);
      wb = Math.max(wb, (Math.abs(x - cx - dx) + 3 * u) / (cs * (1 - 0.15 * sn)));
    }
    const wt = 0.26 * W * K;
    if (o.plume) {
      const s = side ? -1 : (facing || 1) * -1;
      // ostrich plume: rooted on the crown, arching up and back, the tip drooping past the brim
      const X = (k: number) => cx + dx + s * k * W * K, Y = (k: number) => yb - k * ht;
      const tip: P2 = [X(0.7), Y(0.22)];
      const pts = R([...curve([X(0.08), Y(0.6)], [X(0.42), Y(1.35)], tip, 14), ...curve(tip, [X(0.42), Y(0.78)], [X(0.18), Y(0.25)], 14)]);
      p.shadedFill(pts, o.plume, mul(o.plume, SH_CLOTH), light, 0.3 * W, 0.3);
      p.poly(pts, null, ow * 0.8);
      for (let k = 1; k <= 3; k++) p.stroke(R(curve([X(0.12 + 0.04 * k), Y(0.5 - 0.06 * k)], [X(0.26 + 0.08 * k), Y(0.95 - 0.08 * k)], [X(0.34 + 0.09 * k), Y(0.85 - 0.16 * k)], 6)), 2 * u, mul(o.plume, SH_CLOTH));
    }
    const body: P2[] = [];
    for (let i = 0; i <= 16; i++) { const th = Math.PI * (i / 16); body.push([cx + dx - wb * Math.cos(th) * (1 - 0.15 * Math.sin(th)), yb - ht * Math.sin(th) ** 0.7]); }
    const crownPts = R([...sag(yb, wb), ...body.reverse()]);
    p.shadedFill(crownPts, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(crownPts, () => p.band(R([[cx - wb - 4 * u, yb - 0.12 * HH], [cx + wb + 4 * u, yb - 0.12 * HH]]), o.plume ? "#d9a93a" : shade(col, 1.6), 0.09 * HH, 0.8 * u));
    p.poly(crownPts, null, ow);
    const [bx, by] = R([[cx + dx * 1.6, yb + 1 * u]])[0];
    p.ell(bx, by, Math.max(0.66 * W * K, wb + 0.2 * W * K), 0.075 * HH * Math.sqrt(K), shade(col, 0.85), ow, 0, 360, deg);
  } else if (o.hat === "crown") {
    // royal crown: gold band, five points with pearls, red stones
    const yb = crown + 0.16 * HH, hb = 0.1 * HH, hpk = 0.2 * HH, gold = o.cap ?? "#e3b84a";
    const ha = headAbove(hp, a, cx0, hc, yb);
    if (!side && ha.pts.length) cx = 0.5 * (ha.x0 + ha.x1);
    const wb = Math.max(0.36 * W, ha.pts.length ? 0.5 * (ha.x1 - ha.x0) + 3 * u : 0);
    const pts: P2[] = [[cx - wb, yb]];
    for (let i = 0; i <= 8; i++) { const x = cx - wb + (2 * wb * i) / 8; pts.push([x, yb - hb - (i % 2 ? 0 : hpk)]); }
    pts.push([cx + wb, yb]);
    const cr = R(pts);
    p.shadedFill(cr, gold, mul(gold, SH_CLOTH), light, wb, 0.4);
    p.poly(cr, null, ow);
    for (let i = 0; i <= 8; i += 2) { const [qx, qy] = R([[cx - wb + (2 * wb * i) / 8, yb - hb - hpk - 2 * u]])[0]; p.ell(qx, qy, 3.2 * u, 3.2 * u, "#fbf4e2", 1.6 * u); }
    for (const k of [-0.5, 0, 0.5]) { const [qx, qy] = R([[cx + k * wb, yb - hb * 0.5]])[0]; p.ell(qx, qy, 3.6 * u, 3 * u, "#c0262c", 1.4 * u); }
  } else if (o.hat === "bonnet") {
    const [bx, by] = R([[cx + (side ? 6 * u : 0), crown + 0.16 * HH]])[0];
    p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cy = hc + H.b * 0.98;
    p.stroke([[cx - 14 * u, cy - 4 * u], [cx, cy + 2 * u], [cx + 14 * u, cy - 4 * u]], 2 * u, BONNET_BRIM);
  }
};

// ---------------- bodies ----------------
export type Arms = [P2[], P2[]];
/** held prop; for the hammer the number is the strike 0 (raised) .. 1 (struck) */
export type Prop = null | "icecream" | "shako" | ["hammer", number];

const BUILD: Record<Build, { a: number; torso: number; legs: number; tw: number }> = {
  adult: { a: 118, torso: 1.1, legs: 1.4, tw: 0.8 },
  stout: { a: 118, torso: 1.15, legs: 1.32, tw: 0.92 },
  kid: { a: 112, torso: 0.85, legs: 1.0, tw: 0.72 },
};

export type FrontOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stroll" | "stand" | "sit" | "fall"; look?: number; blink?: boolean | number; lift?: number;
  prop?: Prop; tilt?: number; headTilt?: number; wave?: number;
  /** right arm straight out at this angle (deg; 0 = card right, 90 = up); eyes raised by lookUp (0..1) */
  point?: number; lookUp?: number;
  /** both forearms forward, hands in front of the belly (holding a 3D prop that covers them) */
  hold?: boolean;
  /** with hold: a cannonball between the hands */
  ball?: boolean;
  /** both hands clapped over the ears */
  ears?: boolean;
  /** right hand grips a long pole (linstock / rammer) leaning at this angle from vertical (deg, + = toward card right) */
  pole?: number;
  /** draw no arms (a 3D scene supplies its own, e.g. reaching to a prop) */
  noArms?: boolean;
  /** canvas angle the key light comes FROM (painted crescent + thick outline side) */
  light?: number; facing?: -1 | 0 | 1; seed?: number;
};

/** last drawn right/second hand in design units (pre-fit), read back by frontHand() */
const HAND_AT = { x: 300, y: 600 };
const footStroke = (p: Pen, a: P2, b: P2, w: number, col: string) => {
  if (col !== INK) p.stroke([a, b], w + 3, INK);
  p.stroke([a, b], w, col);
};

const bodyFrontRaw = (p: Pen, o: Outfit, opts: FrontOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave, point, lookUp = 0, hold = false,
    ball = false, ears = false, pole, noArms = false, light = DEF_LIGHT, facing = 0, seed = 1 } = opts;
  const Q = quirk(seed), B0 = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const Bd = { ...B0, legs: B0.legs * Q.legs, torso: B0.torso * Q.torso, tw: B0.tw * Q.tw };
  const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const HB = 2 * Bd.a * 0.94; // v2: torso and legs in a fixed body unit (head size varies on its own)
  const tall = HH + (Bd.torso + Bd.legs) * HB, sole = 975;
  // body bob 5 % (march) / 3 % (stroll) of the height, lowest at contact (phase 0 and 0.5)
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HB + bob;
  const chin = torsoBot - Bd.torso * HB, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u;
  const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), footCol = o.boots;
  const legW = 5.8 * u, footW = 7.5 * u;
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 44 * u, sole - 8 * u];
      limb(p, curve(h, k, f, 16), legW * 1.15, legW * 0.85, legCol, seed + side);
      footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "fall") {
    const legs: [P2, P2, P2][] = [
      [[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]],
      [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]],
    ];
    legs.forEach(([h, k, f], i) => {
      limb(p, curve(h, k, f, 16), legW * 1.15, legW * 0.85, legCol, seed + i);
      footStroke(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol);
    });
  } else if (o.dress) {
    for (const side of [-1, 1]) {
      const fx = 300 + side * 12 * u, fy = sole - 4 * u;
      limb(p, curve([fx, sole - 0.4 * HH], [fx + side * (1 + 2 * Q.knee[side < 0 ? 0 : 1]) * u, (sole - 0.4 * HH + fy) / 2], [fx + side * u, fy], 10), legW * 1.1, legW * 0.85, legCol, seed + side);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]] as const) {
      const j = side < 0 ? 0 : 1, up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + side * 15 * u, fx = 300 + side * (22 + 8 * Q.foot[j]) * u, fy = sole - 4 * u - up;
      const k: P2 = [(hx + fx) / 2 + side * (1.5 * u + 8 * u * Q.knee[j] + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      limb(p, curve([hx, hipY], k, [fx, fy], 16), legW * 1.15, legW * 0.82, legCol, seed + side);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + (0.5 + 5 * Q.foot[1 - j]) * u], footW, footCol);
    }
  }
  // ---- upper body: rotates about the hips (tilt + a small weight-shift sway on every step) ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway + (mode === "fall" ? 0 : Q.lean);
  p.rot = A ? [rad(A), 300, hipY] : null;
  const dress = !!o.dress && mode !== "sit" && mode !== "fall";
  const T: Blob = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.0 + 0.5 * rnd(seed, 34), nBot: 2.6, egg: (o.build === "stout" ? 0.17 : 0.12) + Q.egg,
    asym: 0.04 * facing + 0.06 * (rnd(seed, 35) - 0.5), rot: rad(4 * (rnd(seed, 36) - 0.5)), noise: 0.012, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const sh = (side: number): P2 => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const hang = (side: number, fwd: number): [P2, P2, P2] => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + (4 + 6 * Q.arm[side < 0 ? 0 : 1]) * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * HH], [hx, chin + 1.04 * HH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  // rifle at the order: butt by the right hip, held by the hanging right hand, muzzle past the crown
  const R0: P2 = [300 + 47 * u, torsoBot + 0.12 * HH], R1: P2 = [300 + 64 * u, crown - 0.32 * HH];
  const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
  type Arm = { pts: [P2, P2, P2]; front: boolean };
  const arms: Arm[] = [];
  if (mode === "sit") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 6 * u), sh(side)[1] + 0.4 * HH], [tcx + side * (1.2 * T.a + 10 * u), torsoBot + 0.04 * HH]], front: false });
  else if (mode === "fall") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.15 * T.a + 12 * u), sh(side)[1] - 0.25 * HH], [tcx + side * (1.3 * T.a + 24 * u), sh(side)[1] - 0.68 * HH]], front: false });
  else if (ears) for (const side of [-1, 1]) {
    const S = sh(side);
    arms.push({ pts: [S, [tcx + side * (1.25 * T.a + 12 * u), S[1] - 0.12 * HH], [300 + side * (H.a + 1 * u), hc + 0.08 * HH]], front: false });
  }
  else if (hold) for (const side of [-1, 1]) {
    const S = sh(side);
    arms.push({ pts: [S, [tcx + side * (1.12 * T.a + 5 * u), S[1] + 0.36 * HH], [tcx + side * 0.62 * T.a, S[1] + 0.58 * HH]], front: true });
  }
  else {
    arms.push({ pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw), front: false });
    if (rifle) {
      const G = lerp2(R0, R1, 0.1);
      arms.push({ pts: [sh(1), [tcx + 1.12 * T.a + 5 * u, sh(1)[1] + 0.45 * HH], G], front: false });
    } else if (pole !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.12 * T.a + 6 * u, S[1] + 0.4 * HH], [tcx + 0.95 * T.a + 4 * u, S[1] + 0.62 * HH]], front: true });
    } else if (point !== undefined) {
      const S = sh(1), a = rad(point), dx = Math.cos(a), dy = -Math.sin(a);
      arms.push({ pts: [S, [S[0] + dx * 0.32 * HH, S[1] + dy * 0.32 * HH], [S[0] + dx * 0.66 * HH, S[1] + dy * 0.66 * HH]], front: point < 60 || point > 120 });
    } else if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u + 3 * u * wave, S[1] - 0.22 * HH], [tcx + 1.18 * T.a + 16 * u + 12 * u * wave, S[1] - 0.6 * HH]], front: false });
    } else if (prop === "icecream") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * HH], [tcx + 0.5 * T.a, S[1] + 0.4 * HH]], front: true });
    } else if (Array.isArray(prop)) {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + 1.1 * T.a + 10 * u, S[1] - 0.15 * HH], [tcx + 1.2 * T.a + 10 * u, S[1] + 0.3 * HH], k);
      const Hd = lerp2([tcx + 1.15 * T.a + 14 * u, S[1] - 0.55 * HH], [tcx + 1.45 * T.a + 22 * u, S[1] + 0.35 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw), front: false });
  }
  { const last = arms[arms.length - 1]; if (last) { HAND_AT.x = last.pts[2][0]; HAND_AT.y = last.pts[2][1]; } }
  if (noArms) arms.length = 0;
  const drawArm = (a: Arm) => { limb(p, curve(a.pts[0], a.pts[1], a.pts[2], 14), 5.8 * u, 4.4 * u, armCol, seed + a.pts[2][0]); p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u); };
  // behind the body: rifle, sword, arms
  if (rifle) {
    p.band([R0, R1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(R0, R1, 0.6), R1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (o.sword && mode !== "sit") {
    const s0: P2 = [tcx - 0.75 * T.a, torsoBot - 0.2 * HH];
    p.band([s0, [s0[0] - Math.sin(rad(25)) * 0.8 * HH, s0[1] + Math.cos(rad(25)) * 0.8 * HH]], "#c9ccd2", 3 * u, 1.2 * u, "round");
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  if (dress) {
    const D: Blob = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, o.dress!, mul(o.dress!, SH_CLOTH), light);
    p.inkRing(dp, ow, thick);
    const Sw: Blob = { a: 0.37 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: seed + 8 };
    const sp = blobPts(300, chin + 0.12 * HH, Sw);
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.inkRing(sp, ow * 0.9, thick);
  } else {
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (o.stripes) for (let i = 0; i < 9; i++) {
        const y = chin + 0.06 * HH + i * 0.17 * HH;
        p.poly([[tcx - 1.3 * T.a, y], [tcx + 1.3 * T.a, y], [tcx + 1.3 * T.a, y + 0.085 * HH], [tcx - 1.3 * T.a, y + 0.085 * HH]], o.stripes, 0);
      }
      if (o.belt) {
        for (const s of [-1, 1]) p.band([[tcx - s * 0.75 * T.a, chin - 0.05 * HH], [tcx + s * 0.8 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
        const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
        p.poly([[xc - 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc + 3.5 * u], [xc - 3.5 * u, yc + 3.5 * u]], "#d9dde0", 1.5 * u);
      }
      if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
      if (o.sash) { const s = facing || 1; p.poly([[tcx + s * 0.32 * T.a, torsoBot - 0.3 * HH], [tcx + s * 0.48 * T.a, torsoBot - 0.06 * HH], [tcx + s * 0.22 * T.a, torsoBot - 0.09 * HH]], o.sash, 1.6 * u); }
      if (!o.stripes) for (let i = 0; i < 4; i++) {
        const y = chin + 0.12 * HH + i * 0.2 * HH;
        if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
        p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK); p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
      }
    });
    p.inkRing(tp, ow, thick);
    if (o.medal) {
      const mx = tcx - 0.42 * T.a, my = chin + 0.3 * HH;
      p.poly([[mx - 6 * u, my - 16 * u], [mx + 6 * u, my - 16 * u], [mx + 4 * u, my], [mx - 4 * u, my]], "#2f5fb0", 1.6 * u);
      p.ell(mx, my + 7 * u, 9 * u, 9 * u, "#f2c440", 2.2 * u); p.ell(mx, my + 7 * u, 4.5 * u, 4.5 * u, "#ffe58a", 0);
    }
  }
  // in front of the body: hands holding props
  if (hold && ball) { const by = sh(1)[1] + 0.5 * HH; p.ell(tcx, by, 0.2 * W, 0.2 * W, "#3c3f47", ow); p.ell(tcx - 0.07 * W, by - 0.07 * W, 0.05 * W, 0.04 * W, "#8a8f99", 0); }
  if (pole !== undefined && arms.length > 1) {
    const [hx, hy] = arms[1].pts[2], a = rad(pole), dx = Math.sin(a), dy = -Math.cos(a);
    const P0: P2 = [hx - dx * 0.55 * HH, hy - dy * 0.55 * HH], P1: P2 = [hx + dx * 1.25 * HH, hy + dy * 1.25 * HH];
    p.band([P0, P1], "#9a6a3c", 4.2 * u, 1.6 * u, "round");
    p.band([P1, [P1[0] + dx * 0.12 * HH, P1[1] + dy * 0.12 * HH]], "#5b5f66", 5.5 * u, 1.6 * u, "round");
  }
  for (const a of arms) if (a.front) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (prop === "icecream") {
      p.poly([[hx - 8 * u, hy - 12 * u], [hx + 8 * u, hy - 12 * u], [hx, hy + 7 * u]], "#e0a35a", 1.8 * u);
      p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop)) {
      const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
      const Rh = (pts: P2[]) => rotPts(pts, ang, hx, hy);
      p.band(Rh([[hx, hy + 12 * u], [hx, hy - 44 * u]]), "#8a5a34", 5 * u, 1.5 * u, "round");
      p.poly(Rh([[hx - 12 * u, hy - 58 * u], [hx + 20 * u, hy - 58 * u], [hx + 20 * u, hy - 42 * u], [hx - 12 * u, hy - 42 * u]]), "#7d848c", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    }
  }
  if (prop === "shako") { // carried by the left hand
    const [hx, hy] = arms[0].pts[2];
    p.poly([[hx - 14 * u, hy + 3 * u], [hx + 14 * u, hy + 3 * u], [hx + 16 * u, hy + 30 * u], [hx - 16 * u, hy + 30 * u]], "#3a3d47", 2.2 * u);
    p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
    p.dot(hx, hy, 5.5 * u);
  }
  // ---- head: rotates with the body, plus its own tilt about the chin ----
  const Ah = A + headTilt + Q.headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hatBehind(p, o, H, 300, hc, light, thick, ow, false);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout", lookUp);
  if (ears) for (const a of arms) p.dot(a.pts[2][0], a.pts[2][1], 7 * u);
  p.rot = null;
};

export type SideOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stand" | "swing" | "push"; blink?: boolean | number; stomp?: number; pose?: number;
  /** step length as a multiple of 0.8 m (370 units): matches 1.6 m/s at 2 steps/s; scale by the view's foreshortening */
  stride?: number; light?: number; seed?: number;
  /** push mode: where the hands land at pose 1, in final canvas units (e.g. the swing kid's back) */
  hand?: [number, number];
};

/** two-bone leg, knee bending forward (+x) */
const ik = (hip: P2, ank: P2, l1: number, l2: number): P2 => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

/** hip height of the seated kid in `swing` mode (design units); swingKid seats the torso bottom on the plank */
const SWING_HIP = 733;

/** side view facing screen-right; march footfalls land at phase 0 (near foot) and 0.5 (far foot), like the front view.
 *  The stance foot is planted: it slides back at exactly the walking speed while the hip rises and falls over it. */
const bodySideRaw = (p: Pen, o: Outfit, opts: SideOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H: Blob = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const HB = 2 * Bd.a * 0.94;
  const legLen = (Bd.legs + 0.12) * HB - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = mix(o.pants, INK, 0.55), farCol = mix(o.pants, INK, 0.75), footCol = o.boots;
  type LegS = { ank: P2; pitch: number; near: boolean };
  const legs: LegS[] = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "march") {
    const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - 0.5) / 0.5; // swing: cycloid in world space, so the foot leaves and lands at zero ground speed
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
    const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    for (const [L, near] of [[fL, false], [nL, true]] as const)
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)), near });
    lean = 4 + 3 * Math.cos(2 * two * phase); // 7 deg at contact, 1 deg at passing
    nearFwd = nL.x / (S / 2);
  } else if (mode === "push") {
    hipY = ankY - 0.87 * legLen;
    legs.push({ ank: [300 - 0.5 * legLen, ankY], pitch: rad(-8), near: false }, { ank: [300 + 0.32 * legLen, ankY], pitch: 0, near: true });
    lean = 14 * pose;
  } else if (mode === "swing") {
    hipY = SWING_HIP;
    const a = rad(60 * pose);
    for (const [dx, near] of [[-6, false], [0, true]] as const) {
      const knee: P2 = [300 + l1 * 0.98 + dx * u, hipY + 6 * u];
      legs.push({ ank: [knee[0] + l2 * Math.sin(a), knee[1] + l2 * Math.cos(a)], pitch: -a * 0.5, near });
    }
  } else {
    legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  }
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HB, hc = chin - H.b, crown = hc - H.b, hip: P2 = [300, hipY];
  p.rot = null;
  for (const L of legs) {
    const knee = mode === "swing" ? ([300 + l1 * 0.98 + (L.near ? 0 : -6 * u), hipY + 6 * u] as P2) : ik(hip, L.ank, l1, l2);
    const hp0: P2 = [300 + (L.near ? 0 : -5 * u), hipY];
    limb(p, curve(hp0, knee, L.ank, 14), 6.6 * u, 4.9 * u, L.near ? nearCol : farCol, seed + (L.near ? 1 : 2));
    const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
    footStroke(p, [L.ank[0] - 3 * u * c, L.ank[1] - 3 * u * s], [L.ank[0] + 13 * u * c, L.ank[1] + 13 * u * s + 0.5 * u],
      7.5 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  // ---- upper body leans about the hip ----
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const Qs = quirk(seed);
  const T: Blob = { a: (o.build === "stout" ? 0.36 : 0.31) * W * Qs.tw, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.0 + 0.5 * rnd(seed, 34), nBot: 2.5, egg: 0.1 + Qs.egg, asym: 0.06,
    rot: rad(4 * (rnd(seed, 36) - 0.5)), noise: 0.012, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = mix(o.jacket, INK, 0.5), farArm = mix(o.jacket, INK, 0.68);
  const S: P2 = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  const swingArm = (ang: number): [P2, P2, P2] => {
    const e: P2 = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(16) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const rifle = !!o.rifle && (mode === "march" || mode === "stand");
  const B0: P2 = [tcx + 0.72 * T.a, chin + 0.58 * HH], B1: P2 = [tcx - 0.95 * T.a - 22 * u, crown - 0.4 * HH];
  let near: [P2, P2, P2], far: [P2, P2, P2] | null;
  if (mode === "swing") { near = [S, [S[0] + 12 * u, S[1] - 0.16 * HH], [300 + 6 * u, chin - 0.3 * HH]]; far = [S, [S[0] + 8 * u, S[1] - 0.18 * HH], [300 + 2 * u, chin - 0.36 * HH]]; }
  else if (mode === "push") {
    const reach = 0.55 * HH + 0.45 * HH * pose;
    let hN: P2 = [S[0] + reach, S[1] + 0.06 * HH];
    if (opts.hand) {
      // target is in final canvas units; the arm is drawn inside the lean rotation, so undo it
      const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
      const tg: P2 = [300 + dx * Math.cos(th) - dy * Math.sin(th), hipY + dx * Math.sin(th) + dy * Math.cos(th)];
      hN = [hN[0] + (tg[0] - hN[0]) * pose, hN[1] + (tg[1] - hN[1]) * pose];
    }
    near = [S, [(S[0] + hN[0]) / 2, (S[1] + hN[1]) / 2 + 0.06 * HH], hN];
    far = [S, [(S[0] + hN[0]) / 2 - 4 * u, (S[1] + hN[1]) / 2 - 0.02 * HH], [hN[0] - 6 * u, hN[1] - 0.08 * HH]];
  } else if (rifle) { near = [S, [S[0] - 4 * u, S[1] + 0.42 * HH], B0]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0); }
  else { near = swingArm(rad(-30) * nearFwd); far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  if (far) { limb(p, curve(far[0], far[1], far[2], 14), 5.8 * u, 4.4 * u, farArm, seed + 3); p.dot(far[2][0], far[2][1], 5.5 * u); }
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
  p.clip(tp, () => {
    if (o.belt) p.band([[tcx - 0.65 * T.a, chin - 0.05 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
    if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
    if (!o.dress) for (let i = 0; i < 3; i++) { const y = chin + 0.16 * HH + i * 0.24 * HH; p.dot(tcx + 0.8 * T.a, y, 3 * u, INK); p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
  });
  p.inkRing(tp, ow, thick);
  if (rifle) {
    p.band([B0, B1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(B0, B1, 0.6), B1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  limb(p, curve(near[0], near[1], near[2], 14), 5.8 * u, 4.4 * u, armCol, seed + 4); p.dot(near[2][0], near[2][1], 5.5 * u);
  // ---- head ----
  const hx = 300 + 4 * u;
  hatBehind(p, o, H, hx, hc, light, thick, ow, true);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

/** rope + seat + seated kid on a 700 x 2300 canvas; the pivot is design (350, 20); kid drawn at 0.92 scale */
// ---------------- fit to the card ----------------
// v2: head size, body build and hat now vary per character, so a tall hat or a waving arm could run past the card edge
// and be cut off. Each character (outfit x seed x view) is measured once in its widest poses with a recording context,
// and if it does not fit with a margin it is drawn scaled down about the sole point. hatMax: the biggest hatK the
// character will reach (promotion hats grow), so its scale stays constant while the hat grows.
class Bounds {
  m = [1, 0, 0, 1, 0, 0]; st: number[][] = []; x0 = 1e9; y0 = 1e9; x1 = -1e9; y1 = -1e9; lineWidth = 1;
  fillStyle: unknown; strokeStyle: unknown; lineCap = ""; lineJoin = ""; filter = ""; globalAlpha = 1; globalCompositeOperation = "";
  pt(x: number, y: number) {
    const [a, b, c, d, e, f] = this.m, X = a * x + c * y + e, Y = b * x + d * y + f, h = this.lineWidth / 2;
    this.x0 = Math.min(this.x0, X - h); this.x1 = Math.max(this.x1, X + h); this.y0 = Math.min(this.y0, Y - h); this.y1 = Math.max(this.y1, Y + h);
  }
  save() { this.st.push([...this.m]); } restore() { this.m = this.st.pop() ?? [1, 0, 0, 1, 0, 0]; }
  translate(x: number, y: number) { const [a, b, c, d, e, f] = this.m; this.m = [a, b, c, d, e + a * x + c * y, f + b * x + d * y]; }
  scale(sx: number, sy: number) { const [a, b, c, d, e, f] = this.m; this.m = [a * sx, b * sx, c * sy, d * sy, e, f]; }
  rotate(t: number) { const [a, b, c, d, e, f] = this.m, cs = Math.cos(t), sn = Math.sin(t); this.m = [a * cs + c * sn, b * cs + d * sn, -a * sn + c * cs, -b * sn + d * cs, e, f]; }
  beginPath() {} closePath() {} fill() {} stroke() {} clip() {} setLineDash() {} fillText() {} drawImage() {}
  moveTo(x: number, y: number) { this.pt(x, y); } lineTo(x: number, y: number) { this.pt(x, y); }
  bezierCurveTo(_a: number, _b: number, _c: number, _d: number, x: number, y: number) { this.pt(x, y); }
  quadraticCurveTo(_a: number, _b: number, x: number, y: number) { this.pt(x, y); }
  arc(x: number, y: number, r: number) { this.pt(x - r, y - r); this.pt(x + r, y + r); }
  ellipse(x: number, y: number, rx: number, ry: number) { this.pt(x - rx, y - ry); this.pt(x + rx, y + ry); }
  fillRect(x: number, y: number, w: number, h: number) { this.pt(x, y); this.pt(x + w, y + h); }
  strokeRect(x: number, y: number, w: number, h: number) { this.pt(x, y); this.pt(x + w, y + h); }
  createLinearGradient() { return { addColorStop() {} }; } createRadialGradient() { return { addColorStop() {} }; }
  measureText() { return { width: 0 }; }
}
const fitCache = new Map<string, number>();
const MARGIN = 16;
const fitOf = (o: Outfit, seed: number, side: boolean) => {
  const key = `${side ? "s" : "f"}|${o.hat}|${o.build}|${o.dress ? 1 : 0}|${o.plume ? 1 : 0}|${o.rifle ? 1 : 0}|${o.sword ? 1 : 0}|${o.hatMax ?? o.hatK ?? 1}|${seed}`;
  const hit = fitCache.get(key);
  if (hit !== undefined) return hit;
  const g = new Bounds(), p = new Pen(g as unknown as CanvasRenderingContext2D), oo: Outfit = { ...o, hatK: o.hatMax ?? o.hatK };
  if (side) for (const phase of [0, 0.3, 0.55, 0.8]) bodySideRaw(p, oo, { mode: "march", phase, seed });
  else {
    bodyFrontRaw(p, oo, { mode: "stand", seed }); bodyFrontRaw(p, oo, { mode: "stand", wave: 1, seed });
    bodyFrontRaw(p, oo, { mode: "stand", point: 60, seed }); bodyFrontRaw(p, oo, { mode: "march", phase: 0.25, seed });
  }
  const k = Math.min(1, (975 - MARGIN) / (975 - g.y0), (300 - MARGIN) / Math.max(1, 300 - g.x0), (300 - MARGIN) / Math.max(1, g.x1 - 300));
  fitCache.set(key, k);
  return k;
};
const fitted = (p: Pen, k: number, draw: () => void) => {
  if (k >= 0.999) return draw();
  const g = p.g; g.save(); g.translate(300, 975); g.scale(k, k); g.translate(-300, -975); draw(); g.restore();
};
export const bodyFront = (p: Pen, o: Outfit, opts: FrontOpts) => fitted(p, fitOf(o, opts.seed ?? 1, false), () => bodyFrontRaw(p, o, opts));
/** where the front card's last arm ends (design units, after fitting): lets a 3D scene hang a prop on the hand */
export const frontHand = (o: Outfit, opts: FrontOpts): [number, number] => {
  bodyFrontRaw(new Pen(new Bounds() as unknown as CanvasRenderingContext2D), o, opts);
  const k = fitOf(o, opts.seed ?? 1, false);
  return [300 + (HAND_AT.x - 300) * k, 975 + (HAND_AT.y - 975) * k];
};
/** side view; push mode aims the hand at a canvas point, so it is drawn unscaled */
export const bodySide = (p: Pen, o: Outfit, opts: SideOpts) => fitted(p, opts.hand ? 1 : fitOf(o, opts.seed ?? 1, true), () => bodySideRaw(p, o, opts));

export const swingKid = (p: Pen, o: Outfit, kick: number, expr: Expr, light = DEF_LIGHT, blink: number = 0) => {
  const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
  // two ropes from the pivot to the ends of a wide plank, the kid framed between them: a single rope behind the kid
  // ended at the cap and read as a hanging. Far rope behind the kid, near rope drawn over (clear of the face).
  const seat = rope + 18, x0 = 150, x1 = 550;
  p.line([[350, 20], [x0 + 16, seat + 4]], "#a07a4c", 10);
  p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
  const g = p.g;
  g.save();
  g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
  g.scale(k, k);
  bodySide(new Pen(g), o, { expr, mode: "swing", pose: kick, light, seed: 5, blink });
  g.restore();
  p.line([[350, 20], [x1 - 16, seat + 4]], "#a07a4c", 10);
};

// ---------------- effects ----------------
export const fxNote = (p: Pen, kind: number, col = "#1f2a44") => {
  p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
  p.stroke([[110, 190], [110, 40]], 14);
  if (kind === 0) p.poly([[110, 40], [170, 70], [170, 110], [110, 82]], col, 8);
  else {
    p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
    p.stroke([[186, 160], [186, 20]], 14);
    p.poly([[110, 40], [186, 20], [186, 50], [110, 70]], col, 8);
  }
};

/** spark / impact star on a 500 x 500 canvas; t in 0..1 */
export const fxBurst = (p: Pen, t: number, col = "#fff3b0", rays = 10, r0 = 40, r1 = 230) => {
  const c = 250, e = 1 - (1 - t) ** 3;
  for (let i = 0; i < rays; i++) {
    const a = rad((i * 360) / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
    p.poly([[c + r0 * 0.5 * Math.cos(a + 0.18), c + r0 * 0.5 * Math.sin(a + 0.18)], [c + ra * Math.cos(a), c + ra * Math.sin(a)],
      [c + r0 * 0.5 * Math.cos(a - 0.18), c + r0 * 0.5 * Math.sin(a - 0.18)]], col, Math.max(3, 8 * (1 - t)));
  }
  if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};

/** water splash crown on an 800 x 800 canvas; t in 0..1 */
export const fxSplash = (p: Pen, t: number) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
  const blue = "#bfe8ff", deep = "#6cc0f0";
  if (rise > 0.02) {
    const pts: P2[] = [];
    for (let i = 0; i < 19; i++) {
      const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
      pts.push([c - 330 + (660 * i) / 18, size - 120 - h]);
    }
    p.poly([...pts, [c + 330, size - 90], [c - 330, size - 90]], blue, 10);
    p.ell(c, size - 100, 360, 46, deep, 10);
  }
  for (let i = 0; i < 8; i++) {
    const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
  }
};

/** dust puff on a 300 x 300 canvas; t in 0..1 */
export const fxPuff = (p: Pen, t: number) => {
  for (let i = 0; i < 5; i++) {
    const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
    p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
  }
};

/** circling stars on a 420 x 210 canvas */
export const fxStars = (p: Pen, t: number) => {
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i * Math.PI) / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts: P2[] = [];
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90); pts.push([x + r * Math.cos(b), y + r * Math.sin(b)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};

/** three jittering strain ticks on a 300 x 300 canvas */
export const fxCreak = (p: Pen, t: number) => {
  const j = 6 * Math.sin(t * 40);
  for (const a of [-30, 0, 30]) {
    const b = rad(a - 90);
    p.stroke([[150 + 70 * Math.cos(b) + j, 230 + 70 * Math.sin(b)], [150 + 100 * Math.cos(b) + 10 + j, 230 + 100 * Math.sin(b)],
      [150 + 130 * Math.cos(b) + j, 230 + 130 * Math.sin(b)]], 10);
  }
};

/** flat water ring (drawn top-down) on a 600 x 600 canvas; t in 0..1 */
export const fxRing = (p: Pen, t: number) => {
  // thin light water rings (white crest, pale blue trailing rings), thinning as they spread
  const g = p.g;
  for (let k = 0; k < 3; k++) {
    const u = t - k * 0.22;
    if (u <= 0 || u >= 1) continue;
    g.beginPath(); g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
    g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa"; g.lineWidth = 9 * (1 - u) + 3; g.stroke();
  }
};

/** text-free sign on a 700 x 520 canvas: "no marching in step on the bridge". A bridge (deck + arch + piers), four
 *  identical pairs of marching legs in the same stride (in step), a bold red X over all of it. */
export const fxSign = (p: Pen) => {
  const g = p.g, RED = "#d42f2f";
  p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
  p.poly(rrect(14, 14, 686, 506, 40), null, 14);
  // bridge: deck, stone arch underneath, two piers
  p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
  g.beginPath(); g.moveTo(112, 470); g.quadraticCurveTo(350, 300, 588, 470);
  g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.stroke();
  for (const x of [88, 612]) p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
  // four identical soldiers' legs mid-stride: same leg forward on every one = in step
  for (const x of [150, 278, 406, 534]) {
    p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);                  // coat hem
    p.stroke([[x - 8, 210], [x + 34, 262], [x + 46, 338]], 15, INK);           // front leg
    p.stroke([[x + 6, 210], [x - 12, 274], [x - 36, 336]], 15, INK);           // back leg
    p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);                          // boots point forward
    p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
  }
  // big red X
  for (const [a, b] of [[[96, 70], [604, 452]], [[604, 70], [96, 452]]] as [[number, number], [number, number]][]) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 42, RED);
  }
};

/** soft cartoon cloud on a 600 x 300 canvas */
export const fxCloud = (p: Pen, seed: number) => {
  const blobs: [number, number, number][] = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
};

/** cast shadow on a 128 x 256 canvas: dark soft contact pool at the feet (y 205) and a softer tail that runs up the
 *  canvas = away from the sun, fading with distance; multiply colour (sRGB-encoded linear ratio), white = no change */
export const fxShadow = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 256);
  g.save(); g.filter = "blur(9px)";
  const lg = g.createLinearGradient(0, 205, 0, 22);
  lg.addColorStop(0, mix(col, WHITE, 0.08)); lg.addColorStop(0.55, mix(col, WHITE, 0.3)); lg.addColorStop(1, mix(col, WHITE, 0.85));
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(40, 205); g.bezierCurveTo(36, 120, 46, 50, 64, 30); g.bezierCurveTo(82, 50, 92, 120, 88, 205); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** tight contact shadow right under the feet on a 128 x 128 canvas: dark core, short fall-off (multiply colour) */
export const fxContact = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** floating wooden plank, side-on, on a 320 x 110 canvas */
export const fxPlank = (p: Pen) => {
  p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
  p.line([[40, 46], [150, 44], [270, 50]], "#7d5234", 4);
  p.line([[60, 62], [200, 64], [284, 60]], "#7d5234", 4);
  p.dot(36, 54, 5, INK); p.dot(284, 54, 5, INK);
};

/** floating marching drum (no text) on a 260 x 240 canvas: white shell, red hoops, ink zig-zag cord */
export const fxDrum = (p: Pen) => {
  p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
  p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
  p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
  p.line([[52, 88], [82, 172], [112, 88], [142, 172], [172, 88], [202, 172]], INK, 6);
  p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};

/** soft ground contact blob on a 128 x 128 canvas, multiply colour (sRGB-encoded linear ratio) in the centre */
export const fxBlob = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  // soft contact shadow: flat core, then a long smooth (roughly gaussian) fall-off to white = no change
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.5, 0.04], [0.64, 0.18], [0.76, 0.42], [0.87, 0.72], [0.95, 0.92], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

// =====================================================================================================================
// FRIENDS: the modern adult cast (你的朋友，有几个也把你当朋友？)
// =====================================================================================================================
// Same construction as above (superellipse head, bean torso, single-stroke limbs, thick-thin outline, painted crescent),
// modern clothes, eight haircuts, glasses, lanyard + badge, a headband, a gold 你 tag, and a small IK rig:
//   poseFig(look, req, view)  -> Solved   pure + cheap: every joint in FRAME units (no drawing); used for the pool key and
//                                          for the world-space hand / ankle / head points ropes attach to
//   paintFig(pen, look, solved, face)     draws it into a frame-sized canvas (pen transform = design units)
// Body logic (production-crew figure-rules R1-R8): legs start at the hip inside the torso bottom; a seated torso ends at
// the seat line and the thighs are drawn over the lap; arms are two-bone IK chains of fixed length (a target out of reach
// leaves the hand short, never a stretched arm); shoulders sit at the top of the torso; one flat tone per limb (no far
// limb tint, no joints). Every function here is a pure function of its inputs (time comes in as req.t / req.phase).
export const FIG_H = 780;             // standing height, sole to crown, in design units (all seeds)
export const SOLE = 975;              // local sole line (design units)
export const SU = 1.45 / FIG_H;       // metres per design unit (figures are 1.45 m tall)

export type Top = "hoodie" | "tee" | "cardigan" | "jacket" | "sweater" | "run";
export type Bottom = "jeans" | "chinos" | "skirt" | "shorts";
export type Hair = "short" | "side" | "curly" | "bun" | "ponytail" | "bob" | "buzz" | "long";
export type Look = {
  /** head shape, proportions and quirks */
  seed: number; skin: string;
  top: Top; topCol: string;
  /** shirt / tee under a cardigan or an open jacket; collar of a hoodie's lining */
  inner?: string;
  /** second colour: sweater stripe, running-top panel, hoodie strings */
  trim?: string;
  bottom: Bottom; botCol: string;
  /** leg colour under a skirt or shorts (tights / bare legs); default = skin toward ink */
  legCol?: string;
  shoes: string; shoeSole?: string;
  hair: Hair; hairCol: string;
  /** hair part / ponytail side: -1 canvas left, 1 canvas right (front view) */
  part?: -1 | 1;
  glasses?: "round" | "square"; glassCol?: string;
  /** group film: a dark cloth blindfold tied round the head over the eyes (knot tails at the back / side) */
  blindfold?: string;
  /** lanyard strap colour (draws the strap and an ID badge) */
  lanyard?: string;
  /** the protagonist's gold 你 tag on the chest */
  tag?: boolean;
  headband?: string;
  /** torso width factor (default 1) */
  width?: number;
};
export type View = "front" | "side" | "back";
export type PoseKind = "idle" | "walk" | "jog" | "desk" | "write" | "cardUp" | "curl" | "hold" | "haul" | "throw" | "wave" | "point"
  | "dust" | "lookDown" | "reach" | "dragged" | "sitUp" | "phone";
/** per-arm aim: canvas angle in degrees (0 = canvas right = forward in the side view, 90 = up), reach 0..1 of the
 *  arm's length as seen on the card (foreshortening), behind = the arm goes away from the camera (drawn behind the torso) */
export type ArmAim = { dir: number; reach?: number; behind?: boolean } | null;
export type HeldProp = "clipboard" | "card" | "phone" | "pen" | null;
export type PoseReq = {
  kind: PoseKind;
  /** seconds (breathing, waving, writing, dusting); every drawing is a pure function of it */
  t?: number;
  /** 0..1 cycle phase for walk / jog / haul / throw (default from t) */
  phase?: number;
  /** hold / haul / point / wave: index 0 = canvas-left arm (front, back) or far arm (side); 1 = canvas-right / near arm */
  aim?: [ArmAim, ArmAim];
  /** hold / haul: both hands on ONE rope along aim[1] (hand 1 leads, hand 0 behind it on the same line) */
  grip?: boolean;
  /** haul effort, reach progress, curl tightness, throw power ... 0..1 */
  amount?: number;
  /** seated: seat-top height above the floor (design units). Seated kinds: desk, write, cardUp, and base "seat" */
  seat?: number;
  /** seated at a desk: hip -> desk near edge along the facing, and desk-top height above the floor (design units) */
  desk?: { edge: number; top: number };
  /** reach: hand target relative to the ROOT, x forward (side) / canvas right (front), y up (design units) */
  target?: [number, number];
  /** phone / reach / lookDown / hold / idle: standing (default), on a seat, or sitting up in bed */
  base?: "stand" | "seat" | "bed";
  /** cardUp / card prop: what is written on the held card */
  card?: string;
  /** props held in hand 0 / hand 1 */
  props?: [HeldProp, HeldProp];
  /** walk / jog stride scale (foreshortening of an oblique walk) */
  stride?: number;
  /** extra torso lean (deg, + = top toward canvas right) and head tilt (deg) */
  lean?: number; headTilt?: number;
  /** curl / sitUp: draw a blanket of this colour over the body */
  blanket?: string;
};
/** card frame in design units: w x h, root (the world anchor: floor point under the feet / hip) at (ox, oy) */
export type Frame = { name: string; w: number; h: number; ox: number; oy: number };
export const FRAMES: Record<"stand" | "wide" | "lie", Frame> = {
  stand: { name: "stand", w: 760, h: 1000, ox: 380, oy: 975 },
  wide: { name: "wide", w: 1100, h: 1000, ox: 550, oy: 975 },
  lie: { name: "lie", w: 1300, h: 760, ox: 650, oy: 700 },
};
/** which views each pose has (the first is the fallback) */
export const VIEWS: Record<PoseKind, View[]> = {
  idle: ["front", "side", "back"], walk: ["side"], jog: ["side"], desk: ["front", "side", "back"], write: ["front", "side", "back"],
  cardUp: ["front", "side", "back"], curl: ["side"], hold: ["front", "side", "back"], haul: ["side", "front"], throw: ["side"],
  wave: ["front", "side", "back"], point: ["front", "side", "back"], dust: ["front"], lookDown: ["front", "side", "back"],
  reach: ["side", "front"], dragged: ["side"], sitUp: ["side"], phone: ["front", "side", "back"],
};
export const SEATED = (r: PoseReq) => r.kind === "desk" || r.kind === "write" || r.kind === "cardUp" || r.base === "seat";
export const LYING = (r: PoseReq) => r.kind === "curl" || r.kind === "dragged";
/** metres the body travels per walk / jog cycle (two steps): drive phase = distance / this to plant the feet */
export const WALK_CYCLE_M = 2 * 330 * SU, JOG_CYCLE_M = 2 * 470 * SU;

export type Dims = { ha: number; H: Blob; W: number; HH: number; u: number; torso: number; legLen: number; aLen: number; Ta: number; Tas: number; Q: ReturnType<typeof quirk> };
const DIMS = new Map<string, Dims>();
export const dimsOf = (L: Look): Dims => {
  const k = `${L.seed}|${L.width ?? 1}`, hit = DIMS.get(k);
  if (hit) return hit;
  const Q = quirk(L.seed);
  const ha = 110 * (0.97 + 0.06 * rnd(L.seed, 52)), H = headBlob(L.seed, ha);
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torso = 250 * Q.torso;
  const legLen = FIG_H - 4 * u + 0.12 * HH - torso - HH;
  const tw = 0.8 * (0.9 + 0.2 * rnd(L.seed, 23)) * (L.width ?? 1);
  const d: Dims = { ha, H, W, HH, u, torso, legLen, aLen: 0.95 * HH, Ta: ((tw / 2) * W) / 1.06, Tas: 0.3 * W * (0.92 + 0.16 * rnd(L.seed, 23)) * (L.width ?? 1), Q };
  DIMS.set(k, d);
  return d;
};

// ---------------- rig types ----------------
export type ArmS = { s: P2; e: P2; h: P2; front: boolean; flat?: boolean };   // flat: forearm drawn straight (resting on a desk), not one bezier through the elbow
export type LegS = { h: P2; k: P2; a: P2; pitch: number; front: boolean; shin?: boolean; flat?: boolean };
export type PropS = { kind: "clipboard" | "card" | "phone" | "pen" | "paper"; hand: 0 | 1; at: P2; ang: number; text?: string; face?: "front" | "back" | "edge" | "three" };
export type Solved = {
  req: PoseReq; view: View; frame: Frame;
  /** local -> frame: rotate by roll (rad) about piv, then translate by tr */
  roll: number; piv: P2; tr: P2;
  hip: P2; lean: number; headTilt: number; torsoBot: number; chin: number; tcx: number; breathe: number;
  arms: [ArmS, ArmS]; legs: [LegS, LegS];
  seated: boolean; bed: boolean; lying: boolean;
  props: PropS[]; lookUp: number; look: number; facing: -1 | 0 | 1; blanket?: string;
  /** frame-unit exports (after roll): hand ends, ankles, head centre + radius, hip */
  out: { hand: [P2, P2]; ankle: [P2, P2]; head: P2; headR: number; hip: P2; shoulder: [P2, P2] };
};

const add2 = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const sub2 = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const scl2 = (a: P2, k: number): P2 => [a[0] * k, a[1] * k];
const len2 = (a: P2) => Math.hypot(a[0], a[1]);
const dirV = (deg: number): P2 => [Math.cos(rad(deg)), -Math.sin(rad(deg))];
const rotV = (v: P2, a: number): P2 => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const smooth01 = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
/** two-bone IK in the card plane: a = root, t = target, bend +1 = joint clockwise of the a->t line (canvas: below a
 *  rightward line). Out of reach: the chain is straight and the end stops short (e = where it really ends). */
export const ik2 = (a: P2, t: P2, l1: number, l2: number, bend: number): { j: P2; e: P2 } => {
  const dx = t[0] - a[0], dy = t[1] - a[1], d0 = Math.hypot(dx, dy) || 1e-6;
  const d = clamp(d0, Math.abs(l1 - l2) + 1, l1 + l2 - 0.5), ux = dx / d0, uy = dy / d0;
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), ang = Math.atan2(uy, ux) + bend * A;
  return { j: [a[0] + l1 * Math.cos(ang), a[1] + l1 * Math.sin(ang)], e: [a[0] + ux * d, a[1] + uy * d] };
};

/** the torso frame for a hip point and a lean: shoulders, head centre, rotation helper (all final local coords) */
type Body = { hip: P2; lean: number; torsoBot: number; chin: number; tcx: number; sh: [P2, P2]; hc: P2; rot: (q: P2) => P2 };
const bodyAt = (D: Dims, view: View, hip: P2, lean: number, torsoBot: number, breathe = 0): Body => {
  const { HH, u, torso, Ta, Tas, H } = D;
  const chin = torsoBot - torso - breathe, a = rad(lean), c = Math.cos(a), s = Math.sin(a);
  const rot = (q: P2): P2 => [hip[0] + (q[0] - hip[0]) * c - (q[1] - hip[1]) * s, hip[1] + (q[0] - hip[0]) * s + (q[1] - hip[1]) * c];
  const tcx = view === "side" ? hip[0] + 2 * u : hip[0];
  const sy = chin + (view === "side" ? 0.14 : 0.12) * HH - 0.5 * breathe;
  const sh: [P2, P2] = view === "side"
    ? [rot([tcx + 0.05 * Tas - 5 * u, sy - 2 * u]), rot([tcx + 0.05 * Tas, sy])]
    : [rot([tcx - 0.85 * Ta, sy]), rot([tcx + 0.85 * Ta, sy])];
  return { hip, lean, torsoBot, chin, tcx, sh, hc: rot([hip[0] + (view === "side" ? 4 * u : 0), chin - H.b]), rot };
};

/** arms hanging (front / back: out to the side, elbow out; side: down along the body), with a sway */
const hangArm = (D: Dims, B: Body, view: View, i: 0 | 1, sway = 0): ArmS => {
  const { HH, u, Ta, Q, aLen } = D, side = i ? 1 : -1, S = B.sh[i];
  if (view === "side") {
    const ang = rad(sway * 28) + rad(i ? -3 : 4), e: P2 = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(14);
    return { s: S, e, h: [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5], front: i === 1 };
  }
  // in the torso frame (unrotated), then rotated with it; the hand hangs at hip level beside the bean
  const tc = B.hip[0], sy0 = B.chin + 0.12 * HH;
  const ex = tc + side * (1.1 * Ta + (4 + 5 * Q.arm[i]) * u), hx = ex + side * 3 * u + side * 3 * u * sway;
  const e = B.rot([ex, sy0 + 0.47 * HH]), h = B.rot([hx, sy0 + 0.47 * HH + 0.46 * aLen]);
  return { s: S, e, h, front: view === "back" ? false : false };
};
/** arm toward a point: IK with the elbow on the lower side (natural), lengths scaled by fs (foreshortening) */
const armTo = (D: Dims, S: P2, T: P2, front: boolean, fs = 1, preferBend?: number): ArmS => {
  const l = D.aLen * 0.5 * fs;
  let r = ik2(S, T, l, l, preferBend ?? 1);
  if (preferBend === undefined) { const r2 = ik2(S, T, l, l, -1); if (r2.j[1] > r.j[1]) r = r2; }
  return { s: S, e: r.j, h: r.e, front };
};
/** arm with an explicit elbow (front views: foreshortened forearms toward the camera) */
const armVia = (S: P2, E: P2, Hd: P2, front: boolean): ArmS => ({ s: S, e: E, h: Hd, front });

/** standing legs (front / back / side), knees a touch soft */
const standLegs = (D: Dims, view: View, hipY: number, cx: number, spread = 1): [LegS, LegS] => {
  const { u, Q, legLen } = D, ankY = SOLE - 4 * u, l = legLen / 2;
  if (view === "side") {
    const mk = (dx: number, near: boolean): LegS => { const h: P2 = [cx + (near ? 0 : -5 * u), hipY], a: P2 = [cx + dx, ankY]; return { h, k: ik2(h, a, l, l, -1).j, a, pitch: 0, front: near }; };
    return [mk(-5 * u, false), mk(4 * u, true)];
  }
  const mk = (side: number, j: number): LegS => {
    const h: P2 = [cx + side * 15 * u, hipY], a: P2 = [cx + side * (20 + 7 * Q.foot[j]) * u * spread, ankY];
    return { h, k: ik2(h, a, l, l, side > 0 ? -1 : 1).j, a, pitch: 0, front: false };
  };
  return [mk(-1, 0), mk(1, 1)];
};

/** seated legs: thigh from the hip forward over the seat, shin down to the floor (shin may stretch up to 1.25x so a
 *  1.45 m figure's feet reach the floor from an adult chair; the thigh tilts down only as much as needed) */
const seatLegs = (D: Dims, view: View, hip: P2, seatY: number): [LegS, LegS] => {
  const { u, legLen } = D, l1 = legLen / 2, l2 = legLen / 2, ankY = SOLE - 4 * u;
  let th = rad(4);
  for (let d = 4; d <= 55; d += 1) { th = rad(d); if (hip[1] + l1 * Math.sin(th) + 1.22 * l2 >= ankY) break; }
  if (view === "side") {
    // the thigh lies ON the seat (bottom edge on the seat line) out to the knee, ~l1 forward (past the front edge of a
    // classroom / dorm seat, .2-.28 m ahead of the hip), and the shin drops to the floor, stretched if it must be (as the
    // front view already does). A thigh sloped down to make a short leg reach the floor ran through the seat front.
    const high = hip[1] + l1 * Math.sin(rad(4)) + 1.22 * l2 < ankY;
    const mk = (near: boolean): LegS => {
      const h: P2 = [hip[0] + (near ? 0 : -4 * u), hip[1]];
      const k: P2 = high ? [h[0] + 0.98 * l1, seatY - 3 * u] : [h[0] + l1 * Math.cos(th), h[1] + l1 * Math.sin(th)];
      const a: P2 = [k[0] - 0.06 * l2 + (near ? 0 : -3 * u), ankY];
      return { h, k, a, pitch: 0, front: near, flat: high };
    };
    return [mk(false), mk(true)];
  }
  // front / back: the thigh comes toward the camera (foreshortened), the knee just below the seat line
  const mk = (side: number): LegS => {
    const h: P2 = [hip[0] + side * 15 * u, hip[1]], k: P2 = [hip[0] + side * 26 * u, seatY + 0.035 * D.HH + l1 * Math.sin(th) * 0.25];
    return { h, k, a: [hip[0] + side * 30 * u, ankY], pitch: 0, front: view === "front", shin: view === "back" };
  };
  return [mk(-1), mk(1)];
};

/** a phase from t for cycles */
const phaseOf = (r: PoseReq, hz: number) => r.phase ?? (((r.t ?? 0) * hz) % 1 + 1) % 1;

/** solve a pose for one view. Pure: the same inputs always give the same joints. */
export function poseFig(L: Look, req: PoseReq, viewIn: View): Solved {
  const D = dimsOf(L), { HH, u, legLen, aLen, H, Ta } = D, t = req.t ?? 0, two = Math.PI * 2;
  const views = VIEWS[req.kind], view: View = views.includes(viewIn) ? viewIn : views[0];
  const ankY = SOLE - 4 * u;
  let frame = FRAMES.stand, roll = 0, lean = req.lean ?? 0, headTilt = req.headTilt ?? 0, lookUp = 0, look = 0, facing: -1 | 0 | 1 = 0;
  let arms!: [ArmS, ArmS], legs!: [LegS, LegS], hip: P2 = [300, ankY - legLen * 0.995], torsoBot = hip[1] + 0.12 * HH, breathe = 0;
  let seated = false, bed = false;
  const props: PropS[] = [];
  /** the lean of the last body a base builder made (null: the pose built its body from `lean` directly) */
  let bodyLean: number | null = null;
  const breath = Math.sin((two * t) / 3.4);
  const base = req.base ?? (SEATED(req) ? "seat" : "stand");

  // ----- base bodies -----
  const standBody = (lean0 = 0, hipDrop = 0) => {
    hip = [300, ankY - legLen * 0.995 + hipDrop]; torsoBot = hip[1] + 0.12 * HH; breathe = 2.5 * breath;
    bodyLean = lean + lean0 + (view === "side" ? D.Q.lean * 0.5 : D.Q.lean);
    return bodyAt(D, view, hip, bodyLean, torsoBot, breathe);
  };
  const seatY = SOLE - (req.seat ?? 254);
  const seatBody = (lean0 = 0) => {
    seated = true; hip = [300, seatY - 13]; torsoBot = seatY - 2;   // outline bottom ~.5 cm into the seat top (was 1.7 cm, read as 2.4 cm 穿模 in the chair-slab check)
    breathe = 1.5 * breath; bodyLean = lean + lean0;
    return bodyAt(D, view, hip, bodyLean, torsoBot, breathe);
  };
  const bedBody = (lean0 = 0) => {
    bed = true; seated = true; frame = FRAMES.lie; hip = [300, SOLE - 9]; torsoBot = SOLE + 3; breathe = 1.5 * breath; bodyLean = lean + lean0;
    return bodyAt(D, view, hip, bodyLean, torsoBot, breathe);
  };
  const bedLegs = (bend = 0.1): [LegS, LegS] => {
    const l = legLen / 2, mk = (near: boolean): LegS => {
      const h: P2 = [hip[0] + (near ? 0 : -4 * u), hip[1]], a: P2 = [h[0] + legLen * (0.985 - 0.2 * bend), SOLE - 6 * u];
      return { h, k: ik2(h, a, l, l, -1).j, a, pitch: rad(-55), front: near };
    };
    return [mk(false), mk(true)];
  };
  const baseBody = (lean0 = 0, hipDrop = 0): Body => (base === "seat" ? seatBody(lean0) : base === "bed" ? bedBody(lean0) : standBody(lean0, hipDrop));
  const baseLegs = (B: Body): [LegS, LegS] => (base === "seat" ? seatLegs(D, view, B.hip, seatY) : base === "bed" ? bedLegs() : standLegs(D, view, B.hip[1], B.hip[0]));
  /** resting arms for a base: hanging (stand), hands on the thighs (seat), hands on the mattress (bed) */
  const restArm = (B: Body, i: 0 | 1, sway = 0): ArmS => {
    if (base === "stand") return hangArm(D, B, view, i, sway);
    if (base === "bed" || view === "side") {
      const lg = (legs ?? baseLegs(B))[i], tgt: P2 = base === "bed" ? [B.hip[0] + 0.22 * legLen + (i ? 0 : -6 * u), SOLE - 7 * u] : lerp2(lg.h, lg.k, 0.62);
      return armTo(D, B.sh[i], [tgt[0], tgt[1] - 6 * u], i === 1, 1, 1);
    }
    const side = i ? 1 : -1, lg = (legs ?? baseLegs(B))[i];
    return armVia(B.sh[i], B.rot([B.tcx + side * (1.08 * Ta + 3 * u), B.chin + 0.5 * HH]), [lg.k[0] - side * 4 * u, lg.k[1] - 8 * u], view === "front");
  };

  const k = req.kind;
  if (k === "idle") {
    const B = baseBody();
    legs = baseLegs(B);
    const sw = 0.05 * Math.sin((two * t) / 3.4 + 0.6);
    arms = [restArm(B, 0, sw), restArm(B, 1, -sw)];
    headTilt += 1.2 * Math.sin((two * t) / 5.1);
  } else if (k === "walk" || k === "jog") {
    // side view, facing canvas right: stance foot planted (slides back at body speed), cycloid swing, hip over the stance leg
    const jog = k === "jog", ph = phaseOf(req, jog ? 1.45 : 0.95), S = (jog ? 470 : 330) * (req.stride ?? 1), duty = jog ? 0.36 : 0.5;
    const liftH = jog ? 62 : 34, Dst = 2 * S * duty, l = legLen / 2;
    const st = (o: number) => {
      const c = (((ph + o) % 1) + 1) % 1;
      if (c < duty) { const s = c / duty; return { x: Dst / 2 - Dst * s, h: 0, stance: true, s }; }
      const s = (c - duty) / (1 - duty), span = Dst; // swing: from -Dst/2 to +Dst/2 (cycloid ease), lifted
      return { x: -span / 2 + span * s - (span / two) * Math.sin(two * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL.stance ? fL : null;
    let hy: number;
    if (stance) { const Le = legLen * (jog ? 0.94 : 0.985) * (1 - 0.03 * Math.sin(Math.PI * stance.s)); hy = ankY - Math.sqrt(Math.max(1, Le * Le - stance.x * stance.x)); }
    else { const c = (((ph % 0.5) / 0.5 - duty * 2) / (1 - duty * 2)); hy = ankY - legLen * 0.94 - 26 * Math.sin(Math.PI * clamp(c, 0, 1)); }
    hip = [300, hy]; torsoBot = hip[1] + 0.12 * HH;
    lean += jog ? 9 + 2 * Math.cos(2 * two * ph) : 3 + 2 * Math.cos(2 * two * ph);
    const B = bodyAt(D, view, hip, lean, torsoBot, 0);
    legs = ([[fL, false], [nL, true]] as const).map(([Lg, near]) => {
      const h: P2 = [300 + (near ? 0 : -5 * u), hy], a: P2 = [300 + Lg.x, ankY - Lg.h];
      return { h, k: ik2(h, a, l, l, -1).j, a, pitch: Lg.stance ? 0 : rad((jog ? 50 : 32) * Math.sin(Math.PI * Lg.s) * (1 - 1.5 * Lg.s)), front: near };
    }) as [LegS, LegS];
    const nf = nL.x / (Dst / 2 || 1);
    if (jog) {
      // bent elbows (~90 deg), the arm opposite the near leg forward
      arms = ([0, 1] as const).map((i) => {
        const sgn = i ? -1 : 1, ua = rad(38 * nf * sgn), S0 = B.sh[i];
        const e: P2 = [S0[0] + Math.sin(ua) * aLen * 0.5, S0[1] + Math.cos(ua) * aLen * 0.5], fa = ua + rad(95);
        return { s: S0, e, h: [e[0] + Math.sin(fa) * aLen * 0.46, e[1] + Math.cos(fa) * aLen * 0.46], front: i === 1 };
      }) as [ArmS, ArmS];
    } else arms = [hangArm(D, B, view, 0, nf), hangArm(D, B, view, 1, -nf)];
  } else if (k === "desk" || k === "write" || k === "cardUp") {
    const desk = req.desk, write = k === "write";
    let B = seatBody(write ? 7 : 2);
    legs = seatLegs(D, view, B.hip, seatY);
    if (write) { headTilt += view === "side" ? 8 : 0; lookUp = -0.9; }
    if (!desk) {
      arms = [restArm(B, 0), restArm(B, 1)];
    } else if (view === "side") {
      const dY = SOLE - desk.top, fy = dY - 8;   // forearm centre line: stroke half width (~6.7) / hand dot (7.8) rests ON the top
      // forearms flat ON the desk-top line, elbow where the upper arm meets that line (never below it: no elbow through
      // the desk). Lean forward (at most 16 deg more) until the elbow reaches the desk's near edge; a far desk leaves the
      // elbow just short of the edge with the forearm resting across it (R6: every hand within reach, on a surface)
      const base0 = write ? 7 : 2, l = aLen * 0.5, edgeX = B.hip[0] + desk.edge;
      const elbowX = (S: P2) => { const dy = fy - S[1]; return dy < l ? S[0] + Math.sqrt(l * l - dy * dy) : S[0]; };
      for (let n = 1; n <= 8 && elbowX(B.sh[1]) < edgeX - 2 * u; n++) B = seatBody(base0 + 2 * n);
      const mkA = (i: 0 | 1): ArmS => {
        const S = B.sh[i], dy = fy - S[1];
        const E: P2 = dy < l ? [elbowX(S), fy] : add2(S, [0, l]);
        let hxA = E[0] + l * (dy < l ? 1 : 0.7) - (i ? 0 : 4 * u), hy = fy;
        if (write && i === 1) { hxA -= 4 * u * (1 - Math.cos(two * t * 2.6)); hy -= 2 * u * Math.abs(Math.sin(two * t * 2.6)); }
        const r = ik2(S, [hxA, hy], l, l, 1);   // the same chain re-solved, so the arm length stays exact
        return { s: S, e: r.j[1] > fy ? E : r.j, h: r.e, front: i === 1, flat: true };
      };
      arms = [mkA(0), mkA(1)];
      if (k === "cardUp") arms[1] = armTo(D, B.sh[1], [B.sh[1][0] + 0.6 * aLen, B.sh[1][1] - 0.7 * aLen], true, 1, 1);   // card held up in front of the face, not over it
    } else {
      const dY = SOLE - desk.top, fy = dY - 8, sgnB = view === "back";
      const mkA = (i: 0 | 1): ArmS => {
        const side = i ? 1 : -1, S = B.sh[i];
        const E: P2 = [B.tcx + side * (Ta + 3 * u), fy];
        let Hd: P2 = [B.tcx + side * 0.3 * Ta, fy];
        if (write && i === 1) Hd = [B.tcx + 0.12 * Ta + 5 * u * Math.sin(two * t * 2.6), fy - 2 * u * Math.abs(Math.cos(two * t * 2.6))];
        return { ...armVia(S, E, Hd, !sgnB), flat: true };
      };
      arms = [mkA(0), mkA(1)];
      if (k === "cardUp") {
        const S = B.sh[1], side = 1;
        arms[1] = armVia(S, B.rot([B.tcx + side * (Ta + 14 * u), S[1] - 0.12 * HH]), B.rot([B.tcx + side * (0.95 * Ta), B.chin - 1.08 * HH]), false);
      }
    }
    if (write) props.push({ kind: "pen", hand: 1, at: arms[1].h, ang: view === "side" ? rad(-60) : rad(-70) });
    if (k === "cardUp") props.push({ kind: "card", hand: 1, at: arms[1].h, ang: 0, text: req.card ?? "", face: view === "back" ? "back" : view === "side" ? "three" : "front" });
  } else if (k === "curl") {
    // lying, body along the frame (head to canvas left, back on the support line, face up), knees drawn up to the chest
    frame = FRAMES.lie; roll = rad(-90); const c = req.amount ?? 0.8;
    hip = [300, ankY - legLen]; torsoBot = hip[1] + 0.12 * HH; breathe = 1.2 * breath;
    lean += 2 + 22 * c * c; headTilt += 12 + 8 * c;   // a loose curl lies nearly flat, a tight one rounds the back
    const B = bodyAt(D, view, hip, lean, torsoBot, breathe), l = legLen / 2;
    // frame directions converted to local (rotate by -roll): thighs up and toward the head, shins folded back
    const loc = (fd: P2) => rotV(fd, -roll);
    const kd = loc(dirV(70 + 45 * c)), sd = loc(dirV(-25 + 10 * c));
    legs = ([false, true] as const).map((near) => {
      const h: P2 = [hip[0] + (near ? 0 : -4 * u), hip[1]], kk = add2(h, scl2(kd, l)), a = add2(kk, scl2(sd, l * 0.98));
      return { h, k: add2(kk, near ? [0, 0] : [-4 * u, 3 * u]), a: add2(a, near ? [0, 0] : [-4 * u, 3 * u]), pitch: rad(-40), front: near };
    }) as [LegS, LegS];
    // hands tucked under the chin, or an arm out along aim[i] (FRAME degrees, e.g. holding a rope over the bunk rail)
    const hc0: P2 = [hip[0] + 4 * u, B.chin - H.b];
    arms = ([0, 1] as const).map((i) => {
      const am = req.aim?.[i];
      if (am) { const d = loc(dirV(am.dir)), fs = clamp(am.reach ?? 1, 0.2, 1); return armTo(D, B.sh[i], add2(B.sh[i], scl2(d, aLen * 0.97 * fs)), i === 1, fs); }
      return armTo(D, B.sh[i], B.rot([hc0[0] + 0.5 * H.a + (i ? 0 : -6 * u), hc0[1] + 0.95 * H.b]), i === 1, 1, 1);
    }) as [ArmS, ArmS];
  } else if (k === "dragged") {
    // on the back along the floor (head canvas-left), one leg hauled up toward the puller (aim[1].dir, default 25 deg)
    frame = FRAMES.lie; roll = rad(-90);
    hip = [300, ankY - legLen]; torsoBot = hip[1] + 0.12 * HH;
    lean += -4 + 3 * Math.sin(two * t * 3.1); headTilt += 10;
    const B = bodyAt(D, view, hip, lean, torsoBot, 0), l = legLen / 2, loc = (fd: P2) => rotV(fd, -roll);
    const up = req.aim?.[1]?.dir ?? 25;
    const hN: P2 = [hip[0], hip[1]], aN = add2(hN, scl2(loc(dirV(up)), legLen * 0.99));
    const hF: P2 = [hip[0] - 4 * u, hip[1]], kF = add2(hF, scl2(loc(dirV(35)), l)), aF = add2(kF, scl2(loc(dirV(-12)), l));
    legs = [{ h: hF, k: kF, a: aF, pitch: rad(-30), front: false }, { h: hN, k: ik2(hN, aN, l, l, 1).j, a: aN, pitch: rad(-80), front: true }];
    const fl = Math.sin(two * t * 2.3);
    arms = [armTo(D, B.sh[0], add2(B.sh[0], scl2(loc(dirV(160 + 14 * fl)), aLen * 0.93)), false, 1, -1),
      armTo(D, B.sh[1], add2(B.sh[1], scl2(loc(dirV(135 - 18 * fl)), aLen * 0.9)), true, 1, -1)];
  } else if (k === "sitUp") {
    const B = bedBody(4);
    legs = bedLegs(0.12);
    arms = [restArm(B, 0), restArm(B, 1)];
  } else if (k === "hold" || k === "haul") {
    const haul = k === "haul", A = req.aim ?? [null, { dir: 0 }], grip = !!req.grip, eff = req.amount ?? 0.7;
    const lead = A[1] ?? A[0] ?? { dir: 0 }, dx = Math.cos(rad(lead.dir));
    const ph = phaseOf(req, 1.2);
    let B: Body;
    if (haul) {
      const back = -(14 + 16 * eff) * Math.sign(dx || 1) - 4 * Math.sin(two * ph) * Math.sign(dx || 1);
      B = base === "stand" ? standBody(back, 0.1 * legLen) : baseBody(back * 0.5);
      if (base === "stand") {
        const s = Math.sign(dx || 1), l = legLen / 2;
        const mk = (fwd: number, near: boolean, side: number): LegS => {
          const h: P2 = [B.hip[0] + (view === "side" ? (near ? 0 : -5 * u) : side * 15 * u), B.hip[1]];
          const a: P2 = [B.hip[0] + (view === "side" ? s * fwd : side * 26 * u + s * fwd * 0.35), ankY];
          return { h, k: ik2(h, a, l, l, view === "side" ? (s > 0 ? -1 : 1) : side > 0 ? -1 : 1).j, a, pitch: view === "side" ? rad(-12 * (fwd > 0 ? 1 : 0)) : 0, front: near && view === "side" };
        };
        legs = view === "side" ? [mk(-0.3 * legLen, false, -1), mk(0.36 * legLen, true, 1)] : [mk(s * -0.15 * legLen * s, false, -1), mk(0.2 * legLen, true, 1)];
      } else legs = baseLegs(B);
    } else {
      B = baseBody(-3 * dx);
      legs = baseLegs(B);
    }
    const reachOf = (a: NonNullable<ArmAim>) => clamp(a.reach ?? 1, 0.15, 1);
    const handOn = (i: 0 | 1, a: NonNullable<ArmAim>, r: number): ArmS => {
      const S = B.sh[i], fs = reachOf(a), d = dirV(a.dir);
      const T = add2(S, scl2(d, aLen * 0.97 * r * fs));
      const front = view === "side" ? i === 1 : view === "back" ? !a.behind : !a.behind;
      return armTo(D, S, T, front, fs);
    };
    if (grip) {
      // both hands on one rope along the lead arm's line; hand-over-hand when hauling
      const d = dirV(lead.dir), fs = reachOf(lead), S1 = B.sh[1], S0 = B.sh[0];
      const r1 = haul ? 0.55 + 0.4 * smooth01(1 - ((ph * 2) % 1) * 1.4) : 0.95;
      const H1 = add2(S1, scl2(d, aLen * 0.97 * r1 * fs));
      const along = haul ? 0.3 + 0.25 * Math.sin(two * ph) : 0.3;
      const H0 = add2(H1, scl2(d, -aLen * along * fs));
      arms = [armTo(D, S0, H0, view !== "back" && view !== "side" ? !lead.behind : view === "back" ? !lead.behind : false, fs), armTo(D, S1, H1, view === "side" ? true : !lead.behind, fs)];
    } else {
      arms = [A[0] ? handOn(0, A[0], haul ? 0.8 + 0.15 * Math.sin(two * ph) : 1) : restArm(B, 0), A[1] ? handOn(1, A[1], haul ? 0.8 - 0.15 * Math.sin(two * ph) : 1) : restArm(B, 1)];
    }
  } else if (k === "throw") {
    // side: wind-up (0-.45), release (.45-.6, the hand passes the aim direction at full reach), follow-through
    frame = FRAMES.wide;
    const ph = phaseOf(req, 0.8), rel = req.aim?.[1]?.dir ?? 30;
    const wind = smooth01(ph / 0.42), fire = smooth01((ph - 0.45) / 0.15), foll = smooth01((ph - 0.6) / 0.35);
    lean += -12 * wind + 26 * fire + 6 * foll;
    hip = [300 - 10 * wind + 26 * fire, ankY - legLen * 0.95]; torsoBot = hip[1] + 0.12 * HH;
    const B = bodyAt(D, view, hip, lean, torsoBot, 0), l = legLen / 2;
    const fA: P2 = [300 + 0.36 * legLen, ankY], bA: P2 = [300 - 0.3 * legLen + 0.25 * legLen * foll, ankY - 30 * foll];
    legs = [{ h: [hip[0] - 5 * u, hip[1]], k: ik2([hip[0] - 5 * u, hip[1]], bA, l, l, -1).j, a: bA, pitch: rad(-20 * foll), front: false },
      { h: [hip[0], hip[1]], k: ik2([hip[0], hip[1]], fA, l, l, -1).j, a: fA, pitch: 0, front: true }];
    // throwing arm angle (continuous, so it sweeps the right way round): hanging (-100) -> back and up behind the head
    // (-208 = 152) -> over the top to the release direction (rel - 360) -> down across the body (-405)
    const a1 = ph < 0.45 ? lerpN(-100, -208, wind) : ph < 0.6 ? lerpN(-208, rel - 360, fire) : lerpN(rel - 360, -405, foll);
    const S1 = B.sh[1], aF = lerpN(-80, 12, wind) * (1 - fire) - 100 * fire;
    arms = [armTo(D, B.sh[0], add2(B.sh[0], scl2(dirV(aF), aLen * 0.85)), false, 1),
      armTo(D, S1, add2(S1, scl2(dirV(a1), aLen * (ph < 0.45 ? 0.9 : 0.98))), true, 1, ph < 0.45 ? -1 : 1)];
  } else if (k === "wave") {
    const B = baseBody();
    legs = baseLegs(B);
    const w = Math.sin(two * t * 2.4), S = B.sh[1];
    if (view === "side") {
      const E: P2 = [S[0] + 0.3 * aLen, S[1] - 0.12 * aLen], a = rad(70 + 20 * w);
      arms = [restArm(B, 0), armVia(S, E, [E[0] + Math.cos(a) * aLen * 0.47, E[1] - Math.sin(a) * aLen * 0.47], true)];
    } else {
      const side = 1, E: P2 = [S[0] + side * 0.44 * aLen, S[1] - 0.2 * aLen], a = rad(80 - 20 * w);   // hand well clear of the head, above the shoulder
      arms = [restArm(B, 0), armVia(S, E, [E[0] + Math.cos(a) * aLen * 0.47 * side, E[1] - Math.sin(a) * aLen * 0.47], false)];
    }
  } else if (k === "point") {
    const B = baseBody(), a = req.aim?.[1] ?? { dir: 20 };
    legs = baseLegs(B);
    const S = B.sh[1], fs = clamp(a.reach ?? 1, 0.2, 1);
    const Hd = add2(S, scl2(dirV(a.dir), aLen * 0.985 * fs));
    arms = [restArm(B, 0), armTo(D, S, Hd, view === "side" || !a.behind, fs)];
    lookUp = clamp(Math.sin(rad(a.dir)), -0.6, 0.6);
    if (view === "front") facing = Math.cos(rad(a.dir)) > 0.4 ? 1 : Math.cos(rad(a.dir)) < -0.4 ? -1 : 0;
  } else if (k === "dust") {
    // smug dusting-off: one forearm across the belly, the other hand brushes along it; the arms swap every 0.8 s
    const B = standBody();
    legs = standLegs(D, view, B.hip[1], B.hip[0]);
    const swap = Math.floor(t / 0.8) % 2, s = 0.5 + 0.5 * Math.sin(two * t * 3.4);
    const held = (swap ? 1 : 0) as 0 | 1, br = (1 - held) as 0 | 1, sh = held ? 1 : -1;
    const E0 = B.rot([B.tcx + sh * (Ta + 6 * u), B.chin + 0.6 * HH]), H0 = B.rot([B.tcx - sh * 0.3 * Ta, B.chin + 0.56 * HH]);
    const tgt = add2(lerp2(E0, H0, 0.15 + 0.75 * s), [0, -6 * u]);
    const E1 = B.rot([B.tcx - sh * (Ta + 8 * u), B.chin + 0.5 * HH]);
    const A0 = armVia(B.sh[held], E0, H0, true), A1 = armVia(B.sh[br], E1, tgt, true);
    arms = held ? [A1, A0] : [A0, A1];
    headTilt += -5 * sh; lookUp = 0.25; facing = held ? 1 : -1;
  } else if (k === "lookDown") {
    const B = baseBody(view === "side" ? 6 : 0);
    legs = baseLegs(B);
    arms = [restArm(B, 0, 0.1), restArm(B, 1, 0.1)];
    lookUp = -1; headTilt += view === "side" ? 20 : 0;
  } else if (k === "reach") {
    // lean (and bend the knees) until hand 1 reaches the target (R6), amount animates rest -> grab
    const tg0 = req.target ?? [0.4 * legLen, 0], am = req.amount ?? 1;
    const T: P2 = [300 + tg0[0], SOLE - tg0[1]];
    let B = baseBody(), best = 0, drop = 0;
    const side = view === "side";
    for (let a = 0; a <= 80; a += 3) {
      // a squat that deepens with the lean (hip down to ~.6 of the leg, knees forward): with a straight-legged .18
      // drop the reach to the floor became a horizontal dive with stubby legs
      drop = base === "stand" ? 0.4 * legLen * smooth01(a / 55) : 0;
      B = baseBody(side ? a * am : 0, drop * am);
      best = a;
      if (len2(sub2(T, B.sh[1])) <= aLen * 0.97 || !side) break;
    }
    if (!side) { lean += 10 * am * Math.sign(tg0[0] || 1); B = baseBody(0, base === "stand" ? 0.12 * legLen * am : 0); }
    else if (base !== "bed") frame = FRAMES.wide;   // a deep forward bend needs the wide card
    legs = base === "stand" ? standLegs(D, view, B.hip[1], B.hip[0]) : baseLegs(B);
    if (base === "stand" && side) {
      const l = legLen / 2;
      legs = legs.map((lg) => ({ ...lg, k: ik2(lg.h, lg.a, l, l, -1).j })) as [LegS, LegS];
    }
    const rest = restArm(B, 1), tgt = lerp2(rest.h, T, am);
    arms = [restArm(B, 0), armTo(D, B.sh[1], tgt, side || true, 1, side ? 1 : undefined)];
    lookUp = -0.8 * am; void best;
  } else if (k === "phone") {
    const B = baseBody(view === "side" ? 4 : 0);
    legs = baseLegs(B);
    lookUp = -0.85; headTilt += view === "side" ? 10 : 0;
    if (view === "side") {
      const S = B.sh[1], Hd: P2 = [S[0] + 0.5 * aLen, S[1] - 0.02 * aLen];
      arms = [restArm(B, 0), armTo(D, S, Hd, true, 1, 1)];
      props.push({ kind: "phone", hand: 1, at: Hd, ang: rad(-62), face: "edge" });
    } else {
      const S = B.sh[1], E = B.rot([B.tcx + Ta + 4 * u, B.chin + 0.42 * HH]), Hd = B.rot([B.tcx - 0.02 * Ta, B.chin + (base === "seat" ? 0.1 : 0.2) * HH]);   // seated: held higher so it clears the desk
      arms = [restArm(B, 0), armVia(S, E, Hd, view === "front")];
      props.push({ kind: "phone", hand: 1, at: Hd, ang: 0, face: view === "front" ? "back" : "front" });
    }
  }
  // ----- held props (clipboard on hand 0 by the hip, a card / phone / pen in hand 1) -----
  const pr = req.props;
  if (pr) for (const i of [0, 1] as const) {
    const kd = pr[i]; if (!kd) continue;
    const at = arms[i].h;
    if (kd === "clipboard") props.push({ kind: "clipboard", hand: i, at, ang: view === "side" ? rad(-8) : rad(i ? -10 : 10), face: view === "back" ? "back" : view === "side" ? "edge" : "front" });
    else if (kd === "card") props.push({ kind: "card", hand: i, at, ang: 0, text: req.card ?? "", face: view === "back" ? "back" : view === "side" ? "three" : "front" });
    else if (kd === "phone") props.push({ kind: "phone", hand: i, at, ang: 0, face: view === "front" ? "back" : view === "side" ? "edge" : "front" });
    else if (kd === "pen") props.push({ kind: "pen", hand: i, at, ang: rad(-65) });
  }

  for (const pr2 of props) pr2.at = arms[pr2.hand].h;
  // ----- local -> frame -----
  lean = bodyLean ?? lean;   // the torso and head are drawn at the same lean the arms were solved on
  const hc = bodyAt(D, view, hip, lean, torsoBot, breathe).hc;
  let piv: P2 = [300, SOLE], tr: P2 = [frame.ox - 300, frame.oy - SOLE];
  if (roll) {
    // rotate about the hip, then rest the body's back on the support line (frame oy) with the hip over the root
    piv = hip;
    const T: Blob = { a: D.Tas, b: 0.5 * (torsoBot - (torsoBot - D.torso - 0.25 * HH)), nTop: 2, nBot: 2.5, egg: 0.1, asym: 0.06, rot: 0, noise: 0, seed: L.seed + 7 };
    const pts = [...blobPts(hip[0] + 2 * u, torsoBot - T.b, T, 24).map((q) => bodyAt(D, view, hip, lean, torsoBot, breathe).rot(q)), ...blobPts(hc[0], hc[1], H, 24)];
    let maxY = -1e9;
    for (const q of pts) maxY = Math.max(maxY, piv[1] + rotV(sub2(q, piv), roll)[1]);
    tr = [frame.ox - piv[0], frame.oy - maxY - 2.5 * u];
  }
  if (bed) tr = [frame.ox - 300, frame.oy - SOLE];
  const toF = (q: P2): P2 => { const r = rotV(sub2(q, piv), roll); return [piv[0] + r[0] + tr[0], piv[1] + r[1] + tr[1]]; };
  const out = {
    hand: [toF(arms[0].h), toF(arms[1].h)] as [P2, P2], ankle: [toF(legs[0].a), toF(legs[1].a)] as [P2, P2], head: toF(hc), headR: H.a,
    hip: toF(hip), shoulder: [toF(arms[0].s), toF(arms[1].s)] as [P2, P2],
  };
  return { req, view, frame, roll, piv, tr, hip, lean, headTilt, torsoBot, chin: torsoBot - D.torso - breathe, tcx: view === "side" ? hip[0] + 2 * u : hip[0], breathe,
    arms, legs, seated, bed, lying: !!roll, props, lookUp, look, facing, blanket: req.blanket, out };
}
const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------- painting ----------------
export type FaceOpts = {
  expr?: Expr; blink?: number;
  /** canvas angle the key light comes FROM (painted crescent + thick outline side), in the frame (after roll) */
  light?: number;
  look?: number; lookUp?: number; facing?: -1 | 0 | 1;
};
const GOLD = "#f2bf3c", GOLD_DK = "#b98322", NI_INK = "#3a2210";
/** 你, hand-set as strokes in a 100 x 100 box (font-free: renders the same on every machine) */
const NI_STROKES: P2[][] = [
  [[36, 6], [14, 46]], [[26, 30], [26, 96]],                       // 亻
  [[56, 6], [43, 30]], [[48, 24], [91, 24], [84, 39]],             // 尔: short left-falling, horizontal with a hook
  [[68, 37], [68, 89], [59, 82]],                                  // vertical with a left hook
  [[54, 52], [43, 73]], [[81, 51], [93, 71]],                      // the two dots
];
export const drawNi = (p: Pen, cx: number, cy: number, size: number, col = NI_INK) => {
  const k = size / 100;
  for (const st of NI_STROKES) p.stroke(st.map(([x, y]) => [cx + (x - 50) * k, cy + (y - 50) * k] as P2), 11.5 * k, col);
};
/** the protagonist's chest tag: gold rounded plate, darker rim, 你 */
const niTag = (p: Pen, cx: number, cy: number, w: number, h: number, u: number) => {
  p.poly(rrect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, Math.min(w, h) * 0.22), GOLD, 1.6 * u);
  p.poly(rrect(cx - w / 2 + 1.6 * u, cy - h / 2 + 1.6 * u, cx + w / 2 - 1.6 * u, cy + h / 2 - 1.6 * u, Math.min(w, h) * 0.16), null, 0.9 * u);
  drawNi(p, cx, cy + 0.02 * h, Math.min(w, h) * 0.8);
};
const strap = (p: Pen, pts: P2[], col: string, w: number, rim: number) => { p.stroke(pts, w + 2 * rim, INK); p.stroke(pts, w, col); };

const legColOf = (L: Look) => (L.bottom === "skirt" || L.bottom === "shorts" ? (L.legCol ?? mix(L.skin, INK, 0.6)) : mix(L.botCol, INK, 0.42));
const armColOf = (L: Look) => (L.top === "tee" || L.top === "run" ? mix(L.skin, INK, 0.6) : mix(L.topCol, INK, 0.48));

/** sneaker: front = rounded toe blob with a white sole line, side = a pill along the foot with a sole band */
const shoe = (p: Pen, L: Look, a: P2, pitch: number, view: View, side: number, u: number) => {
  const col = L.shoes, sole = L.shoeSole ?? "#f4f2ec";
  if (view === "side") {
    const c = Math.cos(pitch), s = Math.sin(pitch), P = (f: number, d: number): P2 => [a[0] + f * c - d * s, a[1] + f * s + d * c];
    const outline = [P(-5 * u, -3 * u), P(8 * u, -4 * u), P(15 * u, -1 * u), P(17 * u, 2.5 * u), P(15 * u, 5 * u), P(-5 * u, 5 * u), P(-6.5 * u, 1 * u)];
    p.poly(outline, col, 1.8 * u);
    p.clip(outline, () => p.poly([P(-8 * u, 2.8 * u), P(19 * u, 2.8 * u), P(19 * u, 7 * u), P(-8 * u, 7 * u)], sole, 0));
    p.poly(outline, null, 1.8 * u);
    return;
  }
  const cx = a[0] + side * 3 * u, cy = a[1] + 2.5 * u;
  const outline = ellPts(cx, cy, 10 * u, 6 * u, 0, 360, side * 8, 28);
  p.poly(outline, col, 1.8 * u);
  p.clip(outline, () => p.poly([[cx - 12 * u, cy + 2.2 * u], [cx + 12 * u, cy + 2.2 * u], [cx + 12 * u, cy + 8 * u], [cx - 12 * u, cy + 8 * u]], sole, 0));
  p.poly(outline, null, 1.8 * u);
};

// ---------------- hair ----------------
/** contiguous run of head-outline points that `keep` accepts, pushed out by k (x bump) about the head centre */
const capRun = (hp: P2[], keep: (x: number, y: number) => boolean, cx: number, cy: number, k = 1.035, bump?: (i: number) => number): P2[] => {
  const n = hp.length, kept = hp.map(([x, y]) => keep(x, y));
  const start = kept.findIndex((v, i) => v && !kept[(i + n - 1) % n]);
  const out: P2[] = [];
  if (start < 0) return kept[0] ? hp.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k] as P2) : out;
  for (let j = 0; j < n; j++) {
    const i = (start + j) % n;
    if (!kept[i]) break;
    const kk = k * (bump ? bump(i) : 1);
    out.push([cx + (hp[i][0] - cx) * kk, cy + (hp[i][1] - cy) * kk]);
  }
  return out;
};
const scallop = (a: P2, b: P2, n: number, dip: number): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i <= n * 4; i++) { const t = i / (n * 4); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + dip * Math.abs(Math.sin(Math.PI * n * t))]); }
  return out;
};
const hairFill = (p: Pen, pts: P2[], col: string, light: number, R: number, ow: number) => {
  if (pts.length < 3) return;
  p.shadedFill(pts, col, mul(col, SH_FELT), light, R, 0.35);
  p.poly(pts, null, ow);
};
type HairCtx = { L: Look; view: View; H: Blob; hp: P2[]; cx: number; hc: number; u: number; light: number; ow: number; chinY: number };
/** hair parts that sit BEHIND the head (and the torso, for long hair): drawn first */
/** which: "long" = the long-hair sheet (behind the torso in front / side, over the back in the back view);
 *  "head" = bob back piece, ponytail, bun behind the head (front / side); "over" = bun / ponytail over the back view cap */
const hairBehind = (p: Pen, c: HairCtx, which: "long" | "head" | "over") => {
  const { L, view, H, cx, hc, u, light, ow, chinY } = c, a = H.a, b = H.b, col = L.hairCol, s = L.part ?? 1, crown = hc - b;
  if (which === "long") {
    if (L.hair !== "long") return;
    const top = blobPts(cx, hc, { ...H, a: a * 1.06, b: b * 1.05, seed: H.seed + 4 }, 40).filter(([, y]) => y < hc);
    top.sort((p1, p2) => p1[0] - p2[0]);
    // front: the sheet tapers from the head's width to just outside the shoulders and stops a little below them, so
    // only two strands show beside the neck (a sheet wider than the torso, down to the chest, read as a black cape /
    // hood: a front-row classmate looked like a nun). Back: ends at the shoulder blades and tapers (to the waist it read
    // as a black slab, and a seated crowd seen from behind became a row of black blocks). Side: down the upper back.
    if (view === "front") {
      const x0 = cx - 1.03 * a, x1 = cx + 1.03 * a, bot = chinY + 0.6 * b;
      const sides: P2[] = [[x1, hc], [cx + 0.99 * a, chinY - 0.15 * b], [cx + 0.9 * a, bot - 0.12 * b], [cx + 0.74 * a, bot], [cx, bot + 0.05 * b], [cx - 0.74 * a, bot], [cx - 0.9 * a, bot - 0.12 * b], [cx - 0.99 * a, chinY - 0.15 * b], [x0, hc]];
      hairFill(p, [...top.filter(([x]) => x >= x0 && x <= x1), ...sides], col, light, a, ow);
      return;
    }
    const x0 = view === "side" ? cx - 1.02 * a : cx - 1.06 * a, x1 = view === "side" ? cx + 0.15 * a : cx + 1.06 * a;
    const back = view === "back", bot = chinY + (back ? 0.84 : 0.8) * b, tuck = back ? -0.1 * a : 0;
    const sides: P2[] = [[x1, hc], [x1 + tuck, bot - 0.2 * b], [lerpN(x0, x1, back ? 0.7 : 0.75), bot], [lerpN(x0, x1, back ? 0.3 : 0.25), bot], [x0 - (view === "side" ? 0.04 * a : tuck), bot - 0.2 * b], [x0, hc]];
    hairFill(p, [...top.filter(([x]) => x >= x0 && x <= x1), ...sides], col, light, a, ow);
    return;
  }
  if (which === "head" && view === "back") return;
  if (which === "over" && view !== "back") return;
  if (L.hair === "long") return;
if (L.hair === "bob" && view !== "back") {
    const top = blobPts(cx, hc, { ...H, a: a * 1.09, b: b * 1.06, seed: H.seed + 4 }, 40).filter(([, y]) => y < hc + 0.1 * b);
    top.sort((p1, p2) => p1[0] - p2[0]);
    const x0 = view === "side" ? cx - 1.08 * a : cx - 1.09 * a, x1 = view === "side" ? cx + 0.2 * a : cx + 1.09 * a, y1 = hc + 0.66 * b;
    const pts: P2[] = [...top.filter(([x]) => x >= x0 && x <= x1), [x1, y1 - 0.05 * b], [lerpN(x0, x1, 0.5), y1 + 0.04 * b], [x0, y1 - 0.05 * b]];
    hairFill(p, pts, col, light, a, ow);
  } else if (L.hair === "ponytail") {
    if (view === "front") {
      const r = curve([cx + s * 0.62 * a, hc - 0.55 * b], [cx + s * 1.28 * a, hc + 0.15 * b], [cx + s * 1.02 * a, hc + 1.05 * b], 12);
      const l = curve([cx + s * 1.02 * a, hc + 1.05 * b], [cx + s * 0.95 * a, hc + 0.2 * b], [cx + s * 0.55 * a, hc - 0.35 * b], 12);
      hairFill(p, s > 0 ? [...r, ...l] : [...l.reverse(), ...r.reverse()], col, light, 0.5 * a, ow);
    } else if (view === "side") {
      const r = curve([cx - 0.7 * a, hc - 0.55 * b], [cx - 1.45 * a, hc - 0.1 * b], [cx - 1.22 * a, hc + 1.05 * b], 12);
      const l = curve([cx - 1.22 * a, hc + 1.05 * b], [cx - 1.05 * a, hc + 0.15 * b], [cx - 0.75 * a, hc - 0.15 * b], 12);
      hairFill(p, [...l.reverse(), ...r.reverse()], col, light, 0.5 * a, ow);
      p.ell(cx - 0.86 * a, hc - 0.38 * b, 5 * u, 7 * u, L.trim ?? "#e0556a", 1.5 * u, 0, 360, -30);
    } else {
      const r = curve([cx + 0.2 * a, hc - 0.2 * b], [cx + 0.34 * a, hc + 0.7 * b], [cx + 0.08 * a, hc + 1.3 * b], 12);
      const l = curve([cx + 0.08 * a, hc + 1.3 * b], [cx - 0.22 * a, hc + 0.65 * b], [cx - 0.2 * a, hc - 0.2 * b], 12);
      hairFill(p, [...r, ...l], col, light, 0.5 * a, ow);
      p.ell(cx, hc - 0.12 * b, 7 * u, 5 * u, L.trim ?? "#e0556a", 1.5 * u);
    }
  } else if (L.hair === "bun") {
    const [bx, by] = view === "side" ? [cx - 0.55 * a, crown + 0.12 * b] : [cx + (view === "front" ? s * 0.06 * a : 0), crown - 0.02 * b];
    const bun = blobPts(bx, by, { a: 0.36 * a, b: 0.33 * a, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.02, seed: H.seed + 9 }, 32);
    hairFill(p, bun, col, light, 0.36 * a, ow);
    p.arc(bx - 0.05 * a, by + 0.02 * a, 0.18 * a, 0.12 * a, 200, 330, 1.2 * u, mul(col, SH_FELT));
  }
};
/** hair over the scalp: drawn after the head fill */
const hairCap = (p: Pen, c: HairCtx) => {
  const { L, view, H, hp, cx, hc, u, light, ow } = c, a = H.a, b = H.b, col = L.hairCol, s = L.part ?? 1;
  const h = L.hair, buzz = h === "buzz", fill = buzz ? mix(col, L.skin, 0.38) : col, olw = buzz ? ow * 0.55 : ow;
  const curly = h === "curly", bump = curly ? (i: number) => 1 + 0.055 * Math.abs(Math.sin((i / hp.length) * Math.PI * 18)) : undefined;
  let run: P2[] = [], edge: P2[] = [];
  if (view === "back") {
    const nape = hc + ({ short: 0.38, side: 0.38, curly: 0.42, bun: 0.3, ponytail: 0.3, bob: 0.66, buzz: 0.3, long: 0.8 } as Record<Hair, number>)[h] * b;
    run = capRun(hp, (_x, y) => y < nape, cx, hc, curly ? 1.05 : 1.035, bump);
    if (run.length > 2) { const A = run[run.length - 1], B = run[0]; edge = h === "bob" || h === "long" ? [lerp2(A, B, 0.5)] : scallop(A, B, curly ? 7 : 4, (curly ? 5 : 3) * u).slice(1, -1); }
  } else if (view === "side") {
    const front = hc - ({ short: 0.52, side: 0.6, curly: 0.48, bun: 0.62, ponytail: 0.62, bob: 0.46, buzz: 0.62, long: 0.55 } as Record<Hair, number>)[h] * b;
    const nape = hc + ({ short: 0.36, side: 0.36, curly: 0.4, bun: 0.28, ponytail: 0.28, bob: 0.64, buzz: 0.26, long: 0.75 } as Record<Hair, number>)[h] * b;
    run = capRun(hp, (x, y) => y < front || (x < cx + 0.08 * a && y < nape), cx, hc, curly ? 1.05 : 1.035, bump);
    if (run.length > 2) {
      const A = run[run.length - 1], B = run[0]; // A = forehead end, B = nape end
      const fr = h === "side" ? [[cx + 0.62 * a, front + 10 * u], [cx + 0.3 * a, front + 3 * u]] as P2[] : curly ? scallop(A, [cx + 0.2 * a, front + 2 * u], 3, 4 * u).slice(1) : [[cx + 0.5 * a, front + 3 * u]] as P2[];
      edge = [...fr, [cx + 0.17 * a, hc - 0.42 * b], [cx + 0.04 * a, hc - 0.14 * b], [cx - 0.02 * a, hc + 0.14 * b], [cx - 0.25 * a, lerpN(hc + 0.2 * b, B[1], 0.8)]]; // hairline clears the brow, temple + sideburn
    }
  } else {
    const yS = hc + ({ short: -0.08, side: -0.05, curly: 0.0, bun: -0.22, ponytail: -0.22, bob: 0.64, buzz: -0.2, long: 0.78 } as Record<Hair, number>)[h] * b;
    const cut = hc - ({ short: 0.52, side: 0.5, curly: 0.5, bun: 0.62, ponytail: 0.62, bob: 0.46, buzz: 0.64, long: 0.5 } as Record<Hair, number>)[h] * b;
    const sideW = h === "bob" ? 0.66 : h === "long" ? 0.6 : 0.8;
    run = capRun(hp, (_x, y) => y < yS, cx, hc, curly ? 1.05 : 1.035, bump); // one contiguous run even on a pointed crown (the hairline edge closes it)
    if (run.length > 2) {
      const A = run[run.length - 1], B = run[0]; // A = right end, B = left end (clockwise outline)
      const iw = (sideW - 0.06) * a;
      if (h === "short" || h === "curly") edge = [[cx + iw, yS], [cx + iw - 2 * u, cut + 3 * u], ...scallop([cx + iw - 4 * u, cut + 3 * u], [cx - iw + 4 * u, cut + 3 * u], curly ? 6 : 4, (curly ? 6 : 4) * u), [cx - iw + 2 * u, cut + 3 * u], [cx - iw, yS]];
      else if (h === "side") edge = s > 0
        ? [[cx + iw, yS], [cx + iw - 4 * u, cut - 4 * u], ...curve([cx + 0.45 * a, cut - 6 * u], [cx - 0.05 * a, cut + 8 * u], [cx - iw, cut + 18 * u], 10), [cx - iw, yS]]
        : [[cx + iw, yS], ...curve([cx + iw, cut + 18 * u], [cx + 0.05 * a, cut + 8 * u], [cx - 0.45 * a, cut - 6 * u], 10), [cx - iw + 4 * u, cut - 4 * u], [cx - iw, yS]];
      else if (h === "bob") edge = [[cx + iw, yS - 2 * u], [cx + iw - 2 * u, cut + 5 * u], ...scallop([cx + iw - 4 * u, cut + 5 * u], [cx - iw + 4 * u, cut + 5 * u], 5, 2 * u), [cx - iw + 2 * u, cut + 5 * u], [cx - iw, yS - 2 * u]];
      else if (h === "long") edge = [[cx + iw, yS], [cx + iw - 3 * u, hc - 0.05 * b], ...curve([cx + 0.5 * a, hc - 0.2 * b], [cx + 0.2 * a, cut - 2 * u], [cx + 0.02 * a, cut - 8 * u], 8), ...curve([cx - 0.02 * a, cut - 8 * u], [cx - 0.2 * a, cut - 2 * u], [cx - 0.5 * a, hc - 0.2 * b], 8), [cx - iw + 3 * u, hc - 0.05 * b], [cx - iw, yS]];
      else edge = [[cx + iw, yS], ...curve([cx + iw - 2 * u, cut + 2 * u], [cx, cut - 3 * u], [cx - iw + 2 * u, cut + 2 * u], 10), [cx - iw, yS]];
      void A; void B;
    }
  }
  if (run.length < 3) return;
  const pts = [...run, ...edge];
  hairFill(p, pts, fill, light, a, olw);
  // stubble flecks, clipped to the cap (unclipped they spilled past the head outline and read as flies / dirt)
  if (buzz) p.clip(pts, () => { for (let i = 0; i < 18; i++) {
    const t = rnd(L.seed, 60 + i) * Math.PI - Math.PI, r = 0.35 + 0.45 * rnd(L.seed, 80 + i);
    const x = cx + Math.cos(t) * a * r, y = hc + Math.sin(t) * b * r * 0.75 - 0.3 * b;
    if (y < hc - 0.45 * b) p.dot(x, y, 1.1 * u, mul(fill, SH_FELT));
  } });
  if (h === "side" && view === "front") p.stroke([[cx + s * 0.32 * a, hc - 0.98 * b], [cx + s * 0.4 * a, hc - 0.62 * b]], 1.4 * u, mul(fill, [0.7, 0.7, 0.75]));
  if (h === "long" && view === "front") p.stroke([[cx, hc - 0.98 * b], [cx + 0.02 * a, hc - 0.6 * b]], 1.3 * u, mul(fill, [0.72, 0.72, 0.78]));
  if (view === "back" && (h === "bun" || h === "ponytail")) hairBehind(p, { ...c, view: "back" }, "over");
};

// ---------------- clothes on the torso ----------------
type TorsoCtx = { L: Look; view: View; T: Blob; tp: P2[]; tcx: number; chin: number; bot: number; HH: number; u: number; light: number; thick: number; ow: number; facing: number };
const clothes = (p: Pen, c: TorsoCtx) => {
  const { L, view, T, tcx, chin, bot, HH, u } = c, a = T.a, line = shade(L.topCol, 0.7), lw = 2.1 * u, inner = L.inner ?? "#f3f1ea";
  const top = chin - 0.25 * HH;
  if (view === "front") {
    switch (L.top) {
      case "hoodie": {
        const pk = rrect(tcx - 0.52 * a, bot - 0.36 * HH, tcx + 0.52 * a, bot - 0.1 * HH, 6 * u);
        p.stroke([...pk, pk[0]], lw, line); break;
      }
      case "tee": p.arc(tcx, chin - 0.03 * HH, 0.3 * a, 0.08 * HH, 10, 170, lw, line); break;
      case "cardigan": {
        const v: P2[] = [[tcx - 0.3 * a, top], [tcx + 0.3 * a, top], [tcx + 0.04 * a, chin + 0.55 * HH], [tcx - 0.04 * a, chin + 0.55 * HH]];
        p.poly(v, inner, 0);
        p.stroke([[tcx - 0.3 * a, chin], [tcx - 0.03 * a, chin + 0.55 * HH], [tcx - 0.03 * a, bot + 10 * u]], lw, line);
        p.stroke([[tcx + 0.3 * a, chin], [tcx + 0.03 * a, chin + 0.55 * HH]], lw, line);
        for (const sd of [-1, 1]) p.poly([[tcx + sd * 0.05 * a, chin + 0.02 * HH], [tcx + sd * 0.3 * a, chin - 0.02 * HH], [tcx + sd * 0.22 * a, chin + 0.12 * HH]], inner, 1.2 * u);
        for (let i = 0; i < 3; i++) p.dot(tcx + 0.07 * a, chin + (0.66 + 0.16 * i) * HH, 2.1 * u, shade(L.topCol, 0.55));
        break;
      }
      case "jacket": {
        p.poly([[tcx - 0.2 * a, top], [tcx + 0.16 * a, top], [tcx + 0.16 * a, bot + 20 * u], [tcx - 0.2 * a, bot + 20 * u]], inner, 0);
        for (const x of [tcx - 0.2 * a, tcx + 0.16 * a]) p.stroke([[x, chin], [x, bot + 10 * u]], lw, line);
        p.stroke([[tcx - 0.2 * a - 2.5 * u, chin + 0.1 * HH], [tcx - 0.2 * a - 2.5 * u, bot + 10 * u]], 0.9 * u, shade(L.topCol, 0.85));
        for (const sd of [-1, 1]) p.stroke([[tcx + sd * 0.48 * a, bot - 0.3 * HH], [tcx + sd * 0.62 * a, bot - 0.2 * HH]], lw, line);
        p.stroke([[tcx - 0.5 * a, chin + 0.02 * HH], [tcx - 0.2 * a, chin + 0.06 * HH]], 3.2 * u, shade(L.topCol, 0.82));
        p.stroke([[tcx + 0.16 * a, chin + 0.06 * HH], [tcx + 0.46 * a, chin + 0.02 * HH]], 3.2 * u, shade(L.topCol, 0.82));
        break;
      }
      case "sweater": {
        if (L.trim) p.poly([[tcx - 1.3 * a, chin + 0.26 * HH], [tcx + 1.3 * a, chin + 0.26 * HH], [tcx + 1.3 * a, chin + 0.34 * HH], [tcx - 1.3 * a, chin + 0.34 * HH]], L.trim, 0);
        p.arc(tcx, chin - 0.03 * HH, 0.32 * a, 0.08 * HH, 10, 170, 3.4 * u, shade(L.topCol, 0.8));
        p.stroke([[tcx - 1.3 * a, bot - 0.09 * HH], [tcx + 1.3 * a, bot - 0.09 * HH]], lw, line);
        break;
      }
      case "run": {
        const tr = L.trim ?? "#ffffff";
        for (const sd of [-1, 1]) p.poly([[tcx + sd * 0.72 * a, top], [tcx + sd * 1.3 * a, top], [tcx + sd * 1.3 * a, bot + 10 * u], [tcx + sd * 0.86 * a, bot + 10 * u]], tr, 0);
        p.arc(tcx, chin - 0.02 * HH, 0.36 * a, 0.12 * HH, 10, 170, lw, line);
        break;
      }
    }
  } else if (view === "side") {
    const fx = tcx + a;
    switch (L.top) {
      case "hoodie": p.stroke([[fx - 0.45 * a, bot - 0.35 * HH], [fx - 0.05 * a, bot - 0.33 * HH]], lw, line); break;
      case "tee": case "run": break;
      case "cardigan": p.poly([[fx - 0.18 * a, top], [fx + a, top], [fx + a, bot + 10 * u], [fx - 0.1 * a, bot + 10 * u]], inner, 0); p.stroke([[fx - 0.16 * a, chin], [fx - 0.08 * a, bot + 10 * u]], lw, line); break;
      case "jacket": p.poly([[fx - 0.12 * a, top], [fx + a, top], [fx + a, bot + 10 * u], [fx - 0.08 * a, bot + 10 * u]], inner, 0); p.stroke([[fx - 0.1 * a, chin], [fx - 0.06 * a, bot + 10 * u]], lw, line); break;
      case "sweater":
        if (L.trim) p.poly([[tcx - 2 * a, chin + 0.26 * HH], [tcx + 2 * a, chin + 0.26 * HH], [tcx + 2 * a, chin + 0.34 * HH], [tcx - 2 * a, chin + 0.34 * HH]], L.trim, 0);
        p.stroke([[tcx - 2 * a, bot - 0.09 * HH], [tcx + 2 * a, bot - 0.09 * HH]], lw, line); break;
    }
  } else {
    if (L.top === "jacket" || L.top === "cardigan") p.stroke([[tcx, chin + 0.05 * HH], [tcx, bot + 10 * u]], lw * 0.8, line);
    if (L.top === "sweater" || L.top === "hoodie") p.stroke([[tcx - 1.3 * a, bot - 0.09 * HH], [tcx + 1.3 * a, bot - 0.09 * HH]], lw, line);
    if (L.top === "sweater" && L.trim) p.poly([[tcx - 1.3 * a, chin + 0.26 * HH], [tcx + 1.3 * a, chin + 0.26 * HH], [tcx + 1.3 * a, chin + 0.34 * HH], [tcx - 1.3 * a, chin + 0.34 * HH]], L.trim, 0);
    if (L.top === "run") for (const sd of [-1, 1]) p.poly([[tcx + sd * 0.72 * a, top], [tcx + sd * 1.3 * a, top], [tcx + sd * 1.3 * a, bot + 10 * u], [tcx + sd * 0.86 * a, bot + 10 * u]], L.trim ?? "#ffffff", 0);
  }
};
/** things on top of the torso (not clipped): hood, drawstrings, lanyard + badge, the 你 tag */
const torsoExtras = (p: Pen, c: TorsoCtx, stage: "behindHead") => {
  const { L, view, T, tcx, chin, HH, u, light, thick, ow } = c, a = T.a;
  void stage;
  if (L.top === "hoodie") {
    if (view === "front") {
      const hood = blobPts(tcx, chin - 0.04 * HH, { a: 0.78 * a, b: 0.15 * HH, nTop: 2.2, nBot: 2.2, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: L.seed + 21 }, 36);
      p.shadedFill(hood, shade(L.topCol, 0.92), mul(L.topCol, SH_CLOTH), light, a);
      p.inkRing(hood, ow * 0.8, thick);
      for (const sd of [-1, 1]) {
        const x = tcx + sd * 0.16 * a;
        p.stroke([[x, chin + 0.05 * HH], [x + sd * 1.5 * u, chin + 0.3 * HH]], 1.6 * u, L.trim ?? "#f4f1e8");
        p.dot(x + sd * 1.5 * u, chin + 0.3 * HH, 2.2 * u, L.trim ?? "#f4f1e8");
      }
    } else if (view === "side") {
      const hood = blobPts(tcx - 0.55 * a, chin - 0.02 * HH, { a: 0.6 * a, b: 0.16 * HH, nTop: 2.2, nBot: 2.2, egg: 0, asym: 0, rot: rad(-15), noise: 0.01, seed: L.seed + 21 }, 32);
      p.shadedFill(hood, shade(L.topCol, 0.92), mul(L.topCol, SH_CLOTH), light, a);
      p.inkRing(hood, ow * 0.8, thick);
      p.stroke([[tcx + 0.75 * a, chin + 0.06 * HH], [tcx + 0.8 * a, chin + 0.3 * HH]], 1.6 * u, L.trim ?? "#f4f1e8");
    } else {
      const hood: P2[] = [...curve([tcx - 0.62 * a, chin - 0.06 * HH], [tcx - 0.45 * a, chin + 0.32 * HH], [tcx, chin + 0.4 * HH], 10), ...curve([tcx, chin + 0.4 * HH], [tcx + 0.45 * a, chin + 0.32 * HH], [tcx + 0.62 * a, chin - 0.06 * HH], 10).slice(1)];
      p.shadedFill(hood, shade(L.topCol, 0.9), mul(L.topCol, SH_CLOTH), light, a);
      p.poly(hood, null, ow * 0.7);
    }
  }
  if (L.lanyard) {
    if (view === "front") {
      const bx = tcx + 0.04 * a, by = chin + 0.46 * HH;
      strap(p, [[tcx - 0.3 * a, chin + 0.02 * HH], [bx - 2 * u, by - 0.04 * HH]], L.lanyard, 2.6 * u, 0.7 * u);
      strap(p, [[tcx + 0.3 * a, chin + 0.02 * HH], [bx + 2 * u, by - 0.04 * HH]], L.lanyard, 2.6 * u, 0.7 * u);
      const w = 17 * u, h = 23 * u;
      p.poly(rrect(bx - w / 2, by, bx + w / 2, by + h, 2.5 * u), "#fbfaf6", 1.4 * u);
      p.poly([[bx - w / 2 + 1 * u, by + 1 * u], [bx + w / 2 - 1 * u, by + 1 * u], [bx + w / 2 - 1 * u, by + 5.5 * u], [bx - w / 2 + 1 * u, by + 5.5 * u]], L.lanyard, 0);
      p.poly(rrect(bx - 5 * u, by + 7.5 * u, bx + 1 * u, by + 14.5 * u, 1 * u), "#c9d3de", 0.8 * u);
      for (const k of [0, 1]) p.stroke([[bx - 5 * u, by + (17 + 3 * k) * u], [bx + 5 * u, by + (17 + 3 * k) * u]], 1.2 * u, "#8a929c");
    } else if (view === "side") {
      const bx = tcx + 0.82 * a, by = chin + 0.44 * HH;
      strap(p, [[tcx + 0.1 * a, chin - 0.02 * HH], [bx, by]], L.lanyard, 2.4 * u, 0.6 * u);
      p.poly(rrect(bx - 2.5 * u, by, bx + 3 * u, by + 22 * u, 1.2 * u), "#fbfaf6", 1.2 * u);
    } else {
      p.arc(tcx, chin - 0.02 * HH, 0.34 * a, 0.08 * HH, 0, 180, 2.4 * u, L.lanyard);
    }
  }
  if (L.tag && view !== "back") {
    const w = view === "side" ? 15 * u : 23 * u, h = 21 * u;
    const x = view === "side" ? tcx + 0.72 * a : tcx + 0.4 * a, y = chin + 0.42 * HH;
    niTag(p, x, y, w, h, u);
  }
};

// ---------------- props ----------------
const drawProp = (p: Pen, pr: PropS, D: Dims, view: View) => {
  const { u, HH } = D, [hx, hy] = pr.at;
  if (pr.kind === "pen") {
    const d: P2 = [Math.cos(pr.ang), Math.sin(pr.ang)], a: P2 = [hx - d[0] * 3 * u, hy - d[1] * 3 * u], b: P2 = [hx + d[0] * 0.13 * HH, hy + d[1] * 0.13 * HH];
    strap(p, [a, b], "#2f57c9", 2.6 * u, 0.9 * u);
  } else if (pr.kind === "card") {
    const w = 0.44 * HH, h = 0.32 * HH, x0 = hx - w / 2, y1 = hy + 3 * u;
    if (pr.face === "edge") { p.poly(rrect(hx - 2 * u, y1 - h, hx + 2 * u, y1, 1 * u), "#f6f4ee", 1.4 * u); return; }
    // "three": the card turned three-quarters toward the camera (side views): narrower, the far edge a touch shorter
    const k3 = pr.face === "three" ? 0.62 : 1, cx3 = pr.face === "three" ? hx + 0.12 * w : hx, w3 = w * k3, xa = cx3 - w3 / 2, xb = cx3 + w3 / 2, dy = pr.face === "three" ? 0.05 * h : 0;
    p.poly(pr.face === "three" ? [[xa, y1 - h], [xb, y1 - h + dy], [xb, y1 - dy], [xa, y1]] : rrect(x0, y1 - h, x0 + w, y1, 3 * u), pr.face === "back" ? "#e8e4d8" : "#fbfaf6", 1.8 * u);
    if ((pr.face === "front" || pr.face === "three") && pr.text) {
      const g = p.g; g.save(); g.fillStyle = INK; g.font = `900 ${Math.round(h * 0.72)}px sans-serif`;
      g.textAlign = "center"; g.textBaseline = "middle"; const [tx, ty] = p.P(cx3, y1 - h / 2); g.translate(tx, ty + h * 0.04); g.scale(k3, 1); g.fillText(pr.text, 0, 0); g.restore();
    }
  } else if (pr.kind === "phone") {
    // group film: a phone you read in a second at medium-shot size: tall rounded slab, a coloured case with the camera
    // bump (three lenses) at the top corner, held low (the ball hand on the lower part, a thumb on the side)
    const w = 0.235 * HH, h = 0.44 * HH;
    if (pr.face === "edge") {
      const c = Math.cos(pr.ang), s = Math.sin(pr.ang), P = (a: number, b: number): P2 => [hx + a * c - b * s, hy + a * s + b * c];
      p.poly([P(-2.2 * u, -h * 0.25), P(2.8 * u, -h * 0.25), P(2.8 * u, h * 0.75), P(-2.2 * u, h * 0.75)], "#2b2e38", 1.4 * u);
      return;
    }
    const x0 = hx - w / 2, y0 = hy - h * 0.76, r = 0.16 * w;   // clear of the chin; the desk edge may cover the bottom
    if (pr.face === "back") {
      // case (saturated, so it never reads as a badge against the tops), a lighter bevel line inside the rim
      p.poly(rrect(x0, y0, x0 + w, y0 + h, r), "#d9467f", 1.7 * u);
      p.stroke([[x0 + 0.2 * w, y0 + h - 2.6 * u], [x0 + 0.8 * w, y0 + h - 2.6 * u]], 1.2 * u, "#f08ab2");
      // camera bump: a rounded dark square with three lens rings and a flash dot
      const bs = 0.42 * w, bx = x0 + 0.1 * w, by = y0 + 0.07 * w;
      p.poly(rrect(bx, by, bx + bs, by + bs, 0.28 * bs), "#2c2f3a", 1.0 * u);
      const lr = 0.15 * bs;
      for (const [lx, ly] of [[0.3, 0.3], [0.3, 0.7], [0.7, 0.5]] as P2[]) { p.ell(bx + lx * bs, by + ly * bs, lr, lr, "#11131a", 0.9 * u); p.ell(bx + lx * bs - 0.3 * lr, by + ly * bs - 0.3 * lr, 0.3 * lr, 0.3 * lr, "#8b96ad", 0); }
      p.ell(bx + 0.72 * bs, by + 0.18 * bs, 0.07 * bs, 0.07 * bs, "#f4e7b8", 0);
    } else {
      p.poly(rrect(x0, y0, x0 + w, y0 + h, r), "#20232b", 1.7 * u);
      p.poly(rrect(x0 + 2 * u, y0 + 3 * u, x0 + w - 2 * u, y0 + h - 3 * u, r * 0.7), "#bfe3ff", 0);
    }
    // the hand: the ball holding the lower part, a thumb on the side edge
    p.dot(hx, hy, 3.6 * u, INK);
    p.dot(x0 + w + 0.4 * u, y0 + h * 0.58, 2.2 * u, INK);
  } else if (pr.kind === "clipboard") {
    const w = 0.34 * HH, h = 0.46 * HH;
    if (pr.face === "edge") { p.poly(rrect(hx - 3 * u, hy - h * 0.7, hx + 2 * u, hy + h * 0.3, 1 * u), "#a8743f", 1.5 * u); return; }
    const x0 = hx - w * 0.15, y0 = hy - h * 0.55;
    p.poly(rrect(x0, y0, x0 + w, y0 + h, 3 * u), pr.face === "back" ? "#9a6a3a" : "#b07b45", 1.6 * u);
    if (pr.face !== "back") {
      p.poly([[x0 + 3 * u, y0 + 6 * u], [x0 + w - 3 * u, y0 + 6 * u], [x0 + w - 3 * u, y0 + h - 3 * u], [x0 + 3 * u, y0 + h - 3 * u]], "#fbfaf6", 0.8 * u);
      for (let i = 0; i < 5; i++) p.stroke([[x0 + 7 * u, y0 + (14 + 6 * i) * u], [x0 + w - (7 + 6 * (i % 2)) * u, y0 + (14 + 6 * i) * u]], 1.1 * u, "#8a929c");
      p.poly(rrect(x0 + w / 2 - 8 * u, y0 - 2 * u, x0 + w / 2 + 8 * u, y0 + 6 * u, 2 * u), "#c9ced6", 1.2 * u);
    }
  }
  void view;
};

/** smooth closed hull (blanket over a lying / sitting-up body) */
const hull = (pts: P2[]): P2[] => {
  const P = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P2[] = [], up: P2[] = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of [...P].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
};

/** draw a solved figure. Canvas transform on entry = design units of the FRAME (pool scale k already applied). */
export function paintFig(p: Pen, L: Look, sv: Solved, fo: FaceOpts = {}) {
  const D = dimsOf(L), { HH, u, Q } = D, view = sv.view, seed = L.seed, g = p.g;
  const expr = fo.expr ?? "neutral", lid = fo.blink ?? 0, facing = fo.facing ?? sv.facing, look = fo.look ?? sv.look, lookUp = fo.lookUp ?? sv.lookUp;
  g.save();
  g.translate(sv.tr[0] + sv.piv[0], sv.tr[1] + sv.piv[1]); g.rotate(sv.roll); g.translate(-sv.piv[0], -sv.piv[1]);
  const light = (fo.light ?? DEF_LIGHT) - sv.roll, thick = thickAngle(light), ow = 5 * u;
  const hip = sv.hip, torsoBot = sv.torsoBot, chin = sv.chin, tcx = sv.tcx;
  const legCol = legColOf(L), armCol = armColOf(L), skin = L.skin;
  // head blob for this view (bulge toward the face in profile)
  const H: Blob = view === "side" ? { ...headBlob(seed, D.ha, 1), asym: 0.1, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) } : headBlob(seed, D.ha, view === "back" ? 0 : facing);
  const W = 2 * H.a;
  // torso
  const sideV = view === "side";
  const T: Blob = sideV
    ? { a: D.Tas, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.0 + 0.5 * rnd(seed, 34), nBot: 2.5, egg: 0.1 + Q.egg, asym: 0.06, rot: rad(4 * (rnd(seed, 36) - 0.5)), noise: 0.012, seed: seed + 7 }
    : { a: D.Ta, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.0 + 0.5 * rnd(seed, 34), nBot: sv.seated ? 3.0 : 2.6, egg: 0.12 + Q.egg, asym: (view === "back" ? -1 : 1) * (0.04 * facing + 0.06 * (rnd(seed, 35) - 0.5)), rot: (view === "back" ? -1 : 1) * rad(4 * (rnd(seed, 36) - 0.5)), noise: 0.012, seed: seed + 7 };
  const tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const tRot: number[] | null = sv.lean ? [rad(sv.lean), hip[0], hip[1]] : null;
  // head frame: rotates with the torso about the hip, plus its own tilt about the chin
  const hx0 = sideV ? hip[0] + 4 * u : hip[0], hc0 = chin - H.b;
  const cR = rotAbout([hx0, chin], rad(sv.lean), hip), Ah = sv.lean + sv.headTilt + Q.headTilt;
  const hRot: number[] | null = Ah || sv.lean ? [rad(Ah), hx0, chin, cR[0] - hx0, cR[1] - chin] : null;
  const hp = blobPts(hx0, hc0, H);
  const hctx: HairCtx = { L, view, H, hp, cx: hx0, hc: hc0, u, light: light - rad(Ah), ow, chinY: chin };
  const tctx: TorsoCtx = { L, view, T, tp, tcx, chin, bot: torsoBot, HH, u, light: light - rad(sv.lean), thick: thickAngle(light - rad(sv.lean)), ow, facing };

  const drawLeg = (lg: LegS, i: number) => {
    const side = view === "side" ? 1 : i ? 1 : -1;
    if (lg.shin) { limb(p, [lg.k, lg.a], 6.2 * u, 5 * u, legCol, seed + i); shoe(p, L, lg.a, lg.pitch, view, side, u); return; }
    limb(p, lg.flat ? bentPath(lg.h, lg.k, lg.a, 10 * u) : curve(lg.h, lg.k, lg.a, 16), 6.6 * u, 5 * u, legCol, seed + i, lg.flat ? 0.3 : 1);
    shoe(p, L, lg.a, lg.pitch, view, side, u);
  };
  const drawShorts = (lg: LegS) => { if (L.bottom === "shorts") strap(p, [lg.h, lerp2(lg.h, lg.k, 0.55)], L.botCol, 13 * u, 1.4 * u); };
  const drawArm = (a: ArmS, i: number) => {
    // flat forearm (desk): straight upper arm, a small round elbow whose control point is the elbow itself (the
    // corner never dips below the forearm line), straight forearm. A single bezier through s/e/h would sag ~.12 of
    // the shoulder drop below the desk-top line between elbow and hand (measured 1.8 cm into the desk, 穿模)
    limb(p, a.flat ? bentPath(a.s, a.e, a.h, 8 * u) : curve(a.s, a.e, a.h, 14), 5.8 * u, 4.6 * u, armCol, seed + 10 + i, a.flat ? 0.2 : 1);
    p.dot(a.h[0], a.h[1], 3.3 * u, armCol);
    for (const pr of sv.props) if (pr.hand === i) drawProp(p, pr, D, view);
  };
  const skirt = (seatedNow: boolean) => {
    if (L.bottom !== "skirt") return;
    const col = L.botCol;
    let pts: P2[];
    if (view === "side") {
      if (seatedNow) { const lg = sv.legs[1]; const k2 = lerp2(lg.h, lg.k, 0.62); pts = [[hip[0] - D.Tas * 0.9, torsoBot - 0.12 * HH], [hip[0] + D.Tas * 0.5, torsoBot - 0.16 * HH], [k2[0], k2[1] - 6 * u], [k2[0] + 2 * u, k2[1] + 8 * u], [hip[0] - D.Tas * 0.95, torsoBot + 4 * u]]; }
      else pts = [[tcx - 0.86 * T.a, torsoBot - 0.14 * HH], [tcx + 0.9 * T.a, torsoBot - 0.14 * HH], [tcx + 1.18 * T.a, torsoBot + 0.36 * HH], [tcx - 1.06 * T.a, torsoBot + 0.36 * HH]];
    } else if (seatedNow) pts = [[tcx - 0.9 * T.a, torsoBot - 0.1 * HH], [tcx + 0.9 * T.a, torsoBot - 0.1 * HH], [tcx + 1.0 * T.a, torsoBot + 0.1 * HH], [tcx - 1.0 * T.a, torsoBot + 0.1 * HH]];
    else pts = [[tcx - 0.82 * T.a, torsoBot - 0.12 * HH], [tcx + 0.82 * T.a, torsoBot - 0.12 * HH], [tcx + 1.04 * T.a, torsoBot + 0.36 * HH], [tcx, torsoBot + 0.38 * HH], [tcx - 1.04 * T.a, torsoBot + 0.36 * HH]];
    p.gradFill(pts, col, mul(col, SH_CLOTH), light);
    p.poly(pts, null, ow * 0.8);
  };
  const torso = () => {
    p.rot = tRot;
    p.gradFill(tp, L.topCol, mul(L.topCol, SH_CLOTH), tctx.light);
    p.clip(tp, () => clothes(p, tctx));
    p.inkRing(tp, ow, tctx.thick);
    torsoExtras(p, tctx, "behindHead");
    p.rot = null;
  };
  const blanket = () => {
    if (!sv.blanket || !(sv.lying || sv.bed)) return;   // only over a body in bed
    const pts: P2[] = [];
    for (const q of tp) if (q[1] > chin + 0.15 * HH) pts.push(rotAbout(q, rad(sv.lean), hip));
    for (const lg of sv.legs) { pts.push(lg.k, lg.a, lerp2(lg.k, lg.a, 0.5), lerp2(lg.h, lg.k, 0.5)); }
    sv.arms.forEach((a, i) => { if (!(sv.req.kind === "reach" && i === 1)) pts.push(a.e); });   // a reaching arm stays on top of the blanket
    const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length, cy = pts.reduce((s, q) => s + q[1], 0) / pts.length;
    const hl = hull(pts.map(([x, y]) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; return [x + (dx / l) * 18 * u, y + (dy / l) * 18 * u] as P2; }));
    // Chaikin-rounded hull (4 passes): a soft mound. The old one-curve-per-corner hull kept long straight edges and a
    // sharp apex over the knees, which read as a yellow tent / cushion standing on the bed in a close bunk shot
    let sm: P2[] = hl;
    for (let pass = 0; pass < 4; pass++) {
      const nx: P2[] = [];
      for (let i = 0; i < sm.length; i++) { const a = sm[i], b = sm[(i + 1) % sm.length]; nx.push(lerp2(a, b, 0.25), lerp2(a, b, 0.75)); }
      sm = nx;
    }
    p.gradFill(sm, sv.blanket, mul(sv.blanket, SH_CLOTH), light, 0.3);
    p.inkRing(sm, ow, thick);
    for (let k = 1; k <= 2; k++) { const q = lerp2([cx, cy], sm[Math.floor((sm.length * k) / 3)], 0.7); p.stroke(curve(lerp2([cx, cy], q, 0.2), lerp2([cx, cy], q, 0.6), q, 6), 1.6 * u, shade(sv.blanket, 0.75)); }
  };
  const head = () => {
    p.rot = hRot;
    if (view !== "back") hairBehind(p, hctx, "head");
    p.shadedFill(hp, skin, mul(skin, SH_SKIN), hctx.light, H.a);
    p.inkRing(hp, ow, thickAngle(hctx.light));
    hairCap(p, hctx);
    if (L.headband) {
      const band = blobPts(hx0, hc0, { ...H, a: H.a * 1.045, b: H.b * 1.045 }, 72);
      p.clip(band, () => p.poly([[hx0 - 1.2 * H.a, hc0 - 0.72 * H.b], [hx0 + 1.2 * H.a, hc0 - 0.8 * H.b], [hx0 + 1.2 * H.a, hc0 - 0.54 * H.b], [hx0 - 1.2 * H.a, hc0 - 0.46 * H.b]], L.headband!, 1.5 * u));
    }
    if (view === "front") faceFront(p, hx0, hc0, W, expr, facing, look, lid, false, skin, undefined, false, lookUp);
    else if (view === "side") faceSide(p, hx0, hc0, W, expr, lid, false, skin);
    if (L.glasses && view !== "back") {
      const gc = L.glassCol ?? "#2a2230", uu = W / 100;
      if (view === "front") {
        const fx = hx0 + 7 * uu * facing, ey = hc0 - 3.5 * uu * lookUp, ex = 13 * uu, r = 11.5 * uu;
        for (const sd of [-1, 1]) {
          if (L.glasses === "round") p.ell(fx + sd * ex, ey, r, r * 0.92, null, 2.3 * uu);
          else p.poly(rrect(fx + sd * ex - r, ey - r * 0.8, fx + sd * ex + r, ey + r * 0.8, 3 * uu), null, 2.3 * uu);
          // temples run to the head edge, or stop where a bob / long curtain covers the side of the face (they were
          // drawn over the hair right across the head)
          const tEnd = L.hair === "bob" ? 0.6 : L.hair === "long" ? 0.54 : 0.97;
          p.stroke([[fx + sd * (ex + r), ey - 2 * uu], [hx0 + sd * tEnd * H.a, ey - 4 * uu]], 2 * uu, gc);
        }
        p.stroke([[fx - ex + r, ey - 1 * uu], [fx + ex - r, ey - 1 * uu]], 2 * uu, gc);
      } else {
        const ex = hx0 + 27 * uu, ey = hc0, r = 11 * uu;
        if (L.glasses === "round") p.ell(ex, ey, r * 0.7, r * 0.92, null, 2.3 * uu); else p.poly(rrect(ex - r * 0.7, ey - r * 0.8, ex + r * 0.6, ey + r * 0.8, 3 * uu), null, 2.3 * uu);
        p.stroke([[ex - r * 0.7, ey - 2 * uu], [hx0 - 0.02 * H.a, ey - 4 * uu]], 2 * uu, gc);
      }
    }
    if (L.blindfold) {
      // a cloth band round the head at eye height, drawn over the eyes (clipped to a slightly enlarged head so it wraps)
      const uu = W / 100, bc = L.blindfold, ey = hc0 - 3.5 * uu * (view === "front" ? lookUp : 0), bh = 15 * uu;
      const band = blobPts(hx0, hc0, { ...H, a: H.a * 1.04, b: H.b * 1.04 }, 72);
      const tilt = view === "front" ? 0 : 2 * uu;
      p.clip(band, () => p.poly([[hx0 - 1.3 * H.a, ey - bh / 2 - tilt], [hx0 + 1.3 * H.a, ey - bh / 2 + tilt], [hx0 + 1.3 * H.a, ey + bh / 2 + tilt], [hx0 - 1.3 * H.a, ey + bh / 2 - tilt]], bc, 2 * uu));
      // fold line along the band
      p.clip(band, () => p.stroke([[hx0 - 1.2 * H.a, ey + 1 * uu], [hx0 + 1.2 * H.a, ey + 2 * uu]], 1.2 * uu, "rgba(0,0,0,0.35)"));
      // knot tails: at the back of the head (side view: behind the head; back view: centre)
      if (view !== "front") {
        const kx = view === "side" ? hx0 - 0.98 * H.a : hx0, ky = ey;
        p.poly([[kx, ky - 4 * uu], [kx - 16 * uu, ky + 10 * uu], [kx - 10 * uu, ky + 14 * uu], [kx + 1 * uu, ky + 3 * uu]], bc, 1.6 * uu);
        p.poly([[kx, ky - 2 * uu], [kx - 6 * uu, ky + 20 * uu], [kx + 1 * uu, ky + 21 * uu], [kx + 3 * uu, ky + 2 * uu]], bc, 1.6 * uu);
      }
    }
    p.rot = null;
  };

  // ---- draw order ----
  const [A0, A1] = sv.arms, [L0, L1] = sv.legs;
  if (view === "front") {
    p.rot = hRot; hairBehind(p, hctx, "long"); p.rot = null;
    if (!sv.seated) { drawLeg(L0, 0); drawLeg(L1, 1); drawShorts(L0); drawShorts(L1); skirt(false); }
    for (const [a, i] of [[A0, 0], [A1, 1]] as const) if (!a.front) drawArm(a, i);
    torso();
    if (sv.seated) { drawLeg(L0, 0); drawLeg(L1, 1); drawShorts(L0); drawShorts(L1); skirt(true); }
    blanket();
    for (const [a, i] of [[A0, 0], [A1, 1]] as const) if (a.front) drawArm(a, i);
    head();
  } else if (view === "side") {
    drawLeg(L0, 0); drawShorts(L0);
    if (!A0.front) drawArm(A0, 0);
    p.rot = hRot; hairBehind(p, hctx, "long"); p.rot = null;
    if (!sv.seated) { drawLeg(L1, 1); drawShorts(L1); skirt(false); }
    torso();
    if (sv.seated) { drawLeg(L1, 1); drawShorts(L1); skirt(true); }
    blanket();
    if (A0.front) drawArm(A0, 0);
    if (!A1.front) drawArm(A1, 1);
    head();
    if (A1.front) drawArm(A1, 1);
  } else {
    for (const [a, i] of [[A0, 0], [A1, 1]] as const) if (!a.front) drawArm(a, i);
    drawLeg(L0, 0); drawLeg(L1, 1); drawShorts(L0); drawShorts(L1); if (!sv.seated) skirt(false);
    torso();
    p.rot = hRot; hairBehind(p, hctx, "long"); p.rot = null;
    blanket();
    head();
    for (const [a, i] of [[A0, 0], [A1, 1]] as const) if (a.front) drawArm(a, i);
  }
  g.restore();
}

/** design-unit bounding box of a painted figure in FRAME units (recording context; for fit checks) */
export const figBounds = (L: Look, sv: Solved, fo: FaceOpts = {}) => {
  const b = new Bounds();
  paintFig(new Pen(b as unknown as CanvasRenderingContext2D), L, sv, fo);
  return { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 };
};

// ---------------- pop-up fx (unlit cards) ----------------
/** "?" / "!" / sweat drop / huff puff / dust motes on a 300 x 300 canvas (ink outline, bright fill) */
export const fxPop = (p: Pen, kind: "?" | "!" | "sweat" | "huff" | "dust" | "zzz", t = 0) => {
  const Y = "#ffd84a", B = "#8fd3ff";
  if (kind === "!") {
    const bar: P2[] = [[128, 40], [176, 40], [164, 190], [140, 190]];
    p.poly(bar, Y, 13); p.ell(152, 240, 24, 24, Y, 13);
  } else if (kind === "?") {
    const hook: P2[] = [];
    for (let i = 0; i <= 20; i++) { const a = rad(200 + (i / 20) * 230); hook.push([150 + 62 * Math.cos(a), 98 + 58 * Math.sin(a)]); }
    const path = [...hook, [150, 168], [150, 196]] as P2[];
    p.stroke(path, 64, INK); p.stroke(path, 38, Y); p.ell(150, 252, 25, 25, Y, 13);
  } else if (kind === "sweat") {
    const d: P2[] = [];
    for (let i = 0; i <= 30; i++) { const a = (i / 30) * Math.PI * 2, r = 70; const x = Math.sin(a) * r * (0.55 + 0.45 * Math.sin(a / 2) ** 2); d.push([150 + x, 190 - Math.cos(a) * 95 * (a < Math.PI * 0.5 || a > Math.PI * 1.5 ? 1.3 : 0.75)]); }
    p.poly(d, B, 12); p.ell(128, 200, 13, 22, "#e8f7ff", 0, 0, 360, 20);
  } else if (kind === "huff") {
    for (let i = 0; i < 3; i++) { const a = rad(-20 + i * 22), d = 50 + 120 * t, r = (36 - 6 * i) * (1 - 0.5 * t); p.ell(80 + d * Math.cos(a), 160 + d * Math.sin(a), r, r * 0.8, `rgba(255,255,255,${(0.9 * (1 - t)).toFixed(3)})`, Math.max(2, 8 * (1 - t))); }
  } else if (kind === "dust") {
    for (let i = 0; i < 6; i++) { const a = rad(200 + i * 28), d = 40 + 110 * t, r = 14 * (1 - t) + 3; p.ell(150 + d * Math.cos(a), 170 + d * Math.sin(a) * 0.6, r, r, `rgba(240,232,214,${(1 - t).toFixed(3)})`, 0); }
  } else {
    const g = p.g; g.save(); g.font = "900 110px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 14; g.strokeStyle = INK; g.fillStyle = "#e8ecff";
    for (let i = 0; i < 3; i++) { const [x, y] = [90 + i * 60, 220 - i * 70], s = 0.5 + 0.25 * i; g.save(); g.translate(x, y); g.scale(s, s); g.strokeText("z", 0, 0); g.fillText("z", 0, 0); g.restore(); }
    g.restore();
  }
};
/** pop-in scale for an fx t seconds after it appears: overshoot to 1.25, settle to 1 (0 before) */
export const popScale = (t: number, dur = 0.28) => (t <= 0 ? 0 : t >= dur * 2.2 ? 1 : (() => { const x = t / dur; return x < 1 ? 1.25 * Math.sin((Math.PI / 2) * x) : 1 + 0.25 * Math.cos(((x - 1) / 1.2) * (Math.PI / 2)) ** 2 * (1 - (x - 1) / 1.2); })());

// ---------------- the cast ----------------
/** the protagonist "you": blue hoodie, jeans, white sneakers, short black hair, the gold 你 tag */
export const YOU: Look = { seed: 7, skin: SKIN, top: "hoodie", topCol: "#3567b8", trim: "#f4f1e8", inner: "#2a4f94", bottom: "jeans", botCol: "#2f4466", shoes: "#f4f2ec", shoeSole: "#d9d4ca", hair: "short", hairCol: "#2a221e", tag: true };
/** the roommate: coral running top with a white panel, navy shorts, teal running shoes, teal headband */
export const ROOMMATE: Look = { seed: 23, skin: "#f8d6b4", top: "run", topCol: "#ef7b62", trim: "#f4f1e8", bottom: "shorts", botCol: "#2f3e5c", shoes: "#2fb3a5", shoeSole: "#f4f2ec", hair: "short", hairCol: "#1f1a18", headband: "#2f9e9a", part: 1 };
/** the researcher: slate cardigan over a white shirt, dark chinos, bun, square glasses, teal lanyard + ID badge */
export const RESEARCHER: Look = { seed: 41, skin: SKIN, top: "cardigan", topCol: "#6f7f9a", inner: "#f6f4ee", bottom: "chinos", botCol: "#3a4256", shoes: "#3a3236", hair: "bun", hairCol: "#3b2a22", glasses: "square", glassCol: "#2a2430", lanyard: "#2f9e9a" };

// classroom / dorm palette: the sets' teal, mustard, coral and blue, plus quiet neutrals so the room does not shout
const TOPS = ["#2f9e9a", "#e8b340", "#ef7b62", "#3f6fb5", "#2f3f66", "#8fb39a", "#efe6d2", "#9aa3ad", "#a3485a", "#9c8bc4", "#f2efe8", "#3a3740", "#7d8a4a", "#8ec5e6", "#d98f6b", "#5c8f8a"];
const JEANS = ["#3a5683", "#2f4466", "#5b78a6", "#33405a"];
const CHINOS = ["#c9b48a", "#6b6f78", "#3a4256", "#2f2c34", "#8a7a62"];
const SKIRTS = ["#3a4256", "#a3485a", "#c9b48a", "#2f9e9a", "#2f2c34"];
const SHOES = ["#f2efe8", "#2d2a30", "#9aa3ad", "#f2efe8", "#c9b48a", "#2f9e9a"];
const HAIRCOL = ["#2a221e", "#1f1a18", "#3b2a22", "#4a3326", "#2a221e", "#6b4a33", "#1f1a18", "#7a5236"];
const SKINS_F = [SKIN, "#f8d6b4", "#fbe7d3", "#efc9a4", SKIN, "#f3d2b0"];
const pickF = <T,>(a: T[], s: number, k: number) => a[Math.floor(rnd(s, k) * a.length) % a.length];
/** seeded classmate i (0..83 and beyond): every outfit / haircut / accessory combination the kit has, in the film's
 *  palette. Adults 23-38: hoodies, tees, cardigans over shirts, light jackets, sweaters; jeans, chinos, skirts. */
export const classmate = (i: number): Look => {
  const s = 1000 + i * 17;
  const top = (["hoodie", "tee", "cardigan", "jacket", "sweater", "tee", "hoodie", "sweater"] as Top[])[Math.floor(rnd(s, 1) * 8)];
  const fem = rnd(s, 2) < 0.5;
  const hair: Hair = fem ? pickF<Hair>(["bob", "ponytail", "long", "bun", "long", "short", "curly"], s, 3) : pickF<Hair>(["short", "side", "buzz", "curly", "short", "side"], s, 3);
  const bottom: Bottom = fem && rnd(s, 4) < 0.35 ? "skirt" : rnd(s, 5) < 0.55 ? "jeans" : "chinos";
  const topCol = pickF(TOPS, s, 6);
  let inner: string | undefined, trim: string | undefined;
  if (top === "cardigan" || top === "jacket") inner = pickF(["#f6f4ee", "#efe6d2", "#3a3740", "#9aa3ad", "#f2efe8"], s, 7);
  if (top === "sweater" && rnd(s, 8) < 0.5) trim = pickF(["#f6f4ee", "#2f3f66", "#e8b340"], s, 9);
  if (top === "hoodie") trim = "#f4f1e8";
  if (inner === topCol) inner = "#f6f4ee";
  const L: Look = {
    seed: s, skin: pickF(SKINS_F, s, 10), top, topCol, inner, trim,
    bottom, botCol: bottom === "jeans" ? pickF(JEANS, s, 11) : bottom === "skirt" ? pickF(SKIRTS, s, 11) : pickF(CHINOS, s, 11),
    legCol: bottom === "skirt" ? pickF(["#3a3236", "#5a4a48", "#2a2430"], s, 12) : undefined,
    shoes: pickF(SHOES, s, 13), hair, hairCol: pickF(HAIRCOL, s, 14), part: rnd(s, 15) < 0.5 ? -1 : 1,
    width: 0.92 + 0.18 * rnd(s, 16),
  };
  if (rnd(s, 17) < 0.3) { L.glasses = rnd(s, 18) < 0.5 ? "round" : "square"; L.glassCol = pickF(["#2a2430", "#6b4a33", "#3a4256"], s, 19); }
  if (rnd(s, 20) < 0.12) L.lanyard = pickF(["#2f9e9a", "#3f6fb5", "#e8b340"], s, 21);
  return L;
};
/** the friends on the far ends of the ropes (named looks, distinct from each other and from YOU) */
const FRIENDS: Look[] = [
  { seed: 101, skin: SKIN, top: "sweater", topCol: "#e8b340", trim: "#f6f4ee", bottom: "jeans", botCol: "#3a5683", shoes: "#f2efe8", hair: "ponytail", hairCol: "#2a221e", part: 1 },
  { seed: 113, skin: "#f8d6b4", top: "tee", topCol: "#2f9e9a", bottom: "chinos", botCol: "#c9b48a", shoes: "#2d2a30", hair: "curly", hairCol: "#3b2a22", glasses: "round", glassCol: "#2a2430" },
  { seed: 127, skin: SKIN, top: "jacket", topCol: "#ef7b62", inner: "#f6f4ee", bottom: "skirt", botCol: "#3a4256", legCol: "#3a3236", shoes: "#2d2a30", hair: "bob", hairCol: "#1f1a18" },
  { seed: 131, skin: "#fbe7d3", top: "cardigan", topCol: "#8fb39a", inner: "#efe6d2", bottom: "jeans", botCol: "#2f4466", shoes: "#9aa3ad", hair: "side", hairCol: "#2a221e", part: -1 },
  { seed: 137, skin: SKIN, top: "hoodie", topCol: "#9c8bc4", trim: "#f4f1e8", bottom: "chinos", botCol: "#3a4256", shoes: "#f2efe8", hair: "long", hairCol: "#3b2a22" },
  { seed: 149, skin: "#efc9a4", top: "tee", topCol: "#e8b340", bottom: "jeans", botCol: "#33405a", shoes: "#2fb3a5", hair: "buzz", hairCol: "#1f1a18" },
];
export const friend = (i: number): Look => (i < FRIENDS.length ? FRIENDS[i] : classmate(500 + i));
