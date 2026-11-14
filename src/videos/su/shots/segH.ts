// SEGMENT H, lines H53-H55: 两年后 · 儋州, oysters at the driftwood fire on the beach. WP5 segH. PLAN.md 8H, BEAT.H.
// One handheld take in her eyes (the ink wash in from G, the ink wash out to I: both the HUD's, transitionAt):
//   pre      H pre     the wipe lands on the beach: the hut, the palms, the sea, the two of them sitting low on their
//                      driftwood logs at the set's fire (BEACH.suSeat / guoSeat; the FIRE IS THE SET'S, param fire);
//                      the HUD's 两年后 · 儋州 (from BEAT.H.stamp, top left). SU_DAN holds an oyster out over the flames in his right
//                      hand, turning it; GUO grills his own on the long chopsticks. THE SHELL POPS (POP: the lid snaps up,
//                      the oyster jumps, his head pops, a delighted start), he pulls it in and prises it open with his
//                      left thumb, lifts it to his mouth and SLURPS it (BEAT.H.slurp: whistle, the head tips back), eyes
//                      shut in bliss (smile_closed). She drifts in from the establishing two-shot onto him.
//   H53      ecstatic  「这蚝太好吃了，」 eyes open, beaming (relief_open), the oyster held up to her lens on 好吃, a little
//                      shake of delight (GUO, off to her right, has lifted his own off the fire and blows on it); then his
//                      eyes dart left and right (nobody listening?), his free hand beckons her closer, and on 千万
//                      (BEAT.H.lean) THE CONSPIRATORIAL LEAN: smug, the head down and in toward the lens (the rig has no
//                      seated lean: head dy / scale / tilt), the oyster clutched to his chest; her camera leans in close.
//   H54      puzzled   her 「为什么？」: her camera tips its head (a small roll) and gives back a little; he holds the
//                      look, eyes to the lens, the hand comes down; a blink and the face goes flat.
//   H55      deadpan   dead serious, eyes to the lens, her camera nearly still; a slow nod on 抢着, one on 被贬; on 分我的蚝
//                      both hands pull the oyster in to his chest and his shoulders turn a little away from her (mine).
//                      (GUO, off frame, presses his lips together, shaking with a laugh he holds in.)
//   card 4   delighted she drifts back and over so they sit right of the card (mid-left: never over a face or the
//                      oyster); he goes back to his oyster delighted (looks down at it, happy), lifts it and slurps the
//                      rest, eyes shut, swaying; GUO bursts out laughing (BEAT.H.laugh), the chopsticks shaking. The ink
//                      wash takes it (BEAT.H.wipe).
// NO MIC, NO HAND (PLAN 11): she is only the camera here; nothing of her is drawn (putHer is not called).
// Every frame from BEAT.H / lineId / capWord / card / SEGMENTS; every mark from layout/beach.ts (BEACH: suSeat, guoSeat,
// suFacing, guoFacing, embers); props pinned to the hands after w.update() (the oysters, GUO's chopsticks).
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, card, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Pose, type Segment, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU_DAN, GUO } from "../people";
import { BEACH, EYE } from "../layout";
import { CHOPSTICKS, OYSTER } from "../props";
import { transitionAt } from "../hud";
import { setSeat } from "../../../kit/acc/garb";
import { V, rel, says, accent, heads, at, ky, path, lid, swaps, headPop, type RigState } from "./common";

type St = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const PI = Math.PI;
const S = SEGMENTS[7], B = BEAT.H;
const word = (id: string, w: string) => capWord(id, w).from;

// ------------------------------------------------------------------------------------------------------- the beats
const L53 = lineId("H53"), L54 = lineId("H54"), L55 = lineId("H55"), CARD4 = card("H55");
const W_HAOCHI = word("H53", "好吃"), W_BEIFANG = word("H53", "北方人"), W_QIANG = word("H55", "抢着"), W_BEIBIAN = word("H55", "被贬");
const W_FEN = word("H55", "分我的蚝");
/** THE SHELL POPS (11 frames before the slurp: after the stamp has landed), he prises it open, lifts it to his mouth */
const POP = B.slurp - 11, PRISE = [POP + 2, POP + 8] as const;
/** the slurp (BEAT.H.slurp) and the bliss after it (eyes shut until H53) */
const SLURP_END = B.slurp + 9;
/** his eyes dart left and right before 千万 (nobody listening?) */
const DART = B.lean - 8;
/** the lean (千万) holds to the end of H53, the hand comes down while she asks */
const LEAN_END = L53.to + 4;
/** the face goes flat under a blink before H55 */
const FLAT = L54.to + 4;
/** card 4: he looks down at his oyster, lifts it, slurps the rest */
const LOOK = CARD4.from - 4, SIP = CARD4.from + 20, SIP_END = SIP + 12;

// ------------------------------------------------------------------------------------------------------- the marks
const PS = BEACH.suSeat, FACE = BEACH.suFacing;
const GS = BEACH.guoSeat, GFACE = BEACH.guoFacing;
/** the ground under his seat; a point in his seated frame: x = to his LEFT (screen right), y = up from the SEAT'S TOP,
 *  z = forward (toward her and the fire) */
const SU_AT = V(PS.top.x, 0, PS.top.z), Y0 = PS.top.y;
const sp = (x: number, y: number, z: number) => rel(SU_AT, FACE, x, Y0 + y, z);
const GUO_AT = V(GS.top.x, 0, GS.top.z), GY0 = GS.top.y;
const gp = (x: number, y: number, z: number) => rel(GUO_AT, GFACE, x, GY0 + y, z);
/** his head centre sitting on the log (measured with the probe) */
const HEAD = sp(0, 0.74, 0.01);
/** GUO's head centre (measured) */
const GHEAD = gp(0, 0.74, 0.0);
/** his oyster and GUO's are drawn half again as large as life (Hainan oysters are big; at 2 m a 11 cm shell is a few
 *  pixels on a phone) */
const BIG = 1.5, GBIG = 1.3;
/** the oyster's lowest point under its origin (its bottom shell: props/things.ts oyster, 0.006 + 0.055 x 0.3 m, at the
 *  film's scale), and a chopstick's radius at its tip (props/things.ts chopsticks: 3.5 mm) */
const OY_UNDER = 0.0225, STICK_R = 0.0035;

// ------------------------------------------------------------------------------------------------------- her camera
type K = { pos: Vec3; look: Vec3 };
/** a camera at `pos` aimed so the world point `target` lands at screen (sx, sy) px (of 1080 x 1920; no roll) */
const aim = (pos: Vec3, target: THREE.Vector3, sx: number, sy: number, fov = C.FOV): K => {
  const p = V(...pos), d = target.clone().sub(p), hd = Math.hypot(d.x, d.z), t = Math.tan((fov * Math.PI) / 360);
  const f0 = V(d.x / hd, 0, d.z / hd), r0 = V(-f0.z, 0, f0.x);
  const dyaw = Math.atan((sx / 540 - 1) * t * (9 / 16)), pitch = Math.atan2(d.y, hd) - Math.atan((1 - sy / 960) * t);
  const fw = f0.multiplyScalar(Math.cos(dyaw)).addScaledVector(r0, -Math.sin(dyaw)).multiplyScalar(Math.cos(pitch)).add(V(0, Math.sin(pitch), 0));
  const l = p.addScaledVector(fw, d.length());
  return { pos, look: [l.x, l.y, l.z] };
};
/** her eyes `side` m to his left (screen right of him) and `dist` m in front of his seat */
const eyeAt = (side: number, dist: number): Vec3 => { const p = rel(SU_AT, FACE, side, EYE, dist); return [p.x, p.y, p.z]; };
/** the middle between the two heads (the two-shots aim at it) */
const MID = HEAD.clone().lerp(GHEAD, 0.5);
/** pre: the establishing two-shot as the wipe lands (the sea and the palms behind them, the fire in front, GUO at the
 *  right), the stamp over the sky at the top left; she walks in from here onto him */
const OPEN = aim(eyeAt(0.3, 3.8), MID, 575, 600);
/** H53: on him, her eyes 2.1 m away beside the fire (the flames low at the left, under the captions) */
const TALK = aim(eyeAt(0.3, 2.1), HEAD, 530, 590);
/** 千万: she leans in close, beside the fire ring (0.7 m from its middle: never over it) */
const LEAN = aim(eyeAt(0.45, 1.75), HEAD, 540, 580);
/** H54: she gives back a little as she asks */
const ASK = aim(eyeAt(0.42, 1.9), HEAD, 540, 590);
/** H55: dead serious: close, still */
const DEAD = aim(eyeAt(0.38, 1.82), HEAD, 540, 585);
/** card 4: back and over to his left so the two of them sit right of the card's edge / above its top (card x 52-768,
 *  y 780-1086): his face upper left, GUO's at the right */
const CARD_F = aim(eyeAt(0.9, 3.1), MID, 555, 555);
/** ...still drifting a little when the ink takes it */
const END = aim(eyeAt(0.95, 3.25), MID, 558, 552);
const key = (f: number, k: K, ease?: (x: number) => number, roll?: number): C.CamKey => ({ f, pos: k.pos, look: k.look, fov: C.FOV, ease, roll });
const KEYS: C.CamKey[] = [
  key(S.from, OPEN),
  key(B.lean - 6, TALK, easeInOutCubic),
  key(B.lean + 12, LEAN, easeOutCubic),
  key(L54.from - 2, LEAN),
  key(L54.from + 10, ASK, easeInOutCubic, 3.5),
  key(L54.to + 2, ASK, undefined, 3.5),
  key(L55.from + 6, DEAD, easeInOutCubic, 0),
  key(L55.to - 4, DEAD),
  key(CARD4.from + 40, CARD_F, easeInOutCubic),
  key(S.to, END, (x) => x),
];
/** her camera on frame f (pure): the keys and a gentle handheld; nearly still while he is dead serious */
export const camH = (f: number): CamPose => C.povCam(f, KEYS, {
  mood: [[S.from, "calm"], [L55.from, "still"], [L55.to + 4, "calm"]],
  walk: [[S.from, 0.5], [S.from + 10, 0.7], [B.lean - 16, 0.7], [B.lean - 4, 0], [L55.to, 0], [L55.to + 10, 0.5], [CARD4.from + 34, 0]],
  amp: 0.7, seed: 8,
});

// ------------------------------------------------------------------------------------------------------- his hands
/** the right hand (arm 0) holds his oyster: out over the fire (grilling, turning it), pulled in to his chest for the
 *  prising, at his mouth for the slurp, held up to her on 好吃, clutched to his chest for the secret, on his lap, pulled
 *  in again on 分我的蚝, down at his chest for the look, at his mouth for the last sip */
const GRILL = (f: number) => sp(-0.06 + 0.012 * Math.sin(f * 0.35), 0.27 + 0.01 * Math.sin(f * 0.5), 0.38);
const CHEST = sp(-0.05, 0.42, 0.34), MOUTH = sp(-0.07, 0.55, 0.39), SHOW = sp(-0.2, 0.58, 0.38);
const CLUTCH = sp(-0.04, 0.4, 0.3), LAP = sp(-0.1, 0.3, 0.34), LOOKAT = sp(-0.07, 0.5, 0.37);
/** the left hand (arm 1): on his knee; at the oyster's lid for the prising; a small beckon to her (come closer) as his
 *  eyes dart, just before 千万; cupped over the oyster on 分我的蚝 */
const KNEE_L = sp(0.15, 0.3, 0.33), PRISE_L = sp(0.04, 0.45, 0.36), CUP_L = sp(0.05, 0.42, 0.31);
/** the beckon (come closer, palm in, two flicks) beside his chest at screen right, out of the beard */
const BECKON = (f: number) => sp(0.25, 0.5 + 0.035 * Math.max(0, Math.sin(clamp01((f - (DART - 2)) / 18) * 2 * PI * 2)), 0.3);
const handR = (f: number): THREE.Vector3 => {
  if (f < POP) return GRILL(f);
  return path(f, [
    [POP, GRILL(POP)], [POP + 2, GRILL(POP).add(rel(V(), FACE, 0, 0.02, -0.03)), easeOutCubic], [PRISE[0] + 4, CHEST], [PRISE[1], CHEST],
    [B.slurp - 1, MOUTH], [SLURP_END, MOUTH], [L53.from + 4, CHEST],
    [W_HAOCHI - 2, SHOW, easeOutCubic], [DART - 2, SHOW], [B.lean + 2, CLUTCH], [LEAN_END + 6, CLUTCH], [L54.to, LAP],
    [W_FEN - 3, LAP], [W_FEN + 5, CLUTCH, easeOutCubic], [L55.to + 8, CLUTCH], [LOOK + 6, LOOKAT],
    [SIP - 4, MOUTH], [SIP_END, MOUTH], [SIP_END + 12, LOOKAT],
  ]);
};
const handL = (f: number): THREE.Vector3 => {
  if (f < DART - 10) return path(f, [[POP + 1, KNEE_L], [PRISE[0] + 3, PRISE_L], [PRISE[1], PRISE_L], [PRISE[1] + 8, KNEE_L]]);
  if (f < L54.to) return path(f, [[DART - 10, KNEE_L], [DART - 2, BECKON(f), easeOutCubic], [B.lean + 8, BECKON(f)], [B.lean + 20, KNEE_L]]);
  return path(f, [[W_FEN - 3, KNEE_L], [W_FEN + 5, CUP_L, easeOutCubic], [L55.to + 8, CUP_L], [L55.to + 18, KNEE_L]]);
};
/** the arms drawn in front of his own head and beard (the oyster at his mouth; the beckon beside the beard) */
const frontR = (f: number) => f >= PRISE[1] && f < L53.from + 6 || f >= SIP - 8 && f < SIP_END + 8;
const frontL = (f: number) => f >= DART - 8 && f < B.lean + 18;

/** his oyster's lid: shut, THE POP (snaps up to 0.4), prised open, open from then on */
const openAt = (f: number) => (f < POP ? 0 : f < PRISE[0] ? 0.4 * easeOutCubic(clamp01((f - POP) / 2)) : lerp(0.4, 1, smooth(clamp01((f - PRISE[0]) / (PRISE[1] - PRISE[0])))));
/** a rot (Euler YXZ) that turns the oyster's +z (hinge -> cup) onto `dir` with its +y (the open side) toward `up` */
const _m = new THREE.Matrix4(), _e = new THREE.Euler();
const rotZY = (dir: THREE.Vector3, up: THREE.Vector3): Vec3 => {
  const z = dir.clone().normalize(), x = up.clone().cross(z); if (x.lengthSq() < 1e-6) x.set(1, 0, 0); x.normalize();
  const y = z.clone().cross(x).normalize();
  _m.makeBasis(x, y, z); _e.setFromRotationMatrix(_m, "YXZ"); return [_e.x, _e.y, _e.z];
};
const FWD = rel(V(), FACE, 0, 0, 1), UPV = V(0, 1, 0), TO_CAM = (cam: CamPose) => C.camAxes(cam).p;
/** how his oyster is held: the cup out forward over the fire (rolling as he turns it), forward and tipped up to show
 *  its inside to her lens, pointing at his mouth (tipped up as he slurps) */
const oysterRot = (f: number, hand: THREE.Vector3, head: THREE.Vector3, cam: CamPose): Vec3 => {
  const mouth = head.clone().add(V(0, -0.1, 0)).addScaledVector(FWD, 0.22), lens = TO_CAM(cam).sub(hand).normalize();
  const toMouth = mouth.clone().sub(hand).normalize();
  const atMouth = Math.max(ky(f, [[PRISE[1], 0], [B.slurp - 1, 1], [SLURP_END, 1], [L53.from + 4, 0]]), ky(f, [[SIP - 6, 0], [SIP - 1, 1], [SIP_END, 1], [SIP_END + 10, 0]]));
  const showing = f >= POP ? 1 : 0;
  const roll = f < POP ? 0.35 * Math.sin(f * 0.21) : 0;
  const out = FWD.clone().add(V(0, -0.15, 0)).normalize();
  const dir = out.clone().lerp(toMouth, atMouth).normalize();
  const up = UPV.clone().applyAxisAngle(FWD, roll).lerp(lens, 0.55 * showing * (1 - atMouth)).lerp(toMouth.clone().negate().add(V(0, 0.6, 0)), atMouth).normalize();
  return rotZY(dir, up);
};

// ------------------------------------------------------------------------------------------------------- his face
const EXPR: [number, Expr][] = [
  [S.from, "lick"], [POP, "shock"], [POP + 3, "grin"], [B.slurp - 2, "whistle"], [SLURP_END, "smile_closed"],
  [L53.from, "relief_open"], [DART - 2, "smile"], [B.lean - 2, "smug"], [FLAT, "deadpan"], [L55.to + 8, "smile"],
  [LOOK, "happy"], [SIP - 2, "whistle"], [SIP_END, "smile_closed"], [SIP_END + 30, "relief"],
];
/** the changes that hide under a blink (the calm ones: the pop, the slurp and the sip land on open or shut eyes of
 *  their own, a blink there would eat the start) */
const CALM: [number, Expr][] = [[S.from, "lick"], ...EXPR.filter(([k]) => [L53.from, B.lean - 2, FLAT, L55.to + 8, LOOK, SIP_END + 30].includes(k))];
/** where he looks: at his oyster (straight ahead, down), at her; the dart left and right before 千万 */
const gazeAt = (f: number) => at(f, [[S.from, 0], [DART, -1], [DART + 4, 1], [DART + 8, 0]]);
const lookDownAt = (f: number) => ky(f, [
  [S.from, 8], [POP - 1, 8], [POP + 2, 4], [PRISE[1], 10], [B.slurp, -2], [B.slurp + 6, -8], [SLURP_END + 4, -4], [L53.from + 4, 0],
  [B.lean - 2, 0], [B.lean + 6, 6], [LEAN_END, 6], [L54.to, 0], [LOOK - 2, 0], [LOOK + 8, 14], [SIP - 6, 12], [SIP, -4], [SIP_END + 4, -6], [SIP_END + 16, 0],
]);
/** the head layer: the pop, a shake of delight on 好吃, the lean in (down, a touch bigger: closer), the nods of H55,
 *  the turn away on 分我的蚝, the bliss sway at the end */
const headAt = (f: number) => {
  const t = f / FPS;
  const lean = ky(f, [[B.lean - 2, 0], [B.lean + 8, 1], [LEAN_END, 1], [L54.to + 2, 0.5], [FLAT + 4, 0]]);
  const mine = ky(f, [[W_FEN - 2, 0], [W_FEN + 6, 1], [L55.to + 6, 1], [L55.to + 16, 0]]);
  const sway = f >= SIP_END ? 3 * Math.sin((2 * PI * (f - SIP_END)) / 40) * clamp01((f - SIP_END) / 10) : 0;
  return heads(
    { dy: -0.07 * lean, dx: 0.05 * lean - 0.06 * mine, scale: 1 + 0.035 * lean, tilt: 6 * lean - 5 * mine + sway },
    headPop(f, POP),
    accent("shake", f, W_HAOCHI + 2, { amp: 0.8 }),
    accent("nod", f, W_QIANG, { amp: 0.7 }), accent("nod", f, W_BEIBIAN, { amp: 0.7 }),
    accent("shake", f, W_FEN + 6, { amp: 0.5 }),
    f >= SLURP_END && f < L53.from ? { tilt: 2.5 * Math.sin(t * 9) } : undefined,
  );
};
const suState = (f: number): St => {
  const sp_ = says("su", ["H53", "H55"], f, 1);
  return {
    at: SU_AT, facing: FACE, seat: PS,
    pose: { kind: "sit", t: f / FPS },
    expr: at(f, EXPR), ...sp_,
    blink: Math.max(lid(f / FPS, 6, swaps(CALM)), sp_.blink ?? 0),
    head: heads(sp_.head, headAt(f)),
    gaze: gazeAt(f),
    lookDown: lookDownAt(f),
    twist: -0.25 * ky(f, [[W_FEN - 2, 0], [W_FEN + 6, 1], [L55.to + 6, 1], [L55.to + 16, 0]]),
    visible: true,
  };
};

// ------------------------------------------------------------------------------------------------------- GUO
/** GUO grills his own oyster on the long chopsticks over the fire's edge, watches his father, blows on his oyster, shakes
 *  his head on 北方人, holds in a laugh under H55, and laughs out loud under card 4 */
const CHOP_LEN = CHOPSTICKS.len - CHOPSTICKS.grip;
const rotChop = (dir: THREE.Vector3): Vec3 => {
  const y = dir.clone().normalize().negate(), x = V(0, 1, 0).cross(y);
  if (x.lengthSq() < 1e-6) x.set(1, 0, 0); x.normalize();
  const z = x.clone().cross(y).normalize();
  _m.makeBasis(x, y, z); _e.setFromRotationMatrix(_m, "YXZ"); return [_e.x, _e.y, _e.z];
};
const laughK = (f: number) => ky(f, [[B.laugh - 2, 0], [B.laugh + 6, 1], [S.to, 1]]);
/** the chopsticks are in his LEFT hand (arm 1: the hand on her side, so they show in front of him in the two-shots, and
 *  what he lifts goes off to her right, out of her close frames on his father): over the fire's edge, turning his oyster
 *  (pre); from OFF lifted out of the heat to his left side at chest height (it cools; he blows on it under H53); held up
 *  a little higher while he laughs (card 4) */
const OFF = [POP + 8, POP + 32] as const, BLOW = [L53.from + 12, L53.from + 34] as const;
const upK = (f: number) => smooth(clamp01((f - OFF[0]) / (OFF[1] - OFF[0])));
const guoHand = (f: number) => {
  const t = f / FPS, lk = laughK(f), up = upK(f), held = ky(f, [[L55.from + 10, 0], [L55.from + 30, 1], [CARD4.from, 1], [B.laugh, 0]]);
  const fire = gp(0.1 + 0.015 * Math.sin(t * 2.1), 0.36 + 0.008 * Math.sin(t * 1.7), 0.34), lifted = gp(0.14, 0.42 + 0.08 * lk, 0.24);
  return fire.lerp(lifted, up).add(V(0, 0.02 * lk * Math.sin(t * 2 * PI * 4.6) + 0.006 * held * Math.sin(t * 2 * PI * 7), 0));
};
const GTIP_FIRE = gp(0.0, 0.2, 0.62), GTIP_UP = gp(0.36, 0.46, 0.3), GTIP_LAUGH = gp(0.36, 0.58, 0.3);
const gTip = (f: number) => GTIP_FIRE.clone().lerp(GTIP_UP, upK(f)).lerp(GTIP_LAUGH, laughK(f));
/** his free right hand on his thigh (the rig's own rest is 1 cm inside his robe: 1.8 cm higher, a little forward) */
const GREST = gp(-0.1, 0.13, 0.12);
const GEXPR: [number, Expr][] = [
  [S.from, "smile"], [POP + 2, "happy"], [L53.from + 10, "smile"], [BLOW[0], "whistle"], [BLOW[1], "smile"], [W_BEIFANG, "smile_closed"], [L54.from, "smile"],
  [L55.from + 10, "smile_closed"], [B.laugh, "laugh"],
];
/** GUO's gaze: at his oyster, at his father (screen left of him) from the pop on, back at the oyster under the deadpan */
const guoGaze = (f: number) => at(f, [[S.from, 0], [POP + 1, -1], [BLOW[0], 0.5], [BLOW[1] + 2, -1], [L54.from, -0.5], [L55.from, -1], [B.laugh, 0]]);
const guoLook = (f: number) => ky(f, [[S.from, 12], [POP, 12], [POP + 6, 2], [BLOW[0] - 4, 2], [BLOW[0], 10], [BLOW[1], 10], [BLOW[1] + 6, 2], [L55.to, 2], [L55.to + 8, 8], [B.laugh, 4]]);
const guoState = (f: number): St => {
  const t = f / FPS, held = ky(f, [[L55.from + 10, 0], [L55.from + 30, 1], [CARD4.from, 1], [B.laugh, 0]]);
  return {
    at: GUO_AT, facing: GFACE, seat: GS,
    pose: { kind: "sit", t: t + 0.9 },
    expr: at(f, GEXPR), blink: lid(t, 13, swaps(GEXPR)),
    gaze: guoGaze(f), lookDown: guoLook(f),
    head: heads(
      accent("shake", f, W_BEIFANG, { amp: 0.6 }),
      accent("laugh", f, B.laugh, { dur: 2.2, amp: 1.2 }),
      accent("laugh", f, B.laugh + 66, { dur: 1.2, amp: 0.8 }),
      held > 0 ? { dy: 0.02 * held * Math.sin(t * 2 * PI * 6.5), tilt: -3 * held } : undefined,
    ),
    visible: true,
  };
};

export const SEG: Segment = {
  id: "H", from: S.from, to: S.to,
  enter() {},
  exit(w) { setSeat(w.actor(SU_DAN), null); setSeat(w.actor(GUO), null); },
  pose(w, f): Pose {
    w.setPlace("beach");
    w.set.param("fire", 1);
    const cam = camH(f);
    w.setCamera(cam);
    // him on his log, GUO on his
    const su = w.actor(SU_DAN), g = w.actor(GUO);
    setSeat(su, PS, FACE);
    setSeat(g, GS, GFACE);
    su.set({ ...suState(f), hands: [handR(f), handL(f)], armFront: [frontR(f) ? true : undefined, frontL(f) ? true : undefined] });
    g.set({ ...guoState(f), hands: [GREST, guoHand(f)] });
    w.update();
    // his oyster in his right hand (the hinge in his fist), GUO's on the tips of his chopsticks
    const hR = su.handWorld(0), head = su.headWorld();
    const lift = f >= POP && f < POP + 3 ? 0.012 * Math.sin(((f - POP) / 3) * PI) : 0;
    w.prop("oyster", "su").put(hR.clone().add(V(0, lift, 0)), { grip: "hilt", rot: oysterRot(f, hR, head, cam), open: openAt(f), scale: BIG });
    const gh = g.handWorld(1), dir = gTip(f).sub(gh).normalize();
    w.prop("chopsticks", "guo").put(gh, { grip: "hilt", rot: rotChop(dir) });
    // his oyster rides ON TOP of both tips (segB's bone way), its middle 1.2 cm back from their ends, its shell resting
    // 2.5 mm down on the sticks (so the checker sees it supported: a plumb line from the shell's lowest points can miss
    // the two thin sticks), the cup out along the sticks
    const tip = gh.clone().addScaledVector(dir, CHOP_LEN), up = UPV.clone().addScaledVector(dir, -dir.y).normalize();
    const mid = tip.addScaledVector(dir, -0.012).addScaledVector(up, OY_UNDER * GBIG + STICK_R - 0.0025);
    w.prop("oyster", "guo").put(mid.addScaledVector(dir, -OYSTER.len / 2 * GBIG), { rot: rotZY(dir, up), open: 0.12, scale: GBIG });
    const shot = f < L53.from ? "pre" : f < B.lean ? "ecstatic" : f < L54.from ? "lean" : f < L55.from ? "why" : f < CARD4.from ? "deadpan" : "card";
    return { camera: cam, overlays: transitionAt(f)?.node ?? null, slate: `H ${shot}` };
  },
};
