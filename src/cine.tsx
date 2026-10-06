import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SETS } from './scenes';
import { prog, easeOut, easeIn, easeInOut, lerp, rnd, hit, clamp, fb, CUT, FILM_END, SANS, ZH, MONO, EN } from './lib';
import { stageStyle } from './camera';

/* The cinematic engine (from 《没走的路》), used by 《冰下捉鬼》: hand-drawn SVG sets (scenes.tsx) moved like a camera (2.5D push / drift /
   tilt), graded, with drifting fog and dust in front, letterboxed, and kinetic type on top. Shots cut on the beat
   with whip / push / tilt / roll / shake (camera.tsx), motion-blurred by Film. */

export const AMBER = '#f1c56d', AMBER_GLOW = 'rgba(241,197,109,0.75)'; // Juno gold: numbers, the prize
export const STEEL = '#8fdcff', STEEL_GLOW = 'rgba(120,210,255,0.7)'; // ice / Cherenkov blue
export const INK = '#eef6fb', DIM = 'rgba(238,246,251,0.62)';
export const BAR = 128; // letterbox bar height

export type KB = { s: [number, number]; x?: [number, number]; y?: [number, number]; ry?: [number, number]; ox?: number; oy?: number };
export type Shot = { a: number; z: number; plate: string; kb: KB; dark?: number; focus?: [number, number]; overlay?: React.FC<{ T: number; u: number }> };

const ease = (u: number) => easeInOut(u) * 0.5 + u * 0.5;

/** one plate inside the camera: Ken Burns + small 3D tilt; overlays drawn in the plate's own 1920×1080 coordinates */
export const PlateShot: React.FC<{ T: number; shot: Shot }> = ({ T, shot }) => {
  const st = stageStyle(T, shot.a, shot.z, [0, 0], shot.focus);
  if (!st) return null;
  const u = clamp((T - shot.a) / (shot.z - shot.a + 0.6));
  const e = ease(u);
  const k = shot.kb;
  const s = lerp(k.s[0], k.s[1], e), x = lerp(k.x?.[0] ?? 0, k.x?.[1] ?? 0, e), y = lerp(k.y?.[0] ?? 0, k.y?.[1] ?? 0, e), ry = lerp(k.ry?.[0] ?? 0, k.ry?.[1] ?? 0, e);
  const O = shot.overlay;
  return (
    <AbsoluteFill style={{ ...st, overflow: 'hidden', backgroundColor: '#05070a' }}>
      <AbsoluteFill style={{ transform: `perspective(1800px) rotateY(${ry}deg) translate(${x}px, ${y}px) scale(${s})`, transformOrigin: `${k.ox ?? 960}px ${k.oy ?? 540}px` }}>
        {(() => { const Set = SETS[shot.plate]; return <Set T={T} id={`set${Math.round(shot.a * 100)}`} />; })()}
        {/* grade: lift the shadows to teal, warm the highlights, darken for type */}
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,10,24,0.35) 0%, rgba(4,10,24,0.04) 35%, rgba(4,10,24,0.0) 60%, rgba(2,6,14,0.45) 100%)' }} />
        {(shot.dark ?? 0) > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(4,6,10,${shot.dark})` }} />}
      </AbsoluteFill>
      <Fog T={T} />
      {O && <O T={T} u={u} />}
    </AbsoluteFill>
  );
};

/** two soft fog banks drifting in front of the plate + slow dust */
export const Fog: React.FC<{ T: number }> = ({ T }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
    <div style={{ position: 'absolute', left: -600 + ((T * 22) % 2400) - 300, top: 420, width: 1400, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(150,210,240,0.10) 0%, rgba(150,210,240,0) 70%)' }} />
    <div style={{ position: 'absolute', left: 1700 - ((T * 15) % 2600), top: 160, width: 1600, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(160,200,255,0.07) 0%, rgba(160,200,255,0) 70%)' }} />
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 46 }, (_, i) => {
        const z = 0.4 + rnd(i, 1);
        const x = ((rnd(i, 2) * 2200 + T * 9 * z) % 2200) - 140, y = ((rnd(i, 3) * 1300 - T * 6 * z) % 1300 + 1300) % 1300 - 110;
        return <circle key={i} cx={x} cy={y} r={0.8 + z * 1.6} fill="#d8f0ff" opacity={(0.06 + 0.16 * z) * (0.6 + 0.4 * Math.sin(T * 1.3 + i))} />;
      })}
    </svg>
  </AbsoluteFill>
);

/** warm light leak around cuts (never white) */
export const Leak: React.FC<{ T: number; cuts: number[] }> = ({ T, cuts }) => {
  const k = Math.max(0, ...cuts.map((c) => Math.exp(-Math.pow((T - c) / 0.22, 2))));
  if (k < 0.02) return null;
  return <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.55 * k, background: 'radial-gradient(ellipse 60% 80% at 85% 40%, rgba(80,170,255,0.8) 0%, rgba(40,90,255,0.3) 35%, rgba(0,0,0,0) 70%)' }} />;
};

export const Letterbox: React.FC = () => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
  </>
);

// ------------------------------------------------------------------ kinetic type
/** characters rise in one by one (fast), no slow scaling */
export const Rise: React.FC<{ T: number; at: number; text: string; x: number; y: number; size: number; color?: string; font?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; per?: number; out?: number; glow?: string; spacing?: string }> = ({ T, at, text, x, y, size, color = INK, font = ZH, weight = 900, anchor = 'start', per = 0.035, out, glow, spacing = '0.02em' }) => {
  const chars = [...text];
  const o = out !== undefined ? 1 - easeIn(prog(T, out, out + 0.3)) : 1;
  if (T < at - 0.05 || o <= 0) return null;
  return (
    <text x={x} y={y} textAnchor={anchor} opacity={o} style={{ fontFamily: font, fontWeight: weight, fontSize: size, fill: color, letterSpacing: spacing, filter: glow ? `drop-shadow(0 0 18px ${glow})` : 'drop-shadow(0 4px 18px rgba(0,0,0,0.75))' }}>
      {(() => {
        const off = chars.map((_, i) => (1 - easeOut(prog(T, at + i * per, at + i * per + 0.32))) * 0.35 * size);
        return chars.map((c, i) => <tspan key={i} opacity={1 - off[i] / (0.35 * size)} dy={off[i] - (i > 0 ? off[i - 1] : 0)}>{c}</tspan>);
      })()}
    </text>
  );
};

/** a big number that counts up fast and lands with an RGB split and a kick */
export const BigNum: React.FC<{ T: number; at: number; to: number; from?: number; x: number; y: number; size: number; color: string; glow: string; suffix?: string; anchor?: 'start' | 'middle' | 'end'; dur?: number; out?: number }> = ({ T, at, to, from = 0, x, y, size, color, glow, suffix = '%', anchor = 'start', dur = 0.45, out }) => {
  if (T < at) return null;
  const o = out !== undefined ? 1 - easeIn(prog(T, out, out + 0.3)) : 1;
  const v = Math.round(lerp(from, to, easeOut(prog(T, at, at + dur))));
  const h = hit(T, at + dur, 0.16);
  const kick = 1 + 0.06 * h;
  const style = (fill: string): React.CSSProperties => ({ fontFamily: EN, fontWeight: 700, fontSize: size, fill, fontVariantNumeric: 'lining-nums' });
  const txt = `${v >= 1000 ? v.toLocaleString('en-US') : v}${suffix}`;
  return (
    <g opacity={o * easeOut(prog(T, at, at + 0.12))} transform={`translate(${x} ${y}) scale(${kick}) translate(${-x} ${-y})`}>
      {h > 0.03 && <>
        <text x={x - 10 * h} y={y} textAnchor={anchor} style={style('rgba(255,60,60,0.7)')} opacity={h}>{txt}</text>
        <text x={x + 10 * h} y={y} textAnchor={anchor} style={style('rgba(60,200,255,0.7)')} opacity={h}>{txt}</text>
      </>}
      <text x={x} y={y} textAnchor={anchor} style={{ ...style(color), filter: `drop-shadow(0 0 24px ${glow})` }}>{txt}</text>
    </g>
  );
};

export const Kicker: React.FC<{ T: number; at: number; text: string; x: number; y: number; anchor?: 'start' | 'middle' | 'end'; out?: number; color?: string }> = ({ T, at, text, x, y, anchor = 'start', out, color = DIM }) => {
  const o = easeOut(prog(T, at, at + 0.4)) * (out !== undefined ? 1 - prog(T, out, out + 0.3) : 1);
  if (o <= 0) return null;
  return <text x={x} y={y} textAnchor={anchor} opacity={o} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.42em', fill: color }}>{text}</text>;
};

export { SANS, ZH, MONO, EN, fb, CUT, FILM_END, rnd, hit, prog, easeOut, easeIn, easeInOut, lerp, clamp };
