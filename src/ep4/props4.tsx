import React from 'react';
import { C, ZH, EN } from '../lib';
import { PeepFig } from '../v/scenesV';
import { INK, CREAM, ROUGE } from '../ep3/props';

const g = { strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/** gold coin, origin centre */
export const Coin: React.FC<{ r?: number }> = ({ r = 22 }) => (
  <g {...g}>
    <ellipse cx={0} cy={r * 0.18} rx={r} ry={r * 0.9} fill="#b88a3a" stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={0} rx={r} ry={r * 0.9} fill="#e8b85a" stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={0} rx={r * 0.62} ry={r * 0.55} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.6} />
  </g>
);

/** a stack of n coins, origin at the bottom coin centre */
export const CoinStack: React.FC<{ n: number; r?: number; p?: number }> = ({ n, r = 18, p = 1 }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const a = Math.max(0, Math.min(1, p * n - i));
    return a > 0 ? <g key={i} transform={`translate(0 ${-i * r * 0.55 - (1 - a) * 20})`} opacity={a}><Coin r={r} /></g> : null;
  })}</g>
);

/** trophy, origin bottom-centre */
export const Trophy: React.FC = () => (
  <g {...g}>
    <path d="M -46 -150 Q -90 -150 -80 -110 Q -70 -80 -36 -84" fill="none" stroke={INK} strokeWidth={12} />
    <path d="M 46 -150 Q 90 -150 80 -110 Q 70 -80 36 -84" fill="none" stroke={INK} strokeWidth={12} />
    <path d="M -46 -150 Q -90 -150 -80 -110 Q -70 -80 -36 -84" fill="none" stroke="#e8b85a" strokeWidth={5} />
    <path d="M 46 -150 Q 90 -150 80 -110 Q 70 -80 36 -84" fill="none" stroke="#e8b85a" strokeWidth={5} />
    <path d="M -56 -160 L 56 -160 Q 56 -70 0 -58 Q -56 -70 -56 -160 Z" fill="#e8b85a" stroke={INK} strokeWidth={5} />
    <path d="M -10 -58 L 10 -58 L 14 -30 L -14 -30 Z" fill="#e8b85a" stroke={INK} strokeWidth={4} />
    <rect x={-40} y={-30} width={80} height={30} rx={4} fill="#8a5a36" stroke={INK} strokeWidth={5} />
    <path d="M -30 -140 Q -28 -100 -12 -84" fill="none" stroke="#fff3cf" strokeWidth={5} opacity={0.8} />
  </g>
);

/* icons for the four rules (origin centre, ~120px) */
export const IconHeart: React.FC<{ bandage?: boolean }> = ({ bandage }) => (
  <g {...g}>
    <path d="M 0 44 C -34 20 -52 2 -48 -20 C -44 -42 -14 -46 0 -22 C 14 -46 44 -42 48 -20 C 52 2 34 20 0 44 Z" fill={ROUGE} stroke={INK} strokeWidth={5} />
    {bandage && (
      <g transform="rotate(-30)">
        <rect x={-40} y={-11} width={80} height={22} rx={8} fill={CREAM} stroke={INK} strokeWidth={4} />
        {[-10, 0, 10].map((x) => <circle key={x} cx={x} cy={0} r={2.5} fill={INK} />)}
      </g>
    )}
    {!bandage && <path d="M -30 -22 Q -28 -32 -18 -34" fill="none" stroke={CREAM} strokeWidth={4} />}
  </g>
);
export const IconShield: React.FC = () => (
  <g {...g}>
    <path d="M 0 -56 L 46 -38 L 42 10 Q 34 40 0 56 Q -34 40 -42 10 L -46 -38 Z" fill="#6f7d91" stroke={INK} strokeWidth={5} />
    <path d="M 0 -40 L 30 -28 L 27 6 Q 22 28 0 40 Z" fill={CREAM} opacity={0.35} />
    <path d="M -16 0 L -4 14 L 20 -14" fill="none" stroke={CREAM} strokeWidth={7} />
  </g>
);
export const IconEye: React.FC = () => (
  <g {...g}>
    <path d="M -58 0 Q 0 -52 58 0 Q 0 52 -58 0 Z" fill={CREAM} stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={0} r={20} fill="#5a7db0" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={0} r={8} fill={INK} />
    <circle cx={7} cy={-7} r={4} fill={CREAM} />
  </g>
);

/** the two cards: 合作 / 背叛 (DOM) */
export const PlayCard: React.FC<{ kind: 'c' | 'd'; w?: number; o?: number; hi?: number }> = ({ kind, w = 150, o = 1, hi = 0 }) => (
  <div style={{ width: w, height: w * 1.3, borderRadius: 14, background: kind === 'c' ? CREAM : ROUGE, border: `5px solid ${INK}`, opacity: o,
    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hi > 0 ? `0 0 ${30 * hi}px rgba(240,213,154,${0.8 * hi})` : '0 10px 24px rgba(0,0,0,0.45)',
    fontFamily: ZH, fontWeight: 700, fontSize: w * 0.3, color: kind === 'c' ? INK : CREAM, letterSpacing: '0.08em' }}>
    {kind === 'c' ? '合作' : '背叛'}
  </div>
);

/** a strategy, personified: Peep bust in a round frame + name */
export type Strat = { name: string; face: string; hair: string; body: string; acc?: string; fh?: string; bg: string };
export const Avatar: React.FC<{ s: Strat; d: number; x: number; y: number; o?: number; ring?: string; glow?: number; label?: boolean; lsize?: number }> = ({ s, d, x, y, o = 1, ring = INK, glow = 0, label = true, lsize = 26 }) => (
  <div style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, opacity: o }}>
    <div style={{ width: d, height: d, borderRadius: d / 2, overflow: 'hidden', background: s.bg, border: `${Math.max(4, d * 0.04)}px solid ${ring}`, position: 'relative',
      boxShadow: glow > 0 ? `0 0 ${40 * glow}px rgba(240,213,154,${0.9 * glow})` : '0 8px 20px rgba(0,0,0,0.45)' }}>
      <PeepFig body={s.body} face={s.face} hair={s.hair} acc={s.acc} fh={s.fh} x={d * 0.5} y={d * 1.16} h={d * 1.12} glow={false} />
    </div>
    {label && <div style={{ marginTop: 8, textAlign: 'center', fontFamily: ZH, fontSize: lsize, color: C.paper, whiteSpace: 'nowrap', marginLeft: -60, marginRight: -60 }}>{s.name}</div>}
  </div>
);

export const STRATS: Strat[] = [
  { name: '一报还一报', face: 'Smile', hair: 'Short', body: 'ButtonShirt', bg: '#e8c78d' },
  { name: '永远背叛', face: 'Contempt', hair: 'Mohawk', body: 'Hoodie', bg: '#c98a80' },
  { name: '永远合作', face: 'Cute', hair: 'Bun', body: 'Sweater', bg: '#cfe0de' },
  { name: '永不原谅', face: 'Serious', hair: 'FlatTop', body: 'ArmsCrossed', bg: '#b9c2d6' },
  { name: '偷偷试探', face: 'Suspicious', hair: 'HatHip', body: 'Whatever', bg: '#d8cdb0' },
  { name: '随机', face: 'Hectic', hair: 'Afro', body: 'Thunder', bg: '#d6c3e0' },
  { name: '', face: 'Driven', hair: 'ShortWavy', body: 'Geek', acc: 'GlassRound', bg: '#c9d7c0' },
  { name: '', face: 'Calm', hair: 'LongBangs', body: 'Dress', bg: '#e3cfc3' },
  { name: '', face: 'Solemn', hair: 'BaldTop', body: 'ShirtCoat', fh: 'Full', bg: '#c7ccd8' },
  { name: '', face: 'Cheeky', hair: 'Twists', body: 'SportyShirt', bg: '#d8d0bf' },
  { name: '', face: 'Concerned', hair: 'MediumStraight', body: 'StripedShirt', bg: '#c3d3dd' },
  { name: '', face: 'Blank', hair: 'ShavedSides', body: 'PocketShirt', acc: 'SunglassWayfarer', bg: '#d9c2a8' },
  { name: '', face: 'SmileBig', hair: 'BunCurly', body: 'DotJacket', bg: '#e0cbd5' },
  { name: '', face: 'Awe', hair: 'MediumShort', body: 'Turtleneck', bg: '#cbd8cf' },
];

export { INK, CREAM, ROUGE, EN };
