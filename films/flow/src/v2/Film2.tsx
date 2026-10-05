import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, FPS, inOut, prog} from '../lib';
import {LATIN, SANS, SERIF} from '../look';
import {anim, Create, M, Sub3, Write} from '../m3';
import {Rich3} from '../rich';
import {wave} from '../scenes/clock';
import {ColdOpen, Title2} from './cold';
import {H, W} from './kit';
import {COLD, Line, MAPL, RIDGE, S10L, S2L, S3L, S6L, S7L, S9L} from './lines';
import {MapEnd, MapScene} from './map';
import {Ridge} from './ridge';
import {S2, S3} from './s23';
import {S6} from './s6';
import {S7} from './s7';
import {S9} from './s9';

/* 《心流》 v2: the whole film. Each scene takes the global T, returns null outside its window and owns
   its fades; the camera inside each scene does the travelling. SCENES (for scripts/finish.py) is the
   table that per-scene clips are cut by. No sound effects in this version: music only. */
export const FILM_END = 164.49;
export const FILM_FRAMES = Math.round(FILM_END * FPS);
const R0 = 221;
export const SCENES: [string, number, number][] = [
  ['S1_85%开场', 0, b(31)],
  ['T_标题', b(31), b(39)],
  ['S2_天黑了_画家', b(39), b(64)],
  ['S3_起名', b(64), b(96)],
  ['S4_心流通道', b(96), b(128)],
  ['S5_传呼机', b(128), b(161)],
  ['S6_工作悖论', b(161), b(185)],
  ['S7_为什么是85%', b(185), b(R0)],
  ['S8_山脊', b(R0), b(R0 + 40)],
  ['S9_the_zone', b(R0 + 40), b(273)],
  ['S10_刚刚好难', b(273), b(311)],
  ['E_片尾', b(311), FILM_END],
];
const SUBS: [Line[], number][] = [[COLD, 0], [S2L, 0], [S3L, 0], [MAPL, 0], [S6L, 0], [S7L, 0], [RIDGE, R0], [S9L, 0], [S10L, 0]];

const QUESTION = '你最近一次忘了时间，是在做什么？';
const SOURCES = 'Csikszentmihalyi 1975, 1990 · Csikszentmihalyi & LeFevre 1989 · Kubey & Csikszentmihalyi 1990 · Wilson et al. 2019 · Keller & Bless 2008 · Ashe 1975';
const EndCard2: React.FC<{T: number}> = ({T}) => {
  const t0 = b(311);
  if (T < t0 - 0.1) return null;
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Create d={`M 960 118 A 52 52 0 1 1 959.99 118`} p={anim(T, t0, 1.2)} color={M.gold} w={3} />
        <Create d={wave(760, 1160, 500, 22)} p={anim(T, t0 + 0.8, 1.2)} color={M.yellow} w={4} />
      </svg>
      <Write p={anim(T, t0 + 0.5, 0.8)} color={M.gold} style={{left: 0, right: 0, top: 128, textAlign: 'center'}}>
        <span style={{fontFamily: LATIN, fontWeight: 600, fontSize: 62, lineHeight: '84px'}}>J</span>
      </Write>
      <Write p={anim(T, t0 + 0.3, 1)} style={{left: 0, right: 0, top: 270, textAlign: 'center'}}>
        <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 96, letterSpacing: '0.12em'}}>《心流》</span>
      </Write>
      <Write p={anim(T, t0 + 1.2, 1)} style={{left: 0, right: 0, top: 570, textAlign: 'center'}}>
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 44}}>{QUESTION}</span>
      </Write>
      <div style={{position: 'absolute', left: 0, right: 0, top: 670, display: 'flex', justifyContent: 'center', opacity: anim(T, t0 + 1.8, 0.6)}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: M.white, border: `2px solid ${M.gold}`, borderRadius: 999, padding: '8px 30px', letterSpacing: '0.06em'}}>关注 Juno · 每期一个反直觉的知识</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: SANS, fontSize: 17, color: 'rgba(255,255,255,0.38)', opacity: anim(T, t0 + 2.2, 0.6)}}>{SOURCES}</div>
    </>
  );
};

export const Film2: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const corner = Math.min(1 - inOut(T, b(29.5), b(39) + 0.2, 0.4, 0.4), 1 - prog(T, b(310.5), b(311.3)));
  return (
    <AbsoluteFill style={{background: M.bg}}>
      <ColdOpen T={T} />
      <Title2 T={T} />
      <S2 T={T} />
      <S3 T={T} />
      <MapScene T={T} />
      <S6 T={T} />
      <S7 T={T} />
      <Ridge T={T} t0={R0} />
      <S9 T={T} />
      <MapEnd T={T} />
      <EndCard2 T={T} />
      {SUBS.map(([lines, off], j) =>
        lines.map(([a, z, zh, en], i) => (T > b(off + a) - 0.5 && T < b(off + z) + 0.5 ? <Sub3 key={`${j}-${i}`} T={T} at={b(off + a) + 0.05} out={b(off + z) - 0.08} zh={<Rich3 s={zh} />} en={en} /> : null)),
      )}
      <div style={{position: 'absolute', top: 36, right: 48, fontFamily: '"Juno Sans", sans-serif', fontSize: 19, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)', opacity: corner}}>
        <span style={{color: M.gold}}>◆ Juno</span> · VIBE知识大赏
      </div>
    </AbsoluteFill>
  );
};
