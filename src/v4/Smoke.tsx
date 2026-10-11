import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ZH, EN, beats, prog, easeOut, easeIn, easeInOut, lerp, clamp } from '../lib';
import { mulberry } from '../v1/data';
import { Vignette, Grain } from '../ui';
import { Sub, Chapter, GOLD_TEXT } from './Titanic2';
import { Head, Arm, INK, type Mood } from './Why';

/* 《应该没事吧》 part 3, b80-b96: Latané & Darley (1968), the smoke-filled room.
   Alone: 18 of 24 left to report the smoke (75%). With two confederates who stayed calm: 1 of 10 (10%).
   Two cutaway rooms side by side; time is compressed (6 real minutes in ~6 s). */
const b = (i: number) => beats[i];
export const SMOKE_IN = b(80), SMOKE_OUT = b(96);
const W = 1920, H = 1080;
const rnd = (() => { const r = mulberry(1968); return Array.from({ length: 2000 }, () => r()); })();
const CEIL = 170, FLOOR = 610;
const ROOMS = [{ x0: 90, x1: 910 }, { x0: 1010, x1: 1830 }];
const SMOKE_A = b(81) + 0.2, SMOKE_FULL = b(94);
const CLOCK_A = b(81) + 0.2, CLOCK_B = b(93);
const SWEATER = '#3f6f6c', SWEATER2 = '#2f5552';

/* a person sitting behind a table, facing us; (0,0) = centre of the table edge */
const Seated: React.FC<{ T: number; top: string; hair: string; mood: Mood; lx?: number; ly?: number; write?: boolean; shrug?: number; tilt?: number; ph?: number }> = ({ T, top, hair, mood, lx = 0, ly = 0, write = true, shrug = 0, tilt = 0, ph = 0 }) => {
  const pen = write ? Math.sin(T * 9 + ph) * 7 : 0;
  const lift = shrug * 14;
  const legs = FLOOR - 470;
  return (
    <g>
      {/* chair back behind, legs and shoes under the table */}
      <rect x={-60} y={-176} width={120} height={150} rx={10} fill="#6a5440" />
      <rect x={-52} y={10} width={8} height={legs - 10} fill="#4a3a2c" /><rect x={44} y={10} width={8} height={legs - 10} fill="#4a3a2c" />
      <rect x={-34} y={8} width={26} height={legs - 14} rx={9} fill="#33405e" />
      <rect x={8} y={8} width={26} height={legs - 14} rx={9} fill="#33405e" />
      <ellipse cx={-24} cy={legs - 4} rx={22} ry={8} fill="#1d1c22" /><ellipse cx={24} cy={legs - 4} rx={22} ry={8} fill="#1d1c22" />
      <path d={`M -56 ${-150 - lift} Q 0 ${-168 - lift} 56 ${-150 - lift} L 66 0 L -66 0 Z`} fill={top} />
      <g transform={`translate(0, ${-196 - lift * 0.6})`}><Head hair="slick" hairColor={hair} mood={mood} lx={lx} ly={ly} tilt={tilt} /></g>
      {shrug > 0.5 ? (
        <>
          <Arm d={`M -50 ${-140 - lift} Q -96 -110 -92 -66`} c={top} hand={[-96, -70]} />
          <Arm d={`M 50 ${-140 - lift} Q 96 -110 92 -66`} c={top} hand={[96, -70]} />
        </>
      ) : null}
    </g>
  );
};
const SeatedArms: React.FC<{ T: number; top: string; write?: boolean; shrug?: number; ph?: number }> = ({ T, top, write = true, shrug = 0, ph = 0 }) => {
  if (shrug > 0.5) return null;
  const pen = write ? Math.sin(T * 9 + ph) * 7 : 0;
  return (
    <>
      <Arm d="M -52 -136 Q -70 -60 -34 4" c={top} hand={[-30, 6]} />
      <Arm d={`M 52 -136 Q 74 -60 ${34 + pen} 4`} c={top} hand={[34 + pen, 6]} />
      {write && <line x1={36 + pen} y1={6} x2={46 + pen} y2={-18} stroke="#1d1c22" strokeWidth={4} strokeLinecap="round" />}
    </>
  );
};
const Table: React.FC<{ w: number }> = ({ w }) => (
  <g>
    <rect x={-w / 2 + 16} y={8} width={12} height={FLOOR - 470 - 8} fill="#5a4330" />
    <rect x={w / 2 - 28} y={8} width={12} height={FLOOR - 470 - 8} fill="#5a4330" />
    <rect x={-w / 2} y={-4} width={w} height={16} rx={3} fill="#8a6a4a" />
    {[-w / 2 + 40, w / 2 - 110].map((x, i) => <rect key={i} x={x} y={-10} width={70} height={8} fill="#f3efe6" transform={`rotate(${i ? 4 : -3} ${x} -8)`} />)}
  </g>
);
/* standing, facing us, walking sideways */
const Walker: React.FC<{ T: number; x: number; walking: number }> = ({ T, x, walking }) => {
  const st = Math.sin(T * 14) * walking;
  return (
    <g transform={`translate(${x}, ${FLOOR + 4 - Math.abs(st) * 6})`}>
      <ellipse cx={0} cy={0} rx={56} ry={8} fill="#000" opacity={0.25} />
      <rect x={-26 + st * 8} y={-112} width={22} height={110} rx={8} fill="#33405e" />
      <rect x={4 - st * 8} y={-112} width={22} height={110} rx={8} fill="#33405e" />
      <path d="M -56 -262 Q 0 -280 56 -262 L 62 -104 L -62 -104 Z" fill={SWEATER} />
      <Arm d={`M -50 -250 Q ${-70 - st * 10} -190 ${-58 - st * 14} -140`} c={SWEATER} hand={[-58 - st * 14, -134]} />
      <Arm d={`M 50 -250 Q ${70 + st * 10} -190 ${58 + st * 14} -140`} c={SWEATER} hand={[58 + st * 14, -134]} />
      <g transform="translate(0, -308)"><Head hair="slick" hairColor="#4a3424" mood="worry" lx={-10} /></g>
    </g>
  );
};

/* the smoke: puffs pouring from the vent and a layer sinking from the ceiling */
const Smoke: React.FC<{ T: number; r: number; vx: number }> = ({ T, r, vx }) => {
  const s = clamp((T - SMOKE_A) / (SMOKE_FULL - SMOKE_A));
  const layer = CEIL + (FLOOR - CEIL + 40) * Math.pow(s, 1.25);
  const room = ROOMS[r];
  return (
    <g>
      <rect x={room.x0} y={CEIL} width={room.x1 - room.x0} height={Math.max(0, layer - CEIL)} fill={`url(#sm-layer)`} opacity={0.15 + 0.7 * s} />
      {Array.from({ length: 46 }, (_, i) => {
        const t0 = SMOKE_A + i * 0.16;
        const u = (T - t0) / 3.2;
        if (u <= 0) return null;
        const k = Math.min(1, u);
        const dirx = (rnd[r * 300 + i] - 0.25) * (room.x1 - room.x0) * 0.95;
        const x = vx + 45 + dirx * easeOut(k) + Math.sin(T * 0.8 + i) * 14;
        const y = CEIL + 50 + (layer - CEIL - 40) * rnd[r * 300 + i + 100] * easeOut(k) + 30 * k;
        const rad = 28 + 120 * easeOut(k) * (0.6 + 0.6 * rnd[r * 300 + i + 200]);
        const o = 0.32 * Math.min(1, u * 4) * (0.6 + 0.4 * rnd[r * 300 + i + 50]);
        return <circle key={i} cx={x} cy={y} r={rad} fill="url(#sm-puff)" opacity={o} />;
      })}
    </g>
  );
};

const Room: React.FC<{ T: number; r: number }> = ({ T, r }) => {
  const { x0, x1 } = ROOMS[r];
  const vx = x0 + 60;
  const clockT = clamp((T - CLOCK_A) / (CLOCK_B - CLOCK_A)) * 6; // minutes
  const mm = Math.floor(clockT), ss = Math.floor((clockT - mm) * 60);
  const cx = x1 - 120;
  return (
    <g>
      <defs><clipPath id={`rm${r}`}><rect x={x0} y={CEIL} width={x1 - x0} height={FLOOR - CEIL + 40} /></clipPath></defs>
      <g clipPath={`url(#rm${r})`}>
        <rect x={x0} y={CEIL} width={x1 - x0} height={FLOOR - CEIL} fill="#b8c2d2" />
        <rect x={x0} y={CEIL} width={x1 - x0} height={FLOOR - CEIL} fill="url(#sm-wall)" />
        <rect x={x0} y={FLOOR} width={x1 - x0} height={40} fill="#5d6577" />
        <rect x={x0} y={FLOOR - 10} width={x1 - x0} height={10} fill="#8a93a6" />
        {/* vent */}
        <rect x={vx} y={CEIL + 26} width={92} height={46} rx={4} fill="#6a7385" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={vx + 8} y={CEIL + 34 + i * 9} width={76} height={4} fill="#3a4152" />)}
        {/* wall clock */}
        <circle cx={cx} cy={CEIL + 90} r={38} fill="#f3efe6" stroke="#3a4152" strokeWidth={5} />
        {[[clockT / 60 * Math.PI * 2 + 0.6, 20, 5], [clockT * Math.PI * 2, 30, 3]].map(([a, l, w], k) => (
          <line key={k} x1={cx} y1={CEIL + 90} x2={cx + Math.sin(a) * l} y2={CEIL + 90 - Math.cos(a) * l} stroke={k ? '#c8322c' : INK} strokeWidth={w} strokeLinecap="round" />
        ))}
        {/* door */}
        {r === 0 ? (
          <g>
            <rect x={x0 + 40} y={FLOOR - 250} width={120} height={250} fill="#2a3040" />
            <rect x={x0 + 40} y={FLOOR - 250} width={120 * (1 - 0.85 * easeInOut(prog(T, b(86) + 0.2, b(86) + 0.5)) * (1 - easeInOut(prog(T, b(87) + 0.4, b(87) + 0.7))))} height={250} fill="#8a6a4a" />
            <rect x={x0 + 34} y={FLOOR - 256} width={132} height={8} fill="#5a4330" />
          </g>
        ) : (
          <g>
            <rect x={x1 - 160} y={FLOOR - 250} width={120} height={250} fill="#8a6a4a" />
            <rect x={x1 - 166} y={FLOOR - 256} width={132} height={8} fill="#5a4330" />
            <circle cx={x1 - 150} cy={FLOOR - 120} r={6} fill="#d9b25a" />
          </g>
        )}
        {r === 0 ? <RoomAlone T={T} /> : <RoomThree T={T} />}
        <Smoke T={T} r={r} vx={vx} />
      </g>
      {r === 1 && <Tags T={T} />}
      <rect x={x0} y={CEIL} width={x1 - x0} height={FLOOR - CEIL + 40} fill="none" stroke="#c9c2b0" strokeWidth={4} />
      <text x={x1 - 176} y={CEIL + 100} textAnchor="end" style={{ fontFamily: EN, fontWeight: 600, fontSize: 30, fill: '#1d2230', fontVariantNumeric: 'tabular-nums' }} opacity={easeOut(prog(T, CLOCK_A, CLOCK_A + 0.3))}>
        {mm}:{String(ss).padStart(2, '0')}
      </text>
    </g>
  );
};

/* left: alone. He notices, hesitates, gets up and goes out to report it */
const RoomAlone: React.FC<{ T: number }> = ({ T }) => {
  const TX = 500, TY = 470;
  const look = easeInOut(prog(T, b(83) + 0.3, b(83) + 0.6));
  const stand = T > b(85) + 0.1;
  const walk = prog(T, b(85) + 0.2, b(87) + 0.2);
  const wx = lerp(TX, 190, easeInOut(walk));
  const gone = 1 - prog(T, b(87), b(87) + 0.3);
  return (
    <g>
      {!stand && (
        <g transform={`translate(${TX}, ${TY})`}>
          <Seated T={T} top={SWEATER} hair="#4a3424" mood={look > 0.5 ? 'worry' : 'calm'} lx={-6 * look} ly={-10 * look + 6 * (1 - look)} write={look < 0.3} />
        </g>
      )}
      <g transform={`translate(${TX}, ${TY})`}><Table w={280} /></g>
      {!stand && <g transform={`translate(${TX}, ${TY})`}><SeatedArms T={T} top={SWEATER} write={look < 0.3} /></g>}
      {stand && gone > 0 && <g opacity={gone}><Walker T={T} x={wx} walking={walk > 0 && walk < 1 ? 1 : 0} /></g>}
      {T > b(84) + 0.2 && T < b(85) + 0.3 && (
        <text x={TX + 60} y={TY - 270} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, fill: '#c8322c' }} opacity={easeOut(prog(T, b(84) + 0.2, b(84) + 0.4))}>！</text>
      )}
    </g>
  );
};

/* right: the subject between two confederates who stay calm */
const RoomThree: React.FC<{ T: number }> = ({ T }) => {
  const TX = 1420, TY = 470;
  const look = easeInOut(prog(T, b(84), b(84) + 0.3)) * (1 - easeInOut(prog(T, b(89), b(89) + 0.4)));
  const glance = T < b(85) + 0.2 ? 0 : T < b(86) ? -1 : T < b(87) ? 1 : 0;
  const shrug = T > b(87) + 0.2 && T < b(88) + 0.6 ? 1 : 0;
  const people = [
    { dx: -150, top: '#5a5f6e', hair: '#2a211c', conf: true, ph: 1.3 },
    { dx: 0, top: SWEATER, hair: '#4a3424', conf: false, ph: 0 },
    { dx: 150, top: '#6e5a4a', hair: '#1f1a1d', conf: true, ph: 2.6 },
  ];
  return (
    <g>
      {people.map((p, i) => (
        <g key={i} transform={`translate(${TX + p.dx}, ${TY})`}>
          <Seated T={T} top={p.top} hair={p.hair} write={p.conf ? !shrug : look < 0.3}
            mood={p.conf ? (shrug ? 'smug' : 'calm') : look > 0.5 ? 'worry' : 'calm'}
            lx={p.conf ? 0 : glance * 16} ly={p.conf ? 6 : -10 * look + 6 * (1 - look)} shrug={p.conf ? shrug : 0} ph={p.ph} />
        </g>
      ))}
      <g transform={`translate(${TX}, ${TY})`}><Table w={520} /></g>
      {people.map((p, i) => (
        <g key={i} transform={`translate(${TX + p.dx}, ${TY})`}>
          <SeatedArms T={T} top={p.top} write={p.conf ? !shrug : look < 0.3} shrug={p.conf ? shrug : 0} ph={p.ph} />
        </g>
      ))}
    </g>
  );
};

const Tags: React.FC<{ T: number }> = ({ T }) => {
  const TX = 1420, TY = 470;
  const tagO = easeOut(prog(T, b(88), b(88) + 0.4)) * (1 - prog(T, b(94), b(94) + 0.4));
  const people = [{ dx: -150, conf: true }, { dx: 0, conf: false }, { dx: 150, conf: true }];
  return (
    <g>
      {people.filter((p) => p.conf).map((p, i) => (
        <g key={i} opacity={tagO} transform={`translate(${TX + p.dx}, ${TY - 262})`}>
          <rect x={-70} y={-26} width={140} height={40} rx={20} fill="#1d2230" opacity={0.85} />
          <text x={0} y={2} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 22, fill: '#f3ede2', letterSpacing: '0.06em' }}>演员 · 装没事</text>
        </g>
      ))}
    </g>
  );
};

/* the result bars */
const Bar: React.FC<{ T: number; r: number; pct: number; at: number; color: string; note: string; label: string }> = ({ T, r, pct, at, color, note, label }) => {
  const { x0, x1 } = ROOMS[r];
  const g = easeInOut(prog(T, at, at + 1.1));
  const o = easeOut(prog(T, at - 0.3, at));
  const w = x1 - x0 - 220;
  return (
    <g opacity={o}>
      <text x={x0} y={690} style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.75)', letterSpacing: '0.1em' }}>{label}</text>
      <rect x={x0} y={706} width={w} height={22} rx={11} fill="#1d2433" />
      <rect x={x0} y={706} width={Math.max(0.01, w * pct * g)} height={22} rx={11} fill={color} />
      <text x={x0 + w + 24} y={734} style={{ fontFamily: EN, fontWeight: 600, fontSize: 64, fill: color, fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct * 100 * g)}%</text>
      <text x={x0} y={762} style={{ fontFamily: ZH, fontSize: 20, fill: 'rgba(243,237,226,0.5)', letterSpacing: '0.08em' }} opacity={easeOut(prog(T, at + 0.8, at + 1.2))}>{note}</text>
    </g>
  );
};

type Line = [number, number, string, string];
const LINES: Line[] = [
  [SMOKE_IN + 0.15, b(86) - 0.08, '1968年，心理学家往一间屋里灌烟', 'In 1968, psychologists pumped smoke into a room.'],
  [b(86) + 0.06, b(91) - 0.08, '一个人在屋里：[75%]起身出去报告', 'Alone, 75% got up and reported it.'],
  [b(91) + 0.06, SMOKE_OUT - 0.25, '身边两个人装作没事：只剩{10%}', 'With two people acting calm: 10%.'],
];
export const SmokeScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < SMOKE_IN - 0.05 || T > SMOKE_OUT + 0.05) return null;
  const inO = easeOut(prog(T, SMOKE_IN - 0.05, SMOKE_IN + 0.35));
  const push = lerp(1.0, 1.04, easeInOut(prog(T, SMOKE_IN, SMOKE_OUT)));
  const white = easeIn(prog(T, b(94) + 0.2, SMOKE_OUT));
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a12', opacity: inO }}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="sm-puff"><stop offset="0" stopColor="#eef1f5" stopOpacity="1" /><stop offset="0.6" stopColor="#dfe3ea" stopOpacity="0.6" /><stop offset="1" stopColor="#dfe3ea" stopOpacity="0" /></radialGradient>
          <linearGradient id="sm-layer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9ecf1" stopOpacity="0.95" /><stop offset="0.8" stopColor="#e2e6ec" stopOpacity="0.75" /><stop offset="1" stopColor="#e2e6ec" stopOpacity="0" /></linearGradient>
          <linearGradient id="sm-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.1" /><stop offset="1" stopColor="#000" stopOpacity="0.3" /></linearGradient>
        </defs>
        <g transform={`translate(${W / 2} 480) scale(${push}) translate(${-W / 2} -455)`}>
          <text x={(ROOMS[0].x0 + ROOMS[0].x1) / 2} y={CEIL - 26} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 32, fill: '#f3ede2', letterSpacing: '0.16em' }}>一个人</text>
          <text x={(ROOMS[1].x0 + ROOMS[1].x1) / 2} y={CEIL - 26} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 32, fill: '#f3ede2', letterSpacing: '0.16em' }}>三个人（其中两个是演员）</text>
          <Room T={T} r={0} />
          <Room T={T} r={1} />
          <Bar T={T} r={0} pct={0.75} at={b(86) + 0.3} color="#f6cf78" label="出去报告的人" note="24人中有18人 · Latané & Darley, 1968" />
          <Bar T={T} r={1} pct={0.1} at={b(91) + 0.3} color="#ff6a5c" label="出去报告的人" note="10人中只有1人 · 其余的人坐在烟里填完问卷" />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 260, background: 'linear-gradient(180deg, rgba(7,10,18,0) 0%, rgba(7,10,18,0.7) 60%, rgba(7,10,18,0.85) 100%)' }} />
      <Chapter T={T} at={SMOKE_IN + 0.2} out={SMOKE_OUT - 0.3} text="1968 · 哥 伦 比 亚 大 学 · 烟 雾 实 验" />
      {LINES.map(([at, out, zh, en], i) => <Sub key={i} T={T} at={at} out={out} zh={zh} en={en} />)}
      <Vignette strength={0.4} />
      <Grain />
      <AbsoluteFill style={{ background: '#e9ecf1', opacity: white }} />
    </AbsoluteFill>
  );
};
export { GOLD_TEXT };
