/* Douyin covers for 《谁打来的？》: the film's caller wheel, landed on 妈妈 (the 56% card), on the dark stage.
   No ringing, no ringtone cue: the cold-open trick stays a surprise. wide = 1440×1080 (4:3), tall = 1080×1440 (3:4). */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Canvas, glowDot } from './kit';
import { stage, bokeh, spot, floorFade } from './hero';
import { callerCard, feather } from './art';
import { sparks } from './lightkit';

const MAG = '255,110,205';
const gold: React.CSSProperties = { background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 50%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };

/** the 1920×1080 frame: three caller cards in the wheel window, 妈妈 landed and lit */
const Frame: React.FC = () => (
  <Canvas dep={0} draw={(g) => {
    stage(g, 3); bokeh(g, 3, 24, 1.1); spot(g, 960, 820, 0.75, '255,214,235');
    feather(g, 260, 820, 110, (c) => {
      callerCard(c, 960, 370, '领导', 0.45, 0, 1.25);
      callerCard(c, 960, 710, '陌生号码', 0.45, 0, 1.25);
    });
    g.save(); g.globalCompositeOperation = 'lighter'; glowDot(g, 960, 540, 620, 0.35, MAG); g.restore();
    callerCard(g, 960, 540, '妈妈', 1, 1, 1.25);
    g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 960, 540, 0, 0.35, 90, MAG, 1.4, 3); g.restore();
    floorFade(g);
  }} />
);

export const Cover: React.FC<{ layout: 'wide' | 'tall' }> = ({ layout }) => {
  const [h] = useState(() => delayRender('cover-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '亲友突然来电先想到坏事谁打来的？妈领导陌生号码英国岁VIBE知识大赏0123456789%').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const tall = layout === 'tall', Wd = tall ? 1080 : 1440, Ht = tall ? 1440 : 1080;
  const s = tall ? 1.0 : 0.8, ox = tall ? Wd / 2 - 960 * s : 342, oy = tall ? 250 : 88;
  return (
    <AbsoluteFill style={{ background: '#030305', fontVariantNumeric: 'lining-nums' }}>
      <FontFaces />
      {ok && (
        <>
          <div style={{ position: 'absolute', left: ox, top: oy, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0' }}>
            <Frame />
            <Grade warm={0.03} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: tall
            ? 'linear-gradient(180deg,#030305 0%,#030305 22%,rgba(3,3,5,0) 34%,rgba(3,3,5,0) 61%,#030305 72%)'
            : 'linear-gradient(90deg,#030305 0%,#030305 30%,rgba(3,3,5,0) 56%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%)' }} />
          {/* the hook */}
          <div style={{ position: 'absolute', left: tall ? 0 : 96, right: tall ? 0 : undefined, top: tall ? 100 : 270, textAlign: tall ? 'center' : 'left' }}>
            <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: tall ? 112 : 96, lineHeight: 1.2, letterSpacing: '0.04em', ...gold, filter: 'drop-shadow(0 4px 18px rgba(0,0,0,.8))' }}>
              亲友突然来电<br />56%先想到坏事
            </div>
            <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, marginTop: 14, letterSpacing: '0.12em', color: 'rgba(239,232,218,.7)' }}>英国 18–34 岁 · 2024 调查</div>
          </div>
          {/* series line and title */}
          <div style={{ position: 'absolute', left: tall ? 0 : 100, right: tall ? 0 : undefined, top: tall ? 1010 : 640, textAlign: tall ? 'center' : 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.lat, fontStyle: 'italic', fontSize: 30, color: C.gold }}>J</div>
              <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 30, letterSpacing: '0.42em', color: C.gold }}>VIBE知识大赏</div>
            </div>
            <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: tall ? 66 : 62, color: C.cream, marginTop: 18, letterSpacing: '0.06em' }}>《谁打来的？<span style={{ marginLeft: '-0.42em' }}>》</span></div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
export const CoverWide: React.FC = () => <Cover layout="wide" />;
export const CoverTall: React.FC = () => <Cover layout="tall" />;
