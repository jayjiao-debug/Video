// hud/ms/knock.tsx: SKIN A's KNOCK MARK ON HIS DOOR (the owner, 15 Nov, note 1: she "proceeds to knock on the door,
// with a knocking visual effect on the door"). On each of the invisible hand's two raps (BEAT.A.knock, knock2) a
// hand-drawn impact mark pops ON THE LEAF where the hand lands, in the skin's own hand: eight short quill flicks
// radiating from the knock point, iron-gall ink, each on a torn sliver of his paper (so the ink reads on dark oak: the
// skin's "scrap cut round a word"), the ink pooled where the nib lands; beside it one 咚, written fast with the broad nib
// in the crimson rubric on its paper scrap (the piece's one rubric mark, twice). Rap 2's mark is a little bigger.
//
// THE CONTRACT
//   <MsKnock f />   f = the film frame. Mounted by Film.tsx with the skin's title and effects: ABOVE the vlog HUD and the
//                   shot's overlays, BELOW the whisper bubble, the subtitle and the phone mask.
//   When / where:   hud/ms/knockplace.ts (the frames from BEAT.A; the knock point projected from the world on every
//                   frame by shots/segA.ts knockAt, so the mark lies in the leaf's plane and rides the leaf through the
//                   frame's nod, the leaf's shiver and its swing on the creak). The item is "knock" in hud/ms/when.ts
//                   (the checkers read its per-frame boxes: knockRects).
//   Motion:         each part lands a touch large and settles (2 frames the mark, 4 the 咚); the flicks are written
//                   from the knock point outward (60 % on the rap's frame, whole on the next), the 咚 the same way (half
//                   on the rap's frame, whole on the next, with its pools: never a blank scrap); each leaves over
//                   its last 4 frames BY SINKING INTO THE PAPER (fxkit exitK: the ink goes sepia and the paper takes
//                   it, then the slivers go). A mark lives 9 frames, the 咚 12 and 10; all gone the frame before
//                   「早上好！」.
//   Ids: every id starts with "newton-ms-knock". No blend modes, no backdrop filters. A pure function of f: no hooks, no
//   state.
import React from "react";
import { MS } from "./skin";
import { msDefs, nibFilter, quill, quillOutline } from "./marks";
import { msOn } from "./when";
import { Sheet, about, exitK, sinkDef } from "./fxkit";
import { KN, markRays, sayPlace, type KnPt } from "./knockplace";

const P = "newton-ms-knock";
const n1 = (v: number) => v.toFixed(1);
const dOf = (pts: KnPt[]) => "M" + pts.map((p) => `${n1(p.x)},${n1(p.y)}`).join(" L") + " Z";
/** the nib for 咚 (one size between the two) */
const NIB_S = (KN.say[0].S + KN.say[1].S) / 2;

/** MARK i: the paper slivers, then the ink flicks with their pools */
const Mark: React.FC<{ i: 0 | 1; f: number }> = ({ i, f }) => {
  const m = markRays(i, f);
  if (!m) return null;
  const ex = exitK(m.life.d, m.life.len - KN.leave, KN.leave), sink = ex.ink > 0 ? `url(#${P}-ms${i})` : undefined;
  return (
    <g>
      <defs>{sinkDef(`${P}-ms${i}`, ex.ink)}</defs>
      <g opacity={ex.paper} filter={`url(#${P}-shs)`}>
        <g filter={`url(#${P}-wob)`} fill={MS.slip} stroke={MS.slip} strokeWidth={2 * KN.paper} strokeLinejoin="round">
          {m.rays.map((r, k) => <path key={k} d={dOf(r.poly)} />)}
        </g>
      </g>
      <g filter={sink}>
        <g filter={`url(#${P}-inkA)`} fill="#000">
          {m.rays.map((r, k) => <path key={k} d={dOf(r.poly)} />)}
          {m.rays.map((r, k) => <circle key={`p${k}`} cx={n1(r.a.x)} cy={n1(r.a.y)} r={n1(r.w * 1.18)} />)}
        </g>
      </g>
    </g>
  );
};
/** 咚 i: its paper scrap, then the word written with the crimson nib */
const Say: React.FC<{ i: 0 | 1; f: number }> = ({ i, f }) => {
  const s = sayPlace(i, f);
  if (!s) return null;
  const ex = exitK(s.life.d, s.life.len - KN.leave, KN.leave), sink = ex.ink > 0 ? `url(#${P}-ss${i})` : undefined;
  // the quill's pen starts half a character left of the middle, its baseline 0.38 S under it (marks.tsx turns each
  // character about that middle)
  const x = s.cx - s.S / 2, y = s.cy + 0.38 * s.S, o = { rots: [s.rot], lifts: [0], scales: [1], seed: 4 + i };
  return (
    <g transform={about(s.cx, s.cy, s.life.s)}>
      <defs>{sinkDef(`${P}-ss${i}`, ex.ink)}</defs>
      <g opacity={ex.paper} filter={`url(#${P}-shs)`}><g filter={`url(#${P}-torn2)`}>{quillOutline(`${P}-scrap${i}`, "咚", x, y, s.S, MS.slip, KN.scrap, o)}</g></g>
      <g filter={sink}>{quill(`${P}-say${i}`, "咚", x, y, s.S, `${P}-nib`, { ...o, write: { t: s.life.d, at: -1, per: 2, pool: 1 } })}</g>
    </g>
  );
};

export const MsKnock: React.FC<{ f: number }> = ({ f }) => {
  if (!msOn("knock", f)) return null;
  return (
    <Sheet id={P}>
      <defs>{msDefs(P)}{nibFilter(`${P}-nib`, MS.crimson, MS.edgeCrimson, NIB_S, 9)}</defs>
      <Mark i={0} f={f} /><Mark i={1} f={f} />
      <Say i={0} f={f} /><Say i={1} f={f} />
    </Sheet>
  );
};
