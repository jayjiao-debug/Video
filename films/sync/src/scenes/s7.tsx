import React from 'react';
import {b, beatAt, clamp, inOut, mulberry} from '../lib';
import {C, glow, Light} from '../look';
import {Credit, Tag} from '../ui';
import {flash, kuramoto, phase, pin} from '../sync';

/* S7 (b185–b209): the heart's pacemaker. A cluster of cells (the sinoatrial node, schematic), each
   with its own rhythm, pulls itself into one beat; every beat sends a ring outward; below, an ECG line
   in thin gold draws itself: noisy at first, then a clean beat every two music beats (≈ 59 bpm). */
const N = 900;
const T0 = b(185);
const CELLS = (() => {
  const r = mulberry(61);
  return Array.from({length: N}, () => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    return [860 + Math.cos(a) * d * 300, 380 + Math.sin(a) * d * 150] as [number, number];
  });
})();
const RUN = kuramoto({n: N, seconds: b(210) - T0, hz: 1.966 / 2, spread: 0.06, K: (t) => (t < 1.5 ? 0 : Math.min(3, (t - 1.5) * 0.8)), seed: 62});
const theta = (i: number, T: number) => phase(RUN, i, T - T0) + pin(RUN, T, T0, 2, 0.4, 0.85);

/** one ECG cycle (u ∈ [0,1)): P wave, QRS spike, T wave */
const ecg = (u: number) => 0.12 * Math.exp(-Math.pow((u - 0.12) / 0.03, 2)) - 0.1 * Math.exp(-Math.pow((u - 0.2) / 0.008, 2)) + 1 * Math.exp(-Math.pow((u - 0.22) / 0.01, 2)) - 0.25 * Math.exp(-Math.pow((u - 0.245) / 0.01, 2)) + 0.25 * Math.exp(-Math.pow((u - 0.45) / 0.05, 2));

export const S7: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(185), b(209), 0.6, 0.45);
  const sync = clamp((T - b(189)) / (b(194) - b(189)));
  const draw = (ctx: CanvasRenderingContext2D) => {
    const a = fin;
    // cells
    for (let i = 0; i < N; i++) {
      const f = flash(theta(i, T));
      glow(ctx, CELLS[i][0], CELLS[i][1], 2.2, (0.15 + 0.75 * f) * a, f > 0.5);
    }
    // the beat spreading out: a ring after each synced beat
    const ph = ((beatAt(T) / 2) % 1 + 1) % 1;
    if (sync > 0.5) {
      const u = ph;
      ctx.strokeStyle = `rgba(255,226,170,${(1 - u) * 0.5 * a * sync})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(860, 380, 300 + u * 500, 150 + u * 260, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // ECG: the last 6 s, left to right
    const x0 = 200;
    const x1 = 1720;
    const y0 = 720;
    const span = 6;
    const r = mulberry(Math.floor(T * 3));
    ctx.strokeStyle = `rgba(241,197,109,${0.85 * a})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let k = 0; k <= 500; k++) {
      const t = T - span + (k / 500) * span;
      const s = clamp((t - b(189)) / (b(194) - b(189)));
      const u = ((beatAt(t) / 2) % 1 + 1) % 1;
      const v = s * ecg(u) + (1 - s) * (r() - 0.5) * 0.12;
      const x = x0 + (k / 500) * (x1 - x0);
      const y = y0 - v * 90 * (t > T0 ? 1 : 0);
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    glow(ctx, x1, y0 - ecg(ph) * 90 * sync, 4, 0.9 * a, true);
  };
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.95} />
      <Tag x={1200} y={200} text="窦房结 · 上万个起搏细胞（示意）" size={24} color={C.gold} o={inOut(T, b(186), b(201), 0.5, 0.4) * fin} />
      <Tag x={1200} y={200} text="没有“总指挥细胞”" size={30} color={C.gold} o={inOut(T, b(201), b(209), 0.5, 0.4) * fin} />
      <Credit T={T} at={b(186)} out={b(209)} text="Michaels, Matyas & Jalife 1987 · Bychkov et al. 2020" />
    </>
  );
};
