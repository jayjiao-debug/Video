/* Douyin covers for 《是菜还是非？》: the film's own opening frame (the golden pan tossing the plaque, its gold ？ side up),
   a vignette, and a two-line gold hook. wide = 1440×1080 (4:3), tall = 1080×1440 (3:4, lower 18% kept clear). */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade } from './kit';
import { HD } from './Hooks';
import { bt } from './time';

const T = bt(6) - 0.06, FR = Math.round(T * 30);          // the last toss at its apex: the gold ？ facing the camera
const gold: React.CSSProperties = { background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 50%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };

export const Cover: React.FC<{ layout: 'wide' | 'tall' }> = ({ layout }) => {
  const [h] = useState(() => delayRender('cover-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '运气决定一局实力百是菜还非？VIBE知识大赏')).map((p) => p.catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const tall = layout === 'tall', Wd = tall ? 1080 : 1440, Ht = tall ? 1440 : 1080;
  // where the 1920×1080 film frame sits inside the cover
  const s = tall ? 1.02 : 0.95, ox = tall ? Wd / 2 - 960 * s : Wd - 1920 * s + 560, oy = tall ? 262 : 120;
  return (
    <AbsoluteFill style={{ background: '#030305', fontVariantNumeric: 'lining-nums' }}>
      <FontFaces />
      {ok && (
        <>
          <div style={{ position: 'absolute', left: ox, top: oy, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0' }}>
            <HD T={T} f={FR} />
            <Grade warm={0.03} />
          </div>
          {/* blend the frame edges into black, and a vignette */}
          <div style={{ position: 'absolute', inset: 0, background: tall
            ? 'linear-gradient(180deg,#030305 0%,#030305 20%,rgba(3,3,5,0) 34%,rgba(3,3,5,0) 70%,#030305 86%)'
            : 'linear-gradient(90deg,#030305 0%,#030305 30%,rgba(3,3,5,0) 58%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%)' }} />
          {/* the hook */}
          <div style={{ position: 'absolute', left: tall ? 0 : 96, right: tall ? 0 : undefined, top: tall ? 96 : 250, textAlign: tall ? 'center' : 'left' }}>
            <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: tall ? 118 : 112, lineHeight: 1.18, letterSpacing: '0.04em', ...gold, filter: 'drop-shadow(0 4px 18px rgba(0,0,0,.8))' }}>
              运气决定一局<br />实力决定一百局
            </div>
          </div>
          {/* series line and title */}
          <div style={{ position: 'absolute', left: tall ? 0 : 100, right: tall ? 0 : undefined, top: tall ? 1018 : 590, textAlign: tall ? 'center' : 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.lat, fontStyle: 'italic', fontSize: 30, color: C.gold }}>J</div>
              <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 30, letterSpacing: '0.42em', color: C.gold }}>VIBE知识大赏</div>
            </div>
            <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: tall ? 64 : 60, color: C.cream, marginTop: 18, letterSpacing: '0.06em' }}>《是菜还是非？<span style={{ marginLeft: '-0.42em' }}>》</span></div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
