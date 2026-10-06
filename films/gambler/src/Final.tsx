import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { EV, BEAT, FILM_END, ZH, SANS, MONO, EN, prog, easeOut, easeIn, easeInOut, expoInOut, clamp, lerp, hit, rnd } from './lib';
import { LOOKS, LookCtx } from './look';
import { JUNO } from './brand/identity';
import { Subtitles } from './subs';

/* 《大脑是个赌徒》 final. One room, one table, one hanging lamp; the camera travels it.
   - The music comes from a turntable on the table: when the film takes the music away, the needle lifts
     (the drop taken away at 8.1 s, the silent beat at 83.1 s); when it repeats a bar, the needle skips back a groove.
   - The brain's bets are cards: face down = the guess, flipped = what the music did.
   - The anticipation is a brass gauge on the table (示意, not a measurement).
   - The brain scan is a film on a lightbox on the wall, lit only in the quiet break.
   Motivated light: the warm lamp (key), a cool city window (rim), the lightbox. No chips, no money (platform review).
   Every frame is a pure function of T; fast camera moves are motion-blurred. Text is never slowly scaled. */

const GOLD = '#f1c56d', GOLD_GLOW = 'rgba(241,197,109,0.75)', RED = '#ff4a3a', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.55)';
const CREAM = '#f4ead4', BACK = '#1b2440';
const BAR = 128;
const SAMPLES = 6;

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '400 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '400 40px "JunoMono"', '700 40px "JunoMono"', '700 40px "Cormorant Garamond"']
      .map((f) => document.fonts.load(f, '测试0123')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
};

/* ---------------------------------------------------------------- timing */
const down = (k: number) => EV.title + k * 4 * BEAT; // bar downbeats after the title (grid is right in this section)
const vis = (T: number, a: number, z: number, fi = 0.3, fo = 0.4) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));
const S = { // sub-line times used by visuals (from lib SUBS)
  data1: 32.6, data2: 36.93, two: 40.78, sure: 43.53, unsure: 46.11, wait: 54.93, arrive: 58.26,
  bid: 92.2, bid2: 96.73, all: 100.2, tk1: 104.32, tk2: 107.46, tk3: 111.42, tk4: 114.4, end: 120.5,
};

const lamp = (T: number) => {
  let v = 1;
  v -= 0.78 * prog(T, EV.cut1, EV.cut1 + 0.06) * (1 - prog(T, EV.replay - 0.1, EV.replay + 0.25));
  v -= 0.35 * prog(T, EV.break, EV.break + 1.5) * (1 - prog(T, EV.riser - 0.3, EV.riser + 0.4));
  v -= 0.97 * prog(T, EV.hush, EV.hush + 0.04) * (1 - prog(T, EV.pickup - 0.02, EV.pickup));
  v += 0.6 * hit(T, EV.pickup, 0.5) + 0.25 * hit(T, EV.drop, 0.4) + 0.45 * hit(T, EV.title, 0.4);
  v -= 0.25 * prog(T, S.end, S.end + 0.8);
  return v;
};
const lightbox = (T: number) => {
  const on = prog(T, EV.break + 0.5, EV.break + 0.6) * (1 - prog(T, EV.riser, EV.riser + 0.3));
  const flick = T < EV.break + 1.1 && T > EV.break + 0.5 ? (Math.sin(T * 90) > 0.2 ? 1 : 0.35) : 1;
  return on * flick;
};
/** the needle is off the record (the music has been taken away) */
const lifted = (T: number) => {
  const a = prog(T, EV.cut1 - 0.04, EV.cut1 + 0.06) * (1 - prog(T, EV.replay - 0.1, EV.replay));
  const b = prog(T, EV.hush - 0.04, EV.hush + 0.04) * (1 - prog(T, EV.pickup - 0.06, EV.pickup));
  return Math.max(a, b);
};
/** expectation gauge, 0..1+ (示意) */
const gauge = (T: number) => {
  if (T < EV.cut1) return lerp(0.08, 0.88, easeIn(prog(T, 0, EV.cut1)));
  if (T < EV.replay) return lerp(0.88, 0.04, easeOut(prog(T, EV.cut1, EV.cut1 + 0.5)));
  if (T < EV.title) return lerp(0.04, 0.9, easeIn(prog(T, EV.replay, EV.title)));
  if (T < EV.break) {
    let v = lerp(1.1, 0.34, easeOut(prog(T, EV.title, EV.title + 3)));
    for (let k = 2; k <= 7; k++) v += 0.12 * hit(T, down(k), 0.6);
    return v;
  }
  if (T < EV.riser) return lerp(0.34, 0.24, prog(T, EV.break, EV.riser));
  if (T < EV.breath2) return lerp(0.24, 0.94, easeInOut(prog(T, EV.riser, EV.breath2)));
  if (T < EV.pickup) return 0.94 + 0.06 * prog(T, EV.breath2, EV.hush) + 0.015 * Math.sin(T * 47);
  return lerp(1.18, 0.5, easeOut(prog(T, EV.pickup, EV.pickup + 7))) + 0.06 * hit(T, EV.drop, 0.3);
};

/* ---------------------------------------------------------------- camera */
type Cam = { z: number; cx: number; cy: number };
const C = (z: number, cx: number, cy: number): Cam => ({ z, cx, cy });
const WIDE = C(1, 960, 560), CARD1 = C(1.42, 960, 690), CARD2 = C(1.72, 960, 705);
const ROW0 = C(1.5, 650, 700), ROW1 = C(1.5, 1270, 700), DATA = C(1.08, 960, 610);
const LBOX0 = C(2.0, 1410, 290), LBOX1 = C(2.2, 1410, 290);
const BUILD0 = C(1.06, 1080, 610), BUILD1 = C(1.45, 1170, 700), DROP = C(1.3, 1080, 690);
const PILE = C(1.25, 960, 650), TK = [C(1.72, 600, 690), C(1.72, 960, 690), C(1.72, 1320, 690)], TKALL = C(1.22, 960, 650);
type Seg = [number, number, Cam, Cam, 'io' | 'lin' | 'in' | 'expo'];
const CAM: Seg[] = [
  [0, EV.cut1, WIDE, CARD1, 'io'],
  [EV.replay, EV.title, CARD1, CARD2, 'io'],
  [EV.title + 2.9, EV.title + 3.5, CARD2, ROW0, 'expo'],
  [EV.title + 3.5, 32.3, ROW0, ROW1, 'lin'],
  [32.3, 32.9, ROW1, DATA, 'expo'],
  [EV.break - 0.1, EV.break + 0.5, DATA, LBOX0, 'expo'],
  [EV.break + 0.5, EV.riser, LBOX0, LBOX1, 'lin'],
  [EV.riser, EV.riser + 0.6, LBOX1, BUILD0, 'expo'],
  [EV.riser + 0.6, EV.breath2, BUILD0, BUILD1, 'in'],
  [EV.pickup - 0.001, EV.pickup, BUILD1, DROP, 'lin'], // a cut on the hit
  [91.9, 92.5, DROP, DATA, 'expo'],
  [100.0, 100.6, DATA, PILE, 'expo'],
  [S.tk1 - 0.35, S.tk1 + 0.15, PILE, TK[0], 'expo'],
  [S.tk2 - 0.35, S.tk2 + 0.15, TK[0], TK[1], 'expo'],
  [S.tk3 - 0.35, S.tk3 + 0.15, TK[1], TK[2], 'expo'],
  [S.tk4 - 0.3, S.tk4 + 0.4, TK[2], TKALL, 'expo'],
  [EV.outro - 0.2, S.end + 2, TKALL, C(0.98, 960, 560), 'io'],
];
const camAt = (T: number): Cam => {
  let last: Cam = WIDE;
  for (const [a, z, f, t, e] of CAM) {
    if (T < a) break;
    if (T >= z) { last = t; continue; }
    const u = prog(T, a, z);
    const k = e === 'lin' ? u : e === 'in' ? u * u : e === 'expo' ? expoInOut(u) : easeInOut(u);
    return { z: lerp(f.z, t.z, k), cx: lerp(f.cx, t.cx, k), cy: lerp(f.cy, t.cy, k) };
  }
  return last;
};
const shakeAt = (T: number) => {
  const h = 16 * hit(T, EV.pickup, 0.25) + 8 * hit(T, EV.drop, 0.2) + 10 * hit(T, EV.title, 0.2) + 3 * hit(T, EV.cut1, 0.15)
    + (T > EV.breath2 && T < EV.hush ? 1.6 : 0) + 6 * hit(T, EV.breath2, 0.2);
  return [Math.sin(T * 83) * h, Math.cos(T * 67) * h * 0.6];
};
const camMoving = (T: number) => {
  const a = camAt(T), b = camAt(T - 1 / 30);
  return Math.abs(a.cx - b.cx) * a.z > 18 || Math.abs(a.cy - b.cy) * a.z > 18 || Math.abs(Math.log(a.z / b.z)) > 0.03;
};

/* ---------------------------------------------------------------- the set */
const Wall: React.FC<{ T: number; L: number }> = ({ T, L }) => {
  const lb = lightbox(T);
  return (
    <g>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0a0c" /><stop offset="1" stopColor="#17110d" /></linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#081326" /><stop offset="1" stopColor="#1a2d4c" /></linearGradient>
        <radialGradient id="lbglow" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stopColor="#eaf4ff" /><stop offset="1" stopColor="#a9c4dc" /></radialGradient>
      </defs>
      <rect x={-400} y={-300} width={2720} height={880} fill="url(#wall)" />
      {Array.from({ length: 58 }, (_, i) => <line key={i} x1={-400 + i * 48} y1={-300} x2={-400 + i * 48} y2={545} stroke="#ffffff" strokeOpacity={0.022} strokeWidth={14} />)}
      <rect x={-400} y={528} width={2720} height={24} fill="#0a0806" />
      {/* window: the cool rim light */}
      <g>
        <rect x={130} y={100} width={390} height={350} fill="url(#sky)" />
        {Array.from({ length: 9 }, (_, i) => {
          const bx = 130 + i * 44, bh = 70 + rnd(i, 1) * 170;
          return (
            <g key={i}>
              <rect x={bx} y={450 - bh} width={42} height={bh} fill="#0a0f1a" />
              {Array.from({ length: 10 }, (_, j) => rnd(i * 10 + j, 2) > 0.62 ? <rect key={j} x={bx + 6 + (j % 3) * 12} y={450 - bh + 10 + Math.floor(j / 3) * 18} width={6} height={8} fill={rnd(i * 10 + j, 3) > 0.5 ? '#ffd59a' : '#9fc4ff'} opacity={0.55 + 0.3 * Math.sin(T * 0.3 + i + j)} /> : null)}
            </g>
          );
        })}
        <rect x={130} y={100} width={390} height={350} fill="none" stroke="#1c1612" strokeWidth={14} />
        <line x1={325} y1={100} x2={325} y2={450} stroke="#1c1612" strokeWidth={10} />
        <line x1={130} y1={275} x2={520} y2={275} stroke="#1c1612" strokeWidth={10} />
        <rect x={110} y={450} width={430} height={18} fill="#1e1712" />
      </g>
      {/* lightbox with a brain scan film */}
      <g>
        <rect x={1188} y={108} width={444} height={324} rx={8} fill="#141110" stroke="#2a221c" strokeWidth={8} />
        <rect x={1200} y={120} width={420} height={300} fill={lb > 0 ? 'url(#lbglow)' : '#101214'} opacity={lb > 0 ? 0.25 + 0.75 * lb : 1} />
        <g opacity={0.15 + 0.85 * lb}>
          <path d="M 1280 300 C 1262 222 1312 165 1398 160 C 1480 152 1550 196 1548 268 C 1546 318 1516 342 1484 344 C 1470 372 1430 380 1410 360 C 1360 368 1296 356 1280 300 Z" fill="rgba(20,30,40,0.12)" stroke="#1d2a36" strokeWidth={3} />
          <path d="M 1300 250 C 1330 236 1350 262 1380 248 M 1330 200 C 1360 190 1380 214 1410 200 M 1420 186 C 1450 176 1470 200 1500 190 M 1450 240 C 1480 230 1500 256 1528 246 M 1310 300 C 1340 290 1362 312 1392 300 M 1420 300 C 1450 288 1470 312 1500 300" fill="none" stroke="#1d2a36" strokeWidth={2} opacity={0.6} />
          <text x={1214} y={142} style={{ fontFamily: MONO, fontSize: 11, fill: '#1d2a36', letterSpacing: '0.2em' }}>PET · [11C]RACLOPRIDE · 示意</text>
        </g>
        {/* the two places */}
        {[[1390, 262, S.wait, '等', '尾状核'], [1440, 300, S.arrive, '到', '伏隔核']].map(([x, y, at, a, b], i) => {
          const on = easeOut(prog(T, at as number, (at as number) + 0.35)) * lb;
          return (
            <g key={i} opacity={lb}>
              <circle cx={x as number} cy={y as number} r={10 + 22 * on} fill={GOLD} opacity={0.25 * on} />
              <circle cx={x as number} cy={y as number} r={7} fill={on > 0.05 ? GOLD : '#2a3440'} style={on > 0.05 ? { filter: `drop-shadow(0 0 ${10 * on}px ${GOLD})` } : undefined} />
              <line x1={x as number} y1={y as number} x2={i === 0 ? 1290 : 1560} y2={i === 0 ? 382 : 392} stroke="#1d2a36" strokeWidth={1.5} opacity={0.3 + 0.7 * on} />
              <text x={i === 0 ? 1236 : 1514} y={i === 0 ? 398 : 408} opacity={0.35 + 0.65 * on} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 30, fill: '#1a1410' }}>{a as string}</text>
              <text x={i === 0 ? 1268 : 1546} y={i === 0 ? 396 : 406} opacity={0.35 + 0.65 * on} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, fill: '#1d2a36' }}>{b as string}</text>
            </g>
          );
        })}
      </g>
      {/* lightbox spill on the wall */}
      {lb > 0 && <ellipse cx={1410} cy={270} rx={420} ry={300} fill="#bcd8ff" opacity={0.07 * lb} />}
      {/* window spill */}
      <polygon points="130,450 520,450 700,700 -60,700" fill="#6f9cff" opacity={0.035} />
      <rect x={-400} y={-300} width={2720} height={880} fill="#000" opacity={clamp(0.55 - 0.45 * L, 0, 0.85)} />
    </g>
  );
};

const Table: React.FC<{ T: number; L: number }> = ({ T, L }) => (
  <g>
    <defs>
      <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b2617" /><stop offset="0.5" stopColor="#2a1a0f" /><stop offset="1" stopColor="#140c06" /></linearGradient>
      <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffcf8a" stopOpacity={0.55} /><stop offset="0.55" stopColor="#ffb060" stopOpacity={0.16} /><stop offset="1" stopColor="#ff9a40" stopOpacity={0} /></radialGradient>
    </defs>
    <polygon points="120,552 1800,552 2400,1300 -480,1300" fill="url(#wood)" />
    {Array.from({ length: 34 }, (_, i) => {
      const u = i / 33, x0 = lerp(120, 1800, u), x1 = lerp(-480, 2400, u);
      const w = Math.sin(i * 1.7) * 30;
      return <path key={i} d={`M ${x0} 552 Q ${lerp(x0, x1, 0.5) + w} 900 ${x1} 1300`} stroke="#000" strokeOpacity={0.12 + 0.08 * rnd(i, 4)} strokeWidth={1.2 + rnd(i, 5) * 1.5} fill="none" />;
    })}
    <line x1={120} y1={553} x2={1800} y2={553} stroke="#7a5536" strokeWidth={3} opacity={0.6} />
    <ellipse cx={960} cy={780} rx={720} ry={230} fill="url(#pool)" opacity={clamp(L, 0, 1.6)} />
    <polygon points="120,552 1800,552 2400,1300 -480,1300" fill="#000" opacity={clamp(0.5 - 0.45 * L, 0, 0.9)} />
  </g>
);

const Lamp: React.FC<{ T: number; L: number }> = ({ T, L }) => {
  const sway = Math.sin(T * 0.6) * 1.2;
  return (
    <g transform={`rotate(${sway} 960 -300)`}>
      <defs>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd9a0" stopOpacity={0.22} /><stop offset="1" stopColor="#ffb870" stopOpacity={0} /></linearGradient>
        <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a2c1c" /><stop offset="0.45" stopColor="#8a6a3e" /><stop offset="1" stopColor="#2a1f14" /></linearGradient>
      </defs>
      <polygon points="905,232 1015,232 1480,1000 440,1000" fill="url(#cone)" opacity={clamp(L, 0, 1.5)} style={{ mixBlendMode: 'screen' }} />
      {Array.from({ length: 26 }, (_, i) => {
        const y = 260 + ((rnd(i, 1) * 700 + T * (8 + 10 * rnd(i, 2))) % 700);
        const half = lerp(55, 520, (y - 232) / 768);
        const x = 960 + (rnd(i, 3) * 2 - 1) * half * 0.8 + Math.sin(T * 0.7 + i) * 10;
        return <circle key={i} cx={x} cy={y} r={1 + rnd(i, 4) * 1.6} fill="#ffe6b8" opacity={(0.12 + 0.3 * rnd(i, 5)) * clamp(L, 0, 1)} />;
      })}
      <line x1={960} y1={-300} x2={960} y2={150} stroke="#1a1410" strokeWidth={5} />
      <path d="M 900 236 Q 908 168 960 150 Q 1012 168 1020 236 Z" fill="url(#shade)" />
      <ellipse cx={960} cy={236} rx={60} ry={8} fill={`rgba(255,220,160,${clamp(0.25 + 0.7 * L, 0, 1)})`} />
      <ellipse cx={960} cy={240} rx={34} ry={7} fill="#fff4d8" opacity={clamp(L, 0, 1)} style={{ filter: 'blur(3px)' }} />
    </g>
  );
};

const Turntable: React.FC<{ T: number }> = ({ T }) => {
  const cx = 390, cy = 772;
  const ang = T * 200; // 33⅓ rpm, on its own clock
  const up = lifted(T);
  const skip = hit(T, EV.breath2, 0.12) - hit(T, EV.breath2 + 0.1, 0.12) * 0.6;
  const armA = -24 + 3 * up + 5 * skip;
  return (
    <g>
      <polygon points="170,712 610,712 652,870 128,870" fill="#24170d" />
      <polygon points="128,870 652,870 652,900 128,900" fill="#120b06" />
      <polygon points="170,712 610,712 652,870 128,870" fill="none" stroke="#5b3d24" strokeWidth={2} opacity={0.7} />
      <ellipse cx={cx} cy={cy + 10} rx={182} ry={70} fill="#000" opacity={0.45} />
      <g transform={`translate(${cx} ${cy}) scale(1 0.38)`}>
        <circle r={176} fill="#2b2b2e" />
        <circle r={168} fill="#0b0b0d" />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} r={70 + i * 7} fill="none" stroke="#1c1c20" strokeWidth={2} />)}
        <g transform={`rotate(${ang})`}>
          <path d="M 0 0 L 168 -18 A 168 168 0 0 1 168 18 Z" fill="#ffffff" opacity={0.06} />
          <path d="M 0 0 L -168 -18 A 168 168 0 0 0 -168 18 Z" fill="#ffffff" opacity={0.04} />
          <circle r={56} fill="#b0342a" />
          <circle r={56} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.7} />
          <rect x={-30} y={-6} width={60} height={12} fill={GOLD} opacity={0.7} />
          <circle r={5} fill="#ddd" />
        </g>
      </g>
      {/* tonearm */}
      <circle cx={575} cy={730} r={20} fill="#3a3a3e" stroke="#777" strokeWidth={2} />
      <g transform={`translate(0 ${-20 * up}) rotate(${armA} 575 730)`}>
        <line x1={575} y1={730} x2={575} y2={858} stroke="#b9b9be" strokeWidth={7} strokeLinecap="round" />
        <rect x={562} y={850} width={26} height={30} rx={3} fill="#2d2d31" stroke="#999" strokeWidth={1.5} />
      </g>
      <ellipse cx={500} cy={804} rx={20} ry={6} fill="#000" opacity={0.5 - 0.3 * up} />
    </g>
  );
};

const Dial: React.FC<{ T: number }> = ({ T }) => {
  const x = 1535, y = 742, r = 112;
  const v = gauge(T);
  const over = Math.max(0, v - 1);
  const ang = v <= 1 ? -120 + 240 * clamp(v) : 120 + Math.min(20, over * 110) + Math.sin(T * 60) * 2.5 * Math.min(1, over * 6);
  const ticks = Array.from({ length: 25 }, (_, i) => -120 + i * 10);
  const pol = (a: number, rr: number): [number, number] => [x + rr * Math.sin((a * Math.PI) / 180), y - rr * Math.cos((a * Math.PI) / 180)];
  return (
    <g>
      <rect x={x - 40} y={y + r - 6} width={80} height={56} fill="#2a1d12" />
      <ellipse cx={x} cy={y + r + 56} rx={120} ry={18} fill="#000" opacity={0.5} />
      <circle cx={x} cy={y} r={r + 14} fill="#7a5a2e" />
      <circle cx={x} cy={y} r={r + 8} fill="#c89a52" />
      <circle cx={x} cy={y} r={r} fill={CREAM} />
      <path d={`M ${pol(96, r - 10)[0]} ${pol(96, r - 10)[1]} A ${r - 10} ${r - 10} 0 0 1 ${pol(120, r - 10)[0]} ${pol(120, r - 10)[1]}`} stroke={RED} strokeWidth={10} fill="none" opacity={0.85} />
      {ticks.map((a, i) => {
        const [x1, y1] = pol(a, r - 16), [x2, y2] = pol(a, r - (i % 5 === 0 ? 34 : 26));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a1d12" strokeWidth={i % 5 === 0 ? 3 : 1.5} />;
      })}
      <text x={x} y={y + 40} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 24, fill: '#2a1d12' }}>期待值</text>
      <text x={x} y={y + 62} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 13, fill: '#6b5a44' }}>（示意）</text>
      <g transform={`rotate(${ang} ${x} ${y})`}>
        <polygon points={`${x - 4},${y + 14} ${x + 4},${y + 14} ${x + 1.5},${y - r + 22} ${x - 1.5},${y - r + 22}`} fill={over > 0 ? RED : '#1a1410'} />
      </g>
      <circle cx={x} cy={y} r={10} fill="#c89a52" stroke="#5a4020" strokeWidth={2} />
      <circle cx={x - 40} cy={y - 50} r={r * 0.7} fill="#fff" opacity={0.06} />
      {over > 0 && <circle cx={x} cy={y} r={r + 30} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.6 * hit(T, EV.pickup, 0.6)} />}
    </g>
  );
};

/* ---------------------------------------------------------------- cards (HTML, in world coords) */
const Card: React.FC<{ x: number; y: number; w?: number; flip: number; face?: React.ReactNode; tone?: 'cream' | 'gold' | 'red' | 'dim'; rot?: number; o?: number; lift?: number; sc?: number }> =
  ({ x, y, w = 150, flip, face, tone = 'cream', rot = 0, o = 1, lift = 0, sc = 1 }) => {
    if (o <= 0.001) return null;
    const h = w * 1.42;
    const sx = Math.abs(Math.cos(Math.PI * clamp(flip)));
    const showFace = flip >= 0.5;
    const bg = tone === 'gold' ? `linear-gradient(160deg, #ffe7ab, ${GOLD} 55%, #c8913a)` : tone === 'red' ? 'linear-gradient(160deg, #ff8d7e, #d8322a)'
      : tone === 'dim' ? 'linear-gradient(160deg, #8d8578, #5f594f)' : `linear-gradient(160deg, #fffaf0, ${CREAM})`;
    const glow = tone === 'gold' && showFace ? `0 0 ${w * 0.25}px ${GOLD_GLOW}, 0 ${w * 0.1}px ${w * 0.16}px rgba(0,0,0,0.5)` : `0 ${w * 0.1}px ${w * 0.16}px rgba(0,0,0,0.6)`;
    return (
      <>
        <div style={{ position: 'absolute', left: x - w * 0.55, top: y + h / 2 - w * 0.06, width: w * 1.1, height: w * 0.16, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: `blur(${w * 0.05}px)`, opacity: o * (1 - lift / (w * 1.2)) }} />
        <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2 - lift, width: w, height: h, opacity: o, transform: `rotate(${rot}deg) scale(${sc * Math.max(0.02, sx)}, ${sc})`, borderRadius: w * 0.07,
          background: showFace ? bg : `repeating-linear-gradient(45deg, ${BACK} 0 ${w * 0.05}px, #232e52 ${w * 0.05}px ${w * 0.1}px)`, border: showFace ? `${Math.max(1, w * 0.01)}px solid rgba(0,0,0,0.25)` : `${w * 0.018}px solid ${GOLD}`,
          boxShadow: glow, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {showFace ? face : <div style={{ width: w * 0.42, height: w * 0.42, transform: 'rotate(45deg)', border: `${w * 0.012}px solid ${GOLD}`, opacity: 0.8 }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%)' }} />
        </div>
      </>
    );
  };
const FaceText: React.FC<{ s: string; size: number; color?: string; font?: string }> = ({ s, size, color = '#1a1410', font = ZH }) => (
  <span style={{ fontFamily: font, fontWeight: 900, fontSize: size, color, letterSpacing: '0.02em', textAlign: 'center', lineHeight: 1.1, whiteSpace: 'pre' }}>{s}</span>
);

const WorldCards: React.FC<{ T: number }> = ({ T }) => {
  const out: React.ReactNode[] = [];
  // 1. the opening bet: 空 when the drop is taken away, 嘭 when it is given back
  if (T < EV.title + 3.2) {
    let flip = 0, tone: 'red' | 'gold' = 'red', face = '空';
    if (T >= EV.cut1 && T < EV.replay) flip = easeOut(prog(T, EV.cut1, EV.cut1 + 0.2)) * (1 - easeInOut(prog(T, EV.replay - 0.3, EV.replay)));
    if (T >= EV.title) { flip = 0.5 + 0.5 * easeOut(prog(T, EV.title, EV.title + 0.1)); tone = 'gold'; face = '嘭'; }
    const tr = T < EV.cut1 ? Math.sin(T * 50) * 2 * prog(T, 4, EV.cut1) : T > EV.replay && T < EV.title ? Math.sin(T * 50) * 2 * prog(T, 12, EV.title) : 0;
    out.push(<Card key="bet" x={960 + tr} y={712} w={170} flip={flip} tone={tone} lift={22 * hit(T, EV.title, 0.3)} face={<FaceText s={face} size={96} color={tone === 'gold' ? '#2a1a06' : '#fff4ef'} />} o={1 - prog(T, EV.title + 0.14, EV.title + 0.36)} />);
  }
  // 2. one chord per bar, the bet won each time
  const CH = ['C', 'G', 'Am', 'F', 'C', 'G'];
  if (T > EV.title + 2.6 && T < 33.4) {
    const o = vis(T, EV.title + 2.6, 33.4, 0.5, 0.6);
    CH.forEach((c, i) => {
      const t = down(i + 2), x = 560 + i * 160;
      out.push(<Card key={`ch${i}`} x={x} y={712} w={128} o={o} flip={T < t ? 0 : 0.5 + 0.5 * easeOut(prog(T, t, t + 0.12))} lift={12 * hit(T, t, 0.3)} face={<FaceText s={c} size={58} font={EN} />} />);
      const ok = vis(T, t + 0.05, t + 1.7, 0.12, 0.4);
      if (ok > 0) out.push(<div key={`ok${i}`} style={{ position: 'absolute', left: x - 80, width: 160, top: 560 - 26 * prog(T, t, t + 1.7), textAlign: 'center', opacity: ok * o, fontFamily: SANS, fontWeight: 900, fontSize: 24, color: GOLD, textShadow: `0 0 12px ${GOLD_GLOW}` }}>押中 ✓</div>);
    });
    out.push(<div key="chn" style={{ position: 'absolute', left: 560, width: 800, top: 860, textAlign: 'center', opacity: 0.6 * o, fontFamily: SANS, fontSize: 15, color: DIM }}>和弦为示意</div>);
  }
  // 3. build: four bets on the table, trembling more and more; the big drop flips them
  if (T > EV.riser + 0.2 && T < 92.3) {
    const o = vis(T, EV.riser + 0.2, 92.3, 0.5, 0.4);
    const tre = easeIn(prog(T, EV.build, EV.hush)) * (T > EV.breath2 ? 1.6 : 1) * (T >= EV.pickup ? 0 : 1);
    ['押', '中', '了', '！'].forEach((f, i) => {
      const t = EV.pickup + i * 0.03;
      const won = T >= t;
      out.push(<Card key={`b${i}`} x={780 + i * 150 + Math.sin(T * (40 + 7 * i)) * 4 * tre} y={712} w={132} o={o} rot={Math.sin(T * (33 + 5 * i)) * 1.6 * tre} tone="gold"
        flip={won ? 0.5 + 0.5 * easeOut(prog(T, t, t + 0.1)) : 0} lift={28 * hit(T, t, 0.35) + 14 * hit(T, EV.drop, 0.3)} sc={1 + 0.12 * hit(T, EV.pickup, 0.22) + 0.04 * hit(T, EV.drop, 0.2)}
        face={<FaceText s={f} size={78} color="#2a1a06" />} />);
    });
  }
  // 4. every song you've heard, raining onto the table
  if (T > S.all - 0.1 && T < S.tk1 + 0.6) {
    const o = vis(T, S.all - 0.1, S.tk1 + 0.6, 0.2, 0.6);
    for (let i = 0; i < 120; i++) {
      const t0 = S.all + rnd(i) * 2.4, k = easeIn(prog(T, t0, t0 + 0.6));
      if (T < t0) continue;
      const x = 960 + (rnd(i, 1) - 0.5) * 820 * (0.35 + 0.65 * rnd(i, 3));
      const yEnd = 800 - 150 * (1 - Math.abs(x - 960) / 460) * rnd(i, 4);
      out.push(<Card key={`p${i}`} x={x} y={lerp(80, yEnd, k)} w={58} flip={0} rot={(rnd(i, 2) - 0.5) * 80} o={o} />);
    }
  }
  // 5. three things, one per line
  if (T > S.tk1 - 0.6 && T < EV.outro + 4) {
    const o = vis(T, S.tk1 - 0.6, EV.outro + 4, 0.4, 0.8);
    const items: [number, string, string, 'gold' | 'cream'][] = [[S.tk1, '副歌重复', '让你押中', 'gold'], [S.tk2, 'drop 前\n停一下', '让你多押一会儿', 'gold'], [S.tk3, '儿歌 / 噪音', '太好猜 / 没法猜', 'cream']];
    items.forEach(([t, h, s, tone], i) => {
      const fl = T < t ? 0 : 0.5 + 0.5 * easeOut(prog(T, t, t + 0.14));
      out.push(<Card key={`t${i}`} x={600 + i * 360} y={700} w={230} o={o} flip={fl} tone={tone} lift={16 * hit(T, t, 0.3)} face={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <FaceText s={h} size={h.length > 5 ? 34 : 40} color="#2a1a06" /><span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 21, color: '#4a3612' }}>{s}</span>
        </div>} />);
    });
  }
  return <>{out}</>;
};

/* ---------------------------------------------------------------- the stage (camera-moved) */
const Stage: React.FC<{ T: number }> = ({ T }) => {
  const L = lamp(T);
  const cam = camAt(T);
  const [sx, sy] = shakeAt(T);
  const tr = `translate(${960 + sx}px, ${540 + sy}px) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`;
  const dark = 0.62 * Math.max(vis(T, 32.6, EV.break + 0.2, 0.5, 0.5), vis(T, 92.1, 100.2, 0.4, 0.4)) + 0.5 * prog(T, S.end, S.end + 0.6);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#040303' }}>
      <AbsoluteFill style={{ transform: tr, transformOrigin: '0 0' }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <Wall T={T} L={L} />
          <Table T={T} L={L} />
          <Turntable T={T} />
          <Dial T={T} />
          <Lamp T={T} L={L} />
        </svg>
        <WorldCards T={T} />
        {/* global darkness when the lamp drops, the cards included */}
        <div style={{ position: 'absolute', left: -1000, top: -1000, width: 3920, height: 3080, background: '#000', opacity: L < 0.06 ? 1 : clamp(1 - L, 0, 0.97) }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 65% at 50% 55%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)' }} />
      {dark > 0 && <AbsoluteFill style={{ background: `rgba(3,2,2,${dark})` }} />}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- overlays (screen space) */
const Big: React.FC<{ s: string; y: number; size: number; color?: string; o?: number; font?: string; glow?: string; weight?: number; dy?: number }> =
  ({ s, y, size, color = INK, o = 1, font = ZH, glow, weight = 900, dy = 0 }) => o <= 0.001 ? null : (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.6 + dy, textAlign: 'center', opacity: o, fontFamily: font, fontWeight: weight, fontSize: size, color,
      letterSpacing: '0.04em', textShadow: glow ? `0 0 26px ${glow}` : '0 4px 20px rgba(0,0,0,0.8)', whiteSpace: 'pre' }}>{s}</div>
  );
/** lands fast from below, no slow scaling */
const land = (T: number, a: number) => (1 - easeOut(prog(T, a, a + 0.18))) * 26;

const Counts: React.FC<{ T: number }> = ({ T }) => {
  if (T > EV.title + 0.1) return null;
  const out: React.ReactNode[] = [];
  [EV.cut1, EV.title].forEach((at, j) => ['3', '2', '1'].forEach((n, i) => {
    const t0 = at - (3 - i) * BEAT;
    const o = vis(T, t0, t0 + BEAT, 0.05, 0.12);
    if (o > 0) out.push(<Big key={`${j}${i}`} s={n} y={300} size={190} color={GOLD} o={o} font={EN} weight={700} glow={GOLD_GLOW} dy={land(T, t0)} />);
  }));
  out.push(<Big key="miss" s="押空了" y={300} size={120} color={RED} o={vis(T, EV.cut1 + 0.25, EV.replay - 0.1, 0.1, 0.3)} dy={land(T, EV.cut1 + 0.25)} glow="rgba(255,60,40,0.5)" />);
  return <>{out}</>;
};

const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.title, z = a + 3.3;
  if (T < a - 0.05 || T > z + 0.4) return null;
  const out = easeInOut(prog(T, z - 0.2, z + 0.3));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 48%, rgba(4,3,2,0.75) 0%, rgba(4,3,2,0.45) 100%)' }} />
      {[...'大脑是个赌徒'].map((c, i) => {
        const k = easeOut(prog(T, a + 0.1 + i * 0.045, a + 0.28 + i * 0.045));
        return <div key={i} style={{ position: 'absolute', left: 960 + (i - 2.5) * 200 - 100, width: 200, top: 340 + (1 - k) * 40, textAlign: 'center', opacity: k,
          fontFamily: ZH, fontWeight: 900, fontSize: 180, color: GOLD, textShadow: `0 0 30px ${GOLD_GLOW}` }}>{c}</div>;
      })}
      <div style={{ position: 'absolute', left: 960 - 470 * easeOut(prog(T, a + 0.3, a + 0.7)), width: 940 * easeOut(prog(T, a + 0.3, a + 0.7)), top: 600, height: 3, background: GOLD, boxShadow: `0 0 12px ${GOLD_GLOW}` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 630, textAlign: 'center', opacity: easeOut(prog(T, a + 0.5, a + 0.9)), fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.5em', color: DIM }}>{JUNO.series}</div>
    </AbsoluteFill>
  );
};

const DataO: React.FC<{ T: number }> = ({ T }) => {
  if (T < S.data1 - 0.1 || T > EV.break + 0.4) return null;
  const o = vis(T, S.data1 - 0.1, EV.break + 0.4, 0.3, 0.5);
  const nums = 1 - prog(T, S.two - 0.3, S.two);
  const g = easeOut(prog(T, S.two, S.two + 0.4));
  const count = (a: number, to: number) => Math.round(to * easeOut(prog(T, a, a + 0.5)));
  const h1 = hit(T, S.data1 + 0.5, 0.16), h2 = hit(T, S.data2 + 0.5, 0.16);
  const cell = (cx: number, cy: number, title: string, sub: string, at: number, gold: boolean, flipAt: number) => {
    const fl = T < flipAt ? 0 : 0.5 + 0.5 * easeOut(prog(T, flipAt, flipAt + 0.14));
    const on = easeOut(prog(T, at, at + 0.3));
    return (
      <div style={{ position: 'absolute', left: cx - 210, top: cy - 120, width: 420, height: 240, opacity: g, transform: `scale(${Math.max(0.02, Math.abs(Math.cos(Math.PI * fl)))}, 1)`, borderRadius: 16,
        background: fl < 0.5 ? `repeating-linear-gradient(45deg, ${BACK} 0 12px, #232e52 12px 24px)` : gold ? `linear-gradient(160deg, #ffe7ab, ${GOLD} 55%, #c8913a)` : 'rgba(243,237,226,0.07)',
        border: fl < 0.5 ? `3px solid ${GOLD}` : gold ? 'none' : '2px solid rgba(243,237,226,0.18)', boxShadow: gold && fl >= 0.5 ? `0 0 ${40 + 30 * hit(T, flipAt, 0.4)}px ${GOLD_GLOW}` : '0 14px 30px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {fl >= 0.5 && <>
          <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, color: gold ? '#2a1a06' : DIM }}>{title}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: gold ? '#4a3612' : 'rgba(243,237,226,0.4)', opacity: gold ? 1 : on }}>{sub}</div>
        </>}
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: nums }}>
        <text x={960} y={250} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.4em', fill: DIM }}>2019 · CURRENT BIOLOGY · CHEUNG 等</text>
        {[[S.data1, 745, '首经典流行歌', 470, h1], [S.data2, 80000, '个和弦', 740, h2]].map(([a, to, unit, y, h], i) => T < (a as number) ? null : (
          <g key={i} opacity={easeOut(prog(T, a as number, (a as number) + 0.12))}>
            {(h as number) > 0.03 && <text x={940 - 10 * (h as number)} y={y as number} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 210, fill: 'rgba(255,60,60,0.6)' }}>{count(a as number, to as number).toLocaleString('en-US')}</text>}
            <text x={940} y={y as number} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 210, fill: GOLD, filter: `drop-shadow(0 0 22px ${GOLD_GLOW})` }}>{count(a as number, to as number).toLocaleString('en-US')}</text>
            <text x={980} y={(y as number) - 20} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, fill: INK }}>{unit as string}</text>
          </g>
        ))}
      </svg>
      <div style={{ opacity: g }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: '0.4em', color: DIM }}>两个问题：你有多大把握？结果意不意外？</div>
        <div style={{ position: 'absolute', left: 300, top: 360, width: 180, textAlign: 'right', fontFamily: ZH, fontWeight: 900, fontSize: 36, color: INK }}>很有把握</div>
        <div style={{ position: 'absolute', left: 300, top: 620, width: 180, textAlign: 'right', fontFamily: ZH, fontWeight: 900, fontSize: 36, color: INK }}>毫无把握</div>
        <div style={{ position: 'absolute', left: 530, top: 222, width: 420, textAlign: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 34, color: INK }}>被骗了</div>
        <div style={{ position: 'absolute', left: 980, top: 222, width: 420, textAlign: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 34, color: INK }}>押中了</div>
      </div>
      {cell(740, 395, '上头', '确定，却被骗', S.sure, true, S.sure)}
      {cell(1190, 395, '无聊', '全在意料之中', S.two + 0.6, false, S.two + 0.5)}
      {cell(740, 655, '乱', '像噪音', S.two + 0.8, false, S.two + 0.7)}
      {cell(1190, 655, '上头', '没底，却押中', S.unsure, true, S.unsure)}
    </AbsoluteFill>
  );
};

const BuildO: React.FC<{ T: number }> = ({ T }) => {
  if (T < EV.riser || T > EV.hush + 0.05) return null;
  const left = Math.max(0, EV.breath2 - T), over = T >= EV.breath2;
  const o = vis(T, EV.riser + 0.5, EV.hush + 0.03, 0.4, 0.04);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 176, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.5em', color: over ? RED : DIM }}>距离 DROP</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 206, textAlign: 'center', fontFamily: EN, fontWeight: 700, fontSize: 110, color: over ? RED : INK, fontVariantNumeric: 'tabular-nums', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>{left.toFixed(1)}</div>
      <Big s="+1 小节" y={352} size={100} color={RED} o={vis(T, EV.breath2 + 0.03, EV.hush + 0.03, 0.06, 0.04)} dy={land(T, EV.breath2 + 0.03)} glow="rgba(255,60,40,0.5)" />
    </AbsoluteFill>
  );
};

const WinO: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.pickup;
  if (T < a || T > a + 2) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, rgba(241,197,109,${0.45 * hit(T, a, 0.6) + 0.18 * hit(T, EV.drop, 0.4)}) 0%, rgba(0,0,0,0) 60%)`, mixBlendMode: 'screen' }} />
      {Array.from({ length: 60 }, (_, i) => {
        const ang = rnd(i) * Math.PI * 2, sp = 300 + 900 * rnd(i, 1), t = T - a;
        if (t > 1.8) return null;
        const r = sp * easeOut(clamp(t / 1.8));
        return <div key={i} style={{ position: 'absolute', left: 960 + Math.cos(ang) * r, top: 600 + Math.sin(ang) * r * 0.65 + 120 * t * t, width: 6 + 6 * rnd(i, 2), height: 6 + 6 * rnd(i, 2), borderRadius: '50%', background: GOLD, opacity: 1 - t / 1.8, boxShadow: `0 0 12px ${GOLD_GLOW}` }} />;
      })}
    </AbsoluteFill>
  );
};

const BidsO: React.FC<{ T: number }> = ({ T }) => {
  if (T < S.bid - 0.1 || T > 100.4) return null;
  const o = vis(T, S.bid - 0.1, 100.4, 0.4, 0.5);
  const vals = [0.35, 0.8, 0.55, 0.95, 0.25, 0.65];
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <text x={960} y={200} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.4em', fill: DIM }}>2013 · SCIENCE · SALIMPOOR 等（示意）</text>
      {vals.map((v, i) => {
        const x = 960 + (i - 2.5) * 220, base = 800;
        const k = easeOut(prog(T, S.bid + 0.5 + i * 0.22, S.bid + 1.3 + i * 0.22));
        const k2 = easeOut(prog(T, S.bid2 + i * 0.1, S.bid2 + 0.7 + i * 0.1));
        return (
          <g key={i}>
            <rect x={x - 62} y={base - 440} width={56} height={440} rx={28} fill="rgba(255,255,255,0.04)" stroke="rgba(243,237,226,0.15)" />
            <rect x={x + 6} y={base - 440} width={56} height={440} rx={28} fill="rgba(255,255,255,0.04)" stroke="rgba(243,237,226,0.15)" />
            <rect x={x - 56} y={base - 6 - 428 * v * k} width={44} height={428 * v * k} rx={22} fill={GOLD} style={{ filter: `drop-shadow(0 0 10px ${GOLD_GLOW})` }} />
            <rect x={x + 12} y={base - 6 - 428 * v * k2} width={44} height={428 * v * k2} rx={22} fill={CREAM} />
            <text x={x} y={base + 46} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, fill: INK }}>{`新歌 ${i + 1}`}</text>
          </g>
        );
      })}
      <g style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24 }}>
        <rect x={650} y={880} width={22} height={22} rx={11} fill={GOLD} /><text x={684} y={899} style={{ fill: INK }}>奖赏区活跃度</text>
        <rect x={1010} y={880} width={22} height={22} rx={11} fill={CREAM} /><text x={1044} y={899} style={{ fill: INK }}>愿意出的价</text>
      </g>
    </svg>
  );
};

const PileO: React.FC<{ T: number }> = ({ T }) => (
  <Big s="你听过的所有歌" y={250} size={64} color={GOLD} o={vis(T, S.all + 0.6, S.tk1 - 0.3, 0.3, 0.3)} glow={GOLD_GLOW} dy={land(T, S.all + 0.6)} />
);

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const a = S.end;
  if (T < a) return null;
  const k = (d: number) => easeOut(prog(T, a + d, a + d + 0.4));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(4,3,2,${0.55 * k(0)})` }} />
      <Big s="大脑是个赌徒" y={290} size={100} color={GOLD} o={k(0)} glow={GOLD_GLOW} />
      <Big s={'你最近被哪首歌"骗"到了？'} y={450} size={60} o={k(0.4)} dy={land(T, a + 0.4)} />
      <Big s="评论区说说那一秒" y={530} size={28} color={DIM} o={k(0.8)} font={SANS} weight={400} />
      <div style={{ position: 'absolute', left: 960 - 330, top: 590, width: 660, height: 56, borderRadius: 28, border: `2px solid ${GOLD}`, opacity: k(1.0), display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: INK }}>{JUNO.follow}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 712, textAlign: 'center', opacity: 0.6 * k(1.2), fontFamily: SANS, fontSize: 17, color: INK, lineHeight: 1.8 }}>
        资料：Cheung 等 2019 Current Biology · Gold 等 2019 J Neurosci · Salimpoor 等 2011 Nature Neuroscience、2013 Science · Huron《Sweet Anticipation》2006<br />
        "赌""押注"为比喻 · 期待值表盘和脑图为示意 · 背景音乐为演示重新剪辑
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

/** warm light leak on the big camera moves (never white) */
const Leak: React.FC<{ T: number }> = ({ T }) => {
  const cuts = [EV.title + 3.2, 32.6, EV.break + 0.2, EV.riser + 0.3, 92.2, 100.3];
  const k = Math.max(0, ...cuts.map((c) => Math.exp(-Math.pow((T - c) / 0.22, 2))));
  if (k < 0.02) return null;
  return <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.5 * k, background: 'radial-gradient(ellipse 60% 80% at 85% 40%, rgba(255,170,80,0.8) 0%, rgba(255,120,40,0.3) 35%, rgba(0,0,0,0) 70%)' }} />;
};

export const Final: React.FC<{ at?: number }> = ({ at }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = at ?? frame / fps;
  const n = camMoving(T) ? SAMPLES : 1;
  const mark = easeOut(prog(T, EV.title + 3.4, EV.title + 4.2)) * (1 - prog(T, S.end - 0.3, S.end));
  return (
    <LookCtx.Provider value={LOOKS.night}>
      <AbsoluteFill style={{ backgroundColor: '#040303' }}>
        <style>{`
          @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono.ttf')}) format("truetype"); font-weight: 400; }
          @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
          @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }
        `}</style>
        {Array.from({ length: n }, (_, k) => (
          <AbsoluteFill key={k} style={{ opacity: 1 / (k + 1) }}>
            <Stage T={T - ((n - 1 - k) / n) * (1 / 30)} />
          </AbsoluteFill>
        ))}
        <Leak T={T} />
        <Counts T={T} />
        <DataO T={T} />
        <BuildO T={T} />
        <WinO T={T} />
        <BidsO T={T} />
        <PileO T={T} />
        <TitleCard T={T} />
        <EndCard T={T} />
        <AbsoluteFill style={{ opacity: 0.07, pointerEvents: 'none' }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
        <Subtitles T={T} />
        {mark > 0.001 && (
          <div style={{ position: 'absolute', top: 50, right: 60, opacity: 0.6 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
            <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
          </div>
        )}
      </AbsoluteFill>
    </LookCtx.Provider>
  );
};
