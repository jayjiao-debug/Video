// sound_events.ts: what the sound mix needs from the picture (scripts/libai/sound/events.mjs bundles this file and
// writes /home/user/libai_work/sound/events.json; build.py reads it). Every frame is on the PICTURE's clock: the mix
// moves everything after the freeze later by its length, as Film.tsx does.
import { FPS, FREEZE_AT_WORLD, FREEZE_N, seg } from "./story";
import { TITLE_SPAN, GAO_BANNER, TRANSITIONS } from "./beats";
import { WHISPERS } from "./whisper";
import { FX_SOUNDS } from "./hud/fx";

export const soundEvents = () => ({
  fps: FPS,
  /** the intro card's freeze: the picture holds frame `at` for `frames` more frames (film frames at .. at + frames) */
  freeze: { at: FREEZE_AT_WORLD, frames: FREEZE_N },
  /** the whispers: the room dips from her first word to the end of her voice */
  whispers: WHISPERS.map((s) => ({ id: s.id, word: s.word, end: s.end })),
  /** one-shot sounds: [picture frame, clip, gain dB, what] (the freeze card's own sounds use "film" frames: at + k) */
  hits: [
    [TITLE_SPAN[0], "sfx_whoosh", -18, "the title's pole slides in"],
    [TITLE_SPAN[0] + 3, "cloth", -14, "the wine flag drops and swings"],
    [TITLE_SPAN[0] + 31, "sfx_lid", -14, "the cup is set down on the flag"],
    [GAO_BANNER[0], "cloth", -16, "高力士's banner"],
    ...TRANSITIONS.filter((t) => t.kind === "clock").map((t) => [t.from, "clock_race", -14, `clock race ${t.scenes!.join("->")}`]),
    [seg("C").to - 3, "whoosh", -14, "the whip C -> D"],
    ...FX_SOUNDS,
  ],
  /** the freeze card's sounds, in frames from the freeze's first frame */
  freezeHits: [[0, "sfx_card", -14, "the picture stops, the card swings in"], [6, "sfx_stamp", -15, "the seal 谪仙人"], [17, "pop_hat", -15, "今日目标"]],
});
