import { Easing, interpolate } from 'remotion';
/* Pixel engine shared by the 《心流》 pixel teaser and film: 384×216 hand-rasterised buffer, no anti-aliasing,
   a thresholded 12 px bitmap font (Fusion Pixel, OFL), Bayer dithering. Blown up ×5 with nearest-neighbour. */
export const W = 384, H = 216, S = 5;
export const FAM = 'FusionPixel';
export const pack = (h: string) => { const n = parseInt(h.slice(1), 16); return (0xff000000 | ((n & 255) << 16) | (n & 0xff00) | ((n >> 16) & 255)) >>> 0; };
export const K0 = pack('#0d0b14'), K1 = pack('#1b1f3b'), K2 = pack('#2e3566'), K3 = pack('#6a7392');
export const SKC = pack('#a9c4e0'), SKW = pack('#f0b98c'), SHW = pack('#b9785a'), WD = pack('#7a4b33'), BR = pack('#3a2622'), O = pack('#d9822b');
export const P0 = pack('#f4efe1'), P1 = pack('#cfc7b2'), R = pack('#e0312b'), Y = pack('#ffd25e'), C = pack('#5fd3e8');
export const G1 = pack('#5fbf6a'), G2 = pack('#2f7a4f'), R2 = pack('#8f1d1b');
const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const ip = (f: number, a: number, b: number, v0 = 0, v1 = 1, ease?: (t: number) => number) => interpolate(f, [a, b], [v0, v1], { ...cl, easing: ease });
export const oc = Easing.out(Easing.cubic), ic = Easing.in(Easing.cubic), ioc = Easing.inOut(Easing.cubic);
export const rnd = (i: number) => { const s = Math.sin(i * 127.3) * 43758.5453; return s - Math.floor(s); };
export const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const bay = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];
export const TYPE_RATE = 0.7;
/* ---------- bitmap font ---------- */
export type Glyph = { w: number; h: number; a: Uint8Array };
const gcache = new Map<string, Glyph>();
export const glyph = (t: string): Glyph => {
  const hit = gcache.get(t); if (hit) return hit;
  const cv = document.createElement('canvas'); const ctx = cv.getContext('2d')!;
  ctx.font = `12px ${FAM}`; const w = Math.max(1, Math.ceil(ctx.measureText(t).width)); cv.width = w; cv.height = 12;
  ctx.font = `12px ${FAM}`; ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, 0, 10);
  const im = ctx.getImageData(0, 0, w, 12).data; const a = new Uint8Array(w * 12);
  for (let i = 0; i < w * 12; i++) a[i] = im[i * 4 + 3] >= 110 ? 1 : 0;
  const g = { w, h: 12, a }; gcache.set(t, g); return g;
};

/* ---------- raster buffer ---------- */
export class Buf {
  d = new Uint32Array(W * H);
  clip: Uint8Array | null = null;
  within(m: Uint8Array, fn: () => void) {
    const prev = this.clip; let c = m;
    if (prev) { c = new Uint8Array(W * H); for (let i = 0; i < c.length; i++) c[i] = prev[i] & m[i]; }
    this.clip = c; fn(); this.clip = prev;
  }
  set(x: number, y: number, c: number) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= W || y >= H) return; const i = y * W + x; if (this.clip && !this.clip[i]) return; this.d[i] = c; }
  get(x: number, y: number) { return x < 0 || y < 0 || x >= W || y >= H ? K0 : this.d[y * W + x]; }
  rect(x: number, y: number, w: number, h: number, c: number) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) this.set(i, j, c);
  }
  dither(x: number, y: number, w: number, h: number, c: number, level: number) {
    for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) if (bay(i, j) < level * 16) this.set(i, j, c);
  }
  poly(pts: number[][], c: number) { scan(pts, (x, y) => this.set(x, y, c)); }
  disc(cx: number, cy: number, r: number, c: number) {
    cx = Math.round(cx); cy = Math.round(cy); const rr = r * r + r * 0.6, ri = Math.ceil(r);
    for (let dy = -ri; dy <= ri; dy++) for (let dx = -ri; dx <= ri; dx++) if (dx * dx + dy * dy <= rr) this.set(cx + dx, cy + dy, c);
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: number) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry; if (u * u + v * v <= 1) this.set(x, y, c);
    }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: number, w = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, o = Math.floor((w - 1) / 2);
    let err = dx + dy;
    for (;;) {
      for (let v = 0; v < w; v++) for (let u = 0; u < w; u++) this.set(x0 + u - o, y0 + v - o, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  blit(g: Glyph, x: number, y: number, s: number, c: number) {
    for (let j = 0; j < g.h; j++) for (let i = 0; i < g.w; i++) if (g.a[j * g.w + i]) for (let v = 0; v < s; v++) for (let u = 0; u < s; u++) this.set(x + i * s + u, y + j * s + v, c);
  }
  text(t: string, x: number, y: number, s: number, c: number, align: 'left' | 'center' | 'right' = 'left', outline?: number) {
    const g = glyph(t); const w = g.w * s;
    const x0 = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x), y0 = Math.round(y);
    if (outline !== undefined) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) this.blit(g, x0 + ox, y0 + oy, s, outline);
    this.blit(g, x0, y0, s, c);
  }
}
/** scanline fill (even-odd), pixel centres */
export const scan = (pts: number[][], cb: (x: number, y: number) => void) => {
  let y0 = H, y1 = 0; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) {
    const yc = y + 0.5, xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x <= Math.min(W - 1, Math.floor(xs[k + 1] - 0.5)); x++) cb(x, y);
  }
};
export const maskOf = (pts: number[][]) => { const m = new Uint8Array(W * H); scan(pts, (x, y) => { m[y * W + x] = 1; }); return m; };
export const outlinePoly = (b: Buf, pts: number[][], c: number, th: number) => { for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; b.line(p[0], p[1], q[0], q[1], c, th); } };
export const grow = (pts: number[][], k: number) => { const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length; return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]); };

/** RPG dialog box: opens over 3 frames, types at TYPE_RATE chars/frame, blinking ▼ when done */
export const dialog = (b: Buf, x: number, y: number, lines: string[], f: number, at: number, rate = TYPE_RATE, sc = 1) => {
  if (f < at) return;
  const pad = 6, lh = 12 * sc + 3;
  const w = Math.max(...lines.map((l) => glyph(l).w * sc)) + pad * 2 + 4, h = lines.length * lh + pad * 2 - 1;
  const open = Math.min(1, (f - at + 1) / 3), hh = Math.max(4, Math.round(h * open)), yy = y + Math.round((h - hh) / 2);
  b.rect(x - 1, yy - 1, w + 2, hh + 2, K0);
  b.rect(x + 1, yy + 1, w - 2, 1, P0); b.rect(x + 1, yy + hh - 2, w - 2, 1, P0); b.rect(x + 1, yy + 1, 1, hh - 2, P0); b.rect(x + w - 2, yy + 1, 1, hh - 2, P0);
  if (open < 1) return;
  let budget = Math.floor((f - at - 3) * rate);
  lines.forEach((l, i) => { const ch = [...l]; const n = Math.max(0, Math.min(ch.length, budget)); budget -= ch.length; if (n > 0) b.text(ch.slice(0, n).join(''), x + pad + 2, y + pad + 1 + i * lh, sc, P0); });
  if (budget >= 0 && Math.floor(f / 8) % 2 === 0) { const cx = x + w - 10, cy = y + h - 8; b.rect(cx, cy, 5, 1, R); b.rect(cx + 1, cy + 1, 3, 1, R); b.rect(cx + 2, cy + 2, 1, 1, R); }
};
export const clockTime = (m: number) => { const h = Math.floor((((m % 1440) + 1440) % 1440) / 60), mm = Math.floor(((m % 60) + 60) % 60); return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
/** comic panel: one flash frame, then content with a fat border that settles */
export const panel = (b: Buf, pts: number[][], m: Uint8Array, f: number, at: number, draw: () => void) => {
  if (f < at) return;
  const k = f - at;
  b.within(m, () => { if (k === 0) b.rect(0, 0, W, H, P0); else draw(); });
  outlinePoly(b, k === 0 ? grow(pts, 1.03) : k === 1 ? grow(pts, 1.012) : pts, K0, k < 2 ? 3 : 2);
};
const rectMask = new Map<string, Uint8Array>();
export const rmask = (x: number, y: number, w: number, h: number) => { const k = `${x},${y},${w},${h}`; let m = rectMask.get(k); if (!m) { m = maskOf([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]); rectMask.set(k, m); } return m; };
/** fill an ellipse but only over pixels currently equal to `only` */
export const tint = (b: Buf, cx: number, cy: number, rx: number, ry: number, only: number, c: number, level: number, test?: (x: number, y: number) => boolean) => {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
    if (u * u + v * v <= 1 && b.get(x, y) === only && bay(x, y) < level * 16 && (!test || test(x, y))) b.set(x, y, c);
  }
};
export const cloud = (b: Buf, x: number, y: number, s: number, seed: number) => {
  const r = rng(seed); const bl: number[][] = [];
  for (let i = 0; i < 9; i++) { const t = i / 8; bl.push([((t - 0.5) * 96 + (r() - 0.5) * 8) * s, -Math.sin(Math.PI * t) * 24 * (0.6 + r() * 0.5) * s, (11 + Math.sin(Math.PI * t) * 14 * (0.7 + r() * 0.4)) * s]); }
  const X = Math.floor(x), Yc = Math.floor(y);
  const inside = (dx: number, dy: number) => {
    if (Math.abs(dx) <= 51 * s && Math.abs(dy - s) <= 7 * s) return true;
    for (const [bx, by, br] of bl) if ((dx - bx) ** 2 + (dy - by) ** 2 <= br * br) return true;
    for (const ex of [-51 * s, 51 * s]) if ((dx - ex) ** 2 + (dy - s) ** 2 <= 49 * s * s) return true;
    return false;
  };
  const x0 = Math.floor(-62 * s), x1 = Math.ceil(62 * s), y0 = Math.floor(-50 * s), y1 = Math.ceil(10 * s);
  for (let dy = y0; dy <= y1; dy++) for (let dx = x0; dx <= x1; dx++) {
    const px = X + dx, py = Yc + dy;
    if (inside(dx, dy)) b.set(px, py, dy > 2 * s ? (bay(px, py) < 8 ? P1 : P0) : dy > -2 * s && bay(px, py) < 3 ? P1 : P0);
    else if (inside(dx + 1, dy) || inside(dx - 1, dy) || inside(dx, dy + 1) || inside(dx, dy - 1)) b.set(px, py, K0);
  }
};
export const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
  const h = (a: number, c: number) => rnd(a * 57.13 + c * 131.7 + 7);
  return (h(xi, yi) * (1 - sx) + h(xi + 1, yi) * sx) * (1 - sy) + (h(xi, yi + 1) * (1 - sx) + h(xi + 1, yi + 1) * sx) * sy;
};
