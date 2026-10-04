import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ZH, EN, beats, prog, easeOut, easeIn, easeInOut, lerp, clamp } from '../lib';
import { Vignette, Grain } from '../ui';
import { Sub } from './Titanic2';
import { Head, Arm, SK, INK, type Mood } from './Why';

/* 《应该没事吧》 part 6, b212-b228: your dorm. The fire alarm goes off; four roommates look at each other; nobody moves.
   Then one of them gets up. Freeze. */
const b = (i: number) => beats[i];
export const DM_IN = b(212), DM_OUT = b(228);
const W = 1920, H = 1080, FLOOR = 900;
const ALARM = b(212) + 0.2, LOOK = b(214), GLANCE = b(216), RISE = b(220), FREEZE = b(222);

/* one 上床下桌 unit: bed on top, desk underneath */
const Bunk: React.FC<{ x: number; flip?: boolean }> = ({ x, flip }) => (
  <g transform={`translate(${x}, 0) scale(${flip ? -1 : 1}, 1)`}>
    <rect x={0} y={250} width={14} height={650} fill="#8a6a4a" /><rect x={420} y={250} width={14} height={650} fill="#8a6a4a" />
    <rect x={0} y={440} width={434} height={22} fill="#9a7a58" />
    <rect x={10} y={400} width={414} height={42} rx={8} fill="#dfe6f0" />
    <rect x={20} y={378} width={100} height={30} rx={12} fill="#f3efe6" />
    <path d="M 0 330 L 434 330" stroke="#8a6a4a" strokeWidth={8} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={404} y={470 + i * 70} width={30} height={8} fill="#8a6a4a" />)}
    <rect x={30} y={700} width={370} height={18} fill="#a8865e" />
    <rect x={40} y={718} width={12} height={182} fill="#6a5440" /><rect x={378} y={718} width={12} height={182} fill="#6a5440" />
    <rect x={40} y={480} width={120} height={140} fill="#3a4a66" opacity={0.5} />
    <rect x={60} y={500} width={30} height={100} fill="#d9473a" opacity={0.6} /><rect x={96} y={510} width={24} height={90} fill="#2f7fb8" opacity={0.6} />
  </g>
);

/* the four roommates */
const Gamer: React.FC<{ T: number }> = ({ T }) => {
  const look = easeInOut(prog(T, LOOK, LOOK + 0.3));
  const glance = T > GLANCE && T < GLANCE + 1.6 ? Math.sin((T - GLANCE) * 4) : 0;
  const rise = easeInOut(prog(T, RISE, RISE + 1.4));
  const phonesOff = easeInOut(prog(T, RISE - 0.6, RISE));
  const mood: Mood = rise > 0.3 ? 'worry' : look > 0.5 ? 'worry' : 'calm';
  return (
    <g transform={`translate(560, ${FLOOR - 60 * rise})`}>
      {/* chair */}
      <rect x={-60} y={-250 + 60 * rise} width={120} height={150} rx={14} fill="#2a2f3a" />
      <rect x={-64} y={-112 + 60 * rise} width={128} height={22} rx={8} fill="#2a2f3a" />
      <rect x={-6} y={-90 + 60 * rise} width={12} height={90} fill="#1d1c22" />
      {/* legs */}
      <rect x={-34} y={-104} width={26} height={104 - 0} rx={10} fill="#33405e" transform={`translate(0, ${-40 * rise})`} />
      <rect x={8} y={-104} width={26} height={104} rx={10} fill="#33405e" transform={`translate(0, ${-40 * rise})`} />
      <path d="M -58 -266 Q 0 -284 58 -266 L 64 -100 L -64 -100 Z" fill="#c8322c" />
      <Arm d={`M -52 -250 Q -70 -190 ${lerp(-20, -60, rise)} ${lerp(-150, -130, rise)}`} c="#c8322c" hand={[lerp(-20, -60, rise), lerp(-146, -126, rise)]} />
      <Arm d={`M 52 -250 Q 70 -190 ${lerp(30, 60, rise)} ${lerp(-150, -130, rise)}`} c="#c8322c" hand={[lerp(30, 60, rise), lerp(-146, -126, rise)]} />
      <g transform="translate(0, -312)">
        <Head hair="slick" hairColor="#1f1a1d" mood={mood} lx={glance * 14} ly={look > 0.5 ? -8 : 4} />
        {/* headphones: slide down around the neck */}
        <g transform={`translate(${phonesOff * 60}, ${-phonesOff * 50}) rotate(${phonesOff * 25})`} opacity={1 - phonesOff}>
          <path d="M -48 -6 Q -50 -64 0 -66 Q 50 -64 48 -6" stroke="#15171d" strokeWidth={9} fill="none" />
          <rect x={-60} y={-18} width={20} height={34} rx={8} fill="#15171d" /><rect x={40} y={-18} width={20} height={34} rx={8} fill="#15171d" />
        </g>
      </g>
    </g>
  );
};
const Seated: React.FC<{ T: number; x: number; y: number; top: string; hair: string; ph: number; prop: 'phone' | 'noodles' | 'book'; flip?: boolean; s?: number }> = ({ T, x, y, top, hair, ph, prop, flip, s = 1 }) => {
  const look = easeInOut(prog(T, LOOK + 0.15 * ph, LOOK + 0.3 + 0.15 * ph));
  const glance = T > GLANCE && T < GLANCE + 1.8 ? Math.sin((T - GLANCE) * 3.6 + ph) : 0;
  const q = T > GLANCE + 0.2 && T < RISE ? 1 : 0;
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -s : s}, ${s})`}>
      <path d="M -54 -150 Q 0 -168 54 -150 L 62 0 L -62 0 Z" fill={top} />
      <g transform="translate(0, -196)"><g transform={`scale(${flip ? -1 : 1}, 1)`}><Head hair="slick" hairColor={hair} mood={look > 0.5 ? 'worry' : 'calm'} lx={glance * 14 * (flip ? -1 : 1)} ly={look > 0.5 ? -8 : 6} /></g></g>
      {prop === 'phone' && <>
        <Arm d="M 46 -136 Q 70 -90 40 -70" c={top} hand={[36, -70]} />
        <rect x={20} y={-104} width={30} height={50} rx={5} fill="#15171d" /><rect x={24} y={-100} width={22} height={40} fill="#8fb6f0" />
      </>}
      {prop === 'noodles' && <>
        <path d="M -30 -30 L 30 -30 L 22 10 L -22 10 Z" fill="#f2efe6" stroke="#d9473a" strokeWidth={4} />
        <Arm d="M 46 -136 Q 70 -80 20 -50" c={top} hand={[18, -50]} />
        <line x1={14} y1={-50} x2={-10} y2={-20} stroke="#c9a04e" strokeWidth={4} /><line x1={20} y1={-48} x2={-2} y2={-16} stroke="#c9a04e" strokeWidth={4} />
        <path d="M -10 -40 q 6 -16 0 -30 M 6 -40 q 6 -16 0 -30" stroke="#fff" strokeWidth={3} fill="none" opacity={0.5 * Math.abs(Math.sin(T * 2))} />
      </>}
      {prop === 'book' && <>
        <Arm d="M -46 -136 Q -70 -80 -30 -60" c={top} hand={[-28, -60]} />
        <Arm d="M 46 -136 Q 70 -80 30 -60" c={top} hand={[28, -60]} />
        <rect x={-40} y={-80} width={80} height={40} fill="#f3efe6" /><line x1={0} y1={-80} x2={0} y2={-40} stroke="#9a9488" strokeWidth={2} />
      </>}
      {q > 0 && <text x={flip ? -40 : 40} y={-290} transform={flip ? 'scale(-1, 1)' : undefined} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 54, fill: '#f3ede2' }} opacity={0.85}>？</text>}
    </g>
  );
};

type Line = [number, number, string, string];
const LINES: Line[] = [
  [DM_IN + 0.15, b(220) - 0.1, '最后，回到你自己：宿舍火警响了', 'Last one is you. The fire alarm goes off in your dorm.'],
  [b(220) + 0.06, DM_OUT - 0.2, '你的第一反应是什么？', 'What is your first reaction?'],
];
export const DormScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < DM_IN - 0.05 || T > DM_OUT + 0.05) return null;
  const inO = easeOut(prog(T, DM_IN - 0.05, DM_IN + 0.4));
  const ring = T > ALARM ? 0.5 + 0.5 * Math.sin((T - ALARM) * Math.PI * 4) : 0;
  const frozen = T > FREEZE;
  const Tf = frozen ? FREEZE : T; // the world freezes; only the light around him keeps breathing
  const spot = easeInOut(prog(T, FREEZE, FREEZE + 0.6));
  const push = lerp(1, 1.12, easeInOut(prog(T, RISE, DM_OUT)));
  const toGold = easeIn(prog(T, DM_OUT - 1.0, DM_OUT));
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0d16', opacity: inO }}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="dm-lamp"><stop offset="0" stopColor="#ffe1a8" stopOpacity="0.5" /><stop offset="1" stopColor="#ffe1a8" stopOpacity="0" /></radialGradient>
          <radialGradient id="dm-spot" cx="560" cy="640" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.82" /></radialGradient>
        </defs>
        <g transform={`translate(560 600) scale(${push}) translate(-560 -600)`}>
          {/* walls, window, floor */}
          <rect width={W} height={H} fill="#e6dccb" />
          <rect width={W} height={H} fill="#1a2030" opacity={0.35} />
          <rect x={760} y={170} width={400} height={330} fill="#0d1424" stroke="#c9c2b0" strokeWidth={10} />
          <line x1={960} y1={170} x2={960} y2={500} stroke="#c9c2b0" strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={790 + (i % 6) * 60} y={330 + Math.floor(i / 6) * 70} width={22} height={34} fill="#ffd27a" opacity={0.25 + 0.4 * ((i * 7) % 5) / 5} />)}
          <rect y={FLOOR} width={W} height={H - FLOOR} fill="#9a8c78" />
          <Bunk x={160} />
          <Bunk x={1760} flip />
          {/* the alarm on the wall */}
          <g transform={`translate(960, 110) rotate(${Tf > ALARM ? Math.sin(Tf * 60) * 6 : 0})`}>
            <circle r={44} fill="#c8322c" />
            <circle r={30} fill="#e9e2d2" />
            <circle r={10} fill="#8a1f1a" />
          </g>
          {T > ALARM && [0, 1, 2].map((i) => <path key={i} d={`M ${1020 + i * 22} ${80 - i * 8} q 16 30 0 60 M ${900 - i * 22} ${80 - i * 8} q -16 30 0 60`} stroke="#c8322c" strokeWidth={6} fill="none" opacity={ring * (1 - i * 0.25)} />)}
          {T > ALARM && <text x={960} y={58} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 40, fill: '#c8322c', letterSpacing: '0.2em' }} opacity={0.4 + 0.6 * ring}>火警</text>}
          {/* desks and people */}
          <rect x={360} y={640} width={150} height={100} rx={6} fill="#15171d" />
          <rect x={368} y={648} width={134} height={84} fill="#2f6fd0" opacity={0.75} />
          <rect x={420} y={740} width={30} height={20} fill="#15171d" />
          <Gamer T={Tf} />
          <Seated T={Tf} x={420} y={428} top="#3aa37a" hair="#3a2a20" ph={0.6} prop="phone" s={0.8} />
          <Seated T={Tf} x={1380} y={700} top="#f2b33d" hair="#2a211c" ph={1.2} prop="noodles" flip />
          <Seated T={Tf} x={1500} y={428} top="#2f7fb8" hair="#5a3a24" ph={1.8} prop="book" flip s={0.8} />
        </g>
        {/* the alarm's red pulse over the room */}
        <rect width={W} height={H} fill="#c8322c" opacity={0.16 * ring * (1 - spot)} />
        <rect width={W} height={H} fill="url(#dm-spot)" opacity={spot} />
        {spot > 0 && (
          <g opacity={spot}>
            <text x={860} y={300} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, fill: '#f6cf78', letterSpacing: '0.1em' }}>先站起来的那个人</text>
            <line x1={850} y1={290} x2={700} y2={380} stroke="#f6cf78" strokeWidth={3} />
          </g>
        )}
      </svg>
      {LINES.map(([at, out, zh, en], i) => <Sub key={i} T={T} at={at} out={out} zh={zh} en={en} />)}
      <Vignette strength={0.4} />
      <Grain />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, #ffcf6e 0%, #05070d 70%)', opacity: toGold }} />
    </AbsoluteFill>
  );
};
export { SK, INK, EN, clamp };
