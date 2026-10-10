/* Look development: the bag on the foil stage, three looks. Frame i = look i. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Stage, Cam } from './Stage';
import { Cut, HeroBag, archFrame, rays, rect, circle } from './foil';

const cam = (pos: [number, number, number], look: [number, number, number], fov = 32, extra: Partial<Cam> = {}): Cam => ({ pos, look, fov, focus: Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]), aperture: 0.004, bloom: 0.55, ...extra });

const Diorama: React.FC<{ v: number }> = ({ v }) => (
  <group>
    {/* back wall: black velvet, a holo sunburst of foil strips */}
    <Cut d={rect(-3000, -2000, 6000, 2600)} kind="black" position={[0, 0, -1.4]} />
    <Cut d={rays(84, 200, 2600, Math.PI, Math.PI * 2, 0.008)} kind={v === 1 ? 'gold' : 'holo'} position={[0, 0.25, -1.36]} />
    {/* the arch, gold foil, two layers */}
    <Cut d={archFrame(760, 980, 40)} kind="gold" position={[0, 0, -0.55]} />
    <Cut d={archFrame(840, 1040, 18)} kind={v === 2 ? 'chrome' : 'holo'} position={[0, 0, -0.62]} />
    {/* plinth: stacked cut boxes */}
    <Cut d={rect(-260, -120, 520, 120)} kind="black" position={[0, 0, -0.1]} />
    <Cut d={rect(-290, -136, 580, 18)} kind="gold" position={[0, 0, -0.08]} />
    {/* floor: black lacquer */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow><planeGeometry args={[12, 8]} /><meshPhysicalMaterial color="#05040a" roughness={0.35} clearcoat={0.4} clearcoatRoughness={0.2} /></mesh>
    <HeroBag position={[0, 0.136, 0]} swing={10} leather={v === 2 ? '#111016' : '#8a0f22'} />
    {/* foil confetti near the lens */}
    {Array.from({ length: 26 }, (_, i) => { const a = i * 2.39996, r = 0.35 + (i % 7) * 0.09; return (
      <Cut key={i} d={i % 3 ? 'M 0 -9 L 8 0 L 0 9 L -8 0 Z' : circle(0, 0, 6)} kind={i % 4 ? 'holo' : 'gold'} depth={0.0008} bevel={0} shadow={false}
        position={[Math.cos(a) * r * 1.6, 0.35 + Math.sin(a) * r * 0.7, 0.1 + (i % 5) * 0.06]} rotation={[a, a * 0.7, a * 1.3]} scale={1.4} />); })}
    {/* key lights */}
    <spotLight position={[0, 2.6, 1.6]} angle={0.32} penumbra={0.7} intensity={14} color="#fff0d8" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
    <spotLight position={[-2.2, 1.2, 1.2]} angle={0.5} penumbra={0.9} intensity={10} color="#ff3ec8" />
    <spotLight position={[2.2, 1.2, 1.2]} angle={0.5} penumbra={0.9} intensity={10} color="#29e6ff" />
    <ambientLight intensity={0.04} />
  </group>
);

const LOOKS: Cam[] = [
  cam([0.25, 0.42, 1.35], [0, 0.3, -0.2], 34, { bloom: 0.6, ca: 0.15 }),
  cam([0.25, 0.42, 1.35], [0, 0.3, -0.2], 34, { bloom: 0.5, ca: 0.1 }),
  cam([-0.35, 0.3, 0.95], [0, 0.26, -0.1], 30, { bloom: 0.6, ca: 0.15 }),
];
export const LookDev: React.FC = () => {
  const f = useCurrentFrame(), v = Math.min(2, f);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ThreeCanvas width={1920} height={1080} camera={{ fov: 34, position: [0, 0.4, 1.4], near: 0.01, far: 80 }} gl={{ antialias: true }} shadows>
        <Stage cam={LOOKS[v]}><Diorama v={v} /></Stage>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
