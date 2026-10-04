import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* Look at a downloaded model from a few angles before using it (frame 0: top, 1: front, 2: 3/4). */
let M: THREE.Group | null = null;
const Cam: React.FC<{ f: number; r: number }> = ({ f, r }) => {
  const { camera } = useThree();
  const P = [[0, r * 1.6, 0.01], [0, r * 0.4, r * 1.4], [r * 1.0, r * 0.7, r * 1.0]][f];
  camera.position.set(P[0], P[1], P[2]); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  return null;
};
export const ModelTest: React.FC<{ file: string }> = ({ file }) => {
  const f = useCurrentFrame();
  const [m, setM] = useState<THREE.Group | null>(M);
  const [h] = useState(() => delayRender('model'));
  useEffect(() => { new GLTFLoader().loadAsync(staticFile(`models/${file}.glb`)).then((g) => { const keep = g.scene.children.filter((o) => o.position.x > 3.0); g.scene.clear(); keep.forEach((o) => g.scene.add(o)); M = g.scene; setM(g.scene); continueRender(h); }); }, [h, file]);
  if (!m) return null;
  const box = new THREE.Box3().setFromObject(m); const c = box.getCenter(new THREE.Vector3()); const s = box.getSize(new THREE.Vector3());
  m.position.set(-c.x, -box.min.y, -c.z);
  return (
    <AbsoluteFill style={{ background: '#20242c' }}>
      <ThreeCanvas width={1920} height={1080} camera={{ fov: 40, near: 0.05, far: 500 }}>
        <Cam f={f} r={Math.max(s.x, s.z) * 0.6} />
        <ambientLight intensity={1.2} /><directionalLight position={[5, 10, 7]} intensity={2} />
        <primitive object={m} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
