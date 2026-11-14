// hud/ms/index.ts: SKIN A 「手稿」 THE MANUSCRIPT, the overlay side (stage 1 of 3). Film.tsx imports from here.
//   skin.ts     SKIN (kit defineSkin), MS (colours), NIB, HAND, PAPER, MOTION: the look, written down once
//   marks.tsx   the skin's marks as small functions (SVG): msDefs (paper, grain, foxing, torn edge, wax, shadows), nibFilter,
//               inkFilter, sinkFilter, quill / quillLayout / quillOutline (the display hand, written on stroke by stroke,
//               ink pools), inkText / serifText (the body hand, the numerals), leaf (a laid-paper leaf), waxSeal, swash,
//               xMark, manicule, ellipseArc / ellipsePt / ellipseLen, writeK / drawOn / sinkK (the motion)
//   glyphs.ts   QUILL / SERIF glyph outlines baked from FrSans / FreeSerif Italic (+ pools and strokes in writing order)
//   when.ts     MS_ITEMS, msItem, msOn, msT, msLife, msEnabled, QUIET, gapPending, gapLines, MS_FX, msStillFrame,
//               msRectsAt, msShown; and the freeze (picture side: ../../freeze.ts) msHold, msFrozen, washAt, FREEZE
//   screen.ts   MsCtx (msScreen, msFig): where faces, hands and the camera are on the frame
//   title.tsx   <MsTitle f ctx />  row 1: the leaf on his door, 采访 / 牛顿 / 的一天 written on (stage 2a)
//   card.tsx    <MsCard f ctx />   row 4 and the hand-off to row 5: Newton's lead card on the freeze (stage 2a;
//               the banner, row 2, is banner.tsx, mounted by fx.tsx)
//   fx.tsx      <MsFx f ctx />     rows 3, 5-10 (the 综艺 effects)  (stage 2 fills it)
//   proof.tsx   <MsProof t />      the marks' proof sheet (input prop fx.proof; stills only)
//   check.ts    the smoke test (plain Node): bash /home/user/newton_work/film/skinA/check.sh
import { MS_ITEMS, msOn } from "./when";

export * from "./skin";
export * from "./when";
export * from "./marks";
export * from "./screen";
export { MsTitle } from "./title";
export { MsCard } from "./card";
export { MsFx } from "./fx";
export { MsProof } from "./proof";

/** whether any skin A item draws on film frame f (Film.tsx builds the MsCtx only then) */
export const msAny = (fr: number): boolean => MS_ITEMS.some((i) => msOn(i.id, fr));
