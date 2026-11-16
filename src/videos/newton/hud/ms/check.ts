// hud/ms/check.ts: THE SMOKE TEST of skin A's timing and places (plain Node: no GL, no browser, no render queue).
//   bash /home/user/newton_work/film/skinA/check.sh          (bundles this file with esbuild and runs it)
// Prints:
//   - the three voice gaps (when.ts gapPending()): "QA: MS gap G1 pending: ..." is a NOTE, never an error: the voice
//     job inserts the gaps later and every item moves with its line;
//   - every item: its frames and seconds, its scene, its gap, whether it draws in the film now, its boxes;
//   - the kit's check (overlay/frame.ts checkOverlays) of every switched-on item against the film's frame (hud/style.ts
//     FRAME: the kit's FRAME_9x16 with the film's one override): inside x 110-970 and above y 1490, off the REC display
//     (x 110-970, y 225-330) and everything above the words line (y 340), off the app's zones (both cut sides x < 58 /
//     x > 1024, the back / search icons, the button column x >= 890 from y 1000, the post's text x 58-805 from y 1505),
//     off the vlog stamp (its big intro reaches y 344) and battery, the subtitle shown, the whisper bubble, the fact
//     card, each other, the quiet span F07..G02 and the effects budget (2 a scene, 45 frames apart). Faces are the faces checker's
//     (scripts/newton/qa/faces: hudRectsAt carries the skin's boxes as "ms-<id>");
//   - THE CUT-OUT (cutout.ts, freeze.ts): its ink and paper are the skin's (CUT_INK = MS.ink, the line and the place he
//     left = MS.paper), the pass's own wash is off (one wash look: wash.ts), and it lives on the card's frames only, with
//     the card's arrival and leaving (freeze.ts CUT against msItem("card").beats in / leave / out); the lifted
//     sticker against the card's words is the faces checker's (THE CUT-OUT vs THE CARD).
// Exit code 0 unless the check finds a fault in an item that is not provisional (provisional boxes are reported as
// notes until the builder fits them).
import { checkOverlays, type FrameSpec, type Zone } from "../../../../kit/overlay/frame";
import { MS_ITEMS, QUIET, FREEZE, msEnabled, msShown, msFrozen, msItem, gapLines, sec } from "./when";
import { capOn, capLayout, enShown } from "../caption";
import { factRectAt } from "../card";
import { vlogRectsAt } from "../vlog";
import { FRAME } from "../style";
import { whisperCapAt, whisperRectAt } from "../whisper";
import { TOTAL } from "../../story";
import { MS } from "./skin";
import { WASH_PAPER } from "../../wash";
import { CUT, CARD_LEN, cutAt } from "../../freeze";
import { CUT_INK, CUT_LOOK } from "../../cutout";

declare const process: { exitCode?: number };   // plain Node (no @types/node in the film's tsc run)
const SPEC: FrameSpec = FRAME;
const RULES: Zone[] = [
  { what: `above the words line (film rule: y < ${FRAME.top}, the REC display's rows)`, r: { x0: 0, y0: 0, x1: FRAME.W, y1: FRAME.top } },
];
const protect = (f: number): Zone[] => {
  const z: Zone[] = [...RULES];
  for (const v of vlogRectsAt(f)) if (v.what !== "rec") z.push({ what: `the vlog ${v.what}`, r: v.r });
  const c = capOn(f);
  if (c && !whisperCapAt(f) && !msFrozen(f)) z.push({ what: `the subtitle ${c.zh}`, r: capLayout(c.zh, enShown(c)).box });
  const b = whisperRectAt(f);
  if (b && !msFrozen(f)) z.push({ what: "the whisper bubble", r: b });
  const card = factRectAt(f);
  if (card) z.push({ what: "the fact card", r: card });
  return z;
};

console.log(gapLines().join("\n"));
if (WASH_PAPER.toLowerCase() !== MS.paper.toLowerCase()) { console.log(`QA: MS FAULT wash.ts WASH_PAPER ${WASH_PAPER} is not the skin's paper ${MS.paper}`); process.exitCode = 1; }
// THE CUT-OUT: the skin's colours, no second wash, the card's life
{
  const fault = (why: string) => { console.log(`QA: MS FAULT the cut-out: ${why}`); process.exitCode = 1; };
  const card = msItem("card"), b = card.beats;
  if (CUT_INK.toLowerCase() !== MS.ink.toLowerCase()) fault(`cutout.ts CUT_INK ${CUT_INK} is not the skin's ink ${MS.ink}`);
  if (CUT_LOOK.outline.color.toLowerCase() !== MS.paper.toLowerCase() || CUT_LOOK.left.color.toLowerCase() !== MS.paper.toLowerCase()) fault("its line or the place he left is not the skin's paper");
  if (CUT_LOOK.wash.amount !== 0) fault(`the pass's own wash is ${CUT_LOOK.wash.amount}, not 0 (wash.ts is the one wash)`);
  if (b.in !== CUT.in || b.leave !== CUT.leave || b.out !== CUT.out || card.to - card.from + 1 !== CARD_LEN) fault(`freeze.ts CUT ${JSON.stringify(CUT)} and the card's beats in ${b.in} / leave ${b.leave} / out ${b.out} disagree`);
  const on: number[] = [];
  for (let f = card.from - 5; f <= card.to + 5; f++) if (cutAt(f)) on.push(f);
  if (msEnabled("card") && (!on.length || on[0] < card.from || on[on.length - 1] > card.to)) fault(`it shows f${on[0]}-f${on[on.length - 1]}, outside the card's f${card.from}-f${card.to}`);
  console.log(`QA: MS the cut-out: f${on[0] ?? "-"}-f${on[on.length - 1] ?? "-"} (in ${CUT.in} f, out from t ${CUT.out} over ${CUT.leave} f), line ${CUT_LOOK.outline.width} px paper, drop ${CUT_LOOK.shadow.x} / ${CUT_LOOK.shadow.y} px ink, the pass's wash ${CUT_LOOK.wash.amount}`);
}
console.log(`QA: MS film ${TOTAL} frames; the freeze ${msEnabled("card") ? `ON: the picture holds frame ${FREEZE.at} for ${FREEZE.frames} frames` : "OFF (the card waits for G2)"}; quiet ${QUIET[0]}-${QUIET[1]} (${sec(QUIET[0])}-${sec(QUIET[1])} s)`);
for (const i of MS_ITEMS) {
  const on = msEnabled(i.id);
  console.log(`QA: MS row ${String(i.row).padStart(2)} ${i.id.padEnd(6)} ${String(i.from).padStart(4)}-${String(i.to).padEnd(4)} (${sec(i.from)}-${sec(i.to)} s, ${i.to - i.from + 1} f) scene ${i.scene} ${(i.gap ? `${i.gap} ${i.ready ? "in" : "pending"}` : "no gap").padEnd(10)} ${on ? "DRAWS" : "off  "} ${i.heldOff ? `(held off: ${i.heldOff}) ` : ""}${i.provisional ? "provisional " : ""}box ${i.box.map((r) => `${r.x0},${r.y0}..${r.x1},${r.y1}`).join(" + ")}  beats ${JSON.stringify(i.beats)}  | ${i.what}`);
}
const faults = checkOverlays(msShown(), { spec: SPEC, protect, quiet: [QUIET], budget: { perScene: 2, gap: 45 }, step: 1 });
const prov = new Set(MS_ITEMS.filter((i) => i.provisional).map((i) => i.id as string));
const base = (w: string) => w.split("#")[0];
let hard = 0;
for (const x of faults) {
  const soft = prov.has(base(x.what));
  if (!soft) hard++;
  console.log(`QA: MS ${soft ? "note (provisional box)" : "FAULT"} ${x.what} at f${x.f}: ${x.why}`);
}
console.log(`QA: MS check done: ${faults.length} finding(s), ${hard} fault(s) outside provisional boxes`);
if (hard) process.exitCode = 1;
