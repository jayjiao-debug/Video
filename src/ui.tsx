import React from 'react';
import { SANS, MONO } from './lib';
import { Look } from './look';

/* Drawn props for 《草稿箱》: a generic chat app (no real brand). Sent bubbles stand for what you did (they can be
   recalled, answered, forgiven); the unsent draft in the input box stands for what you didn't do (it never closes). */

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };

/** a sent message bubble (right side), w × h, top-left at (0,0) */
export const Sent: React.FC<{ L: Look; text: string; w?: number; size?: number; read?: boolean; recalled?: number }> = ({ L, text, w = 420, size = 30, read = true, recalled = 0 }) => {
  const h = size * 2.3;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={h / 2.4} fill={L.second} opacity={1 - 0.75 * recalled} />
      <text x={w - 26} y={h / 2 + size * 0.36} textAnchor="end" style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, fill: '#0b1020' }} opacity={1 - recalled}>{text}</text>
      {recalled > 0 && <text x={w / 2} y={h / 2 + size * 0.3} textAnchor="middle" opacity={recalled} style={{ fontFamily: SANS, fontSize: size * 0.8, fill: L.dim }}>你撤回了一条消息</text>}
      {read && recalled < 0.5 && <text x={w - 6} y={h + size * 0.75} textAnchor="end" style={{ fontFamily: SANS, fontSize: size * 0.6, fill: L.dim }}>已读</text>}
    </g>
  );
};

/** a received bubble (left side) */
export const Got: React.FC<{ L: Look; text: string; w?: number; size?: number }> = ({ L, text, w = 360, size = 28 }) => {
  const h = size * 2.3;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={h / 2.4} fill="rgba(242,244,248,0.12)" stroke={L.panelEdge} strokeWidth={1.5} />
      <text x={24} y={h / 2 + size * 0.36} style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, fill: L.ink }}>{text}</text>
    </g>
  );
};

/** the input box with an unsent draft; chars = how many characters are typed; cursor blinks with T */
export const InputBox: React.FC<{ L: Look; text: string; chars?: number; T: number; w?: number; size?: number; glow?: number; sendPulse?: number }> = ({ L, text, chars, T, w = 700, size = 32, glow = 0, sendPulse = 0 }) => {
  const shown = [...text].slice(0, chars ?? text.length).join('');
  const h = size * 2.4;
  const cw = size * 1.0; // approx width per CJK char
  const tx = 28 + [...shown].reduce((a, c) => a + (/[\u0000-ÿ]/.test(c) ? cw * 0.55 : cw), 0);
  const blink = Math.floor(T * 2.2) % 2 === 0;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={h / 2} fill="rgba(255,255,255,0.06)" stroke={L.accent} strokeOpacity={0.35 + 0.65 * glow} strokeWidth={2 + 2 * glow}
        style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${18 * glow}px ${L.accentGlow})` } : undefined} />
      <text x={28} y={h / 2 + size * 0.36} style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, fill: L.accent }}>{shown}</text>
      {blink && <rect x={tx + 2} y={h / 2 - size * 0.62} width={3} height={size * 1.24} fill={L.accent} />}
      <g transform={`translate(${w + 18} 0)`}>
        <rect x={0} y={0} width={h * 1.7} height={h} rx={h / 2} fill="rgba(255,255,255,0.08)" stroke={L.panelEdge} strokeWidth={1.5}
          style={sendPulse > 0.05 ? { filter: `drop-shadow(0 0 ${20 * sendPulse}px ${L.accentGlow})` } : undefined} />
        <text x={h * 0.85} y={h / 2 + size * 0.32} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: size * 0.85, fill: sendPulse > 0.05 ? L.accent : L.dim }}>发送</text>
      </g>
    </g>
  );
};

/** a small "草稿" tag */
export const DraftTag: React.FC<{ L: Look; size?: number }> = ({ L, size = 22 }) => (
  <g>
    <rect x={0} y={-size * 1.05} width={size * 2.6} height={size * 1.45} rx={size * 0.3} fill="none" stroke={L.accent} strokeWidth={2} />
    <text x={size * 1.3} y={-size * 0.05} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, fill: L.accent }}>草稿</text>
  </g>
);

/** a chat window (w × h), top-left at (0,0); children are drawn inside in window coordinates */
export const ChatWindow: React.FC<{ L: Look; w: number; h: number; name: string; sub?: string; children?: React.ReactNode; id: string }> = ({ L, w, h, name, sub, children, id }) => (
  <g>
    <defs><clipPath id={`${id}-c`}><rect x={0} y={0} width={w} height={h} rx={30} /></clipPath></defs>
    <rect x={0} y={0} width={w} height={h} rx={30} fill={L.panel} stroke={L.panelEdge} strokeWidth={2} style={{ filter: 'drop-shadow(0 24px 50px rgba(0,0,0,0.55))' }} />
    <g clipPath={`url(#${id}-c)`}>
      <rect x={0} y={0} width={w} height={84} fill="rgba(255,255,255,0.04)" />
      <circle cx={52} cy={42} r={22} fill={L.faint} />
      <text x={90} y={52} style={{ ...BLACK, fontSize: 30, fill: L.ink }}>{name}</text>
      {sub && <text x={w - 30} y={50} textAnchor="end" style={{ fontFamily: SANS, fontSize: 20, fill: L.dim }}>{sub}</text>}
      {children}
    </g>
  </g>
);

export const Kicker: React.FC<{ L: Look; x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }> = ({ L, x, y, text, anchor = 'start' }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.25em', fill: L.dim }}>{text}</text>
);
