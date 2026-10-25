# Storyboard: 假如你是圆明园马首 · Look 1 铜灯影 only (gate 2b, r2)

**r2 (2026-10-25) answers `notes_gate2b_v1.md` (REVISE) and the producer's decisions.**
- **Note 1 (hero): Route B.** A full redraw in our flat-vector family, `style/v4/src/hero2.js`, with no 3D model and no normal map (one background family, no mixed rendering). It has:
  - hard-edged tone planes: forehead, nasal ridge, cheek plate, brow, jaw;
  - raised veins;
  - a flared comma nostril with its wrinkle fold;
  - the open spout mouth with both lips;
  - grooved mane locks rooted on the crest and lying on the neck, none leaving the silhouette;
  - the folded near ear modelled with the head;
  - a crisp cool window-reflection band along the ridge, small hot speculars and a `#250B04` core;
  - the collar ring visible in C1.

  The proof sheet is `style/v4/c1_proof.png`: full size, 400 px and three sizes. **The reference photo is missing.** This session has no web access (the proxy refused Wikimedia, Bing and Google). The sheet has a labelled slot for the researcher or producer to drop a press photo of the real head into.
- **Notes 2–10** are applied as the director wrote them. Each is marked *(n2)* … *(n10)* in the rows below.
- **The house style** (history-video-style, the ep44 standard) now applies to ep45:
  - corner items are ≥ 120 px from the left and right edges and ≥ 58 px from the top and bottom;
  - the stamp has two lines in 霞鹜文楷;
  - the owner's red hand-pressed J (`docs/history-video-style/jseal.png`) sits bottom-right at 74 px, opacity 0.9, rotated −6°;
  - **one accent colour for this episode: deep copper `#A84A26` key-word tags with cream `#FFF1DC` text**, replacing ep43's red;
  - the title holds ≥ 2.5 s;
  - the house end card;
  - camera moves stay ≤ ~25 px per frame;
  - hands are simple mittens, with no nails.
- **The film title on the title card and the end card is 「假如你是圆明园马首」.**
- **Re-rendered stills** in `style/v4/`:
  - c1_hook (new hero, both ears clear of the subtitle box, collar visible);
  - h1b_return (redone);
  - a4_noon and b3_1860 (new brothers; b3 also gets water reflections and the chest-height carry);
  - d6a_2007 and e2a_lamp (note 7 fixes);
  - bros_test plus `bros_blind.png`, the same sheet without labels, for B5.

  All six carry the new skin.



Art director, 2026-10-25. Built for the ep43 three.js engine (`43-qingming/film/KIT.md`).

**Inputs**
- brief_v2.md and the owner's final look call (Look 1 only, no wall, no hybrid)
- script.md v5.1 (picture column; `[wall]` shots re-staged here) and row H3c
- lines_bars.json as regenerated with H3c (48 lines + H3c; Q ends 169.50)
- music_v5.md, facts.md (F4b, F19, F20, F28–F34), HANDOFF §6
- notes_gate1_v5_r2, notes_gate2a_v2, style/looks_v2.md, the v3 hero
- owner-notes (art-director rows), craft.md, rubric

**Key frames:** `style/v4/{c1_hook, a4_noon, b3_1860, d6a_2007, e2a_lamp, h1b_return}.png`, the sheet `style/v4/sheet.png`, and the hero proof `style/v4/c1_proof.png`.
- 400-px checks are in `style/v4/check400/`.
- The brothers' silhouette sheet is `style/v4/bros_test.png`.
- Sources are in `style/v4/src/`: `bros.js` holds the new brothers, `v4.js` the stage helpers and story counter, `build.py <name>` renders a frame, `sheet.py` makes the sheet.

**Length:** 0 → 179.75 s (3:00). The music ends at 179.75 with a fade over the last bar.

**Grid:** film bar `b(j) = 1.4498 + 2.26415·j`. Beat = 0.566 s. `b31.5` = bar 31, beat 3.
- Hard cuts sit on a beat, in the teaser and on music hits only.
- Continuous moves start anywhere and **land** on a bar, a half-bar or a beat.

**Measured anchors** (music_v5.md):
| Event | Time |
|---|---|
| Title on drop 1 | 9.05 |
| Breakdown | 73.90 (b32) |
| Build | 92.02 (b40, D9b) |
| The stop: the lamp goes out | 107.87 (b47, E2a) |
| Pickup | 116.92 (b51) |
| Hardest drop | 118.87 audible (H1b) |
| Outro | 164.47 (b72, inside Q) |
| End | 179.75 |

The producer measures drop 1 and the hardest drop on `audio/bgm_cut45.wav` before the build, as in ep43. Nothing is read off the grid.

---

## Look: 铜灯影 (copper lamp shadows)

**World.** Silhouette theatre on layered 2.5D sets: every stage is 3–6 cut-out depth planes with fog between them, seen side-on or
frontal like a shadow-puppet stage, never in a free 3D orbit.
- **You, the red-copper horse head, are the only saturated thing and the light that matters.** You rim whatever is near you, in
  copper.
- **Home is the only daylight.** The 海晏堂 water clock at noon is the one bright, warm-grey place in the film: memory, A2–A4 and
  K1a.
- **Everything after 1860 is lived at night or under lamps:** the fire, the salerooms, Ho's room, the road, the courtyard.
- The ending turns the memory into an actual **lamp shadow**: the noon fountain comes back as a shadow-play on the 文殊亭's
  paper lattice, cast by your own light. That is where the look's name lands.

**Palette.**
| Role | Hex |
|---|---|
| **You (red copper ramp)** | `#FFD9A6` hi · `#E8874A` lite · `#B4532A` mid · `#6A2612` deep · `#250B04` dark · spec `#FFF6E6` |
| Your glow / rim on others | `#FF9A5A` glow, `#FFB070` rim (`#FFE0A0` in fire) |
| Silhouettes (all people, chairs, trees; one tone) | `#140D0A` (warm black), lit edges only from you or the scene's one key |
| Brothers (patinated bronze, desaturated) | `#251C16` body; in noon light a pale top rim `#F6E9C8`; in fire an orange rim `#FFA458` |
| Stone bodies (robed seats) | noon `#6E6758`, fire `#1E120D` |
| Noon memory sky | `#34494E → #5F716C → #A39C84 → #CDBB93` (zenith dark, so ivory subtitles read; horizon warm) |
| Noon stone / façade | `#8C8371` lit, `#5C554A` shade; pool `#9DAE9F → #6B857B → #4C645D` (jade-grey, desaturated) |
| Water arcs | core `#F3F1E8`, white spine, soft glow; **your arc** `#FFE2B4` core, `#FFB070` glow |
| Fire sky (1860.10.18 only) | `#2E1E22 → #6A2E24 → #BA562E → #E8924C`; flames `#FFE9B0 → #FFB04E → #EA6028`; smoke `#3A2224` |
| Red October dusk (B1a–B1b) | `#3A2A2E → #7A4A3A → #C47A50` |
| Night sky (road, courtyard) | `#1E2C33 → #2F4246 → #4A5752` (石青 slate, never navy) |
| Lamp interiors (salerooms, Ho's room on) | wall `#56463A`, top `#352B25`, floor `#3D2F25 → #1E1712`; panels `#7A6250` |
| Moonlit interior (Ho's room off, E2) | wall `#2E3A3C → #1E2224`, window `#2C4248 → #5F716A`, moonbeam `#9FB8B6` at 34 % |
| Practicals (desk lamp, lectern lamp, hanging lamps) | warm ivory `#F3DDB4` (low saturation), small and on their objects |
| Work light / museum light | cool ivory `#E6ECE6` |
| **Accent (the episode's one HUD colour, house style)** | key-word tag `#A84A26` with cream `#FFF1DC` text; stamp rule `#C8693A`. The J seal stays the owner's red stamp. |

**Luma targets** (mean of the frame, checked on every still; owner rows 71 and 16; owner 2026-10-25: "dark-toned but readable").
| Frames | Target | Key frames now |
|---|---|---|
| The hook (C1, 0–3.7 s) | ≥ 70 | c1_hook **72** |
| Night and indoor | ≥ 45, aim 50–60 | d6a **52**, e2a **51**, h1b **48** |
| Darkest beats (E2a/E2b after the lamp dies; D6b at the last spot; the rewind's dark frames) | ≥ 40 | e2a after the stop: **51** |
| Fire (B2–B3) | 55–70 | b3 **59** |
| Noon memory (A2–A4, K1a) | 85–105, never above 110 | a4 **98** |

Reach a darker beat with mid-tone light (moonlight, a lamp's falloff, your spill), never by letting the frame go black.

**Light rules.**
1. **One key per scene, plus you.** The key always sits on its object: the sky, the fire, the window, a lamp in the frame. You are
   always the second light and rim only the edges that face you (the engine's per-layer `rim`).
2. **You are the only saturated colour.** Practicals are warm ivory, never orange. Fire is yellow-orange and lives *behind* the
   action, desaturating into smoke at its top. Your copper keeps the highest local contrast in every frame.
   - The fire is the one bounded exception (B2–B3 and T1).
   - The foundry pour (A1) is you, so it is allowed.
3. **Bloom:** only on you, your arc and practicals. The threshold sits above your mid tone, so your face modelling never turns into a
   blob.
   - No white flashes anywhere (HANDOFF §6.11).
   - The hardest drop is a door of copper light, not a flash.
4. **Grade per side.** In a transition each side keeps its own grade (KIT `composite`). No crossfade mode 7 between scenes; mode 8 /
   `grade.flash` is not used.
5. **The screen-direction rule:** **away from home = rightward, toward home = leftward**, fixed all film.
   - The looter exits right.
   - The 1989 porter carries the crate right.
   - The 2020 van drives **left**: the only long leftward travel in the film, so the return reads as a reversal.

**Type** (on the render machines):
- Subtitles and stamps: Noto Serif CJK SC Black/Bold.
- Numerals: Cormorant Garamond SemiBold.
- Labels in the picture: Noto Serif CJK SC Black ≥ 48 px. A label that fails at 400 px switches to Noto Sans CJK SC Bold.
- The engine end card is unchanged.

**The hero (one asset, `style/v3/src/hero.js`, as approved at 2a v3).**
- A cast copper eye: a dome, an incised pupil ring and a brow ridge, with no white and no catch-light.
- **No tear line.** The facial crest runs back from below and behind the eye.
- Three layers of grooved, wavy mane locks and a curled forelock.
- A neck as deep as the jaw, ending in the cast collar ring.
- **Ears straight before 1860** (A1–B3, T1). **The near ear is folded from 1989 on** (C1, C2, T2–T5, D1 onward).
- **Scale ≈ ¼ of a person** in every shot that has a person (HANDOFF §6.3). In the wide H1b that makes you small; H2 pushes in.
- **r2 (note 1, Route B):** the hero is the cast-metal redraw `hero2.js` in the v3 local frame, so every placement holds.
  - It is flat vector only: hard tone planes `#250B04 → #FFF6E6`, a cool window-reflection band (`refl`, set per scene to that
    scene's window or sky colour), and 2–4 small hot speculars that slide as the camera moves.
  - It is the same asset at every size: rasterised at 4096 px for C1/H5, and baked to sprites for the medium and small shots.
  - **No normal-map bake and no 3D model** (producer: one background family).

**The eleven brothers at phone size** (the demo's "blob heads"; bros.js, sheet `style/v4/bros_test.png`). Five rules:
1. **B1 · One defining feature per animal breaks the outline,** because a silhouette is read by its edge:
   | Animal | Feature |
   |---|---|
   | 鼠 | round ear + whiskers |
   | 牛 | crescent horns + side ear |
   | 虎 | stripes cut through the silhouette + cheek ruff |
   | 兔 | two long ears |
   | 龙 | branching antlers + mane spikes + barbel |
   | 蛇 | wedge head + forked tongue + S-neck |
   | 羊 | spiral horn + beard |
   | 猴 | flat face, brow ridge, side ear |
   | 鸡 | serrated comb, beak, wattle |
   | 狗 | pricked ear + long muzzle + jaw line |
   | 猪 | snout disc + forward ear |

   Interior detail is a bonus, never the read.
2. **B2 · Always in profile, facing the pool:** the left row faces right and the far row faces left. A brother is never shown
   front-on.
3. **B3 · Minimum size:**
   - wide shots: head box ≥ 80 px (≈ 17 px on a 400-px phone frame), the nearest ≥ 150 px;
   - any shot that names a brother (D3, D9a, D11, H3c): ≥ 220 px.
4. **B4 · Contrast:**
   - against a light ground (noon sky, fire, a lamp pool) with ≥ 40 luma difference;
   - on a dark ground they take a thin rim from you or from the key;
   - heads are darker than their stone bodies, so head and body never merge.
5. **B5 · Proof:** the cold reader names all eleven from `bros_test.png` at 400 px before the build. Any that fails gets its feature
   enlarged.

   **r2 (note 4):**
   - 牛 is now one thick forward-up crescent horn with the ear horizontal below it, a square muzzle and a nostril notch.
   - 猴 has a smooth crown, a hard brow shelf with a notch under it, a short muzzle with a mouth line and chin, and a C-ear set
     back.
   - 蛇 has a coiled base, so the neck no longer reads as a swan.
   - 狗 has a pricked ear, a long muzzle and a jaw line.
   - **Owed in the build:** at ≥ 150 px the nearest heads get an incised eye, a nostril and a lit top plane `#3A2C22`–`#4A3A2C`.
     They stay darker than their stone bodies.
   - **B5 gate:** the cold reader names ≥ 10/11 from `bros_blind.png` (no labels) at 400 px, and finds 狗 and 猴 in a4 at 400 px.

     猴 is still my weakest; if it fails, it gets an open-mouth profile.

**Must NOT look like:**
- ep43 with a horse pasted in: no silk, no 虹桥 crest, no gold-on-navy;
- a navy night (night here is 石青 slate or moonlit umber);
- flat clip-art rooms: every set has ≥ 3 depth planes with fog, contact shadows and a light falloff;
- black frames;
- a glowing blob (the head keeps its modelling inside the glow);
- front-on faceless figures (profiles only, row 52);
- claws or detailed hands (mitten hands on IK arms);
- horror (no flames on figures, no violence; the looting is people carrying things);
- a bronze relief wall (the owner dropped Look 3);
- a museum display board.

---

## Engine layer (ep43 v6 caption layer, unchanged; story counter added)

| Element | Spec |
|---|---|
| Subtitle | `body.capC lay2 bl1 ad` from `43-qingming/film/film.html`, re-skinned for ep45 (`style/v4/src/skin.js`). Top-left x 150, y 124, Noto Serif CJK SC Black 64 px, ivory `#FFF3D8`. **Key words as cream `#FFF1DC` on deep-copper `#A84A26` tags: the episode's one accent colour (house style)**, only where `lines_bars.json` has `[ ]` (15/49 ≈ 1 line in 3). Typed reveal ≤ 0.4 s; T1–T4 appear whole on their cut. **Centred at the same height** (with the ½ em ？ pull-back measured on ink): T5, D7b, E2b, K1b, Q. Adaptive backing (`--bk`) only over bright ground: noon memory, the fire's top band, the door spill. |
| Stamp | **House style:** top-right, **120 px from the right edge**, 62 px from the top, copper rule `#C8693A`, **霞鹜文楷 Bold**.<br>• Line 1: `year · place`, 34 px.<br>• Line 2: a short note, 24 px, ≤ 12 字. Nothing the viewer needs lives only in line 2 (S6).<br>A stamp changes on its line's first frame or its scene's first downbeat (table below). |
| Bottom-left block | 140 / 64 px (≥ 120 / ≥ 58), scale 0.58, one row: **era chip + story counter**.<br>• **Chip:** 清 (A1–B3) · **当代 (D1–K3b)**. *(n2a)* No 「今」 anywhere: it would say "you are at 正觉寺 now" (F33/F34). The chip uses the accent copper instead of red.<br>• **Counter:** label + `n/12` (Cormorant 64 px) + **12 dots** (50 px before scale, ≈ 29 px on screen) in zodiac order 鼠牛虎兔龙蛇马羊猴鸡狗猪.<br>• **Dot states:** `h` at home (stone ivory) · `e` gone (hollow) · `r` back in China (red) · `y` you (copper, glowing) · `d` not back (dashed). |
| Counter rule | **The counter follows the picture and never drains while heads are still visible** (HANDOFF §6.2): 在家 12/12 → 11/12 on the lift → 0 only once the smoke has hidden the pool → 回国 0 → 4 → 5 → 7 → second row 回家 1/12 from H3b. Ticks land on beats. Table below. |
| Seal | **The owner's red hand-pressed J** (`docs/history-video-style/jseal.png`), bottom-right, 120 px from the right and 60 px from the bottom, 74 px, opacity 0.9, rotated −6°. |
| Corner mark | Off (`lay2 .mark{display:none}`, as in ep43 v6). |
| Labels | In the mid band (y 560–820), ≥ 48 px, ivory with a feathered scrim. They leave **before** any transition move starts. |
| Safe zones | **Subtitle zone** x 120–1120, y 100–230: sky, wall, roof underside or vignette, never a hero or a face. **Stamp zone** x 1280–1850, y 50–130: quiet. **Counter zone** x 120–1000, y 940–1040: floor, desk front or vignette. **Key visuals** live in x 240–1700, y 240–900. **Glow-lock point (960, 600):** the teaser cuts and the rewind keep you there. |
| End card | **House end card**:<br>• the last shot dims to ~30 %;<br>• the red J stamp is pressed in (scale 1.15 → 1.0 with a small settle);<br>• the film title on two lines, 「假如你是」 over 「圆明园马首」;<br>• the closing question centred at ~76 px, with its key words in the copper tag;<br>• the pill 「关注 Juno · 一起看懂世界」;<br>• the sources line.<br>It holds 169.50 → 179.75 (10.25 s ≥ 5.5 s). **Q is typed as a centred subtitle at 163.90.** At 169.50 the card forms around it and Q slides into the question slot; it is not retyped. |

### Hide / show
- **Hook C1:** the chip and counter are hidden. The stamp shows 「2007 · 香港」 from frame 0, so the hook already says "far
  from home".
- **Title (9.05–11.64):** the title plus the seal. *(n8b)* C2b stays full until 9.05 and fades out by 9.37 (2.26 s on screen). This is a conscious exception, with three conditions: it does not jolt with the slam, no ink overlaps the plaque, and the plaque is the brightest thing on the hit. The title holds 2.59 s (≥ 2.5).
- **Teaser T1–T4:** stamp line 1 only; the block is hidden.
- **T5:** the counter *is* the picture (the ring). The block is hidden. *(n8a)* T5's subtitle clears at 25.2, when the ring starts to spin (3.94 s on screen, above its 3.85 floor).
- **Rewind:** the stamp flicks back through the years; the block is hidden.
- **End card:** everything but the card is hidden.

### Stamps (line 1 only)
| Line(s) | Stamp |
|---|---|
| C1 | 2007 · 香港 |
| C2a | 2007.9.20 · 香港 |
| C2b | 2019.11.13 · 北京 |
| T1 | 1860 · 圆明园 |
| T2 | 1989 · 伦敦 |
| T3 | 2007 · 香港 |
| T4 | 2020 · 圆明园 |
| T5 | — 2026年10月 (over an unplaced night sky, no 正觉寺 roof in frame, *(n2d)*) |
| rewind | 2026 → 2020 → 2007 → 1989 → 1860 → 乾隆年间, one per 2 frames of flash |
| A1 | 乾隆年间 · 清宫匠师 |
| A2, A3a | 乾隆年间 · 海晏堂 |
| A3b | 11:00–13:00 · 午时 |
| A4 | 12:00 · 正午 |
| B1a, B1b | 1860.10 · 圆明园 |
| B2, B3 | 1860.10.18 · 圆明园 |
| D1–D2b | 1989 · 伦敦苏富比 |
| D3 | 2000 · 香港 · 保利购回 → on its 4th beat 2003 · 何鸿燊购回 |
| D5, D6a | 2007 · 香港苏富比 |
| D6b | 2007.8 · 国家文物局 |
| D7a, D7b | 2007.9.20 · 私下成交 |
| D8 | 1989 → 2007 |
| D9a, D9b | 2009.2.25 · 巴黎佳士得 |
| D10a | ticks 2009.2.25 → 2.26 → 2.27 → 2.28 → 3.1 → **2009.3.2 · 北京宣布** (one per window cycle; *(n8c)* the Paris room is never labelled Beijing) |
| D11 | 2013.6.28 · 国家博物馆 |
| E1 | 2019.11.13 · 国家博物馆 |
| E2a, E2b | 2020.5.26 · 香港 |
| H1a, H1b | 2020.12.1 · 圆明园 |
| H2 | 1860 → 2020 |
| H3a | 2020.12.1 · 北京 |
| H3c | 2026夏 · 杭州 |
| H3b | 2020.12.1 · 圆明园 |
| H4, H5a | 2020.12 · 正觉寺文殊亭 |
| H5b | 研究者观察 |
| K1a, K1b | 记忆里的水力钟 · 12:00 (never 今天, §6.9) |
| K2 | *(n2b)* no new stamp: K1a's 「记忆里的水力钟 · 12:00」 stays up through K2. The line's 至今 carries "now", and it refers to the five. |
| K3a | 2018.12.17 · 法国 |
| K3b | 真伪仍存疑 |
| Q | — (end card) |

**F33/F34 caution (coordinator).** The real head was on loan in Fuzhou in summer 2026.
- No stamp from H4 to Q says 今 or 2026 next to 正觉寺. The chip stays 当代 (n2a), and K2 has no 2026 stamp (n2b).
- The ending is staged as the 2020 arrival and as memory, never as "you are here now".
- H3c shows only the four brothers in Hangzhou and never the horse. Their cases are lit **cool** `#E6ECE6` with a dim bronze rim, never copper (n2c).

### Story counter by beat
| From | Row 1 | Row 2 | Dot states (鼠牛虎兔龙蛇马羊猴鸡狗猪) |
|---|---|---|---|
| A2 30.32 (draws on b13) | 在家 12/12 | — | `hhhhhhyhhhhh` |
| B3 lift ≈ b22.75 | 在家 11/12 | — | your dot empties: `hhhhhhehhhhh` |
| B3 once the smoke covers the pool ≈ b23.25 | rolls 11 → 0 in 6 frames, then flips to 回国 0/12 | — | `eeeeeeeeeeee` |
| D3 b28 / 28.25 / 28.5 / 28.75 | 回国 1 → 2 → 3 → 4 | — | 牛, 猴, 虎, 猪 fill red on their beats |
| D7b 82.39 (the HIT) | 回国 5/12 | — | yours fills copper |
| D11 b44.5 | 回国 7/12 | — | 鼠, 兔 fill red |
| H3c b57.5 → b58 | 回国 7/12 | — | the four medallions return **red** (`r`), not copper (n2c) |
| H3b b58 (the HIT) | 回国 7/12 | **回家 1/12** punches in centred (≥ 120 px), then settles as row 2 | row 2: only yours |
| K2 b67.5 | unchanged | unchanged | 龙 蛇 羊 鸡 狗 turn dashed (`d`) |
| K3a b69 | unchanged | unchanged | 龙's dash flickers twice, then holds |

---

## Sets (all 2.5D; depth z: negative = far)

| Code | Set | Planes (far → near) | Dressings | Scenes |
|---|---|---|---|---|
| **DESK** | Ho's private room (Hong Kong). One set used across 20 years. | window + night harbour bokeh (z −8) · panelled wall, the lamp's pool (−3) · desk, brass desk lamp, chair, papers, price card (0) · desk-top edge / lamp shade defocused (+1) | 2007 night, Ho signing · the hook close-up · 2020 empty, lamp on → off, moonlight | 01, 02, 09, 15 |
| **HALL** | 国家博物馆 hall | tall far wall with vertical windows and a dim ceiling grid (−8) · low ceremony stage + plinth (−1) · stanchions with ropes (+1) | 2013: rat + rabbit on one plinth, two certificate-holders · 2019: you under a cloth, two staff, the brass donation plaque | 03, 14 |
| **FOUNDRY** | Qing court foundry | brick kiln wall with the furnace mouth (−5) · beams, hanging tongs (−2) · floor with the mould, crucible, founder (0) · sparks (+1) | — | 06 |
| **POOL** | The 海晏堂 water clock, **frontal 八 view** | sky (−10) · trees (−8) · façade (−6) · double stair (−4) · terraces + the 12 statues, each its own card at its depth (−3 … 0) · pool plane with arcs and splash rings (−2 … 0) · front flagstones (+1) | NOON (memory) · RED-DUSK (1860.10) · FIRE (1860.10.18) · **SHADOW** (the same stage rendered to a texture, projected on the 文殊亭 lattice, K1–Q) | 06–08, 18–19 |
| **SALE** | One saleroom, side-on: chair rows facing right toward a podium (a turntable) and the rostrum | far wall, lot board, hanging lamps (−6) · far chairs (−3) · podium + work light (−1) · mid chairs (0) · rostrum + lectern lamp, near chairs (+1) | **LONDON 1989** (seated bidders with paddles, auctioneer, a porter with a crate) · **HK 2000** (turntable roll call) · **2003 side table** (Ho + seller, the pig) · **HK 2007** (empty chairs, catalogues, gavel at rest, work light) · **PARIS 2009** (tall windows, phone bank, result board) | 05 (T2/T3), 10–12 |
| **PRICE** | The DESK wall, with two standing columns of light (the bars) | wall (−2) · the two columns (−1) · desk edge (0) | — | 13 |
| **ROAD** | Night road to the 圆明园 east gate | sky + far city glow (−10) · far tree line (−6) · near trees (−2) · road + van (0) · roadside grass (+1) | night → blue hour | 16 |
| **COURT** | 正觉寺 courtyard | sky (−10) · far court wall (−6) · 文殊亭, two eaves, doors hinged as real 3D planes (−3) · steps (−1) · flagstones + two pines (0 / +1) | T4 doors ajar · H1b open · H4 wide with the 西洋楼 ruins far in the haze (−9) | 05 (T4), 17 |
| **CASE** | Inside the 文殊亭 | paper-lattice back screen (−3, the **shadow-play surface**) · glass case + plinth + you (0) · floor reflection (+0.5) | — | 18, 19 |
| **RING** | Twelve medallions over the night garden: a ring of round bronze plaques, each with its animal in silhouette | sky (−10) · ring (−4) · garden roofs (0) | T5 · H3a/H3b | 05, 17 |
| **MUSEUM-杭州** | Night exterior of a museum with a lit doorway | sky (−10) · museum mass + lit door (−4) · winding queue of visitors in profile (−2 … 0) · rope stanchions (+1) | — | 17 (H3c) |

---

## Line ↔ bar map (lines_bars.json as regenerated; the board moves no line)

| Line | Start s | Bar | | Line | Start s | Bar | | Line | Start s | Bar |
|---|---|---|---|---|---|---|---|---|---|---|
| C1 | 0.32 | b−0.5 | | D1 | 54.66 | b23.5 | | H1a | 115.22 | b50.25 |
| C2a | 3.71 | b1 | | D2a | 58.05 | **b25 HIT** | | **H1b** | **118.87** | **hardest drop** |
| C2b | 7.11 | b2.5 | | D2b | 61.45 | b26.5 | | H2 | 121.45 | b53 |
| **Title** | **9.05** | **drop 1** | | D3 | 64.85 | **b28 HIT ×3 + 1** | | H3a | 124.28 | b54.25 |
| T1 | 11.64 | b4.5 cut | | D5 | 68.24 | b29.5 | | **H3c** | 128.24 | b56 |
| T2 | 13.90 | b5.5 cut | | D6a | 71.64 | b31 (**breakdown 73.90** inside) | | **H3b** | **132.77** | **b58 HIT** |
| T3 | 16.17 | b6.5 cut | | D6b | 75.04 | b32.5 | | H4 | 136.17 | b59.5 |
| T4 | 19.00 | b7.75 cut | | D7a | 78.43 | b34 | | H5a | 140.13 | b61.25 |
| T5 | 21.26 | b8.75 HIT | | **D7b** | **82.39** | **b35.75 HIT** | | H5b | 143.53 | b62.75 |
| A1 | 26.36 | b11 | | D8 | 84.66 | b36.75 | | K1a | 147.49 | b64.5 |
| A2 | 30.32 | b12.75 | | D9a | 88.05 | b38.25 | | K1b | 151.45 | b66.25 |
| A3a | 34.28 | b14.5 | | **D9b** | **92.02** | **b40 build, HIT ×2** | | K2 | 154.28 | b67.5 |
| A3b | 37.68 | b16 | | D10a | 96.54 | b42 | | **K3a** | **157.68** | **b69 strike** |
| **A4** | **39.94** | **b17 HIT** | | D11 | 99.94 | b43.5 | | K3b | 161.64 | b70.75 |
| B1a | 43.34 | b18.5 | | E1 | 104.47 | b45.5 | | **Q** | **163.90 → 169.50** | b71.75 (**outro b72 = 164.47**) |
| B1b | 46.73 | b20 | | **E2a** | **107.87** | **b47 the stop** | | **End card** | **169.50 → 179.75** | fade over the last bar |
| **B2** | **50.13** | **b21.5 HIT** | | E2b | 111.83 | b48.75 | | | | |
| B3 | 52.39 | b22.5 | | | | | | | | |

**Picture-only stretches:**
- the title, 9.05–11.64;
- the rewind, ≈ 25.2 → 26.36 (T5 holds 3.85 s, then the ring spins);
- the end card, 169.50 → 179.75.

**One timing flag for the producer.**
- C2b is on screen 7.11 → 9.05: 1.94 s, against its 2.35 s minimum.
- I let it stay up through the title's slam to the 9.37 kick and fade out by 9.55. That gives it 2.26 s, and it sits top-left,
  clear of the centred plaque.
- If the director prefers a clean title frame, C2b needs the music, not the picture.

---

## Scenes

Notation:
- `[TOUCH: …]` = a hand or foot contact placed with `rig()` and checked per frame by `contact_check.mjs` (KIT).
- "push 1.00 → 1.08" = camera zoom with easeInOut unless a curve is named.
- Every move lands on the beat given.

| # | Time · lines | Set (planes) | What moves: who does what, with which hands and feet | Camera (start → end, easing) | Transition OUT (motivated by) | Music |
|---|---|---|---|---|---|---|
| **01** | 0.00–7.11 · C1, C2a | DESK 2007 night. Frame 0 is the **close-up**: you large (h ≈ 760 px), the collar ring resting on the desk and visible, facing left. *(n7c)* Both ears clear y 260 at the end of the push. The window with harbour bokeh is left, the lamp shade enters top-right, Ho's chair back is soft right (key frame c1_hook). | **Frame 0:** C1 already typed (4 glyphs on f0), your glow breathing (±3 %), dust motes drifting. **0.55 (first note):** the hot specular slides down your nasal ridge. **b0 (1.45):** the desk lamp **clicks on**; its warm-ivory pool slides across your cheek plate and mane from the upper right, and the window bokeh dims a stop. **b1 (C2a):** Ho is revealed, seated in profile at the desk's far end (one design all film: slim suit, slight stoop, swept-back hair, no face). He signs with his right hand [TOUCH: pen nib on the paper], his left hand flat on the paper [TOUCH]. The price card beside you already reads **HK$6910万** (≥ 72 px) and never counts. *(n9)* **b1.5:** he starts to rise (hips straight up, feet planted) with the cloth already in both hands [TOUCH: hands at its top corners]. | **f0 → b1:** push 1.00 → 1.05 on the close-up. **b1 → b2:** one continuous **pull-back** (easeInOut, 1.6 s, ≤ 25 px/frame) to a medium side-on of the desk: you ≈ ¼ of Ho's height, the lamp, the window. | **Draped-shape match (b2.5, 7.11):** he lays the cloth over you [TOUCH: both hands on the cloth as it falls]. On the beat, the covered shape cuts to the same covered shape in the lit HALL, in the same screen place. | Intro; something moves before 1.0 s (row 22) |
| **02** | 7.11–9.05 · C2b | HALL 2019 (国家博物馆): far windows, stage, rope stanchions near. | Two staff in profile, one each side of the plinth, take the cloth's two lower corners [TOUCH] and pull it off up and toward the lens on **8.78** (the breath). You are revealed, lit by the museum's cool light plus your own. Ho is not in the hall. | Locked medium, then a tiny lift with the cloth. | **Cloth wipe (8.96 → 9.05):** the flying cloth fills the lens (a dark foreground band, mode 6). Behind it the title plaque is already there and slams on the hit. | The breath 8.78, pickup 8.96 |
| **03** | 9.05–11.64 · TITLE | Over a defocused, dark POOL at noon. | **The plaque:** your copper profile (the hero, small, upper left of the text) and twelve thin water arcs that converge from both sides and **land on 9.05** to form a horseshoe ring around the title **「假如你是」 over 「圆明园马首」** (producer). Ivory serif, 「圆明园马首」 large; the copper accent sits only in your profile. It slams (scale 1.04 → 1.0, damped jolt, second bounce on **9.37**). No flash. **b4.0 (10.51):** a glint runs along the arcs. | Locked. | **Hard cut (b4.5)** to T1. The format's teaser cut; the glow-lock point holds you at (960, 600). | **Drop 1, 9.05**; kick 9.37 |
| **04** | 11.64–13.90 · T1 | POOL in FIRE, pushed in (the b3_1860 framing, tighter). | A looter in a kepi (crown higher at the back, tilted forward, short flat visor) stands on the terrace beside your seat. He lifts you off the stone body with both hands under the collar [TOUCH: both mittens under the collar ring], knees bent, then straightens. Ears straight. Embers. | Locked, 2 % push. | **Hard cut (b5.5).** | Drop section |
| **05** | 13.90–21.26 · T2, T3, T4 | **T2:** SALE LONDON 1989. **T3:** SALE HK 2007 (the d6a framing, wider). **T4:** COURT night. | **T2:** you in the lamp's pool on the podium; the auctioneer in profile at the rostrum swings the gavel down on **b6.0** (arm from the shoulder, wrist snap), and the strike lands on the beat [TOUCH: gavel head on the block]. **T3:** nobody moves; only the work light's dust. The gavel lies still. **T4:** the 文殊亭 doors swing open a crack (real 3D hinge on two planes) from inside; copper light runs down the steps in a thin strip. | T2 locked · T3 3 % push · T4 locked. | T2 → T3 and T3 → T4: **hard cuts (b6.5, b7.75)** with you on the glow-lock point. *(n5)* **T4 → T5 is a door move, not a crane.** The leaves swing almost shut on b8.5, the strip thins to a dot on b8.75, and a pull-back reveals the dot as your medallion in the RING, hanging in an unplaced night sky (n2d). | Teaser beats |
| **06a** | 21.26–26.36 · T5 + rewind | RING over the night garden. | Twelve round bronze medallions, each with its animal's silhouette (B1 shapes at ≥ 120 px). Seven warm (yours copper), five as thick dashed outlines: **回国 7/12** centred under the ring (≥ 96 px). T5 centred. **≈ 25.2: the rewind** *(n8a)*: T5's subtitle clears; a **◀◀** glyph (ivory, 72 px, upper centre) and horizontal tracking-noise bands appear. The ring spins counter-clockwise like a clock dial, with 3–4-frame flashes of T4 → T3 → T2 → T1 in reverse, each a re-render of its scene function with its year stamp, then the foundry's orange. | Locked; the ring is the move. | **Rewind → foundry glow (b11):** the last flash is the white-orange of molten copper. | HIT on T5 |
| **06b** | 26.36–30.32 · A1 | FOUNDRY. | A founder (Qing cap, apron) tips the crucible on long tongs with both hands [TOUCH: hands on the tong handles]. A molten copper stream pours into the clay mould (particles + an emissive ribbon). **b12:** he steadies the mould with his left hand [TOUCH] and knocks it with a mallet in his right. The halves fall to the floor and **you stand there glowing and seamless**, ≈ ¼ of his height. Ears straight. | Medium side-on; slow push 1.00 → 1.06. | **Profile match (b12.75):** your face cools orange → copper in the same screen place; the camera holds your profile while the foundry falls away and daylight rises behind. You now sit on the stone body. | |
| **07** | 30.32–43.34 · A2, A3a, A3b, A4 | POOL NOON (memory). Key frame a4_noon. | **A2:** one pull-back to the frontal 八 view: two rows of six on the terraces facing the pool; you third from the front on the left row; the snake across the pool. 在家 12/12 draws on b13. No 南/北 labels, no seat numbers. **A3a:** time-lapse. A sun shadow sweeps the terrace. One arc at a time leaves a mouth, always into the pool, and each next spout is on the **other bank** (the hand-over crosses the pool each time), speeding up. Label 「水力钟」 (56 px, mid band) b14.5 → b15.5. **A3b:** the 巳 snake's arc ends; its light crosses the pool to you; **only you spout**, a copper-gold arc. **A4 b17 (HIT):** the eleven fire **outward from you in a ripple**, all twelve up on the hit: thick bright cores, droplets, splash rings, a fine mist catching the light. | **A2:** pull-back from your profile to the full 八 (2.6 s, easeOut). **A3a:** locked wide. **A3b:** the camera follows the hand-over light **across the pool** to a medium on you (easeInOut, landing b16). **A4:** fast pull-back to the wide on b17 (easeOut 0.5 s), then slow push 1.00 → 1.08. | **The light changes (b18.25 → b18.5):** noon drains to a red October dusk in one locked frame (the sky, the façade's key and the water's colour change); the arcs drop. Then a **tilt down** (a vertical pan of the look-point) to the front flagstones as boots step in. | **HIT b17** |
| **08** | 43.34–54.66 · B1a, B1b, B2, B3 | POOL RED-DUSK → FIRE. Key frame b3_1860. | **B1a:** soldiers in kepis walk in left → right on the **front flagstones** (never on the terraces, the pool or the plinths), boots planted per step [TOUCH: soles on the flagstone line]; no flags. **B1b:** one carries a crate with both hands under it [TOUCH], another hugs a vase in both arms [TOUCH]; they walk out **right**. **B2 b21.5 (HIT):** fire flares behind the 海晏堂 façade (two flame layers, noise-driven heights, smoke columns, embers; *(n9)* no heat shimmer). *(n7a)* The pool reads as water: broken vertical fire reflections under the arched windows, a pale coping edge, and no plank streaks. **B3:** pays off T1, the same action run longer. *(n9)* Your seat stands at the terrace's **front edge**, so the looter lifts you from the flagstones [TOUCH], with no step-IK on the terrace. He walks **right** across the front flagstones with you held **at chest height** against him in both hands [TOUCH: near forearm under the collar, far mitten visible at the collar's front] *(n7b)*. The counter goes 12 → 11 on the lift. Your empty seat keeps a rim-lit collar ring. | **B1a:** a lateral track right at ⅓ of the walkers' speed. **B1b:** the track stops (picture pause). **B2:** locked on the hit, then a **push in through the embers** to your seat (1.0 → 1.22, b21.75 → b22.5). **B3:** locked while he walks out right, then a **tilt up into the smoke**. Only when the smoke covers the pool does the counter roll to 0 and flip to 回国 0/12. | **Smoke → saleroom haze (b23.5):** the smoke thins into the haze of the London saleroom's spotlight beam, the same soft shape in the same screen place (light/shape match). | **HIT b21.5** |
| **10** | 54.66–68.24 · D1, D2a, D2b, D3 (*(n10)* each head stops on the same turntable lock point and is ≥ 220 px; 「购回」 lands in the same spot each beat) | SALE LONDON 1989 → HK 2000 → 2003 side table. | **D1:** you on the podium in the spotlight (near ear folded from here on). Six seated bidders in profile, facing right in two rows (chairs, period suits); paddles rise from the shoulder in front of the face, one per beat. **D2a b25 (HIT):** pays off T2. The auctioneer winds up slow → fast and **strikes**; the price card on the lectern turns to **三四十万美元** (≥ 56 px; no count-up). **D2b:** a porter in an apron lifts you from the podium with both hands [TOUCH], sets you in an open crate, closes the lid, and pushes the crate off **right** on a trolley [TOUCH: hands on the handle]; a tag 「台湾收藏家」 (48 px) hangs on the crate. **D3 (b28, HIT ×3 + 1):** the turntable turns. Each beat a new head rides into the spotlight and the gavel strikes: **牛 b28, 猴 b28.25, 虎 b28.5**; each card turns 「购回」. **b28.75:** the lamp swings to a side table where Ho and a seller (profiles) **shake hands over the pig** (no gavel). The counter ticks 1 → 4 on those beats. | **D1:** slow drift from the bidders to you. **D2a:** locked. **D2b:** follow the crate right (track). **D3:** locked on the turntable, then a lamp-swing pan right to the side table. | **Lamp swing (b29.5):** the side table's lamp swings back across the room and lands on the podium as the 2007 work light. Same room, 18 years later: the bidders' chairs are empty. | **HIT b25; HITs b28 / 28.25 / 28.5** |
| **11** | 68.24–78.43 · D5, D6a, D6b | SALE HK 2007, before the sale. Key frame d6a_2007. | **D5:** pays off T3. Empty chairs with catalogues on the seats, the blank lot board, you on the podium under the cool work light, the gavel lying on its sound block in the lectern lamp's pool. **No one in the room**, no paddles, no LOT number (§6.1). **D6a:** nothing moves but dust and the push. The untouched gavel is the picture pause, rhyming with D2a's strike. **D6b b32.5:** a small card 「撤拍」 (≥ 72 px, ivory on dark) is slid onto the lot board's ledge from below frame by a staff hand [TOUCH: fingertips on the card's edge]. The **hanging lamps go out row by row** from the back, one per beat, until only your work-light spot is left. | **D6a:** slow push to the gavel, 1.00 → 1.12 (easeInOut, 3.4 s), crossing the breakdown at 73.90. **D6b:** locked; the room darkens around the spot (frame mean held ≥ 40 by the spot's spill and your glow). | **Spot → desk lamp (b33.75 → b34):** the work-light pool narrows to the size of Ho's desk-lamp pool; the private room rebuilds around that same light (light-edged iris, mode 12). One light becomes the next. | **Breakdown 73.90** |
| **12** | 78.43–84.66 · D7a, D7b | DESK 2007 (pays off C2a). | **D7a:** *(n9)* Ho is **already seated** when the iris opens (no walk → sit). He signs, right hand writing [TOUCH], left hand flat [TOUCH], and looks up once on b34.5. You stand on the desk in the lamp. **D7b b35.75 (HIT):** the price card stands up on its own hinge and **「6910万港元」 slams in centred (≥ 120 px)**: scale 1.06 → 1.0, damped jolt. It is fixed, with no count-up. 回国 5/12. | Medium side-on, locked; a 3 % push into the card on the hit. | **Card → column (b36.5 → b36.75):** the price card slides right along the desk, and its top edge becomes the top of a tall column of light rising on the wall behind. | **HIT b35.75** |
| **13** | 84.66–88.05 · D8 | PRICE: the DESK wall. | Two standing columns of copper light on the wall: a short one 「三四十万美元 · 1989」 and a tall one 「884万美元 · 2007」 (labels ≥ 48 px, at the column feet), with a bracket between their tops: 「二十多倍」. The tall column rises in the first beat; the bracket draws on b37.5. | Locked, then from b37.75 a **rise up the tall column**. | **Rise up the column → Paris cornice (b38.25):** the column's top edge becomes the ceiling cornice of the Paris saleroom; the camera tilts down into the room. | |
| **14** | 88.05–104.47 · D9a, D9b, D10a, D11 | SALE PARIS 2009 → HALL 2013. | **D9a:** rat and rabbit (≥ 220 px heads) on the podium. At a side table the **phone bank**: *(n9)* **one** clerk in profile with a handset at his ear [TOUCH: hand on the handset, handset at the ear] and a paddle in the other hand (F19 needs one phone). **D9b b40 (build) HIT ×2:** the clerk's paddle rises with the handset at his ear; the gavel strikes **on b40 and b40.25** (two strikes); the result board shows 「鼠首 + 兔首 · 合计 3149万欧元」 (≥ 56 px). On b41.5 the clerk lays the handset on its cradle (gate-1 r2 note 2: hung up on the sale night). **D10a b42:** a visible time step. Through the tall windows the light goes day → night **five times on five beats**, the stamp ticks to 2009.3.2 · 北京宣布 (n8c), and the empty room holds. Then 「未付款」 (≥ 72 px, red) is stamped across the board's result line on b43. Rat and rabbit stay lit on the podium. **D11 b43.5:** two figures in profile pass one certificate, each with both hands on it [TOUCH]; 回国 7/12 on b44.5. | **D9a:** a tilt down from the cornice to the room. **D9b:** locked. **D10a:** locked. **D10a → D11:** **push into rat and rabbit** as the light warms to museum daylight; the auction podium becomes a museum plinth (**shape match**, the same rectangle in the same screen place). | **Certificate → paper match (b45.25 → b45.5):** the 2013 certificate is laid on a table and a second one slides on top of it, yours, dated 2019. The camera rises off it into the 2019 hall. | **Build b40, HIT ×2** |
| **15a** | 104.47–107.87 · E1 | HALL 2019 (pays off C2b, the same hall run longer). | Two staff pull the cloth off you [TOUCH], a brass donation plaque stands beside you, a few guests in profile at the ropes. Ho is not drawn. | Medium, then a **push into the brass plaque** (b46.5 → b47). | **Brass → brass (b47):** the plaque's brass fills the frame, then pulls back as the brass base of Ho's desk lamp (material match). | |
| **15b** | 107.87–115.22 · E2a, E2b | DESK 2020, empty, moonlit. Key frame e2a_lamp. | **E2a:** the room from D7a with nobody in it: his chair pushed back, the lamp on. **The lamp goes out exactly on the stop (107.87).** The filament stays a dull ember for 0.5 s. The moonbeam from the window becomes the key (mean ≥ 40). **E2b (in the stop, centred):** one living motion: the curtain stirs, the star in the window twinkles, dust drifts in the moonbeam (§6.12, never a frozen frame). | **E2a:** locked. **E2b:** slow push toward the window. | **Window → star → crate (b49.75 → b50.25):** the push goes through the window into the star; the star's point becomes your copper glow leaking between a crate's slats in the back of a van. | **STOP 107.87; re-entry 110.13** |
| **16** | 115.22–118.87 · H1a | ROAD night → blue hour. | A van (side-on silhouette, rounded cab, its wheels turning) drives **left**. Your glow leaks between the slats of the crate in its back; the headlights cut two cones ahead. Near trees rush past, the far tree line slower; the sky lightens a stop. *(n6)* The 圆明园 east gate is a **frontal opening in a wall parallel to the road** (a far plane). The van stops in front of it ≈ 2 beats before the drop (b51). | Side-on lateral track left matching the van; the far planes give the parallax. The track eases out on b51. | *(n6)* **Over the roof into the gate (b51 → 118.87):** a push over the van's roof into the gate opening, then a **gate-shaped mask** hands over to COURT, landing on 118.87. No 90° turn. | **Pickup 116.92** |
| **17a** | 118.87–124.28 · H1b, H2 | COURT night, **low and close** *(n3)* (key frame h1b_return, mean 62). The 文殊亭 is drawn as Qing: 隔扇 doors with 菱花 lattice and 裙板 panels, the lower eave's underside with lit rafters across the top of frame, and an upturned 翼角 at each top corner (two eaves pending the researcher's photo). Pines are irregular needle-cloud pads with tufted, lit edges on twisting trunks. | **H1b, 118.87 (the hardest drop):** pays off T4. The centre doors swing fully open inward (real hinges). Two staff inside, **each in profile facing the leaf he walks back, both mittens on its free edge [TOUCH], stepping backward**. You stand on the plinth at the threshold, **≥ 160 px at the push's end** (≈ ¼ of a person at your depth; the staff stand deeper), the brightest thing. Copper light spills down the steps and **runs to the lens, widening across the flagstones**, and lights the eave's rafters and the pine needles' edges. **No white flash:** the sky stays darker than you. **H2:** the staff step aside. | **H1b:** push 1.00 → 1.12 on the drop (easeOut 0.4 s), ending with the door opening ≥ 45 % of frame height (it is ≈ 70 % in the still). **H2:** a slow **lateral arc** toward you (a parallax orbit; the hero stays a profile), ending medium on you. | **Crane up (b54 → b54.25):** we rise off the roof into the night sky, where the RING forms. This is the film's only crane into the ring (n5). | **Hardest drop 118.87** |
| **17b** | 124.28–132.77 · H3a, H3c | RING over the courtyard → MUSEUM-杭州. | **H3a:** the T5 ring re-forms over the garden: seven lit (yours copper), five dashed. 「回国 7/12」. **H3c b56:** *(n5)* the four lit medallions (牛 虎 猴 猪) drop out of the ring and fly **right** (away from home); the camera follows them down to a night museum where they become four lit cases. Stamp 「2026夏 · 杭州」. *(n9)* **One straight side-on queue** of visitors in profile, in two depth rows, steps forward on the beats toward the lit door (people walk; nobody floats). *(n2c)* The four heads (B3 ≥ 220 px) are lit by **cool museum light `#E6ECE6` with a dim bronze rim, never copper**. No "5小时" anywhere. The horse is not there (F33). | **H3a:** locked on the ring. **H3c:** follow the medallions down and right (b56 → b56.5, ≤ 25 px/frame), then a slow push along the queue. | **Back to the ring (b57.5 → b58):** the four cases' lights rise and fly **left** back onto the ring, landing as **red** medallions (`r`). The camera pulls back so the ring hangs over the 正觉寺 roof again. | |
| **17c** | 132.77–136.17 · H3b | RING over the COURT. | **b58 (HIT):** six lit medallions arc out over the courtyard wall to two skyline buildings on the horizon labelled 「保利艺术博物馆」 (4) and 「国家博物馆」 (2) (labels ≥ 48 px). **Only yours stays**, over the roof. **回家 1/12** punches in centred (≥ 120 px), then settles into the counter's second row. | Locked through the hit; then a **pull back wide**. | **Pull back wide (b59.5):** down to the courtyard wide. | **HIT b58** |
| **18** | 136.17–147.49 · H4, H5a, H5b | COURT wide → CASE. | **H4:** wide on the 正觉寺 courtyard (stamp 「2020.12 · 正觉寺文殊亭」). The 西洋楼 ruins only far in the haze (§6.9). A ghost of B2's smoke drifts in from frame left and stops at the temple wall. **H5a:** close-up: the near ear fills ≈ 30 % of the frame height, its top third folded forward and down with the lit bend; the far ear straight. **H5b:** a thin ring closes on the fold (stamp 「研究者观察」); faint lamp reflections from the salerooms slide across the copper, one per beat (London, Hong Kong, Paris). | **H4:** wide, slow push on the 文殊亭. *(n5)* **H4 → H5a (b61.25) is a shape match, not a second push through the doors:** the upturned 翼角 of the eave (same curve, same screen place) becomes the fold of your near ear. The building that escaped the fire hands over to the ear that was hurt. **Fallback:** the lit door rectangle becomes the glass case's lit frame, with no camera travel. **H5a:** slow drift to the ear. **H5b:** locked. | **Ring → basin (b64.25 → b64.5):** the ring on the ear widens into the round fountain basin, drawn in shadow on the lattice screen behind you. | |
| **19** | 147.49–163.90 · K1a, K1b, K2, K3a, K3b | CASE with the SHADOW-play screen (the POOL noon stage rendered as cast shadows on the paper lattice, lit by you). | **K1a (section return):** stamp 「记忆里的水力钟 · 12:00」. On the lattice behind you the twelve seats and twelve arcs rise as shadows, a callback to A4. **K1b (centred):** eleven shadow arcs fall, one per half-beat, and those eleven heads thin from their shadows (a fade from inside, no debris), leaving **eleven empty seat shadows**. Six get small tags 「保利 ×4 · 国博 ×2」 (≥ 40 px). Only your arc stays. **K2:** the five untagged seats get thick **dashed outlines** of 龙 蛇 羊 鸡 狗 (B1 shapes, each recognisable). *(n2b)* No new stamp; K1a's memory stamp stays. **K3a:** the lamp of your glow swings into the dragon's dashed outline; inside it, a tiny shadow-play saleroom (seated profiles, a rostrum) assembles. **b69 (157.68):** the gavel, already raised, **strikes**, and the dragon outline shakes for 3 frames. **K3b:** the dragon outline half-fills with copper and drains, twice; a small 「?」 (≥ 56 px). | **K1a:** locked medium: you in the round in front of the screen. **K3a:** **push into the dragon's outline** (b68.75 → b69). **K3b:** **pull back along the screen** (b71 → b71.75) to the last image. | **Pull back to the last image (b71.75):** you in your case, your single arc lit on the screen, eleven bare seats, five dashed. | **Strike b69** |
| **20** | 163.90–179.75 · Q, END | The last image, then the house end card over it, dimmed to ~30 %. | **Q** types centred at the subtitle height (？ pulled back ½ em). The **outro at 164.47** lets the screen's arcs slowly settle; your arc keeps flowing (one living motion). **169.50:** the end card forms around Q: the red J stamp pressed in, the title 「假如你是 / 圆明园马首」 on two lines, Q sliding into the centred question slot (~76 px, copper tags), the pill 「关注 Juno · 一起看懂世界」, the sources. It holds 10.25 s. Nothing gets brighter; the fade runs over the final bar. | A very slow pull-back, 1.00 → 0.94, to the end. | — (end) | Outro b72 |

---

## Transitions (every hand-over; no crossfades, no dips to black, no whips as filler)

| # | Scenes | Lands on | Move | Motivated by |
|---|---|---|---|---|
| 1 | in 01 | b1 → b2 | Pull-back from the close-up to the desk | Who has you? Ho does, and he is paying |
| 2 | 01 → 02 | b2.5 | Draped-shape match: the cloth-covered you in his room → the same covered shape in the hall | The cloth that hid you is the cloth that reveals you, 12 years later |
| 3 | 02 → 03 | 8.96 → 9.05 | Cloth wipe toward the lens (foreground band); the plaque slams on the hit | The unveiling throws the cloth at us, and drop 1 hits |
| 4–7 | 03 → 04 → 05 (T2 → T3 → T4) | b4.5, b5.5, b6.5, b7.75 | Hard cuts with you on the glow-lock point | The teaser's four promises; hard cuts only here |
| 8 | 05 → 06a | b8.5 → b8.75 | *(n5)* Door move: the leaves swing almost shut, the strip thins to a dot, and a pull-back reveals the dot as your medallion in an unplaced night sky | Home is a dot of light among twelve |
| 9 | 06a → 06b | ≈ 25.2 → b11 | Rewind ◀◀ with tracking noise: the ring spins back, with reverse flashes of T4 → T1 and the year stamps, into the foundry's orange | The film rewinds to the start of your life |
| 10 | 06b → 07 | b12.75 | Profile match: molten → copper; foundry → noon | You cool and are set on your seat |
| 11 | in 07 | b16 | The hand-over light crosses the pool to you | 午时 is your turn |
| 12 | 07 → 08 | b18.25 → b18.5 | Light change noon → red dusk in one locked frame, then a tilt down to the flagstones | 1860: the same place, a different light, boots |
| 13 | in 08 | b21.75 → b22.5 | Push in through the embers to your seat | The fire leads us to what is taken |
| 14 | 08 → 10 | b23.5 | Smoke → saleroom haze in a spotlight beam (light/shape match) | The smoke clears 129 years later, in a sale |
| 15 | in 10 | b28 | The turntable turns: the next lot rides in | One room, one mechanism: the brothers pass through it |
| 16 | 10 → 11 | b29.5 | Lamp swing: the side table's lamp swings onto the podium as the 2007 work light | Same room, 2003 → 2007; the light finds you again |
| 17 | 11 → 12 | b33.75 → b34 | Spot → desk lamp (light-edged iris) | The public room goes dark; the private deal has one lamp |
| 18 | 12 → 13 | b36.5 → b36.75 | Card → column: the price card becomes the top of a tall light column | A price becomes a height |
| 19 | 13 → 14 | b38.25 | Rise up the column into the Paris saleroom's cornice; tilt down | The price climbs to the next sale |
| 20 | in 14 | b42 → b43 | Five day/night cycles in the tall windows (a time step) | 5天后 shown, not said |
| 21 | in 14 | b43.5 | Push into rat and rabbit; podium → museum plinth (shape match) | The unpaid lot becomes a gift |
| 22 | 14 → 15a | b45.25 → b45.5 | Certificate → paper match: a second certificate slides on top, yours | 也: Ho gives you too |
| 23 | 15a → 15b | b46.5 → b47 | Brass plaque → brass lamp base (material match) | The donor's name on brass → the donor's lamp |
| 24 | in 15b | **107.87** | The lamp goes out on the stop | He dies; the music stops |
| 25 | 15b → 16 | b49.75 → b50.25 | Push through the window into the star → your glow in the crate | What he didn't wait for is already on its way |
| 26 | 16 → 17a | b51 → 118.87 | *(n6)* The van stops at the frontal gate; push over its roof into the opening; a gate-shaped mask hands over to COURT on the drop | Arrival |
| 27 | 17a → 17b | b54 → b54.25 | Crane up off the roof into the sky, where the ring forms | Count who came back |
| 28 | in 17b | b56 → b56.5 | *(n5)* The four medallions drop out of the ring and fly right; we follow them down to the Hangzhou queue | Where the brothers are this summer, carried away from home |
| 29 | 17b → 17c | b57.5 → b58 | They rise and fly left back onto the ring, landing red | They belong to the ring, but not here |
| 30 | 17c → 18 | b59.5 | Pull back wide to the courtyard | Only you live here |
| 31 | 18 → 18 | b61.25 | *(n5)* Shape match: the upturned 翼角 of the eave → the fold of your near ear (fallback: the lit door rectangle → the case's lit frame) | The building that escaped the fire hands over to the ear that was hurt |
| 32 | 18 → 19 | b64.25 → b64.5 | Ring → basin: the ring on the ear widens into the fountain basin, in shadow on the lattice | The scar remembers the fountain |
| 33 | in 19 | b68.75 → b69 | Push into the dragon's dashed outline; a saleroom assembles inside it | The missing ones may surface at a sale |
| 34 | in 19 | b71 → b71.75 | Pull back along the screen to the last image | The question: what do we do when one does? |
| 35 | 20 | 169.50 | The end card forms over the last image; Q slides into its slot | — |

Every transition is a match, a camera move through the set, or a light event. Hard cuts happen only in the T-montage (4–7) and
under the title's hit. No transition repeats.

---

## The hardest shots and what the engine needs that ep43 didn't have

| Shot | Why it's hard | Engine work (new vs ep43) |
|---|---|---|
| **07 / 19 · the water clock (POOL, frontal 八)** | 12 statues at 12 depths in a frontal perspective layout (ep43 was side-on); 12 arcs that read as water; the hand-over sequence; the same stage relit three ways and rendered as a shadow on the lattice | **Water arcs:** ribbon geometry along a quadratic, with a flowing core (scrolling alpha texture), a glow pass, droplet `Motes` and splash rings (*(n9)* no mist), plus a per-arc on/off curve for the time-lapse. **Perspective stage builder:** cards placed on two receding lines with a scale law. **POOL relight presets** (NOON / RED-DUSK / FIRE). **SHADOW mode:** render the POOL to a target, threshold it to silhouettes, multiply it with a paper-lattice texture on the CASE back plane, lit by your position. *(n9)* If the threshold takes > 1 h, re-shoot the POOL cards with a flat shadow material on the lattice plane. |
| **08 · 1860 lift + carry + fire** | Hands locked to the collar every frame while the looter lifts, steps down the terrace steps and walks; fire that isn't a comb of flames | **Fire:** two flame layers from noise-driven height fields (not sprites in a row), smoke columns lit from below, embers (*(n9)* no heat shimmer). *(n9)* No step-IK: you sit at the terrace's front edge and the looter lifts from the flagstones. The contact checker on the carry (both mittens within 4 px of the collar). |
| **10–14 · the SALE family** | Rooms of seated figures (profiles, chairs, paddles from the shoulder), the gavel strike, the turntable, the porter + crate + trolley, *(n9)* one phone clerk (a handset at the ear), Ho already seated in D7a, lamps going out row by row, the 5-day window cycle | **Seated-crowd builder** (chair + seated pose, paddle raise). **Gavel strike rig** (shoulder–elbow–wrist with a snap curve; head on the block on the beat). **Turntable** (a rotating plinth card with lot swaps). **Practical-light rows** with per-lamp on/off curves feeding the grade. |
| 01 · the hook close-up | The hero at 760 px must hold up as metal | *(n1, Route B)* `hero2.js` rasterised at 4096 px (vector, no normal map); the hot speculars and the window band slide with the camera. Proof: `style/v4/c1_proof.png`. |
| 06b · the foundry pour | A molten stream, mould halves falling, glow cooling | An emissive ribbon stream, particle sparks, a cooling colour curve on the hero (orange → copper), two rigid mould-half cards with gravity. |
| 02 / 15a / 01 · the cloth | Drape over you and pull off toward the lens | Not a cloth sim: 3–4 keyed silhouette shapes morphed (`flubber`-style path interpolation) with a soft shadow, plus the foreground wipe band. |
| 16 · the van | A vehicle silhouette at speed, leaking glow, at night | A van card (cab + box), rotating wheel cards, headlight cones (additive), slat-leak glow (emissive strips), 4-plane road parallax, the gate set. |
| 17a · the 正觉寺 doors | Door leaves that really open, staff walking them back | Two door planes hinged in true 3D (rotation about a vertical edge; KIT forbids CSS 3D, not three.js), the staff rigged to the leaf edges, the copper spill as an additive wedge on the flagstones. |
| 06a / 17 · the RING | Twelve medallions with animal silhouettes, lit states, the rewind spin, medallions flying to the skyline | A medallion card with a state curve; the rewind as reverse re-renders of T4–T1 scene functions (as ep43's E3 flashes). |
| HUD | The 12-dot story counter with states, the second row, the centred punch-in | `furniture.ts` addition: `tally12(states, label, n)` with the five dot states (CSS in `style/v4/src/v4.js` K.CSS4), plus a two-row block. |

### The three riskiest builds
1. **The water clock (07, 19).** It is the film's home image, its noon peak and its ending (as shadow).
   - Twelve water arcs have never been built in our engine.
   - The frontal 八 layout is new geometry.
   - If the arcs read as white wires or the brothers as lumps, the film's central image fails.
   - **Proof first:** a 4-s test of A3b → A4 with all twelve arcs, judged at 400 px.
2. **The 1860 lift and carry in fire (04, 08).** Contact-locked hands on the collar through a lift, a walk down steps and a carry,
   in front of the first fire we have built that isn't a row of flames. This is where the demo failed (pops, claw hands, feet
   on water).
   - **Proof:** the contact checker PASS over 52.39–54.66 and one fire test still.
3. **The saleroom family (05, 10–14).** It is the largest amount of figure work in the film:
   - seated crowds;
   - the auctioneer's strike;
   - the porter's lift into a crate;
   - phone-bank clerks with handsets at the ear;
   - Ho walking in and sitting.

   All of it is in one set with five dressings over 38 s. The risk is stiffness and body-logic errors at volume.
   - **Proof:** D2a and D9b stills plus contact PASS before the other dressings are built.

---

## Where this board differs from the script's picture column (for the director)

1. **Every `[wall]` shot is re-staged in Look 1** (owner: no relief wall):
   - T2/T3 and D1–D11 are lamp-lit SALE rooms (a crate, a turntable, the phone bank, a podium → plinth match).
   - D8's bars are two columns of light on Ho's wall.
   - K1a–Q are a **shadow-play on the 文殊亭 lattice**, cast by your light. The relief niches become dashed shadow outlines,
     and the 2018 dragon sale is a tiny shadow saleroom inside the dragon's outline.
2. **C1 is on Ho's desk in 2007, not in a museum case.** This is the script's own picture (head on a dark desk, lamp clicks
   on), and the stamp 「2007 · 香港」 makes the hook say "far from home".
3. **The water clock is staged frontally (the 八 shape), not side-on.**
   - It shows both rows facing the pool, you third on the left row and the snake across the pool (F4b), with no seat numbers.
   - B1–B3 use the same stage, so the 1860 loss happens in the place we saw at noon.
4. **D2b: a porter crates you and pushes the crate off right.** The script had a relief hand taking the lot card. The buyer
   is never shown.
5. **D3: the turntable roll call** carries the three 2000 strikes; the 2003 pig is a handshake at a side table (Ho + seller),
   as the script's "two hands meet over the pig".
6. **D9b: the clerk hangs up on the sale night** (gate-1 r2 note 2). D10a holds the room for the five-day window cycle.
7. **H3c (new line) is staged in Hangzhou with four glows and no horse** (F28, F31, F33). Its glows match back onto the ring
   for H3b.
8. **H2's "orbit" is a parallax arc.** The hero is a profile drawing, so a true orbit would show its flat edge.
9. **The ending avoids the present tense at 正觉寺** (F33/F34). No 今/2026 stamp is used next to 正觉寺. K stamps say memory
   or the status date only.

**For the researcher before the build:**
- Ho's silhouette (period suit, hair; no likeness);
- the 正觉寺文殊亭's roof form (two eaves?) and its door type;
- the 圆明园 east gate's form;
- the 2009 Christie's Paris saleroom (it was the YSL–Bergé sale at the Grand Palais; if confirmed, the tall-window Paris
  dressing becomes the Grand Palais's iron-and-glass vault);
- the 1860 kepi silhouette (already in figs.js) and an 1860 French/British soldier's coat cut;
- the 浙江省博物馆之江馆区's entrance form for H3c.

## Key frames (style/v4/)

| Frame | File | Time | Proves | Mean luma |
|---|---|---|---|---|
| Hook | `c1_hook.png` (+ `c1_proof.png`) | 0:01.6 | r2: the Route B cast-metal hero (planes, veins, nostril, open mouth, grooved mane, collar ring), the folded ear, the lamp key, 「2007 · 香港 / 圆明园流失文物」. No block. | 78 |
| Noon | `a4_noon.png` | 0:41 | The frontal 八 water clock, twelve arcs converging, the brothers as outline-breaking profiles, your copper arc; 在家 12/12 with the dot states. | 98 |
| 1860 | `b3_1860.png` | 0:53 | The same stage on fire, your empty seat's rim-lit collar ring, the looter in a kepi carrying you right in both hands at true scale; 在家 11/12. | 59 |
| 2007 room | `d6a_2007.png` | 1:12 | The saleroom before the sale: empty chairs with catalogues, the gavel at rest in the lectern lamp, the cool work light on you; 回国 4/12. | 52 |
| The stop | `e2a_lamp.png` | 1:48 | Ho's room empty, the lamp just out (ember), moonlit and never black; the star that carries E2b. | 51 |
| The return | `h1b_return.png` | 1:59 | r2: low and close; Qing 隔扇 doors with 菱花 lattice, eave rafters lit, needle-cloud pines; you ≈ 190 px at the threshold; the spill runs to the lens; no flash; chip 当代; 回国 7/12. | 62 |

All six were checked at 400 px wide (`style/v4/check400/strip400.png`). Every subtitle, every stamp, the hero and the gavel
read at that size. The counter's dots read as a row of states, but its numerals are small, as at ep43 v6 (S6: owner-approved
sizes).

**r2 lumas:** c1 78 · a4 98 · b3 59 · d6a 52 · e2a 50 · h1b **62**.

**r2 frame fixes:**
- **c1:** the new hero; both ears end below y 260; the collar ring rests on the desk.
- **h1b:** redone per note 3.
- **b3:**
  - (7a) vertical fire reflections and a pale coping edge;
  - (7b) the carry at chest height.
- **e2a:**
  - (7d) a straight chair back with a top rail;
  - the window top dropped to y 250;
  - the star ≥ 28 px with a halo, clear of the subtitle.
- **d6a:** (7e) the two left hanging lamps raised above y 90.
- **a4:**
  - (7f) the 海晏堂 façade and double curved stair are **not yet redrawn**; that waits for the researcher's 西洋楼铜版画 「海晏堂西面」 plate;
  - the new 猴/牛/蛇/狗 silhouettes are in.
- **All six** carry the house skin: copper tags, the two-line 霞鹜文楷 stamp at 120 px, the red J at 74 px, the bottom-left block at 64 px.

**Known limits of the frames:**
- In A4 猴 (second from the front, left) is still the weakest read; the B5 cold read decides.
- In H1b the staff are simple rig figures (profile heads read small); their door contact still needs the checker. The 翼角 tips are only just in frame at the top corners.
- In C1 the Route B hero is flat vector by design. It has not been compared with a photo of the real head (no web access); the slot is on `c1_proof.png`.
