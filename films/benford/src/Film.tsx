import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { S01, S01_IN, S01_OUT } from './S01';
import { Title, T_IN, T_OUT } from './Title';
import { CornerMark } from './brand/CornerMark';
import { Vignette, Grain } from './ui';
import { prog, easeOut } from './lib';

/* 《第一位数字》 as one composition (video engine V1). Each scene takes the global T, returns null outside its window
   and owns its fades; the scene table is what clips, per-scene renders and fixes are cut by. */
export const SCENES: [string, number, number][] = [
  ['S0-S1_地球与九根管子', S01_IN, S01_OUT],
  ['T_标题卡', T_IN, T_OUT],
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
  const mark = easeOut(prog(T, T_OUT, T_OUT + 0.8));
  return (
    <AbsoluteFill style={{ backgroundColor: '#03050a' }}>
      {music && <Audio src={staticFile('bgm.mp3')} />}
      <S01 T={T} />
      <Title T={T} />
      <Vignette strength={0.45} />
      <Grain />
      {mark > 0 && <CornerMark o={mark} />}
    </AbsoluteFill>
  );
};
