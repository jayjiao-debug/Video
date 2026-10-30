I fixed both review items (#6 and #10) in the 勾践 thread. Both hand-offs at 51.954 and 92.709 still show the unchanged v2 `TakeC(56.482)` frame, and the film renders throughout. I changed only `take53g.tsx`, `shadow53g.tsx` and `cam53g.ts`, and nothing outside my files needed changing.

## #6 (MAJOR): the story only read through the subtitles — done
- **Lattice over the reflection:** each vignette now has a glow over the lower half of the blade. Inside the glow the lattice is drawn at about 20 %; outside it the blade's own lattice stays at full strength.
- **Figure size:** I lowered the glide by 15 % (camera distance 19 → 16.2 cm) and stood each scene on the blade's lower edge, scaled as large as its frame space allows. Measured on full-resolution stills:
  - 勾践 in G4: about 280 px (was about 185)
  - 勾践 seated in G5: about 270 px
  - G7 soldiers: about 215 px to the head
  - G1 climbers: about 150 px (it is the wide siege shot)
- **Heads below the ridge:** every head stays below the ridge, including at 75.2. Some tall props still cross it: the mountain peak, the palace roof, the chariot canopy and the spear tips.
  - To fit, a few elements got smaller: 伍子胥 in G3, the chariot in G4 and the screen in G2.
  - In G1 the mountain is now a mid-tone, so the dark figures read in front of it.
- **No double exposure:**
  - G4: the half-transparent second horse is gone.
  - G7: two full-ink rows of three soldiers; I dropped the leftmost column because it sat in the window's edge fade and looked ghosted.
  - Scene changes: because the scenes now sit closer together on the blade, I changed the line changes from a dissolve to fade-out-then-fade-in. Stills at 57.0, 57.3, 61.6, 62.0, 81.3 and 81.6 never show two scenes at once.
- **G7 ranks step on the beat:** one pace per beat, moving over the 3 frames before the beat and landing on it, then holding. I checked this on frames 2522–2528 around the beat at 84.218.
- **Cap and sword:** the cap is now a tipped-over 冕 (a flat board on the crown, with bead strings hanging from both ends). The sword has a point, guard, grip and pommel and lies at a slight tilt. Both sit on a lit patch: the board is about 140 px wide and the sword about 180 px long.
- **Fact-check fixes kept:** the envoy kneels alone, 勾践 walks ahead of the horse, the gall sits on its stand, and 夫差 has no rope or blade.

## #10 (MINOR): G8 「还亮着」 — done
- **Blade height:** the blade now takes 50 % of the frame height at 87.5, 46 % at 89.8 and 40 % at 91.5, then rises into the hand-off view (35 %). Before, it was 34 %.
- **Lobe:** a soft specular lobe, lighting the pale diamonds and broken by the dark lattice, peaks on 89.8 (frame 2694). It is gone by 92.55, so the hand-off frame is unchanged.
- **Trade-off:** to keep the slide back to the hand-off smooth while the camera is closer, the glide drifts more slowly (0.34 cm/s, was 0.48) and the return starts at 85.4 (was 86.2).

## Motion check (low-res videos, compared with the version before this fix)
- **Hand-offs:** frame differences match the old version (6.76 vs 6.80 at 51.954, 6.27 vs 6.15 at 92.709).
- **Most seconds:** within ±0.5 of the old version.
- **Higher than before:**
  - The camera's descent at 53.5–55: 5.5–6.3 vs 4.3–4.9.
  - The pull-back at 85–89: up to about 5.8 vs up to 5.1.
- **Spikes:** no new ones. Every spike above 7 is a subtitle line change that the old version also had. The old 14.7 spike at 59.57 is gone.
- **Not met:** the brief's "≤ 3 per frame" isn't met in the moving stretches. The old version didn't meet it either (typical values 3.7–5 in 81–90).

**Type check:** reports no errors in my three files; the only two errors are old file-name casing problems in the qq45/qq46 folders.

The self-check with all the numbers and checked times is in `tasks/ep53-fix4-g/out/selfcheck.md`. I committed nothing.
