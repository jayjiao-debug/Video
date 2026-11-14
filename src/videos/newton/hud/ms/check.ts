// hud/ms/check.ts: THE SMOKE TEST of skin A's timing and places (plain Node: no GL, no browser, no render queue).
//   bash /home/user/newton_work/film/skinA/check.sh          (bundles this file with esbuild and runs it)
// Prints:
//   - the three voice gaps (when.ts gapPending()): "QA: MS gap G1 pending: ..." is a NOTE, never an error: the voice
//     job inserts the gaps later and every item moves with its line;
//   - every item: its frames and seconds, its scene, its gap, whether it draws in the film now, its boxes;
//   - the kit's check (overlay/frame.ts checkOverlays) of every switched-on item against the phone-safe frame, the
//     film's REC row, battery and stamp, the subtitle shown, the whisper bubble, the fact card, the app's buttons (this
//     film's rule: nothing right of x 930 below y 950), the post's text (nothing below y 1490), each other, the quiet
//     span F07..G02 and the effects budget (2 a scene, 45 frames apart). Faces are the faces checker's
//     (scripts/newton/qa/faces: hudRectsAt carries the skin's boxes as "ms-<id>").
// Exit code 0 unless the check finds a fault in an item that is not provisional (provisional boxes are reported as
// notes until the builder fits them).
import { FRAME_9x15, checkOverlays, type FrameSpec, type Zone } from "../../../../kit/overlay/frame";
import { MS_ITEMS, QUIET, FREEZE, msEnabled, msShown, msFrozen, gapLines, sec } from "./when";
import { capOn, capLayout, enShown } from "../caption";
import { factRectAt } from "../card";
import { vlogRectsAt, VLOG_RECT } from "../vlog";
import { whisperCapAt, whisperRectAt } from "../whisper";
import { TOTAL } from "../../story";
import { MS } from "./skin";
import { WASH_PAPER } from "../../wash";

declare const process: { exitCode?: number };   // plain Node (no @types/node in the film's tsc run)
const SPEC: FrameSpec = { ...FRAME_9x15, rec: VLOG_RECT.rec };
const RULES: Zone[] = [
  { what: "the app's buttons (film rule: x > 930 below y 950)", r: { x0: 930, y0: 950, x1: 1080, y1: 1800 } },
  { what: "the post's text (film rule: below y 1490)", r: { x0: 0, y0: 1490, x1: 1080, y1: 1800 } },
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
