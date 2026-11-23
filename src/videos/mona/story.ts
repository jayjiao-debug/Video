// THE STORY of 采访蒙娜丽莎的一天 on the day engine (src/kit/day/README.md): the timeline over the generated voice.ts /
// captions.ts (scripts/mona/voice/mona_lines.json -> scripts/kit/day/gen_timing.py --film mona). Every frame number of
// the film comes from here. Nine scenes, one place: the stage; she never moves, the world does (scenes.ts).
import * as VOICE from "./voice";
import { cap, capWord, lineNum, type CaptionGroup } from "./captions";
import { L } from "../../kit/film/lang";
import { makeTimeline } from "../../kit/day/timeline";
import type { DayPose, DaySegment } from "../../kit/day/types";
import type { World } from "./world";
import { FPS, type Place } from "./frame";

export { FPS, W, H, PLACES, lensTan, lensFov, type Place } from "./frame";
export type Speaker = VOICE.Speaker;
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export type Pose = DayPose;
export type Segment = DaySegment<World, Pose>;

export const T = makeTimeline<Speaker, SceneId, Place, CaptionGroup, Pose>({
  voice: VOICE, captions: { cap, capWord, lineNum }, L, fps: FPS,
  what: {
    A: "cold open, Florence 1503: only her head is painted; the title", B: "the fourth year: the jester, three jokes, the yawn",
    C: "Cloux 1517: the old master asleep beside her", D: "the king's walls, then Napoleon's bedroom", E: "1911: the thief, the trunk, the empty wall",
    F: "today: the crowd, the stone, the cake, the soup, her eyebrows", G: "the turn: he has been gone since 1519", H: "after closing: the quiet scene, the jaw", I: "the button: the guard's torch",
  },
  // THE CAMERA'S STAMP: this film's clock is the YEAR on the little plate, not the hour: the stamp is each scene's word
  // (the lines file's "time"), never digits. (min only orders the scenes for the battery.)
  clock: { min: { A: 360, B: 420, C: 480, D: 540, E: 600, F: 660, G: 1080, H: 1260, I: 1380 }, digits: { A: false, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false } },
});
export const {
  SCENES: STORY_SCENES, SCENE, SCENE_STAMP, SCENE_TIME, LINES, line, lineId, lineAt, lineNo, QUOTES, quote, TOTAL, SEGMENTS, segmentAt, seg,
  CARDS, cardAt, TITLE_BLOCK, registerHud, huds,
} = T;
