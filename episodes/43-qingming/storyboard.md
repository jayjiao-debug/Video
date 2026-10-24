# Storyboard: 假如你是清明上河图 · look A 汴河暮影 (gate 2b, r3 · approved at gate 2b r2, with fixes A–D)

Art director, 2026-10-24. Inputs: script v2.1 + lines.json (owner-approved), music.md (owner BGM, 30-bar cut, film ≈ 3:04),
notes_gate2a_r1/r2 (R7 mood follows the deal, R8 move list), notes_gate1_r2 carry-forward 1–4, facts.md (all rows incl. C27b),
figure-rules.md, owner-notes (art-director rows), craft.md, pauses.md, ref_sheet_1–6 (rhythm only), style/lookA_*.png.

**r3 (2026-10-24): gate 2b r1 came back REVISE (`notes_gate2b_r1.md`).** Every note routed to the art director is in, and
nothing on the director's "don't change" list moved.
1. **Timing (note 1).** The line map is `lines_bars.json` v2.3, line for line, and every scene from 11 (Z1) on sits on it. All
   rows of the director's correction table are applied. The board moves no line and has no line-time request open.
2. **Cameras (note 2).** CR-E and CR-G are retired.
   - I2 (14) is a side-on day wide with a slow push toward the Dagoba.
   - P2 (25) is a side-on deck-level track: footprints in the snow on the deck, then a pan down into the snow, which becomes
     the ledger.
   - Q1 (22) is a low framing with a near boat plane.
   - "Tilt" now means a vertical pan of the look-point.
3. **Build (note 3 and the producer).** The Build section now describes the real pipeline: a standalone three.js page in
   `film/src`, `renderAt(t)`, Playwright stills and chunks on T4. A per-frame contact checker, with feet planted on
   `deck(x)`, replaces `<Person>`/`pose_check.mjs`.
4. **The peak (note 4).** One continuous move from 123.40 to b57.
   - Only three painted sprites move (mast, railing figures, cart), the same ones frame 0 uses.
   - The relief is silk.ts's 5 alpha layers, with ink ghosts and soft shadows.
   - The exit is a bridge match onto the real crest. The HUD hides for the b56 bar. No flash mode anywhere.
5. **Daybreak (note 5).** The 1923 carrier leaves right before b67.5. A light-edged wipe between two matched crest stages
   changes the standing bank crowd, and then the visitors walk left.
6. **Luma (note 6).** The interiors and the night sky are raised (new hexes in the palette).
   - Night and indoor frames: mean ≥ 45. The named darkest beats: ≥ 40.
   - Gate passages are warm-lit, with the far opening visible.
7. **Colour (note 7).** One colour source per scene from 16 to 27, and a saturation check on their stills.
8. **Stills (note 8).** The new order: frame 0, the drop pair, the peak, the night sale, a new day-crest still, 1945, the pane,
   the pull-back.
9. **Figures (note 9).** Profiles only. A child walks beside a parent. No white gloves. The researcher's rolls and his reject
   crate are within reach.
10. **WALL → E4 (note 10).** A push into the one glowing roll on the wall becomes your glow on the 宋 fire crest. It replaces
    the sky tilt.
11. **Colophons and labels (note 12).** The big columns sit at x 1200–1700. Scene 31 frames about 2 m of the tail. Labels are
    ≥ 56 px.
12. **Also:**
    - E3 is built as beat cuts with a short smear (risk 10).
    - Q types into the end card's slot.
    - The 嘉庆 seals land on the mounting silk (13b).
    - The chip and counter hide in E4 (11a, settled in script v2.3.1).
    - The researcher list adds 13a, 13c and 13d.

**r2 (2026-10-24): the owner put the title card on drop 1, before the fate teaser.** Only the opening changed, frame 0 → S1
(scenes 01–08), and it now runs on the screenwriter's v2.3 times (`lines_bars.json`). What changed:
- **Order and numbers.** Hook (01) → **title (02)** → T1–T4 (03–06) → N1/N2 (07) → S1 (08). Scenes 02–07 are renumbered.
  Scene 08 onward keeps its number, and everything from B1 (b13) on keeps its bars and content.
- **The drop is measured, not read off the grid.** Nothing happens on bar 3's downbeat (8.24). The track breathes at 8.78, picks
  up at 8.96 and hits at **9.05**. The title slams on 9.05 and holds to b4.5, which leaves 2.59 s to read it.
- **Intro → title.** Frame 0 → pull-back → roll-up → carried off right is now one 9-second take that winds up into the drop.
  - The lanterns die in pairs, the last pair on the breath, so 8.78–8.96 is the darkest frame. It is still moving.
  - Then comes the film's first hard cut, glow-locked: the title band's right roller stands where your glow was, and the band
    slams open leftward on the hit.
- **Title → teaser.** The title leaves on the first teaser cut (b4.5), glow-locked: the band becomes your silk on the Yuan
  table. So the **glow-lock point moves to (960, 580)**, the band's centre (it was 1250, 600). Every later "on the lock point"
  follows it.
- **N2 → S1.** A new move, "lanterns in the glass", replaces r1's "light returns" (06→07) and "band match" (07→08). Both
  belonged to the old title slot.
- **One picture change after S1** (producer's request, measured): the hardest drop's bass lands at **123.40**, 0.31 s before
  b54. The peak's burst moves to 123.40, and 「才是你」 keeps its b54 line time. Scenes 27–28 and transition 27 are updated.
- **Unchanged:**
  - the engine layer, apart from the lock point;
  - the 14 crest visits (01's OUT and 08's IN are updated, and the teaser visits are renumbered 04/05);
  - scenes 09–37, apart from the burst;
  - the stills list now starts with frame 0, the drop pair and the pull-back (r3 reorders it again).

**Length:** 0:00 → 184.30 s (the music ends at ≈ 184.2). **Scenes:** 37. **Grid:** film bar `b(j) = 1.4498 + 2.26415·j`;
`b34.25` = bar 34, beat 2. Every hard cut sits on a bar or half-bar (owner row 49). Continuous moves start anywhere and
**land** on a bar, half-bar or beat.
- **Two measured exceptions:** the title's slam on drop 1's hit (9.05) and the peak's burst on the hardest drop's bass (123.40).
  Both drops land off the bar line (owner row 26: find drops by measuring the audio, not from a grid).
- **Anchors** (`lines_bars.json` v2.3):
  - **title on drop 1 (9.05)**;
  - teaser cuts b4.5 / b6 / b7 / b8 (T4 on the b8 phrase change), N1 b9, N2 b10.5, S1 b11.5;
  - 冯保 b34, 1923 over the build b41–b42, 「下落不明」 on the stop b49, the storeroom on b50;
  - 「才是你」 on b54 (burst 123.40), outro b74.

**Measured on `audio/bgm_cut.wav` (so the picture uses the real track, not only the map):**
- The music starts at **0.55 s** (0–0.55 is silence). Frame 0 already moves; the first motion beat is on 0.55.
- **Drop 1 is heard at 9.05, not on bar 3's downbeat (8.24),** where nothing happens.
  - From **8.78** (bar 3, beat 2) the track breathes for half a beat: highs −13 dB, the mix −5 dB.
  - There is a small pickup at **8.96**.
  - The crash and sub-bass attack land at **9.04–9.05**, the off-beat eighth after beat 2. The bass is full by 9.10.
  - The next attack, on b3.5 (9.37), is the loudest of the opening.
  - `bgm_full.wav` gives the same times, and so does the screenwriter's measurement (script v2.3, "Drop 1, measured").
- **b8:** the phrase change. The attacks drop about 3.5 dB (a lighter top end).
- **b34–b40:** the breakdown alternates. Bars 34, 36, 38 and 40 have no bass; bars 35, 37 and 39 bring the bass back on beats 2–3.
- **b49 (the stop):** one hit on the downbeat, then **true silence from 112.8 to 114.25 s**, then a pickup into b50.
- **b53 → b54:** the bass comes back on the off-beat after beat 4, at **123.40** (sub −42 → −17 dB within 30 ms).
  - That is 0.31 s before the b54 downbeat, which is itself soft. There is only a small onset at 123.13.
  - The burst goes on 123.40; 「才是你」 keeps its b54 line time.
- **b56–b57:** the loudest bars of the film (attacks +3 dB).
- **b64:** an accent (+3 dB attack). **b74:** the bass drops out to the end.

---

## Look

**World.** The 汴河 at dusk as silhouette theatre. You, the scroll, are the only light: lantern silk that lights and rims
whoever holds you. Your life is staged on the 虹桥 crest, a handover stage seen side-on. The era's palace stands on the
far bank to the **left**, and an unlit road runs off to the **right**. **进 = carried leftward toward the palace;
出 = carried rightward into the dark** (fixed all film). Full-frame painting inserts are entered *through your silk*.
**The mood follows the deal (R7).** Official entries happen at dusk or in daylight, with lanterns lit and people on the
bank. Secret exits happen at night: lanterns out, figures close, your glow the only light.

**Palette.**
| Role | Hex |
|---|---|
| Dusk sky (zenith → horizon) | `#2B4552 → #6E827E → #E6B676 → #F3CC8E` (looks.md A) |
| Day sky (I2, R1, E5) | `#4E6B75 → #8FA7A6 → #D9CFAE → #F1E2BE`. The top 340 px stay ≤ `#5E7A82`, so ivory text keeps ≥ 4.5 : 1 |
| Night sky (secret exits) | `#1F2E38 → #2E404B → #45565D`, distant-city horizon `#5A5A4C` (r3: raised from `#16222B…`; zenith luma 31 → 43). Never black; night frames' mean luma ≥ 45/255 |
| Fire sky (1127, E4 宋) | `#2A1D1F → #6B2E22 → #C2562F → #E88A45` + smoke bands |
| Snow night (1923) | `#2E3B47 → #4A5A66 → #6C7A82`, snow `#D9E1E6` |
| Silhouettes (one tone) | `#15100C`, rim `#FFD58F` (from your light only) |
| You (silk) | core `#FFF3D8`, rim/bloom `#FFD58F`, painted ink `#2A1F17` |
| Copies / fakes | dead grey `#9A968E`, ink `#55524C` |
| Red (seals, tally, key words only) | `#EE4B3B` |
| Peak only (b54–b57, inside the silk) | 石青 `#41708A` · 石绿 `#6E8E68` · 赭 `#A8683A` · 朱 `#B42E22` |
| Practicals (lamps, lanterns, torches, headlights) | `#FFB868`, kept small and on their objects |
| Interiors (mid-tone, never black; r3 raised about 20 luma, luma in brackets) | mounting room `#2E3E46` (58) · 元 study, warm lamplit dusk `#4A3E30` (64) · Ming hall `#4A3F36` (65) · 清宫 night room `#3E3A34` (58) · XBL wall `#3A4046` (63) · storeroom `#4A4038` (66), wall top `#3A322B` (52), replacing rooms.ts `#141210` · 1973 room `#6F7774` · 午门 hall `#464C52` (75) · storage aisle and WALL `#3E454A` (67) |

**Luma targets** (frame mean, checked on every still; owner row 71):
- Every night and indoor frame: ≥ 45/255.
- The named darkest beats (the empty case in 07 and 36, the b49 silence, the lid POV): ≥ 40. Reach this with mid-tone
  light (moonlit spill, the lid lit warm by you, the hall's other lights), never by accepting a lower number.
- Dusk 75–100, day 110–150, inserts 120–160 with the vignette.
- Gate passages stay warm-lit, with the far opening visible all the way through.

**Type** (all on the render machines):
- Subtitles: Noto Serif CJK SC Black 58 px.
- Stamps: Noto Serif CJK SC Bold.
- Counter numerals: Cormorant Garamond SemiBold 88 px.
- Labels: Noto Serif CJK SC Black ≥ 56 px (owner rows 76 and 103). A label that fails at 480 px switches to Noto Sans CJK SC Bold.
- Engine end card: unchanged.

**Texture and light.**
- Every set has ≥ 3 depth layers with atmospheric fog toward the sky colour, so it never goes flat clip-art (ep21).
- Silk weave on you; bloom only on you, the lanterns and practicals.
- The bloom threshold sits above the silk's base, so the painted linework on you never blows out (owner row 81).
- Inserts carry a lamplight vignette. The silk glows from the centre and falls to warm dark (≤ `#4A3B2C`) under the subtitle,
  stamp and counter corners, so the ivory subtitles keep **one polarity all film** (gate-2a ruling: never flip mid-line).

**Colour in the middle (61–123 s, director note 7).** From W2 to Y4 almost every scene is night, snow or an interior. So each
scene carries one colour source besides your glow, kept smaller and less saturated than you:
- 16: a few warm windows on the 大都 skyline;
- 17: warm lamplit dusk, with banana-leaf green in the lattice;
- 18: torches `#FFB868` on the roofs;
- 19: hall lamps and an oxblood lacquer box `#6A2E24`;
- 20: the 明 dusk sky, then the 角楼's lit windows;
- 21 and 23: the warm silk and the seals;
- 22: the 清 dusk;
- 24 and 25: warm windows on the far bank in the snow, and the 清宫 room's lamp;
- 26: the tree in real seasonal colour, and the headlights;
- 27: the lamp's warm pool.

**Check:** on the stills of scenes 16–27, if three scenes in a row fall below a mean saturation of ≈ 35 (lookA_hook is 75), add
colour before the build continues.

**Motifs.** The glowing roll vs the dead-grey copy. The four-出-five-进 tally. The boat lowering its mast (in the painting
and on the real river). Red seals. Ink appearing on paper. The glow locked to one screen point (the title and the teaser, inverted at E6).

**Must NOT look like.**
- iwanau: an altar with dynasty banners, mint jade, red-purple sunsets, their title card.
- Flat clip-art (ep21 v2), or procedural "unfinished game" 3D (ep13).
- Black with thin lines; a slideshow where elements pop in and hold.
- Front-on faceless blobs (profiles only, ep14).
- Hands entering from off-screen or stopping short of what they touch.
- Horror, and a black frame anywhere.

**References.** style/lookA_hook.png and lookA_key.png (the approved look). The SILK painter is `film/src/silk.ts`, built
from the look-B code in `style/src/` (lookB_hook.png, lookB_key.png). The iwanau sheets are used for rhythm only (a picture beat every ~2 s, one set per
stacked line pair, a recurring handover set where only the era markers change).

## Engine layer (shared furniture, never changes)

| Element | Spec |
|---|---|
| Subtitle | Top-left, x 150, first line y ≥ 132 (clears the Douyin watermark), ≤ 2 lines. Ivory `#FFF3D8`, red key words `#EE4B3B`, soft dark edge + borderless feathered shade (no box). Typed reveal ≤ 0.4 s; T1–T4, V3 and E3 appear whole on their cut or hit. Verbatim from `lines_bars.json`. N2 is **centred** at the same height, with the ½ em ？ pull-back and the ink centre measured. **Q is not a top subtitle:** it types into the end card's question slot on b76.5, centred there with the same ？ rule. |
| Stamp | Top-right, right-aligned to x 1830, red rule at x 1856 from y 92. Line 1 `— 年份 · 地点` 56 px. Line 2 40 px, ≤ 14 字. Line 3 34 px, only on stamps held ≥ 4 s. Teaser cuts: line 1 only. A stamp changes on its scene's first downbeat. |
| Corner mark | **The OLD series mark** (owner, gate 2a): 21 px light, 0.3 em tracking, 62 % opacity, grey ◆. Top-right, ink ≈ y 44–66. The stamp starts ≥ 28 px below it. The gate-2a stills show the 30 px mark: ignore that. |
| Era chip + counter | Bottom-left: red vertical chip (北宋 · 金 · 元 · 明 · 清 · 民国 · 新中国; 伪满 is never a chip) + `你 约N 岁` (88 px numerals). The counter rolls like an odometer and never stops on 250. Hidden in the hook, the title, the teaser, the present day, D1, the b56 peak bar, the E4 flip-book (b66 → b67.5; settled in script v2.3.1) and the end card. |
| Tally | Right of the counter: `出 ○○○○  进 ○○○○○` (≥ 40 px), label `四出五进 —— 故宫博物院` (≥ 40 px). Marks fill red on their beats: 进 b15.0 · 出 b15.75 · 进 **b24.5** · 出 b27.5 · 进 b33.5 · 出 b35.25 · 进 **b38.0** · 出 b42.0 · 进 b57.5 (complete; all nine flash red b58.0). E4: the four 出 flash **b66.0 / 66.25 / 66.5 / 66.75** (the tally stays up while the chip and counter hide). It hides with the rest of the HUD for the b56 peak bar. |
| Labels | Noto Serif CJK SC Black **≥ 56 px** (owner row 76; the serif is kept per row 103; Noto Sans CJK SC Bold if one fails at 480 px), ivory with a thin dark halo + feathered scrim (pond rule), only in the mid band (y 560–820). They leave **before** any transition starts (owner row 86). |
| Safe zones | Subtitle zone x 120–1120, y 100–340 is quiet in every composition: sky, wall, haze or vignette. Stamp zone x 1280–1870, y 36–300 is quiet. Counter zone x 120–1100, y 880–1040 is dark: deck, floor, table or vignette. Key visuals live in x 200–1700, y 300–880. **Glow-lock point: (960, 580)**, the title band's centre (r2; it was 1250, 600). The title and the four teaser cuts share it, and T4 → N1, Y1 (b50.5) and E6 use it. |
| End card | Juno end card from the engine: J monogram, gold title 假如你是清明上河图, the question, follow pill `关注 Juno · 一起看懂世界`, the sources line from script.md. |

## Build: how this is made (a standalone three.js page, `film/`)

- **The page.** `film/film.html` loads `main.js`, an esbuild bundle of `film/src/main.ts` (three r178).
  - It exposes `window.renderAt(t)`, `READY` and `DURATION`.
  - The HUD is HTML over the canvas, rebuilt from `t` every frame.
- **Frames are functions of time.** Each scene is `{a, b, draw(u, t, hud)}` in `timeline.ts` and carries no state between
  frames. So any frame renders on its own, and a re-render (the E3 flashes, the E4 flip-book) is a call, not a copy.
- **Grabbing.** Playwright (`playwright-core`) drives the page in Chromium on Modal T4 with Vulkan ANGLE.
  - `stills.mjs <outDir> t1 t2 …` renders stills; `chunk.mjs <outDir> <from> <to> <fps>` renders frame ranges.
  - 1080p, no grain. The music (`audio/bgm_cut.wav`, untouched) is muxed afterwards.
- **Modules (`film/src`).**
  - **`core.ts`:**
    - the frame grid (1920 × 1080 px, x right, y down), `bar(j)` and easing;
    - `Stage`/`Layer`: 2.5D cards authored in frame px at a depth z, so framing holds at rest and parallax appears when
      the camera moves;
    - rim light from the hero's projected position, and selective bloom (`initPost`, `renderStage`);
    - `composite()`, which mixes two stages through a transition mask, plus a `Grade`. The masks: 0 A only · 1 cut ·
      2 wipe with a roller shadow · 3 ink bleed · 4 ripple · 5 iris · 6 foreground band · 7 dissolve · 8 light burst;
    - `Motes` (snow, embers, dust) and `Live` canvas layers;
    - **not used:** mode 7 between scenes (no crossfades), and mode 8 or `grade.flash` (no flash on the title or the
      peak).
  - **`crest.ts`:** the 虹桥 stage. `deck(x)` is the arch top: 10° at ±500 px from the centre, 16° at the ends. It also
    holds the skies, the eras (far-bank palace, hats), the water and the camera presets.
  - **`rooms.ts`:** STORE (`scrollHeap`), XBL and ROOM-元. Still to add: DESK, MING-LANE, MING-HALL, WUMEN, RESTO and WALL.
  - **`draw.ts`:** SVG builders for roofs, halls, the city gate, the woven arch, railings, lanterns, boats, willows, bank
    crowds, the dagoba, the 角楼 and 午门, and hills.
  - **`figures.ts` + `gaits.ts`:** one-tone profile silhouettes (a port of ep37's Figure4).
    - CMU mocap gaits, robes drawn as a hull over the legs, era heads and costumes.
    - `reach()` (2-bone arm IK, so a hand lands exactly on a prop point), `handAt()` and `plant()`.
    - Contact poses: `carryScroll`, `holdOpen`, `handOver`, `bow`, `kneel`, `bendTable`, `carryArmful`,
      `underArmRoll`, ….
    - `tools/figsheet.mjs` prints the pose sheet.
  - **`actors.ts`:** figures on live canvas layers (`Cast`, rimmed by the hero), and you: `drawSilk` (open silk between
    rollers, a window into a painted canvas), `drawRoller`, `drawRoll`, `drawBundle`, `glowBlob`.
  - **`silk.ts`:** the 界画 painter (Canvas 2D, no scan, L1).
    - `paintSection('river' | 'gate' | 'shed' | 'end' | 'colophon')`.
    - `paintRelief()` returns 5 canvases: far sky/haze, far bank, river + boats, bridge, near roofs/trees.
    - `paintSeal`, `stampSeals`, `silkWeave`. Each canvas carries its patch rect, glyph boxes and seal slots.
    - Looks: lantern-silk mono (the default), full colour (the peak only), dead grey (copies). Donkey-patch states.
  - **`hud.ts`:** subtitles (typed reveal, the ？ rule, lines that appear whole on a hit), the stamp, the old corner mark,
    the chip + odometer, the tally, labels, the title ink and the Juno end card.
- **Body logic (owner rows 74 and 101; figure-rules R1–R8).**
  - Every hand that touches something is placed with `reach()` on a declared target point. Feet use `plant()` on
    `deck(x)` or the floor line.
  - On the arch, feet are planted step by step with 2-bone leg IK, because a flat-ground gait would float or sink a foot by
    14–26 px on the slope. The alternative is to keep a walk where the slope is under ~10°.
  - **The gate before any still with a person** is a per-frame contact checker over the real scene frames (to add:
    `film/tools/contact_check.mjs`). It checks:
    - each declared hand within 4 px of its target;
    - planted feet within 3 px of `deck(x)` or the floor;
    - seated hips on their surface;
    - no hand or foot inside the railing or table rectangles.
  - It prints PASS and the worst frame, as ep35's `push_check.mjs` did.
- **Kit additions this board needs** (director note 14):
  - a rectangular **pane** mask (lanterns in the glass; the XBL window);
  - a **directional smear** for the E3 cuts;
  - **picture-in-picture** (the shrink into the record; 杨准's replay);
  - a **light-edged wipe** (the daybreak);
  - title ink clipped to the band's projected rect;
  - E3's words turning red one per beat, and Q in the end card's slot;
  - the SILK strip in tiles (about 4096 × 1536), uploading only what a shot sees;
  - the contact checker.
- **Medium per scene** (owner row 42).
  - 2.5D three.js for every stage.
  - A SILK insert is the painter's canvas on a plane inside a camera move, so every push into or out of the silk is one move.
  - The HUD is HTML. No 3D models.

## Sets: the 虹桥 crest + 10 reusable sets

| Code | Set | Dressings / variants | Top-left stays quiet because… | Scenes |
|---|---|---|---|---|
| **CREST** | **The 虹桥 crest, the handover stage.** Woven timber arch, deck, railing with lanterns on the posts, the river and a boat that lowers its mast, the bank crowd, the far-bank palace slot (left), the dark road (right). | **Skies:** DUSK, DAY, NIGHT, FIRE, SNOW-NIGHT. **Far bank:** P-宋 宫城门楼; P-元 大都 skyline + White Dagoba; P-明 紫禁城 角楼; P-清 紫禁城; P-1923 紫禁城 under snow; P-1950/今 紫禁城 in daylight, gate open, **no plaque**. **Lanterns:** lit / out. **Weather:** snow, embers, smoke. **Cameras** (all side-on: the kit is upright cards, so a "tilt" is a vertical pan of the look-point, never a rotation over the cards): CR-A medium two-shot (gate-2a key: figures ≥ 45 % of frame height, open scroll ≥ 420 px); CR-B locked wide (arch spans the frame); CR-C lateral track at deck level (may be raised ≤ 10°); CR-D low framing (look-point low, zoomed) with a near boat plane in front of the arch; CR-F vertical pan from the river or sky. **CR-E and CR-G are retired (r3).** | sky | 01, 02 (defocused, behind the title), 04, 05, 08, 10, 14, 16, 20, 22, 24, 25, 29, 33, 34 |
| SILK | **The painting (you), full frame.** Sections: 汴河 boats + 虹桥; city gate + streets; the straw shed; the painting's last section with its bare corner; the colophon paper (张著's columns 翰林张择端…藏者宜宝之…燕山张著跋, 杨准's columns with a replay slot, 冯保's columns, other colophons as illegible stand-ins); seals as stand-ins (嘉庆 五玺 slots). | mono / colour / grey · relief · patch states | vignette | 01, 02 (the title band), 09, 11–13, 21, 23, 28, 30–31 |
| ROOM-元 | Yuan palace mounting room (the gate-2a hook still): round moon window with the White Dagoba, hanging lamp, long table, hanging scrolls on the wall. | dusk / night | dark wall | 03, 15, 32 (换) |
| DESK | **One writing-desk set, four dressings.** 北宋 painter's studio (B1). 金 张著's desk (Z2, Z5). 元 杨准's southern study at warm lamplit dusk (rectangular lattice window, banana-leaf green, bamboo). 清宫 night room with the ledger (P3). | window shape, lamp, props, costume | wall / window shade | 09, 12–13, 17, 25 |
| MING-LANE | Ming house at night from the back lane: front gate (left) with torchlight behind the roofs, back gate (right), the friend's door. | — | night sky | 18, 32 (藏) |
| MING-HALL | Doorway enfilade (moon gate, vase gate, hall door) → 严府 hall (`#4A3F36`, lit by hall lamps) with treasures in silhouette, a table, the lacquer box in oxblood `#6A2E24`; the hall doors for the 封条. | — | dark ceiling | 19 |
| XBL | 伪满 小白楼 (图书楼): small two-storey building in a courtyard with one tree (seasons). Inside: shelves of closed slatted wooden boxes, double doors, floor. Wall `#3A4046`; the tree in real seasonal colour. | seasons · 1945 night | sky / dark interior | 26 |
| STORE | 沈阳 临时库房 (wall `#4A4038`): heaps of rolled scrolls, shelves, a long table with three rolls at its end, a reject crate within the seated researcher's reach, a small 1950s desk lamp (green enamel shade, researcher to confirm). | lamp off / on | dark ceiling | 06, 27, 28 |
| WUMEN | 午门: exterior with the 马道 ramp (queue / empty), the gate passage, the exhibition hall (`#464C52`) with the glass case (its front pane is the pane mask) and the plinth card, the storage aisle (`#3E454A`) with boxes. The gate passage is warm-lit, its far opening always visible. | 2025 night · today day · empty | night sky / dark hall ceiling | 07, 34–37 |
| RESTO | 1973 restoration room: long table, overhead fluorescent tubes, magnifier lamp on an arm. | — | cool wall | 30, 31 |
| WALL | The wall of copies: a long gallery (`#3E454A`, warm lamp spill) of shelves with ~100 grey copies lying half-open (each a grey 虹桥), one glowing. | — | dark | 32 (抄) |

**Props.**
- **You:** open / rolled / in a cloth bundle / in a slatted box / in a storage box.
- **Copies:** grey copies (open and rolled); the two 「真迹」 slips; the battered roll with torn edges.
- **Containers:** cloth bundles (包袱); a lacquer box; a slatted wooden box; a museum storage box.
- **Ming confiscation:** a cart with a 封条-sealed crate; 封条 strips.
- **Carriers:** Song refugee carts; Qing procession boxes.
- **Paper:** the 1923 ledger page; the glass case and the plinth card.
- **Lights:** lanterns, the hanging lamp, torches, headlights (on car silhouettes), the 1950 desk lamp, fluorescent tubes,
  the magnifier lamp.
- **Tools:** brush and inkstone, tweezers.
- **The magic marks:** seal **impressions** appear by themselves; no seal object and no hand.

**Cast.** All one tone and in profile, whole figures standing on a surface. No back three-quarter or from-behind views: the kit draws profiles (director note 9). The researcher confirms each silhouette before
the build (owner row 121).
- **宋:** court officials in 展脚幞头, the painter in a soft 幞头, refugees.
- **金:** 张著 in a scholar's cap.
- **元:** the craftsman in a plain cloth cap (gate-2a), the 权贵 and the officials in 钹笠 brimmed hats, 杨准 in a Han
  scholar's cap.
- **明:** 陆完 in a square scholar's cap, his friend, officials in 乌纱帽, the eunuch in a eunuch's hat (shape TBC),
  box-carriers.
- **清:** officials in Qing caps with a top knob.
- **1923:** a young man in a long gown and 瓜皮帽, in profile (one tone, no features), never 溥仪.
- **1945:** guards in long coats and peaked caps, faceless.
- **1950:** the researcher and the staff in cadre jackets.
- **1973:** restorers in smocks (shape only, one tone).
- **Today:** visitors (a child walks beside a parent; no one rides on shoulders), and staff (one tone, no gloves).

---

## Line ↔ bar map (r3: `lines_bars.json` v2.3, line for line)

These are the file's start times, unchanged. The board never moves a line. If a picture beat ever needs a different line time,
it goes to the screenwriter as a request with pace.py output; none is open in r3. Times are film seconds.

| Lines | Start bar → s | | Lines | Start bar → s | | Lines | Start bar → s |
|---|---|---|---|---|---|---|---|
| H1 | 0 → 0.00 | | I2 | b23.5 → 54.66 | | **Y1** | **b50 → 114.66** |
| H2 | b1 → 3.71 | | W1 | b25 → 58.05 | | Y2 | b51.25 → 117.49 |
| **Title** | **drop 1's hit → 9.05** (cut on the 8.96 pickup) … b4.5 | | W2 | b26.5 → 61.45 | | Y3 | b52.75 → 120.88 |
| T1 | b4.5 → 11.64 | | W3 | b28 → 64.85 | | **Y4** | **b54 → 123.71** |
| T2 | b6 → 15.03 | | M1 | b29.5 → 68.24 | | R1 | b57 → 130.51 |
| T3 | b7 → 17.30 | | M2 | b31 → 71.64 | | D1 | b58.5 → 133.90 |
| T4 | b8 → 19.56 | | M3 | b32.5 → 75.03 | | D2 | b60.5 → 138.43 |
| N1 | b9 → 21.83 | | **F1** | **b34 → 78.43** | | E1 | b62.25 → 142.39 |
| N2 | b10.5 → 25.22 | | F2 | b35.5 → 81.83 | | E3 | b64 → 146.36 |
| S1 | b11.5 → 27.49 | | Q1 | b37.5 → 86.36 | | E4 | b66 → 150.88 |
| B1 | b13 → 30.88 | | Q2 | b39 → 89.75 | | E5 | b67.5 → 154.28 |
| BO | b14.5 → 34.28 | | P1 | b41 → 94.28 | | E6 | b69 → 157.68 |
| Z1 | b16 → 37.68 | | P2 | b42.5 → 97.68 | | E7 | b72.25 → 165.03 |
| Z2 | b17.5 → 41.07 | | P3 | b44.5 → 102.20 | | **E8** | **b74 → 169.00** |
| Z3 | b19 → 44.47 | | V1 | b46 → 105.60 | | Q | b76.5 → 174.66 (in the end card's slot) … 184.30 |
| Z4 | b20.5 → 47.86 | | V2 | b47.5 → 109.00 | |  |  |
| Z5 | b22 → 51.26 | | **V3** | **b49 → 112.39 (whole, on the stop's hit)** | |  |  |

**Picture-only stretches (no subtitle), each a named beat in a scene row:**
- 7.11 → 9.05: the wind-up (01);
- 9.05 → 11.64: the title (02);
- 128.24 → 130.51 (b56 → b57): the relief, HUD hidden (28);
- 141.83 → 142.39 (b62 → b62.25): the crane starts (31);
- 162.20 → 165.04 (b71 → b72.25): the moral picture, then the lights die (34–35);
- 172.39 → 174.66 (b75.5 → b76.5): the card alone, then the end card (36–37).

**Floors.** The script's "Below the floor" table (v2.3) is the authority. The picture supports each case:
- **Title:** 2.59 s from the hit to the T1 cut (b4.5), against its 2.39 s reading time.
- **N1 3.40 and N2 2.26** (floors 3.5 and 2.64): N2 is followed by the b11 → b11.5 picture pause.
- **BO and M1:** 3.40 against 3.5.
- **V3 2.26:** shown whole on the b49 hit, like T1–T4, so the typed floor doesn't apply.
- **Y1 2.83 and Y3 2.83:** each is line 1 and stays through the next line (6.2 s and 7.4 s on screen). The 真迹 rolls go grey
  on b53, a beat after Y3 appears.

## Scenes

Notation:
- `b15.25` = bar 15, beat 2.
- `[TOUCH: …]` = a figure must touch the scroll (or its box or roll) at that point. The hand aims at a real point on the
  object, never from off-screen. It is placed with `reach()` and checked per frame by the contact checker (Build).
- Subtitles are top-left unless the row says otherwise.
- **Sound: none in any scene. Music only.** The Sound column names the music event the picture rides.

| # | Bars · time | Shot & camera (medium) | Key visual | Text (lines · stamp · chip/counter) | Motion beats on the music | Transition OUT (motivated by…) | Sound |
|---|---|---|---|---|---|---|---|
| 01 | 0 → drop 1 · 0.00–8.96 (the cut; the title's contact is 9.05) | **One continuous take, the film's longest.** SILK full frame, already tracking right→left (as a handscroll is read) on frame 0. **b0.75 → b1:** pull back **out of the silk** onto CREST CR-A, dusk. **From b2.5:** a lateral track right at a third of the walkers' speed, speeding up into the drop. three.js (the silk is a plane in the CREST stage). | **Frame 0:** the glowing 虹桥 section fills the frame: the boat under the arch with its crew lowering the mast, the bridge crowd leaning over the railing, a cart crossing, the river. It must read as a painting on silk (vignette, weave, ink linework), not as scenery. The mast, the railing figures and the cart are separate sprites, built once and reused at the peak. **Then** the same painting is held open on the real 虹桥 at dusk by two era-neutral silhouettes [TOUCH: each figure's hands on a roller]. The painted bridge rhymes with the real one. Small bank figures at both ends of the bridge stand in profile, turned to your light (人人都想留住你). **Then** you are rolled up and carried off right while the crest goes dark behind you. | H1 on frame 0 with its first glyphs already typed. H2 at b1. **Both clear on b2.5**, so the wind-up and the drop carry no subtitle. Stamp 「— 《清明上河图》」 (line 1), legible from frame 0, cleared on b2.5. No chip/counter. | **f0:** camera and mast already moving. **0.57 (first note):** the mast drop speeds up, the painted figures at the railing raise their arms, and the cart rolls on. **b0 (1.45):** 留住 turns red; a sheen crosses the silk. **b0.5:** the track eases into a half-beat hold (wind-up). **b0.75 → b1:** the pull-back, slow → fast, settling on b1. **b1.5:** the real boat below lowers its mast (rhymes with frame 0). **b2:** they roll you up [TOUCH: both hands on the roller ends]. The light on the crest shrinks with the silk, and the rims on the bank figures go out from the ends inward. **b2.5:** they turn and walk off right (出), one step per beat. The front figure carries the roll under his arm [TOUCH: roll clamped under the upper arm, forearm under its end]. The bank figures' heads follow you, and the camera starts its track. **b2.75 · b3.0 · 8.78:** the six lanterns die in pairs, from the palace side toward you; the last pair goes on the track's breath. **8.78 → 8.96:** the darkest frame of the opening, still moving (owner row 91). Your glow, its rim on the carrier's sleeve and the last dusk in the sky remain (mean luma ≥ 45). The walkers step on and the track keeps going. Your glow has drifted to frame right (x ≈ 1710, y ≈ 580), and it trembles and swells 3 % (pauses.md wind-up). | **Glow-locked hard cut on the pickup (8.96)**, the film's first cut. The title band's right roller stands exactly where your glow was, and the band's slam lands on the hit (9.05). Motivated by drop 1 and the glow: the eye never leaves you. | Intro, no bass → the breath 8.78 → pickup 8.96 |
| 02 | drop 1 → b4.5 · 8.96–11.64 (contact 9.05) | TITLE: three.js silk band + HUD, over the crest at night, out of focus. | **You, opened.** A glowing silk band 1500 × 330, centred on the lock point (960, 580), with the blue mount ends and ivory roller knobs of the stills. In ink `#2A1F17`: 「假如你是」 (64 px, tracking 0.35 em) over 「清明上河图」 (170 px, Noto Serif CJK SC Black). It is built from the film's own silk (owner row 90) and sized like a plaque (owner row 38). Behind it is the crest you just left, dark and soft: dead lanterns, the far-bank skyline low, the night sky `#1F2E38 → #2E404B`. The surround stays ≥ 30 and the frame mean ≥ 45 (note 6). | Title only: no subtitle, stamp or counter (the corner mark stays). The ink is centred by pixel measure. It is clipped to the band's projected rect and moves with it, so it never floats over the night before the silk opens. | **8.96 (cut):** the right roller stands at x 1710 and the left roller flies left. **9.05 (the hit: crash + sub-bass):** it slams to its stop at x 210 after 3 frames of flight and overshoots 12 px. A damped jolt follows, with its second bounce on **b3.5 (9.37, the opening's loudest attack)**, while the band scales 1.04 → 1.0. **No flash:** the lit area grows with the opening and peaks at the silk's own value. The bloom threshold stays above the silk's base, so the ink is crisp. **b4.0 (10.51):** a glint runs along the band left → right, the reading direction. **b4.0 → b4.5:** hold. The title is readable for 2.59 s from the hit. | **Glow-locked hard cut (b4.5)** into T1: the band becomes your silk lying open on the Yuan table, centred on the same point. The title says who you are, and the cut shows the first thing done to you. There is no exit move: the cut is the exit. | **Drop 1: the hit at 9.05**, sub-bass full by 9.10 |
| 03 | b4.5 → b6 · 11.64–15.03 | ROOM-元, night: the hook-still set, recomposed so your silk lies centred on the lock point. 3 % push. | Your glowing silk lies open on the table, its 虹桥 legible. The bowed craftsman (cloth cap) stands behind it at left, one hand on the grey copy's roller [TOUCH]. Behind, at right: the round window with the White Dagoba, and the hanging lamp. | T1 (whole on the cut). Stamp 「— 元 · 1351年前」. | **b4.5:** the stamp slams. **b4.75:** he slides the grey copy right into your place [TOUCH: hand on the copy's roller] and draws you off with the other hand [TOUCH: hand on your roller]. **b5.0:** the grey copy lies exactly on the lock point where you were. **b5.5:** he gathers you up [TOUCH: both hands on your roll] and steps out of frame right. His rim fades as your glow goes. **b5.75 → b6:** only grey is left under the lamp. | Hard cut (b6). T2 opens with your glow back on the lock point. | Sub-bass on the off-beats |
| 04 | b6 → b7 · 15.03–17.30 | CREST CR-C lateral track, NIGHT, lanterns out, P-明 角楼. | The eunuch walks right with your roll under his arm [TOUCH: roll clamped under the upper arm, forearm under its end]. His sleeve is lit. | T2. Stamp 「— 1578 · 紫禁城」. | **b6:** the stamp slams. He takes one step per beat, and the camera tracks so the glow stays on the lock point. | Hard cut (b7), glow-locked. | |
| 05 | b7 → b8 · 17.30–19.56 | CREST CR-B wide, SNOW-NIGHT, P-1923. A slow pan holds the bundle on the lock point. | A young man in a long gown and 瓜皮帽 (in profile, one tone, not 溥仪) crosses right hugging a cloth bundle. Glow leaks through the cloth [TOUCH: both arms round the bundle]. Snow lies on the railing, and warm windows glow on the far bank. | T3. Stamp 「— 1923 · 紫禁城」. | **b7:** the stamp slams. Snow falls; he steps on the beats. | Hard cut (b8). The glow stops moving. | |
| 06 | b8 → b9 · 19.56–21.83 | STORE, lamp off. Very slow push. | Heaps of rolled scrolls as dark shapes against the mid-tone wall (`#4A4038`), in a cool spill from a high window (mean ≥ 45), with one faint glow buried on the lock point. | T4. Stamp 「— 约1950 · 沈阳」. | **b8:** the stamp slams. Then a picture pause on the lighter music: only the push and the dust. | **Light + shape match (b9):** the buried glow becomes the case light at the top of the 午门 ramp, and the heap's shapes become the queue's heads. | **Phrase change b8** (lighter top end) |
| 07 | b9 → b11.5 · 21.83–27.49 | WUMEN night. **b9:** crane up the ramp. **b10:** through the gate passage (warm-lit, its far opening visible) into the hall. **b10.5:** slow push on the case. | The queue snakes up the 马道 toward one warm point: you, in a glass case on the lock point. Inside, the crowd shuffles past, their profiles lit only by you. **Then your glow goes out:** the empty case, dim, its front pane dark. A card stands on the plinth: 「撤展回库」「下次展出：未公布」 (set-up for E8; it needn't be read here). | N1 (b9). N2 **centred** (？ pull-back) at b10.5. Stamps 「— 2025 · 故宫午门 / 故宫百年 · 展了一个月」 → b10.75 「— 2025年10月30日 / 撤展回库」. No counter. | **b9–b9.75:** the queue steps forward on the beats (time-lapse). **b10:** into the hall; the crowd files past in seconds. **b10.5:** N2 asks; the crowd thins. **b10.75:** your glow goes out, and the last visitor leaves the frame. **b11:** the card is there. **b11 → b11.5:** nothing new appears (picture pause). The push and the dust keep moving. Frame mean ≥ 40 (a named darkest beat), held up by the hall's other lights and the lit card. | **Lanterns in the glass (b11.5 → b11.75):** on b11.5, warm points light right → left in the case's dark front pane (the crest's lanterns), with a dusk sky behind them. The camera pushes through the pane (one thin highlight line crosses the frame) and arrives on the crest. Motivated by N2's question: the glass you lay behind shows where your life was played. | |
| 08 | b11.5 → b13 · 27.49–30.88 | CREST CR-B wide, 宋 DUSK, P-宋 gate far-left. The push through the glass eases into the locked wide by b11.75. | The empty stage: lanterns, the boat, the bank crowd. The direction rule is shown once: dark spreads **right** along the deck into the road; warm light runs **left** toward the palace. | S1 (types on b11.5, over the pane). No stamp. The tally draws itself (hollow). Counter not yet. | **b11.5 → b12.0:** the lanterns light right → left, two per beat (begun in the pane). **b12.0:** the 出 row draws as a shadow runs right along the deck. **b12.5:** the 进 row draws as the light runs left. | **Ink-trace morph (b13):** the real crest is traced into ink lines sweeping right→left, and dusk drains into silk: the stage becomes the painting. | |
| 09 | b13 → b14.5 · 30.88–34.28 | SILK: track right→left over the city painting itself in. **b14:** pull back to DESK (北宋 studio). | 汴京 draws itself stroke by stroke. Then the painter (whole figure in profile, soft 幞头) at a long table, lit only by the silk. | B1. Stamp 「— 北宋末年 · 汴京 / 画成，未署名」. Chip 北宋 · 你 0 岁 (appears b13). Labels 「5米多长」 (b13.5) and 「几百个人」 (b14.0), ≥ 56 px in the mid band, gone by b14.25. | Strokes land on beats. **b14.25:** he rolls you up [TOUCH: both hands on the roller] and holds the roll out to his left, where a court official in 展脚幞头 takes it [TOUCH: both on the roll]. | **Match on action (b14.5):** the roll moving left in his hands continues as the roll carried left across the crest. | |
| 10 | b14.5 → b16 · 34.28–37.68 | CREST CR-B wide, 宋 DUSK → FIRE. | Two court figures carry you left toward the 宋 gate [TOUCH: each holds one end of the roll]. Then fire-glow, smoke and the palace darkened. Your glow comes back out of the gate among refugee carts streaming right, half hidden behind a cart. **No figure is seen taking you** (C5). | BO. Stamp 「— 北宋 · 宫廷 / 首次入宫（故宫博物院）」 → b15.5 「— 1127 · 汴京 / 靖康之变，流入金国」. Chip 北宋 0 → b15.5 金 · 你 约27岁. | **b15 (lift):** 进 ①. **b15.25–15.5:** the sky turns to FIRE. **b15.75:** 出 ①. | **Push into the drifting glow (b15.75 → b16):** the camera dives into your light and it resolves into your silk (insert entry 1). | Lift b15 → full section b16 |
| 11 | b16 → b17.5 · 37.68–41.07 | SILK insert: the painting's last section. | The camera searches the corners: lower-left (b16.25), upper-left (b16.75). Bare silk, no signature. | Z1. Stamp 〃. Counter rolls 约27 → 约86, landing on b17.5. | A soft pool of light moves with the camera. **b17.0:** the search stops on the bare corner (one beat of nothing new). | **Slide past the join (b17.25 → b17.5):** the camera slides left across the seam onto blank paper, landing as Z2 appears. | Full section from b16 |
| 12 | b17.5 → b19 · 41.07–44.47 | SILK paper → pull back to DESK (金). | Ink columns appear right→left. Then 张著 (whole figure, seated, in profile) with the brush on the paper [TOUCH: brush tip at the newest column; left hand flat on the paper's edge], lit by your glow from the open painting at his right. **No brush enters from off-screen.** | Z2 (line 1, stays through Z3). Stamp 「— 1186 · 金国 / 张著题跋（今在卷尾） / 落款：清明后一日」. Chip 金 · 你 约86岁. | **b17.5:** the first column writes. **b17.75 → b18.25:** pull back. **b18.5:** the brush finishes a stroke. | **Pan down + push into the column (b18.75 → b19):** insert entry 2, into the writing, landing as Z3 appears. | |
| 13 | b19 → b23.5 · 44.47–54.66 | SILK colophon insert, one continuous move: push, vertical pan, track, pull back. | 「翰林张择端」 lights up big (≥ 120 px glyphs). Then 藏者宜宝之, one character per beat (≥ 140 px). Both vertical columns sit at **x 1200–1700, y 320–1000**, clear of the counter zone. Then the pull-back shows the colophon joined to your tail on 张著's desk. | Z3 (line 2) · Z4 (line 1, stays through Z5) at b20.5 · Z5 (line 2) at b22. Stamp 〃 + line 3. Chip 金 · 约86. | **b19.0 → b19.5:** 翰林张择端 glows as Z3 is read. **b20.5:** track left along his columns as Z4 types. **b21.0 / 21.25 / 21.5 / 21.75 / 22.0:** 藏 者 宜 宝 之. **b22.25:** pull back. **b23.0:** 张著 rolls you up from the tail end [TOUCH: both hands on the roller]. | **Roll-up wipe (b23 → b23.5):** the roller sweeps left→right across the frame and reveals the Yuan crest behind it. | |
| 14 | b23.5 → b25 · 54.66–58.05 | CREST side-on wide (CR-B framing), 元 DAY, P-元 大都 + White Dagoba far-left, people on the bank. **b24.5 → b25:** a slow push along the deck toward the Dagoba. | Officials in brimmed Yuan hats carry you left [TOUCH: hands on the roll ends], in front of the far-bank wall's shaded face so your glow leads against the day sky (its top 340 px stay ≤ `#5E7A82`). | I2. Stamp 「— 元初 · 元朝宫廷 / 再次入宫（故宫博物院）」. Chip 元 · 你 170多岁. | **b24.0:** they reach the crest. **b24.5:** 进 ②, and the push begins. | **Match through the round window (b25):** the Dagoba outside becomes the Dagoba framed by the mounting room's round window from inside. | |
| 15 | b25 → b26.5 · 58.05–61.45 | ROOM-元, dusk in the window: the gate-2a hook still, longer (pays off T1). The window's teal → amber dusk is the colour. | The craftsman's hand flat on your silk [TOUCH]. | W1 (line 1, stays through W2). Stamp 「— 元 · 1351年前 / 裱画匠调包（杨准记） / 杨准原话："以似本易去"」. Chip 元 · 你 **200多**岁. | **b25.5:** he lays the grey copy where you lay [TOUCH: copy's roller]. **b26.0:** he rolls you up [TOUCH: both rollers]. **b26.25:** he cups the hanging lamp [TOUCH: hand round the lamp]. | **Lamp-out match (b26.5):** the lamp dies, and on the same beat the crest's lanterns go out. Secrecy motivates the night. | |
| 16 | b26.5 → b28 · 61.45–64.85 | CREST CR-A medium two-shot (the gate-2a key composition) **relit for NIGHT**, lanterns out. | The secret sale. The craftsman (cloth cap) and the 权贵 (Yuan brim) hold you open between them, faces close, both profiles rimmed by you [TOUCH: four hands on the two rollers]. A few warm windows on the 大都 skyline far left keep colour in the night. | W2 (line 2). Stamp 〃. Counter 200多. | **b27.0:** they roll you closed and the craftsman lets go. **b27.5:** the 权贵 turns right with the roll under his arm [TOUCH], 出 ②. | **Shrink into the record (b28):** this shot shrinks into a tiny vignette (picture-in-picture) inside 杨准's column. The scene becomes the written record of itself. | |
| 17 | b28 → b29.5 · 64.85–68.24 | DESK: 元 southern study (`#4A3E30`) at warm lamplit dusk, banana-leaf green and bamboo in the lattice window. Pull back from the column. | The replay plays inside his column as tiny silhouettes (craftsman, copy, hand-over). 杨准 (whole figure, seated, in profile) writing on your tail [TOUCH: brush tip on the paper; other hand on the paper]. | W3. Stamp 「— 1351 · 江西泰和 / 文人杨准买下，次年题跋」. Chip 元. Counter 200多 → **约251** at b28.5 (passes 249 → 251; never rests on 250). | **b28.0–29.0:** the replay runs once. | **Ink-bleed (b29.25 → b29.5):** his newest column's ink spreads and becomes the night sky over a Ming house. | Splice b28 (inaudible) |
| 18 | b29.5 → b31 · 68.24–71.64 | MING-LANE, night, from the back lane. | Torchlight (`#FFB868`) gathers on the roofs at the front gate (left), with officials' hat silhouettes and no violence. At the back gate (right) 陆完 (whole figure, Ming robe, square cap) hands your roll to a friend [TOUCH: both on the roll]. | M1. Stamp 「— 明 · 正德年间 · 苏州 / 陆完藏画友人家（余辉考）」. Chip 明 · 你 400多岁. | **b30.0:** the hand-over. **b30.5:** the friend's door closes; a sliver of light under it, gone by b30.75. | **Door wipe (b31):** the closing door's dark panel wipes into the first doorway of the enfilade. Not three dissolves. | |
| 19 | b31 → b33 · 71.64–76.17 | MING-HALL (`#4A3F36`, hall lamps): the camera pushes through three doorways, then the hall, then outside the hall doors. | At each doorway a whole figure carries the oxblood lacquer box (`#6A2E24`) with glow at its seam [TOUCH: both hands on the box]. The 严 hall: treasures in silhouette, the box on a table. Then two officials in 乌纱帽 slap 封条 across the hall doors in an X [TOUCH: hands on the strips at the doors]. | M2 (line 1) · M3 (line 2) at b32.5. Stamp 「— 明 · 中期 / 辗转归严嵩（故宫博物院）」 → b32.5 「— 明 · 隆庆年间 / 严家被抄入宫（故宫博物院）」 (line 2 shortened, gate-1 carry-forward 3). Counter 400多 → b32.5 约470. | **b31.0** moon gate · **b31.5** vase gate · **b32.0** hall door. **b32.25:** the doors swing shut in front of the camera. **b32.5:** the 封条 slap (impact). | **Graphic match on the 封条 X (b33):** the X stays put while the doors become a sealed crate on a cart. | |
| 20 | b33 → b35.5 · 76.17–81.83 | CREST CR-B locked wide, 明 DUSK → NIGHT in one shot. From b34.5, CR-C tracking (T2's framing). | A confiscation cart with the sealed crate crosses left, Ming officials alongside [TOUCH: carters' hands on the shafts]. Then the night theft: the eunuch walks onto the crest from the palace side, heading right, your roll under his arm [TOUCH: roll clamped under the upper arm] (pays off T2). The 角楼's windows glow warm once night falls. | M3 → F1 (line 1, stays through F2). Stamp → b34 「— 1578 · 紫禁城 / 冯保偷盗而出（故宫博物院） / 冯保跋："心思爽然"」. Counter 约470 → 约478 during the sky change. | **b33.5:** 进 ③; the cart exits left. **b33.75:** the sky darkens to NIGHT by b34. **b34.0–34.75 (bass out):** lanterns go out, one per beat. **b34.0:** the eunuch appears. **b34.5:** the camera starts to track. **b35.25 (bass back):** 出 ③. | **Foreground body wipe (b35.5):** he passes close to the lens, and his robe fills the frame for 4 frames. | **Breakdown starts b34** |
| 21 | b35.5 → b37.5 · 81.83–86.36 | SILK insert: the bare end of the painting, then a fast eased track left along the tail. | Z1's bare corner (callback). Then 冯保's colophon columns (x 900–1700) light one per beat. **He is not shown writing** (C20 order unknown). One place to look at a time: no split screen. | F2 (line 2). Stamp 〃 + line 3. Chip 明 · 约478. | **b35.5:** the bare corner. **b35.75 → b36.0:** the track. **b36.0 / 36.25 / 36.5 / 36.75 (the bass-less bar):** four columns light. **b37.0:** hold; the joke lands. | **Silk → water ripple (b37.25 → b37.5):** the paper ripples into the river surface, and we arrive at the water line. | Bass-less bar 36 |
| 22 | b37.5 → b39 · 86.36–89.75 | CREST CR-D: a low framing (look-point low, zoomed; no real tilt), 清 DUSK, lanterns lit, people on the bank. A near boat plane in front of the arch (z > 0); the 紫禁城 seen under the span. | A procession of Qing officials (caps with a top knob) crosses left above, carrying boxes [TOUCH: boxes held at the chest]. The near boat lowers its mast. | Q1. Stamp 「— 1799 · 紫禁城 / 毕沅家被抄，你入宫」. Chip 清 · 你 约699岁. | **b37.75:** the mast starts down. **b38.0:** 进 ④. | **Impact cut (b39):** the first imperial seal impression slams onto your silk on the beat, as Q2 appears. | |
| 23 | b39 → b41 · 89.75–94.28 | SILK insert: **the scroll's start** (the mounting silk, the first join, the opening of the painting), then a slow pull-back. | Five red seal **impressions** slam in on the mounting silk and the joins, not on the painted bridge, until a facts row places them (director note 13b). They are the only red on screen apart from the HUD. No seal object and no hand. Then black palace eaves close over you from top and bottom, leaving a slit of glow: you belong to the court. | Q2. Stamp 「— 嘉庆 · 延春阁 / 五玺全（《石渠宝笈三编》）」. Chip 清 · 约699. | **b39.0 / 39.25 / 39.5 / 39.75 / 40.0:** one seal per beat (scale 1.12 → 1.0, damped jolt; 3-frame shake on the first). **b40.0 → b40.75 (the bass-less bar):** the eaves close slowly. | **Roofline match (b41):** the eaves that closed over you are revealed as the far-bank 紫禁城 roofline seen from the crest in snow. | Bass on b39; bass-less bar 40 |
| 24 | b41 → b42.5 · 94.28–97.68 | CREST CR-B wide → T3's framing, SNOW-NIGHT, P-1923 with warm lit windows on the far bank. | From the palace side, the young man in a long gown (in profile) crosses right hugging the glowing bundle [TOUCH: both arms round the bundle] (pays off T3). 溥仪 is not drawn. | P1. Stamp 「— 1923 · 紫禁城 / 以赏弟弟溥杰为名（清宫档案）」 (line 2 shortened, gate-1 carry-forward 3). Chip 民国 · 你 约823岁. | **b41 (full bass back):** snow begins. **b42.0 (build):** 出 ④. | **Snow-gust wipe (b42.5):** a gust of big flakes crosses close to the lens; behind it the camera is at deck level, side-on, for the four crossings. | **Full bass b41, build b42** |
| 25 | b42.5 → b46 · 97.68–105.60 | CREST CR-C side-on track at deck level (raised ≤ 10°), SNOW-NIGHT → snow becomes SILK-paper (the ledger) → DESK (清宫 night room `#3E3A34`, warm lamp). | Four gowned figures in profile cross left→right one per beat, each with a bundle [TOUCH: arms round the bundles]. The **2nd** glows (you, the 1923-01-04 entry, C24); the others are grey. Each presses dark footprints into the snow along the deck's top edge. Then the snow becomes the ledger page with four entries: the two 「张择端清明上河图一卷」 entries ink in warm and legible, and the other two stay unlit. Pull back: the ledger on a desk, the grey roll beside it, and a standing figure already holding the lid over an open slatted box with your glow inside. | P2 (line 1, stays through P3) · P3 (line 2) at b44.5. Stamp 〃 / 「25天内 · 4卷（清宫档案）」. No dates on the ledger (no 1922). | **b42.5 / 42.75 / 43.0 / 43.25:** the four crossings. **b43.5 → b44.5: one bar where nothing new appears** (snow settling in four lines of footprints, so the "four?" lands). **b44.5:** the camera pans down into the snow on the railing and deck; the white field fills the frame and becomes paper. **b45.0 / b45.25:** the two entries ink in. **b45.5:** pull back to the desk: the figure already holds the lid over the open box, your glow inside [TOUCH: hands on the lid]. **b45.75:** the lid comes down (one action in two beats). | **Into the slats (b45.75 → b46):** the camera goes close on the slats, with glow leaking through. The cut to another room is hidden in the close-up, and the camera pulls back out of a different place. | |
| 26 | b46 → b50 · 105.60–114.66 | XBL (wall `#3A4046`). Pull back from the slats: shelf → room → window (the pane mask) → the building. Then night. Then a push through the open doors and a slow drift. | The box on a shelf among closed boxes. The small two-storey 图书楼 in its courtyard, its tree cycling the seasons in real colour (spring green, summer green, autumn ochre, winter white). **1945 (C27b):** warm headlights sweep across and away. The doors stand open; whole faceless guards in profile carry armfuls of scrolls into the dark [TOUCH: arms round bundles of rolls]; a few scrolls lie on the floor. The camera searches the shelves: where your box was is lost in shadow behind a passing figure. **No glow anywhere** (C28). No prying tools, no tearing, no glow in any arms. | V1 → V2 (line 1, stays through V3) at b47.5 → **V3 (line 2) appears whole on the b49 hit.** Stamps (script v2.3.1): b46 「— 伪满时期 · 长春 / 存于伪满皇宫图书楼」 → b47.5 「— 1945年8月 · 长春 / 伪满覆灭」 → **b49 (the hit, with V3)** 「— 1945年8月 / 下落不明（伪满皇宫博物院）」 (no 长春 on b49). Chip 民国 · 830多 → 约845. | **b46.5 / 46.75 / 47.0 / 47.25:** one season per beat. **b47.5 → b48:** two cars' beams cross and leave right. **b48.0:** doors open; figures carry. **b48.5:** the search pan. **b49 (the hit):** the last figure leaves; V3 lands. **112.8–114.25 (true silence):** the camera keeps drifting slowly toward a dark heap on the floor, in moonlight spilling from the door, with dust in the beam. Frame mean ≥ 40 (a named darkest beat). The counter rolls 约845 → 约850. Nothing new appears, and the motion never freezes (owner row 91). | **Lamp-reveal (b50):** a desk lamp clicks on and the dark heap is revealed as a different place: the 沈阳 storeroom. | **Stop b49: the film's one silence** |
| 27 | b50 → 123.40 · 114.66–123.40 | STORE (wall `#4A4038`), lamp on (pays off T4). Medium on the table, slow push. | The researcher (whole figure, seated in profile, cadre jacket) with his hand on the lamp [TOUCH: hand on the lamp switch]. The lamp throws a warm pool (green enamel shade, researcher to confirm). A faint glow deep in the heap, on the lock point (b50.5). Three rolls lie at the end of the table. He slides each in and opens it a hand's width, each showing a 虹桥, overlapped so they aren't counted [TOUCH: hands on the rollers]. Two carry 「真迹」 slips. The reject pile sits on a crate beside him, within arm's reach, with the battered roll with torn edges on top. | Y1 (line 1, stays through Y2) · Y2 (line 2) at b51.25 · Y3 (line 1, stays through Y4) at b52.75. Stamp 「— 约1950 · 沈阳 / 东北博物馆 · 杨仁恺」. Chip 新中国 · 你 约850岁. | **b50:** the lamp clicks on. **b51.25 / 51.5 / 51.75:** one roll slides in and opens per beat [TOUCH]. **b53.0 / b53.25 (pickup):** the two 真迹 rolls turn grey. **b53.5:** he draws the battered roll from the crate onto the table [TOUCH: hand on the roll]. **b53.75 → 123.40: picture pause.** His hand rests on it and it trembles (wind-up), harder on the small onset at 123.13. | **Burst + dive (123.40, the hardest drop's bass; 「才是你」 types on b54, 123.71):** insert entry 3, the film's biggest. | Re-entry, no bass → pickup b53 |
| 28 | **123.40 → b57 · 123.40–130.51 · THE PEAK** | **One continuous move:** STORE → SILK in full colour → SILK in relief → the real crest. The dive, a slow drift, then a crane up and back. | **123.40:** he unrolls the battered roll across the table, fast then slow [TOUCH: left hand on the roller, right hand flat on the silk's edge]. Its glow grows from the silk's own bloom (peak ≤ 85 % luminance, never white; never compositor mode 8 or `grade.flash`). Every heap and shelf takes a warm rim, and dust motes rise like lanterns. **b54.5:** inside the 虹桥, colour floods out from the centre: the **first full-colour frame of the film**. Only three painted things move, the same sprites as frame 0: the boat's mast coming down, a few railing figures raising their arms, and one cart crossing. **b56:** the painted quarter lifts into silk.ts's 5 relief layers (far sky/haze, far bank, river + boats, bridge, near roofs/trees) like a paper diorama. A faint ink ghost stays on the base silk under every lifted element (no holes), and each layer casts a soft dark shadow on the one behind: the whole cast at once (owner row 88). | Y4 (line 2) types on b54, red 才是你, held to b56. **b56 → b57: stamp, chip, counter and tally hidden**, so the biggest frame carries only the picture. | **123.40 (the bass):** the unroll, a 3-frame shake, the bloom grows. **b54.0 → b54.5 (Y4 types):** the dive into the 虹桥. **b54.5:** colour floods in. **b54.5 → b56:** the dive eases into a slow drift across the bridge crowd (no separate pass). **b56.0 (loudest):** crane up and back as the 5 layers separate. **b56.75 → b57:** the exit. | **Bridge match (b56.75 → b57):** the painted arch scales onto the real crest arch, the same curve in the same screen place, now in daylight: frame 0's rhyme reversed. | **Hardest drop: bass at 123.40 (b54 grid 123.71); loudest b56–57** |
| 29 | b57 → b58.5 · 130.51–133.90 | CREST CR-B wide, DAY (1950s), visitors on the far bank, P-1950 紫禁城 with its gate open and **no plaque**. | Two staff in cadre jackets (profiles) carry your roll left [TOUCH: each holds an end], in front of the far-bank wall's shaded face so your glow still leads against the day sky (still 5 tests it). | R1. Stamp 「— 1950年代 · 北京 / 回到故宫博物院」 (the HUD returns on b57). Chip 新中国 · 你 850多岁. | **b57.5:** 进 ⑤. **b58.0:** all nine marks flash red and the 「四出五进」 label pulses. | **Through the gate passage (b58.25 → b58.5):** the camera follows you into the far-bank gate's passage (warm-lit, its far opening visible) and emerges through the **painted** city gate into the painting (insert entry 4). | |
| 30 | b58.5 → b62 · 133.90–141.83 | SILK (painted street, mono again). **b60.5:** pull out through a magnifier lens to RESTO. **b61.0:** push back into the lens. | The straw shed: two thin posts rise from a torn spot. A dashed donkey-ear outline draws itself over them, then a donkey paints itself in below on a patch a shade greyer than the silk. **No figure is drawn.** Then 1973: fluorescent tubes; one restorer seated in profile, bent over the lens [TOUCH: tweezers at the patch's edge; other hand flat on the silk], one standing and holding the scroll flat [TOUCH: hands on the margin]. In the lens the patch lifts away and the posts stand over blank silk (C33). | D1 (line 1, stays through D2) · D2 (line 2) at b60.5. Stamp 「— 明代 / 裱画师误补（故宫装裱记录）」, chip 明, counter hidden → **b60.5** 「— 1973 · 故宫 / 重新装裱（故宫装裱记录）」, chip 新中国 · 你 约873岁. | **b58.75:** the posts. **b59.0:** the ear outline. **b59.5:** the donkey. **b60.5:** the lens contracts and we pull out to the room. **b61.0:** back into the lens. **b61.0 → b61.5:** the peel. **b61.75:** the restorer swings the magnifier aside [TOUCH: hand on the lamp arm]. | **Crane up (b62, the phrase start):** the camera rises off the lens over the long table. | |
| 31 | b62 → b64 · 141.83–146.36 | RESTO: crane up over the long table to about **2 m of the tail**, then a drop into SILK (the colophon). | Your tail laid out: colophon columns and red seals dotting the joins (older ones faded), readable as columns and seals at 480 px. Then 藏者宜宝之 glowing at x 1200–1700. | E1 (line 1, stays through E3) at b62.25. Stamp 「— 1186 · 张著题跋 / 你身上：96方印 · 14段题跋」. Chip 新中国 · 你 900多岁. | **b62.0:** the crane starts. **b62.25:** E1 types; the tail is laid out. **b62.75:** the camera drops onto 张著's colophon. **b63.0:** 藏者宜宝之 glows. **b63 → b64:** hold on the glowing words while E1 is read. | **Beat cut (b64):** the first E3 flash, with a 3–4-frame directional smear. | |
| 32 | b64 → b66 · 146.36–150.88 | Three beat cuts to earlier shots (re-renders of their scene functions), each with a 3–4-frame directional smear and your glow on the lock point. Then WALL (`#3E454A`, warm lamp spill), with the only real move: a fast pull-back, a hold and a push. | **偷:** the eunuch on the night crest (scene 04). **换:** the grey copy sliding into your place (scene 03). **藏:** the friend's door closing on your glow (scene 18). **抄:** your one glowing roll on the lock point pulls back to reveal the wall of ~100 grey copies, one glowing. | E3 whole on b64 (line 2 under E1); each red word turns red on its beat. Label 「约一百卷 · 只有一卷是你」 (≥ 56 px) **b64.75 → b65.75** (2.26 s): it comes in with 抄 as the pull-back starts from your one glowing roll, so 只有一卷是你 lands on the roll while the wall opens around it. Stamp → **b65.0** 「— 今天 / 约百卷仿本（余辉估）」. Counter 900多. | **b64.0 (the +3 dB accent):** 偷. **b64.25:** 换. **b64.5:** 藏. **b64.75:** 抄, the label and the pull-back. **b65.0:** the stamp changes. **b65.0 → b65.75:** the wall held, a slow drift; the label leaves as the push starts. | **Push into the one glowing roll (b65.75 → b66):** its glow becomes your glow carried across the 宋 fire crest, on the lock point. | Accent b64 |
| 33 | b66 → b67.5 · 150.88–154.28 | CREST CR-C side-on track (T2's framing): the handover set as a flip-book, your glow held on the lock point. | Each beat the era swaps (sky, hats, far-bank palace, carrier) and your glow is carried right again: **宋** FIRE with the carts · **元** NIGHT with the 权贵 · **明** NIGHT with the eunuch · **清/1923** SNOW with the bundle. On b67.0 the camera stops tracking and the 1923 carrier walks out of frame right, gone before b67.5. The standing bank crowd (Qing hats) stays. | E4. Stamp 「— 宋 · 元 · 明 · 清 / 四次出宫（故宫博物院）」. Chip and counter hidden b66 → b67.5 (settled in script v2.3.1; the stamp carries the eras). | **b66.0 / 66.25 / 66.5 / 66.75:** an era each, and the four 出 marks flash on the same beats. **b67.0 → b67.4:** the carrier leaves right. | **Daybreak (b67.5 → b68):** a soft light-edged wipe left→right between two matched crest stages (snow-night → today, day). The standing bank crowd it passes loses its hats and robes and becomes today's silhouettes. | |
| 34 | b67.5 → b72 · 154.28–164.47 | CREST DAY (today) → b68.5 truck left with the crowd → b69 cross-section into the WUMEN hall (`#464C52`). | Once the light has passed, ordinary visitors in profile (jackets, backpacks, a child walking beside a parent) start walking **left** toward the palace: the queue from N1. Inside the hall you lie open in the glass case, the only warm light, rimming the profiles filing past. **Your glow stays on the lock point while everyone else moves:** the teaser inverted, nobody carries you. | E5 (line 1, stays through E6) · E6 (line 2) on b69. Stamp 「— 1950年代至今 · 故宫博物院 / 结束流离（故宫博物院）」. Chip 新中国 · 你 900多岁. | **b67.5 → b68.0:** the daybreak sweep; **b68.0:** the hats are gone. **b68.25:** the visitors start walking left. **b68.5:** truck left with them. **b69.0:** the gate's masonry wall (texture, a door-jamb edge) slides across as a foreground wipe. **b69 → b71:** the crowd flows; you hold. **b71 → b72 (no subtitle, the moral picture):** a slow pull-back; the crowd keeps filing past your glow, and nobody carries you anywhere. | (in the same hall) **Lights out row by row (b72.0 → b72.25).** | |
| 35 | b72 → b74 · 164.47–169.00 | WUMEN hall → POV from inside the box → the storage aisle (`#3E454A`), slow pull-back. | The ceiling lights die row by row and the crowd is gone. Two staff (one tone, no gloves) roll you up [TOUCH: each on a roller] and lay you in a storage box [TOUCH]. **The lid closes over the camera:** its underside is lit warm by you (frame mean ≥ 40, a named darkest beat), so it never goes black. Then the closed box on a shelf in the aisle, glow faint at its seams, the aisle's far end lit. | E7 (line 1, stays through E8) on b72.25. Stamp 「— 故宫规定 / 展后静养三年以上（北京晚报）」. Counter 900多. | **b72.0 → b72.25:** the lights die. **b72.25:** E7 types. **b72.5:** roll-up. **b72.75:** into the box. **b73.0:** the lid closes; the aisle. **b73.0 → b74:** pull back along the aisle. | **Rectangle match (b74):** the box's front face becomes the empty case in the same screen rectangle. | Outro b74: bass drops out |
| 36 | b74 → b76 · 169.00–173.53 | WUMEN hall, slow push (callback to scene 07). | The empty case, the card 「撤展回库」「下次展出：未公布」, lit by the hall's other lights (frame mean ≥ 40, a named darkest beat). | E8 (line 2 under E7) on b74; both clear on b75.5. Stamp 〃. Counter 900多. | Only the push. Soft. **b75.5 → b76:** the card alone. | **Reverse crane (b76):** pull back out of the hall through the warm-lit gate passage (far opening visible) and rise over the ramp as the end card begins. This bookends N1. | Outro |
| 37 | b76 → end · 173.53–184.30 | WUMEN exterior night: a slow rise over the **empty** 马道 ramp, the gate dark; the END card over the scene at 40 %. | The empty ramp, where your place in the queue is free. Then the Juno end card. | **b76:** the Juno end card begins (J monogram, gold title). **b76.5:** Q types into the end card's question slot (centred there with the ？ rule; never a second subtitle at the top). **b78:** follow pill 「关注 Juno · 一起看懂世界」. **b78.5:** sources. No stamp, no counter. | The rise continues to the end, and nothing gets brighter (owner row 95). The music ends at ≈ 184.2. | — (end) | Outro to the end |

## The crest handovers (R7 + R8): 14 visits, each IN and OUT different

| Visit | Deal and mood | How you change hands | IN move | OUT move |
|---|---|---|---|---|
| 01 hook | neutral, dusk → lanterns die | held open, then rolled and walked off right | pull back out of the silk | glow-locked hard cut to the title, slamming on drop 1's hit (9.05) |
| 04 T2 · 05 T3 | teaser, night | under the arm / bundle in the snow | hard cuts, glow-locked: the title + the format's four cuts, the **only** sanctioned repeat (one device) | hard cuts, glow-locked |
| 08 S1 | establishing, 宋 dusk | none (the empty stage); the rule drawn by light and shadow | lanterns in the glass: through the empty case's pane | ink-trace: stage → painting |
| 10 BO | official 进 (dusk) → 靖康 出 (fire) | two-man carry; then glow among carts, nobody seen grabbing you | match on action | push into the drifting glow |
| 14 I2 | official 进, 元 day | officials carry; side-on day wide, then a slow push along the deck toward the Dagoba | roll-up wipe | match through the round window |
| 16 W2 | **secret sale, night** | four hands on the rollers, then under the 权贵's arm | lamp-out match | shrink into 杨准's column |
| 20 M3 → F1 | official 进 at dusk → **theft at night** | cart with a sealed crate; then the eunuch, under the arm | 封条 graphic match | foreground body wipe (+ in-shot dusk → night) |
| 22 Q1 | official 进, 清 dusk | procession with boxes, framed low behind a near boat lowering its mast | silk → water ripple | impact cut on the first seal |
| 24 P1 | **smuggled out, snow night** | bundle hugged to the chest | roofline match | snow-gust wipe |
| 25 P2 | 25 days, four crossings | four bundle-carriers side-on, one glowing; footprints in the snow on the deck | snow-gust wipe | pan down into the snow → the ledger page |
| 29 R1 | official 进, 1950s day | two staff carry; all nine marks flash | bridge match: the painted arch onto the real one | through the gate passage into the painted gate |
| 33 E4 | the four exits recalled | flip-book of the four exits, your glow held on the lock point | push into the one glowing roll on the wall | daybreak: a light-edged wipe between matched stages |
| 34 E5 | nobody's: today, day | visitors walk left once the light has passed; you are not carried | daybreak wipe | cross-section truck through the gate wall into the hall |

## Transitions (all 36 hand-overs; none repeats except the glow-locked hard cuts of the title + teaser chain, which the format asks for)

| # | Scenes | Lands on | Move | Motivated by |
|---|---|---|---|---|
| 1 | 01→02 | cut on the 8.96 pickup, slam on drop 1's hit (9.05) | The film's first hard cut, glow-locked: the band's right roller stands where your glow was, and the band flies open leftward and slams | Drop 1. The eye never leaves you, and a handscroll opens right → left |
| 2–5 | 02→03→04→05→06 | b4.5, b6, b7, b8 | Hard cuts with your glow locked at (960, 580). The title band becomes your silk on the Yuan table; at b5 the grey copy sits on the lock point | The format's four cuts, chained to the title; the eye never has to search |
| 6 | 06→07 | b9 | Light + shape match: buried glow → case light; heap → queue | The same "you" found again, in a different pile of people |
| 7 | 07→08 | b11.5 → b11.75 | Lanterns in the glass: the empty case's dark pane lights with the crest's lanterns, and the camera pushes through the pane | N2 asks why you are hard to see; the glass shows where your life was played |
| 8 | 08→09 | b13 | Ink-trace morph, right→left: the stage becomes the painting | B1: "you were painted in 汴京" |
| 9 | 09→10 | b14.5 | Match on action: the roll moving left continues left | The finished painting is handed to the court |
| 10 | 10→11 | b15.75 → b16 | Push into the drifting glow → silk (insert entry 1) | We follow you into the dark and look at you |
| 11 | 11→12 | b17.25 → b17.5 | Slide past the join; writing appears; pull back to the writer | The search for a name leads to the paper where a name is written |
| 12 | 12→13 | b18.75 → b19 | Pan down + push into the column (insert entry 2), landing as Z3 appears | The line names what he wrote |
| 13 | 13→14 | b23 → b23.5 | Roll-up wipe: the roller sweeps left→right | He rolls you up, and your next owner is behind it |
| 14 | 14→15 | b25 | Match through the round window (Dagoba outside → inside) | Carried into the palace, we land in its back room |
| 15 | 15→16 | b26.5 | Lamp-out match: lamp and lanterns die on one beat | A secret sale needs the dark (R7) |
| 16 | 16→17 | b28 | Shrink into the record (picture-in-picture): the sale becomes a vignette in 杨准's column | 杨准 wrote the swap down |
| 17 | 17→18 | b29.25 → b29.5 | Ink-bleed into the night sky | A century passes inside the ink |
| 18 | 18→19 | b31 | Door wipe into the doorway enfilade | The friend's door closes and you pass from door to door (辗转) |
| 19 | 19→20 | b33 | Graphic match on the 封条 X: hall doors → crate on the cart | The confiscation seals travel with you |
| (in 20) | — | b33.75 → b34 | Dusk → night in one locked shot (no cut) | The official entry turns into the night theft (carry-forward 4b) |
| 20 | 20→21 | b35.5 | Foreground body wipe (the eunuch passes the lens) | The thief's own body carries us to his writing |
| 21 | 21→22 | b37.25 → b37.5 | Silk → water ripple, down to the water line | From the record back to the river where you travel |
| 22 | 22→23 | b39 | Impact cut on the first seal | The emperor's seal is the hit |
| 23 | 23→24 | b41 | Roofline match: the eaves that closed over you = the far bank in snow | "You belong to the court", and the court's own house lets you out |
| 24 | 24→25 | b42.5 | Snow-gust wipe to a side-on deck-level track | The same night, now seen as a pattern of four |
| (in 25) | — | b44.5 | Snow → paper: a pan down into the snow on the deck; the white field becomes the ledger page | The crossings are the list |
| 25 | 25→26 | b45.75 → b46 | Into the slats, then pull back out of a different room (the cut hidden in the close-up) | The box travels; the place changes around it |
| (in 26) | — | b47.5 → b48 | Headlight sweep | 1945: the owners leave |
| 26 | 26→27 | b50 | Lamp-reveal: the dark resolves into the new place | Silence ends with light: someone is looking again |
| 27 | 27→28 | 123.40 (the bass; b54 = 123.71 carries 才是你) | Burst + dive into the silk (insert entry 3, the peak), the bloom growing from the silk itself | 才是你: we finally see you as you are |
| 28 | 28→29 | b56.75 → b57 | Bridge match: the painted arch scales onto the real crest arch, same curve and screen place, now in daylight | You come home; frame 0's rhyme, reversed |
| 29 | 29→30 | b58.25 → b58.5 | Through the warm-lit gate passage into the painted city gate (insert entry 4) | Carried into the palace, you are opened again |
| (in 30) | — | b60.5 / b61.0 | Pull out through the magnifier lens; push back in | 1973: the restorer's eye |
| 30 | 30→31 | b62 | Crane up to about 2 m of the tail, then a drop onto 藏者宜宝之 | Everyone who treasured you is on this tail |
| 31 | 31→32 | b64 | Beat cuts with a 3–4-frame directional smear, each flash glow-locked; then the 抄 pull-back to the wall | 偷 / 换 / 藏 / 抄, one per beat, in the teaser's language |
| 32 | 32→33 | b65.75 → b66 | Push into the one glowing roll on the wall → your glow carried across the 宋 fire crest, on the lock point | One of a hundred is you, and here you are, carried out, four times |
| (in 33) | — | b66 → b66.75 | Era flip, one per beat, your glow held on the lock point | The format's handover compressor |
| 33 | 33→34 | b67.5 → b68 | Daybreak: a soft light-edged wipe between two matched crest stages; the standing crowd loses its hats; the carrier has already left right | You stop belonging to anyone; the hats fall away |
| (in 34) | — | b69 | Cross-section truck through the gate's masonry wall | Follow the visitors in |
| 34 | 34→35 | b72.0 (+ b73.0) | Lights out row by row in the same hall; then the lid-close POV from inside the box | The price of safety: the show ends, you go into the dark |
| 35 | 35→36 | b74 | Rectangle match: closed box → empty case | Why you are hard to see: you are there, unseen |
| 36 | 36→37 | b76 | Reverse crane out through the warm-lit gate passage, over the empty ramp, as the end card begins | Bookends N1; the question asks about this queue |

No dip to black anywhere.
- Every night and indoor frame keeps a mean of ≥ 45.
- The named darkest beats (the empty case in 07 and 36, the b49 silence, the lid POV) stay ≥ 40.
- Gate passages stay warm-lit, with the far opening visible.

No crossfade between scenes: compositor mode 7 is not used between scenes, and mode 8 and `grade.flash` are not used at all.
Every switch is a cut on a beat or a move with a physical reason. Outgoing labels and tags leave before each move starts.

## Where this picture differs from the script's picture column (for the director)

1. **T3 / P1 / P2: a carried cloth bundle, not a crate on a hand-cart.**
   - C24 says "由溥杰携带出宫", and C24b says "交由其弟溥杰携出宫外": the scroll was carried by a person.
   - No row supports a crate or a cart, and a crate implies a bulk shipment.
   - The carrier is a faceless young man in a long gown. He is never 溥仪 and never a likeness.
2. **R1 / E5: no museum plaque on the far bank.**
   - The 故宫博物院 plaque hangs on 神武门, not 午门, and L1 rules out the Palace Museum's logo.
   - The museum reading comes from the open gate in daylight and the visitors.
3. **M2: door wipes instead of "three quick dissolves".** No unmotivated dissolves.
4. **F2: one continuous track instead of a left/right split.**
   - The track runs from the bare end of the painting leftward along the tail to 冯保's columns.
   - This is true to the object: the colophons lie to the left of the painting. It also keeps one place to look at a time
     (craft.md).
5. **V2–V3: the C27b picture is adopted** (carry-forward 2).
   - Shown: doors open, faceless guards carrying armfuls, scrolls on the floor, and a search that finds no glow.
   - Not shown: prying tools, tearing, or your glow in anyone's arms or in a pile.
   - The heap the camera drifts toward in the silence stays dark. The glow appears only after the b50 lamp, when the stamp
     already reads 约1950 · 沈阳.
6. **Q2: seal impressions appear on their own.** No hand comes in from off-screen and nothing floats.
7. **P3: the ledger is a page on a desk**, not a page beside the bridge (nothing floats; owner row 121).
8. **Z2: no brush enters the close-up.** The ink appears by itself, then the pull-back shows 张著 holding the brush.
9. **E7: the "three seasons of light" are dropped.**
   - facts.md says nothing about where the scroll is stored, so a window would be invented.
   - The picture is the lid closing and the box resting in a dark aisle. The stamp carries 三年以上.
10. **E1: the camera cranes up to about 2 m of the tail on the 1973 table** (colophons and seals readable), then drops onto
    藏者宜宝之, instead of tracking the whole tail.
    - 张著's colophon is the first one after the painting, so a track along the tail would pass it first.
    - The whole 40:1 scroll seen from above would be a strip about 48 px tall (director note 12b).
11. **Q1: a procession on foot, seen from the water**, instead of a second confiscation cart. This keeps the crest repeats
    apart (gate-1 note: "the crest carry shows up five times in 41 s").
12. **E4: the chip and counter hide for b66 → b67.5** (director note 11a). The stamp 「宋 · 元 · 明 · 清」 carries the eras. Settled in script v2.3.1.
13. **Stamps M3 and P1:** line 2 is shortened to ≤ 14 字 (gate-1 carry-forward 3).
    **T1 / W1–W2:** 「— 元 · 1351年前」, 「以似本易去」 and counter 200多 (carry-forward 1). The gate-2a stills are not copied.
14. **(r2) The title is on drop 1** (owner, 2026-10-24). The order is hook → title → teaser → present day → S1, not the format's
    hook → teaser → present day → title.
    - Script v2.3 and this storyboard agree on every time from frame 0 to S1.
    - The script's picture column still shows T3 as a crate on a hand-cart; item 1 above stands (a cloth bundle).
15. **(r3) Q2: the five 嘉庆 seals land on the mounting silk and the joins at the scroll's start**, not across the painted
    虹桥, until a facts row places them (director note 13b).
16. **(r3) Profiles only.**
    - B1's painter and T3/P1's carrier are drawn in profile (the script says "from behind").
    - E5 has a child walking beside a parent, not on a parent's shoulders.
    - The staff wear no white gloves: the figures are one tone.

**For the researcher before the build:**
- The silhouettes in the cast list: the Ming eunuch's hat, the Jin scholar's cap, the Qing officials' cap.
- The 虹桥's woven timber arch, and the 午门 马道's form.
- The 小白楼's massing.
- If the other two ledger entries are ever made legible: 谢隧 vs 谢遂 (C25 vs C31).
- (r3, director note 13) The White Dagoba (妙应寺白塔, finished 1279) as the marker of 元大都 (scenes 03, 14, 15).
- (r3) Where the 嘉庆 五玺 sit on the scroll (scene 23; until then, on the mounting silk).
- (r3) 封条 on a Ming confiscation (scene 19).
- (r3) The painting's own boat-lowering-its-mast scene under the 虹桥, with the railing figures and a cart, so that frame 0 and
  the peak match the real composition.
- (r3) A 1950s office desk lamp with a green enamel shade (scene 27); if it can't be confirmed, use a plain shade.

## Style frames

| Frame | File | What it proves | What it does not prove / what is superseded |
|---|---|---|---|
| A hook | `style/lookA_hook.png` | **ROOM-元** (round window + White Dagoba, hanging lamp, table). Live glow vs dead grey reads instantly. The craftsman's contact pose (hand flat on the silk). The ivory top-left subtitle over a mid-tone wall. A line-1-only teaser stamp. | The stamp text 「元 · 宫中」 is superseded by 「— 元 · 1351年前」. The 30 px corner mark is superseded by the old 21 px mark. **r2:** T1 recomposes this set with your silk centred on the lock point (960, 580). |
| A key | `style/lookA_key.png` | **CREST CR-A** scale (figures 54 % of frame height, scroll 436 px, the 虹桥 legible on the scroll). DUSK palette and luma (86/100). The Yuan brim, lanterns, the mast, the ripple dashes. The full furniture layout (subtitle, stamp with 3 lines, chip + counter). It is the lighting for **official entries** (BO, I2, M3, Q1). | **W2 is NIGHT** with the lanterns out (R7), so this frame does not prove the sale's lighting. Superseded text: 至正年间, the 杨准 line, 约240, the placeholder subtitle (use the W1–W2 stamp, 200多 and lines.json). The 30 px mark. |
| B hook / key | `style/lookB_hook.png`, `lookB_key.png` + `style/src/` | The code-drawn painting quality that **SILK** builds on, and the real-vs-grey split on silk. B's mineral palette is the peak's colour. | Not look A's subtitle polarity over silk (B used ink text). Look A uses the vignette plus ivory. |
| Corner mark | `style/corner_mark_compare.png` | The **left half** is the mark to build (old, 21 px light). | — |

**New stills to render first for gate 3, in this order** (director note 8; nothing is rendered now, to save disk). Any still
with a person in it goes out only after the contact checker prints PASS.
1. **0:00, scene 01, frame 0.** This tests the painter, and it decides everything.
   - Is frame 0 striking on its own, and does it read as *the painting* (boat under the arch, silk and ink), not as scenery?
   - Do the three sprites (mast, railing figures, cart) read as part of the painting?
   - Do the ivory subtitle and the stamp read over the bright insert at 480 px?
   - Insert luma 120–160, with the linework not blown out by the bloom.
2. **0:08.9 and 0:09.6, scenes 01 → 02, the drop pair.** The last intro frame and the settled title.
   - Does the glow at frame right sit where the band's right roller stands?
   - Is it a title at 480 px: big, the ink centred by pixel measure, 「清明上河图」 crisp under the bloom, clearly the film's
     own silk?
   - No flash. The intro frame's mean is ≥ 45. The title frame's surround is ≥ 30, its mean ≥ 45 and no more than about 80.
3. **2:08.2 (b56), scene 28, the peak.** This is the biggest promise, so decide here between the relief and its fallback (colour
   flood + push, no relief).
   - Is it the most spectacular frame of the film, a paper diorama (ink ghosts, soft shadows) and not floating cards or "an
     unfinished game" (ep13)?
   - Does the bloom keep the linework legible?
4. **1:02.6 (b27), scene 16, the night sale.** Its lighting and its four-hand contacts are reused by T2, F1 and E4.
   - Is the night mean ≥ 45?
   - Does the rim light come from you only?
   - Do the 大都 windows give colour without competing with you?
   - Contact checker PASS on the four hands.
5. **2:12.2 (b57.75), scene 29, the day crest (new).** Day is unproven: the silk (≈ 243) against a horizon of ≈ 220.
   - Does your glow still lead, against the far-bank wall's shaded face?
   - Day luma 110–150; contact checker PASS on the carry.
6. **1:51.8 (b48.75), scene 26, 1945 小白楼.**
   - Does it stay inside C27b/C28?
   - Is it not horror and not black? The mean is ≥ 45 here, and the silence frames that follow are ≥ 40.
   - Is the "where is it?" search readable?
7. **0:27.7 (b11.6), scene 07 → 08, the pane mid-move.**
   - Does it read as glass (a pane edge, a faint reflection of the hall), not as a crossfade?
8. **0:03.7 (b1), scene 01, the pull-back landing.** It is closest to the approved key frame, so it goes last.
   - Does the painted bridge rhyme with the real one?
   - Are the bank figures in profile, turned to your light?
   - Contact checker PASS on the four hands on the rollers; dusk luma 75–100.
