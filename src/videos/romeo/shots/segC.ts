// SCENE C · Sunday late night, Juliet's balcony over the orchard (认识：3小时). Rapid switches between her interview up on
// the balcony and his, crouched in the dark orchard below: one question, both answer. Then Jay's split screen: both sigh
// the other's name with their eyes shut, each to themselves; both stop, each heard something; the torn edge between the
// halves opens and it was one picture all along (就在楼下). One picture: he swears by the moon, she forbids it, asks for
// marriage, and he is off running before she has finished.
// CAMERA PLAN:
//   1  C01      her interview, close at the rail; still                                               (her famous line)
//   2  C02-C04  HARD CUT to his, crouched in the bushes; SNAP ZOOM on "sun", held through 半夜          (the joke is his arm)
//   3  C05-C07  HARD CUT to her: the one slow push of the half (fov 42 -> 33)                          (the sincere beat)
//   4  C08      the split: one picture from the orchard, the torn letter across the balcony's edge   (Jay's idea)
//   5  C08 end  the tear opens; a breath back                                                         (one picture all along)
//   6  C09-C10  hold the one picture                                                                  (him below, her above)
//   7  C11      SNAP ZOOM onto her on "marriage"                                                       (the punch word)
//   8  C12      TILT DOWN to his spot: empty; he is already running, the lens follows him to the wall  (he leaves)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam, punchIn, type CamKey } from "../cam";
import { V, standing, yawTo, walkAlong, speak, saying } from "./common";
import { ROMEO, JULIET } from "../people";
import { SplitDivider } from "../hud/index";
import { P, wv, spot, camAt, ck, faceAt, talk, wordAt, startOf, endOf, ky, accent, rel, REACT } from "./kit";
import { h, frag } from "./h";
import { FONT_STACK } from "../../../kit/day/hud/style";
import { SPEAKER_COL } from "../hud";
import { clamp01, easeInOutCubic } from "../../group/story";

const S = seg("C");
const RAIL = spot("balcony", "julietRail"), BELOW = spot("balcony", "romeoBelow");
/** his interview: she crouches in the orchard (lower and closer than the stock "romeo" spot, his face a third down) */
const RO_POS: [number, number, number] = [0.9, 1.15, 1.9], RO_LOOK: [number, number, number] = [0.32, 0.75, 0.35];
/** (v3) he springs up out of the bushes on "and Juliet is the sun!" (the whisper turning into a shout): up from the
 *  crouch over `len` frames, landing on "sun" with a little overshoot; her lens rises with him */
const RISE = { len: 9, drop: 0.38 };
const RO_POS_UP: [number, number, number] = [0.9, 1.3, 1.9], RO_LOOK_UP: [number, number, number] = [0.32, 1.12, 0.35];
/** (v3) her famous line: her left hand winds the curl of her left drill (a circle every 0.8 s) while she sighs */
const TWIRL = { x: 0.25, y: 0.72, z: 0.1, r: 0.025, period: 24 };
/** the split: the tear across the balcony's underside; it opens a few frames after the two names */
export const SPLIT = { from: startOf("C08") - 3, open: endOf("C08") + 8, len: 20 };
export const splitOpen = (f: number) => easeInOutCubic(clamp01((f - SPLIT.open) / SPLIT.len));
/** the balcony slab's underside, where the tear lies (world) */
const SLAB_UNDER = P("balcony", 0.25, 2.43, -0.47);
/** his run: from the bushes along to the orchard wall and out past the right of the frame */
const RUN_PATH = [BELOW.at, P("balcony", 1.4, 0, 0.95), P("balcony", 2.5, 0, 1.25), P("balcony", 2.64, 0, 3.4)];

export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("balcony");
    const c02 = startOf("C02"), c05 = startOf("C05"), c08 = SPLIT.from, c10 = startOf("C10"), c12 = startOf("C12");
    const tEast = wordAt("C03", "east"), tSun = wordAt("C03", "sun"), tMar = wordAt("C11", "marriage");
    const herCut = c02 - 3, hisCut = c05 - 3;
    // ---------------------------------------------------------------- the camera
    let camera;
    if (f < herCut) {
      camera = povCam(f, [camAt("balcony", "juliet", S.from), camAt("balcony", "juliet", herCut)], { mood: "calm", amp: 0.35 });
    } else if (f < hisCut) {
      // (v3) he springs up out of the bushes as the whisper turns into a shout: she tilts up with him, the snap zoom
      // lands on "sun" on his face up there
      camera = povCam(f, [ck("balcony", herCut, RO_POS, RO_LOOK, 46), ck("balcony", tSun - RISE.len - 2, RO_POS, RO_LOOK, 46),
        ck("balcony", tSun + 2, RO_POS_UP, RO_LOOK_UP, 46), ck("balcony", hisCut, RO_POS_UP, RO_LOOK_UP, 46)], { mood: "calm", amp: 0.5 });
      camera = punchIn(camera, f, tSun - 5, { k: 0.86, len: 5, off: hisCut + 20 });
    } else if (f < c08) {
      camera = povCam(f, [
        camAt("balcony", "juliet", hisCut),
        { ...camAt("balcony", "juliet", endOf("C05")), fov: 34 },
        { ...camAt("balcony", "juliet", c08), fov: 33 },
      ], { mood: "calm", amp: 0.3 });
    } else {
      const RV = camAt("balcony", "reveal", 0), pos = RV.pos;
      const k = (fr: number, look: number[], fov: number): CamKey => ({ f: fr, pos, look: wv("balcony", look), fov });
      const rvLook = [0.1, 2.0, -0.4];
      camera = povCam(f, [
        k(c08, rvLook, 48),
        k(SPLIT.open, rvLook, 48),
        k(SPLIT.open + SPLIT.len + 10, rvLook, 50),                  // the halves meet: a breath back
        // she cuts him off: a slow push up to her (taste review of v1: in the wide their heads were too small to read on
        // a phone for nine seconds, and the captions sat on his back); his hat stays at the bottom edge, he is still there
        k(c10 - 4, rvLook, 50),
        k(c10 + 50, [0.06, 2.7, -0.7], 40),
        k(tMar - 5, [0.06, 2.7, -0.7], 40),
        k(tMar, [0.02, 3.72, -1.0], 31),                            // SNAP ZOOM onto her on "marriage"
        k(c12 - 3, [0.02, 3.72, -1.0], 31),
        k(c12 + 9, [0.4, 0.95, 0.4], 42),                           // tilt down: his spot in the bushes, empty
        k(c12 + 14, [0.55, 0.95, 0.5], 42),
        k(c12 + 22, [2.05, 0.95, 1.7], 44),                         // finds him running along the wall
        k(c12 + 32, [2.35, 0.95, 2.1], 44),                         // and lets him run out of its right edge (about
        k(S.to, [2.35, 0.95, 2.1], 44),                             // f2203) before his path ends (f2207: v4 stills, the
                                                                    // pan lagged and he was gone from 2180)
      ], { mood: "calm", amp: 0.4 });
    }
    w.setCamera(camera);

    // ---------------------------------------------------------------- Juliet at the rail
    const ju = w.actor(JULIET);
    const tSplitStop = endOf("C08") + 4;
    const onRail: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, -0.17, 0.69, 0.38), rel(RAIL.at, RAIL.facing, 0.17, 0.69, 0.38)];
    const folded: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, -0.05, 0.6, 0.24), rel(RAIL.at, RAIL.facing, 0.05, 0.6, 0.24)];
    const chin: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, -0.05, 0.92, 0.26), rel(RAIL.at, RAIL.facing, 0.05, 0.92, 0.26)];
    // in her close the rail is below the frame, so arms reaching for it read as two sticks: on her famous line the hands
    // are clasped at her chest, on "my love as deep" one hand is on her heart and the other stays on the rail
    const clasp: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, -0.04, 0.8, 0.25), rel(RAIL.at, RAIL.facing, 0.04, 0.8, 0.25)];
    const heart: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, 0.05, 0.82, 0.22), onRail[1]];
    const c07 = startOf("C07"), c11 = startOf("C11");
    const ang = (2 * Math.PI * (f - S.from)) / TWIRL.period;
    const twirl: [THREE.Vector3, THREE.Vector3] = [clasp[0], rel(RAIL.at, RAIL.facing, TWIRL.x, TWIRL.y + TWIRL.r * Math.sin(ang), TWIRL.z + TWIRL.r * Math.cos(ang))];
    const juHands = f < herCut ? (f >= S.from + 6 && f < herCut - 8 ? twirl : clasp) : f >= c05 - 4 && f < endOf("C05") + 8 ? heart
      : f >= c07 - 4 && f < c08 ? folded : f >= c08 && f < tSplitStop ? chin : f >= c10 && f < endOf("C11") + 6 ? null : onRail;
    const juPose = f >= c10 && f < c11 - 6 ? { kind: "wave" as const, t: (f - c10) / 30, arm: 0 as const }
      : f >= c11 && f < endOf("C11") + 6 ? { kind: "point" as const, t: (f - c11) / 30, arm: 0 as const } : { kind: "hold" as const, t: f / 30 };
    // eyes drift shut after 太突然 and stay shut through the names; open when each hears something
    const shut = f >= endOf("C07") + REACT && f < tSplitStop ? (f < endOf("C07") + REACT + 5 ? 0.5 : 1) : undefined;
    const looksDown = ky(f, [[SPLIT.open + 4, 0], [SPLIT.open + 18, 22]]);
    ju.set({
      ...standing(RAIL.at, RAIL.facing, f, 2),
      pose: juPose, hands: juHands ?? [null, null],
      // v3b (the owner: "give them expressive emotion showing they are in love"): smitten eyes on her famous line and on
      // "my love as deep"; HEART EYES (the film's signature emote, in her close) as the line ends, through the reporter's
      // "you met three hours ago?", until it lands; smitten again when she finds him under the balcony
      expr: faceAt(f, [[0, "smitten"], [endOf("C05") + 4, "heartsSoft"], [endOf("C06") + REACT, "caught"], [c07 - 2, "sure"], [endOf("C07") + REACT, "swoon"],
        [tSplitStop, "caught"], [SPLIT.open + 14, "smitten"], [c10 - 2, "bossy"], [endOf("C11") + REACT, "sure"]]),
      ...talk("ju", f, 2),
      gaze: f < c05 ? 0.5 : 0,
      lookDown: looksDown, head: accent("jolt", f, tSplitStop) ?? (f >= c08 && f < tSplitStop ? { tilt: 7 } : undefined),
      // (v3) "Thy purpose marriage, send me word tomorrow!": all business, she leans out over the rail to call it down
      lean: { pitch: 11 * ky(f, [[c11 - 6, 0], [c11 + 6, 1], [endOf("C11"), 1], [endOf("C11") + 14, 0]]) },
      ...(shut !== undefined ? { blink: shut } : {}),
      hide: ["vial"],
    });

    // ---------------------------------------------------------------- Romeo in the orchard
    const ro = w.actor(ROMEO);
    const runFrom = c12 - 6;
    const interview = f >= herCut && f < hisCut;
    const ruN = walkAlong(RUN_PATH, 2.8, (f - runFrom) / 30);
    let roAt = BELOW.at.clone(), roFacing = BELOW.facing, roState: Record<string, unknown> = {};
    if (interview || f < herCut) {
      // crouched in the bushes, three-quarter to her lens, pointing up behind him at the balcony
      roFacing = yawTo(BELOW.at, wv("balcony", RO_POS)) + 0.5;
      const up = f >= tEast - 4;
      // the rise: crouched (sunk RISE.drop) until RISE.len frames before "sun", up by "sun" with a 3 cm overshoot
      const u = Math.min(1, Math.max(0, (f - (tSun - RISE.len)) / RISE.len)), e = u * u * (3 - 2 * u), over = u >= 1 ? 0.03 * Math.max(0, 1 - (f - tSun) / 6) * Math.sin(((f - tSun) / 6) * Math.PI) : 0;
      roState = {
        at: BELOW.at.clone().add(V(0, -RISE.drop * (1 - e) + over, 0)),
        hands: up ? [rel(BELOW.at, roFacing, -0.85, 1.65, 0.15), null] : [null, null],
        expr: faceAt(f, [[0, "dreamy"], [tSun - 4, "smittenOpen"]]),
        head: accent("pop", f, tSun) ?? undefined,
        lookDown: -6,
      };
    } else if (f < runFrom) {
      // standing in the bushes: eyes shut, sighing her name (his own take of C08, at the same moment); then he hears
      // something, turns and looks up at the balcony
      const turnK = ky(f, [[SPLIT.open + 2, 0], [SPLIT.open + 16, 1]]);
      roFacing = THREE.MathUtils.lerp(0.25, Math.PI * 0.88, turnK);
      const sighing = f >= c08 && f < tSplitStop;
      const swear = f >= startOf("C09") - 4 && f < endOf("C09") + 8;
      roState = {
        hands: sighing ? [rel(roAt, roFacing, -0.05, 0.86, 0.2), rel(roAt, roFacing, 0.05, 0.86, 0.2)]
          : swear ? [rel(roAt, roFacing, -0.78, 1.62, 0.4), rel(roAt, roFacing, 0.07, 0.8, 0.13)] : [null, null],
        expr: faceAt(f, [[0, "dreamy"], [tSplitStop, "blank"], [SPLIT.open + 14, "smitten"], [endOf("C10") + REACT, "puppy"], [c11 + 20, "smitten"]]),
        ...(sighing && saying("ju", f) ? speak(saying("ju", f)!, f, 1) : talk("ro", f, 1)),
        ...(sighing ? { blink: 1 } : {}),
        head: accent("jolt", f, tSplitStop) ?? (sighing ? { tilt: -7 } : undefined),
        lookDown: -20 * turnK, turn: turnK > 0.5 ? 0.55 : undefined,
      };
    } else {
      roAt = ruN.at; roFacing = ruN.facing;
      roState = { pose: ruN.pose, expr: faceAt(f, [[0, "smittenOpen"]]), ...talk("ro", f, 1), turn: 0.4 };
    }
    ro.set({
      ...standing(roAt, roFacing, f, 1),
      ...roState,
      at: (roState.at as THREE.Vector3 | undefined) ?? roAt,
      hide: ["letter"],
      visible: !(f >= runFrom && ruN.arrived),
    });
    w.update();

    // ---------------------------------------------------------------- the split's torn edge (and a tint on each half)
    let overlays;
    if (f >= c08 && f < SPLIT.open + SPLIT.len + 1) {
      const y = Math.round(w.project(SLAB_UNDER).y), open = splitOpen(f), tint = 1 - open;
      overlays = frag(
        h("div", { key: "tu", style: { position: "absolute", left: 0, top: 0, width: 1080, height: y, background: "linear-gradient(180deg, rgba(150,40,52,0.16), rgba(150,40,52,0.04))", opacity: tint } }),
        h("div", { key: "tl", style: { position: "absolute", left: 0, top: y, width: 1080, height: 1920 - y, background: "linear-gradient(0deg, rgba(40,70,140,0.18), rgba(40,70,140,0.05))", opacity: tint } }),
        h(SplitDivider, { key: "sd", y, open }),
        splitNames(f, y, open),
      );
    }
    const namesUp = f >= c08 && f < endOf("C08") + 8;
    return { camera, overlays, captions: namesUp ? false : undefined };
  },
};

/** THE TWO NAMES, one in each half while the screen is split: hers (罗密欧……) just above the tear in her rose, his
 *  (朱丽叶……, his own take sighed at the same moment) in the subtitle band in his blue. The subtitle steps aside for
 *  them; they ride apart with the halves as the tear opens and fade. */
function splitNames(f: number, y: number, open: number) {
  const from = startOf("C08"), to = endOf("C08") + 6;
  const a = Math.min(1, (f - from + 1) / 3, (to - f + 1) / 3) * (1 - open);
  if (a <= 0) return null;
  const row = (key: string, zh: string, en: string, cy: number, col: string) => {
    const t = (px: number, ink: number): Record<string, unknown> => ({ fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, lineHeight: 1, whiteSpace: "pre", color: "#1a120c", WebkitTextStroke: `${ink}px #1a120c`, textShadow: "0 3px 0 rgba(10,6,4,0.45), 0 5px 18px rgba(10,6,4,0.55)" });
    const line = (k: string, s: string, px: number, ink: number, yy: number) => h("div", { key: k, style: { position: "absolute", left: 540, top: yy, transform: "translate(-50%, -50%)", ...t(px, ink), letterSpacing: px > 50 ? 1 : 0.4 } },
      h("span", null, s), h("span", { style: { position: "absolute", left: 0, top: 0, color: col, WebkitTextStroke: "0px transparent", textShadow: "none" } }, s));
    return h("div", { key, style: { position: "absolute", inset: 0, opacity: a } }, line(key + "z", zh, 66, 11, cy), line(key + "e", en, 36, 7, cy + 52));
  };
  const edges = { up: y - open * (y + 70), down: y + open * (1920 - y + 70) };
  return frag(
    row("nj", "罗密欧……罗密欧……", "Romeo… Romeo…", edges.up - 120, SPEAKER_COL.ju),
    // his under the tear, above his hat: in the subtitle band it lay across his face (taste review of v1, f1750)
    row("nr", "朱丽叶……朱丽叶……", "Juliet… Juliet…", edges.down + 135, SPEAKER_COL.ro),
  );
}

