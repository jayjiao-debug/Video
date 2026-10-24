// silk.ts: procedural 《清明上河图》 painter for ep43 (Canvas 2D, browser).
// "You", the scroll, painted entirely in code in the 界画 manner: oblique projection, ink line, light washes.
// NO scan of the real painting is used (Palace Museum terms forbid reuse, facts.md L1).
//
// API
//   paintSection(name, o)  -> HTMLCanvasElement   name: 'river' | 'gate' | 'shed' | 'end' | 'colophon'
//   paintRelief(name, o)   -> HTMLCanvasElement[5] (0 far sky/haze, 1 far bank, 2 river+boats, 3 bridge, 4 near roofs/trees)
//   paintSeal(text, o)     -> HTMLCanvasElement    red square seal impression (朱文 / 白文), '' = illegible stand-in
//   stampSeals(canvas, list)                       stamps seals onto a canvas (canvas pixel coordinates)
//   silkWeave(canvas, strength)                    silk weave + age texture over a canvas
// Every returned section canvas carries `canvas.silk: SilkInfo` (patch rect, colophon glyph boxes, seal slots, ...)
// in that canvas's pixel coordinates. Deterministic from `seed`; no network; colophon font 'Noto Serif CJK SC'.

export type SilkMode = 'mono' | 'colour' | 'grey';
export type SectionName = 'river' | 'gate' | 'shed' | 'end' | 'colophon';
export type PatchState = 'bare' | 'ears' | 'donkey' | 'peeled';

export interface SilkOptions {
  width?: number;          // default 4096
  height?: number;         // default 1536
  mode?: SilkMode;         // default 'mono'
  seed?: number;           // default 43
  patch?: PatchState;      // 'shed' only, default 'bare'
  mast?: number;           // 'river': mast of the boat under the bridge, 0 upright .. 1 lowered (default 0.55)
  weave?: number;          // silkWeave strength applied at the end (default 1, 0 = none)
  density?: number;        // crowd multiplier (default 1; grey mode multiplies by 0.45)
  colophonReveal?: number; // 'colophon': how many characters of 张著's colophon are written (default all 84)
  traditional?: boolean;   // 'colophon': write 张著's text in traditional characters (default simplified, as the subtitles)
  punctuate?: boolean;     // 'colophon': add 余辉's modern punctuation (default false: the object has none)
  seals?: boolean;         // 'colophon': draw the default (illegible, faded) seals on the joins (default true)
}

export interface Rect { x: number; y: number; w: number; h: number }
export interface Glyph { ch: string; i: number; col: number; x: number; y: number; size: number }
export interface SealSlot { x: number; y: number; size: number; kind: string }
export interface SilkInfo {
  name: SectionName; mode: SilkMode; width: number; height: number; scale: number;
  bridge?: Rect; mastBoat?: Rect; gate?: Rect;
  patch?: Rect; posts?: Rect;              // shed
  corners?: { lowerLeft: Rect; upperLeft: Rect }; // end: bare corners where a signature would be
  join?: number;                           // colophon: x of the silk/paper seam
  glyphs?: Glyph[];                        // colophon: 张著's characters (index order of the text)
  phrases?: Record<string, [number, number]>; // colophon: glyph index ranges, e.g. 藏者宜宝之
  colophons?: { id: string; x0: number; x1: number }[];
  sealSlots?: SealSlot[];
}

const W0 = 4096, H0 = 1536;
const FONT = "'Noto Serif CJK SC','Noto Serif CJK','Noto Serif SC',serif";

// ------------------------------------------------------------------ random
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(a: number, b: number) {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
type Rng = () => number;
const rr = (r: Rng, a: number, b: number) => a + (b - a) * r();
const ri = (r: Rng, a: number, b: number) => Math.floor(a + (b - a + 1) * r());
const pick = <T>(r: Rng, arr: T[]) => arr[Math.floor(r() * arr.length) % arr.length];
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// smooth value noise, 2D
function vnoise(seed: number) {
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const h = (i: number, j: number) => hash2(i + seed * 131, j - seed * 71);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
  };
}

// ------------------------------------------------------------------ colour
type RGB = [number, number, number];
function hex(h: string): RGB { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a: RGB, b: RGB, t: number): RGB { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
function rgba(c: RGB, a = 1) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${+a.toFixed(3)})`; }

interface Wash { c: RGB; a: number }
interface Pal {
  ground: RGB; ink: RGB; paper: RGB;
  roof: Wash; wood: Wash; water: Wash; leaf: Wash; leaf2: Wash; earth: Wash; straw: Wash; stone: Wash;
  shade: Wash; red: Wash; skin: RGB; robes: Wash[]; hat: RGB; lineA: number;
}
const C_QING: RGB = hex('#41708A'), C_LV: RGB = hex('#6E8E68'), C_ZHE: RGB = hex('#A8683A'), C_ZHU: RGB = hex('#B42E22');

function palette(mode: SilkMode): Pal {
  if (mode === 'colour') {
    const ink = hex('#2A1F17');
    return {
      ground: hex('#FFF3D8'), ink, paper: hex('#F6E9CC'),
      roof: { c: hex('#5F6E73'), a: 0.42 }, wood: { c: C_ZHE, a: 0.5 }, water: { c: C_QING, a: 0.2 },
      leaf: { c: C_LV, a: 0.62 }, leaf2: { c: C_QING, a: 0.45 }, earth: { c: C_ZHE, a: 0.13 }, straw: { c: hex('#B48B52'), a: 0.5 },
      stone: { c: hex('#8B877C'), a: 0.3 }, shade: { c: ink, a: 0.14 }, red: { c: C_ZHU, a: 0.88 }, skin: hex('#F3DFC0'),
      robes: [{ c: hex('#FCF7EA'), a: 1 }, { c: C_QING, a: 0.78 }, { c: hex('#FCF7EA'), a: 1 }, { c: C_LV, a: 0.75 },
        { c: C_ZHE, a: 0.62 }, { c: hex('#EADCC0'), a: 1 }, { c: hex('#FCF7EA'), a: 1 }, { c: C_ZHU, a: 0.85 }],
      hat: ink, lineA: 0.95,
    };
  }
  if (mode === 'grey') {
    const ink = hex('#55524C'), g = hex('#9A968E');
    const w = (a: number): Wash => ({ c: ink, a });
    return {
      ground: g, ink, paper: hex('#A19D95'),
      roof: w(0.16), wood: w(0.1), water: w(0.06), leaf: w(0.16), leaf2: w(0.1), earth: w(0.04), straw: w(0.08), stone: w(0.08),
      shade: w(0.12), red: w(0.3), skin: g, robes: [{ c: hex('#A6A39B'), a: 1 }, w(0.1), { c: hex('#A6A39B'), a: 1 }, w(0.16)],
      hat: ink, lineA: 0.85,
    };
  }
  const ink = hex('#2A1F17');
  const w = (a: number): Wash => ({ c: ink, a });
  return {
    ground: hex('#FFF3D8'), ink, paper: hex('#F8EBD0'),
    roof: w(0.17), wood: w(0.1), water: w(0.045), leaf: w(0.2), leaf2: w(0.12), earth: w(0.04), straw: w(0.09), stone: w(0.08),
    shade: w(0.13), red: w(0.45), skin: hex('#FFF6E4'),
    robes: [{ c: hex('#FFF9EC'), a: 1 }, w(0.08), { c: hex('#FFF9EC'), a: 1 }, w(0.15), { c: hex('#FFF9EC'), a: 1 }, w(0.05),
      { c: hex('#FFF9EC'), a: 1 }, w(0.11)],
    hat: ink, lineA: 0.96,
  };
}

// ------------------------------------------------------------------ painter
type Pt = [number, number];
interface Proj { ox: number; oy: number; A: number; B: number }

class Painter {
  ctx: CanvasRenderingContext2D;
  mode: SilkMode; pal: Pal; r: Rng = Math.random; proj: Proj = { ox: 0, oy: H0, A: 0.6, B: 0.5 };
  fog = 0; scale: number; detail: number; density: number; figSeed = 0; figN = 0;
  inkC: RGB; ground: RGB;
  constructor(ctx: CanvasRenderingContext2D, mode: SilkMode, scale: number, density: number) {
    this.ctx = ctx; this.mode = mode; this.pal = palette(mode); this.scale = scale;
    this.detail = mode === 'grey' ? 0.5 : 1; this.density = density;
    this.inkC = this.pal.ink; this.ground = this.pal.ground;
  }
  setFog(f: number) { this.fog = clamp(f, 0, 0.92); this.inkC = mix(this.pal.ink, this.pal.ground, this.fog * 0.85); }
  // oblique projection: X right, Y up, Z away (recedes up-right)
  pt(X: number, Y: number, Z: number): Pt { const p = this.proj; return [p.ox + X + p.A * Z, p.oy - Y - p.B * Z]; }
  lw(w: number) { return Math.max(w, 0.75 / this.scale); }
  ink(a = 1) { return rgba(this.inkC, a * this.pal.lineA); }
  wash(w: Wash, k = 1) { return rgba(w.c, w.a * k * (1 - this.fog * 0.75)); }
  gfill() { return rgba(this.ground, 1); }
  // a figure is kept with probability `density` (decided by its own hash, so geometry never shifts between modes)
  keepFig() { this.figN++; return hash2(this.figSeed, this.figN) < this.density; }
}

// subdivide + jitter a polyline so lines read as drawn with a brush, not a ruler
function wob(P: Painter, pts: Pt[], amp: number, step = 18, closed = false): Pt[] {
  if (amp <= 0) return pts;
  const out: Pt[] = []; const n = pts.length; const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]); const k = Math.max(1, Math.round(len / step));
    const nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
    for (let j = 0; j < k; j++) {
      const t = j / k; const o = j === 0 && i === 0 && !closed ? 0 : (P.r() - 0.5) * 2 * amp;
      out.push([lerp(a[0], b[0], t) + nx * o, lerp(a[1], b[1], t) + ny * o]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
function tracePath(ctx: CanvasRenderingContext2D, pts: Pt[], closed = false, smooth = true) {
  if (pts.length < 2) return;
  ctx.moveTo(pts[0][0], pts[0][1]);
  if (!smooth || pts.length < 3) { for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); }
  else {
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const l = pts[pts.length - 1]; ctx.lineTo(l[0], l[1]);
  }
  if (closed) ctx.closePath();
}
interface SOpt { a?: number; amp?: number; closed?: boolean; color?: string; dash?: number[]; cap?: CanvasLineCap; smooth?: boolean }
function line(P: Painter, pts: Pt[], w: number, o: SOpt = {}) {
  const c = P.ctx; c.beginPath();
  const amp = o.amp ?? Math.min(0.9, 0.35 + w * 0.18);
  tracePath(c, wob(P, pts, amp * P.detail ** 0.5, 18, !!o.closed), !!o.closed, o.smooth ?? true);
  c.lineWidth = P.lw(w); c.strokeStyle = o.color ?? P.ink((o.a ?? 1) * (0.86 + 0.14 * P.r()));
  c.lineCap = o.cap ?? 'round'; c.lineJoin = 'round';
  if (o.dash) c.setLineDash(o.dash); c.stroke(); if (o.dash) c.setLineDash([]);
}
function seg(P: Painter, x1: number, y1: number, x2: number, y2: number, w: number, a = 1) { line(P, [[x1, y1], [x2, y2]], w, { a }); }
function fill(P: Painter, pts: Pt[], style: string, smooth = false) {
  const c = P.ctx; c.beginPath(); tracePath(c, pts, true, smooth); c.fillStyle = style; c.fill();
}
// fill with the ground (occludes what is behind), then a wash, then an ink outline
function shape(P: Painter, pts: Pt[], wash: Wash | null, w: number, o: SOpt & { k?: number; noGround?: boolean } = {}) {
  if (!o.noGround) fill(P, pts, P.gfill());
  if (wash) fill(P, pts, P.wash(wash, o.k ?? 1));
  if (w > 0) line(P, pts, w, { ...o, closed: true });
}
function qbez(p0: Pt, p1: Pt, p2: Pt, n = 12): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]); }
  return out;
}
// tapered brush stroke along a quadratic curve (filled polygon), used for willow strands, script, grass
function brush(P: Painter, p0: Pt, p1: Pt, p2: Pt, w0: number, w1: number, style?: string, n = 10) {
  const pts = qbez(p0, p1, p2, n); const L: Pt[] = [], R: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const t = i / n; const w = P.lw(lerp(w0, w1, t) * (0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, t * 1.6 + 0.2)))) / 2;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  const c = P.ctx; c.beginPath(); tracePath(c, L.concat(R.reverse()), true, false); c.fillStyle = style ?? P.ink(0.92); c.fill();
}
function ellipsePts(cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = Math.PI * 2, n = 24): Pt[] {
  const out: Pt[] = []; for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); } return out;
}

// ------------------------------------------------------------------ scene ops
interface Op { layer: number; z: number; x: number; ground?: boolean; overlay?: boolean; seed: number; fog?: number; draw: (P: Painter) => void }
class Scene {
  ops: Op[] = []; r: Rng; seed: number; n = 0; info: Partial<SilkInfo> = {};
  constructor(seed: number) { this.seed = seed; this.r = mulberry32(seed * 7919 + 17); }
  add(layer: number, z: number, x: number, draw: (P: Painter) => void, extra: Partial<Op> = {}) {
    this.ops.push({ layer, z, x, draw, seed: (this.seed * 1000003 + (++this.n) * 7907) | 0, ...extra });
  }
  ground(layer: number, draw: (P: Painter) => void, extra: Partial<Op> = {}) { this.add(layer, 1e9, 0, draw, { ground: true, ...extra }); }
  overlay(layer: number, draw: (P: Painter) => void) { this.add(layer, -1e9, 0, draw, { overlay: true }); }
}

// ------------------------------------------------------------------ figures (tiny ink people, profile, no faces)
interface Fig {
  dir?: number; hat?: 'futou' | 'zhanjiao' | 'li' | 'jin' | 'bun' | 'cap' | 'none';
  body?: 'robe' | 'short'; pose?: 'stand' | 'walk' | 'raise' | 'point' | 'push' | 'pull' | 'lean' | 'sit' | 'carry' | 'bow';
  load?: 'pole' | 'pack' | 'bundle' | 'parasol' | 'none'; robe?: number; stride?: number; lean?: number;
  tool?: Pt; // world/screen point a pole or rope reaches (push / pull)
  force?: boolean;
}
function figure(P: Painter, x: number, y: number, H: number, f: Fig = {}) {
  if (!f.force && !P.keepFig()) return;
  const d = f.dir ?? 1, u = H / 100, lean = f.lean ?? (f.pose === 'lean' || f.pose === 'bow' ? 1 : f.pose === 'push' || f.pose === 'pull' ? 0.7 : 0);
  const pose = f.pose ?? 'stand', body = f.body ?? 'robe', st = f.stride ?? (pose === 'walk' || pose === 'carry' ? 1 : 0.15);
  const T = (lx: number, ly: number): Pt => {
    if (ly < -44) { const k = (-ly - 44); lx += lean * k * (pose === 'pull' ? -0.32 : 0.42); ly += lean * k * 0.12; }
    return [x + lx * u * d, y + ly * u];
  };
  const lw = Math.max(1.05, H * 0.026), robeW = P.pal.robes[(f.robe ?? 0) % P.pal.robes.length];
  const robeFill = (pts: Pt[]) => { fill(P, pts, P.gfill(), true); fill(P, pts, P.wash(robeW), true); line(P, pts, lw, { closed: true, amp: 0.25 }); };
  // load behind the body
  if (f.load === 'pack') robeFill([T(-22, -82), T(-9, -84), T(-7, -52), T(-21, -50)]);
  if (f.load === 'pole') {
    const L = T(-36, -80), R = T(34, -77);
    for (const [e, k] of [[L, -1], [R, 1]] as [Pt, number][]) {
      seg(P, e[0], e[1], e[0], e[1] + 30 * u, lw * 0.7, 0.8);
      const bx = e[0], by = e[1] + 30 * u;
      shape(P, [[bx - 8 * u, by], [bx + 8 * u, by], [bx + 6 * u, by + 13 * u], [bx - 6 * u, by + 13 * u]], P.pal.straw, lw);
      void k;
    }
    seg(P, L[0], L[1], R[0], R[1], lw * 1.1);
  }
  // legs (short garments) or hem + feet (robes)
  if (body === 'short') {
    const k = pose === 'sit' ? 0 : 1;
    const legs: [Pt, Pt][] = [[T(3, -46), [x + (7 + st * 9) * u * d, y]], [T(-4, -46), [x + (-5 - st * 8) * u * d, y]]];
    if (k) for (const [a, b] of legs) {
      const pts: Pt[] = [[a[0] - 3 * u, a[1]], [a[0] + 3 * u, a[1]], [b[0] + 2.4 * u, b[1] - 2 * u], [b[0] - 2.4 * u, b[1] - 2 * u]];
      fill(P, pts, P.gfill()); line(P, pts, lw * 0.9, { closed: true, amp: 0.2 });
      seg(P, b[0] - 2 * u * d, b[1] - 1, b[0] + 5 * u * d, b[1] - 1, lw * 1.5);
    }
    robeFill(pose === 'sit' ? [T(-8, -78), T(-10, -40), T(14, -38), T(9, -76), T(2, -80)] : [T(-8, -78), T(-10, -44), T(10, -44), T(8, -76), T(2, -80)]);
  } else if (pose === 'sit') {
    robeFill([T(-4, -80), T(-9, -76), T(-11, -42), T(-12, -30), T(20, -30), T(22, -4), T(9, -2), T(8, -24), T(9, -58), T(7, -76), T(2, -80)]);
  } else {
    const hf = 12 + st * 6, hb = -13 - st * 3;
    robeFill([T(-4, -80), T(-9, -76), T(-10, -55), T(-11, -38), T(hb, -3), T(hf, -3), T(10, -38), T(9, -58), T(7, -76), T(2, -80)]);
    seg(P, x + hf * 0.75 * u * d, y - 1.5, x + (hf + 4) * u * d, y - 0.5, lw * 1.6);
    if (st > 0.5) seg(P, x + (hb + 1) * u * d, y - 1.5, x + (hb - 4) * u * d, y - 0.5, lw * 1.5);
    if (P.detail > 0.6) { const a = T(-1, -46), b = T(-2 - st * 2, -5); seg(P, a[0], a[1], b[0], b[1], lw * 0.6, 0.55); }
  }
  // belt
  { const a = T(-10, -47), b = T(10, -46); seg(P, a[0], a[1], b[0], b[1], lw * 0.8, 0.8); }
  // arm + hand
  let hand: Pt = T(11, -50);
  if (pose === 'raise') hand = T(13, -106); else if (pose === 'point') hand = T(30, -74);
  else if (pose === 'push' || pose === 'pull') hand = T(22, -64); else if (pose === 'carry' || f.load === 'pole') hand = T(10, -79);
  else if (pose === 'lean' || pose === 'bow') hand = T(16, -60); else if (pose === 'walk') hand = T(14, -54);
  else if (pose === 'sit') hand = T(16, -48);
  const sh = T(3, -75);
  if (body === 'robe') {
    const mid: Pt = [(sh[0] + hand[0]) / 2 - 2 * u * d, (sh[1] + hand[1]) / 2 + 4 * u];
    const sl: Pt[] = [sh, [mid[0] + 3 * u * d, mid[1]], [hand[0] + 1 * u * d, hand[1] + 4 * u], [hand[0] - 5 * u * d, hand[1] + 5 * u], [mid[0] - 5 * u * d, mid[1] + 3 * u], [sh[0] - 4 * u * d, sh[1] + 6 * u]];
    robeFill(sl);
  } else { line(P, [sh, [(sh[0] + hand[0]) / 2, (sh[1] + hand[1]) / 2 + 3 * u], hand], lw * 1.5, { amp: 0.2 }); }
  P.ctx.beginPath(); P.ctx.arc(hand[0], hand[1], Math.max(0.8, 2.2 * u), 0, Math.PI * 2); P.ctx.fillStyle = P.ink(0.9); P.ctx.fill();
  if (f.tool) line(P, [[hand[0] - (f.tool[0] - hand[0]) * 0.18, hand[1] - (f.tool[1] - hand[1]) * 0.18], f.tool], pose === 'pull' ? lw * 0.6 : lw * 1.1, { amp: 0.15 });
  if (f.load === 'bundle') shape(P, [T(8, -66), T(19, -66), T(19, -54), T(8, -54)], P.pal.wood, lw);
  // head
  const hc = T(3, -88), hr = 7.5 * u;
  P.ctx.beginPath(); P.ctx.arc(hc[0], hc[1], hr, 0, Math.PI * 2); P.ctx.fillStyle = rgba(P.pal.skin); P.ctx.fill();
  P.ctx.lineWidth = P.lw(lw * 0.9); P.ctx.strokeStyle = P.ink(0.95); P.ctx.stroke();
  const ink = P.ink(0.97), c = P.ctx; c.fillStyle = ink;
  // hair at the back of the head gives the profile
  c.beginPath(); c.arc(hc[0], hc[1], hr, d > 0 ? Math.PI * 0.55 : -Math.PI * 0.45, d > 0 ? Math.PI * 1.45 : Math.PI * 0.45); c.closePath(); c.fill();
  const hat = f.hat ?? 'futou';
  if (hat === 'futou' || hat === 'zhanjiao' || hat === 'jin' || hat === 'cap') {
    c.beginPath(); c.ellipse(hc[0] - 0.5 * u * d, hc[1] - 2.5 * u, hr * 1.12, hr * (hat === 'cap' ? 0.7 : 0.95), 0, Math.PI, Math.PI * 2); c.closePath(); c.fill();
    if (hat !== 'cap') { c.beginPath(); c.ellipse(hc[0] - 1.5 * u * d, hc[1] - 8.5 * u, hr * 0.62, hr * 0.62, 0, 0, Math.PI * 2); c.fill(); }
    if (hat === 'futou') { const a = T(-6, -91); line(P, [a, [a[0] - 6 * u * d, a[1] + 9 * u]], lw * 0.8, { amp: 0.1 }); }
    if (hat === 'zhanjiao') seg(P, hc[0] - 24 * u, hc[1] - 6 * u, hc[0] + 24 * u, hc[1] - 6 * u, lw * 0.9);
    if (hat === 'jin') { c.beginPath(); c.arc(hc[0] - 6 * u * d, hc[1] - 6 * u, hr * 0.45, 0, Math.PI * 2); c.fill(); }
  } else if (hat === 'li') {
    const pts: Pt[] = [[hc[0] - 16 * u, hc[1] - 2 * u], [hc[0], hc[1] - 15 * u], [hc[0] + 16 * u, hc[1] - 2 * u]];
    shape(P, pts, P.pal.straw, lw, { amp: 0.15 });
  } else if (hat === 'bun') { c.beginPath(); c.arc(hc[0] - 4 * u * d, hc[1] - 7 * u, hr * 0.55, 0, Math.PI * 2); c.fill(); }
  if (f.load === 'parasol') {
    const top: Pt = [hand[0], hand[1] - 52 * u]; seg(P, hand[0], hand[1], top[0], top[1], lw);
    const cn = ellipsePts(top[0], top[1] + 6 * u, 26 * u, 9 * u, Math.PI, Math.PI * 2, 14);
    shape(P, cn, P.pal.straw, lw);
  }
}

// ------------------------------------------------------------------ animals (side view sprites)
function beast(P: Painter, x: number, y: number, H: number, kind: 'donkey' | 'horse' | 'ox' | 'camel', d = 1, load = false, walk = 0.5) {
  if (!P.keepFig()) return;
  const u = H / 100, lw = Math.max(1.1, H * 0.022);
  const T = (lx: number, ly: number): Pt => [x + lx * u * d, y + ly * u];
  const sc = kind === 'horse' ? 1.2 : kind === 'camel' ? 1.25 : kind === 'ox' ? 1.15 : 1;
  const Tb = (lx: number, ly: number) => T(lx * sc, ly * sc);
  const legTop = kind === 'camel' ? -60 : kind === 'ox' ? -32 : -36;
  const legsX = kind === 'ox' ? [-26, -18, 18, 25] : [-28, -20, 20, 27];
  const wash = kind === 'camel' ? P.pal.straw : kind === 'ox' ? P.pal.wood : P.pal.shade;
  // legs
  legsX.forEach((lx, i) => {
    const sw = (i % 2 === 0 ? 1 : -1) * walk * 5;
    const a = Tb(lx, legTop), b = T(lx * sc + sw, 0);
    brush(P, a, [(a[0] + b[0]) / 2 + 1, (a[1] + b[1]) / 2], b, 5.5 * u * sc, 2.4 * u * sc, P.ink(0.9), 6);
  });
  let body: Pt[];
  if (kind === 'camel') {
    body = [Tb(-36, -62), Tb(-28, -86), Tb(-18, -92), Tb(-8, -82), Tb(4, -94), Tb(14, -86), Tb(26, -72), Tb(30, -62), Tb(16, -56), Tb(-30, -56)];
  } else if (kind === 'ox') {
    body = [Tb(-36, -40), Tb(-34, -58), Tb(-10, -62), Tb(18, -66), Tb(30, -56), Tb(30, -34), Tb(18, -28), Tb(-28, -30)];
  } else {
    body = [Tb(-38, -48), Tb(-34, -60), Tb(-10, -62), Tb(20, -62), Tb(32, -52), Tb(26, -36), Tb(-22, -34), Tb(-36, -40)];
  }
  // tail
  const tb = kind === 'camel' ? Tb(-35, -66) : Tb(-37, -54); brush(P, tb, [tb[0] - 6 * u * d, tb[1] + 8 * u], [tb[0] - 4 * u * d, tb[1] + 22 * u], 3 * u, 1 * u, P.ink(0.85), 6);
  shape(P, body, wash, lw, { amp: 0.25, smooth: true });
  // neck + head
  let neck: Pt[], head: Pt[], ears: Pt[] = [];
  if (kind === 'camel') {
    neck = [Tb(22, -70), Tb(38, -72), Tb(48, -84), Tb(50, -104), Tb(44, -108), Tb(40, -88), Tb(30, -80)];
    head = [Tb(42, -110), Tb(50, -114), Tb(62, -108), Tb(60, -102), Tb(48, -100)];
  } else if (kind === 'ox') {
    neck = [Tb(20, -64), Tb(36, -60), Tb(44, -48), Tb(36, -40), Tb(26, -44)];
    head = [Tb(36, -62), Tb(46, -60), Tb(54, -40), Tb(50, -34), Tb(40, -40)];
    const h1 = Tb(40, -62); line(P, [h1, [h1[0] + 4 * u * d, h1[1] - 10 * u], [h1[0] + 12 * u * d, h1[1] - 12 * u]], lw * 1.3);
  } else {
    const long = kind === 'horse' ? 1.15 : 1;
    neck = [Tb(14, -60), Tb(32 * long, -84), Tb(40 * long, -82), Tb(34, -56), Tb(26, -50)];
    head = [Tb(32 * long, -88), Tb(40 * long, -90), Tb(56 * long, -70), Tb(54 * long, -64), Tb(46 * long, -64), Tb(36 * long, -76)];
    const ex = 34 * long, ey = -88, el = kind === 'donkey' ? 20 : 9;
    ears = [Tb(ex - 1, ey), Tb(ex - 4, ey - el), Tb(ex + 2, ey - 1)];
    if (kind === 'horse') for (let i = 0; i < 6; i++) { const a = Tb(18 + i * 3.3, -64 - i * 3.8); seg(P, a[0], a[1], a[0] - 4 * u * d, a[1] + 3 * u, lw * 0.8, 0.8); }
  }
  shape(P, neck, wash, lw, { amp: 0.2, smooth: true });
  shape(P, head, wash, lw, { amp: 0.2, smooth: true });
  if (ears.length) { shape(P, ears, wash, lw * 0.9, { amp: 0.1 }); if (kind === 'donkey') { const e2 = ears.map(p => [p[0] + 4 * u * d, p[1] + 1] as Pt); shape(P, e2, wash, lw * 0.9, { amp: 0.1 }); } }
  if (load) {
    const lp: Pt[] = kind === 'camel' ? [Tb(-24, -82), Tb(-4, -96), Tb(16, -84), Tb(10, -66), Tb(-20, -66)] : [Tb(-24, -58), Tb(-20, -80), Tb(8, -82), Tb(14, -58), Tb(4, -46), Tb(-18, -46)];
    shape(P, lp, P.pal.straw, lw, { smooth: true });
    const a = lp[1], b = lp[3]; seg(P, a[0], a[1], b[0], b[1], lw * 0.7, 0.6);
  }
}

// wheel seen side-on
function wheel(P: Painter, cx: number, cy: number, r: number, lw: number) {
  shape(P, ellipsePts(cx, cy, r * 0.92, r, 0, Math.PI * 2, 20), P.pal.wood, lw * 1.2, { amp: 0.15 });
  for (let i = 0; i < 6; i++) { const t = i * Math.PI / 6; seg(P, cx - Math.cos(t) * r * 0.85, cy - Math.sin(t) * r * 0.9, cx + Math.cos(t) * r * 0.85, cy + Math.sin(t) * r * 0.9, lw * 0.6, 0.8); }
  P.ctx.beginPath(); P.ctx.arc(cx, cy, r * 0.16, 0, 7); P.ctx.fillStyle = P.ink(0.9); P.ctx.fill();
}
function sedan(P: Painter, x: number, y: number, H: number, d = 1, willow = false) {
  const u = H / 100, lw = Math.max(1.1, H * 0.024);
  figure(P, x - 52 * u * d, y, H, { dir: d, body: 'short', pose: 'walk', hat: 'cap', robe: 2, force: true });
  const box: Pt[] = [[x - 26 * u, y - 18 * u], [x + 26 * u, y - 18 * u], [x + 26 * u, y - 86 * u], [x - 26 * u, y - 86 * u]];
  shape(P, box, P.pal.wood, lw);
  seg(P, x - 18 * u, y - 70 * u, x - 18 * u, y - 30 * u, lw * 0.6); seg(P, x + 18 * u, y - 70 * u, x + 18 * u, y - 30 * u, lw * 0.6);
  shape(P, [[x - 34 * u, y - 84 * u], [x + 34 * u, y - 84 * u], [x + 22 * u, y - 100 * u], [x - 22 * u, y - 100 * u]], P.pal.roof, lw);
  seg(P, x - 78 * u, y - 70 * u, x + 78 * u, y - 70 * u, lw * 1.4);
  if (willow) for (let i = 0; i < 9; i++) {
    const bx = x + rr(P.r, -24, 24) * u, by = y - 100 * u;
    brush(P, [bx, by], [bx + rr(P.r, -14, 14) * u, by - 22 * u], [bx + rr(P.r, -26, 26) * u, by - rr(P.r, 20, 36) * u], 2.2 * u, 0.6 * u, P.wash(P.pal.leaf, 1.4), 6);
  }
  figure(P, x + 50 * u * d, y, H, { dir: d, body: 'short', pose: 'walk', hat: 'cap', robe: 4, force: true });
}
function parasol(P: Painter, x: number, y: number, R: number, h: number) {
  const lw = Math.max(1.1, R * 0.03);
  seg(P, x, y, x, y - h, lw * 1.2);
  const top = y - h;
  const pts = ellipsePts(x, top + R * 0.12, R, R * 0.34, 0, Math.PI * 2, 28);
  shape(P, pts, P.pal.straw, lw, { amp: 0.3 });
  fill(P, ellipsePts(x, top + R * 0.12, R, R * 0.34, 0, Math.PI, 14), P.wash(P.pal.shade, 0.6));
  for (let i = 0; i < 10; i++) { const t = i / 10 * Math.PI * 2; seg(P, x, top - R * 0.06, x + Math.cos(t) * R, top + R * 0.12 + Math.sin(t) * R * 0.34, lw * 0.5, 0.6); }
  P.ctx.beginPath(); P.ctx.arc(x, top - R * 0.08, lw * 1.6, 0, 7); P.ctx.fillStyle = P.ink(); P.ctx.fill();
}

// @@END@@
