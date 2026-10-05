import React from 'react';
import {b, beatAt, clamp, easeInOut, inOut, keys, mulberry, prog} from '../lib';
import {C, glow, Light} from '../look';
import {Chapter, Credit, Tag} from '../ui';
import {drawRiver, FLIES_J, S2RUN} from './river';
import {phase, pin} from '../sync';

/* S2 (b39–b64): not just people. A Thai riverbank: thousands of fireflies go from flashing on their
   own to flashing as one (a real Kuramoto run, pinned to the beat once it forms). 1917: a letter in
   Science said observers were seeing their own blinking (the frame blinks like an eyelid). 1968: the
   Bucks' light-meter traces, pulses lined up, a bracket marking ~0.56 s. */
const synced = (T: number) => (i: number) => (T < b(47) ? phase(S2RUN, i, T - b(39)) + pin(S2RUN, T, b(39)) : 2 * Math.PI * beatAt(T) + FLIES_J[i] * 0.25);

const Eyelids: React.FC<{c: number}> = ({c}) => {
  if (c <= 0.003) return null;
  const h = 560 * c;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <path d={`M0,0 H1920 V${h - 60} Q960,${h + 80} 0,${h - 60} Z`} fill="#04060b" />
      <path d={`M0,1080 H1920 V${1080 - h + 60} Q960,${1080 - h - 80} 0,${1080 - h + 60} Z`} fill="#04060b" />
      <path d={`M0,${h - 60} Q960,${h + 80} 1920,${h - 60}`} stroke="rgba(241,197,109,0.6)" strokeWidth={2} fill="none" />
      <path d={`M0,${1080 - h + 60} Q960,${1080 - h - 80} 1920,${1080 - h + 60}`} stroke="rgba(241,197,109,0.6)" strokeWidth={2} fill="none" />
    </svg>
  );
};

const TRACES = 3;
export const S2: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(39) - 0.05, b(64), 0.5, 0.45);
  const part = T < b(47) ? 0 : T < b(55) ? 1 : 2;
  // camera: wide bank → one tree (1935) → away (1968)
  const zoom = keys(T, [[b(39), 1.1], [b(55), 0.92]], easeInOut);
  const fx = 960;
  const fy = 560;
  const sy = 560;
  const river = 1 - prog(T, b(54.5), b(55.5));
  const traces = prog(T, b(55), b(56));
  // two blinks on the beat in 1917
  const blink = (k: number) => Math.max(0, 1 - Math.abs(T - b(k)) / 0.16);
  const lid = part === 1 ? Math.max(blink(49), blink(51)) : 0;
  const draw = (ctx: CanvasRenderingContext2D) => {
    if (river > 0.003) drawRiver(ctx, synced(T), {a: river * fin, zoom, T, fx, fy, sy});
    if (traces > 0.003) {
      const a = traces * fin;
      const x0 = 300;
      const x1 = 1620;
      const per = b(56) - b(55);
      const span = 6; // seconds on screen
      for (let c = 0; c < TRACES; c++) {
        const y0 = 300 + c * 150;
        const r = mulberry(40 + c);
        ctx.strokeStyle = `rgba(241,197,109,${0.75 * a})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let k = 0; k <= 600; k++) {
          const u = k / 600;
          const t = T - span + u * span;
          const ph = ((beatAt(t) % 1) + 1) % 1;
          const pulse = Math.exp(-Math.pow(Math.min(ph, 1 - ph) / 0.035, 2)) * 70;
          const noise = (r() - 0.5) * 3;
          const x = x0 + u * (x1 - x0) * clamp((T - b(55)) / 1.2);
          if (k === 0) ctx.moveTo(x, y0 - pulse - noise);
          else ctx.lineTo(x, y0 - pulse - noise);
          if (x >= x0 + (x1 - x0) * clamp((T - b(55)) / 1.2) - 0.5 && k > 0) break;
        }
        ctx.stroke();
      }
      // the bracket over one period
      const xb = x0 + ((x1 - x0) * (span - 2 * per)) / span;
      const xe = xb + ((x1 - x0) * per) / span;
      const ba = a * prog(T, b(58), b(59));
      ctx.strokeStyle = `rgba(255,226,170,${0.9 * ba})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xb, 200);
      ctx.lineTo(xb, 188);
      ctx.lineTo(xe, 188);
      ctx.lineTo(xe, 200);
      ctx.stroke();
      glow(ctx, xb, 188, 2, 0.5 * ba);
    }
  };
  const xb = 300 + ((1320 * (6 - 2 * (b(56) - b(55)))) / 6);
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={1} />
      <Eyelids c={lid} />
      <Chapter T={T} at={b(39)} out={b(47)} text="泰 国 · 河 边" />
      <Chapter T={T} at={b(47)} out={b(55)} text="1917 · 《科 学》" />
      <Tag x={960} y={150} text="“那是观察者自己在眨眼。”" anchor="center" size={34} color={C.red} o={inOut(T, b(48), b(54.5), 0.4, 0.4) * fin} />
      <Credit T={T} at={b(48)} out={b(55)} text="Laurent, Science, 1917" />
      <Chapter T={T} at={b(55)} out={b(64)} text="1968 · 巴 克 夫 妇" />
      <Tag x={xb + 30} y={140} text="约 0.56 秒" size={28} color={C.gold} o={inOut(T, b(58), b(64), 0.5, 0.4) * fin} />
      <Tag x={300} y={760} text="光度计记录 · 三个位置的萤火虫" size={22} color={C.grey} o={inOut(T, b(56), b(64), 0.5, 0.4) * fin} />
      <Credit T={T} at={b(56)} out={b(64)} text="Buck & Buck, Science, 1968 · 示意" />
    </>
  );
};
