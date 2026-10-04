import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, zlerp, Subs, SubBand, Chapter, Line, CAST, NIGHT } from './ui6';
import { Phone, Feed, FEED_A, Post, flickScroll, PW, PH, SX, SY, SW } from './Phone';
import { SK, SKD } from '../v4/Why';
import { Vignette, Grain } from '../ui';

/* S1 cold open, 0 -> b32: over 小张's shoulder at 1:07 a.m. Frame 0 is already the moving feed. */
export const S1_OUT = b(32);
/* his own post: one person, two likes */
const MINE: Post = { who: 0, text: '一个人吃了顿火锅', n: 1, bg: '#3a3f55', likes: 2, seed: 21, mood: 'calm', crowdMood: 'calm', star: 0 };
export const PK = 0.82, PX = 1060 - (PW * PK) / 2, PY = 470 - (PH * PK) / 2; // phone in world px
const AV = [PX + (SX + SW - 62) * PK, PY + (SY + 236) * PK]; // his own avatar on the header
const LINES: Line[] = [
  [-0.4, b(22) - 0.08, '好像只有我，过得不好', "It feels like I'm the only one not doing well."],
  [b(22) + 0.06, b(29.6), '你的朋友，真的[比你朋友多]', 'Your friends really do have more friends than you.'],
];
/* the camera: scale s about focus (fx, fy) */
const cam = (T: number) => {
  const k1 = easeInOut(prog(T, 0, b(26)));
  let s = zlerp(2.05, 1.0, k1), fx = lerp(1060, 990, k1), fy = lerp(480, 540, k1);
  const k2 = prog(T, b(29.5), S1_OUT);
  if (k2 > 0) {
    const e = Math.pow(k2, 2.2);
    s = zlerp(1.0, 34, e);
    const m = easeInOut(clamp(k2 * 1.6));
    fx = lerp(990, AV[0], m); fy = lerp(540, AV[1], m);
  }
  return { s, fx, fy };
};
export const Room: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <rect x={-400} y={-300} width={2720} height={1700} fill="#0b101d" />
    {/* window with a cold city glow */}
    <rect x={140} y={120} width={360} height={430} rx={6} fill="#13203a" stroke="#1c2a46" strokeWidth={10} />
    <path d="M 320 120 L 320 550 M 140 330 L 500 330" stroke="#1c2a46" strokeWidth={8} />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={160 + (i * 47) % 320} y={400 + (i * 31) % 130} width={8} height={12} fill="#e8c27a" opacity={0.25 + 0.2 * (i % 3)} />)}
    {/* the bunk across the room: a sleeping lump and one more phone awake */}
    <g transform="translate(1500, 300)">
      <rect x={-20} y={-20} width={16} height={720} fill="#1a2234" /><rect x={520} y={-20} width={16} height={720} fill="#1a2234" />
      <rect x={-20} y={150} width={556} height={26} fill="#1e2840" />
      <rect x={-20} y={520} width={556} height={26} fill="#1e2840" />
      <path d="M 30 150 Q 120 90 260 112 Q 400 96 500 150 Z" fill="#202b45" />
      <path d="M 30 520 Q 140 470 300 488 Q 420 476 500 520 Z" fill="#202b45" />
      <circle cx={140} cy={470} r={70} fill="#7fa4ff" opacity={0.10 + 0.03 * Math.sin(T * 1.7)} />
      <rect x={128} y={456} width={20} height={34} rx={4} fill="#9fbcff" opacity={0.7} />
    </g>
    <rect x={-400} y={880} width={2720} height={500} fill="#090d18" />
  </g>
);
/* the palm and sleeve behind the phone (draw before the phone) */
export const HandBack: React.FC<{ hood?: string }> = ({ hood = '#26375c' }) => (
  <g>
    <path d={`M ${PX - 240} 1300 Q ${PX - 120} ${PY + PH * PK + 170} ${PX + 60} ${PY + PH * PK + 50} L ${PX + 190} ${PY + PH * PK + 50} Q ${PX + 110} ${PY + PH * PK + 300} ${PX + 60} 1300 Z`} fill={hood} />
    {/* palm: only the sides and a tapered heel show around the phone, narrowing into the wrist */}
    <path d={`M ${PX - 20} ${PY + PH * PK - 230} L ${PX - 20} ${PY + PH * PK - 30} Q ${PX - 16} ${PY + PH * PK + 30} ${PX + 70} ${PY + PH * PK + 62}
      L ${PX + 175} ${PY + PH * PK + 62} Q ${PX + PW * PK + 18} ${PY + PH * PK + 20} ${PX + PW * PK + 20} ${PY + PH * PK - 60} L ${PX + PW * PK + 20} ${PY + PH * PK - 230} Z`} fill={SK} />
    <path d={`M ${PX + 60} ${PY + PH * PK + 40} Q ${PX + 120} ${PY + PH * PK + 58} ${PX + 180} ${PY + PH * PK + 40}`} stroke={SKD} strokeWidth={4} fill="none" opacity={0.6} />
  </g>
);
/* his back of head, hood and the gripping fingers (foreground) */
export const Shoulder: React.FC<{ T: number; thumbY: number; cap?: boolean; hood?: string }> = ({ thumbY, cap, hood = '#26375c' }) => (
  <g>
    <path d="M 160 1300 Q 220 840 520 800 Q 760 780 860 980 L 900 1300 Z" fill={hood} />
    <path d="M 340 860 Q 520 770 700 840" stroke="#1d2b49" strokeWidth={26} fill="none" />
    <ellipse cx={600} cy={760} rx={150} ry={170} fill="#15121a" />
    <path d="M 470 700 Q 520 600 620 600 Q 720 610 748 720" stroke="#2a2430" strokeWidth={14} fill="none" opacity={0.6} />
    <ellipse cx={745} cy={770} rx={18} ry={30} fill={SKD} opacity={0.85} />
    {cap && <g>
      <path d="M 448 735 Q 450 585 600 578 Q 752 585 752 735 Q 600 690 448 735 Z" fill="#141b2e" />
      <path d="M 452 720 Q 600 676 750 720 L 748 742 Q 600 700 452 742 Z" fill="#0b0f18" />
      <path d="M 420 728 Q 380 744 372 770 Q 430 750 470 742 Z" fill="#0b0f18" />
    </g>}
    {/* gripping fingers on the right edge and the thumb on the left edge (the palm is behind the phone) */}
    {[0, 1, 2, 3].map((k) => (
      <ellipse key={k} cx={PX + PW * PK + 4} cy={PY + PH * PK - 190 + k * 44} rx={17} ry={22} fill={SK} stroke={SKD} strokeWidth={3} />
    ))}
    <ellipse cx={PX - 6} cy={PY + PH * PK - 150 - thumbY} rx={19} ry={36} fill={SK} stroke={SKD} strokeWidth={3} transform={`rotate(-12 ${PX - 6} ${PY + PH * PK - 150 - thumbY})`} />
  </g>
);
export const S1Cold: React.FC<{ T: number }> = ({ T }) => {
  if (T > S1_OUT + 0.05) return null;
  const { s, fx, fy } = cam(T);
  const flicks: [number, number, number][] = [[-0.25, 360, 1.15], [1.85, 300, 1.0], [3.62, 430, 1.25], [5.15, 250, 0.95]];
  const toTop = easeInOut(prog(T, b(28), b(28) + 0.75));
  const scroll = flickScroll(T, flicks, 660) * (1 - toTop);
  // the thumb lifts a little before each flick and sweeps up with it
  const thumb = flicks.reduce((acc, [a]) => acc + 14 * Math.max(0, Math.sin(clamp((T - a + 0.15) / 0.45) * Math.PI)), 0)
    + 16 * Math.sin(clamp((T - b(28) + 0.1) / 0.5) * Math.PI);
  const glow = 1 + 0.6 * prog(T, b(29.5), S1_OUT);
  const white = prog(T, S1_OUT - 0.18, S1_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <svg width={1920} height={1080}>
        <g transform={`translate(960 540) scale(${s}) translate(${-fx} ${-fy})`}>
          <Room T={T} />
          {/* screen light on the wall and his hood */}
          <ellipse cx={1060} cy={470} rx={520} ry={420} fill="#5f86d8" opacity={0.08 * glow} />
          <HandBack />
          <g transform={`translate(${PX} ${PY}) scale(${PK})`}>
            <Phone id="s1" glow={glow}>
              <Feed posts={[MINE, ...FEED_A]} scroll={scroll} id="s1f" />
            </Phone>
          </g>
          <Shoulder T={T} thumbY={thumb} />
        </g>
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: '#e9f0ff', opacity: 0.35 * white }} />
      <SubBand o={0.9} />
      <Chapter T={T} at={b(23)} out={b(29.5)} text="凌 晨 1:07" />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.5} />
      <Grain />
    </AbsoluteFill>
  );
};
