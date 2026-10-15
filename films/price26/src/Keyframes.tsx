/* 《差一分钱》 key frames (documentary desk look). frame k = shot k. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Grain, Bars, Canvas } from './kit';
import { desk, tag, tray, placeValue, odometer, graphPaper, cliffChart, catalogue, calendarPage, chart, pencil, GOLD, MAG } from './props';

const Sub: React.FC<{ s: React.ReactNode }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 58, textAlign: 'center', fontFamily: F.sans, fontWeight: 700, fontSize: 66, color: C.cream, textShadow: '0 2px 6px rgba(0,0,0,.9)' }}>{s}</div>
);
const Slate: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 110, top: 140, fontFamily: F.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: 'rgba(239,232,218,.85)' }}>{s}</div>
);
const Big: React.FC<{ s: React.ReactNode; top: number; size?: number; gold?: boolean }> = ({ s, top, size = 120, gold }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: F.serif, fontWeight: 900, fontSize: size, lineHeight: 1.1,
    ...(gold ? { background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 55%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 30px rgba(0,0,0,.9))' } : { color: C.cream, textShadow: '0 6px 30px rgba(0,0,0,.9)' }) }}>{s}</div>
);
const GL = '#f6d58e', MG = '#ff9ed6';

export const Keyframes: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = useState(() => delayRender('kf', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '¥0123456789.,块多只便宜了一分钱为什么感觉一大截差读个数从左往右看到第一位大脑就开始估是捷径什么都不代表偏偏在进的那刻车价掉二手里程表一过整万英里同条裙子标美元比卖得更好还几周满岁刚过做搭桥手术下次先心把它成心脏病发作住院实验评论区你被哪坑过'))).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return <AbsoluteFill style={{ background: '#000' }}><FontFaces /></AbsoluteFill>;
  let draw: (g: CanvasRenderingContext2D) => void = () => {};
  let over: React.ReactNode = null;
  if (f === 0) {          // 1 hook: the tag turns over to 9.99
    draw = (g) => { desk(g); tag(g, 1120, 560, 1.7, -0.08, '9.99'); pencil(g, 1500, 900, -0.5); tag(g, 520, 300, 0.8, 0.22, '10.00', { strike: true }); };
    over = <><Sub s="只便宜了一分钱，为什么感觉便宜了一大截？" /></>;
  } else if (f === 1) {   // 2 title
    draw = (g) => { desk(g, 960, 420, 0.8); tag(g, 1000, 600, 1.0, -0.06, '9.99', { col: '#7a5a20' }); };
    over = <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: F.lat, fontWeight: 600, fontSize: 30, letterSpacing: '0.3em', color: C.gold }}>LEFT-DIGIT EFFECT · THOMAS & MORWITZ · MMV</div>
      <Big s={<>《差一分钱》</>} top={290} size={130} gold />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: F.serif, fontWeight: 700, fontSize: 48, color: C.cream }}>为什么9.99，看起来比10块便宜那么多？</div>
    </>;
  } else if (f === 2) {   // 3 the two trays
    draw = (g) => { desk(g, 960, 380); tray(g, 300, 330, 560, 420, '9块多', 1, GOLD); tray(g, 1060, 330, 560, 420, '10块', 0); tag(g, 600, 520, 0.85, -0.12, '9.99'); tag(g, 1360, 520, 0.85, 0.08, '10.00'); };
    over = <><Slate s="NYU · 2005" /><Sub s={<>一分钱，硬是被分进了<span style={{ color: GL }}>两个格子</span></>} /></>;
  } else if (f === 3) {   // 4 the place-value bars (the key explanation)
    draw = (g) => { desk(g, 960, 300); placeValue(g, 960, 330, '79900', 1, 0); };
    over = <><Sub s={<>第一位，几乎就决定了一个数<span style={{ color: GL }}>有多大</span></>} /></>;
  } else if (f === 4) {   // 5 the odometer at the roll-over + the cliff chart
    draw = (g) => { desk(g, 700, 360); graphPaper(g, 1020, 170, 760, 620, 0.03); cliffChart(g, 1090, 230, 620, 470, 1, 80000); odometer(g, 560, 520, 1.15, 79999.62); };
    over = <><Slate s="22,000,000 USED-CAR AUCTIONS" /><Sub s={<>里程表一过整万，车价就<span style={{ color: MG }}>掉下一级悬崖</span></>} /></>;
  } else if (f === 5) {   // 6 the catalogue
    draw = (g) => { desk(g, 960, 400); catalogue(g, 370, 180, ['$34', '$39', '$44'], [0.75, 1.0, 0.75], 1, 1); };
    over = <><Slate s="ANDERSON & SIMESTER · 2003" /><Sub s={<>涨价5块，反而<span style={{ color: GL }}>多卖了三分之一</span></>} /></>;
  } else if (f === 6) {   // 7 the hospital: two charts and a calendar
    draw = (g) => { desk(g, 960, 360, 0.9); g.save(); g.translate(960, 470); g.scale(0.82, 0.82); g.translate(-960, -470); chart(g, 560, 470, '还差几周满80岁', '7.0%', '#2a2016', -0.05); chart(g, 1360, 470, '刚过80岁', '5.3%', '#b0284a', 0.04); calendarPage(g, 960, 250, 0.8, '80', '生日', 1); g.restore(); };
    over = <><Slate s="MEDICARE · NEJM 2020" /><Big s={<>只差几周，就被归进了<span style={{ color: MG }}>"80多岁"</span></>} top={800} size={64} /></>;
  } else {                // 8 the ending: read it as 10
    draw = (g) => { desk(g, 900, 420); tag(g, 960, 520, 1.6, -0.04, '9.9'); pencil(g, 1320, 760, -0.7); g.save(); g.strokeStyle = 'rgba(30,30,40,.85)'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(1010, 380); g.quadraticCurveTo(1100, 300, 1220, 330); g.stroke(); g.restore(); };
    over = <><div style={{ position: 'absolute', left: 1220, top: 230, fontFamily: F.serif, fontWeight: 900, fontSize: 110, color: '#1e1e28', transform: 'rotate(-6deg)' }}>≈10</div><Sub s={<>下次看到9.9，先在心里<span style={{ color: GL }}>把它读成10</span></>} /></>;
  }
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      <Canvas dep={f} draw={draw} />
      <Grade warm={0.06} />
      <Grain T={f} />
      <Bars />
      {over}
      {f !== 1 && <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}><span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏</div>}
      {f === 1 ? null : null}
    </AbsoluteFill>
  );
};
