/* S14 · questions (113.806 – 121.904), hard cut on the peak. Three gold-framed velvet cards mounted off a velvet
   wall (they throw real shadows on it) slam in on the bars: ① on the cut, ② on 115.831, ③ on 117.856; the camera
   backs off just enough each time to keep them big. The bag waits in front, right. 119.88: the camera glides in
   to the bag's holo tag charm; behind it the cards' lights go out one by one (120.387 / 120.891 / 121.399), the
   tag glints last, into S15's spark. No subtitles: the cards are the text. */
import React from 'react';
import type { SceneDef } from '../scene';
import { prog, easeOut, impulse, slam, swing, clamp } from '../scene';
import { HeroBag, Cut, rect } from '../foil';
import { Backdrop, MirrorFloor, Word, Beam, Confetti, textTex } from '../kit';
import { Spot, rrect, rframe, spark } from './S10_kit';

const CX = -0.2, BAG: [number, number, number] = [0.62, 0.42, 0.3];
const CARDS: { t: number; n: string; text: string; off: number }[] = [
  { t: 113.806, n: '①', text: '这是给谁看的？', off: 121.399 },
  { t: 115.831, n: '②', text: '没有logo，我还想要吗？', off: 120.891 },
  { t: 117.856, n: '③', text: '一年后，它还让我开心吗？', off: 120.387 },
];
const W = 1.06, H = 0.2, TXT = 0.1;
const wordW = (text: string, size: number, weight = '900') => { const t = textTex(text, weight, 160); return (size * t.w) / t.h; };

const Card: React.FC<{ T: number; i: number }> = ({ T, i }) => {
  const c = CARDS[i];
  const k = i === 0 ? 1 : slam(T, c.t, 0.14);
  if (k <= 0) return null;
  const land = impulse(T, c.t, 0.22);
  const lit = 1 - 0.92 * easeOut(prog(T, c.off, c.off + 0.12));
  const s = (1 + 0.55 * (1 - k)) * (1 + 0.04 * land);
  const nW = wordW(c.n, TXT), left = -W / 2 + 0.07;
  const ink = (v: number) => { const g = (x: number) => Math.round(x * v).toString(16).padStart(2, '0'); return `#${g(243)}${g(237)}${g(226)}`; };
  return (
    <group position={[CX, 0.97 - i * 0.25, 0.0 + i * 0.05 + 0.4 * (1 - k)]} scale={s}>
      <Cut d={rframe(0, 0, W * 1000, H * 1000, 22, 11)} kind="gold" color={lit > 0.5 ? '#ffffff' : '#5a4420'} depth={0.008} />
      <Cut d={rrect(0, 0, W * 1000 - 8, H * 1000 - 8, 18)} kind="black" depth={0.006} position={[0, 0, -0.007]} />
      <Cut d={rframe(0, 0, W * 1000 - 44, H * 1000 - 44, 10, 2.2)} kind={lit > 0.5 ? 'holo' : 'black'} glow={-0.35} depth={0.001} bevel={0} position={[0, 0, 0.0005]} shadow={false} />
      <Word text={c.n} size={TXT} kind="gold" weight="900" position={[left + nW / 2, 0, 0.006]} color={lit > 0.5 ? undefined : '#4a3818'} />
      <Word text={c.text} size={TXT} kind="cream" weight="900" position={[left + nW + 0.01 + wordW(c.text, TXT) / 2, 0, 0.006]} color={ink(0.12 + 0.88 * lit)} />
      {land > 0.02 && <Cut d={spark(0, 0, 30)} kind="glow" color="#fff4d6" glow={1.5} depth={0.001} bevel={0} shadow={false}
        position={[W / 2 - 0.02, H / 2 - 0.01, 0.012]} scale={0.4 + 1.4 * land} rotation={[0, 0, land * 1.2]} />}
    </group>
  );
};

const Set: React.FC<{ T: number }> = ({ T }) => {
  const kick = impulse(T, 113.806, 0.3) + impulse(T, 115.831, 0.25) + impulse(T, 117.856, 0.25);
  const kickers = 1 - easeOut(prog(T, 120.387, 120.5));
  const key = 1 - easeOut(prog(T, 120.891, 121.0));
  const bagSpot = 1 - 0.75 * easeOut(prog(T, 121.399, 121.5));
  const glint = impulse(T, 121.62, 0.18);
  return (
    <group>
      <Backdrop z={-0.45} burst="none" />
      <MirrorFloor />
      {CARDS.map((_, i) => <Card key={i} T={T} i={i} />)}

      {/* the bag waits in front, right */}
      <group position={[BAG[0], 0, BAG[2] - 0.02]}>
        <Cut d={rect(-200, -BAG[1] * 1000, 400, BAG[1] * 1000)} kind="black" depth={0.26} position={[0, 0, -0.14]} />
        <Cut d={rect(-206, -8, 412, 8)} kind="black" depth={0.27} position={[0, BAG[1], -0.145]} />
        <Cut d={rect(-206, -8, 412, 4)} kind="gold" depth={0.004} position={[0, BAG[1], 0.126]} shadow={false} />
      </group>
      <HeroBag position={[BAG[0], BAG[1] + 0.01, BAG[2]]} rotation={[0, -0.18, 0]} swing={swing(T, 113.85, 6) + swing(T, 119.9, 9) + 3 * Math.sin(T * 1.2)} />
      {glint > 0.02 && <Cut d={spark(0, 0, 26)} kind="glow" color="#ffffff" glow={2} depth={0.001} bevel={0} shadow={false}
        position={[BAG[0] + 0.112, BAG[1] + 0.03 + 0.146, BAG[2] + 0.06]} scale={0.3 + 1.1 * glint} rotation={[0, -0.18, glint]} />}

      <Spot p={[-0.7, 2.7, 2.3]} at={[CX, 0.72, 0]} i={(28 + 10 * kick) * key} angle={0.36} pen={0.55} shadow />
      <Spot p={[1.1, 2.4, 1.1]} at={[BAG[0], BAG[1] + 0.17, BAG[2]]} i={18 * bagSpot} angle={0.1} pen={0.6} shadow map={1024} />
      <Spot p={[1.6, 0.8, 1.4]} at={[BAG[0] + 0.11, BAG[1] + 0.15, BAG[2]]} i={3 + 4 * glint} color="#e8f6ff" angle={0.05} pen={0.5} />
      <Spot p={[-2.4, 1.1, 1.3]} at={[CX, 0.7, 0]} i={9 * kickers} color="#ff3ec8" angle={0.5} pen={0.9} />
      <Spot p={[2.4, 1.1, 1.3]} at={[CX, 0.7, 0]} i={9 * kickers} color="#29e6ff" angle={0.5} pen={0.9} />
      <Beam from={[-0.5, 2.6, 0.3]} len={2.5} r={0.7} o={(0.015 + 0.03 * kick) * key} />
      <Beam from={[BAG[0] + 0.3, 2.3, BAG[2] - 0.2]} len={2.2} r={0.24} o={0.05 * bagSpot} />
      {kickers > 0.01 && <Confetti T={T} box={[2.2, 1.2, 1.0]} center={[0, 0.75, 0.3]} n={26} seed={13} fall={0.025} />}
      <ambientLight intensity={0.03 * clamp(key + 0.2)} />
    </group>
  );
};

export const S14: SceneDef = {
  id: 'S14_questions', t0: 113.806, t1: 121.904, x: 182, enter: 'cut', Set,
  env: 0.28,
  keys: [
    { t: 113.806, pos: [-0.2, 0.99, 1.2], look: [-0.2, 0.97, 0], fov: 34, ap: 0.004, bloom: 0.8 },
    { t: 115.831, pos: [-0.12, 0.87, 1.45], look: [-0.14, 0.85, 0.02], fov: 34, ap: 0.003, bloom: 0.75 },
    { t: 117.856, pos: [0.04, 0.75, 1.66], look: [0.02, 0.73, 0.05], fov: 34, ap: 0.003, bloom: 0.75 },
    { t: 119.85, pos: [0.1, 0.74, 1.76], look: [0.06, 0.72, 0.05], fov: 34, ap: 0.003, bloom: 0.75 },
    { t: 120.75, pos: [1.15, 0.7, 1.15], look: [0.75, 0.58, 0.33], fov: 32, ap: 0.008, bloom: 0.75 },
    { t: 121.9, pos: [1.03, 0.64, 0.8], look: [0.728, 0.577, 0.346], fov: 30, ap: 0.012, bloom: 0.8 },
  ],
  lines: [],
  hits: [[115.831, 0.6], [117.856, 0.6]],
};
