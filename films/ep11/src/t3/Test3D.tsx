import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const Card: React.FC<{ x: number; f: number; i: number }> = ({ x, f, i }) => {
  const sway = Math.sin(f / 18 + i) * 0.06;
  return (
    <group position={[x, 0.2 - Math.abs(x) * 0.03, 0]} rotation={[0, 0, sway]}>
      <mesh position={[0, -0.75, 0]} castShadow>
        <boxGeometry args={[0.9, 1.25, 0.02]} />
        <meshStandardMaterial color="#efe6d0" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.05, 0.02]} castShadow>
        <boxGeometry args={[0.12, 0.22, 0.05]} />
        <meshStandardMaterial color="#8a6a3a" />
      </mesh>
    </group>
  );
};

export const Test3D: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camZ = interpolate(f, [0, 90], [9, 6.5]);
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{ fov: 35, position: [0, 0.3, camZ] }} style={{ background: '#0f1016' }}>
      <ambientLight intensity={0.15} />
      <pointLight position={[1.5, 1.5, 3]} intensity={30} color="#ffcf8a" castShadow />
      <mesh position={[0, 0, -0.6]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#1a1c26" roughness={1} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 14, 8]} />
        <meshStandardMaterial color="#b8483b" />
      </mesh>
      {[-3, -2, -1, 0, 1, 2, 3].map((x, i) => <Card key={i} x={x * 1.1} f={f} i={i} />)}
    </ThreeCanvas>
  );
};
