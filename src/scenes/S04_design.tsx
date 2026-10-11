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
import { MirrorFloor, Word, Confetti, Beam, Backdrop } from '../kit';
import { mat } from '../foil';
import { Spot, GLine, Ribbon, arcPts } from './S03_parts';

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
  const xs = Array.from({ length: 29 }, (_, i) => -1.4 + i * 0.1), ys = Array.from({ length: 16 }, (_, i) => i * 0.1);
  return (
    <group position={[0, 0, -0.85]}>
      {xs.map((x, i) => { const major = Math.abs(Math.round(x * 10)) % 5 === 0; const k = easeOut(prog(T, 24.75 + Math.abs(x) * 0.45, 25.5 + Math.abs(x) * 0.45));
        return <GLine key={'v' + i} a={[x, 0]} b={[x, 1.5]} k={k} w={major ? 0.0028 : 0.0016} color="#d9a441" bright={(major ? 0.42 : 0.2) * (1 + flare)} />; })}
      {ys.map((y, i) => { const major = i % 5 === 0; const k = easeOut(prog(T, 24.85 + y * 0.4, 25.7 + y * 0.4));
        return <group key={'h' + i}>
          <GLine a={[0, y]} b={[1.45, y]} k={k} w={major ? 0.0028 : 0.0016} color="#d9a441" bright={(major ? 0.42 : 0.2) * (1 + flare)} />
          <GLine a={[0, y]} b={[-1.45, y]} k={k} w={major ? 0.0028 : 0.0016} color="#d9a441" bright={(major ? 0.42 : 0.2) * (1 + flare)} />
        </group>; })}
      {prog(T, 26.0, 26.4) > 0 && <Word text="1 : 1" size={0.04} kind="glow" color="#d9a441" glow={0.9} position={[-1.2, 1.36, 0.002]} scale={easeOut(prog(T, 26.0, 26.4))} />}
    </group>
  );
};

const Set: React.FC<{ T: number }> = ({ T }) => {
  const flare = 1.4 * impulse(T, DONE, 0.45);
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
      <Backdrop burst="holo" burstY={0.5} glow={0.18} n={36} />
      <MirrorFloor />
      <Grid T={T} flare={flare * 0.6} />
      {/* the great arch: two lines rise and meet at the keystone on 28.7, then it holds as one */}
      <group position={[0, 0, ARCH.Z]}>
        {T < DONE ? <>
          <Ribbon pts={halfL} k={hk} w={0.006} color={GOLD} bright={1.5} />
          <Ribbon pts={halfR} k={hk} w={0.006} color={GOLD} bright={1.5} />
        </> : <Ribbon pts={arch} k={1} w={0.006} color={GOLD} bright={b(1.5)} />}
        <Ribbon pts={inner} k={easeInOut(prog(T, 27.5, DONE + 0.2))} w={0.0022} holo />
        {/* the bar-15 fill stacks echo arches: a stepped deco portal */}
        {echoes.map((p, i) => { const k = easeOut(prog(T, ECHO[i], ECHO[i] + 0.16)); const kick = impulse(T, ECHO[i], 0.3);
          return <Ribbon key={i} pts={p} k={k} w={i === 1 ? 0.0024 : 0.0045} holo={i === 1} color={GOLD} bright={1.1 + 1.6 * kick} z={-0.02 * (i + 1)} />; })}
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
        <mesh position={[0, 0.0358, 0]} receiveShadow><cylinderGeometry args={[0.236, 0.236, 0.002, 72]} /><meshPhysicalMaterial color="#120e16" roughness={0.85} sheen={0.6} sheenColor="#5a4a8a" /></mesh>
        {Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return (
          <mesh key={i} position={[Math.sin(a) * 0.255, 0.018, Math.cos(a) * 0.255]} rotation={[0, a, 0]} material={mat('gold')}><boxGeometry args={[0.003, i % 9 ? 0.012 : 0.026, 0.002]} /></mesh>); })}
        <HeroBag position={[0, 0.037, 0]} swing={swing(T, 25.0, 6) + 3 * Math.sin(T * 0.9)} />
      </group>
      {/* golden spiral (holo) whose eye is the clasp, in a plane just in front of the bag */}
      <Ribbon pts={spiral} k={easeInOut(prog(T, 26.1, 27.6))} w={0.0024} holo z={0.09} />
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
      {/* light */}
      <Spot pos={[0.2, 2.3, 1.4]} at={[0, 0.15, 0]} intensity={9 + 8 * impulse(T, DONE, 0.3)} angle={0.22} penumbra={0.8} color="#fff0d8" shadow />
      <Spot pos={[-2.0, 1.0, 1.0]} at={[0, 0.42, 0]} intensity={2.2} angle={0.4} penumbra={0.9} color="#ff3ec8" />
      <Spot pos={[2.0, 1.0, 1.0]} at={[0, 0.42, 0]} intensity={2.2} angle={0.4} penumbra={0.9} color="#29e6ff" />
      <Spot pos={[0, 1.6, -1.2]} at={[0, 0.3, 0]} intensity={3} angle={0.4} penumbra={0.9} color="#ffd9a0" />
      <Beam from={[0.06, 2.2, 0.6]} len={2.2} r={0.34} o={0.035 + 0.05 * impulse(T, DONE, 0.4)} tilt={[0.28, 0]} />
      <Confetti T={T} box={[1.6, 1.0, 0.9]} center={[0, 0.55, 0.2]} n={22} seed={4} />
      <ambientLight intensity={0.03} />
    </group>
  );
};

export const S04: SceneDef = {
  id: 'S04_design', t0: 24.707, t1: 32.806, x: 42, enter: 'whip', Set,
  keys: [
    { t: 25.007, pos: [-0.72, 0.34, 0.98], look: [0, 0.3, -0.1], fov: 34, ap: 0.006, bloom: 0.75 },
    { t: 26.9, pos: [-0.55, 0.44, 1.55], look: [0, 0.36, -0.12], fov: 34, ap: 0.005, bloom: 0.75 },
    { t: 28.7, pos: [0.22, 0.5, 1.75], look: [0, 0.4, -0.15], fov: 34, ap: 0.004, bloom: 0.85 },
    { t: 30.75, pos: [0.4, 0.45, 1.95], look: [0, 0.4, -0.2], fov: 34, ap: 0.004, bloom: 0.8 },
    { t: 32.79, pos: [0, 0.42, 2.06], look: [0, 0.4, -0.3], fov: 34, ap: 0.003, bloom: 0.85 },
  ],
  lines: [
    { t: 24.8, end: 28.6, text: '多出来的钱，买的是欲望。' },
    { t: 28.7, end: 32.7, text: '而欲望，是可以被设计出来的。' },
  ],
  hits: [[DONE, 0.45], [WANG, 0.3]],
  bg: '#030308',
};
