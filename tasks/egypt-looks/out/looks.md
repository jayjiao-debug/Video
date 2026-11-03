# 三种古埃及外观 · Three Ancient-Egypt looks (9 style frames)

Sample topic 「金字塔是谁建的？」. Frames: 1 hook, 2 people at work, 3 the number. All 1920×1080, inline SVG/CSS, system CJK fonts only (Noto Serif / Sans CJK SC). Hieroglyphs are decorative generic shapes (eye, ankh, reed, bird, water, djed, was, feather, sun, lotus, cobra, loaf, basket); nothing is written as a sentence. The figures use one shared canon: profile head and legs, frontal eye and shoulders, almond eye with kohl line, wig, usekh collar, pleated kilt.
Preview: `python3 .claude/skills/production-crew/scripts/render_html.py tasks/egypt-looks/out/*.html --out /tmp/eg`

Furniture on every frame: subtitle, two-line stamp top-right (40 px, right edge x=1780/1800), hollow J seal (~70 px, 65 % opacity, centre 1750,968), no bottom-left counter. Subtitle 58–62 px, big number 120 px with 196 px for "230万". Nothing important is inside 120 px of the left/right edges or 58 px of the top/bottom. The side hieroglyph columns and top frieze in A are decoration only.

---
## A 「墓室壁画」 Tomb Wall (A1–A3)
**Pitch:** a painted tomb wall that looks like an Egyptian wall painting. Plaster, registers, hieroglyph columns and the figure canon do the work.
**Palette:** plaster `#E9D3A2` / `#F4E8C6` / `#EFDDB1` · ink `#2B1A12` · lapis `#1F4FA3` · malachite `#2E8B57` · red ochre `#C4452A` (figures `#B04F2B`) · yellow ochre `#E7B84E` / `#C98F33` · white `#F6EEDB` · gold `#FFE27A→#E7A312` (pyramid caps, sun disc).
**Hero accent:** gold (sun disc and pyramid cap). Keyword colour: vermilion `#C4301C` on the cream cartouche, because gold would not read on cream.
**Subtitle:** a cream cartouche (rounded oval, double red inner line, lapis bar at the right end), Noto Serif CJK SC Black 62 px in ink, keyword in vermilion. It sits below the last register ground line, so the picture never touches it.
**Frame furniture:** khekher frieze across the top (blue/red/green), glyph columns left and right, tricolour stripe along the bottom. Stamp in ink. The J seal sits in a cartouche-shaped oval.
**Animation cost:** *Easy:* parallax slide of whole registers (procession, haulers walking), sun rays rotating or pulsing, frieze scrolling, cartouche pop-in, glyphs fading in one by one, water pour. *Medium:* hauling cycle. Limbs are separate polylines, so a 4-pose walk loop is cheap. Rope, sledge and block move rigidly. *Hard:* nothing much. The flat style forgives stiff motion, which suits a wall painting. The plaster feTurbulence texture is the one render-time cost. Bake it as a still layer.

## B 「黄金与青金石」 Gold & Lapis (B1–B3)
**Pitch:** a night-dark funerary treasure. Lapis sky, gold line-art, gold silhouettes and cloisonné inlay.
**Palette:** night `#060A28` → lapis `#0F1C5E` → `#21389A` · band lapis `#1B3AA0 → #0B1B63` · gold `#FFEFB0 / #F0BC4C / #B97A12` · champagne text `#F8EBC2` · hero gold `#FFC21A` · turquoise `#2BD1C0` · carnelian `#E0502E`.
**Hero accent:** the gold. The gold sun and cap in 1, the gold figures in 2, "230万" and the gold-lit pyramid face in 3. Turquoise and carnelian are kept to small inlays (band frieze, collars, one block each in 3).
**Subtitle:** a lapis band with a cloisonné frieze edge (gold/turquoise/carnelian/lapis dentils) and a winged sun disc at each end. Noto Serif CJK SC Black 58 px in champagne gold with a dark halo, keyword in saturated gold `#FFC21A`.
**Animation cost:** *Easy:* star twinkle, sun-ray rotation, glow pulse, a gold shimmer sweeping over the band, wings flapping slightly (4 layered paths), dunes drifting. *Medium:* the gold figures, same rig as A, fills are gradients. Add a light sweep via a moving gradient. *Hard:* real metallic sparkle. Fake it with moving gradient stops and sparkle sprites rather than filters. This is the most "expensive-looking" look for the least geometry.

## C 「沙海电影感」 Desert Cinema (C1–C3)
**Pitch:** a modern flat-vector film look, with sunset/dawn skies, atmospheric pyramid layers and the Nile. Egyptian ornament appears only in the subtitle scroll and the glyph rows.
**Palette:** sky `#262266 → #6F3F8E → #E8715A → #FFC27A` · sun `#FFF4CC` · pyramid lit `#FFD98A → #E5835A`, shade `#7A3E62`, haze layers `#C98FA8` / `#D9908C` · sand `#E9A767 → #A9603C` · night silhouettes `#241236` · papyrus `#E8D49C` · scroll ink `#34200F` · keyword `#B8300E` · hero gold `#FFCF5A` (number) · skin `#B77449` · kilt `#F7EEDC`.
**Hero accent:** the sun-lit pyramid face and the sun. In 3 the number is gold-yellow.
**Subtitle:** a papyrus scroll with rolled ends, a hieroglyph frieze on both edges, a lotus at the left and an ankh at the right. Noto Sans CJK SC Black 60 px in dark brown, keyword in burnt vermilion.
**Animation cost:** *Easy:* the camera dolly (the layers are already separated, so parallax is nearly free), the sun rising (gradient + circle), god-rays, birds, palm sway, a boat on the river, dust, the scroll unrolling (clip-path or scaleX). *Medium:* the figures are flat and have no outline, so they scale up and animate like A/B. Long shadows must follow the sun. *Hard:* gradient banding on big skies in H.264, so add a little grain. Big full-screen gradients and blur layers cost the most render time of the three.

---
## Recommendation
**C for the channel as a whole, with A's registers as a transition device.** Reason: C is the only look that feels like a *film*, and it matches the owner's "全彩" wish best. Parallax and sunrise give the most motion for the least work, and it works on a phone at 25 %. The Egyptian identity sits in the subtitle scroll, the glyph friezes and the figure canon, so even frames with no figures read as Egypt.
**A** is the most unmistakably Egyptian and the most distinctive on a Douyin feed. It is also the cheapest to animate and the easiest to keep consistent across episodes. It suits an episode that is itself about an Egyptian artefact.
**B** is the most luxurious, but it is best for a few "treasure" or "number" beats rather than a whole film. The dark ground limits the colour range, so it is less full-colour than the owner asked for.
A sensible house recipe: C for the main scenes, A-style register wipes for people/work scenes, B for the climactic number beat.
