// cutout.ts: THE CUT-OUT of Newton's lead card, the picture's half (skin A 「手稿」; the owner, 14 Nov: "we still gonna be
// doing isolating him when his introcard comes up right?"). On the card's frames he stays in full colour with a margin
// of the skin's laid paper round him, lifted off the frozen page like a sticker cut out of it, with what he holds; a
// thin iron-gall edge falls on the margin's lower right (the kit pass's hard drop); the place he was lifted from shows
// the same paper. The kit's IsolatePass (src/kit/fx/isolate.ts) draws it in the film's own post chain (Film.tsx: created
// with the other passes, between the lens blur and bloom, set every frame). Picture side, so it lives outside hud/
// (kit.json domOnly); the card's words (hud/ms/card.tsx) sit round the LIFTED figure with the same lift (freeze.ts
// cutLift / liftPt).
//
// ONE WASH: the set behind him is washed by wash.ts (the approved A_card look: the set as sepia ink on laid paper,
// chain lines, foxing, behind the page-turn front). The kit pass's own wash is a plain two-colour ramp over the whole
// picture (no laid paper, no front), so it cannot be that look: its amount is 0 here and its dim 1 (it draws only the
// line, the drop, the lift and the place he left), never a second wash over wash.ts's.
//
//   cutState(w, f)     the IsolateState for film frame f (after the Director posed it: the held frame), or null off the
//                      cut-out's frames (freeze.ts cutAt: in with the card's build, out with its exit)
//   cutLead(w)         Newton's rig on this frame (the first visible figure whose person's name starts "newton"), or null
//   cutKeep(w, rig)    what stays in colour and is lifted with him: his rig group, the quill when it is in his reach,
//                      and any prop in his hands (its origin, the grip put on the hand, within HOLD_R of a hand)
//   cutHeld(w, rig)    the names of those props (wash.ts msWash keeps the same ones in colour)
//   cutLiftOf(w, rig, f)  the lift on frame f (freeze.ts cutLift about cutPivot of his projected head and hands)
//   CUT_LOOK           the line (paper #F1E4C3, 14 film px), the drop (iron-gall #2A1D14, 3 / 4 px, hard), the place he
//                      left (paper), the pass's wash off
import * as THREE from "three";
import type { IsolateState } from "../../kit/fx/isolate";
import type { World } from "./world";
import { PROP_NAMES, type PropName } from "./props";
import { cutAt, cutLift, cutPivot } from "./freeze";
import { WASH_PAPER } from "./wash";

/** skin A's iron-gall ink (= hud/ms/skin.ts MS.ink; hud/ms/check.ts checks they agree: the picture side never imports hud/) */
export const CUT_INK = "#2A1D14";
/** THE CUT-OUT's look, from skin A: the paper margin, the hard ink edge on its lower right, the paper where he stood */
export const CUT_LOOK = {
  outline: { color: WASH_PAPER, width: 14 },
  shadow: { x: 3, y: 4, alpha: 0.9 },
  left: { color: WASH_PAPER, alpha: 1 },
  /** the pass's wash is off: wash.ts washes the set (one wash look); the drop takes `dark` (the ink) */
  wash: { dark: CUT_INK, light: WASH_PAPER, amount: 0, dim: 1 },
} as const;
/** a prop is in his hands when its origin (the grip a shot puts on the hand) is this close to one (m) */
const HOLD_R = 0.03;
/** the quill stays with him whenever it is this close to a hand (m): in his hand on any grip */
const QUILL_R = 0.3;

type RigLike = { group: THREE.Object3D; state: { visible?: boolean }; headWorld(): THREE.Vector3; handWorld(i: 0 | 1): THREE.Vector3 };
/** each rig's person name (the World's private tables, read only: hud/ms/screen.ts does the same) */
const rigName = (w: World, r: unknown): string => {
  const W_ = w as unknown as { ids: Map<{ name: string }, number>; rigs: Map<string, unknown> };
  for (const [k, x] of W_.rigs) if (x === r) { const id = Number(k.split("|")[0]); for (const [p, i] of W_.ids) if (i === id) return p.name; }
  return "figure";
};
const shown = (o: THREE.Object3D | null) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
/** Newton's rig on this frame: the first visible figure whose person's name starts "newton" (every Newton swap) */
export const cutLead = (w: World): RigLike | null => {
  for (const r of w.rc.figures as unknown as RigLike[]) if (shown(r.group) && r.state.visible !== false && rigName(w, r).startsWith("newton")) return r;
  return null;
};
const _o = new THREE.Vector3();
/** the props that go with him: the quill in his reach, anything whose grip is on one of his hands */
export const cutHeld = (w: World, r: RigLike): PropName[] => {
  const hands = [r.handWorld(0), r.handWorld(1)], out: PropName[] = [];
  for (const n of PROP_NAMES) {
    const g = w.prop(n).group;
    if (!shown(g)) continue;
    g.getWorldPosition(_o);
    const d = Math.min(...hands.map((h) => h.distanceTo(_o)));
    if (d <= (n === "quill" ? QUILL_R : HOLD_R)) out.push(n);
  }
  return out;
};
/** what stays in colour and is lifted with him */
export const cutKeep = (w: World, r: RigLike): THREE.Object3D[] => [r.group, ...cutHeld(w, r).map((n) => w.prop(n).group)];

/** the lift THE CUT-OUT is drawn with on film frame f: freeze.ts cutLift about cutPivot of his head and hands on screen
 *  (hud/ms/card.tsx lifts its anchors the same way from msScreen's figure; the faces checker lifts his face with it) */
export const cutLiftOf = (w: World, r: RigLike, fr: number) =>
  cutLift(fr, cutPivot(w.project(r.headWorld()), [w.project(r.handWorld(0)), w.project(r.handWorld(1))]));

/** THE CUT-OUT on film frame f (the frame already posed: the held frame on the card's frames), or null */
export const cutState = (w: World, fr: number): IsolateState | null => {
  const c = cutAt(fr);
  if (!c) return null;
  const r = cutLead(w);
  if (!r) return null;
  return {
    k: c.k,
    keep: cutKeep(w, r),
    wash: { ...CUT_LOOK.wash },
    outline: { ...CUT_LOOK.outline },
    shadow: { ...CUT_LOOK.shadow },
    lift: cutLiftOf(w, r, fr),
    left: { ...CUT_LOOK.left },
  };
};
