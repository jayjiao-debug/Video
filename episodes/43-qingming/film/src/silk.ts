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
    roof: w(0.25), wood: w(0.13), water: w(0.07), leaf: w(0.24), leaf2: w(0.14), earth: w(0.05), straw: w(0.11), stone: w(0.1),
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
  lw(w: number) { return Math.max(w * 1.35, 0.8 / this.scale); }
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

// ------------------------------------------------------------------ 界画 buildings (oblique boxes, ridge along X or Z)
interface House {
  roof?: 'gable' | 'hip' | 'xieshan' | 'straw'; ridge?: 'x' | 'z'; front?: 'shop' | 'lattice' | 'doors' | 'wall' | 'open';
  awning?: boolean; storeys?: 1 | 2; huanmen?: boolean; flag?: boolean; sign?: boolean; rh?: number; base?: number; goods?: boolean; lift?: number;
}
function bayLines(P: Painter, q: (s: number, Y: number) => Pt, len: number, Y0: number, h: number, kind: string, lw: number) {
  const n = Math.max(1, Math.round(len / 66));
  for (let i = 0; i <= n; i++) { const a = q(i / n, Y0), b = q(i / n, Y0 + h * 0.86); seg(P, a[0], a[1], b[0], b[1], lw * (i === 0 || i === n ? 1.2 : 1)); }
  const l1 = q(0, Y0 + h * 0.84), l2 = q(1, Y0 + h * 0.84); seg(P, l1[0], l1[1], l2[0], l2[1], lw);
  const l3 = q(0, Y0 + h * 0.76), l4 = q(1, Y0 + h * 0.76); seg(P, l3[0], l3[1], l4[0], l4[1], lw * 0.8);
  for (let i = 0; i < n; i++) {
    const s0 = i / n, s1 = (i + 1) / n;
    if (kind === 'shop') {
      const k = [q(s0, Y0 + h * 0.3), q(s1, Y0 + h * 0.3), q(s1, Y0 + h * 0.74), q(s0, Y0 + h * 0.74)];
      fill(P, k, P.wash(P.pal.shade, 1.6));
      const c0 = q(s0 + 0.02, Y0 + h * 0.3), c1 = q(s1 - 0.02, Y0 + h * 0.3); seg(P, c0[0], c0[1], c1[0], c1[1], lw * 1.1);
      for (let j = 0; j < 3 && P.detail > 0.6; j++) { const g = q(lerp(s0, s1, 0.25 + j * 0.25), Y0 + h * 0.3); P.ctx.beginPath(); P.ctx.ellipse(g[0], g[1] - 4, 4, 5, 0, 0, 7); P.ctx.fillStyle = P.gfill(); P.ctx.fill(); P.ctx.lineWidth = P.lw(lw * 0.7); P.ctx.strokeStyle = P.ink(0.8); P.ctx.stroke(); }
    } else if (kind === 'lattice') {
      const m = 7; for (let j = 1; j < m; j++) { const a = q(lerp(s0, s1, j / m), Y0 + h * 0.42), b = q(lerp(s0, s1, j / m), Y0 + h * 0.74); seg(P, a[0], a[1], b[0], b[1], lw * 0.55, 0.8); }
      const a = q(s0, Y0 + h * 0.42), b = q(s1, Y0 + h * 0.42); seg(P, a[0], a[1], b[0], b[1], lw * 0.8);
    } else if (kind === 'doors') {
      for (let j = 1; j < 4; j++) { const a = q(lerp(s0, s1, j / 4), Y0), b = q(lerp(s0, s1, j / 4), Y0 + h * 0.74); seg(P, a[0], a[1], b[0], b[1], lw * 0.55, 0.7); }
    } else if (kind === 'open') {
      fill(P, [q(s0, Y0), q(s1, Y0), q(s1, Y0 + h * 0.74), q(s0, Y0 + h * 0.74)], P.wash(P.pal.shade, 1.3));
    }
  }
}
function roof(P: Painter, X: number, Z: number, w: number, d: number, Yb: number, rh: number, type: string, ridgeAxis: string) {
  // work in a local frame where the ridge runs along "a" (length L) and the slope faces the viewer along "b" (depth D)
  const along = ridgeAxis === 'x';
  const L = along ? w : d, D = along ? d : w;
  const ov = Math.min(D * 0.3, 40), sx = Math.min(L * 0.12, 30);
  const W = (a: number, Y: number, b: number): Pt => along ? P.pt(X + a, Y, Z + b) : P.pt(X + b, Y, Z + a);
  const straw = type === 'straw', lw = straw ? 1.8 : 2.0;
  const Ye = Yb - 3, Yr = Yb + rh, bm = D / 2;
  const lift = straw ? 0 : rh * 0.12;
  // eave front (b = -ov) with corner lift (翼角)
  const eave = (t: number, b: number): Pt => { const a = lerp(-sx, L + sx, t); const k = Math.pow(Math.abs(2 * t - 1), 4); return W(a + (t < 0.5 ? -1 : 1) * k * sx * 0.25, Ye + k * lift, b); };
  const hipIn = type === 'hip' ? Math.min(D * 0.55, L * 0.3) : type === 'xieshan' ? D * 0.3 : 0;
  const rA0 = -sx * 0.6 + hipIn, rA1 = L + sx * 0.6 - hipIn;
  const N = 16;
  if (!along) {
    // gable end faces the viewer: front gable (triangle/xieshan) + right slope visible
    const Ze0 = -ov, Ze1 = D + ov; // across b (X)
    // right slope: from ridge (b = bm) to eave b = D + ov, along a in [-sx, L+sx]
    const rs: Pt[] = [W(-sx, Yr, bm), W(L + sx, Yr, bm), W(L + sx, Ye, Ze1), W(-sx, Ye, Ze1)];
    shape(P, rs, straw ? P.pal.straw : P.pal.roof, lw);
    if (!straw) {
      P.ctx.save(); P.ctx.beginPath(); tracePath(P.ctx, rs, true, false); P.ctx.clip();
      for (let a = -sx; a <= L + sx; a += 11) { const p = W(a, Yr, bm), q2 = W(a, Ye, Ze1); seg(P, p[0], p[1], q2[0], q2[1], 0.9, 0.55); }
      P.ctx.restore();
    } else strawHatch(P, rs, W(0, Yr, bm), W(0, Ye, Ze1));
    // front gable (vertical triangle at a = -sx), with barge boards
    const g: Pt[] = [W(-sx, Ye, Ze0), W(-sx, Yr + 2, bm), W(-sx, Ye, Ze1)];
    shape(P, g, P.pal.shade, lw, { k: 0.6 });
    const wall: Pt[] = [W(0, Yb, 0), W(0, Yb + rh * 0.8, bm), W(0, Yb, D)];
    shape(P, wall, null, 1.2);
    const kp1 = W(0, Yb, bm), kp2 = W(0, Yb + rh * 0.8, bm); seg(P, kp1[0], kp1[1], kp2[0], kp2[1], 1.0);
    line(P, [W(-sx, Ye - 6, Ze0 - 4), W(-sx, Yr + 6, bm), W(-sx, Ye - 6, Ze1 + 4)], straw ? 3 : 2.6);
    if (!straw) { const top = W(-sx, Yr + 6, bm); brush(P, top, [top[0] - 4, top[1] - 8], [top[0] + 3, top[1] - 14], 4, 1.2); }
    const r0 = W(-sx, Yr + 2, bm), r1 = W(L + sx, Yr + 2, bm); line(P, [r0, r1], straw ? 4 : 3.2);
    return;
  }
  // ridge along X: front slope faces the viewer
  const front: Pt[] = [];
  for (let i = 0; i <= N; i++) front.push(eave(i / N, -ov));
  if (hipIn > 0 && type === 'xieshan') front.push(W(L + sx - hipIn * 0.2, Ye + rh * 0.5, -ov + (bm + ov) * 0.5));
  front.push(W(rA1, Yr, bm)); front.push(W(rA0, Yr, bm));
  if (hipIn > 0 && type === 'xieshan') front.push(W(-sx + hipIn * 0.2, Ye + rh * 0.5, -ov + (bm + ov) * 0.5));
  shape(P, front, straw ? P.pal.straw : P.pal.roof, 0, { noGround: false });
  if (!straw) {
    P.ctx.save(); P.ctx.beginPath(); tracePath(P.ctx, front, true, false); P.ctx.clip();
    const step = P.detail > 0.6 ? 10 : 18;
    for (let a = -sx - 30; a <= L + sx + 30; a += step) {
      const p = W(a, Ye - 2, -ov - 2), q2 = W(a, Yr + 2, bm), m = W(a, Ye + rh * 0.42, (bm - ov) * 0.42 - ov * 0.2);
      line(P, [p, [m[0], m[1] + rh * 0.04], q2], 0.95, { a: 0.55, amp: 0.2 });
    }
    P.ctx.restore();
    // tile-end row under the eave
    for (let i = 0; i <= N * 3; i++) { const p = eave(i / (N * 3), -ov); P.ctx.beginPath(); P.ctx.arc(p[0], p[1] + 1.5, 1.6, 0, 7); P.ctx.fillStyle = P.ink(0.7); P.ctx.fill(); }
  } else strawHatch(P, front, W(0, Ye, -ov), W(0, Yr, bm));
  // right end (gable / hip / xieshan)
  const Re = L + sx;
  if (type === 'gable' || type === 'straw') {
    const g: Pt[] = [eave(1, -ov), W(L + sx * 0.6, Yr, bm), W(Re, Ye, D + ov)];
    shape(P, g, P.pal.shade, lw, { k: 0.7 });
    const wall: Pt[] = [W(L, Yb - 2, 0), W(L, Yb + rh * 0.8, bm), W(L, Yb - 2, D)];
    shape(P, wall, null, 1.1);
    if (!straw) line(P, [eave(1, -ov), W(L + sx * 0.6, Yr + 3, bm), W(Re, Ye, D + ov)], 2.4);
    else line(P, [eave(1, -ov), W(L + sx * 0.6, Yr + 3, bm), W(Re, Ye, D + ov)], 2.6, { amp: 1.2 });
  } else if (type === 'hip') {
    const g: Pt[] = [eave(1, -ov), W(rA1, Yr, bm), W(Re, Ye, D + ov)];
    shape(P, g, P.pal.roof, lw, { k: 1.25 });
    P.ctx.save(); P.ctx.beginPath(); tracePath(P.ctx, g, true, false); P.ctx.clip();
    for (let b = -ov; b <= D + ov; b += 10) { const p = W(Re, Ye, b), q2 = W(rA1 - 10, Yr, bm); seg(P, p[0], p[1], q2[0], q2[1], 0.9, 0.5); }
    P.ctx.restore();
    line(P, [eave(1, -ov), W(rA1, Yr + 2, bm)], 2.6); line(P, [W(rA1, Yr + 2, bm), W(Re, Ye, D + ov)], 2.2);
  } else {
    const gx = L + sx - hipIn * 0.2, gy = Ye + rh * 0.5;
    const hipP: Pt[] = [eave(1, -ov), W(Re, Ye, D + ov), W(gx, gy, D + ov - (bm + ov) * 0.5), W(gx, gy, -ov + (bm + ov) * 0.5)];
    shape(P, hipP, P.pal.roof, lw, { k: 1.25 });
    const tri: Pt[] = [W(gx, gy, -ov + (bm + ov) * 0.5), W(rA1, Yr, bm), W(gx, gy, D + ov - (bm + ov) * 0.5)];
    shape(P, tri, P.pal.shade, 1.6, { k: 0.8 });
    line(P, [W(gx, gy, -ov + (bm + ov) * 0.5), W(rA1, Yr + 3, bm), W(gx, gy, D + ov - (bm + ov) * 0.5)], 2.2);
    line(P, [eave(1, -ov), W(gx, gy, -ov + (bm + ov) * 0.5)], 2.4);
  }
  // eave line + ridge with upturned ends
  const ev: Pt[] = []; for (let i = 0; i <= N; i++) ev.push(eave(i / N, -ov));
  line(P, ev, straw ? 2.4 : 2.6, { amp: straw ? 1.4 : 0.5 });
  const r0 = W(rA0, Yr + 2, bm), r1 = W(rA1, Yr + 2, bm);
  line(P, [r0, r1], straw ? 4.2 : 3.4, { amp: straw ? 1 : 0.4 });
  if (!straw) for (const [p, s] of [[r0, -1], [r1, 1]] as [Pt, number][]) brush(P, p, [p[0] + s * 2, p[1] - 9], [p[0] - s * 5, p[1] - 15], 4.5, 1.2);
}
function strawHatch(P: Painter, poly: Pt[], low: Pt, high: Pt) {
  const c = P.ctx; c.save(); c.beginPath(); tracePath(c, poly, true, false); c.clip();
  let xs = Infinity, xe = -Infinity, ys = Infinity, ye = -Infinity;
  for (const p of poly) { xs = Math.min(xs, p[0]); xe = Math.max(xe, p[0]); ys = Math.min(ys, p[1]); ye = Math.max(ye, p[1]); }
  const dx = high[0] - low[0], dy = high[1] - low[1]; const L = Math.hypot(dx, dy) || 1; const ux = dx / L, uy = dy / L;
  const n = Math.round((xe - xs) * (ye - ys) / 500 * P.detail);
  for (let i = 0; i < n; i++) {
    const x = rr(P.r, xs, xe), y = rr(P.r, ys, ye), l = rr(P.r, 8, 22);
    seg(P, x, y, x + ux * l + rr(P.r, -1.5, 1.5), y + uy * l, rr(P.r, 0.7, 1.2), rr(P.r, 0.35, 0.7));
  }
  c.restore();
}
function house(P: Painter, X: number, Z: number, w: number, d: number, h: number, o: House = {}) {
  if (o.lift) { const pr = P.proj; P.proj = { ...pr, oy: pr.oy - o.lift }; house(P, X, Z, w, d, h, { ...o, lift: 0 }); P.proj = pr; return; }
  const ridge = o.ridge ?? 'x', type = o.roof ?? 'gable', rh = o.rh ?? (type === 'straw' ? d * 0.5 : d * 0.42) * (ridge === 'z' ? w / d : 1);
  const base = o.base ?? 0, lw = 1.6;
  const storeys = o.storeys ?? 1;
  const walls = (Yb: number, hh: number, front: string) => {
    const R: Pt[] = [P.pt(X + w, Yb, Z), P.pt(X + w, Yb, Z + d), P.pt(X + w, Yb + hh, Z + d), P.pt(X + w, Yb + hh, Z)];
    shape(P, R, P.pal.shade, lw, { k: 0.75 });
    if (P.detail > 0.6 && d > 70) { const m = R.length; void m; const a = P.pt(X + w, Yb + hh * 0.35, Z + d * 0.35), b = P.pt(X + w, Yb + hh * 0.35, Z + d * 0.7), c2 = P.pt(X + w, Yb + hh * 0.75, Z + d * 0.7), e = P.pt(X + w, Yb + hh * 0.75, Z + d * 0.35); shape(P, [a, b, c2, e], null, 1.1, { noGround: true }); for (let j = 1; j < 5; j++) { const p1 = P.pt(X + w, Yb + hh * 0.35, Z + d * (0.35 + 0.07 * j)), p2 = P.pt(X + w, Yb + hh * 0.75, Z + d * (0.35 + 0.07 * j)); seg(P, p1[0], p1[1], p2[0], p2[1], 0.7, 0.7); } }
    const F: Pt[] = [P.pt(X, Yb, Z), P.pt(X + w, Yb, Z), P.pt(X + w, Yb + hh, Z), P.pt(X, Yb + hh, Z)];
    shape(P, F, P.pal.wood, lw, { k: 0.35 });
    bayLines(P, (s, Y) => P.pt(X + s * w, Y, Z), w, Yb, hh, front, 1.25);
    // shade under the eave
    fill(P, [P.pt(X, Yb + hh * 0.86, Z), P.pt(X + w, Yb + hh * 0.86, Z), P.pt(X + w, Yb + hh, Z), P.pt(X, Yb + hh, Z)], P.wash(P.pal.shade, 0.9));
  };
  if (base > 0) {
    const R: Pt[] = [P.pt(X + w + 6, 0, Z - 6), P.pt(X + w + 6, 0, Z + d + 6), P.pt(X + w + 6, base, Z + d + 6), P.pt(X + w + 6, base, Z - 6)];
    shape(P, R, P.pal.stone, 1.4);
    const F: Pt[] = [P.pt(X - 6, 0, Z - 6), P.pt(X + w + 6, 0, Z - 6), P.pt(X + w + 6, base, Z - 6), P.pt(X - 6, base, Z - 6)];
    shape(P, F, P.pal.stone, 1.4, { k: 0.6 });
  }
  if (ridge === 'z') {
    walls(base, h, o.front ?? 'doors');
    roof(P, X, Z, w, d, base + h, rh, type, 'z');
  } else if (storeys === 2) {
    const h1 = h * 0.62, h2 = h * 0.5;
    walls(base, h1, o.front ?? 'shop');
    // pent roof (腰檐) along the front
    const pz = Z - 30, Yp = base + h1 + 4;
    const pent: Pt[] = [P.pt(X - 14, Yp - 16, pz), P.pt(X + w + 14, Yp - 16, pz), P.pt(X + w + 6, Yp + 14, Z + 10), P.pt(X - 6, Yp + 14, Z + 10)];
    shape(P, pent, P.pal.roof, 2.2, { amp: 0.4 });
    P.ctx.save(); P.ctx.beginPath(); tracePath(P.ctx, pent, true, false); P.ctx.clip();
    for (let a = -14; a <= w + 14; a += 10) { const p = P.pt(X + a, Yp - 16, pz), q2 = P.pt(X + a, Yp + 14, Z + 10); seg(P, p[0], p[1], q2[0], q2[1], 0.9, 0.5); }
    P.ctx.restore();
    walls(Yp + 14, h2, 'lattice');
    // balcony railing
    const rY = Yp + 14 + h2 * 0.32;
    const ra = P.pt(X - 4, rY, Z - 4), rb = P.pt(X + w + 4, rY, Z - 4); seg(P, ra[0], ra[1], rb[0], rb[1], 1.6);
    for (let a = 0; a <= w; a += 14) { const p = P.pt(X + a, Yp + 14, Z - 4), q2 = P.pt(X + a, rY, Z - 4); seg(P, p[0], p[1], q2[0], q2[1], 0.8, 0.8); }
    roof(P, X, Z, w, d, Yp + 14 + h2, rh * 0.9, type, 'x');
  } else {
    walls(base, h, o.front ?? (type === 'straw' ? 'wall' : 'shop'));
    roof(P, X, Z, w, d, base + h, rh, type, 'x');
  }
  if (o.awning) awning(P, X + w * 0.06, Z, w * 0.88, h * 0.72);
  if (o.huanmen) huanmen(P, X + w * 0.12, Z - 34, w * 0.76, h + rh * 1.15);
  if (o.flag) wineFlag(P, X + w + 18, Z - 20, h + rh + 70);
  if (o.sign) signboard(P, X + w * 0.86, Z - 40, 26, 64);
}
function awning(P: Painter, X: number, Z: number, w: number, Y: number) {
  const out = 70, Yl = Y - 22;
  const top: Pt[] = [P.pt(X, Y, Z), P.pt(X + w, Y, Z), P.pt(X + w, Yl, Z - out), P.pt(X, Yl, Z - out)];
  for (const a of [0, 0.5, 1]) { const p = P.pt(X + a * w, 0, Z - out), q = P.pt(X + a * w, Yl, Z - out); seg(P, p[0], p[1], q[0], q[1], 1.4); }
  shape(P, top, P.pal.straw, 1.5, { k: 0.8 });
  for (let i = 1; i < 8; i++) { const p = P.pt(X + w * i / 8, Y, Z), q = P.pt(X + w * i / 8, Yl, Z - out); seg(P, p[0], p[1], q[0], q[1], 0.7, 0.5); }
  const e0 = P.pt(X, Yl, Z - out), e1 = P.pt(X + w, Yl, Z - out);
  line(P, [e0, e1], 2.0);
  // the front valance
  const v: Pt[] = [e0, e1, [e1[0], e1[1] + 9], [e0[0], e0[1] + 9]]; shape(P, v, P.pal.straw, 1.0, { k: 1.2 });
}
function huanmen(P: Painter, X: number, Z: number, w: number, H: number) {
  // 彩楼欢门: the restaurant's scaffold gateway of tied poles with three peaks
  const posts = 7, lw = 1.5;
  for (let i = 0; i < posts; i++) { const a = i / (posts - 1); const p = P.pt(X + a * w, 0, Z); const hh = H * (0.78 + (i % 3 === 0 ? 0.22 : i % 3 === 1 ? 0.12 : 0.12)); const q = P.pt(X + a * w, hh, Z); seg(P, p[0], p[1], q[0], q[1], lw); }
  for (const yf of [0.55, 0.7, 0.78]) { const p = P.pt(X - 6, H * yf, Z), q = P.pt(X + w + 6, H * yf, Z); seg(P, p[0], p[1], q[0], q[1], lw); }
  for (let i = 0; i < posts - 1; i++) {
    const a0 = i / (posts - 1), a1 = (i + 1) / (posts - 1);
    const p = P.pt(X + a0 * w, H * 0.55, Z), q = P.pt(X + a1 * w, H * 0.7, Z), r2 = P.pt(X + a1 * w, H * 0.55, Z), s = P.pt(X + a0 * w, H * 0.7, Z);
    seg(P, p[0], p[1], q[0], q[1], 0.9, 0.85); seg(P, r2[0], r2[1], s[0], s[1], 0.9, 0.85);
  }
  for (let k = 0; k < 3; k++) {
    const a0 = k / 3, a1 = (k + 1) / 3, am = (a0 + a1) / 2;
    line(P, [P.pt(X + a0 * w, H * 0.78, Z), P.pt(X + am * w, H * 1.04, Z), P.pt(X + a1 * w, H * 0.78, Z)], 1.4);
    const t = P.pt(X + am * w, H * 1.04, Z);
    fill(P, [[t[0], t[1]], [t[0] + 14, t[1] + 4], [t[0], t[1] + 8]], P.wash(P.pal.red, 1));
  }
  // festoons
  for (let i = 0; i < posts - 1; i++) {
    const a = P.pt(X + i / (posts - 1) * w, H * 0.55, Z), b = P.pt(X + (i + 1) / (posts - 1) * w, H * 0.55, Z);
    line(P, qbez(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 12], b, 8), 1.0, { a: 0.8 });
  }
}
function wineFlag(P: Painter, X: number, Z: number, H: number) {
  const p = P.pt(X, 0, Z), q = P.pt(X, H, Z); seg(P, p[0], p[1], q[0], q[1], 2.0);
  const t = P.pt(X, H - 6, Z), arm: Pt = [t[0] + 34, t[1] - 4]; seg(P, t[0], t[1], arm[0], arm[1], 1.5);
  const fl: Pt[] = [[arm[0] - 4, arm[1] + 2], [arm[0] + 22, arm[1] + 4], [arm[0] + 24, arm[1] + 96], [arm[0] + 12, arm[1] + 88], [arm[0] - 2, arm[1] + 98]];
  shape(P, fl, P.mode === 'colour' ? { c: hex('#FCF7EA'), a: 1 } : P.pal.straw, 1.4, { k: 0.4 });
  fill(P, [[arm[0] - 3, arm[1] + 2], [arm[0] + 22, arm[1] + 4], [arm[0] + 22, arm[1] + 14], [arm[0] - 3, arm[1] + 12]], P.wash(P.pal.red, 0.9));
  for (let i = 0; i < 2; i++) illegibleGlyph(P, arm[0] + 10, arm[1] + 34 + i * 26, 18, 1.0);
}
function signboard(P: Painter, X: number, Z: number, w: number, h: number) {
  const a = P.pt(X, 0, Z); const b: Pt = [a[0], a[1] - h - 20];
  seg(P, a[0] - w * 0.3, a[1], a[0] - w * 0.3, b[1] + h, 1.4); seg(P, a[0] + w * 0.3, a[1], a[0] + w * 0.3, b[1] + h, 1.4);
  const bd: Pt[] = [[a[0] - w / 2, b[1]], [a[0] + w / 2, b[1]], [a[0] + w / 2, b[1] + h], [a[0] - w / 2, b[1] + h]];
  shape(P, bd, P.pal.wood, 1.6, { k: 0.6 });
  fill(P, [[a[0] - w / 2 + 4, b[1] + 4], [a[0] + w / 2 - 4, b[1] + 4], [a[0] + w / 2 - 4, b[1] + h - 4], [a[0] - w / 2 + 4, b[1] + h - 4]], P.gfill());
  for (let i = 0; i < 3; i++) illegibleGlyph(P, a[0], b[1] + 14 + i * 18, 13, 0.9);
}
function fence(P: Painter, X0: number, Z0: number, X1: number, Z1: number, h: number) {
  const n = Math.max(2, Math.round(Math.hypot(X1 - X0, Z1 - Z0) / 16));
  for (let i = 0; i <= n; i++) {
    const t = i / n; const p = P.pt(lerp(X0, X1, t), 0, lerp(Z0, Z1, t)), q = P.pt(lerp(X0, X1, t), h * (0.85 + 0.3 * P.r()), lerp(Z0, Z1, t));
    seg(P, p[0], p[1], q[0] + rr(P.r, -2, 2), q[1], 1.0, 0.85);
  }
  for (const yf of [0.35, 0.75]) line(P, [P.pt(X0, h * yf, Z0), P.pt(X1, h * yf, Z1)], 1.1, { a: 0.85, amp: 0.8 });
}

// pseudo-character: an illegible glyph built from brush strokes (for signs, flags, colophons in other hands)
function illegibleGlyph(P: Painter, cx: number, cy: number, size: number, weight = 1, cursive = 0) {
  const r = P.r, s = size / 2, n = ri(r, 3, 7), wB = size * 0.09 * weight;
  let px = cx + rr(r, -s, 0), py = cy + rr(r, -s, -s * 0.3);
  for (let i = 0; i < n; i++) {
    const k = r(); let a: Pt, b: Pt, m: Pt;
    if (k < 0.32) { const y = cy + rr(r, -s, s) * 0.85, x0 = cx - s * rr(r, 0.4, 0.95), x1 = cx + s * rr(r, 0.3, 0.95); a = [x0, y]; b = [x1, y - s * 0.06]; m = [(x0 + x1) / 2, y - s * 0.05]; }
    else if (k < 0.6) { const x = cx + rr(r, -s, s) * 0.75, y0 = cy - s * rr(r, 0.5, 0.95), y1 = cy + s * rr(r, 0.2, 0.95); a = [x, y0]; b = [x, y1]; m = [x + rr(r, -1, 1), (y0 + y1) / 2]; }
    else if (k < 0.78) { a = [cx + rr(r, -0.1, 0.4) * s, cy - rr(r, 0.2, 0.8) * s]; b = [cx - rr(r, 0.5, 0.95) * s, cy + rr(r, 0.4, 0.95) * s]; m = [(a[0] + b[0]) / 2 + s * 0.15, (a[1] + b[1]) / 2]; }
    else if (k < 0.92) { a = [cx - rr(r, 0, 0.3) * s, cy - rr(r, 0, 0.4) * s]; b = [cx + rr(r, 0.5, 0.95) * s, cy + rr(r, 0.5, 0.95) * s]; m = [(a[0] + b[0]) / 2 - s * 0.1, (a[1] + b[1]) / 2 + s * 0.1]; }
    else { a = [cx + rr(r, -0.7, 0.7) * s, cy + rr(r, -0.8, 0.6) * s]; b = [a[0] + s * 0.18, a[1] + s * 0.22]; m = [a[0] + s * 0.12, a[1] + s * 0.05]; }
    if (cursive > 0 && i > 0) { brush(P, [px, py], [(px + a[0]) / 2 + rr(r, -3, 3), (py + a[1]) / 2], a, wB * 0.25, wB * 0.25, undefined, 5); }
    brush(P, a, m, b, wB * rr(r, 0.8, 1.25), wB * rr(r, 0.35, 0.9), undefined, 7);
    px = b[0]; py = b[1];
  }
}

// ------------------------------------------------------------------ trees (screen space, foot at x,y)
function branches(P: Painter, x: number, y: number, ang: number, len: number, w: number, depth: number, tips: Pt[], claw = 0) {
  const r = P.r; const bend = rr(r, -0.35, 0.35);
  const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
  const mx = x + Math.cos(ang + bend) * len * 0.55, my = y + Math.sin(ang + bend) * len * 0.55;
  brush(P, [x, y], [mx, my], [ex, ey], w, w * 0.62, P.ink(0.93), 8);
  if (depth <= 0 || len < 9) {
    tips.push([ex, ey]);
    if (claw > 0) { // crab-claw twigs (蟹爪) of the bare spring trees
      for (let i = 0; i < 2; i++) { const a = ang + rr(r, -0.9, 0.9); const l = len * rr(r, 0.4, 0.8); const tx = ex + Math.cos(a) * l, ty = ey + Math.sin(a) * l; brush(P, [ex, ey], [tx, ty - l * 0.1], [tx + Math.cos(a + 1.6) * l * 0.3, ty + Math.sin(a + 1.6) * l * 0.3 + l * 0.25], w * 0.6, 0.5, P.ink(0.85), 6); }
    }
    return;
  }
  const kids = depth > 2 ? 2 : ri(r, 2, 3);
  for (let i = 0; i < kids; i++) {
    const a = ang + (i - (kids - 1) / 2) * rr(r, 0.45, 0.85) + rr(r, -0.15, 0.15);
    branches(P, ex, ey, a, len * rr(r, 0.62, 0.8), w * 0.64, depth - 1, tips, claw);
  }
}
function trunk(P: Painter, x: number, y: number, H: number, wBase: number, lean: number): Pt {
  const r = P.r; const top: Pt = [x + lean * H * 0.35, y - H * 0.42];
  const mid: Pt = [x + lean * H * 0.08 + rr(r, -6, 6), y - H * 0.22];
  const L: Pt[] = [], R: Pt[] = [];
  const pts = qbez([x, y], mid, top, 10);
  for (let i = 0; i <= 10; i++) { const t = i / 10; const w = wBase * (1 - t * 0.55) * (i === 0 ? 1.5 : 1) * (1 + 0.12 * Math.sin(i * 1.7)); L.push([pts[i][0] - w / 2, pts[i][1]]); R.push([pts[i][0] + w / 2, pts[i][1]]); }
  const poly = L.concat(R.reverse());
  shape(P, poly, P.pal.wood, 2.0, { amp: 0.8, k: P.mode === 'colour' ? 0.9 : 1.4 });
  for (let i = 0; i < 6 * P.detail; i++) { const t = rr(r, 0.1, 0.9); const p = pts[Math.round(t * 10)]; const w = wBase * (1 - t * 0.55); brush(P, [p[0] - w * 0.3, p[1]], [p[0] - w * 0.1, p[1] - 6], [p[0] + w * 0.25 * rr(r, -1, 1), p[1] - rr(r, 8, 18)], 1.6, 0.5, P.ink(0.6), 5); }
  return top;
}
function willow(P: Painter, x: number, y: number, H: number) {
  const r = P.r; const top = trunk(P, x, y, H, H * 0.07, rr(r, -0.25, 0.25));
  const tips: Pt[] = [];
  for (let i = 0; i < 5; i++) branches(P, top[0], top[1], -Math.PI / 2 + (i - 2) * 0.38 + rr(r, -0.1, 0.1), H * rr(r, 0.16, 0.24), H * 0.032, 3, tips);
  const ns = Math.round(tips.length * 7 * (0.55 + 0.45 * P.detail));
  const col = P.mode === 'colour' ? rgba(mix(C_LV, hex('#7FA36A'), 0.4), 0.85 * (1 - P.fog * 0.6)) : P.ink(0.62);
  for (let i = 0; i < ns; i++) {
    const t = pick(r, tips); const sx = t[0] + rr(r, -16, 16), sy = t[1] + rr(r, -8, 12);
    const len = H * rr(r, 0.18, 0.55) * (0.6 + 0.4 * Math.min(1, Math.abs(sx - top[0]) / (H * 0.25))), sway = rr(r, -0.1, 0.1) * len;
    brush(P, [sx, sy], [sx + sway * 0.2 + rr(r, -6, 6), sy - len * 0.12], [sx + sway, sy + len], rr(r, 1.6, 2.8), 0.6, col, 9);
  }
  if (P.mode === 'colour') for (let i = 0; i < 5; i++) { const t = pick(r, tips); fill(P, ellipsePts(t[0], t[1] + H * 0.2, H * 0.14, H * 0.2, 0, 7, 16), rgba(C_LV, 0.12 * (1 - P.fog)), true); }
}
function leafTree(P: Painter, x: number, y: number, H: number, style: 'dot' | 'jia' = 'dot') {
  const r = P.r; const top = trunk(P, x, y, H, H * 0.085, rr(r, -0.2, 0.2));
  const tips: Pt[] = [];
  for (let i = 0; i < 3; i++) branches(P, top[0], top[1], -Math.PI / 2 + (i - 1) * 0.6 + rr(r, -0.15, 0.15), H * rr(r, 0.2, 0.28), H * 0.04, 3, tips);
  // foliage clumps of dotted leaves (点叶)
  const clumps = tips.filter((_, i) => i % 2 === 0);
  for (const t of clumps) {
    const cr = H * rr(r, 0.09, 0.14);
    if (P.mode === 'colour') fill(P, ellipsePts(t[0], t[1], cr * 1.2, cr * 0.85, 0, 7, 16), P.wash(P.pal.leaf, 0.55), true);
    else fill(P, ellipsePts(t[0], t[1], cr * 1.15, cr * 0.8, 0, 7, 16), P.wash(P.pal.leaf, 0.6), true);
    const nd = Math.round(70 * P.detail);
    for (let i = 0; i < nd; i++) {
      const a = r() * Math.PI * 2, q = Math.sqrt(r()); const px = t[0] + Math.cos(a) * cr * 1.1 * q, py = t[1] + Math.sin(a) * cr * 0.75 * q;
      if (style === 'dot') { P.ctx.beginPath(); P.ctx.ellipse(px, py, 2.6, 1.7, rr(r, -0.6, 0.6), 0, 7); P.ctx.fillStyle = P.ink(0.82); P.ctx.fill(); }
      else { const pts = ellipsePts(px, py, 4.5, 2.4, 0, 7, 8).map(p => [p[0], p[1]] as Pt); line(P, pts, 0.8, { closed: true, amp: 0.1, a: 0.8 }); }
    }
  }
}
function bareTree(P: Painter, x: number, y: number, H: number) {
  const r = P.r; const top = trunk(P, x, y, H, H * 0.08, rr(r, -0.3, 0.3)); const tips: Pt[] = [];
  for (let i = 0; i < 3; i++) branches(P, top[0], top[1], -Math.PI / 2 + (i - 1) * 0.7 + rr(r, -0.2, 0.2), H * rr(r, 0.2, 0.3), H * 0.04, 3, tips, 1);
  if (P.mode === 'colour') for (const t of tips) if (r() < 0.5) { P.ctx.beginPath(); P.ctx.arc(t[0], t[1], 2.4, 0, 7); P.ctx.fillStyle = rgba(C_LV, 0.8); P.ctx.fill(); }
}
// a soft distant tree line (fogged)
function farTrees(P: Painter, x0: number, x1: number, y: number, H: number) {
  const r = P.r;
  for (let x = x0; x < x1; x += rr(r, 40, 90)) {
    const h = H * rr(r, 0.6, 1.1);
    seg(P, x, y, x + rr(r, -4, 4), y - h * 0.5, 1.4, 0.5);
    fill(P, ellipsePts(x, y - h * 0.7, h * 0.28, h * 0.32, 0, 7, 12), P.wash(P.pal.leaf, 0.3), true);
    for (let i = 0; i < 8 * P.detail; i++) { P.ctx.beginPath(); P.ctx.arc(x + rr(r, -h * 0.25, h * 0.25), y - h * 0.7 + rr(r, -h * 0.25, h * 0.25), 1.8, 0, 7); P.ctx.fillStyle = P.ink(0.4); P.ctx.fill(); }
  }
}

// ------------------------------------------------------------------ ground & water
function tuft(P: Painter, x: number, y: number, s: number, a = 0.75) {
  const n = ri(P.r, 3, 5);
  for (let i = 0; i < n; i++) { const dx = (i - (n - 1) / 2) * s * 0.35; brush(P, [x + dx * 0.4, y], [x + dx, y - s * 0.6], [x + dx * 1.6 + rr(P.r, -2, 2), y - s * rr(P.r, 0.7, 1.2)], s * 0.16, s * 0.04, P.ink(a), 5); }
}
function dots(P: Painter, x: number, y: number, n: number, sp: number) {
  for (let i = 0; i < n; i++) { P.ctx.beginPath(); P.ctx.ellipse(x + rr(P.r, -sp, sp), y + rr(P.r, -sp * 0.4, sp * 0.4), 2.4, 1.6, 0, 0, 7); P.ctx.fillStyle = P.ink(0.7); P.ctx.fill(); }
}
// fish-scale ripples + long current lines inside a polygon (screen space)
function ripples(P: Painter, poly: Pt[], flow: Pt, dens = 1) {
  const c = P.ctx; c.save(); c.beginPath(); tracePath(c, poly, true, false); c.clip();
  let xs = Infinity, xe = -Infinity, ys = Infinity, ye = -Infinity;
  for (const p of poly) { xs = Math.min(xs, p[0]); xe = Math.max(xe, p[0]); ys = Math.min(ys, p[1]); ye = Math.max(ye, p[1]); }
  const r = P.r, fl = Math.hypot(flow[0], flow[1]); const fx = flow[0] / fl, fy = flow[1] / fl;
  const col = P.mode === 'colour' ? rgba(mix(C_QING, P.pal.ink, 0.35), 0.5) : P.ink(0.42);
  // long current lines along the flow
  for (let i = 0; i < 60 * dens * P.detail; i++) {
    const x = rr(r, xs, xe), y = rr(r, ys, ye), l = rr(r, 120, 340);
    const pts: Pt[] = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push([x + fx * l * t - fy * Math.sin(t * 6 + i) * 3, y + fy * l * t + fx * Math.sin(t * 6 + i) * 3]); }
    line(P, pts, 0.9, { color: col, amp: 0.2 });
  }
  // scale ripples
  const sp = 30 / Math.sqrt(dens);
  for (let y = ys; y < ye; y += sp * 0.8) {
    const off = (Math.floor(y / sp) % 2) * sp;
    for (let x = xs + off; x < xe; x += sp * 2.2) {
      if (r() > 0.75 * P.detail + 0.15) continue;
      const px = x + rr(r, -10, 10), py = y + rr(r, -4, 4), s = rr(r, 9, 15);
      c.beginPath(); c.moveTo(px - s, py); c.quadraticCurveTo(px - fx * 2, py - s * 0.45, px + s, py);
      c.lineWidth = P.lw(1.0); c.strokeStyle = col; c.stroke();
    }
  }
  c.restore();
}

// ------------------------------------------------------------------ boats (hull along Z, the flow)
interface Boat { cabin?: 'long' | 'small' | 'none'; mast?: number | null; mastH?: number; crew?: number; push?: Pt[]; oar?: boolean; tow?: Pt | null; robeSeed?: number }
function boat(P: Painter, Xc: number, Z0: number, L: number, beam: number, o: Boat = {}): { apex?: Pt; roofY: number } {
  const hh = beam * 0.26, N = 24, lw = 2.2;
  const hw = (s: number) => beam / 2 * (1 - 0.42 * Math.pow(Math.abs(2 * s - 1), 3));
  const g = (s: number) => hh * (1 + 0.85 * Math.pow(Math.abs(2 * s - 1), 2.4)) + (s > 0.5 ? (s - 0.5) * hh * 0.5 : 0);
  const Z = (s: number) => Z0 + s * L;
  const W = (s: number, side: number, Y: number) => P.pt(Xc + side * hw(s) * (Y <= 0 ? 0.9 : 1), Y, Z(s));
  // water shadow under the hull
  const sh: Pt[] = []; for (let i = 0; i <= N; i++) sh.push(P.pt(Xc + hw(i / N) * 1.25, 0, Z(i / N)));
  for (let i = N; i >= 0; i--) sh.push(P.pt(Xc - hw(i / N) * 0.6, 0, Z(i / N)));
  fill(P, sh, P.wash(P.pal.water, 1.6), true);
  // deck (seen from above) then the starboard side band, then the transom
  const deck: Pt[] = []; for (let i = 0; i <= N; i++) deck.push(W(i / N, 1, g(i / N)));
  for (let i = N; i >= 0; i--) deck.push(W(i / N, -1, g(i / N)));
  shape(P, deck, P.pal.wood, lw, { k: 0.55 });
  for (let i = 1; i < 10; i++) { const s = i / 10; const a = W(s, 1, g(s)), b = W(s, -1, g(s)); seg(P, a[0], a[1], b[0], b[1], 0.8, 0.45); }
  const side: Pt[] = []; for (let i = 0; i <= N; i++) side.push(W(i / N, 1, g(i / N)));
  for (let i = N; i >= 0; i--) { const s = i / N; const e = Math.abs(2 * s - 1); side.push(W(s, 1, e > 0.9 ? (e - 0.9) * 10 * g(s) * 0.7 : 0)); }
  shape(P, side, P.pal.wood, lw * 1.1, { k: 1.1 });
  for (const f of [0.38, 0.7]) { const pts: Pt[] = []; for (let i = 1; i < N; i++) { const s = i / N; pts.push(W(s, 1, g(s) * (1 - f) )); } line(P, pts, 1.0, { a: 0.75 }); }
  for (let i = 2; i < N - 1; i += 2) { const s = i / N; const a = W(s, 1, g(s)), b = W(s, 1, g(s) * 0.35); seg(P, a[0], a[1], b[0], b[1], 0.7, 0.5); }
  { const pts: Pt[] = []; for (let i = 0; i <= N; i++) pts.push(W(i / N, 1, g(i / N) + 3)); line(P, pts, 3.0); }
  const tr: Pt[] = [W(0, -1, g(0)), W(0, 1, g(0)), W(0.02, 1, g(0) * 0.55), W(0.02, -1, g(0) * 0.55)];
  shape(P, tr, P.pal.wood, lw, { k: 1.5 });
  // rudder at the stern
  const ru: Pt[] = [P.pt(Xc, g(0) * 0.8, Z0 + 4), P.pt(Xc, -hh * 0.3, Z0 - beam * 0.06), P.pt(Xc, -hh * 0.25, Z0 - beam * 0.2), P.pt(Xc, g(0) * 0.45, Z0 - beam * 0.1)];
  shape(P, ru, P.pal.wood, 1.6, { k: 1.4 });
  let roofY = g(0.5);
  const crewPts: { p: Pt; dir: number; pose: Fig['pose']; tool?: Pt }[] = [];
  if (o.cabin && o.cabin !== 'none') {
    const long = o.cabin === 'long';
    const s0 = long ? 0.2 : 0.36, s1 = long ? 0.78 : 0.68, cw = beam * (long ? 0.8 : 0.66), hc = beam * (long ? 0.2 : 0.12), arch = beam * (long ? 0.15 : 0.2), ov = beam * 0.07;
    const base = g(0.5) - 2;
    const R = cw / 2 + ov;
    const prof = (s: number, n = 10): Pt[] => { const out: Pt[] = []; for (let i = 0; i <= n; i++) { const x = -R + 2 * R * i / n; out.push(P.pt(Xc + x, base + hc + arch * (1 - (x / R) ** 2), Z(s))); } return out; };
    // starboard wall with sliding window panels
    const sw: Pt[] = [P.pt(Xc + cw / 2, base, Z(s0)), P.pt(Xc + cw / 2, base, Z(s1)), P.pt(Xc + cw / 2, base + hc, Z(s1)), P.pt(Xc + cw / 2, base + hc, Z(s0))];
    shape(P, sw, P.pal.wood, 1.6, { k: 0.5 });
    const nb = long ? 9 : 4;
    for (let i = 1; i < nb; i++) { const s = lerp(s0, s1, i / nb); const a = P.pt(Xc + cw / 2, base, Z(s)), b = P.pt(Xc + cw / 2, base + hc, Z(s)); seg(P, a[0], a[1], b[0], b[1], 1.0, 0.8); }
    if (long && P.detail > 0.6) for (let i = 0; i < nb; i++) { if (i % 3 === 1) { const sA = lerp(s0, s1, i / nb) + 0.004, sB = lerp(s0, s1, (i + 1) / nb) - 0.004; fill(P, [P.pt(Xc + cw / 2, base + hc * 0.45, Z(sA)), P.pt(Xc + cw / 2, base + hc * 0.45, Z(sB)), P.pt(Xc + cw / 2, base + hc * 0.9, Z(sB)), P.pt(Xc + cw / 2, base + hc * 0.9, Z(sA))], P.wash(P.pal.shade, 2.2)); } }
    { const a = P.pt(Xc + cw / 2, base + hc * 0.45, Z(s0)), b = P.pt(Xc + cw / 2, base + hc * 0.45, Z(s1)); seg(P, a[0], a[1], b[0], b[1], 0.9, 0.8); }
    // near end wall (faces the viewer, stern side)
    const ew: Pt[] = [P.pt(Xc - cw / 2, base, Z(s0)), P.pt(Xc + cw / 2, base, Z(s0)), ...prof(s0).reverse().filter((_, i, a) => i > 0 && i < a.length - 1).map(p => p), P.pt(Xc - cw / 2, base + hc, Z(s0))];
    shape(P, [P.pt(Xc - cw / 2, base, Z(s0)), P.pt(Xc + cw / 2, base, Z(s0)), P.pt(Xc + cw / 2, base + hc, Z(s0)), ...prof(s0).reverse(), P.pt(Xc - cw / 2, base + hc, Z(s0))], P.pal.wood, 1.6, { k: 0.4 });
    void ew;
    fill(P, [P.pt(Xc - cw * 0.18, base, Z(s0)), P.pt(Xc + cw * 0.18, base, Z(s0)), P.pt(Xc + cw * 0.18, base + hc * 0.9, Z(s0)), P.pt(Xc - cw * 0.18, base + hc * 0.9, Z(s0))], P.wash(P.pal.shade, 3));
    // the arched mat roof
    const right: Pt[] = [], left: Pt[] = [];
    for (let i = 0; i <= 12; i++) { const s = lerp(s0 - 0.01, s1 + 0.01, i / 12); right.push(P.pt(Xc + R, base + hc, Z(s))); left.push(P.pt(Xc - R, base + hc, Z(s))); }
    const roofPoly = [...prof(s0 - 0.01), ...right, ...prof(s1 + 0.01).reverse(), ...left.reverse()];
    shape(P, roofPoly, P.pal.roof, 0, { k: 0.8 });
    for (let i = 0; i <= (long ? 18 : 8); i++) line(P, prof(lerp(s0, s1, i / (long ? 18 : 8)), 8), 0.9, { a: 0.6, amp: 0.2 });
    line(P, roofPoly, 1.8, { closed: true, amp: 0.4 });
    line(P, prof(s0 - 0.01), 2.2);
    roofY = base + hc + arch;
    if (long) { const ridge: Pt[] = []; for (let i = 0; i <= 8; i++) ridge.push(P.pt(Xc, roofY, Z(lerp(s0, s1, i / 8)))); line(P, ridge, 1.0, { a: 0.6 }); }
  }
  // the A-frame mast (人字桅), hinged ahead of the cabin; mast 0 = upright, 1 = lowered toward the stern
  let apex: Pt | undefined;
  if (o.mast !== undefined && o.mast !== null) {
    const sh2 = 0.86, Yh = g(sh2), M = o.mastH ?? L * 0.58, th = clamp(o.mast, 0, 1) * 1.38;
    const ap = { X: Xc, Y: Yh + M * Math.cos(th), Z: Z(sh2) - M * Math.sin(th) };
    apex = P.pt(ap.X, ap.Y, ap.Z);
    const fl = P.pt(Xc - beam * 0.3, Yh, Z(sh2)), fr = P.pt(Xc + beam * 0.3, Yh, Z(sh2));
    // stays: to the bow and down to the stern where the crew pays out the line
    line(P, [apex, W(1, 0, g(1))], 1.0, { a: 0.85, amp: 0.2 });
    line(P, [apex, P.pt(Xc + beam * 0.2, roofY, Z(0.2))], 1.0, { a: 0.85, amp: 0.2 });
    line(P, [apex, W(0.02, 0, g(0) + 4)], 0.9, { a: 0.75, amp: 0.2 });
    brush(P, fl, [(fl[0] + apex[0]) / 2, (fl[1] + apex[1]) / 2], apex, 11, 6, P.ink(0.95), 4);
    brush(P, fr, [(fr[0] + apex[0]) / 2, (fr[1] + apex[1]) / 2], apex, 11, 6, P.ink(0.95), 4);
    const cb = (t: number): [Pt, Pt] => [[lerp(fl[0], apex![0], t), lerp(fl[1], apex![1], t)], [lerp(fr[0], apex![0], t), lerp(fr[1], apex![1], t)]];
    for (const t of [0.35, 0.7]) { const [a, b] = cb(t); seg(P, a[0], a[1], b[0], b[1], 2.0); }
  }
  // crew
  const nC = o.crew ?? 0, rs = o.robeSeed ?? 0;
  if (nC > 0) {
    const onRoof = o.cabin === 'long';
    // helmsman at the stern, the sculling oar
    crewPts.push({ p: P.pt(Xc - beam * 0.1, g(0.03) + 2, Z(0.05)), dir: 1, pose: 'pull', tool: P.pt(Xc, g(0) * 0.9, Z0 - beam * 0.1) });
    if (o.oar) crewPts.push({ p: P.pt(Xc + beam * 0.28, g(0.1), Z(0.12)), dir: 1, pose: 'push', tool: P.pt(Xc + beam * 1.1, -6, Z(0.0)) });
    // bow crew fending off the bridge with poles
    const nPush = o.push ? Math.min(o.push.length, Math.max(1, nC - 4)) : 0;
    for (let i = 0; i < nPush; i++) crewPts.push({ p: P.pt(Xc + (i - (nPush - 1) / 2) * beam * 0.28, g(0.9) - 2, Z(0.88 + 0.03 * (i % 2))), dir: 1, pose: 'push', tool: o.push![i] });
    // roof crew hauling the mast down on ropes, others shouting
    const nRoof = nC - nPush - 1;
    for (let i = 0; i < nRoof; i++) {
      const s = lerp(0.26, 0.7, (i + 0.5) / Math.max(1, nRoof));
      const p = P.pt(Xc + rr(P.r, -beam * 0.12, beam * 0.12), onRoof ? roofY - 2 : g(s), Z(s));
      const pull = apex && i % 3 !== 2;
      crewPts.push({ p, dir: pull ? 1 : -1, pose: pull ? 'pull' : (i % 2 ? 'raise' : 'point'), tool: pull ? apex : undefined });
    }
    crewPts.sort((a, b) => a.p[1] - b.p[1]);
    let k = 0;
    for (const c of crewPts) figure(P, c.p[0], c.p[1], 50, { dir: c.dir, body: 'short', pose: c.pose, hat: k % 3 === 0 ? 'li' : 'cap', tool: c.tool, robe: (rs + k++) % 8 });
  }
  if (o.tow && apex) line(P, [apex, o.tow], 1.0, { a: 0.8, amp: 0.3 });
  return { apex, roofY };
}

// ------------------------------------------------------------------ the 虹桥 (woven-timber arch bridge)
interface BridgeDef { X0: number; X1: number; Zb: number; Db: number; rise: number; T: number; ramp: number; crowd: number; boatX?: number }
function bridge(P: Painter, B: BridgeDef, part: 'all' = 'all') {
  void part;
  const Xm = (B.X0 + B.X1) / 2, hs = (B.X1 - B.X0) / 2, R = (hs * hs + B.rise * B.rise) / (2 * B.rise);
  const archY = (X: number) => Math.sqrt(Math.max(0, R * R - (X - Xm) ** 2)) - (R - B.rise);
  const XA = B.X0 - B.ramp, XB = B.X1 + B.ramp;
  const E = (X: number) => X < B.X0 ? B.T * (X - XA) / B.ramp : X > B.X1 ? B.T * (XB - X) / B.ramp : archY(X) + B.T;
  const I = (X: number) => archY(X);
  const N = 80, xs: number[] = []; for (let i = 0; i <= N; i++) xs.push(lerp(XA, XB, i / N));
  const Zn = B.Zb, Zf = B.Zb + B.Db;
  const quad = (Xa: number, Ya: number, Xb: number, Yb: number): Pt[] => [P.pt(Xa, Ya, Zn), P.pt(Xb, Yb, Zn), P.pt(Xb, Yb, Zf), P.pt(Xa, Ya, Zf)];
  const cross = (q: Pt[]) => (q[1][0] - q[0][0]) * (q[2][1] - q[1][1]) - (q[1][1] - q[0][1]) * (q[2][0] - q[1][0]);
  // 1 underside (visible on the steep haunch) with its transverse beams
  for (let i = 0; i < N; i++) {
    const a = xs[i], b = xs[i + 1]; if (a < B.X0 || b > B.X1) continue;
    const q = quad(a, I(a), b, I(b)); if (cross(q) <= 0) continue;
    shape(P, q, P.pal.wood, 0, { k: 1.6 });
    seg(P, q[0][0], q[0][1], q[3][0], q[3][1], 1.4, 0.9);
    for (const f of [0.2, 0.4, 0.6, 0.8]) { const p1 = P.pt(a, I(a), Zn + B.Db * f), p2 = P.pt(b, I(b), Zn + B.Db * f); seg(P, p1[0], p1[1], p2[0], p2[1], 1.1, 0.8); }
  }
  // 2 deck
  const deckQ: Pt[][] = [];
  for (let i = 0; i < N; i++) { const a = xs[i], b = xs[i + 1]; const q = quad(a, E(a), b, E(b)); if (cross(q) < 0) deckQ.push(q); }
  for (const q of deckQ) { fill(P, q, P.gfill()); fill(P, q, P.wash(P.pal.wood, 0.45)); }
  for (let i = 0; i < deckQ.length; i += 2) { const q = deckQ[i]; seg(P, q[0][0], q[0][1], q[3][0], q[3][1], 0.8, 0.35); }
  // 3 far railing
  const rail = (Zr: number, a: number) => {
    const top: Pt[] = [], mid: Pt[] = [];
    for (let X = XA + 8; X <= XB - 8; X += 26) {
      const p = P.pt(X, E(X), Zr), q = P.pt(X, E(X) + 30, Zr); seg(P, p[0], p[1], q[0], q[1], 1.5, a);
      P.ctx.beginPath(); P.ctx.arc(q[0], q[1] - 1, 2.0, 0, 7); P.ctx.fillStyle = P.ink(a); P.ctx.fill();
    }
    for (let i = 0; i <= N; i++) { top.push(P.pt(xs[i], E(xs[i]) + 30, Zr)); mid.push(P.pt(xs[i], E(xs[i]) + 15, Zr)); }
    line(P, top, 2.0, { a }); line(P, mid, 1.2, { a: a * 0.85 });
  };
  rail(Zf, 0.8);
  // 4 crowd, stalls and the famous meeting of a sedan chair and a rider at the crest
  const r = P.r; const items: { X: number; u: number; f: (p: Pt) => void }[] = [];
  const at = (X: number, u: number) => P.pt(X, E(X), Zn + B.Db * u);
  const nCrowd = Math.round(B.crowd);
  for (let i = 0; i < nCrowd; i++) {
    const X = lerp(XA + B.ramp * 0.3, XB - B.ramp * 0.3, Math.pow(r(), 1) ), u = rr(r, 0.12, 0.88);
    const kind = r(); const dir = r() < 0.5 ? 1 : -1, robe = ri(r, 0, 7), hat = pick(r, ['futou', 'futou', 'jin', 'cap', 'li', 'futou'] as Fig['hat'][]);
    items.push({ X, u, f: (p) => figure(P, p[0], p[1], 50, { dir, robe, hat, body: kind < 0.35 ? 'short' : 'robe', pose: kind < 0.2 ? 'carry' : 'walk', load: kind < 0.2 ? 'pole' : kind < 0.3 ? 'pack' : 'none' }) });
  }
  // stalls with parasols along both sides
  for (const [fx, u] of [[0.2, 0.86], [0.3, 0.85], [0.72, 0.86], [0.83, 0.85], [0.26, 0.14], [0.78, 0.13]] as [number, number][]) {
    const X = lerp(XA, XB, fx);
    items.push({ X, u, f: (p) => { const tb: Pt[] = [[p[0] - 22, p[1] - 22], [p[0] + 22, p[1] - 22], [p[0] + 28, p[1] - 16], [p[0] - 16, p[1] - 16]]; shape(P, tb, P.pal.wood, 1.3, { k: 0.7 }); seg(P, p[0] - 18, p[1] - 16, p[0] - 18, p[1], 1.2); seg(P, p[0] + 22, p[1] - 16, p[0] + 22, p[1], 1.2); figure(P, p[0] - 30, p[1] + 4, 46, { dir: 1, pose: 'sit', robe: 2, hat: 'jin' }); parasol(P, p[0], p[1] + 2, 58, 92); } });
  }
  items.push({ X: Xm - 70, u: 0.5, f: (p) => sedan(P, p[0], p[1], 52, -1) });
  items.push({ X: Xm + 90, u: 0.48, f: (p) => { beast(P, p[0], p[1], 50, 'horse', 1, false, 0.3); figure(P, p[0] + 2, p[1] - 44, 46, { dir: 1, pose: 'point', hat: 'futou', robe: 1, force: true }); figure(P, p[0] + 66, p[1] + 2, 48, { dir: -1, pose: 'walk', body: 'short', hat: 'cap', robe: 4 }); } });
  // shouting onlookers on the near railing above the boat
  const bx = B.boatX ?? Xm;
  for (let i = 0; i < 11; i++) {
    const X = bx + (i - 5) * 34 + rr(r, -8, 8), u = rr(r, 0.06, 0.13);
    items.push({ X, u, f: (p) => figure(P, p[0], p[1], 50, { dir: i % 3 === 0 ? -1 : 1, pose: i % 3 === 0 ? 'raise' : i % 3 === 1 ? 'lean' : 'point', hat: i % 2 ? 'futou' : 'cap', robe: i % 8, body: i % 4 === 0 ? 'short' : 'robe' }) });
  }
  items.sort((a, b) => b.u - a.u);
  for (const it of items) it.f(at(it.X, it.u));
  // 5 near fascia: the woven beams
  const fas: Pt[] = []; const inner: Pt[] = [];
  for (let i = 0; i <= N; i++) { const X = xs[i]; fas.push(P.pt(X, E(X), Zn)); inner.push(P.pt(X, X < B.X0 || X > B.X1 ? 0 : I(X), Zn)); }
  const facePoly = [...fas, ...inner.reverse()];
  shape(P, facePoly, P.pal.wood, 0, { k: 1.7 });
  // two interlocking systems of long straight beams (编木拱), drawn as polygonal chords inside the curved band
  const sysA = [0, 0.2, 0.4, 0.6, 0.8, 1], sysB = [0.1, 0.3, 0.5, 0.7, 0.9];
  const nodeP = (f: number, h: number) => { const X = lerp(B.X0, B.X1, f); return P.pt(X, I(X) + (E(X) - I(X)) * h, Zn); };
  const beamW = (B.T - 16) * 0.2;
  for (const [sys, h] of [[sysA, 0.27], [sysB, 0.62]] as [number[], number][]) {
    for (let i = 0; i < sys.length - 1; i++) {
      const a = nodeP(sys[i], h), b = nodeP(sys[i + 1], h);
      const q: Pt[] = [[a[0], a[1] - beamW], [b[0], b[1] - beamW], [b[0], b[1] + beamW], [a[0], a[1] + beamW]];
      fill(P, q, P.wash(P.pal.wood, 0.8)); seg(P, q[0][0], q[0][1], q[1][0], q[1][1], 1.3, 0.9); seg(P, q[3][0], q[3][1], q[2][0], q[2][1], 1.3, 0.9);
      for (let k = 1; k < 4; k++) { const t = k / 4; seg(P, lerp(a[0], b[0], t), lerp(a[1], b[1], t) - beamW * 0.6, lerp(a[0], b[0], t) + 3, lerp(a[1], b[1], t) + beamW * 0.6, 0.7, 0.4); }
    }
  }
  // transverse beam ends (dark squares) where the systems cross
  for (const [sys, h] of [[sysA, 0.27], [sysB, 0.62]] as [number[], number][]) for (const f of sys) {
    const p = nodeP(f, h); const s = 8.5; P.ctx.fillStyle = P.ink(0.95); P.ctx.fillRect(p[0] - s, p[1] - s, s * 2, s * 2);
    P.ctx.fillStyle = P.wash(P.pal.wood, 1.2); P.ctx.fillRect(p[0] - s * 0.45, p[1] - s * 0.45, s * 0.9, s * 0.9);
  }
  // cross braces between the beam rows
  for (let f = 0.05; f < 0.96; f += 0.1) { const p = nodeP(f, 0.12), q = nodeP(f + 0.05, 0.8), p2 = nodeP(f + 0.05, 0.12), q2 = nodeP(f, 0.8); seg(P, p[0], p[1], q[0], q[1], 0.9, 0.5); seg(P, p2[0], p2[1], q2[0], q2[1], 0.9, 0.5); }
  // deck-edge fascia board with battens
  const board: Pt[] = []; for (let i = 0; i <= N; i++) board.push(P.pt(xs[i], E(xs[i]) - 14, Zn)); line(P, board, 1.4, { a: 0.9 });
  for (let X = XA + 10; X < XB - 10; X += 18) { const a = P.pt(X, E(X), Zn), b = P.pt(X, E(X) - 14, Zn); seg(P, a[0], a[1], b[0], b[1], 0.8, 0.6); }
  line(P, fas, 3.0); line(P, inner.reverse().filter((_, i) => xs[i] >= B.X0 && xs[i] <= B.X1), 3.0);
  // stone abutments where the arch lands on the banks
  for (const Xe of [B.X0, B.X1]) {
    const s = Xe === B.X0 ? -1 : 1; const ab: Pt[] = [P.pt(Xe - 50, -6, Zn - 8), P.pt(Xe + 50, -6, Zn - 8), P.pt(Xe + 50 * (s > 0 ? 1 : 0.4), 40, Zn - 8), P.pt(Xe - 50 * (s < 0 ? 1 : 0.4), 40, Zn - 8)];
    shape(P, ab, P.pal.stone, 1.8);
    for (const y of [12, 26]) { const a = P.pt(Xe - 46, y, Zn - 8), b = P.pt(Xe + 46, y, Zn - 8); seg(P, a[0], a[1], b[0], b[1], 0.9, 0.6); }
  }
  // 6 near railing
  rail(Zn, 1);
  // 7 the tall poles (表木) at the bridge ends
  for (const [X, Zp, a] of [[XA + 20, Zf + 10, 0.6], [XB - 20, Zf + 10, 0.6], [XA + 16, Zn - 12, 1], [XB - 16, Zn - 12, 1]] as [number, number, number][]) {
    const p = P.pt(X, 0, Zp), q = P.pt(X, 400, Zp); seg(P, p[0], p[1], q[0], q[1], 3.0, a);
    const c1 = P.pt(X - 30, 360, Zp), c2 = P.pt(X + 30, 360, Zp); seg(P, c1[0], c1[1], c2[0], c2[1], 2.2, a);
    const b1 = P.pt(X, 360, Zp - 30), b2 = P.pt(X, 360, Zp + 30); seg(P, b1[0], b1[1], b2[0], b2[1], 2.2, a);
    brush(P, [q[0] - 6, q[1] + 2], [q[0], q[1] - 10], [q[0] + 10, q[1] - 4], 4, 1.5, P.ink(a));
  }
}

// @@END@@

// ------------------------------------------------------------------ pipeline + public API
function makeCanvas(w: number, h: number): HTMLCanvasElement { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
type Builder = (S: Scene, o: Required<Pick<SilkOptions, 'mode' | 'seed'>> & SilkOptions) => void;
const BUILDERS: Partial<Record<SectionName, Builder>> = {};

function prep(name: SectionName, o: SilkOptions = {}) {
  const W = Math.round(o.width ?? W0), H = Math.round(o.height ?? H0), mode = o.mode ?? 'mono', seed = o.seed ?? 43;
  const S = new Scene(seed * 31 + name.length * 977 + name.charCodeAt(0));
  const b = BUILDERS[name]; if (!b) throw new Error('silk: unknown section ' + name);
  b(S, { ...o, mode, seed });
  return { S, W, H, mode, seed };
}
function newPainter(ctx: CanvasRenderingContext2D, W: number, H: number, mode: SilkMode, o: SilkOptions) {
  const sx = W / W0, sy = H / H0;
  ctx.setTransform(sx, 0, 0, sy, 0, 0);
  return new Painter(ctx, mode, Math.min(sx, sy), (o.density ?? 1) * (mode === 'grey' ? 0.45 : 1));
}
function drawLayer(S: Scene, P: Painter, L: number) {
  const ops = S.ops.filter(op => op.layer === L);
  const ground = ops.filter(o => o.ground), over = ops.filter(o => o.overlay);
  const objs = ops.filter(o => !o.ground && !o.overlay).sort((a, b) => (b.z - a.z) || (a.x - b.x));
  for (const op of [...ground, ...objs, ...over]) {
    P.r = mulberry32(op.seed); P.figSeed = op.seed; P.figN = 0; P.setFog(op.fog ?? 0);
    P.ctx.save(); op.draw(P); P.ctx.restore();
  }
}
function finishInfo(S: Scene, name: SectionName, mode: SilkMode, W: number, H: number): SilkInfo {
  const sx = W / W0, sy = H / H0;
  const R = (r?: Rect) => r && { x: r.x * sx, y: r.y * sy, w: r.w * sx, h: r.h * sy };
  const i = S.info;
  return {
    name, mode, width: W, height: H, scale: sx,
    bridge: R(i.bridge), mastBoat: R(i.mastBoat), gate: R(i.gate), patch: R(i.patch), posts: R(i.posts),
    corners: i.corners && { lowerLeft: R(i.corners.lowerLeft)!, upperLeft: R(i.corners.upperLeft)! },
    join: i.join !== undefined ? i.join * sx : undefined,
    glyphs: i.glyphs?.map(g => ({ ...g, x: g.x * sx, y: g.y * sy, size: g.size * sy })),
    phrases: i.phrases,
    colophons: i.colophons?.map(c => ({ ...c, x0: c.x0 * sx, x1: c.x1 * sx })),
    sealSlots: i.sealSlots?.map(s => ({ ...s, x: s.x * sx, y: s.y * sy, size: s.size * sy })),
  };
}

/** Paint one section of the scroll as a single opaque canvas. `canvas.silk` holds the section's SilkInfo. */
export function paintSection(name: SectionName, o: SilkOptions = {}): HTMLCanvasElement & { silk: SilkInfo } {
  const { S, W, H, mode } = prep(name, o);
  const cv = makeCanvas(W, H); const ctx = cv.getContext('2d')!;
  const P = newPainter(ctx, W, H, mode, o);
  for (let L = 0; L < 5; L++) drawLayer(S, P, L);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const wv = o.weave ?? 1; if (wv > 0) silkWeave(cv, wv, { mode, seed: o.seed ?? 43, paperFrom: S.info.join !== undefined ? S.info.join * W / W0 : undefined });
  const out = cv as HTMLCanvasElement & { silk: SilkInfo }; out.silk = finishInfo(S, name, mode, W, H);
  return out;
}

/** The same section split into 5 transparent depth layers: 0 far (sky/haze, opaque silk), 1 far bank, 2 river + boats,
 *  3 bridge (+ the boat passing under it), 4 near roofs / trees. Composited in order they equal paintSection(). */
export function paintRelief(name: SectionName, o: SilkOptions = {}): (HTMLCanvasElement & { silk: SilkInfo })[] {
  const { S, W, H, mode } = prep(name, o);
  const info = finishInfo(S, name, mode, W, H);
  const out: (HTMLCanvasElement & { silk: SilkInfo })[] = [];
  for (let L = 0; L < 5; L++) {
    const cv = makeCanvas(W, H); const ctx = cv.getContext('2d')!;
    const P = newPainter(ctx, W, H, mode, o);
    drawLayer(S, P, L);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const wv = o.weave ?? 1; if (wv > 0) silkWeave(cv, wv, { mode, seed: o.seed ?? 43, paperFrom: S.info.join !== undefined ? S.info.join * W / W0 : undefined });
    const c2 = cv as HTMLCanvasElement & { silk: SilkInfo }; c2.silk = info; out.push(c2);
  }
  return out;
}

/** Silk weave + age (mottling, foxing, roll creases) over a canvas. Only darkens where the canvas already has paint,
 *  so it is safe on transparent relief layers. strength 0..2 (1 = default). */
export function silkWeave(canvas: HTMLCanvasElement, strength = 1, opt: { mode?: SilkMode; seed?: number; paperFrom?: number } = {}) {
  if (strength <= 0) return;
  const ctx = canvas.getContext('2d')!; const W = canvas.width, H = canvas.height, k = W / W0;
  const seed = opt.seed ?? 43, r = mulberry32(seed * 101 + 7), ink: RGB = opt.mode === 'grey' ? hex('#55524C') : hex('#2A1F17');
  const pitch = Math.max(2, Math.round(3 * k)), T = pitch * 86;
  const tile = makeCanvas(T, T), tc = tile.getContext('2d')!, id = tc.createImageData(T, T);
  const rowV: number[] = [], colV: number[] = [];
  for (let i = 0; i < T / pitch; i++) { rowV.push(r()); colV.push(r()); }
  const slub = vnoise(seed + 5);
  for (let y = 0; y < T; y++) {
    const ty = Math.floor(y / pitch), fy = (y % pitch) / pitch;
    for (let x = 0; x < T; x++) {
      const tx = Math.floor(x / pitch), fx = (x % pitch) / pitch;
      const over = (tx + ty) % 2 === 0; // plain weave: alternate which thread is on top
      const edgeY = Math.abs(fy - 0.5) * 2, edgeX = Math.abs(fx - 0.5) * 2;
      let dark = over ? edgeY * 0.6 + edgeX * 0.25 : edgeX * 0.6 + edgeY * 0.25;
      dark += (over ? rowV[ty] : colV[tx]) * 0.45 + Math.max(0, slub(x / 40, ty * 0.7) - 0.72) * 2.2;
      const i4 = (y * T + x) * 4; id.data[i4] = ink[0]; id.data[i4 + 1] = ink[1]; id.data[i4 + 2] = ink[2];
      id.data[i4 + 3] = clamp(dark * 26 * strength, 0, 255);
    }
  }
  tc.putImageData(id, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = ctx.createPattern(tile, 'repeat')!;
  if (opt.paperFrom !== undefined) { ctx.beginPath(); ctx.rect(opt.paperFrom, 0, W - opt.paperFrom, H); ctx.clip(); }
  ctx.fillRect(0, 0, W, H); ctx.restore();
  if (opt.paperFrom !== undefined) paperFibers(canvas, 0, opt.paperFrom, strength, seed);
  // age: low-frequency mottling (warm brown), a few foxing spots, vertical roll creases
  const nw = 128, nh = 48, nc = makeCanvas(nw, nh), nx = nc.getContext('2d')!, nd = nx.createImageData(nw, nh);
  const n1 = vnoise(seed + 11), n2 = vnoise(seed + 23), stain: RGB = opt.mode === 'grey' ? hex('#4A4842') : hex('#8A5A2A');
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
    const v = n1(x / 9, y / 6) * 0.65 + n2(x / 3.5, y / 2.5) * 0.35;
    const i4 = (y * nw + x) * 4; nd.data[i4] = stain[0]; nd.data[i4 + 1] = stain[1]; nd.data[i4 + 2] = stain[2];
    nd.data[i4 + 3] = clamp((v - 0.42) * 120 * strength, 0, 255);
  }
  nx.putImageData(nd, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.globalAlpha = 0.32; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(nc, 0, 0, W, H); ctx.globalAlpha = 1;
  for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * H, s = (2 + r() * 7) * k; ctx.beginPath(); ctx.ellipse(x, y, s, s * (0.6 + r() * 0.5), r() * 3, 0, 7); ctx.fillStyle = rgba(stain, 0.08 * strength); ctx.fill(); }
  for (let i = 0; i < 4; i++) {
    const x = (0.1 + 0.8 * r()) * W; ctx.beginPath(); let px = x; ctx.moveTo(px, 0);
    for (let y = 0; y <= H; y += 40 * k) { px += (r() - 0.5) * 3 * k; ctx.lineTo(px, y); }
    ctx.lineWidth = Math.max(1, 1.6 * k); ctx.strokeStyle = rgba(ink, 0.05 * strength); ctx.stroke();
  }
  ctx.restore();
}
function paperFibers(canvas: HTMLCanvasElement, x0: number, x1: number, strength: number, seed: number) {
  const ctx = canvas.getContext('2d')!; const H = canvas.height, k = canvas.width / W0, r = mulberry32(seed * 53 + 3);
  ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.beginPath(); ctx.rect(x0, 0, x1 - x0, H); ctx.clip();
  const n = Math.round((x1 - x0) * H / (900 * k * k) * strength);
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = r() * H, l = (6 + r() * 22) * k, a = r() * Math.PI;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 6 * k, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.lineWidth = Math.max(0.6, 0.9 * k); ctx.strokeStyle = r() < 0.5 ? `rgba(120,90,50,${0.07 * strength})` : `rgba(255,252,240,${0.12 * strength})`; ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ sections
type FogFn = (Z: number) => number;
const HATS: Fig['hat'][] = ['futou', 'futou', 'futou', 'jin', 'cap', 'li', 'futou', 'cap'];
function randFig(r: Rng, extra: Partial<Fig> = {}): Fig {
  const k = r();
  const f: Fig = { dir: r() < 0.5 ? 1 : -1, robe: ri(r, 0, 7), hat: pick(r, HATS), body: k < 0.4 ? 'short' : 'robe', pose: k < 0.15 ? 'carry' : k < 0.6 ? 'walk' : k < 0.8 ? 'stand' : k < 0.9 ? 'point' : 'bow' };
  if (f.pose === 'carry') f.load = 'pole'; else if (k > 0.3 && k < 0.36) f.load = 'pack'; else if (k > 0.55 && k < 0.58) f.load = 'parasol';
  return { ...f, ...extra };
}
function addFig(S: Scene, L: number, X: number, Z: number, f: Fig, fog: FogFn, H = 50) {
  S.add(L, Z, X, P => { const p = P.pt(X, 0, Z); figure(P, p[0], p[1], H, f); }, { fog: fog(Z) });
}
function addCrowd(S: Scene, L: number | ((X: number, Z: number) => number), X0: number, X1: number, Z0: number, Z1: number, n: number, fog: FogFn, H = 50, extra: Partial<Fig> = {}) {
  for (let i = 0; i < n; i++) {
    const X = rr(S.r, X0, X1), Z = rr(S.r, Z0, Z1);
    addFig(S, typeof L === 'number' ? L : L(X, Z), X, Z, randFig(S.r, extra), fog, H);
  }
}
function addHouse(S: Scene, L: number, X: number, Z: number, w: number, d: number, h: number, o: House, fog: FogFn) {
  S.add(L, Z, X, P => house(P, X, Z, w, d, h, o), { fog: fog(Z) });
}
function addTree(S: Scene, L: number, X: number, Z: number, H: number, kind: 'willow' | 'leaf' | 'bare' | 'jia', fog: FogFn) {
  S.add(L, Z, X, P => { const p = P.pt(X, 0, Z); if (kind === 'willow') willow(P, p[0], p[1], H); else if (kind === 'bare') bareTree(P, p[0], p[1], H); else leafTree(P, p[0], p[1], H, kind === 'jia' ? 'jia' : 'dot'); }, { fog: fog(Z) });
}
function addBeast(S: Scene, L: number, X: number, Z: number, H: number, kind: 'donkey' | 'horse' | 'ox' | 'camel', d: number, load: boolean, fog: FogFn, rider?: Fig) {
  S.add(L, Z, X, P => { const p = P.pt(X, 0, Z); beast(P, p[0], p[1], H, kind, d, load); if (rider) figure(P, p[0] + 2 * d, p[1] - H * (kind === 'camel' ? 1.05 : 0.86), H * 0.95, { ...rider, force: true }); }, { fog: fog(Z) });
}
// a row of street houses along X at depth Z
function houseRow(S: Scene, L: number | ((X: number, Z: number) => number), X0: number, X1: number, Z: number, fog: FogFn, opts: { d?: [number, number]; h?: [number, number]; roof?: House['roof'][]; straw?: number; awn?: number; gableZ?: number; two?: number } = {}) {
  const r = S.r; let X = X0;
  while (X < X1) {
    const w = rr(r, 170, 330), d = rr(r, ...(opts.d ?? [140, 200])), h = rr(r, ...(opts.h ?? [82, 108]));
    const straw = r() < (opts.straw ?? 0), gable = !straw && r() < (opts.gableZ ?? 0.25), two = !straw && !gable && r() < (opts.two ?? 0.08);
    const o: House = { roof: straw ? 'straw' : pick(r, opts.roof ?? ['gable', 'gable', 'xieshan', 'gable']), ridge: gable ? 'z' : 'x', front: pick(r, ['shop', 'lattice', 'doors', 'open', 'shop'] as House['front'][]), awning: !gable && !straw && r() < (opts.awn ?? 0.3), storeys: two ? 2 : 1 };
    const Zj = Z + rr(r, -20, 20);
    addHouse(S, typeof L === 'number' ? L : L(X, Zj), X, Zj, gable ? w * 0.7 : w, gable ? d * 1.3 : d, two ? h * 1.5 : h, o, fog);
    X += (gable ? w * 0.7 : w) + rr(r, 24, 90);
  }
}
function hazeOverlay(S: Scene, L: number, y0: number, y1: number, a = 0.9) {
  S.overlay(L, P => {
    const g = P.ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgba(P.pal.ground, a)); g.addColorStop(1, rgba(P.pal.ground, 0));
    P.ctx.fillStyle = g; P.ctx.fillRect(0, y0, W0, y1 - y0);
  });
}
function groundFill(S: Scene) { S.ground(0, P => { P.ctx.fillStyle = P.gfill(); P.ctx.fillRect(0, 0, W0, H0); }); }
// sparse ground marks (grass tufts, moss dots, earth strokes) in a screen-space region, avoiding a polygon
function groundMarks(S: Scene, L: number, n: number, inside: (x: number, y: number) => boolean, y0 = 0) {
  S.ground(L, P => {
    for (let i = 0; i < n; i++) {
      const x = rr(P.r, 0, W0), y = rr(P.r, y0, H0); if (!inside(x, y)) continue;
      const k = P.r(); const s = 10 + y / H0 * 10;
      if (k < 0.45) tuft(P, x, y, s, 0.55); else if (k < 0.75) dots(P, x, y, ri(P.r, 2, 5), s * 0.8);
      else line(P, [[x, y], [x + s * 2.2, y - s * 0.3], [x + s * 4, y - s * 0.1]], 1.0, { a: 0.4 });
    }
  });
}

// ---------------- 'river': the 汴河, the boat lowering its mast, the 虹桥 crowded with people
BUILDERS.river = (S, o) => {
  const proj: Proj = { ox: 0, oy: 1700, A: 0.6, B: 0.5 };
  const Xl = 600, Xr = 1700, Zb = 1480, Db = 300;
  const fog: FogFn = Z => clamp((Z - 1900) / 1900, 0, 0.62);
  const bank = (X: number) => X < Xl ? -1 : X > Xr ? 1 : 0;
  const wrap = (fn: (P: Painter) => void) => (P: Painter) => { P.proj = proj; fn(P); };
  const add0 = S.add.bind(S);
  S.add = (L, z, x, draw, extra = {}) => add0(L, z, x, wrap(draw), extra);
  const ground0 = S.ground.bind(S); S.ground = (L, draw, extra = {}) => ground0(L, wrap(draw), extra);
  groundFill(S);
  // L0: distant trees and mist at the top
  S.ground(0, P => { P.setFog(0.75); farTrees(P, -50, 2300, 210, 120); farTrees(P, 3550, 4150, 150, 110); P.setFog(0); });
  // L1/L4: ground marks on both banks
  const scr = (x: number, y: number) => { const Z = (proj.oy - y) / proj.B; return x - proj.A * Z; };
  groundMarks(S, 1, 260, (x, y) => { const X = scr(x, y); return y < 880 && (X < Xl - 40 || X > Xr + 40); }, 180);
  groundMarks(S, 4, 260, (x, y) => { const X = scr(x, y); return y >= 880 && (X < Xl - 40 || X > Xr + 40); });
  // L2: the river itself
  S.ground(2, P => {
    const poly: Pt[] = [P.pt(Xl, 0, -200), P.pt(Xr, 0, -200), P.pt(Xr, 0, 3600), P.pt(Xl, 0, 3600)];
    fill(P, poly, P.gfill()); fill(P, poly, P.wash(P.pal.water, 1));
    const g = P.ctx.createLinearGradient(0, 0, 0, 500); g.addColorStop(0, rgba(P.pal.ground, 0.85)); g.addColorStop(1, rgba(P.pal.ground, 0));
    P.ctx.fillStyle = g; P.ctx.beginPath(); tracePath(P.ctx, poly, true, false); P.ctx.fill();
    ripples(P, poly, [proj.A, -proj.B], 1);
    for (const [Xe, s] of [[Xl, -1], [Xr, 1]] as [number, number][]) {
      const top: Pt[] = [], low: Pt[] = [];
      for (let Z = -200; Z <= 3600; Z += 60) { top.push(P.pt(Xe + s * 26, 0, Z)); low.push(P.pt(Xe, -10, Z)); }
      line(P, top, 2.4); line(P, low, 1.4, { a: 0.7 });
      for (let Z = -200; Z <= 3600; Z += 46) { const a = P.pt(Xe + s * 26, 0, Z), b = P.pt(Xe, -10, Z); seg(P, a[0], a[1], b[0], b[1], 1.2, 0.7); }
    }
  });
  // the boats
  const mast = o.mast ?? 0.55;
  const B: BridgeDef = { X0: Xl - 110, X1: Xr + 110, Zb, Db, rise: 370, T: 80, ramp: 250, crowd: 104, boatX: 1190 };
  const bridgeFace = (X: number) => { const Xm = (B.X0 + B.X1) / 2, hs = (B.X1 - B.X0) / 2, R = (hs * hs + B.rise * B.rise) / (2 * B.rise); return Math.sqrt(R * R - (X - Xm) ** 2) - (R - B.rise); };
  S.add(3, Zb - 1080, 1180, P => {
    const tg: Pt[] = [P.pt(1090, bridgeFace(1090) + 10, Zb), P.pt(1270, bridgeFace(1270) + 10, Zb), P.pt(1190, bridgeFace(1190) + 12, Zb)];
    boat(P, 1185, Zb - 1080, 1050, 250, { cabin: 'long', mast, mastH: 600, crew: 8, push: tg, oar: true, robeSeed: 3 });
  });
  S.add(2, 1900, 1560, P => { boat(P, 1540, 1900, 720, 190, { cabin: 'long', mast: 0, mastH: 460, crew: 3, robeSeed: 1 }); }, { fog: fog(2100) });
  let towApex: Pt = [0, 0];
  S.add(2, 2520, 900, P => { const b = boat(P, 980, 2520, 560, 160, { cabin: 'long', mast: 0.03, mastH: 440, crew: 2, tow: P.pt(470, 60, 3150) }); towApex = b.apex ?? towApex; }, { fog: fog(2700) });
  S.add(2, 3050, 1500, P => { boat(P, 1450, 3050, 420, 120, { cabin: 'small', crew: 1 }); }, { fog: fog(3100) });
  S.add(3, 230, 780, P => { boat(P, 800, 230, 420, 120, { cabin: 'small', crew: 2, oar: true, robeSeed: 5 }); });
  S.add(3, 150, 1540, P => { boat(P, 1540, 150, 640, 180, { cabin: 'long', mast: null, crew: 2, robeSeed: 2 }); });
  // trackers hauling the upstream boat
  for (let i = 0; i < 5; i++) { const X = 470 - i * 44, Z = 3150 + i * 30; addFig(S, 1, X, Z, { dir: 1, body: 'short', pose: 'pull', hat: i % 2 ? 'li' : 'cap', robe: i, lean: 1, force: true }, fog, 46); }
  void towApex;
  // the bridge
  S.add(3, Zb, 1150, P => bridge(P, B));
  // left bank (far = L1 above the bridge line, near = L4)
  const LL = (X: number, Z: number) => (Z > Zb - 60 ? 1 : 4);
  houseRow(S, LL, -320, 330, 330, fog, { awn: 0.4, gableZ: 0.3 });
  houseRow(S, LL, -620, 160, 820, fog, { awn: 0.3 });
  houseRow(S, LL, -1050, 60, 1900, fog, { two: 0.15 });
  houseRow(S, LL, -900, -180, 1370, fog, { awn: 0.5 });
  addCrowd(S, 1, -700, 240, 1560, 1760, 18, fog);
  addBeast(S, 1, 190, 1640, 66, 'ox', 1, false, fog); addBeast(S, 1, 120, 1660, 66, 'ox', 1, false, fog);
  S.add(1, 1650, -40, P => { const p = P.pt(-30, 0, 1650); wheel(P, p[0] + 10, p[1] - 30, 30, 1.6); shape(P, [[p[0] - 30, p[1] - 92], [p[0] + 90, p[1] - 92], [p[0] + 90, p[1] - 40], [p[0] - 30, p[1] - 40]], P.pal.wood, 1.8); shape(P, ellipsePts(p[0] + 30, p[1] - 92, 62, 24, Math.PI, Math.PI * 2, 14), P.pal.straw, 1.8); wheel(P, p[0] + 60, p[1] - 30, 30, 1.6); }, { fog: fog(1650) });
  houseRow(S, LL, -1300, 120, 2350, fog, {});
  houseRow(S, LL, -1700, 0, 2800, fog, { h: [70, 95] });
  addHouse(S, 4, 140, 1160, 300, 170, 96, { roof: 'xieshan', front: 'open', awning: true, flag: true }, fog);
  for (const [Z, H, k] of [[260, 330, 'willow'], [620, 360, 'willow'], [1080, 300, 'leaf'], [1980, 360, 'willow'], [2450, 330, 'willow'], [2900, 300, 'bare'], [3250, 300, 'willow']] as [number, number, string][]) addTree(S, LL(0, Z), 548, Z, H, k as 'willow', fog);
  addTree(S, 4, -150, 560, 380, 'leaf', fog); addTree(S, 1, -700, 2100, 340, 'bare', fog); addTree(S, 1, -300, 2580, 300, 'leaf', fog);
  // onlookers at the left foot of the bridge, stalls, the bank road
  for (let i = 0; i < 16; i++) { const X = rr(S.r, 380, 560), Z = rr(S.r, 1220, 1480); addFig(S, 3, X, Z, randFig(S.r, { dir: 1, pose: pick(S.r, ['point', 'raise', 'stand', 'lean'] as Fig['pose'][]) }), fog); }
  S.add(3, 1420, 330, P => { const p = P.pt(330, 0, 1420); parasol(P, p[0], p[1], 64, 104); const q = P.pt(250, 0, 1330); parasol(P, q[0], q[1], 58, 98); });
  addCrowd(S, LL, 300, 560, 200, 1200, 22, fog);
  addCrowd(S, LL, 250, 560, 1800, 3000, 18, fog, 46);
  addBeast(S, 4, 470, 900, 64, 'donkey', -1, true, fog); addBeast(S, 4, 410, 960, 64, 'donkey', -1, true, fog);
  addFig(S, 4, 520, 860, { dir: -1, body: 'short', pose: 'walk', hat: 'li', robe: 2 }, fog);
  // right bank (near, below the bridge = L4; far = L1, kept clear of the river edge)
  const RL = (X: number, Z: number) => (Z < Zb + Db + 40 ? 4 : 1);
  addHouse(S, 4, 1990, 1240, 330, 190, 104, { roof: 'xieshan', front: 'shop', huanmen: true, flag: true, storeys: 2 }, fog);
  houseRow(S, RL, 2400, 3300, 1260, fog, { two: 0.2 });
  houseRow(S, RL, 1980, 3300, 760, fog, { awn: 0.5, gableZ: 0.2 });
  houseRow(S, RL, 1990, 3600, 300, fog, { awn: 0.4 });
  houseRow(S, RL, 2000, 2800, 1950, fog, { two: 0.2 });
  houseRow(S, RL, 2000, 2500, 2450, fog, { h: [70, 95] });
  for (const [Z, H, k] of [[150, 340, 'willow'], [520, 330, 'leaf'], [980, 360, 'willow'], [2600, 330, 'willow'], [3000, 300, 'willow']] as [number, number, string][]) addTree(S, Z < Zb ? 4 : 2, 1760, Z, H, k as 'willow', fog);
  addTree(S, 4, 2880, 560, 400, 'leaf', fog); addTree(S, 4, 3250, 1150, 360, 'willow', fog);
  addCrowd(S, RL, 1740, 1940, 100, 1460, 26, fog);
  addCrowd(S, 1, 1760, 1940, 1800, 2400, 8, fog, 46);
  for (let i = 0; i < 10; i++) { const X = rr(S.r, 1730, 1830), Z = rr(S.r, 1230, 1460); addFig(S, 3, X, Z, randFig(S.r, { dir: -1, pose: pick(S.r, ['point', 'raise', 'stand'] as Fig['pose'][]) }), fog); }
  addCrowd(S, 4, 2100, 3400, 120, 260, 14, fog);
  S.add(4, 600, 1880, P => { const p = P.pt(1880, 0, 600); sedan(P, p[0], p[1], 50, -1, true); });
  addBeast(S, 4, 1860, 1000, 70, 'horse', -1, false, fog, { dir: -1, hat: 'futou', robe: 1 });
  hazeOverlay(S, 1, 0, 330, 0.95);
  hazeOverlay(S, 2, 0, 260, 0.6);
  // info
  const pP = (X: number, Y: number, Z: number): Pt => [proj.ox + X + proj.A * Z, proj.oy - Y - proj.B * Z];
  const b0 = pP(B.X0 - B.ramp, 0, Zb), b1 = pP(B.X1 + B.ramp, 0, Zb + Db), bt = pP((B.X0 + B.X1) / 2, B.rise + B.T + 80, Zb + Db);
  S.info.bridge = { x: b0[0], y: bt[1], w: b1[0] - b0[0], h: b0[1] - bt[1] };
  const m0 = pP(1060, 0, Zb - 1080), m1 = pP(1310, 0, Zb - 30);
  S.info.mastBoat = { x: m0[0], y: m1[1] - 720, w: m1[0] - m0[0], h: m0[1] - m1[1] + 720 };
};

function useProj(S: Scene, proj: Proj) {
  const wrap = (fn: (P: Painter) => void) => (P: Painter) => { P.proj = proj; fn(P); };
  const add0 = S.add.bind(S); S.add = (L, z, x, draw, extra = {}) => add0(L, z, x, wrap(draw), extra);
  const g0 = S.ground.bind(S); S.ground = (L, draw, extra = {}) => g0(L, wrap(draw), extra);
  const o0 = S.overlay.bind(S); S.overlay = (L, draw) => o0(L, wrap(draw));
  return (X: number, Y: number, Z: number): Pt => [proj.ox + X + proj.A * Z, proj.oy - Y - proj.B * Z];
}
const screenX = (proj: Proj, x: number, y: number) => x - proj.A * (proj.oy - y) / proj.B;

// city gate platform (城台) with a trapezoidal timber-framed passage, seen from outside
function gatePlatform(P: Painter, X: number, Z: number, w: number, d: number, h: number, pX: number, pw: number, ph: number) {
  const batter = 18;
  const R: Pt[] = [P.pt(X + w, 0, Z), P.pt(X + w, 0, Z + d), P.pt(X + w - batter, h, Z + d), P.pt(X + w - batter, h, Z)];
  shape(P, R, P.pal.stone, 2.2, { k: 1.3 });
  const top: Pt[] = [P.pt(X + batter, h, Z), P.pt(X + w - batter, h, Z), P.pt(X + w - batter, h, Z + d), P.pt(X + batter, h, Z + d)];
  shape(P, top, P.pal.earth, 1.6, { k: 2 });
  const F: Pt[] = [P.pt(X, 0, Z), P.pt(X + w, 0, Z), P.pt(X + w - batter, h, Z), P.pt(X + batter, h, Z)];
  shape(P, F, P.pal.stone, 0, { k: 0.8 });
  // brick courses
  P.ctx.save(); P.ctx.beginPath(); tracePath(P.ctx, F, true, false); P.ctx.clip();
  for (let y = 12; y < h; y += 13) { const a = P.pt(X, y, Z), b = P.pt(X + w, y, Z); seg(P, a[0], a[1], b[0], b[1], 0.7, 0.35); }
  for (let y = 0; y < h; y += 13) for (let x = ((y / 13) % 2) * 14; x < w; x += 28) { if (P.r() < 0.5 * P.detail) { const a = P.pt(X + x, y, Z), b = P.pt(X + x, y + 13, Z); seg(P, a[0], a[1], b[0], b[1], 0.6, 0.3); } }
  P.ctx.restore();
  line(P, F, 2.6, { closed: true });
  // the passage: dark, its left inner wall with 排叉柱 posts, light at the far end
  const k = pw * 0.18;
  const op: Pt[] = [P.pt(pX - pw / 2, 0, Z), P.pt(pX + pw / 2, 0, Z), P.pt(pX + pw / 2, ph - k, Z), P.pt(pX + pw / 2 - k, ph, Z), P.pt(pX - pw / 2 + k, ph, Z), P.pt(pX - pw / 2, ph - k, Z)];
  P.ctx.save(); P.ctx.beginPath(); tracePath(P.ctx, op, true, false); P.ctx.clip();
  fill(P, op, P.wash(P.pal.shade, 4.5));
  const far: Pt[] = op.map((_, i) => { const q = [[pX - pw / 2, 0], [pX + pw / 2, 0], [pX + pw / 2, ph - k], [pX + pw / 2 - k, ph], [pX - pw / 2 + k, ph], [pX - pw / 2, ph - k]][i]; return P.pt(q[0], q[1], Z + d); });
  fill(P, far, P.gfill()); fill(P, far, P.wash(P.pal.earth, 2));
  const lw2: Pt[] = [P.pt(pX - pw / 2, 0, Z), P.pt(pX - pw / 2, 0, Z + d), P.pt(pX - pw / 2, ph - k, Z + d), P.pt(pX - pw / 2 + k, ph, Z + d), P.pt(pX - pw / 2 + k, ph, Z), P.pt(pX - pw / 2, ph - k, Z)];
  fill(P, lw2, P.wash(P.pal.shade, 2.6));
  for (let z = 14; z < d; z += 22) { const a = P.pt(pX - pw / 2, 0, Z + z), b = P.pt(pX - pw / 2, ph - k, Z + z); seg(P, a[0], a[1], b[0], b[1], 1.3, 0.85); }
  P.ctx.restore();
  line(P, op, 2.6, { closed: true });
  for (const s of [-1, 1]) { const a = P.pt(pX + s * (pw / 2 + 8), 0, Z - 2), b = P.pt(pX + s * (pw / 2 + 8), ph - k, Z - 2); seg(P, a[0], a[1], b[0], b[1], 1.6, 0.9); }
  // parapet railing on the top edge
  for (let x = batter + 6; x < w - batter; x += 24) { const a = P.pt(X + x, h, Z + 6), b = P.pt(X + x, h + 22, Z + 6); seg(P, a[0], a[1], b[0], b[1], 1.2, 0.9); }
  line(P, [P.pt(X + batter, h + 22, Z + 6), P.pt(X + w - batter, h + 22, Z + 6), P.pt(X + w - batter, h + 22, Z + d - 6)], 1.8);
}
// earth rampart (no brick wall: the painting shows the city wall only as a low mound by the gate)
function mound(P: Painter, X0: number, X1: number, Z: number, d: number, h: number) {
  const pts: Pt[] = [P.pt(X0 - 60, 0, Z), P.pt(X0, h, Z + d * 0.3), P.pt(X1, h, Z + d * 0.3), P.pt(X1, h * 0.9, Z + d), P.pt(X1 + 40, 0, Z + d)];
  const front: Pt[] = [P.pt(X0 - 60, 0, Z), P.pt(X1 + 50, 0, Z), P.pt(X1, h, Z + d * 0.3), P.pt(X0, h, Z + d * 0.3)];
  shape(P, [...front], P.pal.earth, 0, { k: 2.4 });
  void pts;
  const topL: Pt[] = []; for (let x = X0; x <= X1; x += 40) topL.push(P.pt(x, h + rr(P.r, -4, 4), Z + d * 0.3));
  line(P, topL, 2.0, { amp: 1.2 });
  for (let i = 0; i < (X1 - X0) / 30; i++) { const x = rr(P.r, X0, X1), t = rr(P.r, 0.1, 0.9); const p = P.pt(x, h * (1 - t), Z + d * 0.3 * (1 - t)); line(P, [p, [p[0] - 10, p[1] + 14], [p[0] - 6, p[1] + 26]], 1.0, { a: 0.5 }); if (P.r() < 0.4) tuft(P, p[0], p[1], 12, 0.6); }
}

// ---------------- 'gate': the city gate tower, camels coming out, the street of shops
BUILDERS.gate = (S, o) => {
  void o;
  const proj: Proj = { ox: 0, oy: 1680, A: 0.6, B: 0.5 }; const pP = useProj(S, proj);
  const fog: FogFn = Z => clamp((Z - 1600) / 1800, 0, 0.62);
  const GX = 900, GZ = 1250, GW = 720, GD = 250, GH = 250, PX = 1250;
  groundFill(S);
  S.ground(0, P => { P.setFog(0.75); farTrees(P, 0, 1300, 200, 120); farTrees(P, 3000, 4150, 180, 110); P.setFog(0); });
  const layerOf = (X: number, Z: number) => (Z > GZ + GD + 40 ? 1 : Z >= GZ - 20 ? 2 : Z > 640 ? 3 : 4); void layerOf;
  groundMarks(S, 1, 200, (x, y) => y < 760, 200);
  groundMarks(S, 3, 200, (x, y) => y >= 760 && y < 1150, 760);
  groundMarks(S, 4, 160, (x, y) => y >= 1150, 1150);
  // the road through the gate: wheel ruts
  S.ground(3, P => { for (const dx of [-30, 30]) line(P, [P.pt(PX + dx, 0, 80), P.pt(PX + dx, 0, GZ)], 1.0, { a: 0.45, amp: 1.2 }); });
  // inside the city (far): rows of roofs behind the gate, fogged
  houseRow(S, 1, 400, 2600, 1640, fog, { two: 0.2 });
  houseRow(S, 1, -100, 2200, 2050, fog, { h: [70, 95] });
  houseRow(S, 1, -500, 1900, 2450, fog, { h: [60, 90] });
  houseRow(S, 1, -900, 1500, 2850, fog, { h: [60, 80] });
  addTree(S, 1, 1500, 1800, 330, 'leaf', fog); addTree(S, 1, 300, 2200, 300, 'bare', fog); addTree(S, 1, 2300, 1700, 300, 'willow', fog);
  // the gate and the ramparts
  S.add(2, GZ, GX, P => gatePlatform(P, GX, GZ, GW, GD, GH, PX, 120, 170));
  S.add(2, GZ - 1, GX + 60, P => house(P, GX + 100, GZ + 50, GW - 200, GD - 110, 104, { roof: 'hip', front: 'lattice', rh: 130, lift: GH }));
  S.add(2, GZ + 60, GX - 600, P => mound(P, GX - 700, GX - 20, GZ + 60, 160, 120));
  S.add(2, GZ + 60, GX + GW + 40, P => mound(P, GX + GW + 40, GX + GW + 900, GZ + 60, 160, 120));
  for (const [X, H, k] of [[GX - 560, 330, 'willow'], [GX - 300, 300, 'bare'], [GX + GW + 200, 340, 'willow'], [GX + GW + 560, 300, 'leaf']] as [number, number, string][]) addTree(S, 2, X, GZ + 120, H, k as 'willow', Z => fog(Z) * 0.5);
  // camels coming out of the gate, a drover in front
  addBeast(S, 3, PX + 30, GZ - 40, 92, 'camel', -1, true, fog);
  addBeast(S, 3, PX + 70, GZ - 230, 92, 'camel', -1, true, fog);
  addBeast(S, 3, PX + 110, GZ - 420, 92, 'camel', -1, true, fog);
  addFig(S, 3, PX - 60, GZ - 520, { dir: -1, pose: 'walk', body: 'short', hat: 'li', robe: 4, force: true }, fog, 54);
  // outside the gate: the far row of shops facing the street (both sides of the road)
  houseRow(S, 3, -700, PX - 240, 720, fog, { awn: 0.5, gableZ: 0.25 });
  addHouse(S, 3, PX + 240, 700, 380, 200, 112, { roof: 'xieshan', storeys: 2, huanmen: true, flag: true }, fog);
  houseRow(S, 3, PX + 700, 3600, 740, fog, { awn: 0.5, gableZ: 0.2, two: 0.2 });
  addHouse(S, 3, PX + 180, 1000, 220, 140, 90, { roof: 'gable', front: 'open', awning: true, sign: true }, fog);
  addHouse(S, 3, PX - 420, 1010, 240, 140, 92, { roof: 'gable', front: 'shop', awning: true }, fog);
  for (const [X, Z, H, k] of [[PX - 700, 980, 360, 'willow'], [PX + 600, 1060, 340, 'leaf'], [2600, 1100, 360, 'willow'], [3100, 1050, 330, 'bare']] as [number, number, number, string][]) addTree(S, 3, X, Z, H, k as 'willow', fog);
  // the street: crowds, a sedan, a rider, a wheelbarrow, a storyteller ring
  addCrowd(S, 3, -500, 3400, 420, 690, 70, fog);
  addCrowd(S, 3, PX - 260, PX + 220, 700, 1200, 16, fog);
  addCrowd(S, 4, -300, 3600, 120, 400, 34, fog);
  S.add(3, 520, 2050, P => { const p = P.pt(2050, 0, 520); sedan(P, p[0], p[1], 54, -1); }, { fog: fog(520) });
  addBeast(S, 3, 2600, 470, 70, 'horse', 1, false, fog, { dir: 1, hat: 'futou', robe: 1, pose: 'stand' });
  addBeast(S, 3, 600, 560, 64, 'donkey', 1, true, fog); addBeast(S, 3, 520, 600, 64, 'donkey', 1, true, fog);
  S.add(3, 430, 1700, P => { const p = P.pt(1700, 0, 430); wheel(P, p[0], p[1] - 22, 22, 1.4); shape(P, [[p[0] - 40, p[1] - 50], [p[0] + 30, p[1] - 50], [p[0] + 20, p[1] - 26], [p[0] - 40, p[1] - 26]], P.pal.straw, 1.6); figure(P, p[0] - 62, p[1], 52, { dir: 1, body: 'short', pose: 'push', hat: 'cap', robe: 3, force: true, tool: [p[0] - 40, p[1] - 36] }); }, { fog: fog(430) });
  S.add(3, 560, 3000, P => { const c = P.pt(3000, 0, 560); figure(P, c[0], c[1], 54, { dir: -1, pose: 'raise', hat: 'jin', robe: 1, force: true }); for (let i = 0; i < 9; i++) { const a = Math.PI * 2 * i / 9; const q = P.pt(3000 + Math.cos(a) * 110, 0, 560 + Math.sin(a) * 90); figure(P, q[0], q[1], 50, { dir: Math.cos(a) > 0 ? -1 : 1, pose: 'stand', robe: i, hat: pick(P.r, HATS) }); } }, { fog: fog(560) });
  // near row (bottom edge), roofs only partly in frame
  houseRow(S, 4, -400, 3700, 40, fog, { awn: 0.6, gableZ: 0.15 });
  addTree(S, 4, 2200, 260, 420, 'leaf', fog); addTree(S, 4, 600, 300, 400, 'willow', fog);
  hazeOverlay(S, 1, 0, 320, 0.95);
  const g0 = pP(GX, 0, GZ), g1 = pP(GX + GW, GH + 104 + 160, GZ + GD);
  S.info.gate = { x: g0[0], y: g1[1], w: g1[0] - g0[0] + 40, h: g0[1] - g1[1] };
};

// ---------------- 'end': the painting's last stretch of street, then bare silk (no signature)
BUILDERS.end = (S, o) => {
  void o;
  const proj: Proj = { ox: 0, oy: 1680, A: 0.6, B: 0.5 }; useProj(S, proj);
  const fog: FogFn = Z => clamp((Z - 1500) / 1700, 0, 0.62);
  groundFill(S);
  S.ground(0, P => { P.setFog(0.78); farTrees(P, 1900, 4150, 210, 110); P.setFog(0); });
  // marks thin out toward the bare end (left)
  groundMarks(S, 1, 260, (x, y) => x > 1500 + (1 - y / H0) * 300 && P_rand(x, y) < (x - 1400) / 1400, 200);
  groundMarks(S, 4, 160, (x, y) => x > 1600 && y > 1000, 1000);
  const minX = (Z: number) => 1550 - 0.6 * Z; // keep the city right of screen x≈1550
  houseRow(S, 1, minX(1900) + 300, 3600, 1900, fog, { h: [70, 95] });
  houseRow(S, 1, minX(1420) + 120, 3500, 1420, fog, { two: 0.25 });
  houseRow(S, 3, minX(900) + 60, 3400, 900, fog, { awn: 0.5, gableZ: 0.2, two: 0.15 });
  addHouse(S, 3, 2300, 880, 420, 210, 118, { roof: 'xieshan', front: 'doors', storeys: 2, sign: true }, fog);
  houseRow(S, 4, minX(250) + 200, 3700, 250, fog, { awn: 0.5, gableZ: 0.2 });
  addTree(S, 3, minX(760) + 40, 760, 380, 'willow', fog);
  addTree(S, 1, minX(1300) + 40, 1300, 330, 'bare', fog);
  addTree(S, 4, 2900, 380, 420, 'leaf', fog); addTree(S, 3, 3300, 820, 360, 'willow', fog);
  // the street, emptier toward its end
  for (let i = 0; i < 46; i++) { const t = Math.pow(S.r(), 0.7); const X = lerp(minX(700) + 80, 3500, t); const Z = rr(S.r, 470, 860); addFig(S, Z > 640 ? 3 : 4, X, Z, randFig(S.r), fog); }
  addBeast(S, 3, minX(640) + 140, 640, 66, 'donkey', -1, true, fog);
  addFig(S, 3, minX(640) + 70, 650, { dir: -1, body: 'short', pose: 'walk', hat: 'li', robe: 2, force: true }, fog);
  addBeast(S, 3, 1900, 720, 72, 'horse', 1, false, fog, { dir: 1, hat: 'futou', robe: 3 });
  S.add(3, 600, 2400, P => { const p = P.pt(2400, 0, 600); sedan(P, p[0], p[1], 52, -1); }, { fog: fog(600) });
  hazeOverlay(S, 1, 0, 300, 0.95);
  // fade the city into bare silk toward the left (an overlay over the far layers, before the near layer)
  S.overlay(3, P => { const g = P.ctx.createLinearGradient(1250, 0, 1750, 0); g.addColorStop(0, rgba(P.pal.ground, 1)); g.addColorStop(1, rgba(P.pal.ground, 0)); P.ctx.fillStyle = g; P.ctx.fillRect(0, 0, 1750, H0); });
  S.info.corners = { lowerLeft: { x: 0, y: 1000, w: 900, h: 536 }, upperLeft: { x: 0, y: 0, w: 900, h: 536 } };
};
function P_rand(x: number, y: number) { return hash2(Math.round(x), Math.round(y)); }

// ---------------- 'shed': the outskirts, the straw shed whose broken roof poles were read as donkey ears
BUILDERS.shed = (S, o) => {
  const patch = o.patch ?? 'bare';
  const proj: Proj = { ox: 0, oy: 1680, A: 0.6, B: 0.5 }; const pP = useProj(S, proj);
  const fog: FogFn = Z => clamp((Z - 1500) / 1700, 0, 0.65);
  groundFill(S);
  S.ground(0, P => { P.setFog(0.75); farTrees(P, -40, 4150, 230, 130); P.setFog(0.55); farTrees(P, 200, 3900, 330, 150); P.setFog(0); });
  groundMarks(S, 1, 240, (x, y) => y < 900, 300);
  groundMarks(S, 4, 240, (x, y) => y >= 900, 900);
  // fields (furrows) in the distance, the dirt road, the stream with a plank bridge
  S.ground(1, P => {
    for (let k = 0; k < 3; k++) { const X0 = -600 + k * 900, Z0 = 1700 + k * 180; P.setFog(fog(Z0)); for (let i = 0; i < 9; i++) line(P, [P.pt(X0, 0, Z0 + i * 26), P.pt(X0 + 640, 0, Z0 + i * 26)], 1.0, { a: 0.45, amp: 1.2 }); }
    P.setFog(0);
  });
  S.ground(3, P => { for (const dz of [0, 150]) line(P, [P.pt(-800, 0, 700 + dz), P.pt(4000, 0, 700 + dz)], 1.6, { a: 0.6, amp: 2 }); for (const dz of [50, 100]) line(P, [P.pt(-800, 0, 700 + dz), P.pt(4000, 0, 700 + dz)], 0.9, { a: 0.35, amp: 2 }); });
  const SX0 = 2380, SX1 = 2500;
  S.ground(2, P => {
    const poly: Pt[] = [P.pt(SX0, 0, -100), P.pt(SX1, 0, -100), P.pt(SX1 - 140, 0, 2800), P.pt(SX0 - 160, 0, 2800)];
    fill(P, poly, P.gfill()); fill(P, poly, P.wash(P.pal.water, 1.2)); ripples(P, poly, [proj.A, -proj.B], 0.6);
    line(P, [poly[0], poly[3]], 1.8, { amp: 1.5 }); line(P, [poly[1], poly[2]], 1.8, { amp: 1.5 });
  });
  S.add(2, 690, SX0, P => { const q: Pt[] = [P.pt(SX0 - 30, 14, 700), P.pt(SX1 + 30, 14, 700), P.pt(SX1 + 30, 14, 850), P.pt(SX0 - 30, 14, 850)]; shape(P, q, P.pal.wood, 2, { k: 0.8 }); for (let z = 712; z < 850; z += 14) { const a = P.pt(SX0 - 30, 14, z), b = P.pt(SX1 + 30, 14, z); seg(P, a[0], a[1], b[0], b[1], 0.8, 0.6); } const f: Pt[] = [P.pt(SX0 - 30, 14, 700), P.pt(SX1 + 30, 14, 700), P.pt(SX1 + 30, 0, 700), P.pt(SX0 - 30, 0, 700)]; shape(P, f, P.pal.wood, 1.6, { k: 1.4 }); for (const x of [SX0, SX1]) { const a = P.pt(x, 0, 700), b = P.pt(x, -30, 700); seg(P, a[0], a[1], b[0], b[1], 2); } });
  // farm compound with straw roofs and wattle fences (left), more farms far right
  addHouse(S, 3, -260, 1080, 300, 170, 84, { roof: 'straw', front: 'doors' }, fog);
  addHouse(S, 3, 120, 1150, 240, 160, 80, { roof: 'straw', ridge: 'z', front: 'wall' }, fog);
  addHouse(S, 1, -560, 1500, 260, 150, 80, { roof: 'straw' }, fog);
  S.add(3, 1000, -300, P => { fence(P, -300, 1000, 420, 1000, 40); fence(P, 420, 1000, 420, 1350, 40); }, { fog: fog(1000) });
  addHouse(S, 1, 2900, 1500, 300, 160, 82, { roof: 'straw', front: 'doors' }, fog);
  addHouse(S, 1, 3300, 1420, 220, 150, 80, { roof: 'straw', ridge: 'z' }, fog);
  S.add(1, 1380, 2800, P => fence(P, 2800, 1380, 3500, 1380, 36), { fog: fog(1380) });
  addHouse(S, 4, 3000, 260, 320, 170, 86, { roof: 'straw', front: 'open', awning: true }, fog);
  // trees: misty willows, old crab-claw trees
  for (const [X, Z, H, k] of [[-120, 900, 380, 'bare'], [400, 1350, 360, 'willow'], [900, 1250, 400, 'bare'], [1250, 1600, 340, 'willow'], [2150, 1200, 380, 'bare'], [SX0 - 120, 1050, 360, 'willow'], [SX1 + 60, 560, 400, 'willow'], [2850, 1700, 330, 'leaf'], [3600, 1000, 380, 'bare'], [-300, 1800, 300, 'willow']] as [number, number, number, string][]) addTree(S, Z > 1000 ? 1 : Z > 640 ? 3 : 4, X, Z, H, k as 'willow', fog);
  addTree(S, 4, 1500, 320, 440, 'bare', fog); addTree(S, 4, 300, 380, 420, 'willow', fog);
  // the donkey caravan carrying charcoal toward the city, a drover behind
  for (let i = 0; i < 5; i++) addBeast(S, 3, 2900 + i * 120, 760 + (i % 2) * 30, 64, 'donkey', -1, true, fog);
  addFig(S, 3, 3540, 790, { dir: -1, body: 'short', pose: 'walk', hat: 'li', robe: 2, force: true }, fog);
  // the tomb-sweeping party: a sedan dressed with willow branches, attendants, a rider
  S.add(3, 780, 700, P => { const p = P.pt(700, 0, 780); sedan(P, p[0], p[1], 54, -1, true); }, { fog: fog(780) });
  addBeast(S, 3, 1000, 760, 70, 'horse', -1, false, fog, { dir: -1, hat: 'futou', robe: 1 });
  addFig(S, 3, 1120, 790, { dir: -1, body: 'short', pose: 'carry', load: 'pole', hat: 'cap', robe: 4, force: true }, fog);
  addFig(S, 3, 480, 760, { dir: -1, body: 'short', pose: 'walk', hat: 'cap', robe: 5, force: true }, fog);
  addCrowd(S, 4, -300, 3600, 120, 560, 10, fog);
  addCrowd(S, 1, -400, 3400, 1100, 1700, 7, fog, 46, { body: 'short', hat: 'li' });
  // the straw shed with the damaged spot (the subject of the 1973 repair)
  const SHX = 1385, SHZ = 1020, SHW = 250, SHD = 130, SHH = 72;
  S.add(3, SHZ, SHX, P => {
    house(P, SHX, SHZ, SHW, SHD, SHH, { roof: 'straw', front: 'open', rh: 58 });
    const t = P.pt(SHX + SHW * 0.5, 0, SHZ - 20); shape(P, [[t[0] - 40, t[1] - 30], [t[0] + 40, t[1] - 30], [t[0] + 46, t[1] - 22], [t[0] - 34, t[1] - 22]], P.pal.wood, 1.4); seg(P, t[0] - 36, t[1] - 22, t[0] - 36, t[1], 1.3); seg(P, t[0] + 40, t[1] - 22, t[0] + 40, t[1], 1.3);
    figure(P, t[0] + 70, t[1] + 6, 54, { dir: -1, pose: 'sit', hat: 'jin', robe: 2 });
  }, { fog: fog(SHZ) });
  const fl = pP(SHX, SHH, SHZ); // front-left eave corner of the shed
  const PR: Rect = { x: fl[0] - 70, y: fl[1] - 28, w: 170, h: 150 };
  const ear1: Pt = [PR.x + 46, PR.y + 8], ear2: Pt = [PR.x + 62, PR.y + 9];
  S.info.patch = PR; S.info.posts = { x: ear1[0] - 8, y: ear1[1] - 34, w: 34, h: 40 };
  const blob = (P: Painter, inset: number, seed: number): Pt[] => { const n = vnoise(seed); const out: Pt[] = []; const cx = PR.x + PR.w / 2, cy = PR.y + PR.h / 2; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; const k = 0.82 + 0.3 * n(Math.cos(a) * 2 + 3, Math.sin(a) * 2 + 3); out.push([cx + Math.cos(a) * (PR.w / 2 - inset) * k, cy + Math.sin(a) * (PR.h / 2 - inset) * k]); } return out; };
  S.overlay(3, P => {
    P.setFog(0);
    const tear = blob(P, 18, 77);
    if (patch === 'bare' || patch === 'ears') {
      // lost silk: the darker backing shows through, frayed threads at the edge, broken ink fragments
      fill(P, tear, rgba(mix(P.pal.ground, P.mode === 'grey' ? hex('#6E6A62') : hex('#B89C70'), 0.45)), true);
      fill(P, blob(P, 30, 78), rgba(mix(P.pal.ground, P.mode === 'grey' ? hex('#5E5A54') : hex('#A88A5E'), 0.4)), true);
      for (let i = 0; i < 70; i++) { const p = pick(P.r, tear); const a = P.r() * Math.PI * 2; const l = rr(P.r, 3, 9); seg(P, p[0], p[1], p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l, 0.6, 0.35); }
      line(P, tear, 0.9, { closed: true, a: 0.45, amp: 1.2 });
      for (let i = 0; i < 6; i++) { const x = rr(P.r, PR.x + 30, PR.x + PR.w - 30), y = rr(P.r, PR.y + 40, PR.y + PR.h - 30); seg(P, x, y, x + rr(P.r, -14, 14), y + rr(P.r, -6, 6), 1.2, 0.5); }
    } else if (patch === 'donkey') {
      const pa = blob(P, 6, 79);
      fill(P, pa, rgba(mix(P.pal.ground, hex('#B9B4A6'), 0.32)), true);
      line(P, pa, 0.9, { closed: true, a: 0.35, amp: 0.6 });
      // the Ming mounter's donkey: ears = the shed's poles
      const u = 1.3, X0 = ear1[0] + 34 * u + 1, Y0 = ear1[1] + 88 * u;
      beast(P, X0, Y0, 100 * u, 'donkey', -1, false, 0.35);
    } else {
      // 1973: old patch lifted, new plain silk let in; the poles stand over blank silk
      const pa = blob(P, 6, 79);
      fill(P, pa, rgba(mix(P.pal.ground, hex('#FFFBF0'), 0.55)), true);
      line(P, pa, 0.8, { closed: true, a: 0.18, amp: 0.4 });
    }
    // the two thin poles (original paint)
    for (const [e, lean] of [[ear1, -0.12], [ear2, 0.05]] as [Pt, number][]) brush(P, [e[0], e[1] + 4], [e[0] + lean * 10, e[1] - 14], [e[0] + lean * 30, e[1] - 32], 3.4, 1.4, P.ink(0.95), 6);
    if (patch === 'ears') for (const [e, lean] of [[ear1, -0.12], [ear2, 0.05]] as [Pt, number][]) {
      const tip: Pt = [e[0] + lean * 30, e[1] - 36];
      line(P, [[e[0] - 7, e[1] + 6], [e[0] - 8 + lean * 12, e[1] - 16], tip, [e[0] + 7 + lean * 12, e[1] - 16], [e[0] + 7, e[1] + 6]], 1.6, { dash: [5, 4], amp: 0 });
    }
  });
};

// @@TAIL@@
