import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { mulberry, clamp } from './lib';
import { PoseRig, Env, canvasTex } from './three-kit';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* The S1 dive as one continuous shot: an open mouth ("ah"), seen from outside, at roughly real scale (1 unit ≈ 3 mm),
   so the camera can fly in through the lips, down onto the tongue, onto one fungiform papilla and into its taste pore
   without a cut. The tongue's top carries the same micro relief as the close-up (filiform nubs, fungiform domes, the
   pore bead on the target dome at the origin). Stylised anatomy: lips, upper and lower front teeth, a dark oral
   cavity, the tongue with a rounded tip, rolled edges and a midline groove further back. No face beyond the lips. */

const bake = (g: THREE.BufferGeometry, mats: THREE.Matrix4[]) => mergeGeometries(mats.map((m) => g.clone().applyMatrix4(m)));
const smooth = (g: THREE.BufferGeometry) => { g.deleteAttribute('normal'); g.deleteAttribute('uv'); const m = mergeVertices(g); m.computeVertexNormals(); return m; };

// ------------------------------------------------------------------ the tongue
const H = (x: number, z: number) => 0.05 * Math.sin(x * 0.9 + 0.4) * Math.cos(z * 0.7) + 0.03 * Math.sin(x * 2.3 + z * 1.7);
const ZT = 6.2, ZB = -30, HW = 8.4; // tip, back, half width
const W = (z: number) => (z > ZT - 5 ? HW * Math.sqrt(Math.max(0, 1 - ((z - (ZT - 5)) / 5) ** 2)) : HW * (1 - 0.12 * clamp((ZT - 5 - z) / 30)));
const E = (s: number) => (s < 0.55 ? 0 : ((Math.min(s, 1.15) - 0.55) / 0.45) ** 2);
export const surf = (x: number, z: number) => {
  const w = W(z), u = w < 1e-4 ? 1 : Math.abs(x) / w;
  const tip = clamp((z - (ZT - 2.2)) / 2.2);
  const drop = -2.4 * E(Math.max(u, 0.55 + 0.45 * tip * tip));
  const crown = -0.016 * x * x;
  const slope = -0.07 * Math.max(0, z);
  const groove = -0.22 * Math.exp(-(x * x) / 1.2) * clamp((-z - 2) / 6);
  const back = z < -12 ? -0.02 * (z + 12) ** 2 : 0;
  return H(x, z) * (0.3 + 0.7 * Math.exp(-(x * x + z * z) / 30)) + crown + slope + groove + back + drop;
};
const tongueGeo = () => {
  const NU = 220, NV = 440;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= NV; j++) {
    const z = ZT - (j / NV) * (ZT - ZB);
    const w = W(z);
    for (let i = 0; i <= NU; i++) {
      const u = -1 + (2 * i) / NU;
      const x = u * w * (1 + 0.05 * E(Math.abs(u)));
      pos.push(x, surf(x, z), z); uv.push(x / 22 + 0.5, z / 22 + 0.5);
    }
  }
  for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
    const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
const normalAt = (x: number, z: number) => {
  const e = 0.02;
  return new THREE.Vector3(-(surf(x + e, z) - surf(x - e, z)) / (2 * e), 1, -(surf(x, z + e) - surf(x, z - e)) / (2 * e)).normalize();
};
const tongueTex = () => {
  const t = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#c95d6c'; g.fillRect(0, 0, 1024, 1024);
    const r = mulberry(21);
    for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? `rgba(130,35,55,${0.1 * r()})` : `rgba(255,200,200,${0.08 * r()})`; const s = 2 + r() * 10; g.beginPath(); g.arc(r() * 1024, r() * 1024, s, 0, 7); g.fill(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); return t;
};
/** the target papilla sits at the origin; its pore bead, world position */
export const DOME_Y = surf(0, 0) - 0.01;
export const PORE = [0, DOME_Y + 0.13 * 0.62 - 0.004, 0];
export const PORE_R = 0.012, DOME_R = 0.13;

// ------------------------------------------------------------------ the mouth around it
const YC = 3.5, A = 9, B = 5; // lip centreline: an ellipse around the opening
const zFace = (x: number, y: number) => {
  const philtrum = y > YC + B ? 0.22 * (Math.exp(-(((x - 0.9) / 0.45) ** 2)) + Math.exp(-(((x + 0.9) / 0.45) ** 2))) * Math.exp(-(((y - 11.2) / 2.0) ** 2)) : 0;
  return 11.2 - 0.0045 * x * x - 0.004 * (y - YC) ** 2 + 0.9 * Math.exp(-((x / 11) ** 2 + ((y - YC) / 7.5) ** 2)) + philtrum;
};
const lipR = (u: number) => { const s = Math.sin(u); return (s > 0 ? 1.15 : 1.45) * (0.22 + 0.78 * Math.pow(Math.abs(s), 0.55)); };
const lipsGeo = () => {
  const NU = 200, NP = 32, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NU; i++) {
    const u = (i / NU) * Math.PI * 2;
    const bow = Math.sin(u) > 0 ? -0.35 * Math.exp(-(((A * Math.cos(u)) / 1.3) ** 2)) : 0; // cupid's bow
    const cx = A * Math.cos(u), cy = YC + B * Math.sin(u) + bow, cz = zFace(cx, cy) + 0.25;
    const nx = Math.cos(u) / A, ny = Math.sin(u) / B, nl = Math.hypot(nx, ny);
    const r = lipR(u);
    for (let k = 0; k <= NP; k++) {
      const p = (k / NP) * Math.PI * 2;
      const o = Math.cos(p) * r * (Math.cos(p) > 0 ? 0.85 : 1), f = Math.sin(p) * r * 0.68;
      pos.push(cx + (nx / nl) * o, cy + (ny / nl) * o, cz + f);
    }
  }
  for (let i = 0; i < NU; i++) for (let k = 0; k < NP; k++) {
    const a = i * (NP + 1) + k, b = a + 1, c = a + NP + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = mergeVertices(g); m.computeVertexNormals(); return m;
};
const skinGeo = () => {
  const NU = 220, NS = 70, pos: number[] = [], col: number[] = [], idx: number[] = [];
  const base = new THREE.Color('#d6a08a'), lip = new THREE.Color('#c88472'), shade = new THREE.Color('#8e5a4a');
  for (let i = 0; i <= NU; i++) {
    const u = (i / NU) * Math.PI * 2;
    for (let k = 0; k <= NS; k++) {
      const s = k / NS, rho = 70 * Math.pow(s, 2.2);
      const x = (A + rho) * Math.cos(u), y = YC + (B + rho * 0.9) * Math.sin(u);
      pos.push(x, y, zFace(x, y));
      const c = base.clone().lerp(lip, Math.exp(-rho / 1.6) * 0.8).lerp(shade, 0.55 * Math.min(1, Math.max(0, (rho - 8) / 30)));
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < NU; i++) for (let k = 0; k < NS; k++) {
    const a = i * (NS + 1) + k, b = a + 1, c = a + NS + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals(); return g;
};
/** a rounded tooth: a squashed, slightly tapered blob */
const tooth = (hw: number, hh: number, hd: number, down: boolean) => {
  const g = smooth(new THREE.IcosahedronGeometry(1, 5));
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const edge = down ? -y : y; // the biting edge is flatter and a little wider
    const sq = 1 + 0.12 * edge;
    x *= hw * sq; z *= hd * (1 - 0.35 * Math.max(0, edge)); y = Math.sign(y) * Math.pow(Math.abs(y), 0.6) * hh;
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); return g;
};
const teethGeo = () => {
  const parts: THREE.BufferGeometry[] = [];
  const row = (list: [number, number, number][], hh: number, z0: number, k: number, down: boolean) => {
    for (const [ax, hw, edge] of list) for (const s of [-1, 1]) {
      const x = s * ax, z = z0 - k * x * x;
      const y = down ? edge + hh : edge - hh;
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(down ? -0.08 : 0.06, -Math.atan(2 * k * x), 0)), new THREE.Vector3(1, 1, 1));
      parts.push(tooth(hw, hh, 0.58, down).applyMatrix4(m));
    }
  };
  // upper: central, lateral, canine, premolar [x, half width, biting edge y]
  row([[1.42, 1.32, 5.25], [3.9, 1.05, 5.6], [6.05, 1.12, 5.4], [7.95, 0.98, 5.85]], 1.9, 9.9, 0.03, true);
  // lower, behind the lower lip
  row([[0.92, 0.85, 0.12], [2.7, 0.88, 0.2], [4.5, 0.95, 0.35], [6.35, 0.95, 0.5]], 1.5, 8.6, 0.035, false);
  return mergeGeometries(parts);
};

export const MouthDive: React.FC<{ pos: number[]; look: number[]; dist: number; fov: number }> = ({ pos, look, dist, fov }) => {
  const { width, height } = useVideoConfig();
  const d = useMemo(() => {
    const r = mulberry(4);
    // fungiform domes: denser toward the tip and the edges (as on a real tongue), never on the rolled edge
    const domes: THREE.Matrix4[] = [], spots: number[][] = [[0, 0, 1]];
    for (let i = 0; i < 2600 && spots.length < 190; i++) {
      const z = -14 + r() * (ZT - 0.8 + 14), x = (r() - 0.5) * 2 * W(z) * 0.55;
      const toTip = clamp((z + 4) / (ZT + 4)), edge = Math.abs(x) / Math.max(1, W(z));
      if (r() > 0.18 + 0.5 * toTip + 0.5 * edge) continue;
      if (Math.hypot(x, z) < 1.1) continue;
      if (spots.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 0.5)) continue;
      spots.push([x, z, 0.75 + r() * 0.35]);
    }
    const domeG = new THREE.SphereGeometry(DOME_R, 28, 18); domeG.scale(1, 0.62, 1);
    for (const [x, z, s] of spots.slice(1)) {
      const n = normalAt(x, z);
      domes.push(new THREE.Matrix4().compose(new THREE.Vector3(x, surf(x, z) - 0.018, z), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n), new THREE.Vector3(s, s, s)));
    }
    // filiform nubs around the target (only seen up close), thinning out with distance
    const fili: THREE.Matrix4[] = [];
    for (let i = 0; i < 16000; i++) {
      const x = (r() - 0.5) * 16, z = (r() - 0.5) * 16;
      const rr = Math.hypot(x, z);
      if (r() > 0.85 * Math.exp(-((rr / 5.5) ** 4))) continue;
      if (Math.abs(x) > 0.55 * W(z) || z > ZT - 1) continue;
      if (spots.some(([fx, fz, s]) => Math.hypot(x - fx, z - fz) < 0.16 * s + 0.05)) continue;
      const h = 0.7 + r() * 0.6;
      fili.push(new THREE.Matrix4().compose(new THREE.Vector3(x, surf(x, z) + 0.02 * h, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.35, 0, (r() - 0.5) * 0.35)), new THREE.Vector3(1, 1.8 * h, 1)));
    }
    const cavity = new THREE.SphereGeometry(1, 64, 48); cavity.scale(12.5, 9, 21); cavity.translate(0, 2, -10);
    return {
      tongue: tongueGeo(), tex: tongueTex(), domes: bake(domeG, domes), fili: bake(new THREE.SphereGeometry(0.026, 7, 5), fili),
      lips: lipsGeo(), skin: skinGeo(), teeth: teethGeo(), cavity,
    };
  }, []);
  // fog scales with how far the camera is from what it looks at: none outside the mouth, a soft falloff up close
  const fogN = 3 * dist, fogF = 14 * dist;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} camera={{ fov, near: 0.01, far: 200 }}>
        <PoseRig pos={pos} look={look} dist={dist} fov={fov} />
        <Env intensity={0.6} />
        <fog attach="fog" args={['#2a0d16', fogN, fogF]} />
        <color attach="background" args={['#2a0d16']} />
        <ambientLight intensity={0.22} color="#ffc0c8" />
        <directionalLight position={[-4, 9, 12]} intensity={1.5} color="#ffe9dc" />
        <directionalLight position={[3, 6, 4]} intensity={1.1} color="#ffe6d6" />
        <pointLight position={[-2, 1.2, 1]} intensity={3} color="#ff8fa0" />
        {/* the oral cavity */}
        <mesh geometry={d.cavity}><meshStandardMaterial color="#2a0911" roughness={0.9} side={THREE.BackSide} /></mesh>
        {/* face skin around the lips, lips, teeth */}
        <mesh geometry={d.skin}><meshPhysicalMaterial vertexColors roughness={0.55} sheen={0.5} sheenColor="#ffd9c8" sheenRoughness={0.6} side={THREE.DoubleSide} /></mesh>
        <mesh geometry={d.lips}><meshPhysicalMaterial side={THREE.DoubleSide} color="#b9535c" roughness={0.36} clearcoat={0.6} clearcoatRoughness={0.3} sheen={0.4} sheenColor="#ffc6c6" /></mesh>
        <mesh geometry={d.teeth}><meshPhysicalMaterial color="#efe8da" roughness={0.28} clearcoat={0.8} clearcoatRoughness={0.15} /></mesh>
        {/* the tongue and its papillae */}
        <mesh geometry={d.tongue}>
          <meshPhysicalMaterial map={d.tex} roughness={0.38} clearcoat={0.9} clearcoatRoughness={0.2} bumpMap={d.tex} bumpScale={1.5} />
        </mesh>
        <mesh geometry={d.fili}><meshPhysicalMaterial color="#c86577" roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.35} envMapIntensity={0.5} /></mesh>
        <mesh geometry={d.domes}><meshPhysicalMaterial color="#d84a60" roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} /></mesh>
        <group position={[0, DOME_Y, 0]}>
          <mesh scale={[1, 0.62, 1]}><sphereGeometry args={[DOME_R, 64, 40]} /><meshPhysicalMaterial color="#d84a60" roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} /></mesh>
          {/* the taste pore: a dark bead sunk into the dome's top (an intersection, not a decal, so it can't flicker) */}
          <mesh position={[0, PORE[1] - DOME_Y, 0]}><sphereGeometry args={[PORE_R, 32, 20]} /><meshStandardMaterial color="#3a0a14" roughness={0.6} /></mesh>
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
