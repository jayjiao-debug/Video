import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ZH, EN, beats, prog, easeOut, easeIn, easeInOut, lerp, clamp } from '../lib';
import { mulberry } from '../v1/data';
import { Vignette, Grain } from '../ui';
import { BOATS } from './boats';
import { Sub, Chapter } from './Titanic2';

/* 《应该没事吧》 part 2, b56-b80: why didn't people get in?
   2D flat illustration (lounge -> boat deck), then a 2D cutaway of the ship with 2,224 people as dots.
   Every frame is a pure function of the global time T. */
const b = (i: number) => beats[i];
export const WHY_IN = b(56), WHY_OUT = b(80);
const PAN_A = b(61) + 0.1, PAN_B = b(62) + 0.7, SECT = b(68), NB = b(72), LAST = b(76), DIVE = b(77);
const W = 1920, H = 1080;
const rnd = (() => { const r = mulberry(1514); return Array.from({ length: 12000 }, () => r()); })();
const pop = (T: number, a: number, d = 0.28) => {
  const k = clamp((T - a) / d);
  return k <= 0 ? 0 : easeOut(k) + 0.16 * Math.sin(k * Math.PI) * (1 - k);
};

/* ---------------- people ---------------- */
const SK = '#edc9a4', SKD = '#d9ad86', INK = '#1d1c22';
type Mood = 'calm' | 'laugh' | 'shout' | 'smug' | 'worry';
const Face: React.FC<{ mood: Mood; lx?: number; ly?: number }> = ({ mood, lx = 0, ly = 0 }) => {
  const eyeR = mood === 'shout' || mood === 'worry' ? 6.5 : 5;
  return (
    <g>
      {mood === 'laugh' ? (
        <>
          <path d={`M ${-22 + lx} ${-6 + ly} q 7 -7 14 0`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <path d={`M ${8 + lx} ${-6 + ly} q 7 -7 14 0`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx={-14 + lx} cy={-6 + ly} rx={eyeR * 0.8} ry={eyeR} fill={INK} />
          <ellipse cx={15 + lx} cy={-6 + ly} rx={eyeR * 0.8} ry={eyeR} fill={INK} />
        </>
      )}
      {mood === 'worry' && <>
        <path d={`M ${-24 + lx} ${-22 + ly} L ${-6 + lx} ${-26 + ly}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${6 + lx} ${-26 + ly} L ${24 + lx} ${-22 + ly}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </>}
      {mood === 'smug' && <path d={`M ${-22 + lx} ${-20 + ly} L ${-6 + lx} ${-18 + ly} M ${6 + lx} ${-20 + ly} L ${22 + lx} ${-23 + ly}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />}
      {mood === 'calm' && <path d={`M ${-8 + lx} ${18 + ly} Q ${1 + lx} ${24 + ly} ${10 + lx} ${18 + ly}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
      {mood === 'smug' && <path d={`M ${-6 + lx} ${19 + ly} Q ${6 + lx} ${22 + ly} ${14 + lx} ${14 + ly}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
      {mood === 'laugh' && <path d={`M ${-12 + lx} ${12 + ly} Q ${1 + lx} ${32 + ly} ${14 + lx} ${12 + ly} Z`} fill="#6b2a2a" />}
      {mood === 'shout' && <ellipse cx={2 + lx} cy={20 + ly} rx={9} ry={11} fill="#6b2a2a" />}
      {mood === 'worry' && <path d={`M ${-7 + lx} ${21 + ly} Q ${1 + lx} ${16 + ly} ${9 + lx} ${21 + ly}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
      <ellipse cx={-26 + lx} cy={8 + ly} rx={7} ry={4} fill="#e79c8a" opacity={0.45} />
      <ellipse cx={27 + lx} cy={8 + ly} rx={7} ry={4} fill="#e79c8a" opacity={0.45} />
    </g>
  );
};
type HairKind = 'slick' | 'updo' | 'cap' | 'hat' | 'bald';
const Head: React.FC<{ hair: HairKind; hairColor?: string; mood: Mood; tash?: boolean; lx?: number; tilt?: number }> = ({ hair, hairColor = '#2a211c', mood, tash, lx = 0, tilt = 0 }) => (
  <g transform={`rotate(${tilt})`}>
    <rect x={-14} y={30} width={28} height={22} fill={SKD} />
    <circle r={44} fill={SK} />
    <ellipse cx={-43} cy={2} rx={8} ry={11} fill={SKD} />
    {hair === 'slick' && <path d="M -46 -6 Q -50 -58 0 -58 Q 50 -58 46 -6 Q 38 -36 8 -38 L 2 -28 Q -26 -42 -46 -6 Z" fill={hairColor} />}
    {hair === 'bald' && <path d="M -46 -2 Q -48 -20 -40 -26 L -38 -4 Z M 46 -2 Q 48 -20 40 -26 L 38 -4 Z" fill={hairColor} />}
    {hair === 'updo' && <>
      <circle cx={4} cy={-56} r={22} fill={hairColor} />
      <path d="M -47 4 Q -54 -54 0 -54 Q 54 -54 47 4 Q 40 -28 12 -34 Q -8 -24 -30 -30 Q -44 -16 -47 4 Z" fill={hairColor} />
      <circle cx={-30} cy={-44} r={5} fill="#f3e6c8" />
    </>}
    {hair === 'cap' && <>
      <path d="M -40 -2 Q -44 -26 -38 -30 L 38 -30 Q 44 -26 40 -2 Q 34 -20 0 -20 Q -34 -20 -40 -2 Z" fill={hairColor} />
      <path d="M -50 -26 L 50 -26 L 46 -58 Q 0 -72 -46 -58 Z" fill="#141b2e" />
      <rect x={-50} y={-30} width={100} height={8} fill="#0b0f18" />
      <path d="M 10 -26 L 66 -24 Q 62 -16 10 -18 Z" fill="#0b0f18" />
      <circle cx={6} cy={-46} r={7} fill="#d9b25a" />
    </>}
    {hair === 'hat' && <>
      <path d="M -47 6 Q -52 -40 -20 -50 L 20 -50 Q 52 -40 47 6 Q 36 -20 0 -24 Q -36 -20 -47 6 Z" fill={hairColor} />
      <ellipse cx={0} cy={-40} rx={86} ry={16} fill="#2c2232" />
      <path d="M -40 -42 Q -36 -86 0 -88 Q 36 -86 40 -42 Z" fill="#3a2c42" />
      <path d="M 20 -80 Q 70 -120 96 -90 Q 64 -98 34 -70 Z" fill="#e9e1d2" />
    </>}
    <Face mood={mood} lx={lx} />
    {tash && <path d={`M ${-17 + lx} 13 Q ${-6 + lx} 6 ${1 + lx} 11 Q ${8 + lx} 6 ${19 + lx} 13 Q ${8 + lx} 18 ${1 + lx} 15 Q ${-6 + lx} 18 ${-17 + lx} 13 Z`} fill={hairColor} />}
  </g>
);
const Arm: React.FC<{ d: string; c: string; hand?: number[]; w?: number; glove?: string }> = ({ d, c, hand, w = 20, glove }) => (
  <>
    <path d={d} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />
    {hand && <circle cx={hand[0]} cy={hand[1]} r={12} fill={glove ?? SK} />}
  </>
);
const TUX = '#17181f', TUX2 = '#24252e';
/* standing gentleman in evening dress, facing right; feet at 0 */
const TuxBody: React.FC<{ coat?: string }> = ({ coat = TUX }) => (
  <g>
    <ellipse cx={0} cy={0} rx={62} ry={9} fill="#000" opacity={0.35} />
    <rect x={-26} y={-112} width={22} height={110} rx={6} fill="#101116" />
    <rect x={4} y={-112} width={22} height={110} rx={6} fill="#101116" />
    <ellipse cx={-12} cy={-3} rx={20} ry={8} fill="#08090c" /><ellipse cx={20} cy={-3} rx={20} ry={8} fill="#08090c" />
    <path d="M -52 -252 Q 0 -268 52 -252 L 56 -104 L 30 -96 L 0 -150 L -30 -96 L -56 -104 Z" fill={coat} />
    <path d="M -14 -256 L 14 -256 L 6 -150 L -6 -150 Z" fill="#f1ece2" />
    <path d="M -14 -250 L 0 -244 L 14 -250 L 14 -238 L 0 -244 L -14 -238 Z" fill={INK} />
    <circle cx={0} cy={-214} r={2.6} fill={INK} /><circle cx={0} cy={-192} r={2.6} fill={INK} />
  </g>
);

/* ---------------- the lounge (world x 0-1920) ---------------- */
const FLOOR = 880;
const Lounge: React.FC<{ T: number; tilt: number }> = ({ T, tilt }) => {
  const bowS = Math.sin(T * 6.4), bowS2 = Math.sin(T * 6.4 + 1.1), cel = Math.sin(T * 3.2);
  const sip = easeInOut(prog(T, b(57), b(57) + 0.5)) * (1 - easeInOut(prog(T, b(59), b(59) + 0.5)));
  const laugh = T > b(59) + 0.3;
  return (
    <g>
      {/* wall, panelling */}
      <rect x={-200} y={-100} width={2140} height={1200} fill="url(#lg-wall)" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x={-40 + i * 230} y={330} width={190} height={430} rx={6} fill="none" stroke="#7a5233" strokeWidth={4} opacity={0.55} />
          <rect x={-28 + i * 230} y={342} width={166} height={406} rx={4} fill="#3a2414" opacity={0.35} />
          <rect x={160 + i * 230} y={120} width={30} height={760} fill="#5b3a22" />
          <rect x={156 + i * 230} y={112} width={38} height={18} fill="#8a6038" />
        </g>
      ))}
      <rect x={-200} y={92} width={2140} height={28} fill="#6e4a2a" />
      <rect x={-200} y={760} width={2140} height={22} fill="#5b3a22" />
      {/* tall windows onto the black night */}
      {[700, 1240].map((x) => (
        <g key={x}>
          <path d={`M ${x} 700 L ${x} 300 Q ${x + 95} 200 ${x + 190} 300 L ${x + 190} 700 Z`} fill="#0b1222" stroke="#a07a48" strokeWidth={10} />
          <path d={`M ${x + 95} 230 L ${x + 95} 700 M ${x} 470 L ${x + 190} 470`} stroke="#a07a48" strokeWidth={6} />
          <path d={`M ${x + 20} 690 L ${x + 20} 330 L ${x + 60} 290`} stroke="#ffffff" strokeWidth={5} opacity={0.08} fill="none" />
        </g>
      ))}
      {/* carpet */}
      <rect x={-200} y={FLOOR - 4} width={2140} height={300} fill="#4a1a1f" />
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${-200 + i * 100} ${FLOOR + 30} l 50 26 l 50 -26`} stroke="#6b2a2e" strokeWidth={4} fill="none" />)}
      {/* the band, on a low dais */}
      <rect x={60} y={FLOOR - 30} width={600} height={34} fill="#3a2414" />
      <rect x={60} y={FLOOR - 34} width={600} height={8} fill="#7a5233" />
      {[{ x: 170, s: bowS }, { x: 330, s: bowS2 }].map(({ x, s }, i) => {
        const cp = [56, -250], a = (200 * Math.PI) / 180, u = [Math.cos(a), Math.sin(a)];
        const hand = [cp[0] + u[0] * (64 + 44 * s), cp[1] + u[1] * (64 + 44 * s)];
        return (
          <g key={i} transform={`translate(${x}, ${FLOOR - 30})`}>
            <TuxBody />
            <Arm d={`M -34 -236 Q -40 -170 ${hand[0] - 10} ${hand[1] + 20} L ${hand[0]} ${hand[1]}`} c={TUX} hand={hand} />
            <g transform="translate(40, -258) rotate(-24)">
              <path d="M -30 -12 Q -36 0 -30 12 Q -10 18 0 10 Q 14 18 32 12 Q 38 0 32 -12 Q 14 -18 0 -10 Q -10 -18 -30 -12 Z" fill="#8a4a20" />
              <rect x={30} y={-4} width={64} height={8} rx={3} fill="#2a1a10" />
            </g>
            <line x1={hand[0]} y1={hand[1]} x2={hand[0] - u[0] * 170} y2={hand[1] - u[1] * 170} stroke="#d8c8a0" strokeWidth={3.5} />
            <Arm d="M 34 -238 Q 70 -250 100 -282" c={TUX} hand={[104, -284]} />
            <g transform="translate(6, -300)"><Head hair="slick" hairColor={i ? '#5a3a24' : '#2a211c'} mood="calm" tilt={-14} lx={4} tash={!i} /></g>
          </g>
        );
      })}
      {/* cellist, facing us */}
      <g transform={`translate(520, ${FLOOR - 30})`}>
        <rect x={-40} y={-120} width={80} height={14} fill="#5b3a22" />
        <rect x={-36} y={-106} width={10} height={106} fill="#3a2414" /><rect x={26} y={-106} width={10} height={106} fill="#3a2414" />
        <rect x={-50} y={-110} width={20} height={110} rx={6} fill="#101116" /><rect x={30} y={-110} width={20} height={110} rx={6} fill="#101116" />
        <path d="M -54 -270 Q 0 -286 54 -270 L 52 -120 L -52 -120 Z" fill={TUX} />
        <path d="M -12 -272 L 12 -272 L 0 -180 Z" fill="#f1ece2" />
        <g transform="translate(0, -120)">
          <path d="M -50 -60 Q -62 -10 -40 30 Q -60 70 -40 106 Q 0 122 40 106 Q 60 70 40 30 Q 62 -10 50 -60 Q 0 -78 -50 -60 Z" fill="#7a3c16" transform="translate(0,-40) scale(0.9)" />
          <rect x={-6} y={-210} width={12} height={150} fill="#2a1a10" />
          <line x1={0} y1={56} x2={0} y2={120} stroke="#2a1a10" strokeWidth={4} />
        </g>
        <Arm d="M -46 -258 Q -70 -220 -16 -300" c={TUX} hand={[-12, -304]} />
        <Arm d={`M 46 -258 Q 80 -200 ${30 + 46 * cel} -158`} c={TUX} hand={[30 + 46 * cel, -158]} />
        <line x1={30 + 46 * cel - 110} y1={-150} x2={30 + 46 * cel + 40} y2={-164} stroke="#d8c8a0" strokeWidth={3.5} />
        <g transform="translate(0, -318)"><Head hair="bald" hairColor="#4a3a30" mood="calm" tash /></g>
      </g>
      {/* notes rising from the band */}
      {Array.from({ length: 9 }, (_, i) => {
        const ph = (T * 0.45 + i / 9) % 1;
        return <text key={i} x={140 + (i % 4) * 140 + Math.sin(ph * 6 + i) * 30} y={560 - ph * 380} style={{ fontFamily: EN, fontSize: 44 + (i % 3) * 8, fill: '#f6cf78' }} opacity={Math.sin(ph * Math.PI) * 0.75}>{i % 2 ? '♪' : '♫'}</text>;
      })}
      {/* chandelier: hangs true while the room has started to list */}
      <g transform={`translate(1000, 150) rotate(${-tilt})`}>
        <circle cx={0} cy={250} r={300} fill="url(#lg-glow)" />
        <line x1={0} y1={-200} x2={0} y2={160} stroke="#8a6a3a" strokeWidth={5} />
        <path d="M -150 200 Q 0 260 150 200 L 120 236 Q 0 280 -120 236 Z" fill="#c9a04e" />
        <ellipse cx={0} cy={176} rx={40} ry={22} fill="#d9b25a" />
        {[-140, -90, -40, 40, 90, 140].map((x) => (
          <g key={x}>
            <rect x={x - 4} y={176} width={8} height={30} fill="#f3e6c8" />
            <ellipse cx={x} cy={170} rx={6} ry={10} fill="#ffe7a8" />
            <circle cx={x} cy={172} r={22} fill="#ffd27a" opacity={0.35} />
          </g>
        ))}
        {[-100, -50, 0, 50, 100].map((x) => <path key={x} d={`M ${x} 246 l -6 18 l 6 10 l 6 -10 Z`} fill="#fff4d6" opacity={0.85} />)}
      </g>
      {/* tea table and the lady */}
      <g transform={`translate(1060, ${FLOOR})`}>
        {/* her armchair */}
        <g transform="translate(-210, 0)">
          <rect x={-70} y={-250} width={40} height={180} rx={16} fill="#2f4a3a" />
          <rect x={-74} y={-120} width={150} height={60} rx={18} fill="#3b5a46" />
          <rect x={-70} y={-62} width={10} height={62} fill="#2a1a10" /><rect x={60} y={-62} width={10} height={62} fill="#2a1a10" />
          {/* gown */}
          <path d="M -40 -250 Q 0 -262 34 -248 L 44 -118 L 96 -110 L 120 0 L 30 0 L 20 -80 L -50 -96 Z" fill="#7d6aa6" />
          <path d="M -40 -250 Q 0 -262 34 -248 L 30 -200 Q 0 -210 -36 -200 Z" fill="#6a5893" />
          <ellipse cx={86} cy={-2} rx={22} ry={7} fill="#2c2232" />
          <Arm d={`M 20 -238 Q 60 ${-190 - 30 * sip} ${70} ${-180 - 50 * sip}`} c="#f1ece2" hand={[72, -182 - 50 * sip]} w={16} glove="#f1ece2" />
          <g transform={`translate(${82}, ${-196 - 50 * sip}) rotate(${-10 - 30 * sip})`}>
            <path d="M -14 -10 L 14 -10 L 10 10 L -10 10 Z" fill="#f3efe6" /><path d="M 14 -4 q 10 4 0 10" stroke="#f3efe6" strokeWidth={3} fill="none" />
          </g>
          <g transform="translate(0, -296)"><Head hair="updo" hairColor="#6b3a22" mood={laugh ? 'laugh' : 'calm'} lx={6} tilt={laugh ? -8 : 0} /></g>
        </g>
        {/* table with cloth and tea */}
        <path d="M -90 -160 L 90 -160 L 120 0 L -120 0 Z" fill="#efe8da" />
        <ellipse cx={0} cy={-160} rx={92} ry={14} fill="#f7f2e8" />
        <g transform="translate(-20, -182)">
          <path d="M -30 0 Q -34 -34 0 -38 Q 34 -34 30 0 Z" fill="#e9e2d2" stroke="#b7a37a" strokeWidth={3} />
          <path d="M 30 -20 Q 50 -30 56 -44" stroke="#e9e2d2" strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={-42} r={6} fill="#b7a37a" />
        </g>
        <g transform="translate(46, -170)"><path d="M -12 -10 L 12 -10 L 9 6 L -9 6 Z" fill="#f3efe6" stroke="#b7a37a" strokeWidth={2} /></g>
        {/* tea surface: level with the sea, so it tilts against the cup */}
        <g transform={`translate(46, -178) rotate(${-tilt * 1.6})`}><rect x={-10} y={-1.5} width={20} height={3} fill="#8a5a2a" /></g>
        {[0, 1].map((i) => {
          const ph = (T * 0.6 + i * 0.5) % 1;
          return <path key={i} d={`M ${40 + i * 14} ${-188 - ph * 50} q 10 -12 0 -24 q -10 -12 0 -24`} stroke="#fff" strokeWidth={3} fill="none" opacity={Math.sin(ph * Math.PI) * 0.45} />;
        })}
        {/* the gentleman with his paper */}
        <g transform="translate(220, 0) scale(-1, 1)">
          <rect x={-70} y={-250} width={40} height={180} rx={16} fill="#2f4a3a" />
          <rect x={-74} y={-120} width={150} height={60} rx={18} fill="#3b5a46" />
          <rect x={-70} y={-62} width={10} height={62} fill="#2a1a10" /><rect x={60} y={-62} width={10} height={62} fill="#2a1a10" />
          <rect x={-40} y={-132} width={120} height={26} rx={10} fill="#101116" />
          <rect x={58} y={-130} width={22} height={128} rx={8} fill="#101116" />
          <rect x={20} y={-112} width={110} height={22} rx={10} fill="#101116" transform="rotate(-14 20 -112)" />
          <path d="M -44 -262 Q 0 -276 40 -262 L 44 -118 L -46 -118 Z" fill={TUX} />
          <g transform="translate(-2, -306)"><Head hair="slick" hairColor="#9a9590" mood="smug" tash lx={8} /></g>
          <g transform="translate(64, -236) rotate(-6)">
            <rect x={-20} y={-70} width={74} height={130} fill="#eae4d4" />
            <rect x={-14} y={-60} width={62} height={10} fill="#3a3530" />
            {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-14} y={-40 + i * 13} width={i % 3 === 2 ? 40 : 62} height={4} fill="#9a9488" />)}
          </g>
          <circle cx={46} cy={-210} r={11} fill={SK} /><circle cx={46} cy={-150} r={11} fill={SK} />
        </g>
      </g>
      {/* waiter */}
      <g transform={`translate(1560, ${FLOOR}) scale(-1, 1)`}>
        <ellipse cx={0} cy={0} rx={60} ry={9} fill="#000" opacity={0.35} />
        <rect x={-26} y={-112} width={22} height={110} rx={6} fill="#101116" /><rect x={4} y={-112} width={22} height={110} rx={6} fill="#101116" />
        <path d="M -50 -252 Q 0 -266 50 -252 L 52 -150 L -52 -150 Z" fill="#f1ece2" />
        <rect x={-52} y={-154} width={104} height={44} fill="#101116" />
        {[-226, -200, -176].map((y) => <circle key={y} cx={10} cy={y} r={3} fill="#c9a04e" />)}
        <Arm d="M -40 -240 Q -60 -190 -48 -146" c="#f1ece2" hand={[-48, -140]} />
        <Arm d="M 40 -240 Q 80 -230 90 -300" c="#f1ece2" hand={[90, -304]} />
        <ellipse cx={90} cy={-318} rx={70} ry={9} fill="#c9c2b0" />
        <path d="M 70 -340 L 76 -322 L 64 -322 Z M 104 -344 L 110 -322 L 98 -322 Z" fill="#e9b04e" opacity={0.85} />
        <g transform="translate(0, -298)"><Head hair="slick" hairColor="#3a2a20" mood="calm" lx={4} /></g>
      </g>
      {/* the doorway out to the boat deck: cold blue light */}
      <rect x={1740} y={300} width={180} height={580} fill="url(#lg-door)" />
      <rect x={1728} y={292} width={14} height={590} fill="#8a6038" /><rect x={1728} y={286} width={210} height={16} fill="#8a6038" />
    </g>
  );
};

/* ---------------- the boat deck (world x 1920-3840) ---------------- */
const Bubble: React.FC<{ x: number; y: number; text: string; o: number; tail: number }> = ({ x, y, text, o, tail }) => {
  if (o <= 0) return null;
  const w = text.length * 40 + 60;
  return (
    <g transform={`translate(${x}, ${y}) scale(${o})`} opacity={Math.min(1, o * 1.4)}>
      <rect x={-w / 2} y={-46} width={w} height={84} rx={30} fill="#f3ede2" />
      <path d={`M ${tail - 16} 36 L ${tail + 18} 36 L ${tail + 4} 70 Z`} fill="#f3ede2" />
      <text x={0} y={12} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 38, fill: INK, letterSpacing: '0.04em' }}>{text}</text>
    </g>
  );
};
const Deck: React.FC<{ T: number; tilt: number }> = ({ T, tilt }) => {
  const wave = Math.sin(T * 7) * 0.5 + 0.5;
  const turn = easeInOut(prog(T, b(66), b(66) + 0.35)); // the lady turns back
  const walk = easeInOut(prog(T, b(66) + 0.3, b(68) + 0.6));
  const manTurn = easeInOut(prog(T, b(66) + 0.6, b(66) + 0.9));
  const manWalk = easeInOut(prog(T, b(67), b(68) + 0.6));
  const puff = (x: number, y: number, ph: number) => {
    const p = (T * 0.7 + ph) % 1;
    return <ellipse cx={x + p * 40} cy={y - p * 30} rx={10 + p * 26} ry={6 + p * 14} fill="#dfe8f6" opacity={(1 - p) * 0.35} />;
  };
  return (
    <g>
      <rect x={1920} y={-100} width={2100} height={1200} fill="url(#dk-sky)" />
      {Array.from({ length: 120 }, (_, i) => <circle key={i} cx={1920 + rnd[i] * 2000} cy={rnd[i + 200] * 560} r={0.8 + rnd[i + 400] * 1.8} fill="#e8eeff" opacity={0.25 + 0.6 * rnd[i + 600]} />)}
      {/* the sea, level with the world: the ship has started to list */}
      <g transform={`rotate(${tilt}, 2880, 700)`}>
        <rect x={1700} y={700} width={2500} height={600} fill="#050a14" />
        <line x1={1700} y1={700} x2={4200} y2={700} stroke="#2a3a5a" strokeWidth={2} />
      </g>
      {/* superstructure wall and the door, warm light spilling out */}
      <rect x={1920} y={140} width={240} height={740} fill="#d9d2c0" />
      <rect x={1920} y={140} width={240} height={740} fill="#0a1020" opacity={0.55} />
      <rect x={1940} y={300} width={150} height={580} fill="#ffcf8a" opacity={0.85} />
      <path d={`M 2090 880 L 1940 880 L 2420 1000 L 2620 1000 Z`} fill="#ffcf8a" opacity={0.18} />
      {/* deck, rail */}
      <rect x={2160} y={FLOOR} width={1900} height={300} fill="#1c1a18" />
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={2160} y1={FLOOR + 10 + i * 14} x2={4060} y2={FLOOR + 10 + i * 14} stroke="#2a2622" strokeWidth={2} />)}
      <rect x={2160} y={760} width={1900} height={8} fill="#b9b3a4" />
      <rect x={2160} y={812} width={1900} height={5} fill="#8c8678" />
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={2180 + i * 96} y={760} width={6} height={120} fill="#8c8678" />)}
      {/* the lifeboat on its davits: three people in it */}
      {[3180, 3640].map((x) => <path key={x} d={`M ${x} ${FLOOR} L ${x} 440 Q ${x} 360 ${x + 80} 360 L ${x + 90} 380`} stroke="#d9d2c0" strokeWidth={16} fill="none" strokeLinecap="round" />)}
      <line x1={3270} y1={380} x2={3270} y2={560} stroke="#c9c0a8" strokeWidth={3} /><line x1={3730} y1={380} x2={3730} y2={560} stroke="#c9c0a8" strokeWidth={3} />
      {[3330, 3420, 3610].map((x, i) => (
        <g key={x} transform={`translate(${x}, 548) scale(0.62)`}>
          <path d="M -40 40 L -44 -60 Q 0 -74 44 -60 L 40 40 Z" fill={['#3a3550', '#4a3a2e', '#2c3a44'][i]} />
          <g transform="translate(0, -100)"><Head hair={i === 1 ? 'updo' : 'slick'} hairColor={['#2a211c', '#6b3a22', '#3a2a20'][i]} mood="worry" /></g>
        </g>
      ))}
      <path d="M 3200 560 L 3790 560 Q 3780 640 3700 650 L 3290 650 Q 3210 640 3200 560 Z" fill="#ece6d6" />
      <path d="M 3196 552 L 3794 552 L 3790 568 L 3200 568 Z" fill="#8a5a30" />
      {[3280, 3380, 3480, 3580, 3680].map((x) => <path key={x} d={`M ${x} 576 q 22 26 44 0`} stroke="#9a9280" strokeWidth={3} fill="none" />)}
      {/* the officer, lantern up, waving them over */}
      <g transform={`translate(2860, ${FLOOR}) scale(-1, 1)`}>
        <ellipse cx={0} cy={0} rx={64} ry={9} fill="#000" opacity={0.4} />
        <rect x={-26} y={-112} width={22} height={110} rx={6} fill="#0d1220" /><rect x={4} y={-112} width={22} height={110} rx={6} fill="#0d1220" />
        <path d="M -54 -256 Q 0 -270 54 -256 L 62 -70 L -62 -70 Z" fill="#1a2440" />
        {[-226, -196, -166, -136].map((y) => <g key={y}><circle cx={-14} cy={y} r={4} fill="#d9b25a" /><circle cx={14} cy={y} r={4} fill="#d9b25a" /></g>)}
        <Arm d={`M -44 -246 Q -90 -300 ${-80 - 20 * wave} -360`} c="#1a2440" hand={[-80 - 20 * wave, -366]} />
        <Arm d="M 44 -246 Q 90 -280 96 -330" c="#1a2440" hand={[96, -336]} />
        <g transform="translate(96, -320)">
          <circle r={90} fill="url(#dk-lamp)" />
          <rect x={-16} y={-10} width={32} height={44} rx={4} fill="#2a2a2a" />
          <rect x={-11} y={-4} width={22} height={32} fill="#ffd27a" />
          <path d="M -10 -10 Q 0 -26 10 -10" stroke="#2a2a2a" strokeWidth={4} fill="none" />
        </g>
        <g transform="translate(0, -304)"><Head hair="cap" hairColor="#3a2a20" mood="shout" lx={-4} tash /></g>
      </g>
      {puff(2810, 600, 0)}
      {/* the couple at the door */}
      <g transform={`translate(${lerp(2380, 2060, walk)}, ${FLOOR}) scale(${turn > 0.5 ? -1 : 1}, 1)`}>
        <ellipse cx={0} cy={0} rx={60} ry={9} fill="#000" opacity={0.35} />
        <path d="M -40 -250 Q 0 -262 40 -250 L 70 0 L -70 0 Z" fill="#4a3a5a" />
        <path d="M -48 -252 Q 0 -280 48 -252 L 44 -212 Q 0 -232 -44 -212 Z" fill="#e3dccb" />
        <Arm d="M -34 -236 Q -52 -180 -30 -150" c="#4a3a5a" hand={[-28, -146]} glove="#e3dccb" />
        <Arm d="M 34 -236 Q 52 -180 30 -150" c="#4a3a5a" hand={[28, -146]} glove="#e3dccb" />
        <g transform="translate(0, -292)"><Head hair="hat" hairColor="#2a211c" mood={turn > 0.1 ? 'worry' : 'calm'} lx={6} /></g>
      </g>
      {puff(2420, 590, 0.4)}
      <g transform={`translate(${lerp(2520, 2190, manWalk)}, ${FLOOR}) scale(${manTurn > 0.5 ? -1 : 1}, 1)`}>
        <TuxBody coat="#22232c" />
        <Arm d="M -40 -240 Q -64 -190 -50 -146" c="#22232c" hand={[-50, -140]} />
        <Arm d={`M 40 -240 Q 76 -240 ${manTurn > 0.5 ? 60 : 90} ${manTurn > 0.5 ? -170 : -270}`} c="#22232c" hand={[manTurn > 0.5 ? 60 : 90, manTurn > 0.5 ? -166 : -276]} />
        <g transform="translate(0, -300)"><Head hair="slick" hairColor="#2a211c" mood="smug" tash lx={6} /></g>
      </g>
      <Bubble x={2900} y={410} text="还有位置！快上船！" o={pop(T, b(62) + 0.2) * (1 - prog(T, b(64) + 0.1, b(64) + 0.3))} tail={-30} />
      <Bubble x={2520} y={420} text="这么大的船，不会沉的。" o={pop(T, b(64) + 0.35) * (1 - prog(T, b(67) + 0.3, b(67) + 0.5))} tail={0} />
      <text x={3780} y={210} textAnchor="end" style={{ fontFamily: ZH, fontSize: 26, letterSpacing: '0.14em', fill: '#9cc2ff' }} opacity={0.85 * easeOut(prog(T, b(63), b(63) + 0.5))}>海水 −2°C</text>
    </g>
  );
};

/* ---------------- the cutaway: 2,224 people, six early boats ---------------- */
const ABOARD = 2224;
const EARLY = BOATS.slice(0, 6); // 7, 5, 3, 8, 1, 6: launched 0:40-1:10
const EARLY_OCC = EARLY.reduce((s, x) => s + x.occ, 0), EARLY_CAP = EARLY.reduce((s, x) => s + x.cap, 0);
const SHIP_DY = 70;
const HULL = `M 180 ${520 + SHIP_DY} L 1700 ${505 + SHIP_DY} L 1748 ${520 + SHIP_DY} L 1706 ${700 + SHIP_DY} L 262 ${700 + SHIP_DY} Q 204 ${690 + SHIP_DY} 190 ${640 + SHIP_DY} Z`;
const WATER = 640 + SHIP_DY;
const PIV = [960, WATER];
const rot = (x: number, y: number, deg: number) => {
  const a = (deg * Math.PI) / 180, dx = x - PIV[0], dy = y - PIV[1];
  return [PIV[0] + dx * Math.cos(a) - dy * Math.sin(a), PIV[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
type Dot = { x: number; y: number; tw: number };
const DOTS: Dot[] = (() => {
  const out: Dot[] = [];
  let i = 0;
  while (out.length < ABOARD) {
    const r1 = rnd[(i * 3) % 12000], r2 = rnd[(i * 3 + 1) % 12000], r3 = rnd[(i * 3 + 2) % 12000];
    i++;
    if (r3 < 0.16) { // superstructure decks
      out.push({ x: 440 + r1 * 1040, y: 452 + SHIP_DY + r2 * 58, tw: r3 * 40 });
    } else {
      const y = 528 + r2 * 160;
      const depth = (y - 528) / 160;
      const x0 = 230 + depth * 70, x1 = 1690 - depth * 50;
      out.push({ x: x0 + r1 * (x1 - x0), y: y + SHIP_DY, tw: r3 * 40 });
    }
  }
  return out;
})();
/* boats row (screen space) */
const BOAT_Y = 170;
const boatX = (k: number) => 300 + k * 264;
const boatGrid = (cap: number) => (cap >= 60 ? { cols: 13, rows: 5 } : cap >= 45 ? { cols: 12, rows: 4 } : { cols: 10, rows: 4 });
const seatPos = (k: number, j: number) => {
  const { cols, rows } = boatGrid(EARLY[k].cap);
  const c = j % cols, r = Math.floor(j / cols);
  return [boatX(k) + (c - (cols - 1) / 2) * 15, BOAT_Y + (r - (rows - 1) / 2) * 15];
};
const fillAt = (k: number) => SECT + 0.35 + k * 0.26;
/* who leaves: the occupants of the six boats come from the upper decks */
const LEAVERS = (() => {
  const upper = DOTS.map((d, i) => ({ d, i })).filter(({ d }) => d.y < 520 + SHIP_DY && d.x > 520 && d.x < 1420);
  const list: { idx: number; k: number; j: number; t: number }[] = [];
  let u = 0;
  EARLY.forEach((bt, k) => {
    // seats taken in a scattered order, not front-to-back
    const order = Array.from({ length: bt.cap }, (_, j) => j).sort((a, c) => rnd[5000 + k * 70 + a] - rnd[5000 + k * 70 + c]);
    for (let n = 0; n < bt.occ; n++) list.push({ idx: upper[(u++ * 7) % upper.length].i, k, j: order[n], t: fillAt(k) + 0.32 * (n / bt.occ) });
  });
  return list;
})();
const LEAVER_OF = new Map(LEAVERS.map((l) => [l.idx, l]));
const SEAT_TAKEN = new Map(LEAVERS.map((l) => [`${l.k}:${l.j}`, l.t]));
const FLY = 0.55;

const Section: React.FC<{ T: number }> = ({ T }) => {
  const tilt = lerp(1.4, 3.2, easeInOut(prog(T, SECT, WHY_OUT)));
  const inO = easeOut(prog(T, SECT - 0.25, SECT + 0.4));
  const push = lerp(1, 1.07, easeInOut(prog(T, NB, DIVE)));
  // the dive: into one of boat No. 1's empty seats
  const k1 = 4, j1 = (() => { for (let j = boatGrid(40).cols * 2 + 4; j < 40; j++) if (!SEAT_TAKEN.has(`${k1}:${j}`)) return j; return 39; })();
  const [sx, sy] = seatPos(k1, j1);
  const dive = easeIn(prog(T, DIVE, WHY_OUT - 0.05));
  const zoom = push * Math.pow(70, dive);
  const cx = lerp(960, sx, easeInOut(prog(T, DIVE, DIVE + 0.9))), cy = lerp(560, sy, easeInOut(prog(T, DIVE, DIVE + 0.9)));
  const leftO = easeOut(prog(T, NB, NB + 0.5));
  const statO = easeOut(prog(T, fillAt(5) + 0.9, fillAt(5) + 1.4));
  const fin = (k: number) => fillAt(k) + 0.32 + FLY;
  return (
    <AbsoluteFill style={{ opacity: inO }}>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id="sx-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060a16" /><stop offset="1" stopColor="#0c1424" /></linearGradient>
          <linearGradient id="sx-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d2038" stopOpacity="0.82" /><stop offset="1" stopColor="#040812" stopOpacity="0.96" /></linearGradient>
          <radialGradient id="sx-dot"><stop offset="0" stopColor="#ffd98a" stopOpacity="0.9" /><stop offset="1" stopColor="#ffb850" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sx-bg)" />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-cx} ${-cy})`}>
          {/* blueprint grid */}
          {Array.from({ length: 25 }, (_, i) => <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={H} stroke="#1a2a48" strokeWidth={1} opacity={0.45} />)}
          {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 80} x2={W} y2={i * 80} stroke="#1a2a48" strokeWidth={1} opacity={0.45} />)}
          {/* the ship, listing by the bow */}
          <g transform={`rotate(${tilt} ${PIV[0]} ${PIV[1]})`}>
            {[340, 1600].map((x) => <line key={x} x1={x} y1={520 + SHIP_DY} x2={x - 10} y2={250 + SHIP_DY} stroke="#5a6a88" strokeWidth={4} />)}
            <line x1={330} y1={250 + SHIP_DY} x2={1590} y2={250 + SHIP_DY} stroke="#5a6a88" strokeWidth={1.5} opacity={0.6} />
            {[620, 860, 1100, 1340].map((x) => (
              <g key={x}>
                <path d={`M ${x - 24} ${445 + SHIP_DY} L ${x + 24} ${445 + SHIP_DY} L ${x + 2} ${282 + SHIP_DY} L ${x - 46} ${282 + SHIP_DY} Z`} fill="#c98a3a" />
                <path d={`M ${x - 40} ${312 + SHIP_DY} L ${x + 7} ${312 + SHIP_DY} L ${x + 2} ${282 + SHIP_DY} L ${x - 46} ${282 + SHIP_DY} Z`} fill="#141414" />
              </g>
            ))}
            <rect x={420} y={445 + SHIP_DY} width={1090} height={75} fill="#18202f" stroke="#c9c2b0" strokeWidth={3} />
            {[468, 492].map((y) => <line key={y} x1={420} y1={y + SHIP_DY} x2={1510} y2={y + SHIP_DY} stroke="#3a4a66" strokeWidth={2} />)}
            <path d={HULL} fill="#141b2a" stroke="#c9c2b0" strokeWidth={4} />
            {[548, 576, 604, 632, 660, 688].map((y) => <line key={y} x1={232} y1={y + SHIP_DY} x2={1712} y2={y + SHIP_DY} stroke="#2e3c58" strokeWidth={2} />)}
            {Array.from({ length: 14 }, (_, i) => <line key={i} x1={330 + i * 100} y1={522 + SHIP_DY} x2={330 + i * 100} y2={698 + SHIP_DY} stroke="#2e3c58" strokeWidth={1.5} />)}
            <text x={1730} y={430 + SHIP_DY} textAnchor="end" style={{ fontFamily: EN, fontSize: 20, letterSpacing: '0.3em', fill: '#7d8cab' }}>R.M.S. TITANIC · 01:10</text>
          </g>
          {/* people: warm dots that stay; the few who leave fly to the boats */}
          {DOTS.map((d, i) => {
            const l = LEAVER_OF.get(i);
            let [x, y] = rot(d.x, d.y, tilt);
            let r = 2.6, o = 0.92;
            if (l) {
              const u = clamp((T - l.t) / FLY);
              if (u > 0) {
                const [tx, ty] = seatPos(l.k, l.j);
                const e = easeInOut(u);
                const mx = (x + tx) / 2, my = Math.min(y, ty) - 90;
                x = (1 - e) * (1 - e) * x + 2 * (1 - e) * e * mx + e * e * tx;
                y = (1 - e) * (1 - e) * y + 2 * (1 - e) * e * my + e * e * ty;
                o = u >= 1 ? 0 : 1; r = 3.8;
              }
            }
            const tw = 0.75 + 0.25 * Math.sin(T * 2.2 + d.tw);
            return o > 0 ? <circle key={i} cx={x} cy={y} r={r} fill="#ffcf6e" opacity={o * tw} /> : null;
          })}
          {/* the sea over the lower hull */}
          <rect x={-200} y={WATER} width={W + 400} height={H} fill="url(#sx-sea)" />
          <line x1={-200} y1={WATER} x2={W + 200} y2={WATER} stroke="#3a5a86" strokeWidth={2} />
          {/* the six early boats */}
          {EARLY.map((bt, k) => {
            const { cols, rows } = boatGrid(bt.cap);
            const bw = cols * 15 + 36, bh = rows * 15 + 26, x = boatX(k);
            const ap = easeOut(prog(T, SECT + k * 0.08, SECT + k * 0.08 + 0.4));
            const done = easeOut(prog(T, fin(k), fin(k) + 0.4));
            return (
              <g key={bt.id} opacity={ap}>
                <path d={`M ${x - bw / 2} ${BOAT_Y} Q ${x - bw / 2 + 20} ${BOAT_Y - bh / 2} ${x} ${BOAT_Y - bh / 2} Q ${x + bw / 2 - 20} ${BOAT_Y - bh / 2} ${x + bw / 2} ${BOAT_Y} Q ${x + bw / 2 - 20} ${BOAT_Y + bh / 2} ${x} ${BOAT_Y + bh / 2} Q ${x - bw / 2 + 20} ${BOAT_Y + bh / 2} ${x - bw / 2} ${BOAT_Y} Z`} fill="#1a2234" stroke="#c9c2b0" strokeWidth={2.5} />
                {Array.from({ length: bt.cap }, (_, j) => {
                  const [px, py] = seatPos(k, j);
                  const t = SEAT_TAKEN.get(`${k}:${j}`);
                  const on = t !== undefined && T >= t + FLY;
                  return <rect key={j} x={px - 5} y={py - 5} width={10} height={10} rx={1.5} fill={on ? '#ffcf6e' : done > 0 ? '#86b8ff' : '#3a4660'} opacity={on ? 1 : 0.5 + 0.4 * done} />;
                })}
                <text x={x} y={BOAT_Y + bh / 2 + 30} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 19, fill: 'rgba(243,237,226,0.7)', letterSpacing: '0.08em' }}>{bt.id}号 · {bt.launch}</text>
                <text x={x} y={BOAT_Y - bh / 2 - 12} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, fill: '#f3ede2' }} opacity={done}>
                  <tspan fill="#f6cf78">{bt.occ}</tspan> / {bt.cap}
                </text>
              </g>
            );
          })}
          {/* captions */}
          <text x={960} y={300} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, letterSpacing: '0.12em', fill: 'rgba(243,237,226,0.8)' }} opacity={statO}>
            最早放下的6艘：{EARLY_CAP} 个座位，坐了 <tspan fill="#f6cf78" fontWeight={700}>{Math.round((EARLY_OCC / EARLY_CAP) * 100)}%</tspan>（估算）
          </text>
          <g opacity={leftO}>
            <text x={960} y={WATER - 64} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 52, fill: '#f6cf78', letterSpacing: '0.06em', paintOrder: 'stroke', stroke: '#0a0f1c', strokeWidth: 10 }}>还在船里：2000多人</text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- the scene ---------------- */
type Line = [number, number, string, string];
const LINES: Line[] = [
  [WHY_IN + 0.12, b(62) - 0.08, '撞上冰山以后，船里还很暖，乐队还在演奏', 'After the iceberg, it was still warm inside. The band kept playing.'],
  [b(62) + 0.06, SECT - 0.1, '外面是零下的黑夜，很多人觉得{没必要}上小船', 'Outside, a freezing night. Many saw no need to climb into a small boat.'],
  [SECT + 0.06, NB - 0.08, '最早放下的6艘救生艇，平均[不到一半]满', 'The first six boats left less than half full.'],
  [NB + 0.06, LAST - 0.08, '心理学管这个叫[常态偏差]', 'Psychologists call it normalcy bias.'],
  [LAST + 0.06, WHY_OUT - 0.12, '危险来了，人的第一反应是：应该没事吧', 'When danger comes, the first thought is: it will probably be fine.'],
];
export const WhyScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < WHY_IN - 0.05 || T > WHY_OUT + 0.05) return null;
  const tilt = lerp(0.6, 1.6, easeInOut(prog(T, WHY_IN, SECT)));
  const pan = easeInOut(prog(T, PAN_A, PAN_B));
  const camX = lerp(900, 2960, pan), camY = 640;
  const zoom = T < PAN_A ? lerp(1.12, 1.2, easeInOut(prog(T, WHY_IN, PAN_A))) : lerp(1.2, 1.1, pan) * lerp(1, 1.06, easeInOut(prog(T, PAN_B, SECT)));
  const panoO = 1 - easeIn(prog(T, SECT - 0.2, SECT + 0.35));
  const inO = easeOut(prog(T, WHY_IN, WHY_IN + 0.3));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      {panoO > 0 && (
        <AbsoluteFill style={{ opacity: panoO * inO }}>
          <svg width={W} height={H}>
            <defs>
              <linearGradient id="lg-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3e2716" /><stop offset="1" stopColor="#24160c" /></linearGradient>
              <radialGradient id="lg-glow"><stop offset="0" stopColor="#ffd27a" stopOpacity="0.38" /><stop offset="1" stopColor="#ffd27a" stopOpacity="0" /></radialGradient>
              <linearGradient id="lg-door" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1b2c4a" /><stop offset="1" stopColor="#0b1428" /></linearGradient>
              <linearGradient id="dk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#03060f" /><stop offset="1" stopColor="#0e1a30" /></linearGradient>
              <clipPath id="dk-clip"><rect x={1920} y={-200} width={2200} height={1500} /></clipPath>
              <radialGradient id="dk-lamp"><stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd27a" stopOpacity="0" /></radialGradient>
            </defs>
            <g transform={`translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-camX} ${-camY})`}>
              <Lounge T={T} tilt={tilt} />
              <g clipPath="url(#dk-clip)"><Deck T={T} tilt={tilt} /></g>
            </g>
          </svg>
        </AbsoluteFill>
      )}
      {T > SECT - 0.3 && <Section T={T} />}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0.55) 55%, rgba(5,7,13,0.8) 100%)', opacity: 1 - easeIn(prog(T, DIVE + 0.6, WHY_OUT)) }} />
      <Chapter T={T} at={WHY_IN + 0.2} out={PAN_A + 0.3} text="凌 晨 0:40 · 头 等 舱 休 息 厅" />
      <Chapter T={T} at={PAN_B - 0.2} out={SECT - 0.1} text="凌 晨 0:40 · 救 生 艇 甲 板" />
      {LINES.map(([at, out, zh, en], i) => <Sub key={i} T={T} at={at} out={out} zh={zh} en={en} />)}
      <Vignette strength={0.4} />
      <Grain />
    </AbsoluteFill>
  );
};
