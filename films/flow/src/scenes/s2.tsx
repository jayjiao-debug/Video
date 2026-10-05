import React from 'react';
import {b, clamp, inOut, prog} from '../lib';
import {SANS} from '../look';
import {anim, Create, M, Write} from '../m3';

/* S2 (b39–b64): the painters. Left, a canvas on which a rose curve paints itself in colour; right, a
   graph of how absorbed the painter is over time: high while painting, then, the moment the painting
   is done, it drops (in red) and the canvas is pushed aside. */
const W = 1920;
const H = 1080;
const rose = (cx: number, cy: number, R: number, upto: number) => {
  const n = Math.max(2, Math.floor(400 * upto));
  return Array.from({length: n + 1}, (_, k) => {
    const th = (k / 400) * Math.PI * 2;
    const r = R * Math.cos(4 * th);
    return `${k ? 'L' : 'M'} ${(cx + r * Math.cos(th)).toFixed(1)} ${(cy + r * Math.sin(th)).toFixed(1)}`;
  }).join(' ');
};
// absorption over the scene's time axis: rises, holds high, drops at completion
const absorb = (u: number, done: number) => (u < done ? Math.min(1, 0.15 + u * 3) * (0.92 + 0.06 * Math.sin(u * 40)) : 0.12 + 0.8 * Math.exp(-(u - done) * 30));

export const S2: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(39), b(64), 0.45, 0.45);
  const frame = anim(T, b(39), 1);
  const paint = clamp((T - b(40.5)) / (b(55) - b(40.5)));
  const aside = anim(T, b(56), 1);
  const ax = anim(T, b(41), 1.2);
  // graph: x = time over the scene
  const gx0 = 1060;
  const gx1 = 1740;
  const gy0 = 640;
  const gh = 380;
  const done = (b(55.5) - b(40.5)) / (b(62) - b(40.5));
  const u = clamp((T - b(40.5)) / (b(62) - b(40.5)));
  const pts = Array.from({length: Math.max(2, Math.floor(u * 200))}, (_, k) => {
    const uu = (k / 200) * 1;
    return [gx0 + uu * (gx1 - gx0), gy0 - absorb(uu, done) * gh] as [number, number];
  });
  const before = pts.filter(([x]) => x <= gx0 + done * (gx1 - gx0));
  const after = pts.filter(([x]) => x >= gx0 + done * (gx1 - gx0) - 3);
  const toD = (p: [number, number][]) => p.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const head = pts[pts.length - 1];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fin}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${-aside * 260},${aside * 60}) rotate(${-aside * 8} 480 420)`} opacity={1 - 0.75 * aside}>
          <Create d="M 260 200 L 700 200 L 700 640 L 260 640 Z" p={frame} color={M.white} w={4} />
          {paint > 0 ? <path d={rose(480, 420, 190, paint)} fill="none" stroke={M.teal} strokeWidth={4} strokeLinecap="round" /> : null}
          {paint > 0.3 ? <path d={rose(480, 420, 120, clamp((paint - 0.3) / 0.7))} fill="none" stroke={M.gold} strokeWidth={3} strokeLinecap="round" /> : null}
        </g>
        <Create d={`M ${gx0} ${gy0} L ${gx1 + 30} ${gy0}`} p={ax} color={M.white} w={3} />
        <Create d={`M ${gx0} ${gy0} L ${gx0} ${gy0 - gh - 30}`} p={ax} color={M.white} w={3} />
        {before.length > 1 ? <path d={toD(before)} fill="none" stroke={M.yellow} strokeWidth={5} strokeLinejoin="round" /> : null}
        {after.length > 1 ? <path d={toD(after)} fill="none" stroke={M.red} strokeWidth={5} strokeLinejoin="round" /> : null}
        {head && u > 0 && u < 1 ? <circle cx={head[0]} cy={head[1]} r={9} fill={after.length > 1 ? M.red : M.yellow} /> : null}
        {u > done ? <line x1={gx0 + done * (gx1 - gx0)} y1={gy0} x2={gx0 + done * (gx1 - gx0)} y2={gy0 - gh} stroke={M.grey} strokeWidth={2} strokeDasharray="6 8" /> : null}
      </svg>
      <Write p={anim(T, b(41.5), 0.8)} style={{left: gx1 + 40, top: gy0 - 22}}>
        <span style={{fontFamily: SANS, fontSize: 28}}>时间</span>
      </Write>
      <Write p={anim(T, b(41.5), 0.8)} color={M.yellow} style={{left: gx0 - 20, top: gy0 - gh - 80}}>
        <span style={{fontFamily: SANS, fontSize: 28}}>投入程度</span>
      </Write>
      <Write p={anim(T, b(55.8), 0.8)} color={M.greyB} style={{left: gx0 + done * (gx1 - gx0) - 50, top: gy0 + 16}}>
        <span style={{fontFamily: SANS, fontSize: 24}}>画完了</span>
      </Write>
    </div>
  );
};
