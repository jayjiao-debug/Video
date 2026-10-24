# Storyboard: 假如你是清明上河图 · look A 汴河暮影 (gate 2b, r2)

Art director, 2026-10-24. Inputs: script v2.1 + lines.json (owner-approved), music.md (owner BGM, 30-bar cut, film ≈ 3:04),
notes_gate2a_r1/r2 (R7 mood follows the deal, R8 move list), notes_gate1_r2 carry-forward 1–4, facts.md (all rows incl. C27b),
figure-rules.md, owner-notes (art-director rows), craft.md, pauses.md, ref_sheet_1–6 (rhythm only), style/lookA_*.png.

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
  - the stills list keeps its four shots and now starts with frame 0, the drop pair and the pull-back.

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
| Night sky (secret exits) | `#16222B → #22323C → #34454C`, distant-city horizon `#4A4A3E`. Never black; night frames' mean luma ≥ 45/255 |
| Fire sky (1127, E4 宋) | `#2A1D1F → #6B2E22 → #C2562F → #E88A45` + smoke bands |
| Snow night (1923) | `#2E3B47 → #4A5A66 → #6C7A82`, snow `#D9E1E6` |
| Silhouettes (one tone) | `#15100C`, rim `#FFD58F` (from your light only) |
| You (silk) | core `#FFF3D8`, rim/bloom `#FFD58F`, painted ink `#2A1F17` |
| Copies / fakes | dead grey `#9A968E`, ink `#55524C` |
| Red (seals, tally, key words only) | `#EE4B3B` |
| Peak only (b54–b57, inside the silk) | 石青 `#41708A` · 石绿 `#6E8E68` · 赭 `#A8683A` · 朱 `#B42E22` |
| Practicals (lamps, lanterns, torches, headlights) | `#FFB868`, kept small and on their objects |
| Interiors (mid-tone, never black) | mounting room `#2E3E46`, study `#3C3328`, storeroom `#2A2724`, 1973 room `#6F7774`, hall `#2A2E33`, vault aisle `#23272B` |

**Luma targets** (checked on every still, owner row ep21): night ≥ 45/255, dusk 75–100, day 110–150, inserts 120–160 with
the vignette. **Type** (all on the render machines):
- Subtitles: Noto Serif CJK SC Black 58 px.
- Stamps: Noto Serif CJK SC Bold.
- Counter numerals: Cormorant Garamond SemiBold 88 px.
- Labels: Noto Serif CJK SC Bold 44 px.
- Engine end card: unchanged.

**Texture and light.**
- Every set has ≥ 3 depth layers with atmospheric fog toward the sky colour, so it never goes flat clip-art (ep21).
- Silk weave on you; bloom only on you, the lanterns and practicals.
- The bloom threshold sits above the silk's base, so the painted linework on you never blows out (owner row 81).
- Inserts carry a lamplight vignette. The silk glows from the centre and falls to warm dark (≤ `#4A3B2C`) under the subtitle,
  stamp and counter corners, so the ivory subtitles keep **one polarity all film** (gate-2a ruling: never flip mid-line).

**Motifs.** The glowing roll vs the dead-grey copy. The four-出-five-进 tally. The boat lowering its mast (in the painting
and on the real river). Red seals. Ink appearing on paper. The glow locked to one screen point (the title and the teaser, inverted at E6).

**Must NOT look like.**
- iwanau: an altar with dynasty banners, mint jade, red-purple sunsets, their title card.
- Flat clip-art (ep21 v2), or procedural "unfinished game" 3D (ep13).
- Black with thin lines; a slideshow where elements pop in and hold.
- Front-on faceless blobs (profiles only, ep14).
- Hands entering from off-screen or stopping short of what they touch.
- Horror, and a black frame anywhere.

**References.** style/lookA_hook.png and lookA_key.png (the approved look). The SILK drawing base is lookB_hook.png and
lookB_key.png and their `style/src/` code. The iwanau sheets are used for rhythm only (a picture beat every ~2 s, one set per
stacked line pair, a recurring handover set where only the era markers change).

## Engine layer (shared furniture, never changes)

| Element | Spec |
|---|---|
| Subtitle | Top-left, x 150, first line y ≥ 132 (clears the Douyin watermark), ≤ 2 lines. Ivory `#FFF3D8`, red key words `#EE4B3B`, soft dark edge + borderless feathered shade (no box). Typed reveal ≤ 0.4 s; T1–T4 and E3 appear whole on the cut. Verbatim from lines.json. N2 and Q are **centred** at the same height, with the ½ em ？ pull-back and the ink centre measured. |
| Stamp | Top-right, right-aligned to x 1830, red rule at x 1856 from y 92. Line 1 `— 年份 · 地点` 56 px. Line 2 40 px, ≤ 14 字. Line 3 34 px, only on stamps held ≥ 4 s. Teaser cuts: line 1 only. A stamp changes on its scene's first downbeat. |
| Corner mark | **The OLD series mark** (owner, gate 2a): 21 px light, 0.3 em tracking, 62 % opacity, grey ◆. Top-right, ink ≈ y 44–66. The stamp starts ≥ 28 px below it. The gate-2a stills show the 30 px mark: ignore that. |
| Era chip + counter | Bottom-left: red vertical chip (北宋 · 金 · 元 · 明 · 清 · 民国 · 新中国; 伪满 is never a chip) + `你 约N 岁` (88 px numerals). The counter rolls like an odometer and never stops on 250. Hidden in the hook, teaser, present day, title, D1 and the end card. |
| Tally | Right of the counter: `出 ○○○○  进 ○○○○○` (≥ 40 px), label `四出五进 —— 故宫博物院` (≥ 40 px). Marks fill red on their beats: 进 b15.0 · 出 b15.75 · 进 b24.0 · 出 b27.5 · 进 b33.5 · 出 b35.25 · 进 b37.25 · 出 b42.0 · 进 b57.5 (complete; all nine flash red b58.0). E4: the four 出 flash b65.5/66.0/66.5/67.0. |
| Labels | Noto Serif CJK SC Bold 44 px, ivory with a thin dark halo + feathered scrim (pond rule), only in the mid band (y 560–820). They leave **before** any transition starts (owner row 86). |
| Safe zones | Subtitle zone x 120–1120, y 100–340 is quiet in every composition: sky, wall, haze or vignette. Stamp zone x 1280–1870, y 36–300 is quiet. Counter zone x 120–1100, y 880–1040 is dark: deck, floor, table or vignette. Key visuals live in x 200–1700, y 300–880. **Glow-lock point: (960, 580)**, the title band's centre (r2; it was 1250, 600). The title and the four teaser cuts share it, and T4 → N1, Y1 (b50.5) and E6 use it. |
| End card | Juno end card from the engine: J monogram, gold title 假如你是清明上河图, the question, follow pill `关注 Juno · 一起看懂世界`, the sources line from script.md. |

## Build: how this is made (three.js 2.5D silhouette kit inside Remotion)

- **Stack.** Remotion 4 + @remotion/three (three r169).
  - Every set is one three.js stage. A **TransitionCompositor** renders the outgoing and incoming stages to targets and mixes
    them with the move's own mask or displacement: roller edge, ink-bleed noise, ripple, door panel, eaves iris, lens circle,
    costume-sweep band, and (r2) the glass pane, where the incoming stage first shows as a reflection.
  - Hard cuts are plain switches on the frame.
- **2.5D silhouette kit.**
  - Alpha-silhouette planes (SVG → canvas textures at 2×) at 4–6 depths, with per-layer fog.
  - **Rim shader:** an edge band from the alpha gradient × falloff from your projected screen position, colour `#FFD58F`.
    Whatever stands near you gets rimmed; nothing else does.
  - Gradient sky dome with the presets above.
  - **Water plane:** sky reflection plus broken ripple dashes (the gate-2a fix), and your light as a soft broken streak.
  - Instanced snow, embers and dust motes.
- **You.**
  - An emissive plane carrying the **SILK** canvas texture, with selective UnrealBloom. Layer 1 holds you, the lanterns and
    the practicals.
  - The rolled scroll is a short emissive cylinder with blue mount ends and ivory roller knobs (as in the stills).
- **SILK.** One procedural Canvas 2D 界画 painter, built from the gate-2a `style/src` code. It draws a tiled strip of about
  16384 × 1536.
  - **Looks:** lantern-silk mono (default), FULL COLOUR (the peak only), dead grey (copies).
  - **Donkey-patch states:** bare / ear outline / donkey on a grey patch / peeled.
  - **Relief mode** for the peak: river, boats, bridge, roofs and trees on 5 planes.
  - **No scan** (L1).
- **Figures.**
  - One-tone silhouettes from `qq42/figure42.tsx` (`Figure4`/`Rimmed`, gaits), rendered into plane textures.
  - Each figure is placed with `<Person>` (intent, env, contacts). Every hand aims at a point on the roll, box, lamp or cart.
  - `pose_check.mjs` must PASS before any still goes out.
  - Feet sit on the deck or floor line. Nothing passes through the railing or the table (owner row 43).
- **HUD.** React/SVG over the canvas: subtitle component (？ rule, reveal), stamp, chip + odometer, tally, corner mark,
  title and end card.
- **Render.** WebGL scenes go to Modal T4 (`--gl=vulkan`). Title and end-card-only frames can go to the GitHub farm.
  1080p, no grain.
- **Medium per scene** (owner row 42):
  - three.js 2.5D for every stage.
  - SILK inserts are the same SILK texture on a plane in a camera move, so every push into or out of the silk is one
    continuous camera move.
  - The HUD is HTML/SVG.
  - No true 3D models are needed.

## Sets: the 虹桥 crest + 10 reusable sets

| Code | Set | Dressings / variants | Top-left stays quiet because… | Scenes |
|---|---|---|---|---|
| **CREST** | **The 虹桥 crest, the handover stage.** Woven timber arch, deck, railing with lanterns on the posts, the river and a boat that lowers its mast, the bank crowd, the far-bank palace slot (left), the dark road (right). | **Skies:** DUSK, DAY, NIGHT, FIRE, SNOW-NIGHT. **Far bank:** P-宋 宫城门楼; P-元 大都 skyline + White Dagoba; P-明 紫禁城 角楼; P-清 紫禁城; P-1923 紫禁城 under snow; P-1950/今 紫禁城 in daylight, gate open, **no plaque**. **Lanterns:** lit / out. **Weather:** snow, embers, smoke. **Cameras:** CR-A medium two-shot (gate-2a key: figures ≥ 45 % of frame height, open scroll ≥ 420 px); CR-B locked wide (arch spans the frame); CR-C lateral track at deck level; CR-D low from the water under the arch; CR-E high oblique 30°; CR-F tilt from river/sky; CR-G steep high 70° (snow). | sky | 01, 02 (defocused, behind the title), 04, 05, 08, 10, 14, 16, 20, 22, 24, 25, 29, 33, 34 |
| SILK | **The painting (you), full frame.** Sections: 汴河 boats + 虹桥; city gate + streets; the straw shed; the painting's last section with its bare corner; the colophon paper (张著's columns 翰林张择端…藏者宜宝之…燕山张著跋, 杨准's columns with a replay slot, 冯保's columns, other colophons as illegible stand-ins); seals as stand-ins (嘉庆 五玺 slots). | mono / colour / grey · relief · patch states | vignette | 01, 02 (the title band), 09, 11–13, 21, 23, 28, 30–31 |
| ROOM-元 | Yuan palace mounting room (the gate-2a hook still): round moon window with the White Dagoba, hanging lamp, long table, hanging scrolls on the wall. | dusk / night | dark wall | 03, 15, 32 (换) |
| DESK | **One writing-desk set, four dressings.** 北宋 painter's studio (B1). 金 张著's desk (Z2, Z5). 元 杨准's southern study (rectangular lattice window, banana leaves, bamboo). 清宫 night room with the ledger (P3). | window shape, lamp, props, costume | wall / window shade | 09, 12–13, 17, 25 |
| MING-LANE | Ming house at night from the back lane: front gate (left) with torchlight behind the roofs, back gate (right), the friend's door. | — | night sky | 18, 32 (藏) |
| MING-HALL | Doorway enfilade (moon gate, vase gate, hall door) → 严府 hall with treasures in silhouette, a table, the lacquer box; the hall doors for the 封条. | — | dark ceiling | 19 |
| XBL | 伪满 小白楼 (图书楼): small two-storey building in a courtyard with one tree (seasons). Inside: shelves of closed slatted wooden boxes, double doors, floor. | seasons · 1945 night | sky / dark interior | 26 |
| STORE | 沈阳 临时库房: heaps of rolled scrolls, shelves, a long table, a small 1950s desk lamp. | lamp off / on | dark ceiling | 06, 27, 28 |
| WUMEN | 午门: exterior with the 马道 ramp (queue / empty), the gate passage, the exhibition hall with the glass case and the plinth card, the storage aisle with boxes. | 2025 night · today day · empty | night sky / dark hall ceiling | 07, 34–37 |
| RESTO | 1973 restoration room: long table, overhead fluorescent tubes, magnifier lamp on an arm. | — | cool wall | 30, 31 |
| WALL | The wall of copies: a long dark gallery of shelves with ~100 grey copies lying half-open (each a grey 虹桥), one glowing. | — | dark | 32 (抄) |

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

**Cast.** All one tone and in profile, whole figures standing on a surface. The researcher confirms each silhouette before
the build (owner row 121).
- **宋:** court officials in 展脚幞头, the painter in a soft 幞头, refugees.
- **金:** 张著 in a scholar's cap.
- **元:** the craftsman in a plain cloth cap (gate-2a), the 权贵 and the officials in 钹笠 brimmed hats, 杨准 in a Han
  scholar's cap.
- **明:** 陆完 in a square scholar's cap, his friend, officials in 乌纱帽, the eunuch in a eunuch's hat (shape TBC),
  box-carriers.
- **清:** officials in Qing caps with a top knob.
- **1923:** a young man in a long gown and 瓜皮帽, never a face and never 溥仪.
- **1945:** guards in long coats and peaked caps, faceless.
- **1950:** the researcher and the staff in cadre jackets.
- **1973:** restorers in white smocks.
- **Today:** visitors, and staff in white gloves.

---

## Line ↔ bar map (r2: the same times as the screenwriter's `lines_bars.json` v2.3)

The scene windows below are binding. Line starts *inside* a continuous scene can move by a beat. Times are film seconds.

| Lines | Start bar → s | | Lines | Start bar → s | | Lines | Start bar → s |
|---|---|---|---|---|---|---|---|
| H1 | 0 → 0.00 | | W1 | b25 → 58.05 | | P3 | b44.25 → 101.64 |
| H2 | b1 → 3.71 (H1 and H2 clear on b2.5, 7.11) | | W2 | b26.5 → 61.45 | | V1 | b45.75 → 105.03 |
| **Title** | **drop 1's hit 9.05** (cut on the 8.96 pickup) → b4.5 | | W3 | b28 → 64.85 | | V2 | b47.25 → 108.43 |
| T1–T4 | b4.5/6/7/8 → 11.64/15.03/17.30/19.56 | | M1 | b29.5 → 68.24 | | V3 | b48.5 → 111.26 (下落不明 complete by the b49 hit, 112.39) |
| N1 | b9 → 21.83 | | M2 | b31 → 71.64 | | Y1 | b50 → 114.66 |
| N2 | b10.5 → 25.22 | | M3 | b32.5 → 75.03 | | Y2 | b51.5 → 118.05 |
| S1 | b11.5 → 27.49 (v2.2: b11.25) | | F1 | **b34 → 78.43** | | Y3 | b53 (or b52.5) → 121.45 |
| B1 | b13 → 30.88 | | F2 | b35.5 → 81.83 | | **Y4** | **b54 → 123.71** |
| BO | b14.5 → 34.28 | | Q1 | b37 → 85.22 | | R1 | b57 → 130.51 |
| Z1 | b16 → 37.68 | | Q2 | b38.5 → 88.62 | | D1 | b58.5 → 133.90 |
| Z2 | b17.25 → 40.51 | | P1 | b41 → 94.28 | | D2 | b60 → 137.30 |
| Z3 | b18.75 → 43.90 | | P2 | b42.5 → 97.68 | | E1 | b61.5 → 140.70 |
| Z4 | b20.25 → 47.30 | | | | | E3 | b63 → 144.09 |
| Z5 | b22 → 51.26 | | | | | E4 | b65.5 → 149.75 |
| I2 | b23.5 → 54.66 | | | | | E5 | b67.5 → 154.28 |
| | | | | | | E6 | b69 → 157.68 |
| | | | | | | E7 | b71.5 → 163.34 |
| | | | | | | E8 | **b74 → 169.00** |
| | | | | | | Q + end card | b76 → 173.53 … 184.30 |

**Floors the bars squeeze** (screenwriter's call; the picture supports the fixes noted):
- **Title:** from the hit (9.05) to the T1 cut (b4.5) it reads for 2.59 s, against 2.39 s for 9 字. A cut on b4 (10.51)
  would leave 1.46 s, so b4.5 is the earliest hand-over.
- **Teaser, N1, N2:** at their pace.py minimums they fill b4.5 → b11.5 exactly (T1 6 beats, T2–T4 4 each, N1 6, N2 4).
  - So S1 starts one beat later than in v2.2 (27.49) and still ends on b13.
  - N1 (3.40 s) and N2 (2.26 s) stay below their floors (3.5 and 2.64), as in v2.2. N2 gets the b11 → b11.5 picture pause
    after it.
- **Y3:** b53–b54 gives 2.26 s against 3.1 s. The picture beat (the 真迹 rolls going grey) is fixed on b53, and the line can
  start at b52.5.
- **F2 and D1:** 3.40 s each, 0.1 s under their floors.

## Scenes

Notation:
- `b15.25` = bar 15, beat 2.
- `[TOUCH: …]` = a figure must touch the scroll (or its box or roll) at that point. The hand aims at a real point on the
  object, never from off-screen.
- Subtitles are top-left unless the row says otherwise.
- **Sound: none in any scene. Music only.** The Sound column names the music event the picture rides.

| # | Bars · time | Shot & camera (medium) | Key visual | Text (lines · stamp · chip/counter) | Motion beats on the music | Transition OUT (motivated by…) | Sound |
|---|---|---|---|---|---|---|---|
| 01 | 0 → drop 1 · 0.00–8.96 (the cut; the title's contact is 9.05) | **One continuous take, the film's longest.** SILK full frame, already tracking right→left (as a handscroll is read) on frame 0. **b0.75 → b1:** pull back **out of the silk** onto CREST CR-A, dusk. **From b2.5:** a lateral track right at a third of the walkers' speed, speeding up into the drop. three.js (the silk is a plane in the CREST stage). | **Frame 0:** the glowing 虹桥 section fills the frame: the boat under the arch with its crew lowering the mast, the bridge crowd leaning over the railing, the river. It must read as a painting on silk (vignette, weave, ink linework), not as scenery. **Then** the same painting is held open on the real 虹桥 at dusk by two era-neutral silhouettes [TOUCH: each figure's hands on a roller]. The painted bridge rhymes with the real one. Small bank figures at both ends of the bridge stand in profile, turned to your light (人人都想留住你). **Then** you are rolled up and carried off right while the crest goes dark behind you. | H1 on frame 0 with its first glyphs already typed. H2 at b1. **Both clear on b2.5**, so the wind-up and the drop carry no subtitle. Stamp 「— 《清明上河图》」 (line 1), legible from frame 0, cleared on b2.5. No chip/counter. | **f0:** camera and mast already moving. **0.57 (first note):** the mast drop speeds up and the painted figures at the railing raise their arms. **b0 (1.45):** 留住 turns red; a sheen crosses the silk. **b0.5:** the track eases into a half-beat hold (wind-up). **b0.75 → b1:** the pull-back, slow → fast, settling on b1. **b1.5:** the real boat below lowers its mast (rhymes with frame 0). **b2:** they roll you up [TOUCH: both hands on the roller ends]. The light on the crest shrinks with the silk, and the rims on the bank figures go out from the ends inward. **b2.5:** they turn and walk off right (出), one step per beat. The front figure carries the roll under his arm [TOUCH: roll clamped under the upper arm, forearm under its end]. The bank figures' heads follow you, and the camera starts its track. **b2.75 · b3.0 · 8.78:** the six lanterns die in pairs, from the palace side toward you; the last pair goes on the track's breath. **8.78 → 8.96:** the darkest frame of the opening, still moving (owner row 91). Your glow, its rim on the carrier's sleeve and the last dusk in the sky remain (mean luma ≥ 45). The walkers step on and the track keeps going. Your glow has drifted to frame right (x ≈ 1710, y ≈ 580), and it trembles and swells 3 % (pauses.md wind-up). | **Glow-locked hard cut on the pickup (8.96)**, the film's first cut. The title band's right roller stands exactly where your glow was, and the band's slam lands on the hit (9.05). Motivated by drop 1 and the glow: the eye never leaves you. | Intro, no bass → the breath 8.78 → pickup 8.96 |
| 02 | drop 1 → b4.5 · 8.96–11.64 (contact 9.05) | TITLE: three.js silk band + HUD, over the crest at night, out of focus. | **You, opened.** A glowing silk band 1500 × 330, centred on the lock point (960, 580), with the blue mount ends and ivory roller knobs of the stills. In ink `#2A1F17`: 「假如你是」 (64 px, tracking 0.35 em) over 「清明上河图」 (170 px, Noto Serif CJK SC Black). It is built from the film's own silk (owner row 90) and sized like a plaque (owner row 38). Behind it is the crest you just left, dark and soft: dead lanterns, the far-bank skyline low, sky `#16222B → #22323C`. Luma ≥ 25 outside the band's own warm halo. | Title only: no subtitle, stamp or counter (the corner mark stays). The ink is centred by pixel measure. | **8.96 (cut):** the right roller stands at x 1710 and the left roller flies left. **9.05 (the hit: crash + sub-bass):** it slams to its stop at x 210 after 3 frames of flight and overshoots 12 px. A damped jolt follows, with its second bounce on **b3.5 (9.37, the opening's loudest attack)**, while the band scales 1.04 → 1.0. **No flash:** the lit area grows with the opening and peaks at the silk's own value. The bloom threshold stays above the silk's base, so the ink is crisp. **b4.0 (10.51):** a glint runs along the band left → right, the reading direction. **b4.0 → b4.5:** hold. The title is readable for 2.59 s from the hit. | **Glow-locked hard cut (b4.5)** into T1: the band becomes your silk lying open on the Yuan table, centred on the same point. The title says who you are, and the cut shows the first thing done to you. There is no exit move: the cut is the exit. | **Drop 1: the hit at 9.05**, sub-bass full by 9.10 |
| 03 | b4.5 → b6 · 11.64–15.03 | ROOM-元, night: the hook-still set, recomposed so your silk lies centred on the lock point. 3 % push. | Your glowing silk lies open on the table, its 虹桥 legible. The bowed craftsman (cloth cap) stands behind it at left, one hand on the grey copy's roller [TOUCH]. Behind, at right: the round window with the White Dagoba, and the hanging lamp. | T1 (whole on the cut). Stamp 「— 元 · 1351年前」. | **b4.5:** the stamp slams. **b4.75:** he slides the grey copy right into your place [TOUCH: hand on the copy's roller] and draws you off with the other hand [TOUCH: hand on your roller]. **b5.0:** the grey copy lies exactly on the lock point where you were. **b5.5:** he gathers you up [TOUCH: both hands on your roll] and steps out of frame right. His rim fades as your glow goes. **b5.75 → b6:** only grey is left under the lamp. | Hard cut (b6). T2 opens with your glow back on the lock point. | Sub-bass on the off-beats |
| 04 | b6 → b7 · 15.03–17.30 | CREST CR-C lateral track, NIGHT, lanterns out, P-明 角楼. | The eunuch walks right with your roll under his arm [TOUCH: roll clamped under the upper arm, forearm under its end]. His sleeve is lit. | T2. Stamp 「— 1578 · 紫禁城」. | **b6:** the stamp slams. He takes one step per beat, and the camera tracks so the glow stays on the lock point. | Hard cut (b7), glow-locked. | |
| 05 | b7 → b8 · 17.30–19.56 | CREST CR-B wide, SNOW-NIGHT, P-1923. A slow pan holds the bundle on the lock point. | A young man in a long gown and 瓜皮帽 (back three-quarter, no face, not 溥仪) crosses right hugging a cloth bundle. Glow leaks through the cloth [TOUCH: both arms round the bundle]. Snow lies on the railing. | T3. Stamp 「— 1923 · 紫禁城」. | **b7:** the stamp slams. Snow falls; he steps on the beats. | Hard cut (b8). The glow stops moving. | |
| 06 | b8 → b9 · 19.56–21.83 | STORE, lamp off. Very slow push. | Heaps of rolled scrolls as black shapes, with one faint glow buried on the lock point. | T4. Stamp 「— 约1950 · 沈阳」. | **b8:** the stamp slams. Then a picture pause on the lighter music: only the push and the dust. | **Light + shape match (b9):** the buried glow becomes the case light at the top of the 午门 ramp, and the heap's shapes become the queue's heads. | **Phrase change b8** (lighter top end) |
| 07 | b9 → b11.5 · 21.83–27.49 | WUMEN night. **b9:** crane up the ramp. **b10:** through the gate passage into the hall. **b10.5:** slow push on the case. | The queue snakes up the 马道 toward one warm point: you, in a glass case on the lock point. Inside, the crowd shuffles past, their profiles lit only by you. **Then your glow goes out:** the empty case, dim, its front pane dark. A card stands on the plinth: 「撤展回库」「下次展出：未公布」 (set-up for E8; it needn't be read here). | N1 (b9). N2 **centred** (？ pull-back) at b10.5. Stamps 「— 2025 · 故宫午门 / 故宫百年 · 展了一个月」 → b10.75 「— 2025年10月30日 / 撤展回库」. No counter. | **b9–b9.75:** the queue steps forward on the beats (time-lapse). **b10:** into the hall; the crowd files past in seconds. **b10.5:** N2 asks; the crowd thins. **b10.75:** your glow goes out, and the last visitor leaves the frame. **b11:** the card is there. **b11 → b11.5:** nothing new appears (picture pause). The push and the dust keep moving; luma ≥ 30. | **Lanterns in the glass (b11.5 → b11.75):** on b11.5, warm points light right → left in the case's dark front pane (the crest's lanterns), with a dusk sky behind them. The camera pushes through the pane (one thin highlight line crosses the frame) and arrives on the crest. Motivated by N2's question: the glass you lay behind shows where your life was played. | |
| 08 | b11.5 → b13 · 27.49–30.88 | CREST CR-B wide, 宋 DUSK, P-宋 gate far-left. The push through the glass eases into the locked wide by b11.75. | The empty stage: lanterns, the boat, the bank crowd. The direction rule is shown once: dark spreads **right** along the deck into the road; warm light runs **left** toward the palace. | S1 (types on b11.5, over the pane). No stamp. The tally draws itself (hollow). Counter not yet. | **b11.5 → b12.0:** the lanterns light right → left, two per beat (begun in the pane). **b12.0:** the 出 row draws as a shadow runs right along the deck. **b12.5:** the 进 row draws as the light runs left. | **Ink-trace morph (b13):** the real crest is traced into ink lines sweeping right→left, and dusk drains into silk: the stage becomes the painting. | |
| 09 | b13 → b14.5 · 30.88–34.28 | SILK: track right→left over the city painting itself in. **b14:** pull back to DESK (北宋 studio). | 汴京 draws itself stroke by stroke. Then the painter (whole figure, from behind, soft 幞头) at a long table, lit only by the silk. | B1. Stamp 「— 北宋末年 · 汴京 / 画成，未署名」. Chip 北宋 · 你 0 岁 (appears b13). Labels 「5米多长」 (b13.5) and 「几百个人」 (b14.0) in the mid band, gone by b14.25. | Strokes land on beats. **b14.25:** he rolls you up [TOUCH: both hands on the roller] and holds the roll out to his left, where a court official in 展脚幞头 takes it [TOUCH: both on the roll]. | **Match on action (b14.5):** the roll moving left in his hands continues as the roll carried left across the crest. | |
| 10 | b14.5 → b16 · 34.28–37.68 | CREST CR-B wide, 宋 DUSK → FIRE. | Two court figures carry you left toward the 宋 gate [TOUCH: each holds one end of the roll]. Then fire-glow, smoke and the palace darkened. Your glow comes back out of the gate among refugee carts streaming right, half hidden behind a cart. **No figure is seen taking you** (C5). | BO. Stamp 「— 北宋 · 宫廷 / 首次入宫（故宫博物院）」 → b15.5 「— 1127 · 汴京 / 靖康之变，流入金国」. Chip 北宋 0 → b15.5 金 · 你 约27岁. | **b15 (lift):** 进 ①. **b15.25–15.5:** the sky turns to FIRE. **b15.75:** 出 ①. | **Push into the drifting glow (b15.75 → b16):** the camera dives into your light and it resolves into your silk (insert entry 1). | Lift b15 → full section b16 |
| 11 | b16 → b17.25 · 37.68–40.51 | SILK insert: the painting's last section. | The camera searches the corners: lower-left (b16.25), upper-left (b16.75). Bare silk, no signature. | Z1. Stamp 〃. Counter rolls 约27 → 约86, landing at b17.25. | A soft pool of light moves with the camera. | **Slide past the join (b17.25 → b18):** the camera slides left across the seam onto blank paper, and the columns write themselves. | |
| 12 | b17.25 → b18.75 · 40.51–43.90 | SILK paper → pull back to DESK (金). | Ink columns appear right→left. Then 张著 (whole figure, seated) with the brush on the paper [TOUCH: brush tip at the newest column; left hand flat on the paper's edge], lit by your glow from the open painting at his right. **No brush enters from off-screen.** | Z2 (line 1 stays). Stamp 「— 1186 · 金国 / 张著题跋（今在卷尾） / 落款：清明后一日」. Chip 金 · 你 约86岁. | **b17.5:** the first column writes. **b17.75–18.25:** pull back. | **Tilt-push into the column (b18.75):** insert entry 2, into the writing. | |
| 13 | b18.75 → b23.5 · 43.90–54.66 | SILK colophon insert, one continuous move: push, tilt, track, pull back. | 「翰林张择端」 lights up big (≥ 120 px glyphs). Then 藏者宜宝之, one character per beat (≥ 140 px). Then the pull-back shows the colophon joined to your tail on 张著's desk. | Z3 (line 2) · Z4 (line 1) · Z5 (line 2). Stamp 〃 + line 3. Chip 金 · 约86. | **b19.0:** 张择端 glows. **b20.25:** track left. **b20.5 → b21.5:** 藏 者 宜 宝 之. **b22.0:** pull back. **b23.0:** 张著 rolls you up from the tail end [TOUCH: both hands on the roller]. | **Roll-up wipe (b23 → b23.5):** the roller sweeps left→right across the frame and reveals the Yuan crest behind it. | |
| 14 | b23.5 → b25 · 54.66–58.05 | CREST CR-E high oblique, 元 DAY, P-元 大都 + White Dagoba far-left, people on the bank. | Officials in brimmed Yuan hats carry you left [TOUCH: hands on the roll ends]. | I2. Stamp 「— 元初 · 元朝宫廷 / 再次入宫（故宫博物院）」. Chip 元 · 你 170多岁. | **b24:** 进 ②. **b24.5:** the camera pushes toward the White Dagoba. | **Match through the round window (b25):** the Dagoba outside becomes the Dagoba framed by the mounting room's round window from inside. | |
| 15 | b25 → b26.5 · 58.05–61.45 | ROOM-元, dusk in the window: the gate-2a hook still, longer (pays off T1). | The craftsman's hand flat on your silk [TOUCH]. | W1 (line 1 stays). Stamp 「— 元 · 1351年前 / 裱画匠调包（杨准记） / 杨准原话："以似本易去"」. Chip 元 · 你 **200多**岁. | **b25.5:** he lays the grey copy where you lay [TOUCH: copy's roller]. **b26.0:** he rolls you up [TOUCH: both rollers]. **b26.25:** he cups the hanging lamp [TOUCH: hand round the lamp]. | **Lamp-out match (b26.5):** the lamp dies, and on the same beat the crest's lanterns go out. Secrecy motivates the night. | |
| 16 | b26.5 → b28 · 61.45–64.85 | CREST CR-A medium two-shot (the gate-2a key composition) **relit for NIGHT**, lanterns out. | The secret sale. The craftsman (cloth cap) and the 权贵 (Yuan brim) hold you open between them, faces close, both profiles rimmed by you [TOUCH: four hands on the two rollers]. | W2 (line 2). Stamp 〃. Counter 200多. | **b27.0:** they roll you closed and the craftsman lets go. **b27.5:** the 权贵 turns right with the roll under his arm [TOUCH], 出 ②. | **Shrink into the record (b28):** this shot shrinks into a tiny vignette inside 杨准's column. The scene becomes the written record of itself. | |
| 17 | b28 → b29.5 · 64.85–68.24 | DESK (元 southern study: lattice window, banana leaves). Pull back from the column. | The replay plays inside his column as tiny silhouettes (craftsman, copy, hand-over). 杨准 (whole figure, seated) writing on your tail [TOUCH: brush tip on the paper; other hand on the paper]. | W3. Stamp 「— 1351 · 江西泰和 / 文人杨准买下，次年题跋」. Chip 元. Counter 200多 → **约251** at b28.5 (passes 249 → 251; never rests on 250). | **b28.0–29.0:** the replay runs once. | **Ink-bleed (b29.25 → b29.5):** his newest column's ink spreads and becomes the night sky over a Ming house. | |
| 18 | b29.5 → b31 · 68.24–71.64 | MING-LANE, night, from the back lane. | Torchlight gathers behind the roofs at the front gate (left), with officials' hat silhouettes and no violence. At the back gate (right) 陆完 (whole figure, Ming robe, square cap) hands your roll to a friend [TOUCH: both on the roll]. | M1. Stamp 「— 明 · 正德年间 · 苏州 / 陆完藏画友人家（余辉考）」. Chip 明 · 你 400多岁. | **b30.0:** the hand-over. **b30.75:** the friend's door closes; a sliver of light under it, then gone. | **Door wipe (b31):** the closing door's dark panel wipes into the first doorway of the enfilade. Not three dissolves. | |
| 19 | b31 → b33 · 71.64–76.17 | MING-HALL: the camera pushes through three doorways, then the hall, then outside the hall doors. | At each doorway a whole figure carries a lacquer box with glow at its seam [TOUCH: both hands on the box]. The 严 hall: treasures in silhouette, the box on a table. Then two officials in 乌纱帽 slap 封条 across the hall doors in an X [TOUCH: hands on the strips at the doors]. | M2 (line 1) · M3 (line 2) at b32.5. Stamp 「— 明 · 中期 / 辗转归严嵩（故宫博物院）」 → b32.5 「— 明 · 隆庆年间 / 严家被抄入宫（故宫博物院）」 (line 2 shortened, gate-1 carry-forward 3). Counter 400多 → b32.5 约470. | **b31.0** moon gate · **b31.5** vase gate · **b32.0** hall door. **b32.25:** the doors swing shut in front of the camera. **b32.5:** the 封条 slap (impact). | **Graphic match on the 封条 X (b33):** the X stays put while the doors become a sealed crate on a cart. | |
| 20 | b33 → b35.5 · 76.17–81.83 | CREST CR-B locked wide, 明 DUSK → NIGHT in one shot. From b34.5, CR-C tracking (T2's framing). | A confiscation cart with the sealed crate crosses left, Ming officials alongside [TOUCH: carters' hands on the shafts]. Then the night theft: the eunuch walks onto the crest from the palace side, heading right, your roll under his arm [TOUCH: roll clamped under the upper arm] (pays off T2). | M3 → F1 (line 1 stays). Stamp → b34 「— 1578 · 紫禁城 / 冯保偷盗而出（故宫博物院） / 冯保跋："心思爽然"」. Counter 约470 → 约478 during the sky change. | **b33.5:** 进 ③; the cart exits left. **b33.75 (bass drops):** the sky darkens to NIGHT by b34. **b34.0–34.75:** lanterns go out, one per beat. **b34.0:** the eunuch appears. **b34.5:** the camera starts to track. **b35.25 (bass back):** 出 ③. | **Foreground body wipe (b35.5):** he passes close to the lens, and his robe fills the frame for 4 frames. | **Breakdown starts b34** |
| 21 | b35.5 → b37 · 81.83–85.22 | SILK insert: the bare end of the painting, then a fast eased track left along the tail. | Z1's bare corner (callback). Then 冯保's colophon columns light one per beat. **He is not shown writing** (C20 order unknown). One place to look at a time: no split screen. | F2 (line 2). Stamp 〃 + line 3. Chip 明 · 约478. | **b36.0:** track. **b36.25–37.0:** four columns light. | **Silk → water ripple (b37):** the paper ripples into the river surface, and we arrive at water level. | Bass-less bar 36 |
| 22 | b37 → b38.5 · 85.22–88.62 | CREST CR-D low from the water, 清 DUSK, lanterns lit, people on the bank. The 紫禁城 through the arch. | A procession of Qing officials (caps with a top knob) crosses left above, carrying boxes [TOUCH: boxes held at the chest]. A boat in the foreground lowers its mast. | Q1. Stamp 「— 1799 · 紫禁城 / 毕沅家被抄，你入宫」. Chip 清 · 你 约699岁. | **b37.25 (bass):** 进 ④. | **Impact cut (b38.5):** the first imperial seal impression slams onto your silk on the beat. | |
| 23 | b38.5 → b41 · 88.62–94.28 | SILK insert (the 虹桥 section), then a slow pull-back. | Five red seal **impressions** slam in, the only red on screen apart from the HUD. No seal object and no hand. Then black palace eaves close over you from top and bottom, leaving a slit of glow: you belong to the court. | Q2. Stamp 「— 嘉庆 · 延春阁 / 五玺全（《石渠宝笈三编》）」. Chip 清 · 约699. | **b38.5, 38.75, 39.0, 39.25, 39.5:** one seal per beat (scale 1.12 → 1.0, damped jolt; 3-frame shake on the first). **b39.75–40.75 (bass-less):** the eaves close slowly. | **Roofline match (b41):** the eaves that closed over you are revealed as the far-bank 紫禁城 roofline seen from the crest in snow. | Bass-less bar 40 |
| 24 | b41 → b42.5 · 94.28–97.67 | CREST CR-B wide → T3's framing, SNOW-NIGHT, P-1923. | From the palace side, the young man in a long gown crosses right hugging the glowing bundle [TOUCH: both arms round the bundle] (pays off T3). 溥仪 is not drawn. | P1. Stamp 「— 1923 · 紫禁城 / 以赏弟弟溥杰为名（清宫档案）」 (line 2 shortened, gate-1 carry-forward 3). Chip 民国 · 你 约823岁. | **b41 (full bass back):** snow begins. **b42.0 (build):** 出 ④. | **Snow-gust wipe (b42.5):** a gust of big flakes crosses close to the lens; behind it the camera is high above the crest. | **Full bass b41, build b42** |
| 25 | b42.5 → b45.75 · 97.67–105.03 | CREST CR-G steep high angle in snow → SILK-paper ledger → DESK (清宫 night room). | Four gowned figures cross left→right one per beat, each with a bundle [TOUCH: arms round the bundles]. The **2nd** glows (you, the 1923-01-04 entry, C24); the others are grey. Each leaves a trail of footprints. Then the four trails straighten into the ledger's four columns. The two 「张择端清明上河图一卷」 entries light up (warm, legible; the other two columns stay unlit). Pull back: the ledger on a desk, and beside it two rolls, one glowing and one grey. | P2 (line 1) · P3 (line 2) at b44.25. Stamp 〃 / 「25天内 · 4卷（清宫档案）」. No dates on the ledger (no 1922). | **b42.5, 42.75, 43.0, 43.25:** the four crossings. **b43.25–44.25: one bar where nothing new appears** (snow on four trails, so the "four?" lands). **b44.25:** snow becomes paper. **b44.5 / b44.75:** the entries light. **b45.0:** pull back. **b45.5:** a standing figure lays your roll in a slatted box and closes the lid [TOUCH: hands on the roll, then the lid]. | **Into the slats (b45.5 → b45.75):** the camera goes close on the slats, with glow leaking through. The cut to another room is hidden in the close-up, and the camera pulls back out of a different place. | |
| 26 | b45.75 → b50 · 105.03–114.66 | XBL. Pull back from the slats: shelf → room → window → the building. Then night. Then a push through the open doors and a slow drift. | The box on a shelf among closed boxes. The small two-storey 图书楼 in its courtyard, its tree cycling seasons. **1945 (C27b):** headlights sweep across and away. The doors stand open; whole faceless guards carry armfuls of scrolls into the dark [TOUCH: arms round bundles of rolls]; a few scrolls lie on the floor. The camera searches the shelves: where your box was is lost in shadow behind a passing figure. **No glow anywhere** (C28). No prying tools, no tearing, no glow in any arms. | V1 → V2 (line 1) → V3 (line 2). Stamps 「— 伪满时期 · 长春 / 存于伪满皇宫图书楼」 → b47.25 「— 1945年8月 / 伪满覆灭，下落不明」. Chip 民国 · 830多 → 约845. | **b46.5–47.25:** one season per beat. **b47.25–47.75:** two cars' beams cross and leave right. **b48.0:** doors open; figures carry. **b48.5:** the search pan. **b49 (the hit):** the last figure leaves. **112.8–114.25 (true silence):** the camera keeps drifting slowly toward a dark heap on the floor (moonlight from the door, dust; luma ≥ 30). The counter rolls 约845 → 约850. Nothing new appears, and the motion never freezes (owner row 91). | **Lamp-reveal (b50):** a desk lamp clicks on and the dark heap is revealed as a different place: the 沈阳 storeroom. | **Stop b49: the film's one silence** |
| 27 | b50 → 123.40 · 114.66–123.40 | STORE, lamp on (pays off T4). Medium on the table, slow push. | The researcher (whole figure, seated, cadre jacket) with his hand on the lamp [TOUCH: hand on the lamp switch]. A faint glow deep in the heap, on the lock point (b50.5). Three rolls opened a hand's width each, each showing a 虹桥 and overlapped so they aren't counted [TOUCH: hands on the rollers]. Two carry 「真迹」 slips. The battered roll with torn edges lies apart in the reject pile. | Y1 (line 1) · Y2 (line 2) · Y3 (line 1). Stamp 「— 约1950 · 沈阳 / 东北博物馆 · 杨仁恺」. Chip 新中国 · 你 约850岁. | **b51.0:** he lifts rolls onto the table [TOUCH]. **b51.5 / 51.75 / 52.0:** one roll opens per beat. **b53.0 / b53.25 (pickup):** the two 真迹 rolls turn grey. **b53.5 → 123.40: picture pause.** The camera settles on the battered roll; his hand rests on it [TOUCH] and it trembles (wind-up), harder on the small onset at 123.13. | **Burst + dive (123.40, the hardest drop's bass; 「才是你」 types on b54, 123.71):** insert entry 3, the film's biggest. | Re-entry, no bass → pickup b53 |
| 28 | **123.40 → b57 · 123.40–130.51 · THE PEAK** | STORE → SILK in FULL COLOUR → SILK in relief. Dive, low track, then a crane up and back. | **123.40:** he unrolls the battered roll across the table, fast then slow [TOUCH: left hand on the roller, right hand flat on the silk's edge]. Its glow bursts out (gold bloom over 3 frames, peak ≤ 85 % luminance, never white). Every heap and shelf takes a warm rim, and dust motes rise like lanterns. Inside the 虹桥, colour floods out from the centre: the **first full-colour frame of the film**. The painted crowd comes alive: the crew lowering the mast, people at the railing pointing and shouting, a cart crossing. **b56:** the painted quarter lifts off the silk in 5 relief layers (river, boats, bridge, roofs, trees), the whole cast revealed at once (owner row 88). | Y4 (line 2) typed at b54, red 才是你, held. Stamp 〃. Chip 新中国 · 约850. | **123.40 (the bass):** the unroll, a 3-frame shake, the burst. **b54.0 (Y4 types):** the dive is under way; **b54.0–54.5:** the dive. **b54.5:** colour floods in. **b55.0:** low across the crowd. **b56.0 (loudest):** crane up into the relief reveal. **b56.75:** start to descend toward the crowd. | **Painted crowd → real crowd (b57):** the painted figures grow into the real silhouettes on the crest in daylight. | **Hardest drop: bass at 123.40 (b54 grid 123.71); loudest b56–57** |
| 29 | b57 → b58.5 · 130.51–133.90 | CREST CR-B wide, DAY (1950s), visitors on the far bank, P-1950 紫禁城 with its gate open and **no plaque**. | Two staff in cadre jackets carry your roll left [TOUCH: each holds an end]. | R1. Stamp 「— 1950年代 · 北京 / 回到故宫博物院」. Chip 新中国 · 你 850多岁. | **b57.5:** 进 ⑤. **b58.0:** all nine marks flash red and the 「四出五进」 label pulses. | **Through the gate passage (b58.25 → b58.5):** the camera follows you into the far-bank gate's dark passage and emerges through the **painted** city gate into the painting (insert entry 4). | |
| 30 | b58.5 → b61.5 · 133.90–140.70 | SILK (painted street, mono again). **b60:** pull out through a magnifier lens to RESTO. **b60.5:** push back into the lens. | The straw shed: two thin posts rise from a torn spot. A dashed donkey-ear outline draws itself over them, then a donkey paints itself in below on a patch a shade greyer than the silk. **No figure is drawn.** Then 1973: fluorescent tubes; one restorer seated and bent over the lens [TOUCH: tweezers at the patch's edge; other hand flat on the silk], one standing and holding the scroll flat [TOUCH: hands on the margin]. In the lens the patch lifts away and the posts stand over blank silk (C33). | D1 (line 1) · D2 (line 2). Stamp 「— 明代 / 裱画师误补（故宫装裱记录）」, chip 明, counter hidden → b60 「— 1973 · 故宫 / 重新装裱（故宫装裱记录）」, chip 新中国 · 你 约873岁. | **b59.0:** the posts. **b59.25:** the outline. **b59.5:** the donkey. **b60.0:** the lens contracts. **b60.5–61.0:** the peel. | **Crane up and drop (b61.5):** the restorer swings the magnifier aside, the camera rises over the whole scroll, then drops onto 张著's words. | |
| 31 | b61.5 → b63 · 140.70–144.09 | RESTO, from above the long table → SILK (colophon). | **The whole of you laid out at once:** the painting, the tail, the colophon paper and the red seals dotting the joins (older ones faded). Then 藏者宜宝之 glowing. | E1 (line 1 stays). Stamp 「— 1186 · 张著题跋 / 你身上：96方印 · 14段题跋」. Chip 新中国 · 你 900多岁. | **b61.5:** the magnifier swings aside [TOUCH: hand on the lamp arm]. **b62.25:** the camera drops. **b62.5:** 藏者宜宝之 glows. | **Whip-pan montage (b63).** | |
| 32 | b63 → b65.5 · 144.09–149.75 | Three whip-pans to earlier shots (re-renders), then WALL with a fast pull-back and a slow drift. | **偷:** the eunuch walking off the night crest. **换:** the grey copy sliding into your place. **藏:** the friend's door closing. **抄:** your one glowing roll pulls back to reveal the wall of ~100 grey copies, one glowing. | E3 whole at b63 (line 2 under E1). Each red word lands on its beat. Label 「约一百卷 · 只有一卷是你」 at b64.5. Stamp → b64 「— 今天 / 约百卷仿本（余辉估）」. Counter 900多. | **b63.0** 偷 · **b63.25** 换 · **b63.5** 藏 · **b63.75** held: the closed door, nothing new (pause) · **b64.0 (accent)** 抄 and the pull-back · **b64.5–65.25** slow drift along the wall. | **Sky tilt (b65.25 → b65.5):** tilt up off the wall into the dusk sky, then down onto the crest. | Accent b64 |
| 33 | b65.5 → b67.5 · 149.75–154.28 | CREST CR-B locked: the handover set as a flip-book. | Every 2 beats the era swaps (sky, hats, far-bank palace) and your glow is carried off right again. **宋** FIRE with carts · **元** NIGHT with the 权贵 · **明** NIGHT with the eunuch · **清/1923** SNOW with the bundle. | E4. Stamp 「— 宋 · 元 · 明 · 清 / 四次出宫（故宫博物院）」. **Proposal:** the chip flips 北宋 → 元 → 明 → 清 with the eras and the counter hides for these 2 bars (the script has 〃; producer and screenwriter to confirm). | **b65.5 / 66.0 / 66.5 / 67.0:** an era each, and the four 出 marks flash. | **Costume wipe + daybreak (b67.5):** daylight sweeps across left→right, and the figures it touches lose their hats and robes and walk on as today's visitors. | |
| 34 | b67.5 → b71.5 · 154.28–163.34 | CREST DAY (today) → b68.5 truck left with the crowd → b69 cross-section into the WUMEN hall. | Ordinary visitors (jackets, backpacks, a child on a parent's shoulders) cross **left** toward the palace: the queue from N1. Inside the hall you lie open in the glass case, the only light, rimming the profiles filing past. **Your glow stays on the lock point while everyone else moves:** the teaser inverted, nobody carries you. | E5 (line 1) · E6 (line 2) at b69. Stamp 「— 1950年代至今 · 故宫博物院 / 结束流离（故宫博物院）」. Chip 新中国 · 你 900多岁. | **b67.5–68.0:** the sweep. **b69.0:** a dark wall plane slides across as a foreground wipe. **b69–71.5:** the crowd flows; you hold. | (in the same hall) **Lights out row by row (b71.5).** | |
| 35 | b71.5 → b74 · 163.34–169.00 | WUMEN hall → POV from inside the box → the storage aisle, slow pull-back. | The ceiling lights die row by row and the crowd is gone. Two staff in white gloves roll you up [TOUCH: each on a roller] and lay you in a storage box [TOUCH]. **The lid closes over the camera:** its underside is lit warm by you, so it never goes black. Then the closed box on a shelf in a dim aisle, glow faint at its seams. | E7 (line 1 stays). Stamp 「— 故宫规定 / 展后静养三年以上（北京晚报）」. Counter 900多. | **b72.0:** roll-up. **b72.5:** into the box. **b72.75:** the lid. **b73.0:** cut on the lid closing to the aisle; pull back. | **Rectangle match (b74):** the box's front face becomes the empty case in the same screen rectangle. | Outro b74: bass drops out |
| 36 | b74 → b76 · 169.00–173.53 | WUMEN hall, slow push (callback to scene 07). | The empty case, the card 「撤展回库」「下次展出：未公布」. | E8 (line 2 under E7). Stamp 〃. Counter 900多. | Only the push. Soft. | **Reverse crane (b76):** pull back out of the hall through the gate passage and rise over the ramp. This bookends N1. | Outro |
| 37 | b76 → end · 173.53–184.30 | WUMEN exterior night: a slow rise over the **empty** 马道 ramp, the gate dark → END card over the scene at 40 %. | The empty ramp, where your place in the queue is free. Then the Juno end card. | Q **centred** (？ pull-back) at b76. **b77:** the Juno end card assembles: J monogram, gold title, the question in its slot, follow pill 「关注 Juno · 一起看懂世界」, sources. No stamp, no counter. | The rise continues to the end. The music ends at ≈ 184.2. | — (end) | Outro to the end |

## The crest handovers (R7 + R8): 14 visits, each IN and OUT different

| Visit | Deal and mood | How you change hands | IN move | OUT move |
|---|---|---|---|---|
| 01 hook | neutral, dusk → lanterns die | held open, then rolled and walked off right | pull back out of the silk | glow-locked hard cut to the title, slamming on drop 1's hit (9.05) |
| 04 T2 · 05 T3 | teaser, night | under the arm / bundle in the snow | hard cuts, glow-locked: the title + the format's four cuts, the **only** sanctioned repeat (one device) | hard cuts, glow-locked |
| 08 S1 | establishing, 宋 dusk | none (the empty stage); the rule drawn by light and shadow | lanterns in the glass: through the empty case's pane | ink-trace: stage → painting |
| 10 BO | official 进 (dusk) → 靖康 出 (fire) | two-man carry; then glow among carts, nobody seen grabbing you | match on action | push into the drifting glow |
| 14 I2 | official 进, 元 day | officials carry; high oblique | roll-up wipe | match through the round window |
| 16 W2 | **secret sale, night** | four hands on the rollers, then under the 权贵's arm | lamp-out match | shrink into 杨准's column |
| 20 M3 → F1 | official 进 at dusk → **theft at night** | cart with a sealed crate; then the eunuch, under the arm | 封条 graphic match | foreground body wipe (+ in-shot dusk → night) |
| 22 Q1 | official 进, 清 dusk | procession with boxes, seen from the water | silk → water ripple | impact cut on the first seal |
| 24 P1 | **smuggled out, snow night** | bundle hugged to the chest | roofline match | snow-gust wipe |
| 25 P2 | 25 days, four crossings | four bundle-carriers, one glowing; footprints | snow-gust wipe | snow → paper ledger |
| 29 R1 | official 进, 1950s day | two staff carry; all nine marks flash | painted crowd → real crowd | through the gate passage into the painted gate |
| 33 E4 | the four exits recalled | flip-book of the four exits | sky tilt | costume wipe + daybreak |
| 34 E5 | nobody's: today, day | visitors walk left; you are not carried | costume wipe | cross-section truck into the hall |

## Transitions (all 36 hand-overs; none repeats except the glow-locked hard cuts of the title + teaser chain, which the format asks for)

| # | Scenes | Lands on | Move | Motivated by |
|---|---|---|---|---|
| 1 | 01→02 | cut on the 8.96 pickup, slam on drop 1's hit (9.05) | The film's first hard cut, glow-locked: the band's right roller stands where your glow was, and the band flies open leftward and slams | Drop 1. The eye never leaves you, and a handscroll opens right → left |
| 2–5 | 02→03→04→05→06 | b4.5, b6, b7, b8 | Hard cuts with your glow locked at (960, 580). The title band becomes your silk on the Yuan table; at b5 the grey copy sits on the lock point | The format's four cuts, chained to the title; the eye never has to search |
| 6 | 06→07 | b9 | Light + shape match: buried glow → case light; heap → queue | The same "you" found again, in a different pile of people |
| 7 | 07→08 | b11.5 → b11.75 | Lanterns in the glass: the empty case's dark pane lights with the crest's lanterns, and the camera pushes through the pane | N2 asks why you are hard to see; the glass shows where your life was played |
| 8 | 08→09 | b13 | Ink-trace morph, right→left: the stage becomes the painting | B1: "you were painted in 汴京" |
| 9 | 09→10 | b14.5 | Match on action: the roll moving left continues left | The finished painting is handed to the court |
| 10 | 10→11 | b16 | Push into the drifting glow → silk (insert entry 1) | We follow you into the dark and look at you |
| 11 | 11→12 | b17.25→18 | Slide past the join; writing appears; pull back to the writer | The search for a name leads to the paper where a name is written |
| 12 | 12→13 | b18.75 | Tilt-push down the column (insert entry 2) | The line names what he wrote |
| 13 | 13→14 | b23→23.5 | Roll-up wipe: the roller sweeps left→right | He rolls you up, and your next owner is behind it |
| 14 | 14→15 | b25 | Match through the round window (Dagoba outside → inside) | Carried into the palace, we land in its back room |
| 15 | 15→16 | b26.5 | Lamp-out match: lamp and lanterns die on one beat | A secret sale needs the dark (R7) |
| 16 | 16→17 | b28 | Shrink into the record: the sale becomes a vignette in 杨准's column | 杨准 wrote the swap down |
| 17 | 17→18 | b29.5 | Ink-bleed into the night sky | A century passes inside the ink |
| 18 | 18→19 | b31 | Door wipe into the doorway enfilade | The friend's door closes and you pass from door to door (辗转) |
| 19 | 19→20 | b33 | Graphic match on the 封条 X: hall doors → crate on the cart | The confiscation seals travel with you |
| (in 20) | — | b33.75→34 | Dusk → night in one locked shot (no cut) | The official entry turns into the night theft (carry-forward 4b) |
| 20 | 20→21 | b35.5 | Foreground body wipe (the eunuch passes the lens) | The thief's own body carries us to his writing |
| 21 | 21→22 | b37 | Silk → water ripple, down to water level | From the record back to the river where you travel |
| 22 | 22→23 | b38.5 | Impact cut on the first seal | The emperor's seal is the hit |
| 23 | 23→24 | b41 | Roofline match: the eaves that closed over you = the far bank in snow | "You belong to the court", and the court's own house lets you out |
| 24 | 24→25 | b42.5 | Snow-gust wipe to a steep high angle | The same night, now seen as a pattern of four |
| (in 25) | — | b44.25 | Snow → paper: four footprint trails become four ledger columns | The crossings are the list |
| 25 | 25→26 | b45.5→45.75 | Into the slats, then pull back out of a different room (the cut hidden in the close-up) | The box travels; the place changes around it |
| (in 26) | — | b47.25 | Headlight sweep | 1945: the owners leave |
| 26 | 26→27 | b50 | Lamp-reveal: the dark resolves into the new place | Silence ends with light: someone is looking again |
| 27 | 27→28 | 123.40 (the bass; b54 = 123.71 carries 才是你) | Burst + dive into the silk (insert entry 3, the peak) | 才是你: we finally see you as you are |
| 28 | 28→29 | b57 | Painted crowd → real crowd | You come home among people |
| 29 | 29→30 | b58.5 | Through the gate passage into the painted city gate (insert entry 4) | Carried into the palace, you are opened again |
| (in 30) | — | b60 / b60.5 | Pull out through the magnifier lens; push back in | 1973: the restorer's eye |
| 30 | 30→31 | b61.5 | Crane up over the whole scroll, then drop onto 藏者宜宝之 | Everyone who treasured you is on this tail |
| 31 | 31→32 | b63 | Whip-pan montage, then the pull-back to the wall | 偷 / 换 / 藏 / 抄, one per beat |
| 32 | 32→33 | b65.5 | Sky tilt: up off the wall, down onto the crest | The four palaces recalled |
| (in 33) | — | b65.5–67 | Era flip on the locked handover set | The format's handover compressor |
| 33 | 33→34 | b67.5 | Costume wipe + daybreak | You stop belonging to anyone; the hats fall away |
| (in 34) | — | b69 | Cross-section truck through the wall | Follow the visitors in |
| 34 | 34→35 | b71.5 (+ b72.75) | Lights out row by row in the same hall; then the lid-close POV from inside the box | The price of safety: the show ends, you go into the dark |
| 35 | 35→36 | b74 | Rectangle match: closed box → empty case | Why you are hard to see: you are there, unseen |
| 36 | 36→37 | b76 | Reverse crane out through the gate, over the empty ramp | Bookends N1; the question asks about this queue |

No dip to black anywhere: the darkest frames (the b49 silence, the lid POV, the empty case) stay at luma ≥ 25–30. No
crossfade between scenes: every switch is a cut on a beat or a move with a physical reason. Outgoing labels and tags leave
before each move starts.

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
10. **E1: the camera rises over the whole scroll on the 1973 table** instead of tracking the whole tail to 藏者宜宝之.
    - 张著's colophon is the first one after the painting, so a track along the tail would pass it first.
11. **Q1: a procession on foot, seen from the water**, instead of a second confiscation cart. This keeps the crest repeats
    apart (gate-1 note: "the crest carry shows up five times in 41 s").
12. **E4: chip flip proposal** (see scene 33).
13. **Stamps M3 and P1:** line 2 is shortened to ≤ 14 字 (gate-1 carry-forward 3).
    **T1 / W1–W2:** 「— 元 · 1351年前」, 「以似本易去」 and counter 200多 (carry-forward 1). The gate-2a stills are not copied.
14. **(r2) The title is on drop 1** (owner, 2026-10-24). The order is hook → title → teaser → present day → S1, not the format's
    hook → teaser → present day → title.
    - Script v2.3 and this storyboard agree on every time from frame 0 to S1.
    - The script's picture column still shows T3 as a crate on a hand-cart; item 1 above stands (a cloth bundle).

**For the researcher before the build:**
- The silhouettes in the cast list: the Ming eunuch's hat, the Jin scholar's cap, the Qing officials' cap.
- The 虹桥's woven timber arch, and the 午门 马道's form.
- The 小白楼's massing.
- If the other two ledger entries are ever made legible: 谢隧 vs 谢遂 (C25 vs C31).

## Style frames

| Frame | File | What it proves | What it does not prove / what is superseded |
|---|---|---|---|
| A hook | `style/lookA_hook.png` | **ROOM-元** (round window + White Dagoba, hanging lamp, table). Live glow vs dead grey reads instantly. The craftsman's contact pose (hand flat on the silk). The ivory top-left subtitle over a mid-tone wall. A line-1-only teaser stamp. | The stamp text 「元 · 宫中」 is superseded by 「— 元 · 1351年前」. The 30 px corner mark is superseded by the old 21 px mark. **r2:** T1 recomposes this set with your silk centred on the lock point (960, 580). |
| A key | `style/lookA_key.png` | **CREST CR-A** scale (figures 54 % of frame height, scroll 436 px, the 虹桥 legible on the scroll). DUSK palette and luma (86/100). The Yuan brim, lanterns, the mast, the ripple dashes. The full furniture layout (subtitle, stamp with 3 lines, chip + counter). It is the lighting for **official entries** (BO, I2, M3, Q1). | **W2 is NIGHT** with the lanterns out (R7), so this frame does not prove the sale's lighting. Superseded text: 至正年间, the 杨准 line, 约240, the placeholder subtitle (use the W1–W2 stamp, 200多 and lines.json). The 30 px mark. |
| B hook / key | `style/lookB_hook.png`, `lookB_key.png` + `style/src/` | The code-drawn painting quality that **SILK** builds on, and the real-vs-grey split on silk. B's mineral palette is the peak's colour. | Not look A's subtitle polarity over silk (B used ink text). Look A uses the vignette plus ivory. |
| Corner mark | `style/corner_mark_compare.png` | The **left half** is the mark to build (old, 21 px light). | — |

**New stills to render first for gate 3, in this order** (nothing is rendered now, to save disk). Stills 1–3 are the first
impression.
1. **0:00, scene 01, frame 0.** The full-frame lantern-silk 虹桥 with the vignette, H1's first glyphs typed, and the stamp.
   - Is frame 0 striking on its own?
   - Does it read as *the painting* at a glance (the boat under the arch, silk and ink), not as scenery?
   - Do the ivory subtitle and the stamp read over a bright insert at 480 px?
   - Insert luma 120–160, with the linework not blown out by the bloom.
2. **0:08.9 and 0:09.6 (the drop), scenes 01 → 02, as a pair.** The last intro frame (dark crest, the walkers, your glow at
   frame right) and the title settled after its jolt.
   - Does the glow at frame right sit where the band's right roller stands (the lock across the cut)?
   - Is it a title at 480 px: big, the ink centred by pixel measure, 「清明上河图」 crisp under the bloom?
   - Is the band clearly the film's own silk, not a dropped-in serif card?
   - No flash: mean luma ≥ 45 before the cut, and the title frame no brighter than about 80 overall (surround ≥ 25).
3. **0:03.7 (b1), scene 01, the pull-back landing.** The painting held open on the real crest at dusk.
   - Does the painted bridge rhyme with the real one?
   - Are the bank figures in profile, turned to your light (no front-on blobs)?
   - pose_check PASS on the four hands on the rollers.
   - Dusk luma 75–100.
4. **2:08.2 (b56), scene 28, the peak.** The painting in full colour lifting into 5 relief layers.
   - Is it the most spectacular frame of the film, and not "an unfinished game" (ep13)?
   - Does the bloom keep the linework legible?
   - This is the hardest build and the biggest promise.
5. **1:02.6 (b27), scene 16, the night sale.** The gate-2a key composition relit for night, four hands on the rollers.
   - Night luma ≥ 45, so it is not "too dark" (ep21).
   - Rim light from you only.
   - pose_check PASS on four contact hands.
   - This lighting is reused by F1, T2 and E4.
6. **1:51.8 (b48.75), scene 26, 1945 小白楼.** Open doors, faceless guards carrying armfuls, scrolls on the floor, no glow.
   - Does it stay inside C27b/C28?
   - Is it not horror and not black?
   - Is the "where is it?" search readable?
7. **0:27.7 (b11.6), scene 07 → 08, mid-move.** The crest's lanterns lit in the empty case's pane.
   - Does it read as glass (a pane edge, a faint reflection of the hall), not as a crossfade?
