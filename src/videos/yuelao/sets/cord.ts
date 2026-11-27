// THE FILM'S CORD IN THE SETS (v6, owner's notes 1 and 21 on v5: the threads looked "too 3D" and "unfitting"): every
// red thread a set lays out (the heap, hanks, lines across a room, loops on pegs, a thread on a desk) is drawn exactly
// like the threads the actors hold (props.ts thread): a braided cord in one of the film's reds with a lighter twist
// painted along it, its stripes a fixed 2.2 cm apart whatever its length, lit like the other props, and the kit's
// black back-face hull round it (Part.add(cordMat(..), cordGeo(..), CORD_INK)), so it reads as a drawn cord with an
// ink outline from any side. Nothing thinner than 1.2 cm across (r >= 0.006), as the kit's prop rules say.
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { paint } from "./common";

export const CORD_PERIOD = 0.022, CORD_INK = 0.0034, CORD_R = 0.0065;
/** the film's three reds: the cord, a deeper one, a lighter one */
export const CORD_REDS = ["#c8332b", "#a82228", "#d8483e"] as const;

/** the twist: two lighter strands and a dark groove winding round the cord (u along it, v round it) */
export const twistTex = (col: string) => {
  const t = paint(64, 16, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,190,170,0.42)";
    for (const o of [0, 32]) {
      g.beginPath(); g.moveTo(o, 0); g.lineTo(o + 14, 0); g.lineTo(o + 14 - 16, h); g.lineTo(o - 16, h); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(o + 64, 0); g.lineTo(o + 78, 0); g.lineTo(o + 62, h); g.lineTo(o + 48, h); g.closePath(); g.fill();
    }
    g.fillStyle = "rgba(60,8,6,0.35)";
    for (const o of [18, 50]) { g.beginPath(); g.moveTo(o, 0); g.lineTo(o + 4, 0); g.lineTo(o - 12, h); g.lineTo(o - 16, h); g.closePath(); g.fill(); }
  }) as THREE.Texture;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

const MATS = new WeakMap<Kit, Map<string, THREE.Material>>();
/** the cord's material in a colour (one per kit and colour) */
export const cordMat = (K: Kit, col: string = CORD_REDS[0]): THREE.Material => {
  let m = MATS.get(K); if (!m) MATS.set(K, (m = new Map()));
  let mat = m.get(col);
  if (!mat) { mat = K.flat("#ffffff", { map: twistTex(col), rough: 0.8 }); m.set(col, mat); }
  return mat;
};

/** a length of cord through `pts` (or along a curve): a tube whose twist keeps its 2.2 cm period */
export const cordGeo = (pts: THREE.Vector3[] | THREE.Curve<THREE.Vector3>, r = CORD_R, closed = false, seg?: number) => {
  const curve = Array.isArray(pts) ? new THREE.CatmullRomCurve3(pts, closed, "catmullrom", 0.5) : pts;
  const L = curve.getLength(), n = seg ?? Math.max(8, Math.min(260, Math.ceil(L / 0.014)));
  const g = new THREE.TubeGeometry(curve, n, Math.max(0.006, r), 7, closed);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) * L) / CORD_PERIOD);
  return g;
};

/** a ring of cord (a loop, a coil, a hank): radius R in its own xy plane, stretched sy along y */
export const cordRing = (R: number, r = CORD_R, sy = 1) => {
  const g = new THREE.TorusGeometry(R, Math.max(0.006, r), 7, Math.max(16, Math.min(64, Math.ceil((2 * Math.PI * R * Math.max(1, sy)) / 0.02))));
  const L = 2 * Math.PI * R * (1 + sy) / 2, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) * L) / CORD_PERIOD);
  if (sy !== 1) g.scale(1, sy, 1);
  return g;
};

/** points of a cord hanging between a and b with `sag` metres of droop at its middle */
export const sagPts = (a: THREE.Vector3, b: THREE.Vector3, sag: number, n = 14) => {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) { const u = i / n, p = a.clone().lerp(b, u); p.y -= sag * 4 * u * (1 - u); out.push(p); }
  return out;
};
