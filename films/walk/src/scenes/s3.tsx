import React from 'react';
import {b, clamp, easeInOut, easeOut, inOut, keys, mulberry, prog} from '../lib';
import {C, dot, glow, Light, waffle} from '../look';
import {BigNum, Credit, Tag} from '../ui';
import {at, H1 as W1, H2 as W2, homeBy} from '../walks';

/* S3 (b64–b96). One dimension: the reference's thin gold chart, 100 walks fanning out over 900
   steps inside a ±√n envelope; a walk turns gold once it has been home, and its first return drops a
   bead on the axis. Then two dimensions: 100 walkers with short trails spreading from home; each one
   lights up gold the first time it gets back. Beside the big counter, a 10×10 grid of the same 100
   people lights one dot per return. Few enough marks to follow (thousands read as a blur). */
const V = [0, 0, 0];
const OX = 560;
const OY = 450;
const XW = 1220; // 900 steps
const YS = 4.2; // px per unit


export const S3: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(64), b(96), 0.45, 0.45);
  const one = 1 - prog(T, b(79.5), b(81));
  const two = prog(T, b(80), b(81.5));
  const s1 = 900 * easeInOut(prog(T, b(64.5), b(77)));
  const s2 = 900 * Math.pow(prog(T, b(80.5), b(95)), 1.6);
  const G = clamp(260 / Math.sqrt(s2 + 25), 7.5, 26);
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
      // the walks (normal blending, so overlaps do not pile up into a white blur)
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.rect(OX, OY - 370, XW + 60, 740);
      ctx.clip();
      ctx.lineWidth = 1.3;
      for (let i = 0; i < W1.n; i++) {
        const home = W1.back[i] >= 0 && W1.back[i] <= s1;
        ctx.strokeStyle = home ? `rgba(241,197,109,${0.32 * a})` : `rgba(190,200,225,${0.3 * a})`;
        ctx.beginPath();
        ctx.moveTo(OX, OY);
        for (let s = 3; s <= s1; s += 3) {
          at(W1, i, s, V);
          ctx.lineTo(OX + (s / 900) * XW, OY - V[0] * YS);
        }
        at(W1, i, s1, V);
        ctx.lineTo(OX + (s1 / 900) * XW, OY - V[0] * YS);
        ctx.stroke();
      }
      ctx.restore();
      for (let i = 0; i < W1.n; i++) {
        const home = W1.back[i] >= 0 && W1.back[i] <= s1;
        at(W1, i, s1, V);
        if (home) glow(ctx, OX + (s1 / 900) * XW, OY - V[0] * YS, 2.2, 0.6 * a, true);
        else dot(ctx, OX + (s1 / 900) * XW, OY - V[0] * YS, 2.6, 0.7 * a);
      }
      // first returns: beads on the axis
      for (let i = 0; i < W1.n; i++) {
        const k = W1.back[i];
        if (k < 0 || k > s1) continue;
        const fresh = clamp(1 - (s1 - k) / 40);
        dot(ctx, OX + (k / 900) * XW, OY, 3.2, (0.55 + 0.4 * fresh) * a);
        if (fresh > 0.3) glow(ctx, OX + (k / 900) * XW, OY, 4, 0.45 * fresh * a);
      }
      glow(ctx, OX, OY, 8, 0.7 * a, true);
    }
    if (two > 0.003) {
      const a = two * fin;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      for (let i = 0; i < W2.n; i++) {
        const home = W2.back[i] >= 0 && W2.back[i] <= s2;
        ctx.strokeStyle = home ? `rgba(241,197,109,${0.42 * a})` : `rgba(180,192,222,${0.32 * a})`;
        ctx.beginPath();
        for (let k = 0; k <= 24; k++) {
          at(W2, i, Math.max(0, s2 - 24 + k), V);
          const x = cx + V[0] * G;
          const y = cy + V[1] * G;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      for (let i = 0; i < W2.n; i++) {
        const home = W2.back[i] >= 0 && W2.back[i] <= s2;
        at(W2, i, s2, V);
        if (home) glow(ctx, cx + V[0] * G, cy + V[1] * G, 3.2, 0.85 * a, true);
        else dot(ctx, cx + V[0] * G, cy + V[1] * G, 3, 0.55 * a);
      }
      // a ring pulses at home for every new return
      for (let i = 0; i < W2.n; i++) {
        const k = W2.back[i];
        if (k < 0) continue;
        const u = (s2 - k) / Math.max(4, s2 * 0.08);
        if (u < 0 || u > 1) continue;
        ctx.strokeStyle = `rgba(255,226,160,${(1 - u) * 0.35 * a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 10 + u * 46, 0, Math.PI * 2);
        ctx.stroke();
      }
      glow(ctx, cx, cy, 14, 0.75 * a, true);
    }
    // the 100 people, one dot each, lit once home
    const lit = (w: typeof W1, s: number) => (i: number) => (w.back[i] >= 0 && w.back[i] <= s ? 1 : 0);
    waffle(ctx, 140, 600, lit(W1, s1), one * fin * prog(T, b(66), b(67.5)));
    waffle(ctx, 140, 620, lit(W2, s2), two * fin * prog(T, b(81), b(82.5)));
  };
  const p1 = Math.round((100 * homeBy(W1, s1)) / W1.n);
  const p2 = Math.round((100 * homeBy(W2, s2)) / W2.n);
  const ax = prog(T, b(65), b(66.5));
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.9} />
      {/* one dimension */}
      <BigNum T={T} at={b(65)} out={b(80)} x={130} y={300} value={`${p1}%`} zh="回到过起点" en="RETURNED TO START" />
      <Tag x={OX + XW + 20} y={OY + 14} text="步数 →" size={22} color={C.grey} o={ax * one * fin} />
      <Tag x={OX + 14} y={OY - 380} text="位置" size={22} color={C.grey} o={ax * one * fin} />
      <Tag x={OX + XW - 10} y={OY - Math.sqrt(900) * YS - 40} text="±√n" size={24} color={C.gold} o={prog(T, b(76), b(77.5)) * one * fin} />
      <Credit T={T} at={b(65)} out={b(80)} text="模拟 · 100 个一维随机游走 · 900 步" />
      {/* two dimensions */}
      <BigNum T={T} at={b(81)} out={b(96)} x={130} y={300} value={`${p2}%`} zh="已经回过一次家" en="RETURNED HOME" />
      <Tag x={130} y={556} text="一直走下去 → 100%" size={24} color={C.gold} o={inOut(T, b(90), b(96) + 0.3, 0.6, 0.3)} />
      <Credit T={T} at={b(81)} out={b(96)} text="模拟 · 100 个二维随机游走 · 900 步" />
    </>
  );
};
