/* Motion test B for 《0.1秒》 with generated stranger portraits (this episode only, the owner's call).
   Channel track from 0 s: "看好这张脸——"; the face lands on the 0.402 s hit and stays half a second; black and the
   question; the face returns and the slider walks it from distrust to trust; it dissolves into gold dust; 0.1秒 on 8.505. */
import React, { useEffect, useRef, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { F, FontFaces, FONT_LOADS, Grade, Bars, Subs, Canvas, clamp, lerp, eo, eio, pr, hit } from './kit';
import { sparks } from './lightkit';

export const MT2_FRAMES = Math.round(10.6 * 30);
const H1 = 0.402, H2 = 8.505;
const FW = 510, FH = 680, FX = 960 - FW / 2, FY = 130;
const LINES: [number, number, string][] = [
  [0.0, 0.38, '看好这张脸——'],
  [1.0, 3.5, '刚才那个人，值得信任吗？'],
  [3.6, 6.9, '只动眉毛和嘴角，印象就变了'],
  [H2 + 0.05, 10.6, '其实，[0.1秒]就够了'],
];
const SRC = { n: 'faces/m30.webp', d: 'faces/m30_distrust.webp', t: 'faces/m30_trust.webp' };

/** sample the neutral portrait once into a point cloud for the dissolve */
let PTS: { x: number; y: number; l: number; r: number }[] | null = null;

export const MotionTest2: React.FC = () => {
  const fr = useCurrentFrame(), t = fr / 30;
  const [h] = useState(() => delayRender('mt2', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const im = new Image(); im.src = staticFile(SRC.n);
    const fonts = Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '看好这张脸刚才那个人值得信任吗只动眉毛和嘴角印象就变了其实秒就够了可信不0123456789.'))).catch(() => null);
    im.onload = () => {
      if (!PTS) {
        const c = document.createElement('canvas'); c.width = 184; c.height = 245; const g = c.getContext('2d')!; g.drawImage(im, 0, 0, 184, 245);
        const d = g.getImageData(0, 0, 184, 245).data; PTS = [];
        for (let y = 0; y < 245; y++) for (let x = 0; x < 184; x++) { const i = (y * 184 + x) * 4, l = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255; if (l > 0.12) PTS.push({ x: x / 184, y: y / 245, l, r: Math.abs(Math.sin(x * 12.99 + y * 78.23) * 43758.5) % 1 }); }
      }
      fonts.then(() => { setOk(true); continueRender(h); });
    };
  }, [h]);
  const show1 = t >= H1 && t < H1 + 0.5;
  const back = t >= 3.4 && t < 7.4;
  // slider: neutral → distrust → trust, then back to neutral before the dissolve
  const toD = eio(t, 4.1, 0.25), toT = eio(t, 5.4, 0.3), toN = eio(t, 6.7, 0.25);
  const sv = -toD + 2 * toT - toN;                         // −1 … 1
  const wD = clamp(-sv), wT = clamp(sv);
  const burst = eio(t, 7.4, 0.9);
  const push = 1 + 0.03 * pr(t, H1, 0.5) + 0.02 * pr(t, 3.4, 4);
  const img = (src: string, o: number) => <Img src={staticFile(src)} style={{ position: 'absolute', left: FX, top: FY, width: FW, height: FH, opacity: o, transform: `scale(${push})`, transformOrigin: '50% 40%',
    WebkitMaskImage: 'radial-gradient(ellipse 62% 70% at 50% 42%, #000 62%, transparent 100%)' }} />;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <Canvas dep={fr} draw={(g) => {
            const r = g.createRadialGradient(960, 440, 40, 960, 540, 1000); r.addColorStop(0, '#16131b'); r.addColorStop(1, '#030305'); g.fillStyle = r; g.fillRect(0, 0, 1920, 1080);
          }} />
          {show1 && img(SRC.n, 1)}
          {back && (
            <>
              {img(SRC.n, eo(t, 3.4, 0.6) * (1 - Math.max(wD, wT)))}
              {img(SRC.d, eo(t, 3.4, 0.6) * wD)}
              {img(SRC.t, eo(t, 3.4, 0.6) * wT)}
            </>
          )}
          <Canvas dep={fr} draw={(g) => {
            if (t > 3.8 && t < 7.2) {
              const a = eo(t, 3.8, 0.3) * (1 - pr(t, 6.9, 0.3)), y = 870, x0 = 700, x1 = 1220, kx = lerp(x0, x1, (sv + 1) / 2);
              g.globalAlpha = a; g.fillStyle = 'rgba(239,232,218,.25)'; g.fillRect(x0, y - 1, x1 - x0, 3);
              g.fillStyle = '#f1c56d'; g.beginPath(); g.arc(kx, y, 13, 0, 6.3); g.fill(); g.globalAlpha = 1;
            }
            if (t >= 7.2 && PTS) {
              g.save(); g.globalCompositeOperation = 'lighter';
              const fade = eo(t, 7.2, 0.3);
              for (const p of PTS) {
                if (p.r > p.l * 1.4) continue;
                const dx = burst * (p.r - 0.5) * 1400, dy = burst * ((p.r * 7) % 1 - 0.5) * 900 - burst * 120;
                g.fillStyle = `rgba(255,214,140,${(0.2 + 0.8 * p.l) * fade * (1 - burst * 0.75)})`;
                g.fillRect(FX + p.x * FW + dx, FY + p.y * FH + dy, 1.6 + 2 * p.l, 1.6 + 2 * p.l);
              }
              g.restore();
            }
            if (t >= H2) { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 960, 470, H2, t, 200, '255,214,140', 3, 7); g.restore(); }
          }} />
          {/* a short mask that wipes the face away at the hand-off to the dust */}
          {t >= 7.2 && t < 7.6 && img(SRC.n, 1 - eo(t, 7.2, 0.35))}
          {t > 3.8 && t < 7.2 && (
            <>
              <div style={{ position: 'absolute', left: 440, width: 240, top: 846, textAlign: 'right', whiteSpace: 'nowrap', fontFamily: F.sans, fontWeight: 700, fontSize: 44, color: '#ff9ed6', opacity: eo(t, 3.8, 0.3) * (1 - pr(t, 6.9, 0.3)) }}>不可信</div>
              <div style={{ position: 'absolute', left: 1240, width: 200, top: 846, fontFamily: F.sans, fontWeight: 700, fontSize: 44, color: '#f6d58e', opacity: eo(t, 3.8, 0.3) * (1 - pr(t, 6.9, 0.3)) }}>可信</div>
            </>
          )}
          {t >= H2 && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: eo(t, H2, 0.18), transform: `scale(${lerp(1.4, 1, eo(t, H2, 0.22))})`, fontFamily: F.serif, fontWeight: 900, fontSize: 230, lineHeight: 1,
              background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 55%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 8px 40px rgba(0,0,0,.9))', fontVariantNumeric: 'lining-nums' }}>0.1秒</div>
          )}
          <Grade warm={0.03} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: 0.12 * hit(t, H1, 0.08) + 0.25 * hit(t, H2, 0.08), mixBlendMode: 'screen' }} />
          <Bars />
          <Subs T={t} lines={LINES as any} />
        </>
      )}
    </AbsoluteFill>
  );
};
