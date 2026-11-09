// Segment A, classroom half: S03 (f225-355, "研究者真测过": 84 people) and S04 (f356-535, 0-5 / 3+ = friend / 再猜),
// ending on hand-off H1. Builder A's helper file (owned with shots/segA.ts). Pure functions of the frame.
//
// Re-fit to the 84-seat room (world.ts roles): YOU = seat 41 (row 3, centre block, hip (-0.558, .472, 1.048)), the
// window-side aisle x -1.98 is on YOUR left, C1 = seat 42 (the next desk to your right), STAR 43, RES walks the aisle.
// S03  f225-234  close over your desk (storyboard pos SEAT + (0.43, 1.45, 0.30)), pitch -38 -> -48 deg easeOutCubic,
//                continuing the dorm tilt; the rope end falls into frame from the top (f225-229) onto your desk 6 cm
//                right of the sheet and coils (hops f229-234). The room is empty (desks, sheets, laptops).
//      f236-330  crane up and back over the window-side aisle to E (2.6 m, 0.6 under the ceiling), easeInOutCubic;
//                f330-355 a 0.15 m drift back.
//      people    YOU pop at f279 (0 -> 1.08 -> 1, 5 f) with the 你 tag (f279-330); the other 83 pop f283-322 front to
//                back (~2 per frame); the counter 人 (Ticker, 50 % / 14 %) shows 1 at f279 and counts the pops, 84 lands
//                on f322 and exits f350. RES enters at the front at f300 with her clipboard, walks the aisle z -3.0 ->
//                0.9 over f325-373 (she stays there, facing the front: H1), rows start writing as she passes (from f346).
// S04  f356-388  push-in over the aisle (> 0.6 m over RES's head), over YOUR left shoulder, down onto the sheet (MACRO,
//                row 1's 0-5 boxes ~80 % of the frame width at y ~30-40 %); f388-462 MACRO with a 2 cm drift.
//      ink       YOUR arm and the hero pen enter from the lower right (f386-396), circle the 3 in row 1 (f396-408) and the
//                5 in row 2 (f432-446). f410: the coiled rope end snaps into the circled 3 and shoots out left as Y3
//                (thin gold) to RAD_TIE (the riser behind row 3, wrapped there) f410-424; f448: Y5 (thick gold) sprouts
//                from the circled 5 and shoots right to C1's desk f448-460, twang f458. Labels 3 = 朋友 (34 %, 24 %, f412)
//                and 5 = 最好的朋友之一 (60 %, 46 %, f450) on leader lines, both out f456-462.
//      f462-494  rise to OTS_YOU (storyboard formula) easeInOutCubic past the right of YOUR head; YOUR left hand takes the
//                near ends of Y3 / Y5 (f466-472); gold underline under 我猜他给我 (f470-480, on the sheet); 5, 5, 4, 5
//                written f496 / 502 / 508 / 514; smile -> smug f515; C1 and row 4 scribble fast and smug from f505.
//      f494-526  5 cm push into OTS_YOU (ease-out), static f526-535 = H1.
// The arm that writes in MACRO is a small 3D sleeve + hand (YOUR card is behind the macro camera); from f488 the card's
// own right arm takes the pen (same shoulder and grip points), so H1 is the plain card pose segment B continues.
import React from "react";
import * as THREE from "three";
import { getInputProps } from "remotion";
import type { CamPose, Pose, Vec3 } from "../story";
import { FPS, h, lerp, lin, clamp01, smooth, hash, pop, easeOutCubic, easeInOutCubic, easeOutQuad, easeInQuad } from "../story";
import { LOOK, youTag, DEFAULT_CROWD, type World } from "../world";
import { lidAt, walkPhase, type Figure, type CrowdState } from "../kit/cast";
import { ropeMotion, ropeRadius, type Rope } from "../kit/rope";
import type { Expr } from "../kit/toon";
import { Ticker, RopeChip } from "../kit/overlay";
import { heroSheetApply, heroSheetRestore, inkAt, penAt, penPlace, penRest, penDir, penGrip, rightShoulder, sheetWorld, boxMM, leftFist, headerFontOk } from "./segA_sheet";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const DBG = !!(getInputProps() as { dbg?: boolean }).dbg;
const W_ = 1080, H_ = 1920;
const vec = (v: THREE.Vector3): Vec3 => [v.x, v.y, v.z];

// ===================================================================================================================
// acquired state
// ===================================================================================================================
let you: Figure | null = null, res: Figure | null = null;
let coil: Rope | null = null, y3: Rope | null = null, y5: Rope | null = null;
/** the macro writing arm (3D): upper arm + forearm sleeves and the hand, built once */
let arm: { group: THREE.Group; upper: THREE.Mesh; fore: THREE.Mesh; hand: THREE.Mesh } | null = null;
let popOrder: number[] = [];

// ===================================================================================================================
// places (from the classroom anchors)
// ===================================================================================================================
const seatOf = (w: World) => w.classroom.A.seats[w.classroom.roles.you];
/** the floor point under YOUR hip (the storyboard's SEAT_YOU) */
const seatFloor = (w: World) => w.classroom.roles.floor(w.classroom.roles.you);
/** storyboard OTS_YOU: SEAT_YOU + (0.30, 1.40, 0.55) looking at SEAT_YOU + (-0.05, 0.60, -0.45), fov 55 (H1) */
export function otsYou(w: World): CamPose {
  const s = seatFloor(w);
  return { pos: [s.x + 0.3, 1.4, s.z + 0.55], look: [s.x - 0.05, 0.6, s.z - 0.45], fov: 55 };
}
/** MACRO: over the sheet's first rows from YOUR side (the header toward the top of the frame) */
function macro(w: World): CamPose {
  const T = sheetWorld(w, [131, 101], 0), P = sheetWorld(w, [131, 101 + 72], 0.2);
  return { pos: vec(P), look: vec(T), fov: 40 };
}
/** the S03 opening camera: storyboard pos SEAT + (0.43, 1.45, 0.30), looking toward the sheet / the rope's landing */
function openCam(w: World, pitchDeg: number): CamPose {
  const s = seatFloor(w), pos = V(s.x + 0.43, 1.45, s.z + 0.3), tgt = sheetWorld(w, [262, 150], 0);
  const hd = tgt.clone().sub(pos).setY(0).normalize(), p = (pitchDeg * Math.PI) / 180;
  return { pos: vec(pos), look: vec(pos.clone().add(hd.multiplyScalar(Math.cos(p))).add(V(0, Math.sin(p), 0))), fov: 50 };
}
/** the S03 crane's end: over the window-side aisle at the back, 0.6 m under the ceiling, the rows ahead */
const CRANE_E: CamPose = { pos: [-1.55, 2.6, 5.35], look: [-0.75, 0.32, -1.3], fov: 64 };
/** where the coiled rope end lies: 6 cm right of the sheet's right edge */
const coilCentre = (w: World) => sheetWorld(w, [210 + 60 + 34, 150], 0);
/** the riser knot of Y3 and Y3's lane (world roles): behind row 3's chair backs at y 1.0 */
const LANE_IN = (w: World) => { const s = seatOf(w); return V(s.pos.x - 0.36, 1.0, w.classroom.roles.radiatorTie.z); };

// ===================================================================================================================
// camera
// ===================================================================================================================
/** yaw / pitch of a look direction */
const angles = (c: CamPose) => {
  const p = V(...(c.pos as Vec3)), l = V(...(c.look as Vec3)), d = l.sub(p).normalize();
  return { yaw: Math.atan2(d.x, d.z), pitch: Math.asin(d.y) };
};
const fromAngles = (pos: THREE.Vector3, yaw: number, pitch: number, fov: number): CamPose =>
  ({ pos: vec(pos), look: vec(pos.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)))), fov });
const unwrap = (a: number, ref: number) => { let x = a; while (x - ref > Math.PI) x -= 2 * Math.PI; while (x - ref < -Math.PI) x += 2 * Math.PI; return x; };
/** Catmull-Rom through camera keys (pos and look as point curves), parameter u 0..1 */
function camPath(keys: CamPose[], u: number): CamPose {
  const pc = new THREE.CatmullRomCurve3(keys.map((k) => V(...(k.pos as Vec3))), false, "centripetal");
  const lc = new THREE.CatmullRomCurve3(keys.map((k) => V(...(k.look as Vec3))), false, "centripetal");
  const n = keys.length - 1, x = clamp01(u) * n, i = Math.min(n - 1, Math.floor(x)), fov = lerp(keys[i].fov, keys[i + 1].fov, smooth(x - i));
  return { pos: vec(pc.getPoint(clamp01(u))), look: vec(lc.getPoint(clamp01(u))), fov };
}
export function classCam(w: World, f: number): CamPose {
  // (pitch -38 -> -48: the sheet sits at ~50 % of the height on the cut, above the caption band, and rises to ~30 %)
  if (f <= 235) return openCam(w, lerp(-38, -48, easeOutCubic(lin(f, 225, 234))));
  const S = openCam(w, -48);
  if (f <= 330) {
    // crane: position on a slight arc (rises early), direction by yaw / pitch so the look never swings through the floor
    const u = easeInOutCubic(lin(f, 236, 330)), a = angles(S), b = angles(CRANE_E);
    const P0 = V(...(S.pos as Vec3)), P1 = V(...(CRANE_E.pos as Vec3));
    const pos = P0.clone().lerp(P1, u); pos.y = lerp(P0.y, P1.y, Math.min(1, u * 1.25));
    return fromAngles(pos, lerp(a.yaw, unwrap(b.yaw, a.yaw), u), lerp(a.pitch, b.pitch, u), lerp(S.fov, CRANE_E.fov, u));
  }
  const E = endS03();
  if (f <= 355) {
    const u = lin(f, 330, 355), P = V(...(CRANE_E.pos as Vec3)), L = V(...(CRANE_E.look as Vec3)), back = P.clone().sub(L).setY(0).normalize().multiplyScalar(0.15 * u);
    return { pos: vec(P.add(back)), look: vec(L.add(back)), fov: CRANE_E.fov };
  }
  const M = macro(w);
  if (f <= 388) {
    // push-in: down from the crane over the window-side rows (y >= 2.05, > 0.6 m over RES's head), over YOUR head
    // (0.85 m above it, never beside the face) and straight down onto the sheet
    const sh = sheetWorld(w, [131, 101], 0);
    const K1: CamPose = { pos: [-1.4, 2.3, 2.4], look: [-0.7, 0.75, 0.45], fov: 56 };
    // (K2 sits over the sheet itself, so the chair and as little of YOUR edge-on card as possible are in frame: the
    // cards turn only in yaw, so from straight above a figure is a sliver)
    const K2: CamPose = { pos: [sh.x, 2.0, sh.z + 0.07], look: vec(sh.clone().add(V(0, 0, -0.03))), fov: 40 };
    const K3: CamPose = { pos: vec(sh.clone().add(V(0.0, 0.42, 0.09))), look: vec(sh), fov: 40 };
    return camPath([E, K1, K2, K3, M], easeInOutCubic(lin(f, 356, 388)));
  }
  const drift = (g: number) => { const u = lin(g, 388, 462), d = V(0.008, -0.014, -0.006).multiplyScalar(u); return { pos: vec(V(...(M.pos as Vec3)).add(d)), look: vec(V(...(M.look as Vec3)).add(d.clone().multiplyScalar(0.5))), fov: M.fov }; };
  if (f <= 462) return drift(f);
  const O = otsYou(w), Op = V(...(O.pos as Vec3)), dir = V(...(O.look as Vec3)).sub(Op).normalize();
  const O5: CamPose = { ...O, pos: vec(Op.clone().addScaledVector(dir, -0.05)), look: vec(V(...(O.look as Vec3)).addScaledVector(dir, -0.05)) };
  if (f <= 494) {
    // rise past the right of YOUR head (head ~(-0.56, 1.15, 1.0)) to 5 cm short of OTS_YOU
    const s = seatOf(w).pos;
    const R1: CamPose = { pos: [s.x + 0.3, 1.2, s.z - 0.2], look: vec(sheetWorld(w, [150, 110], 0)), fov: 50 };
    return camPath([drift(462), R1, O5], easeInOutCubic(lin(f, 462, 494)));
  }
  if (f < 526) { const u = easeOutQuad(lin(f, 494, 526)); return { pos: vec(V(...(O5.pos as Vec3)).lerp(Op, u)), look: vec(V(...(O5.look as Vec3)).lerp(V(...(O.look as Vec3)), u)), fov: O.fov }; }
  return O;
}
const endS03 = (): CamPose => {
  const P = V(...(CRANE_E.pos as Vec3)), L = V(...(CRANE_E.look as Vec3)), back = P.clone().sub(L).setY(0).normalize().multiplyScalar(0.15);
  return { pos: vec(P.add(back)), look: vec(L.add(back)), fov: CRANE_E.fov };
};

// ===================================================================================================================
// people
// ===================================================================================================================
const POP_YOU = 279, POP0 = 283, POP1 = 322;
/** the frame classmate i pops in (front -> back, then across) */
const popAt = (i: number) => { const r = popOrder.indexOf(i); return POP0 + Math.floor((r * (POP1 - POP0)) / Math.max(1, popOrder.length - 1)); };
/** RES's floor point and facing at frame f */
function resAt(w: World, f: number): { at: THREE.Vector3; facing: number; walking: boolean; dist: number } {
  const P = w.classroom.roles.resPath, x = w.classroom.roles.aisleX, front = P[0];
  const A = V(x + 1.05, 0, front.z), B = V(x, 0, front.z), C = V(x, 0, -3.0), D = V(x, 0, 0.9);
  const ab = A.distanceTo(B), bc = B.distanceTo(C), cd = C.distanceTo(D);
  if (f < 325) {
    const u = lin(f, 300, 325), s = u * (ab + bc);
    const at = s < ab ? A.clone().lerp(B, s / ab) : B.clone().lerp(C, (s - ab) / bc);
    const dir = s < ab ? B.clone().sub(A) : C.clone().sub(B);
    return { at, facing: Math.atan2(dir.x, dir.z), walking: true, dist: s };
  }
  if (f < 373) { const u = lin(f, 325, 373); return { at: C.clone().lerp(D, u), facing: 0, walking: true, dist: ab + bc + u * cd }; }
  // stopped at z 0.9, turning to face the front (H1)
  const k = smooth(lin(f, 373, 380));
  return { at: D.clone(), facing: lerp(0, Math.PI, k), walking: false, dist: ab + bc + cd };
}
/** the frame row r starts writing: as RES passes it (from f346), rows behind her follow the wave */
function writeAt(w: World, row: number): number {
  const rz = w.classroom.A.seats[row * 12].pos.z;
  const pass = 325 + ((rz - -3.0) / (0.9 - -3.0)) * 48;
  return Math.max(346, Math.round(row <= 3 ? pass : 373 + (row - 3) * 6));
}
function crowdState(w: World, f: number) {
  const R = w.classroom.roles, scribble = new Set<number>([R.c1, ...Array.from({ length: 12 }, (_, k) => 48 + k)]);
  return (i: number, t: number): CrowdState => {
    if (i === R.you) return { pose: { kind: "desk", t }, visible: false };
    const pa = popAt(i);
    if (f < pa) return { pose: { kind: "desk", t }, visible: false, scale: 0 };
    const base = DEFAULT_CROWD(i, t), row = Math.floor(i / 12);
    let pose = base.pose, expr = base.expr as Expr;
    if (f >= writeAt(w, row)) pose = { kind: "write", t: t + hash(i, 3) * 3 };
    if (f >= 505 && scribble.has(i)) { pose = { kind: "write", t: t * 2.4 + hash(i, 5) * 3 }; expr = "smug"; }
    return { ...base, pose, expr, scale: pop(f, pa) };
  };
}

// ===================================================================================================================
// the 3D writing arm (MACRO)
// ===================================================================================================================
function buildArm(): NonNullable<typeof arm> {
  const look = LOOK.you as unknown as { topCol?: string; skin?: string };
  const sleeve = new THREE.MeshBasicMaterial({ color: new THREE.Color(look.topCol ?? "#3567b8") });
  const skin = new THREE.MeshBasicMaterial({ color: new THREE.Color(look.skin ?? "#f2c9a0") });
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 12); cyl.translate(0, 0.5, 0);
  const upper = new THREE.Mesh(cyl, sleeve), fore = new THREE.Mesh(cyl, sleeve), hand = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), skin);
  const group = new THREE.Group(); group.name = "segA:writingArm"; group.add(upper, fore, hand);
  for (const m of [upper, fore, hand]) { m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false; }
  return { group, upper, fore, hand };
}
/** a limb cylinder from a to b with radius r */
function limb(m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3, r: number) {
  const d = b.clone().sub(a), L = d.length();
  m.position.copy(a); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); m.scale.set(r, L, r);
}
/** shoulder -> elbow (bent out and down) -> hand at the grip */
function poseArm(shoulder: THREE.Vector3, grip: THREE.Vector3) {
  const A = arm!, mid = shoulder.clone().lerp(grip, 0.5), elbow = mid.add(V(0.07, -0.08, 0.02));
  limb(A.upper, shoulder, elbow, 0.008); limb(A.fore, elbow, grip, 0.0075);
  A.hand.position.copy(grip); A.hand.scale.setScalar(0.0085);
  A.group.visible = true;
}

// ===================================================================================================================
// pose
// ===================================================================================================================
export function poseClass(w: World, f: number): Pose {
  const C = w.classroom, R = C.roles, t = f / FPS, seat = seatOf(w);
  // a. camera
  const cam = classCam(w, f);
  w.setCamera(cam);
  // b. state: daylight defaults (ceiling on, windows shut), our sheet with the ink of this frame
  C.set.setCeilingOpen(0); C.set.setWindowOpen(0); C.set.animate(t);
  heroSheetApply(w, inkAt(f));

  // the pen: lying where the set put it, or in YOUR hand (S04)
  const pa = penAt(f), held = pa.held && f >= 386;
  // in MACRO the pen leans flat to YOUR right and the hand grips it 7.5 cm up (the tip and the ink stay clear, the hand
  // stays out at the frame's right edge); over the rise (f462-488) both blend to the H1 hold segment B starts from
  const mb = 1 - smooth(lin(f, 462, 488));
  const tip = sheetWorld(w, pa.mm, pa.lift + 0.0008), sho = rightShoulder(w);
  const pdir = penDir(tip, sho, { side: 1.2 * mb, flat: lerp(0.62, 0.85, mb), up: lerp(0.78, 0.5, mb) }), grip = penGrip(tip, pdir, lerp(0.032, 0.075, mb));
  if (held) penPlace(w, tip, pdir); else penRest(w);
  const armFrom3D = held && f < 488;
  if (armFrom3D) poseArm(sho, grip); else arm!.group.visible = false;

  // c. people
  // YOU: pop at f279, seated at seat 41; from S04 the right hand on the pen (card arm from f488), left fist takes the ropes
  const Y = you!, so = C.seatOf(R.you), fist = leftFist(w);
  const youExpr: Expr = f >= 515 ? "smug" : f >= 410 ? "smile" : "neutral";
  if (f < POP_YOU) Y.set({ ...so, pose: { kind: "desk", t }, visible: false });
  else if (f < 462) Y.set({ ...so, pose: { kind: "desk", t }, expr: youExpr, blink: lidAt(t, 1), scale: pop(f, POP_YOU) });
  else {
    // the card arm 1 hides behind the torso while the 3D arm writes, then takes the pen at its grip
    const hidden = seat.pos.clone().add(V(0.02, 0.12, -0.22));
    const lf = f < 466 ? hidden.clone().add(V(-0.1, 0.05, 0)) : seat.pos.clone().add(V(-0.12, 0.25, -0.12)).lerp(fist, smooth(lin(f, 466, 472)));
    Y.set({ ...so, pose: { kind: "hold", t, base: "seat" }, aimAt: [lf, armFrom3D ? hidden : grip], expr: youExpr, blink: lidAt(t, 1) });
  }
  // RES
  const r = resAt(w, f);
  if (f < 300) res!.set({ at: r.at, facing: r.facing, pose: { kind: "idle", t }, visible: false });
  else if (r.walking) res!.set({ at: r.at, facing: r.facing, pose: { kind: "walk", phase: walkPhase(r.dist), t, props: ["clipboard", null] }, expr: "neutral", blink: lidAt(t, 5) });
  else res!.set({ at: r.at, facing: r.facing, pose: { kind: "idle", t, props: ["clipboard", null] }, expr: "neutral", blink: lidAt(t, 5) });
  // the class
  C.crowd.state = crowdState(w, f);
  // d. solve
  C.update(t);

  // e. ropes
  // seen from the macro camera (20 cm off the paper) the score radii would be fingers across the boxes: Y3 / Y5 (and
  // the coil's whip) start as thin gold lines from the ink (r 2 / 4.5 mm) and swell to their score radii over the rise
  const grow = smooth(lin(f, 462, 494));
  coil!.setRadius(f >= 388 ? 0.002 : ropeRadius(3));
  y3!.setRadius(lerp(0.002, ropeRadius(3), grow)); y5!.setRadius(lerp(0.0045, ropeRadius(5), grow));
  const cc = coilCentre(w), r3 = coil!.r;
  // S03 f225-409: the dorm rope's end falls in, coils beside the sheet (2 hops), lies there
  if (f < 414) {
    // a loose spiral (the rope kit fillets every via by 3.5 cm, so the loop is drawn through 4 widely spaced points)
    const n = 5, land = lin(f, 225, 229), hop = f >= 229 ? 0.016 * Math.abs(Math.sin(((f - 229) / 5) * 2 * Math.PI)) * Math.exp(-(f - 229) / 3) : 0;
    const drop = (1 - land) * (1 - land) * 0.32;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= n; k++) {
      const u = k / n, a = 0.4 + u * 1.55 * 2 * Math.PI, rad = 0.032 + 0.03 * u;
      // the coil stands up as a helix while it falls (from the top of the frame) and lies flat once it has landed
      pts.push(cc.clone().add(V(Math.cos(a) * rad, r3 + 0.0006 + drop + (1 - land) * u * 0.16 + hop * (1 - u * 0.5), Math.sin(a) * rad)));
    }
    // f410-414: the end whips from the coil into the circled 3 (Y3 takes over)
    const sn = smooth(lin(f, 410, 414));
    const c3 = sheetWorld(w, boxMM(3, 0), r3 + 0.0009);
    const a = pts[n].clone().lerp(c3, sn);
    coil!.update({ a, b: pts[0], via: pts.slice(1, n).reverse(), floorY: 0.7506, gold: 1, reveal: 1 - sn, attachA: { kind: "end" }, attachB: { kind: "end" } });
    coil!.mesh.visible = f >= 225;
  } else coil!.mesh.visible = false;

  // Y3 (score 3): from the circled 3 (then YOUR left fist) over the desk's near edge, back between your chair and your
  // deskmate's, then level along the lane behind row 3's chair backs to the riser knot (out of frame left)
  const c3 = sheetWorld(w, boxMM(3, 0), y3!.r + 0.0009), c5 = sheetWorld(w, boxMM(5, 1), y5!.r + 0.0009);
  const take = smooth(lin(f, 466, 472)), fistR = fist.clone();
  const tie = R.radiatorTie.clone();
  if (f >= 410) {
    const n3 = c3.clone().lerp(fistR, take);
    const edge = V(seat.pos.x - 0.14, 0.7506 + y3!.r + 0.003, seat.pos.z - 0.322).lerp(V(seat.pos.x - 0.28, 0.86, seat.pos.z - 0.12), take);
    const gap = V(seat.pos.x - 0.31, 0.93, seat.pos.z + 0.02), lane = LANE_IN(w);
    const th = ropeMotion.throwRope((f - 410) / FPS, { dur: 14 / FPS });
    y3!.update({ a: n3, b: tie, via: [edge, gap, lane], slack: 0.02, floorY: 0.7506, gold: 1, reveal: th.reveal, glint: th.glint, glintAmt: th.glintAmt,
      attachA: { kind: "end" }, attachB: { kind: "knot", postR: 0.014, turns: 2, tail: 0.04, axis: V(0, 1, 0) } });
    y3!.mesh.visible = true;
  } else y3!.mesh.visible = false;
  // Y5 (score 5): from the circled 5 (then YOUR left fist) lying along the desk tops to C1's desk
  if (f >= 448) {
    const n5 = c5.clone().lerp(fistR, take), end = V(seat.pos.x + 0.5, 0.7506, seat.pos.z - 0.44);
    const th = ropeMotion.throwRope((f - 448) / FPS, { dur: 12 / FPS });
    const tw = ropeMotion.twang((f - 458) / FPS, { from: 0, amp: 0.007, freq: 8, decay: 0.12 });
    const span = n5.distanceTo(end);
    y5!.update({ a: n5, b: end, floorY: 0.7506, slack: 0.012 * span + (f >= 458 ? tw.slack : 0), vib: f >= 458 ? tw.vib : 0, vib2: f >= 458 ? tw.vib2 : 0, gold: 1,
      reveal: th.reveal, glint: f >= 458 ? tw.glint : th.glint, glintAmt: f >= 458 ? tw.glintAmt : th.glintAmt, attachA: { kind: "end" }, attachB: { kind: "end" } });
    y5!.mesh.visible = true;
  } else y5!.mesh.visible = false;

  // f. overlays
  const nodes: React.ReactNode[] = [];
  if (f >= POP_YOU && f < 331) nodes.push(youTag(w, Y, { f, at: POP_YOU, out: 324 }));
  if (f >= POP_YOU && f < 360) {
    const n = 1 + popOrder.filter((i) => popAt(i) <= f).length;
    nodes.push(h(Ticker, { key: "tk", at: POP_YOU, out: 350, x: 540, y: 0.14 * H_, scale: 0.8, value: Math.min(84, n), to: 84, landAt: POP1, unit: "人" }));
  }
  if (f >= 412 && f < 464) {
    const q3 = w.project(c3), q5 = w.project(c5);
    const k = 56 / 52;
    nodes.push(h(RopeChip, { key: "l3", at: 412, out: 456, x: q3.x, y: q3.y, text: "3 = 朋友", tone: "gold", scale: k, dx: (0.34 * W_ - q3.x) / k, dy: (0.24 * H_ - q3.y) / k }));
    if (f >= 450) nodes.push(h(RopeChip, { key: "l5", at: 450, out: 456, x: q5.x, y: q5.y, text: "5 = 最好的朋友之一", tone: "gold", scale: k, dx: (0.6 * W_ - q5.x) / k, dy: (0.46 * H_ - q5.y) / k }));
  }

  if (DBG && [225, 229, 234, 279, 300, 322, 330, 355, 372, 388, 400, 410, 424, 448, 458, 462, 470, 480, 490, 494, 514, 526, 535].includes(f)) debugClass(w, f, { c3, c5, tip });
  // depth of field: close shots focus on the paper
  const ph = w.camera.position, focusOn = f >= 388 ? tip : f <= 235 ? cc : null;
  const post = focusOn ? { dof: { focus: Math.max(0.12, ph.distanceTo(focusOn)), amount: f >= 388 && f < 470 ? 3 : 2 } } : undefined;
  return { scene: "classroom", camera: cam, overlays: nodes.length ? h(React.Fragment, null, ...nodes.map((n, i) => (n ? h(React.Fragment, { key: i }, n) : null))) : undefined, post };
}

/** dbg: projections of the key points (sheet rows, labels, YOUR head, RES), camera clearances, rope hits on the crowd */
function debugClass(w: World, f: number, p: { c3: THREE.Vector3; c5: THREE.Vector3; tip: THREE.Vector3 }) {
  const P = (v: THREE.Vector3) => { const q = w.project(v); return `(${Math.round((q.x / W_) * 100)}%,${Math.round((q.y / H_) * 100)}%${q.front ? "" : " behind"})`; };
  const C = w.classroom, R = C.roles, cp = w.camera.position;
  const row1L = sheetWorld(w, [98, boxMM(0, 0)[1]], 0), row1R = sheetWorld(w, [166, boxMM(0, 0)[1]], 0);
  const headY = you!.sv ? you!.headWorld() : V();
  console.log(`[segA f${f}] cam ${cp.toArray().map((v) => v.toFixed(2))} fov ${w.camera.fov.toFixed(0)} | row1 ${P(row1L)}..${P(row1R)} c3 ${P(p.c3)} c5 ${P(p.c5)} pen ${P(p.tip)} | you head ${P(headY)} dist ${cp.distanceTo(headY).toFixed(2)} | res ${res!.sv ? P(res!.headWorld()) : "-"} dist ${res!.sv ? cp.distanceTo(res!.headWorld()).toFixed(2) : "-"} | font ${headerFontOk}`);
  // the camera vs the nearest seated heads (S04 push / rise)
  let near = 9, who = -1;
  for (let i = 0; i < C.crowdSeats.length; i++) { const hd = C.crowdSeats[i].top.clone().add(V(0, 0.68, 0)); const d = hd.distanceTo(cp); if (d < near) { near = d; who = i; } }
  console.log(`[segA f${f}] nearest seated head to camera: seat ${who} ${near.toFixed(2)} m; ceiling clearance ${(3.2 - cp.y).toFixed(2)} m`);
  for (const [n, rp] of [["Y3", y3!], ["Y5", y5!], ["coil", coil!]] as [string, Rope][]) {
    if (!rp.mesh.visible) continue;
    // ropes vs the seated people (hip-to-head capsules of the cards' seats) other than YOU
    let hits = 0; const whoHit = new Set<number>();
    for (let k = 0; k < rp.points.length; k += 2) {
      const q = rp.points[k];
      for (let i = 0; i < C.crowdSeats.length; i++) {
        if (i === R.you) continue;
        const s = C.crowdSeats[i].top; if (Math.abs(q.x - s.x) > 0.2 || Math.abs(q.z - s.z) > 0.2) continue;
        if (q.y > s.y + 0.05 && q.y < s.y + 0.85) { hits++; whoHit.add(i); }
      }
    }
    console.log(`[segA f${f}] ${n} pts ${rp.points.length} body hits ${hits} seats ${[...whoHit].join(",")} a ${P(rp.points[0])} b ${P(rp.points[rp.points.length - 1])}`);
  }
}

// ===================================================================================================================
// enter / exit
// ===================================================================================================================
export function enterClass(w: World) {
  const C = w.classroom, R = C.roles;
  you = C.actors.acquire(LOOK.you);
  res = C.actors.acquire(LOOK.res);
  coil = C.ropes.acquire({ score: 3, gold: 1, seed: 51 });
  y3 = C.ropes.acquire({ score: 3, gold: 1, seed: 52 });
  y5 = C.ropes.acquire({ score: 5, gold: 1, seed: 53 });
  for (const r of [coil, y3, y5]) r.mesh.visible = false;
  if (!arm) arm = buildArm();
  C.scene.add(arm.group); arm.group.visible = false;
  // pop order: front row first, then back; inside a row from the window side
  popOrder = C.A.seats.map((s, i) => ({ i, k: Math.floor(i / 12) * 100 + s.pos.x })).filter((o) => o.i !== R.you).sort((a, b) => a.k - b.k).map((o) => o.i);
}
export function exitClass(w: World) {
  const C = w.classroom;
  if (you) C.actors.release(you);
  if (res) C.actors.release(res);
  coil?.setScore(3); y3?.setScore(3); y5?.setScore(5);
  for (const r of [coil, y3, y5]) if (r) C.ropes.release(r);
  you = res = null; coil = y3 = y5 = null;
  if (arm) { C.scene.remove(arm.group); arm.group.visible = false; }
  heroSheetRestore(w);
  C.crowd.state = DEFAULT_CROWD;
}
void easeInQuad;
