import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Globe, C, worldOf, project } from './globe';
import { b, prog, easeOut, easeIn, easeInOut, lerp, hit, pop, rnd, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';

/* S0 cold open (b0–b16) + S1 hook (b16–b40).
   S0: the night Earth turns; each of the 215 countries and territories carries its real population (World Bank 2025).
       On "第一位" the first digits brighten.
   S1: the numbers leave the globe one by one and drop as squares into nine tubes by first digit, on their own
       clock (slow, then quicker; not on the beat). A dashed line marks the intuition "each gets a ninth" (≈24).
       The drop (b32) lands the answer: 65 vs 9. */
export const S01_IN = 0, S01_OUT = b(40);

const SPIN = (T: number) => -88 + 3.2 * T; // South Asia first, Africa and Europe turn in
const KEYS: Key[] = [
  [0, [0.6, 1.4, 13.5], [0.3, 0.9, 0]],
  [b(16), [0, 1.0, 24.5], [0, -0.9, 0]],
  [b(30), [0, 6.0, 40], [0, 2.5, 0]],
  [b(40), [0, 6.0, 44], [0, 2.5, 0]],
];

export const LINES_S01: Line[] = [
  [b(1) + 0.05, b(8) - 0.1, '全世界215个国家和地区，', 'There are 215 countries and territories.'],
  [b(8) + 0.05, b(16) - 0.1, '随便挑一个人口数——第一位最可能是几？', 'Pick any population. What is its most likely first digit?'],
  [b(16) + 0.05, b(24) - 0.1, '直觉：1到9，{各占一份}。', 'Intuition says each digit gets an equal share.'],
  [b(24) + 0.05, b(32) - 0.1, '数一数。', 'Count them.'],
  [b(32) + 0.05, b(40) - 0.15, '[65]个以1开头，只有[9]个以9开头。', '65 start with 1. Only 9 start with 9.'],
];

// ---- the tubes (screen space)
export const TUBE = { x0: 960 - 4 * 132, gap: 132, bot: 776, sq: 18, pad: 4, cols: 3 };
export const tubeX = (d: number) => TUBE.x0 + (d - 1) * TUBE.gap;
const step = TUBE.sq + TUBE.pad;
export const slotXY = (d: number, k: number) => {
  const col = k % TUBE.cols, row = Math.floor(k / TUBE.cols);
  return [tubeX(d) - step + col * step, TUBE.bot - 6 - step / 2 - row * step] as [number, number];
};

// departure order and times: a shuffled stream that starts slow and quickens (own clock, not the beat grid)
const ORDER = C.map((_, i) => i).sort((a, c) => rnd(a, 3) - rnd(c, 3));
const T0 = b(16) + 0.35, SPAN = b(30) - 0.6 - T0;
export const DEPART: number[] = new Array(C.length);
export const SLOT: number[] = new Array(C.length);
{
  const seen = new Array(10).fill(0);
  ORDER.forEach((ci, k) => {
    DEPART[ci] = T0 + SPAN * Math.pow((k + 0.5) / C.length, 0.62);
    SLOT[ci] = seen[C[ci].d]++;
  });
}
const FLY = 0.75;
export const COUNT = (d: number) => C.filter((c) => c.d === d).length;

const fmt = (n: number) => n.toLocaleString('en-US');

/** the screen position of country i on the globe at T (and whether it faces us) */
const onGlobe = (i: number, T: number) => project(KEYS, T, worldOf(C[i].lat, C[i].lon, SPIN(T), 5.12));

export const S01: React.FC<{ T: number }> = ({ T }) => {
  if (T < S01_IN || T > S01_OUT) return null;
  const firstDigit = easeOut(prog(T, b(9) + 0.4, b(10) + 0.4)); // "第一位": first digits brighten
  const globeDim = 1 - 0.82 * easeInOut(prog(T, b(16) - 0.2, b(18) + 0.4));
  const drop = hit(T, b(32), 0.18);
  const punch = 1 + 0.025 * drop;
  const toTitle = easeInOut(prog(T, b(38), b(39) + 0.2)); // the tubes hand over to the title card's bars
  const lineO = easeOut(prog(T, b(16) + 0.4, b(17) + 0.4)) * (1 - 0.65 * easeOut(prog(T, b(32), b(33))));
  const tubesO = easeOut(prog(T, b(16), b(17))) * (1 - toTitle);
  return (
    <AbsoluteFill style={{ backgroundColor: '#03050a' }}>
    <AbsoluteFill style={{ transform: `scale(${punch})` }}>
      <AbsoluteFill style={{ opacity: globeDim * (1 - toTitle) }}>
        <Globe T={T} keys={KEYS} spin={SPIN(T)} pin={0.03} lit={(i) => (T < DEPART[i] ? 1 : 0.25)} glow={1.6} ambient={0.32} />
      </AbsoluteFill>
      {/* S0: population labels on the globe */}
      {T < b(30) &&
        C.map((c, i) => {
          if (T > DEPART[i] + 0.05) return null;
          const p = onGlobe(i, T);
          const appear = easeOut(prog(T, 0.3 + rnd(i, 1) * 5.5, 0.9 + rnd(i, 1) * 5.5));
          const o = appear * Math.max(0, Math.min(1, (p.facing - 0.18) / 0.25)) * (1 - easeInOut(prog(T, b(16) - 0.2, b(18))));
          if (o <= 0.01) return null;
          if (i > 110) return null; // the 110 largest carry a label (≥ 18 px); every country keeps its light
          const size = 18 + 12 * Math.min(1, Math.log10(c.pop) / 9.2) ** 4;
          const s = fmt(c.pop);
          return (
            <div key={c.code} style={{ position: 'absolute', left: p.x + 5, top: p.y - size * 0.62, opacity: o, fontFamily: EN, fontWeight: 600, fontSize: size, color: 'rgba(243,237,226,0.86)', whiteSpace: 'nowrap', fontVariantNumeric: 'lining-nums', textShadow: '0 1px 6px rgba(0,0,0,0.95)' }}>
              <span style={{ color: firstDigit > 0 ? `rgba(246,207,120,${0.86 + 0.14 * firstDigit})` : undefined, fontSize: size * (1 + 0.35 * firstDigit), fontWeight: 700 }}>{s[0]}</span>
              {s.slice(1)}
            </div>
          );
        })}
      {/* S1: nine tubes */}
      {tubesO > 0.01 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: tubesO }}>
          {Array.from({ length: 9 }, (_, k) => {
            const d = k + 1, x = tubeX(d);
            const n = C.filter((c, i) => c.d === d && T >= DEPART[i] + FLY).length;
            const win = d === 1 || d === 9;
            return (
              <g key={d}>
                <rect x={x - step * 1.5 - 6} y={TUBE.bot - 22 * step - 14} width={step * 3 + 12} height={22 * step + 14} rx={12} fill="rgba(243,237,226,0.035)" stroke="rgba(243,237,226,0.28)" strokeWidth={2} />
                <text x={x} y={TUBE.bot + 46} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: win && T >= b(32) ? GOLD : INK, fontVariantNumeric: 'lining-nums' }}>{d}</text>
                {/* running count above each tube; the 1 and the 9 slam on the drop */}
                {T < b(32) ? (
                  <text x={x} y={TUBE.bot - 22 * step - 30} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 30, fill: 'rgba(243,237,226,0.7)', fontVariantNumeric: 'lining-nums tabular-nums' }}>{n}</text>
                ) : (
                  <text x={x} y={TUBE.bot - 22 * step - 30} textAnchor="middle" transform={`translate(${x},${TUBE.bot - 22 * step - 44}) scale(${win ? 0.6 + 0.9 * pop(T, b(32), 0.3) : 1}) translate(${-x},${-(TUBE.bot - 22 * step - 44)})`}
                    style={{ fontFamily: EN, fontWeight: 700, fontSize: win ? 64 : 30, fill: d === 1 ? GOLD : win ? INK : 'rgba(243,237,226,0.45)', fontVariantNumeric: 'lining-nums' }}>{n}</text>
                )}
              </g>
            );
          })}
          {/* the intuition: each digit a ninth (215 / 9 ≈ 24 squares = 8 rows) */}
          <g opacity={lineO}>
            <line x1={tubeX(1) - 70} x2={tubeX(9) + 70} y1={TUBE.bot - 6 - 8 * step} y2={TUBE.bot - 6 - 8 * step} stroke="#ff6a5c" strokeWidth={3} strokeDasharray="12 9" />
            <text x={tubeX(9) + 82} y={TUBE.bot - 6 - 8 * step + 9} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 26, fill: '#ff8a7e' }}>各占一份 ≈ 24</text>
          </g>
          {/* squares in place */}
          {C.map((c, i) => {
            const t = (T - DEPART[i]) / FLY;
            if (t < 1) return null;
            const [x, y] = slotXY(c.d, SLOT[i]);
            const gold = c.d === 1 && T >= b(32) + SLOT[i] * 0.008;
            return <rect key={c.code} x={x - TUBE.sq / 2} y={y - TUBE.sq / 2} width={TUBE.sq} height={TUBE.sq} rx={3} fill={gold ? GOLD : c.d === 9 && T >= b(32) ? INK : 'rgba(233,226,210,0.82)'} />;
          })}
        </svg>
      )}
      {/* squares in flight: from the label's spot on the globe to their slot */}
      {T >= T0 && T < b(30) + 0.5 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {C.map((c, i) => {
            const t = (T - DEPART[i]) / FLY;
            if (t < 0 || t >= 1) return null;
            const p0 = onGlobe(i, DEPART[i]);
            const from: [number, number] = p0.facing > 0 ? [p0.x, p0.y] : [960 + (rnd(i, 5) - 0.5) * 700, 160];
            const to = slotXY(c.d, SLOT[i]);
            const e = easeInOut(t);
            const x = lerp(from[0], to[0], e), y = lerp(from[1], to[1], e) - 120 * Math.sin(Math.PI * e);
            const s = lerp(10, TUBE.sq, e);
            return (
              <g key={c.code}>
                <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={3} fill="rgba(246,231,190,0.95)" />
                {t < 0.45 && <text x={x + 10} y={y + 5} style={{ fontFamily: EN, fontWeight: 700, fontSize: 18, fill: GOLD, opacity: 1 - t / 0.45 }}>{String(c.pop)[0]}</text>}
              </g>
            );
          })}
        </svg>
      )}
      <AbsoluteFill style={{ backgroundColor: '#fff6dc', opacity: 0.22 * drop }} />
    </AbsoluteFill>
      <SubBand />
      <Chapter T={T} at={b(16) + 0.4} out={b(40)} text="世 界 银 行 · 2025 年 人 口 · 215 个 国 家 和 地 区" />
      <Subs T={T} lines={LINES_S01} />
    </AbsoluteFill>
  );
};
