// SCENE E · Monday dusk, an empty Verona street (婚礼后一小时). THE TURN. Romeo with his back to us in the middle of the
// street, a sword at his feet, a red cap on the stones; no body in frame. She says his name; he turns ("O, I am fortune's
// fool!") under the one slow push and runs out of frame into the alley. Her whisper over the empty street (he just
// killed Juliet's cousin), then the proclamation while nobody speaks. No effects in this scene; the music has dropped out.
// CAMERA PLAN:
//   1  E01   his back, the sword and the cap on the stones; still                     (what happened, unsaid)
//   2  E02   he turns; ONE SLOW PUSH (fov 46 -> 37)                                     (his face is the scene)
//   3  E02   he runs out of frame to the left; the lens stays                           (he leaves)
//   4  E03   her whisper on the empty street (the lean); hold for the card              (the fact)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { standing, yawTo, walkAlong } from "./common";
import { ROMEO } from "../people";
import { whisperLean } from "../whisper";
import { P, wv, spot, camAt, faceAt, talk, wordAt, startOf, endOf, ky, accent, REACT } from "./kit";

const S = seg("E");
const BACK = spot("street", "romeoBack"), SWORD = spot("street", "sword"), CAP = spot("street", "cap"), EXIT = spot("street", "exit");
/** the sword and the cap a little further up the street than the stock marks, so they sit inside the picture above
 *  the app's buttons (the stock marks fell under y 1490) and clear of his run */
const SWORD_AT = P("street", 0.45, 0, -1.75), CAP_AT = P("street", -0.55, 0, -1.55);
/** the lens tips down a little from the stock "back" view: his head a quarter down, the stones and what lies on them in frame */
const E_LOOK = wv("street", [0, 0.82, -1.5]);

export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("street");
    w.set.param("light", "dusk");
    const e01 = startOf("E01"), e02 = startOf("E02"), tFool = wordAt("E02", "fool");
    // ---------------------------------------------------------------- the camera: still, then the one slow push
    const c0 = { ...camAt("street", "back", 0), look: E_LOOK };
    let camera = povCam(f, [
      { ...c0, f: S.from },
      { ...c0, f: e02 + 2 },
      { ...c0, f: endOf("E02") + 4, fov: 37 },
      { ...c0, f: S.to, fov: 37 },
    ], { mood: "calm", amp: 0.25 });
    camera = whisperLean(f, camera);
    w.setCamera(camera);
    // ---------------------------------------------------------------- the sword and the cap where they fell
    w.prop("sword").put(SWORD_AT, { rot: SWORD.facing });
    w.prop("redCap").put(CAP_AT, { rot: CAP.facing });
    // ---------------------------------------------------------------- Romeo: his back; he turns; he runs
    const ro = w.actor(ROMEO);
    const toLens = yawTo(BACK.at, c0.pos as number[]);
    const turnK = ky(f, [[endOf("E01") + REACT, 0], [endOf("E01") + REACT + 12, 1]]);
    const runFrom = endOf("E02") - 4;
    const leg = walkAlong([BACK.at, BACK.at.clone().add(new THREE.Vector3(-0.15, 0, -0.65)), EXIT.at], 3.6, (f - runFrom) / 30, { startFacing: toLens });
    const running = f >= runFrom;
    const facing = running ? leg.facing : THREE.MathUtils.lerp(BACK.facing, toLens + 0.25, turnK);
    ro.set({
      ...standing(running ? leg.at : BACK.at, facing, f, 1),
      pose: running && leg.moving ? leg.pose : { kind: "idle", t: f / 30 },
      expr: faceAt(f, [[0, "hollow"], [tFool - 3, "pained"], [endOf("E02") + 2, "hollow"]]),
      ...talk("ro", f, 1),
      lookDown: f < e01 + 10 ? 14 : 4,
      head: accent("jolt", f, endOf("E01") + REACT) ?? undefined,
      visible: !(running && leg.arrived),
      turn: f < endOf("E01") + REACT ? 1 : undefined,
      hide: ["letter"],
    });
    w.update();
    return { camera };
  },
};
