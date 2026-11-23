// THE NINE SCENES as segments (bring-up): each scene shows the stage scenes of scenes.ts (the room round her picture,
// the state of the panel, the side cast) by the line that is being said, with the lips of whoever speaks. The camera
// is the scene's resting shot with her breathing; the moves of the camera plan come scene by scene on top of this.
import React from "react";
import { line, seg, FPS, type Segment, type SceneId, type Speaker } from "../story";
import { handheld } from "../cam";
import { saying, speak } from "./common";
import { SCENES, poseScene, type Scene } from "../scenes";
import type { RigMouth } from "../../group/kit/rig3d";
import { MONA, LEONARDO, NAPOLEON, type Person } from "../people";

/** which stage scene shows from which line on (from the silent beat before that line; `at` = a share 0..1 of the line's own words instead) */
type Beat = { from: string; scene: string; at?: number; black?: boolean };
const PLAN: Record<SceneId, Beat[]> = {
  A: [{ from: "A01", scene: "s1" }],
  B: [{ from: "B04", scene: "s2" }],
  C: [{ from: "C13", scene: "s3" }],
  D: [{ from: "D20", scene: "s4a" }, { from: "D21", scene: "s4b" }, { from: "D22", scene: "s4c" }, { from: "D23", scene: "s4d" }],
  // (the trunk: black with only the REC dot, E28 to E33; the empty wall is the card under E30)
  E: [{ from: "E25", scene: "s5" }, { from: "E28", scene: "s5", black: true }, { from: "E34", scene: "s6" }],
  F: [{ from: "F35", scene: "s6" }, { from: "F35", scene: "s6b", at: 0.55 }, { from: "F36", scene: "s6c" }, { from: "F37", scene: "s6d" }, { from: "F39", scene: "s6" }],
  G: [{ from: "G43", scene: "s7" }],
  H: [{ from: "H47", scene: "s8" }],
  I: [{ from: "I53", scene: "s9" }],
};
/** the inside of the trunk: black under the subtitles (her REC lamp comes back on top with the film's own HUD) */
const BLACK = React.createElement("div", { style: { position: "absolute", inset: 0, background: "#000" } });
/** HER WAY OF TALKING (the personality sheet's first tic): on duty she talks through the smile. The lips barely move: a
 *  closed beat shows the smile itself, an open one is the rig's "pill", which her face draws as the smile with the lips
 *  just parted (acc/face.ts). After closing (scene H) her lips move like
 *  anyone's for the first time; in the button (scene I) they do not move at all. */
const DUTY: Partial<Record<RigMouth, RigMouth>> = { small: "pill", half: "pill", wide: "pill", round: "pill", tongue: "pill" };
const herMouth = (id: SceneId, m: RigMouth | undefined): RigMouth | undefined => (m === undefined ? m : id === "H" ? (m === "pill" ? "strip" : m) : id === "I" ? undefined : DUTY[m]);
const VOICES: [Speaker, Person][] = [["mo", MONA], ["le", LEONARDO], ["na", NAPOLEON]];
const beatFrame = (b: Beat) => { const l = line(b.from); return b.at === undefined ? l.preFrom : Math.round(l.from + (l.to - l.from) * b.at); };

const make = (id: SceneId): Segment => {
  const S = seg(id), beats = PLAN[id].map((b) => ({ ...b, f: beatFrame(b) }));
  return {
    id, from: S.from, to: S.to,
    enter() {}, exit() {},
    pose(w, f) {
      let b = beats[0];
      for (const x of beats) if (f >= x.f) b = x;
      const sc: Scene = SCENES[b.scene], t = f / FPS;
      const cam = poseScene(w, sc, t);
      // (the lips of whoever speaks; a figure that is not in this scene's cast speaks from off screen)
      for (const [who, p] of VOICES) {
        const on = who === "mo" ? !sc.gone : (sc.who ?? []).includes(p.name as never);
        if (!on) continue;
        const q = saying(who, f), m = q ? speak(q, f, 1).mouth : undefined;
        w.actor(p).set({ mouth: who === "mo" ? herMouth(id, m) : m });
      }
      const camera = handheld({ pos: cam.pos, look: cam.look, fov: cam.fov }, f, { mood: "calm" });
      return { camera, slate: `${id} ${b.scene}`, ...(b.black ? { overlays: BLACK } : {}) };
    },
  };
};
export const SEGS: Segment[] = (["A", "B", "C", "D", "E", "F", "G", "H", "I"] as SceneId[]).map(make);
