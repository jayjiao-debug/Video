import React from 'react';
import {makeCam} from '../cam';
import {b, camAt, clamp, easeInOut, easeOut, inOut, lerp, prog, stepOnBeat, type Key} from '../lib';
import {bird, C, dot, glow, LATIN, Light, motif, SANS, SERIF} from '../look';
import {DRUNK} from '../walks';
import {drawStreet, drunkAt} from './s1';
import {Tag} from '../ui';

/* S10 (b273–b311): back on the opening street, the whole night's trail behind him; the drunk man
   steps onto his doorstep (b288, the ring flares). A bird lifts off the roof and spirals away into the
   stars; the camera follows it up until the city is a faint grid and the bird a star. Then the end card. */
const P = [0, 0, 0, 0];
const Q = [0, 0, 0, 0];
const ARRIVE = b(288);
const LIFT = b(290);
const K0 = DRUNK.home - 30;

const birdAt = (T: number): [number, number, number] => {
  const u = Math.max(0, T - LIFT);
  return [Math.sin(u * 1.1) * 0.9 * u, 0.15 + u * 0.9 + u * u * 0.06, -Math.cos(u * 1.1) * 0.5 * u - u * 0.9];
};

export const S10: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(273), b(311) + 0.4, 0.7, 0.8);
  const k = Math.min(DRUNK.home, K0 + stepOnBeat(T, 273, 2));
  const head = drunkAt(k);
  const KEYS: Key[] = [
    [b(273), [-1.6, 9.5, 10.5], [0, 0, 0]],
    [b(287), [-1.2, 6.5, 7.5], [0, 0, 0]],
    [b(291), [-1.4, 4.5, 7.5], [0, 0.6, 0]],
    [b(305), [-2.5, 6, 12], [0, 2, 0]],
  ];
  const c = camAt(KEYS, T);
  const follow = 1 - prog(T, b(286), b(290));
  const bp = birdAt(T);
  const wb = easeInOut(prog(T, b(291), b(297)));
  const tgt = [head[0] * 0.7 * follow, head[1] * 0.7 * follow];
  const look: [number, number, number] = [lerp(c.look[0] + tgt[0], bp[0], wb * 0.85), lerp(c.look[1], bp[1] - 1, wb * 0.85), lerp(c.look[2] + tgt[1], bp[2], wb * 0.85)];
  const pos: [number, number, number] = [c.pos[0] + tgt[0], c.pos[1], c.pos[2] + tgt[1]];
  const cam = makeCam(pos, look, 46);
  const city = 1 - prog(T, b(300), b(309)) * 0.85;
  const draw = (ctx: CanvasRenderingContext2D) => {
    drawStreet(ctx, cam, k, {grid: city * fin, home: fin, man: fin});
    // arrival
    const u = (T - ARRIVE) / 1.4;
    if (u > 0 && u < 1) {
      cam.project(0, 0, 0, P);
      ctx.strokeStyle = `rgba(255,226,160,${(1 - u) * 0.9 * fin})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(P[0], P[1], 14 + easeOut(u) * 120, 0, Math.PI * 2);
      ctx.stroke();
      glow(ctx, P[0], P[1], 26, (1 - u) * 0.8 * fin, true);
    }
    // the bird
    if (T > LIFT) {
      for (let i = 60; i >= 1; i--) {
        const tt = T - i * 0.06;
        if (tt < LIFT) continue;
        const q = birdAt(tt);
        cam.project(q[0], q[1], q[2], P);
        if (P[3] > 0) dot(ctx, P[0], P[1], 1.8, 0.55 * (1 - i / 61) * fin);
      }
      cam.project(bp[0], bp[1], bp[2], P);
      const q = birdAt(T - 0.05);
      cam.project(q[0], q[1], q[2], Q);
      const far = prog(T, b(299), b(307));
      if (P[3] > 0) {
        bird(ctx, P[0], P[1], clamp(P[3] * 0.006, 2, 6) * (1 - far * 0.6), Math.atan2(P[1] - Q[1], P[0] - Q[0]), 0.95 * fin, T * 20);
        glow(ctx, P[0], P[1], 4 + far * 3, (0.35 + far * 0.4) * fin, far > 0.5);
      }
    }
  };
  cam.project(0, 0, 0, P);
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={1} />
      <Tag x={P[0]} y={P[1] + 16} text="家" anchor="center" size={26} color={C.gold} o={inOut(T, b(274), b(292), 0.6, 0.6) * fin} />
    </>
  );
};

// ------------------------------------------------------------------ end card (last 6 s)
const QUESTION = '你有没有一个，再也回不去的地方？';
const SOURCES = 'Pólya 1921 · Watson 1939 · Kakutani · Brown 1828 · Einstein 1905 · Perrin 1909 · Bachelier 1900 · Malkiel 1973';

export const EndCard: React.FC<{T: number}> = ({T}) => {
  const t0 = b(311);
  const o = inOut(T, t0 - 0.2, 999, 0.6, 0);
  const ring = easeInOut(prog(T, t0, t0 + 1.2));
  const draw = (ctx: CanvasRenderingContext2D) => {
    // the J monogram: a gold ring drawing itself
    ctx.strokeStyle = `rgba(241,197,109,${0.95 * o})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(960, 170, 52, -Math.PI / 2, -Math.PI / 2 + ring * Math.PI * 2);
    ctx.stroke();
    motif(ctx, 960, 470, 1, o * prog(T, t0 + 0.8, t0 + 1.4), easeOut(prog(T, t0 + 0.8, t0 + 2.4)));
  };
  const at = (d: number) => inOut(T, t0 + d, 999, 0.5, 0) * o;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#05060b', opacity: 0.55 * o}} />
      <Light draw={draw} deps={[T]} bloom={0.9} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 128, textAlign: 'center', fontFamily: LATIN, fontWeight: 600, fontSize: 62, lineHeight: '84px', color: '#f6cf78', opacity: at(0.6)}}>J</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 268, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 92, letterSpacing: '0.1em', color: '#f6cf78', textShadow: '0 0 26px rgba(241,197,109,0.45)', opacity: at(0.4)}}>《醉汉与小鸟》</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 44, color: C.ink, opacity: at(1.2)}}>{QUESTION}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center', opacity: at(1.8)}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: '#05060b', background: C.gold, borderRadius: 999, padding: '8px 30px', letterSpacing: '0.06em'}}>关注 Juno · 每期一个反直觉的知识</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: SANS, fontSize: 18, color: 'rgba(243,239,230,0.38)', opacity: at(2.2)}}>{SOURCES}</div>
    </>
  );
};
