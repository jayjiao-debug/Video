# ep51 fix round 1

**Sources:**
- director gate 4 → `notes_gate4_r1.md` (D…)
- QA → `qa_notes_r1.md` (Q…)
- cold read → `coldread_frames.json` (CR)
- sound → `music/notes_sound_r1.md` (S)

Read the source notes for the evidence and the exact fixes. Keep the director's **must-not-change list** (at the end of `notes_gate4_r1.md`).

**Sound is done** (S): the cues are retimed, two masked effects are replaced, and the drips are rebuilt.

**Grid and cue times are unchanged.** The picture must still land on:
- 9.50
- 12.896 / 13.40
- 33.27
- 34.97
- 36.67
- 37.66 (pour)
- 61.01
- 63.84 / 64.41
- 69.50
- 71.43 / 72.00 / 72.56 / 73.13 / 73.69
- 74.26
- 76.52
- 81.62 / 82.75
- 96.90
- 104.26
- 112.75

**Rules:**
- No new plain cross-dissolves. Every scene change is a wipe, a camera move or a match.
- Labels and tags clear before a move (owner).

## Builder A (0–55.92, plus master51 / lines51 / overlay)
1. **Counter (D1, Q1, must).**
   - **H1:** the spin lands 战国早期 by 2.0 and holds through H2, with no snap back to 2026.
   - **H3:** the spin starts at 7.0, runs 战国早期 → 春秋 → 周, and lands by 8.4. No 周 flash before it.
   - Rule: a line's own value never shows before its spin. Check by cropping the counter on every frame from 0 to 9.5.
2. **Title on the hit (D7, S1, should).**
   - The plaque is fully opaque on f285 (9.500) and at scale 1.0 by f286, with the ep50 slam jolt.
   - Fix suggestion: `o = 1` from f = 0, and `sc = f < 1 ? 1.10 : 1 + 0.03·exp(−(f−1)/9)·sin(2π(f−1)/8)` for f < 17.
   - f285 must never be empty.
3. **Rewind reads (D8, Q7, should).**
   - A ◀◀ glyph ≥ 72 px (no tracking-noise band).
   - Large leaves going green → orange → snow, backwards, behind the block.
4. **8–16 s drags (CR biggest risk).**
   - Keep the walker's silhouette identical: CR saw it change between 12 and 14, which reads as a different person.
   - **D14:** after the strikes he hauls the block on a rope, his hand on the rope, the chisel tucked in his belt or other hand. It never slides by itself.
   - Give the title's 3 s a slow drift, plus a snow gust on the slam.
5. **Dissolves → motivated moves (D6, Q2).**
   - **20.9:** the Z1 → Z3 change. The ×80 tag clears first. Then tilt down into the pit (or follow a block over the lip) instead of the dissolve.
   - **41.5:** the J5 → W1 change becomes a lacquer-pillar wipe.
6. **先猜？ (Q3, D15).**
   - All three options are up by 35.15 and hold to 36.67, so about 1.5 s with all three readable.
   - 「肉？」 moves ≥ 80 px right, off the walker's head.
   - On 36.67, 肉？/瓜果？ drop and 酒 lights. The jar's wine shows only from 37.25, when the J4 line appears; until then the lid hop stays dark inside.
7. **Fridge-door ghost (D13):** an open door with a cold blue interior at ~35 % for one beat (27.6–28.3), not a 1 px outline.
8. **酥山 (D9, CR).**
   - Plate about 2× with a push-in, so the peaks read clearly as drizzled cream peaks.
   - The cellar is a hatch with steps and a cold glow. The plate goes in at about 53.6 and comes out frosted at about 54.75.
   - The cone ghost is solid, ≥ 140 px, 「像」.
9. **Text polish (D16, Q8).**
   - Stamp line 2 → 28 px.
   - Q1's stamp note must not repeat the gloss: change the Q1 note to 「《诗经·七月》」 / 「周人冬天凿冰」, or keep line 1 only.
   - Value tags (×80, 190 立方米, ×3) use a feathered dark scrim instead of a bordered black box.
   - Nothing overlaps a tag (the walker's head at ×80).
10. **Hand-off (B's note):** the carried block shows for one frame just before his body at the hand-off. Hide it.

## Builder B (55.92–end)
1. **Grid → kitchen (D2, must).**
   - The tags and spill clear by 103.3–103.5.
   - Push into one lit window, whose glow becomes your fridge's light. The kitchen is fully on by 103.9.
   - The clink stays on 104.26. No half-opacity overlap.
2. **P1 / P2 peak (D3, Q6, must).**
   - One eased pull-back from the M4 fridge, which becomes the row's last item.
   - Props ≥ 120 px, labels ≥ 40 px, row baseline y ≤ 900, and nothing within 120 px of either edge. Hide the counter during P1 if needed; the J seal must not collide.
   - Snow lights each prop left → right, one per beat from 106.52.
   - Then one continuous push into that same fridge for P2, with no dissolve and no second fridge.
   - Camera ≤ 25 px/frame.
3. **Vault → 冰票 (D4, must):** crane up the ramp through the ground line into the summer street, matching the surviving block to the block in the cellar arch. No dip to dark.
4. **约2/3 化掉 (D5, CR, must).**
   - Numerals ≥ 96 px, 化掉 ≥ 56 px, on a soft scrim by the gauge, holding through C3.
   - Label the gauge 「存冰」 so it doesn't read as a thermometer.
   - The stack must visibly go to **about one third** (e.g. 6 rows → 2), not half.
5. **Dissolves → motivated moves (D6, Q2, must).**
   - **66.8–67.3:** follow the ice stack down into the vault.
   - **78.5:** one set; the camera trucks left as the queue steps in.
   - **80.6:** a hutong gate wipe.
   - **97.9:** push into the machine's glowing box, which becomes the 1990 lit window.
6. **整间屋子 (D11, Q5, CR).**
   - The hall grades to an obvious cool blue, with frost on the lattice.
   - The cold mist **spills down** from the coin holes and flows across the floor. It is heavy, cold air, never rising curls like steam.
   - Remove the thin white loops that read as cables.
   - Keep the walker clear of the box, and add motion to K2 (he walks around it, or the camera arcs).
7. **冰票 (D10):** light the window interior. The slip is ≥ 160 px, and its seal lands on 76.52.
8. **Grades (D12):** blocks 1× / 2× / 3.5× on 79.3 / 79.9 / 80.4. Rank shows only by silhouette (hat, robe hem). No labels.
9. **Hutong (Q9).**
   - The three figures never merge into one shape.
   - The seller's two brass bowls read as two small bowls in one hand, not an hourglass.
   - The buyer at 57.6 never walks through the walker.
10. **2024 scope (Q10).** 104.8 must not read as a rural jump. The 1990 village grid pulls back or transforms into a bigger mixed grid (city blocks + towns + villages) labelled 全国 before it fills and spills. Both scope tags stay visible side by side for a beat.
11. **Last line contrast (Q11):** P2's subtitle must not sit on the fridge's light-grey top. Frame the fridge lower or add a scrim. Add a slow push so the final image isn't static.
12. **Small items.**
    - **D17:** a slow 5 % push-in through the vault.
    - **D18:** the machine's frost-complete pop lands on 96.90.
    - **CR:** the 冰雪冷元子 board must not still be on screen in the 清 scene after the wipe.
    - **S2:** the end-card J seal lands on f3383: `seal = land(seg(t, T0 − 0.07, T0 + 0.33))`, drawn from `t >= T0 − 0.07`.

## Sound (music specialist)
- **Hush (Q4):** near-silence is now ~2.5–3 s. The owner's limit is about 1 s; ep50's approved hush was ~1.5 s. Keep the stop at 69.50–70.51 and the drips. Under them, keep a quiet floor so the bed never drops below about −35 LUFS-M for more than ~1 s: e.g. let the stop chord's ring sustain longer (a lower-decay tail), or a sampled pad or drone from the song's own valley bars, plus the inhale from ~73.0. It should feel like held breath, not broken audio.
- After the builders' fixes, re-check every cue against the new picture.

## Everyone
- Check every changed shot with full-size stills against QUALITY_BAR.md, the key frames and the source note.
- Check transitions frame by frame.
- Typecheck.
- No full render (the producer renders). Delete your bundles.
- Hand back: a short list (item → time → what you did) and refreshed `strip_A.jpg` / `strip_B.jpg`.
- Budget about 75 minutes.
