import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, cut, prog, easeOut, easeIn, easeInOut, lerp, rnd, pop, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, type Line } from './ui';
import { Counter3D, CUBE, type CanState, type CubeState, type Grain } from './Counter3D';
import { project } from './three-kit';

/* S0, cold open (b0–b30): a counter at night, two unbranded cans, shot like a product film. A strip of light runs
   down the red can; then its sugar arrives as cubes dropping in from above, one by one, faster and faster, and
   stacks into a 3 × 3 block beside it: 35 g, 4 g a cube (估算). The black can gets nothing. "So why is it sweet?"
   Sugar per can: 10.6 g / 100 ml on the Chinese label (解放日报·上观新闻 via 中国互联网联合辟谣平台, 2018) → 35 g in 330 ml. */
export const S0_IN = 0, S0_OUT = cut(30) - 1e-4;

export const LINES_S0: Line[] = [
  [b(2), b(10) - 0.1, '一罐330毫升的可乐，含糖约[35克]——', 'A 330 ml can of cola holds about 35 g of sugar,'],
  [b(10) + 0.06, b(17) - 0.1, '差不多[9块]方糖。', 'roughly nine sugar cubes.'],
  [b(17) + 0.06, b(24) - 0.1, '它的无糖版本：糖，[0克]。', 'Its sugar-free twin: zero grams.'],
  [b(24) + 0.06, b(30) - 0.15, '那它为什么，还是甜的？', 'So why is it still sweet?'],
];

export const RED_X = -0.55, BLACK_X = 0.55;
const STACK_X = -1.4, STACK_Z = 0.15;
const G = 26; // units/s², a touch of slow motion
const DROP_H = 2.4;
const T_FALL = Math.sqrt((2 * DROP_H) / G);
const dropAt = (i: number) => b(4) + 0.2 + 0.56 * i - 0.026 * i * i;
const landAt = (i: number) => dropAt(i) + T_FALL;
const slot = (i: number) => [STACK_X + ((i % 3) - 1) * (CUBE + 0.006), CUBE / 2 + Math.floor(i / 3) * (CUBE + 0.002), STACK_Z];

export const cubesAt = (T: number): CubeState[] => {
  const out: CubeState[] = [];
  for (let i = 0; i < 9; i++) {
    const t = T - dropAt(i);
    if (t < 0) continue;
    const s = slot(i);
    const yaw0 = (rnd(i, 1) - 0.5) * 1.6, roll0 = (rnd(i, 2) - 0.5) * 0.9, rest = (rnd(i, 3) - 0.5) * 0.08;
    let y: number, k: number;
    if (t < T_FALL) { y = s[1] + DROP_H - 0.5 * G * t * t; k = t / T_FALL; }
    else { const tb = t - T_FALL; y = s[1] + Math.max(0, 0.05 * Math.exp(-tb * 9) * Math.abs(Math.sin(tb * 22))); k = 1; }
    const spin = 1 - easeOut(k);
    out.push({ p: [s[0], y, s[2]], r: [roll0 * spin, rest + yaw0 * spin, roll0 * 0.5 * spin] });
  }
  return out;
};

export const grainsAt = (T: number): Grain[] => {
  const out: Grain[] = [];
  for (let i = 0; i < 9; i++) {
    const t = T - landAt(i);
    if (t < 0 || t > 0.7) continue;
    const s = slot(i);
    for (let j = 0; j < 9; j++) {
      const a = rnd(i * 10 + j, 4) * Math.PI * 2, v = 0.5 + rnd(i * 10 + j, 5) * 0.7, up = 0.6 + rnd(i * 10 + j, 6) * 0.8;
      const yb = s[1] - CUBE / 2;
      out.push({ p: [s[0] + Math.cos(a) * (0.09 + v * t), Math.max(0.006, yb + up * t - 0.5 * 12 * t * t), s[2] + Math.sin(a) * (0.09 + v * t)], o: 1 - t / 0.7 });
    }
  }
  return out;
};

export const KEYS_S0: Key[] = [
  [0, [-0.12, 0.6, 1.55], [RED_X, 0.6, 0]],
  [b(4), [-0.3, 0.74, 1.95], [RED_X - 0.1, 0.62, 0]],
  [b(9), [-0.85, 1.3, 3.8], [-0.95, 0.52, 0]],
  [b(16), [-0.2, 1.42, 4.6], [-0.15, 0.58, 0]],
  [b(22), [0.48, 1.0, 2.9], [BLACK_X, 0.64, 0]],
  [b(30), [0.62, 0.8, 1.95], [BLACK_X, 0.64, 0]],
  [b(31), [0.63, 0.8, 1.88], [BLACK_X, 0.64, 0]],
];

export const S0: React.FC<{ T: number }> = ({ T }) => {
  if (T > S0_OUT) return null;
  const cans: CanState[] = [{ kind: 'red', p: [RED_X, 0, 0], ry: -0.12 }, { kind: 'black', p: [BLACK_X, 0, 0], ry: 0.1 }];
  const o = easeOut(prog(T, 0, 0.9));
  // two light sweeps: down the red can at the start, across the black can on the question
  const n = Array.from({ length: 9 }, (_, i) => i).filter((i) => T >= landAt(i)).length;
  const st = project(KEYS_S0, T, [STACK_X, 3 * CUBE + 0.32, STACK_Z]);
  const bl = project(KEYS_S0, T, [BLACK_X + 0.62, 0.74, 0]);
  const countO = easeOut(prog(T, landAt(0), landAt(0) + 0.2)) * (1 - prog(T, b(19), b(20)));
  const zeroO = easeOut(prog(T, b(17) + 0.1, b(18))) * (1 - prog(T, b(29), b(30)));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05070d' }}>
      <Counter3D T={T} keys={KEYS_S0} cans={cans} cubes={cubesAt(T)} grains={grainsAt(T)} />
      {countO > 0.01 && (
        <div style={{ position: 'absolute', left: st.x - 220, top: st.y - 130, width: 440, textAlign: 'center', opacity: countO }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 96, color: n >= 9 ? GOLD : INK, lineHeight: 1, fontVariantNumeric: 'lining-nums tabular-nums', textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>
            {n >= 9 ? <>35<span style={{ fontFamily: ZH, fontSize: 42 }}> 克</span></> : <>{n * 4}<span style={{ fontFamily: ZH, fontSize: 42 }}> 克</span></>}
          </div>
          <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.72)', marginTop: 8, letterSpacing: '0.08em', opacity: easeOut(prog(T, landAt(8), landAt(8) + 0.4)) }}>≈ 9 块方糖 · 每块约 4 克（估算）</div>
        </div>
      )}
      {zeroO > 0.01 && (
        <div style={{ position: 'absolute', left: bl.x - 200, top: bl.y - 120, width: 400, textAlign: 'center', opacity: zeroO }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 116, color: GOLD, lineHeight: 1, fontVariantNumeric: 'lining-nums', transform: `scale(${0.8 + 0.2 * pop(T, b(17) + 0.1)})`, textShadow: '0 0 30px rgba(246,207,120,0.4), 0 4px 24px rgba(0,0,0,0.8)' }}>0<span style={{ fontFamily: ZH, fontSize: 46 }}> 克</span></div>
        </div>
      )}
      <SubBand />
      <Subs T={T} lines={LINES_S0} />
    </AbsoluteFill>
  );
};
