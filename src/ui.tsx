import React from 'react';
import { SANS, MONO, rnd, clamp } from './lib';
import { Look } from './look';

/* Shared drawn props for 《筛子》 in the "划卡" look: a generic dating-app phone (no real brand), profile cards with
   two bars (颜值 / 性格), swipe stamps, app buttons, a push notification, map pins and the sieve. All SVG, all
   centred on (0, 0) so callers place them with a transform. Faces are abstract silhouettes, never real people. */

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };
const NAMES = ['小林', '阿哲', '小周', '若溪', '大宇', '一一', '小满', '阿森', '安然', '小北', '木木', '橙子', '阿杰', '七七'];
const HUES = [330, 285, 200, 20, 165, 250, 350, 40, 190, 300];

export const CW = 300, CH = 420;

/** a profile card: avatar silhouette, name, two bars. looks/pers in [0,1]. stamp: 'no' | 'yes' with strength */
export const ProfileCard: React.FC<{ L: Look; id: string; seed: number; looks: number; pers: number; stamp?: 'no' | 'yes'; stampK?: number; barsK?: number; glow?: number }> = ({ L, id, seed, looks, pers, stamp, stampK = 0, barsK = 1, glow = 0 }) => {
  const h = HUES[seed % HUES.length], h2 = (h + 40) % 360;
  const name = NAMES[seed % NAMES.length], age = 20 + Math.floor(rnd(seed, 3) * 9);
  const bw = 170;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-av`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${h} 70% 62%)`} /><stop offset="1" stopColor={`hsl(${h2} 65% 30%)`} />
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#140a17" stopOpacity="0" /><stop offset="1" stopColor="#140a17" stopOpacity="0.95" />
        </linearGradient>
        <clipPath id={`${id}-clip`}><rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={26} /></clipPath>
      </defs>
      {glow > 0 && <rect x={-CW / 2 - 6} y={-CH / 2 - 6} width={CW + 12} height={CH + 12} rx={30} fill="none" stroke={L.accent} strokeWidth={4} opacity={glow} style={{ filter: `drop-shadow(0 0 18px ${L.accentGlow})` }} />}
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} fill="#1b0e1f" />
        <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH * 0.72} fill={`url(#${id}-av)`} />
        {/* abstract silhouette */}
        <circle cx={0} cy={-CH / 2 + 118} r={50} fill="rgba(20,8,24,0.42)" />
        <path d={`M ${-105} ${-CH / 2 + 305} C ${-100} ${-CH / 2 + 205}, ${100} ${-CH / 2 + 205}, ${105} ${-CH / 2 + 305} Z`} fill="rgba(20,8,24,0.42)" />
        <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH * 0.72} fill={`url(#${id}-fade)`} />
      </g>
      <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={26} fill="none" stroke="rgba(255,242,246,0.16)" strokeWidth={2} />
      <text x={-CW / 2 + 24} y={CH / 2 - 128} style={{ ...BLACK, fontSize: 32, fill: '#fff2f6' }}>{name}<tspan style={{ fontWeight: 500, fontSize: 26 }} fill="rgba(255,242,246,0.75)">  {age}</tspan></text>
      {[['颜值', looks, L.accent], ['性格', pers, L.second]].map(([lab, v, c], k) => (
        <g key={k} transform={`translate(${-CW / 2 + 24} ${CH / 2 - 84 + k * 40})`}>
          <text x={0} y={8} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, fill: 'rgba(255,242,246,0.75)' }}>{lab as string}</text>
          <rect x={60} y={-6} width={bw} height={14} rx={7} fill="rgba(255,242,246,0.12)" />
          <rect x={60} y={-6} width={bw * clamp(v as number) * barsK} height={14} rx={7} fill={c as string} />
        </g>
      ))}
      {stamp && stampK > 0 && (
        <g transform={`translate(${stamp === 'yes' ? -60 : 60} ${-CH / 2 + 70}) rotate(${stamp === 'yes' ? -16 : 16}) scale(${1.4 - 0.4 * Math.min(1, stampK)})`} opacity={Math.min(1, stampK)}>
          <rect x={-78} y={-34} width={156} height={68} rx={10} fill="none" stroke={stamp === 'yes' ? L.second : '#ff5a5a'} strokeWidth={6} />
          <text x={0} y={16} textAnchor="middle" style={{ ...BLACK, fontSize: 44, fill: stamp === 'yes' ? L.second : '#ff5a5a' }}>{stamp === 'yes' ? '喜欢' : '划走'}</text>
        </g>
      )}
    </g>
  );
};

/** round app buttons: ✕ (left) and ♥ (right) */
export const AppButton: React.FC<{ L: Look; kind: 'no' | 'yes'; r?: number; press?: number }> = ({ L, kind, r = 44, press = 0 }) => {
  const c = kind === 'yes' ? L.accent : 'rgba(255,242,246,0.85)';
  return (
    <g transform={`scale(${1 - 0.12 * press})`}>
      <circle r={r} fill="rgba(30,14,34,0.92)" stroke={c} strokeWidth={3} style={{ filter: press > 0.05 ? `drop-shadow(0 0 ${20 * press}px ${kind === 'yes' ? L.accentGlow : 'rgba(255,242,246,0.6)'})` : undefined }} />
      {kind === 'no'
        ? <path d={`M ${-r * 0.32} ${-r * 0.32} L ${r * 0.32} ${r * 0.32} M ${r * 0.32} ${-r * 0.32} L ${-r * 0.32} ${r * 0.32}`} stroke={c} strokeWidth={r * 0.14} strokeLinecap="round" />
        : <path d={heart(r * 0.42)} fill={c} />}
    </g>
  );
};
export const heart = (s: number) => `M 0 ${s * 0.95} C ${-s * 1.6} ${-s * 0.1}, ${-s * 0.75} ${-s * 1.25}, 0 ${-s * 0.45} C ${s * 0.75} ${-s * 1.25}, ${s * 1.6} ${-s * 0.1}, 0 ${s * 0.95} Z`;

/** the phone: 440 × 880, screen inset; children are drawn in screen coordinates centred on (0, 0) */
export const Phone: React.FC<{ L: Look; children?: React.ReactNode; id: string }> = ({ L, children, id }) => (
  <g>
    <defs><clipPath id={`${id}-scr`}><rect x={-200} y={-410} width={400} height={820} rx={46} /></clipPath></defs>
    <rect x={-220} y={-440} width={440} height={880} rx={64} fill="#0d070f" stroke="rgba(255,242,246,0.22)" strokeWidth={3} style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.7))' }} />
    <rect x={-200} y={-410} width={400} height={820} rx={46} fill="#150a18" />
    <g clipPath={`url(#${id}-scr)`}>
      {/* app header (generic) */}
      <text x={-170} y={-352} style={{ ...BLACK, fontSize: 30, fill: L.accent }}>心动<tspan fill="#fff2f6">·附近</tspan></text>
      <circle cx={160} cy={-362} r={16} fill="none" stroke="rgba(255,242,246,0.5)" strokeWidth={3} />
      {children}
    </g>
    <rect x={-60} y={-428} width={120} height={22} rx={11} fill="#000" />
  </g>
);

/** a push notification banner (generic news app) */
export const Notice: React.FC<{ L: Look; title: string; body: string; w?: number }> = ({ L, title, body, w = 820 }) => (
  <g>
    <rect x={-w / 2} y={-62} width={w} height={124} rx={28} fill="rgba(40,22,46,0.94)" stroke="rgba(255,242,246,0.14)" strokeWidth={2} style={{ filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.6))' }} />
    <rect x={-w / 2 + 26} y={-36} width={44} height={44} rx={11} fill={L.accent} />
    <text x={-w / 2 + 48} y={-5} textAnchor="middle" style={{ ...BLACK, fontSize: 26, fill: '#1b0e1f' }}>讯</text>
    <text x={-w / 2 + 88} y={-14} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, fill: 'rgba(255,242,246,0.6)' }}>新闻 · 刚刚</text>
    <text x={-w / 2 + 88} y={22} style={{ ...BLACK, fontSize: 34, fill: '#fff2f6' }}>{title}</text>
    <text x={-w / 2 + 88} y={52} style={{ fontFamily: SANS, fontSize: 22, fill: 'rgba(255,242,246,0.7)' }}>{body}</text>
  </g>
);

/** a map pin with a rating */
export const Pin: React.FC<{ L: Look; rating: number; closed?: number; s?: number }> = ({ L, rating, closed = 0, s = 1 }) => {
  const c = closed > 0.5 ? 'rgba(255,242,246,0.35)' : L.accent;
  return (
    <g transform={`scale(${s})`}>
      <path d="M 0 0 C -10 -18, -26 -30, -26 -46 A 26 26 0 1 1 26 -46 C 26 -30, 10 -18, 0 0 Z" fill={c} style={{ filter: closed > 0.5 ? undefined : `drop-shadow(0 0 8px ${L.accentGlow})` }} />
      <circle cx={0} cy={-46} r={10} fill="#1b0e1f" />
      <g transform="translate(0 -92)">
        <rect x={-46} y={-20} width={92} height={34} rx={17} fill="rgba(30,14,34,0.92)" stroke="rgba(255,242,246,0.2)" strokeWidth={1.5} />
        <text x={0} y={5} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, fill: closed > 0.5 ? 'rgba(255,242,246,0.4)' : '#ffd36b' }}>★{rating.toFixed(1)}</text>
      </g>
      {closed > 0 && (
        <g opacity={closed} transform="translate(0 -46) rotate(-12)">
          <rect x={-46} y={-16} width={92} height={32} rx={6} fill="rgba(20,8,24,0.9)" stroke="#ff5a5a" strokeWidth={3} />
          <text x={0} y={8} textAnchor="middle" style={{ ...BLACK, fontSize: 20, fill: '#ff5a5a' }}>已歇业</text>
        </g>
      )}
    </g>
  );
};
