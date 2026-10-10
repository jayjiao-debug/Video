/* 《心流》 cold open, the radio version (0–11 s), on the owner's track from 0:00 (title hit 8.473 s).
   0.334  the tuning eye lights in the dark, wide open, flickering: no station
   2.37   the camera slides off the eye onto the dial: the needle hunts through static
   5.93   it brushes past the station and overshoots; the eye nearly closes, then opens again
   6.95   it creeps back; the light steadies; the camera leans in
   8.473  locked: the eye shuts to a hairline, the dial blazes, the room fills with warm light,
          the camera whips back to the whole room, gold title */
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { World, RadioState, P, needleX } from './World';
import { camAt, Key } from './cam';
import { GOLD, INK, prog, easeOut, easeInOut, clamp, Subtitles, Line, lerp } from './art';
import { JUNO } from './brand/identity';
import { font } from './brand/lib';

export const TITLE = 8.473, OPEN_END = 11.0;
const STATION = 0.62;

/** where the needle is: a hunting sweep with hesitations, an overshoot, a creep back, then still */
const NEEDLE: [number, number][] = [[0, 0.04], [0.33, 0.04], [1.6, 0.11], [2.4, 0.1], [3.3, 0.24], [3.9, 0.22], [5.0, 0.4], [5.5, 0.43], [6.2, 0.68], [6.6, 0.7], [7.4, 0.635], [8.2, 0.622], [TITLE, STATION]];
export const needleAt = (T: number) => {
  if (T >= TITLE) return STATION;
  const i = NEEDLE.findIndex((k, j) => j < NEEDLE.length - 1 && T >= k[0] && T < NEEDLE[j + 1][0]);
  const [t0, a] = NEEDLE[i], [t1, b] = NEEDLE[i + 1];
  return lerp(a, b, easeInOut(clamp((T - t0) / (t1 - t0))));
};

export const radioAt = (T: number): RadioState => {
  const n = needleAt(T), off = Math.abs(n - STATION), lock = T >= TITLE;
  const on = easeOut(prog(T, 0.334, 0.62));
  const near = clamp(off / 0.11);
  return {
    power: lock ? 1 : on * (0.55 + 0.1 * (1 - near)),
    needle: n,
    gap: lock ? 0.012 : 0.05 + 0.75 * near,
    flicker: lock ? 0 : on * (0.15 + 0.85 * near),
    flood: lock ? easeOut(prog(T, TITLE, TITLE + 0.5)) : 0,
    moon: 0.55 + 0.45 * easeInOut(prog(T, 1.5, 6.0)),
  };
};

const E = P.eye, D = P.dial;
const KEYS: Key[] = [
  { t: 0, pos: [E.x + 0.008, E.y + 0.002, E.z + 0.078], look: [E.x, E.y, E.z], fov: 26, ap: 0.03, bloom: 0.9 },
  { t: 2.37, pos: [E.x + 0.022, E.y + 0.004, E.z + 0.092], look: [E.x, E.y - 0.002, E.z], fov: 26, ap: 0.03, bloom: 0.9 },
  { t: 3.6, pos: [needleX(0.2) + 0.035, D.y + 0.018, D.z + 0.12], look: [needleX(0.24), D.y, D.z], fov: 28, ap: 0.014, bloom: 0.75 },
  { t: 5.6, pos: [needleX(0.48) + 0.03, D.y + 0.012, D.z + 0.13], look: [needleX(0.5), D.y, D.z], fov: 28, ap: 0.014, bloom: 0.75 },
  { t: 7.2, pos: [needleX(0.63) + 0.03, 0.275, D.z + 0.25], look: [needleX(0.62), 0.27, D.z], fov: 30, ap: 0.01, bloom: 0.75 },
  { t: TITLE, pos: [0.155, 0.278, D.z + 0.21], look: [0.135, 0.272, D.z], fov: 30, ap: 0.01, bloom: 0.8 },
  { t: TITLE + 0.9, pos: [0.6, 0.56, 1.55], look: [0.0, 0.33, 0.0], fov: 34, ap: 0.0012, bloom: 0.6, whip: true },
  { t: OPEN_END, pos: [0.53, 0.52, 1.4], look: [0.0, 0.33, 0.0], fov: 34, ap: 0.0012, bloom: 0.55 },
];

export const LINES: Line[] = [
  { t: 0.6, end: 3.2, text: '2006年，科比一场砍下81分。' },
  { t: 3.35, end: 5.85, text: '赛后被问怎么做到的，他说：' },
  { t: 6.0, end: 8.35, text: '“就这么发生了，很难解释。”' },
];

const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T < TITLE) return null;
  const k = (a: number) => easeOut(prog(T, TITLE + a, TITLE + a + 0.35));
  const gold: React.CSSProperties = { backgroundImage: 'linear-gradient(180deg,#fbe3a6 0%,#f1c56d 55%,#c8913a 100%)', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 30px rgba(241,197,109,0.45))' };
  const slam = 1 + 0.18 * (1 - easeOut(prog(T, TITLE, TITLE + 0.22)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(3,4,8,0.7), rgba(3,4,8,0) 60%)', opacity: easeOut(prog(T, TITLE, TITLE + 0.08)) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: font.serif, fontWeight: 900, fontSize: 176, letterSpacing: '0.06em', opacity: prog(T, TITLE, TITLE + 0.06), transform: `scale(${slam})`, ...gold }}>《心流》</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 46, color: INK, opacity: k(0.5), textShadow: '0 3px 16px rgba(0,0,0,0.8)' }}>怎样把自己，调到那个台？</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', fontFamily: 'JunoMono, monospace', fontSize: 22, letterSpacing: '0.4em', color: 'rgba(241,197,109,0.75)', opacity: k(0.8) }}>— {JUNO.series} —</div>
    </AbsoluteFill>
  );
};

/** film grain: a turbulence field reseeded every frame, very faint */
export const Grain: React.FC<{ f: number }> = ({ f }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'normal', pointerEvents: 'none' }}>
    <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 97} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.45" /></filter>
    <rect width={1920} height={1080} filter="url(#gr)" />
  </svg>
);

export const ColdOpen: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const s = radioAt(T), cam = camAt(KEYS, T);
  const flash = T >= TITLE ? Math.exp(-(T - TITLE) / 0.1) * 0.28 : 0;
  cam.bloom += T >= TITLE ? 0.5 * Math.exp(-(T - TITLE) / 0.35) : 0;
  const fadeIn = prog(T, 0.3, 0.45);
  const markO = T < TITLE - 0.2 ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Audio src={staticFile('bgm.mp3')} endAt={Math.round(OPEN_END * 30)} />
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-600-normal.woff2')}) format("woff2"); font-weight: 600; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }`}</style>
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <ThreeCanvas width={1920} height={1080} camera={{ fov: 30, position: [0, 0.4, 1.4], near: 0.005, far: 30 }} gl={{ antialias: true }} shadows>
          <World s={s} cam={cam} T={T} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: '#fff3dc', opacity: flash }} />
      <Grain f={f} />
      <Title T={T} />
      <Subtitles T={T} lines={LINES} />
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * markO * fadeIn, fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
        <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
      </div>
    </AbsoluteFill>
  );
};
