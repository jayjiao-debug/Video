/* S12 · reveal (97.606 – 105.707), the thesis. Hard cut on the A hit from S11's cream price tag to the cream €53
   museum label. True scale: the slab is 30 mm for €53, so the €2,547 gap is a 1.44 m gold pillar.
   99.631 (bar): the pillar grows out of the slab while the camera cranes up from the floor with it, landing on
   the 101.657 bar with €2,600 at the top and a gold fan of rays behind. Then the four words light one per beat
   (102.162 / 102.669 / 103.175 / 103.681); on the last one the rays flare and gold leaf starts to fall. The
   camera keeps orbiting into the whip-pan. The brightest, biggest frame of the film. */
import React from 'react';
import type { SceneDef } from '../scene';
import { prog, easeOut, easeInOut, impulse, pop, clamp } from '../scene';
import { HeroBag, Cut, rect, rays } from '../foil';
import { Backdrop, MirrorFloor, PaperCard, Confetti } from '../kit';
import { Spot, diamond, FoilText, Glow } from './S10_kit';

const SLAB = 0.03, H = SLAB * 2547 / 53, TOP = SLAB + H; // 1.4417 m
const GROW0 = 99.631, GROW1 = 101.657;
const WORDS: [string, number][] = [['排队', 102.162], ['等待', 102.669], ['价格', 103.175], ['logo', 103.681]];
const PW = 560; // pillar width, mm

const Set: React.FC<{ T: number }> = ({ T }) => {
  const hit = impulse(T, 97.606, 0.3);
  const g = prog(T, GROW0, GROW1), r = g < 0.5 ? 2 * g * g : 1 - Math.pow(-2 * g + 2, 2) / 2; // ease in-out, lands on the bar
  const h = Math.max(0.0005, H * r), land = impulse(T, GROW1, 0.35), peak = impulse(T, 103.681, 0.5);
  const mark = pop(T, GROW1 - 0.05, 0.22);
  const fan = easeOut(prog(T, GROW1 - 0.2, GROW1 + 0.5));
  const show = (y: number, a = 0.05) => clamp((SLAB + h - y) / a);
  const warm = 0.25 + 0.75 * r;
  return (
    <group>
      <Backdrop burst="none" z={-1.8} />
      <Glow w={4.2} h={3.4} color="#ff9a3a" o={(0.12 + 0.28 * r + 0.25 * peak) * 1} position={[0, 0.95, -1.7]} />
      {fan > 0 && <Cut d={rays(36, 380, 2600, Math.PI * 1.05, Math.PI * 1.95, 0.0055)} kind="gold" position={[0, TOP - 0.1, -1.72]}
        scale={[0.5 + 0.5 * fan + 0.06 * peak, 0.5 + 0.5 * fan + 0.06 * peak, 1]} shadow={false} />}
      <MirrorFloor tint="#2a2218" />

      {/* €53: the cream slab, and its museum label on a gold post */}
      <Cut d={rect(-330, -SLAB * 1000, 660, SLAB * 1000)} kind="paper" depth={0.36} bevel={0.0015} position={[0, 0, -0.18]} />
      <group position={[-0.62, 0, 0.1]}>
        <Cut d={rect(-4, -380, 8, 380)} kind="gold" depth={0.008} />
        <Cut d={rect(-60, -8, 120, 8)} kind="gold" depth={0.08} position={[0, 0, -0.04]} />
        <PaperCard w={0.24} h={0.11} lines={[['€ 53', 0.48], ['代工厂交货价', 0.17, '700']]} position={[0, 0.43, 0.02]} rotation={[-0.35, 0.12, 0]} />
      </group>

      {/* the pillar: gold body, black lacquer face; text appears as the top passes it */}
      <group position={[0, SLAB, 0]}>
        <group scale={[1, h / H, 1]}>
          <Cut d={rect(-PW / 2, -H * 1000, PW, H * 1000)} kind="gold" depth={0.24} position={[0, 0, -0.12]} />
          <Cut d={rect(-PW / 2 + 26, -(H * 1000 - 26), PW - 52, H * 1000 - 52)} kind="lacquer" color="#0b0806" depth={0.004} bevel={0} position={[0, 0, 0.1218]} />
        </group>
        <group position={[0, 0, 0.128]}>
          <group scale={show(1.25)}><FoilText text="€2,547" glyph={0.115} position={[0, 1.2, 0]} sheen={prog(T, GROW1 + 0.1, GROW1 + 0.7)} /></group>
          <Cut d={rect(-170, -1.5, 340, 3)} kind="gold" depth={0.001} bevel={0} position={[0, 1.075, 0]} scale={[show(1.08), 1, 1]} shadow={false} />
          {WORDS.map(([w, t], i) => {
            const on = easeOut(prog(T, t - 0.03, t + 0.06)), k = impulse(T, t, 0.25);
            return (
              <group key={w} position={[0, 0.93 - i * 0.19, 0]} scale={show(0.98 - i * 0.19) * (1 + 0.05 * k)}>
                <FoilText text={w} glyph={0.085} gain={0.2 + 1.0 * on + 0.5 * k} />
                {i < 3 && <Cut d={diamond(0, 0, 18)} kind="gold" depth={0.001} bevel={0} position={[0, -0.095, 0]} shadow={false} />}
              </group>
            );
          })}
        </group>
      </group>

      {/* €2,600: the shop price, at the top */}
      {mark > 0 && <group position={[0, TOP + 0.005, 0.06]}>
        <Cut d={rect(-380, -2, 760, 4)} kind="gold" depth={0.002} bevel={0} scale={[mark, 1, 1]} shadow={false} />
        <FoilText text="€2,600" glyph={0.12} position={[0, 0.11, 0]} scale={mark} sheen={prog(T, 103.68, 104.3)} />
      </group>}

      {/* the bag on its own plinth, for scale */}
      <group position={[0.7, 0, 0.1]}>
        <Cut d={rect(-180, -260, 360, 260)} kind="black" depth={0.3} position={[0, 0, -0.15]} />
        <Cut d={rect(-184, -264, 368, 6)} kind="gold" depth={0.004} position={[0, 0, 0.152]} shadow={false} />
        <HeroBag position={[0, 0.26, 0]} rotation={[0, -0.3, 0]} swing={5 * Math.sin(T * 1.3)} />
      </group>

      <Spot p={[0.9, 3.4, 2.4]} at={[0, 0.85, 0]} i={(30 + 16 * hit + 14 * land + 10 * peak) * (0.6 + 0.4 * warm)} color="#fff0d8" angle={0.45} pen={0.6} shadow />
      <Spot p={[0, 2.4, -1.3]} at={[0, 0.9, 0.4]} i={26 * warm + 20 * peak} color="#ffb860" angle={0.55} pen={0.8} />
      <Spot p={[-2.4, 1.2, 1.2]} at={[0, 0.6, 0]} i={5} color="#ff3ec8" angle={0.5} pen={0.9} />
      <Spot p={[2.4, 1.2, 1.2]} at={[0, 0.6, 0]} i={5} color="#29e6ff" angle={0.5} pen={0.9} />
      {T > 103.6 && <Confetti T={T} box={[2.6, 2.2, 1.4]} center={[0, 1.1, 0.3]} n={60} seed={5} fall={0.12} />}
      <ambientLight intensity={0.05} />
    </group>
  );
};

export const S12: SceneDef = {
  id: 'S12_reveal', t0: 97.606, t1: 105.707, x: 154, enter: 'cut', Set,
  env: 0.6,
  keys: [
    { t: 97.606, pos: [-0.6, 0.52, 0.5], look: [-0.62, 0.45, 0.12], fov: 30, ap: 0.006, bloom: 0.65 },
    { t: 98.6, pos: [-0.35, 0.4, 1.25], look: [-0.2, 0.3, 0], fov: 40, ap: 0.003, bloom: 0.6 },
    { t: 99.631, pos: [0.2, 0.18, 1.95], look: [0, 0.32, 0], fov: 48, ap: 0.002, bloom: 0.6 },
    { t: 100.6, pos: [0.32, 0.34, 2.0], look: [0, 0.6, 0], fov: 50, ap: 0.002, bloom: 0.65 },
    { t: 101.657, pos: [0.45, 0.62, 1.98], look: [0, 0.84, 0], fov: 52, ap: 0.002, bloom: 0.7 },
    { t: 103.681, pos: [0.18, 0.56, 1.86], look: [0, 0.84, 0], fov: 52, ap: 0.002, bloom: 0.75 },
    { t: 105.407, pos: [-0.42, 0.54, 1.9], look: [0, 0.84, 0], fov: 52, ap: 0.002, bloom: 0.7 },
  ],
  lines: [
    { t: 97.7, end: 101.5, text: '所以，53欧元和2600欧元之间——' },
    { t: 101.6, end: 105.6, text: '是排队、等待、价格和logo，被设计出来的欲望。' },
  ],
  hits: [[101.657, 0.45], [103.681, 0.4]],
};
