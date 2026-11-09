// Segment B · f536-1012 · S05-S08 (classroom day), hand-offs H1 in / H2 out. Builder B owns this file.
//
// ---------------------------------------------------------------------------------------------- segment interface
// (copied from story.ts "HOW TO BUILD A SEGMENT"; read that section in full)
//   export const SEG: Segment = { id, from, to, enter(w), exit(w), pose(w, f) }       from / to = SEGMENTS (checked)
//   engine per frame f:  on a segment change: old.exit(w); w.reset(); SEG.enter(w)
//                        w.beginFrame(f); P = SEG.pose(w, f); w.endFrame(P); draw 3D, P.overlays, caption, P.top
//   enter(w)  acquire pooled figures / ropes (w.dorm.actors.acquire(LOOK.you), w.dorm.ropes.acquire({ score })),
//             build your own cached things once (module-level, guarded)
//   exit(w)   release everything you acquired, restore every shared thing you changed
//   pose(w, f) -> Pose: a PURE function of f (any frame can be the first one of a page). Order:
//             a. w.setCamera(cam) FIRST   b. set state (light, windows, ceiling, animate)   c. fig.set({...}) for every
//             figure, crowd.state   d. w.dorm.update() / w.classroom.update() (+ re-aim, update again for two-person
//             ropes)   e. rope.update({...}) every frame   f. overlays from w.project(p) with h(...)
//             g. return { scene: "dorm" | "classroom" | "sky" | "phone2d", camera: cam, overlays?, top?, post?, sky?, captions? }
//   post: { dof: { focus, amount }, bloom, grade, gradeAmount, ink, ao }; omit for the set's defaults.
//   No Math.random / Date / wall time; no per-frame geometry builds except rope / ghost updates.
// -----------------------------------------------------------------------------------------------------------------
//
// S05 (f536-672) rise from OTS_YOU and glide back over the heads to WIDE5_A; the wave of raised sheets; 45 ropes thrown
//     f565-590 (33 really caught, 9 held only by a ghost, 3 falling short) plus Y3 / Y5 / G2; 45 ghost holders rise out
//     of their classmates; C1 grabs Y5 off its desk at f575 (twang); 94% (BigPercent) lands f606, label f629.
// S06 (f673-789) RES raises the answer stack; every ghost bursts f690-696; the 9 ghost-only ropes + G2 flop to the floor
//     in a chain the 22-degree pan follows (f697-742); Y3 greys in place at f742; strike f727, 约7成 f758, out f786.
// S07 (f790-887) glide to TWO_FISTS, the tug (f816), along Y5 to C1's grip, back along Y3 to the knot (POV rule: the
//     0.6 m nearest your fist is gold, true grey by 1.2 m, a material patch on this segment's own Y3 rope), up and back
//     to MED_YOU_WIN, "?" f870.
// S08 (f888-1012) crane to the floor by G2's end, travel along G2 up the aisle, rise to C2's grip (wave), arc to
//     C2_BEHIND (H2, static f990-1012); you twist round (f975-985), "!" f994, sweat f1000, tag 他把你当朋友 f956-998.
// Cameras: shots/segB_cam.ts (re-fit notes there). Ropes: shots/segB_net.ts. dbg: true logs projections, 穿模 checks
// (ropes vs desks / chairs / bodies, camera vs everything) and timing on the key frames.
// Hands: rope ends sit on the DRAWN hands (re-solved every frame). Cards face the lens, so a hand aimed toward / away from
// the camera draws foreshortened onto the head: YOUR fists (from f544 / f766) and C2's grip hand (S08) are aimed out to
// the person's own side in the plane facing the lens (lateral()); the crowd's raised rope arms are solved once at WIDE5_A
// (solveAims: each rope end on the hand on its partner's side of the drawing, pointing at the partner on screen).
import React from "react";
import * as THREE from "three";
import { getInputProps } from "remotion";
import type { Segment, CamPose, Pose, Vec3 } from "../story";
import { FPS, h, lin, clamp01, lerp, easeInOutCubic, easeOutCubic, easeInCubic, hash, pop } from "../story";
import { LOOK, DEFAULT_CROWD, type World } from "../world";
import { lidAt, walkPhase, cardClearance, type Figure, type CrowdState, type FigState } from "../kit/cast";
import type { Expr, ArmAim, HeldProp, View } from "../kit/toon";
import { Rope, ropeMotion, classroomSeats, ROPE_COL, type GhostHolder } from "../kit/rope";
import { BigPercent, RopeChip, COL, ts } from "../kit/overlay";
import { REAL, FLOPS, GREYS, ROLE, WRITERS } from "./segB_net";
import { buildCams, C2_BEHIND, WIDE5_A, dirOf, type BCams } from "./segB_cam";
// H1: builder A's hero sheet (the ink written in S04) and the pen in YOUR hand exactly as at f535
import { heroSheetH1, heroSheetApply, heroSheetRestore, inkAt, penRest, h1Points } from "./segA_sheet";

export { C2_BEHIND };
const DBG = !!(getInputProps() as { dbg?: boolean }).dbg;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const D = Math.PI / 180;
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const YOU = 41, C1 = 42, STAR = 43, C2 = 75;

// ===================================================================================================================
// state built in enter()
// ===================================================================================================================
type Kind = "real" | "flop" | "grey";
type Hero = {
  k: Kind; h: number; t: number; hs: 1 | -1; ts: 1 | -1; throwF: number; arriveF: number; popF: number; flopF: number;
  rope: Rope; ghost: GhostHolder | null; route: THREE.Vector3[]; idx: number;
};
type St = {
  cams: BCams; you: Figure; c1: Figure; c2: Figure; res: Figure; star: Figure;
  heroes: Hero[]; y3: Rope; y5: Rope; g2: Rope; gY3: GhostHolder; gY5: GhostHolder; gG2: GhostHolder;
  knot: THREE.Vector3; seats: ReturnType<typeof classroomSeats>; grad: Grad;
  /** H1 (builder A, segA_class.ts at f535): YOUR left fist with the rope ends, the pen grip; Y3's way to the lane
   *  (desk edge, between your chair and your deskmate's, the lane) and Y5's end lying on C1's desk */
  h1: { lf: THREE.Vector3; grip: THREE.Vector3; tip: THREE.Vector3; edge: THREE.Vector3; gap: THREE.Vector3; lane: THREE.Vector3; y5end: THREE.Vector3 };
};
let S: St | null = null;

// the Y3 rope with a colour gradient from its hand end (S07's POV rule): own Rope (not pooled), material patched once
type Grad = { rope: Rope; U: { uGA: { value: number }; uGB: { value: number }; uGK: { value: THREE.Vector3 } } };
const gradCache = new WeakMap<World, Grad>();
function gradRope(w: World): Grad {
  const hit = gradCache.get(w); if (hit) return hit;
  const rope = new Rope(w.classroom.M, { score: 3, seed: 303 });
  const gold = new THREE.Color(ROPE_COL.gold), grey = new THREE.Color(ROPE_COL.grey);
  const U = { uGA: { value: 98 }, uGB: { value: 99 }, uGK: { value: V(grey.r / gold.r, grey.g / gold.g, grey.b / gold.b) } };
  const m = rope.material, prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey.call(m);
  m.onBeforeCompile = function (this: THREE.Material, sh, r) {
    prev.call(this, sh, r);
    sh.uniforms.uGA = U.uGA; sh.uniforms.uGB = U.uGB; sh.uniforms.uGK = U.uGK;
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uGA; uniform float uGB; uniform vec3 uGK;")
      .replace("#include <color_fragment>", "#include <color_fragment>\n  diffuseColor.rgb *= mix( vec3( 1.0 ), uGK, smoothstep( uGA, uGB, vRopeS ) );");
  };
  m.customProgramCacheKey = () => `${prevKey}|segBgrad1`;
  m.needsUpdate = true;
  const g = { rope, U }; gradCache.set(w, g); return g;
}
const seatsCache = new WeakMap<World, ReturnType<typeof classroomSeats>>();
/** raised-arm aims per seat [arm 0, arm 1] (deg on the card) that put each drawn hand 0.32 m out from its own head in
 *  plan, solved once for the FIXED WIDE5_A camera (as world.web does for its camera: start 116 / 64, 4 passes); the
 *  network was chosen for hands there (1.21-1.27 m, 0.32 m out), so the ropes pass between the heads */
type SideAims = { d: [number, number]; arm: [0 | 1, 0 | 1] };
const aimsCache = new WeakMap<World, SideAims[]>();
/** the raised rope arms of the crowd, solved once at WIDE5_A (the shot the 48 ropes are read in): each rope end goes to
 *  the hand on its partner's side of the drawing and that arm points (on screen) toward the partner, kept off the head;
 *  front / back drawings swap net2's hand sides where the partners cross over on screen (side drawings keep them).
 *  Mutates REAL / FLOPS / GREYS hand sides and ROLE once (deterministic: one fixed camera). Per side (0 = right, 1 =
 *  left): the canvas dir and the arm it was solved for (another camera's drawing mirrors it onto its own half). */
function solveAims(w: World): SideAims[] {
  const hit = aimsCache.get(w); if (hit) return hit;
  const C = w.classroom, crowd = C.crowd, A = C.A, prevState = crowd.state, prevCam = w.snapshotCamera();
  const d = dirOf(WIDE5_A.yaw, WIDE5_A.pitch), p = WIDE5_A.pos;
  w.setCamera({ pos: p, look: [p[0] + d[0] * 6, p[1] + d[1] * 6, p[2] + d[2] * 6], fov: WIDE5_A.fov });
  const cam = w.camera as THREE.PerspectiveCamera; cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const camP = cam.position.clone();
  const scr = (v: THREE.Vector3) => { const q = v.clone().project(cam); return [q.x * cam.aspect, q.y]; };
  // one pass with the default raise to read each drawing's mirroring (arm 0 drawn screen-right of arm 1)
  crowd.state = () => ({ pose: { kind: "hold", t: 1, aim: [{ dir: 116 }, { dir: 64 }], base: "seat" } });
  C.cast.update(cam, 1.0);
  const mir = A.seats.map((_, i) => scr(crowd.handWorld(i, 0))[0] > scr(crowd.handWorld(i, 1))[0]);
  crowd.state = prevState; w.setCamera(prevCam);
  const top = (i: number) => C.crowdSeats[i].top;
  type End = { e: number[]; k: number; T: THREE.Vector3 };
  const ends: End[][] = A.seats.map(() => []);
  for (const e of REAL) { ends[e[0]].push({ e, k: 2, T: top(e[1]).clone().setY(1.05) }); ends[e[1]].push({ e, k: 3, T: top(e[0]).clone().setY(1.05) }); }
  for (const e of FLOPS) ends[e[0]].push({ e, k: 2, T: top(e[1]).clone().setY(1.4) });
  for (const e of GREYS) ends[e[0]].push({ e, k: 2, T: top(e[1]).clone().setY(0.8) });
  const out: SideAims[] = A.seats.map((_, i) => {
    const arm: [0 | 1, 0 | 1] = [armOf(camP, top(i), C.crowdSeats[i].facing, 1), armOf(camP, top(i), C.crowdSeats[i].facing, -1)];
    return { d: [arm[0] === 0 ? 116 : 64, arm[1] === 0 ? 116 : 64], arm };
  });
  A.seats.forEach((_, i) => {
    const E = ends[i]; if (!E.length) return;
    const fac = C.crowdSeats[i].facing, view = viewOf(camP, top(i), fac).view, sh = top(i).clone().setY(0.95), s0 = scr(sh);
    // canvas angle toward each partner (screen angle, mirrored drawings flip it)
    const phi = E.map((en) => { const q = scr(en.T); const th = (Math.atan2(q[1] - s0[1], q[0] - s0[0]) * 180) / Math.PI; return mir[i] ? 180 - th : th; });
    const arms: (0 | 1)[] = E.map((en, n) => (view === "side" ? armOf(camP, top(i), fac, en.e[en.k] as number) : ((E.length === 2 ? phi[n] >= phi[1 - n] : phi[n] > 90) ? 0 : 1)));
    if (E.length === 2 && arms[0] === arms[1]) arms[1] = (1 - arms[0]) as 0 | 1;
    E.forEach((en, n) => {
      const arm = arms[n], side: 1 | -1 = armOf(camP, top(i), fac, 1) === arm ? 1 : -1;
      en.e[en.k] = side;
      let dd = ((phi[n] % 360) + 540) % 360 - 180; // -180..180
      if (view === "side") { dd = Math.min(155, Math.max(25, dd < -90 ? 155 : dd < 0 ? 25 : dd)); if (dd > 75 && dd < 105) dd = dd < 90 ? 75 : 105; }
      else dd = arm === 0 ? Math.min(155, Math.max(100, dd < -90 || dd > 155 ? 155 : dd < 100 ? 100 : dd)) : Math.min(80, Math.max(25, dd < -90 ? 25 : dd));
      out[i].d[side > 0 ? 0 : 1] = dd; out[i].arm[side > 0 ? 0 : 1] = arm;
    });
  });
  for (const r of ROLE) { r.throwSide = undefined; r.recvSide = undefined; }
  for (const [hh, tt, hs, tsd] of REAL) { ROLE[hh].throwSide = hs; ROLE[tt].recvSide = tsd; }
  for (const [hh, , hs] of FLOPS) ROLE[hh].throwSide = hs;
  for (const [hh, , hs] of GREYS) ROLE[hh].throwSide = hs;
  aimsCache.set(w, out);
  return out;
}
/** the raised dir of person i's `side` hand drawn as `arm` (see solveAims) */
function upDir(i: number, side: number, arm: 0 | 1): number {
  const a = AIMS[i]; if (!a) return arm === 0 ? 116 : 64;
  const k = side > 0 ? 0 : 1; return a.arm[k] === arm ? a.d[k] : 180 - a.d[k];
}
let AIMS: SideAims[] = [];
/** the kit ghost's default look, restored on exit (segment B draws its ghosts without the fill: storyboard 0.2) */
let ghostStyle0: GhostHolder["style"] | null = null;
const GHOST_STYLE = { face: true, dot: "#fffdf4", rim: "rgba(64,74,120,0.9)", halo: "#ffe9a8", fill: "rgba(232,240,255,0.0)" };

// ===================================================================================================================
// small helpers
// ===================================================================================================================
/** the drawing the cast picks for someone at `at` facing `facing` seen from cam (cast.ts pickView's rule) */
function viewOf(cam: THREE.Vector3, at: THREE.Vector3, facing: number): { view: View; rel: number } {
  const rel = wrap(Math.atan2(cam.x - at.x, cam.z - at.z) - facing), a = Math.abs(rel);
  return { view: a < 50 * D ? "front" : a > 130 * D ? "back" : "side", rel };
}
/** arm index (0 = canvas-left / far arm, 1 = canvas-right / near arm) of the person's right (+1) or left (-1) hand */
function armOf(cam: THREE.Vector3, at: THREE.Vector3, facing: number, side: number, force?: View): 0 | 1 {
  const v = viewOf(cam, at, facing), view = force ?? v.view;
  if (view === "back") return side > 0 ? 1 : 0;
  if (view === "front") return side > 0 ? 0 : 1;
  return (side > 0) === (v.rel < 0) ? 1 : 0;
}
/** the kit GhostHolder's hand for feet / camera / toward, with the arm angle quantized to 9 deg (fewer canvases);
 *  returns the hand and the `toward` that makes the kit draw exactly that angle */
function ghostAim(feet: THREE.Vector3, cam: THREE.Vector3, toward: THREE.Vector3) {
  const yaw = Math.atan2(cam.x - feet.x, cam.z - feet.z), R = V(Math.cos(yaw), 0, -Math.sin(yaw)), F = V(Math.sin(yaw), 0, Math.cos(yaw));
  const sh = (s: number) => feet.clone().addScaledVector(R, s * 0.14).addScaledVector(UP, 0.93);
  const side = toward.clone().sub(sh(0)).dot(R) >= 0 ? 1 : -1, d = toward.clone().sub(sh(side));
  const ang = Math.max(-65, Math.min(55, (Math.atan2(d.y, Math.max(0.05, Math.abs(d.dot(R)))) * 180) / Math.PI));
  const qa = Math.round(ang / 9) * 9, a = qa * D;
  const hand = feet.clone().addScaledVector(R, side * (0.14 + 0.47 * Math.cos(a))).addScaledVector(UP, 0.93 + 0.47 * Math.sin(a)).addScaledVector(F, 0.01);
  const tw = sh(side).addScaledVector(R, side * Math.cos(a)).addScaledVector(UP, Math.sin(a));
  return { hand, toward: tw };
}
/** a falling rope: nodes from their place on the straight air line a -> e0 down onto floor points `fl` (gravity in y,
 *  ease-out in plan), then two small landing hops; s = progress along the line of each node */
function fallNodes(a: THREE.Vector3, e0: THREE.Vector3, fl: THREE.Vector3[], tt: number, dur = 0.4) {
  const segs = [a.distanceTo(fl[0])]; for (let i = 1; i < fl.length; i++) segs.push(fl[i].distanceTo(fl[i - 1]));
  const tot = segs.reduce((x, y) => x + y, 0); let acc = 0;
  const q = clamp01(tt / dur), hx = 1 - (1 - q) * (1 - q), hy = q * q, u = tt - dur;
  const hop = u > 0 ? 0.05 * Math.abs(Math.sin((Math.PI * u) / 0.13)) * Math.exp(-u / 0.09) : 0;
  return fl.map((p, i) => {
    acc += segs[i]; const s = acc / tot, air = a.clone().lerp(e0, s);
    return V(lerp(air.x, p.x, hx), lerp(air.y, p.y, hy) + hop * (0.35 + 0.65 * s), lerp(air.z, p.z, hx));
  });
}
/** a hanging drop from hand a to floor point b: one sag point so it reads as a hanging rope, not a stick */
const dropVia = (a: THREE.Vector3, b: THREE.Vector3) => { const m = a.clone().lerp(b, 0.42); m.y = Math.max(0.05, m.y - 0.16); m.x += (b.x - a.x) * 0.12; m.z += (b.z - a.z) * 0.12; return m; };
const pctOf = (w: World, p: THREE.Vector3) => { const q = w.project(p); return `(${Math.round(q.x / 10.8)}%,${Math.round(q.y / 19.2)}%${q.front ? "" : " BEHIND"})`; };

// G2's floor path (the window-side aisle, then the strip behind row 3, then between the deskmate's chair and yours) and
// where its end lies: by YOUR LEFT shoe (in the re-fitted room the aisle and C2 are on your left)
const G2_PATH = [V(-2.18, 0, 4.55), V(-2.02, 0, 4.05), V(-2.0, 0, 1.62), V(-1.9, 0, 1.337), V(-1.02, 0, 1.337), V(-0.885, 0, 1.22), V(-0.875, 0, 1.06)];
// world targets for YOUR hands (relative to your hip) and C1 / C2's
const YOU_RF = V(0.2, 0.368, -0.29);
const C1_GRIPPT = V(-0.03, 1.05, 0.9);
const C2_GRIPPT = V(-2.42, 1.05, 4.98), C2_DESK = V(-2.92, 0.8, 4.5);

// ===================================================================================================================
export const SEG: Segment = {
  id: "B", from: 536, to: 1012,
  enter(w) {
    const C = w.classroom, A = C.A;
    let seats = seatsCache.get(w); if (!seats) { seats = classroomSeats(A); seatsCache.set(w, seats); }
    AIMS = solveAims(w); // (sets the rope hand sides the heroes read below)
    const heroes: Hero[] = [];
    const mk = (k: Kind, hh: number, tt: number, hs: 1 | -1, tsd: 1 | -1, flopF: number, idx: number): Hero => {
      const sc = k === "real" ? (hash(idx, 11) < 0.22 ? 3 : hash(idx, 11) > 0.86 ? 5 : 4) : k === "grey" ? 3 : 4;
      const rope = C.ropes.acquire({ score: sc, seed: 40 + idx, gold: k === "grey" ? 0 : 1 });
      const row = Math.floor(hh / 12), raised = Math.ceil(561 + 2.6 * row);
      const throwF = Math.max(565 + Math.floor(hash(idx, 1) * 6), raised), arriveF = Math.max(throwF + 6, 575 + Math.floor(hash(idx, 2) * 3));
      const ghost = k === "grey" ? null : C.ghosts.acquire();
      const route = k === "real" ? [] : seats!.route(seats!.seats[hh], seats!.seats[tt], idx);
      return { k, h: hh, t: tt, hs, ts: tsd, throwF, arriveF, popF: 690 + Math.floor(hash(idx, 4) * 7), flopF, rope, ghost, route, idx };
    };
    let n = 0;
    for (const [hh, tt, hs, tsd] of REAL) heroes.push(mk("real", hh, tt, hs, tsd, 0, n++));
    for (const [hh, tt, hs, ff] of FLOPS) heroes.push(mk("flop", hh, tt, hs, 1, ff, n++));
    for (const [hh, tt, hs] of GREYS) heroes.push(mk("grey", hh, tt, hs, 1, 0, n++));
    const grad = gradRope(w);
    C.scene.add(grad.rope.mesh); grad.rope.mesh.visible = true;
    // Y3's knot exactly as segment A ties it (anchors.radiatorTie, postR 0.014, 2 turns, 4 cm tail)
    const knot = C.roles.radiatorTie.clone();
    const sp = A.seats[YOU].pos, hp = h1Points(w);
    grad.rope.seed = 52;
    heroSheetH1(w);
    S = {
      cams: buildCams(C.roles.floor(YOU)),
      you: C.actors.acquire(LOOK.you), c1: C.actors.acquire(LOOK.c1), c2: C.actors.acquire(LOOK.c2),
      res: C.actors.acquire(LOOK.res), star: C.actors.acquire(LOOK.star),
      heroes, y3: grad.rope, y5: C.ropes.acquire({ score: 5, seed: 53 }), g2: C.ropes.acquire({ score: 4, seed: 202 }),
      gY3: C.ghosts.acquire(), gY5: C.ghosts.acquire(), gG2: C.ghosts.acquire(),
      knot, seats, grad,
      h1: { lf: hp.leftFist, grip: hp.penGrip, tip: hp.penTip, edge: V(sp.x - 0.28, 0.86, sp.z - 0.12), gap: V(sp.x - 0.31, 0.93, sp.z + 0.02),
        lane: V(sp.x - 0.36, 1.0, knot.z), y5end: V(sp.x + 0.5, 0.7506, sp.z - 0.44) },
    };
    for (const g of [...heroes.map((H) => H.ghost), S.gY3, S.gY5, S.gG2]) if (g) { if (!ghostStyle0) ghostStyle0 = g.style; g.style = GHOST_STYLE; }
  },
  exit(w) {
    const C = w.classroom;
    if (S && ghostStyle0) for (const g of [...S.heroes.map((H) => H.ghost), S.gY3, S.gY5, S.gG2]) if (g) g.style = ghostStyle0;
    if (S) { S.grad.U.uGA.value = 98; S.grad.U.uGB.value = 99; S.y3.mesh.visible = false; C.scene.remove(S.y3.mesh); }
    C.actors.releaseAll(); C.ropes.releaseAll(); C.ghosts.releaseAll();
    C.set.objects.heroSheet.visible = true; C.set.objects.heroPen.visible = true;
    heroSheetRestore(w);
    C.crowd.state = DEFAULT_CROWD;
    S = null;
  },
  pose(w, f) {
    const st = S!, C = w.classroom, A = C.A, t = f / FPS;
    const t0 = DBG ? performance.now() : 0;
    // ---------------------------------------------------------------- a. camera
    const cam = st.cams.at(f);
    w.setCamera(cam);
    const camP = w.camera.position.clone();
    // ---------------------------------------------------------------- b. set state
    C.set.setCeilingOpen(0); C.set.setWindowOpen(0); C.set.setShaft(0); C.set.animate(t);
    // the sheet keeps segment A's ink; the pen stays in YOUR hand (as A left it) until you pick the sheet up at f558
    if (f < 558) heroSheetH1(w); else { heroSheetApply(w, inkAt(535)); penRest(w); }
    C.set.objects.heroPen.visible = true;
    C.set.objects.heroSheet.visible = f < 558 || f >= 706;
    // ---------------------------------------------------------------- c. figures
    const youSeat = C.seatOf(YOU), youHip = youSeat.seat.top;
    poseYou(st, f, t, camP, youSeat);
    poseC1(st, f, t, camP, C.seatOf(C1));
    poseC2(st, f, t, camP, C.seatOf(C2));
    poseRes(st, f, t, camP, A);
    if (f >= 888) st.star.set({ at: A.platform.clone(), floor: A.platformTop, facing: 0.25, pose: { kind: "idle", t }, expr: "smug", lookUp: 0.35, blink: lidAt(t, 143) });
    else st.star.set({ pose: { kind: "idle" }, visible: false });
    C.crowd.state = (i, tt) => crowdState(i, tt, f, camP, C.crowdSeats[i].top, C.crowdSeats[i].facing);
    // ---------------------------------------------------------------- d. solve
    C.update(t);
    // ---------------------------------------------------------------- e. ropes and ghosts
    const crowdHand = (i: number, side: number) => C.crowd.handWorld(i, armOf(camP, C.crowdSeats[i].top, C.crowdSeats[i].facing, side));
    const gold16: THREE.Vector3[] = [];
    for (const H of st.heroes) {
      const a = crowdHand(H.h, H.hs);
      const tSeat = C.crowdSeats[H.t].top;
      // ghost holder (real + flop): rises over 6 frames from arrival - 3, bursts at popF
      let e0: THREE.Vector3 | null = null;
      if (H.ghost) {
        const rise = easeOutCubic(lin(f, H.arriveF - 3, H.arriveF + 3));
        const toCam = V(camP.x - tSeat.x, 0, camP.z - tSeat.z).normalize().multiplyScalar(0.3);
        const feet = H.k === "flop" ? V(tSeat.x, 0.47 * rise, tSeat.z).add(toCam) : V(tSeat.x, -0.45 * (1 - rise), tSeat.z).add(toCam);
        const g = ghostAim(feet, camP, a);
        e0 = g.hand;
        // the nearest ghosts (the last rows, big in the frame's lower third) are fainter so their dots don't bead the heads
        const near = 0.45 + 0.55 * clamp01((feet.distanceTo(camP) - 2.4) / 2.6);
        if (f >= H.arriveF - 3 && f < H.popF + 14) H.ghost.update({ feet, camera: camP, toward: g.toward, opacity: rise * near, pop: f >= H.popF ? (f - H.popF) / FPS : undefined });
        else H.ghost.mesh.visible = false;
      }
      if (f < H.throwF) { H.rope.mesh.visible = false; continue; }
      const tt = (f - H.throwF) / FPS, dur = (H.arriveF - H.throwF) / FPS;
      if (H.k === "real") {
        const b = crowdHand(H.t, H.ts), span = a.distanceTo(b);
        const th = ropeMotion.throwRope(tt, { dur }), tw = ropeMotion.twang(tt - dur, { from: 0.08 * span, amp: 0.02 * span });
        H.rope.update({ a, b, slack: tt < dur ? 0.08 * span : tw.slack, vib: tw.vib, vib2: tw.vib2, reveal: th.reveal, glint: th.glint, glintAmt: th.glintAmt, gold: 1 });
        if (gold16.length < 16 && f >= H.arriveF) gold16.push(H.rope.spanPointAt(0.5));
      } else if (H.k === "flop") {
        if (f < H.flopF) {
          const span = a.distanceTo(e0!);
          const th = ropeMotion.throwRope(tt, { dur }), tw = ropeMotion.twang(tt - dur, { from: 0.08 * span, amp: 0.02 * span });
          H.rope.update({ a, b: e0!, slack: tt < dur ? 0.08 * span : tw.slack, vib: tw.vib, vib2: tw.vib2, reveal: th.reveal, glint: th.glint, glintAmt: th.glintAmt, gold: 1 });
          if (gold16.length < 16 && f >= H.arriveF) gold16.push(H.rope.spanPointAt(0.5));
        } else {
          const ft = (f - H.flopF) / FPS, nodes = fallNodes(a, e0!, H.route, ft);
          const bo = ropeMotion.boing(ft - 0.4, { to: 0, wobble: 0.05 });
          H.rope.update({ a, via: [dropVia(a, nodes[0]), ...nodes.slice(0, -1)], b: nodes[nodes.length - 1], attachB: { kind: "end" }, slack: 0.006, vib2: bo.vib2, gold: 1 - clamp01((f - H.flopF) / 4) });
        }
      } else {
        // grey: thrown short, falls onto the floor route in front of the target
        const b0 = crowdHand(H.t, -H.hs), short = a.clone().lerp(b0, 0.62);
        const fallF = H.throwF + 7;
        if (f < fallF) {
          H.rope.update({ a, b: short, slack: 0.05 * a.distanceTo(short), reveal: ropeMotion.throwRope(tt, { dur: 7 / FPS }).reveal, gold: 0 });
        } else {
          const ft = (f - fallF) / FPS, nodes = fallNodes(a, short, H.route, ft);
          H.rope.update({ a, via: [dropVia(a, nodes[0]), ...nodes.slice(0, -1)], b: nodes[nodes.length - 1], attachB: { kind: "end" }, slack: 0.006, gold: 0 });
        }
      }
    }
    // --- Y3: your left fist -> the lane behind row 3 -> knot on the riser
    const you = st.you, yv = (side: number) => armOf(camP, youHip, youFacing(f), side);
    const yL = you.handWorld(yv(-1)), yR = you.handWorld(yv(1)), h1 = st.h1;
    // H1: the rope ends start exactly where segment A left them (its fist point, bare ends) and move onto the drawn
    // fist over the first 10 frames of the rise
    const hk = easeInOutCubic(lin(f, 536, 546)), endA = f < 546 ? ({ kind: "end" } as const) : ({ kind: "hand" } as const);
    const yL3 = h1.lf.clone().lerp(yL, hk);
    {
      // gold until f742 (greys whole over 4 frames); S07 (f790-887) the POV gradient; S08 true grey
      const U = st.grad.U;
      let gold = 1 - clamp01((f - 742) / 4);
      if (f >= 790 && f < 888) { gold = 1; U.uGA.value = 0.6; U.uGB.value = 1.2; }
      else if (f >= 888 && f < 892) { gold = 1; const k = (f - 888) / 4; U.uGA.value = 0.6 * (1 - k) - 0.2 * k; U.uGB.value = 1.2 * (1 - k) - 0.1 * k; }
      else { U.uGA.value = 98; U.uGB.value = 99; if (f >= 888) gold = 0; }
      const tw = ropeMotion.twang((f - 575) / FPS, { from: 0.02, amp: 0.05 }), tug = ropeMotion.twang((f - 816) / FPS, { from: 0.0, amp: 0.035 });
      const vib = f >= 816 ? tug.vib : f >= 575 ? tw.vib : 0, vib2 = f >= 816 ? tug.vib2 : f >= 575 ? tw.vib2 : 0;
      // the way to the lane as segment A laid it: over the desk's near edge, between your chair and your deskmate's,
      // level along the lane to the riser; once the fist is out at your side (f551+) the edge point drops out
      const via = f < 551 ? [h1.edge, h1.gap, h1.lane] : [h1.gap, h1.lane];
      st.y3.update({ a: yL3, via, b: st.knot, attachA: endA, attachB: { kind: "knot", postR: 0.014, turns: 2, tail: 0.04, axis: UP },
        slack: f < 575 ? 0.02 : f < 600 ? tw.slack : 0, vib, vib2, gold });
      // Y3's ghost stands in front of the riser (S05), its hand on the knot
      const rise = easeOutCubic(lin(f, 572, 578)), popF = 693;
      const feet = V(st.knot.x + 0.42, -0.45 * (1 - rise), st.knot.z + 0.08), g = ghostAim(feet, camP, st.knot);
      if (f >= 572 && f < popF + 14) st.gY3.update({ feet, camera: camP, toward: g.toward, opacity: rise, pop: f >= popF ? (f - popF) / FPS : undefined });
      else st.gY3.mesh.visible = false;
    }
    // --- Y5: your left fist (H1) / right fist (from f760) -> its end on C1's desk -> C1's left hand (grab f575)
    {
      const a = f < 760 ? yL3 : yR;
      const c1 = st.c1, cv = armOf(camP, C.seatOf(C1).seat.top, c1Facing(f), -1);
      const b = c1.handWorld(cv);
      const tug = ropeMotion.twang((f - 816) / FPS, { from: 0, amp: 0.02 });
      if (f < 575) st.y5.update({ a, b: h1.y5end, attachA: endA, attachB: { kind: "end" }, slack: 0.012 * a.distanceTo(h1.y5end), floorY: 0.7506, gold: 1 });
      else {
        const sn = ropeMotion.snap((f - 575) / FPS, { from: 0.08, amp: 0.03 });
        st.y5.update({ a, b, bFrom: h1.y5end, endT: sn.endT, endPath: "lift", slack: f >= 816 ? tug.slack : sn.slack, vib: f >= 816 ? tug.vib : sn.vib, vib2: f >= 816 ? tug.vib2 : sn.vib2,
          glint: sn.glint, glintAmt: sn.glintAmt, gold: 1, glow: 0.25 * sn.glow, attachA: endA, attachB: { kind: "hand" } });
      }
      // C1's ghost (overlapping C1, like every real catcher's)
      const s1 = C.crowdSeats[C1].top, rise = easeOutCubic(lin(f, 574, 580)), popF = 692;
      const feet = V(s1.x, -0.45 * (1 - rise), s1.z).add(V(camP.x - s1.x, 0, camP.z - s1.z).normalize().multiplyScalar(0.3)), g = ghostAim(feet, camP, a);
      if (f >= 574 && f < popF + 14) st.gY5.update({ feet, camera: camP, toward: g.toward, opacity: rise, pop: f >= popF ? (f - popF) / FPS : undefined });
      else st.gY5.mesh.visible = false;
    }
    // --- G2: C2's right hand -> (S05) a floating ghost of YOU -> (f742) flops onto the aisle floor to your left shoe
    {
      const c2 = st.c2, a = c2.handWorld(armOf(camP, C.seatOf(C2).seat.top, c2Facing(f), 1));
      const rise = easeOutCubic(lin(f, 581, 587)), popF = 694;
      const feet = V(youHip.x, 0.47 * rise, youHip.z).add(V(camP.x - youHip.x, 0, camP.z - youHip.z).normalize().multiplyScalar(0.3)), g = ghostAim(feet, camP, a);
      if (f >= 581 && f < popF + 14) st.gG2.update({ feet, camera: camP, toward: g.toward, opacity: rise, pop: f >= popF ? (f - popF) / FPS : undefined });
      else st.gG2.mesh.visible = false;
      const throwF = 577, arriveF = 584, flopF = 742, tt = (f - throwF) / FPS, dur = (arriveF - throwF) / FPS;
      if (f < throwF) st.g2.mesh.visible = false;
      else if (f < flopF) {
        const span = a.distanceTo(g.hand), th = ropeMotion.throwRope(tt, { dur }), tw = ropeMotion.twang(tt - dur, { from: 0.08 * span, amp: 0.02 * span });
        st.g2.update({ a, b: g.hand, slack: tt < dur ? 0.08 * span : tw.slack, vib: tw.vib, vib2: tw.vib2, reveal: th.reveal, glint: th.glint, glintAmt: th.glintAmt, gold: 1 });
      } else {
        // the air end is where the ghost's hand was (the camera has not moved since f672)
        const ft = (f - flopF) / FPS, nodes = fallNodes(a, g.hand, G2_PATH, ft);
        const bo = ropeMotion.boing(ft - 0.4, { to: 0, wobble: 0.05 });
        st.g2.update({ a, via: [dropVia(a, nodes[0]), ...nodes.slice(0, -1)], b: nodes[nodes.length - 1], attachB: { kind: "end" }, slack: 0.006, vib2: bo.vib2, gold: 1 - clamp01((f - flopF) / 4) });
      }
    }
    // ---------------------------------------------------------------- f. overlays
    const ov: React.ReactNode[] = [];
    if (f >= 582 && f <= 794) {
      const from = gold16.map((p) => { const q = w.project(p); return { x: q.x, y: q.y }; }).filter((q) => q.x > -100 && q.x < 1180 && q.y > -100 && q.y < 2020);
      ov.push(h(BigPercent, { key: "bp", at: 582, dur: 24, x: 540, y: 422, from, labelAt: 629, strikeAt: 727, stampAt: 758, out: 786, frame: f }));
    }
    if (f >= 870 && f < 888) ov.push(popMark(w, you, f, 870, 882, "?", "q"));
    if (f >= 956 && f <= 1006) {
      // anchored on G2 just below C2's hand at C2_GRIP, sliding along the rope during the arc to a point in frame at
      // C2_BEHIND (0.8 m from the hand is under C2's desk there, out of frame)
      const ka = f < 960 ? 0 : easeInOutCubic(lin(f, 960, 990)), m = lerp(0.35, chipMStar(w, st.g2), ka);
      const p = g2PointFromHand(st.g2, m), q = w.project(p);
      if (q.front) ov.push(h(RopeChip, { key: "chip", at: 956, out: 998, x: q.x, y: q.y, dy: lerp(-150, Math.min(-150, 0.54 * 1920 - q.y), ka), tone: "grey", frame: f }));
    }
    if (f >= 994 && f < 1012) ov.push(popMark(w, you, f, 994, 1006, "!", "x"));
    if (f >= 1000 && f < 1012) ov.push(sweatDrop(w, you, f, 1000, 1006));
    if (DBG) debug(w, st, f, cam, camP, t0);
    // H1: segment A ends focused on the pen tip (dof amount 2); the focus pull opens up over the rise
    const post = f < 556 ? { dof: { focus: Math.max(0.12, camP.distanceTo(h1.tip)), amount: 2 * (1 - easeInOutCubic(lin(f, 536, 556))) } } : undefined;
    return { scene: "classroom", camera: cam, overlays: ov.length ? h(React.Fragment, null, ...ov) : undefined, post } as Pose;
  },
};

// ===================================================================================================================
// figures
// ===================================================================================================================
type SeatOf = ReturnType<World["classroom"]["seatOf"]>;
const youFacing = (f: number) => Math.PI + (Math.PI / 2) * easeInOutCubic(lin(f, 975, 985));
const c1Facing = (f: number) => (f < 790 ? Math.PI : -Math.PI / 2 - 0.35);
const c2Facing = (f: number) => (f < 790 ? Math.PI : Math.PI / 2);
/** hold-pose aims for physical hands: map {side: target | dir} to arm indices for the current view */
function aimsFor(cam: THREE.Vector3, at: THREE.Vector3, facing: number, R: THREE.Vector3 | null, L: THREE.Vector3 | null, force?: View) {
  const aimAt: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, null];
  aimAt[armOf(cam, at, facing, 1, force)] = R; aimAt[armOf(cam, at, facing, -1, force)] = L;
  return aimAt;
}
/** a hand target out at the person's `side` in the plane facing the lens, `up` above the hip (any camera then draws
 *  the arm full length beside the body, never foreshortened onto the head) */
function lateral(hip: THREE.Vector3, cam: THREE.Vector3, facing: number, side: number, up: number, out: number) {
  const d = hip.clone().sub(cam), cr = V(-d.z, 0, d.x).normalize();
  const pr = V(-Math.cos(facing), 0, Math.sin(facing)), sg = pr.dot(cr) >= 0 ? 1 : -1;
  return hip.clone().add(V(0, up, 0)).addScaledVector(cr, out * sg * side);
}
function poseYou(st: St, f: number, t: number, cam: THREE.Vector3, so: SeatOf) {
  const hip = so.seat.top, facing = youFacing(f), tw = easeInOutCubic(lin(f, 975, 985));
  const rel = (v: THREE.Vector3) => hip.clone().add(v);
  // left fist (segment A's H1 point on the desk's near edge): Y3 (+ Y5 until f760); right: on the pen (H1) -> raises
  // the sheet f558-566 -> lowers it f700-712 -> takes Y5 at f760 (the mirror of the left fist)
  const tug = f >= 816 && f < 826 ? Math.sin((Math.PI * (f - 816)) / 10) : 0, tugV = V(0, 0.02 * tug, 0.05 * tug);
  let L = st.h1.lf.clone().lerp(lateral(hip, cam, facing, -1, 0.3, 0.46), easeInOutCubic(lin(f, 544, 558))).add(tugV);
  const pen = st.h1.grip, up = rel(V(0.3, 1.0, -0.08)), rest = rel(V(0.2, 0.31, -0.36)), rf = rel(YOU_RF).add(tugV);
  let R: THREE.Vector3;
  if (f < 558) R = pen;
  else if (f < 700) R = pen.clone().lerp(up, easeOutCubic(lin(f, 558, 566)));
  else if (f < 760) R = up.clone().lerp(rest, easeInOutCubic(lin(f, 700, 712)));
  else R = rest.clone().lerp(rf, easeInOutCubic(lin(f, 760, 766)));
  // S06 end -> S07 / S08: both fists out sideways below the head, in the plane facing the lens, on the person's own
  // sides (a fist aimed toward or away from the lens draws foreshortened onto the head and its rope through it)
  const k7 = easeInOutCubic(lin(f, 766, 780));
  if (k7 > 0) R = R.lerp(lateral(hip, cam, facing, 1, 0.3, 0.46).add(tugV), k7);
  // S08 twist (facing -x): fists swing round with the body
  if (tw > 0) { L = L.lerp(rel(V(-0.3, 0.47, 0.04)), tw); R = R.lerp(rel(V(-0.26, 0.47, -0.26)), tw); }
  const props: [HeldProp, HeldProp] = [null, null];
  const ri = armOf(cam, hip, facing, 1);
  if (f >= 558 && f < 704) props[ri] = "card"; // (at H1 the set's pen is in the hand, placed by segA_sheet)
  const expr: Expr = f < 556 ? "smug" : f < 700 ? "grin" : f < 870 ? "smile" : f < 888 ? "dazed" : f < 975 ? "neutral" : "nervous";
  const s: FigState = {
    seat: tw > 0.3 ? { top: hip, back: so.seat.back } : so.seat, facing,
    pose: { kind: "hold", t, base: "seat", props }, aimAt: aimsFor(cam, hip, facing, R, L), expr, blink: lidAt(t, 1),
    lookUp: f >= 870 && f < 888 ? -0.45 : f >= 978 ? -0.8 : 0, clampYaw: tw > 0.3 ? 0.6 : undefined,
  };
  st.you.set(s);
}
function poseC1(st: St, f: number, t: number, cam: THREE.Vector3, so: SeatOf) {
  const hip = so.seat.top;
  if (f < 563) { st.c1.set({ ...so, pose: { kind: "write", t: t * 2.4 + hash(C1, 5) * 3 }, expr: "smug", blink: lidAt(t, 42) }); return; }
  if (f < 790) {
    // the wave (row 3), the left hand takes Y5 at f575, the right holds the sheet until ~f650
    const k = easeOutCubic(lin(f, 563, 569)), kl = easeInOutCubic(lin(f, 650, 658));
    const aims: [ArmAim, ArmAim] = [null, null], props: [HeldProp, HeldProp] = [null, null];
    for (const side of [1, -1]) {
      const arm = armOf(cam, hip, Math.PI, side), upD = upDir(C1, side, arm), restD = arm === 0 ? 255 : -75;
      const kk = side < 0 ? k : k * (1 - kl);
      aims[arm] = { dir: lerp(restD, upD, kk), reach: lerp(0.8, 1, kk) };
      if (side > 0 && kl < 0.6) props[arm] = "card";
    }
    const expr: Expr = f < 700 ? "grin" : "smile";
    st.c1.set({ ...so, pose: { kind: "hold", t, base: "seat", aim: aims, props }, expr, blink: lidAt(t, 42) });
    return;
  }
  // S07-S08: turned sideways toward you, gripping Y5 (left hand), right hand on the desk
  const facing = c1Facing(f);
  st.c1.set({ seat: { top: hip, back: so.seat.back }, facing, pose: { kind: "hold", t, base: "seat" },
    aimAt: aimsFor(cam, hip, facing, V(0.36, 0.8, 0.78), C1_GRIPPT), expr: "smile", blink: lidAt(t, 42), clampYaw: 0.6 });
}
function poseC2(st: St, f: number, t: number, cam: THREE.Vector3, so: SeatOf) {
  const hip = so.seat.top;
  if (f < 790) {
    const k = easeOutCubic(lin(f, 571, 577)), kl = easeInOutCubic(lin(f, 655, 663));
    const aims: [ArmAim, ArmAim] = [null, null], props: [HeldProp, HeldProp] = [null, null];
    for (const side of [1, -1]) {
      const arm = armOf(cam, hip, Math.PI, side), upD = upDir(C2, side, arm), restD = arm === 0 ? 255 : -75;
      const kk = side > 0 ? k : k * (1 - kl);
      aims[arm] = { dir: lerp(restD, upD, kk), reach: lerp(0.8, 1, kk) };
      if (side < 0 && kl < 0.6) props[arm] = "card";
    }
    const expr: Expr = f >= 745 && f < 760 ? "shock" : f < 700 ? "grin" : "neutral";
    st.c2.set({ ...so, pose: { kind: "hold", t, base: "seat", aim: aims, props }, expr, blink: lidAt(t, 75) });
    return;
  }
  // S08: turned to the aisle, right hand holding G2's end up at y 1.05; the left waves f958-978, then rests on the desk
  const facing = c2Facing(f);
  const wv = f >= 958 && f < 978 ? Math.sin((2 * Math.PI * (f - 958)) / 13.3) : 0, wk = Math.sin(Math.PI * clamp01((f - 956) / 24));
  const L = C2_DESK.clone().lerp(V(-2.66 + 0.04 * wv, 1.7, 4.6 + 0.22 * wv), f >= 956 && f < 980 ? Math.min(1, wk * 1.6) : 0);
  st.c2.set({ seat: { top: hip, back: so.seat.back }, facing, pose: { kind: "hold", t, base: "seat" },
    aimAt: aimsFor(cam, hip, facing, lateral(hip, cam, facing, 1, 0.5, 0.46), L), expr: f >= 940 ? "grin" : "smile", blink: lidAt(t, 75) });
}
function poseRes(st: St, f: number, t: number, cam: THREE.Vector3, A: World["classroom"]["A"]) {
  const z0 = 0.9, z1 = A.researcherPath[0].z, x = A.aisleX[0];
  if (f < 538) { st.res.set({ at: V(x, 0, z0), facing: Math.PI, pose: { kind: "idle", t, props: ["clipboard", null] }, expr: "neutral", blink: lidAt(t, 5) }); return; }
  if (f < 656) {
    // trapezoid speed: 10-frame ramps, 1.3 m/s cruise
    const T = 655 - 538, r = 10, v = 1 / (T - r), u = f - 538;
    const s = u < r ? (v * u * u) / (2 * r) : u > T - r ? 1 - (v * (T - u) * (T - u)) / (2 * r) : v * (u - r / 2);
    const z = lerp(z0, z1, clamp01(s)), dist = Math.abs(z - z0);
    st.res.set({ at: V(x, 0, z), facing: Math.PI, pose: { kind: "walk", t, phase: walkPhase(dist), props: ["clipboard", null] }, expr: "neutral", blink: lidAt(t, 5) });
    return;
  }
  // at the front facing the class with the face-down answer stack; raises it f674-680, flips it f680-688
  const facing = wrap(lerp(Math.PI, 0.15, easeInOutCubic(lin(f, 656, 664))) + 0);
  const at = V(x, 0, z1);
  const ri = armOf(cam, at, facing, 1);
  const raise = easeOutCubic(lin(f, 674, 680)) * (1 - easeInOutCubic(lin(f, 700, 712)));
  const flip = f >= 680 && f < 688 ? Math.sin((Math.PI * (f - 680)) / 8) : 0;
  const aim: [ArmAim, ArmAim] = [null, null];
  aim[ri] = { dir: ri === 0 ? 180 - lerp(25, 80, raise) + 25 * flip : lerp(25, 80, raise) - 25 * flip, reach: 0.9 };
  const props: [HeldProp, HeldProp] = [null, null]; props[ri] = "card";
  st.res.set({ at, facing, pose: { kind: "hold", t, aim, props, card: f >= 684 ? "✓" : "" }, expr: "neutral", blink: lidAt(t, 5) });
}

// ===================================================================================================================
// crowd
// ===================================================================================================================
const EXPR_AFTER: Expr[] = ["neutral", "smile", "neutral", "happy", "deadpan", "smile"];
function crowdState(i: number, t: number, f: number, cam: THREE.Vector3, at: THREE.Vector3, facing: number): CrowdState {
  const r = ROLE[i], row = Math.floor(i / 12), blink = lidAt(t, i), tt = t + hash(i, 3) * 3;
  if (i === YOU || i === C1 || i === C2 || (i === STAR && f >= 888)) return { pose: { kind: "desk", t: tt }, visible: false };
  // segment A's H1 crowd: everyone writing, row 4 scribbling fast and smug (segA_class.ts crowdState)
  const writing = (): CrowdState => {
    const base = DEFAULT_CROWD(i, t);
    return WRITERS.has(i) ? { ...base, pose: { kind: "write", t: t * 2.4 + hash(i, 5) * 3 }, expr: "smug" } : { ...base, pose: { kind: "write", t: t + hash(i, 3) * 3 } };
  };
  if (r.ghostOnly) return f < 790 ? writing() : DEFAULT_CROWD(i, t);
  const up0 = 555 + 2.6 * row, k = easeOutCubic(lin(f, up0, up0 + 6));
  if (k <= 0) return writing();
  const lowF = 640 + Math.floor(hash(i, 7) * 30), kl = easeInOutCubic(lin(f, lowF, lowF + 8));
  const ropeR = r.throwSide === 1 || r.recvSide === 1, ropeL = r.throwSide === -1 || r.recvSide === -1;
  if (!ropeR && !ropeL && kl >= 1) return DEFAULT_CROWD(i, t);
  const cardSide = ropeR && ropeL ? r.throwSide! : ropeR ? -1 : ropeL ? 1 : hash(i, 8) < 0.5 ? 1 : -1;
  const aims: [ArmAim, ArmAim] = [null, null], props: [HeldProp, HeldProp] = [null, null];
  for (const side of [1, -1]) {
    const arm = armOf(cam, at, facing, side), upD = upDir(i, side, arm);
    const restD = arm === 0 ? 255 : -75, isRope = side > 0 ? ropeR : ropeL;
    const kk = isRope ? k : k * (1 - kl);
    aims[arm] = { dir: lerp(restD, upD, kk), reach: lerp(0.8, 1, kk) };
    if (side === cardSide && kl < 0.6) props[arm] = "card";
  }
  let expr: Expr = f < 700 ? (hash(i, 9) < 0.55 ? "grin" : "smile") : EXPR_AFTER[Math.floor(hash(i, 2) * EXPR_AFTER.length)];
  if (r.flopF && f >= r.flopF + 3 && f < 760) expr = "shock";
  return { pose: { kind: "hold", t: tt, aim: aims, props, base: "seat" }, expr, blink };
}

// ===================================================================================================================
// overlays
// ===================================================================================================================
/** the arc length from C2's hand of the G2 point nearest (62 %, 84 %) of the C2_BEHIND frame (G2 is still by then; all of
 *  it lies at y >= 70 % there, so the tag is lifted on its leader to y 54 %, clear of YOU and of the caption band) */
function chipMStar(w: World, r: Rope): number {
  const cam = new THREE.PerspectiveCamera(C2_BEHIND.fov, (w.camera as THREE.PerspectiveCamera).aspect, 0.05, 100);
  cam.position.set(...(C2_BEHIND.pos as Vec3)); cam.lookAt(...(C2_BEHIND.look as Vec3)); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  let best = 0.8, bs = 1e9;
  for (let m = 0.5; m <= Math.min(5.2, r.length); m += 0.1) {
    const q = g2PointFromHand(r, m).clone().project(cam), x = (q.x + 1) / 2, y = (1 - q.y) / 2, sc = (x - 0.62) ** 2 + (y - 0.84) ** 2;
    if (sc < bs) { bs = sc; best = m; }
  }
  return best;
}
/** the point on G2 `m` metres of rope from C2's hand */
function g2PointFromHand(r: Rope, m: number) { return r.pointAt(Math.min(1, m / Math.max(1e-3, r.length))); }
/** a 2D "?" / "!" popping above a figure's head (pop at `at`, 6-frame exit from `out`: fade + 30 px rise) */
function popMark(w: World, fig: Figure, f: number, at: number, out: number, text: string, key: string): React.ReactNode {
  if (!fig.sv) return null;
  const hw = fig.headWorld(); hw.y += fig.headR + 0.2;
  const p = w.project(hw); if (!p.front) return null;
  const s = pop(f, at, 5, 1.12), ex = easeInCubic(lin(f, out, out + 6));
  const style: React.CSSProperties = text === "!" ? { ...ts(132, COL.ink), WebkitTextStroke: `14px ${COL.gold}` } as React.CSSProperties : ts(132, COL.gold, 15);
  return h("div", { key, style: { position: "absolute", left: p.x + 30, top: p.y - 30 * ex, width: 0, height: 0, opacity: 1 - ex } },
    h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%, -100%) scale(${s}) rotate(${text === "?" ? 8 : -6}deg)`, transformOrigin: "50% 100%", ...style } }, text));
}
/** the sweat drop at YOUR left temple (screen side away from the "!") */
function sweatDrop(w: World, fig: Figure, f: number, at: number, out: number): React.ReactNode {
  if (!fig.sv) return null;
  const hw = fig.headWorld(), p = w.project(hw), e = w.project(hw.clone().add(V(0, fig.headR, 0)));
  if (!p.front) return null;
  const rad = Math.abs(p.y - e.y), s = pop(f, at, 5, 1.15), ex = easeInCubic(lin(f, out, out + 6));
  return h("svg", { key: "sweat", width: 80, height: 100, viewBox: "-40 -50 80 100", style: { position: "absolute", left: p.x - 1.15 * rad - 40, top: p.y - 0.35 * rad - 50 - 20 * ex, opacity: 1 - ex, transform: `scale(${s})`, overflow: "visible" } },
    h("path", { d: "M0,-34 C10,-14 22,2 22,16 C22,30 12,38 0,38 C-12,38 -22,30 -22,16 C-22,2 -10,-14 0,-34 Z", fill: "#9fd4ff", stroke: COL.ink, strokeWidth: 6, strokeLinejoin: "round" }),
    h("path", { d: "M-9,10 C-10,18 -6,25 0,27", fill: "none", stroke: "#ffffff", strokeWidth: 5, strokeLinecap: "round" }));
}

// ===================================================================================================================
// dbg: projections, 穿模 (ropes vs set boxes / torsos / heads; the camera vs everything), timing
// ===================================================================================================================
const KEYF = new Set([536, 552, 575, 590, 606, 629, 672, 690, 697, 715, 742, 758, 789, 793, 805, 815, 816, 827, 836, 848, 858, 870, 887, 888, 900, 915, 930, 945, 958, 970, 980, 990, 1000, 1012]);
function boxDist(p: THREE.Vector3, b: THREE.Box3) { return b.distanceToPoint(p); }
function debug(w: World, st: St, f: number, cam: CamPose, camP: THREE.Vector3, t0: number) {
  if (!KEYF.has(f)) return;
  const C = w.classroom, sb = st.seats;
  const L = (s: string) => console.log(`[segB f${f}] ${s}`.slice(0, 290));
  const you = st.you;
  L(`pose ${Math.round(performance.now() - t0)} ms; cam (${(cam.pos as Vec3).map((v) => v.toFixed(2))}) fov ${cam.fov.toFixed(1)}; redrawn ${C.crowd.redrawn}`);
  if (you.sv) L(`YOU head ${pctOf(w, you.headWorld())} hands ${pctOf(w, you.handWorld(0))} ${pctOf(w, you.handWorld(1))} knot ${pctOf(w, st.knot)} C1grip ${pctOf(w, st.c1.handWorld(0))}/${pctOf(w, st.c1.handWorld(1))}`);
  L(`G2 end ${pctOf(w, G2_PATH[G2_PATH.length - 1])} C2 hands ${st.c2.sv ? pctOf(w, st.c2.handWorld(0)) + pctOf(w, st.c2.handWorld(1)) : "-"} RES ${st.res.sv ? pctOf(w, st.res.headWorld()) : "-"} chip ${pctOf(w, g2PointFromHand(st.g2, 0.8))}`);
  // camera clearance
  let mb = 9, mh = 9, mr = 9, mrWho = "";
  for (const b of sb.boxes) mb = Math.min(mb, boxDist(camP, b));
  for (const c of sb.cyls) { const dy = camP.y < c.y0 ? c.y0 - camP.y : camP.y > c.y1 ? camP.y - c.y1 : 0; mh = Math.min(mh, Math.hypot(Math.max(0, Math.hypot(camP.x - c.x, camP.z - c.z) - c.r), dy)); }
  const ropes: [string, Rope][] = [["Y3", st.y3], ["Y5", st.y5], ["G2", st.g2], ...st.heroes.map((H) => [`${H.k}${H.h}-${H.t}`, H.rope] as [string, Rope])];
  for (const [nm, r] of ropes) if (r.mesh.visible) for (const p of r.points) { const d = p.distanceTo(camP) - r.r; if (d < mr) { mr = d; mrWho = nm; } }
  const wall = Math.min(5.8 - Math.abs(camP.x), 6 - Math.abs(camP.z), camP.y, 3.2 - camP.y);
  L(`camClear box ${mb.toFixed(2)} body ${mh.toFixed(2)} rope ${mr.toFixed(2)} (${mrWho}) wall ${wall.toFixed(2)}`);
  // rope clearance: worst obstacle per rope, labelled (desk/chair box of seat k, torso/head cylinder of seat k)
  const nDesk = 7 * 6 * 3;
  const lab = (kind: "b" | "c", k: number) => kind === "c" ? `${k % 2 ? "head" : "torso"}${Math.floor(k / 2)}` : k < nDesk ? `desk${Math.floor(k / 3)}` : `chair${Math.floor((k - nDesk) / 6)}.${(k - nDesk) % 6}`;
  const hits: string[] = [];
  for (const [nm, r] of ropes) {
    if (!r.mesh.visible || r.points.length < 2) continue;
    let worst = 0, who = "", n = 0; const q = V(), pts = r.points;
    for (let i = 1; i < pts.length; i++) {
      const m = Math.max(1, Math.ceil(pts[i].distanceTo(pts[i - 1]) / 0.03));
      for (let j = 0; j < m; j++) {
        q.copy(pts[i - 1]).lerp(pts[i], j / m);
        sb.boxes.forEach((b, k) => { const e = r.r; const dx = Math.min(q.x - (b.min.x - e), b.max.x + e - q.x), dy = Math.min(q.y - (b.min.y - e), b.max.y + e - q.y), dz = Math.min(q.z - (b.min.z - e), b.max.z + e - q.z);
          if (dx > 0 && dy > 0 && dz > 0) { n++; const d = Math.min(dx, dy, dz); if (d > worst) { worst = d; who = lab("b", k); } } });
        sb.cyls.forEach((c, k) => { if (q.y < c.y0 || q.y > c.y1) return; const d = c.r + r.r - Math.hypot(q.x - c.x, q.z - c.z); if (d > 0) { n++; if (d > worst) { worst = d; who = lab("c", k); } } });
      }
    }
    if (n) hits.push(`${nm}:${n}/${(worst * 100).toFixed(1)}cm@${who}`);
  }
  for (let k = 0; k < hits.length; k += 6) L(`ropeHits ${hits.slice(k, k + 6).join(" ")}`);
  if (!hits.length) L("ropeHits none");
  if (you.sv) { const fmt = (v: THREE.Vector3) => v.toArray().map((x) => x.toFixed(2)).join(","); L(`YOU hands world ${fmt(you.handWorld(0))} | ${fmt(you.handWorld(1))} fist target ${fmt(st.h1.lf)}`); }
  { const i = 49, s0 = C.crowdSeats[i].top, a0 = C.crowd.handWorld(i, 0), a1 = C.crowd.handWorld(i, 1); L(`seat49 hip ${s0.toArray().map((x) => x.toFixed(2))} hand0 ${a0.toArray().map((x) => x.toFixed(2))} hand1 ${a1.toArray().map((x) => x.toFixed(2))}`); }
  for (const [nm, fig] of [["you", you], ["c1", st.c1], ["c2", st.c2]] as [string, Figure][]) {
    if (!fig.sv || fig.st.visible === false) continue;
    const cc = cardClearance(fig, sb.boxes, 32);
    if (cc.hits) L(`card ${nm} hits ${cc.hits} worst ${(cc.worst * 100).toFixed(1)}cm at ${cc.at ? cc.at.toArray().map((v) => v.toFixed(2)) : ""}`);
  }
}
