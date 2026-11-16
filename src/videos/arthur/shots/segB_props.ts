// Segment B's own small props (built once per World, parented to w.root, hidden unless a frame of B shows them):
//   - the TEN SPEARS the guards left planted in a row behind the stone ("连十个守卫都看比武去了"), each in a little heap
//     of snow, with the trail of footprints of the men who walked off to the tournament;
//   - two puffs of snow (a skid stop, a landing).
// Style: the spears are drawn like THE sword (props.ts): off the world's ink pass (layer NOINK) with an inverted hull
// of their own, so a 4 cm shaft keeps its colour at 8 m instead of turning into a black stick. The snow heaps, the
// footprints and the puffs are plain world meshes (the ink pass outlines them like the set's own drifts).
// Everything is static geometry from fixed numbers and hash(): nothing here changes between frames except what
// begin() / spears() / puff() are told.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { NOINK } from "../../vasa/ink";
import type { World } from "../world";
import { hash, clamp01 } from "../story";

/** the guard line: ten spears in a row behind the stone (x = spearX(i), z = SPEAR_Z), five on either side of a gap
 *  of 1.1 m straight behind the sword (so THE sword never stands in front of a spear's shaft: seen from the film's
 *  cameras it has the church door behind it). 0.3 m apart: the whole row is 3.5 m wide, which a 9:16 frame still holds
 *  from 6 m with fov 46 */
export const SPEAR_N = 10, SPEAR_Z = -1.7, SPEAR_DX = 0.3, SPEAR_GAP = 0.55, SPEAR_H = 1.86;
export const spearX = (i: number) => (i < 5 ? -(SPEAR_GAP + (4 - i) * SPEAR_DX) : SPEAR_GAP + (i - 5) * SPEAR_DX);

export type BProps = {
  /** hide everything (call first in every pose) */
  begin(): void;
  /** show the row of spears (and the footprints) */
  spears(on: boolean): void;
  /** a puff of snow: slot 0 / 1, k 0..1 its life (outside 0..1 = hidden), at = the floor point, dir = which way the
   *  snow is thrown (x, z; need not be normalised) */
  puff(slot: 0 | 1, k: number, at: THREE.Vector3, dir: [number, number]): void;
};

const INK = { w: 0.0045, minPx: 2.6, color: "#15131a" };
/** the sword's kind of ink line (props.ts SWORD_INK): the shape drawn back-side-only, pushed out along its normals by
 *  w metres and never less than minPx pixels of a 1080 x 1920 picture */
function hullMat() {
  const m = new THREE.MeshBasicMaterial({ color: INK.color, side: THREE.BackSide });
  const U = { uInkW: { value: INK.w }, uInkMinPx: { value: INK.minPx } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uInkW; uniform float uInkMinPx;")
      .replace("#include <project_vertex>", /* glsl */ `
vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
{
  vec3 nv = normalize( normalMatrix * normal );
  float px = 2.0 * ( -mvPosition.z ) / ( projectionMatrix[ 1 ][ 1 ] * 1920.0 );
  mvPosition.xyz += nv * max( uInkW, uInkMinPx * px );
}
gl_Position = projectionMatrix * mvPosition;`);
  };
  m.customProgramCacheKey = () => "arthur-segB-ink";
  return m;
}
const plain = (g: THREE.BufferGeometry) => { const s = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(s.attributes)) if (k !== "position" && k !== "normal") s.deleteAttribute(k); return s; };

const cache = new WeakMap<World, BProps>();
export function propsOf(w: World): BProps {
  const had = cache.get(w);
  if (had) return had;
  const M = w.M, root = new THREE.Group();
  root.name = "segB-props"; root.visible = false; w.root.add(root);

  // ---------------------------------------------------------------- the spears
  const spearG = new THREE.Group(); spearG.name = "segB-spears"; root.add(spearG);
  const wood: THREE.BufferGeometry[] = [], steel: THREE.BufferGeometry[] = [], snow: THREE.BufferGeometry[] = [], prints: THREE.BufferGeometry[] = [];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < SPEAR_N; i++) {
    const x = spearX(i), z = SPEAR_Z + (hash(i, 5) - 0.5) * 0.05;
    // each one stands a little differently (stuck in by hand): a lean of a degree or two
    e.set((hash(i, 1) - 0.5) * 0.07, hash(i, 4) * 6.283, (hash(i, 2) - 0.5) * 0.09);
    q.setFromEuler(e); m4.compose(new THREE.Vector3(x, 0, z), q, one);
    const sl = SPEAR_H - 0.3, rs = 0.021;
    wood.push(plain(new THREE.CylinderGeometry(rs, rs, sl + 0.1, 10, 1).translate(0, sl / 2 - 0.05, 0)).applyMatrix4(m4));
    // the head: a socket and a flat leaf, broadside to the camera (the lean's yaw is undone for the leaf: e.y about y)
    const sock = plain(new THREE.CylinderGeometry(0.024, 0.03, 0.1, 10, 1).translate(0, sl + 0.02, 0));
    const pts = [[0.0, 0], [0.03, 0.005], [0.062, 0.1], [0.045, 0.2], [0.0, 0.3]].map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0005), y));
    const leaf = new THREE.LatheGeometry(pts, 14).rotateY(-e.y).scale(1, 1, 0.32).translate(0, sl + 0.05, 0);
    leaf.computeVertexNormals();
    steel.push(sock.applyMatrix4(m4), plain(leaf).applyMatrix4(m4));
    // the heap of snow it stands in
    const r0 = 0.15 + 0.04 * hash(i, 7);
    snow.push(plain(new THREE.SphereGeometry(r0, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5 + 0.2 * hash(i, 8), 0.9)).translate(x + (hash(i, 9) - 0.5) * 0.04, 0, z + 0.02));
    // his footprints: he stood in front of his spear, then walked off to the left (west, to the tournament): the trails
    // run together into one beaten track that leaves the yard toward the gate
    const foot = (px: number, pz: number, yaw: number) => prints.push(plain(new THREE.CircleGeometry(1, 10).rotateX(-Math.PI / 2).scale(0.07, 1, 0.15).rotateY(yaw).translate(px, 0.012, pz)));
    foot(x - 0.085, z + 0.42, 0.2); foot(x + 0.085, z + 0.42, -0.2);
  }
  // the beaten track: two rows of prints that run along the row BEHIND the stone (z -1.0) to the left and curve out
  // of the picture toward the path
  const sm = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
  for (let k = 0; k < 19; k++) {
    const u = k / 18, px = 1.7 - u * 5.8, pz = -1.0 + 1.9 * sm((u - 0.55) / 0.45), yaw = -Math.PI / 2 + 0.6 * sm((u - 0.5) / 0.4);
    for (const s of [-1, 1]) {
      const j = k * 2 + (s > 0 ? 1 : 0);
      prints.push(plain(new THREE.CircleGeometry(1, 10).rotateX(-Math.PI / 2).scale(0.07, 1, 0.15).rotateY(yaw + 0.2 * s + (hash(j, 21) - 0.5) * 0.3).translate(px + (s > 0 ? 0.15 : 0) + (hash(j, 22) - 0.5) * 0.08, 0.012, pz + s * 0.09 + (hash(j, 23) - 0.5) * 0.06)));
    }
  }
  const woodMat = M.wood({ color: "#a8713c", roughness: 0.8 });
  const steelMat = M.metalWith({ color: "#dfe5ee", roughness: 0.3, metalness: 0.2, map: null, envMapIntensity: 1.1 });
  steelMat.emissive = new THREE.Color("#b9c6da"); steelMat.emissiveIntensity = 0.25;
  const snowMat = M.paint({ color: "#f1f6fd", roughness: 0.9, specular: 0.2 });
  const printMat = M.paint({ color: "#7386b4", roughness: 0.95, specular: 0.05 });
  const gw = mergeGeometries(wood, false)!, gs = mergeGeometries(steel, false)!;
  const woodMesh = new THREE.Mesh(gw, woodMat), steelMesh = new THREE.Mesh(gs, steelMat);
  const hull = new THREE.Mesh(mergeGeometries([gw, gs], false)!, hullMat());
  for (const m of [woodMesh, steelMesh]) { m.castShadow = true; m.receiveShadow = false; }
  for (const m of [woodMesh, steelMesh, hull]) { m.layers.set(NOINK); m.frustumCulled = false; spearG.add(m); }
  const snowMesh = new THREE.Mesh(mergeGeometries(snow, false)!, snowMat); snowMesh.receiveShadow = true; snowMesh.name = "segB-heaps"; spearG.add(snowMesh);
  const printMesh = new THREE.Mesh(mergeGeometries(prints, false)!, printMat); printMesh.receiveShadow = true; printMesh.name = "segB-prints"; printMesh.layers.set(NOINK); spearG.add(printMesh);

  // ---------------------------------------------------------------- the puffs of snow
  const NP = 9, puffMat = M.paint({ color: "#f6f9ff", roughness: 0.95, specular: 0.1 });
  const ball = new THREE.SphereGeometry(1, 12, 9);
  const puffs: THREE.Mesh[][] = [0, 1].map((s) => Array.from({ length: NP }, (_, i) => { const m = new THREE.Mesh(ball, puffMat); m.name = `segB-puff${s}.${i}`; m.visible = false; m.castShadow = false; root.add(m); return m; }));

  const api: BProps = {
    begin() { root.visible = true; spearG.visible = false; for (const s of puffs) for (const m of s) m.visible = false; },
    spears(on) { spearG.visible = on; },
    puff(slot, k, at, dir) {
      if (k <= 0 || k >= 1) return;
      const L = Math.hypot(dir[0], dir[1]) || 1, dx = dir[0] / L, dz = dir[1] / L, out = 1 - (1 - k) * (1 - k);
      puffs[slot].forEach((m, i) => {
        const a = hash(i, 31 + slot), b = hash(i, 37 + slot), c = hash(i, 41 + slot);
        const side = (a - 0.5) * 0.7, far = (0.1 + 0.5 * b) * out, up = (0.03 + 0.3 * c) * Math.sin(Math.PI * Math.min(1, k * 1.15)) * (0.5 + 0.5 * out);
        const r = (0.022 + 0.034 * (1 - b)) * Math.sin(Math.PI * Math.pow(clamp01(k), 0.6));
        m.visible = r > 0.004;
        m.position.set(at.x + dx * far - dz * side * (0.4 + out), at.y + 0.03 + up, at.z + dz * far + dx * side * (0.4 + out));
        m.scale.setScalar(Math.max(r, 0.001));
      });
    },
  };
  // segments other than B never call begin(): the group stays hidden for them
  cache.set(w, api);
  return api;
}
/** hide everything of segment B (SEG.exit) */
export function hideProps(w: World) { const p = cache.get(w); if (p) { p.begin(); } const g = w.root.getObjectByName("segB-props"); if (g) g.visible = false; }
