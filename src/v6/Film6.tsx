import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { b, prog, easeOut, FILM_END, FILM_FRAMES } from './ui6';
import { CornerMark } from '../brand/CornerMark';
import { S1Cold, S1_OUT } from './S1Cold';
import { S2Galaxy, S2_IN, S2_OUT } from './S2Galaxy';
import { Net2D, S3_IN, S4_IN, S5_IN, S5_OUT } from './Net2D';
import { S6Feed, S6_IN } from './S6Feed';
import { S7End, S7_IN, END_IN } from './S7End';

/* 《为什么别人都比我热闹》 — the whole film. Each scene is a pure function of the global time T. */
export const EP6_FRAMES = FILM_FRAMES;
export const EP6_SCENES: [string, number][] = [
  ['S1_凌晨一点', 0], ['S2_7亿人的关系网', Math.round(S2_IN * 30)], ['S3_宿舍6个人', Math.round(S3_IN * 30)],
  ['S4_被数的次数', Math.round(S4_IN * 30)], ['S5_哈佛甲流', Math.round(S5_IN * 30)], ['S6_朋友圈', Math.round(S6_IN * 30)],
  ['S7_结尾与片尾', Math.round(S7_IN * 30)],
];
export const Ep6Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['600 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"', '700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '400 40px "Noto Serif CJK SC"']
      .map((f) => document.fonts.load(f, '0123朋友热闹').catch(() => null))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  if (!ready) return null;
  const markO = Math.min(easeOut(prog(T, S2_IN + 1, S2_IN + 1.6)), 1 - prog(T, b(50) - 0.2, b(50)) + easeOut(prog(T, S3_IN + 0.8, S3_IN + 1.4)), 1 - prog(T, END_IN - 0.3, END_IN + 0.2));
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a14' }}>
      {T <= S1_OUT + 0.05 && <S1Cold T={T} />}
      {T >= S2_IN - 0.02 && T <= S2_OUT + 0.05 && <S2Galaxy T={T} />}
      {T >= S3_IN - 0.05 && T <= S5_OUT + 0.05 && <Net2D T={T} />}
      {T >= S6_IN - 0.02 && T < S7_IN && <S6Feed T={T} />}
      {T >= S7_IN - 0.02 && <S7End T={T} />}
      {markO > 0 && <CornerMark o={Math.min(1, markO)} />}
    </AbsoluteFill>
  );
};
export { FILM_END };
