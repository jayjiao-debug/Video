import { mulberry } from '../v1/data';
import { clamp, lerp, easeInOut } from './kit9';

/* A tiny perspective camera over the ground plane (y = 0, x right, z toward the viewer) and the
   long-exposure drawing helpers. Pure functions of time; the canvas is redrawn every frame. */
export type V3 = [number, number, number];
export type Cam = { pos: V3; tgt: V3; fov: number; roll?: number };
export const W = 1920, H = 1080;

export const camLerp = (a: Cam, z: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => lerp(v, z.pos[i], k)) as V3,
  tgt: a.tgt.map((v, i) => lerp(v, z.tgt[i], k)) as V3,
  fov: lerp(a.fov, z.fov, k),
  roll: lerp(a.roll ?? 0, z.roll ?? 0, k),
});
/** keyframed camera: [time, cam][], eased between neighbours */
export const camAt = (keys: [number, Cam][], T: number): Cam => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, c0] = keys[i], [t1, c1] = keys[i + 1];
    if (T <= t1) return camLerp(c0, c1, easeInOut(clamp((T - t0) / (t1 - t0))));
  }
  return keys[keys.length - 1][1];
};

export type Proj = (p: V3) => [number, number, number] | null; // screen x, y, scale (px per world unit)
export const projector = (c: Cam, shake: [number, number] = [0, 0]): Proj => {
  const [px, py, pz] = c.pos;
  let fx = c.tgt[0] - px, fy = c.tgt[1] - py, fz = c.tgt[2] - pz;
  const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
  // right = f x up(0,1,0)
  let rx = -fz, ry = 0, rz = fx;
  const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
  // up = r x f
  let ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
  const ro = c.roll ?? 0;
  if (ro) {
    const cs = Math.cos(ro), sn = Math.sin(ro);
    const nrx = rx * cs + ux * sn, nry = ry * cs + uy * sn, nrz = rz * cs + uz * sn;
    ux = ux * cs - rx * sn; uy = uy * cs - ry * sn; uz = uz * cs - rz * sn;
    rx = nrx; ry = nry; rz = nrz;
  }
  const focal = (H / 2) / Math.tan((c.fov * Math.PI) / 360);
  return (p) => {
    const dx = p[0] - px, dy = p[1] - py, dz = p[2] - pz;
    const zc = dx * fx + dy * fy + dz * fz;
    if (zc < 20) return null;
    const s = focal / zc;
    return [W / 2 + (dx * rx + dy * ry + dz * rz) * s + shake[0], H / 2 - (dx * ux + dy * uy + dz * uz) * s + shake[1], s];
  };
};

/* ---------- polylines in world space ---------- */
export type Poly = { pts: V3[]; cum: number[]; len: number };
export const poly = (pts: V3[]): Poly => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]));
  return { pts, cum, len: cum[cum.length - 1] };
};
export const quad = (a: V3, c: V3, z: V3, n = 40): Poly =>
  poly(Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * z[0], 0, u * u * a[2] + 2 * u * t * c[2] + t * t * z[2]] as V3; }));
/** point at fraction f (0..1) along the polyline, plus its unit direction */
export const at = (P: Poly, f: number): [V3, number, number] => {
  const s = clamp(f) * P.len;
  let i = 1;
  while (i < P.cum.length - 1 && P.cum[i] < s) i++;
  const a = P.pts[i - 1], z = P.pts[i], seg = P.cum[i] - P.cum[i - 1] || 1, k = (s - P.cum[i - 1]) / seg;
  const dx = (z[0] - a[0]) / seg, dz = (z[2] - a[2]) / seg;
  return [[lerp(a[0], z[0], k), 0, lerp(a[2], z[2], k)], dx, dz];
};
export const sub = (P: Poly, f0: number, f1: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => at(P, lerp(f0, f1, i / n))[0]);

/* ---------- drawing ---------- */
export const strokeWorld = (ctx: CanvasRenderingContext2D, pr: Proj, pts: V3[], color: string, width: number, worldWidth = false, maxW = 1e9) => {
  ctx.beginPath();
  let started = false, wsum = 0, n = 0;
  for (const p of pts) {
    const q = pr(p);
    if (!q) { started = false; continue; }
    if (!started) { ctx.moveTo(q[0], q[1]); started = true; } else ctx.lineTo(q[0], q[1]);
    wsum += q[2]; n++;
  }
  if (!n) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = worldWidth ? Math.min(maxW, Math.max(0.6, width * (wsum / n))) : width;
  ctx.stroke();
};

/** a flat ribbon on the ground (true perspective width): for asphalt and glow bands */
export const ribbon = (ctx: CanvasRenderingContext2D, pr: Proj, pts: V3[], half: number, color: string) => {
  const L: [number, number][] = [], R: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], z = pts[Math.min(pts.length - 1, i + 1)];
    let dx = z[0] - a[0], dz = z[2] - a[2];
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const p = pts[i];
    const ql = pr([p[0] - dz * half, 0, p[2] + dx * half]), qr = pr([p[0] + dz * half, 0, p[2] - dx * half]);
    if (!ql || !qr) continue;
    L.push([ql[0], ql[1]]); R.push([qr[0], qr[1]]);
  }
  if (L.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (const q of L.slice(1)) ctx.lineTo(q[0], q[1]);
  for (const q of R.reverse()) ctx.lineTo(q[0], q[1]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};

/** bloom: blur a downscaled copy and add it back */
export const bloom = (ctx: CanvasRenderingContext2D, off: HTMLCanvasElement, amount = 0.9, radius = 5) => {
  const o = off.getContext('2d')!;
  o.globalCompositeOperation = 'source-over';
  o.filter = 'none';
  o.clearRect(0, 0, off.width, off.height);
  o.filter = `blur(${radius}px)`;
  o.drawImage(ctx.canvas, 0, 0, off.width, off.height);
  o.filter = 'none';
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = amount;
  ctx.drawImage(off, 0, 0, W, H);
  ctx.restore();
};

/* ---------- integrated phase: positions stay continuous when speeds change ---------- */
export const integrator = (speed: (T: number) => number, t0 = -1, t1 = 110, dt = 1 / 120) => {
  const n = Math.ceil((t1 - t0) / dt) + 1;
  const acc = new Float64Array(n);
  for (let i = 1; i < n; i++) acc[i] = acc[i - 1] + speed(t0 + (i - 0.5) * dt) * dt;
  return (T: number) => {
    const x = (T - t0) / dt, i = Math.max(0, Math.min(n - 2, Math.floor(x)));
    return acc[i] + (acc[i + 1] - acc[i]) * (x - i);
  };
};

/* ---------- the city backdrop: building lights and faint streets ---------- */
export const hash = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const R = mulberry(9);
export const CITY_DOTS: { p: V3; s: number; warm: number; tw: number }[] = [];
for (let i = 0; i < 5200; i++) {
  // lights cluster along a jittered street grid
  const gx = Math.round((R() * 2 - 1) * 26) * 170, gz = Math.round((R() * 2 - 1) * 22) * 170;
  const along = R() < 0.5;
  const x = gx + (along ? (R() - 0.5) * 170 : (R() - 0.5) * 40), z = gz + (along ? (R() - 0.5) * 40 : (R() - 0.5) * 170);
  CITY_DOTS.push({ p: [x + 85, 0, z + 85], s: 0.6 + R() * 1.8, warm: R(), tw: R() });
}
export const STREETS: { a: V3; z: V3; dir: number; n: number; seed: number }[] = [];
for (let i = 0; i < 90; i++) {
  const horiz = R() < 0.55, k = Math.round((R() * 2 - 1) * 20) * 170, s0 = Math.round((R() * 2 - 1) * 22) * 170, L = (3 + Math.floor(R() * 7)) * 170;
  const a: V3 = horiz ? [s0, 0, k] : [k, 0, s0], z: V3 = horiz ? [s0 + L, 0, k] : [k, 0, s0 + L];
  STREETS.push({ a, z, dir: R() < 0.5 ? 1 : -1, n: 4 + Math.floor(R() * 8), seed: R() * 100 });
}
