// SEGMENT A, lines A01-A14: 卯时, the corridor at dawn (the hook). WP5. One long handheld take in her eyes:
//   creep    A01        she creeps down the corridor whispering, scanning left, then right: the pan passes HIM, small,
//                       stretching far down the walkway (the audience sees him, she does not); the fact card while
//                       she looks out at the courtyard; she turns forward, sees him, freezes, scurries behind a pillar
//   peek     A02        tucked behind the pillar (its edge in the left foreground), she leans out: 诶，在那儿
//   sneak    A02-A03    reporter's instinct: she tiptoes out toward him; he glances over his shoulder, she freezes; he
//                       turns back; two more steps; the double take: 谁！ he snaps round (the whoosh), shock, a lunge
//                       step, her flinch, the punch-in
//   sword    A04-A06    the draw gag on the mix's anchors: hand to the hilt, stuck tug 1 and tug 2 (A04's grunt), and
//                       he keeps struggling through her offer of help (A05): he hauls back off the stuck hilt (the
//                       rig's haul pose, a tremor, slow heaves), tug 3 cuts into her 陛下, his eyes come up from the
//                       hilt to glare at her on 要, the blush swap on a blink just before 帮, tug 4 (the biggest) on
//                       帮 (four sword_stuck hits, each a jerk of the body and the hilt hand; the blade never comes);
//                       the wind-up crouch, and ON 住口 the blade rings free (sword_ring, A06 - 0.15 s) and swings over
//                       his shoulder to stop 0.4 m from her lens 0.35 s later (her recoil, the tremble), a poke on 口.
//                       She leans in a little with her offer, flinches at tug 4, recoils as the blade arrives
//   plead    A07-A10    she pleads (tremble); he squints on 刺客, is intrigued on 一天; 记录朕？ he steps in, the tip
//                       dips under her chin; the flattery lifts his chin, a smug flicker he catches; 英明神武？ the
//                       blade lowers
//   blush    A11-A12    the slow push on his face; 千古一帝 melts him (smile_closed); on the blink BLUSH2: he looks
//                       away, the body turns 30 deg, the sword goes onto his shoulder (cloth), 咳, he straightens the
//                       crown on 拍, steals a glance at the lens on 点
//   walk-off A13-A14    跟上: he turns his back (blush1, then plain), the camera nods yes; he walks off (steps_him),
//                       a sweep of the free hand on 世面; she scrambles after him (steps_her), 嘿嘿遵命, the whoosh
//                       whips her a stretch further down the corridor under the title card; the last 5 frames whip
//                       RIGHT (the cut to B)
// Every frame is looked up (lineId / capWord / card / BEAT / SEGMENTS, and the sound anchors from the lines' voice
// times); every mark comes from layout/corridor.ts (CORRIDOR.peekPillar, walkOff) and acc/sword.ts drawStand.
import * as THREE from "three";
import type React from "react";
import { SEGMENTS, FPS, lineId, capWord, quote, card, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, h, type Pose, type Segment, type CamPose } from "../story";
import { BEAT, TITLE_SPAN } from "../beats";
import * as C from "../cam";
import { emperorAt, type EmpState } from "../people";
import { CX, CORRIDOR } from "../layout";
import type { World } from "../world";
import { swordDraw, hiltGrip, drawStand, swordAim, swordShoulder, swordRot, DRAW, SWORD_REACH } from "../acc/sword";
import { V, v3, rel, lid, swaps, speak, accent, heads, headPop, at, ky, walkAlong, yawTo, lerpA, frag, shake, type RigState } from "./common";

type St = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
type Head = NonNullable<RigState["head"]>;
const S = SEGMENTS[0];
const ln = (id: string) => lineId(id);
const sec = (s: number) => Math.round(s * FPS);
/** a time on the voice track (s) -> the film frame (the sound mix's anchors are line start / end + an offset) */
const atSec = (s: number) => Math.round(s * FPS);
const word = (id: string, w: string) => capWord(id, w).from;
const EYE = C.EYE, HS = 1.08, PI = Math.PI;
/** his head's middle (measured on the stills: the 1.45 m figure's head at his 1.08) */
const HEAD_Y = 1.32;
/** she COWERS once the sword is out (his face at her level: the menace reads); the draw aims at this lens */
const COWER = -0.24;
/** where the tip aims, off the lens's axis (right, down): the blade reads as a long diagonal at her, not end-on, and
 *  the tip stays above the caption band and left of x 930 (review: [0.1, -0.14] put the tip at y 1250-1320, under the
 *  A05 caption; across his body to the left it read as a pale wedge on his robe) */
const AIM: [number, number, number] = [0.08, -0.08, 0];

// ------------------------------------------------------------------------------------------------ the sound anchors
/** the fixed mix's hits in segment A (scripts/qin/sound/cues.json): the picture lands on them. The four sword_stuck
 *  tugs: two round A04's grunt, two inside her offer (A05 + 0.35 s, and the first frame showing 帮); the blade rings
 *  free 0.15 s before 住口 (A06) */
const SND = {
  tug1: atSec(ln("A04").start - 0.3), tug2: atSec(ln("A04").start + 0.3), tug3: atSec(ln("A05").start + 0.35), tug4: word("A05", "帮"),
  ring: atSec(ln("A06").start - 0.15),
  cloth: atSec(ln("A12").start), himSteps: atSec(ln("A13").start + 0.4), herSteps: atSec(ln("A13").end + 0.1),
  whoosh: atSec(ln("A14").end + 0.15),
};

// ------------------------------------------------------------------------------------------------------- the marks
const PIL = CORRIDOR.peekPillar;
/** her creep: from just inside the walkway to where she sees him */
const P_START = V(CX + 0.15, 0, PIL.z + 5.2), P_SEE = V(CX - 0.4, 0, PIL.z + 2.3);
/** tucked behind the pillar (it covers the left third), then leaning out past its right side (its edge in the left
 *  foreground); both 0.33+ m from its surface */
const P_TUCK = V(PIL.x + 0.05, 0, PIL.z + 0.52), P_PEEK = V(PIL.x + 0.15, 0, PIL.z + 0.5);
/** where she is caught (谁): the draw needs her lens about 2 m from his mark */
const P_CAUGHT = V(CX - 0.6, 0, PIL.z - 0.65);
const SNEAK_DIR = P_CAUGHT.clone().sub(P_PEEK).normalize();
/** where his "谁" freezes her first step out: 0.72 m along the line (0.19 m clear of the pillar) */
const P_SNEAK = P_PEEK.clone().addScaledVector(SNEAK_DIR, 0.72);
const LENS = V(P_CAUGHT.x, EYE + COWER, P_CAUGHT.z);
/** HIS DRAW MARK: the tip of the drawn sword stops 0.4 m from her lens (acc/sword.ts drawStand) */
const M = drawStand(LENS, V(CX, 0, PIL.z - 2.8));
const TO_HER = V(LENS.x - M.x, 0, LENS.z - M.z).normalize();
/** where he stretches: half a metre further on (the lunge step on 谁 brings him to M) */
const M0 = M.clone().addScaledVector(TO_HER, -0.45);
/** 记录朕？ his step in */
const M2 = M.clone().addScaledVector(TO_HER, 0.3);
const F0 = PI;                                  // stretching, his back to us (facing down the walkway)
const F_HER = yawTo(M, LENS), F_HER2 = yawTo(M2, LENS);
const WALK_END = CORRIDOR.walkOff, F_AWAY = yawTo(M2, WALK_END), WALK_V = 1.25;
const HEAD = (p: THREE.Vector3) => V(p.x, HEAD_Y, p.z);
const eyeV = (p: THREE.Vector3, dy = 0) => V(p.x, EYE + dy, p.z);
const tanH = (fov: number) => Math.tan((fov * PI) / 360);
/** a look point that puts a head in the upper third (k 1/3) seen from a lens at pos */
const third = (pos: THREE.Vector3, head: THREE.Vector3, fov = C.FOV, k = 1 / 3) => { const d = Math.hypot(head.x - pos.x, head.z - pos.z); return V(head.x, head.y - d * tanH(fov) * k, head.z); };

// ------------------------------------------------------------------------------------------------------- the beats
const A = BEAT.A, CARD = card("A01");
const W_HALL = word("A01", "走廊"), W_SAME = word("A01", "一样");
/** she turns forward and sees him (the card is still up), freezes, scurries to the pillar */
const SPOT = A.peek - 24, SPOT_TURN = SPOT - 13, SCURRY = SPOT + 6;
const LEAN_OUT = ln("A02").from + 2, SNEAK1 = ln("A02").from + 14, FREEZE = A.glance + 3, SNEAK2 = A.glance + 14;
const REACH0 = SND.tug1 - sec(DRAW.reach), LUNGE0 = A.turn + 3;
/** the wind-up: the crouch into the pull that frees it (swordDraw's wind pose by the ring) */
const WIND0 = SND.ring - sec(0.17);
/** the tip arrives 0.4 m from her lens 0.35 s after the blade rings free (住口 lands on it): the tremble, her recoil and
 *  the glint start here (= BEAT.A.swordStop) */
const F_POINT = SND.ring + sec(0.35);
/** her offer: the first 要 (his eyes come up to glare at her; "要" alone occurs three times in A05) */
const W_YAO = word("A05", "要要");
const STEP0 = A.stepIn - 4, STEP1 = A.stepIn + 10;
const TURN0 = ln("A13").preFrom;
const W_PAT = A.crown, W_DIAN = word("A12", "点"), W_SHIMIAN = word("A13", "世面"), W_GENSHANG = word("A13", "跟上");
const W_YINGMING = word("A09", "英明"), W_CIKE = word("A07", "刺客"), W_YITIAN = word("A07", "一天"), W_YIDI = word("A11", "一帝");
const WHIP_END = S.to - 4;
/** the whoosh's whip (4 frames out, 4 in, starting a frame before the sound) and the frame it lands: her skip on is
 *  hidden at the blur's peak */
const WHIP1 = SND.whoosh - 1, SKIP = WHIP1 + 4;

/** the draw gag's clock (s of acc/sword.ts DRAW) from the film frame: the reach ends on tug 1, the wind-up starts at
 *  WIND0, the blade comes free on the mix's sword_ring and the tip arrives at F_POINT (the swing 0.35 s instead of
 *  0.4); 1:1 after it. (Between tug 1 and the ring the body is struggle()'s, not swordDraw's.) */
const drawT = (f: number) => {
  const K: [number, number][] = [[REACH0, 0], [SND.tug1, DRAW.tug1], [WIND0, DRAW.wind], [SND.ring, DRAW.free], [F_POINT, DRAW.point]];
  if (f <= K[0][0]) return (f - K[0][0]) / FPS;
  for (let i = 0; i + 1 < K.length; i++) if (f <= K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (f - K[i][0]) / (K[i + 1][0] - K[i][0]));
  return DRAW.point + (f - F_POINT) / FPS;
};

// --------------------------------------------------------------------------------------------- his face, his blush
const BLUSH: [number, EmpState][] = [[S.from, "plain"], [SND.tug4 - 3, "blush1"], [A.blush, "blush2"], [TURN0 + 9, "blush1"], [ln("A14").to, "plain"]];
const EXPR: [number, Expr][] = [
  [S.from, "neutral"], [A.turn, "shock"], [REACH0, "huff"], [SND.tug1, "pained"], [SND.tug2, "wince"], [ln("A05").from + 4, "stern"],
  [SND.tug3, "pained"], [W_YAO, "huff"], [SND.tug4, "wince"], [SND.ring, "huff"], [ln("A07").from + 8, "stern"], [W_CIKE, "focus"], [W_YITIAN, "neutral"],
  [STEP0, "focus"], [W_YINGMING, "smug"], [W_YINGMING + 20, "stern"], [ln("A10").from - 2, "neutral"], [W_YIDI, "smile_closed"],
  [A.blush, "stern"], [W_GENSHANG - 6, "cool"],
];
/** the expression changes that hide under a blink (the swaps, the smug he catches, the melt) */
const BLINKS = [...swaps(BLUSH), ...[W_YINGMING + 20, W_YIDI].map((k) => k / FPS)];
/** the pupils: at her lens; down at the stuck hilt (his left, screen right) through the tugs, up at her when she calls him
 *  (陛下) and from 要 on (the glare); the flattery slides them aside; looking away from BLUSH2; a stolen glance on 点 */
const GAZE: [number, number][] = [
  [S.from, 0], [SND.tug1, 0.5], [ln("A05").from + 4, 0], [SND.tug3, 0.5], [W_YAO, 0], [W_YINGMING + 4, 0.5], [W_YINGMING + 20, 0], [ln("A10").from + 4, 0.5], [ln("A10").to - 6, 0],
  [A.blush, -1], [W_DIAN - 2, -0.5], [W_DIAN + 3, 0], [W_DIAN + 12, -1], [TURN0, 0],
];
const DI = ["A03", "A04", "A06", "A08", "A10", "A12", "A13"];
const STRESS: Record<string, number[]> = { A03: [0], A04: [0], A06: [0, 1], A08: [2], A10: [0, 3], A12: [0, 1], A13: [0, 2, 8] };
const talk = (f: number) => { for (const id of DI) { const s = speak(quote("di", id), f, 1, STRESS[id]); if (s.mouth || s.head) return s; } return {} as ReturnType<typeof speak>; };

// ------------------------------------------------------------------------------------------------------ his moves
/** a figure-frame point at his size */
const relS = (p: THREE.Vector3, facing: number, x: number, y: number, z: number) => rel(p, facing, x * HS, y * HS, z * HS);
/** the stretch: arms 0 (hanging) .. 1 (up and out), a slow cycle until the glance */
const stretch = (f: number) => {
  const t = f / FPS, cyc = 0.5 - 0.5 * Math.cos((2 * PI * t) / 3.4);
  return cyc * (1 - smooth((f - A.glance) / 6));
};
/** his left hand on its way to the hilt (out from the robe, a little forward): the lunge's anticipation */
const antic = (p: THREE.Vector3, facing: number) => relS(p, facing, 0.27, 0.64, 0.13);
/** a small 1-cm hover of a held hand (never a frozen sword) */
const hover = (f: number) => { const t = f / FPS; return V(0.006 * Math.sin(2 * PI * 0.7 * t), 0.008 * Math.sin(2 * PI * 0.45 * t + 1), 0.004 * Math.sin(2 * PI * 0.55 * t + 2)); };
/** a direction between a and b along the great circle */
const slerpDir = (a: THREE.Vector3, b: THREE.Vector3, k: number) => a.clone().applyQuaternion(new THREE.Quaternion().slerp(new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(), b.clone().normalize()), clamp01(k))).normalize();
/** THE STRUGGLE (tug 1 .. the ring): the blade stays stuck while she offers help. The four tugs land on the mix's
 *  sword_stuck hits [frame, strength]: each a jerk of the whole body back and down with the torso twisting after the
 *  hand, a head jolt, the hand yanking 2-3 cm up the grip and snapping back (swordDraw's tug: out in 0.07 s, held, back
 *  by 0.36 s). Between them he keeps hauling: the rig's "haul" pose (leaning back off the hilt, its own slow heave) at
 *  a strain that grows with each failed tug, a tremor through the body, the head and both hands, the free hand braced
 *  out in front. In the last 0.17 s he lets the haul go and crouches into swordDraw's wind pose (down 3.5 cm, the head
 *  sunk, the hand drawn up 1.9 cm), so the ring (its smear) starts from swordDraw's own pose.
 *    at = his floor point, amount = the haul's effort, twist = the torso's turn, pull = the hilt hand up the scabbard's
 *    line (m), trem = the tremor (-1..1), brace = how far the free hand is braced */
const TUGS: [number, number][] = [[SND.tug1, 0.6], [SND.tug2, 1.0], [SND.tug3, 0.85], [SND.tug4, 1.2]];
const yankAt = (u: number) => (u < 0 ? 0 : u < 0.07 ? easeOutCubic(u / 0.07) : u < 0.16 ? 1 : 1 - smooth((u - 0.16) / 0.2));
const struggle = (f: number) => {
  const t = f / FPS;
  // (each yank is already 0.86 out on its anchor frame: the jerk lands on the hit, not a frame after it)
  let y = 0, side = 1;
  TUGS.forEach(([k, amp], i) => { const v = amp * yankAt((f - k + 1) / FPS); if (v > y) { y = v; side = i % 2 ? -1 : 1; } });
  const wind = smooth((f - WIND0) / (SND.ring - WIND0)), keep = 1 - wind;
  const on = smooth((f - SND.tug1) / 8) * keep;
  const level = ky(f, [[SND.tug1, 0.26], [SND.tug2 + 6, 0.32], [SND.tug3 + 6, 0.4], [SND.tug4 + 6, 0.48]]);
  // he heaves at it (a pull a little under a second long) and shakes with the effort
  const heave = Math.sin(2 * PI * 1.15 * t), trem = 0.6 * Math.sin(2 * PI * 7.3 * t) + 0.4 * Math.sin(2 * PI * 4.6 * t + 1.7);
  // (capped: past about 0.6 the haul's forward foot pokes out under the hem, a dark nub on the floor)
  const amount = Math.min(0.58, on * (level + 0.06 * heave) + 0.2 * y * keep);
  const back = (0.035 * y + on * (0.006 + 0.004 * heave + 0.004 * trem)) * keep, down = 0.018 * y * keep + 0.035 * wind;
  const head: Head = {
    dy: -(0.05 * y + on * (0.025 + 0.01 * heave)) * keep - 0.06 * wind, squash: (0.07 * y + on * (0.03 + 0.015 * heave)) * keep + 0.05 * wind,
    tilt: (5 * side * y + 2.4 * on * trem) * keep, dx: 0.02 * on * trem * keep,
  };
  const pull = HS * ((0.022 * y + on * (0.005 + 0.003 * heave + 0.002 * trem)) * keep + 0.022 * 0.8 * wind);
  return { at: rel(M, F_HER, 0, -down, -back), amount, twist: (0.07 * y + 0.025 * on * heave) * keep, head, pull, trem, brace: on };
};
/** the hilt hand at rest on the grip (swordDraw between its tugs: the hand ball against the grip's near side) and the
 *  line it pulls along (up the scabbard's line, swordDraw's tug) */
const DRAW_O = { at: M, facing: F_HER, lens: LENS, scale: HS, aim: AIM };
const ON_HILT = swordDraw(DRAW.tug2 - 1e-3, DRAW_O), PULL_DIR = rel(V(), F_HER, -0.1, 0.64, 0.77).normalize();
/** his place on the walk-off (pure: the camera tracks it) */
const walkOf = (f: number) => walkAlong([M2, WALK_END], WALK_V, (f - SND.himSteps) / FPS, { startFacing: F_AWAY });
/** where he stands on frame f (for the camera's framing) */
const hisFloor = (f: number) => (f < LUNGE0 ? M0 : f < STEP0 ? M : f < SND.himSteps ? M2 : walkOf(f).at);
/** the sword's blade-tip trail (the smear of the swing): the tip a few moments back, on screen */
const trail = (w: World, f: number, hilt: THREE.Vector3 | null): React.ReactNode => {
  const pts: string[] = [];
  let alpha = 0;
  for (let k = 0; k < 6; k++) {
    const D = swordDraw(drawT(f) - k * 0.03, { at: M, facing: F_HER, lens: LENS, scale: HS, aim: AIM });
    if (k === 0) alpha = D.phase === "smear" ? D.smear : D.phase === "swing" ? Math.max(D.smear, 0.25) : 0;
    const hand = D.handAt(hilt);
    if (!hand) continue;
    const tip = D.sword ? hand.clone().addScaledVector(D.sword.dir, SWORD_REACH) : hand;
    const q = w.project(tip);
    if (q.front) pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
  }
  if (alpha < 0.05 || pts.length < 2) return null;
  const line = (sw: number, col: string, op: number) => h("polyline", { points: pts.join(" "), fill: "none", stroke: col, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", opacity: op });
  return h("svg", { key: "trail", width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, pointerEvents: "none" } },
    line(54, "#efe6d2", 0.22 * alpha), line(18, "#fff6e0", 0.5 * alpha));
};
/** the glint on the tip as it stops at her lens */
const glint = (w: World, f: number, tip: THREE.Vector3): React.ReactNode => {
  const i = f - F_POINT;
  if (i < 0 || i > 7) return null;
  const q = w.project(tip);
  if (!q.front) return null;
  const s = 60 * Math.sin((PI * (i + 1)) / 9), d = `M0,${-s} L${s * 0.16},0 L0,${s} L${-s * 0.16},0 Z M${-s},0 L0,${s * 0.16} L${s},0 L0,${-s * 0.16} Z`;
  return h("svg", { key: "glint", width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, pointerEvents: "none" } },
    h("path", { d, transform: `translate(${q.x.toFixed(1)},${q.y.toFixed(1)}) rotate(${(i * 6).toFixed(0)})`, fill: "#fff3d6", opacity: 0.85 }));
};

/** HIM, every frame: returns his overlays (the trail, the glint) */
function emperor(w: World, f: number, cam: CamPose): React.ReactNode {
  const r = w.actor(emperorAt(f, BLUSH)), t = f / FPS, T = talk(f), camPos = v3(cam.pos);
  const base: St = { expr: at(f, EXPR), gaze: at(f, GAZE), blink: Math.max(lid(t, 1, BLINKS), T.blink ?? 0), mouth: T.mouth, visible: true };
  const idle = { kind: "idle" as const, t: t + 0.3 };

  // 1. stretching with his back to us; the glance over the shoulder; the beat
  if (f < A.turn) {
    const s = stretch(f), up = (arm: 0 | 1) => relS(M0, F0, (arm ? 1 : -1) * lerp(0.25, 0.4, s), lerp(0.6, 1.06, s), lerp(0.06, -0.03, s));
    const turn = ky(f, [[A.glance, 1], [A.glance + 5, 0.62], [A.glance + 11, 0.62], [A.glance + 16, 1]]);
    const tilt = ky(f, [[A.glance, 0], [A.glance + 5, 8], [A.glance + 11, 8], [A.glance + 16, 0], [A.turn - 8, -5], [A.turn - 1, -2]]);
    const twist = 0.2 * Math.sin((2 * PI * t) / 3.4 + 0.6) * (1 - smooth((f - A.glance) / 6));
    r.set({ ...base, at: M0, facing: F0, pose: idle, turn, twist, hands: [up(0), up(1)], head: { tilt, dy: 0.05 * s } });
    w.update();
    return null;
  }
  // 2. THE SNAP (the whoosh: 4 frames, landing on 谁 with a head pop) and the lunge step to his draw mark
  if (f < REACH0) {
    const k = smooth((f - A.turn) / 4), leg = walkAlong([M0, M], 0.45 / ((REACH0 - LUNGE0) / FPS), (f - LUNGE0) / FPS, { startFacing: lerpA(F0, F_HER, k), endFacing: F_HER });
    const facing = leg.moving || leg.arrived ? leg.facing : lerpA(F0, F_HER, k);
    r.set({ ...base, at: leg.at, facing, pose: leg.pose, turn: 1 - k, head: heads(headPop(f, ln("A03").from), accent("jolt", f, A.turn + 2), T.head) });
    w.update();
    // his left hand already going for the hilt (out from the robe, clear of the hilt): from where it hangs
    const nat = r.handWorld(1), go = smooth((f - A.turn) / 6);
    r.set({ hands: [null, nat.lerp(antic(leg.at, facing), go)] });
    w.update();
    return null;
  }
  // 3. THE DRAW: hand to the hilt; the struggle through her offer (four stuck tugs, the haul, the glare); the wind-up;
  //    free on 住口, the swing, the point; a poke of the tip on 口
  if (f < STEP0) {
    const D = swordDraw(drawT(f), DRAW_O), G = f >= SND.tug1 && f < SND.ring ? struggle(f) : null;
    const jab = ky(f, [[A.jab - 3, 0], [A.jab, 1], [A.jab + 3, 1], [A.jab + 11, 0]]);
    const glare = f >= F_POINT ? { dy: -0.04 * smooth((f - F_POINT) / 10) } : undefined;      // the chin drops into the glare
    // his eyes down at the stuck hilt; up at her on 陛下, down again at tug 3, up for good on 要 (the glare); the haul's
    // lean back is made up for so the chin stays down
    const look = ky(f, [[REACH0, 0], [SND.tug1, 9], [ln("A05").from + 1, 9], [ln("A05").from + 5, 0], [SND.tug3, 0], [SND.tug3 + 3, 8], [W_YAO - 3, 8], [W_YAO + 1, -2], [SND.ring, -2], [SND.ring + 4, 0]]);
    r.set({ ...base, at: G ? G.at : D.at, facing: F_HER, pose: idle, turn: 0, hide: D.hide, lookDown: look + (G ? 10 * G.amount : 0),
      head: heads(G ? G.head : D.head, T.head, glare, accent("jolt", f, A.jab, { amp: 0.8 })) });
    w.update();
    // the struggle: the free hand stays where it hangs and braces a little forward and out while the body hauls back
    // (from the idle solve: no jump where the haul starts and ends, on tug 1 and on the ring)
    let free: THREE.Vector3 | null = null;
    if (G) {
      free = r.handWorld(0).add(rel(V(), F_HER, -0.03 * HS, (0.03 + 0.006 * G.trem) * HS, 0.06 * HS).multiplyScalar(G.brace));
      r.set({ pose: { kind: "haul", t, amount: G.amount }, twist: G.twist, hands: [free, null] });
      w.update();
    }
    const hilt = hiltGrip(r);
    // the reach starts where the lunge left the hand (antic), not from the rig's hang (inside his wide robe)
    const hand = D.phase === "reach" ? antic(M, F_HER).lerp(ON_HILT.handAt(hilt) ?? antic(M, F_HER), smooth(drawT(f) / DRAW.reach))
      : G ? ON_HILT.handAt(hilt)?.addScaledVector(PULL_DIR, G.pull) ?? null : D.handAt(hilt);
    if (hand) {
      if (D.phase === "point") hand.add(hover(f));
      // the swing over the top passes out to his left, the blade clear of his crown and head
      if (D.phase === "swing") hand.addScaledVector(V(Math.cos(F_HER), 0, -Math.sin(F_HER)), 0.08 * Math.sin(PI * clamp01((drawT(f) - DRAW.swing) / (DRAW.point - DRAW.swing))));
      if (jab > 0 && D.sword) hand.addScaledVector(D.sword.dir, 0.07 * jab);
      r.set({ hands: [free, hand] });
      w.update();
    }
    let tip: THREE.Vector3 | null = null;
    if (D.sword) { const hw = r.handWorld(1); w.prop("sword").put(hw, { grip: "hilt", rot: D.sword.rot }); tip = hw.clone().addScaledVector(D.sword.dir, SWORD_REACH); }
    return frag(trail(w, f, hilt), tip ? glint(w, f, tip) : null);
  }
  // 4. 记录朕？ the step in, the tip dipping under her chin; the flattery; 英明神武？ the blade lowers
  if (f < SND.cloth) {
    const leg = walkAlong([M, M2], 0.3 / ((STEP1 - STEP0) / FPS), (f - STEP0) / FPS, { startFacing: F_HER, endFacing: F_HER2 });
    const facing = leg.moving ? leg.facing : leg.arrived ? F_HER2 : F_HER;
    const k = ky(f, [[STEP0, 1], [STEP1 + 2, 0.55], [W_YINGMING, 0.5], [ln("A10").from, 0.45], [ln("A10").to - 2, 0]]);
    const chin = ky(f, [[W_YINGMING - 2, 0], [W_YINGMING + 6, 0.07], [W_YINGMING + 20, 0.07], [W_YINGMING + 28, 0]]);
    const tilt = ky(f, [[ln("A07").from, 0], [W_CIKE, -5], [W_YITIAN - 4, -5], [W_YITIAN + 4, 3], [STEP0, 3], [STEP1, -7], [ln("A08").to + 6, -7], [ln("A09").from + 10, 0],
      [W_YINGMING, 0], [W_YINGMING + 8, 5], [W_YINGMING + 24, 0], [ln("A10").from, 0], [ln("A10").from + 10, -8], [ln("A11").from, -8], [ln("A11").to, -3], [A.blush, -3], [A.blush + 6, -9]]);
    const lean = ky(f, [[STEP0, 0], [STEP1, -0.05], [ln("A08").to + 8, -0.05], [ln("A09").from + 12, 0]]);
    r.set({ ...base, at: leg.at, facing, pose: leg.moving ? leg.pose : idle, turn: 0, hide: ["hilt"],
      head: heads({ tilt, dy: chin + lean }, T.head, accent("nod", f, word("A08", "朕")), headPop(f, W_YIDI, [1.06, 1.03, 1.01])) });
    w.update();
    const S2 = swordAim({ at: leg.at, facing, lens: LENS, scale: HS, aim: AIM }, k);
    r.set({ hands: [null, S2.hand.clone().add(hover(f))] });
    w.update();
    w.prop("sword").put(r.handWorld(1), { grip: "hilt", rot: S2.rot });
    return null;
  }
  // 5. BLUSH2: he looks away, turns 30 deg and shoulders the sword (cloth), 咳, straightens the crown on 拍
  if (f < TURN0) {
    const kt = smooth((f - SND.cloth) / 9), facing = F_HER2 - 0.52 * kt;
    const tilt = ky(f, [[A.blush, -3], [A.blush + 6, -9], [W_PAT + 2, -9], [W_PAT + 6, -1], [W_DIAN, -1], [W_DIAN + 12, -6]]);
    r.set({ ...base, at: M2, facing, pose: idle, turn: 0, hide: ["hilt"],
      head: heads({ tilt }, T.head, accent("squash", f, SND.cloth, { amp: 1.2 }), accent("nod", f, SND.cloth + 4)) });
    w.update();
    const low = swordAim({ at: M2, facing, lens: LENS, scale: HS, aim: AIM }, 0), sh = swordShoulder({ at: M2, facing, lens: camPos, scale: HS });
    const sHand = low.hand.clone().lerp(sh.hand, kt).add(hover(f)), dir = slerpDir(low.dir, sh.dir, kt);
    // the crown: his right hand up beside the board's right end, two little pats (拍, 好), and down after 点. The rig's
    // arm cannot reach the board itself (review: 0.43 m out at +0.2 fell 10 cm short and the hand hid behind his head):
    // the target is out beside the head where the hand reaches and shows, the head tilting into it
    const up = ky(f, [[W_PAT - 9, 0], [W_PAT - 1, 1], [W_DIAN + 3, 1], [W_DIAN + 13, 0]]);
    let cHand: THREE.Vector3 | null = null;
    if (up > 0.01) {
      const hd = r.headWorld(), right = V(-Math.cos(facing), 0, Math.sin(facing)), fwd = V(Math.sin(facing), 0, Math.cos(facing));
      const tug = ky(f, [[W_PAT, 0], [W_PAT + 2, 1], [W_PAT + 5, 0], [W_PAT + 9, 0.7], [W_PAT + 12, 0]]);
      const crown = hd.clone().addScaledVector(right, 0.34 * HS).addScaledVector(fwd, 0.06).add(V(0, 0.1 - 0.03 * tug, 0));
      cHand = r.handWorld(0).lerp(crown, easeInOutCubic(up)).addScaledVector(right, 0.06 * Math.sin(PI * up));
    }
    r.set({ hands: [cHand, sHand] });
    w.update();
    w.prop("sword").put(r.handWorld(1), { grip: "hilt", rot: swordRot(dir, camPos.clone().sub(sHand)) });
    return null;
  }
  // 6. 跟上: the turn away (his back to her), the walk-off with the sword on his shoulder; the sweep on 世面
  const k = smooth((f - TURN0) / 12), L6 = walkOf(f);
  const facing = L6.moving || L6.arrived ? L6.facing : lerpA(F_HER2 - 0.52, F_AWAY, k);
  const sweep = ky(f, [[W_SHIMIAN - 8, 0], [W_SHIMIAN + 2, 1], [W_SHIMIAN + 16, 1], [W_SHIMIAN + 28, 0]]);
  r.set({ ...base, at: L6.at, facing, pose: L6.moving ? L6.pose : idle, turn: k, hide: ["hilt"], head: heads(T.head, accent("nod", f, W_GENSHANG, { amp: 0.8 }), { tilt: 4 * sweep }) });
  w.update();
  const sh = swordShoulder({ at: L6.at, facing, lens: camPos, scale: HS });
  const sw = sweep > 0.01 ? r.handWorld(0).lerp(relS(L6.at, facing, -0.5, 0.95, 0.22), easeInOutCubic(sweep)) : null;
  r.set({ hands: [sw, sh.hand] });
  w.update();
  w.prop("sword").put(r.handWorld(1), { grip: "hilt", rot: sh.rot });
  return null;
}

// --------------------------------------------------------------------------------------------------- her camera
/** the creep's look: degrees off straight down the walkway (+ = right): left at the lattice wall, the slow pan right
 *  past him on 每条都长得一样, out at the courtyard under the card, back forward onto him */
const yawToHim = (p: THREE.Vector3) => (Math.atan2(M0.x - p.x, -(M0.z - p.z)) * 180) / PI;
/** moving at frame 0 (an ease-out to a stop where she sees him), then the scurry to the pillar */
const creepPos = (f: number) => {
  if (f <= SPOT) return P_START.clone().lerp(P_SEE, smooth(clamp01((f - S.from) / (SPOT - S.from)) * 0.5 + 0.5) * 2 - 1);
  return P_SEE.clone().lerp(P_TUCK, easeInOutCubic(clamp01((f - SCURRY) / (A.peek - SCURRY))));
};
const creepCam = (f: number): CamPose => {
  const p = creepPos(f), yHim = yawToHim(p), crouch = easeInOutCubic(clamp01((f - SCURRY) / (A.peek - SCURRY)));
  const yaw = ky(f, [[S.from, -24], [W_HALL, -27], [W_SAME + 10, 31], [SPOT_TURN, 31], [SPOT, yHim]]);
  const pitch = ky(f, [[S.from, -4], [W_HALL, -2], [W_SAME + 10, -3], [SPOT, -2]]);
  const a = (yaw * PI) / 180, pos = eyeV(p, lerp(-0.03, -0.12, crouch));
  const free = pos.clone().add(V(Math.sin(a) * 8, Math.tan((pitch * PI) / 180) * 8, -Math.cos(a) * 8));
  const look = free.lerp(third(pos, HEAD(M0)), smooth((f - SPOT_TURN) / (SPOT - SPOT_TURN)));
  return { pos, look, fov: C.FOV };
};
/** her place in the scramble: after him at 2.4 m/s until 2.3 m behind; the whoosh skips her on to 2.1 m */
const chasePos = (f: number) => {
  const him = walkOf(f).at, u = (f - SND.herSteps) / FPS;
  const ran = 2.4 * Math.max(0, u - 0.12) + 1.2 * Math.min(u, 0.12) * 0.5;
  const z0 = P_CAUGHT.z - ran, gap = f >= SKIP ? 2.1 : 2.3;
  const z = Math.max(z0, him.z + gap), x = lerp(P_CAUGHT.x, CX - 0.3, smooth(u / 1.2));
  return V(f >= SKIP ? CX - 0.32 : x, 0, f >= SKIP ? him.z + gap : z);
};
const CAM_KEYS = (): C.CamKey[] => {
  const tuck = eyeV(P_TUCK, -0.12), peek = eyeV(P_PEEK, -0.07), sneak = eyeV(P_SNEAK, -0.03), caught = eyeV(P_CAUGHT), cower = eyeV(P_CAUGHT, COWER);
  const pushTo = eyeV(P_CAUGHT, COWER + 0.1).addScaledVector(TO_HER, -0.07);
  return [
    { f: A.peek, pos: tuck, look: third(tuck, HEAD(M0)) },
    { f: LEAN_OUT, pos: tuck, look: third(tuck, HEAD(M0)) },
    { f: LEAN_OUT + 9, pos: peek, look: third(peek, HEAD(M0)), roll: 3, ease: easeOutCubic },
    { f: SNEAK1, pos: peek, look: third(peek, HEAD(M0)), roll: 2 },
    { f: FREEZE, pos: sneak, look: third(sneak, HEAD(M0)), roll: 0, ease: easeOutCubic },
    { f: SNEAK2, pos: sneak, look: third(sneak, HEAD(M0)) },
    { f: A.turn + 1, pos: caught, look: third(caught, HEAD(M0)), ease: easeOutCubic },
    { f: A.turn + 9, pos: cower, look: third(cower, HEAD(M)) },
    { f: STEP0, pos: cower, look: third(cower, HEAD(M)) },
    { f: STEP1 + 4, pos: cower, look: third(cower, HEAD(M2)) },
    { f: A.push[0], pos: cower, look: third(cower, HEAD(M2)), fov: C.FOV },
    { f: A.push[1], pos: pushTo, look: third(pushTo, HEAD(M2), C.FOV * 0.92, 0.3), fov: C.FOV * 0.92, ease: (x: number) => smooth(x) },
    { f: TURN0, pos: pushTo, look: third(pushTo, HEAD(M2), C.FOV * 0.92, 0.3), fov: C.FOV * 0.92 },
    { f: SND.himSteps + 6, pos: caught, look: third(caught, HEAD(M2)), fov: C.FOV },
  ];
};
const KEYS = CAM_KEYS();
const MOOD: [number, C.Mood][] = [[S.from, "scared"], [ln("A11").from, "calm"], [SND.herSteps, "excited"]];
const WALK: [number, number][] = [
  [S.from, 0.75], [SPOT - 16, 0.75], [SPOT - 6, 0], [SCURRY, 0], [SCURRY + 4, 1], [A.peek - 2, 1], [A.peek + 4, 0], [SNEAK1, 0], [SNEAK1 + 4, 0.6], [FREEZE - 2, 0.6],
  [FREEZE + 1, 0], [SNEAK2, 0], [SNEAK2 + 3, 0.6], [A.turn, 0.6], [A.turn + 2, 0], [SND.herSteps, 0], [SND.herSteps + 5, 1],
];
/** her camera on frame f: { camera, post, smear } */
function camAt(f: number): { camera: CamPose; post?: Pose["post"]; smear: number } {
  let c: CamPose;
  if (f < A.peek) c = creepCam(f);
  else if (f < SND.herSteps) {
    c = C.keyCam(f, KEYS);
    if (f >= TURN0) {                                 // track him as he turns and walks off (she stays, stunned)
      const p = v3(c.pos), k = smooth((f - TURN0) / 14), hd = HEAD(hisFloor(f));
      c = { ...c, look: v3(c.look).lerp(third(p, hd, c.fov, 0.22), k).toArray() as [number, number, number] };
    }
  } else {                                            // the scramble after him
    const p = eyeV(chasePos(f)), him = walkOf(f).at;
    const k = smooth((f - SND.herSteps) / 10), stay = C.keyCam(SND.herSteps - 1, KEYS), sLook = v3(stay.look).lerp(third(v3(stay.pos), HEAD(him), C.FOV, 0.22), 1);
    const look = V(lerp(him.x, CX, 0.4), 1.5, him.z - 2.2);
    c = { pos: v3(stay.pos).lerp(p, k).toArray() as [number, number, number], look: sLook.lerp(look, k).toArray() as [number, number, number], fov: C.FOV };
  }
  c = C.handheld(c, f, { mood: MOOD, walk: WALK });
  // the scramble's fast bob and her excitement; the sword's tremble
  if (f >= SND.herSteps) c = C.handheld(c, f, { mood: "excited", walk: 1, amp: 0.7 * smooth((f - SND.herSteps) / 8), seed: 3 });
  const trem = ky(f, [[F_POINT - 1, 0], [F_POINT, 1.7], [A.lower, 1.3], [ln("A10").to, 0.6], [ln("A11").from + 10, 0]]);
  if (trem > 0.01) c = C.handheld(c, f, { mood: "scared", amp: trem, seed: 7 });
  // the startles: she spots him (a stop-jolt), his snap (she flinches back), the tip arriving (recoil), the jab
  const flinch = ky(f, [[A.turn, 0], [A.turn + 3, 1], [A.turn + 20, 0.4]]) * (f < F_POINT ? 1 : 0)
    + ky(f, [[F_POINT - 1, 0], [F_POINT + 2, 1], [F_POINT + 22, 0.5], [ln("A10").from, 0.5], [ln("A10").to, 0]]) * (f >= F_POINT ? 1 : 0);
  const jab = ky(f, [[A.jab, 0], [A.jab + 2, 1], [A.jab + 12, 0]]);
  c = C.nudge(c, { fwd: -0.05 * flinch - 0.035 * jab, pitch: 1.2 * flinch + 1.5 * jab });
  // her offer of help: she leans in a little (up out of the cower, a tilt of the head, a glance down at the hilt), shies
  // back from tug 4 and is driven back down into the cower by the swing (the recoil above takes over on its arrival)
  const offer = ky(f, [[ln("A05").from, 0], [W_YAO + 4, 1], [SND.tug4, 1], [SND.tug4 + 4, 0.45], [SND.ring, 0.45], [F_POINT, 0]]);
  if (offer > 0.001) c = C.nudge(c, { fwd: 0.06 * offer, up: 0.04 * offer, roll: -2.5 * offer, pitch: -1.2 * offer });
  // the struggle crouches him (the haul, the jerks): the lens dips with him, his eyes stay near the upper third
  const sag = ky(f, [[SND.tug1, 0], [SND.tug1 + 10, 1], [SND.ring, 1], [F_POINT, 0]]);
  if (sag > 0.001) c = C.nudge(c, { pitch: -1.1 * sag });
  // his eyes in the upper third once he faces her (review: the rig's eyes sit under HEAD_Y and her recoil tips the lens
  // up, so they landed at y 660-700): the lens dips a little from the snap until the push, which frames him itself
  // (there his eyes are at the third and the crown's left end must stay clear of the time stamp)
  const lift = ky(f, [[A.turn - 2, 0], [A.turn + 3, 1], [ln("A10").to, 1], [A.push[0] + 8, 0]]);
  if (lift > 0.001) c = C.nudge(c, { pitch: -1.8 * lift });
  c = shake(c, f, SPOT, 5, 6, 6);
  c = shake(c, f, SND.tug1, 4, 2, 6);
  c = shake(c, f, SND.tug2, 6, 2, 6);
  c = shake(c, f, SND.tug3, 5, 2, 6);
  c = shake(c, f, SND.tug4, 7, 2, 6);
  c = shake(c, f, F_POINT, 12, 2, 10);
  c = shake(c, f, A.jab + 1, 9, 2, 8);
  // 跟上: the camera nods yes
  const nod = ky(f, [[W_GENSHANG + 2, 0], [W_GENSHANG + 6, 1], [W_GENSHANG + 12, 0], [W_GENSHANG + 16, 0.6], [W_GENSHANG + 22, 0]]);
  if (nod > 0) c = C.nudge(c, { pitch: -3.5 * nod });
  // 谁: the punch-in, eased back out for the draw
  c = C.punchIn(c, f, ln("A03").from, { k: 0.82, len: 4, off: SND.tug1 + 2 });
  // the whoosh's whip (the scramble skips on), then the last 5 frames whip RIGHT out of the scene (B lands it)
  const W1 = C.whip(c, f, WHIP1, { dir: 1, deg: 22 });
  if (W1.post) return { camera: W1.cam, post: W1.post, smear: W1.smear };
  const W2 = C.whip(c, f, WHIP_END, { dir: 1, out: 5, in: 4 });
  if (W2.post) return { camera: W2.cam, post: W2.post, smear: W2.smear };
  return { camera: c, smear: 0 };
}

const phase = (f: number) =>
  f < A.peek ? "creep" : f < A.turn ? "peek / sneak" : f < STEP0 ? "the draw" : f < SND.cloth ? "plead" : f < TURN0 ? "blush" : f < SND.herSteps ? "walk-off" : f <= TITLE_SPAN[1] ? "scramble + title" : "scramble, whip";

export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w: World, f: number): Pose {
    w.setPlace("corridor");
    w.set.param("dawn", lerp(0.5, 0.58, clamp01((f - S.from) / (S.to - S.from))));     // the sun climbs a little
    const K = camAt(f);
    w.setCamera(K.camera);
    const ov = emperor(w, f, K.camera);
    return { camera: K.camera, post: K.post, overlays: frag(ov, C.whipSmear(K.smear, 1)), slate: `A ${phase(f)}` };
  },
};
