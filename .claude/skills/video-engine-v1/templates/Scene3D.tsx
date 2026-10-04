import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, continueRender, delayRender, staticFile, useVideoConfig } from 'remotion';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { b, prog, easeOut, easeIn, camAt, type Key } from './lib';
import { Sub, Chapter, SubBand } from './ui';

/* A 3D scene. Pattern proven on 《应该没事吧》 (Titanic, tsunami, finale):
   - assets load once into a module cache; delayRender until they (and the fonts) are ready
   - the scene is a pure function of T; the camera follows keyframes (camAt)
   - downloaded models are normalised (longest axis on x, keel/base at y = 0, known length) before use
   - data is drawn as instanced meshes (seats, people, dots), never thousands of separate meshes */
export const S_IN = b(96), S_OUT = b(168);

type Assets = { model: THREE.Group };
let ASSETS: Assets | null = null;
const normalize = (obj: THREE.Object3D, len: number) => {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const inner = new THREE.Group(); inner.add(obj);
  if (size.z > size.x) inner.rotation.y = Math.PI / 2;
  obj.position.set(-c.x, -box.min.y, -c.z);
  inner.scale.setScalar(len / Math.max(size.x, size.z));
  const g = new THREE.Group(); g.add(inner);
  g.userData = { height: size.y * len / Math.max(size.x, size.z) };
  return g;
};
const loadAssets = async () => {
  if (ASSETS) return ASSETS;
  const gltf = await new GLTFLoader().loadAsync(staticFile('models/thing.glb'));
  // rigging and other LINE primitives in downloaded models: dim them, they read as scratches
  gltf.scene.traverse((o: any) => { if (o.isLine || o.isLineSegments) o.material = new THREE.LineBasicMaterial({ color: '#8a8f99', transparent: true, opacity: 0.2 }); });
  ASSETS = { model: normalize(gltf.scene, 10) };
  return ASSETS;
};

const KEYS: Key[] = [
  [S_IN, [0, 20, 40], [0, 0, 0]],
  [b(104), [-10, 6, 18], [-8, 0, -10]],
  [S_OUT, [0, 24, 50], [0, 0, 0]],
];
const CamRig: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(KEYS, T);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  camera.updateProjectionMatrix();
  return null;
};

/* project a world point to screen pixels, for HTML labels that follow 3D objects (fonts stay crisp, no canvas text) */
const PROJ = new THREE.PerspectiveCamera(36, 1920 / 1080, 0.1, 5000);
export const toScreen = (T: number, v: number[]) => {
  const { pos, look } = camAt(KEYS, T);
  PROJ.position.set(pos[0], pos[1], pos[2]); PROJ.lookAt(look[0], look[1], look[2]); PROJ.updateMatrixWorld(); PROJ.updateProjectionMatrix();
  const p = new THREE.Vector3(v[0], v[1], v[2]).project(PROJ);
  return { x: (p.x + 1) / 2 * 1920, y: (1 - p.y) / 2 * 1080, front: p.z < 1 };
};

const Dots: React.FC<{ T: number }> = ({ T }) => {
  const N = 1500;
  const mesh = useMemo(() => new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffcf6e', toneMapped: false }), N), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  for (let i = 0; i < N; i++) {
    const ap = easeOut(prog(T, S_IN + (i / N) * 2, S_IN + (i / N) * 2 + 0.3));
    o.position.set(Math.cos(i) * (i % 40) * 0.2, 0.05, Math.sin(i) * (i % 40) * 0.2);
    o.scale.setScalar(Math.max(0.0001, ap)); o.updateMatrix(); // never scale to exactly 0
    mesh.setMatrixAt(i, o.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

const Scene: React.FC<{ T: number; a: Assets }> = ({ T, a }) => (
  <>
    <CamRig T={T} />
    <hemisphereLight args={['#cfe6ff', '#c9b48a', 0.55]} />
    <directionalLight position={[40, 60, 30]} intensity={2.2} />
    <primitive object={a.model} />
    <Dots T={T} />
  </>
);

export const Scene3D: React.FC<{ T: number }> = ({ T }) => {
  const { width, height } = useVideoConfig();
  const [assets, setAssets] = useState<Assets | null>(ASSETS);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts and models', { timeoutInMilliseconds: 120000 }));
  useEffect(() => { loadAssets().then(setAssets); }, []);
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '600 40px "Cormorant Garamond"'].map((f) => document.fonts.load(f, '测试0123').catch(() => null)))
      .then(() => setReady(true));
  }, []);
  useEffect(() => { if (ready && assets) continueRender(handle); }, [ready, assets, handle]);
  const o = easeOut(prog(T, S_IN - 0.05, S_IN + 0.5)) * (1 - easeIn(prog(T, S_OUT - 0.35, S_OUT)));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d', opacity: o }}>
      {assets && ready && (
        <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }}
          camera={{ fov: 36, near: 0.1, far: 5000 }}>
          <Scene T={T} a={assets} />
        </ThreeCanvas>
      )}
      <SubBand />
      <Chapter T={T} at={S_IN + 0.3} out={S_OUT - 0.2} text="2004.12.26 · 泰 国 普 吉 岛" />
      <Sub T={T} at={S_IN + 0.15} out={b(104) - 0.1} zh="第一句字幕，[金色关键词]" en="First line." />
    </AbsoluteFill>
  );
};
