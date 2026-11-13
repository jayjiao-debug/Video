// src/videos/newton/hud/: EVERYTHING DRAWN OVER THE PICTURE of the Newton film (1080 x 1920 px), PLAN.md section 5
// (WP4). NO vlog UI (no REC, no timestamp, no battery, no 第二天).
// Film.tsx draws, in this order:
//   the HUD layer (unless Pose.hud === false): every registered HUD (story.ts registerHud), and (unless
//      Pose.cards === false) <TitleCard f />, <FactCard f />
//   P.overlays (the shot's own)
//   <Caption f />   (unless Pose.captions === false)
//   P.top           (put the end black here: endBlack(f, from) covers the subtitle too)
// Every overlay is a PLAIN FUNCTION OF THE FRAME: no state, nothing random, so frames render in any order on fresh
// pages. Text: both languages always (captions.ts groups and story.ts CARDS carry zh + en).
//   caption.tsx  <Caption f />     the subtitles: Chinese large (66 px) + English small (36 px) under it, speaker tints
//                                  (ji warm white, nt pale gold, hm white), no box, band y 1250-1500, 3-frame fades
//   card.tsx     <FactCard f />    the paper slip, mid-left (x 56..656, bottom edge y 1140), 8-frame flutter in / out
//   title.tsx    <TitleCard f />   the title block on the shut door (TITLE_SPAN); setTitlePlace({ x, y, scale, rot })
//   end.tsx      endBlack(f, from, fade?), dipAlpha(f, a, b, fade?), black(a): the warm black, never #000
//   style.ts     the palette HC, SAFE, text metrics, spanK, Rect helpers
//   hudRectsAt(f)    the boxes the HUD takes on frame f (keep faces out of them);  hudHits(f, r)  the ones r overlaps
import { capOn, capLayout, CAP_BAND } from "./caption";
import { factRectAt } from "./card";
import { titleRectAt } from "./title";
import { overlaps, type Rect } from "./style";

export { Caption, SPEAKER_COL, capOn, capAlpha, capLayout, capRows, CAP_BAND, CAP_ROW, ZH_PX, EN_PX, ZH_Y, EN_Y0, EN_STEP, type CapLayout, type CapRowLayout } from "./caption";
export { FactCard, factCardAt, factRows, factLayout, factRectAt, FACT_SLOT, CARD_X, CARD_BOTTOM, cardTop, CARD_MAXW, CARD_ROW, type FactLayout } from "./card";
export { TitleCard, setTitlePlace, titleRect, titleRectAt, TITLE_HOME, TITLE_RECT, type TitlePlace } from "./title";
export { EndBlack, endBlack, endBlackAlpha, dipAlpha, Black, black, FADE_MIN } from "./end";
export { HC, SAFE, spanK, em, textW, overlaps, turnedRect, type Rect } from "./style";

export type HudItem = "caption" | "card" | "title";
/** the boxes the HUD takes on frame f (px, 1080 x 1920): the subtitle (its real rows' box while one shows), the fact
 *  card and the title block while they show. Every frame also keeps CAP_BAND (y 1250-1500) for the subtitles. */
export const hudRectsAt = (f: number): { what: HudItem; r: Rect }[] => {
  const out: { what: HudItem; r: Rect }[] = [];
  const c = capOn(f);
  if (c) out.push({ what: "caption", r: capLayout(c.zh, c.en).box });
  const card = factRectAt(f);
  if (card) out.push({ what: "card", r: card });
  const title = titleRectAt(f);
  if (title) out.push({ what: "title", r: title });
  return out;
};
/** the HUD items a screen box (a face, a hand) would sit under on frame f */
export const hudHits = (f: number, r: Rect): HudItem[] => hudRectsAt(f).filter((x) => overlaps(x.r, r)).map((x) => x.what);
export { CAP_BAND as CAPTION_BAND };
