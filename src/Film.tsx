import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { S01, S01_IN, S01_OUT } from './S01';
import { Title, T_IN, T_OUT } from './Title';
import { S2A, S2_IN, S2_OUT } from './S2';
import { S2B, S2B_IN, S2B_OUT } from './S2B';
import { S3, S3_IN, S3_OUT } from './S3';
import { S45, S4_IN, S5_OUT } from './S45';
import { S6, S6_IN, S6_OUT } from './S6';
import { S7, S7_IN, S7_OUT } from './S7';
import { S8, S8_IN, S8_OUT } from './S8';
import { S9, S9_IN } from './S9';
import { FILM_END } from './lib';
import { CornerMark } from './brand/CornerMark';
import { Vignette, Grain } from './ui';
import { prog, easeOut } from './lib';

/* 《第一位数字》 as one composition (video engine V1). Each scene takes the global T, returns null outside its window
   and owns its fades; the scene table is what clips, per-scene renders and fixes are cut by. */
export const SCENES: [string, number, number][] = [
  ['S0-S1_地球与九根管子', S01_IN, S01_OUT],
  ['T_标题卡', T_IN, T_OUT],
  ['S2a_1881书桌', S2_IN, S2_OUT],
  ['S2b_稿纸与论文', S2B_IN, S2B_OUT],
  ['S3_1938两万个数', S3_IN, S3_OUT],
  ['S4-S5_小镇与揭晓', S4_IN, S5_OUT],
  ['S6_1993支票', S6_IN, S6_OUT],
  ['S7_2011欧盟', S7_IN, S7_OUT],
  ['S8_哪些数偏爱1', S8_IN, S8_OUT],
  ['S9_回到地球与片尾', S9_IN, FILM_END],
];

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '600 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"'].map((f) => document.fonts.load(f, '测试0123').catch(() => null)))
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
      <S01 T={T} />
      <S2A T={T} />
      <S2B T={T} />
      <S3 T={T} />
      <S45 T={T} />
      <S6 T={T} />
      <S7 T={T} />
      <S8 T={T} />
      <S9 T={T} />
      <Title T={T} />
      <Vignette strength={0.45} />
      <Grain />
      {mark > 0 && <CornerMark o={mark} />}
    </AbsoluteFill>
  );
};
