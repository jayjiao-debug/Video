// SCENE G · Wednesday noon (认识第3天). It opens on the letter: the messenger's house in Verona boarded up for the
// plague, the Friar's letter standing on the sill behind the planks as they go up one by one, under the proclamation
// (送信人被瘟疫封了门。信没出城。). Cut to Mantua: a bare street in flat white noon light, a rider leaving at the far end,
// Romeo small in frame from a little above. Her whisper (the news that got here first: Juliet is dead). "Then I defy
// you, stars!" He walks up to her lens: no letters from the Friar? "…No." "No matter." He turns away and a small dark
// bottle goes into his coat. "Wait, she's not—" He is already walking off. Her plain words; from G07 on every effect is
// gone, and she does not follow at once.
// CAMERA PLAN:
//   1  card     the boarded window straight on; the planks go up over the letter                       (the letter is stuck)
//   2  G01      CUT to Mantua from a little above: Romeo small, the rider leaving; her whisper lean     (the wrong news)
//   3  G02      hold                                                                                   (his defiance)
//   4  G03      he walks up to her; the lens only tilts down to keep him                               (he comes to her)
//   5  G04-G05  hold: the dark bottle goes into his coat                                               (something changes hands)
//   6  G06-G07  hold as he walks away; she does not follow                                             (he leaves)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam, type CamKey } from "../cam";
import { standing, yawTo, walkAlong } from "./common";
import { ROMEO_BOTTLE } from "../people";
import { whisperLean } from "../whisper";
import { P, wv, spot, camAt, faceAt, talk, wordAt, startOf, endOf, ky, accent, rel, soft, REACT } from "./kit";
import { G_CARD } from "../fx";

const S = seg("G");
const FAR = spot("mantua", "romeoFar"), LENS = spot("mantua", "romeoLens"), RIDER = spot("mantua", "rider");
/** the rider on the right of the street, clear of Romeo's feather (taste review of v1: at the stock mark, x -1, the
 *  horse and rider slid along the top of his feather all through the whisper) */
const RIDER_AT = P("mantua", 1.1, 0, -9.0);
/** the cut from the boarded window to Mantua: just before her first word */
export const G_CUT = startOf("G01") - 7;

export const SEG: Segment = {
  id: "G", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    return f < G_CUT ? windowShot(w, f) : mantua(w, f);
  },
};

// ------------------------------------------------------------------------------------------- the boarded window
function windowShot(w: Parameters<Segment["pose"]>[0], f: number) {
  w.setPlace("street");
  w.set.param("light", "day");
  w.set.param("boards", ky(f, [[G_CARD.from + 10, 0], [G_CARD.to - 16, 1]]));
  const camera = povCam(f, [camAt("street", "window", S.from), { ...camAt("street", "window", G_CUT), fov: 37 }], { mood: "calm", amp: 0.3 });
  w.setCamera(camera);
  w.prop("letterSealed").put(P("street", 2.47, 0.9, -0.2), { stand: true, rot: -Math.PI / 2 });
  w.update();
  return { camera };
}

// ---------------------------------------------------------------------------------------------------- Mantua
function mantua(w: Parameters<Segment["pose"]>[0], f: number) {
  w.setPlace("mantua");
  const g02 = startOf("G02"), g03 = startOf("G03"), g05 = startOf("G05"), tStars = wordAt("G02", "stars");
  const walkIn = endOf("G02") + 2, turnAway = g05 + 2, walkOff = endOf("G05") + 2;
  const ABOVE = camAt("mantua", "above", 0);
  const inAt = (g: number) => walkAlong([FAR.at, LENS.at], 1.5, (g - walkIn) / 30, { endFacing: LENS.facing }), inLeg = inAt(f);
  // ---------------------------------------------------------------- the camera: from a little above; it only tilts to keep him
  const k = (fr: number, look: number[], fov = ABOVE.fov): CamKey => ({ ...ABOVE, f: fr, look: wv("mantua", look), fov });
  let camera = povCam(f, [
    k(G_CUT, [0, 0.9, -4.0]),
    k(walkIn + 6, [0, 0.9, -4.0]),
    k(walkIn + Math.round((inLeg.d + inLeg.left) / 1.5 * 30) + 4, [0, 0.95, -0.7], 44),
    k(walkOff + 10, [0, 0.95, -0.7], 44),
    k(S.to, [0.05, 0.9, -2.6], 42),
  ], { mood: "calm", amp: 0.35 });
  camera = whisperLean(f, camera);
  w.setCamera(camera);
  // ---------------------------------------------------------------- the rider who brought the news, leaving at the far end
  w.prop("horseRider").put(RIDER_AT, { rot: RIDER.facing, t: f / 30, go: ky(f, [[G_CUT, 0.15], [g02 + 30, 1]]) });
  // ---------------------------------------------------------------- Romeo
  const ro = w.actor(ROMEO_BOTTLE);
  const outLeg = walkAlong([LENS.at, P("mantua", 0.35, 0, -4.2), P("mantua", 0.5, 0, -8.0)], 1.0, (f - walkOff) / 30, { easeOut: 0 });      // (he walks out of sight)
  const leaving = f >= walkOff;
  const turnK = ky(f, [[turnAway, 0], [turnAway + 10, 1]]);
  const at = leaving ? outLeg.at : f >= walkIn ? inLeg.at : FAR.at;
  const facing = leaving ? outLeg.facing : f >= walkIn ? (inLeg.arrived ? THREE.MathUtils.lerp(LENS.facing, Math.PI * 0.94, turnK) : inLeg.facing) : FAR.facing;
  const fistAt = (g: number) => g >= tStars - 6 && g < endOf("G02") + 4, fist = fistAt(f);
  // the bottle: in his right hand in front of him on "No matter" (still facing her lens, so it reads), then into his
  // coat as he turns away
  const pocket = ky(f, [[turnAway + 6, 0], [turnAway + 16, 1]]);
  const shownAt = (g: number) => g >= g05 - 4 && g < turnAway + 18, bottleShown = shownAt(f);
  // where he looks (the head's pitch): down at the news, up with his fist, up at her lens once he has reached it, down at
  // the bottle, and a little down from there as he turns away and goes. A rule of the frame, so each change of look took
  // ONE frame (12 to 26 degrees, seven times in this scene; the one as he reaches the lens, close up, is the one that
  // showed): soft() makes each a move of seven frames. (From the bottle his head went UP to her lens, with his back
  // turning to her, and down again as he left: now it leaves the bottle once.)
  const look = (g: number) => (g < g02 - 4 ? 18 : fistAt(g) ? -14 : !inAt(g).arrived ? 6 : g < g05 - 4 ? -10 : g < turnAway + 4 ? 16 : 6);
  ro.set({
    ...standing(at, facing, f, 1),
    pose: (leaving || (f >= walkIn && !inLeg.arrived)) && (leaving ? outLeg.moving : inLeg.moving) ? (leaving ? outLeg.pose : inLeg.pose) : { kind: bottleShown ? "hold" : "idle", t: f / 30 },
    hands: fist ? [rel(at, facing, -0.62, 1.75, 0.3), null] : bottleShown ? [rel(at, facing, -0.16, 0.8 + 0.1 * pocket, 0.24 - 0.12 * pocket), null] : [null, null],
    expr: faceAt(f, [[0, "hollow"], [tStars - 8, "pained"], [endOf("G02") + 8, "hollow"], [g03 - 2, "worried"], [endOf("G04") + REACT, "hollow"]]),
    ...talk("ro", f, 1),
    lookDown: soft(f, look),
    head: accent("jolt", f, tStars) ?? undefined,
    hide: bottleShown ? ["letter"] : ["letter", "darkBottle"],
    visible: !(leaving && outLeg.arrived),
  });
  w.update();
  return { camera };
}
