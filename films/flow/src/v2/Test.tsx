import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, FPS} from '../lib';
import {M, Sub3} from '../m3';
import {Rich3} from '../rich';
import {ColdOpen, Title2} from './cold';
import {COLD, Line, RIDGE} from './lines';
import {Ridge} from './ridge';

/* Motion test for approval: the cold open + title (0 → b39), then the ridge (b217 → b257), back to back. */
const R0 = 217;
const A = b(39);
const BLEN = b(R0 + 40) - b(R0);
export const TEST_FRAMES = Math.round((A + BLEN) * FPS);
export const TEST_CUT = A;
const Subs: React.FC<{T: number; lines: Line[]; o: number}> = ({T, lines, o}) => (
  <>
    {lines.map(([f, t, zh, en], i) => (
      <Sub3 key={i} T={T} at={b(o + f)} out={b(o + t)} zh={<Rich3 s={zh} />} en={en} />
    ))}
  </>
);
const Mark: React.FC = () => (
  <div style={{position: 'absolute', right: 56, top: 40, fontFamily: '"Juno Sans", sans-serif', fontSize: 20, color: M.grey, letterSpacing: '0.08em'}}>
    <span style={{color: M.gold}}>◆</span> Juno · VIBE知识大赏
  </div>
);
export const Test: React.FC = () => {
  const f = useCurrentFrame() / FPS;
  const first = f < A;
  const T = first ? f : b(R0) + (f - A);
  return (
    <AbsoluteFill style={{background: M.bg}}>
      {first ? (
        <>
          <ColdOpen T={T} />
          <Title2 T={T} />
          <Subs T={T} lines={COLD} o={0} />
        </>
      ) : (
        <>
          <Ridge T={T} t0={R0} />
          <Subs T={T} lines={RIDGE} o={R0} />
        </>
      )}
      {T > b(39) || T < b(29) ? <Mark /> : null}
    </AbsoluteFill>
  );
};
