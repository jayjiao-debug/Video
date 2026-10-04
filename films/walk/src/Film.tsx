import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, FPS, inOut, prog} from './lib';
import {C, Night} from './look';
import {LINES} from './script';
import {Corner, Sub} from './ui';
import {S1, TitleCard} from './scenes/s1';
import {S2} from './scenes/s2';
import {S3} from './scenes/s3';
import {S4} from './scenes/s4';
import {S5, S6} from './scenes/s56';
import {S7} from './scenes/s7';
import {S8} from './scenes/s8';
import {S9} from './scenes/s9';
import {S10, EndCard} from './scenes/s10';

/* The whole film as one composition. Each scene takes the global T, returns null outside its window
   and owns its fades. SCENES is the table that per-scene renders, clips and fixes are cut by
   (written to scenes.json for scripts/finish.py). */
export const FILM_END = 164.49;
export const FILM_FRAMES = Math.round(FILM_END * FPS);
export const SCENES: [string, number, number][] = [
  ['S1_醉汉出门', 0, b(31)],
  ['T_标题', b(31), b(39)],
  ['S2_平面与空间', b(39), b(64)],
  ['S3_一维到二维', b(64), b(96)],
  ['S4_波利亚的散步', b(96), b(128)],
  ['S5_鸟群', b(128), b(157)],
  ['S6_百分之三十四', b(157), b(185)],
  ['S7_为什么', b(185), b(209)],
  ['S8_布朗运动', b(209), b(241)],
  ['S9_股价', b(241), b(273)],
  ['S10_回家', b(273), b(311)],
  ['E_片尾', b(311), FILM_END],
];
const LIST: [React.FC<{T: number}>, number, number][] = [
  [S1, 0, b(31) + 0.6],
  [TitleCard, b(31), b(39) + 0.4],
  [S2, b(39) - 0.3, b(64) + 0.3],
  [S3, b(64) - 0.3, b(96) + 0.4],
  [S4, b(96) - 0.4, b(128) + 0.4],
  [S5, b(128) - 0.4, b(157) + 0.1],
  [S6, b(157) - 0.1, b(185) + 0.3],
  [S7, b(185) - 0.3, b(209) + 0.3],
  [S8, b(209) - 0.3, b(241) + 0.3],
  [S9, b(241) - 0.3, b(273) + 0.4],
  [S10, b(273) - 0.4, b(311) + 0.4],
  [EndCard, b(311) - 0.2, FILM_END + 1],
];

export const Film: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  // the corner mark hides under the title card and fades out under the end card
  const corner = Math.min(1 - inOut(T, b(31) - 0.1, b(39) + 0.2, 0.2, 0.4), 1 - prog(T, b(311) - 0.2, b(311) + 0.6));
  return (
    <AbsoluteFill style={{background: C.bg1}}>
      <Night />
      {LIST.map(([Sc, a, z], i) => (T >= a && T < z ? <Sc key={i} T={T} /> : null))}
      <SubBand />
      {LINES.map(([a, z, zh, en], i) => (T > b(a) - 0.5 && T < b(z) + 0.5 ? <Sub key={i} T={T} at={b(a) + 0.05} out={b(z) - 0.08} zh={zh} en={en} /> : null))}
      <Corner o={0.85 * corner} />
    </AbsoluteFill>
  );
};

const SubBand: React.FC = () => <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, background: 'linear-gradient(180deg, rgba(7,10,18,0) 0%, rgba(7,10,18,0.5) 60%, rgba(7,10,18,0.75) 100%)'}} />;
