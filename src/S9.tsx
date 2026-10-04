import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Globe, C, worldOf, project, spinFor } from './globe';
import { b, prog, easeOut, easeIn, easeInOut, lerp, EN, ZH, GOLD, INK, FILM_END, type Key } from './lib';
import { Subs, SubBand, type Line } from './ui';
import { GoldTitle } from './Title';
import { COUNT } from './S01';
import { JUNO } from './brand/identity';

/* S9 (b294–end): back to the opening image. The same Earth; the 65 countries whose population begins with 1 light
   up gold, sweeping west to east. Then the end card (last ~6 s, from b310): title, the nine bars, the question for
   the comments, the follow line, sources and model credits. The music runs out under it (outro from 162.1 s). */
export const S9_IN = b(294) - 0.4, END_IN = b(310);

export const LINES_S9: Line[] = [
  [b(294) + 0.1, b(302) - 0.1, '下次看到一串数字，', 'Next time you see a column of numbers,'],
  [b(302) + 0.06, END_IN - 0.25, '先看第一位。', 'look at the first digit.'],
];

const FACE = 40;
const SPIN = (T: number) => spinFor(FACE) + 3 * (T - S9_IN);
const KEYS: Key[] = [
  [S9_IN, [0, 2.0, 30], [0, 1.0, 0]],
  [END_IN, [0, 1.2, 22], [0, 0.4, 0]],
  [FILM_END, [0, 1.2, 21], [0, 0.4, 0]],
];
const ONES = C.map((c, i) => ({ c, i })).filter(({ c }) => c.d === 1).sort((a, z) => a.c.lon - z.c.lon);
const litAt = (k: number) => b(296) + (k / ONES.length) * 4.5;

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const t = T - END_IN;
  if (t < -0.1) return null;
  const bg = easeInOut(prog(t, 0, 0.8));
  const black = easeIn(prog(T, FILM_END - 0.5, FILM_END));
  const o = (a: number, d = 0.5) => easeOut(prog(t, a, a + d));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <defs><linearGradient id="endbar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6a8" /><stop offset="1" stopColor="#c8913a" /></linearGradient></defs>
        <rect width={1920} height={1080} fill="#05060b" opacity={0.8 * bg} />
        <text x={960} y={250} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(0.2)}>BENFORD'S LAW · 本福特定律</text>
        <GoldTitle text="第一位数字" T={T} at={END_IN + 0.3} size={104} y={392} />
        {Array.from({ length: 9 }, (_, k) => {
          const h = (COUNT(k + 1) / 65) * 110 * o(0.8 + k * 0.05, 0.4);
          return <rect key={k} x={960 + (k - 4) * 34 - 12} y={520 - h} width={24} height={h} fill="url(#endbar)" />;
        })}
        <text x={960} y={610} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 48, fill: INK, letterSpacing: '0.06em' }} opacity={o(1.4)}>不许想——随手打一个四位数，第一位是几？</text>
        <text x={960} y={660} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.12em' }} opacity={o(1.8)}>评论区见，看看我们能不能骗过本福特</text>
        <g opacity={o(2.3)}>
          <rect x={960 - 330} y={712} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={749} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(2.7)} style={{ fontFamily: ZH, fontSize: 17, letterSpacing: '0.03em', fill: 'rgba(243,237,226,0.42)' }}>
          <text x={960} y={958} textAnchor="middle">资料：Newcomb, Am. J. Math. (1881) · Benford, Proc. Am. Phil. Soc. (1938) · Nigrini, J. Accountancy (1999) · Rauch 等, German Economic Review (2011) · 世界银行人口数据 (2025)</text>
          <text x={960} y={986} textAnchor="middle">3D 模型（CC BY）：“Antique Desk” “Ink Bottle with Quill” by Matthew Collings · “Victorian Brass Oil Lamp” by tijerin_art · Sketchfab　|　地球贴图：three.js（MIT）</text>
          <text x={960} y={1014} textAnchor="middle">小镇、支票分布与欧盟地图为示意　|　希腊赤字与救助数据：欧洲稳定机制（ESM）</text>
        </g>
        <rect width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};

export const S9: React.FC<{ T: number }> = ({ T }) => {
  if (T < S9_IN) return null;
  const o = easeOut(prog(T, S9_IN, S9_IN + 0.8));
  const dim = 1 - 0.55 * easeInOut(prog(T, END_IN, END_IN + 0.8));
  return (
    <AbsoluteFill style={{ backgroundColor: '#02040a' }}>
      <AbsoluteFill style={{ opacity: o }}>
        <Globe T={T} keys={KEYS} spin={SPIN(T)} dim={dim} />
        {ONES.map(({ c, i }, k) => {
          const p = project(KEYS, T, worldOf(c.lat, c.lon, SPIN(T), 5.05));
          const a = easeOut(prog(T, litAt(k), litAt(k) + 0.5)) * Math.max(0, Math.min(1, (p.facing - 0.05) / 0.2)) * dim;
          if (a <= 0.01) return null;
          return <div key={c.code} style={{ position: 'absolute', left: p.x - 7, top: p.y - 7, width: 14, height: 14, borderRadius: 7, background: GOLD, opacity: a, boxShadow: '0 0 16px 4px rgba(246,207,120,0.75)' }} />;
        })}
        <div style={{ position: 'absolute', top: 120, right: 70, textAlign: 'right', opacity: easeOut(prog(T, b(296), b(297))) * (1 - easeInOut(prog(T, END_IN - 0.4, END_IN))) }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 84, lineHeight: 1, color: GOLD, fontVariantNumeric: 'lining-nums' }}>65</div>
          <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.7)', letterSpacing: '0.1em' }}>个国家和地区 · 人口以 1 开头</div>
        </div>
      </AbsoluteFill>
      <SubBand o={1 - prog(T, END_IN - 0.3, END_IN + 0.3)} />
      <Subs T={T} lines={LINES_S9} />
      <EndCard T={T} />
    </AbsoluteFill>
  );
};
