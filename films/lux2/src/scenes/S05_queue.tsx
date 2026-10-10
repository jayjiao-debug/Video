/* S05 · queue (32.806 – 40.907) — STUB, to be built. */
import React from 'react';
import type { SceneDef } from '../scene';
import { Backdrop, MirrorFloor, Word } from '../kit';

const Set: React.FC<{ T: number }> = () => (
  <group>
    <Backdrop burst="gold" />
    <MirrorFloor />
    <Word text="S05" size={0.2} kind="gold" position={[0, 0.4, 0]} />
    <spotLight position={[0, 2.4, 1.6]} angle={0.5} penumbra={0.7} intensity={14} color="#fff0d8" />
  </group>
);

export const S05: SceneDef = {
  id: 'S05_queue', t0: 32.806, t1: 40.907, x: 56, enter: 'cut', Set,
  keys: [
    { t: 32.806, pos: [0, 0.5, 1.4], look: [0, 0.4, 0], fov: 36 },
    { t: 40.907 - 0.3, pos: [0.2, 0.5, 1.2], look: [0, 0.4, 0], fov: 36 },
  ],
  lines: [],
};
