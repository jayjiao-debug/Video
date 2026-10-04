import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, zlerp, Subs, SubBand, Chapter, Line, CAST, NIGHT } from '../v6/ui6';
import { Shoulder } from '../v6/S1Cold';
import { Seated, Standing, Bubble, HER, SEAT } from './people7';
import { Vignette, Grain } from '../ui';

/* The subway car (2D). Night: S1 cold open, b16 -> b32. Morning: the ending, b176 -> b194.
   We sit behind 小张 (back of his head, foreground left); she sits across the aisle, reading. */
export const S1_OUT = b(32), MORNING_IN = b(176), MORNING_OUT = b(194);
const FLOOR = 840, BENCH = FLOOR - SEAT, HER_X = 1060, DOOR_X = 1660;
const LINES: Line[] = [
  [-0.4, b(22) - 0.08, '下一站，她就要下车了', "Next stop, she'll be getting off."],
  [b(22) + 0.06, b(29.6), '你们之间，其实只隔着[3.57]个人', "Between you two there are only 3.57 people."],
];
const LINES_AM: Line[] = [
  [MORNING_IN + 0.1, b(185) - 0.1, '世界很小，最后一步，要你自己走', 'The world is small. The last step is yours to take.'],
  [b(185) + 0.06, MORNING_OUT - 0.25, '下一站，换你先开口', 'Next stop, you speak first.'],
];

const Car: React.FC<{ T: number; am: boolean; door: number }> = ({ T, am, door }) => {
  const wall = am ? '#4a5368' : '#1b2232', wall2 = am ? '#3c4457' : '#151b29';
  const streak = (k: number) => (((-T * 2600 + k * 977) % 2600) + 2600) % 2600 - 300;
  return (
    <g>
      <rect x={-400} y={-300} width={2720} height={1700} fill={wall} />
      <rect x={-400} y={60} width={2720} height={40} fill={am ? '#e8e4d6' : '#c9d3e8'} opacity={am ? 0.9 : 0.55} />
      {/* windows with the tunnel outside */}
      {[[150, 700], [780, 1300]].map(([a, z]) => (
        <g key={a}>
          <rect x={a} y={210} width={z - a} height={290} rx={26} fill={am ? '#0f1420' : '#05070c'} stroke={wall2} strokeWidth={14} />
          <clipPath id={`win${a}`}><rect x={a} y={210} width={z - a} height={290} rx={26} /></clipPath>
          <g clipPath={`url(#win${a})`}>
            {Array.from({ length: 7 }, (_, k) => <rect key={k} x={streak(k) + a} y={260 + (k * 37) % 190} width={180 + (k % 3) * 120} height={3 + (k % 2) * 2} fill={am ? '#ffe2a8' : '#9fb8ff'} opacity={0.55} />)}
            <rect x={a} y={210} width={z - a} height={290} fill="url(#glass)" />
          </g>
        </g>
      ))}
      {/* the door */}
      <g>
        <rect x={DOOR_X - 150} y={170} width={300} height={FLOOR - 170} fill={wall2} />
        <rect x={DOOR_X - 150} y={170} width={300} height={FLOOR - 170} fill={am ? '#e9dcc0' : '#0a0d14'} opacity={door} />
        <rect x={DOOR_X - 146 - 140 * door} y={174} width={142} height={FLOOR - 178} rx={6} fill={am ? '#7b8396' : '#2a3246'} stroke="#11151f" strokeWidth={4} />
        <rect x={DOOR_X + 4 + 140 * door} y={174} width={142} height={FLOOR - 178} rx={6} fill={am ? '#7b8396' : '#2a3246'} stroke="#11151f" strokeWidth={4} />
        <rect x={DOOR_X - 120 - 140 * door} y={250} width={90} height={200} rx={10} fill={am ? '#1a2030' : '#05070c'} />
        <rect x={DOOR_X + 30 + 140 * door} y={250} width={90} height={200} rx={10} fill={am ? '#1a2030' : '#05070c'} />
      </g>
      {/* line map above the windows */}
      <g opacity={0.8}>
        <line x1={260} y1={150} x2={1180} y2={150} stroke={am ? '#c9a45c' : '#b8483b'} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, k) => <circle key={k} cx={260 + k * 115} cy={150} r={k === 5 ? 11 : 7} fill={k === 5 ? '#f6cf78' : '#e8e2d2'} />)}
      </g>
      {/* bench */}
      <rect x={-400} y={BENCH - 70} width={2720} height={60} rx={14} fill={am ? '#43618f' : '#283d63'} />
      <rect x={-400} y={BENCH - 16} width={2720} height={38} rx={12} fill={am ? '#4f6fa3' : '#2f4670'} />
      <rect x={-400} y={BENCH + 20} width={2720} height={FLOOR - BENCH - 20} fill={wall2} />
      <rect x={-400} y={BENCH + 20} width={2720} height={8} fill="#000" opacity={0.25} />
      <rect x={-400} y={FLOOR} width={2720} height={600} fill={am ? '#2b3040' : '#0d111b'} />
      {/* poles and handles */}
      {[300, 1440].map((x) => <rect key={x} x={x - 7} y={100} width={14} height={FLOOR - 100} rx={7} fill="#b9c0cc" opacity={0.85} />)}
      <rect x={-400} y={118} width={2720} height={10} rx={5} fill="#b9c0cc" opacity={0.7} />
      {Array.from({ length: 9 }, (_, k) => {
        const x = 120 + k * 210, a = Math.sin(T * 1.6 + k * 0.4) * 5;
        return <g key={k} transform={`rotate(${a} ${x} 123)`}><line x1={x} y1={123} x2={x} y2={175} stroke="#8b93a3" strokeWidth={5} /><circle cx={x} cy={190} r={16} fill="none" stroke="#d9dde6" strokeWidth={6} /></g>;
      })}
      <defs><linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.08" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity="0.05" /></linearGradient></defs>
    </g>
  );
};

/** her, at time T: reading -> standing -> walking out (night); reading -> looks up -> smiles (morning) */
const Her: React.FC<{ T: number; am: boolean }> = ({ T, am }) => {
  const bob = Math.sin(T * 1.7) * 2;
  if (am) {
    const look = easeOut(prog(T, b(181.2), b(181.9)));
    return (
      <g transform={`translate(${HER_X} ${FLOOR})`}>
        <Seated who={HER} mood={look > 0.5 ? 'calm' : 'calm'} book={look < 0.6} pants={1} ly={lerp(8, -3, look)} lx={lerp(0, -10, look)} tilt={lerp(4, -4, look)} bob={bob} />
      </g>
    );
  }
  const stand = easeInOut(prog(T, b(25.2), b(25.9)));
  const walkK = prog(T, b(26), b(28.6));
  const out = 1 - prog(T, b(28.3), b(28.9));
  if (stand < 0.5) {
    return <g transform={`translate(${HER_X} ${FLOOR})`}><Seated who={HER} mood="calm" book pants={1} ly={8} tilt={4} bob={bob} /></g>;
  }
  const x = lerp(HER_X, DOOR_X + 40, easeInOut(walkK));
  return (
    <g transform={`translate(${x} ${FLOOR})`} opacity={out * Math.min(1, (stand - 0.5) * 4)}>
      <Standing who={HER} mood="calm" phase={walkK * Math.PI * 5} walk={walkK > 0 && walkK < 1 ? 1 : 0} pants={1} bag />
    </g>
  );
};

export const SubwayScene: React.FC<{ T: number; am: boolean }> = ({ T, am }) => {
  // camera
  let s = 1.12, fx = 980, fy = 560;
  if (!am) {
    const k = easeInOut(prog(T, 0, b(28)));
    s = lerp(1.2, 1.06, k); fx = lerp(1020, 980, k);
    const p = prog(T, b(29.4), S1_OUT);
    if (p > 0) { const e = Math.pow(p, 2.1); s = zlerp(1.06, 16, e); fx = lerp(980, HER_X, easeInOut(Math.min(1, p * 1.5))); fy = lerp(560, 355, easeInOut(Math.min(1, p * 1.5))); }
  } else {
    const k = easeInOut(prog(T, MORNING_IN, MORNING_OUT));
    s = lerp(1.1, 1.24, k); fx = lerp(960, 1000, k); fy = lerp(560, 540, k);
  }
  const sway = Math.sin(T * 1.7) * 2.5;
  const door = am ? 0 : easeInOut(prog(T, b(26.2), b(26.9))) * (1 - easeInOut(prog(T, b(29), b(29.7))));
  const hi = am ? easeOut(prog(T, b(180.4), b(180.8))) * (1 - prog(T, b(186), b(186.6))) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(960 540) scale(${s}) translate(${-fx} ${-fy + sway})`}>
          <Car T={T} am={am} door={door} />
          <g transform={`translate(300 ${FLOOR})`}><Seated who={CAST[3]} mood="calm" doze={!am} phone={am} pants={0} tilt={am ? 0 : 10} bob={Math.sin(T * 1.7 + 1) * 2} /></g>
          <g transform={`translate(1360 ${FLOOR})`}><Seated who={CAST[5]} mood="calm" phone pants={2} ly={8} bob={Math.sin(T * 1.7 + 2) * 2} /></g>
          <Her T={T} am={am} />
          {/* 小张, back of his head in the foreground */}
          <g transform="translate(-40 170)"><Shoulder T={T} thumbY={0} /></g>
          <Bubble x={700} y={790} text="嗨" o={hi * 1.1} />
        </g>
      </svg>
      {am && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 55% 40%, rgba(255,214,150,0.12), rgba(0,0,0,0))' }} />}
      <SubBand o={0.85} />
      {!am && <Chapter T={T} at={b(23)} out={b(29.4)} text="末 班 地 铁 · 23:41" />}
      {am && <Chapter T={T} at={MORNING_IN + 0.3} out={b(183)} text="第 二 天 · 早 上 8:10" />}
      <Subs T={T} lines={am ? LINES_AM : LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};
