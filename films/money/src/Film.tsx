import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CornerMark } from './brand/CornerMark';
import { Vignette, Grain } from './ui';
import { prog, easeOut, FILM_END } from './lib';
import { S1, S1_IN, S1_OUT } from './S1';
import { Title, T_IN, T_OUT } from './Title';

/* 《钱凭什么》 as one composition (video engine V1). Each scene takes the global T, returns null outside its window
   and owns its fades; the scene table drives clips, per-scene renders and fixes. */
export const SCENES: [string, number, number][] = [
  ['S1_一张纸换一顿饭', S1_IN, S1_OUT],
  ['T_标题卡', T_IN, T_OUT],
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
      <Title T={T} />
      <Vignette strength={0.45} />
      <Grain />
      {mark > 0 && <CornerMark o={mark} />}
    </AbsoluteFill>
  );
};
