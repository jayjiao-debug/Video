// src/videos/newton/hud/: EVERYTHING DRAWN OVER THE PICTURE of the Newton film (9:16, 1080 x 1920 px; the phone-safe
// layout: style.ts FRAME / SAFE, the kit's FRAME_9x16 with the film's one override: the REC display x 110-970,
// y 225-330, words from y 340; layout.ts PHONE / SCREEN carry copies for the picture side), PLAN.md section 5
// (WP4). Her camera's recording UI (REC, the scene's timestamp, the battery: vlog.tsx) since Jay's note of 14 Nov.
// Film.tsx draws, in this order (h = freeze.ts msHold(f): the frame the picture shows; = f except on the lead card's
// frozen frames, where the picture and the HUD hold B03's last frame):
//   the whisper's darkened edges
//   SKIN A's card layer: <MsCard f ctx />  (hud/ms/: Humphrey's banner, Newton's lead card; under the vlog UI)
//   the HUD layer (unless Pose.hud === false): <VlogHud f={h} rec={P.rec} cards={P.cards} />, every registered HUD
//      (story.ts registerHud), and (unless Pose.cards === false) <FactCard f={h} />
//   P.overlays (the shot's own)
//   SKIN A's title and effects: <MsTitle f ctx />, <MsFx f ctx />  (hidden with the HUD layer)
//   her whisper bubble, then <Caption f />   (unless Pose.captions === false; both hidden on the card's frozen frames)
//   P.top           (put the end black here: endBlack(f, from) covers the subtitle too)
// The old title block (title.tsx <TitleCard>) is no longer mounted (skin A's <MsTitle> replaces it); its exports stay
// for the faces checker.
// Every overlay is a PLAIN FUNCTION OF THE FRAME: no state, nothing random, so frames render in any order on fresh
// pages. Text: both languages always (captions.ts groups and story.ts CARDS carry zh + en).
//   caption.tsx  <Caption f />     the subtitles: Chinese large (66 px; over 13 characters two rows) + English small
//                                  (36 px) under it only for English speech, speaker tints (ji warm white, nt pale gold,
//                                  hm white), no box, rows <= 700 px centred (inside x 110-890), the block's bottom on
//                                  y 1458 (the kit's caption band x 110-890, y 1270-1460), 3-frame fades
//   card.tsx     <FactCard f />    the paper slip, mid-left (x 131..711, bottom edge y 1200), 8-frame flutter in / out
//   title.tsx    <TitleCard f />   the title block on the shut door (TITLE_SPAN); setTitlePlace({ x, y, scale, rot })
//   vlog.tsx     <VlogHud f />     her camera's UI: the REC lamp (1 Hz, soft) top left (from x 110, row y 250), the scene's timestamp
//                                  under it (row y 308; 清晨 05:00 / EARLY MORNING: slides in big on each scene's first frame, then
//                                  sits small; the clock races only across the clock joins), the battery top right (to x 970)
//                                  (drains with the clock, red at 2 a.m.);
//                                  the camera switches off on OFF_AT (BEAT.G.cameraOff: the lamp dies, the whole UI goes
//                                  grey, the battery empties, it holds still 24 frames until the end black)
//   end.tsx      endBlack(f, from, fade?), dipAlpha(f, a, b, fade?), black(a): the warm black, never #000
//   style.ts     the palette HC, FRAME (the film's frame spec), SAFE, text metrics, spanK, Rect helpers
//   phone.tsx    <PhoneMask />     the phone's covered areas over a review cut (Film.tsx, input prop mask: true)
//   ms/          SKIN A 「手稿」: <MsTitle>, <MsCard>, <MsFx>, the timing (ms/when.ts), the marks (ms/marks.tsx)
//   hudRectsAt(f)    the boxes the HUD takes on frame f (keep faces out of them);  hudHits(f, r)  the ones r overlaps
import { capOn, capLayout, enShown, CAP_BAND } from "./caption";
import { factRectAt } from "./card";
import { vlogRectsAt } from "./vlog";
import { msRectsAt, type MsId } from "./ms/when";
import { msFrozen, msHold } from "../freeze";
import { overlaps, type Rect } from "./style";
import { whisperCapAt, whisperRectAt } from "./whisper";

export { Caption, enShown, SPEAKER_COL, capOn, capAlpha, capEnd, capLayout, capRows, CAP_BAND, CAP_ROW, CAP_W, CAP_BOTTOM, ZH_PX, ZH_MIN, EN_PX, ZH_Y, EN_Y0, EN_STEP, type CapLayout, type CapRowLayout } from "./caption";
export { FactCard, factCardAt, cardEnd, SHOWN_CARDS, factRows, factLayout, factRectAt, FACT_SLOT, CARD_X, CARD_BOTTOM, cardTop, CARD_MAXW, CARD_ROW, type FactLayout } from "./card";
export { TitleCard, setTitlePlace, titleRect, titleRectAt, TITLE_HOME, TITLE_RECT, type TitlePlace } from "./title";
export { EndBlack, endBlack, endBlackAlpha, dipAlpha, Black, black, FADE_MIN } from "./end";
export { VlogHud, VLOG_RECT, OFF_AT, STAMP_AT, recAlpha, stampAt, stampRect, clockAt, raceAt, RACES, CLOCK_JOINS, RACE_PRE, RACE_POST, wordOf, batteryAt, vlogRectsAt, type Race } from "./vlog";
export { PhoneMask } from "./phone";
export { HC, FRAME, SAFE, spanK, em, textW, overlaps, turnedRect, type Rect } from "./style";

export type HudItem = "caption" | "card" | "title" | "rec" | "stamp" | "battery" | "whisper" | `ms-${MsId}`;
/** the boxes the HUD takes on frame f (px, 1080 x 1920): the vlog UI (the REC row, the timestamp: its big intro for
 *  the first 2 s of a scene, the battery) and the fact card at the frame the picture shows (msHold(f)), the subtitle
 *  (its real rows' box while one shows), and skin A's items while they show ("ms-<id>": each item's boxes, hud/ms/when.ts
 *  MS_ITEMS box; the title is "ms-title" now, the old "title" block is not drawn). CAP_BAND (x 110-890, y 1280-1460) is the
 *  subtitles' band (the faces checker's "band"). On a whisper line's frames (whisper.ts) her bubble REPLACES the
 *  subtitle: "whisper" = the bubble's box while it shows (hud/whisper.tsx whisperRectAt), and no "caption" box. On the
 *  lead card's frozen frames neither the subtitle nor the bubble shows. */
export const hudRectsAt = (f: number): { what: HudItem; r: Rect }[] => {
  const h = msHold(f), frozen = msFrozen(f);
  const out: { what: HudItem; r: Rect }[] = [...vlogRectsAt(h)];
  const c = capOn(f);
  if (c && !whisperCapAt(f) && !frozen) out.push({ what: "caption", r: capLayout(c.zh, enShown(c)).box });
  const bubble = frozen ? null : whisperRectAt(f);
  if (bubble) out.push({ what: "whisper", r: bubble });
  const card = factRectAt(h);
  if (card) out.push({ what: "card", r: card });
  out.push(...msRectsAt(f));
  return out;
};
/** the HUD items a screen box (a face, a hand) would sit under on frame f */
export const hudHits = (f: number, r: Rect): HudItem[] => hudRectsAt(f).filter((x) => overlaps(x.r, r)).map((x) => x.what);
export { CAP_BAND as CAPTION_BAND };
