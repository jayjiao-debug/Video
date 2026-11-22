// hud/sounds.ts: THE ONE SHORT SOUND OF EACH PIECE of the skin (hud/index.ts), for the sound team and the scene
// builder: what it is, and on which of the piece's own frames it lands (frames after the piece's `from` / `at` /
// `stampAt`; 30 fps). No audio lives here or anywhere in the repo's hud: these are names and cue points only. The
// palette is three materials: PAPER (dry, light), WAX (soft, low, heavy) and the QUILL (a scratch).
export type HudSound = { piece: string; cue: string; at: number | string; sound: string };
export const HUD_SOUNDS: HudSound[] = [
  { piece: "LetterTitle", cue: "the letter lands", at: 0, sound: "paper flap: one dry flap of a folded letter, 0.15 s" },
  { piece: "LetterTitle", cue: "the seal", at: 17, sound: "wax thunk: low, soft, heavy, 0.2 s (THE title's sound; the other cues sit under it)" },
  { piece: "LetterTitle", cue: "四 over 一", at: 28, sound: "wax tick: the thunk's small sister, higher and shorter" },
  { piece: "NameTab", cue: "the banner slams in", at: 0, sound: "banner whip-crack: a strip of heavy paper snapped taut, 0.2 s (THE tab's sound)" },
  { piece: "NameTab", cue: "the name's three characters", at: "7, 11, 15", sound: "quill stab x3: three quick dabs, rising" },
  { piece: "NameTab", cue: "the epithet's slip", at: 22, sound: "paper flap, small" },
  { piece: "NameTab", cue: "the wax dot", at: 31, sound: "wax tick" },
  { piece: "NameTab", cue: "it folds into the tab", at: 44, sound: "paper fold: two fast creases, 0.25 s" },
  { piece: "FriarBanner", cue: "it opens beside him", at: 0, sound: "paper flap, small (THE banner's sound)" },
  { piece: "FriarBanner", cue: "the leaf seal", at: 12, sound: "wax tick" },
  { piece: "MeddleTally", cue: "stamp-in: the 0", at: 8, sound: "wax thunk (a paper flap leads it on frame 0)" },
  { piece: "MeddleTally", cue: "a blink (each later refusal)", at: "the blink's frame", sound: "wax tock-tock: a knuckle rapped twice on set wax, soft" },
  { piece: "MeddleTally", cue: "the change: the strike", at: "changeAt", sound: "quill scratch: one hard stroke, 0.1 s" },
  { piece: "MeddleTally", cue: "the change: the fresh 1", at: "changeAt + 5", sound: "THE BIG WAX THUNK: the film's heaviest, with a small crack of the old seal, left to ring" },
  { piece: "WhisperNote", cue: "it slips in", at: 0, sound: "paper slip: a small soft flap, quieter than any other" },
  { piece: "Note", cue: "the red stroke under the punch word", at: 4, sound: "quill scratch: one quick stroke on paper" },
  { piece: "FactCard", cue: "it unrolls", at: 0, sound: "parchment unroll: a dry crackle, 0.2 s (THE card's sound)" },
  { piece: "FactCard", cue: "the seal on its ribbons", at: "7 + 6 x rows", sound: "wax thunk" },
  { piece: "WaxStamp", cue: "已婚", at: 6, sound: "wax thunk, heavy (a paper flap leads it on frame 0)" },
  { piece: "SplitDivider", cue: "open leaves 0", at: "the frame open > 0", sound: "paper tear: one long dry rip, 0.4 s" },
  { piece: "EndCard", cue: "the letter unfolds", at: 0, sound: "letter unfold: two soft creaks of paper" },
  { piece: "EndCard", cue: "each line", at: "lineAt[i]", sound: "quill writing: a faint scratching under the line, 0.45 s" },
  { piece: "EndCard", cue: "演绎", at: "sealAt", sound: "wax thunk, the last, left to ring" },
];
