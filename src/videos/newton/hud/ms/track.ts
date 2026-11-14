// hud/ms/track.ts: GENERATED (r2 probe, /home/user/newton_work/film/skinA/r2/probe/make_track.py; never edit by hand).
// HUMPHREY'S HEAD ON SCREEN over his banner (EFFECTS_PLAN row 2), per frame of today's segA: centre x, y and radius (film
// px), as hud/ms/screen.ts msFig gives them, from the banner's first frame (t 0 = film frame 326 on the voice track of
// 14 Nov) for 95 frames. Why: the faces checker and check.ts read an item's boxes from the frame number alone
// (hud/index.ts hudRectsAt), while the banner rides his head on every frame; this track gives them the same per-frame
// boxes the banner draws in (when.ts banner boxAt, bannerplace.ts). The banner draws from the live head and is held
// within a few px of this track, so a stale track shows in the stills and the checkers. RE-PROBE after the A rebuild.
export const HUMPHREY_TRACK: { first: number; n: number; xyr: readonly number[] } = {
  first: 326, n: 95,
  xyr: [797,500,162,791,500,165,784,494,168,775,469,172,764,467,175,753,472,179,741,482,184,726,514,188,712,537,193,703,540,196,696,490,206,685,473,212,675,464,219,661,460,226,639,466,234,607,521,236,599,517,243,612,501,251,624,456,265,633,444,275,635,439,285,629,446,295,616,492,299,604,533,305,624,548,308,635,470,324,637,456,321,640,438,320,642,432,316,645,430,312,647,429,309,648,429,305,649,432,302,649,435,300,648,441,298,646,454,294,647,462,291,650,455,289,653,441,288,655,438,285,657,436,283,658,435,281,659,435,279,659,436,277,659,439,275,659,444,274,659,452,272,658,468,269,660,457,268,662,446,267,664,443,265,667,440,263,670,438,261,676,437,259,693,419,253,688,420,253,684,421,253,681,422,253,682,427,253,684,431,253,686,436,254,688,440,254,689,445,254,691,449,254,692,454,255,694,458,255,694,459,255,693,459,255,693,459,255,692,460,255,692,460,255,691,460,255,691,461,255,690,461,254,690,462,254,686,469,253,684,476,252,681,476,252,678,477,252,676,474,252,674,470,253,673,467,253,673,464,254,672,464,254,672,464,254,671,464,254,670,464,254,670,465,254,669,437,292,669,451,273,668,461,260,668,466,253,667,466,253,666,466,253,666,466,253],
};
