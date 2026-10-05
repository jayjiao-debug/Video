import React from 'react';
import {b, beatAt, clamp, inOut, keys, mulberry, prog} from '../lib';
import {C, glow, Light} from '../look';
import {Credit, Tag} from '../ui';

/* Applause in a theatre (schematic): ~460 seats in arcs, each person a light that flashes on every
   clap; below, the room's loudness over the last few seconds. Used twice: the cold open (scattered
   applause falls into step, the question) and S9 (the answer: in step at half the speed, then people
   speed up to be louder and the rhythm falls apart).
   Rate is in claps per music beat; phase = 2π·(beat + E(beat)) + (1 − s)·φᵢ, with E shifted so the
   in-step claps land on the music's beats. */
const SEATS = (() => {
  const r = mulberry(19);
  const out: {x: number; y: number; ph: number}[] = [];
  for (let row = 0; row < 11; row++) {
    const R = 220 + row * 44;
    const n = 26 + row * 4;
    for (let k = 0; k < n; k++) {
      const a = Math.PI * (0.18 + 0.64 * (k / (n - 1)));
      out.push({x: 960 - Math.cos(a) * R * 1.55, y: 110 + Math.sin(a) * R * 0.95, ph: r() * Math.PI * 2});
    }
  }
  return out;
})();

type Plan = {from: number; to: number; rate: [number, number][]; sync: [number, number][]; align: number};
const integrate = (p: Plan) => {
  const step = 0.01;
  const n = Math.ceil((p.to - p.from) / step) + 1;
  const e = new Float64Array(n);
  for (let k = 1; k < n; k++) e[k] = e[k - 1] + (keys(p.from + k * step, p.rate) - 1) * step;
  const k0 = Math.round((p.align - p.from) / step);
  const shift = e[k0] - Math.round(e[k0]);
  for (let k = 0; k < n; k++) e[k] -= shift;
  return (beat: number) => {
    const f = clamp((beat - p.from) / step, 0, n - 1.001);
    const a = Math.floor(f);
    return e[a] + (e[a + 1] - e[a]) * (f - a);
  };
};
const theatre = (p: Plan) => {
  const E = integrate(p);
  const syncOf = (beat: number) => keys(beat, p.sync);
  const phaseOf = (i: number, T: number) => {
    const bt = beatAt(T);
    return 2 * Math.PI * (bt + E(bt)) + (1 - syncOf(bt)) * SEATS[i].ph;
  };
  const clap = (i: number, T: number) => {
    const th = phaseOf(i, T);
    const u = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.exp(-u * 1.6) + Math.exp(-(2 * Math.PI - u) * 4); // a few frames each, never a one-frame strobe
  };
  const draw = (ctx: CanvasRenderingContext2D, T: number, a: number, wave: number) => {
    ctx.strokeStyle = `rgba(241,197,109,${0.5 * a})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(960, 110, 300, 60, 0, 0.1, Math.PI - 0.1);
    ctx.stroke();
    for (let i = 0; i < SEATS.length; i++) {
      const f = clap(i, T);
      glow(ctx, SEATS[i].x, SEATS[i].y, 2.6, (0.12 + 0.8 * f) * a, f > 0.5);
    }
    if (wave <= 0.003) return;
    const x0 = 260;
    const x1 = 1660;
    const y0 = 760;
    ctx.strokeStyle = `rgba(241,197,109,${0.85 * a * wave})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let k = 0; k <= 360; k++) {
      const t = T - 5 + (k / 360) * 5;
      let v = 0;
      if (t > b(p.from)) for (let i = 0; i < SEATS.length; i += 4) v += clap(i, t);
      v /= SEATS.length / 4;
      const x = x0 + (k / 360) * (x1 - x0);
      if (k === 0) ctx.moveTo(x, y0 - v * 120);
      else ctx.lineTo(x, y0 - v * 120);
    }
    ctx.stroke();
  };
  return {draw, syncOf, phaseOf, seats: SEATS};
};

// ------------------------------------------------------------------ the cold open (b0 → b31)
export const OPEN = theatre({from: -2, to: 33, rate: [[0, 2], [8, 2], [11, 1], [33, 1]], sync: [[7.5, 0], [14, 1]], align: 20});
export const S1: React.FC<{T: number}> = ({T}) => {
  const out = 1 - prog(T, b(31) + 0.05, b(31) + 0.45);
  const pulse = T > b(31) - 0.05 ? Math.exp(-(T - b(31)) * 6) : 0;
  const draw = (ctx: CanvasRenderingContext2D) => {
    OPEN.draw(ctx, T, out * clamp(T / 0.4), 1);
    if (pulse > 0.01) glow(ctx, 960, 420, 280, 0.3 * pulse);
  };
  const bt = beatAt(T);
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={1 + 0.8 * pulse} />
      <Tag x={260} y={790} text="全场的掌声（响度）" size={20} color={C.grey} o={out * prog(T, 0.5, 1.5)} />
      <Tag x={1660} y={584} text={OPEN.syncOf(bt) > 0.6 ? '整齐了' : '各拍各的'} anchor="right" size={30} color={OPEN.syncOf(bt) > 0.6 ? C.gold : C.ink} o={out * inOut(T, 1, b(31), 0.5, 0.3)} />
    </>
  );
};

// ------------------------------------------------------------------ S9, the answer (b241 → b273)
export const ANSWER = theatre({from: 241, to: 274, rate: [[241, 2], [248.5, 2], [249.5, 1], [257, 1], [264, 1.8], [273, 2]], sync: [[248.5, 0], [250.5, 1], [257, 1], [262, 0.35], [266, 0]], align: 253});
export const S9: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(241), b(273), 0.5, 0.5);
  const draw = (ctx: CanvasRenderingContext2D) => ANSWER.draw(ctx, T, fin, 1);
  const bt = beatAt(T);
  const s = ANSWER.syncOf(bt);
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.95} />
      <Tag x={260} y={790} text="全场的掌声（响度）" size={20} color={C.grey} o={fin * prog(T, b(242), b(243))} />
      <Tag x={1660} y={584} text={s > 0.6 ? '整齐 · 慢一半' : bt > 257 ? '想更响 → 越拍越快' : '各拍各的'} anchor="right" size={30} color={s > 0.6 ? C.gold : C.ink} o={fin * inOut(T, b(242), b(273), 0.5, 0.4)} />
      <Credit T={T} at={b(242)} out={b(273)} text="Néda et al., Nature 403, 2000 · 示意" />
    </>
  );
};
