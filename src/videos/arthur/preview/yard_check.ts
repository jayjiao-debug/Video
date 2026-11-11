// QA of the set's API (no picture worth looking at: read the "QA:" lines):
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/yard_check.ts /tmp/x.png --size 270x480
// Calls every function of YardSet and prints: the anchors, anchors that sit inside a collider, the triangle counts
// (all / drawn per season) against renderer.info, whether animate(t) is a pure function of t (state after
// animate(3) -> animate(40 / 30) against a fresh set's animate(40 / 30)), whether setSeason is idempotent and
// order-independent, bg per season, the shadow frustum, and whether setFocus keeps the sun's direction.
import * as THREE from "three";
import { preview } from "./common";
import { YARD_FILL, YARD_AO, YARD_SUN, YARD_CAST_LIGHT, buildYard, type Season, type YardSet } from "../sets/yard";

const r3 = (v: THREE.Vector3) => `(${+v.x.toFixed(3)}, ${+v.y.toFixed(3)}, ${+v.z.toFixed(3)})`;
/** a hash of everything animate / setSeason / setFocus can change */
function state(set: YardSet, ids = true) {
  let h = 2166136261;
  const mix = (x: number) => { h ^= Math.round(x * 1e5) | 0; h = Math.imul(h, 16777619); };
  const objs: THREE.Object3D[] = []; set.group.traverse((o) => objs.push(o)); for (const l of set.lights) objs.push(l);
  for (const o of objs) {
    mix(o.visible ? 1 : 0); mix(o.position.x); mix(o.position.y); mix(o.position.z); mix(o.scale.x); mix(o.scale.y); mix(o.scale.z);
    const L = o as THREE.DirectionalLight; if ((L as any).isLight) { mix(L.intensity); mix(L.color.r); mix(L.color.g); mix(L.color.b); }
    const m = o as THREE.Mesh;
    if ((m as any).isMesh || (m as any).isPoints) {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats as any[]) {
        if (ids) mix(mat.id % 100000); if (mat.color) { mix(mat.color.r); mix(mat.color.g); mix(mat.color.b); } mix(mat.opacity ?? 1);
        if (mat.uniforms) for (const k of Object.keys(mat.uniforms)) { const v = mat.uniforms[k].value; if (typeof v === "number") mix(v); else if (v && v.isColor) { mix(v.r); mix(v.g); mix(v.b); } else if (v && v.isVector3) { mix(v.x); mix(v.y); mix(v.z); } }
      }
      if (m.name === "pennant" || m.name === "bunting") { const p = m.geometry.attributes.position.array as Float32Array; for (let i = 0; i < p.length; i++) mix(p[i]); }
    }
  }
  return h >>> 0;
}

preview({ w: 270, h: 480 }, (c) => {
  const M = c.mats(YARD_FILL);
  const set = buildYard(M), A = set.anchors;
  c.scene.add(set.group, ...set.lights);
  const say = (s: string) => console.log("QA: " + s);
  say(`exports: FILL ${YARD_FILL.frame} stops ${YARD_FILL.stops.length}; AO ${JSON.stringify(YARD_AO)}; SUN ${JSON.stringify(YARD_SUN)} |dir| ${Math.hypot(...YARD_SUN.dir).toFixed(4)}; CAST key ${JSON.stringify(YARD_CAST_LIGHT.key)} contact ${YARD_CAST_LIGHT.contact}`);
  say(`anchors: stone ${r3(A.stone)} portal ${r3(A.portal)} kay ${r3(A.kay)} door ${r3(A.door)} doorMark ${r3(A.doorMark)} gateW ${r3(A.gateW)} gateE ${r3(A.gateE)}`);
  say(`fieldCrowd ${A.fieldCrowd.length}: ${A.fieldCrowd.map(r3).join(" ")}`);
  say(`yardRing ${A.yardRing.length}: ${A.yardRing.map((p) => `${r3(p)} r=${Math.hypot(p.x, p.z).toFixed(2)}`).join(" ")}`);
  const inside = (p: THREE.Vector3, pad = 0.2) => set.colliders.filter((b) => p.x > b.min[0] - pad && p.x < b.max[0] + pad && p.z > b.min[2] - pad && p.z < b.max[2] + pad && p.y < b.max[1]).map((b) => b.name);
  const floor: [string, THREE.Vector3][] = [["stone", A.stone], ["portal", A.portal], ["kay", A.kay], ["doorMark", A.doorMark], ["gateW", A.gateW], ["gateE", A.gateE],
    ...A.fieldCrowd.map((p, i) => ["fieldCrowd" + i, p] as [string, THREE.Vector3]), ...A.yardRing.map((p, i) => ["yardRing" + i, p] as [string, THREE.Vector3])];
  const bad = floor.map(([n, p]) => [n, inside(p)] as [string, string[]]).filter(([, l]) => l.length);
  say(`floor anchors within 0.2 m of a collider: ${bad.length ? bad.map(([n, l]) => `${n} in ${l.join("+")}`).join("; ") : "none"}`);
  say(`colliders ${set.colliders.length}: ${[...new Set(set.colliders.map((b) => b.name))].join(", ")}; degenerate: ${set.colliders.filter((b) => b.min.some((v, i) => v >= b.max[i])).length}`);
  say(`tris: all ${set.group.userData.tris}, drawn per season ${JSON.stringify(set.group.userData.trisPerSeason)}`);
  say(`bg: ${[0, 1, 2, 3].map((k) => set.bg(k as Season)).join(" ")}`);
  // setSeason: idempotent, independent of the order
  const seasonHash = (order: Season[]) => { for (const k of order) set.setSeason(k); return state(set); };
  const s2a = seasonHash([2]), s2b = seasonHash([2, 2]), s2c = seasonHash([0, 3, 1, 2]), s0a = seasonHash([0]), s0b = seasonHash([3, 0]);
  say(`setSeason: idempotent ${s2a === s2b}, order-independent ${s2a === s2c && s0a === s0b}, seasons differ ${new Set([0, 1, 2, 3].map((k) => seasonHash([k as Season]))).size === 4}`);
  set.setSeason(0);
  // animate: pure in t
  const other = buildYard(M);
  set.animate(3); set.animate(40 / 30); other.animate(40 / 30);
  const pa = state(set, false), pb = state(other, false);
  set.animate(7.5); const pc = state(set, false);
  set.animate(40 / 30); const pd = state(set, false);
  say(`animate: pure ${pa === pb && pa === pd} (same t after another history and on a fresh set), moves ${pa !== pc}`);
  // setFocus: the sun keeps its direction, the frustum is centred on the focus
  const sun = set.lights[0] as THREE.DirectionalLight;
  const dirs: string[] = [];
  for (const [x, z] of [[0, 0], [-18, 1], [17, -1], [3.337, 2.2]]) {
    set.setFocus(x, z);
    const d = sun.position.clone().sub(sun.target.position).normalize();
    dirs.push(`focus (${x}, ${z}): dir ${r3(d)} target off by ${sun.target.position.distanceTo(new THREE.Vector3(x, 0, z)).toFixed(4)} m`);
  }
  say(`setFocus: ${dirs.join("; ")}`);
  const sc = sun.shadow.camera;
  say(`shadow: map ${sun.shadow.mapSize.x}, frustum ${sc.right - sc.left} x ${sc.top - sc.bottom} m, near ${sc.near} far ${sc.far}, lights ${set.lights.map((l) => l.type).join(", ")}`);
  set.setFocus(0, 0); set.animate(2);
  return {
    cam: { pos: [0, 1.35, 5.2], look: [0, 1.0, 0], fov: 50 }, ao: YARD_AO, bg: set.bg(0),
    frame: () => { const i = c.renderer.info; if (i.render.triangles) console.log(`QA: renderer.info, the frame before (all passes: shadow + colour + AO + ink normals): ${i.render.triangles} triangles, ${i.render.calls} calls`); i.autoReset = false; i.reset(); },
  };
});
