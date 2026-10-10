/* 《你买的不是包》 · 镭射纸雕剧场. One long foil stage; every scene is a diorama at its own x. One camera flies the
   whole film: smooth moves inside a scene, whips or hard match-cuts between scenes, landing on the music. */
import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { Stage, Cam } from './Stage';
import { SCENES } from './scenes';
import type { Key } from './scene';
import { A } from './beats';
import { Subtitles, GOLD } from './art';
import { JUNO } from './brand/identity';
import { font } from './brand/lib';

export const FILM_END = 130.0, FILM_FRAMES = Math.round(FILM_END * 30);
const END_CARD = 121.904;

type GKey = Key & { scene: number; world: [number, number, number]; wlook: [number, number, number] };
const KEYS: GKey[] = SCENES.flatMap((s, i) => s.keys.map((k) => ({ ...k, scene: i, world: [k.pos[0] + s.x, k.pos[1], k.pos[2]] as [number, number, number], wlook: [k.look[0] + s.x, k.look[1], k.look[2]] as [number, number, number] })))
  .sort((a, b) => a.t - b.t);

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) => 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const ss = (u: number) => u * u * (3 - 2 * u);
const quint = (u: number) => (u < 0.5 ? 16 * u ** 5 : 1 - Math.pow(-2 * u + 2, 5) / 2);

/** the camera at film time T (world space) */
export const camAt = (T: number) => {
  let i = KEYS.findIndex((k, j) => j < KEYS.length - 1 && T >= k.t && T < KEYS[j + 1].t);
  if (T < KEYS[0].t) i = 0; if (i < 0) i = KEYS.length - 2;
  const b = KEYS[i], c = KEYS[i + 1];
  const u = Math.max(0, Math.min(1, (T - b.t) / (c.t - b.t)));
  let pos: number[], look: number[], k: number;
  if (b.scene !== c.scene) {
    const enter = SCENES[c.scene].enter;
    k = enter === 'cut' ? (T >= SCENES[c.scene].t0 ? 1 : 0) : quint(u);
    pos = [0, 1, 2].map((n) => b.world[n] + (c.world[n] - b.world[n]) * k);
    look = [0, 1, 2].map((n) => b.wlook[n] + (c.wlook[n] - b.wlook[n]) * k);
  } else {
    const a = KEYS[i - 1] && KEYS[i - 1].scene === b.scene ? KEYS[i - 1] : b, d = KEYS[i + 2] && KEYS[i + 2].scene === b.scene ? KEYS[i + 2] : c;
    pos = [0, 1, 2].map((n) => cr(a.world[n], b.world[n], c.world[n], d.world[n], u));
    look = [0, 1, 2].map((n) => cr(a.wlook[n], b.wlook[n], c.wlook[n], d.wlook[n], u));
    k = ss(u);
  }
  const mix = (f: (q: GKey) => number | undefined, dflt: number) => (f(b) ?? dflt) + ((f(c) ?? dflt) - (f(b) ?? dflt)) * k;
  const fov = mix((q) => q.fov, 34), ap = mix((q) => q.ap, 0.003), bloom = mix((q) => q.bloom, 0.6), roll = mix((q) => q.roll, 0);
  const dist = Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]);
  const focus = b.focus !== undefined && c.focus !== undefined ? mix((q) => q.focus, dist) : dist;
  return { pos: pos as [number, number, number], look: look as [number, number, number], fov, ap, bloom, roll, focus };
};

/** screen-space motion between two camera poses (uv), for motion blur */
const tmpA = new THREE.PerspectiveCamera(), tmpB = new THREE.PerspectiveCamera();
const screenMotion = (T: number) => {
  const c0 = camAt(T - 1 / 30), c1 = camAt(T);
  const set = (cam: THREE.PerspectiveCamera, c: ReturnType<typeof camAt>) => { cam.fov = c.fov; cam.aspect = 16 / 9; cam.position.set(...c.pos); cam.up.set(Math.sin(c.roll), Math.cos(c.roll), 0); cam.lookAt(new THREE.Vector3(...c.look)); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); };
  set(tmpA, c0); set(tmpB, c1);
  const p = new THREE.Vector3(...c1.look), a = p.clone().project(tmpA), b2 = p.clone().project(tmpB);
  let mx = (b2.x - a.x) / 2, my = (b2.y - a.y) / 2; const m = Math.hypot(mx, my);
  if (m > 0.12) { mx *= 0.12 / m; my *= 0.12 / m; }
  return { mb: [mx, my] as [number, number], speed: m };
};

const ALL_LINES = SCENES.flatMap((s) => s.lines).sort((a, b) => a.t - b.t);
const HITS: [number, number][] = [...A.map((t): [number, number] => [t, t === 81.404 ? 1.3 : t === 49.008 ? 0 : 1]), ...SCENES.flatMap((s) => s.hits ?? [])];

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const c = camAt(T), { mb, speed } = screenMotion(T);
  let flash = 0, ca = 0.1, shake = 0;
  for (const [h, s] of HITS) { if (T >= h && T < h + 1.2 && s > 0) { const d = T - h; flash += 0.22 * s * Math.exp(-d / 0.07); ca += 0.9 * s * Math.exp(-d / 0.16); shake += 0.012 * s * Math.exp(-d / 0.1); } }
  ca += Math.min(1.2, speed * 25);
  const sh = [Math.sin(T * 91) * shake, Math.cos(T * 77) * shake, 0];
  const cur = SCENES.find((s) => T >= s.t0 && T < s.t1) ?? SCENES[SCENES.length - 1];
  const cam: Cam = { pos: [c.pos[0] + sh[0], c.pos[1] + sh[1], c.pos[2]], look: c.look, fov: c.fov, focus: c.focus, aperture: c.ap, bloom: c.bloom, roll: c.roll, ca, flash: Math.min(0.9, flash), mb, env: cur.env ?? 1, exposure: cur.exposure ?? 1 };
  const visible = SCENES.filter((s) => T >= s.t0 - 1.2 && T < s.t1 + 1.2);
  const markO = T < 8.3 ? 1 : T < 12.4 ? 0 : T < END_CARD - 0.2 ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format("woff2"); font-style: italic; }`}</style>
      <ThreeCanvas width={1920} height={1080} camera={{ fov: 34, position: [0, 0.4, 1.4], near: 0.01, far: 80 }} gl={{ antialias: true }} shadows>
        <Stage cam={cam} T={T} bg={cur.bg}>
          {visible.map((s) => <group key={s.id} position={[s.x, 0, 0]}><s.Set T={T} /></group>)}
        </Stage>
      </ThreeCanvas>
      {visible.map((s) => s.Overlay ? <s.Overlay key={s.id + 'o'} T={T} /> : null)}
      <Subtitles T={T} lines={ALL_LINES} />
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * markO, fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
        <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
      </div>
    </AbsoluteFill>
  );
};
