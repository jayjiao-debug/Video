/* 《心流》 full film, timed to the owner's track from 0:00 uncut (title 8.473 · break 49.17 · build 65.45 · drop 81.40),
   ending on a bar line (116.33 s) with the end card under the music. */
import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { Opening } from './Opening';
import { TunnelScene } from './Tunnel';
import { DeskScene } from './Desk';
import { CourtScene } from './Court';
import { GOLD, INK, prog, easeOut, easeInOut, Subtitles, Line, Fade } from './art';
import { JUNO } from './brand/identity';
import { font } from './brand/lib';

export const FILM_END = 116.33, FILM_FRAMES = Math.round(FILM_END * 30);
const TITLE = 8.473, END_CARD = 110.2;

export const LINES: Line[] = [
  { t: 0.45, end: 2.9, text: '12分钟，13投13中。' },
  { t: 3.0, end: 5.75, text: '一节37分，NBA纪录。' },
  { t: 5.85, end: 8.35, text: '他说：“一切都有点模糊。”' },
  { t: 12.4, end: 16.6, text: '1988年，赛车手塞纳跑出一圈，比队友快了1.4秒。' },
  { t: 16.7, end: 20.1, text: '他说：“整条赛道，变成了一条隧道。”' },
  { t: 20.2, end: 23.0, text: '“车和我，合成了一体。”' },
  { t: 23.2, end: 26.3, text: '2006年，科比一场81分。' },
  { t: 26.4, end: 30.5, text: '问他怎么做到的：“就这么发生了，很难解释。”' },
  { t: 30.7, end: 34.0, text: '1992年，乔丹半场投进6个三分。' },
  { t: 34.1, end: 36.7, text: '投完，他自己耸了耸肩。' },
  { t: 36.9, end: 39.5, text: '安东尼一场62分后说：' },
  { t: 39.6, end: 43.9, text: '“只有很少的人知道那种感觉。今晚，我是其中一个。”' },
  { t: 44.0, end: 46.5, text: '隧道、模糊、说不清——' },
  { t: 46.6, end: 49.05, text: '这到底是一种什么状态？' },
  { t: 49.4, end: 53.0, text: '有个心理学家，问了几十年这个问题。' },
  { t: 53.2, end: 57.6, text: '运动员、画家、棋手、作曲家，描述的是同一种感觉。' },
  { t: 57.8, end: 60.5, text: '他把它叫做“心流”。' },
  { t: 60.8, end: 63.8, text: '说不清，不等于没有规律。' },
  { t: 65.6, end: 69.4, text: '第一，像调收音机：太难是杂音，太简单是静音。' },
  { t: 69.5, end: 72.5, text: '心流的台，在刚好够不着的地方。' },
  { t: 72.6, end: 76.3, text: '第二，像开关：詹姆斯每场赛前都抛一把粉。' },
  { t: 76.4, end: 79.9, text: '第三，像篮筐：投完一秒，就知道进没进。' },
  { t: 81.45, end: 84.6, text: '2007年，詹姆斯连得25分。', gold: true },
  { t: 84.7, end: 87.6, text: '难度刚好、有开关、反馈快——' },
  { t: 87.7, end: 90.5, text: '条件一凑齐，心流就来了。' },
  { t: 90.6, end: 93.0, text: '不靠运气，靠条件。' },
  { t: 93.2, end: 96.3, text: '这些条件，你的书桌也能凑齐。' },
  { t: 105.2, end: 107.5, text: '下次你“手感来了”，' },
  { t: 107.6, end: 110.0, text: '别急着拿起手机。' },
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
        资料：NBA.com · 美联社/ESPN · 纽约时报 · K. Sturm《Ayrton Senna》· M. Csikszentmihalyi《Flow》(1990) · 芝加哥大学 · Wilson et al. 2019, Nature Communications · 画面为代码绘制的示意
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
      {T >= 12.0 && T < 49.2 && <Fade o={prog(T, 12.0, 12.45)}><TunnelScene T={T} /></Fade>}
      {T >= 49.17 && T < 72.6 && <DeskScene T={T} />}
      {T >= 72.55 && T < 93.15 && <CourtScene T={T} />}
      {T >= 93.1 && T < 105.15 && <DeskScene T={T} />}
      {T >= 93.1 && T < 93.8 && <AbsoluteFill style={{ background: '#f6efe0', opacity: 1 - prog(T, 93.1, 93.75) }} />}
      {T >= 105.1 && T < END_CARD + 0.1 && <CourtScene T={T} />}
      {T >= END_CARD && <EndCard t={T - END_CARD} />}
      {/* cuts into and out of the dark: 49.17 (the break) is a cut to black and the lamp warms up; 72.55 the radio's warm dial into the court spotlight */}
      <Subtitles T={T} lines={LINES} />
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * markO, fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
        <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
      </div>
    </AbsoluteFill>
  );
};
