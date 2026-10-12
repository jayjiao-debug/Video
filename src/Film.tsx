/* 《一句话，让钱变便宜》 · 2026 经济学奖解读. Documentary body, three light climaxes. Music: the channel track from 0 s. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, F, hit } from './kit';
import { CUT, LINES } from './time';
import { S1, S2, S3, S4, S6, S7, S11, S12, S12b, EndCard } from './Doc';
import { S5, S8, S9, S10 } from './Light';
export { FILM_FRAMES } from './time';

type Shot = { a: number; z: number; light?: boolean; el: (T: number, f: number) => React.ReactNode };
const SHOTS: Shot[] = [
  { a: 0, z: CUT.yield, el: (T) => <S1 T={T} /> },
  { a: CUT.yield, z: CUT.title - 0.15, el: (T) => <S2 T={T} /> },
  { a: CUT.title - 0.15, z: CUT.laur, el: (T) => <S3 T={T} /> },
  { a: CUT.laur, z: CUT.agg, el: (T) => <S4 T={T} /> },
  { a: CUT.agg, z: CUT.oil, light: true, el: (T, f) => <S5 T={T} f={f} /> },
  { a: CUT.oil, z: CUT.hall, el: (T) => <S6 T={T} /> },
  { a: CUT.hall, z: CUT.city, el: (T) => <S7 T={T} /> },
  { a: CUT.city, z: CUT.wfd, light: true, el: (T, f) => <S8 T={T} f={f} /> },
  { a: CUT.wfd, z: CUT.gap, light: true, el: (T, f) => <S9 T={T} f={f} /> },
  { a: CUT.gap, z: CUT.fg, light: true, el: (T, f) => <S10 T={T} f={f} /> },
  { a: CUT.fg, z: CUT.banks, el: (T) => <S11 T={T} /> },
  { a: CUT.banks, z: CUT.trust, el: (T) => <S12 T={T} /> },
  { a: CUT.trust, z: CUT.end, el: (T) => <S12b T={T} /> },
  { a: CUT.end, z: CUT.fin + 1, el: (T) => <EndCard T={T} /> },
];
const SLAMS = [CUT.oil, CUT.drop, CUT.banks];

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('film-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '一句话让钱变便宜0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const shot = SHOTS.find((s) => T >= s.a && T < s.z) ?? SHOTS[SHOTS.length - 1];
  const markO = T < CUT.title - 0.2 ? 1 : T < CUT.laur ? 0 : T < CUT.end ? 1 : 0;
  const flash = SLAMS.reduce((m, s) => m + 0.22 * hit(T, s, 0.09), 0);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          {shot.el(T, f)}
          {T < CUT.end && <Grade warm={shot.light ? 0.03 : 0.12} />}
          <Grain T={T} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: flash, mixBlendMode: 'screen' }} />
          <Bars />
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9 * markO, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.5)' }}>
            <span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏
          </div>
          <Subs T={T} lines={LINES} />
        </>
      )}
    </AbsoluteFill>
  );
};
