// The group-project film's World: both sets built ONCE, each in its own THREE.Scene with its own lights and env fill,
// one cast per set (the classroom keeps its 84-seat crowd, hidden by default), pools for figures and ropes so
// segments never leak objects into each other, projection to screen px. See story.ts for the segment contract.
// Engine-owned: segment builders read, never edit.
//
//   w.camera                 the film camera (apply poses with w.setCamera; the engine re-applies the pose's camera)
//   w.classroom / w.lab      Stage: { scene, set, A (anchors), M (mats), cast, actors, ropes, update(t) }
//     classroom: crowd (84 seated cards; DEFAULT state = all hidden), crowdSeats, seatOf(i), group (the four students)
//   w.project(p) -> { x, y, z, front, on }   world point -> 1080 x 1920 px (front = in front of the camera)
//   LOOK                     the film's people (you, the hard worker, two more teammates, the researcher, 1970s pullers)
import * as THREE from "three";
import { makeEnv, mats, type Mats } from "../bt/pbr";
import { NOINK } from "../vasa/ink";
import { classroom, CLASSROOM_FILL, type ClassroomSet, type ClassroomAnchors } from "./sets/classroom";
import { buildLab, LAB_FILL, LAB_CAST_LIGHT, type LabSet } from "./sets/lab";
import { Cast, Crowd, Figure, LIGHT_CLASS, YOU, RESEARCHER, classmate, lidAt, type CrowdSeat, type CrowdState } from "./kit/cast";
import type { Look } from "./kit/toon";
import { Rope, type RopeOpts } from "./kit/rope";
import { FPS, W, H, hash, type CamPose, type SceneId, type Pose, type V3Like } from "./story";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());
const now = () => (typeof performance !== "undefined" ? performance.now() : 0); // timing logs only, never pixels

// ===================================================================================================================
// people
// ===================================================================================================================
/** 1970s pullers: earthy tops, flared trousers in browns / navy, sideburn-era hair (kit haircuts only) */
const SEVENTIES = ["#c8642c", "#8a6a2e", "#3f6b8f", "#a8442f", "#6f7d3a", "#d1a33f"];
export const LOOK = {
  /** the protagonist (the kit's approved YOU look: blue hoodie, chest 你 tag) */
  you: YOU as Look,
  /** the one who does all the work: green sweater, glasses */
  worker: { ...classmate(42), top: "sweater", topCol: "#5d9b5a", trim: "#eef1e6", glasses: "round", glassCol: "#2a2430" } as Look,
  /** two more teammates who scroll their phones */
  mate1: { ...classmate(75), top: "hoodie", topCol: "#f08a3c", trim: "#fbe9d6" } as Look,
  mate2: { ...classmate(43), top: "jacket", topCol: "#d9a832", inner: "#f6f4ee" } as Look,
  /** the 1974 researcher (cardigan, glasses, bun; the lab coat is on the rack) */
  res: RESEARCHER as Look,
  /** six 1974 pullers (the same objects every call: a Look's identity keys its cached drawings); puller(0) is the one
   *  who gets blindfolded: switch fig.look to LOOK.puller0Blind (also a fixed object) */
  puller: (i: number): Look => PULLERS[i % PULLERS.length],
  puller0Blind: null as unknown as Look,
};
const PULLERS: Look[] = Array.from({ length: 6 }, (_, i) => ({ ...classmate(900 + i * 7), topCol: SEVENTIES[i % SEVENTIES.length] } as Look));
LOOK.puller0Blind = { ...PULLERS[0], blindfold: "#2b2d3a" } as Look;

// ===================================================================================================================
// pools
// ===================================================================================================================
export class ActorPool {
  private free: Figure[] = []; private used = new Set<Figure>();
  constructor(private cast: Cast) {}
  /** a Figure with this look, visible, idle until you set() it (set its full state every frame) */
  acquire(look: Look): Figure {
    let f = this.free.pop();
    if (f) f.look = look; else f = this.cast.add(look);
    f.set({ pose: { kind: "idle" }, visible: true });
    this.used.add(f);
    return f;
  }
  release(f: Figure) {
    if (!this.used.delete(f)) return;
    f.set({ pose: { kind: "idle" }, visible: false }); f.mesh.visible = false; f.blob.visible = false;
    this.free.push(f);
  }
  releaseAll() { for (const f of [...this.used]) this.release(f); }
}
export type RopeReq = Pick<RopeOpts, "score" | "radius" | "gold" | "seed" | "ink" | "castShadow" | "outlinePx">;
export class RopePool {
  private free: Rope[] = []; private used = new Set<Rope>();
  constructor(private M: Mats, private parent: THREE.Object3D) {}
  private key(o: RopeReq) { return `${o.ink ?? "hull"}|${o.castShadow ?? true}|${o.outlinePx ?? 2.4}`; }
  /** a kit Rope (already in this set's scene, visible). Call rope.update(pose) every frame. */
  acquire(o: RopeReq = {}): Rope {
    const k = this.key(o), i = this.free.findIndex((r) => r.mesh.userData.poolKey === k);
    let r: Rope;
    if (i >= 0) {
      r = this.free.splice(i, 1)[0];
      if (o.radius !== undefined) r.setRadius(o.radius); else r.setScore(o.score ?? 4);
      r.seed = o.seed ?? 1; r.setGold(o.gold ?? 1, 0);
    } else {
      r = new Rope(this.M, { score: o.score, radius: o.radius, gold: o.gold, seed: o.seed, ink: o.ink, castShadow: o.castShadow, outlinePx: o.outlinePx });
      r.mesh.userData.poolKey = k; this.parent.add(r.mesh);
    }
    r.update({ a: V(0, -40, 0), b: V(0, -40, 0.02) });
    r.mesh.visible = true; this.used.add(r);
    return r;
  }
  release(r: Rope) { if (!this.used.delete(r)) return; r.mesh.visible = false; this.free.push(r); }
  releaseAll() { for (const r of [...this.used]) this.release(r); }
}

// ===================================================================================================================
// stages
// ===================================================================================================================
abstract class Stage {
  readonly scene = new THREE.Scene();
  readonly people = new THREE.Group();
  readonly cast: Cast; readonly actors: ActorPool; readonly ropes: RopePool;
  updated = false;
  constructor(protected w: World, readonly M: Mats, light: typeof LIGHT_CLASS) {
    this.people.name = "people"; this.scene.add(this.people);
    this.cast = new Cast(this.people, { renderHeight: H, light });
    this.actors = new ActorPool(this.cast);
    this.ropes = new RopePool(M, this.scene);
  }
  /** solve every card of this set for the current camera (cast.update). Call after setting the figures, before
   *  reading hands. t = seconds (idle breathing etc.), default the frame time */
  update(t = this.w.t) { this.cast.update(this.w.camera, t); this.updated = true; }
  abstract reset(): void;
}

/** the crowd's default: nobody (an after-class room). Segments may show a few background students. */
export const EMPTY_CROWD = (): CrowdState => ({ pose: { kind: "desk", t: 0 }, visible: false });
/** a quiet background student at their desk */
export const BG_STUDENT = (i: number, t: number): CrowdState => ({ pose: { kind: hash(i, 4) < 0.5 ? "write" : "desk", t: t + hash(i, 3) * 3 }, expr: "neutral", blink: lidAt(t, i), visible: true });

export class ClassStage extends Stage {
  readonly set: ClassroomSet; readonly A: ClassroomAnchors;
  readonly crowd: Crowd; readonly crowdSeats: CrowdSeat[];
  constructor(w: World, gl: THREE.WebGLRenderer) {
    super(w, mats(makeEnv(gl), makeEnv(gl, CLASSROOM_FILL)), LIGHT_CLASS);
    this.scene.name = "classroom";
    this.set = classroom(this.M, { noCards: true });
    this.scene.add(this.set.group, ...this.set.lights);
    const A = (this.A = this.set.anchors);
    this.crowdSeats = A.seats.map((s, i) => {
      const card = A.cards[i];
      const edge = Math.max(0.12, (s.pos.z - card.pos.z) * Math.cos(s.facing) + (s.pos.x - card.pos.x) * Math.sin(s.facing) - 0.175);
      return { top: s.pos, facing: s.facing + Math.PI, back: 0, deskEdge: edge, deskTop: 0.75 };
    });
    const looks = A.seats.map((_, i) => classmate(i));
    this.crowd = this.cast.crowd(this.crowdSeats, looks, { near: 3.2 });
    this.crowd.state = EMPTY_CROWD;
  }
  /** pass to Figure.set({ ...seatOf(i) }) so a full Figure sits exactly in seat i */
  seatOf(i: number) { const s = this.crowdSeats[i]; return { seat: { top: s.top, back: s.back, deskEdge: s.deskEdge, deskTop: s.deskTop }, facing: s.facing }; }
  reset() {
    const s = this.set;
    s.setCeilingOpen(0); s.setWindowOpen(0); s.setShaft(0); s.animate(0);
    s.objects.heroSheet.visible = false; s.objects.heroPen.visible = false;
    this.crowd.state = EMPTY_CROWD; this.cast.light = LIGHT_CLASS;
    this.actors.releaseAll(); this.ropes.releaseAll();
  }
}

export class LabStage extends Stage {
  readonly set: LabSet; readonly A: LabSet["anchors"];
  constructor(w: World, gl: THREE.WebGLRenderer) {
    super(w, mats(makeEnv(gl), makeEnv(gl, LAB_FILL)), LAB_CAST_LIGHT as never);
    this.scene.name = "lab";
    this.set = buildLab(this.M);
    this.scene.add(this.set.group, ...this.set.lights);
    this.A = this.set.anchors;
  }
  reset() {
    this.set.setDial(0); this.set.animate(0); this.set.setLight({ sun: 1, lamp: 1 });
    this.cast.light = LAB_CAST_LIGHT as never;
    this.actors.releaseAll(); this.ropes.releaseAll();
  }
}

// ===================================================================================================================
// the world
// ===================================================================================================================
export type Projected = { x: number; y: number; z: number; front: boolean; on: boolean };
export class World {
  readonly root = new THREE.Group();
  readonly classroom: ClassStage; readonly lab: LabStage;
  f = 0; t = 0;
  scene: SceneId = "classroom";
  private _v = V(); private _p = V();
  constructor(readonly gl: THREE.WebGLRenderer, readonly camera: THREE.PerspectiveCamera) {
    const t0 = now();
    this.root.name = "group-world";
    camera.layers.enable(NOINK);
    this.classroom = new ClassStage(this, gl);
    const t1 = now();
    this.lab = new LabStage(this, gl);
    this.root.add(this.classroom.scene, this.lab.scene);
    this.reset();
    console.log(`[group] world built in ${Math.round(now() - t0)} ms (classroom ${Math.round(t1 - t0)}, lab ${Math.round(now() - t1)})`);
  }
  setCamera(c: CamPose) {
    const cam = this.camera;
    cam.up.set(...(c.up ?? [0, 1, 0]));
    cam.position.copy(toV(c.pos));
    cam.lookAt(toV(c.look)); cam.rotateZ(c.roll ?? 0);
    cam.fov = c.fov; cam.near = c.near ?? 0.03; cam.far = c.far ?? 600; cam.aspect = W / H;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  }
  project(p: V3Like): Projected {
    const v = this._v.copy(toV(p)), cam = this.camera;
    const z = -this._p.copy(v).applyMatrix4(cam.matrixWorldInverse).z;
    v.project(cam);
    const x = (v.x * 0.5 + 0.5) * W, y = (0.5 - v.y * 0.5) * H, front = z > cam.near;
    return { x, y, z, front, on: front && x >= 0 && x <= W && y >= 0 && y <= H };
  }
  show(id: SceneId) {
    this.scene = id;
    this.classroom.scene.visible = id === "classroom";
    this.lab.scene.visible = id === "lab";
  }
  reset() { this.classroom.reset(); this.lab.reset(); }
  beginFrame(f: number) { this.f = f; this.t = f / FPS; this.classroom.updated = false; this.lab.updated = false; }
  endFrame(P: Pose) {
    this.show(P.scene);
    this.setCamera(P.camera);
    const st = P.scene === "classroom" ? this.classroom : P.scene === "lab" ? this.lab : null;
    if (st && !st.updated) st.update();
  }
}
/** helper for segments: screen point of a world point as {x, y} */
export const pt = (w: World, p: V3Like) => { const q = w.project(p); return { x: q.x, y: q.y }; };
