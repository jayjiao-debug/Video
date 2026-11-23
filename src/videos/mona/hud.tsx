// THE HUD of 采访蒙娜丽莎的一天 (bring-up): the kit's subtitles (Chinese large; the Italian / French actually said, small,
// under a line that is not spoken in Chinese) and her camera's recording UI. The film's own skin (title, cards, 综艺
// effects) comes on top of src/kit/overlay once the script and the voice are settled.
import { makeCaption } from "../../kit/day/hud/caption";
import { makeVlog } from "../../kit/day/hud/vlog";
import { HC } from "../../kit/day/hud/style";
import { CAPTIONS, captionAt, captionRuns, TRAILING_PUNCT } from "./captions";
import { FPS, STORY_SCENES, SCENE_STAMP, SEGMENTS, segmentAt, type Speaker } from "./story";
import { EN } from "../../kit/film/lang";

/** the reporter warm white; she in the old gold of her sleeves; the men white */
export const SPEAKER_COL: Record<Speaker, string> = { ji: HC.warm, mo: HC.goldPale, le: HC.white, na: HC.white, ki: HC.white };
export const CAP = makeCaption({ captions: CAPTIONS, captionAt, captionRuns, trailingPunct: TRAILING_PUNCT, speakerCol: SPEAKER_COL });
export const VLOG = makeVlog({ fps: FPS, scenes: STORY_SCENES, stamp: SCENE_STAMP!, segments: SEGMENTS, segmentAt, en: EN });
export const { Caption } = CAP;
export const { VlogHud } = VLOG;
