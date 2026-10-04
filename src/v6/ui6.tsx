import React from 'react';
import { ZH, EN, beats, prog, easeOut, easeInOut, lerp, clamp } from '../lib';
import { Head, HairKind, Mood, SK, INK } from '../v4/Why';
import data from './data.json';

/* 《为什么别人都比我热闹》 shared pieces. Film time T starts at the music's bar 4 (bgm 8.545 s). */
export const MUSIC_START = 8.545;
export const b = (i: number) => {
  const k = Math.floor(i), f = i - k;
  return beats[k] - MUSIC_START + f * (beats[k + 1] - beats[k]);
};
export const FILM_END = b(194) + 7.6; // short cut: end card from b194, film ends ~97.7 s
export const FILM_FRAMES = Math.round(FILM_END * 30);
export const D = data as any;
export { prog, easeOut, easeInOut, lerp, clamp, ZH, EN };
export const easeIn3 = (x: number) => x * x * x;
export const win = (T: number, a: number, z: number, fi = 0.35, fo = 0.35) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));
export const pop = (T: number, a: number, d = 0.3) => {
  const k = clamp((T - a) / d);
  return k <= 0 ? 0 : easeOut(k) + 0.14 * Math.sin(k * Math.PI) * (1 - k);
};
/** log-space zoom between two scales */
export const zlerp = (a: number, z: number, k: number) => Math.exp(lerp(Math.log(a), Math.log(z), k));

export const GOLD = '#f6cf78', BLUE = '#7d9fd8', RED = '#ff6a5c', CREAM = '#f3ede2', NIGHT = '#070a14';
export const GOLD_TEXT: React.CSSProperties = { color: GOLD, textShadow: '0 0 18px rgba(241,197,109,0.45), 0 2px 12px rgba(0,0,0,0.9)' };

const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) =>
    seg.startsWith('[') ? <span key={i} style={GOLD_TEXT}>{seg.slice(1, -1)}</span>
      : seg.startsWith('{') ? <span key={i} style={{ color: '#8fb2ec' }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}</>
);
/** subtitle: 56 px bold serif, gold key words, small English underneath */
export const Sub: React.FC<{ T: number; at: number; out: number; zh: string; en: string }> = ({ T, at, out, zh, en }) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.3)), 1 - prog(T, out - 0.25, out));
  if (o <= 0) return null;
  const rise = (1 - easeOut(prog(T, at, at + 0.4))) * 10;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 880 - 56 * 0.62, textAlign: 'center', opacity: o, transform: `translateY(${rise}px)` }}>
      <div style={{ fontFamily: ZH, fontSize: 56, fontWeight: 700, color: '#f6efe1', letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)' }}><Rich s={zh} /></div>
      <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 24, color: 'rgba(243,237,226,0.42)', marginTop: 6, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{en}</div>
    </div>
  );
};
export type Line = [number, number, string, string];
export const Subs: React.FC<{ T: number; lines: Line[] }> = ({ T, lines }) => <>{lines.map(([a, z, zh, en], i) => <Sub key={i} T={T} at={a} out={z} zh={zh} en={en} />)}</>;
/** a soft dark band behind the subtitles */
export const SubBand: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 330, opacity: o, background: 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0.55) 45%, rgba(5,7,13,0.85) 100%)' }} />
);
/** chapter label, top centre between gold hairlines */
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
/** big number on the right with a counter */
export const Stat: React.FC<{ T: number; at: number; out: number; top: number; value: number; decimals?: number; suffix?: string; unit?: string; label: string; gold?: boolean; count?: number; right?: number }> =
  ({ T, at, out, top, value, decimals = 0, suffix = '', unit = '', label, gold, count = 1.4, right = 64 }) => {
    const o = win(T, at, out, 0.4, 0.3);
    if (o <= 0) return null;
    const v = value * easeOut(prog(T, at, at + count));
    return (
      <div style={{ position: 'absolute', top, right, textAlign: 'right', opacity: o }}>
        <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 84, lineHeight: 1, color: gold ? GOLD : CREAM, fontVariantNumeric: 'tabular-nums', textShadow: gold ? GOLD_TEXT.textShadow : '0 2px 14px rgba(0,0,0,0.9)' }}>
          {v.toFixed(decimals)}{suffix}<span style={{ fontFamily: ZH, fontSize: 44, marginLeft: 6 }}>{unit}</span>
        </div>
        <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.7)', marginTop: 8, letterSpacing: '0.1em' }}>{label}</div>
      </div>
    );
  };
/** small note in a corner, e.g. "示意" or a source */
export const Note: React.FC<{ T: number; at: number; out: number; text: string; x?: number; y?: number; align?: 'left' | 'right' }> = ({ T, at, out, text, x = 64, y = 1030, align = 'left' }) => {
  const o = win(T, at, out, 0.4, 0.3);
  if (o <= 0) return null;
  return <div style={{ position: 'absolute', top: y - 22, [align]: x, opacity: 0.75 * o, fontFamily: ZH, fontSize: 18, letterSpacing: '0.08em', color: 'rgba(243,237,226,0.6)' } as any}>{text}</div>;
};

/* ---------------- people ---------------- */
export type Who = { name: string; hair: HairKind; hairColor: string; shirt: string; glasses?: boolean };
export const CAST: Who[] = [
  { name: '小张', hair: 'slick', hairColor: '#1d1a1c', shirt: '#3b5b8f' },
  { name: '老王', hair: 'slick', hairColor: '#3a2a1f', shirt: '#b5523f' },
  { name: '阿杰', hair: 'cap', hairColor: '#231c18', shirt: '#4f7a5a' },
  { name: '大刘', hair: 'bald', hairColor: '#2a2420', shirt: '#7a6a9e' },
  { name: '小陈', hair: 'slick', hairColor: '#5a3c26', shirt: '#c28a3a', glasses: true },
  { name: '老李', hair: 'cap', hairColor: '#1a1a1a', shirt: '#5f6670' },
];
export const Glasses: React.FC = () => (
  <g stroke={INK} strokeWidth={3.5} fill="rgba(255,255,255,0.12)">
    <circle cx={-14} cy={-6} r={12} /><circle cx={15} cy={-6} r={12} /><path d="M -2 -7 L 3 -7" />
  </g>
);
/** head and shoulders, centred on the head; r is the head radius in px (head drawn at r=44) */
export const Bust: React.FC<{ who: Who; mood: Mood; r?: number; lx?: number; ly?: number; tilt?: number }> = ({ who, mood, r = 44, lx = 0, ly = 0, tilt = 0 }) => (
  <g transform={`scale(${r / 44})`}>
    <path d="M -78 120 Q -74 58 -30 50 L 30 50 Q 74 58 78 120 Z" fill={who.shirt} />
    <path d="M -16 50 L 0 70 L 16 50 Z" fill={SK} opacity={0.9} />
    <Head hair={who.hair} hairColor={who.hairColor} mood={mood} lx={lx} ly={ly} tilt={tilt} />
    {who.glasses && <g transform={`translate(${lx},${ly})`}><Glasses /></g>}
  </g>
);
/** round avatar: a bust clipped to a circle */
export const Avatar: React.FC<{ who: Who; mood: Mood; r: number; ring?: string; ringW?: number; bg?: string; id: string }> = ({ who, mood, r, ring, ringW = 4, bg = '#1c2333', id }) => (
  <g>
    <defs><clipPath id={`av-${id}`}><circle r={r} /></clipPath></defs>
    <circle r={r} fill={bg} />
    <g clipPath={`url(#av-${id})`}><g transform={`translate(0, ${r * 0.08})`}><Bust who={who} mood={mood} r={r * 0.52} /></g></g>
    {ring && <circle r={r} fill="none" stroke={ring} strokeWidth={ringW} />}
  </g>
);
/** heart icon */
export const Heart: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = '#e46a6a' }) => (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M 0 4 C -6 -3 -14 2 -9 8 L 0 16 L 9 8 C 14 2 6 -3 0 4 Z" fill={c} />
);
export const ZERO = 0.0001;
