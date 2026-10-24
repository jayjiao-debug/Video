# 《假如你是清明上河图》: three looks (gate 2a)

Contact sheet: `style/looks_sheet.png` · frames: `style/look{A,B,C}_{hook,key}.png` · HTML sources: `style/src/` (self-contained, code-drawn).
All on-screen text is a **placeholder** (the script isn't written yet). Hook frames use the teaser line "你被人偷偷换成了假的"; key frames use the handover beat with the full furniture. The city painted on every scroll is a **code-drawn stand-in**, not the real painting.

## Shared engine layer (the same in all three looks)
- **Subtitle:** top-left at x 150, y ≥ 132, so the ~120 px band at the very top-left stays clear for the Douyin watermark. Noto Serif CJK SC Black, 58 px, ≤ 16 字 per line, written in character by character (the stills show the last 2–3 glyphs still fading in). Ivory `#F6EFE2` with a soft dark edge and a borderless feathered shade, no box. Key word in 印泥红 `#EE4B3B`.
  **One deviation for the director to rule on:** on look B's light silk the same component flips to ink `#1D140D` with a silk halo, and the key word becomes `#B42E22`.
- **Stamp (top-right):** sits under the corner mark. Right-aligned, with a vertical red rule on its right edge (iwanau uses a horizontal dash before the year). Three lines: year · place (Black 42 px) / event + source (Bold 28 px) / detail or quote (23 px, 66 %). Teaser cuts show only the year · place line.
- **Age counter (bottom-left):** era in a vertical red seal chip (`元`) + `你 约 250 岁`, with the number at 88 px Black.
- **Corner mark:** `◆ Juno · VIBE知识大赏`, top 46 / right 60, serif 21 px, as in ep36.
- **End card (not drawn here):** J monogram, gold title, comment question, follow pill `关注 Juno · 一起看懂世界`, sources. It is built from each look's own materials: dusk sky (A), silk + seal (B), the box lid (C).
- Note: craft.md puts subtitles in y 820–960. This format moves them to the top-left, as the producer asked, so the bottom-left belongs to the counter.

---

## A · 汴河暮影 (Dusk silhouettes on the 虹桥): faithful to the format
1. **World:** the format's silhouette theatre, with skies mixed from the scroll's own mineral pigments. The hero is the scroll itself, glowing like a paper lantern; it is the only light that matters and lights its owners' faces. The reusable handover stage is the painting's most famous structure, the 虹桥 crest. Two owners in profile hold you open between them. Each era changes only the sky, the season (snow for 1127), the hat silhouettes and the boats under the arch.
2. **Palette and type:** sky `#2B4552 → #6E827E → #E4B575 → #F0C688`, silhouettes `#15100C`, hero silk `#FFF3D8` with a `#FFD58F` rim light, river `#182124`, lanterns `#F2B866`, red `#EE4B3B`, text `#F6EFE2`. Mean luminance 72 (hook) / 88 (key): mid-tone dusk, not navy night. Noto Serif CJK SC.
3. **Must NOT look like:** iwanau's altar-with-dynasty-banners, mint jade or red-purple sunsets; flat clip-art held in fixed frames (owner, ep21); the series' old navy-and-gold night; front-on figures (always profile, nose bump, so direction reads).
- **Frames:** hook = a 元大都 mounting workshop (White Dagoba in the moon window); two identical scrolls on the table, the real one glowing, the copy dead grey, the craftsman's hand on the real one. Key = the 虹桥 handover at dusk.
- **Build:** three.js, 2.5D. Real bridge geometry (instanced timber beams, railing posts, flat-black material with a fresnel rim); sky gradient dome; fog layers for depth; figures as silhouette planes with a rim taken from the hero light (silhouette alpha minus an offset copy, as in the stills); hero = a curved silk plane with an emissive painting texture and bloom; calm low-distortion water reflection. Transitions: push into the glowing silk, which becomes the next scene's light source; the season changes across the same bridge on a bar.
- **Risk:** closest to the reference, so the furniture styling and palette must stay ours. Built flat, it turns into the clip-art the owner rejected.

## B · 长卷 (The endless scroll): the scroll is the world
1. **World:** the whole film is one horizontal handscroll. The camera tracks right→left, the way a handscroll is read. First comes the painting's city; past its end, the scroll carries on into the colophon paper, where each later owner's era is painted in the scroll's own linework (界画 oblique projection, ink line plus light washes). Every owner's red collector seal stamps onto the silk on the beat, and the seals pile up as the visible counter. This is literally how the real scroll records its owners (colophons and seals).
2. **Palette and type:** silk `#C8AD82`, colophon paper `#D6C29A`, ink `#2A1F17`, 石青 `#41708A`, 石绿 `#6E8E68` (muted, never mint), 赭石 `#A8683A`, cinnabar seals `#B42E22`, mounting brocade `#6E5A40`, the fake's grey `#A9A8A2`. Mean luminance 147 / 172: the series' first light-ground look, which leaves the navy/gold family. Noto Serif CJK SC; colophon columns in Noto Serif CJK SC 600.
3. **Must NOT look like:** a museum-website zoom of the painting; cartoon figures (owner, ep26); a slideshow of vignettes (it is one continuous track); sepia mud (the washes and seals stay crisp); black and white.
- **Frames:** hook = you being rolled up and carried off to the left while a grey copy lies underneath in your place (the roller's end shows the wound silk). Key = past the painting's end: a brocade join with a seal stamped across the seam (骑缝), the 1352 handover painted on the colophon paper, old seals faded and the newest one fresh.
- **Build:** Remotion + Canvas 2D for the long track (tile-streamed silk, with parallax between the painting layer and the era layer). three.js for the 2–3 pull-backs where the scroll is an object (rollers, rolling up, page curl, raking light for silk sheen). Transitions come from the scroll itself: a silk join passes = a new era; a seal slam = a cut on the beat; rolling up = hiding; a dive into a seal = a jump in time.
- **Dependencies:** a public-domain scan of the real painting (researcher to confirm the licence) would let act 1 use the real 清明上河图; otherwise use the code-drawn stand-in shown here. The background colophon text in the key frame is 张著's 1186 colophon typed from memory; **the researcher must verify it** or it gets replaced.
- **Risk:** drawing quality of the painted figures (the stills are stand-ins; they need a proper figure kit in the painting's manner), and a light first frame in a feed of dark films.

## C · 开盒的人 (The ones who open the box): bold, your point of view
1. **World:** a trunk shot. You are the scroll, so every scene is seen from inside your own brocade-lined box, looking up through the open lid. You only ever see the people who open you. Their profiles are lit warm from below by you (the "glowing briefcase" light). The box is the reusable handover set. Only the world beyond the lid changes: a palace ceiling, the craftsman's rafters, the 神武门 gate tunnel passing overhead in 1922, a train roof, a flashlight in a warehouse, museum glass ringed by a queue of heads.
2. **Palette and type:** lining 胭脂 `#6A2328` with muted gold `#B08850`, lacquer `#1E120C`, brass lip `#8A6A3C`, your light `#FFD69A`. Era ceilings carry the colour, e.g. 彩画 `#3E6B74` / `#5E8C7A` with `#B8402E` / `#D8B060`, or workshop timber `#6A503A`. Silhouettes `#130D0A`. Mean luminance 68 / 59. Noto Serif CJK SC.
3. **Must NOT look like:** horror. No faces seen from below and no eye sockets: my first test turned them into screaming masks, so the figures are always profiles. Also not a hallway with a picture at the end, and never hands reaching into the box; a lift is shown by the camera rising.
- **Frames:** hook = the craftsman bending over the box while a grey copy of you is laid across the opening like a lid. Key = the same box, a rich house's painted beams beyond it, the craftsman pulling back and the 贵官 (brimmed hat) leaning in; the box rolled −6° because it is changing hands.
- **Build:** three.js. One well-made model (lacquer box, lining texture, brass lip, hinged lid). The camera lives inside it. One warm area light from the floor (you) plus each era's key light from beyond the lid. Outside worlds are 2.5D layers; figures are profile silhouettes with an edge rim. Cheap to build well: one model, light-driven. Motion: the box is carried (sway), passed (roll), opened and shut. Transition: the lid slides shut as a wipe through wood (never black) and opens on the next era.
- **Risk:** the 5-second read ("where am I?") and the sameness of one viewpoint for 3 minutes. It needs the outside-world variety listed above, and the cold reader should test it hardest.

---

## Placeholder facts used in the frames (researcher to confirm or replace)
1352 · 元大都 · 装裱匠以赝本换出（杨准跋，相传）· 转手卖给一位贵官 · 纵24.8厘米 × 横528.7厘米 · age ≈ 250 · the White Dagoba as the 元大都 skyline · the 张著跋 text (B key, background) · seal legends 鉴藏 / 珍秘 / 宝玩 are generic stand-ins, not real seals on the scroll.
