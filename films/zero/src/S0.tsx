import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, pop, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, type Line } from './ui';
import { Counter3D, Bokeh, CAN_H, CUBE, type CanState, type CubeState } from './Counter3D';
import { project } from './three-kit';

/* S0, cold open (b0–b30): a counter at night, two unbranded cans. Out of the red one come its 35 g of sugar as nine
   cubes (4 g a cube, 估算), stacking beside it; the black one gives nothing. "So why is it still sweet?"
   Sugar per can: 10.6 g / 100 ml on the Chinese label (解放日报·上观新闻 via 中国互联网联合辟谣平台, 2018) → 35 g in 330 ml. */
export const S0_IN = 0, S0_OUT = b(31);

export const LINES_S0: Line[] = [
  [b(2), b(10) - 0.1, '一罐330毫升的可乐，含糖约[35克]——', 'A 330 ml can of cola holds about 35 g of sugar,'],
  [b(10) + 0.06, b(18) - 0.1, '差不多[9块]方糖。', 'roughly nine sugar cubes.'],
  [b(18) + 0.06, b(24) - 0.1, '它的无糖版本：糖，[0克]。', 'Its sugar-free twin: zero grams.'],
  [b(24) + 0.06, b(30) - 0.15, '那它为什么，还是甜的？', 'So why is it still sweet?'],
];

export const RED_X = -0.55, BLACK_X = 0.55;
const STACK_X = -1.42;
// each cube leaves the can on its own accelerating clock, flies an arc and lands in a 3 × 3 wall
const leave = (i: number) => b(5) + 0.5 * i - 0.022 * i * i;
const FLY = 0.62;
const slot = (i: number) => [STACK_X + ((i % 3) - 1) * (CUBE + 0.012), CUBE / 2 + Math.floor(i / 3) * (CUBE + 0.002), 0.12];

export const cubesAt = (T: number): CubeState[] => Array.from({ length: 9 }, (_, i) => {
  const t0 = leave(i), k = prog(T, t0, t0 + FLY);
  if (T < t0) return null;
  const s = slot(i);
  const x = lerp(RED_X, s[0], easeInOut(k)), z = lerp(0, s[2], k);
  const y = lerp(CAN_H + 0.05, s[1], k) + 0.75 * Math.sin(Math.PI * k) * (1 - 0.25 * (i / 9));
  const spin = (1 - easeOut(k)) * (2 + rnd(i, 1) * 2);
  const settle = k >= 1 ? 0 : 1;
  return { p: [x, y, z], r: [spin * settle, spin * 0.7 * settle, spin * 0.4 * settle], s: 0.6 + 0.4 * easeOut(Math.min(1, k * 3)) };
}).filter(Boolean) as CubeState[];

export const KEYS_S0: Key[] = [
  [0, [-0.35, 0.95, 2.7], [RED_X, 0.78, 0]],
  [b(5), [-0.5, 1.15, 3.2], [RED_X - 0.15, 0.8, 0]],
  [b(10), [-0.75, 1.55, 4.3], [-0.75, 0.6, 0]],
  [b(17), [-0.1, 1.5, 4.5], [-0.15, 0.62, 0]],
  [b(22), [0.45, 1.15, 3.2], [BLACK_X, 0.72, 0]],
  [b(30), [0.6, 0.98, 2.35], [BLACK_X, 0.74, 0]],
  [b(31), [0.6, 0.98, 2.25], [BLACK_X, 0.74, 0]],
];

export const S0: React.FC<{ T: number }> = ({ T }) => {
  if (T > S0_OUT) return null;
  const cans: CanState[] = [{ kind: 'red', p: [RED_X, 0, 0], ry: -0.15 }, { kind: 'black', p: [BLACK_X, 0, 0], ry: 0.12 }];
  const o = easeOut(prog(T, 0, 1.2)) * (1 - easeIn(prog(T, b(30), S0_OUT)));
  // labels that ride on the 3D things
  const st = project(KEYS_S0, T, [STACK_X - 0.15, 3 * CUBE + 0.42, 0.12]);
  const bl = project(KEYS_S0, T, [BLACK_X + 0.72, 0.72, 0]);
  const sugarO = easeOut(prog(T, b(10), b(10) + 0.5)) * (1 - prog(T, b(20), b(21)));
  const zeroO = easeOut(prog(T, b(18) + 0.1, b(19))) * (1 - prog(T, b(29), b(30)));
  const q = pop(T, b(24) + 0.1, 0.3);
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05070d' }}>
      <Bokeh />
      <Counter3D T={T} keys={KEYS_S0} cans={cans} cubes={cubesAt(T)} />
      {sugarO > 0.01 && (
        <div style={{ position: 'absolute', left: st.x - 200, top: st.y - 120, width: 400, textAlign: 'center', opacity: sugarO }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 92, color: INK, lineHeight: 1, fontVariantNumeric: 'lining-nums', textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>35<span style={{ fontFamily: ZH, fontSize: 40 }}> 克</span></div>
          <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.7)', marginTop: 6, letterSpacing: '0.08em' }}>≈ 9 块方糖 · 每块约 4 克（估算）</div>
        </div>
      )}
      {zeroO > 0.01 && (
        <div style={{ position: 'absolute', left: bl.x - 200, top: bl.y - 120, width: 400, textAlign: 'center', opacity: zeroO }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 110, color: GOLD, lineHeight: 1, fontVariantNumeric: 'lining-nums', transform: `scale(${0.8 + 0.2 * pop(T, b(18) + 0.1)})`, textShadow: '0 0 30px rgba(246,207,120,0.4), 0 4px 24px rgba(0,0,0,0.8)' }}>0<span style={{ fontFamily: ZH, fontSize: 44 }}> 克</span></div>
          <div style={{ fontFamily: ZH, fontSize: 30, color: INK, marginTop: 10, opacity: q, letterSpacing: '0.1em' }}>却是甜的</div>
        </div>
      )}
      <SubBand />
      <Subs T={T} lines={LINES_S0} />
    </AbsoluteFill>
  );
};
