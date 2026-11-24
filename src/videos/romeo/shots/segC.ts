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
import { povCam, punchIn, CAM, type CamKey } from "../cam";
import { V, VERBS, standing, yawTo, walkAlong, speak, saying } from "./common";
import { ROMEO, JULIET, JULIET_LOW } from "../people";
import { SplitDivider, EyeHearts, Sparkles, DustPuff, Huff } from "../hud/index";
import { EMO } from "../emo";
import { P, wv, spot, camAt, ck, faceAt, talk, wordAt, startOf, endOf, ky, accent, rel, eyesPx, REACT } from "./kit";
import { h, frag } from "./h";
import { FONT_STACK } from "../../../kit/day/hud/style";
import { SPEAKER_COL } from "../hud";
import { clamp01, easeInOutCubic } from "../../group/story";
import { reach, hit, beat, rock, lineBody, leans, talkHead, strokes } from "./gest";

const S = seg("C");
const RAIL = spot("balcony", "julietRail"), BELOW = spot("balcony", "romeoBelow");
/** his interview: she crouches in the orchard (lower and closer than the stock "romeo" spot, his face a third down) */
const RO_POS: [number, number, number] = [0.9, 1.15, 1.9], RO_LOOK: [number, number, number] = [0.32, 0.75, 0.35];
/** (v3) he springs up out of the bushes on "and Juliet is the sun!" (the whisper turning into a shout): up from the
 *  crouch over `len` frames, landing on "sun" with a little overshoot; her lens rises with him */
const RISE = { len: 9, drop: 0.38 };
const RO_POS_UP: [number, number, number] = [0.9, 1.3, 1.9], RO_LOOK_UP: [number, number, number] = [0.32, 1.12, 0.35];
/** the split: the tear across the balcony's underside; it opens a few frames after the two names */
export const SPLIT = { from: startOf("C08") - 3, open: endOf("C08") + 8, len: 20 };
export const splitOpen = (f: number) => easeInOutCubic(clamp01((f - SPLIT.open) / SPLIT.len));
/** "too rash, too unadvised, too sudden": her three counts */
const COUNT3 = [wordAt("C07", "rash"), wordAt("C07", "unadvised"), wordAt("C07", "sudden")];
/** his arm at her balcony (points in his own frame): thrown up on "east", sagging while he gets his breath, thrust
 *  straight up beside his hat on "sun". (Until v4 one point, far out to his side: in her close on his face the hand
 *  was at the frame's edge, under the part the app cuts off, and stood still for three seconds.) */
// (v6, the owner on the v5 cut: "Keep his arm around this height, anything further back seems off": the hand he marked
// is the sag's, out in front at the side of his face. Until v5 "east" and "sun" put it up behind his own head.) All
// three now stay out at that height, in front of his shoulder: up a little on "east", the sag, thrust out on "sun".
const ARM_EAST = V(-0.6, 1.5, 0.27), ARM_SAG = V(-0.6, 1.42, 0.25), ARM_SUN = V(-0.63, 1.56, 0.29);
/** from his left shoulder to the moon (his own frame: it hangs over the orchard wall to his left as he faces her).
 *  Half way between up and out: his arm is 0.38 m long, and a hand held higher is hidden behind his own head */
/** the oath's arm: how steeply it goes up toward the moon, in the picture's own plane (radians above level) */
const MOON_UP = 0.5;
/** the balcony slab's underside, where the tear lies (world) */
const SLAB_UNDER = P("balcony", 0.25, 2.43, -0.47);
/** his run: from the bushes along to the orchard wall and out past the right of the frame. (v4: 2.42 / 2.5 from 2.5 /
 *  2.64: the orchard wall's face is at x 2.95, and his head with the beret on it is 0.35 wide to that side: it went
 *  11 cm into the stone as he left the frame; and a little further on, so he is still running when the edge takes him) */
const RUN_PATH = [BELOW.at, P("balcony", 1.4, 0, 0.95), P("balcony", 2.42, 0, 1.25), P("balcony", 2.5, 0, 3.75)];
/** (v7, emo.ts 6) the sunburst: how far behind his head it hangs (m, away from the lens) */
const SUN_BACK = 0.4;
/** (v7, emo.ts 8) her half second on "marriage": the flustered face's frames, the steam's delay after the word */
const STEAM = { hold: 16, at: 3 };
/** (v7.1) the height (m) the lens looks at when it tilts down onto his empty spot. It was 0.95 until v7: with the dust
 *  cloud on (emote 9) the cloud sat on the 九点整 subtitle; looking lower puts his spot higher in the picture */
const DUST_LOOK = EMO.c12Dust ? 0.6 : 0.95;

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
        k(c12 + 9, [0.4, DUST_LOOK, 0.4], 42),                      // tilt down: his spot in the bushes, empty
        k(c12 + 14, [0.55, DUST_LOOK, 0.5], 42),
        k(c12 + 22, [2.05, 0.95, 1.7], 44),                         // finds him running along the wall
        k(c12 + 32, [2.35, 0.95, 2.1], 44),                         // and lets him run out of its right edge (about
        k(S.to, [2.35, 0.95, 2.1], 44),                             // f2203) before his path ends (f2207: v4 stills, the
                                                                    // pan lagged and he was gone from 2180)
      ], { mood: "calm", amp: 0.4 });
    }
    w.setCamera(camera);

    // ---------------------------------------------------------------- Juliet at the rail
    // (v7, the owner on the v6.1 cut, f1738: "Her hair is coming out her neck ... it looks like she have a beard": from
    // the orchard the lens looks up at her, and the lowest rim of the hair at the back of her head showed under her chin,
    // as it did from the floor of the vault. From the split on she is the figure scene I uses: people.ts JULIET_LOW.)
    const ju = w.actor(f >= c08 ? JULIET_LOW : JULIET);
    const tSplitStop = endOf("C08") + 4;
    const onRail: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, -0.17, 0.69, 0.38), rel(RAIL.at, RAIL.facing, 0.17, 0.69, 0.38)];
    const folded: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, -0.05, 0.6, 0.24), rel(RAIL.at, RAIL.facing, 0.05, 0.6, 0.24)];
    const chin: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, -0.05, 0.92, 0.26), rel(RAIL.at, RAIL.facing, 0.05, 0.92, 0.26)];
    // in her close the rail is below the frame, so arms reaching for it read as two sticks: on her famous line the hands
    // are clasped at her chest, on "my love as deep" one hand is on her heart and the other stays on the rail
    const clasp: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, -0.04, 0.8, 0.25), rel(RAIL.at, RAIL.facing, 0.04, 0.8, 0.25)];
    const heart: [THREE.Vector3, THREE.Vector3] = [rel(RAIL.at, RAIL.facing, 0.05, 0.82, 0.22), onRail[1]];
    const c07 = startOf("C07"), c11 = startOf("C11");
    // the reporter's "you met three hours ago?" LANDS on "three hours", seven tenths of the way through it: her hearts
    // burst and she is caught for half a second before she straightens up to answer (at the line's end the caught face
    // had one frame before her prim one took over)
    const caughtAt = startOf("C06") + Math.round((endOf("C06") - startOf("C06")) * 0.7);
    // (v6, the owner on the v5 cut: "Make her arm do a more natural gesture") her famous line is sighed with her hands
    // clasped at her chest, pressed up a little to her heart on each "Romeo". (v3 to v5: her left hand wound the curl
    // of her drill, out at her side; the arm stood out bent and the hand hung behind the curl.)
    const press = 0.022 * beat(f, strokes("C01", "Wherefore"), 4, 12);
    const sigh: [THREE.Vector3, THREE.Vector3] = [clasp[0].clone().add(V(0, press, 0)), clasp[1].clone().add(V(0, press, 0))];
    const juHands = f < herCut ? sigh : f >= c05 - 4 && f < endOf("C05") + 8 ? heart
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
      // "my love as deep"; a soft smitten smile with hearts floating out of her eyes as the line ends, through the
      // reporter's "you met three hours ago?", until it lands (v5: no heart eyes: "the floatinng heart is enough");
      // smitten again when she finds him under the balcony
      // (v7, emo.ts 7 and 8) 无语 when "three hours" lands; on "marriage" she is caught for half a second (flustered,
      // steam off her head) and then all business again
      expr: faceAt(f, [[0, "smitten"], [endOf("C05") + 4, "smittenSoft"], [caughtAt, EMO.c06Speechless ? "speechless" : "caught"], [c07 - 2, "sure"], [endOf("C07") + REACT, "swoon"],
        [tSplitStop, "caught"], [SPLIT.open + 14, "smitten"], [c10 - 2, "bossy"], ...(EMO.c11Steam ? [[tMar, "flustered"], [tMar + STEAM.hold, "bossy"]] as [number, string][] : []),
        [endOf("C11") + REACT, "sure"]]),
      ...talk("ju", f, 2),
      gaze: f < c05 ? 0.5 : 0,
      lookDown: looksDown, head: talkHead("ju", f, 2, accent("jolt", f, tSplitStop), f >= c08 && f < tSplitStop ? { tilt: 7 } : undefined),
      // (v3) "Thy purpose marriage, send me word tomorrow!": all business, she leans out over the rail to call it down
      // (v5, the owner: "Make their body or hands move as they speak") she sways as she sighs his name; she rocks a
      // little on "my love as deep"; "too rash, too unadvised, too sudden" is counted off with three tips of her head
      // and shoulders, one way and the other; she tips out at him to forbid the moon
      lean: leans({ pitch: 11 * ky(f, [[c11 - 6, 0], [c11 + 6, 1], [endOf("C11"), 1], [endOf("C11") + 14, 0]]) },
        lineBody(f, "C01", { lean: 0, dip: 0, sway: 2.2, rate: 0.075 }), lineBody(f, "C05", { lean: 2, dip: 1.2, sway: 1.5, rate: 0.07 }),
        { pitch: 2.4 * beat(f, COUNT3, 3, 10), roll: 3.4 * (hit(f, COUNT3[0], 3, 12) - hit(f, COUNT3[1], 3, 12) + hit(f, COUNT3[2], 3, 12)) },
        lineBody(f, "C10", { lean: 3, dip: 2.5, sway: 0 })),
      ...(shut !== undefined ? { blink: shut } : {}),
      hide: ["vial"],
    });

    // ---------------------------------------------------------------- Romeo in the orchard
    const ro = w.actor(ROMEO);
    const runFrom = c12 - 6;
    const interview = f >= herCut && f < hisCut;
    const ruN = walkAlong(RUN_PATH, 2.8, (f - runFrom) / 30, { easeOut: 0 });      // (he runs out of sight: no stop)
    let roAt = BELOW.at.clone(), roFacing = BELOW.facing, roState: Record<string, unknown> = {};
    if (interview || f < herCut) {
      // crouched in the bushes, three-quarter to her lens, pointing up behind him at the balcony
      roFacing = yawTo(BELOW.at, wv("balcony", RO_POS)) + 0.5;
      const tk = talk("ro", f, 1);
      // the rise: crouched (sunk RISE.drop) until RISE.len frames before "sun", up by "sun" with a 3 cm overshoot
      const u = Math.min(1, Math.max(0, (f - (tSun - RISE.len)) / RISE.len)), e = u * u * (3 - 2 * u), over = u >= 1 ? 0.03 * Math.max(0, 1 - (f - tSun) / 6) * Math.sin(((f - tSun) / 6) * Math.PI) : 0;
      // (v5) the arm moves with the words: up on "east", a sag, straight up on "sun"; through her "It's midnight" it
      // wavers up there and he sways, still beaming
      const feet = BELOW.at.clone().add(V(0, -RISE.drop * (1 - e) + over, 0));
      const arm = ARM_EAST.clone().lerp(ARM_SAG, ky(f, [[tEast + 8, 0], [tSun - 12, 1]])).lerp(ARM_SUN, ky(f, [[tSun - 6, 0], [tSun, 1]]));
      const wav = ky(f, [[tSun + 6, 0], [tSun + 18, 1]]), wa = (f - tSun) * 0.17;
      arm.add(V(0.035 * wav * Math.sin(wa), 0.03 * wav * Math.cos(wa), 0));
      roState = {
        at: feet,
        hands: [reach(rel(feet, roFacing, arm.x, arm.y, arm.z), ky(f, [[tEast - 9, 0], [tEast - 1, 1]])), null],
        lean: leans(lineBody(f, "C03", { lean: 4, dip: 3, sway: 0, words: ["Juliet"] }), { roll: rock(f, tSun + 6, hisCut + 12, 1.7, 0.1, 10, 1) }),
        expr: faceAt(f, [[0, "dreamy"], [tSun - 4, "smittenOpen"]]),
        // (v5, the owner: "his mouth doesnt move when he speak in this scene": this branch never had his lip-sync)
        ...tk,
        head: talkHead("ro", f, 1, accent("pop", f, tSun)),
        lookDown: -6,
        // (v7, the owner on the v6.1 cut, f1362: "His hand should be in front not at the back": the rig draws a head on
        // top of its own figure's arms, so the raised hand was cut by his hair. That arm is drawn at its true depth.)
        armFront: [true, undefined],
      };
    } else if (f < runFrom) {
      // standing in the bushes: eyes shut, sighing her name (his own take of C08, at the same moment); then he hears
      // something, turns and looks up at the balcony
      const turnK = ky(f, [[SPLIT.open + 2, 0], [SPLIT.open + 16, 1]]);
      roFacing = THREE.MathUtils.lerp(0.25, Math.PI * 0.88, turnK);
      const sighing = f >= c08 && f < tSplitStop;
      // (v5) THE OATH, acted: both hands to his heart and a bow on "Lady"; his arm sweeps up to the moon on "yonder",
      // is drawn back and thrust at it on "swear"; when she forbids the moon it comes down slowly. (Until v4 the arm
      // stood up from the first word and dropped when the line ended. And it was his right arm, out to the right of
      // the picture: the moon hangs at the left. Now it is his left: his back is to her lens.)
      const c09 = startOf("C09"), tYon = wordAt("C09", "yonder"), swearK = ky(f, [[c09 - 6, 0], [c09 + 2, 1], [c10 + 4, 1], [c10 + 24, 0]]);
      const moonK = ky(f, [[tYon - 3, 0], [tYon + 7, 1]]), reachOut = 0.62 - 0.42 * hit(f, wordAt("C09", "swear") - 4, 5, 5);
      // (the moon hangs at the upper left of this picture and his back is to the lens: the arm goes out in the picture's
      // own plane, to the lens's left and up. Aimed at the moon itself it pointed away from the lens and stayed
      // behind his own head: the rig's arm is 0.38 m and his head is 0.5 m across)
      const toMoon = CAM.camAxes(camera).right.multiplyScalar(-Math.cos(MOON_UP)).add(V(0, Math.sin(MOON_UP), 0));
      const oath = rel(roAt, roFacing, 0.07, 0.8, 0.13).lerp(rel(roAt, roFacing, 0.155, 1.0, 0.03).addScaledVector(toMoon, reachOut), moonK);
      roState = {
        hands: sighing ? [rel(roAt, roFacing, -0.05, 0.86, 0.2), rel(roAt, roFacing, 0.05, 0.86, 0.2)]
          : swearK > 0 ? [reach(rel(roAt, roFacing, -0.07, 0.83, 0.15), swearK), reach(oath, swearK)] : [null, null],
        lean: { pitch: 7 * hit(f, c09 + 3, 5, 16) - 4 * moonK * swearK },
        expr: faceAt(f, [[0, "dreamy"], [tSplitStop, "blank"], [SPLIT.open + 14, "smitten"], [endOf("C10") + REACT, "puppy"], [c11 + 20, "smitten"]]),
        ...(sighing && saying("ju", f) ? speak(saying("ju", f)!, f, 1) : talk("ro", f, 1)),
        ...(sighing ? { blink: 1 } : {}),
        head: talkHead("ro", f, 1, accent("jolt", f, tSplitStop), sighing ? { tilt: -7 } : undefined),
        lookDown: -20 * turnK, turn: turnK > 0.5 ? 0.55 : undefined,
      };
    } else {
      roAt = ruN.at; roFacing = ruN.facing;
      // (v5) "At the hour of nine!": he throws an arm up and back at her as he runs (up over his own head it was
      // hidden behind his hat)
      // (v7, the owner, f2192: "Again his hand here should be infront": the arm at its true depth)
      roState = { pose: ruN.pose, expr: faceAt(f, [[0, "smittenOpen"]]), ...talk("ro", f, 1), turn: 0.4, armFront: [true, undefined],
        // (v7: the hand goes up BEFORE him, beside his face on the lens's side, a wave over his shoulder as he runs. Thrown up
        // and back it was behind his own head from here, whatever the drawing order.)
        hands: [reach(rel(roAt, roFacing, -0.36, 1.5, 0.4), ky(f, [[c12 - 2, 0], [c12 + 7, 1]])), null] };
    }
    ro.set({
      ...standing(roAt, roFacing, f, 1),
      ...roState,
      at: (roState.at as THREE.Vector3 | undefined) ?? roAt,
      hide: ["letter"],
      visible: !(f >= runFrom && ruN.arrived),
    });
    w.update();

    // ---------------------------------------------------------------- (v7) the emotes of emo.ts
    const emotes: React.ReactNode[] = [];
    // 5: sparkles round her head while she sighs her famous line (gone with the cut to him)
    if (EMO.c01Sparkle && f < herCut) emotes.push(h(Sparkles, { key: "sp", f, from: startOf("C01") + 6, to: herCut, head: VERBS.headPx(w, ju) }));
    // 6: the sunburst behind him: it bursts in on "sun" (with the snap zoom) and switches off on 半夜
    if (EMO.c03Sun && interview) {
      const off = wordAt("C04", "半夜"), k = ky(f, [[tSun - 2, 0], [tSun + 3, 1.08], [tSun + 7, 1], [off, 1], [off + 5, 0]]);
      if (k > 0) {
        const hd = ro.headWorld(), cam = (w.camera as THREE.PerspectiveCamera).position.clone();
        const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(cam, hd, V(0, 1, 0)));
        w.prop("sunBurst").put(hd.clone().addScaledVector(cam.clone().sub(hd).normalize(), -SUN_BACK), { rot: q, amount: k, t: f / 30 });
      }
    }
    // 8: steam off the top of her head, both sides, as "marriage" lands
    if (EMO.c11Steam && f >= tMar && f < tMar + 20) {
      const hp = VERBS.headPx(w, ju);
      // (two puffs each side, the second pair a few frames after the first; sized to her head: in the snap zoom it is
      // about 140 px round, and puffs a seventh of that did not read)
      for (const s of [-1, 1]) for (const d of [0, 6]) emotes.push(h(Huff, { key: `st${s}${d}`, f, at: tMar + STEAM.at + d + (s > 0 ? 2 : 0), x: hp.x + s * 0.58 * hp.r, y: hp.y - 0.85 * hp.r, dir: [0.5 * s, -1], r: (d ? 0.26 : 0.34) * hp.r }));
    }
    // 9: the dust cloud where he stood: he is off before she has finished, and the lens tilts down onto it
    if (EMO.c12Dust && f >= runFrom && f < runFrom + 40) {
      const g0 = w.project(BELOW.at.clone().add(V(0, 0.18, 0))), right = CAM.camAxes(camera).right;
      const g1 = w.project(BELOW.at.clone().add(V(0, 0.18, 0)).add(right)), gr = w.project(RUN_PATH[1].clone().add(V(0, 0.18, 0)));
      if (g0.front) emotes.push(h(DustPuff, { key: "dust", f, at: runFrom + 2, x: g0.x, y: g0.y, s: Math.hypot(g1.x - g0.x, g1.y - g0.y), dir: [gr.x - g0.x, gr.y - g0.y] }));
    }
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
    // --- her hearts in her close (v4, the owner: "heart coming out their eyes"): as "my love as deep" ends small hearts
    // float up out of her eyes, through the reporter's "you met three hours ago?"; when that lands every heart in the
    // air bursts
    if (f >= endOf("C05") + 4 && f < caughtAt + 5 && f >= hisCut && f < c08)
      // (smaller and not as far: this close her head is wider than the frame, and full-size hearts sailed up through
      // the REC row)
      overlays = h(EyeHearts, { f, eyes: eyesPx(w, ju), from: endOf("C05") + 5, to: caughtAt, pop: caughtAt, dir: [0.12, -1], size: 0.75, far: 0.66 });
    const namesUp = f >= c08 && f < endOf("C08") + 8;
    if (emotes.length) overlays = frag(overlays ?? null, ...emotes);
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

