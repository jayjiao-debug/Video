import React from 'react';
import {clamp, lerp} from '../lib';
import {SANS} from '../look';
import {anim, M} from '../m3';

/* v2 kit: the pieces that make it feel like a maths film rather than slides.
   - World: a 2D camera (centre x,y and zoom) around everything drawn in world pixels, so scenes
     are explored with pushes and pans instead of cut away
   - one object turns into the next (a number line becomes an axis, a curve becomes a ridge)
   - annotations live in the picture: labels, braces, boxes, tracker numbers
   All pure functions of the global time T. */
export const W = 1920;
export const H = 1080;

export type View = {x: number; y: number; z: number};
/** eased camera through [time, view] keys (Manim-smooth between keys) */
export const view = (T: number, ks: [number, View][]): View => {
  if (T <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [ta, a] = ks[i];
    const [tb, b] = ks[i + 1];
    if (T <= tb) {
      const k = anim(T, ta, tb - ta);
      // zoom interpolated in log space so pushes feel even
      return {x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), k))};
    }
  }
  return ks[ks.length - 1][1];
};
export const World: React.FC<{v: View; children: React.ReactNode; o?: number}> = ({v, children, o = 1}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o, transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H / 2}px) scale(${v.z}) translate(${-v.x}px, ${-v.y}px)`}}>
    {children}
  </div>
);

/** text placed by its centre in world pixels */
export const At: React.FC<{x: number; y: number; o?: number; s?: number; children: React.ReactNode; anchor?: 'c' | 'l' | 'r'}> = ({x, y, o = 1, s = 1, children, anchor = 'c'}) =>
  o <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, opacity: clamp(o), transform: `translate(${anchor === 'c' ? -50 : anchor === 'l' ? 0 : -100}%, -50%) scale(${s})`, whiteSpace: 'nowrap', transformOrigin: anchor === 'l' ? '0 50%' : anchor === 'r' ? '100% 50%' : '50% 50%'}}>
      {children}
    </div>
  );
export const Label: React.FC<{c?: string; size?: number; w?: number; children: React.ReactNode}> = ({c = M.white, size = 40, w = 500, children}) => (
  <span style={{fontFamily: SANS, fontSize: size, fontWeight: w, color: c, letterSpacing: '0.02em'}}>{children}</span>
);

/** curly brace under (dir 1) or over (dir -1) a horizontal span */
export const braceD = (x0: number, x1: number, y: number, dir = 1, h = 26) => {
  const m = (x0 + x1) / 2;
  const q = h * dir;
  return `M ${x0} ${y} C ${x0} ${y + q * 0.6}, ${x0 + 14} ${y + q * 0.5}, ${x0 + 30} ${y + q * 0.5} L ${m - 26} ${y + q * 0.5} C ${m - 10} ${y + q * 0.5}, ${m} ${y + q * 0.7}, ${m} ${y + q} C ${m} ${y + q * 0.7}, ${m + 10} ${y + q * 0.5}, ${m + 26} ${y + q * 0.5} L ${x1 - 30} ${y + q * 0.5} C ${x1 - 14} ${y + q * 0.5}, ${x1} ${y + q * 0.6}, ${x1} ${y}`;
};

/** polyline path from points */
export const pathOf = (pts: number[][]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
/** same-length point lists blended: the Transform move */
export const morph = (a: number[][], b: number[][], k: number) => a.map((p, i) => [lerp(p[0], b[i][0], k), lerp(p[1], b[i][1], k)]);

/** standard normal pdf / cdf */
export const phi = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
export const Phi = (x: number) => {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x / 2);
  return x >= 0 ? (1 + y) / 2 : (1 - y) / 2;
};
/** learning speed for a learner at difficulty Δ (Wilson et al. 2019): ∝ Δ·φ(Δ), normalised to 1 at Δ = 1,
    where the accuracy Φ(Δ) ≈ 84.1% */
export const learn = (d: number) => d * Math.exp(-(d * d - 1) / 2);

/** a source line, bottom right, small */
export const Credit: React.FC<{o: number; children: React.ReactNode}> = ({o, children}) =>
  o <= 0 ? null : <div style={{position: 'absolute', right: 56, bottom: 30, fontFamily: SANS, fontSize: 17, color: 'rgba(255,255,255,0.4)', opacity: o}}>{children}</div>;
