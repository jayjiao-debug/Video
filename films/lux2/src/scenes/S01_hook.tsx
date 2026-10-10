/* S01 · hook (0 – 8.505): the bag alone on the foil stage. €53 lands, then €2,600, then ×49; the camera starts
   on the holo tag charm, pulls back to reveal the stage, then dives back into the charm for the title cut. */
import React from 'react';
import type { SceneDef } from '../scene';
import { pop, slam, impulse, swing, prog, easeOut } from '../scene';
import { HeroBag, Cut, rect } from '../foil';
import { Backdrop, MirrorFloor, PaperCard, Word, Confetti, Beam } from '../kit';

const Set: React.FC<{ T: number }> = ({ T }) => {
  const on = T >= 0.402 ? 1 : 0;
  const kick = impulse(T, 2.938, 0.2) + impulse(T, 5.975, 0.2) + 0.5 * impulse(T, 4.457, 0.15);
  const c53 = pop(T, 0.52, 0.28), c2600 = slam(T, 2.938), x49 = slam(T, 5.975);
  return (
    <group>
      <Backdrop burst="holo" burstY={0.25} />
      <MirrorFloor />
      <Cut d={rect(-260, -120, 520, 120)} kind="black" position={[0, 0, -0.1]} />
      <Cut d={rect(-290, -136, 580, 16)} kind="gold" position={[0, 0, -0.08]} />
      <HeroBag position={[0, 0.136, 0]} swing={swing(T, 0.45, 12) + swing(T, 2.94, 8) + swing(T, 5.98, 8)} />
      {/* €53: a plain paper tag, the factory's price */}
      {c53 > 0 && <PaperCard w={0.16} h={0.09} lines={[['€ 53', 0.46], ['代工厂交货价', 0.16, '700']]} position={[-0.42, 0.44 + (1 - c53) * 0.05, 0.12]} rotation={[0, 0.25, 0.08]} scale={c53} />}
      {/* €2,600: holo foil, the shop's price, slammed on the accent */}
      {c2600 > 0 && <group position={[0.46, 0.48, 0.1]} rotation={[0, -0.28, 0]} scale={1 + 1.4 * (1 - c2600)}>
        <Word text="€2,600" size={0.11} kind="gold" />
        <Word text="店里的标价" size={0.03} kind="cream" weight="700" position={[0, -0.085, 0]} />
      </group>}
      {x49 > 0 && <group position={[0, 0.66, 0.02]} scale={1 + 1.8 * (1 - x49)}><Word text="× 49" size={0.09} kind="gold" /></group>}
      {/* the spot snaps on at the first sound and kicks on the accents */}
      <spotLight position={[0, 2.6, 1.4]} angle={0.3} penumbra={0.6} intensity={on * (14 + 10 * kick)} color="#fff0d8" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <spotLight position={[-2.2, 1.2, 1.2]} angle={0.5} penumbra={0.9} intensity={on * 9} color="#ff3ec8" />
      <spotLight position={[2.2, 1.2, 1.2]} angle={0.5} penumbra={0.9} intensity={on * 9} color="#29e6ff" />
      {on > 0 && <Beam from={[0, 2.6, 0.1]} len={2.5} r={0.5} o={0.05 + 0.04 * kick} />}
      <Confetti T={T} box={[2.2, 1.2, 1.0]} center={[0, 0.55, 0.1]} n={36} />
      <ambientLight intensity={0.03 + 0.02 * easeOut(prog(T, 0.4, 1))} />
    </group>
  );
};

export const S01: SceneDef = {
  id: 'S01_hook', t0: 0, t1: 8.505, x: 0, enter: 'cut', Set,
  keys: [
    { t: 0, pos: [0.04, 0.31, 0.36], look: [0.1, 0.29, 0.02], fov: 30, ap: 0.014, bloom: 0.8 },
    { t: 0.9, pos: [0.02, 0.33, 0.5], look: [0.08, 0.3, 0.02], fov: 30, ap: 0.012, bloom: 0.75 },
    { t: 2.9, pos: [-0.3, 0.42, 1.25], look: [0.02, 0.32, 0], fov: 36, ap: 0.004, bloom: 0.65 },
    { t: 5.9, pos: [0.25, 0.46, 1.1], look: [0, 0.34, 0], fov: 36, ap: 0.004, bloom: 0.65 },
    { t: 7.4, pos: [0.18, 0.36, 0.6], look: [0.08, 0.3, 0.02], fov: 32, ap: 0.008, bloom: 0.7 },
    { t: 8.48, pos: [0.13, 0.285, 0.17], look: [0.115, 0.28, 0.03], fov: 28, ap: 0.02, bloom: 1.0 },
  ],
  lines: [
    { t: 0.5, end: 2.85, text: '代工厂交货时，53欧元。' },
    { t: 2.95, end: 5.85, text: '到了店里，标价2600欧元。' },
    { t: 5.98, end: 8.4, text: '中间，差了49倍。' },
  ],
  hits: [[2.938, 0.6], [5.975, 0.6]],
};
