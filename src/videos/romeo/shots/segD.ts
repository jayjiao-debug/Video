// SCENE D · Monday afternoon, Friar Laurence's cell (认识第1天). The Friar sorts herbs at his bench; Romeo bursts in,
// glowing; "Wast thou with Rosaline?" "I have forgot that name." and he shuffles in between the Friar and the lens; the
// Friar leans round him to tell HER: young men love with their eyes. Her question (and you'll still marry them?); "they
// stumble that run fast" and on "fast" Juliet sprints in through the bright doorway and skids to a stop. The two clasp
// hands in front of him; she steps back wide: three small figures in the doorway light (no blessing close-up).
// CAMERA PLAN:
//   1  D01      the bench framing: the Friar at work, Romeo bursts in from the left                  (someone arrives)
//   2  D02      hold: Romeo shuffles in front of the Friar                                           (the joke is the block)
//   3  D03      hold as the Friar leans round him; SNAP ZOOM onto the Friar on "eyes"                 (the punch word)
//   4  D04      ease back                                                                              (her question)
//   5  D05      on "fast" a small pan left to catch Juliet skidding in                                 (someone arrives)
//   6  D06      the step back wide: three small figures in the doorway light                          (the wedding, kept small)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam, type CamKey } from "../cam";
import { V, standing, yawTo, walkAlong } from "./common";
import { ROMEO, JULIET, FRIAR } from "../people";
import { FriarBanner } from "../hud/index";
import { P, wv, spot, camAt, faceAt, talk, wordAt, startOf, endOf, ky, accent, headBox, rel, REACT } from "./kit";
import { h } from "./h";
import { reach, hit, beat, span, rock, strokes, lineBody, leans, talkHead } from "./gest";

const S = seg("D");
const BENCH = spot("cell", "friarBench"), DOOR = spot("cell", "door");
const BENCH_CAM = camAt("cell", "bench", 0), WIDE_CAM = camAt("cell", "wide", 0);
/** where Romeo stops after bursting in, and where he shuffles to (in the line from her lens to the Friar) */
const RO_IN = P("cell", -0.45, 0, -1.15), RO_BLOCK = P("cell", 0.25, 0, -0.72);
/** the Friar's step to lean round Romeo */
const FR_LEAN = P("cell", 1.0, 0, -1.3);
/** Juliet's sprint: in through the doorway, a skid, stops beside Romeo */
const JU_PATH = [P("cell", -2.45, 0, -1.1), P("cell", -1.5, 0, -0.98), P("cell", -0.42, 0, -0.92)];
/** THE WEDDING (restaged after the taste review of v1: Juliet's face was hidden behind his head, the writing desk stood
 *  between them and the Friar like an altar, a third of the frame was floor and beams): side by side across the frame,
 *  turned to each other, hands clasped between them; the Friar steps round behind, between them; all three 0.2 m left of
 *  the first restage, whose groom put his head through the inkpot and candle on the writing desk (clearance, f2786) */
const JU_WED = P("cell", -0.28, 0, -0.82), RO_WED = P("cell", 0.44, 0, -0.78), FR_WED = P("cell", 0.08, 0, -1.42);
const COUPLE = P("cell", 0.08, 0, -0.8), COUPLE_FACING = yawTo(COUPLE, FR_LEAN);
/** (v6, the owner on the v5 cut: "Make their hands touch") at the wedding the two stand half turned to each other and
 *  half to her lens, so their inner shoulders face each other and the inner hands, his right and her left, meet between
 *  them, a hair apart so they read as two hands joined. (Until v5 they stood square to each other, 0.8 m apart: each
 *  hand reached straight ahead and stopped 14 cm short of the other, the rig's arm being 0.31 m. They stand 0.72 m apart
 *  now, which still leaves the Friar's face between their heads while he speaks.) */
const OPEN_TO = P("cell", 0.08, 0, 2.9), OPEN = 0.6;
const wedFacing = (me: THREE.Vector3, other: THREE.Vector3) => yawTo(me, other.clone().lerp(OPEN_TO, OPEN));
/** the Friar's free hand while he leans round Romeo (he stands at FR_LEAN, his head 0.15 m to the right of his feet,
 *  at x 1.15): on his chest, and up beside his eye, on Romeo's side of his head, never in front of his face. (Points
 *  of the cell, not of his own frame: his feet point along the wall there and his body is turned to the lens.) */
const FR_CHEST = P("cell", 1.08, 0.88, -1.16), FR_EYE = P("cell", 0.79, 1.24, -1.22);
/** the step back for the wedding: back by the front wall, the three of them in one frame, small (no blessing close-up) */
const WED_WIDE = { pos: wv("cell", [0.08, 1.55, 2.9]), look: wv("cell", [0.08, 1.3, -1.0]), fov: 46 };

export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("cell");
    w.set.param("day", "monday");
    const d01 = startOf("D01"), d02 = startOf("D02"), d03 = startOf("D03"), d05 = startOf("D05"), d06 = startOf("D06");
    const tEyes = wordAt("D03", "eyes"), tFast = wordAt("D05", "fast");
    const tHearts = wordAt("D03", "hearts"), tName = wordAt("D02", "name");
    // ---------------------------------------------------------------- the camera
    const k = (fr: number, c: CamKey, o: Partial<CamKey> = {}): CamKey => ({ ...c, f: fr, ...o });
    const benchLook = BENCH_CAM.look, frHead = wv("cell", [1.0, 1.22, -1.3]);
    const camera = povCam(f, [
      k(S.from, BENCH_CAM),
      k(tEyes - 5, BENCH_CAM),
      k(tEyes, BENCH_CAM, { look: frHead, fov: 31 }),                                   // SNAP ZOOM onto the Friar on "eyes"
      k(endOf("D03") + 6, BENCH_CAM, { look: frHead, fov: 31 }),
      k(startOf("D04") + 14, BENCH_CAM),                                                // eases back for her question
      k(tFast - 6, BENCH_CAM),
      k(tFast + 12, BENCH_CAM, { look: wv("cell", [-0.12, 1.1, -0.9]) }),              // a small pan left: Juliet skids in
      k(d06 + 16, BENCH_CAM, { look: wv("cell", [-0.12, 1.1, -0.9]) }),
      k(d06 + 62, WIDE_CAM, WED_WIDE),                                                  // she steps back wide: the three of them
      k(S.to, WIDE_CAM, WED_WIDE),
    ], { mood: "calm", amp: 0.5 });
    w.setCamera(camera);

    // ---------------------------------------------------------------- the Friar
    const fr = w.actor(FRIAR);
    const leanK = ky(f, [[d03 - 6, 0], [d03 + 12, 1], [endOf("D03") + 10, 1], [endOf("D03") + 26, 0.6]]);
    const frWed = walkAlong([FR_LEAN, FR_WED], 0.9, (f - (d06 + 6)) / 30, { endFacing: yawTo(FR_WED, COUPLE) });
    const frAt = f < d06 + 6 ? BENCH.at.clone().lerp(FR_LEAN, ky(f, [[d03 - 6, 0], [d03 + 12, 1]])) : frWed.at;
    const roHere = f >= S.from + 10;
    const toLens = yawTo(frAt, wv("cell", BENCH_CAM.pos as number[]));
    const frFacing = f < S.from + 12 ? BENCH.facing
      : f < d03 - 6 ? yawTo(frAt, RO_IN)
      : f < d06 ? toLens
      : f < d06 + 6 ? THREE.MathUtils.lerp(toLens, yawTo(frAt, COUPLE), ky(f, [[d06, 0], [d06 + 6, 0.5]])) : frWed.facing;
    // (v5, the owner: "Make their body or hands move as they speak") "not truly in their HEARTS, but in their EYES":
    // his free hand (the basket hangs from the other) taps his chest on "hearts" and comes up beside his eye on
    // "eyes", where the snap zoom finds it; he dips on each phrase; "Wisely and slow" is two slow nods of his whole
    // body; on "violent ends" he shakes his head
    const frK = ky(f, [[tHearts - 10, 0], [tHearts - 1, 1], [endOf("D03") + 6, 1], [endOf("D03") + 22, 0]]);
    const frHand = FR_CHEST.clone().add(V(0, 0, -0.03 * hit(f, tHearts)))
      .lerp(FR_EYE.clone().add(V(0.03 * beat(f, [tEyes, tEyes + 9], 2, 6), 0, 0)), ky(f, [[tEyes - 9, 0], [tEyes - 1, 1]]));
    fr.set({
      ...standing(frAt, frFacing, f, 3),
      pose: f >= d06 + 6 && frWed.moving ? frWed.pose : { kind: "hold", t: f / 30 },
      hands: [reach(frHand, frK), null],
      expr: faceAt(f, [[0, "weary"], [d01 - 4, "dry"], [d03 - 2, "warn"], [endOf("D04") + REACT, "weary"], [tFast + REACT, "worried"], [d06 - 2, "warn"], [endOf("D06") + REACT, "weary"]]),
      ...talk("fr", f, 3),
      lean: leans({ roll: 9 * leanK, pitch: 4 * leanK }, { pitch: 2 * beat(f, strokes("D03", "hearts")) }, lineBody(f, "D05", { lean: 2, dip: 3, sway: 0, words: ["slow"] })),
      head: talkHead("fr", f, 3, accent("nod", f, tEyes), accent("shake", f, wordAt("D06", "ends") - 4, { amp: 0.8 })),
      gaze: f >= d03 && f < endOf("D03") + 6 ? -0.5 : 0,
    });

    // ---------------------------------------------------------------- Romeo: bursts in, glowing; blocks the lens; the wedding
    const ro = w.actor(ROMEO);
    const inLeg = walkAlong([DOOR.at.clone().add(V(-0.3, 0, -0.2)), P("cell", -1.6, 0, -1.0), RO_IN], 3.0, (f - (S.from + 2)) / 30, { endFacing: yawTo(RO_IN, BENCH.at), easeIn: 0 });      // (he comes in running)
    const blockLeg = walkAlong([RO_IN, RO_BLOCK], 0.9, (f - (d02 - 3)) / 30, { endFacing: yawTo(RO_BLOCK, wv("cell", BENCH_CAM.pos as number[])) });
    // he takes the right of the pair and she the left, so their two short walks never cross
    const roW = RO_WED;
    const wedLeg = walkAlong([RO_BLOCK, roW], 0.9, (f - d06) / 30, { endFacing: wedFacing(RO_WED, JU_WED) });
    const leg = f < d02 - 3 ? inLeg : f < d06 ? blockLeg : wedLeg;
    // after Juliet arrives he turns to her
    const roFacing = f >= tFast + 8 && f < d06 ? THREE.MathUtils.lerp(leg.facing, yawTo(leg.at, JU_PATH[2]), ky(f, [[tFast + 8, 0], [tFast + 18, 1]])) : leg.facing;
    const meet = P("cell", 0.08, 0.66, -0.68), meetRo = meet.clone().add(V(0.016, 0.008, 0.008)), meetJu = meet.clone().add(V(-0.016, -0.004, 0));
    const clasped = f >= d06 + 18;
    const flick = ky(f, [[tName - 3, 0], [tName + 1, 1]]), swoon = span(f, d06 + 44, S.to + 40, 16, 1) * (2 + 1.5 * Math.sin((f - d06) * 0.08));
    ro.set({
      ...standing(leg.at, roFacing, f, 1),
      pose: leg.moving ? leg.pose : { kind: "idle", t: f / 30 },
      // (v5) "I have forgot that NAME": he brushes it away past his shoulder, on "name" (he shuffles into the frame
      // through the first half of the line; the hand's place is given across the picture, not in his own frame: his
      // feet point along the wall, his body is turned to the lens); then he rocks on his heels, beaming, through the
      // Friar's sermon; at the wedding the two sway toward each other
      hands: clasped ? [meetRo, null] : [reach(leg.at.clone().add(V(-0.14 - 0.1 * flick, 0.9 + 0.14 * flick, 0.25 - 0.05 * flick)), ky(f, [[tName - 12, 0], [tName - 3, 1], [tName + 12, 1], [tName + 26, 0]])), null],
      lean: { roll: rock(f, endOf("D02") + 12, tFast + 4, 2.4, 0.14), pitch: swoon },
      expr: faceAt(f, [[0, "puppy"], [d02 - 2, "blank"], [endOf("D02") + 8, "puppy"], [tFast + 10, "dreamy"]]),   // eyes open until she runs in
      ...talk("ro", f, 1),
      head: talkHead("ro", f, 1, accent("pop", f, tFast + 10)),
      visible: roHere,
      hide: ["letter"],
    });

    // ---------------------------------------------------------------- Juliet: sprints in on "fast", skids, the wedding
    const ju = w.actor(JULIET);
    const runFrom = tFast - 12;
    const juLeg = walkAlong(JU_PATH, 4.2, (f - runFrom) / 30, { endFacing: yawTo(JU_PATH[2], RO_BLOCK), easeIn: 0 });      // (she comes in at a sprint)
    const juW = JU_WED;
    const juWed = walkAlong([JU_PATH[2], juW], 0.9, (f - d06) / 30, { endFacing: wedFacing(JU_WED, RO_WED) });
    const jl = f < d06 ? juLeg : juWed;
    const arriveAt = runFrom + Math.round((juLeg.left + juLeg.d) / 4.2 * 30);
    const skid = ky(f, [[arriveAt - 4, 0], [arriveAt, 1], [arriveAt + 8, 0]]);
    ju.set({
      ...standing(jl.at.clone().add(rel(V(), jl.facing, 0, 0, 0.12 * skid)), jl.facing, f, 2),
      pose: jl.moving ? jl.pose : { kind: "idle", t: f / 30 },
      hands: clasped ? [null, meetJu] : [null, null],
      expr: faceAt(f, [[0, "bossy"], [arriveAt + 6, "sure"], [d06 + 18, "swoon"]]),
      lean: { pitch: -12 * skid + swoon },
      visible: f >= runFrom,
      hide: ["vial"],
    });
    w.update();

    // ---------------------------------------------------------------- his banner travels with him
    // on his first good look, and gone before Romeo shuffles in front of him (taste review of v1, f2340: it sat on
    // Romeo's hat and named the wrong man)
    const bannerFrom = S.from + 8, bannerHold = d02 + 4 - bannerFrom;
    const overlays = f >= bannerFrom && f < bannerFrom + bannerHold ? h(FriarBanner, { f, from: bannerFrom, box: headBox(w, fr), side: "right", hold: bannerHold }) : undefined;
    return { camera, overlays };
  },
};
