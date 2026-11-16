// The Arthur film's World: the one set (field | yard | house, sets/yard.ts), the stone with the anvil and THE sword
// (props.ts) and the cast of rig figures (people.ts), built ONCE per page. See story.ts for the segment contract.
// Engine-owned: segment builders read, never edit.
//
//   w.camera            the film camera (apply poses with w.setCamera; the engine re-applies the pose's camera)
//   w.set               YardSet: anchors, colliders (setSeason / setFocus / animate are the engine's: give season and
//                       focus in the Pose)
//   w.stone             StoneRig: setStuck(k, wobble) / setFree(grip, up, face) / grip(k) / tip() / setGlow / setShine /
//                       colliders. beginFrame puts the sword back in the anvil (setStuck(0)) with no glow and no shine.
//   w.liftStone(y | null)   the stone + anvil + sword y metres up in the air, or gone (null); beginFrame puts it back
//   w.actor(person, key?)   the rig figure of a Person (people.ts PEOPLE.arthur, PEOPLE.lord(3), ...): created on first
//                       use, then the same figure every time; `key` gives a second figure of the same Person.
//                       beginFrame hides every figure: set({ ..., visible: true }) the ones in your shot, every frame.
//   w.update()          solves every figure for the current camera (after setting them; before reading hands)
//   w.project(p) -> { x, y, z, front, on }   world point -> 1080 x 1920 px (front = in front of the camera)
//   w.f, w.t            the frame and its time in seconds
import * as THREE from "three";
import { makeEnv, mats, type Mats } from "../bt/pbr";
import { NOINK } from "../vasa/ink";
import { RigCast, type Rig, type RigState } from "../group/kit/rig3d";
import { buildYard, YARD_FILL, YARD_CAST_LIGHT, type YardSet } from "./sets/yard";
import { buildStone, type StoneRig } from "./props";
import { addPerson, type Person } from "./people";
import { FPS, W, H, type CamPose, type Pose, type Season, type V3Like } from "./story";
import { getInputProps } from "remotion";
// Cover stills only (debug input props, all default to the film's own framing): zoom < 1 shows more around the same
// frame; sx / sy move the picture right / down by that fraction of the frame (a lens shift, the perspective stays).
const COVER = getInputProps() as { zoom?: number; sx?: number; sy?: number; ov?: number };
const COVER_ZOOM = Number(COVER.zoom ?? 1) || 1, COVER_SX = Number(COVER.sx ?? 0) || 0, COVER_SY = Number(COVER.sy ?? 0) || 0;
/** Cover stills only: the size of the icons drawn over the picture (the crown and the "?" of the hook), which are set in
 *  screen px and so do not shrink with zoom. 1 = the film. */
export const COVER_OV = Number(COVER.ov ?? 1) || 1;

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());
const now = () => (typeof performance !== "undefined" ? performance.now() : 0); // timing logs only, never pixels

export type Projected = { x: number; y: number; z: number; front: boolean; on: boolean };
export class World {
  readonly root = new THREE.Group();
  readonly M: Mats;
  readonly set: YardSet;
  readonly stone: StoneRig;
  readonly rc: RigCast;
  f = 0; t = 0;
  season: Season = 0;
  updated = false;
  private rigs = new Map<string, Rig>();
  private ids = new Map<Person, number>();
  private _v = V(); private _p = V(); private _look = V();
  constructor(readonly gl: THREE.WebGLRenderer, readonly camera: THREE.PerspectiveCamera) {
    const t0 = now();
    this.root.name = "arthur-world";
    camera.layers.enable(NOINK);
    this.M = mats(makeEnv(gl), makeEnv(gl, YARD_FILL));
    this.set = buildYard(this.M);
    this.root.add(this.set.group, ...this.set.lights);
    const t1 = now();
    this.stone = buildStone(this.M);
    this.root.add(this.stone.group, this.stone.sword);
    const people = new THREE.Group(); people.name = "people"; this.root.add(people);
    this.rc = new RigCast(people, { light: YARD_CAST_LIGHT as never });
    this.set.setSeason(0); this.stone.setSeason(0);
    console.log(`[arthur] world built in ${Math.round(now() - t0)} ms (set ${Math.round(t1 - t0)})`);
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
  setCamera(c: CamPose) {
    const cam = this.camera;
    cam.up.set(...(c.up ?? [0, 1, 0]));
    cam.position.copy(toV(c.pos));
    this._look.copy(toV(c.look));
    cam.lookAt(this._look); cam.rotateZ(c.roll ?? 0);
    cam.fov = c.fov; cam.near = c.near ?? 0.03; cam.far = c.far ?? 600; cam.aspect = W / H;
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
  /** solve every figure for the current camera. Call after setting the figures, before reading hands. */
  update() { this.rc.update(this.camera, H); this.updated = true; }
  beginFrame(f: number) {
    this.f = f; this.t = f / FPS; this.updated = false;
    for (const r of this.rigs.values()) this.hide(r);
    this.liftStone(0); this.stone.setGlow(0); this.stone.setShine(0);
  }
  /** the stone with its anvil and the sword `y` metres above its place (the "one day it was simply there" drop), or
   *  gone altogether (null). beginFrame puts it back every frame. Call it before any setStuck / grip. */
  liftStone(y: number | null) {
    const g = this.stone.group;
    g.visible = this.stone.sword.visible = y !== null;
    g.position.set(0, y ?? 0, 0); g.updateMatrixWorld(true);
    this.stone.setStuck(0, 0);
  }
  endFrame(P: Pose) {
    const season = P.season ?? 0;
    if (season !== this.season) { this.season = season; this.set.setSeason(season); this.stone.setSeason(season); }
    this.setCamera(P.camera);
    const fx = P.focus ?? [this._look.x, this._look.z];
    this.set.setFocus(fx[0], fx[1]);
    this.set.animate(this.t);
    if (!this.updated) this.update();
  }
  /** scene.background for the current season */
  bg() { return this.set.bg(this.season); }
}
/** helper for segments: screen point of a world point as {x, y} */
export const pt = (w: World, p: V3Like) => { const q = w.project(p); return { x: q.x, y: q.y }; };
