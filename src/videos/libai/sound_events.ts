// sound_events.ts: what the sound mix needs from the picture (scripts/libai/sound/events.mjs bundles this file and
// writes /home/user/libai_work/sound/events.json; build.py reads it). Every frame is on the PICTURE's clock: the mix
// moves everything after the freeze later by its length, as Film.tsx does.
import { FPS, FREEZE_AT_WORLD, FREEZE_N, seg } from "./story";
import { BEAT, TITLE_SPAN, SIDE_BANNERS, TRANSITIONS } from "./beats";
import { HICCUP_FRAMES, DRINK_GULPS } from "./drunk";
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
    // (Jay, 15 Nov: "whats that knife sound in the intro": the cup's clip rang at 3.9 kHz like a blade and the cloth clip
    // swished twice, twice over; both are now dull, soft clips made for this film: sound/synth/make.py)
    [TITLE_SPAN[0] + 3, "sfx_rustle", -17, "the wine flag drops and swings"],
    [TITLE_SPAN[0] + 31, "sfx_cup_tok", -16, "the cup is set down on the flag"],
    ...SIDE_BANNERS.filter((b) => b.who !== "he").map((b) => [b.span[0], "sfx_rustle", -18, `${b.who}'s banner`]),
    ...DRINK_GULPS.map((f) => [f + 1, "sfx_gulp", -17, "李白 gulps from the jar (card 1)"]),
    ...HICCUP_FRAMES.filter((f) => f < seg("F").from).map((f) => [f, "sfx_hiccup", -20, "李白 hiccups"]),
    // the clock races: a soft whoosh (the two taps of the old clip read as footsteps: Jay, 15 Nov)
    ...TRANSITIONS.filter((t) => t.kind === "clock").map((t) => [t.from, "sfx_whoosh", -20, `clock race ${t.scenes!.join("->")}`]),
    [seg("C").to - 3, "whoosh", -14, "the whip C -> D"],
    ...FX_SOUNDS,
    ...POEM_SOUNDS,
    ...CURTAIN_SOUNDS,
    // he writes before the verse (C19): a very soft stroke now and then, under her line
    ...[24, 58, 96].map((d, i): [number, string, number, string] => [BEAT.C.write[0] + d, `sfx_stroke${(i % 3) + 1}`, -27, "he writes (before the verse)"]),
    // her camera switches off: two falling beeps from the click, the hum dying with the picture's collapse
    [BEAT.F.offClick, "sfx_poweroff2", -13, "the camera switches off"],
  ],
  /** the freeze card's sounds, in frames from the freeze's first frame */
  freezeHits: [[0, "sfx_whoosh", -19, "she pulls back, he is cut out"], [0, "sfx_card", -14, "the picture stops, the card swings in"], [6, "sfx_stamp", -15, "the seal 谪仙人"], [17, "pop_hat", -15, "今日目标"], [FREEZE_N - 10, "sfx_whoosh", -20, "her zoom back in carries the card off"]],
});
