# 林冲 · storyboard v3 (16:9, layered 2.5D, shot by shot)

《水浒人物志 · 壹 · 林冲》 · 1920 × 1080 · 30 fps · 148.5 s · narrator only (你) · 2D vector 国风漫画.

Inputs: script v3 (lines.json as of 2026-11-08 11:46: V01 「亲手签下」, V24 「一两块骨头」), facts.md L1–L31,
director review `reviews/gate2_storyboard_v2.md`, owner notes. Proportions and prop sizes: `model_sheet.md`.
Music grid: measured from `/dev/shm/shz01/music/bgm.mp3` → `/dev/shm/shz01/music/beats.json`.
Rough composition thumbnails: `/dev/shm/shz01/ad/` (S04, S09–S12 camera path, S22–S24, S26).

**Engine:** Remotion. Characters and sets are SVG layers (manhua rig, after the model-sheet fixes). Particles
(snow, fire, embers, steam, smoke, dust, ink motes) are Canvas 2D layers. A 2.5D camera moves every layer by its
parallax depth (§3). No three.js.

## 0. What v3 changes (against the owner's three notes on v2)

| Owner note on v2 | v3 answer |
|---|---|
| Proportions inaccurate | One model sheet with numbers: 林冲 7.5 H, shoulders 1.95 H, neck ≥ 0.6 face widths, fist 0.40 × 0.42 H, spear 1.28× his height, cast scales, a perspective rule and a pixel table. Checker additions so a wrong still can't go out (model_sheet §7–8) |
| Visuals don't emphasise the scenes | Every shot names one thing to read in 1 s, puts it on a third or in the light, and gives it a motivated key light. No two consecutive shots share a size and angle (except S19 → S20, which match on purpose); no run of frontal busts. The actions the lines name are now shown: signing and the 手模, 扳过, the fist going soft, the stone pushed from inside, the door, the boat, the seasons |
| Too many hard cuts | 20 hard cuts → **2 hard cuts + 3 match cuts**. Everything else is a continuous camera move inside 13 takes, or a motivated dissolve. No hand-over type is used twice, except the window rhyme, which repeats on purpose |

Fact corrections applied: the farewell is in **summer** (L29), so the first snow is at 66.96 in the 沧州 section.
The cangue is the 团头铁叶 board with a 封皮 (L30). The tattoo is abstract marks. A scribe wrote the 休书; he signs
it and presses a **red palm print** (L31). The stone is pushed **inside** against the closed door, and there is no fire
before V23 (L14–L16).

## 1. Look

- **World:** a Song-dynasty manhua told on rice paper: cel-shaded characters (brown line #2A1C17), ink-wash (水墨)
  far layers with fog bands, a static rice-paper fibre overlay (multiply 6 %, not animated grain).
- **Motifs** (each comes back): the **休书** (S01–S03 → S19 → S32–S33); the **hand** (the 手模 palm print ↔ the
  cocked fist ↔ the father's hand ↔ the hand on the stone and the door); **ink** (bleed, tattoo, calligraphy, the
  drip that becomes a tear); **windows** (home S07 ↔ 梁山 S30 ↔ 六和寺 S31); **doors** (tavern doorway S04 ↔ temple
  door S21–S25); **snow** (from the promise onward); **red** (handprint, seal, lantern, fire, J seal).
- **Base palette:** paper #F1E4C6, ink #17120E, seal red #B3302A, line #2A1C17. Section palettes are in §7.
- **Type:** subtitles follow the engine standard: Noto Sans CJK SC Bold 64 px, white with a soft dark edge and a
  feathered shade, gold key words (休书, 林冲, 忍, 依旧夫妻完聚), trailing 。？， pulled back ½ em. Serif is an owner
  option, see §11. Brush calligraphy (林冲, 白虎节堂, 已故半载, 依旧夫妻完聚, the L8 text) is converted to SVG paths at
  build time, so render machines don't need a brush font.
- **Light:** one motivated key per shot, landing on the thing to read. Night is never black: every shot's mean luma is
  ≥ 70/255, except S24 (25–30, the one deliberate dark shot).
- **Must NOT look like:** flat clip-art (box houses, peg crowds, pyramid mountains, capsule people); a line-up of
  frontal ID-photo busts; a slideshow (pop in and hold); AI anime stills; black screens; Western or wrong-era props
  (glass panes, envelopes); gore of any kind; a copy of any existing artwork, including the stock illustration the
  owner shared.
- **Care:** the killing is never shown (door → whiteout). The wife's death is said once and not depicted. **The
  wife's face is never shown**: back view, hands, sleeve, 高髻 and hairpin, shadow on paper.

## 2. Music map (measured; one beat ≈ 0.418 s, one bar ≈ 1.66 s; bar n starts at beat 4n)

| Section | Bars | Time | Story |
|---|---|---|---|
| A intro (flute theme) | 0–15 | 0.337–26.970 | the 休书, the farewell, the title. **Silence 1:** the music cuts at 25.45 and is silent 26.2–26.9 |
| B main theme, part 1 | 16–31 | 26.970–53.626 | who he was; 岳庙 |
| B main theme, part 2 (brighter) | 32–39 | 53.626–66.955 | 陆谦, 白虎节堂, 刺配, the road, the promise |
| A′ flute theme returns | 40–55 | 66.955–93.565 | 沧州, snow, temple, fire, the voice. **Silence 2:** cut at 92.05, silent 92.8–93.45 |
| B′ part 1 | 56–71 | 93.565–120.210 | door → 雪夜上梁山 → 梁山泊 → 已故半载 → tear |
| B′ part 2 (brighter, loudest) | 72–79 | 120.210–133.538 | 高俅, 六和寺, the 休书 gathers |
| Coda | 80–87 | 133.538–146.95 (tail to 148.4) | the promise, the release, the question, end card |

Phrase starts (every 4 bars): 0.337, 7.012, 13.665, 20.329, 26.970, 33.646, 40.310, 46.974, 53.626, 60.291,
66.955, 73.596, 80.260, 86.912, 93.565, 100.241, 106.893, 113.557, 120.210, 126.874, 133.538, 140.190.

Measured vs the brief: the turn is the bar-11 downbeat at **18.657** (18.3 is only the bar-10 pickup at 18.24). The
main theme lands at **26.970** (not 27.1), the second theme at **66.955**, the build at **85.240**, the drop at
**93.565** and the outro at **141.862**. The tempo drifts ±0.2 s against a straight grid, so use beats.json, not
27.1 + n·1.671.

**Hits** (the picture lands exactly here): 0.337 brush flick · 2.833 手模 press · 18.657 HARD CUT, title · 22.814
seal · 26.970 spear (match cut) · 45.712 the face · 49.457 the fist gives · 53.626 shadow on 陆谦 · 60.291 cangue
clamps · 66.955 first snow · 76.077 hut collapses · 79.830 fire through the crack · 93.565 HARD CUT, the door ·
115.217 ink → tear (match cut) · 120.210 lanterns · 133.538 the promise is brushed · 136.03 release · 141.862 J seal.

**Line retimes proposed** (same words, same order; the editor re-sets times from the voice clips anyway):
V01 subtitle on frame 0 (owner row 22). V07 starts on 31.56 as a J-cut. V27 92.6 → **92.15**, fully inside silence 2
and ending ≥ 0.1 s before 93.50. V33 113.6 → **115.22**, V34 115.4 → **116.88**, V35 119.2 → **120.21**: this gives
「已故半载」 its 2 s of music alone (script) and puts V35 on the bar-72 lift. V37 129.6 → **129.37**, V38 138.8 →
**138.53**.

## 3. Camera, layers and parallax (applies to every shot)

- Layer = {id, z, **d** (parallax depth), bleed}. d: 0 sky (fixed) · 0.1–0.2 far · 0.35–0.6 mid · **1.0 subject
  plane** · 1.2–1.6 foreground. Snow always comes in 3 bands: d 0.5 (small, sharp), 1.0, 1.6 (large, blurred
  10 px).
- Camera {x, y, zoom, focusD, blurK}. Per layer: translate(−x·d, −y·d), then scale about the frame centre by
  s = 1 + (zoom − 1)·d. Depth blur = blurK × |d − focusD| px (blurK 0 = deep focus, 8 = normal, 12–14 = shallow).
  A rack focus animates focusD over 10–14 frames, easeInOut. Pre-render static layers at their blur.
- Zooms larger than 1.5× use constant-ratio (exponential) interpolation with 8-frame eased ends.
- **Speed limits:** the fastest visible point of any layer moves ≤ 25 px/frame; the subject plane ≤ 16 px/frame.
  Emotional pushes ≤ 3 %/s of zoom (S24 ≤ 7 %/s). No whip pans. The S10 spin smear is character animation, not
  camera. The checker measures this per frame (model_sheet §8).
- **Overscan:** every layer covers the frame plus |Δcam|·d plus its zoom growth plus 64 px on each side, or carries a
  bleed flag for the edge it crosses.
- **Easing:** easeInOutCubic for moves; easeOutCubic after hits; slow → fast into hits (wind-up); 8-frame eases on
  constant tracks.
- **Shake:** only on the element that hits (handprint, seal, spear, cangue, doors, J seal), 2–4 frames, ≤ 4 px.
  Never the whole frame (owner row 54).
- **Safe zones:** subtitles y 820–960; no face in that band. Top-left 420 × 200 kept clear and calm (Douyin
  watermark). Corner mark top-right (engine). In-picture titles and calligraphy stay in y 100–780.
- Outgoing subtitles and labels clear before each move starts (owner row 86).

## 4. Shot overview (33 shots in 13 takes, plus the end card)

Frames are at 30 fps. "Take" = one continuous camera; a new take starts only at a hard cut, a match cut or a
motivated dissolve or wipe.

| Shot | In–out (s) | Frames | Take | Lines | Size · angle | Must read in 1 s | Out → |
|---|---|---|---|---|---|---|---|
| S01 | 0.000–5.341 | 0–160 | 1 | V01 | CU insert, 50° above table | his hand signs, then the red 手模 beside 「休书」 | paper lift |
| S02 | 5.341–9.913 | 160–297 | 1 | V02 | MCU over her shoulder | her tear lands on 「休」 and bleeds | focus pull through the lowering paper |
| S03 | 9.913–14.498 | 297–435 | 1 | V03 | CU 3/4, 5° low, right third | prisoner holding back tears, cangue | dolly-out |
| S04 | 14.498–18.657 | 435–560 | 1 | V04 | WS over her shoulder, eye level | he is led away and looks back; she holds the door | **HARD CUT 1** |
| S05 | 18.657–26.970 | 560–809 | 2 | V05 | graphic title on paper | 「林冲」 brushed; seal; the emblem lowers its spear | **MATCH CUT 1** (spear line, tear) |
| S06 | 26.970–31.974 | 809–959 | 3 | V06 | FS, knee-height low angle | the thrust; he leads the ranks | flag → lantern dissolve |
| S07 | 31.974–35.306 | 959–1059 | 4 | V07 | MWS exterior dusk, frontal | two shadows on the warm window | push through the paper |
| S08 | 35.306–38.638 | 1059–1159 | 4 | V08 | CU insert, table level | two tea bowls, two steams twine | steam → incense dissolve |
| S09 | 38.638–42.390 | 1159–1272 | 5 | V09 | crane down to high-angle WS | 高衙内 blocks her; the crowd watches | continuous |
| S10 | 42.390–45.712 | 1272–1371 | 5 | V10 | MS two-shot, profiles, 8° low | the spin; the fist cocked by his ear | continuous |
| S11 | 45.712–50.710 | 1371–1521 | 5 | V11, V12 | MCU over the fist → ECU fist | the smug face; then the fist gives way | tilt down with the hand |
| S12 | 50.710–52.370 | 1521–1571 | 5 | V13 | tight CU profile | the clenched jaw (忍 1) | pillar wipe |
| S13 | 52.370–55.700 | 1571–1671 | 6 | V14 | OTS MCU on 陆谦 | the friend's smile, half swallowed by shadow | push into the wine |
| S14 | 55.700–57.380 | 1671–1721 | 7 | V15 | ECU frontal, eyes shut | shut eyes, a vein at the temple (忍 2) | eyelid wipe |
| S15 | 57.380–58.619 | 1721–1759 | 7 | V16a | extreme high-angle WS | 「白虎节堂」 over a man with a blade | **MATCH CUT 2** (accusing sweep → stroke) |
| S16 | 58.619–60.291 | 1759–1809 | 8 | V16b | ECU cheek profile | ink marks bloom in the skin | cangue clamps in a pull-back |
| S17 | 60.291–62.370 | 1809–1871 | 8 | V17 | high-angle MS, 35° down | bowed head in the cangue (忍 3) | world slide |
| S18 | 62.370–65.283 | 1871–1958 | 8 | V18 | WS side track | his look back to the city | eye-line pan into memory |
| S19 | 65.283–68.592 | 1958–2058 | 8 | V19 | OTS MS, tinted memory | the father's hand on his shoulder; first snow | position-match dissolve |
| S20 | 68.592–74.424 | 2058–2233 | 9 | V20, V21 | OTS → crane to EWS | the depot in first snow → a tiny man in vast snow | continuous |
| S21 | 74.424–77.748 | 2233–2332 | 9 | V22a | crane down to MWS | the roof caves in; he goes to the temple | door-leaf wipe |
| S22 | 77.748–79.830 | 2332–2395 | 10 | V22b | MS side, low | he pushes the stone against the door from inside | continuous |
| S23 | 79.830–86.912 | 2395–2607 | 10 | V23, V24 | MS → CU → POV through the crack | fire light through the crack; three silhouettes | pull back out of the crack |
| S24 | 86.912–93.565 | 2607–2807 | 10 | V25–V27 | CU → ECU, letterbox | his eyes in one slit of fire light; dead still | **HARD CUT 2** |
| S25 | 93.565–95.237 | 2807–2857 | 11 | V28 | low-angle MS at the door | the doors burst open → whiteout | whiteout resolve |
| S26 | 95.237–100.241 | 2857–3007 | 11 | V29 | EWS truck → crane up | a lone figure in an immense snow night | time-lapse melt |
| S27 | 100.241–105.221 | 3007–3157 | 11 | V30 | WS locked, time-lapse | the seasons turn; he stays | drift |
| S28 | 105.221–115.217 | 3157–3457 | 11 | V31, V32 | OTS deep focus → rack to him | the boat; his shoulders; 「已故半载」 | **MATCH CUT 3** (ink drip → tear) |
| S29 | 115.217–116.878 | 3457–3506 | 12 | V33 | CU 3/4, face 60 % | one tear | rack to the window |
| S30 | 116.878–124.783 | 3506–3743 | 12 | V34, V35 | MS on the window, his profile soft | the empty window; then the banquet's shadows | window-frame dissolve |
| S31 | 124.783–128.534 | 3743–3856 | 13 | V36 | WS interior, slow dolly | the hat and spear left in the light | light bloom |
| S32 | 128.534–136.870 | 3856–4106 | 13 | V37 | graphic, overhead (= S01) | everything gathers into the 休书; the promise; the release | continuous |
| S33 | 136.870–141.862 | 4106–4256 | 13 | V38 | two-element CU | the open palm print vs the clenched fist | handprint → J seal |
| END | 141.862–148.500 | 4256–4455 | 13 | — | Juno end card | J seal, title, question, follow pill, 下回, sources | — |

Sizes over the film (some shots move between two): inserts and graphics 4 · ECU 4 · CU 5 · MCU/OTS 5 · MS 6 ·
WS/FS 9 · EWS 2. Angles: overhead, high, eye level, low, profile, POV.

## 5. Shots

Notation: d = parallax depth; "beat" times come from beats.json. Expressions use the rig (平静 / 隐忍 / 怒 / 悲)
plus the new ones defined in §9.

---

### TAKE 1 · 0.000–18.657 · one continuous move from the paper to the street (summer, a tavern by the city gate)

#### S01 · 0.000–5.341 (f 0–160) · bars 0–2 · V01 「如果有一天，你要亲手签下一封休书，给你最爱的人。」
- **Size / angle:** CU insert, camera 50° above the table. The portrait sheet (36 × 40 cm) is ≈ 70 % of the frame
  height (18.9 px/cm), so his open hand is ≈ 353 px.
- **Read / emotion:** his own hand ends the marriage: the signature, then the red palm print beside 「休书」. Dread,
  finality.
- **Composition:** sheet at x 760–1440, tilted −4°. 「休书」 (column 6) sits in the brightest pool at the upper-right
  third (≈ 1280, 360). The 花押 and the handprint are in the sheet's left third (x 820–1000, y 420–780). The table
  to the left stays dark and empty (watermark zone). No paper text in y 820–960.
- **Light / colour:** hard summer daylight through the tavern's lattice window, from the top left: a warm white shaft
  #FFF4DC with lattice shadow bars. Room in warm shadow #2A1E17. Luma ≈ 95.
- **Layers:** table d 0.3 · sheet d 1.0 · brush and hand d 1.15 · inkstone and paste dish d 1.05 · the cangue's
  edge and shadow across the frame top d 1.5 (blurred) · dust in the shaft d 1.2.
- **Camera:** push 1.00 → 1.10 over 0–4.5 s (easeInOutSine), drifting toward the handprint (≈ 2 px/frame). From 4.50
  the camera starts to rise with the paper.
- **Performance:** frame 0: his hand (slate convict sleeve, scarred knuckles) is mid-flourish on the 花押, moving
  (owner row 47). **0.337** (frame 10): the brush flicks off with 3 ink spatter dots. 0.76–2.0: he lays the brush on
  the inkstone and presses his palm into the red paste dish. 2.43: the red palm hovers and trembles (wind-up).
  **2.833** (bar 1 beat 3): he presses (3-frame squash, the paper dents; 2-frame ±3 px shake on the paper and hand
  only). He holds 2 beats. 3.68: he lifts, revealing the glistening red print. **4.505** (bar 2 beat 3): her fingertips
  enter at the top left and take the sheet's edge, thumbs in front.
- **FX:** ink spatter 0.337; wet paste sheen; the print's edges soak 2 px into the fibres over 10 frames after the lift.
- **Text:** V01 subtitle from frame 0. The prop text is L8 only (57 characters, simplified), no 「恐后无凭…」 tail.
- **In:** film start, moving on frame 0. **Out (T1, 5.341, bar 3):** paper lift. Her hands lift the same sheet. Over
  12 frames the sheet goes from foreshortened to frontal and the table slides down out of frame: the camera has
  risen to eye level on her side.
- **Sound:** brush flick 0.337, a soft palm press 2.833, paper rustle 4.5–5.3.

#### S02 · 5.341–9.913 (f 160–297) · bars 3–5 · V02 「她哭着问你：我清清白白，你为什么不要我？」
- **Size / angle:** MCU over her shoulder, eye level. Her 高髻, hairpin and shoulder are soft in the top-left
  foreground (d 1.5, blur 14). Never her face.
- **Read / emotion:** the tear lands on 「休」. Her disbelief; his guilt, off screen.
- **Composition:** sheet centred, x 620–1300, y 120–800. 「休」 at ≈ (1110, 330). Her hands at the lower corners, each
  ≈ 315 px (0.42 × the sheet height; model sheet), thumbs in front, fingers behind. Behind the sheet he is soft
  (d 0.7): slate robe, cangue.
- **Light:** the window now back-lights the paper (the columns faintly show through, warm edges); her hands are lit
  warm.
- **Camera:** push 1.00 → 1.06 toward 「休」 (easeInOut).
- **Performance:** 5.76–7.0 her grip trembles (paper jitter 1–2 px, 6 Hz). **7.838** (bar 4 beat 3): one tear falls
  from above the frame (0.25 s, motion blur) and lands on 「休」. **8.673** (bar 5): her fingers tighten; 6 crumple
  lines radiate from the grips (drawn on over 8 frames). 9.08–9.70: she lowers the sheet (scaleY 1 → 0.6) and he
  appears behind it.
- **FX:** ink bloom on 「休」: radius 0 → 85 px over 36 frames, easeOutCubic, noise-edged feathering; the character
  blurs but stays half legible.
- **Out (T2, 9.913, bar 5 beat 4):** focus pull through the lowering paper edge. focusD 1.0 → 0.7 over 12 frames
  (9.50–9.91); the paper becomes a soft foreground; her eye-line leads us to him.
- **Sound:** a tiny drop tick 7.838; crumple 8.673.

#### S03 · 9.913–14.498 (f 297–435) · bars 5–8 · V03 「你说不出口——你是怕自己回不来，误了她一辈子。」
- **Size / angle:** CU (H = 540 px), 3/4 (front head, eyes off-axis toward her), 5° low, face on the right third
  (eyes y ≈ 400, face centre x ≈ 1240).
- **Read / emotion:** a prisoner holding back tears: the welling eye and the clenched jaw. Love strangled into silence.
- **Composition:** the cangue board (42 cm = 945 px wide) crosses the frame bottom and bleeds off it, with its 封皮
  strip visible. This also hides the bust's lower edge. Her shoulder and 高髻 are soft at the left edge (d 1.5). Behind
  him the bright doorway is a soft hot rectangle (rim light).
- **Light:** warm daylight key from camera-left (her side). His far cheek is in cel shadow #C98A6C. Rim #FFF4DC from the
  doorway. Luma ≈ 95.
- **Layers:** tavern back wall and doorway d 0.4 · him d 1.0 · cangue d 1.05 · her d 1.5 · dust d 1.2.
- **Camera:** push 1.00 → 1.05 (≤ 3 %/s), drifting 40 px right so the face stays on the third as he looks down.
- **Performance:** 隐忍 plus red-rimmed lower lids and wet eyes (§9). **9.913:** his lips part (open 0.1) as if to
  speak; 10.33 they press shut. **11.162:** his eyes drop to the paper. 12.41: jaw lines appear. **12.828** (bar 7
  beat 3): the tear spills from the inner lid and rolls to the jaw by 13.66 (25 frames, slight acceleration).
  **13.665** (bar 8): a guard's rough hand enters frame right and rests on his shoulder: time to go.
- **Out (T3, 14.498):** dolly-out. He rises and the camera pulls back through the tavern while he turns and walks to the
  doorway between the guards; the close-up becomes the walking figure. She rises and moves into the doorway in the
  foreground.
- **Sound:** a bench scrape at 14.5 (soft).

#### S04 · 14.498–18.657 (f 435–560) · bars 8–10 · V04 「可这一别，就是一辈子。」 · thumb `thumb_S04_doorway.png`
- **Size / angle:** WS over her shoulder, eye level (camera 1.5 m, horizon y 430, focal ≈ 1300 px). She is in the
  foreground left, 1.6 m from the lens: back view, hand on the door post, head top y 324, head 179 px, body off the
  frame bottom. He is 7.8 m out in the street, **300 px = 28 % of the frame height** (director: 25–30 %), between two
  guards (287 px) with 水火棍 (275 px).
- **Read / emotion:** the distance: he is taken; she is left holding the door frame. The separation that will be
  forever.
- **Composition:** her on the left third, him on the right third (feet y 680), vanishing point (1150, 430). Door posts at
  x 250–310 and 1650–1710 frame the street. A real 东京 street: tiled eaves, lattice shopfronts, a red 酒旆 at x 1460,
  willows.
- **Light / colour:** summer noon (L29 「六月天气，炎暑正热」): white-hot sky #FAF6EC, road #E9DBBB, tavern interior
  warm dark. Warm rim on her back. Heat shimmer on the road (2 px, 0.5 Hz). **No snow.**
- **Layers:** sky d 0 · far street and eaves d 0.3 · near shopfronts d 0.6 · the three men d 0.8 · door posts d 1.3 ·
  her d 1.5.
- **Camera:** continues the pull-back from S03, 1.12 → 1.00 (easeOutCubic), peak 9 px/frame.
- **Performance:** a slow trudge, one step every 2 beats (14.92, 15.74, 16.58, 17.41, 18.24). **16.161** (bar 9 beat
  3): she slides down the door post to kneel (0.84 s, slow then settle). **16.997** (bar 10): he turns his head to look
  back (60°, held 0.8 s); 17.82 a guard's staff nudges him and he faces forward. By 18.24 he is ≈ 25 % of the frame
  height.
- **FX:** heat shimmer; small dust puffs at the steps.
- **Out: HARD CUT 1 at 18.657** (bar 11 downbeat): the music turns and the narration turns (「这个人」).
- **Sound:** cicadas, very low; they stop dead on the cut.

---

### TAKE 2 · 18.657–26.970

#### S05 · TITLE · 18.657–26.970 (f 560–809) · bars 11–15 · V05 「这个人，叫林冲。」 (voice 19.5)
- **Size:** graphic, full frame. The 休书 paper texture (#F1E4C6) is the ground. The upper half is a faint ink-wash snow
  sky: the emblem's world, a non-diegetic flash-forward, not the farewell.
- **Read / emotion:** his name, brushed in ink on the music's turn: the man you have just been.
- **Composition:** 「林冲」 brushed horizontally centre-left (x 520–1260, y 260–640, ≈ 360 px characters). 「豹子头」
  64 px beneath, right-aligned. The red square seal 「水浒人物志 · 壹」 (150 px, text inside on two lines) at the
  name's lower right (≈ 1290, 560). The emblem stands at the right third: 林冲 in 毡笠, spear on the shoulder, gourd at
  the tip, cloak blown. Near-black ink #15110E, 520 px tall, on an ink-wash ridge at y 760, x ≈ 1500. It is rebuilt
  on the manhua `side()` head, not the old silhouette rig.
- **Light / colour:** paper #F1E4C6, ink #17120E, seal #B3302A, ink-wash sky #9AA3AD → #C9CED3, drifting paper-white
  flecks #FBF7EE. Luma ≈ 165.
- **Layers:** ink-wash sky and ridge d 0.2 · emblem d 0.5 · flecks d 0.6 / 1.2 · title ink and seal d 1.0 · paper
  fibre overlay (screen-fixed, multiply 10 %).
- **Camera:** opens at 1.00; push 1.00 → 1.06 from 23.65 to 25.45; stops (8-frame ease) when the music cuts.
- **Beats:** **18.657** 林 begins (strokes on 18.657, 18.866, 19.075, 19.284; the second 木 on 19.493–19.70).
  **19.911 and 20.120:** two clear tear drops fall from the top and land as the two dots of 冫 (冫 is the ice
  radical: tears that will freeze); they turn to ink on impact. **20.329** (bar 12): the long vertical of 中 slashes
  down and the name is complete as the voice says 冲. **21.153:** 豹子头 fades up (12 frames). **22.814** (bar 13
  beat 3): the seal stamps (scale 1.25 → 1.0 in 4 frames, 3-frame jolt on the seal only, red spreads 2 px).
  24.486 and 24.892 (fill accents): wind gusts, the flecks race. **25.45: picture pause.** The flecks slow to 10 % and
  hang; the cloak freezes. **26.15–26.90:** in the silence the emblem slowly lowers the spear from the shoulder to
  horizontal, pointing left at y 520 (slow → fast wind-up, the gourd swings). 26.75: the paper bulges at the tip,
  (760, 520).
- **Out: MATCH CUT 1 at 26.970** (bar 16, the hardest hit after silence 1). The tip punches through the paper; the
  tear opens along the spear line in 6 frames and S06 is already behind it, with the real spear's tip at the same
  point (760, 520) and the same direction.
- **Sound:** soft brush whisks on the strokes; seal thump 22.814; nothing in the silence except a faint paper creak at
  26.75; paper rip merged with the hit.

---

### TAKE 3 · 26.970–31.974

#### S06 · 26.970–31.974 (f 809–959) · bars 16–18 · V06 「你本来什么都有：八十万禁军教头，一身本事。」
- **Size / angle:** FS (680 px standing, ≈ 560 px in the lunge), camera at knee height (0.5 m), tilted up 8°;
  horizon y ≈ 610.
- **Read / emotion:** a master at his peak: the thrust, the tassel flaring, the ranks copying him. Pride, power,
  everything he had.
- **Composition:** him at the right third (feet y ≈ 800) in a 弓步 lunge, spear horizontal along y 520 (869 px: butt
  x ≈ 1350, tip x ≈ 480 at full extension). Two ranks of soldiers behind (d 0.6, 20 men, varied heights) mirror the
  move. Vermilion wall, red banners, spring haze sky. A blurred weapon rack at the left edge. 东京 costume: green
  robe, headscarf with the jade rings behind the head.
- **Light:** sun high from the right (#FFE7B0), shadows cast to the left on the sand, his left side in cel shadow
  #22513E. Luma ≈ 140.
- **Layers:** sky d 0 · roofs and wall d 0.2 · banners d 0.35 · ranks d 0.6 · sand (gradient) d 0.6–1.2 · 林冲 d 1.0
  · weapon rack d 1.4 · dust d 1.0–1.3.
- **Camera:** opens at 1.25 on the tip (continuity with the tear) and eases out to 1.00 by 28.24 (easeOutCubic, edge
  ≤ 14 px/frame). Then a truck right at 3 px/frame. 31.14–31.97: tilt up 120 px with the spear to the nearest flag.
- **Performance:** **26.970** the thrust lands (full extension, tassel flares forward, robe hem flicks; 2-frame shake
  on the spear only). 27.40–28.24 recovery. **28.653** (bar 17): a 花枪 flourish, one full circle over his head in
  0.84 s with a tassel trail; the ranks follow 4 frames later. **30.314** (bar 18): the ranks stamp, dust at their feet.
  **31.138** (bar 18 beat 3): he plants the spear butt (dust ring) and stands tall; the spear upright, tip 0.5 m above
  his head.
- **Out (T4, 31.974, bar 19):** colour and shape match dissolve. The nearest red flag, snapping at (520, 260), becomes
  the red lantern at the same spot on his house's eave (12 frames, 31.56–31.97). The sky has been sliding from noon to
  dusk since 30.31.
- **Sound:** the thrust whoosh merges with the hit; a soft low stamp on 30.314.

---

### TAKE 4 · 31.974–38.638 · home

#### S07 · 31.974–35.306 (f 959–1059) · bars 19–20 · V07 「家里的娘子，成亲三年，没跟你红过一次脸。」 (J-cut from 31.56)
- **Size / angle:** MWS exterior at dusk, eye level, frontal on their house: tiled eave, the red lantern (from the
  match), a paper-lattice window (1.0 × 1.2 m) glowing at the centre right.
- **Read / emotion:** two shadows close together on the warm window. Tenderness, three quiet years.
- **Composition:** window x 980–1460, y 260–800; lantern (520, 260); dark door at the left; eaves at the top. At least
  80 % of the frame is warm.
- **Light:** the lamp inside is the key (window glow #FFC56E); the lantern is second; dusk sky #E9B07A → #6B5A7E; the
  wall #4A3A3E is warmed by the glow. Luma ≈ 100.
- **Layers:** sky d 0 · far roofs d 0.25 · wall and window d 1.0 (the shadows are on the paper) · lantern d 1.1 (sways
  2°, 0.5 Hz) · eave corner d 1.4.
- **Camera:** push 1.00 → 1.18 toward the window (easeIn into the push-through).
- **Performance (shadow play):** her shadow is seen from behind (bun, hairpin, shoulders), sewing; the needle hand rises
  on beats 2 and 4 (32.39, 33.23, 34.06, 34.89). 32.81: his shadow (headscarf wings) enters from the right behind her.
  **33.646** (bar 20): his hand rests on her shoulder. **34.472** (bar 20 beat 3): she leans her head against his hand.
  No facial profiles.
- **Out (T5, 35.306, bar 21):** push through the window paper. The glowing paper fills the frame (warm bloom, 8 frames)
  and the room appears on the other side.
- **Sound:** music only.

#### S08 · 35.306–38.638 (f 1059–1159) · bars 21–22 · V08 「你只想，日子就这样过下去。」
- **Size / angle:** CU insert at table level (camera 15° above the top): two black-glazed 建盏 (Ø 12 cm ≈ 264 px). Her
  hand pours from the 注子, held by the handle. His hand (green sleeve) cups his bowl. Faces out of frame.
- **Read / emotion:** two bowls, two steam ribbons twining into one. The ordinary happiness he wanted to keep.
- **Composition:** bowls at ≈ (840, 640) and (1180, 640), above the subtitle band. Her hand and the ewer from the top
  right, his hand from the left. The steam rises into dark warm negative space toward the top centre.
- **Light:** lamp key from the upper right (#F2B05A), the steam backlit. Luma ≈ 100.
- **Layers:** room d 0.2 · table top d 0.8–1.0 · bowls and hands d 1.0 · ewer d 1.1 · lamp edge (right) d 1.5,
  blurred.
- **Camera:** truck left at 4 px/frame; from 37.40 tilt up with the steam.
- **Performance:** 35.72–36.56: she pours (the stream leaves the spout tip and lands in his bowl; R8). **36.978** (bar
  22): the two steam ribbons twine. 37.40: his thumb strokes the rim.
- **Out (T6, 38.638, bar 23):** motion-follow dissolve. The camera tilts up with the twined steam; the steam becomes
  the thick incense smoke of the 岳庙 鼎 at the same screen x and the same rising motion, while the lamp light turns to
  hazy daylight (12 frames, 38.22–38.64). 「直到那天」 is the turn.
- **Sound:** a soft tea pour 35.7–36.5.

---

### TAKE 5 · 38.638–52.370 · the 岳庙, one take (thumb `thumb_S09-S12_temple_path.png`)

World canvas 3840 × 2160 at d 1. Keyframes K1–K7 are drawn on the thumb.

#### S09 · 38.638–42.390 (f 1159–1272) · bars 23–25 · V09 「直到那天在岳庙，有人当众调戏她。」
- **Size / angle:** K1 (38.64) high on the smoke, zoom 1.4 → K2 (40.73) high-angle WS (20° down), zoom 0.7, all
  figures full length at one scale → K3 (42.39) medium-wide on the incident, zoom 1.25.
- **Read / emotion:** a rich man in magenta blocks her path and the crowd watches. Violation, helplessness.
- **Composition (K2):** the bronze 鼎 left of centre as a foreground frame with its smoke rising. The pair right of
  centre: 高衙内 steps into her path from the right, his arm barring her. She turns away (back or 3/4 rear to camera),
  hand to chest. 20–30 onlookers in a half circle, scaled by the perspective rule, heads turned toward them. Behind:
  the hall with steps, red columns, upturned eaves.
- **Light:** hazy spring daylight from the top left. The pair stands in a sunlit gap in the crowd: the light lands on
  the incident. Luma ≈ 130.
- **Layers:** sky d 0 · hall roof d 0.25 · hall and steps d 0.35 · crowd d 0.6 · 鼎 and smoke d 0.9–1.1 · the pair and
  林冲 d 1.0 · incense sticks and railing d 1.4 (from K3).
- **Camera:** K1 → K2 crane down 600 world px with zoom 1.4 → 0.7 (exponential, 38.64–40.73). K2 → K3 push
  0.7 → 1.25 (40.73–42.39). Verify ≤ 25 px/frame.
- **Performance:** **40.310** (bar 24): 高衙内 steps across her path, wide sleeve out. 41.153: he leans in and reaches
  for her sleeve. 41.571: she recoils (shoulders up, a step back). 40.73–41.15: onlookers' heads turn, staggered.
  41.97: 林冲 strides in from behind the 鼎 at the left.
- **Out:** continuous into S10.
- **Sound:** a low crowd murmur.

#### S10 · 42.390–45.712 (f 1272–1371) · bars 25–27 · V10 「你一把扳过那人，拳头举了起来——」
- **Size / angle:** MS two-shot in profile (who faces whom), 8° low. 林冲 H = 260 px; 高衙内 H = 255 px, eye line
  ≈ 0.4 H lower.
- **Read / emotion:** the spin, and the fist cocked beside his ear. Rage, the instant before the blow.
- **Composition:** 林冲 on the left third facing right (eyes ≈ 700, 330). 高衙内 on the right third. The cocked fist
  beside 林冲's ear (≈ 560, 330) is the focal point, silhouetted against the bright haze. The wife is small and soft
  between them in the background (d 0.7), turning.
- **Light:** the haze back-lights; a warm key from the left on 林冲. 高衙内's face is hidden by his own raised
  sleeve.
- **Camera:** push 1.25 → 1.9 (42.39–43.63, easeOut), then a creep 1.9 → 2.0 to 45.30.
- **Performance:** **42.390:** 林冲's far hand grabs 高衙内's shoulder (contact solved) and wrenches him round; his body
  whips with a 2-frame smear on **42.793** (bar 25 beat 3). As a reflex 高衙内 flings his wide sleeve up over his face,
  so the face stays hidden. **43.630** (bar 26): 林冲's near arm draws back, slow → fast, until the fist is cocked at
  **45.302** (bar 27): upper arm 364 px, forearm 286 px, elbow 100°, fist 104 × 109 px. Tremble ±1.5 px at 8 Hz.
  Expression 怒.
- **Out:** continuous into S11.
- **Sound:** a soft cloth snap 42.793.

#### S11 · 45.712–50.710 (f 1371–1521) · bars 27–30 · V11 「却认出，那是你上司的干儿子。」 + V12 「拳头，软了。」
- **Size / angle:** (a) push over the cocked fist to an MCU on 高衙内; (b) rack back and push into an ECU of the fist
  (3/4 side view: curled fingers, knuckle row on top, thumb across the middle phalanges), with his smirk soft behind.
- **Read / emotion:** (a) at 45.71, the face: the boss's son, smug and unafraid; (b) at 49.0, the fist giving way.
  Recognition, then impotence.
- **Composition:** (a) 高衙内's face on the right third (≈ 1250, 380), the flower cap catching light; the fist soft at
  the upper left (560, 300). (b) the fist at the upper-left third (≈ 760, 380, ≈ 480 px tall); 高衙内 soft at the
  right. Two of his retainers step in behind him at 46.14 (d 0.7).
- **Light:** from 45.712 the grade drains: saturation −35 % over 1.3 s, haze → #CFC6B2, a cold edge creeping in from
  the right.
- **Camera:** **45.712** (bar 27 beat 2, the strongest accent of the section): he lowers the sleeve and the face is
  there. Rack focus fist → face (12 frames) with a push 2.0 → 2.6 (1.3 s, easeOut). **48.634** (bar 29): rack back to
  the fist and push 2.6 → 4.0 (1.2 s, exponential; edge ≤ 20 px/frame).
- **Performance:** 高衙内 swaps from profile to a front-facing head behind the sleeve, revealed with the new smirk
  (§9). 46.56: a small tilt of the head, "you dare?". 林冲 goes from 怒 to 惊认 over 6 frames at 45.9. The fist:
  49.04 the tremble stops; **49.457** (bar 29 beat 3, accent 7.3) the grip loosens, index and middle first; 49.88 ring
  and little; 50.29 the half-open hand begins to sink, slow then slower.
- **Out (T7, 50.29–50.71):** tilt down following the sinking hand onto his clenched jaw.
- **Sound:** music only.

#### S12 · 50.710–52.370 (f 1521–1571) · bars 30–31 · V13 「你忍了。」 (「忍」 in gold)
- **Size / angle:** tight CU in profile facing right; face 65–75 % of the frame height; eye at ≈ (700, 380).
- **Read / emotion:** the jaw. He swallows it (忍 1, warm grey).
- **Composition:** face on the left third, looking into the right two-thirds where 高衙内's back recedes, laughing and
  soft (d 0.6).
- **Light:** hard side light from the right (#D8D2C4), the near face in shadow; background lifted to haze grey #9A958A.
  Luma ≈ 80.
- **Camera:** hold; creep 1.00 → 1.02.
- **Performance:** profile 隐忍 with the new `jaw` on `side()` (masseter bulge, pressed lips). **51.123** (bar 30 beat
  3): the jaw clenches (4 frames). 51.54: one swallow (Adam's apple). Eyes lowered.
- **Out (T8, 52.370):** pillar wipe. The camera trucks right; a lacquered 樊楼 pillar (d 1.5, #5A2620, blurred) crosses
  in 14 frames, and past it we are in 樊楼.
- **Sound:** music only.

---

### TAKE 6 · 52.370–55.700 · 樊楼

#### S13 · 52.370–55.700 (f 1571–1671) · bars 31–33 · V14 「最好的朋友陆谦，帮着他们害你，」
- **Size / angle:** OTS MCU. 林冲's shoulder and the back of his head (green robe, headscarf wings, jade rings behind
  the head, so it reads as him even blurred) in the left foreground (d 1.4). 陆谦 across the table on the right third,
  eye level.
- **Read / emotion:** the friend's warm smile, half swallowed by shadow. Betrayal dressed as friendship.
- **Composition:** 陆谦's face at (1240, 400), H ≈ 300 px. The table top at his lower ribs. 酒盏 on the table. He
  holds the 注子 by its handle in his right hand and lifts his own cup toward the lens (to 你) with his left. A lantern
  behind him at the upper right (watch the corner mark).
- **Light:** lantern amber #E39A45 from his upper left. **53.626** (bar 32, the brighter part of the theme): he turns 15°
  and a soft-edged form shadow (#2B2236 at 65 %, 40 px feather) slides across the far half of his face in 16 frames.
  The smile does not change.
- **Camera:** push 1.00 → 1.08 toward him.
- **Performance:** expression 笑里藏刀 (§9). 52.80: he lifts his cup. 53.626: the turn and the shadow. 54.46: he pours
  for 林冲 (the stream from the spout into 林冲's cup at the lower left). 54.88: the cup brims. 55.30: 林冲's hand
  lifts the cup toward the lens.
- **Out (T9, 55.700):** push into the liquid. The camera dives into the amber wine; the wine darkens to ink in 12
  frames and the next face resolves out of it.
- **Sound:** pour 54.46–54.9.

---

### TAKE 7 · 55.700–58.619

#### S14 · 55.700–57.380 (f 1671–1721) · bars 33–34 · V15 「你忍了。」 (gold)
- **Size / angle:** ECU frontal: eyes, brows and the bridge of the nose (eyes span x ≈ 400–1520); ink-dark ground
  #0F0D10 with ink-wash grain.
- **Read / emotion:** shut eyes and a vein at the temple. The second swallow, harder (忍 2, cooler).
- **Light:** cool low key from the lower left (#6F7A8C). Luma ≈ 55; this is the ink transition, so 1.7 s at this level
  is accepted.
- **Camera:** hold, creep 1.00 → 1.03.
- **Performance:** 闭目忍 (§9). 56.12: the temple vein rises (6 frames). 56.54: a slow exhale (brows ease 10 %).
  57.20: the lids begin to open.
- **Out (T10, 57.380):** eyelid wipe. The lids part as a horizontal slit (POV) that opens over 6 frames onto the
  白虎节堂. Not a dip to black: the dark is his closed eyes and the slit already shows the hall.
- **Sound:** music only.

#### S15 · 57.380–58.619 (f 1721–1759) · bar 34 · V16a 「被诬陷，」
- **Size / angle:** extreme high angle (55° down) WS inside the 白虎节堂.
- **Read / emotion:** the plaque over a man holding a blade (L6): he has been framed. The trap shuts.
- **Composition:** the plaque 「白虎节堂」 at the top centre (x 760–1160, y 120–220, characters ≈ 110 px; clear of the
  watermark zone). 林冲 small at the centre (960, 600), in the green robe, holding the 宝刀. Floor tiles converge on
  him. Guards' long shadows close in from the edges. 高俅's silhouette on the dais at the upper right, in front of the
  white-tiger screen.
- **Light:** cold steel-blue hall #1D232D / #3D4A5C; a cold key from a high window on 林冲 (#A9C1D9); the plaque's gold
  characters #C9A45C catch the light. Luma ≈ 75.
- **Camera:** opens out of the slit at 1.00; crane down 1.00 → 1.12.
- **Performance:** **58.20:** 高俅's arm sweeps down to point at him (8 frames, fast).
- **Out: MATCH CUT 2 at 58.619** (bar 35). The downward sweep of the accusing arm (from the upper right toward the
  centre) continues as the downward stroke of the 文笔匠's tool on the cheek. The accusation becomes the brand.
- **Sound:** music only.

---

### TAKE 8 · 58.619–68.592 · branded, sent away, the promise (one take; the world changes around him)

#### S16 · 58.619–60.291 (f 1759–1809) · bar 35 · V16b 「脸上刺字，发配沧州，」
- **Size / angle:** ECU of his cheek in profile, facing right: cheekbone, the corner of the eye, the ear. The
  文笔匠's hand enters from the upper right (fingers only) with a slim tool.
- **Read / emotion:** abstract ink marks blooming in the skin (L30 「刺了面颊」). Branded for good.
- **Composition:** the mark sits at the right-third intersection (1280, 620).
- **Light:** cold key from the top left; skin desaturated −20 %.
- **Performance / FX:** the marks bloom like ink in rice paper on **58.619, 59.036, 59.452**: three groups of square
  abstract marks, #2A3A55, 3 px feathered edges. No blood, no needle shown entering the skin, no readable characters.
  He blinks once at 59.04, the only flinch. Costume from here: plain head cloth, no jade rings.
- **Out (T11):** from 59.87 the camera pulls back from the cheek. The cangue's rounded board swings in and closes
  around his neck on **60.291** (bar 36): an object wipe inside the pull-back.
- **Sound:** a dry wooden clack 60.291, the only impact in this section.

#### S17 · 60.291–62.370 (f 1809–1871) · bars 36–37 · V17 「你还是忍了。」 (gold)
- **Size / angle:** high angle (35° down) MS, centred and small in the frame. His head is pitched down, chin to chest;
  the board crosses the lower frame with its iron plates and 封皮.
- **Read / emotion:** the bowed head in the cangue. The third swallow: crushed (忍 3, cold blue).
- **Light:** one cold shaft from above (#C7D6E4) on his head and the board. The floor is lifted to #2A3240, not black.
  Luma ≈ 70.
- **Camera:** the pull-back runs 59.87–61.95, zoom 3.5 → 1.0, exponential (≈ 2 %/frame, edge ≈ 19 px/frame).
- **Performance:** the clamp drops his head (pitch −30° over 10 frames); 61.11 his shoulders sag.
- **Out (T12, from 61.951, bar 37):** world slide. The hall's darkness dissolves around him into the white summer
  road; the shaft of light widens into the sky; guards' staffs enter; he starts to walk. He stays, the world changes.
- **Sound:** cicadas fade in at 62.0.

#### S18 · 62.370–65.283 (f 1871–1958) · bars 37–39 · V18 「你总觉得，忍一忍，就能回去。」
- **Size / angle:** WS side view at eye level, tracking with him. He stays left of centre and the world slides left.
- **Read / emotion:** his look back toward the city. Hope that he can go back.
- **Composition:** him at x ≈ 800 (WS: 300 px, cangue on), feet y 760; one guard ahead, one behind, each with a 水火棍.
  The city gate tower at the far left (d 0.3), willows, dust. His look sends an eye-line to the gate.
- **Light:** white-hot summer sky #F4EEDF, dust #D8C7A0, hard top light, short shadows. Luma ≈ 150.
- **Camera:** track; road d 1.0 at 4 px/frame, willows d 0.8, gate d 0.3. Walk cycle: one step every 2 beats (62.37,
  63.20, 64.03, 64.86).
- **Performance:** **63.611** (bar 38): he stops and looks back over his shoulder at the gate (head 70°, shoulders
  20°). 64.03: the front guard tugs him on.
- **Out (T13, 64.4–65.28):** eye-line pan into memory. The camera pans left along his look (6 px/frame) past the gate
  while the colour warms to a sepia tint (35 % multiply) and arrives at the tavern table.
- **Sound:** cicadas.

#### S19 · 65.283–68.592 (f 1958–2058) · bars 39–40 · V19 「岳父也说：放你回来时，依旧夫妻完聚。」
- **Size / angle:** tinted memory. OTS MS from behind 林冲's left shoulder at the S01 tavern table; 张教头 across the
  table (3/4 front); the 休书 lies on the table between them (L11 is the same 第八回 scene).
- **Read / emotion:** the father's hand on his shoulder: the promise. Hope given, to be broken.
- **Composition:** 林冲's shoulder and the cangue edge soft at the lower left (d 1.4). 张教头's face on the right
  third (≈ 1250, eyes y 380, H ≈ 250 px). His hand on 林冲's shoulder at ≈ (620, 560), in the brightest pool.
- **Light:** warm sepia memory light (#E8B77A) from the tavern window.
- **Camera:** push 1.00 → 1.10 toward the hand.
- **Performance:** **65.283** (bar 39): the hand lands on the shoulder (contact); 65.70 a small squeeze. 张教头 慈 (§9);
  he nods on 「依旧夫妻完聚」 (≈ 67.4).
- **FX:** **66.955** (bar 40, the flute theme returns): **the film's first snow** falls into the summer room, which is
  impossible: the promise is being snowed under. 10 flakes, more by 68.2. Optional (owner call, §11): 67.4–68.9 the
  words 依旧夫妻完聚 appear as faint gold brush writing on the 休书 (#C9A45C at 60 %, ≤ 56 px) and snow settles on them.
- **Out (T14, 67.77–68.592, lands on bar 41):** position-match dissolve. The hand fades from the shoulder; snow builds
  up where it was; the tavern dissolves into the grey 草料场 behind the same shoulder, now under a brown cloak, with the
  毡笠 brim entering at the top left.
- **Sound:** cicadas cut on 66.955 as the season flips; a low wind bed fades in.

---

### TAKE 9 · 68.592–77.748 · 沧州, one crane (no fire anywhere in this take)

#### S20 · 68.592–74.424 (f 2058–2233) · bars 41–44 · V20 「到了沧州，你守着一座草料场。」 + V21 「那年冬天，雪下得特别大。」
- **Size / angle:** starts OTS on his snow-dusted shoulder (MS), cranes up and back to a high-angle WS (30°) of the
  depot, then rises to an EWS (40°) of the snow country as night falls.
- **Read / emotion:** (a) the depot he must guard, in first snow; (b) a tiny man in vast snow. Exile, cold, smallness.
- **Composition:** (a) at ≈ 71.0: the depot centred (two-bay thatched 草厅, fodder stacks, fence and gate), him at the
  gate on the lower-left third with keys and spear. (b) at ≈ 73.5: ink-wash mountains; the depot small on the lower-left
  third; the 山神庙 small on a slope on the right third (geography for what follows); snow slanting.
- **Light:** overcast #9AA6B2 → dusk #5C6B80 → early night (sky top #2C3A50, horizon #5C6B80); snow #EEF2F5. Luma
  140 → 95.
- **Layers:** sky d 0 · far mountains d 0.1 / 0.15 (two fog layers) · hills d 0.35 · temple slope d 0.6 · depot d 0.7
  · a real snow-laden branch at the top right d 1.5 (not a line) · snow bands.
- **Camera:** 68.59–71.92 crane up 600 world px, zoom 1.30 → 0.85 (easeInOut); 71.92–74.42 slow rise, 0.85 → 0.70,
  while the light falls.
- **Performance:** 69.43 he unlocks the gate; 70.26 he steps in. Later a tiny figure with the spear over the shoulder
  and the gourd at the tip walks the road (L14).
- **FX:** **72.750** (bar 43 beat 3): a gust; snow density ×3, slant 25°. Density ramps 20 → 60 → 180 flakes per band.
- **Out:** continuous into S21.
- **Sound:** wind bed; a soft gust 72.750.

#### S21 · 74.424–77.748 (f 2233–2332) · bars 44–46 · V22 「雪压塌了草屋，你躲进山神庙，」
- **Size / angle:** the camera descends through heavy snow to a MWS beside the temple. The temple's front corner and
  door are big in the right foreground (≈ 3 m from the lens); the 草厅 stands in the mid-ground left (≈ 25 m, ≈ 400 px
  wide); he is between them (FS ≈ 420 px), in 毡笠 with the spear and gourd.
- **Read / emotion:** the roof caving in. Nowhere left to shelter.
- **Light:** dusk blue #5C6B80, snow #DDE6EE; the temple door dark. **No fire.** Luma ≈ 95.
- **Camera:** 74.42–75.67 crane down and push 0.70 → 1.0 (exponential, edge ≤ 18 px/frame); settle.
- **Performance:** **75.256** (bar 45): the roof sags, snow slides. **76.077** (bar 45 beat 3): the roof collapses in a
  big snow puff (Canvas burst); he stops dead and the gourd swings on its cord. 76.08–77.33: he turns from the ruin
  and trudges to the temple door (the line says 躲进山神庙). 77.33: he pulls the door.
- **Out (T15, 77.33–77.748, bar 46 beat 3):** door-leaf wipe. The door swings toward the lens and fills the frame; on
  the other side we are inside, looking at the same door closing.
- **Sound:** a creak 75.26; the collapse 76.077 (soft, low).

---

### TAKE 10 · 77.748–93.565 · the temple: the set piece, one interior take (thumb `thumb_S22-S24_crack.png`)

Interior set: walls #5B4E44 in shadow #2A2420, an altar 0.9 m high with a dim seated statue (no face detail), a heap of
straw, cold blue light through the door cracks (#6F8DB5). The stone (50 × 40 × 35 cm) is inside, by the door.

#### S22 · 77.748–79.830 (f 2332–2395) · bars 46–47 · V22 「搬石头抵住了门。」
- **Size / angle:** MS side view, camera low (0.7 m). The door on the right third, closing.
- **Read / emotion:** he barricades himself in from the inside. Shelter.
- **Performance:** he turns from the closed door to the stone and pushes it against the door (L14). Torso ≈ 45°, hands
  flat on the stone's widest point, back leg straight and driving, short steps; solved by IK from the contacts (owner
  rows 100–101). The stone meets the door on **78.588** (bar 47) with a thud. 78.59–79.42: he straightens, leans the
  spear (gourd still tied) against the wall, sits against the altar under a blanket; breath clouds.
- **Light:** cold blue crack light; his face catches a little of it. Luma ≈ 70.
- **Camera:** a slow truck left following him to the altar, 2 px/frame.
- **Sound:** stone scrape 77.9–78.5, thud 78.588.

#### S23 · 79.830–86.912 (f 2395–2607) · bars 47–52 · V23 「半夜，草料场烧起来了。」 + V24 「门外有人说：烧死了，拾他一两块骨头回去交差。」
- **Size / angle:** MS → he crouches at the door → CU at the crack → push through the crack into a POV.
- **Read / emotion:** (a) orange light flaring through the crack onto his face; (b) through the crack, three silhouettes
  against the fire. Alarm, then listening.
- **Composition:** (a) the door on the right third with a vertical crack (2–3 cm ≈ 25 px at MS) glowing; his face turns
  to it. (b) POV: a black frame with the fire-lit gap (≈ 300 px wide) in the centre; three faceless silhouettes (差拨,
  陆谦, 富安; L15) stand in front of the burning depot.
- **Light:** (a) crack light #FF8A3D as a narrow band across the floor and his face, flickering 8–12 Hz at ±15 %;
  cold fill #3B4F73; interior #2A2420. Luma ≈ 55. (b) fire #FF7A2E / #FFE3A3 behind silhouettes #120C0A.
- **Camera:** 79.83 hold. 80.26 (bar 48) he rises, crosses to the door and crouches (to 81.5). 81.5–82.34 push to the
  crack, 1.0 → 2.2 (exponential). **82.34** push through the crack, 2.2 → 4.0 in 12 frames; the dark door edges pass the
  lens at d 1.3 (blur 8). POV holds 82.74–86.50, drifting 1 px/frame.
- **Performance:** **79.830** (bar 47 beat 4, the fill accent): the crack flares orange and his head snaps to it (6
  frames). In the POV the speaker gestures; at 「烧死了」 (≈ 83.3) the middle one's shoulders shake with a laugh; at
  「一两块骨头」 (≈ 84.8) one points at the fire. No weapons, no faces.
- **FX:** fire (flame sprites, rising embers, sparks), smoke, heat haze; the crack flicker.
- **Out (T16, 86.50–86.912):** pull back out of the crack. The reverse of the push: now we are inside again, and his eye
  is right at the crack.
- **Sound:** a low fire crackle bed from 79.830. The voices are the narration (no separate dialogue).

#### S24 · 86.912–93.565 (f 2607–2807) · bars 52–55 · V25 「那个声音，你认得。」 · V26 「你终于明白，」 (91.07) · V27 「忍，是回不去的。」 (92.15, in silence)
- **Size / angle:** CU → ECU of his face in near darkness at the crack, 3/4 facing right. Letterbox 2.39:1 (bars 138 px
  top and bottom slide in 86.91–88.57).
- **Read / emotion:** his eyes in a single slit of fire light. Recognition, then resolve.
- **Composition:** the slit lies horizontally across the eyes only (y ≈ 520); the near eye on the right third (x 1260).
  The tattoo is fully in shadow (not cut by the band).
- **Light:** mean luma 25–30, the only dark shot in the film. One slit of #FF8A3D across the eyes (flicker ±8 %); a
  faint cold rim on the hat brim #3B4F73.
- **Camera:** push 1.00 → 1.40 from 86.91 to 92.05 (≈ 7 %/s, eased). **Dead still from 92.05.**
- **Performance:** **86.912** (bar 52): his eyes widen a little: the voice. **88.573** (bar 53): the brows go from the
  隐忍 knit to flat and low (决, §9). **91.070** (bar 54 beat 3): the pupils narrow (dark iris r 8.5 → 6.5): the
  decision. **92.05:** the music cuts. Everything stops (fire flicker ±2 %); V27 alone in the silence; no blink.
- **Out: HARD CUT 2 at 93.565** (bar 56): picture hold + music stop → the hit (pauses.md).
- **Sound:** the fire bed cuts with the music at 92.05 → total silence; a stone scrape pre-laps from 93.25 into the hit.

---

### TAKE 11 · 93.565–115.217 · door → snow night → 梁山泊 → the news (one continuous truck)

#### S25 · 93.565–95.237 (f 2807–2857) · bar 56 · V28 「你推开了门。」 (93.98)
- **Size / angle:** low-angle MS inside the temple facing the door (camera 0.6 m). 林冲 from behind left (3/4 rear),
  spear level in his right hand (「挺着花枪」), his left hand hauling the door open (「一手拽开庙门」, L16). The stone is
  already pushed aside (from inside).
- **Read / emotion:** the doors burst open on fire and blizzard. Release: the end of 忍.
- **Light:** **93.565:** both leaves swing open in 6 frames; fire light floods in (#FFB15E → white) with blizzard snow;
  exposure rises to full white by 94.40 (25 frames, easeIn). A diegetic whiteout, not a flash (owner row 55).
- **Camera:** a 3-frame shake on the door leaves and the figure only; push 1.00 → 1.08 into the white.
- **Performance:** braced, spear level; 93.98 he steps forward into the white; by 94.40 he is gone into it.
- **Rule:** nothing outside is shown: no figures, no contact, no weapon strike. The white hides everything (L16;
  the killing is never shown).
- **Out (T17, 94.40–95.237):** whiteout resolve. White holds one beat (to 94.82), then the snowfield emerges from it
  (12 frames).
- **Sound:** door burst and wind on 93.565: the one SFX allowed near the music's level. Then wind.

#### S26 · 95.237–100.241 (f 2857–3007) · bars 57–59 · V29 「那一夜雪越下越大，你一个人，上了梁山。」 · thumb `thumb_S26_snownight.png`
- **Size / angle:** EWS at eye level, then a crane up. The figure is tiny: **160 px = 15 % of the frame height**
  (0.89 px/cm: spear 204 px, brim 36 px, gourd 25 px), in an immense ink-wash snow night.
- **Read / emotion:** one man walking alone into the storm, the iconic silhouette (毡笠, spear on the shoulder, gourd at
  the tip; L14, L16, L18 「雪夜上梁山」). Release and grief; free, with nowhere to go.
- **Composition:** figure on the left third (x 620, feet y 760), walking right. Footprints trail back to the left edge
  toward a faint fire glow on the far-left horizon (the past). The right two-thirds: open snow, the frozen marsh, the far
  梁山 silhouette on the right third (≈ 1600, 520), the future. The snow slope below y 820 is in shadow (≤ 70 % luma)
  so the subtitle reads.
- **Light:** blizzard night kept mid-high key (owner row 71): sky #3E4C60 → #8FA3B8 at the horizon, snow #DDE6EE, ink
  mountains #2E3846, figure #1E2430 with a cold rim #CFE0EE, the gourd #C08A45 (the only warm object), fire glow
  #E07A3A at 25 %. Luma ≥ 95.
- **Layers:** sky d 0 · mountains d 0.1 / 0.15 / 0.2 (fog between) · 梁山 d 0.15 · marsh and dead reeds d 0.35 · snow
  plain d 0.7–1.0 · figure d 1.0 · foreground slope d 1.4 · snow bands.
- **Camera:** lateral truck, the figure stays at x ≈ 620 while the world slides left (slope 9 px/frame, plain 6,
  marsh 2, mountains ≤ 1). **98.569** (bar 59): crane up 300 px (easeInOut, 1.7 s), revealing the marsh and 梁山.
- **Performance:** a real walk cycle, one step per beat. Each footprint is placed at the step and stays, leading to his
  heels (R3). The cloak and hat cord blow the same way the snow slants; the gourd swings.
- **Out (T18, 99.82–100.241):** time-lapse melt in the same frame. The snow plain darkens to water and the reeds rise;
  his walking silhouette dissolves into him standing on a 梁山 pier at the same screen position.
- **Sound:** wind.

#### S27 · 100.241–105.221 (f 3007–3157) · bars 60–62 · V30 「你想把娘子接上山，可这件事，一拖再拖。」
- **Size / angle:** WS, locked composition (time-lapse) from the 梁山泊 shore: him small on the pier on the left third
  (梁山 costume), water, reeds, the far shore toward 东京.
- **Read / emotion:** the seasons turn while he stands still. Delay, guilt (L19 「一向蹉跎过了」).
- **Composition:** the pier runs from the lower left to the left third; him at x 620 facing right; a reed band across the
  middle; mist on the far shore at the right.
- **Light:** per season: summer reeds #6E8F5A with sky #C9D2D1; autumn #C9A25A; winter #E6E8E6 with snow; spring
  #8FB07A; mist #E3E7E2. Luma ≈ 150.
- **Camera:** locked; creep 1.00 → 1.06.
- **Performance:** only his cloth stirs. **100.241** summer. **101.889** (bar 61): autumn (a wind sweeps the reeds gold,
  left to right, 0.4 s). **103.561** (bar 62): winter (snow on the beat, ice at the water's edge). Then faster, one per
  beat (「再拖」): 103.98 spring, 104.39 summer, 104.80 autumn. The light and the water change with each.
- **FX:** directional season sweeps; a skein of geese at 102.73 (autumn).
- **Out:** continuous; at 105.22 the camera drifts down and right behind him.
- **Sound:** low water lap.

#### S28 · 105.221–115.217 (f 3157–3457) · bars 63–68 · V31 「等派去的人回来，只带回一句话：」 + V32 「娘子被逼，自缢身死，已故半载。」 (109.81) + 「已故半载」 calligraphy
- **Size / angle:** OTS. His back is soft in the right-third foreground (d 1.3); deep focus to the misty water where a
  small boat appears. On V32, rack focus to him.
- **Read / emotion:** (a) the boat out of the mist; (b) his shoulders as he hears it; (c) the four characters
  已故半载. Dread, the news, grief. The death is said once and never depicted.
- **Composition:** his back on the right third (shoulders y ≈ 520). The boat emerges left of centre (≈ 700, 520)
  through the reeds. The calligraphy runs vertically in the mist at the upper left (x 520–760, y 120–760, four
  characters ≈ 150 px each), clear of the subtitle band and of him.
- **Light:** pale mist #E3E7E2, water #7E9A9A. As the words land, the whole frame desaturates to ≤ 25 % and the contrast
  drops. Luma 150 → 120.
- **Camera:** 105.22–108.55 slow push over his shoulder toward the boat (1.00 → 1.10). **109.813** rack focus boat
  (d 0.5) → him (d 1.3) over 14 frames, then hold.
- **Performance:** **105.64:** the boat (6 m, two men, one poling) comes out of the mist. **108.553** (bar 65): it
  touches the pier; the messenger steps off and at **109.39** lowers his head, hands clasped. During 「已故半载」
  (≈ 111.6–112.5) his shoulders sink 3 cm and his head drops 5°.
- **FX:** after the V32 subtitle clears (≈ 112.65), 「已故半载」 is brushed stroke by stroke in black ink on the mist,
  as if on paper, with dry-brush texture (#15110E): 已 **112.72** (bar 67 beat 3), 故 113.14, 半 **113.557** (bar 68),
  载 113.96. Never at the same time as the subtitle. **114.38:** the last stroke of 载 starts to run and a drip slides
  down to 115.20.
- **Out: MATCH CUT 3 at 115.217** (bar 69): the ink drip becomes his tear rolling down his cheek at the same screen x
  and in the same direction.
- **Sound:** water lap; music alone under the calligraphy.

---

### TAKE 12 · 115.217–124.783 · grief and the window

#### S29 · 115.217–116.878 (f 3457–3506) · bar 69 · V33 「你哭了。」 (retimed to 115.22)
- **Size / angle:** CU 3/4, face ≈ 60 % of the frame height (H ≈ 600 px), on the left third facing right, so the tear
  falls at x ≈ 640 where the drip was.
- **Read / emotion:** one tear on a hard man's face. Grief without a sound.
- **Light:** cold side light from the right (the window), #9AA6B2; skin desaturated #E3CDBE. Luma ≈ 85.
- **Camera:** hold; creep 1.00 → 1.03.
- **Performance:** 悲 with the mouth pressed shut (open 0). The tear rolls 115.22–116.04; his shoulders sink at 115.62;
  one slow blink at 116.46. 梁山 costume. The neck reaches the collar (model sheet).
- **Out (T19, 116.878, bar 70):** his eyes lift; rack focus from his face to the window behind his eye-line.
- **Sound:** music only.

#### S30 · 116.878–124.783 (f 3506–3743) · bars 70–74 · V34 「从此，心里再没有可挂念的人。」 (116.88) + V35 「后来，仇人高俅被捉上山，又被好酒好肉送了回去。」 (120.21)
- **Size / angle:** MS on a paper-lattice window of the same design as the home window in S07 (the deliberate rhyme).
  His profile is soft in the left foreground (d 1.3); focus on the window (d 0.8).
- **Read / emotion:** (a) the dark, empty window: no one left to miss (L21); (b) the banquet's shadows on its paper,
  then a lantern boat leaving. Emptiness, then bitter irony.
- **Composition:** window at the centre right (x 980–1460, y 220–800). At 120.21 lantern light from the hall across the
  water blooms in the paper and shadows play on it: 宋江 bowing low (纳头便拜, L22) before a seated figure in a
  long-winged 幞头 (高俅); toasting silhouettes. At ≈ 122.3 the shadow of a lantern-hung boat slides across the paper
  left to right and out (送了回去). No image of 林冲 reacting (L23, L26).
- **Light:** (a) cold night blue, paper #3A4250; (b) lantern bloom #E8A04A through the paper: warm but hollow, seen only
  as light on paper. Luma 70 → 100.
- **Camera:** 116.878 rack focus face → window (14 frames); push 1.00 → 1.10 toward the window over the shot.
- **Performance:** 116.88 he lifts his eyes; the window is empty and dark: no shadow sewing (rhymes with S07).
  **120.210** (bar 72, the loudest part begins): the lanterns bloom. 120.63 the bow; 121.46 the toast; 122.29 the boat's
  shadow enters; it is gone by 124.38.
- **Out (T20, 123.54–124.783, bar 74):** window-frame dissolve. The paper dims as the lanterns recede, then pales with
  morning light. The window frame holds its screen position while the room around it changes to a monk's room in
  六和寺 (plaster wall, a different branch shadow).
- **Sound:** low water lap only.

---

### TAKE 13 · 124.783–148.500 · 六和寺, the peak, the question, the end card

#### S31 · 124.783–128.534 (f 3743–3856) · bars 74–77 · V36 「再后来，你病倒在杭州六和寺，再没起来。」
- **Size / angle:** WS interior at FS scale (3.78 px/cm), slow dolly.
- **Read / emotion:** the hat and spear left behind, in the light (L25). An ending without a witness; no body.
- **Composition:** the window (from the dissolve) on the right third, its light pool on the floor. The spear (gourd
  tied) leans **on** the door frame at the left (869 px against a 756 px door). The 毡笠 rests on the foot of the empty
  bed at the centre (brim 151 px = 0.21× the 718 px bed). A folded blanket. Through the open door, the 六和塔 pagoda far
  away (says 杭州), kept below y 220 (watermark zone).
- **Light:** soft morning light through the lattice (dust shaft #E8D9B8 at 40 %), plaster #A89C88, shadow #3A332C. The
  light pool is the brightest thing and it lands on the hat and the spear's foot. A branch shadow on the wall. Luma
  ≈ 100.
- **Camera:** dolly right 3 px/frame with a push 1.00 → 1.06; dust drifting in the beam.
- **Performance:** none. The light pool slides 30 px across the floor (time passing).
- **Out (T21, 128.534, bar 77):** light bloom. The pool brightens and swells into the glow of the 休书 while the room
  falls to a dark blue-grey around it (#2A2E38, never black). The loudest section starts; memory floods in.
- **Sound:** music only.

#### S32 · PEAK · 128.534–136.870 (f 3856–4106) · bars 77–82 · V37 「你这一辈子，都在等那句：依旧夫妻完聚。」 (129.37)
- **Size / angle:** graphic, overhead. The 休书 in exactly S01's position and tilt (the bookend), surrounded by an ink
  night (#1A1D24 → #2A2E38 vignette).
- **Read / emotion:** gather: everything flows into the 休书. Then the promise, brushed huge. Then release: all the ink
  lifts off as snow, leaving the red palm print alone. A whole life waiting for one sentence, which never came
  (owner row 88: the biggest image on the loudest music).
- **Gather (128.534–132.8):** the film's images drift in from the edges as ink-wash vignettes, one per half bar, and
  dissolve into the paper as they touch it (ink absorbed): the S07 window with two shadows (128.534, from the top
  left), the S08 two bowls (129.37, left), the S10 cocked fist (130.19, right), the temple door with its crack of fire
  (131.03, lower right), snow (131.87, top).
- **The promise (after the V37 subtitle clears at ≈ 132.9):** 「依旧夫妻完聚」 brushed huge across the paper in one
  horizontal row at y ≈ 430 (≈ 150 px characters; the row is wider than the sheet and runs off its edges onto the dark:
  the promise is bigger than the document). Ink #1A1410 with a gold edge #C9A45C, one character per beat: 依
  **133.538** (bar 80, the coda), 旧 133.96, 夫 134.37, 妻 134.79, 完 135.20, 聚 135.62.
- **Release (136.03, bar 81 beat 3):** every stroke on the page, the L8 text and the promise, lifts off as ink motes and
  snowflakes rising into the dark (particles spawned from the glyph pixels, rising and drifting over 0.84 s). The blank
  paper and the red palm print stay, the print glowing (bloom #E0503E at 30 %).
- **Light:** the paper glows from within (#D9C9A3); the arriving images are in desaturated ink tones. Luma ≈ 85.
- **Camera:** opens at 1.00 overhead; push 1.00 → 1.12 toward the handprint during the gather (easeInOut); a slow
  pull 1.12 → 1.00 during the promise so the overflowing row stays in frame; hold for the release.
- **Out:** continuous; the paper stays and the fist arrives.
- **Sound:** soft brush whisks on the six promise beats; a breath of wind at the release.

#### S33 · 136.870–141.862 (f 4106–4256) · bars 82–85 · V38 「如果重来一次，岳庙那一拳，你打不打？」 (138.53)
- **Size / angle:** a two-element composition. The blank paper with the red palm print on the left third (from S32).
  The clenched fist (the S10/S11 drawing: 3/4 side, cocked, ≈ 360 px) rises into the right third from below, against the
  warm desaturated haze of the 岳庙 sky, which fills the dark around the paper.
- **Read / emotion:** the open hand (the print he pressed: 忍) against the fist (the blow he didn't throw). The question
  is now yours.
- **Composition:** print at ≈ (640, 440), fist at ≈ (1280, 420), empty centre. The subtitle sits in clean space (haze and
  the paper's lower margin only), never over ink.
- **Light:** warm haze #E3D3B5 behind the fist; the paper glow on the left. Luma ≈ 110.
- **Camera:** hold; push 1.00 → 1.04.
- **Performance:** 136.87–138.11 the fist rises into frame (slow, then holds), trembling ±1.5 px. At 141.03 the fingers
  tighten very slightly. No answer: it neither strikes nor opens.
- **Out (T22, 141.862, bar 85):** the red palm print contracts into the red J seal of the end card and stamps on the
  downbeat. The fist fades to 35 %, blurred, behind the card.
- **Sound:** nothing until the seal thump at 141.862.

#### END · 141.862–148.500 (f 4256–4455) · Juno end card (engine standard)
- J monogram seal in red #B3302A (arriving from the handprint), stamps at **141.862**.
- Gold title 《水浒人物志 · 壹 · 林冲》 (#E2B865) at 142.27.
- The question 「如果重来一次，岳庙那一拳，你打不打？」 centred at 142.69 (trailing ？ pulled back ½ em; ink centre
  measured).
- Follow pill 「关注 Juno · 一起看懂世界」 at **143.523** (bar 86).
- 「下回：鲁智深」 at 144.35.
- Sources 「资料：《水浒传》一百二十回本 第七—十一、二十、八十、一百一十九回」 at 144.76.
- Background: the S33 frame dimmed to 35 % and blurred 12 px, on ink #14110E with the paper texture. Hold to 148.5.
  The music ends at 146.95; the tail rings to 148.4. No "Juno 出品".

## 6. Transition plan

**Budget:** 2 hard cuts + 3 match cuts (director §4). Every other hand-over is a continuous camera move inside a take,
or a motivated dissolve or wipe. No dips to black. No type is used twice, except the window rhyme (T20), which repeats
on purpose.

| # | Time | From → to | Type | Motivation |
|---|---|---|---|---|
| T1 | 5.341 | S01 → S02 | paper lift (camera rises with the sheet) | the same object changes hands |
| T2 | 9.913 | S02 → S03 | focus pull through a moving foreground (the lowering paper) | her eye-line |
| T3 | 14.498 | S03 → S04 | dolly-out: the close-up becomes the walking figure | the separation itself |
| **HC1** | **18.657** | S04 → S05 | **hard cut** | bar-11 turn + 「这个人」 |
| **MC1** | **26.970** | S05 → S06 | **match cut** on the spear line and direction, opened as a tear | the hardest hit after silence 1; the thrust |
| T4 | 31.974 | S06 → S07 | colour/shape match dissolve (red flag → red lantern), noon → dusk | same red at the same spot |
| T5 | 35.306 | S07 → S08 | push through the glowing window paper | going in to them |
| T6 | 38.638 | S08 → S09 | motion-follow dissolve (steam → incense smoke) with a tilt up | rising smoke; 「直到那天」 |
| T7 | 50.29 | S11 → S12 | tilt down following the sinking hand | follow the motion |
| T8 | 52.370 | S12 → S13 | foreground wipe (樊楼 pillar) on a truck right | change of place |
| T9 | 55.700 | S13 → S14 | push into the liquid (wine → ink) | betrayal → branding; ink is the film's material |
| T10 | 57.380 | S14 → S15 | eyelid wipe (POV slit) | he opens his eyes on the trap |
| **MC2** | **58.619** | S15 → S16 | **match cut**: accusing sweep → tattoo stroke | the accusation becomes the brand |
| T11 | 60.291 | S16 → S17 | object wipe: the cangue closes inside a pull-back | the sentence |
| T12 | 61.951 | S17 → S18 | world slide: the hall dissolves into the road around him | he stays, the world changes |
| T13 | 64.4 | S18 → S19 | eye-line pan into memory (tint shift) | he looks back |
| T14 | 67.77 | S19 → S20 | position-match dissolve: the father's hand → snow on the same shoulder | the promise is snowed under |
| — | 68.59–77.33 | S20 → S21 | one crane, up then down | geography: depot ↔ temple |
| T15 | 77.748 | S21 → S22 | door-leaf wipe (the door swings to the lens; reverse inside) | he shuts himself in |
| — | 82.34 | S23 | push through the crack into a POV | he looks through it |
| T16 | 86.912 | S23 → S24 | pull back out of the crack to his eye | the voice is recognised |
| **HC2** | **93.565** | S24 → S25 | **hard cut** | the drop after silence 2 |
| T17 | 94.40 | S25 → S26 | diegetic whiteout, then resolve (≥ 1 beat, no flash) | fire and blizzard; hides the killing |
| T18 | 100.241 | S26 → S27 | time-lapse melt in the same frame (snow → water, walker → standing figure) | time passes; 「一拖再拖」 |
| — | 105.22 | S27 → S28 | drift down behind him + rack focus on V32 | the boat arrives |
| **MC3** | **115.217** | S28 → S29 | **match cut**: ink drip → tear (vertical motion) | the words become grief |
| T19 | 116.878 | S29 → S30 | rack focus along the lifted eye-line to the window | what he has lost |
| T20 | 124.783 | S30 → S31 | window-frame dissolve, night → morning (deliberate rhyme with S07) | the windows of his life |
| T21 | 128.534 | S31 → S32 | light bloom: the light pool → the glowing 休书 | the loudest section; memory floods |
| — | 136.03 | S32 → S33 | particle release (the ink lifts off; the paper stays) | the promise flies away |
| T22 | 141.862 | S33 → END | transform: the red palm print → the red J seal | same red, same mark |

The recurring devices do the joining: the 休书 (T1, T2, T21, T22), the hand and fist (T7, T14, S33), ink (T9, MC2, MC3),
windows (T5, T19, T20), doors (T3, T15, HC2).

## 7. Colour script

| Section | Time | Palette (hex) | Warmth (−3 … +3) | Contrast (1–5) | Luma target |
|---|---|---|---|---|---|
| C1 暑日暗室 · 休书 | 0–18.66 | shadow #2A1E17, wood #5A3E2B, paper #F1E4C6 / #D9C29A, daylight #FFF4DC, glare #FAF6EC, ink #17120E, palm print #B3302A, her 褙子 #E7C4C9, convict robe #3B4356, cangue #8A6440 + iron #4B4F55, 封皮 #EFE9DC | +2 inside, white heat outside | 4 | 90–110 |
| C2 墨与印 (title) | 18.66–26.97 | paper #F1E4C6, ink #17120E, seal #B3302A, wash sky #9AA3AD → #C9CED3, emblem #15110E, flecks #FBF7EE | 0 | 5 | ≈ 165 |
| C3 东京春日 · 家 | 26.97–38.64 | haze #F3E2BE, sand #DDBE88 / #B8925E, wall #B2402E, tiles #4F5A63, flags #C8372D, robe #2F6B52 / #22513E; dusk #E9B07A → #6B5A7E, window #FFC56E, lantern #D8432F, lamp #F2B05A, table #6B4A30, steam #FFF3DD | **+3** (the warmest) | 2–3 | 140 day, 100 dusk |
| C4 岳庙 | 38.64–52.37 | haze #EAD9B6, temple red #A8382C, gilt #D2A24C, stone #B8AE9C, crowd #7E6E60, 高衙内 #7A3A5A, flower #E88AA8 → **drain at 45.71** (sat −35 %, haze #CFC6B2) | +2 → 0 | 3 → 4 | 130 → 85 |
| C5 樊楼 · 白虎堂 | 52.37–62.37 | lantern #E39A45, shadow #241A1F, 陆谦 #4A3E63, form shadow #2B2236; ink #0F0D10; hall #1D232D / #3D4A5C, cold key #A9C1D9, tiger screen #D8DCE0, plaque #141518 + gold #C9A45C, tattoo #2A3A55, shaft #C7D6E4 | +1 → −2 | 4–5 | 90 → 70 |
| C6 离京 · 记忆 | 62.37–68.59 | white sky #F4EEDF, dust #D8C7A0, earth #A8957A, wall #9C9488, willow #8E9A6C; memory sepia #C9A27A + #E8B77A; first snow #FFFFFF | +1 | 2 | 150 → 115 |
| C7 沧州雪 | 68.59–79.83 | snow #EEF2F5 / #A9B7C6, sky #9AA6B2 → #5C6B80 → #2C3A50, ink hills #4E5A68 / #34404E, fodder #A08A64 / #6E5D41, temple #5B4E44 / #2A2420, crack light #6F8DB5, hat #DDD6CA, cloak #8D6B4F, gourd #C08A45 | −2 → −3 | 2 → 3 | 140 → 70 |
| C8 火 | 79.83–93.57 | fire #FFE3A3 / #FF7A2E / #E04A1F, smoke #3A2A2A, crack #FF8A3D, cold fill #3B4F73; silence frame #0B0B10 + slit #FF8A3D | split: fire +3 vs night −3 | **5** | 55 → 28 (S24 only) |
| C9 雪夜上梁山 | 93.57–100.24 | white #FFFFFF → #DDE6EE, shade #8FA3B8, sky #3E4C60 → #6F8399, mountains #2E3846, figure #1E2430, rim #CFE0EE, gourd #C08A45, far fire #E07A3A at 25 % | −2, one warm point | 3 | ≥ 95 |
| C10 梁山泊 · 悲 | 100.24–124.78 | water #7E9A9A, mist #E3E7E2, sky #C9D2D1, reeds #6E8F5A → #C9A25A → #E6E8E6 → #8FB07A, pier #6B5E4F; news: sat ≤ 25 %; calligraphy #15110E; skin #E3CDBE, fill #9AA6B2, tear #EAF6FF; night paper #3A4250 → hollow lantern #E8A04A | −1 → −2 (pale) | 1–2 | 150 → 85 → 100 |
| C11 余烬 | 124.78–148.5 | ash #6E6458, plaster #A89C88, shadow #3A332C, dust #E8D9B8, pagoda #5A5A5E; aged paper #D9C9A3, ink #2A221B, promise #1A1410 + gold #C9A45C, night #1A1D24 / #2A2E38, print #B3302A + bloom #E0503E, fist haze #E3D3B5; end card ink #14110E, gold #E2B865 | −1; red is the only warmth | 3 | 100 → 85 → end card |

How it tracks the emotion: the warmest and softest frames are the life he had (C3). Warmth drains at the moment of
recognition (45.71) and contrast hardens through the frame-up (C5). The road and the memory hold a brief, false warmth
(C6). Snow takes the colour out (C7). The fire is the only saturated red and the hardest contrast; it collapses into
the film's one dark frame for the silence (C8). After the drop everything is pale and cool (C9–C10), warm only as
hollow light on paper (the banquet). The end is muted ash and paper, and the last warmth is the red of his own palm
print, carried into the J seal (C11).

## 8. Effects timing (master list)

| Time | Frame | Shot | Effect |
|---|---|---|---|
| 0.337 | 10 | S01 | brush flick, 3 ink spatter dots |
| 2.833 | 85 | S01 | red palm print pressed (squash 3 f, shake 2 f, paper and hand only) |
| 3.68 | 110 | S01 | lift; print edges soak 2 px over 10 f |
| 7.838 | 235 | S02 | tear lands on 「休」; ink bloom r 0 → 85 px over 36 f |
| 8.673 | 260 | S02 | crumple lines from the grips |
| 12.828 | 385 | S03 | his tear spills and rolls (25 f) |
| 14.5–18.6 | 435–558 | S04 | heat shimmer, step dust (summer, no snow) |
| 18.657–20.329 | 560–610 | S05 | 林冲 brushed; tear drops become the 冫 dots at 19.911 and 20.120 |
| 22.814 | 684 | S05 | seal stamp (scale 1.25 → 1, 4 f) |
| 25.45–26.90 | 763–807 | S05 | picture pause: flecks at 10 % speed |
| 26.970 | 809 | S05 → S06 | paper tear along the spear line (6 f) |
| 26.97 / 30.314 / 31.138 | 809 / 909 / 934 | S06 | dust bursts |
| 36.978 | 1109 | S08 | steam ribbons twine |
| 38.22–38.64 | 1147–1159 | S08 → S09 | steam → incense dissolve |
| 42.793 | 1284 | S10 | spin smear (2 f) |
| 45.712 → 47.0 | 1371 → 1410 | S11 | grade drain, sat −35 % |
| 53.626 | 1609 | S13 | form shadow slides across 陆谦's face (16 f) |
| 55.30–55.70 | 1659–1671 | S13 → S14 | wine → ink |
| 58.619 / 59.036 / 59.452 | 1759 / 1771 / 1784 | S16 | tattoo marks bloom |
| 60.291 | 1809 | S16 → S17 | cangue clamps |
| 66.955 | 2009 | S19 | **first snow** (into the memory) |
| 67.77–68.59 | 2033–2058 | S19 → S20 | hand fades; snow builds on the shoulder |
| 72.750 | 2183 | S20 | gust, snow ×3, slant 25° |
| 76.077 | 2282 | S21 | roof collapse, snow puff |
| 78.588 | 2358 | S22 | stone meets the door |
| 79.830 | 2395 | S23 | **fire** flares through the crack (first fire of the film) |
| 79.83–92.05 | 2395–2762 | S23–S24 | crack-light flicker 8–12 Hz ±15 % (±8 % in S24) |
| 86.91–88.57 | 2607–2657 | S24 | letterbox slides in (138 px) |
| 91.070 | 2732 | S24 | pupils narrow |
| 92.05–93.565 | 2762–2807 | S24 | dead still (flicker ±2 %) |
| 93.565–94.40 | 2807–2832 | S25 | doors open; whiteout ramp (25 f) |
| 94.82–95.24 | 2845–2857 | S25 → S26 | white resolves into the blizzard |
| 95.24–100.2 | 2857–3006 | S26 | blizzard, footprints that stay |
| 99.82–100.24 | 2995–3007 | S26 → S27 | snow melts to water, reeds rise |
| 101.889 / 103.561 / 103.98 / 104.39 / 104.80 | 3057 / 3107 / 3119 / 3132 / 3144 | S27 | season flips |
| 109.813 | 3294 | S28 | rack focus to him |
| 112.72–113.96 | 3382–3419 | S28 | 已故半载 brushed, one character per beat |
| 114.38–115.20 | 3431–3456 | S28 | the drip |
| 115.22–116.04 | 3457–3481 | S29 | his tear rolls |
| 120.210 | 3606 | S30 | lantern bloom in the window paper |
| 128.534 | 3856 | S31 → S32 | light pool → glowing 休书 |
| 128.53–131.87 | 3856–3956 | S32 | five images converge into the paper |
| 133.538–135.62 | 4006–4069 | S32 | 依旧夫妻完聚 brushed, one character per beat |
| 136.03–136.87 | 4081–4106 | S32 | ink lifts off as motes and snow; the print glows |
| 141.862 | 4256 | S33 → END | print → J seal stamp |

## 9. New expressions and rig work (keep the existing face; add parameters only)

| Name | Parameters (manhua.mjs) | Used in |
|---|---|---|
| 隐忍 + wet | 隐忍, plus `rim` 0.4 (lower-lid red #E89A86) and a second specular dot | S03 |
| 温 | brow +0.1, eye 0.95, mouth +0.35 | (shadow only; spare) |
| 惊认 | brow +0.4, eye 1.15, mouth −0.2, open 0.12 | S11, S24 (small) |
| 闭目忍 | brow −0.5, eye 0 (needs a closed-lid curve with a lash line, not a collapsed shape), mouth −0.4, jaw 1 | S14 |
| 低眉 (bow) | brow +0.2, eye 0.6, look [0, 0.8], mouth −0.3; head pitch −30° | S17 |
| 决 | brow −0.85 flat (no inner raise), eye 1.0, mouth −0.5, open 0, jaw 1 | S24 |
| side() jaw | masseter bulge line + pressed lips in profile | S12 |
| 高衙内 smirk | new `smirkL/smirkR` mouth corners (+0.7 / +0.2), brow +0.3, eye 0.7 | S10, S11 |
| 陆谦 笑里藏刀 | mouth +0.5, eye 0.8, look at the camera; soft form shadow (not `shade: 'half'`) | S13 |
| 张教头 慈 | brow +0.3, eye 0.85, mouth +0.15; grey beard and crow's feet (new face variant) | S19 |

Rig fixes come first (director notes 1–3, 7–9; model_sheet §2–3): the neck drawn before the coat and extended with no
bottom stroke; busts to ≥ 1.6 H below the chin; profile skull +75 units at the back; shoulders 1.95 H; arms with joints
from the shoulder pivot, IK-solved; hands per the model sheet; the long-board 团头 cangue; the 毡笠 silhouette on the
manhua `side()` head.

## 10. Sound cues (one quiet family, ≥ 10 dB under the music except the door)

Brush flick 0.337 · palm press 2.833 · paper rustle 4.5 and 8.67 · cicadas 14.5–18.66 (cut on HC1) and 62.0–66.96 ·
brush whisks on the title strokes · seal 22.814 · paper rip 26.970 (inside the hit) · stamp 30.314 · tea pour 35.7 ·
pour 54.46 · cangue clack 60.291 · wind bed from 67 · roof collapse 76.077 · stone scrape and thud 77.9–78.588 · fire
bed 79.83 → **cut at 92.05 with the music** · stone scrape pre-lap 93.25 · **door burst and wind 93.565** (the one loud
SFX) · water lap 100–125 · promise brush whisks 133.5–135.6 · release breath 136.03 · seal 141.862. The editor owns the
final mix (owner rows 37, 57–61).

## 11. Open items for the producer

1. **Owner taste calls:** (a) the wife's face stays withheld (the producer's brief; the director had suggested
   showing it in S07/S08); (b) subtitles in the sans standard or a deliberate serif (the owner preferred serif on ep35);
   (c) simplified or traditional characters on the 休书 (simplified planned); (d) the optional gold 「依旧夫妻完聚」 on
   the paper in S19; (e) hat brim 40 cm (rig-matched) or 50 cm (more iconic), model_sheet §9.
2. **Retimes** in §2 (V27, V33, V34, V35, V37, V38; V01 subtitle on frame 0) need the editor's OK once the voice is
   recorded.
3. **The title's snow** is a non-diegetic emblem (the 沧州 silhouette, flash-forward); the first diegetic snow is 66.955.
   If the owner reads it as "snow at the farewell", replace the wash sky with plain paper.
4. **Researcher:** the costume rows (director note 28d: 抓角儿头巾, 脑后白玉圈, 绿罗战袍, 毡笠) are still design
   choices. The 山神庙 interior is kept generic (altar and a dim statue).
5. **Order of work** (director, owner row 75): rig fixes → send the owner 3 corrected stills (**S06** full body, **S10**
   two-shot, **S29** bust) and wait for his OK → board stills per take → gate 3 → animation.
6. The music file was missing at `/dev/shm/shz01/music/bgm.mp3`. I copied the attachment whose title tag is 笛子戏
   (148.506 s) there and wrote the measured grid to `/dev/shm/shz01/music/beats.json`. Nothing is committed.
