import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { b, prog, easeOut, easeInOut, clamp, Subs9, Band9, Tag9, Note9, Line9, SANS, MONO, AMBER, WHITE, DIMW } from './kit9';
import { RoadScene, CITY_OUT, END_IN, CARD9 } from './Road9';
import { SpringScene, SP_IN } from './Spring9';
import { CornerMark } from '../brand/CornerMark';
import { JUNO } from '../brand/identity';
import { Grain, Vignette } from '../ui';

/* 《越修越堵》 (Braess's paradox). Night, long-exposure light, no people. Every frame is a pure function of T. */
export const FILM_END9 = CARD9 + 7.4;
export const EP9_FRAMES = Math.round(FILM_END9 * 30);
const TITLE = b(32), TITLE_OUT = b(36);

const g = (a: number) => b(a) + 0.05, e = (a: number) => b(a) - 0.08;
export const LINES9: Line9[] = [
  [-0.4, e(21.2), '多修了一条路', 'One new road was built.'],
  [g(21.2), e(26.4), '所有人回家，都[慢了15分钟]', 'And everyone got home 15 minutes later.'],
  [g(26.4), b(31.6), '没有事故，也没人开错路', 'No accident. Nobody took a wrong turn.'],
  [b(36.2), e(40.2), '从A到B，有两条路线', 'From A to B there are two routes.'],
  [g(40.2), e(44.6), '细路：车越多，越慢', 'Narrow roads: the more cars, the slower.'],
  [g(44.6), e(48.8), '宽路：永远45分钟', 'Wide roads: always 45 minutes.'],
  [g(48.8), e(53.2), '晚高峰，4000辆车', 'Rush hour: 4,000 cars.'],
  [g(53.2), e(58.4), '每个司机，都挑最快的走', 'Every driver takes the fastest route.'],
  [g(58.4), e(64), '各走一半，[65分钟]到家', 'Half each way: home in 65 minutes.'],
  [g(64), e(68.9), '中间修一条[0分钟]近路', 'Now add a zero-minute shortcut.'],
  [g(68.9), e(74.3), '上面的车一算：抄近道更快', 'Cars on top do the math: the shortcut is faster.'],
  [g(74.3), b(80) - 0.12, '人人都这么想', 'Everyone thinks the same.'],
  [b(80), e(85), '40＋0＋40＝[80分钟]', '40 + 0 + 40 = 80 minutes.'],
  [g(85), e(90.6), '回宽路？[85分钟]，更亏', 'Back to a wide road? 85. Worse.'],
  [g(90.6), b(96) - 0.1, '所以谁也不换，全卡在80', 'So nobody moves. Everyone is stuck at 80.'],
  [b(96.1), e(101.4), '把近路封掉？又回到[65]', 'Close the shortcut: back to 65.'],
  [g(101.4), e(106.8), '这叫[布雷斯悖论]，1968年', "This is Braess's paradox, 1968."],
  [g(106.8), e(112.4), '2008年，物理学家算了真实路网', 'In 2008, physicists ran real road networks.'],
  [g(112.4), e(118.4), '波士顿有[6段路]，封掉任一段都更快', 'Boston: closing any one of 6 roads made trips faster.'],
  [g(118.4), b(123.7), '伦敦有7段，纽约有12段', 'London had 7. New York, 12.'],
  [b(124.1), e(128), '不只是路', 'It is not only roads.'],
  [g(128), e(134), '1991年《Nature》：弹簧吊重物', '1991, Nature: a weight on springs.'],
  [g(134), e(139.4), '两根弹簧，中间一根短绳', 'Two springs, joined by a short string.'],
  [g(139.4), e(144.8), '两边还有两根松着的长绳', 'Two long slack strings on the sides.'],
  [g(144.8), e(150), '剪断中间那根短绳', 'Cut the short string in the middle.'],
  [g(150), b(156) - 0.15, '重物会掉下去吗？', 'Will the weight drop?'],
  [b(160), e(164.6), '[它升上去了]', 'It goes up.'],
  [g(164.6), e(170.2), '串联变并联，每根只扛一半', 'Series becomes parallel: each spring holds half.'],
  [g(170.2), e(175.6), '那根短绳，就是那条近路', 'That short string is the shortcut.'],
  [g(175.6), e(181.6), '人人都选最好的路，合起来却最慢', 'Everyone takes their best road; together, all are slower.'],
  [g(181.6), CARD9 - 0.15, '有时候少一条路，大家才[都快]', 'Sometimes one road fewer makes everyone faster.'],
];

const Title9: React.FC<{ T: number; at: number; out?: number; y?: number; size?: number }> = ({ T, at, out = 1e9, y = 330, size = 150 }) => {
  const k = easeOut(prog(T, at, at + 0.7)), o = Math.min(k, 1 - prog(T, out - 0.4, out));
  if (o <= 0) return null;
  const sweep = clamp((T - at) / 0.9);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: o }}>
      <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.6em', color: AMBER, marginBottom: 26 }}>BRAESS'S PARADOX · 布雷斯悖论</div>
      <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: size, lineHeight: 1, letterSpacing: '0.32em', marginRight: '-0.32em', color: WHITE, filter: `blur(${(1 - k) * 10}px)`, textShadow: '0 0 30px rgba(255,220,180,0.35), 0 0 80px rgba(255,170,90,0.25)' }}>越修越堵</div>
      <div style={{ margin: '34px auto 0', width: 760, height: 2, background: `linear-gradient(90deg, rgba(255,179,71,0) ${sweep * 100 - 30}%, rgba(255,236,210,0.95) ${sweep * 100}%, rgba(255,179,71,0) ${sweep * 100 + 4}%)` }} />
    </div>
  );
};

const EndCard9: React.FC<{ T: number }> = ({ T }) => {
  const t = T - CARD9;
  if (t < -0.05) return null;
  const o = (a: number, d = 0.5) => easeOut(prog(t, a, a + d));
  const black = Math.pow(prog(T, FILM_END9 - 0.8, FILM_END9), 2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: '#030409', opacity: 0.72 * easeInOut(prog(t, 0, 0.8)) }} />
      <Title9 T={T} at={CARD9 + 0.2} y={210} size={120} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: o(1.2) }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 46, color: WHITE, letterSpacing: '0.06em' }}>你家附近，有越修越堵的路吗？</div>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 26, color: DIMW, letterSpacing: '0.12em', marginTop: 18, opacity: o(1.6) / Math.max(o(1.2), 0.001) }}>@ 一个天天堵在路上的朋友</div>
      </div>
      <div style={{ position: 'absolute', left: 960 - 330, top: 716, width: 660, height: 56, borderRadius: 28, border: '1px solid rgba(255,179,71,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o(2.1), fontFamily: SANS, fontWeight: 400, fontSize: 25, letterSpacing: '0.2em', color: AMBER }}>{JUNO.follow}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 950, textAlign: 'center', opacity: o(2.5), fontFamily: SANS, fontWeight: 300, fontSize: 17, lineHeight: 1.75, letterSpacing: '0.03em', color: 'rgba(243,241,236,0.42)' }}>
        <div>资料：Braess, Unternehmensforschung (1968) · Easley &amp; Kleinberg《Networks, Crowds, and Markets》第8章 · Youn, Gastner &amp; Jeong, Physical Review Letters 101 (2008)</div>
        <div>Cohen &amp; Horowitz, Nature 352 (1991)　例题数值为代码重算；城市路网与弹簧为示意</div>
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

export const Ep9Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts9', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['200 40px "Noto Sans CJK SC"', '300 40px "Noto Sans CJK SC"', '400 40px "Noto Sans CJK SC"', '500 40px "Noto Sans CJK SC"', '400 40px "DejaVu Sans Mono"']
      .map((f) => document.fonts.load(f, '0123越修越堵分钟ABP')).map((p) => p.catch(() => null))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  if (!ready) return null;
  const mainO = 1 - easeInOut(prog(T, CITY_OUT - 0.5, CITY_OUT + 0.2));
  const titleDim = Math.min(easeOut(prog(T, TITLE - 0.2, TITLE + 0.4)), 1 - prog(T, TITLE_OUT - 0.4, TITLE_OUT));
  const markO = easeOut(prog(T, TITLE_OUT, TITLE_OUT + 0.8)) * (1 - prog(T, CARD9 - 0.3, CARD9 + 0.2));
  return (
    <AbsoluteFill style={{ backgroundColor: '#030409' }}>
      {T < CITY_OUT + 0.3 && <RoadScene T={T} part="main" o={mainO} />}
      <SpringScene T={T} />
      {T >= END_IN - 0.05 && <RoadScene T={T} part="end" o={easeInOut(prog(T, END_IN, END_IN + 1.2))} />}
      {titleDim > 0 && <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(3,4,9,0.75) 0%, rgba(3,4,9,0.35) 100%)', opacity: titleDim }} />}
      <Title9 T={T} at={TITLE} out={TITLE_OUT} />
      <Tag9 T={T} at={b(36.4)} out={b(64)} n="01" text="两条路线" />
      <Tag9 T={T} at={b(64.2)} out={b(96)} n="02" text="近路" />
      <Tag9 T={T} at={b(96.2)} out={CITY_OUT} n="03" text="真实城市" />
      <Tag9 T={T} at={SP_IN + 0.6} out={b(164.8)} n="04" text="弹簧" />
      <Note9 T={T} at={b(36.4)} out={b(101.2)} text="例题：Easley & Kleinberg《Networks, Crowds, and Markets》第8章　数值为代码实时计算" />
      <Note9 T={T} at={b(101.4)} out={b(106.6)} text="Braess, D. Über ein Paradoxon aus der Verkehrsplanung, Unternehmensforschung 12 (1968)" />
      <Note9 T={T} at={b(106.8)} out={CITY_OUT - 0.2} text="示意路网，非真实街道　资料：Youn, Gastner & Jeong, Physical Review Letters 101, 128701 (2008)" />
      <Note9 T={T} at={b(128.2)} out={b(172.4)} text="Cohen & Horowitz, Nature 352, 699 (1991)　理想弹簧示意，高度为论文数值" />
      <Band9 o={T < CARD9 ? 0.9 : 0} />
      <Subs9 T={T} lines={LINES9} />
      <EndCard9 T={T} />
      <CornerMark o={markO} />
      <Vignette strength={0.5} />
      <Grain />
    </AbsoluteFill>
  );
};
