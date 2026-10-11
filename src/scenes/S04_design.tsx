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
import { Spot, GLine, Ribbon, arcPts } from './S03_parts';

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

const Grid: React.FC<{ T: number; flare: number }> = ({ T, flare }) => {
  const xs = Array.from({ length: 49 }, (_, i) => -2.4 + i * 0.1), ys = Array.from({ length: 16 }, (_, i) => i * 0.1);
  return (
    <group position={[0, 0, -0.85]}>
      {xs.map((x, i) => { const major = Math.abs(Math.round(x * 10)) % 5 === 0; const k = easeOut(prog(T, 24.5 + Math.abs(x) * 0.08, 24.9 + Math.abs(x) * 0.08));
        return <GLine key={'v' + i} a={[x, 0]} b={[x, 1.5]} k={k} w={major ? 0.0028 : 0.0016} color="#d9a441" bright={(major ? 0.42 : 0.2) * (1 + flare)} />; })}
      {ys.map((y, i) => { const major = i % 5 === 0; const k = easeOut(prog(T, 24.52 + y * 0.12, 24.95 + y * 0.12));
        return <group key={'h' + i}>
          <GLine a={[0, y]} b={[2.45, y]} k={k} w={major ? 0.0028 : 0.0016} color="#d9a441" bright={(major ? 0.42 : 0.2) * (1 + flare)} />
          <GLine a={[0, y]} b={[-2.45, y]} k={k} w={major ? 0.0028 : 0.0016} color="#d9a441" bright={(major ? 0.42 : 0.2) * (1 + flare)} />
        </group>; })}
      {prog(T, 26.0, 26.4) > 0 && <Word text="1 : 1" size={0.04} kind="glow" color="#d9a441" glow={0.9} position={[-1.2, 1.36, 0.002]} scale={easeOut(prog(T, 26.0, 26.4))} />}
    </group>
  );
};

const Set: React.FC<{ T: number }> = ({ T }) => {
  const flare = 1.4 * impulse(T, DONE, 0.45), gridIn = 1.6 * (1 - prog(T, 25.0, 26.2));
  const spin = -0.9 + 0.11 * (T - 24.707);
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
      <Grid T={T} flare={flare * 0.6 + gridIn} />
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
        <Ribbon pts={circA} k={easeInOut(prog(T, 25.35, 26.55))} w={0.0018} color={GOLD} bright={b(0.75)} />
        <Ribbon pts={circB} k={easeInOut(prog(T, 25.7, 26.9))} w={0.0014} color={GOLD} bright={b(0.5)} />
        <GLine a={[-0.42, 0.2]} b={[0.42, 0.2]} k={easeOut(prog(T, 25.5, 26.3))} w={0.0012} color={GOLD} bright={b(0.4)} />
        <GLine a={[0, -0.0]} b={[0, 0.98]} k={easeOut(prog(T, 25.6, 26.5))} w={0.0012} color={GOLD} bright={b(0.4)} />
      </group>
      {/* turntable */}
      <group rotation={[0, spin, 0]}>
        <mesh position={[0, 0.016, 0]} castShadow receiveShadow><cylinderGeometry args={[0.25, 0.26, 0.032, 72]} /><meshPhysicalMaterial color="#0a0910" roughness={0.3} clearcoat={1} clearcoatRoughness={0.05} /></mesh>
        <mesh position={[0, 0.0335, 0]} material={mat('gold')}><cylinderGeometry args={[0.252, 0.252, 0.004, 72]} /></mesh>
        <mesh position={[0, 0.0358, 0]} receiveShadow><cylinderGeometry args={[0.236, 0.236, 0.002, 72]} /><meshPhysicalMaterial color="#120e16" roughness={0.85} sheen={0.6} sheenColor="#a07a3a" /></mesh>
        {Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return (
          <mesh key={i} position={[Math.sin(a) * 0.255, 0.018, Math.cos(a) * 0.255]} rotation={[0, a, 0]} material={mat('gold')}><boxGeometry args={[0.003, i % 9 ? 0.012 : 0.026, 0.002]} /></mesh>); })}
        <HeroBag position={[0, 0.037, 0]} light={1.3} swing={swing(T, 25.0, 6) + 3 * Math.sin(T * 0.9)} />
      </group>
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
          {k > 0.6 && <Word text="320" size={0.018} kind="cream" weight="700" position={[0, 0.445, 0]} />}
          {k > 0.6 && <Word text="220" size={0.018} kind="cream" weight="700" position={[-0.262, 0.147, 0]} rotation={[0, 0, Math.PI / 2]} />}
        </>; })()}
      </group>
      {/* 欲望: each character drops into its construction circle */}
      <group position={[0, 0, 0.06]}>
        <Ribbon pts={cYu} k={easeInOut(prog(T, 25.9, 26.7))} w={0.0016} color={GOLD} bright={b(0.6)} />
        <Ribbon pts={cWang} k={easeInOut(prog(T, 26.2, 27.0))} w={0.0016} color={GOLD} bright={b(0.6)} />
        <GLine a={[-0.2, 0.545]} b={[0.2, 0.545]} k={easeOut(prog(T, 25.95, 26.6))} w={0.0012} color={GOLD} bright={b(0.5)} />
        <GLine a={[0.2, 0.695]} b={[-0.2, 0.695]} k={easeOut(prog(T, 26.05, 26.7))} w={0.0012} color={GOLD} bright={b(0.5)} />
        {yu > 0 && <Word text="欲" size={0.15} kind="gold" position={[-0.088, 0.62, 0.35 * (1 - yu)]} scale={1 + 1.2 * (1 - yu)} />}
        {wang > 0 && <Word text="望" size={0.15} kind="gold" position={[0.088, 0.62, 0.35 * (1 - wang)]} scale={1 + 1.2 * (1 - wang)} />}
      </group>
      </group>
      {/* light */}
      <Spot pos={[0.25, 2.4, 1.4]} at={[0, P + 0.15, 0]} intensity={11 + 8 * impulse(T, DONE, 0.3)} angle={0.2} penumbra={0.6} color="#fff0d8" shadow />
      <Spot pos={[0, 1.8, -1.2]} at={[0, P + 0.25, 0]} intensity={4} angle={0.35} penumbra={0.9} color="#ffd9a0" />
      <Beam from={[0.07, 2.3, 0.62]} len={2.1} r={0.3} o={0.03 + 0.05 * impulse(T, DONE, 0.4)} tilt={[0.3, 0]} />
      <ambientLight intensity={0.03} />
    </group>
  );
};

export const S04: SceneDef = {
  id: 'S04_design', t0: 24.707, t1: 32.806, x: 42, enter: 'whip', Set,
  /* one orbit with a ramp: slow drift while the construction draws, a fast swing to the right that RESOLVES on the
     keystone (28.7), a settle, then a push-in that accelerates into the cut on 32.806. Bars: 26.728 28.753 30.778 32.803 */
  keys: [
    { t: 25.007, pos: [-0.75, 0.56, 1.45], look: [0, 0.5, -0.1], fov: 34, ap: 0.005, bloom: 0.7 },
    { t: 26.73, pos: [-0.6, 0.6, 1.62], look: [0, 0.52, -0.12], fov: 34, ap: 0.005, bloom: 0.7 },
    { t: 28.7, pos: [0.3, 0.66, 1.92], look: [0, 0.58, -0.15], fov: 34, ap: 0.004, bloom: 0.75 },
    { t: 29.5, pos: [0.38, 0.66, 2.05], look: [0, 0.6, -0.2], fov: 34, ap: 0.004, bloom: 0.7 },
    { t: 31.3, pos: [0.22, 0.68, 2.4], look: [0, 0.64, -0.26], fov: 34, ap: 0.003, bloom: 0.7 },
    { t: 32.79, pos: [0, 0.67, 2.06], look: [0, 0.65, -0.3], fov: 34, ap: 0.003, bloom: 0.72 },
  ],
  lines: [
    { t: 24.8, end: 28.6, text: '多出来的钱，买的是欲望。' },
    { t: 28.7, end: 32.7, text: '而欲望，是可以被设计出来的。' },
  ],
  hits: [[DONE, 0.45], [WANG, 0.3]],
  bg: '#030308',
};
