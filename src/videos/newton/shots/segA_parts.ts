// SEGMENT A's helpers (WP5-A): her mic with segA's own ASIDE pose, until cam.ts takes it (requests.md: WP5-A -> WP3).
//   micA(w, cam, f, o)   = C.putMic(w, cam, f, o) with two differences:
//     - the ASIDE (o.lens 0..1): the red head big in the middle near the lens, but the handle LEANS to the lower left
//       and her fist turns so the lens sees its finger curls and the thumb side (as in the rap grip and the grip on
//       Humphrey), the sleeve leaving at the left; cam.ts's aside points the handle straight back from the lens, so the
//       lens sees the fist end-on (the wrist's facets and the thumb wrapped over the handle: "a pale lump");
//     - o.nudge [dx, dy]: the head moved that many px (1080 x 1920) on screen at its own depth (her hand with it).
//   Pure: the frame and the camera in, the props put; returns { dof, visible, headPx }.
import * as THREE from "three";
import * as C from "../cam";
import { MIC } from "../props/things";
import { clamp01, smooth, easeInOutCubic, type CamPose } from "../story";
import type { World } from "../world";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** segA's ASIDE: the head's centre on the 1080 x 1920 frame and its depth (m); `bar` = the handle's way from the fist
 *  to the head (camera space: x right, y up, z forward: up and to the right, a little away, so the handle leans to the
 *  lower left); `sleeve` = which way her forearm leaves the fist (made square to the bar: to the left, a little down) */
export const ASIDE_A = { px: 560, py: 980, depth: 0.46, bar: [0.55, 0.65, 0.5] as const, sleeve: [-1, -0.5, 0.2] as const };

/** a world rotation from a hand's local +y (the bar) and +z (from the wrist to the fingers' front), both camera-space */
const quatCam = (F: C.CamFrame, yc: THREE.Vector3, zc: THREE.Vector3) => {
  const toW = (c: THREE.Vector3) => V().addScaledVector(F.right, c.x).addScaledVector(F.up, c.y).addScaledVector(F.fwd, c.z);
  const y = toW(yc).normalize(), z = toW(zc);
  z.addScaledVector(y, -z.dot(y)).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V().crossVectors(y, z), y, z));
};
/** the slight life of a held hand (mm, slow), as cam.ts's */
const life = (f: number) => V(0.0025 * Math.sin(f * 0.07), 0.002 * Math.sin(f * 0.053 + 1.3), 0.0015 * Math.sin(f * 0.041 + 2.1));

export type MicA = C.MicO & { nudge?: [number, number] };
/** HER MIC for segA (see the head of this file). Pure. */
export const micA = (w: World, cam: CamPose, f: number, o: MicA): { dof?: { focus: number; amount: number }; visible: boolean; headPx: { x: number; y: number } } => {
  const k = easeInOutCubic(clamp01(o.lens ?? 0));
  const P = C.micPose(cam, f, { ...o, lens: 0 });
  if (!P.visible) return { visible: false, headPx: P.headPx };
  const F = C.camFrame(cam);
  const head = C.worldToCam(F, P.head);
  let rot = P.hand.rot.clone();
  if (o.nudge) {
    const s = C.camToScreen(F, head), d = C.fromScreen(F, s.x + o.nudge[0], s.y + o.nudge[1], head.z).sub(C.fromScreen(F, s.x, s.y, head.z));
    head.add(d);
  }
  if (k > 0) {
    const A = ASIDE_A, hL = C.fromScreen(F, A.px, A.py, A.depth).add(life(f));
    const bar = V(...A.bar).normalize(), sl = V(...A.sleeve).normalize();
    sl.addScaledVector(bar, -sl.dot(bar)).normalize();
    head.lerp(hL, k);
    rot = rot.slerp(quatCam(F, bar, sl.clone().negate()), k);
  }
  // the fist on the handle, within her reach of the left shoulder
  const barC = V(0, 1, 0).applyQuaternion(rot), barCam = V(barC.dot(F.right), barC.dot(F.up), barC.dot(F.fwd));
  const grip = head.clone().addScaledVector(barCam, -MIC.head), sh = V(...C.BODY.shoulderL);
  if (grip.distanceTo(sh) > C.BODY.reach) { const back = grip.clone().sub(sh).setLength(C.BODY.reach).add(sh).sub(grip); grip.add(back); head.add(back); }
  const at = C.camToWorld(F, grip.x, grip.y, grip.z);
  w.prop("mic").put(at, { rot });
  w.prop("hand").put(at, { rot, pose: "grip" });
  const sp = C.camToScreen(F, head);
  const dof = k > 0.5 ? { focus: head.length(), amount: (o.blur ?? 14) * smooth((k - 0.5) / 0.5) } : P.dof;
  return { ...(dof ? { dof } : {}), visible: true, headPx: { x: sp.x, y: sp.y } };
};
