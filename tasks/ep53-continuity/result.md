I reviewed ep53 v3 for continuity and nothing was edited. **Verdict: not consistent yet.** Wherever the sword is drawn from the shared spec file (museum, glide, dive, draw, inscription, paper test, macro), it matches itself: the pommel has exactly 11 rings and the 8 marks sit in two columns of four. Subtitles, the stamp, the J seal and the depth tag are also consistent throughout. But two blocks use their own drawing code and break the sword badly.

I rendered all 33 key frames, 76 film stills (every 1.5 s from 0.3 to 112.8 s) plus 7 extra stills, and compared full-size crops against the code. Times are v2 film seconds unless marked KF.

**The five worst inconsistencies:**
1. **Second chamber, 82–95 s (KF 27–29):** `world53d.tsx` draws a different, crude sword:
   - The blade is a flat yellow shape with no lattice or marks, the guard a plain blue rectangle, the pommel a thin T with no hoops or disc.
   - The sheath is a glowing brown outline with none of the first chamber's spots or red lines.
   - The shot is **mirrored**: the hilt points screen-left, but it points right in the draw (43–45 s), so the "back into the sheath" rewind doesn't read as the draw run backwards.
   - **The skeleton is missing.**
2. **勾践 thread, KF 13–20:** `kfG53.tsx` draws its own lattice (no jitter, plaid lines, different fills) and its own inscription glyphs, larger and thicker. **The marks change shape at the cut from KF 12 to KF 13**, exactly where the viewer is looking at them.
3. **Two incompatible tombs:**
   - The coffins are about 25 % bigger in the second chamber.
   - The colours change: brown with gold edges first, black boxes with large oxblood-red interiors later. The red also breaks the palette rule that only gold and blue are saturated.
   - `world53d.tsx`'s own header comment disagrees with its code on the coffin widths.
   - The bronze knife (铜削) that the facts place beside the sword is drawn in neither chamber.
4. **The tomb's other swords (86–90 s) have blue guards.** Blue glass is unique to the hero, and with the hero also reduced to a gold stick, only the glow tells them apart.
5. **The end is brighter than the start (95.8–101.4 s):** `scene53d.CaseW` adds a cream outline and gold halo while the subtitle says it has dulled. The final kitchen also doesn't match frame 0: wider framing, and a "window" rectangle around the sword that frame 0 doesn't have.

**Top fixes:**
- Redraw the second chamber's sword with the shared 3-D sword (`Sword3D`), hilt pointing right. Reuse the first chamber's sheath, coffin sizes, colours and skeleton (`scene53c`).
- Rebuild the 勾践-thread lattice and marks from the spec (`latCells`/`cellQuad`, `LAT`, `birdScript` at 12.5 mm).
- Use one shared bronze-knife component in both chambers.
- Give the other swords dull bronze guards instead of blue.
- Drop the end-case outline (`rim`).
- End the camera on frame 0's framing and remove the window lines.

**Smaller items:**
- Ridge: four different renderings (white hairline, cream line, soft band, white lines). Make it one thin gold crease.
- Sheath soil spots (39–42 s) are too large and pale; the sheath reads as spotted rather than black lacquer.
- The red-disc "sheath mouth" at 81 s doesn't look like a sheath mouth.
- The grey "duller" veil in the macro: tint it warm.
- The sword lies on the skeleton's upper arm instead of beside the body. The storyboard's tag 「剑在墓主人左侧」 is missing.
- The title glass leaf exists only during the title.
- Museum visitors are see-through.
- Tag sizes run from 28 to 104 px; settle on three sizes.
- The chromium tile changes position between its two appearances.
- The J seal nearly vanishes over the bright frames.

The report has a table per element (appearance, look, inconsistency, file, concrete fix) and a reference sheet naming the model appearance for each element. All renders stayed in /tmp; nothing was committed.

File: `tasks/ep53-continuity/out/continuity.md`
