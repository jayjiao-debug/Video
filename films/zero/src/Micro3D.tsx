import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { mulberry, type Key } from './lib';
import { CamRig, Env, canvasTex } from './three-kit';
import MOL from './molecules.json';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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

// ------------------------------------------------------------------ the tongue's surface
const tongueTex = () => {
  const t = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#c45a68'; g.fillRect(0, 0, 1024, 1024);
    const r = mulberry(21);
    for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? `rgba(120,30,50,${0.12 * r()})` : `rgba(255,190,190,${0.1 * r()})`; const s = 2 + r() * 10; g.beginPath(); g.arc(r() * 1024, r() * 1024, s, 0, 7); g.fill(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t;
};

export const Tongue: React.FC<{ T: number; keys: Key[] }> = ({ T, keys }) => {
  const { width, height } = useVideoConfig();
  const data = useMemo(() => {
    const r = mulberry(4);
    const fili: THREE.Matrix4[] = [], fung: number[][] = [];
    for (let i = 0; i < 2600; i++) {
      const x = (r() - 0.5) * 16, z = (r() - 0.5) * 16;
      if (Math.hypot(x, z) < 0.35) continue;
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, 0.06, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5)), new THREE.Vector3(1, 0.7 + r() * 0.8, 1));
      fili.push(m);
    }
    fung.push([0, 0]);
    for (let i = 0; i < 70; i++) { const x = (r() - 0.5) * 16, z = (r() - 0.5) * 16; if (Math.hypot(x, z) > 1.2) fung.push([x, z]); }
    return { fili, fung, tex: tongueTex() };
  }, []);
  const filiGeo = useMemo(() => bake(new THREE.ConeGeometry(0.045, 0.1, 9), data.fili), [data]);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} camera={{ fov: 34, near: 0.01, far: 60 }}>
        <CamRig T={T} keys={keys} fov={34} />
        <Env intensity={0.6} />
        <fog attach="fog" args={['#2a0d16', 4, 14]} />
        <color attach="background" args={['#2a0d16']} />
        <ambientLight intensity={0.3} color="#ffc0c8" />
        <directionalLight position={[3, 6, 4]} intensity={2.2} color="#ffe2cf" />
        <pointLight position={[-2, 1.2, 1]} intensity={4} color="#ff8fa0" />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshPhysicalMaterial map={data.tex} roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.25} bumpMap={data.tex} bumpScale={2} />
        </mesh>
        <mesh geometry={filiGeo}>
          <meshPhysicalMaterial color="#e39aa6" roughness={0.45} clearcoat={0.5} />
        </mesh>
        {data.fung.map(([x, z], i) => (
          <group key={i} position={[x, 0, z]} scale={i === 0 ? 1.25 : 0.8 + (i % 5) * 0.08}>
            <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.08, 0.1, 0.12, 20]} /><meshPhysicalMaterial color="#d0485c" roughness={0.3} clearcoat={1} /></mesh>
            <mesh position={[0, 0.14, 0]} scale={[1, 0.62, 1]}><sphereGeometry args={[0.15, 32, 20]} /><meshPhysicalMaterial color="#e2566a" roughness={0.22} clearcoat={1} clearcoatRoughness={0.1} /></mesh>
            {i === 0 && <mesh position={[0, 0.233, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.022, 24]} /><meshBasicMaterial color="#3a0a14" /></mesh>}
          </group>
        ))}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ a taste bud, cut open
export const Bud: React.FC<{ T: number; keys: Key[]; lit: number }> = ({ T, keys, lit }) => {
  const { width, height } = useVideoConfig();
  const cells = useMemo(() => {
    const r = mulberry(9), out: { geo: THREE.TubeGeometry; gold: boolean }[] = [];
    const N = 46;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + r() * 0.1, ring = i % 2 ? 1 : 0.72;
      const c = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(a) * 0.55 * ring, -1.3, Math.sin(a) * 0.55 * ring),
        new THREE.Vector3(Math.cos(a) * 0.95 * ring, -0.3, Math.sin(a) * 0.95 * ring),
        new THREE.Vector3(Math.cos(a) * 0.7 * ring, 0.6, Math.sin(a) * 0.7 * ring),
        new THREE.Vector3(Math.cos(a) * 0.08, 1.25, Math.sin(a) * 0.08),
      ]);
      out.push({ geo: new THREE.TubeGeometry(c, 40, 0.11 * (0.8 + 0.3 * r()), 12, false), gold: i % 7 === 3 });
    }
    return out;
  }, []);
  const villi = useMemo(() => Array.from({ length: 22 }, (_, i) => { const r = mulberry(i + 40); return [(r() - 0.5) * 0.22, 1.32 + r() * 0.15, (r() - 0.5) * 0.22, r() * 0.3]; }), []);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }} camera={{ fov: 32, near: 0.01, far: 60 }}>
        <CamRig T={T} keys={keys} fov={32} />
        <Env intensity={0.5} />
        <color attach="background" args={['#14060f']} />
        <fog attach="fog" args={['#14060f', 5, 14]} />
        <ambientLight intensity={0.25} color="#ffd0e0" />
        <directionalLight position={[2, 4, 3]} intensity={2} color="#ffe6da" />
        <pointLight position={[0, 1.8, 0.6]} intensity={3 + 6 * lit} color="#f6cf78" />
        {cells.map((c, i) => (
          <mesh key={i} geometry={c.geo}>
            <meshPhysicalMaterial color={c.gold ? '#e9b45a' : '#c9708c'} roughness={0.35} clearcoat={0.7} transparent opacity={0.92} emissive={c.gold ? '#f6cf78' : '#000'} emissiveIntensity={c.gold ? 0.25 + 0.8 * lit : 0} />
          </mesh>
        ))}
        {villi.map(([x, y, z, tilt], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[tilt, 0, tilt * 0.6]}><cylinderGeometry args={[0.012, 0.012, 0.22, 6]} /><meshStandardMaterial color="#f3c6d2" emissive="#f6cf78" emissiveIntensity={0.3 * lit} /></mesh>
        ))}
        {/* the surrounding tissue: a cut wall behind the bud */}
        <mesh position={[0, 0, -1.6]}><planeGeometry args={[12, 8]} /><meshStandardMaterial color="#4a1426" roughness={0.8} /></mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the receptor on the membrane
const Subunit: React.FC<{ x: number; color: string; open: number; glow: number; pulse: number }> = ({ x, color, open, glow, pulse }) => {
  const helices = Array.from({ length: 7 }, (_, i) => [Math.cos((i / 7) * Math.PI * 2) * 0.3, Math.sin((i / 7) * Math.PI * 2) * 0.3]);
  return (
    <group position={[x, 0, 0]}>
      {/* flytrap: lower lobe fixed, upper lobe hinged on the right; open = cleft angle */}
      <group position={[0, 1.55, 0]}>
        <mesh position={[0, -0.2, 0]} scale={[0.62, 0.3, 0.5]}><sphereGeometry args={[1, 40, 28]} /><meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} emissive="#f6cf78" emissiveIntensity={glow} /></mesh>
        <group position={[0.5, -0.05, 0]} rotation={[0, 0, -open]}>
          <mesh position={[-0.5, 0.2, 0]} scale={[0.62, 0.3, 0.5]}><sphereGeometry args={[1, 40, 28]} /><meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} emissive="#f6cf78" emissiveIntensity={glow} /></mesh>
        </group>
      </group>
      {/* linker */}
      <mesh position={[0, 0.95, 0]}><cylinderGeometry args={[0.12, 0.16, 0.5, 16]} /><meshPhysicalMaterial color={color} roughness={0.4} emissive="#f6cf78" emissiveIntensity={glow * 0.6} /></mesh>
      {/* seven helices through the membrane */}
      {helices.map(([hx, hz], i) => (
        <mesh key={i} position={[hx, 0.15, hz]} rotation={[0.12 * Math.sin(i), 0, 0.12 * Math.cos(i)]}>
          <cylinderGeometry args={[0.085, 0.085, 1.1, 14]} />
          <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.5} emissive="#f6cf78" emissiveIntensity={Math.max(0, 1 - Math.abs(pulse - (1 - (i % 3) * 0.1)) * 3) * 1.5} />
        </mesh>
      ))}
    </group>
  );
};

export const RECEPTOR = { cleft: [-0.92, 1.56, 0.08] }; // where a molecule docks (T1R2's flytrap)

export const Receptor: React.FC<{ T: number; keys: Key[]; open: number; glow: number; pulse: number; mols: { name: MolName; p: number[]; r: number[]; s: number; glow?: number }[] }> = ({ T, keys, open, glow, pulse, mols }) => {
  const { width, height } = useVideoConfig();
  const heads = useMemo(() => {
    const r = mulberry(17), up: number[][] = [];
    for (let i = -18; i <= 18; i++) for (let j = -10; j <= 6; j++) {
      const x = i * 0.2 + (r() - 0.5) * 0.04, z = j * 0.2 + (r() - 0.5) * 0.04;
      if (Math.hypot(x + 0.62, z) < 0.42 || Math.hypot(x - 0.62, z) < 0.42) continue; // holes for the helices
      up.push([x, z]);
    }
    return up;
  }, []);
  const layers = useMemo(() => {
    const sph = new THREE.SphereGeometry(0.095, 12, 8);
    return [0.66, -0.36].map((y) => bake(sph, heads.map(([x, z]) => new THREE.Matrix4().makeTranslation(x, y, z))));
  }, [heads]);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }} camera={{ fov: 30, near: 0.01, far: 60 }}>
        <CamRig T={T} keys={keys} fov={30} />
        <Env intensity={0.55} />
        <color attach="background" args={['#0a0716']} />
        <fog attach="fog" args={['#0a0716', 6, 16]} />
        <ambientLight intensity={0.2} color="#c8c0ff" />
        <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff0e0" />
        <pointLight position={[-2.5, 2.5, 2]} intensity={6} color="#7a8cff" />
        <pointLight position={[RECEPTOR.cleft[0], RECEPTOR.cleft[1], 0.8]} intensity={10 * glow} color="#f6cf78" />
        <mesh geometry={layers[0]}><meshPhysicalMaterial color="#8f86d8" roughness={0.3} clearcoat={0.8} /></mesh>
        <mesh geometry={layers[1]}><meshPhysicalMaterial color="#6a62b0" roughness={0.35} clearcoat={0.6} /></mesh>
        {/* the oily middle of the bilayer */}
        <mesh position={[0, 0.15, -0.8]}><boxGeometry args={[7.4, 0.9, 3.4]} /><meshStandardMaterial color="#2b2550" transparent opacity={0.55} roughness={0.9} /></mesh>
        <Subunit x={-0.62} color="#3fb6a8" open={open} glow={glow * 0.5} pulse={pulse} />
        <Subunit x={0.62} color="#9a6ad6" open={0.08} glow={glow * 0.25} pulse={pulse} />
        {/* the signal leaving the cell */}
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
