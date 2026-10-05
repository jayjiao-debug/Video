// @ts-expect-error katex ships no types here
import katex from 'katex';
import React from 'react';
import {clamp, easeInOut, prog} from './lib';
import {SANS} from './look';

/* A small kit for the 3Blue1Brown look (Manim's palette and motion on a black frame):
   - colours: one per quantity, used everywhere that quantity appears
   - Create: a stroke that draws itself (pathLength 1 + dash offset)
   - Write: text/maths revealed left to right as an outline that then fills
   - TeX: KaTeX (Computer Modern), the LaTeX look
   Everything is a pure function of the progress values passed in. */
export const M = {
  bg: '#000000',
  white: '#FFFFFF',
  grey: '#888888',
  greyB: '#BBBBBB',
  blue: '#58C4DD',
  blueD: '#29ABCA',
  teal: '#5CD0B3',
  green: '#83C167',
  yellow: '#FFFF00',
  gold: '#F0AC5F',
  red: '#FC6255',
  purple: '#9A72AC',
};
/** Manim's "smooth" rate function (a soft sigmoid), on [0,1] */
export const smooth = (x: number) => {
  const t = clamp(x);
  const s = 1 / (1 + Math.exp(-10 * (t - 0.5)));
  const s0 = 1 / (1 + Math.exp(5));
  return (s - s0) / (1 - 2 * s0);
};
/** progress of an animation that runs from a to a+d seconds, with Manim's smooth rate */
export const anim = (T: number, a: number, d = 1) => smooth(prog(T, a, a + d));

/** an SVG path that draws itself as p goes 0 → 1 */
export const Create: React.FC<{d: string; p: number; color: string; w?: number; fill?: string; fillO?: number; dash?: string}> = ({d, p, color, w = 4, fill = 'none', fillO = 0, dash}) =>
  p <= 0 ? null : (
    <>
      {fill !== 'none' && fillO > 0 ? <path d={d} fill={fill} fillOpacity={fillO * clamp((p - 0.6) / 0.4)} stroke="none" /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={dash ? undefined : '1 1'} strokeDashoffset={dash ? undefined : 1 - p} style={dash ? {strokeDasharray: dash, opacity: clamp(p * 3)} : undefined} />
    </>
  );

/** text revealed like Manim's Write: outline sweeps in left to right, then the fill comes in */
export const Write: React.FC<{p: number; children: React.ReactNode; style?: React.CSSProperties; color?: string}> = ({p, children, style, color = M.white}) => {
  if (p <= 0) return null;
  const sweep = clamp(p / 0.7);
  const fill = clamp((p - 0.45) / 0.55);
  return (
    <div style={{position: 'absolute', ...style, clipPath: `inset(-20% ${(1 - sweep) * 100}% -20% -5%)`}}>
      <div style={{color: `rgba(0,0,0,0)`, WebkitTextStroke: `1.2px ${color}`, position: 'absolute', inset: 0, opacity: 1 - fill}}>{children}</div>
      <div style={{color, opacity: fill}}>{children}</div>
    </div>
  );
};

/** LaTeX via KaTeX (rendered to HTML: Computer Modern, the look of every 3b1b equation) */
export const TeX: React.FC<{tex: string; size?: number; color?: string; display?: boolean}> = ({tex, size = 48, color = M.white, display}) => (
  <span style={{fontSize: size, color, lineHeight: 1}} dangerouslySetInnerHTML={{__html: katex.renderToString(tex, {throwOnError: false, displayMode: !!display, output: 'html'})}} />
);

/** subtitle in this look: plain white sans, the key word in its quantity's colour, faint English */
export const Sub3: React.FC<{T: number; at: number; out: number; zh: React.ReactNode; en: string}> = ({T, at, out, zh, en}) => {
  const o = Math.min(easeInOut(prog(T, at, at + 0.3)), 1 - prog(T, out - 0.25, out));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: SANS, fontSize: 44, fontWeight: 600, color: M.white, letterSpacing: '0.03em'}}>{zh}</div>
      <div style={{fontFamily: SANS, fontSize: 21, color: 'rgba(255,255,255,0.45)', marginTop: 8}}>{en}</div>
    </div>
  );
};
export const C3: React.FC<{c: string; children: React.ReactNode}> = ({c, children}) => <span style={{color: c}}>{children}</span>;
