/* 《是菜还是非？》 · 游戏的运气光谱. Low-key product photography look. Music: the channel track from 0 s. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, F, hit, pr, eo } from './kit';
import { CUT, LINES } from './time';
import { S0, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, SEnd } from './Scenes';
import { H1, TT4, HOOK_END } from './Tests';
export { FILM_FRAMES } from './time';

type Shot = { a: number; z: number; el: (T: number, f: number) => React.ReactNode };
const SHOTS: Shot[] = [
  { a: 0, z: HOOK_END, el: (T, f) => <H1 T={T} f={f} /> },
  { a: HOOK_END, z: CUT.strip, el: (T, f) => <S0 T={T} f={f} /> },
  { a: CUT.strip, z: CUT.gallery, el: (T, f) => <TT4 T={T} f={f} /> },
  { a: CUT.gallery, z: CUT.chess, el: (T, f) => <S2 T={T} f={f} /> },
  { a: CUT.chess, z: CUT.go, el: (T, f) => <S3 T={T} f={f} /> },
  { a: CUT.go, z: CUT.solved, el: (T, f) => <S4 T={T} f={f} /> },
  { a: CUT.solved, z: CUT.poker, el: (T, f) => <S5 T={T} f={f} /> },
  { a: CUT.poker, z: CUT.mahjong, el: (T, f) => <S6 T={T} f={f} /> },
  { a: CUT.mahjong, z: CUT.question, el: (T, f) => <S7 T={T} f={f} /> },
  { a: CUT.question, z: CUT.gap, el: (T, f) => <S8 T={T} f={f} /> },
  { a: CUT.gap, z: CUT.result, el: (T, f) => <S9 T={T} f={f} /> },
  { a: CUT.result, z: CUT.pool, el: (T, f) => <S10 T={T} f={f} /> },
  { a: CUT.pool, z: CUT.close, el: (T, f) => <S11 T={T} f={f} /> },
  { a: CUT.close, z: CUT.end, el: (T, f) => <S12 T={T} f={f} /> },
  { a: CUT.end, z: CUT.fin + 1, el: (T, f) => <SEnd T={T} f={f} /> },
];
const SLAMS = [CUT.king, CUT.title, CUT.drop, CUT.result];
const LOADS = [...FONT_LOADS, '400 40px "DejaVu Sans"', '900 40px "Noto Serif CJK SC"'];

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('film-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(LOADS.map((x) => document.fonts.load(x, '是菜还是非国际象棋围棋麻将0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const shot = SHOTS.find((s) => T >= s.a && T < s.z) ?? SHOTS[SHOTS.length - 1];
  const markO = T < CUT.gallery ? 1 - pr(T, CUT.title - 2, 0.4) : T < CUT.end ? eo(T, CUT.gallery, 0.4) : 0;
  const flash = SLAMS.reduce((m, s) => m + 0.2 * hit(T, s, 0.09), 0);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          {shot.el(T, f)}
          {T < CUT.end && <Grade warm={0.03} />}
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
