/* 《一句话，让钱变便宜》 · 2026 经济学奖解读. Documentary body, three light climaxes. Music: the channel track from 0 s. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, F, hit } from './kit';
import { CUT, LINES } from './time';
import { G1, G2, G3, G4, G6, G7, G11, G12, G12b, GEnd, G3_START } from './Glow';
import { S5, S8, S9, S10 } from './Light';
export { FILM_FRAMES } from './time';

type Shot = { a: number; z: number; light?: boolean; el: (T: number, f: number) => React.ReactNode };
const SHOTS: Shot[] = [
  { a: 0, z: CUT.yield, light: true, el: (T, f) => <G1 T={T} f={f} /> },
  { a: CUT.yield, z: G3_START, light: true, el: (T, f) => <G2 T={T} f={f} /> },
  { a: G3_START, z: CUT.laur, light: true, el: (T, f) => <G3 T={T} f={f} /> },
  { a: CUT.laur, z: CUT.agg, light: true, el: (T, f) => <G4 T={T} f={f} /> },
  { a: CUT.agg, z: CUT.oil, light: true, el: (T, f) => <S5 T={T} f={f} /> },
  { a: CUT.oil, z: CUT.hall, light: true, el: (T, f) => <G6 T={T} f={f} /> },
  { a: CUT.hall, z: CUT.city, light: true, el: (T, f) => <G7 T={T} f={f} /> },
  { a: CUT.city, z: CUT.wfd, light: true, el: (T, f) => <S8 T={T} f={f} /> },
  { a: CUT.wfd, z: CUT.gap, light: true, el: (T, f) => <S9 T={T} f={f} /> },
  { a: CUT.gap, z: CUT.fg, light: true, el: (T, f) => <S10 T={T} f={f} /> },
  { a: CUT.fg, z: CUT.banks, light: true, el: (T, f) => <G11 T={T} f={f} /> },
  { a: CUT.banks, z: CUT.trust, light: true, el: (T, f) => <G12 T={T} f={f} /> },
  { a: CUT.trust, z: CUT.end, light: true, el: (T, f) => <G12b T={T} f={f} /> },
  { a: CUT.end, z: CUT.fin + 1, light: true, el: (T, f) => <GEnd T={T} f={f} /> },
];
const SLAMS = [CUT.oil, CUT.drop, CUT.banks];

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('film-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '一句话让钱变便宜0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const shot = SHOTS.find((s) => T >= s.a && T < s.z) ?? SHOTS[SHOTS.length - 1];
  const markO = T < G3_START ? 1 : T < CUT.laur ? 0 : T < CUT.end ? 1 : 0;
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
