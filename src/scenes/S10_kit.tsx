/* Agent C's shared helpers for S10–S15 (only used by those scenes).
   - Spot: a spotlight whose target lives in the scene's LOCAL space (a bare <spotLight> aims at the world origin,
     which is 100+ m away for these stages).
   - Row geometry: many identical cut-outs merged into one mesh (the S10 wall of fakes).
   - Caption: the small source line, top right, fading in/out.
   - Paths: rounded rects, pills, diamonds, the brand's italic J. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { font } from '../brand/lib';

export type V3 = [number, number, number];

/** a spot aimed at a point in local coordinates */
export const Spot: React.FC<{ p: V3; at: V3; i: number; color?: string; angle?: number; pen?: number; shadow?: boolean; map?: number }> =
  ({ p, at, i, color = '#fff0d8', angle = 0.4, pen = 0.7, shadow = false, map = 2048 }) => {
    const tgt = useMemo(() => new THREE.Object3D(), []);
    return (
      <>
        <primitive object={tgt} position={at} />
        <spotLight position={p} target={tgt} angle={angle} penumbra={pen} intensity={Math.max(0, i)} color={color} castShadow={shadow}
          shadow-mapSize={[map, map]} shadow-bias={-0.0004} shadow-camera-near={0.2} shadow-camera-far={14} />
      </>
    );
  };

/* ------------------------------------------------------------------ low-poly cut geometry + merging */
const lowCache = new Map<string, THREE.BufferGeometry>();
/** like foil.cutGeo but without bevel and with few curve segments (for crowds of far objects) */
export const lowGeo = (d: string, depth = 0.004, seg = 5) => {
  const key = `${d}|${depth}|${seg}`; const hit = lowCache.get(key); if (hit) return hit;
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
  const g = new THREE.ExtrudeGeometry(shapes, { depth: depth * 1000, bevelEnabled: false, curveSegments: seg });
  g.scale(0.001, -0.001, 0.001); g.computeVertexNormals();
  const ng = g.index ? g.toNonIndexed() : g;
  lowCache.set(key, ng); return ng;
};
const mergeCache = new Map<string, THREE.BufferGeometry>();
/** one geometry holding copies of a cut-out at many places: [x, y, z, scale] */
export const merged = (key: string, d: string, at: [number, number, number, number][], depth = 0.004, seg = 5) => {
  const k = `${key}|${at.length}`; const hit = mergeCache.get(k); if (hit) return hit;
  const base = lowGeo(d, depth, seg);
  const g = mergeGeometries(at.map(([x, y, z, s]) => base.clone().scale(s, s, s).translate(x, y, z)), false)!;
  mergeCache.set(k, g); return g;
};

/* ------------------------------------------------------------------ 2D: source caption (Overlay) */
export const Caption: React.FC<{ T: number; t0: number; t1: number; text: string }> = ({ T, t0, t1, text }) => {
  const k = Math.min(1, Math.max(0, (T - t0) / 0.3)) * (1 - Math.min(1, Math.max(0, (T - (t1 - 0.3)) / 0.3)));
  if (k <= 0) return null;
  return (
    <div style={{ position: 'absolute', top: 150, right: 56, fontFamily: font.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.04em',
      color: 'rgba(243,237,226,0.6)', opacity: k, textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontVariantNumeric: 'lining-nums' }}>{text}</div>
  );
};

/* ------------------------------------------------------------------ paths (px = mm, y down) */
/** rounded rectangle centred on (cx, cy) */
export const rrect = (cx: number, cy: number, w: number, h: number, r: number, ccw = false) => {
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2; r = Math.min(r, w / 2, h / 2);
  if (!ccw) return `M ${x0 + r} ${y0} L ${x1 - r} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y0 + r} L ${x1} ${y1 - r} A ${r} ${r} 0 0 1 ${x1 - r} ${y1} L ${x0 + r} ${y1} A ${r} ${r} 0 0 1 ${x0} ${y1 - r} L ${x0} ${y0 + r} A ${r} ${r} 0 0 1 ${x0 + r} ${y0} Z`;
  return `M ${x0 + r} ${y0} A ${r} ${r} 0 0 0 ${x0} ${y0 + r} L ${x0} ${y1 - r} A ${r} ${r} 0 0 0 ${x0 + r} ${y1} L ${x1 - r} ${y1} A ${r} ${r} 0 0 0 ${x1} ${y1 - r} L ${x1} ${y0 + r} A ${r} ${r} 0 0 0 ${x1 - r} ${y0} Z`;
};
/** a frame: rounded rect with a rounded-rect hole, stroke width t */
export const rframe = (cx: number, cy: number, w: number, h: number, r: number, t: number) => `${rrect(cx, cy, w, h, r)} ${rrect(cx, cy, w - 2 * t, h - 2 * t, Math.max(0.5, r - t), true)}`;
/** our emblem, the ◆ diamond (h = full height) */
export const diamond = (cx: number, cy: number, h: number, wk = 0.72) => `M ${cx} ${cy - h / 2} L ${cx + (h * wk) / 2} ${cy} L ${cx} ${cy + h / 2} L ${cx - (h * wk) / 2} ${cy} Z`;
/** a four-point spark */
export const spark = (cx: number, cy: number, r: number) => { const q = r * 0.22; return `M ${cx} ${cy - r} L ${cx + q} ${cy - q} L ${cx + r} ${cy} L ${cx + q} ${cy + q} L ${cx} ${cy + r} L ${cx - q} ${cy + q} L ${cx - r} ${cy} L ${cx - q} ${cy - q} Z`; };
/** the brand's italic J (Cormorant Garamond 500 italic outline), ~164 mm tall, centred on 0,0 */
export const J_PATH = 'M-34.6 81.8Q-35.0 82.0 -35.6 81.0Q-36.2 80.0 -35.6 79.6Q-26.2 74.0 -21.1 62.8Q-16.0 51.6 -13.0 35.2L4.8 -65.6Q6.4 -74.2 4.2 -76.8Q2.1 -79.4 -6.8 -79.4Q-7.2 -79.4 -7.2 -80.6Q-7.2 -81.8 -6.8 -81.8Q-2.6 -81.8 2.8 -81.5Q8.1 -81.2 14.1 -81.2Q20.7 -81.2 26.0 -81.5Q31.3 -81.8 35.2 -81.8Q35.8 -81.8 35.8 -80.6Q35.8 -79.4 35.2 -79.4Q29.4 -79.4 26.2 -78.2Q23.1 -77.0 21.7 -74.0Q20.3 -71.0 19.1 -65.2L2.2 29.8Q-0.6 45.4 -5.0 55.1Q-9.4 64.8 -16.5 70.9Q-23.6 77.0 -34.6 81.8Z';

/** an arc band (partial ring) from angle a0 to a1 (radians, 0 = right, clockwise in y-down) — for drawing a ring on */
export const arcBand = (r0: number, r1: number, a0: number, a1: number, n = 64) => {
  if (a1 - a0 < 0.002) return '';
  const pts: string[] = []; const N = Math.max(3, Math.ceil((n * (a1 - a0)) / (Math.PI * 2)));
  for (let i = 0; i <= N; i++) { const a = a0 + ((a1 - a0) * i) / N; pts.push(`${(Math.cos(a) * r1).toFixed(2)} ${(Math.sin(a) * r1).toFixed(2)}`); }
  for (let i = N; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / N; pts.push(`${(Math.cos(a) * r0).toFixed(2)} ${(Math.sin(a) * r0).toFixed(2)}`); }
  return `M ${pts.join(' L ')} Z`;
};

/** a dashed stitch along a cubic bezier (mm, y down) */
export const dashCubic = (p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number], dash = 7, gap = 6, w = 2.2, n = 60) => {
  const P = (u: number): [number, number] => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };
  const pts = Array.from({ length: n + 1 }, (_, i) => P(i / n)); const segs: string[] = []; let acc = 0, on = true, start = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; acc += Math.hypot(x1 - x0, y1 - y0);
    if (on && acc >= dash) { const ux = x1 - start[0], uy = y1 - start[1], L = Math.hypot(ux, uy) || 1, nx = (-uy / L) * w / 2, ny = (ux / L) * w / 2;
      segs.push(`M ${(start[0] + nx).toFixed(1)} ${(start[1] + ny).toFixed(1)} L ${(x1 + nx).toFixed(1)} ${(y1 + ny).toFixed(1)} L ${(x1 - nx).toFixed(1)} ${(y1 - ny).toFixed(1)} L ${(start[0] - nx).toFixed(1)} ${(start[1] - ny).toFixed(1)} Z`); on = false; acc = 0; }
    else if (!on && acc >= gap) { on = true; acc = 0; start = [x1, y1]; }
  }
  return segs.join(' ');
};

/** smooth 0..1 window: rises over [a, a+ri], falls over [b-fo, b] */
export const win = (T: number, a: number, b: number, ri = 0.3, fo = 0.3) =>
  Math.min(1, Math.max(0, (T - a) / ri)) * (1 - Math.min(1, Math.max(0, (T - (b - fo)) / fo)));
