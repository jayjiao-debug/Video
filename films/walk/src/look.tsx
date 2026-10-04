import React, {useLayoutEffect, useRef} from 'react';
import {W, H, mulberry} from './lib';

/* The look (from the reference the owner chose): a deep navy night, everything made of warm gold
   light. Particles are drawn on a canvas with additive blending, then a blurred copy is added on top
   for bloom. Text is clean sans: white lines, one gold keyword, a faint English line. */
export const C = {
  bg0: '#121a2b', // centre of the night
  bg1: '#070a12', // edges
  gold: '#f1c56d',
  goldHot: '#fff1cf',
  goldDim: '#a8823f',
  ink: '#f3efe6',
  grey: 'rgba(243,239,230,0.46)',
  faint: 'rgba(243,239,230,0.28)',
  red: '#e8735a',
  line: 'rgba(241,197,109,0.55)',
};
export const SANS = '"Juno Sans", "Noto Sans SC", sans-serif';
export const SERIF = '"Juno Serif", "Noto Serif SC", serif';
export const LATIN = '"Juno Latin", "Cormorant Garamond", serif';

/** the night: radial navy gradient + faint fixed dust */
export const Night: React.FC<{glow?: number; cx?: number; cy?: number}> = ({glow = 1, cx = 50, cy = 46}) => (
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 65% at ${cx}% ${cy}%, ${C.bg0} 0%, #0b1120 55%, ${C.bg1} 100%)`}}>
    <Dust />
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 40% 35% at ${cx}% ${cy}%, rgba(241,197,109,${0.05 * glow}) 0%, rgba(0,0,0,0) 70%)`}} />
  </div>
);

const DUST = (() => {
  const r = mulberry(7);
  return Array.from({length: 260}, () => ({x: r() * W, y: r() * H, s: 0.5 + r() * 1.3, o: 0.04 + r() * 0.14}));
})();
const Dust: React.FC = () => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    {DUST.map((d, i) => (
      <circle key={i} cx={d.x} cy={d.y} r={d.s} fill="#dfe6f5" opacity={d.o} />
    ))}
  </svg>
);

export type Draw = (ctx: CanvasRenderingContext2D) => void;

/**
 * A full-frame canvas of light: `draw` paints with additive blending; a blurred copy is then added
 * for bloom. Re-drawn synchronously every frame (deterministic, no animation loop).
 */
export const Light: React.FC<{draw: Draw; bloom?: number; opacity?: number; deps: unknown[]}> = ({draw, bloom = 0.9, opacity = 1, deps}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const tmp = useRef<HTMLCanvasElement | null>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    draw(ctx);
    if (bloom > 0) {
      if (!tmp.current) {
        tmp.current = document.createElement('canvas');
        tmp.current.width = W / 2;
        tmp.current.height = H / 2;
      }
      const t = tmp.current.getContext('2d')!;
      t.clearRect(0, 0, W / 2, H / 2);
      t.filter = 'blur(7px)';
      t.drawImage(cv, 0, 0, W / 2, H / 2);
      t.filter = 'none';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = bloom;
      ctx.drawImage(tmp.current, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, opacity}} />;
};

/** a glowing point: hot core + soft halo (call with globalCompositeOperation = 'lighter') */
export const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, hot = false) => {
  if (a <= 0.003) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  g.addColorStop(0, `rgba(255,236,190,${a})`);
  g.addColorStop(0.25, `rgba(241,197,109,${a * 0.55})`);
  g.addColorStop(1, 'rgba(241,197,109,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, Math.PI * 2);
  ctx.fill();
  if (hot) {
    ctx.fillStyle = `rgba(255,248,230,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
};
/** a tiny dot (cheap; thousands per frame) */
export const dot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) => {
  if (a <= 0.003) return;
  ctx.fillStyle = `rgba(246,214,150,${a})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};
/** a tiny bird (the reference's starling glyph), heading `ang` */
export const bird = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, ang: number, a: number, flap: number) => {
  if (a <= 0.003) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = `rgba(246,214,150,${a})`;
  const w = 0.6 + 0.4 * Math.sin(flap);
  ctx.beginPath();
  ctx.moveTo(3 * s, 0);
  ctx.lineTo(-2 * s, -3.4 * s * w);
  ctx.lineTo(-0.8 * s, 0);
  ctx.lineTo(-2 * s, 3.4 * s * w);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

/** points sampled inside a piece of text (for numbers and words made of particles); cached */
const TEXT_PTS = new Map<string, [number, number][]>();
export const textPoints = (text: string, font: string, cx: number, cy: number, n: number, seed = 1) => {
  const key = [text, font, cx, cy, n, seed].join('|');
  const hit = TEXT_PTS.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d')!;
  c.font = font;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = '#fff';
  c.fillText(text, cx, cy);
  const img = c.getImageData(0, 0, W, H).data;
  const inside: number[] = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (img[(y * W + x) * 4 + 3] > 128) inside.push(x, y);
  const r = mulberry(seed);
  const pts: [number, number][] = [];
  const m = inside.length / 2;
  for (let i = 0; i < n && m > 0; i++) {
    const j = Math.floor(r() * m);
    pts.push([inside[j * 2] + (r() - 0.5) * 2, inside[j * 2 + 1] + (r() - 0.5) * 2]);
  }
  TEXT_PTS.set(key, pts);
  return pts;
};
