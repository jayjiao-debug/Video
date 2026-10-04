import React from 'react';
import { ZH, EN, prog, easeOut } from './lib';

/* On-screen text in the house style: bold serif subtitles at the bottom, gold key words, a faint English line,
   a chapter label top-centre between gold hairlines, counters top-right. Everything is a function of T (seconds).
   Mark-up inside a line: [gold words]  {red words}.
   Gold is a solid colour plus a glow: gradient text with background-clip disappears in headless renders. */

export const GOLD_TEXT: React.CSSProperties = { color: '#f6cf78', textShadow: '0 0 18px rgba(241,197,109,0.45), 0 2px 12px rgba(0,0,0,0.9)' };
const win = (T: number, a: number, z: number, fi = 0.35, fo = 0.35) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));

export const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) =>
    seg.startsWith('[') ? <span key={i} style={GOLD_TEXT}>{seg.slice(1, -1)}</span>
      : seg.startsWith('{') ? <span key={i} style={{ color: '#ff6a5c' }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}</>
);

/** one subtitle line: 56 px bold serif, English 24 px italic at 42% */
export const Sub: React.FC<{ T: number; at: number; out: number; zh: string; en: string }> = ({ T, at, out, zh, en }) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.35)), 1 - prog(T, out - 0.3, out));
  if (o <= 0) return null;
  const rise = (1 - easeOut(prog(T, at, at + 0.45))) * 12;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 880 - 56 * 0.62, textAlign: 'center', opacity: o, transform: `translateY(${rise}px)` }}>
      <div style={{ fontFamily: ZH, fontSize: 56, fontWeight: 700, color: '#f6efe1', letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)' }}><Rich s={zh} /></div>
      <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 24, color: 'rgba(243,237,226,0.42)', marginTop: 6, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{en}</div>
    </div>
  );
};

/** chapter label, top centre: "1912 · 北 大 西 洋" (spaced characters) */
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

/** a counter top-right that counts up to its value */
export const Stat: React.FC<{ T: number; at: number; out: number; value: number; label: string; top: number; gold?: boolean }> = ({ T, at, out, value, label, top, gold }) => {
  const o = win(T, at, out, 0.4, 0.3);
  if (o <= 0) return null;
  const n = Math.round(value * Math.min(1, Math.max(0, (T - at) / 1.6)));
  return (
    <div style={{ position: 'absolute', top, right: 64, textAlign: 'right', opacity: o }}>
      <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 78, lineHeight: 1, color: gold ? '#f6cf78' : '#f3ede2', fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>{n.toLocaleString('en-US')}</div>
      <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.65)', marginTop: 6, letterSpacing: '0.12em' }}>{label}</div>
    </div>
  );
};

/** dark band under the subtitles; put it above the scene, below the text */
export const SubBand: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0.55) 55%, rgba(5,7,13,0.8) 100%)' }} />
);
