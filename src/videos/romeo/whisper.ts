// HER WHISPERED ASIDES (悄悄说, the format's way: the lens leans in a step and tips a few degrees, the edges darken, the
// room sound dips, and her line appears in her own note marked 悄悄说 IN PLACE OF the subtitle, while the lead carries on
// unaware). Keyed by line id, never by a frame: every frame is looked up from the voice timing.
//   WHISPER_LINES    THE LIST (scripts/kit/day/sound/build.py reads this one array for the room dip)
//   whisperAt(f)     the aside running at f: { id, from, to, lean 0..1, edge 0..1, note 0..1 } or null
//   whisperLean(f, cam)  the camera piece: a delta on any CamPose (a step in along the view and a small tip)
// G07 is NOT here: from G07 on every effect is gone (script v2: "Plain words, no bubble"). C02 / C04 are whispered
// questions to Romeo under the balcony, not asides: they keep normal subtitles.
import { FPS, line, type Pose } from "./story";
import { cap } from "./captions";
import { nudge } from "./cam";
import { clamp01, easeInOutCubic } from "../group/story";

export const WHISPER_LINES: string[] = ["B01", "B08", "E03", "F01", "G01"];

/** the treatment's numbers (frames unless named) */
export const WHISPER = { LEAN_IN: 10, LEAN_BACK: 14, EDGE_IN: 6, EDGE_OUT: 8, NOTE_HOLD: 8, step: 0.22, tilt: -2.2 };

type Span = { id: string; word: number; end: number; from: number; to: number };
const SPANS: Span[] = WHISPER_LINES.map((id) => {
  const l = line(id), word = cap(id, 0).from;
  return { id, word, end: l.to, from: word - WHISPER.LEAN_IN, to: l.to + WHISPER.LEAN_BACK + 2 };
});

const ramp = (f: number, a: number, len: number) => easeInOutCubic(clamp01((f - a) / Math.max(1, len)));

/** the aside at frame f, with its strengths (0 outside): lean (the camera), edge (the darkened edges), note (her note) */
export function whisperAt(f: number) {
  const s = SPANS.find((x) => f >= x.from && f <= x.to);
  if (!s) return null;
  const lean = ramp(f, s.word - WHISPER.LEAN_IN, WHISPER.LEAN_IN) * (1 - ramp(f, s.end + 2, WHISPER.LEAN_BACK));
  const edge = ramp(f, s.word - WHISPER.EDGE_IN, WHISPER.EDGE_IN) * (1 - ramp(f, s.end + 2, WHISPER.EDGE_OUT));
  const note = f >= s.word - 2 && f <= s.end + WHISPER.NOTE_HOLD ? 1 : 0;
  return { id: s.id, from: s.word - 2, to: s.end + WHISPER.NOTE_HOLD, lean, edge, note };
}
/** true while an aside's note stands in for the subtitle */
export const whisperCap = (f: number) => (whisperAt(f)?.note ?? 0) > 0;
/** THE LEAN: a step in along the view and a small tip of the horizon, eased; a delta on any camera */
export function whisperLean(f: number, cam: Pose["camera"], o: { step?: number; tilt?: number } = {}): Pose["camera"] {
  const w = whisperAt(f);
  if (!w || w.lean <= 0) return cam;
  return nudge(cam, { fwd: (o.step ?? WHISPER.step) * w.lean, roll: (o.tilt ?? WHISPER.tilt) * w.lean });
}
export const WHISPER_SPANS = SPANS;
export const whisperSecs = (id: string) => { const s = SPANS.find((x) => x.id === id)!; return [s.word / FPS, s.end / FPS]; };
