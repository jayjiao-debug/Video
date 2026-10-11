/* S02 · title (8.505 – 12.4): a hard cut on the title hit from the holo tag straight into the title, standing
   in foil letters on the stage, the bag small behind it. A slow pull back with the roll easing out. */
import React from 'react';
import type { SceneDef } from '../scene';
import { slam, pop, impulse } from '../scene';
import { HeroBag, Cut, rect } from '../foil';
import { Backdrop, MirrorFloor, Word, Confetti, Beam } from '../kit';
import { JUNO } from '../brand/identity';
import { Spot } from './S10_kit';

const Set: React.FC<{ T: number }> = ({ T }) => {
  const s1 = slam(T, 8.505, 0.1), s2 = slam(T, 8.505 + 0.2, 0.1), sub = pop(T, 9.265, 0.3), k = impulse(T, 8.505, 0.25);
  return (
    <group>
      <Backdrop burst="holo" burstY={0.1} glow={0.3} />
      <MirrorFloor />
      <HeroBag position={[0, 0, -0.55]} scale={1.6} swing={8} />
      <group position={[0, 0.5, 0.05]}>
        <group position={[0, 0.17, 0]} scale={1 + 1.5 * (1 - s1)}>{s1 > 0 && <Word text="你买的" size={0.2} kind="gold" />}</group>
        <group position={[0, -0.05, 0]} scale={1 + 1.5 * (1 - s2)}>{s2 > 0 && <Word text="不是包" size={0.2} kind="gold" />}</group>
        {sub > 0 && <>
          <Cut d={rect(-200, -2, 400, 4)} kind="gold" position={[0, -0.17, 0]} scale={[sub, 1, 1]} shadow={false} />
          <Word text="53欧元的包，凭什么卖2600？" size={0.045} kind="cream" weight="700" position={[0, -0.22, 0]} scale={sub} />
          <Word text={`— ${JUNO.series} —`} size={0.025} kind="gold" weight="700" position={[0, -0.28, 0]} scale={sub} />
        </>}
      </group>
      <Spot p={[0, 2.4, 1.6]} at={[0, 0.4, 0]} angle={0.4} pen={0.7} i={16 + 20 * k} color="#fff0d8" shadow />
      <Spot p={[-2.4, 1.0, 1.2]} at={[0, 0.4, 0]} angle={0.6} pen={0.9} i={10} color="#ff3ec8" />
      <Spot p={[2.4, 1.0, 1.2]} at={[0, 0.4, 0]} angle={0.6} pen={0.9} i={10} color="#29e6ff" />
      <Beam from={[0, 2.6, -0.4]} len={2.6} r={0.9} o={0.05 + 0.08 * k} />
      <Confetti T={T} box={[2.6, 1.4, 1.2]} center={[0, 0.6, 0.2]} n={44} seed={2} />
      <ambientLight intensity={0.04} />
    </group>
  );
};

export const S02: SceneDef = {
  id: 'S02_title', t0: 8.505, t1: 12.4, x: 14, enter: 'cut', Set,
  keys: [
    { t: 8.505, pos: [0.05, 0.52, 0.42], look: [0, 0.5, 0], fov: 40, ap: 0.006, bloom: 0.75, roll: 0.08 },
    { t: 9.4, pos: [0.08, 0.55, 0.95], look: [0, 0.48, 0], fov: 38, ap: 0.004, bloom: 0.8, roll: 0.02 },
    { t: 12.1, pos: [0.15, 0.6, 1.3], look: [0, 0.46, -0.1], fov: 38, ap: 0.003, bloom: 0.7, roll: 0 },
  ],
  lines: [],
};
