import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { b, prog, easeOut } from '../v6/ui6';
import { CornerMark } from '../brand/CornerMark';
import { SubwayScene, S1_OUT, MORNING_IN } from './Subway';
import { GlobeScene, S2_IN, S2_OUT, S5_IN, S5_OUT } from './Globe';
import { LetterScene, S3_IN, S3_OUT } from './Letter';
import { ShellsScene, S4_IN, S4_OUT } from './Shells';
import { RevealScene, EndCard7, R_IN, R_OUT, END_IN, FILM_END7 } from './Reveal';

/* 《隔着几个人》 (small world / six degrees). Music: series BGM from bar 4 (8.545 s). Every scene is a pure function of T. */
export const EP7_FRAMES = Math.round(FILM_END7 * 30);
export const EP7_SCENES: [string, number, number][] = [
  ['S1_末班地铁', 0, S1_OUT], ['S2_15亿人', S2_IN, S2_OUT], ['S3_1967年的信', S3_IN, S3_OUT], ['S4_为什么这么近', S4_IN, S4_OUT],
  ['S5_世界在变小', S5_IN, S5_OUT], ['S6_只隔一个人', R_IN, R_OUT], ['S7_第二天与片尾', MORNING_IN, FILM_END7],
];
export const Ep7Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['600 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"', '700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '400 40px "Noto Serif CJK SC"']
      .map((f) => document.fonts.load(f, '0123隔着几个人')).map((p) => p.catch(() => null))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  if (!ready) return null;
  const markO = T < b(50) ? easeOut(prog(T, S2_IN + 1, S2_IN + 1.6)) * (1 - prog(T, b(50) - 0.3, b(50))) : easeOut(prog(T, S3_IN + 0.8, S3_IN + 1.4)) * (1 - prog(T, END_IN - 0.3, END_IN + 0.2));
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a14' }}>
      {T <= S1_OUT + 0.05 && <SubwayScene T={T} am={false} />}
      <GlobeScene T={T} />
      <LetterScene T={T} />
      <ShellsScene T={T} />
      <RevealScene T={T} />
      {T >= MORNING_IN - 0.02 && <SubwayScene T={T} am />}
      <EndCard7 T={T} />
      {markO > 0.001 && <CornerMark o={markO} />}
    </AbsoluteFill>
  );
};
