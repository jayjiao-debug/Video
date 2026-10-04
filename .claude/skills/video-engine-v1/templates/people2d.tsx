import React from 'react';

/* 2D people in the flat-illustration style used for the lounge, deck, smoke room and dorm.
   Build a character from: a body (standing: legs + coat path; seated: torso behind a table + legs under it + a chair),
   a Head (hair kind, mood, eye direction lx/ly, tilt) and Arms (stroked paths ending in a hand circle).
   Feet at y = 0, head centre about y = -300. Mirror with scale(-1, 1).
   Moods: calm, laugh, shout, smug, worry. Animate by passing T-driven values (a bow stroke, a wave, a glance).
   Lessons: seated people need legs and a chair under the table (a floating torso reads as eerie); keep
   props off the face (headphones once slid over a mouth and read as a beard). */
export const SK = '#edc9a4', SKD = '#d9ad86', INK = '#1d1c22';
export type Mood = 'calm' | 'laugh' | 'shout' | 'smug' | 'worry';
export const Face: React.FC<{ mood: Mood; lx?: number; ly?: number }> = ({ mood, lx = 0, ly = 0 }) => {
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
export type HairKind = 'slick' | 'updo' | 'cap' | 'hat' | 'bald';
export const Head: React.FC<{ hair: HairKind; hairColor?: string; mood: Mood; tash?: boolean; lx?: number; ly?: number; tilt?: number }> = ({ hair, hairColor = '#2a211c', mood, tash, lx = 0, ly = 0, tilt = 0 }) => (
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
    <Face mood={mood} lx={lx} ly={ly} />
    {tash && <path d={`M ${-17 + lx} 13 Q ${-6 + lx} 6 ${1 + lx} 11 Q ${8 + lx} 6 ${19 + lx} 13 Q ${8 + lx} 18 ${1 + lx} 15 Q ${-6 + lx} 18 ${-17 + lx} 13 Z`} fill={hairColor} />}
  </g>
);
export const Arm: React.FC<{ d: string; c: string; hand?: number[]; w?: number; glove?: string }> = ({ d, c, hand, w = 20, glove }) => (
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

