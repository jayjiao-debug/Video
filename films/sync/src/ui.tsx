import React from 'react';
import {easeOut, inOut, prog} from './lib';
import {C, LATIN, SANS, SERIF} from './look';

/* On-screen text in the reference look: clean bold sans subtitles low in frame, one gold key word
   ([gold] / {red} mark-up), a faint English line under it; a small grey source credit bottom-right;
   big numbers with a two-line caption; the corner mark top-right. Everything is a function of T. */

const GOLD: React.CSSProperties = {color: '#f6cf78', textShadow: '0 0 18px rgba(241,197,109,0.45), 0 2px 10px rgba(0,0,0,0.9)'};
const RED: React.CSSProperties = {color: C.red, textShadow: '0 0 16px rgba(232,115,90,0.4), 0 2px 10px rgba(0,0,0,0.9)'};

export const Rich: React.FC<{s: string}> = ({s}) => (
  <>
    {s
      .split(/(\[[^\]]+\]|\{[^}]+\})/)
      .filter(Boolean)
      .map((seg, i) => (seg.startsWith('[') ? <span key={i} style={GOLD}>{seg.slice(1, -1)}</span> : seg.startsWith('{') ? <span key={i} style={RED}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>))}
  </>
);

/** one subtitle: 46 px bold sans, English 22 px at 45% */
export const Sub: React.FC<{T: number; at: number; out: number; zh: string; en: string}> = ({T, at, out, zh, en}) => {
  const o = inOut(T, at, out, 0.35, 0.3);
  if (o <= 0) return null;
  const rise = (1 - easeOut(prog(T, at, at + 0.45))) * 10;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 878, textAlign: 'center', opacity: o, transform: `translateY(${rise}px)`}}>
      <div style={{fontFamily: SANS, fontSize: 46, fontWeight: 700, color: '#f6f1e6', letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 2px 14px rgba(0,0,0,0.95)'}}>
        <Rich s={zh} />
      </div>
      <div style={{fontFamily: SANS, fontSize: 22, fontWeight: 400, color: 'rgba(243,239,230,0.45)', marginTop: 10, letterSpacing: '0.01em'}}>{en}</div>
    </div>
  );
};

/** source credit, bottom-right, small grey */
export const Credit: React.FC<{T: number; at: number; out: number; text: string}> = ({T, at, out, text}) => {
  const o = inOut(T, at, out, 0.6, 0.4);
  if (o <= 0) return null;
  return <div style={{position: 'absolute', right: 52, bottom: 30, fontFamily: SANS, fontSize: 19, color: 'rgba(243,239,230,0.38)', opacity: o, letterSpacing: '0.02em'}}>{text}</div>;
};

/** a big number with a two-line caption (left or centred) */
export const BigNum: React.FC<{T: number; at: number; out: number; value: string; zh: string; en?: string; x: number; y: number; red?: boolean; size?: number; align?: 'left' | 'center'}> = ({T, at, out, value, zh, en, x, y, red, size = 150, align = 'left'}) => {
  const o = inOut(T, at, out, 0.4, 0.35);
  if (o <= 0) return null;
  const s = 0.9 + 0.1 * easeOut(prog(T, at, at + 0.5));
  return (
    <div style={{position: 'absolute', left: align === 'left' ? x : x - 400, width: align === 'left' ? undefined : 800, top: y, opacity: o, textAlign: align, transform: `scale(${s})`, transformOrigin: align === 'left' ? 'left top' : 'center top'}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, fontVariantNumeric: 'tabular-nums', ...(red ? RED : GOLD)}}>{value}</div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.ink, marginTop: 18, letterSpacing: '0.04em'}}>{zh}</div>
      {en ? <div style={{fontFamily: SANS, fontSize: 19, color: red ? 'rgba(232,115,90,0.75)' : 'rgba(241,197,109,0.75)', marginTop: 8, letterSpacing: '0.16em'}}>{en}</div> : null}
    </div>
  );
};

/** a caption under a particle word: gold serif, spaced English underneath */
export const Caption: React.FC<{T: number; at: number; out: number; zh: string; en: string; y: number}> = ({T, at, out, zh, en, y}) => {
  const o = inOut(T, at, out, 0.6, 0.4);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 64, letterSpacing: '0.22em', ...GOLD}}>{zh}</div>
      <div style={{fontFamily: SANS, fontSize: 20, color: 'rgba(243,239,230,0.6)', letterSpacing: '0.42em', marginTop: 8}}>{en}</div>
    </div>
  );
};

/** chapter label, top centre between gold hairlines: "1905 · 伯 尔 尼" */
export const Chapter: React.FC<{T: number; at: number; out: number; text: string}> = ({T, at, out, text}) => {
  const o = inOut(T, at, out, 0.5, 0.3);
  if (o <= 0) return null;
  const w = 70 * easeOut(prog(T, at, at + 0.7));
  return (
    <div style={{position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: o}}>
      <div style={{width: w, height: 1.5, background: C.line}} />
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.2em', color: C.gold}}>{text}</div>
      <div style={{width: w, height: 1.5, background: C.line}} />
    </div>
  );
};

/** the corner mark, top-right, always on after the title */
export const Corner: React.FC<{o?: number}> = ({o = 1}) => (
  <div style={{position: 'absolute', top: 38, right: 52, fontFamily: SANS, fontSize: 20, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(241,197,109,0.78)', opacity: o}}>
    ◆ Juno <span style={{color: 'rgba(243,239,230,0.55)', fontWeight: 400}}>· VIBE知识大赏</span>
  </div>
);

/** a small axis/label text in Latin numerals */
export const Tag: React.FC<{x: number; y: number; text: string; o?: number; size?: number; color?: string; anchor?: 'left' | 'right' | 'center'}> = ({x, y, text, o = 1, size = 22, color = C.ink, anchor = 'left'}) =>
  o <= 0 ? null : (
    <div style={{position: 'absolute', left: anchor === 'left' ? x : anchor === 'right' ? x - 600 : x - 300, width: anchor === 'left' ? undefined : 600, textAlign: anchor, top: y, fontFamily: SANS, fontSize: size, color, opacity: o, whiteSpace: 'nowrap'}}>
      {text}
    </div>
  );

export {LATIN};
