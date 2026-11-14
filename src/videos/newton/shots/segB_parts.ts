// SEGMENT B's helpers (WP5-B): things segB.ts needs that live in other lanes' files, worked around here until those
// lanes take them (requests.md, WP5-B):
//   - ntSpeak: NEWTON's dry talking mouth (no full row of teeth on his deadpan lines). For shots/common.ts (WP1) so
//     that scenes C-G match.
//   - lidInside: the dinner cover's INSIDE, a lit pewter shell (props/things.ts, WP3): the cover is an open turned
//     shell whose black outline hull fills its hollow when the hollow faces her (the kit's rule: a concave inside gets
//     no hull, so it must get a surface of its own).
import * as THREE from "three";
import { makeKit, NOINK } from "../../../kit/props/kit";
import { PC, PLATE } from "../props";
import { speak, type RigState } from "./common";
import type { Quote } from "../story";
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
