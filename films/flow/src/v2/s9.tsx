import React from 'react';
import {b, clamp, prog} from '../lib';
import {LATIN} from '../look';
import {anim, Create, M} from '../m3';
import {Credit, H, view, W, World} from './kit';

/* S9 (b261 → b273): "the zone". A tennis court seen from above in thin lines, a long rally with a
   trail; the camera drifts with the ball, then the court dims and Ashe's 1974 line is written over it. */
const C = {x: 960, y: 470, w: 1400, h: 620};
export const RALLY = Array.from({length: 18}, (_, k) => b(261.4) + k * 0.66);
const ballAt = (T: number) => {
  let k = 0;
  while (k < RALLY.length - 2 && T > RALLY[k + 1]) k++;
  const u = clamp((T - RALLY[k]) / (RALLY[k + 1] - RALLY[k]));
  const side = k % 2 ? 1 : -1;
  const x0 = C.x + side * C.w * 0.43;
  const x1 = C.x - side * C.w * 0.43;
  const y0 = C.y + Math.sin(k * 1.7) * C.h * 0.3;
  const y1 = C.y + Math.sin((k + 1) * 1.7) * C.h * 0.3;
  return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 50, k, u];
};

export const S9: React.FC<{T: number}> = ({T}) => {
  if (T < b(260.8) || T > b(273.4)) return null;
  const o = clamp(prog(T, b(260.8), b(261.5))) * (1 - prog(T, b(272.5), b(273.2)));
  const [bx, by] = ballAt(T);
  const v = view(T, [
    [b(261), {x: 960, y: 500, z: 1.18}],
    [b(266.5), {x: 960, y: 500, z: 1}],
  ]);
  const vv = {x: v.x + (bx - 960) * 0.06 * (1 - prog(T, b(266), b(267))), y: v.y, z: v.z};
  const court = anim(T, b(261), 1.4);
  const dim = 1 - 0.7 * prog(T, b(266.5), b(267.5));
  const quote = anim(T, b(267.2), 1.6);
  const trail = Array.from({length: 14}, (_, i) => ballAt(T - i * 0.025));
  const L = C.x - C.w / 2;
  const R = C.x + C.w / 2;
  const Tp = C.y - C.h / 2;
  const Bt = C.y + C.h / 2;
  const players = [
    [L + 40, ballAt(Math.min(T, RALLY[RALLY.length - 1]))[1] * 0.5 + C.y * 0.5],
    [R - 40, C.y - (ballAt(T)[1] - C.y) * 0.4],
  ];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <World v={vv}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <g opacity={dim}>
            <rect x={L} y={Tp} width={C.w} height={C.h} fill={M.blueD} opacity={0.08 * court} />
            <Create d={`M ${L} ${Tp} L ${R} ${Tp} L ${R} ${Bt} L ${L} ${Bt} Z`} p={court} color={M.white} w={4} />
            <Create d={`M ${L} ${Tp + C.h * 0.12} L ${R} ${Tp + C.h * 0.12} M ${L} ${Bt - C.h * 0.12} L ${R} ${Bt - C.h * 0.12}`} p={court} color={M.white} w={3} />
            <Create d={`M ${C.x - C.w * 0.27} ${Tp + C.h * 0.12} L ${C.x - C.w * 0.27} ${Bt - C.h * 0.12} M ${C.x + C.w * 0.27} ${Tp + C.h * 0.12} L ${C.x + C.w * 0.27} ${Bt - C.h * 0.12} M ${C.x - C.w * 0.27} ${C.y} L ${C.x + C.w * 0.27} ${C.y}`} p={court} color={M.white} w={3} />
            <Create d={`M ${C.x} ${Tp - 30} L ${C.x} ${Bt + 30}`} p={court} color={M.greyB} w={6} />
            {players.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={20} fill="none" stroke={i ? M.blue : M.teal} strokeWidth={5} opacity={court} />
            ))}
            {T > RALLY[0] && T < RALLY[RALLY.length - 1] + 0.5
              ? trail.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={12 * (1 - i / 16)} fill={M.yellow} opacity={i ? 0.5 * (1 - i / 14) : 1} />)
              : null}
          </g>
        </svg>
      </World>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: quote}}>
        <div style={{display: 'inline-block', clipPath: `inset(-20% ${(1 - clamp(quote / 0.8)) * 100}% -20% -5%)`}}>
          <span style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 92, color: M.white}}>
            “He is in what we call <span style={{color: M.yellow}}>the zone</span>.”
          </span>
        </div>
        <div style={{fontFamily: LATIN, fontSize: 36, color: M.greyB, marginTop: 28, letterSpacing: '0.1em', opacity: anim(T, b(268.5), 0.8)}}>— ARTHUR ASHE, 1974</div>
      </div>
      <Credit o={anim(T, b(267.5), 0.8)}>Arthur Ashe 日记，1974 年 2 月 22 日（收录于 Portrait in Motion, 1975）· 已知最早的记录</Credit>
    </div>
  );
};
