import React from 'react';
import {b, clamp, easeInOut, easeOut, inOut, keys, mulberry, prog} from '../lib';
import {C, dot, glow, Light} from '../look';
import {BigNum, Credit, Tag} from '../ui';
import {at, homeBy, W1, W2} from '../walks';

/* S3 (b64–b96). One dimension: the reference's thin gold chart, 400 walks fanning out over 900
   steps inside a ±√n envelope; each first return drops a bright bead on the axis; a big counter on
   the left. Then two dimensions: the chart dissolves into 2,000 walkers spreading from home, the
   ones that have been back glowing brighter. */
const V = [0, 0, 0];
const OX = 560;
const OY = 450;
const XW = 1220; // 900 steps
const YS = 4.2; // px per unit

const JIT = (() => {
  const r = mulberry(77);
  return Float32Array.from({length: W2.n * 2}, () => (r() - 0.5) * 0.8);
})();

export const S3: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(64), b(96), 0.45, 0.45);
  const one = 1 - prog(T, b(79.5), b(81));
  const two = prog(T, b(80), b(81.5));
  const s1 = 900 * easeInOut(prog(T, b(64.5), b(77)));
  const s2 = 900 * Math.pow(prog(T, b(80.5), b(95)), 1.6);
  const G = clamp(230 / Math.sqrt(s2 + 25), 6.2, 22);
  const cx = keys(T, [[b(80), OX], [b(81.5), 1120]], easeInOut);
  const cy = keys(T, [[b(80), OY], [b(81.5), 470]], easeInOut);
  const draw = (ctx: CanvasRenderingContext2D) => {
    if (one > 0.003) {
      const a = one * fin;
      const ax = easeOut(prog(T, b(64), b(66)));
      // axes
      ctx.strokeStyle = `rgba(241,197,109,${0.7 * a})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(OX, OY);
      ctx.lineTo(OX + (XW + 40) * ax, OY);
      ctx.moveTo(OX, OY - 360 * ax);
      ctx.lineTo(OX, OY + 360 * ax);
      ctx.stroke();
      // the √n envelope
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = `rgba(241,197,109,${0.5 * a})`;
      for (const sg of [-1, 1]) {
        ctx.beginPath();
        for (let s = 0; s <= s1; s += 6) {
          const x = OX + (s / 900) * XW;
          const y = OY - sg * Math.sqrt(s) * YS;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
      // the walks
      ctx.lineWidth = 1;
      ctx.save();
      ctx.beginPath();
      ctx.rect(OX, OY - 370, XW + 60, 740);
      ctx.clip();
      for (let i = 0; i < W1.n; i++) {
        ctx.strokeStyle = `rgba(226,214,190,${0.075 * a})`;
        ctx.beginPath();
        ctx.moveTo(OX, OY);
        for (let s = 3; s <= s1; s += 3) {
          at(W1, i, s, V);
          ctx.lineTo(OX + (s / 900) * XW, OY - V[0] * YS);
        }
        at(W1, i, s1, V);
        ctx.lineTo(OX + (s1 / 900) * XW, OY - V[0] * YS);
        ctx.stroke();
        dot(ctx, OX + (s1 / 900) * XW, OY - V[0] * YS, 1.4, 0.55 * a);
      }
      ctx.restore();
      // first returns: beads on the axis
      for (let i = 0; i < W1.n; i++) {
        const k = W1.back[i];
        if (k < 0 || k > s1) continue;
        const fresh = clamp(1 - (s1 - k) / 60);
        dot(ctx, OX + (k / 900) * XW, OY, 2.2, (0.45 + 0.5 * fresh) * a);
        if (fresh > 0.5) glow(ctx, OX + (k / 900) * XW, OY, 3, 0.3 * fresh * a);
      }
      glow(ctx, OX, OY, 8, 0.7 * a, true);
    }
    if (two > 0.003) {
      const a = two * fin;
      ctx.lineWidth = 1;
      for (let i = 0; i < W2.n; i++) {
        const home = W2.back[i] >= 0 && W2.back[i] <= s2;
        ctx.strokeStyle = home ? `rgba(255,214,140,${0.16 * a * clamp(0.12 + s2 / 50)})` : `rgba(170,180,210,${0.07 * a * clamp(0.12 + s2 / 50)})`;
        ctx.beginPath();
        for (let k = 0; k <= 10; k++) {
          at(W2, i, Math.max(0, s2 - 10 + k), V);
          const x = cx + (V[0] + JIT[i * 2] * clamp(s2 / 20)) * G;
          const y = cy + (V[1] + JIT[i * 2 + 1] * clamp(s2 / 20)) * G;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        at(W2, i, s2, V);
        const crowd = clamp(0.12 + s2 / 50); // early on hundreds share a point: keep the additive pile from blowing out
        dot(ctx, cx + (V[0] + JIT[i * 2] * clamp(s2 / 20)) * G, cy + (V[1] + JIT[i * 2 + 1] * clamp(s2 / 20)) * G, home ? 1.9 : 1.3, (home ? 0.85 : 0.32) * a * crowd);
      }
      glow(ctx, cx, cy, 14, 0.75 * a, true);
    }
  };
  const p1 = Math.round((100 * homeBy(W1, s1)) / W1.n);
  const p2 = Math.round((100 * homeBy(W2, s2)) / W2.n);
  const ax = prog(T, b(65), b(66.5));
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.9} />
      {/* one dimension */}
      <BigNum T={T} at={b(65)} out={b(80)} x={110} y={300} value={`${p1}%`} zh="回到过起点" en="RETURNED TO START" />
      <Tag x={OX + XW + 20} y={OY + 14} text="步数 →" size={22} color={C.grey} o={ax * one * fin} />
      <Tag x={OX + 14} y={OY - 380} text="位置" size={22} color={C.grey} o={ax * one * fin} />
      <Tag x={OX + XW - 10} y={OY - Math.sqrt(900) * YS - 40} text="±√n" size={24} color={C.gold} o={prog(T, b(76), b(77.5)) * one * fin} />
      <Credit T={T} at={b(65)} out={b(80)} text="模拟 · 400 个一维随机游走 · 900 步" />
      {/* two dimensions */}
      <BigNum T={T} at={b(81)} out={b(96)} x={130} y={330} value={`${p2}%`} zh="已经回过一次家" en="RETURNED HOME" />
      <Tag x={130} y={610} text="一直走下去 → 100%" size={24} color={C.gold} o={inOut(T, b(90), b(96) + 0.3, 0.6, 0.3)} />
      <Credit T={T} at={b(81)} out={b(96)} text="模拟 · 2,000 个二维随机游走" />
    </>
  );
};
