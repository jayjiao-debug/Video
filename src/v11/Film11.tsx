import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { CornerMark } from '../brand/CornerMark';
import { Defs11, Desk, Grain11, Subs11, win, eo, pr } from './kit11';
import { CUT, LINES11 } from './time11';
import { S01, S02, S03S04 } from './Open11';
import { S05S06 } from './Mid11';
import { S07S09 } from './Sheet11';
import { S10S11 } from './Game11';
import { S12 } from './Machine11';
import { S13S14 } from './End11';

export { EP11_FRAMES, LINES11 } from './time11';

/* 《舍不得的，是TA吗？》 (ep11 · 感情里的经济学). Every frame is a pure function of T. */
export const Ep11Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts11', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all([
      '500 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '700 40px "Cormorant Garamond"', 'italic 600 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"',
      '900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '600 40px "Noto Serif CJK SC"',
      '500 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '400 40px "DejaVu Sans Mono"',
    ].map((f) => document.fonts.load(f, '0123456789%舍不得是TA吗账本AB')).map((p) => p.catch(() => null))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  if (!ready) return null;
  const markO = Math.min(1, 1 - win(T, CUT.s4 + 0.05, CUT.s5 + 0.15, 0.25, 0.3)) * (1 - pr(T, CUT.s14 - 0.2, 0.4));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d', overflow: 'hidden' }}>
      <Defs11 />
      <Desk />
      <S01 T={T} />
      <S03S04 T={T} />
      <S02 T={T} />
      <S05S06 T={T} />
      <S07S09 T={T} />
      <S10S11 T={T} />
      <S12 T={T} />
      <S13S14 T={T} />
      <S12 T={T} layer="over" />
      <Subs11 T={T} lines={LINES11} />
      {(() => {
        const onPaper = T > CUT.s5 + 0.3 && T < CUT.s14 + 0.4; // the zoomed page sits under the mark
        return markO > 0.001 ? (
          <div style={{ position: 'absolute', top: onPaper ? 24 : 44, right: 56, opacity: (onPaper ? 0.6 : 0.55) * markO, fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: onPaper ? 'rgba(30,26,22,0.62)' : 'rgba(243,237,226,0.58)' }}>
            <span style={{ color: onPaper ? '#9a6c1f' : '#f1c56d' }}>◆ </span>Juno · VIBE知识大赏
          </div>
        ) : null;
      })()}
      <Grain11 />
    </AbsoluteFill>
  );
};
