// SCENE E · Monday dusk, a Verona street (婚礼后一小时). THE TURN.
// v5 (the owner on v4: "Add a sequence to them fighting and someone lying on the ground with some labels perhaps to give
// more context" and "the rapier can be Romeo dropping it after he defeats the other person"). The scene now OPENS ON THE
// DUEL, in the 5.8 silent seconds before her first word: she has run after him and stops well back. Romeo with his back
// to us, Tybalt (Juliet's cousin: his tab says so) facing him. Three clashes, Tybalt's lunge beaten up and away, Romeo's
// thrust; Tybalt reels back, his rapier falls, he drops across the street behind Romeo; Romeo straightens and his own
// rapier slips from his hand. She walks up behind him. Then the scene as it was: she says his name; he turns ("O, I am
// fortune's fool!") under the one slow push and runs out of frame into the alley; her whisper over the street (he just
// killed Juliet's cousin), then the proclamation while nobody speaks. No blood, and nothing goes through a body: the
// point stops at his doublet. No screen effects in this scene; the music has dropped out.
// CAMERA PLAN (one take; still is the default)
//   1  the duel     from well back, both in frame, held; one jolt on the thrust (her flinch)       (the fight)
//   2  after it     she walks up to his back (the "back" view), slowly                            (it is over: she dares)
//   3  E01          his back, the rapier on the stones, the man lying behind him; still           (what happened)
//   4  E02          he turns; ONE SLOW PUSH (fov 46 -> 37)                                         (his face is the scene)
//   5  E02          he runs out of frame to the left; the lens stays                               (he leaves)
//   6  E03          her whisper on the street (the lean); hold for the card                        (the fact)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { V, VERBS, standing, yawTo, walkAlong } from "./common";
import { ROMEO, TYBALT } from "../people";
import { whisperLean } from "../whisper";
import { SideTab } from "../hud/index";
import { h } from "./h";
import { P, wv, spot, camAt, ck, faceAt, talk, wordAt, startOf, endOf, ky, accent, soft, rel, headBox, carry, lieQ, REACT } from "./kit";
import { swordPose, swordRest, swordMix, blend, GRIP_TO_TIP, type PtKey } from "./duel";
import { reach, hit, talkHead } from "./gest";

const S = seg("E"), T = (n: number) => S.from + n;
const BACK = spot("street", "romeoBack"), EXIT = spot("street", "exit");
/** the lens tips down a little from the stock "back" view: his head a quarter down, the stones and what lies on them in frame */
const E_LOOK = wv("street", [0, 0.82, -1.5]);

// ------------------------------------------------------------------------------------------------ the duel's marks
/** THE BEATS (frames after the scene's first; the sound's cues are made from the same numbers, scripts/romeo/sound).
 *  They stand on guard for the first two thirds of a second: his name tab is read before the blades meet */
export const DUEL = {
  /** the three clashes, and the thrust that lands */ c1: 22, c2: 40, c3: 56, hit: 68,
  /** Tybalt's rapier leaves his hand, he reels back, falls, is down */ drop: 71, reel: 72, fall: 86, down: 102,
  /** Romeo is upright again; his rapier leaves his hand and lies still */ up: 98, slip: 108, clang: 118,
  /** she walks up to his back */ step: 120, near: 158,
} as const;
const D = DUEL;
/** a frame of the fight, counted from the end of the guard (the fight's keys were written from 0) */
const K = (n: number) => T(n + 12);
/** where they fight: Romeo ends on his mark; Tybalt up the street to the right of him, so that both sword hands are in
 *  the gap between them (Romeo's right hand, in a back view, and Tybalt's right hand, in a front view) */
const RO0 = BACK.at.clone(), TY0 = P("street", 0.85, 0, -2.85);
const U = TY0.clone().sub(RO0).setY(0).normalize();
const FACE_RO = yawTo(RO0, TY0), FACE_TY = yawTo(TY0, RO0);
/** Tybalt's feet where he falls, the way his head lies (across the street, toward the alley: the lens sees a lying
 *  figure best from the side), how far his head end is raised and his whole figure lifted so that he lies ON the stones */
const FELL = P("street", 0.62, 0, -3.45), HEAD_DIR = V(-1, 0, -0.08).normalize(), LIFT = 0.17, RAISE = 0.05;
const Q_DOWN = lieQ(HEAD_DIR, LIFT).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), -FACE_TY));
/** where the two rapiers lie afterwards (props/index.ts: the origin under the cup, the blade toward (cos yaw, 0, -sin yaw)):
 *  each under the hand that let it go, along the line they fought on, point toward the other man. The two right hands
 *  were on opposite sides of that line, so the rapiers lie side by side a foot apart and never across one another */
const REST_RO = swordRest(P("street", 0.25, 0, -1.6), 1.053), REST_TY = swordRest(P("street", 0.55, 0, -2.65), -2.224);
/** frames his rapier takes to fall from his raised hand to the stones */
export const TY_FALL = 12;
const easeIn = (k: number) => { const x = Math.min(1, Math.max(0, k)); return x * x; };
const smooth = (k: number) => { const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x); };

// ---- where each one stands: how far he has come up the line toward the other (m), frame by frame. Tybalt opens by
// coming on; Romeo gives a little ground
const sRo = (g: number) => ky(g, [[T(0), -0.02], [K(6), -0.1], [K(12), -0.2], [K(20), -0.18], [K(27), 0.04], [K(34), -0.06], [K(40), -0.06], [K(46), -0.1], [K(50), -0.08], [T(D.hit), 0.16], [T(D.hit + 8), 0.16], [T(D.up), 0]]);
const sTy = (g: number) => ky(g, [[T(0), -0.14], [T(5), -0.14], [K(4), 0], [K(10), 0.2], [K(16), 0.1], [K(22), 0.08], [K(28), -0.1], [K(34), -0.04], [K(38), -0.04], [K(44), 0.18], [K(50), 0.12], [T(D.hit), 0.08]]);
const atRo = (g: number) => RO0.clone().addScaledVector(U, sRo(g));
const TY_HIT = TY0.clone().addScaledVector(U, -sTy(T(D.hit)));
/** Tybalt: up and down the line; from the thrust he reels back to where he falls */
const atTy = (g: number) => (g <= T(D.reel) ? TY0.clone().addScaledVector(U, -sTy(g)) : TY_HIT.clone().lerp(FELL, smooth((g - T(D.reel)) / (D.fall + 2 - D.reel))));
/** Romeo's facing: at Tybalt; as Tybalt goes down he turns to where the man lies (his mark's own facing) */
const faceRo = (g: number) => ky(g, [[T(D.fall + 4), FACE_RO], [T(D.fall + 26), BACK.facing]]);
// ---- points in each one's own frame (x to HIS left, y up from his feet, z forward), as points of the frame
const ro = (x: number, y: number, z: number) => (g: number) => rel(atRo(g), faceRo(g), x, y, z);
const ty = (x: number, y: number, z: number) => (g: number) => rel(atTy(g), FACE_TY, x, y, z);
/** where a hanging hand is (measured on the solved figures), so that a hand let go does not jump */
const RO_HANG = ro(-0.163, 0.594, 0.03), RO_HANG_L = ro(0.163, 0.594, 0.03), TY_HANG = ty(-0.168, 0.611, 0.031);
/** the point of Tybalt's doublet that faces Romeo; from the thrust on, where it was when the point landed */
const chest = (g: number) => atTy(Math.min(g, T(D.hit))).addScaledVector(U, -0.19).add(V(0, 0.88, 0));
/** Romeo's hand for the thrust: on the line from his shoulder to that point, a blade's length (and 12 mm) short of it */
const thrust = (g: number) => { const c = chest(g), sh = ro(-0.108, 0.955, 0.12)(g); return c.clone().addScaledVector(c.clone().sub(sh).normalize(), -(GRIP_TO_TIP + 0.012)); };

// ---- the sword hands (the right): guard, attack, parry
const RO_GUARD = ro(-0.14, 0.86, 0.3), TY_GUARD = ty(-0.15, 0.9, 0.32);
const HAND_RO: PtKey[] = [
  [T(0), RO_GUARD], [K(6), RO_GUARD], [T(D.c1), ro(-0.03, 0.97, 0.26)], [K(16), RO_GUARD], [K(21), ro(-0.14, 0.84, 0.24)], [T(D.c2 - 1), ro(-0.1, 0.9, 0.4)],
  [K(34), RO_GUARD], [K(40), RO_GUARD], [T(D.c3), ro(-0.08, 0.98, 0.3)], [K(50), ro(-0.15, 0.92, 0.2)], [T(D.hit), thrust], [T(D.hit + 6), thrust], [T(D.up), RO_HANG],
];
/** his lunge; then his sword arm thrown up by Romeo's beat (the hand beside his head, the blade up over it) */
const TY_LUNGE = ty(-0.11, 0.96, 0.45), TY_UP = ty(-0.32, 1.25, 0.22);
/** on the way up his hand goes out to his right first: straight from the lunge to TY_UP his blade passed 2.4 cm inside
 *  his own head for two frames (he leans into the lunge; clearance f2958-2959) */
const TY_OUT = ty(-0.3, 1.1, 0.38);
const HAND_TY: PtKey[] = [
  [T(0), TY_GUARD], [K(4), TY_GUARD], [T(D.c1), ty(-0.11, 0.98, 0.44)], [K(16), TY_GUARD], [K(22), TY_GUARD], [T(D.c2), ty(-0.2, 0.78, 0.31)],
  [K(34), TY_GUARD], [K(38), TY_GUARD], [T(D.c3), TY_LUNGE], [T(D.c3 + 3), TY_OUT], [T(D.c3 + 6), TY_UP], [T(D.drop), TY_UP], [T(D.drop + 9), ty(-0.09, 0.92, 0.17)], [T(D.fall), TY_HANG],
];
// ---- the other hands: Romeo's up and back (the fencer's balance), Tybalt's at his hip; it goes to his chest when he is hit
const OFF_RO: PtKey[] = [[T(0), ro(0.31, 0.93, -0.1)], [K(50), ro(0.31, 0.93, -0.1)], [T(D.hit), ro(0.33, 0.8, -0.2)], [T(D.hit + 6), ro(0.33, 0.8, -0.2)], [T(D.up), RO_HANG_L]];
const OFF_TY: PtKey[] = [[T(0), ty(0.21, 0.68, -0.08)], [T(D.hit), ty(0.21, 0.68, -0.08)], [T(D.hit + 5), ty(0.05, 0.9, 0.17)], [T(D.fall), ty(0.05, 0.86, 0.17)]];
// ---- what each blade aims at. On guard: over the other's head (a blade that points up reads on screen; one that
// points along the line they fight on points along the lens and is a dot), and it is never still: the point feels for
// the other blade in a small circle. At a clash BOTH aim at the same point, and there they meet, ABOVE or BELOW the
// two hands (seen from her lens the two blades then draw an X; a meeting beside a hand draws one line): the first high
// between their heads, the second low, the third high again on Tybalt's lunge. Then Romeo's beat throws Tybalt's sword
// arm up: his hand beside his head, his blade up over it and away (a blade up and to his right went behind Romeo's
// hat; one straight up would stand across Romeo's level blade), his chest open. No blade comes nearer than 0.4 m to
// the other man's head: before the thrust Romeo's point is already down on the doublet
const C1 = ro(0.08, 1.4, 0.68), C2 = ro(-0.06, 0.62, 0.95), C3 = ro(0, 1.38, 0.82);
const OUT = ty(0.18, 2.11, 0.12);
const feel = (g: number, ph: number) => V(0.1 * Math.sin(g * 0.42 + ph), 0.08 * Math.cos(g * 0.42 + ph), 0);
const aimAtTy = (g: number) => chest(g).add(V(0, 0.64, 0)).add(feel(g, 0)), aimAtRo = (g: number) => ro(0, 1.5, 0.1)(g).add(feel(g, 2.1)), aimLow = (g: number) => chest(g).add(V(0, 0.08, 0));
/** Romeo's blade when his arm hangs: forward and down, its point a hand above the stones */
const RO_DOWN = ro(-0.327, 0.086, 0.62);
const AIM_RO: PtKey[] = [
  [T(0), aimAtTy], [K(6), aimAtTy], [T(D.c1), C1], [K(16), aimAtTy], [K(22), aimAtTy], [T(D.c2), C2], [K(34), aimAtTy], [K(40), aimAtTy], [T(D.c3), C3],
  [K(50), aimLow], [T(D.hit), chest], [T(D.hit + 6), chest], [T(D.up), RO_DOWN],
];
const AIM_TY: PtKey[] = [[T(0), aimAtRo], [K(4), aimAtRo], [T(D.c1), C1], [K(16), aimAtRo], [K(22), aimAtRo], [T(D.c2), C2], [K(34), aimAtRo], [K(38), aimAtRo], [T(D.c3), C3], [T(D.c3 + 6), OUT], [T(D.drop), OUT]];

export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("street");
    w.set.param("light", "dusk");
    const e01 = startOf("E01"), e02 = startOf("E02"), tFool = wordAt("E02", "fool");
    // ---------------------------------------------------------------- the camera: back for the duel, then up to his back; the one slow push
    const c0 = { ...camAt("street", "back", 0), look: E_LOOK };
    const cF = ck("street", 0, [0.5, 1.5, 2.8], [0.3, 0.85, -2.0], 46);
    let camera = povCam(f, [
      { ...cF, f: S.from },
      { ...cF, f: T(D.step) },
      { ...c0, f: T(D.near) },
      { ...c0, f: e02 + 2 },
      { ...c0, f: endOf("E02") + 4, fov: 37 },
      { ...c0, f: S.to, fov: 37 },
    ], { mood: [[S.from, "scared"], [T(D.down + 6), "calm"]], amp: 0.3, walk: [[T(D.step), 0], [T(D.step + 6), 0.7], [T(D.near - 8), 0.7], [T(D.near), 0]] });
    camera = VERBS.kick(camera, f, T(D.hit), 0.03);
    camera = whisperLean(f, camera);
    w.setCamera(camera);

    // ---------------------------------------------------------------- Romeo: the fencer; then his back; he turns; he runs
    const r = w.actor(ROMEO);
    const toLens = yawTo(BACK.at, c0.pos as number[]);
    const fighting = f < T(D.up), turnK = ky(f, [[endOf("E01") + REACT, 0], [endOf("E01") + REACT + 12, 1]]);
    const runFrom = endOf("E02") - 4;
    const leg = walkAlong([BACK.at, BACK.at.clone().add(new THREE.Vector3(-0.15, 0, -0.65)), EXIT.at], 3.6, (f - runFrom) / 30, { startFacing: toLens, easeOut: 0 });      // (he runs out of sight: no stop)
    const running = f >= runFrom;
    const facing = running ? leg.facing : THREE.MathUtils.lerp(faceRo(f), toLens + 0.25, turnK);
    // the fencer's stance is the walk's pose held still (phase 0.05: both feet down, the right one forward); a thrust
    // is a longer stance further up the line, so the back foot stays where it is
    const strideRo = ky(f, [[T(0), 0.15], [K(20), 0.15], [K(27), 0.22], [K(34), 0.15], [K(50), 0.15], [T(D.hit), 0.27], [T(D.hit + 8), 0.27], [T(D.up), 0.05]]);
    const leanRo = ky(f, [[T(0), 2], [K(6), 2], [K(11), -5], [K(18), 2], [K(22), 2], [K(27), 9], [K(34), 2], [K(40), 0], [T(D.c3), 5], [K(50), -2], [T(D.hit), 13], [T(D.hit + 8), 13], [T(D.up), 0]]);
    // (v5: hands and bodies move with the words) "O, I am fortune's FOOL!": he turns his face and both open hands up
    // to the sky, and they fall on "fool"; then he runs
    const skyK = ky(f, [[e02 - 4, 0], [e02 + 8, 1], [Math.min(tFool + 8, runFrom - 6), 1], [runFrom, 0]]);
    const lift = ky(f, [[e02 + 4, 0], [tFool - 2, 1]]), fall = hit(f, tFool, 3, 14);
    // (his arm is 0.38 m: the hands stop beside his head, a hand's width clear of it, not above it)
    const sky = (side: number) => reach(rel(BACK.at, facing, side * 0.36, 1.1 + 0.15 * lift - 0.09 * fall, 0.18), skyK);
    r.set({
      ...standing(running ? leg.at : fighting ? atRo(f) : BACK.at, facing, f, 1),
      pose: running && leg.moving ? leg.pose : fighting ? ({ kind: "walk", phase: 0.05, stride: strideRo, amount: 0, ease: ky(f, [[T(D.hit + 8), 1], [T(D.up), 0]]) } as never) : { kind: "idle", t: f / 30 },
      hands: fighting ? [blend(f, HAND_RO), blend(f, OFF_RO)] : skyK > 0 ? [sky(-1), sky(1)] : undefined,
      lean: fighting ? { pitch: leanRo } : { pitch: -5 * skyK + 8 * fall },
      expr: faceAt(f, [[0, "hollow"], [tFool - 3, "pained"], [endOf("E02") + 2, "hollow"]]),
      ...talk("ro", f, 1),
      // his head hangs; it lifts when he hears his name (over nine frames: it lifted in one, seen from behind)
      lookDown: soft(f, (g) => (g < T(D.up) ? 0 : g < e01 + 10 ? 14 : g >= e02 + 2 && g < tFool + 4 ? -10 : 4), 4),
      head: talkHead("ro", f, 1, accent("jolt", f, endOf("E01") + REACT)),
      visible: !(running && leg.arrived),
      turn: f < endOf("E01") + REACT ? 1 : undefined,
      hide: ["letter"],
    });

    // ---------------------------------------------------------------- Tybalt: he fights, he is hit, he reels back, he lies there
    const t = w.actor(TYBALT);
    const lieK = easeIn((f - T(D.fall)) / (D.down - D.fall)), lying = f >= T(D.down);
    const strideTy = ky(f, [[T(0), 0.15], [K(4), 0.15], [K(10), 0.24], [K(16), 0.15], [K(38), 0.15], [K(44), 0.26], [K(52), 0.2], [T(D.hit), 0.18], [T(D.reel), 0.16]]);
    const leanTy = ky(f, [[T(0), 2], [K(4), 2], [K(10), 9], [K(16), 2], [K(26), 2], [K(28), -4], [K(34), 2], [K(38), 2], [K(44), 12], [K(52), 8], [T(D.hit), 5], [T(D.reel), -7], [T(D.fall), -9]]);
    // reeling back: steps backward, the feet planted (the walk's cycle run the other way)
    const back = TY_HIT.distanceTo(atTy(f)), phaseTy = f <= T(D.reel) ? 0.05 : ((((0.05 - (back * 0.6) / (2 * 0.16)) % 1) + 1) % 1);
    t.set({
      ...standing(atTy(f), FACE_TY, f, 5),
      pose: lying ? { kind: "hold", t: 0 } : ({ kind: "walk", phase: phaseTy, stride: strideTy, amount: f > T(D.reel) ? 0.5 : 0 } as never),
      hands: lying ? [ty(-0.37, 0.9, -0.12)(f), ty(0.05, 0.84, 0.16)(f)] : [f < T(D.fall) ? blend(f, HAND_TY) : blend(f, [[T(D.fall), TY_HANG], [T(D.down), ty(-0.37, 0.9, -0.12)]]), blend(f, OFF_TY)],
      lean: lying ? undefined : { pitch: leanTy },
      expr: faceAt(f, [[0, "glare"], [T(D.c1 - 4), "snarl"], [T(D.c1 + 6), "glare"], [T(D.c3 - 5), "snarl"], [T(D.hit), "struck"], [T(D.fall + 8), "down"]]),
      blink: f >= T(D.fall + 8) ? 1 : f >= T(D.hit) ? 0 : undefined, gaze: 0,
      head: accent("jolt", f, T(D.hit)) ?? undefined,
      lookDown: soft(f, (g) => (g >= T(D.hit + 3) && g < T(D.fall) ? 8 : 0), 3),
    });
    w.update();

    // ---------------------------------------------------------------- the rapiers: in their hands, then on the stones
    // Romeo's: through his hand toward what it aims at; when his arm hangs it slips from his fingers
    const roHeld = (g: number, hand: THREE.Vector3) => swordPose(hand, blend(g, AIM_RO).sub(hand));
    const roSword = f < T(D.slip) ? roHeld(f, r.handWorld(0)) : swordMix(roHeld(T(D.slip), RO_HANG(T(D.slip))), REST_RO, (f - T(D.slip)) / (D.clang - D.slip), (f - T(D.clang)) / 7);
    w.prop("sword").put(roSword.at, { rot: roSword.q });
    // Tybalt's: it leaves his raised hand when the point lands, and falls beside him as he reels
    const tyHeld = (g: number, hand: THREE.Vector3) => swordPose(hand, blend(g, AIM_TY).sub(hand));
    const tySword = f < T(D.drop) ? tyHeld(f, t.handWorld(0)) : swordMix(tyHeld(T(D.drop), blend(T(D.drop), HAND_TY)), REST_TY, (f - T(D.drop)) / TY_FALL, (f - T(D.drop + TY_FALL)) / 6);
    w.prop("sword", "tybalt").put(tySword.at, { rot: tySword.q });
    // ---------------------------------------------------------------- his fall: the solved figure is turned down about his feet
    if (lieK > 0) carry(w, t, new THREE.Quaternion().slerp(Q_DOWN, lieK), atTy(f), V(0, RAISE * lieK, 0), true);

    // ---------------------------------------------------------------- his name, while he still stands
    // (it flaps away as his sword arm goes up: the raised blade stands where the tab was)
    const tabFrom = T(2), tabHold = D.c3 - 1;
    const overlays = f >= tabFrom && f < tabFrom + tabHold ? h(SideTab, { f, from: tabFrom, box: headBox(w, t), who: "tybalt", hold: tabHold, above: true }) : undefined;
    return { camera, overlays };
  },
};
