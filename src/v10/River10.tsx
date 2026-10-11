import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Canvas9 } from '../v9/Canvas9';
import { Cam, V3, projector, camAt, camLerp, ribbon, Proj } from '../v9/light9';
import { W, H, bt, clamp, lerp, prog, easeOut, easeInOut, smooth, win, rng, P2, thread, glow, drawMoon, drawStars, bloom, cumLen, pointAt } from './eng10';

/* 《红线》 S2: the Yangtze at night, 楚 (Wuhan) upstream, 吴 (Suzhou) downstream. Stylised: no borders, only
   the river, three lakes and city lights. The camera follows the thread down the river. */
export const S2_IN = bt(10) - 0.6, S2_OUT = bt(16) + 0.8;
const LON0 = 117.6, LAT0 = 30.9;
const geo = (lat: number, lon: number, y = 0): V3 => [(lon - LON0) * 86, y, -(lat - LAT0) * 100];
const RIVER_LL: [number, number][] = [
  [30.70, 111.29], [30.43, 111.75], [30.30, 112.24], [29.95, 112.60], [29.82, 112.90], [29.45, 113.13], [29.70, 113.40], [29.97, 113.80],
  [30.35, 114.05], [30.58, 114.30], [30.62, 114.55], [30.40, 114.88], [30.22, 115.07], [29.85, 115.55], [29.73, 116.00], [29.95, 116.55],
  [30.30, 116.85], [30.50, 117.05], [30.68, 117.50], [30.95, 117.80], [31.20, 118.10], [31.35, 118.37], [31.68, 118.48], [32.08, 118.72],
  [32.25, 119.00], [32.22, 119.43], [32.10, 119.80], [31.95, 120.27], [31.98, 120.55], [31.92, 120.88], [31.70, 121.15], [31.45, 121.50], [31.30, 121.90],
];
const sm = (pts: P2[], n: number): P2[] => {
  // catmull-rom through x,z pairs
  const out: P2[] = [];
  const seg = pts.length - 1;
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * seg, k = Math.min(seg - 1, Math.floor(u)), t = u - k;
    const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(seg, k + 2)];
    out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t * t + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t * t * t)) as P2);
  }
  return out;
};
const RIVER2 = sm(RIVER_LL.map(([la, lo]) => { const g = geo(la, lo); return [g[0], g[2]] as P2; }), 600);
const RIVER: V3[] = RIVER2.map(([x, z]) => [x, 0, z]);
const RCUM = cumLen(RIVER2);
const WUHAN = geo(30.593, 114.305), SUZHOU = geo(31.299, 120.585);
const nearestS = (p: V3) => { let best = 0, bd = 1e9; RIVER2.forEach((q, i) => { const d = (q[0] - p[0]) ** 2 + (q[1] - p[2]) ** 2; if (d < bd) { bd = d; best = i; } }); return RCUM[best]; };
const S_WUHAN = nearestS(WUHAN), S_JIANGYIN = nearestS(geo(31.95, 120.27));
/** the thread: along the river from Wuhan to Jiangyin, then over land to Suzhou */
const THREAD2: P2[] = (() => {
  const pts: P2[] = [];
  for (let s = S_WUHAN; s <= S_JIANGYIN; s += 3) pts.push(pointAt(RIVER2, RCUM, s));
  const j = pointAt(RIVER2, RCUM, S_JIANGYIN);
  for (let i = 1; i <= 12; i++) { const k = i / 12; pts.push([lerp(j[0], SUZHOU[0], k), lerp(j[1], SUZHOU[2], k) + Math.sin(k * Math.PI) * -6]); }
  return pts;
})();
const TCUM = cumLen(THREAD2);
const TLEN = TCUM[TCUM.length - 1];
const riverAt = (s: number): V3 => { const p = pointAt(RIVER2, RCUM, s); return [p[0], 0, p[1]]; };

const CITIES: [number, number, number][] = [
  [30.58, 114.30, 10], [28.23, 112.94, 7], [28.68, 115.86, 6], [31.82, 117.23, 7], [32.06, 118.80, 8], [31.23, 121.47, 12], [31.30, 120.58, 8],
  [30.27, 120.15, 9], [31.49, 120.31, 6], [31.81, 119.97, 5], [29.71, 116.00, 3], [30.53, 117.05, 3], [31.33, 118.38, 4], [30.70, 111.29, 4],
  [30.33, 112.24, 3], [29.36, 113.13, 3], [30.20, 115.04, 3], [32.19, 119.43, 3], [32.39, 119.41, 4], [31.98, 120.89, 5], [29.87, 121.55, 6],
  [30.00, 120.58, 4], [30.75, 120.75, 3], [30.87, 120.09, 3], [30.92, 113.92, 3], [29.84, 114.32, 2], [29.27, 117.18, 2], [32.63, 117.00, 3],
  [31.67, 118.51, 3], [30.94, 117.81, 2], [30.66, 117.49, 2], [32.01, 112.12, 4], [27.83, 113.13, 3], [27.86, 112.94, 3], [32.46, 119.92, 3],
  [33.35, 120.16, 3], [32.92, 117.39, 3], [30.39, 114.89, 2], [29.39, 113.10, 2], [31.40, 121.30, 4],
];
const R = rng(1117);
const gauss = () => { let u = 0, v = 0; while (u === 0) u = R(); v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const DOTS: { p: V3; s: number; w: number }[] = [];
CITIES.forEach(([la, lo, w]) => {
  const c = geo(la, lo), n = Math.round(80 * w), sg = 2.5 + 1.6 * Math.sqrt(w);
  for (let i = 0; i < n; i++) { const r = Math.abs(gauss()); DOTS.push({ p: [c[0] + gauss() * sg * (0.6 + r * 0.4), 0, c[2] + gauss() * sg * (0.6 + r * 0.4)], s: R(), w: R() }); }
});
for (let i = 0; i < 2600; i++) DOTS.push({ p: [lerp(-620, 420, R()), 0, lerp(-330, 380, R())], s: R() * 0.4, w: R() });
const LAKES: [number, number, number, number, number][] = [[29.2, 112.95, 0.42, 0.3, 3], [29.1, 116.3, 0.22, 0.55, 5], [31.2, 120.22, 0.3, 0.3, 7]];

/* camera: glide down the river behind the thread's tip, then rise to see both ends */
const FLY0 = S2_IN + 1.4, FLY1 = bt(14) + 0.3, WIDE = bt(15) + 1.6;
const flightS = (T: number) => lerp(S_WUHAN - 25, S_JIANGYIN + 8, easeInOut(prog(T, FLY0 - 0.8, FLY1)));
const flightCam = (T: number): Cam => {
  const s = flightS(T);
  const p = riverAt(s), q = riverAt(s + 70);
  const dx = q[0] - p[0], dz = q[2] - p[2], l = Math.hypot(dx, dz) || 1;
  return { pos: [p[0] - (dx / l) * 55 + (dz / l) * 18, 42, p[2] - (dz / l) * 55 - (dx / l) * 18], tgt: [q[0], 0, q[2] - 6], fov: 52, roll: 0.03 * Math.sin(T * 0.4) };
};
const WIDE_CAM: Cam = { pos: [-40, 560, 470], tgt: [-25, 0, -20], fov: 46, roll: 0 };
const riverCam = (T: number): Cam => {
  if (T < FLY0) { const top: Cam = { pos: [WUHAN[0] - 60, 260, WUHAN[2] + 140], tgt: [WUHAN[0] + 40, 0, WUHAN[2] - 10], fov: 50, roll: 0 }; return camLerp(top, flightCam(T), easeInOut(prog(T, S2_IN, FLY0))); }
  return camLerp(flightCam(T), WIDE_CAM, easeInOut(prog(T, FLY1 - 0.4, WIDE)));
};

export const RiverScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < S2_IN - 0.05 || T > S2_OUT + 0.05) return null;
  const o = Math.min(smooth(S2_IN, S2_IN + 1.2, T), 1 - smooth(S2_OUT - 1.2, S2_OUT, T));
  const c = riverCam(T);
  const pr = projector(c);
  const drawT = clamp((flightS(T) + 150 - S_WUHAN) / (S_JIANGYIN - S_WUHAN)) * 0.93 + 0.07 * smooth(FLY1 - 1.5, FLY1 + 0.5, T);
  const draw = (ctx: CanvasRenderingContext2D, b1: HTMLCanvasElement, b2: HTMLCanvasElement) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b1230'); g.addColorStop(0.25, '#070b1c'); g.addColorStop(1, '#03040a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const fwd = [c.tgt[0] - c.pos[0], c.tgt[2] - c.pos[2]];
    const hq = pr([c.pos[0] + fwd[0] * 400, 0, c.pos[2] + fwd[1] * 400]);
    const hy = hq ? hq[1] : -200;
    drawStars(ctx, T, 0.5, T * 4, 0, 1, hy - 10);
    // horizon haze + a low moon far away
    const hz = ctx.createLinearGradient(0, 0, 0, 380);
    hz.addColorStop(0, 'rgba(60,70,110,0)'); hz.addColorStop(0.7, 'rgba(70,80,120,0.10)'); hz.addColorStop(1, 'rgba(70,80,120,0)');
    ctx.fillStyle = hz; ctx.fillRect(0, 0, W, 380);
    const mY = Math.min(hy - 70, 150) - 260 * smooth(FLY1, WIDE, T);
    drawMoon(ctx, 1500, mY, 46, 0.85, 0.8, 'halo');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // lakes
    for (const [la, lo, rx, ry, sd] of LAKES) {
      const cc = geo(la, lo), pts: P2[] = [];
      for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, wob = 1 + 0.18 * Math.sin(a * 3 + sd) + 0.1 * Math.sin(a * 5 + sd * 2); const q = pr([cc[0] + Math.cos(a) * rx * 86 * wob, 0, cc[2] + Math.sin(a) * ry * 100 * wob]); if (q) pts.push([q[0], q[1]]); }
      if (pts.length > 3) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = 'rgba(120,150,210,0.10)'; ctx.fill(); ctx.strokeStyle = 'rgba(170,195,240,0.18)'; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    // city lights
    for (const d of DOTS) {
      const q = pr(d.p);
      if (!q || q[0] < -5 || q[0] > W + 5 || q[1] < -5 || q[1] > H + 5) continue;
      const sz = clamp(q[2] * (0.7 + d.s * 0.9), 0.6, 4.2);
      const tw = 0.75 + 0.25 * Math.sin(T * 2 + d.w * 30);
      ctx.fillStyle = d.w < 0.7 ? `rgba(255,${190 + 40 * d.w | 0},130,${0.38 * tw})` : `rgba(200,220,255,${0.3 * tw})`;
      ctx.fillRect(q[0], q[1], sz, sz);
    }
    for (const [la, lo, w] of CITIES) { const q = pr(geo(la, lo)); if (q) glow(ctx, q[0], q[1], clamp(q[2] * 9 * Math.sqrt(w), 6, 160), [255, 190, 120], 0.05, 0.2); }
    ctx.restore();
    // the river: silver ribbon with moving glints
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ribbon(ctx, pr, RIVER, 5, 'rgba(150,175,230,0.06)');
    ribbon(ctx, pr, RIVER, 1.3, 'rgba(185,205,245,0.4)');
    for (let k = 0; k < 420; k++) {
      const s = ((k / 420 + T * 0.006 + 0.37 * Math.sin(k)) % 1) * RCUM[RCUM.length - 1];
      const a = riverAt(s), b2p = riverAt(s + 2.2);
      const off = (Math.sin(k * 12.9) * 1.6);
      const qa = pr([a[0], 0, a[2] + off]), qb = pr([b2p[0], 0, b2p[2] + off]);
      if (!qa || !qb) continue;
      const tw = Math.max(0, Math.sin(T * 3 + k * 1.3));
      ctx.strokeStyle = `rgba(240,245,255,${0.5 * tw})`; ctx.lineWidth = clamp(qa[2] * 0.8, 0.6, 2.5);
      ctx.beginPath(); ctx.moveTo(qa[0], qa[1]); ctx.lineTo(qb[0], qb[1]); ctx.stroke();
    }
    ctx.restore();
    // the red thread floating just above the water
    const tp: P2[] = [];
    THREAD2.forEach((p, i) => { const q = pr([p[0], 1.6 + 0.8 * Math.sin(i * 0.3 + T * 1.5), p[1]]); if (q) tp.push([q[0], q[1]]); });
    thread(ctx, tp, { a: 1, w: 1.1, T, pulses: 4, pulseSpeed: 300, draw: drawT });
    // the two people: 楚 (Wuhan) and 吴 (Suzhou)
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const qa = pr([WUHAN[0], 2, WUHAN[2]]), qb = pr([SUZHOU[0], 2, SUZHOU[2]]);
    const beat = 0.85 + 0.15 * Math.sin(T * Math.PI * 2 * 1.2);
    if (qa) { glow(ctx, qa[0], qa[1], clamp(qa[2] * 22, 18, 120) * beat, [255, 210, 140], 0.7, 0.18); glow(ctx, qa[0], qa[1], 6, [255, 250, 235], 1, 0.5); }
    if (qb) { const ob = smooth(FLY1 - 3, FLY1 - 1, T); glow(ctx, qb[0], qb[1], clamp(qb[2] * 22, 18, 120) * beat, [255, 150, 170], 0.7 * ob, 0.18); glow(ctx, qb[0], qb[1], 6, [255, 240, 245], ob, 0.5); }
    ctx.restore();
    bloom(ctx, b1, 0.5, 5);
    bloom(ctx, b2, 0.35, 12);
    drawMoon(ctx, 1500, mY, 46, 0.85, 0.8, 'disc');
    // moon-glint flash bridging from the ink scene's reflection
    const fl = 1 - smooth(S2_IN + 0.2, S2_IN + 1.6, T);
    if (fl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, W / 2, H / 2, 1300, [255, 235, 210], 0.55 * fl, 0.3); ctx.restore(); }
  };
  const lab = (p: V3, txt: string, sub: string, a0: number, col: string) => {
    let a = a0;
    const q = pr(p);
    if (!q) return null;
    a *= 1 - smooth(640, 760, q[1]);
    if (a <= 0.01) return null;
    return (
      <div key={txt} style={{ position: 'absolute', left: q[0], top: q[1] - 44, transform: 'translate(-50%,-100%)', opacity: a, textAlign: 'center', whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: '"Noto Serif CJK SC", serif', fontWeight: 600, fontSize: 40, color: col, letterSpacing: '0.2em', textShadow: '0 0 18px rgba(0,0,0,0.9), 0 0 30px rgba(255,120,120,0.3)' }}>{txt}</div>
        <div style={{ fontFamily: '"Noto Serif CJK SC", serif', fontWeight: 400, fontSize: 20, color: 'rgba(240,232,220,0.7)', letterSpacing: '0.4em', marginTop: 4 }}>{sub}</div>
        <div style={{ width: 1, height: 26, margin: '6px auto 0', background: 'linear-gradient(rgba(255,230,220,0.6), rgba(255,230,220,0))' }} />
      </div>
    );
  };
  const mid = pointAt(THREAD2, TCUM, TLEN * 0.55);
  const dq = pr([mid[0], 0, mid[1]]);
  const dO = win(T, WIDE - 1.2, S2_OUT - 0.6, 0.6, 0.5);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Canvas9 T={T} draw={draw} />
      {lab(WUHAN, '楚', '武 汉', win(T, S2_IN + 1.2, S2_OUT - 0.5, 0.8, 0.5) * (T < FLY0 + 6 || T > FLY1 ? 1 : 1 - smooth(FLY0 + 6, FLY0 + 7, T)), '#ffe2b8')}
      {lab(SUZHOU, '吴', '苏 州', win(T, FLY1 - 2, S2_OUT - 0.5, 0.8, 0.5), '#ffc4cf')}
      {dq && dO > 0 && <div style={{ position: 'absolute', left: dq[0], top: dq[1] + 40, transform: 'translate(-50%,0)', opacity: dO, fontFamily: '"Noto Serif CJK SC", serif', fontSize: 24, letterSpacing: '0.35em', color: 'rgba(255,200,205,0.9)', textShadow: '0 0 12px rgba(0,0,0,1)' }}>相 隔 约 六 百 公 里</div>}
    </AbsoluteFill>
  );
};
export type { Proj };
