import React from 'react';
import {b, clamp, easeInOut, inOut, keys, mulberry, prog} from '../lib';
import {C, dot, glow, Light} from '../look';
import {Chapter, Credit, Tag} from '../ui';

/* S8, Brownian motion (b209–b241). A microscope field (a gold reticle). 1827: particles from inside
   pollen grains jiggle; then rock dust (angular shards) jiggles too. 1905: zoom onto one particle,
   molecules (tiny dots) striking it from every side, each hit a spark. 1908: Perrin's way of
   recording it: the position marked at equal intervals and joined by straight lines. */
const CX = 960;
const CY = 440;
const RAD = 380;
const HZ = 30; // random-walk samples per second

/** a smoothed Gaussian walk sampled at HZ, seed per particle */
const brown = (seed: number, n: number, sd: number) => {
  const r = mulberry(seed);
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  let x = 0;
  let y = 0;
  for (let i = 0; i < n; i++) {
    const g1 = Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
    const g2 = Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
    x += g1 * sd;
    y += g2 * sd;
    // a weak pull home keeps it in the field
    x *= seed === 200 ? 0.99 : 0.997;
    y *= seed === 200 ? 0.99 : 0.997;
    xs[i] = x;
    ys[i] = y;
  }
  return {xs, ys};
};
const N_SAMPLES = 40 * HZ;
const PARTS = Array.from({length: 9}, (_, i) => {
  const r = mulberry(100 + i);
  return {x: i === 0 ? -20 : (r() - 0.5) * 520, y: i === 0 ? 10 : (r() - 0.5) * 420, w: brown(200 + i, N_SAMPLES, i === 0 ? 3.1 : 2.4), rot: r() * 6.28, shape: Array.from({length: 7}, () => 0.6 + r() * 0.6), size: 0.8 + r() * 0.5};
});
const posAt = (p: (typeof PARTS)[number], t: number) => {
  const f = clamp(t * HZ, 0, N_SAMPLES - 1.001);
  const i = Math.floor(f);
  const k = f - i;
  return [p.x + p.w.xs[i] + (p.w.xs[i + 1] - p.w.xs[i]) * k, p.y + p.w.ys[i] + (p.w.ys[i + 1] - p.w.ys[i]) * k];
};
const MOLS = (() => {
  const r = mulberry(55);
  return Array.from({length: 700}, () => ({x: r() * 2000, y: r() * 2000, vx: (r() - 0.5) * 900, vy: (r() - 0.5) * 900}));
})();

export const S8: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(209), b(241), 0.45, 0.45);
  const t = T - b(209);
  const rock = easeInOut(prog(T, b(216.5), b(217.5)));
  const zoom = keys(T, [[b(224.5), 1], [b(226.5), 2.6], [b(232.5), 2.6], [b(234), 1.15]], easeInOut);
  const perrin = prog(T, b(233), b(234));
  const hero = PARTS[0];
  const hp = posAt(hero, t);
  const fx = keys(T, [[b(224.5), 0], [b(226.5), hp[0]], [b(232.5), hp[0]], [b(234), 0]], easeInOut);
  const fy = keys(T, [[b(224.5), 0], [b(226.5), hp[1]], [b(232.5), hp[1]], [b(234), 0]], easeInOut);
  const toS = (x: number, y: number) => [CX + (x - fx) * zoom, CY + (y - fy) * zoom];
  const draw = (ctx: CanvasRenderingContext2D) => {
    const a = fin;
    // the field
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, RAD);
    g.addColorStop(0, `rgba(60,70,100,${0.16 * a})`);
    g.addColorStop(1, `rgba(60,70,100,${0.04 * a})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(CX, CY, RAD, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, RAD - 2, 0, Math.PI * 2);
    ctx.clip();
    // molecules: fast tiny dots (visible once we zoom in)
    const mo = keys(T, [[b(224.5), 0.18], [b(226.5), 0.8], [b(232.5), 0.8], [b(234), 0.18]]);
    for (const m of MOLS) {
      const x = (((m.x + m.vx * t) % 2000) + 2000) % 2000 - 1000;
      const y = (((m.y + m.vy * t) % 2000) + 2000) % 2000 - 1000;
      const s = toS(x / 2.2, y / 2.2);
      dot(ctx, s[0], s[1], 0.9 * Math.min(zoom, 1.6), mo * 0.5 * a);
    }
    // particles
    PARTS.forEach((p, i) => {
      const q = posAt(p, t);
      const s = toS(q[0], q[1]);
      const r = (i === 0 ? 16 : 11) * p.size * zoom;
      const o = (i === 0 ? 1 : 1 - perrin * 0.75) * a;
      // pollen particle: soft oblong; rock: angular shard
      if (rock < 1) {
        ctx.save();
        ctx.translate(s[0], s[1]);
        ctx.rotate(p.rot);
        const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.6);
        gg.addColorStop(0, `rgba(255,236,190,${0.9 * o * (1 - rock)})`);
        gg.addColorStop(0.6, `rgba(241,197,109,${0.35 * o * (1 - rock)})`);
        gg.addColorStop(1, 'rgba(241,197,109,0)');
        ctx.fillStyle = gg;
        ctx.scale(1.5, 0.8);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (rock > 0) {
        ctx.save();
        ctx.translate(s[0], s[1]);
        ctx.rotate(p.rot + t * 0.2);
        ctx.fillStyle = `rgba(241,197,109,${0.28 * o * rock})`;
        ctx.strokeStyle = `rgba(255,226,160,${0.85 * o * rock})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        p.shape.forEach((k, j) => {
          const ang = (j / p.shape.length) * Math.PI * 2;
          const x = Math.cos(ang) * r * k;
          const y = Math.sin(ang) * r * k;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    });
    // hits on the hero particle (1905)
    const hit = keys(T, [[b(225), 0], [b(226.5), 1], [b(232.5), 1], [b(233.5), 0]]);
    if (hit > 0) {
      const r = mulberry(Math.floor(T * 30));
      const s = toS(hp[0], hp[1]);
      const R = 16 * hero.size * zoom * 0.9;
      for (let k = 0; k < 9; k++) {
        const ang = r() * Math.PI * 2;
        const x = s[0] + Math.cos(ang) * R;
        const y = s[1] + Math.sin(ang) * R;
        glow(ctx, x, y, 2.4, 0.7 * hit * a, true);
        ctx.strokeStyle = `rgba(255,236,190,${0.4 * hit * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * 22, y + Math.sin(ang) * 22);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
    // Perrin's record: equal-interval marks joined by straight lines
    if (perrin > 0) {
      const t0 = b(233) - b(209) - 6;
      const dt = 0.25;
      const n = Math.floor((t - t0) / dt);
      ctx.strokeStyle = `rgba(255,214,140,${0.85 * perrin * a})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let k = 0; k <= n; k++) {
        const q = posAt(hero, t0 + k * dt);
        const s = toS(q[0], q[1]);
        if (k === 0) ctx.moveTo(s[0], s[1]);
        else ctx.lineTo(s[0], s[1]);
      }
      ctx.stroke();
      for (let k = 0; k <= n; k++) {
        const q = posAt(hero, t0 + k * dt);
        const s = toS(q[0], q[1]);
        dot(ctx, s[0], s[1], 2.6, 0.9 * perrin * a);
      }
    }
    ctx.restore();
    // reticle
    ctx.strokeStyle = `rgba(241,197,109,${0.6 * a})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(CX, CY, RAD, 0, Math.PI * 2);
    ctx.stroke();
    for (let k = 0; k < 72; k++) {
      const ang = (k / 72) * Math.PI * 2;
      const l = k % 6 === 0 ? 14 : 6;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(ang) * RAD, CY + Math.sin(ang) * RAD);
      ctx.lineTo(CX + Math.cos(ang) * (RAD - l), CY + Math.sin(ang) * (RAD - l));
      ctx.stroke();
    }
  };
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.9} />
      <Chapter T={T} at={b(209)} out={b(225)} text="1827 · 伦 敦" />
      <Chapter T={T} at={b(225)} out={b(233)} text="1905 · 伯 尔 尼" />
      <Chapter T={T} at={b(233)} out={b(241)} text="1908 · 巴 黎" />
      <Tag x={1420} y={300} text={rock < 0.5 ? '花粉里的微粒' : '岩石粉末'} size={26} color={C.gold} o={inOut(T, b(210), b(224.5), 0.5, 0.4) * fin} />
      <Tag x={1420} y={340} text="显微镜下 · 示意" size={20} color={C.grey} o={inOut(T, b(210), b(224.5), 0.5, 0.4) * fin} />
      <Tag x={1420} y={300} text="被分子撞来撞去" size={26} color={C.gold} o={inOut(T, b(226.5), b(232.5), 0.5, 0.4) * fin} />
      <Tag x={1420} y={300} text="每隔相同时间记一个点" size={26} color={C.gold} o={inOut(T, b(234), b(241), 0.5, 0.4) * fin} />
      <Credit T={T} at={b(210)} out={b(225)} text="Robert Brown, 1828" />
      <Credit T={T} at={b(225)} out={b(233)} text="Einstein, Annalen der Physik 17, 1905" />
      <Credit T={T} at={b(233)} out={b(241)} text="Jean Perrin, 1909 · Nobel Prize in Physics 1926" />
    </>
  );
};
