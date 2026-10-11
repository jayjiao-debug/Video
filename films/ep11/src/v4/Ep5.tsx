import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { prog, easeOut } from '../lib';
import { CornerMark } from '../brand/CornerMark';
import { TitanicOpen2, OPEN_FRAMES2, OPEN_END } from './Titanic2';
import { WhyScene, WHY_IN } from './Why';
import { SmokeScene, SMOKE_IN } from './Smoke';
import { TsunamiScene, TS_IN, TS_OUT } from './Tsunami';
import { SchoolsScene, SC_IN } from './Schools';
import { EndingScene, EN_IN, END_IN, FILM_END } from './Ending';

/* 《应该没事吧》 — the whole film. Scenes are separate files; each is a pure function of the global time T,
   so any frame range can be re-rendered on its own and spliced back. */
export const EP5_FRAMES = Math.round(FILM_END * 30);
/* scene boundaries (frames), for per-scene renders and clips */
export const EP5_SCENES: [string, number][] = [
  ['S1_开头_泰坦尼克', 0], ['S2_为什么不上船', Math.round(WHY_IN * 30)], ['S3_烟雾房间', Math.round(SMOKE_IN * 30)],
  ['S4_2004海啸', Math.round(TS_IN * 30)], ['S5_2011两所学校', Math.round(SC_IN * 30)],
  ['S6_结尾与片尾', Math.round(EN_IN * 30)],
];
export const Ep5Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const markO = Math.min(easeOut(prog(T, OPEN_END, OPEN_END + 0.6)), 1 - prog(T, END_IN - 0.3, END_IN + 0.2));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      <Sequence durationInFrames={OPEN_FRAMES2}><TitanicOpen2 /></Sequence>
      {frame >= OPEN_FRAMES2 - 2 && <WhyScene T={T} />}
      <SmokeScene T={T} />
      {T >= TS_IN - 0.1 && T <= TS_OUT + 0.1 && <TsunamiScene T={T} />}
      <SchoolsScene T={T} />
      {T >= EN_IN - 0.1 && <EndingScene T={T} />}
      {T > OPEN_END && markO > 0 && <CornerMark o={markO} />}
    </AbsoluteFill>
  );
};
export const Ep5Draft = Ep5Film;
