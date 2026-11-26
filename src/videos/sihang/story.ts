// THE STORY of 采访八百壮士的一天 (film "sihang", script v1 of 25 Nov 2026 + scripts/sihang/voice/make_lines.py): the
// timeline over the generated voice.ts / captions.ts (python3 scripts/kit/day/gen_timing.py --film sihang
// [--placeholder | <voice_timing.json>]) through the kit's day engine (src/kit/day/README.md). Shots never copy a number.
// THE FILM'S CLOCK IS REAL: 26 Oct 1937, late night, to 31 Oct, before dawn. Minutes count from 26 Oct 00:00.
import * as VOICE from "./voice";
import { cap, capWord, lineNum, type CaptionGroup } from "./captions";
import { L } from "../../kit/film/lang";
import { makeTimeline, makeLens } from "../../kit/day/timeline";
import type { DayPose, DaySegment } from "../../kit/day/types";
import type { World } from "./world";
import { PLACES, type Place } from "./places";

export type Speaker = VOICE.Speaker;
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export type { Place };
export { PLACES };
export const FPS = 30;
export const W = 1080, H = 1920;
export const { lensTan, lensFov } = makeLens(H);
export type Pose = DayPose;
export type Segment = DaySegment<World, Pose>;

const DAY = 24 * 60;
/** minutes from 26 Oct 00:00 of each scene's first frame */
export const CLOCK_MIN: Record<SceneId, number> = {
  A: 23 * 60 + 20, B: 23 * 60 + 50, C: DAY + 8 * 60 + 20, D: 2 * DAY + 5 * 60 + 40, E: 2 * DAY + 20 * 60,
  F: 2 * DAY + 23 * 60, G: 4 * DAY + 22 * 60, H: 5 * DAY + 60 + 30,
};
export const T = makeTimeline<Speaker, SceneId, Place, CaptionGroup, Pose>({
  voice: VOICE, captions: { cap, capWord, lineNum }, L, fps: FPS,
  what: {
    A: "26 Oct, late night: into the building; the head count; the title", B: "the same night: the one man sitting; the neon; the letter's first line",
    C: "27 Oct, morning: the south bank watches; the first attack; no shift change", D: "28 Oct, dawn: the window (no effects)",
    E: "28 Oct, evening: say eight hundred; live or die here; the letter (the quiet scene)", F: "28 Oct night to 29 Oct dawn: the rope, the paper, the flag's shadow",
    G: "30 Oct, night: a shell a second; the last line of the letter; the order", H: "31 Oct, before dawn: across the bridge; the letter; eight hundred",
  },
  clock: { min: CLOCK_MIN, digits: { A: true, B: true, C: true, D: true, E: true, F: true, G: true, H: true } },
});
export const {
  SCENES, SCENE, SCENE_STAMP, SCENE_TIME, LINES, line, lineId, lineAt, lineNo, QUOTES, quote, TOTAL, SEGMENTS, segmentAt, seg,
  CARDS, cardAt, TITLE_BLOCK, registerHud, huds,
} = T;
