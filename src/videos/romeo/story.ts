// THE STORY of 采访罗密欧与朱丽叶 (script v2, 22 Nov 2026): the timeline over the generated voice.ts / captions.ts
// (python3 scripts/kit/day/gen_timing.py --film romeo [--placeholder | <voice_timing.json>]) through the kit's day engine
// (src/kit/day/README.md). Shots never copy a number: they look every beat up here.
import * as VOICE from "./voice";
import { cap, capWord, lineNum, type CaptionGroup } from "./captions";
import { L } from "../../kit/film/lang";
import { makeTimeline, makeLens } from "../../kit/day/timeline";
import type { DayPose, DaySegment } from "../../kit/day/types";
import type { World } from "./world";
import { PLACES, type Place } from "./places";

export type Speaker = VOICE.Speaker;
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export type { Place };
export { PLACES };
export const FPS = 30;
export const W = 1080, H = 1920;
export const { lensTan, lensFov } = makeLens(H);
export type Pose = DayPose;
export type Segment = DaySegment<World, Pose>;

export const T = makeTimeline<Speaker, SceneId, Place, CaptionGroup, Pose>({
  voice: VOICE, captions: { cap, capWord, lineNum }, L, fps: FPS,
  what: {
    A: "Sunday dawn, the grove: crying for Rosaline", B: "Sunday night, the feast: love at first sight", C: "the balcony and the orchard",
    D: "Monday, the Friar's cell: the wedding", E: "Monday dusk, the street: the turn", F: "Tuesday, the cell and her room: the potion",
    G: "Wednesday, Mantua: the wrong news", H: "Thursday before dawn, the tomb: the quiet scene", I: "the shard: the new ending",
  },
  // HER CAMERA'S TIMESTAMP: the film's clock is how long they have known each other (the REC label word, no digits).
  // min = minutes from Sunday 00:00 (dawn 05:30 ... Thursday 03:35), kept for the battery's drain.
  clock: {
    min: { A: 330, B: 1260, C: 1420, D: 2340, E: 2550, F: 3480, G: 5040, H: 5970, I: 5975 },
    digits: { A: false, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false },
    word: {
      A: ["还不认识朱丽叶", "hasn't met Juliet"], B: ["认识：0分钟", "known her: 0 minutes"], C: ["认识：3小时", "known her: 3 hours"],
      D: ["认识第1天", "day 1"], E: ["婚礼后一小时", "an hour after the wedding"], F: ["第2天 · 已婚 · 已分居", "day 2 · married · apart"],
      G: ["认识第3天", "day 3"], H: ["认识第4天", "day 4"], I: ["认识第4天", "day 4"],
    },
  },
});
export const {
  SCENES, SCENE, SCENE_STAMP, SCENE_TIME, LINES, line, lineId, lineAt, lineNo, QUOTES, quote, TOTAL, SEGMENTS, segmentAt, seg,
  CARDS, cardAt, TITLE_BLOCK, registerHud, huds,
} = T;
