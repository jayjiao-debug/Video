import React from 'react';
import { SUBS, SANS, MONO, prog, easeOut } from './lib';

/* Burned-in subtitles for a BGM-only, read-it-yourself cut: 46 px Noto Sans on a soft dark band at the bottom,
   numbers in the film's red. Every line already fits the reading budget (0.5 s + chars / 7 + 0.6 s). The last SRT
   line is the end card's own question, so it is not repeated as a subtitle. */
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/([0-9][0-9.,%]*)/).filter(Boolean).map((seg, i) => /^[0-9]/.test(seg)
    ? <span key={i} style={{ color: '#ff6a5c', fontFamily: MONO, fontWeight: 700 }}>{seg}</span> : <span key={i}>{seg}</span>)}</>
);

export const Subtitles: React.FC<{ T: number }> = ({ T }) => {
  const lines = SUBS.slice(0, -1);
  const cur = lines.find(([a, z]) => T >= a - 0.05 && T < z + 0.1);
  const band = Math.max(0, ...lines.map(([a, z]) => Math.min(easeOut(prog(T, a - 0.3, a)), 1 - prog(T, z + 0.4, z + 0.8))));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 210, opacity: band, background: 'linear-gradient(180deg, rgba(6,6,8,0) 0%, rgba(6,6,8,0.72) 55%, rgba(6,6,8,0.9) 100%)' }} />
      {cur && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 952, textAlign: 'center', opacity: Math.min(easeOut(prog(T, cur[0] - 0.05, cur[0] + 0.12)), 1 - prog(T, cur[1], cur[1] + 0.1)) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: '#f4f2ec', letterSpacing: '0.04em', textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)' }}><Rich s={cur[2].replace(/[。，；：、——]+$/, '')} /></span>
        </div>
      )}
    </>
  );
};
