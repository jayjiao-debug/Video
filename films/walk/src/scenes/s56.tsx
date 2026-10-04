import React from 'react';
import {makeCam} from '../cam';
import {b, clamp, easeInOut, easeOut, inOut, keys, mulberry, prog} from '../lib';
import {bird, C, dot, glow, Light, SERIF, textPoints, waffle} from '../look';
import {BigNum, Caption, Credit, Tag} from '../ui';
import {at, H3 as W3, homeBy} from '../walks';

/* S5, the build (b128–b157): the plane grows a third axis into a lattice of points; 100 birds (few
   enough to follow, each with a short trail) leave one nest; the share that has come back climbs fast, then slower, then freezes (b152–b157).
   S6, the drop (b157–b185): the frozen birds (plus thousands more from off frame) fly into "34%",
   landing exactly on b161; Kakutani's line; the number re-forms as 19% (4D) and 14% (5D). */
const P = [0, 0, 0, 0];
const Q = [0, 0, 0, 0];
const V = [0, 0, 0];

const stepS5 = (T: number) => keys(T, [[b(136), 0], [b(140), 15], [b(144), 60], [b(152), 300], [b(156), 600]], (x) => x);
const camS5 = (T: number) => {
  const phi = 0.4 + (T - b(128)) * 0.07;
  const R = keys(T, [[b(128), 36], [b(136), 24], [b(152), 60], [b(157), 64]], easeInOut);
  return makeCam([R * Math.sin(phi), R * 0.32, R * Math.cos(phi)], [0, -1, 0], 42, 1080, 460);
};

export const S5: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(128), b(158), 0.7, 0.01);
  const s = stepS5(T);
  const cam = camS5(T);
  const grow = easeInOut(prog(T, b(129), b(134))); // the third axis
  const flat = easeOut(prog(T, b(128), b(130)));
  const lat = 1 - prog(T, b(137), b(142)) * 0.7;
  const draw = (ctx: CanvasRenderingContext2D) => {
    // lattice: a plane first, then layers above and below
    for (let x = -10; x <= 10; x += 2)
      for (let y = -10; y <= 10; y += 2)
        for (let z = -10; z <= 10; z += 2) {
          const layer = Math.abs(y) / 10;
          const a = y === 0 ? flat : clamp(grow * 1.6 - layer);
          if (a <= 0.01) continue;
          cam.project(x, y * grow, z, P);
          if (P[3] > 0) dot(ctx, P[0], P[1], clamp(P[3] * 0.0022, 0.7, 2), 0.32 * a * lat * fin);
        }
    // the vertical axis
    if (grow > 0) {
      cam.project(0, -12 * grow, 0, P);
      cam.project(0, 12 * grow, 0, Q);
      ctx.strokeStyle = `rgba(241,197,109,${0.6 * lat * fin})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(P[0], P[1]);
      ctx.lineTo(Q[0], Q[1]);
      ctx.stroke();
    }
    // nest
    cam.project(0, 0, 0, P);
    glow(ctx, P[0], P[1], 10, 0.8 * fin, true);
    if (T < b(136)) return;
    const out = clamp((T - b(136)) / 0.6);
    // trails (normal blending: no white pile-up)
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    for (let i = 0; i < W3.n; i++) {
      const home = W3.back[i] >= 0 && W3.back[i] <= s;
      ctx.strokeStyle = home ? `rgba(241,197,109,${0.4 * out * fin})` : `rgba(180,192,222,${0.28 * out * fin})`;
      ctx.beginPath();
      for (let k = 0; k <= 16; k++) {
        at(W3, i, Math.max(0, s - 16 + k), V);
        cam.project(V[0], V[1], V[2], P);
        if (k === 0) ctx.moveTo(P[0], P[1]);
        else ctx.lineTo(P[0], P[1]);
      }
      ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < W3.n; i++) {
      const home = W3.back[i] >= 0 && W3.back[i] <= s;
      at(W3, i, Math.max(0, s - 0.6), V);
      cam.project(V[0], V[1], V[2], Q);
      at(W3, i, s, V);
      cam.project(V[0], V[1], V[2], P);
      if (P[3] === 0) continue;
      const sz = clamp(P[3] * 0.012, 2.6, 6);
      bird(ctx, P[0], P[1], sz, Math.atan2(P[1] - Q[1], P[0] - Q[0]), (home ? 1 : 0.6) * out * fin, s * 3 + i);
      if (home) glow(ctx, P[0], P[1], 3, 0.5 * out * fin);
    }
    // a ring pulses at the nest for every new return
    cam.project(0, 0, 0, P);
    for (let i = 0; i < W3.n; i++) {
      const k = W3.back[i];
      if (k < 0) continue;
      const u = (s - k) / Math.max(3, s * 0.08);
      if (u < 0 || u > 1) continue;
      ctx.strokeStyle = `rgba(255,226,160,${(1 - u) * 0.4 * fin})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(P[0], P[1], 10 + u * 46, 0, Math.PI * 2);
      ctx.stroke();
    }
    waffle(ctx, 140, 620, (i) => (W3.back[i] >= 0 && W3.back[i] <= s ? 1 : 0), fin * prog(T, b(137), b(138.5)));
  };
  const pct = Math.round((100 * homeBy(W3, s)) / W3.n);
  cam.project(0, 12 * grow, 0, P);
  const up = inOut(T, b(130), b(136.5), 0.5, 0.4) * fin;
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.95} />
      <Tag x={P[0]} y={P[1] - 40} text="↑ 上" anchor="center" size={26} color={C.gold} o={up} />
      <BigNum T={T} at={b(137)} out={b(157)} x={130} y={300} value={`${pct}%`} zh="飞回过鸟巢" en="BIRDS THAT RETURNED" />
      <Tag x={130} y={556} text={`第 ${Math.round(s)} 步`} size={24} color={C.grey} o={inOut(T, b(137), b(157), 0.4, 0.3)} />
      <Credit T={T} at={b(137)} out={b(157)} text="模拟 · 100 个三维随机游走 · 600 步" />
    </>
  );
};

// ------------------------------------------------------------------ S6
const N = 4800;
const FONT = `900 400px ${SERIF}`;
const START = (() => {
  // birds 0..1599 start where S5 froze them; the rest come in from beyond the frame
  const cam = camS5(b(157));
  const r = mulberry(5);
  const out = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    if (i < W3.n) {
      at(W3, i, 600, V);
      cam.project(V[0], V[1], V[2], P);
      out[i * 2] = P[3] > 0 ? P[0] : 960;
      out[i * 2 + 1] = P[3] > 0 ? P[1] : 540;
    } else {
      const a = r() * Math.PI * 2;
      const d = 1100 + r() * 700;
      out[i * 2] = 960 + Math.cos(a) * d;
      out[i * 2 + 1] = 400 + Math.sin(a) * d * 0.7;
    }
  }
  return out;
})();
const RND = (() => {
  const r = mulberry(17);
  return Float32Array.from({length: N * 4}, () => r());
})();

export const S6: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(157) - 0.1, b(185), 0.01, 0.5);
  const t34 = textPoints('34%', FONT, 960, 330, N, 3);
  const t19 = textPoints('19%', FONT, 960, 330, N, 4);
  const t14 = textPoints('14%', FONT, 960, 330, N, 5);
  const m1 = easeInOut(prog(T, b(177), b(178.6)));
  const m2 = easeInOut(prog(T, b(181), b(182.6)));
  const scatter = easeInOut(prog(T, b(183.5), b(185.3)));
  const pulse = T > b(161) ? Math.exp(-(T - b(161)) * 2.5) : 0;
  const draw = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < N; i++) {
      const r0 = RND[i * 4];
      const r1 = RND[i * 4 + 1];
      const r2 = RND[i * 4 + 2];
      // target (with morphs)
      let tx = t34[i][0];
      let ty = t34[i][1];
      if (m1 > 0) {
        tx += (t19[i][0] - tx) * m1;
        ty += (t19[i][1] - ty) * m1;
      }
      if (m2 > 0) {
        tx += (t14[i][0] - tx) * m2;
        ty += (t14[i][1] - ty) * m2;
      }
      // flight in, landing on b161
      const d = r0 * 1.1;
      const u = easeInOut(prog(T, b(157) + d, b(161)));
      const sx = START[i * 2];
      const sy = START[i * 2 + 1];
      const mx = (sx + tx) / 2 + (r1 - 0.5) * 420;
      const my = (sy + ty) / 2 + (r2 - 0.5) * 320;
      const x0 = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * mx + u * u * tx;
      const y0 = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * my + u * u * ty;
      const dx = 2 * (1 - u) * (mx - sx) + 2 * u * (tx - mx);
      const dy = 2 * (1 - u) * (my - sy) + 2 * u * (ty - my);
      const ph = r1 * 6.28;
      const sh = u >= 1 ? 2.2 : 0;
      let x = x0 + sh * Math.sin(T * (0.6 + r2) + ph);
      let y = y0 + sh * Math.cos(T * (0.6 + r2) * 1.3 + ph);
      // scatter at the end
      if (scatter > 0) {
        x += Math.cos(ph) * scatter * (300 + r0 * 900);
        y += Math.sin(ph) * scatter * (200 + r0 * 600);
      }
      const moving = u > 0 && u < 1;
      const ang = moving ? Math.atan2(dy, dx) : ph + Math.sin(T + ph) * 0.4;
      const a = (i < W3.n ? 1 : clamp((T - b(157) - d) / 0.5)) * (0.5 + 0.4 * r2) * (1 - scatter * 0.9) * fin;
      bird(ctx, x, y, 1 + r0 * 0.9, ang, a, T * 9 + ph);
    }
    if (pulse > 0.01) glow(ctx, 960, 330, 120, 0.25 * pulse * fin);
  };
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.95 + 0.7 * pulse} />
      <Caption T={T} at={b(161.4)} out={b(177)} zh="三维 · 小鸟回家的概率" en="PÓLYA'S RETURN PROBABILITY · 3D" y={560} />
      <Caption T={T} at={b(177.3)} out={b(181)} zh="四维 · 回家的概率" en="RETURN PROBABILITY · 4D" y={560} />
      <Caption T={T} at={b(181.3)} out={b(184)} zh="五维 · 回家的概率" en="RETURN PROBABILITY · 5D" y={560} />
      <Credit T={T} at={b(161.4)} out={b(169)} text="Pólya 1921 · Watson 1939：p = 0.3405" />
      <Credit T={T} at={b(169)} out={b(177)} text="角谷静夫 Shizuo Kakutani" />
      <Credit T={T} at={b(177)} out={b(185)} text="Montroll, 1956" />
    </>
  );
};
