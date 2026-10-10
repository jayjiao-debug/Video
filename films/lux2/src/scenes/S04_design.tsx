/* S04 · design (24.707 – 32.806) — STUB, to be built. */
import React from 'react';
import type { SceneDef } from '../scene';
import { Backdrop, MirrorFloor, Word } from '../kit';

const Set: React.FC<{ T: number }> = () => (
  <group>
    <Backdrop burst="gold" />
    <MirrorFloor />
    <Word text="S04" size={0.2} kind="gold" position={[0, 0.4, 0]} />
    <spotLight position={[0, 2.4, 1.6]} angle={0.5} penumbra={0.7} intensity={14} color="#fff0d8" />
  </group>
);

export const S04: SceneDef = {
  id: 'S04_design', t0: 24.707, t1: 32.806, x: 42, enter: 'whip', Set,
  keys: [
    { t: 24.707 + 0.3, pos: [0, 0.5, 1.4], look: [0, 0.4, 0], fov: 36 },
    { t: 32.806 - 0.3, pos: [0.2, 0.5, 1.2], look: [0, 0.4, 0], fov: 36 },
  ],
  lines: [],
};
