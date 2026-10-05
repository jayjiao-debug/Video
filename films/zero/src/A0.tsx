import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, cut, prog, easeOut, rnd, pop, EN, ZH, GOLD, INK } from './lib';
import { Subs, SubBand, type Line } from './ui';
import { Can2D, Cube2D, Counter2D } from './Kit2D';

/* A0, cold open (b0–b32), 2D. The first frame is the red can, close (a concrete object at second 0). Four shots, cut
   on the bar: the can close-up → its 35 g of sugar dropping in as nine cubes (4 g a cube, 估算) → the black can, 0 g →
   both cans and the question in the viewer's words. The title lands on the drop at b32 over the next scene.
   Sugar per can: 10.6 g / 100 ml on the Chinese label (解放日报·上观新闻 via 中国互联网联合辟谣平台, 2018) → 35 g in 330 ml. */
export const A0_IN = 0, A0_OUT = cut(32) - 1e-4;

export const LINES_A0: Line[] = [
  [b(2), b(10) - 0.1, '一罐330毫升的可乐，含糖约[35克]——', 'A 330 ml can of cola holds about 35 g of sugar,'],
  [b(10) + 0.06, b(16) - 0.1, '差不多[9块]方糖。', 'roughly nine sugar cubes.'],
  [b(16) + 0.06, b(24) - 0.1, '无糖的那罐：糖，[0克]。', 'The sugar-free can: zero grams.'],
  [b(24) + 0.06, b(32) - 0.15, '你喝的无糖可乐，凭什么还是甜的？', 'So why does your sugar-free cola still taste sweet?'],
];

// shot 2: cubes fall on their own (accelerating) clock and stack into a 3 × 3 wall beside the red can
const S = 58, BASE2 = 820, STACK_X = 640;
const dropAt = (i: number) => b(4) + 0.35 + 0.55 * i - 0.026 * i * i;
const G = 2600, FALL = 640, T_FALL = Math.sqrt((2 * FALL) / G);
const slot = (i: number) => [STACK_X + ((i % 3) - 1) * S, BASE2 - Math.floor(i / 3) * S];

const Shot2: React.FC<{ T: number }> = ({ T }) => {
  const cubes: React.ReactNode[] = [], grains: React.ReactNode[] = [];
  let n = 0;
  for (let i = 0; i < 9; i++) {
    const t = T - dropAt(i); if (t < 0) continue;
    const [x, y0] = slot(i);
    let y = y0;
    if (t < T_FALL) y = y0 - FALL + 0.5 * G * t * t;
    else { const tb = t - T_FALL; y = y0 - 22 * Math.exp(-tb * 9) * Math.abs(Math.sin(tb * 20)); n++; }
    const rot = t < T_FALL ? (1 - t / T_FALL) * (rnd(i, 1) - 0.5) * 50 : 0;
    cubes.push(<Cube2D key={i} x={x} y={y} s={S} rot={rot} />);
    const tg = t - T_FALL;
    if (tg > 0 && tg < 0.6) for (let j = 0; j < 8; j++) {
      const a = rnd(i * 10 + j, 4) * Math.PI, v = 120 + rnd(i * 10 + j, 5) * 200;
      grains.push(<circle key={`${i}-${j}`} cx={x + Math.cos(a) * v * tg * (j % 2 ? 1 : -1)} cy={y0 - Math.sin(a) * v * tg + 900 * tg * tg} r={2} fill="#fffaf0" opacity={1 - tg / 0.6} />);
    }
  }
  const total = n >= 9 ? 35 : n * 4;
  return (
    <>
      <Counter2D top={BASE2} pool={[900, BASE2]} seed={1} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <Can2D kind="red" cx={1080} base={BASE2} h={440} id="a0r2" />
        <Can2D kind="black" cx={1580} base={BASE2} h={440} id="a0b2" />
        {cubes}{grains}
      </svg>
      {n > 0 && (
        <div style={{ position: 'absolute', left: STACK_X - 220, top: BASE2 - 4 * S - 200, width: 440, textAlign: 'center' }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 104, color: n >= 9 ? GOLD : INK, lineHeight: 1, fontVariantNumeric: 'lining-nums tabular-nums', textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>{total}<span style={{ fontFamily: ZH, fontSize: 44 }}> 克</span></div>
          <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.72)', marginTop: 8, opacity: n >= 9 ? 1 : 0 }}>≈ 9 块方糖 · 每块约 4 克（估算）</div>
        </div>
      )}
    </>
  );
};

export const A0: React.FC<{ T: number }> = ({ T }) => {
  if (T > A0_OUT) return null;
  const shot = T < cut(4) ? 1 : T < cut(16) ? 2 : T < cut(24) ? 3 : 4;
  const fadeIn = easeOut(prog(T, 0, 0.6));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      <AbsoluteFill style={{ opacity: fadeIn }}>
        {shot === 1 && (
          <>
            <Counter2D top={1060} pool={[760, 900]} seed={2} />
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
              <Can2D kind="red" cx={780} base={1240} h={1360} id="a0r1" reflect={false} />
            </svg>
          </>
        )}
        {shot === 2 && <Shot2 T={T} />}
        {shot === 3 && (
          <>
            <Counter2D top={880} pool={[860, 880]} seed={3} />
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
              <Can2D kind="black" cx={820} base={880} h={600} id="a0b3" />
            </svg>
            <div style={{ position: 'absolute', left: 1200, top: 330, width: 520, textAlign: 'center' }}>
              <div style={{ fontFamily: ZH, fontSize: 34, color: 'rgba(243,237,226,0.75)', letterSpacing: '0.2em' }}>糖</div>
              <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 200, lineHeight: 1, color: GOLD, fontVariantNumeric: 'lining-nums', transform: `scale(${0.82 + 0.18 * pop(T, cut(16) + 0.15)})`, textShadow: '0 0 40px rgba(246,207,120,0.35)' }}>0<span style={{ fontFamily: ZH, fontSize: 70 }}> 克</span></div>
            </div>
          </>
        )}
        {shot === 4 && (
          <>
            <Counter2D top={820} pool={[960, 820]} seed={4} />
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
              <defs><radialGradient id="a0q"><stop offset="0" stopColor="#f6cf78" stopOpacity="0.35" /><stop offset="1" stopColor="#f6cf78" stopOpacity="0" /></radialGradient></defs>
              <Can2D kind="red" cx={740} base={820} h={420} id="a0r4" />
              <Can2D kind="black" cx={1180} base={820} h={420} id="a0b4" />
              <circle cx={1180} cy={300} r={150} fill="url(#a0q)" opacity={easeOut(prog(T, cut(24) + 0.3, cut(25)))} />
              <text x={1180} y={350} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 150, fill: GOLD }} opacity={easeOut(prog(T, cut(24) + 0.3, cut(25)))}>？</text>
            </svg>
          </>
        )}
      </AbsoluteFill>
      <SubBand />
      <Subs T={T} lines={LINES_A0} />
    </AbsoluteFill>
  );
};
