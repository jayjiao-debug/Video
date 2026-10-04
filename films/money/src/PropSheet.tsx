import React from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Env } from './three-kit';
import { useModels } from './useModels';
import { SIZES, type ModelName } from './models';
import { ZH, EN, GOLD } from './lib';

/* Props sheet for approval: one downloaded model per frame, lit the way the film will light it
   (one warm key with soft shadows, a cool rim from behind, a dark set). */
export const PROPS: [ModelName, string, string][] = [
  ['bill100', '100 美元纸币', 'S1 · S6 · S10'],
  ['noodles', '一碗炸酱面', 'S1 · S10'],
  ['table', '旧木桌', 'S1 · S10'],
  ['cowrie', '海贝', 'S3'],
  ['lioncoins', '狮子币（吕底亚替身）', 'S4'],
  ['cashcoin', '方孔铜钱（改成半两）', 'S4'],
  ['goldbar', '金条', 'S5 · S6 · S8'],
  ['stonewheel', '石币（雅浦替身）', 'S9'],
  ['canoe', '独木舟', 'S9'],
];

const Cam: React.FC<{ r: number; y: number }> = ({ r, y }) => {
  const { camera } = useThree();
  camera.position.set(r * 1.05, y + r * 0.62, r * 1.25);
  camera.lookAt(0, y, 0);
  (camera as THREE.PerspectiveCamera).near = r * 0.02;
  (camera as THREE.PerspectiveCamera).far = r * 40;
  camera.updateProjectionMatrix();
  return null;
};

export const PropSheet: React.FC = () => {
  const f = useCurrentFrame();
  const [name, zh, scenes] = PROPS[Math.min(f, PROPS.length - 1)];
  const m = useModels([name]);
  if (!m) return null;
  const obj = m[name];
  const box = new THREE.Box3().setFromObject(obj);
  const s = box.getSize(new THREE.Vector3());
  const r = Math.max(s.x, s.y, s.z) * 1.15;
  const L = SIZES[name][0];
  return (
    <AbsoluteFill style={{ background: '#07080d' }}>
      <ThreeCanvas width={1920} height={1080} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} camera={{ fov: 30 }}>
        <Cam r={r} y={s.y * 0.4} />
        <color attach="background" args={['#07080d']} />
        <Env intensity={0.35} />
        <spotLight position={[-r * 1.2, r * 2.2, r * 1.0]} angle={0.55} penumbra={0.8} intensity={60 * r * r} decay={2} color="#ffc98a" castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0002} shadow-camera-near={r * 0.2} shadow-camera-far={r * 8} />
        <pointLight position={[r * 1.4, r * 0.9, -r * 1.6]} intensity={30 * r * r} decay={2} color="#7fa6ff" />
        <ambientLight intensity={0.05} color="#8090b0" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[r * 6, 64]} />
          <meshStandardMaterial color="#14110e" roughness={0.9} />
        </mesh>
        <primitive object={obj} />
      </ThreeCanvas>
      <div style={{ position: 'absolute', left: 80, bottom: 70, color: '#f3ede2' }}>
        <div style={{ fontFamily: EN, fontSize: 24, letterSpacing: '0.3em', color: GOLD }}>{`${f + 1} / ${PROPS.length} · ${scenes}`}</div>
        <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, marginTop: 6 }}>{zh}</div>
        <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 26, opacity: 0.55 }}>{`${name}.glb · scaled to ${L >= 1 ? `${L} m` : `${Math.round(L * 1000)} mm`}`}</div>
      </div>
    </AbsoluteFill>
  );
};
