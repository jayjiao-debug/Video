/* S14 · questions (113.806 – 121.904), hard cut on the peak from S13's holo tag close-up. A dark vitrine with gold
   edges and three ceiling lamps. Three big foil-edged paper tags hang one below the other on a gold chain, gold
   backs to us; each one twists round on its string to show its question exactly on its hit (① on the cut,
   ② 115.831, ③ 117.856) and settles with a damped twist. The camera backs off on each hit (resolving on it).
   119.88: it glides to the bag's holo tag; the lamps go out one by one (120.387 / 120.891 / 121.399) and the
   tag glints last, into S15's spark. No subtitles: the tags are the text. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { prog, easeOut, impulse, swing, clamp } from '../scene';
import { HeroBag, Cut, rect, ring } from '../foil';
import { Backdrop, MirrorFloor } from '../kit';
import { Spot, rrect, rframe, spark, Glow } from './S10_kit';

const CX = -0.2, TW = 1.1, TH = 0.22;
const BAG: [number, number, number] = [0.74, 0.4, 0.05];
const TAGS: { t: number; n: string; text: string; y: number }[] = [
  { t: 113.806, n: '①', text: '这是给谁看的？', y: 1.13 },
  { t: 115.831, n: '②', text: '没有logo，我还想要吗？', y: 0.86 },
  { t: 117.856, n: '③', text: '一年后，它还让我开心吗？', y: 0.59 },
];
const OFF = { kick: 120.387, key: 120.891, bag: 121.399 };

/** the printed face of a tag: cream paper, a gold foil border, gold numeral, black serif question */
const faceTex = (n: string, text: string) => {
  const W = 2200, H = 440, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!;
  g.fillStyle = '#efe5cf'; g.fillRect(0, 0, W, H);
  let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(80,60,30,${rnd() * 0.05})`; g.fillRect(rnd() * W, rnd() * H, 2, 2); }
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#f6d58a'); gr.addColorStop(0.5, '#b8862e'); gr.addColorStop(1, '#e9bf62');
  g.strokeStyle = gr; g.lineWidth = 10; g.strokeRect(34, 34, W - 68, H - 68); g.lineWidth = 3; g.strokeRect(56, 56, W - 112, H - 112);
  const fam = '"Noto Serif CJK SC", serif';
  let px = 170; g.font = `900 ${px}px ${fam}`;
  const nw = () => g.measureText(n).width, tw = () => g.measureText(text).width, avail = W - 300;
  while (nw() + 40 + tw() > avail && px > 90) { px -= 4; g.font = `900 ${px}px ${fam}`; }
  const total = nw() + 40 + tw(); let x = (W - total) / 2; g.textBaseline = 'middle';
  g.fillStyle = '#a8741f'; g.fillText(n, x, H / 2 + px * 0.03); x += nw() + 40;
  g.fillStyle = '#1c1712'; g.fillText(text, x, H / 2 + px * 0.03);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

const Tag: React.FC<{ T: number; i: number; lit: number }> = ({ T, i, lit }) => {
  const c = TAGS[i];
  const tex = useMemo(() => faceTex(c.n, c.text), [c.n, c.text]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, emissive: new THREE.Color('#ffffff'), emissiveMap: tex, emissiveIntensity: 0 }), [tex]);
  mat.emissiveIntensity = 0.02 * lit;
  // the twist: gold back (π) → face (0) landing exactly on the hit, then a damped settle
  const turn = i === 0 ? 1 : easeOut(prog(T, c.t - 0.1, c.t));
  const d = T - c.t, settle = d > 0 ? 0.16 * Math.exp(-d * 3.2) * Math.sin(d * 13) : 0;
  const rotY = Math.PI * (1 - turn) + (i === 0 ? 0.6 : 1) * settle;
  const sway = d > 0 ? 0.025 * Math.exp(-d * 2.4) * Math.sin(d * 7.5) : 0;
  return (
    <group position={[CX, c.y, 0.02 + i * 0.012]} rotation={[0, rotY, sway]}>
      {/* eyelet and chain link up to the rail / the tag above */}
      <Cut d={ring(0, 18, 7, 12)} kind="gold" depth={0.004} position={[0, 0, 0.004]} />
      {Array.from({ length: 3 }, (_, k) => <Cut key={k} d={ring(0, 0, 3, 5.5)} kind="gold" depth={0.002} bevel={0} position={[0, 0.012 + k * 0.016, 0.004]} rotation={[0, k % 2 ? Math.PI / 2 : 0, 0]} shadow={false} />)}
      <group position={[0, -TH / 2, 0]}>
        <Cut d={rrect(0, 0, TW * 1000, TH * 1000, 26)} kind="gold" depth={0.004} position={[0, 0, -0.002]} />
        <mesh material={mat} position={[0, 0, 0.0045]} castShadow receiveShadow><planeGeometry args={[TW - 0.012, TH - 0.012]} /></mesh>
        <Cut d={ring(0, -86, 8, 13)} kind="gold" depth={0.002} bevel={0} position={[0, 0, 0.005]} shadow={false} />
      </group>
    </group>
  );
};

const Set: React.FC<{ T: number }> = ({ T }) => {
  const kick = impulse(T, 113.806, 0.3) + impulse(T, 115.831, 0.25) + impulse(T, 117.856, 0.25);
  const kickers = 1 - easeOut(prog(T, OFF.kick, OFF.kick + 0.08));
  const key = 1 - easeOut(prog(T, OFF.key, OFF.key + 0.08));
  const bagL = 1 - 0.8 * easeOut(prog(T, OFF.bag, OFF.bag + 0.08));
  const glint = impulse(T, 121.62, 0.2);
  const lamp = (x: number, on: number) => (
    <group position={[x, 1.455, 0.05]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.035, 24]} /><meshBasicMaterial color={new THREE.Color('#ffe6bf').multiplyScalar(0.08 + 1.8 * on)} toneMapped={false} side={THREE.DoubleSide} /></mesh>
    </group>
  );
  const X0 = -0.95, X1 = 1.35, Y0 = 0.18, Y1 = 1.47, Z0 = -0.45, Z1 = 0.45;
  const rod = (x: number, z: number, h = Y1 - Y0) => <Cut key={`${x}${z}`} d={rect(-5, -h * 1000, 10, h * 1000)} kind="gold" depth={0.01} bevel={0.001} position={[x, Y0, z - 0.005]} />;
  return (
    <group>
      <Backdrop z={-1.4} burst="none" />
      <MirrorFloor tint="#201a14" />
      <Glow w={2.6} h={1.5} color="#ff9a3a" o={0.16 * key} position={[CX, 0.85, -0.43]} />
      {/* the vitrine: base, oxblood velvet back, gold edges, a header with three lamps */}
      <Cut d={rect(X0 * 1000 - 30, -Y0 * 1000, (X1 - X0) * 1000 + 60, Y0 * 1000)} kind="black" depth={Z1 - Z0 + 0.06} position={[0, 0, Z0 - 0.03]} />
      <Cut d={rect(X0 * 1000 - 30, -Y0 * 1000 - 4, (X1 - X0) * 1000 + 60, 8)} kind="gold" depth={0.004} position={[0, 0, Z1 + 0.032]} shadow={false} />
      <Cut d={rect(X0 * 1000, -Y1 * 1000, (X1 - X0) * 1000, (Y1 - Y0) * 1000)} kind="black" color="#1a0c07" depth={0.01} position={[0, 0, Z0]} />
      {[X0, X1].map((x) => rod(x, Z1))}
      {[X0, X1].map((x) => rod(x, Z0 + 0.012))}
      <Cut d={rect(X0 * 1000 - 30, -110, (X1 - X0) * 1000 + 60, 110)} kind="black" depth={Z1 - Z0 + 0.06} position={[0, Y1, Z0 - 0.03]} />
      <Cut d={rect(X0 * 1000 - 30, -8, (X1 - X0) * 1000 + 60, 8)} kind="gold" depth={0.004} position={[0, Y1, Z1 + 0.032]} shadow={false} />
      {lamp(CX - 0.3, kickers)}{lamp(CX + 0.3, key)}{lamp(BAG[0], bagL > 0.5 ? 1 : 0.1)}
      {/* the rail the tag chain hangs from */}
      <Cut d={rect(-420, -8, 840, 8)} kind="gold" depth={0.012} position={[CX, 1.3, 0.0]} />
      <Cut d={rect(-1.2, -130, 2.4, 130)} kind="gold" depth={0.002} bevel={0} position={[CX, 1.17, 0.02]} shadow={false} />
      {TAGS.map((_, i) => <Tag key={i} T={T} i={i} lit={key} />)}

      {/* the bag on a velvet riser, right */}
      <Cut d={rect(-200, -220, 400, 220)} kind="black" color="#160a0c" depth={0.34} position={[BAG[0], Y0, BAG[2] - 0.2]} />
      <HeroBag position={BAG} rotation={[0, -0.18, 0]} light={0.25 + 0.45 * bagL} swing={swing(T, 113.85, 5) + swing(T, 119.95, 9) + 2.5 * Math.sin(T * 1.2)} />
      {glint > 0.02 && <Cut d={spark(0, 0, 26)} kind="glow" color="#ffffff" glow={1.6} depth={0.001} bevel={0} shadow={false}
        position={[BAG[0] + 0.112, BAG[1] + 0.165, BAG[2] + 0.06]} scale={0.3 + 1.1 * glint} rotation={[0, -0.18, glint]} />}

      <Spot p={[-0.4, 2.4, 2.4]} at={[CX, 0.86, 0]} i={(9 + 3 * kick) * key} angle={0.32} pen={0.6} shadow />
      <Spot p={[CX - 0.3, 1.44, 0.1]} at={[CX, 0.6, 0.05]} i={1.5 * kickers} angle={0.8} pen={0.8} />
      <Spot p={[BAG[0], 1.44, 0.1]} at={[BAG[0], 0.5, BAG[2]]} i={9 * bagL} angle={0.5} pen={0.7} shadow map={1024} />
      <Spot p={[1.7, 0.8, 1.4]} at={[BAG[0] + 0.11, BAG[1] + 0.15, BAG[2]]} i={2 + 4 * glint} color="#e8f6ff" angle={0.05} pen={0.5} />
      <Spot p={[-2.4, 1.1, 1.3]} at={[CX, 0.8, 0]} i={1.5 * kickers} color="#ff3ec8" angle={0.45} pen={0.9} />
      <Spot p={[2.4, 1.1, 1.3]} at={[CX, 0.8, 0]} i={1.5 * kickers} color="#29e6ff" angle={0.45} pen={0.9} />
      <ambientLight intensity={0.03 * clamp(key + 0.2)} />
    </group>
  );
};

export const S14: SceneDef = {
  id: 'S14_questions', t0: 113.806, t1: 121.904, x: 182, enter: 'cut', Set,
  env: 0.3,
  keys: [
    { t: 113.806, pos: [-0.2, 1.03, 1.12], look: [-0.2, 1.02, 0], fov: 36, ap: 0.0015, bloom: 0.5 },
    { t: 115.831, pos: [-0.13, 0.92, 1.46], look: [-0.15, 0.9, 0], fov: 36, ap: 0.0015, bloom: 0.5 },
    { t: 117.856, pos: [0.04, 0.83, 1.8], look: [0.02, 0.8, 0], fov: 34, ap: 0.0015, bloom: 0.5 },
    { t: 119.88, pos: [0.13, 0.82, 1.88], look: [0.06, 0.79, 0], fov: 34, ap: 0.0015, bloom: 0.5 },
    { t: 120.9, pos: [1.12, 0.62, 0.72], look: [0.83, 0.55, 0.1], fov: 30, ap: 0.006, bloom: 0.6 },
    { t: 121.9, pos: [1.02, 0.59, 0.5], look: [0.827, 0.546, 0.096], fov: 28, ap: 0.01, bloom: 0.7 },
  ],
  lines: [],
  hits: [[115.831, 0.5], [117.856, 0.5]],
};
