// SEGMENT D (STUB, WP1 + integration check), lines D01-D06, 下午: the street to the Schools, the empty benches, the lone
// clap (PLAN 7 D). The stand-in staging until WP5 writes the shot: the place of every frame (beats.ts placeAt: street,
// then schools from BEAT.D.schools); NEWTON in his gown (no quill, no nest) with the ink until her handkerchief wipes it
// off in two strokes (cam.ts wipe at BEAT.D.wipe, close beside him on STREET_CAMS.wipe; the figure swaps
// NEWTON_GOWN_INK -> NEWTON_GOWN_SMUDGE -> NEWTON_GOWN on the strokes), then NEWTON_GOWN; her mic toward him, round to
// the lens on asides 23 and 27; she claps alone (cam.ts clapHands, the mic in the clapping hand) over BEAT.D.clap.
import { SEGMENTS, type Segment, type CamPose } from "../story";
import { BEAT, placeAt } from "../beats";
import { STREET_CAMS, STAND } from "../layout";
import { NEWTON_HIDE, newtonAt, type NewtonState } from "../people";
import { wipe, noseOf, clapHands, WIPE } from "../cam";
import { standIn } from "./common";

const S = SEGMENTS[3];
const ON = BEAT.D.wipe[0], S1 = ON + WIPE.inF + Math.round(WIPE.stroke / 2), S2 = S1 + WIPE.stroke, END = ON + WIPE.inF + 2 * WIPE.stroke + WIPE.outF;
const KEYS: [number, NewtonState][] = [[S.from, "gownInk"], [S1, "gownSmudge"], [S2, "gown"]];
/** her lone claps: every 9 frames through BEAT.D.clap */
const CLAPS: number[] = [];
for (let k = BEAT.D.clap[0] + 4; k <= BEAT.D.clap[1] - 3; k += 9) CLAPS.push(k);
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {},
  exit() {},
  pose: (w, f) => {
    const nt = newtonAt(f, KEYS), wiping = f >= ON - 6 && f <= END + 6, clapping = f >= BEAT.D.clap[0] && f <= BEAT.D.clap[1];
    const camera: CamPose = wiping && placeAt(f) === "street" ? STREET_CAMS.wipe : STAND[placeAt(f)].cam;
    return standIn(w, f, {
      cam: camera, humphrey: false, newtonAs: nt, newton: { hide: NEWTON_HIDE }, mic: !clapping, slate: `D stand-in (${placeAt(f)})`,
      after: (w) => {
        const W = wiping ? wipe(camera, f, noseOf(w.actor(nt)), ON) : null;
        if (W) { w.prop("handR").put(W.hand.at, { rot: W.hand.rot, pose: "grip", scale: W.hand.scale }); w.prop("handkerchief").put(W.cloth.at, { rot: W.cloth.rot, scale: W.cloth.scale }); }
        if (clapping) {
          const H = clapHands(camera, f, CLAPS);
          w.prop("mic").put(H.mic.at, { rot: H.mic.rot }); w.prop("hand").put(H.hand.at, { rot: H.hand.rot, pose: "grip" }); w.prop("handR").put(H.handR.at, { rot: H.handR.rot, pose: "open" });
        }
      },
    });
  },
};
