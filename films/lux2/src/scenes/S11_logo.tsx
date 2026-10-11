/* S11 · logo (89.508 – 97.606). Two plinths. Left, LOUD: the bag covered in our ◆ pattern with a big ◆ on the
   flap, blasted by brash gold flood light and a fan of gold rays. Right, QUIET: the plain crimson bag, one precise
   white spot and a single thin holo halo. Line 2: price tags drop in, the quiet plinth rises (lands 94.569) until
   the plain bag sits inside its halo, above the loud one. The camera ends on the quiet bag's cream price tag,
   which match-cuts to S12's cream €53 slab. */
import React from 'react';
import type { SceneDef } from '../scene';
import { prog, easeOut, easeInOut, impulse, swing, pop } from '../scene';
import { HeroBag, Cut, rect, ring, rays } from '../foil';
import { Backdrop, MirrorFloor, PaperCard, Beam } from '../kit';
import { Spot, diamond, Glow } from './S10_kit';

const LOUD_X = -0.5, QUIET_X = 0.5, PL = 0.42, RISE = 0.22, R0 = 93.556, R1 = 94.569;

/* the all-over ◆ pattern, clipped to the bag's body and flap (bag coords, mm, y down) */
const pattern = (() => {
  const body: string[] = [], flap: string[] = [];
  for (let j = 0; j < 9; j++) for (let i = -6; i <= 6; i++) {
    const y = -12 - j * 25, x = i * 25 + (j % 2 ? 12.5 : 0);
    const half = 150 - (38 * -y) / 220 - 16;
    if (Math.abs(x) < half && y > -208) body.push(diamond(x, y, 11));
    const flapBottom = -98 - 52 * Math.pow(Math.abs(x) / 136, 2);
    const logoZone = Math.abs(x) < 52 && y < -100 && y > -214;
    if (Math.abs(x) < 124 && y < flapBottom - 8 && y > -212 && !logoZone) flap.push(diamond(x, y, 11));
  }
  return { body: body.join(' '), flap: flap.join(' ') };
})();

const Plinth: React.FC<{ x: number; h: number; trim?: 'gold' | 'holo' }> = ({ x, h, trim = 'gold' }) => (
  <group position={[x, 0, 0]}>
    <group scale={[1, h / PL, 1]}><Cut d={rect(-190, -PL * 1000, 380, PL * 1000)} kind="black" depth={0.36} bevel={0.002} position={[0, 0, -0.18]} /></group>
    <Cut d={rect(-200, -12, 400, 12)} kind="black" depth={0.38} position={[0, h, -0.19]} />
    <Cut d={rect(-204, -6, 408, 6)} kind="gold" depth={0.004} position={[0, 0.012, 0.186]} shadow={false} />
  </group>
);

/** a paper price tag on a thread from the bag's left handle ring */
const PriceTag: React.FC<{ x: number; y: number; T: number; k: number; a: number; text: string; hi?: boolean }> = ({ x, y, T, k, a, text, hi }) => (
  <group position={[x - 0.078, y + 0.222, 0.028]} rotation={[0, 0, ((-28 + swing(T, a, 16)) * Math.PI) / 180]} scale={k}>
    <Cut d={rect(-0.8, 0, 1.6, 70)} kind="paper" depth={0.001} bevel={0} shadow={false} />
    <PaperCard w={0.13} h={0.058} lines={[[text, 0.44, '900', hi ? '#7a4a0c' : undefined]]} position={[0, -0.1, 0]} rotation={[0, 0, 0.5]} />
  </group>
);

const Set: React.FC<{ T: number }> = ({ T }) => {
  const rise = RISE * easeInOut(prog(T, R0, R1)), land = impulse(T, R1, 0.25);
  const qh = PL + rise, tagIn = pop(T, R0, 0.28);
  const loudKick = impulse(T, 92.037, 0.3);
  const halo = easeOut(prog(T, R0 + 0.3, R1 + 0.2));
  return (
    <group>
      <Backdrop burst="none" />
      <MirrorFloor />
      {/* LOUD: a fan of gold rays behind the patterned bag */}
      <Cut d={rays(15, 260, 820, Math.PI * 1.2, Math.PI * 1.8, 0.011)} kind="gold" position={[LOUD_X - 0.04, PL + 0.2, -0.9]} shadow={false} />
      {/* QUIET: one thin holo halo, the plain bag rises into it */}
      {halo > 0 && <group position={[QUIET_X, PL + RISE + 0.19, -0.5]} scale={0.7 + 0.3 * halo}>
        <Cut d={ring(0, 0, 238, 246)} kind="gold" shadow={false} />
        <Cut d={ring(0, 0, 266, 268)} kind="gold" position={[0, 0, -0.04]} shadow={false} />
        <Glow w={0.9} h={0.9} color="#ffcf8a" o={0.28 * halo} position={[0, 0, -0.08]} />
      </group>}

      <Plinth x={LOUD_X} h={PL} />
      <Plinth x={QUIET_X} h={qh} />

      {/* the loud bag: our own ◆ all over, a big ◆ on the flap */}
      <group position={[LOUD_X, PL + 0.016, 0]}>
        <HeroBag swing={swing(T, 89.9, 6)} tag={false} stitch="gold" light={0.45} />
        <Cut d={pattern.body} kind="gold" depth={0.001} bevel={0} position={[0, 0, 0.0086]} shadow={false} />
        <Cut d={pattern.flap} kind="gold" depth={0.001} bevel={0} position={[0, 0, 0.0204]} shadow={false} />
        <Cut d={diamond(0, -158, 86)} kind="gold" depth={0.004} position={[0, 0, 0.021]} />
        <Cut d={diamond(0, -158, 58)} kind="holo" depth={0.002} bevel={0} position={[0, 0, 0.0265]} shadow={false} />
      </group>
      {/* the quiet bag */}
      <group position={[QUIET_X, qh + 0.016, 0]}>
        <HeroBag swing={swing(T, 89.9, 8) + swing(T, R1, 10)} light={0.45} />
      </group>

      {/* name cards on the plinth fronts; price tags drop onto the handles on line 2 */}
      <PaperCard w={0.2} h={0.064} lines={[['大logo款', 0.52]]} position={[LOUD_X, PL - 0.05, 0.19]} />
      <PaperCard w={0.2} h={0.064} lines={[['低调款', 0.52]]} position={[QUIET_X, qh - 0.05, 0.19]} />
      {tagIn > 0 && <>
        <PriceTag x={LOUD_X} y={PL + 0.016} T={T} k={tagIn} a={R0} text="价格 较低" />
        <PriceTag x={QUIET_X} y={qh + 0.016} T={T} k={tagIn} a={R0 + 0.06} text="价格 更高" hi />
      </>}

      {/* light: brash gold flood on the loud, one precise white spot on the quiet */}
      <Spot p={[-1.3, 2.0, 1.8]} at={[LOUD_X, PL + 0.2, 0]} i={20 + 8 * loudKick} color="#ffbf4a" angle={0.16} pen={0.45} shadow />
      <Spot p={[0.75, 2.8, 1.1]} at={[QUIET_X, qh + 0.18, 0]} i={(16 + 12 * land) * (0.55 + 0.45 * easeOut(prog(T, 89.9, 91.2)))} color="#fff6ea" angle={0.13} pen={0.55} shadow />
      <Spot p={[2.6, 1.0, 1.2]} at={[QUIET_X, 0.7, 0]} i={4} color="#29e6ff" angle={0.4} pen={0.9} />
      <Spot p={[-2.6, 1.0, 1.2]} at={[LOUD_X, 0.6, 0]} i={4} color="#ff3ec8" angle={0.4} pen={0.9} />
      <Beam from={[QUIET_X + 0.1, 2.4, -0.05]} len={2.0} r={0.28} o={0.05 + 0.05 * land} />
      <Beam from={[LOUD_X - 0.3, 2.3, 0.1]} len={2.0} r={0.6} o={0.035} color="#ffc860" />
      <ambientLight intensity={0.03} />
    </group>
  );
};

export const S11: SceneDef = {
  id: 'S11_logo', t0: 89.508, t1: 97.606, x: 140, enter: 'whip', Set,
  keys: [
    { t: 89.808, pos: [-0.85, 0.66, 1.36], look: [-0.46, 0.53, 0], fov: 34, ap: 0.003, bloom: 0.7 },
    { t: 91.533, pos: [-0.2, 0.72, 1.92], look: [0.0, 0.59, 0], fov: 36, ap: 0.002, bloom: 0.65 },
    { t: 92.6, pos: [-0.06, 0.72, 1.96], look: [0.03, 0.59, 0], fov: 36, ap: 0.002, bloom: 0.65 },
    { t: 93.558, pos: [0.06, 0.73, 1.92], look: [0.06, 0.61, 0], fov: 36, ap: 0.002, bloom: 0.65 },
    { t: 94.569, pos: [0.3, 0.92, 1.74], look: [0.2, 0.66, 0], fov: 35, ap: 0.002, bloom: 0.7 },
    { t: 95.583, pos: [0.37, 0.94, 1.58], look: [0.27, 0.69, 0], fov: 34, ap: 0.003, bloom: 0.7 },
    { t: 97.6, pos: [0.45, 0.83, 0.42], look: [0.38, 0.795, 0.02], fov: 30, ap: 0.008, bloom: 0.7 },
  ],
  lines: [
    { t: 89.6, end: 93.5, text: '而有钱又不靠牌子证明自己的人，偏爱低调款。' },
    { t: 93.6, end: 97.5, text: '同一品牌里，logo越低调，价格反而越高。' },
  ],
  hits: [[94.569, 0.35]],
};
