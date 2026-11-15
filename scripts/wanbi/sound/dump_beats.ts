// Dumps the Wanbi film's named beats as JSON (stdout), for the sound: nobody types a frame number in cues.json.
// A copy of scripts/hongmen/sound/dump_beats.ts adapted to src/videos/wanbi (beats.ts + story.ts + the segment files'
// own beat tables). Bundled and run by dump_beats.sh (esbuild -> node); it only READS the film's files.
import { HIT, TAG, TAG_OUT, TAG_FLIP, TAG_LEN, HOLDER, BEAT, SHOTS } from "../../../src/videos/wanbi/beats";
import { TOTAL, FPS, LINES, QUOTES, SEGMENTS, CAPTIONS, LEAD, TAIL } from "../../../src/videos/wanbi/story";
// the hook's feint (shots/hook.ts FEINT1: the wind-up, the strike, the stop, the wave restarts): PIC.HOOK.x
import { FEINT1 } from "../../../src/videos/wanbi/shots/hook";
// the segments' own picture beats (their private tables, exported while bundling: see dump_beats.mjs). A segment is
// shots/segX.ts plus shots/segX_ov.ts (its 2D layer, where segment A keeps its table T). Each file is loaded on its own
// (require inside try): one that cannot be evaluated outside the browser only loses ITS picture beats (and a warning).
declare const require: (p: string) => any;
const SEG_LOADERS: Record<string, (() => any)[]> = {
  A: [() => require("../../../src/videos/wanbi/shots/segA"), () => require("../../../src/videos/wanbi/shots/segA_ov")],
  B: [() => require("../../../src/videos/wanbi/shots/segB")],
  C: [() => require("../../../src/videos/wanbi/shots/segC")],
  D: [() => require("../../../src/videos/wanbi/shots/segD")],
  E: [() => require("../../../src/videos/wanbi/shots/segE")],
};

const SHOT: Record<string, number> = {}, SHOT_END: Record<string, number> = {};
for (const s of SHOTS) { SHOT[s.id] = s.from; SHOT_END[s.id] = s.to + 1; }      // SHOT_END = the first frame AFTER the shot
const LINE: Record<string, number> = {}, LINE_END: Record<string, number> = {};
for (const l of LINES) { LINE[String(l.n)] = l.from; LINE_END[String(l.n)] = l.to + 1; }
const CAP: Record<string, number> = {}, CAP_END: Record<string, number> = {};
for (const c of CAPTIONS) { CAP[`${c.line}.${c.k}`] = c.from; CAP_END[`${c.line}.${c.k}`] = c.end + 1; }
const SEG: Record<string, number> = {};
for (const s of SEGMENTS) SEG[s.id] = s.from;
// HOLD.<who>: the frames the jade chip changes to that holder (a list: qinWang and lin hold it twice)
const HOLD: Record<string, number[]> = {};
for (const h of HOLDER) if (h.who) (HOLD[h.who] ??= []).push(h.from);
// PIC.<segment>.<name>: every number (or list of numbers) of the segment builders' private beat tables
const PIC: Record<string, Record<string, number | number[]>> = {};
for (const [id, loads] of Object.entries(SEG_LOADERS)) {
  const out: Record<string, number | number[]> = {};
  for (const load of loads) {
    let m: any = {};
    try { m = load(); } catch (e) { process.stderr.write(`dump_beats: a file of segment ${id} could not be evaluated, its picture beats are missing (${String((e as Error)?.message ?? e).split("\n")[0]})\n`); }
    for (const t of Object.values(((m as any).__SOUND_LOCAL ?? {}) as Record<string, Record<string, unknown>>))
      for (const [k, v] of Object.entries(t ?? {}))
        if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
        else if (Array.isArray(v) && v.length && v.every((x) => typeof x === "number")) out[k] = v as number[];
  }
  PIC[id] = out;
}
PIC.HOOK = { ...FEINT1 };
process.stdout.write(JSON.stringify({
  fps: FPS, total: TOTAL, lead: LEAD, tail: TAIL, tagLen: TAG_LEN,
  HIT, TAG, TAG_OUT, TAG_FLIP, BEAT, HOLD, PIC, SHOT, SHOT_END, LINE, LINE_END, CAP, CAP_END, SEG,
  FILM: { start: 0, end: TOTAL },
  shots: SHOTS.map((s) => ({ id: s.id, line: s.line, seg: s.seg, from: s.from, to: s.to, place: s.place, cam: s.cam, what: s.what })),
  lines: LINES.map((l) => ({ n: l.n, from: l.from, to: l.to, start: l.start, end: l.end, text: l.text })),
  quotes: QUOTES.map((q) => ({ line: q.line, who: q.who, from: q.from, to: q.to, text: q.text })),
  captions: CAPTIONS.map((c) => ({ line: c.line, k: c.k, from: c.from, end: c.end, text: c.text })),
}, null, 1) + "\n");
