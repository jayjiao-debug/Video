/* Reusable 2D character rig (side view, facing +x, y down, units = px at scale 1).
   One skeleton, a small vetted pose set and a small vetted hand set; styles only decide how the parts are painted.
   Everything is a pure function of the pose, so any frame renders the same every time. */

export type P = [number, number];
export type Hand = 'relax' | 'fist' | 'point' | 'open';
export type Pose = {
  lean: number; head: number;                 // torso lean (+ forward), head tilt (+ chin down)
  sN: number; eN: number; wN: number;          // near arm: shoulder, elbow, wrist (deg; 0 = hanging, + forward)
  sF: number; eF: number; wF: number;          // far arm
  hN: number; kN: number; aN: number;          // near leg: hip, knee (<= 0), ankle offset
  hF: number; kF: number; aF: number;          // far leg
  handN: Hand; handF: Hand;
};

export const DIM = { T: 118, UA: 66, FA: 60, TH: 86, SH: 84, HEAD: 31 };
const R = Math.PI / 180;
export const dir = (a: number): P => [Math.sin(a * R), Math.cos(a * R)];
const add = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* ---------- the vetted pose set ---------- */
export const STAND: Pose = { lean: 2, head: 0, sN: 4, eN: 10, wN: 0, sF: -4, eF: 12, wF: 0, hN: 3, kN: -2, aN: 0, hF: -3, kF: -2, aF: 0, handN: 'relax', handF: 'relax' };
export const POINT: Pose = { ...STAND, lean: -3, head: -16, sN: 122, eN: 4, wN: -6, sF: -10, eF: 16, hN: 12, kN: -3, hF: -11, kF: -5, handN: 'point' };
export const HAUL: Pose = { lean: -17, head: -2, sN: 66, eN: 52, wN: 8, sF: 76, eF: 44, wF: 8, hN: 30, kN: -16, aN: 0, hF: -20, kF: -6, aF: 0, handN: 'fist', handF: 'fist' };
export const HUDDLE: Pose = { lean: 14, head: 18, sN: 34, eN: 116, wN: 24, sF: 28, eF: 118, wF: 24, hN: 6, kN: -8, aN: 0, hF: -4, kF: -6, aF: 0, handN: 'fist', handF: 'fist' };
export const WAVE = (t: number): Pose => ({ ...STAND, head: -6, sN: 138, eN: 38 + 16 * Math.sin(t * 9), wN: 6, handN: 'open' });

/** Walk cycle at phase ph (cycles). amp scales the stride. */
export const walk = (ph: number, amp = 1): Pose => {
  const s = 2 * Math.PI * ph, sw = (x: number) => Math.pow(Math.max(0, Math.cos(x + 0.5)), 2);
  return {
    lean: 6, head: -2,
    sN: -20 * Math.sin(s) * amp, eN: 16 + 12 * Math.max(0, -Math.sin(s)) * amp, wN: 0,
    sF: 20 * Math.sin(s) * amp, eF: 16 + 12 * Math.max(0, Math.sin(s)) * amp, wF: 0,
    hN: 24 * Math.sin(s) * amp, kN: -(4 + 58 * sw(s)) * amp, aN: 0,
    hF: 24 * Math.sin(s + Math.PI) * amp, kF: -(4 + 58 * sw(s + Math.PI)) * amp, aF: 0,
    handN: 'relax', handF: 'relax',
  };
};

export const blend = (a: Pose, b: Pose, k: number): Pose => {
  const o: any = {};
  for (const key of Object.keys(a) as (keyof Pose)[]) {
    const va = a[key], vb = b[key];
    o[key] = typeof va === 'number' ? lerp(va, vb as number, k) : k < 0.45 ? va : vb;   // hands snap between vetted shapes
  }
  return o as Pose;
};

/* ---------- forward kinematics ---------- */
export type Fig = {
  H: P; N: P; S: P; u: P; n: P; headC: P; headA: number;
  eN: P; wN: P; haN: number; eF: P; wF: P; haF: number;
  kN: P; ankN: P; toeN: P; heelN: P; kF: P; ankF: P; toeF: P; heelF: P;
  shinN: P; shinF: P; pose: Pose;
};
export const fk = (p: Pose): Fig => {
  const u: P = [Math.sin(p.lean * R), -Math.cos(p.lean * R)], n: P = [-u[1], u[0]];
  const H: P = [0, 0], N = add(H, u, DIM.T), S = add(H, u, DIM.T - 14);
  const arm = (s: number, e: number, w: number) => {
    const a = p.lean + s, el = add(S, dir(a), DIM.UA), wr = add(el, dir(a + e), DIM.FA);
    return [el, wr, a + e + w] as const;
  };
  const leg = (h: number, k: number, an: number, back: number) => {
    const hip = add(H, n, back), kn = add(hip, dir(h), DIM.TH), sh = h + k, ank = add(kn, dir(sh), DIM.SH);
    const fa = 90 + 0.55 * sh + an;
    return [kn, ank, add(ank, dir(fa), 26), add(ank, dir(fa), -7), dir(sh)] as const;
  };
  const [eN, wN, haN] = arm(p.sN, p.eN, p.wN), [eF, wF, haF] = arm(p.sF, p.eF, p.wF);
  const [kN, ankN, toeN, heelN, shinN] = leg(p.hN, p.kN, p.aN, 2), [kF, ankF, toeF, heelF, shinF] = leg(p.hF, p.kF, p.aF, -3);
  const headA = p.lean * 0.6 + p.head;
  const headC = add(add(N, u, 14 + 25), n, 4);
  return { H, N, S, u, n, headC, headA, eN, wN, haN, eF, wF, haF, kN, ankN, toeN, heelN, kF, ankF, toeF, heelF, shinN, shinF, pose: p };
};

/** fk + drop onto the ground: the lowest point of either boot sits on y = 0. */
export const fit = (p: Pose): Fig => {
  const f = fk(p);
  const low = Math.max(f.ankN[1] + 9, f.toeN[1] + 7, f.heelN[1] + 9, f.ankF[1] + 9, f.toeF[1] + 7, f.heelF[1] + 9);
  const sh = (q: P): P => [q[0], q[1] - low];
  const o: any = { ...f };
  for (const k of Object.keys(f) as (keyof Fig)[]) if (Array.isArray(f[k]) && k !== 'u' && k !== 'n' && k !== 'shinN' && k !== 'shinF') o[k] = sh(f[k] as P);
  return o as Fig;
};

/* ---------- travel: integrate the stance foot so feet never slide ---------- */
export type Travel = { dt: number; xs: number[]; prints: { x: number; near: boolean; t: number }[] };
export const travel = (plan: (t: number) => Pose, T: number, dt = 1 / 120): Travel => {
  const xs = [0], prints: Travel['prints'] = [];
  let f0 = fk(plan(0)), x = 0, nearSt = f0.ankN[1] >= f0.ankF[1];
  for (let i = 1; i * dt <= T + 1e-9; i++) {
    const f1 = fk(plan(i * dt));
    const d = f0.ankN[1] - f0.ankF[1];
    if (nearSt && d < -1.5) { nearSt = false; prints.push({ x: x + f0.ankF[0], near: false, t: i * dt }); }
    else if (!nearSt && d > 1.5) { nearSt = true; prints.push({ x: x + f0.ankN[0], near: true, t: i * dt }); }
    x -= nearSt ? f1.ankN[0] - f0.ankN[0] : f1.ankF[0] - f0.ankF[0];
    xs.push(x); f0 = f1;
  }
  return { dt, xs, prints };
};
export const travelAt = (tr: Travel, t: number) => {
  const i = clamp(t / tr.dt, 0, tr.xs.length - 1), a = Math.floor(i), b = Math.min(a + 1, tr.xs.length - 1);
  return lerp(tr.xs[a], tr.xs[b], i - a);
};
export const travelSmooth = (tr: Travel, t: number, win = 0.6) => {
  let s = 0, n = 0;
  for (let k = -8; k <= 8; k++) { s += travelAt(tr, t + (k / 8) * win); n++; }
  return s / n;
};

/* ---------- geometry helpers ---------- */
const f1 = (v: number) => v.toFixed(1);
export const pt = (q: P) => `${f1(q[0])} ${f1(q[1])}`;
/** tapered capsule from a (radius ra) to b (radius rb) */
export const capsule = (a: P, b: P, ra: number, rb: number) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
  const a1: P = [a[0] + nx * ra, a[1] + ny * ra], b1: P = [b[0] + nx * rb, b[1] + ny * rb], b2: P = [b[0] - nx * rb, b[1] - ny * rb], a2: P = [a[0] - nx * ra, a[1] - ny * ra];
  return `M${pt(a1)} L${pt(b1)} A${f1(rb)} ${f1(rb)} 0 0 0 ${pt(b2)} L${pt(a2)} A${f1(ra)} ${f1(ra)} 0 0 0 ${pt(a1)} Z`;
};
export const circle = (c: P, r: number) => `M${f1(c[0] - r)} ${f1(c[1])} a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0 Z`;
/** closed smooth curve through the midpoints of a polygon */
export const smooth = (ps: P[]) => {
  const m = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${pt(m(ps[ps.length - 1], ps[0]))}`;
  ps.forEach((q, i) => { d += ` Q${pt(q)} ${pt(m(q, ps[(i + 1) % ps.length]))}`; });
  return d + ' Z';
};
export { add };

/* ---------- the vetted hand set (local: wrist at 0,0, hand along +x, thumb toward -y) ---------- */
export const HANDS: Record<Hand, string[]> = {
  relax: ['M0 -8 C 10 -10 24 -10 28 -3 C 31 3 26 9 16 9 C 8 9 2 8 0 7 Z', capsule([6, -7], [15, -12], 4.6, 4)],
  fist: ['M0 -8 C 8 -12 22 -12 23 0 C 23 11 8 12 0 8 Z', capsule([7, -9], [17, -4], 4.4, 4)],
  point: ['M0 -8 C 8 -12 22 -12 23 0 C 23 11 8 12 0 8 Z', capsule([15, -5], [37, -6], 4.3, 3.6), capsule([7, -9], [16, -3], 4.4, 4)],
  open: ['M0 -8 C 12 -10 28 -10 32 -3 C 35 4 28 9 17 9 C 8 9 2 8 0 7 Z', capsule([6, -7], [12, -20], 4.6, 4)],
};
export const handTf = (w: P, a: number) => `translate(${pt(w)}) rotate(${f1(90 - a)})`;
