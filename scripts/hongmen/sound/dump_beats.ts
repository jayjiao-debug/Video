// Dumps the film's named beats as JSON (stdout), for the sound: nobody types a frame number in cues.json.
// Bundled and run by dump_beats.sh (esbuild -> node); it only READS src/videos/hongmen/beats.ts and story.ts.
import { HIT, TAG, BEAT, SHOTS, TAG_LEN } from "../../../src/videos/hongmen/beats";
import { OPENING } from "../../../src/videos/hongmen/sets/privy";
// the segments' own picture beats (their private tables, exported while bundling: see dump_beats.mjs)
// Each segment is loaded on its own (require inside try): a segment that cannot be evaluated outside the browser only
// loses ITS picture beats (PIC.X = {} and a warning), the rest of the dump still works.
declare const require: (p: string) => any;
const SEG_LOADERS: Record<string, () => any> = {
  A: () => require("../../../src/videos/hongmen/shots/segA"),
  B: () => require("../../../src/videos/hongmen/shots/segB"),
  C: () => require("../../../src/videos/hongmen/shots/segC"),
  D: () => require("../../../src/videos/hongmen/shots/segD"),
  E: () => require("../../../src/videos/hongmen/shots/segE"),
};
import { TOTAL, FPS, LINES, QUOTES, SEGMENTS, CAPTIONS, LEAD, TAIL } from "../../../src/videos/hongmen/story";

const SHOT: Record<string, number> = {}, SHOT_END: Record<string, number> = {};
for (const s of SHOTS) { SHOT[s.id] = s.from; SHOT_END[s.id] = s.to + 1; }      // SHOT_END = the first frame AFTER the shot
const LINE: Record<string, number> = {}, LINE_END: Record<string, number> = {};
for (const l of LINES) { LINE[String(l.n)] = l.from; LINE_END[String(l.n)] = l.to + 1; }
const CAP: Record<string, number> = {}, CAP_END: Record<string, number> = {};
for (const c of CAPTIONS) { CAP[`${c.line}.${c.k}`] = c.from; CAP_END[`${c.line}.${c.k}`] = c.end + 1; }
// the opening gesture (sets/privy.ts OPENING; frames from the film's frame 0): the face changes on `change`, the head
// turns from `turn`, the finger runs down the jaw from `trace` to `chin`
const turn = OPENING.RISE + OPENING.HOLD * FPS, trace = turn + OPENING.TURN * FPS;
const OPEN = { change: OPENING.RISE, turn: Math.round(turn), trace: Math.round(trace), chin: Math.round(trace + OPENING.TRACE * FPS), len: OPENING.LEN };
const SEG: Record<string, number> = {};
for (const s of SEGMENTS) SEG[s.id] = s.from;
// PIC.<segment>.<name>: every number (or list of numbers) of the segment builders' private beat tables: the frames the
// PICTURE really uses (segA T.title = the frame the title lands on, segB B.hit2 = the second fist blow ...)
const PIC: Record<string, Record<string, number | number[]>> = {};
for (const [id, load] of Object.entries(SEG_LOADERS)) {
  const out: Record<string, number | number[]> = {};
  let m: any = {};
  try { m = load(); } catch (e) { process.stderr.write(`dump_beats: segment ${id} could not be evaluated, PIC.${id} is empty (${String((e as Error)?.message ?? e).split("\n")[0]})\n`); }
  for (const t of Object.values(((m as any).__SOUND_LOCAL ?? {}) as Record<string, Record<string, unknown>>))
    for (const [k, v] of Object.entries(t ?? {}))
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
      else if (Array.isArray(v) && v.length && v.every((x) => typeof x === "number")) out[k] = v as number[];
  PIC[id] = out;
}
process.stdout.write(JSON.stringify({
  fps: FPS, total: TOTAL, lead: LEAD, tail: TAIL, tagLen: TAG_LEN,
  HIT, TAG, BEAT, OPEN, PIC, SHOT, SHOT_END, LINE, LINE_END, CAP, CAP_END, SEG,
  FILM: { start: 0, end: TOTAL },
  shots: SHOTS.map((s) => ({ id: s.id, line: s.line, seg: s.seg, from: s.from, to: s.to, place: s.place, cam: s.cam, what: s.what })),
  lines: LINES.map((l) => ({ n: l.n, from: l.from, to: l.to, start: l.start, end: l.end, text: l.text })),
  quotes: QUOTES.map((q) => ({ line: q.line, who: q.who, from: q.from, to: q.to, text: q.text })),
  captions: CAPTIONS.map((c) => ({ line: c.line, k: c.k, from: c.from, end: c.end, text: c.text })),
}, null, 1) + "\n");
