/* S07 · wine (57.106 – 65.206) — STUB, to be built. */
import React from 'react';
import type { SceneDef } from '../scene';
import { Backdrop, MirrorFloor, Word } from '../kit';

const Set: React.FC<{ T: number }> = () => (
  <group>
    <Backdrop burst="gold" />
    <MirrorFloor />
    <Word text="S07" size={0.2} kind="gold" position={[0, 0.4, 0]} />
    <spotLight position={[0, 2.4, 1.6]} angle={0.5} penumbra={0.7} intensity={14} color="#fff0d8" />
  </group>
);

export const S07: SceneDef = {
  id: 'S07_wine', t0: 57.106, t1: 65.206, x: 84, enter: 'cut', Set,
  keys: [
    { t: 57.106, pos: [0, 0.5, 1.4], look: [0, 0.4, 0], fov: 36 },
    { t: 65.206 - 0.3, pos: [0.2, 0.5, 1.2], look: [0, 0.4, 0], fov: 36 },
  ],
  lines: [],
};
