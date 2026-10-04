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
export const Light: React.FC<{draw: Draw; bloom?: number; opacity?: number; deps: unknown[]; w?: number; h?: number}> = ({draw, bloom = 0.9, opacity = 1, deps, w = W, h = H}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const tmp = useRef<HTMLCanvasElement | null>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    draw(ctx);
    if (bloom > 0) {
      if (!tmp.current) {
        tmp.current = document.createElement('canvas');
        tmp.current.width = w / 2;
        tmp.current.height = h / 2;
      }
      const t = tmp.current.getContext('2d')!;
      t.clearRect(0, 0, w / 2, h / 2);
      t.filter = 'blur(7px)';
      t.drawImage(cv, 0, 0, w / 2, h / 2);
      t.filter = 'none';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = bloom;
      ctx.drawImage(tmp.current, 0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return <canvas ref={ref} width={w} height={h} style={{position: 'absolute', inset: 0, opacity}} />;
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
/** a bird seen from above, heading `ang`: gull-like wings that bend forward at the wrist and sweep
    back to the tips (the shape people read as "bird", where straight wings read as a plane), beating
    (shorter and more swept on the upstroke). From size 3.2 up it also gets a body, head and forked
    tail; below that those would blur the wings into a cross. Size `s` ≈ 1 → 8 px wingspan. */
export const bird = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, ang: number, a: number, flap: number) => {
  if (a <= 0.003) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = `rgba(246,214,150,${a})`;
  const w = 0.5 + 0.5 * Math.sin(flap); // 0 = upstroke (short, swept), 1 = spread
  const k = s < 3.2 ? s * 1.15 : s;
  const sp = 2.4 + 1.5 * w; // half span
  const back = 0.9 + 0.8 * (1 - w); // how far the tips sweep back
  ctx.beginPath();
  for (const side of [-1, 1]) {
    // leading edge: shoulder → wrist (out and forward) → tip (out and back)
    ctx.moveTo(0.35 * k, side * 0.15 * k);
    ctx.quadraticCurveTo(0.75 * k, side * sp * 0.38 * k, 0.45 * k, side * sp * 0.5 * k);
    ctx.quadraticCurveTo(0.1 * k, side * sp * 0.8 * k, -back * k, side * sp * k);
    // trailing edge: tip → behind the wrist → back of the shoulder
    ctx.quadraticCurveTo(-0.1 * k, side * sp * 0.62 * k, -0.05 * k, side * sp * 0.42 * k);
    ctx.quadraticCurveTo(-0.15 * k, side * sp * 0.2 * k, -0.45 * k, side * 0.15 * k);
    ctx.closePath();
  }
  if (s < 3.2) {
    ctx.moveTo(0.75 * k, 0);
    ctx.ellipse(0.1 * k, 0, 0.65 * k, 0.3 * k, 0, 0, Math.PI * 2);
  } else {
    // body + head
    ctx.moveTo(1.25 * k, 0);
    ctx.ellipse(0.15 * k, 0, 1.1 * k, 0.36 * k, 0, 0, Math.PI * 2);
    ctx.moveTo(1.5 * k, 0);
    ctx.arc(1.18 * k, 0, 0.32 * k, 0, Math.PI * 2);
    // forked tail
    ctx.moveTo(-0.8 * k, -0.2 * k);
    ctx.lineTo(-2.4 * k, -0.85 * k);
    ctx.lineTo(-1.6 * k, 0);
    ctx.lineTo(-2.4 * k, 0.85 * k);
    ctx.lineTo(-0.8 * k, 0.2 * k);
    ctx.closePath();
  }
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

/** the episode motif: a home ring, a wandering loop that comes back to it, and a bird leaving.
    Drawn in gold at (cx, cy), `s` = scale (1 ≈ 220 px wide); `p` = how much is drawn (0–1). */
export const motif = (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, a: number, p = 1, split = 0) => {
  if (a <= 0.003) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // the loop: a drunk's walk on a tiny grid, leaving the ring and coming back
  const path = [[0, 0], [1, 0], [1, -1], [2, -1], [2, 0], [3, 0], [3, 1], [2, 1], [1, 1], [0, 1], [-1, 1], [-1, 0], [0, 0]];
  const G = 26 * s;
  const ox = cx - 40 * s - split * 160 * s;
  const n = (path.length - 1) * clampN(p * 1.4);
  ctx.strokeStyle = `rgba(246,214,150,${0.85 * a})`;
  ctx.lineWidth = 2.4 * s;
  ctx.beginPath();
  for (let i = 0; i <= Math.floor(n) && i < path.length; i++) {
    const [x, y] = path[i];
    if (i === 0) ctx.moveTo(ox + x * G, cy + y * G);
    else ctx.lineTo(ox + x * G, cy + y * G);
  }
  const f = n % 1;
  const i0 = Math.min(path.length - 2, Math.floor(n));
  if (n < path.length - 1) ctx.lineTo(ox + (path[i0][0] + (path[i0 + 1][0] - path[i0][0]) * f) * G, cy + (path[i0][1] + (path[i0 + 1][1] - path[i0][1]) * f) * G);
  ctx.stroke();
  // home ring
  ctx.strokeStyle = `rgba(255,232,180,${a})`;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.arc(ox, cy, 9 * s, 0, Math.PI * 2);
  ctx.stroke();
  glow(ctx, ox, cy, 4 * s, 0.7 * a, true);
  // the bird: a dotted climb away to the upper right
  const q = clampN(p * 1.4 - 0.4);
  const bx = cx + 60 * s + split * 160 * s;
  const by = cy + 10 * s;
  for (let k = 0; k < 14 * q; k++) {
    const t = k / 14;
    dot(ctx, bx + t * 90 * s, by - t * t * 80 * s - Math.sin(t * 9) * 6 * s, 1.5 * s, 0.7 * a * (1 - t * 0.6));
  }
  if (q > 0) bird(ctx, bx + q * 90 * s, by - q * q * 80 * s - Math.sin(q * 9) * 6 * s, 3.2 * s, -0.7, a, q * 20);
  ctx.restore();
};
const clampN = (x: number) => Math.max(0, Math.min(1, x));

/** 100 people as a 10×10 grid of dots: lit(i) 0..1 = how much person i glows (home), `pulse(i)` 0..1 a fresh pop */
export const waffle = (ctx: CanvasRenderingContext2D, x: number, y: number, lit: (i: number) => number, a: number, cell = 21) => {
  if (a <= 0.003) return;
  for (let i = 0; i < 100; i++) {
    const cx = x + (i % 10) * cell;
    const cy = y + Math.floor(i / 10) * cell;
    const l = lit(i);
    ctx.fillStyle = `rgba(150,160,190,${0.22 * a * (1 - l)})`;
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.2, 0, Math.PI * 2);
    ctx.fill();
    if (l > 0) {
      ctx.fillStyle = `rgba(255,222,150,${0.95 * l * a})`;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.24, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
