// THE STORY of 采访月老的一天 (film "yuelao", script v1 of 26 Nov 2026: scripts/yuelao/voice/make_lines.py): the timeline
// over the generated voice.ts / captions.ts (python3 scripts/kit/day/gen_timing.py --film yuelao [--placeholder |
// <voice_timing.json>]) through the kit's day engine (src/kit/day/README.md). Shots never copy a number.
// THE FILM'S CLOCK: his year-end review day, 08:00 in heaven to 23:00 on a pavement in the mortal world.
import * as VOICE from "./voice";
import { cap, capWord, lineNum, type CaptionGroup } from "./captions";
import { L } from "../../kit/film/lang";
import { makeTimeline, makeLens } from "../../kit/day/timeline";
import type { DayPose, DaySegment } from "../../kit/day/types";
import type { World } from "./world";
import { PLACES, type Place } from "./places";

export type Speaker = VOICE.Speaker;
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
export type { Place };
export { PLACES };
export const FPS = 30;
export const W = 1080, H = 1920;
export const { lensTan, lensFov } = makeLens(H);
export type Pose = DayPose;
export type Segment = DaySegment<World, Pose>;

/** minutes from 00:00 of each scene's first frame */
export const CLOCK_MIN: Record<SceneId, number> = {
  A: 8 * 60, B: 8 * 60 + 10, C: 9 * 60 + 30, D: 11 * 60, E: 14 * 60, F: 19 * 60, G: 22 * 60, H: 22 * 60 + 40, I: 22 * 60 + 55, J: 23 * 60,
};
export const T = makeTimeline<Speaker, SceneId, Place, CaptionGroup, Pose>({
  voice: VOICE, captions: { cap, capWord, lineNum }, L, fps: FPS,
  what: {
    A: "the cold open: stuck in the tangle; the lead card; she is the inspector; the title", B: "the bureau: 007, the numbers, one couple short",
    C: "the famous case files", D: "the order from the temple: 林小满", E: "attempt one: the ankle, the swipes",
    F: "attempt two: the blind date", G: "rock bottom: the thread round her lens; the rider passes", H: "the turn and the quiet scene (no effects)",
    I: "the fix: the thread that was already there", J: "the button: yours was tied long ago",
  },
  clock: { min: CLOCK_MIN, digits: { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true, I: true, J: true } },
});
export const {
  SCENES, SCENE, SCENE_STAMP, SCENE_TIME, LINES, line, lineId, lineAt, lineNo, QUOTES, quote, TOTAL, SEGMENTS, segmentAt, seg,
  CARDS, cardAt, TITLE_BLOCK, registerHud, huds,
} = T;
