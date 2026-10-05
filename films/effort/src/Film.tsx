import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CornerMark } from './brand/CornerMark';
import { Vignette, Grain } from './ui';
import { prog, easeOut, FILM_END } from './lib';
import { S1, S1_IN, S1_OUT } from './S1';
import { Title, T_IN, T_OUT } from './Title';
import { S3, S3_IN, S3_OUT } from './S3';
import { S4, S4_IN, S4_OUT } from './S4';
import { Luck, S5_IN, S6_OUT, S7_OUT } from './Luck';
import { Bamboo, S8_IN, S8_OUT } from './Bamboo';
import { Close, S9_IN, END_IN } from './Close';
import { DROP } from './lib';

/* 《付出和回报》 as one composition (video engine V1). Each scene takes the global T, returns null outside its window
   and owns its fades; the scene table drives clips, per-scene renders and fixes. */
export const SCENES: [string, number, number][] = [
  ['S1_多干的14小时', S1_IN, S1_OUT],
  ['T_标题卡', T_IN, T_OUT],
  ['S3_工厂曲线', S3_IN, S3_OUT],
  ['S4_练习', S4_IN, S4_OUT],
  ['S5_运气模拟', S5_IN, DROP],
  ['S6_最成功的人', DROP, S6_OUT],
  ['S7_接住好运', S6_OUT, S7_OUT],
  ['S8_竹子', S8_IN, S8_OUT],
  ['S9_不是直线', S9_IN, END_IN],
  ['S10_片尾', END_IN, FILM_END],
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
      <Luck T={T} />
      <Bamboo T={T} />
      <Close T={T} />
      <Title T={T} />
      <Vignette strength={0.45} />
      <Grain />
      {mark > 0 && <CornerMark o={mark} />}
    </AbsoluteFill>
  );
};
