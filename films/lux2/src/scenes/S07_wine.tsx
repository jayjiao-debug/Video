/* S07 · wine (57.106 – 65.206), inside the break. A gentle cut onto one black bottle (our own ◆ label) between
   two identical crystal glasses on a velvet bar; the camera pulls back to show both price tags, $10 and $90.
   60.7: the $90 glass gets a holo halo and a warmer light. 63.18 (riser): two paper brains drop in on gold
   wires; the pleasure spot (front underside, mOFC) glows brighter over $90 and flickers on the three riser stabs,
   then the camera rushes into it for the cut on the 65.206 slam. */
import React from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { pop, prog, easeOut, impulse, clamp, lerp } from '../scene';
import { Cut, rect, ring, circle } from '../foil';
import { Backdrop, MirrorFloor, PaperCard, Curtains, Beam } from '../kit';
import { strokePath, quadPts, useGlow, useHolo, glassMat, Box, CutM, Caption } from './S06_lib';
import { Spot, DIAMOND } from './S06_waiting';

type P = [number, number];
/* the glass (px = mm, y down, origin at the foot) */
const GLASS = 'M -46 0 L 46 0 Q 44 -6 8 -9 L 3.5 -13 L 3.5 -92 Q 52 -98 52 -150 Q 52 -192 42 -224 L -42 -224 Q -52 -192 -52 -150 Q -52 -98 -3.5 -92 L -3.5 -13 L -8 -9 Q -44 -6 -46 0 Z';
const glassLine = (): P[] => {
  const right: P[] = [[46, 0], ...quadPts([46, 0], [44, -6], [8, -9], 6).slice(1), [3.5, -13], [3.5, -92], ...quadPts([3.5, -92], [52, -98], [52, -150], 12).slice(1), ...quadPts([52, -150], [52, -192], [42, -224], 10).slice(1)];
  const left = right.map(([x, y]) => [-x, y] as P).reverse();
  return [...left, ...right];
};
const RIM = strokePath(glassLine(), 2.4) + ' ' + strokePath([[-42, -224], [42, -224]], 2.4);
const WINE = 'M -3 -95 Q -49 -100 -49.6 -150 L -49.4 -160 L 49.4 -160 L 49.6 -150 Q 49 -100 3 -95 Z';
const SHINE = strokePath(quadPts([-40, -112], [-48, -150], [-38, -205], 10), 3.2);
/* the bottle */
const BOTTLE = 'M -42 0 L 42 0 L 42 -200 Q 42 -240 14 -262 L 13 -330 L 15 -332 L 15 -346 L -15 -346 L -15 -332 L -13 -330 L -14 -262 Q -42 -240 -42 -200 Z';
/* a brain in profile, facing right (+x): cerebrum, cerebellum, stem */
const brainPts = (s = 1): P[] => Array.from({ length: 96 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2, r = 1 + 0.03 * Math.sin(a * 11) + 0.02 * Math.sin(a * 5 + 1);
  let x = Math.cos(a) * 86 * r, y = Math.sin(a) * 62 * r; if (y > 0) y *= 0.72; if (y > 0 && x > 30) y *= 1.15;
  return [x * s, y * s];
});
const poly = (pts: P[]) => 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';
const ell = (cx: number, cy: number, a: number, b: number) => poly(Array.from({ length: 40 }, (_, i) => [cx + Math.cos((i / 40) * Math.PI * 2) * a, cy + Math.sin((i / 40) * Math.PI * 2) * b] as P));
const BRAIN = poly(brainPts()) + ' ' + ell(-50, 40, 34, 20) + ' ' + 'M -28 40 L -12 40 L -16 92 L -26 92 Z';
const BRAIN_RIM = poly(brainPts(1.06)) + ' ' + ell(-50, 41, 37, 23) + ' ' + 'M -31 40 L -9 40 L -13 95 L -29 95 Z';
const GYRI = [quadPts([-60, -30], [-20, -60], [20, -28], 10), quadPts([-10, -10], [30, -40], [62, -8], 10), quadPts([-70, 10], [-30, -5], [5, 18], 10), quadPts([20, 8], [45, -10], [70, 12], 8)].map((p) => strokePath(p, 2.6)).join(' ');
const SPOT: [number, number] = [0.056, -0.022];   // mOFC: front underside of the brain (m, brain-local, y up)

const STABS = [64.447, 64.699, 64.952];

const Glass: React.FC<{ x: number; price: string; warm: number; T: number }> = ({ x, price, warm, T }) => (
  <group position={[x, 0.14, 0.02]}>
    <Cut d={WINE} kind="glow" color="#3c0410" glow={0.3 * warm} position={[0, 0, -0.004]} depth={0.004} shadow={false} />
    <Cut d={'M -46 -159 L 46 -159 L 46 -161.5 L -46 -161.5 Z'} kind="glow" color="#ff5a5a" glow={0.2 + 0.5 * warm} position={[0, 0, 0.001]} depth={0.0005} bevel={0} shadow={false} />
    <CutM d={GLASS} m={glassMat()} position={[0, 0, 0.002]} depth={0.002} bevel={0} shadow={false} />
    <Cut d={RIM} kind="chrome" position={[0, 0, 0.0045]} depth={0.0012} bevel={0} />
    <Cut d={SHINE} kind="glow" color="#ffffff" glow={0.4} position={[0, 0, 0.006]} depth={0.0005} bevel={0} shadow={false} />
    {/* the price tag on a gold thread, tied round the stem */}
    <Cut d={strokePath([[3, -80], [28, -74], [40, -70]], 1.1)} kind="gold" position={[0, 0, 0.008]} depth={0.0008} bevel={0} shadow={false} />
    <group position={[0.052, 0.062, 0.012]} rotation={[0.05, -0.12, -0.14 + 0.03 * Math.sin(T * 0.9 + x * 9)]}>
      <PaperCard w={0.088} h={0.05} lines={[[price, 0.62, '900']]} />
      <Cut d={ring(-34, -14, 2.5, 4.5)} kind="gold" position={[0, 0.0, 0.002]} depth={0.001} bevel={0} shadow={false} />
    </group>
  </group>
);

const Brain: React.FC<{ x: number; drop: number; spot: number; T: number }> = ({ x, drop, spot }) => {
  const g = useGlow('#ffb86a', 2.6), h = useGlow('#ff7a3a', 1.4);
  g.opacity = clamp(spot); h.opacity = clamp(spot * 0.35);
  const y = 0.6 + (1 - drop) * 0.75;
  return (
    <group position={[x, y, -0.02]} rotation={[0, 0, 0.04 * (1 - drop)]}>
      <Box w={0.0016} h={1.4} d={0.0016} kind="gold" position={[0, 0.045, 0]} />
      <Cut d={BRAIN_RIM} kind="gold" position={[0, 0, -0.004]} depth={0.002} bevel={0} />
      <Cut d={BRAIN} kind="black" depth={0.004} bevel={0.0008} />
      <Cut d={GYRI} kind="gold" color="#b08a48" position={[0, 0, 0.0052]} depth={0.0006} bevel={0} shadow={false} />
      {spot > 0.01 && <>
        <CutM d={circle(0, 0, 9)} m={g} position={[SPOT[0], SPOT[1], 0.007]} depth={0.0005} bevel={0} shadow={false} />
        <CutM d={circle(0, 0, 22)} m={h} position={[SPOT[0], SPOT[1], 0.0065]} depth={0.0005} bevel={0} shadow={false} />
        <pointLight position={[SPOT[0], SPOT[1], 0.05]} intensity={0.05 * spot} distance={0.4} color="#ffb070" decay={2} />
      </>}
    </group>
  );
};

const Set: React.FC<{ T: number }> = ({ T }) => {
  const warm = easeOut(prog(T, 60.7, 61.6));
  const halo = useHolo(1.1); (halo as THREE.ShaderMaterial).uniforms.k.value = 0.25 + 0.85 * warm;
  const riser = easeOut(prog(T, 63.18, 65.1));
  const drop = pop(T, 63.18, 0.34);
  const stab = STABS.reduce((s, t) => s + impulse(T, t, 0.09), 0);
  const on = easeOut(prog(T, 63.5, 64.0));
  const lo = on * (0.38 + 0.25 * stab), hi = on * (0.95 + 0.9 * stab);
  return (
    <group>
      <Backdrop burst="none" />
      <MirrorFloor />
      <Curtains w={1.55} h={1.7} z={-0.42} />
      {/* a quiet deco wall: a gold ring behind the bottle, two pilasters */}
      <Cut d={ring(0, 0, 452, 460)} kind="gold" position={[0, 0.5, -0.9]} shadow={false} />
      {[-0.62, 0.62].map((x) => <Cut key={x} d={rect(-6, -1500, 12, 1500)} kind="gold" position={[x, 0, -0.88]} shadow={false} />)}
      {/* the bar */}
      <Box w={1.3} h={0.14} d={0.42} position={[0, 0, -0.06]} />
      <Cut d={rect(-650, -6, 1300, 5)} kind="gold" position={[0, 0.14, 0.151]} depth={0.001} bevel={0} shadow={false} />
      <Cut d={Array.from({ length: 21 }, (_, i) => rect(-600 + i * 60 - 1, -122, 2, 104)).join(' ')} kind="gold" color="#8a6a32" position={[0, 0, 0.151]} depth={0.0006} bevel={0} shadow={false} />
      {/* the one bottle */}
      <group position={[0, 0.14, -0.2]}>
        <Cut d={BOTTLE} kind="lacquer" color="#160810" depth={0.01} />
        <Cut d={'M -16 -348 L 16 -348 L 16 -298 L -16 -298 Z'} kind="gold" position={[0, 0, 0.011]} depth={0.0012} bevel={0.0004} />
        <Cut d={rect(-35, -160, 70, 92)} kind="black" position={[0, 0, 0.011]} depth={0.001} bevel={0} />
        <Cut d={rect(-35, -160, 70, 92) + ' ' + `M -31 -156 L -31 -72 L 31 -72 L 31 -156 Z`} kind="gold" position={[0, 0, 0.0122]} depth={0.0008} bevel={0} />
        <Cut d={DIAMOND(13)} kind="gold" position={[0, 0.125, 0.0125]} depth={0.001} bevel={0.0003} />
        <Cut d={rect(-22, -96, 44, 2) + ' ' + rect(-16, -88, 32, 1.5)} kind="gold" position={[0, 0, 0.0125]} depth={0.0005} bevel={0} shadow={false} />
      </group>
      {/* the halo behind the $90 glass */}
      {warm > 0.001 && <group position={[0.25, 0.31, -0.07]} scale={0.6 + 0.4 * warm}>
        <CutM d={ring(0, 0, 118, 125) + ' ' + ring(0, 0, 98, 100)} m={halo} depth={0.001} bevel={0} shadow={false} />
      </group>}
      <Glass x={-0.25} price="$10" warm={0} T={T} />
      <Glass x={0.25} price="$90" warm={warm} T={T} />
      <Brain x={-0.25} drop={drop} spot={lo} T={T} />
      <Brain x={0.25} drop={drop} spot={hi} T={T} />

      {/* light: a dim key, a cool spot on $10, a spot on $90 that warms; the riser brings the kickers up */}
      <Spot p={[0, 2.3, 1.1]} at={[0, 0.3, -0.1]} angle={0.42} i={6 + 4 * riser} shadow />
      <Spot p={[-0.32, 1.7, 0.7]} at={[-0.25, 0.26, 0.02]} angle={0.2} i={3.2} color="#e4ebff" pen={0.8} />
      <Spot p={[0.32, 1.7, 0.7]} at={[0.25, 0.26, 0.02]} angle={0.2} i={lerp(3.2, 9, warm)} color={new THREE.Color('#e4ebff').lerp(new THREE.Color('#ffc98a'), warm)} pen={0.8} shadow />
      <Spot p={[-2.4, 1.2, 1.0]} at={[-0.1, 0.45, 0]} angle={0.5} i={1 + 8 * riser} color="#ff3ec8" pen={0.9} />
      <Spot p={[2.4, 1.2, 1.0]} at={[0.1, 0.45, 0]} angle={0.5} i={1 + 8 * riser} color="#29e6ff" pen={0.9} />
      <Beam from={[0.25, 2.2, 0.0]} len={2.0} r={0.24} o={0.02 + 0.05 * warm} color="#ffd9a8" />
      <Beam from={[-0.25, 2.2, 0.0]} len={2.0} r={0.24} o={0.025} color="#dfe8ff" />
      <ambientLight intensity={0.015} />
    </group>
  );
};

const Overlay: React.FC<{ T: number }> = ({ T }) => <Caption T={T} t0={57.5} t1={65.0} text="Plassmann 等，2008，PNAS：同一款酒分别标10美元和90美元" />;

export const S07: SceneDef = {
  id: 'S07_wine', t0: 57.106, t1: 65.206, x: 84, enter: 'cut', Set, Overlay, env: 0.4,
  keys: [
    { t: 57.106, pos: [0.0, 0.3, 0.3], look: [0.0, 0.28, -0.2], fov: 32, ap: 0.01, bloom: 0.85 },
    { t: 59.0, pos: [0.0, 0.36, 1.0], look: [0.0, 0.25, -0.1], fov: 33, ap: 0.005, bloom: 0.75 },
    { t: 60.7, pos: [0.1, 0.36, 0.9], look: [0.1, 0.25, -0.05], fov: 33, ap: 0.005, bloom: 0.75 },
    { t: 63.18, pos: [0.06, 0.46, 1.2], look: [0.03, 0.42, -0.05], fov: 34, ap: 0.005, bloom: 0.8 },
    { t: 64.45, pos: [0.24, 0.58, 0.66], look: [0.25, 0.57, 0], fov: 33, ap: 0.006, bloom: 0.9 },
    { t: 65.18, pos: [0.305, 0.585, 0.16], look: [0.305, 0.58, 0], fov: 30, ap: 0.012, bloom: 1.1 },
  ],
  lines: [
    { t: 57.2, end: 60.6, text: '第三步：价格。同一瓶酒，标两个价；' },
    { t: 60.7, end: 63.1, text: '贵的那杯，被评得更好喝；' },
    { t: 63.2, end: 65.15, text: '大脑也真的更愉悦。' },
  ],
  hits: [[64.447, 0.15], [64.699, 0.2], [64.952, 0.25]],
};
