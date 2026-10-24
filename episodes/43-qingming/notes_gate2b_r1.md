# Gate 2b notes: 假如你是清明上河图, storyboard r2 (look A, 37 scenes), r1. Verdict: REVISE

Scores (rubric 1–5, from the plan; only the areas this gate covers): script n/a · **visual 4** · **info 4** · **edit 4** (5 once note 1 is done) · **motion 4** · sound n/a (music only, per the brief)

**Bottom line.** This is a strong plan. The look is coherent. Every one of the 36 hand-overs has a stated reason, and none repeats except the glow-locked teaser chain the format calls for. Both drops are placed on measured audio, not on the grid. The opening (scenes 01–08) matches script v2.3 to the frame. Three things block the build:
1. **From Z2 on, the storyboard is not on the approved line timing.** 17 of 48 lines start 1–4 beats away from `lines_bars.json` v2.3, yet the storyboard says it uses "the same times". The worst case is the E3 montage, which plays a full bar before its words.
2. **Two crest cameras can't be built at look-A quality in this kit.** CR-E (30° high oblique) and CR-G (70° steep high, with footprints seen from above) need top surfaces and top-down figures. The kit has only upright silhouette cards and profile figures.
3. **The three.js kit has no body-logic gate.** The storyboard relies on `<Person>`/`pose_check.mjs`, which are Remotion tools. This kit needs its own per-frame contact check before any still with a person in it goes out.

Everything else on the list is a simplification or a spec, not a redesign. One round should be enough.

**What I read:** SKILL.md (director), rubric, every row of owner-notes, figure-rules.md, pauses.md, brief.md, script.md v2.3 (all sections, including "Retiming to bars" and the line table), lines_bars.json, lines_bars_pace_flags.json, music.md, storyboard.md r2 (all 450 lines), style/looks.md, lookA_hook.png, lookA_key.png, notes_gate1_r2.md, notes_gate2a_r2.md, coldread_gate2a_r2.json, facts.md (the rows each picture relies on), crew_log.md. Code: film/src core.ts, crest.ts, rooms.ts, hud.ts, timeline.ts and main.ts, plus the exports of figures.ts and draw.ts, and tools/figsheet.png.

**Checks I ran:**
- **Lines vs storyboard.** I compared all 48 lines in `lines_bars.json` with the storyboard's line↔bar map, line by line: 17 differ (table in note 1).
- **Luma and saturation of the approved frames.** lookA_hook: luma 86, saturation 75. lookA_key: luma 100, saturation 88.
- **Luma of the planned interior and night colours.** Storeroom `#2A2724` = 40, aisle `#23272B` = 38, hall `#2A2E33` = 45. In the code, XBL wall `#1f2226` = 34 and STORE wall top `#141210` = 18. Night zenith `#16222B` = 31.
- **Stamp line 2 lengths.** All are ≤ 14 字 (the M3 and P1 fixes are in).
- **Not run:** no stills. This machine has no GPU or browser, so the renders wait for Modal.

---

## Notes (ranked)

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **High (blocking)** | Line↔bar map + scenes 11–13, 21–23, 25–27, 30–37 | **Re-sync the storyboard to `lines_bars.json` v2.3. It is the approved, pace-checked timing, and the build follows it.** The storyboard's map from Z2 on comes from r1, which was written in parallel with the retiming, and r2 kept it. For example, under the current board the 偷/换/藏 flashes would play under E1 「藏者宜宝之——人人都很珍惜你」, and 偷你 would appear 2.3 s after its picture. Replace the map with the file's times and move each scene's beats to them (the table below gives the corrections). If you want a different line time (for example, 抄 on the b64 accent), send it to the screenwriter as a request with pace.py output. Don't change it only in the board: the b63 version cuts D1 below its floor (3.40 against 3.50), and gate-1 carry-forward 4a said D1 may only gain time. | art-director | row 49 "every cut on a bar… reveal on a beat"; row 26 "drops measured"; row 104 reading time |
| 2 | **High** | Scenes 14 (CR-E), 25 (CR-G), 22 (CR-D) | **The kit can't build 30°/70° overhead views at quality.** The crest is a stack of upright cards: sky, far bank, a *vertical* river card, arch, railing. Seen from 30–70° above there's no deck top or water surface, and profile figures can't be seen from above. It would look like the "unfinished game" look the owner rejected (ep13). Replacements that keep each visit distinct: **I2 (14):** a side-on wide at day, with a slow push along the deck toward the White Dagoba that sets up the round-window match. **P2 (25):** CR-C side-on (T3/P1's framing, slightly raised by ≤ 10°). The four carriers cross one per beat and press dark footprints into the snow on the deck's top edge. On b44.5 the camera pans *down* into the snow on the railing and deck, the white snow field fills the frame and becomes the ledger paper (the snow → paper match stays), and the two entries ink in on b45.0 and b45.25. Keep the empty bar b43.5–44.5. **Q1 (22):** build it as a low framing (camera centred low, zoomed), with a near boat plane in front of the arch (z > 0) lowering its mast, the palace seen under the span, and no real tilt. In general, "tilt" in this kit means a vertical pan of the look-point, never a rotation over the cards. | art-director, animator | ep13 "procedural 3D looks unfinished"; ep14 row 42 "choose per shot what holds up" |
| 3 | **High** | Every scene with people (01, 03–05, 09–10, 12–20, 22, 24–30, 34–35) | **Port the body-logic gate to the three.js kit before stills 2–4.** figures.ts already has `reach()`, `handAt()` and contact poses, and figsheet.mjs prints contact errors for its sheet. What's missing is a **per-frame checker over the real scene frames.** It should check: each declared hand within 4 px of its target (roller, roll end, box, lamp, brush tip); planted feet within 3 px of `deck(x)` or the floor; a seated hip on its declared surface; no hand or foot inside the railing or table rectangles. It must print PASS and the worst frame, as `push_check.mjs` did. **Slope:** the arch deck is 10° steep at ±500 px from centre and 16° at the ends. A flat-ground gait will float or sink one foot by about 14–26 px. Plant each foot on `deck(x)` with 2-bone leg IK, or keep the walks where the slope is under ~10°. Also update the storyboard's "Build" section to the real pipeline: a standalone three.js page, `renderAt(t)`, the HTML HUD, Playwright on T4 with Vulkan, and this checker in place of Remotion/`<Person>`. | animator (producer); art-director (Build section) | rows 74, 101 (contacts solved, checked per frame); figure-rules R1–R8; row 43 no 穿模 |
| 4 | Med-High | Scenes 27–28, **the peak** | **Keep the peak, and spec it so it can be built and stays readable.** It has four camera moves, a colour flood, a relief lift and animated painted figures in 6.8 s. Make it **one continuous move**: unroll + bloom on 123.40 → dive into the 虹桥 (b54–54.5) → colour floods out from the centre (b54.5) → on **b56**, crane up and back while the 5 layers separate → b56.75–57, exit. Drop the separate "low across the crowd" pass on b55. **Painter:** author the relief as 5 alpha canvases (river, boats, bridge, roofs, trees). Leave a faint ink ghost on the base silk under each lifted element so no holes open. Give every lifted layer a soft dark shadow on the layer behind, so it reads as a paper diorama, not floating cards. **Animated painted things: only three:** the boat's mast, a few railing figures raising their arms, and one cart. They are the same sprites frame 0 uses, so build them once. **Exit (28→29):** swap "painted figures grow into silhouettes" for a **bridge match**: the painted arch scales onto the real crest arch, same curve and screen place, now in daylight. It is frame 0's rhyme reversed, and it avoids a morph between two drawing styles. Optional: hide stamp, chip and counter for the b56 bar, so the film's biggest frame carries only the picture. The burst is the silk's own bloom growing: never compositor mode 8 or `grade.flash`. | art-director (spec), animator | row 88 (the biggest image on the emotional peak); row 55 (no white flash); ep13 |
| 5 | Med | 33→34 **costume wipe** | **The board contradicts itself on direction.** E4's last era carries you off **right**, but the costume-swapped figures "walk on as today's visitors", and in scene 34 they cross **left**. Splitting a figure's costume mid-stride while it reverses direction can't be drawn cleanly. **Build:** the carrier leaves frame right before b67.5. The daylight sweep is a compositor wipe between two matched crest stages (the 清/1923 snow-night state → today-day), with a **soft light edge** (not the roll-up wipe's roller shadow). The figures it changes are the **standing bank crowd**: hats → today's silhouettes. Once the sweep has passed, the visitors start walking left. This keeps "the hats fall away" (E5, b68) and costs no per-figure clipping. | art-director, animator | row 86 (different motivated moves); rule "进 = left, 出 = right" |
| 6 | Med | Luma: scenes 02, 06–07, 26–27, 35–36, gate passages (07, 29, 36) | **The darkest beats are set below your own night floor.** The look sets night ≥ 45/255. The board then allows 25–30 for scene 07's empty case, the b49 silence, the lid POV and the empty case at 36. The owner called 27/255 "dark" (ep21). The interior colours sit at luma 34–45, and STORE's wall top in rooms.ts is 18, so every interior will land around 30–40 before its subject is lit. **Fix:** raise the interior colours by about 20 luma and give each a warm or teal cast. For example: storeroom wall ≈ `#4A4038`, aisle ≈ `#3E454A`, hall ≈ `#464C52`, XBL wall ≈ `#3A4046`; replace STORE's `#141210`. **Floors:** every frame's mean ≥ 45 at night and indoors, and ≥ 40 for the three named darkest beats. Reach them with mid-tone light (moonlit door spill, the lid's underside lit warm by you, the hall's other lights), not a lower number. Gate passages stay warm-lit, with the far opening visible all the way through, so no fly-through dips toward black. Check on every still. | art-director (palette), animator (rooms.ts) | row 71 "don't let night mean black"; brief "never black" |
| 7 | Med | 61–123 s (scenes 16–27) | **There's a black-and-white risk in the middle.** From W2 to Y4 almost every scene is night, snow-night or a dark interior. Only Q1 (3.4 s) and V1's seasons bring colour. That is about 60 s of blue-grey, black and one warm glow. The brief bans black-and-white overall, and the owner tired of dark thin-line looks (ep13, ep21). **Add a colour source in each scene:** W3's southern study at warm lamplit dusk, with banana-leaf green in the lattice; M1's torches (`#FFB868`) on the roofs; M2's hall lamps; warm window lights on the far bank in the snow-night scenes; V1's tree in real seasonal colour (green, ochre, white). **Check:** on the stills of scenes 16–27, if three scenes in a row fall below mean saturation ≈ 35 (lookA_hook is 75), add colour before the build continues. | art-director | brief "not black-and-white"; ep13 "视觉疲劳"; ep21 "为什么图片都这么dark" |
| 8 | Med | Stills-first list | **The header says "keeps its four shots", but the list has seven, and its order spends early stills on low risk.** First four, in this order: **(1)** frame 0, which tests the painter and decides everything; **(2)** the drop pair 8.9/9.6, the title; **(3)** the peak b56, the biggest promise, so its fallback (colour + push, no relief) is decided before the rest is built; **(4)** the night sale b27, whose lighting and four-hand contacts are reused by T2, F1 and E4. **Then:** **(5) new: a DAY crest still** (R1 b57.75 or E5 b68.25). Day is unproven: the "only light" idea is weakest against a bright day sky (silk luma ≈ 243 against a horizon ≈ 220), so check that your glow still leads. **(6)** 1945 b48.75. **(7)** the pane b11.6. **(8)** the pull-back b1, last, because it is closest to the approved key frame. | art-director | SKILL "stills per scene → gate 3"; row 47 (first frame) |
| 9 | Med | 05, 09, 24, 27, 34, 35 | **Figure staging the kit can't draw, or the body rules forbid.** (a) T3/P1 "back three-quarter" and B1 "from behind" → **profile**. The kit draws only profiles, and profiles-only is the cast rule. (b) Scene 34: drop the **child on a parent's shoulders**, a two-body contact pose the kit doesn't have. Use a child walking beside a parent instead. (c) Scenes 35/cast: **no white gloves.** Keep the figures one tone: gloves make the hands the brightest part of a silhouette (ep6, row 124). (d) Scene 27: the researcher sits, yet "lifts rolls onto the table" from the heaps. Put the three rolls at the end of the table, where he slides each in and opens it a hand's width, and put the reject pile on a crate within arm's reach. | art-director | rows 98, 124; ep6 "手好奇怪"; figure-rules R6 reachable |
| 10 | Low-Med | 32→33 | **The "sky tilt" out of the WALL isn't motivated.** The wall of copies is an interior gallery with no sky, so tilting up into dusk reads as an arbitrary hidden cut (ep7 "僵硬"). **Instead:** on b65.75, push into the *one* glowing roll on the wall. On b66 its glow is your glow carried across the 宋 fire crest, on the lock point, and it stays there through the flip-book. "One of a hundred is you" leads straight into "and here is you, carried out, four times". | art-director | ep7 row 15; row 86 |
| 11 | Low | E4 (33); V2 stamp (26) | (a) **E4 chip proposal: hide the chip and counter for b66–67.5.** The stamp 「宋 · 元 · 明 · 清」 carries it. P1 showed the 1923 exit under 民国, so flipping the chip to 清 for the same exit would contradict it. (b) **The V2 stamp spoils the stop.** 「伪满覆灭，下落不明」 appears on b47.5, 3.4 s before V3 「混乱中，你下落不明」 lands on the silence. Show line 1 「— 1945年8月 · 长春」 alone on b47.5, and slam line 2 (≤ 14 字, e.g. 「下落不明（伪满皇宫博物院）」, C28's verdict) on the b49 hit with V3. | screenwriter | row 11 (plain reading); pauses.md (the hit lands after a pause) |
| 12 | Low | 13, 31 (colophon); labels | (a) A 5-character vertical column at ≥ 140 px stands about 750 px tall. Placed at x 960 it runs into the counter zone (x 120–1100, y 880–1040). Put 「翰林张择端」 and 「藏者宜宝之」 at x 1200–1700, y 320–1000, or let the chip and counter step aside for that beat. (b) Scene 31: framed overhead, the whole scroll is a 40:1 strip about 48 px tall (≈ 12 px on a phone), and seals and colophons vanish. Crane to about 2 m of the tail instead (colophon columns and red seals readable at 480 px), then drop onto 藏者宜宝之. (c) Labels 44 px → **≥ 56 px** (row 76). Keep the look's serif Black (row 103). If a label fails at 480 px, switch it to 思源黑体 Bold. | art-director | rows 69, 76, 103; rubric 3 |
| 13 | Low | Picture claims without a facts row | Lines and stamps all trace to rows. These **pictures** don't yet: (a) the **White Dagoba** as the marker of 元大都 (scenes 03, 14, 15; 妙应寺白塔, finished 1279). (b) **Where the 嘉庆 五玺 sit on the scroll.** Scene 23 slams them across the 虹桥 crowd. Until a row places them, put them on the mounting silk and joins at the scroll's start, not on the painted bridge. (c) **封条** on a Ming confiscation (scene 19). (d) The painting's own **boat-lowering-its-mast scene under the 虹桥**: frame 0 and the peak animate it, so it should match the real composition. These are in addition to your list (hats, the arch, the 马道, the 小白楼). | researcher; art-director for (b) | row 121 "every prop belongs to its era"; brief "every stamp maps to a row" |
| 14 | Low | Kit additions (for the build plan) | These are the only engine pieces the plan needs that aren't in core.ts or hud.ts yet: **(1)** a rectangular **pane** mask (B inside the case's projected front-pane rect at 30–40 %, a thin highlight line on its edge, the rect growing past the frame as the camera passes): lanterns in the glass, and the XBL window. **(2)** a **directional smear** for the E3 flashes. **(3)** **picture-in-picture**, a stage rendered as a texture inside another stage, for "shrink into the record" and the replay in 杨准's column. **(4)** a **light-edged wipe** for the daybreak. **(5)** HUD: the title ink clipped to and moving with the band's projected rect (it must not float over the night before the silk opens); E3 words turning red one per beat; Q only in the end card's slot. **(6)** Every scene a **pure function of its local time**, so the E3 re-renders and the E4 flip-book are calls, not copies. **(7)** The SILK strip in tiles (e.g. 4096 × 1536), uploading only the tiles a shot sees. | animator | row 86; row 9 "every prop renders whole" |

### Note 1: the corrections (lines_bars.json v2.3 → storyboard)

| Scene | Storyboard r2 | Must be |
|---|---|---|
| 11–13 | Z2 b17.25 · Z3 b18.75 · Z4 b20.25 | Z2 **b17.5** (41.07) · Z3 **b19** (44.47) · Z4 **b20.5** (47.87). The 12→13 tilt-push can still start on b18.75 if it lands as Z3 appears on b19. The glyphs light while their line is up: 张择端 on b19–19.5, 藏者宜宝之 one per beat from b20.5 or b21. |
| 21 | b35.5 → **b37** | b35.5 → **b37.5** (F2 runs to 86.36). Ripple b37.25 → 37.5. |
| 22 | Q1 b37 → 38.5, 进④ b37.25 | Q1 **b37.5 → b39**, 进④ on **b38**. |
| 23 | seals b38.5–39.5; eaves b39.75–40.75 | Q2 **b39**. Seals on b39.0 / 39.25 / 39.5 / 39.75 / 40.0. Eaves close in the bass-less bar 40 (b40.0–40.75). Roofline match on b41 (unchanged). |
| 25 | P3 b44.25; snow→paper b44.25; entries b44.5/44.75 | P3 **b44.5**; snow→paper on b44.5 (with note 2); entries on **b45.0 / 45.25**; into the slats b45.5 → **b46**. |
| 26 | V1 b45.75 · V2 and 1945 stamp b47.25 · headlights b47.25–47.75 · V3 b48.5, typed | V1 **b46** · V2 and stamp **b47.5** · headlights b47.5 → b48 · doors and carrying b48 · search b48.5 · **V3 appears whole on the b49 hit** (hud.ts already does this). |
| 27 | Y2 b51.5 · Y3 b53 | Y2 **b51.25** · Y3 **b52.75**. The 真迹 slips still turn grey on b53/53.25. |
| 30 | D2, 1973 stamp and chip on b60; lens out b60, in b60.5; peel b60.5–61.0; ends b61.5 | D2, stamp and chip on **b60.5** (on b60 the stamp would say 1973 under the Ming line). Lens out b60.5, back in b61.0, peel **b61.0–61.5**. The scene runs to b62. |
| 31 | E1 b61.5; crane b61.5; drop b62.25; glow b62.5 | Crane starts **b62** (phrase start) · E1 **b62.25** · 藏者宜宝之 glows on **b63** · the scene ends b64. |
| 32 | E3 b63: 偷 63 · 换 63.25 · 藏 63.5 · hold 63.75 · 抄 64 · label 64.5 | E3 **b64**: **偷 b64.0** (the +3 dB accent) · 换 64.25 · 藏 64.5 · **抄 64.75** + pull-back. The 「约百卷仿本」 stamp on 64.75, the label on b65.0, the wall held to b65.75, then note 10's push on b65.75 → b66. |
| 33 | E4 b65.5; an era every 2 beats | E4 **b66 → b67.5**. Eras on **b66.0 / 66.25 / 66.5 / 66.75**, one per beat as the script has it, with the 出 flashes on the same beats. 清/1923 holds to b67.5. (Two beats per era won't fit: starting on b65.5 would leave the 抄 wall and its 11-character label 1.7 s, and the label needs about 2.1 s.) |
| 34 | the crowd flows b69–71.5, then lights out | E6 b69–71, then **b71 → b72: the no-subtitle moral picture** (crowd files past, you hold). This is the screenwriter's named CHECK beat (162.2–165.0); if it isn't built, it is dead air. |
| 35 | lights out b71.5 · roll-up b72 · box b72.5 · lid b72.75 · aisle b73 | Lights die row by row **b72.0 → 72.25** · E7 types on **b72.25** · roll-up b72.5 · into the box b72.75 · **lid closes on b73.0** · aisle b73.0 → b74. |
| 36–37 | Q centred b76; end card b77 | E8 clears on b75.5 and the card stands alone to b76. The **end card begins on b76** (J and gold title over the ramp). **Q types into the end card's question slot on b76.5**, never as a second subtitle at the top, so the engine row "N2 and Q centred at the same height" changes. Pill on b78, sources on b78.5. |
| Tally | 进② b24.0 | 进② on **b24.5** (the script's anchor table). |

---

## Highest-risk scenes and transitions (ranked), and how each is handled

1. **The SILK painter, as used in frame 0, the title band, every insert, every copy and the peak.** This is the film's single biggest dependency. Frame 0 shows a slice of about 2000 px full screen, so it needs about twice the detail the hook frame showed. If it reads as sparse clip-art, the first impression fails (ep21 "cheap"). → Build order step 1; still 1.
2. **The peak (28).** It must be the most spectacular frame and must not read as an unfinished game. → Note 4: one move, a paper-diorama relief with shadows and ghosts, three sprites, a bridge-match exit. Still 3 early, with a fallback ready (colour flood + push, no relief).
3. **Figures in motion with contacts, on a curved deck** (walks on the arch slope, two-man carries, roll-ups, handovers, writing with a brush, tweezers). → Note 3: per-frame checker and slope-aware feet before any people still.
4. **CR-E / CR-G overhead cameras.** Not buildable at quality → note 2.
5. **The costume wipe.** Direction conflict and per-figure costume splits → note 5: a two-stage wipe that transforms the bank crowd.
6. **Dark interiors, and the colour in the middle of the film** → notes 6–7.
7. **WUMEN** (scenes 07, 34–37, about 35 s): four sub-sets (ramp with a time-lapse queue, passage, hall with case, aisle). It's sheer volume rather than difficulty; build it once, early (step 5).
8. **Lanterns in the glass (07→08).** It needs the pane mask (note 14.1). The risk is reading as a crossfade; still 7 tests it. It works if the pane's edge and highlight are visible and the lanterns light right → left *in* the pane before the push.
9. **The 1945 search (26).** The content stays within C27b/C28: guards (卫兵) carrying armfuls, scrolls on the floor, no glow anywhere, no tools. Risk: luma (note 6) and density, with 4 stage changes in 9.6 s, which is dense but each change is motivated. The silence 112.8–114.25 keeps drifting.
10. **Whip-pan montage (E3).** Technically low risk: the re-renders are calls to scene functions (note 14.6). The risk is legibility at one beat (0.57 s) per flash. → Spec: hard cuts on the beats with a 3–4-frame directional smear, each flash framed with your glow on the lock point (the teaser's language, recalled), and only the 抄 pull-back as a real move.
11. **The cross-section truck (34).** Buildable: two stages trucking at the same screen speed, the gate's wall as the foreground band. The wall must look like masonry (texture and a door-jamb edge), so it doesn't read as a reuse of the eunuch's body wipe (20→21, the same mask).
12. **14 crest visits.** Every IN/OUT is distinct, and most use masks the compositor already has (roller wipe, ink-bleed, ripple, iris, body band). The risk is the set itself recurring six times in 54–105 s. The changing moods carry it (day push, night two-shot close, dusk → night locked, low with the boat, snow wide, snow side track). With note 2 they stay distinct.

## Simplification list (what is kept of the owner's asks)

| Simplify | Instead of | Keeps |
|---|---|---|
| The peak as one continuous move, 3 animated sprites shared with frame 0, relief as 5 alpha layers with ghosts and shadows | 4 camera moves in 3 bars, a crowd animated throughout, "painted figures grow into silhouettes" | the biggest image on the hardest drop (row 88); the first full colour; no AI |
| Peak exit by matching the painted bridge to the real crest bridge | a morph of 界画 figures into profile silhouettes | a motivated transition; a bookend of frame 0 |
| I2 as a side-on day push toward the Dagoba; P2 as side-on crossings + a pan down into snow → paper; Q1 as a low framing with a near boat | 30° oblique, 70° top-down footprints, a real low tilt | distinct crest visits (row 86); snow → paper |
| Costume wipe as a two-stage light-edged wipe that changes the standing bank crowd; carrier gone first | per-figure mid-stride costume swaps with a direction flip | the hats fall away; motivated daybreak; 进/出 direction |
| E3 as beat cuts with a short smear, glow on the lock point | full whip-pans | four beats, four verbs, re-renders of earlier shots |
| WALL → push into the one glowing roll → your glow on the 宋 crest | sky tilt out of an interior | a motivated hand-over |
| Profiles only; no child on shoulders; no white gloves; the researcher's rolls within reach | back three-quarter / from-behind figures; two-body poses; two-tone hands | whole figures with hands on real points (rows 74, 98, 124) |
| Scene 31 framed on about 2 m of the tail | the whole 40:1 scroll overhead | 「人人都很珍惜你」 shown as colophons and seals that can be read |

## Build order

0. **Kit first:** the per-frame figure checker with slope-aware feet (note 3); painter v1 (the 虹桥 section in mono and grey, the mast, railing-figure and cart sprites as separate layers, tiled); scenes as pure functions of time.
1. **Scenes 01–02** (silk plane in the crest stage, pull-back, roll-up, walk-off, lanterns dying, title band and its clipped ink) → **stills 1 and 2**. This retires the risk in the painter, the title, the crest at dusk and walking figures.
2. **Scenes 27–28** (STORE lamp on, unroll, burst, colour flood, relief) → **still 3**. Decide the relief or its fallback now.
3. **Scene 16**, the night sale → **still 4**. Then reuse it for 04 (T2) and 20 (F1).
4. **The rest of the teaser**, 03 (ROOM-元, the hook still) / 05 / 06, plus one **day crest** (29 or 34) → **still 5**.
5. **WUMEN**: 07 with the pane mask → **still 7**; then 34 (cross-section), 35, 36, 37 and the end card.
6. **08–13**: S1, the ink-trace, B1, BO, and the 张著 run (inserts and DESK).
7. **14–21**: the 元 / 明 run (ROOM-元 dusk, PiP shrink, DESK 杨准, MING-LANE, MING-HALL, the dusk → night crest, F2).
8. **22–26**: 清 / 1923 / 1945 (low crest, seals, snow crest, ledger, XBL) → **still 6**.
9. **30–31**: donkey and RESTO, the colophon crane.
10. **32–33 last**: the E3 montage and the E4 flip-book re-render earlier scenes, so they need those scenes built.
11. Gate 3 per scene on contact sheets → full render on T4.

## What must not change (it works)

**Look**
- You are the only glowing, saturated thing, and you rim whoever holds you. Silhouettes are one tone, `#15100C`.
- The dusk palette of the approved frames (luma 86 / 100).
- The 虹桥 crest as the handover stage, where only the sky, the hats, the boat and the far-bank palace change.
- 进 = carried leftward toward the palace; 出 = carried rightward into the dark.
- The mood follows the deal: official entries at dusk or in daylight, secret exits at night with the lanterns out.
- Inserts are entered through your silk. The peak's mineral colour is held back until 123.40.

**Opening**
- Frame 0 is the painting, already moving, with H1's glyphs already typed and the 「— 《清明上河图》」 stamp up from frame 0.
- The 9-second single take: the lanterns die in pairs, and 8.78–8.96 is the darkest frame, still moving.
- The glow-locked cut on 8.96. The silk title band slams on **9.05**, with its second bounce on b3.5 and the glint on b4. No flash.
- The band becomes your silk on the Yuan table (lock point 960, 580).
- The four glow-locked teaser cuts (b4.5 / 6 / 7 / 8), each paid off on the same shot later.

**Edit**
- The 36-row transitions table, every move with its stated reason. No crossfades, no dips to black. Outgoing labels leave before each move.
- 14 crest visits, each with its own IN and OUT.
- Both drops measured (9.05 and 123.40).
- The one true silence on b49, with the picture drifting and nothing new appearing.

**Deliberate departures from the script's picture column, all correct (items 1–14):**
- a carried bundle, not a crate;
- no museum plaque;
- door wipes;
- F2 as one track;
- the C27b picture with no glow anywhere;
- seals that appear by themselves;
- the ledger on a desk;
- no brush entering from off-screen;
- E7 without the "seasons of light";
- Q1 as a procession seen from the water.

**HUD**
- The old 21 px corner mark.
- Serif ivory subtitles, top-left, no box, red key words.
- Stamps at 56 / 40 / 34, with line 2 ≤ 14 字.
- Chip + 你 约N 岁 rolling like an odometer, never 250; 伪满 never a chip.
- The tally's beats, complete at R1.
- The Juno end card with 关注 Juno · 一起看懂世界.
