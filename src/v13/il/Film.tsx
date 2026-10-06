import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { W, H, GlowDefs, Vignette, Grain, Captions, cue, sm, HIT, VO_END, FILM_END } from './kit';
import { Opening, Title } from './s1';
import { Painter, Interviews, Board, Goals, Feedback, Difficulty } from './s2';
import { Model, Work, Ending, EndCard } from './s3';

/* 《心流》illustrated film (voiced by the owner from our SRT). Scenes dissolve into each other (0.25 s) except the cut on the drop. */
export const IL_FRAMES = Math.round(FILM_END * 30);
const END0 = VO_END + 0.6;
type Sc = [number, number, (T: number) => React.ReactNode, boolean?];
const SCENES: Sc[] = [
  [0, HIT - 0.04, (T) => <Opening T={T} />],
  [HIT - 0.04, cue('P1') - 0.3, (T) => <Title T={T} />, true],
  [cue('P1') - 0.3, cue('P5') - 0.25, (T) => <Painter T={T} />],
  [cue('P5') - 0.25, cue('K1') - 0.3, (T) => <Interviews T={T} />],
  [cue('K1') - 0.3, cue('K3') - 0.25, (T) => <Board T={T} focus={T > cue('K2') - 0.1 ? 0 : -1} reveal={T > cue('K2') - 0.1 ? 1 : 0} />],
  [cue('K3') - 0.25, cue('K6') - 0.3, (T) => <Goals T={T} />],
  [cue('K6') - 0.3, cue('K7') - 0.15, (T) => <Board T={T} focus={1} reveal={2} />],
  [cue('K7') - 0.15, cue('K10') - 0.3, (T) => <Feedback T={T} />],
  [cue('K10') - 0.3, cue('K11') - 0.15, (T) => <Board T={T} focus={2} reveal={3} />],
  [cue('K11') - 0.15, cue('M1') - 0.2, (T) => <Difficulty T={T} />],
  [cue('M1') - 0.2, cue('W1') - 0.3, (T) => <Model T={T} />],
  [cue('W1') - 0.3, cue('E1') - 0.3, (T) => <Work T={T} />],
  [cue('E1') - 0.3, END0, (T) => <Ending T={T} />],
  [END0, FILM_END + 1, (T) => <EndCard T={T} a={END0} />, true],
];
const XF = 0.25;

export const IlFilm: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const live = SCENES.map((s, i) => ({ s, i })).filter(({ s }) => T >= s[0] && T < s[1] + XF);
  const fadeOut = 1 - sm(T, FILM_END - 0.8, 0.8);
  return (
    <AbsoluteFill style={{ background: '#05070F' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, opacity: fadeOut }}>
        <GlowDefs />
        {live.map(({ s, i }) => {
          const next = SCENES[i + 1], outgoing = next && T >= next[0];
          if (outgoing && next[3]) return null;                       // hard cut into the drop / end card
          const o = i === 0 || s[3] ? 1 : sm(T, s[0], XF);
          return <g key={i} opacity={o}>{s[2](T)}</g>;
        })}
        <Vignette />
      </svg>
      <Grain frame={f} o={0.09} />
      {T < VO_END + 0.5 && <Captions T={T} />}
    </AbsoluteFill>
  );
};
