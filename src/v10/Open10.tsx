import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Canvas9 } from '../v9/Canvas9';
import { W, H, bt, clamp, lerp, prog, easeOut, easeInOut, smooth, hash, rng, fbm1, noise1, P2, spline, thread, glow, bokeh, drawMoon, drawStars, bloom } from './eng10';

/* 《红线》 S0 the void (a thread floating up toward a moonglow) and S1 the moonlit ink mountains (定婚店). */
export const S1_IN = bt(4), S1_OUT = bt(10) + 0.9;
export const MOON_X = 1060, MOON_Y = 270, MOON_R = 140;

const R = rng(520);
const MOTES = Array.from({ length: 170 }, () => ({ x: R(), y: R(), z: R(), c: R(), ph: R() * 6.28 }));

/** the floating thread of the cold open, in screen space */
const voidThread = (T: number): P2[] => {
  const pts: P2[] = [];
  const top = lerp(-60, MOON_Y + MOON_R * 0.2, smooth(6.5, 10.2, T));
  for (let i = 0; i <= 60; i++) {
    const k = i / 60, y = lerp(1180, top, k);
    const sway = 120 * Math.sin(y / 260 + T * 0.55) * (1 - k * 0.6) + 55 * Math.sin(y / 97 - T * 0.9) + 40 * fbm1(y / 300 + T * 0.2, 3);
    const bend = lerp(0, MOON_X - 960, Math.pow(k, 2.2) * smooth(4.5, 9.5, T));
    pts.push([960 + sway * (1 - 0.7 * Math.pow(k, 3) * smooth(5, 9.5, T)) + bend, y]);
  }
  return pts;
};

const drawVoid = (ctx: CanvasRenderingContext2D, T: number, a: number) => {
  const g = ctx.createRadialGradient(960, 620, 50, 960, 540, 1100);
  g.addColorStop(0, '#120a10'); g.addColorStop(1, '#030205');
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const rise = T * 38;
  for (const m of MOTES) {
    const z = 0.2 + m.z, y = ((m.y * (H + 300) - rise * z) % (H + 300) + H + 300) % (H + 300) - 150;
    const x = m.x * W + 30 * Math.sin(T * 0.3 + m.ph);
    const r = 2 + 34 * Math.pow(m.z, 3);
    const col = m.c < 0.25 ? [255, 90, 100] : [255, 214, 170];
    if (r > 10) bokeh(ctx, x, y, r, col, 0.05 * a * (0.6 + 0.4 * Math.sin(T + m.ph)));
    else glow(ctx, x, y, r * 2, col, 0.35 * a * m.z, 0.25);
  }
  ctx.restore();
  // the moon begins to glow above
  const mg = smooth(6, 10, T) * a;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(ctx, MOON_X, MOON_Y, 700, [255, 220, 180], 0.12 * mg, 0.1);
  glow(ctx, MOON_X, MOON_Y, 260, [255, 236, 210], 0.35 * mg, 0.2);
  ctx.restore();
  thread(ctx, voidThread(T), { a, w: 1.25, T, pulses: 3, pulseSpeed: -260, draw: easeOut(prog(T, 0.15, 2.6)) });
};

/* ---------- ink mountains ---------- */
const LAYERS = [
  { base: 610, amp: 150, sc: 520, seed: 11, col: [58, 68, 98], a: 0.6, par: 0.15 },
  { base: 690, amp: 175, sc: 430, seed: 23, col: [38, 46, 74], a: 0.78, par: 0.28 },
  { base: 775, amp: 165, sc: 380, seed: 37, col: [24, 30, 52], a: 0.9, par: 0.45 },
  { base: 870, amp: 150, sc: 330, seed: 41, col: [13, 16, 30], a: 0.97, par: 0.7 },
  { base: 985, amp: 140, sc: 300, seed: 59, col: [5, 6, 12], a: 1, par: 1.0 },
];
const INN_X = 640;
/** a small inn on the ridge (定婚店), its lantern lit */
const inn = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, T: number) => {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#0a0c16';
  ctx.beginPath(); ctx.moveTo(x - 62, y - 30); ctx.quadraticCurveTo(x - 30, y - 38, x - 22, y - 58); ctx.lineTo(x + 22, y - 58); ctx.quadraticCurveTo(x + 30, y - 38, x + 62, y - 30); ctx.lineTo(x + 40, y - 34); ctx.lineTo(x - 40, y - 34); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 36, y - 34, 72, 40);
  ctx.fillRect(x - 30, y - 68, 60, 12);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(255,190,110,${0.9 * a})`; ctx.fillRect(x - 16, y - 24, 12, 14); ctx.fillRect(x + 4, y - 24, 12, 14);
  glow(ctx, x + 48, y - 28, 40 + 4 * Math.sin(T * 3), [255, 150, 80], 0.5 * a, 0.25);
  ctx.fillStyle = `rgba(255,90,70,${a})`; ctx.beginPath(); ctx.ellipse(x + 48, y - 28, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
const ridge = (x: number, L: typeof LAYERS[0]) => {
  const n = fbm1(x / L.sc, L.seed, 6);
  const peak = Math.pow(Math.max(0, Math.sin(x / (L.sc * 1.7) + L.seed)), 3);
  return L.base - L.amp * (0.55 + 0.6 * n + 0.5 * peak);
};

let inkMoon = { y: MOON_Y, a: 0 };
const drawInk = (ctx: CanvasRenderingContext2D, T: number, a: number) => {
  const t = T - S1_IN;
  const tilt = 1080 * easeInOut(prog(T, bt(9) + 0.4, bt(10) + 0.6)); // camera tilts down to the water
  const drift = t * 26;
  // sky
  const sky = ctx.createLinearGradient(0, -tilt, 0, H - tilt + 400);
  sky.addColorStop(0, '#05081a'); sky.addColorStop(0.55, '#10162c'); sky.addColorStop(1, '#1a2038');
  ctx.globalAlpha = a; ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  drawStars(ctx, T, 0.45 * a, -drift * 0.1, -tilt * 0.4);
  // moon
  const my = MOON_Y - tilt * 0.55 + 10 * Math.sin(t * 0.2);
  drawMoon(ctx, MOON_X, my, MOON_R, a, 1.1, 'halo');
  inkMoon = { y: my, a };
  // the thread hangs from the moon down into the valley
  const tp: P2[] = [];
  for (let i = 0; i <= 50; i++) {
    const k = i / 50;
    const ey = ridge(INN_X + drift * LAYERS[3].par, LAYERS[3]) - tilt * (0.5 + LAYERS[3].par * 0.6) - 30;
    const x = lerp(MOON_X - 10, INN_X + 48, Math.pow(k, 0.9)) + 90 * Math.sin(k * 3.2 + t * 0.5) * Math.sin(k * Math.PI);
    const y = lerp(my + MOON_R * 0.6, ey, k);
    tp.push([x, y]);
  }
  // mountains back to front, with mist between
  LAYERS.forEach((L, li) => {
    const off = drift * L.par, yo = -tilt * (0.5 + L.par * 0.6);
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, ridge(x + off, L) + yo);
    ctx.lineTo(W, H + 400); ctx.lineTo(0, H + 400); ctx.closePath();
    const top = L.base - L.amp * 1.4 + yo, bot = L.base + 260 + yo;
    const gr = ctx.createLinearGradient(0, top, 0, bot);
    gr.addColorStop(0, `rgba(${L.col.join(',')},${L.a * a})`);
    gr.addColorStop(0.55, `rgba(${L.col.map((c) => c * 0.7 + 20).join(',')},${L.a * a * 0.92})`);
    gr.addColorStop(1, `rgba(${L.col.map((c) => c * 0.6 + 6).join(',')},${L.a * a})`);
    ctx.fillStyle = gr; ctx.fill();
    // ink edge: a slightly darker rim on the ridge line
    ctx.strokeStyle = `rgba(8,10,20,${0.35 * a * L.a})`; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = 0; x <= W; x += 8) { const y = ridge(x + off, L) + yo; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    // mist band in front of the layer
    const my2 = L.base + 30 + yo + 12 * Math.sin(t * 0.3 + li);
    const mg = ctx.createLinearGradient(0, my2 - 90, 0, my2 + 90);
    mg.addColorStop(0, 'rgba(200,210,235,0)'); mg.addColorStop(0.5, `rgba(200,210,235,${0.07 * a})`); mg.addColorStop(1, 'rgba(200,210,235,0)');
    ctx.fillStyle = mg; ctx.fillRect(0, my2 - 90, W, 180);
    if (li === 3) {
      inn(ctx, INN_X, ridge(INN_X + off, L) + yo + 6, a, T);
      thread(ctx, tp, { a: a * 0.95, w: 1.1, T, pulses: 2, pulseSpeed: 160, draw: easeInOut(prog(T, S1_IN + 0.3, S1_IN + 3.2)) });
    }
  });
  // the river below, with the moon's reflection (revealed by the tilt)
  const wy = H + 180 - tilt;
  if (wy < H) {
    const wg = ctx.createLinearGradient(0, wy, 0, H);
    wg.addColorStop(0, `rgba(30,38,64,${a})`); wg.addColorStop(1, `rgba(8,10,20,${a})`);
    ctx.fillStyle = wg; ctx.fillRect(0, wy, W, H - wy + 2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) {
      const yy = wy + 8 + Math.pow(i / 70, 1.4) * (H - wy);
      const w = (40 + 260 * (i / 70)) * (0.6 + 0.4 * Math.sin(T * 2 + i * 1.7));
      const xx = MOON_X - 170 + 18 * Math.sin(T * 1.3 + i);
      ctx.fillStyle = `rgba(255,236,205,${0.22 * a * (1 - i / 90)})`; ctx.fillRect(xx - w / 2, yy, w, 2 + i / 30);
    }
    // the thread's reflection
    ctx.restore();
    const rp: P2[] = Array.from({ length: 30 }, (_, i) => [760 + 30 * Math.sin(i * 0.6 + T * 2), wy + i * 14] as P2);
    thread(ctx, rp, { a: a * 0.35, w: 0.9 });
  }
};

export const OpenScene: React.FC<{ T: number }> = ({ T }) => {
  if (T > S1_OUT + 0.1) return null;
  const voidA = 1 - smooth(S1_IN - 0.9, S1_IN + 0.5, T);
  const inkA = smooth(S1_IN - 0.9, S1_IN + 0.5, T);
  const out = 1 - smooth(S1_OUT - 1.4, S1_OUT, T);
  const draw = (ctx: CanvasRenderingContext2D, b1: HTMLCanvasElement, b2: HTMLCanvasElement) => {
    ctx.fillStyle = '#030205'; ctx.fillRect(0, 0, W, H);
    if (inkA > 0) drawInk(ctx, T, inkA);
    if (voidA > 0) { ctx.save(); ctx.globalAlpha = 1; drawVoid(ctx, T, voidA); ctx.restore(); }
    bloom(ctx, b1, 0.55 - 0.25 * inkA, 5);
    bloom(ctx, b2, 0.4 - 0.2 * inkA, 12);
    if (inkA > 0) {
      drawMoon(ctx, MOON_X, inkMoon.y, MOON_R, inkA, 1, 'disc');
      for (let i = 0; i < 4; i++) {
        const y = inkMoon.y - 50 + i * 38, x0 = (((T - S1_IN) * (14 + i * 5) + i * 330) % 1500) - 350 + MOON_X - 500;
        const gr = ctx.createLinearGradient(x0 - 380, 0, x0 + 380, 0);
        gr.addColorStop(0, 'rgba(14,18,36,0)'); gr.addColorStop(0.5, `rgba(14,18,36,${0.5 * inkA})`); gr.addColorStop(1, 'rgba(14,18,36,0)');
        ctx.save(); ctx.filter = 'blur(7px)'; ctx.fillStyle = gr; ctx.fillRect(x0 - 380, y, 760, 16 + 8 * Math.sin(i * 2)); ctx.restore();
      }
    }
  };
  return <AbsoluteFill style={{ opacity: out }}><Canvas9 T={T} draw={draw} /></AbsoluteFill>;
};
