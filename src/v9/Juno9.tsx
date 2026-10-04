import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { GoldTitle, Monogram } from '../brand/Brand';
import { JUNO } from '../brand/identity';
import { ease, prog, font } from '../brand/lib';

/* 《越修越堵》 bookends in the channel's own look: gold metal title, the J monogram, gold dust.
   Never print the credit line; the corner mark and the end card carry the brand. */
const W = 1920, H = 1080, GOLD = JUNO.colors.gold, INK = JUNO.colors.ink;
export const TITLE_TEXT = '越修越堵';

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="j9-bg" cx="50%" cy="44%" r="70%">
      <stop offset="0" stopColor="#1b2033" />
      <stop offset="0.5" stopColor="#0c0f1a" />
      <stop offset="1" stopColor="#040509" />
    </radialGradient>
    <radialGradient id="j9-key" cx="50%" cy="42%" r="40%">
      <stop offset="0" stopColor="#f1c56d" stopOpacity="0.22" />
      <stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
    </radialGradient>
  </defs>
);
const Dust: React.FC<{ f: number; n?: number; burstAt?: number; cy?: number }> = ({ f, n = 90, burstAt, cy = 470 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x0 = random(`j9x${i}`) * W, y0 = random(`j9y${i}`) * H, z = random(`j9z${i}`);
      const x = x0 + Math.sin((f + i * 13) / (60 + z * 40)) * 20;
      const y = ((y0 - f * (0.2 + z * 0.6)) % H + H) % H;
      let o = (0.15 + 0.45 * z) * (0.5 + 0.5 * Math.sin(f / 11 + i)), bx = 0, by = 0;
      if (burstAt !== undefined && f >= burstAt && i < 40) {
        const t = f - burstAt, a = random(`j9a${i}`) * Math.PI * 2, d = t * (3 + random(`j9d${i}`) * 9) * Math.exp(-t / 30);
        bx = Math.cos(a) * d - (x - W / 2); by = Math.sin(a) * d * 0.35 - (y - cy); o = Math.max(0, 1 - t / 40);
      }
      return <circle key={i} cx={x + bx} cy={y + by} r={0.8 + z * 2.2} fill="#ffe3a8" opacity={o} />;
    })}
  </g>
);
/** this episode's motif: the Braess network in gold line, its shortcut struck out */
const Motif: React.FC<{ p: number }> = ({ p }) => {
  const d = (k: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - Math.max(0, Math.min(1, (p - k) / 0.5)) });
  const x = Math.max(0, Math.min(1, (p - 0.75) / 0.25));
  return (
    <g fill="none" stroke={GOLD} strokeLinecap="round">
      <path d="M -200 0 L -70 -46" strokeWidth={2} {...d(0)} />
      <path d="M -70 -46 Q 90 -118 200 0" strokeWidth={4} opacity={0.9} {...d(0.1)} />
      <path d="M -200 0 Q -90 118 70 46" strokeWidth={4} opacity={0.9} {...d(0.1)} />
      <path d="M 70 46 L 200 0" strokeWidth={2} {...d(0.2)} />
      <path d="M -70 -46 L 70 46" strokeWidth={2} strokeDasharray="6 7" opacity={Math.min(1, p * 2) * 0.8} />
      {[[-200, 0, 6], [200, 0, 6], [-70, -46, 3.5], [70, 46, 3.5]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={GOLD} stroke="none" opacity={Math.min(1, p * 3)} />)}
      <g transform="translate(0 0)" opacity={x} stroke="#ff8a6a" strokeWidth={3}>
        <line x1={-11 * x} y1={-11 * x} x2={11 * x} y2={11 * x} /><line x1={11 * x} y1={-11 * x} x2={-11 * x} y2={11 * x} />
      </g>
    </g>
  );
};
const Hairline: React.FC<{ y: number; p: number; gap: number }> = ({ y, p, gap }) => (
  <g stroke={GOLD} strokeWidth={1.2} opacity={0.7}>
    <line x1={W / 2 - gap} y1={y} x2={W / 2 - gap - 140 * p} y2={y} />
    <line x1={W / 2 + gap} y1={y} x2={W / 2 + gap + 140 * p} y2={y} />
  </g>
);

/** title card: lands on the downbeat `land` (frames after its start), lasts `dur` frames */
export const JunoTitle9: React.FC<{ f: number; dur: number; land: number }> = ({ f, dur, land }) => {
  if (f < 0 || f > dur) return null;
  const inP = prog(f, 0, 5, ease.inOut), out = prog(f, dur - 12, 12, ease.inOut);
  const flare = f >= land + 6 ? Math.exp(-(f - land - 6) / 9) : 0;
  const push = 1 + 0.03 * prog(f, 0, dur, ease.inOut) + 0.03 * out;
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out) }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs />
        <rect width={W} height={H} fill="#06080f" opacity={0.93} />
        <rect width={W} height={H} fill="url(#j9-bg)" opacity={0.93} />
        <g transform={`translate(${W / 2},${H / 2}) scale(${push}) translate(${-W / 2},${-H / 2})`}>
          <rect width={W} height={H} fill="url(#j9-key)" opacity={0.7 + 0.6 * flare} />
          <Dust f={f} burstAt={land + 6} />
          <text x={W / 2} y={318} textAnchor="middle" style={{ fontFamily: font.latin, fontWeight: 600, fontSize: 24, letterSpacing: '0.45em', fill: GOLD }} opacity={0.85 * prog(f, 2, 14)}>BRAESS'S PARADOX · 布雷斯悖论</text>
          <Hairline y={360} p={prog(f, 4, 24)} gap={70} />
          <g transform={`translate(${W / 2},360)`} opacity={prog(f, 4, 12)}><path d="M0,-6 L6,0 L0,6 L-6,0 Z" fill={GOLD} /></g>
          <GoldTitle text={TITLE_TEXT} f={f} at={Math.max(2, land - 6)} size={140} y={512} />
          <ellipse cx={W / 2} cy={470} rx={760 * (0.4 + flare)} ry={2 + 2.5 * flare} fill="#fff1cf" opacity={0.6 * flare} />
          <g transform={`translate(${W / 2},648) scale(0.8)`}><Motif p={prog(f, land + 4, 34, ease.out)} /></g>
          <text x={W / 2} y={790} textAnchor="middle" style={{ fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: INK, letterSpacing: '0.12em' }} opacity={prog(f, land + 14, 14)}>多修一条路，所有人更慢</text>
          <text x={W / 2} y={836} textAnchor="middle" style={{ fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 26, fill: 'rgba(243,237,226,0.55)' }} opacity={prog(f, land + 20, 14)}>One more road. Everyone slower.</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const JunoEnd9: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  if (f < 0) return null;
  const bgIn = prog(f, 0, 24, ease.inOut), black = prog(f, dur - 18, 18, ease.in);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs />
        <rect width={W} height={H} fill="#05060b" opacity={0.9 * bgIn} />
        <rect width={W} height={H} fill="url(#j9-key)" opacity={bgIn} />
        <Dust f={f + 400} n={70} />
        <g transform={`translate(${W / 2},240)`}><Monogram draw={prog(f, 8, 40, ease.inOut)} size={1} wordmark={JUNO.name} /></g>
        <GoldTitle text={TITLE_TEXT} f={f} at={30} size={92} y={468} />
        <g transform={`translate(${W / 2},562) scale(0.55)`}><Motif p={prog(f, 44, 40)} /></g>
        <text x={W / 2} y={676} textAnchor="middle" style={{ fontFamily: font.serif, fontWeight: 700, fontSize: 46, fill: INK, letterSpacing: '0.1em' }} opacity={prog(f, 62, 18)}>你家附近，有越修越堵的路吗？</text>
        <text x={W / 2} y={722} textAnchor="middle" style={{ fontFamily: font.sans, fontSize: 25, fill: 'rgba(243,237,226,0.58)', letterSpacing: '0.12em' }} opacity={prog(f, 70, 18)}>@ 一个天天堵在路上的朋友</text>
        <g opacity={prog(f, 78, 20)}>
          <rect x={W / 2 - 330} y={760} width={660} height={56} rx={28} fill="none" stroke={GOLD} strokeOpacity={0.6} />
          <text x={W / 2} y={796} textAnchor="middle" style={{ fontFamily: font.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: GOLD }}>{JUNO.follow}</text>
        </g>
        <g opacity={prog(f, 90, 20)} style={{ fontFamily: font.sans, fontSize: 17, letterSpacing: '0.04em', fill: 'rgba(243,237,226,0.4)' }}>
          <text x={W / 2} y={986} textAnchor="middle">{`《${TITLE_TEXT}》 · ${JUNO.series}　|　资料：Braess, Unternehmensforschung (1968) · Easley & Kleinberg《Networks, Crowds, and Markets》第8章`}</text>
          <text x={W / 2} y={1014} textAnchor="middle">Youn, Gastner & Jeong, Physical Review Letters 101 (2008) · Cohen & Horowitz, Nature 352 (1991)　例题数值为代码重算；城市路网与弹簧为示意</text>
        </g>
        <rect width={W} height={H} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
