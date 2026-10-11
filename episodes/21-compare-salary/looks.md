# ep21 v3 · looks (gate 2a)

Contact sheet: `style/looks_sheet.png`. Frames: `style/look{A,B,C}_{hook,key}.png`, each with its self-contained HTML next to it.
None of the three uses the navy + gold night family, flat clip-art or any look rejected in brief_v3.md.
Mean frame luma: A 123 / 117, B 148 / 158, C 96 / 83 (v1 was 27 and read as "dark").

**Shared engine layer (all three looks):** subtitles in Noto Sans CJK SC 900, 64 px, white with #F6CF78 keywords on a rgba(6,8,13,.80) rounded strip, bottom 70 px. Corner mark "◆ Juno · VIBE知识大赏" top right. Top left kept clear. Title on a big framed plaque at 16.58 s. Juno end card at 125.4 s (J monogram, gold title, question, follow pill "关注 Juno · 一起看懂世界", sources).
Bar grid used below: bar n = 0.383 + 2.0248·n s (bar 8 = 16.58, bar 10 = 20.63, bar 24 = 48.98, bar 32 = 65.18, bar 39 = 79.35, bar 40 = 81.375, bar 48 = 97.57, bar 52 = 105.67, bar 56 = 113.77).

**Art director's ranking:** 1 · C Thermal (the bold one: strongest metaphor, one-glance key frame, cheapest and safest to render), 2 · A Prism Gallery (the most "大制作" 3D, but it needs a renderer patch to hit budget), 3 · B Foil Party (most fun on a phone, but the biggest risk of reading childish).

---

## Look A · 玻璃展馆 Prism Gallery
**Pitch**
1. **World/metaphor:** a glass museum at sunset. Every income is an exhibit under glass, standing beside someone else's, and light splits through prisms. To compare is to put your thing in a vitrine next to theirs. Pay transparency (the 2008 site) is literally glass.
2. **Palette/type:** ultraviolet #24106A, violet #7A22C4, magenta #E23FB2, coral #FF8A5B, apricot #FFC36B, glass white #FFFFFF plus a prism spectrum. Cold state: ice #5FD8FF over #1B2A9A. Labels in Noto Sans CJK SC 900, screen numerals in DejaVu Sans Bold, placards in Noto Serif CJK SC.
3. **Must NOT look like:** a white, sterile Apple store, a navy night, frosted blur everywhere, or game-UI cards.

**Camera and transitions** (one forward dolly through the gallery, left to right, never reversing)
- 0–16: slow push on the glass phone (¥4000). At 8.5 the roommate's taller glass phone rises on the next pedestal and the prism's rainbow swings onto it. At 12.5 your phone's inner light drains.
- **Title, 16.58:** the camera cranes up through the prism's rainbow, and the spectrum fans out into the title plaque etched in glass (a refraction sweep on the downbeat).
- **20.6, fly-into:** push into the vitrine glass of exhibit No.2, a refraction ripple, and we are inside two acrylic enclosures with crystal capuchin figurines, a jade-glass cucumber and an amethyst grape that glows.
- **48.98, match-cut:** a facet of the grape becomes a glass coin. Pull back to coin towers in two glass worlds, A and B (the breakdown: a slow 30° orbit, no hits). At 65.18 the coins re-stack into day tiles.
- **73.2, match-cut on vertical columns:** the towers become the glass tubes of the pay wall. At 79.35 a scan beam runs down the tubes and stops on yours. At 97.6 crane out: the tubes are now glass houses (light inside = happiness). At 105.7 push into your window and land on your phone back on its pedestal, the grape beside it. At 113.8 the prism turns and the rainbow leaves the roommate's vitrine for "去年的你 ¥0 → +¥4,000". At 125.4 the light condenses into the glass J of the end card.

**The drop, 81.375:** on the downbeat the median light-sheet snaps on, with the flash on the line only and a refraction shock ring spreading from your tube. Over one beat every tube under the sheet frosts from the bottom up (roughness 0 → 0.45), its liquid light drains from magenta to ice blue, and frost glints bloom. "满意度▼" lands on beat 2. The camera does one eased half-metre crane down toward your tube. No frame shake.

**Build plan**
- three.js r169 everywhere (the glass needs it): MeshPhysicalMaterial transmission and iridescence, a custom PMREM studio environment built from the palette (so every reflection stays in palette), UnrealBloom, canvas textures for screens and placards, DOM for labels.
- Monkeys, houses and the title are glass figurines built from primitives. Glass forgives simple modelling.
- **Risk, render cost:** measured on this 2-core box: 3.4–3.8 s per frame at 1080p with MSAA, 2.4 s at 0.75 scale without MSAA. To reach ≤1.5 s we need a two-line patch to a vendored three (half-res transmission target, samples 0), and dispersion only on hero shots. Estimate after the patch: 1.3–1.6 s.
- **Risk, glass behind glass:** a transmissive object cannot see another transmissive object. Never stage glass behind glass; secondary glass is transparent and iridescent.
- **Risk, white blow-outs:** keep cards under the bloom threshold.
- Cost: highest of the three.

## Look B · 气球派对 Foil Party
**Pitch**
1. **World/metaphor:** a birthday-party studio of chrome foil and latex balloons. Joy is air: a pay rise inflates, and comparison lets the air out (泄气).
2. **Palette/type:** teal #3FE6E0 → #1A9FB8, violet #4A2BB8, deep #24105E, chrome pink #FF6EC7, lilac #9B7BFF, butter #FFF07A, capuchin latex #E0873A with a cap #5A2C14, cucumber #5FC94A, grape #7A1FD6. Big numbers are inflated foil numerals; labels are Noto Sans CJK SC 900 pills.
3. **Must NOT look like:** a kids' cartoon, emoji stickers, flat game UI, or unlit plastic toys.

**Camera and transitions** (the camera rides the balloons: always rising or forward)
- Hook: the 4000 inflates out of your phone (on frame 0 the digits are already swelling). At 4.4 three small balloons pop up "1, 2, 3 天". At 8.5 the roommate's bigger chrome-gold 6000 floats in and towers over it. At 12.5 your 4000 sags and wrinkles, and its strings go slack.
- **Title, 16.58:** follow the 6000 up until it bursts on bar 8; the confetti settles into the foil title on a framed plaque.
- **20.6:** tilt down the string of the "？" into the balloon-animal lab (two candy stools). The capuchins are twisted-balloon figures, faceless, with a dark cap.
- **48.98, ride-along:** the grape cluster floats up and carries the camera into the sky, where the A and B worlds hang as two floating balloon coin stacks. At 61.1, 257 tiny balloons drift to A or B (123 to A). At 65.18 the towers swap for day balloons.
- **73.2:** rise to the pay wall, a balloon-garland chart sorted by size. At 97.6 the neighbours' houses are bouncy castles that inflate while yours deflates. At 105.7 descend to your phone, a grape balloon beside it. At 117.8 a new +4000 balloon inflates from last year's flat one.

**The drop, 81.375:** a gold ribbon (the median) whips taut on the downbeat. Every balloon under it crumples in a left-to-right wave over two beats (vertex sag plus wrinkle), its strings drop, and confetti bursts above the line. "满意度▼" appears in foil. The camera dips with the falling balloons.

**Build plan**
- three.js r169 with no transmission (metal, clearcoat, iridescence and a studio PMREM only). Measured 1.1–1.3 s per frame at full res, so it is within budget.
- Deflation is done per balloon in a vertex shader (onBeforeCompile). The balloon capuchins are capsules and spheres, already proven in the key frame.
- **Risk, the CJK foil title:** it needs Noto glyph outlines converted offline to a three typeface JSON (fonttools).
- **Risk, childish:** keep studio light, deep vignettes and chrome.
- **Risk, brightness:** this is the brightest look. The subtitle strip covers legibility.
- Cost: medium.

## Look C · 热成像 Thermal (the bold take)
**Pitch**
1. **World/metaphor:** the whole film is seen through a thermal camera that measures 满意度 instead of temperature. What you feel good about glows white-hot, and comparison cools it. The camera auto-ranges to the hottest thing in view, so once a hotter number appears, yours reads colder. That auto-range is the whole idea in one mechanic.
2. **Palette/type:** an ironbow LUT #06021A · #260A68 · #681696 · #BA2280 · #EE3E56 · #FF761A · #FFBE28 · #FFEC96 · #FFFFFA, with an ice accent for "below" #50E6FF over #10468A, and HUD white-cyan #EFFFFF. Isotherm contour lines give the texture. HUD readouts in DejaVu Sans Mono, labels in Noto Sans CJK SC 900; numbers are drawn as heat.
3. **Must NOT look like:** military targeting or surveillance (no reticle, no "TARGET"), horror, green night-vision, or a flat poster.

**Camera and transitions** (one operator's take through one campus, always forward or down, following heat through walls)
- Hook: push in on your hot phone. At 8.5 the roommate sits up on the top bunk and his phone blazes hotter (6000). The HUD auto-ranges, so at 12.5 your phone visibly cools from yellow to magenta (不香了).
- **Title, 16.58:** the scale bar sweeps and isotherms draw the plaque out of heat; it flashes white-hot on bar 8.
- **20.6, follow the heat:** the mug's steam rises through the ceiling into the lab. Two capuchin silhouettes sit in enclosures, the grape is the hottest object, and the refusing monkey cools. 95 / 60 / 20 % appear as HUD readouts.
- **48.98, match-cut:** the grape's heat bloom becomes a sun-like coin over the A and B worlds, where 257 heat dots walk.
- **73.2:** fly over a hall where staff stand on tiers sorted by pay (the 2008 list made public). At 79.35 a scan line sweeps the tiers and finds you.
- **97.6:** a top-down street; the houses are heat sources, the neighbours heat up, and yours cools as the range climbs. At 105.7 back to your phone, one hot grape beside it. At 113.8 you switch the HUD's reference lock from 室友 to 去年的你 (¥0), and your phone flares white again: +4000. At 125.4 the picture settles to violet and the J monogram glows into the end card.

**The drop, 81.375:** the median isotherm slams across the hall, with the flash on the line only. A cold front rolls down from it over two beats: every figure below shifts magenta → violet → ice, with frost glints and breath, while the warm crowd above stays lit. "满意度▼" lands on beat 2. The camera cranes down through the line (one direction). This is what `lookC_key.png` shows.

**Build plan**
- Canvas2D, or the same pipeline in one WebGL fragment shader. The heat field is drawn from 2D shapes at quarter resolution, then upscaled, LUT-mapped, contoured and bloomed.
- Measured 0.55 s per frame at quarter-res heat (the full-res prototype took 8 s because of the large canvas blurs). A shader version would be about 0.2 s. No models; every frame is deterministic.
- **Risk, blobs reading vague:** each scene needs one crisp silhouette (side views where direction matters, per owner notes).
- **Risk, surveillance mood:** keep the HUD minimal and never use a reticle.
- The ironbow ramp is monotonic in luminance, so it still reads for colour-blind viewers.
- Cost: lowest of the three.
