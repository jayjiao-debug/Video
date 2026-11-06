# Task: a shared SET-DRESSING library for the 古埃及神话故事 series (props, architecture, nature, animals, crowds)

Owner (2026-11-06): "like the reference videos there are a lot of other elements beside the characters — will we be able to get
some?" The reference films (another creator's Egyptian-myth series the owner likes) fill every frame with set dressing: temple
pylons and columns, offering tables with bread and beer jars, incense smoke, braziers, statues (jackal statues on pedestals, seated
colossi), marching rows of priests, mourners, workers, boats on the Nile, papyrus thickets, palm trees, desert dunes, starry skies,
cobras, scarabs, falcons, cats, crocodiles, a red sky for rage scenes. Build the same richness for our series, in OUR style.

Style: the series' flat-vector ancient-Egyptian tomb-painting look, ink outlines, palette lapis / gold / terracotta / turquoise /
papyrus cream (see `episodes/37-qiqing/remotion/src/qq60/` frame60.tsx, props60.tsx (WingedSun, GlyphColumns, featherD), geo60.ts
(PAL, sp, Glow), props60b.tsx, act60b_kit.tsx, heart60.tsx, and the ep61 code in `src/qq61/`). Designs must be attested Egyptian
forms (museum objects; cite the source for each non-trivial piece in the doc). No Wikipedia/百度百科/知乎.

## Library (new file(s) under `episodes/37-qiqing/remotion/src/qq61/sets61*.tsx`; pure SVG components with (x, y, scale, t) props;
## every piece animated where it naturally moves, driven by t)
- Architecture: temple pylon with flagpoles, papyrus-bundle and lotus columns (open/closed capitals), architrave with winged sun,
  obelisk, seated colossus, sphinx (and an avenue of ram-sphinxes), naos/shrine, throne, stepped dais, false door, tomb facade,
  pyramid group, mastaba, palace window of appearances.
- Nature: the Nile (water lines, ripples), papyrus thicket (swaying), lotus pond with flowers opening, date palms, desert dunes,
  night sky with stars, sunrise/sunset sun, the primeval waters (Nun) and the primeval mound (benben), a red sky.
- Props: offering table piled with bread, figs, jars, a goose and lotus; beer jars, incense burner with rising smoke, oil lamps,
  braziers with flames, canopic jars, papyrus scrolls, scribe palette, senet board, sistrum, ankh, was and djed pillars, the sun barque,
  a papyrus skiff, a funerary bed with lion legs, chests, baskets, fans of ostrich feathers.
- Animals (small, secondary, animated): falcon (perched / flying), ibis (wading), cat (sitting, tail flick), cobra / uraeus (sway,
  hood flare), scarab (walking, pushing a ball), crocodile (in water), geese (flying in a line), cow, jackal (lying on a shrine),
  fish under the water.
- Crowds (silhouette or simplified figures, built from the ep60 rig where it fits, staggered timing so they never move in unison):
  a procession of priests (walking, carrying a shrine), mourners (arms raised), workers (hauling a block, carrying baskets),
  dancers/musicians (sistrum, harp), soldiers with spears.
- Ambient motion: flame flicker, smoke curls, dust motes, birds crossing the sky, water shimmer, light shafts.

## Deliverables
1. The components (code only), exported for use by future episodes; keep ep60/ep61 rendering unchanged (new files only, plus at
   most exports added elsewhere).
2. A catalogue composition `SETS61` (registerRoot in its own entry file, e.g. `src/qq61/setsbook61.tsx`): 1440 × 1080, one page per
   category (architecture, nature, props, animals, crowds, ambience) laid out like a design sheet with Chinese labels and the source
   tag per item; plus 3 example scene compositions `SCENE61` frames (e.g. a temple courtyard at night with priests and braziers; the
   Nile at sunset with papyrus, skiff, ibis and crocodile; a hall with offering tables and incense) showing how the pieces layer
   (background / middle / foreground) behind characters. Also `SETSANIM61` (~3 s per page) to show the motion.
3. Render every page/frame in the runner and look at them at full size; fix overlaps, clipping, bad layering, illegible labels.
   DO NOT COMMIT IMAGES, VIDEO OR AUDIO (public repo) — code and markdown only.
4. `episodes/61-zhongshen/setsbook.md`: the catalogue in words (component name, props, what it is, source), and layering rules.
5. `tasks/ep61-sets/result.md`: a short Chinese summary + render commands.
Rules: only add files under `src/qq61/`, `episodes/61-zhongshen/` and `tasks/ep61-sets/`; do NOT edit cast61/chars61/heads61/rig60
(another task is changing the characters right now). No keys in files. Set a git identity before committing
(git config user.name "Claude"; git config user.email "noreply@anthropic.com"). End commits with:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
