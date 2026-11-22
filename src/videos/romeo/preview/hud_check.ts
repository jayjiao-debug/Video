// preview/hud_check.ts: THE PHONE-SAFE CHECK of the skin's default places (plain Node, no page): every piece's box
// (hud/*Rect) through the kit's checkOverlays against FRAME_9x16 (the REC display, the app's buttons, the cut sides,
// nothing below y 1490), plus the film's own rule that a piece below y 1000 stays left of x 890. It knows no faces and
// no captions: the scene builder's smoke test adds those (protect) with the real frames.
//   node -e "require('esbuild').buildSync({entryPoints:['src/videos/romeo/preview/hud_check.ts'],bundle:true,platform:'node',outfile:process.argv[1],logLevel:'error'})" <scratch>/rj_hud_check.cjs && node <scratch>/rj_hud_check.cjs
import { checkOverlays, FRAME_9x16, type Shown, type Rect } from "../../../kit/overlay/frame";
import { titleRect, tallyRect, whisperRect, noteRect, factRect, stampRect, nameTabRect, friarBannerRect, END } from "../hud";

const still = (what: string, kind: Shown["kind"], r: Rect, from: number): Shown => ({ what, kind, from, to: from + 10, rect: () => r });
const head: Rect = { x0: 380, y0: 480, x1: 720, y1: 980 };
const items: Shown[] = [
  still("title", "title", titleRect(), 0),
  still("tally", "effect", tallyRect(), 0),
  still("whisper", "effect", whisperRect("他昨天还在为别人哭呢。"), 100),
  still("whisper 2 rows", "effect", whisperRect("认识不到一天就要结婚，我该不该拦一下？"), 200),
  still("note 失恋", "effect", noteRect("一个白天", "失恋：", 500, 1090), 300),
  still("note 月亮", "effect", noteRect("他一天。", "月亮一月一变，", 500, 1090), 400),
  still("note 假死", "effect", noteRect("她是假死", "信里写着：", 500, 1090), 500),
  still("fact 判决", "card", factRect(["判决：驱逐。", "回来就是死。"]), 600),
  still("fact 瘟疫", "card", factRect(["送信人被瘟疫封了门。", "信没出城。"]), 700),
  still("stamp", "effect", stampRect(500, 1096), 800),
  still("end card", "card", END.box, 900),
  { what: "Romeo tab", kind: "card", from: 1000, to: 1150, rect: (f) => nameTabRect(f, 1000, "romeo", head) },
  { what: "Juliet tab", kind: "card", from: 1200, to: 1350, rect: (f) => nameTabRect(f, 1200, "juliet", head) },
  { what: "Friar banner", kind: "card", from: 1400, to: 1505, rect: (f) => friarBannerRect(f, 1400, head) },
];
const faults = checkOverlays(items, { spec: FRAME_9x16, step: 1 });
for (const i of items) for (let f = i.from; f <= i.to; f += 5) { const r = i.rect(f); if (r && r.y1 > 1000 && r.x1 > 890) { faults.push({ what: i.what, f, why: `right of x 890 below y 1000 (x1 ${Math.round(r.x1)})` }); break; } }
for (const i of items) { const r = i.rect(i.from + 60 > i.to ? i.from : i.from + 60); if (r) console.log(`${i.what}: x ${Math.round(r.x0)}..${Math.round(r.x1)}, y ${Math.round(r.y0)}..${Math.round(r.y1)}`); }
console.log(faults.length ? faults.map((x) => `FAULT ${x.what} (f ${x.f}): ${x.why}`).join("\n") : "phone-safe check: clean");
