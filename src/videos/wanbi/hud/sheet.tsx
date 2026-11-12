// hud/sheet.tsx: THE OVERLAY SHEET: the overlays of hud/ laid over a real frame of the film, for looking at them (only
// the Remotion path draws DOM overlays: the still.sh previews show the 3D picture alone). Inert without the prop.
//   bash scripts/kit/queue/remotion_still.sh WanbiFilm 1650 /home/user/wanbi_work/stills/wp6/one_zh.png --props='{"wbsheet":"one","noov":true}'
//   bash scripts/kit/queue/remotion_still.sh WanbiFilm 1650 /home/user/wanbi_work/stills/wp6/one_en.png --props='{"wbsheet":"one","noov":true,"lang":"en"}'
//   bash scripts/kit/queue/remotion_still.sh WanbiFilm 439 /home/user/wanbi_work/stills/wp6/two_zh.png --props='{"wbsheet":"two","noov":true}'
// (the prop is wbsheet, not hudsheet: the Hongmen sheet, in the same bundle, reads hudsheet and throws on other names)
// wbsheet = "one" (frame 1650, the dark hall: the words: two stamps with their glosses, four tags with the 23b flip,
// the chip's six labels, a few fx) or "two" (frame 439, the pale Zhao court: the bill, EARLIER, the arrow's seal, the
// shout, and the language-free graphics: in Chinese the stage, the arch of cities, ?, the ring, the suns, the smear, the
// panic strokes, a glow; in English the tint, the crowns, the thought bubble with its cities, the army, the cities on
// map points); age = frames since the overlays started (default 14: settled); noov hides the shots' own overlays.
// The heads are typed in here in film px (a HUD has no World; shots take them from headPx(w, rig)). The real HUD (chip,
// source tag) draws as on any frame. sheetItems(page) gives each item's boxes (for a headless check).
import React from "react";
import { IP, ipNum } from "../../../kit/film/env";
import { registerHud } from "../story";
import { EN, L } from "../lang";
import type { Holder } from "../beats";
import { CHIP_RECT, TAG_X, type Head, type Rect } from "./base";
import { tags, tagRects, type TagItem } from "./tag";
import { stamp, stampRect } from "./stamp";
import { chipNodes, chipPillW, CHIP_LABEL } from "./chip";
import { arrow, label, mark, ring, shout, shoutSize, EARLIER } from "./extras";
import { bubble } from "./inset";
import { cities, army, crowns, crownPts, suns, stage, bill, billRect, ARCH } from "./graphic";
import { glint, burst, puff, rage, steam, glow, sweat, smear, panic, tint } from "./fx";

export type SheetItem = { name: string; draw: (f: number, from: number) => React.ReactNode; boxes: (f: number, from: number) => Rect[]; text?: boolean };
const box = (x: number, y: number, w: number, h: number): Rect => ({ x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2 });

// ---------------------------------------------------------------------------------------------------- page one
// English plates and glosses are wide (liancheng's seal + gloss 636 px, wanbi's 260 px), so the stamps stack: liancheng
// on top, wanbi below it on the right; three tags stack on the left with their plates pinned left of the heads (the
// heads are invisible here), the King of Qin's sits up from a head under wanbi; the fx fill the corners.
const STAMP_A = { id: "liancheng" as const, x: 414, y: 372 }, STAMP_B = { id: "wanbi" as const, x: 800, y: 690 };
const HX = 640;
const TAG_ITEMS = (from: number): TagItem[] => [
  { who: "lin23", at: { x: HX, y: L(613, 653), r: 24 }, from, len: 400, flipAt: from + 11, side: "left" },
  { who: "miao", at: { x: HX, y: L(757, 776), r: 24 }, from: from + 1, len: 400, side: "left" },
  { who: "lin5", at: { x: HX, y: L(895, 899), r: 24 }, from: from + 1, len: 400, side: "left" },
  { who: "qinWang", at: { x: 760, y: 1105, r: 24 }, from, len: 400 },
];
/** the stamps as circles for placeTags' avoid list (a builder does the same with any box it wants kept clear) */
const asCircles = (r: Rect): Head[] => { const w = r.x1 - r.x0, h = r.y1 - r.y0, n = Math.max(1, Math.round(w / h)); return Array.from({ length: n }, (_, i) => ({ x: r.x0 + (w * (i + 0.5)) / n, y: (r.y0 + r.y1) / 2, r: (Math.max(h, w / n) / 2) * 0.95 })); };
const TAG_AVOID = () => [...asCircles(stampRect(STAMP_A)), ...asCircles(stampRect(STAMP_B))];
const OTHERS: Holder[] = ["zhaoWang", "lin", "qinWang", "ladies", "servant", "inZhao"];
const CHIP_ROW_Y = 1556;
const chipRow = (live: Holder) => OTHERS.filter((h) => h !== live);
// the labels side by side between the side margins, left of the button column (x 930 below y 900)
const chipW = (h: Holder) => Math.max(66 + 6, chipPillW(CHIP_LABEL[h]));
const chipCx = (k: number) => {
  const ws = chipRow("inZhao").map(chipW), tot = ws.reduce((a, b) => a + b, 0), room = 930 - 8 - TAG_X;
  const gap = Math.min(60, (room - tot) / (ws.length - 1)), x0 = TAG_X + (room - tot - gap * (ws.length - 1)) / 2;
  return x0 + ws.slice(0, k).reduce((a, b) => a + b + gap, 0) + ws[k] / 2;
};
const ONE: SheetItem[] = [
  { name: "stamp liancheng", text: true, draw: (f, from) => stamp({ f, from, len: 400, ...STAMP_A }), boxes: () => [stampRect(STAMP_A)] },
  { name: "stamp wanbi", text: true, draw: (f, from) => stamp({ f, from, len: 400, ...STAMP_B }), boxes: () => [stampRect(STAMP_B)] },
  { name: "tags (lin23 flipped, miao, lin5, qinWang)", text: true, draw: (f, from) => tags(f, TAG_ITEMS(from), { avoid: TAG_AVOID() }), boxes: (f, from) => tagRects(f, TAG_ITEMS(from), TAG_AVOID()) },
  { name: "chip labels", text: true, draw: (f) => <>{chipRow("inZhao").map((h, k) => chipNodes(`c${h}`, h, 1, 1, 0, chipCx(k) - (CHIP_RECT.x0 + CHIP_RECT.x1) / 2, CHIP_ROW_Y - (CHIP_RECT.y0 + CHIP_RECT.y1) / 2))}{void f}</>,
    boxes: () => chipRow("inZhao").map((h, k) => box(chipCx(k), CHIP_ROW_Y, chipW(h), CHIP_RECT.y1 - CHIP_RECT.y0)) },
  { name: "sweat", draw: (f) => sweat({ f, from: f - 6, x: 130, y: 1050 }), boxes: () => [box(130, 1065, 50, 70)] },
  { name: "glint", draw: (f) => glint({ f, from: f - 2, x: 230, y: 1065 }), boxes: () => [box(230, 1065, 90, 90)] },
  { name: "burst", draw: (f) => burst({ f, from: f - 3, x: 345, y: 1070, r: 44 }), boxes: () => [box(345, 1070, 120, 120)] },
  { name: "rage", draw: (f, from) => rage({ f, from, at: { x: 470, y: 1100, r: 30 } }), boxes: () => [box(470, 1075, 120, 70)] },
  { name: "puff", draw: (f) => puff({ f, from: f - 4, x: 870, y: 550, r: 26 }), boxes: () => [box(870, 530, 120, 70)] },
  { name: "steam", draw: (f, from) => steam({ f, from, x: 870, y: 465, w: 70 }), boxes: () => [box(870, 410, 100, 110)] },
];

// ---------------------------------------------------------------------------------------------------- page two
const BILL_AT = { x: 440, y: 630 }, LABEL_AT = { x: 300, y: 900 }, SHOUT_AT = { x: 696, y: 1009 };
const ARROW = { a: { x: 430, y: 1110 }, b: { x: 165, y: 1080 } };
const MAP_PTS = Array.from({ length: 15 }, (_, i) => ({ x: 565 + i * 24, y: CHIP_ROW_Y + (i % 2 ? 14 : -14) }));
const TWO_TEXT: SheetItem[] = [
  { name: "bill", text: true, draw: (f, from) => bill({ f, from, len: 400, zeroAt: [from + 2, from + 8], ...BILL_AT }), boxes: () => [billRect(BILL_AT.x, BILL_AT.y)] },
  { name: "label EARLIER", text: true, draw: (f, from) => label({ f, from, text: EARLIER, ...LABEL_AT }), boxes: () => [box(LABEL_AT.x, LABEL_AT.y, EN ? 270 : 150, 70)] },
  { name: "arrow + seal", text: true, draw: (f, from) => arrow({ f, from, seal: L("秦", "QIN"), ...ARROW }), boxes: () => [{ x0: 100, y0: 1025, x1: 445, y1: 1130 }] },
  { name: "shout", text: true, draw: (f) => shout({ f, from: f - 5, ...SHOUT_AT }), boxes: () => { const s = shoutSize(); return [box(SHOUT_AT.x, SHOUT_AT.y, s.bw, s.bh)]; } },
];
const STAGE_AT = { x: 880, y: 640 };
const TWO_ZH: SheetItem[] = [
  { name: "stage", draw: (f, from) => stage({ f, from, at: STAGE_AT, r: 105 }), boxes: () => [] },
  { name: "cities arch", draw: (f, from) => cities({ f, from: from - 6, mode: "arch" }), boxes: () => [{ x0: ARCH[0].x - 31, y0: ARCH[7].y - 31, x1: ARCH[14].x + 31, y1: ARCH[0].y + 31 }] },
  { name: "mark ?", draw: (f, from) => mark({ f, from, x: 880, y: 600, text: "?" }), boxes: () => [box(880, 600, 100, 160)] },
  { name: "ring", draw: (f, from) => ring({ f, from, at: { x: 880, y: 760 } }), boxes: () => [box(880, 760, 120, 110)] },
  { name: "smear", draw: (f) => smear({ f, from: f - 1, a: { x: 800, y: 440 }, b: { x: 1000, y: 410 } }), boxes: () => [{ x0: 785, y0: 360, x1: 1020, y1: 455 }] },
  { name: "suns", draw: (f, from) => suns({ f, from: from - 16, x: 540, y: CHIP_ROW_Y }), boxes: () => [box(540, CHIP_ROW_Y, 5 * 64 * 1.32, 70)] },
  { name: "panic", draw: (f, from) => panic({ f, from, pts: [{ x: 120, y: CHIP_ROW_Y + 10 }, { x: 235, y: CHIP_ROW_Y + 10 }] }), boxes: () => [{ x0: 60, y0: 1500, x1: 295, y1: 1600 }] },
  { name: "glow", draw: (f, from) => glow({ f, from, x: 855, y: CHIP_ROW_Y }), boxes: () => [box(855, CHIP_ROW_Y, 120, 110)] },
];
const TWO_EN: SheetItem[] = [
  { name: "tint", draw: (f, from) => tint({ f, from }), boxes: () => [] },
  { name: "crowns (half crossed)", draw: (f, from) => crowns({ f, from: from - 20, crossAt: f - 11 }), boxes: () => { const p = crownPts(); return [{ x0: p[0].x - 30, y0: p[0].y - 30, x1: p[10].x + 30, y1: p[21].y + 30 }]; } },
  { name: "thought bubble + cities", draw: (f, from) => bubble({ f, from, x: 886, y: 640, r: 88, to: { x: 940, y: 830 }, content: cities({ f, from: from + 2, mode: "bubble", x: 886, y: 654, size: 36 }) }), boxes: () => [box(886, 640, 196, 166), box(922, 785, 50, 100)] },
  { name: "army (one row)", draw: (f, from) => army({ f, from, rows: [CHIP_ROW_Y], x0: 96, x1: 510 }), boxes: () => [{ x0: 96, y0: CHIP_ROW_Y - 36, x1: 510, y1: CHIP_ROW_Y + 36 }] },
  { name: "cities map (pulse)", draw: (f, from) => cities({ f, from: from - 6, mode: "map", pts: MAP_PTS, pulseAt: f - 3 }), boxes: () => [{ x0: 545, y0: CHIP_ROW_Y - 40, x1: 921, y1: CHIP_ROW_Y + 40 }] },
];
/** the items of a sheet page (in the active language) */
export const sheetItems = (page: string): SheetItem[] => (page === "one" ? ONE : page === "two" ? [...(EN ? TWO_EN : TWO_ZH), ...TWO_TEXT] : []);
export const SHEET_PAGES = ["one", "two"];

const NAME = typeof IP.wbsheet === "string" ? IP.wbsheet : "";
if (NAME) {
  const AGE = ipNum("age", 14);
  const pages = NAME.split(",").map((s) => s.trim());
  for (const pg of pages) if (!SHEET_PAGES.includes(pg)) throw new Error(`wbsheet "${pg}": one of ${SHEET_PAGES.join(", ")}`);
  const items = pages.flatMap(sheetItems);
  registerHud("hudsheet", (f) => <>{items.map((it, i) => <React.Fragment key={i}>{it.draw(f, f - AGE)}</React.Fragment>)}</>);
}

