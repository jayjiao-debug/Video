import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, continueRender, delayRender, staticFile, useVideoConfig } from 'remotion';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { b, prog, easeOut, easeInOut, camAt, benford, mulberry, EN, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { PersonCard } from './PersonCard';

/* S2a, 1881 (b44–b84): Newcomb's desk at night, nobody in shot. The log table lies closed; its fore-edge is worn in
   nine bands, front pages (first digit 1) darkest, back pages (9) almost clean. The camera opens on the fore-edge
   (the title card's bars became these bands), pulls back to the desk, then reads the bands top to bottom.
   Models (Sketchfab, CC-BY): "Antique Desk" and "Ink Bottle with Quill" by Matthew Collings, "Victorian Brass Oil
   Lamp" by tijerin_art. The book is built here so its fore-edge can carry the wear exactly. */
export const S2_IN = b(43), S2_OUT = b(84) + 0.4;

const DESK_TOP = 0.9;
const BOOK = { x: 0.06, z: 0.06, L: 0.26, Wd: 0.18, Th: 0.078 }; // length along x, width along z, thickness
const EDGE_Z = BOOK.z + BOOK.Wd / 2; // fore-edge faces +z
const bandY = (d: number) => DESK_TOP + 0.004 + BOOK.Th * (1 - (d - 0.5) / 9); // band d centre (1 = top = front pages)

export const LINES_S2A: Line[] = [
  [b(44) + 0.1, b(52) - 0.1, '1881年，美国华盛顿。', 'Washington, 1881.'],
  [b(52) + 0.06, b(60) - 0.1, '天文学家纽康，天天翻一本对数表。', 'The astronomer Simon Newcomb used a book of logarithms every day.'],
  [b(60) + 0.06, b(68) - 0.1, '他发现：书的前几页，脏得发黑；', 'He noticed the first pages were worn almost black,'],
  [b(68) + 0.06, b(76) - 0.1, '越往后翻，越干净。', 'and the further in, the cleaner they got.'],
  [b(76) + 0.06, b(84) - 0.1, '对数表按第一位排：1在最前，9在最后。', 'The table runs by first digit: 1 at the front, 9 at the back.'],
];

const KEYS: Key[] = [
  [b(43), [BOOK.x, bandY(5), EDGE_Z + 0.2], [BOOK.x, bandY(5), EDGE_Z]],
  [b(45), [BOOK.x, bandY(5), EDGE_Z + 0.23], [BOOK.x, bandY(5), EDGE_Z]],
  [b(52), [-0.3, 1.3, 1.4], [0.1, 0.98, 0.02]],
  [b(59), [-0.22, 1.18, 1.1], [0.08, 0.96, 0.04]],
  [b(61), [BOOK.x - 0.12, bandY(2) + 0.015, EDGE_Z + 0.2], [BOOK.x - 0.02, bandY(2), EDGE_Z]],
  [b(68), [BOOK.x - 0.02, bandY(4) + 0.01, EDGE_Z + 0.19], [BOOK.x + 0.02, bandY(4), EDGE_Z]],
  [b(75), [BOOK.x + 0.1, bandY(8), EDGE_Z + 0.17], [BOOK.x + 0.06, bandY(8.5), EDGE_Z]],
  [b(77), [BOOK.x, bandY(5) + 0.01, EDGE_Z + 0.27], [BOOK.x, bandY(5), EDGE_Z]],
  [b(84), [BOOK.x - 0.05, bandY(5) + 0.03, EDGE_Z + 0.24], [BOOK.x - 0.05, bandY(5), EDGE_Z]],
];

// ---------------------------------------------------------------- textures drawn in code (no text: fonts stay in HTML)
const foreEdgeTexture = () => {
  const W = 2048, H = 640;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#efe5cc'; g.fillRect(0, 0, W, H);
  const r = mulberry(7);
  for (let y = 0; y < H; y += 2) { g.fillStyle = `rgba(120,100,70,${0.05 + r() * 0.12})`; g.fillRect(0, y, W, 1); }
  // wear per band: darker toward the front; smudges where thumbs land (toward the left, where the book is opened)
  for (let d = 1; d <= 9; d++) {
    const y0 = ((d - 1) / 9) * H, y1 = (d / 9) * H;
    const w = benford(d) / benford(1); // 1 → 1.0, 9 → 0.15
    for (let k = 0; k < 900 * w; k++) {
      const x = Math.pow(r(), 1.6) * W * (0.55 + 0.45 * w), y = y0 + r() * (y1 - y0);
      const rad = 6 + r() * 40 * w;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, `rgba(58,40,22,${0.10 * w + 0.02})`); grd.addColorStop(1, 'rgba(58,40,22,0)');
      g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // overall grime, fading toward the right (the side away from the thumb) and darkest at the front
    const gr = g.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, `rgba(40,26,12,${0.95 * Math.pow(w, 0.9)})`); gr.addColorStop(0.7, `rgba(48,32,16,${0.82 * Math.pow(w, 1.1)})`); gr.addColorStop(1, `rgba(60,40,20,${0.55 * Math.pow(w, 1.3)})`);
    g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0);
    // the thumb-index notch for this section
    g.fillStyle = 'rgba(40,26,14,0.85)';
    g.beginPath(); g.ellipse(70, (y0 + y1) / 2, 34, (y1 - y0) * 0.42, 0, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};
const pagesSideTexture = () => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d')!; g.fillStyle = '#e9dfc4'; g.fillRect(0, 0, 512, 256);
  const r = mulberry(11);
  for (let y = 0; y < 256; y += 2) { g.fillStyle = `rgba(120,100,70,${0.06 + r() * 0.1})`; g.fillRect(0, y, 512, 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const wallTexture = () => {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d')!; g.fillStyle = '#2a2219'; g.fillRect(0, 0, 1024, 512);
  for (let x = 0; x < 1024; x += 32) { g.fillStyle = 'rgba(70,52,30,0.35)'; g.fillRect(x, 0, 10, 512); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t;
};

// ---------------------------------------------------------------- models
type Assets = { desk: THREE.Group; ink: THREE.Group; lamp: THREE.Group };
let ASSETS: Assets | null = null;
/** centre on x/z, base at y = 0, scale so the height is `h` metres */
const normalize = (obj: THREE.Object3D, h: number) => {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  obj.position.set(-c.x, -box.min.y, -c.z);
  const g = new THREE.Group(); g.add(obj); g.scale.setScalar(h / size.y);
  return g;
};
const loadAssets = async () => {
  if (ASSETS) return ASSETS;
  const L = new GLTFLoader();
  const [d, i, l] = await Promise.all(['desk1881', 'inkwell', 'oil_lamp'].map((n) => L.loadAsync(staticFile(`models/${n}.glb`))));
  for (const s of [d.scene, i.scene, l.scene]) s.traverse((o: any) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  ASSETS = { desk: normalize(d.scene, 0.9), ink: normalize(i.scene, 0.156), lamp: normalize(l.scene, 0.54) };
  return ASSETS;
};

const CamRig: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(KEYS, T);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  camera.updateProjectionMatrix();
  return null;
};

const PROJ = new THREE.PerspectiveCamera(30, 1920 / 1080, 0.01, 50);
const toScreen = (T: number, v: number[]) => {
  const { pos, look } = camAt(KEYS, T);
  PROJ.position.set(pos[0], pos[1], pos[2]); PROJ.lookAt(look[0], look[1], look[2]); PROJ.updateMatrixWorld(); PROJ.updateProjectionMatrix();
  const p = new THREE.Vector3(v[0], v[1], v[2]).project(PROJ);
  return { x: ((p.x + 1) / 2) * 1920, y: ((1 - p.y) / 2) * 1080 };
};

const Book: React.FC = () => {
  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ map: foreEdgeTexture(), roughness: 0.92 });
    const side = new THREE.MeshStandardMaterial({ map: pagesSideTexture(), roughness: 0.95 });
    const plain = new THREE.MeshStandardMaterial({ color: '#e6dcc2', roughness: 0.95 });
    // box faces: +x, -x, +y, -y, +z (fore-edge), -z (spine side)
    return [side, side, plain, plain, edge, plain];
  }, []);
  const cover = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a2416', roughness: 0.55, metalness: 0.05 }), []);
  const { x, z, L, Wd, Th } = BOOK;
  const y0 = DESK_TOP;
  return (
    <group>
      <mesh position={[x, y0 + 0.0025, z + 0.003]} castShadow receiveShadow><boxGeometry args={[L + 0.012, 0.005, Wd + 0.012]} /><primitive object={cover} attach="material" /></mesh>
      <mesh position={[x, y0 + 0.005 + Th / 2, z]} material={mats} castShadow receiveShadow><boxGeometry args={[L, Th, Wd]} /></mesh>
      <mesh position={[x, y0 + 0.005 + Th + 0.0025, z + 0.003]} castShadow receiveShadow><boxGeometry args={[L + 0.012, 0.005, Wd + 0.012]} /><primitive object={cover} attach="material" /></mesh>
      {/* the spine, rounded */}
      <mesh position={[x, y0 + 0.005 + Th / 2, z - Wd / 2 - 0.002]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[Th / 2 + 0.006, Th / 2 + 0.006, L + 0.012, 24, 1, false, 0, Math.PI]} /><primitive object={cover} attach="material" /></mesh>
    </group>
  );
};

const Room: React.FC<{ T: number; a: Assets }> = ({ T, a }) => {
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ map: wallTexture(), roughness: 1 }), []);
  // the flame breathes on its own slow clock (not the beat)
  const flick = 1 + 0.06 * Math.sin(T * 7.3) + 0.04 * Math.sin(T * 12.1 + 1.3);
  return (
    <>
      <ambientLight intensity={0.05} color="#8aa0c8" />
      <directionalLight position={[-2.5, 2.6, -1.2]} intensity={0.35} color="#9db6e6" />
      <pointLight position={[0.5, DESK_TOP + 0.36, 0.24]} intensity={3.2 * flick} distance={6} decay={2} color="#ffb766" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0005} />
      <pointLight position={[0.2, DESK_TOP + 0.6, 0.9]} intensity={0.18} distance={4} decay={2} color="#ffcf9a" />
      <primitive object={a.desk} position={[0, 0, 0]} />
      <primitive object={a.lamp} position={[0.5, DESK_TOP, 0.22]} />
      <primitive object={a.ink} position={[-0.32, DESK_TOP, -0.02]} rotation={[0, 0.5, 0]} />
      <Book />
      {/* a sheet of working on the desk, left of the book */}
      <mesh position={[-0.2, DESK_TOP + 0.001, 0.14]} rotation={[-Math.PI / 2, 0, 0.12]} receiveShadow><planeGeometry args={[0.21, 0.28]} /><meshStandardMaterial color="#efe4c8" roughness={1} /></mesh>
      {/* wall, floor, a window of night sky */}
      <mesh position={[0, 1.4, -0.75]} receiveShadow><planeGeometry args={[8, 4]} /><primitive object={wall} attach="material" /></mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[8, 8]} /><meshStandardMaterial color="#17110c" roughness={1} /></mesh>
      <mesh position={[-1.25, 1.75, -0.74]}><planeGeometry args={[0.9, 1.2]} /><meshBasicMaterial color="#101c36" toneMapped={false} /></mesh>
      {[-0.45, 0, 0.45].map((dx, i) => <mesh key={i} position={[-1.25 + dx, 1.75, -0.735]}><planeGeometry args={[0.04, 1.2]} /><meshStandardMaterial color="#1b130c" /></mesh>)}
      <mesh position={[-1.25, 1.75, -0.735]}><planeGeometry args={[0.9, 0.04]} /><meshStandardMaterial color="#1b130c" /></mesh>
      {/* the flame's glow */}
      <sprite position={[0.5, DESK_TOP + 0.36, 0.24]} scale={[0.5 * flick, 0.5 * flick, 1]}><spriteMaterial color="#ffb766" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></sprite>
    </>
  );
};

export const S2A: React.FC<{ T: number }> = ({ T }) => {
  const { width, height } = useVideoConfig();
  const [assets, setAssets] = useState<Assets | null>(ASSETS);
  const [handle] = useState(() => (ASSETS ? null : delayRender('1881 desk models', { timeoutInMilliseconds: 120000 })));
  useEffect(() => { loadAssets().then((x) => { setAssets(x); if (handle !== null) continueRender(handle); }); }, [handle]);
  if (T < S2_IN || T > S2_OUT) return null;
  const o = easeOut(prog(T, S2_IN, S2_IN + 0.6)) * (1 - easeInOut(prog(T, S2_OUT - 0.5, S2_OUT)));
  // tabs 1→9 light up in one quick sweep on "1在最前，9在最后"
  const sweep = (d: number) => easeOut(prog(T, b(78) + (d - 1) * 0.12, b(78) + (d - 1) * 0.12 + 0.25));
  const tabsO = easeOut(prog(T, b(77), b(78))) * (1 - easeInOut(prog(T, S2_OUT - 0.6, S2_OUT)));
  return (
    <AbsoluteFill style={{ backgroundColor: '#070504', opacity: o }}>
      {assets && (
        <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }} camera={{ fov: 30, near: 0.01, far: 50 }}>
          <CamRig T={T} />
          <Room T={T} a={assets} />
        </ThreeCanvas>
      )}
      {/* section digits beside the thumb-index notches (HTML so the type stays crisp) */}
      {tabsO > 0.01 && Array.from({ length: 9 }, (_, k) => {
        const d = k + 1;
        const p = toScreen(T, [BOOK.x - BOOK.L / 2 + 0.0087, bandY(d), EDGE_Z + 0.001]);
        return (
          <div key={d} style={{ position: 'absolute', left: p.x - 110, top: p.y - 24, width: 70, textAlign: 'right', opacity: tabsO * (0.35 + 0.65 * sweep(d)), fontFamily: EN, fontWeight: 700, fontSize: 42, color: d === 1 ? GOLD : INK, fontVariantNumeric: 'lining-nums', textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}>{d}</div>
        );
      })}
      <SubBand />
      <Chapter T={T} at={b(44)} out={b(60)} text="1881 · 美 国 华 盛 顿" />
      <PersonCard T={T} at={b(52) + 0.3} out={b(60) - 0.1} name="SIMON NEWCOMB" zh="西蒙·纽康" years="1835 – 1909" role="天文学家 · 美国航海天文历局局长" />
      <Subs T={T} lines={LINES_S2A} />
    </AbsoluteFill>
  );
};
