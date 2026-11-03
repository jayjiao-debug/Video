# Task: 3 full-colour Ancient-Egypt looks (style frames) for a Douyin knowledge film

Nobody can answer questions. The owner (Jay) wants to see whether an **Ancient Egypt / pharaoh art style** works for his channel. Make **3 clearly different looks, 3 frames each**, as code-built 2D vector frames (HTML/SVG), the way the films are actually built. Check each frame once at full size and at 25 %, fix what is weak, then commit **only the HTML/SVG sources**. The repo is public: no PNG/JPG in the repo folder; render to `/tmp` for your checks. The owner's side renders them.

## 1. The channel's films (keep these rules)
- **Format:** Juno, Douyin, horizontal **1920×1080**, subtitle-only (no voice-over), music and sound effects. Each film tells one story through a sequence of scenes.
- **Construction:** everything is built in code as 2D vector shapes, so design with flat shapes, clean outlines and simple gradients/textures that SVG can do well. No photos, no traced museum photographs, no AI images.
- **Owner's wish:** "全彩的，视频全都是埃及的这种元素", including **the subtitles, which must also feel Egyptian**.
- **Furniture on every frame:**
  - the subtitle (owner wants it Egyptian, see §3);
  - a two-line stamp top-right (era · place / a short source note);
  - a small **hollow J seal** bottom-right: a ring outline plus a J in line only, ~65 % opacity, ~70 px. You may give the ring an Egyptian touch, e.g. a cartouche-shaped outline, but it must stay a quiet J;
  - **no bottom-left counter**.
- **Phone-safe:** nothing important within 120 px of the left/right edges or 58 px of the top/bottom. Subtitle text ≥ 52 px, labels ≥ 40 px, big numbers ≥ 96 px.
- **One hero accent per frame:** the brightest, most saturated thing is the story's subject (here: gold, or the sun's light on the pyramid).

## 2. Sample content (use these exact subtitle lines)
The sample topic is 「金字塔是谁建的？」.
- **Frame 1 — hook.** The Giza pyramids at the moment the story starts. Subtitle 「建金字塔的，[不是奴隶]？」. Stamp 「约公元前2560年 · 吉萨」 / 「胡夫金字塔」.
- **Frame 2 — people at work.** A team of workers hauling a stone block on a wooden sledge, one pouring water on the sand in front of it, an overseer. Egyptian figure canon:
  - head and legs in profile, eye and shoulders frontal;
  - simple almond eye; kilts, wigs, collars.

  Subtitle 「他们有名字，有面包和啤酒，[还有工钱]。」. Stamp 「吉萨 · 工匠村」 / 「考古发掘」.
- **Frame 3 — the number.** The Great Pyramid with a big number 「约[230万]块石头」 (≥ 120 px). Subtitle 「平均每块，约[2.5吨]。」. Stamp 「胡夫金字塔」 / 「估算」.

`[ ]` marks the highlighted keyword: give it the look's accent colour. Lines are placeholders for the style test; they don't need sources.

## 3. The three looks (make them clearly different; refine the names)
- **A 「墓室壁画」 tomb painting.**
  - Warm plaster ground (cream/ochre) with a subtle wall texture.
  - The classic Egyptian pigments: lapis blue, malachite green, red ochre, yellow ochre, black, white, gold.
  - Scenes laid out in registers (horizontal bands with ground lines), framed by a hieroglyph-column border and a top frieze (khekher or lotus).
  - Figures in the Egyptian canon with thin dark outlines.
  - **Subtitle:** set inside a painted **cartouche** (a rounded oval with the bar at one end) or a papyrus strip.
- **B 「黄金与青金石」 gold and lapis.**
  - Luxurious and night-dark: deep lapis/indigo with stars, gold line-art and gold fills (like a pharaoh's funerary treasure), turquoise and carnelian accents.
  - Figures as gold silhouettes with fine inner lines.
  - **Subtitle:** gold text on a lapis band with a gold frieze edge (a winged sun disc or a uraeus at its end).
- **C 「沙海电影感」 cinematic desert.**
  - A modern flat-vector film look, full colour: big skies with sunset/dawn gradients, the Nile, palms, the pyramids in atmospheric layers, warm sand.
  - Egyptian ornament is used as the UI frame: papyrus-texture subtitle scroll, a hieroglyph frieze on the scroll edge, a lotus or ankh motif.
  - Figures are stylised modern-flat but still read as ancient Egyptians.

For every look:
- **Chinese subtitle type:** use the system CJK fonts (Noto Sans CJK SC / Noto Serif CJK SC, installed). Pick what fits and give the text an Egyptian treatment: colour, edge, plaque and ornaments.
- **Legibility:** the text must be crisp and readable on a phone in under 2 s.
- **Hieroglyphs:** decorative only. Draw simple generic glyph shapes (reeds, birds, eyes, ankhs, water lines). Don't write fake sentences that claim to say something.

## 4. Files (in `tasks/egypt-looks/out/`)
- `A1.html A2.html A3.html B1.html … C3.html`: self-contained, 1920×1080, inline SVG/CSS, no external assets except the installed system fonts.
- `looks.md`: for each look:
  - the name and a one-line pitch;
  - the palette (hex);
  - the subtitle design;
  - what it would cost to animate (what moves easily, what's hard);
  - which one you'd recommend and why.
- **Render for your own check:** `python3 .claude/skills/production-crew/scripts/render_html.py tasks/egypt-looks/out/*.html --out /tmp/eg`. Look at each frame once at full size and at 25 %. Fix weak drawing first: figures, pyramids, text legibility.

## 5. Final reply
Per look:
- a 2-line summary;
- your recommendation;
- anything weak.

Only add files under `tasks/egypt-looks/`. Never print secrets.
