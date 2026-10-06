import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CUT, SANS, MONO, prog, easeOut, easeIn, easeInOut, expoInOut, lerp, rnd, pop, hit, clamp } from './lib';
import { stageStyle } from './camera';
import { useLook, Look } from './look';
import { ProfileCard, AppButton, Phone, heart } from './ui';
import data from './points.json';

/* Stage A (0 → CUT.atus): swiping, the title, and the whole square.
   0–7.4   a dating app on a phone (left). Swipe right → the card flies into "你右滑过的人" (right, a tilted plot in
           3D) and becomes a dot; swipe left → it flies off with 划走. 5.3 the deck riffles, the pool fills; a
           falling trend line: the better-looking, the worse.
   8.1     title 《筛子》 on the first drop.
   10.2    the phone is flung away; the plot swings flat and fills the frame; 12.4 pull out to the whole square;
   18.4    the other 771 people appear: r = 0.00.
   23.8    the 够格线; 26.2 one huge left swipe: everyone under it flies off, the plane swings with the swipe;
   29.6    ♥: r runs 0.00 → −0.64.
   33.7    why: dive to the plain-but-kind (their card pops: 颜值 low, 性格 high, 喜欢), then to the ghosts of the
           plain-and-mean (划走), then pull back: the line glows, 筛子. */

type P = [number, number, number];
const PTS = data.pts as P[];
export const R_ALL = data.r_all, R_KEPT = data.r_kept, N_KEPT = data.kept;
const THR = (data.thr + 6) / 6;

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
const KEPT_I = PTS.map((p, i) => (p[2] ? i : -1)).filter((i) => i >= 0);
const FK = fit(KEPT_I.map((i) => PTS[i])), FA = fit(PTS);
const KC: [number, number] = [sx(FK.mx), sy(FK.my)];
const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };

const pick = (f: (p: P) => boolean, score: (p: P) => number) => {
  let best = -1, bs = -Infinity;
  PTS.forEach((p, i) => { if (f(p) && score(p) > bs) { bs = score(p); best = i; } });
  return best;
};
const HERO = {
  hotMean: pick((p) => !!p[2] && p[1] < 0.5, (p) => p[0]),
  rej1: pick((p) => !p[2], (p) => -Math.hypot(p[0] - 0.3, p[1] - 0.42)),
  plainKind: pick((p) => !!p[2] && p[0] < 0.5, (p) => p[1]),
  hot2: pick((p) => !!p[2] && p[0] > 0.7 && p[1] < 0.58, (p) => -Math.hypot(p[0] - 0.74, p[1] - 0.55)),
  rej2: pick((p) => !p[2], (p) => -Math.hypot(p[0] - 0.55, p[1] - 0.3)),
};
type Card = { i: number; t: number; dir: 1 | -1; fast: boolean };
const DECK: Card[] = [
  { i: HERO.hotMean, t: 0.75, dir: 1, fast: false }, { i: HERO.rej1, t: 1.78, dir: -1, fast: false }, { i: HERO.plainKind, t: 2.8, dir: 1, fast: false },
  { i: HERO.hot2, t: 3.8, dir: 1, fast: false }, { i: HERO.rej2, t: 4.8, dir: -1, fast: false },
];
const RIFFLE: Card[] = Array.from({ length: 14 }, (_, k) => ({ i: KEPT_I[(k * 37 + 11) % KEPT_I.length], t: 5.3 + k * 0.13, dir: 1 as const, fast: true }));
const LAST: Card = { i: KEPT_I[101], t: 99, dir: 1, fast: false }; // stays on the phone after the riffle
const ALL: Card[] = [...DECK, ...RIFFLE, LAST];
const HERO_SET = new Set(DECK.map((d) => d.i));
const WHY_KIND = pick((p) => !!p[2] && p[0] < 0.45, (p) => p[1] - 0.5 * p[0]);
const WHY_GHOST = pick((p) => !p[2], (p) => -Math.hypot(p[0] - 0.3, p[1] - 0.3));

type K = [number, number, number, number, number, number, number, number]; // t, z, cx, cy, tx, ty, ry, rx
const KEYS: K[] = [
  [0, 0.78, PC[0], PC[1], 1330, 480, -18, 5], [10.2, 0.78, PC[0], PC[1], 1330, 480, -18, 5],
  [11.3, 1.45, KC[0], KC[1], 900, 500, 0, 0], [12.4, 1.45, KC[0] + 12, KC[1] - 8, 900, 500, 0, 0],
  [14.2, 1, PC[0], PC[1], 900, 520, 0, 0], [26.2, 1, PC[0], PC[1], 900, 520, 0, 0],
  [27.0, 1.04, PC[0] - 20, PC[1], 900, 520, 11, -2], [28.8, 1, PC[0], PC[1], 900, 520, 0, 0],
  [33.7, 1, PC[0], PC[1], 900, 520, 0, 0], [34.6, 1.7, sx(0.3), sy(0.8), 640, 470, -8, 3],
  [40.3, 1.7, sx(0.31), sy(0.79), 640, 470, -8, 3], [41.2, 1.7, sx(0.28), sy(0.3), 640, 500, 8, -3],
  [43.1, 1.7, sx(0.29), sy(0.31), 640, 500, 8, -3], [44.0, 1, PC[0], PC[1], 900, 520, 0, 0],
];
const camAt = (T: number) => {
  let k = 0;
  while (k < KEYS.length - 1 && T >= KEYS[k + 1][0]) k++;
  const a = KEYS[k], b = KEYS[Math.min(k + 1, KEYS.length - 1)];
  const e = b[0] > a[0] ? expoInOut(prog(T, a[0], b[0])) : 0;
  const v = (j: number) => lerp(a[j], b[j], e);
  return { z: v(1), cx: v(2), cy: v(3), tx: v(4), ty: v(5), ry: v(6), rx: v(7) };
};
const toScreen = (T: number, X: number, Y: number): [number, number] => {
  const c = camAt(T);
  return [c.tx + c.z * (sx(X) - c.cx), c.ty + c.z * (sy(Y) - c.cy)];
};

const Person: React.FC<{ x: number; y: number; col: string; o: number; s?: number; rot?: number; dx?: number }> = ({ x, y, col, o, s = 1, rot = 0, dx = 0 }) => {
  if (o <= 0.01) return null;
  return (
    <g transform={`translate(${x + dx} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      <rect x={-5} y={-6.5} width={10} height={13} rx={2.4} fill={col} />
      <circle cx={0} cy={-1.6} r={2.1} fill="rgba(20,8,22,0.55)" />
    </g>
  );
};

const PHONE: [number, number] = [470, 470];
const PHONE_S = 0.82;
const CARD_IN_PHONE = 1.12;
const HOME: [number, number] = [PHONE[0], PHONE[1] - 40 * PHONE_S];

export const StageA: React.FC<{ T: number }> = ({ T }) => {
  const L = useLook();
  const st = stageStyle(T, 0, CUT.atus, [0, 0]);
  if (!st) return null;
  const cam = camAt(T);
  const camT = `translate(${cam.tx} ${cam.ty}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`;

  const others = easeOut(prog(T, 18.4, 18.9));
  const neutral = easeInOut(prog(T, 18.4, 19.2)) * (1 - easeInOut(prog(T, 26.2, 27.0)));
  const cutLine = easeOut(prog(T, 23.8, 24.8));
  const sieve = easeOut(prog(T, 43.1, 43.7));
  const ghosts = easeOut(prog(T, 40.3, 41.0)) * (1 - prog(T, 44.6, 45.4));
  const axes = T < 10.2 ? 0.75 * easeOut(prog(T, 0.2, 0.8)) : lerp(0.75, 1, prog(T, 10.2, 11));
  const hookLine = easeOut(prog(T, 6.0, 7.4)) * (1 - prog(T, 12.0, 12.6));
  const flat = easeOut(prog(T, 20.8, 21.6));
  const tilt = easeInOut(prog(T, 29.7, 30.9));
  const lineB = lerp(FA.b, FK.b, tilt), lineMx = lerp(FA.mx, FK.mx, tilt), lineMy = lerp(FA.my, FK.my, tilt);
  const lx0 = lerp(0.05, 0.25, tilt), lx1 = 0.95;

  const keptAt = (i: number) => {
    const d = ALL.find((c) => c.i === i && c.t < 50);
    if (d) return d.t + (d.fast ? 0.42 : 0.55);
    return 5.4 + rnd(i, 5) * 1.8;
  };

  const people = PTS.map((p, i) => {
    const [X, Y, keep] = p;
    const x = sx(X), y = sy(Y);
    if (keep) {
      const inK = pop(T, keptAt(i), 0.25);
      const col = neutral > 0.5 ? L.pointOut : L.pointIn;
      const hi = i === WHY_KIND ? 1 + 1.2 * easeOut(prog(T, 34.6, 35.0)) * (1 - prog(T, 40.0, 40.4)) : 1;
      return <Person key={i} x={x} y={y} col={col} o={Math.min(1, inK)} s={Math.max(0.01, inK) * hi} />;
    }
    if (HERO_SET.has(i) && T < 18.4) return null;
    const inO = others * easeOut(prog(T, 18.4 + rnd(i, 6) * 1.8, 18.7 + rnd(i, 6) * 1.8));
    const dist = THR - (X + Y);
    const r0 = 26.3 + clamp(1 - dist / 0.9) * 1.9 + rnd(i, 8) * 0.25;
    const out = easeIn(prog(T, r0, r0 + 0.5));
    const gk = i === WHY_GHOST ? 1 + 1.2 * easeOut(prog(T, 41.2, 41.6)) * (1 - prog(T, 44.4, 44.8)) : 1;
    const o = inO * (1 - out) + ghosts * (i === WHY_GHOST ? 0.9 : 0.28);
    return <Person key={i} x={x} y={y} col={L.pointOut} o={o} s={gk} dx={-320 * out * (1 - ghosts)} rot={-30 * out * (1 - ghosts)} />;
  });

  const cA: [number, number] = [sx(THR - 1), sy(1)], cB: [number, number] = [sx(1), sy(THR - 1)];
  const cutLen = Math.hypot(cB[0] - cA[0], cB[1] - cA[1]);

  const rShown = T < 29.7 ? R_ALL : lerp(R_ALL, R_KEPT, easeInOut(prog(T, 29.7, 31.0)));
  const count = T < 26.3 ? 1000 : Math.round(lerp(1000, N_KEPT, easeInOut(prog(T, 26.3, 28.6))));
  const panel = easeOut(prog(T, 20.9, 21.4));
  const rPop = pop(T, 21.0, 0.3), rHit = hit(T, 31.0, 0.25);
  const titleDim = 1 - 0.85 * easeInOut(prog(T, CUT.title - 0.2, CUT.title + 0.15)) * (1 - easeInOut(prog(T, CUT.intro - 0.25, CUT.intro + 0.2)));
  const sw = prog(T, 26.15, 26.75);
  const phoneOut = easeIn(prog(T, 10.2, 10.75));
  const phoneIn = easeOut(prog(T, 0, 0.35));

  // the top card on the phone
  const deckNow = (() => {
    const idx = ALL.findIndex((c) => T < c.t + (c.fast ? 0.06 : 0.12));
    if (idx < 0) return null;
    const cur = ALL[idx], nxt = ALL[idx + 1];
    const prevT = idx > 0 ? ALL[idx - 1].t : -1;
    const barsK = cur.fast ? 1 : easeOut(prog(T, prevT + 0.15, prevT + 0.55));
    const pre = cur.fast ? 0 : easeOut(prog(T, cur.t - 0.22, cur.t));
    return (
      <g>
        {nxt && <g transform={`translate(0 -40) scale(${CARD_IN_PHONE * 0.94})`} opacity={0.6}><ProfileCard L={L} id="nx" seed={nxt.i} looks={PTS[nxt.i][0]} pers={PTS[nxt.i][1]} barsK={0} /></g>}
        <g transform={`translate(${cur.dir * 40 * pre} -40) rotate(${cur.dir * 6 * pre}) scale(${CARD_IN_PHONE})`}>
          <ProfileCard L={L} id="top" seed={cur.i} looks={PTS[cur.i][0]} pers={PTS[cur.i][1]} barsK={barsK} stamp={cur.dir > 0 ? 'yes' : 'no'} stampK={pre} />
        </g>
      </g>
    );
  })();

  return (
    <AbsoluteFill style={st}>
      <AbsoluteFill style={{ opacity: titleDim }}>
        {/* the plot plane, tilted in 3D */}
        <AbsoluteFill style={{ transform: `perspective(1700px) rotateY(${cam.ry}deg) rotateX(${cam.rx}deg)`, transformOrigin: `${cam.tx}px ${cam.ty}px` }}>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <g transform={camT}>
              <g opacity={axes}>
                {T < 12.6 && <rect x={PX0 - 30} y={PY1 - PS - 40} width={PS + 70} height={PS + 70} rx={24} fill="rgba(255,79,139,0.04)" stroke={L.faint} strokeWidth={2} opacity={1 - prog(T, 11.6, 12.6)} />}
                <line x1={PX0} y1={PY1} x2={PX0 + PS + 30} y2={PY1} stroke={L.dim} strokeWidth={2} />
                <line x1={PX0} y1={PY1} x2={PX0} y2={PY1 - PS - 30} stroke={L.dim} strokeWidth={2} />
                <path d={`M ${PX0 + PS + 30} ${PY1} l -12 -7 l 0 14 z`} fill={L.dim} />
                <path d={`M ${PX0} ${PY1 - PS - 30} l -7 12 l 14 0 z`} fill={L.dim} />
                <text x={PX0 + PS + 20} y={PY1 + 46} textAnchor="end" style={{ ...BLACK, fontSize: 36, fill: L.accent }}>颜值 →</text>
                <text x={PX0 - 22} y={PY1 - PS + 12} textAnchor="end" style={{ ...BLACK, fontSize: 36, fill: L.second }}>性格</text>
                <text x={PX0 - 22} y={PY1 - PS + 52} textAnchor="end" style={{ ...BLACK, fontSize: 36, fill: L.second }}>↑</text>
              </g>
              {people}
              {cutLine > 0 && (
                <g>
                  <line x1={cA[0]} y1={cA[1]} x2={cB[0]} y2={cB[1]} stroke={L.accent} strokeWidth={3 + 5 * sieve} strokeLinecap="round"
                    strokeDasharray={sieve > 0 ? undefined : `${cutLen * cutLine} ${cutLen}`}
                    style={{ filter: `drop-shadow(0 0 ${6 + 12 * sieve}px ${L.accentGlow})` }} />
                  {T > 24.4 && T < 33.6 && <text x={cB[0] + 14} y={cB[1] + 8} opacity={easeOut(prog(T, 24.4, 24.9))} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: L.accent }}>够格线</text>}
                </g>
              )}
              {hookLine > 0 && (() => {
                const x0 = 0.4, x1 = 0.98, y0 = FK.my + FK.b * (x0 - FK.mx), y1 = FK.my + FK.b * (x1 - FK.mx);
                return <line x1={sx(x0)} y1={sy(y0)} x2={sx(lerp(x0, x1, hookLine))} y2={sy(lerp(y0, y1, hookLine))} stroke={L.second} strokeWidth={7} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${L.secondGlow})` }} />;
              })()}
              {flat > 0 && T < 45.8 && (() => {
                const y0 = lineMy + lineB * (lx0 - lineMx), y1 = lineMy + lineB * (lx1 - lineMx);
                return <line x1={sx(lx0)} y1={sy(y0)} x2={sx(lerp(lx0, lx1, flat))} y2={sy(lerp(y0, y1, flat))} stroke={L.second} strokeWidth={5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${L.secondGlow})` }} />;
              })()}
              {sieve > 0 && <text x={cB[0] - 30} y={cB[1] - 46} textAnchor="end" opacity={sieve} style={{ ...BLACK, fontSize: 72, fill: L.accent, filter: `drop-shadow(0 0 16px ${L.accentGlow})` }}>筛子</text>}
            </g>
          </svg>
        </AbsoluteFill>

        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {T < 12 && <text x={1330} y={150} textAnchor="middle" opacity={easeOut(prog(T, 0.3, 0.8)) * (1 - prog(T, 10.2, 10.6))} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '0.25em', fill: L.dim }}>你右滑过的人</text>}
          {sw > 0 && sw < 1 && (
            <path d={`M ${1500 - 1400 * easeOut(sw)} ${700 - 140 * Math.sin(Math.PI * sw)} q 260 -60 520 0`} stroke="rgba(255,242,246,0.5)" strokeWidth={26 * (1 - sw)} fill="none" strokeLinecap="round" style={{ filter: 'blur(6px)' }} />
          )}
          {panel > 0 && T < 33.8 && (
            <g opacity={panel * (1 - prog(T, 33.4, 33.8))}>
              <text x={1360} y={280} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: L.dim }}>相关系数 r</text>
              <g transform={`translate(1360 400) scale(${0.85 + 0.15 * Math.min(1.1, rPop) + 0.1 * rHit})`}>
                <text x={0} y={0} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 124, fill: T > 29.7 ? L.accent : L.ink, filter: T > 29.7 ? `drop-shadow(0 0 14px ${L.accentGlow})` : undefined }}>{rShown < -0.005 ? '−' : ''}{Math.abs(rShown).toFixed(2)}</text>
              </g>
              <text x={1362} y={462} style={{ ...BLACK, fontSize: 38, fill: T > 30.9 ? L.accent : L.second }}>{T > 30.9 ? '强烈负相关' : '毫无关系'}</text>
              <text x={1360} y={580} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, fill: L.ink }}>{count}<tspan style={{ fontFamily: SANS, fontSize: 32 }}> 人</tspan></text>
              <text x={1362} y={620} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, fill: L.dim }}>{T > 26.3 ? '留在你视野里的' : '全部'}</text>
              <g transform="translate(1410 730)"><AppButton L={L} kind="no" r={40} press={hit(T, 26.15, 0.3)} /></g>
              <g transform="translate(1530 730)"><AppButton L={L} kind="yes" r={40} press={hit(T, 29.6, 0.3)} /></g>
            </g>
          )}
          {T > 15.3 && T < 45.8 && (
            <text x={110} y={92} opacity={easeOut(prog(T, 15.4, 16))} style={{ fontFamily: SANS, fontSize: 20, fill: L.dim }}>模拟 1000 人 · 思想实验出自 Ellenberg《魔鬼数学》(2014)</text>
          )}
          {[{ i: WHY_KIND, a: 34.8, z: 40.1, stamp: 'yes' as const, cap: '不够好看，但性格满分' }, { i: WHY_GHOST, a: 41.3, z: 44.5, stamp: 'no' as const, cap: '早被你左滑了' }].map(({ i, a, z, stamp, cap }) => {
            if (T < a || T > z + 0.3) return null;
            const k = pop(T, a, 0.3), o = Math.min(1, k) * (1 - prog(T, z, z + 0.3));
            const [dx, dy] = toScreen(T, PTS[i][0], PTS[i][1]);
            const cx = 1590, cy = 440;
            const col = stamp === 'yes' ? L.accent : 'rgba(255,242,246,0.6)';
            return (
              <g key={i} opacity={o}>
                <line x1={dx} y1={dy} x2={cx - 150 * 0.95} y2={cy} stroke={col} strokeWidth={2.5} strokeDasharray="6 6" strokeDashoffset={-T * 40} />
                <circle cx={dx} cy={dy} r={18 + 6 * Math.sin(T * 6)} fill="none" stroke={col} strokeWidth={3} />
                <g transform={`translate(${cx} ${cy}) rotate(${(1 - Math.min(1, k)) * 8}) scale(${0.95 * (0.8 + 0.2 * Math.min(1.1, k))})`}>
                  <ProfileCard L={L} id={`why${i}`} seed={i} looks={PTS[i][0]} pers={PTS[i][1]} stamp={stamp} stampK={easeOut(prog(T, a + 0.7, a + 0.9))} barsK={easeOut(prog(T, a + 0.15, a + 0.6))} glow={stamp === 'yes' ? 0.8 : 0} />
                </g>
                <text x={cx} y={cy + 250} textAnchor="middle" style={{ ...BLACK, fontSize: 30, fill: stamp === 'yes' ? L.accent : L.ink }}>{cap}</text>
              </g>
            );
          })}
        </svg>

        {T < 10.9 && (
          <AbsoluteFill style={{ transform: `translate(${-1100 * phoneOut}px, ${80 * phoneOut}px) perspective(1600px) rotateY(${14 + 30 * phoneOut}deg) rotateZ(${-12 * phoneOut}deg)`, transformOrigin: `${PHONE[0]}px ${PHONE[1]}px`, opacity: phoneIn }}>
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              <g transform={`translate(${PHONE[0]} ${PHONE[1]}) scale(${PHONE_S})`}>
                <Phone L={L} id="ph">
                  {deckNow}
                  <g transform="translate(-90 330)"><AppButton L={L} kind="no" press={Math.max(...DECK.filter((d) => d.dir < 0).map((d) => hit(T, d.t, 0.2)))} /></g>
                  <g transform="translate(90 330)"><AppButton L={L} kind="yes" press={Math.max(...ALL.filter((d) => d.dir > 0).map((d) => hit(T, d.t, d.fast ? 0.08 : 0.2)))} /></g>
                </Phone>
              </g>
            </svg>
          </AbsoluteFill>
        )}

        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {ALL.map((c, k) => {
            const dur = c.fast ? 0.42 : 0.55;
            if (T < c.t || T > c.t + dur) return null;
            const u = prog(T, c.t, c.t + dur), e = easeInOut(u);
            const [hx, hy] = HOME;
            const s0 = PHONE_S * CARD_IN_PHONE;
            if (c.dir < 0) {
              return <g key={k} transform={`translate(${hx - 900 * easeIn(u)} ${hy + 120 * u}) rotate(${-34 * u}) scale(${s0})`} opacity={1 - u * 0.6}><ProfileCard L={L} id={`fl${k}`} seed={c.i} looks={PTS[c.i][0]} pers={PTS[c.i][1]} stamp="no" stampK={1} /></g>;
            }
            const [tx, ty] = toScreen(T, PTS[c.i][0], PTS[c.i][1]);
            const mx = lerp(hx, tx, 0.5), my = Math.min(hy, ty) - 220;
            const x = (1 - e) * (1 - e) * hx + 2 * (1 - e) * e * mx + e * e * tx, y = (1 - e) * (1 - e) * hy + 2 * (1 - e) * e * my + e * e * ty;
            const s = lerp(s0, 0.035, easeIn(u));
            return <g key={k} transform={`translate(${x} ${y}) rotate(${18 * Math.sin(Math.PI * u)}) scale(${s})`} opacity={1 - easeIn(prog(u, 0.75, 1))}><ProfileCard L={L} id={`fl${k}`} seed={c.i} looks={PTS[c.i][0]} pers={PTS[c.i][1]} stamp="yes" stampK={c.fast ? 0 : 1} /></g>;
          })}
          {DECK.filter((d) => d.dir > 0).map((d, k) => {
            const h = hit(T, d.t + 0.55, 0.35);
            if (h < 0.02 || T < d.t + 0.55) return null;
            const [x, y] = toScreen(T, PTS[d.i][0], PTS[d.i][1]);
            return <g key={k} transform={`translate(${x} ${y - 20 - 30 * (1 - h)}) scale(${1.2 - 0.4 * h})`} opacity={h}><path d={heart(14)} fill={L.accent} style={{ filter: `drop-shadow(0 0 8px ${L.accentGlow})` }} /></g>;
          })}
        </svg>
      </AbsoluteFill>
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
          <text x={960} y={600} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 280, fill: L.ink, letterSpacing: '0.08em' }}>筛子</text>
        </g>
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx={960 - 250 + i * 50} cy={680} r={13} fill="none" stroke={L.accent} strokeWidth={5} opacity={k(0.12 + i * 0.03, 0.12)}
            style={{ filter: `drop-shadow(0 0 6px ${L.accentGlow})` }} />
        ))}
        <text x={960} y={770} textAnchor="middle" opacity={k(0.5, 0.3)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.5em', fill: L.dim }}>VIBE知识大赏</text>
      </svg>
    </AbsoluteFill>
  );
};
