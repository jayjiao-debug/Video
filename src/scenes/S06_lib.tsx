/* Helpers shared by scenes S06–S09 (agent B): stroked paths, a self-drawing light ribbon, crystal glass,
   folded-paper boxes, flame tongues, source captions. Paths are in px = mm, y down (like foil.tsx). */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { cutGeo, holoMat, mat } from '../foil';
import type { Kind } from '../foil';
import { font } from '../brand/lib';
import { prog, easeOut, clamp } from '../scene';

type P = [number, number];

/** a polyline as a band of quads (px), optionally dashed */
export const strokePath = (pts: P[], w = 3, dash = 0, gap = 0) => {
  const segs: string[] = [];
  const quad = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number) =>
    `M ${(ax + nx).toFixed(1)} ${(ay + ny).toFixed(1)} L ${(bx + nx).toFixed(1)} ${(by + ny).toFixed(1)} L ${(bx - nx).toFixed(1)} ${(by - ny).toFixed(1)} L ${(ax - nx).toFixed(1)} ${(ay - ny).toFixed(1)} Z`;
  let c0 = 0; const per = dash + gap;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0); if (L < 1e-6) continue;
    const ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = (-uy * w) / 2, ny = (ux * w) / 2;
    if (!dash) { const e = Math.min(0.6, w * 0.3); segs.push(quad(x0 - ux * e, y0 - uy * e, x1 + ux * e, y1 + uy * e, nx, ny)); c0 += L; continue; }
    for (let k = Math.floor(c0 / per); k * per < c0 + L; k++) {
      const a = Math.max(0, k * per - c0), b = Math.min(L, k * per + dash - c0);
      if (b - a > 0.4) segs.push(quad(x0 + ux * a, y0 + uy * a, x0 + ux * b, y0 + uy * b, nx, ny));
    }
    c0 += L;
  }
  return segs.join(' ');
};

/** sample helpers (px) */
export const cubicPts = (a: P, c1: P, c2: P, b: P, n = 20): P[] => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0], v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1]]; });
export const quadPts = (a: P, c: P, b: P, n = 16): P[] => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]; });
/** resample a polyline to even spacing (so dashes fall evenly) */
export const resample = (pts: P[], step: number): P[] => {
  const out: P[] = [pts[0]]; let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0); let s = step - acc;
    while (s <= L) { out.push([x0 + ((x1 - x0) * s) / L, y0 + ((y1 - y0) * s) / L]); s += step; }
    acc = (acc + L) % step;
  }
  out.push(pts[pts.length - 1]); return out;
};
/** the hero bag's silhouette as an open outline (body + handle), px */
export const bagOutline = (): P[][] => {
  const body: P[] = [[-142, 0], ...quadPts([-142, 0], [-160, 0], [-158, -18], 4).slice(1), [-132, -202], ...quadPts([-132, -202], [-130, -220], [-112, -220], 4).slice(1),
    [112, -220], ...quadPts([112, -220], [130, -220], [132, -202], 4).slice(1), [158, -18], ...quadPts([158, -18], [160, 0], [142, 0], 4).slice(1), [-142, 0]];
  const handle = cubicPts([-78, -222], [-80, -340], [80, -340], [78, -222], 28);
  const flap = [[-136, -222], [-138, -150], ...quadPts([-138, -150], [-122, -88], [0, -84], 10).slice(1), ...quadPts([0, -84], [122, -88], [138, -150], 10).slice(1), [136, -222]] as P[];
  return [body, handle, flap];
};

/** a self-drawing ribbon of light in the local XY plane (metres). pts in metres; u = 0..1 drawn */
export const Ribbon: React.FC<{ pts: [number, number][]; w: number; u: number; material: THREE.Material; z?: number }> = ({ pts, w, u, material, z = 0 }) => {
  const geo = useMemo(() => {
    const n = pts.length, pos = new Float32Array(n * 2 * 3), idx: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
      pos.set([pts[i][0] + nx, pts[i][1] + ny, 0, pts[i][0] - nx, pts[i][1] - ny, 0], i * 6);
      if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 2 * 3).map((_, k) => (k % 3 === 2 ? 1 : 0)), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2 * 2), 2));
    return g;
  }, [pts, w]);
  const count = Math.floor((pts.length - 1) * clamp(u)) * 6;
  geo.setDrawRange(0, count);
  return count > 0 ? <mesh geometry={geo} material={material} position={[0, 0, z]} frustumCulled={false} /> : null;
};

/** materials we own (so we may animate them without touching the shared cache) */
export const useGlow = (color: string, k: number) => useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), toneMapped: false, side: THREE.DoubleSide, transparent: true }), [color, k]);
export const useHolo = (k = 1.2) => useMemo(() => { const m = holoMat('#ffffff', k); m.side = THREE.DoubleSide; return m; }, [k]);

/** crystal: a nearly clear, very reflective sheet */
let _glass: THREE.Material | null = null;
export const glassMat = () => _glass ?? (_glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: 0.03, transparent: true, opacity: 0.055, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
/** a cut-out with any material */
export const CutM: React.FC<{ d: string; m: THREE.Material; depth?: number; bevel?: number; shadow?: boolean } & JSX.IntrinsicElements['group']> = ({ d, m, depth, bevel, shadow = true, ...g }) => {
  const geo = useMemo(() => cutGeo(d, depth, bevel), [d, depth, bevel]);
  return <group {...g}><mesh geometry={geo} material={m} castShadow={shadow} receiveShadow={shadow} /></group>;
};

/** a folded-paper box: w × h × d metres, standing on its base at the group origin */
export const Box: React.FC<{ w: number; h: number; d: number; kind?: Kind; color?: string } & JSX.IntrinsicElements['group']> = ({ w, h, d, kind = 'black', color, ...g }) => (
  <group {...g}><mesh position={[0, h / 2, 0]} castShadow receiveShadow material={mat(kind, color)}><boxGeometry args={[w, h, d]} /></mesh></group>
);

/** a flame tongue (px, base at 0, tip at -h), leaning by `lean` px */
export const flame = (w: number, h: number, lean = 0) =>
  `M ${-w / 2} 0 C ${-w * 0.56} ${-h * 0.3}, ${-w * 0.2 + lean * 0.3} ${-h * 0.55}, ${lean * 0.7} ${-h * 0.85} Q ${lean * 0.95} ${-h * 0.97} ${lean} ${-h} ` +
  `Q ${lean * 0.75} ${-h * 0.8} ${w * 0.22 + lean * 0.3} ${-h * 0.55} C ${w * 0.55} ${-h * 0.35}, ${w * 0.55} ${-h * 0.1}, ${w * 0.32} 0 Z`;

/** a rect hole, wound the other way (for plates with windows) */
export const rectHole = (x: number, y: number, w: number, h: number) => `M ${x} ${y} L ${x} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y} Z`;

/** monotone cubic through (t, v) knots (Fritsch–Carlson), clamped at the ends */
export const monotone = (knots: [number, number][]) => {
  const n = knots.length, xs = knots.map((k) => k[0]), ys = knots.map((k) => k[1]);
  const d = xs.slice(0, -1).map((x, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - x));
  const m = ys.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; } }
  return (x: number) => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
};

/** deterministic smooth noise on its own clock */
export const wob = (t: number, seed: number) => Math.sin(t * 1.7 + seed * 3.1) * 0.5 + Math.sin(t * 3.9 + seed * 7.7) * 0.3 + Math.sin(t * 8.3 + seed * 1.3) * 0.2;

/** a small source caption (top right, under the corner mark), fading in and out */
export const Caption: React.FC<{ T: number; t0: number; t1: number; text: string }> = ({ T, t0, t1, text }) => {
  const k = easeOut(prog(T, t0, t0 + 0.35)) * (1 - prog(T, t1 - 0.3, t1)); if (k <= 0) return null;
  return <div style={{ position: 'absolute', top: 150, right: 56, opacity: k, fontFamily: font.sans, fontWeight: 500, fontSize: 26, color: 'rgba(243,237,226,0.6)', letterSpacing: '0.04em', textShadow: '0 2px 10px rgba(0,0,0,0.9)', transform: `translateY(${(1 - k) * 8}px)`, fontVariantNumeric: 'lining-nums' }}>{text}</div>;
};
