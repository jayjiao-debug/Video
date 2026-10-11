# Gate 2b notes r1: 为什么一比，就觉得穷？ v3 · 满意度热像 (thermal in three.js), verdict REVISE

**Verdict: REVISE (round 1).** The look, the world, the storyboard's structure and its beat map are approved. My r1b condition is met: three stills from the real pipeline, a 3-s clip, and a measured 1.2–2.4 s/frame (hall ≈ 2.0 s; 3899 × 2.4 / 60 ≈ 2.6 min per worker, accepted).

The proofs still show problems the owner would send back:
- a full-frame flash on the drop;
- a "phone-head" figure and empty blob frames in the hook;
- a monkey close-up that reads as a blue bowling pin with dark eye-holes;
- clipped labels.

The producer may keep building scenes 3, 5 and 6 from this storyboard while fixing notes 1–7. Round 2 = re-render the three proofs + the two clips asked for in note 8.

Evidence base:
- `style/proof_t3.png`, `proof_t38.png`, `proof_t81.9.png`;
- `proof_drop_clip.mp4`: all 90 frames extracted, per-frame luma and frame-to-frame difference measured, crops of consecutive frames checked for contour crawl;
- contact sheets `mh.jpg` (hook 0–15.5), `ml.jpg` (lab 21.5–46), `mw.jpg` (wall 74.5–82.4).

No cold-read exists for these stills (`coldread_gate2b*` missing), even though r1b asked for one.

## Scores (gate-2b areas; edit and motion partly from the plan)

| Area | r1b (hybrid, plan only) → now | Evidence |
|---|---|---|
| 2 Visual | — → **3** (drop 4, hook 3, lab 3) | Drop end state (82.4) is a striking still: hot tiers over a white-hot line, ice crowd below, luma 118. Hook frame 0 glows, luma 104. Lab is dull violet, luma **60** (r1b H1 asked ≥ 90). Monkey A close-up (38) does not read as a monkey. Hook 5.0 s and 13.5 s are near-empty blob frames. |
| 3 Information | — → **4** | Hook ¥4000 contrast now **8.6:1** (was 1.27:1 in C). 95/60/20 % at ~150 px turn cyan as A cools, which reads at a glance. The drop passes the 5-second test at 82.4. Against that: "中位数" is cut off at the right edge, 20 % sits on A's head (42, 46), and the phone label "实习工资 · 到账" is clipped on both sides. |
| 4 Editing (plan) | 3 → **4** | Every transition is motivated in the plan, and the drop lands on the first frame after 81.375 (frame 60 = 81.40). The title plaque, steam-haze → lab and grape-bloom → coin are still unproven. The drop's full-frame flash breaks an owner rule. |
| 5 Motion | 3 → **4** | Pre-drop pull-back is eased (frame diff ramps 0.4 → 6.4 → 0.16) with a dead hold at 81.23–81.37 before the hit; that anticipation is good. The post-drop crane settles by 82.3. Weak spot: the hook's camera passes through empty frames (5.0, 13.5). |
| Flicker / crawl | — | Luma is smooth across the clip (115 → 107 pre-drop, no spikes except the drop flash and the 81.3 subtitle change). Consecutive-frame crops show contours stable. Mild sawtooth contour segments sit where warm figures overlap (inside the 你 ring at 81.43; right of 你 at 82.2). Invisible at 1/4 screen; low priority. |

Against Look C's 2D frames (gate 2a), this is better on every axis: real 3D camera, volume from rims, no surveillance HUD, readable hook number, no navy.

## r1b checklist
- **H1 3D forms / ≥ 90 luma / shimmer + steam:** partly met. The mug, monkeys and figures have volume. The phone is a flat white slab. Lab luma 60. No shimmer or steam visible in any proof.
- **H2 no flicker:** met. Mild sawtooth contours (low).
- **H3 one legend, no surveillance:** met. The legend with sliding 你的/室友 markers (11.5) works. The gold ring is not a target box.
- **H4 hook:** contrast met, ≥ 60 % height met. Front-on figure **not met**. Auto-range shows only in the legend, never in the picture (partial).
- **H5 monkeys:** wide side profiles met (21.5–34), grape hottest met, numerals met. Close-up front-on with dark ear "eyes" **not met**. Throw not shown.
- **H6 beat map:** met. Palette arc per scene not written (low).
- **H7 coverage:** met, but the coin unit is wrong (note 9).
- **H8 render:** measured. Not vendored (pipeline + node_modules live in the session scratchpad; `build/` holds the old v1). Heaviest shots (A/B worlds with 257 figures, street) not yet built or timed.
- **H9 camera:** rules met. "Whip back to A" (32.78) conflicts with "no fast sideways sweeps".
- **H10 title:** not proven.

## Notes (ranked; top 10 are the ones that matter)

| # | Sev | Where | Note | Route |
|---|---|---|---|---|
| 1 | High | 81.40 drop | **Remove the full-frame flash.** Frame 60 jumps from luma 107 to **158**: a pink-white wash over the whole picture, decaying over ~0.4 s. That breaks r1b ("flash on the line only") and the owner's "no flash at 0:12" / "never pulse the whole frame on the beat". Keep the hit on the line: the isotherm itself flares white-hot with bloom ≤ ~120 px either side. The rest of the frame changes only through the cold front. Target: mean-luma jump at 81.40 ≤ +8. | animator |
| 2 | High | 0–4.4 hook frame 0, 4.4–8.5, 12.5–16.4 | **The hook figure reads as a person with a phone for a head**, facing us (frames 0, 3). It is neither the storyboard's "first person" nor r1b H4's side/back view. Pick one: (a) true first person, the phone rising from the bottom edge, your knees and desk edge below it, no torso facing camera; or (b) over the shoulder, back three-quarter. Also fix the empty frames. At 5.0 s a giant orange disc (the back of the head) fills the frame. At 13.5 s, on 不香了, the frame is a dark blob with the phone cut off at the left edge. Rule for every camera path: the story object (your phone, the roommate's phone) stays in frame at ≥ 25 % of the height on every frame. Pass over the head in ≤ 1 beat or keep the phone visible through it. These two frames are where the owner says "cheap". | animator |
| 3 | High | 8.5–12.5 roommate / auto-range | **Show the core mechanic in the picture, not only in the legend.** Today the roommate's phone is ~10 % of the height, its 6000 is unreadable, the bunk and figure are a lumpy blob, and yours is never in the same frame. The cooling is only legible by reading the legend markers. At b5 (10.51), make a two-shot. Your phone sits foreground lower-left (≥ 35 % of the height, ¥4000 readable). The roommate's phone blazes white on the bunk, upper-right (6000 printed at ≥ the size of your 4000). Over 2 beats yours drops from white to orange while its number does not change; the legend markers slide at the same moment. This is the film's one idea; it must read with the sound off and without the legend. | animator (art-director to add the framing to storyboard row 1) |
| 4 | High | 36.8–40.9 monkey A close-up (proof_t38) | **Not a monkey, and the dark ears read as eye sockets** (creepy; the cold-reader's "blobs like eyes" flag). The close-up turns A front-on: a blue bowling pin, with two dark violet discs (RGB ≈ 50,12,111) either side of the head and a cage bar splitting the body down the middle. The still also lacks what r1b asked for at 38 s (cucumber one cold, grape one hot) and shows no throw. Fix: keep A in the **same side profile as 26 s**. Frame a two-shot favouring A (A large, foreground left, ice; B soft in the background right with the grape white-hot). Ears get the body's colour (not darker than the body). Bars sit behind the body or between the two monkeys, never down a body's centre line. The cucumber (≥ 80 px, recognisably long with bumps) arcs out of frame on beat 3. | animator |
| 5 | High | lab 20.6–48.9 (whole scene) | **The lab is the darkest and least 炫丽 scene:** luma 60 against H1's ≥ 90, flat violet stripes, light only from the grape. Lift the ambient floor toward #681696/#BA2280. Make the red ovals cut off at the top edge (23, 30) real heat lamps, in frame or clearly cropped, casting warm glow on the cage walls. Let the grape light the bars and floor around it, with heat shimmer above it. Same treatment for any later dark scene. | animator |
| 6 | High | text, several scenes | **Clipped or colliding text, which reads as "broken" (rubric visual 1):** <br>(a) "— 中位数" is cut off at the right edge in every post-drop frame; move it inside x ≤ 1800 and size it ≥ 44 px. <br>(b) "实习工资 · 到账" is clipped on both phone edges (t3, frames 0/3); fit it with ≥ 24 px margin. <br>(c) 20 % sits on monkey A's head and A is cut by the left edge (42, 46); keep A at x ≥ 400 or the number clear of it. <br>(d) The wall header "加州大学 · 员工工资 · 全部可查" (74.5) is in the top-left Douyin-watermark zone your own storyboard keeps clear, and "2008 · 报纸网站" is clipped under the corner mark; move both below y 150. <br>(e) The mug sits under the legend bar (0, 3). <br>(f) Exclude printed text from the contour pass: the ¥4000 glyphs carry wavy double isotherm lines (t3) and look smudged at full size. | animator |
| 7 | Med | 81.88 / drop end state | 满意度▼ fades in as a ghost behind the figures (faint at 81.9, full only at ~82.3). Make it **land on beat 2 (81.88)**: a 2–3-frame scale/opacity snap, drawn above the crowd with a dark-violet shadow. Put 你 clearly **one row under** the line. Now the ring straddles it (head at y ≈ 350, line at y ≈ 345), so "just under the median" is not legible. | animator |
| 8 | Med | 16.0–21.0 and 44.9–50.0 | **Prove the two transitions the owner will judge first**, as 3–5-s clips before building on them: the title plaque on 16.58 (solid lettering, framed, white-hot, not a contour ghost, per H10) → steam-haze wipe → crane into the lab; and grape bloom → white-hot coin → pull back to the worlds. These carry "转场" in the first minute. | animator |
| 9 | Med | storyboard.md | Fix the storyboard text: <br>(a) **Coin unit is wrong.** "yours 20 coins (5万) vs others' 10 (2.5万); 1 coin = 2.5万" makes 20 coins = 50万. Drop the "1 coin =" legend. Label the tower tops with the script's amounts (5万 / 2.5万 / 10万 / 20万) and keep the heights proportional (20/10/40/80 coins). <br>(b) Replace "whip back to A" (32.78) with an eased pull back to the two-shot (owner ep15: no fast sideways sweeps). <br>(c) Make "开心的第 1/2/3 天" a ≥ 64 px label ticking on 4.43/5.44/6.46. At 6.6 only tiny text on the phone shows it. <br>(d) Exchange props: stone and cucumber ≥ 80 px on screen, the stone a cool grey pebble, the cucumber lukewarm (at 26 they are 30-px blobs). <br>(e) Write the palette per scene (H6): the breakdown worlds cooler violet/cobalt-magenta, heat back on the build, ice + white at the drop. | art-director (producer holds the pen) |
| 10 | Med | process | Vendor three.js and the v3 pipeline (`thermal.js`, `kit.js`, `s_*.js`, `film.html`) into `episodes/21-compare-salary/build/`. Today they run from the session scratchpad, which the farm cannot load, and `build/` holds the old v1. Time the A/B worlds (257 instanced figures) and the street when built; accept them up to ~2.5 s/frame. Run the cold-reader's 5-second test on the round-2 proofs (hook, monkeys, drop) plus the title frame. | animator / producer |
| 11 | Low | wall 73.3–79.4 | The list rows are plain orange bars, so at 74.5 it reads as a bar chart. Give each row a masked name block and a right-aligned amount column (illustrative, "名单为示意" is already there) so it reads as a published pay list. Show the scan stopping on your row on b39 (not visible in any proof yet). | animator |
| 12 | Low | crowd 79–97 | Identical mannequins, arms down. Vary height and shoulder width a little, and add slight head tilts, so it reads as people, not stock pictograms. The thermal treatment hides the rest. | animator |
| 13 | Low | sound plan | "One whoosh per haze/fill transition" plus ignite and crackle: keep to ≤ 3 sound types in one tonal family (F#), all ≥ 10 dB under the music except the drop crackle. No per-object pops (owner ep13/ep14 SFX rows). | editor |

## Don't change (it works)
- **The world and the mechanic:** heat = 满意度; the camera auto-ranges, so your unchanged thing reads colder. The legend "满意度 / 越开心越热" with the sliding 你的 ¥4000 / 室友 ¥6000 markers (11.5) is clear.
- **Hook frame 0:** a white-hot phone at ~75 % of the height, already moving, ¥4000 in dark-violet print (8.6:1), subtitle on frame 0, luma 104.
- **Phone cooling:** your phone visibly cooled to orange at 15.5 with the same ¥4000 (and the 第3天 detail).
- **Monkey wide shots 21.5–34:** two warm side-profile capuchins in cages, readable as monkeys. The grape is the white-hot hottest object.
- **The 42–46 two-shot:** ice A vs warm B with the grape.
- **The numerals:** 95 / 60 / 20 % at ~150 px; the numeral's colour follows the heat (yellow 95, cyan 60/20).
- **The drop structure:** eased pull-back on the quiet bar, a dead hold just before 81.375, the line on frame 81.40, the cold front rolling down the rows over ~2 beats, the crane settling by 82.3. End frame: hot tiers above the white line, ice crowd below, 你 in a gold ring, 满意度▼, luma 118.
- **No surveillance cues:** no brackets, no °C, no MAX/IR, no target box.
- **No flicker:** stable contours between frames; `renderAt` stays pure.
- **Engine layer:** Noto Sans CJK 900 subtitles on the dark strip with gold keywords, the corner mark, and the source lines (Brosnan & de Waal 2003; Card, Mas, Moretti & Saez 2012 · 名单为示意).
- **The storyboard's beat map, camera rules and transition chain** (steam → lab, grape → coin, coin edges → pay rows, rows → tiers, doorway → street, window → room, reference switch → flare).
- **Render cost** of 1.2–2.4 s/frame: accepted.
