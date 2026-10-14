/* 6 s motion test for 《谁打来的？》 on the channel track 29.3 → 35.3 s (hit at 32.806 = 3.506 s here):
   night desk, camera pushes in with parallax while the face-down phone buzzes and leaks light; on the hit it turns
   itself face up, the room goes magenta and the caller card rises: 陌生号码. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { FontFaces, FONT_LOADS, Grade, Bars, Subs, Canvas, eio, eo, pr, hit, clamp, lerp, F } from './kit';
import { sparks } from './lightkit';
import { roomBack, deskTop, roomFront, phoneFlat, layer, callerCard, Cam, MAGC, glow } from './art';

export const MT_FRAMES = 180;
const HIT = 32.806 - 29.3;
const LINES: [number, number, string][] = [
  [0.3, 3.35, '陌生号码，更让人往坏处想'],
  [3.7, 6.0, '不接电话的头号理由：怕是[骚扰或诈骗]'],
];
const add = (g: CanvasRenderingContext2D, fn: () => void) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };

export const MotionTest: React.FC = () => {
  const fr = useCurrentFrame(), t = fr / 30;
  const [h] = useState(() => delayRender('mt-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '陌生号码更让人往坏处想不接电话的头号理由怕是骚扰或诈骗'))).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  // camera: a slow push from the window side down onto the phone; a small kick on the hit, then it keeps drifting
  const k = eio(t, 0, 3.6), kick = hit(t, HIT, 0.25);
  const cam: Cam = { x: lerp(-160, 10, k) + 30 * pr(t, HIT, 2.5), y: lerp(-30, 120, k), s: lerp(1.0, 1.32, k) + 0.04 * eo(t, HIT, 2.5) + 0.03 * kick };
  // buzz: 0.6 s on / 0.45 s off, on its own clock, stops when the phone turns over
  const cyc = (t + 0.2) % 1.05, buzz = t < HIT ? clamp(Math.min(cyc / 0.05, (0.6 - cyc) / 0.05)) : 0;
  const flip = eio(t, HIT, 0.36), up = t >= HIT;
  const scr = up ? 0.6 + 0.4 * eo(t, HIT + 0.18, 0.3) : 0.5 * buzz;
  const card = eo(t, HIT + 0.28, 0.45);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <Canvas dep={fr} draw={(g) => {
            const o = { lamp: 1 - 0.35 * flip, moon: 1, screen: scr, screenCol: up ? MAGC : '205,220,255', screenX: 960, screenY: 850 };
            layer(g, cam, 0.55, () => roomBack(g, t, o));
            layer(g, cam, 1, () => {
              deskTop(g, t, o);
              phoneFlat(g, 960, 850, 1, flip, up ? scr : buzz, t, buzz, up ? MAGC : undefined);
              if (up) add(g, () => sparks(g, 960, 830, HIT + 0.2, t, 70, MAGC, 1.1, 4));
              if (card > 0) callerCard(g, 960, lerp(800, 560, card), '陌生号码', card, 0.6 + 0.4 * hit(t, HIT + 0.6, 0.6), lerp(0.6, 1, card));
            });
            layer(g, cam, 1.4, () => roomFront(g, o));
            if (up) add(g, () => glow(g, 960, 560, 1100, 0.12 * hit(t, HIT, 0.5), MAGC));
          }} />
          <Grade warm={0.03} />
          <div style={{ position: 'absolute', inset: 0, background: '#ffe0f2', opacity: 0.2 * hit(t, HIT, 0.07), mixBlendMode: 'screen' }} />
          <Bars />
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.5)' }}>
            <span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏
          </div>
          <Subs T={t} lines={LINES as any} />
        </>
      )}
    </AbsoluteFill>
  );
};
