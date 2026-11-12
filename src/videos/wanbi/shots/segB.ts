// SEGMENT B, lines 7-11: the hall, the flaw, the retreat, the hook returns (7a-11).
// THE WP1b STUB: every frame is the block-out (shots/common.ts blockOut): the shot's place, its camera (with its
// eased move) and exactly its placed list (beats.ts SHOTS) on their layout marks, idle. WP8 replaces this file with the
// real shots from STORYBOARD.md, keeping the export: SEG = { id: "B", from, to } = SEGMENTS[1].
import { SEGMENTS, type Segment } from "../story";
import { blockOut } from "./common";

const S = SEGMENTS[1];
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose: (w, f) => blockOut(w, f),
};
