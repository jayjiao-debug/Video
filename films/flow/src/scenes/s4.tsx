import React from 'react';
import {b, inOut} from '../lib';
import {SANS} from '../look';
import {anim, Create, M, TeX, Write} from '../m3';

/* S4, the quiet section (b96–b128): the flow channel, built one idea per line. Axes (skill s blue,
   challenge c red) → the region above the diagonal shades red (anxiety) → below shades blue
   (boredom) → the band along the diagonal shades yellow (flow, c ≈ s) → a learner climbs a
   staircase that stays inside it: skill grows, then the challenge rises to meet it. */
const W = 1920;
const H = 1080;
export const AX = {x0: 520, y0: 780, x1: 1460, y1: 140};
export const P = (s: number, c: number) => [AX.x0 + s * (AX.x1 - AX.x0), AX.y0 - c * (AX.y0 - AX.y1)];
const E = 0.12;
const poly = (pts: number[][]) => 'M ' + pts.map((p) => p.join(' ')).join(' L ') + ' Z';

export const ChannelAxes: React.FC<{T: number; at: number}> = ({T, at}) => {
  const ax = anim(T, at, 1.2);
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Create d={`M ${AX.x0} ${AX.y0} L ${AX.x1 + 40} ${AX.y0}`} p={ax} color={M.blue} w={4} />
        <Create d={`M ${AX.x0} ${AX.y0} L ${AX.x0} ${AX.y1 - 40}`} p={ax} color={M.red} w={4} />
        <polygon points={`${AX.x1 + 52},${AX.y0} ${AX.x1 + 28},${AX.y0 - 10} ${AX.x1 + 28},${AX.y0 + 10}`} fill={M.blue} opacity={ax} />
        <polygon points={`${AX.x0},${AX.y1 - 52} ${AX.x0 - 10},${AX.y1 - 28} ${AX.x0 + 10},${AX.y1 - 28}`} fill={M.red} opacity={ax} />
      </svg>
      <Write p={anim(T, at + 0.8, 0.8)} color={M.blue} style={{left: AX.x1 + 70, top: AX.y0 - 26}}>
        <span style={{fontFamily: SANS, fontSize: 34}}>技能 </span>
        <TeX tex="s" size={40} color={M.blue} />
      </Write>
      <Write p={anim(T, at + 0.8, 0.8)} color={M.red} style={{left: AX.x0 - 40, top: AX.y1 - 110}}>
        <span style={{fontFamily: SANS, fontSize: 34}}>挑战 </span>
        <TeX tex="c" size={40} color={M.red} />
      </Write>
    </>
  );
};

export const S4: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(96), b(128), 0.6, 0.45);
  const diag = anim(T, b(100), 1);
  const red = anim(T, b(104), 1);
  const blue = anim(T, b(112), 1);
  const band = anim(T, b(120), 1);
  const steps: [number, number][] = [[0.05, 0.05]];
  for (let k = 0; k < 7; k++) {
    const [s, c] = steps[steps.length - 1];
    steps.push([s + 0.12, c]);
    steps.push([s + 0.12, c + 0.12]);
  }
  const path = steps.map(([s, c], i) => `${i ? 'L' : 'M'} ${P(s, c).join(' ')}`).join(' ');
  const walk = anim(T, b(121), b(127.5) - b(121));
  const k = Math.min(steps.length - 1, Math.floor(walk * (steps.length - 1)));
  const [hx, hy] = P(steps[k][0], steps[k][1]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fin}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={poly([P(0, E), P(0, 1), P(1 - E, 1)])} fill={M.red} fillOpacity={0.18 * red} />
        <path d={poly([P(E, 0), P(1, 0), P(1, 1 - E)])} fill={M.blue} fillOpacity={0.16 * blue} />
        <path d={poly([P(0, 0), P(0, E), P(1 - E, 1), P(1, 1), P(1, 1 - E), P(E, 0)])} fill={M.yellow} fillOpacity={0.2 * band} />
        <Create d={`M ${P(0, 0).join(' ')} L ${P(1, 1).join(' ')}`} p={diag} color={M.white} w={3} dash="10 10" />
        <Create d={path} p={walk} color={M.yellow} w={5} />
        {walk > 0 ? <circle cx={hx} cy={hy} r={11} fill={M.yellow} /> : null}
      </svg>
      <ChannelAxes T={T} at={b(96.3)} />
      <Write p={anim(T, b(104.5), 1)} color={M.red} style={{left: 640, top: 250}}>
        <span style={{fontFamily: SANS, fontSize: 40}}>焦虑 </span>
        <TeX tex="c \gg s" size={42} color={M.red} />
      </Write>
      <Write p={anim(T, b(112.5), 1)} color={M.blue} style={{left: 1180, top: 610}}>
        <span style={{fontFamily: SANS, fontSize: 40}}>无聊 </span>
        <TeX tex="c \ll s" size={42} color={M.blue} />
      </Write>
      <Write p={anim(T, b(120.5), 1)} color={M.yellow} style={{left: 900, top: 150}}>
        <span style={{fontFamily: SANS, fontSize: 44}}>心流 </span>
        <TeX tex="c \approx s" size={46} color={M.yellow} />
      </Write>
    </div>
  );
};
