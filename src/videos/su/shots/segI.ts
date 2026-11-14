// SEGMENT I, lines I56-I57: 四年后 · 金山寺, the end of the film (PLAN 8I + section 10, script_v1_table 9). WP5 / segI.
// Quiet, still, warm. Every frame from BEAT.I / capWord / lineId, every mark from layout/temple.ts (TEMPLE); the HUD
// (the timestamp 四年后 · 金山寺, the end names and their pictures, card 5, the dim, the REC look, her camera switching off
// at the end) is Film.tsx's.
// PLAN 11 (Jay, 2026-11-14) overrides the storyboard here: NO mic, NO hand of hers in the picture (she is only the
// camera; nothing of her is drawn in I, so segI does not call putHer); faces out of the top rows (y < 360: the REC dot,
// the timestamp, the battery).
//   land     pre       the ink wash (H -> I, the HUD's) lands on the hall: the portrait on the back wall, SU_OLD
//                      (very thin, white, the 东坡巾) standing before it, leaning on his stick (left hand, screen right of
//                      him), the timestamp 四年后 · 金山寺 big under REC top left (over the plain silk of the scroll's
//                      mounting: the painting stays clear). She walks in slowly (handheld "calm" with steps); he sees
//                      her, a small nod and his free hand lifts in welcome; his eyes come up to the upper third.
//   I56      talk      「您这辈子，最大的功业是什么？」 she has stepped up to him (a breath closer as she asks); he listens
//                      (smile, a listening tilt),
//                      and on 是什么 his eyes go to the side, toward the portrait behind him.
//   look     是什么 ->   he turns to the portrait (back three-quarters: his body turns first with his face to her, the back
//                      view switches in one frame, never a profile) and looks up at it for a long time; her lens tips up
//                      with him: the young painted Su big in the upper middle, the old one's back below it. She tips
//                      back down onto him as he turns back to her lens (his face is in the upper part
//                      of the frame from the moment it shows); then he smiles, the same smile as at the market (grin).
//   I57      ease      「黄州，惠州，儋州。」 warm, simple: a small nod on each name (the HUD names come in on the same
//                      syllables); her camera eases in a little: his face ABOVE y 650 (the names sit
//                      under his chin, section 10). The caption is hidden (the names are the caption).
//   end      pictures  a soft laugh of breath, the grin settles into the fond closed-eyed smile; the pictures fade up
//                      under the names, the picture dims (HUD); card 5 (low): his eyes open on her lens, a slow,
//                      small bow of farewell (eyes closing), his head comes up again and he looks at us, smiling, into
//                      the end (HUD). Her camera creeps on, barely breathing.
// THE STICK (props "stick": origin = its grip at the top, foot 0.90 m below): pinned to his LEFT hand at the grip
// height STICK_Y (its foot on the floor), at his left side a little forward, in his torso's frame (bodyYaw of the
// first solve); it lifts a few cm while he turns (an old man lifts his stick to turn).
// FACES NEVER IN PROFILE: turn (rig) is 0 while her lens is under 128 deg off his facing and 1 from there (a clean
// one-frame switch: segF's 16-deg ramp left a near-profile frame at turn 0.57 here).
import * as THREE from "three";
import { SEGMENTS, FPS, clamp01, smooth, capWord, lineId, easeInOutCubic, type Pose, type Segment, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU_OLD } from "../people";
import { TEMPLE, EYE } from "../layout";
import { transitionAt, OFF } from "../hud";
import { V, standing, says, accent, heads, rel, wrapA, yawTo, bow, at, ky, headPx, lid, swaps, type RigState } from "./common";

const S = SEGMENTS[8], B = BEAT.I, PI = Math.PI, DEG = PI / 180;
const word = (id: string, w: string) => capWord(id, w).from;
type Expr = NonNullable<RigState["expr"]>;

// ------------------------------------------------------------------------------------------------ beats (looked up)
const I56 = lineId("I56"), I57 = lineId("I57");
const WD = { life: word("I56", "您这辈子"), gongye: word("I56", "最大的功业"), what: word("I56", "是什么") };
/** she has walked in (the stamp is gone by then: hud stamp.tsx holds 2.5 s from BEAT.I.stamp, fades over 10) */
const ARRIVE = B.stamp + Math.round(2.5 * FPS) + 10;
/** he turns to the portrait on 是什么 (her question sends his eyes there: a 20-frame turn), and back to her lens before
 *  the smile (14 frames) */
const TURN0 = WD.what, TURN1 = TURN0 + 20;
const BACK1 = B.smile - 4, BACK0 = BACK1 - 14;
/** her lens tips up to the portrait with him, holds, and tips back down onto him BEFORE his face comes round (it shows
 *  from about BACK0 + 3: the back view ends at 136 deg) */
const UP0 = TURN0 + 2, UP1 = TURN1 + 6, DOWN0 = BACK0 - 12, DOWN1 = BACK0 + 6;
/** the camera eases in on him from the smile to just after the second name */
const EASE0 = B.smile - 2, EASE1 = B.names[1] + 24;
/** the welcome: his free (right) hand lifts as she walks up, with a nod */
const HELLO = B.stamp + 6;
/** under card 5: his eyes open on her lens, the farewell bow (BOW0 down, BOW1 up again), his eyes open on us once more
 *  just before her camera switches off (hud/vlog.tsx OFF.click: the lamp goes out, then the picture collapses) */
const BOW0 = B.card[0] + 28, BOW1 = OFF.click - 26, EYES = OFF.click - 16;

// ------------------------------------------------------------------------------------------------ marks (layout/temple)
/** where he stands (TEMPLE.su, z -1.7: the portrait 2.45 m behind him) and his head centre (SU_OLD is 1.04: the
 *  rig's head over the floor scales with it, layout SU_HEAD 1.3 is SU's at 1.06) */
const AT = TEMPLE.su.clone();
const HEAD = AT.clone().add(V(0, 1.3 * (1.04 / 1.06), 0));
/** his facings: to her lens (the talk camera), and to the portrait (a little left of its middle: about 150 deg off her
 *  lens at LOOK, a back three-quarters) */
const F_LOOK = yawTo(AT, V(TEMPLE.portrait.x - 0.28, 0, TEMPLE.portrait.z));
/** the stick: its grip at STICK_Y over the floor (the prop's foot 0.90 m under the grip: on the floor), in his torso's
 *  frame at his left (+x), a little forward: out past the robe's hem */
const STICK_Y = 0.9, STICK = { x: 0.25, z: 0.15 };

// ------------------------------------------------------------------------------------------------ her camera
type K = { pos: Vec3; look: Vec3 };
/** a camera at `pos` aimed so the world point `target` lands at screen (sx, sy) px (of 1080 x 1920; no roll): segE's */
const aim = (pos: Vec3, target: THREE.Vector3, sx: number, sy: number, fov = C.FOV): K => {
  const p = V(...pos), d = target.clone().sub(p), hd = Math.hypot(d.x, d.z), t = Math.tan((fov * PI) / 360);
  const f0 = V(d.x / hd, 0, d.z / hd), r0 = V(-f0.z, 0, f0.x);
  const dyaw = Math.atan((sx / 540 - 1) * t * (9 / 16)), pitch = Math.atan2(d.y, hd) - Math.atan((1 - sy / 960) * t);
  const fw = f0.multiplyScalar(Math.cos(dyaw)).addScaledVector(r0, -Math.sin(dyaw)).multiplyScalar(Math.cos(pitch)).add(V(0, Math.sin(pitch), 0));
  const l = p.addScaledVector(fw, d.length());
  return { pos, look: [l.x, l.y, l.z] };
};
/** LAND: the wash lands on the hall from just inside it: the whole portrait on the back wall (its painting below the
 *  stamp's words: only the plain silk of the mounting under them), him before it, small and low (an establishing frame:
 *  his eyes come up to the upper third as she walks in) */
const LAND = aim([HEAD.x - 0.4, EYE, HEAD.z + 4.4], HEAD, 615, 905);
/** TALK: she has walked up, 2.25 m from him, a little to his right (screen left of him), his face in
 *  the upper third, the portrait behind and above him */
const TALK = aim([HEAD.x - 0.3, EYE, HEAD.z + 2.25], HEAD, 560, 610);
/** LOOK: she drifts a little left and tips up with him: the painted face in the upper middle, his back below it */
const LOOK = aim([HEAD.x - 0.5, EYE, HEAD.z + 2.4], TEMPLE.portraitFace, 480, 470);
/** BACK: down on him again as his face comes round */
const BACK = aim([HEAD.x - 0.28, EYE, HEAD.z + 2.2], HEAD, 548, 570);
/** EASE: eased in a little on him for I57: his face high, the names under his chin (NAMES_RECT y 690-1140) */
const EASE = aim([HEAD.x - 0.2, EYE, HEAD.z + 1.95], HEAD, 540, 470);
const key = (f: number, k: K, ease?: (x: number) => number): C.CamKey => ({ f, pos: k.pos, look: k.look, fov: C.FOV, ease });
const KEYS: C.CamKey[] = [
  key(S.from, LAND),
  key(ARRIVE, TALK, smooth),
  key(UP0, TALK),
  key(UP1, LOOK, easeInOutCubic),
  key(DOWN0, LOOK),
  key(DOWN1, BACK, easeInOutCubic),
  key(EASE0, BACK),
  key(EASE1, EASE, easeInOutCubic),
];
/** her steps (walking in), her breathing (calm, a little less once he speaks, barely at the end) */
const WALK: [number, number][] = [[S.from, 1], [ARRIVE - 30, 0.5], [ARRIVE, 0]];
const ampAt = (f: number) => ky(f, [[S.from, 0.7], [ARRIVE, 0.6], [EASE0, 0.45], [B.pictures, 0.3], [B.black[1], 0.25]]);
export const camI = (f: number): CamPose => {
  let c = C.keyCam(f, KEYS);
  c = C.creep(c, f, I56.from, UP0, 0.06);                 // a breath closer while she asks
  c = C.creep(c, f, EASE1, S.to, 0.16);                    // and on, very slowly, to the black
  return C.handheld(c, f, { mood: "calm", walk: WALK, amp: ampAt(f), seed: 9 });
};

// ------------------------------------------------------------------------------------------------ his facing and turn
const lensDir = (cam: CamPose) => { const c = cam.pos as Vec3; return Math.atan2(c[0] - AT.x, c[2] - AT.z); };
/** to her lens, to the portrait on 是什么, back to her lens before the smile (eased keys, the short way round) */
const facingAt = (f: number, cam: CamPose) => {
  const her = lensDir(cam);
  if (f < TURN0) return her;
  if (f >= BACK1) return her;
  const look = her + wrapA(F_LOOK - her) * 1;                // unwrapped next to her: turns to his right (screen left)
  return f < BACK0 ? ky(f, [[TURN0, her], [TURN1, look]]) : ky(f, [[BACK0, look], [BACK1, her]]);
};
/** THE BACK VIEW: a clean switch, no in-between (a turn of 0.3-0.7 draws the face squeezed to the side of the head:
 *  a near profile, seen in a still at 0.57): 0 = turned to her lens (the face within 12 deg of it) while his facing is
 *  under 128 deg off her lens, 1 = his true facing (the back view) from there; held at 1 while he looks. His facing
 *  passes 128 deg at about 6 deg a frame, so the switch is one frame of a quick turn */
const turnFor = (f: number, facing: number, cam: CamPose) => {
  if (f >= TURN1 && f < BACK0) return 1;
  return Math.abs(wrapA(facing - lensDir(cam))) >= 128 * DEG ? 1 : 0;
};
/** the stick lifts a little while he turns */
const stickLift = (f: number) => {
  const u0 = (f - TURN0) / (TURN1 - TURN0), u1 = (f - BACK0) / (BACK1 - BACK0);
  return 0.035 * (u0 > 0 && u0 < 1 ? Math.sin(PI * u0) : 0) + 0.035 * (u1 > 0 && u1 < 1 ? Math.sin(PI * u1) : 0);
};

// ------------------------------------------------------------------------------------------------ his face
/** expressions on the words: fond while she walks up, attentive while she asks; fond as his face comes round, the
 *  market grin, happy through the names, grin, the fond closed-eyed smile while the pictures come up; under card 5 his
 *  eyes open on her lens (the viewer), close as he bows, and open on us again into the end ("neutral" is his resting
 *  smile_closed: people.ts) */
const EXPR: [number, Expr][] = [
  [S.from, "smile_closed"], [I56.from + 6, "smile"], [BACK0 + 6, "smile_closed"], [B.smile, "grin"],
  [I57.from, "happy"], [I57.to + 2, "grin"], [I57.to + 34, "smile_closed"],
  [B.card[0] - 4, "smile"], [BOW0 + 6, "smile_closed"], [EYES, "smile"],
];
/** the gaze (pupils): to her; a glance off to the right of frame as she walks up (the hall), to her again */
const GAZE: [number, number][] = [[S.from, 0.25], [HELLO, 0], [WD.what, -0.25], [BACK0 + 8, 0]];
/** his head: UP at the portrait while he looks (negative), level for the names */
const lookDownAt = (f: number) => ky(f, [[TURN0, 0], [TURN1, -12], [BACK0, -12], [BACK1, 0]]);
/** a listening tilt during her question, a tilt as he looks up at his young self, upright for the names */
const tiltAt = (f: number) => ky(f, [[I56.from, 0], [WD.gongye, 4], [WD.what + 4, 2], [TURN1, 4], [BACK0, 3], [BACK1, 0], [I57.to + 20, 2], [B.card[0], 0]]);

export const SEG: Segment = {
  id: "I", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f): Pose {
    // the hall's light (TEMPLE_LOOK.cast), a touch warmer and fuller on him from his smile to the end
    const warm = ky(f, [[B.smile - 20, 0], [I57.to, 1]]);
    w.setPlace("temple", warm > 0 ? { light: { tint: [1.0, 0.93 - 0.05 * warm, 0.84 - 0.1 * warm], gain: 0.95 + 0.06 * warm } } : undefined);
    const cam = camI(f);
    w.setCamera(cam);
    const t = f / FPS;
    const facing = facingAt(f, cam), turn = turnFor(f, facing, cam);

    // ---- HIM: standing before the portrait, alive, the stick in his left hand
    const r = w.actor(SU_OLD);
    const sp = says("su", ["I57"], f, 1);
    const bowK = ky(f, [[BOW0, 0], [BOW0 + 26, 1], [BOW1, 1], [BOW1 + 20, 0]]);
    const B_ = bowK > 0 ? bow(bowK * 0.6, 16) : {};
    const head = heads(
      sp.head,
      accent("nod", f, HELLO + 4, { amp: 0.5 }),
      accent("nod", f, B.names[0] + 2, { amp: 0.4 }), accent("nod", f, B.names[1] + 2, { amp: 0.45 }), accent("nod", f, B.names[2] + 2, { amp: 0.55 }),
      accent("laugh", f, I57.to + 6, { dur: 0.7, amp: 0.5 }),
      B_.head,
      { tilt: tiltAt(f) },
    );
    r.set({
      ...standing(AT, facing, f, 1, {
        pose: { kind: "idle", t: t + 0.37 },
        turn, expr: at(f, EXPR), gaze: at(f, GAZE),
        lookDown: lookDownAt(f) + (B_.lookDown ?? 0),
        blink: sp.blink ?? lid(t, 1, swaps(EXPR)),
      }),
      ...(sp.mouth ? { mouth: sp.mouth } : {}),
      head, hands: [null, null],
    });
    w.update();

    // ---- his hands, in his torso's frame (bodyYaw of the first solve): the stick (left), the welcome (right)
    const yaw = r.bodyYaw;
    const grip = rel(AT, yaw, STICK.x, STICK_Y + stickLift(f), STICK.z);
    let right: THREE.Vector3 | null = null;
    const hu = (f - HELLO) / 34;
    if (hu > 0 && hu < 1) {
      const up = smooth(clamp01(hu / 0.3)) * (1 - smooth(clamp01((hu - 0.65) / 0.35)));
      right = r.handWorld(0).lerp(rel(AT, yaw, -0.27, 1.0 + 0.015 * Math.sin(hu * 3 * PI), 0.2), up);
    }
    r.set({ hands: [right, grip] });
    w.update();
    w.prop("stick").put(r.handWorld(1), { grip: "hilt", rot: yaw });

    const px = headPx(w, r);
    const shot = f < I56.from ? "land" : f < TURN0 ? "talk" : f < BACK1 ? "look" : f < I57.from ? "smile" : f <= I57.to ? "ease" : f < B.card[0] ? "pictures" : f < B.black[0] ? "card" : "black";
    return { camera: cam, overlays: transitionAt(f)?.node ?? null, slate: `I ${shot} turn ${turn.toFixed(2)} head ${Math.round(px.x)},${Math.round(px.y)} r ${Math.round(px.r)}` };
  },
};
