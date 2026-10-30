# ep53 v3.1 · TakeG self-check

## Item 1: 勾践 drawing his sword in G7 (81.388–87.049). DONE

**What changed**
- New file `episodes/37-qiqing/remotion/src/qq53/king53g5.tsx` (`KingDraw53g5`, `drawPose`, `DRAW_T`):
  - 勾践 as a one-tone faceless 皮影 silhouette, built from the kfG53 kit (`Sil` rim light, same head).
  - He wears a long robe and a king's board cap with bead strings. This is the same cap family as his KingSeat cap in G5 and 夫差's fallen 冕 in G7.
  - A dark scabbard is slung at the waist.
- `shadow53g.tsx`:
  - G7 places him at scene x −2.3, LEFT of the ranks. Scale 1.07 = 1.19 × a front-rank soldier (0.9).
  - G7's window, glow, fire glow, 22 % lattice-over and ridge line now reach 2.0 cm further toward the tip (`EXT[6]`). That puts him inside the glow with the lattice over him.
  - The guard-side edge and the soft-end width (0.986 cm, same as v3) are unchanged. `EXT` is 0 for every other scene, so they render exactly as before.

**The sword**
- Built from the shared spec `swordspec53x` (design C): blade from `hwS`, guard from `GUARD_OUT`, pommel dish from `POM_PROF`, grip `R_GRIP`, two hoops `HOOPS`/`R_HOOP`. Colours come from `VARIANTS.C`.
- Hilt: near-black, outturned dish pommel.
- Blade: light (`edge.lit`), with one thin gold crease.
- The hilt is enlarged as a shadow-play prop (×1.7 along the axis, ×1.7 width for dish and guard, guard ∧ depth ×2.2) so the V and the dish read at about 110 px. At true scale they were 2–8 px and did not read (checked in renders).

**The motion**
- One continuous motion of 1.1 s: hand on the hilt at the hip → pull along the scabbard → sweep up and over → upright at 72°.
- It completes ON DA(37) 84.2186 = **frame 2527**. Computed: θ = 74.2° at 2526, 71.6° at 2527, settling back to 72° by 2540. A blade glint peaks on 2527 and fades over 0.6 s.
- Then he holds the sword raised (no motion) while the ranks advance and the palace goes under on 86.484. He fades out with the scene (vigK 6), as before.

**Limits respected**
- Cap top at 1.07 scene units vs the ridge at 1.30. Raised sword tip at about 1.27.
- No rope or blade for 夫差: the fallen cap and dropped sword are untouched.
- Nothing in the subtitle area: his head is at y ≈ 520 px. Tags untouched (the overlay is another engineer's).

**Checks run (renders under /tmp only)**
- Stills 82.0 / 83.5 / 83.8 / 84.0 / 84.3 / 85.2 / 86.5 / 88.0 / 89.0, viewed at full size and zoomed. Every-2nd-frame contact sheet of 2490–2538.
- Hand-offs and the rest of TakeG are pixel-identical to v3 (PNG compare, v3.1 vs `git stash` v3):
  - 51.9, 52.0, 60.0, 75.0, 80.5, 92.7: max diff 0.
  - 92.6: 9 levels on a few pixels (mean 0.0003), rasteriser noise.
- Frame-to-frame smoothness, half-res video 80.5–89.6, v3.1 vs v3: in no frame does v3.1's step exceed v3's by more than 0.6 grey levels (worst +0.13 at frame 2458).
  - The full-frame steps of 3–6 in this range are the existing v3 camera glide and return. They are identical in v3 and not caused by this change.
- `tsc --noEmit`: no errors in king53g5.tsx or shadow53g.tsx. The errors it does report are in other files, not caused by this change.

**Nothing outside my files needed to change.**
