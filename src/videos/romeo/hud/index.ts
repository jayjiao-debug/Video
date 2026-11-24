// hud/index.ts: THE ON-SCREEN GRAPHICS of 采访罗密欧与朱丽叶的一天 in one skin, 「信」 the letter (skin.ts): parchment,
// a slanted quill hand, red sealing wax, Montague blue and Capulet red. Every piece is a pure function of the frame
// (no hooks, no state, nothing random), draws DOM / SVG only in film px (1080 x 1920), reads nothing under it (no blend
// modes: the cut may lay the overlays over the picture as a separate pass), and documents its props at the top of its
// file. The only face is FrSans (Noto Sans SC Bold): the film's page must have it loaded (group/kit/overlay
// useOverlayFont, as every film does) before these draw.
//
//   title.tsx     <LetterTitle f from to? y? />                          the themed title (a sealed letter; 一 -> 四)
//   tabs.tsx      <NameTab f from who box hold? />                       Romeo's and Juliet's split-slam into a name tab
//                 <FriarBanner f from box hold? side? />                 劳伦斯神父 · 草药行家, a side banner
//   tally.tsx     <MeddleTally f stampAt blinks? changeAt? until? />     插手 0 ... 插手 1
//   whisper.tsx   <WhisperNote f from to text />                         her aside, marked 悄悄说
//   notes.tsx     <Note f from big small? x y />                         her notes (花字 / 记者OS)
//   fact.tsx      <FactCard f from to rows seal? />                      a proclamation, for when nobody speaks
//   stamp.tsx     <WaxStamp f at cx cy />                                认识一天 · 已婚
//   divider.tsx   <SplitDivider y open />                                the split screen's torn edge
//   end.tsx       <EndCard f from lineAt? sealAt? />                     the end card, seal 演绎
//   emotes.tsx    <TearSpray /> <TearHang /> <EyeHearts /> <Huff />      what comes out of their eyes (v4): tears that
//                                                                        fly, hearts that float; drawn in the
//                                                                        picture's own ink, riding the head
// LAYERS (bottom to top): the picture; SplitDivider; NameTab / FriarBanner; Note, WaxStamp, FactCard; LetterTitle;
// MeddleTally with the REC display; WhisperNote in place of the subtitle; the phone mask. EndCard stands alone.
//   sounds.ts     HUD_SOUNDS                                              each piece's one short sound and its cue frame
// THE CHECK: each file exports the box its piece takes (titleRect, nameTabRect, friarBannerRect, tallyRect,
// whisperRect, noteRect, factRect, stampRect, END.box) for src/kit/overlay checkOverlays.
export * from "./skin";
export * from "./marks";
export * from "./title";
export * from "./tabs";
export * from "./tally";
export * from "./whisper";
export * from "./notes";
export * from "./fact";
export * from "./stamp";
export * from "./divider";
export * from "./end";
export * from "./emotes";
export * from "./manpu";
export * from "./sounds";
