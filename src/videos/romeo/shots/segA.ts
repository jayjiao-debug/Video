// SCENE A · Sunday dawn, the sycamore grove (还不认识朱丽叶). The cold open: frame 0 is Romeo hugging the big sycamore and
// bawling among his crumpled poems; she asks who he is crying over (she knows the story: Juliet), and he stops dead:
// "…Who is Juliet?" The title lands in the gap. He bursts into sobs again for Rosaline, his blue tab slams in; he pushes
// a letter at her ("Good friend, bear her this!"); she gives her rule: 我只拍，不插手 (the tally stamps 插手 0).
// CAMERA PLAN (one take, she stands still):
//   1  f0-A02      medium close, 3/4 behind him at the tree, poems on the grass; still            (the odd action, no greeting)
//   2  A02 "Who"   SNAP ZOOM on his blank face, lands on the word (fov x0.7 in 5 frames)          (the punch word)
//   3  title gap   hold the blank face; the letter title drops in under it                        (the title inside the cold open)
//   4  A03         eases back out as he wails again, arm flung up                                (he takes the frame back)
//   5  A04         he turns and comes at the lens with the letter; she steps back a little        (something changes hands)
//   6  A05         hold: the letter droops                                                         (her rule lands)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam, punchIn } from "../cam";
import { V, standing } from "./common";
import { ROMEO, ROMEO_CRY } from "../people";
import { NameTab } from "../hud/index";
import { P, spot, camAt, ck, faceAt, talk, wordAt, startOf, endOf, L, ky, accent, headBox, rel, REACT } from "./kit";
import { h } from "./h";

const S = seg("A");
const TREE = spot("grove", "romeoTree"), TALK = spot("grove", "romeoTalk");
/** the trunk he hugs: front face z -0.85, radius ~0.35 (centre z -1.2) */
const TRUNK = P("grove", 0, 0, -1.2);

export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("grove");
    const tWho = wordAt("A02", "Who"), a03 = startOf("A03"), a04 = startOf("A04"), a05 = startOf("A05");
    // --- the camera
    let camera = povCam(f, [
      camAt("grove", "open", S.from),
      camAt("grove", "open", a04 - 4),
      ck("grove", a04 + 14, [0.62, 1.47, 1.95], [0.05, 1.12, -0.5], 50),
    ], { mood: "calm", amp: 0.6 });
    camera = punchIn(camera, f, tWho - 5, { k: 0.8, len: 5, off: a03 + 6 });
    w.setCamera(camera);
    // --- Romeo: at the tree (hugging, wailing) -> turned to the lens, blank -> wailing -> at her with the letter
    const turnK = ky(f, [[tWho - 10, 0], [tWho - 2, 1]]);
    const walkK = ky(f, [[a04 - 6, 0], [a04 + 10, 1]]);
    const at = TREE.at.clone().add(V(0, 0, 0.08)).lerp(TALK.at, walkK);
    const facing = THREE.MathUtils.lerp(Math.PI * 0.8, 0.35, Math.max(turnK * 0.8, walkK)) ;
    const cry = f < a04;
    const r = w.actor(cry ? ROMEO_CRY : ROMEO);
    const hugging = f < tWho - 4;
    const flung = f >= a03 && f < a04 - 4;
    const offering = f >= a04 - 2;
    const expr = faceAt(f, [[0, "wail"], [tWho - 8, "blank"], [a03 - 2, "wail"], [a04 - 2, "puppy"], [endOf("A05") + REACT, "hollow"]]);
    // the sob: while he wails his shoulders heave and his head dips, two and a half times a second (taste review of v1:
    // frames 0 and 60 looked the same)
    const wailing = f < tWho - 8 || (f >= a03 - 2 && f < a04 - 2);
    const sob = wailing ? Math.sin(f * 0.26) ** 2 : 0;
    const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = hugging
      ? [TRUNK.clone().add(V(0.36, 1.12, 0.3)), TRUNK.clone().add(V(-0.3, 1.05, 0.32))]
      : offering ? [rel(at, facing, -0.12, 1.02 - 0.18 * ky(f, [[endOf("A05"), 0], [endOf("A05") + 12, 1]]), 0.42), null] : [null, null];
    r.set({
      ...standing(at, facing, f, 1),
      pose: flung ? { kind: "cheer", t: (f - a03) / 30 } : hands[0] || hands[1] ? { kind: "hold", t: f / 30 } : { kind: "idle", t: f / 30 },
      hands, expr, ...talk("ro", f, 1),
      head: accent("jolt", f, tWho - 6) ?? (sob > 0 ? { dy: -0.05 * sob, squash: 0.05 * sob } : undefined),
      lean: sob > 0 ? { pitch: 4 * sob } : undefined,
      lookDown: hugging ? -6 : 0, hide: offering ? [] : ["letter"],
      // at the tree he keeps his back half to her (the rig would turn him to the lens); his face shows in three-quarter
      turn: hugging ? 0.42 : undefined,
    });
    w.update();
    // --- his tab slams in during his wail (the first good look at him)
    const tabFrom = a03 + 8;
    const box = headBox(w, r);
    const overlays = f >= tabFrom && f < tabFrom + 150 ? h(NameTab, { f, from: tabFrom, who: "romeo", box }) : undefined;
    return { camera, overlays };
  },
};
