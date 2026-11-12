// SEGMENT E, lines 20-23: the release, the bill, the rhyme and the promotion (20a-23b).
// THE WP1b STUB: every frame is the block-out (shots/common.ts blockOut): the shot's place, its camera (with its
// eased move) and exactly its placed list (beats.ts SHOTS) on their layout marks, idle. WP11 replaces this file with the
// real shots from STORYBOARD.md, keeping the export: SEG = { id: "E", from, to } = SEGMENTS[4].
import { SEGMENTS, type Segment } from "../story";
import { blockOut } from "./common";

const S = SEGMENTS[4];
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose: (w, f) => blockOut(w, f),
};
