/* S04 · design (24.707 – 32.806). The design studio of the dark: the bag turns slowly on a lacquer turntable
   while a blueprint draws itself around it in depth layers: a 1:1 gold grid far behind, construction circles,
   a holo golden spiral whose eye is the clasp, dimension lines in front, and the word 欲望 dropping into its
   construction frame (欲 26.731, 望 27.236). The great arch is traced by two lines that meet at its keystone
   exactly on 28.7 (line 2). The camera orbits left → right, then settles front-on; the bar-15 fill stacks three
   echo arches (30.781 / 31.54 / 32.3) so the last frame is a stepped deco arch: the boutique door of S05. */
import React, { useMemo } from 'react';
import type { SceneDef } from '../scene';
import { prog, easeOut, easeInOut, impulse, slam, swing } from '../scene';
import { HeroBag, Cut, rect } from '../foil';
import { MirrorFloor, Word, Beam, Backdrop } from '../kit';
import { mat } from '../foil';
import { Spot, GLine, Ribbon, arcPts, warmEnvTex } from './S03_parts';
import { FoilText, Glow } from './S10_kit';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

const P = 0.22; // the plinth: everything on it sits above the subtitle band
const CHAMP = '#ffd9a8';
const DONE = 28.7, YU = 26.731, WANG = 27.236, ECHO = [30.781, 31.54, 32.3];
/* the arch: legs at ±R from the floor to the spring line SPR, a semicircle above. Front-on it is the S05 door. */
export const ARCH = { R: 0.31, SPR: 0.64, Z: -0.3 };
const GOLD = '#f0c46a';
const PHI = 1.6180339;

const archPts = (R: number, spr: number): [number, number][] => [[-R, 0], [-R, spr], ...arcPts([0, spr], R, Math.PI, -Math.PI, 72).slice(1), [R, 0]];
const halfArch = (R: number, spr: number, side: -1 | 1): [number, number][] => [[side * R, 0], [side * R, spr], ...arcPts([0, spr], R, side < 0 ? Math.PI : 0, side < 0 ? -Math.PI / 2 : Math.PI / 2, 36).slice(1)];

/** a log spiral with golden growth, from the outside in to its eye */
const spiralPts = (eye: [number, number], r0: number, turns: number): [number, number][] => {
  const b = Math.log(PHI) / (Math.PI / 2), n = 220, out: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const th = (i / n) * turns * Math.PI * 2, r = r0 * Math.exp(-b * th); const a = th + Math.PI * 0.75; out.push([eye[0] + Math.cos(a) * r, eye[1] + Math.sin(a) * r]); }
  return out;
};

/* the drafting board: a black lacquer panel with a gold-leaf border and a FEW fine warm construction lines (not a grid) */
const lacquer = new THREE.MeshPhysicalMaterial({ color: '#0e0a07', roughness: 0.6, clearcoat: 0.6, clearcoatRoughness: 0.45, envMapIntensity: 0.55 });
const ttMat = new THREE.MeshPhysicalMaterial({ color: '#0a0806', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.8 });
const BoardEnv: React.FC = () => { const { gl } = useThree(); const t = warmEnvTex(gl); for (const m of [lacquer, ttMat]) if (m.envMap !== t) { m.envMap = t; m.needsUpdate = true; } return null; };
const LEAF = '#e6b866';
const Board: React.FC<{ T: number; flare: number }> = ({ T, flare }) => {
  const xs = [-1.2, -0.8, -0.4, 0.4, 0.8, 1.2], ys = [0.2, 0.6, 1.0, 1.4];
  const arcA = useMemo(() => arcPts([0, P + ARCH.SPR], 0.62, Math.PI * 1.08, -Math.PI * 1.16, 120), []);
  const arcB = useMemo(() => arcPts([0, P + ARCH.SPR], 0.9, Math.PI * 1.02, -Math.PI * 1.04, 140), []);
  const br = (x: number) => x * (1 + flare);
  return (
    <group position={[0, 0, -0.9]}>
      <BoardEnv />
      <mesh position={[0, 0.85, -0.01]} material={lacquer} receiveShadow><planeGeometry args={[3.4, 2.0]} /></mesh>
      <Glow w={1.6} h={1.6} color="#ffb060" o={0.22} position={[0, P + 0.42, 0.002]} />
      <Cut d={`${rect(-1560, -1700, 3120, 1640)} M -1554 -1694 L -1554 -66 L 1554 -66 L 1554 -1694 Z`} kind="gold" depth={0.002} bevel={0} position={[0, 0, 0.004]} shadow={false} />
      {xs.map((x, i) => <GLine key={'v' + i} a={[x, 0.08]} b={[x, 1.68]} k={easeOut(prog(T, 24.75 + i * 0.07, 25.5 + i * 0.07))} w={0.0011} color={LEAF} bright={br(0.3)} z={0.003} />)}
      {ys.map((y, i) => <GLine key={'h' + i} a={[-1.54, y]} b={[1.54, y]} k={easeOut(prog(T, 24.85 + i * 0.08, 25.6 + i * 0.08))} w={0.0011} color={LEAF} bright={br(0.3)} z={0.003} />)}
      <Ribbon pts={arcA} k={easeInOut(prog(T, 25.3, 26.5))} w={0.0013} color={LEAF} bright={br(0.5)} z={0.004} />
      <Ribbon pts={arcB} k={easeInOut(prog(T, 25.6, 26.9))} w={0.0013} color={LEAF} bright={br(0.4)} z={0.004} />
      <GLine a={[-1.54, 0.08]} b={[0, P + ARCH.SPR + ARCH.R]} k={easeOut(prog(T, 26.0, 26.8))} w={0.001} color={LEAF} bright={br(0.35)} z={0.004} />
      <GLine a={[1.54, 0.08]} b={[0, P + ARCH.SPR + ARCH.R]} k={easeOut(prog(T, 26.1, 26.9))} w={0.001} color={LEAF} bright={br(0.35)} z={0.004} />
      {prog(T, 25.6, 26.0) > 0 && <FoilText text="1 : 1" glyph={0.03} fill="gold" position={[-1.38, 1.58, 0.006]} opacity={easeOut(prog(T, 25.6, 26.0))} />}
    </group>
  );
};

const Set: React.FC<{ T: number }> = ({ T }) => {
  const flare = 0.8 * impulse(T, DONE, 0.45), lineIn = 1.2 * (1 - prog(T, 25.0, 26.0));
  const spin = 0.5 * Math.sin((Math.PI * (T - 24.707)) / 8.1); // turns out and back: square-on at both cuts
  const arch = useMemo(() => archPts(ARCH.R, ARCH.SPR), []);
  const halfL = useMemo(() => halfArch(ARCH.R, ARCH.SPR, -1), []), halfR = useMemo(() => halfArch(ARCH.R, ARCH.SPR, 1), []);
  const inner = useMemo(() => archPts(ARCH.R - 0.022, ARCH.SPR), []);
  const spiral = useMemo(() => spiralPts([0, 0.138], 0.21, 2.2), []);
  const circA = useMemo(() => arcPts([0, 0.2], 0.25, -Math.PI / 2, Math.PI * 2, 96), []), circB = useMemo(() => arcPts([0, 0.2], 0.205, Math.PI / 2, -Math.PI * 2, 96), []);
  const cYu = useMemo(() => arcPts([-0.088, 0.62], 0.092, Math.PI / 2, Math.PI * 2, 64), []), cWang = useMemo(() => arcPts([0.088, 0.62], 0.092, Math.PI / 2, -Math.PI * 2, 64), []);
  const echoes = useMemo(() => [0.045, 0.09, 0.135].map((d) => archPts(ARCH.R + d, ARCH.SPR)), []);
  // timings
  const hk = easeInOut(prog(T, 27.2, DONE));
  const yu = slam(T, YU, 0.2), wang = slam(T, WANG, 0.2);
  const b = (x: number) => x * (1 + flare);
  return (
    <group>
      <Backdrop burst="none" />
      <MirrorFloor />
      <Board T={T} flare={flare * 0.6 + lineIn} />
      {/* the plinth: black, a gold edge; its front face is what sits behind the subtitles */}
      <mesh position={[0, P / 2, -0.04]} castShadow receiveShadow><boxGeometry args={[1.15, P, 0.66]} /><meshPhysicalMaterial color="#0b090a" roughness={0.75} specularIntensity={0.2} /></mesh>
      <Cut d={rect(-575, -5, 1150, 5)} kind="gold" depth={0.004} bevel={0} position={[0, P, 0.29]} shadow={false} />
      <Cut d={rect(-575, -3, 1150, 3)} kind="gold" depth={0.004} bevel={0} position={[0, 0.012, 0.29]} shadow={false} />
      <group position={[0, P, 0]}>
      {/* the great arch: two lines rise and meet at the keystone on 28.7, then it holds as one */}
      <group position={[0, 0, ARCH.Z]}>
        {T < DONE ? <>
          <Ribbon pts={halfL} k={hk} w={0.006} color={GOLD} bright={1.5} />
          <Ribbon pts={halfR} k={hk} w={0.006} color={GOLD} bright={1.5} />
        </> : <Ribbon pts={arch} k={1} w={0.006} color={GOLD} bright={b(1.5)} />}
        <Ribbon pts={inner} k={easeInOut(prog(T, 27.5, DONE + 0.2))} w={0.0022} color={CHAMP} bright={b(1.1)} />
        {/* the bar-15 fill stacks echo arches: a stepped deco portal */}
        {echoes.map((p, i) => { const k = easeOut(prog(T, ECHO[i], ECHO[i] + 0.16)); const kick = impulse(T, ECHO[i], 0.3);
          return <Ribbon key={i} pts={p} k={k} w={i === 1 ? 0.0024 : 0.0045} color={i === 1 ? CHAMP : GOLD} bright={1.1 + 1.6 * kick} z={-0.02 * (i + 1)} />; })}
        {/* keystone diamond */}
        {T >= DONE - 0.05 && <Cut d="M 0 -22 L 16 0 L 0 22 L -16 0 Z" kind="gold" depth={0.006} position={[0, ARCH.SPR + ARCH.R + 0.0, 0.01]} scale={slam(T, DONE, 0.1) * (1 + 0.6 * impulse(T, DONE, 0.15))} />}
      </group>
      {/* construction circles around the bag */}
      <group position={[0, 0, -0.12]}>
        <Ribbon pts={circA} k={easeOut(prog(T, 24.72, 25.45))} w={0.0018} color={GOLD} bright={b(0.75)} />
        <Ribbon pts={circB} k={easeOut(prog(T, 24.85, 25.7))} w={0.0014} color={GOLD} bright={b(0.5)} />
        <GLine a={[-0.42, 0.2]} b={[0.42, 0.2]} k={easeOut(prog(T, 25.5, 26.3))} w={0.0012} color={GOLD} bright={b(0.4)} />
        <GLine a={[0, -0.0]} b={[0, 0.98]} k={easeOut(prog(T, 25.6, 26.5))} w={0.0012} color={GOLD} bright={b(0.4)} />
      </group>
      {/* turntable */}
      <group rotation={[0, spin, 0]}>
        <mesh position={[0, 0.016, 0]} castShadow receiveShadow material={ttMat}><cylinderGeometry args={[0.25, 0.26, 0.032, 72]} /></mesh>
        <mesh position={[0, 0.0335, 0]} material={mat('gold')}><cylinderGeometry args={[0.252, 0.252, 0.004, 72]} /></mesh>
        <mesh position={[0, 0.0358, 0]} receiveShadow><cylinderGeometry args={[0.236, 0.236, 0.002, 72]} /><meshPhysicalMaterial color="#120e16" roughness={0.85} sheen={0.6} sheenColor="#a07a3a" /></mesh>
        {Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return (
          <mesh key={i} position={[Math.sin(a) * 0.255, 0.018, Math.cos(a) * 0.255]} rotation={[0, a, 0]} material={mat('gold')}><boxGeometry args={[0.003, i % 9 ? 0.012 : 0.026, 0.002]} /></mesh>); })}
        <HeroBag position={[0, 0.037, 0]} light={0} swing={swing(T, 25.0, 6) + 3 * Math.sin(T * 0.9)} />
      </group>
      {/* the bag's product light, warm on both sides (its built-in cool rim would stain the lacquer board violet) */}
      <pointLight position={[0.32, 0.5, 0.5]} intensity={1.2} distance={1.6} decay={2} color="#ffe2c0" />
      <pointLight position={[-0.3, 0.42, -0.22]} intensity={0.7} distance={0.55} decay={2} color="#ffd6a0" />
      {/* golden spiral (holo) whose eye is the clasp, in a plane just in front of the bag */}
      <Ribbon pts={spiral} k={easeInOut(prog(T, 26.1, 27.6))} w={0.0026} color={CHAMP} bright={b(0.95)} z={0.09} />
      {/* dimension lines in front */}
      <group position={[0, 0, 0.2]}>
        {(() => { const k = easeOut(prog(T, 26.2, 26.8)); return <>
          <GLine a={[-0.16, 0.43]} b={[0.16, 0.43]} k={k} w={0.0016} color={GOLD} bright={b(0.9)} />
          <GLine a={[-0.16, 0.41]} b={[-0.16, 0.45]} k={k} w={0.0016} color={GOLD} bright={b(0.9)} />
          <GLine a={[0.16, 0.41]} b={[0.16, 0.45]} k={k} w={0.0016} color={GOLD} bright={b(0.9)} />
          <GLine a={[-0.235, 0.037]} b={[-0.235, 0.257]} k={k} w={0.0016} color={GOLD} bright={b(0.9)} />
          <GLine a={[-0.255, 0.037]} b={[-0.215, 0.037]} k={k} w={0.0016} color={GOLD} bright={b(0.9)} />
          <GLine a={[-0.255, 0.257]} b={[-0.215, 0.257]} k={k} w={0.0016} color={GOLD} bright={b(0.9)} />
          {k > 0.6 && <FoilText text="320" glyph={0.012} fill="#efe2c4" position={[0, 0.447, 0]} />}
          {k > 0.6 && <FoilText text="220" glyph={0.012} fill="#efe2c4" position={[-0.264, 0.147, 0]} rotation={[0, 0, Math.PI / 2]} />}
        </>; })()}
      </group>
      {/* 欲望: each character drops into its construction circle */}
      <group position={[0, 0, 0.06]}>
        <Ribbon pts={cYu} k={easeInOut(prog(T, 25.9, 26.7))} w={0.0016} color={GOLD} bright={b(0.6)} />
        <Ribbon pts={cWang} k={easeInOut(prog(T, 26.2, 27.0))} w={0.0016} color={GOLD} bright={b(0.6)} />
        <GLine a={[-0.2, 0.545]} b={[0.2, 0.545]} k={easeOut(prog(T, 25.95, 26.6))} w={0.0012} color={GOLD} bright={b(0.5)} />
        <GLine a={[0.2, 0.695]} b={[-0.2, 0.695]} k={easeOut(prog(T, 26.05, 26.7))} w={0.0012} color={GOLD} bright={b(0.5)} />
        {yu > 0 && <FoilText text="欲" glyph={0.115} position={[-0.088, 0.62, 0.35 * (1 - yu)]} scale={1 + 1.2 * (1 - yu)} sheen={prog(T, YU + 0.05, YU + 0.75)} />}
        {wang > 0 && <FoilText text="望" glyph={0.115} position={[0.088, 0.62, 0.35 * (1 - wang)]} scale={1 + 1.2 * (1 - wang)} sheen={prog(T, WANG + 0.05, WANG + 0.75)} />}
      </group>
      </group>
      {/* light */}
      <Spot pos={[0.25, 2.4, 1.4]} at={[0, P + 0.15, 0]} intensity={11 + 4 * impulse(T, DONE, 0.3)} angle={0.2} penumbra={0.6} color="#fff0d8" shadow />
      <Spot pos={[0, 1.8, -1.2]} at={[0, P + 0.25, 0]} intensity={4} angle={0.35} penumbra={0.9} color="#ffd9a0" />
      <Beam from={[0.07, 2.3, 0.62]} len={2.1} r={0.3} o={0.03 + 0.05 * impulse(T, DONE, 0.4)} tilt={[0.3, 0]} />
      <ambientLight intensity={0.03} />
    </group>
  );
};

export const S04: SceneDef = {
  id: 'S04_design', t0: 24.707, t1: 32.806, x: 42, enter: 'cut', Set,
  /* one orbit with a ramp: slow drift while the construction draws, a fast swing to the right that RESOLVES on the
     keystone (28.7), a settle, then a push-in that accelerates into the cut on 32.806. Bars: 26.728 28.753 30.778 32.803 */
  /* MATCH CUT on 24.707: the S03 push ends square on the bag; this opens square on the same bag at the same size and place,
     now on the turntable, with construction circles bursting out of it. Then a pull-back + orbit left that resolves on bar
     26.728, a fast swing right resolving on the keystone (28.7), a settle, and a push-in accelerating into the cut on 32.806. */
  keys: [
    { t: 24.707, pos: [0, P + 0.237, 0.95], look: [0, P + 0.207, 0], fov: 32, ap: 0.004, bloom: 0.62 },
    { t: 26.73, pos: [-0.55, 0.58, 1.55], look: [0, 0.52, -0.1], fov: 34, ap: 0.005, bloom: 0.66 },
    { t: 28.7, pos: [0.3, 0.66, 1.92], look: [0, 0.58, -0.15], fov: 34, ap: 0.004, bloom: 0.7 },
    { t: 29.5, pos: [0.38, 0.66, 2.05], look: [0, 0.6, -0.2], fov: 34, ap: 0.004, bloom: 0.68 },
    { t: 31.3, pos: [0.22, 0.68, 2.4], look: [0, 0.64, -0.26], fov: 34, ap: 0.003, bloom: 0.68 },
    { t: 32.79, pos: [0, 0.67, 2.06], look: [0, 0.65, -0.3], fov: 34, ap: 0.003, bloom: 0.7 },
  ],
  lines: [
    { t: 24.8, end: 28.6, text: '多出来的钱，买的是欲望。' },
    { t: 28.7, end: 32.7, text: '而欲望，是可以被设计出来的。' },
  ],
  hits: [[24.707, 0.3], [DONE, 0.4], [WANG, 0.3]],
  bg: '#030308',
};
