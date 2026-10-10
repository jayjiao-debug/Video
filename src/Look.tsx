/* Model sheet for the radio world: one frame per look (render frames 0, 1, 2 …). */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { World, RadioState, Cam, P } from './World';
import { font } from './brand/lib';

const off: RadioState = { power: 0, needle: 0.18, gap: 0.8, flicker: 0, flood: 0, moon: 1 };
const lost: RadioState = { power: 0.75, needle: 0.31, gap: 0.75, flicker: 0.9, flood: 0, moon: 0.8 };
const locked: RadioState = { power: 1, needle: 0.62, gap: 0.02, flicker: 0, flood: 1, moon: 0.5 };
const v = (a: THREE_V): [number, number, number] => [a.x, a.y, a.z];
type THREE_V = { x: number; y: number; z: number };

export const LOOKS: { name: string; s: RadioState; cam: Cam }[] = [
  { name: '1 房间 · 关机 · 月光', s: off, cam: { pos: [0.55, 0.42, 1.35], look: [-0.05, 0.25, -0.1], fov: 36, focus: 1.4, aperture: 0.0006, bloom: 0.5 } },
  { name: '2 找台 · 杂音', s: lost, cam: { pos: [0.32, 0.3, 0.62], look: [0.0, 0.2, 0.0], fov: 34, focus: 0.65, aperture: 0.0015, bloom: 0.7 } },
  { name: '3 调到了 · 房间被点亮', s: locked, cam: { pos: [0.55, 0.42, 1.35], look: [-0.05, 0.25, -0.1], fov: 36, focus: 1.4, aperture: 0.0006, bloom: 0.75 } },
  { name: '4 微距 · 电眼张开', s: lost, cam: { pos: [P.eye.x + 0.03, P.eye.y + 0.012, P.eye.z + 0.1], look: v(P.eye), fov: 30, focus: 0.1, aperture: 0.02, bloom: 0.8 } },
  { name: '5 微距 · 电眼合拢', s: locked, cam: { pos: [P.eye.x + 0.03, P.eye.y + 0.012, P.eye.z + 0.1], look: v(P.eye), fov: 30, focus: 0.1, aperture: 0.02, bloom: 0.8 } },
  { name: '6 微距 · 刻度盘与指针', s: { ...lost, flicker: 0.4 }, cam: { pos: [P.dial.x + 0.09, P.dial.y + 0.01, P.dial.z + 0.16], look: [P.dial.x - 0.02, P.dial.y, P.dial.z], fov: 30, focus: 0.17, aperture: 0.012, bloom: 0.7 } },
];

export const Look: React.FC = () => {
  const f = useCurrentFrame(), L = LOOKS[Math.min(LOOKS.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ThreeCanvas width={1920} height={1080} camera={{ fov: 35, position: [0, 0.4, 1.4], near: 0.005, far: 30 }} gl={{ antialias: true }} shadows>
        <World s={L.s} cam={L.cam} T={1.3} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)' }} />
      <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: font.sans, fontSize: 30, color: 'rgba(255,255,255,0.6)' }}>{L.name}</div>
    </AbsoluteFill>
  );
};
