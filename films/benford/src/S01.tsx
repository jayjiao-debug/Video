import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Globe, C, worldOf, project, spinFor } from './globe';
import { b, prog, easeOut, easeInOut, lerp, hit, pop, rnd, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';

/* Cold open + hook, b0–b32 (16.6 s; the title lands on the drop).
   b0–b8   the lit Earth; eight large countries show their real population (World Bank 2025), one at a time.
   b8      (4.4 s, a full-strength accent) every country leaves the globe as a small square and drops into one of
           nine tubes by its first digit, on its own clock: slow at first, then quicker (not on the beat).
           A dashed line marks the intuition "each digit a ninth" (≈24).
   b24     (12.5 s accent) the answer lands: 65 vs 9.  b30–b32 the squares fuse into bars for the title card. */
export const S01_IN = 0, S01_OUT = b(32);

const FACE = 92; // degrees east: South and East Asia face the camera
const SPIN = (T: number) => spinFor(FACE) + 2.2 * T;
const KEYS: Key[] = [
  [0, [0.4, 1.6, 15.5], [0.4, 1.0, 0]],
  [b(8), [0, 1.4, 21], [0, 0.3, 0]],
  [b(16), [0, 5, 34], [0, 3, 0]],
  [b(32), [0, 5, 36], [0, 3, 0]],
];

// seven countries spread over the visible face; [dx, dy] nudges the label away from its neighbours
const NAMED: [string, number, number][] = [['IND', -10, 10], ['CHN', -40, -30], ['IDN', 0, 20], ['JPN', 10, -10], ['IRN', -150, -20], ['THA', -120, 40], ['PHL', 20, 10]];
const LABEL_AT = (k: number) => 0.5 + k * 0.42; // one after another through the first line

export const LINES_S01: Line[] = [
  [b(0) + 0.35, b(8) - 0.08, '随便挑一个国家的人口，第一位最可能是几？', "Pick any country's population. What is its most likely first digit?"],
  [b(8) + 0.06, b(16) - 0.1, '直觉：1到9，{各占一份}。', 'Intuition says each digit gets an equal share.'],
  [b(16) + 0.06, b(24) - 0.1, '全世界215个国家和地区，数一数——', 'Count all 215 countries and territories.'],
  [b(24) + 0.06, b(32) - 0.12, '[65]个以1开头，只有[9]个以9开头。', '65 start with 1. Only 9 start with 9.'],
];

// ---- the tubes (screen space)
export const TUBE = { x0: 960 - 4 * 132, gap: 132, bot: 776, sq: 18, pad: 4, cols: 3 };
export const tubeX = (d: number) => TUBE.x0 + (d - 1) * TUBE.gap;
const step = TUBE.sq + TUBE.pad;
export const slotXY = (d: number, k: number) => {
  const col = k % TUBE.cols, row = Math.floor(k / TUBE.cols);
  return [tubeX(d) - step + col * step, TUBE.bot - 6 - step / 2 - row * step] as [number, number];
};

// departures: a shuffled stream that starts slow and quickens (its own clock, not the beat grid)
const ORDER = C.map((_, i) => i).sort((a, c) => rnd(a, 3) - rnd(c, 3));
const T0 = b(8) + 0.25, SPAN = b(22) - T0;
export const DEPART: number[] = new Array(C.length);
export const SLOT: number[] = new Array(C.length);
{
  const seen = new Array(10).fill(0);
  ORDER.forEach((ci, k) => {
    DEPART[ci] = T0 + SPAN * Math.pow((k + 0.5) / C.length, 0.6);
    SLOT[ci] = seen[C[ci].d]++;
  });
}
const FLY = 0.7;
export const COUNT = (d: number) => C.filter((c) => c.d === d).length;
const fmt = (n: number) => n.toLocaleString('en-US');
const onGlobe = (i: number, T: number) => project(KEYS, T, worldOf(C[i].lat, C[i].lon, SPIN(T), 5.05));

export const S01: React.FC<{ T: number }> = ({ T }) => {
  if (T < S01_IN || T > S01_OUT) return null;
  const globeDim = 1 - 0.85 * easeInOut(prog(T, b(8), b(12)));
  const answer = hit(T, b(24), 0.18);
  const push = 1 + 0.05 * easeInOut(prog(T, b(24), b(32))) + 0.02 * answer; // a slow push after the answer, so the hold isn't frozen
  const toTitle = easeInOut(prog(T, b(30), b(31) + 0.2));
  const lineO = easeOut(prog(T, b(8) + 0.4, b(9) + 0.4)) * (1 - 0.65 * easeOut(prog(T, b(24), b(25))));
  const tubesO = easeOut(prog(T, b(8), b(9))) * (1 - toTitle);
  return (
    <AbsoluteFill style={{ backgroundColor: '#02040a' }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill style={{ opacity: 1 - toTitle }}>
          <Globe T={T} keys={KEYS} spin={SPIN(T)} dim={globeDim} />
        </AbsoluteFill>
        {/* b0–b8: eight countries, named, with their real population */}
        {T < b(9) &&
          NAMED.map(([code, dx, dy], k) => {
            const i = C.findIndex((c) => c.code === code);
            const c = C[i];
            const p = onGlobe(i, T);
            const o = easeOut(prog(T, LABEL_AT(k), LABEL_AT(k) + 0.35)) * (1 - easeInOut(prog(T, b(8) - 0.1, b(8) + 0.5))) * Math.min(1, Math.max(0, (p.facing - 0.1) / 0.2));
            if (o <= 0.01) return null;
            const s = fmt(c.pop);
            const lift = (1 - easeOut(prog(T, LABEL_AT(k), LABEL_AT(k) + 0.4))) * 10;
            return (
              <div key={code} style={{ position: 'absolute', left: p.x, top: p.y, opacity: o }}>
                <div style={{ position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: 5, background: GOLD, boxShadow: '0 0 12px rgba(246,207,120,0.9)' }} />
                {(dx !== 0 || dy !== 0) && <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}><line x1={0} y1={0} x2={dx + 10} y2={dy + 4} stroke="rgba(246,207,120,0.6)" strokeWidth={1.5} /></svg>}
                <div style={{ position: 'absolute', left: 14 + dx, top: -34 + dy + lift, whiteSpace: 'nowrap' }}>
                <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 22, color: 'rgba(243,237,226,0.75)', textShadow: '0 1px 8px #000' }}>{c.zh}</div>
                <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, lineHeight: 1, color: INK, whiteSpace: 'nowrap', fontVariantNumeric: 'lining-nums', textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}>
                  <span style={{ color: GOLD }}>{s[0]}</span>{s.slice(1)}
                </div>
                </div>
              </div>
            );
          })}
        {/* nine tubes */}
        {tubesO > 0.01 && (
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: tubesO }}>
            {Array.from({ length: 9 }, (_, k) => {
              const d = k + 1, x = tubeX(d);
              const n = C.filter((c, i) => c.d === d && T >= DEPART[i] + FLY).length;
              const win = d === 1 || d === 9;
              const top = TUBE.bot - 22 * step - 14;
              return (
                <g key={d}>
                  <rect x={x - step * 1.5 - 6} y={top} width={step * 3 + 12} height={22 * step + 14} rx={12} fill="rgba(243,237,226,0.035)" stroke="rgba(243,237,226,0.28)" strokeWidth={2} />
                  <text x={x} y={TUBE.bot + 46} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: win && T >= b(24) ? (d === 1 ? GOLD : INK) : 'rgba(243,237,226,0.8)', fontVariantNumeric: 'lining-nums' }}>{d}</text>
                  {T < b(24) ? (
                    <text x={x} y={top - 16} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 30, fill: 'rgba(243,237,226,0.7)', fontVariantNumeric: 'lining-nums tabular-nums' }}>{n}</text>
                  ) : (
                    <text x={x} y={top - 16} textAnchor="middle" transform={`translate(${x},${top - 30}) scale(${win ? 0.6 + 0.9 * pop(T, b(24), 0.3) : 1}) translate(${-x},${-(top - 30)})`}
                      style={{ fontFamily: EN, fontWeight: 700, fontSize: win ? 64 : 30, fill: d === 1 ? GOLD : win ? INK : 'rgba(243,237,226,0.42)', fontVariantNumeric: 'lining-nums' }}>{n}</text>
                  )}
                </g>
              );
            })}
            <g opacity={lineO}>
              <line x1={tubeX(1) - 70} x2={tubeX(9) + 70} y1={TUBE.bot - 6 - 8 * step} y2={TUBE.bot - 6 - 8 * step} stroke="#ff6a5c" strokeWidth={3} strokeDasharray="12 9" />
              <text x={tubeX(9) + 82} y={TUBE.bot - 6 - 8 * step + 9} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 26, fill: '#ff8a7e' }}>各占一份 ≈ 24</text>
            </g>
            {C.map((c, i) => {
              if (T < DEPART[i] + FLY) return null;
              const [x, y] = slotXY(c.d, SLOT[i]);
              const gold = c.d === 1 && T >= b(24) + SLOT[i] * 0.008;
              return <rect key={c.code} x={x - TUBE.sq / 2} y={y - TUBE.sq / 2} width={TUBE.sq} height={TUBE.sq} rx={3} fill={gold ? GOLD : c.d === 9 && T >= b(24) ? INK : 'rgba(233,226,210,0.82)'} />;
            })}
          </svg>
        )}
        {/* squares in flight, from the country's spot on the globe to its slot */}
        {T >= T0 && T < b(23) && (
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            {C.map((c, i) => {
              const t = (T - DEPART[i]) / FLY;
              if (t < 0 || t >= 1) return null;
              const p0 = onGlobe(i, DEPART[i]);
              const from: [number, number] = p0.facing > 0 ? [p0.x, p0.y] : [960 + (rnd(i, 5) - 0.5) * 520, 120];
              const to = slotXY(c.d, SLOT[i]);
              const e = easeInOut(t);
              const x = lerp(from[0], to[0], e), y = lerp(from[1], to[1], e) - 90 * Math.sin(Math.PI * e);
              const s = lerp(8, TUBE.sq, e);
              return <rect key={c.code} x={x - s / 2} y={y - s / 2} width={s} height={s} rx={3} fill="rgba(246,231,190,0.95)" />;
            })}
          </svg>
        )}
        <AbsoluteFill style={{ backgroundColor: '#fff6dc', opacity: 0.2 * answer }} />
      </AbsoluteFill>
      <SubBand />
      <Chapter T={T} at={b(16)} out={b(31)} text="世 界 银 行 · 2025 年 人 口 · 215 个 国 家 和 地 区" />
      <Subs T={T} lines={LINES_S01} />
    </AbsoluteFill>
  );
};
