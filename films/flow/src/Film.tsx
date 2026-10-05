import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, FPS, inOut, prog} from './lib';
import {LINES} from './script';
import {S1, S10, TitleCard, EndCard} from './scenes/clock';
import {S2} from './scenes/s2';
import {S3} from './scenes/s3';
import {S4} from './scenes/s4';
import {S5, S6} from './scenes/s56';
import {S7} from './scenes/s7';
import {S8} from './scenes/s8';
import {S9} from './scenes/s9';
import {M, Sub3} from './m3';
import {Rich3} from './rich';

/* The whole film as one composition. Each scene takes the global T, returns null outside its window
   and owns its fades. SCENES is the table that per-scene renders, clips and fixes are cut by
   (written to scenes.json for scripts/finish.py). */
export const FILM_END = 164.49;
export const FILM_FRAMES = Math.round(FILM_END * FPS);
export const SCENES: [string, number, number][] = [
  ['S1_天黑了', 0, b(31)],
  ['T_标题', b(31), b(39)],
  ['S2_画家', b(39), b(64)],
  ['S3_起名', b(64), b(96)],
  ['S4_心流通道', b(96), b(128)],
  ['S5_传呼机', b(128), b(161)],
  ['S6_工作悖论', b(161), b(185)],
  ['S7_大脑', b(185), b(209)],
  ['S8_刚刚好的难度', b(209), b(241)],
  ['S9_the_zone', b(241), b(273)],
  ['S10_时间消失', b(273), b(311)],
  ['E_片尾', b(311), FILM_END],
];
const LIST: [React.FC<{T: number}>, number, number][] = [
  [S1, 0, b(31) + 0.6],
  [TitleCard, b(31), b(39) + 0.4],
  [S2, b(39) - 0.1, b(64) + 0.1],
  [S3, b(64) - 0.1, b(96) + 0.1],
  [S4, b(96) - 0.1, b(128) + 0.1],
  [S5, b(128) - 0.1, b(161) + 0.1],
  [S6, b(161) - 0.1, b(185) + 0.1],
  [S7, b(185) - 0.1, b(209) + 0.1],
  [S8, b(209) - 0.1, b(241) + 0.1],
  [S9, b(241) - 0.1, b(273) + 0.1],
  [S10, b(273) - 0.1, b(311) + 0.5],
  [EndCard, b(311) - 0.2, FILM_END + 1],
];

export const Film: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const corner = Math.min(1 - inOut(T, b(31) - 0.1, b(39) + 0.2, 0.2, 0.4), 1 - prog(T, b(311) - 0.2, b(311) + 0.6));
  return (
    <AbsoluteFill style={{background: M.bg}}>
      {LIST.map(([Sc, a, z], i) => (T >= a && T < z ? <Sc key={i} T={T} /> : null))}
      {LINES.map(([a, z, zh, en], i) => (T > b(a) - 0.5 && T < b(z) + 0.5 ? <Sub3 key={i} T={T} at={b(a) + 0.05} out={b(z) - 0.08} zh={<Rich3 s={zh} />} en={en} /> : null))}
      <div style={{position: 'absolute', top: 36, right: 48, fontFamily: '"Juno Sans", sans-serif', fontSize: 19, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)', opacity: corner}}>
        <span style={{color: M.gold}}>◆ Juno</span> · VIBE知识大赏
      </div>
    </AbsoluteFill>
  );
};
