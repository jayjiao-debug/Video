// hud/ms/fit.ts: THE SCENE FITS of skin A's items (the v5 scene rebuild). Every item of hud/ms/when.ts is keyed to the
// voice and has a box the effects build laid on TODAY's shots; a rebuilt scene refits its own items in its own file,
// hud/ms/fit_A.ts .. fit_G.ts (one per scene, so seven builders never edit one file), and when.ts lays each fit over its
// item at import. A fit file may only name the items of its own scene (SCENE_OF; when.ts throws on another scene's).
//   fit_A  title (approved, fitted to today's door: refit only if the rebuilt door moves), banner (A04: provisional)
//   fit_B  flick (B01: provisional, held off until B keeps his flicking hand in frame), card / meter0 (approved, the
//          freeze), tick1 (B09: the slot; keep his face clear of it)
//   fit_C  stamp (C07: provisional, rides the chair's seat)
//   fit_D  tick2 (D05: the slot and the note under it)
//   fit_E  lunch (E02: provisional, rides the plate's far rim)
//   fit_F  (none: the quiet span takes no effect; the file is there so every scene has one)
//   fit_G  meter1 (G02: provisional, the slot with 证毕 under it, or the low-left place)
// WHAT A FIT MAY SET (every field optional; frames KEYED TO THE VOICE: afterEnd / afterStart / line(id) / BEAT, never a
// typed number):
//   box          the boxes (film px, 1080 x 1800) the piece may draw in, fitted to the rebuilt face / hand / chair / plate
//                (fx.tsx clamps each piece into its box; the checkers read it). The frame's rules: inside x 54-1026,
//                nothing right of x 930 below y 950, nothing that matters below y 1490, never over a face, the
//                subtitles, the REC row / stamp, the battery or the whisper bubble
//   provisional  false once fitted (check.sh then treats a fault in it as an error, not a note)
//   from, to     its frames (inclusive); a beat that lands on a sound is kept on its sound (when.ts absBeats: the stamp's
//                jolt, the lunch bar's tick), the others are local frames from `from`
//   beats        local beats laid over the item's own
//   heldOff      a reason to hold it off in the film; null RELEASES an item held off (the flick, once B qualifies)
//   slip         the banner only: the box its slip sits in (bannerplace.ts puts the slip beside or below his head);
//                then RE-PROBE Humphrey's track: bash scripts/newton/ms/track.sh
// After a fit: bash /home/user/newton_work/film/skinA/check.sh (0 findings), the faces checker over the item's frames,
// and a still of the item with the mask (remotion_still.sh ... --props='{"mask":true,"fx":{"force":["<id>"],"at":0.5}}').
import type { Rect } from "../../../../kit/overlay/frame";
import { FPS, line, type SceneId } from "../../story";

/** the skin's items (EFFECTS_PLAN rows 1-10) */
export type MsId = "title" | "banner" | "flick" | "card" | "meter0" | "tick1" | "stamp" | "tick2" | "lunch" | "meter1";
/** the scene each item belongs to (its fit file) */
export const SCENE_OF: Record<MsId, SceneId> = { title: "A", banner: "A", flick: "B", card: "B", meter0: "B", tick1: "B", stamp: "C", tick2: "D", lunch: "E", meter1: "G" };
/** one item's fit (see the header) */
export type MsFitItem = { box?: Rect[]; provisional?: boolean; from?: number; to?: number; beats?: Record<string, number>; heldOff?: string | null; slip?: Rect };
/** a scene's fits: item id -> its fit */
export type MsFit = Partial<Record<MsId, MsFitItem>>;

// ---------------------------------------------------------------------------------------------------- anchors
/** a moment `s` seconds after line id's voice ENDS (a sound cue's own anchor: cues.json [id, "end", s]) */
export const afterEnd = (id: string, s: number) => Math.round((line(id).end + s) * FPS);
/** a moment `s` seconds after line id's voice STARTS (cues.json [id, "start", s]) */
export const afterStart = (id: string, s: number) => Math.round((line(id).start + s) * FPS);
