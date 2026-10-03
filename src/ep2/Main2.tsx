import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { FPS, prog } from '../lib';
import { Background, Grain, Vignette } from '../ui';
import { Intro2, Title2, Dish, EquationSky } from './scenes1';
import { Window, Funnel, Reveal26 } from './scenes2';
import { Grid155, Aliens, YourNumber, Story, River } from './scenes3';

/* Music is edited in whole bars: each segment plays [m0, m1) of the (pitched) track back-to-back.
   Scenes keep their music-time constants; a scene is driven by the clock of its home segment. */
const RAW: [number, number][] = [[8.545, 130.5]]; // enter on bar 4: start of the second 4-bar intro phrase
export const SEGS = (() => {
  let n = 0;
  return RAW.map(([m0, m1]) => { const s = { n0: n, m0, m1 }; n += m1 - m0; return s; });
})();
export const END2 = SEGS[SEGS.length - 1].n0 + (SEGS[SEGS.length - 1].m1 - SEGS[SEGS.length - 1].m0);
export const DURATION2 = Math.round(END2 * FPS);

const clock = (seg: number, n: number) => (seg < 0 ? n : n - SEGS[seg].n0 + SEGS[seg].m0);
const musicTime = (n: number) => {
  let k = 0;
  SEGS.forEach((s, i) => { if (n >= s.n0) k = i; });
  return clock(k, n);
};

// [scene, home segment (-1 = own clock), visible from, visible to] — times on the home clock
const SCENES: [React.FC<{ t: number }>, number, number, number][] = [
  [Intro2, -1, 0, 8.2], [Title2, 0, 16.5, 20.85], [Dish, 0, 20.6, 26.95],
  [EquationSky, 0, 26.7, 49.4],
  [Window, 0, 48.75, 63.35],
  [Funnel, 0, 63.0, 86.6], [Reveal26, 0, 81.4, 85.65], [Grid155, 0, 85.4, 93.75], [Aliens, 0, 93.5, 97.8], [YourNumber, 0, 97.5, 105.9],
  [Story, 0, 105.6, 122.1], [River, 0, 121.8, 130.6],
];

const XF = 2; // crossfade frames at each music splice

export const Main2: React.FC<{ music?: boolean }> = ({ music = true }) => {
  const f = useCurrentFrame();
  const n = f / FPS;
  const tm = musicTime(n);
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f1016', overflow: 'hidden', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
      <Background warm={0.7 * prog(tm, 115.87, 118.5) * (1 - prog(tm, 121.9, 122.6))} />
      {SCENES.map(([S, seg, a, b], i) => {
        const t = clock(seg, n);
        return t >= a && t <= b ? <S key={i} t={t} /> : null;
      })}
      <Vignette />
      <Grain />
      {music && SEGS.map((s, k) => {
        const first = k === 0, last = k === SEGS.length - 1;
        const pre = first ? 0 : XF;
        const from = Math.round(s.n0 * FPS) - pre;
        const dur = Math.round((s.m1 - s.m0) * FPS) + pre + (last ? 0 : XF);
        const m0f = Math.round(s.m0 * FPS) - pre;
        return (
          <Sequence key={k} from={from} durationInFrames={dur} layout="none">
            <Audio src={staticFile('bgm_a.mp3')} trimBefore={m0f}
              volume={(fr) => {
                let v = 1;
                v = Math.min(v, interpolate(fr, [0, first ? 1 : XF], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
                if (!last) v = Math.min(v, interpolate(fr, [dur - XF, dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
                const mt = (m0f + fr) / FPS;
                return v * interpolate(mt, [124, 130.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              }} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
