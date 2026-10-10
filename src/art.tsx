/* Shared 2D layers for 《心流》: the subtitle track, name cards, small labels. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { JUNO } from './brand/identity';
import { font } from './brand/lib';

export const GOLD = JUNO.colors.gold, INK = JUNO.colors.ink, BLUE = '#8fb8ff', RED = '#ff6a4a';
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const prog = (t: number, a: number, z: number) => clamp((t - a) / (z - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const backOut = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const MONO = 'JunoMono, monospace';

/** subtitles: one line at a time, [gold] for the answer; `sub: false` lines only time the picture */
export type Line = { t: number; end: number; text: string; gold?: boolean };
export const Subtitles: React.FC<{ T: number; lines: Line[] }> = ({ T, lines }) => {
  const l = lines.find((x) => T >= x.t && T < x.end); if (!l) return null;
  const k = prog(T, l.t, l.t + 0.12) * (1 - prog(T, l.end - 0.12, l.end));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 86, textAlign: 'center', opacity: k, fontFamily: font.sans, fontWeight: 700, fontSize: 68,
      color: l.gold ? GOLD : INK, WebkitTextStroke: '2px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 4px 18px rgba(0,0,0,0.9)', letterSpacing: '0.02em', fontVariantNumeric: 'lining-nums' }}>{l.text}</div>
  );
};

/** a person enters as an archive caption: gold rule, name, latin line, fact rows rising in at uneven gaps. No face. */
export const NameCard: React.FC<{ T: number; t0: number; t1: number; name: string; latin: string; rows: [string, number, boolean?][]; x?: number; y?: number; align?: 'left' | 'right' }> =
  ({ T, t0, t1, name, latin, rows, x = 120, y = 300, align = 'left' }) => {
    const k = easeOut(prog(T, t0, t0 + 0.4)) * (1 - prog(T, t1 - 0.3, t1)); if (k <= 0) return null;
    const side = align === 'left' ? { left: x } : { right: x };
    return (
      <div style={{ position: 'absolute', ...side, top: y, opacity: k, textAlign: align, transform: `translateX(${(1 - k) * (align === 'left' ? -30 : 30)}px)` }}>
        <div style={{ width: 80, height: 3, background: GOLD, marginBottom: 18, marginLeft: align === 'right' ? 'auto' : 0 }} />
        <div style={{ fontFamily: font.sans, fontWeight: 900, fontSize: 54, color: INK, letterSpacing: '0.04em' }}>{name}</div>
        <div style={{ fontFamily: font.latin, fontWeight: 600, fontSize: 30, color: 'rgba(243,237,226,0.65)', letterSpacing: '0.18em', marginTop: 6, fontVariantNumeric: 'lining-nums' }}>{latin}</div>
        {rows.map(([r, tr, gold], i) => { const a = easeOut(prog(T, tr, tr + 0.3)); return (
          <div key={i} style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 34, color: gold ? GOLD : 'rgba(243,237,226,0.85)', marginTop: i ? 8 : 22, opacity: a, transform: `translateY(${(1 - a) * 10}px)`, fontVariantNumeric: 'lining-nums' }}>{r}</div>); })}
      </div>
    );
  };

/** a small label that holds still once it lands */
export const Tag: React.FC<{ T: number; t0: number; t1: number; text: string; x: number; y: number; color?: string; size?: number; center?: boolean }> =
  ({ T, t0, t1, text, x, y, color = GOLD, size = 34, center = false }) => {
    const k = easeOut(prog(T, t0, t0 + 0.3)) * (1 - prog(T, t1 - 0.25, t1)); if (k <= 0) return null;
    return (
      <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${center ? '-50%' : '0'}, ${(1 - k) * 12}px)`, opacity: k, fontFamily: font.sans, fontWeight: 700, fontSize: size, color,
        padding: '8px 20px', borderRadius: 10, background: 'rgba(6,8,14,0.72)', border: `1.5px solid ${color}`, whiteSpace: 'nowrap', fontVariantNumeric: 'lining-nums' }}>{text}</div>
    );
  };

export const Fade: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => (o <= 0.001 ? null : <AbsoluteFill style={{ opacity: Math.min(1, o) }}>{children}</AbsoluteFill>);
