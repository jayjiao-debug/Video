import React from 'react';
import {b, clamp, inOut, prog} from '../lib';
import {LATIN, SANS} from '../look';
import {anim, Create, M, Write} from '../m3';

/* S9 (b241–b273): "the zone". A tennis court from above in thin white lines, a ball rallying across the
   net; Arthur Ashe's 1974 line written out. Then a chessboard: a knight's route, the squares lighting
   up one by one into "another world" (Csikszentmihalyi's childhood, the war, chess). */
const W = 1920;
const H = 1080;
const C = {x: 960, y: 420, w: 1080, h: 480};
export const RALLY = Array.from({length: 24}, (_, k) => b(241.5) + k * 0.68);
const ballAt = (T: number) => {
  let k = 0;
  while (k < RALLY.length - 2 && T > RALLY[k + 1]) k++;
  const u = clamp((T - RALLY[k]) / (RALLY[k + 1] - RALLY[k]));
  const side = k % 2 ? 1 : -1;
  const x0 = C.x + side * C.w * 0.42;
  const x1 = C.x - side * C.w * 0.42;
  const y0 = C.y + Math.sin(k * 1.7) * C.h * 0.32;
  const y1 = C.y + Math.sin((k + 1) * 1.7) * C.h * 0.32;
  return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 40];
};
const KNIGHT: [number, number][] = [[0, 7], [1, 5], [2, 7], [3, 5], [4, 3], [5, 1], [7, 0], [6, 2], [7, 4], [5, 5], [6, 7], [4, 6], [2, 5], [0, 4], [1, 2], [3, 1]];

export const S9: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(241), b(273), 0.45, 0.45);
  const court = anim(T, b(241), 1.4);
  const part2 = prog(T, b(256.5), b(257.5));
  const board = anim(T, b(257), 1.2);
  const S = 52;
  const bx = 960 - 4 * S;
  const by = 420 - 4 * S;
  const hop = clamp((T - b(259)) / (b(271) - b(259))) * (KNIGHT.length - 1);
  const trail = Array.from({length: 12}, (_, i) => ballAt(T - i * 0.03));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fin}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g opacity={1 - part2}>
          <Create d={`M ${C.x - C.w / 2} ${C.y - C.h / 2} L ${C.x + C.w / 2} ${C.y - C.h / 2} L ${C.x + C.w / 2} ${C.y + C.h / 2} L ${C.x - C.w / 2} ${C.y + C.h / 2} Z`} p={court} color={M.white} w={3} />
          <Create d={`M ${C.x} ${C.y - C.h / 2 - 20} L ${C.x} ${C.y + C.h / 2 + 20}`} p={court} color={M.white} w={4} />
          <Create d={`M ${C.x - C.w / 2} ${C.y - C.h * 0.38} L ${C.x + C.w / 2} ${C.y - C.h * 0.38} M ${C.x - C.w / 2} ${C.y + C.h * 0.38} L ${C.x + C.w / 2} ${C.y + C.h * 0.38}`} p={court} color={M.grey} w={2} />
          <Create d={`M ${C.x - C.w * 0.27} ${C.y - C.h * 0.38} L ${C.x - C.w * 0.27} ${C.y + C.h * 0.38} M ${C.x + C.w * 0.27} ${C.y - C.h * 0.38} L ${C.x + C.w * 0.27} ${C.y + C.h * 0.38} M ${C.x - C.w * 0.27} ${C.y} L ${C.x + C.w * 0.27} ${C.y}`} p={court} color={M.grey} w={2} />
          {T > b(241.5)
            ? trail.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11 - i * 0.7} fill={M.yellow} opacity={i ? 0.35 * (1 - i / 12) : 1} />)
            : null}
        </g>
        <g opacity={part2}>
          {Array.from({length: 64}, (_, k) => {
            const i = k % 8;
            const j = Math.floor(k / 8);
            const lit = clamp(hop - ((i * 7 + j * 3) % 16) * 0.9);
            return <rect key={k} x={bx + i * S} y={by + j * S} width={S} height={S} fill={(i + j) % 2 ? M.yellow : M.blue} fillOpacity={0.05 + 0.3 * clamp(lit)} stroke={M.white} strokeOpacity={0.5 * board} strokeWidth={1} />;
          })}
          {hop > 0
            ? (() => {
                const k = Math.min(KNIGHT.length - 2, Math.floor(hop));
                const u = hop - k;
                const [i0, j0] = KNIGHT[k];
                const [i1, j1] = KNIGHT[k + 1];
                const path = KNIGHT.slice(0, k + 1).map(([i, j], n) => `${n ? 'L' : 'M'} ${bx + (i + 0.5) * S} ${by + (j + 0.5) * S}`).join(' ');
                return (
                  <>
                    <path d={path} fill="none" stroke={M.yellow} strokeWidth={3} strokeOpacity={0.7} />
                    <circle cx={bx + (i0 + (i1 - i0) * u + 0.5) * S} cy={by + (j0 + (j1 - j0) * u + 0.5) * S - Math.sin(u * Math.PI) * 30} r={12} fill={M.yellow} />
                  </>
                );
              })()
            : null}
        </g>
      </svg>
      <div style={{opacity: 1 - part2}}>
        <Write p={anim(T, b(249), 1.6)} style={{left: 0, right: 0, top: 710, textAlign: 'center'}}>
          <span style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 46}}>
            “He is in what we call <span style={{color: M.yellow}}>the zone</span>.”
          </span>
        </Write>
        <Write p={anim(T, b(251), 1)} color={M.greyB} style={{left: 0, right: 0, top: 780, textAlign: 'center'}}>
          <span style={{fontFamily: SANS, fontSize: 22}}>Arthur Ashe 日记，1974 年 2 月 22 日 · 目前最早的记录</span>
        </Write>
      </div>
      <Write p={anim(T, b(266), 1.2)} color={M.yellow} style={{left: 0, right: 0, top: 120, textAlign: 'center'}}>
        <span style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 40}}>a different world</span>
      </Write>
    </div>
  );
};
