// src/videos/su/hud/: EVERYTHING DRAWN OVER THE PICTURE of the Su film (1080 x 1920 px), PLAN.md section 6 (WP1).
// Film.tsx draws, in this order:
//   the HUD layer (unless Pose.hud === false):  <VlogHud f rec /> (REC, timestamp, battery: Jay 2026-11-14, PLAN 11.4),
//      <TitleBlock f /> and <FactCard f /> (unless Pose.cards === false), every registered HUD, <EndNames f />
//      (the red seal <Stamp /> is no longer drawn: the timestamp carries 两年后 · 儋州 / 四年后 · 金山寺)
//   P.overlays (the shot's own: InkWipe / InkDissolve / ToneFade / transitionAt(f).node, cam.ts whipSmear ...)
//   <Caption f />   (unless Pose.captions === false): big Chinese + the line's English small under it
//   P.top
//   <SwitchOff f />  her camera switching off at the very end (hud/vlog.tsx OFF), over everything
// Every overlay is a PLAIN FUNCTION OF THE FRAME: no state, nothing random, so frames render in any order on fresh
// pages. Zones: layout.ts SCREEN (+ style.ts SAFE: x 50..925 below y 900, nothing below 1613). Strings: L(zh, en)
// (lang.ts TXT for the shared ones). No box behind any caption: an ink line under the fill.
//   title.tsx     <TitleBlock f />   「采访苏东坡的一天」 / 「1097年 · 惠州」 top centre, frames 0-90 (TITLE_SPAN)
//   card.tsx      <FactCard f />     the paper fact card of story.ts CARDS, mid-left, zh + en (card 5 low, centred)
//   stamp.tsx     <Stamp f />        the red time-jump seal top left: 「两年后 · 儋州」 (H), 「四年后 · 金山寺」 (I)
//   endnames.tsx  <EndNames f />     黄州 / 惠州 / 儋州 on their syllables, the three painted pictures, the dim;
//                 <EndBlack f />     the fade to black; END_LINE (I57: its caption is hidden)
//   caption.tsx   <Caption f />      the subtitles (speaker colours, up to 16 a row, the line's English under them)
//   ink.tsx       InkWipe(p), InkDissolve(p), ToneFade(k, col), transitionAt(f): the cross-cut overlays (segments)
//   style.ts      the palette, inked text, SAFE, spanK, em / textW
//   hudRectsAt(f) the boxes the HUD takes on frame f (a shot keeps faces out from under them)
import { factRect } from "./card";
import { TITLE_RECT } from "./title";
import { vlogRectsAt } from "./vlog";
import { NAMES_RECT } from "./endnames";
import { captionRect } from "./caption";
import { TITLE_SPAN, BEAT } from "../beats";
import type { Rect } from "./style";

export { TitleBlock, TITLE_RECT } from "./title";
export { FactCard, factCardAt, factRows, factRect, FACT_RECT, FACT_END_RECT } from "./card";
export { Stamp, stampAt, STAMP_RECT } from "./stamp";
export { VlogHud, SwitchOff, OFF, SCENE_TIME, FLASH_TIME, batteryAt, recAlpha, timeStampAt, VLOG_RECT, vlogRectsAt } from "./vlog";
export { EndNames, EndDim, EndBlack, END_LINE, NAMES_RECT, endDim, endBlack } from "./endnames";
export { Caption, SPEAKER_COL, capPx, capRows, enRows, captionRect, CAP_ROW, CAP_EN } from "./caption";
export { InkWipe, InkDissolve, ToneFade, transitionAt, progressOf, inkCut, INK_CUT } from "./ink";
export { HC, SAFE, inked, spanK, em, textW, type Rect } from "./style";

/** the boxes the HUD takes on frame f (px, 1080 x 1920): the title block, the fact card, the vlog UI, the end names and
 *  the caption band while a caption shows */
export const hudRectsAt = (f: number): { what: string; r: Rect }[] => {
  const out: { what: string; r: Rect }[] = [];
  if (f >= TITLE_SPAN[0] && f <= TITLE_SPAN[1]) out.push({ what: "title", r: TITLE_RECT });
  const card = factRect(f);
  if (card) out.push({ what: "card", r: card });
  out.push(...vlogRectsAt(f));
  if (f >= BEAT.I.names[0]) out.push({ what: "names", r: NAMES_RECT });
  const cap = captionRect(f);
  if (cap) out.push({ what: "caption", r: cap });
  return out;
};
