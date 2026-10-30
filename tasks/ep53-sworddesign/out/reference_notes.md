# ep53 · 越王勾践剑: reference notes for the redesign

Started 2026-10-30 12:50 UTC. All photos were downloaded to `/tmp/ref/` and looked at there. None are in the repo.

## 1. Sources

### Text sources (for numbers)
| # | Source | What it gives |
|---|---|---|
| T1 | 澎湃新闻 · 翻书党, 《〈国家宝藏〉：越王勾践剑为什么"千年不腐"？》, 2018-05-18, excerpted from the book 《国家宝藏》 (中信出版集团). https://www.thepaper.cn/newsDetail_forward_2136936 | "全长55.6厘米，剑首向外翻卷作圆箍形，内铸有极其精细的11道同心圆" · "剑身长47.3厘米，两面满饰黑色菱形几何花纹" · "圆茎中空，茎长8.4厘米" · "剑格宽5厘米，正面用蓝色琉璃，背面用绿松石镶嵌成美丽的纹饰" · "在剑身近格处有两行8字的鸟篆铭文" · "我们现在看到的是黄黑色" · "出土时，剑插于黑色漆木剑鞘内" |
| T2 | Hubei Provincial Museum's own label, photographed in the gallery (photo P11 below) | "越王勾践剑 剑身有八个鸟篆铭文'越王鸠浅(勾践)自乍(作)用鐱(剑)'，湖北荆州江陵地区出土。（湖北省博物馆提供）" |
| T3 | Press summaries of the museum's 60th-anniversary research release (2025-04-29), e.g. 新京报 https://m.bjnews.com.cn/detail/1745912633129824.html | 7 production steps, 18–20 % tin in the blade, blade and edge cast in one piece. No new dimensions. |
| — | Widely repeated figures, not traced to a primary page: blade width 4.6 cm, weight 875 g, 11 rings spaced 0.2 mm apart. Some sites give 55.7 cm. | We keep 55.6 cm (facts B1, T1). |

**Blocked:** hbww.org.cn (湖北省博物馆) loads its 典藏 / 镇馆之宝 / 珍宝档案 lists with JavaScript, so curl could not reach the sword's page or its official photos. I couldn't find 国家文物局, 国博 or 新华社 picture pages with usable high-resolution close-ups in the time available. The 望山楚墓 excavation report (with the measured drawing) is not online. So the visual evidence below is high-resolution gallery photos of the real object in the Hubei Provincial Museum, hosted on Wikimedia Commons. They are good evidence for shape, colour and pattern, but they are not official publications.

### Photos looked at (all of the real sword in the Hubei Provincial Museum)
| # | URL | What it shows |
|---|---|---|
| P1 | https://commons.wikimedia.org/wiki/File:Sword_of_Goujian,_2019-06-15_05.jpg | **Whole sword, nearly face-on**, guard right, under the gallery's neutral light. Main source for the outline, the proportions of hilt, guard and blade, and the pattern scale. |
| P2 | https://commons.wikimedia.org/wiki/File:Sword_of_Goujian,_2019-06-15_03.jpg | **Guard, front (blue-glass) face**, seen from the blade end, plus the 2 lowest characters of each column. Main source for the guard. |
| P3 | https://commons.wikimedia.org/wiki/File:Sword_of_Goujian,_2019-06-15_02.jpg | **Inscription, face-on**, both columns of 4. Source for character size, spacing, colour, and the worn pattern near the guard. |
| P4 | https://commons.wikimedia.org/wiki/File:Sword_of_Goujian,_2019-06-15_01.jpg | **Pommel end face**: the outturned dish and its concentric rings. Also the museum's white accession number on the rim (not to be drawn). |
| P5 | https://commons.wikimedia.org/wiki/File:Sword_of_Gou_Jian,_King_of_Yue_(9873560695).jpg | **Pattern macro**, mid-blade, side light. Source for the diamond and star structure. |
| P6 | https://commons.wikimedia.org/wiki/File:Sword_of_Gou_Jian,_King_of_Yue_(9873583704).jpg | **Point**, with the pattern running into it. |
| P7 | https://commons.wikimedia.org/wiki/File:Sword_of_Gou_Jian,_King_of_Yue_(9873558124).jpg and (9873592926) | **Guard side and inscription**, from the side. Source for the reading order, the row count and the mark spacing. |
| P8 | https://commons.wikimedia.org/wiki/File:Sword_of_Gou_Jian,_King_of_Yue_(9873668163).jpg | **Hilt from the side**: guard block, grip, pommel disc (pommel/grip ratio). |
| P9 | https://commons.wikimedia.org/wiki/File:Sword_of_Goujian,_Hubei_Provincial_Museum,_2015-04-06_01-edit.jpg, and _07/_08/_09 | The whole sword under warm spotlights. The blade reads **gold** here, which is where the "golden sword" memory comes from. |
| P10 | https://commons.wikimedia.org/wiki/File:20230208_Bronze_sword_used_by_King_Goujian_of_Yue_01.jpg and _02 | The current display (dark case, raking spot): bright gold blade, dark lattice, black hilt. |
| P11 | https://commons.wikimedia.org/wiki/File:Sword_of_Gou_Jian,_King_of_Yue_(9873693843).jpg | The museum label (T2). |
| P12 | https://commons.wikimedia.org/wiki/File:Deciphering_the_sword.jpg | Guard-down photo with each character keyed to 越 王 鸠 浅 / 自 乍 用 剑 (confirms the reading order). |

The sheath was not in any photo I found. T1 confirms only that it was **black lacquered wood**, so I didn't draw it.

## 2. What the real sword looks like

Measurements come from pixels in the photos, scaled to the published 55.6 cm overall length, 4.6 cm blade width and 5 cm guard width. Where a photo is oblique I only used ratios taken along the same direction. I estimate the error at about ±10 %.

**Overall (P1, T1):** 55.6 cm. Hilt (茎 + 首) 8.4 cm, guard about 1.6–2 cm long, blade 47.3 cm (measured from under the guard).

**Blade outline (P1, P6, P9):**
- **Widest right at the guard**, about 4.6 cm.
- From there it **tapers steadily** for the first two thirds: about 4.3 cm at mid-blade and about 3.9 cm at 2/3.
- In the front third it **narrows faster** (the 吴越 前锷收狭) with a slight concave waist about 12–15 cm from the tip, then runs into a **long ogival point**. The point curve takes the last ~6 cm, and there is no short spear-like point.
- It is NOT widest a third of the way along, and it has no wavy swell.

Half-widths used (mm from the blade base → half-width): 0→23, 130→22.4, 200→21.6, 260→20.4, 310→18.4, 340→16.9, 372→16.0, 400→14.6, 425→12.2, 443→8.8, 454→4.6, 459→0.

**Section (P1, P3, P6):** a clear central ridge (剑脊) running to the point. Each half is a flat bevel, one lit and one in shade. A **plain polished edge band (锷) about 4–5 mm wide** runs along both edges to the tip. It is a lighter brass colour with no pattern. The pattern field ends against it on a slightly ragged line.

**Diamond pattern (P5, P6, P1, P3):**
- Cells are **square diamonds** (both diagonals equal, about 12–13 mm). There are **about 3 across the patterned field** (2–3 rows of star-knots per half), about 37 along the blade, and **the same size from the guard to the point**. Near the point the field just gets narrower.
- Each cell is a **pale diamond with slightly rounded, notched tips**, inside a **thin pale frame line**, with dark between the frames. At **every knot sits a dark 8-point star**: long spikes along the blade and across it, which notch the tips of the pale diamonds, and short spikes along the bands.
- The dark is charcoal (blue-black to brown-black) against an olive-brass ground. It covers about half the area.
- **Near the guard** (the first ~13 cm, the inscription zone) the pattern is **faded and mottled**: brown patina, dark blotches, the lattice only faintly visible (P2, P3).
- The **inscription sits on top of the pattern**.

**Colour of the metal today:**
- Under neutral light (P1, P3, P5): **olive / khaki brass-grey ("黄黑色", T1)** with charcoal lines.
- Under the warm display spots (P9, P10): **gold** with dark lines.
- Edge bands: lighter pale brass.
- **Guard, grip and pommel are near-black, greenish-black bronze**. They are not gold in any photo.

**Guard (剑格) (P2, P7, P8, T1):**
- A **thick dark block** about 5 cm wide, so it sticks out about 2 mm beyond the blade on each side.
- **Blade-side edge: a ∧ that peaks on the ridge, pointing toward the TIP** (rising about 7–10 mm from corner to apex).
- **Grip-side edge: bowed**, with its corners drooping toward the pommel as two lobes.
- Its face is a **兽面 (beast-face) of broad, flat raised scrolls** on a dark recessed ground:
  - brow scrolls running out from the apex,
  - in each half, a **round "eye" cell (about 7 mm across) toward the outer corner and a comma-shaped cell next to the centre**, both near the blade side,
  - C/S scrolls and hooked jaw curls toward the grip side.
- **Front face: blue glass in the cells** (now partly lost; one cell shows brown remains). **Back face: turquoise** (T1). The inlay is small spots of blue on a black guard, not a blue panel.

**Grip (茎) (P1, P8, T1):**
- Round and hollow, **about 1.5 cm across** (about a third of the guard width), dark and smooth.
- **Two low hoops (箍)**, more like thin raised rings than bands, roughly a third and two thirds along.
- No visible silk binding (缠缑) today.

**Pommel (剑首) (P4, P8, T1):** a **thin dish turned outward** about 4.1 cm across (**about 2.7–2.9 times the grip**). Its outer face is a cup stepped down in **11 concentric rings** to a small centre. Same near-black patina as the grip.

**Inscription (P3, P2, P7, P12, T2):**
- **8 bird-script (鸟篆) characters in two columns of four**, about 7 mm either side of the ridge.
- Each character is about 10–12 mm long and 5–7 mm wide, with centres about 22 mm apart. The first starts about 3 cm in front of the guard and the four span about 10 cm.
- Each column reads **from the tip end toward the guard**. With the tip up, the right column is 越 王 鸠 浅 and the left column is 自 乍 用 剑.
- The characters read **pale / whitish (light-coloured fill)** against the dark, worn zone. They are not dark.

## 3. Our current sword (swordspec53s + flat53s / sword3d) vs the real one, ranked by harm to recognisability
1. **Hilt and guard colour.** Our grip, pommel and guard are bright polished gold. The real ones are near-black bronze. The black hilt against the blade is the strongest silhouette cue.
2. **Guard design.** Ours is a trapezoid filled with one big bright-blue panel and gold cloisons, and its blade-side V points the wrong way (notched toward the pommel). The real guard is a dark block with a ∧ toward the tip, drooping lobes on the grip side, a beast-face of flat scrolls, and small round and comma-shaped blue cells.
3. **Pattern.** Ours is long thin diamonds (20.5 × 11.8 mm, 1.7 : 1) in a pale/gold checkerboard with small dark core diamonds. The real pattern is square diamonds about 12.4 mm, all alike, each with a thin pale frame, with **dark 8-point stars at every knot**.
4. **Inscription.** Ours is 8 small dark abstract squiggles crowded into the first 7 cm. The real one is 8 **pale, larger** characters (~11 mm) about 22 mm apart over about 10 cm, starting about 3 cm from the guard, in the real reading order.
5. **Blade outline.** Ours is widest about a third of the way along, has a pronounced wavy waist and swell, and ends in a short sharp point. The real blade is widest at the guard, tapers steadily, has a subtle narrowing in the front third and a long ogival point.
6. **Blade colour.** Ours is saturated orange-gold everywhere. The real blade is olive brass-grey ("黄黑色") in neutral light and gold only under warm spots, with a darker mottled zone near the guard.
7. **Edge bands.** Ours are about 3.4 mm, bright, and partly patterned. The real bands are about 4.5 mm, plain, lighter brass, and run to the point.
8. **Hilt proportions.** Our pommel is 2.16 times the grip with a heavy flare, and the grip is 17.2 mm. The real pommel is about 2.8 times a ~15 mm grip and is a thin outturned dish. Our hoops are proud bands with a wrapped-cord texture. The real ones are low rings on a smooth grip.
9. **Inscription detail.** Ours puts the marks only 2 cm from the guard. The real ones start about 3 cm out (minor).

## 4. What was built
- `episodes/37-qiqing/remotion/src/qq53/swordspec53x.tsx` is ONE corrected geometry: outline (monotone spline through the measured half-widths), edge band, square-diamond-and-star lattice, guard outline, beast-face relief and inlay cells, hilt and pommel profile, inscription layout with 8 simplified glyph traces. On top of it sits `VARIANTS` = the looks A / B / C (colours, contrast, line and star weights, wear, rim light). It exports the same kinds of names as `swordspec53s` (A, LBLADE, hwS, edgeS, LAT, GUARD_OUT, guardEdgeA, markAt, …), so it can replace it once a look is picked. Note: `sword3d`, `land53` and `macro53` read the old `LAT.A/W` lattice and the old inlay panels, so those renderers need a port to the new lattice and guard functions.
- `swordflat53x.tsx` draws the front face (or the back face with turquoise) through any (a, w) → screen map, plus `PommelFaceX`.
- `sworddesign53x.tsx` is the `SWORDDESIGN` composition: frames 0/1/2 = options A/B/C, frame 3 = comparison with the current `props53.Sword`.
- The glyphs are my own simplified traces by eye from P3/P2. They are not a rubbing and not the CC BY-SA Commons SVG, which I chose not to copy into this public repo. They are close enough to read as the real 8 characters at film scale, but a calligraphy check against a published rubbing (望山楚墓 report or the 湖北省博物馆 catalogue) is recommended before close-up shots.
