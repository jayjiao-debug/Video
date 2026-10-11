/* Agent A's small helpers for S03–S05 (scene-local; nothing shared is edited).
   Spot: a spotlight with a real target (the default target sits at the WORLD origin, 28+ m away).
   GLine / GArc: self-drawing light lines for the blueprint (gold wire / holo). Caption: the small source note. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { holoMat } from '../foil';
import { prog } from '../scene';
import { font } from '../brand/lib';

type V3 = [number, number, number];

export const Spot: React.FC<{ pos: V3; at: V3; intensity: number; color?: string; angle?: number; penumbra?: number; shadow?: boolean; decay?: number; distance?: number }> =
  ({ pos, at, intensity, color = '#fff0d8', angle = 0.5, penumbra = 0.7, shadow = false, decay = 2, distance = 0 }) => {
    const tgt = useMemo(() => new THREE.Object3D(), []);
    return (
      <>
        <primitive object={tgt} position={at} />
        <spotLight position={pos} target={tgt} intensity={intensity} color={color} angle={angle} penumbra={penumbra} decay={decay} distance={distance}
          castShadow={shadow} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.002} />
      </>
    );
  };

/** emissive line colour, cached by quantised brightness */
const gcache = new Map<string, THREE.Material>();
export const glowMat = (color: string, k: number, add = false) => {
  const q = Math.round(k * 20) / 20, key = `${color}|${q}|${add}`; const h = gcache.get(key); if (h) return h;
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(q), toneMapped: false, transparent: add, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !add, side: THREE.DoubleSide });
  gcache.set(key, m); return m;
};
let _holoLine: THREE.Material | null = null;
export const holoLine = () => _holoLine ?? (_holoLine = holoMat('#ffffff', 1.5));

/** a straight line from a to b (metres, in the group's plane), drawn to fraction k */
export const GLine: React.FC<{ a: [number, number]; b: [number, number]; k: number; w?: number; color?: string; bright?: number; holo?: boolean; z?: number }> =
  ({ a, b, k, w = 0.0022, color = '#f0c46a', bright = 1, holo = false, z = 0 }) => {
    if (k <= 0.001) return null;
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
    return (
      <group position={[a[0], a[1], z]} rotation={[0, 0, ang]}>
        <mesh position={[(L * k) / 2, 0, 0]} material={holo ? holoLine() : glowMat(color, bright)}><planeGeometry args={[L * k, w]} /></mesh>
      </group>
    );
  };

/** an arc of radius r (centre at the group origin), from angle a0 (rad, 0 = +x, CCW) sweeping len*k */
export const GArc: React.FC<{ r: number; a0: number; len: number; k: number; w?: number; color?: string; bright?: number; holo?: boolean; z?: number; c?: [number, number] }> =
  ({ r, a0, len, k, w = 0.0022, color = '#f0c46a', bright = 1, holo = false, z = 0, c = [0, 0] }) => {
    if (k <= 0.001) return null;
    const segs = Math.max(8, Math.round(96 * Math.abs(len * k) / (Math.PI * 2)) + 4);
    const L = Math.round(len * k * 400) / 400;
    return (
      <mesh position={[c[0], c[1], z]} material={holo ? holoLine() : glowMat(color, bright)}>
        <ringGeometry args={[r - w / 2, r + w / 2, segs, 1, a0, L]} />
      </mesh>
    );
  };

/** the small source caption, top right under the corner mark */
export const Caption: React.FC<{ T: number; t0: number; t1: number; text: string }> = ({ T, t0, t1, text }) => {
  const o = prog(T, t0, t0 + 0.4) * (1 - prog(T, t1 - 0.4, t1)); if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', top: 150, right: 56, fontFamily: font.sans, fontWeight: 500, fontSize: 26, color: 'rgba(243,237,226,0.6)', opacity: o,
      letterSpacing: '0.04em', textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontVariantNumeric: 'lining-nums' }}>{text}</div>
  );
};

/** deterministic hash 0..1 */
export const hash = (i: number, k = 1) => { const s = Math.sin((i + 1) * (k + 3.17) * 12.9898) * 43758.5453; return s - Math.floor(s); };

/** a ribbon along a 2D polyline (metres), drawn to fraction k with drawRange (geometry built once) */
export const Ribbon: React.FC<{ pts: [number, number][]; k: number; w?: number; color?: string; bright?: number; holo?: boolean; z?: number }> =
  ({ pts: pts0, k, w = 0.0022, color = '#f0c46a', bright = 1, holo = false, z = 0 }) => {
    const geo = useMemo(() => {
      // resample to equal steps so k is proportional to length
      const cum = [0]; for (let i = 1; i < pts0.length; i++) cum.push(cum[i - 1] + Math.hypot(pts0[i][0] - pts0[i - 1][0], pts0[i][1] - pts0[i - 1][1]));
      const Ltot = cum[cum.length - 1], N = Math.max(8, Math.ceil(Ltot / 0.004)), pts: [number, number][] = [];
      for (let j = 0, i = 0; j <= N; j++) { const s = (j / N) * Ltot; while (i < pts0.length - 2 && cum[i + 1] < s) i++; const u = (s - cum[i]) / ((cum[i + 1] - cum[i]) || 1); pts.push([pts0[i][0] + (pts0[i + 1][0] - pts0[i][0]) * u, pts0[i][1] + (pts0[i + 1][1] - pts0[i][1]) * u]); }
      const pos: number[] = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = (-(y1 - y0) / L) * w / 2, ny = ((x1 - x0) / L) * w / 2;
        pos.push(x0 + nx, y0 + ny, 0, x0 - nx, y0 - ny, 0, x1 + nx, y1 + ny, 0, x1 + nx, y1 + ny, 0, x0 - nx, y0 - ny, 0, x1 - nx, y1 - ny, 0);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 2 ? 1 : 0)), 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
      return { g, n: pts.length - 1 };
    }, [pts0, w]);
    if (k <= 0.001) return null;
    geo.g.setDrawRange(0, Math.max(6, Math.round(geo.n * Math.min(1, k)) * 6));
    return <mesh geometry={geo.g} position={[0, 0, z]} material={holo ? holoLine() : glowMat(color, bright)} frustumCulled={false} />;
  };
/** points along an arc (centre c, radius r, from a0 sweeping len) */
export const arcPts = (c: [number, number], r: number, a0: number, len: number, n = 64): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (len * i) / n; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]; });
