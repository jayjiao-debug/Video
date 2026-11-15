// SEGMENT E, lines E32-E40: 傍晚, packing in the new house. WP5 segE. PLAN.md 8E, beats.ts BEAT.E.
// One take in her eyes, still by default (camera pass, PLAN 12; the fade through gold in from D, the fade through deep
// blue out to F; the camera's seven moves are listed at camE):
//   pre      E pre     the gold evening light through the lattice window; from the front-left corner by the trunks: the open trunks,
//                      the WIFE standing by the first one folding a robe in the air, the two KIDS sitting very still on the
//                      bench along the back wall, SU at his desk under the window writing the letter, humming (smile_closed,
//                      a slight sway of the head to his tune), the brush on its strokes.
//   E32      ask       hesitant: she walks up to the desk while she asks (mic swings in); he writes on, the brush stops on
//                      不跟您去 and he looks up, kind.
//   E33      family    matter-of-fact, kind; on 给他们住 (BEAT.E.glance) he glances at the family (gaze, a tilt) and she
//                      follows his look (a pan to the wife and the kids, who look up), then back to him.
//   E34-E35  letter    「您在写什么？」 she leans in over the desk (the letter, the brush, his face above it); he writes as he
//                      speaks, breezy, like reading a to-do list (the strokes go on; a flourish of a dot on 做棺材). The
//                      wife's hands stop on 做棺材 (she knows).
//   E36      jolt      「啊？」: one decaying jolt (BEAT.E.jolt); he does not stop writing, a quick glance up.
//   E37-E38  item two  the same breezy tone, a nod on 坟; she holds still, scared to ask; he stops writing, smug.
//   E39      grin      「找吃的。」 a snap zoom lands on 找: he looks up grinning, the brush raised like a pointer, a laugh on 吃.
//   card 3   blot      she steps back and a half step to his right so he sits in the right of the frame (card 3 on the left): the brush still in his fist, he lifts the letter in both hands to his chest, tipped
//                      toward her so the writing shows, blows the ink dry (whistle), still humming, and lays it back
//                      (BEAT.E.blot).
//   E40      aside     her aside (PLAN 12.4: it never leaves him): a slow push on him while he sits humming over the
//                      finished letter in the last gold light (the kids and the wife go sad off screen); her voice wobbles:
//                      from 他觉得 (BEAT.E.sag) the lens sinks 6 cm and tips 1.5 deg. The fade through deep blue is the
//                      HUD's (TRANSITIONS).
// Every frame from beats.ts (BEAT.E) / lineId / capWord / card / SEGMENTS; every mark from layout/room.ts (ROOM.desk,
// ROOM.trunks, ROOM.wife, ROOM.bench) and props/ (deskSeat, benchSeat); her mic is her.ts (lowered out of the caption
// band here, segC's way); held props pinned after w.update(). The wife's robe is this file's own little prop (built once
// per World in the props group as "prop.robe": two hinged cloth halves), so the clearance checker tests it.
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, card, clamp01, lerp, smooth, easeOutQuad, easeOutCubic, easeInOutCubic, type Pose, type Segment, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU, WIFE, KID, KID2, SU_HAT } from "../people";
import { ROOM, EYE } from "../layout";
import { deskSeat, benchSeat, DESK, TRUNK } from "../props";
import { putHer, herKeys, type MicO } from "../her";
import { transitionAt } from "../hud";
import { setSeat } from "../../../kit/acc/garb";
import { makeKit, Part, box } from "../../../kit/props/kit";
import type { World } from "../world";
import { V, rel, says, accent, heads, at, ky, frag, lid, swaps, headM, type Rig, type RigState } from "./common";

type St = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const PI = Math.PI;
const S = SEGMENTS[4], B = BEAT.E;
const ln = (id: string) => lineId(id);
const word = (id: string, w: string) => capWord(id, w).from;

// ------------------------------------------------------------------------------------------------------- the beats
const L32 = ln("E32"), L33 = ln("E33"), L34 = ln("E34"), L35 = ln("E35"), L36 = ln("E36"), L37 = ln("E37"), L38 = ln("E38"), L39 = ln("E39"), L40 = ln("E40");
const CARD3 = card("E39");
const W_BUGEN = word("E32", "不跟您去"), W_XIAO = word("E33", "小儿子"), W_FANG = word("E33", "房子");
const W_ANPAI = word("E35", "安排"), W_DIYI = word("E35", "第一件事"), W_GUAN = word("E35", "棺材");
const W_DIER = word("E37", "第二件事"), W_FEN = word("E37", "坟"), W_CHI = word("E39", "吃");
const W_XIAOZHE = word("E40", "笑着"), W_HUI = word("E40", "回不来");
/** he lifts the letter in both hands (the brush still in his right), blows the ink dry, lays it back */
const LIFT = [B.blot, B.blot + 14] as const, BLOW = [B.blot + 16, B.blot + 46] as const, LAY = [B.blot + 52, B.blot + 66] as const;

// ------------------------------------------------------------------------------------------------------- the marks
/** the desk, his cushion and seat (deskSeat: he faces +z, toward her) */
const DESK_AT = ROOM.desk;
const DS = deskSeat(DESK_AT);
const FACE = DS.facing;
const TOP = DESK_AT.y + DESK.top;
/** his seat: the shins rest on the cushion (Qin's way: the seat's floor is the cushion's top) */
const SEAT = { ...DS.seat, floor: DS.seat.top.y };
/** a point in his seated frame: x = to his LEFT (screen right), y up from the floor, z forward (toward her) */
const hp = (x: number, y: number, z: number) => rel(DS.at, FACE, x, y, z);
/** his head centre seated at the desk (measured with the probe) */
const HEAD = hp(0, 0.85, 0.04);
/** the letter (its middle on the desk, turned so its writing faces him: the paperweight at the far edge), the ink stone
 *  at his right, the brush laid down beside it */
const LETTER_AT = hp(-0.05, TOP, 0.42), LETTER_ROT = PI;
const INK_AT = hp(-0.4, TOP, 0.53);

/** the wife stands by the first trunk folding a robe in the air, turned into the room toward the desk */
const WIFE_AT = ROOM.wife, WIFE_FACE = 0.6;
const wp = (x: number, y: number, z: number) => rel(WIFE_AT, WIFE_FACE, x, y, z);
/** the two kids on the bench (the bench's feet stop 1.5 cm over its origin: put it that much lower, segB's note) */
const BENCH_AT = ROOM.bench.clone().add(V(0, -0.015, 0));
// (camera pass: both kids sit 0.6 / 0.3 m further along the bench toward the desk (were -0.35 / +0.35), so that on his
// glance at the family (E33) the wife no longer hides the older one from where she stands)
const KIDS = [benchSeat(BENCH_AT, 0, 0.25), benchSeat(BENCH_AT, 0, 0.65)];
const KID_HIDE: string[][] = [["robe"], ["robe"]];

// ------------------------------------------------------------------------------------------------------- her camera
// THE CAMERA PASS (PLAN 12; the plan table is /home/user/su_work/cam2/E_plan.md): ONE TAKE, still by default (her calm
// breathing only), seven moves, each for a reason, each landing on its beat; between them the lens holds.
//   1 walk in      pre -> E32: from the front-left corner by the trunks (the open trunk with the robes in the
//                  foreground, the wife folding, the kids on the bench, him at the desk under the gold window) she
//                  walks up to his right-front while she asks (someone arrives)
//   2 his look     E33 给他们住: she follows his glance to the wife and the kids (the lead looks at something)
//   3 back + in    E34 您在写什么: back along the look and a step in over the desk: the letter low, his face above
//                  (the speaker changes), landing on E34's first frame
//   4 jolt         E36 啊: one decaying jolt (a hit)
//   5 snap zoom    E39 找吃的: the lens narrows by 0.72 onto his grin and the raised brush, landing on 找 (the punch word
//                  of the build: coffin, grave, FOOD)
//   6 step back    card 3: a step back and a half step to his right (calm, after the jolt and the snap): him in the
//                  right of the frame, the letter he lifts to the lens clear of the card, the desk filling the bottom
//   7 slow push    E40 (her aside: it stays on him): about 10 deg of lens over 3.2 s, a thought landing; from 他觉得
//                  her voice wobbles: the lens sinks 6 cm and the horizon tips 1.5 deg. The deep-blue fade is the HUD's.
/** a camera at `pos` aimed so the world point `target` lands at screen (sx, sy) px (of 1080 x 1920; no roll) */
const aim = (pos: Vec3, target: THREE.Vector3, sx: number, sy: number, fov = C.FOV): { pos: Vec3; look: Vec3 } => {
  const p = V(...pos), d = target.clone().sub(p), hd = Math.hypot(d.x, d.z), t = Math.tan((fov * Math.PI) / 360);
  const f0 = V(d.x / hd, 0, d.z / hd), r0 = V(-f0.z, 0, f0.x);
  const dyaw = Math.atan((sx / 540 - 1) * t * (9 / 16)), pitch = Math.atan2(d.y, hd) - Math.atan((1 - sy / 960) * t);
  const fw = f0.multiplyScalar(Math.cos(dyaw)).addScaledVector(r0, -Math.sin(dyaw)).multiplyScalar(Math.cos(pitch)).add(V(0, Math.sin(pitch), 0));
  const l = p.addScaledVector(fw, d.length());
  return { pos, look: [l.x, l.y, l.z] };
};
/** a set-up: the lens at pos, the world point tgt on screen (sx, sy), the lens angle */
type Shot = { pos: THREE.Vector3; tgt: THREE.Vector3; sx: number; sy: number; fov: number };
const shot = (pos: THREE.Vector3, tgt: THREE.Vector3, sx: number, sy: number, fov = C.FOV): Shot => ({ pos, tgt, sx, sy, fov });
const mixS = (a: Shot, b: Shot, t: number): Shot => ({ pos: a.pos.clone().lerp(b.pos, t), tgt: a.tgt.clone().lerp(b.tgt, t), sx: lerp(a.sx, b.sx, t), sy: lerp(a.sy, b.sy, t), fov: lerp(a.fov, b.fov, t) });
const camOf = (s: Shot): CamPose => { const k = aim([s.pos.x, s.pos.y, s.pos.z], s.tgt, s.sx, s.sy, s.fov); return { pos: k.pos, look: k.look, fov: s.fov }; };
/** where she stands: metres from his seat (x = world +x, his left / screen right; z = toward the front) */
const her = (x: number, z: number) => V(DS.at.x + x, EYE, DS.at.z + z);
/** the family's middle (the wife's head and the kids' on the bench), for his glance */
const FAMILY_AT = V((WIFE_AT.x + BENCH_AT.x) / 2 - 0.05, 1.0, (WIFE_AT.z + BENCH_AT.z) / 2);
/** 0 pre: the wide (her zoom out, fov 72) from the front-left corner by the trunks: the near trunk in the lower left
 *  foreground, the open trunk with the robes, the kids on the bench, the wife folding, him at the desk on the right */
const OPEN = shot(her(-3.65, 3.5), HEAD, 900, 680, 72);
/** 1 the talk: his right-front, 3 m: the two-thing (him, the desk, the letter) */
const TALK = shot(her(-0.85, 2.95), HEAD, 600, 690);
/** 2 his look: the wife and the kids (a pan from where she stands) */
const FAMILY = shot(TALK.pos, FAMILY_AT, 480, 700);
/** 3 您在写什么: a step in, over the desk: the letter low, his face above */
const PEEK = shot(her(-0.55, 1.95), HEAD, 580, 675);
/** 5 找吃的: the snap: the lens narrows onto his face and the raised brush */
const SNAP = shot(PEEK.pos, HEAD, 590, 770, C.FOV * 0.72);
/** 6 card 3: a step back and a half step to his right, bending a little to see the letter he holds up (eyes 1.3 m), her
 *  widest lens (80) close to the desk so the desk fills the middle of the frame: him right of the card, the letter clear of it */
const CARDV = shot(her(-0.9, 1.8).setY(EYE - 0.2), HEAD, 820, 600, 80);
/** 7 E40: the slow push lands here (the same place, the lens 10 deg narrower, him eased toward the middle) */
const PUSH = shot(CARDV.pos, HEAD, 640, 760, 68);
/** the moves: [from, to, set-up, ease] (each lands on its `to`) */
const out3 = easeOutCubic;
const WALK = [S.from + 12, L32.from + 56] as const;
const MOVES: [number, number, Shot, (x: number) => number][] = [
  [WALK[0], WALK[1], TALK, easeInOutCubic],             // 1 she walks up to him (someone arrives)
  [B.glance, B.glance + 11, FAMILY, easeInOutCubic],    // 2 along his look to the family (he looks on 给他们住)
  [L34.from - 16, L34.from, PEEK, easeInOutCubic],       // 3 back to him and a step in over the letter (the speaker changes)
  [L39.from - 5, L39.from, SNAP, out3],                  // 5 snap zoom on 找
  [L39.to - 6, L39.to + 20, CARDV, easeOutQuad],         // 6 step back and drift (he shows the letter); whole-film QA: it starts on
  //                                                        找吃的's tail, so his chin clears card 3's top edge by the card's first frame
  [L40.from + 6, B.fade[1] - 9, PUSH, smooth],           // 7 slow push (the aside stays on him)
];
/** the jolt on 啊 (one per event): a small shake that decays over n frames */
const jolt = (c: CamPose, f: number, on: number, amp = 1, n = 8): CamPose => {
  const k = f - on; if (k < 0 || k >= n) return c; const d = amp * Math.pow(1 - k / n, 2);
  return C.nudge(c, { yaw: 0.9 * d * Math.sin(k * 2.3), pitch: 0.7 * d * Math.cos(k * 2.9) - 0.6 * d, roll: 0.5 * d * Math.sin(k * 1.7), up: -0.012 * d });
};
/** her camera on frame f (pure): the set-ups and their moves, her calm breathing (the walk bob while she walks in),
 *  the jolt on 啊, the wobble under 他觉得 */
export const camE = (f: number): CamPose => {
  let s = OPEN;
  for (const [a, b, to, e] of MOVES) if (f >= a) s = mixS(s, to, e(clamp01((f - a) / Math.max(1, b - a))));
  let c = camOf(s);
  c = C.handheld(c, f, { mood: "calm", walk: [[S.from, 0], [WALK[0] + 4, 1], [WALK[1] - 18, 1], [WALK[1], 0]], amp: 0.7, seed: 5 });
  c = jolt(c, f, B.jolt, 1.6);
  const wob = easeInOutCubic(clamp01((f - B.sag) / 45));
  return wob > 0 ? C.nudge(c, { up: -0.06 * wob, roll: 1.5 * wob }) : c;
};

// ------------------------------------------------------------------------------------------------------- his hands
/** writing 0..1: the brush hand on its strokes (else lifted, talking) */
const writing = (f: number) => ky(f, [
  [S.from, 1], [W_BUGEN + 2, 1], [W_BUGEN + 10, 0], [L34.from - 2, 0], [L34.from + 8, 1], [L36.from + 2, 1], [L36.from + 8, 0.6],
  [L36.to, 1], [L38.from + 6, 1], [L38.from + 16, 0],
]);
/** the brush raised like a pointer (找吃的) */
const raise = (f: number) => ky(f, [[L39.from - 8, 0], [L39.from + 4, 1]]);
/** the brush hand's stroke on the desk (Qin's write loop, 2.4 s, on his own clock), over the letter: his frame */
const stroke = (f: number) => {
  const t = f / FPS, T = 2.4, u = (((t / T) % 1) + 1) % 1, back = u < 0.84 ? 0 : (u - 0.84) / 0.16, along = u < 0.84 ? u / 0.84 : 1 - smooth(back), w = t * 2 * PI * 2.2;
  return hp(-0.07 - (along - 0.5) * 0.075 + 0.0065 * Math.sin(w), TOP + 0.15 + 0.012 * Math.sin(PI * back), 0.37 + 0.004 * Math.sin(w + 1.1));
};
/** the flourish on 做棺材: the brush flicks up off the paper and comes back down onto the stroke */
const dot = (f: number) => (f >= W_GUAN + 4 && f < W_GUAN + 16 ? 0.035 * Math.sin(((f - W_GUAN - 4) / 12) * PI) : 0);
const FREE = hp(-0.17, TOP + 0.2, 0.33), RAISED = hp(-0.21, TOP + 0.36, 0.37), REST_R = hp(-0.27, TOP + 0.06, 0.36);
/** both hands on the letter's near corners (his right = -x), the letter lifted to his chest and tipped forward (his
 *  edge up, the sheet's face toward her lens) while he blows on the ink */
const letterLift = (f: number) => ky(f, [[LIFT[0], 0], [LIFT[1], 1], [LAY[0], 1], [LAY[1], 0]]);
/** the hand ball's radius: a hand ON the sheet sits this far above it (else it sinks into the desk) */
const GRIP_Y = 0.026;
const letterPose = (k: number) => {
  const c = LETTER_AT.clone().lerp(hp(-0.03, TOP + 0.24, 0.38), k), tilt = 0.5 * k;
  const s = Math.sin(tilt), co = Math.cos(tilt);
  return { at: c, rot: [-tilt, LETTER_ROT, 0] as [number, number, number], corners: [c.clone().add(V(-0.13, 0.09 * s + GRIP_Y, -0.09 * co)), c.clone().add(V(0.13, 0.09 * s + GRIP_Y, -0.09 * co))] };
};
/** the left hand resting on the letter's left edge (it holds the sheet while he writes) */
const LEFT_REST = hp(0.15, TOP + 0.026, 0.42);
const handR = (f: number): THREE.Vector3 => {
  const wr = writing(f), rs = raise(f);
  let h = stroke(f).add(V(0, dot(f), 0)).lerp(FREE, 1 - wr).lerp(RAISED, easeInOutCubic(rs));
  // card 3: the brush hand comes down to the letter's right corner (the brush still in it); the lift; back to rest
  if (f >= CARD3.from) {
    const L = letterPose(letterLift(f)).corners[0];
    if (f < LIFT[0]) h = h.lerp(L, smooth(clamp01((f - CARD3.from) / (LIFT[0] - CARD3.from))));
    else if (f < LAY[1]) h = L;
    else h = L.lerp(REST_R, smooth(clamp01((f - LAY[1]) / 12)));
  }
  return h;
};
const handL = (f: number): THREE.Vector3 => {
  if (f < LIFT[0] - 12) return LEFT_REST.clone();
  const L = letterPose(letterLift(f)).corners[1];
  if (f < LIFT[0]) return LEFT_REST.clone().lerp(L, smooth(clamp01((f - LIFT[0] + 12) / 12)));
  if (f < LAY[1]) return L;
  return L.lerp(LEFT_REST, smooth(clamp01((f - LAY[1]) / 12)));
};
/** the brush in his hand: writing (the tip down onto the letter), lifted, raised like a pointer; while he holds the
 *  letter up it points up and out past its corner; at rest on the desk it lies in his fist pointing away */
const BRUSH_OUT: [number, number, number] = [PI / 2, 0, -0.75], BRUSH_DOWN: [number, number, number] = [PI / 2, 0, 0.5];
const brushRot = (f: number): [number, number, number] => {
  const wr = writing(f), rs = easeInOutCubic(raise(f));
  const rx = lerp(lerp(PI * 0.62, PI * 0.85, wr), 0.35, rs);
  // from the raised pointer (it never points down again) to lying level in his fist, its tip in over the sheet and its
  // tail out to his right (clear of his beard when the letter comes up to his chest), turned before the hand comes down
  const out = ky(f, [[L39.to + 2, 0], [CARD3.from + 4, 1]]), down = ky(f, [[LAY[1], 0], [LAY[1] + 12, 1]]);
  const a: [number, number, number] = [lerp(rx, BRUSH_OUT[0], out), 0, lerp(0, BRUSH_OUT[2], out)];
  return [lerp(a[0], BRUSH_DOWN[0], down), 0, lerp(a[2], BRUSH_DOWN[2], down)];
};

// ------------------------------------------------------------------------------------------------------- his face
const EXPR: [number, Expr][] = [
  [S.from, "smile_closed"], [W_BUGEN + 6, "smile"], [L33.from, "smile"], [B.glance, "smile_closed"], [L33.to + 4, "smile"],
  [L34.from + 6, "smile_closed"], [W_ANPAI, "smile"], [W_DIYI, "happy"], [W_GUAN + 2, "smile"], [L36.from + 4, "smile"],
  [W_DIER, "happy"], [W_FEN + 4, "smile"], [L38.from + 10, "smug"], [L39.from, "grin"], [W_CHI + 2, "laugh"], [L39.to + 6, "happy"],
  [CARD3.from + 10, "smile_closed"], [BLOW[0], "whistle"], [BLOW[1], "smile_closed"],
];
/** humming: the head sways to his tune (pre, the writing under her questions, the card and E40) */
const humming = (f: number) => ky(f, [[S.from, 1], [L32.from + 20, 1], [W_BUGEN + 4, 0], [CARD3.from + 6, 0], [CARD3.from + 18, 1], [BLOW[0] - 2, 1], [BLOW[0] + 4, 0], [BLOW[1], 0], [BLOW[1] + 10, 1]]);
const lookDownAt = (f: number) => {
  const wr = writing(f);
  const blow = ky(f, [[LIFT[0], 0], [LIFT[1], 9], [LAY[1], 9], [LAY[1] + 10, 4]]);
  const end = f >= LAY[1] ? ky(f, [[LAY[1], 4], [L40.from, 6], [W_HUI, 3]]) : 0;
  return Math.max(14 * wr * (1 - raise(f)), blow, end);
};
const headAt = (f: number) => {
  const t = f / FPS, hum = humming(f);
  const sway = hum * (3.2 * Math.sin(2 * PI * t / 1.9) + 0.9 * Math.sin(2 * PI * t / 0.95 + 0.6));
  const glance = ky(f, [[B.glance - 2, 0], [B.glance + 6, 1], [L33.to - 6, 1], [L33.to + 4, 0]]);
  const bob = hum * 0.012 * Math.sin(2 * PI * t / 0.95);
  return heads(
    { tilt: sway - 7 * glance, dx: -0.12 * glance, dy: headM(bob) },
    accent("nod", f, W_XIAO, { amp: 0.6 }), accent("nod", f, W_GUAN + 6, { amp: 0.6 }), accent("nod", f, W_FEN + 2, { amp: 0.7 }),
    accent("laugh", f, W_CHI, { dur: 0.8, amp: 0.8 }), accent("pop", f, L39.from + 2),
  );
};
/** where he looks: at her; at the family on 给他们住 (screen left); up at her from the letter on 啊 */
const gazeAt = (f: number) => (f >= B.glance + 2 && f < L33.to - 4 ? -1 : 0);

// ------------------------------------------------------------------------------------------------------- him
const suState = (f: number): St => {
  const sp_ = says("su", ["E33", "E35", "E37", "E39"], f, 1);
  const glanceUp = f >= L36.from + 2 && f < L36.to + 6;     // a quick glance up at her on 啊 (the head lifts out of the strokes)
  return {
    at: DS.at, facing: FACE, seat: SEAT,
    pose: { kind: "sit", t: f / FPS },
    expr: at(f, EXPR), ...sp_,
    blink: Math.max(lid(f / FPS, 4, swaps(EXPR)), sp_.blink ?? 0, f >= LAY[1] + 20 && f < W_HUI ? 0.5 : 0),
    head: heads(sp_.head, headAt(f)),
    gaze: gazeAt(f),
    lookDown: glanceUp ? 2 : lookDownAt(f),
    hide: [...SU_HAT.cap],
    visible: true,
  };
};

// ------------------------------------------------------------------------------------------------------- the family
/** THE WIFE'S ROBE: two cloth halves on a hinge (this file's prop, built once per World in the props group so the
 *  clearance checker sees it). Its origin = the middle of the near edge (where her two hands hold it); the cloth lies
 *  along +z from there: the near half, the hinge 0.2 m out, the far half; fold 0 = open flat .. 1 = the far half laid
 *  over the near one. */
const ROBE = { w: 0.34, half: 0.2, t: 0.012 };
type RobeG = { g: THREE.Group; hinge: THREE.Group };
const ROBES = new WeakMap<World, RobeG>();
const robeOf = (w: World): RobeG => {
  let r = ROBES.get(w);
  if (!r) {
    const K = makeKit(w.M), cloth = K.flat("#c08a8e", { rough: 0.9 }), band = K.flat("#8d5a62", { rough: 0.9 });
    const g = new THREE.Group(); g.name = "prop.robe"; g.visible = false;
    const A = new Part(K);
    A.add(cloth, box(ROBE.w, ROBE.t, ROBE.half, 0, 0, ROBE.half / 2), 0.003);
    A.into(g, "robe.near");
    const hinge = new THREE.Group(); hinge.position.set(0, 0, ROBE.half); g.add(hinge);
    const Bp = new Part(K);
    Bp.add(cloth, box(ROBE.w, ROBE.t, ROBE.half - 0.03, 0, -ROBE.t - 0.0005, (ROBE.half - 0.03) / 2), 0.003);
    Bp.add(band, box(ROBE.w, ROBE.t + 0.001, 0.03, 0, -ROBE.t - 0.0005, ROBE.half - 0.015), 0.003);
    Bp.into(hinge, "robe.far");
    w.props.group.add(g);
    r = { g, hinge };
    ROBES.set(w, r);
  }
  return r;
};
/** her folding: a 4 s loop (her own clock, which stops while she listens): lift the folded robe and shake it open, lay it
 *  flat, fold the far half over, smooth it twice with her left hand, a breath */
const FOLD_P = 120;
/** her clock: it stops on 做棺材 for 1.5 s (she knows) and from E40 on (she watches him) */
const wifeClock = (f: number) => f - Math.min(45, Math.max(0, f - W_GUAN)) - Math.max(0, f - L40.from);
const folding = (f: number) => {
  const tau = wifeClock(f) - S.from + 70, u = (((tau / FOLD_P) % 1) + 1) % 1, t = f / FPS;
  // the robe's fold (1 = folded), the hands' lift above the waist line and forward, the shake
  const fold = u < 0.1 ? 1 : u < 0.3 ? 1 - smooth((u - 0.1) / 0.2) : u < 0.4 ? 0 : u < 0.62 ? smooth((u - 0.4) / 0.22) : 1;
  const lift = u < 0.1 ? 0 : u < 0.22 ? smooth((u - 0.1) / 0.12) : u < 0.4 ? 1 - smooth((u - 0.22) / 0.18) : u < 0.62 ? 0.25 * Math.sin(((u - 0.4) / 0.22) * PI) : 0;
  const shake = u >= 0.2 && u < 0.3 ? 0.014 * Math.sin(2 * PI * 6 * t) * Math.sin(((u - 0.2) / 0.1) * PI) : 0;
  const pat = u >= 0.64 && u < 0.84 ? Math.max(0, Math.sin(((u - 0.64) / 0.2) * 2 * PI)) : 0;
  const y = 0.76 + 0.1 * lift + shake, z = 0.22 + 0.05 * lift;
  const near = [wp(-ROBE.w / 2 + 0.02, y, z), wp(ROBE.w / 2 - 0.02, y, z)] as [THREE.Vector3, THREE.Vector3];
  const patAt = wp(0.03, y + 0.05 + 0.03 * pat, z + 0.1);
  const hands: [THREE.Vector3, THREE.Vector3] = [near[0], u >= 0.64 && u < 0.84 ? near[1].clone().lerp(patAt, smooth(Math.min(1, ((u - 0.64) / 0.2) * 3, (0.84 - u) / 0.2 * 3))) : near[1]];
  return { fold, origin: wp(0, y, z), hands };
};
const wifeExpr = (f: number): Expr => at(f, [[S.from, "smile_closed"], [W_GUAN + 4, "sad"], [W_GUAN + 50, "smile_closed"], [L36.from, "neutral"], [L36.to + 20, "smile_closed"], [L40.from, "sad"]]);
const kidGaze = (f: number, k: number) => at(f, [[S.from, 0], [B.glance + 6 + 4 * k, 0], [L33.to, 0.5], [L34.from + 10 * k, 0], [L36.from + 2 + 3 * k, 0.5], [L37.to - 10 * k, 0], [L40.from + 8 * k, 0.5]]);

export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {},
  exit(w) {
    const r = ROBES.get(w); if (r) r.g.visible = false;
    for (const P of [KID, KID2]) setSeat(w.actor(P), null);
  },
  pose(w, f): Pose {
    const t = f / FPS;
    w.setPlace("room");
    w.set.param("sun", ky(f, [[L40.from, 1], [S.to, 0.82]]));
    const cam = camE(f);
    w.setCamera(cam);
    // him at the desk
    const su = w.actor(SU);
    su.set({ ...suState(f), hands: [handR(f), handL(f)] });
    // the wife folding by the trunk
    const fo = folding(f), wc = wifeClock(f);
    const wi = w.actor(WIFE);
    wi.set({
      at: WIFE_AT.clone(), facing: WIFE_FACE, pose: { kind: "idle", t: t + 0.7 }, expr: wifeExpr(f),
      blink: lid(t, 9), gaze: f >= L40.from || (f >= W_GUAN + 4 && f < W_GUAN + 50) ? 0.5 : f >= L36.from && f < L36.to + 20 ? 0.5 : 0,
      lookDown: f >= L40.from ? 4 : f >= W_GUAN + 4 && f < W_GUAN + 50 ? 18 : 10 + 4 * Math.sin(wc / 23),
      hands: fo.hands, visible: true,
    });
    // the kids on the bench, very still (breathing, blinks, a look at grandpa now and then)
    [KID, KID2].forEach((P, k) => {
      const kr = w.actor(P), s = KIDS[k];
      kr.set({ at: s.at, facing: s.facing, seat: s.seat, pose: { kind: "sit", t: t * 0.7 + k }, expr: f >= L40.from + 4 + 6 * k ? "sad" : "neutral", blink: lid(t, 11 + k), gaze: kidGaze(f, k), lookDown: 4, hide: KID_HIDE[k], visible: true });
      setSeat(kr, s.seat, s.facing);
    });
    w.update();
    // the room's things
    w.prop("desk").put(DESK_AT);
    w.prop("cushion").put(DS.cushion, { rot: FACE });
    w.prop("inkstone").put(INK_AT);
    const lift = letterLift(f), LP = letterPose(lift);
    const ink = 0.3 + 0.6 * clamp01((f - S.from) / (L38.from + 16 - S.from));
    w.prop("letter").put(LP.at, { rot: lift > 0 ? LP.rot : LETTER_ROT, ink });
    w.prop("brush").put(su.handWorld(0), { grip: "hilt", rot: brushRot(f) });
    ROOM.trunks.forEach((p, i) => w.prop("trunk", `t${i}`).put(p, { open: 1, rot: i ? 0.5 : 0 }));
    w.prop("robes").put(ROOM.trunks[0].clone().add(V(0.1, TRUNK.h - TRUNK.lid + 0.014, 0)));
    w.prop("bench").put(BENCH_AT);
    // the wife's robe between her hands
    const R = robeOf(w);
    R.g.visible = true;
    R.g.position.copy(fo.origin);
    R.g.rotation.set(0, WIFE_FACE, 0, "YXZ");
    R.hinge.rotation.set(-PI * fo.fold, 0, 0);
    // her mic: toward him while she talks to him, down under the card, to the lens for the aside
    const head = su.headWorld(), mouth = head.clone().add(V(0, -0.1, 0.18));
    const mk = herKeys(f, MIC_KEYS);
    putHer(w, cam, f, { mic: { ...mk, aim: mouth, avoid: [head] } });
    lowerMic(w, cam, micDrop(mk));
    return {
      camera: cam,
      overlays: frag(transitionAt(f)?.node ?? null),
      slate: `E ${f < L32.from ? "pre" : f < L33.from ? "ask" : f < L34.from ? "family" : f < L36.from ? "letter" : f < L37.from ? "jolt" : f < L39.from ? "item two" : f < CARD3.from ? "grin" : f < L40.from ? "blot" : "aside"}`,
    };
  },
};

// ------------------------------------------------------------------------------------------------------- her mic
const MIC_KEYS: [number, MicO["mode"], number?][] = [
  [L32.from - 8, "in", 10], [CARD3.from + 4, "low", 16], [B.aside, "lens", 10],
];
// her.ts points the mic (head at NDC y -0.6) and the lens mic (-0.66) into the caption band's bottom (y 1190-1498): here
// it goes lower on screen, in camera space, by NDC units (segC's fix; requests.md WP5 segC -> WP3)
const MIC_DROP: Record<MicO["mode"], number> = { in: 0.16, toward: 0.16, lens: 0.08, low: 0, off: 0.16 };
const micDrop = (m: { mode: MicO["mode"]; from: MicO["mode"]; k: number }) => lerp(MIC_DROP[m.from], MIC_DROP[m.mode], smooth(m.k));
const lowerMic = (w: World, cam: CamPose, ndc: number) => {
  const g = w.prop("herMic").group;
  if (ndc <= 0 || !g.visible) return;
  const A = C.camAxes(cam), d = g.position.clone().sub(A.p).dot(A.fwd);
  g.position.add(A.up.multiplyScalar(-ndc * d * Math.tan(((cam.fov ?? C.FOV) * Math.PI) / 360)));
};
// (named for the plan, not used by the camera)
void W_FANG; void W_XIAOZHE;
