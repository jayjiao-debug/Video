// src/videos/wanbi/hud/: EVERYTHING DRAWN OVER THE PICTURE of the Wanbi film (1080 x 1920 px), BIBLE sections 6-7.
// WP1a wrote this file as the typed stub (every overlay with its final signature); WP6 filled it: the code lives in
// hud/*.tsx (base, tag, stamp, chip, extras, inset, graphic, fx) and is re-exported here under the SAME names and
// signatures. Captions are Film.tsx's <Caption> (line 1: two rows from frame 0).
// =====================================================================================================================
// THE API (for shot builders). Every one is a PLAIN FUNCTION of the frame that returns a React node: no hooks, no
// state, nothing random (hash01(i, k) for strokes), so frames render in any order on fresh pages. Segment files are .ts:
// call the function and put the node into Pose.overlays (frag(...) from shots/common.ts joins several).
//   import { tag, tags, stamp, cities, army, arrow, mark, ring, shout, bubble, crowns, suns, stage, bill, label,
//            glint, burst, streak, tint, puff, rage, steam, glow, sweat, smear, panic } from "../hud";
// TIMES are absolute film frames from beats.ts (TAG.x, TAG_OUT.x, HIT.x, BEAT.x): `from` = the first frame; the overlay
// leaves by itself (`len` frames later) or on `out` (the first frame of its 5-frame leave: gone from out + 5). Give
// the overlay on EVERY frame of the shot (it returns null outside its life). Overlays never cross a cut (BIBLE rule
// 11) except the HUD (source tag, chip) and the stage (13 -> 14).
// PLACES are film px. A head comes from headPx(w, rig) (shots/common.ts, after w.update()): { x, y, r }; a world point
// from w.project(v) -> { x, y }.
// ZONES (layout.ts SCREEN): nothing above y 210, in the caption band 1190-1498, below 1613, or right of x 930 below
// y 900; the source tag owns the top-left corner (y 189-231), the jade chip the top right (CHIP_RECT). Tags obey them
// by themselves; everything else is placed by the builder at the storyboard's numbers (stampRect, shoutSize, billRect,
// tagRects give the boxes to check against).
// ENGLISH: every string is L(zh, en); no personal name in English. Tags keep TAG_X from the edges.
//
//   NAME TAGS (hud/tag.tsx)
//     tag({ f, who: "qinWang", at: headPx(w, king), from: TAG.qinWang, out: TAG_OUT.qinWang })
//     tags(f, [{ who: "miao", at: hm, from: TAG.miao }, { who: "lin5", at: hl, from: TAG.lin5 }], { avoid: [hk] })
//     tag({ f, who: "lin23", at, from: TAG.lin23, out: TAG_OUT.lin23, flipAt: TAG_FLIP.lin23 })   the 23b flip
//       who = a key of beats.ts TAG (lin0, lin5, lin23, qinWang, zhaoWang, zhaoMin, miao, ladies, qinMin, servant).
//       The plate is CHARCOAL with a gold name for Qin, TEAL with a cream name for Zhao; it sits above the head with
//       its tail on the headwear (TAG_LIFT per person; `lift` overrides); if there is no room (top safe line, another
//       tag, another head, the caption band, the source tag, the chip, the button column) placeTags moves it and the
//       tail still ends on the head. Use tags() for two or more in one shot, and pass the heads of people WITHOUT a
//       tag in `avoid` (any circle: a stamp's place too). Options: len | out; side; lift; scale; text + role + camp.
//   STAMPS (hud/stamp.tsx): a red seal slapped on (lands on from + 2 with a shake); Chinese seal in both languages,
//     English gloss under it (white 44 px, balanced rows of at most 16 letters, one row under a wide seal)
//     stamp({ f, id: "wanbi", from: HIT.wanbi, out: 508, x: 860, y: 470 })   2 x 2 seal, 220 x 220 px (size 78)
//     stamp({ f, id: "liancheng", from: HIT.liancheng, out: 1975, x: 540, y: 270 })   one row (size 124)
//     stampRect(p) = the box it takes (gloss included); stampSize(p) = its { w, h }.
//   THE HUD (hud/chip.tsx), registered below, drawn by Film.tsx on every frame whose Pose does not say hud: false:
//     the jade chip (top right, CHIP_RECT: the holder of beats.ts holderAt, pops on each change) and the source tag
//     《史记》 / "Records of the Grand Historian" (top left). Shots do nothing for them.
//   THE GRAPHIC LAYER (hud/graphic.tsx): cities (arch | ghost | vanish | map | bubble), army, crowns, suns, stage, bill
//   WORDS AND MARKS (hud/extras.tsx): arrow (+ seal), label (EARLIER), mark (? !), ring, shout (万岁)
//   THE BUBBLE (hud/inset.tsx): bubble (thought cloud or speech; `content` = other overlays inside it)
//   FX (hud/fx.tsx): glint, burst, streak, tint, puff, rage, steam, glow, sweat, smear, panic
// Looking at them: hud/sheet.tsx (Remotion only): bash scripts/kit/queue/remotion_still.sh WanbiFilm <f> <out.png>
//   --props='{"wbsheet":"one","noov":true}' (pages one, two; add "lang":"en" for the English version).
// =====================================================================================================================
import { registerHud } from "../story";
import { BEAT } from "../beats";
import { chip, sourceTag } from "./chip";
import "./sheet";

export type { Head, Pt, Rect, Camp, Life } from "./base";
export { TAG_X, CAMP, HC, ZONE, SOURCE_RECT, plate, plateSize, textW, wrapRows, type PlateSpec } from "./base";
export { TAGS, TAG_LIFT, tag, tags, tagRects, placeTags, tagScale, type Who, type Side, type TagItem, type TagProps } from "./tag";
export { STAMP_TEXT, STAMP_GLOSS, stamp, stampSize, stampRect, type StampId, type StampProps } from "./stamp";
export { CHIP_RECT, CHIP_LABEL, CHIP_CAMP, chip, chipPillW, sourceTag, hudK, type SourceProps } from "./chip";
export { cities, army, crowns, crownPts, suns, stage, bill, billRect, BILL_TEXT, BILL_W, BILL_H, ARCH, type CitiesMode, type CitiesProps } from "./graphic";
export { arrow, label, EARLIER, mark, ring, shout, shoutSize, SHOUT_TEXT } from "./extras";
export { bubble, type BubbleProps } from "./inset";
export { glint, burst, streak, tint, puff, rage, steam, glow, sweat, smear, panic } from "./fx";

// ---------------------------------------------------------------------------------------------------- the registered HUDs
// Film.tsx draws them on every frame whose Pose does not say hud: false (shots 1 and 11, BEAT.hookOff).
registerHud("source", (f) => sourceTag({ f, from: BEAT.source, out: BEAT.chipFade[0] }));
registerHud("chip", (f) => chip({ f }));
