/* Model sheets for 《谁打来的？》: frame 0 = the set at night (wide), frame 1 = the set at the close (dawn, phone face up, warm),
   frame 2 = props. Look at these before any scene is built. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { F, FontFaces, FONT_LOADS, Grade, Canvas } from './kit';
import { roomBack, deskTop, roomFront, phoneFlat, layer, callerCard, onAir, bubble, handset, envelope, gauge, flapBoard, calendar, bars3, MAGC, GOLDC, Cam } from './art';

const lbl = (x: number, y: number, s: string) => (
  <div style={{ position: 'absolute', left: x - 200, width: 400, top: y, textAlign: 'center', fontFamily: F.sans, fontWeight: 700, fontSize: 26, color: 'rgba(239,232,218,.8)', letterSpacing: '0.08em' }}>{s}</div>
);

export const Gallery: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = useState(() => delayRender('gal-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '陌生号码妈尴尬度打字视频语音通话想好了再回36亿ONAIR'))).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return <AbsoluteFill style={{ background: '#000' }}><FontFaces /></AbsoluteFill>;
  if (f <= 1) {
    const dawn = f === 1, cam: Cam = { x: 0, y: 0, s: 1 }, T = 3;
    const o = dawn ? { lamp: 0.6, moon: 0.2, dawn: 1, screen: 0.9, screenCol: GOLDC } : { lamp: 1, moon: 1, screen: 0.0 };
    return (
      <AbsoluteFill style={{ background: '#000' }}>
        <FontFaces />
        <Canvas dep={f} draw={(g) => {
          layer(g, cam, 0.55, () => roomBack(g, T, o));
          layer(g, cam, 1, () => { deskTop(g, T, o); phoneFlat(g, 900, 860, 1, dawn ? 1 : 0, dawn ? 0.9 : 0, T, 0, dawn ? GOLDC : undefined); });
          if (dawn) layer(g, cam, 1, () => callerCard(g, 900, 560, '妈妈', 1, 1, 1, GOLDC));
          layer(g, cam, 1.4, () => roomFront(g, o));
        }} />
        <Grade warm={dawn ? 0.08 : 0.03} />
        <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(239,232,218,.7)' }}>{dawn ? 'SET · 结尾：天亮，手机翻面，暖金来电' : 'SET · 深夜书桌：台灯（暖）+ 月光（冷）+ 扣着的手机'}</div>
      </AbsoluteFill>
    );
  }
  // props sheet
  return (
    <AbsoluteFill style={{ background: '#0a0b10' }}>
      <FontFaces />
      <Canvas dep={f} draw={(g) => {
        const T = 1.3;
        g.fillStyle = '#0a0b10'; g.fillRect(0, 0, 1920, 1080);
        phoneFlat(g, 230, 230, 0.8, 0, 0.8, T, 0);
        phoneFlat(g, 640, 230, 0.8, 1, 0.9, T, 0, MAGC);
        callerCard(g, 1130, 220, '陌生号码', 1, 1, 0.85);
        onAir(g, 1640, 220, 1, 1);
        bubble(g, 420, 520, 1, '想好了再回', 5, true, 1, 0.1);
        bubble(g, 420, 640, 1, '', 0, true, 1, 0.3);
        handset(g, 820, 600, 0.95, -0.12);
        envelope(g, 1150, 590, 0.85);
        gauge(g, 1600, 660, 0.85, '尴尬度', 0.82, 0.38);
        flapBoard(g, 420, 900, 0.62, '36亿', [1, 1, 0.3, 1]);
        calendar(g, 950, 880, 0.62, '20:00', '通话', 1, 1);
        bars3(g, 1500, 990, 0.42, [0.32, 0.8, 0.78]);
      }} />
      {lbl(230, 330, '手机·扣着（边缘漏光）')}{lbl(640, 330, '手机·翻面亮屏')}{lbl(1130, 320, '来电卡（无 App 界面）')}{lbl(1640, 320, 'ON AIR 灯：现场直播')}
      {lbl(420, 700, '消息气泡：能删能改')}{lbl(820, 690, '听筒 = 打电话')}{lbl(1150, 700, '信封 = 写邮件')}{lbl(1600, 700, '表盘：预测(洋红) vs 实际(金)')}
      {lbl(420, 1020, '翻牌数字 36亿')}{lbl(950, 1020, '约好的电话 68%')}{lbl(1500, 1030, '连接感（示意）')}
    </AbsoluteFill>
  );
};
