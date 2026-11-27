// THE HUD of 采访月老的一天: the kit's subtitles and her camera's recording UI, made for this film's timeline.
// The battery runs from 97 % at 08:00 to 6 % at 23:00; her camera switches off OFF_AT frames after his last word.
import { makeCaption } from "../../kit/day/hud/caption";
import { makeVlog } from "../../kit/day/hud/vlog";
import { HC } from "../../kit/day/hud/style";
import { CAPTIONS, captionAt, captionRuns, TRAILING_PUNCT } from "./captions";
import { FPS, SCENES, SCENE_STAMP, SEGMENTS, segmentAt, line, CLOCK_MIN, type Speaker } from "./story";
import { EN } from "../../kit/film/lang";
import { JOINS } from "./beats";

/** each speaker's subtitle colour: her warm white; 月老 a pale foil gold; the mortals cool whites */
export const SPEAKER_COL: Record<Speaker, string> = { ji: HC.warm, yl: "#ffe2a0", xm: "#e4ecf6", ma: "#f6dfe6", xq: "#e4ecf6", qs: "#fff0c8" };
/** her camera switches off this many frames after 「是你已经见过的人。」 ends */
export const OFF_AT = line("J03").to + Math.round(3.3 * FPS);   // (3.3 s: the turn back to him is a slow one, and he walks three steps off before the click)
export const CAP = makeCaption({ captions: CAPTIONS, captionAt, captionRuns, trailingPunct: TRAILING_PUNCT, speakerCol: SPEAKER_COL });
export const VLOG = makeVlog({
  fps: FPS, scenes: SCENES, stamp: SCENE_STAMP!, segments: SEGMENTS, segmentAt, en: EN, offAt: OFF_AT, joins: JOINS,
  battery: { min0: CLOCK_MIN.A, pct0: 97, min1: CLOCK_MIN.J, pct1: 6, drain: 1, lastDrain: 2 },
});
export const { Caption } = CAP;
export const { VlogHud } = VLOG;
