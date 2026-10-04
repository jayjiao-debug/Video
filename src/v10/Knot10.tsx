import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Canvas9 } from '../v9/Canvas9';
import { W, H, bt, clamp, lerp, prog, easeOut, easeInOut, smooth, win, rng, P2, spline, thread, glow, bokeh, drawMoon, drawStars, bloom, cumLen, pointAt } from './eng10';

/* 《红线》 S4 the meeting: the thread pulls taut and ties itself into a 同心结; S5 the two lights become stars. */
export const S4_IN = bt(24) - 0.25, SKY_IN = bt(30) + 1.5, FILM_END10 = 122.0;
const MEET = bt(24), TAUT = bt(26), KNOT0 = bt(27), KNOT1 = bt(28) + 1.0, RISE0 = bt(30) - 0.2;
const KX = 960, KY = 380, KS = 66;

/* ---------- the knot: two serpentine strands woven on a diamond lattice, ears, cord and tassel ---------- */
const uv = (u: number, v: number): P2 => [(u - v) * KS, (u + v) * KS];
const arcUV = (cu: number, cv: number, r: number, a0: number, a1: number, n = 10): P2[] => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return uv(cu + r * Math.cos(a), cv + r * Math.sin(a)); });
const lineUV = (u0: number, v0: number, u1: number, v1: number, n = 12): P2[] => Array.from({ length: n + 1 }, (_, i) => uv(lerp(u0, u1, i / n), lerp(v0, v1, i / n)));
const bez = (p0: P2, c1: P2, c2: P2, p3: P2, n = 18): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1].map((d) => u * u * u * p0[d] + 3 * u * u * t * c1[d] + 3 * u * t * t * c2[d] + t * t * t * p3[d]) as P2; });
const PI = Math.PI;
const U_STRAND: P2[] = [
  ...lineUV(-0.75, -1, -0.75, 1), ...arcUV(-0.5, 1, 0.25, PI, 0), ...lineUV(-0.25, 1, -0.25, -1), ...arcUV(0, -1, 0.25, PI, 2 * PI),
  ...lineUV(0.25, -1, 0.25, 1), ...arcUV(0.5, 1, 0.25, PI, 0), ...lineUV(0.75, 1, 0.75, -1),
];
const V_STRAND: P2[] = [
  ...lineUV(1, -0.75, -1, -0.75), ...arcUV(-1, -0.5, 0.25, -PI / 2, -3 * PI / 2), ...lineUV(-1, -0.25, 1, -0.25), ...arcUV(1, 0, 0.25, -PI / 2, PI / 2),
  ...lineUV(1, 0.25, -1, 0.25), ...arcUV(-1, 0.5, 0.25, -PI / 2, -3 * PI / 2), ...lineUV(-1, 0.75, 1, 0.75),
];
const EAR_R = bez(uv(0.75, -1), uv(0.75, -1.85), uv(1.85, -0.75), uv(1, -0.75));
const EAR_L = bez(uv(-1, 0.75), uv(-1.85, 0.75), uv(-0.75, 1.85), uv(-0.75, 1.0));
const top = uv(-0.75, -1), bot = uv(1, 0.75);
const CORD: P2[] = [...bez([0, -2.75 * KS], [-0.5 * KS, -2.4 * KS], [top[0], top[1] - 0.6 * KS], top, 12)];
const TAIL: P2[] = bez(bot, [bot[0] + 0.2 * KS, bot[1] + 0.5 * KS], [0, 2.1 * KS], [0, 2.45 * KS], 12);
const LOOP: P2[] = Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * 2 * PI + PI / 2; return [Math.cos(a) * 0.32 * KS, -2.75 * KS - 0.32 * KS + Math.sin(a) * 0.32 * KS] as P2; });
const PARTS: [P2[], number, number][] = [[LOOP, 0, 0.08], [CORD, 0.06, 0.16], [U_STRAND, 0.14, 0.52], [EAR_R, 0.5, 0.6], [V_STRAND, 0.58, 0.92], [EAR_L, 0.6, 0.7], [TAIL, 0.9, 1]];
/* crossings: lattice points; V over U where (i + j) is odd */
const CROSS: { p: P2; vOver: boolean }[] = [];
[-0.75, -0.25, 0.25, 0.75].forEach((u, i) => [-0.75, -0.25, 0.25, 0.75].forEach((v, j) => CROSS.push({ p: uv(u, v), vOver: (i + j) % 2 === 1 })));

const R = rng(1999);
const CROWD = Array.from({ length: 70 }, () => ({ y: R(), x: R(), z: R(), c: R(), d: R() < 0.5 ? 1 : -1 }));
const SNOW = Array.from({ length: 260 }, () => ({ x: R(), y: R(), z: R(), s: R() }));
const TASSEL = Array.from({ length: 46 }, () => ({ dx: (R() * 2 - 1), l: 0.75 + 0.25 * R(), ph: R() * 6 }));

const orbs = (T: number): [P2, P2] => {
  const k = easeInOut(prog(T, MEET + 0.6, TAUT));
  const rise = -720 * easeInOut(prog(T, RISE0, SKY_IN + 1));
  return [[lerp(470, 770, k), lerp(640, 680, k) + rise], [lerp(1450, 1150, k), lerp(640, 680, k) + rise]];
};

const drawOrb = (ctx: CanvasRenderingContext2D, p: P2, c: number[], a: number, T: number, flare: number) => {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(ctx, p[0], p[1], 210 + 220 * flare, c, 0.16 * a, 0.12);
  glow(ctx, p[0], p[1], 70, c, 0.55 * a, 0.25);
  glow(ctx, p[0], p[1], 16, [255, 250, 240], a, 0.5);
  const ring = ((T * 1.2) % 1);
  ctx.strokeStyle = `rgba(${c.join(',')},${0.25 * a * (1 - ring)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p[0], p[1], 30 + 90 * ring, 0, 2 * PI); ctx.stroke();
  ctx.restore();
};

export const KnotScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < S4_IN - 0.05) return null;
  const draw = (ctx: CanvasRenderingContext2D, b1: HTMLCanvasElement, b2: HTMLCanvasElement) => {
    const sky = smooth(RISE0, SKY_IN + 1.5, T);
    // background: warm dark for the meeting, deep night for the sky
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgb(${lerp(16, 8, sky) | 0},${lerp(8, 14, sky) | 0},${lerp(18, 38, sky) | 0})`);
    g.addColorStop(1, `rgb(${lerp(6, 3, sky) | 0},${lerp(3, 5, sky) | 0},${lerp(9, 14, sky) | 0})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const rise = -720 * easeInOut(prog(T, RISE0, SKY_IN + 1));
    drawStars(ctx, T, 0.9 * sky, 0, rise * 0.6 + 400 * (1 - sky));
    if (sky > 0) drawMoon(ctx, 1500, 210, 92, sky, 1.2, 'halo');
    // crowd as defocused lights passing in front of and behind them
    const cr = 1 - sky;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const c of CROWD) {
      const x = ((c.x * (W + 600) + T * c.d * (20 + 60 * c.z)) % (W + 600) + W + 600) % (W + 600) - 300;
      const y = 300 + c.y * 700 + rise * (0.3 + c.z);
      const r = 30 + 130 * c.z * c.z;
      const col = c.c < 0.6 ? [255, 200, 150] : c.c < 0.85 ? [170, 195, 255] : [255, 120, 140];
      bokeh(ctx, x, y, r, col, 0.07 * cr * (1 - 0.6 * smooth(KNOT0, KNOT1, T)));
    }
    for (const s of SNOW) {
      const z = 0.2 + s.z, y = ((s.y * (H + 200) + T * 35 * z) % (H + 200)) - 100 + rise * 0.5, x = ((s.x * (W + 200) + 20 * Math.sin(T * 0.6 + s.s * 9) * z) % (W + 200) + W + 200) % (W + 200) - 100;
      glow(ctx, x, y, (1.2 + 3 * z * z) * 2.2, [240, 245, 255], 0.5 * cr, 0.4);
    }
    ctx.restore();
    const [A, B] = orbs(T);
    const flare = Math.exp(-Math.max(0, T - MEET) * 2.2) * (T >= MEET ? 1 : 0);
    // the thread
    const kd = prog(T, KNOT0, KNOT1);
    const swing = 0.035 * Math.sin(T * 1.1) * smooth(KNOT1, KNOT1 + 1, T);
    const kx = KX, ky = KY + rise;
    const place = (p: P2): P2 => { const c = Math.cos(swing), s = Math.sin(swing); const x = p[0], y = p[1] + 2.75 * KS; return [kx + x * c - y * s, ky - 2.75 * KS + x * s + y * c]; };
    const lineA = 1 - smooth(KNOT0, KNOT0 + 1.2, T);
    if (lineA > 0) {
      const sag = lerp(160, 0, easeInOut(prog(T, MEET, TAUT)));
      const vib = 14 * Math.exp(-Math.max(0, T - TAUT) * 2) * Math.sin((T - TAUT) * 30) * (T > TAUT ? 1 : 0);
      const pts: P2[] = Array.from({ length: 50 }, (_, i) => { const k = i / 49; return [lerp(A[0], B[0], k), lerp(A[1], B[1], k) + Math.sin(PI * k) * (sag + vib)]; });
      thread(ctx, pts, { a: lineA, w: 1.3, T, pulses: 3, pulseSpeed: 260, hot: smooth(TAUT - 1, TAUT, T) });
    }
    if (kd > 0) {
      // strands from each light up to the ears
      const er = place(EAR_R[9]), el = place(EAR_L[9]);
      const ka = smooth(KNOT0, KNOT0 + 0.8, T);
      thread(ctx, spline([A, [lerp(A[0], el[0], 0.5), lerp(A[1], el[1], 0.5) + 40], el], 30), { a: ka * 0.9, w: 1.1, T, pulses: 2, pulseSpeed: 200 });
      thread(ctx, spline([B, [lerp(B[0], er[0], 0.5), lerp(B[1], er[1], 0.5) + 40], er], 30), { a: ka * 0.9, w: 1.1, T, pulses: 2, pulseSpeed: -200 });
      for (const [pts, a0, a1] of PARTS) {
        const d = clamp((kd - a0) / (a1 - a0));
        if (d <= 0) continue;
        thread(ctx, pts.map(place), { a: 1, w: 1.25, T, pulses: kd >= 1 ? 1 : 0, pulseSpeed: 120, draw: d, hot: 0.4 * smooth(KNOT1, KNOT1 + 1, T) });
      }
      // weave: cut the under strand where the other passes over
      const uDone = kd > 0.52, vDone = kd > 0.92;
      if (uDone && vDone) {
        for (const c of CROSS) {
          const p = place(c.p);
          // over-strand direction: U lines run along (1,1)/√2 in screen, V lines along (1,-1)/√2 (diamond)
          const dir: P2 = c.vOver ? [Math.SQRT1_2, -Math.SQRT1_2] : [Math.SQRT1_2, Math.SQRT1_2];
          const l = 15;
          ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt';
          ctx.strokeStyle = `rgb(${lerp(14, 8, sky) | 0},${lerp(7, 12, sky) | 0},${lerp(16, 32, sky) | 0})`; ctx.lineWidth = 11;
          ctx.beginPath(); ctx.moveTo(p[0] - dir[0] * l, p[1] - dir[1] * l); ctx.lineTo(p[0] + dir[0] * l, p[1] + dir[1] * l); ctx.stroke(); ctx.restore();
          thread(ctx, [[p[0] - dir[0] * (l + 3), p[1] - dir[1] * (l + 3)], [p[0] + dir[0] * (l + 3), p[1] + dir[1] * (l + 3)]], { a: 1, w: 1.25 });
        }
      }
      // tassel and bead
      const td = smooth(KNOT1 - 0.6, KNOT1 + 0.6, T);
      if (td > 0) {
        const tb = place([0, 2.45 * KS]);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (const s of TASSEL) {
          const len = 190 * s.l * td, sw = 8 * Math.sin(T * 1.4 + s.ph);
          ctx.strokeStyle = `rgba(255,60,80,${0.45 * td})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(tb[0] + s.dx * 6, tb[1] + 18); ctx.quadraticCurveTo(tb[0] + s.dx * 20 + sw * 0.5, tb[1] + 18 + len * 0.5, tb[0] + s.dx * 34 + sw, tb[1] + 18 + len); ctx.stroke();
        }
        glow(ctx, tb[0], tb[1] + 6, 30, [255, 200, 120], 0.6 * td, 0.3);
        ctx.fillStyle = `rgba(255,214,140,${td})`; ctx.beginPath(); ctx.arc(tb[0], tb[1] + 6, 10, 0, 2 * PI); ctx.fill();
        ctx.restore();
      }
    }
    // the two lights
    drawOrb(ctx, A, [255, 205, 140], 1, T, flare);
    drawOrb(ctx, B, [255, 140, 165], 1, T + 0.4, flare);
    // the sky: they become a binary pair circling each other
    if (sky > 0) {
      const ph = (T - SKY_IN) * 0.55, cx = 960, cy = 300 + 200 * (1 - sky), rr = 60;
      const p1: P2 = [cx + Math.cos(ph) * rr, cy + Math.sin(ph) * rr * 0.55], p2: P2 = [cx - Math.cos(ph) * rr, cy - Math.sin(ph) * rr * 0.55];
      const mid: P2 = [cx + Math.sin(ph) * 16, cy - 30];
      thread(ctx, spline([p1, mid, p2], 30), { a: sky * 0.8, w: 0.8, T, pulses: 1, pulseSpeed: 60 });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, p1[0], p1[1], 60, [255, 205, 140], 0.5 * sky, 0.2); glow(ctx, p1[0], p1[1], 7, [255, 250, 240], sky, 0.5);
      glow(ctx, p2[0], p2[1], 60, [255, 140, 165], 0.5 * sky, 0.2); glow(ctx, p2[0], p2[1], 7, [255, 245, 245], sky, 0.5);
      ctx.restore();
    }
    bloom(ctx, b1, 0.6, 5);
    bloom(ctx, b2, 0.5, 13);
    if (sky > 0) drawMoon(ctx, 1500, 210, 92, sky, 1.2, 'disc');
    if (flare > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, W / 2, H / 2, 1400, [255, 225, 200], 0.5 * flare, 0.2); ctx.restore(); }
    const black = smooth(FILM_END10 - 1.6, FILM_END10, T);
    if (black > 0) { ctx.fillStyle = `rgba(0,0,0,${black})`; ctx.fillRect(0, 0, W, H); }
  };
  return <AbsoluteFill style={{ opacity: smooth(S4_IN, S4_IN + 0.2, T) }}><Canvas9 T={T} draw={draw} /></AbsoluteFill>;
};
export { MEET, TAUT, KNOT0, KNOT1, RISE0 };
