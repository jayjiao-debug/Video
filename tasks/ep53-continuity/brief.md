# Task: continuity review of ep53 越王勾践剑 v3: are the same elements consistent between scenes? Review only, don't edit.

You are an independent continuity supervisor (场记) for a Chinese Douyin channel of subtitle-only history shorts built in Remotion as code (SVG). Episode 53 is told as ONE continuous camera move; the same objects appear again and again at different scales. The owner's instruction: **"also consistency of elements between scenes."** Find every place where the same element looks different from one scene to the next without a reason in the story.

## What to look at
- The v3 key frames: composition `KFV3` in `episodes/37-qiqing/remotion/src/qq53/KF53V3.tsx` (33 frames; render with `SFPS=1 ENTRY=qq53/KF53V3 CID=KFV3 … node scripts/frame_ms.mjs stills /tmp/kf 0 1 … 32`).
- The film as built so far (v2 timeline, new components): composition `EP53` (`ENTRY=qq53/EP53 CID=EP53`, arguments = film seconds, no SFPS): render one still every 1.5 s from 0.3 to 113 and any extra times you need. v3 will be re-timed later; judge the elements, not the timing.
- Setup: in `episodes/37-qiqing/remotion`, `npm ci`; Remotion needs Chromium's new headless shell (`find ~/.cache/ms-playwright -type f \( -name 'chrome-headless-shell' -o -name 'headless_shell' \)` → `REMOTION_BROWSER`; if none, `npx @puppeteer/browsers install chrome-headless-shell@stable` in /tmp). Make contact sheets with PIL; zoom into full-size frames to compare. Keep all renders in /tmp (the repo is public: never commit images).

## The elements to track (for each: every appearance, what differs, which file draws it)
1. **The sword** (the hero; the owner wants it impeccable): outline and proportions (55.6 cm; ~5 cm wide; the gentle waist), the diamond lattice (pitch, line weight, pale/dark fills, colour), the ridge, the guard (shape, blue glass on one face, turquoise on the other: which face shows when), the grip (two layered hoops, cord texture), the pommel (outturned disc, exactly 11 rings), the 8 marks (position, size, style), brightness and colour temperature, scale relative to other objects. Includes the flat views (chamber, inscription, paper test), the macro, the 3-D views, the case, the coffin swords, the reflection in the 勾践 thread, the kitchen glow, the end card.
2. **The black lacquer sheath** (39–47 s): shape, colour, soil spots, its mouth when the camera matches into it (81–84 s in v2), its look in the coffin later (84–95 s).
3. **The coffins, the 椁, the skeleton** across the chamber scenes (36–47 s and 84–95 s in v2; KF frames 10, 17–19): sizes, colours, the skeleton's look, the sword's position on the occupant's left, the bronze knife.
4. **The display / glass hood / plinth** at the start (5–17 s) and the end (95–107 s): the same object? Same proportions, materials, rests, lighting, hall (walls, labels, rope, visitors)?
5. **The cleaver** at frame 0 and the end (106–109 s, end card background).
6. **People:** the 1965 diggers, the excavators lifting lids, the gloved hands at the draw, the museum visitors, the 1977 film set (if any), the shadow-play figures (勾践, his wife, the envoy, 夫差, 伍子胥): one consistent silhouette style per world? Hands and sleeves the same colour family?
7. **Screen furniture:** subtitles (font, size, position, scrim), the top-right stamp (size, rule, fonts), the depth tag (style, position, units), tags and leader lines (fonts, sizes, colours), the element tiles (KF only), the hollow J seal (present everywhere except the end card; same size/position), the safe area.
8. **Light and palette:** style B「漆」 (dark warm ground, the sword the brightest thing; bronze-gold and the blue glass the only saturated colours); flag any scene whose palette or light direction jumps without a motivated change.

## Output
Write `tasks/ep53-continuity/out/continuity.md`:
- A verdict line and the five worst inconsistencies.
- A table per element: appearance (time / KF number) → what it looks like → the inconsistency → which file draws it → the fix (concrete: which version should be the reference and what to change).
- A short "reference sheet": for each element, the one appearance that should be the model for all others, with its time / KF number.
Your final reply: the verdict and the top fixes, short. About 60 minutes; write continuity.md early and extend it.
