// sound_events.ts: what the sound mix needs from the picture (scripts/libai/sound/events.mjs bundles this file and
// writes /home/user/libai_work/sound/events.json; build.py reads it). Every frame is on the PICTURE's clock: the mix
// moves everything after the freeze later by its length, as Film.tsx does.
import { FPS, FREEZE_AT_WORLD, FREEZE_N, seg } from "./story";
import { BEAT, TITLE_SPAN, SIDE_BANNERS, TRANSITIONS } from "./beats";
import { HICCUP_FRAMES } from "./drunk";
import { WHISPERS } from "./whisper";
import { FX_SOUNDS } from "./hud/fx";
import { POEM_SOUNDS } from "./hud/poem";
import { CURTAIN_SOUNDS } from "./hud/curtain";

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
    ...SIDE_BANNERS.filter((b) => b.who !== "he").map((b) => [b.span[0], "cloth", -16, `${b.who}'s banner`]),
    ...HICCUP_FRAMES.filter((f) => f > seg("A").from + 90 && f < seg("F").from).map((f) => [f, "sfx_hiccup", -20, "李白 hiccups"]),
    ...TRANSITIONS.filter((t) => t.kind === "clock").map((t) => [t.from, "clock_race", -14, `clock race ${t.scenes!.join("->")}`]),
    [seg("C").to - 3, "whoosh", -14, "the whip C -> D"],
    ...FX_SOUNDS,
    ...POEM_SOUNDS,
    ...CURTAIN_SOUNDS,
    // he writes before the verse (C19): a soft stroke now and then, under her line
    ...[12, 31, 47, 68, 84, 103].map((d, i): [number, string, number, string] => [BEAT.C.write[0] + d, `sfx_stroke${(i % 3) + 1}`, -19, "he writes (before the verse)"]),
  ],
  /** the freeze card's sounds, in frames from the freeze's first frame */
  freezeHits: [[0, "sfx_whoosh", -19, "she pulls back, he is cut out"], [0, "sfx_card", -14, "the picture stops, the card swings in"], [6, "sfx_stamp", -15, "the seal 谪仙人"], [17, "pop_hat", -15, "今日目标"], [FREEZE_N - 10, "sfx_whoosh", -20, "her zoom back in carries the card off"]],
});
