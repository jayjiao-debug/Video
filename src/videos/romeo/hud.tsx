// THE HUD of 采访罗密欧与朱丽叶: the kit's subtitles and her camera's recording UI, made for this film's timeline.
// The REC row's timestamp is the film's clock: how long Romeo has known Juliet (还不认识朱丽叶 -> 认识：0分钟 -> 3小时 ->
// 第1天 ... 第4天), set as each scene's stamp word (story.ts STAMP), no digits. The battery drains over the four days.
// Her whispered asides (whisper.ts) replace the subtitle with her own note (fx.tsx draws it).
import { makeCaption } from "../../kit/day/hud/caption";
import { makeVlog } from "../../kit/day/hud/vlog";
import { CAPTIONS, captionAt, captionRuns, TRAILING_PUNCT } from "./captions";
import { FPS, SCENES, SCENE_STAMP, SEGMENTS, segmentAt, line, type Speaker } from "./story";
import { whisperCap } from "./whisper";
import { EN } from "../../kit/film/lang";

/** the subtitle's colour per speaker: her warm white, Romeo a pale Montague blue, Juliet a pale Capulet rose, the Friar
 *  pale parchment */
export const SPEAKER_COL: Record<Speaker, string> = { ji: "#fff3e0", ro: "#dce9ff", ju: "#ffdfe2", fr: "#f4e6c6" };
/** her camera dies on this frame (the end: "……我得买新手机了。", then the power-off) */
export const OFF_AT = line("I04").to + 22;
export const CAP = makeCaption({
  captions: CAPTIONS, captionAt: (f) => (whisperCap(f) ? null : captionAt(f)), captionRuns, trailingPunct: TRAILING_PUNCT, speakerCol: SPEAKER_COL,
});
export const VLOG = makeVlog({
  fps: FPS, scenes: SCENES, stamp: SCENE_STAMP!, segments: SEGMENTS, segmentAt, en: EN, offAt: OFF_AT,
  battery: { min0: 330, pct0: 100, min1: 5975, pct1: 9, drain: 2, lastDrain: 3 },
});
export const { Caption } = CAP;
export const { VlogHud } = VLOG;
