// The Newton film's World: the places (sets/index.ts), the props (props/index.ts) and the cast of rig figures (people.ts),
// built ONCE per page. A copy of Qin's world.ts (with its aspect()) for the NewtonSet. WP1; segment builders read, never
// edit. The contract (story.ts "HOW TO BUILD A SEGMENT", README.md):
//
//   w.setPlace(place, { light? })   FIRST in every shot: shows that place only and gives the figures its light. `light`
//                       lays fields over the place's figure light for this frame; the three baked values cannot change.
//   w.set.param(name, value)        the per-frame dressing of the place that shows (sets/index.ts PARAMS; beginFrame
//                       resets every param to its default). THE FIGURES' LIGHT FOLLOWS THE PARAMS: w.update() lays the
//                       place's cast(t, f) (its light for the current params and frame: the room's hour, the fire's
//                       flicker) over the place's look, so set the params BEFORE w.update()
//   w.setCamera(cam)    then the camera (any CamPose: her eyes at 1.6 m, cam.ts); the engine re-applies the pose's camera
//   w.actor(person, key?)   the rig figure of a Person (people.ts NEWTON, HUMPHREY): created on first use, then the same
//                       figure every time; `key` gives a second figure of the same Person. beginFrame hides every
//                       figure: set({ ..., visible: true }) the ones in your shot
//   w.update()          solves every figure for the current camera and light (after setting them; before reading hands)
//   w.prop(name, key?)  a prop (props/index.ts): .put(at, opts); hidden again next frame
//   w.set               the NewtonSet (look, mats, param, getParam ...); setView is called by endFrame only
//   w.project(p) -> { x, y, z, front, on }   world point -> 1080 x 1920 px (front = in front of the camera)
//   w.f, w.t            the real frame and its time in seconds (shots take their time from their own f argument)
//   w.place             the place set this frame (null before setPlace)
//   w.M                 bt/pbr materials with the room's fill, for a segment's own meshes; w.root to add them to
// The frame: beginFrame(f) [no place, figures hidden, every set param at its default, every prop hidden] -> the shot ->
// endFrame(P) [camera, set.setView, set.setFocus, set.animate(P.clock ?? t, f), the robes' ground, update if the shot
// did not].
// THE ROBES' GROUND (garb.ts reads group.userData.hmGround every frame): a figure's hanging cloth stops at the seat's
// floor for a sitter and at `at.y` for a standing figure (never below 0). The World sets it in update(), so a shot never
// has to. Every floor a figure stands on is y 0 (layout.ts).
import * as THREE from "three";
import type { Mats } from "../bt/pbr";
import { NOINK } from "../../kit/fx/ink";
import { RigCast, type Rig, type RigState } from "../group/kit/rig3d";
import type { CastLight } from "../group/kit/cast";
import { ipNum } from "../../kit/film/env";
import { buildSets, BAKED_LIGHT, type NewtonSet, type PlaceLook } from "./sets";
import { buildProps, type Props, type Prop, type PropName } from "./props";
import { addPerson, type Person } from "./people";
import { FPS, W, H, type CamPose, type Pose, type Place, type V3Like } from "./story";
// Cover stills only (input props, all default to the film's own framing): zoom < 1 shows more around the same frame;
// sx / sy move the picture right / down by that fraction of the frame (a lens shift, the perspective stays).
const COVER_ZOOM = ipNum("zoom", 1, false), COVER_SX = ipNum("sx", 0), COVER_SY = ipNum("sy", 0);
/** Cover stills only: the size of icons drawn over the picture in screen px (they do not shrink with zoom). 1 = the film. */
export const COVER_OV = ipNum("ov", 1, false);

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());
const now = () => (typeof performance !== "undefined" ? performance.now() : 0); // timing logs only, never pixels

/** group/kit/rig3d applyLight (module-private there): the four uniforms a RigCast's figures are lit by */
const applyLight = (rc: RigCast, L: CastLight) => {
  const U = rc.U;
  U.uKey.value.set(...L.key).normalize();
  const t = U.uTint.value.set(1 - L.tintK + L.tint[0] * L.tintK, 1 - L.tintK + L.tint[1] * L.tintK, 1 - L.tintK + L.tint[2] * L.tintK);
  t.multiplyScalar(1 / Math.max(0.2126 * t.x + 0.7152 * t.y + 0.0722 * t.z, 0.05));
  U.uGain.value = L.gain;
  const s = U.uShade.value.set(...(L.shade ?? [1.04, 0.95, 1.34]));
  s.multiplyScalar(1 / Math.max(0.2126 * s.x + 0.7152 * s.y + 0.0722 * s.z, 0.05));
  rc.light = L;
};

export type Projected = { x: number; y: number; z: number; front: boolean; on: boolean };
export class World {
  readonly root = new THREE.Group();
  readonly set: NewtonSet;
  readonly props: Props;
  readonly rc: RigCast;
  readonly M: Mats;
  f = 0; t = 0;
  place: Place | null = null;
  updated = false;
  private rigs = new Map<string, Rig>();
  private ids = new Map<Person, number>();
  private _v = V(); private _p = V(); private _look = V();
  constructor(readonly gl: THREE.WebGLRenderer, readonly camera: THREE.PerspectiveCamera) {
    const t0 = now();
    this.root.name = "newton-world";
    camera.layers.enable(NOINK);
    this.set = buildSets(gl);
    this.root.add(this.set.group);
    const t1 = now();
    this.M = this.set.mats("room");
    this.props = buildProps(this.M);
    this.root.add(this.props.group);
    const people = new THREE.Group(); people.name = "people"; this.root.add(people);
    // ONE cast for every place: its light follows the place (setPlace). The values a figure bakes when it is first
    // built are the same in every place (sets/index.ts BAKED_LIGHT), so it does not matter which frame builds it.
    this.rc = new RigCast(people, { light: { ...this.set.look("room").cast, ...BAKED_LIGHT } });
    this.set.setPlace(null);
    console.log(`[newton] world built in ${Math.round(now() - t0)} ms (sets ${Math.round(t1 - t0)})`);
  }
  /** the rig figure of this Person (the same one every call); key = "" by default, another key = another figure */
  actor(p: Person, key = ""): Rig {
    let id = this.ids.get(p);
    if (id === undefined) { id = this.ids.size; this.ids.set(p, id); }
    const k = `${id}|${key}`;
    let r = this.rigs.get(k);
    if (!r) { r = addPerson(this.rc, p); r.group.scale.setScalar(1); this.rigs.set(k, r); this.hide(r); }   // (never scaled: the rig's solver works in world space)
    return r;
  }
  private hide(r: Rig) {
    const s = r.state as unknown as Record<string, unknown>;
    for (const key of Object.keys(s)) delete s[key];
    Object.assign(s, { at: V(0, -50, 0), facing: 0, pose: { kind: "idle" }, visible: false } as RigState);
  }
  /** FIRST in every shot. Shows this place only and lights the figures for it. */
  setPlace(p: Place, o: { light?: Partial<CastLight> } = {}) {
    this.place = p;
    this.light = o.light ?? {};
    this.set.setPlace(p);
    this.applyPlaceLight();
  }
  private light: Partial<CastLight> = {};
  /** the figures' light: the place's look, its light for the current params and frame (cast), the shot's own fields */
  private applyPlaceLight() {
    if (!this.place) return;
    applyLight(this.rc, { ...this.set.look(this.place).cast, ...this.set.cast(this.t, this.f), ...this.light, ...BAKED_LIGHT });
  }
  /** the look of the place set this frame (background, AO, bloom, grade): Film.tsx and the previews read it */
  look(): PlaceLook { return this.set.look(this.place ?? "room"); }
  /** a prop (props/index.ts): w.prop("plate").put(at, opts); key = another instance of it */
  prop(name: PropName, key?: string): Prop { return this.props.prop(name, key); }
  /** the lens's aspect: the film's 9:16, or the drawing buffer's own shape when a preview renders another shape (the
   *  4:3 / 3:4 covers): the same vertical field of view, nothing stretched. At 9:16 this is exactly W / H. */
  private aspect() {
    const b = this.gl.getDrawingBufferSize(this._buf), r = b.y > 0 ? b.x / b.y : W / H;
    return Math.abs(r - W / H) > 0.01 ? r : W / H;
  }
  private readonly _buf = new THREE.Vector2();
  setCamera(c: CamPose) {
    const cam = this.camera;
    cam.up.set(...(c.up ?? [0, 1, 0]));
    cam.position.copy(toV(c.pos));
    this._look.copy(toV(c.look));
    cam.lookAt(this._look); cam.rotateZ(c.roll ?? 0);
    cam.fov = c.fov; cam.near = c.near ?? 0.03; cam.far = c.far ?? 600; cam.aspect = this.aspect();
    cam.zoom = COVER_ZOOM;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
    if (COVER_SX || COVER_SY) {
      const e = cam.projectionMatrix.elements; e[8] -= 2 * COVER_SX; e[9] += 2 * COVER_SY;
      cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    }
  }
  project(p: V3Like): Projected {
    const v = this._v.copy(toV(p)), cam = this.camera;
    const z = -this._p.copy(v).applyMatrix4(cam.matrixWorldInverse).z;
    v.project(cam);
    const x = (v.x * 0.5 + 0.5) * W, y = (0.5 - v.y * 0.5) * H, front = z > cam.near;
    return { x, y, z, front, on: front && x >= 0 && x <= W && y >= 0 && y <= H };
  }
  /** solve every figure for the current camera and light. Call after setting the figures, before reading hands. */
  update() {
    if (!this.place) throw new Error(`[newton] f${this.f}: w.update() before w.setPlace(place): the figures' light is the place's`);
    this.applyPlaceLight();             // the params set since setPlace (the hour, the fire) move the figures' light
    for (const r of this.rigs.values()) {
      const st = r.state;
      r.group.userData.hmGround = st.visible === false ? 0 : st.seat ? (st.seat.floor ?? 0) : Math.max(0, st.at.y);
    }
    this.rc.update(this.camera, H); this.updated = true;
  }
  beginFrame(f: number) {
    this.f = f; this.t = f / FPS; this.updated = false;
    for (const r of this.rigs.values()) this.hide(r);
    this.place = null; this.light = {};   // (the set keeps showing the last place until the shot's setPlace: no flash)
    this.set.reset();                  // every set param back to its default
    this.props.begin();                // every prop hidden
  }
  endFrame(P: Pose) {
    if (!this.place) throw new Error(`[newton] f${this.f}: the shot did not call w.setPlace(place) (it must be the first call of every shot)`);
    this.setCamera(P.camera);
    this.set.setView(this.camera.position);
    this.set.setFocus(P.focus ?? [this._look.x, this._look.z]);
    this.set.animate(P.clock ?? this.t, this.f);
    if (!this.updated) this.update();
  }
  /** scene.background for this frame */
  bg() { return this.look().bg; }
}
/** helper for segments: screen point of a world point as {x, y} */
export const pt = (w: World, p: V3Like) => { const q = w.project(p); return { x: q.x, y: q.y }; };
