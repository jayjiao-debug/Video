import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { Defs12, LightTable, Grain, Captions, Mark, cue, bound, BLK, eio, eo, clamp, lerp, pr, EP12_FRAMES, W, H } from './kit12';
import { HookScene, TitleScene, B1Scene, B2Scene, B3Scene, B4Scene, B5Scene, tWhip, tRunOut, loupeAt } from './scenesA12';
import { B6Scene, B7Scene, B8Scene, B9Scene, PE1Scene, E2Scene, E34Scene, EndScene, tOff } from './scenesB12';

export { EP12_FRAMES };

const pan = (T: number, b: number, d = 0.6) => eio(T, b - d / 2, d);

/* camera-shutter exposures at a few key moments (quality over frequency): the shutter closes for one frame,
   then the frame over-exposes and settles back. Times are shared with the sound effects (sfx12.json). */
export const SHUTTERS = () => [
  { t: cue('H3', '一眨眼'), k: 0.8, warm: 0 },
  { t: cue('B7b', '相机'), k: 0.55, warm: 0 },
  { t: cue('B8c', '切换'), k: 0.45, warm: 0 },
  { t: cue('E1c', '第一次'), k: 0.6, warm: 1 },
];
const Shutter: React.FC<{ T: number }> = ({ T }) => {
  const out: React.ReactNode[] = [];
  SHUTTERS().forEach((s, i) => {
    const d = T - s.t;
    if (d < -0.034 || d > 0.6) return;
    if (d < 0) { out.push(<div key={`c${i}`} style={{ position: 'absolute', inset: 0, background: '#000', opacity: 0.35 * s.k }} />); return; }
    const o = s.k * Math.exp(-d * 7.5);
    out.push(<div key={`f${i}`} style={{ position: 'absolute', inset: 0, background: s.warm ? 'radial-gradient(ellipse 80% 80% at 50% 45%, #FFFDF6 0%, #FFE9C4 100%)' : 'radial-gradient(ellipse 80% 80% at 50% 45%, #FFFFFF 0%, #EAF0FF 100%)', opacity: o, mixBlendMode: 'screen' }} />);
  });
  return <>{out}</>;
};

/* 《时间都去哪了》 (ep12 · 时间感). Every frame is a pure function of T. */
export const Ep12Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts12', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all([
      '900 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '500 40px "Noto Sans CJK SC"',
      '900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '400 40px "DejaVu Sans Mono"', '700 40px "DejaVu Sans Mono"',
    ].map((f) => document.fonts.load(f, '0123456789%为什么一年一眨眼时间都去哪了当下回头看▸JUNO')).map((p) => p.catch(() => null))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  if (!ready) return null;

  // ---- transitions ----
  const b12 = bound('B1', 'B2'), b23 = bound('B2', 'B3'), b34 = bound('B3', 'B4'), b45 = bound('B4', 'B5'), b56 = bound('B5', 'B6');
  const b67 = BLK.B7[0] - 0.3, b78 = bound('B7', 'B8'), b89 = bound('B8', 'B9'), b9P = bound('B9', 'P');
  const bE12 = bound('E1', 'E2'), bE23 = bound('E2', 'E3');
  const k12 = pan(T, b12), k23 = pan(T, b23), k34 = pan(T, b34), k45 = pan(T, b45), k67 = pan(T, b67), k89 = pan(T, b89), kRw = pan(T, b9P, 0.6);
  const dive = eio(T, b56 - 0.35, 0.65);
  const push = eio(T, b78 - 0.35, 0.65);
  const t0ff = tOff();
  const fl = [1, 0.35, 0.8, 0.15, 0];
  const fo = Math.max(0, (T - t0ff) * 30);
  const on = 1;
  const warm = eio(T, cue('E1a', '好消息'), 1.5);
  const gx = 1920 * (k12 + k23 + k34 + k45 + k67 + k89 - kRw) + (T > b56 - 0.4 ? 0 : 0);
  const X = (kin: number, kout: number, dir = 1) => 1920 * (1 - kin) * dir - 1920 * kout;
  const vis = (a: number, z: number) => T > a && T < z;
  const lp = loupeAt();
  const revealR = lerp(150, 2300, dive);
  const titleOn = T > tWhip() + 0.25 && T < tRunOut() + 0.3;
  const endOn = T > t0ff + 0.3;
  const inE2 = eo(T, bE12 - 0.3, 0.5), outPE1 = eo(T, bE12 - 0.2, 0.4);
  const outE2 = eo(T, bE23 - 0.2, 0.5), inE34 = eo(T, bE23 - 0.3, 0.5);
  const offK = eio(T, t0ff, 0.3);
  return (
    <AbsoluteFill style={{ backgroundColor: '#0C0E10', overflow: 'hidden' }}>
      <Defs12 />
      <LightTable T={T} warm={warm} on={on} gx={gx} />
      {vis(-1, tWhip() + 0.8) && <HookScene T={T} />}
      {vis(tRunOut() - 0.05, b12 + 0.35) && <B1Scene T={T} x={X(1, k12)} />}
      {vis(b12 - 0.35, b23 + 0.35) && <B2Scene T={T} x={X(k12, k23)} />}
      {vis(b23 - 0.35, b34 + 0.35) && <B3Scene T={T} x={X(k23, k34)} />}
      {vis(b34 - 0.35, b45 + 0.35) && <B4Scene T={T} x={X(k34, k45)} />}
      {vis(b45 - 0.35, b56 + 0.35) && dive < 1 && <B5Scene T={T} x={X(k45, 0)} dive={dive} />}
      {vis(b56 - 0.4, b67 + 0.35) && (
        <div style={{ position: 'absolute', inset: 0, clipPath: dive < 1 ? `circle(${revealR}px at ${lp.x}px ${lp.y}px)` : undefined }}>
          {dive < 1 && <LightTable T={T} warm={0} on={1} gx={gx} />}
          <B6Scene T={T} x={X(1, k67)} />
        </div>
      )}
      {vis(b67 - 0.35, b78 + 0.4) && <B7Scene T={T} x={X(k67, 0)} push={push} />}
      {vis(b78 - 0.35, b89 + 0.35) && <B8Scene T={T} x={X(1, k89)} inK={eo(T, b78 - 0.1, 0.4)} />}
      {vis(b89 - 0.35, b9P + 0.35) && <B9Scene T={T} x={X(k89, 0) + 1920 * kRw} />}
      {vis(b9P - 0.35, bE12 + 0.5) && <div style={{ position: 'absolute', inset: 0, opacity: 1 - outPE1 }}><PE1Scene T={T} x={-1920 * (1 - kRw)} /></div>}
      {vis(bE12 - 0.35, bE23 + 0.5) && <E2Scene T={T} inK={inE2} outK={outE2} />}
      {vis(bE23 - 0.35, t0ff + 1.2) && <div style={{ position: 'absolute', inset: 0, opacity: 1 - eo(T, t0ff + 0.05, 0.45) }}><E34Scene T={T} inK={inE34} off={offK} /></div>}
      {titleOn && <TitleScene T={T} />}
      {endOn || T > t0ff ? <EndScene T={T} /> : null}
      <Captions T={T} />
      <Shutter T={T} />
      <Mark onDark={titleOn ? 1 : 0} o={(T > t0ff + 0.3 ? 1 - eo(T, t0ff + 0.3, 0.3) : 1) * (titleOn ? 1 - eo(T, tWhip() + 0.25, 0.2) * (1 - eo(T, tRunOut() + 0.1, 0.2)) : 1)} />
      <Grain T={T} o={0.18 * on + 0.08} />
    </AbsoluteFill>
  );
};
