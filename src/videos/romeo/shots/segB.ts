// SCENE B · Sunday night, the Capulets' feast (认识：0分钟). Her whisper over the wide hall (he crashed the enemy's ball
// for Rosaline); he stops dead at the sight of Juliet: "Did my heart love till now?"; Rosaline? "Who?" (note 失恋：一个白天).
// SWITCH to Juliet's interview across the same hall, mirrored: on tiptoe, staring back at him; her red tab slams in;
// "Go! Ask his name." (an order, pointing, eyes never leaving him); 我只拍 (the tally blinks); her whisper: he is the only
// son of her family's enemy.
// CAMERA PLAN:
//   1  B01      (v3) she comes in wide on the ball: two masked couples promenading, Romeo sulking at the left wall;
//               she walks in on him to his interview framing under her whisper (the whisper lean on top)
//   2  B02      he stops; she TILTS along his look across the hall to Juliet (fov tighter), holds, and comes back   (he looks)
//   3  B03-B04  back on him, closer: he answers without looking at her                                              (the joke is his face)
//   4  B05      HARD CUT (Jay's rapid switch) to her interview across the hall: mirrored, she looks left               (the switch)
//   5  B06      a small push as she points                                                                            (the order)
//   6  B07-B08  hold; the whisper lean on B08                                                                          (her aside)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam, punchIn } from "../cam";
import { V, standing, yawTo } from "./common";
import { ROMEO_MASK as ROMEO, JULIET } from "../people";
import { NameTab, EyeHearts, Huff, HEARTS } from "../hud/index";
import { whisperLean } from "../whisper";
import { P, spot, camAt, ck, faceAt, talk, wordAt, startOf, endOf, ky, accent, headBox, rel, eyesPx, facePx, soft, REACT } from "./kit";
import { h, frag } from "./h";
import { JU_TAB } from "../fx";
import { dancers } from "./dance";

const S = seg("B");
const RW = spot("hall", "romeoWall"), JT = spot("hall", "julietTiptoe");
/** (v3) Romeo 12 cm right of and 10 cm out from his mark: the sculpted hair (and the beret on it) went 6 cm into the
 *  column behind him */
const RO_AT = RW.at.clone().add(V(0.12, 0, 0.1));
/** (v3) the wide she comes in on: from just inside the door down the left of the nave, Romeo at the left wall a third in
 *  from the frame's left, the dancers right of the middle (the frame is narrow: from the middle of the door end he was
 *  half cut off by the app) */
const WIDE_POS: [number, number, number] = [-1.0, 1.5, 2.2], WIDE_LOOK: [number, number, number] = [-1.16, 1.15, -1.8];

export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("hall");
    const b02 = startOf("B02"), b03 = startOf("B03"), b05 = startOf("B05"), b06 = startOf("B06");
    const switched = f >= b05 - 3;          // the hard cut lands just before her question's first word
    let camera;
    if (!switched) {
      camera = povCam(f, [
        ck("hall", S.from, WIDE_POS, WIDE_LOOK, 52),
        ck("hall", S.from + 22, WIDE_POS, WIDE_LOOK, 52),
        ck("hall", b02 - 2, [-0.15, 1.5, 0.95], [-1.45, 1.25, -0.95], 48),
        // the tilt along his look to her, and back
        { ...camAt("hall", "across", b02 + 10), fov: 30 },
        { ...camAt("hall", "across", endOf("B02") - 4), fov: 30 },
        ck("hall", endOf("B02") + 8, [-0.35, 1.5, 0.55], [-1.5, 1.28, -0.9], 42),
      ], { mood: "calm", amp: 0.5 });
    } else {
      camera = povCam(f, [
        camAt("hall", "juliet", b05 - 3),
        camAt("hall", "juliet", b06 - 2),
        ck("hall", b06 + 8, [1.25, 1.5, -1.85], [2.2, 1.2, -3.2], 40),
      ], { mood: "calm", amp: 0.5 });
    }
    camera = whisperLean(f, camera);
    w.setCamera(camera);
    // --- Romeo by the wall: sulking -> struck -> distracted (looking past her at Juliet)
    const ro = w.actor(ROMEO);
    const struck = wordAt("B02", "heart");
    const roLook = f >= b02 - 8 ? yawTo(RO_AT, JT.at) : RW.facing + 0.4;
    ro.set({
      ...standing(RO_AT, roLook, f, 1),
      // his half mask on its stick, held low at the chest (never in front of the face)
      pose: { kind: "hold", t: f / 30 }, hands: [null, rel(RO_AT, roLook, 0.15, 0.72, 0.2)],
      // v3b (the owner: "give them expressive emotion showing they are in love"): struck, his eyes go big with a heart
      // in their light (smitten); asked about Rosaline he answers "Who?" with HEART EYES (the film's signature emote)
      expr: faceAt(f, [[0, "hollow"], [b02 - 8, "smitten"], [startOf("B04") - 3, "hearts"], [endOf("B04") + 18, "smitten"]]),
      ...talk("ro", f, 1), gaze: f >= b02 - 8 ? 0.5 : -0.5, lookDown: soft(f, (g) => (g < b02 - 8 ? 8 : 0), 2),      // (his head comes up with his turn to her: five frames)
      head: accent("pop", f, struck) ?? undefined, hide: ["letter"],
    });
    // --- Juliet across the hall: on tiptoe, staring back at him; pointing on her order
    const ju = w.actor(JULIET);
    const tip = 0.04 * (0.5 + 0.5 * Math.sin(f / 6));
    const pointing = f >= b06 - 4 && f < endOf("B06") + 20;
    // her huff lands inside "I only film" (v4: at its end + REACT it had two frames before the whisper took her face)
    const huff = endOf("B07") - 9;
    ju.set({
      ...standing(JT.at.clone().add(V(0, tip, 0)), yawTo(JT.at, RO_AT), f, 2),
      pose: pointing ? { kind: "point", t: (f - b06) / 30, arm: 0 } : f >= huff && f < huff + 24 ? { kind: "wave", t: (f - huff) / 30, arm: 1 } : { kind: "idle", t: f / 30 },
      expr: faceAt(f, [[0, "smitten"], [b06 - 6, "bossy"], [huff, "huffy"], [startOf("B08") + 4, "smitten"]]),
      ...talk("ju", f, 2), gaze: -0.5, hide: ["vial"],
    });
    // --- the ball goes on: two masked couples round the dance floor
    dancers(w, f, S.from);
    w.update();
    // --- her red tab slams in on the switch
    // it flaps away before the whisper lean on B08: pushed in that close her head fills the frame, the tab has no slot
    // left beside or above it and would fall back onto the 插手 tally just as it blinks on 我只拍 (stills v8, f950)
    const tabFrom = JU_TAB.from, tabHold = JU_TAB.hold;     // fx.tsx: the tally steps aside while its banner hangs
    const tab = switched && f >= tabFrom && f < tabFrom + tabHold ? h(NameTab, { key: "tab", f, from: tabFrom, who: "juliet", box: headBox(w, ju), hold: tabHold }) : null;
    // --- what comes out of their eyes (v4, the owner: "heart coming out their eyes"). His HEART EYES on "Who?": a heart
    // beats out of each and small hearts float off toward her (she is off the frame's right), all gone before the cut.
    // Hers on the other side of the cut, mirrored and smaller (no heart eyes yet: hers are on the balcony): a few
    // float off to the left, toward him, until she starts giving orders. Then her huff when the reporter will not go.
    const b04 = startOf("B04");
    const hisHearts = !switched ? h(EyeHearts, { key: "hh", f, eyes: eyesPx(w, ro), from: b04 - 2, to: Math.min(endOf("B04") + 8, b05 - 3 - HEARTS.life), dir: [0.8, -0.6] }) : null;
    const herHearts = switched ? h(EyeHearts, { key: "jh", f, eyes: eyesPx(w, ju), from: b05 + 1, to: b06 - 6 - HEARTS.life, dir: [-0.75, -0.65], beat: false, size: 0.8 }) : null;
    const nose = switched ? facePx(w, ju, -9, 17) : null, u = switched ? Math.abs(facePx(w, ju, 10, 0).x - facePx(w, ju, -10, 0).x) / 20 : 0;
    const puff = nose && nose.on > 0.5 ? h(Huff, { key: "hf", f, at: huff + 1, x: nose.x, y: nose.y, dir: [-1, -0.1], r: 5.2 * u }) : null;
    const overlays = frag(hisHearts, herHearts, puff, tab);
    return { camera, overlays };
  },
};
