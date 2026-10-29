# ep53 TakeD (75.162 → 113.633) — self-check

Files changed (all mine): `take53d.tsx`, `macro53d.tsx`, `world53d.tsx`, `scene53d.tsx`, `end53d.tsx`, new `hall53d.tsx`.
Nothing outside those files was edited. All renders were done under /tmp (nothing rendered is in the repo).
Jump tests: consecutive frames (t = n/30) at 0.2–0.25 scale, mean abs luma difference (PIL).

## 1 (BLOCKER) 95.533→95.567 surface break — DONE
- `WorldD` no longer swaps Ground/Pit order at a hard `under` flip. The hall is drawn from 93.9 (it simply comes into view as the camera tilts up; no fade) ABOVE the cut face's top edge while the camera is still under the fill, so the case is visible far above in the frame during the rise. The camera crosses z = 0 at 95.4 (poses rewritten in `scene53d.tsx`), the floor (`FloorD`) is the 夯土 top (same brown + mottles as the cut face, the pit strip extends in front of the camera) and only afterwards fades to the museum floor (95.4–96.8). `under` is `z < 0.03` so the edge-on floor is never drawn at z == 0 (that gave a one-frame black frame).
- Result: frame diff at the crossing 2.0–2.4 (neighbours 2.0–2.5; baseline was 15.8 vs ≈1). Case height at 95.4 ≈ 40 % of the frame, ≥ 100 % from 95.9.
- The camera rise 94.2 → 95.4 is slower at the start (z 2.1 → 3 → 4.7 m/s) so the white-clay edge no longer streaks.

## 2 (BLOCKER) 107.967→107.999 luma pop — DONE
- No blend mode at all any more: the kitchen is one normal-mode layer (opacity 0.55 at 106.9 → 1 at 107.9). The world no longer fades with a group `opacity` (a group with opacity < 1 containing the giant near-clipped floor/wall polygons made Chromium drop/flicker content, luma jumps of 10–13 at f3199 and alternating frames to f3217); it is faded by a Lacquer cover on top. The sword-fit roll is unwrapped along time (it jumped by 2π at f3206). The sword fit, kitchen fade and glow all finish by 107.9, so 107.993–109.125 is a held picture (diff 0.00).
- Luma now changes smoothly (0.1–0.9 per frame from 107.0 to 109.1; the world-to-kitchen turn has diff ≈ 3/frame). The only remaining step at f3240 (108.0) is the SUBTITLE leaving (top-left text, mean luma −1.7); that is `Overlay53` in master53.tsx, not mine.

## 3 (MAJOR) 80.2→81.95 disc / wipe — PARTLY (took the brief's fallback)
- The camera pull-out through to the coffin world could not be built in the time with the existing macro model (the macro "land" has no far scale), so: the first bloom's find-ring (cream, 4 px, tracked with the camera through `ringEllipse`) is there from 75.162; from 80.3 a soft-edged mask (feather σ 34 → 70 px, ≥ 120 px visible feather) opens exactly on that ring, the tomb world inside starts ×3.2 magnified and settles to ×1 while it travels to the frame centre, over 80.5–81.8 (log growth), with the subtitle scrim and vignette fading in with it so the hand-over to `WorldD` at 81.954 is seamless (f2458→2459 diff 4.9 is the subtitle changing; picture itself ≤ 1).
- It is still a transition (a soft dissolve over about 0.5 s, peak diff 4.7/frame at 81.3–81.4), not a camera move.

## 5 (MAJOR) blooms — DONE
- Blooms ×2.5 in size (r 2.75 / 2.6 / 3.3 macro mm, ≈ 150 px for the first at 75.162), rust-brown rim `#7A5434`, soft olive halo `#6E7E46` 40 % (blur σ 22), find-ring stroke 4.2 px (+ 8 px dark under-stroke), a 1.2 s size pulse on every new bloom, bigger specks. The first bloom is lit at full size on f2255 (same `BloomsD` is passed to `HandoffMacro`). Three blooms only; shrink floor raised to 60 % at 80.4 so they stay readable next to the scale bar. Not edited: `kfF53.tsx` (`Blooms11`) — the film uses my `BloomsD`.

## 8 (MAJOR) 95.6→99 case — DONE
- The case is take53's own `Museum` case (see museum note), sword and case in frame: case ≥ 100 % of frame height from 95.9 (≈ 40 % at 95.4–95.7, i.e. ≥ 35 %); sword 29 % of the frame width at 96.0, 32–35 % from 96.3 to 101 (f 2300–2450, camera ~2 m from the glass), measured by eye on half-size stills.
- The grey placeholder rectangle is now a small rounded lit panel `#E6F4F8` 25 %, no text.
- The glass is crossed at y = −0.8 (the Museum hood pane) at about 100.6, i.e. > 1 s earlier than before.
- Faint bloom on the blade at 98.9–99.6: bigger (≈ 10 mm) with a cream find-ring.
- Hero rim: 2 px `#FFF3CF` + 30 px soft glow on the case sword until 101.4, same on the coffin sword.

## 7 (MAJOR) 83.2→91 coffin — DONE
- Camera poses 86.483 / 88.5 (f 1000, closer, principal point lower) so the coffin is ≈ 55 % of the frame width (the 椁 with the other swords still fits); 90.445 closer too (f 1500).
- Other swords at real size (55 cm × 6 cm, were 70 × 9 cm), 2 px `#F4D088` rim, softer pool so the 勾践 sword (cream rim, stronger glow) stays the brightest. Note: at 55 % coffin width the real-size sword in the coffin is only ≈ 11 % of the frame width (physics); the 87.6 sword (behind the first) overlaps it from this angle.

## 19 (MINOR) closing pull-out — DONE
- New `CleaverD` in `end53d.tsx`: tapered blade (98 → 82 mm), rounded back corners, hanging hole, long wooden handle with three rivets running off the lower-left edge. Night window (`#1A0D09`, 1 px rim, mullions) behind the sword ghost with a warm glow, so the sword reads as a glow in a window.
- **Loop closure caveat:** frame 0 uses kfA53's `Cleaver` (not my file). Seen from `CAM0` it already looks like a tapered cleaver with a handle; my `CleaverD` has the same footprint, rust and camera, with a slightly stronger taper and a longer handle, so the two frames match closely but not pixel for pixel. The night window and the sword-in-window glow exist only at the end (frame 0 has the glint and bokeh instead). If TakeA should match exactly, import `CleaverD` from `end53d.tsx`. The held picture 107.993 → 109.125 does not change (diff 0.00).

## Also
- **Museum = same hall**: `hall53d.tsx` copies take53's hall pieces (walls with wall labels/panels, vitrine, washers, rope on posts, visitors, same colours, lit look 0.9) and uses take53's `Museum` for the case itself (`hall=0`). No wireframe grid anywhere: the old `Ground` grid lines are gone, tile joints were not carried over, the kitchen sits over the museum floor.
- **95.0 s band**: no blank band any more; the top of the frame is the hall (walls, case) and the cut face keeps its 夯土 courses. Depth tag fades 94.9 → 95.35 and is readable on the way up (3.7 m at 94.5).
- Loop: frame 0 vs the held end picture (108.1), mean abs diff 8.3 at 0.5 scale (frame 0 has the subtitle, a glint and a darker pool; the cleaver is the same drawing at the same camera). By 107.9 the picture is the kitchen (frame 0's `CAM0`), held to 109.125; the end card, J stamp (f3274) and the 0.5 s fade are untouched.
- Kept hits: 75.162 bloom 1, 75.728, 76.860, 84.219, 86.483/87.615/88.747, layers 91.011–93.841, P1 102.332.

## Not done / for others
- Frames 3050–3100 (101.7–103.4, the macro close-up of the lattice and P1 back-out) have mean diff 5–8 per frame; this is the same as the baseline (measured 3.0–8.5 on the old code), not an item for me, but the lattice moves > 25 px/frame there.
- Lattice style in `CaseW`'s `Sword3D` (item 12) is shared code, untouched.
- master53 should keep the subtitle scrim; `stampAt` 1965 → 今 is in master53 (not mine).
