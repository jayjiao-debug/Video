/* Douyin covers for 《这车真能飞？》: the film's car hanging upside down under the steel deck against the dusk sky.
   The verdicts stay in the film; the cover only asks. wide = 1440×1080 (4:3), tall = 1080×1440 (3:4). */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Canvas } from './kit';
import { car, withCam, poseOnTrack, S_TOP, type Cam } from './world';
import { stage } from './Film';

const gold: React.CSSProperties = { background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 50%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };

/** the 1920×1080 frame; (fx, fy) is where the car's centre lands in it */
const Frame: React.FC<{ fx: number; fy: number; s: number }> = ({ fx, fy, s }) => (
  <Canvas dep={0} draw={(g) => {
    const p = poseOnTrack(S_TOP + 700), cam: Cam = { x: p.x - (fx - 960) / s, y: p.y - (fy - 540) / s, s };
    stage(g, 0, cam, 0);
    withCam(g, cam, () => car(g, p, { rim: 1, under: 1, spin: 0.4 }));
    const v = g.createRadialGradient(960, 540, 380, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080);
  }} />
);

export const Cover: React.FC<{ layout: 'wide' | 'tall' }> = ({ layout }) => {
  const [h] = useState(() => delayRender('cover-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([...FONT_LOADS, '900 40px "Noto Serif CJK SC"'].map((x) => document.fonts.load(x, '倒挂着背600升气它能飞多久？这车真VIBE知识大赏特斯拉新跑0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const tall = layout === 'tall';
  const s = tall ? 1.0 : 0.82, ox = tall ? -420 : -60, oy = tall ? 300 : 40;
  return (
    <AbsoluteFill style={{ background: '#05060b', fontVariantNumeric: 'lining-nums' }}>
      <FontFaces />
      {ok && (
        <>
          <div style={{ position: 'absolute', left: ox, top: oy, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0' }}>
            <Frame fx={tall ? 960 : 1360} fy={tall ? 300 : 300} s={tall ? 0.95 : 0.9} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: tall
            ? 'linear-gradient(180deg,#05060b 0%,#05060b 20%,rgba(5,6,11,0) 30%,rgba(5,6,11,0) 64%,#05060b 78%)'
            : 'linear-gradient(0deg,#05060b 0%,#05060b 26%,rgba(5,6,11,0) 52%)' }} />
          {/* series line and title */}
          <div style={{ position: 'absolute', left: tall ? 0 : 90, right: tall ? 0 : undefined, top: tall ? 90 : 700, textAlign: tall ? 'center' : 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.lat, fontStyle: 'italic', fontSize: 30, color: C.gold }}>J</div>
              <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 30, letterSpacing: '0.42em', color: C.gold }}>VIBE知识大赏</div>
            </div>
            <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: tall ? 120 : 116, lineHeight: 1.2, marginTop: 18, letterSpacing: '0.03em', ...gold, filter: 'drop-shadow(0 4px 18px rgba(0,0,0,.85))' }}>《这车真能飞？<span style={{ marginLeft: '-0.42em' }}>》</span></div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
export const CoverWide: React.FC = () => <Cover layout="wide" />;
export const CoverTall: React.FC = () => <Cover layout="tall" />;
