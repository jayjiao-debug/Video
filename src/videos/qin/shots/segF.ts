// SEGMENT F, lines F01-F09: 戌时, 兰池 at night (the hood, the beads, the bandits, the hand over the lens). WP5.
// One handheld take in her eyes, the only cut hidden in a whip pan:
//   land     S.from .. +4   the whip from E's hall LANDS here (C.whip arriving + whipSmear): the path by the pond, the
//                           big rock in the left foreground, him on the path between his four guards
//   hood     F01            (cloth) he pulls the hood up over the crown (EMPEROR -> EMPEROR_HOOD at the top of the pull,
//                           a head squash), smug with his disguise; 今晚 leaning in low, a thumb back down the path on
//                           出去走走, a palm-down pat on 不许声张
//   guards   F02-F03        she counts the guards: the lens swings left, then right across them (四个); 够了 with a
//                           proud chin and a flick of the hand
//   beads    F04-F05        she giggles (the lens bobs), creeps in and tilts up to the bead strings poking out of his
//                           hood (珠子); he is puzzled, then 露出来了 lands: shock; 嘘！ (crown_beads) his right hand slams
//                           up and shoves the beads in under the hood, his left finger at his lips, HOOD_BLUSH1; she
//                           flinches back
//   bandits  F06            the reeds rustle (both look right); bandits: three masked men leap out of the reeds, knives
//                           up; he jolts, his hand flies to the hilt; 啊！ the lens jerks to them; 有人！ she whips left and
//                           DOWN behind the rock: the lens cowers up at the moon over the rock's edge, trembling hard,
//                           while the fight happens off-screen (the fact card)
//   peek     F06 hold, F07  she rises and peeks over the rock: he is crouched in fright, hands up, watching the guards;
//                           he notices the lens, springs upright, tugs his robe straight twice (blush1 on the blink);
//                           刚才，朕没有吓到 chin up, body and eyes turned away, a pop on 朕, a shake on 没有
//   agree    F08            she stands up and steps out (是 with a camera nod), stifling a giggle; he glances at the
//                           lens, suspicious
//   cover    F09            he strides at her, 那段 with a jab of the chin, 删了: his left palm comes at the lens
//                           (palm_cover): the frame is his dark warm palm by F09 end + 0.2 s, held to the last frame
// Every frame is looked up (lineId / capWord / BEAT / SEGMENTS, the sound anchors from the lines' voice times); every
// mark comes from layout/night.ts (NX, NIGHT.duck: her spot behind the rock).
import * as THREE from "three";
import type React from "react";
import { SEGMENTS, FPS, lineId, capWord, card, quote, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, h, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { emperorAt, GUARD, BANDIT, type EmpState } from "../people";
import { NX, NIGHT } from "../layout/night";
import type { World } from "../world";
import { hiltGrip } from "../acc/sword";
import { V, v3, rel, lid, speak, accent, heads, headPop, at, ky, walkAlong, yawTo, lerpA, frag, shake, halberdHand, hopArc, swaps, stagger, type RigState } from "./common";

type St = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[5];
const ln = (id: string) => lineId(id);
/** a time on the voice track (s) -> the film frame (the sound mix's anchors are line start / end + an offset) */
const atSec = (s: number) => Math.round(s * FPS);
const word = (id: string, w: string) => capWord(id, w).from;
const EYE = C.EYE, HS = 1.08, PI = Math.PI, RAD = PI / 180;
/** his head's middle (segA's measure: the 1.45 m figure's head at his 1.08) */
const HEAD_Y = 1.32;
const B = BEAT.F;

// ------------------------------------------------------------------------------------------------ the sound anchors
/** the fixed mix's hits in segment F (scripts/qin/sound): the picture lands on them */
const SND = {
  cloth: atSec(ln("F01").start - 0.4),      // the hood goes on
  beads: atSec(ln("F05").start),            // he shoves the beads in
  bandits: atSec(ln("F06").start - 0.25),   // they leap out
  palm: atSec(ln("F09").end + 0.1),         // his palm lands on the lens
};

// ------------------------------------------------------------------------------------------------------- the lines
const F01 = ln("F01"), F02 = ln("F02"), F03 = ln("F03"), F04 = ln("F04"), F05 = ln("F05"), F06 = ln("F06"), F07 = ln("F07"), F08 = ln("F08"), F09 = ln("F09");
const W_CHUQU = word("F01", "出去"), W_BUXU = word("F01", "不许"), W_SIGE = word("F02", "四个"), W_GOU = word("F03", "够");
const W_ZHUZI = word("F04", "珠子"), W_LU = word("F04", "露出来"), W_YOUREN = word("F06", "有人");
const W_ZHEN = word("F07", "朕"), W_MEIYOU = word("F07", "没有"), W_XIA = word("F07", "吓到"), W_SHI = word("F08", "是");
const W_NADUAN = word("F09", "那段"), W_SHAN = word("F09", "删了"), W8_MEIYOU = word("F08", "没有");
/** the fact card's last frame (his face stays out from under it while she peeks) */
const CARD_TO = card("F06").to;

// ------------------------------------------------------------------------------------------------------- the beats
const HOOD_UP = SND.cloth - 9, HOOD_DN = SND.cloth + 9;            // his hands up behind his head, the pull, down again
const CREEP0 = F04.from + 4, CREEP1 = W_LU + 6;                    // she creeps in on the beads
const RUSTLE = F06.preFrom + 2;                                    // the reeds rustle (F06's silent beat)
const LEAP = SND.bandits, LAND = LEAP + 9;                         // the bandits' leap
const DUCK_W = W_YOUREN - 4;                                       // the whip left and down behind the rock (out 4, in 5)
const DUCKED = DUCK_W + 9;
const RISE0 = B.clash[1] - 8, RISE1 = RISE0 + 20;                  // she rises and peeks over the rock
const NOTICE = RISE1 + 5, UP0 = NOTICE + 4, UP1 = UP0 + 7;         // the lens lands on him crouched; he notices it, springs upright
const TUG = [Math.max(B.straighten, UP1 + 2), Math.max(B.straighten, UP1 + 2) + 9];   // two tugs of the robe
const STAND0 = F08.from - 4, STAND1 = STAND0 + 16;                 // she stands up and steps out
const WALK0 = F09.from - 8, REACH0 = W_SHAN - 5;
const COVER_ON = SND.palm - 6;                                     // C.handCover: cover 1 on SND.palm
/** the off-screen clash: the metal hits inside the mix's "bandits" clip (s from its start, read off its envelope) */
const CLASH_HITS = [0.9, 1.43, 1.57, 1.97, 2.23].map((s) => SND.bandits + atSec(s));

// ------------------------------------------------------------------------------------------------------- the marks
const P = (x: number, z: number) => V(NX + x, 0, z);
/** his mark on the path, 3 m in front of her first spot */
const EMP = P(-0.2, -1.0);
/** her spots: the opening (the rock in the left foreground), crept in on the beads, behind the rock (NIGHT.duck: the
 *  lens 0.37 m behind its back face), stepped out east of it (0.3 m clear of its edge) */
const L0 = P(-0.45, 2.0), L1 = P(-0.32, 0.72), DUCK = V(NIGHT.duck.x, 0, NIGHT.duck.z), L2 = P(-0.9, 1.45);
const DUCK_Y = 0.95, PEEK_Y = 1.42;
/** where he stops in front of her for 删了 (1.4 m from her lens) */
const E2 = EMP.clone().add(L2.clone().sub(EMP).setY(0).normalize().multiplyScalar(L2.distanceTo(EMP) - 1.4));
const WALK_V = 1.6;
/** the guards: start (round him), where they charge to (between him and the reeds); facing: the front two look down
 *  the path (backs to us), the flank two toward her */
const GUARDS = [
  { key: "1", a: P(-0.85, -2.75), b: P(-0.3, -3.05), front: true },
  { key: "2", a: P(0.5, -2.85), b: P(0.55, -2.55), front: true },
  { key: "3", a: P(-1.0, -1.7), b: P(-0.95, -2.15), front: false },
  { key: "4", a: P(0.72, -1.45), b: P(0.48, -2.0), front: false },
];
/** the bandits: crouched in the reeds (NIGHT.bandits), where they land, knives up */
const BANDITS = NIGHT.bandits.map((m, i) => ({ key: String(i + 1), a: m.clone(), b: [P(0.9, -3.9), P(1.45, -3.45), P(0.3, -5.05)][i] }));
/** the clash view: low behind the rock, cowering up at the moon (az -4 deg, el 21 deg) */
const MOON_DIR = V(Math.sin(-4 * RAD), Math.tan(21 * RAD), -Math.cos(-4 * RAD)).normalize();

// ------------------------------------------------------------------------------------------------------ helpers
const relS = (p: THREE.Vector3, facing: number, x: number, y: number, z: number) => rel(p, facing, x * HS, y * HS, z * HS);
const tanH = (fov: number) => Math.tan((fov * PI) / 360);
/** a look point that puts `head` at k of the half-height above the middle (1/3 = the upper-third line) */
const third = (pos: THREE.Vector3, head: THREE.Vector3, fov = C.FOV, k = 1 / 3) => { const d = Math.hypot(head.x - pos.x, head.z - pos.z); return V(head.x, head.y - d * tanH(fov) * k, head.z); };
const hover = (f: number, s = 1) => { const t = f / FPS; return V(0.006 * Math.sin(2 * PI * 0.7 * t + s), 0.008 * Math.sin(2 * PI * 0.45 * t + 1 + s), 0.004 * Math.sin(2 * PI * 0.55 * t + 2 + s)); };

// ---------------------------------------------------------------------------------------- where he is, how low
const hisWalk = (f: number) => walkAlong([EMP, E2], WALK_V, (f - WALK0) / FPS);
const hisAt = (f: number) => (f < WALK0 ? EMP.clone() : hisWalk(f).at);
/** the fright crouch (m): he sinks as the bandits come, stays down through the fight, springs up when he sees the lens */
const sinkAt = (f: number) => ky(f, [[LEAP, 0], [LEAP + 6, 0.06], [DUCK_W + 6, 0.14], [UP0, 0.14], [UP1, 0]]);
const headOf = (f: number) => { const p = hisAt(f); return V(p.x, HEAD_Y - sinkAt(f), p.z); };

// ------------------------------------------------------------------------------------------------- her camera
/** her floor point and eye height on frame f (pure) */
const lensAt = (f: number): THREE.Vector3 => {
  if (f < DUCK_W + 4) {                                          // the opening spot, the creep in on the beads
    const p = L0.clone().lerp(L1, easeInOutCubic(clamp01((f - CREEP0) / (CREEP1 - CREEP0))));
    return V(p.x, EYE - 0.04 * smooth((f - CREEP0) / 10) + 0.04 * smooth((f - SND.beads) / 6), p.z);
  }
  if (f < STAND0) return V(DUCK.x, lerp(DUCK_Y, PEEK_Y, easeInOutCubic(clamp01((f - RISE0) / (RISE1 - RISE0)))), DUCK.z);
  const k = easeInOutCubic(clamp01((f - STAND0) / (STAND1 - STAND0)));
  return V(lerp(DUCK.x, L2.x, k), lerp(PEEK_Y, EYE, k), lerp(DUCK.z, L2.z, k));
};
/** where she looks (before the yaw / pitch moves) */
const lookAt = (f: number, pos: THREE.Vector3): THREE.Vector3 => {
  if (f < DUCK_W + 4) {
    const head = third(pos, headOf(f), C.FOV, 0.37);
    // the beads: the lens tips up a touch toward the bead strings (his eyes stay in the upper third), back on 嘘
    const brow = third(pos, headOf(f), C.FOV, 0.34);
    const kb = ky(f, [[W_ZHUZI - 6, 0], [W_ZHUZI + 6, 1], [SND.beads - 2, 1], [SND.beads + 6, 0]]);
    // the bandits: the lens jerks right to them (between him and the leapers)
    const band = V(NX + 0.7, 0.8, -3.8), kj = ky(f, [[LEAP, 0], [LEAP + 4, 0.75], [DUCK_W, 0.7]]);
    return head.lerp(brow, kb).lerp(band, kj);
  }
  const moon = pos.clone().addScaledVector(MOON_DIR, 8);
  if (f < STAND0) return moon.lerp(third(pos, headOf(f), C.FOV, ky(f, [[CARD_TO, 0.3], [CARD_TO + 12, 0.37]])), easeInOutCubic(clamp01((f - RISE0 - 4) / (RISE1 - RISE0))));
  return third(pos, headOf(f), C.FOV, ky(f, [[WALK0, 0.37], [WALK0 + 16, 0.42]]));
};
const MOOD: [number, C.Mood][] = [[S.from, "calm"], [F02.from, "excited"], [F03.from, "calm"], [F04.from, "excited"], [SND.beads, "calm"], [RUSTLE, "scared"], [STAND1, "calm"], [F09.from, "excited"]];
const WALK: [number, number][] = [[S.from, 0.7], [S.from + 16, 0], [CREEP0, 0], [CREEP0 + 6, 0.45], [CREEP1 - 4, 0.45], [CREEP1 + 2, 0], [STAND0, 0], [STAND0 + 4, 0.55], [STAND1, 0.55], [STAND1 + 5, 0]];

/** her camera without the whips (for the whip's two ends too) */
function rawCam(f: number): CamPose {
  const pos = lensAt(f), look = lookAt(f, pos);
  let c: CamPose = { pos: pos.toArray() as [number, number, number], look: look.toArray() as [number, number, number], fov: C.FOV };
  // F02: she counts the guards: left pair, right pair, back to him
  const count = ky(f, [[F02.from + 4, 0], [W_SIGE - 2, -11], [W_SIGE + 7, -11], [F03.from - 7, 10], [F03.from - 4, 10], [F03.from + 4, 0]]);
  // the rustle: a nervous drift right; the peek's tilted head
  const drift = ky(f, [[RUSTLE, 0], [RUSTLE + 6, 5], [LEAP, 5], [LEAP + 3, 0]]);
  const peekRoll = ky(f, [[RISE0, 0], [RISE1, 4], [F07.from, 3], [STAND0, 3], [STAND1, 0]]);
  c = C.nudge(c, { yaw: count + drift, roll: peekRoll });
  c = C.handheld(c, f, { mood: MOOD, walk: WALK });
  // the giggle (F04, and the stifled one in F08): fast little bobs
  const g = ky(f, [[F04.from, 0.25], [W_ZHUZI, 0.55], [W_LU, 1], [F04.to + 2, 0.8], [SND.beads - 1, 0]]) + ky(f, [[W_SHI + 6, 0], [W_SHI + 12, 0.45], [F08.to, 0.3], [F08.to + 8, 0]]);
  if (g > 0.01 && f >= F04.from) { const s = Math.sin(2 * PI * 4.6 * (f / FPS)); c = C.nudge(c, { up: 0.006 * g * s, pitch: 0.55 * g * s, roll: 0.35 * g * Math.sin(2 * PI * 2.3 * (f / FPS)) }); }
  // the fear: a hard tremble from the leap through the fight, easing as she peeks
  const trem = ky(f, [[LEAP, 0], [LEAP + 2, 1.4], [DUCKED, 2.4], [B.clash[1], 2.0], [RISE1, 1.0], [F07.to, 0.5], [STAND1, 0]]);
  if (trem > 0.01) c = C.handheld(c, f, { mood: "scared", amp: trem, seed: 7 });
  // 嘘: she flinches back; the leap: a recoil; 是: the camera nods
  const flinch = ky(f, [[SND.beads - 1, 0], [SND.beads + 2, 1], [SND.beads + 16, 0.25], [RUSTLE, 0]]) + ky(f, [[LEAP, 0], [LEAP + 3, 1.2], [DUCK_W, 0.8]]);
  const nod = ky(f, [[W_SHI - 1, 0], [W_SHI + 3, 1], [W_SHI + 8, 0], [W_SHI + 12, 0.5], [W_SHI + 17, 0]]);
  c = C.nudge(c, { fwd: -0.05 * flinch, pitch: 1.0 * flinch - 3.2 * nod });
  c = shake(c, f, SND.beads, 5, 2, 6);
  c = shake(c, f, LEAP + 1, 8, 4, 8);
  for (const k of CLASH_HITS) c = shake(c, f, k, 7, 3, 6);
  c = C.punchIn(c, f, LEAP + 2, { k: 0.9, len: 4, off: DUCK_W });
  c = C.punchIn(c, f, W_ZHUZI, { k: 0.86, len: 8, off: SND.beads + 4 });
  return c;
}
/** her camera on frame f: { camera, post, smear, dir, cover } */
function camAt(f: number): { camera: CamPose; post?: Pose["post"]; smear: number; dir: 1 | -1; cover: number } {
  // the landing of E's whip (5 frames, arriving from the left), the whip left and down behind the rock
  const W0 = C.whip(rawCam(S.from + 5), f, S.from - 5, { dir: 1, out: 5, in: 5 });
  if (W0.post) return { camera: W0.cam, post: W0.post, smear: W0.smear, dir: 1, cover: 0 };
  const W1 = C.whip(rawCam(DUCK_W), f, DUCK_W, { dir: -1, to: rawCam(DUCKED), out: 4, in: 5, deg: 28 });
  if (W1.post) return { camera: W1.cam, post: W1.post, smear: W1.smear, dir: -1, cover: 0 };
  const H = C.handCover(rawCam(f), f, COVER_ON);
  return { camera: H.cam, smear: 0, dir: 1, cover: H.cover };
}

// --------------------------------------------------------------------------------------------- his face, his acting
const HOODK: [number, EmpState][] = [[S.from, "plain"], [SND.cloth, "hood"], [SND.beads, "hoodBlush1"], [LEAP, "hood"], [UP1, "hoodBlush1"]];
const EXPR: [number, Expr][] = [
  [S.from, "stern"], [SND.cloth + 3, "smug"], [F01.from - 2, "cool"], [W_BUXU, "stern"], [F02.from + 8, "cool"], [W_SIGE + 6, "smug"],
  [F03.from, "cool"], [F04.from, "neutral"], [W_ZHUZI, "focus"], [W_LU, "shock"], [SND.beads, "huff"], [F05.to + 6, "stern"],
  [RUSTLE + 4, "nervous"], [LEAP, "shock"], [DUCKED + 1, "nervous"], [NOTICE, "shock"], [UP1, "stern"], [F07.from - 4, "cool"], [W_XIA, "stern"],
  [B.glance, "focus"], [W8_MEIYOU - 2, "smug"], [F08.to - 4, "stern"], [F09.from - 2, "huff"], [W_SHAN, "stern"],
];
/** changes that hide under a blink (the swaps ride their own blinks through swaps()) */
const BLINKS = [...swaps(HOODK), (F02.from + 8) / FPS, NOTICE / FPS, B.glance / FPS, (F08.to - 5) / FPS];
const GAZE: [number, number][] = [
  [S.from, 0], [W_CHUQU, -0.5], [W_BUXU - 2, 0], [F02.from + 6, 0], [W_SIGE, -0.5], [W_SIGE + 14, 0.5], [F03.from, 0],
  [RUSTLE + 3, 0.5], [LEAP, 1], [NOTICE, 0], [UP1, -0.5], [F07.from - 2, -1], [W_XIA + 2, -0.5], [B.glance, 0],
  [W8_MEIYOU + 2, -0.5], [F08.to - 5, 0],
];
const DI = ["F01", "F03", "F05", "F07", "F09"];
const STRESS: Record<string, number[]> = { F01: [0, 2, 6], F03: [0], F05: [0], F07: [2, 3], F09: [0, 2] };
const talk = (f: number) => { for (const id of DI) { const s = speak(quote("di", id), f, 1, STRESS[id]); if (s.mouth || s.head) return s; } return {} as ReturnType<typeof speak>; };

/** HIM, every frame (after the camera is set) */
function emperor(w: World, f: number, lens: THREE.Vector3): void {
  const r = w.actor(emperorAt(f, HOODK)), t = f / FPS, T = talk(f);
  const p0 = hisAt(f), sink = sinkAt(f), at0 = V(p0.x, -sink, p0.z), wk = f >= WALK0 ? hisWalk(f) : null;
  // facing: toward her lens; a 23 deg turn toward the reeds in the fright; F07 turned 20 deg away (proud)
  const toHer = yawTo(p0, lens);
  const away = ky(f, [[RUSTLE, 0], [LEAP + 3, 0.4], [NOTICE, 0.4], [UP1, 0], [F07.from - 6, 0], [F07.from + 2, -0.35], [W_XIA + 4, -0.35], [B.glance, -0.08], [B.glance + 6, 0]]);
  const facing = wk && wk.moving ? lerpA(wk.facing, toHer, 0.5) : toHer + away;
  const hide = f >= SND.beads + 1 ? ["hoodBeads"] : [];
  // the head: tilts and chin across the lines; the accents on the stressed words
  const tilt = ky(f, [[S.from, 0], [F01.from, -4], [W_CHUQU + 8, 3], [W_BUXU, -2], [F02.from + 10, 5], [F02.to, 5], [F03.from, -3], [F04.from, 0],
    [W_ZHUZI + 4, 7], [W_LU, 0], [SND.beads, -4], [RUSTLE - 2, -2], [RUSTLE + 4, 0], [LEAP + 2, 4], [UP1, 0], [F07.from, -7], [W_XIA + 6, -5], [B.glance, 3], [F08.to, 0], [F09.from, -3]]);
  const chin = ky(f, [[F01.from - 4, 0], [F01.from + 4, -0.06], [W_BUXU + 10, -0.03], [F02.from, 0], [F03.from - 2, 0], [F03.from + 3, 0.07], [F04.from + 2, 0.03],
    [F04.from + 12, 0], [F07.from - 4, 0], [F07.from + 4, 0.07], [F07.to + 2, 0.05], [B.glance + 4, 0], [F09.from, -0.04]]);
  const fright = f >= LEAP && f < UP0 ? { dx: 0.012 * Math.sin(2 * PI * 9 * t) } : undefined;
  const base: St = {
    expr: at(f, EXPR), gaze: at(f, GAZE), blink: Math.max(lid(t, 1, BLINKS), T.blink ?? 0), mouth: T.mouth, hide, visible: true,
    head: heads(T.head, { tilt, dy: chin }, fright, headPop(f, SND.cloth, [1.08, 1.04, 1.01]), accent("squash", f, SND.cloth, { amp: 1.1 }),
      accent("nod", f, W_CHUQU), headPop(f, W_GOU), accent("jolt", f, SND.beads), accent("jolt", f, LEAP + 1, { amp: 1.2 }),
      accent("jolt", f, NOTICE, { amp: 1.1 }), accent("squash", f, UP0 + 2), accent("pop", f, W_ZHEN), accent("shake", f, W_MEIYOU, { amp: 0.6 }), accent("nod", f, W8_MEIYOU, { amp: 0.7 }), accent("nod", f, W_NADUAN), headPop(f, W_SHAN)),
  };
  const shh = f >= SND.beads - 2 && f <= F05.to + 8;
  const pose: RigState["pose"] = wk && wk.moving ? wk.pose : shh ? { kind: "shh", arm: 1, t } : { kind: "idle", t: t + 0.6 };
  r.set({ ...base, at: at0, facing, pose, turn: 0 });
  w.update();

  // THE HANDS (arm 0 = his right, screen left; arm 1 = his left, screen right), blended from where they hang
  const hd = r.headWorld(), right = V(-Math.cos(facing), 0, Math.sin(facing)), fwd = V(Math.sin(facing), 0, Math.cos(facing));
  const fromHead = (x: number, y: number, z: number) => hd.clone().addScaledVector(right, x).addScaledVector(fwd, z).add(V(0, y, 0));
  let h0: THREE.Vector3 | null = null, h1: THREE.Vector3 | null = null, front0 = false;
  const blend = (arm: 0 | 1, target: THREE.Vector3, k: number) => r.handWorld(arm).lerp(target, easeInOutCubic(clamp01(k)));
  // the hood: both hands up behind the head, the pull forward over the crown, down
  const kh = ky(f, [[HOOD_UP - 4, 0], [HOOD_UP + 4, 1], [HOOD_DN - 3, 1], [HOOD_DN + 5, 0]]);
  if (kh > 0.01) {
    const z = ky(f, [[HOOD_UP + 2, -0.12], [SND.cloth, 0.02], [HOOD_DN, 0.1]]), y = ky(f, [[HOOD_UP + 2, 0.06], [SND.cloth, 0.14], [HOOD_DN, 0.04]]);
    h0 = blend(0, fromHead(0.47, y, z), kh); h1 = blend(1, fromHead(-0.47, y, z), kh);
  }
  // 出去走走: a thumb back down the path; 不许声张: a palm-down pat, twice; 够了: a flick out
  const kt = ky(f, [[W_CHUQU - 5, 0], [W_CHUQU + 3, 1], [W_CHUQU + 18, 1], [W_BUXU - 4, 0]]);
  if (kt > 0.01) h0 = blend(0, relS(at0, facing, -0.3, 0.98, -0.02).add(hover(f)), kt);
  const kp = ky(f, [[W_BUXU - 4, 0], [W_BUXU + 2, 1], [F01.to + 6, 1], [F01.to + 14, 0]]);
  if (kp > 0.01) { const pat = 0.04 * Math.abs(Math.sin(PI * clamp01((f - W_BUXU) / 9))) + 0.04 * Math.abs(Math.sin(PI * clamp01((f - W_BUXU - 12) / 9))); h0 = blend(0, relS(at0, facing, -0.13, 0.8 - pat, 0.3), kp); }
  const kf = ky(f, [[W_GOU - 4, 0], [W_GOU + 1, 1], [W_GOU + 10, 1], [W_GOU + 20, 0]]);
  if (kf > 0.01) h0 = blend(0, relS(at0, facing, -0.36, 0.66 + 0.04 * Math.sin(PI * clamp01((f - W_GOU) / 6)), 0.16), kf);
  // 露出来了: the right hand creeps up toward the brow; 嘘: it slaps onto the hood at his temple and tugs the hood forward
  // and down over the beads (the rig's short arms cannot reach the middle of the brow without passing through the head)
  const kr = ky(f, [[W_LU + 4, 0], [F04.to, 0.35], [SND.beads - 3, 1], [SND.beads + 6, 1], [SND.beads + 13, 0]]);
  if (kr > 0.01) {
    const push = ky(f, [[SND.beads - 1, 0], [SND.beads + 4, 1]]);
    h0 = blend(0, fromHead(0.3, lerp(0.07, 0.01, push), lerp(0.11, 0.17, push)), kr); front0 = true;
  }
  // the robe: both hands at its front, two tugs down (they arrive there straight from the hilt and the ward-off)
  const robe = (arm: 0 | 1, tug: number) => relS(at0, facing, arm ? 0.14 : -0.14, 0.69 - 0.06 * tug, 0.28);
  const ko = ky(f, [[UP0, 0], [UP0 + 1, 1], [TUG[1] + 6, 1], [Math.min(TUG[1] + 13, W_XIA - 6), 0]]);
  if (ko > 0.01) {
    const tug = ky(f, [[TUG[0], 0], [TUG[0] + 3, 1], [TUG[0] + 7, 0], [TUG[1], 0], [TUG[1] + 3, 1], [TUG[1] + 7, 0]]);
    h0 = blend(0, robe(0, tug), ko); h1 = blend(1, robe(1, tug), ko);
  }
  // 吓到: a brush-off flick of the right hand (hmph, nothing frightens HIM)
  const kx = ky(f, [[W_XIA - 5, 0], [W_XIA + 1, 1], [W_XIA + 9, 1], [W_XIA + 18, 0]]);
  if (kx > 0.01) h0 = blend(0, relS(at0, facing, -0.38, 0.7 + 0.05 * Math.sin(PI * clamp01((f - W_XIA) / 6)), 0.16), kx);
  // the leap: the left hand flies to the hilt and stays there through the fright; up and off it to the robe
  const rel1 = easeInOutCubic(clamp01((f - UP0) / (UP1 - UP0)));
  const kg = f < UP1 ? ky(f, [[LEAP + 1, 0], [LEAP + 6, 1]]) : 0;
  if (kg > 0.01) { const g = hiltGrip(r); if (g) h1 = blend(1, g.clone().add(V(0, 0.035 + 0.025 * smooth((f - UP0 + 1) / 2) + 0.08 * Math.sin(PI * rel1), 0.05 * rel1)).lerp(robe(1, 0), rel1), kg); }
  // the crouch: the right hand up, palm out, warding them off; down to the robe
  const kw = f < UP1 ? ky(f, [[LEAP + 2, 0], [LEAP + 8, 1]]) : 0;
  if (kw > 0.01) h0 = blend(0, relS(at0, facing, -0.29, 1.0, 0.2).add(hover(f, 3)).lerp(robe(0, 0), rel1), kw);
  // the stride at her: the left hand held forward, clear of the hilt
  const ks = ky(f, [[WALK0 - 4, 0], [WALK0 + 3, 1]]);
  if (ks > 0.01) h1 = blend(1, relS(hisAt(f), facing, 0.21, 0.68, 0.26), ks);
  // 删了: the left palm comes up at her lens (the overlay palm takes over)
  const kc = ky(f, [[REACH0, 0], [COVER_ON + 3, 1]]);
  if (kc > 0.01) h1 = blend(1, relS(hisAt(f), facing, 0.12, 1.12, 0.62).lerp(lens, 0.15), kc);
  if (h0 || h1) { r.set({ hands: [h0, h1], armFront: [front0 ? true : undefined, undefined] }); w.update(); }
}

// ---------------------------------------------------------------------------------------------------- the guards
function guards(w: World, f: number, lens: THREE.Vector3): void {
  GUARDS.forEach((g, i) => {
    const r = w.actor(GUARD, g.key), t = f / FPS, go = LEAP + 3 + stagger(i + 1, 4, 5);
    const leg = walkAlong([g.a, g.b], 3.0, (f - go) / FPS, { endFacing: PI - 0.25 + 0.15 * i });
    const still = g.front ? PI + (i ? 0.12 : -0.12) : yawTo(g.a, lens) + (g.a.x < NX ? -0.22 : 0.22);
    const moving = f >= go && leg.moving, back = g.front || f >= go;
    // the fight (off-screen but for their backs): squared up to the bandits, a jab of the halberd on every other hit
    const foe = BANDITS[i % BANDITS.length].b, fk = moving ? 0 : ky(f, [[LAND, 0], [LAND + 8, 1], [B.clash[1], 1], [B.clash[1] + 14, 0]]);
    const jab = fk * CLASH_HITS.filter((_, j) => j % 2 === i % 2).reduce((m, k) => Math.max(m, ky(f, [[k - 5, 0], [k - 1, 1], [k + 7, 0]])), 0);
    const facing = f < go ? still : lerpA(leg.facing, yawTo(leg.at, foe), fk);
    const at0 = leg.at.clone().addScaledVector(V(Math.sin(facing), 0, Math.cos(facing)), 0.14 * jab);
    // the flank pair glance at the lens now and then; on the leap everyone snaps to the reeds
    r.set({
      at: at0, facing, pose: moving ? leg.pose : { kind: "idle", t: t + 0.37 * i }, turn: back ? 1 : 0, expr: f < LEAP ? (g.front ? "deadpan" : "stern") : "focus",
      gaze: back ? 0 : [0, 0.5, 0, -0.5][Math.floor(t * 0.7 + i) % 4], blink: lid(t, 10 + i), visible: true,
    });
    w.update();
    r.set({ hands: [null, jab > 0.01 ? rel(at0, facing, 0.23 - 0.05 * jab, 0.62 + 0.1 * jab, 0.04 + 0.22 * jab) : halberdHand(at0, facing, 1, moving ? 0.66 : 0.62, moving ? 0.25 : 0.23)] });
    w.update();
  });
}

// ---------------------------------------------------------------------------------------------------- the bandits
function bandits(w: World, f: number): void {
  // after the fight: a bandit's knife left lying on the flags (the guards did their job)
  if (f >= DUCK_W + 5) w.prop("knife", "dropped").put(P(0.45, -1.3).setY(0.015), { rot: [PI / 2, 2.2, 0] });
  if (f < LEAP - 3 || f >= DUCK_W + 5) return;                    // the fight itself stays off-screen
  BANDITS.forEach((b, i) => {
    const r = w.actor(BANDIT, b.key), t = f / FPS, on = LEAP + [0, 2, 1][i];
    const u = clamp01((f - on) / (LAND - LEAP));
    const crouch = b.a.clone().add(V(0, -0.38, 0));
    const p = f < on ? crouch : u < 1 ? hopArc(crouch, b.b, smooth(u), 0.9) : b.b.clone().addScaledVector(V(-0.3, 0, 0.9).normalize(), 0.2 * smooth((f - on - (LAND - LEAP)) / 8));
    const facing = yawTo(b.b, EMP);
    r.set({ at: p, facing, pose: { kind: "idle", t: t + i }, turn: 0, expr: "huff", gaze: 0, blink: lid(t, 20 + i), visible: true });
    w.update();
    const up = smooth((f - on + 2) / 6);
    const hand = rel(V(p.x, Math.max(0, p.y), p.z), facing, -0.37, lerp(0.75, 1.3, up), 0.06);
    r.set({ hands: [hand, null] });
    w.update();
    w.prop("knife", b.key).put(r.handWorld(0), { grip: "hilt", rot: [-0.3, facing, 0.35] });
  });
}

const phase = (f: number) =>
  f < F02.from ? "hood" : f < F04.from ? "guards" : f < RUSTLE ? "beads" : f < DUCK_W ? "bandits" : f < RISE0 ? "duck (clash off-screen)" : f < F08.from ? "peek, 朕没有吓到" : f < WALK0 ? "agree" : "删了, the palm";

export const SEG: Segment = {
  id: "F", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w: World, f: number): Pose {
    w.setPlace("night");
    const K = camAt(f);
    w.setCamera(K.camera);
    const lens = v3(K.camera.pos);
    emperor(w, f, lens);
    guards(w, f, lens);
    bandits(w, f);
    const ov: React.ReactNode[] = [];
    if (K.smear > 0) ov.push(C.whipSmear(K.smear, K.dir));
    if (K.cover > 0) ov.push(C.palm(K.cover));
    // after the palm lands: his palm's dark warm brown to the last frame (segment G opens from it)
    if (f >= SND.palm) ov.push(h("div", { key: "palmHold", style: { position: "absolute", inset: 0, background: "#2a1d19" } }));
    return { camera: K.camera, post: K.post, overlays: ov.length ? frag(...ov) : undefined, slate: `F ${phase(f)}` };
  },
};
