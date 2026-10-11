import React from 'react';
import { Head, Mood, SK, SKD, INK } from '../v4/Why';
import { Who, Glasses } from '../v6/ui6';

/* 《隔着几个人》 people: seated and walking figures, front view, feet at y = 0. No hands are drawn. */
export const HER: Who = { name: '她', hair: 'updo', hairColor: '#2b1d1a', shirt: '#d8a3a0' };
const PANTS = ['#2d3346', '#3b3540', '#283a3a', '#3a3328'];

/** seated on a bench whose top is at y = -SEAT; feet on the floor at y = 0 */
export const SEAT = 120;
export const Seated: React.FC<{ who: Who; mood: Mood; pants?: number; book?: boolean; phone?: boolean; doze?: boolean; lx?: number; ly?: number; tilt?: number; bob?: number }> =
  ({ who, mood, pants = 0, book, phone, doze, lx = 0, ly = 0, tilt = 0, bob = 0 }) => {
    const P = PANTS[pants % PANTS.length];
    return (
      <g>
        <ellipse cx={0} cy={2} rx={70} ry={9} fill="#000" opacity={0.3} />
        {/* lower legs from the knees, shoes */}
        <path d={`M -48 ${-SEAT + 26} L -44 -6 L -18 -6 L -10 ${-SEAT + 26} Z`} fill={P} />
        <path d={`M 10 ${-SEAT + 26} L 18 -6 L 44 -6 L 48 ${-SEAT + 26} Z`} fill={P} />
        <ellipse cx={-33} cy={-4} rx={23} ry={9} fill="#16161c" /><ellipse cx={33} cy={-4} rx={23} ry={9} fill="#16161c" />
        {/* thighs seen from the front: a lit top surface running towards us, then the knees */}
        <path d={`M -50 ${-SEAT - 12} L 50 ${-SEAT - 12} L 60 ${-SEAT + 24} L -60 ${-SEAT + 24} Z`} fill={P} />
        <path d={`M -50 ${-SEAT - 12} L 50 ${-SEAT - 12} L 56 ${-SEAT + 8} L -56 ${-SEAT + 8} Z`} fill="#fff" opacity={0.08} />
        <ellipse cx={-31} cy={-SEAT + 26} rx={29} ry={15} fill={P} /><ellipse cx={31} cy={-SEAT + 26} rx={29} ry={15} fill={P} />
        <path d={`M 0 ${-SEAT + 2} L 0 ${-SEAT + 36}`} stroke="#000" strokeWidth={3} opacity={0.25} />
        <g transform={`translate(0 ${bob})`}>
          {/* torso */}
          <path d={`M -50 ${-SEAT + 4} L -46 ${-SEAT - 120} Q 0 ${-SEAT - 140} 46 ${-SEAT - 120} L 50 ${-SEAT + 4} Z`} fill={who.shirt} />
          <path d={`M -14 ${-SEAT - 128} L 0 ${-SEAT - 108} L 14 ${-SEAT - 128} Z`} fill={SKD} />
          {/* sleeves down to the lap or a book */}
          {book ? (
            <>
              <path d={`M -44 ${-SEAT - 110} Q -62 ${-SEAT - 50} -30 ${-SEAT - 34}`} stroke={who.shirt} strokeWidth={22} strokeLinecap="round" fill="none" />
              <path d={`M 44 ${-SEAT - 110} Q 62 ${-SEAT - 50} 30 ${-SEAT - 34}`} stroke={who.shirt} strokeWidth={22} strokeLinecap="round" fill="none" />
              <g transform={`translate(0 ${-SEAT - 40}) rotate(-4)`}>
                <path d="M -46 -30 L 0 -22 L 0 18 L -46 10 Z" fill="#f2ead8" stroke="#c9b98f" strokeWidth={2} />
                <path d="M 46 -30 L 0 -22 L 0 18 L 46 10 Z" fill="#ece2cc" stroke="#c9b98f" strokeWidth={2} />
                {[0, 1, 2, 3].map((k) => <path key={k} d={`M -40 ${-20 + k * 8} L -6 ${-14 + k * 8} M 6 ${-14 + k * 8} L 40 ${-20 + k * 8}`} stroke="#b7a983" strokeWidth={1.5} />)}
                <path d="M -48 10 L 0 20 L 48 10 L 48 14 L 0 24 L -48 14 Z" fill="#8a3b3b" />
              </g>
            </>
          ) : phone ? (
            <>
              <path d={`M -44 ${-SEAT - 110} Q -60 ${-SEAT - 60} -12 ${-SEAT - 62}`} stroke={who.shirt} strokeWidth={22} strokeLinecap="round" fill="none" />
              <path d={`M 44 ${-SEAT - 110} Q 60 ${-SEAT - 60} 12 ${-SEAT - 62}`} stroke={who.shirt} strokeWidth={22} strokeLinecap="round" fill="none" />
              <rect x={-14} y={-SEAT - 92} width={28} height={46} rx={5} fill="#15171e" />
              <circle cx={0} cy={-SEAT - 110} r={40} fill="#8fb0ff" opacity={0.12} />
            </>
          ) : (
            <>
              <path d={`M -44 ${-SEAT - 110} Q -58 ${-SEAT - 50} -36 ${-SEAT - 14}`} stroke={who.shirt} strokeWidth={22} strokeLinecap="round" fill="none" />
              <path d={`M 44 ${-SEAT - 110} Q 58 ${-SEAT - 50} 36 ${-SEAT - 14}`} stroke={who.shirt} strokeWidth={22} strokeLinecap="round" fill="none" />
            </>
          )}
          <g transform={`translate(0 ${-SEAT - 178}) rotate(${tilt})`}>
            <Head hair={who.hair} hairColor={who.hairColor} mood={mood} lx={lx} ly={ly} />
            {doze && <g><ellipse cx={-14 + lx} cy={-6 + ly} rx={9} ry={8} fill={SK} /><ellipse cx={15 + lx} cy={-6 + ly} rx={9} ry={8} fill={SK} />
              <path d={`M ${-22 + lx} ${-5 + ly} Q ${-14 + lx} 0 ${-6 + lx} ${-5 + ly} M ${7 + lx} ${-5 + ly} Q ${15 + lx} 0 ${23 + lx} ${-5 + ly}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /></g>}
            {who.glasses && <g transform={`translate(${lx},${ly})`}><Glasses /></g>}
          </g>
        </g>
      </g>
    );
  };

/** standing / walking, front-ish view; phase drives the leg swing; feet at y = 0 */
export const Standing: React.FC<{ who: Who; mood: Mood; phase?: number; walk?: number; pants?: number; bag?: boolean }> = ({ who, mood, phase = 0, walk = 0, pants = 0, bag }) => {
  const P = PANTS[pants % PANTS.length];
  const sw = Math.sin(phase) * 16 * walk;
  const lift = Math.abs(Math.cos(phase)) * 4 * walk;
  return (
    <g transform={`translate(0 ${-lift})`}>
      <ellipse cx={0} cy={lift} rx={60} ry={8} fill="#000" opacity={0.3} />
      <g transform={`rotate(${sw} -14 -200)`}><rect x={-30} y={-200} width={26} height={196} rx={10} fill={P} /><ellipse cx={-17} cy={-4} rx={20} ry={8} fill="#16161c" /></g>
      <g transform={`rotate(${-sw} 14 -200)`}><rect x={4} y={-200} width={26} height={196} rx={10} fill={P} /><ellipse cx={17} cy={-4} rx={20} ry={8} fill="#16161c" /></g>
      <path d="M -50 -196 L -46 -330 Q 0 -350 46 -330 L 50 -196 Z" fill={who.shirt} />
      <path d="M -14 -338 L 0 -318 L 14 -338 Z" fill={SKD} />
      <g transform={`rotate(${-sw * 0.8} -44 -322)`}><path d="M -44 -322 L -54 -220" stroke={who.shirt} strokeWidth={22} strokeLinecap="round" /></g>
      <g transform={`rotate(${sw * 0.8} 44 -322)`}><path d="M 44 -322 L 54 -220" stroke={who.shirt} strokeWidth={22} strokeLinecap="round" /></g>
      {bag && <g><path d="M -40 -330 L 52 -230" stroke="#6b4a3a" strokeWidth={6} /><rect x={36} y={-250} width={50} height={56} rx={10} fill="#8a5a44" /></g>}
      <g transform="translate(0 -388)"><Head hair={who.hair} hairColor={who.hairColor} mood={mood} />{who.glasses && <Glasses />}</g>
    </g>
  );
};

/** a speech bubble anchored at its tail */
export const Bubble: React.FC<{ x: number; y: number; text: string; o: number; s?: number }> = ({ x, y, text, o, s = 1 }) => o <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${(0.7 + 0.3 * Math.min(1, o)) * s})`} opacity={Math.min(1, o)}>
    <path d="M 0 0 L 22 -40 L 52 -40 Z" fill="#f6efe1" />
    <rect x={-10} y={-130} width={170} height={96} rx={40} fill="#f6efe1" />
    <text x={75} y={-66} textAnchor="middle" style={{ fontFamily: '"Noto Serif CJK SC", serif', fontWeight: 900, fontSize: 48, fill: '#1d1c22' }}>{text}</text>
  </g>
);
