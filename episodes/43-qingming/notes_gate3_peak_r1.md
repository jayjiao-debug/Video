# Gate 3 notes: 假如你是清明上河图, scenes 27–29 (the store · THE PEAK · the 1950s day crest), r1 — verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): script n/a · **visual 3** · **info 3** · **edit 3** · **motion 4** · sound n/a
Overall 3: the owner would post it, but not without notes.

**What works.** The colour painting from 125.30 to 128.24 is the best image in the film so far. The store is a real, warm room. The burst lands on 123.40, and 「才是你」 lands on b54.

**What the owner would send back:**
1. In scene 29, the two staff read as running a relay with a glowing baton, on the homecoming beat (still 5).
2. The climax washes out to near-white:
   - the burst strip sits at 93–99 % luma;
   - the relief frame has a mean of 187, with a +65 lift in 0.3 s on the loudest hit.
3. The bridge match is a crossfade between two different arches. Only the apexes agree.

All notes go to the animator. None is a taste call.

**What I read:**
- the Director section, the rubric, and all owner-notes rows;
- brief.md;
- storyboard r3: Look and luma, Engine, rows 26–30, the handover table and transitions 26–29;
- lines_bars.json (V2–D1) and music.md;
- s_peak.ts in full, plus core.ts (Stage, `setCam` dolly, compositor, `corners`), hud.ts and KIT.md.

**Stills:**
- I opened all 19 stills in g3p, sheet480.jpg, and 200–300 % crops of the feet, hands, copies, strip, gate and relief.
- contact_114-134.txt: **PASS, 291 frames**. All declared hands are at 0.0. Staff1's two hands share the name `roll end` and are both covered. Leg-length IK is within 2.5 px.

**Not re-rendered.** Two other Chromium renders were running with 2.4 GB of RAM free and no swap, so a third risked killing a builder's job. What I couldn't see is listed under "Send for r2".

## Measurements against the board

Luma is Rec.709 on sRGB (0–255). Contrast is WCAG, glyph vs. a ring 6–16 px around it.

| Check | Target | Measured | |
|---|---|---|---|
| Store, lamp on (114.8–123.3) | indoor ≥ 45 | **55–57** | ✓ |
| Store subtitles / stamp / chip | ≥ 4.5 : 1 | 12 : 1 / 11 : 1 / 14 : 1. Red key words 3.0–3.2 by luma; they read by hue. | ✓ |
| Store: brightest area | the lamp pool, you faint until b53.5 | The lamp pool or the open copy panels (185–199) until 122.6, then the battered roll under the lamp (202 at 123.30) | ✓ (but see B6) |
| Burst glow, 123.6–124.4 | ≤ 85 % (217), never white | Strip paper p50 **238**, p90 **252**. 46 % of the strip is > 240. Median RGB **253/238/195** (R clipped). | ✗ (B2a) |
| Peak in colour, 124.8–128.24 | inserts 120–160 | 117–130. Subtitles 10–11 : 1 on the lamplight bands. | ✓ |
| Relief, b56 → b57 (129.30) | 120–160, p95 ≤ 217, no flash | Mean **187**, p50 200, p95 **227**, top band 208. From 128.24 (116) the frame lifts ≈ 65 in the 0.3 s `corners` ramp, on the loudest hit. | ✗ (B2b) |
| Relief reads as a diorama | no floating cards, ghosts, shadows | At 129.30: ink ghosts under lifted parts (the oxen, the bank edge); soft blue-grey shadows right of the boats; nothing floats; no "game" look. Parting in motion not seen. | ✓ still · motion unverified |
| Bridge match (130.45, k ≈ 0.3) | same curve, same place | Only the apexes agree (≈ y 440). The painted arch's feet are at y ≈ 870 (x 60 / 1590). The real arch at those x is at y ≈ 690 / 560 and runs off both edges; its deck band crosses the painted facade. Mean 176 → 131 and cream → teal within 0.18 s. | ✗ (B3) |
| Day crest (130.6–133.4) | day 110–150 | **127–133** | ✓ |
| Day: you lead | brightest area = the roll | 61-px smoothed: roll 185 vs. water/horizon 178 | ✓ (just) |
| Day: R1 subtitle | ivory ≥ 4.5 : 1 (top 340 px ≤ `#5E7A82` ≈ 117) | **3.95 : 1**, ring 120–125; top-340 mean 126–128 | ✗ (B5) |
| Day: red 故宫 | readable | **1.2 : 1 by luma** (red ≈ 109 on sky ≈ 117) | ✗ (B5) |
| Day: counter zone | dark (y 880–1040) | 130.6 / 131.2: counter **3.4 : 1**, tally label **2.8–3.4 : 1** over bright water. 132.2 / 133.4: fine (17 : 1) over the dark roofs. | ✗ (B5) |
| Hands / feet | contact, nothing floats | PASS. Zoomed: staff feet on the deck behind the near railing (132.20, 133.40); hands on the switch, rollers, battered roll and silk edge. | ✓ |
| Lines / stamps / chip | lines_bars, board | Y1 114.657 · Y2 117.487 · Y3 120.884 · Y4 123.714 (red 才是你) · R1 130.506. Stamps and chip as the board. Tally 4/4 → 进⑤ by 132.2 → all red by 133.4. HUD hidden b56 → b57. | ✓ |
| Text over text | never | 114.80: Y1 types over V2/V3 at ≈ 30 % | ✗ (B4) |

## Notes (ranked)

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| B1 | **High** | 29, 130.51 → 133.90 (still 5) | **The homecoming reads as a relay race.** At 480 px, two men in caps stride in step across the bridge, the front one holding a glowing tube out ahead of him like a baton. Three causes:<br>(a) **Lockstep.** Staff2 is `walkFor(u + 0.5)`. Half a cycle is the other leg forward, and in a one-tone profile that is the same silhouette. Every still shows the same leg phase.<br>(b) **Long, high-kneed strides.** At 130.60 both front thighs are near horizontal, a lunge.<br>(c) **The roll is held out in front.** `rc = x − 0.16 H`, so the whole 134-px roll is ahead of the torso.<br>Do:<br>(a) offset staff2's phase by ≈ 0.25–0.3 of a cycle, never 0 or 0.5;<br>(b) a measured walk: stride ≈ 0.7× the current, with the swing thigh no more than ~35° from vertical, slope IK included. Keep 1 step per beat or slower;<br>(c) cradle the roll at the chest: centre ≈ x − 0.06 H, so about half of it overlaps the torso. Both forearms go under it, the near arm is drawn over it (`drawCarriedRoll`'s body → roll → arm order), and the axis stays level. Keep both hand contacts.<br>Keep: walking left (进), the second man a step behind, feet on the deck behind the near railing, and the roll as the brightest area.<br>Pass: a 480-px strip of 130.6 → 133.4 every 0.4 s reads as "carrying something precious", and the two silhouettes are never identical.<br>Tell scene 10's builder: same carry, same three fixes. | animator | 77 / 98 (an action reads as that action in one glance), 74 |
| B2 | **High** | 27–28, 123.40 → 124.4 and b56 → b57 | **The climax goes near-white twice.** The board caps the glow at ≤ 85 % (never white) and allows no flash.<br>(a) **The burst strip (123.6–124.4).** Its paper is at p50 238 / p90 252, R is clipped, and 46 % of the strip is above 240. While 「才是你」 is read (124.30), the painting reads as a light tube with faint linework.<br>Do: cap the strip's own surface at ≤ 217 (its emissive and the store exposure of 1.06 at the burst), and put the extra light into the bloom around it, so the 虹桥 stays drawn on the strip.<br>(b) **The relief (b56 → b57).** At the hit, `corners` goes 1 → 0 in 0.3 s and the HUD goes off. The whole frame lifts from mean 116 to 187 (p95 227, top band 208), and the far layers wash to cream. A global lift on the loudest hit reads as a flash-up, and the climax still looks paler and flatter than 128.24.<br>Do: replace the `corners` ramp with a warm radial falloff centred on the bridge layer (warm-dark vigCol, ≈ 0.5), so the light pools on the bridge and the far and near layers fall off.<br>Targets for b56 → b57: mean 120–160, p95 ≤ 217, and a mean change ≤ ≈ 15 over the first 0.3 s after b56.<br>If the layer shadows fade at the lower key, strengthen them: they are the diorama cue.<br>**Ruling: keep the relief, not the fallback.** At 129.30 nothing floats, the ghosts and shadows are there, and there is no "unfinished game" look.<br>Pass: the numbers above on 124.30, 128.54 and 129.30, plus a 480-px strip of 128.24 → 130.40 every 0.2 s, so I can judge the parting in motion. | animator | 88 (the most spectacular frame), 81 (never blow out the hero), 54 / board (no flash), rubric visual-1 |
| B3 | **Med-High** | 28 → 29, b56.75 → b57 + 0.06 | **The bridge match doesn't land, so it reads as a 0.18-s crossfade.** At 130.45 the real deck band crosses the painted arch's facade instead of lying on it; only the apexes agree.<br>The painted arch is a 3/4 view, with its feet at y ≈ 870 (x 60 / 1590). The real arch is side-on and flatter: at those x it is at y ≈ 690 / 560, and it runs off both frame edges. On top of that, mean 176 → 131 and cream → teal happen inside the dissolve.<br>Do:<br>(a) Make the curves coincide. Choose the crane's end framing and/or `crestMatch` so the real deck line lies on the painted facade line within ≈ 20 px at the apex and at both shoulders (≈ x 400 and x 1500). If a 3/4 curve can't meet a side-on arch, scale the real crest in y about its deck line during the dissolve frames only.<br>(b) Pre-match the tone: over b56.75 → b57, bring the painting toward the day crest's mean and hue (after B2 it sits near 140 anyway), so the dissolve carries the shape and not a brightness drop.<br>Pass: 130.42 / 130.48 / 130.54 at 480 show one arch. | animator | 15 / 86 (transitions motivated by a matching shape), 33 |
| B4 | **Med** (whole film) | engine (hud.ts), e.g. 114.66 → 114.86 and 120.88 → 121.08 | **Text over text at every line-1 change.** A line fades out over 0.2 s *after* its end. The next line fades in from its start − 0.06 in the same row. So for ≈ 6 frames the new line types over the old one: at 114.80, 几年后，沈 sits on 伪满覆灭… / 下落不明 at ≈ 30 %. This happens every time a new pair replaces an old one, all film long.<br>Do: when the next line takes the same row, finish the outgoing fade by the next line's start (fade over end − 0.15 → end). Otherwise keep the 0.2-s tail.<br>Pass: no frame in which two lines' glyphs overlap. | animator | rubric visual-1 ("text over text"), 86 (nothing from A still fading once B is on) |
| B5 | **Med** | 29 (crest.ts day sky; shared by I2 and E5) | **The day crest's furniture is under contrast.**<br>• R1 ivory **3.95 : 1** on the sky. The top-340 mean is 126–128, against the board's ≤ `#5E7A82` ≈ 117, which gives ≥ 4.5 : 1.<br>• Red 故宫 is **1.2 : 1 by luma**: for red-green colour-blind viewers it disappears into the sky.<br>• From 130.6 to 131.5 the counter (3.4 : 1) and the tally label (2.8 : 1) sit over the bright water. The counter zone must be dark.<br>Do:<br>(a) Bring the day sky's top band down to the board's value, or slightly deeper at the zenith.<br>(b) Keep x 120–1100, y 880–1040 dark for the whole of 29: the near-bank silhouette under it from the first frame, or a warm low vignette.<br>Pass:<br>• R1 ivory ≥ 4.5 : 1 and red ≥ 2 : 1 by luma;<br>• counter and tally ≥ 4.5 : 1 on 130.6 and 131.2;<br>• day mean still 110–150 and you still the brightest area. | animator | 62 / 87 (check legibility on the brightest frames), 69 (labels readable), 76 |
| B6 | **Med** | 27, b50.5 → b53.5 (114.9 → 122.6) | **The battered roll isn't battered.** On the reject pile it is a clean ivory roll with blue ends and a glow (118.70: the cleanest and brightest roll in frame). Its four small notches vanish at 480. The tan 真迹 copies look duller than it does, which inverts the line 「混在残次品里的那一卷」, and the 123.40 reveal is answered before Y3.<br>Do: give it the board's torn edges at a size that reads at 480: a frayed outline, a torn flap, darker stained wrapping in the rejects' dull tone. Let the glow seep faintly from a tear, no brighter than the copies until b53.5 (board: "a faint glow deep in the heap").<br>Keep its place on top of the pile, within reach, and the b53.5 draw onto the table. | animator | 11 (the picture matches the plain reading of the line), 125 |
| B7 | Low (scene 30's `in`) | 29 → 30, b58.25 → b58.5 | **The way into the palace.** At 133.40 the 午门 centre passage is a faded tan arch under the far-bank haze. The `gateGlow` layer sits at z −2590, behind the haze at −2000, so there is no warm light and no visible far opening. Also, from b58.25 the camera leaves you on the bridge and pushes at an empty gate.<br>Do:<br>(a) Put the passage's glow in front of the haze: warm, ≥ +30 luma over the wall, far opening visible.<br>(b) Keep the motive "you are carried in": either your glow stays in frame during the push, or scene 30's iris opens from your glow or from the passage's lit far opening once you are in it.<br>The iris (mode 5) in place of "emerge through the painted gate" is accepted on those terms. | animator | 86, board ("gate passages warm-lit, far opening visible") |
| B8 | Low | 27, 117.49 → 120.88 (Y2) | 「“你”。」 leaves a ≈ 40-px gap between ” and 。. These are two full-width marks, each with half an em of blank.<br>Do: in hud.ts, pull the second of two consecutive full-width punctuation marks back by ½ em, the same mechanism as the ？ rule.<br>Pass: gap ≤ 10 px. | animator | 89 / 97 (full-width punctuation spacing) |
| B9 | Low | 27 → 28, DIVE_Z (124.87 → 124.97) | **The dive seam.** At DIVE_Z the store frame:<br>• is softer;<br>• carries the lamp pool's warm smear in the lower left (124.80);<br>• runs at exposure 1.06 / bloom 1.25 against the peak's 0.93 / 0.8.<br>Do: over the last 0.2 s of the dive, match the store's grade to the peak's first frame and fade the lamp pool out by DIVE_Z.<br>Pass: 124.86 / 124.92 / 124.98 within 10 % of each other's mean, bridge apex within 10 px. | animator | 86 |

## Rulings on the producer's decisions

- **Researcher at the left end of his own table** (the Store's table replaced). Accepted:
  - the copies, the cord switch and the crate are all within reach;
  - the profile is kept;
  - the composition works (him on the left, the lamp right, the table receding).
- **Copies open in place, a hand's width each, on b51.25 / 51.5 / 51.75.** Accepted. One action per beat still carries 好几卷, and the overlap keeps them uncountable.
- **Inline cord switch.** Accepted. The cord is invisible at 480, but with his hand at the table edge on b50, the lamp coming on reads as "he switched it on". No action.
- **The dive** (the strip rising from foreshortened to full height while the camera pushes in, then a 0.1-s mode-7 seam between matched framings). Accepted:
  - It reads as one push into the painting.
  - The board bans crossfades between *different* pictures. A seam between identical framings is a stage swap, so it is allowed here, subject to B9.
- **Colour flood at b54.5, the three sprites to b56, the relief at b56 (bridge at 0, far layers back, near layers forward, SEP 300), shadows growing, HUD hidden b56 → b57.** Accepted as built. Relief kept; fix its luma (B2).
- **Bridge match via a crest camera instead of zooming the painting.** The approach is accepted; the execution is B3. A 0.18-s dissolve between coinciding shapes is a match cut. Between non-coinciding shapes it is the crossfade the board rules out.
- **R1: one carrier with both hands, the second a step behind.** Accepted. Two men in profile can't each hold an end of a ≈ 25-cm roll. The execution is B1, and scene 10 gets the same instruction and the same fixes.
- **Scene 29 ends pushing toward the passage; scene 30's iris to come.** Accepted on B7's terms.

**Heads-up for the producer (not notes):**
- main.js was rebuilt at 22:39 and again at 22:51. The g3p stills were rendered from 22:36. Confirm they came from a bundle that already had s_peak.ts at 22:35.
- 26 → 27 (the b50 lamp reveal) is not in these stills.

**Send for r2:**
- **The B-note pass frames:**
  - 124.30, 128.54, 129.30;
  - 130.42 / 130.48 / 130.54;
  - 130.6, 131.2, 132.2, 133.4;
  - 114.80, 118.70.
- **The two 480-px strips:**
  - relief 128.24 → 130.40, every 0.2 s;
  - walk 130.6 → 133.4, every 0.4 s.
- **The 26 → 27 lamp reveal:** 114.62, 114.70, 114.76.
- **The B9 seam frames:** 124.86 / 124.92 / 124.98.
- **The checker:** `contact_check 114.6 134 15`.

## What must not change (it works)

- **The store as a set:**
  - the warm lamp pool with the green enamel shade as the scene's one colour source;
  - the wall of scroll ends;
  - mean 55–57, subtitles ≥ 10 : 1 on the wall, a dark counter zone (35).
- **The researcher's acting and contacts:**
  - switch → lap → each copy's roller → the battered roll → the silk edge, all at worst 0.0;
  - leg-length IK at 0.0.
- **The store's beat map:**
  - lamp on b50;
  - copies open b51.25 / 51.5 / 51.75;
  - 真迹 rolls grey on b53 / 53.25;
  - battered roll onto the table on b53.5;
  - the tremble, harder after 123.13.
- **The burst on 123.40:**
  - the unroll, fast then slow;
  - the 3-frame shake;
  - warm rims on every shelf, rising dust;
  - Y4 on b54 with red 才是你.
- **The dive's geometry:** the strip rises as the camera pushes, to the matched framing at DIVE_Z.
- **125.30 → 128.24, the colour painting:**
  - the mineral palette;
  - the legible crowd;
  - the cart, mast and railing sprites moving;
  - the slow drift into a picture pause before b56;
  - the lamplight bands that keep Y3/Y4 at 10–11 : 1. Keep the bands on these two-line frames.
- **The relief's build:**
  - 5 layers around the bridge at depth 0, real parallax (`setCam` dollies);
  - ink ghosts and layer shadows;
  - HUD hidden b56 → b57.
- **The day crest:**
  - walking left (进), feet on the deck behind the near railing;
  - the roll as the brightest area;
  - day mean 127–133;
  - 进⑤ on b57.5, all nine marks red by b58;
  - the R1 stamp and the 850多 chip;
  - the far-bank 午门 with no plaque.
