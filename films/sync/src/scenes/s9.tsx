import React from 'react';
import {b, beatAt, clamp, inOut, keys, mulberry, prog} from '../lib';
import {C, glow, Light} from '../look';
import {Credit, Tag} from '../ui';

/* S9 (b241–b273): applause in a theatre (schematic): ~460 seats in arcs, each person a light that
   flashes on every clap. Fast and scattered → falls into step at half the speed (on the beat) →
   people speed up to be louder → the rhythm falls apart. Below, the room's loudness over the last
   few seconds: a smear of noise, then clean tall beats, then noise again.
   Rate is in claps per music beat; phase = 2π·(beat + E(beat)) + (1 − s)·φᵢ. */
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
const rate = (beat: number) => keys(beat, [[241, 2], [248.5, 2], [249.5, 1], [257, 1], [264, 1.8], [273, 2]]);
const syncOf = (beat: number) => keys(beat, [[248.5, 0], [250.5, 1], [257, 1], [262, 0.35], [266, 0]]);
// E(beat) = ∫(rate − 1) dbeat from 241, on a 1/100-beat grid; shifted so claps land on beats in sync
const E = (() => {
  const step = 0.01;
  const n = Math.ceil((274 - 241) / step) + 1;
  const e = new Float64Array(n);
  for (let k = 1; k < n; k++) e[k] = e[k - 1] + (rate(241 + k * step) - 1) * step;
  const k0 = Math.round((253 - 241) / step);
  const shift = e[k0] - Math.round(e[k0]);
  for (let k = 0; k < n; k++) e[k] -= shift;
  return {e, step};
})();
const eAt = (beat: number) => {
  const f = clamp((beat - 241) / E.step, 0, E.e.length - 1.001);
  const a = Math.floor(f);
  return E.e[a] + (E.e[a + 1] - E.e[a]) * (f - a);
};
const clap = (i: number, T: number) => {
  const bt = beatAt(T);
  const th = 2 * Math.PI * (bt + eAt(bt)) + (1 - syncOf(bt)) * SEATS[i].ph;
  const u = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return Math.exp(-u * 7);
};

export const S9: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(241), b(273), 0.5, 0.5);
  const draw = (ctx: CanvasRenderingContext2D) => {
    const a = fin;
    // stage
    ctx.strokeStyle = `rgba(241,197,109,${0.5 * a})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(960, 110, 300, 60, 0, 0.1, Math.PI - 0.1);
    ctx.stroke();
    for (let i = 0; i < SEATS.length; i++) {
      const f = clap(i, T);
      glow(ctx, SEATS[i].x, SEATS[i].y, 2.6, (0.12 + 0.8 * f) * a, f > 0.5);
    }
    // loudness over the last 5 s
    const x0 = 260;
    const x1 = 1660;
    const y0 = 760;
    ctx.strokeStyle = `rgba(241,197,109,${0.85 * a})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let k = 0; k <= 360; k++) {
      const t = T - 5 + (k / 360) * 5;
      let v = 0;
      if (t > b(241)) for (let i = 0; i < SEATS.length; i += 4) v += clap(i, t);
      v /= SEATS.length / 4;
      const x = x0 + (k / 360) * (x1 - x0);
      if (k === 0) ctx.moveTo(x, y0 - v * 120);
      else ctx.lineTo(x, y0 - v * 120);
    }
    ctx.stroke();
  };
  const bt = beatAt(T);
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.95} />
      <Tag x={260} y={790} text="全场的掌声（响度）" size={20} color={C.grey} o={fin * prog(T, b(242), b(243))} />
      <Tag x={1660} y={640} text={syncOf(bt) > 0.6 ? '整齐 · 慢一半' : bt > 257 ? '想更响 → 越拍越快' : '各拍各的'} anchor="right" size={30} color={syncOf(bt) > 0.6 ? C.gold : C.ink} o={fin * inOut(T, b(242), b(273), 0.5, 0.4)} />
      <Credit T={T} at={b(242)} out={b(273)} text="Néda et al., Nature 403, 2000 · 示意" />
    </>
  );
};
