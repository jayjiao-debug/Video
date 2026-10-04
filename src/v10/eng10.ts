/* 《红线》 drawing kit: time map, noise, the glowing red thread, bokeh, stars, moon. All pure. */
export const BEAT = 60 / 72;
export const BAR = 4 * BEAT;
/** time of bar n (1-based) + beats */
export const bt = (bar: number, beat = 0) => (bar - 1) * BAR + beat * BEAT;
export const W = 1920, H = 1080;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const win = (T: number, a: number, z: number, fi = 0.5, fo = 0.5) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));
export const hash = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7 + 0.5) * 43758.5453; return x - Math.floor(x); };
export const rng = (seed: number) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
/** smooth 1D value noise, octaves summed */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i, seed), hash(i + 1, seed), u) * 2 - 1;
};
export const fbm1 = (x: number, seed = 0, oct = 5) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < oct; o++) { s += a * noise1(x * f, seed + o * 17); a *= 0.5; f *= 2.03; } return s; };

export type P2 = [number, number];
export const RED: [number, number, number] = [255, 58, 74];
export const rgba = (c: number[], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/** catmull-rom resample of a 2D polyline into n points */
export const spline = (pts: P2[], n = 120): P2[] => {
  if (pts.length < 2) return pts;
  const out: P2[] = [];
  const seg = pts.length - 1;
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * seg, k = Math.min(seg - 1, Math.floor(u)), t = u - k;
    const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(seg, k + 2)];
    const t2 = t * t, t3 = t2 * t;
    out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)) as P2);
  }
  return out;
};
const path = (ctx: CanvasRenderingContext2D, pts: P2[]) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
export const cumLen = (pts: P2[]) => { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; };
export const pointAt = (pts: P2[], cum: number[], s: number): P2 => {
  if (s <= 0) return pts[0];
  const L = cum[cum.length - 1];
  if (s >= L) return pts[pts.length - 1];
  let lo = 0, hi = cum.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < s) lo = m; else hi = m; }
  const k = (s - cum[lo]) / (cum[hi] - cum[lo] || 1);
  return [lerp(pts[lo][0], pts[hi][0], k), lerp(pts[lo][1], pts[hi][1], k)];
};
/** the thread: halo, glow, core, plus light pulses running along it */
export const thread = (ctx: CanvasRenderingContext2D, pts: P2[], o: { a?: number; w?: number; T?: number; pulses?: number; pulseSpeed?: number; draw?: number; hot?: number } = {}) => {
  if (pts.length < 2) return;
  const a = o.a ?? 1, w = o.w ?? 1, hot = o.hot ?? 0;
  let P = pts;
  if (o.draw !== undefined && o.draw < 1) {
    const c = cumLen(pts), L = c[c.length - 1] * clamp(o.draw);
    P = pts.filter((_, i) => c[i] <= L);
    P.push(pointAt(pts, c, L));
    if (P.length < 2) return;
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  path(ctx, P);
  ctx.strokeStyle = rgba([255, 40, 60], 0.06 * a * (1 + hot)); ctx.lineWidth = 26 * w; ctx.stroke();
  ctx.strokeStyle = rgba([255, 50, 70], 0.22 * a * (1 + 0.6 * hot)); ctx.lineWidth = 8 * w; ctx.stroke();
  ctx.strokeStyle = rgba([255, 80, 96], 0.85 * a); ctx.lineWidth = 2.6 * w; ctx.stroke();
  ctx.strokeStyle = rgba([255, 205, 210], 0.55 * a * (0.5 + hot)); ctx.lineWidth = 1 * w; ctx.stroke();
  // pulses
  const n = o.pulses ?? 0;
  if (n > 0 && o.T !== undefined) {
    const c = cumLen(P), L = c[c.length - 1];
    for (let i = 0; i < n; i++) {
      const s = ((o.T * (o.pulseSpeed ?? 220) + (i / n) * L) % L + L) % L;
      const q = pointAt(P, c, s);
      const g = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 16 * w);
      g.addColorStop(0, `rgba(255,230,232,${0.9 * a})`); g.addColorStop(0.3, `rgba(255,80,100,${0.35 * a})`); g.addColorStop(1, 'rgba(255,40,60,0)');
      ctx.fillStyle = g; ctx.fillRect(q[0] - 16 * w, q[1] - 16 * w, 32 * w, 32 * w);
    }
  }
  ctx.restore();
};
/** a soft round light (bokeh / star / person) */
export const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: number[], a: number, core = 0.35) => {
  if (a <= 0.003 || r <= 0.2) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(c, a)); g.addColorStop(core, rgba(c, a * 0.45)); g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
};
/** a defocused disc with a brighter rim, like lens bokeh */
export const bokeh = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: number[], a: number) => {
  if (a <= 0.003 || r < 1) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(c, a * 0.55)); g.addColorStop(0.82, rgba(c, a * 0.7)); g.addColorStop(0.93, rgba(c, a)); g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
};

/* ---------- moon texture, made once ---------- */
let MOON: HTMLCanvasElement | null = null;
export const moonTex = () => {
  if (MOON) return MOON;
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d')!;
  const r = rng(77);
  const grd = g.createRadialGradient(S * 0.42, S * 0.4, S * 0.05, S / 2, S / 2, S / 2);
  grd.addColorStop(0, '#fffaf0'); grd.addColorStop(0.7, '#efe6d2'); grd.addColorStop(1, '#d9ccb2');
  g.fillStyle = grd; g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 1, 0, Math.PI * 2); g.fill();
  g.save(); g.clip();
  // maria: big soft grey patches
  for (let i = 0; i < 9; i++) {
    const x = S * (0.25 + 0.5 * r()), y = S * (0.2 + 0.55 * r()), rr = S * (0.08 + 0.13 * r());
    const m = g.createRadialGradient(x, y, 0, x, y, rr); m.addColorStop(0, 'rgba(150,140,128,0.38)'); m.addColorStop(1, 'rgba(150,140,128,0)');
    g.fillStyle = m; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
  }
  for (let i = 0; i < 140; i++) {
    const x = S * r(), y = S * r(), rr = 1.5 + 9 * Math.pow(r(), 3);
    g.strokeStyle = 'rgba(120,110,98,0.22)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.arc(x - rr * 0.25, y - rr * 0.25, rr * 0.7, 0, Math.PI * 2); g.fill();
  }
  // limb darkening
  const ld = g.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S / 2);
  ld.addColorStop(0, 'rgba(0,0,0,0)'); ld.addColorStop(1, 'rgba(60,50,40,0.28)');
  g.fillStyle = ld; g.fillRect(0, 0, S, S);
  g.restore();
  MOON = c;
  return c;
};
/** the moon: call with part 'halo' before the bloom pass and 'disc' after it, so the face keeps its texture */
export const drawMoon = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a = 1, halo = 1, part: 'all' | 'halo' | 'disc' = 'all') => {
  if (part !== 'disc') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const [k, al] of [[6, 0.04], [3, 0.07], [1.6, 0.12]] as [number, number][]) glow(ctx, x, y, r * k, [255, 236, 200], al * a * halo, 0.15);
    ctx.restore();
  }
  if (part !== 'halo') {
    ctx.save(); ctx.globalAlpha = a * 0.94;
    ctx.drawImage(moonTex(), x - r, y - r, 2 * r, 2 * r);
    ctx.restore();
  }
};

/* ---------- star field ---------- */
const SR = rng(4242);
export const STARS = Array.from({ length: 2600 }, () => ({ x: SR(), y: SR(), m: Math.pow(SR(), 3), tw: SR() * 6.28, c: SR() }));
export const drawStars = (ctx: CanvasRenderingContext2D, T: number, a: number, ox = 0, oy = 0, scale = 1, maxY = 1e9) => {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const s of STARS) {
    const x = ((s.x * W * 1.4 + ox * (0.3 + s.m)) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * 0.2;
    const y = ((s.y * H * 1.4 + oy * (0.3 + s.m)) % (H * 1.4) + H * 1.4) % (H * 1.4) - H * 0.2;
    if (y > maxY) continue;
    const tw = 0.6 + 0.4 * Math.sin(T * (1.3 + s.c * 2) + s.tw);
    const al = a * (0.15 + 0.85 * s.m) * tw * Math.min(1, (maxY - y) / 120);
    const col = s.c < 0.2 ? [255, 210, 180] : s.c < 0.4 ? [190, 210, 255] : [255, 250, 240];
    if (s.m > 0.5) glow(ctx, x, y, (3 + 6 * s.m) * scale, col, al * 0.8, 0.2);
    ctx.fillStyle = rgba(col, al); ctx.fillRect(x - 0.6, y - 0.6, 1.2 + s.m * 1.3, 1.2 + s.m * 1.3);
  }
  ctx.restore();
};
/** blur-and-add bloom using an offscreen buffer */
export const bloom = (ctx: CanvasRenderingContext2D, off: HTMLCanvasElement, amount: number, radius: number) => {
  const o = off.getContext('2d')!;
  o.globalCompositeOperation = 'source-over'; o.filter = 'none'; o.clearRect(0, 0, off.width, off.height);
  o.filter = `blur(${radius}px)`; o.drawImage(ctx.canvas, 0, 0, off.width, off.height); o.filter = 'none';
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = amount; ctx.drawImage(off, 0, 0, W, H); ctx.restore();
};
