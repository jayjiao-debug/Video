# ep53 v3.1 · sword → design C 「课本金」 · self-check

Work ran from 13:16 to about 13:46 UTC. Everything was rendered under /tmp only; no images are in the repo. The baseline was the untouched HEAD, rendered from a temporary git worktree in /tmp, which I removed afterwards.

## Items

| # | Item | Status | What I checked |
|---|---|---|---|
| 1 | Design C is the ONE spec (`swordspec53s.tsx`) | **done** | Geometry, glyphs and look C are ported from `swordspec53x`. In SWORDDESIGN frame 3, the "现在" panel (props53.Sword → flat53s) now draws the same sword as panel C. |
| 2 | Port every renderer | **done** | `flat53s` (SwordFlat, with a `back` option for the turquoise face), `blade53c` (BladeFlat, MarkSet), `hiltflat53e` (smooth grip, 2 low rings), `sword3d` (near-black Guard3D with beast mask, eye + comma cells, glass on the front and turquoise on the back; near-black Hilt3D, no cord; new pommel dish), `land53` (square diamonds, frames, stars, pale glyphs, plain 4.5 mm edge bands; specular lobe and single gold ridge kept), `macro53` / `macrob53c` (same cell build, stars, 4.5 mm bands, characters on the land), `blooms53s` (re-anchored to new cells), `face53` (dark dish, 11 rings), `inscr53c`, `props53` (stand-in hilt colours). |
| 3 | Hand-offs | **done** | Frames 3336–3341 identical (mean diff 0.000). 3341→3342 differs only below the subtitle band (bloom 1 + subtitle). 1558→1559: 4.47 below y 300 vs neighbours 5.37 / 4.66. 2781→2782: 3.51 vs 3.41 next (baseline 3.02; the camera starts moving there). 3319→3320 (leg 12 → HandoffMacro): no pixel differs by > 12 below y 300. 624→625 (dive ring match): 7.33 vs neighbours 7.42 / 7.14. |
| 4 | Inscription leg | **done** | The 8 characters are real glyphs at 33 + 22.5·n mm, w ±7.2. Lights now come in reading order: 越王 (43.46) → 鸠浅 (44.6, held) → 自作 → 用剑. The 鸠浅＝勾践 bracket is computed from `markAt(−1, 0/1)` and sits under 鸠 and 浅 at 50.3. Checked on crops at 43.7 / 44.8 / 45.9 / 47.1 / 50.3. |
| 5 | Stills | **done** | All 32 brief times reviewed (0.5 … 141), plus 34, 36, 38, 38.6, 101.5. Same sword in every shot. Nothing pokes through. The guard shows the glass face from above (case, display, hook) and turquoise only on its back face. |

## Low-res video checks (VSCALE 0.25), new vs baseline
- **0–21 s:** the spike frames (284, 308, 549, …) are the same as the baseline (planned hits).
- **38.9–56 s:** spikes at 1168 and 1507 match the baseline. Two small new ones at 1292/1296 (mean 1.7) look like aliasing of the stars at quarter scale.
- **92.7–111.4 s:** the spike list matches the baseline. Frame pairs over 3: 329 new vs 329 baseline.
- Frames over 3 overall: 293 vs 284 (0–21 s) and 315 vs 257 (38.9–56 s). The denser star lattice raises the per-frame difference in camera moves by about 10–30 %. It is not a pop.

## Decisions to know about
1. **Lattice phase.** Design C's nodes sit half a row off the ridge. I laid the same square lattice (12.4 × 12.4 mm cells, frames, stars at every crossing) on the old `(p, q)` indexing instead, so cells are centred on the ridge. Otherwise `macro53c` (not mine), which hand-computes its M2 subject cell and section-cut parity from `LAT.A/W` and `latCorner`, would land off its cells. The pattern looks the same; only its phase across the blade moved by 3.1 mm.
2. **`MACRO_S0` = 4 cells (49.6 mm).** `macro53c` fixes its subject cell at s 80.6 mm, so the macro has to start before it. The inscription now runs to s ≈ 106, so the macro views (BladeMacro / BladeMacroC / HandoffMacro / TakeD3) draw the characters too, ON the pattern. BladeMacroC takes over from `macro53c`'s own MarkSet at exactly its `markO` switch (cu ≥ S0 − 1), with the same MarkSet build, so there is no step.
3. **Edge bands in the macros are 4.5 mm** (`STRIP_M`). `sp.strip` (3.4, set in kfF53 / macro53c) is ignored.
4. **Pommel boss stays `#A8783C`.** `tomb53b3` (not mine) hard-codes that colour for the boss in the dive. A dark boss made a visible jump on 20.821, so I kept their colour. If the tomb engineer switches to the new `FACE_BOSS` export, it can go dark.
5. **`LAT.line` = 2.2 mm (compatibility value).** `shadow53g` (not mine) outlines cells with `LAT.line`. At this width its window lattice matches the dark bands of design C around it (checked at 60 s).
6. **`props53` BZ / GLS now carry hilt colours** (dark bronze; `GLS.body` is the dark guard). This turns the stand-in `HiltLite` in `chamber53b3` / `scene53c` and the other swords in `world53d` into dark hilts with no blue panel. `BZ.lit` stays gold for highlight lines.

## For the other engineers (outside my files)
- `tomb53b3.tsx` / `tomb53.tsx`: use `FACE_BOSS` from face53 instead of `'#A8783C'` if the boss should be dark like the rest of the dish.
- `macro53c.tsx` / `kfF53.tsx`: `strip: 3.4` no longer has any effect. The leg-12 MarkSet still works; from cu ≥ MACRO_S0 − 1 BladeMacroC draws the characters itself.
- `macro53c` comments that say "5 cells / past the inscription" are now stale: MACRO_S0 is 4 cells, and the characters are in the macro view.
- The `birdScript` / `markSeed` / `MARK_K` exports are kept only so old code still compiles. The marks are now the `GLYPHS`.
