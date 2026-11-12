// Segment E (lines 18-22): THE PAY-OFF. Liu Bang rides off on one horse and leaves his carriage at the gate; his
// strategist waits until he is home, then walks in with the gifts and the excuse; back in the red camp the first thing
// Liu Bang does is have the informer taken away (his cap rolls back in alone); the name came out of Xiang Yu's own
// mouth; the privy again (the film loops).
// Ten shots:
//   18a  the gate          Liu Bang on the ONE horse, four men on foot round him; a look back, then they bolt to the
//                          right; the carriage and the retinue stay            (the camera stays with what is left)
//        -> cut on continuing motion
//   18b  the hill road     the same five, the same way, the camera travelling with them
//        -> WHIP PAN LEFT (back to Xiang Yu's camp)
//   19a  the tent front    Zhang Liang waits with the gifts in his hands, the sun crosses the sky; he turns to the door
//        -> FLAP WIPE going in
//   19b  the tent          he walks up to Xiang Yu, holds the gifts out, bows and says it; everybody looks at the
//                          EMPTY seat with the gold cup                          (push on the empty seat)
//        -> WHIP PAN RIGHT (to Liu Bang's camp)
//   20a  the red camp      Liu Bang strides in and points; the "?" of line 2 over the officer; the guards take his arms
//   20i  his face          THE NAME lands on him (the plate of line 9); he is pulled out of the frame
//   20c  the red camp      the three go off to the right; his roof cap rolls back in alone  (push on the cap)
//   21a  FLASH BACK        the gate, that morning: Xiang Yu pointing, the name in a bubble out of his own mouth
//   21b  the tent          Xiang Yu, pleased with himself, knows nothing             (slow push, then held still)
//   22   the privy         another builder's closing shot (untouched)
// Every frame number is looked up (beats.ts, cap / line / quote): see B below. The shots are pure functions of f.
// Notes: /home/user/hm_notes/seg_E.md.
import * as THREE from "three";
import type { Expr } from "../../group/kit/toon";
import type { CamPose, Pose, PostPose, Quote, Segment, V3Like, Vec3 } from "../story";
import { SEGMENTS, cap, quote, lin, smooth, lerp, easeInOutCubic, easeOutCubic, camMix } from "../story";
import type { World } from "../world";
import { shot, HIT, TAG, TAG_LEN } from "../beats";
import { CAMP, CAMS, CART, GATE, HILL, NIGHT_L, SEATS, TRAY } from "../layout";
import { setSeat } from "../acc/garb";
import { privyClosing } from "../sets/privy";
import { LIU_PRIVY, LIU_DAGE } from "../acc/liu_dage";
import { FPS, PEOPLE, V, accent, at, banquet, bow, cam, frag, halberdHand, headPx, heads, kick, ky, lerpA, lid, path, rel, salute, speak, staged, swaps, walkAlong, walkTime, yawTo, type Rig, type RigPose, type RigState } from "./common";
import { horseSeat } from "../props";
import { tag, bubble } from "../hud";
import { TXT } from "../lang";
import { burst, cloth, flashIn, memory, streak } from "./segE_ov";

const S = SEGMENTS[4];
type Ex = Expr;
type St = Partial<RigState>;

// ====================================================================================================== the beats
const S18a = shot("18a"), S18b = shot("18b"), S19a = shot("19a"), S19b = shot("19b"), S20 = shot("20"), S21 = shot("21"), S22 = shot("22");
const Q19 = quote("zhangLiang", 19), Q9 = quote("xiangYu", 9);
const NL = NIGHT_L, G = GATE;
/** Zhang Liang's way up to Xiang Yu (line 19): from the gap beside Liu Bang's empty seat onto the floor; he stops
 *  0.34 m short of where the gifts are held out (his own mark: the layout's MARKS.gift is for a tray on the floor) */
const Z19 = [V(-0.36, 0, -0.9), V(-0.22, 0, -0.45), V(-0.08, 0, 0.5)], ZM = Z19[2], WALK19 = 1.3;
/** Liu Bang's way into his camp (line 20): 1.25 m from outside the left edge to the layout's mark */
const L20 = [V(NL.liuDay.x - 1.25, 0, NL.liuDay.z + 0.05), NL.liuDay.clone()], WALK20 = 1.7;
const B = (() => {
  // ---- line 18: they amble; the horse bolts a few frames before "一匹马" and is at mid-frame on the word
  const bolt = HIT.horse - 12;
  // ---- line 19: the sun; he turns to the door; inside: he is at his mark and bowed before his words
  const turn19 = S19a.to - 15, walk19 = S19a.to - 5;
  const zGo = S19b.from - 5, zAt = zGo + Math.ceil(walkTime(Z19, WALK19) * FPS);
  const look19 = Q19.from + 6;                               // every head goes to the empty seat
  // ---- line 20
  const liuAt = S20.from + 10, liuGo = liuAt - Math.ceil(walkTime(L20, WALK20) * FPS);
  const point = liuAt + 8;                                   // the arm starts up
  const plate = Math.max(TAG.informerAgain, liuAt - 2);      // his plate comes back (the name, 告密的, the 密 seal)
  const step = point + 10, grab = step + 6;                  // the guards close in; their hands take his arms
  const bust = HIT.kill;                                     // the cut to his face: "杀了"
  const name = bust + 2;                                     // the plate lands
  const back = cap(20, 2).from;                              // the cut back to the camp
  const pull = back - 8;                                     // he is pulled away (8 frames inside the bust)
  const gone = pull + 19;                                    // the three are out of the frame
  const capGo = gone + 1, capRest = capGo + 15;
  // ---- line 21
  const fb = S21.from, tent21 = cap(21, 1).from + 5;         // the flash back; the cut to Xiang Yu in his tent ("项羽自己")
  const say = fb + 6;                                        // the bubble
  const hold = S21.to - 9;                                   // 0.3 s held still
  return { bolt, turn19, walk19, zGo, zAt, look19, liuGo, liuAt, point, plate, step, grab, bust, name, back, pull, gone, capGo, capRest, fb, tent21, say, hold };
})();

// ====================================================================================================== cameras
const arr3 = (p: V3Like): Vec3 => (Array.isArray(p) ? p : [p.x, p.y, p.z]);
/** the camera turned by `a` radians about the vertical through its own position (+ = to the right) */
const panned = (c: CamPose, a: number): CamPose => {
  if (!a) return c;
  const p = arr3(c.pos), l = arr3(c.look), dx = l[0] - p[0], dz = l[2] - p[2], cs = Math.cos(a), sn = Math.sin(a);
  return { ...c, look: [p[0] + dx * cs - dz * sn, l[1], p[2] + dx * sn + dz * cs] };
};
/** the camera moved the share k of the way to its own look point (a push-in on its own axis) */
const pushed = (c: CamPose, k: number): CamPose => { const p = arr3(c.pos), l = arr3(c.look); return { ...c, pos: [lerp(p[0], l[0], k), lerp(p[1], l[1], k), lerp(p[2], l[2], k)] }; };
/** THE WHIP PAN (as segment B's): hard only under the streak. Out: the three frames before the cut; in: the new shot
 *  comes to rest over its first three frames. dir 1 = the camera pans RIGHT. */
const whipOut = (f: number, cut: number, dir: 1 | -1, amp: number) => dir * amp * Math.pow(lin(f, cut - 4, cut - 1), 2);
const whipIn = (f: number, cut: number, dir: 1 | -1, amp: number) => -dir * amp * Math.pow(1 - lin(f, cut - 1, cut + 3), 3);
const whipStreak = (f: number, cut: number, dir: 1 | -1, cols: string[]) => streak({ f, from: cut - 3, to: cut + 2, cut, dir, cols });
const DAY_COLS = ["#8fb4e0", "#e8d9b0", "#cfe0ee", "#d9c48a"], TENT_COLS = ["#3a2f5c", "#c9a86a", "#2a2446", "#e8d9b0"];

/** shot 18a: the gate from further back than line 8 and a little raised, so that the horse, its rider and the four
 *  on foot are whole and the carriage and the retinue stand behind them. cx = what it looks at. */
const cam18 = (cx: number): CamPose => cam([cx, 1.6, 7.7], [cx, 0.75, -0.6], 50);
/** shot 19b: the master's side of the room from 0.3 m further right and higher: Zhang Liang 35 % x, the EMPTY seat and
 *  the gold cup 52-60 %, Xiang Yu 76 %, Fan Zeng's back lower left; the floor above the captions. C19IN = the end of
 *  the push on the empty seat. */
const C19 = cam([1.6, 3.0, 5.7], [0.22, 0.4, 0.0], 46), C19IN = cam([1.55, 2.8, 5.0], [0.3, 0.42, -0.35], 43);
/** shot 20i: the storyboard's caoBustDay */
const BUST20 = cam([30.5, 1.3, 2.0], [30.47, 1.12, -0.7], 36);
/** shot 21a: segment B's own camera of line 9 (its GATE9), so that the flash back IS the picture of line 9 */
const GATE9 = cam([90.66, 1.4, 5.6], [90.425, 1.13, 1.25], 38);
/** a washed-out grade for the flash back (the film's grade with half the colour and a stronger vignette) */
const MEMORY_POST: PostPose = { grade: { ky: [0, 0.12, 0.3, 0.6, 0.84, 0.945, 1], sat: [0.55, 0.6, 0.55], tintS: [0.006, 0.006], tintM: [-0.01, 0.008], tintH: [-0.016, 0.01], vig: [0.3, 0.55] } };

// ====================================================================================================== small helpers
/** the frame on which syllable i (from 0) of a quote starts */
const syl = (q: Quote, i: number) => Math.round(q.from + (i * (q.to - q.from + 1)) / q.syl);
/** where an UNPINNED hand is this frame (it solves the figures as they are set so far) */
const restHand = (w: World, r: Rig, arm: 0 | 1) => { w.update(); return r.handWorld(arm); };
/** a head offset at the share k (for a head that already sits low in a bow) */
const soft = (hd: ReturnType<typeof heads>, k: number): ReturnType<typeof heads> => (hd ? { ...hd, dx: (hd.dx ?? 0) * k, dy: (hd.dy ?? 0) * k, tilt: (hd.tilt ?? 0) * k } : hd);
/** a run of changing speed: the walk pose from the metres run (one step cycle = 0.9 m) */
const runPose = (d: number): RigPose => ({ kind: "walk", phase: (((d / 0.9) % 1) + 1) % 1, stride: 0.27, amount: 1 });
const LOG = false;
const log = (f: number, s: string) => { if (LOG) console.log(`QA:E f${f} ${s}`); };
const px = (p: { x: number; y: number }) => `${Math.round(p.x)},${Math.round(p.y)}`;

// ====================================================================================================== line 18: the horse
/** the four on foot, in the horse's own frame: dx = ahead of its middle (m), dz = toward the camera from its lane.
 *  Fan Kuai leads beside its head; three run behind and beside its hindquarters: nobody stands between the camera and
 *  the rider. (2026-11-12, the clearance checker) The places keep every pair apart, measured: the rigs' heads are
 *  0.66 m across with the helmet, so heads stay 0.67 m apart or more; each halberd stands 0.25-0.45 m out on its
 *  holder's halberd side (LIU_GUARD: his left, away from the camera; LIU_GUARD_B: his right, toward it), so nobody is
 *  on that side of anybody; everybody clears the horse (1.5 m long: nose +0.98, tail -0.78, 0.5 m wide) by 0.3 m. The
 *  old places put LIU_GUARD_B 0.3 m behind the tail (his body in the horse) and his halberd through the head of the
 *  man behind him. Order: Fan Kuai, LIU_GUARD, LIU_GUARD_B, LIU_GUARD "c". */
/** the rider's robe (the horse draws his two legs down its sides in it) */
const LIU_RED = "#c8322c";
const ESCORT: { dx: number; dz: number; id: number }[] = [{ dx: 0.95, dz: 0.68, id: 31 }, { dx: -1.35, dz: -0.1, id: 32 }, { dx: -0.85, dz: 0.75, id: 33 }, { dx: -1.55, dz: 0.8, id: 34 }];
/** FAN KUAI'S SHIELD, as segment D carries it (its shieldHand / shieldN / shieldAt, copied: not exported there): in his
 *  LEFT hand at his left side, its front out to his left; `plant` 1 = stood on the ground at his side, his hand on its
 *  top edge (how line 17 leaves him). (It was slung on his back here: his head, his scabbard and his swinging right
 *  arm went through it; this rig's head and sword leave no room on his back.) */
const SH_UP = V(0, 1, 0);
const fkShield = (w: World, r: Rig, p: THREE.Vector3, facing: number, plant: number) => {
  const a = facing + 0.95, n = V(Math.sin(a), 0, Math.cos(a)), o = { up: n, face: SH_UP };
  const at = r.handWorld(1).addScaledVector(n, 0.045).add(V(0, -lerp(0.08, 0.43, plant), 0));
  const sh = w.prop("shield").put(at, o);
  // stood on the ground: its rim exactly on it (the hand is where the rig could put it: measured, not assumed)
  if (plant > 0) { const low = lowest(sh.group, (nm) => nm === "shield"); if (low < Infinity) sh.put(at.setY(at.y - low * plant), o); }
};
/** the lowest world y of a prop's solid meshes whose name passes `ok` (its ink hulls left out) */
const _lv = new THREE.Vector3();
function lowest(g: THREE.Object3D, ok: (name: string) => boolean): number {
  let low = Infinity;
  g.traverse((m) => {
    const geo = (m as THREE.Mesh).isMesh && ok(m.name) ? (m as THREE.Mesh).geometry : null;
    if (!geo) return;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) low = Math.min(low, _lv.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).y);
  });
  return low;
}
const fkShieldHand = (p: THREE.Vector3, facing: number, plant: number, run = 0) => rel(p, facing, 0.25 + 0.03 * run, lerp(0.66, 0.84, plant), 0.15);
/** A GUARD'S HALBERD HAND (people.ts: LIU_GUARD holds the halberd in hand 1, LIU_GUARD_B in hand 0), pinned steady at
 *  the hip: 0.215 m out from his middle (acc/held.ts puts the shaft 3 cm outside the hand; a hanging hand is 0.17 m out
 *  and the armour skirt 0.2 m, so the shaft went 2 cm into his skirt), `y` up. Running, the pinned hand neither swings
 *  nor dips with the step, so the butt stays off the ground (a hanging hand put it 3.5 cm into the ground); a runner's
 *  skirt swings out further: 0.24 m and 0.66 m up then. */
const haft = halberdHand;   // (the same rule, shared in common.ts since 2026-11-12: segment D's door guards use it too)
/** THE HOOVES ON THE GROUND: props/horse.ts puts the lowest leg's END on the ground, but a hoof is a 6.8 cm disc and
 *  its rim tilts below that end by r sin(swing) (2.4 cm in the gallop). After put: the lowest vertex of the four legs
 *  (not their ink) is measured, and the horse is put again that much higher. Returns where it stands.
 *  (2026-11-12: horseGait now counts the hoof rim itself, so this is a no-op safety net: it lifts by 0 or a fraction of a mm) */
function putHorse(w: World, p: THREE.Vector3, o: { facing: number; pose: string; t: number; rider?: string }): THREE.Vector3 {
  const h = w.prop("horse").put(p, o), low = lowest(h.group, (nm) => nm === "horse.leg");
  if (!(low < p.y - 0.0005)) return p;
  const q = p.clone().setY(p.y + (p.y - low));
  h.put(q, o);
  return q;
}
/** THE FIVE ON THE ROAD (both shots of line 18): the horse at `p` heading `dir` (flat, unit) with Liu Bang on it,
 *  the four running round it. d = metres travelled (the runners' legs), gallop = the horse's gait (its legs, its rock
 *  and its hop are the prop's own, a function of the film's time), look = where the rider's eyes are (-1 back over
 *  his shoulder .. 1 ahead), f for the faces; `plant` = Fan Kuai's shield on the ground (1) or carried (0); runK =
 *  the guards' halberd hands from standing (0) to running (1). */
function convoy(w: World, f: number, p: THREE.Vector3, dir: THREE.Vector3, d: number, gallop: boolean, look: number, ex: Ex, plant = 0, runK = gallop ? 1 : 0) {
  const t = f / FPS, pose = gallop ? "gallop" : "stand";
  // the side of the road the camera is on (the runners keep to it)
  const n = V(-dir.z, 0, dir.x); if (n.dot(V(w.camera.position.x - p.x, 0, w.camera.position.z - p.z)) < 0) n.negate();
  const yaw = Math.atan2(dir.x, dir.z);
  // ASTRIDE (w_props.md): he faces the way the horse goes; the seat is 10 cm inside its back, so his own legs are in
  // the barrel and the horse draws a leg down each side. The cloth is told of the seat (a long one: no skirt hangs
  // through the horse). His two hands hold the front roll of the saddle cloth.
  const hp = putHorse(w, p, { facing: yaw, pose, t, rider: LIU_RED });
  const top = horseSeat(hp, yaw, pose, t);
  const seat = { top, front: 0.7 };
  const liu = w.actor(PEOPLE.liuBang, "rider");
  setSeat(liu, seat, yaw);
  liu.set({
    at: p.clone(), facing: yaw, pose: { kind: "sit", t }, seat, hands: [rel(top, yaw, -0.08, 0.17, 0.23), rel(top, yaw, 0.08, 0.17, 0.23)],
    expr: ex, blink: lid(t, 1), gaze: look, head: { tilt: 4 * look * (gallop ? 0.4 : 1) }, visible: true,
  });
  const who = [w.actor(PEOPLE.fanKuai), w.actor(PEOPLE.liuGuard), w.actor(PEOPLE.liuGuardB), w.actor(PEOPLE.liuGuard, "c")];
  const at4 = who.map((r, i) => p.clone().addScaledVector(dir, ESCORT[i].dx).addScaledVector(n, ESCORT[i].dz));
  who.forEach((r, i) => {
    const e = ESCORT[i], q = at4[i];
    // (a guard holds his halberd steady; Fan Kuai's left hand holds the shield)
    const hy = lerp(0.63, 0.66, runK), ho = lerp(0.225, 0.25, runK);
    const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = i === 0 ? [null, fkShieldHand(q, yaw, plant, runK)] : i === 2 ? [haft(q, yaw, 0, hy, ho), null] : [null, haft(q, yaw, 1, hy, ho)];
    r.set({ at: q, facing: yaw, pose: gallop ? runPose(d + 0.31 * i) : { kind: "idle", t: t + 0.37 * i }, hands, expr: i ? "neutral" : "stern", blink: lid(t, e.id), gaze: 0.5, visible: true });
  });
  w.update();
  fkShield(w, who[0], at4[0], yaw, plant);
  return { liu, who, top };
}
/** shot 18a: the gate. The five stand ready beside the parked carriage, Liu Bang already on the one horse; he looks
 *  back over his shoulder at Xiang Yu's camp, then ahead; they bolt to the right, past the carriage. The camera lets
 *  them go and settles on the carriage and the retinue that stay. */
// (2026-11-12: 0.25 m further right and the camera 0.2 m further back, for the escort's new places: the last
//  runner's helmet stays 9 cm inside the left edge at the start)
const X18 = 90.2;
function shot18a(w: World, f: number): Pose {
  w.setPlace("gate");
  // the camera holds on the group LEFT of the chariot (nobody stands under its parasol), then goes a little way with
  // them as they bolt, lets them go and settles on the chariot and the retinue that stay
  const cx = lerp(90.2, 91.0, easeInOutCubic(lin(f, B.bolt, B.bolt + 24)));
  const c = cam18(cx);                                       // (segment D ends on a plain cut: no whip into this shot)
  w.setCamera(c);
  // metres along the lane from the bolt: 10 m/s2 up to 5.7 m/s
  const tb = Math.max(0, (f - B.bolt) / FPS), ta = 0.57;
  const d = tb < ta ? 5 * tb * tb : 5 * ta * ta + 5.7 * (tb - ta);
  const look = at(f, [[0, 0.5], [S18a.from + 3, -1], [B.bolt - 5, 1]]);
  const ex: Ex = f < B.bolt - 5 ? "nervous" : "stern";
  // Fan Kuai's shield stands at his side as line 17 left it, his hand on its top; he takes it up just before the bolt
  const plant = 1 - smooth(lin(f, B.bolt - 6, B.bolt));
  const T = convoy(w, f, V(X18 + d, 0, -0.6), V(1, 0, 0), d, f >= B.bolt, look, ex, plant, smooth(lin(f, B.bolt - 2, B.bolt + 3)));
  // the carriage stays: its horse in the shafts, as in lines 8 and 9 (segment B)
  w.prop("horse2").put(V(CART.at.x, 0, CART.at.z - 1.65), { facing: Math.PI, t: f / FPS });
  w.update();
  if (LOG && f % 6 === 0) log(f, `18a liuHead ${px(w.project(T.liu.headWorld()))} horse ${px(w.project(V(X18 + d, 1, -0.6)))}`);
  return { camera: c, slate: "18a gate horse" };
}
/** shot 18b: the hill road: the same five, the same way, the same speed; the camera travels with them (a little
 *  slower: they gain on it). Then the whip pan back to Xiang Yu's camp. */
function shot18b(w: World, f: number): Pose {
  w.setPlace("path");
  const P = HILL.path, len = P[0].distanceTo(P[1]), dir = P[1].clone().sub(P[0]).normalize(), n = V(-dir.z, 0, dir.x);
  const k = lin(f, S18b.from, S18b.to), d = 4.4 + 6.0 * ((f - S18b.from) / FPS), along = (m: number) => P[0].clone().lerp(P[1], m / len);
  const cAt = along(d - 0.25 - lerp(-0.3, 0.3, k));
  let c: CamPose = cam([cAt.x + n.x * 22, 2.2, cAt.z + n.z * 22], [cAt.x, 0.95, cAt.z], 20);
  c = panned(c, whipOut(f, S19a.from, -1, 0.2));
  w.setCamera(c);
  const T = convoy(w, f, along(d), dir, 20 + d, true, 1, "stern");
  w.update();
  if (LOG && f % 6 === 0) log(f, `18b liuHead ${px(w.project(T.liu.headWorld()))}`);
  return { camera: c, focus: [along(d).x, along(d).z], overlays: whipStreak(f, S19a.from, -1, DAY_COLS), slate: "18b hill road" };
}

// ====================================================================================================== line 19: the gifts
/** the gift table in Zhang Liang's two hands: he stands at `p` facing `facing`; the table's top is `y` above the
 *  ground and `fwd` in front of him (its long side across him, a hand on each end) */
function carry(w: World, r: Rig, p: THREE.Vector3, facing: number, y: number, fwd: number) {
  r.set({ hands: [rel(p, facing, -0.205, y - 0.015, fwd), rel(p, facing, 0.205, y - 0.015, fwd)] });
  w.prop("tray").put(rel(p, facing, 0, y - TRAY.h, fwd), { facing: facing - Math.PI / 2 });
}
/** the flap wipe between 19a and 19b: covering over the last 4 frames of 19a (full on its last frame), the cloth goes
 *  on down over the first 3 of 19b */
const wipe19 = (f: number) => cloth(f < S19b.from ? lin(f, S19b.from - 5, S19b.from - 1) : 1 + lin(f, S19b.from - 1, S19b.from + 3));
/** shot 19a: in front of the command tent. Zhang Liang waits with the gifts in his hands; the sun crosses the sky
 *  (time passes: Liu Bang gets home); he looks after it, nods, turns to the door and goes. Held still. */
function shot19a(w: World, f: number): Pose {
  w.setPlace("camp");
  const c = panned(CAMS.tentSky, whipIn(f, S19a.from, -1, 0.3));
  w.setCamera(c);
  const t = f / FPS, Wt = CAMP.wait, u = easeInOutCubic(lin(f, S19a.from + 2, B.turn19 - 2));
  w.set.setSun(lerp(0.04, 0.6, u));                          // (it stops short of the right banner, which would hide it)
  const ZL = w.actor(PEOPLE.zhangLiang), yawDoor = yawTo(Wt.zhang, Wt.toDoor);
  const tk = easeInOutCubic(lin(f, B.turn19, B.walk19)), leg = walkAlong([Wt.zhang, Wt.toDoor], WALK19, (f - B.walk19) / FPS);
  const facing = f <= B.walk19 ? lerpA(0, yawDoor, tk) : leg.facing;
  ZL.set({
    at: leg.at, facing, pose: leg.moving ? leg.pose : { kind: "idle", t }, turn: tk > 0 ? tk : undefined,
    expr: "neutral", blink: lid(t, 2), gaze: tk > 0 ? 0 : Math.round(lerp(-1, 1, u) * 2) / 2,
    head: tk > 0 ? undefined : heads({ dy: 0.1, tilt: lerp(-5, 5, u) }, accent("nod", f, B.turn19 - 7)),
    visible: true,
  });
  carry(w, ZL, leg.at, facing, 0.82, 0.34);
  w.update();
  return { camera: c, overlays: frag(whipStreak(f, S19a.from, -1, DAY_COLS), wipe19(f)), slate: "19a tent front, the sun" };
}
/** shot 19b: inside. Zhang Liang comes up the floor with the gifts, turns to Xiang Yu, holds them out with a bow and
 *  says it, perfectly straight-faced. Xiang Yu, the uncle and Fan Zeng turn to the EMPTY seat and its gold cup; the
 *  camera pushes on it. Then the whip pan to where the man really is. */
function shot19b(w: World, f: number): Pose {
  w.setPlace("tent");
  let c: CamPose = camMix(C19, C19IN, easeInOutCubic(lin(f, Q19.from - 8, Q19.to - 2)));
  c = panned(c, whipOut(f, S20.from, 1, 0.12));
  w.setCamera(c);
  const t = f / FPS, say = speak(Q19, f, 5, [2]);
  // ---- the hosts: they watch him come; on his words the heads go to the empty seat; Xiang Yu shrugs it off
  const EXX: [number, Ex][] = [[0, "stern"], [Q19.to - 3, "smug"]];
  const seatK = smooth(lin(f, B.look19, B.look19 + 6));
  banquet(w, f, {
    in: ["xiangyu", "uncle", "fanzeng"],
    extra: {
      xiangyu: { expr: at(f, EXX), blink: lid(t, 4, swaps(EXX)), gaze: -1, head: heads({ tilt: -5 * seatK, dx: -0.06 * seatK }, accent("nod", f, Q19.to - 3)) },
      uncle: { gaze: -1, head: { tilt: -4 * seatK } },
      fanzeng: { gaze: 0, lookDown: 16 * smooth(lin(f, Q19.to - 6, Q19.to + 2)), head: accent("shake", f, B.look19 + 4) },
    },
  });
  // ---- Zhang Liang
  const ZL = w.actor(PEOPLE.zhangLiang), FZ = 1.15;
  const leg = walkAlong(Z19, WALK19, (f - B.zGo) / FPS, { endFacing: FZ });
  const bw = easeInOutCubic(lin(f, B.zAt + 3, B.zAt + 10));
  ZL.set({
    at: leg.at, facing: leg.facing, pose: leg.pose,
    expr: "neutral", blink: say.blink ?? lid(t, 2), mouth: say.mouth, gaze: leg.arrived ? 1 : 0.5,
    ...bow(0.8 * bw, 22), head: heads({ dy: -0.05 * bw }, soft(say.head, 0.5)),
    visible: true,
  });
  carry(w, ZL, leg.at, leg.facing, lerp(0.82, 0.88, bw), lerp(0.34, 0.375, bw));
  w.update();
  const hd = headPx(w, ZL);
  if (LOG && f % 6 === 0) log(f, `19b zhangHead ${px(hd)} r ${Math.round(hd.r)} cup ${px(w.project(SEATS.liu.cup))} tray ${px(w.project(rel(leg.at, leg.facing, 0, 0.8, 0.34)))}`);
  const tagAt = Math.max(TAG.zhang, S19b.from + 4), ov = frag(
    wipe19(f),
    tag({ f, who: "zhang", at: hd, from: tagAt, len: TAG_LEN - 2 }),
    whipStreak(f, S20.from, 1, TENT_COLS));
  return { camera: c, overlays: ov, slate: "19b the gifts, the empty seat" };
}

// ====================================================================================================== line 20: the red camp
/** where the guards close in to: at his shoulders, a little behind him (their marks are 0.55 m out, 0.3 m behind:
 *  they step 0.08 m in). (2026-11-12, the clearance checker: 0.42 m out and 0.14 m behind put their helmets 6.7 cm
 *  into his head, the rigs' heads being 0.66 m across with the helmet; heads must stay about 0.53 m apart: 0.47 m out
 *  and 0.28 m behind does that, and the free hands still reach his upper arms.) */
const GIN = [NL.informer.clone().add(V(-0.47, 0, -0.28)), NL.informer.clone().add(V(0.47, 0, -0.28))];
/** where they walk with him when they take him off (all three turn to facing 0.5 then): 0.55 m to his right / left
 *  and 0.15 m behind him in HIS frame (in the world frame they would fall behind his turned shoulders and the hands
 *  on his arms would not reach) */
const GIN_M = [rel(NL.informer, 0.5, -0.55, 0, -0.15), rel(NL.informer, 0.5, 0.55, 0, -0.15)];
/** how far the three have gone to the right (m): 8 m/s2 up to 3.2 m/s */
const marched = (f: number) => { const tp = Math.max(0, (f - B.pull) / FPS), ta = 0.4; return tp < ta ? 4 * tp * tp : 4 * ta * ta + 3.2 * (tp - ta); };
/** THE TRACK of line 20 in Liu Bang's camp, for whichever camera looks at it: Liu Bang strides in and points; the
 *  officer greets him, sees the finger; the guards close in and take his arms; the three go off to the right; the cap
 *  rolls back in, tips over and lies still. */
const TO_INF = NL.informer.clone().sub(NL.liuDay).setY(0).normalize();
function liuCamp(w: World, f: number) {
  const t = f / FPS, LIU = w.actor(PEOPLE.liuBang), CW = w.actor(PEOPLE.caoWushang), GB = w.actor(PEOPLE.liuGuardB), GA = w.actor(PEOPLE.liuGuard);
  const m = marched(f), mk = smooth(lin(f, B.pull, B.pull + 6)), here = f < B.gone + 4;
  // ---- Liu Bang
  const leg = walkAlong(L20, WALK20, (f - B.liuGo) / FPS, { endFacing: 0.5 });
  LIU.set({ at: leg.at, facing: leg.facing, pose: leg.pose, expr: "stern", blink: lid(t, 1), gaze: at(f, [[0, 1], [B.gone + 2, 0]]), head: accent("nod", f, B.point + 5), visible: true });
  if (f >= B.point) {
    const rest = restHand(w, LIU, 1), pt = NL.liuDay.clone().addScaledVector(TO_INF, 0.44).add(V(0, 1.1, 0.1));
    const jab = 0.03 * Math.sin(Math.PI * lin(f, B.point + 8, B.point + 14));
    LIU.set({ hands: [null, path(f, [[B.point, rest], [B.point + 8, pt, easeOutCubic], [B.back + 2, pt], [B.back + 10, rest]]).add(V(jab, 0, 0))] });
    if (f > B.back + 10) LIU.set({ hands: [null, null] });
  }
  if (!here) return { LIU, CW, GB, GA };
  // ---- the officer: at ease, pleased with himself; a bow of the head to his lord; the finger; the hands on his arms
  const EXC: [number, Ex][] = [[0, "smug"], [B.point + 7, "shock"], [B.name + 9, "nervous"], [B.pull, "shock"]];
  const greet = ky(f, [[B.liuAt, 0], [B.liuAt + 5, 1], [B.point + 2, 1], [B.point + 7, 0]]);
  const dart = f >= B.name + 9 && f < B.pull ? [-1, 1][Math.floor((f - B.name - 9) / 6) % 2] : -1;
  const pc = NL.informer.clone().add(V(m, 0, 0.04 * mk));
  CW.set({
    at: pc, facing: 0.5 * mk, pose: m > 0 ? { kind: "walk", phase: (((m / 0.5) % 1) + 1) % 1, stride: 0.12, amount: 0.6 } : { kind: "idle", t: t + 0.3 },
    expr: at(f, EXC), blink: lid(t, 13, swaps(EXC)), gaze: f < B.point + 7 ? -1 : dart,
    ...bow(greet, 18), head: heads({ dy: -0.1 * greet }, accent("jolt", f, B.point + 7), accent("pop", f, B.name)),
    visible: true,
  });
  // ---- the guards: at their marks; they step in to his shoulders; then they go with him
  // (one short step each, 0.2 m: eased, the step pose fades in and out, so nothing pops)
  const sk = lin(f, B.step, B.step + 8), se = easeInOutCubic(sk), stepPose = (id: number): RigPose => (sk > 0 && sk < 1 ? { kind: "walk", phase: (0.25 * id + sk) % 1, stride: 0.1, amount: Math.sin(Math.PI * sk) } : { kind: "idle", t: t + 0.41 * id });
  const g0 = { at: NL.guards[0].clone().lerp(GIN[0], se).lerp(GIN_M[0], mk), facing: lerp(0.3, 0.25, se), pose: stepPose(1) };
  const g1 = { at: NL.guards[1].clone().lerp(GIN[1], se).lerp(GIN_M[1], mk), facing: lerp(-0.3, -0.25, se), pose: stepPose(2) };
  const gpose = (id: number): RigPose => (m > 0 ? { kind: "walk", phase: (((m / 0.6 + 0.3 * id) % 1) + 1) % 1, stride: 0.16, amount: 0.8 } : { kind: "idle", t: t + 0.41 * id });
  // (their halberd hands are held steady at the hip, clear of the armour skirt: see haft)
  const gbAt = g0.at.clone().add(V(m, 0, 0)), gbFace = lerp(g0.facing, 0.5, mk), gaAt = g1.at.clone().add(V(m, 0, 0)), gaFace = lerp(g1.facing, 0.5, mk);
  // (0.23 m out: the step in swings the skirt out too)
  const hB = haft(gbAt, gbFace, 0, 0.64, 0.23), hA = haft(gaAt, gaFace, 1, 0.64, 0.23);
  GB.set({ at: gbAt, facing: gbFace, pose: m > 0 ? gpose(1) : g0.pose, hands: [hB, null], expr: "stern", blink: lid(t, 23), gaze: f < B.step ? 0 : 1, visible: true });
  GA.set({ at: gaAt, facing: gaFace, pose: m > 0 ? gpose(2) : g1.pose, hands: [null, hA], expr: "stern", blink: lid(t, 24), gaze: f < B.step ? 0 : m > 0 ? 1 : -1, visible: true });
  const gk = easeOutCubic(lin(f, B.grab, B.grab + 5));
  if (gk > 0) {
    w.update();
    // the free hands (LIU_GUARD_B's left, LIU_GUARD's right) close on his upper arms, just above the elbows
    const e0 = CW.elbowWorld(0).add(V(-0.02, 0.07, 0.02)), e1 = CW.elbowWorld(1).add(V(0.02, 0.07, 0.02));
    GB.set({ hands: [hB, GB.handWorld(1).lerp(e0, gk)] });
    GA.set({ hands: [GA.handWorld(0).lerp(e1, gk), hA] });
  }
  return { LIU, CW, GB, GA };
}
/** the outline of the cap seen along its ridge (x across, y up from its foot; props CAP: foot 0.11, eaves 0.18 at
 *  about a third of its height, 0.27 high): what touches the ground while it tumbles */
const CAP_PTS: [number, number][] = [[-0.11, 0], [0.11, 0], [-0.18, 0.09], [0.18, 0.09], [-0.18, 0.15], [0.18, 0.15], [0, 0.27]];
/** THE ROOF CAP comes back in alone from the right: it tumbles end over end along the ground with two small hops,
 *  slows, and comes to rest upright with its gable to us (no blood, no blade). Its lowest point is on the ground (or
 *  the hop above it) on every frame. */
function capRoll(w: World, f: number) {
  if (f < B.capGo) return;
  const a = NL.capFrom, b = NL.cap, u = lin(f, B.capGo, B.capRest), e = easeOutCubic(u);
  const p = a.clone().lerp(b, e), th = 2 * Math.PI * 1.75 * (1 - e);         // 1.75 turns, the top going to the left
  const rock = f >= B.capRest ? 0.09 * Math.exp(-(f - B.capRest) / 3) * Math.sin((f - B.capRest) * 1.5) : 0, an = rock - th;
  const hop = 0.14 * Math.abs(Math.sin(Math.PI * 2 * e)) * (1 - e) * (1 - e);
  let low = Infinity; for (const [x, y] of CAP_PTS) low = Math.min(low, -x * Math.sin(an) + y * Math.cos(an));
  w.prop("cap").put(V(p.x, hop - low, p.z), { up: V(-Math.sin(an), Math.cos(an), 0), face: V(0, 0, 1) });
}
/** shot 20a: the pan lands on the red camp. Liu Bang strides in from the left and points; the gold "?" of line 2 pops
 *  over the officer's roof cap; the guards take his arms. */
/** the layout's campDay turned a little to the left and 10 % further back: Liu Bang's whole head inside the left edge,
 *  the right guard's whole head inside the right one, the officer at 70 % */
const DAY20 = pushed(panned(CAMS.campDay, -0.02), -0.1);
function shot20a(w: World, f: number): Pose {
  w.setPlace("dayL");
  const c = panned(camMix(DAY20, pushed(DAY20, 0.05), smooth(lin(f, B.liuAt, B.bust))), whipIn(f, S20.from, 1, 0.3));
  w.setCamera(c);
  const T = liuCamp(w, f);
  w.update();
  const hd = headPx(w, T.CW);
  if (LOG && f % 6 === 0) log(f, `20a cwHead ${px(hd)} r ${Math.round(hd.r)} liuHead ${px(w.project(T.LIU.headWorld()))}`);
  // his plate (the hud's: red, the name, 告密的, the round 密 seal of lines 5 and 9): it leaves before the cut to his face
  const ov = frag(
    whipStreak(f, S20.from, 1, DAY_COLS),
    tag({ f, who: "informer", at: hd, from: B.plate, out: B.bust - 6, avoid: [headPx(w, T.GB), headPx(w, T.GA)] }));
  return { camera: c, overlays: ov, slate: "20a red camp, the finger" };
}
/** shot 20i: his face fills the frame; the plate of line 9 lands over his cap on "曹无伤"; his eyes dart; he is pulled
 *  out of the frame to the right. */
function shot20i(w: World, f: number): Pose {
  w.setPlace("dayL");
  const c = kick(camMix(BUST20, pushed(BUST20, 0.05), smooth(lin(f, B.bust, B.pull))), f, B.name, 0.02);
  w.setCamera(c);
  const T = liuCamp(w, f);
  w.update();
  const hd = headPx(w, T.CW);
  if (LOG && f % 6 === 0) log(f, `20i cwHead ${px(hd)} r ${Math.round(hd.r)}`);
  const ov = frag(
    tag({ f, who: "informer", at: hd, from: B.name, out: B.back - 6 }),
    burst({ f, at: B.name + 2, x: hd.x, y: hd.y - 1.9 * hd.r, r: 330, n: 14 }));
  return { camera: c, overlays: ov, slate: "20i his face, the name" };
}
/** shot 20c: the camp again: the three go off to the right; Liu Bang lowers his arm; silence; the cap rolls back in
 *  alone and lies still; the camera pushes in on it. */
function shot20c(w: World, f: number): Pose {
  w.setPlace("dayL");
  const c0 = pushed(DAY20, 0.05), c = camMix(c0, CAMS.campDayIn, smooth(lin(f, B.back + 2, S20.to - 1)));   // (a long even push: the ground is waiting when the cap comes)
  w.setCamera(c);
  liuCamp(w, f);
  capRoll(w, f);
  w.update();
  if (LOG && f % 6 === 0) log(f, `20c cap ${px(w.project(NL.cap))}`);
  return { camera: c, slate: "20c marched off, the cap" };
}

// ====================================================================================================== line 21
/** Liu Bang's mark at the gate in line 9 (segment B's own L8) and the two facings of that shot */
const L8 = V(G.xiangyu.x + 0.9, 0, 1.05), FX8 = yawTo(G.xiangyu, L8) * 0.5, FB8 = -0.5;
/** the bubble of the flash back on the 1080 x 1920 frame: right of Xiang Yu's head (his knot reaches 450 px: nothing
 *  fits above him), over the gate's background, above the bowed Liu Bang (cap pin at about 790 px); its tail goes to
 *  Xiang Yu's mouth, his raised hand ends under its lower edge */
const BUB = { x: 690, y: 655 };
/** shot 21a: THE FLASH BACK: line 9 again, in short: the gate that morning, Liu Bang bowed, Xiang Yu pointing at him
 *  and talking; the NAME pops out of his mouth in a bubble (the gold of the name plate) and his arm swings up; Liu
 *  Bang's head comes up. A memory: washed colour, a white edge, a white flash in and out. */
function shot21a(w: World, f: number): Pose {
  w.setPlace("gate");
  const c = camMix(GATE9, pushed(GATE9, 0.04), smooth(lin(f, B.fb, B.tent21)));
  w.setCamera(c);
  const t = f / FPS, XY = w.actor(PEOPLE.xiangYu), LIU = w.actor(PEOPLE.liuBang);
  // his words of line 9, said again in the 0.7 s of the flash back (the narrator speaks over it: a mouth, no sound)
  const QF: Quote = { ...Q9, syl: 5, from: B.fb + 1, to: B.fb + 21, start: (B.fb + 1) / FPS, end: (B.fb + 21) / FPS };
  const sayX = speak(QF, f, 3, [2]);
  XY.set({ at: G.xiangyu.clone(), facing: FX8, pose: { kind: "idle", t: t + 0.7 }, expr: "smug", blink: sayX.blink ?? lid(t, 4), mouth: sayX.mouth, gaze: 1, head: heads(accent("pop", f, B.say), sayX.head), visible: true });
  const pt = staged(w, G.xiangyu, 0.34, 1.02, 0.08), top = staged(w, G.xiangyu, 0.42, 1.4, 0.03);
  XY.set({ hands: [null, path(f, [[B.say - 1, pt], [B.say + 3, top, easeOutCubic]])] });
  const up = ky(f, [[B.say + 4, 0], [B.say + 8, 1]]);
  LIU.set({
    at: L8.clone(), facing: FB8, ...salute(1, L8, FB8), expr: up > 0.3 ? "shock" : "nervous", blink: lid(t, 1), gaze: -1,
    lookDown: 22 * (1 - 0.85 * up), head: heads({ dy: -0.08 * (1 - up) + 0.05 * up }, soft(accent("jolt", f, B.say + 4, { amp: 0.5 }), 0.6)), visible: true,
  });
  w.prop("horse2").put(V(CART.at.x, 0, CART.at.z - 1.65), { facing: Math.PI, t });   // the chariot's horse, as segment B dresses lines 8 and 9
  w.update();
  const hd = headPx(w, XY);
  if (LOG && f % 6 === 0) log(f, `21a xyHead ${px(hd)} r ${Math.round(hd.r)} liuHead ${px(w.project(LIU.headWorld()))}`);
  const ov = frag(
    memory(f, B.fb, B.tent21 - 1),
    bubble({ f, from: B.say, out: B.tent21 - 5, x: BUB.x, y: BUB.y, text: TXT.informerName, size: 104, to: { x: hd.x + 0.8 * hd.r, y: hd.y + 0.5 * hd.r } }),
    burst({ f, at: B.say + 2, x: BUB.x, y: BUB.y, r: 300, n: 12 }));
  return { camera: c, post: MEMORY_POST, overlays: ov, slate: "21a flash back: the gate" };
}
/** shot 21b: Xiang Yu in his tent, from the front: he holds one of the white jade discs of the gift up beside his
 *  face, turns it in the lamp light and smiles at it. He knows nothing. A slow push; the last 0.3 s is held still. */
function shot21b(w: World, f: number): Pose {
  w.setPlace("tent");
  // (turned 0.07 rad right: he and the raised disc share the middle, the uncle's head stays outside the left edge)
  const XY21 = panned(CAMS.xy, 0.07), c = camMix(pushed(XY21, -0.6), pushed(XY21, -0.42), easeInOutCubic(lin(f, B.tent21, B.hold)));
  w.setCamera(c);
  const t = f / FPS, smile = cap(21, 1).from + 22, XS = SEATS.xiangyu;
  const EXX: [number, Ex][] = [[0, "smug"], [smile, "smile_closed"]];
  // the hand with the disc: up beside his head on its screen-right side (his left hand), a small lift on the smile
  const lift = 0.03 * smooth(lin(f, smile - 4, smile + 4));
  const hand = staged(w, V(XS.top.x, 0, XS.top.z), 0.36, 0.9 + lift, 0.14);
  const T = banquet(w, f, {
    in: ["xiangyu", "uncle", "fanzeng"],
    extra: { xiangyu: { expr: at(f, EXX), blink: lid(t, 4, swaps(EXX)), gaze: 1, hands: [null, hand], armFront: [undefined, true], head: heads({ tilt: 4 }, accent("nod", f, smile - 5)) } },
  });
  w.prop("trayRest").put(V(TRAY.at.x, 0, TRAY.at.z));
  w.update();
  // the disc stands on his hand, its face to us, turning a little (it stops with the camera)
  const hw = T.xiangyu ? T.xiangyu.handWorld(1) : hand, tw = 0.35 * Math.sin((Math.min(f, B.hold) - B.tent21) * 0.16);
  const toCam = V(w.camera.position.x - hw.x, 0, w.camera.position.z - hw.z).normalize(), side = V(toCam.z, 0, -toCam.x);
  // (2.5 cm toward the lens, in front of the forearm: straight above the hand it stood 1.1 cm in his bracer; its lower
  //  edge stays on the hand ball, 4 mm off at most)
  w.prop("bi").put(hw.clone().add(V(0, 0.1, 0)).addScaledVector(toCam, 0.025), { up: V(0, 1, 0), face: toCam.clone().multiplyScalar(Math.cos(tw)).addScaledVector(side, Math.sin(tw)) });
  if (LOG && f % 6 === 0 && T.xiangyu) log(f, `21b xyHead ${px(headPx(w, T.xiangyu))} hand ${px(w.project(hw))}`);
  return { camera: c, overlays: flashIn(f, B.tent21), slate: "21b Xiang Yu knows nothing" };
}

// ====================================================================================================== line 22
/** line 22 (the film's last shot, another builder's): the privy, Liu Bang as himself, the hand low. Its LAST frame
 *  (the film's last frame) is the same picture as the film's frame 0: privyClosing(g, len - 1) gives clock 0 on
 *  g = len - 1, which is exactly privyOpening(0). Nothing here may depend on w.t. UNCHANGED from the skeleton. */
function shot22(w: World, f: number): Pose {
  const s = S22, P = privyClosing(f - s.from, s.to - s.from);
  w.setPlace("privy");
  w.setCamera(P.cam);
  w.actor(LIU_PRIVY).set({ ...P.state, visible: P.who === 0 });
  w.actor(LIU_DAGE).set({ ...P.state, visible: P.who === 1 });
  return { camera: P.cam, clock: P.t, hud: false, slate: `${s.id} ${s.place}/${s.cam}` };
}

// ====================================================================================================== the segment
const TABLE: [number, (w: World, f: number) => Pose][] = [
  [S18a.from, shot18a], [S18b.from, shot18b], [S19a.from, shot19a], [S19b.from, shot19b],
  [S20.from, shot20a], [B.bust, shot20i], [B.back, shot20c], [S21.from, shot21a], [B.tent21, shot21b], [S22.from, shot22],
];
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) { let fn = TABLE[0][1]; for (const [from, g] of TABLE) if (f >= from) fn = g; return fn(w, f); },
};
/** the cuts of this segment, for a check: [first frame, what] */
export const CUTS_E = TABLE.map(([from, g]) => [from, g.name] as [number, string]);
