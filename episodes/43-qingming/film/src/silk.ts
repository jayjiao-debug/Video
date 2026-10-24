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

// @@END@@
