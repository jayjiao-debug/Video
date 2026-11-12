// Segment A's own 3D thing: THE QIN BANNER of line 3 (BIBLE section 6: "segment A's own mesh"). A black standard with
// a white 秦 that stands on the capital's wall (layout CARD.city.socket), topples sideways off the wall's end on
// 「秦朝刚灭亡」 and lies in the sand behind; the red flag then goes into the same socket.
// Built once per World (WeakMap), parented to w.root, hidden unless a frame poses it (segA hides it first thing in
// every pose and in exit). A pure function of what it is given: nothing is kept between frames.
//   origin = the pole's foot, +y = up the pole, the cloth hangs from a cross bar and faces +z (the camera side).
//   Sizes: pole 1.0 m x 4.4 cm, cross bar 0.32 m, cloth 0.26 x 0.44 m; the cloth starts 0.49 m up the pole (the
//   wall's right end is 0.12 m from the socket: when the pole lies on the wall top, cloth and bar are out in the air).
//   Both faces of the cloth carry the picture (it ends face down, so the back shows).
import * as THREE from "three";
import type { World } from "../world";
import { paint, flatOf, FONT } from "../sets/okit";

export const QIN = { pole: 1.0, clothW: 0.26, clothH: 0.44 };
export type QinBanner = {
  group: THREE.Group;
  /** shows it: `foot` = where the pole's foot is; rz = its turn about the world z axis through the foot (rad; negative =
   *  the top goes to +x, screen right); spin = its turn about its own pole, applied first (rad; +PI/2 with rz = -PI/2
   *  lays the cloth face down under the pole); rx = a turn about the world x axis, applied last (negative = away) */
  pose(foot: THREE.Vector3, rz?: number, spin?: number, rx?: number): void;
  hide(): void;
};
const made = new WeakMap<World, QinBanner>();

export const qinBanner = (w: World): QinBanner => {
  const got = made.get(w);
  if (got) return got;
  const flat = flatOf(w.set.mats("card")), g = new THREE.Group();
  g.name = "segA.qinBanner"; g.visible = false; g.rotation.order = "XZY";
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[]) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const L = QIN.pole, W = QIN.clothW, H = QIN.clothH, DARK = "#2b2733";
  const mWood = flat("#6a5136"), mDark = flat(DARK);
  add(new THREE.CylinderGeometry(0.022, 0.022, L, 10).translate(0, L / 2, 0), mWood);
  add(new THREE.SphereGeometry(0.036, 10, 8).translate(0, L + 0.02, 0), flat("#b89a5c"));
  add(new THREE.BoxGeometry(W + 0.06, 0.034, 0.034).translate(0, L - 0.05, 0.03), mWood);
  // the cloth: never pure black (the ink must stay the darkest thing), a pale line inside its edge, the white 秦
  const tex = paint(256, Math.round((256 * H) / W), (c, cw, ch) => {
    c.fillStyle = DARK; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = "#cfc6b0"; c.lineWidth = 7; c.strokeRect(13, 13, cw - 26, ch - 26);
    c.fillStyle = "#f4f0e6"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `700 ${Math.round(cw * 0.62)}px ${FONT}`;
    c.fillText("秦", cw / 2, ch * 0.4);
    c.fillRect(cw * 0.3, ch * 0.72, cw * 0.4, 9); c.fillRect(cw * 0.36, ch * 0.8, cw * 0.28, 9);
  });
  const mFace = flat("#ffffff", tex, 0.9);
  add(new THREE.BoxGeometry(W, H, 0.016).translate(0, L - 0.07 - H / 2, 0.056), [mDark, mDark, mDark, mDark, mFace, mFace]);
  w.root.add(g);
  const B: QinBanner = {
    group: g,
    pose(foot, rz = 0, spin = 0, rx = 0) { g.visible = true; g.position.copy(foot); g.rotation.set(rx, spin, rz); g.updateMatrixWorld(true); },
    hide() { g.visible = false; },
  };
  made.set(w, B);
  return B;
};
