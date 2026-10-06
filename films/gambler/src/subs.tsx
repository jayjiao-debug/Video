import React from 'react';
import { SUBS, SANS, prog, easeOut } from './lib';
import { useLook } from './look';

/* Burned-in subtitles for a BGM-only, read-it-yourself cut, in the house style of the earlier films (56 px bold serif),
   numbers in the film's red. Every line already fits the reading budget (0.5 s + chars / 7 + 0.6 s). The last SRT
   line is the end card's own question, so it is not repeated as a subtitle. */
/** one keyword per line: [gold] for the answer / the win, {red} for the miss / the trap; numbers in the house number colour */
const KEY_GOLD = '#f1c56d', KEY_RED = '#ff5a48';
const Rich: React.FC<{ s: string; c: string }> = ({ s, c }) => (
  <>{s.split(/(\[[^\]]+\]|\{[^}]+\}|-?[0-9][0-9.,%]*)/).filter(Boolean).map((seg, i) => {
    if (seg.startsWith('[')) return <span key={i} style={{ color: KEY_GOLD, fontWeight: 900 }}>{seg.slice(1, -1)}</span>;
    if (seg.startsWith('{')) return <span key={i} style={{ color: KEY_RED, fontWeight: 900 }}>{seg.slice(1, -1)}</span>;
    if (/^-?[0-9]/.test(seg)) return <span key={i} style={{ color: c }}>{seg.replace(/^-/, '−')}</span>;
    return <span key={i}>{seg}</span>;
  })}</>
);

export const Subtitles: React.FC<{ T: number }> = ({ T }) => {
  const L = useLook();
  const lines = SUBS.slice(0, -1);
  const cur = lines.find(([a, z]) => T >= a - 0.05 && T < z + 0.1);
  const band = Math.max(0, ...lines.map(([a, z]) => Math.min(easeOut(prog(T, a - 0.3, a)), 1 - prog(T, z + 0.4, z + 0.8))));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 0, opacity: band, background: L.subBand }} />
      {cur && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 972, textAlign: 'center', opacity: Math.min(easeOut(prog(T, cur[0] - 0.05, cur[0] + 0.12)), 1 - prog(T, cur[1], cur[1] + 0.1)) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 68, color: L.subInk, letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 0 3px rgba(0,0,0,1), 0 0 3px rgba(0,0,0,1), 0 2px 14px rgba(0,0,0,0.95)', fontVariantNumeric: 'lining-nums' }}><Rich c={L.subNum} s={cur[2].replace(/[。，；：、——]+$/, '')} /></span>
        </div>
      )}
    </>
  );
};
