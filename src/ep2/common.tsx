import React, { useLayoutEffect, useRef } from 'react';
import { random } from 'remotion';
import { C, ZH, EN } from '../lib';

/** Canvas layer redrawn every frame (draw must be deterministic in t). */
export const CanvasLayer: React.FC<{ t: number; w?: number; h?: number; x?: number; y?: number; opacity?: number; draw: (ctx: CanvasRenderingContext2D, t: number) => void }> = ({
  t, w = 1920, h = 1080, x = 0, y = 0, opacity = 1, draw,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);
    draw(ctx, t);
  });
  return <canvas ref={ref} width={w} height={h} style={{ position: 'absolute', left: x, top: y, opacity }} />;
};

export const rnd = (s: string) => random(s);

/** soft glowing dot */
export const glowDot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, rgb = '240,213,154', halo = 4) => {
  if (a <= 0.003) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * halo);
  g.addColorStop(0, `rgba(${rgb},${0.35 * a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * halo, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(${rgb},${a})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

export const Term: React.FC<{ sym: React.ReactNode; label: string; o: number; hi?: number; size?: number }> = ({ sym, label, o, hi = 0, size = 76 }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)`, minWidth: 130 }}>
    <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: size, lineHeight: 1, color: hi > 0.5 ? C.goldHi : C.paper, textShadow: hi > 0 ? `0 0 ${24 * hi}px rgba(201,164,92,${0.8 * hi})` : 'none' }}>{sym}</div>
    <div style={{ fontFamily: ZH, fontSize: 34, color: hi > 0.5 ? C.gold : C.paper, opacity: hi > 0.5 ? 1 : 0.8, marginTop: 14, letterSpacing: '0.04em' }}>{label}</div>
  </div>
);

export const Times: React.FC<{ o: number; size?: number }> = ({ o, size = 50 }) => (
  <div style={{ display: 'inline-block', fontFamily: EN, fontSize: size, color: C.dim, opacity: o, margin: '0 14px', alignSelf: 'flex-start', lineHeight: `${size * 1.4}px` }}>×</div>
);

export const Sub: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <span>
    {a}
    <sub style={{ fontSize: '0.5em', verticalAlign: '-0.15em', marginLeft: 1 }}>{b}</sub>
  </span>
);
