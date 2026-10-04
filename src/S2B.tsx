import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, EN, ZH, GOLD, benford } from './lib';
import { Subs, SubBand, type Line } from './ui';

/* S2b (b84–b104): the working sheet, then the paper.
   b84–b90  top-down on Newcomb's sheet: logarithm look-ups write themselves in ink, line by line, on their own clock;
            the first digits of the numbers looked up turn gold when they are 1, and a tally in the margin climbs.
   b90–b96  his two-page note in the American Journal of Mathematics, vol. 4 (1881), with his own table of
            first-digit probabilities (log10(1 + 1/d)).
   b96      the music stops (break): "没人在意。" The lamp light drains to cold blue, dust hangs in the air. */
export const S2B_IN = b(84) - 0.2, S2B_OUT = b(104) + 0.4;

export const LINES_S2B: Line[] = [
  [b(84) + 0.1, b(90) - 0.1, '他猜：1开头的数，用得最多。', 'His guess: numbers beginning with 1 are used the most.'],
  [b(90) + 0.06, b(96) - 0.15, '他写了两页纸，发表了。', 'He wrote it up in two pages and published it.'],
  [b(96) + 0.3, b(104) - 0.1, '没人在意。', 'Nobody cared.'],
];

// look-ups that a working astronomer might make: first digits drawn from Benford's law
const FIRST = [1, 3, 1, 2, 7, 1, 4, 1, 2, 9, 1, 5, 3]; // an illustrative sheet: 5 of 13 begin with 1
const ROWS = FIRST.map((d, i) => {
  const x = d + rnd(i, 22) * 0.9999;
  return { x, s: x.toFixed(4), log: Math.log10(x).toFixed(5), d };
});
const W0 = b(84) + 0.25, WS = b(90) - 0.6 - W0;
const writeAt = (i: number) => W0 + WS * Math.pow(i / ROWS.length, 0.7);

export const S2B: React.FC<{ T: number }> = ({ T }) => {
  if (T < S2B_IN || T > S2B_OUT) return null;
  const o = easeOut(prog(T, S2B_IN, S2B_IN + 0.5)) * (1 - easeInOut(prog(T, S2B_OUT - 0.6, S2B_OUT)));
  const toPaper = easeInOut(prog(T, b(89) + 0.3, b(90) + 0.4));
  const cold = easeInOut(prog(T, b(96), b(100))); // lamp light drains away in the silence
  const push = 1 + 0.06 * prog(T, S2B_IN, S2B_OUT);
  const age = easeInOut(prog(T, b(96) + 0.3, b(103) + 0.3)); // 1881 → 1938
  const year = Math.round(1881 + 57 * age);
  return (
    <AbsoluteFill style={{ backgroundColor: '#120c07', opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${push}) rotate(${-1.5 + 1.5 * prog(T, S2B_IN, S2B_OUT)}deg)` }}>
        <svg width={1920} height={1080}>
          <defs>
            <radialGradient id="lamp-pool" cx="0.62" cy="0.38" r="0.75">
              <stop offset="0" stopColor="#ffcf8a" stopOpacity={0.55 * (1 - cold)} /><stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2e6c8" /><stop offset="1" stopColor="#dccba2" /></linearGradient>
            {ROWS.map((_, i) => (
              <clipPath key={i} id={`w${i}`}><rect x={0} y={0} width={1920 * easeInOut(prog(T, writeAt(i), writeAt(i) + 0.55))} height={1080} /></clipPath>
            ))}
          </defs>
          {/* desk wood */}
          <rect width={1920} height={1080} fill="#3a2414" />
          {Array.from({ length: 30 }, (_, i) => <rect key={i} x={0} y={i * 38} width={1920} height={2} fill="#2a180c" opacity={0.5} />)}
          {/* the working sheet */}
          <g opacity={1 - toPaper} transform={`translate(${lerp(0, -160, toPaper)},0)`}>
            <rect x={430} y={70} width={1060} height={940} fill="url(#paper)" transform="rotate(-2 960 540)" />
            <g transform="rotate(-2 960 540)">
              {ROWS.map((r, i) => (
                <g key={i} clipPath={`url(#w${i})`}>
                  <text x={520} y={150 + i * 62} style={{ fontFamily: EN, fontStyle: 'italic', fontWeight: 600, fontSize: 44, fill: '#2a1d10', fontVariantNumeric: 'lining-nums' }}>
                    log <tspan fill={r.d === 1 && T > writeAt(i) + 0.5 ? '#b07a1e' : '#2a1d10'} fontWeight={700}>{r.s[0]}</tspan>{r.s.slice(1)}   =   {r.log}
                  </text>
                </g>
              ))}
            </g>
          </g>
          {/* the note, American Journal of Mathematics, vol. 4 (1881) */}
          <g opacity={toPaper} transform={`translate(${lerp(160, 0, toPaper)},${lerp(30, 0, toPaper)})`}>
            {[0, 1].map((k) => (
              <g key={k} transform={`translate(${520 + k * 470},${120 + k * 18}) rotate(${k ? 2.2 : -1.6})`}>
                <rect width={440} height={600} fill="url(#paper)" />
                {k === 0 ? (
                  <>
                    <text x={220} y={56} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', fill: '#4a3420' }}>AMERICAN JOURNAL OF MATHEMATICS · VOL. IV · 1881</text>
                    <text x={220} y={104} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 16, letterSpacing: '0.03em', fill: '#2a1d10' }}>NOTE ON THE FREQUENCY OF USE OF</text>
                    <text x={220} y={128} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 16, letterSpacing: '0.03em', fill: '#2a1d10' }}>THE DIFFERENT DIGITS IN NATURAL NUMBERS.</text>
                    <text x={220} y={160} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 18, fill: '#4a3420' }}>By Simon Newcomb</text>
                    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={40} y={196 + i * 24} width={i % 5 === 4 ? 230 : 360} height={7} fill="#4a3420" opacity={0.28} />)}
                  </>
                ) : (
                  <>
                    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={40} y={50 + i * 24} width={360} height={7} fill="#4a3420" opacity={0.28} />)}
                    {/* his table: probability of each first digit */}
                    {Array.from({ length: 9 }, (_, i) => (
                      <g key={i}>
                        <text x={150} y={232 + i * 34} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 26, fill: i === 0 ? '#b07a1e' : '#2a1d10', fontVariantNumeric: 'lining-nums' }}>{i + 1}</text>
                        <text x={190} y={232 + i * 34} style={{ fontFamily: EN, fontWeight: 600, fontSize: 26, fill: i === 0 ? '#b07a1e' : '#2a1d10', fontVariantNumeric: 'lining-nums tabular-nums' }}>{benford(i + 1).toFixed(4)}</text>
                      </g>
                    ))}
                    <text x={220} y={560} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 16, fill: '#4a3420' }}>— 40 —</text>
                  </>
                )}
              </g>
            ))}
          </g>
          <rect width={1920} height={1080} fill="url(#lamp-pool)" />
          {/* time passes on the paper: it yellows, dust settles on it */}
          {age > 0 && (
            <g opacity={toPaper}>
              <rect x={500} y={100} width={1040} height={720} fill="#6a4a1e" opacity={0.42 * age} />
              {Array.from({ length: 420 }, (_, k) => k / 420 < age ? (
                <circle key={k} cx={520 + rnd(k, 71) * 990} cy={130 + rnd(k, 72) * 640} r={0.8 + rnd(k, 73) * 2.4} fill="#3a2c1c" opacity={0.25 + 0.4 * rnd(k, 74)} />
              ) : null)}
            </g>
          )}
          {/* the silence: cold light and slow dust */}
          <rect width={1920} height={1080} fill="#0b1630" opacity={0.55 * cold} />
          {/* cobwebs spin out from the corners as the years go by */}
          {age > 0 && [[0, 0, 1, 1], [1920, 1080, -1, -1], [1920, 0, -1, 1]].map(([cx, cy, sx, sy], w) => {
            const R = 300 + 80 * w, n = 9;
            return (
              <g key={w} stroke="#cfd8ea" fill="none" opacity={0.5 * age} strokeWidth={1.4}>
                {Array.from({ length: n }, (_, k) => {
                  const a0 = (k / (n - 1)) * (Math.PI / 2);
                  return <line key={k} x1={cx} y1={cy} x2={cx + sx * Math.cos(a0) * R * Math.min(1, age * 1.6)} y2={cy + sy * Math.sin(a0) * R * Math.min(1, age * 1.6)} />;
                })}
                {Array.from({ length: 7 }, (_, ring) => {
                  const rr = (ring + 1) * (R / 8), grow = prog(age, 0.15 + ring * 0.1, 0.3 + ring * 0.1);
                  if (grow <= 0) return null;
                  const pts = Array.from({ length: n }, (_, k) => {
                    const a0 = (k / (n - 1)) * (Math.PI / 2), sag = rr * (0.94 + 0.05 * Math.sin(k * 2.3 + ring));
                    return `${cx + sx * Math.cos(a0) * sag},${cy + sy * Math.sin(a0) * sag}`;
                  }).slice(0, Math.max(2, Math.round(n * grow)));
                  return <polyline key={ring} points={pts.join(' ')} />;
                })}
              </g>
            );
          })}
          {cold > 0.01 && Array.from({ length: 70 }, (_, i) => {
            const x = rnd(i, 31) * 1920, y = (rnd(i, 32) * 1080 + (T - b(96)) * (8 + rnd(i, 33) * 14)) % 1080;
            return <circle key={i} cx={x + 20 * Math.sin(T * 0.4 + i)} cy={y} r={1 + rnd(i, 34) * 2.2} fill="#dfe8ff" opacity={0.35 * cold * rnd(i, 35)} />;
          })}
        </svg>
      </AbsoluteFill>
      {age > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: easeOut(prog(T, b(96) + 0.2, b(97))), fontFamily: EN, fontWeight: 700, fontSize: 150, letterSpacing: '0.04em', color: year >= 1938 ? GOLD : 'rgba(243,237,226,0.85)', fontVariantNumeric: 'lining-nums tabular-nums', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>{year}</div>
      )}
      <SubBand />
      <Subs T={T} lines={LINES_S2B} />
    </AbsoluteFill>
  );
};
