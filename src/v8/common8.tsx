import React from 'react';
import { mulberry } from '../v1/data';
import { b } from '../v6/ui6';

/* 《换不换》 shared bits: the simulations (computed, not invented) and small props. */
export const FILM_END8 = b(178) + 7.6;
const sim = (n: number, seed: number) => {
  const r = mulberry(seed);
  let stay = 0;
  const games: number[] = [];
  for (let i = 0; i < n; i++) {
    const car = Math.floor(r() * 3), pick = Math.floor(r() * 3);
    const s = car === pick ? 1 : 0;
    stay += s;
    if (i < 1000) games.push(s);
  }
  return { n, stay, sw: n - stay, games };
};
export const SIM1K = sim(1000, 3);
export const SIM100K = sim(100000, 1996);

/** a red envelope (红包), centred at its bottom */
export const RedPacket: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-46} y={-118} width={92} height={118} rx={10} fill="#c8302c" />
    <path d="M -46 -108 Q 0 -70 46 -108 L 46 -118 L -46 -118 Z" fill="#a8241f" />
    <circle cx={0} cy={-82} r={15} fill="#f2c45a" />
    <text x={0} y={-76} textAnchor="middle" style={{ fontFamily: '"Noto Serif CJK SC", serif', fontWeight: 900, fontSize: 18, fill: '#a8241f' }}>福</text>
  </g>
);
/** a paper cup upside down on the table, bottom of the rim at y = 0 */
export const Cup: React.FC<{ n?: number; glow?: number }> = ({ n, glow = 0 }) => (
  <g>
    {glow > 0 && <ellipse cx={0} cy={-60} rx={95} ry={95} fill="#f6cf78" opacity={0.18 * glow} />}
    <path d="M -62 0 L -44 -150 L 44 -150 L 62 0 Z" fill="#efe9dc" />
    <path d="M -62 0 L -44 -150 L -30 -150 L -44 0 Z" fill="#fff" opacity={0.5} />
    <path d="M 62 0 L 44 -150 L 34 -150 L 50 0 Z" fill="#000" opacity={0.08} />
    <rect x={-56} y={-62} width={112} height={18} fill="#c9a45c" opacity={0.85} />
    <ellipse cx={0} cy={-150} rx={44} ry={7} fill="#ddd5c4" />
    {n !== undefined && <text x={0} y={-90} textAnchor="middle" style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: 46, fill: '#2b2118' }}>{n}</text>}
  </g>
);
