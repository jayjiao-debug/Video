// hud/sheet.tsx: THE OVERLAY SHEET: every overlay of hud/ laid over a real frame of the film, for looking at them
// (only the Remotion path draws DOM overlays: the still.sh previews show the 3D picture alone).
//   /home/user/hm_tools/remotion_still.sh HongmenFilm 870 out.png --props='{"hudsheet":"tags","noov":true}'
// hudsheet = one of the names below; age = frames since the overlay started (default 14: settled); noov hides the
// shots' own overlays so that only the hud shows. Head positions are typed in here in film px, measured on the raw
// frames (a HUD has no World; SHOTS take them from headPx(w, rig)). Inert without the prop.
import React from "react";
import { IP, ipNum } from "../env";
import { registerHud } from "../story";
import { TXT } from "../lang";
import { tags } from "./tag";
import { stamp, title } from "./stamp";
import { inset, bubble } from "./inset";
import { count, ratioBar, times, arrow } from "./extras";

const NAME = typeof IP.hudsheet === "string" ? IP.hudsheet : "";
if (NAME) {
  const AGE = ipNum("age", 14);
  const DEMOS: Record<string, (f: number, from: number) => React.ReactNode> = {
    // f 870 (tent master): three people named at once
    tags: (f, from) => tags(f, [
      { who: "xiangYu", at: { x: 876, y: 1000, r: 118 }, from },
      { who: "liu", at: { x: 606, y: 764, r: 80 }, from: from + 1 },
      { who: "fanZeng", at: { x: 110, y: 1172, r: 110 }, from: from + 2 },
    ], { avoid: [{ x: 430, y: 905, r: 80 }] }),
    // f 915 (jadeIn): one tag on a close head
    tag: (f, from) => tags(f, [{ who: "fanZeng", at: { x: 472, y: 948, r: 290 }, from }]),
    // f 420.. (night, Xiang Yu's quarters): the informer's tag; flip = the frame it turns into the name (default: never)
    officer: (f, from) => tags(f, [{ who: "informer", at: { x: 745, y: 785, r: 175 }, from, len: 400, flipAt: ipNum("flip", 99999) }], { avoid: [{ x: 297, y: 783, r: 200 }] }),
    // f 830 (the gate): the inset, named on `flip` (default 818 = HIT.name)
    inset: (f) => inset({ f, from: 799, flipAt: ipNum("flip", 818) }),
    // f 1140 / f 1605: the idiom stamps
    dance: (f, from) => stamp({ f, id: "dance", from }),
    fish: (f, from) => stamp({ f, id: "fish", from }),
    small: (f, from) => <>{stamp({ f, id: "qinjia", from, x: 330, y: 470 })}{stamp({ f, id: "raw", from, x: 760, y: 470 })}</>,
    // f 100 (tent master): the title
    title: (f, from) => title({ f, from: from - 12, ask: from - 4 }),
    // f 345 (the sand table): the numbers
    count: (f, from) => <>{count({ f, from: from - 6, x: 330, y: 470, text: TXT.n40, camp: "xiang", size: 170 })}{count({ f, from, x: 820, y: 560, text: TXT.n10, camp: "liu", size: 120 })}{ratioBar({ f, from: from - 6, bAt: from, y: 1090 })}</>,
    // f 1890 (Liu Bang's camp by day): the informer again, with the inset and an arrow
    again: (f, from) => <>{tags(f, [{ who: "informer", at: { x: 695, y: 800, r: 97 }, from }], { avoid: [{ x: 162, y: 794, r: 80 }, { x: 473, y: 753, r: 75 }, { x: 905, y: 753, r: 75 }] })}</>,
    // f 2020 (the tent, line 21): the bubble and the inset
    slip: (f, from) => <>{inset({ f, from: from - 4 })}{bubble({ f, from, x: 420, y: 560, text: TXT.informerName, to: { x: 480, y: 760 } })}</>,
    misc: (f, from) => <>{times({ f, hits: [from - 20, from - 10, from], x: 300, y: 500 })}{arrow({ f, from, a: { x: 700, y: 420 }, b: { x: 560, y: 640 } })}</>,
  };
  const draw = DEMOS[NAME];
  if (!draw) throw new Error(`hudsheet "${NAME}": one of ${Object.keys(DEMOS).join(", ")}`);
  registerHud("hudsheet", (f) => draw(f, f - AGE));
}
