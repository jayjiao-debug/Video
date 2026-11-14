// src/videos/newton/hud/: EVERYTHING DRAWN OVER THE PICTURE of the Newton film (9:15, 1080 x 1800 px; the phone-safe
// layout: layout.ts PHONE / SCREEN), PLAN.md section 5
// (WP4). Her camera's recording UI (REC, the scene's timestamp, the battery: vlog.tsx) since Jay's note of 14 Nov.
// Film.tsx draws, in this order:
//   the HUD layer (unless Pose.hud === false): <VlogHud f rec={P.rec} cards={P.cards} />, every registered HUD
//      (story.ts registerHud), and (unless Pose.cards === false) <TitleCard f />, <FactCard f />
//   P.overlays (the shot's own)
//   <Caption f />   (unless Pose.captions === false)
//   P.top           (put the end black here: endBlack(f, from) covers the subtitle too)
// Every overlay is a PLAIN FUNCTION OF THE FRAME: no state, nothing random, so frames render in any order on fresh
// pages. Text: both languages always (captions.ts groups and story.ts CARDS carry zh + en).
//   caption.tsx  <Caption f />     the subtitles: Chinese large (66 px; over 13 characters two rows) + English small
//                                  (36 px) under it only for English speech, speaker tints (ji warm white, nt pale gold,
//                                  hm white), no box, rows <= 780 px centred, the block's bottom on y 1488, 3-frame fades
//   card.tsx     <FactCard f />    the paper slip, mid-left (x 75..655, bottom edge y 1140), 8-frame flutter in / out
//   title.tsx    <TitleCard f />   the title block on the shut door (TITLE_SPAN); setTitlePlace({ x, y, scale, rot })
//   vlog.tsx     <VlogHud f />     her camera's UI: the REC lamp (1 Hz, soft) top left (row y 116), the scene's timestamp
//                                  under it (清晨 05:00 / EARLY MORNING: slides in big on each scene's first frame, then
//                                  sits small; the clock races only across the clock joins), the battery top right
//                                  (drains with the clock, red at 2 a.m.);
//                                  the camera switches off on OFF_AT (BEAT.G.cameraOff: the lamp dies, the whole UI goes
//                                  grey, the battery empties, it holds still 24 frames until the end black)
//   end.tsx      endBlack(f, from, fade?), dipAlpha(f, a, b, fade?), black(a): the warm black, never #000
//   style.ts     the palette HC, SAFE, text metrics, spanK, Rect helpers
//   phone.tsx    <PhoneMask />     the phone's covered areas over a review cut (Film.tsx, input prop mask: true)
//   hudRectsAt(f)    the boxes the HUD takes on frame f (keep faces out of them);  hudHits(f, r)  the ones r overlaps
import { capOn, capLayout, enShown, CAP_BAND } from "./caption";
import { factRectAt } from "./card";
import { titleRectAt } from "./title";
import { vlogRectsAt } from "./vlog";
import { overlaps, type Rect } from "./style";
import { whisperCapAt, whisperRectAt } from "./whisper";

export { Caption, enShown, SPEAKER_COL, capOn, capAlpha, capEnd, capLayout, capRows, CAP_BAND, CAP_ROW, CAP_W, CAP_BOTTOM, ZH_PX, ZH_MIN, EN_PX, ZH_Y, EN_Y0, EN_STEP, type CapLayout, type CapRowLayout } from "./caption";
export { FactCard, factCardAt, cardEnd, SHOWN_CARDS, factRows, factLayout, factRectAt, FACT_SLOT, CARD_X, CARD_BOTTOM, cardTop, CARD_MAXW, CARD_ROW, type FactLayout } from "./card";
export { TitleCard, setTitlePlace, titleRect, titleRectAt, TITLE_HOME, TITLE_RECT, type TitlePlace } from "./title";
export { EndBlack, endBlack, endBlackAlpha, dipAlpha, Black, black, FADE_MIN } from "./end";
export { VlogHud, VLOG_RECT, OFF_AT, STAMP_AT, recAlpha, stampAt, stampRect, clockAt, raceAt, RACES, CLOCK_JOINS, RACE_PRE, RACE_POST, wordOf, batteryAt, vlogRectsAt, type Race } from "./vlog";
export { PhoneMask } from "./phone";
export { HC, SAFE, spanK, em, textW, overlaps, turnedRect, type Rect } from "./style";

export type HudItem = "caption" | "card" | "title" | "rec" | "stamp" | "battery" | "whisper";
/** the boxes the HUD takes on frame f (px, 1080 x 1800): the vlog UI (the REC row, the timestamp: its big intro for
 *  the first 2 s of a scene, the battery), the subtitle (its real rows' box while one shows), the fact card and the
 *  title block while they show. CAP_BAND (y 1325-1490) is the subtitles' band (the faces checker's "band"). On a
 *  whisper line's frames (whisper.ts) her bubble REPLACES the subtitle: "whisper" = the bubble's box while it shows
 *  (hud/whisper.tsx whisperRectAt), and no "caption" box. */
export const hudRectsAt = (f: number): { what: HudItem; r: Rect }[] => {
  const out: { what: HudItem; r: Rect }[] = [...vlogRectsAt(f)];
  const c = capOn(f);
  if (c && !whisperCapAt(f)) out.push({ what: "caption", r: capLayout(c.zh, enShown(c)).box });
  const bubble = whisperRectAt(f);
  if (bubble) out.push({ what: "whisper", r: bubble });
  const card = factRectAt(f);
  if (card) out.push({ what: "card", r: card });
  const title = titleRectAt(f);
  if (title) out.push({ what: "title", r: title });
  return out;
};
/** the HUD items a screen box (a face, a hand) would sit under on frame f */
export const hudHits = (f: number, r: Rect): HudItem[] => hudRectsAt(f).filter((x) => overlaps(x.r, r)).map((x) => x.what);
export { CAP_BAND as CAPTION_BAND };
