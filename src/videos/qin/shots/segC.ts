// SEGMENT C, lines C01-C10: 巳时, the hall with Xu Fu. WP5 segC. PLAN.md 7C, beats.ts BEAT.C.
//   desk    C01-C03  B's last framing continued (he sits at the desk, just woken, glaring into the lens; her eyes
//                    1.6 m in front of the desk); she crouches to his level. C01 she asks; on 喜欢 he weighs her; on 事 he checks
//                    left and right for listeners; THE LEAN (BEAT.C.lean): he leans over the desk, a hand at his mouth,
//                    the cocked-brow "hush" face, she creeps in; 找神仙 whispered. C03 神仙？: she flinches back, he
//                    sits back up proud and nods; his eyes snap to the door (the rush outside)
//   door    C04-C07  WHIP RIGHT to the east door (the whoosh); XU FU runs in with the rolled sea chart, slides to his
//                    knees; she backs off and pans to the two-shot. 有消息了: the emperor pops half up (her pan
//                    lands on him), eyes wide, grins; 只是 he catches himself (stern, a look at the lens: you saw nothing);…… Xu Fu wilts; 大鱼: the chart unrolls (the painted fish); 挡着道: the
//                    emperor huffs. C05 鱼？ he leans in; Xu Fu rolls the chart up; C06 好大一条 the roll swings out, his arms
//                    fly up (THIS big). C07 拿弩来: he STANDS, points at the door; she steps in and tilts up; Xu Fu bows out
//   table   flash    the dream blur into THE COAST on the sand table: the tiny emperor on the shore with the repeating
//                    crossbow (over his shoulder: a back view), the giant fish breaching; the shot (the crossbow cue),
//                    the bolt flies, POP (splash_pop), the fish rolls belly-up; he turns to us, laughing, the crossbow
//                    shown off at his chest (below his face), hopping.
//                    Framed below the fact card's y 300-560
//   wall    C08      WHIP LEFT out of the table into her corner by the west front pillar (red, close at the left; the
//                    west wall itself is unlit): she whispers to the audience (leans in on 偷偷, a glance over her
//                    shoulder on 徐福, droops on 再也没回来)
//   close   C09-C10  WHIP RIGHT back: he is RIGHT THERE (leanStand: his head 60 % of the width), suspicious (deadpan,
//                    the slit eyes, a tilt); C10 she is flustered (the camera fidgets and bows), he leans closer, his
//                    eyes go to the door on 徐先生, back to the lens: huff. The last 5 frames whip out (D lands it)
// Every frame is looked up (line / capWord / BEAT / SEGMENTS); the sound cues of the mix are matched where they are
// anchored (the crossbow at C07's end + 0.7 s, the pop at + 1.3 s, the whooshes before C04 / C08 / C09).
import * as THREE from "three";
import { SEGMENTS, line, capWord, FPS, clamp01, lerp, lin, smooth, easeOutCubic, easeInOutCubic, quote, type Segment, type Pose, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { EMPEROR, XUFU, type Person } from "../people";
import { QHALL, TABLE, EYE, FOV } from "../layout";
import { deskSeat, holdPoints } from "../props";
import type { World } from "../world";
import { V, v3, rel, lid, at, ky, accent, heads, headM, headPop, speak, frag, walkAlong, kneel, yawTo, lerpA, wrapA, swaps, shake, kick, type Rig, type RigState } from "./common";

type Extra = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[2];
const RAD = Math.PI / 180;
const sec = (s: number) => Math.round(s * FPS);
const word = (id: string, w: string) => capWord(id, w).from;

// ====================================================================================================== the frames
const T = {
  from: S.from,
  likes: word("C01", "喜欢"), shi: word("C01", "事"), c01end: line("C01").to,
  lean: BEAT.C.lean, c02: line("C02").from, shen: word("C02", "神仙"), c02end: line("C02").to,
  c03: line("C03").from, c03end: line("C03").to,
  whipOn: BEAT.C.whip - 4, door: BEAT.C.whip,
  c04: line("C04").from, xianyao: word("C04", "仙药"), xiaoxi: word("C04", "消息"), zhishi: word("C04", "只是"), dayu: word("C04", "大鱼"), dang: word("C04", "挡"), c04end: line("C04").to,
  c05: line("C05").from, c05end: line("C05").to, c06: line("C06").from, haoda: word("C06", "好大"), yitiao: word("C06", "一条"), c06end: line("C06").to,
  stand: BEAT.C.stand, nu: word("C07", "弩"), c07end: line("C07").to,
  flash0: BEAT.C.flash[0], flash1: BEAT.C.flash[1],
  /** the crossbow cue of the mix (C07's end + 0.7 s) and the splash_pop (+ 1.3 s) */
  shot: line("C07").to + sec(0.7), pop: line("C07").to + sec(1.3),
  aside: BEAT.C.aside, c08: line("C08").from, tou: word("C08", "偷偷"), xufu8: word("C08", "徐福"), zaiye: word("C08", "再也"), c08end: line("C08").to,
  back: BEAT.C.back, c09: line("C09").from, shuo: word("C09", "说什么"), c09end: line("C09").to,
  c10: line("C10").from, meishen: word("C10", "没什么"), zhu: word("C10", "祝"), xian10: word("C10", "徐先生"), shunfeng: word("C10", "顺风"), c10end: line("C10").to,
  out: S.to - 4,
};
/** the whip from the table onto the wall starts 4 frames before the wall view (the C08 whoosh) */
const WALL_WHIP = T.aside - 4;
/** the whip back to him (the C09 whoosh): out 4, in 4 */
const BACK_WHIP = T.back;
const CLOSE0 = BACK_WHIP + 8;

// ====================================================================================================== the marks
const SEAT = deskSeat(QHALL.desk);
const ES = EMPEROR.scale ?? 1.08;
/** the cushion's top: his feet rest on it (they went through it to the floor), he stands on it behind the desk */
const CUSHION_TOP = SEAT.seat.top.y;
/** his head, seated at the desk / standing, measured from the rig (clearance --dump) relative to his floor point */
const HEAD_SIT = V(SEAT.at.x, 0.86, SEAT.at.z + 0.06);
const HEAD_STAND = V(SEAT.at.x, 1.38, SEAT.at.z + 0.02);
/** the scabbard he took off, lying on the floor at his right, hilt outward (B's dressing) */
const SCABBARD_AT = V(SEAT.at.x - 0.9, 0.06, SEAT.at.z - 0.15);
/** Xu Fu: in at the east door, a run, the slide to his knees on QHALL.xufuKneel */
const XF_START = V(QHALL.door.x + 0.55, 0, QHALL.door.z);
const XF_KNEEL = QHALL.xufuKneel.clone();
const XF_DIR = XF_KNEEL.clone().sub(QHALL.door).setY(0).normalize();
const XF_SLIDE = XF_KNEEL.clone().addScaledVector(XF_DIR, -0.45);
/** he kneels turned toward the lens a little (the rig cheats the rest), his eyes go to the emperor */
const XF_FACE = -1.35;
const XF_RUN = 3.0;
const XF_RUN0 = T.whipOn + 2;
const XF_LAND = XF_RUN0 + Math.round((walkAlongLen() / XF_RUN) * FPS);
function walkAlongLen() { return Math.hypot(XF_SLIDE.x - XF_START.x, XF_SLIDE.z - XF_START.z); }

// ====================================================================================================== her camera
/** a camera at `pos` turned so that the world point `tgt` lands on screen (sx, sy) (px on 1080 x 1920) */
const aim = (pos: Vec3 | THREE.Vector3, tgt: THREE.Vector3, sy: number, sx = 540, fov = FOV): CamPose => {
  const p = v3(pos), d = tgt.clone().sub(p), hz = Math.hypot(d.x, d.z);
  const tv = Math.tan((fov * RAD) / 2), th = (tv * 9) / 16;
  const pitch = Math.atan2(d.y, hz) - Math.atan(((960 - sy) / 960) * tv), yaw = Math.atan2(d.x, d.z) + Math.atan(((sx - 540) / 540) * th);
  const look = p.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(3));
  return { pos: [p.x, p.y, p.z], look: [look.x, look.y, look.z], fov };
};
const key = (f: number, c: CamPose, ease?: (x: number) => number): C.CamKey => ({ f, pos: c.pos, look: c.look, fov: c.fov, ease });

/** B's last framing: her eyes 1.6 m in front of the desk, his eyes in the upper third */
const DESK_POS = V(QHALL.desk.x, EYE, QHALL.desk.z + 1.6);
const DESK_CAM = aim(DESK_POS, HEAD_SIT, 610);
/** she crouches to his level for the question (from above, the crown's board hid his face) */
const CROUCH_CAM = aim(V(DESK_POS.x - 0.04, 1.2, DESK_POS.z - 0.05), HEAD_SIT, 600);
/** she creeps in as he leans (0.3 m), a little lower */
const LEAN_CAM = aim(V(DESK_POS.x, 1.12, DESK_POS.z - 0.3), HEAD_SIT.clone().add(V(0, -0.03, 0.1)), 640);
/** 神仙？: she jerks back and half up */
const FLINCH_CAM = aim(V(DESK_POS.x + 0.03, 1.36, DESK_POS.z - 0.04), HEAD_SIT, 620);
/** the door, from where she stands */
const DOOR_POS = V(DESK_POS.x + 0.05, EYE - 0.05, DESK_POS.z - 0.05);
/** following Xu Fu to his knees: she backs off a step while she pans with him */
const XF_POS = V(DESK_POS.x + 0.25, EYE - 0.04, DESK_POS.z + 0.3);
/** his head while he runs in and drops to his knees (the camera pans with it) */
const xufuHead = (f: number) => {
  const run = walkAlong([XF_START, XF_SLIDE], XF_RUN, (f - XF_RUN0) / FPS), k = easeOutCubic(clamp01((f - XF_LAND) / 7));
  const p = run.arrived ? XF_SLIDE.clone().lerp(XF_KNEEL, k) : run.at;
  return p.add(V(0, 1.18 - 0.38 * k, 0));
};
const XF_FOLLOW_END = XF_LAND + 8;
const followXufu = (f: number) => aim(DOOR_POS.clone().lerp(XF_POS, easeInOutCubic(clamp01((f - T.door) / (XF_FOLLOW_END - T.door)))), xufuHead(Math.min(f, XF_FOLLOW_END)), 820, 640);
/** THE TWO-SHOT: she has backed off to the right; the emperor upper left, Xu Fu kneeling right of the middle */
const TWO_POS = V(QHALL.xufuKneel.x - 0.25, 1.5, QHALL.xufuKneel.z + 2.3);
const TWO_CAM = aim(TWO_POS, HEAD_SIT, 600, 380);
/** 好大一条: she pans right with Xu Fu's arms as they fly out (the emperor stays in frame, left) */
const TWO_ARMS = aim(TWO_POS, HEAD_SIT, 600, 290);
/** 拿弩来: she steps in toward him and tilts up as he stands (Xu Fu, bowing, leaves the frame right: his face would sit
 *  in the caption band); his eyes under the C07 card's box (y 300-560) */
const STAND_CAM = aim(V(TWO_POS.x - 0.45, TWO_POS.y + 0.03, TWO_POS.z - 0.3), HEAD_STAND, 750, 580);

function deskCam(f: number): CamPose {
  const c = C.povCam(f, [
    key(T.from, DESK_CAM),
    key(T.from + 26, CROUCH_CAM),
    key(T.lean, CROUCH_CAM),
    key(T.lean + 12, LEAN_CAM, easeOutCubic),
    key(T.c03, LEAN_CAM),
    key(T.c03 + 5, FLINCH_CAM, easeOutCubic),
  ], { mood: [[T.from, "calm"], [T.lean, "still"], [T.c03, "excited"]], amp: 0.9, seed: 3 });
  return kick(c, f, T.c03, 0.02);
}
function doorCam(f: number): CamPose {
  if (f < XF_FOLLOW_END) return C.handheld(followXufu(f), f, { mood: "excited", walk: [[T.door, 0], [XF_LAND, 0.6]], amp: 0.9, seed: 5 });
  return C.povCam(f, [
    key(XF_FOLLOW_END, followXufu(XF_FOLLOW_END)),
    key(T.xiaoxi + 8, TWO_CAM),
    key(T.haoda - 2, TWO_CAM),
    key(T.haoda + 8, TWO_ARMS, easeOutCubic),
    key(T.stand, TWO_ARMS),
    key(T.stand + 16, STAND_CAM),
  ], { mood: [[T.door, "excited"], [T.zhishi, "calm"], [T.stand, "excited"]], walk: [[T.door, 0], [XF_LAND, 0.6], [T.xiaoxi + 8, 0]], amp: 0.9, seed: 5 });
}

// ====================================================================================================== the emperor
/** his face: just woken (stern) -> weighs her -> the whisper (hush) -> proud -> 仙药 (shock, grin, caught: stern) ->
 *  鱼 (huff) -> commanding (stern) */
const EMP_EXPR: [number, Expr][] = [
  [T.from, "stern"], [T.likes, "deadpan"], [T.lean, "hush"], [T.c03 + 4, "smug"], [T.c03end, "stern"],
  [T.xiaoxi - 4, "shock"], [T.xiaoxi + 6, "grin"], [T.zhishi, "stern"], [T.dang, "huff"], [T.c05 - 2, "deadpan"],
  [T.haoda + 4, "shock"], [T.yitiao + 4, "cool"], [T.stand - 1, "stern"],
];
/** where his pupils go: the lens; left-right on 事 (anyone listening?); the door at the rush; Xu Fu (screen right) */
const EMP_GAZE: [number, number][] = [
  [T.from, 0], [T.shi, -1], [T.shi + 7, 1], [T.shi + 14, 0], [T.c03end - 6, 1], [T.door, 1], [T.zhishi + 1, 0], [T.zhishi + 11, 1],
  [T.stand + 4, 0.5], [T.nu + 2, 1],
];
/** the rise of C07: 0 seated .. 1 standing (14 frames from BEAT.C.stand) */
const riseAt = (f: number) => easeInOutCubic(clamp01((f - T.stand) / 14));

function emperorHall(w: World, f: number): Rig {
  const t = f / FPS, r = w.actor(EMPEROR);
  const lean = ky(f, [[T.lean, 0], [T.lean + 8, 1], [T.c02end + 3, 1], [T.c03 + 6, 0]]);
  // 有消息了: he pops half up off the cushion, eyes wide, then a grin, as her pan lands on the two-shot (on 仙药 itself
  // her eyes are still on Xu Fu); 只是: he catches himself, sinks back stern and shoots the lens a look (you saw nothing)
  const eager = ky(f, [[T.xiaoxi - 4, 0], [T.xiaoxi + 4, 1], [T.zhishi - 1, 1], [T.zhishi + 9, 0]]);
  const fish = ky(f, [[T.c05 - 3, 0], [T.c05 + 3, 1], [T.c06end, 1], [T.c06end + 6, 0]]);
  const rise = riseAt(f);
  const expr = at(f, EMP_EXPR);
  const head = heads(
    { dy: headM(-0.05) * lean + headM(-0.02) * fish, scale: 1 + 0.06 * lean },
    headPop(f, T.shen), headPop(f, T.xiaoxi - 4, [1.1, 1.06, 1.02]), headPop(f, T.c05), headPop(f, T.nu, [1.1, 1.05, 1.02]),
    accent("jolt", f, T.zhishi + 1, { amp: 0.5 }),
    accent("nod", f, T.c03 + 8, { amp: 1.1 }), accent("jolt", f, T.c03end - 6, { amp: 0.6 }), accent("shake", f, T.dang + 4, { amp: 0.5 }),
    { tilt: 5 * ky(f, [[T.likes, 0], [T.likes + 8, 1], [T.lean, 0]]) - 4 * fish },
  );
  const base: Extra = {
    expr, gaze: at(f, EMP_GAZE), hide: ["swordBelt", "hilt"], visible: true,
    blink: lid(t, 1, swaps(EMP_EXPR)), head,
  };
  const talk = { ...speak(quote("di", "C02"), f, 1, [1]), ...speak(quote("di", "C05"), f, 1, [0]), ...speak(quote("di", "C07"), f, 1, [1]) };
  if (talk.head) talk.head = heads(talk.head, head);
  if (rise < 1) {
    // seated on the cushion behind the desk (as B left him); forward over the desk for the lean,
    // half up off the cushion on 仙药, rising for 拿弩来
    // (the seat's floor is the cushion's top: the crossed shins rest on it instead of going through it)
    const top = SEAT.seat.top.clone();
    const up = Math.max(0.28 * eager, rise);
    top.y = lerp(top.y, CUSHION_TOP + 0.6 * ES, up);
    r.set({
      at: SEAT.at, facing: SEAT.facing, seat: { ...SEAT.seat, top, floor: CUSHION_TOP, back: SEAT.seat.back - 0.1 * lean - 0.07 * eager - 0.05 * fish + 0.1 * rise },
      pose: { kind: "sit", t }, ...base, ...talk,
    });
  } else {
    r.set({ at: SEAT.at.clone().setY(CUSHION_TOP), facing: SEAT.facing, pose: { kind: "idle", t: t + 0.3 }, ...base, ...talk });
  }
  w.update();
  // the hands, pinned on a second solve: the hand at his mouth (the whisper), the point at the door (拿弩来)
  const whisper = ky(f, [[T.lean, 0], [T.lean + 8, 1], [T.c02end + 2, 1], [T.c03 + 4, 0]]);
  // (from the rise's second half: the arm comes up as he gets to his feet, the point lands as 拿弩来 ends)
  const point = ky(f, [[T.stand + 8, 0], [T.stand + 16, 1], [T.flash0 - 1, 1]]);
  if (whisper > 0.01 || point > 0.01) {
    const hd = r.headWorld(), hands: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, null];
    if (whisper > 0.01) hands[0] = r.handWorld(0).lerp(rel(V(hd.x, 0, hd.z), SEAT.facing, -0.33, hd.y - 0.12, 0.17), whisper);
    if (point > 0.01) hands[1] = r.handWorld(1).lerp(rel(SEAT.at, SEAT.facing, 0.6 * ES, 1.12 * ES, 0.3), point);
    r.set({ hands, armFront: [whisper > 0.01 ? true : undefined, undefined] });
    w.update();
  }
  return r;
}

// ====================================================================================================== Xu Fu
const XF_EXPR: [number, Expr][] = [
  [T.whipOn, "grin"], [T.zhishi - 2, "nervous"], [T.dayu, "shock"], [T.dang, "sigh"], [T.c04end + 4, "smug"],
  [T.c06 - 3, "nervous"], [T.stand, "shock"], [T.stand + 10, "nervous"],
];
const XF_GAZE: [number, number][] = [[T.whipOn, -1], [T.zhishi, 1], [T.dayu, -1], [T.c05, -1], [T.haoda + 6, 0], [T.c06end, -1]];

/** 好大一条: he turns his kneeling body toward her lens (a stage cheat) so the spread arms read across the frame */
const XF_TO_LENS = yawTo(XF_KNEEL, TWO_POS);
function xufu(w: World, f: number): void {
  const t = f / FPS, r = w.actor(XUFU);
  const run = walkAlong([XF_START, XF_SLIDE], XF_RUN, (f - XF_RUN0) / FPS);
  const slide = easeOutCubic(clamp01((f - XF_LAND) / 7));
  const k = slide;                                                   // kneeling 0..1
  const floor = run.arrived ? XF_SLIDE.clone().lerp(XF_KNEEL, slide) : run.at;
  const rel0 = T.c06 - 2, sw = smooth(clamp01((f - rel0) / 6));
  const gk = ky(f, [[rel0, 0], [rel0 + 6, 1], [T.c06end + 2, 1], [T.stand + 2, 0]]);
  const facing = lerpA(run.arrived ? lerpA(run.facing, XF_FACE, slide) : run.facing, XF_TO_LENS, 0.9 * gk);
  const drop = 0.38 * k;
  const bowK = ky(f, [[T.stand + 2, 0], [T.stand + 10, 1]]);
  const head = heads(
    accent("nod", f, T.xiaoxi, { amp: 1.2 }), accent("nod", f, T.dayu + 2), headPop(f, T.c04), headPop(f, T.haoda),
    { tilt: -7 * ky(f, [[T.zhishi - 2, 0], [T.zhishi + 4, 1], [T.dayu, 0]]) + 5 * ky(f, [[T.c06, 0], [T.c06 + 6, 1], [T.c06end + 4, 0]]) },
  );
  const sp = speak(quote("xufu", "C04"), f, 2, [0, 2]), sp6 = speak(quote("xufu", "C06"), f, 2, [0, 1]);
  const talk = { ...sp, ...sp6 };
  const kn: Extra = k > 0 ? kneel(k, floor, 10 + 18 * bowK) : { at: floor };
  r.set({
    ...kn, facing, pose: run.moving ? run.pose : { kind: "idle", t: t + 0.7 },
    expr: at(f, XF_EXPR), gaze: at(f, XF_GAZE), blink: lid(t, 2, swaps(XF_EXPR)), visible: true, ...talk,
    head: heads(kn.head, talk.head, head),
  });
  // THE CHART: held rolled (running, landing), raised on 仙药, lowered on 只是, unrolled on 大鱼, rolled up after C04;
  // on 好大一条 hand 0 lets go, the rolled chart swings out round hand 1 (through the front) and his arms spread wide
  // (this big); for 拿弩来 the hands come together for the bow
  const lift = ky(f, [[T.xianyao - 2, 0], [T.xianyao + 6, 1], [T.zhishi - 2, 1], [T.zhishi + 5, -0.4], [T.dayu - 3, -0.4], [T.dayu + 6, 0.5]]);
  const open = ky(f, [[T.dayu - 2, 0], [T.dayu + 12, 1], [T.c04end, 1], [T.c04end + 5, 0]]);
  const chartYaw = facing + 0.45 * k;
  const hy = 0.94 - drop + 0.07 * lift + 0.12 * open;            // (0.98 held the roller across his chin)
  const chartAt = rel(floor, facing, 0, hy, 0.32 + 0.07 * Math.max(0, lift));
  const chartOpt = { grip: "pair" as const, rot: chartYaw, open };
  const hp = holdPoints("seaChart", chartAt, chartOpt);
  if (f < rel0) r.set({ hands: [hp[0], hp[1]] });
  else if (f < T.stand + 2) {
    // 好大一条: hand 0 lets go, both arms spread wide at shoulder height across her frame (THIS big), the rolled chart
    // swinging out at the end of his left arm; a pulse on 好大, a wider one on 一条; then down toward the bow (拿弩来)
    const pulse = 0.04 * Math.sin(Math.PI * clamp01((f - T.haoda) / 8)) + 0.06 * Math.sin(Math.PI * clamp01((f - T.yitiao) / 8));
    const y = 1.05 - drop + 0.5 * pulse, half = 0.36 + pulse, by = 0.86 - drop;
    const down = smooth(clamp01((f - T.c06end - 2) / (T.stand - T.c06end)));
    const spread = [rel(floor, facing, -half, y, 0.14), rel(floor, facing, half, y, 0.14)];
    const bowH = [rel(floor, facing, -0.06, by, 0.3), rel(floor, facing, 0.06, by, 0.3)];
    r.set({ pose: { kind: "idle", t: t + 0.7 }, hands: [hp[0].clone().lerp(spread[0], sw).lerp(bowH[0], down), hp[1].clone().lerp(spread[1], sw).lerp(bowH[1], down)] });
  } else {
    // 拿弩来: down into the bow, the hands together at the chest
    const y = 0.86 - drop - 0.1 * bowK;
    r.set({ hands: [rel(floor, facing, -0.06, y, 0.3), rel(floor, facing, 0.06, y, 0.3)] });
  }
  w.update();
  if (f < rel0) w.prop("seaChart").put(chartAt, chartOpt);
  else {
    // held by its inner end in hand 1: the roller sweeps round through his front about the hand (its local +x:
    // (cos rot, 0, -sin rot)) until it points out along his left arm, its far end raised 0.5 rad (local -x up); back
    // down for the bow
    const down = f < T.stand + 2 ? smooth(clamp01((f - T.c06end - 2) / (T.stand - T.c06end))) : 1;
    const rot = lerp(chartYaw + (facing + Math.PI - chartYaw) * sw, chartYaw + Math.PI, down), tip = lerp(-0.5 * sw, 0.2, down);
    const u = V(Math.cos(rot) * Math.cos(tip), Math.sin(tip), -Math.sin(rot) * Math.cos(tip));
    w.prop("seaChart").put(r.handWorld(1).addScaledVector(u, -0.2), { rot: [0, rot, tip], open: 0 });
  }
}

// ====================================================================================================== the hall dressing
/** B's last state: the scale turned to the desk, at B's settled tilt. (B's bundle in the pan is left out: the pan's three
 *  cords pass 4.9 cm through any bundle laid in it, at the frame's edge in every C shot: logged for WP3 / segB) */
const SCALE_TILT = -0.12;
function dressHall(w: World, scabbard = true) {
  w.prop("desk").put(QHALL.desk);
  w.prop("cushion").put(SEAT.cushion, { rot: SEAT.facing });
  w.prop("scale").put(QHALL.scale, { tilt: SCALE_TILT, rot: Math.PI });
  QHALL.slips.forEach((p, i) => w.prop("slips", `tower${i}`).put(p, { n: [6, 9, 4][i] }));
  w.prop("slips", "desk").put(V(QHALL.desk.x - 0.25, QHALL.deskTop, QHALL.desk.z + 0.02), { n: 1 });
  w.prop("inkstone").put(V(QHALL.desk.x + 0.4, QHALL.deskTop, QHALL.desk.z + 0.04));
  if (scabbard) w.prop("scabbard").put(SCABBARD_AT, { rot: [0, 0, Math.PI / 2] });
}

// ====================================================================================================== shots
/** desk + door: from B's framing to the stand, one long take with a whip */
function hallShot(w: World, f: number): Pose {
  w.setPlace("hall");
  const W = C.whip(deskCam(f), f, T.whipOn, { dir: 1, to: doorCam(f) });
  let cam = W.cam;
  // 拿弩来: a small punch-in as he points; the dream blur into the flashback
  cam = C.punchIn(cam, f, T.nu, { k: 0.9, len: 6 });
  cam = C.creep(cam, f, T.flash0 - 8, T.flash0, 0.12);
  w.setCamera(cam);
  dressHall(w);
  if (f >= T.whipOn - 2) xufu(w, f);
  emperorHall(w, f);
  const blur = clamp01((f - (T.flash0 - 7)) / 7);
  const post = W.post ?? (blur > 0 ? { dof: { focus: 0.05, amount: 22 * smooth(blur) } } : undefined);
  return { camera: cam, post, overlays: C.whipSmear(W.smear, 1), focus: [0.3, -2.6], slate: f < T.door ? "C desk" : f < T.stand ? "C door / two-shot" : "C stand" };
}

// ---------------------------------------------------------------------------------------------------- the coast
/** the tiny emperor on the shore: the rig figure at the sand table's scale */
const TINY: Person = { ...EMPEROR, name: "emperorTinyC", scale: 0.085 };
const TS = (TINY.scale ?? 1) / ES;                                  // his hand offsets / the crossbow, against the real one
const SHORE = TABLE.shore.clone().setY(TABLE.shore.y + 0.004);
const FISH_YAW = yawTo(SHORE, TABLE.fish);
const DIR_SF = TABLE.fish.clone().sub(SHORE).setY(0).normalize();
const RIGHT_SF = V(-DIR_SF.z, 0, DIR_SF.x);                       // screen right, looking from the shore to the fish
/** over his shoulder: behind the tiny emperor on the shore -> fish line, a little to the right, above the board */
const TABLE_POS = SHORE.clone().addScaledVector(DIR_SF, -0.55).addScaledVector(RIGHT_SF, 0.22).setY(TABLE.top.y + 0.28);
const TABLE_CAM0 = aim(TABLE_POS, TABLE.fish.clone().add(V(0, 0.06, 0)), 700, 720, 58);
const TABLE_CAM1 = aim(TABLE_POS.clone().addScaledVector(DIR_SF, 0.06).add(V(0, -0.012, 0)), TABLE.fish.clone().add(V(0, 0.05, 0)), 710, 710, 58);

function tableShot(w: World, f: number): Pose {
  w.setPlace("table");
  // the bolt: the flight from the shot to the pop (0 .. 0.55), the hit, the roll belly-up (0.55 .. 1)
  const bolt = f < T.shot ? 0 : f < T.pop ? 0.55 * lin(f, T.shot, T.pop) : 0.55 + 0.45 * clamp01((f - T.pop) / 30);
  w.set.param("tableau", "sea");
  w.set.param("bolt", bolt);
  let cam = C.povCam(f, [key(T.flash0, TABLE_CAM0), key(T.pop + 30, TABLE_CAM1, easeInOutCubic)], { mood: "calm", amp: 0.5, seed: 7 });
  cam = shake(cam, f, T.pop, 7, 1.2, 8);
  const W = C.whip(cam, f, WALL_WHIP, { dir: -1 });
  w.setCamera(W.cam);
  // the tiny emperor: aiming (the crossbow points at the fish), the recoil on the shot, then he turns to us and lifts
  // the crossbow, two little hops
  const t = f / FPS, camYaw = yawTo(SHORE, v3(cam.pos));
  const turn = ky(f, [[T.pop + 6, 0], [T.pop + 14, 1]]);
  // the crossbow's frame (it points at the fish) and his body: square to her lens's line while he aims (the natural
  // hold, FISH_YAW - 0.8, left a crescent of his face showing at the edge of his head: a near-profile), so the face
  // stays round the back of his head (a back view)
  const away = wrapA(camYaw + Math.PI), facing = lerpA(away, camYaw - 0.5, turn);
  const aimF = facing + wrapA(FISH_YAW - 0.8 - away) * (1 - turn);     // turns with his body (no arm through it)
  const hop = Math.max(0, Math.sin(Math.PI * clamp01((f - T.pop - 14) / 7))) + Math.max(0, Math.sin(Math.PI * clamp01((f - T.pop - 23) / 7)));
  const p = SHORE.clone().add(V(0, 0.012 * hop, 0));
  const rec = f >= T.shot && f < T.shot + 8 ? (1 - (f - T.shot) / 8) * (f - T.shot < 2 ? 1 : 0.6) : 0;
  const r = w.actor(TINY);
  r.set({
    at: p, facing, turn: 1 - turn, pose: { kind: "idle", t }, expr: f < T.pop + 8 ? "stern" : "laugh", blink: lid(t, 3), visible: true,
    head: heads(accent("jolt", f, T.shot, { amp: 1.2 }), accent("laugh", f, T.pop + 12, { dur: 0.9 })), hide: ["swordBelt", "hilt"],
  });
  const raise = turn;
  // turned to us he shows it off at his chest, muzzle up, below his face (raised higher it crossed his face)
  const gripAt = rel(p, aimF, lerp(-0.18, -0.24, raise) * TS, lerp(0.8, 0.76, raise) * TS, lerp(0.18, 0.24, raise) * TS);
  const opt = { grip: "pair" as const, scale: TS, rot: [-(0.12 + 0.3 * rec) - 0.3 * raise, aimF + 0.8, 0] as [number, number, number] };
  const hp = holdPoints("crossbow", gripAt, opt);
  r.set({ hands: [hp[0], hp[1]] });
  w.update();
  w.prop("crossbow").put(gripAt, opt);
  return { camera: W.cam, post: W.post ?? (f < T.flash0 + 6 ? { dof: { focus: 0.05, amount: 22 * (1 - smooth((f - T.flash0 + 1) / 6)) } } : undefined), overlays: C.whipSmear(W.smear, -1), focus: [TABLE.top.x, TABLE.top.z], slate: "C flashback: the coast" };
}

// ---------------------------------------------------------------------------------------------------- the aside, caught
/** where she whispers: tucked in beside the west front pillar (the hall's W1 at -1.41, -1.10, 0.44 square), turned
 *  away from them toward the dark west side, the red pillar filling the left of the frame 0.6 m off (QHALL.asideWall
 *  itself, the west wall, is unlit: a black frame) */
const WALL_POS = V(-0.95, EYE - 0.06, -0.35);
const yawPt = (from: THREE.Vector3, yawDeg: number, y: number) => from.clone().add(V(Math.sin(yawDeg * RAD) * 3, 0, Math.cos(yawDeg * RAD) * 3)).setY(y);
const WALL_CAM: CamPose = aim(WALL_POS, yawPt(WALL_POS, 197, 1.3), 960, 540);
/** turned round to the hall (a whip right): he stands right there */
const CLOSE_BASE: CamPose = aim(WALL_POS, yawPt(WALL_POS, 150, 1.4), 960, 540);
const HEAD_CLOSE_Y = HEAD_STAND.y;
const EMP_CLOSE = C.leanStand(CLOSE_BASE, { headY: HEAD_CLOSE_Y, fill: 0.6 });
const EMP_CLOSE_FACE = yawTo(EMP_CLOSE, WALL_POS);

function wallCam(f: number): CamPose {
  let c = C.povCam(f, [key(T.aside, WALL_CAM)], { mood: [[T.aside, "excited"], [T.c08 + 10, "calm"]], amp: 0.8, seed: 9 });
  // 偷偷: she leans in to the wall; 徐福: a glance over her shoulder; 再也没回来: she droops a little
  const lean = ky(f, [[T.tou - 4, 0], [T.tou + 10, 1], [T.zaiye, 1], [T.c08end + 6, 0.6]]);
  const glance = ky(f, [[T.xufu8 - 3, 0], [T.xufu8 + 3, 1], [T.xufu8 + 12, 1], [T.xufu8 + 18, 0]]);
  const droop = ky(f, [[T.zaiye - 2, 0], [T.zaiye + 14, 1]]);
  c = C.nudge(c, { fwd: 0.1 * lean, roll: 2.5 * lean - 2 * droop, yaw: 7 * glance, pitch: -3 * droop, up: -0.04 * droop });
  return c;
}
function closeCam(f: number): CamPose {
  // C10: flustered: the camera fidgets (quick small yaws), backs off a step, two little bows on 祝 .. 顺风
  let c = C.povCam(f, [key(CLOSE0, CLOSE_BASE)], { mood: [[CLOSE0, "scared"], [T.c10, "excited"]], amp: 1, seed: 11 });
  const fid = clamp01((f - T.c10) / 4) * (1 - clamp01((f - T.c10end) / 6));
  const n = (k: number) => Math.sin(f * 1.9 + k) * 0.6 + Math.sin(f * 3.7 + 2 * k) * 0.4;
  const backK = ky(f, [[T.c10, 0], [T.c10 + 8, 1]]);
  const bow = Math.max(0, Math.sin(Math.PI * clamp01((f - T.zhu) / 10))) + Math.max(0, Math.sin(Math.PI * clamp01((f - T.shunfeng) / 10)));
  c = C.nudge(c, { yaw: 2.4 * fid * n(1), roll: 1.6 * fid * n(2), fwd: -0.1 * backK, up: -0.035 * bow, pitch: -2.5 * bow });
  return c;
}
function asideShot(w: World, f: number): Pose {
  w.setPlace("hall");
  // the arriving half of the whip out of the table (from the right: the pan goes left)
  const A = C.whip(wallCam(f), f, WALL_WHIP, { dir: -1, to: wallCam(f) });
  const showHim = f >= BACK_WHIP + 4;
  dressHall(w, !showHim);                                            // he walked up wearing his sword again
  let close: CamPose = closeCam(f);
  if (showHim) {
    // he is right there: solved for the close camera; the camera gives way as he leans in, his eyes in the upper third
    w.setCamera(close);
    const r = emperorClose(w, f);
    close = C.lean(close, f, BACK_WHIP, r.headWorld(), { back: 0.06, len: 1 });
  }
  const W = C.whip(A.cam, f, BACK_WHIP, { dir: 1, to: close });
  // the last frames: the fast whip out (segment D lands it)
  const O = C.whip(W.cam, f, T.out, { dir: 1, out: 5, in: 4 });
  const cam = O.cam;
  w.setCamera(cam);
  const smear = Math.max(A.smear, W.smear, O.smear);
  return { camera: cam, post: O.post ?? W.post ?? A.post, overlays: C.whipSmear(smear, A.smear > 0 ? -1 : 1), focus: [WALL_POS.x + 1, WALL_POS.z - 0.8], slate: showHim ? "C caught" : "C aside" };
}

const CLOSE_EXPR: [number, Expr][] = [[BACK_WHIP, "deadpan"], [T.c10 + 6, "stern"], [T.xian10, "deadpan"], [T.shunfeng, "huff"]];
const CLOSE_GAZE: [number, number][] = [[BACK_WHIP, 0], [T.xian10, 1], [T.xian10 + 12, 0.5], [T.shunfeng, 0]];
function emperorClose(w: World, f: number): Rig {
  const t = f / FPS, r = w.actor(EMPEROR);
  // he leans in on 说什么 and again on C10 (a small step closer each time)
  const step = ky(f, [[T.shuo - 2, 0], [T.shuo + 8, 0.06], [T.c10 + 6, 0.06], [T.c10 + 18, 0.12]]);
  const p = EMP_CLOSE.clone().add(V(Math.sin(EMP_CLOSE_FACE), 0, Math.cos(EMP_CLOSE_FACE)).multiplyScalar(step));
  const tilt = 7 * ky(f, [[T.c09, 0], [T.shuo, 1], [T.c10 + 8, 1], [T.c10 + 20, -1], [T.shunfeng, -1], [T.shunfeng + 8, 0]]);
  const head = heads(
    { tilt, dy: headM(-0.03) * ky(f, [[T.shuo, 0], [T.shuo + 10, 1]]), scale: 1 + 0.04 * ky(f, [[T.shuo, 0], [T.shuo + 10, 1]]) },
    headPop(f, T.shuo, [1.06, 1.03, 1.01]), accent("shake", f, T.shunfeng + 3, { amp: 0.6 }), accent("jolt", f, CLOSE0 - 2, { amp: 0.4 }),
  );
  const talk = speak(quote("di", "C09"), f, 1, [2]);
  r.set({
    at: p, facing: EMP_CLOSE_FACE, pose: { kind: "idle", t: t + 0.3 }, expr: at(f, CLOSE_EXPR), gaze: at(f, CLOSE_GAZE),
    blink: lid(t, 1, swaps(CLOSE_EXPR)), visible: true, ...talk, head: heads(talk.head, head),
  });
  w.update();
  return r;
}

// ====================================================================================================== the segment
export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    if (f < T.flash0) return hallShot(w, f);
    if (f < T.aside) return tableShot(w, f);
    return asideShot(w, f);
  },
};
