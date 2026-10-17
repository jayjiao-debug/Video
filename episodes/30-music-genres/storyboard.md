# Storyboard: 同一段旋律，8种曲风 (ep30) · look A 鼓机面板 · gate 2b r1

Sources: script.md round 2 (43 lines, 147.53 s), lines.json, the rendered soundtrack `music/曲风_配乐_v1.m4a` and its hit list `build/events30.json`, notes_gate2a_r1.md (notes 2–6), coldread_gate2a.md.
Medium: **2D only.** Remotion + SVG React components. No CSS 3D, no three.js, no canvas needed. One faceplate world; the camera is a 2D transform (translate/scale) of the faceplate group.

## Look
- **World:** the faceplate of one generic drum machine, seen straight on. The camera travels across it: the faceplate is wider than the frame, with a **TEMPO knob** off-frame left and the label column, pads, VFD and clue keys in the default frame.
  - Hits are **light**: backlit rubber pads glow and spill their colour onto the brushed graphite.
  - The machine's dark lower bezel is the subtitle strip.
- **Palette:**
  - Graphite panel #45484E → #303236, bezel #26272A → #1A1B1D, pad (off) #5E6168 → #4A4D53, pad well #1E1F22, silkscreen #ECE5D3.
  - One fixed colour per row for the whole film: 动 #FF6A2B · 打 #FFCF3A · 次 #6EF0CC · 招牌 #FF5AA5.
  - VFD glass #0E2420 with mint text #A6FFE4 (dim label #5FAF98); step LED #FF3B30; clue-key LED #FFB23E / #FFE2A6.
  - Gold #F5C76A only in subtitles and the Juno end card.
  - Lo-fi warms the panel by a +8 % amber overlay; metal saturates the glow. No other palette changes.
- **Type:**
  - Noto Sans CJK SC Black for the syllables (88 px), beat numbers (62 / lit 72), VFD tag (84), the title (132) and every label.
  - Noto Sans CJK SC Medium/Bold for the tags.
  - Cormorant Garamond only inside the engine end card (the J monogram).
- **Texture / light:**
  - The brushed texture is static (feTurbulence, baked once into a PNG for speed) and the grain is fine.
  - Every lit pad has its own bloom (blur 18) plus a colour spill on the panel around it; the sounding pad gets a hot white core.
  - Panel mean luma ≥ 70 at every frame (stills checked: 72–73). Size filter regions so no glow clips at a pad or frame edge (row 18).
- **Motifs:** the pad matrix doubles as a **low-res light display** that draws the everyday pictures (footprints, hop arcs, staircase, strings, zipper, chord dots), and each drawing resolves back into the rhythm it explains. Other motifs: the VFD split-flap, and the red step LED as the playhead.
- **Must NOT look like:**
  - a real branded machine (no 808-style red→orange→yellow→white key run, no MPC/Push layout or logos, no model numbers);
  - a neon club or cyberpunk;
  - flat game-UI tiles (pads must read as light);
  - a slideshow (no header + figure + caption layout; something always plays);
  - the navy-night family, B's record or C's notebook.

## Engine layer (unchanged from the series)
- **Subtitle:** boxless, white, Noto Sans CJK SC 900, 64 px, gold key words ([ ]), soft dark edge + feathered shade, centred, text in y 846–940 (band 820–960) on the bezel.
- **Corner mark:** `Juno · VIBE知识大赏`, top-right (right 58, top 36), 24 px, 0.32em tracking.
- **Top-left** (x < 480, y < 170) stays clear.
- **End card:** Juno end card (J monogram, gold title, question, follow pill `关注 Juno · 一起看懂世界`, sources) with a new motif `pads` (see 139.0).

## How the grid is driven (build contract)
- **Playhead:** every segment has its own bar clock from `segs` (t0, bar). The playhead step is `floor(((t - t0) / bar) * 16) % 16`. The red step LED over that column is the playhead; there is no sweeping bar.
- **A hit:** the pad jumps to full on the event's frame (no ease-in), holds 2 frames, then decays (`exp(-dt/0.22 s)`) to "afterglow" (0.88 of its colour for the rest of the bar, ×dim).
- **A new bar:** clears the afterglow on its downbeat, so the pads always show **this bar so far**. There are no ghost/outline cells for future hits (cold read: outlines were unreadable).
- **True time:** every row has a 4 px LED line along its bottom edge. It shows a dot at the event's exact time inside the bar, so swing and rolls are visible even though pads are on a 16-step grid. Most of the time it is only an accent; in jazz, lo-fi and the l.16 comparison it becomes the hero (see scenes).
- **One hero per line (note 2):** the elements the line talks about are at 100 %. All other pads, labels and side elements drop to **30 %** over 6 frames at the line start. The table below names the hero for every line.
- **Clue keys:** they live as **4 small LEDs on the bezel** (x 1622–1826, y 806). They rise to full keys in the context row (y 660–780) only when a clue unlocks, during the quiz, and in the recap. Unlocks are **one at a time**, each on its own downbeat.

| `events30.json` row | Drawn as |
|---|---|
| K | 动 row pad at `step` (v → brightness; v 0.75 = 80 %) |
| S | 打 row pad at `step`; fills/rolls with no `step` light the 打 pad under the playhead |
| H | 次 row pad at `step`. Several H in one step (trap rolls) split that pad into 2 / 4 / 8 vertical slivers (the zipper). |
| G | 招牌 row pad at `step` (decay per genre, below) |
| X | rock / metal: crash → a 10-frame bloom behind the VFD only (the frame never pulses, row 54). jazz / recap: the ride, drawn on the 招牌 LED strip in true time. |
| T | the beat number over the playhead lights (62 → 72 px, white) for 0.15 s; the tick of the bed and reggae |
| V | lo-fi crackle: one random pad flickers at 15 % for 2 frames, plus a speck crossing the VFD |
| MUD / CLEAN | metal chord display (scene 11) |
| COUNT | VFD shows 3 · 2 · 1 (quiz) |
| SCAN | the hook window (scene 0) |
| B | heard only (jazz walking bass); not drawn, to keep one hero |
| `mel` | melody overlay in the theme scenes; 招牌 flashes where the table below says |

**招牌 row source and label per genre** (label in the VFD-style screen, 56 px; tag "招牌声" 40 px above it, always visible):

| Genre | Label | Source | Pad behaviour |
|---|---|---|---|
| 摇滚 | 电吉他 | G (bar chords) + `mel` | chord sustains its bar at 70 %; lead notes flash on top |
| House | 合成器 | `mel` | the whole row ducks to 40 % on every K (the pump) |
| 爵士 | 叮叮镲 | X | the row fuses into one LED strip; X dots in true time |
| Lo-fi | 黑胶 | V | the strip shows dust specks |
| 雷鬼 / quiz | 吉他嚓 / ？ | G | very short: full 3 frames, gone by 0.1 s, with a 嚓 stamp (64 px) above the pad from l.22 on |
| 波萨诺瓦 | 尼龙吉他 | G | via the strings (scene 9) |
| Trap | 808 | K | a long 1.2 s light trail along the row |
| 金属 | 失真吉他 | MUD / CLEAN + `mel` | oscilloscope (scene 11) |

**Label sizes** (all ≥ the brief's floor):

| Element | Size |
|---|---|
| Syllables 动/打/次 | 88 px |
| Beat numbers | 62 px, lit 72 |
| VFD tag | 84 px |
| Big numbers (0.25秒, 54 %, 120) | 96–110 px |
| 招牌 label | 56 px |
| 走路 | 56 px |
| Clue-key labels | 52 px |
| Answer keys | 58 px |
| Bar labels (猜对 / 瞎猜 / 学过 / 没学过) | 52 px |
| Tags (底鼓/军鼓/踩镲, 招牌声, 曲风, 慢/快, 5种曲风里选, 差一点) | 40–42 px |
| Syllable pops | 92–104 px |

The drum tags 底鼓/军鼓/踩镲 are on from frame 0 (cold read: "次打动" read as a word without them).

**Layout (default framing, 1920×1080):**

| Element | Position |
|---|---|
| VFD | x 600–1320, y 28–132 |
| Beat numbers | baseline y 212, over steps 1/5/9/13 |
| Step LEDs | y 234 |
| Pad rows (top → bottom) | 招牌 258, 次 366, 打 456, 动 546, each 84 high; pads 74 wide, step pitch 89.9, extra 24 px between beats; grid x 330–1840 |
| Label column | x 52–310 |
| Context row | y 660–780 (meter / keys / answers / bar labels) |
| Bezel | from y 792 |
| Off-frame | TEMPO knob at faceplate x −420…−60, y 300–700 (a big knob ring with 慢 … 走路 … 快 printed round it) |

## Scenes
Times in seconds. "Hero" = what is at 100 %; everything else at 30 %.

| Scene | Time | Shot (framing, camera move) | Key visual / hero per line | Text placement | Motion beats (from events30.json) | Transition OUT (motivated by…) | Sound cues |
|---|---|---|---|---|---|---|---|
| **0 Hook scan** | 0.00–2.60 (l.1) | Default framing, static. Frame 0 is already lit. | **The 0.25 s window:** a mint frame 2 steps wide (0.25 s at 120 bpm) over the full grid height. Inside it the pads play the snippet's genre at 100 %; outside they hold the rest of that genre's bar at 30 %. Under the window: bracket + "0.25秒" 104 px mint. Syllables rise out of their own lit pads to the right of the window, joined by a light streak. | VFD tag; 0.25秒 in the context row under the window; subtitle l.1 on frame 0 | SCAN 0.0, 0.5 … 3.5: on each, the window jumps to that beat (steps 1-2, 5-6, 9-10, 13-14), the VFD split-flaps to the genre (摇滚 爵士 House 雷鬼 Trap 金属 Lo-fi 波萨诺瓦) and the 招牌 label flips with it. | → l.2: the window halves to 1 step on 2.60 (a halving: two halves slide together), relabelled "0.125秒". | 8 snippets on the beats; soft ticks between |
| **1 The numbers** | 2.60–8.00 (l.2–3) | Static. | l.2: the 1-step window, then **two pad columns (steps 7 and 10) become light bars** rising from the 动 row (100 % = 600 px): 猜对 54 % (324 px, mint) and 瞎猜 20 % (120 px, graphite-white), drawn to scale. "54%" / "20%" 72 px on the bar tops; 猜对 / 瞎猜 52 px and the tag "5种曲风里选" 40 px in the context row. l.3: the 猜对 bar **splits** into two equal bars 学过 / 没学过 (no numbers); 瞎猜 dims. | context row | 3.5 the window's column stretches up into the 猜对 bar (it IS the 0.125 s column); 4.0 瞎猜 rises; 5.30 split on the downbeat. Bed K glows the 动 row softly underneath (30 %). | → l.4: on 8.00 the bars **drain** back down into their pads (the light pours into the grid). | pulse b1–b2 |
| **2 The question** | 8.00–13.50 (l.4–5) | Static. | l.4: the empty grid plays the bed (ticks on beat numbers, sub-动 on 1 and 3); a **"？" 260 px in VFD mint** stands over the centre of the grid. l.5: the "？" breaks into 4 sparks that fall to the context row and become **4 locked clue keys** (graphite, padlock, LED off, labels hidden as "？"). | ？ centred on the grid; keys in the context row | T on every beat; K 8, 9, 10…; 10.90 the "？" splits on the downbeat; keys land on 11.0, 11.5, 12.0, 12.5 (one per beat). | → l.6: the keys sink into the bezel and become the 4 dark LEDs (12.9–13.5). | + bass |
| **3 The deck** | 13.50–16.10 (l.6) | Static. | **The 招牌 label screen fans into a deck of 8 flaps** (the 8 genre names, 40 % grey, each 56 px), fanned up over the label column; the VFD reads "8种". | label column | H 8ths from 12.0 light the 次 row at 30 %; the snare roll 15.0–15.9 flickers the 打 pad under the playhead. | → l.7: the deck shuffles down into one blank flap on 16.00. | + 次, pad, riser |
| **4 The theme** | 16.00–20.00 (l.7 + charge) | Static. | **Melody overlay:** all pads drop to 15 %. The 9 theme notes (`mel`, seg theme) light as round mint dots over the matrix: x = time over the 2 bars (one step column = one 8th), y = pitch (E5 top row … G4 under the 动 row, half-row steps), joined by a thin line. A dashed outline (the **template**) stays where the dots were. | overlay on the grid | Each `mel` note lights its dot on its time (16.0 … 19.5). 19.0–20.0 (reverse cymbal): **gather**, the pads charge from both edges toward the centre, brightness 15 → 60 %. | → title: on **20.00** every pad fires at once in its row colour (no white flash), and the VFD slams. | FM e-piano theme; reverse swell |
| **5 TITLE** | 20.00–22.00 | Static; the VFD grows. | **Title from the panel's light:** on 20.00 the VFD stretches to x 260–1660, y 40–250, and 《同一段旋律，8种曲风》 slams in. It is VFD mint, Noto Sans CJK SC Black 132 px, with VFD scan lines, scale 1.25 → 1.0 in 5 frames plus a short damped jolt, no flash (rows 84, 90). Below it the whole matrix plays the full rock band at 70 %; under the title, 8 small pads light one per beat across bar 1, each in a row colour. | title in the grown VFD | X crash 20.0 = bloom behind the VFD; K/S/H/G rock b1. | → rock: on 22.00 the VFD **folds back into its slot**, the title condenses into "摇滚", and only the drums stay lit. | **DROP** (largest step-up) |
| **6 Rock** | 22.00–32.00 (listen bar, l.8–10) | Static, default framing. | 22–24 (listen): each drum hit pops its syllable out of its pad (动 · 次 · 打 · 次). l.8: the 4 syllables chase across the grid in time (hero: 动/次/打 rows). l.9: each row's syllable label glows as it sounds; the tags 底鼓/军鼓/踩镲 brighten in turn (hero: the label column). l.10: the 动 pads under beats 1 and 3 and the 打 pads under 2 and 4 flash, and beat numbers 1/3 turn orange and 2/4 yellow (hero: those 4 columns). **30.00: slot 1 unlocks**: its key rises from the bezel to the context row, LED on, label "鼓点在哪拍"; it holds 1 bar, then sinks back to its LED (now lit). | pops beside their pads; key in the context row | rock K 1, 9 · S 5, 13 · H 8ths; b4 + bass; b6 full band 30.0 (X bloom). | → House: **split-flap + re-light wave**. Rock's beat-number colouring clears on the last beat (31.5); on 32.00 the VFD flips to "House" and the new pattern lights in a wave rippling outward from the playhead column. | rock drums → full band |
| **7 House** | 32.00–41.68 (listen bar, l.11–13) | Static. | 32–34 (listen): 动 on every beat + 次 off-beats. l.11: **the 动 row lights on all 4 beats**; each 动 pad shows a **footprint** drawn in its light (left/right alternating) (hero: 动 row). l.12: the footprints step along the 动 row in sync, and the **tempo strip** rises into the context row: 慢 … 快 scale, needle on the **走路** mark with "≈120" (走路 56 px, 120 96 px) (hero: footprints + needle). l.13: the needle sits on 120; the 招牌 (合成器) row pumps, dimming on every 动 (hero: needle + pump). | tempo strip in the context row | House K every beat (from `segs.house.kicks`); S 5, 13; H off-beats; synth `mel` from b3. | → Jazz: **the backbeat switches off**. In bar 5 the 打 (clap) pads go dark one by one behind the playhead and the tempo strip sinks; on 41.68 the 招牌 pads **fuse into one LED strip** (the ride) and the camera eases in 6 % toward it (scale 1.0 → 1.06 over 1 bar, origin the 招牌 row). | house → jazz fill |
| **8 Jazz** | 41.68–51.68 (listen bar, l.14–16) | Push-in held at 1.06, then out to 1.0 at 49.2. | 41.7–43.7 (listen): the ride strip shows the X dots in true time; 叮 / 叮哒 (64 px) pop over the dots in sync. l.14: **each beat pair splits into long gap + short gap** on the strip (hero: the strip). l.15: **hop arcs** join consecutive ride dots (long hop, short hop), so the picture is the kid hopping (hero: the arcs). l.16: the 次 row also becomes a strip and replays rock's straight 8ths (直, evenly spaced) above jazz's long-short (摇摆), with a ruler of ticks between; labels 直 / 摇摆 52 px at the strips' left. **49.68: slot 2 unlocks** ("直·摇摆"). | 叮/叮哒 pops over the strip; 直/摇摆 labels | X at 0, 4, 6⅔ … (true times); H hat foot on 2, 4 (dim); the walking bass is heard only. | → Lo-fi: **camera pans left 380 px to the TEMPO knob.** On the jazz fill (S 51.18–51.51) the knob turns down from 走路 to the slow side, and the panel warms (amber overlay rises). On 51.68 the camera pans back across the grid with the lo-fi b1 (1 bar, ease-in-out). Strip labels leave on 51.18 before the pan. | jazz fill → lo-fi crackle |
| **9 Lo-fi** | 51.68–63.99 (listen bar, l.17–19) | Pan back from the knob (51.68–54.75), then default framing. | 51.7–54.8 (listen): loose drums, crackle; the grid tints warm. l.17: the **tempo strip** returns, needle well left of 走路 with "约70–80" (96 px) (hero: needle). l.18: footprints on the 动 row slow to a stroll; drum pads light **blurred and wobbly** (±5 px jitter, softer bloom) (hero: footprints). **57.84: slot 3 unlocks** ("快·慢"). l.19: the 招牌 row becomes **黑胶**; V events = dust specks crackling across the row and the VFD (hero: the 招牌 row). **60.91: slot 4 unlocks** ("招牌声"). | strip / tags | lofi K 1, (8), 11 · S 5, 13 · H swung · V crackle. | → Reggae: **the first missing kick.** On 63.99 the playhead reaches step 1 and the 动 pad there **lifts out of its socket** (rubber pad rises 12 px, slides down and fades), leaving an empty socket. The warm overlay drains, and the camera pushes 8 % toward column 1 (origin top-left, so the VFD stays whole). The 黑胶 label leaves first (63.5). | lo-fi → reggae |
| **10 Reggae** | 63.99–76.29 (listen bar, l.20–22) | Push 1.08 toward column 1 (style frame `storyA_reggae.png`). | 64.0–67.1 (listen): T ticks light **beat numbers 1-2-3-4 at equal brightness**; the empty socket pulses on 1. l.20: **beat 1 is the hero**: the empty pad with a dashed ring + "空" 60 px, beat number 1 at 72 px, the playhead LED; beat 3's 动/打 at 30 % until l.21. l.21: **staircase**: the matrix draws 4 steps going down left to right (beat 1 = top row, … beat 4 = 动 row). Step 1 is missing (dashed); a footprint drops through it and lands on the beat-3 step with the 动 hit, then the stairs dissolve back into the pattern (hero: the stairs). l.22: the 招牌 row (吉他嚓) lights very short on beats 2 and 4, each with a **嚓** stamp 64 px (hero: 招牌 row). | 空 in the pad; 嚓 stamps above the 招牌 pads | reggae K + S on step 9 only; H swung without step 1; T on all beats (b1–2); G skank from 70.91. | → Quiz: **VFD scramble.** On beat 4 of 76.0 the stamps and 空 leave. On 76.29 the camera pulls back to 1.0, the VFD scrambles through random glyphs to "？", and the 招牌 label scrambles to "？". | reggae → quiz steppers |
| **11 Quiz** | 76.29–91.29 (l.23–27) | Default framing (style frame `storyA_quiz.png`). | l.23: **the lure, 动 on every beat**, is the hero. The 4 bezel LEDs rise as one "线索 4/4" key (left of the context row), and 3 **answer keys** rise: A House · B 雷鬼 · C 摇滚 (58 px). l.24: VFD **3 · 2 · 1** (200 px) on COUNT 80.04 / 80.79 / 81.54. l.25: **82.29 reveal**: key B lights mint and "雷鬼" flips onto the VFD; key A shakes once with the tag "差一点" (40 px). l.26: the real tells light: the tempo strip pops up (needle left of 走路) and the 嚓 stamps return on the 招牌 row (hero: those two). l.27: slot 1's key alone lights, then flickers ✗ (red #FF3B30); then all 4 light together. | answer keys + clue key in the context row | quiz K every beat; G skank 5, 13; S rim 9; COUNT; reveal on the bar 3 downbeat. | → Bossa: **the kit unplugs.** On the fill (S 90.54–91.10) the drum rows go dark from the top down and the answer keys sink. On 91.29 six thin **nylon strings** draw across the grid from left to right with the first strum. | quiz → bossa |
| **12 Bossa nova** | 91.29–100.52 (listen bar, l.28–29) | Static; light softens (bloom × 0.6, lower contrast). | 91.3–93.1 (listen): strings vibrate on each G. l.28: **no kit, but the drum rows still light**, fed by the strings (hero: the strings). l.29: the **low string (thumb)** is wired into the 动 row and lights its pads on K (bossa thumb bass 1, 9); the **high strings (fingers)** are wired into the 打/次 rows, lit on G. Wires are drawn as light runs from string to pad (hero: wires + pads). **96.83: slot 1 badge** "吉他也能打鼓点" (40 px) on its LED/key. No hand. | badge on the slot-1 key | bossa G 1, 4, 7, 11, 14; K 1, 9. | → Trap: **the thumb string snaps into the 808.** On 100.52 the low string tightens and whips down into the 动 row, becoming the 808's long light trail; the other strings retract to the left; contrast snaps back to full. | bossa → trap |
| **13 Trap** | 100.52–110.81 (listen bar, l.30–32) | 105.02: push-in 1.0 → 1.12 onto the 次 row (origin row centre), held to 107.38, then back out. No sideways sweep (row 67). | 100.5–102.2 (listen): the full trap kit. l.30: **the 打 row has one lit pad per bar (step 9)**, with long dark stretches either side (hero: 打 row). l.31: **zipper**: the 次 row pads split into 2 → 4 → 8 slivers as the rolls densify, and a bright slider tab runs along the row on each roll (hero: 次 row). l.32: **two needles**: the tempo strip rises with one needle far right ("跟着次", tag 40 px) and one far left ("跟着打"). **107.38: slot 3 badge "又快又慢"** (52 px). | strip with two needles; badge | trap H 8ths + rolls (multi-H per step); S step 9; K with 808 trail on the 招牌 row (label 808). | → Metal: **the 招牌 screen grows into an oscilloscope.** On the last beat the 动 row fills left to right with the double kick; on 110.81 the 招牌 label screen stretches across the whole 招牌 row into a VFD oscilloscope showing the guitar waveform. | trap → metal crash |
| **14 Metal** | 110.81–122.81 (listen bars, l.33–35) | Static; glow saturation +20 %, pad blooms slightly fuzzy (displacement on the glow only). | 110.8–113.8 (listen): double kick fills the 动 row in 16ths. l.33: the scope wave turns **jagged** (弄脏), and the tempo strip needle jumps far right (no number) (hero: the scope). l.34: on MUD 116.81 / 118.31 / 119.06 the scope shows a chord as **5 coloured dots** that smear into one grey blob (hero: the dots). l.35: on CLEAN 119.81 / 121.31 / 122.06 only **2 crisp heavy dots** remain. **119.81: slot 4 badge "为什么？" → 2 dots.** | scope across the 招牌 row; badge | metal K 16ths; S 5, 13; X crash every 2 bars (VFD bloom); MUD / CLEAN. | → Theme 2: **the choke + pull-back.** On the last beat everything cuts dark at once (the choke). The camera pulls back 1.0 → 0.94 over the next bar, showing the whole faceplate with a margin, and the melody dots light inside the template. | metal choke → e-piano |
| **15 Theme 2** | 122.81–128.81 (l.36–37) | Pull-back held at 0.94, then back to 1.0 by 128.8. | l.36: **the 9 melody dots land inside the template outline from 0:16**, a perfect fit, while the VFD flips through all 8 genre names, one per beat (8 beats = 2 bars) (hero: dots + VFD). l.37: the 4 bezel LEDs rise into 4 full **clue keys** (the checklist); a small "最后一题" tag (40 px) waits dim at the VFD's right end. | keys in the context row | theme2 `mel`; T ticks; S fill at the end. | → Recap: the keys stay up; each recap bar is triggered by **pressing its key** (key travels 6 px down, LED flares). | e-piano → recap |
| **16 Recap** | 128.81–138.96 (l.38–41) | Static. | Each line: **its key at 100 %**, the other keys at 30 %, and the grid replaying that bar's events. l.38: rock 动/打 on their beats. l.39: the jazz ride strip, long-short. l.40: the tempo strip, needle left of 走路. l.41: the reggae empty socket + the 嚓 stamp. | keys + whatever the bar needs | recap K/S/H/X/G, each entering on its own downbeat. | → End card: **the machine becomes the motif.** On 138.96 the matrix shrinks (scale 1 → 0.30) into the end-card motif slot (centre 960, 556) while the end-card scrim and monogram build round it. It keeps playing. | recap → bonus |
| **17 End card** | 138.96–147.53 (l.42–43) | Engine EndCard. | Motif `pads`: a mini 4×16 matrix (560×150) in the 4 row colours playing the bonus clip from events (seg bonus), VFD-mini tag "？", 4 lit clue LEDs beside it (the tool). Gold title 《同一段旋律，8种曲风》 (engine GoldTitle); question **最后一题：这段是什么曲风？** with the ？ optical fix (row 89); follow pill; sources line. | engine positions; subtitles l.42–43 in the band | bonus K/S/H (zipper slivers again). | Fade over the final bar to the downbeat (engine). | Trap-in-disguise; final-bar fade |

## The everyday pictures, drawn on the pads (note 6)
| Line | Drawing | Resolves into |
|---|---|---|
| l.11–12 走路 | a footprint inside each lit 动 pad, L/R alternating, stepping on the beat | the 4-on-the-floor 动 row |
| l.15 蹦蹦跳跳 | hop arcs between ride dots: long, short | the swing strip |
| l.18 懒懒散散 | slower footprints; wobbly, blurred pads | the lo-fi pattern |
| l.19 沙沙 | dust specks on the 招牌 row + VFD | crackle stays as texture |
| l.21 下楼梯踩空 | 4 steps down the matrix, step 1 missing, a footprint falls to step 3 | the one-drop on 3 |
| l.22 嚓、嚓 | short flashes + 嚓 stamps | skank on 2 and 4 |
| l.29 拇指 / 手指 | strings wired into the 动 / 打·次 rows | the bossa pattern |
| l.31 拉拉链 | 次 pads split into slivers, a slider tab runs along the row | trap hat rolls |
| l.34–35 糊成一团 | 5 chord dots smear grey → 2 crisp dots | the clean power chord |

## Transitions (all different, all motivated; outgoing labels/tags/badges leave on the beat before the move)
1. 2.60 window halves 2 → 1 step (the number halves).
2. 5.30 the 猜对 bar splits into 学过 / 没学过.
3. 8.00 the bars drain into their pads.
4. 10.90 the "？" breaks into 4 sparks that become the locked keys.
5. 13.50 the keys sink into bezel LEDs; the label screen fans into the 8-genre deck.
6. 16.00 the deck shuffles to blank; pads dim and the melody dots take over.
7. 19.0–20.0 the pads charge from the edges in (gather) → **20.00 all pads fire + VFD slams the title**.
8. 22.00 the title folds back into the VFD as "摇滚".
9. 32.00 split-flap + re-light wave from the playhead (rock → House).
10. 41.68 the backbeat switches off pad by pad; 招牌 pads fuse into the ride strip; push-in (House → jazz).
11. 51.68 pan to the TEMPO knob, the knob turns down, the panel warms, pan back (jazz → lo-fi).
12. 63.99 the beat-1 动 pad lifts out of its socket; push toward column 1 (lo-fi → reggae).
13. 76.29 VFD + label scramble to "？"; pull back to 1.0 (reggae → quiz).
14. 91.29 the kit unplugs top-down; nylon strings draw across (quiz → bossa).
15. 100.52 the thumb string snaps into the 808 trail (bossa → trap).
16. 110.81 the 招牌 screen grows into an oscilloscope; the 动 row fills (trap → metal).
17. 122.81 choke to dark, pull-back, melody dots land in the template (metal → theme 2).
18. 128.81 key presses trigger each recap bar.
19. 138.96 the matrix shrinks into the end-card motif slot.

No dips to black, no crossfades between unrelated pictures, no whole-frame beat pulses (row 54), and nothing from the outgoing genre still fading once the next has started (row 86).

## Build notes
- **Components:** `Panel` (static texture PNG + bezel), `Vfd` (tag / title / scramble / countdown / scope modes), `PadGrid` (rows × steps from events, afterglow, dim, slivers, empty socket, LED time line), `RowLabels`, `BeatNumbers`, `StepLeds`, `ContextRow` (TempoStrip | ClueKeys | AnswerKeys | BarLabels), `BezelLeds`, `Pop` (syllable rising from its pad), `Overlay` (melody dots + template, footprints, hop arcs, staircase, strings, chord dots), `Camera` (translate/scale of the faceplate group, keyframed per scene with easeInOut).
- Reuse the engine for subtitles, corner mark, end card and QA.
- Pads are cheap (64 rects). Precompute the per-frame pad state from events30.json in a `useMemo` (index by segment) so a frame never scans all 975 events.
- **Checks before gate 3:** mean luma ≥ 70 on each scene's still; no glow clipped; every lit pad matches an event within ±1 frame (script: compare the pad-on frames with events30.json); labels ≥ the sizes above, measured on the PNG; the top-left stays clear; no element sits in y 820–960 except subtitles and the bezel LEDs (y 800–812).

## Style frames
| Frame | File | What it proves |
|---|---|---|
| Hook 0:00 | `style/storyA_hook.png` | frame 0 is lit and readable; the 0.25 s window lives on the grid with the number riding under it; syllables rise from their own lit pads; drum tags on from frame 0; the rest of the bar waits at 30 % |
| Reggae 1:07 (l.20) | `style/storyA_reggae.png` | one hero: the empty beat-1 socket + "1" + playhead; the push toward column 1 keeps the VFD whole; 招牌 row dimmed (not playing yet, so no ghost cells); clue keys collapsed to 4 lit bezel LEDs |
| Quiz 1:16 (l.23) | `style/storyA_quiz.png` | the lure (动 on every beat) is the hero; VFD "？"; 线索 4/4 + A/B/C answer keys at 52–58 px; the other rows at 30 % |
| Gate-2a frames | `style/lookA_hook.png`, `style/lookA_key.png` | superseded by the three above |
