import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CornerMark } from './brand/CornerMark';
import { Vignette, Grain } from './ui';
import { b, prog, easeOut, FILM_END } from './lib';
import { S0, S0_IN, S0_OUT } from './S0';
import { Title, T_IN, T_OUT } from './Title';
import { S1, S1_IN, S1_OUT } from './S1';
import { S1B, S1B_IN, S1B_OUT } from './S1B';
import { S2, S2_IN, S2_OUT } from './S2';
import { S3, S3_IN, S3_OUT } from './S3';
import { S4, S4_IN, S4_OUT } from './S4';
import { S5, S5_IN } from './S5';

/* 《零糖》 as one composition (video engine V1). Each scene takes the global T, returns null outside its window and
   owns its fades; the scene table drives clips, per-scene renders and fixes. */
export const SCENES: [string, number, number][] = [
  ['S0_两罐可乐', S0_IN, S0_OUT],
  ['T_标题卡', T_IN, T_OUT],
  ['S1_舌头上的锁', S1_IN, S1_OUT],
  ['S1b_意外的甜', S1B_IN, S1B_OUT],
  ['S2_中国版零糖', S2_IN, S2_OUT],
  ['S3_它健康吗', S3_IN, S3_OUT],
  ['S4_另一条路', S4_IN, S4_OUT],
  ['S5_回到桌上与片尾', S5_IN, FILM_END],
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
  const mark = easeOut(prog(T, b(36) + 0.6, b(36) + 1.4)) * (1 - prog(T, FILM_END - 6.6, FILM_END - 6));
  return (
    <AbsoluteFill style={{ backgroundColor: '#03050a' }}>
      {music && <Audio src={staticFile('bgm.mp3')} />}
      <S0 T={T} />
      <S1 T={T} />
      <S1B T={T} />
      <S2 T={T} />
      <S3 T={T} />
      <S4 T={T} />
      <S5 T={T} />
      <Title T={T} />
      <Vignette strength={0.45} />
      <Grain />
      {mark > 0 && <CornerMark o={mark} />}
    </AbsoluteFill>
  );
};
