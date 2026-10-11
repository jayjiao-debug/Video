/* S10 · fakes (81.404 – 89.508) — THE DROP. Out of S09's black, a UV blacklight stutters on: a violet world.
   Two identical crimson bags on a plinth; under UV only the fake's stitches glow cyan. A giant holo $4670亿 lands
   on the hit; the camera blows back while row after row of identical fakes unfolds behind (pop-up hinges), a
   bleacher of cyan stitches receding into the dark. Line 2: the camera drops behind the plinth and trucks along
   the rows; the fakes' big ◆ logos light up front-to-back, flaring on the 86.215 kick. Exits right (whip). */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { prog, easeOut, impulse, backOut, clamp, swing } from '../scene';
import { HeroBag, Cut, rect, BAG, STITCH, mat } from '../foil';
import { Backdrop, MirrorFloor, PaperCard, Word, Beam } from '../kit';
import { Spot, merged, Caption, diamond, spark, dashCubic } from './S10_kit';

const DROP = 81.404;
/** the blacklight: a fluorescent stutter, then steady */
const uv = (T: number) => {
  if (T < DROP) return 0;
  const d = T - DROP;
  if (d < 0.07) return 1; if (d < 0.1) return 0.15; if (d < 0.17) return 0.9; if (d < 0.2) return 0.3;
  return 1;
};

/* the wall of fakes: rows stepping up and back like bleachers */
const ROWS = 10, SPACING = 0.4;
const rowZ = (r: number) => -0.75 - 0.5 * r, rowY = (r: number) => 0.12 * r;
const rowX = (r: number) => { const xs: number[] = []; const off = r % 2 ? SPACING / 2 : 0; for (let x = -4.4 + off; x <= 4.4; x += SPACING) xs.push(+x.toFixed(3)); return xs; };
const rowUp = (r: number) => 81.52 + r * 0.2; // each row unfolds on its own clock, the cascade ends near the 83.936 accent
const logoOn = (r: number) => 85.25 + r * 0.085;

const stairPath = (() => {
  const P: [number, number][] = [[rowZ(0) + 0.3, 0]];
  for (let r = 1; r < ROWS; r++) { P.push([rowZ(r) + 0.25, rowY(r - 1)]); P.push([rowZ(r) + 0.25, rowY(r)]); }
  P.push([rowZ(ROWS - 1) - 0.4, rowY(ROWS - 1)]); P.push([rowZ(ROWS - 1) - 0.4, 0]);
  return 'M ' + P.map(([z, y]) => `${(-z * 1000).toFixed(1)} ${(-y * 1000).toFixed(1)}`).join(' L ') + ' Z';
})();

const BODY = `${BAG.handle} ${BAG.body}`;
const LOGO = diamond(0, -150, 92);
const STITCHES = `${STITCH.flap} ${STITCH.body}`;
const HANDLE_ST = dashCubic([-78, -222], [-78, -340], [78, -340], [78, -222], 8, 6, 2.6);
const lacq = () => mat('lacquer', '#7a0c26');

const Row: React.FC<{ r: number; T: number }> = ({ r, T }) => {
  const xs = useMemo(() => rowX(r), [r]);
  const at = (z: number): [number, number, number, number][] => xs.map((x) => [x, 0, z, 1]);
  const gBody = merged(`fb${r}`, BODY, at(0), 0.004, 5);
  const gFlap = merged(`ff${r}`, BAG.flap, at(0.012), 0.004, 5);
  const gStitch = merged(`fs${r}`, STITCHES, at(0.0205), 0.001, 2);
  const gHandle = merged(`fh${r}`, HANDLE_ST, at(-0.004), 0.001, 2);
  const gLogo = merged(`fl${r}`, LOGO, at(0.022), 0.003, 2);
  const fade = 1 - r * 0.07;
  const stitchM = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#29e6ff'), toneMapped: false }), []);
  const logoM = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc65a'), toneMapped: false }), []);
  const p = prog(T, rowUp(r), rowUp(r) + 0.34), up = p >= 1 ? 1 : backOut(p);
  const lo = easeOut(prog(T, logoOn(r), logoOn(r) + 0.12));
  stitchM.color.set('#29e6ff').multiplyScalar(fade * (1.35 + 0.5 * impulse(T, rowUp(r) + 0.3, 0.25)) * (0.25 + 0.75 * uv(T)));
  logoM.color.set('#ffc65a').multiplyScalar(fade * lo * (0.75 + 0.9 * impulse(T, 86.215, 0.22) + 0.8 * impulse(T, logoOn(r), 0.15)));
  if (p <= 0) return null;
  return (
    <group position={[0, rowY(r), rowZ(r)]} rotation={[-(1 - up) * Math.PI / 2, 0, 0]}>
      <mesh geometry={gBody} material={lacq()} castShadow={r < 3} receiveShadow />
      <mesh geometry={gFlap} material={lacq()} castShadow={r < 3} receiveShadow />
      <mesh geometry={gStitch} material={stitchM} />
      <mesh geometry={gHandle} material={stitchM} />
      <mesh geometry={gLogo} material={lo > 0.02 ? logoM : mat('gold', '#8a6a3a')} />
    </group>
  );
};

const Set: React.FC<{ T: number }> = ({ T }) => {
  const u = uv(T), hit = impulse(T, DROP, 0.3);
  const num = 1 + 0.32 * (1 - easeOut(prog(T, DROP, DROP + 0.16)));
  const tube = (y: number, z: number, w: number) => (
    <group position={[0, y, z]}>
      <Cut d={rect(-w * 500 - 30, -26, w * 1000 + 60, 22)} kind="black" depth={0.03} position={[0, 0, -0.02]} />
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.03, 0]}><cylinderGeometry args={[0.011, 0.011, w, 12]} /><meshBasicMaterial color={new THREE.Color('#b78aff').multiplyScalar(0.1 + 1.3 * u)} toneMapped={false} /></mesh>
    </group>
  );
  return (
    <group>
      <Backdrop z={-6.4} burst="none" />
      <MirrorFloor size={18} tint="#2a2240" position={[0, 0, -3]} />
      {/* the bleachers the fakes stand on, edges lit in UV */}
      <Cut d={stairPath} kind="black" color="#0b0816" depth={9.4} bevel={0} rotation={[0, Math.PI / 2, 0]} position={[-4.7, 0, 0]} />
      {Array.from({ length: ROWS - 1 }, (_, i) => i + 1).map((r) => (
        <mesh key={r} position={[0, rowY(r) + 0.002, rowZ(r) + 0.25]}><boxGeometry args={[9.4, 0.005, 0.006]} />
          <meshBasicMaterial color={new THREE.Color('#9a5cff').multiplyScalar((0.15 + 0.55 * u) * (1 - r * 0.06) * clamp((T - rowUp(r)) / 0.3))} toneMapped={false} /></mesh>
      ))}
      {Array.from({ length: ROWS }, (_, r) => <Row key={r} r={r} T={T} />)}

      {/* the two bags under the blacklight */}
      <group position={[0, 0, 0.2]}>
        <Cut d={rect(-430, -260, 860, 260)} kind="black" depth={0.34} />
        <Cut d={rect(-436, -264, 872, 9)} kind="gold" depth={0.006} position={[0, 0, 0.342]} />
        <HeroBag position={[-0.21, 0.26, 0.12]} swing={0} />
        <HeroBag position={[0.21, 0.26, 0.12]} glowStitch={1.6 + 0.8 * hit} stitchColor="#29e6ff" swing={0} />
        {[[-0.21, '正品', undefined], [0.21, '仿品', '#1a6d80']].map(([x, t, c]) => (
          <group key={t as string} position={[(x as number) - 0.078, 0.26 + 0.222, 0.148]} rotation={[0, 0, ((-30 + swing(T, DROP, 10)) * Math.PI) / 180]}>
            <Cut d={rect(-0.8, 0, 1.6, 70)} kind="paper" depth={0.001} bevel={0} shadow={false} />
            <PaperCard w={0.1} h={0.046} lines={[[t as string, 0.56, '900', c as string | undefined]]} position={[0, -0.093, 0]} rotation={[0, 0, 0.52]} />
          </group>
        ))}
      </group>

      {/* the number: lands on the drop and holds */}
      <group position={[0, 0.95, 0.05]} scale={num}>
        <Word text="$4670亿" size={0.36} kind="holo" />
        <Cut d={rect(-340, -2, 680, 4)} kind="gold" depth={0.002} bevel={0} position={[0, -0.165, 0]} shadow={false} />
      </group>
      {[[-0.52, 1.14], [0.55, 0.84]].map(([x, y], i) => (
        <Cut key={i} d={spark(0, 0, 18)} kind="glow" color="#e9dcff" glow={1.5} depth={0.001} bevel={0} shadow={false}
          position={[x, y, 0.08]} scale={u * (0.6 + 0.6 * Math.abs(Math.sin(T * (2.1 + i)))) * (1 + 1.5 * hit)} />
      ))}

      {/* the blacklight tube and its light */}
      {tube(1.75, 0.9, 1.4)}
      <Beam from={[0, 1.72, 0.9]} len={1.75} r={0.75} o={0.045 * u} color="#a070ff" />
      <Spot p={[0, 2.6, 1.9]} at={[0, 0.4, 0.2]} i={(26 + 26 * hit) * u} color="#a27bff" angle={0.5} pen={0.6} shadow />
      <Spot p={[0, 3.6, 0.5]} at={[0, 0.5, -3.2]} i={130 * u} color="#7448ff" angle={0.95} pen={0.8} />
      <Spot p={[-2.6, 1.0, 1.6]} at={[0, 0.45, 0]} i={10 * u} color="#ff3ec8" angle={0.5} pen={0.9} />
      <Spot p={[2.6, 1.0, 1.6]} at={[0, 0.45, 0]} i={12 * u} color="#29e6ff" angle={0.5} pen={0.9} />
      <ambientLight intensity={0.05 * u} color="#8f6bff" />
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
  bg: '#06021a', env: 0.45,
  keys: [
    { t: 81.404, pos: [0, 0.66, 1.72], look: [0, 0.67, 0], fov: 38, ap: 0.005, bloom: 1.0, focus: 1.5 },
    { t: 83.0, pos: [0.28, 0.78, 2.15], look: [0, 0.66, -0.3], fov: 40, ap: 0.005, bloom: 0.95, focus: 1.95 },
    { t: 84.8, pos: [-0.22, 0.86, 2.45], look: [0, 0.68, -0.5], fov: 40, ap: 0.005, bloom: 0.95, focus: 2.3 },
    { t: 86.3, pos: [-2.0, 0.5, -0.05], look: [-1.25, 0.42, -1.8], fov: 34, ap: 0.005, bloom: 0.9, focus: 1.3 },
    { t: 89.208, pos: [1.7, 0.54, -0.12], look: [2.5, 0.46, -1.9], fov: 34, ap: 0.005, bloom: 0.9, focus: 1.3 },
  ],
  lines: [
    { t: 81.45, end: 85.0, text: '全球假货贸易：约4670亿美元。', gold: true },
    { t: 85.1, end: 89.4, text: '研究发现：被仿得最多的，是大logo款。' },
  ],
  hits: [[86.215, 0.35]],
};
