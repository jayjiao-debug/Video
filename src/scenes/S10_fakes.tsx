/* S10 · fakes (81.404 – 89.508) — THE DROP. Out of S09's black a UV blacklight stutters on: the one violet world.
   On the hit, sharp: a black-lacquer marquee board with a solid-gold $4670亿 hangs above two identical crimson
   bags; under UV only the fake's stitches glow cyan. The camera blows back (fast → resolving on the 83.43 bar)
   while row after row of identical fakes unfolds behind on pop-up hinges. Line 2: a fast swoop down behind the
   plinth resolving on the 86.215 kick, where every fake's big ◆ logo flares gold; then a truck right into the
   whip-pan. Lighter than v1: 8 rows, merged geometry, no mirror floor, no shadows on the crowd. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { prog, easeOut, impulse, backOut, clamp, swing } from '../scene';
import { HeroBag, Cut, rect, BAG, STITCH, mat } from '../foil';
import { Backdrop, PaperCard, Beam } from '../kit';
import { Spot, merged, Caption, diamond, rframe, FoilText, GlossFloor, Glow } from './S10_kit';

const DROP = 81.404;
/** the blacklight: a fluorescent stutter after the hit frame, then steady */
const uv = (T: number) => {
  if (T < DROP) return 0;
  const d = T - DROP;
  if (d < 0.1) return 1; if (d < 0.14) return 0.35; if (d < 0.2) return 1; if (d < 0.23) return 0.5;
  return 1;
};

/* the wall of fakes: rows stepping up and back like bleachers */
const ROWS = 8, SPACING = 0.46;
const rowZ = (r: number) => -0.9 - 0.52 * r, rowY = (r: number) => 0.12 * r;
const rowX = (r: number) => { const xs: number[] = []; const off = r % 2 ? SPACING / 2 : 0; for (let x = -3.9 + off; x <= 3.9; x += SPACING) xs.push(+x.toFixed(3)); return xs; };
const rowUp = (r: number) => 81.6 + r * 0.24; // the cascade runs on its own clock and completes by the 83.43 bar
const logoOn = (r: number) => 85.3 + r * 0.11;

const stairPath = (() => {
  const P: [number, number][] = [[rowZ(0) + 0.3, 0]];
  for (let r = 1; r < ROWS; r++) { P.push([rowZ(r) + 0.26, rowY(r - 1)]); P.push([rowZ(r) + 0.26, rowY(r)]); }
  P.push([rowZ(ROWS - 1) - 0.4, rowY(ROWS - 1)]); P.push([rowZ(ROWS - 1) - 0.4, 0]);
  return 'M ' + P.map(([z, y]) => `${(-z * 1000).toFixed(1)} ${(-y * 1000).toFixed(1)}`).join(' L ') + ' Z';
})();

const BODY = `${BAG.handle} ${BAG.body}`;
const LOGO = diamond(0, -150, 92);
const STITCHES = `${STITCH.flap} ${STITCH.body}`;
const lacq = () => mat('lacquer', '#7a0c26');

const Row: React.FC<{ r: number; T: number }> = ({ r, T }) => {
  const xs = useMemo(() => rowX(r), [r]);
  const at = (z: number): [number, number, number, number][] => xs.map((x) => [x, 0, z, 1]);
  const gBody = merged(`gb${r}`, BODY, at(0), 0.004, 4);
  const gFlap = merged(`gf${r}`, BAG.flap, at(0.012), 0.004, 4);
  const gStitch = merged(`gs${r}`, STITCHES, at(0.0205), 0.001, 2);
  const gLogo = merged(`gl${r}`, LOGO, at(0.022), 0.003, 2);
  const fade = 1 - r * 0.08;
  const stitchM = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#29e6ff'), toneMapped: false }), []);
  const logoM = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc65a'), toneMapped: false }), []);
  const p = prog(T, rowUp(r), rowUp(r) + 0.34), up = p >= 1 ? 1 : backOut(p);
  const lo = easeOut(prog(T, logoOn(r), logoOn(r) + 0.12));
  stitchM.color.set('#29e6ff').multiplyScalar(fade * (1.2 + 0.4 * impulse(T, rowUp(r) + 0.3, 0.25)) * (0.25 + 0.75 * uv(T)));
  logoM.color.set('#ffc65a').multiplyScalar(fade * lo * (0.7 + 0.8 * impulse(T, 86.215, 0.25) + 0.6 * impulse(T, logoOn(r), 0.15)));
  if (p <= 0) return null;
  return (
    <group position={[0, rowY(r), rowZ(r)]} rotation={[-(1 - up) * Math.PI / 2, 0, 0]}>
      <mesh geometry={gBody} material={lacq()} />
      <mesh geometry={gFlap} material={lacq()} />
      <mesh geometry={gStitch} material={stitchM} />
      <mesh geometry={gLogo} material={lo > 0.02 ? logoM : mat('gold', '#8a6a3a')} />
    </group>
  );
};

/** a paper tag on a thread from the bag's left handle ring */
const HangTag: React.FC<{ x: number; y: number; z: number; T: number; text: string; color?: string }> = ({ x, y, z, T, text, color }) => (
  <group position={[x - 0.078, y + 0.222, z]} rotation={[0, 0, ((-30 + swing(T, DROP, 8)) * Math.PI) / 180]}>
    <Cut d={rect(-0.8, 0, 1.6, 70)} kind="paper" depth={0.001} bevel={0} shadow={false} />
    <PaperCard w={0.15} h={0.07} paper="#d6c9b0" lines={[[text, 0.6, '900', color]]} position={[0, -0.105, 0]} rotation={[0, 0, 0.52]} />
  </group>
);

const PL = 0.4; // hero plinth top

const Set: React.FC<{ T: number }> = ({ T }) => {
  const u = uv(T), hit = impulse(T, DROP, 0.3);
  const num = 1 + 0.04 * (1 - easeOut(prog(T, DROP, DROP + 0.07)));
  return (
    <group>
      <Backdrop z={-6.0} burst="none" />
      <GlossFloor size={16} color="#060409" position={[0, 0, -2.5]} />
      {/* the bleachers the fakes stand on, edges lit in UV */}
      <Cut d={stairPath} kind="black" color="#040307" depth={8.2} bevel={0} shadow={false} rotation={[0, Math.PI / 2, 0]} position={[-4.1, 0, 0]} />
      {Array.from({ length: ROWS - 1 }, (_, i) => i + 1).map((r) => (
        <mesh key={r} position={[0, rowY(r) + 0.002, rowZ(r) + 0.26]}><boxGeometry args={[8.2, 0.005, 0.006]} />
          <meshBasicMaterial color={new THREE.Color('#8a5cff').multiplyScalar((0.1 + 0.4 * u) * (1 - r * 0.07) * clamp((T - rowUp(r)) / 0.3))} toneMapped={false} /></mesh>
      ))}
      {Array.from({ length: ROWS }, (_, r) => <Row key={r} r={r} T={T} />)}

      {/* the two bags under the blacklight */}
      <group position={[0, 0, 0.2]}>
        <Cut d={rect(-430, -PL * 1000, 860, PL * 1000)} kind="black" depth={0.34} />
        <Cut d={rect(-436, -PL * 1000 - 4, 872, 8)} kind="gold" depth={0.006} position={[0, 0, 0.342]} shadow={false} />
        <HeroBag position={[-0.21, PL, 0.12]} swing={0} light={0.3} />
        <HeroBag position={[0.21, PL, 0.12]} light={0.3} glowStitch={1.5 + 0.6 * hit} stitchColor="#29e6ff" swing={0} />
        <HangTag x={-0.21} y={PL} z={0.148} T={T} text="正品" />
        <HangTag x={0.21} y={PL} z={0.148} T={T} text="仿品" color="#16687a" />
      </group>

      {/* the marquee: black lacquer board, gold frame, solid-gold number; it hides the rows behind it */}
      <group position={[0, 1.15, 0]} scale={num}>
        {[-0.62, 0.62].map((x) => <Cut key={x} d={rect(-3, -1400, 6, 1400)} kind="gold" depth={0.004} bevel={0} position={[x, 0.22, -0.01]} shadow={false} />)}
        <Cut d={rect(-760, -220, 1520, 440)} kind="black" color="#07060a" depth={0.03} position={[0, 0, -0.03]} />
        <Cut d={rframe(0, 0, 1520, 440, 10, 12)} kind="gold" depth={0.006} position={[0, 0, 0.002]} />
        <FoilText text="全球假货贸易 · 2021" glyph={0.042} fill="#e6dccb" weight="700" gain={0.85} shadow={0} position={[0, 0.135, 0.012]} />
        <FoilText text="$4670亿" glyph={0.2} position={[0, -0.04, 0.012]} sheen={prog(T, DROP + 0.25, DROP + 0.85)} />
      </group>

      {/* the blacklight tube and its light */}
      <group position={[0, 1.85, 0.9]}>
        <Cut d={rect(-760, -26, 1520, 22)} kind="black" depth={0.03} position={[0, 0, -0.02]} />
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.03, 0]}><cylinderGeometry args={[0.011, 0.011, 1.4, 12]} /><meshBasicMaterial color={new THREE.Color('#b78aff').multiplyScalar(0.1 + 1.3 * u)} toneMapped={false} /></mesh>
      </group>
      <Beam from={[0, 1.82, 0.9]} len={1.4} r={0.6} o={0.03 * u} color="#a070ff" />
      <Spot p={[0, 2.6, 1.9]} at={[0, PL + 0.2, 0.3]} i={(22 + 22 * hit) * u} color="#b49aff" angle={0.32} pen={0.6} shadow />
      <Spot p={[0, 2.4, 2.4]} at={[0, 1.15, 0]} i={(8 + 6 * hit) * u} color="#fff0d8" angle={0.16} pen={0.5} />
      <Spot p={[0, 3.6, 0.2]} at={[0, 0.5, -3.0]} i={70 * u} color="#6a46e8" angle={0.9} pen={0.8} />
      <Spot p={[-2.6, 1.2, 1.6]} at={[0, 0.6, 0]} i={8 * u} color="#ff3ec8" angle={0.45} pen={0.9} />
      <Spot p={[2.6, 1.2, 1.6]} at={[0, 0.6, 0]} i={9 * u} color="#29e6ff" angle={0.45} pen={0.9} />
      <ambientLight intensity={0.02 * u} color="#8f6bff" />
    </group>
  );
};

const Overlay: React.FC<{ T: number }> = ({ T }) => (
  <>
    <Caption T={T} t0={81.6} t1={85.0} text="OECD–EUIPO 2025（2021年数据）" />
    <Caption T={T} t0={85.2} t1={89.4} text="Han, Nunes & Drèze 2010" />
  </>
);

export const S10: SceneDef = {
  id: 'S10_fakes', t0: 81.404, t1: 89.508, x: 126, enter: 'cut', Set, Overlay,
  bg: '#05030c', env: 0.45,
  keys: [
    { t: 81.404, pos: [0, 0.8, 1.72], look: [0, 0.82, 0.1], fov: 40, ap: 0.0015, bloom: 0.6 },
    { t: 81.95, pos: [0.12, 0.86, 2.3], look: [0, 0.78, -0.2], fov: 41, ap: 0.002, bloom: 0.7 },
    { t: 83.43, pos: [0.26, 1.0, 2.95], look: [0, 0.82, -0.6], fov: 42, ap: 0.002, bloom: 0.7 },
    { t: 85.0, pos: [-0.12, 1.05, 3.12], look: [0, 0.84, -0.7], fov: 42, ap: 0.002, bloom: 0.7 },
    { t: 86.215, pos: [-1.85, 0.7, -0.05], look: [-1.1, 0.4, -1.9], fov: 36, ap: 0.003, bloom: 0.75 },
    { t: 87.8, pos: [-0.5, 0.68, -0.1], look: [0.3, 0.38, -1.9], fov: 36, ap: 0.003, bloom: 0.75 },
    { t: 89.208, pos: [0.95, 0.66, -0.1], look: [1.75, 0.4, -1.9], fov: 36, ap: 0.003, bloom: 0.75 },
  ],
  lines: [
    { t: 81.45, end: 85.0, text: '全球假货贸易：约4670亿美元。' },
    { t: 85.1, end: 89.4, text: '研究发现：被仿得最多的，是大logo款。' },
  ],
  hits: [[86.215, 0.35]],
};
