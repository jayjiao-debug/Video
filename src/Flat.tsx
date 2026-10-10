/* 2D style tests for 《你买的不是包》. Two looks, two frames each:
   A · 金线装饰艺术 (Art Deco poster: black, gold line work, flat fills, sunburst)
   B · 插画光影 (illustrated set: gradients, a light cone, soft shadows, grain)
   Every object is our own design: luxury categories everyone reads at a glance, no house's shape, print or mark. */
import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { font } from './brand/lib';
import { JUNO } from './brand/identity';

export const GOLD = '#d9b36c', GOLD_D = '#a87c3a', GOLD_L = '#f4dca0', INK = '#f3ede2';
export type Look = 'A' | 'B';

/* ------------------------------------------------------------------ the hero bag (our design) */
const BODY = 'M -142 0 Q -160 0 -158 -18 L -132 -202 Q -130 -220 -112 -220 L 112 -220 Q 130 -220 132 -202 L 158 -18 Q 160 0 142 0 Z';
const FLAP = 'M -136 -222 L 136 -222 L 138 -150 Q 122 -88 0 -84 Q -122 -88 -138 -150 Z';
const FLAP_STITCH = 'M -126 -212 L -127 -150 Q -114 -100 0 -96 Q 114 -100 127 -150 L 126 -212';
const BODY_STITCH = 'M -130 -12 Q -146 -12 -145 -26 L -126 -192';
const HANDLE = 'M -78 -224 C -78 -338, 78 -338, 78 -224';

export const Bag2D: React.FC<{ x: number; y: number; s?: number; look: Look; leather?: string; id: string; stitch?: string; tag?: boolean; outline?: string; swing?: number; glowStitch?: boolean }> = ({ x, y, s = 1, look, leather = '#7a1c22', id, stitch, tag = true, outline, swing = 0, glowStitch = false }) => {
  const flat = look === 'A';
  const line = outline ?? (flat ? GOLD : 'rgba(0,0,0,0.35)'); const st = stitch ?? (flat ? GOLD : '#e8d2a8');
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={leather} stopOpacity={1} /><stop offset="1" stopColor="#1a0406" /></linearGradient>
        <linearGradient id={`${id}-flap`} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#c4505a" /><stop offset="0.35" stopColor={leather} /><stop offset="1" stopColor="#3a0a0e" /></linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={GOLD_L} /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor={GOLD_D} /></linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2a0609" /><stop offset="1" stopColor="#120203" /></linearGradient>
      </defs>
      {/* side gusset (depth) */}
      {!flat && <path d="M 158 -18 L 186 -30 L 160 -206 L 132 -202 Z" fill={`url(#${id}-side)`} />}
      {/* handle */}
      <path d={HANDLE} fill="none" stroke={flat ? leather : '#5a1418'} strokeWidth={17} strokeLinecap="round" />
      {flat ? <path d={HANDLE} fill="none" stroke={GOLD} strokeWidth={2} transform="translate(0 -9)" opacity={0.0} />
        : <path d="M -70 -250 C -66 -320, 30 -330, 56 -300" fill="none" stroke="rgba(255,200,200,0.35)" strokeWidth={4} strokeLinecap="round" />}
      {[-78, 78].map((hx) => <circle key={hx} cx={hx} cy={-224} r={11} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={5} />)}
      {/* body */}
      <path d={BODY} fill={flat ? leather : `url(#${id}-body)`} stroke={line} strokeWidth={flat ? 3 : 1.5} />
      <path d={BODY_STITCH} fill="none" stroke={st} strokeWidth={2} strokeDasharray="7 6" opacity={0.85} />
      <path d={BODY_STITCH} fill="none" stroke={st} strokeWidth={2} strokeDasharray="7 6" opacity={0.85} transform="scale(-1 1)" />
      <path d="M -128 -10 L 128 -10" stroke={st} strokeWidth={2} strokeDasharray="7 6" opacity={0.85} />
      {/* flap */}
      {!flat && <path d={FLAP} fill="rgba(0,0,0,0.35)" transform="translate(4 10)" />}
      <path d={FLAP} fill={flat ? leather : `url(#${id}-flap)`} stroke={line} strokeWidth={flat ? 3 : 1.5} />
      <path d={FLAP_STITCH} fill="none" stroke={st} strokeWidth={glowStitch ? 3 : 2.2} strokeDasharray="7 6" style={glowStitch ? { filter: 'drop-shadow(0 0 6px #9ef0ff) drop-shadow(0 0 16px #6ad8ff)' } : undefined} />
      {/* clasp */}
      <rect x={-34} y={-108} width={68} height={22} rx={4} fill={`url(#${id}-gold)`} stroke={GOLD_D} strokeWidth={1.5} />
      <rect x={-24} y={-101} width={48} height={8} rx={4} fill={GOLD_D} opacity={0.6} />
      {/* feet */}
      {[-120, 120].map((fx) => <ellipse key={fx} cx={fx} cy={3} rx={9} ry={4} fill={`url(#${id}-gold)`} />)}
      {/* the signature: a gold price-tag charm on a short chain */}
      {tag && <g transform={`rotate(${swing} 78 -224)`}>{Array.from({ length: 6 }, (_, i) => <circle key={i} cx={82 + i * 6} cy={-214 + i * 9} r={3.2} fill="none" stroke={GOLD} strokeWidth={1.8} />)}
      <g transform="translate(116 -150) rotate(-10)">
        <path d="M -20 -26 L 20 -26 L 20 26 L -20 26 Z" fill={`url(#${id}-gold)`} stroke={GOLD_D} strokeWidth={1.5} />
        <circle cx={0} cy={-16} r={4} fill="#1a0e04" />
        <text x={0} y={18} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={30} fill="#5a3a10">€</text>
      </g></g>}
    </g>
  );
};

/* ------------------------------------------------------------------ the other icons (category archetypes) */
export const Watch2D: React.FC<{ x: number; y: number; s?: number; look: Look }> = ({ x, y, s = 1, look }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-26} y={-150} width={52} height={70} rx={10} fill="#3a1d12" stroke={look === 'A' ? GOLD : 'none'} strokeWidth={2} />
    <rect x={-26} y={20} width={52} height={70} rx={10} fill="#3a1d12" stroke={look === 'A' ? GOLD : 'none'} strokeWidth={2} />
    <circle r={78} fill={GOLD} stroke={GOLD_D} strokeWidth={4} />
    <circle r={66} fill="#13213f" stroke={GOLD_L} strokeWidth={2} />
    {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <rect key={i} x={-3} y={-60} width={6} height={i % 3 ? 10 : 16} fill={GOLD_L} transform={`rotate(${(a * 180) / Math.PI})`} />; })}
    <circle cy={24} r={16} fill="#05070c" stroke={GOLD} strokeWidth={1.5} />
    <circle cy={24} r={10} fill="none" stroke={GOLD} strokeWidth={1.5} />
    <rect x={-2.5} y={-48} width={5} height={50} rx={2} fill={GOLD_L} transform="rotate(-35)" />
    <rect x={-2} y={-36} width={4} height={38} rx={2} fill={GOLD_L} transform="rotate(68)" />
    <circle r={5} fill={GOLD_L} />
    <rect x={76} y={-8} width={12} height={16} rx={3} fill={GOLD} />
  </g>
);
export const Ring2D: React.FC<{ x: number; y: number; s?: number; look: Look }> = ({ x, y, s = 1, look }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* open velvet box */}
    <path d="M -70 -150 L 70 -150 L 66 -60 L -66 -60 Z" fill="#1b2b55" stroke={look === 'A' ? GOLD : 'none'} strokeWidth={2} />
    <path d="M -60 -140 L 60 -140 L 57 -70 L -57 -70 Z" fill="#e9e0cc" opacity={0.9} />
    <rect x={-74} y={-60} width={148} height={70} rx={8} fill="#13203f" stroke={look === 'A' ? GOLD : 'none'} strokeWidth={2} />
    <rect x={-60} y={-60} width={120} height={14} fill="#0b1328" />
    {/* the ring and its stone */}
    <ellipse cx={0} cy={-62} rx={30} ry={34} fill="none" stroke="#e9ecf2" strokeWidth={7} />
    <path d="M -22 -112 L 22 -112 L 30 -102 L 0 -74 L -30 -102 Z" fill="#eef6ff" stroke="#b9c8e0" strokeWidth={1.5} />
    <path d="M -22 -112 L -10 -102 L 0 -112 L 10 -102 L 22 -112 M -30 -102 L 30 -102 M -10 -102 L 0 -74 L 10 -102" fill="none" stroke="#9fb2d0" strokeWidth={1.2} />
    {/* a glint */}
    <path d="M 26 -128 L 29 -118 L 39 -115 L 29 -112 L 26 -102 L 23 -112 L 13 -115 L 23 -118 Z" fill="#ffffff" />
  </g>
);
export const Perfume2D: React.FC<{ x: number; y: number; s?: number; look: Look }> = ({ x, y, s = 1, look }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-58} y={-150} width={116} height={150} rx={14} fill="rgba(220,235,255,0.18)" stroke={look === 'A' ? GOLD : 'rgba(255,255,255,0.6)'} strokeWidth={3} />
    <rect x={-46} y={-108} width={92} height={96} rx={8} fill="#d99a32" opacity={0.9} />
    <rect x={-46} y={-108} width={92} height={10} rx={4} fill="#f2c060" opacity={0.9} />
    <rect x={-40} y={-140} width={14} height={120} rx={6} fill="#ffffff" opacity={0.35} />
    <rect x={-18} y={-168} width={36} height={18} fill={GOLD} stroke={GOLD_D} strokeWidth={1.5} />
    <circle cx={0} cy={-192} r={26} fill={GOLD} stroke={GOLD_D} strokeWidth={2} />
    <circle cx={-8} cy={-200} r={7} fill={GOLD_L} opacity={0.8} />
  </g>
);
export const Lipstick2D: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-24} y={-90} width={48} height={90} rx={4} fill={GOLD} stroke={GOLD_D} strokeWidth={2} />
    <rect x={-24} y={-60} width={48} height={6} fill={GOLD_D} />
    <rect x={-18} y={-120} width={36} height={30} fill={GOLD_L} stroke={GOLD_D} strokeWidth={1.5} />
    <path d="M -15 -120 L -15 -160 L 15 -184 L 15 -120 Z" fill="#b3122a" />
    <path d="M -15 -160 L 15 -184 L 15 -176 L -15 -152 Z" fill="#e0405a" opacity={0.7} />
  </g>
);
export const Heel2D: React.FC<{ x: number; y: number; s?: number; look: Look }> = ({ x, y, s = 1, look }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* a plain pointed pump: black patent, gold heel tip, black sole */}
    <path d="M -150 0 Q -150 -14 -120 -16 L -40 -26 Q 10 -34 40 -80 Q 60 -112 96 -116 Q 120 -118 124 -96 L 120 -60 L 108 0 L 98 0 L 104 -58 Q 70 -46 40 -30 Q 0 -6 -60 -2 Z" fill="#0d0d10" stroke={look === 'A' ? GOLD : 'rgba(255,235,210,0.35)'} strokeWidth={2.5} />
    <path d="M -120 -16 Q -40 -20 20 -46 Q 44 -62 60 -92" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={4} strokeLinecap="round" />
    <rect x={98} y={-4} width={12} height={6} fill={GOLD} />
  </g>
);

/* ------------------------------------------------------------------ backdrops */
export const Grain: React.FC<{ f: number; o?: number }> = ({ f, o = 0.08 }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o }}>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 50} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.3 -0.45" /></filter>
    <rect width={1920} height={1080} filter="url(#g)" />
  </svg>
);

/** A · hero: the bag in a deco arch, sunburst behind, title */
export const AHero: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, fontVariantNumeric: 'lining-nums' }}>
    <rect width={1920} height={1080} fill="#0b0a09" />
    {/* sunburst */}
    <g transform="translate(1260 640)">{Array.from({ length: 48 }, (_, i) => { const a = -Math.PI + (i / 47) * Math.PI; return <line key={i} x1={Math.cos(a) * 120} y1={Math.sin(a) * 120} x2={Math.cos(a) * 760} y2={Math.sin(a) * 760} stroke={GOLD} strokeOpacity={i % 2 ? 0.1 : 0.22} strokeWidth={2} />; })}</g>
    {/* the arch */}
    <path d="M 1010 900 L 1010 420 A 250 250 0 0 1 1510 420 L 1510 900" fill="#120f0c" stroke={GOLD} strokeWidth={4} />
    <path d="M 1030 900 L 1030 420 A 230 230 0 0 1 1490 420 L 1490 900" fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.6} />
    {/* plinth with stepped deco top */}
    <rect x={1080} y={740} width={360} height={160} fill="#16120e" stroke={GOLD} strokeWidth={3} />
    <rect x={1060} y={720} width={400} height={22} fill="#16120e" stroke={GOLD} strokeWidth={3} />
    {[0, 1, 2].map((i) => <line key={i} x1={1100 + i * 0} y1={770 + i * 34} x2={1420} y2={770 + i * 34} stroke={GOLD} strokeOpacity={0.35} strokeWidth={1.5} />)}
    <Bag2D x={1260} y={720} s={1.15} look="A" id="ah" />
    {/* price card */}
    <g transform="translate(1440 690) rotate(-6)"><rect x={-54} y={-26} width={108} height={52} fill="#f1e8d6" stroke={GOLD} strokeWidth={2} /><text y={10} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={30} fill="#1d1a16">€ 2,600</text></g>
    {/* title */}
    <text x={150} y={430} fontFamily={font.serif} fontWeight={900} fontSize={150} fill={GOLD}>你买的</text>
    <text x={150} y={600} fontFamily={font.serif} fontWeight={900} fontSize={150} fill={GOLD}>不是包</text>
    <line x1={154} y1={650} x2={560} y2={650} stroke={GOLD} strokeWidth={2} />
    <text x={154} y={712} fontFamily={font.sans} fontWeight={700} fontSize={42} fill={INK}>多出来的2547欧元，买的是什么？</text>
    <text x={154} y={770} fontFamily="JunoMono, monospace" fontSize={22} letterSpacing="0.4em" fill={GOLD} opacity={0.8}>— {JUNO.series} —</text>
  </svg>
);

/** A · lineup: every icon on a stepped deco stand */
export const ALineup: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <rect width={1920} height={1080} fill="#0b0a09" />
    <g transform="translate(960 900)">{Array.from({ length: 60 }, (_, i) => { const a = -Math.PI + (i / 59) * Math.PI; return <line key={i} x1={Math.cos(a) * 200} y1={Math.sin(a) * 200} x2={Math.cos(a) * 1100} y2={Math.sin(a) * 1100} stroke={GOLD} strokeOpacity={i % 2 ? 0.07 : 0.16} strokeWidth={2} />; })}</g>
    {[[640, 1280, 760], [440, 1480, 860], [240, 1680, 960]].map(([x0, x1, y]) => <rect key={y} x={x0} y={y} width={x1 - x0} height={1080 - y} fill="#14110d" stroke={GOLD} strokeWidth={3} />)}
    <Bag2D x={960} y={760} s={1.05} look="A" id="al" />
    <Perfume2D x={555} y={860} s={1.05} look="A" />
    <Watch2D x={1370} y={770} s={1.0} look="A" />
    <Ring2D x={370} y={960} s={1.15} look="A" />
    <Lipstick2D x={1560} y={960} s={1.15} />
    <Heel2D x={1110} y={860} s={1.0} look="A" />
    <text x={960} y={160} textAnchor="middle" fontFamily={font.serif} fontWeight={900} fontSize={64} fill={GOLD}>包、表、钻戒、香水、口红、高跟鞋</text>
    <text x={960} y={230} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={40} fill={INK}>同一套欲望</text>
  </svg>
);

/** B · hero: an illustrated boutique, one light cone onto the case */
const BHero: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, fontVariantNumeric: 'lining-nums' }}>
    <defs>
      <linearGradient id="bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c1612" /><stop offset="1" stopColor="#0c0907" /></linearGradient>
      <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1814" /><stop offset="1" stopColor="#050404" /></linearGradient>
      <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6bf" stopOpacity={0.5} /><stop offset="1" stopColor="#ffe6bf" stopOpacity={0} /></linearGradient>
      <linearGradient id="pl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8b7a62" /><stop offset="0.6" stopColor="#c9b594" /><stop offset="1" stopColor="#6b5c48" /></linearGradient>
      <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffd9a0" stopOpacity={0.45} /><stop offset="1" stopColor="#ffd9a0" stopOpacity={0} /></radialGradient>
      <filter id="blur30"><feGaussianBlur stdDeviation="30" /></filter>
      <filter id="blur8"><feGaussianBlur stdDeviation="8" /></filter>
    </defs>
    <rect width={1920} height={1080} fill="url(#bw)" />
    {/* wall panels with brass reveals */}
    {[700, 980, 1540, 1820].map((x) => <rect key={x} x={x} y={0} width={4} height={760} fill="#8a6a3a" opacity={0.5} />)}
    <rect x={0} y={760} width={1920} height={320} fill="url(#bf)" />
    {/* light pool on the floor and the cone */}
    <ellipse cx={1260} cy={900} rx={420} ry={70} fill="url(#pool)" />
    <polygon points="1200,0 1320,0 1520,900 1000,900" fill="url(#cone)" opacity={0.55} filter="url(#blur30)" />
    {/* plinth */}
    <polygon points="1090,700 1430,700 1430,910 1090,910" fill="url(#pl)" />
    <polygon points="1090,700 1430,700 1400,680 1120,680" fill="#e2d0ad" />
    <ellipse cx={1260} cy={692} rx={150} ry={14} fill="#000" opacity={0.45} filter="url(#blur8)" />
    {/* glass case */}
    <rect x={1110} y={380} width={300} height={300} fill="rgba(200,220,255,0.05)" stroke="rgba(255,240,210,0.5)" strokeWidth={2} />
    <polygon points="1130,400 1180,400 1110,520 1110,460" fill="#ffffff" opacity={0.08} />
    <polygon points="1330,400 1350,400 1250,680 1230,680" fill="#ffffff" opacity={0.05} />
    <Bag2D x={1260} y={688} s={0.9} look="B" id="bh" />
    <g transform="translate(1380 676) rotate(-4)"><rect x={-44} y={-20} width={88} height={40} fill="#efe6d4" /><text y={9} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={24} fill="#1d1a16">€ 2,600</text></g>
    <text x={150} y={430} fontFamily={font.serif} fontWeight={900} fontSize={150} fill={GOLD}>你买的</text>
    <text x={150} y={600} fontFamily={font.serif} fontWeight={900} fontSize={150} fill={GOLD}>不是包</text>
    <text x={154} y={690} fontFamily={font.sans} fontWeight={700} fontSize={42} fill={INK}>多出来的2547欧元，买的是什么？</text>
    <text x={154} y={750} fontFamily="JunoMono, monospace" fontSize={22} letterSpacing="0.4em" fill={GOLD} opacity={0.8}>— {JUNO.series} —</text>
  </svg>
);

/** B · lineup: the window display, illustrated */
const BLineup: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <linearGradient id="bw2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1410" /><stop offset="1" stopColor="#0a0806" /></linearGradient>
      <linearGradient id="step" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2622" /><stop offset="0.05" stopColor="#141210" /><stop offset="1" stopColor="#070606" /></linearGradient>
      <radialGradient id="spot" cx="0.5" cy="0.35" r="0.6"><stop offset="0" stopColor="#ffe2b0" stopOpacity={0.28} /><stop offset="1" stopColor="#ffe2b0" stopOpacity={0} /></radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#bw2)" />
    <ellipse cx={960} cy={640} rx={900} ry={520} fill="url(#spot)" />
    {[[640, 1280, 760], [440, 1480, 860], [240, 1680, 960]].map(([x0, x1, y]) => <g key={y}><rect x={x0} y={y} width={x1 - x0} height={1080 - y} fill="url(#step)" /><rect x={x0} y={y} width={x1 - x0} height={4} fill={GOLD} opacity={0.75} /></g>)}
    <Bag2D x={960} y={760} s={1.05} look="B" id="bl" />
    <Perfume2D x={555} y={860} s={1.05} look="B" />
    <Watch2D x={1370} y={770} s={1.0} look="B" />
    <Ring2D x={370} y={960} s={1.15} look="B" />
    <Lipstick2D x={1560} y={960} s={1.15} />
    <Heel2D x={1110} y={860} s={1.0} look="B" />
    <div />
  </svg>
);

const FRAMES = [
  { look: 'A', name: 'A · 金线装饰艺术 · 主角', C: AHero },
  { look: 'A', name: 'A · 金线装饰艺术 · 全家福', C: ALineup },
  { look: 'B', name: 'B · 插画光影 · 主角', C: BHero },
  { look: 'B', name: 'B · 插画光影 · 全家福', C: BLineup },
];
export const FLAT_FRAMES = FRAMES.length;

export const Flat: React.FC = () => {
  const f = useCurrentFrame(), F = FRAMES[Math.min(FRAMES.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }`}</style>
      <F.C />
      {F.look === 'B' && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 55% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)' }} />}
      <Grain f={f} o={F.look === 'B' ? 0.09 : 0.05} />
      {F.name.includes('全家福') && F.look === 'B' && <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: font.serif, fontWeight: 900, fontSize: 64, color: GOLD }}>包、表、钻戒、香水、口红、高跟鞋</div>}
      {F.name.includes('全家福') && F.look === 'B' && <div style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 40, color: INK }}>同一套欲望</div>}
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: F.name.includes('主角') ? 0 : 0.55, fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}><span style={{ color: GOLD }}>◆ </span>{JUNO.mark}</div>
    </AbsoluteFill>
  );
};
