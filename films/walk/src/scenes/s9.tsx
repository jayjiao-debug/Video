import React from 'react';
import {b, clamp, easeInOut, easeOut, inOut, mulberry, pop, prog} from '../lib';
import {C, dot, glow, Light, SANS} from '../look';
import {Chapter, Credit, Tag} from '../ui';

/* S9, prices (b241–b273). 1900, Paris: a price line drawn as a random walk on the reference's thin gold
   axes, then forty other histories it could have taken. A mini timeline: Bachelier 1900, Einstein
   1905. 1973: a "stock chart" built only from coin flips ($50, ±$0.50 a flip) as candles; a chartist's
   verdict stamped in red (the trap), then the reveal. */
const X0 = 260;
const X1 = 1700;
const Y0 = 150;
const Y1 = 760;
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
const PATHS = Array.from({length: 41}, (_, i) => {
  const r = mulberry(900 + i * 7);
  let y = 0;
  return Float32Array.from({length: 400}, (_v, k) => (k === 0 ? 0 : (y += gauss(r) * 7.2)));
});
const FLIPS = (() => {
  const r = mulberry(1973);
  let p = 50;
  const c: [number, number, number, number][] = [];
  for (let k = 0; k < 60; k++) {
    const o = p;
    let hi = p;
    let lo = p;
    for (let j = 0; j < 5; j++) {
      p += r() < 0.5 ? 0.5 : -0.5;
      hi = Math.max(hi, p);
      lo = Math.min(lo, p);
    }
    c.push([o, p, hi, lo]);
  }
  return c;
})();
const py = (price: number) => 455 - (price - 50) * 34;

export const S9: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(241), b(273), 0.45, 0.5);
  const one = 1 - prog(T, b(256.5), b(257.5));
  const two = prog(T, b(257), b(258));
  const draw = (ctx: CanvasRenderingContext2D) => {
    const ax = easeOut(prog(T, b(241), b(243)));
    // axes
    ctx.strokeStyle = `rgba(241,197,109,${0.7 * fin})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(X0, Y1);
    ctx.lineTo(X0 + (X1 - X0 + 40) * ax, Y1);
    ctx.moveTo(X0, Y1);
    ctx.lineTo(X0, Y1 - (Y1 - Y0) * ax);
    ctx.stroke();
    // faint grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(241,197,109,${0.08 * fin})`;
    for (const y of [Y0 + 100, 455, Y1 - 100]) {
      ctx.beginPath();
      ctx.moveTo(X0, y);
      ctx.lineTo(X0 + (X1 - X0) * ax, y);
      ctx.stroke();
    }
    if (one > 0.003) {
      const a = one * fin;
      const n = Math.floor(399 * easeInOut(prog(T, b(241.5), b(248))));
      const alt = prog(T, b(249), b(254));
      for (let i = 1; i < PATHS.length && alt > 0; i++) {
        const m = Math.floor(399 * clamp(alt * 1.4 - (i / PATHS.length) * 0.4));
        ctx.strokeStyle = `rgba(226,214,190,${0.13 * a})`;
        ctx.beginPath();
        for (let k = 0; k <= m; k++) {
          const x = X0 + (k / 399) * (X1 - X0);
          const y = 455 - PATHS[i][k];
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(255,214,140,${0.95 * a})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let k = 0; k <= n; k++) {
        const x = X0 + (k / 399) * (X1 - X0);
        const y = 455 - PATHS[0][k];
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      glow(ctx, X0 + (n / 399) * (X1 - X0), 455 - PATHS[0][n], 6, 0.9 * a, true);
    }
    if (two > 0.003) {
      const a = two * fin;
      const n = 60 * prog(T, b(257.5), b(264.5));
      const w = (X1 - X0) / 60;
      for (let k = 0; k < Math.floor(n); k++) {
        const [o, c, hi, lo] = FLIPS[k];
        const x = X0 + w * (k + 0.5);
        ctx.strokeStyle = `rgba(241,197,109,${0.8 * a})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, py(hi));
        ctx.lineTo(x, py(lo));
        ctx.stroke();
        const top = py(Math.max(o, c));
        const h = Math.max(2, Math.abs(py(o) - py(c)));
        if (c >= o) {
          ctx.fillStyle = `rgba(241,197,109,${0.85 * a})`;
          ctx.fillRect(x - w * 0.32, top, w * 0.64, h);
        } else {
          ctx.fillStyle = `rgba(7,10,18,${a})`;
          ctx.fillRect(x - w * 0.32, top, w * 0.64, h);
          ctx.strokeStyle = `rgba(241,197,109,${0.85 * a})`;
          ctx.strokeRect(x - w * 0.32, top, w * 0.64, h);
        }
      }
      // the coin
      const k = Math.min(59, Math.floor(n));
      if (n < 60) {
        const x = X0 + w * (k + 0.5);
        const y = py(FLIPS[k][0]) - 90;
        const sx = Math.abs(Math.cos(T * 14));
        ctx.fillStyle = `rgba(241,197,109,${0.9 * a})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 18 * sx + 1, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        glow(ctx, x, y, 8, 0.4 * a);
      }
      dot(ctx, X0, py(50), 3, 0.9 * a);
    }
  };
  const tl = inOut(T, b(249), b(257), 0.5, 0.4) * fin;
  const tlw = easeInOut(prog(T, b(249.5), b(251.5)));
  const stamp = pop(T, b(265.5), 0.3);
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.85} />
      <Chapter T={T} at={b(241)} out={b(249)} text="1900 · 巴 黎" />
      <Tag x={X0 - 12} y={Y0 - 44} text="价格" size={22} color={C.grey} o={fin * prog(T, b(242), b(243))} />
      <Tag x={X1 + 20} y={Y1 - 14} text="时间 →" size={22} color={C.grey} o={fin * prog(T, b(242), b(243))} />
      {/* mini timeline: 1900 → 1905 */}
      <div style={{position: 'absolute', top: 46, left: 760, width: 400, height: 60, opacity: tl}}>
        <div style={{position: 'absolute', left: 0, top: 12, width: 400 * tlw, height: 1.5, background: C.line}} />
        <div style={{position: 'absolute', left: -6, top: 6, width: 13, height: 13, borderRadius: 7, background: C.gold, boxShadow: '0 0 12px rgba(241,197,109,0.8)'}} />
        <div style={{position: 'absolute', left: 394, top: 6, width: 13, height: 13, borderRadius: 7, background: C.gold, opacity: tlw, boxShadow: '0 0 12px rgba(241,197,109,0.8)'}} />
        <div style={{position: 'absolute', left: -60, top: 28, width: 120, textAlign: 'center', fontFamily: SANS, fontSize: 20, color: C.ink}}>1900 巴舍利耶</div>
        <div style={{position: 'absolute', left: 340, top: 28, width: 120, textAlign: 'center', fontFamily: SANS, fontSize: 20, color: C.ink, opacity: tlw}}>1905 爱因斯坦</div>
      </div>
      <Tag x={X0 - 70} y={py(50) - 14} text="$50" size={22} color={C.gold} o={two * fin} />
      <Tag x={X0 + 90} y={Y0 - 44} text="每抛一次硬币：正面 +$0.5，反面 −$0.5" size={22} color={C.grey} o={inOut(T, b(258), b(273), 0.5, 0.4) * fin} />
      {stamp > 0 ? (
        <div style={{position: 'absolute', left: 1240, top: 170, opacity: fin * (1 - prog(T, b(272.5), b(273.3))), transform: `rotate(-8deg) scale(${0.6 + 0.4 * stamp})`, transformOrigin: 'center'}}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 92, color: C.red, border: `5px solid ${C.red}`, borderRadius: 10, padding: '2px 26px', textShadow: '0 0 20px rgba(232,115,90,0.45)', boxShadow: '0 0 24px rgba(232,115,90,0.3)'}}>马上买！</div>
          <div style={{fontFamily: SANS, fontSize: 22, color: C.grey, marginTop: 10, textAlign: 'right'}}>—— 一位看图专家</div>
        </div>
      ) : null}
      <Tag x={1240} y={430} text="可它只是抛硬币" size={34} color={C.gold} o={inOut(T, b(269), b(273), 0.4, 0.4) * fin} />
      <Credit T={T} at={b(242)} out={b(257)} text="Bachelier, Théorie de la spéculation, 1900" />
      <Credit T={T} at={b(257)} out={b(273)} text="Malkiel, A Random Walk Down Wall Street, 1973" />
    </>
  );
};
