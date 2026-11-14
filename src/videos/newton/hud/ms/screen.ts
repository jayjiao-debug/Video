// hud/ms/screen.ts: WHERE THINGS ARE ON SCREEN for skin A's pieces (stage 1). Film.tsx builds one MsCtx per frame,
// right after the Director posed the world (the held frame during the freeze), and hands it to <MsTitle>, <MsCard>,
// <MsFx>: the pieces anchor to faces, hands and the camera without touching the World themselves (a piece stays a pure
// function of its props). Built only on frames where some item draws (msAny).
//   ctx.f        the film frame;  ctx.held = the frame the picture shows (msHold(f): B03's last frame during the card)
//   ctx.P        the frame's Pose (ctx.P.camera = the CamPose: project any world point with cam.ts toScreen(ctx.P.camera, p),
//                e.g. a mark of layout.ts: the door's upper panel for the title, the plate, the chair)
//   ctx.figs     every visible figure: who ("newton", "newtonInk", "humphrey", ...: people.ts names, + ":key"), its head
//                centre and radius on screen, its FACE box (the skin of the face drawing: keep words out of it), its hands
//   msFig(ctx, "humphrey")   the first visible figure whose name starts so, or null
//   ctx.props    (stage 2b, the effects) where the props the effects anchor to are on screen, read from the posed world
//                (the default instance of each, only while it is shown): chair = its floor point under the seat and its
//                seat; plate = its centre and its rim's far / near / left / right points (far = the rim point highest on
//                screen). The effects ride these, so they follow the scene when it is rebuilt.
//   ctx.door     (stage 2a, the title) his door on the stairs set while that set is shown: the landing-side face of the
//                leaf as 4 corners on screen, where it is NOW (it may be swinging) and where it is when SHUT, how far it
//                is open (rad) and its size (m); null on every other set. The title's leaf rides it (hud/ms/title.tsx)
//   ctx.cut      (skin A r3, the lead card) THE CUT-OUT's sticker on screen, NOT yet lifted, on the cut-out's frames
//                (freeze.ts cutAt): every MsCut.cell px cell that the lead's kept things cover (cutout.ts cutKeep: his rig
//                and what he holds; their triangles put on screen, a hidden part included), grown by the sticker's
//                paper margin and ink edge (cutout.ts CUT_LOOK), as rects; and the pivot of its lift (freeze.ts cutPivot).
//                hud/ms/card.tsx cuts its compass construction away under it, lifted (freeze.ts cutLift), so no line
//                of the drawing on the page runs onto the sticker. Built once per held frame (the pose does not change).
import * as THREE from "three";
import type { World } from "../../world";
import type { Pose } from "../../story";
import { facePoint, headRadius } from "../../people";
import type { Rect } from "../../../../kit/overlay/frame";
import { cutAt, cutPivot } from "../../freeze";
import { cutKeep, cutLead, CUT_LOOK } from "../../cutout";

export type MsPt = { x: number; y: number };
export type MsFig = { who: string; head: MsPt; r: number; face: Rect; hands: [MsPt, MsPt]; front: boolean };
export type MsAt = MsPt & { front: boolean };
/** the props the effects anchor to (fx.tsx): each only while that prop is shown on the frame */
export type MsProps = {
  chair?: { floor: MsAt; seat: MsAt };
  plate?: { c: MsAt; far: MsAt; near: MsAt; left: MsAt; right: MsAt; w: number };
};
/** his door's face on screen (title.tsx): corners in the leaf's own order (bottom at the pivot, bottom at the free edge,
 *  top at the free edge, top at the pivot), now and shut; open = its turn from shut (rad); w, h = the face (m) */
export type MsDoor = { now: MsPt[]; shut: MsPt[]; open: number; w: number; h: number };
/** THE CUT-OUT's sticker, unlifted: rects in px (x, y, w, h) on a `cell` px grid, and its lift's pivot */
export type MsCut = { cell: number; rects: [number, number, number, number][]; pivot: MsPt };
export type MsCtx = { f: number; held: number; P: Pose; figs: MsFig[]; props?: MsProps; door?: MsDoor | null; cut?: MsCut | null };

/** the person's name of each rig (kit.world.ts rigNames: the World's private tables, read only) */
const rigNames = (w: World): Map<unknown, string> => {
  const W_ = w as unknown as { ids: Map<{ name: string }, number>; rigs: Map<string, unknown> };
  const byId = new Map<number, string>(), out = new Map<unknown, string>();
  for (const [p, id] of W_.ids) byId.set(id, p.name);
  for (const [k, r] of W_.rigs) { const [id, key] = k.split("|"); out.set(r, (byId.get(Number(id)) ?? "figure") + (key ? ":" + key : "")); }
  return out;
};
// the face's skin region (scripts/newton/qa/faces "skin": q.y <= 0.45, |q| <= 0.92), sampled
const SKIN_Q: [number, number][] = [];
for (let qy = -0.92; qy <= 0.45 + 1e-6; qy += 0.23) for (let qx = -0.92; qx <= 0.92 + 1e-6; qx += 0.23) if (qx * qx + qy * qy <= 0.92 * 0.92 + 1e-6) SKIN_Q.push([qx, qy]);

// ---- THE CUT-OUT's sticker (ctx.cut)
const CUT_CELL = 6;
const CUT_GROW = CUT_LOOK.outline.width + Math.hypot(CUT_LOOK.shadow.x, CUT_LOOK.shadow.y);
const _mvp = new THREE.Matrix4(), _v4 = new THREE.Vector4();
let cutMemo: { key: string; cut: MsCut } | null = null;
/** the sticker on frame f (null off the cut-out's frames or with no lead in the picture); see the header (ctx.cut) */
const msCut = (w: World, f: number, held: number): MsCut | null => {
  if (!cutAt(f)) return null;
  const r = cutLead(w);
  if (!r) return null;
  const keep = cutKeep(w, r);
  const key = `${held}|${keep.map((o) => o.uuid).join(",")}`;
  if (cutMemo && cutMemo.key === key) return cutMemo.cut;
  const cam = w.camera, Wd = 1080, Hd = 1800, C = CUT_CELL, GW = Math.ceil(Wd / C), GH = Math.ceil(Hd / C);
  cam.updateMatrixWorld();
  const grid = new Uint8Array(GW * GH);
  const mark = (cx: number, cy: number) => { if (cx >= 0 && cy >= 0 && cx < GW && cy < GH) grid[cy * GW + cx] = 1; };
  const shown = (o: THREE.Object3D) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (!p.visible) return false; return true; };
  for (const k of keep) k.traverse((o) => {
    const mesh = o as THREE.Mesh, g = mesh.geometry as THREE.BufferGeometry | undefined, pos = g?.attributes?.position as THREE.BufferAttribute | undefined;
    if (!mesh.isMesh || !g || !pos || !shown(o)) return;
    const m = mesh.material, mats = Array.isArray(m) ? m : [m];
    if (!mats.length || mats.every((x) => !x || x.colorWrite === false || x.visible === false)) return;     // depth-only helpers
    o.updateWorldMatrix(true, false);
    _mvp.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).multiply(o.matrixWorld);
    const n = pos.count, sx = new Float32Array(n), sy = new Float32Array(n), ok = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      _v4.set(pos.getX(i), pos.getY(i), pos.getZ(i), 1).applyMatrix4(_mvp);
      if (_v4.w <= 1e-6) continue;
      ok[i] = 1; sx[i] = ((_v4.x / _v4.w) * 0.5 + 0.5) * Wd / C; sy[i] = (0.5 - (_v4.y / _v4.w) * 0.5) * Hd / C;
    }
    const idx = g.index, tris = idx ? idx.count / 3 : n / 3;
    for (let t = 0; t < tris; t++) {
      const a = idx ? idx.getX(3 * t) : 3 * t, b = idx ? idx.getX(3 * t + 1) : 3 * t + 1, c = idx ? idx.getX(3 * t + 2) : 3 * t + 2;
      if (!ok[a] || !ok[b] || !ok[c]) continue;
      const x0 = Math.floor(Math.min(sx[a], sx[b], sx[c])), x1 = Math.floor(Math.max(sx[a], sx[b], sx[c]));
      const y0 = Math.floor(Math.min(sy[a], sy[b], sy[c])), y1 = Math.floor(Math.max(sy[a], sy[b], sy[c]));
      if (x1 < 0 || y1 < 0 || x0 >= GW || y0 >= GH) continue;
      if ((x1 - x0 + 1) * (y1 - y0 + 1) <= 4) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) mark(x, y); continue; }
      mark(Math.floor(sx[a]), Math.floor(sy[a])); mark(Math.floor(sx[b]), Math.floor(sy[b])); mark(Math.floor(sx[c]), Math.floor(sy[c]));
      const e = (ax: number, ay: number, bx: number, by: number, px: number, py: number) => (bx - ax) * (py - ay) - (by - ay) * (px - ax);
      const area = e(sx[a], sy[a], sx[b], sy[b], sx[c], sy[c]);
      if (Math.abs(area) < 1e-9) continue;
      for (let y = Math.max(0, y0); y <= Math.min(GH - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(GW - 1, x1); x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = e(sx[b], sy[b], sx[c], sy[c], px, py), w1 = e(sx[c], sy[c], sx[a], sy[a], px, py), w2 = e(sx[a], sy[a], sx[b], sy[b], px, py);
        if (area > 0 ? w0 >= 0 && w1 >= 0 && w2 >= 0 : w0 <= 0 && w1 <= 0 && w2 <= 0) grid[y * GW + x] = 1;
      }
    }
  });
  // grown by the paper margin and the ink edge (+ half a cell for the grid)
  const R = (CUT_GROW + C / 2) / C, Ri = Math.ceil(R), disc: [number, number][] = [];
  for (let j = -Ri; j <= Ri; j++) for (let i = -Ri; i <= Ri; i++) if (i * i + j * j <= R * R) disc.push([i, j]);
  const grown = new Uint8Array(grid);
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    if (!grid[y * GW + x]) continue;
    const inner = x > 0 && y > 0 && x < GW - 1 && y < GH - 1 && grid[y * GW + x - 1] && grid[y * GW + x + 1] && grid[(y - 1) * GW + x] && grid[(y + 1) * GW + x];
    if (!inner) for (const [i, j] of disc) { const X = x + i, Y = y + j; if (X >= 0 && Y >= 0 && X < GW && Y < GH) grown[Y * GW + X] = 1; }
  }
  // row runs, merged down while a run repeats on the next row
  const rects: [number, number, number, number][] = [], open = new Map<string, [number, number, number, number]>();
  for (let y = 0; y < GH; y++) {
    const now = new Map<string, [number, number, number, number]>();
    for (let x = 0; x < GW;) {
      if (!grown[y * GW + x]) { x++; continue; }
      let e = x; while (e + 1 < GW && grown[y * GW + e + 1]) e++;
      const k = `${x},${e}`, prev = open.get(k);
      if (prev) { prev[3] += C; now.set(k, prev); } else { const rc: [number, number, number, number] = [x * C, y * C, (e - x + 1) * C, C]; rects.push(rc); now.set(k, rc); }
      x = e + 1;
    }
    open.clear(); for (const [k, v] of now) open.set(k, v);
  }
  const head = w.project(r.headWorld()), hands = [w.project(r.handWorld(0)), w.project(r.handWorld(1))];
  const cut: MsCut = { cell: C, rects, pivot: cutPivot(head, hands) };
  cutMemo = { key, cut };
  return cut;
};

/** the frame's MsCtx (Film.tsx, after the Director posed the frame) */
export const msScreen = (w: World, P: Pose, f: number, held: number): MsCtx => {
  const names = rigNames(w), figs: MsFig[] = [];
  for (const r of w.rc.figures) {
    if (!r.group.visible || r.state.visible === false) continue;
    const c = w.project(r.headWorld()), R = headRadius(r);
    const pts = SKIN_Q.map(([qx, qy]) => w.project(facePoint(r, qx, qy)));
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const edge = w.project(r.headWorld().add(w.camera.up.clone().multiplyScalar(R)));
    figs.push({
      who: names.get(r) ?? "figure", head: { x: c.x, y: c.y }, r: Math.hypot(edge.x - c.x, edge.y - c.y), front: c.front,
      face: { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) },
      hands: [0, 1].map((i) => { const q = w.project(r.handWorld(i as 0 | 1)); return { x: q.x, y: q.y }; }) as [MsPt, MsPt],
    });
  }
  return { f, held, P, figs, props: msProps(w), door: msDoor(w), cut: msCut(w, f, held) };
};
// sets/stairs.ts turns the leaf group "stairs.door" to rotation.y = -PI/2 + door * swing (door 0 = shut); its face toward
// the landing is the +z face of the mesh "stairs.door.leaf" (sets/parts/newton.ts doorLeaf)
const DOOR_SHUT_RY = -Math.PI / 2;
const _dm = new THREE.Matrix4(), _dq = new THREE.Quaternion(), _de = new THREE.Euler(), _dv = new THREE.Vector3();
/** his door's face on screen, now and shut (null while the stairs set is hidden). Reads the scene graph (the parents'
 *  world matrices brought up to date, as the renderer would); changes nothing in it */
const msDoor = (w: World): MsDoor | null => {
  const g = w.root.getObjectByName("stairs.door"), leaf = w.root.getObjectByName("stairs.door.leaf") as THREE.Mesh | undefined;
  if (!g || !g.parent || !leaf || leaf.parent !== g || !leaf.geometry) return null;
  for (let o: THREE.Object3D | null = leaf; o; o = o.parent) if (!o.visible) return null;
  if (!leaf.geometry.boundingBox) leaf.geometry.computeBoundingBox();
  const b = leaf.geometry.boundingBox!;
  g.parent.updateWorldMatrix(true, false);
  leaf.updateMatrix();
  const corners: [number, number][] = [[b.min.x, b.min.y], [b.max.x, b.min.y], [b.max.x, b.max.y], [b.min.x, b.max.y]];
  const quad = (ry: number): MsPt[] => {
    _de.set(g.rotation.x, ry, g.rotation.z, g.rotation.order); _dq.setFromEuler(_de);
    _dm.compose(g.position, _dq, g.scale).premultiply(g.parent!.matrixWorld).multiply(leaf.matrix);
    return corners.map(([x, y]) => { const q = w.project(_dv.set(x, y, b.max.z).applyMatrix4(_dm)); return { x: q.x, y: q.y }; });
  };
  return { now: quad(g.rotation.y), shut: quad(DOOR_SHUT_RY), open: Math.abs(g.rotation.y - DOOR_SHUT_RY), w: b.max.x - b.min.x, h: b.max.y - b.min.y };
};
/** the chair's and the plate's screen points (the default instance; nothing for a prop that is hidden) */
const PLATE_R = 0.13, PLATE_RIM_Y = 0.02;
const msProps = (w: World): MsProps => {
  const out: MsProps = {};
  const at = (g: THREE.Object3D, x: number, y: number, z: number): MsAt => {
    const q = w.project(g.localToWorld(new THREE.Vector3(x, y, z)));
    return { x: q.x, y: q.y, front: q.front };
  };
  const chair = w.prop("chair").group;
  if (chair.visible) out.chair = { floor: at(chair, 0, 0, 0), seat: at(chair, 0, 0.45, 0) };
  const plate = w.prop("plate").group;
  if (plate.visible) {
    const rim = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return at(plate, PLATE_R * Math.cos(a), PLATE_RIM_Y, PLATE_R * Math.sin(a)); });
    const by = (k: (p: MsAt) => number) => rim.reduce((b, p) => (k(p) < k(b) ? p : b));
    const left = by((p) => p.x), right = by((p) => -p.x);
    out.plate = { c: at(plate, 0, PLATE_RIM_Y, 0), far: by((p) => p.y), near: by((p) => -p.y), left, right, w: right.x - left.x };
  }
  return out;
};
/** the first visible figure whose name starts with `who` ("newton" matches every Newton swap), or null */
export const msFig = (ctx: MsCtx, who: string): MsFig | null => ctx.figs.find((x) => x.who.startsWith(who)) ?? null;
