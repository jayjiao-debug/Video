import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CornerMark } from './brand/CornerMark';
import { Vignette, Grain } from './ui';
import { cut, FILM_END } from './lib';
import { A0, A0_IN, A0_OUT } from './A0';
import { A1, A1_IN, A1_OUT } from './A1';
import { B2, B2_IN, B2_OUT } from './B2';
import { B3, B3_IN, B3_OUT } from './B3';
import { B4, B4_IN, B4_OUT } from './B4';
import { A5, A5_IN } from './A5';

/* 《零糖》 v5: all 2D, ~110 s, cuts on the bar. Each scene takes the global T, returns null outside its window;
   the scene table drives clips, per-scene renders and fixes. */
export const SCENES: [string, number, number][] = [
  ['A0_两罐可乐', A0_IN, A0_OUT],
  ['A1_标题与舌头上的锁', A1_IN, A1_OUT],
  ['B2_零糖的标签', B2_IN, B2_OUT],
  ['B3_它健康吗', B3_IN, B3_OUT],
  ['B4_另一条路', B4_IN, B4_OUT],
  ['A5_回到桌上与片尾', A5_IN, FILM_END],
];

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '600 40px "Cormorant Garamond"', '700 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"', '500 40px "Noto Sans CJK SC"'].map((f) => document.fonts.load(f, '测试0123').catch(() => null)))
      .then(() => continueRender(handle));
  }, [handle]);
};

export const Film: React.FC<{ music?: boolean }> = ({ music = false }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const mark = T >= cut(36) && T < cut(206) ? 1 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#03050a' }}>
      {music && <Audio src={staticFile('bgm.mp3')} />}
      <A0 T={T} />
      <A1 T={T} />
      <B2 T={T} />
      <B3 T={T} />
      <B4 T={T} />
      <A5 T={T} />
      <Vignette strength={0.42} />
      <Grain />
      {mark > 0 && <CornerMark o={mark} />}
    </AbsoluteFill>
  );
};
