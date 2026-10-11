import React from 'react';
import { b, prog, easeOut, easeInOut, lerp, clamp } from '../v6/ui6';

/* 《越修越堵》 look: night, long-exposure light, thin sans type. No people anywhere. */
export { b, prog, easeOut, easeInOut, lerp, clamp };
export const SANS = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif';
export const MONO = '"DejaVu Sans Mono", monospace';
export const INK = '#030409';
export const WHITE = '#f3f1ec';
export const AMBER = '#ffb347';
export const RED = '#ff4b3a';
export const ICE = '#9fe3ff';
export const DIMW = 'rgba(243,241,236,0.5)';

export const win = (T: number, a: number, z: number, fi = 0.3, fo = 0.3) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));
export const smooth = (a: number, z: number, x: number) => { const t = clamp((x - a) / (z - a)); return t * t * (3 - 2 * t); };
/** congestion colour: 0 = free (warm white) .. 1 = jammed (red) */
export const heat = (k: number): [number, number, number] => {
  const a: [number, number, number] = [255, 236, 205], m: [number, number, number] = [255, 170, 70], z: [number, number, number] = [255, 58, 40];
  const c = clamp(k);
  return c < 0.5 ? a.map((v, i) => lerp(v, m[i], c * 2)) as any : m.map((v, i) => lerp(v, z[i], (c - 0.5) * 2)) as any;
};
export const rgb = (c: number[], a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

const HL: React.CSSProperties = { color: AMBER, textShadow: '0 0 22px rgba(255,170,60,0.55), 0 2px 12px rgba(0,0,0,0.9)' };
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\])/).filter(Boolean).map((seg, i) => seg.startsWith('[') ? <span key={i} style={HL}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}</>
);
export type Line9 = [number, number, string, string];
/** subtitle: 54 px medium sans, amber key words, small English underneath */
export const Sub9: React.FC<{ T: number; at: number; out: number; zh: string; en: string }> = ({ T, at, out, zh, en }) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.22)), 1 - prog(T, out - 0.2, out));
  if (o <= 0) return null;
  const blur = (1 - easeOut(prog(T, at, at + 0.3))) * 6;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 846, textAlign: 'center', opacity: o, filter: blur > 0.1 ? `blur(${blur}px)` : undefined }}>
      <div style={{ fontFamily: SANS, fontSize: 54, fontWeight: 500, color: WHITE, letterSpacing: '0.05em', lineHeight: 1.25, textShadow: '0 2px 16px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)' }}><Rich s={zh} /></div>
      <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 22, color: 'rgba(243,241,236,0.42)', marginTop: 8, letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{en}</div>
    </div>
  );
};
export const Subs9: React.FC<{ T: number; lines: Line9[] }> = ({ T, lines }) => <>{lines.map(([a, z, zh, en], i) => <Sub9 key={i} T={T} at={a} out={z} zh={zh} en={en} />)}</>;
export const Band9: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, opacity: o, background: 'linear-gradient(180deg, rgba(3,4,9,0) 0%, rgba(3,4,9,0.6) 50%, rgba(3,4,9,0.88) 100%)' }} />
);
/** chapter tag, top centre: "02 ─ 近路" in mono */
export const Tag9: React.FC<{ T: number; at: number; out: number; n: string; text: string }> = ({ T, at, out, n, text }) => {
  const o = win(T, at, out, 0.5, 0.3);
  if (o <= 0) return null;
  const w = 56 * easeOut(prog(T, at, at + 0.8));
  return (
    <div style={{ position: 'absolute', top: 42, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: o }}>
      <span style={{ fontFamily: MONO, fontSize: 18, color: AMBER, letterSpacing: '0.2em' }}>{n}</span>
      <div style={{ width: w, height: 1, background: 'rgba(255,179,71,0.7)' }} />
      <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 22, letterSpacing: '0.4em', color: 'rgba(243,241,236,0.8)' }}>{text}</span>
    </div>
  );
};
/** small note bottom-left: sources, 示意 */
export const Note9: React.FC<{ T: number; at: number; out: number; text: string; right?: boolean }> = ({ T, at, out, text, right }) => {
  const o = win(T, at, out, 0.4, 0.3);
  if (o <= 0) return null;
  return <div style={{ position: 'absolute', bottom: 34, ...(right ? { right: 56, textAlign: 'right' } : { left: 56 }), opacity: 0.75 * o, fontFamily: SANS, fontWeight: 300, fontSize: 17, letterSpacing: '0.04em', color: 'rgba(243,241,236,0.55)' }}>{text}</div>;
};
/** a mono HUD label */
export const Hud: React.FC<{ x: number; y: number; o: number; children: React.ReactNode; size?: number; color?: string; align?: 'left' | 'center' | 'right' }> = ({ x, y, o, children, size = 20, color = DIMW, align = 'left' }) =>
  o <= 0.001 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, opacity: o, transform: `translate(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'}, -50%)`, whiteSpace: 'nowrap', fontFamily: MONO, fontSize: size, letterSpacing: '0.12em', color, textShadow: '0 0 10px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)' }}>{children}</div>
  );
