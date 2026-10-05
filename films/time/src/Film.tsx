import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { TIMELINE, FILM_END, prog, easeOut } from './lib';
import { Backdrop, ChapterHead, Captions, CaptionBand, Progress, CornerMark, Vignette, Grain, FontFace } from './ui';
import { Hook, Survey, Ratio, LogLife } from './scenesA';
import { Fall, Memory, Routine } from './scenesB';
import { Child, Holiday, Slow, EndCard } from './scenesC';

/* 《越过越快》: why time speeds up as we grow up. A voice-over data essay in nine short chapters, each one study and
   one picture, cut on the beat; the voice-over carries the argument, the picture carries the numbers. */
export const CHAPTERS = ['survey', 'ratio', 'log', 'fall', 'memory', 'routine', 'child', 'holiday', 'slow'];

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '500 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '400 40px "JunoMono"', '700 40px "JunoMono"', 'italic 400 40px "Cormorant Garamond"']
      .map((f) => document.fonts.load(f, '测试0123').catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
};

export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const afterTitle = TIMELINE.title + 2.0;
  const mark = easeOut(prog(T, afterTitle, afterTitle + 0.8)) * (1 - prog(T, TIMELINE.endCard - 0.3, TIMELINE.endCard));
  const inEnd = T >= TIMELINE.endCard;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0c10' }}>
      <FontFace />
      <Backdrop />
      <Hook T={T} />
      <Survey T={T} />
      <Ratio T={T} />
      <LogLife T={T} />
      <Fall T={T} />
      <Memory T={T} />
      <Routine T={T} />
      <Child T={T} />
      <Holiday T={T} />
      <Slow T={T} />
      {CHAPTERS.map((c) => <ChapterHead key={c} T={T} id={c} />)}
      {!inEnd && <CaptionBand />}
      {!inEnd && <Captions T={T} />}
      {!inEnd && <Progress T={T} />}
      <EndCard T={T} />
      <Vignette strength={0.45} />
      <Grain />
      <CornerMark o={mark} />
    </AbsoluteFill>
  );
};
export { FILM_END };
