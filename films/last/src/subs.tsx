import React from 'react';
import { SUBS, ZH, MONO, prog, easeOut } from './lib';

/* Burned-in subtitles for a BGM-only, read-it-yourself cut, in the house style of the earlier films (56 px bold serif),
   numbers in the film's red. Every line already fits the reading budget (0.5 s + chars / 7 + 0.6 s). The last SRT
   line is the end card's own question, so it is not repeated as a subtitle. */
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/([0-9][0-9.,%]*)/).filter(Boolean).map((seg, i) => /^[0-9]/.test(seg)
    ? <span key={i} style={{ color: '#ff6a5c' }}>{seg}</span> : <span key={i}>{seg}</span>)}</>
);

export const Subtitles: React.FC<{ T: number }> = ({ T }) => {
  const lines = SUBS.slice(0, -1);
  const cur = lines.find(([a, z]) => T >= a - 0.05 && T < z + 0.1);
  const band = Math.max(0, ...lines.map(([a, z]) => Math.min(easeOut(prog(T, a - 0.3, a)), 1 - prog(T, z + 0.4, z + 0.8))));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 240, opacity: band, background: 'linear-gradient(180deg, rgba(6,6,8,0) 0%, rgba(6,6,8,0.72) 55%, rgba(6,6,8,0.9) 100%)' }} />
      {cur && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', opacity: Math.min(easeOut(prog(T, cur[0] - 0.05, cur[0] + 0.12)), 1 - prog(T, cur[1], cur[1] + 0.1)) }}>
          <span style={{ fontFamily: ZH, fontWeight: 700, fontSize: 56, color: '#f6efe1', letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)', fontVariantNumeric: 'lining-nums' }}><Rich s={cur[2].replace(/[。，；：、——]+$/, '')} /></span>
        </div>
      )}
    </>
  );
};
