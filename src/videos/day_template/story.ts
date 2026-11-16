// THE STARTER DAY FILM (采访某人的一天): the smallest complete film on the shared day engine (src/kit/day/README.md).
// Copy this folder (and scripts/day_template/) to start a new 采访XX的一天 film: rename, write the lines file, run
//   python3 scripts/kit/day/gen_timing.py --film <name> --placeholder        (voice.ts + captions.ts, a bring-up timing)
// then build the places (sets.ts), the cast (people.ts) and one shots/segX.ts per scene.
// Every frame comes from the timeline (makeTimeline over the generated voice.ts / captions.ts): no copied numbers.
import * as VOICE from "./voice";
import { cap, capWord, lineNum, type CaptionGroup } from "./captions";
import { L } from "../../kit/film/lang";
import { makeTimeline, makeLens } from "../../kit/day/timeline";
import type { DayPose, DaySegment } from "../../kit/day/types";
import type { World } from "./world";

export type Speaker = VOICE.Speaker;
export type SceneId = "A" | "B";
export type Place = "study";
export const FPS = 30;
export const W = 1080, H = 1920;
export const PLACES: Place[] = ["study"];
export const { lensTan, lensFov } = makeLens(H);
export type Pose = DayPose;
export type Segment = DaySegment<World, Pose>;

export const T = makeTimeline<Speaker, SceneId, Place, CaptionGroup, Pose>({
  voice: VOICE, captions: { cap, capWord, lineNum }, L, fps: FPS,
  what: { A: "the greeting at the study door; the fact card", B: "at the desk: what are you writing" },
  // THE VLOG'S CLOCK: each scene's time in minutes after the film day's midnight; the digits show where a source gives the hour
  clock: { min: { A: 6 * 60, B: 10 * 60 }, digits: { A: true, B: false } },
});
export const {
  SCENES, SCENE, SCENE_STAMP, SCENE_TIME, LINES, line, lineId, lineAt, lineNo, QUOTES, quote, TOTAL, SEGMENTS, segmentAt, seg,
  CARDS, cardAt, TITLE_BLOCK, registerHud, huds,
} = T;
