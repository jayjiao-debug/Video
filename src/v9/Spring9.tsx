import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, win, SANS, MONO, AMBER, WHITE, DIMW, Hud } from './kit9';

/* 《越修越堵》 the 1991 Nature springs (Cohen & Horowitz): cut the short string and the weight rises.
   Neon line drawing. Units: metres-ish, drawn with a small visual rest length s0 so springs have a body. */
export const SP_IN = b(123.8), SP_OUT = b(173.8);
const CUT = b(156), DROP = b(160);
const easeIn2 = (x: number) => x * x;
const S = 340, X0 = 960, Y0 = 110, s0 = 0.1;

const coil = (x1: number, y1: number, x2: number, y2: number, n = 9, amp = 19) => {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, px = -uy, py = ux;
  const lead = Math.min(10, len * 0.12);
  const pts: string[] = [`${x1},${y1}`, `${x1 + ux * lead},${y1 + uy * lead}`];
  const body = len - 2 * lead;
  for (let i = 0; i <= n * 2; i++) {
    const t = i / (n * 2), s = i === 0 || i === n * 2 ? 0 : i % 2 ? 1 : -1;
    pts.push(`${x1 + ux * (lead + body * t) + px * amp * s},${y1 + uy * (lead + body * t) + py * amp * s}`);
  }
  pts.push(`${x2},${y2}`);
  return pts.join(' ');
};
const bow = (x1: number, y1: number, x2: number, y2: number, k: number) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  return `M ${x1} ${y1} Q ${mx + nx * k} ${my + ny * k} ${x2} ${y2}`;
};
const px = (u: number) => X0 + u * S;
const py = (u: number) => Y0 + u * S;

/** the apparatus. w = weight top (units); m = 0 before the cut .. 1 after (lateral spread); slack = safety-string bow */
const Rig: React.FC<{ w: number; m: number; cut: boolean; slack: number; hl: { springs?: number; string?: number; safety?: number; ghostString?: number }; draw: number; dx?: number; dim?: number; labels?: [string, string] }> =
  ({ w, m, cut, slack, hl, draw, dx = 0, dim = 1, labels }) => {
    const p1x = lerp(0, 0.12, m), p2x = lerp(0, -0.12, m);
    const p1y = w - 1.1, p2y = 1.1;
    const wl = lerp(0, -0.12, m), wr = lerp(0, 0.12, m);
    const sp = (a: number) => `rgba(255,236,210,${a})`;
    const springC = hl.springs ? `rgba(255,${lerp(236, 190, hl.springs) | 0},${lerp(210, 90, hl.springs) | 0},1)` : sp(1);
    const dash = (L: number) => ({ strokeDasharray: L, strokeDashoffset: L * (1 - draw) });
    return (
      <g transform={`translate(${dx} 0)`} opacity={dim}>
        {/* support */}
        <line x1={px(-0.62)} y1={Y0} x2={px(0.62)} y2={Y0} stroke={sp(0.9)} strokeWidth={4} style={dash(400)} />
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={px(-0.6 + i * 0.1)} y1={Y0} x2={px(-0.6 + i * 0.1) + 14} y2={Y0 - 16} stroke={sp(0.35 * draw)} strokeWidth={2} />)}
        {/* spring 1 */}
        <polyline points={coil(px(0), py(0), px(p1x), py(p1y))} fill="none" stroke={springC} strokeWidth={3} filter="url(#glow9)" style={dash(1600)} />
        {/* the short string, or its two loose ends */}
        {!cut ? (
          <line x1={px(0)} y1={py(p1y)} x2={px(0)} y2={py(p2y)} stroke={hl.ghostString ? `rgba(159,227,255,${0.6 + 0.4 * hl.ghostString})` : hl.string ? AMBER : sp(0.95)} strokeWidth={hl.string || hl.ghostString ? 4.5 : 3} filter="url(#glow9)" style={dash(200)} />
        ) : (
          <g opacity={0.45}>
            <path d={`M ${px(p1x)} ${py(p1y)} q 10 40 -6 ${0.22 * S}`} stroke={AMBER} strokeWidth={2.5} fill="none" />
            <path d={`M ${px(p2x)} ${py(p2y)} q -16 -10 -24 ${0.2 * S}`} stroke={AMBER} strokeWidth={2.5} fill="none" />
          </g>
        )}
        {/* spring 2 */}
        <polyline points={coil(px(p2x), py(p2y), px(wl), py(w))} fill="none" stroke={springC} strokeWidth={3} filter="url(#glow9)" style={dash(1600)} />
        {/* safety strings */}
        {(() => {
          const c = hl.safety ? `rgba(159,227,255,${0.55 + 0.45 * hl.safety})` : `rgba(159,227,255,${cut ? 0.95 : 0.55})`;
          return (
            <g filter="url(#glow9)">
              <path d={bow(px(-0.42), Y0, px(p2x), py(p2y), slack * S)} fill="none" stroke={c} strokeWidth={2.4} style={dash(900)} />
              <path d={bow(px(p1x), py(p1y), px(wr + 0.12 * (1 - m)), py(w), -slack * S)} fill="none" stroke={c} strokeWidth={2.4} style={dash(900)} />
            </g>
          );
        })()}
        {/* weight */}
        <g opacity={draw}>
          <rect x={px(-0.22)} y={py(w)} width={0.44 * S} height={0.22 * S} rx={8} fill="rgba(255,179,71,0.14)" stroke={AMBER} strokeWidth={3} filter="url(#glow9)" />
          <text x={px(0)} y={py(w + 0.135)} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 400, fontSize: 26, fill: '#ffe2bd', letterSpacing: '0.2em' }}>重物</text>
        </g>
        {labels && (
          <g style={{ fontFamily: MONO, fontSize: 19, letterSpacing: '0.04em' }}>
            <text x={px(p1x) + 34} y={py(p1y / 2) + 6} fill={DIMW}>{labels[0]}</text>
            <text x={px(p2x) - 34} y={py((p2y + w) / 2) + 6} textAnchor="end" fill={DIMW}>{labels[1]}</text>
          </g>
        )}
      </g>
    );
  };

export const SpringScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < SP_IN - 0.05 || T > SP_OUT + 0.05) return null;
  const o = Math.min(easeOut(prog(T, SP_IN, SP_IN + 0.6)), 1 - easeInOut(prog(T, b(172.6), SP_OUT)));
  const draw = easeInOut(prog(T, b(124.3), b(127.4)));
  const cut = T >= CUT;
  const tau = Math.max(0, T - CUT);
  const w = cut ? 1.45 + 0.25 * Math.exp(-1.6 * tau) * Math.cos(4.2 * tau) : 1.7;
  const m = cut ? easeOut(clamp(tau / 0.7)) : 0;
  const slack = cut ? 0.14 * (1 - easeOut(clamp(tau / 0.35))) : 0.14;
  const hl = {
    springs: win(T, b(134.2), b(137.2), 0.3, 0.4),
    string: win(T, b(136.6), b(139.6), 0.3, 0.3) + win(T, b(145), CUT, 0.3, 0.05),
    safety: win(T, b(139.6), b(144.8), 0.3, 0.4),
  };
  // tension: push in before the cut, relax on the drop
  const push = lerp(1, 1.08, easeInOut(prog(T, b(150), CUT))) * (cut ? lerp(1, 1 / 1.08, easeInOut(prog(T, DROP - 0.4, DROP + 0.6))) : 1);
  const compare = easeInOut(prog(T, b(164.8), b(166.4)));
  const ghostString = win(T, b(170.4), b(173.4), 0.4, 0.3);
  // scissors: slide in open, hold, snap shut on the cut, back off
  const scX = lerp(560, 95, easeInOut(prog(T, b(145.2), b(149.6)))) + 480 * easeInOut(prog(T, CUT + 0.25, CUT + 1.0));
  const scOpen = 22 + 4 * easeInOut(prog(T, b(149.6), CUT - 0.15)) - 26 * easeIn2(prog(T, CUT - 0.12, CUT));
  const scO = win(T, b(145.2), CUT + 1.0, 0.4, 0.5);
  const spark = cut ? clamp(tau / 0.35) : 0;
  const ref = win(T, b(145.6), b(170.6), 0.5, 0.5);
  const rise = easeOut(prog(T, DROP, DROP + 0.5));
  return (
    <AbsoluteFill style={{ backgroundColor: '#030409', opacity: o }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 55% 60% at 50% 45%, #0c1426 0%, #030409 75%)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="glow9" filterUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g transform={`translate(${X0} 300) scale(${push}) translate(${-X0} -300)`}>
          {/* ghost of the "before" rig for the comparison */}
          {compare > 0 && <Rig w={1.7} m={0} cut={false} slack={0.14} hl={{ ghostString }} draw={1} dx={-300 * compare} dim={0.5 * compare} labels={compare > 0.6 ? ['扛 0.5 N', '扛 0.5 N'] : undefined} />}
          <Rig w={w} m={m} cut={cut} slack={slack} hl={hl} draw={draw} dx={260 * compare} labels={compare > 0.6 ? ['扛 0.25 N', '扛 0.25 N'] : undefined} />
          {/* the original height */}
          {ref > 0 && (
            <g opacity={ref * (1 - compare)}>
              <line x1={px(-0.85)} y1={py(1.7)} x2={px(0.85)} y2={py(1.7)} stroke="rgba(243,241,236,0.5)" strokeWidth={1.5} strokeDasharray="8 8" />
              <text x={px(0.9)} y={py(1.7) + 7} style={{ fontFamily: SANS, fontWeight: 300, fontSize: 22, fill: DIMW, letterSpacing: '0.15em' }}>原来的高度</text>
            </g>
          )}
          {rise > 0 && (
            <g opacity={rise * (1 - compare)}>
              <line x1={px(-0.5)} y1={py(1.7)} x2={px(-0.5)} y2={py(w) + 4} stroke={AMBER} strokeWidth={3} />
              <path d={`M ${px(-0.5) - 12} ${py(w) + 18} L ${px(-0.5)} ${py(w)} L ${px(-0.5) + 12} ${py(w) + 18}`} stroke={AMBER} strokeWidth={3} fill="none" />
              <text x={px(-0.56)} y={py(1.58)} textAnchor="end" style={{ fontFamily: MONO, fontSize: 24, fill: AMBER }}>1.50 m → 1.25 m</text>
            </g>
          )}
          {/* scissors */}
          {scO > 0 && (
            <g filter="url(#glow9)"><g opacity={scO} transform={`translate(${px(0) + scX} ${py(0.85)})`}>
              {[1, -1].map((sg) => (
                <g key={sg} transform={`rotate(${sg * scOpen})`}>
                  <path d={`M 8 ${-10 * sg} C -40 ${-15 * sg}, -112 ${-10 * sg}, -154 ${1 * sg} L 8 ${4 * sg} Z`} fill="rgba(210,236,255,0.16)" stroke="#e8f6ff" strokeWidth={2.4} strokeLinejoin="round" />
                  <path d={`M 4 ${4 * sg} L 50 ${24 * -sg}`} stroke="#9fe3ff" strokeWidth={5} strokeLinecap="round" />
                  <ellipse cx={78} cy={36 * -sg} rx={27} ry={18} transform={`rotate(${22 * -sg} 78 ${36 * -sg})`} fill="none" stroke="#9fe3ff" strokeWidth={5} />
                </g>
              ))}
              <circle r={6} fill="#030409" stroke="#e8f6ff" strokeWidth={2.4} />
            </g></g>
          )}
          {cut && spark < 1 && (
            <g transform={`translate(${px(0)} ${py(0.85)})`} opacity={1 - spark}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2 + 0.3, r0 = 10 + 50 * spark, r1 = r0 + 26 * (1 - spark);
                return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke="#fff1d6" strokeWidth={2.5} strokeLinecap="round" />;
              })}
            </g>
          )}
        </g>
      </svg>
      {compare > 0.3 && (
        <>
          <Hud x={X0 - 300} y={50} o={easeOut(prog(T, b(165.4), b(166.6)))} align="center" size={22}>剪断前 · 串联</Hud>
          <Hud x={X0 + 260} y={50} o={easeOut(prog(T, b(165.4), b(166.6)))} align="center" size={22} color={AMBER}>剪断后 · 并联</Hud>
        </>
      )}
      <Hud x={1860} y={120} o={win(T, b(128.2), b(164.6), 0.5, 0.4)} align="right" color={WHITE} size={22}>NATURE · 1991</Hud>
      <Hud x={1860} y={156} o={win(T, b(128.4), b(164.6), 0.5, 0.4)} align="right" size={17}>Joel Cohen &amp; Paul Horowitz</Hud>
      {T > CUT && T < CUT + 0.07 && <AbsoluteFill style={{ background: 'rgba(255,244,228,0.1)' }} />}
      {T > DROP && T < DROP + 0.5 && <AbsoluteFill style={{ background: `rgba(255,190,110,${0.22 * Math.exp(-(T - DROP) * 8)})` }} />}
    </AbsoluteFill>
  );
};
