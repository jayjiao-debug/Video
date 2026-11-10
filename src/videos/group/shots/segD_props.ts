// segment D 3D props (built once, added to the classroom scene in enter, removed in exit):
//   desk phones  one real phone per scroller. While it is in the hand the card draws it (kit phone prop: pink case,
//                dark 3-lens camera bump at the top corner, back to the camera); on the put-down it becomes this mesh
//                of the same size, colours and details at the same place, standing on the desk line, and tips over
//                flat onto the desk (top away from the sitter, so it lands screen up), the hand (drawn on the mesh while
//                it stands, as the card's own hand is behind it) riding it down. The pick-up is the same in reverse.
//   dressing     the set's random desk phones that lie on the four's desks (instances near seats 76-79): hidden while
//                a put-down phone could be confused with them (f < the phone insert), restored during the insert (the
//                room is not drawn then) so the loop frames match segA's f0 exactly. exit() restores them too.
import * as THREE from "three";
import type { World } from "../world";
import { NOINK } from "../../vasa/ink";

/** the kit's drawn phone (kit/toon.ts drawProp "phone"), in head heights (HH): 0.235 x 0.44, corner radius 0.16 w; the
 *  hand ball sits 0.24 h above the bottom edge. The meshes are built at HH = 1 and scaled by each sitter's HH (m). */
const PW = 0.235, PH = 0.44, PT = 0.0225, PR = 0.16 * PW, U = 1 / 95;   // U: the kit's line unit u (W / 100) in HH
/** the pivot line (the phone's bottom edge) on the desk top: 1 cm onto the desk from its near edge (z 4.465) */
const DESK_Y = 0.7505, PIVOT_Z = 4.455;
/** x: the phone's centre (= the hand's x in the rest hold); tip: 0 standing as in the hand .. 1 flat, screen up;
 *  glow: the screen 0 asleep .. 1 lit; hh: the sitter's head height (m, the drawn phone's scale); hand: the hand rides
 *  the phone (the tip); mirror: the sitter's card is mirrored (the camera bump then sits screen right, as drawn) */
export type PhoneLie = { x: number; tip: number; glow: number; hh: number; hand: boolean; mirror: boolean } | null;

type PhoneM = { g: THREE.Group; hand: THREE.Object3D };
let meshes: PhoneM[] | null = null;
let screens: THREE.MeshBasicMaterial[] = [];
const SCR_ON = new THREE.Color("#bfe3ff"), SCR_OFF = new THREE.Color("#262f48");
/** rounded rectangle, x0..x1 / y0..y1 (local units) */
const rrect = (x0: number, y0: number, x1: number, y1: number, r: number) => {
  const sh = new THREE.Shape();
  sh.moveTo(x0 + r, y0); sh.lineTo(x1 - r, y0); sh.quadraticCurveTo(x1, y0, x1, y0 + r); sh.lineTo(x1, y1 - r);
  sh.quadraticCurveTo(x1, y1, x1 - r, y1); sh.lineTo(x0 + r, y1); sh.quadraticCurveTo(x0, y1, x0, y1 - r); sh.lineTo(x0, y0 + r);
  sh.quadraticCurveTo(x0, y0, x0 + r, y0);
  return sh;
};
const disc = (r: number) => new THREE.CircleGeometry(r, 20);
const build = (): PhoneM[] => {
  // unlit, in the kit's colours: the drawn phone is flat-shaded, so a lit mesh came out much darker at the hand-over
  const M = (c: string) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });
  const caseM = new THREE.MeshBasicMaterial({ color: "#d9467f" }), bevelM = M("#f08ab2"), inkM = M("#241726"), bumpM = M("#2c2f3a"),
    lensM = M("#11131a"), glintM = M("#8b96ad"), flashM = M("#f4e7b8"), rimM = M("#20232b");
  // the kit's 1.7 u outline straddles the drawn edge, the ink pass draws inside the mesh silhouette: the body (and the
  // screen rim) grow by half a line so the outer edges match at the hand-over (the bottom still clears the desk)
  const o = 0.85 * U, sil = rrect(-PW / 2 - o, -o, PW / 2 + o, PH + o, PR + o);
  const body = new THREE.ExtrudeGeometry(sil, { depth: PT, bevelEnabled: false, curveSegments: 6 });
  body.translate(0, 0, -PT / 2);
  // the back faces -z (the camera while it stands), the screen +z (the sitter). Screen-left on the back is +x.
  const zb = -PT / 2, zf = PT / 2, e = 0.0012;   // decal offsets (HH): ~0.5 mm at HH 0.4, far below the ink's depth step
  const bs = 0.42 * PW, bx0 = PW / 2 - 0.1 * PW, by0 = PH - 0.07 * PW;   // camera bump: its screen top-left corner
  const decal = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => {
    const d = new THREE.Mesh(geo, m); d.position.set(x, y, z); d.layers.set(NOINK); d.castShadow = false; d.receiveShadow = false; return d;
  };
  const lr = 0.15 * bs;
  const backDetail = () => [
    decal(new THREE.PlaneGeometry(0.6 * PW, 1.2 * U), bevelM, 0, 2.6 * U, zb - e),
    decal(new THREE.ShapeGeometry(rrect(-bs / 2 - 0.5 * U, -bs / 2 - 0.5 * U, bs / 2 + 0.5 * U, bs / 2 + 0.5 * U, 0.28 * bs + 0.5 * U), 6), inkM, bx0 - bs / 2, by0 - bs / 2, zb - e),
    decal(new THREE.ShapeGeometry(rrect(-bs / 2, -bs / 2, bs / 2, bs / 2, 0.28 * bs), 6), bumpM, bx0 - bs / 2, by0 - bs / 2, zb - 2 * e),
    ...([[0.3, 0.3], [0.3, 0.7], [0.7, 0.5]] as [number, number][]).flatMap(([lx, ly]) => [
      decal(disc(lr), lensM, bx0 - lx * bs, by0 - ly * bs, zb - 3 * e),
      decal(disc(0.3 * lr), glintM, bx0 - lx * bs + 0.3 * lr, by0 - ly * bs + 0.3 * lr, zb - 4 * e)]),
    decal(disc(0.07 * bs), flashM, bx0 - 0.72 * bs, by0 - 0.18 * bs, zb - 3 * e),
  ];
  screens = [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: SCR_ON.clone() }));
  return [0, 1, 2].map((i) => {
    const g = new THREE.Group(); g.name = `segD:phone${i}`; g.rotation.order = "YXZ";
    const m = new THREE.Mesh(body, caseM); m.castShadow = true; m.receiveShadow = false;
    const rim = decal(new THREE.ShapeGeometry(sil, 6), rimM, 0, 0, zf + e);
    const glass = decal(new THREE.ShapeGeometry(rrect(-PW / 2 + 2 * U, 3 * U, PW / 2 - 2 * U, PH - 3 * U, PR * 0.7), 6), screens[i], 0, 0, zf + 2 * e);
    // the kit's hand on the phone (a ball on the lower part, the thumb on the screen-right edge): the card's own hand is
    // behind the mesh while it stands, so the mesh carries it through the tip
    const hand = new THREE.Group();
    hand.add(decal(disc(3.6 * U), inkM, 0, 0.24 * PH, zb - 5 * e), decal(disc(2.2 * U), inkM, -(PW / 2 + 0.4 * U), 0.42 * PH, zb - 5 * e));
    g.add(m, rim, glass, ...backDetail(), hand); g.visible = false;
    return { g, hand };
  });
};
export function phonesEnter(w: World) {
  if (!meshes) meshes = build();
  for (const { g } of meshes) if (g.parent !== w.classroom.scene) w.classroom.scene.add(g);
}
export function phonesExit() {
  if (meshes) for (const { g } of meshes) { g.visible = false; g.parent?.remove(g); }
}
/** how far the phone turns on the desk as it is laid down (rad, about the vertical) */
const YAW = 0.35;
/** pose the three phones (any order, one per scroller) every frame */
export function phonesPose(lies: PhoneLie[]) {
  if (!meshes) return;
  lies.forEach((l, i) => {
    const { g, hand } = meshes![i];
    g.visible = !!l;
    if (!l) return;
    g.scale.set(l.mirror ? -l.hh : l.hh, l.hh, l.hh);
    g.position.set(l.x, DESK_Y + (PT * l.hh) / 2, PIVOT_Z);
    g.rotation.set((-Math.PI / 2) * l.tip, YAW * l.tip * (i === 1 ? -1 : 1), 0);
    hand.visible = l.hand && l.tip < 0.8;
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
