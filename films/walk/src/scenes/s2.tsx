import React from 'react';
import {makeCam} from '../cam';
import {b, clamp, easeOut, inOut, keys, prog, stepOnBeat} from '../lib';
import {bird, C, dot, glow, Light} from '../look';
import {Chapter, Tag} from '../ui';
import {at, HOMER, LOST} from '../walks';

/* S2, the answer first (b39–b64): split screen. Left, a walker on a plane who keeps stepping back
   onto his own doorstep (each return flashes and counts). Right, a bird in a 3D lattice drifting
   away from its nest (distance read-out). One side at a time is bright: both, then the plane,
   then space. */
const P = [0, 0, 0, 0];
const Q = [0, 0, 0, 0];
const V = [0, 0, 0];

export const S2: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(39) - 0.05, b(64), 0.5, 0.45);
  const wl = keys(T, [[b(54.5), 1], [b(55.5), 0.28]]);
  const wr = keys(T, [[b(46.5), 1], [b(47.5), 0.28], [b(54.5), 0.28], [b(55.5), 1]]);
  // left: the plane
  const kL = Math.min(48, stepOnBeat(T, 39, 2));
  const camL = makeCam([-0.8, 10.5, 8.2], [0, 0, 0.4], 42, 490, 470);
  const visits = HOMER.visits.filter((v) => v <= kL + 0.5);
  // right: the bird
  const sR = clamp((T - b(39)) / (b(63.5) - b(39))) * 60;
  at(LOST.w, 0, sR, V);
  const bx = V[0];
  const by = V[1];
  const bz = V[2];
  const phi = 0.7 + (T - b(39)) * 0.12;
  const R = 26;
  const camR = makeCam([bx * 0.35 + R * Math.sin(phi), by * 0.35 + 9, bz * 0.35 + R * Math.cos(phi)], [bx * 0.35, by * 0.35, bz * 0.35], 44, 1430, 470);
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 958, 1080);
    ctx.clip();
    // grid
    ctx.lineWidth = 1.2;
    for (let a = -7; a <= 7; a++)
      for (const dir of [0, 1]) {
        camL.project(dir ? -7 : a, 0, dir ? a : -7, P);
        camL.project(dir ? 7 : a, 0, dir ? a : 7, Q);
        ctx.strokeStyle = `rgba(241,197,109,${0.13 * wl * fin})`;
        ctx.beginPath();
        ctx.moveTo(P[0], P[1]);
        ctx.lineTo(Q[0], Q[1]);
        ctx.stroke();
      }
    // home + flashes
    camL.project(0, 0, 0, P);
    glow(ctx, P[0], P[1], 7, 0.6 * wl * fin, true);
    for (const v of HOMER.visits) {
      const tv = b(39 + v / 2);
      const u = (T - tv) / 0.9;
      if (u < 0 || u > 1) continue;
      ctx.strokeStyle = `rgba(255,226,160,${(1 - u) * 0.9 * wl * fin})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(P[0], P[1], 10 + easeOut(u) * 60, 0, Math.PI * 2);
      ctx.stroke();
      glow(ctx, P[0], P[1], 16, (1 - u) * 0.8 * wl * fin, true);
    }
    // trail + walker
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.4;
    let first = true;
    for (let s = Math.max(0, kL - 14); s <= kL + 1e-6; s += 0.125) {
      at(HOMER.w, 0, s, V);
      camL.project(V[0], 0, V[1], Q);
      if (!first) {
        ctx.strokeStyle = `rgba(255,214,140,${0.75 * Math.pow(1 - (kL - s) / 14, 1.5) * wl * fin})`;
        ctx.beginPath();
        ctx.moveTo(P[0], P[1]);
        ctx.lineTo(Q[0], Q[1]);
        ctx.stroke();
      }
      P[0] = Q[0];
      P[1] = Q[1];
      first = false;
    }
    at(HOMER.w, 0, kL, V);
    camL.project(V[0], 0, V[1], P);
    glow(ctx, P[0], P[1], 10, 0.95 * wl * fin, true);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(962, 0, 958, 1080);
    ctx.clip();
    // the 3D lattice
    for (let x = -8; x <= 8; x += 2)
      for (let y = -8; y <= 8; y += 2)
        for (let z = -8; z <= 8; z += 2) {
          camR.project(x, y, z, P);
          if (P[3] > 0) dot(ctx, P[0], P[1], clamp(P[3] * 0.0022, 0.8, 2.2), 0.42 * wr * fin);
        }
    // nest
    for (const ax of [0, 1, 2]) {
      ctx.strokeStyle = `rgba(241,197,109,${0.4 * wr * fin})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const c = Math.cos(a);
        const d = Math.sin(a);
        const p = ax === 0 ? [c, d, 0] : ax === 1 ? [c, 0, d] : [0, c, d];
        camR.project(p[0], p[1], p[2], P);
        if (i === 0) ctx.moveTo(P[0], P[1]);
        else ctx.lineTo(P[0], P[1]);
      }
      ctx.stroke();
    }
    camR.project(0, 0, 0, P);
    glow(ctx, P[0], P[1], 7, 0.6 * wr * fin, true);
    // the bird's path
    ctx.lineWidth = 1.8;
    first = true;
    for (let s = 0; s <= sR + 1e-6; s += 0.2) {
      at(LOST.w, 0, s, V);
      camR.project(V[0], V[1], V[2], Q);
      if (!first) {
        ctx.strokeStyle = `rgba(255,214,140,${(0.15 + 0.6 * Math.pow(1 - (sR - s) / (sR + 1), 2)) * wr * fin})`;
        ctx.beginPath();
        ctx.moveTo(P[0], P[1]);
        ctx.lineTo(Q[0], Q[1]);
        ctx.stroke();
      }
      P[0] = Q[0];
      P[1] = Q[1];
      first = false;
    }
    at(LOST.w, 0, Math.max(0, sR - 0.3), V);
    camR.project(V[0], V[1], V[2], Q);
    camR.project(bx, by, bz, P);
    bird(ctx, P[0], P[1], 5.5, Math.atan2(P[1] - Q[1], P[0] - Q[0]), 0.95 * wr * fin, T * 20);
    glow(ctx, P[0], P[1], 5, 0.4 * wr * fin);
    ctx.restore();
    // divider
    const g = ctx.createLinearGradient(0, 160, 0, 800);
    g.addColorStop(0, 'rgba(241,197,109,0)');
    g.addColorStop(0.5, `rgba(241,197,109,${0.35 * fin})`);
    g.addColorStop(1, 'rgba(241,197,109,0)');
    ctx.fillStyle = g;
    ctx.fillRect(959.5, 160, 1, 640);
  };
  const dist = Math.hypot(bx, by, bz);
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.95} />
      <Chapter T={T} at={b(39)} out={b(47)} text="1921 · 苏 黎 世" />
      <Tag x={490} y={128} text="平面 · 2D" anchor="center" size={28} color={C.gold} o={fin * (0.35 + 0.65 * wl) * prog(T, b(40), b(41))} />
      <Tag x={1430} y={128} text="空间 · 3D" anchor="center" size={28} color={C.gold} o={fin * (0.35 + 0.65 * wr) * prog(T, b(40), b(41))} />
      <Tag x={490} y={770} text={`回到家 × ${visits.length}`} anchor="center" size={30} color={C.ink} o={fin * wl * prog(T, b(41), b(42))} />
      <Tag x={1430} y={770} text={`离巢 ${dist.toFixed(1)} 格`} anchor="center" size={30} color={C.ink} o={fin * wr * prog(T, b(41), b(42))} />
    </>
  );
};
