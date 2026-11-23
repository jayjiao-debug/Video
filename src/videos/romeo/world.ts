// THE WORLD of 采访罗密欧与朱丽叶: the kit's DayWorld with this film's places, props and cast (src/kit/day/world.ts has
// the contract a shot may call: setPlace first, set.param, setCamera, actor, update, prop, project).
import type * as THREE from "three";
import { Vector3 } from "three";
import { DayWorld } from "../../kit/day/world";
import { BAKED_LIGHT } from "../../kit/day/sets";
import { FPS, W, H, lensFov, type Place } from "./story";
import { buildSets, type RomeoSet } from "./sets";
import { buildProps, type Props, type Prop, type PropName } from "./props";
import { addPerson, type Person } from "./people";
import { standUp } from "./shots/kit";
import { easeHands, easeBodies } from "./shots/ease";
import { partHands } from "./shots/gest";
import { LABEL_SPIN, LABEL_AT } from "./props/skull";

export class World extends DayWorld<Place, Person, RomeoSet, Props, PropName, Prop> {
  constructor(gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    super(gl, camera, { name: "romeo", fps: FPS, W, H, lensFov, buildSets, buildProps, addPerson, bakedLight: BAKED_LIGHT, firstPlace: "grove",
      // a figure laid down on a frame (shots/kit.ts lieDown) stands up again before every solve
      onUpdate: (_w, r) => standUp(r) });
  }
  /** the kit's solve with this film's fixes for moves that would happen in one frame (shots/ease.ts): a facing that
   *  jumps turns there, a walk's forward tip comes and goes with the walker's speed, and a hand whose pose changes
   *  travels there on a short arc (solved once as the shot posed it, then again with those hands pinned on their way).
   *  (v5) And a gesture's hand on its way up or down (shots/gest.ts reach): the figure is solved with that hand free,
   *  the hand is put on its way from there, and the figure is solved again. */
  update() {
    const unturn = easeBodies(this.names, this.f);
    const part = partHands(this.names.keys());
    super.update();
    if (part) { part.pin(); super.update(); }
    const unease = easeHands(this.names, this.f);
    if (unease) { super.update(); unease(); }
    part?.undo();
    unturn();
    this.labelsToLens();
    this.ringsOff();
  }
  /** THE HEAD'S DEPTH RING STAYS OFF (v5). When an arm is drawn in front of its own head (RigState.armFront: Romeo's
   *  bottle before his chin in the vault), the rig puts a disc of 1 m radius at the head's edge into the depth buffer,
   *  kept to the head's own pixels by the stencil. In this film's pictures the disc hid everything behind it instead:
   *  his legs down to the shins, his cape and the body's outline (stills v29, f5300 to f5556). Without the disc an arm
   *  BEHIND the head's edge could show over the head's outline; the bottle's arm is in front of it. */
  private ringsOff() {
    for (const r of this.names.keys()) { const ring = (r as unknown as { ring?: THREE.Object3D }).ring; if (ring) ring.visible = false; }
  }
  /** A LABEL KEEPS TOWARD THE LENS (v5: the skull on Romeo's bottle, props/skull.ts): a part named LABEL_SPIN is turned
   *  about its own axis (y) until the middle of its label faces the lens. Its glass is round, so nothing else is seen
   *  to turn. Found once per figure. */
  private spins = new WeakMap<object, THREE.Object3D[]>();
  private _lp = new Vector3();
  private labelsToLens() {
    for (const r of this.names.keys()) {
      let list = this.spins.get(r);
      if (!list) { list = []; r.group.traverse((o3) => { if (o3.name === LABEL_SPIN) list!.push(o3); }); this.spins.set(r, list); }
      for (const s of list) {
        if (!s.parent) continue;
        s.parent.updateWorldMatrix(true, false);
        const p = s.parent.worldToLocal(this._lp.copy(this.camera.position));
        s.rotation.y = Math.atan2(p.x, p.z) - LABEL_AT;
      }
    }
  }
}
