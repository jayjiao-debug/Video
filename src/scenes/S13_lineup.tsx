/* S13 · lineup (105.707 – 113.806), whip in. A grand three-tier stage under a gold arch: the bag on top, and the
   rest of the luxury family pops up like a pop-up book (hinged from flat): watch + solitaire on 106.718, perfume +
   lipstick + pump on the 107.731 bar. Crane up and over. Line 2 (109.85): the house lights fall away, one narrow
   spot isolates the bag; the camera ends high on it for the hard cut into the question cards. */
import React from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { prog, easeOut, impulse, backOut, swing, clamp } from '../scene';
import { HeroBag, Cut, rect, ring, circle, archFrame } from '../foil';
import { Backdrop, MirrorFloor, Beam, Confetti } from '../kit';
import { Spot, rrect, rframe, spark } from './S10_kit';

const P1 = 106.718, P2 = 107.731, DIM = 109.757, DIM2 = 111.781;

/** an icon that unfolds from flat on its hinge (pop-up book) */
const PopUp: React.FC<{ T: number; at: number; p: [number, number, number]; s?: number; children: React.ReactNode }> = ({ T, at, p, s = 1, children }) => {
  const k = prog(T, at, at + 0.34); if (k <= 0) return null;
  const up = k >= 1 ? 1 : backOut(k);
  return <group position={p} rotation={[-(1 - up) * Math.PI / 2, 0, 0]} scale={s}>{children}</group>;
};

const Watch: React.FC<{ T: number }> = ({ T }) => {
  const bal = 1.3 * Math.sin(T * Math.PI * 2 * 2.5);
  const hand = (len: number, w: number, a: number) => { const c = Math.cos(a), s = Math.sin(a), p = (x: number, y: number) => `${(x * c - y * s).toFixed(1)} ${(-200 + x * s + y * c).toFixed(1)}`;
    return `M ${p(-w, 6)} L ${p(w, 6)} L ${p(w * 0.4, -len)} L ${p(-w * 0.4, -len)} Z`; };
  const idx = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, x = Math.sin(a) * 42, y = -200 - Math.cos(a) * 42, l = i % 3 ? 3 : 6;
    return `M ${(x - Math.sin(a) * l - Math.cos(a) * 1.6).toFixed(1)} ${(y + Math.cos(a) * l - Math.sin(a) * 1.6).toFixed(1)} L ${(x - Math.sin(a) * l + Math.cos(a) * 1.6).toFixed(1)} ${(y + Math.cos(a) * l + Math.sin(a) * 1.6).toFixed(1)} L ${(x + Math.cos(a) * 1.6).toFixed(1)} ${(y + Math.sin(a) * 1.6).toFixed(1)} L ${(x - Math.cos(a) * 1.6).toFixed(1)} ${(y - Math.sin(a) * 1.6).toFixed(1)} Z`; }).join(' ');
  return (
    <group>
      <Cut d={rrect(0, -30, 140, 60, 26)} kind="black" depth={0.05} position={[0, 0, -0.025]} />
      <Cut d={rect(-25, -152, 50, 100)} kind="lacquer" color="#16101a" position={[0, 0, -0.012]} />
      <Cut d={rect(-25, -305, 50, 62)} kind="lacquer" color="#16101a" position={[0, 0, -0.012]} />
      <Cut d={circle(0, -200, 52)} kind="lacquer" color="#0b0a10" position={[0, 0, -0.004]} />
      <Cut d={ring(0, -200, 51, 63)} kind="gold" depth={0.01} />
      <Cut d={rect(-32, -272, 64, 12)} kind="gold" />
      <Cut d={rect(-32, -140, 64, 12)} kind="gold" />
      <Cut d={rrect(68, -200, 12, 18, 3)} kind="gold" />
      <Cut d={idx} kind="gold" depth={0.001} bevel={0} position={[0, 0, 0.004]} shadow={false} />
      <Cut d={hand(34, 3, 1.95)} kind="gold" depth={0.001} bevel={0} position={[0, 0, 0.007]} shadow={false} />
      <Cut d={hand(24, 3.5, -0.62)} kind="gold" depth={0.001} bevel={0} position={[0, 0, 0.008]} shadow={false} />
      {/* the open heart: a holo balance wheel swinging on its own clock */}
      <group position={[0, 0.176, 0.005]} rotation={[0, 0, bal]}>
        <Cut d={ring(0, 0, 11, 14)} kind="holo" depth={0.001} bevel={0} shadow={false} />
        <Cut d={rect(-12, -1, 24, 2)} kind="gold" depth={0.001} bevel={0} shadow={false} />
        <Cut d={rect(-1, -12, 2, 24)} kind="gold" depth={0.001} bevel={0} shadow={false} />
      </group>
    </group>
  );
};

const RingBox: React.FC<{ T: number }> = ({ T }) => (
  <group>
    <group position={[0, 0.072, -0.03]} rotation={[-0.32, 0, 0]}>
      <Cut d={rrect(0, -44, 134, 88, 10)} kind="black" depth={0.03} />
      <Cut d={rframe(0, -44, 120, 74, 6, 4)} kind="gold" depth={0.002} bevel={0} position={[0, 0, 0.031]} shadow={false} />
    </group>
    <Cut d={rrect(0, -36, 134, 72, 10)} kind="black" depth={0.05} />
    <Cut d={rect(-67, -74, 134, 4)} kind="gold" depth={0.05} position={[0, 0, 0]} />
    <Cut d={rrect(0, -66, 92, 14, 6)} kind="black" color="#050409" depth={0.01} position={[0, 0, 0.05]} />
    <Cut d={ring(0, -96, 23, 30)} kind="gold" position={[0, 0, 0.03]} />
    <Cut d="M -22 -128 L -13 -140 L 13 -140 L 22 -128 L 0 -110 Z" kind="holo" position={[0, 0, 0.034]} />
    <Cut d="M -13 -140 L 13 -140 L 0 -128 Z" kind="chrome" depth={0.001} bevel={0} position={[0, 0, 0.0425]} shadow={false} />
    <Cut d={spark(0, 0, 14)} kind="glow" color="#ffffff" glow={1.5} depth={0.001} bevel={0} shadow={false}
      position={[0.012, 0.142, 0.05]} scale={0.6 + 0.6 * Math.pow(Math.abs(Math.sin(T * 1.7)), 6)} />
  </group>
);

const Perfume: React.FC = () => {
  const oct = (i: number, rev = false) => { const P: [number, number][] = [[-60 + i, -i], [60 - i, -i], [72 - i, -20], [72 - i, -112], [58 - i, -128 + i], [-58 + i, -128 + i], [-72 + i, -112], [-72 + i, -20]];
    const Q = rev ? P.slice().reverse() : P; return 'M ' + Q.map(([x, y]) => `${x} ${y}`).join(' L ') + ' Z'; };
  return (
    <group>
      <Cut d="M -51 -9 L 51 -9 L 63 -20 L 63 -86 L -63 -86 L -63 -20 Z" kind="lacquer" color="#b4641c" position={[0, 0, -0.004]} />
      <Cut d={`${oct(0)} ${oct(8, true)}`} kind="chrome" depth={0.012} />
      <Cut d={rect(-30, -78, 60, 26)} kind="gold" depth={0.002} bevel={0} position={[0, 0, 0.013]} shadow={false} />
      <Cut d={rect(-17, -143, 34, 16)} kind="gold" />
      <Cut d="M -30 -143 L 30 -143 L 38 -196 L -38 -196 Z" kind="gold" depth={0.02} position={[0, 0, -0.004]} />
      <Cut d="M -12 -150 L 12 -150 L 15 -190 L -15 -190 Z" kind="holo" depth={0.001} bevel={0} position={[0, 0, 0.0175]} shadow={false} />
    </group>
  );
};

const Lipstick: React.FC = () => (
  <group>
    <Cut d={rrect(0, -46, 46, 92, 4)} kind="gold" depth={0.04} position={[0, 0, -0.02]} />
    <Cut d={rect(-24, -98, 48, 6)} kind="black" depth={0.04} position={[0, 0, -0.02]} />
    <Cut d={rect(-18, -134, 36, 36)} kind="rosegold" depth={0.03} position={[0, 0, -0.015]} />
    <Cut d="M -15 -134 L 15 -134 L 15 -156 L -15 -178 Z" kind="lacquer" color="#a00f2c" depth={0.024} position={[0, 0, -0.012]} />
  </group>
);

const Pump: React.FC = () => (
  <group>
    <Cut d="M -114 -78 L -97 -73 L -94 0 L -101 0 Z" kind="gold" position={[0, 0, -0.01]} />
    <Cut d="M -120 -112 Q -130 -88 -112 -76 L -100 -70 Q -40 -42 20 -16 Q 60 -1 110 0 Q 128 0 126 -12 Q 120 -34 72 -44 Q 22 -52 -10 -70 Q -60 -108 -100 -114 Z" kind="lacquer" color="#5c0a1f" depth={0.03} position={[0, 0, -0.015]} />
    <Cut d="M -100 -114 Q -60 -108 -10 -70 Q 22 -52 72 -44 L 72 -40 Q 22 -48 -10 -66 Q -60 -104 -100 -110 Z" kind="gold" depth={0.001} bevel={0} position={[0, 0, 0.0165]} shadow={false} />
  </group>
);

const Set: React.FC<{ T: number }> = ({ T }) => {
  const k1 = impulse(T, P1, 0.25), k2 = impulse(T, P2, 0.25);
  const house = 1 - 0.75 * easeOut(prog(T, DIM, DIM + 1.2)) - 0.2 * easeOut(prog(T, DIM2, DIM2 + 1.0));
  const solo = easeOut(prog(T, DIM, DIM + 0.6));
  return (
    <group>
      <Backdrop burst="holo" burstY={1.0} glow={0.25 + 0.1 * house} />
      <MirrorFloor />
      <Cut d={archFrame(1300, 1420, 34)} kind="gold" position={[0, 0, -1.02]} />
      <Cut d={archFrame(1400, 1480, 6)} kind="gold" position={[0, 0, -1.1]} shadow={false} />
      {/* the stepped stage */}
      <Cut d={rect(-850, -90, 1700, 90)} kind="black" depth={0.5} position={[0, 0, -0.2]} />
      <Cut d={rect(-650, -190, 1300, 190)} kind="black" depth={0.35} position={[0, 0, -0.55]} />
      <Cut d={rect(-450, -310, 900, 310)} kind="black" depth={0.35} position={[0, 0, -0.9]} />
      {[[850, 0.09, 0.302], [650, 0.19, -0.198], [450, 0.31, -0.548]].map(([w, y, z]) => (
        <group key={z}>
          <Cut d={rect(-w - 4, 0, w * 2 + 8, 8)} kind="gold" depth={0.004} position={[0, y, z]} shadow={false} />
          <mesh position={[0, y - 0.02, z - 0.001]}><boxGeometry args={[(w * 2) / 1000, 0.003, 0.002]} /><meshBasicMaterial color={new THREE.Color('#ffc874').multiplyScalar(0.25 + 0.3 * house)} toneMapped={false} /></mesh>
        </group>
      ))}

      <HeroBag position={[0, 0.31, -0.74]} scale={1.2} swing={swing(T, 105.95, 7) + 2 * Math.sin(T * 1.1)} />
      <PopUp T={T} at={P1 - 0.34} p={[-0.4, 0.19, -0.37]} s={1.3}><Watch T={T} /></PopUp>
      <PopUp T={T} at={P1 - 0.3} p={[0.4, 0.19, -0.37]} s={1.75}><RingBox T={T} /></PopUp>
      <PopUp T={T} at={P2 - 0.34} p={[-0.56, 0.09, 0.06]} s={1.5}><Perfume /></PopUp>
      <PopUp T={T} at={P2 - 0.3} p={[0.0, 0.09, 0.12]} s={1.4}><Lipstick /></PopUp>
      <PopUp T={T} at={P2 - 0.26} p={[0.55, 0.09, 0.06]} s={1.45}><Pump /></PopUp>

      <Spot p={[0.2, 3.1, 2.3]} at={[0, 0.2, -0.3]} i={(26 + 10 * (k1 + k2)) * house} angle={0.42} pen={0.6} shadow />
      <Spot p={[0, 2.8, 0.1]} at={[0, 0.45, -0.74]} i={34 * solo} angle={0.11} pen={0.5} shadow map={1024} />
      <Spot p={[-2.5, 1.1, 1.4]} at={[0, 0.22, -0.3]} i={8 * house} color="#ff3ec8" angle={0.42} pen={0.9} />
      <Spot p={[2.5, 1.1, 1.4]} at={[0, 0.22, -0.3]} i={7 * house} color="#29e6ff" angle={0.42} pen={0.9} />
      <Beam from={[0, 2.8, -0.7]} len={2.5} r={0.22} o={0.07 * solo} />
      <Beam from={[0.2, 3.0, 0.2]} len={3.0} r={0.9} o={0.04 * house + 0.03 * (k1 + k2)} />
      <Confetti T={T} box={[2.4, 1.4, 1.4]} center={[0, 0.7, 0]} n={34} seed={7} fall={0.03} />
      <ambientLight intensity={0.035 * clamp(house)} />
    </group>
  );
};

export const S13: SceneDef = {
  id: 'S13_lineup', t0: 105.707, t1: 113.806, x: 168, enter: 'whip', Set,
  keys: [
    { t: 106.007, pos: [-0.95, 0.38, 1.3], look: [-0.25, 0.32, -0.3], fov: 36, ap: 0.005, bloom: 0.75 },
    { t: 107.9, pos: [-0.22, 0.5, 1.62], look: [0, 0.34, -0.3], fov: 38, ap: 0.004, bloom: 0.7 },
    { t: 109.8, pos: [0.5, 0.74, 1.5], look: [0, 0.37, -0.35], fov: 38, ap: 0.004, bloom: 0.7 },
    { t: 111.8, pos: [0.42, 1.0, 1.0], look: [0, 0.46, -0.6], fov: 36, ap: 0.005, bloom: 0.75 },
    { t: 113.806, pos: [0.22, 0.82, 0.42], look: [-0.04, 0.54, -0.74], fov: 32, ap: 0.008, bloom: 0.8 },
  ],
  lines: [
    { t: 105.8, end: 109.7, text: '包、表、钻戒、香水，都是同一套设计。' },
    { t: 109.85, end: 113.7, text: '下次心动之前，问自己三个问题：' },
  ],
  hits: [[P1, 0.3], [P2, 0.4]],
};
