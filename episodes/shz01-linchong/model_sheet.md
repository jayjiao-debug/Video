# 林冲 · model sheet v3 (proportions, scale, props)

Companion to `storyboard_v3.md`. Every figure, prop and set in the film is built and placed from these numbers.
Sources: facts.md L1, L6–L8, L14–L16, L29–L31; director review `reviews/gate2_storyboard_v2.md` §2 (targets adopted
here, with the two conflicts resolved in §9). Keep the manhua face (eyes, brows, nose, mouth, beard, the
隐忍/怒/悲 expressions) exactly as it is in `chars/manhua.mjs`. Change only the neck, the back of the skull, the
bodies, the hands and the props.

## 1. Units and how to measure

- **1 H = head height, skull top to chin.** In `manhua.mjs front()` this is local y 206 → 572 = **366 units**
  (the director's convention; the headscarf or hat sits above y 206 and is not counted).
- 林冲: **H = 24 cm, height 1.80 m = 7.5 H** (L1 「八尺长短身材」: the tallest in the cast).
- Face width (cheek to cheek, `front()` x 196 → 404 = 208 units) = **0.57 H = 13.7 cm**.
- Rig scale factor for a shot: `k = H_px / 366`. Example: a head of 260 px means k = 0.71.
- Measure each still with code (landmark positions from the rig), not by eye; the checker in §8 prints the ratios.

## 2. 林冲: the body in H

Landmarks, measured down from the skull top (standing, front view):

| Landmark | Down from top | Notes |
|---|---|---|
| Chin | 1.00 H | |
| Collar / sternal notch | 1.25 H | visible neck ≤ 0.3 H |
| Shoulder line (acromion) | 1.33 H | trapezius slopes from the neck base down to this line |
| Shoulder joint (pivot) | 1.45 H | 0.15 H inside the outer deltoid edge (owner row 75: the joint sits at the top of the torso, over its middle in profile) |
| Nipple line | 2.0 H | |
| Elbow (arm hanging) | 2.85 H | at the waist |
| Sash / waist | 3.05 H | |
| Wrist (arm hanging) | 3.95 H | level with the crotch |
| Crotch | 4.0 H | |
| Fingertips (arm hanging) | 4.73 H | mid-thigh |
| Knee centre | 5.45 H | |
| Ankle | 7.2 H | |
| Sole | 7.5 H | |

Widths and limb lengths:

| Part | Size | Rig units at k = 1 | Rule |
|---|---|---|---|
| Head width incl. ears | 0.68 H | 248 | as drawn now |
| Neck, narrowest (front) | 0.39 H = 0.68 face widths | 142 | v2 was 84 (0.40 fw, too thin). Director minimum 0.6 fw |
| Neck at its base | 0.51 H = 0.9 fw | 187 | flares into trapezius lines; no stroke on the bottom edge; draw the neck before the coat |
| Neck depth (profile) | ≥ 0.55 × head depth | ≥ 110 | axis tilted forward 12–18°, back line starts at the occiput |
| Skull behind the ear (profile) | 0.36 H | +75 units at the back | depth/height ≈ 0.85; widen the headscarf and caps with it; do not touch the face |
| Shoulder width (outer deltoid, in robe) | 1.95 H = 3.4 fw | 714 | 47 cm. The v2 busts were ~0.8 H wide (the bell shape) |
| Upper arm, joint to elbow | 1.40 H | 512 | |
| Forearm, elbow to wrist | 1.10 H | 403 | v2 raised forearm was 0.56 H (a stub) |
| Sleeve width at the shoulder → wrist | 0.48 H → 0.24 H | 176 → 88 | taper; one continuous sleeve, no tube-on-block |
| Open hand, wrist crease to fingertip | 0.78 H | 285 | ≈ chin-to-hairline. Palm width 0.37 H |
| Fist | 0.40 H wide × 0.42 H tall | 146 × 154 | v2 fullbody fists 0.25 H (too small); v2 S09 fist 0.57 H wide (too big) |
| Thumb width | 0.09 H | 33 | |
| Thigh at the robe hem | ≥ 0.50 H | ≥ 183 | v2 0.37 H (stilts) |
| Shin with 绑腿 | 0.38 H | 139 | |
| Foot length | 1.10 H | 403 | |

Reach and joint limits (for IK, figure-rules R2/R6):

- Shoulder joint → wrist, straight: 2.5 H (60 cm); → fist centre 2.7 H; → fingertips 3.28 H (79 cm).
- Elbow 0–150°; a punch cocked by the ear: elbow 90–110°, fist beside the ear at 0.4 H (director §2 S09), not overhead.
- Neck pitch −35° (bow, chin to chest) to +25°; head turn ±70°.
- Spine lean ≤ 16° standing with a pole (figure-rules); ≈ 45° when pushing the stone (owner row 100).

## 3. Building the bust and the full figure

- **Busts** (`front()`, `side()`): extend every body path to local y ≥ 1150 (≥ 1.6 H below the chin) so no bust
  ends inside the frame. Place busts so the body bottom is ≥ 40 px below the frame or hidden by a foreground object.
- **Full figure** (`fullbody2.mjs`): head scale k = 0.73 → **0.63** (H ≈ 231 in its 1000 × 2000 canvas) and
  re-check: skull top to sole = 7.5 H, shoulders 1.95 H, wrist at the crotch.
- Arms come out of the shoulder joint in §2 and nowhere else. Every hand is placed with two-bone IK from a contact
  point (figure-rules R5–R8; owner rows 100–101), never by typed screen coordinates.
- Shading: one cel-shadow side per shot from that shot's key light (storyboard §7); no separately tinted far limbs
  or visible segments (owner row 124).
- Same depth, same scale: two adults standing at the same depth share one H (scaled by their own H in §4). v2 S08
  had 高衙内's head 2.3× the wife's at the same depth.

## 4. The cast

| Character | Height | H | Heads tall | Shoulders | Head vs 林冲 | Look (rig options) |
|---|---|---|---|---|---|---|
| 林冲 | 1.80 m | 24.0 cm | 7.5 | 1.95 H | 1.00 | four costumes, §5 |
| 张氏 (wife) | 1.58 m (高髻 +7 cm) | 22.3 cm | 7.1 | 1.6 H | 0.93 | 褙子 pale lotus #E7C4C9, 高髻 with one gold hairpin. **Face never shown** (producer's brief): back view, hands, sleeve, hair, shadow on paper |
| 高衙内 | 1.70 m (flower cap +9 cm) | 23.6 cm | 7.2 | 1.75 H (slight) | 0.98 | `GAO` options; plum robe #7A3A5A; flower cap; wide sleeves |
| 陆谦 | 1.70 m (幞头 +9 cm) | 23.6 cm | 7.2 | 1.85 H | 0.98 | `futou` cap with short soft tails; dark violet robe #4A3E63 |
| 张教头 (father-in-law) | 1.66 m (stoops 2 cm) | 23.8 cm | 7.0 | 1.85 H | 0.99 | grey beard and crow's feet (new); brown robe #6B5240 |
| 公差 董超 / 薛霸 | 1.72 m | 24.6 cm | 7.0 | 2.0 H (stocky) | 1.03 | felt caps, belted tunics, 水火棍 |
| 高俅 | 1.72 m | — | — | — | — | silhouette only; 展脚幞头 wings 90 cm span |
| Fire silhouettes (差拨, 陆谦, 富安) | 1.65–1.72 m | — | — | — | — | faceless silhouettes; no weapons |
| 禁军 soldiers, 岳庙 crowd, messenger | 1.55–1.78 m | — | — | — | — | vary height ±4 %; never identical pegs |

- 林冲 is 1.06× 高衙内 and 陆谦. In the S10 two-shot 高衙内's eye line sits ≈ 0.4 H below 林冲's.
- Eye level of a standing adult = height − 0.47 H (林冲 1.69 m).

## 5. 林冲's four costumes (in story order)

| Look | Shots | What it is | Must not |
|---|---|---|---|
| 东京 教头 | S06–S15 | green robe #2F6B52 (shade #22513E), dark 抓角儿 headscarf #22272F with two white jade rings **behind the head**, red-brown sash, 绑腿, black boots | rings at the temples (v2) |
| Convict / farewell | S01–S04, S16–S19 | faded slate cotton robe #3B4356, plain dark head cloth, **no jade rings**, the cangue (§6) | the green robe or the rings (status gone) |
| 沧州 | S20–S26 | 毡笠 (§6), brown cloak #8D6B4F over the slate robe, spear with the gourd (L14) | hat bigger than §6 |
| 梁山 | S27–S30 | dark indigo robe #2E3446, plain head cloth, no rings | any 东京 detail |

The researcher is still adding the costume rows (director note 28d). These are design choices until those rows land.

## 6. Props and sets, real sizes

| Item | Size | Notes |
|---|---|---|
| 花枪 (spear) | 2.30 m total (1.28× his height); shaft Ø 3 cm; head 25 cm (blade 20 × 4 cm); red tassel 25 cm | butt on the ground, behind the calf, or both hands on it; never shorter than him (v2: 0.6–0.8×) |
| 酒葫芦 (gourd) | 28 cm tall (1.17 H), bulbs Ø 16 / 11 cm | hangs on a 12 cm cord near the tip when the spear is on his shoulder (L14 「花枪挑着酒葫芦」) |
| 毡笠 (felt hat) | brim Ø 40 cm (1.67 H = 2.9 face widths), crown 10 cm tall × Ø 17 cm, red chin cord | matches the rig's front 毡笠 (560/208 = 2.7 fw); brim tilts 8° forward in profile |
| Cangue 「七斤半团头铁叶护身枷」 (L30) | one board 90 × 42 × 3 cm (≈ 4.5 kg); both ends rounded (团头); iron plates 5 cm wide across both ends plus iron leaves on the edges; neck hole Ø 13 cm, centre 28 cm from the near end; 封皮 paper seal 32 × 7 cm across the join with red marks | front view: a flat board, top face in perspective plus a thin edge, 42 cm = 3.1 fw wide, bleeding off the frame bottom in close shots. Profile: long end forward, 25–35° below horizontal. v2 was 2.08 fw and read as a box |
| Tattoo (L30 「刺了面颊」) | a 4 × 3 cm block of abstract square marks on the cheek below the cheekbone | never readable characters (v2's 「田メ丰日」 are fake glyphs) |
| 休书 sheet | 36 × 40 cm, portrait; 7 vertical columns of the L8 text only (57 characters, 3.2 cm each) on the right two-thirds; 花押 (signature, ≈ 6 cm) and the **red 手模 palm print** (18.7 × 9 cm) in the left third | L31: a hired scribe wrote it; he signs and presses the handprint. Drop the 「恐后无凭…年月日」 tail (not in L8). Simplified characters unless the owner asks for traditional |
| Brush / inkstone / paste dish | 23 cm / 20 × 13 cm / Ø 8 cm | keep v2's S01 prop scale |
| Tavern table | 78 cm high, top 100 × 60 cm | top at his lower ribs when he sits (v2 S12 had it at the sternum) |
| Tea bowls (建盏, black glaze) | Ø 12 × 6.5 cm | S08 |
| Wine cups (酒盏 on a foot) | Ø 8 × 5 cm | S13 |
| 注子 (ewer) | 24 cm (≈ 1 H), handle and spout | always held by the handle (R8) |
| Doors | house 2.0 × 0.9 m; tavern doorway 2.1 × 1.6 m; temple double door 1.9 × 1.4 m; city gate arch 6 × 5 m (tower 16 m) | |
| 山神庙 (temple) | 4.5 m wide × 3.5 m deep, ridge 3.8 m; altar 0.9 m high; seated statue 1.4 m (dim, no face detail) | the stone sits **inside**, against the closed door (L14, L16) |
| Stone | 50 × 40 × 35 cm (knee high) | pushed with both hands at its widest point (owner rows 100–101) |
| 草料场 (fodder depot) | 草厅 two bays 7 × 4.5 m, eaves 2.4 m, ridge 4.0 m; fodder stacks Ø 4 × 3 m; fence 1.5 m | |
| 岳庙 courtyard | 鼎 1.2 m tall × 1.0 m wide; hall columns Ø 0.4 × 4 m; step risers 15 cm; courtyard 30 m deep | the 鼎 reads as a bronze tripod, not a bucket |
| 白虎节堂 plaque | 2.4 × 0.9 m, hung at 4.5 m; four characters 60 cm each | ≥ 90 px per character on screen |
| Boats | small 6.0 × 1.3 m, gunwale 0.45 m, pole 4 m; 高俅's 12 × 3 m with a 2.2 m cabin and lanterns | |
| Reeds (梁山泊) | 2.2–3.0 m, plume 30 cm | taller than a standing man |
| 六和寺 room | bed 1.9 × 0.9 × 0.45 m; window 1.0 × 1.2 m, sill 0.9 m; wall peg 1.65 m | the spear leans **on** the door frame; the hat rests on the bed foot |
| 水火棍 (guard staff) | 1.65 m × Ø 3.5 cm, half red #8F2520 / half black | |

## 7. Pixel scale table at 1920 × 1080

Four standard scales. Use the nearest one per shot and state it in the build notes. CU here means face ≈ 50 % of frame
height (director S03: 45–55 %).

| Scale | Definition | px per cm | rig k |
|---|---|---|---|
| WS | 林冲 1.80 m = 300 px | 1.667 | 0.109 |
| FS (full body) | 林冲 1.80 m = 680 px (feet at y ≈ 800, above the subtitle band) | 3.778 | 0.248 |
| MS (medium) | H = 260 px | 10.83 | 0.710 |
| CU (close-up) | H = 540 px | 22.50 | 1.475 |

| Item | Real | WS px | FS px | MS px | CU px |
|---|---|---|---|---|---|
| 林冲 height | 180 cm | 300 | 680 | 1950 | 4050 |
| Head H | 24 cm | 40 | 91 | 260 | 540 |
| Face width (0.57 H) | 13.7 cm | 23 | 52 | 148 | 308 |
| Neck, narrowest (0.39 H) | 9.4 cm | 16 | 35 | 101 | 211 |
| Neck at base (0.51 H) | 12.2 cm | 20 | 46 | 133 | 275 |
| Chin → collar (0.25 H) | 6 cm | 10 | 23 | 65 | 135 |
| Shoulder width (1.95 H) | 46.8 cm | 78 | 177 | 507 | 1053 |
| Upper arm (1.40 H) | 33.6 cm | 56 | 127 | 364 | 756 |
| Forearm (1.10 H) | 26.4 cm | 44 | 100 | 286 | 594 |
| Open hand (0.78 H) | 18.7 cm | 31 | 71 | 203 | 421 |
| Fist W × H | 9.6 × 10.1 cm | 16 × 17 | 36 × 38 | 104 × 109 | 216 × 227 |
| Thigh at hem (0.5 H) | 12 cm | 20 | 45 | 130 | 270 |
| Foot (1.1 H) | 26.4 cm | 44 | 100 | 286 | 594 |
| 张氏 height / head | 158 / 22.3 cm | 263 / 37 | 597 / 84 | — / 242 | — / 502 |
| 高衙内, 陆谦 height | 170 cm | 283 | 642 | 1842 | — |
| 张教头 height | 166 cm | 277 | 627 | 1798 | — |
| 公差 height | 172 cm | 287 | 650 | 1863 | — |
| 花枪 | 230 cm | 383 | 869 | 2492 | — |
| Spear shaft Ø | 3 cm | 5 | 11 | 32 | 68 |
| 葫芦 | 28 cm | 47 | 106 | 303 | 630 |
| 毡笠 brim | 40 cm | 67 | 151 | 433 | 900 |
| Cangue L × W | 90 × 42 cm | 150 × 70 | 340 × 159 | 975 × 455 | 2025 × 945 |
| House door | 200 cm | 333 | 756 | 2167 | — |
| Temple door | 190 cm | 317 | 718 | 2058 | — |
| Table height | 78 cm | 130 | 295 | 845 | — |
| Tea bowl Ø / wine cup Ø | 12 / 8 cm | 20 / 13 | 45 / 30 | 130 / 87 | 270 / 180 |
| 注子 | 24 cm | 40 | 91 | 260 | 540 |
| Stone | 50 cm | 83 | 189 | 542 | 1125 |
| Reeds | 260 cm | 433 | 982 | — | — |
| 水火棍 | 165 cm | 275 | 623 | 1788 | — |
| 休书 sheet height | 40 cm | 67 | 151 | 433 | 900 |
| 手模 palm print | 18.7 cm | 31 | 71 | 203 | 421 |
| Bed length | 190 cm | 317 | 718 | 2058 | — |

Off-standard shots (S01 paper insert, S24 eyes, S26 tiny figure) give their own px/cm in the storyboard.

## 8. Placing figures in depth (perspective rule)

For a camera at height c metres with the horizon at screen y_h, a person of height P standing with feet at screen
y_f has screen height

    h_px = (y_f − y_h) × P / c

Everything at one depth shares one px-per-metre. Worked example (S04: c = 1.5 m, y_h = 430, focal ≈ 1300 px):
林冲 at 7.8 m with feet at y 680 → 300 px; a guard beside him → 287 px; the wife 1.6 m from the lens → head top
y 324, head 179 px, shoulders 292 px wide, body off the frame bottom.

Checker additions (on top of render6.mjs, director note 6). A still goes to the owner only on PASS:

1. Each figure's height vs `h_px` from its ground line: within ±4 %.
2. Same-depth head sizes in the ratios of §4.
3. Prop ratios: spear ≥ 1.2× its carrier; hat brim 2.7–3.0 face widths; cangue ≥ 3 face widths; gourd 1.0–1.3 H.
4. Neck continuity: sample 5 points down the neck to the collar; none may hit the background.
5. Bust bottom ≥ frame + 40 px, or covered.
6. Held props: handle ≤ 4 px from a hand, every frame (R8); hands within reach (R6).
7. Layers marked to bleed must reach their edge at every camera position (overscan, storyboard §3).
8. Camera speed: the fastest visible point of every layer ≤ 25 px/frame.
9. No text over text; no subtitle over a face.

## 9. Conflicts resolved

- **Shoulder width.** The director's target of 3.3–3.5 face widths and real anatomy (bideltoid ≈ 2 H) agree once H
  is measured the director's way (y 206 → 572): 1.95 H = 3.4 fw.
- **Hat size.** The director gives two targets: brim 2.7× face width (≈ 37 cm, from the rig) and 0.27–0.29× the bed
  (≈ 53 cm). They cannot both hold. I used the rig: 40 cm (2.9 fw, 0.21× the bed), so the 毡笠 matches every close-up
  already drawn. If the owner wants the bigger, more iconic brim, 50 cm still fits every shot.
- **Cast heights.** The director suggests ≈ 7 H for 高衙内/陆谦, 0.9× height for the wife and a 0.3 H eye-line gap.
  With 林冲 at 1.80 m and the others at 1.06× smaller, the gap is 0.4 H; the wife at 1.58 m is 0.88×. Both are
  within a few percent of the targets.
