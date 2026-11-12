// SEGMENT D, lines 16-19: the road, five days later, the reveal, the cauldron (16a-19).
// THE WP1b STUB: every frame is the block-out (shots/common.ts blockOut): the shot's place, its camera (with its
// eased move) and exactly its placed list (beats.ts SHOTS) on their layout marks, idle. WP10 replaces this file with the
// real shots from STORYBOARD.md, keeping the export: SEG = { id: "D", from, to } = SEGMENTS[3].
import { SEGMENTS, type Segment } from "../story";
import { blockOut } from "./common";

const S = SEGMENTS[3];
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose: (w, f) => blockOut(w, f),
};
