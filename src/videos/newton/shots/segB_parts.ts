// SEGMENT B's helpers (WP5-B): things segB.ts needs that live in other lanes' files, worked around here until those
// lanes take them (requests.md, WP5-B):
//   - ntSpeak: NEWTON's dry talking mouth (no full row of teeth on his deadpan lines). For shots/common.ts (WP1) so
//     that scenes C-G match.
//   - lidInside: the dinner cover's INSIDE, a lit pewter shell (props/things.ts, WP3): the cover is an open turned
//     shell whose black outline hull fills its hollow when the hollow faces her (the kit's rule: a concave inside gets
//     no hull, so it must get a surface of its own).
//   - geoPage: the top sheet of his page with his figures on it (circles, triangles, an ellipse round a dot): script v5
//     row 09 (B04), "picture only: plants the geometry for G" (the sheets prop has written lines only).
//   - the v5 rebuild's small pure helpers: kLin (linear keys), stride (a walker's ease), footBob (her steps on their
//     sounds), breath (her breathing, on the scene's own clock), FREEZE-aware clock (sceneF).
import * as THREE from "three";
import { makeKit, NOINK, paint, hash as kitHash } from "../../../kit/props/kit";
import { PC, PLATE } from "../props";
import { speak, type RigState } from "./common";
import { lerp, clamp01, type Quote } from "../story";
import { FREEZE, CARD_LEN } from "../freeze";
import type { World } from "../world";

// ------------------------------------------------------------------------------------------------ Newton's mouth
type Mouth = NonNullable<RigState["mouth"]>;
/** the talking mouths NEWTON never makes: the rig's "strip" shows a full row of teeth (rig3d talkMouth teeth "all"),
 *  which under his furrowed deadpan brows reads as gritted teeth on a phone, and "wide" is too big for a man who barely
 *  moves his face. The lip-sync timing stays the same; only these two shapes get smaller. */
export const NT_MOUTH: Partial<Record<Mouth, Mouth>> = { strip: "pill", wide: "half" };
/** speak() for NEWTON's lines: the same { mouth, head, blink } with his low-energy mouths */
export const ntSpeak = (q: Quote, f: number, id = 0, stress?: number[]) => {
  const s = speak(q, f, id, stress);
  const m = s.mouth ? NT_MOUTH[s.mouth] : undefined;
  return m ? { ...s, mouth: m } : s;
};

// ------------------------------------------------------------------------------------------------ the cover's inside
const INSIDE = "lid.inside";
/** the cover's profile [r, y] (props/things.ts plate / lid) pulled in by `d` along its inner side, rim to crown */
const insideProfile = (d: number): THREE.Vector2[] =>
  ([[PLATE.lidR - d, 0.0015], [PLATE.lidR - d, 0.012], [PLATE.lidR * 0.92 - d, 0.0445], [PLATE.lidR * 0.6 - d * 0.9, 0.0745 - d * 0.8], [0.02 - d * 0.5, PLATE.lidH - 0.004 - d * 1.2], [0, PLATE.lidH - 0.004 - d * 1.3]] as [number, number][])
    .map(([r, y]) => new THREE.Vector2(Math.max(0, r), y));
/** puts a lit pewter inner surface (one step darker than the outside: PC.pewterLo) inside the domed cover in `g` (the
 *  loose `lid` prop's group, or the plate's own "plate.lid" group), once. Back faces only: it shows from inside the
 *  hollow and hides behind the outer shell from outside. No hull (it is an inside). */
export const lidInside = (w: World, g: THREE.Object3D) => {
  if (g.getObjectByName(INSIDE)) return;
  const mat = makeKit(w.M).flat(PC.pewterLo, { rough: 0.45, side: THREE.BackSide });
  const m = new THREE.Mesh(new THREE.LatheGeometry(insideProfile(0.0035), 40), mat);
  m.name = INSIDE; m.layers.set(NOINK); m.castShadow = false; m.receiveShadow = true;
  g.add(m);
};
/** the plate prop's own cover group (the cover while it sits on the plate or lifts off it) */
export const plateLidGroup = (plate: THREE.Object3D): THREE.Object3D | undefined =>
  plate.children.find((c) => c.name === "plate.lid" && (c as THREE.Group).isGroup);

// ------------------------------------------------------------------------------------------------ the scene's clock
/** THE SCENE'S OWN CLOCK ACROSS THE FREEZE (freeze.ts, the kit's HOLD contract: "the action after the gap must start
 *  from the held pose"): the picture holds FREEZE.at (B03's last frame) on the card's CARD_LEN frames and runs again on
 *  FREEZE.at + CARD_LEN + 1, which must be the very same picture. So everything that moves on its own (the quill, his
 *  breathing, the blinks, the dust and the steam, her breathing) runs on this clock: it skips the card's frames, so
 *  f991 = f915 exactly. Voice-keyed things (lines, camera keys) stay on the film's frames (none moves across the card). */
export const sceneF = (f: number) => (f <= FREEZE.at ? f : Math.max(FREEZE.at, f - CARD_LEN - 1));

// ------------------------------------------------------------------------------------------------ keys and eases
/** LINEAR keys [frame, value] (a weight that is eased once where it is used) */
export const kLin = (f: number, keys: [number, number][]) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i + 1 < keys.length; i++) if (f <= keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], (f - keys[i][0]) / Math.max(1, keys[i + 1][0] - keys[i][0]));
  return keys[keys.length - 1][1];
};
/** a walker's ease: speeding up over the first quarter, steady, slowing over the last (peak 1.33 x the average) */
export const stride = (x: number) => {
  const r = 0.25, v = 1 / (1 - r), u = clamp01(x);
  return u < r ? (v * u * u) / (2 * r) : u > 1 - r ? 1 - (v * (1 - u) * (1 - u)) / (2 * r) : v * (u - r / 2);
};
/** HER STEPS ON THEIR SOUNDS: the lens dips at each footfall frame (the sound's steps: SYNC_POINTS rows 29 and the step
 *  back), a sharp drop and a slow rise, and sways a little toward the foot that lands (alternating). Returns metres
 *  { up, right } and a roll (deg) to nudge the camera with. 0 away from the footfalls. */
export const footBob = (f: number, falls: number[], depth = 0.014) => {
  let up = 0, right = 0, roll = 0;
  falls.forEach((ff, i) => {
    const d = f - ff;
    if (d < -4 || d > 12) return;
    const k = d < 0 ? Math.pow(1 - -d / 4, 2) * 0.35 : Math.exp(-d / 4) * (1 - Math.exp(-(d + 1) * 1.2));
    const side = i % 2 ? 1 : -1;
    up -= depth * k; right += 0.006 * side * k; roll += 0.5 * side * k;
  });
  return { up, right, roll };
};
/** her breathing while she stands (the format rule: eye height about 1.5 m with a breathing bob): a slow rise and fall
 *  of the lens, a few millimetres, no turn and no roll (the film's camera stays still); on the scene's clock (sceneF) */
export const breath = (g: number, amp = 0.004) => amp * Math.sin((2 * Math.PI * 0.24 * g) / 30 + 0.7);

// ------------------------------------------------------------------------------------------------ his page's figures
const GEO = "page.geometry";
const hash = (a: number, b: number) => kitHash(a * 31.7 + b * 7.3);
/** the page he writes on (props SHEET size, 0.2 x 0.29): ruled lines of his small hand, and his figures: two circles,
 *  a triangle, an ellipse round a dot with the triangles swept from it (picture only; the board in G draws the same) */
const geoTex = () => paint(512, 742, (c, w, h) => {
  c.fillStyle = "#f3ead6"; c.fillRect(0, 0, w, h);
  const ink = (a: number) => `rgba(40,34,44,${a})`;
  // lines of writing (small loops), top and bottom thirds
  c.strokeStyle = ink(0.55); c.lineWidth = 2.2; c.lineCap = "round";
  const writeRow = (y: number, x0: number, x1: number, seed: number) => {
    c.beginPath(); c.moveTo(x0, y);
    for (let x = x0; x < x1; x += 4) { const word = Math.floor((x - x0) / 46); if ((x - x0) % 46 > 40) { c.moveTo(x + 4, y); continue; } c.lineTo(x, y - 6 * Math.abs(Math.sin(x * 0.35 + seed)) * (0.6 + 0.4 * hash(word, seed))); }
    c.stroke();
  };
  for (let i = 0; i < 5; i++) writeRow(52 + i * 30, 36, w - 40 - 60 * hash(i, 3), i * 1.7);
  for (let i = 0; i < 4; i++) writeRow(h - 150 + i * 30, 36, w - 40 - 80 * hash(i, 9), i * 2.3);
  // the figures, in the middle third
  c.strokeStyle = ink(0.9); c.lineWidth = 4; c.lineJoin = "round";
  const cx = w * 0.56, cy = h * 0.5, ex = w * 0.3, ey = h * 0.13;
  c.beginPath(); c.ellipse(cx, cy, ex, ey, -0.12, 0, Math.PI * 2); c.stroke();
  const S: [number, number] = [cx - ex * 0.55, cy + 6];
  const on = (a: number): [number, number] => [cx + ex * Math.cos(a) * Math.cos(-0.12) - ey * Math.sin(a) * Math.sin(-0.12), cy + ex * Math.cos(a) * Math.sin(-0.12) + ey * Math.sin(a) * Math.cos(-0.12)];
  const P = [on(-0.5), on(0.3), on(1.1), on(1.9)];
  c.lineWidth = 3;
  for (const p of P) { c.beginPath(); c.moveTo(...S); c.lineTo(...p); c.stroke(); }
  c.beginPath(); c.moveTo(...P[0]); c.lineTo(...P[1]); c.lineTo(...P[2]); c.lineTo(...P[3]); c.stroke();
  c.fillStyle = ink(0.95); c.beginPath(); c.arc(S[0], S[1], 7, 0, Math.PI * 2); c.fill();
  // two circles and a triangle
  c.lineWidth = 3.5;
  c.beginPath(); c.arc(w * 0.18, h * 0.36, 34, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.arc(w * 0.24, h * 0.39, 18, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(w * 0.7, h * 0.7); c.lineTo(w * 0.9, h * 0.7); c.lineTo(w * 0.8, h * 0.6); c.closePath(); c.stroke();
});
/** puts his figured page on top of the `sheets` prop's group (once; it shows and hides with the prop) */
export const geoPage = (w: World, g: THREE.Object3D) => {
  if (g.getObjectByName(GEO)) return;
  const mat = makeKit(w.M).flat("#ffffff", { map: geoTex(), rough: 0.9 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.29).rotateX(-Math.PI / 2), mat);
  m.name = GEO; m.position.set(0.02, 0.0175, 0.01); m.rotation.y = 0.06; m.layers.set(NOINK); m.receiveShadow = true;
  g.add(m);
};
