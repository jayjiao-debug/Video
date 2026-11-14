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
import * as THREE from "three";
import type { World } from "../../world";
import type { Pose } from "../../story";
import { facePoint, headRadius } from "../../people";
import type { Rect } from "../../../../kit/overlay/frame";

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
export type MsCtx = { f: number; held: number; P: Pose; figs: MsFig[]; props?: MsProps; door?: MsDoor | null };

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
  return { f, held, P, figs, props: msProps(w), door: msDoor(w) };
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
