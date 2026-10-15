/* Motion test for 《0.1秒》 on the channel track from 0 s: "看好这张脸——", the face for exactly 3 frames on the 0.402 s
   hit, black, the question; the face is engraved back in line by line; one slider runs it from untrustworthy to
   trustworthy; it bursts into gold dust and 0.1秒 slams in on the 8.505 s hit. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Bars, Subs, Canvas, clamp, lerp, eo, eio, pr, hit } from './kit';
import { engraving, particles } from './face';
import { sparks } from './lightkit';

export const MT_FRAMES = Math.round(10.2 * 30);
const H1 = 0.402, H2 = 8.505, B = 0.50625;
const FW = 520, FH = 660, FX = 960 - FW / 2, FY = 150;
const LINES: [number, number, string][] = [
  [0.0, 0.38, '看好这张脸——'],
  [0.62, 3.6, '刚才那个人，值得信任吗？'],
  [3.7, 6.5, '只动眉毛和嘴角，印象就变了'],
  [H2 + 0.05, 10.2, '你只看了[0.1秒]'],
];
export const MotionTest: React.FC = () => {
  const fr = useCurrentFrame(), t = fr / 30;
  const [h] = useState(() => delayRender('mt', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '看好这张脸刚才那个人值得信任吗只动眉毛和嘴角印象就变了你只看了秒可信不0123456789.'))).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const flash = fr >= Math.round(H1 * 30) && fr < Math.round(H1 * 30) + 3;          // exactly 3 frames = 0.1 s
  const rebuild = clamp((t - 2.0) / 1.4);                                              // engraved back in, top to bottom
  // the slider: neutral → untrustworthy → trustworthy → neutral, on its own clock
  const s1 = eio(t, 4.0, 1.0), s2 = eio(t, 5.3, 1.3), s3 = eio(t, 6.9, 0.5);
  const trust = -s1 + 2 * s2 * 1 - s3;
  const burst = eio(t, 7.9, 0.75);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <Canvas dep={fr} draw={(g) => {
            const r = g.createRadialGradient(960, 440, 40, 960, 540, 1000); r.addColorStop(0, '#16131b'); r.addColorStop(1, '#030305'); g.fillStyle = r; g.fillRect(0, 0, 1920, 1080);
            if (flash) { engraving(g, FX, FY, FW, FH, { trust: 0, seed: 1 }, '246,214,150', 4); return; }
            if (t < 2.0) return;
            if (t < 7.6) {
              g.save(); g.beginPath(); g.rect(0, 0, 1920, FY + FH * rebuild); g.clip();
              engraving(g, FX, FY, FW, FH, { trust, seed: 1 }, '240,200,130', 4);
              g.restore();
              if (rebuild < 1) { g.fillStyle = 'rgba(255,230,180,.8)'; g.fillRect(FX - 20, FY + FH * rebuild - 1, FW + 40, 2); }
              // the slider rail
              if (t > 3.8) {
                const a = eo(t, 3.8, 0.3) * (1 - pr(t, 7.2, 0.3)), y = 880, x0 = 700, x1 = 1220, kx = lerp(x0, x1, (trust + 1) / 2);
                g.globalAlpha = a; g.fillStyle = 'rgba(239,232,218,.25)'; g.fillRect(x0, y - 1, x1 - x0, 3);
                g.fillStyle = '#f1c56d'; g.beginPath(); g.arc(kx, y, 13, 0, 6.3); g.fill(); g.globalAlpha = 1;
              }
            } else {
              particles(g, FX, FY, FW, FH, { trust: 0, seed: 1 }, t, burst, '255,214,140', 3);
            }
            if (t >= H2) { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 960, 470, H2, t, 200, '255,214,140', 3, 7); g.restore(); }
          }} />
          {t > 3.8 && t < 7.5 && (
            <>
              <div style={{ position: 'absolute', left: 440, width: 240, top: 856, textAlign: 'right', whiteSpace: 'nowrap', fontFamily: F.sans, fontWeight: 700, fontSize: 44, color: '#ff9ed6', opacity: eo(t, 3.8, 0.3) * (1 - pr(t, 7.2, 0.3)) }}>不可信</div>
              <div style={{ position: 'absolute', left: 1240, width: 200, top: 856, fontFamily: F.sans, fontWeight: 700, fontSize: 44, color: '#f6d58e', opacity: eo(t, 3.8, 0.3) * (1 - pr(t, 7.2, 0.3)) }}>可信</div>
            </>
          )}
          {t >= H2 && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: eo(t, H2, 0.18), transform: `scale(${lerp(1.4, 1, eo(t, H2, 0.22))})`, fontFamily: F.serif, fontWeight: 900, fontSize: 230, lineHeight: 1,
              background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 55%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 8px 40px rgba(0,0,0,.9))', fontVariantNumeric: 'lining-nums' }}>0.1秒</div>
          )}
          <Grade warm={0.03} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: 0.25 * hit(t, H2, 0.08), mixBlendMode: 'screen' }} />
          <Bars />
          <Subs T={t} lines={LINES as any} />
        </>
      )}
    </AbsoluteFill>
  );
};
