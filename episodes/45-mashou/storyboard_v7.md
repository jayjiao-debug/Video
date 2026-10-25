# Storyboard v7: 《七个回国，一个回家》 · Look 1 铜灯影 · the build document

Art director, 2026-10-25 night. The owner OK'd the v7 key frames, so this board is what the builder follows, line by line. It
replaces `storyboard.md` (the 假如你是 / v5 structure) for everything after the key frames.

**Sources of truth**
- **Lines:** `lines_v7s.json`. These are subtitles only (no voice-over): 38 lines, the last ending at 123.506.
- **Music:** `audio/bgm_cut45_150.wav`, the v6 cut (`music_v5.md`, last section). The grid is `bar(j) = 1.4498 + 2.26415·j` and `beat(k) = 1.4498 + 0.566038·k`.
  - Landmarks: drop 1 **9.05** · join 17.30 · **breakdown 42.205** · **build 60.32** · **stop 76.165** · pickup 85.23 · **hardest drop 87.17** (audible) · phrase 105.60 · bar 54 **123.714** · fade 125.95 → **128.0** (film end; the outro at 132.77 is never reached).
- **Engine:** the ep43 three.js engine scaffolded in `film/` (`core.ts` Stage / setCam / composite, `film.ts` scenes as pure functions of t, `hud.ts`).
  - Every layer is an SVG string rasterised with `svgToCanvas` and placed with `Stage.add(name, tex, cx, cy, w, h, z)`.
  - The SVG builders are the key-frame code in `style/v4/src/`: kit.js, hero3.js, figs.js, bros.js, v4.js, v7.js, staff45.js, plus the inline sets in the v7_*.js frames.
- **Key frames (approved):** `style/v7/` (sheet `style/v7/sheet_v7.png`). The ear was redrawn after the OK (§9).

Numbers in this board:
- Times are film seconds.
- "b" = beat index on the grid (b56 = 33.148).
- Camera = `setCam(x, y, zoom)` in depth-0 frame px. **Interpolate log-zoom with `smooth`**: smoothstep peaks at 1.5× the mean speed, while cubic easeInOut peaks at 3×, which breaks the speed cap.
- "≤ N px/f" is the move's peak screen speed (pan × zoom + 1100 px × Δln zoom, × 1.5). Every move is ≤ 25 px/f, and there are no whip pans and no mode 10 smears.

---

## 1. Look (approved; summary for the builder)

- **World:** silhouette theatre on 2.5D layered stages (3–6 depth planes with fog between them), seen side-on or frontal, never in a free orbit.
  - **The copper horse head is the only saturated thing and the light that matters.** It rims whatever is near it in copper.
  - Noon at 海晏堂 is the one warm-grey daylight (memory only).
  - Everything after 1860 is lived at night or under lamps. Night = 石青 slate or moonlit umber, never navy.
- **Palette (hex):**
  - hero ramp `#0D0705 #190E09 #2A1A11 #3A2418 #6E4026 #C77A45`, rim `#F09A5E`, spec `#FFE6C6`; glow `#FF9A5A`;
  - silhouettes `#140D0A`; brothers dark `#231B16`, lit (back in China) ivory `#E9DCC4`, dashed `#F3E6CF`;
  - night `#1F3036 → #3C5357 → #6F8481`; noon sky `#34494E → #5F716C → #A39C84 → #CDBB93`; fire `#2E1E22 → #6A2E24 → #BA562E → #E8924C`;
  - lamp interiors `#56463A` wall, `#3D2F25 → #1E1712` floor; moonlit room `#2E3A3C → #1E2224`, beam `#9FB8B6`;
  - practicals warm ivory `#F3DDB4`; museum / work light cool ivory `#E6ECE6`;
  - **the one HUD accent:** copper tag `#A84A26` with cream `#FFF1DC` text, stamp rule `#C8693A`; the 「未付款」 stamp red `#C0302A` (a prop, not HUD).
- **Type:**
  - Subtitles: Noto Serif CJK SC Black 64 px, ivory `#FFF3D8`.
  - Stamps: 霞鹜文楷 Bold.
  - Numerals in the HUD: Cormorant Garamond SemiBold.
  - In-picture labels and boards: Noto Sans CJK SC Black (≥ 48 px; key numbers 96–160 px).
- **Luma targets** (mean of the frame): hook ≥ 65 · night and indoor 45–60 · darkest beats (E2/E3) ≥ 40 · fire 55–70 · noon 85–105 (≤ 110).
- **Must NOT look like:**
  - a navy night with gold light;
  - ep43 with a horse pasted in (no silk, no gold-on-navy);
  - flat clip-art rooms;
  - black frames or dips to black;
  - a glowing blob (the head keeps its modelling inside the glow);
  - front-on faceless figures, claws or drawn fingers;
  - horror (no flames on people);
  - a museum display board;
  - slide layouts (header + figure + caption).

## 2. Engine layer (HUD, per house style)

| Element | Spec |
|---|---|
| Subtitle | **Top-left:** x 150, top ≈ 124 (as in the approved frames; brief_v2 house style, which overrides the template's y 820–960). Every line is top-left, including the ？ lines.<br>• Typed reveal ≤ 0.4 s. **H1 is whole on frame 0** (subtitle on frame 0).<br>• `[ ]` words sit on the copper tag.<br>• Adaptive backing (`--bk`) only over bright ground: noon, the fire's top, the door spill, the Hangzhou glass hall.<br>• **H3 clears at 9.05** for the title (its window there is 5.978–9.05 = 3.07 s, above its 3.03 s minimum). Q types at 119.186 and slides into the end-card slot at 123.506. |
| Stamp | Top-right, 120 px from the right and 62 px from the top, copper rule.<br>• Line 1: `year · place`, 34 px.<br>• Line 2: ≤ 12 字, 24 px.<br>It changes on its line's first frame unless the board says otherwise. Never 今 / 2026 next to 正觉寺 (F33/F34). |
| Bottom-left block | Era chip + story counter (label, `n/12`, 12 dots in zodiac order 鼠牛虎兔龙蛇马羊猴鸡狗猪), 140 / 64 px.<br>• Dot states: `h` at home · `e` gone (hollow) · `r` back in China (ivory) · `y` the horse (copper) · `d` not back (dashed).<br>• A second row for 回园.<br>• Ticks land on beats. **The counter follows the picture and never drains while heads are visible.** |
| Seal | The owner's red J (`docs/history-video-style/jseal.png`), bottom-right, 120 / 60 px, 74 px, opacity 0.9, −6°. It hides on the title and the end card (the card has its own). |
| Corner mark | Off (ep43 v6). |
| Safe zones | Subtitle x 120–1120, y 100–230 · stamp x 1280–1850, y 50–140 · block x 120–1000, y 940–1040. Key visuals go in x 240–1700, y 240–900. Labels leave **before** any transition move starts. |

## 3. Sets (2.5D; z negative = far)

| Code | Planes (far → near) | Draw with (reuse) | Lines |
|---|---|---|---|
| **RING** | sky + moon + stars −10 · trees + far roofs −8 · terrace + pool −4 · far arc seats −2 · near arc seats 0 · the two vitrines +1 (slide in from the right) | `K.ringNight`, `K.ringPos`, `K.ring` / `K.ringSeat` (states dark / lit / dash / empty / hero), `K.bro`, `K.stoneBody`, `K.emptySeat`, `K.vitrine`, `K.horseHead` (hero3 r6). Author it **2400×1350**, so zoom 0.86 never shows an edge. | H1–H3, title |
| **MUSEUM-杭州** | sky −10 · museum mass + lit glass hall (four cases 牛 虎 猴 猪) + lit door −4 · far queue row −2 · near queue row 0 · stanchions + rope +1 | the inline set of `v7_n3_queue.js` (mass, hall, plaza, spill, door), `K.visitor` rows, `K.bro` in `K.vitrine`. Author it **3200 px wide**: the queue continues right and folds back on a switchback. | N1, N3 |
| **POOL** (noon / red-dusk / fire) | sky −10 · trees −8 · 海晏堂 façade −6 · double stair −4 · statues on two receding rows −3 … 0 · pool + arcs + splash rings −2 … 0 · front flagstones +1 · smoke +2 | `K.facade(mode)`, `K.stairs`, `K.pool`, `K.statue` (K.ROW_L / K.ROW_R), `K.arc`, `K.soldierCarry`, `K.kepi`, `K.figure`; the fire tongues from `v7_b2_taken.js` | A1–B2 |
| **SALE** (London 1989 / HK 2007) | wall, lot board, hanging lamps −6 · far chairs −3 · podium + work light −1 · mid chairs 0 · lectern + auctioneer, near chairs +1 | `K.saleLondon({phase})`, `K.seated`, `K.figure`, `K.limb`; the 2007 dressing from the inline set in `v7_d5_2007.js` (chairs with catalogues, gavel at rest) | D1–D6 |
| **DESK** (Ho's room, HK) | window + harbour bokeh / moon −8 · panelled wall −3 · desk, brass lamp, chair, the horse on its block, price card 0 · lamp shade defocused +1 | the inline set of `v7_e2_stop.js` (lamp on / off states), `K.seated` for Ho (no face), `K.horseHead` (base 'block') | D7–D9, E2, E3 |
| **PRICE** | the DESK wall (−3) with two light columns (−1) | new (§10) | D9 |
| **PARIS** | tall arched windows −6 · podium + rat and rabbit, rostrum + auctioneer (new), easel board, phone bank −1 … +1 | `K.saleParis({bx, stamp})` + a rostrum from `K.saleLondon`'s lectern and `K.figure` | P1, P2 |
| **PRESS** (Beijing 2009.3.2) | wall + screen −4 · seated speaker, table, microphones 0 · the Paris board on its easel (screen-locked layer) +1 | `K.pressRoom()`, the board slice of `K.saleParis({stamp:true})` (as in `v7_p3_refuse.js`) | P3 |
| **HALL** (国家博物馆) | far wall with tall windows + ceiling grid −8 · plinth 2013 (rat + rabbit) and plinth 2019 (the horse, brass plaque) −1, 2400 px apart · stanchions + ropes +1 | new (§10) | P4, E1 |
| **ROAD** | sky + city glow −10 · far tree line −6 · near trees −2 · road + van 0 · verge +1 · the 圆明园 gate silhouette −1 (enters at the end) | new (§10) | E4 |
| **COURT** (正觉寺 · 文殊亭) | sky −10 · the 西洋楼 ruins in haze −9 (new) · court wall −6 · 文殊亭 (two eaves; the 隔扇 doors as hinged 3D planes) −3 · steps −1 · flagstones + pines 0 / +1 · ghost smoke beyond the wall −7 | the inline set of `v7_r1_drop.js` (doors, staff via `STAFF45`, plinth, copper spill). It needs a **tall plate** (roof + sky above the door) for the crane. | R1–R3 |
| **CASE** (inside the 文殊亭) | paper lattice 菱花 back screen −3 (the shadow-play surface) · the horse on its black marble block 0 · floor reflection +0.5 | the lattice from `v7_q_end.js` / `v7_r5_ear.js`, `K.horseHead` (`earDetail:true` in the big raster), the shadow statues from `K.statue` filled flat `#24140C`, `K.arc` as shadow arcs | R4–R6, K1–K5, Q |

**CASE zoom scale:** zoom 1.0 = the Q composition (`v7_q_end.js`, hero h 400). On that scale K1–K3 = 1.4, K4 = 2.1, R4 = 2.65, R5 = 6.0, R6 = 6.4.
- **Rasterise the hero at 4096 px tall for CASE**, with `earDetail:true`.
- The small K / Q sizes come from the same texture (mipmaps), so there is no swap mid-move.

---

## 4. Scenes, line by line

Each block lists the set, then one row per line. **OUT** is the hand-over to the next block. In-set hand-overs are camera beats, not transitions.

### S01 · RING (0.00 – 11.36): the hook

| # | id · in–out | Line | Camera | Acting beat, and what lands where | HUD |
|---|---|---|---|---|---|
| 01 | H1 · 0.000–3.997 | 圆明园十二兽首，你猜回来了几个？ | Frame 0 is already moving: push (960,540,1.00) → (1000,560,1.06), smooth, 0–4.0 (≤ 2 px/f) | **f0:** the subtitle is whole; the horse lit and glowing (breathing ±3 %); eleven dark heads with a cool moon rim; the moon's reflection shimmers.<br>**bar 0 (1.45):** a copper rim sweeps across the horse from left to right (0.4 s).<br>**1.45–3.9:** the counter digit rolls `?` through random 0–12 and lands back on `?` | Counter 「回来了 ?/12」 `eeeeeeyeeeee` (the digit rolling) · stamp 「圆明园 · 十二兽首」 / 「海晏堂 · 水力钟」 · chip hidden |
| 02 | H2 · 3.997–5.978 | 七个回了中国。 | Push continues 1.06 → 1.08 | **Seven light up, one per half-beat** (b4.5 3.997 → b7.5 5.695): 牛 虎 猴 猪 鼠 兔 turn ivory (fill tween 0.12 s, a small rise of 4 px), and the horse last, flaring copper.<br>The counter ticks 1 → 7 on each light, and the label flips 回来了 → 回国 on 3.997.<br>The five (龙 蛇 羊 鸡 狗) become dashed outlines on 5.695 | 「回国 n/12」 ticking; dots fill `r` / `y` |
| 03 | H3 · 5.978–9.05 (subtitle) | 可住回圆明园的，[只有一个]。 | **5.98–7.10** reframe (1000,560,1.08) → (1180,600,0.86), smooth, ≤ 18 px/f. **7.10–9.60** push to the horse (1180,600,0.86) → (1020,660,2.10), log-zoom smooth, ≤ 24 px/f | **bar 2 (5.978):** the six lift off their seats (0.15 s rise) and fly right on ivory trails (`v7_h3_answer.js` curves) into **two vitrines that slide in from the right edge** (5.98–6.40): 保利艺术博物馆 ×4 · 国家博物馆 ×2 (labels 48 px). They land 6.55–6.95 (staggered).<br>Their seats show empty collars. The horse stays alone.<br>**5.978:** row 2 「回园 1/12」 punches in (scale 1.3 → 1, 0.2 s). The trails fade by 7.4.<br>From 7.3 the cases slide back out right as the push goes in (labels gone by 7.6, before they leave frame). | Row 1 「回国 7/12」 `rrrrddydrddr` · row 2 「回园 1/12」 `eeeeeeyeeeee` |
| — | title · 9.05–11.32 | *(on screen, no subtitle)* 七个回国，一个回家 | Push tail settles at 2.10 by 9.60; a drift of 1 % to 11.3 | **9.05 drop 1:** the title slams in centred-low (y 806–940): fast scale-down 1.25 → 1.0 in 0.12 s plus a 2-cycle damped jolt of 6 px on the **title only**. 「一个回家」 is in the copper gradient; the J seal is pressed at its end.<br>The ring is defocused behind (Frame `under` + `blurUnder` 7) and dimmed 28 %.<br>**10.79 (b16.5):** the 保利 ×4 case slides back in at frame right (x 1340–1800, y 236–472), lit, four ivory heads; it does not touch the title.<br>**11.07–11.32:** the title fades | Counter, chip and seal hidden · stamp hidden |

**OUT → S02 at 11.07–11.60 · RECT-GROW (new mode 14), type A "pane".** The 保利 case's glass rectangle grows from its rect to full frame (smooth, 0.53 s). Inside it is the Hangzhou glass hall, framed so its four lit cases (牛 虎 猴 猪) sit where the four heads sat.
- **Motivation:** the four in the case *are* the four that went to Hangzhou; the case carries us there.
- The ring stays outside the growing rect until it is gone.

### S02 · MUSEUM-杭州 (11.36 – 17.58)

| # | id · in–out | Line | Camera | Acting beat | HUD |
|---|---|---|---|---|---|
| 04 | N1 · 11.355–14.752 | 今年夏天，四个兽首去了杭州， | **11.65–14.65** pull-back + pan (1280,470,2.0) → (1500,540,1.0), ≤ 18 px/f | It opens inside the glass hall (four heads in cases, cool ivory museum light, never copper; the horse is **not** here, F33).<br>The pull-back reveals the museum's long stone mass at night, the lit door at far left, and the head of the queue at the door. Phone torches flicker in the line (3–4 small points, random 0.2–0.6 s). | Stamp 「2026 · 杭州」 / 「浙江省博物馆 · 四兽首」 · chip 当代 · counter hidden |
| 05 | N3 · 14.752–17.582 | 人们排了[几个小时]去看。 | **14.75–16.17** track left along the queue (1500,540) → (900,540), ≤ 21 px/f. **16.17–17.58** push to the pig's case (900,540,1.0) → (1100,500,1.35), ≤ 21 px/f | **The queue animation:** two depth rows of one-tone profile visitors facing left (toward the door). Every ~1.1 s (two beats) a ripple runs back down the line: each person takes one half-step forward in turn (0.08 s stagger), then stands.<br>Near rope stanchions pass in front (+1 parallax). At the right the line **folds back on a switchback**, with more people beyond: the length is felt, and no number is shown.<br>The push ends framing the 猪 head in its case at screen (1100,560), head box ≈ 300 px, facing left. | as 04 |

**OUT → S03 at 17.582 · OBJECT MATCH-CUT (mode 1), type B (1/2).** Both sides frame the pig's head at the same screen point and size: in the museum case under cool ivory light, then on its stone seat in noon daylight.
- **Motivation:** the same head, its two lives. People queue to see it; it used to be a spout.
- The join 17.30 sits inside N3's push (inaudible).

### S03 · POOL (17.58 – 30.04): noon → 1860

| # | id · in–out | Line | Camera | Acting beat | HUD |
|---|---|---|---|---|---|
| 06 | A1 · 17.582–21.261 | 十二兽首，原本是喷泉的出水口。 | **17.58–20.60** pull-back (1400,760,1.8) → (960,540,1.0), ≤ 22 px/f: from the pig to all twelve and the 海晏堂 façade | **b33 (20.129):** a thin trickle starts from **every mouth** (12 small falling ribbons, 0.3 s stagger from the horse outward), so 出水口 reads literally.<br>Then the **water clock hops:** a single taller arc moves seat to seat once per half-beat (20.13 → 20.98, about 4 hops; the "hours"), ending at the horse. | Counter 「在家 12/12」 `hhhhhhyhhhhh` draws on 17.9 · stamp 「乾隆年间 · 海晏堂」 / 「圆明园 · 水力钟」 · chip 清 |
| 07 | A2 · 21.261–24.657 | 正午12点，十二个[一起喷水]。 | **21.83–24.09** slow push 1.00 → 1.08 (≤ 3 px/f) | **b35 (21.261):** the horse spouts alone, its arc copper (午时).<br>**bar 9 (21.827): all twelve fire together:** arcs rise in 0.18 s with white spines and the horse's arc copper; splash rings on the pool; droplet motes.<br>**bar 10 (24.091):** the arcs fall back into the pool together (0.25 s). | Stamp → 「12:00 · 正午」 / 「乾隆年间 · 海晏堂」 |
| 08 | B1 · 24.657–28.337 | 1860年，英法联军进了园子。 | **24.90–26.40** tilt down (960,520) → (960,640), ≤ 4 px/f. **27.20–28.60** push toward the horse's seat (960,640,1.0) → (760,680,1.3), ≤ 19 px/f | RED-DUSK preset (`K.facade('fire')` sky grade, no flames yet).<br>Kepi silhouettes (1860 uniform, **no flag or insignia**, F10) march in **from the right, walking left**, along the front flagstones (never on the water): six walkers on the rig (`gaits`), staggered by a half-beat. They halt in a line by b45.5 (27.205).<br>Embers drift up from 26.5. | Stamp 「1860.10 · 圆明园」 / 「英法联军」 · counter 12/12 |
| 09 | B2 · 28.337–30.035 | 它被带走了。 | Push tail to 1.3 by 28.6. **29.40–30.20** tilt up into the smoke (y 680 → 420), ≤ 24 px/f | **bar 12 (28.620): the fire flares** behind the façade (flame tongues up 0.3 s; the windows glow orange).<br>On the same beat one soldier lifts the horse with both hands [TOUCH: both mittens on the neck cut, `contact_check`]; the lift is done by b48.5 (28.903).<br>He turns and walks **right**, out of frame by 29.8 (away from home), carrying it against his chest (`K.soldierCarry`).<br>Smoke rolls in from the right over the pool (29.2–29.9). | Counter 12 → **11 on the lift (28.903)**, horse dot `e`; then **11 → 0 in 6 frames once the smoke covers the pool (29.47)**; flips to hidden at 30.0 · stamp 「1860.10.18 · 圆明园」 / 「英法联军火烧圆明园」 |

**OUT for A2 → B1 at 24.37–24.95 · FOREGROUND BAND (mode 6, dir (−1,0)), type C (1/2).** The head of the marching column passes close to the lens, right to left: a dark body band (band 0.22). Under it, noon becomes the red dusk on the same stage.
- **Motivation:** the soldiers' arrival is what changes the light.

**OUT → S04 at 29.90–30.50 · INK-BLEED through smoke (mode 3, pt = the densest smoke ≈ (0.45, 0.30)), type D (1/1).** We have tilted up into the smoke. It thins with a noise edge, and through it the London ceiling: hanging lamps in a haze.
- **Motivation:** the smoke of 1860 clears 129 years later, in a saleroom's haze.

### S04 · SALE (30.04 – 48.15): London 1989 → Hong Kong 2007

| # | id · in–out | Line | Camera | Acting beat | HUD |
|---|---|---|---|---|---|
| 10 | D1 · 30.035–33.148 | 一百多年后，它出现在伦敦。 | **30.30–31.70** tilt down (960,300) → (960,540), ≤ 9 px/f; then a drift of 1.00 → 1.03 | The room settles: seated bidders in profile in three rows facing right; the auctioneer at the lectern.<br>**b53 (31.450): the work light clicks on over the podium, and the horse appears in it** (curl 1 from 1989 on). Dust motes in the beam. | Counter hidden (30.0–87.17) · stamp 「1989 · 伦敦」 / 「苏富比拍卖」 · chip 当代 |
| 11 | D2 · 33.148–35.412 | 你猜，它卖了多少？ | Drift 1.03 → 1.08 toward the board | **Paddles rise one per beat** (b56 33.148, b57 33.714, b58 34.280): 12, 47, 88, raised from the shoulder in front of the face.<br>The result board above is **face-down with a 「?」** that sways 2° on each paddle.<br>**b59 (34.846):** the auctioneer lifts the gavel (anticipation). | as 10 |
| 12 | D3 · 35.412–38.242 | 锤子落下：三四十万美元。 | Hold 1.08; push to 1.12 by 38.0 | **bar 15 (35.412): the strike.** The gavel head hits the sound block (2 frames of impact ticks).<br>The board **flips** (rotate about Y, 35.45–35.65) to 「三四十万美元」 (104 px). The board alone jolts 4 px, damped; the frame never shakes.<br>The paddles lower (35.6–36.0). | as 10 |
| 13 | D4 · 38.242–42.205 | 2007年，它又要上拍了。 | **39.09–45.00** slow push to the lectern (960,540,1.0) → (1300,590,1.35), ≤ 6 px/f | (Entered through the lamp swing.) The 2007 room: rows of empty chairs with catalogues, the horse on the podium under a cool work light, the gavel lying still on its block in the lectern lamp's pool.<br>No people, no paddles, no LOT number. | Stamp ticks 「1989」 → 「2007 · 香港」 / 「苏富比 · 拍卖前」 on 38.242 |
| 14 | D5 · 42.205–45.035 | 这一次，锤子[没有落下]。 | The push continues | **BREAKDOWN 42.205:** the bass drops out and **nothing strikes**. The untouched gavel; the lamp hum.<br>Living motion: dust motes, a slow 3 % flicker of the lectern lamp. | as 13 |
| 15 | D6 · 45.035–48.148 | 国家文物局反对公开拍卖。 | **45.30–47.30** ease back (1300,590,1.35) → (1150,560,1.15), ≤ 9 px/f | **b78 (45.601):** the lot board flips to 「撤拍」 (copper tag, 96 px).<br>The hanging lamps go out **row by row from the back**: b79 46.167, b80 46.733, b81 47.299. The room darkens to the last spot on the horse (frame mean ≥ 40).<br>**b81.5 (47.582):** the spot narrows to a small pool. | Stamp 「2007 · 香港」 / 「国家文物局 · 反对拍卖」 |

**OUT for D3 → D4 at 37.96–38.60 · LAMP SWING (mode 12 light-edged wipe, dir (1,0)), type E (1/2).** The hanging lamp over the podium swings left → right (a pendulum, 0.65 s). The bright leading edge of its pool *is* the wipe.
- Behind it: 1989 → 2007 in the same room. The bidders are gone; the catalogues lie on the chairs.
- **Motivation:** the same light finds the horse again, 18 years on.

**OUT → S05 at 47.87–48.45 · IRIS on the light pool (mode 5, pt = the spot's centre, soft 0.06), type F (1/2).** The last spot's pool opens out as Ho's desk-lamp pool at the same screen point.
- **Motivation:** the public sale goes dark; the private deal has one lamp.

### S05 · DESK → PRICE (48.15 – 56.92): the private deal

| # | id · in–out | Line | Camera | Acting beat | HUD |
|---|---|---|---|---|---|
| 16 | D7 · 48.148–51.544 | 拍卖前，何鸿燊私下买下了它： | **48.40–50.60** pull-back from the lamp pool (1230,420,1.25) → (960,540,1.0), ≤ 13 px/f | Ho's room, Hong Kong, night (brass lamp on, harbour bokeh).<br>Ho seated in profile at the desk (one design all film: slim suit, slight stoop, swept-back hair, **no face**).<br>**b84 (48.997):** he signs: right hand [TOUCH: pen nib on the paper] writing strokes until 50.5; left hand flat on the paper [TOUCH].<br>The horse stands on its block on the desk (≈ ¼ of his height). | Stamp 「2007.9.20 · 香港」 / 「私下成交」 |
| 17 | D8 · 51.544–53.808 | [6910万港元]。 | 51.5–53.5 push 1.00 → 1.08 toward the card | **b88.5 (51.544):** a standing price card rises from the desk: 「6910万港元」 (numerals 120 px, Cormorant + Noto Sans Black). **Fixed, no count-up, no paddles**; damped settle 0.3 s. Ho lays the pen down. | as 16 |
| 18 | D9 · 53.808–56.921 | 比伦敦那次，贵了[二十多倍]。 | **53.90–55.90** tilt up with the column (y 540 → 460), ≤ 2 px/f | **PRICE, on Ho's wall:** the card has become the top of a **tall light column** (morph below).<br>**b93.5 (54.374):** a short column fades up beside it: 「三四十万美元」 (London, 1989).<br>**b94.5 (54.940):** the bracket 「二十多倍」 draws between the two tops (0.3 s) in the copper accent.<br>Under the tall column, small: 「≈ 884万美元」 (48 px). | Stamp 「1989 → 2007」 / 「伦敦 · 香港」 |

**OUT for D8 → D9 at 53.525–54.10 · MORPH card → column (in-set), type G (1/1).** The price card's rectangle stretches downward and upward into a column of light standing on the wall (shape tween, 0.55 s). The desk dims 30 %.
- **Motivation:** a price becomes a height.

**OUT → S06 at 55.90–57.20 · CRANE UP + LIGHT-EDGED WIPE (mode 12, dir (0,1), top → down), type E (2/2).** The camera cranes up the tall column (55.90–56.90, ≤ 13 px/f) until its lit top fills the upper frame. A soft bright edge travels down, revealing Paris's tall arched windows (56.70–57.20).
- **Motivation:** the price climbs to the next sale; the column's light *is* the window's light.

### S06 · PARIS → PRESS (56.92 – 68.24): won, then refused

| # | id · in–out | Line | Camera | Acting beat | HUD |
|---|---|---|---|---|---|
| 19 | P1 · 56.921–60.32 | 兄弟鼠和兔，在巴黎上拍。 | **56.90–58.60** tilt down and frame the podium (960,260,1.0) → (700,560,1.2), ≤ 19 px/f. **59.40–60.90** ease out to the wide (700,560,1.2) → (960,540,1.0), ≤ 16 px/f | Paris 2009 at night: the rat and rabbit on the podium under the lamp, **drawn at 190 px, so ≥ 225 px on screen at zoom 1.2** (named brothers ≥ 220).<br>The rostrum and auctioneer stand right of the podium.<br>The phone bank: three standing clerks with handsets at their ears (the buyer is not in the room). On b101 (58.62) one clerk raises his free hand (a bid). | Stamp 「2009.2.25 · 巴黎」 / 「佳士得 · 电话竞拍」 |
| 20 | P2 · 60.32–64.563 | 锤子落下，两个共拍出3149万欧元。 | Wide at 1.0 from 60.9. **63.15–64.40** pan left (960,540) → (430,540), ≤ 19 px/f, so the board ends at screen right | **BUILD 60.32: strike 1** (the rat lot). **b105 (60.884): strike 2** (the rabbit lot). Each strike's gavel head is on the block.<br>**b106 (61.450):** on the easel board, a placard slides down into place: 「两件合计 / 3149万欧元」 (100 px). A slide, not the London flip.<br>**b107 (62.016):** the clerk hangs up.<br>**b109 (63.148):** the tall windows start cycling day → night **5 times** (0.25 s each, to 64.40), and the stamp date ticks with them. | Stamp ticks 2.25 → 2.26 → 2.27 → 2.28 → 3.1 (one per cycle) |
| 21 | P3 · 64.563–68.242 | 5天后，买家却说：[这个款不能付]。 | 64.6–68.0 slow push 1.00 → 1.06 toward the board | (Entered through the held-board wipe.) Beijing, the buyer's press table: a seated silhouette (no face) at a long table of microphones under a cool flat light. His hand rises on b112 (64.85), as if speaking.<br>**b113 (65.412):** the **「未付款」 stamp** presses onto the board (scale 1.25 → 1.0, 0.12 s, 3 px damped jolt of the board only). | Stamp 「2009.3.2 · 北京」 / 「买家记者会」 |

**OUT for P2 → P3 at 64.28–64.86 · HELD-PROP WIPE (mode 2 with roller shadow, dir (−1,0)), type I (1/1).** The result board is a screen-locked layer drawn identically on both sides (screen rect x 1290–1770, y 300–600). Behind it the Paris hall wipes away right → left to the Beijing press room.
- **Motivation:** the result is the same piece of paper; only the room (and the week) changes around it.

**OUT → S07 at 67.96–68.55 · FOREGROUND BAND, the unveiling cloth (mode 6, dir (1,0)), type C (2/2).** A dark cloth sweeps toward the lens left → right. It is the cloth being drawn off the rat and rabbit in the next room; B's first frames show its tail falling away at frame right.
- **Motivation:** the unpaid lot is uncovered as a gift.

### S07 · HALL, 国家博物馆 (68.24 – 75.60)

| # | id · in–out | Line | Camera | Acting beat | HUD |
|---|---|---|---|---|---|
| 22 | P4 · 68.242–72.205 | 一个法国家族，把鼠和兔无偿捐回。 | 68.5–71.0 slow push 1.00 → 1.06 on the plinth | 2013: the rat and rabbit together on one plinth (heads ≥ 220 px). Two staff silhouettes lower the cloth to the floor [TOUCH: hands at the cloth corners] (68.3–69.2), then step back.<br>The hall's tall windows; ropes on stanchions in the foreground. | Stamp 「2013.6.28 · 北京」 / 「国家博物馆 · 皮诺家族」 |
| 23 | E1 · 72.205–76.165 | 何鸿燊，也把它捐给了国家。 | **74.19–75.60** push down to the plaque (1500,540,1.0) → (1500,700,1.5), ≤ 23 px/f | 2019: the horse on its own plinth, a **brass donation plaque** on the plinth front: 「马首铜像 · 何鸿燊先生捐赠」 (48 px, engraved look). Its brass catches the light in one travelling glint (b129.5 74.75). | Stamp ticks 「2013」 → 「2019.11.13 · 北京」 / 「国家博物馆 · 捐赠仪式」 on 72.205 |

**OUT for P4 → E1 at 71.07–72.90 · LATERAL TRACK (camera only), type J (1/1).** The camera tracks right along the hall, (960,540) → (1500,540) at ≤ 16 px/f. The 2013 plinth leaves at frame left; the next plinth (the horse) arrives. The year stamp ticks on 72.205.
- **Motivation:** the same hall, the next gift. The 也 of the line is the camera moving to the next plinth.

**OUT → S08 at 75.601 (b131) · OBJECT MATCH-CUT, brass → brass (mode 1), type B (2/2).** The plaque's brass rectangle and glint at screen centre cut to the brass base of Ho's desk lamp at the same screen point, lamp on.
- **Motivation:** the donor's name on brass becomes the donor's own lamp. This cut lands one beat **before** the stop, so we see the lamp lit before it dies.

### S08 · DESK at night (75.60 – 83.30): the stop

| # | id · in–out | Line | Camera | Acting beat | HUD |
|---|---|---|---|---|---|
| (23 cont.) | 75.60–76.165 | (E1 still on screen) | **75.60–78.40** pull-back from the lamp base (1236,430,1.5) → (960,540,1.0), ≤ 15 px/f | The lamp is on; the room is warm. | — |
| 24 | E2 · 76.165–80.129 | 2020年5月，何鸿燊去世，98岁。 | Pull-back tail, then a drift of 1.00 → 1.02 | **STOP 76.165: the lamp goes out.** The filament stays a dull ember and fades over 1.2 s, and the room falls to moonlight (mean ≥ 40).<br>**His chair is empty**, pushed back from the desk; the horse is not on the desk (it was given away).<br>Living motion through the silence: the curtain breathes, the ember fades, the star twinkles. Never a frozen frame. | Stamp 「2020.5.26 · 香港」 / 「何鸿燊去世」 |
| 25 | E3 · 80.129–82.959 | 他[没等到]，它回家的那天。 | **80.20–83.00** push into the star in the window (960,540,1.0) → (1215,320,2.0), ≤ 22 px/f | The star grows in the window; its glow warms from white toward copper over the push. | as 24 |

**OUT → S09 at 82.68–83.30 · IRIS from the star (mode 5, pt = the star, soft 0.08, the edge hidden in its bloom), type F (2/2).** The star's glow opens onto the copper glow leaking through the slats of a crate in a van.
- **Motivation:** what he did not wait for is already on its way.

### S09 · ROAD (82.96 – 87.17)

| # | id · in–out | Line | Camera | Acting beat | HUD |
|---|---|---|---|---|---|
| 26 | E4 · 82.959–87.17 | 同年12月1日， | Tracks with the van: a locked side-on follow. The parallax planes move (near trees ≤ 24 px/f, far line ≤ 4 px/f); 86.6–87.17 push 1.00 → 1.12 to the van's rear | The van drives **LEFT** (toward home; the only long leftward travel in the film). Night turns to blue hour (sky grade over 4 s). Copper light leaks from the crate slats; headlight cones run ahead.<br>**Pickup 85.223 (b148):** the headlights flare and the gate of the 圆明园 enters frame left.<br>**b151 (86.921):** the van stops; its rear doors crack open, a vertical slit of copper. | Stamp 「2020.12.1 · 北京」 / 「运回圆明园」 · counter hidden |

**OUT → S10 at 87.17 · HARD CUT ON THE DROP, light-matched (mode 1), type K (1/1).** The van's copper slit cuts to the 正觉寺 doors swinging open in copper light, the slit and the doorway's light on the same vertical.
- **Motivation:** the hardest drop is the arrival (rubric: cuts only on structural hits). The copper light is the continuity. No flash.

### S10 · COURT, 正觉寺 (87.17 – 96.00)

| # | id · in–out | Line | Camera | Acting beat | HUD |
|---|---|---|---|---|---|
| 27 | R1 · 87.17–89.469 | 它回到了圆明园。 | **87.17–89.40** drop push (975,560,1.00) → (975,580,1.12), ≤ 4 px/f | **87.17:** the 隔扇 doors swing inward (3D hinged planes, 0.7 s, easeOut). Two staff push the leaves home (`STAFF45` rig, elbow ≤ 70°, both soles on the floor; `staff_check` PASS).<br>The horse on its black marble block inside, lit copper; the spill runs down the steps to the lens and lights the eaves and the pines' needle edges (`v7_r1_drop.js`). | **Counter returns: 「回园 1/12」 punches in centred (≥ 120 px) at 87.17**, settles to the corner by 88.3 · stamp 「2020.12.1 · 圆明园」 / 「正觉寺 · 文殊亭」 · chip 当代 |
| 28 | R2 · 89.469–92.016 | 它离开了[160年]。 | **89.40–91.80** push to the threshold 1.12 → 1.45, ≤ 7 px/f | The staff step aside out of the light; the horse's face takes the key. | **b156 (89.752):** stamp line 1 rolls 「1860 → 2020」 (odometer 0.4 s), line 2 「正觉寺 · 文殊亭」 |
| 29 | R3 · 92.016–95.978 | 它住进园里唯一没烧掉的古建筑。 | **91.73–93.60** crane up over the eaves (975,600,1.45) → (960,380,1.0), ≤ 17 px/f; **95.13–96.00** push toward the lit doorway (960,380,1.0) → (975,520,1.25), ≤ 20 px/f | The wide: the 文殊亭 intact under the night sky; far off, the 西洋楼 ruins in haze.<br>Beyond the court wall, **ghost smoke** (B2's smoke, desaturated) hangs and fades away over b162.5–165 (93.43–94.85), as a callback to the fire this building escaped. | Stamp 「圆明园 · 正觉寺」 / 「1860、1900 两度幸免」 (F22) |

**R2 → R3 · CRANE UP (camera move in-set), type M (1/1).** From the threshold the camera rises past the eaves to the wide.
- **Motivation:** after arriving, we see where it arrived: the only building that survived.

**OUT → S11 at 95.70–96.20 · RECT-GROW (mode 14, the doorway's screen rect), type A (2/2).** The lit doorway's rectangle grows to full frame, and inside it is the CASE close-up.
- **Motivation:** we go in through the door it went in by.

### S11 · CASE (95.98 – 123.51): the ear, the noon shadow, the question

| # | id · in–out | Line | Camera (CASE zoom scale, §3) | Acting beat | HUD |
|---|---|---|---|---|---|
| 30 | R4 · 95.978–99.091 | 细看，它是红铜一次铸成的。 | 96.2–98.2 parallax arc (x 900 → 1020, zoom 2.65 → 2.8), ≤ 7 px/f | The horse on its black block against the paper lattice, raking copper key from the upper left.<br>**b168 (96.544): one highlight runs over the whole surface without a break**: muzzle → brow → poll → crest → down the mane → the neck cut (1.6 s), so one casting with no seam reads. The highlight is a moving clip band over the hero's lit planes.<br>A flat drawing can't turn, so the light travels instead of the head. | **Counter hidden R4–R6** (macro; it would sit on the eye) · stamp 「圆明园 · 正觉寺」 / 「失蜡法 · 一次铸成」 (F5) · chip 当代 |
| 31 | R5 · 99.091–101.921 | 只有一只耳朵，是卷的。 | **98.24–100.60** push onto the ears (zoom 2.8 → 6.0, centre to the ears), ≤ 23 px/f | **The approved R5 frame (`style/v7/v7_r5_ear.png`):** the near ear thick, its tip folded down over its own cup; the far ear straight beside it.<br>**b174.5 (100.223):** a narrow warm key band sweeps across the folded tip (0.5 s). The light does the pointing: **no ring, no spiral, no dot**. | Stamp line 2 「马首 · 近处这只耳朵」 |
| 32 | R6 · 101.921–105.318 | 研究的人说：它这一路被撞过。 | **102.0–104.4** creep onto the fold (zoom 6.0 → 6.4), ≤ 5 px/f | **b179 (102.771): the light trembles once.** The key dips 25 % for 2 frames and recovers with a 1 px jolt of the ear layer only, like a knock heard, not shown. No dents are drawn. | Stamp line 2 → 「研究者观察」 (F6: an observation) |
| 33 | K1 · 105.318–108.997 | 正午12点，它们本该[一起喷水]。 | **104.47–108.40** pull-back (6.4 → 1.4), log-zoom smooth, ≤ 22 px/f | As the camera pulls back, the lattice behind the horse comes into view, and on it **the horse's own light throws the noon fountain as a shadow-play**: the twelve seated statues in flat shadow `#24140C` on two receding rows (the POOL layout, simplified).<br>**Phrase 105.601 (b184): the twelve shadow arcs fire together** (the horse's arc warm, the rest dark). | Counter returns 「回园 1/12」 at 105.60 · stamp 「12:00 · 正午」 / 「记忆里的水力钟」 (never 今天) |
| 34 | K2 · 108.997–111.261 | 现在，还差[十一个]。 | Hold 1.4; drift +2 % | **From b190 (108.997 → 110.55):** the shadow arcs go out **one per quarter-beat**, eleven of them, leaving the horse's.<br>The eleven shadow heads fade off their seats, leaving eleven empty seat shadows.<br>**b192 (110.13):** six seats get small tags 「保利」 ×4 (牛 虎 猴 猪) and 「国博」 ×2 (鼠 兔), 40 px with a halo. | Row 1 「回国 7/12」 `rrrrddydrddr` appears on 108.997; row 2 「回园 1/12」 · stamp unchanged |
| 35 | K3 · 111.261–114.091 | 其中五个，至今[没回中国]。 | Hold | **One per half-beat from b194.5 (111.544 → 112.676):** 龙 蛇 羊 鸡 狗 seat shadows turn into dashed outlines (the dashes draw on, 0.2 s each). The counter dots switch to `d` in step. | as 34 |
| 36 | K4 · 114.091–117.488 | 法国还拍出过一个疑似龙首， | **114.10–116.00** push into the dragon's dashed outline (1.4 → 2.1), ≤ 23 px/f | The dragon outline flickers twice (b200, b201).<br>Inside it, a **tiny lit shadow-saleroom** assembles: a rostrum, an auctioneer and two seated bidders, all in shadow.<br>**b202 (115.789): its gavel strikes.** The dragon's dot flickers twice in the counter, then holds `d`. | Stamp 「2018.12.17 · 法国」 / 「疑似龙首 · 240万欧元」 (F26) |
| 37 | K5 · 117.488–119.186 | 真假，说不清。 | Hold; the saleroom fades out (117.5–117.9) | **b205 (117.488):** the dragon outline holds **half-drawn** (its dashes stop half way round), and a 「?」 (96 px, ivory) settles in it. | Stamp line 2 → 「真伪仍存疑」 |
| 38 | Q · 119.186–123.506 | 五个要是上拍，该不该[花钱买回来]？ | **118.60–120.40** pull-back (2.1 → 1.0), ≤ 24 px/f | **Bar 52 (119.186): the seat shadows morph into the clock dial** (`v7_q_end.js`): 12 points on an ellipse around the horse, 7 solid (6 ivory + the horse itself at six o'clock), 5 dashed. The ? fades in the dragon's place.<br>The horse alone on its plinth, glowing; the lattice otherwise empty. | Row 1 「回国 7/12」 + row 2 「回园 1/12」 · stamp 「圆明园 · 正觉寺」 / 「还差五个没回中国」 |

**R6 → K1 · PULL-BACK + LIGHT EVENT (camera reverse + the shadow-play lighting on the phrase), type O (1/1).**
- **Motivation:** the hurt ear remembers the fountain. The horse's own light projects its memory.

**OUT → END at 123.506 · the end card forms over the dimmed last shot, type P (1/1).**

### S12 · END CARD (123.506 – 128.0), 4.49 s

| t | What |
|---|---|
| 123.506–123.90 | The last shot (CASE, the dial) dims to ~30 % (exposure ramp, no black). Its living motion continues: the horse's glow breathes. The block and the seal hide. |
| 123.506–123.85 | **Q slides from its subtitle position into the card's question slot** (centred, top 350, 72 px, 「花钱买回来」 on the copper tag, ？ pulled back ½ em). It is not retyped. |
| **123.714 (bar 54)** | **The J seal is pressed in** (`jseal.png`, 110 px, top centre at y 120, −6°): scale 1.15 → 1.0 over 0.18 s plus a small settle. |
| 123.80 | The title on two lines, gold `#f6cf78`, Noto Serif CJK SC Black: 「七个回国」 over 「一个回家」 (54 px, letter-spacing .08em, top 220 / 282), fading in over 0.25 s. |
| 124.10 | The pill 「关注 Juno · 一起看懂世界」 (36 px, 2 px gold border, radius 40, top 560). |
| 124.20 | **The sources line** (bottom 40, 21 px, 55 % white): 资料：中新网 · 人民日报海外版 · 新京报 · 新华社 · 澎湃新闻 · 环球人物 · 中央社 · 都市快报 · China Daily · AP · NYRB · Sotheby's |
| 125.95 → 128.0 | The music fades over the last bar; the picture holds the card to the last frame (no dip to black). |

Engine change: `endCard()` takes a two-line title and the jseal image (it is hard-coded to 「假如你是清明上河图」 and a gold J ring). The 「评论区聊聊」 row is dropped so the card reads in 4.5 s.

---

## 5. Transitions (scene hand-overs)

| Type | Mode | Where (time) | Uses |
|---|---|---|---|
| A rect-grow (pane) | 14 (new) | title → N1 (11.07); R3 → R4 (95.70) | 2 |
| B object match-cut | 1 (aligned) | N3 → A1 pig → pig (17.582); E1 → E2 brass plaque → lamp base (75.601) | 2 |
| C foreground band | 6 | A2 → B1 soldier column (24.37); P3 → P4 unveiling cloth (67.96) | 2 |
| D ink-bleed through smoke | 3 | B2 → D1 (29.90) | 1 |
| E light-edged wipe | 12 | D3 → D4 lamp swing (37.96); D9 → P1 column light → Paris windows (56.70) | 2 |
| F iris on a light | 5 | D6 → D7 spot → desk lamp (47.87); E3 → E4 star → crate glow (82.68) | 2 |
| G morph | in-set | D8 → D9 card → column (53.525) | 1 |
| I held-prop wipe | 2 | P2 → P3 board stays, room changes (64.28) | 1 |
| J lateral track | camera | P4 → E1 (71.07) | 1 |
| K hard cut on the drop, light-matched | 1 | E4 → R1 (87.17) | 1 |
| M crane up | camera | R2 → R3 (91.73) | 1 |
| O pull-back + light event | camera | R6 → K1 (104.47) | 1 |
| P end card forms | HUD | Q → END (123.506) | 1 |

- No type is used more than twice.
- There are no crossfades (mode 7), no whips (mode 10), no flashes (`grade.flash` 0) and no dips to black.
- Every hand-over is a match on shape, light or motion.
- Outgoing labels and tags leave before each move starts.

**Cadence, 11–42 s (a new image every 2–4 s):**

| Time | New image |
|---|---|
| 11.07 | Hangzhou glass hall |
| 13.0 | museum + queue |
| 14.75 | the queue track |
| 16.2 | push to the pig |
| 17.58 | the pig at noon |
| 19.5 | the whole 海晏堂 |
| 20.13 | the trickles and the clock hop |
| 21.83 | all twelve fire |
| 24.37 | the soldier band → dusk |
| 25.5 | soldiers on the flagstones |
| 27.2 | push through the embers |
| 28.62 | fire + the lift |
| 29.5 | smoke |
| 30.3 | London ceiling |
| 31.45 | the horse appears in the light |
| 33.15 | paddles |
| 35.41 | strike + flip |
| 38.0 | lamp swing → 2007 |
| 42.2 | the untouched gavel close |

The largest gap is 3.9 s (38.0 → 41.9, covered by the slow push).

## 6. Counter, stamp and chip at a glance

| Span | Chip | Counter | Stamp line 1 |
|---|---|---|---|
| 0–9.05 | hidden | 回来了 ?/12 → 回国 7/12 (+ 回园 1/12 from 5.978) | 圆明园 · 十二兽首 |
| 9.05–11.36 title | hidden | hidden | hidden |
| 11.36–17.58 | 当代 | hidden | 2026 · 杭州 |
| 17.58–30.0 | 清 | 在家 12 → 11 (28.903) → 0 (29.47) | 乾隆年间 / 12:00 / 1860.10 / 1860.10.18 |
| 30.0–87.17 | 当代 | hidden | 1989 · 伦敦 → … → 2020.12.1 · 北京 |
| 87.17–95.98 | 当代 | 回园 1/12 | 2020.12.1 · 圆明园 → 1860 → 2020 → 圆明园 · 正觉寺 |
| 95.98–105.60 | 当代 | hidden (macro) | 圆明园 · 正觉寺 |
| 105.60–123.5 | 当代 | 回园 1/12; + 回国 7/12 from 108.997; five `d` from 111.544 | 12:00 · 正午 → 2018.12.17 · 法国 → 圆明园 · 正觉寺 |
| END | hidden | hidden | hidden |

---

## 7. Sound (for the editor; music + designed sound)

All sound effects are optional; the owner's question about a gavel SFX is still open. Mix them under the music, and keep a hit only where the picture has one.

| Time | Sound |
|---|---|
| 1.45 | rim-light shimmer |
| 4.0–5.7 | seven soft chimes (one per light) |
| 21.83 | water rush |
| 24.4 | boots |
| 28.62 | fire whoomph |
| 31.45 | lamp click |
| 35.41 | gavel knock |
| 42.2 | lamp hum |
| 45.6 | board flip |
| 46.2–47.3 | lamp clicks |
| 60.32 / 60.88 | two knocks |
| 65.41 | stamp thud |
| 76.165 | lamp click into the silence |
| 85.2 | engine |
| 87.17 | door creak under the drop |
| 102.77 | a muffled knock |
| 105.6 | distant water |
| 115.79 | tiny knock |

## 8. Open points for the producer / director

1. **Title hold.** QUALITY_BAR asks ≥ 2.5 s. Here the title runs 9.05 → 11.32 (2.3 s), set by `plan45v7s.py`'s TITLE window.
   - Proposal: start N1 on the next half-beat, **11.638**. The title then holds 2.55 s, and N1 keeps 3.11 s, above its 3.03 s minimum.
   - This is a one-number change in `plan45v7s.py` (`TITLE = (9.05, 11.60)`). The board's N1 camera already starts at 11.65.
2. **R5 counter.** R5 now hides the counter (R4–R6, the macro). In the OK'd frame it sat on the horse's eye.
3. **R4 「细看…一次铸成」:** the script's "head turns slowly" became a travelling highlight, because a flat drawing can't turn.
4. **F10:** the looter is a uniform silhouette with no insignia, and nothing names who took it.
5. **A1:** the script's four-head match became a one-head match (the pig), because the four aren't adjacent in the 八 layout.

## 9. Changes made with this board (the ear)

- **`style/v4/src/hero3.js`:** the rolled near ear was redrawn (r6).
  - The old roll (a round top, a pointed tip and a specular dot) read as a small bird sitting on the head.
  - Now it is one thick leaf in the head's own patina (`mid`). The top third is folded forward and down over its own cup like a dog-ear: the flap is in `mid2`, its cast shadow in `dark`, and the bend is one thin line.
  - There is no highlight dot and no spiral. The base sits into the poll with a soft root shadow.
  - `o.earDetail` (CASE macro only) adds the lit upper facet of the flap, the bend as a lit band and the flap's free edge. Dents were tried and dropped, because two dark flats read as a face.
- **`style/v4/src/v7_r5_ear.js`:** a proper close-up (hero s 2.6, both ears filling the upper right, the eye low left) with no ring, no spiral and no dot cover. The counter is hidden in this shot.
- **Re-rendered** (`style/v7/`): `v7_h1_hook`, `v7_h3_answer`, `v7_t_title`, `v7_r5_ear`, plus `ear_check400.png` (the four at 400 px) and `ear_check400_zoom.png` (the hook and title heads at 400 px, ×3). The sheet and strip were remade (`sheet_v7.png`, `strip400_v7.png`).
- **Every other shot that draws the hero with `curl: 1`** picks up the new ear automatically when it is rebuilt.

## 10. New assets to draw

**Hero / brothers**
1. `earDetail` checks at the CASE raster (4096 px): the flap reads in R5 and R6.

**RING**

2. The `?` digit roll.
3. Light-up tweens (dark → ivory, horse → copper flare), on half-beats.
4. Lift-off + ivory trails + the six flying into the two vitrines.
5. Vitrine slide-in / slide-out (layers at z +1).
6. The returning 保利 case at 10.79.

**Title**

7. Slam (scale + damped jolt on the title only).
8. The seal pressed at the end of the title.
9. Ring defocus via `under` / `blurUnder`.

**MUSEUM-杭州**

10. The queue animation: two depth rows, a half-step ripple every two beats, phone torches.
11. Switchback stanchions + rope.
12. The 3200 px set.
13. The pig case framed for the match.

**POOL**

14. Twelve mouth trickles.
15. The water-clock hop (one tall arc moving seat to seat).
16. Twelve arcs fire / fall curves (`K.arc` per-arc on/off) + splash rings + droplet motes.
17. The RED-DUSK grade preset.
18. The marching kepi column on the rig, and its near-lens band layer.
19. The fire flare (noise-driven tongues, not a comb) + embers + smoke roll.
20. The lift (both hands on the neck cut, `contact_check`) and the carry walk out right.

**SALE**

21. Paddle raises per beat.
22. The gavel strike rig (lift, snap, block contact).
23. The board flip 「?」 → 「三四十万美元」 (3D card).
24. The hanging-lamp pendulum + its light pool (drives the mode 12 edge).
25. 「撤拍」 board flip.
26. Lamps out row by row.
27. The spot narrowing.

**DESK / PRICE**

28. Ho seated signing (pen contact, a writing loop).
29. Brass lamp on → off with the filament ember.
30. Moonlight state, curtain breath, the window star.
31. Price card rise 「6910万港元」.
32. Card → light-column morph.
33. Short column 「三四十万美元」, bracket 「二十多倍」, note 「≈ 884万美元」.

**PARIS / PRESS**

34. Rostrum + auctioneer (from `saleLondon`'s lectern and figure).
35. Clerks' handset loops + a raised hand + hang-up.
36. The placard slide 「两件合计 / 3149万欧元」.
37. Five day/night window cycles + the stamp ticker.
38. The screen-locked board layer (both sides).
39. The speaker's gesture.
40. **The 「未付款」 stamp press** (scale, settle, board jolt).

**HALL**

41. The 国家博物馆 hall set (far wall, windows, ceiling grid, two plinths 2400 px apart, stanchions).
42. The cloth pull-off (3–4 keyed silhouette shapes, not a cloth sim) + the cloth band texture for mode 6.
43. Staff lowering the cloth (contacts).
44. The brass plaque 「马首铜像 · 何鸿燊先生捐赠」 with a travelling glint.

**ROAD**

45. The van (cab + box, slats leaking copper, wheel cards, headlight cones, rear doors cracking open).
46. 4-plane night → blue-hour parallax.
47. **The 圆明园 gate silhouette** (researcher: the east gate's form).

**COURT**

48. The tall plate for the crane (roof, sky).
49. 西洋楼 ruins in haze (from ref45 / the 海晏堂 model).
50. Ghost smoke beyond the wall.

**CASE**

51. The travelling highlight (a clip band over the lit planes).
52. The key band sweeping the flap; the light tremble.
53. **Shadow-play layer:** twelve seat shadows + twelve shadow arcs, fired together, then out one per quarter-beat.
54. Seat tags 保利 / 国博.
55. Dashed-seat draw-on.
56. The tiny shadow saleroom inside the dragon + its strike.
57. The half-drawn outline + 「?」.
58. The seat-shadows → clock-dial morph.

**HUD**

59. The two-row counter with label switch, digit roll, punch-in and `d` / `r` / `y` states (CSS from `K.CSS4`).
60. The stamp ticker and odometer roll (1860 → 2020).
61. End card v7 (§4 S12).

**Engine**

62. **mode 14 rect-grow** (B inside a rect growing from `pt` / `dir` to full frame, with a thin glass-edge sheen).
63. A log-zoom `cam()` helper with a per-frame speed assert (≤ 25 px/f).
64. Point `film.ts` at `lines_v7s.json` (it still imports `lines_bars.json`).
65. Add the missing `furniture.ts` (imported by `film.ts`, not in `film/src`).
66. `endCard()` parameters (§4 S12).

## 11. Build order

**Three proof scenes first.** Each gets stills per second + a 400 px strip + the camera-speed assert + `edge_scan` + the contact / pose checks, then goes to the director at gate 3 before anything else is built.
1. **The hook, 0–11.6 s** (S01 + the rect-grow into N1's first frame). This proves the RING animation, the counter / HUD, the title slam over the push, mode 14, and the new ear at hook size. **Frame 0 must be striking alone (luma ≥ 65)** and the subtitle is on it.
2. **The London guess and hammer, 29.9–38.6 s** (the ink-bleed in, D1–D3, the lamp swing out). This proves the SALE family: seated crowd, paddles per beat, the strike exactly on bar 15, the board flip, and the light-edged wipe.
3. **The drop, 85.2–92.0 s** (E4's last two seconds → the cut on 87.17 → R1–R2). This proves the van and the copper slit, the 3D hinged doors with the staff rig (`staff_check` PASS), the counter punch-in, and the push.

**Then, in film order by set:**
4. POOL A1–B2. This is the riskiest remaining build: 12 arcs and the fire + lift.
5. MUSEUM-杭州 N1–N3 (the queue).
6. SALE 2007 D4–D6.
7. DESK / PRICE D7–D9.
8. PARIS / PRESS P1–P3.
9. HALL P4–E1.
10. DESK night E2–E3.
11. ROAD E4 (the rest).
12. COURT R3.
13. CASE R4–Q (the shadow-play).
14. END.

Render to `/dev/shm` (the disk has about 1.4 GB free), and keep frames and mp4s out of the repo.
