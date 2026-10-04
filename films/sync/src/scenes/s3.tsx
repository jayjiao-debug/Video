import React from 'react';
import {b, clamp, easeOut, inOut, mulberry, prog} from '../lib';
import {C, glow, Light, SANS} from '../look';
import {BigNum, Chapter, Credit, Tag} from '../ui';
import {flash, kuramoto, order, phase, pin} from '../sync';

/* S3 (b64–b96): how. (1) Copying a leader can't work: seeing then flashing takes almost a full cycle,
   so the follower always lands just before the next flash. (2) What each one does: when a neighbour
   flashes it nudges its own clock forward a little; two clocks drift into step. (3) One alone flashes
   irregularly; twenty lock into a rhythm. (4) Kuramoto's picture: runners on a circular track, each
   leaning toward the crowd, bunch up; the big number is how in-step they are (r). */
const P = b(65) - b(64); // one flash cycle = one beat

// (2) two pulse-coupled clocks: each flash of one advances the other by ε of its cycle
const CLOCKS = (() => {
  const hz = 300;
  const n = Math.ceil((b(81) - b(72)) * hz);
  const a = new Float32Array(n);
  const c = new Float32Array(n);
  let x = 0.1;
  let y = 0.55;
  const fa = 1 / P;
  const fb = 1.06 / P;
  for (let k = 0; k < n; k++) {
    a[k] = x;
    c[k] = y;
    x += fa / hz;
    y += fb / hz;
    if (x >= 1) {
      x -= 1;
      y = Math.min(1, y + 0.18 * y);
    }
    if (y >= 1) {
      y -= 1;
      x = Math.min(1, x + 0.18 * x);
    }
  }
  return {a, c, hz};
})();
// (3) one alone: irregular flash times; twenty together: a fast-locking run
const LONE = (() => {
  const r = mulberry(70);
  const t: number[] = [];
  let x = b(80);
  while (x < b(89)) {
    x += 0.35 + r() * 1.1;
    t.push(x);
  }
  return t;
})();
const TWENTY = kuramoto({n: 20, seconds: 10, hz: 1.966, spread: 0.08, K: (t) => (t < 1.2 ? 0 : 7), seed: 81});
const TW_POS = (() => {
  const r = mulberry(82);
  return Array.from({length: 20}, () => [1300 + (r() - 0.5) * 360, 430 + (r() - 0.5) * 260]);
})();
// (4) the track
const RING = kuramoto({n: 60, seconds: 10, hz: 0.5, spread: 0.06, K: (t) => (t < 1 ? 0 : 1.6), seed: 31});

export const S3: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(64), b(96), 0.45, 0.45);
  const w1 = inOut(T, b(64), b(72), 0.45, 0.35);
  const w2 = inOut(T, b(72), b(80), 0.45, 0.35);
  const w3 = inOut(T, b(80), b(88), 0.45, 0.35);
  const w4 = inOut(T, b(88), b(96) + 0.4, 0.45, 0.4);
  const draw = (ctx: CanvasRenderingContext2D) => {
    // (1) leader vs follower pulses on a time axis
    if (w1 > 0.003) {
      const a = w1 * fin;
      const x0 = 260;
      const x1 = 1660;
      const span = 5 * P;
      const now = T - b(64);
      const ax = easeOut(prog(T, b(64), b(65.5)));
      for (const [row, y, delay] of [
        [0, 340, 0],
        [1, 560, 0.88],
      ] as const) {
        ctx.strokeStyle = `rgba(241,197,109,${0.55 * a})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + (x1 - x0) * ax, y);
        ctx.stroke();
        for (let k = 0; k < 6; k++) {
          const tk = (k + delay) * P;
          if (tk > now + 0.05) continue;
          const x = x0 + (tk / span) * (x1 - x0);
          if (x > x1) continue;
          const fresh = clamp(1 - (now - tk) / 0.5);
          ctx.strokeStyle = `rgba(255,226,170,${(0.6 + 0.4 * fresh) * a})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - 90);
          ctx.stroke();
          glow(ctx, x, y - 90, 4, (0.5 + 0.5 * fresh) * a, true);
          if (row === 0 && k < 5 && (k + 0.88) * P <= now) {
            // the arrow from a flash to the follower's late reply
            const xe = x0 + (((k + 0.88) * P) / span) * (x1 - x0);
            ctx.strokeStyle = `rgba(232,115,90,${0.55 * a})`;
            ctx.lineWidth = 1.3;
            ctx.setLineDash([5, 6]);
            ctx.beginPath();
            ctx.moveTo(x, y + 8);
            ctx.lineTo(xe, 560 - 98);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
    }
    // (2) two clocks
    if (w2 > 0.003) {
      const a = w2 * fin;
      const k = Math.min(CLOCKS.a.length - 1, Math.max(0, Math.floor((T - b(72)) * CLOCKS.hz)));
      for (const [cx, v] of [
        [700, CLOCKS.a[k]],
        [1220, CLOCKS.c[k]],
      ] as const) {
        const cy = 430;
        const R = 150;
        ctx.strokeStyle = `rgba(241,197,109,${0.6 * a})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        for (let t = 0; t < 12; t++) {
          const ang = (t / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.sin(ang) * R, cy - Math.cos(ang) * R);
          ctx.lineTo(cx + Math.sin(ang) * (R - 12), cy - Math.cos(ang) * (R - 12));
          ctx.stroke();
        }
        const ang = v * Math.PI * 2;
        ctx.strokeStyle = `rgba(255,226,170,${0.95 * a})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(ang) * (R - 22), cy - Math.cos(ang) * (R - 22));
        ctx.stroke();
        const f = Math.exp(-v * 9) + Math.exp(-(1 - v) * 40);
        glow(ctx, cx, cy - R - 34, 9, (0.15 + 0.85 * f) * a, f > 0.4);
      }
    }
    // (3) one alone vs twenty together
    if (w3 > 0.003) {
      const a = w3 * fin;
      let f1 = 0;
      for (const t of LONE) if (T >= t) f1 = Math.max(f1, Math.exp(-(T - t) * 9));
      glow(ctx, 620, 430, 8, (0.12 + 0.88 * f1) * a, f1 > 0.3);
      for (let i = 0; i < 20; i++) {
        const th = phase(TWENTY, i, T - b(80)) + pin(TWENTY, T, b(80), 1, 0.4, 0.9);
        const f = flash(th);
        glow(ctx, TW_POS[i][0], TW_POS[i][1], 5, (0.1 + 0.9 * f) * a, f > 0.4);
      }
    }
    // (4) the track
    if (w4 > 0.003) {
      const a = w4 * fin;
      const cx = 1150;
      const cy = 440;
      const R = 280;
      const t = T - b(88);
      ctx.strokeStyle = `rgba(241,197,109,${0.35 * a})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      let sx = 0;
      let sy = 0;
      for (let i = 0; i < RING.n; i++) {
        const p = phase(RING, i, t);
        sx += Math.cos(p);
        sy += Math.sin(p);
        glow(ctx, cx + Math.cos(p) * R, cy + Math.sin(p) * R, 3.4, 0.85 * a, true);
      }
      sx /= RING.n;
      sy /= RING.n;
      ctx.strokeStyle = `rgba(255,226,170,${0.9 * a})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + sx * R, cy + sy * R);
      ctx.stroke();
      glow(ctx, cx, cy, 5, 0.6 * a, true);
    }
  };
  const r = order(RING, T - b(88));
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.95} />
      {/* (1) */}
      <Tag x={150} y={322} text="先闪的" size={26} color={C.gold} o={w1 * fin} />
      <Tag x={150} y={542} text="跟着闪" size={26} color={C.red} o={w1 * fin} />
      <Tag x={960} y={640} text="看见 → 反应，差不多要一整拍：永远慢半步" anchor="center" size={28} color={C.ink} o={w1 * fin * prog(T, b(67), b(68))} />
      {/* (2) */}
      <Tag x={960} y={680} text="邻居一闪，就把自己的表往前拨一点" anchor="center" size={28} color={C.ink} o={w2 * fin * prog(T, b(73), b(74))} />
      {/* (3) */}
      <Tag x={620} y={640} text="1 只：乱闪" anchor="center" size={30} color={C.grey} o={w3 * fin} />
      <Tag x={1300} y={640} text="20 只：对上了" anchor="center" size={30} color={C.gold} o={w3 * fin} />
      <Credit T={T} at={b(80.5)} out={b(88)} text="Sarfati, Hayes & Peleg 2020–2021 · 示意" />
      {/* (4) */}
      <Chapter T={T} at={b(88)} out={b(96)} text="1975 · 藏 本 由 纪" />
      <BigNum T={T} at={b(88.5)} out={b(96)} x={130} y={300} value={`${Math.round(r * 100)}%`} zh="步调一致的程度" en="HOW IN-STEP · r" />
      <div style={{position: 'absolute', left: 130, top: 560, fontFamily: SANS, fontSize: 30, color: C.gold, opacity: inOut(T, b(90), b(96), 0.5, 0.4), letterSpacing: '0.02em'}}>dθ/dt = ω + K·r·sin(ψ − θ)</div>
      <Tag x={130} y={610} text="每个都往大家的平均节奏靠一点" size={22} color={C.grey} o={inOut(T, b(90), b(96), 0.5, 0.4)} />
      <Credit T={T} at={b(88.5)} out={b(96)} text="Kuramoto 1975 · Mirollo & Strogatz 1990" />
    </>
  );
};
