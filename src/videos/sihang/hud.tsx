// THE HUD of 采访八百壮士的一天: the kit's subtitles and her camera's recording UI, made for this film's timeline.
// THE BATTERY IS THE FILM'S SECOND CLOCK: 96 % when she walks in on 26 Oct, 3 % on the bridge on 31 Oct; her camera
// dies OFF_AT frames after her last word (「八百。」).
import { makeCaption } from "../../kit/day/hud/caption";
import { makeVlog } from "../../kit/day/hud/vlog";
import { HC } from "../../kit/day/hud/style";
import { CAPTIONS, captionAt, captionRuns, TRAILING_PUNCT } from "./captions";
import { FPS, SCENES, SCENE_STAMP, SEGMENTS, segmentAt, line, CLOCK_MIN, type Speaker } from "./story";
import { EN } from "../../kit/film/lang";

/** each speaker's subtitle colour: her white-warm; the men in the paper tones of the film's skin */
export const SPEAKER_COL: Record<Speaker, string> = { ji: HC.warm, mc: "#ffe9b0", lb: "#f1dcc0", xj: "#ffffff", yr: "#ffffff", cl: "#f1dcc0", th: "#dfe6ee" };
/** her camera dies this many frames after 「八百。」 ends */
export const OFF_AT = line("H05").to + 26;
export const CAP = makeCaption({ captions: CAPTIONS, captionAt, captionRuns, trailingPunct: TRAILING_PUNCT, speakerCol: SPEAKER_COL });
export const VLOG = makeVlog({
  fps: FPS, scenes: SCENES, stamp: SCENE_STAMP!, segments: SEGMENTS, segmentAt, en: EN, offAt: OFF_AT,
  battery: { min0: CLOCK_MIN.A, pct0: 96, min1: CLOCK_MIN.H, pct1: 4, drain: 1, lastDrain: 2 },
});
export const { Caption } = CAP;
export const { VlogHud } = VLOG;
