import React from 'react';
import { AbsoluteFill } from 'remotion';
import { prog, easeOut, easeIn, easeInOut, lerp, clamp, ZH, EN } from '../lib';
import { beats } from '../lib';
import { GoldTitle } from '../brand/Brand';
import { mulberry } from '../v1/data';

/* 2D flat-illustration scenes (in the manner of the tanks episode): the cold open, the title, and the V-1 over London.
   Everything is a pure function of the global time T in seconds. */
const b = (i: number) => beats[i];
const W = 1920, H = 1080;
const pop = (T: number, a: number, d = 0.25) => {
  const k = clamp((T - a) / d);
  return k <= 0 ? 0 : 1 + 0.18 * Math.sin(k * Math.PI) * (1 - k) + (easeOut(k) - 1);
};
const rnd = (() => { const r = mulberry(2468); return Array.from({ length: 400 }, () => r()); })();

/* ---------------- shared bits ---------------- */
const Skin = '#edc9a4', SkinShade = '#d9ad86', Ink = '#1d1c22';
const Grain: React.FC = () => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.18 }}>
    <filter id="tg"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /></filter>
    <rect width={W} height={H} filter="url(#tg)" />
  </svg>
);

/* ---------------- 1. cold open: a student and his personal rain cloud ---------------- */
// beats: 0 cloud arrives · 2 phone slips · 3 phone cracks · 4 bus pulls away · 6 car splashes him · 7 he looks up, lightning
const Student: React.FC<{ T: number; x: number; y: number }> = ({ T, x, y }) => {
  const shock = Math.max(pop(T, b(2), 0.3) > 0 && T < b(3) + 0.4 ? 1 : 0, T > b(6) && T < b(6) + 0.45 ? 1 : 0, T > b(7) ? 1 : 0);
  const lookBus = easeInOut(prog(T, b(4), b(4) + 0.3)) * (1 - easeInOut(prog(T, b(5) + 0.2, b(5) + 0.5)));
  const lookUp = easeInOut(prog(T, b(7) - 0.1, b(7) + 0.2));
  const wet = easeOut(prog(T, b(6), b(6) + 0.2));
  const bob = Math.sin(T * 5.2) * 3 * (1 - lookUp);
  const hood = '#3f6f6c', hoodDark = '#2f5552', jeans = '#33405e';
  const phoneArm = 1 - easeIn(prog(T, b(2), b(2) + 0.15));
  const ex = lerp(0, 10, lookBus), ey = lerp(0, -14, lookUp);
  const headTilt = lerp(0, -12, lookUp) + lerp(0, 6, lookBus);
  return (
    <g transform={`translate(${x}, ${y + bob})`}>
      {/* shadow */}
      <ellipse cx={0} cy={0} rx={110} ry={16} fill="#0c0f18" opacity={0.55} />
      {/* legs + shoes */}
      <rect x={-36} y={-115} width={30} height={112} rx={12} fill={jeans} />
      <rect x={6} y={-115} width={30} height={112} rx={12} fill={jeans} />
      <ellipse cx={-22} cy={-4} rx={26} ry={11} fill="#e8e2d4" />
      <ellipse cx={22} cy={-4} rx={26} ry={11} fill="#e8e2d4" />
      {/* backpack */}
      <rect x={-92} y={-290} width={56} height={150} rx={20} fill="#2a2f3a" />
      {/* hoodie */}
      <path d="M -70 -300 Q 0 -330 70 -300 L 78 -110 Q 0 -96 -78 -110 Z" fill={hood} />
      <path d="M -70 -300 Q 0 -330 70 -300 L 72 -270 Q 0 -292 -72 -270 Z" fill={hoodDark} />
      <path d="M -8 -298 L -14 -250 M 8 -298 L 14 -250" stroke="#e8e2d4" strokeWidth={4} strokeLinecap="round" />
      <path d="M -58 -150 L 58 -150" stroke={hoodDark} strokeWidth={10} strokeLinecap="round" />
      {/* wet streaks after the splash */}
      {wet > 0 && [-50, -24, 4, 30, 52].map((dx, i) => (
        <path key={i} d={`M ${dx} ${-260 + (i % 2) * 30} q 4 ${40 * wet} 0 ${80 * wet}`} stroke="#9fc0e8" strokeWidth={5} strokeLinecap="round" opacity={0.7 * wet} fill="none" />
      ))}
      {/* left arm hanging */}
      <path d="M -66 -284 Q -92 -200 -84 -138" stroke={hood} strokeWidth={30} strokeLinecap="round" fill="none" />
      <circle cx={-84} cy={-132} r={15} fill={Skin} />
      {/* right arm: holding the phone, then dropped */}
      <path d={`M 66 -284 Q ${lerp(98, 92, phoneArm)} ${lerp(-196, -230, phoneArm)} ${lerp(86, 84, phoneArm)} ${lerp(-138, -232, phoneArm)}`} stroke={hood} strokeWidth={30} strokeLinecap="round" fill="none" />
      <circle cx={lerp(86, 84, phoneArm)} cy={lerp(-132, -238, phoneArm)} r={15} fill={Skin} />
      {/* head */}
      <g transform={`translate(0, -360) rotate(${headTilt})`}>
        <rect x={-18} y={10} width={36} height={30} fill={SkinShade} />
        <circle cx={0} cy={-20} r={66} fill={Skin} />
        <ellipse cx={-64} cy={-14} rx={12} ry={16} fill={SkinShade} />
        <ellipse cx={64} cy={-14} rx={12} ry={16} fill={SkinShade} />
        <path d="M -68 -26 Q -70 -96 0 -94 Q 70 -96 68 -26 Q 52 -60 30 -56 L 34 -42 Q 10 -64 -6 -54 L -4 -40 Q -26 -60 -46 -50 Z" fill="#1f1a1d" />
        {/* brows: sad, then shocked */}
        <path d={`M ${-38 + ex} ${-40 + ey - shock * 8} L ${-14 + ex} ${-48 + ey - shock * 4}`} stroke={Ink} strokeWidth={6} strokeLinecap="round" />
        <path d={`M ${14 + ex} ${-48 + ey - shock * 4} L ${38 + ex} ${-40 + ey - shock * 8}`} stroke={Ink} strokeWidth={6} strokeLinecap="round" />
        <ellipse cx={-24 + ex} cy={-22 + ey} rx={shock ? 9 : 6} ry={shock ? 11 : 7} fill={Ink} />
        <ellipse cx={24 + ex} cy={-22 + ey} rx={shock ? 9 : 6} ry={shock ? 11 : 7} fill={Ink} />
        {shock ? <ellipse cx={ex * 0.6} cy={14 + ey * 0.5} rx={10} ry={13} fill="#6b2a2a" />
          : <path d={`M ${-14 + ex * 0.6} ${18 + ey * 0.5} Q ${ex * 0.6} ${8 + ey * 0.5} ${14 + ex * 0.6} ${18 + ey * 0.5}`} stroke={Ink} strokeWidth={5} fill="none" strokeLinecap="round" />}
        {T > b(3) && T < b(5) && <path d="M 58 -60 q 10 18 0 26 q -10 -8 0 -26" fill="#9fd0ff" opacity={0.9} />}
      </g>
    </g>
  );
};
const Phone: React.FC<{ T: number; hand: number[]; ground: number[] }> = ({ T, hand, ground }) => {
  const u = prog(T, b(2), b(3));
  const fall = easeIn(u);
  const x = lerp(hand[0], ground[0], u), y = lerp(hand[1], ground[1], fall);
  const rot = lerp(-10, 290, u);
  const cracked = T >= b(3);
  const crackP = easeOut(prog(T, b(3), b(3) + 0.15));
  return (
    <g transform={`translate(${x}, ${y}) rotate(${cracked ? 270 : rot})`}>
      <rect x={-17} y={-30} width={34} height={60} rx={6} fill="#15171d" />
      <rect x={-13} y={-25} width={26} height={50} rx={3} fill={cracked ? '#2b3b58' : '#8fb6f0'} />
      {cracked && (
        <g stroke="#e8f0ff" strokeWidth={2.2} fill="none" opacity={crackP}>
          <path d="M -2 -4 L -12 -18 M -2 -4 L 10 -20 M -2 -4 L 12 6 M -2 -4 L -10 18 M -2 -4 L 4 22" />
        </g>
      )}
    </g>
  );
};
export const ColdOpen2D: React.FC<{ T: number }> = ({ T }) => {
  if (T > b(8) + 0.4) return null;
  const zoom = lerp(1.32, 1.4, easeInOut(prog(T, 0, b(8))));
  const CX = 960, FEET = 770;
  // bus: parked at the stop, pulls away on beat 4
  const busX = lerp(1300, 2350, easeIn(prog(T, b(4), b(5) + 0.4)));
  // car: crosses the foreground, hits the puddle on beat 6
  const carX = lerp(-700, 2400, prog(T, b(6) - 0.55, b(6) + 0.55));
  const splash = prog(T, b(6), b(6) + 0.6);
  const cloudIn = pop(T, b(0), 0.35);
  const dark = easeOut(prog(T, b(7), b(7) + 0.15));
  const bolt = T > b(7) + 0.12 && T < b(8) ? 1 : 0;
  const flash = Math.max(easeOut(prog(T, b(7) + 0.12, b(7) + 0.3)) * 0.9, prog(T, b(7) + 0.3, b(8)));
  const windows = Array.from({ length: 70 }, (_, i) => i);
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#121827" /><stop offset="1" stopColor="#2a3550" />
          </linearGradient>
          <radialGradient id="lamp1"><stop offset="0" stopColor="#ffd89a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd89a" stopOpacity="0" /></radialGradient>
          <radialGradient id="head1"><stop offset="0" stopColor="#fff3d0" stopOpacity="0.9" /><stop offset="1" stopColor="#fff3d0" stopOpacity="0" /></radialGradient>
        </defs>
        <g transform={`translate(${CX}, 560) scale(${zoom}) translate(${-CX}, -560)`}>
          <rect width={W} height={H} fill="url(#sky1)" />
          {/* city */}
          {[[0, 300, 240], [230, 360, 200], [420, 250, 260], [700, 330, 220], [1180, 280, 250], [1420, 350, 230], [1640, 270, 290]].map(([x, top, w], i) => (
            <rect key={i} x={x} y={top} width={w} height={640 - top} fill={i % 2 ? '#1a2133' : '#161c2c'} />
          ))}
          {windows.map((i) => {
            const bx = [0, 230, 420, 700, 1180, 1420, 1640][i % 7], top = [300, 360, 250, 330, 280, 350, 270][i % 7];
            const col = Math.floor(rnd[i] * 4), row = Math.floor(rnd[i + 100] * 6);
            return <rect key={i} x={bx + 24 + col * 50} y={top + 30 + row * 46} width={22} height={28} fill="#f1c56d" opacity={0.25 + 0.4 * rnd[i + 200]} />;
          })}
          {/* road behind, sidewalk, curb, foreground road */}
          <rect y={600} width={W} height={110} fill="#1a1f2d" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={i * 300 + 40} y={652} width={140} height={8} fill="#3a4157" />)}
          <rect y={710} width={W} height={90} fill="#262c3c" />
          <rect y={796} width={W} height={10} fill="#3a4157" />
          <rect y={806} width={W} height={274} fill="#161a26" />
          {/* bus stop sign */}
          <rect x={1250} y={470} width={8} height={300} fill="#3a4157" />
          <rect x={1214} y={450} width={80} height={60} rx={8} fill="#c9a45c" />
          <text x={1254} y={490} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: '#1d1c22' }}>站</text>
          {/* the bus */}
          <g transform={`translate(${busX}, 470)`}>
            <rect width={620} height={190} rx={22} fill="#d9b25a" />
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={30 + i * 115} y={28} width={95} height={70} rx={8} fill="#2a3550" />)}
            <rect x={0} y={150} width={620} height={14} fill="#a8853a" />
            <circle cx={120} cy={196} r={34} fill="#141720" /><circle cx={500} cy={196} r={34} fill="#141720" />
          </g>
          {/* lamp post */}
          <circle cx={330} cy={360} r={190} fill="url(#lamp1)" />
          <rect x={324} y={360} width={12} height={440} fill="#2c3243" />
          <rect x={300} y={346} width={60} height={24} rx={6} fill="#ffe0a8" />
          {/* puddle */}
          <ellipse cx={CX + 40} cy={850} rx={170} ry={22} fill="#2a3a5c" opacity={0.9} />
          <Student T={T} x={CX} y={FEET} />
          {T < b(3) + 1.6 && <Phone T={T} hand={[CX + 84, FEET - 250]} ground={[CX + 150, FEET - 6]} />}
          {T > b(3) && T < b(5) && (
            <text x={CX + 210} y={FEET - 60} textAnchor="middle" transform={`rotate(-8 ${CX + 210} ${FEET - 60})`} opacity={1 - prog(T, b(4) + 0.3, b(5))}
              style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64 * pop(T, b(3), 0.25), fill: '#ffd36a', stroke: '#1d1c22', strokeWidth: 6, paintOrder: 'stroke' }}>咔！</text>
          )}
          {/* the car and its splash */}
          <g transform={`translate(${carX}, 780)`}>
            <path d="M 0 90 L 0 40 Q 40 0 140 -10 L 300 -10 Q 380 0 420 40 L 440 90 Z" fill="#a8443a" />
            <rect x={150} y={2} width={130} height={36} rx={8} fill="#9fc0e8" opacity={0.8} />
            <circle cx={90} cy={96} r={30} fill="#0e1016" /><circle cx={350} cy={96} r={30} fill="#0e1016" />
            <circle cx={436} cy={56} r={60} fill="url(#head1)" />
          </g>
          {splash > 0 && splash < 1 && Array.from({ length: 22 }, (_, i) => {
            const a = -Math.PI * (0.25 + 0.5 * rnd[i + 40]), sp = 380 + 360 * rnd[i + 60];
            const t = splash * 0.6;
            const px = CX + 40 + Math.cos(a) * sp * t - 40, py = 850 + Math.sin(a) * sp * t + 900 * t * t;
            return <ellipse key={i} cx={px} cy={py} rx={9} ry={14} fill="#9fc0e8" opacity={0.85 * (1 - splash)} />;
          })}
          {/* the personal rain cloud */}
          {cloudIn > 0 && (
            <g transform={`translate(${CX + Math.sin(T * 1.6) * 8}, 250) scale(${cloudIn})`}>
              {Array.from({ length: 36 }, (_, i) => {
                const rx = -120 + 240 * rnd[i];
                const ry = ((rnd[i + 120] * 520 + T * 1500) % 520) + 30;
                return <line key={i} x1={rx} y1={ry} x2={rx - 6} y2={ry + 36} stroke="#a9c3ea" strokeWidth={4} strokeLinecap="round" opacity={0.75} />;
              })}
              {[[-90, 10, 60], [-30, -26, 78], [50, -10, 70], [110, 16, 52], [0, 22, 70]].map(([cx, cy, r], i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill={dark > 0 ? `rgb(${lerp(122, 70, dark)},${lerp(131, 76, dark)},${lerp(150, 92, dark)})` : '#7a8396'} />
              ))}
              <rect x={-140} y={26} width={280} height={44} rx={22} fill={dark > 0 ? '#3e4456' : '#5f6779'} />
              {bolt > 0 && <path d="M 10 60 L -30 190 L 14 186 L -26 330 L 70 160 L 26 166 L 56 60 Z" fill="#fff4b8" />}
            </g>
          )}
        </g>
      </svg>
      <Grain />
      <AbsoluteFill style={{ background: '#fff8e6', opacity: T > b(7) ? flash : 0 }} />
    </AbsoluteFill>
  );
};

/* ---------------- 2. title: a gunsight sweeps the map of London and locks on ---------------- */
export const ReticleTitle: React.FC<{ f: number; dur: number; kicker: string; title: string; tagline: string; taglineEn: string; credit: string }> = ({ f, dur, kicker, title, tagline, taglineEn, credit }) => {
  const s = f / 30;
  const inP = prog(f, 0, 5);
  const out = prog(f, dur - 14, dur);
  const lockAt = 1.02; // lands on the next beat
  const k = easeInOut(prog(s, 0.05, lockAt));
  // starts where the cold open's gunsight was (match cut), then settles on the title
  const cx = lerp(1020, 960, k), cy = lerp(610, 500, k);
  const locked = s >= lockAt;
  const snap = easeOut(prog(s, lockAt, lockAt + 0.25));
  const R = lerp(lerp(250, 380, k), 330, snap);
  const flare = s >= lockAt ? Math.exp(-(s - lockAt) * 5) : 0;
  const thames = 'M -40 690 C 240 640 380 760 620 720 S 980 600 1220 660 S 1600 760 1960 680';
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out) }}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="rt-bg" cx="50%" cy="45%" r="70%"><stop offset="0" stopColor="#1b2231" /><stop offset="1" stopColor="#07080d" /></radialGradient>
          <radialGradient id="rt-lens" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#2c3446" stopOpacity="0.35" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#rt-bg)" />
        {/* the map: street grid, the Thames, and the bomb sites */}
        <g opacity={0.5}>
          {Array.from({ length: 26 }, (_, i) => <line key={`v${i}`} x1={i * 78 + 10} y1={0} x2={i * 78 - 30} y2={H} stroke="#2b3346" strokeWidth={1.5} />)}
          {Array.from({ length: 15 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 76 + 20} x2={W} y2={i * 76 + 40} stroke="#2b3346" strokeWidth={1.5} />)}
          <path d={thames} stroke="#33507a" strokeWidth={34} fill="none" opacity={0.8} />
        </g>
        {Array.from({ length: 140 }, (_, i) => (
          <circle key={i} cx={rnd[i] * W} cy={rnd[i + 150] * H} r={3 + rnd[i + 300] * 2.5} fill="#ff9a3c" opacity={0.25 + 0.35 * rnd[i + 50]} />
        ))}
        {/* darken outside the lens */}
        <mask id="rt-m"><rect width={W} height={H} fill="white" /><circle cx={cx} cy={cy} r={R} fill="black" /></mask>
        <rect width={W} height={H} fill="#05060a" opacity={0.62} mask="url(#rt-m)" />
        <circle cx={cx} cy={cy} r={R} fill="url(#rt-lens)" />
        {/* reticle */}
        <g stroke={locked ? '#f1c56d' : '#cfc8b6'} fill="none" opacity={0.95}>
          <circle cx={cx} cy={cy} r={R} strokeWidth={3} />
          <circle cx={cx} cy={cy} r={R - 16} strokeWidth={1} opacity={0.5} />
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * Math.PI * 2, l = i % 6 === 0 ? 22 : 10;
            return <line key={i} x1={cx + Math.cos(a) * R} y1={cy + Math.sin(a) * R} x2={cx + Math.cos(a) * (R - l)} y2={cy + Math.sin(a) * (R - l)} strokeWidth={i % 6 === 0 ? 2.5 : 1.2} />;
          })}
          {/* crosshair, broken in the middle so the title can sit there */}
          <line x1={cx - R - 60} y1={cy} x2={cx - 420 * snap - 40 * (1 - snap)} y2={cy} strokeWidth={2} />
          <line x1={cx + 420 * snap + 40 * (1 - snap)} y1={cy} x2={cx + R + 60} y2={cy} strokeWidth={2} />
          <line x1={cx} y1={cy - R - 60} x2={cx} y2={cy - lerp(40, 120, snap)} strokeWidth={2} />
          <line x1={cx} y1={cy + lerp(40, 120, snap)} x2={cx} y2={cy + R + 60} strokeWidth={2} />
        </g>
        {/* lock brackets */}
        {snap > 0 && [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => {
          const d = lerp(R + 90, R * 0.78, snap);
          const x0 = cx + sx * d * 0.72, y0 = cy + sy * d * 0.72;
          return <path key={i} d={`M ${x0} ${y0 + sy * -48} L ${x0} ${y0} L ${x0 + sx * -48} ${y0}`} stroke="#f1c56d" strokeWidth={5} fill="none" opacity={snap} />;
        })}
        <ellipse cx={960} cy={500} rx={760 * (0.3 + flare)} ry={2 + 3 * flare} fill="#fff1cf" opacity={0.7 * flare} />
        {/* text */}
        <text x={960} y={128} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 26, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={0.9 * prog(f, 6, 22)}>{kicker}</text>
        <g opacity={locked ? 1 : 0}>
          <GoldTitle text={title} f={f} at={Math.round(lockAt * 30)} size={124} y={545} />
        </g>
        <text x={960} y={938} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 42, fill: '#f3ede2', letterSpacing: '0.1em' }} opacity={prog(f, 50, 66)}>{tagline}</text>
        <text x={960} y={984} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 26, fill: 'rgba(243,237,226,0.5)' }} opacity={prog(f, 56, 72)}>{taglineEn}</text>
        <text x={960} y={1042} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 21, letterSpacing: '0.42em', fill: 'rgba(241,197,109,0.75)' }} opacity={prog(f, 64, 82)}>{credit}</text>
      </svg>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------------- 3. London, 1944: the buzz, the silence, the blast ---------------- */
const V1Side: React.FC<{ flame: number; T: number }> = ({ flame, T }) => {
  const fl = flame * (0.75 + 0.25 * Math.abs(Math.sin(T * 47)));
  return (
    <g>
      {fl > 0.02 && <path d={`M -150 -34 L ${-150 - 120 * fl} -26 L -150 -18 Z`} fill="#ffb24a" opacity={0.95} />}
      {fl > 0.02 && <path d={`M -150 -32 L ${-150 - 70 * fl} -26 L -150 -20 Z`} fill="#fff1c0" />}
      <rect x={-150} y={-38} width={150} height={22} rx={10} fill="#0c0e14" />
      <rect x={-12} y={-28} width={12} height={18} fill="#0c0e14" />
      <path d="M -120 0 Q -120 -22 -60 -22 L 120 -22 Q 190 -18 205 0 Q 190 18 120 22 L -60 22 Q -120 22 -120 0 Z" fill="#0c0e14" />
      <path d="M 10 2 L 70 2 L 40 58 L 10 58 Z" fill="#0c0e14" />
      <path d="M -112 -2 L -84 -2 L -96 -48 L -110 -48 Z" fill="#0c0e14" />
      <path d="M -116 4 L -86 4 L -100 26 L -116 26 Z" fill="#0c0e14" />
    </g>
  );
};
const Londoner: React.FC<{ x: number; y: number; s: number; kid?: boolean; T: number }> = ({ x, y, s, kid, T }) => {
  const freeze = T > b(52) ? 1 : 0;
  const duck = easeInOut(prog(T, b(53), b(53) + 0.3));
  const coat = kid ? '#4a3a2e' : '#5a4a3c';
  return (
    <g transform={`translate(${x}, ${y + duck * 40 * s}) scale(${s})`}>
      <ellipse cx={0} cy={duck * -40} rx={70} ry={10} fill="#05060a" opacity={0.5} />
      <rect x={-26} y={-100} width={20} height={100} fill="#1c1d22" />
      <rect x={6} y={-100} width={20} height={100} fill="#1c1d22" />
      <path d="M -52 -250 Q 0 -268 52 -250 L 58 -90 L -58 -90 Z" fill={coat} />
      {/* arms: point up, then cover the head */}
      <path d={duck > 0.5 ? 'M -46 -240 Q -60 -300 -10 -330' : 'M -46 -240 Q -70 -180 -60 -130'} stroke={coat} strokeWidth={20} strokeLinecap="round" fill="none" />
      <path d={duck > 0.5 ? 'M 46 -240 Q 60 -300 10 -330' : `M 46 -240 Q 90 ${-300 + freeze * 10} 110 -370`} stroke={coat} strokeWidth={20} strokeLinecap="round" fill="none" />
      <g transform={`translate(0, -300) rotate(${duck > 0.5 ? 10 : -14})`}>
        <circle r={44} fill={Skin} />
        {kid ? <path d="M -48 -12 Q -46 -60 0 -62 Q 46 -60 48 -12 L 70 -6 L 40 -22 Z" fill="#2c2620" />
          : <path d="M -50 0 Q -52 -58 0 -60 Q 52 -58 50 0 Q 40 -30 0 -34 Q -40 -30 -50 0 Z" fill="#6b3a2a" />}
        <ellipse cx={-14} cy={-6} rx={freeze ? 7 : 5} ry={freeze ? 9 : 6} fill={Ink} />
        <ellipse cx={16} cy={-6} rx={freeze ? 7 : 5} ry={freeze ? 9 : 6} fill={Ink} />
        {freeze ? <ellipse cx={2} cy={20} rx={7} ry={9} fill="#5a2424" /> : <path d="M -8 20 Q 2 26 12 20" stroke={Ink} strokeWidth={4} fill="none" />}
      </g>
    </g>
  );
};
export const Buzz2D: React.FC<{ T: number }> = ({ T }) => {
  const A = b(48), CUTE = b(52), HIT = b(54), OUT = b(56);
  if (T < A - 0.2 || T > OUT + 0.4) return null;
  // fades out only after the 3D camera has cut to the overview, so the dissolve lands on the map
  const o = Math.min(easeOut(prog(T, A - 0.2, A + 0.15)), 1 - prog(T, OUT, OUT + 0.35));
  // flight: across the moon with the engine running; engine cuts; the glide steepens into a dive behind the roofs
  const ux = prog(T, A, CUTE);
  let bx = lerp(2150, 1080, ux), by = lerp(260, 300, ux), ang = 0;
  if (T > CUTE) {
    const u = prog(T, CUTE, HIT);
    bx = lerp(1080, 760, u); by = lerp(300, 700, easeIn(u)); ang = lerp(0, -48, easeIn(u)); // nose turns down (it flies right-to-left)
  }
  const flame = T < CUTE ? 1 : Math.max(0, 1 - (T - CUTE) / 0.12);
  const blast = T >= HIT ? T - HIT : -1;
  const shakeX = blast >= 0 ? 10 * Math.exp(-blast * 4) * Math.sin(blast * 60) : 0;
  const glow = blast >= 0 ? Math.exp(-blast * 1.2) : 0;
  const whiteout = blast >= 0 ? 0.85 * Math.exp(-blast * 5) : 0;
  const beam = (x: number, ph: number) => {
    const a = -60 + 18 * Math.sin(T * 0.5 + ph);
    return <path d={`M ${x} 900 L ${x + Math.cos((a - 2) * Math.PI / 180) * 1500} ${900 + Math.sin((a - 2) * Math.PI / 180) * 1500} L ${x + Math.cos((a + 2) * Math.PI / 180) * 1500} ${900 + Math.sin((a + 2) * Math.PI / 180) * 1500} Z`} fill="#cfdcff" opacity={0.07} />;
  };
  const roofs = 'M 0 760 L 0 700 L 80 640 L 160 700 L 160 660 L 260 600 L 360 660 L 360 690 L 470 620 L 580 690 L 580 650 L 690 590 L 800 650 L 800 700 L 900 630 L 1010 700 L 1010 660 L 1120 600 L 1230 660 L 1230 690 L 1340 620 L 1450 690 L 1450 650 L 1560 590 L 1670 650 L 1670 700 L 1780 630 L 1920 700 L 1920 1080 L 0 1080 Z';
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id="bz-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070a14" /><stop offset="1" stopColor="#1c2640" /></linearGradient>
          <radialGradient id="bz-moon"><stop offset="0.55" stopColor="#f3ecd8" /><stop offset="0.62" stopColor="#f3ecd8" stopOpacity="0.25" /><stop offset="1" stopColor="#f3ecd8" stopOpacity="0" /></radialGradient>
          <radialGradient id="bz-blast"><stop offset="0" stopColor="#fff2c8" /><stop offset="0.35" stopColor="#ff9a40" stopOpacity="0.9" /><stop offset="1" stopColor="#ff5a20" stopOpacity="0" /></radialGradient>
        </defs>
        <g transform={`translate(${shakeX}, 0)`}>
          <rect width={W} height={H} fill="url(#bz-sky)" />
          {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={rnd[i] * W} cy={rnd[i + 90] * 560} r={1 + rnd[i + 180] * 1.6} fill="#e8eeff" opacity={0.3 + 0.5 * rnd[i + 270]} />)}
          <circle cx={1180} cy={290} r={240} fill="url(#bz-moon)" />
          {beam(420, 0)}{beam(1500, 2)}{beam(980, 4)}
          {/* the bomb and its sound */}
          {T < HIT && (
            <g transform={`translate(${bx}, ${by}) scale(-1, 1) rotate(${-ang})`}>
              <V1Side flame={flame} T={T} />
            </g>
          )}
          {T < CUTE + 0.1 && [0, 1, 2].map((i) => {
            const ph = ((T * 2.2 + i / 3) % 1);
            return <path key={i} d={`M ${bx + 160 + ph * 120} ${by - 60 - ph * 40} q ${30 + ph * 40} ${60 + ph * 30} 0 ${120 + ph * 80}`} stroke="#f3ecd8" strokeWidth={4} fill="none" opacity={(1 - ph) * 0.6 * flame} />;
          })}
          {T < CUTE + 0.1 && <text x={bx + 260} y={by - 70} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 44, fill: '#f3ecd8', letterSpacing: '0.2em' }} opacity={0.75 * flame}>嗡嗡嗡——</text>}
          {/* blast behind the roofs */}
          {blast >= 0 && <circle cx={770} cy={650} r={180 + 900 * easeOut(clamp(blast / 0.8))} fill="url(#bz-blast)" opacity={glow} />}
          {blast >= 0 && Array.from({ length: 16 }, (_, i) => {
            const a = -Math.PI * (0.15 + 0.7 * rnd[i + 10]), sp = 500 + 500 * rnd[i + 30];
            return <rect key={i} x={770 + Math.cos(a) * sp * blast} y={650 + Math.sin(a) * sp * blast + 600 * blast * blast} width={10 + 14 * rnd[i]} height={8 + 10 * rnd[i + 5]} fill="#0b0c10" transform={`rotate(${blast * 400 * rnd[i]} ${770 + Math.cos(a) * sp * blast} ${650 + Math.sin(a) * sp * blast})`} />;
          })}
          {/* terraced houses with taped windows */}
          <path d={roofs} fill="#0d1018" />
          {[60, 300, 520, 760, 980, 1200, 1420, 1640].map((x, i) => (
            <g key={i}>
              <rect x={x} y={760} width={70} height={90} fill={blast >= 0 ? '#ffb66a' : '#e9c77a'} opacity={blast >= 0 ? 0.7 : 0.35 + 0.3 * rnd[i]} />
              <path d={`M ${x} 760 L ${x + 70} 850 M ${x + 70} 760 L ${x} 850`} stroke="#0d1018" strokeWidth={5} />
              <rect x={x + 6} y={570 + (i % 3) * 20} width={18} height={60} fill="#0d1018" />
            </g>
          ))}
          <Londoner x={1500} y={1010} s={0.95} T={T} />
          <Londoner x={1660} y={1010} s={0.7} kid T={T} />
        </g>
      </svg>
      <Grain />
      <AbsoluteFill style={{ background: '#fff6e2', opacity: whiteout }} />
    </AbsoluteFill>
  );
};

/* ---------------- 1b. cold open, rocket version: V-1s keep landing on the same few houses ----------------
   Impacts on beats 2, 4, 6, all inside one block; a neighbour shakes his fist; on beat 7 a gunsight settles over the
   cluster ("as if something were aiming"), which match-cuts into the title's gunsight. */
const HITS_CO = [
  { x: 1010, y: 640, at: b(2), from: [2150, 120] },
  { x: 1150, y: 660, at: b(4), from: [2150, 60] },
  { x: 900, y: 650, at: b(6), from: [2150, 170] },
];
const RET_CO = { x: 1020, y: 610, r: 250 };
const HOUSES = Array.from({ length: 9 }, (_, i) => ({ x: i * 220 - 30, w: 220, roof: 600 + (i % 3) * 18 }));
const Bloke: React.FC<{ x: number; y: number; s: number; fist: number; shock: number }> = ({ x, y, s, fist, shock }) => {
  const coat = '#4f4336';
  const arm = fist > 0 ? `M 46 -240 Q 80 ${-300 - 20 * Math.sin(fist * 30)} 96 -360` : 'M 46 -240 Q 70 -180 60 -130';
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={70} ry={10} fill="#05060a" opacity={0.5} />
      <rect x={-26} y={-100} width={20} height={100} fill="#1c1d22" />
      <rect x={6} y={-100} width={20} height={100} fill="#1c1d22" />
      <path d="M -52 -250 Q 0 -268 52 -250 L 58 -90 L -58 -90 Z" fill={coat} />
      <path d="M -46 -240 Q -70 -180 -60 -130" stroke={coat} strokeWidth={20} strokeLinecap="round" fill="none" />
      <path d={arm} stroke={coat} strokeWidth={20} strokeLinecap="round" fill="none" />
      {fist > 0 && <circle cx={96} cy={-366} r={14} fill={Skin} />}
      <g transform="translate(0, -300) rotate(-10)">
        <circle r={44} fill={Skin} />
        <path d="M -50 -6 Q -50 -52 0 -54 Q 50 -52 52 -6 L 66 -2 L 44 -18 Q 0 -30 -50 -6 Z" fill="#3a3128" />
        <path d={`M -26 ${-16 - shock * 4} L -6 ${-10 + shock * 2}`} stroke={Ink} strokeWidth={5} strokeLinecap="round" />
        <path d={`M 26 ${-16 - shock * 4} L 6 ${-10 + shock * 2}`} stroke={Ink} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={-14} cy={-2} rx={shock ? 7 : 5} ry={shock ? 9 : 5} fill={Ink} />
        <ellipse cx={16} cy={-2} rx={shock ? 7 : 5} ry={shock ? 9 : 5} fill={Ink} />
        {shock ? <ellipse cx={2} cy={22} rx={8} ry={10} fill="#5a2424" /> : <path d="M -10 22 L 12 20" stroke={Ink} strokeWidth={5} strokeLinecap="round" />}
      </g>
    </g>
  );
};
export const ColdOpenRockets: React.FC<{ T: number }> = ({ T }) => {
  if (T > b(8) + 0.4) return null;
  const push = lerp(1.0, 1.08, easeInOut(prog(T, 0, b(8))));
  const FLY = 1.3;
  const ret = easeOut(prog(T, b(7), b(7) + 0.35));
  const retR = lerp(RET_CO.r * 2.2, RET_CO.r, ret);
  const shakeX = HITS_CO.reduce((acc, h) => acc + (T >= h.at ? 12 * Math.exp(-(T - h.at) * 5) * Math.sin((T - h.at) * 60) : 0), 0);
  const hitHouse = (i: number) => HITS_CO.some((h) => T >= h.at && Math.abs(h.x - (HOUSES[i].x + HOUSES[i].w / 2)) < 120);
  const fist = T > b(4) + 0.25 && T < b(6) ? T : 0;
  const shock = T > b(6) ? 1 : 0;
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id="co-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070a14" /><stop offset="1" stopColor="#223052" /></linearGradient>
          <radialGradient id="co-moon"><stop offset="0.55" stopColor="#f3ecd8" /><stop offset="0.62" stopColor="#f3ecd8" stopOpacity="0.25" /><stop offset="1" stopColor="#f3ecd8" stopOpacity="0" /></radialGradient>
          <radialGradient id="co-blast"><stop offset="0" stopColor="#fff2c8" /><stop offset="0.35" stopColor="#ff9a40" stopOpacity="0.9" /><stop offset="1" stopColor="#ff5a20" stopOpacity="0" /></radialGradient>
          <radialGradient id="co-fire"><stop offset="0" stopColor="#ffb24a" stopOpacity="0.8" /><stop offset="1" stopColor="#ff6a20" stopOpacity="0" /></radialGradient>
          <mask id="co-m"><rect width={W} height={H} fill="white" /><circle cx={RET_CO.x} cy={RET_CO.y} r={retR} fill="black" /></mask>
        </defs>
        <g transform={`translate(${960 + shakeX}, 640) scale(${push}) translate(-960, -640)`}>
          <rect width={W} height={H} fill="url(#co-sky)" />
          {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={rnd[i] * W} cy={rnd[i + 90] * 520} r={1 + rnd[i + 180] * 1.6} fill="#e8eeff" opacity={0.3 + 0.5 * rnd[i + 270]} />)}
          <circle cx={420} cy={240} r={170} fill="url(#co-moon)" />
          {/* distant skyline */}
          <path d="M 0 640 L 0 560 L 90 560 L 90 520 L 160 520 L 160 575 L 300 575 L 320 480 L 340 575 L 520 575 L 520 540 L 640 540 L 640 590 L 860 590 L 880 500 L 900 590 L 1240 590 L 1240 530 L 1330 530 L 1330 580 L 1600 580 L 1640 470 L 1680 580 L 1920 580 L 1920 640 Z" fill="#141a2b" />
          {/* smoke columns from earlier hits, behind the houses */}
          {HITS_CO.map((h, k) => T >= h.at && Array.from({ length: 7 }, (_, j) => {
            const t = T - h.at - j * 0.08;
            if (t <= 0) return null;
            return <circle key={`${k}-${j}`} cx={h.x + Math.sin(j * 1.7 + k) * 30 + t * 20} cy={h.y - 40 - t * 160 - j * 30} r={40 + t * 50 + j * 6} fill="#26252b" opacity={Math.min(0.75, t * 2) * (1 - j * 0.08)} />;
          }))}
          {/* the three V-1s */}
          {HITS_CO.map((h, k) => {
            const t0 = h.at - FLY;
            if (T < t0 - 0.4 || T >= h.at) return null;
            const u = prog(T, t0 - 0.4, h.at);
            const x = lerp(h.from[0], h.x, u), y = lerp(h.from[1], h.y, easeIn(u));
            const ang = lerp(-8, -38, easeIn(u));
            const flame = u < 0.72 ? 1 : Math.max(0, 1 - (u - 0.72) / 0.08);
            return (
              <g key={k} transform={`translate(${x}, ${y}) scale(-0.85, 0.85) rotate(${-ang})`}>
                <V1Side flame={flame} T={T + k} />
              </g>
            );
          })}
          {/* blasts */}
          {HITS_CO.map((h, k) => {
            const a = T - h.at;
            if (a < 0 || a > 1.6) return null;
            return (
              <g key={k}>
                <circle cx={h.x} cy={h.y} r={120 + 700 * easeOut(clamp(a / 0.7))} fill="url(#co-blast)" opacity={Math.exp(-a * 1.8)} />
                {Array.from({ length: 14 }, (_, i) => {
                  const ang = -Math.PI * (0.12 + 0.76 * rnd[i + 10 + k * 20]), sp = 450 + 450 * rnd[i + 30 + k * 20];
                  return <rect key={i} x={h.x + Math.cos(ang) * sp * a} y={h.y + Math.sin(ang) * sp * a + 650 * a * a} width={10 + 12 * rnd[i]} height={8 + 9 * rnd[i + 5]} fill="#0b0c10" />;
                })}
              </g>
            );
          })}
          {/* terraced houses: the ones that were hit lose their roofs and burn */}
          {HOUSES.map((hs, i) => {
            const hit = hitHouse(i);
            const roofPath = hit
              ? `M ${hs.x} 1080 L ${hs.x} ${hs.roof + 70} L ${hs.x + 40} ${hs.roof + 40} L ${hs.x + 70} ${hs.roof + 85} L ${hs.x + 120} ${hs.roof + 30} L ${hs.x + 150} ${hs.roof + 90} L ${hs.x + 190} ${hs.roof + 55} L ${hs.x + hs.w} ${hs.roof + 80} L ${hs.x + hs.w} 1080 Z`
              : `M ${hs.x} 1080 L ${hs.x} ${hs.roof + 70} L ${hs.x + hs.w / 2} ${hs.roof} L ${hs.x + hs.w} ${hs.roof + 70} L ${hs.x + hs.w} 1080 Z`;
            return (
              <g key={i}>
                <path d={roofPath} fill="#0d1018" />
                {!hit && <rect x={hs.x + 30} y={hs.roof + 8} width={20} height={50} fill="#0d1018" />}
                {[0, 1].map((r) => [0, 1].map((c) => {
                  const wx = hs.x + 40 + c * 90, wy = hs.roof + 130 + r * 120;
                  return (
                    <g key={`${r}${c}`}>
                      <rect x={wx} y={wy} width={56} height={70} fill={hit ? '#ff9a40' : '#e9c77a'} opacity={hit ? 0.9 : 0.25 + 0.35 * rnd[i * 4 + r * 2 + c]} />
                      {!hit && <path d={`M ${wx} ${wy} L ${wx + 56} ${wy + 70} M ${wx + 56} ${wy} L ${wx} ${wy + 70}`} stroke="#0d1018" strokeWidth={4} />}
                    </g>
                  );
                }))}
                {hit && <circle cx={hs.x + hs.w / 2} cy={hs.roof + 90} r={150} fill="url(#co-fire)" opacity={0.7 + 0.2 * Math.sin(T * 13 + i)} />}
              </g>
            );
          })}
          <Bloke x={250} y={1075} s={0.95} fist={fist} shock={shock} />
          {T > b(6) + 0.15 && T < b(7) + 0.2 && (
            <g opacity={easeOut(prog(T, b(6) + 0.15, b(6) + 0.35))} transform={`translate(300, 520) scale(${1.45 * pop(T, b(6) + 0.15, 0.3)})`}>
              <path d="M 0 0 Q 0 -60 120 -60 L 300 -60 Q 420 -60 420 0 Q 420 60 300 60 L 120 60 L 60 110 L 80 60 Q 0 60 0 0 Z" fill="#f3ecd8" />
              <text x={210} y={14} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 46, fill: '#1d1c22' }}>又是我们这条街？！</text>
            </g>
          )}
        </g>
        {/* the gunsight settles over the cluster */}
        {ret > 0 && (
          <g opacity={ret}>
            <rect width={W} height={H} fill="#05060a" opacity={0.6} mask="url(#co-m)" />
            <g stroke="#f1c56d" fill="none">
              <circle cx={RET_CO.x} cy={RET_CO.y} r={retR} strokeWidth={3} />
              <circle cx={RET_CO.x} cy={RET_CO.y} r={retR - 14} strokeWidth={1} opacity={0.5} />
              <line x1={RET_CO.x - retR - 50} y1={RET_CO.y} x2={RET_CO.x - 40} y2={RET_CO.y} strokeWidth={2} />
              <line x1={RET_CO.x + 40} y1={RET_CO.y} x2={RET_CO.x + retR + 50} y2={RET_CO.y} strokeWidth={2} />
              <line x1={RET_CO.x} y1={RET_CO.y - retR - 50} x2={RET_CO.x} y2={RET_CO.y - 40} strokeWidth={2} />
              <line x1={RET_CO.x} y1={RET_CO.y + 40} x2={RET_CO.x} y2={RET_CO.y + retR + 50} strokeWidth={2} />
            </g>
          </g>
        )}
      </svg>
      <Grain />
    </AbsoluteFill>
  );
};
