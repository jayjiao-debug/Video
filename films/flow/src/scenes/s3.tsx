import React from 'react';
import {b, clamp, inOut, lerp, prog} from '../lib';
import {LATIN, SANS} from '../look';
import {anim, Create, M, TeX, Write} from '../m3';

/* S3 (b64–b96): the name. Four panels, four people absorbed: a climber's route, a knight hopping on a
   board, a dancer's figure-eight, a surgeon's running stitch, each traced by a moving dot. Then the
   four traces lift out of their panels and transform into one smooth current crossing the screen;
   the word is written: flow, 1975. */
const W = 1920;
const H = 1080;
const PANELS: [number, number, string, string][] = [
  [180, 170, '攀岩', M.teal],
  [990, 170, '下棋', M.blue],
  [180, 520, '跳舞', M.purple],
  [990, 520, '外科手术', M.green],
];
const PW = 720;
const PH = 300;
const N = 90;
// each panel's trace as N points in panel-local coordinates
const traces: [number, number][][] = [
  Array.from({length: N}, (_, k) => {
    const u = k / (N - 1);
    return [60 + u * 600, 260 - u * 220 + 26 * Math.sin(u * 37) * (1 - u * 0.3)];
  }),
  (() => {
    const knight: [number, number][] = [[0, 0], [1, 2], [3, 3], [5, 2], [6, 0], [4, 1], [2, 0], [0, 1], [1, 3], [3, 2]];
    const pts: [number, number][] = [];
    for (let k = 0; k < N; k++) {
      const f = (k / (N - 1)) * (knight.length - 1);
      const i = Math.min(knight.length - 2, Math.floor(f));
      const s = f - i;
      pts.push([120 + 70 * lerp(knight[i][0], knight[i + 1][0], s), 50 + 60 * lerp(knight[i][1], knight[i + 1][1], s)]);
    }
    return pts;
  })(),
  Array.from({length: N}, (_, k) => {
    const a = (k / (N - 1)) * Math.PI * 2;
    return [360 + 250 * Math.sin(a), 150 + 100 * Math.sin(2 * a)];
  }),
  Array.from({length: N}, (_, k) => {
    const u = k / (N - 1);
    return [60 + u * 600, 150 + (k % 2 ? 60 : -60) * (0.6 + 0.4 * Math.sin(u * 6))];
  }),
];
const current = (i: number): [number, number][] =>
  Array.from({length: N}, (_, k) => {
    const u = k / (N - 1);
    return [120 + u * 1680, 470 + (i - 1.5) * 26 + 90 * Math.sin(u * Math.PI * 2.4 + 0.6) * Math.sin(u * Math.PI)];
  });
const toD = (p: [number, number][]) => p.map(([x, y], k) => `${k ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

export const S3: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(64), b(96), 0.45, 0.45);
  const merge = anim(T, b(80), 2.2);
  const boxes = 1 - prog(T, b(79.5), b(80.5));
  const name = anim(T, b(88), 1.2);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fin}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {PANELS.map(([x, y, , c], i) => {
          const draw = clamp((T - b(64.5) - i * 0.4) / (b(78) - b(64.5)));
          const local = traces[i].slice(0, Math.max(2, Math.floor(draw * N)));
          const world = local.map(([px, py]) => [x + px, y + py] as [number, number]);
          const target = current(i).slice(0, world.length);
          const pts = world.map(([wx, wy], k) => [lerp(wx, target[k][0], merge), lerp(wy, target[k][1], merge)] as [number, number]);
          const head = pts[pts.length - 1];
          return (
            <g key={i}>
              <g opacity={boxes}>
                <Create d={`M ${x} ${y} L ${x + PW} ${y} L ${x + PW} ${y + PH} L ${x} ${y + PH} Z`} p={anim(T, b(64) + i * 0.15, 0.9)} color={M.grey} w={2} />
              </g>
              {draw > 0 ? <path d={toD(pts)} fill="none" stroke={merge > 0.5 ? M.yellow : c} strokeOpacity={merge > 0.5 ? 0.85 : 1} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" /> : null}
              {draw > 0 && draw < 1 && merge < 0.05 ? <circle cx={head[0]} cy={head[1]} r={8} fill={M.white} /> : null}
            </g>
          );
        })}
      </svg>
      {PANELS.map(([x, y, label, c], i) => (
        <div key={i} style={{opacity: boxes}}>
          <Write p={anim(T, b(64.5) + i * 0.2, 0.8)} color={c} style={{left: x + 16, top: y + 10}}>
            <span style={{fontFamily: SANS, fontSize: 28}}>{label}</span>
          </Write>
        </div>
      ))}
      <Write p={anim(T, b(83), 1)} color={M.greyB} style={{left: 0, right: 0, top: 640, textAlign: 'center'}}>
        <span style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 36}}>carried along by a current</span>
      </Write>
      <Write p={name} color={M.yellow} style={{left: 0, right: 0, top: 160, textAlign: 'center'}}>
        <TeX tex={'\\text{flow}'} size={110} color={M.yellow} />
      </Write>
      <Write p={anim(T, b(89.5), 1)} style={{left: 0, right: 0, top: 300, textAlign: 'center'}}>
        <span style={{fontFamily: SANS, fontSize: 30, color: M.greyB}}>Beyond Boredom and Anxiety · 1975</span>
      </Write>
    </div>
  );
};
