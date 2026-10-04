import React from 'react';
import {b, beatAt, clamp, easeOut, inOut, keys, prog} from '../lib';
import {C, glow, LATIN, Light} from '../look';
import {Chapter, Credit, Tag} from '../ui';

/* S4, the quiet section (b96–b128): Huygens, February 1665. Two pendulum clocks, drawn in thin gold,
   hang from one beam and swing in opposite directions. A tap knocks one out of step; time runs fast
   (a counter to half an hour) and they settle back into opposite swings. Then his phrase, in his
   letter's spirit: an odd kind of sympathy. */
const CLK = [720, 1200];
const BEAM = 210;

const drawClock = (ctx: CanvasRenderingContext2D, cx: number, ang: number, hand: number, a: number) => {
  ctx.strokeStyle = `rgba(241,197,109,${0.7 * a})`;
  ctx.lineWidth = 1.6;
  // hook and case
  ctx.beginPath();
  ctx.moveTo(cx, BEAM);
  ctx.lineTo(cx, BEAM + 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 95, BEAM + 30);
  ctx.lineTo(cx + 95, BEAM + 30);
  ctx.lineTo(cx + 95, BEAM + 470);
  ctx.lineTo(cx - 95, BEAM + 470);
  ctx.closePath();
  ctx.stroke();
  // dial
  const dy = BEAM + 120;
  ctx.beginPath();
  ctx.arc(cx, dy, 62, 0, Math.PI * 2);
  ctx.stroke();
  for (let t = 0; t < 12; t++) {
    const g = (t / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(g) * 62, dy - Math.cos(g) * 62);
    ctx.lineTo(cx + Math.sin(g) * 54, dy - Math.cos(g) * 54);
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(255,226,170,${0.9 * a})`;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx, dy);
  ctx.lineTo(cx + Math.sin(hand) * 46, dy - Math.cos(hand) * 46);
  ctx.moveTo(cx, dy);
  ctx.lineTo(cx + Math.sin(hand / 12) * 30, dy - Math.cos(hand / 12) * 30);
  ctx.stroke();
  // pendulum: pivot under the dial, rod and bob swinging
  const px = cx;
  const py = BEAM + 200;
  const L = 230;
  const bx = px + Math.sin(ang) * L;
  const by = py + Math.cos(ang) * L;
  ctx.strokeStyle = `rgba(255,226,170,${0.85 * a})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(bx, by);
  ctx.stroke();
  glow(ctx, bx, by, 9, 0.85 * a, true);
  // a faint arc showing the swing
  ctx.strokeStyle = `rgba(241,197,109,${0.15 * a})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(px, py, L, Math.PI / 2 - 0.32, Math.PI / 2 + 0.32);
  ctx.stroke();
};

export const S4: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(96), b(128), 0.8, 0.6);
  const clocks = 1 - prog(T, b(119.5), b(120.5)) * 0.65;
  // phase: one full swing every two beats; the second clock half a cycle behind, plus the disturbance
  const ph = Math.PI * beatAt(T);
  const kick = b(112.5);
  const d = T < kick ? 0 : 1.7 * Math.exp(-Math.max(0, T - kick - 0.4) / 1.4);
  const ff = keys(T, [[kick + 0.4, 0], [b(119), 1800]]); // seconds of real time shown by the counter
  const draw = (ctx: CanvasRenderingContext2D) => {
    const a = fin * clocks;
    // the beam
    ctx.strokeStyle = `rgba(241,197,109,${0.75 * a})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(470, BEAM);
    ctx.lineTo(1450, BEAM);
    ctx.stroke();
    const a1 = 0.3 * Math.sin(ph);
    const a2 = 0.3 * Math.sin(ph + Math.PI + d);
    drawClock(ctx, CLK[0], a1, ph * 0.05 + ff * 0.01, a);
    drawClock(ctx, CLK[1], a2, ph * 0.05 + ff * 0.01 + 0.4, a);
    // the tap
    const tap = Math.max(0, 1 - Math.abs(T - kick) / 0.25);
    if (tap > 0) glow(ctx, CLK[1] + 70, BEAM + 430, 14, 0.8 * tap * fin, true);
  };
  const letter = inOut(T, b(120.5), b(128), 0.9, 0.5) * fin;
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={0.9} />
      <Chapter T={T} at={b(96)} out={b(112)} text="1665 年 2 月 · 惠 更 斯" />
      <Tag x={960} y={730} text="两只摆钟 · 挂在同一根横梁上" anchor="center" size={26} color={C.gold} o={inOut(T, b(98), b(112), 0.6, 0.4) * fin} />
      <Tag x={960} y={730} text={`+ ${Math.round(ff / 60)} 分钟`} anchor="center" size={34} color={C.gold} o={inOut(T, b(113), b(120), 0.4, 0.4) * fin} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: letter, transform: `translateY(${(1 - easeOut(clamp((T - b(120.5)) / 1))) * 14}px)`}}>
        <div style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 84, color: '#f6cf78', textShadow: '0 0 24px rgba(241,197,109,0.45), 0 4px 20px rgba(0,0,0,0.9)'}}>“an odd kind of sympathy”</div>
        <div style={{fontFamily: LATIN, fontSize: 28, letterSpacing: '0.3em', color: 'rgba(243,239,230,0.6)', marginTop: 18, fontVariantNumeric: 'lining-nums'}}>CHRISTIAAN HUYGENS · 1665</div>
      </div>
      <Credit T={T} at={b(100)} out={b(128)} text="Huygens 1665 · Bennett et al., Proc. R. Soc. A, 2002" />
    </>
  );
};
