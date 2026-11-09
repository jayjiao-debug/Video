// segment D 3D props (built once, added to the classroom scene in enter, removed in exit):
//   desk phones  one real phone per scroller. While it is in the hand the card draws it (kit phone prop, pale back to
//                the camera); on the put-down it becomes this mesh at the same place, standing on the desk line, and
//                tips over flat onto the desk (top away from the sitter, so it lands screen up), the hand riding it
//                down. The pick-up is the same in reverse.
//   dressing     the set's random desk phones that lie on the four's desks (instances near seats 76-79): hidden while
//                a put-down phone could be confused with them (f < the phone insert), restored during the insert (the
//                room is not drawn then) so the loop frames match segA's f0 exactly. exit() restores them too.
import * as THREE from "three";
import type { World } from "../world";

/** the kit's drawn phone at this cast's size (0.175 x 0.33 head heights, head height ~0.40 m) */
export const PHONE = { w: 0.071, h: 0.133, t: 0.009 };
/** the pivot line (the phone's bottom edge) on the desk top: 1 cm onto the desk from its near edge (z 4.465) */
const DESK_Y = 0.7505, PIVOT_Z = 4.455;
/** x: the phone's centre (= the hand's x in the rest hold); tip: 0 standing as in the hand .. 1 flat, screen up;
 *  glow: the screen 0 asleep .. 1 lit */
export type PhoneLie = { x: number; tip: number; glow: number } | null;

let meshes: THREE.Group[] | null = null;
let screens: THREE.MeshBasicMaterial[] = [];
const SCR_ON = new THREE.Color("#a9cdf2"), SCR_OFF = new THREE.Color("#262f48");
const build = () => {
  // unlit, in the kit's colours: the drawn phone is flat-shaded, so a lit mesh came out much darker at the hand-over
  const back = new THREE.MeshBasicMaterial({ color: "#e4dfd6" });
  const camM = new THREE.MeshBasicMaterial({ color: "#3a3e48" });
  const { w, h, t } = PHONE;
  const body = new THREE.BoxGeometry(w, h, t); body.translate(0, h / 2, 0);
  const bump = new THREE.BoxGeometry(0.017, 0.017, 0.003); bump.translate(w / 2 - 0.0135, h - 0.0135, -t / 2 - 0.0012);
  screens = [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: SCR_ON.clone() }));
  return [0, 1, 2].map((i) => {
    const g = new THREE.Group(); g.name = `segD:phone${i}`; g.rotation.order = "YXZ";
    // BoxGeometry groups: +x -x +y -y +z -z. The screen faces +z (the sitter), the pale back -z (the camera)
    const m = new THREE.Mesh(body, [back, back, back, back, screens[i], back]); m.castShadow = true; m.receiveShadow = false;
    const b = new THREE.Mesh(bump, camM); b.castShadow = false;
    g.add(m, b); g.visible = false;
    return g;
  });
};
export function phonesEnter(w: World) {
  if (!meshes) meshes = build();
  for (const g of meshes) if (g.parent !== w.classroom.scene) w.classroom.scene.add(g);
}
export function phonesExit() {
  if (meshes) for (const g of meshes) { g.visible = false; g.parent?.remove(g); }
}
/** how far the phone turns on the desk as it is laid down (rad, about the vertical) */
const YAW = 0.35;
/** pose the three phones (any order, one per scroller) every frame */
export function phonesPose(lies: PhoneLie[]) {
  if (!meshes) return;
  lies.forEach((l, i) => {
    const g = meshes![i];
    g.visible = !!l;
    if (!l) return;
    g.position.set(l.x, DESK_Y + PHONE.t / 2, PIVOT_Z);
    g.rotation.set((-Math.PI / 2) * l.tip, YAW * l.tip * (i === 1 ? -1 : 1), 0);
    screens[i].color.copy(SCR_OFF).lerp(SCR_ON, l.glow);
  });
}

// ---------------------------------------------------------------------------------------------------- dressing
type Hid = { im: THREE.InstancedMesh; k: number; m: THREE.Matrix4 }[];
let hid: Hid | null = null;
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
/** find the set's desk phones on these seats' desk zones (within 0.3 m of the seat's card spot) */
export function dressingEnter(w: World, seats: number[]) {
  if (hid) return hid;
  const out: Hid = [], m = new THREE.Matrix4(), p = new THREE.Vector3(), zones = seats.map((i) => w.classroom.A.cards[i].pos);
  w.classroom.set.group.updateMatrixWorld(true);
  w.classroom.set.group.traverse((o) => {
    const im = o as THREE.InstancedMesh;
    if (!im.isInstancedMesh || !im.name.startsWith("classroom:phone:")) return;
    for (let k = 0; k < im.count; k++) {
      im.getMatrixAt(k, m); p.setFromMatrixPosition(m).applyMatrix4(im.matrixWorld);
      if (zones.some((c) => Math.abs(p.x - c.x) < 0.3 && Math.abs(p.z - c.z) < 0.3 && Math.abs(p.y - c.y) < 0.1)) out.push({ im, k, m: m.clone() });
    }
  });
  hid = out;
  return out;
}
export function dressingHidden(hidden: boolean) {
  if (!hid) return;
  for (const e of hid) { e.im.setMatrixAt(e.k, hidden ? ZERO : e.m); e.im.instanceMatrix.needsUpdate = true; }
}
export const dressingCount = () => hid?.length ?? 0;
