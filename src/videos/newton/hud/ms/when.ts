// hud/ms/when.ts: WHEN AND WHERE every piece of skin A 「手稿」 shows (stage 1 of 3). One data line per item of the
// placement plan (EFFECTS_PLAN.md revision 2, "The placement table" rows 1-10 and the quiet span:
// /mnt/project-files/next-video/newton/redo/looks/EFFECTS_PLAN.md), each KEYED TO THE VOICE: line(id).from / .to (frames)
// plus the plan's offsets, or a sound cue's own anchor (scripts/newton/sound/cues.json: [line, "end", s]) for the
// moments that land ON a sound (the jolt, the fork clink, the thump). NEVER a hard frame number: the voice job inserts
// the plan's three gaps later (G1 +1.2 s before A03, G2 +2.5 s after B03 (Jay 20:15; the plan said 1.3 s), G3 +0.5 s
// after B09) and every item moves with its line.
//
//   MS_ITEMS / msItem(id)     the items: frames (inclusive), the local beats, the gap each needs, the boxes it may use
//   msOn(id, f)               whether item id draws on film frame f (in its frames AND switched on: below)
//   msT(id, f)                its local frame t (0 on its first frame) on f, or null
//   msLife(id, f)             the kit's life() for it (arrive / leave over its beats.in / beats.out), or null
//   QUIET                     the span that takes no effect: F07's first word to G02's last frame (the 1/1 comes after)
//   MS_CLOCK, msHold(f), msFreezeAt(f), msFrozen(f), washAt(f), FREEZE
//                             THE FREEZE, re-exported from src/videos/newton/freeze.ts (picture side: it decides the
//                             frame the world is posed at, so it lives outside hud/): the picture and the vlog HUD stop on
//                             B03's last frame and hold it through the lead card's 75 frames; Film.tsx poses the world at
//                             msHold(f). No freeze while the card is off.
//   gapPending()              the three gaps: whether the voice track has each yet (the smoke test prints it)
//   msRectsAt(f)              the boxes the skin takes on frame f (hud/index.ts hudRectsAt: the faces checker)
//   msShown()                 every item as the kit's Shown (checkOverlays in hud/ms/check.ts)
//   MS_FX / msStillFrame(f)   THE STILL TEST PROP (Film.tsx header): --props='{"fx":{"force":["card"],"at":0.4}}'
//
// SWITCHED ON: an item draws when the gap it needs is in the voice track (ready), or when it is harmless before then
// (whilePending "show": the title, tick 1), or when a still forces it (MS_FX.force). The lead card, its freeze and the
// meter's birth stay OFF until G2 is in (line("B04").preFrom - line("B03").to leaves the card's 75 frames clear):
// the film's length is NOT changed here (TOTAL and SEGMENTS come from the voice track). An item with `heldOff` set
// never draws in the film (a review note holds it back until its scene is rebuilt); a still may still force it.
//
// THE BOXES: `box` is where an item may draw (film px, 1080 x 1920); the builders keep every pixel that matters inside
// it (the faces checker and check.ts read it). THE SCENE FITS (v5 rebuild): a scene builder refits its own items in
// hud/ms/fit_<scene>.ts (fit.ts says what a fit may set: box, provisional, from / to, beats, heldOff, the banner's
// slip), never here; MS_ITEMS below lays every fit over its item (FIT, SCENE_OF: a fit names only its own scene's items). `provisional: true` = the
// plan's region or the approved frame's place, not yet fitted to the rebuilt scene (the builder fits it to the face /
// hand / chair / plate it belongs to and sets provisional false). The frame's rules (every box; 9:16, hud/style.ts
// FRAME, Jay 15 Nov): inside x 110-970 from y 340 (under the REC display x 110-970, y 225-330); nothing right of x 890
// below y 1000 (the app's buttons); nothing below y 1490 (the post's text from 1505); never over a face, the subtitles,
// the REC row / stamp, the battery or the whisper bubble. THE 9:16 MOVE: every picture-tied box (the title on the door,
// the banner by his head, the flick on the hand, the stamp on the chair, the lunch bar on the plate, the low-left 1/1)
// is its 9:15 box + 60 in y (the lens kept its width of view: a 9:15 point (x, y) is (x, y + 60) now), then pulled
// inside the rules above; the HUD-tied ones (the meter's slot and its note, the lead card's slip) follow the frame:
// the meter's slot is x 696-970, y 340-494, under the battery (skin.ts METER), the lead card's slip x 110-890,
// y 996-1490 (card.tsx CARD_T). FRAME.md (newton_work/film/f916) has each item's allowed area.
import { FPS, line, card, seg, segmentAt, type SceneId } from "../../story";
import { whisperSpan } from "../../whisper";
import { IP } from "../../../../kit/film/env";
import { life, clamp01, type Life } from "../../../../kit/overlay/time";
import { CARD_LEN, CUT, DRAIN, FREEZE, FREEZE_ON, G2_READY, WIPE } from "../../freeze";
import type { Rect, Shown } from "../../../../kit/overlay/frame";
import { bannerPlace, bannerRects, type Head } from "./bannerplace";
import { HUMPHREY_TRACK } from "./track";
import { SCENE_OF, afterEnd, afterStart, type MsFit, type MsFitItem, type MsId } from "./fit";
import { FIT_A } from "./fit_A";
import { FIT_B } from "./fit_B";
import { FIT_C } from "./fit_C";
import { FIT_D } from "./fit_D";
import { FIT_E } from "./fit_E";
import { FIT_F } from "./fit_F";
import { FIT_G } from "./fit_G";

// ---------------------------------------------------------------------------------------------------- anchors
// afterEnd(id, s) / afterStart(id, s): a moment s seconds after line id's voice ends / starts (cues.json anchors): fit.ts
export { afterEnd, afterStart, SCENE_OF };
export type { MsId, MsFit, MsFitItem };

// ---------------------------------------------------------------------------------------------------- the scene fits
/** THE SCENE FITS (hud/ms/fit_A.ts .. fit_G.ts), one map; each file names only its own scene's items */
const FITS: Record<SceneId, MsFit> = { A: FIT_A, B: FIT_B, C: FIT_C, D: FIT_D, E: FIT_E, F: FIT_F, G: FIT_G };
for (const [sc, fit] of Object.entries(FITS)) for (const id of Object.keys(fit) as MsId[]) {
  if (!(id in SCENE_OF)) throw new Error(`hud/ms/fit_${sc}.ts: "${id}" is not a skin item (${Object.keys(SCENE_OF).join(" ")})`);
  if (SCENE_OF[id] !== sc) throw new Error(`hud/ms/fit_${sc}.ts: "${id}" is scene ${SCENE_OF[id]}'s item: fit it in fit_${SCENE_OF[id]}.ts`);
}
/** every item's fit (empty when its scene has not fitted it) */
export const FIT: Partial<Record<MsId, MsFitItem>> = Object.assign({}, ...Object.values(FITS));

// ---------------------------------------------------------------------------------------------------- the items
export type MsGap = "G1" | "G2" | "G3";
export type MsItem = {
  id: MsId;
  /** the plan's row */ row: number;
  what: string;
  /** the kit's family (checkOverlays budget: only "effect" counts) */ kind: "title" | "card" | "effect";
  /** which component draws it: hud/ms/title.tsx, card.tsx or fx.tsx */ layer: "title" | "card" | "fx";
  scene: SceneId;
  /** inclusive film frames */ from: number; to: number;
  /** its moments in LOCAL frames (t = 0 on `from`): in = frames to arrive, leave = frames to leave, out = the first
   *  frame of leaving (len - leave, filled in), the rest named per item */ beats: Record<string, number>;
  /** moments that land ON A SOUND, as absolute film frames: each becomes a local beat (frame - from) after the scene
   *  fit, so a refitted `from` never moves them off their sound (the stamp's jolt, the lunch bar's tick) */ absBeats?: Record<string, number>;
  /** the gap in the voice track it needs, whether that gap is there, and what happens until it is */
  gap: MsGap | null; ready: boolean; whilePending: "show" | "off";
  /** where it may draw (film px); provisional = not yet fitted to the rebuilt scene */ box: Rect[]; provisional: boolean;
  /** for a piece that rides a person on every frame: its boxes on frame f (the checkers use these instead of `box`,
   *  which is then their envelope) */ boxAt?: (fr: number) => Rect[];
  /** what it says (the plan's words; the builders draw exactly these) */ words: string[];
  /** held OFF in the film for this reason (a review note; a still may still force it), whatever its gap */ heldOff?: string;
};

// --- the anchors, each from the plan's row
const A05 = line("A05"), B01 = line("B01"), B02 = line("B02"), B03 = line("B03"), B04 = line("B04");
const B09 = line("B09"), C07 = line("C07"), D05 = line("D05"), E02 = line("E02"), E03 = line("E03"), F07 = line("F07"), G02 = line("G02");

/** row 1, THE TITLE: ON THE SLAM'S AUDIBLE THUD: A02's end + 0.37 s (sfx_door_shut's start, cues.json) + 0.27 s (the
 *  thud inside the clip), the very frame segA's SND.thud shuts the door on (director r1 note 4: BEAT.A.doorShut, A02 end
 *  + 0.4 s, is the clip's latch tick, 7 frames early, while the door still swings with his face in the doorway; beats.ts'
 *  "the door is shut on this frame" is 7 frames off: its owner is told). 56 frames: in 18 or less, held 30, out 8 or less.
 *  Needs G1: it must be gone before A03's whisper bubble. THE PLAN'S FALLBACK (EFFECTS_PLAN "Length"): the title held
 *  0.8 s, 50 frames; on today's voice track it resolves to 50 (the thud at f184, gone on f233, A03's bubble at f234).
 *  The full 56 whenever they still end before the bubble. */
const TITLE_FROM = afterEnd("A02", 0.37 + 0.27), A03_BUBBLE = whisperSpan("A03").word;
const TITLE_LEN = TITLE_FROM + 56 - 1 < A03_BUBBLE ? 56 : 50;
/** row 4, THE LEAD CARD: the picture stops on B03's last frame (her walk has landed on 写) and holds; the card shows on
 *  the 75 frames after it (B03.to + 1 .. B03.to + 75, 2.5 s: the voice track's and the mix's G2, Jay 20:15); the picture
 *  runs again on B03.to + 76. Needs G2. The freeze itself: src/videos/newton/freeze.ts (FREEZE.at = B03.to,
 *  CARD_LEN = 75) */
const FREEZE_AT = FREEZE.at;

const SLOT: Rect = { x0: 696, y0: 340, x1: 970, y1: 494 };   // skin.ts METER: under the REC display's battery (9:16)
/** row 2, HUMPHREY'S BANNER: in as he comes out of his door (segA H_OUT0: the latch, A03's end + 0.6 s, + 4 frames;
 *  his face is behind the door before it), gone the frame before A05's voice (her snap zoom); fit_A may move both */
const BAN_FROM = FIT.banner?.from ?? afterEnd("A03", 0.6) + 4, BAN_TO = FIT.banner?.to ?? A05.from - 1;
/** the banner's slip box: today's A04 has no room beside his head for the approved size (his face reaches x 336-433 on
 *  f340-378), so the slip rides BELOW the lowest point his head reaches (his face to y 851, his outline to y 856 on
 *  f350), on the door left of him (bannerplace.ts "below"); the A rebuild's clear 360 x 270 beside his head moves this
 *  box there and the banner goes beside him (the approved place) by itself */
const BAN_SLIP: Rect = FIT.banner?.slip ?? { x0: 110, y0: 922, x1: 600, y1: 1230 };   // 9:15 + 60, from x 110
/** his head on frame f from the probed track (track.ts; the last probed frame past its end) */
const humAt = (fr: number): Head => {
  const T = HUMPHREY_TRACK, i = Math.min(T.n - 1, Math.max(0, fr - T.first)) * 3;
  return { x: T.xyr[i], y: T.xyr[i + 1], r: T.xyr[i + 2] };
};
/** the banner's boxes on frame f: the slip, the manicule's finger and fist (bannerplace.ts, on the track's head) */
export const bannerBoxesAt = (fr: number): Rect[] => bannerRects(bannerPlace(humAt(fr), BAN_SLIP));
/** the banner's place on frame f from the track (banner.tsx holds its live place within a few px of it) */
export const bannerTrackPlace = (fr: number) => bannerPlace(humAt(fr), BAN_SLIP);
const union = (rs: Rect[]): Rect => ({ x0: Math.min(...rs.map((r) => r.x0)), y0: Math.min(...rs.map((r) => r.y0)), x1: Math.max(...rs.map((r) => r.x1)), y1: Math.max(...rs.map((r) => r.y1)) });
const BAN_ENVELOPE = (() => {
  const all: Rect[] = [];
  for (let fr = BAN_FROM; fr <= BAN_TO; fr++) all.push(...bannerBoxesAt(fr).slice(1));
  const u = union(all);
  return { x0: Math.floor(u.x0), y0: Math.floor(u.y0), x1: Math.ceil(u.x1), y1: Math.ceil(u.y1) };
})();      // the meter's slot (plan: top right, under the battery; 9:16: under the REC display, from y 340)

const raw: Omit<MsItem, "scene" | "ready">[] = [
  {
    id: "title", row: 1, what: "the title 采访牛顿的一天 on the shut door", kind: "title", layer: "title",
    from: TITLE_FROM, to: TITLE_FROM + TITLE_LEN - 1,
    // the approved beats (looks.md A, f0 = the thud), fitted to in <= 18: the leaf slaps on (3 f), the compass draws
    // the orbit (7 f), 牛 then 顿 written in crimson (5 f a character), 采访 / 的一天 (3 f apart); held while the ink
    // dries; the ink sinks (to sepia, then gone) and the empty leaf is sucked under the door
    beats: { in: 18, slap: 0, orbit: 2, name: 3, small: 12, hold: 18, leave: 8, sink: TITLE_LEN - 8, under: TITLE_LEN - 4 },
    gap: "G1", whilePending: "show",
    box: [{ x0: 110, y0: 360, x1: 970, y1: 1000 }], provisional: false,   // 9:15 + 60 (on the door), +14 x (title.tsx LAYOUT_DX)
    words: ["采访", "牛顿", "的一天"],
  },
  {
    id: "banner", row: 2, what: "Humphrey's banner (a side card, no freeze)", kind: "card", layer: "card",
    // director r1 note 6 (Jay 20:15: a side card stays 3-4 s and travels with its person): in as he comes out of his
    // door, gone the frame before A05; 77 frames on today's voice track (the A rebuild brings his exit earlier for 90+)
    from: BAN_FROM, to: BAN_TO,
    beats: { in: 10, slip: 0, name: 3, tag: 7, hand: 9, leave: 6 },
    gap: null, whilePending: "show",
    // r2: the approved size (scale 1.0), placed from his head on every frame (bannerplace.ts): the slip in BAN_SLIP
    // (below his head on today's A04), the manicule's tip on his cheek line (6 px outside his outline). The checkers
    // read the per-frame boxes (boxAt, from the probed track.ts); box[1] is the manicule's envelope over the hold.
    // Refit (BAN_SLIP beside his head, re-probe track.ts) after the A rebuild
    box: [BAN_SLIP, BAN_ENVELOPE], provisional: true, boxAt: bannerBoxesAt,
    words: ["汉弗莱", "助手", "今日关键证人"],
  },
  {
    id: "flick", row: 3, what: "the detail zoom on the flick: 意思：别烦我", kind: "effect", layer: "fx",
    // on the flick's swish (B01 end + 0.08 s, cues.json "the flick"), out 2 frames before B02
    from: B01.to + Math.round(0.08 * 30), to: B02.from - 2,
    beats: { in: 4, ring: 0, label: 4, leave: 5 },
    gap: null, whilePending: "show",
    // stage 2b, fitted to today's segB, which pans off him during the flick (his hand at x 935, y 761 on its first frame,
    // out of the picture from f775): THE RING's box (the plan: a hand right of x 820 puts the ring up-left of it, in the
    // gap between the two men, with a short leader; here under his face, down to y 657 on f768, and right of
    // Humphrey's, to x 650 on f786), then THE LABEL's, under the ring and left of x 930 (Humphrey's face ends at y 814).
    // fx.tsx flickPlace clamps each part into its box. Refit after the rebuild stages the flick
    // 9:16: the 9:15 boxes + 60, pulled inside x 970 (above y 1000) and x 890 (the label, which reaches below y 1000)
    box: [{ x0: 664, y0: 729, x1: 970, y1: 969 }, { x0: 560, y0: 969, x1: 890, y1: 1050 }], provisional: true,
    words: ["意思：别烦我"],
    // DIRECTOR r1 NOTE 3: on today's segB Newton leaves the picture at f775, so the ring circles an empty shelf and the
    // label reads as Humphrey's. OFF until the B rebuild keeps his flicking hand in frame and steady from B01's end to
    // B02 (70 px or more across, clear of both faces) and these boxes are refitted to it (ring on the hand, the label
    // down-left, as swatch_A); if it cannot, the editor drops row 3 (the plan's fallback)
    heldOff: "director r1 note 3: Newton is out of the picture from f775 (the label would read as Humphrey's); waits for the B rebuild",
  },
  {
    id: "card", row: 4, what: "Newton's intro card (the 2.5 s freeze after B03)", kind: "card", layer: "card",
    from: FREEZE_AT + 1, to: FREEZE_AT + CARD_LEN,
    // 75 frames (director r1 note 1: the voice track and the mix hold 75): the cut-out lifts him off the page and the
    // card builds in 6 f (freeze.ts CUT.in), holds, leaves t 67-74 (CUT.out, CUT.leave: the cut-out settles back with it)
    // while its target line flies to the meter's slot and lands there on t 74; the wash: a page-turn wipe sweeps the
    // colour out of the room (t 0-5), the ink drains back into colour (t 71-74). r3 (14 Nov night): THE SEAL PRESSES ON
    // f939 (t 23), where the morning music turns from A major to G major inside the freeze (REMIX_v5.md: its G-major
    // section from 31.30 s), and the build is laid out to lead to it: the slip laid from `wipe` and the compass from
    // `construct` (t 0-6, with the cut-out), the name from `name` (t 1-6: who he is, first), the date from `date`, the
    // three propositions from `stats`, one every `rowGap` frames (t 8, 11, 14), the target line from `target` (t 17-21),
    // then the wax seal 冷面学神 pressed on `seal` (t 23, settled t 26 = `hold`); the card sinks over 6 f from `out`
    // (= fly) while the target line flies (`fly`, `leave` frames). (r2: everything written by t 7, the seal on t 3)
    beats: { in: CUT.in, wipe: WIPE.at, construct: 0, name: 1, date: 6, stats: 8, rowGap: 3, target: 17, seal: 23, hold: 26, leave: CUT.leave, fly: CARD_LEN - 8, drain: DRAIN },
    gap: "G2", whilePending: "off",
    // the label slip (name, date, the three propositions, the target) and the wax seal; the rest of the frame is the
    // washed set and Newton himself (no word over his face)
    // (stage 2a: fitted; the compass construction behind him, x 58-800 y 210-930, is cut away round his figure and is
    // not a box: it would sit on his face in the faces checker)
    // 9:16: the slip drawn at 0.89 inside x 110-890, y 996-1490 (card.tsx CARD_T); the seal's box + 60 with his head
    box: [{ x0: 110, y0: 996, x1: 890, y1: 1490 }, { x0: 690, y0: 390, x1: 926, y1: 638 }], provisional: false,
    words: ["艾萨克·牛顿", "1686年5月 · 剑桥三一学院", "冷面学神", "命题一", "睡衣：助手从没见他穿过", "命题二", "独自坐下吃饭：助手没见过", "命题三", "出生：他说一升杯装得下", "今日目标：让他笑一次"],
  },
  {
    id: "meter0", row: 5, what: "the laugh meter is born: 笑 0/1", kind: "card", layer: "fx",
    // the card's target line lands in the slot as the meter (the card's exit; the picture runs again on its first frame,
    // two frames before B04's voice); about 0.8 s on the live picture, then it leaves. Part of row 4 (not an effect in
    // the budget): off while the card is off
    from: FREEZE_AT + CARD_LEN + 1, to: FREEZE_AT + CARD_LEN + 31,
    beats: { in: 4, land: 0, leave: 6 },
    gap: "G2", whilePending: "off",
    box: [SLOT], provisional: false,
    words: ["笑", "0/1"],
  },
  {
    id: "tick1", row: 6, what: "meter tick 1: the first crimson cross", kind: "effect", layer: "fx",
    // in the gap after B09 「没笑。」 (G3), the cross written in 0.2 s; card 2 flutters in mid-left after it. r3 (14 Nov
    // night): 3 frames later than r2 (B09.to + 2), so the cross's first frame (t2, B09.to + 7 = B09 end + 0.223 s) and its
    // nib tick (cues.json 'skin A: meter tick 1') land on an onset of the morning music; the same 29 frames
    from: B09.to + 5, to: B09.to + 33,
    beats: { in: 4, slip: 0, cross: 2, crossLen: 6, leave: 6 },
    gap: "G3", whilePending: "show",
    box: [SLOT], provisional: false,
    words: ["笑", "0/1", "✗"],
  },
  {
    id: "stamp", row: 7, what: "花字 拒收 on the chair's skid", kind: "effect", layer: "fx",
    // on the skid (C07 end + 0.1 s, cues.json "the skid"), jolts when the chair hits the lens (C07 end + 0.65 s,
    // SYNC_POINTS row 42 since r2, POLISH 15: mus_noon's beat 25, where cues.json puts the knock and the stamp's thump;
    // stage 2b moved it from r1's + 0.56), out 3 frames before the clock join's cut into D
    from: C07.to + Math.round(0.1 * 30), to: seg("D").from - 3,
    beats: { in: 4, slam: 0, leave: 6 }, absBeats: { jolt: afterEnd("C07", 0.65) },
    gap: null, whilePending: "show",
    // stage 2b: the word rides the chair's seat (ctx.props.chair) clamped so the piece, jolt included, stays in here
    // (fx.tsx stampAnchor); today's seat moves x 893-767, y 1192-1105 over the hold. Refit after the rebuild
    box: [{ x0: 560, y0: 1050, x1: 890, y1: 1350 }], provisional: true,   // 9:15 + 60, left of x 890
    words: ["拒收"],
  },
  {
    id: "tick2", row: 8, what: "meter tick 2 with the note 我笑的不算", kind: "effect", layer: "fx",
    // after D05 「他没笑，我笑了。」, before the claps; a screen element: it does not jolt with clap 1
    from: D05.to + 1, to: D05.to + 30,
    beats: { in: 4, slip: 0, cross: 2, crossLen: 6, note: 8, leave: 6 },
    gap: null, whilePending: "show",
    box: [{ x0: 696, y0: 340, x1: 970, y1: 544 }], provisional: false,   // the slot and the note under it (9:16)
    words: ["笑", "0/1", "✗", "✗", "我笑的不算"],
  },
  {
    id: "lunch", row: 9, what: "game bar 午饭进度 on the two bites", kind: "effect", layer: "fx",
    // in 0.45 s after E02 at 1 %; it ticks to 2 % ON the second fork clink (E02 end + 1.25 s, cues.json); out 2 frames
    // before E03
    from: afterEnd("E02", 0.45), to: E03.from - 2,
    beats: { in: 6, leave: 6 }, absBeats: { tick: afterEnd("E02", 1.25) },
    gap: null, whilePending: "show",
    // stage 2b: the bar rides the plate's far rim (ctx.props.plate) clamped into here (fx.tsx lunchAnchor); today's
    // plate sits at his chin's height (far rim y 790, his face down to y 723), so the bar sits under it on the cloth.
    // r2 (director r1 note 8, the part that needs no rebuild): the box ends 12 px short of his gown's left edge at the
    // bar's height on today's E02 (x 545 at y 900-980; the plan's x 120 on the left), so the 2 % end no longer lies on
    // the gown. Refit over the far rim (x 120-900, y 900-1290, 12 px clear of the gown) after the E rebuild frames the
    // plate below his chin
    box: [{ x0: 120, y0: 960, x1: 533, y1: 1040 }], provisional: true,   // 9:15 + 60
    words: ["午饭进度", "1%", "2%"],
  },
  {
    id: "meter1", row: 10, what: "meter 1/1 and 证毕 after the laugh", kind: "effect", layer: "fx",
    // in the gap after G02 (lands with mus_laugh's swell, G02 end + 0.08 s), gone the frame before the sack's thump
    // (G02 end + 1.33 s, cues.json) so card 4 arrives alone
    from: afterEnd("G02", 0.05), to: afterEnd("G02", 1.33) - 1,
    beats: { in: 6, close: 0, closeLen: 6, qed: 6, leave: 6 },
    gap: null, whilePending: "show",
    // the slot plus 证毕 under it; if the rebuilt hold puts his hair in the slot: the low-left place x 70-380,
    // y 1080-1290 (on his gown, never his face)
    // stage 2b: the slot with 证毕 under it (9:16: x 664-970, y 340-610). The low-left place (meter.tsx LOW_LEFT, at
    // 0.8: x 110-344, y 1100-1320) draws only while his head is in the slot: if the rebuilt hold uses it, put it here
    box: [{ x0: 664, y0: 340, x1: 970, y1: 610 }], provisional: true,
    words: ["笑", "1/1", "✗", "✗", "证毕"],
  },
];

// ---------------------------------------------------------------------------------------------------- the gaps
/** G1: the title must end before A03's whisper bubble (A03's first word) */
const G1_READY = TITLE_FROM + TITLE_LEN - 1 < A03_BUBBLE;
// G2: B04's silent beat must start after the card's last frame (the voice job puts the 2.5 s after B03): freeze.ts G2_READY
/** G3: card 2 must start at least 9 frames (0.3 s, the plan's fallback; the full gap is 0.5 s) after B09's voice ends,
 *  so the tick's cross (written t 2..8) comes first */
const G3_MIN = 9;
const G3_READY = card("B09").from - B09.to >= G3_MIN;
const READY: Record<MsGap, boolean> = { G1: G1_READY, G2: G2_READY, G3: G3_READY };

export type GapReport = { gap: MsGap; ready: boolean; what: string; need: string; have: string; items: MsId[] };
/** THE GAPS: whether the voice track has each of the plan's three yet. Until it does, the smoke test prints a note
 *  ("gap pending"), never an error. */
export const gapPending = (): GapReport[] => [
  { gap: "G1", ready: G1_READY, what: "+1.2 s (fallback 1.0 s) after the slam's thud, before A03 (the title)", need: `title ends (${TITLE_FROM + TITLE_LEN - 1}, ${TITLE_LEN} f) before A03's bubble`, have: `A03's bubble at ${A03_BUBBLE}`, items: ["title"] },
  { gap: "G2", ready: G2_READY, what: `+${(CARD_LEN / FPS).toFixed(1)} s freeze after B03 (Newton's card, ${CARD_LEN} f)`, need: `line("B04").preFrom - line("B03").to >= ${CARD_LEN + 1}`, have: `${B04.preFrom} - ${B03.to} = ${B04.preFrom - B03.to}`, items: ["card", "meter0"] },
  { gap: "G3", ready: G3_READY, what: "+0.5 s (fallback 0.3 s) after B09 (tick 1 before card 2)", need: `card 2 starts >= ${G3_MIN} frames after B09's voice`, have: `card 2 at ${card("B09").from}, B09 ends ${B09.to} (${card("B09").from - B09.to})`, items: ["tick1"] },
];
/** the gap report as console lines */
export const gapLines = (): string[] => gapPending().map((g) => `QA: MS gap ${g.gap} ${g.ready ? "in" : "pending"}: ${g.what}; ${g.need}, now ${g.have}${g.ready ? "" : ` -> ${g.items.map((i) => `${i} ${msItem(i).whilePending === "show" ? "shows anyway (keyed to the voice: it lands right once the gap is in)" : "OFF in the film"}`).join(", ")}`}`);

// ---------------------------------------------------------------------------------------------------- the still prop
/** THE STILL TEST PROP (Film.tsx header):  --props='{"mask":true,"fx":{"force":["title","card"],"at":0.4}}'
 *    force   item ids (or "all") drawn even while their gap is pending; forcing "card" also turns the freeze on
 *    at      0..1: the still shows the item `item` (default: the first forced one) at this progress through its
 *            frames, whatever frame number is rendered (the whole composition is drawn at that film frame)
 *    item    which item `at` refers to
 *    proof   true or a local frame t: hud/ms/proof.tsx draws the marks' proof sheet over the frame (every mark of
 *            marks.tsx; t = the write-on's frame, true = all written): the builders' reference, never the film */
export const MS_FX: { force: Set<MsId>; at: number | null; item: MsId | null; proof: number | null } = (() => {
  const o = (IP.fx ?? {}) as { force?: unknown; at?: unknown; item?: unknown; proof?: unknown };
  const ids = raw.map((r) => r.id);
  const list = o.force === "all" ? ids : Array.isArray(o.force) ? o.force.filter((x): x is MsId => typeof x === "string" && (ids as string[]).includes(x)) : [];
  const at = typeof o.at === "number" && Number.isFinite(o.at) ? clamp01(o.at) : null;
  const item = typeof o.item === "string" && (ids as string[]).includes(o.item) ? (o.item as MsId) : list[0] ?? null;
  const proof = o.proof === true ? 999 : typeof o.proof === "number" && Number.isFinite(o.proof) ? o.proof : null;
  return { force: new Set(list), at, item, proof };
})();

// ---------------------------------------------------------------------------------------------------- the table
/** an item with its scene's fit laid over it (fit.ts; the banner's from / to / slip are already in its raw line) */
const fitted = (r: Omit<MsItem, "scene" | "ready">): Omit<MsItem, "scene" | "ready"> => {
  const z = FIT[r.id];
  if (!z) return r;
  const { heldOff, ...rest } = r;
  const held = z.heldOff === null ? undefined : z.heldOff ?? heldOff;
  return { ...rest, from: z.from ?? r.from, to: z.to ?? r.to, beats: { ...r.beats, ...z.beats }, box: z.box ?? r.box, provisional: z.provisional ?? r.provisional, ...(held ? { heldOff: held } : {}) };
};
export const MS_ITEMS: MsItem[] = raw.map(fitted).map((r) => {
  const abs = Object.fromEntries(Object.entries(r.absBeats ?? {}).map(([k, v]) => [k, v - r.from]));
  return { ...r, beats: { ...r.beats, ...abs, out: r.to - r.from + 1 - (r.beats.leave ?? 0) }, scene: segmentAt(r.from).id, ready: r.gap ? READY[r.gap] : true };
});
for (const i of MS_ITEMS) if (i.scene !== SCENE_OF[i.id]) throw new Error(`hud/ms/when.ts: ${i.id} starts on f${i.from}, in scene ${i.scene}, not its own scene ${SCENE_OF[i.id]}`);
const BY = new Map(MS_ITEMS.map((i) => [i.id, i]));
export const msItem = (id: MsId): MsItem => { const i = BY.get(id); if (!i) throw new Error(`msItem("${id}"): no such item`); return i; };
/** whether item id is switched on in this render (its gap is in, or it shows anyway, and it is not held off; or a still
 *  forces it) */
export const msEnabled = (id: MsId): boolean => { const i = msItem(id); return MS_FX.force.has(id) || (!i.heldOff && (i.ready || i.whilePending === "show")); };
/** whether item id draws on film frame f */
export const msOn = (id: MsId, fr: number): boolean => { const i = msItem(id); return fr >= i.from && fr <= i.to && msEnabled(id); };
/** item id's local frame on f (0 on its first frame), or null when it does not draw */
export const msT = (id: MsId, fr: number): number | null => (msOn(id, fr) ? fr - msItem(id).from : null);
/** the kit's life() of item id on f: arrive over beats.in, leave from beats.out to its last frame; null when off */
export const msLife = (id: MsId, fr: number): Life | null => {
  if (!msOn(id, fr)) return null;
  const i = msItem(id);
  return life(fr, i.from, i.to, i.beats.in ?? 6, i.beats.leave ?? 0);
};

/** THE QUIET SPAN: no card and no effect from F07's first word to the end of G02's line (the 1/1 comes after it) */
export const QUIET: [number, number] = [F07.from, G02.to];

// ---------------------------------------------------------------------------------------------------- the freeze
// the picture side's clock (freeze.ts), re-exported so the overlay builders import everything from here
export { FREEZE, CARD_LEN, MS_CLOCK, msHold, msFreezeAt, msFrozen, washAt } from "../../freeze";
if (FREEZE_ON !== msEnabled("card")) throw new Error("hud/ms/when.ts: freeze.ts FREEZE_ON and msEnabled(\"card\") disagree");

/** the film frame a still is drawn at: with MS_FX.at the item's frame at that progress, else f itself */
export const msStillFrame = (fr: number): number => {
  if (MS_FX.at === null || !MS_FX.item) return fr;
  const i = msItem(MS_FX.item);
  return i.from + Math.round(MS_FX.at * (i.to - i.from));
};

// ---------------------------------------------------------------------------------------------------- the checks' view
/** the boxes the skin takes on frame f (what = "ms-<id>"), for hud/index.ts hudRectsAt and the faces checker */
export const msRectsAt = (fr: number): { what: `ms-${MsId}`; r: Rect }[] =>
  MS_ITEMS.filter((i) => msOn(i.id, fr)).flatMap((i) => (i.boxAt ? i.boxAt(fr) : i.box).map((r) => ({ what: `ms-${i.id}` as const, r })));
/** every switched-on item as the kit's Shown (overlay/frame.ts checkOverlays); one Shown per box. An item counts ONCE
 *  in the effects budget: an effect's second and later boxes (parts of the same piece, e.g. the flick's ring and its
 *  label) go in as kind "card", the one kind the kit treats like an effect except for the budget (stage 2b) */
export const msShown = (): Shown[] =>
  MS_ITEMS.filter((i) => msEnabled(i.id)).flatMap((i): Shown[] => i.boxAt
    // a piece that rides a person: ONE Shown, the box round its parts on each frame (its parts touch on purpose: the
    // banner's manicule reaches over its slip's corner); the faces checker gets the parts themselves (msRectsAt)
    ? [{ what: i.id, kind: i.kind, from: i.from, to: i.to, scene: i.scene, rect: (fr: number) => union(i.boxAt!(fr)) }]
    : i.box.map((r, k) => ({
      what: i.box.length > 1 ? `${i.id}#${k + 1}` : i.id, kind: k > 0 && i.kind === "effect" ? "card" as const : i.kind,
      from: i.from, to: i.to, scene: i.scene, rect: () => r,
    })));
/** seconds of a frame, for tables */
export const sec = (fr: number) => (fr / FPS).toFixed(2);
