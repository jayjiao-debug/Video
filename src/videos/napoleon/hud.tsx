// THE HUD of the Napoleon film: the kit's subtitles and her camera's recording UI, made for this film's timeline.
import { makeCaption } from "../../kit/day/hud/caption";
import { makeVlog } from "../../kit/day/hud/vlog";
import { HC } from "../../kit/day/hud/style";
import { CAPTIONS, captionAt, captionRuns, TRAILING_PUNCT } from "./captions";
import { FPS, SCENES, SCENE_STAMP, SEGMENTS, segmentAt, type Speaker } from "./story";
import { EN } from "../../kit/film/lang";

export const SPEAKER_COL: Record<Speaker, string> = { ji: HC.warm, np: HC.goldPale, bg: HC.white };
export const CAP = makeCaption({ captions: CAPTIONS, captionAt, captionRuns, trailingPunct: TRAILING_PUNCT, speakerCol: SPEAKER_COL });
export const VLOG = makeVlog({ fps: FPS, scenes: SCENES, stamp: SCENE_STAMP!, segments: SEGMENTS, segmentAt, en: EN });
export const { Caption } = CAP;
export const { VlogHud } = VLOG;
