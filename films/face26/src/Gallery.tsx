/* Look-development sheets for 《0.1秒》. frame 0: four styles of the same stranger; frame 1: the trust axis, painted;
   frame 2: the trust axis, engraving. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { F, FontFaces, FONT_LOADS, Canvas } from './kit';
import { drawFace, engraving, particles, lineFace, FaceP } from './face';

const lbl = (x: number, y: number, s: string) => <div style={{ position: 'absolute', left: x - 240, width: 480, top: y, textAlign: 'center', fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: 'rgba(239,232,218,.85)' }}>{s}</div>;
const bg = (g: CanvasRenderingContext2D) => { const r = g.createRadialGradient(960, 420, 50, 960, 540, 1100); r.addColorStop(0, '#15131c'); r.addColorStop(1, '#030305'); g.fillStyle = r; g.fillRect(0, 0, 1920, 1080); };

export const Gallery: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = useState(() => delayRender('g', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '写实油画光点雕版线条可信不可信中性'))).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return <AbsoluteFill style={{ background: '#000' }} />;
  const p: FaceP = { trust: 0, seed: 1 };
  if (f === 0) return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      <Canvas dep={0} draw={(g) => {
        bg(g);
        drawFace(g, 240, 420, 0.62, p);
        particles(g, 480 + 15, 140, 450, 570, p, 0, 0, '255,214,140', 4);
        engraving(g, 960 + 15, 140, 450, 570, p, '240,200,130', 5);
        lineFace(g, 1680, 420, 0.62, p);
      }} />
      {lbl(240, 900, 'A 写实油画')}{lbl(720, 900, 'B 金色光点')}{lbl(1200, 900, 'C 钞票雕版')}{lbl(1680, 900, 'D 极简线条')}
    </AbsoluteFill>
  );
  const T = [-1, -0.5, 0, 0.5, 1];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      <Canvas dep={f} draw={(g) => {
        bg(g);
        T.forEach((t, i) => {
          const x = 192 + i * 384;
          if (f === 1) drawFace(g, x, 430, 0.56, { trust: t, seed: 1 });
          else engraving(g, x - 180, 170, 360, 456, { trust: t, seed: 1 }, '240,200,130', 4);
        });
      }} />
      {T.map((t, i) => lbl(192 + i * 384, 880, t < -0.6 ? '不可信' : t < 0 ? '偏不可信' : t === 0 ? '中性' : t < 0.6 ? '偏可信' : '可信'))}
    </AbsoluteFill>
  );
};
