import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Canvas9 } from '../v9/Canvas9';
import { Cam, V3, projector, ribbon } from '../v9/light9';
import { W, H, bt, clamp, lerp, prog, easeOut, easeInOut, smooth, win, rng, fbm1, P2, thread, glow, bokeh, bloom } from './eng10';

/* 《红线》 S3: one city, four seasons, two lights that keep missing each other. Then the breath (time stops). */
export const S3_IN = bt(16) - 0.7, S3_OUT = bt(24) + 0.25;
export const BREATH = bt(23), MEET = bt(24);

type K = [number, number, number];
const A_KEYS: K[] = [[49.0, -520, 150], [53.2, -20, 125], [54.0, 10, 90], [56.6, -238, -134], [59.9, -244, -136], [61.8, 222, -42], [62.3, 228, -32], [63.2, 238, 60], [64.6, 128, 236], [66.4, 124, 240], [68.3, -40, 12], [70.0, -270, -40], [72.2, -160, 30], [73.3, -78, 40], [80, -70, 42]];
const B_KEYS: K[] = [[49.0, 540, -270], [54.7, 14, 120], [56.6, -182, -106], [59.9, -198, -104], [61.9, 430, 60], [62.9, 234, -38], [63.6, 240, -10], [64.6, 250, 238], [66.4, 252, 236], [68.3, -18, -14], [70.0, 230, -84], [72.2, 120, -6], [73.3, 42, 30], [80, 36, 32]];
const keyAt = (keys: K[], t: number): [number, number] => {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, x0, z0] = keys[i], [t1, x1, z1] = keys[i + 1];
    if (t <= t1) { const k = easeInOut((t - t0) / (t1 - t0)); return [lerp(x0, x1, k), lerp(z0, z1, k)]; }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
};
/** the city's own clock: it slows to a stop in the breath before the meeting */
const tc = (T: number) => (T < BREATH ? T : BREATH + 0.35 * (1 - Math.exp(-(T - BREATH) * 2.2)));

const R = rng(214);
const STREET = 120, NX = 6, NZ = 4;
const BLOCK_LIGHTS: V3[] = [];
for (let i = -NX - 2; i < NX + 2; i++) for (let j = -NZ - 2; j < NZ + 2; j++) { const n = 30 + Math.floor(R() * 60); for (let k = 0; k < n; k++) BLOCK_LIGHTS.push([i * STREET + 14 + R() * (STREET - 28), 0, j * STREET + 14 + R() * (STREET - 28)]); }
const WALK = Array.from({ length: 1300 }, () => ({ hz: R() < 0.5, line: Math.round((R() * 2 - 1) * (R() < 0.5 ? NZ : NX)), side: R() < 0.5 ? -1 : 1, v: (6 + 10 * R()) * (R() < 0.5 ? -1 : 1), o: R(), c: R() }));
const PET = Array.from({ length: 150 }, () => ({ x: R(), y: R(), z: R(), r: R() * 6.28, s: R() }));
const RAIN = Array.from({ length: 520 }, () => ({ x: R(), y: R(), z: R() }));
const LEAF = Array.from({ length: 95 }, () => ({ x: R(), y: R(), z: R(), r: R() * 6.28, s: R() }));
const SNOW = Array.from({ length: 640 }, () => ({ x: R(), y: R(), z: R(), s: R() }));
const RIPPLE = Array.from({ length: 110 }, () => ({ x: (R() * 2 - 1) * 600, z: (R() * 2 - 1) * 380, ph: R() }));
const MARKS: { p: V3; txt: string; a: number; z: number }[] = [
  { p: [0, 0, 120], txt: '地铁站', a: bt(16, 2.5), z: bt(18) },
  { p: [-212, 0, -120], txt: '屋檐下', a: bt(18) + 0.1, z: bt(19) + 0.1 },
  { p: [232, 0, -36], txt: '那家店', a: bt(19) + 0.1, z: bt(20) + 0.1 },
  { p: [188, 0, 240], txt: '路口', a: bt(20) + 0.1, z: bt(21) + 0.1 },
];

/** the camera keeps both lights in frame: it tracks their (smoothed) midpoint and backs off as they drift apart */
const cityCam = (T: number): Cam => {
  let mx = 0, mz = 0, sep = 0, n = 0;
  for (let k = -6; k <= 6; k++) {
    const t2 = tc(T + k * 0.25), w = 1 - Math.abs(k) / 7;
    const a = keyAt(A_KEYS, t2), b = keyAt(B_KEYS, t2);
    mx += w * (a[0] + b[0]) / 2; mz += w * (a[1] + b[1]) / 2; sep += w * Math.hypot(a[0] - b[0], a[1] - b[1]); n += w;
  }
  mx /= n; mz /= n; sep /= n;
  const th = lerp(-0.3, 0.25, prog(T, S3_IN, BREATH));
  const d = Math.max(380, Math.min(900, sep * 1.05 + 300)) * lerp(1, 0.62, easeInOut(prog(T, bt(22, 2), MEET)));
  return { pos: [mx + Math.sin(th) * d * 0.6, d * 0.82, mz + Math.cos(th) * d * 0.72], tgt: [mx, 0, mz + 10], fov: 42, roll: -0.02 * Math.sin(T * 0.2) };
};

export const CityScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < S3_IN - 0.05 || T > S3_OUT + 0.05) return null;
  const o = Math.min(smooth(S3_IN, S3_IN + 1.4, T), 1 - smooth(S3_OUT - 0.25, S3_OUT, T));
  const t = tc(T);
  const pr = projector(cityCam(T));
  const sp = win(T, S3_IN, bt(18) + 0.2, 1.0, 0.7), su = win(T, bt(18) - 0.3, bt(19) + 0.3, 0.6, 0.6), au = win(T, bt(19), bt(20) + 0.3, 0.6, 0.6), wi = smooth(bt(20) - 0.2, bt(20) + 0.6, T);
  const tension = smooth(bt(22), BREATH, T);
  const freeze = smooth(BREATH, BREATH + 0.8, T);
  const [ax, az] = keyAt(A_KEYS, t), [bx, bz] = keyAt(B_KEYS, t);
  const threadPts = (): P2[] => {
    const pts: P2[] = [];
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1, nx = -dz / L, nz = dx / L;
    for (let i = 0; i <= 70; i++) {
      const k = i / 70;
      const slack = (1 - tension) * Math.sin(Math.PI * k) * (Math.sin(t * 0.35 + 1) * (12 + 0.3 * L) + (10 + 0.35 * L) * fbm1(k * 3.2 + t * 0.15, 9));
      const q = pr([lerp(ax, bx, k) + nx * slack, 1.5, lerp(az, bz, k) + nz * slack]);
      if (q) pts.push([q[0], q[1]]);
    }
    return pts;
  };
  const draw = (ctx: CanvasRenderingContext2D, b1: HTMLCanvasElement, b2: HTMLCanvasElement) => {
    ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // streets
    for (let j = -NZ; j <= NZ; j++) { const pts: V3[] = [[-NX * STREET - 200, 0, j * STREET], [NX * STREET + 200, 0, j * STREET]]; ribbon(ctx, pr, pts, 12, 'rgba(255,190,120,0.022)'); ribbon(ctx, pr, pts, 1.6, 'rgba(255,200,140,0.07)'); }
    for (let i = -NX; i <= NX; i++) { const pts: V3[] = [[i * STREET, 0, -NZ * STREET - 160], [i * STREET, 0, NZ * STREET + 160]]; ribbon(ctx, pr, pts, 12, 'rgba(255,190,120,0.022)'); ribbon(ctx, pr, pts, 1.6, 'rgba(255,200,140,0.07)'); }
    // windows
    BLOCK_LIGHTS.forEach((p, i) => { const q = pr(p); if (!q || q[0] < -10 || q[0] > W + 10 || q[1] < -10 || q[1] > H + 10) return; const tw = 0.6 + 0.4 * Math.sin(i * 7.7 + t * 0.4); const h = (i * 0.618) % 1; const col = h < 0.62 ? [255, 206, 150] : h < 0.85 ? [255, 236, 210] : [160, 195, 255]; const s = clamp(q[2] * (1.6 + 2.2 * ((i * 0.37) % 1)), 0.8, 5); ctx.fillStyle = `rgba(${col.join(',')},${0.42 * tw})`; ctx.fillRect(q[0], q[1], s, s); if (i % 23 === 0) glow(ctx, q[0], q[1], 14 * q[2] + 6, col, 0.18 * tw); });
    // the crowd
    for (const w of WALK) {
      const span = (w.hz ? NX : NZ) * STREET * 2 + 300;
      const along = ((w.o * span + t * w.v) % span + span) % span - span / 2;
      const off = w.side * 7;
      const p: V3 = w.hz ? [along, 0, w.line * STREET + off] : [w.line * STREET + off, 0, along];
      const q = pr(p);
      if (!q) continue;
      const s = clamp(q[2] * 2.6, 1, 5);
      ctx.fillStyle = w.c < 0.8 ? 'rgba(255,236,214,0.8)' : 'rgba(180,205,255,0.75)';
      ctx.fillRect(q[0] - s / 2, q[1] - s / 2, s, s);
    }
    // rain ripples on the ground in summer
    if (su > 0) for (const r of RIPPLE) { const k = ((t * 1.3 + r.ph) % 1); const q = pr([r.x, 0, r.z]); if (!q) continue; ctx.strokeStyle = `rgba(180,210,255,${0.35 * su * (1 - k)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(q[0], q[1], 2 + 18 * k * q[2], (2 + 18 * k * q[2]) * 0.5, 0, 0, Math.PI * 2); ctx.stroke(); }
    // landmarks of the near misses
    for (const m of MARKS) { const a = win(T, m.a, m.z, 0.5, 0.5); const q = pr(m.p); if (!q || a <= 0) continue; ctx.strokeStyle = `rgba(255,230,210,${0.6 * a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(q[0], q[1], 30 * q[2] + 10, (30 * q[2] + 10) * 0.6, 0, 0, Math.PI * 2); ctx.stroke(); glow(ctx, q[0], q[1], 80 * q[2] + 20, [255, 220, 190], 0.15 * a); }
    ctx.restore();
    // the thread, then the two lights
    const tp = threadPts();
    thread(ctx, tp, { a: 1, w: 0.9 + 0.5 * tension, T, pulses: 3, pulseSpeed: 180 + 400 * tension, hot: tension });
    const qa = pr([ax, 2, az]), qb = pr([bx, 2, bz]);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const beat = 1 + 0.12 * Math.sin(T * Math.PI * 2 * 1.2) * (0.3 + tension);
    if (qa) { glow(ctx, qa[0], qa[1], 34 * beat * (qa[2] * 0.6 + 0.6), [255, 205, 130], 0.7, 0.18); glow(ctx, qa[0], qa[1], 7, [255, 250, 235], 1, 0.5); }
    if (qb) { glow(ctx, qb[0], qb[1], 34 * beat * (qb[2] * 0.6 + 0.6), [255, 140, 165], 0.7, 0.18); glow(ctx, qb[0], qb[1], 7, [255, 240, 245], 1, 0.5); }
    // near-miss shimmer when they pass close
    const d = Math.hypot(ax - bx, az - bz);
    if (qa && qb && d < 90) { const k = 1 - d / 90; glow(ctx, (qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, 120 * k + 40, [255, 160, 170], 0.25 * k); }
    ctx.restore();
    // seasons: petals, rain, leaves, snow (screen space, three depths)
    ctx.save();
    if (sp > 0) for (const p of PET) {
      const z = 0.3 + p.z, y = ((p.y * (H + 200) + t * 55 * z) % (H + 200)) - 100, x = ((p.x * (W + 200) + t * 30 * z + 40 * Math.sin(t * 0.8 + p.r)) % (W + 200)) - 100;
      const r = 4 + 10 * z * z;
      if (z > 1.05) { bokeh(ctx, x, y, r * 2.2, [255, 170, 190], 0.12 * sp); continue; }
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.r + t * (0.6 + p.s)); ctx.scale(1, 0.45 + 0.35 * Math.sin(t * 2 + p.r));
      ctx.fillStyle = `rgba(255,${180 + 30 * p.s | 0},${200 + 20 * p.s | 0},${0.7 * sp})`; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    if (su > 0) { ctx.strokeStyle = `rgba(190,215,255,${0.28 * su})`; ctx.lineWidth = 1.2; ctx.beginPath(); for (const r of RAIN) { const z = 0.4 + r.z, y = ((r.y * (H + 300) + t * 1500 * z) % (H + 300)) - 150, x = ((r.x * (W + 300) + y * 0.2) % (W + 300)) - 150, l = 28 + 40 * z; ctx.moveTo(x, y); ctx.lineTo(x + l * 0.2, y + l); } ctx.stroke(); }
    if (au > 0) for (const l of LEAF) {
      const z = 0.3 + l.z, y = ((l.y * (H + 200) + t * 70 * z) % (H + 200)) - 100, x = ((l.x * (W + 200) - t * 45 * z + 60 * Math.sin(t * 0.9 + l.r)) % (W + 200) + W + 200) % (W + 200) - 100;
      const r = 6 + 12 * z * z;
      if (z > 1.08) { bokeh(ctx, x, y, r * 2, [255, 160, 70], 0.12 * au); continue; }
      ctx.save(); ctx.translate(x, y); ctx.rotate(l.r + t * (0.8 + l.s));
      ctx.fillStyle = `rgba(${230 + 25 * l.s | 0},${120 + 60 * l.s | 0},50,${0.75 * au})`;
      ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -r * 0.6, r, 0); ctx.quadraticCurveTo(0, r * 0.6, -r, 0); ctx.fill(); ctx.restore();
    }
    if (wi > 0) for (const s of SNOW) {
      const z = 0.2 + s.z, y = ((s.y * (H + 200) + t * 45 * z) % (H + 200)) - 100, x = ((s.x * (W + 200) + 25 * Math.sin(t * 0.7 + s.s * 9) * z) % (W + 200) + W + 200) % (W + 200) - 100;
      const r = 1.2 + 3.5 * z * z;
      if (z > 1.0) bokeh(ctx, x, y, r * 4, [235, 242, 255], 0.10 * wi);
      else glow(ctx, x, y, r * 2.2, [240, 245, 255], 0.75 * wi, 0.4);
    }
    ctx.restore();
    // season grade
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    const grade: [number[], number][] = [[[255, 150, 180], sp], [[90, 150, 255], su], [[255, 170, 70], au], [[170, 200, 255], wi]];
    for (const [c, a] of grade) if (a > 0) { ctx.fillStyle = `rgba(${c.join(',')},${0.35 * a})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    bloom(ctx, b1, 0.55, 5);
    bloom(ctx, b2, 0.4, 12);
    // the breath: the world drains of colour, the thread stays red
    if (freeze > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${0.85 * freeze})`; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(0,0,0,${0.25 * freeze})`; ctx.fillRect(0, 0, W, H); ctx.restore();
      thread(ctx, tp, { a: freeze, w: 1.5, T, pulses: 2, pulseSpeed: 90, hot: 1 });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (qa) glow(ctx, qa[0], qa[1], 60, [255, 210, 150], 0.7 * freeze, 0.2);
      if (qb) glow(ctx, qb[0], qb[1], 60, [255, 150, 170], 0.7 * freeze, 0.2);
      ctx.restore();
    }
  };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Canvas9 T={T} draw={draw} />
      {MARKS.map((m) => { const a = win(T, m.a, m.z, 0.5, 0.5); const q = pr(m.p); if (!q || a <= 0.01) return null; return <div key={m.txt} style={{ position: 'absolute', left: q[0], top: q[1] - 40 * q[2] - 34, transform: 'translate(-50%,-100%)', opacity: a, fontFamily: '"Noto Serif CJK SC", serif', fontSize: 24, letterSpacing: '0.4em', color: 'rgba(255,236,224,0.9)', textShadow: '0 0 12px rgba(0,0,0,1)' }}>{m.txt}</div>; })}
    </AbsoluteFill>
  );
};
