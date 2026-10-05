import React from 'react';
import {b, beatAt, clamp, easeInOut, easeOut, inOut, mulberry, prog} from '../lib';
import {C, glow, Light} from '../look';
import {Credit, Tag} from '../ui';
import {kuramoto, phase, pin} from '../sync';

/* S5, the build (b128–b161): 32 metronomes on one board hung from strings (Ikeguchi Lab, 2012), drawn
   in thin gold. They start out of step; the board's small sway is the only link between them; a
   counter runs through the two real minutes; they lock just as the drop lands.
   S6 (b161–b185): all in step on the beat; the board's sway is "how they talk"; the 32 bobs fly into a
   heart that beats with the music, which hands over to S7. */
const N = 32;
const T0 = b(130);
const RUN = kuramoto({n: N, seconds: b(186) - T0, hz: 1.966 / 2, spread: 0.035, K: (t) => (t < 4 ? 0 : Math.min(1.6, (t - 4) * 0.18)), seed: 12});
const pos = (i: number) => {
  const col = i % 8;
  const row = Math.floor(i / 8);
  return {x: 420 + col * 154 + row * 18, y: 700 - row * 130, s: 0.85 - row * 0.1, a: 0.45 + 0.14 * (3 - row)};
};
export const METRO = {N, T0, theta: (i: number, T: number) => theta(i, T)};
const theta = (i: number, T: number) => phase(RUN, i, T - T0) + pin(RUN, T, T0, 2, 0.5, 0.9);
const armAng = (i: number, T: number) => 0.5 * Math.sin(theta(i, T)) * clamp((T - T0) / 0.6);
const boardSway = (T: number) => {
  let s = 0;
  for (let i = 0; i < N; i++) s += Math.sin(theta(i, T));
  return (-s / N) * 9 * clamp((T - T0) / 0.6);
};

const drawMetronomes = (ctx: CanvasRenderingContext2D, T: number, a: number, bobs = 1) => {
  const sway = boardSway(T);
  // strings and board
  ctx.strokeStyle = `rgba(241,197,109,${0.35 * a})`;
  ctx.lineWidth = 1;
  for (const x of [330, 1590]) {
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x + sway, 712);
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(241,197,109,${0.7 * a})`;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(300 + sway, 712);
  ctx.lineTo(1620 + sway, 712);
  ctx.stroke();
  for (let i = 0; i < N; i++) {
    const p = pos(i);
    const x = p.x + sway;
    const y = p.y;
    const s = p.s;
    const al = p.a * a;
    ctx.strokeStyle = `rgba(241,197,109,${al})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x - 30 * s, y);
    ctx.lineTo(x - 14 * s, y - 110 * s);
    ctx.lineTo(x + 14 * s, y - 110 * s);
    ctx.lineTo(x + 30 * s, y);
    ctx.closePath();
    ctx.stroke();
    const ang = armAng(i, T);
    const py = y - 16 * s;
    ctx.strokeStyle = `rgba(255,226,170,${Math.min(1, al + 0.3 * a)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + Math.sin(ang) * 120 * s, py - Math.cos(ang) * 120 * s);
    ctx.stroke();
    if (bobs > 0) glow(ctx, x + Math.sin(ang) * 80 * s, py - Math.cos(ang) * 80 * s, 3.4 * s, 0.75 * bobs, true);
  }
};

export const S5: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(128), b(161) + 0.2, 0.7, 0.01);
  const appear = easeOut(prog(T, b(128), b(130)));
  const draw = (ctx: CanvasRenderingContext2D) => drawMetronomes(ctx, T, fin * appear);
  const secs = Math.round(120 * clamp((T - b(136)) / (b(160) - b(136))));
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.9} />
      <Tag x={960} y={110} text="32 个节拍器 · 吊起来的同一块木板" anchor="center" size={26} color={C.gold} o={inOut(T, b(129), b(144), 0.6, 0.4) * fin} />
      <div style={{position: 'absolute', right: 70, top: 120, textAlign: 'right', opacity: inOut(T, b(136), b(161), 0.5, 0.3) * fin}}>
        <div style={{fontFamily: '"Juno Sans", sans-serif', fontWeight: 800, fontSize: 84, lineHeight: 1, color: '#f6cf78', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 18px rgba(241,197,109,0.45)'}}>{secs} 秒</div>
        <div style={{fontFamily: '"Juno Sans", sans-serif', fontSize: 22, color: C.grey, marginTop: 8}}>实验里的时间（快进）</div>
      </div>
      <Credit T={T} at={b(129)} out={b(161)} text="Ikeguchi Lab, Saitama University, 2012 · 模拟示意" />
    </>
  );
};

// heart points: inside (x²+y²−1)³ − x²y³ ≤ 0
const HEART = (() => {
  const r = mulberry(91);
  const out: [number, number][] = [];
  while (out.length < 700) {
    const x = (r() - 0.5) * 2.6;
    const y = (r() - 0.5) * 2.6;
    if (Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y <= 0) out.push([x, y]);
  }
  return out;
})();

export const S6: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(161) - 0.1, b(185), 0.01, 0.45);
  const toHeart = easeInOut(prog(T, b(177), b(180)));
  const pulse = T > b(161) ? Math.exp(-(T - b(161)) * 3) : 0;
  const beatP = Math.exp(-(((beatAt(T) % 1) + 1) % 1) * 6);
  const draw = (ctx: CanvasRenderingContext2D) => {
    drawMetronomes(ctx, T, fin * (1 - toHeart), 1 - toHeart);
    // the board's sway, highlighted
    const hl = inOut(T, b(169.5), b(177), 0.5, 0.4) * fin;
    if (hl > 0.01) {
      const sway = boardSway(T);
      for (const x0 of [270, 1650]) {
        const dir = x0 < 960 ? -1 : 1;
        ctx.strokeStyle = `rgba(255,226,170,${0.9 * hl})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0 + sway, 740);
        ctx.lineTo(x0 + sway + dir * 40, 740);
        ctx.moveTo(x0 + sway + dir * 40, 740);
        ctx.lineTo(x0 + sway + dir * 28, 732);
        ctx.moveTo(x0 + sway + dir * 40, 740);
        ctx.lineTo(x0 + sway + dir * 28, 748);
        ctx.stroke();
      }
    }
    // bobs fly into a heart that beats with the music
    if (toHeart > 0.003) {
      const sc = 190 * (1 + 0.06 * beatP);
      for (let k = 0; k < HEART.length; k++) {
        const i = k % N;
        const p = pos(i);
        const ang = armAng(i, T);
        const sx = p.x + boardSway(T) + Math.sin(ang) * 80 * p.s;
        const sy = p.y - 16 * p.s - Math.cos(ang) * 80 * p.s;
        const tx = 960 + HEART[k][0] * sc;
        const ty = 400 - HEART[k][1] * sc;
        const u = clamp(toHeart * 1.3 - (k / HEART.length) * 0.3);
        glow(ctx, sx + (tx - sx) * u, sy + (ty - sy) * u, 2.2, (0.35 + 0.5 * beatP) * toHeart * fin, beatP > 0.5);
      }
    }
    if (pulse > 0.01) glow(ctx, 960, 480, 300, 0.22 * pulse * fin);
  };
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.95 + 0.6 * pulse} />
      <Tag x={960} y={790} text="木板的晃动 = 它们之间的“悄悄话”" anchor="center" size={30} color={C.gold} o={inOut(T, b(170), b(177), 0.5, 0.4) * fin} />
      <Credit T={T} at={b(161.5)} out={b(177)} text="Pantaleone, Am. J. Phys., 2002" />
    </>
  );
};
