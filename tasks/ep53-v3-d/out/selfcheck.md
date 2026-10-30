# ep53 v3 TakeD3 (111.389 → 145.333): self-check

Builder: TakeD3 engineer. Started 08:36 UTC (sandbox clock). All renders are under /tmp only. Nothing is committed by me.
How I checked: stills of `EP53V3` (`scripts/frame_ms.mjs`, film seconds, plus `SFPS=1` frame numbers), and three quarter-res videos
of 110.5–145.333. I ran a consecutive-frame mean grey difference over them (script `/tmp/diff.py`, numpy). `tsc --noEmit` reports no
errors in qq53.

## Files
- `take53d3.tsx` (rewritten): `TakeD3`, plus `v2Of` (the v3 → v2 time map), `camD3` (the camera), `T3` (the times), and a copy of
  take53's `KitchenW` (take53 does not export it).
- `end53d3.tsx` (new): `EndCard3` (v2's EndCardAnim re-timed to v3, with SOURCES53V3 on 2 rows) and the fade to black.
- `world53d.tsx`: the second chamber, rebuilt to match scene53c (details below).
- `scene53d.tsx`: camera poses (v2 times) moved to the new sword. `CaseW` gets two new optional props, `front` (the hood front's
  opacity) and `ring` (the spot's dashed ring). The dulling veil is now warm `#5A4630`.
- `macro53d.tsx`: the T1 veil is now warm `#5A4630` instead of grey `#4A4234`.
- `hall53d.tsx`: the visitors are opaque and one tone darker than the wall.
- `take53d.tsx` / `end53d.tsx`: unchanged. v2's `TakeD` still compiles and renders on the edited world.

No file outside my list was changed. No export was renamed or removed.

## Items

| # | Item | Status | Checked |
|---|---|---|---|
| 1 | Start: `HandoffMacro` + bloom 1 on f3342 (111.389); blooms on 111.955 and 113.087, ON the surface | **done** | The v3 → v2 map is exact and has slope 1 on these knots (111.389→75.162, 111.955→75.728, 113.087→76.860), so v2's macro53d hits land on f3342 / f3359 / f3393. Hand-off f3341→f3342 differs by 0.43 (only bloom 1 appears). |
| 2 | Re-time to the v3 hits | **done** | One monotone C1 Hermite map (cam53 `spline`), with knots ON the hits. Portal/match ends and rewind starts at 117.616 (= v2 MACRO_END). The sword settles on 120.446 (draw = 0 at v2 84.219). The other swords light on f3681 / f3715 / f3749 (122.711 / 123.843 / 124.975). The six layers close on f3783 / f3800 / f3817 / f3834 / f3851 / f3868 (126.108 … 128.938): the map has slope 1 there, and each drop is complete on its frame. Air dots from ≈128.8. Surface/museum floor on 130.069 (v2 94.95). |
| 3 | Continuity: the second chamber is the same tomb as scene53c | **done** | 椁 interior 3.2 × 2.3 m, 2.0 m high. Outer coffin 2.12 × 0.84 m, inner 1.80 × 0.60 m (as scene53c `OUT`/`INN`). Lacquer `#1A110D` with gold edges and the `RED_LINE` inset. Interiors `#2A1D14` / `#46201A`, lids `#33211A`. No oxblood boxes. **The skeleton** is scene53c's `Occupant`, ported line for line (scene53c does not export it); head toward −x, and it fades when the lens is right over it. **The hero** is `Sword3D` (shared spec), hilt **screen-right** as in the draw, so the rewind is the draw run backwards (stills 117.8, 118.5, 119.6). **The sheath** is scene53c's black sheath, washed: `#0A0605`, two red pin-lines, the mouth band. It is opaque during the rewind, 72 % after the sword settles, and opaque again when its shell drops on the 剑鞘 beat. **The knife** is `BronzeKnife53`, beside the sheath on the arm side. **Other swords**: three, 58 cm (real size), dull bronze guards (no blue), side by side behind the coffins, hilts the same way, a shade dimmer than the hero. **Match (≈116.5–117.6)**: the find-ring opens onto the black sheath and its mouth band, not a red disc (still 117.2). **End case**: no cream outline, no gold halo (`rim = 0`). **Visitors**: opaque. **No depth tag** is drawn. Layer labels 剑鞘 / 两层棺 / 木椁 / 白膏泥 / 夯土 at 56 px, x = 1500–1665, y 340–884 (inside the safe area, clear of the subtitle area). |
| 4 | R2: surface → museum floor on 130.069, up to the display, a shade duller, one faint rust spot | **done** | v2's rise through the floor, then the case view (131.2), then a push to a hilt close-up 30 cm away (134.0). The warm veil ramps in over 130.6–132.4. One small rust spot (no find-ring) appears at 132.0–132.6 on the blade's tip half and is passed over in P1. |
| 5 | P1: pull-back on 134.031 ending on frame 0's framing by 138.5, held through the air | **done** | A new C1 camera starts with R2's velocity on 134.031. It arcs out and up in front of the case (136.1), then down along the blade to `camAt(0)`, at rest on 138.5. The plinth/deck dissolves on the peak (134.03–134.43); display53k's deck pool breaks up once the lens swings low, so it has to be gone first. The hall and hood fade 134.5–136.6. The kitchen (frame 0's KitchenW + CleaverK, the same reflection camera), its pools, the far blur and the glint come in over 135.6–138.4. From 138.5 the picture **is** `TakeA(0)`: f4155 and f4160 vs film frame 0 = **0.00 mean difference**. No window rectangle. |
| 6 | END CARD on 140.824 | **done** | J seal absent on f4224, complete on f4225 (seal-area mean 24.0 → 33.2). Title +0.35, question +0.7, pill +1.2, sources +1.3. `SOURCES53V3` on 2 rows at 24 px, centred, bottom at y ≈ 956. The card holds 4 s. The fade to black runs 144.8 → 145.3 and is complete on the last frame f4359 (mean 0.0). |

## Smoothness (quarter-res video 110.5–145.333; median 1.28, p95 3.89)
Runs above 5 per frame, all planned:
- 117.03–117.27 (≤ 6.3): the portal opens (v2's Match 4, unchanged).
- 125.53–125.60 (≤ 5.5): the swing from E1 round to the front of the cut-away, which has to fit between the 3rd sword (124.975) and the 1st layer (126.108).
- 127.80 (5.3): the 木椁 drop (a hit).
- 134.13–134.40 (≤ 7.0): the plinth dissolving on the P1 peak.

There are no single-frame pops. The earlier deck glitches at 134.4–135.5 are gone.

Hand-offs:
- f3341→3342: 0.43
- f3528–3530 (the first world frames after the portal): 2.8 / 2.9
- f3901–3903 (the museum floor): 2.3 / 2.5
- f4154→4155 (onto the frame-0 hold): 0.84
- f4224→4225 (the seal): 1.19

## Notes for the producer / other engineers
- `master53v3.tsx`'s stub comment lists "end card" in the overlay. Per my brief, **TakeD3 draws the end card** (`end53d3.EndCard3`, with
  the seal, title, question, pill, sources and the fade). If the overlay builder also draws one, one of the two must go.
- The picture keeps v2's subtitle scrim (top-left) until P1. It fades out over 135.0–136.5, so the held kitchen equals frame 0.
- display53k's deck pool clips when the lens is low and close to the deck. I worked around it (the plinth fades on the P1 peak). The
  root cause is in `display53k.tsx`, which I may not edit.
- The 6-beat layer timing, the air dots and the leaks come from v2's world53d. The leaks now end on the new blade.
