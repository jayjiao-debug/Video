import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { mulberry, type Key } from './lib';
import { CamRig, Env, canvasTex } from './three-kit';
import MOL from './molecules.json';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** many copies of one geometry baked into a single mesh (deterministic; no instancing state to set up) */
const bake = (g: THREE.BufferGeometry, mats: THREE.Matrix4[]) => mergeGeometries(mats.map((m) => g.clone().applyMatrix4(m)));

/* The micro world of S1: the tongue's surface, a taste bud, and the sweet receptor (T1R2 + T1R3) on a cell membrane.
   Stylised, not to scale: molecules are drawn about 6× larger than the receptor would make them, so they read.
   The sweet receptor is a dimer of T1R2 and T1R3; each subunit has a "Venus flytrap" domain on top (two lobes that
   close around a bound molecule) and seven helices through the membrane. Sugars and sweeteners such as aspartame bind
   in the flytrap of T1R2. Molecule geometry: RDKit 3D embedding of each molecule's structure (MMFF optimised). */

type Mol = { atoms: [string, number, number, number][]; bonds: [number, number, number][] };
export type MolName = 'sucrose' | 'aspartame' | 'sucralose';
const COL: Record<string, string> = { C: '#3b3f48', O: '#e0453a', N: '#4a7dff', H: '#eef0f4', Cl: '#5fd06a' };
const RAD: Record<string, number> = { C: 0.36, O: 0.36, N: 0.36, H: 0.24, Cl: 0.44 };

export const Molecule: React.FC<{ name: MolName; p: number[]; r: number[]; s: number; glow?: number }> = ({ name, p, r, s, glow = 0 }) => {
  const m = (MOL as unknown as Record<string, Mol>)[name];
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 24, 16), []);
  const stick = useMemo(() => new THREE.CylinderGeometry(0.11, 0.11, 1, 10), []);
  const sticks = useMemo(() => m.bonds.map(([a, z]) => {
    const A = new THREE.Vector3(m.atoms[a][1], m.atoms[a][2], m.atoms[a][3]), Z = new THREE.Vector3(m.atoms[z][1], m.atoms[z][2], m.atoms[z][3]);
    const mid = A.clone().add(Z).multiplyScalar(0.5), len = A.distanceTo(Z);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), Z.clone().sub(A).normalize());
    return { mid, len, q };
  }), [m]);
  return (
    <group position={[p[0], p[1], p[2]]} rotation={[r[0], r[1], r[2]]} scale={s}>
      {m.atoms.map(([el, x, y, z], i) => (
        <mesh key={i} geometry={sphere} position={[x, y, z]} scale={RAD[el] ?? 0.34}>
          <meshPhysicalMaterial color={COL[el] ?? '#999'} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} emissive="#f6cf78" emissiveIntensity={glow * 0.6} />
        </mesh>
      ))}
      {sticks.map((k, i) => (
        <mesh key={i} geometry={stick} position={k.mid} quaternion={k.q} scale={[1, k.len, 1]}>
          <meshStandardMaterial color="#c9ccd4" roughness={0.4} emissive="#f6cf78" emissiveIntensity={glow * 0.4} />
        </mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ shared organic shapes
/** a smooth, gently lumpy blob (protein / cell surface): an icosphere pushed along its normals by layered sines */
const blob = (rx: number, ry: number, rz: number, seed: number, amp = 0.05, detail = 6) => {
  const ico = new THREE.IcosahedronGeometry(1, detail);
  ico.deleteAttribute('normal'); ico.deleteAttribute('uv');
  const g = mergeVertices(ico); // shared vertices → smooth normals (the raw icosphere is faceted)
  const p = g.attributes.position as THREE.BufferAttribute;
  const r = mulberry(seed); const f = [r() * 6, r() * 6, r() * 6, r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = Math.sin(x * 3.1 + f[0]) * Math.sin(y * 2.7 + f[1]) * Math.sin(z * 3.3 + f[2]) + 0.5 * Math.sin(x * 6.3 + f[3]) * Math.sin(y * 5.9 + f[4]) * Math.sin(z * 6.7 + f[5]);
    const k = 1 + amp * n;
    p.setXYZ(i, x * rx * k, y * ry * k, z * rz * k);
  }
  g.computeVertexNormals();
  return g;
};

/** a closed spindle (a cell) bent along a curve: tapered at both ends, so it never shows an open end */
const spindle = (curve: THREE.Curve<THREE.Vector3>, radius: number, seg = 40, radial = 14) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= seg; i++) { const t = i / seg; pts.push(new THREE.Vector2(radius * Math.pow(Math.sin(Math.PI * t), 0.55) + 0.0005, t)); }
  const g = new THREE.LatheGeometry(pts, radial);
  const p = g.attributes.position as THREE.BufferAttribute;
  const frames = curve.computeFrenetFrames(seg * 2, false);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), t = Math.min(1, Math.max(0, p.getY(i))), z = p.getZ(i);
    const k = Math.round(t * seg * 2);
    const c = curve.getPointAt(t), N = frames.normals[k], B = frames.binormals[k];
    p.setXYZ(i, c.x + N.x * x + B.x * z, c.y + N.y * x + B.y * z, c.z + N.z * x + B.z * z);
  }
  g.computeVertexNormals();
  return g;
};

// ------------------------------------------------------------------ the tongue's surface
const H = (x: number, z: number) => 0.05 * Math.sin(x * 0.9 + 0.4) * Math.cos(z * 0.7) + 0.03 * Math.sin(x * 2.3 + z * 1.7);
const tongueTex = () => {
  const t = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#c95d6c'; g.fillRect(0, 0, 1024, 1024);
    const r = mulberry(21);
    for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? `rgba(130,35,55,${0.1 * r()})` : `rgba(255,200,200,${0.08 * r()})`; const s = 2 + r() * 10; g.beginPath(); g.arc(r() * 1024, r() * 1024, s, 0, 7); g.fill(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); return t;
};
export const TONGUE_TARGET = { y: H(0, 0) + 0.13 * 0.62 + 0.005 };

export const Tongue: React.FC<{ T: number; keys: Key[] }> = ({ T, keys }) => {
  const { width, height } = useVideoConfig();
  const data = useMemo(() => {
    const ground = new THREE.PlaneGeometry(22, 22, 220, 220); ground.rotateX(-Math.PI / 2);
    const gp = ground.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < gp.count; i++) gp.setY(i, H(gp.getX(i), gp.getZ(i)));
    ground.computeVertexNormals();
    const r = mulberry(4);
    const fili: THREE.Matrix4[] = [];
    const fung: number[][] = [[0, 0, 1.0]];
    for (let i = 0; i < 80; i++) { const x = (r() - 0.5) * 18, z = (r() - 0.5) * 18; if (Math.hypot(x, z) > 1.1) fung.push([x, z, 0.75 + r() * 0.35]); }
    for (let i = 0; i < 3600; i++) {
      const x = (r() - 0.5) * 18, z = (r() - 0.5) * 18;
      if (fung.some(([fx, fz, s]) => Math.hypot(x - fx, z - fz) < 0.16 * s + 0.05)) continue; // never inside a dome
      const h = 0.7 + r() * 0.6;
      fili.push(new THREE.Matrix4().compose(new THREE.Vector3(x, H(x, z) + 0.02 * h, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.35, 0, (r() - 0.5) * 0.35)), new THREE.Vector3(1, 1.5 * h, 1)));
    }
    return { ground, filiGeo: bake(new THREE.SphereGeometry(0.035, 10, 8), fili), fung, tex: tongueTex() };
  }, []);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} camera={{ fov: 34, near: 0.01, far: 60 }}>
        <CamRig T={T} keys={keys} fov={34} />
        <Env intensity={0.7} />
        <fog attach="fog" args={['#2a0d16', 3.5, 13]} />
        <color attach="background" args={['#2a0d16']} />
        <ambientLight intensity={0.25} color="#ffc0c8" />
        <directionalLight position={[3, 6, 4]} intensity={2.0} color="#ffe6d6" />
        <pointLight position={[-2, 1.2, 1]} intensity={3} color="#ff8fa0" />
        <mesh geometry={data.ground}>
          <meshPhysicalMaterial map={data.tex} roughness={0.38} clearcoat={0.9} clearcoatRoughness={0.2} bumpMap={data.tex} bumpScale={1.5} />
        </mesh>
        <mesh geometry={data.filiGeo}>
          <meshPhysicalMaterial color="#c86577" roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.35} envMapIntensity={0.5} />
        </mesh>
        {data.fung.map(([x, z, s], i) => (
          <group key={i} position={[x, H(x, z) - 0.01, z]} scale={s}>
            <mesh scale={[1, 0.62, 1]}><sphereGeometry args={[0.13, 48, 32]} /><meshPhysicalMaterial color="#d84a60" roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} /></mesh>
            {/* the taste pore: a dark bead sunk into the dome's top (an intersection, not a decal, so it can't flicker) */}
            {i === 0 && <mesh position={[0, 0.13 * 0.62 - 0.004, 0]}><sphereGeometry args={[0.012, 20, 14]} /><meshStandardMaterial color="#3a0a14" roughness={0.6} /></mesh>}
          </group>
        ))}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ a taste bud, cut open
export const BUD_PORE = [0, 1.18, 0];

export const Bud: React.FC<{ T: number; keys: Key[]; lit: number }> = ({ T, keys, lit }) => {
  const { width, height } = useVideoConfig();
  const geo = useMemo(() => {
    const r = mulberry(9);
    const plain: THREE.BufferGeometry[] = [], gold: THREE.BufferGeometry[] = [], hairs: THREE.Matrix4[] = [];
    const N = 34;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + r() * 0.08, ring = i % 2 ? 1 : 0.7, isGold = i % 6 === 2;
      const top = new THREE.Vector3(Math.cos(a) * 0.05, BUD_PORE[1] - 0.04, Math.sin(a) * 0.05);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(a) * 0.38 * ring, -1.15, Math.sin(a) * 0.38 * ring),
        new THREE.Vector3(Math.cos(a) * 0.82 * ring, -0.25, Math.sin(a) * 0.82 * ring),
        new THREE.Vector3(Math.cos(a) * 0.62 * ring, 0.6, Math.sin(a) * 0.62 * ring),
        top,
      ]);
      (isGold ? gold : plain).push(spindle(curve, 0.13 * (0.85 + 0.3 * r())));
      if (isGold) for (let k = 0; k < 3; k++) {
        const d = new THREE.Vector3((r() - 0.5) * 0.25, 1, (r() - 0.5) * 0.25).normalize();
        const m = new THREE.Matrix4().compose(top.clone().add(d.clone().multiplyScalar(0.045)), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d), new THREE.Vector3(1, 1, 1));
        hairs.push(m);
      }
    }
    // the surrounding lining: flattened cells in layers, only on the far side (we look into a cut)
    const lining: THREE.Matrix4[] = [];
    for (let row = 0; row < 7; row++) for (let k = 0; k < 16; k++) {
      const a = Math.PI * (1.08 + 0.84 * (k / 15)) + (row % 2) * 0.05, y = -1.25 + row * 0.38, rad = 1.25 + 0.15 * Math.sin(row);
      lining.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -a, 0)), new THREE.Vector3(1, 1, 1)));
    }
    // the surface around the pore
    const surface: THREE.Matrix4[] = [];
    for (let ring = 0; ring < 4; ring++) for (let k = 0; k < 10 + ring * 6; k++) {
      const a = (k / (10 + ring * 6)) * Math.PI * 2 + ring * 0.3, rad = 0.42 + ring * 0.34;
      surface.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * rad, BUD_PORE[1] + 0.02 - ring * 0.04, Math.sin(a) * rad), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)));
    }
    return {
      plain: mergeGeometries(plain), gold: mergeGeometries(gold),
      hairs: bake(new THREE.CapsuleGeometry(0.005, 0.08, 4, 8), hairs),
      lining: bake(blob(0.22, 0.2, 0.14, 3, 0.1, 4), lining),
      surface: bake(blob(0.19, 0.09, 0.17, 5, 0.1, 4), surface),
    };
  }, []);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} camera={{ fov: 32, near: 0.01, far: 60 }}>
        <CamRig T={T} keys={keys} fov={32} />
        <Env intensity={0.55} />
        <color attach="background" args={['#170711']} />
        <fog attach="fog" args={['#170711', 4.5, 13]} />
        <ambientLight intensity={0.25} color="#ffd0e0" />
        <directionalLight position={[2, 4, 3]} intensity={1.8} color="#ffe6da" />
        <pointLight position={[0, 1.7, 0.7]} intensity={2 + 7 * lit} color="#f6cf78" />
        <pointLight position={[-2.5, -0.5, 2]} intensity={2.5} color="#b06aff" />
        <mesh geometry={geo.plain}><meshPhysicalMaterial color="#cf7a95" roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.6} sheenColor="#ffd6e4" /></mesh>
        <mesh geometry={geo.gold}><meshPhysicalMaterial color="#e3ae5c" roughness={0.38} clearcoat={0.7} emissive="#f6cf78" emissiveIntensity={0.15 + 0.7 * lit} /></mesh>
        <mesh geometry={geo.hairs}><meshStandardMaterial color="#e9b45a" roughness={0.4} emissive="#f6cf78" emissiveIntensity={0.2 + 0.8 * lit} /></mesh>
        <mesh geometry={geo.lining}><meshPhysicalMaterial color="#7a2a46" roughness={0.6} clearcoat={0.3} sheen={0.5} sheenColor="#ff9fbf" /></mesh>
        <mesh geometry={geo.surface}><meshPhysicalMaterial color="#b85a74" roughness={0.4} clearcoat={0.7} /></mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the receptor on the membrane
const Subunit: React.FC<{ x: number; color: string; open: number; glow: number; pulse: number; seed: number }> = ({ x, color, open, glow, pulse, seed }) => {
  const g = useMemo(() => ({
    lower: blob(0.62, 0.3, 0.5, seed, 0.07),
    upper: blob(0.62, 0.3, 0.5, seed + 1, 0.07),
    linker: blob(0.17, 0.32, 0.17, seed + 2, 0.08, 4),
    cap: blob(0.46, 0.12, 0.46, seed + 3, 0.08, 4),
    helix: new THREE.CapsuleGeometry(0.085, 0.95, 6, 14),
  }), [seed]);
  const helices = Array.from({ length: 7 }, (_, i) => [Math.cos((i / 7) * Math.PI * 2) * 0.29, Math.sin((i / 7) * Math.PI * 2) * 0.29]);
  const mat = (e: number) => <meshPhysicalMaterial color={color} roughness={0.45} clearcoat={0.35} clearcoatRoughness={0.3} sheen={0.7} sheenColor="#ffffff" emissive="#f6cf78" emissiveIntensity={e} />;
  return (
    <group position={[x, 0, 0]}>
      {/* flytrap: lower lobe fixed, upper lobe hinged at its right end; open = cleft angle */}
      <group position={[0, 1.55, 0]}>
        <mesh geometry={g.lower} position={[0, -0.2, 0]}>{mat(glow)}</mesh>
        <group position={[0.46, -0.04, 0]} rotation={[0, 0, -open]}>
          <mesh geometry={g.upper} position={[-0.46, 0.2, 0]}>{mat(glow)}</mesh>
        </group>
      </group>
      <mesh geometry={g.linker} position={[0, 0.98, 0]}>{mat(glow * 0.6)}</mesh>
      {/* the extracellular loops join the helix tops to the linker */}
      <mesh geometry={g.cap} position={[0, 0.72, 0]}>{mat(glow * 0.4)}</mesh>
      {helices.map(([hx, hz], i) => (
        <mesh key={i} geometry={g.helix} position={[hx, 0.15, hz]} rotation={[0.1 * Math.sin(i * 1.7), 0, 0.1 * Math.cos(i * 1.7)]}>
          {mat(Math.max(0, 1 - Math.abs(pulse - (1 - (i % 3) * 0.1)) * 3) * 1.5)}
        </mesh>
      ))}
    </group>
  );
};

export const RECEPTOR = { cleft: [-0.92, 1.56, 0.08] }; // where a molecule docks (T1R2's flytrap)

export const Receptor: React.FC<{ T: number; keys: Key[]; open: number; glow: number; pulse: number; mols: { name: MolName; p: number[]; r: number[]; s: number; glow?: number }[] }> = ({ T, keys, open, glow, pulse, mols }) => {
  const { width, height } = useVideoConfig();
  const layers = useMemo(() => {
    const r = mulberry(17), up: number[][] = [];
    for (let i = -34; i <= 34; i++) for (let j = -22; j <= 8; j++) {
      const x = i * 0.2 + (r() - 0.5) * 0.04, z = j * 0.2 + (r() - 0.5) * 0.04;
      if (Math.hypot(x + 0.62, z) < 0.5 || Math.hypot(x - 0.62, z) < 0.5) continue; // room for the helices
      up.push([x, z]);
    }
    const sph = new THREE.SphereGeometry(0.095, 12, 8);
    return [0.66, -0.36].map((y) => bake(sph, up.map(([x, z]) => new THREE.Matrix4().makeTranslation(x, y, z))));
  }, []);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }} camera={{ fov: 30, near: 0.01, far: 60 }}>
        <CamRig T={T} keys={keys} fov={30} />
        <Env intensity={0.55} />
        <color attach="background" args={['#0a0716']} />
        <fog attach="fog" args={['#0a0716', 6, 15]} />
        <ambientLight intensity={0.2} color="#c8c0ff" />
        <directionalLight position={[3, 5, 4]} intensity={2.0} color="#fff0e0" />
        <pointLight position={[-2.5, 2.5, 2]} intensity={6} color="#7a8cff" />
        <pointLight position={[RECEPTOR.cleft[0], RECEPTOR.cleft[1], 0.8]} intensity={10 * glow} color="#f6cf78" />
        <mesh geometry={layers[0]}><meshPhysicalMaterial color="#8f86d8" roughness={0.3} clearcoat={0.8} /></mesh>
        <mesh geometry={layers[1]}><meshPhysicalMaterial color="#6a62b0" roughness={0.35} clearcoat={0.6} /></mesh>
        {/* the oily middle of the bilayer, wide enough that its ends sit in the fog */}
        <mesh position={[0, 0.15, -1.4]}><boxGeometry args={[14, 0.9, 6.2]} /><meshStandardMaterial color="#2b2550" transparent opacity={0.6} roughness={0.9} /></mesh>
        <Subunit x={-0.62} color="#3fb6a8" open={open} glow={glow * 0.5} pulse={pulse} seed={31} />
        <Subunit x={0.62} color="#9a6ad6" open={0.1} glow={glow * 0.25} pulse={pulse} seed={47} />
        {pulse > 0 && pulse < 1.6 && (
          <mesh position={[0, -0.6 - pulse * 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3 + pulse * 1.4, 0.36 + pulse * 1.45, 64]} />
            <meshBasicMaterial color="#f6cf78" transparent opacity={Math.max(0, 1 - pulse / 1.6)} side={THREE.DoubleSide} />
          </mesh>
        )}
        {mols.map((m, i) => <Molecule key={i} {...m} />)}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
