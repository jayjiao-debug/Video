// Segment D dev probe (builder D): candidate lock cameras + YOU's bunk poses, with projection / occlusion logs.
// Only used when the input prop dprobe is set (never in the film).
import * as THREE from "three";
import { getInputProps } from "remotion";
import type { CamPose, Pose } from "../story";
import { FPS } from "../story";
import { LOOK, type World } from "../world";
import type { Figure } from "../kit/cast";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const IP = getInputProps() as { dcam?: number; dpose?: number };
export const CANDS: CamPose[] = [
  { pos: [-0.05, 1.6, -2.55], look: [-0.75, 1.25, 2.9], fov: 62 },
  { pos: [0.6, 2.3, -1.9], look: [-0.75, 1.15, 1.9], fov: 62 },
  { pos: [0.9, 2.35, -2.6], look: [-0.7, 1.1, 2.2], fov: 58 },
  { pos: [0.55, 2.0, -1.6], look: [-0.8, 1.15, 2.0], fov: 62 },
  { pos: [0.62, 2.42, -2.1], look: [-0.7, 1.05, 2.0], fov: 60 },
];
let you: Figure | null = null, bud: Figure | null = null;
export function enterProbe(w: World) { you = w.dorm.actors.acquire(LOOK.you); bud = w.dorm.actors.acquire(LOOK.buddy); }
export function exitProbe(w: World) { if (you) w.dorm.actors.release(you); if (bud) w.dorm.actors.release(bud); you = bud = null; }
export function poseProbe(w: World, f: number): Pose {
  const D = w.dorm, t = f / FPS, cam = CANDS[IP.dcam ?? 1];
  w.setCamera(cam);
  D.set.setLight("dawn"); D.set.setWindowOpen(1); D.set.setDoorOpen(1); D.set.animate(t);
  const k = IP.dpose ?? 0;
  const open = V(-0.95, 1.95, 1.62);
  if (k === 0) you!.set({ bed: { top: V(-1.3, 1.775, 1.0) }, facing: 0, pose: { kind: "curl", amount: 0.25, lean: 15, t, blanket: "#ffd666" }, expr: "sleep", blink: 1, clampYaw: 0.45 });
  if (k === 1) you!.set({ bed: { top: V(-1.3, 1.775, 1.2) }, facing: Math.PI, pose: { kind: "curl", amount: 0.25, t, blanket: "#ffd666" }, expr: "sleep", blink: 1, clampYaw: 0.45 });
  if (k === 2) you!.set({ bed: { top: V(-1.3, 1.775, 0.95) }, facing: Math.PI, pose: { kind: "hold", t, base: "bed", blanket: "#ffd666" }, aimAt: [open, open], expr: "smile", clampYaw: 0.45 });
  if (k === 3) you!.set({ bed: { top: V(-1.3, 1.775, 1.0) }, facing: 0, pose: { kind: "curl", amount: 0.25, lean: 50, t, blanket: "#ffd666" }, aimAt: [null, open], expr: "neutral", blink: 0.5, clampYaw: 0.45 });
  const lf = D.marks.ladderFoot1;
  bud!.set({ at: lf, facing: -Math.PI / 2, pose: { kind: "hold", t }, aimAt: [null, open], expr: "grin" });
  D.update(t);
  const P = (v: THREE.Vector3) => { const q = w.project(v); return `(${Math.round((q.x / 1080) * 100)}%,${Math.round((q.y / 1920) * 100)}%)`; };
  const rc = new THREE.Raycaster();
  const occl = (name: string, p: THREE.Vector3) => {
    const c = w.camera.position, d = p.clone().sub(c), L = d.length();
    rc.set(c, d.normalize()); rc.far = L - 0.02;
    const hits = rc.intersectObject(D.set.group, true);
    const hp = hits[0]?.point;
    const who = hp ? D.set.colliders.filter((cl) => cl.box.clone().expandByScalar(0.01).containsPoint(hp)).map((cl) => cl.name).slice(0, 3).join("/") : "";
    return `${name} ${P(p)} ${hits.length ? `HIDDEN at ${hp!.toArray().map((v) => v.toFixed(2))} ${who}` : "visible"}`;
  };
  const Y = you!, Bd = bud!;
  const pts: [string, THREE.Vector3][] = [["youHead", Y.headWorld()], ["youHip", Y.hipWorld()], ["youHand0", Y.handWorld(0)], ["youHand1", Y.handWorld(1)], ["youAnk0", Y.ankleWorld(0)], ["youAnk1", Y.ankleWorld(1)],
    ["budHead", Bd.headWorld()], ["budHand1", Bd.handWorld(1)], ["budFeet", lf.clone().setY(0.05)], ["doorTop", V(0, 2.0, 3.0)], ["doorFloor", V(0, 0.05, 3.0)], ["landing", V(-0.45, 0.05, 1.4)],
    ["opening", open], ["phone", D.A.phone.clone()], ["bed1", D.marks.bed1.clone()]];
  console.log(`[segD probe] cam ${IP.dcam ?? 1} pose ${k}: ` + pts.map(([n, p]) => occl(n, p)).join(" | "));
  return { scene: "dorm", camera: cam };
}
