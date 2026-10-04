import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CornerMark } from './brand/CornerMark';
import { Vignette, Grain } from './ui';
import { prog, easeOut, FILM_END } from './lib';
import { S1, S1_IN, S1_OUT } from './S1';
import { Title, T_IN, T_OUT } from './Title';
import { S3, S3_IN, S3_OUT } from './S3';
import { S4, S4_IN, S4_OUT } from './S4';
import { S5, S5_IN, S5_OUT } from './S5';
import { S6, S6_IN, S6_OUT } from './S6';
import { S7, S7_IN, S7_OUT } from './S7';
import { S8, S8_IN, S8_OUT } from './S8';
import { S9, S9_IN, S9_OUT } from './S9';
import { S10, S10_IN, END_IN } from './S10';

/* 《钱凭什么》 as one composition (video engine V1). Each scene takes the global T, returns null outside its window
   and owns its fades; the scene table drives clips, per-scene renders and fixes. */
export const SCENES: [string, number, number][] = [
  ['S1_一张纸换一顿饭', S1_IN, S1_OUT],
  ['T_标题卡', T_IN, T_OUT],
  ['S3_海贝', S3_IN, S3_OUT],
  ['S4_硬币', S4_IN, S4_OUT],
  ['S5_黄金', S5_IN, S5_OUT],
  ['S6_纸币', S6_IN, S6_OUT],
  ['S7_1971', S7_IN, S7_OUT],
  ['S8_之后', S8_IN, S8_OUT],
  ['S9_雅浦岛', S9_IN, S9_OUT],
  ['S10_回到桌上', S10_IN, END_IN],
  ['S11_片尾', END_IN, FILM_END],
];

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '600 40px "Cormorant Garamond"', '700 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"'].map((f) => document.fonts.load(f, '测试0123').catch(() => null)))
      .then(() => continueRender(handle));
  }, [handle]);
};

export const Film: React.FC<{ music?: boolean }> = ({ music = false }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const mark = easeOut(prog(T, T_OUT, T_OUT + 0.8)) * (1 - prog(T, FILM_END - 6.6, FILM_END - 6));
  return (
    <AbsoluteFill style={{ backgroundColor: '#03050a' }}>
      {music && <Audio src={staticFile('bgm.mp3')} />}
      <S1 T={T} />
      <S3 T={T} />
      <S4 T={T} />
      <S5 T={T} />
      <S6 T={T} />
      <S7 T={T} />
      <S8 T={T} />
      <S9 T={T} />
      <S10 T={T} />
      <Title T={T} />
      <Vignette strength={0.45} />
      <Grain />
      {mark > 0 && <CornerMark o={mark} />}
    </AbsoluteFill>
  );
};
