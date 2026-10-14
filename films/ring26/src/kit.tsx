/* Shared furniture for 《一句话，让钱变便宜》: palette, type, timing helpers, the documentary grade, letterbox,
   slates, chapter marks, light pools, the canvas layer and the subtitle track. */
import React, { useLayoutEffect, useRef } from 'react';
import { staticFile } from 'remotion';
import type { Line } from './time';

export const W = 1920, H = 1080, BAR = 104;
export const C = {
  bg: '#0d0c0b', paper: '#e8dfcb', ink: '#1d1a16', ink2: '#4a443b',
  cream: '#efe8da', dim: 'rgba(239,232,218,.55)', faint: 'rgba(239,232,218,.14)', hair: 'rgba(239,232,218,.22)',
  gold: '#e3b765', goldHi: '#f6d58e', goldD: '#a8782f', teal: '#7fa9a4', red: '#c0614a',
};
export const F = {
  serif: '"Noto Serif CJK SC", serif', sans: '"Noto Sans CJK SC", sans-serif',
  lat: '"Cormorant Garamond", Georgia, serif', mono: '"JunoMono", "DejaVu Sans Mono", monospace', type: '"DejaVu Sans Mono", monospace',
};
export const LNUM: React.CSSProperties = { fontFeatureSettings: "'lnum' 1" };

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const pr = (T: number, a: number, d: number) => clamp((T - a) / d);
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeInOut = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const eo = (T: number, a: number, d: number) => easeOut(pr(T, a, d));
export const eio = (T: number, a: number, d: number) => easeInOut(pr(T, a, d));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const pop = (T: number, a: number, d = 0.3) => { const k = pr(T, a, d); return k <= 0 ? 0 : easeOut(k) + 0.16 * Math.sin(k * Math.PI) * (1 - k); };
export const hit = (T: number, a: number, decay = 0.15) => (T < a ? 0 : Math.exp(-(T - a) / decay));
export const rnd = (i: number, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7 + 0.5) * 43758.5453; return x - Math.floor(x); };
/** visible window with fades */
export const win = (T: number, a: number, z: number, fi = 0.3, fo = 0.3) => Math.min(eo(T, a, fi), 1 - pr(T, z - fo, fo));

export const FontFaces: React.FC = () => (
  <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
    @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }
    @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-600-normal.woff2')}) format("woff2"); font-weight: 600; }
    @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format("woff2"); font-style: italic; font-weight: 500; }`}</style>
);
export const FONT_LOADS = ['900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '500 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '700 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"', '700 20px "JunoMono"', '400 20px "DejaVu Sans Mono"'];

/** a 1920×1080 layer with a 2D camera (scale about cx, cy, then translate) */
export const Cam: React.FC<{ s?: number; cx?: number; cy?: number; x?: number; y?: number; o?: number; children: React.ReactNode }> = ({ s = 1, cx = 960, cy = 540, x = 0, y = 0, o = 1, children }) =>
  o <= 0 ? null : <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o, transformOrigin: `${cx}px ${cy}px`, transform: `translate(${x}px,${y}px) scale(${s})` }}>{children}</div>;

export const Grade: React.FC<{ warm?: number }> = ({ warm = 0.1 }) => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 42%, rgba(0,0,0,.62) 100%)' }} />
    <div style={{ position: 'absolute', inset: 0, background: `rgba(255,170,90,${warm})`, mixBlendMode: 'soft-light' }} />
  </>
);
export const Grain: React.FC<{ T: number }> = ({ T }) => (
  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('grain0.png')})`, backgroundSize: '1920px 1080px', backgroundPosition: `${Math.floor(rnd(Math.floor(T * 24), 3) * 400)}px ${Math.floor(rnd(Math.floor(T * 24), 4) * 300)}px`, opacity: 0.1, mixBlendMode: 'overlay' }} />
);
export const Bars: React.FC = () => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
  </>
);
export const Slate: React.FC<{ a: string; b?: string; o?: number }> = ({ a, b, o = 1 }) => (
  <div style={{ position: 'absolute', left: 120, top: BAR + 46, opacity: o, fontFamily: F.mono, fontWeight: 700, fontSize: 19, letterSpacing: '0.32em', color: C.dim, whiteSpace: 'nowrap' }}>
    {a}{b && <span style={{ color: C.gold }}>{'  ·  '}{b}</span>}
  </div>
);
export const Chapter: React.FC<{ n: string; t: string; o?: number }> = ({ n, t, o = 1 }) => (
  <div style={{ position: 'absolute', right: 120, top: BAR + 40, textAlign: 'right', opacity: o }}>
    <div style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 30, color: C.gold }}>{n}</div>
    <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.3em', color: C.dim, marginTop: 2 }}>{t}</div>
  </div>
);
export const Pool: React.FC<{ x: number; y: number; rx: number; ry: number; o?: number; col?: string }> = ({ x, y, rx, ry, o = 1, col = '255,214,150' }) => (
  <div style={{ position: 'absolute', left: x - rx, top: y - ry, width: rx * 2, height: ry * 2, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(${col},${0.2 * o}), rgba(${col},${0.07 * o}) 55%, rgba(${col},0) 100%)` }} />
);
export const Note: React.FC<{ x: number; y: number; s: string; o?: number }> = ({ x, y, s, o = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, opacity: o, fontFamily: F.mono, fontWeight: 700, fontSize: 16, letterSpacing: '0.24em', color: C.dim, whiteSpace: 'nowrap' }}>{s}</div>
);

/** a canvas redrawn synchronously every frame */
export const Canvas: React.FC<{ draw: (g: CanvasRenderingContext2D) => void; dep: number }> = ({ draw, dep }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current; if (!c) return;
    const g = c.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); draw(g);
  }, [dep, draw]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};
export const glowDot = (g: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, col = '255,214,140') => {
  if (a <= 0.001 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
};

/** subtitles in the lower letterbox bar */
/** subtitle style: size / weight / distance from the bottom edge (px at 1080p) */
export const SUB = { size: 66, weight: 700, bottom: 58 };
export const Subs: React.FC<{ T: number; lines: Line[] }> = ({ T, lines }) => (
  <>
    {lines.map(([a, z, s], i) => {
      const o = Math.min(eo(T, a, 0.18), 1 - pr(T, z - 0.15, 0.15));
      if (o <= 0) return null;
      const rise = (1 - eo(T, a, 0.3)) * 6;
      return (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: SUB.bottom, textAlign: 'center', opacity: o, transform: `translateY(${rise}px)`, fontFamily: F.sans, fontWeight: SUB.weight, fontSize: SUB.size, letterSpacing: '0.04em', color: C.cream, textShadow: '0 2px 6px rgba(0,0,0,.9), 0 0 2px rgba(0,0,0,.9)', ...LNUM }}>
          {s.split(/(\[[^\]]+\]|\{[^}]+\})/).map((x, j) => {
            const mg = x.startsWith('{'), hl = mg || x.startsWith('['), t = hl ? x.slice(1, -1) : x;
            // colour carries meaning: the tightening (fear, scams, awkwardness) = magenta, warm / answers = gold
            const col = !hl ? undefined : mg ? '#ff9ed6' : /一紧|没好事|诈骗|骚扰|尴尬|不高兴/.test(t) && !/没有更尴尬/.test(t) ? '#ff9ed6' : C.goldHi;
            return <span key={j} style={col ? { color: col } : undefined}>{t.split(/\^(\d+)/).map((u, k) => (k % 2 ? <sup key={k} style={{ fontSize: '0.58em', verticalAlign: '0.75em', lineHeight: 0 }}>{u}</sup> : <React.Fragment key={k}>{u}</React.Fragment>))}</span>;
          })}
        </div>
      );
    })}
  </>
);
