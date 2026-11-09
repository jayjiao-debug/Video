// Segment B helper: the 48 hero ropes of S05-S08 (who throws to whom, which hand, which ones flop / fall short) and the
// per-seat roles the crowd state reads. Builder B owns this file. Static data: chosen offline (friends/segB_tools/net2.mjs)
// on the classroom formula anchors with these rules:
//  - nobody from YOU 41 / C1 42 / STAR 43 / C2 75 (their ropes are Y3, Y5, G2, handled by segB.ts);
//  - real ropes (hand to hand at the seated raised-hand height 1.24 m) pass >= 3 cm clear of every head, >= 0.35 m from
//    every S07 / S08 camera position, >= 0.12 m from the MED_YOU_WIN and C2_BEHIND sight lines to YOUR head, >= 0.75 m
//    from YOUR head (TWO_FISTS shows only your two ropes), and never cross the window-side aisle in front of row 3
//    (RES walks down it f538-655; the S08 crane descends in it);
//  - one throw and one catch per person, never the same hand for both;
//  - the 9 ghost-only ropes (+ G2) flop in a chain whose rope midpoints sit within 9 deg of the S06 pan's centre at their
//    frame; their holder's rope hand is on the side of the holder's own floor spot (so the rope drops straight beside
//    the chair) and their floor route never runs along the window-side aisle behind row 2 (G2 lies there);
//  - the 3 grey ropes fall short onto the same kind of floor route.
// Sides: +1 = the person's right = world +x (everybody faces the board, -z), -1 = left.

/** [holder, target, holder hand side, target hand side]: the target really holds the far end (34 with Y5) */
export const REAL: [number, number, 1 | -1, 1 | -1][] = [
  [9, 23, 1, -1], [49, 74, 1, -1], [81, 68, -1, 1], [3, 15, 1, 1], [36, 24, -1, -1], [59, 35, 1, 1], [65, 53, -1, 1], [19, 30, -1, 1],
  [27, 51, 1, 1], [44, 56, -1, -1], [7, 8, 1, -1], [20, 45, 1, -1], [12, 1, 1, -1], [83, 71, 1, 1], [79, 67, 1, -1], [48, 38, 1, -1],
  [71, 57, -1, 1], [64, 76, -1, -1], [15, 25, -1, 1], [60, 48, -1, -1], [40, 52, -1, 1], [17, 29, -1, -1], [32, 59, 1, -1], [22, 46, 1, 1],
  [24, 12, 1, -1], [52, 63, -1, 1], [8, 33, 1, -1], [38, 62, 1, 1], [77, 65, 1, 1], [70, 82, -1, 1], [56, 69, 1, -1], [61, 73, -1, -1],
  [28, 7, 1, -1],
];
/** [holder, target, holder hand side, flop frame]: only the target's ghost holds it; it flops in S06 (G2 is the f742 one) */
export const FLOPS: [number, number, 1 | -1, number][] = [
  [31, 55, 1, 697], [30, 5, -1, 701], [18, 4, -1, 706], [6, 16, -1, 710], [68, 54, -1, 715], [67, 80, 1, 719], [2, 0, -1, 724], [1, 13, 1, 728], [14, 26, -1, 733],
];
/** [holder, target, holder hand side]: thrown, falls short onto the floor (grey from the start, no ghost) */
export const GREYS: [number, number, 1 | -1][] = [[72, 48, -1], [11, 35, 1], [37, 14, 1]];

export type SeatRole = {
  /** hand sides that hold a rope (thrown or caught) and the frame the rope reaches / leaves that hand */
  throwSide?: 1 | -1; recvSide?: 1 | -1;
  /** this person's ghost holds a rope they never take: they keep writing */
  ghostOnly?: boolean;
  /** frame their own thrown rope flops (shock from flop + 3 to 760) */
  flopF?: number;
};
export const ROLE: SeatRole[] = Array.from({ length: 84 }, () => ({}));
for (const [hh, tt, hs, ts] of REAL) { ROLE[hh].throwSide = hs; ROLE[tt].recvSide = ts; }
for (const [hh, tt, hs, ff] of FLOPS) { ROLE[hh].throwSide = hs; ROLE[hh].flopF = ff; ROLE[tt].ghostOnly = true; }
for (const [hh, , hs] of GREYS) ROLE[hh].throwSide = hs;
/** row 4 behind you (and C1, a Figure) scribble 5s, fast and smug, until the wave (segment A's H1 crowd, the 再猜 payoff) */
export const WRITERS = new Set([48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]);
