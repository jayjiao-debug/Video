// SEGMENT G, line G52: 黎明 · 江边, the boat leaves (PLAN 8G, script_v1_table 7). WP5 / segG. 5.4 s, ONE TAKE in her
// eyes from the muddy bank (RIVER.bank); nothing of her is drawn (PLAN 11.1: no mic, no hand; putHer is not called):
// her "wave" is a small happy BOUNCE of her camera (PLAN 11.2). THE CAMERA follows PLAN 12 (camera pass 2, the plan is
// /home/user/su_work/cam2/G_plan.md): still by default, two moves, each with a reason, landing on its frame.
//   pre      wide      the fade from blue-black to dawn is the HUD's (TRANSITIONS, BEAT.G.fadeIn). The small boat (prop
//                      "boat") is already pulling away from the landing along RIVER.boatPath, gathering way with each
//                      stroke of the stern oar: SU on the stern seat facing us (boatSeat; bamboo hat on), his right hand
//                      coming up off his knee into a gentle wave, smiling at his family on the bank (his eyes go to MAI,
//                      then to the kids); GUO behind him standing at the oar, sculling (guoHands with the oar's t). On
//                      the bank round her, seen from behind at the frame's edges (the FOREGROUND): MAI (left) waving,
//                      the two kids (right, one cheering with both arms, one waving), the yellow dog at the water's
//                      edge, tail wagging, watching the boat. Up on the far hill: the new house with its lantern (the
//                      set's). Her camera hops a little (a hop, no sway): she is waving with her other hand; the hop
//                      settles by his first word.
//   G52      shout     「荔枝熟了，替我多吃几颗！」 cheerful, shouting back across the water: his arm goes all the way up
//                      (ARM_UP) and he waves the WHOLE ARM in a wide arc beside his hat; she HOLDS the wide through 荔枝熟了
//                      (the whole-arm wave reads in the place), then M1 SNAPS IN on him (SNAP: 6 frames, fov 62 -> 24,
//                      size x2.1) landing on 替我's first frame: the turn of the joke; she keeps him that size as the
//                      boat draws off (his head about 29 % of the frame's width, eyes high); a pop on 荔枝, grin on 替我,
//                      a nod on 多吃, he laughs at his own joke on 几颗. GUO glances down at his father and laughs with
//                      him, still sculling.
//   after    far       M2 STEP BACK WIDE (STEP: 20 frames from G52's end): she steps back 0.6 m up the bank and zooms
//                      out to the scene's widest lens: the boat small on the river, the family's backs waving in the
//                      foreground, the far house with its lantern in the upper middle. Then she holds still (her aim
//                      fixed: she lets him go) while he is still waving, smaller. The INK WASH into H is the HUD's
//                      (BEAT.G.wipe, shared across the cut with segH).
// The dawn comes up through the take (river param dawn). Every frame from BEAT.G / lineId / capWord / SEGMENTS, every
// mark from layout/river.ts (RIVER, RIVER_SET: the family's marks are derived from RIVER.bank and the bank's edge).
import * as THREE from "three";
import { SEGMENTS, FPS, smooth, lerp, capWord, lineId, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU, GUO, MAI, KID, KID2 } from "../people";
import { RIVER, RIVER_SET, EYE, FOV } from "../layout";
import { boatSeat, dogGroundY } from "../props";
import { boatSwing, BOAT } from "../props/things";
import { transitionAt } from "../hud";
import { setSeat } from "../../../kit/acc/garb";
import { V, v3, rel, says, accent, heads, at, ky, lid, swaps, yawTo, standing, type RigState } from "./common";

type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[6], B = BEAT.G, T0 = S.from, PI = Math.PI, DEG = PI / 180;
const L52 = lineId("G52");
const word = (w: string) => capWord("G52", w).from;

// ------------------------------------------------------------------------------------------------ beats (looked up)
const WD = { lychee: word("荔枝"), forMe: word("替我"), eat: word("多吃"), few: word("几颗") };
/** his hand comes up off his knee into the small wave as the picture fades in (BEAT.G.fadeIn) */
const LIFT = [T0 + 2, B.fadeIn[1] + 4] as const;
/** his arm goes all the way up for the shout (10 frames before G52's first syllable) */
const ARM_UP = B.wave - 10;
/** M1, her snap zoom in on him: 6 frames, landing on 替我's first frame (the punch word) */
const SNAP = [WD.forMe - 6, WD.forMe] as const;
/** M2, her step back wide as the boat draws off: 20 frames from just after G52's last syllable */
const STEP = [L52.to + 1, L52.to + 21] as const;
/** the boat draws off: his face goes fond, GUO looks back at the bank (the acting's keys, as before the camera pass) */
const OFF = L52.to + 4;
/** her happy bounce (her "wave", PLAN 11.2): while the boat pulls off, settled by his first word */
const BOUNCE = [T0, WD.lychee] as const;

// ------------------------------------------------------------------------------------------------ the boat
const PATH = RIVER.boatPath.map((p) => v3(p));
const LEGS = PATH.slice(1).map((p, i) => p.distanceTo(PATH[i]));
/** the point at distance s along RIVER.boatPath (y 0: the boat's bottom ON the water's plane) */
const along = (s: number) => {
  let d = Math.max(0, s);
  for (let i = 0; i < LEGS.length; i++) { if (d <= LEGS[i] || i === LEGS.length - 1) return PATH[i].clone().lerp(PATH[i + 1], d / LEGS[i]); d -= LEGS[i]; }
  return PATH[PATH.length - 1].clone();
};
/** how far along the path the boat is: it left the landing a moment ago (S0 m out at the first frame), gathers way from
 *  V0 to V1 m/s by the end of G52 and holds it; each stroke of the oar (two a swing: props boatSwing at 0.4 Hz) gives a
 *  small surge */
const S0 = 0.5, V0 = 0.7, V1 = 1.8, ACC = (L52.to - T0) / FPS;
const boatS = (f: number) => {
  const t = (f - T0) / FPS, a = (V1 - V0) / ACC;
  const base = t < ACC ? S0 + V0 * t + 0.5 * a * t * t : S0 + V0 * ACC + 0.5 * a * ACC * ACC + V1 * (t - ACC);
  return base - 0.025 * Math.sin(2 * PI * 0.8 * t);
};
/** the boat's origin and its yaw (the bow along the way it goes: the path's direction smoothed over 1.6 m) */
const boatAt = (f: number) => {
  const s = boatS(f), p = along(s), d = along(s + 0.8).sub(along(s - 0.8));
  return { at: p, rot: Math.atan2(-d.x, -d.z) };
};
/** his head centre sitting on the stern seat (measured headless: 0.726 m over the seat's top, on its middle) */
const HEAD_UP = 0.726;
/** GUO's place at the oar, in the boat's frame (x to the boat's +x side, z toward the stern): boatSeat's BOAT.stand is
 *  0.30 m off the keel, where the hull's round bottom is only 0.36 m wide each side at the deck, so his feet (4.8 cm)
 *  and his robe's hem (11 cm) went through the +x side (measured with segG's hull probe); 0.18 keeps both inside,
 *  turned 0.45 rad toward the oar's handle (on his left) so his arms reach it in front of him */
const GUO_X = 0.18, GUO_Z = BOAT.stand.z - 0.03, GUO_TURN = 0.45;
/** SU sits 4 cm aft of the seat plank's middle (still on it: it is 0.26 m deep): with GUO 3 cm forward of his stand,
 *  SU's hat brim (0.45 m round his head: the rig's head is 0.25 m) stays clear of GUO's chin behind him */
const SEAT_AFT = 0.04;
/** SU's seat in the boat: boatSeat's, moved SEAT_AFT toward the stern */
const suSeat = (at: THREE.Vector3, rot: number) => {
  const Bs = boatSeat(at, rot), d = V(Math.sin(rot), 0, Math.cos(rot)).multiplyScalar(SEAT_AFT);
  return { ...Bs, at: Bs.at.clone().add(d), seat: { ...Bs.seat, top: Bs.seat.top.clone().add(d) } };
};
/** THE BOAT'S DECK BOARDS, TRIMMED: props/things.ts boat lays its deck as one straight box 0.78 m wide and 2.6 m long,
 *  but the round hull narrows to 0.46 m at the deck near both ends, so the boards stuck out 16 cm through each side at
 *  the stern (seen big in the zoom on him; requested from WP3 in requests.md). segG uses its own instance of the prop
 *  (w.prop("boat", "G"): its own geometry) and, once, pulls every vertex of its pieces that lies outside the hull
 *  below the rails (the deck boards, the seat plank's back corners, the seat legs' feet, and their outlines) in onto
 *  the hull's inside (the hull: an elliptic U section, half(z) wide at the rail's height sheer(z)) */
const hullHalf = (y: number, z: number) => {
  const u = Math.min(1, Math.max(0, (z + BOAT.len / 2) / BOAT.len)), s = Math.sin(PI * u), end = u < 0.5 ? s ** 0.6 : s ** 0.45;
  const half = (BOAT.w / 2) * end, sheer = BOAT.rail + 0.12 * (1 - s) ** 2, a = Math.min(1, Math.max(0, (1 - y / sheer) / 0.98));
  return half * Math.sqrt(1 - a * a);
};
const TRIMMED = new WeakSet<THREE.Object3D>();
const trimDeck = (g: THREE.Object3D) => {
  if (TRIMMED.has(g)) return;
  TRIMMED.add(g);
  for (const m of g.children) {
    const geo = (m as THREE.Mesh).isMesh ? (m as THREE.Mesh).geometry : null, P = geo?.attributes.position;
    if (!geo || !P) continue;                                    // (the oar is a group of its own: untouched)
    let moved = false;
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      if (y > 0.37 || y < 0.05) continue;                        // the rails and the awning stay; the hull's own bottom too
      const hw = hullHalf(y, z) - 0.004;
      if (Math.abs(x) > hw + 0.006) { P.setX(i, Math.sign(x) * hw); moved = true; }
    }
    if (moved) { P.needsUpdate = true; geo.computeBoundingBox(); geo.computeBoundingSphere(); }
  }
};
const headEst = (f: number) => { const b = boatAt(f); return suSeat(b.at, b.rot).seat.top.clone().add(V(0, HEAD_UP, 0)); };

// ------------------------------------------------------------------------------------------------ the family on the bank
/** derived from her mark (RIVER.bank) and the bank's edge (RIVER_SET.edge): MAI just inside the left edge of her wide
 *  framing, the kids at the right, the dog at the water's edge; all watch the boat (back views) */
const BANK = RIVER.bank, EDGE = RIVER_SET.edge;
const MAI_AT = V(BANK.x - 0.9, 0, EDGE + 0.95);
const KID_AT = [V(BANK.x + 0.5, 0, EDGE + 1.15), V(BANK.x + 0.5, 0, EDGE + 0.35)];
const DOG_AT = V(BANK.x - 0.45, 0, EDGE + 0.7);

// ------------------------------------------------------------------------------------------------ her camera
/** her lens on the bank (her eyes, 1.50 m), and where her step back takes it (STEP_BACK m up the bank, away from the
 *  water, STEP_SIDE m to the side) */
const POS = V(BANK.x + 0.05, EYE, BANK.z);
const STEP_BACK = 0.6, STEP_SIDE = -0.25;
const POS2 = POS.clone().add(V(STEP_SIDE, 0, STEP_BACK));
type Lens = { pos: THREE.Vector3; dir: THREE.Vector3; fov: number; dist: number };
/** the view direction from `from` that puts the world point `target` at screen (sx, sy) px of 1080 x 1920 (no roll):
 *  segC's aim, as a direction */
const aimDir = (from: THREE.Vector3, target: THREE.Vector3, sx: number, sy: number, fov: number) => {
  const d = target.clone().sub(from), hd = Math.hypot(d.x, d.z), t = Math.tan((fov * DEG) / 2);
  const f0 = V(d.x / hd, 0, d.z / hd), r0 = V(-f0.z, 0, f0.x);
  const dyaw = Math.atan((sx / 540 - 1) * t * (9 / 16)), pitch = Math.atan2(d.y, hd) - Math.atan((1 - sy / 960) * t);
  return f0.multiplyScalar(Math.cos(dyaw)).addScaledVector(r0, -Math.sin(dyaw)).multiplyScalar(Math.cos(pitch)).add(V(0, Math.sin(pitch), 0)).normalize();
};
/** his head smoothed over the last frames (her phone follows him with a little lag, never his strokes' surge) */
const headLag = (f: number) => { const p = V(); let ws = 0; for (let i = 0; i < 8; i++) { const wt = 8 - i; p.addScaledVector(headEst(f - i), wt); ws += wt; } return p.divideScalar(ws); };
/** WIDE (pre, G52's first half): the lens at 62; his head a little left of the middle, eyes high (the boat, the family
 *  at the edges, the far house near the top) */
const wide = (f: number): Lens => { const h = headLag(f); return { pos: POS, dir: aimDir(POS, h, 500, 700, FOV), fov: FOV, dist: h.distanceTo(POS) }; };
/** TELE (from 替我): her phone zoomed in on him; the zoom keeps the frame EXT m tall at his distance (his head about
 *  29 % of the frame's width), his head a little right of the middle (his waving arm goes up on the left), eyes at
 *  about y 720; GUO's face behind him then stays under the top rows (y < 360) and his topknot well under the battery */
const EXT = 2.9;
const tele = (f: number): Lens => {
  const h = headLag(f), d = h.distanceTo(POS), fov = Math.max(14, (2 * Math.atan(EXT / 2 / d)) / DEG);
  return { pos: POS, dir: aimDir(POS, h, 570, 720, fov), fov, dist: d };
};
/** FAR (after the step back): the scene's widest lens; the aim is FIXED (she stops following and lets him go): his
 *  head as it will be when the ink wash starts (BEAT.G.wipe) sits at (FAR_SX, FAR_SY), so the boat draws off inside a
 *  still frame; the far house's lantern comes down to the upper middle, the family's backs fill the bottom edges */
const FAR_FOV = 64, FAR_SX = 470, FAR_SY = 860;
let farDir: THREE.Vector3 | null = null;
const far = (): Lens => {
  const h = headEst(B.wipe[0]);
  farDir ??= aimDir(POS2, h, FAR_SX, FAR_SY, FAR_FOV);
  return { pos: POS2, dir: farDir, fov: FAR_FOV, dist: h.distanceTo(POS2) };
};
/** a move blends her place, the focal length (1 / tan(fov / 2)), the view direction and the look distance */
const blendLens = (a: Lens, b: Lens, k: number): Lens => {
  const fa = 1 / Math.tan((a.fov * DEG) / 2), fb = 1 / Math.tan((b.fov * DEG) / 2);
  return { pos: a.pos.clone().lerp(b.pos, k), dir: a.dir.clone().lerp(b.dir, k).normalize(), fov: (2 * Math.atan(1 / lerp(fa, fb, k))) / DEG, dist: lerp(a.dist, b.dist, k) };
};
/** the snap's ease: most of the zoom in its first frames, a soft landing on the word */
const out3 = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const lensAt = (f: number): Lens => {
  if (f < SNAP[0]) return wide(f);
  if (f < SNAP[1]) return blendLens(wide(f), tele(f), out3((f - SNAP[0]) / (SNAP[1] - SNAP[0])));
  if (f < STEP[0]) return tele(f);
  if (f < STEP[1]) return blendLens(tele(f), far(), smooth((f - STEP[0]) / (STEP[1] - STEP[0])));
  return far();
};
/** her happy bounce: a hop of the lens twice a second (no sway of the horizon), eased in and out of its span */
const bounceK = (f: number) => Math.max(0, Math.min(smooth((f - BOUNCE[0] + 1) / 6), smooth((BOUNCE[1] - f) / 6)));
/** her steps back (the walk bob of the handheld) */
const WALK: [number, number][] = [[STEP[0], 0], [STEP[0] + 4, 0.7], [STEP[1] - 4, 0.7], [STEP[1], 0]];
const camG = (f: number): CamPose => {
  const L = lensAt(f), look = L.pos.clone().addScaledVector(L.dir, L.dist);
  const base: CamPose = { pos: [L.pos.x, L.pos.y, L.pos.z], look: [look.x, look.y, look.z], fov: L.fov };
  // the handheld: calm breathing only (steadier as she zooms in: the phone's stabiliser shrinks the shake with the fov)
  const held = C.handheld(base, f, { mood: "calm", amp: 0.9 * Math.min(1, L.fov / FOV), seed: 7, walk: WALK });
  const k = bounceK(f);
  if (k <= 0) return held;
  const t = f / FPS, hop = Math.abs(Math.sin(2 * PI * t)) - 0.6;
  return C.nudge(held, { up: k * 0.014 * hop, pitch: k * 0.4 * hop });
};

// ------------------------------------------------------------------------------------------------ his wave
/** his right arm's arc (in his torso's frame, from his head: his right shoulder is 0.16 m to his right, 0.27 m under
 *  the head's middle, 0.05 m forward; the arm 0.42 m long): the hand on a circle of 0.36 m round the shoulder, its
 *  angle from straight up swinging about a centre; out to the side far enough to clear the hat's brim (the brim is
 *  0.23 m round the head) */
const SH = { x: 0.16, y: -0.27, z: 0.05 }, ARC = 0.36;
/** the wave's size 0..1 (0.45 = the gentle one of the pre, 1 = the whole arm of the shout) */
const sizeAt = (f: number) => ky(f, [[T0, 0.45], [ARM_UP, 0.45], [B.wave - 1, 1], [L52.to + 6, 1], [S.to, 0.7]]);
const waveHand = (head: THREE.Vector3, yaw: number, f: number) => {
  const k = sizeAt(f), t = f / FPS;
  const a = (lerp(66, 40, k) + lerp(9, 16, k) * Math.sin(2 * PI * 1.3 * t)) * DEG;
  // in his torso's frame: x to his LEFT (his right arm is at -x), y up, z forward
  const x = -(SH.x + ARC * Math.sin(a)), y = SH.y + ARC * Math.cos(a), z = SH.z + 0.08;
  return rel(head, yaw, x, y, z);
};
/** how far his right hand is up from his knee (0 = resting, 1 = on the arc) */
const liftAt = (f: number) => ky(f, [[LIFT[0], 0], [LIFT[1], 1]]);

// ------------------------------------------------------------------------------------------------ faces
/** SU: warm in the pre (his eyes to MAI, then to the kids), grin as the arm goes up, the shout, grin on 替我, laughing
 *  on 几颗, happy, then fond as the boat draws off */
const SU_EXPR: [number, Expr][] = [
  [T0, "smile"], [ARM_UP - 2, "grin"], [WD.lychee, "smile"], [WD.forMe, "grin"], [WD.few, "laugh"], [L52.to + 6, "happy"], [OFF + 16, "smile_closed"],
];
const SU_GAZE: [number, number][] = [[T0, -0.45], [T0 + 18, 0.45], [ARM_UP - 4, 0]];
/** GUO: smiling at the oar, glances down at his father when he starts shouting, laughs with him */
const GUO_EXPR: [number, Expr][] = [[T0, "smile_closed"], [WD.lychee + 4, "happy"], [WD.few + 3, "laugh"], [L52.to + 14, "happy"]];
const GUO_GAZE: [number, number][] = [[T0, 0.2], [WD.lychee + 4, 0], [OFF, 0.2]];

export const SEG: Segment = {
  id: "G", from: S.from, to: S.to,
  enter() {},
  exit(w) { setSeat(w.actor(SU), null); },
  pose(w, f): Pose {
    const t = f / FPS;
    w.setPlace("river");
    w.set.param("dawn", lerp(0.35, 0.85, smooth((f - T0) / (S.to - T0))));
    const cam = camG(f);
    w.setCamera(cam);

    // ---- the boat and the two in it
    const b = boatAt(f), Bs = suSeat(b.at, b.rot);
    const boat = w.prop("boat", "G");
    trimDeck(boat.group);
    boat.put(b.at, { rot: b.rot, t });
    const su = w.actor(SU);
    setSeat(su, Bs.seat, Bs.facing);
    const sp = says("su", ["G52"], f, 1);
    const head = heads(
      sp.head,
      accent("pop", f, WD.lychee), accent("nod", f, WD.eat, { amp: 0.7 }), accent("laugh", f, WD.few + 2, { dur: 0.9 }),
      accent("nod", f, T0 + 20, { amp: 0.4 }),
      // the head leans away from the waving arm (toward screen right) while he shouts
      { tilt: ky(f, [[ARM_UP - 4, 1], [ARM_UP + 6, 5], [L52.to + 8, 5], [S.to, 2]]) },
    );
    su.set({
      at: Bs.at, facing: Bs.facing, seat: Bs.seat, pose: { kind: "sit", t: t + 0.41 }, visible: true,
      expr: at(f, SU_EXPR), gaze: at(f, SU_GAZE), blink: sp.blink ?? lid(t, 1, swaps(SU_EXPR)),
      ...(sp.mouth ? { mouth: sp.mouth } : {}), head, hands: [null, null],
    });
    const guo = w.actor(GUO);
    guo.set({
      // he turns a little with the oar's swing (his arms stay clear of his body at the ends of the stroke)
      ...standing(rel(b.at, b.rot, GUO_X, BOAT.deck, GUO_Z), Bs.facing + GUO_TURN - 0.8 * boatSwing(t), f, 3, { expr: at(f, GUO_EXPR), gaze: at(f, GUO_GAZE), blink: lid(t, 3, swaps(GUO_EXPR)) }),
      hands: Bs.guoHands(t),
      // he leans out to look past his father's hat at the bank (his head up and to screen right: the hat's brim would
      // hide his chin), sways with the oar's stroke, tips his head toward his father as he shouts, laughs with him
      head: heads({ dx: 0.4 + 0.06 * Math.sin(2 * PI * 0.4 * t), dy: 0.22, tilt: ky(f, [[WD.lychee, 3], [WD.lychee + 10, -5], [WD.few + 20, -5], [OFF + 10, 3]]) }, accent("laugh", f, WD.few + 3, { dur: 0.8 })),
    });

    // ---- the family on the bank (back views: they watch the boat), the dog at the water's edge
    const boatMid = b.at.clone().add(V(0, 0.8, 0));
    w.actor(MAI).set({ ...standing(MAI_AT, yawTo(MAI_AT, boatMid), f, 5, { expr: "happy" }), pose: { kind: "wave", t: t * 0.85 + 0.3, arm: 0 }, turn: 1 });
    w.actor(KID).set({ ...standing(KID_AT[0], yawTo(KID_AT[0], boatMid), f, 6, { expr: "happy" }), pose: { kind: "cheer", t: t + 0.7, amount: 1 }, turn: 1 });
    w.actor(KID2).set({ ...standing(KID_AT[1], yawTo(KID_AT[1], boatMid), f, 7, { expr: "happy" }), pose: { kind: "wave", t: t * 1.1 + 0.2, arm: 1 }, turn: 1 });
    w.prop("dog").put(DOG_AT.clone().add(V(0, dogGroundY("idle"), 0)), { pose: "idle", t, rot: yawTo(DOG_AT, b.at), lookAt: headEst(f) });

    w.update();

    // ---- his wave: the right hand from his knee onto the arc (in his torso's frame, from the solved head)
    // (his left hand stays on his knee, a little over the rig's lap point: it sank 1 cm into the robe there)
    const hd = su.headWorld(), rest = su.handWorld(0), lift = liftAt(f), knee = su.handWorld(1).add(V(0, 0.014, 0.008));
    su.set({ hands: [lift > 0 ? rest.lerp(waveHand(hd, su.bodyYaw, f), lift) : null, knee] });
    w.update();

    const shot = f < SNAP[0] ? "wide" : f < STEP[0] ? "tele" : "far";
    const e = w.project(su.headWorld()), hl = w.project(RIVER.houseLantern);
    return { camera: cam, focus: [b.at.x, b.at.z], overlays: transitionAt(f)?.node ?? null, slate: `G ${shot} head ${e.x.toFixed(0)},${e.y.toFixed(0)} house ${hl.x.toFixed(0)},${hl.y.toFixed(0)}` };
  },
};
