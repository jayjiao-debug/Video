import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CUT, SANS, MONO, prog, easeOut, easeInOut, expoInOut, lerp, rnd, pop, hit, clamp } from './lib';
import { stageStyle } from './camera';
import { useLook, Look } from './look';
import data from './points.json';

/* Stage A (0 → CUT.atus): the dating pool, the title, and the whole square.
   0–8.1   your pool only (the 229 people you'd date), zoomed in; a falling trend line: the better-looking, the worse.
   8.1     title 《筛子》 slams on the first drop over the dimmed plot.
   12.4    the camera pulls out to the whole square; 18.4 the other 771 people appear: r = 0.00.
   23.8    the cut (x + y ≥ threshold) is drawn; 26.2 everyone under it swipes away (card) / is rubbed out (paper);
   29.6    r runs 0.00 → −0.64.
   33.7    why: the upper-left (plain but kind), then the ghosts of the plain-and-mean you never met, then the line = 筛子. */

type P = [number, number, number];
const PTS = data.pts as P[];
export const R_ALL = data.r_all, R_KEPT = data.r_kept, N_KEPT = data.kept;
const THR = (data.thr + 6) / 6; // kept: X + Y > THR in normalised units

// plot geometry (stage px)
const PX0 = 560, PS = 660, PY1 = 860;
const sx = (X: number) => PX0 + X * PS;
const sy = (Y: number) => PY1 - Y * PS;
const PC: [number, number] = [sx(0.5), sy(0.5)];

const fit = (pts: P[]) => {
  const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
  let sxy = 0, sxx = 0;
  for (const p of pts) { sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) ** 2; }
  return { mx, my, b: sxy / sxx };
};
const KEPT = PTS.filter((p) => p[2]);
const FK = fit(KEPT), FA = fit(PTS);
const KC: [number, number] = [sx(FK.mx), sy(FK.my)];

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };

/** plot camera: zoom z about plot point (cx, cy) brought to screen point (tx, ty) */
const camAt = (T: number) => {
  const keys: [number, number, number, number][] = [ // [time, z, cx, cy]
    [0, 1.45, KC[0] + 30, KC[1] - 20], [12.4, 1.45, KC[0] + 40, KC[1] - 26], [14.2, 1, PC[0], PC[1]],
    [33.7, 1, PC[0], PC[1]], [34.6, 1.55, sx(0.47), sy(0.84)], [40.3, 1.55, sx(0.5), sy(0.8)], [41.2, 1.45, sx(0.32), sy(0.32)],
    [43.1, 1.45, sx(0.3), sy(0.34)], [44.0, 1, PC[0], PC[1]],
  ];
  let k = 0;
  while (k < keys.length - 1 && T >= keys[k + 1][0]) k++;
  const a = keys[k], b = keys[Math.min(k + 1, keys.length - 1)];
  const u = b[0] > a[0] ? expoInOut(prog(T, a[0], b[0])) : 0;
  const isMove = (b[0] - a[0]) < 2.5; // short spans are moves, long spans are holds with drift
  const e = isMove ? u : 0;
  const drift = isMove ? 0 : Math.sin(T * 0.35) * 6;
  return { z: lerp(a[1], b[1], e), cx: lerp(a[2], b[2], e) + drift, cy: lerp(a[3], b[3], e) };
};

const Person: React.FC<{ L: Look; x: number; y: number; col: string; o: number; s?: number; rot?: number; dx?: number }> = ({ L, x, y, col, o, s = 1, rot = 0, dx = 0 }) => {
  if (o <= 0.01) return null;
  if (L.id === 'card') {
    return (
      <g transform={`translate(${x + dx} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
        <rect x={-5} y={-6.5} width={10} height={13} rx={2.4} fill={col} />
        <circle cx={0} cy={-1.6} r={2.1} fill="rgba(20,8,22,0.55)" />
      </g>
    );
  }
  return <circle cx={x + dx} cy={y} r={4.6 * s} fill={col} opacity={o} />;
};

export const StageA: React.FC<{ T: number }> = ({ T }) => {
  const L = useLook();
  const st = stageStyle(T, 0, CUT.atus, [0, 0]);
  if (!st) return null;
  const cam = camAt(T);
  const tx = 900, ty = 520;
  const camT = `translate(${tx} ${ty}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`;

  const others = easeOut(prog(T, 18.4, 18.9));
  const neutral = easeInOut(prog(T, 18.4, 19.2)) * (1 - easeInOut(prog(T, 26.2, 27.0)));
  const cutLine = easeOut(prog(T, 23.8, 24.8));
  const sieve = easeOut(prog(T, 43.1, 43.7));
  const ghosts = easeOut(prog(T, 40.3, 41.0)) * (1 - prog(T, 44.6, 45.4));
  const axes = easeOut(prog(T, 12.6, 13.6));

  // trend lines: the pool's (hook), the flat one (all), then it tilts to the pool's again
  const hookLine = easeOut(prog(T, 3.0, 4.4)) * (1 - prog(T, 12.0, 12.6));
  const flat = easeOut(prog(T, 20.8, 21.6));
  const tilt = easeInOut(prog(T, 29.7, 30.9));
  const lineB = lerp(FA.b, FK.b, tilt), lineMx = lerp(FA.mx, FK.mx, tilt), lineMy = lerp(FA.my, FK.my, tilt);
  const lx0 = tilt > 0 ? lerp(0.05, 0.25, tilt) : 0.05, lx1 = 0.95;
  const showFull = flat > 0 && T < 45.8;

  const people = PTS.map((p, i) => {
    const [X, Y, keep] = p;
    const x = sx(X), y = sy(Y);
    if (keep) {
      const inK = easeOut(prog(T, 0.1 + rnd(i, 5) * 2.2, 0.35 + rnd(i, 5) * 2.2));
      const col = neutral > 0.5 ? L.pointOut : L.pointIn;
      const hi = T > 33.7 && T < 40.3 && X < 0.5 && Y > 0.62 ? 1 + 0.5 * easeOut(prog(T, 34.6, 35.2)) : 1;
      return <Person key={i} L={L} x={x} y={y} col={col} o={inK} s={hi} />;
    }
    const inO = others * easeOut(prog(T, 18.4 + rnd(i, 6) * 1.8, 18.7 + rnd(i, 6) * 1.8));
    // rejection: the ones nearest the line go last
    const dist = THR - (X + Y);
    const r0 = 26.3 + clamp(1 - dist / 0.9) * 1.9 + rnd(i, 8) * 0.25;
    const out = easeInOut(prog(T, r0, r0 + 0.45));
    if (L.id === 'card') {
      const o = inO * (1 - out) + ghosts * 0.28;
      return <Person key={i} L={L} x={x} y={y} col={L.pointOut} o={o} dx={-260 * out * (1 - ghosts)} rot={-28 * out * (1 - ghosts)} />;
    }
    const o = inO * (1 - 0.85 * out) + ghosts * 0.2;
    return <Person key={i} L={L} x={x} y={y} col={L.pointOut} o={o} s={1 - 0.3 * out} />;
  });

  // the cut: X + Y = THR inside the unit square
  const cA: [number, number] = [sx(THR - 1), sy(1)], cB: [number, number] = [sx(1), sy(THR - 1)];
  const cutLen = Math.hypot(cB[0] - cA[0], cB[1] - cA[1]);
  const lineW = 3 + 5 * sieve;

  // readout panel (screen space, right)
  const rShown = T < 29.7 ? R_ALL : lerp(R_ALL, R_KEPT, easeInOut(prog(T, 29.7, 31.0)));
  const count = T < 26.3 ? 1000 : Math.round(lerp(1000, N_KEPT, easeInOut(prog(T, 26.3, 28.6))));
  const panel = easeOut(prog(T, 20.9, 21.4));
  const rPop = pop(T, 21.0, 0.3), rHit = hit(T, 31.0, 0.25);
  const titleDim = 1 - 0.85 * easeInOut(prog(T, CUT.title - 0.2, CUT.title + 0.15)) * (1 - easeInOut(prog(T, CUT.intro - 0.25, CUT.intro + 0.2)));

  return (
    <AbsoluteFill style={st}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <g opacity={titleDim}>
          <g transform={camT}>
            {/* axes */}
            <g opacity={axes}>
              <line x1={PX0} y1={PY1} x2={PX0 + PS + 30} y2={PY1} stroke={L.dim} strokeWidth={2} />
              <line x1={PX0} y1={PY1} x2={PX0} y2={PY1 - PS - 30} stroke={L.dim} strokeWidth={2} />
              <path d={`M ${PX0 + PS + 30} ${PY1} l -12 -7 l 0 14 z`} fill={L.dim} />
              <path d={`M ${PX0} ${PY1 - PS - 30} l -7 12 l 14 0 z`} fill={L.dim} />
              <text x={PX0 + PS + 20} y={PY1 + 44} textAnchor="end" style={{ ...BLACK, fontSize: 34, fill: L.ink }}>颜值 →</text>
              <text x={PX0 - 22} y={PY1 - PS + 10} textAnchor="end" style={{ ...BLACK, fontSize: 34, fill: L.ink }}>性格</text>
              <text x={PX0 - 22} y={PY1 - PS + 48} textAnchor="end" style={{ ...BLACK, fontSize: 34, fill: L.ink }}>↑</text>
            </g>
            {people}
            {/* the cut */}
            {cutLine > 0 && (
              <g>
                <line x1={cA[0]} y1={cA[1]} x2={cB[0]} y2={cB[1]} stroke={L.accent} strokeWidth={lineW} strokeLinecap="round"
                  strokeDasharray={sieve > 0 ? undefined : `${cutLen * cutLine} ${cutLen}`}
                  style={{ filter: L.dark ? `drop-shadow(0 0 ${6 + 10 * sieve}px ${L.accentGlow})` : undefined }} />
                {T > 24.4 && T < 33.6 && (
                  <text x={cB[0] + 14} y={cB[1] + 8} opacity={easeOut(prog(T, 24.4, 24.9))} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: L.accent }}>够格线</text>
                )}
              </g>
            )}
            {/* trend lines */}
            {hookLine > 0 && (() => {
              const x0 = 0.42, x1 = 0.98, y0 = FK.my + FK.b * (x0 - FK.mx), y1 = FK.my + FK.b * (x1 - FK.mx);
              const ex = lerp(x0, x1, hookLine), ey = lerp(y0, y1, hookLine);
              return <line x1={sx(x0)} y1={sy(y0)} x2={sx(ex)} y2={sy(ey)} stroke={L.second} strokeWidth={5} strokeLinecap="round" style={{ filter: L.dark ? `drop-shadow(0 0 8px ${L.secondGlow})` : undefined }} />;
            })()}
            {showFull && (() => {
              const y0 = lineMy + lineB * (lx0 - lineMx), y1 = lineMy + lineB * (lx1 - lineMx);
              const ex = lerp(lx0, lx1, flat), ey = lerp(y0, y1, flat);
              return <line x1={sx(lx0)} y1={sy(y0)} x2={sx(ex)} y2={sy(ey)} stroke={L.second} strokeWidth={5} strokeLinecap="round" opacity={0.95} style={{ filter: L.dark ? `drop-shadow(0 0 8px ${L.secondGlow})` : undefined }} />;
            })()}
            {/* why: labels in plot space */}
            {T > 34.6 && T < 40.6 && (
              <g opacity={easeOut(prog(T, 34.8, 35.3)) * (1 - prog(T, 40.0, 40.5))}>
                <rect x={sx(0.17)} y={sy(0.99)} width={sx(0.5) - sx(0.17)} height={sy(0.62) - sy(0.99)} rx={10} fill="none" stroke={L.accent} strokeWidth={2.5} strokeDasharray="8 6" />
                <text x={sx(0.17)} y={sy(0.99) - 14} style={{ ...BLACK, fontSize: 26, fill: L.accent }}>不够好看 → 性格得特别好</text>
              </g>
            )}
            {T > 40.6 && T < 45.0 && (
              <g opacity={easeOut(prog(T, 40.8, 41.3)) * (1 - prog(T, 44.4, 44.9))}>
                <rect x={sx(0.1)} y={sy(0.5) - 38} width={250} height={84} rx={10} fill={L.bg} opacity={0.82} />
                <text x={sx(0.12)} y={sy(0.5)} style={{ ...BLACK, fontSize: 28, fill: L.ink }}>又丑又坏</text>
                <text x={sx(0.12)} y={sy(0.5) + 34} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, fill: L.dim }}>早被划走，你从没见过</text>
              </g>
            )}
            {sieve > 0 && (
              <text x={cB[0] - 30} y={cB[1] - 40} textAnchor="end" opacity={sieve} style={{ ...BLACK, fontSize: 64, fill: L.accent }}>筛子</text>
            )}
          </g>
          {/* hook HUD (screen space) */}
          {T < 12.6 && (
            <g opacity={easeOut(prog(T, 0.1, 0.5)) * (1 - prog(T, 12.0, 12.6))}>
              <text x={110} y={130} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '0.2em', fill: L.dim }}>你的约会池</text>
              <text x={1810} y={1000 - 170} textAnchor="end" style={{ ...BLACK, fontSize: 40, fill: L.ink }}>颜值 →</text>
              <text x={110} y={200} style={{ ...BLACK, fontSize: 40, fill: L.ink }}>性格 ↑</text>
            </g>
          )}
          {/* readout panel */}
          {panel > 0 && T < 33.8 && (
            <g opacity={panel * (1 - prog(T, 33.4, 33.8))}>
              <text x={1360} y={280} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: L.dim }}>相关系数 r</text>
              <g transform={`translate(1360 400) scale(${0.85 + 0.15 * Math.min(1.1, rPop) + 0.08 * rHit})`}>
                <text x={0} y={0} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 120, fill: T > 29.7 ? L.accent : L.ink }}>{rShown < -0.005 ? '−' : ''}{Math.abs(rShown).toFixed(2)}</text>
              </g>
              <text x={1362} y={460} style={{ ...BLACK, fontSize: 36, fill: T > 30.9 ? L.accent : L.second }}>{T > 30.9 ? '强烈负相关' : '毫无关系'}</text>
              <text x={1360} y={590} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, fill: L.ink }}>{count}<tspan style={{ fontFamily: SANS, fontSize: 32 }}> 人</tspan></text>
              <text x={1362} y={630} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, fill: L.dim }}>{T > 26.3 ? '留在你视野里的' : '全部'}</text>
            </g>
          )}
          {T > 15.3 && T < 45.8 && (
            <text x={110} y={92} opacity={easeOut(prog(T, 15.4, 16))} style={{ fontFamily: SANS, fontSize: 20, fill: L.dim }}>模拟 1000 人 · 思想实验出自 Ellenberg《魔鬼数学》(2014)</text>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* the title card on the first drop: 《筛子》, a row of sieve holes as the underline */
export const TitleCard: React.FC<{ T: number; still?: boolean }> = ({ T, still }) => {
  const L = useLook();
  const a = CUT.title, z = CUT.intro;
  if (!still && (T < a - 0.05 || T > z + 0.35)) return null;
  const s = still ? 1 : pop(T, a, 0.22);
  const out = still ? 0 : easeInOut(prog(T, z - 0.1, z + 0.3));
  const k = (d: number, dur = 0.2) => (still ? 1 : easeOut(prog(T, a + d, a + d + dur)));
  const shake = still ? 0 : Math.sin(T * 90) * 6 * hit(T, a, 0.12);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translate(${shake}px, 0) scale(${1 + 0.6 * out})`, transformOrigin: '960px 500px' }}>
      <svg width={1920} height={1080}>
        <text x={960} y={330} textAnchor="middle" opacity={k(0.25, 0.3)} style={{ fontFamily: MONO, fontSize: 30, letterSpacing: '0.6em', fill: L.dim }}>BERKSON'S PARADOX</text>
        <g transform={`translate(960 560) scale(${1.25 - 0.25 * Math.min(1, s)}) translate(-960 -560)`} opacity={Math.min(1, s * 3)}>
          <text x={960} y={600} textAnchor="middle" style={{ ...BLACK, fontSize: 280, fill: L.ink, letterSpacing: '0.08em' }}>筛子</text>
        </g>
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx={960 - 250 + i * 50} cy={680} r={13} fill="none" stroke={L.accent} strokeWidth={5} opacity={k(0.12 + i * 0.03, 0.12)}
            style={{ filter: L.dark ? `drop-shadow(0 0 6px ${L.accentGlow})` : undefined }} />
        ))}
        <text x={960} y={770} textAnchor="middle" opacity={k(0.5, 0.3)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.5em', fill: L.dim }}>VIBE知识大赏</text>
      </svg>
    </AbsoluteFill>
  );
};
