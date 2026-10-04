import React from 'react';
import {makeCam} from '../cam';
import {b, clamp, easeInOut, inOut, keys, prog} from '../lib';
import {C, dot, glow, Light} from '../look';
import {Credit, Tag} from '../ui';
import {at, LONG2, LONG3} from '../walks';

/* S7, why (b185–b209): after n steps you are typically √n away. Left, the plane: a 2,000-step walk
   inside its √n ring, every footprint glowing brighter each time it is stepped on again. Right
   (from b201), space: the same number of steps inside a √n sphere: a thin thread, footprints almost
   never stacked. Read-outs give the simulated average visits per spot. */
const P = [0, 0, 0, 0];
const Q = [0, 0, 0, 0];
const V = [0, 0, 0];
const L = {x: 520, y: 440, g: 6.4};
const RX = 1400;

const count2 = new Int16Array(301 * 301);

export const S7: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(185), b(209), 0.45, 0.45);
  const sL = Math.round(2000 * easeInOut(prog(T, b(185.5), b(198))));
  const sR = Math.round(2000 * easeInOut(prog(T, b(201), b(207))));
  const wl = keys(T, [[b(200.5), 1], [b(201.5), 0.3]]);
  const wr = prog(T, b(200.5), b(201.5));
  const stack = keys(T, [[b(192.5), 0.55], [b(194), 1]]);
  // left: visits per spot
  count2.fill(0);
  let distinct2 = 0;
  for (let k = 0; k <= sL; k++) {
    const j = (LONG2.pos[k * 2] + 150) * 301 + LONG2.pos[k * 2 + 1] + 150;
    if (count2[j] === 0) distinct2++;
    count2[j]++;
  }
  const seen3 = new Set<number>();
  for (let k = 0; k <= sR; k++) seen3.add((LONG3.pos[k * 3] + 200) * 160000 + (LONG3.pos[k * 3 + 1] + 200) * 400 + LONG3.pos[k * 3 + 2] + 200);
  const avg2 = (sL + 1) / distinct2;
  const avg3 = (sR + 1) / seen3.size;
  const phi = 0.3 + (T - b(201)) * 0.25;
  const cam = makeCam([230 * Math.sin(phi), 60, 230 * Math.cos(phi)], [0, 0, 0], 40, RX, 440);
  const draw = (ctx: CanvasRenderingContext2D) => {
    const a = wl * fin;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 955, 1080);
    ctx.clip();
    // the plane's footprints
    for (let j = 0; j < count2.length; j++) {
      const c = count2[j];
      if (!c) continue;
      const x = L.x + (Math.floor(j / 301) - 150) * L.g;
      const y = L.y + ((j % 301) - 150) * L.g;
      dot(ctx, x, y, 1.6 + Math.min(c, 8) * 0.25, clamp(0.12 + 0.11 * c * stack) * a);
    }
    // recent trail + head
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = `rgba(255,214,140,${0.5 * a})`;
    ctx.beginPath();
    for (let k = Math.max(0, sL - 40); k <= sL; k++) {
      const x = L.x + LONG2.pos[k * 2] * L.g;
      const y = L.y + LONG2.pos[k * 2 + 1] * L.g;
      if (k === Math.max(0, sL - 40)) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    glow(ctx, L.x + LONG2.pos[sL * 2] * L.g, L.y + LONG2.pos[sL * 2 + 1] * L.g, 6, 0.9 * a, true);
    glow(ctx, L.x, L.y, 7, 0.6 * a, true);
    // √n ring
    ctx.strokeStyle = `rgba(241,197,109,${0.7 * a})`;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.arc(L.x, L.y, Math.sqrt(sL) * L.g, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    if (wr <= 0.003) return;
    const ar = wr * fin;
    // the sphere: outline + three great circles
    const rad = Math.sqrt(Math.max(1, sR));
    ctx.lineWidth = 1.2;
    for (const ax of [0, 1, 2]) {
      ctx.strokeStyle = `rgba(241,197,109,${0.28 * ar})`;
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const t = (i / 72) * Math.PI * 2;
        const c = rad * Math.cos(t);
        const d = rad * Math.sin(t);
        const p = ax === 0 ? [c, d, 0] : ax === 1 ? [c, 0, d] : [0, c, d];
        cam.project(p[0], p[1], p[2], P);
        if (i === 0) ctx.moveTo(P[0], P[1]);
        else ctx.lineTo(P[0], P[1]);
      }
      ctx.stroke();
    }
    cam.project(0, 0, 0, P);
    ctx.strokeStyle = `rgba(241,197,109,${0.7 * ar})`;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.arc(P[0], P[1], rad * P[3], 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    glow(ctx, P[0], P[1], 7, 0.6 * ar, true);
    // the thread
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = `rgba(255,214,140,${0.42 * ar})`;
    ctx.beginPath();
    for (let k = 0; k <= sR; k++) {
      cam.project(LONG3.pos[k * 3], LONG3.pos[k * 3 + 1], LONG3.pos[k * 3 + 2], Q);
      if (k === 0) ctx.moveTo(Q[0], Q[1]);
      else ctx.lineTo(Q[0], Q[1]);
    }
    ctx.stroke();
    at(LONG3, 0, sR, V);
    cam.project(V[0], V[1], V[2], Q);
    glow(ctx, Q[0], Q[1], 6, 0.9 * ar, true);
  };
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.9} />
      <Tag x={L.x} y={92} text="平面 · 2D" anchor="center" size={28} color={C.gold} o={fin * (0.35 + 0.65 * wl)} />
      <Tag x={RX} y={92} text="空间 · 3D" anchor="center" size={28} color={C.gold} o={fin * wr} />
      <Tag x={L.x + Math.sqrt(sL) * L.g * 0.72 + 12} y={L.y - Math.sqrt(sL) * L.g * 0.72 - 40} text="√n" size={30} color={C.gold} o={fin * wl * prog(T, b(186.5), b(188))} />
      <Tag x={L.x} y={770} text={`平均每处踩了 ${avg2.toFixed(1)} 次`} anchor="center" size={30} color={C.ink} o={fin * (0.35 + 0.65 * wl) * prog(T, b(193), b(194.5))} />
      <Tag x={RX} y={770} text={`平均每处踩了 ${avg3.toFixed(1)} 次`} anchor="center" size={30} color={C.ink} o={fin * wr * prog(T, b(202), b(203.5))} />
      <Credit T={T} at={b(186)} out={b(209)} text="直觉解释 · 模拟 2,000 步" />
    </>
  );
};
