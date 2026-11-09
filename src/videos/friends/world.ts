// The film's World: both sets built ONCE, each in its own THREE.Scene with its own lights and env fill, the casts
// (one per set, the classroom with its 84-seat crowd), pools for figures / ropes / ghost holders so segments never leak
// objects into each other, the 775-rope web (built lazily, once per key, for a FIXED camera), the storyboard's named
// places re-fitted to the real anchors, the storyboard's dorm cameras, projection to screen px and the 你 tag overlay.
// See story.ts for the segment contract. Engine-owned: segment builders read, never edit.
//
//   w.camera                    the film camera (apply poses with w.setCamera; the engine re-applies the pose's camera)
//   w.classroom / w.dorm        Stage: { scene, set, A (anchors), M (mats), cast, actors, ropes, update(t) } plus
//     classroom: crowd (84 seated cards), crowdSeats, looks, roles (re-fitted seats / places), ghosts, web(key, cam)
//     dorm:      marks (you0, bed1, ladderFoot1, ladderKnot, ladderPost), cams (storyboard dorm cameras)
//   w.project(p) -> { x, y, z, front, on }   world point -> 1080 x 1920 px (front = in front of the camera)
//   youTag(w, fig, { f, at, out })            the gold 你 tag 0.30 m above a figure's head (2D overlay element)
//   LOOK                                      the film's people (YOU, friends F1-F10, RES, BUDDY, ZHOU, C1, C2, STAR ...)
import React from "react";
import * as THREE from "three";
import { makeEnv, mats, type Mats } from "../bt/pbr";
import { NOINK } from "../vasa/ink";
import { classroom, CLASSROOM_FILL, type ClassroomSet, type ClassroomAnchors } from "./sets/classroom";
import { buildDorm, DORM_FILL, type DormSet, type DormAnchors } from "./sets/dorm";
import { Cast, Crowd, Figure, LIGHT_CLASS, LIGHT_DORM, YOU, ROOMMATE, RESEARCHER, classmate, friend, lidAt, type CrowdSeat, type CrowdState } from "./kit/cast";
import type { Look, Expr } from "./kit/toon";
import { Rope, GhostHolder, RopeWeb, classroomSeats, generateClassNetwork, ropeRadius, type RopeOpts } from "./kit/rope";
import { FONT_STACK, COL } from "./kit/overlay";
import { FPS, W, H, hash, pop, lin, easeInCubic, type CamPose, type SceneId, type Pose, type Vec3, type V3Like } from "./story";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const toV = (p: V3Like) => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());
const now = () => (typeof performance !== "undefined" ? performance.now() : 0); // timing logs only, never pixels

// ===================================================================================================================
// people
// ===================================================================================================================
/** the film's looks. YOU is the cast kit's approved protagonist (blue hoodie, chest 你 tag); the storyboard's table asks
 *  for a teal hoodie (#2F8F8A): one place to change it if the director confirms. */
export const LOOK = {
  you: YOU,
  /** F1-F10 (storyboard 0.4): the kit's six named friends + four seeded ones, all different tops */
  friends: Array.from({ length: 10 }, (_, i) => friend(i)) as Look[],
  res: RESEARCHER,
  /** BUDDY (搭子): red sports tee, white headband, neon running shoes */
  buddy: { ...ROOMMATE, topCol: "#e04a3c", headband: "#f4f2ec", shoes: "#b8f03c", shoeSole: "#f4f2ec" } as Look,
  r2: classmate(611), r3: classmate(623),
  /** 老周: grey hoodie, glasses */
  zhou: { ...classmate(707), top: "hoodie", topCol: "#8e9299", trim: "#e9e9ea", glasses: "round", glassCol: "#2a2430" } as Look,
  /** C1 holds your thick rope Y5: green sweater */
  c1: { ...classmate(42), top: "sweater", topCol: "#5d9b5a", trim: "#eef1e6" } as Look,
  /** C2 threw you G2: orange hoodie */
  c2: { ...classmate(75), top: "hoodie", topCol: "#f08a3c", trim: "#fbe9d6" } as Look,
  /** STAR: mustard blazer */
  star: { ...classmate(43), top: "jacket", topCol: "#d9a832", inner: "#f6f4ee" } as Look,
};

// ===================================================================================================================
// pools: segments acquire in enter(), release in exit(); the engine releases everything between segments
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
  get inUse() { return this.used.size; }
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
    // collapse any geometry left from a previous user until the segment's first update
    r.update({ a: V(0, -40, 0), b: V(0, -40, 0.02) });
    r.mesh.visible = true; this.used.add(r);
    return r;
  }
  release(r: Rope) { if (!this.used.delete(r)) return; r.mesh.visible = false; this.free.push(r); }
  releaseAll() { for (const r of [...this.used]) this.release(r); }
  get inUse() { return this.used.size; }
}
export class GhostPool {
  private free: GhostHolder[] = []; private used = new Set<GhostHolder>();
  constructor(private parent: THREE.Object3D) {}
  /** a dotted ghost holder (kit/rope GhostHolder); ghost.update({feet, camera, toward, pop}) every frame */
  acquire(): GhostHolder { const g = this.free.pop() ?? new GhostHolder(this.parent); this.used.add(g); return g; }
  release(g: GhostHolder) { if (!this.used.delete(g)) return; g.mesh.visible = false; this.free.push(g); }
  releaseAll() { for (const g of [...this.used]) this.release(g); }
}

// ===================================================================================================================
// stages
// ===================================================================================================================
abstract class Stage {
  readonly scene = new THREE.Scene();
  /** cards, blobs and fx of this set's cast live here */
  readonly people = new THREE.Group();
  readonly cast: Cast; readonly actors: ActorPool; readonly ropes: RopePool;
  /** cast.update was called this frame (engine safety net) */
  updated = false;
  constructor(protected w: World, readonly M: Mats, light: typeof LIGHT_DORM) {
    this.people.name = "people"; this.scene.add(this.people);
    this.cast = new Cast(this.people, { renderHeight: H, light });
    this.actors = new ActorPool(this.cast);
    this.ropes = new RopePool(M, this.scene);
  }
  /** solve every card of this set for the current camera (cast.update). Call after setting the figures, before
   *  reading hands. t = seconds (crowd breathing / writing), default the frame time */
  update(t = this.w.t) { this.cast.update(this.w.camera, t); this.updated = true; }
  abstract reset(): void;
}

/** the storyboard's classroom names re-fitted to the 84-seat room (sets/classroom v2). Relations kept:
 *  - you 41: the set's protagonist seat (row 3 of 0-6, centre block, inner window-side seat; neighbours 40 / 42).
 *  - c1 42: same row, directly to your RIGHT (the adjacent desk of your block, 0.68 m); turns sideways to face you and
 *    holds Y5. (In the storyboard C1 sat 1.4 m to your right across an aisle; seat 43 is 1.3 m away but Y5 would then
 *    cross seat 42's head, so C1 takes 42.)
 *  - star 43: beside C1, further right, in the frame of the slide along Y5; empty from f888 (STAR on the platform).
 *  - c2 75: three rows behind you (row 6), across the window-side aisle (x -1.98), the seat on that aisle (as in the
 *    storyboard: you and C2 on opposite sides of the same aisle, C2 three rows back); G2 runs along that aisle floor.
 *  - no empty seat: the room has exactly 84 seats for the 84 participants (you + C1 + C2 + STAR + 80). The storyboard's
 *    empty window seat existed only so Y3 could pass over it; the radiator rope now runs level behind row 3's chair
 *    backs to the exposed riser (A.radiatorRoute: hand behind your left shoulder -> knot), raycast-checked by the set.
 *  - RAD_TIE = A.radiatorTie (riser at y 1.0); PLATFORM / STAR_FEET = A.platform (on the dais in window 0's sun);
 *    WIN_EXIT = window 0 (set.setWindowOpen, opening A.windowOut); the aisle = A.aisleX[0] (x -1.98; RES's path
 *    A.researcherPath runs down it); the lecturer spot A.lecturer. */
export type ClassRoles = {
  you: number; deskmate: number; c1: number; star: number; c2: number;
  radiatorTie: THREE.Vector3; y3Route: THREE.Vector3[]; starFeet: THREE.Vector3; aisleX: number; resPath: THREE.Vector3[];
  /** floor point under a seat's hip (the storyboard's seat points are floor points) */
  floor: (i: number) => THREE.Vector3;
};
export type WebKit = {
  web: RopeWeb; net: ReturnType<typeof generateClassNetwork>; seats: ReturnType<typeof classroomSeats>;
  /** solved arm aims per seat [arm0, arm1] (degrees on the card) for the web's camera */
  aims: number[][];
  /** the crowd pose that puts the drawn hands on the web's rope ends: crowd.state = holdState */
  holdState: (i: number, t: number) => CrowdState;
};
const EXPRS: Expr[] = ["neutral", "smile", "neutral", "deadpan", "happy", "neutral"];
/** default crowd: everyone seated at their desk, small idle variation */
export const DEFAULT_CROWD = (i: number, t: number): CrowdState => ({
  pose: { kind: "desk", t: t + hash(i, 3) * 3 }, expr: EXPRS[Math.floor(hash(i, 2) * EXPRS.length)], blink: lidAt(t, i),
});

export class ClassStage extends Stage {
  readonly set: ClassroomSet; readonly A: ClassroomAnchors;
  readonly crowd: Crowd; readonly crowdSeats: CrowdSeat[]; readonly looks: Look[];
  readonly roles: ClassRoles; readonly ghosts: GhostPool;
  private webs = new Map<string, WebKit>();
  constructor(w: World, gl: THREE.WebGLRenderer) {
    super(w, mats(makeEnv(gl), makeEnv(gl, CLASSROOM_FILL)), LIGHT_CLASS);
    this.scene.name = "classroom";
    this.set = classroom(this.M);
    this.scene.add(this.set.group, ...this.set.lights);
    const A = (this.A = this.set.anchors);
    this.roles = {
      you: A.you.i, deskmate: A.you.neighbours[0], c1: A.you.neighbours[1], star: A.you.neighbours[1] + 1, c2: 6 * 12 + 1 * 2 + 1,
      radiatorTie: A.radiatorTie.clone(), y3Route: A.radiatorRoute.map((p) => p.clone()), starFeet: A.platform.clone(), aisleX: A.aisleX[0],
      resPath: A.researcherPath.map((p) => p.clone()),
      floor: (i) => V(A.seats[i].pos.x, 0, A.seats[i].pos.z),
    };
    // seat anchors -> crowd seats (the set's facing is the yaw of -z; the cast's is of +z), as preview/cast_classcommon
    this.crowdSeats = A.seats.map((s, i) => {
      const card = A.cards[i];
      const edge = Math.max(0.12, (s.pos.z - card.pos.z) * Math.cos(s.facing) + (s.pos.x - card.pos.x) * Math.sin(s.facing) - 0.175);
      return { top: s.pos, facing: s.facing + Math.PI, back: 0, deskEdge: edge, deskTop: 0.75 };
    });
    const R = this.roles;
    this.looks = A.seats.map((_, i) => (i === R.you ? LOOK.you : i === R.c1 ? LOOK.c1 : i === R.c2 ? LOOK.c2 : i === R.star ? LOOK.star : classmate(i)));
    this.crowd = this.cast.crowd(this.crowdSeats, this.looks, { near: 3.2 });
    this.crowd.state = DEFAULT_CROWD;
    this.ghosts = new GhostPool(this.people);
  }
  /** the cast-seat for seat i (pass to Figure.set({ seat: ..., facing })) so a full Figure sits exactly where the crowd card sits */
  seatOf(i: number) { const s = this.crowdSeats[i]; return { seat: { top: s.top, back: s.back, deskEdge: s.deskEdge, deskTop: s.deskTop }, facing: s.facing }; }
  /** the 775-rope web, built once per key with the crowd's hands solved for the FIXED camera pose `cam` (pass a
   *  constant, e.g. the S09 TOP pose, never the per-frame camera: the build must not depend on which frame came first).
   *  Hidden until you set web.mesh.visible. Costs ~0.5-1.5 s the first time. */
  web(key: string, cam: CamPose, o: { seed?: number; aim0?: number; radius?: (score: number) => number } = {}): WebKit {
    const hit = this.webs.get(key); if (hit) return hit;
    const t0 = now(), w = this.w, A = this.A, crowd = this.crowd;
    const prevState = crowd.state, prevCam = w.snapshotCamera();
    w.setCamera(cam);
    // per-person arm aims solved so each drawn hand lands midway between heads (0.32 m from the own head in plan):
    // copied from preview/rope_g_common.ts (start aim 116, 4 passes)
    const AIM0 = o.aim0 ?? 116;
    const aims = A.seats.map((_, i) => [AIM0 + 4 * hash(i, 5), 180 - AIM0 - 4 * hash(i, 6)]);
    const holdState = (i: number, t: number): CrowdState => ({
      pose: { kind: "hold", t: t + hash(i, 3) * 3, aim: [{ dir: aims[i][0] }, { dir: aims[i][1] }], base: "seat" },
      expr: (["neutral", "smile", "happy", "deadpan"] as Expr[])[Math.floor(hash(i, 2) * 4)], blink: lidAt(t, i),
    });
    crowd.state = holdState;
    for (let it = 0; it < 4; it++) {
      this.cast.update(w.camera, 1.0);
      A.seats.forEach((s, i) => { for (const arm of [0, 1] as const) {
        const hp = crowd.handWorld(i, arm), off = Math.hypot(hp.x - s.pos.x, hp.z - s.pos.z), d = aims[i][arm];
        const sn = Math.max(0.3, Math.abs(Math.sin((d * Math.PI) / 180))), step = (((off - 0.32) / (0.37 * sn)) * 180) / Math.PI;
        aims[i][arm] = arm === 0 ? Math.min(165, Math.max(92, d - step)) : Math.min(88, Math.max(15, d + step));
      } });
    }
    this.cast.update(w.camera, 1.0);
    const seats = classroomSeats(A, { hands: (i) => [crowd.handWorld(i, 0), crowd.handWorld(i, 1)] });
    const net = generateClassNetwork(seats.seats, o.seed ?? 2016);
    const web = new RopeWeb(this.M, seats.seats, net.ties, { route: seats.route, radius: o.radius ?? ((s) => ropeRadius(s) * 0.95) });
    web.mesh.visible = false; this.scene.add(web.mesh);
    crowd.state = prevState; w.setCamera(prevCam);
    const kit: WebKit = { web, net, seats, aims, holdState };
    this.webs.set(key, kit);
    console.log(`[friends] web "${key}" built in ${Math.round(now() - t0)} ms: ${JSON.stringify(net.stats)}`);
    return kit;
  }
  reset() {
    const s = this.set;
    s.setCeilingOpen(0); s.setWindowOpen(0); s.setShaft(0); s.animate(0);
    s.objects.heroSheet.visible = true; s.objects.heroPen.visible = true;
    this.crowd.state = DEFAULT_CROWD; this.cast.light = LIGHT_CLASS;
    this.actors.releaseAll(); this.ropes.releaseAll(); this.ghosts.releaseAll();
    for (const k of this.webs.values()) k.web.mesh.visible = false;
  }
}

/** the storyboard's dorm marks (0.5): its dorm numbers were computed from the current dorm build */
export type DormMarks = {
  /** where YOU stand in S01 (one step from the knot post), facing -z */
  you0: THREE.Vector3;
  /** your bunk's mattress point under the hip (= A.youBunk.top) */
  bed1: THREE.Vector3;
  /** floor at the foot of your ladder (= the set's ladderL1 perch) */
  ladderFoot1: THREE.Vector3;
  /** the line-02 knot point on your ladder's stile, and the stile itself (post axis, radius, free span) */
  ladderKnot: THREE.Vector3; ladderPost: DormAnchors["ladderPost"];
};
/** the storyboard's dorm cameras (0.5) verbatim. Its framing notes assumed taller figures: with the cast's 1.45 m
 *  cards, heads land lower on screen than the storyboard says (D_TIGHT / D_WIDE1 put YOUR head in the caption band):
 *  projection-check and re-fit (segA does for S01). roll in radians (camera.rotateZ). */
export const DORM_CAMS: Record<string, CamPose> = {
  D_TIGHT: { pos: [-0.3, 2.0, 1.6], look: [-0.3, 0.3, -1.2], fov: 68, roll: (10 * Math.PI) / 180 },
  D_WIDE1: { pos: [-0.2, 2.2, 2.85], look: [-0.08, 0.5, -1.8], fov: 66 },
  REV_LOCK: { pos: [-0.05, 1.6, -2.55], look: [-0.75, 1.25, 2.9], fov: 62 },
  DESK_OTS: { pos: [-0.45, 1.5, 1.45], look: [-1.33, 0.8, 0.65], fov: 48 },
  DESK_SIDE: { pos: [-0.4, 1.7, 2.6], look: [-1.4, 0.0, -3.0], fov: 62 },
  MORNING_MED: { pos: [-0.4, 1.6, -1.0], look: [-1.2, 1.2, 2.5], fov: 62 },
  LOW_ROPE: { pos: [0.6, 0.4, -0.8], look: [-0.8, 1.6, 1.8], fov: 78 },
};

export class DormStage extends Stage {
  readonly set: DormSet; readonly A: DormAnchors; readonly marks: DormMarks;
  readonly cams = DORM_CAMS;
  private phoneMap: THREE.Texture | null; private laptopMap: THREE.Texture | null;
  constructor(w: World, gl: THREE.WebGLRenderer) {
    super(w, mats(makeEnv(gl), makeEnv(gl, DORM_FILL)), LIGHT_DORM);
    this.scene.name = "dorm";
    this.set = buildDorm(this.M, { renderer: gl });
    this.scene.add(this.set.group);
    const A = (this.A = this.set.anchors);
    const lf = A.perches.find((p) => p.name === "ladderL1");
    this.marks = {
      you0: V(-0.3, 0, 0.8), bed1: A.youBunk.top.clone(), ladderFoot1: lf ? lf.pos.clone() : V(-0.5, 0, 1.75),
      ladderKnot: A.ladderKnot.clone(), ladderPost: A.ladderPost,
    };
    this.phoneMap = (this.set.phone.screen.material as THREE.MeshBasicMaterial).map;
    this.laptopMap = (this.set.laptopScreen.material as THREE.MeshBasicMaterial).map;
  }
  /** a perch by name (A.perches) */
  perch(name: string) { const p = this.A.perches.find((q) => q.name === name); if (!p) throw new Error(`no dorm perch ${name}`); return p; }
  reset() {
    const D = this.set;
    D.setLight("evening"); D.setWindowOpen(0.385); D.setDoorOpen(0); D.setFrenchDoorOpen(0); D.setFriend({ lit: 1, figure: true });
    D.phone.group.position.copy(D.phone.rest.pos); D.phone.group.quaternion.copy(D.phone.rest.quat);
    (D.phone.screen.material as THREE.MeshBasicMaterial).map = this.phoneMap;
    (D.laptopScreen.material as THREE.MeshBasicMaterial).map = this.laptopMap;
    D.animate(0);
    this.cast.light = LIGHT_DORM;
    this.actors.releaseAll(); this.ropes.releaseAll();
  }
}

// ===================================================================================================================
// the world
// ===================================================================================================================
export type Projected = { x: number; y: number; z: number; front: boolean; on: boolean };
export class World {
  readonly root = new THREE.Group();
  readonly classroom: ClassStage; readonly dorm: DormStage;
  /** current frame and seconds (set by the engine before pose) */
  f = 0; t = 0;
  scene: SceneId = "dorm";
  readonly stats: { classroomMs: number; dormMs: number; totalMs: number; tris: number };
  private _v = V(); private _p = V();
  constructor(readonly gl: THREE.WebGLRenderer, readonly camera: THREE.PerspectiveCamera) {
    const t0 = now();
    this.root.name = "friends-world";
    camera.layers.enable(NOINK);
    this.classroom = new ClassStage(this, gl);
    const t1 = now();
    this.dorm = new DormStage(this, gl);
    const t2 = now();
    this.root.add(this.classroom.scene, this.dorm.scene);
    this.reset();
    this.stats = { classroomMs: Math.round(t1 - t0), dormMs: Math.round(t2 - t1), totalMs: Math.round(now() - t0), tris: this.classroom.set.tris + this.dorm.set.tris };
    console.log(`[friends] world built in ${this.stats.totalMs} ms (classroom ${this.stats.classroomMs}, dorm ${this.stats.dormMs}), ${this.stats.tris} tris`);
  }
  /** apply a camera pose to the film camera (do this FIRST in pose: cards and hands depend on it) */
  setCamera(c: CamPose) {
    const cam = this.camera;
    cam.up.set(...(c.up ?? [0, 1, 0]));
    cam.position.copy(toV(c.pos));
    const q = (c as { _q?: THREE.Quaternion })._q; // exact orientation from snapshotCamera (keeps roll)
    if (q) cam.quaternion.copy(q); else { cam.lookAt(toV(c.look)); cam.rotateZ(c.roll ?? 0); }
    cam.fov = c.fov; cam.near = c.near ?? 0.03; cam.far = c.far ?? 600; cam.aspect = W / H;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  }
  /** the current camera as a pose (to restore after a temporary change) */
  snapshotCamera(): CamPose {
    const cam = this.camera, dir = cam.getWorldDirection(V()), look = cam.position.clone().add(dir);
    const roll = 0; // lookAt + up reproduces everything but roll; keep the quaternion exactly instead
    const q = cam.quaternion.clone();
    const pose: CamPose & { _q?: THREE.Quaternion } = { pos: cam.position.clone(), look, fov: cam.fov, roll, near: cam.near, far: cam.far, up: [cam.up.x, cam.up.y, cam.up.z] };
    pose._q = q;
    return pose;
  }
  /** world point -> screen px on the 1080 x 1920 frame; front = in front of the camera; on = inside the frame */
  project(p: V3Like): Projected {
    const v = this._v.copy(toV(p)), cam = this.camera;
    const z = -this._p.copy(v).applyMatrix4(cam.matrixWorldInverse).z;
    v.project(cam);
    const x = (v.x * 0.5 + 0.5) * W, y = (0.5 - v.y * 0.5) * H, front = z > cam.near;
    return { x, y, z, front, on: front && x >= 0 && x <= W && y >= 0 && y <= H };
  }
  /** engine: show one set (or none for "sky" / "phone2d") */
  show(id: SceneId) {
    this.scene = id;
    this.classroom.scene.visible = id === "classroom";
    this.dorm.scene.visible = id === "dorm";
  }
  /** engine: both sets back to their default state, every pool released (between segments) */
  reset() { this.classroom.reset(); this.dorm.reset(); }
  /** engine: before pose */
  beginFrame(f: number) { this.f = f; this.t = f / FPS; this.classroom.updated = false; this.dorm.updated = false; }
  /** engine: after pose */
  endFrame(P: Pose) {
    this.show(P.scene);
    this.setCamera(P.camera);
    const st = P.scene === "classroom" ? this.classroom : P.scene === "dorm" ? this.dorm : null;
    if (st && !st.updated) st.update();
  }
}

// ===================================================================================================================
// the 你 tag (storyboard: gold, 0.30 m above YOUR head, tag style 44 px; pops in, exits with a fade + 20 px rise)
// ===================================================================================================================
const hEl = React.createElement;
/** 2D overlay element for the 你 tag above `fig`'s head. f = frame; at = pop-in frame (omit = already on); out = exit
 *  start (6-frame fade + 20 px rise); lift = m above the top of the head (default .30). Returns null when off-screen. */
export function youTag(w: World, fig: Figure, o: { f: number; at?: number; out?: number; lift?: number; scale?: number }): React.ReactElement | null {
  if (!fig.sv || fig.st.visible === false) return null;
  const head = fig.headWorld(); head.y += fig.headR + (o.lift ?? 0.3);
  const p = w.project(head); if (!p.front) return null;
  const s = (o.at !== undefined ? pop(o.f, o.at) : 1) * (o.scale ?? 1);
  const ex = o.out !== undefined ? easeInCubic(lin(o.f, o.out, o.out + 6)) : 0;
  if (s <= 0 || ex >= 1) return null;
  const plate: React.CSSProperties = {
    width: 72, height: 72, borderRadius: 16, background: "linear-gradient(180deg, #ffd96a 0%, #f2b42c 100%)",
    border: `5px solid ${COL.ink}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 5px 0 rgba(0,0,0,0.38), 0 0 22px rgba(10,12,22,0.45)",
    fontFamily: FONT_STACK, fontWeight: 700, fontSize: 44, lineHeight: 1, color: COL.ink, paddingTop: 2,
  };
  const tick: React.CSSProperties = { position: "absolute", left: "50%", top: 66, width: 0, height: 0, transform: "translateX(-50%)",
    borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `12px solid ${COL.ink}` };
  return hEl("div", { style: { position: "absolute", left: p.x, top: p.y - 20 * ex, width: 0, height: 0, opacity: 1 - ex } },
    hEl("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%, -100%) scale(${s})`, transformOrigin: "50% 100%" } },
      hEl("div", { style: { position: "relative" } }, hEl("div", { style: plate }, "你"), hEl("div", { style: tick }))));
}
/** helper for segments: screen point of a world point as {x, y} (for kit overlay props) */
export const pt = (w: World, p: V3Like) => { const q = w.project(p); return { x: q.x, y: q.y }; };
export type { Vec3 };
