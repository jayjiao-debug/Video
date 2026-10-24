# 《假如你是清明上河图》: three looks (gate 2a, r2)

Contact sheet: `style/looks_sheet.png` · frames: `style/look{A,B,C}_{hook,key}.png` · HTML sources: `style/src/` (code-drawn, about 3 MB).

**Placeholder text.** The script isn't written yet. Hook frames use the teaser "你被人偷偷换成了假的". Key frames use the handover beat 裱画匠用一幅假画换走了你，/ 转手卖给了一位权贵。 All historical details follow facts.md:
- **The swap (C9):** recorded by the buyer 杨准 in 1352; the swap itself is undated. The Palace Museum dates the theft from the Yuan palace to the 至正 years. The swapped scroll went to a 权贵.
- **杨准 (C11):** bought the scroll in 1351.
- **Age (O8):** anchored on c. 1100 (估算). 约240 is used instead of 250 because 250 reads as 二百五.

**No scan.** The Palace Museum forbids reuse of its images (L1), so every painted city is code-drawn.

**Seals are illegible stand-ins.** facts.md lists the 毕沅 / 毕泷 joint seals and 嘉庆's 五玺, which can be named at their own beats. 96 seals in total (O5), so the film never claims one seal per owner.

## Shared engine layer (r2 changes in bold)
- **Subtitle:** top-left, x 150, y ≥ 132. Noto Serif CJK SC Black 58 px, red key word, ≤ 2 lines, line ends ≥ 120 px left of the stamp. **Stills show the line fully revealed** (in motion the reveal finishes within 0.4 s).
- **Stamp:**
  - **Line 1 (year · place): 56 px.**
  - **Line 2 (event + plain-language source): 40 px, ≤ 14 字.** Example: `裱画匠以假换真（杨准记）`.
  - **Line 3 (who the source is): 34 px, only on beats held ≥ 4 s.** Example: `杨准：1351年买下你的文人`.
  - Teaser cuts show line 1 only (`元 · 宫中`).
  - The dimensions line is gone.
- **Corner mark (engine change for the producer to confirm series-wide):** same text, now **30 px bold, 0.06 em tracking, 92 % opacity, red ◆**. It reads at 480 px; the old 21 px / 0.3 em mark did not.
- **Counter:** red era chip + `你 约240 岁`.
- **End card:** unchanged (J monogram, gold title, question, `关注 Juno · 一起看懂世界`, sources).
- **Craftsman's head (S2):** facts.md doesn't settle it, so this is my call: a Han craftsman in 元大都 wears a **plain cloth cap with no hanging tails**. 婆焦 is a Mongol style and reads as a costume note. The researcher may overrule.
- **Hats are drawn as separate shapes.** In r1 the hat and head were one path, and the opposite winding punched a gap (the "headphone band" look).

---

## A · 汴河暮影 (dusk silhouettes): *最贴近参考格式；与近两期同属剪影系*
1. **World:** the format's silhouette theatre with skies mixed from the scroll's own pigments. The scroll glows like a paper lantern and lights its owners. The reusable handover stage is the 虹桥 crest. Per era only the sky and season, the hat silhouettes and the boat beyond the railing change.
2. **Palette and type:** sky `#2B4552 → #6E827E → #E6B676 → #F3CC8E`, silhouettes `#15100C`, hero silk `#FFF3D8` with a `#FFD58F` rim, red `#EE4B3B`. Mean luminance 86 / 100. Noto Serif CJK SC.
3. **Must NOT look like:** iwanau's altar with dynasty banners, mint jade or red-purple sunsets; flat clip-art; front-on figures; hands that float short of what they touch.
- **r2 hook:**
  - The craftsman is rebuilt from joints: shoulder at the top of the torso, elbow resting on the tabletop, forearm along it, and a closed hand with a thumb notch flat on the real silk. His head is bowed toward his hand.
  - The scrolls are larger and show the bridge section, so the 虹桥 reads on both the real one and the grey copy.
  - The empty table front is cut to 80 px.
- **r2 key:**
  - Framed on the crest: figures 520 px tall (54 % of frame height), open scroll 436 px wide with the 虹桥 legible on it.
  - Both hands grip the rollers. The buyer keeps the Yuan brim. Railing, lanterns and the lowering mast place the bridge.
  - The river light is now soft broken ripple dashes.
- **Build:** three.js 2.5D silhouette kit (bridge geometry, fog layers, edge rim from the hero light, emissive silk with bloom). Each handover is a different move (push through the glowing silk, season change on a bar, the boat passing under).

## B · 长卷 (the scroll is the world)
1. **World:** the film is one handscroll and the camera travels right→left as it is read. After the painting's end the scroll carries on into the colophon paper, where each later owner is painted in the scroll's own manner (界画 oblique projection, ink line and one flat wash). Seals pile up on the joins.
2. **Palette and type:** silk `#C8AD82`, paper `#D6C29A`, ink `#2A1F17`, 石青 `#41708A`, 石绿 `#6E8E68`, 赭 `#A8683A`, cinnabar `#B42E22`. Ink-on-silk subtitles with a silk halo (director's ruling). Mean luminance 159 / 179.
3. **Must NOT look like:** a museum display board (one subtitle, one stamp, one counter, at most 3 seals per frame); cartoon figures (no eyes or mouths, only a profile nose and brow); a slideshow of vignettes; text over linework.
- **r2 hook:**
  - The copy is a separate sheet underneath: slightly askew, with its own plain-silk border, a wedge of table showing under its edge, and the roller's shadow falling across it.
  - The bottom band is now a lacquer table with grain, not a black bar.
  - A haze band covers the top 400 px of both sheets, and the stamp and corner mark get a feathered halo.
- **r2 key:**
  - The figures are redrawn opaque in the painting's manner, standing on a floor line with short shadows. They hold the scroll open between the rollers, so the painted 虹桥 shows.
  - The 界画 table stands behind them with its legs, its edge hidden by their bodies, and the folding screen stands behind the table.
  - The colophon text and 2 of 5 seals are removed (clutter), and the haze band runs across the top.
- **B3, the reusable handover set:** the same 界画 room every time (floor line, folding screen, table behind, two owners holding you open). Per owner only these change:
  - hats and robes;
  - the screen's painting (season);
  - the one new seal;
  - occasionally a prop on the table (crate, lamp, inventory book).
- **B3, the seal run (the century compressor):** seals slam onto the brocade join one per beat while the stamp's year and the counter roll. Example: 1799 毕沅 raided → 嘉庆 stamps 五玺 (C22–C23). Each run varies the slam so it never repeats (owner row 86): a fresh seal; a faded one; one half-hidden under a later seal; one seen through museum glass. Real seal names appear only where facts.md lists them (毕沅秘藏 / 毕泷审定 on the joins, C21; 嘉庆 五玺).
- **Build:** Remotion + Canvas 2D long track (tile-streamed silk, parallax between the painting and the era layer). three.js for 2–3 pull-backs where the scroll is an object (pull-backs use ivory text). Transitions come from the scroll: a silk join, a seal slam, rolling up, a dive into a seal.
- **Still to do if B is picked (B6):** a proof vignette of a 1923–1950 beat in ink line.

## C · 开盒的人 (bold, your point of view)
1. **World:** you never leave your own box. **You are always in frame:** your silk lies across the bottom ~22 % of the view (painting legible, the roller, a seal across a join) and is the light that falls on the owners leaning over the lid. The box, lid, silk and the world beyond roll together when you change hands.
2. **Palette and type:** lining 胭脂 `#5C1F24 / #6A2328`, now a **tone-on-tone 云纹 cloud brocade** that only shows where light falls (the red diamonds read as carpet or 红包). Lacquer `#1E120C`, brass `#8A6A3C`, your light `#FFD69A`. Era ceilings carry the colour. Mean luminance 69 / 78.
3. **Must NOT look like:** horror (no faces from below, no eye sockets, profiles only); a red hallway; hands reaching in; a hat brim that reads as a beak (the brim is now a deeper disc and he is tilted less).
- **r2 hook:** your glowing silk runs along the bottom and the grey copy has been laid over its right half, so the swap reads as one picture: light being covered by grey. The craftsman bends in under the lid edge to lay it.
- **r2 key:** the same box with you glowing at the bottom; the craftsman pulls back while the 权贵 (brimmed hat) leans in. The lid, its edge, the lantern and your silk all roll −6° together. The stray lantern sliver is gone (the lantern now hangs fully below the lid edge).
- **C3, move list (10 distinct moves, each tied to its beat):**
  1. *After 1127 (C5), "you turn up in the Jin state":* the box rides north tipped on its side in a cart. The world turns 90°, the opening becomes a slot of winter sky, and snow drifts in. How you left is unverified, so the looting itself is never shown.
  2. *1186 张著 (C6):* the camera rises out of the box for the first time and looks along your own silk while 翰林张择端… writes itself onto the bottom band stroke by stroke (verified text).
  3. *The swap (C9):* the copy is laid over you (hook). Then the lid slams, and only light through the keyhole and cracks swings as you are carried off.
  4. *1351 杨准 (C11):* the lid flies open on a bright southern sky. This is the reverse of the slam, the film's first daylight.
  5. *陆完 hides you (C15):* the box slides sideways into a hiding place, the opening goes dark, and a slit of light shows under a door.
  6. *严家 raided → Ming palace (C16, C19):* the box is tossed onto a pile and tumbles (the camera rolls 180°). It settles among other boxes' lids, and lanterns peer in.
  7. *1578 冯保 (C20) and 1923 溥仪 (C24):* a palace gate tunnel slides overhead, from the bottom of the opening to the top. In 1923 the tunnel gives way to train-roof lights strobing past (Tianjin → 长春, C26).
  8. *1799 → 嘉庆 (C22–C23), seal run:* the lid opens and closes on the beat with a new ceiling each time, and each time a seal stamps onto your band while the counter rolls.
  9. *1945 (C28), "你在乱中失去下落":* darkness, the box jolting, only passing lights. No plane and no place, because the record has none.
  10. *1950 杨仁恺 (C30–C31), then the museum (C32, P2–P3):* a flashlight sweeps across three lids and stops on you. The final orbit: the camera rises out for good under a glass case while a ring of queueing silhouettes circles above (2015 / 2025).
- **What C cannot show from inside, and how it reads instead:**
  - *The 1127 fall:* fire glow flickering on the lid lining and smoke in the opening, with place and year carried by the stamp.
  - *Teaser fates:* told by light and sound alone (slam, keyhole light, flashlight).
  - *The present-day hook* (the 2026 Suzhou showing of another 清明上河图, P7): the one sanctioned exit from the box, a phone screen lit in the dark vault.
- **Build:** three.js. One well-made box model (lining texture, brass lip, hinged lid). One warm area light from your silk plus each era's key light. 2.5D outside worlds and profile silhouettes with an edge rim.
- **Still to do if C is picked (C4):** a teaser still.
