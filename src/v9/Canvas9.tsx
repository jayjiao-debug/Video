import React, { useLayoutEffect, useRef } from 'react';
import { W, H } from './light9';

/** a full-frame canvas redrawn synchronously for every T (with two bloom buffers) */
export const Canvas9: React.FC<{ T: number; draw: (ctx: CanvasRenderingContext2D, b1: HTMLCanvasElement, b2: HTMLCanvasElement) => void; style?: React.CSSProperties }> = ({ T, draw, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const b1 = useRef<HTMLCanvasElement | null>(null);
  const b2 = useRef<HTMLCanvasElement | null>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (!b1.current) { b1.current = document.createElement('canvas'); b1.current.width = W / 4; b1.current.height = H / 4; }
    if (!b2.current) { b2.current = document.createElement('canvas'); b2.current.width = W / 10; b2.current.height = H / 10; }
    const ctx = c.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    draw(ctx, b1.current, b2.current);
  });
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0, width: W, height: H, ...style }} />;
};
