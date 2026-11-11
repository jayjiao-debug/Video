// "arthur" set: the one world strip of 《石中剑》 (BIBLE.md), built in code. Metres, y up, ground y = 0 everywhere a
// figure can stand (the paved circle, the path and the street are cut INTO the ground mesh, not laid on it). The
// camera lives on the +z side (z +2 .. +10, eye level) and looks toward -z.
//
//   FIELD  x -34 .. -11   striped pavilions along z = -6.3 (x -29, -24.8, -20.4, -15.6) with a paler second row behind,
//                         pennant poles and bunting between them, the tilt fence along z = -2.5 (x -32 .. -12), straw
//                         bales, a rack of lances and shields at the fence's east end. Kay's mark (-18, 0, 2.6).
//   YARD   x -9.5 .. 9.5  the church's west front at z = -9 (x -8 .. 8, 12.5 m to the eaves, 16.5 m gable): a darker,
//                         cooler lower zone to the string course (y 2.7), the round-arched portal with oak doors at
//                         x = 0 (3 m x 4.2 m), a wheel window above it (centre y 6.15), buttresses at x = +-3.2 and the
//                         corners, two lancets. Low walls (0.5 m thick, 1.14 m + a ridged coping to 1.36 m) at
//                         x = +-9.5 from z = -10.5 to 1.2 with gate piers (0.8 m square, 2.3 m with the pyramid cap) at
//                         z = 1.5; three trees, two flat slabs and a stone bench by the walls, low shrubs at the wall
//                         feet (seasons 2, 3; snow drifts there in 0, 1). A paved circle (radius 2.6 m) at the
//                         origin: EMPTY, the stone / anvil / sword are props.ts.
//   HOUSE  x 11 .. 23     the timber-framed lodging: facade z = -3.25 (x 12.5 .. 21.5), the upper floor jettied to
//                         z = -2.9, a steep tiled roof (ridge 8.7 m); the oak door at x = 17 (1.1 x 2.0 m, its face at
//                         z = -3.2) with iron bands, a ring handle, a hasp and a big iron padlock; closed shutters, a
//                         lantern, a barrel (x 15.35) and a bench (x 18.6 .. 20.2). A garden wall closes x 9.7 .. 12.5,
//                         a plain neighbour x 21.6 .. 29.6.
//   the path z 2.5 .. 4.5 through all three zones; it widens into the street in front of the house (x 9.6 .. 30).
//   Sky: a gradient dome, six drifting clouds, a painted far skyline on a cylinder (all NOINK), a few plain houses
//   and trees in the middle distance.
//
// Use:
//   const M = mats(makeEnv(gl), makeEnv(gl, YARD_FILL));
//   const set = buildYard(M);  scene.add(set.group, ...set.lights);  scene.background = new THREE.Color(set.bg(k));
//   set.setSeason(k);  per frame: set.setFocus(x, z) (where the action is), set.animate(t).
//   film camera: enable vasa/ink NOINK; gl.shadowMap.type = LIGHTS.shadow.type; N8AO per YARD_AO; NEUTRAL tone mapping.
// Seasons (each must read at a glance in the main shot, where no tree and no sky shows): 0 deep winter (snow ground,
//   white copings / caps on walls, roofs, fence, drifts at the wall feet, bare trees, falling snow), 1 late winter
//   (thaw: earth with snow patches, low drifts, grey sky, weak sun), 2 spring (pale fresh grass with daisies, blossom
//   on trees and shrubs, a few pink petals drifting by), 3 early summer (deep green, full crowns, red roses on the
//   shrubs, warm strong light).
// Ink: nothing in the set overhangs or steps by a few cm at or above eye level (copings, caps and snow covers are
//   flush with what they sit on): such slivers come out of the ink pass as dashed lines. Thin round things are either
//   under 3 cm (the bunting rope: one solid ink line) or over 8 cm (lances, poles: two lines and a colour core).
// Light: the sun is in front-left of the camera (YARD_SUN.dir), so everything that faces the camera is lit and shadows
//   fall away to the right back. Its shadow frustum (17 m wide, taller toward the back so walls behind the action keep
//   their shadows) follows setFocus, snapped to whole shadow texels so the shadows do not crawl in a travelling shot.
// Determinism: seeded RNG only; animate(t) is a pure function of t (and of the last setFocus for the snow box).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LIGHTS, type EnvSpec, type Mats } from "../../bt/pbr";
import { NOINK } from "../../vasa/ink";
import * as P from "./yard_paint";

type V3 = [number, number, number];
export type Season = 0 | 1 | 2 | 3;

// =====================================================================================================================
// light
// =====================================================================================================================
/** outdoor fill for wood / paint: blue sky above, a bright haze at the horizon, a pale neutral ground bounce below (it
 *  has to serve snow and grass), a soft warm glow round the sun */
export const YARD_FILL: EnvSpec = {
  frame: "world",
  stops: [
    [-90, [0.5, 0.5, 0.55]], [-25, [0.52, 0.53, 0.6]], [-3, [0.6, 0.64, 0.74]], [4, [0.84, 0.9, 1.0]],
    [30, [0.64, 0.75, 0.98]], [90, [0.5, 0.64, 0.98]],
  ],
  boxes: [{ az: 127, el: 33, rot: 0, w: 36, h: 18, soft: 14, col: [1.0, 0.95, 0.86] }],
};
export const YARD_AO = { aoRadius: 0.6, distanceFalloff: 1.0, intensity: 1.9, color: "#2b2a4a" };
/** toward the sun: low, from the camera's upper left front */
export const YARD_SUN = { dir: [-0.4997, 0.5496, 0.6695] as V3, intensity: 2.4, color: "#ffe9c8" };
/** group/kit/cast CastLight for the rig figures (structural copy of LAB_CAST_LIGHT, so the set does not import the
 *  cast kit): key = YARD_SUN.dir, clean daylight on the lit side, lavender shade, a sunlit-ground contact shadow */
export const YARD_CAST_LIGHT = {
  key: [-0.4997, 0.5496, 0.6695] as V3, tint: [1.0, 0.99, 0.97] as V3, tintK: 1, gain: 1.0, grad: 0.22, bodyGrad: 0.16, sideTint: [0.93, 0.94, 0.98] as V3,
  shade: [1.04, 0.95, 1.32] as V3, shadeK: 0.3, bodyShadeK: 0.4, wrap: [26, 52] as [number, number], edge: 0.13, broad: 0, bodySat: 0.12, sheen: 0.08, lift: 0,
  bleach: 0.7, contact: "#8a93c2", contactLen: 0.55,
};

export type YardSet = {
  group: THREE.Group;
  lights: THREE.Object3D[];
  anchors: {
    stone: THREE.Vector3; portal: THREE.Vector3; kay: THREE.Vector3; fieldCrowd: THREE.Vector3[];
    door: THREE.Vector3; doorMark: THREE.Vector3; yardRing: THREE.Vector3[]; gateW: THREE.Vector3; gateE: THREE.Vector3;
  };
  setSeason(k: Season): void;
  setFocus(x: number, z?: number): void;
  animate(t: number): void;
  bg(k: Season): string;
  colliders: { min: V3; max: V3; name: string }[];
};

/** sky, cloud, skyline, sun and ambience per season */
const LOOK = [
  { hor: "#e2edf9", mid: "#b6d2f2", zen: "#7aaee6", cloud: "#ffffff", far: "#c3d2ea", sun: "#ffe9c8", sunI: 2.4, hemiS: "#cfe0ff", hemiG: "#e6ecfc", hemiI: 0.5 },
  { hor: "#dde2e8", mid: "#c5ced9", zen: "#a7b5c7", cloud: "#e9edf3", far: "#b7c1d0", sun: "#f8f0e2", sunI: 1.5, hemiS: "#dfe6f0", hemiG: "#bfae98", hemiI: 0.8 },
  { hor: "#d8edf8", mid: "#9dcff4", zen: "#56a5ea", cloud: "#ffffff", far: "#a9cfd0", sun: "#fff6e4", sunI: 2.3, hemiS: "#d6eaff", hemiG: "#cbe89c", hemiI: 0.5 },
  { hor: "#e6eedc", mid: "#86c2ee", zen: "#3489de", cloud: "#fff6e4", far: "#9cc6a4", sun: "#ffe0a4", sunI: 2.9, hemiS: "#cfe2ff", hemiG: "#9cc864", hemiI: 0.4 },
];

// =====================================================================================================================
// geometry helpers
// =====================================================================================================================
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** world-space box mapping (u, v in metres x s): textures run continuously over merged pieces */
function worldUV(g: THREE.BufferGeometry, s: number) {
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  const a = V(0, 0, 0), b = V(0, 0, 0), c = V(0, 0, 0), n = V(0, 0, 0), e = V(0, 0, 0);
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    n.subVectors(b, a).cross(e.subVectors(c, a));
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    for (let k = 0; k < 3; k++) {
      const v = k === 0 ? a : k === 1 ? b : c;
      if (ay >= ax && ay >= az) uv.setXY(i + k, v.x * s, -v.z * s); else if (ax > az) uv.setXY(i + k, v.z * s, v.y * s); else uv.setXY(i + k, v.x * s, v.y * s);
    }
  }
}
/** static pieces collected per material, merged into one mesh each */
class Batch {
  private map = new Map<THREE.Material, THREE.BufferGeometry[]>();
  tris = 0;
  add(mat: THREE.Material, g: THREE.BufferGeometry, uvScale = 0) {
    const q = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(q.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") q.deleteAttribute(k);
    if (!q.attributes.uv) q.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2));
    if (uvScale) worldUV(q, uvScale);
    let l = this.map.get(mat); if (!l) this.map.set(mat, (l = []));
    l.push(q);
  }
  flush(into: THREE.Object3D, name: string, cast = true, receive = true) {
    for (const [mat, list] of this.map) {
      const m = new THREE.Mesh(mergeGeometries(list, false), mat);
      m.castShadow = cast; m.receiveShadow = receive; m.name = name;
      this.tris += m.geometry.attributes.position.count / 3;
      into.add(m);
    }
    this.map.clear();
  }
}
const boxG = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** a box of size (w, h, d) turned by ry about y, centred at (x, y, z) */
const boxR = (w: number, h: number, d: number, x: number, y: number, z: number, ry = 0, rz = 0, rx = 0) => {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rz) g.rotateZ(rz); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry);
  return g.translate(x, y, z);
};
/** a (z, y) profile (z measured from zFace toward +z) extruded along x from x0 to x1 */
const prismX = (pts: [number, number][], x0: number, x1: number, zFace = 0) => {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y))), { depth: x1 - x0, bevelEnabled: false });
  g.rotateY(-Math.PI / 2); g.translate(x1, 0, zFace);
  return g;
};
/** an (x, y) profile extruded along z from z0 to z1 */
const prismZ = (pts: [number, number][], z0: number, z1: number) =>
  new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth: z1 - z0, bevelEnabled: false }).translate(0, 0, z0);
/** a flat-shaded square pyramid: half-width hw, height h, base centre (x, y, z) */
const pyr = (hw: number, h: number, x: number, y: number, z: number) => {
  const g = new THREE.ConeGeometry(hw * Math.SQRT2, h, 4, 1, false).rotateY(Math.PI / 4).toNonIndexed();
  g.computeVertexNormals();
  return g.translate(x, y + h / 2, z);
};
const _up = V(0, 1, 0), _q = new THREE.Quaternion();
/** a tapered round limb from a to b */
const limb = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, seg = 6) => {
  const d = b.clone().sub(a), len = d.length(), g = new THREE.CylinderGeometry(rb, ra, len, seg, 1, false);
  _q.setFromUnitVectors(_up, d.normalize());
  g.applyQuaternion(_q); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};
/** flat up-facing strip between two z profiles sampled at xs (zA south of zB), world uv */
const stripG = (xs: number[], zA: (x: number) => number, zB: (x: number) => number, s: number) => {
  const pos: number[] = [], uv: number[] = [], nor: number[] = [];
  const put = (x: number, z: number) => { pos.push(x, 0, z); uv.push(x * s, -z * s); nor.push(0, 1, 0); };
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i], x1 = xs[i + 1];
    put(x0, zA(x0)); put(x1, zA(x1)); put(x1, zB(x1));
    put(x0, zA(x0)); put(x1, zB(x1)); put(x0, zB(x0));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
};
/** vertex-coloured triangles (tents, bunting): pushes one triangle, flipping it to face along its normals */
type VC = { pos: number[]; nor: number[]; col: number[]; uv: number[] };
const vtri = (o: VC, p: THREE.Vector3[], n: THREE.Vector3[], c: THREE.Color) => {
  const fn = p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0]));
  const ord = fn.dot(n[0].clone().add(n[1]).add(n[2])) < 0 ? [0, 2, 1] : [0, 1, 2];
  for (const i of ord) { o.pos.push(p[i].x, p[i].y, p[i].z); o.nor.push(n[i].x, n[i].y, n[i].z); o.col.push(c.r, c.g, c.b); o.uv.push(p[i].x * 0.25 + p[i].z * 0.25, p[i].y * 0.25); }
};
const vcGeo = (o: VC) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(o.pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(o.nor, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(o.col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(o.uv, 2));
  return g;
};

// =====================================================================================================================
// the set
// =====================================================================================================================
export function buildYard(M: Mats, o: { seed?: number } = {}): YardSet {
  const seed = o.seed ?? 7;
  const group = new THREE.Group(); group.name = "yard";
  const colliders: YardSet["colliders"] = [];
  const solid = (name: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => { colliders.push({ name, min: [x0, y0, z0], max: [x1, y1, z1] }); };
  const B = new Batch();          // everything static, all seasons
  const CAPS = new Batch();       // snow caps (season 0)
  const DRIFT = new Batch();      // snow drifts at wall feet (seasons 0, 1)
  const BARE = new Batch();       // what lies under a full snow cover (every season but 0)
  const BLOS = new Batch(), LEAF = new Batch();
  const SHRUB = new Batch();      // shrubs at the wall feet (seasons 2, 3)

  // ---------------- materials ----------------
  const mott = P.mottleTex(seed + 2, [255, 255, 255], [226, 231, 242], 36, 0.17);
  const flat = (color: string, map: THREE.Texture | null = mott, rough = 0.9) => M.wood({ color, map, roughness: rough, specular: 0.2 });
  const stoneMap = P.ashlarTex(seed + 1, [208, 201, 188], [180, 173, 164]);
  const mStoneHi = M.wood({ map: stoneMap, color: "#ffffff", roughness: 0.95, specular: 0.15 });
  const mStoneLo = M.wood({ map: stoneMap, color: "#aab1bf", roughness: 0.95, specular: 0.15 });
  const mWall = M.wood({ map: stoneMap, color: "#d9d4cc", roughness: 0.95, specular: 0.15 });
  const mTrim = flat("#e6dfd0");
  const mTrimLo = flat("#c3c4c8");
  const COPE = "#e6dfd0", mCope = flat(COPE);                 // wall copings and pier caps: stone, white under snow (setSeason)
  const SHRUB_COL = ["#8fd058", "#4c9c3a"], mShrub = flat(SHRUB_COL[0]);
  const mRose = flat("#e8474f", null);
  const mSlate = flat("#70819b");
  const mChDoor = M.wood({ map: P.churchDoorTex(seed + 3, [122, 92, 68], [50, 52, 60]), roughness: 0.85, specular: 0.2 });
  const mGlass = M.paint({ map: P.wheelTex([58, 84, 128], [226, 219, 204]), roughness: 0.5 });
  const mDark = flat("#3b4257", null);
  const mTimber = flat("#5c4435", null, 0.85);
  const mPlaster = flat("#f3e6c8");
  const mPlaster2 = flat("#e9bf7c");
  const farWalls = [flat("#e4d6c2"), flat("#d6c3b4"), flat("#e8dcb8"), flat("#cfc6c0")];
  const roofMap = P.roofTex(seed + 4, [206, 104, 74]);
  const mRoof = M.wood({ map: roofMap, roughness: 0.9, specular: 0.2 });
  const FAR_ROOF = ["#c56a4c", "#a9604e", "#8d7f86"], farRoofs = FAR_ROOF.map((c) => flat(c, null));
  const mRidge = flat("#a9604e", null), mShut2 = flat("#a9604e", null);
  const boards = P.boardTex(seed + 5, 4);
  const mOak = M.wood({ map: boards, color: "#b9814c", roughness: 0.85, specular: 0.2 });
  const mShutter = M.wood({ map: boards, color: "#4f9296", roughness: 0.85, specular: 0.2 });
  const mIron = flat("#353842", null, 0.6);
  const mFence = flat("#b98a5a", null, 0.85);
  const mPole = flat("#8f6846", null, 0.85);
  const mStraw = flat("#e8c65e");
  const mTwine = flat("#8a6a3c", null);
  const mBark = flat("#6f5b4d", null);
  const mBlossom = flat("#f7c0d3", null), mBlossom2 = flat("#fdeef2", null);
  const mLeaf = flat("#62a744", null), mLeaf2 = flat("#7dbb4e", null);
  const mSnow = flat("#f4f8ff");
  const mBarrel = flat("#ad7844", null, 0.85);
  const mLamp = M.paint({ color: "#ffd98a" }); mLamp.emissive = new THREE.Color("#ffb648"); mLamp.emissiveIntensity = 0.55;
  const mCloth = M.paint({ color: "#ffffff", map: mott, roughness: 0.9, side: THREE.DoubleSide }); mCloth.vertexColors = true;
  const clothCol = (c: string) => M.paint({ color: c, roughness: 0.9, side: THREE.DoubleSide });

  // ---------------- ground: south turf | path | north turf (hole: paved circle; bite: the street) ----------------
  const xs: number[] = [-160, -110, -70];
  for (let x = -46; x <= 36; x++) xs.push(x);
  for (let i = -9; i <= 9; i++) if (i % 5) xs.push(i * 0.2);            // finer where the path bends round the paved circle
  xs.push(9.6, 60, 110, 160); xs.sort((a, b) => a - b);
  const zS = (x: number) => 4.5 + 0.13 * Math.sin(0.83 * x + 1.3) + 0.06 * Math.sin(2.1 * x + 0.4);
  /** the path's north edge; it bows south round the paved circle (0.3 m of turf between them) */
  const zN = (x: number) => Math.max(2.5 + 0.12 * Math.sin(0.71 * x + 4.0) + 0.06 * Math.sin(1.9 * x + 2.0), Math.sqrt(Math.max(0, 2.9 * 2.9 - x * x)));
  const GS = 1 / 7, PS = 1 / 4;
  const gSouth = stripG(xs, () => 70, zS, GS);
  const gPath = stripG(xs, zS, zN, PS);
  const gStreet = stripG(xs.filter((x) => x >= 9.6 && x <= 30), zN, () => -3.8, PS);
  const outline: THREE.Vector2[] = [];
  for (const x of xs) {
    if (x <= 9.6 || x >= 30) outline.push(new THREE.Vector2(x, -zN(x)));
    if (x === 9.6) outline.push(new THREE.Vector2(9.6, 3.8), new THREE.Vector2(30, 3.8));
  }
  outline.push(new THREE.Vector2(160, 170), new THREE.Vector2(-160, 170));
  const PAVE_R = 2.6, PAVE_N = 56, hole: THREE.Vector2[] = [];
  for (let i = 0; i < PAVE_N; i++) { const a = (-i / PAVE_N) * Math.PI * 2; hole.push(new THREE.Vector2(PAVE_R * Math.cos(a), PAVE_R * Math.sin(a))); }
  const shape = new THREE.Shape(outline); shape.holes.push(new THREE.Path(hole));
  const gNorth = new THREE.ShapeGeometry(shape).toNonIndexed(); gNorth.rotateX(-Math.PI / 2);
  { const p = gNorth.attributes.position as THREE.BufferAttribute, uv = gNorth.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * GS, -p.getZ(i) * GS); }
  const gGround = mergeGeometries([gSouth, gNorth], false);
  const pavePos: number[] = [], paveUv: number[] = [], paveNor: number[] = [];
  for (let i = 0; i < PAVE_N; i++) {
    const a = hole[i], b = hole[(i + 1) % PAVE_N];                                 // shape (x, -z)
    for (const q of [[0, 0], [a.x, a.y], [b.x, b.y]]) { pavePos.push(q[0], 0, -q[1]); paveNor.push(0, 1, 0); paveUv.push((q[0] / (2 * PAVE_R)) * 0.86 + 0.5, (q[1] / (2 * PAVE_R)) * 0.86 + 0.5); }
  }
  const gPave = new THREE.BufferGeometry();
  gPave.setAttribute("position", new THREE.Float32BufferAttribute(pavePos, 3)); gPave.setAttribute("normal", new THREE.Float32BufferAttribute(paveNor, 3)); gPave.setAttribute("uv", new THREE.Float32BufferAttribute(paveUv, 2));
  { // make sure the fan faces up
    const p = gPave.attributes.position as THREE.BufferAttribute, a = V(0, 0, 0).fromBufferAttribute(p, 1), b = V(0, 0, 0).fromBufferAttribute(p, 2);
    if (a.cross(b).y < 0) { const ix: number[] = []; for (let i = 0; i < PAVE_N; i++) ix.push(i * 3, i * 3 + 2, i * 3 + 1); gPave.setIndex(ix); }
  }
  const snowTile = P.mottleTex(seed + 6, [246, 249, 255], [216, 228, 248], 30, 0.45, 512);
  const turf = P.turfTex(seed + 7), thaw = P.thawTex(seed + 8), earth = P.pathTex(seed + 9, false), trod = P.pathTex(seed + 10, true);
  const flags = P.flagTex(seed + 11, [190, 182, 170], [142, 134, 126], false), flagsSnow = P.flagTex(seed + 11, [170, 168, 174], [236, 242, 252], true);
  const gm = (map: THREE.Texture, color: string) => M.wood({ map, color, roughness: 0.95, specular: 0.12 });
  const meadow = P.meadowTex(seed + 13, [186, 228, 104]);
  const groundMats = [gm(snowTile, "#f7faff"), gm(thaw, "#ffffff"), gm(meadow, "#ffffff"), gm(turf, "#64ae42")];
  const pathMats = [gm(trod, "#e3eaf7"), gm(earth, "#8a705a"), gm(earth, "#e2c090"), gm(earth, "#e6c088")];
  const paveMats = [gm(flagsSnow, "#ffffff"), gm(flags, "#cdd0d6"), gm(flags, "#ffffff"), gm(flags, "#fff8ec")];
  thaw.repeat.set(7 / 12, 7 / 12);
  const ground = new THREE.Mesh(gGround, groundMats[0]), path = new THREE.Mesh(mergeGeometries([gPath, gStreet], false), pathMats[0]), pave = new THREE.Mesh(gPave, paveMats[0]);
  for (const m of [ground, path, pave]) { m.receiveShadow = true; m.name = "ground"; group.add(m); }

  // ---------------- the church front ----------------
  const ST = 0.25;                                             // stone texture: 4 m tile
  { // upper wall: one sheet with the arch notch and the window hole
    const s = new THREE.Shape();
    // the notch is cut 0.22 m wider than the archivolt's opening: with the same radius the two polygons (different
    // segment counts) crossed and the wall showed through the reveal as a row of dots
    s.moveTo(-8, 2.7); s.lineTo(-1.72, 2.7); s.absarc(0, 2.7, 1.72, Math.PI, 0, true); s.lineTo(8, 2.7); s.lineTo(8, 12.5); s.lineTo(0, 16.5); s.lineTo(-8, 12.5); s.closePath();
    const h = new THREE.Path(); h.absarc(0, 6.15, 0.95, 0, Math.PI * 2, true); s.holes.push(h);
    B.add(mStoneHi, new THREE.ExtrudeGeometry(s, { depth: 0.8, bevelEnabled: false, curveSegments: 20 }).translate(0, 0, -9.8), ST);
  }
  for (const sx of [-1, 1]) {
    B.add(mStoneLo, boxG(sx < 0 ? -8 : 1.6, sx < 0 ? -1.6 : 8, 0, 2.7, -9.8, -8.94), ST);          // lower zone
    // buttresses beside the portal and at the corners
    for (const [bx, bw] of [[3.2, 1.0], [7.55, 0.9]] as [number, number][]) {
      const x0 = sx * bx - bw / 2, x1 = sx * bx + bw / 2;
      B.add(mStoneLo, boxG(x0, x1, 0, 2.7, -9, -8.1), ST);
      B.add(mStoneHi, prismX([[0, 2.7], [0.84, 2.7], [0.84, 5.4], [0.5, 6.0], [0.5, 9.6], [0, 10.6]], x0 + 0.04, x1 - 0.04, -9), ST);
      B.add(mTrim, boxG(x0 - 0.1, x1 + 0.1, 2.6, 2.82, -9, -7.98));                                  // string course round it
      CAPS.add(mSnow, boxG(x0 - 0.1, x1 + 0.1, 2.82, 2.9, -9, -7.98));           // flush with the course (see the note at the yard walls)
      solid("buttress", x0, x1, 0, 10, -9, -8.1);
    }
    B.add(mTrim, boxG(sx < 0 ? -8.2 : 1.9, sx < 0 ? -1.9 : 8.2, 2.6, 2.82, -9, -8.8));             // string course
    CAPS.add(mSnow, boxG(sx < 0 ? -8.2 : 1.9, sx < 0 ? -1.9 : 8.2, 2.82, 2.89, -9, -8.8));
    // a lancet in the outer bay
    const lx = sx * 5.4, ls = new THREE.Shape();
    ls.moveTo(lx - 0.36, 4.0); ls.lineTo(lx + 0.36, 4.0); ls.lineTo(lx + 0.36, 6.0); ls.absarc(lx, 6.0, 0.36, 0, Math.PI, false); ls.lineTo(lx - 0.36, 4.0);
    B.add(mDark, new THREE.ExtrudeGeometry(ls, { depth: 0.04, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, -9.0));
    const lf = new THREE.Shape();
    lf.moveTo(lx - 0.56, 3.8); lf.lineTo(lx + 0.56, 3.8); lf.lineTo(lx + 0.56, 6.0); lf.absarc(lx, 6.0, 0.56, 0, Math.PI, false); lf.lineTo(lx - 0.56, 3.8);
    const lh = new THREE.Path(); lh.moveTo(lx - 0.36, 4.0); lh.lineTo(lx - 0.36, 6.0); lh.absarc(lx, 6.0, 0.36, Math.PI, 0, true); lh.lineTo(lx + 0.36, 4.0); lh.lineTo(lx - 0.36, 4.0); lf.holes.push(lh);
    B.add(mTrim, new THREE.ExtrudeGeometry(lf, { depth: 0.12, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, -9.0));
  }
  { // portal: archivolt band, doors, step
    const s = new THREE.Shape();
    s.moveTo(-1.98, 0); s.lineTo(-1.98, 2.7); s.absarc(0, 2.7, 1.98, Math.PI, 0, true); s.lineTo(1.98, 0); s.lineTo(1.5, 0); s.lineTo(1.5, 2.7); s.absarc(0, 2.7, 1.5, 0, Math.PI, false); s.lineTo(-1.5, 0); s.closePath();
    B.add(mTrimLo, new THREE.ExtrudeGeometry(s, { depth: 0.78, bevelEnabled: false, curveSegments: 48 }).translate(0, 0, -9.62));
    const d = new THREE.Shape();
    d.moveTo(-1.5, 0); d.lineTo(1.5, 0); d.lineTo(1.5, 2.7); d.absarc(0, 2.7, 1.5, 0, Math.PI, false); d.closePath();
    const dg = new THREE.ShapeGeometry(d, 48).toNonIndexed();
    { const p = dg.attributes.position as THREE.BufferAttribute, uv = dg.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 1.5) / 3, p.getY(i) / 4.2); }
    dg.translate(0, 0, -9.5); B.add(mChDoor, dg);
    B.add(mTrimLo, boxG(-2.35, 2.35, 0, 0.14, -9, -8.35));
    solid("church step", -2.35, 2.35, 0, 0.14, -9, -8.35);
    // wheel window: frame ring and the painted glass
    const r = new THREE.Shape(); r.absarc(0, 6.15, 1.28, 0, Math.PI * 2, false);
    const rh = new THREE.Path(); rh.absarc(0, 6.15, 0.9, 0, Math.PI * 2, true); r.holes.push(rh);
    B.add(mTrim, new THREE.ExtrudeGeometry(r, { depth: 0.42, bevelEnabled: false, curveSegments: 28 }).translate(0, 0, -9.28));
    B.add(mGlass, new THREE.CircleGeometry(0.97, 28).translate(0, 6.15, -9.3));
  }
  B.add(mStoneHi, boxG(-7.4, 7.4, 0, 11.4, -34, -9.7), ST);                                         // the nave behind
  B.add(mSlate, prismZ([[-7.95, 11.3], [7.95, 11.3], [0, 15.8]], -34.4, -9.75));
  solid("church", -8.2, 8.2, 0, 16, -34, -8.94);
  for (const [dx, w] of [[-6.3, 1.5], [-4.4, 1.0], [4.6, 1.2], [6.4, 1.5]]) DRIFT.add(mSnow, new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(w, 0.3, 0.55).translate(dx, 0, -8.85));
  for (const sx of [-1, 1]) DRIFT.add(mSnow, new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.36, 0.3, 0.5).translate(sx * 2.34, 0, -8.9));
  /** a low shrub against a wall: three squashed balls; pale blossom dots in spring, red roses in summer */
  const shrub = (x: number, z: number, rad: number, sd: number) => {
    const r = P.rng(sd);
    const balls: V3[] = [[0, rad * 0.62, 0], [-rad * 0.62, rad * 0.42, rad * 0.1], [rad * 0.62, rad * 0.46, rad * 0.06]];
    balls.forEach(([dx, dy, dz], i) => {
      const rb = rad * (i ? 0.62 : 0.86);
      SHRUB.add(mShrub, new THREE.SphereGeometry(rb, 12, 8).scale(1, 0.92, 0.9).translate(x + dx, dy, z + dz));
      for (let k = 0; k < (i ? 3 : 5); k++) {
        const az = 0.35 + r() * 2.45, el = 0.25 + r() * 1.0;                 // on the camera-side upper half
        const q: V3 = [x + dx + Math.cos(az) * Math.cos(el) * rb, dy + Math.sin(el) * rb * 0.92, z + dz + Math.sin(az) * Math.cos(el) * rb * 0.9];
        BLOS.add(k % 2 ? mBlossom2 : mBlossom, new THREE.SphereGeometry(0.075, 6, 4).translate(...q));
        if (k % 2 === 0) LEAF.add(mRose, new THREE.SphereGeometry(0.075, 6, 4).translate(...q));
      }
    });
    solid("shrub", x - rad * 1.2, x + rad * 1.2, 0, rad * 1.4, z - rad, z + rad);
  };
  shrub(-2.36, -8.72, 0.34, seed + 71); shrub(2.36, -8.72, 0.34, seed + 72);
  shrub(-5.9, -8.6, 0.5, seed + 73); shrub(6.0, -8.6, 0.55, seed + 74); shrub(-4.45, -8.65, 0.42, seed + 75);
  shrub(-9.0, -6.6, 0.48, seed + 76); shrub(-9.0, -1.8, 0.44, seed + 77); shrub(9.0, -6.9, 0.46, seed + 78); shrub(9.02, 0.2, 0.42, seed + 79);

  // ---------------- yard walls, piers, slabs, bench ----------------
  // Copings, caps and snow covers are FLUSH with what they sit on and ridged on top: an overhang's underside (or a
  // ledge's top) seen from eye level is a sub-pixel sliver that the ink pass draws as a dashed line, and a flat top
  // at 1.3 - 1.4 m is edge-on to the camera. The coping and the pier pyramids turn white in season 0 (mCope).
  for (const sx of [-1, 1]) {
    const x = sx * 9.5;
    B.add(mWall, boxG(x - 0.25, x + 0.25, 0, 1.14, -10.5, 1.2), 0.5);
    B.add(mCope, prismZ([[x - 0.25, 1.14], [x + 0.25, 1.14], [x + 0.25, 1.24], [x, 1.36], [x - 0.25, 1.24]], -10.5, 1.2));
    B.add(mWall, boxG(x - 0.4, x + 0.4, 0, 1.85, 1.1, 1.9), 0.5);
    B.add(mTrim, boxG(x - 0.4, x + 0.4, 1.85, 1.98, 1.1, 1.9));
    B.add(mCope, pyr(0.4, 0.32, x, 1.98, 1.5));
    solid(sx < 0 ? "yard wall W" : "yard wall E", x - 0.25, x + 0.25, 0, 1.36, -10.5, 1.2);
    solid(sx < 0 ? "gate pier W" : "gate pier E", x - 0.4, x + 0.4, 0, 2.3, 1.1, 1.9);
    for (const [dz, w] of [[-7.2, 1.3], [-3.1, 1.6], [-0.3, 1.1]]) DRIFT.add(mSnow, new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.5, 0.26, w).translate(x - sx * 0.28, 0, dz + sx * 0.6));
  }
  B.add(mTrimLo, boxR(1.9, 0.22, 0.85, -7.1, 0.11, -5.6, 0.16)); solid("slab W", -8.1, -6.1, 0, 0.22, -6.2, -5.0);
  B.add(mTrimLo, boxR(1.7, 0.2, 0.8, 6.3, 0.1, -7.0, -0.2)); solid("slab E", 5.4, 7.2, 0, 0.2, -7.6, -6.4);
  B.add(mTrim, boxG(8.3, 8.95, 0.4, 0.53, -2.7, -0.9)); B.add(mTrimLo, boxG(8.4, 8.85, 0, 0.4, -2.55, -2.25)); B.add(mTrimLo, boxG(8.4, 8.85, 0, 0.4, -1.35, -1.05));
  CAPS.add(mSnow, boxG(8.3, 8.95, 0.53, 0.61, -2.7, -0.9));
  solid("stone bench", 8.3, 8.95, 0, 0.53, -2.7, -0.9);

  // ---------------- trees ----------------
  const tree = (x: number, z: number, h: number, sd: number, full: boolean) => {
    const r = P.rng(sd), trunkH = h * (0.36 + 0.08 * r()), r0 = 0.15 + h * 0.022;
    const top = V(x + (r() - 0.5) * 0.4, trunkH, z + (r() - 0.5) * 0.4);
    B.add(mBark, limb(V(x, -0.05, z), top, r0 * 1.35, r0 * 0.78, 8));
    const nb = full ? 5 : 4, a0 = r() * 6.28, ends: [THREE.Vector3, number][] = [];
    for (let i = 0; i <= nb; i++) {
      const leader = i === nb, az = a0 + (i / nb) * Math.PI * 2 + (r() - 0.5) * 0.5, tilt = leader ? 0.12 : 0.55 + 0.35 * r(), len = h * (leader ? 0.5 : 0.36 + 0.1 * r());
      const dir = V(Math.sin(tilt) * Math.cos(az), Math.cos(tilt), Math.sin(tilt) * Math.sin(az)), end = top.clone().addScaledVector(dir, len);
      B.add(mBark, limb(top.clone().addScaledVector(dir, -0.1), end, r0 * 0.56, r0 * 0.15, 6));
      ends.push([end, 1]);
      for (let k = 0; k < (full ? 2 : 1); k++) {
        const st = top.clone().addScaledVector(dir, len * (0.45 + 0.25 * k)), az2 = az + (k ? -0.9 : 0.9) + (r() - 0.5) * 0.4, t2 = Math.max(0.2, tilt - 0.15 + 0.3 * r());
        const e2 = st.clone().addScaledVector(V(Math.sin(t2) * Math.cos(az2), Math.cos(t2), Math.sin(t2) * Math.sin(az2)), len * (0.45 + 0.15 * r()));
        B.add(mBark, limb(st, e2, r0 * 0.26, 0.028, 5));
        ends.push([e2, 0.75]);
      }
    }
    ends.forEach(([e, k], i) => {
      const rb = h * (0.085 + 0.03 * r()) * (0.75 + 0.25 * k);
      BLOS.add(i % 3 === 1 ? mBlossom2 : mBlossom, new THREE.SphereGeometry(rb, full ? 12 : 10, 8).translate(e.x, e.y, e.z));
      if (k === 1 || i % 2 === 0) { const rl = h * (0.15 + 0.04 * r()) * (0.8 + 0.2 * k); LEAF.add(i % 4 === 2 ? mLeaf2 : mLeaf, new THREE.SphereGeometry(rl, full ? 14 : 10, full ? 9 : 7).scale(1, 0.85, 1).translate(e.x * 0.9 + top.x * 0.1, e.y - rl * 0.1, e.z * 0.9 + top.z * 0.1)); }
    });
    LEAF.add(mLeaf, new THREE.SphereGeometry(h * 0.2, full ? 14 : 10, full ? 9 : 7).translate(top.x, top.y + h * 0.3, top.z));
    solid("tree", x - 0.4, x + 0.4, 0, h, z - 0.4, z + 0.4);
  };
  tree(-7.4, -3.6, 6.6, seed + 21, true); tree(7.3, -5.3, 7.2, seed + 22, true); tree(-6.9, 1.5, 6.4, seed + 23, true);      // the yard
  tree(-11.2, -4.8, 7.6, seed + 24, true); tree(-11.9, -10.2, 8.2, seed + 25, false); tree(11.1, -6.4, 7.0, seed + 26, true);   // between the zones
  tree(13.2, -13.5, 8.5, seed + 27, false); tree(-14.2, -13.2, 8.0, seed + 28, false); tree(-26.8, -10.8, 7.5, seed + 29, false);
  tree(-33.6, -8.5, 8.4, seed + 30, false); tree(-18.2, -16.5, 9, seed + 31, false); tree(26.5, -12.5, 8.6, seed + 32, false); tree(-36.5, -1.5, 7.2, seed + 33, false);

  // ---------------- FIELD: pavilions, poles, pennants, bunting, the tilt fence, bales, the lance rack ----------------
  const tents: VC = { pos: [], nor: [], col: [], uv: [] };
  const pennants: { mesh: THREE.Mesh; L: number; h: number; ph: number }[] = [];
  const pennant = (x: number, y: number, z: number, L: number, h: number, colr: string, ph: number) => {
    const N = 8, g = new THREE.BufferGeometry(), ix: number[] = [];
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array((N + 1) * 6), 3)); g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array((N + 1) * 6), 3)); g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array((N + 1) * 4), 2));
    for (let i = 0; i < N; i++) ix.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    g.setIndex(ix);
    const m = new THREE.Mesh(g, clothCol(colr)); m.position.set(x, y, z); m.castShadow = true; m.frustumCulled = false; m.name = "pennant"; group.add(m);
    pennants.push({ mesh: m, L, h, ph });
  };
  const tent = (x: number, z: number, rad: number, hw: number, hr: number, ca: string, cb: string, stripes: number, flag: string | null) => {
    const A = new THREE.Color(ca), Bc = new THREE.Color(cb), n = stripes * 2, re = rad * 1.12, apex = V(x, hw + hr, z);
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, c = (i >> 1) % 2 ? A : Bc, c2 = (i >> 1) % 2 ? Bc : A;
      const d0 = V(Math.cos(a0), 0, Math.sin(a0)), d1 = V(Math.cos(a1), 0, Math.sin(a1));
      const b0 = V(x + d0.x * rad, 0, z + d0.z * rad), b1 = V(x + d1.x * rad, 0, z + d1.z * rad), t0 = b0.clone().setY(hw), t1 = b1.clone().setY(hw);
      vtri(tents, [b0, b1, t1], [d0, d1, d1], c); vtri(tents, [b0, t1, t0], [d0, d1, d0], c);
      const e0 = V(x + d0.x * re, hw, z + d0.z * re), e1 = V(x + d1.x * re, hw, z + d1.z * re), k = hr / re;
      const n0 = d0.clone().multiplyScalar(k).setY(1).normalize(), n1 = d1.clone().multiplyScalar(k).setY(1).normalize();
      vtri(tents, [e0, e1, apex], [n0, n1, n0.clone().add(n1).normalize()], c);
      const v0 = e0.clone().setY(hw - 0.34), v1 = e1.clone().setY(hw - 0.34);                    // valance
      vtri(tents, [v0, v1, e1], [d0, d1, d1], c2); vtri(tents, [v0, e1, e0], [d0, d1, d0], c2);
    }
    B.add(mPole, new THREE.CylinderGeometry(0.05, 0.05, 1.3, 6).translate(x, hw + hr + 0.55, z));
    B.add(flat("#e8b93c", null, 0.5), new THREE.SphereGeometry(0.13, 10, 8).translate(x, hw + hr + 1.25, z));
    if (flag) pennant(x + 0.04, hw + hr + 0.85, z, 0.95, 0.4, flag, x * 0.7);
    solid("tent", x - re, x + re, 0, hw + hr, z - re, z + re);
  };
  tent(-29.0, -6.3, 1.9, 2.0, 2.2, "#7b4fa8", "#f6e7a8", 6, "#f2c53a");
  tent(-24.8, -6.3, 2.0, 2.1, 2.3, "#2f9a58", "#fbf6ea", 6, "#e8503a");
  tent(-20.4, -6.3, 2.0, 2.1, 2.3, "#dc3b34", "#fbf6ea", 6, "#3d7fd6");
  tent(-15.6, -6.3, 2.2, 2.3, 2.6, "#2f6fd0", "#f7d24a", 6, "#dc3b34");
  tent(-27.2, -12.6, 1.7, 1.9, 2.0, "#e9a23c", "#fbf3df", 5, null); tent(-22.3, -13.0, 1.7, 1.9, 2.0, "#d86a6a", "#fbf3df", 5, null);
  tent(-13.4, -12.2, 1.7, 1.9, 2.0, "#58a6c9", "#fbf3df", 5, null); tent(-31.6, -12.0, 1.6, 1.8, 1.9, "#6fb06a", "#fbf3df", 5, null);
  const tentMesh = new THREE.Mesh(vcGeo(tents), mCloth); tentMesh.castShadow = tentMesh.receiveShadow = true; tentMesh.name = "tents"; group.add(tentMesh);
  // tall poles between the pavilions, long pennants, bunting from pole to pole
  const poles: [number, number][] = [[-26.9, -4.7], [-22.6, -4.7], [-18.05, -4.7], [-13.0, -4.7]], PH = 5.7;
  const penCols = ["#e8503a", "#f2c53a", "#3d7fd6", "#2f9a58"];
  poles.forEach(([x, z], i) => {
    B.add(mPole, new THREE.CylinderGeometry(0.06, 0.08, PH, 8).translate(x, PH / 2, z));
    B.add(flat("#e8b93c", null, 0.5), new THREE.SphereGeometry(0.12, 10, 8).translate(x, PH + 0.08, z));
    pennant(x + 0.05, PH - 0.45, z, 1.5, 0.55, penCols[i], i * 1.9);
    solid("pole", x - 0.1, x + 0.1, 0, PH, z - 0.1, z + 0.1);
  });
  const bunt: VC = { pos: [], nor: [], col: [], uv: [] }, buntTips: { i: number; base: THREE.Vector3; ph: number }[] = [];
  const buntCols = ["#e8503a", "#f7d24a", "#3d7fd6", "#fbf6ea", "#2f9a58"].map((c) => new THREE.Color(c));
  const strings: [THREE.Vector3, THREE.Vector3][] = [];
  for (let i = 0; i < poles.length - 1; i++) strings.push([V(poles[i][0], 4.3, poles[i][1]), V(poles[i + 1][0], 4.3, poles[i + 1][1])]);
  strings.forEach(([a, b], si) => {
    const n = 9, sag = 0.75, at = (u: number) => a.clone().lerp(b, u).add(V(0, -4 * sag * u * (1 - u), 0));
    for (let k = 0; k < 10; k++) B.add(mTwine, limb(at(k / 10), at((k + 1) / 10), 0.014, 0.014, 5));
    for (let i = 0; i < n; i++) {
      const p0 = at((i + 0.12) / n), p1 = at((i + 0.88) / n), tip = at((i + 0.5) / n).add(V(0, -0.46, 0)), nz = V(0, 0, 1);
      buntTips.push({ i: bunt.pos.length / 3 + 2, base: tip.clone(), ph: si * 2.3 + i * 1.7 });
      const c = buntCols[(i + si * 2) % buntCols.length];
      for (const p of [p0, p1, tip]) { bunt.pos.push(p.x, p.y, p.z); bunt.nor.push(nz.x, nz.y, nz.z); bunt.col.push(c.r, c.g, c.b); bunt.uv.push(p.x * 0.25, p.y * 0.25); }
    }
  });
  const buntMesh = new THREE.Mesh(vcGeo(bunt), mCloth); buntMesh.castShadow = true; buntMesh.frustumCulled = false; buntMesh.name = "bunting"; group.add(buntMesh);
  // the tilt fence
  for (let x = -32; x <= -12.001; x += 2) { B.add(mFence, boxG(x - 0.08, x + 0.08, 0, 1.08, -2.58, -2.42)); CAPS.add(mSnow, boxG(x - 0.08, x + 0.08, 1.08, 1.15, -2.58, -2.42)); }
  B.add(mFence, boxG(-32.1, -11.9, 0.86, 1.0, -2.56, -2.44)); B.add(mFence, boxG(-32.1, -11.9, 0.42, 0.54, -2.55, -2.45));
  CAPS.add(mSnow, boxG(-32.1, -11.9, 1.0, 1.06, -2.56, -2.44));
  solid("tilt fence", -32.1, -11.9, 0, 1.08, -2.6, -2.4);
  // straw bales
  const bale = (x: number, y: number, z: number, ry: number) => {
    B.add(mStraw, boxR(1.05, 0.5, 0.6, x, y + 0.25, z, ry));
    for (const dx of [-0.28, 0.28]) B.add(mTwine, boxR(0.04, 0.52, 0.62, x + dx * Math.cos(ry), y + 0.25, z - dx * Math.sin(ry), ry));
  };
  bale(-21.9, 0, -1.5, 0.08); bale(-20.75, 0, -1.55, -0.05); bale(-21.3, 0.5, -1.55, 0.2); bale(-14.6, 0, -1.6, 0.3);
  CAPS.add(mSnow, boxR(1.05, 0.07, 0.6, -21.3, 1.035, -1.55, 0.2)); CAPS.add(mSnow, boxR(1.05, 0.07, 0.6, -14.6, 0.535, -1.6, 0.3));
  solid("bales", -22.5, -20.2, 0, 1.0, -1.9, -1.2); solid("bale", -15.2, -14.0, 0, 0.5, -2.0, -1.2);
  { // the lance rack at the fence's east end
    const z0 = -1.55, x0 = -13.4, x1 = -11.7;
    for (const x of [x0, x1]) { B.add(mFence, limb(V(x, 0, z0 + 0.42), V(x, 1.42, z0), 0.06, 0.05, 6)); B.add(mFence, limb(V(x, 0, z0 - 0.42), V(x, 1.42, z0), 0.06, 0.05, 6)); }
    B.add(mFence, boxG(x0 - 0.15, x1 + 0.15, 1.36, 1.46, z0 - 0.05, z0 + 0.05));
    const lc = ["#e8503a", "#fbf6ea", "#3d7fd6", "#f7d24a", "#2f9a58"];
    lc.forEach((c, i) => {
      const x = x0 + 0.22 + i * 0.32, a = V(x, 0, z0 + 0.62), b = V(x + 0.05 * (i - 2), 3.3, z0 - 0.3), m = flat(c, null);
      B.add(m, limb(a, b, 0.058, 0.042, 8));                    // 8 - 12 cm: thinner ones broke into dashes between their two ink lines
      B.add(mIron, new THREE.ConeGeometry(0.07, 0.32, 8).translate(b.x, b.y + 0.15, b.z));
    });
    const shield = (x: number, ca: string, cb: string) => {
      const half = (sgn: number) => { const s = new THREE.Shape(); s.moveTo(0, 0.72); s.lineTo(sgn * 0.29, 0.72); s.lineTo(sgn * 0.29, 0.36); s.quadraticCurveTo(sgn * 0.27, 0.1, 0, 0); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 6 }).rotateX(-0.3).translate(x, 0, z0 + 0.72); };
      B.add(flat(ca, null), half(-1)); B.add(flat(cb, null), half(1));
    };
    shield(x0 + 0.3, "#dc3b34", "#fbf6ea"); shield(x0 + 1.0, "#2f6fd0", "#f7d24a"); shield(x0 + 1.62, "#2f9a58", "#fbf6ea");
    solid("lance rack", x0 - 0.2, x1 + 0.2, 0, 3.65, z0 - 0.5, z0 + 0.85);
  }

  // ---------------- HOUSE: the timber-framed lodging ----------------
  const ZF = -3.25, ZT = -3.17, ZF2 = -2.9, ZT2 = -2.82;       // plaster / timber faces, ground and upper floor
  B.add(mPlaster, boxG(12.5, 21.5, 0, 2.9, -9.2, ZF));
  B.add(mPlaster, boxG(12.4, 21.6, 2.9, 5.3, -9.2, ZF2));
  B.add(mPlaster, prismX([[-9.2, 5.3], [ZF2, 5.3], [-6.05, 8.53]], 12.4, 21.6));
  solid("house", 12.4, 21.6, 0, 9, -9.2, ZT);
  const tb = (x0: number, x1: number, y0: number, y1: number, up = false) => B.add(mTimber, up ? boxG(x0, x1, y0, y1, ZF2 - 0.1, ZT2) : boxG(x0, x1, y0, y1, ZF - 0.1, ZT));
  const brace = (xa: number, ya: number, xb: number, yb: number, up = false) => {
    const len = Math.hypot(xb - xa, yb - ya);
    B.add(mTimber, boxR(len, 0.17, 0.16, (xa + xb) / 2, (ya + yb) / 2, (up ? ZT2 : ZT) - 0.082, 0, Math.atan2(yb - ya, xb - xa)));
  };
  B.add(mTrimLo, boxG(12.46, 16.23, 0, 0.4, ZF - 0.1, -3.14), 0.5); B.add(mTrimLo, boxG(17.77, 21.54, 0, 0.4, ZF - 0.1, -3.14), 0.5);    // stone plinth
  for (const [a, b] of [[12.5, 12.72], [13.67, 13.85], [14.95, 15.13], [16.23, 16.45], [17.55, 17.77], [18.87, 19.05], [20.15, 20.33], [21.28, 21.5]]) tb(a, b, 0.4, 2.8);
  tb(16.23, 17.77, 2.0, 2.2);
  brace(12.7, 0.45, 13.7, 2.75); brace(21.3, 0.45, 20.3, 2.75); brace(16.25, 0.45, 15.1, 2.75); brace(17.75, 0.45, 18.9, 2.75);
  const shutters = (cx: number, w: number, y0: number, y1: number, up: boolean) => {
    const zf = up ? ZF2 : ZF, zt = up ? ZT2 : ZT;
    tb(cx - w / 2 - 0.18, cx + w / 2 + 0.18, y0 - 0.13, y0, up); tb(cx - w / 2 - 0.18, cx + w / 2 + 0.18, y1, y1 + 0.12, up);
    for (const s of [-1, 1]) {
      const a = s < 0 ? cx - w / 2 : cx + 0.012, b = s < 0 ? cx - 0.012 : cx + w / 2;
      B.add(mShutter, boxG(a, b, y0, y1, zf - 0.05, zf + 0.045), 1 / 0.56);
      for (const y of [y0 + 0.22, y1 - 0.22]) B.add(mIron, boxG(a + 0.02, b - 0.02, y - 0.035, y + 0.035, zf + 0.04, zf + 0.062));
    }
    B.add(mDark, boxG(cx - 0.02, cx + 0.02, y0, y1, zf - 0.02, zf + 0.01));
    CAPS.add(mSnow, boxG(cx - w / 2 - 0.2, cx + w / 2 + 0.2, y0, y0 + 0.06, zt - 0.02, zt + 0.09));
    B.add(mTimber, boxG(cx - w / 2 - 0.2, cx + w / 2 + 0.2, y0 - 0.06, y0, zt - 0.02, zt + 0.09));          // a sill
  };
  shutters(14.4, 1.1, 1.05, 2.25, false); shutters(19.6, 1.1, 1.05, 2.25, false);
  // the jetty: joist ends and the bressummer
  for (let x = 12.6; x <= 21.45; x += 0.8) B.add(mTimber, boxG(x - 0.08, x + 0.08, 2.62, 2.8, ZF - 0.05, ZF2 + 0.04));
  B.add(mTimber, boxG(12.36, 21.64, 2.78, 3.02, ZF2 - 0.1, -2.8));
  for (const c of [14.4, 17.0, 19.6]) { tb(c - 0.63, c - 0.45, 3.02, 5.12, true); tb(c + 0.45, c + 0.63, 3.02, 5.12, true); shutters(c, 0.9, 3.67, 4.75, true); }
  tb(12.4, 12.62, 3.02, 5.12, true); tb(21.38, 21.6, 3.02, 5.12, true); tb(12.4, 21.6, 5.12, 5.32, true);
  brace(12.74, 5.0, 13.66, 3.2, true); brace(21.26, 5.0, 20.34, 3.2, true); brace(15.14, 3.2, 16.26, 5.0, true); brace(18.86, 3.2, 17.74, 5.0, true);
  { // the roof: two tiled slabs over the gable prism, a ridge, snow slabs for winter
    const th = Math.atan2(3.855, 3.75), L = 5.38, cy = 6.7375;
    for (const s of [1, -1]) {
      const cz = s > 0 ? -4.175 : -7.925;
      B.add(mRoof, boxR(9.9, 0.18, L, 17, cy, cz, 0, 0, s * th), 1 / 2.4);
      const nz = s * Math.sin(th), ny = Math.cos(th);
      CAPS.add(mSnow, boxR(9.6, 0.14, L - 0.75, 17, cy + ny * 0.16 + Math.sin(th) * 0.2, cz + nz * 0.16 - s * Math.cos(th) * 0.2, 0, 0, s * th));
    }
    B.add(mRidge, boxG(12.0, 22.0, 8.6, 8.84, -6.22, -5.88));
    CAPS.add(mSnow, boxG(12.1, 21.9, 8.84, 8.95, -6.3, -5.8));
  }
  // the door: oak leaf, iron bands, ring handle, hasp and padlock
  B.add(mOak, boxG(16.45, 17.55, 0, 2.0, ZF - 0.02, -3.2), 1 / 1.1);
  for (const y of [0.42, 1.58]) B.add(mIron, boxG(16.46, 17.54, y - 0.06, y + 0.06, -3.2, -3.182));
  B.add(mIron, new THREE.TorusGeometry(0.085, 0.02, 8, 18).translate(17.2, 1.1, -3.165));
  B.add(mIron, new THREE.CylinderGeometry(0.035, 0.035, 0.05, 10).rotateX(Math.PI / 2).translate(17.2, 1.185, -3.18));
  B.add(mIron, boxG(17.3, 17.7, 0.97, 1.07, -3.2, -3.15));                                            // hasp
  B.add(mIron, new THREE.TorusGeometry(0.075, 0.024, 8, 16, Math.PI).translate(17.5, 0.93, -3.12));   // shackle
  B.add(mIron, boxG(17.37, 17.63, 0.66, 0.93, -3.16, -3.08));                                         // padlock body
  B.add(mDark, new THREE.CylinderGeometry(0.042, 0.042, 0.012, 12).rotateX(Math.PI / 2).translate(17.5, 0.835, -3.076));      // keyhole: a round hole
  B.add(mDark, boxG(17.48, 17.52, 0.755, 0.82, -3.082, -3.07));                                                                 // over a short broad slot
  // lantern on a bracket by the door
  B.add(mIron, boxG(17.98, 18.02, 2.44, 2.48, ZT - 0.02, -2.72)); B.add(mIron, boxG(17.985, 18.015, 2.3, 2.44, -2.79, -2.76));
  B.add(mLamp, boxG(17.91, 18.09, 2.04, 2.28, -2.865, -2.685));
  B.add(mIron, new THREE.ConeGeometry(0.17, 0.12, 4).rotateY(Math.PI / 4).translate(18, 2.34, -2.775)); B.add(mIron, boxG(17.89, 18.11, 2.0, 2.04, -2.885, -2.665));
  for (const dx of [-0.1, 0.1]) for (const dz of [-0.1, 0.1]) B.add(mIron, boxG(18 + dx - 0.012, 18 + dx + 0.012, 2.04, 2.28, -2.775 + dz - 0.012, -2.775 + dz + 0.012));
  // barrel and bench
  B.add(mBarrel, new THREE.LatheGeometry([[0.3, 0], [0.37, 0.2], [0.4, 0.45], [0.37, 0.7], [0.3, 0.9], [0.26, 0.9], [0.26, 0.86], [0.001, 0.86]].map(([x, y]) => new THREE.Vector2(x, y)), 16).translate(15.35, 0, -2.72));
  for (const [y, rr] of [[0.2, 0.375], [0.7, 0.375]]) B.add(mIron, new THREE.CylinderGeometry(rr + 0.012, rr + 0.012, 0.06, 16, 1, true).translate(15.35, y, -2.72));
  CAPS.add(mSnow, new THREE.CylinderGeometry(0.25, 0.25, 0.06, 14).translate(15.35, 0.89, -2.72));
  solid("barrel", 14.95, 15.75, 0, 0.9, -3.12, -2.32);
  B.add(mFence, boxG(18.6, 20.2, 0.4, 0.47, -3.12, -2.74)); B.add(mFence, boxG(18.72, 18.8, 0, 0.4, -3.1, -2.76)); B.add(mFence, boxG(20.0, 20.08, 0, 0.4, -3.1, -2.76));
  CAPS.add(mSnow, boxG(18.6, 20.2, 0.47, 0.53, -3.12, -2.74));
  solid("house bench", 18.6, 20.2, 0, 0.47, -3.12, -2.74);
  // neighbours: a garden wall to the west, a plain house to the east
  B.add(mWall, boxG(9.7, 12.5, 0, 2.5, -4.0, -3.6), 0.5);
  { // its tiled coping, flush with the wall faces; under snow in season 0
    const cope: [number, number][] = [[-4.0, 2.5], [-3.6, 2.5], [-3.8, 2.86]];
    BARE.add(mRoof, prismX(cope, 9.7, 12.46), 1 / 2.4); CAPS.add(mSnow, prismX(cope, 9.7, 12.46));
  }
  solid("garden wall", 9.7, 12.5, 0, 2.86, -4.0, -3.6);
  // the neighbour: plinth, wall, beam and wall stacked flush (a proud beam / plinth drew dashed ink at 20 m)
  B.add(mTrimLo, boxG(21.6, 29.6, 0, 0.4, -9.4, -3.0), 0.5); B.add(mPlaster2, boxG(21.6, 29.6, 0.4, 2.6, -9.4, -3.0));
  B.add(mTimber, boxG(21.6, 29.6, 2.6, 2.82, -9.4, -3.0)); B.add(mPlaster2, boxG(21.6, 29.6, 2.82, 5.0, -9.4, -3.0));
  B.add(mRoof, prismX([[-9.9, 4.85], [-2.5, 4.85], [-6.2, 8.2]], 21.62, 30.0), 1 / 2.4);
  CAPS.add(mSnow, prismX([[-6.2, 8.2], [-6.2, 8.34], [-2.9, 5.37], [-2.9, 5.21]], 21.9, 29.9));
  for (const cx of [24.0, 27.2]) for (const y0 of [1.0, 3.3]) { B.add(mShut2, boxG(cx - 0.5, cx + 0.5, y0, y0 + 1.15, -3.05, -2.9)); B.add(mDark, boxG(cx - 0.02, cx + 0.02, y0, y0 + 1.15, -3.0, -2.888)); }
  solid("neighbour", 21.6, 29.6, 0, 8, -9.4, -2.9);

  // ---------------- middle distance: plain houses behind the walls ----------------
  const farHouse = (cx: number, cz: number, w: number, d: number, hw: number, hr: number, wi: number, ri: number, gable: boolean) => {
    const wm = farWalls[wi % farWalls.length], rm = farRoofs[ri % farRoofs.length];
    if (gable) {                                                 // one pentagon wall (a box + a gable triangle left a dotted seam)
      B.add(wm, prismZ([[cx - w / 2, 0], [cx + w / 2, 0], [cx + w / 2, hw], [cx, hw + hr - 0.42], [cx - w / 2, hw]], cz - d / 2, cz + d / 2));
      B.add(rm, prismZ([[cx - w / 2 - 0.35, hw - 0.15], [cx + w / 2 + 0.35, hw - 0.15], [cx, hw + hr]], cz - d / 2 - 0.2, cz + d / 2 - 0.03));
    } else B.add(wm, boxG(cx - w / 2, cx + w / 2, 0, hw, cz - d / 2, cz + d / 2));
    if (!gable) B.add(rm, prismX([[cz - d / 2 - 0.3, hw - 0.15], [cz + d / 2 + 0.3, hw - 0.15], [cz, hw + hr]], cx - w / 2 - 0.3, cx + w / 2 + 0.3));
    for (const dx of [-w * 0.24, w * 0.24]) B.add(mDark, boxG(cx + dx - 0.4, cx + dx + 0.4, hw * 0.52, hw * 0.52 + 1.1, cz + d / 2 - 0.02, cz + d / 2 + 0.05));
    solid("far house", cx - w / 2, cx + w / 2, 0, hw + hr, cz - d / 2, cz + d / 2);
  };
  farHouse(-14.5, -19, 7, 6, 4.6, 3.2, 0, 0, true); farHouse(-22.5, -20.5, 8, 6, 5.0, 3.0, 1, 1, false); farHouse(-31, -19.5, 7, 6, 4.4, 3.4, 2, 0, true);
  farHouse(14.0, -19.5, 7.5, 6, 5.2, 3.2, 2, 1, true); farHouse(22, -17, 8, 6, 4.6, 3.0, 0, 0, false); farHouse(31, -16, 7, 7, 5.4, 3.4, 1, 2, true);
  farHouse(-41, -12, 8, 7, 4.8, 3.2, 3, 0, false); farHouse(38, -6, 8, 7, 5.0, 3.2, 3, 1, true); farHouse(-9.5 - 3.4, -24, 6, 6, 4.2, 3.0, 3, 2, false);

  B.flush(group, "static");
  const caps = new THREE.Group(), drifts = new THREE.Group(), blossom = new THREE.Group(), leaves = new THREE.Group(), bare = new THREE.Group(), shrubs = new THREE.Group();
  CAPS.flush(caps, "snow caps"); DRIFT.flush(drifts, "drifts", false, true); BLOS.flush(blossom, "blossom"); LEAF.flush(leaves, "leaves");
  BARE.flush(bare, "bare"); SHRUB.flush(shrubs, "shrubs");
  group.add(caps, drifts, blossom, leaves, bare, shrubs);

  // ---------------- sky: dome, clouds, far skyline (all NOINK) ----------------
  const skyU = { cH: { value: new THREE.Color() }, cM: { value: new THREE.Color() }, cZ: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(420, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 cH, cM, cZ; varying vec3 vP; void main(){ float e = normalize(vP).y; vec3 c = mix(cH, cM, smoothstep(0.02, 0.3, e)); c = mix(c, cZ, smoothstep(0.25, 0.9, e)); gl_FragColor = vec4(c, 1.0); }",
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; sky.layers.set(NOINK); sky.name = "sky"; group.add(sky);
  const farMat = new THREE.MeshBasicMaterial({ map: P.skylineTex(seed + 12), transparent: true, depthWrite: false, side: THREE.BackSide, fog: false });
  farMat.map!.repeat.set(5, 1);
  const far = new THREE.Mesh(new THREE.CylinderGeometry(150, 150, 36, 72, 1, true, Math.PI - 2.2, 4.4), farMat);
  far.position.set(0, 17, 0); far.renderOrder = -5; far.layers.set(NOINK); far.frustumCulled = false; far.name = "skyline"; group.add(far);
  const cloudDefs: [number, number, number, number][] = [[-190, 62, -235, 92], [-70, 96, -250, 120], [55, 58, -240, 84], [165, 88, -225, 104], [-290, 70, -150, 88], [280, 66, -140, 90], [-10, 150, -210, 110]];
  const cloudMats: THREE.MeshBasicMaterial[] = [], clouds: { m: THREE.Mesh; x0: number }[] = [];
  cloudDefs.forEach(([x, y, z, w], i) => {
    const mat = new THREE.MeshBasicMaterial({ map: P.cloudTex(seed + 40 + i), transparent: true, depthWrite: false, fog: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.5), mat);
    m.position.set(x, y, z); m.lookAt(0, 0, 0); m.renderOrder = -8; m.layers.set(NOINK); m.frustumCulled = false; m.name = "cloud"; group.add(m);
    cloudMats.push(mat); clouds.push({ m, x0: x });
  });

  // ---------------- falling snow (season 0) and drifting petals (season 2): soft points on NOINK, positions a pure function of t ----------------
  const SN = 800, PN = 280, sp = new Float32Array(SN * 3), ss = new Float32Array(SN * 4), sr = P.rng(seed + 60);
  for (let i = 0; i < SN; i++) { sp[i * 3] = sr(); sp[i * 3 + 1] = sr(); sp[i * 3 + 2] = sr(); ss[i * 4] = sr(); ss[i * 4 + 1] = sr(); ss[i * 4 + 2] = sr(); ss[i * 4 + 3] = 0.02 + 0.02 * sr(); }
  const fallPos = new THREE.BufferAttribute(sp, 3), fallSeed = new THREE.BufferAttribute(ss, 4);
  const _v2 = new THREE.Vector2();
  /** `count` flakes in a 24 x 9 x 24 m box that follows the focus: fall m/s, wind m/s along +x, sway m, size x, colour */
  const makeFall = (name: string, count: number, col: string, fall: number, wind: number, sway: number, size: number, alpha: number) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", fallPos); geo.setAttribute("aSeed", fallSeed); geo.setDrawRange(0, count);
    const u = { uT: { value: 0 }, uC: { value: V(0, 0, 0) }, uH: { value: 1920 }, uCol: { value: new THREE.Color(col) }, uK: { value: new THREE.Vector4(fall, wind, sway, size) }, uA: { value: alpha } };
    const pts = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: u, transparent: true, depthWrite: false, fog: false,
      vertexShader: `uniform float uT; uniform vec3 uC; uniform float uH; uniform vec4 uK; attribute vec4 aSeed; varying float vA;
        void main(){
          vec3 box = vec3(24.0, 9.0, 24.0);
          vec3 p = position * box;
          p.y -= uT * uK.x * (0.95 + 0.5 * aSeed.x);
          p.x += uT * uK.y + uK.z * sin(uT * (0.7 + aSeed.y) + aSeed.z * 6.283);
          p.z += uK.z * 0.8 * sin(uT * (0.5 + aSeed.z) + aSeed.x * 6.283);
          vec3 lo = vec3(uC.x - 12.0, 0.0, uC.z - 10.0);
          p = lo + mod(p - lo, box);
          vec4 mv = viewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float d = max(0.1, -mv.z);
          gl_PointSize = clamp(aSeed.w * uK.w * uH * projectionMatrix[1][1] * 0.5 / d, 1.5, uH * 0.011 * uK.w);
          vA = smoothstep(0.6, 2.2, d) * (0.75 + 0.25 * aSeed.y);
        }`,
      fragmentShader: "uniform vec3 uCol; uniform float uA; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.4, d) * vA; gl_FragColor = vec4(uCol, a * uA); }",
    }));
    pts.frustumCulled = false; pts.layers.set(NOINK); pts.renderOrder = 20; pts.name = name; group.add(pts);
    pts.onBeforeRender = (gl) => { const rt = gl.getRenderTarget(); u.uH.value = rt ? rt.height : gl.getDrawingBufferSize(_v2).y; };
    return { pts, u };
  };
  const snowFall = makeFall("snowfall", SN, "#ffffff", 1.0, 0.3, 0.28, 1.0, 0.92);
  const petalFall = makeFall("petals", PN, "#ffbcd8", 0.42, 0.75, 0.5, 2.1, 0.96);
  const snow = snowFall.pts, petals = petalFall.pts, falls = [snowFall, petalFall];

  // ---------------- lights ----------------
  const sun = new THREE.DirectionalLight(YARD_SUN.color, YARD_SUN.intensity);
  sun.castShadow = true; sun.shadow.mapSize.set(LIGHTS.shadow.mapSize, LIGHTS.shadow.mapSize);
  sun.shadow.radius = LIGHTS.shadow.radius; sun.shadow.bias = LIGHTS.shadow.bias; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -8.5, right: 8.5, bottom: -7, top: 12, near: 1, far: 90 }); sun.shadow.camera.updateProjectionMatrix();
  const hemi = new THREE.HemisphereLight("#ffffff", "#ffffff", 0.5);
  const sd = V(...YARD_SUN.dir).normalize();
  // the shadow camera's own x / y axes: the focus is snapped to whole shadow texels along them, so a gliding focus
  // (a travelling shot) does not make every shadow edge crawl
  const sAx = V(0, 1, 0).cross(sd).normalize(), sAy = sd.clone().cross(sAx).normalize();
  const TEXEL_X = 17 / LIGHTS.shadow.mapSize, TEXEL_Y = 19 / LIGHTS.shadow.mapSize, _f = V(0, 0, 0);
  const setFocus = (x: number, z = 0) => {
    _f.set(x, 0, z);
    const u = _f.dot(sAx), v = _f.dot(sAy);
    _f.addScaledVector(sAx, Math.round(u / TEXEL_X) * TEXEL_X - u).addScaledVector(sAy, Math.round(v / TEXEL_Y) * TEXEL_Y - v);
    sun.target.position.copy(_f); sun.position.copy(_f).addScaledVector(sd, 45);
    sun.target.updateMatrixWorld(); sun.updateMatrixWorld();
    for (const f of falls) f.u.uC.value.set(x, 0, z);
  };

  // ---------------- seasons, animation ----------------
  let season: Season = 0;
  const setSeason = (k: Season) => {
    season = k;
    const L = LOOK[k];
    ground.material = groundMats[k]; path.material = pathMats[k]; pave.material = paveMats[k];
    caps.visible = k === 0; drifts.visible = k <= 1; drifts.scale.set(1, k === 1 ? 0.6 : 1, 1);
    blossom.visible = k === 2; leaves.visible = k === 3; snow.visible = k === 0; petals.visible = k === 2;
    bare.visible = k !== 0; shrubs.visible = k >= 2; mShrub.color.set(SHRUB_COL[k === 3 ? 1 : 0]); mCope.color.set(k === 0 ? "#f4f8ff" : COPE);
    skyU.cH.value.set(L.hor); skyU.cM.value.set(L.mid); skyU.cZ.value.set(L.zen);
    farRoofs.forEach((m, i) => m.color.set(k === 0 ? "#eef3fb" : FAR_ROOF[i])); mSlate.color.set(k === 0 ? "#e9eff9" : "#70819b");   // far roofs under snow
    farMat.color.set(L.far); for (const m of cloudMats) { m.color.set(L.cloud); m.opacity = k === 1 ? 0.8 : 1; }
    sun.color.set(L.sun); sun.intensity = L.sunI; hemi.color.set(L.hemiS); hemi.groundColor.set(L.hemiG); hemi.intensity = L.hemiI;
  };
  const _p = V(0, 0, 0);
  const animate = (t: number) => {
    for (const pn of pennants) {
      const pos = pn.mesh.geometry.attributes.position as THREE.BufferAttribute, N = pos.count / 2 - 1;
      for (let i = 0; i <= N; i++) {
        const u = i / N, x = u * pn.L, hh = pn.h * 0.5 * (1 - 0.82 * u);
        const z = (Math.sin(u * 6.5 - t * 7 + pn.ph) * 0.11 + Math.sin(u * 3.1 - t * 3.3 + pn.ph * 2) * 0.07) * u, y = -0.22 * u * u * pn.L + Math.sin(u * 5 - t * 5 + pn.ph) * 0.03 * u;
        pos.setXYZ(i * 2, x, y + hh, z); pos.setXYZ(i * 2 + 1, x, y - hh, z);
      }
      pos.needsUpdate = true; pn.mesh.geometry.computeVertexNormals();
    }
    const bp = buntMesh.geometry.attributes.position as THREE.BufferAttribute;
    for (const b of buntTips) { _p.copy(b.base); _p.z += Math.sin(t * 3.4 + b.ph) * 0.09 + Math.sin(t * 5.3 + b.ph * 1.7) * 0.03; _p.x += Math.sin(t * 2.6 + b.ph) * 0.03; bp.setXYZ(b.i, _p.x, _p.y, _p.z); }
    bp.needsUpdate = true;
    for (const f of falls) f.u.uT.value = t;
    for (const c of clouds) { const x = ((((c.x0 + t * 1.6 + 520) % 1040) + 1040) % 1040) - 520; c.m.position.x = x; }
  };

  // ---------------- anchors ----------------
  const fieldCrowd: THREE.Vector3[] = [], yardRing: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) fieldCrowd.push(V(-18.7 + (i - 3.5) * 1.2, 0, -3.2));
  for (let i = 0; i < 12; i++) { const a = Math.PI + (i / 11) * Math.PI, r = i % 2 ? 3.15 : 2.5; yardRing.push(V(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  const anchors = {
    stone: V(0, 0, 0), portal: V(0, 0, -7.8), kay: V(-18, 0, 2.6), fieldCrowd, door: V(17, 1.0, -3.2), doorMark: V(17, 0, -2.3), yardRing,
    gateW: V(-9.5, 0, 3.5), gateE: V(9.5, 0, 3.5),
  };

  setSeason(0); setFocus(0, 0); animate(0);
  // triangles: everything in the group / what one season draws at most
  const triOf = (o: THREE.Object3D) => { const g = (o as THREE.Mesh).geometry; return (o as THREE.Mesh).isMesh && g ? (g.index ? g.index.count : g.attributes.position.count) / 3 : 0; };
  let all = 0; group.traverse((o) => { all += triOf(o); });
  const perSeason = [0, 1, 2, 3].map((k) => { setSeason(k as Season); let n = 0; group.traverseVisible((o) => { n += triOf(o); }); return n; });
  setSeason(0);
  group.userData.tris = all; group.userData.trisDrawn = Math.max(...perSeason); group.userData.trisPerSeason = perSeason;
  void season;
  return { group, lights: [sun, sun.target, hemi], anchors, setSeason, setFocus, animate, bg: (k: Season) => LOOK[k].hor, colliders };
}
