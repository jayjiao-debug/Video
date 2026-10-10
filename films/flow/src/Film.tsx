/* 《心流》 full film, timed to the owner's track from 0:00 uncut (title 8.473 · break 49.17 · build 65.45 · drop 81.40),
   ending on a bar line (116.33 s) with the end card under the music. */
import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { Opening } from './Opening';
import { MontageScene } from './Montage';
import { Describe, Attention, Brain, How, TipsV5 } from './Science';
import { DeskScene } from './Desk';
import { CourtScene } from './Court';
import { GOLD, INK, prog, easeOut, easeInOut, Subtitles, Line, Fade } from './art';
import { JUNO } from './brand/identity';
import { font } from './brand/lib';

export const FILM_END = 122.43, FILM_FRAMES = Math.round(FILM_END * 30);
const TITLE = 8.473, END_CARD = 116.4;

export const LINES: Line[] = [
  { t: 0.45, end: 2.9, text: '12分钟，13投13中。' },
  { t: 3.0, end: 5.75, text: '一节37分，NBA纪录。' },
  { t: 5.85, end: 8.35, text: '他说：“一切都有点模糊。”' },
  { t: 12.7, end: 15.9, text: '2006年，科比一场81分。' },
  { t: 16.2, end: 19.6, text: '2004年雅典，刘翔平了世界纪录。' },
  { t: 20.0, end: 23.5, text: '2021年东京，苏炳添跑进9秒83。' },
  { t: 23.8, end: 27.1, text: '同一届，14岁的全红婵，三跳满分。' },
  { t: 27.3, end: 29.9, text: '篮球、跨栏、短跑、跳水——' },
  { t: 30.2, end: 33.3, text: '他们事后的描述，出奇地像：' },
  { t: 33.5, end: 36.7, text: '时间感变了，忽快忽慢；' },
  { t: 37.0, end: 39.7, text: '脑子里那个声音，不见了；' },
  { t: 39.9, end: 42.8, text: '动作好像自己在发生。' },
  { t: 43.0, end: 46.3, text: '心理学家把它叫做“心流”。' },
  { t: 46.5, end: 49.0, text: '可它为什么会发生？' },
  { t: 49.4, end: 52.9, text: '先说一个事实：注意力是有限的。' },
  { t: 53.1, end: 57.2, text: '他估算，大脑每秒只能处理约110比特信息。' },
  { t: 57.4, end: 60.95, text: '光是听懂一个人说话，就要用掉约60。' },
  { t: 61.1, end: 63.95, text: '如果一件事，把带宽全占满了——' },
  { t: 64.1, end: 67.9, text: '就没有余量，留给“我”和“时间”了。' },
  { t: 69.0, end: 72.75, text: '2016年，德国研究者做了个脑扫描实验：' },
  { t: 72.9, end: 76.65, text: '让人做心算，难度三档：太易、刚好、太难。' },
  { t: 76.8, end: 79.8, text: '只有“刚刚好”那一档——' },
  { t: 81.45, end: 84.5, text: '管“想自己”的脑区，安静了下来。', gold: true },
  { t: 84.6, end: 87.5, text: '管恐惧的杏仁核，也安静了。' },
  { t: 87.6, end: 90.5, text: '大脑把资源，全给了手上的事。' },
  { t: 90.6, end: 94.2, text: '这就是心流：不是更用力，是“我”让开了。' },
  { t: 94.5, end: 97.45, text: '怎么进入？难度要刚好够不着。' },
  { t: 97.6, end: 101.1, text: '模型算过：做对约85%时，学得最快。' },
  { t: 101.25, end: 104.3, text: '再加三条：目标、反馈、别被打断。' },
  { t: 111.9, end: 114.2, text: '下次你“手感来了”，' },
  { t: 114.3, end: 116.35, text: '别急着拿起手机。' },
];

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const ring = easeInOut(prog(t, 0, 0.8)), f = (a: number) => easeOut(prog(t, a, a + 0.4));
  const gold: React.CSSProperties = { backgroundImage: 'linear-gradient(180deg,#fbe3a6 0%,#f1c56d 55%,#c8913a 100%)', WebkitBackgroundClip: 'text', color: 'transparent' };
  return (
    <AbsoluteFill style={{ background: '#05060b' }}>
      {/* motif: the tunnel's rings, still */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 0.5 * f(0.6) }}>
        {[1, 2, 3, 4, 5].map((i) => <circle key={i} cx={960} cy={470} r={140 + i * 95} fill="none" stroke={i % 3 ? GOLD : '#8fb8ff'} strokeOpacity={0.25 / i + 0.05} strokeWidth={2} />)}
      </svg>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={960} cy={110} r={46} fill="none" stroke={GOLD} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 110)" />
        <text x={960} y={130} textAnchor="middle" fontFamily={font.latin} fontStyle="italic" fontWeight={700} fontSize={64} fill={GOLD} opacity={f(0.4)}>J</text>
        <text x={960} y={182} textAnchor="middle" fontFamily="JunoMono, monospace" fontWeight={700} fontSize={18} letterSpacing="0.5em" fill={GOLD} opacity={0.8 * f(0.6)}>JUNO</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: font.serif, fontWeight: 900, fontSize: 120, opacity: f(0.5), ...gold }}>《心流》</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 64, color: INK, opacity: f(1.0) }}>你在做什么的时候，“进入过状态”？</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 530, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 34, color: 'rgba(243,237,226,0.62)', opacity: f(1.2) }}>评论区说说</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center', opacity: f(1.5) }}>
        <div style={{ padding: '12px 36px', borderRadius: 40, border: `2px solid ${GOLD}`, fontFamily: font.sans, fontWeight: 700, fontSize: 32, color: GOLD }}>{JUNO.follow}</div>
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 860, textAlign: 'center', fontFamily: font.sans, fontSize: 20, lineHeight: 1.7, color: 'rgba(243,237,226,0.42)', opacity: f(1.8) }}>
        资料：NBA.com · 美联社/ESPN · 新华网 · 中新网 · M. Csikszentmihalyi《Flow》(1990)、TED 2004 · Ulrich, Keller &amp; Grön 2016, SCAN · Wilson et al. 2019, Nature Communications · 画面为代码绘制的示意
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const markO = T < TITLE - 0.2 ? 1 : T < 12.6 ? 0 : T < END_CARD - 0.2 ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: '#040509' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-600-normal.woff2')}) format("woff2"); font-weight: 600; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format("woff2"); font-style: italic; }`}</style>
      {T < 12.5 && <Opening inFilm />}
      {T >= 12.0 && T < 30.5 && <Fade o={prog(T, 12.0, 12.45)}><MontageScene T={T} /></Fade>}
      {T >= 30.0 && T < 49.2 && <Describe T={T} />}
      {T >= 49.17 && T < 69.1 && <Attention T={T} />}
      {T >= 68.8 && T < 94.3 && <Brain T={T} />}
      {T >= 94.2 && T < 104.5 && <How T={T} />}
      {T >= 104.4 && T < 111.85 && <Fade o={prog(T, 104.4, 104.8)}><DeskScene T={96.4 + (T - 104.4) * 0.35} v5 /></Fade>}
      {T >= 104.4 && T < 111.85 && <TipsV5 T={T} />}
      {T >= 111.8 && T < END_CARD + 0.1 && <CourtScene T={T - 6.7} />}
      {T >= END_CARD && <EndCard t={T - END_CARD} />}
      <Subtitles T={T} lines={LINES} />
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * markO, fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
        <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
      </div>
    </AbsoluteFill>
  );
};
