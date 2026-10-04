import React from 'react';
import {makeCam} from '../cam';
import {b, clamp, inOut, keys, mulberry, pop, prog} from '../lib';
import {C, dot, glow, Light, SANS} from '../look';
import {BigNum, Credit, Tag} from '../ui';

/* S8 (b209–b241): the Millennium Bridge, schematic, in thin gold: a long low deck over the Thames, the
   dome of St Paul's beyond. The crowd fills it; past about 160 people the sideways sway jumps and the
   walkers' steps fall in with it (bridge and crowd drive each other); closed two days later; dampers
   fitted, the sway dies. Counters: people on the bridge, sway in mm. One dot ≈ three people. */
const L = 11;
const MAXD = 700;
const CROWD = (() => {
  const r = mulberry(8);
  return Array.from({length: MAXD}, () => ({u: r(), z: (r() - 0.5) * 0.7, sp: 0.5 + r(), ph: r() * Math.PI * 2}));
})();
const people = (T: number) => keys(T, [[b(209.5), 0], [b(217), 90], [b(225), 160], [b(229), 1200], [b(233), 2000], [b(235), 2000], [b(241), 900]]);
const swayMM = (T: number) => {
  const n = people(T);
  const grow = clamp((n - 150) / 600);
  const damp = 1 - clamp((T - b(234)) / (b(238) - b(234)));
  return Math.min(70, 67 * Math.pow(grow, 0.7) + 3 * clamp(n / 150)) * damp;
};

export const S8: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(209), b(241), 0.5, 0.45);
  const cam = makeCam([-13, 5.5, 14.5], [0.5, 0.2, 0], 40, 1010, 470);
  const P = [0, 0, 0, 0];
  const Q = [0, 0, 0, 0];
  const mm = swayMM(T);
  const sway = (mm / 70) * 0.45 * Math.sin(Math.PI * T * 2 * 0.95);
  const lock = clamp(mm / 50);
  const deckZ = (x01: number) => sway * Math.sin(x01 * Math.PI);
  const draw = (ctx: CanvasRenderingContext2D) => {
    const a = fin;
    // St Paul's dome, far behind
    ctx.strokeStyle = `rgba(241,197,109,${0.28 * a})`;
    ctx.lineWidth = 1.4;
    const dx = 520;
    const dy = 220;
    ctx.beginPath();
    ctx.arc(dx, dy, 70, Math.PI, 0);
    ctx.moveTo(dx - 92, dy + 40);
    ctx.lineTo(dx - 92, dy);
    ctx.lineTo(dx + 92, dy);
    ctx.lineTo(dx + 92, dy + 40);
    ctx.moveTo(dx, dy - 70);
    ctx.lineTo(dx, dy - 102);
    ctx.stroke();
    glow(ctx, dx, dy - 104, 2, 0.4 * a);
    // banks
    ctx.strokeStyle = `rgba(241,197,109,${0.15 * a})`;
    for (const x of [-L, L]) {
      cam.project(x, -0.6, -7, P);
      cam.project(x, -0.6, 7, Q);
      ctx.beginPath();
      ctx.moveTo(P[0], P[1]);
      ctx.lineTo(Q[0], Q[1]);
      ctx.stroke();
    }
    // deck edges and the low cables
    for (const e of [-0.45, 0.45]) {
      ctx.strokeStyle = `rgba(241,197,109,${0.75 * a})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let k = 0; k <= 60; k++) {
        const u = k / 60;
        cam.project(-L + u * 2 * L, 0, e + deckZ(u), P);
        if (k === 0) ctx.moveTo(P[0], P[1]);
        else ctx.lineTo(P[0], P[1]);
      }
      ctx.stroke();
      ctx.strokeStyle = `rgba(241,197,109,${0.35 * a})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let k = 0; k <= 60; k++) {
        const u = k / 60;
        cam.project(-L + u * 2 * L, 0.35 - 0.3 * Math.pow(Math.sin(u * Math.PI * 3), 2), e * 1.6 + deckZ(u), P);
        if (k === 0) ctx.moveTo(P[0], P[1]);
        else ctx.lineTo(P[0], P[1]);
      }
      ctx.stroke();
    }
    // dampers appear under the deck
    const dp = clamp((T - b(233.5)) / 1.5);
    if (dp > 0) {
      for (let k = 1; k < 12; k++) {
        const u = k / 12;
        cam.project(-L + u * 2 * L, -0.25, deckZ(u), P);
        glow(ctx, P[0], P[1], 3, 0.8 * dp * a, true);
      }
    }
    // the crowd
    const n = Math.round((people(T) / 2000) * MAXD);
    for (let i = 0; i < n; i++) {
      const c = CROWD[i];
      const x01 = (((c.u + T * 0.018 * c.sp) % 1) + 1) % 1;
      // each walker's own sway, pulled toward the deck's as the sway grows (lock-in)
      const own = Math.sin(T * Math.PI * 2 * (0.9 + 0.2 * c.sp) + c.ph);
      const deck = Math.sin(Math.PI * T * 2 * 0.95);
      const step = (own * (1 - lock) + deck * lock) * 0.05;
      cam.project(-L + x01 * 2 * L, 0.05, c.z + step + deckZ(x01), P);
      dot(ctx, P[0], P[1], 2.1, 0.85 * a);
    }
  };
  const closed = pop(T, b(231), 0.3);
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.9} />
      <BigNum T={T} at={b(210)} out={b(241)} x={1320} y={520} value={`${Math.round(people(T))}`} zh="桥上人数" en="PEOPLE ON THE BRIDGE" size={110} />
      <Tag x={1320} y={748} text={`晃动 ${Math.round(mm)} 毫米`} size={34} color={mm > 30 ? C.gold : C.ink} o={inOut(T, b(217), b(241), 0.5, 0.4) * fin} />
      <Tag x={1320} y={796} text="一个光点 ≈ 3 人 · 示意" size={20} color={C.grey} o={inOut(T, b(212), b(241), 0.5, 0.4) * fin} />
      {closed > 0 ? (
        <div style={{position: 'absolute', left: 820, top: 120, opacity: fin * (1 - prog(T, b(233), b(234))), transform: `rotate(-6deg) scale(${0.6 + 0.4 * closed})`}}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, color: C.red, border: `4px solid ${C.red}`, borderRadius: 10, padding: '2px 22px'}}>关闭</div>
          <div style={{fontFamily: SANS, fontSize: 20, color: C.grey, marginTop: 8, textAlign: 'right'}}>2000 年 6 月 12 日</div>
        </div>
      ) : null}
      <Tag x={820} y={130} text="37 个阻尼器 · 约 500 万英镑" size={30} color={C.gold} o={inOut(T, b(234), b(241), 0.5, 0.4) * fin} />
      <Tag x={820} y={176} text="2002 年 2 月 22 日 重新开放" size={24} color={C.ink} o={inOut(T, b(236), b(241), 0.5, 0.4) * fin} />
      <Credit T={T} at={b(210)} out={b(241)} text="Dallard et al. 2001 · Strogatz et al., Nature, 2005" />
    </>
  );
};
