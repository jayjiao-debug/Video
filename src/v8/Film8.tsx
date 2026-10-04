import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { b, prog, easeOut } from '../v6/ui6';
import { CornerMark } from '../brand/CornerMark';
import { DormScene, S1_OUT, END_IN8, CARD8 } from './Dorm8';
import { StageScene, S2_IN, S2_OUT, S4_IN, S4_OUT } from './Stage8';
import { HistoryScene, S3_IN, S3_OUT } from './History8';
import { PigeonScene, S5_IN, S5_OUT } from './Pigeon8';
import { EndCard8 } from './End8';
import { FILM_END8 } from './common8';

/* 《换不换》 (the Monty Hall problem). Music: series BGM from bar 4. Every scene is a pure function of T. */
export const EP8_FRAMES = Math.round(FILM_END8 * 30);
export const Ep8Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['600 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"', '700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '400 40px "Noto Serif CJK SC"']
      .map((f) => document.fonts.load(f, '0123换不换三门')).map((p) => p.catch(() => null))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  if (!ready) return null;
  const markO = T < b(50) ? easeOut(prog(T, S2_IN + 1, S2_IN + 1.6)) * (1 - prog(T, b(50) - 0.3, b(50))) : easeOut(prog(T, S3_IN + 0.8, S3_IN + 1.4)) * (1 - prog(T, CARD8 - 0.3, CARD8 + 0.2));
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a14' }}>
      {T <= S1_OUT + 0.05 && <DormScene T={T} />}
      <StageScene T={T} />
      <HistoryScene T={T} />
      <PigeonScene T={T} />
      {T >= END_IN8 - 0.02 && <DormScene T={T} end />}
      <EndCard8 T={T} />
      {markO > 0.001 && <CornerMark o={markO} />}
    </AbsoluteFill>
  );
};
