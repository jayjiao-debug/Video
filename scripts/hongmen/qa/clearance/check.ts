// Headless clearance checker of the Hongmen film (README.md). Builds the REAL World (sets, props, rig cast) in node
// with inert canvas / WebGL stubs (stub.js), runs the real segments' pose(w, f) through beginFrame / endFrame exactly as
// the film does, then measures interpenetration between the meshes the World built, placed by their world matrices.
//   bash scripts/hongmen/qa/clearance/run.sh                  the whole film, one file pair per segment
//   bash scripts/hongmen/qa/clearance/run.sh --seg D          one segment;  --from 1400 --to 1500  a range
//   options: --tol 1 (cm)  --step 1  --out DIR  --seed (the seeded-clip validation)  --pts (write every penetrating
//            pair's deepest point even off screen; default too)  --quiet
import * as THREE from "three";
import * as fs from "fs";
import { World } from "../../../../src/videos/hongmen/world";
import { SEG as SA } from "../../../../src/videos/hongmen/shots/segA";
import { SEG as SB } from "../../../../src/videos/hongmen/shots/segB";
import { SEG as SC } from "../../../../src/videos/hongmen/shots/segC";
import { SEG as SD } from "../../../../src/videos/hongmen/shots/segD";
import { SEG as SE } from "../../../../src/videos/hongmen/shots/segE";
import { shotAt } from "../../../../src/videos/hongmen/beats";
import { SEATS } from "../../../../src/videos/hongmen/layout";
import { W as FW, H as FH, type Segment } from "../../../../src/videos/hongmen/story";
import { TriSolid, PlacedTri, Capsules, Sphere, trisOf, componentsOf, planarOf, samplesOf, bboxOf, BALL_DIRS, type Solid } from "./vol";

// ---------------------------------------------------------------------------------------------------------------------
// options
// ---------------------------------------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const opt = (k: string, d?: string) => { const i = argv.indexOf("--" + k); return i >= 0 ? argv[i + 1] : d; };
const flag = (k: string) => argv.includes("--" + k);
const TOL = Number(opt("tol", "1")) / 100;
const STEP = Math.max(1, Number(opt("step", "1")));
const OUT = opt("out", "/home/user/hm_work/qa/clearance")!;
const SEEDED = flag("seed"), QUIET = flag("quiet");
/** findings of one pair less than GAP frames apart are one range in the summary */
const GAP = Math.max(Number(opt("gap", "6")), STEP + 1);
const DUMP = new Set((opt("dump", "") ?? "").split(",").filter(Boolean).map(Number));
const SEGS: Segment[] = [SA, SB, SC, SD, SE];
const segArg = opt("seg");
const fromArg = opt("from"), toArg = opt("to");
type Job = { name: string; from: number; to: number };
let jobs: Job[];
if (fromArg !== undefined || toArg !== undefined) {
  const a = Number(fromArg ?? 0), b = Number(toArg ?? SE.to);
  jobs = [{ name: SEEDED ? `seed_f${a}-${b}` : `f${a}-${b}`, from: a, to: b }];
} else {
  const ids = segArg ? segArg.toUpperCase().split(",") : SEGS.map((s) => s.id);
  jobs = SEGS.filter((s) => ids.includes(s.id)).map((s) => ({ name: (SEEDED ? "seed_" : "") + s.id, from: s.from, to: s.to }));
}
fs.mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------------------------------------------------------------
// the World, headless
// ---------------------------------------------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(40, FW / FH, 0.03, 600);
const w = new World((globalThis as any).__mk(), camera);
const W_: any = w;

// ---------------------------------------------------------------------------------------------------------------------
// parts: what is tested against what
// ---------------------------------------------------------------------------------------------------------------------
type Kind = "fig" | "prop" | "set";
type Part = {
  id: string; owner: string; kind: Kind; role: string;
  solids: Solid[]; pts: Float32Array; mn: number[]; mx: number[];
  /** a hand: its ball */ hand?: { i: 0 | 1; c: THREE.Vector3; r: number };
  /** an arm: where it leaves the body (its first ring) */ root?: THREE.Vector3;
  /** a held thing: which figure's which hand */ heldBy?: { fig: string; i: 0 | 1; c: THREE.Vector3 }[];
  /** set: a cushion (pads) */ soft?: boolean;
  /** set: info for the report */ info?: string;
  /** per-figure scale */ s?: number;
  /** placed tri solids (for support rays) */ tris?: PlacedTri[];
};
const aabbOf = (pts: Float32Array, solids: Solid[]) => {
  const b = bboxOf(pts);
  for (const s of solids) for (let a = 0; a < 3; a++) { if (s.mn[a] < b.mn[a]) b.mn[a] = s.mn[a]; if (s.mx[a] > b.mx[a]) b.mx[a] = s.mx[a]; }
  return b;
};
const xform = (local: Float32Array, m: THREE.Matrix4, out?: Float32Array) => {
  const e = m.elements, o = out ?? new Float32Array(local.length);
  for (let i = 0; i < local.length; i += 3) {
    const x = local[i], y = local[i + 1], z = local[i + 2];
    o[i] = e[0] * x + e[4] * y + e[8] * z + e[12]; o[i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; o[i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
  }
  return o;
};
const cat = (arrs: Float32Array[]) => { let n = 0; for (const a of arrs) n += a.length; const o = new Float32Array(n); let k = 0; for (const a of arrs) { o.set(a, k); k += a.length; } return o; };
const visibleUp = (o: THREE.Object3D) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (!p.visible) return false; return true; };
/** a mesh that is drawn as a surface (not an ink hull, a depth-only twin, a shadow disc, a glow, a background) */
const SKIP_NAME = /(^|\.)(ink|far|sky|backdrop|glow|contact|blob|spill|light|flame|shadow|outside)(\.|$)|^glow$|^far$|^sky$/;
const surfaceMesh = (m: THREE.Mesh) => {
  if (!m.isMesh || m.userData.hull || m.userData.depthOnly) return false;
  const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.Material;
  if (!mat || mat.colorWrite === false || mat.side === THREE.BackSide) return false;
  if (SKIP_NAME.test(m.name)) return false;
  return true;
};

// ---- geometry caches (static geometry: once; dynamic geometry: rebuilt when its position attribute changes)
type GeoC = { ver: number; ts: TriSolid; pts: Float32Array };
const geoCache = new WeakMap<THREE.BufferGeometry, GeoC>();
const geoOf = (g: THREE.BufferGeometry, sp: number, cap: number): GeoC => {
  const ver = (g.attributes.position as THREE.BufferAttribute).version;
  let c = geoCache.get(g);
  if (!c || c.ver !== ver) {
    const tri = trisOf(g);
    c = { ver, ts: new TriSolid(tri), pts: samplesOf(tri, sp, cap) };
    geoCache.set(g, c);
  }
  return c;
};
const meshSolids = (meshes: THREE.Mesh[], sp: number, cap: number) => {
  const solids: PlacedTri[] = [], pts: Float32Array[] = [];
  for (const m of meshes) {
    const c = geoOf(m.geometry, sp, cap);
    if (c.ts.n === 0) continue;
    solids.push(new PlacedTri(c.ts, m.matrixWorld)); pts.push(xform(c.pts, m.matrixWorld));
  }
  return { solids, pts: cat(pts) };
};

// ---- figures
const rigNames = (): Map<any, string> => {
  const byId = new Map<number, string>(), out = new Map<any, string>();
  for (const [p, id] of W_.ids as Map<any, number>) byId.set(id, p.name);
  for (const [k, r] of W_.rigs as Map<string, any>) { const [id, key] = k.split("|"); out.set(r, byId.get(Number(id)) + (key ? ":" + key : "")); }
  return out;
};
/** the acc name of every object an accessory built (and what holds what) */
const accIndex = new WeakMap<any, { acc: Map<THREE.Object3D, string>; held: Map<THREE.Object3D, 0 | 1> }>();
const accOf = (r: any) => {
  let a = accIndex.get(r);
  if (!a) {
    a = { acc: new Map(), held: new Map() };
    for (const { name, o } of r.accParts as { name: string; o: THREE.Object3D }[]) o.traverse((x) => { if (!a!.acc.has(x)) a!.acc.set(x, name); });
    for (const h of r.held as { g: THREE.Group; i: 0 | 1 }[]) h.g.traverse((x) => a!.held.set(x, h.i));
    accIndex.set(r, a);
  }
  return a;
};
const ROLE_NAMES = ["armR", "armL", "legR", "legL"];
function figureParts(r: any, name: string): Part[] {
  const g: THREE.Group = r.group, M = g.matrixWorld, s = Math.cbrt(Math.abs(M.determinant())) || 1, parts: Part[] = [];
  const mk = (role: string, solids: Solid[], pts: Float32Array, extra: Partial<Part> = {}): Part => {
    const b = aabbOf(pts, solids);
    return { id: `${name}.${role}`, owner: name, kind: "fig", role, solids, pts, mn: b.mn, mx: b.mx, s, ...extra };
  };
  // limbs: capsule chains from the tubes' rings (in the figure group's frame)
  for (let i = 0; i < 4; i++) {
    const tb = r.limbs[i], P = tb.geo.attributes.position.array as Float32Array, Mr: number = tb.M, Sr: number = tb.S;
    const rings: number[] = []; for (let k = 0; k <= Sr; k += 2) rings.push(k); if (rings[rings.length - 1] !== Sr) rings.push(Sr);
    const c = new Float32Array(rings.length * 3), rad = new Float32Array(rings.length), pts = new Float32Array(rings.length * Mr * 3), v = new THREE.Vector3();
    rings.forEach((k, q) => {
      let x = 0, y = 0, z = 0;
      for (let j = 0; j < Mr; j++) { const o = (k * Mr + j) * 3; x += P[o]; y += P[o + 1]; z += P[o + 2]; }
      x /= Mr; y /= Mr; z /= Mr; let rr = 0;
      for (let j = 0; j < Mr; j++) { const o = (k * Mr + j) * 3; rr += Math.hypot(P[o] - x, P[o + 1] - y, P[o + 2] - z); v.set(P[o], P[o + 1], P[o + 2]).applyMatrix4(M); pts.set([v.x, v.y, v.z], (q * Mr + j) * 3); }
      v.set(x, y, z).applyMatrix4(M); c.set([v.x, v.y, v.z], q * 3); rad[q] = (rr / Mr) * s;
    });
    const solids: Solid[] = [new Capsules(c, rad)], extra: Partial<Part> = { root: new THREE.Vector3(c[0], c[1], c[2]) };
    let allPts = pts;
    if (i < 2) {
      const cap = r.caps[i] as THREE.Mesh, cp = new THREE.Vector3().setFromMatrixPosition(cap.matrixWorld), cr = (cap.geometry as THREE.SphereGeometry).parameters.radius * s;
      solids.push(new Sphere(cp.x, cp.y, cp.z, cr));
      const h = r.hands[i] as THREE.Mesh, hc = new THREE.Vector3().setFromMatrixPosition(h.matrixWorld), hr = (h.geometry as THREE.SphereGeometry).parameters.radius * s;
      const hp = new Float32Array(BALL_DIRS.length * 3); BALL_DIRS.forEach((d, q) => hp.set([hc.x + d[0] * hr, hc.y + d[1] * hr, hc.z + d[2] * hr], q * 3));
      if (h.visible) parts.push(mk(i ? "handL" : "handR", [new Sphere(hc.x, hc.y, hc.z, hr)], hp, { hand: { i: i as 0 | 1, c: hc, r: hr } }));
    } else {
      const foot = (r.feet[i - 2] as THREE.Group).children[0] as THREE.Mesh;
      if (foot && visibleUp(foot)) { const ms = meshSolids([foot], 0.01, 80); solids.push(...ms.solids); allPts = cat([pts, ms.pts]); }
    }
    parts.push(mk(ROLE_NAMES[i], solids, allPts, extra));
  }
  // body, head (with everything on it), accessories by name, held things
  const A = accOf(r), torsoG: THREE.Object3D = r.torsoG, headG: THREE.Object3D = r.headG;
  const groups = new Map<string, THREE.Mesh[]>(), heldI = new Map<string, 0 | 1>();
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !surfaceMesh(m) || m === r.blob || m === r.ring || r.hands.includes(m) || r.caps.includes(m)) return;
    if (r.limbs.some((t: any) => t.geo === m.geometry)) return;
    if (r.feet.some((f: THREE.Group) => f.children.includes(m) || f.children.some((c) => c.children.includes(m)))) return;
    if (!visibleUp(m)) return;
    let inHead = false; for (let p: THREE.Object3D | null = m; p && p !== g; p = p.parent) if (p === headG) inHead = true;
    let clip = false; for (let p: THREE.Object3D | null = m; p && p !== g; p = p.parent) if (p === r.clip) clip = true;
    if (clip) return;
    let role: string;
    const acc = A.acc.get(m), hi = A.held.get(m);
    if (hi !== undefined) { role = `held:${acc ?? "thing"}`; heldI.set(role, hi); }
    else if (inHead) role = "head";
    else if (acc) role = `acc:${acc}`;
    else if (m.parent === torsoG) role = "body";
    else role = "other";
    let a = groups.get(role); if (!a) groups.set(role, (a = [])); a.push(m);
  });
  for (const [role, meshes] of groups) {
    const ms = meshSolids(meshes, 0.015, role === "head" ? 900 : 600);
    if (!ms.pts.length) continue;
    const extra: Partial<Part> = {};
    if (heldI.has(role)) { const i = heldI.get(role)!, h = parts.find((p) => p.hand && p.hand.i === i); extra.heldBy = [{ fig: name, i, c: h ? h.hand!.c : new THREE.Vector3(1e9, 0, 0) }]; }
    parts.push(mk(role, ms.solids, ms.pts, extra));
  }
  return parts;
}

// ---- props
function propParts(): Part[] {
  const out: Part[] = [];
  for (const g of w.props.group.children) {
    if (!g.visible || !g.name.startsWith("prop.")) continue;
    const meshes: THREE.Mesh[] = [];
    g.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && surfaceMesh(m) && visibleUp(m)) meshes.push(m); });
    const ms = meshSolids(meshes, 0.015, 700);
    if (!ms.pts.length) continue;
    const b = aabbOf(ms.pts, ms.solids);
    out.push({ id: g.name.replace(/^prop\./, "prop:"), owner: g.name, kind: "prop", role: "prop", solids: ms.solids, tris: ms.solids, pts: ms.pts, mn: b.mn, mx: b.mx });
  }
  return out;
}

// ---- the set: per mesh, its welded components; flat ones are point sources only, floors are left to the floor test
type Comp = { ts: TriSolid | null; local: Float32Array; label: string; soft: boolean; floor: boolean };
const compCache = new WeakMap<THREE.BufferGeometry, Comp[]>();
/** a unique, stable name per set mesh: its name, and [k] when several meshes share it (k = order of first sight) */
const meshLabel = new Map<THREE.Mesh, string>(), nameCount = new Map<string, number>();
const labelOf = (m: THREE.Mesh) => {
  let l = meshLabel.get(m);
  if (!l) { const n = m.name || "set", k = nameCount.get(n) ?? 0; nameCount.set(n, k + 1); l = k ? `${n}[${k}]` : n; meshLabel.set(m, l); }
  return l;
};
const setPartCache = new Map<THREE.Mesh, { key: string; parts: Part[] }>();
function setParts(): Part[] {
  const out: Part[] = [];
  w.set.group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !surfaceMesh(m) || !visibleUp(m)) return;
    const key = m.matrixWorld.elements.map((x) => x.toFixed(5)).join(",") + "|" + (m.geometry.attributes.position as THREE.BufferAttribute).version;
    const hit = setPartCache.get(m);
    if (hit && hit.key === key) { out.push(...hit.parts); return; }
    let comps = compCache.get(m.geometry);
    if (!comps) {
      const all = componentsOf(trisOf(m.geometry));
      comps = all.map((tri, k) => {
        const n = planarOf(tri), b = bboxOf(tri);
        const area = (() => { let A = 0; for (let t = 0; t < tri.length; t += 9) { const ax = tri[t + 3] - tri[t], ay = tri[t + 4] - tri[t + 1], az = tri[t + 5] - tri[t + 2], bx = tri[t + 6] - tri[t], by = tri[t + 7] - tri[t + 1], bz = tri[t + 8] - tri[t + 2]; A += 0.5 * Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx); } return A; })();
        const sp = Math.max(0.02, Math.sqrt(area / 20000));
        return { ts: n ? null : new TriSolid(tri), local: samplesOf(tri, sp, 20000), label: `${all.length > 1 ? "#" + k : ""}`, soft: /pad/.test(m.name), floor: !!n && Math.abs(n.y) > 0.99 && b.mx[1] - b.mn[1] < 0.03 };
      });
      compCache.set(m.geometry, comps);
    }
    const parts: Part[] = [];
    for (const c of comps) {
      if (c.floor) continue;
      const solids = c.ts ? [new PlacedTri(c.ts, m.matrixWorld)] : [];
      const pts = xform(c.local, m.matrixWorld), b = aabbOf(pts, solids);
      if (b.mx[1] - b.mn[1] < 0.03 && b.mx[1] < 0.03) continue;                       // flat on the ground: a floor
      const sz = [0, 1, 2].map((a) => b.mx[a] - b.mn[a]);
      if (sz[0] > 20 || sz[2] > 20) continue;                                          // a ground / a far hill
      const id = labelOf(m) + c.label;
      parts.push({ id, owner: id, kind: "set", role: c.ts ? "solid" : "sheet", solids, tris: solids as PlacedTri[], pts, mn: b.mn, mx: b.mx, soft: c.soft,
        info: `at ${[0, 1, 2].map((a) => ((b.mn[a] + b.mx[a]) / 2).toFixed(2)).join(",")} size ${sz.map((x) => x.toFixed(2)).join("x")}` });
    }
    setPartCache.set(m, { key, parts });
    out.push(...parts);
  });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// the test of one pair
// ---------------------------------------------------------------------------------------------------------------------
const frustum = new THREE.Frustum(), _pm = new THREE.Matrix4(), _box = new THREE.Box3(), _v = new THREE.Vector3();
const screenOf = (x: number, y: number, z: number) => { const q = w.project([x, y, z]); return { x: q.x, y: q.y, on: q.on }; };
type Best = { d: number; x: number; y: number; z: number; dOn: number; xo: number; yo: number; zo: number };
type Skip = { c: THREE.Vector3; r: number }[];
/** the parts of every figure this frame (by owner): a meeting point enclosed by a third part of either owner is hidden */
let byOwner = new Map<string, Part[]>();
const enclosed = (x: number, y: number, z: number, A: Part, B: Part): boolean => {
  if (A.kind === "fig" && /^leg/.test(A.role)) {
    const cx = (A.mn[0] + A.mx[0]) / 2, cz = (A.mn[2] + A.mx[2]) / 2, l = Math.hypot(cx - x, cz - z) || 1, k = Math.min(0.015, l) / l;
    if (enclosed1(x + (cx - x) * k, y, z + (cz - z) * k, A, B)) return true;
  }
  return enclosed1(x, y, z, A, B);
};
const enclosed1 = (x: number, y: number, z: number, A: Part, B: Part) => {
  for (const own of A.owner === B.owner ? [A.owner] : [A.owner, B.owner]) for (const C of byOwner.get(own) ?? []) {
    if (C === A || C === B || C.heldBy || /^(arm|hand)/.test(C.role)) continue;
    if (x < C.mn[0] || y < C.mn[1] || z < C.mn[2] || x > C.mx[0] || y > C.mx[1] || z > C.mx[2]) continue;
    for (const s of C.solids) if (s.depth(x, y, z) > 0.003) return true;
  }
  return false;
};
const near = (sk: Skip | undefined, x: number, y: number, z: number) => { if (sk) for (const s of sk) if (Math.hypot(x - s.c.x, y - s.c.y, z - s.c.z) < s.r) return true; return false; };
function intoPart(pts: Float32Array, B: Part, best: Best, skip?: Skip, ptsFrom = 0, A?: Part) {
  const mn = B.mn, mx = B.mx;
  for (let i = ptsFrom * 3; i < pts.length; i += 3) {
    const x = pts[i], y = pts[i + 1], z = pts[i + 2];
    if (x < mn[0] || y < mn[1] || z < mn[2] || x > mx[0] || y > mx[1] || z > mx[2]) continue;
    if (near(skip, x, y, z)) continue;
    let d = 0; for (const s of B.solids) { const q = s.depth(x, y, z); if (q > d) d = q; }
    if (d <= TOL) { if (d > best.d) { best.d = d; best.x = x; best.y = y; best.z = z; } continue; }
    if (d > best.d) { best.d = d; best.x = x; best.y = y; best.z = z; }
    if (d > best.dOn && y > -0.005 && screenOf(x, y, z).on && !(A && enclosed(x, y, z, A, B))) { best.dOn = d; best.xo = x; best.yo = y; best.zo = z; }
  }
}
function pairTest(A: Part, B: Part, skip?: Skip): Best | null {
  const mn = [0, 1, 2].map((a) => Math.max(A.mn[a], B.mn[a])), mx = [0, 1, 2].map((a) => Math.min(A.mx[a], B.mx[a]));
  if (mn[0] > mx[0] || mn[1] > mx[1] || mn[2] > mx[2]) return null;
  _box.min.set(mn[0], mn[1], mn[2]); _box.max.set(mx[0], mx[1], mx[2]);
  if (!frustum.intersectsBox(_box)) return null;                                       // entirely off screen: skipped
  const best: Best = { d: 0, x: 0, y: 0, z: 0, dOn: 0, xo: 0, yo: 0, zo: 0 };
  if (B.solids.length) intoPart(A.pts, B, best, skip, 0, A);
  if (A.solids.length) intoPart(B.pts, A, best, skip, 0, B);
  return best.d > TOL ? best : null;
}

// ---------------------------------------------------------------------------------------------------------------------
// one frame
// ---------------------------------------------------------------------------------------------------------------------
type Finding = { f: number; shot: string; place: string; cat: string; a: string; b: string; depth: number; p: number[]; s: number[]; on: boolean; behind?: string; info?: string };
const SELF_OK = /^(body|acc:(robe|armour|lamellar|cape|cloak|swordBelt|hilt|pendant|scroll|warBelt|beard))$/;
function frame(f: number, out: Finding[], seeds: (() => (() => void) | void) | null) {
  const s = SEGS.find((g) => f >= g.from && f <= g.to)!;
  if (s !== cur) { cur?.exit(w); s.enter(w); cur = s; }
  w.beginFrame(f); const P = s.pose(w, f); w.endFrame(P); w.root.updateMatrixWorld(true);
  let undo: (() => void) | void = undefined;
  if (seeds) { undo = seeds(); w.root.updateMatrixWorld(true); }
  try { frameBody(f, out); } finally { if (undo) undo(); }
}
function frameBody(f: number, out: Finding[]) {
  camera.updateMatrixWorld(); _pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); frustum.setFromProjectionMatrix(_pm);
  const shot = shotAt(f).id, place = String(w.place);
  let everything: Part[] = [];
  const byId = new Map<string, Part>();
  /** the first part (not a, not b) the line of sight from the camera to the point passes through, 3 cm or more from it */
  const occluder = (x: number, y: number, z: number, a: string, b: string): string | null => {
    const cp = camera.position, dx = cp.x - x, dy = cp.y - y, dz = cp.z - z, L = Math.hypot(dx, dy, dz);
    const sm = [Math.min(x, cp.x), Math.min(y, cp.y), Math.min(z, cp.z)], sx = [Math.max(x, cp.x), Math.max(y, cp.y), Math.max(z, cp.z)];
    const oa = byId.get(a)?.owner, ob = byId.get(b)?.owner;
    // (not the two parts themselves, nor the legs of their figures: legs live inside skirts)
    const cand = everything.filter((C) => C.id !== a && C.id !== b && C.solids.length && !((C.owner === oa || C.owner === ob) && /^leg/.test(C.role)) && !(C.mx[0] < sm[0] || C.mn[0] > sx[0] || C.mx[1] < sm[1] || C.mn[1] > sx[1] || C.mx[2] < sm[2] || C.mn[2] > sx[2]));
    if (!cand.length) return null;
    for (let t = 0.03; t < Math.min(L - 0.05, 12); t += t < 0.6 ? 0.012 : 0.03) {
      const px = x + (dx / L) * t, py = y + (dy / L) * t, pz = z + (dz / L) * t;
      for (const C of cand) { if (px < C.mn[0] || py < C.mn[1] || pz < C.mn[2] || px > C.mx[0] || py > C.mx[1] || pz > C.mx[2]) continue; for (const so of C.solids) if (so.depth(px, py, pz) > 0) return C.id; }
    }
    return null;
  };
  const add = (cat: string, a: string, b: string, B: Best, info?: string) => {
    const inFrame = B.dOn > TOL, d = inFrame ? B.dOn : B.d, x = inFrame ? B.xo : B.x, y = inFrame ? B.yo : B.y, z = inFrame ? B.zo : B.z, q = screenOf(x, y, z);
    const hid = inFrame && cat !== "float" ? occluder(x, y, z, a, b) : null;
    out.push({ f, shot, place, cat, a, b, depth: Math.round(d * 1000) / 10, p: [x, y, z].map((v) => Math.round(v * 1000) / 1000), s: [Math.round(q.x), Math.round(q.y)], on: inFrame && !hid, ...(hid ? { behind: hid } : {}), ...(info ? { info } : {}) });
  };
  // ---- collect
  const names = rigNames(), figs = new Map<string, Part[]>(), seatOf = new Map<string, THREE.Vector3>(), chair = new Set<string>(), sunk = new Set<string>(), front = new Map<string, boolean[]>();
  for (const r of w.rc.figures as any[]) {
    if (!r.group.visible || r.state.visible === false) continue;
    const nm = names.get(r) ?? "figure";
    figs.set(nm, figureParts(r, nm));
    if (r.state.seat) seatOf.set(nm, r.state.seat.top.clone());
    if (DUMP.has(f)) console.log(`  RIG ${nm} head ${r.headWorld().toArray().map((x: number) => x.toFixed(3))} R ${(r.dim.R * (r.group.scale.x || 1)).toFixed(3)} at ${r.state.at?.toArray?.().map((x: number) => x.toFixed(2))} seat ${!!r.state.seat}`);
    if (r.group.userData.hmSeat) chair.add(nm);
    front.set(nm, [!!r.frontArm?.[0], !!r.frontArm?.[1]]);
    if (!r.state.seat && r.state.at && r.state.at.y < -0.005) sunk.add(nm);              // kneeling the films' way (shots/common.ts kneel)
  }
  const props = propParts(), set = setParts();
  const allFig = [...figs.values()].flat();
  byOwner = figs; everything = [...allFig, ...props, ...set];
  byId.clear(); for (const p of everything) byId.set(p.id, p);
  if (DUMP.has(f)) {
    console.log(`--- f${f} [${shot}] ${place} cam ${camera.position.toArray().map((x) => x.toFixed(2))}`);
    for (const p of [...allFig, ...props, ...set]) console.log(`  ${p.id.padEnd(28)} mn ${p.mn.map((x) => x.toFixed(2)).join(",").padEnd(20)} mx ${p.mx.map((x) => x.toFixed(2)).join(",").padEnd(20)} pts ${p.pts.length / 3}${p.hand ? " hand " + p.hand.c.toArray().map((x) => x.toFixed(2)) : ""}`);
  }
  // ---- who holds which prop: a hand ball within 3.5 cm of the prop's surface samples
  for (const pr of props) {
    pr.heldBy = [];
    if (DUMP.has(f)) console.log(`  holders of ${pr.id}: ` + allFig.filter((h) => h.hand).map((h) => { let m = 9; for (let i = 0; i < pr.pts.length; i += 3) m = Math.min(m, Math.hypot(pr.pts[i] - h.hand!.c.x, pr.pts[i + 1] - h.hand!.c.y, pr.pts[i + 2] - h.hand!.c.z)); return `${h.id} ${(m * 100).toFixed(1)}cm`; }).filter((x) => !x.endsWith(" 900.0cm")).join(", "));
    for (const h of allFig) if (h.hand) {
      const { c, r } = h.hand, lim = r + 0.035;
      for (let i = 0; i < pr.pts.length; i += 3) if (Math.hypot(pr.pts[i] - c.x, pr.pts[i + 1] - c.y, pr.pts[i + 2] - c.z) < lim) { pr.heldBy.push({ fig: h.owner, i: h.hand.i, c }); break; }
    }
  }
  const things = [...props, ...allFig.filter((p) => p.heldBy)];                         // props and figure-held things
  const gripSkip = (thing: Part, fig: string): { hand: Set<string>; skip: Skip } => {
    const hand = new Set<string>(), skip: Skip = [];
    for (const h of thing.heldBy ?? []) if (h.fig === fig) { hand.add(h.i ? "handL" : "handR"); skip.push({ c: h.c, r: 0.12 }); }
    return { hand, skip };
  };
  const figNames = [...figs.keys()];
  // ---- figure / figure
  for (let i = 0; i < figNames.length; i++) for (let j = i + 1; j < figNames.length; j++) {
    for (const a of figs.get(figNames[i])!) for (const b of figs.get(figNames[j])!) {
      const B = pairTest(a, b); if (B) add(a.heldBy || b.heldBy ? "prop-fig" : "fig-fig", a.id, b.id, B);
    }
  }
  // ---- inside one figure
  for (const [nm, parts] of figs) {
    const s = parts[0]?.s ?? 1;
    const arms = parts.filter((p) => /^(arm|hand)[RL]$/.test(p.role));
    for (const a of arms) {
      const side = a.role.endsWith("R") ? "armR" : "armL", root = parts.find((p) => p.role === side)?.root;
      const skip: Skip = root ? [{ c: root, r: 0.1 * s }] : [];
      for (const b of parts) {
        if (b.role === "head") { const B = pairTest(a, b, root ? [{ c: root, r: 0.05 * s }] : []); if (B) add("self-head", a.id, b.id, B, front.get(nm)![side === "armR" ? 0 : 1] ? "armFront: drawn in front of the face" : "arm drawn under its own head (rig rule 4): it vanishes into the head"); }
        else if (SELF_OK.test(b.role)) { const B = pairTest(a, b, skip); if (B) add("self", a.id, b.id, B); }
      }
    }
    for (const t of parts.filter((p) => p.heldBy)) {
      const g = gripSkip(t, nm);
      for (const b of parts) {
        if (b === t || g.hand.has(b.role) || b.heldBy) continue;
        const B = pairTest(t, b, /^arm/.test(b.role) ? g.skip : []); if (B) add("held-holder", t.id, b.id, B);
      }
    }
  }
  // ---- props against figures and each other
  for (const pr of props) {
    for (const [nm, parts] of figs) {
      const g = gripSkip(pr, nm), holder = g.hand.size > 0, seat = seatOf.get(nm);
      const rider = !!seat && seat.x > pr.mn[0] && seat.x < pr.mx[0] && seat.y > pr.mn[1] && seat.y < pr.mx[1] && seat.z > pr.mn[2] && seat.z < pr.mx[2];
      for (const b of parts) {
        if (g.hand.has(b.role)) continue;
        if (rider && /^(leg|body|acc:(robe|armour|cape|cloak|swordBelt|hilt|lamellar|warBelt|warBoots|scroll|pendant))/.test(b.role)) {
          const B = pairTest(pr, b); if (B) add("rider", pr.id, b.id, B, "by design: the rig cannot straddle, its seat is 10 cm inside the horse (props/horse.ts)"); continue;
        }
        const B = pairTest(pr, b, /^arm/.test(b.role) ? g.skip : []);
        if (B) add(holder ? "held-holder" : "prop-fig", pr.id, b.id, B);
      }
    }
  }
  for (let i = 0; i < things.length; i++) for (let j = i + 1; j < things.length; j++) {
    const a = things[i], b = things[j]; if (a.kind === "fig" && b.kind === "fig") continue;  // (figure-held vs figure-held: done above)
    const B = pairTest(a, b); if (B) add("prop-prop", a.id, b.id, B);
  }
  // ---- against the set
  for (const st of set) {
    for (const [nm, parts] of figs) {
      const seat = seatOf.get(nm);
      const ownPad = st.soft && seat && seat.x >= st.mn[0] - 0.05 && seat.x <= st.mx[0] + 0.05 && seat.z >= st.mn[2] - 0.05 && seat.z <= st.mx[2] + 0.05 && seat.y > st.mx[1] - 0.08 && seat.y < st.mx[1] + 0.65;   // (rising: seated() lifts the seat top)
      for (const a of parts) {
        if (ownPad && !/^(arm|hand)/.test(a.role)) continue;                              // the cushion the figure sits on
        const B = pairTest(a, st); if (!B) continue;
        // "seat": the thing the figure sits on (its top under the seat top), e.g. Liu Bang's robe and the commode
        const onSeat = !!seat && seat.x >= st.mn[0] - 0.05 && seat.x <= st.mx[0] + 0.05 && seat.z >= st.mn[2] - 0.05 && seat.z <= st.mx[2] + 0.05 && st.mx[1] < seat.y + 0.06;
        add(a.heldBy ? "prop-set" : onSeat ? "seat" : "fig-set", a.id, st.id, B, st.info);
      }
    }
    for (const pr of props) { const B = pairTest(pr, st); if (B) add("prop-set", pr.id, st.id, B, st.info); }
  }
  // ---- under the floor (ground y = 0 in every place)
  for (const p of [...allFig.filter((q) => !sunk.has(q.owner)), ...props]) {
    if (p.mn[1] >= -TOL) continue;
    const best: Best = { d: 0, x: 0, y: 0, z: 0, dOn: 0, xo: 0, yo: 0, zo: 0 };
    for (let i = 0; i < p.pts.length; i += 3) {
      const d = -p.pts[i + 1]; if (d <= TOL) continue;
      const x = p.pts[i], y = p.pts[i + 1], z = p.pts[i + 2];
      if (d > best.d) { best.d = d; best.x = x; best.y = y; best.z = z; }
      if (d > best.dOn && screenOf(x, y, z).on) { best.dOn = d; best.xo = x; best.yo = y; best.zo = z; }
    }
    if (best.d > TOL) { _box.min.set(p.mn[0], p.mn[1], p.mn[2]); _box.max.set(p.mx[0], 0, p.mx[2]); if (frustum.intersectsBox(_box)) add("floor", p.id, "floor", best); }
  }
  // ---- props that float: not held, not touching anything, and a gap under their lowest points
  for (const pr of props) {
    if (pr.heldBy && pr.heldBy.length) continue;
    const y0 = pr.mn[1]; if (y0 < TOL) continue;                                         // on (or in) the floor
    const others = [...set, ...props.filter((q) => q !== pr), ...allFig];
    const inside = (x: number, y: number, z: number) => { for (const o of others) { if (x < o.mn[0] || x > o.mx[0] || z < o.mn[2] || z > o.mx[2] || y > o.mx[1] || y < o.mn[1]) continue; for (const so of o.solids) if (so.depth(x, y, z) > 0) return true; } return false; };
    // supported = a point of it, or one of its lowest points pushed down by the tolerance, is inside something
    let supported = false;
    for (let i = 0; i < pr.pts.length && !supported; i += 3) {
      const low = pr.pts[i + 1] < y0 + 0.01;
      if (inside(pr.pts[i], pr.pts[i + 1], pr.pts[i + 2]) || (low && inside(pr.pts[i], pr.pts[i + 1] - TOL - 0.002, pr.pts[i + 2]))) supported = true;
    }
    if (supported) continue;
    let gap = Infinity, gx = 0, gy = 0, gz = 0;
    for (let i = 0; i < pr.pts.length; i += 3) {
      if (pr.pts[i + 1] >= y0 + 0.01) continue;
      const x = pr.pts[i], y = pr.pts[i + 1], z = pr.pts[i + 2];
      let top = 0; for (const o of [...set, ...props.filter((q) => q !== pr)]) for (const t of o.tris ?? []) { const b = t.belowY(x, y, z); if (b > top) top = b; }
      if (y - top < gap) { gap = y - top; gx = x; gy = y; gz = z; }
    }
    const c = new THREE.Vector3((pr.mn[0] + pr.mx[0]) / 2, (pr.mn[1] + pr.mx[1]) / 2, (pr.mn[2] + pr.mx[2]) / 2), was = lastAt.get(pr.id);
    lastAt.set(pr.id, { f, c });
    if (gap > TOL && gap < 50) {
      _box.min.set(pr.mn[0], pr.mn[1], pr.mn[2]); _box.max.set(pr.mx[0], pr.mx[1], pr.mx[2]);
      const v = was && was.f === f - STEP ? c.distanceTo(was.c) / STEP : NaN;
      const info = Number.isNaN(v) ? undefined : v > 0.02 ? `moving ${(v * 100).toFixed(0)} cm/frame (thrown or falling?)` : "still";
      if (frustum.intersectsBox(_box)) { const on = screenOf(gx, gy, gz).on; add("float", pr.id, "support below", { d: gap, x: gx, y: gy, z: gz, dOn: on ? gap : 0, xo: gx, yo: gy, zo: gz }, info); }
    }
  }
}
const lastAt = new Map<string, { f: number; c: THREE.Vector3 }>();
let cur: Segment | null = null;

// ---------------------------------------------------------------------------------------------------------------------
// the seeded clips (--seed): known faults put into the real scene after the pose, to prove they are caught
// ---------------------------------------------------------------------------------------------------------------------
const seedLog: string[] = [];
const seedsFor = (f: number): (() => (() => void) | void) | null => {
  if (!SEEDED) return null;
  return () => {
    const names = rigNames(), vis = (w.rc.figures as any[]).filter((r) => r.group.visible && r.state.visible !== false);
    if (w.place === "privy") {
      // S1. THE OLD BUG: the robe is not told about the commode (as before garb.ts setSeat / onSeat): a column of cloth to
      // the floor that swallows the seat. Expect "seat" robe x the commode's meshes, deep.
      const undo: (() => void)[] = [];
      for (const r of vis) { const U = r.group.userData; if (U.hmSeat) { const k = U.hmSeat; delete U.hmSeat; undo.push(() => { U.hmSeat = k; }); seedLog.push(`f${f}: ${names.get(r)}'s robe no longer knows the commode (the old bug; expect seat robe x privy.static, deep)`); } }
      return () => undo.forEach((u) => u());
    }
    const st = vis.find((r) => !r.state.seat && r.state.at && r.state.at.y > -0.005);
    // S3. a second figure walked into the first: feet 0.20 m apart, same facing. Expected body x body depth = R1 + R2 - 0.20
    // (R = the widest radius of the body lathe from its own geometry)
    const st2 = vis.find((r) => r !== st && !r.state.seat && r.state.at && r.state.at.y > -0.005);
    if (st && st2) {
      const a = st.state.at as THREE.Vector3, R = (r: any) => { const g = (r.torsoG.children[0] as THREE.Mesh).geometry; g.computeBoundingBox(); return (g.boundingBox!.max.x - g.boundingBox!.min.x) / 2 * r.group.scale.x; };
      // (both plain idle and upright, so that the expectation holds: no lean, no bow, no pinned hands)
      for (const r of [st, st2]) { const s0 = r.state; for (const k of ["hands", "seat", "lookDown", "head", "twist", "turn"]) delete s0[k]; s0.pose = { kind: "idle", t: 0 }; }
      st2.state.at = new THREE.Vector3(a.x + 0.2, a.y, a.z); st2.state.facing = st.state.facing;
      seedLog.push(`f${f}: ${names.get(st2)} put 0.20 m beside ${names.get(st)} (expect fig-fig body x body about ${((R(st) + R(st2) - 0.2) * 100).toFixed(1)} cm = R1 + R2 - 0.20)`);
    }
    w.update(); w.root.updateMatrixWorld(true);
    if (w.place === "tent") {
      // S4. a cup floating 8 cm over Liu Bang's table; S5. the pork leg through the middle of Fan Kuai's table top
      const c = SEATS.liu.cup; w.prop("cup:liu").put([c.x, c.y + 0.08, c.z]); seedLog.push(`f${f}: cup:liu 8.0 cm above Liu Bang's table (expect float 8 cm)`);
      // S2. the wine vessel standing 5 cm into the floor beside Liu Bang's table
      const c2 = SEATS.liu.table.at; w.prop("wineJar").put([c2.x + 0.5, -0.05, c2.z]); seedLog.push(`f${f}: wineJar 5.0 cm into the floor (expect floor 5 cm)`);
      const t = SEATS.fankuai.table.at; w.prop("pigLeg").put([t.x, 0.32, t.z]); seedLog.push(`f${f}: pigLeg centred on Fan Kuai's table top (expect prop-set: the 4 cm slab passes through the 21 cm thick leg: several cm)`);
    }
  };
};

// ---------------------------------------------------------------------------------------------------------------------
// run, write
// ---------------------------------------------------------------------------------------------------------------------
type Range = { cat: string; a: string; b: string; f0: number; f1: number; n: number; nOn: number; max: number; maxOn: number; fMax: number; shots: Set<string>; s?: number[]; info?: string; behind: Map<string, number> };
const summarise = (fs_: Finding[]) => {
  const byKey = new Map<string, Finding[]>();
  for (const x of fs_) { const k = `${x.cat}|${x.a}|${x.b}`; let a = byKey.get(k); if (!a) byKey.set(k, (a = [])); a.push(x); }
  const ranges: Range[] = [];
  for (const [, xs] of byKey) {
    xs.sort((p, q) => p.f - q.f);
    let r: Range | null = null;
    for (const x of xs) {
      if (!r || x.f > r.f1 + GAP) { r = { cat: x.cat, a: x.a, b: x.b, f0: x.f, f1: x.f, n: 0, nOn: 0, max: 0, maxOn: 0, fMax: x.f, shots: new Set(), info: x.info, behind: new Map() }; ranges.push(r); }
      if (x.behind) r.behind.set(x.behind, (r.behind.get(x.behind) ?? 0) + 1);
      if (x.info && !r.info) r.info = x.info;
      r.f1 = x.f; r.n++; r.shots.add(x.shot);
      if (x.depth > r.max) r.max = x.depth;
      if (x.on) { r.nOn++; if (x.depth > r.maxOn) { r.maxOn = x.depth; r.fMax = x.f; r.s = x.s; } }
    }
  }
  ranges.sort((p, q) => q.maxOn - p.maxOn || q.max - p.max);
  return ranges;
};
const fmtR = (r: Range) => `${String(r.maxOn.toFixed(1)).padStart(5)} cm  f${r.f0}-${r.f1} (${r.nOn}/${r.n} on screen, worst f${r.fMax}${r.s ? ` at ${r.s[0]},${r.s[1]} px` : ""})  [${[...r.shots].join(",")}]  ${r.cat.padEnd(11)} ${r.a}  x  ${r.b}${r.info ? `  (${r.info})` : ""}${r.behind.size ? `  [hidden behind ${[...r.behind].map(([k, v]) => `${k} ${v}f`).join(", ")}]` : ""}`;

const t0 = Date.now();
for (const job of jobs) {
  const out: Finding[] = [], tj = Date.now(); let n = 0, errs = 0;
  for (let f = job.from; f <= job.to; f += STEP) {
    try { frame(f, out, seedsFor(f)); n++; } catch (e) { errs++; console.log(`EXC f${f}: ${(e as Error).stack?.split("\n").slice(0, 3).join(" | ")}`); }
  }
  const ranges = summarise(out), on = ranges.filter((r) => r.nOn > 0), off = ranges.filter((r) => r.nOn === 0);
  const head = [
    `clearance ${job.name}: frames ${job.from}-${job.to} step ${STEP}, tolerance ${(TOL * 100).toFixed(1)} cm, ${n} frames in ${((Date.now() - tj) / 1000).toFixed(1)} s${errs ? `, ${errs} frame(s) threw` : ""}`,
    `${out.length} pair-frames deeper than the tolerance; ${on.length} contiguous ranges with on-screen frames, ${off.length} off screen only.`,
    `columns: worst on-screen depth, frames, how many of them on screen, worst frame and its screen point (1080x1920), shots, category, the two objects`,
  ];
  const byCat = new Map<string, number>(); for (const r of on) byCat.set(r.cat, (byCat.get(r.cat) ?? 0) + 1);
  const txt = [...head, `on-screen ranges by category: ${[...byCat].map(([k, v]) => `${k} ${v}`).join(", ") || "none"}`, "", "== ON SCREEN (worst first)", ...on.map(fmtR), "", "== OFF SCREEN ONLY", ...off.map((r) => fmtR({ ...r, maxOn: r.max }))];
  if (SEEDED) txt.unshift("SEEDED RUN (--seed): faults were put into the scene on purpose:", ...[...new Set(seedLog)].slice(0, 40), "");
  fs.writeFileSync(`${OUT}/${job.name}.json`, JSON.stringify({ job, tol_cm: TOL * 100, step: STEP, ranges: ranges.map((r) => ({ ...r, shots: [...r.shots], behind: Object.fromEntries(r.behind) })), findings: out }, null, 0));
  fs.writeFileSync(`${OUT}/${job.name}.txt`, txt.join("\n") + "\n");
  if (!QUIET) console.log(txt.slice(0, 40).join("\n") + "\n");
  console.log(`wrote ${OUT}/${job.name}.json / .txt`);
}
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
