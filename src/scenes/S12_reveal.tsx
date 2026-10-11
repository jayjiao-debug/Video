/* S12 · reveal (97.606 – 105.707), hard cut on the A hit from S11's cream price tag to the cream €53 slab.
   True scale: the slab is 30 mm thick for €53, so the €2,547 gap is a 1.44 m monolith. 100.136: a gold laser
   shoots up from the slab to the €2,600 mark (the gap, empty). 101.6: the gold monolith rises out of the slab
   and lands on 102.415, the camera tilting up with it, then pulls back to a worm's-eye hero shot. */
import React from 'react';
import type { SceneDef } from '../scene';
import { prog, easeOut, easeInOut, impulse, pop, clamp } from '../scene';
import { HeroBag, Cut, rect, rays } from '../foil';
import { Backdrop, MirrorFloor, PaperCard, Word, Beam, Confetti } from '../kit';
import { Spot, diamond } from './S10_kit';

const SLAB = 0.03, H = SLAB * 2547 / 53, TOP = SLAB + H; // 1.4417 m
const LASER = 100.136, RISE0 = 101.6, RISE1 = 102.415;

const Set: React.FC<{ T: number }> = ({ T }) => {
  const hit = impulse(T, 97.606, 0.3);
  const laser = easeOut(prog(T, LASER, LASER + 0.28)) * (1 - 0.85 * prog(T, RISE1, RISE1 + 0.4));
  const r = easeInOut(prog(T, RISE0, RISE1)), h = Math.max(0.0005, H * r), land = impulse(T, RISE1, 0.3);
  const mark = pop(T, LASER + 0.2, 0.25);
  const burst = easeOut(prog(T, RISE0 + 0.3, RISE1 + 0.6));
  const show = (y: number, a = 0.06) => clamp((SLAB + h - y) / a); // a label shows once the top has passed it
  return (
    <group>
      <Backdrop burst="none" z={-1.8} />
      {burst > 0 && <Cut d={rays(40, 420, 3000, Math.PI * 1.06, Math.PI * 1.94, 0.005)} kind="gold" position={[0, TOP - 0.15, -1.74]} scale={[0.55 + 0.45 * burst, 0.55 + 0.45 * burst, 1]} shadow={false} />}
      <MirrorFloor />

      {/* €53: the cream slab */}
      <Cut d={rect(-300, -SLAB * 1000, 600, SLAB * 1000)} kind="paper" depth={0.32} bevel={0.0015} position={[0, 0, -0.16]} />
      <Word text="€53" size={0.034} kind="ink" weight="900" position={[0, SLAB / 2, 0.163]} />
      <PaperCard w={0.17} h={0.08} lines={[['€ 53', 0.5], ['代工厂交货价', 0.16, '700']]} position={[-0.05, 0.038, 0.26]} rotation={[-0.22, 0.12, 0]} />

      {/* the monolith: gold body, black velvet face, text revealed as the top passes it */}
      <group position={[0, SLAB, 0]}>
        <group scale={[1, h / H, 1]}>
          <Cut d={rect(-230, -H * 1000, 460, H * 1000)} kind="gold" depth={0.22} position={[0, 0, -0.11]} />
          <Cut d={rect(-202, -(H * 1000 - 28), 404, H * 1000 - 56)} kind="black" depth={0.004} bevel={0} position={[0, 0, 0.1118]} />
        </group>
        {r > 0.01 && T < RISE1 + 0.5 && <Cut d={rect(-232, -6, 464, 6)} kind="holo" depth={0.224} bevel={0} position={[0, h, -0.112]} shadow={false} />}
        <group position={[0, 0, 0.118]}>
          <Word text="€2,547" size={0.15} kind="gold" position={[0, 1.18, 0]} scale={show(1.25)} />
          <Cut d={rect(-130, -1.5, 260, 3)} kind="gold" depth={0.001} bevel={0} position={[0, 1.075, 0]} scale={[show(1.08), 1, 1]} shadow={false} />
          {['排队', '等待', '价格', 'logo'].map((w, i) => (
            <group key={w} position={[0, 0.93 - i * 0.175, 0]} scale={show(0.98 - i * 0.175)}>
              <Word text={w} size={0.12} kind="cream" weight="900" />
              {i < 3 && <Cut d={diamond(0, 0, 16)} kind="gold" depth={0.001} bevel={0} position={[0, -0.088, 0]} shadow={false} />}
            </group>
          ))}
        </group>
      </group>

      {/* the gap made visible: a gold laser to the €2,600 mark */}
      {laser > 0 && <mesh position={[-0.36, SLAB + (H * laser) / 2, 0.05]}><boxGeometry args={[0.004, H * laser, 0.004]} /><meshBasicMaterial color="#ffd27a" toneMapped={false} /></mesh>}
      {laser > 0 && <Beam from={[-0.36, SLAB + H * laser, 0.05]} len={H * laser} r={0.05} o={0.12 * laser} color="#ffc860" />}
      <group position={[0, TOP, 0.05]}>
        {mark > 0 && <>
          <Cut d={rect(-320, -2, 640, 4)} kind="gold" depth={0.002} bevel={0} scale={[mark, 1, 1]} shadow={false} />
          <Word text="€2,600" size={0.16} kind="glow" color="#f1c56d" glow={0.95} position={[0, 0.11, 0]} scale={mark} />
        </>}
      </group>

      {/* the bag for scale */}
      <HeroBag position={[0.52, 0, 0.08]} rotation={[0, -0.25, 0]} swing={6 * Math.sin(T * 1.3)} />

      <Spot p={[0.7, 3.4, 2.2]} at={[0, 0.7, 0]} i={(26 + 16 * hit + 12 * land) * (1 - 0.35 * r)} color="#fff0d8" angle={0.42} pen={0.6} shadow />
      <Spot p={[0, 0.08, 1.4]} at={[0, 1.0, 0]} i={(4 + 6 * land) * r} color="#ffcf8a" angle={0.5} pen={0.8} />
      <Spot p={[-2.4, 1.2, 1.2]} at={[0, 0.5, 0]} i={9} color="#ff3ec8" angle={0.5} pen={0.9} />
      <Spot p={[2.4, 1.2, 1.2]} at={[0, 0.5, 0]} i={9} color="#29e6ff" angle={0.5} pen={0.9} />
      <Beam from={[0.2, 3.0, 0.2]} len={3.0} r={0.6} o={0.03 + 0.05 * land} />
      <Confetti T={T} box={[2.4, 2.0, 1.2]} center={[0, 1.0, 0.2]} n={30} seed={5} fall={0.025} />
      <ambientLight intensity={0.035} />
    </group>
  );
};

export const S12: SceneDef = {
  id: 'S12_reveal', t0: 97.606, t1: 105.707, x: 154, enter: 'cut', Set,
  env: 0.5,
  keys: [
    { t: 97.606, pos: [-0.04, 0.075, 0.6], look: [-0.05, 0.045, 0.26], fov: 30, ap: 0.01, bloom: 0.8 },
    { t: 99.3, pos: [0.55, 0.13, 1.25], look: [0.08, 0.1, 0.1], fov: 34, ap: 0.006, bloom: 0.7 },
    { t: 100.5, pos: [0.5, 0.3, 2.1], look: [0, 0.5, 0], fov: 40, ap: 0.004, bloom: 0.7 },
    { t: 101.7, pos: [0.4, 0.58, 3.35], look: [0, 0.83, 0], fov: 42, ap: 0.002, bloom: 0.65 },
    { t: 102.6, pos: [0.2, 0.42, 2.85], look: [0, 0.76, 0], fov: 44, ap: 0.002, bloom: 0.8 },
    { t: 103.7, pos: [-0.3, 0.07, 2.05], look: [0, 0.6, 0], fov: 58, ap: 0.002, bloom: 0.6 },
    { t: 105.407, pos: [-0.68, 0.08, 2.0], look: [0, 0.6, 0], fov: 58, ap: 0.002, bloom: 0.6 },
  ],
  lines: [
    { t: 97.7, end: 101.5, text: '所以，53欧元和2600欧元之间——' },
    { t: 101.6, end: 105.6, text: '是排队、等待、价格和logo，被设计出来的欲望。', gold: true },
  ],
  hits: [[100.136, 0.25], [102.415, 0.55]],
};
