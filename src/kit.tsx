import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { rnd } from './lib';
import { canvasTex } from './three-kit';

/* Set pieces shared by the scenes of 《钱凭什么》. Everything is a pure function of T. */

/** split a model into its connected pieces (welded by position) and return the pieces as separate meshes,
    largest first; used to take one gold bar out of a stack of three */
export const islands = (root: THREE.Object3D) => {
  const out: THREE.Mesh[] = [];
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    // plain (non-interleaved) copy of the geometry in world space
    const g = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(m.geometry.attributes)) {
      const a = attr as THREE.BufferAttribute;
      const arr = new Float32Array(a.count * a.itemSize);
      for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) arr[i * a.itemSize + k] = a.getComponent(i, k);
      g.setAttribute(name, new THREE.BufferAttribute(arr, a.itemSize, a.normalized));
    }
    const n = g.attributes.position.count;
    g.setIndex(m.geometry.index ? Array.from(m.geometry.index.array) : Array.from({ length: n }, (_, i) => i));
    g.applyMatrix4(m.matrixWorld);
    const idx = g.index!.array, pos = g.attributes.position;
    // vertices at the same place belong together (UV seams split them in the file)
    const parent = Int32Array.from({ length: n }, (_, i) => i);
    const find = (i: number): number => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const join = (a: number, c: number) => { const ra = find(a), rc = find(c); if (ra !== rc) parent[rc] = ra; };
    const seen = new Map<string, number>();
    for (let i = 0; i < n; i++) {
      const key = `${Math.round(pos.getX(i) * 1e5)},${Math.round(pos.getY(i) * 1e5)},${Math.round(pos.getZ(i) * 1e5)}`;
      const j = seen.get(key);
      if (j === undefined) seen.set(key, i); else join(j, i);
    }
    for (let t = 0; t < idx.length; t += 3) { join(idx[t], idx[t + 1]); join(idx[t], idx[t + 2]); }
    const groups = new Map<number, number[]>();
    for (let t = 0; t < idx.length; t += 3) {
      const r = find(idx[t]);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r)!.push(idx[t], idx[t + 1], idx[t + 2]);
    }
    for (const tris of groups.values()) {
      const p = g.clone();
      p.setIndex(tris);
      if (!p.attributes.normal) p.computeVertexNormals();
      out.push(new THREE.Mesh(p, m.material));
    }
  });
  const vol = (m: THREE.Mesh) => { m.geometry.computeBoundingBox(); const s = m.geometry.boundingBox!.getSize(new THREE.Vector3()); return s.x * s.y * s.z; };
  return out.sort((a, b) => vol(b) - vol(a));
};

/** re-centre a mesh's geometry on x/z with its base at y = 0, scaled so its longest side is `size` */
export const fit = (m: THREE.Mesh, size: number) => {
  const g = m.geometry; g.computeBoundingBox();
  const bb = g.boundingBox!, s = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
  g.translate(-c.x, -bb.min.y, -c.z);
  const k = size / Math.max(s.x, s.y, s.z);
  g.scale(k, k, k);
  g.computeBoundingBox();
  m.castShadow = true; m.receiveShadow = true;
  return m;
};

// ---------- the banknote: our own sheet (156 × 66.3 mm) with the BEP scans, gently curled ----------
export const BILL_W = 0.156, BILL_H = 0.0663;
let BILL_TEX: { front: THREE.Texture; back: THREE.Texture; bump: THREE.Texture } | null = null;
export const loadBillTex = async () => {
  if (BILL_TEX) return BILL_TEX;
  const L = new THREE.TextureLoader();
  const { staticFile } = await import('remotion');
  const [front, back] = await Promise.all(['tex/usd100_front.jpg', 'tex/usd100_back.jpg'].map((f) => L.loadAsync(staticFile(f))));
  for (const t of [front, back]) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; }
  back.wrapS = THREE.RepeatWrapping; back.repeat.x = -1; // seen from below, the back reads the right way round
  const bump = canvasTex(512, 256, (g) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${rnd(i, 1) > 0.5 ? '255,255,255' : '0,0,0'},${0.04 + rnd(i, 2) * 0.05})`; g.fillRect(rnd(i, 3) * 512, rnd(i, 4) * 256, 1 + rnd(i, 5) * 2, 1); }
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(256, 0); g.lineTo(250, 256); g.stroke(); // one old fold
  }, false);
  BILL_TEX = { front, back, bump };
  return BILL_TEX;
};

/** curl: lift of the long edges; wave: a soft ripple; fold: bend along the old centre fold */
export const billGeometry = (curl = 0.004, wave = 0.0012, fold = 0.003) => {
  const g = new THREE.PlaneGeometry(BILL_W, BILL_H, 64, 24);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const u = x / (BILL_W / 2), v = z / (BILL_H / 2);
    p.setY(i, curl * v * v + wave * Math.sin(u * 3.1 + v * 1.7) + fold * (1 - Math.abs(u)) * 0.6);
  }
  g.computeVertexNormals();
  return g;
};

export const Bill: React.FC<{ tex: NonNullable<typeof BILL_TEX>; position?: number[]; rotation?: number[]; scale?: number; curl?: number; glow?: number }> = ({ tex, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, curl = 0.004, glow = 0 }) => {
  const geo = useMemo(() => billGeometry(curl), [curl]);
  return (
    <group position={position as [number, number, number]} rotation={rotation as [number, number, number]} scale={scale}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial map={tex.front} bumpMap={tex.bump} bumpScale={0.6} roughness={0.78} side={THREE.FrontSide} emissive="#f6cf78" emissiveIntensity={glow} />
      </mesh>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial map={tex.back} bumpMap={tex.bump} bumpScale={0.6} roughness={0.8} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

// ---------- soft round sprite (steam, bokeh, dust) ----------
let SOFT: THREE.Texture | null = null;
export const softTex = () => SOFT ?? (SOFT = canvasTex(128, 128, (g) => {
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
}));
let DISC: THREE.Texture | null = null;
/** an out-of-focus highlight: a flat disc with a slightly brighter rim, like a real lens bokeh */
export const discTex = () => DISC ?? (DISC = canvasTex(128, 128, (g) => {
  const r = g.createRadialGradient(64, 64, 40, 64, 64, 62);
  r.addColorStop(0, 'rgba(255,255,255,0.55)'); r.addColorStop(0.85, 'rgba(255,255,255,0.8)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
}));

/** steam rising from a bowl: sprites on their own clock, drifting and widening */
export const Steam: React.FC<{ T: number; at: number[]; n?: number; o?: number; r?: number }> = ({ T, at, n = 16, o = 1, r = 0.06 }) => (
  <group position={at as [number, number, number]}>
    {Array.from({ length: n }, (_, i) => {
      const life = 2.6 + rnd(i, 1) * 1.4;
      const ph = ((T + rnd(i, 2) * life) % life) / life;
      const x = (rnd(i, 3) - 0.5) * r + Math.sin(T * 0.9 + i * 1.7) * 0.025 * ph;
      const z = (rnd(i, 4) - 0.5) * r + Math.cos(T * 0.7 + i) * 0.02 * ph;
      const s = 0.04 + ph * 0.12;
      return (
        <sprite key={i} position={[x, ph * 0.32, z]} scale={[s, s, s]}>
          <spriteMaterial map={softTex()} color="#fff4e6" transparent depthWrite={false} opacity={o * 0.09 * Math.sin(Math.PI * ph) * (0.6 + 0.4 * rnd(i, 5))} rotation={rnd(i, 6) * 6 + T * 0.2} />
        </sprite>
      );
    })}
  </group>
);

/** out-of-focus street lights behind the set */
export const Bokeh: React.FC<{ T: number; n?: number; z?: number; spread?: number; y?: number; o?: number; seed?: number; colors?: string[] }> = ({ T, n = 26, z = -3.2, spread = 5, y = 1.1, o = 1, seed = 1, colors = ['#ffb35c', '#ffcf8a', '#ff7a4a', '#ffd9a0', '#7fb2ff'] }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const s = 0.12 + rnd(i, seed + 1) * 0.3;
      const tw = 0.75 + 0.25 * Math.sin(T * (0.6 + rnd(i, seed + 2)) + i);
      return (
        <sprite key={i} position={[(rnd(i, seed + 3) - 0.5) * spread, y + (rnd(i, seed + 4) - 0.4) * 1.4, z - rnd(i, seed + 5) * 1.5]} scale={[s, s, s]}>
          <spriteMaterial map={discTex()} color={colors[i % colors.length]} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={o * tw * (0.18 + rnd(i, seed + 6) * 0.25)} toneMapped={false} />
        </sprite>
      );
    })}
  </group>
);

/** a pendant lamp: enamel shade, a glowing bulb, the cord; the light itself is placed by the scene */
export const Pendant: React.FC<{ position: number[]; on?: number }> = ({ position, on = 1 }) => (
  <group position={position as [number, number, number]}>
    <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.003, 0.003, 1.2, 6]} /><meshStandardMaterial color="#111" /></mesh>
    <mesh position={[0, 0.02, 0]}>
      <cylinderGeometry args={[0.03, 0.16, 0.13, 40, 1, true]} />
      <meshStandardMaterial color="#1f3a2e" roughness={0.35} metalness={0.3} side={THREE.FrontSide} />
    </mesh>
    <mesh position={[0, 0.02, 0]}>
      <cylinderGeometry args={[0.029, 0.159, 0.13, 40, 1, true]} />
      <meshStandardMaterial color="#f2e6d0" emissive="#ffd9a0" emissiveIntensity={0.25 * on} side={THREE.BackSide} />
    </mesh>
    <mesh position={[0, -0.03, 0]}><sphereGeometry args={[0.03, 20, 16]} /><meshBasicMaterial color={new THREE.Color('#ffd7a0').multiplyScalar(1 + 5 * on)} toneMapped={false} /></mesh>
  </group>
);

/** a neon shop sign, drawn soft (it is always far out of focus) */
export const Neon: React.FC<{ text: string; position: number[]; h?: number; color?: string; o?: number }> = ({ text, position, h = 0.5, color = '#ff4b3a', o = 1 }) => {
  const tex = useMemo(() => canvasTex(512, 256, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 512, 256);
    g.font = '900 170px "Noto Serif CJK SC", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.filter = 'blur(14px)'; g.fillStyle = color; g.fillText(text, 256, 136);
    g.filter = 'blur(5px)'; g.fillStyle = '#ffd0c4'; g.fillText(text, 256, 136);
  }), [text, color]);
  return (
    <mesh position={position as [number, number, number]}>
      <planeGeometry args={[h * 2, h]} />
      <meshBasicMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={o} toneMapped={false} />
    </mesh>
  );
};

/** a shadow-casting spot light whose target is really in the scene (r3f leaves light.target outside the graph) */
export const Spot: React.FC<{ position: number[]; target: number[]; angle: number; penumbra?: number; intensity: number; color: string; near?: number; far?: number; bias?: number; size?: number }> = ({ position, target, angle, penumbra = 0.7, intensity, color, near = 0.05, far = 5, bias = -0.0002, size = 2048 }) => {
  const tgt = useMemo(() => new THREE.Object3D(), []);
  tgt.position.set(target[0], target[1], target[2]);
  return (
    <>
      <primitive object={tgt} />
      <spotLight position={position as [number, number, number]} target={tgt} angle={angle} penumbra={penumbra} intensity={intensity} decay={2} color={color} castShadow
        shadow-mapSize-width={size} shadow-mapSize-height={size} shadow-bias={bias} shadow-camera-near={near} shadow-camera-far={far} />
    </>
  );
};

/** give chosen materials their own studio reflections (scene.environmentIntensity would brighten everything) */
const ROOM = new WeakMap<object, THREE.Texture>();
export const EnvFor: React.FC<{ mats: THREE.Material[]; intensity: number }> = ({ mats, intensity }) => {
  const { gl } = useThree();
  let t = ROOM.get(gl);
  if (!t) {
    const pm = new THREE.PMREMGenerator(gl);
    t = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    ROOM.set(gl, t);
  }
  mats.forEach((m) => { const s = m as THREE.MeshStandardMaterial; s.envMap = t!; s.envMapIntensity = intensity; s.needsUpdate = s.needsUpdate || false; });
  return null;
};
