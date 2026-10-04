import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { ZH, EN, GOLD, RED, prog, easeOut } from './lib';

/* On-screen text in the house style (video engine V1): bold serif subtitles at the bottom, gold key words with a glow,
   a faint English line, a chapter label top-centre between gold hairlines. Mark-up: [gold]  {red}.
   Gold is a solid colour plus a glow: gradient text with background-clip disappears in headless renders. */
export const GOLD_TEXT: React.CSSProperties = { color: GOLD, textShadow: '0 0 18px rgba(241,197,109,0.45), 0 2px 12px rgba(0,0,0,0.9)' };

export const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) =>
    seg.startsWith('[') ? <span key={i} style={GOLD_TEXT}>{seg.slice(1, -1)}</span>
      : seg.startsWith('{') ? <span key={i} style={{ color: RED }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}</>
);

/** one subtitle line: 56 px bold serif, English 24 px italic at 42% */
export const Sub: React.FC<{ T: number; at: number; out: number; zh: string; en: string }> = ({ T, at, out, zh, en }) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.35)), 1 - prog(T, out - 0.3, out));
  if (o <= 0) return null;
  const rise = (1 - easeOut(prog(T, at, at + 0.45))) * 12;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 880 - 56 * 0.62, textAlign: 'center', opacity: o, transform: `translateY(${rise}px)` }}>
      <div style={{ fontFamily: ZH, fontSize: 56, fontWeight: 700, color: '#f6efe1', letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)', fontVariantNumeric: 'lining-nums' }}><Rich s={zh} /></div>
      <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 24, color: 'rgba(243,237,226,0.42)', marginTop: 6, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{en}</div>
    </div>
  );
};

/** subtitles from a table: [at, out, zh, en] */
export type Line = [number, number, string, string];
export const Subs: React.FC<{ T: number; lines: Line[] }> = ({ T, lines }) => <>{lines.map(([a, z, zh, en], i) => <Sub key={i} T={T} at={a} out={z} zh={zh} en={en} />)}</>;

/** chapter label, top centre: "1881 · 华 盛 顿" (spaced characters) */
export const Chapter: React.FC<{ T: number; at: number; out: number; text: string }> = ({ T, at, out, text }) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.5)), 1 - prog(T, out - 0.3, out));
  if (o <= 0) return null;
  const w = 70 * easeOut(prog(T, at, at + 0.7));
  return (
    <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: o }}>
      <div style={{ width: w, height: 1.5, background: 'rgba(241,197,109,0.7)' }} />
      <div style={{ fontFamily: ZH, fontWeight: 600, fontSize: 24, letterSpacing: '0.18em', color: '#f1c56d', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{text}</div>
      <div style={{ width: w, height: 1.5, background: 'rgba(241,197,109,0.7)' }} />
    </div>
  );
};

/** dark band under the subtitles; put it above the scene, below the text */
export const SubBand: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, opacity: o, background: 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0.55) 55%, rgba(5,7,13,0.8) 100%)' }} />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)` }} />
);

export const Grain: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.06, pointerEvents: 'none' }}>
    <Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} />
  </AbsoluteFill>
);
