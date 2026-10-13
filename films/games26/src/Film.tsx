/* 《是菜还是非？》 · 游戏的运气光谱. Low-key product photography look. Music: the channel track from 0 s. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, F, hit, pr, eo } from './kit';
import { CUT, LINES } from './time';
import { S0, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, SEnd } from './Scenes';
import { TT4, HOOK_END } from './Tests';
import { HD } from './Hooks';
export { FILM_FRAMES } from './time';

type Shot = { a: number; z: number; el: (T: number, f: number) => React.ReactNode };
// every scene change (including the switches inside a scene) is a short dissolve with a gentle push:
// the outgoing shot drifts forward and softens, the incoming one settles in, centred just before the cut so the new
// picture owns the beat
const SHOTS: Shot[] = [
  { a: 0, z: HOOK_END, el: (T, f) => <HD T={T} f={f} /> },
  { a: HOOK_END, z: CUT.king, el: (T, f) => <S0 T={T} f={f} pt={1} /> },
  { a: CUT.king, z: CUT.strip, el: (T, f) => <S0 T={T} f={f} pt={2} /> },
  { a: CUT.strip, z: CUT.gallery, el: (T, f) => <TT4 T={T} f={f} /> },
  { a: CUT.gallery, z: CUT.chess, el: (T, f) => <S2 T={T} f={f} /> },
  { a: CUT.chess, z: CUT.go, el: (T, f) => <S3 T={T} f={f} /> },
  { a: CUT.go, z: CUT.solved, el: (T, f) => <S4 T={T} f={f} /> },
  { a: CUT.solved, z: CUT.poker, el: (T, f) => <S5 T={T} f={f} /> },
  { a: CUT.poker, z: CUT.mahjong, el: (T, f) => <S6 T={T} f={f} /> },
  { a: CUT.mahjong, z: CUT.question, el: (T, f) => <S7 T={T} f={f} /> },
  { a: CUT.question, z: CUT.gap, el: (T, f) => <S8 T={T} f={f} /> },
  { a: CUT.gap, z: CUT.result, el: (T, f) => <S9 T={T} f={f} /> },
  { a: CUT.result, z: 93.5, el: (T, f) => <S10 T={T} f={f} sec={false} /> },
  { a: 93.5, z: CUT.pool, el: (T, f) => <S10 T={T} f={f} sec /> },
  { a: CUT.pool, z: 101.85, el: (T, f) => <S11 T={T} f={f} pb={false} /> },
  { a: 101.85, z: CUT.close, el: (T, f) => <S11 T={T} f={f} pb /> },
  { a: CUT.close, z: CUT.end, el: (T, f) => <S12 T={T} f={f} /> },
  { a: CUT.end, z: CUT.fin + 1, el: (T, f) => <SEnd T={T} f={f} /> },
];
const PRE = 0.32, POST = 0.18;
const smooth = (x: number) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k); };
/** one shot in a dissolve; `text` fades the shot's text (everything but its canvas) on its own, so two scenes' labels
    never sit on top of each other: the old text is gone before the midpoint, the new text arrives after it */
const Layer: React.FC<{ id: string; o?: number; s?: number; blur?: number; text?: number; children: React.ReactNode }> = ({ id, o = 1, s = 1, blur = 0, text = 1, children }) => (
  <div className={id} style={{ position: 'absolute', inset: 0, opacity: o, transform: s !== 1 ? `scale(${s})` : undefined }}>
    <style>{`.${id} > div > canvas { filter: ${blur > 0.05 ? `blur(${blur}px)` : 'none'}; } .${id} > div > :not(canvas) { filter: opacity(${text.toFixed(3)}); }`}</style>
    {children}
  </div>
);
const picture = (T: number, f: number) => {
  const i = Math.max(0, SHOTS.findIndex((s) => T >= s.a && T < s.z));
  let p = -1, q = -1, b = 0;
  if (i > 0 && T < SHOTS[i].a + POST) { p = i - 1; q = i; b = SHOTS[i].a; }
  else if (i < SHOTS.length - 1 && T >= SHOTS[i].z - PRE) { p = i; q = i + 1; b = SHOTS[i].z; }
  if (p < 0) return SHOTS[i].el(T, f);
  const k = smooth((T - (b - PRE)) / (PRE + POST));
  return (
    <>
      <Layer id="xf-out" s={1 + 0.035 * k} blur={3 * k} text={1 - smooth(k * 2.2)}>{SHOTS[p].el(T, f)}</Layer>
      <Layer id="xf-in" o={k} s={1.03 - 0.03 * k} text={smooth(k * 2 - 1)}>{SHOTS[q].el(T, f)}</Layer>
    </>
  );
};
const SLAMS = [CUT.title, CUT.drop, CUT.result];
const LOADS = [...FONT_LOADS, '400 40px "DejaVu Sans"', '900 40px "Noto Serif CJK SC"'];

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('film-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(LOADS.map((x) => document.fonts.load(x, '是菜还是非国际象棋围棋麻将0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const markO = T < CUT.gallery ? 1 - pr(T, CUT.title - 0.3, 0.3) : T < CUT.end ? eo(T, CUT.gallery, 0.4) : 0;
  const flash = SLAMS.reduce((m, s) => m + 0.2 * hit(T, s, 0.09), 0);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          {picture(T, f)}
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
