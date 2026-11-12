// SEGMENT C, lines 12-15: the map and the stage (12a-15).
// THE WP1b STUB: every frame is the block-out (shots/common.ts blockOut): the shot's place, its camera (with its
// eased move) and exactly its placed list (beats.ts SHOTS) on their layout marks, idle. WP9 replaces this file with the
// real shots from STORYBOARD.md, keeping the export: SEG = { id: "C", from, to } = SEGMENTS[2].
import { SEGMENTS, type Segment } from "../story";
import { blockOut } from "./common";

const S = SEGMENTS[2];
export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose: (w, f) => blockOut(w, f),
};
