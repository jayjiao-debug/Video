// src/videos/qin/hud/: EVERYTHING DRAWN OVER THE PICTURE of the Qin film (1080 x 1920 px), PLAN.md section 5 (WP4).
// Film.tsx draws, in this order:
//   the HUD layer (unless Pose.hud === false):  <VlogHud f rec={P.rec} />, every registered HUD (story.ts registerHud),
//      and (unless Pose.cards === false) <TitleCard f />, <NextDayCard f />, <FactCard f />
//   P.overlays (the shot's own: segment builders put hud/ nodes or their own there)
//   <Caption f />   (unless Pose.captions === false)
//   P.top
// Every overlay is a PLAIN FUNCTION OF THE FRAME: no state, nothing random, so frames render in any order on fresh
// pages. Zones: layout.ts SCREEN (+ style.ts SAFE: x 50..925 below y 900, nothing below 1613). Strings: L(zh, en)
// (lang.ts TXT for the shared ones). No box behind any text: an ink line under the fill.
//   vlog.tsx     <VlogHud f rec? cards? />  REC (1 Hz soft blink; the lamp goes out on BEAT.G.offClick and the HUD
//                holds still), the 时辰 timestamp (slides in big at each scene start and on 第二天, then rests small
//                under REC; not in the museum), the battery 100 % -> 8 % (red on the last day)
//   card.tsx     <FactCard f />  the paper fact card of story.ts CARDS with the 「史记」 seal and the source line
//   title.tsx    <TitleCard f />  the brush title after A14;  <NextDayCard f />  「第二天」
//   caption.tsx  <Caption f />  the subtitles (speaker colours, max 14 a row, two rows max, kept left of the rail)
//   style.ts     the palette, inked text, SAFE, spanK, em / textW
//   hudRectsAt(f)  the boxes the HUD takes on frame f (a shot can keep a face out from under a card)
import { factCardAt, FACT_RECT } from "./card";
import { TITLE_RECT, NEXTDAY_RECT } from "./title";
import { VLOG_RECT, timeStampAt } from "./vlog";
import { TITLE_SPAN, BEAT, placeAt } from "../beats";
import type { Rect } from "./style";

export { VlogHud, batteryAt, recAlpha, timeStampAt, VLOG_RECT } from "./vlog";
export { FactCard, factCardAt, factParts, factRows, FACT_RECT } from "./card";
export { TitleCard, NextDayCard, TITLE_RECT, NEXTDAY_RECT } from "./title";
export { Caption, SPEAKER_COL, capPx, capRows, CAP_ROW } from "./caption";
export { HC, SAFE, inked, spanK, em, type Rect } from "./style";

/** the boxes the HUD takes on frame f (px, 1080 x 1920): the REC row, the timestamp (its big intro while it shows),
 *  the battery, and the fact card / title / 第二天 while they show. Captions: layout.ts SCREEN.capTop..capBottom. */
export const hudRectsAt = (f: number): { what: string; r: Rect }[] => {
  const out: { what: string; r: Rect }[] = [];
  out.push({ what: "rec", r: VLOG_RECT.rec });
  if (placeAt(f) !== "museum") out.push({ what: "stamp", r: timeStampAt(f).t < 56 ? VLOG_RECT.stampBig : VLOG_RECT.stamp });
  out.push({ what: "battery", r: VLOG_RECT.battery });
  if (factCardAt(f)) out.push({ what: "card", r: FACT_RECT });
  if (f >= TITLE_SPAN[0] && f <= TITLE_SPAN[1]) out.push({ what: "title", r: TITLE_RECT });
  if (f >= BEAT.D.nextDay[0] && f <= BEAT.D.nextDay[1]) out.push({ what: "nextDay", r: NEXTDAY_RECT });
  return out;
};
