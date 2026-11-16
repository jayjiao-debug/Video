// 采访拿破仑的一天: the film's timeline on the shared day engine (src/kit/day/README.md). Every frame comes from the
// generated voice.ts / captions.ts (scripts/napoleon/voice/make_lines.py -> napoleon_lines.json -> gen_timing.py).
// Seven stops in life order (script_v1.md): A Arcole 1796, B the Alps 1800, C Notre-Dame 1804, D the Tuileries about
// 1805, E Russia 1812, F Waterloo 1815, G Saint Helena about 1820.
import * as VOICE from "./voice";
import { cap, capWord, lineNum, type CaptionGroup } from "./captions";
import { L } from "../../kit/film/lang";
import { makeTimeline, makeLens } from "../../kit/day/timeline";
import { clock } from "../../kit/overlay/freeze";
import type { DayPose, DaySegment } from "../../kit/day/types";
import type { World } from "./world";

export type Speaker = VOICE.Speaker;
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type Place = "arcole" | "alps" | "notredame" | "tuileries" | "russia" | "waterloo" | "helena";
export const FPS = 30;
export const W = 1080, H = 1920;
export const PLACES: Place[] = ["arcole", "alps", "notredame", "tuileries", "russia", "waterloo", "helena"];
export const { lensTan, lensFov } = makeLens(H);
export type Pose = DayPose;
export type Segment = DaySegment<World, Pose>;

export const T = makeTimeline<Speaker, SceneId, Place, CaptionGroup, Pose>({
  voice: VOICE, captions: { cap, capWord, lineNum }, L, fps: FPS,
  what: {
    A: "Arcole: hauled out of the water with the flag; his card; Plus bas; the title", B: "the Alps: the mule, the guide, the horse he orders",
    C: "Notre-Dame: he crowns himself; the mother who is not there", D: "the Tuileries: dinner in minutes; the London print; the two measures",
    E: "Russia: no order", F: "Waterloo: Peignez... Non.", G: "Saint Helena: the garden, the Code, the measuring, Plus bas",
  },
  // the vlog's clock is not a day: each stop shows its YEAR and place (the scene stamp); the minutes only order them
  clock: { min: { A: 7 * 60, B: 9 * 60, C: 11 * 60, D: 13 * 60, E: 15 * 60, F: 18 * 60, G: 20 * 60 }, digits: { A: false, B: false, C: false, D: false, E: false, F: false, G: false } },
});
export const {
  SCENES, SCENE, SCENE_STAMP, SCENE_TIME, LINES, line, lineId, lineAt, lineNo, QUOTES, quote, TOTAL, SEGMENTS, segmentAt, seg,
  CARDS, cardAt, TITLE_BLOCK, registerHud, huds,
} = T;

/** THE FREEZE under his intro card (HOLD: the voice track has the gap, A02's "after"): the picture stops 9 frames after
 *  the last word of 「Peignez-moi sur le pont.」 and holds 75 frames (2.5 s) while hud/intro.tsx builds the card */
export const FREEZE = { at: line("A02").to + 9, frames: 75 };
export const CLOCK = clock([FREEZE]);
