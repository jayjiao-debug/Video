import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, continueRender, delayRender, staticFile, useVideoConfig } from 'remotion';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { camAt, type Key } from './lib';
import COUNTRIES from './countries.json';

/* The night Earth ("Earth" by SebastianSosnowski, Sketchfab, CC-BY): 10.1 units across, centred at the origin,
   emissive city lights. Countries are pinned by lat/lon; LON0 and the axis signs were matched to the texture
   on the GlobeTest board (China, Brazil, UK, Australia, USA). */
export type Country = { code: string; name: string; zh: string; pop: number; lat: number; lon: number; d: number };
export const C: Country[] = COUNTRIES as Country[];
export const R = 5.05;
export const LON0 = 0; // texture longitude offset, degrees (fitted on GlobeTest)
export const SPIN0 = 0; // globe rotation about +y at T=0, degrees

let EARTH: THREE.Group | null = null;
const loadEarth = async () => {
  if (EARTH) return EARTH;
  const gltf = await new GLTFLoader().loadAsync(staticFile('models/earth.glb'));
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const c = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(c);
  const g = new THREE.Group();
  g.add(gltf.scene);
  EARTH = g;
  return g;
};

/** local (unrotated) position on the sphere for lat/lon, radius r */
export const llToVec = (lat: number, lon: number, r = R) => {
  const la = (lat * Math.PI) / 180, lo = ((lon + LON0) * Math.PI) / 180;
  return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
};
/** world position after the globe's spin (degrees about +y) */
export const worldOf = (lat: number, lon: number, spin: number, r = R) => llToVec(lat, lon, r).applyAxisAngle(new THREE.Vector3(0, 1, 0), (spin * Math.PI) / 180);

const PROJ = new THREE.PerspectiveCamera(30, 1920 / 1080, 0.1, 500);
/** project a world point to screen pixels for HTML labels; `facing` > 0 when the point faces the camera */
export const project = (keys: Key[], T: number, v: THREE.Vector3) => {
  const { pos, look } = camAt(keys, T);
  PROJ.position.set(pos[0], pos[1], pos[2]); PROJ.lookAt(look[0], look[1], look[2]); PROJ.updateMatrixWorld(); PROJ.updateProjectionMatrix();
  const p = v.clone().project(PROJ);
  const toCam = new THREE.Vector3(pos[0], pos[1], pos[2]).sub(v).normalize();
  const facing = v.clone().normalize().dot(toCam);
  return { x: ((p.x + 1) / 2) * 1920, y: ((1 - p.y) / 2) * 1080, facing };
};

const CamRig: React.FC<{ T: number; keys: Key[] }> = ({ T, keys }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(keys, T);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  camera.updateProjectionMatrix();
  return null;
};

/** gold dots on the surface, one per country, lit by `lit(i)` 0..1 */
const Pins: React.FC<{ spin: number; lit: (i: number) => number; size: number }> = ({ spin, lit, size }) => {
  const mesh = useMemo(() => new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd27a', toneMapped: false }), C.length), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  C.forEach((c, i) => {
    o.position.copy(worldOf(c.lat, c.lon, spin, R * 1.004));
    o.scale.setScalar(Math.max(0.0001, size * lit(i)));
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

export const Globe: React.FC<{ T: number; keys: Key[]; spin: number; lit?: (i: number) => number; pin?: number; glow?: number; ambient?: number }> = ({ T, keys, spin, lit = () => 1, pin = 0.05, glow = 1, ambient = 0.08 }) => {
  const { width, height } = useVideoConfig();
  const [earth, setEarth] = useState<THREE.Group | null>(EARTH);
  const [handle] = useState(() => (EARTH ? null : delayRender('earth model', { timeoutInMilliseconds: 120000 })));
  useEffect(() => { loadEarth().then((g) => { setEarth(g); if (handle !== null) continueRender(handle); }); }, [handle]);
  if (!earth) return null;
  earth.rotation.y = (spin * Math.PI) / 180;
  earth.traverse((m: any) => { if (m.material && m.material.emissive) m.material.emissiveIntensity = glow; });
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }} camera={{ fov: 30, near: 0.1, far: 500 }}>
        <CamRig T={T} keys={keys} />
        <ambientLight intensity={ambient} />
        <directionalLight position={[-30, 8, -12]} intensity={2.4} color="#cfe0ff" />
        <directionalLight position={[18, 10, 30]} intensity={0.35} color="#ffd9a0" />
        <primitive object={earth} />
        <Pins spin={spin} lit={lit} size={pin} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
