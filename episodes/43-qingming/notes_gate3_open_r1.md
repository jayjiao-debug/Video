# Gate 3 notes: 假如你是清明上河图, scenes 01–02 (the opening take + the title on drop 1), r1 — verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): script n/a · **visual 3** · **info 3** · **edit 4** · **motion 4** · sound n/a
Overall 3: the owner would post it, but with notes. The ones he is most likely to give are on the first 3 s (the hook line is hard to read over the painting) and on the wind-up (the light that should be "you" is a sunset).

**Bottom line.** The bones are right, and they match the board:
- the painting fills frame 0 with the hook typing on it;
- the b1 two-shot is close to the approved key frame;
- the lanterns die on time;
- the cut and slam land on 8.96 / 9.05;
- the title is a real plaque made of the film's own silk, centred to the pixel.

Three things fall short of the board's own specs, and the measurements show it:
1. Frame 0 has no lamplight falloff, so the ivory hook line sits on cream paper at 2.6–3.1 : 1.
2. In the wind-up, "your glow" does not exist: the roll is a flat tube, it dims with the world, and a sunset is the biggest light.
3. The carried roll is not held by anyone.

The title has two build artefacts: bloom-washed ink, and a moon. All notes go to the animator. None is a taste call.

**What I read:**
- the skill (Director section), the rubric, and all 133 owner-notes rows;
- brief.md;
- storyboard.md r3: Look, Engine, Build, scenes 01–02, transition 1 and the stills list;
- notes_gate2b_r2.md (build conditions 1–3);
- lines_bars.json;
- film/src: s_open.ts, core.ts (compositor, modes 0/13, grade), crest.ts, actors.ts (`rig`, `drawRoll`), hud.ts, furniture.ts, film.ts, plus draw.ts `willow()`;
- tools/contact_check.mjs;
- style/lookA_key.png and lookB_hook.png, and the gate-2b crop f0_river_mono.png.

**Stills.** I opened all five given stills and the sheet. The scratchpad folder `st43/` was wiped at 21:36 while I was reviewing (the disk is 97 % full, 1.7 GB free). So I re-rendered the same times, plus 0.5, 1.45, 2.6, 3.3, 7.2, 8.8, 9.0, 9.06 and 9.15, from the same `main.js` with SwiftShader:
- `/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/g3o/st/`.

Frame means agree with the given JPGs within 0.1, so all numbers below come from those PNGs. Luma is Rec.709 on sRGB values (0–255). Contrast is WCAG, measured on the glyph versus the paper or sky 6–16 px around it.

**Checks I ran:**
- `node tools/contact_check.mjs 0 9 15` → **PASS, 135 frames 0–9 s** (reproduced).
- Phone-size sheets at 480 px.
- Per-word subtitle contrast.
- Glow and roll positions.
- Title ink centre and ink tone.
- Surround and moon luma.
- The frame-mean sequence across the cut.

## Measurements against the brief for these stills

| Check (storyboard still 1 / 2 / 8, producer's list) | Target | Measured | |
|---|---|---|---|
| Frame 0 reads as the painting on silk | 虹桥 + boat + crowd, weave, mount | Yes. 虹桥, crowd, boats and the A-frame mast are recognisable at 480 px; the blue mount bands top and bottom say "scroll". Moving: the track is ≈ 49 px/s on screen; the cart rolls and the mast lowers between 1.45 and 2.6 | ✓ |
| Insert luma (frame 0) | 120–160, corners ≤ `#4A3B2C` (≈ 61) | **mean 192**; subtitle band 158–167; top-left corner 162 | ✗ (note 1) |
| Subtitle on frame 0 legible at 480 px | ivory reads on one polarity | 九百年 **3.1 : 1**, 人人都想 **2.7**, 你。 **2.6**, red 留住 1.55 against the paper (luma only). The same words on the sky at b1: **5.9 : 1**. At 480 px the line reads only through its thin halo, and 你。 merges with the willow linework | ✗ (note 1) |
| Stamp on frame 0 | legible | 3.6 : 1; the 「—」 vanishes at 480 px | weak (note 1) |
| Corner mark on frame 0 | visible | ink vs paper **1.37 : 1**: invisible | ✗ (note 1) |
| b1 two-shot: hands on rollers | contact PASS | PASS. Hands on the upper roller ends | ✓ |
| b1: figure scale / scroll width | ≥ 45 % / ≥ 420 px | 56 % (y 300–905) / 540 px | ✓ |
| b1: rim from you | scroll-side rims | Rims sit on the scroll-facing edges. The right figure's back edge picks up the sunset faintly: acceptable at dusk | ✓ |
| b1: dusk luma | 75–100 | **110.6** (sky top-left 98) | over, ruled below |
| b1: hero leads | brightest area = you | brightest 61-px-smoothed area = the silk (233 at 889, 484) | ✓ |
| Darkest frame 8.78–8.96 | mean ≥ 45, darkest of the opening | 86.7 / 86.5 (b1 is 110.6): darkest, but only −22 %; the sky top-left only drops 98 → 82 | weak (note 2) |
| Your glow at x ≈ 1710, y ≈ 580 for the lock | glow on the lock point | roll centre (1674, 562) at 8.80 → (1696, 576) at 8.90, moving +22 px / 0.1 s → ≈ 1709 at the cut. **The position is right.** But the roll has **no glow**: the sky right above it is 72–75 against 104 open sky, its peak drops 243 → 214 under the global exposure ramp, and the brightest smoothed area is the **sunset** (154–158 at x 1305–1518, y 610–700) | ✗ (note 2) |
| Title: ink centred | pixel measure | 假如你是 **959.0**, 清明上河图 **957.5**; band centre 959.3 (knobs at 208 / 1710.5, band y 427–732 → centre 579.5) | ✓ |
| Title: size | plaque | 清明上河图 ink 875 × 160 px (≈ 219 × 40 px at 480) | ✓ |
| Title: the film's own silk | yes | the river painting at 12 %, the weave, blue mounts, ivory knobs, the same as the b1 silk. The ink is drawn into the band canvas, so it is clipped to the band and moves with it (build condition 3 met) | ✓ |
| Title: ink crisp | authored `#2A1F17` (≈ 33) | edges sharp, but **ink median 88** (RGB 95/87/75), darkest 5 % at 77: washed by the band's own bloom | ✗ (note 5) |
| Title: no flash | no `flash`, lit area grows with the band | 8.90 → 9.00 → 9.06 → 9.15 → 9.60 = 86.5 → 95.6 → 103.1 → 101.8 → 100.3. No spike; `flash` is never set | ✓ |
| Title: surround / mean | surround ≥ 30, mean ≥ 45, ≤ ~80 | surround 64.9 (p5 34), mean 100.3 | floors ✓; cap ruled below |
| Slam timing | cut 8.96, 3-frame flight, hit 9.05, overshoot 12 px, 2nd bounce b3.5 (9.37) | cut, flight, hit and overshoot ✓. **The 9.37 bounce is 1.2 px** (12·e^(−7·0.324)), scale 1.006: invisible | ✗ (note 8) |
| Lines / stamp / HUD | H1 frame 0, H2 b1, both clear b2.5; stamp to b2.5; no chip; mark stays | ✓ (7.2 shows the fade; 8.8 is clean; the title carries only the mark) | ✓ |

**Rulings on the board's numbers (no action):**
- **Dusk 110.6 against 75–100 at b1.** Accepted. The silk is still clearly the brightest area (233 against the sky's ≤ 160), and the owner's complaints are about dark frames, not bright ones (row 71). Don't brighten it further. If note 2's sunglow change lowers it, so much the better.
- **Title mean ≤ ~80.** Not enforced at this gate. The band and its mounts are about a quarter of the frame at ~220 mean, so 80 would need the surround at ≈ 40. The criterion this cap protects is "no flash", and that passes. After notes 2, 6 and 7 the surround will drop anyway. Re-measure, but don't darken the band to hit a number.

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **High** (first 3 s) | 01, 0.00 → 3.15 (H1 on the silk) | **Give frame 0 the board's lamplight falloff, so the hook line reads.** The board ("Texture and light"; still-1 test) asks for an insert at 120–160 that "falls to warm dark (≤ `#4A3B2C`) under the subtitle, stamp and counter corners". What is built: mean **192**, subtitle band 158–167, corner mark invisible (1.37 : 1).<br>Why the line fails: the `corners` mask in core.ts centres top-left at x ≈ 345 and has almost faded out by x ≈ 830. Its target colour is luma ≈ 87, not ≤ 61. So 「人人都想留住你。」 sits on bare cream at 2.6–2.7 : 1, and red 留住 is at 1.55 : 1 by luma.<br>Do:<br>(a) Replace the grey corner blobs with a warm radial falloff from the centre (lamplight, no visible edge). Reach ≤ ~`#4A3B2C` under the whole H1/H2 band (x 120–1120, y 100–300) and under the stamp and mark (x 1280–1870, y 36–200).<br>(b) Frame mean 120–160, with the centre ≥ 200 so the 虹桥 still glows and the linework isn't blackened.<br>(c) Keep the existing `corners → 0` ramp on the pull-back.<br>Pass on frames 0.00, 1.45 and 3.0:<br>• every ivory word ≥ **4.5 : 1** against the paper 6–16 px around it;<br>• red 留住 and the stamp's 「—」 visible on the 480-px crop;<br>• the corner mark visible at 480 px. | animator | 22, 47, 62/87 (check the brightest frames), 9 (first frame striking) |
| 2 | **High** | 01, b2.5 → 8.96, and the cut | **Make you the light in the wind-up, so the glow-locked cut locks onto a glow.** Three problems:<br>(a) The roll has no glow. `drawRoll` is on the `rollers` layer, with no emissive and no bloom.<br>(b) The global `exposure` ramp (s_open.ts lines 91–92, 1 → 0.75) dims you together with the world (peak 243 → 214).<br>(c) The dusk sunglow stays at full strength right behind the walkers (smoothed 154–158 at x 1305–1518). So the biggest light at the cut is a sunset 280–400 px from you, and the breath before the hit is only −22 %.<br>The board says the crest goes dark behind you, and that "your glow, its rim on the carrier's sleeve and the last dusk in the sky remain".<br>Do:<br>(a) Put the roll on an emissive layer with a soft halo (~90 px radius). Bloom it, and have it swell 3 % from 8.78 → 8.96.<br>(b) Exclude it from the exposure dip: dim the stage, not you.<br>(c) Fade the sunglow from b2.75 along with the lanterns, leaving only a low band of dusk at 8.78.<br>(d) Aim the 8.78–8.96 mean at ≈ 60 (floor 45).<br>Pass: at 8.80 and 8.90, the brightest 61-px-smoothed area is centred within 60 px of the roll, and nothing in frame is larger and brighter than your halo. Keep the roll's path: it already reaches (≈ 1709, ≈ 584) at the cut, against the knob at (1710.5, 579.5). | animator | 81 (the hero is the brightest; one motivated key), 112 (picture pause before the hit), 86 (motivated hand-over) |
| 3 | **High** (body logic) | 01, 7.11 → 8.96 | **The carried roll isn't held.** From 7.2 to 8.9 the roll is drawn on top of carrier B, across his chest. Its front ~70 px stick out into the air, with no arm over it and no hand under its end (zoom at 8.90: x 1625–1766, y 555–598). The board's [TOUCH] is "roll clamped under the upper arm, forearm under its end".<br>`contact_check` passes only because `walkB` declares no contacts: `rig(…, [], deck, 'walkB')`.<br>Do:<br>(a) Draw in the order body → roll → near arm. The near upper arm crosses over the roll's middle third, and the forearm/hand comes up under the front end and touches it.<br>(b) Declare both points as contacts so the checker covers 7.11–8.96 at ≤ 4 px.<br>(c) Do it in the shared under-arm carry (`underArmRoll` plus the draw order), because T2, F1 and E4 reuse this carry. | animator | 74, 101 (contacts solved and checked), 77 (prop in hand), board "hands stopping short of what they touch" |
| 4 | Med | 01, 7.2 → 8.96 (every crest far bank) | **The far-bank willow reads as a jellyfish or water tower.** `willow()` in draw.ts is a flat ellipse with 22 straight strands on a thin pole. At 7.2–8.9 one stands in the sunset glow right beside the walkers (x 1185–1320, y 635–775), and it is the only distinct shape there.<br>Do: redraw it so it reads as a willow at 480 px:<br>• a trunk forking into 2–3 limbs;<br>• arching branches whose tips droop into curtains;<br>• the crown widest at the bottom;<br>• no flat top.<br>If it can't read at that size, drop the far-bank willows. Check the 480-px crop of 8.9. | animator | 125 (no prop the viewer can't recognise), 121 |
| 5 | Med | 02, 9.05 → 11.64 | **The title ink is washed grey by the band's bloom.** The authored ink is `#2A1F17` (≈ 33). The rendered ink median is **88**, and even the stroke cores sit at 77. This is because the ink is painted into the emissive band canvas (`band`, emissive 0.3, bloom 0.8), and the band's glow spreads over its own letters. The board says: "the bloom threshold stays above the silk's base, so the ink is crisp".<br>Do: keep the ink out of the glow pass. Either put it on its own non-emissive layer with the same transform and clip, or multiply the band's glow by an ink mask.<br>Pass: rendered ink ≤ ~45 at 9.6, paper still ≈ 240, glint unchanged. Keep the clip, the centring and the slam exactly as they are. | animator | 81 (never let the hero's text blow out), 38, 90 |
| 6 | Med | 02 (and every `night` crest) | **Remove the moon.** crest.ts adds a moon disc (r 30, `#E6EBEC`) and a halo to every night sky. In the title it sits on the band's top edge at ≈ (1478, 375): disc ≈ 187 luma, halo ≈ 250 px. That makes it the second light on screen, next to the title.<br>It isn't in the board's scene 02. T2, W2, F1 and E4 would inherit it, against the look's rule that at night your glow is the only light (R7).<br>Do: delete the disc. Keep the faint cool gradient only if a night frame needs it for the ≥ 45 floor. | animator | 81; rubric visual-1 anchor ("the moon blown to a white disc", 《红线》) |
| 7 | Low | 02 | **Square specks in the defocused night.** Mode 13's defocus is a 7 × 7 **box** kernel (`blurA` 3.2 → ≈ 22 px). It turns the `stars` and `farlights` into grey and warm squares, for example at (920, 15), (540, 70), (75, 295), (485, 330) and (1845, 830).<br>Do: make the kernel round (drop the samples with i² + j² > 9, weight by a Gaussian), or leave the stars out of a defocused under-stage. Check t9.6 at 100 % (the owner sees full-size stills). | animator | 85 (never square chunks) |
| 8 | Low | 02, 9.37 (b3.5) | **The opening's loudest attack gets no visible hit.** The board puts the jolt's second bounce on 9.37. The coded bounce there is 1.2 px, with the scale back at 1.006.<br>Do: give 9.37 its own small kick (≈ 5–6 px on the left roller plus a ≈ 1.5 % scale pulse, decaying in ≈ 0.15 s), or retune the damping so the second bounce is ≥ 5 px. No flash. | animator | 84 (title slam + damped jolt), 26 / 49 (hits on the music) |
| 9 | Low (with the sprite API) | 01, 0.00 → 1.45 | **The mast tip touches the cart.** From frame 0 to 1.45 the A-frame mast's apex sits exactly on the cart wheel on the bridge: (578, 338) at f0, (655, 320) at 1.45. The mast reads like a crane hoisting the cart.<br>Do: when the sprite API lands, start the mast so its tip clears the cart and railing by ≥ 20 px. Also confirm the board's beats: moving on frame 0, then the speed-up at 0.57. | animator | 47 (frame 0 already reads), 125 |

**Heads-up for the producer (not a note):**
- s_open.ts computes `mast` (line 75) and never uses it, yet in the bundle the mast is up at 1.45 and down at 2.6. silk.ts (21:30) is newer than main.js (21:28). Rebuild before the next stills, so what I approve is what renders.
- The disk is at 97 %. Stills in the scratchpad can vanish mid-gate, as `st43/` did.

**Re-submit for r2** (the corrected shots only; owner row 75 still applies to anything sent to the owner):
- 0.00, 1.45, 3.0, 3.71, 8.80, 8.90, 9.06, 9.37 and 9.60;
- a 480-px sheet of those frames;
- `contact_check 0 9 15` output that now lists the carry contacts.

## What must not change (it works)

- **Frame 0 as a composition:**
  - the painted 虹桥 section fills the frame, with the blue mount bands top and bottom;
  - H1 on frame 0 with 4 glyphs already typed;
  - the 《清明上河图》 stamp from frame 0;
  - the camera already tracking right→left;
  - the cart rolling and the mast lowering inside the painting.
- **The b1 two-shot** (closest to lookA_key):
  - figures at 56 % of frame height, in profile, one tone, rims on the scroll side;
  - the 540-px silk with its painted 虹桥 legible;
  - hands on the rollers (checker PASS);
  - ivory and red subtitles on the teal sky at 5.9 : 1;
  - lanterns on alternate posts of the near railing, in front of the figures;
  - robes resting on the deck line, with no float or sink on screen at 3.71 or 8.90.
- **The take's timing:** pull-back b0.75 → b1, eased; roll-up from b2; walk-off right (出) from b2.5; the track accelerating; lanterns dying in three steps, all out by 8.78; H1 and H2 clearing on b2.5; the stamp gone by b2.5.
- **The glow-lock geometry:**
  - the roll arrives at ≈ (1709, 584) at 8.96;
  - the band's right knob at 1710.5 and its centre at y 579.5;
  - the cut on 8.96, a 3-frame flight, the slam on 9.05 with a 12 px overshoot, the scale 1.04 → 1.0, the glint on b4.0.
- **The title band:**
  - built from the film's own silk (the river painting at 12 %, weave, mounts, knobs);
  - ink drawn into the band, so it is clipped and moves with it;
  - ink centred to within 2.5 px; 清明上河图 at 160 px of ink height;
  - title only, corner mark kept, no `flash` anywhere, frame means rising without a spike.
- The corner mark is the old 21 px mark. Subtitles are Noto Serif CJK SC Black 58 px at x 150 / y 132 (row 103).
