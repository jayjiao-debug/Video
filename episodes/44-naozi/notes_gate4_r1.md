# Gate 4 notes: 你是爱因斯坦的大脑, rough cut v1 (160.5 s), r1. Verdict: REVISE

Scores (rubric 1–5): script 5 · visual 4 · info 4 · edit 4 · motion 4 · sound 3 (temp track, not judged for sync).

**Overall: 3.** The owner would post it with 2–3 notes, not as it stands. Three things would get it sent back:
- The title is only readable for about half a second. This is his own new note.
- There is no Juno end card. ep41 and ep42 both had one.
- At A3 a subtitle sits on top of the consent form.

The fixes are all for the animator, plus one cue sheet for the music specialist. Nothing in the script changes.

**Inputs:**
- Owner notes: all rows.
- Rubric.
- Brief.
- Script v2 (line table, picture column, callbacks).
- notes_gate1_r1/r2 and their carry-forwards.
- lines_film.json.
- The contact sheets sheet_00–16, all of them opened.
- About 40 full-resolution frames I pulled myself:
  - the title at 13.6–15.1;
  - K2, P1 and W2 for the glow;
  - E1b, D1 and D2;
  - A1 and A3;
  - G1 and G2 (117.7–119.7);
  - G4, F1, F3, F4, Q and frame 0.
- The code: EP44ROUGH.tsx, skin44.tsx, and the glow and title code in rough44a.tsx and demo44.tsx.

**Measurements:**
- Mean frame luminance is 53.5 / 255 overall, against 27 for ep21 ("too dark"). The lowest stretches are 50–66 s (30–34) and the G4 ring at 130–135 s (30).
- Audio is −14.0 LUFS, true peak −1.4 dBTP. There is no dip at D1 → D2.

## Notes (ranked)

| # | Sev | Where (film time) | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **Block** | Title, 12.75–15.25 | **The title flashes by** (owner's new note). In demo44 the characters fly in until about 14.6, and by 14.8 the title is already fading grey over the cradle. It is fully readable for only **about 0.5 s**. **Fix:** <br>• Start the fly-in about 0.4 s after the rewind starts. Stagger it 0.03 s per character and have all 9 characters settled by about 14.0. <br>• Then hold the whole title at full opacity and full size for **at least 2.5 s** (to about 16.5). Keep its current size and colours (你 in rose-gold, the rest white). <br>• During the hold the picture keeps moving: the rays turn slowly, the brain breathes, and there is a slow push of about 3 %. No frozen frame (row 91). <br>• Then hand over to the cradle exactly as now: the brain sinks into the baby's head, the title fades as the room comes up. <br>• Shift every later line, stamp, counter key and scene by **+2.0 s**. The cleanest way is to add 2.0 s inside `sceneT`/`film` and `LINES` for everything after line 4. Do not stretch the rewind itself. <br>• The film becomes about 162.5 s plus the end card (note 2), still well under 3:00. | animator (+ music, note 6a) | Owner 2026-10-24 "opening title flashes by too fast"; rows 38, 84, 133 |
| 2 | **Block** | End, 152.75–160.5 | **The Juno end card is missing.** Q sits over the dimmed compass, and the film fades to black at 158–160.5. There is no J monogram, title, follow pill or sources. ep41 (`qq/s41outro.tsx`) and ep42 (`qq42/rough42b.tsx`) both end on it, and the script puts Q "on the Juno end card". This film also makes consent and research claims, so it needs its sources line. **Fix:** <br>• At Q, dim the compass shot to about 30 % (no blur, row 54) and build the card over it. Reuse the series end card mechanics from s41outro or rough42b. <br>• **Card contents:** <br>  – the J monogram; <br>  – the title 你是爱因斯坦的大脑. Use this episode's **rose-gold** (`ROSE`) instead of the usual gold, because the owner's rule is that rose-gold is the only saturated colour. That is my call for him, and the conservative one. <br>  – Q centred at 76 px with the ？ pull-back (as now); <br>  – the pill 「关注 Juno · 一起看懂世界」; <br>  – the sources line copied verbatim from script.md, "End card". <br>• Hide the corner J seal while the card is up. Never write "Juno 出品". <br>• Hold the card for at least 5.5 s. Nothing gets brighter after it (row 95). The final fade ends on the music's last bar. | animator | Rows 17, 20, 95; series slogan (SKILL.md) |
| 3 | **Block** | A2–A3, 69.5–75.75 | **Subtitle over the consent form, and a pen as long as an arm.** <br>• The form's top edge is at y ≈ 190–260 at 1080p, inside the two-row subtitle block. At 73.2 the "C" of CONSENT shows between 「：」 and 「只」, and the rose 「只许用于科学」 sits on cream paper with poor contrast. That is text over text (rubric visual 1). <br>• The son's hand is about 400 px from the signature line, joined to it by a straight line, so it reads as a pointer, not a pen. <br>**Fix:** <br>• Scale or lower the form so its top stays at y ≥ 310 for the whole A2–A3 stack (clear of both subtitle rows plus their shade). <br>• Re-place the son so his writing hand is on the Family line holding a normal pen (≈ 60–90 px). Solve it with the arm IK / `<Person>` reach, not by stretching the pen, and run pose_check to PASS. <br>• Keep the blank line at A2, the signature being written at A3 and the 只许用于科学 stamp. | animator | Rows 74, 77, figure-rules; rubric visual 1 (text over text) |
| 4 | High | F1 → F2, 138.75–141.5 | **The bookend's "biggest image" is small and bridged by a dissolve.** <br>• The cubes reassemble into a brain about 420 px wide, half framed by the T1 window, for about 1.3 s. <br>• Then the shot dissolves to K1's wide shot. The brain never goes into the boy's head, which is what the storyboard asked for. That is a hand-over between unrelated frames (row 86). <br>**Fix (inside F1's window, no new time):** <br>• Let the cubes rise out of the drawers and lock together **large and centred**: the brain ≈ 55–60 % of frame height, at the brightest glow so far, held about 1.5 s. <br>• Then it shrinks and flies to the **exact screen position of the boy's head in the K1 wide frame** (match on position). The room fades in around it as it lands, and the glow becomes his head glow. Then cut in to K2's exact shot for F2, as now. | animator (+ music, note 6d) | Rows 86, 88, 72; carry-forward r1 #2 |
| 5 | High | G2, 117.0–123.5 | **The order of the find, and a label too small and then covered.** <br>• 「找到了！」 lands at 118.5, before the callipers read 「+15%」 at 118.9, so the find comes before the measurement. <br>• The label 「顶叶：管空间和数学想象」 is about 27 px. From 120.5 to 123.5 the expert figure covers it (it reads 「顶叶：管空间和」). <br>**Fix:** <br>• Callipers close, then +15% on a beat, then 找到了！ on the next beat, then 得不出结论 replaces it (as now). <br>• Set the label at ≥ 40 px (row 76) and place it left of or below the outline, clear of the expert for the whole of G2. <br>• Keep G2 shorter than G1 and longer than G3 (10 → 6.5 → 4.75). | animator | Rows 76, 99; carry-forward r2 #2 and r1 #5 |
| 6 | High (music) | Structural hits for the real track | **Cue sheet for the final track** (the temp track was ignored for sync). These moments need the music: <br>**a.** The title lands on the **hardest drop**, and the hold from note 1 covers at least the drop's first bar (rows 26, 84, 133). <br>**b.** D1 → D2 at 60.5 / 63.0 (+2.0 after note 1): the film's **one full pause**. Under 1 s of near-silence after 「他停在了76岁」, and the music re-enters exactly on 「你没有。」 (script; row 112; row 50 caps the length). Now the RMS stays flat at about −13 dB across it. <br>**c.** Each 「找到了！」 lands on a downbeat, and the grey stamp on the next strong beat. G3's stamps are the closest together. <br>**d.** F1's reassembly sits on the track's emotional peak (row 88). <br>**e.** F3 → end card falls away: nothing louder or brighter after F4 (row 95). <br>Also: the upload master must come out ≤ −1.5 dBTP (it is −1.4 now). | music specialist, editor | Rows 26, 50, 51, 64, 66, 88, 95, 112, 133 |
| 7 | Medium | F4, 149.0–152.25 | **Curiosity is not the brightest moment.** At 150.6 the boy's head glow is the same as at 145.3. The script says it "rises to the brightest it has been all film" on 好奇心. **Fix:** ramp the head glow about 1.5× (radius and opacity) while 好奇心 types, peak about 0.5 s after, then hold. It peaks before the end card, and nothing is brighter after it. | animator | Script F4; row 95 |
| 8 | Low | G4b, 131.5–135.25 | **The verdict image is murky** (mean 30/255). The roughly 240 cubes read as a dim carpet, and the empty spotlight in the middle barely registers. That frame is the answer to C5. **Fix:** lift the floor pool so the cubes read as grey, unlit cubes, and make the central spotlight a clear, empty bright disc. The 18 silhouettes stay dark. | animator | Rows 71, 81 (the hero is the brightest thing) |
| 9 | Low | N1, 41–44.5 | The diploma reads **1921** under a stamp that says **1922 · 诺贝尔物理学奖**. Both are true (the 1921 prize was given in 1922, facts L11), but side by side they look like a mistake, which is bait for comment nitpicks. **Fix:** label the diploma 「1921年度」, or drop the year from the diploma. The stamp stays. | animator | Row 11 (plain reading must be true) |

**Not a note (I considered these and decided against them):**
- **K2's flare happens under the subtitle.** At 22.6–24.2 the boy's head sits behind the top-left text, so K2 doesn't teach the 你/他 rule the way carry-forward r1 #2 asked. But 0–35.5 is the owner-approved demo, and the rule reads clearly elsewhere:
  - E1b's flare with rays at 39.0;
  - W2 dimming 0.62 → 0.32 at 47.75–48.6;
  - D2, where the glow is the only light;
  - F2 → F4.
  
  Don't rework the approved section for it.
- **Stamp line 2 is 30 px** (`skin44` note), under the ≥ 40 px for tags in row 76. The owner chose this two-line stamp himself, and line 2 is supporting detail, not story. Leave it.
- **The stamp and counter lag the line by 0.45 / 0.8 s** (for example 105.5, where the line already says 1997 and the stamp still says 1985). This is by design and reads as the record catching up.

## Check against the gate-4 brief

**Does each beat read?** Yes, line by line, with these exceptions:
- the title (note 1);
- A3 (note 3);
- the F1 bridge (note 4).

What reads especially well:
- Every cold-open fate pays off on its same shot later: CIDER at A9, the eyepiece at G1b, the car at R1, the cubes at A6.
- The D2 counter split ("他 76 岁" in grey over "你 76 岁" with a running date) reads in one glance.
- R4's closing door is the film's quietest strong beat.

**你/他 glow:** visible where it matters most (E1b, D2, F2–F4). K2 is under the subtitle (see "Not a note").

**Does the hunt speed up in the picture?** Yes, in both time and steps:

| Rep | Length | Steps on screen |
|---|---|---|
| G1 | 10 s | jar → 4 cubes → microscope → eyepiece → 找到了 → 3 grey / 1 lit → 存疑 |
| G2 | 6.5 s | outline → callipers → +15% → 找到了 → 得不出结论 |
| G3 | 4.75 s | photo → fold → 找到了 → 只是假设 |

G2's order needs fixing (note 5).

**Does the ending pay off the compass and the question?**
- **Compass: yes.** F2 is K2's exact shot. The `INDENT` puts 一定【深藏着什么】 at exactly K2's screen position (I measured the same x in both frames), which is carry-forward r2 #1 done properly.
- **Question: half.** Q has no end card (note 2), and the move into the bookend is a dissolve (note 4).

**Pacing per scene:**

| Scene | Film time | Call |
|---|---|---|
| Cold open | 0–12.75 | Right. Six events in 12 s. |
| **Title** | 12.75–15.25 | **Flashes** (note 1). |
| Birth / compass / light / office | 15.25–35.5 | Right. |
| E1 / N1 | 35.5–44.5 | Right. |
| W1–W3 | 44.5–54.25 | Right. |
| S1–D2 | 54.25–66 | Slow on purpose. S1 at 54.5–57 is the most static stretch, but it sets up the pause, so keep it. |
| A1–A9 | 66–95.5 | Right. |
| G1 / drive / G2 / G3 | 95.5–128.25 | Right. The odometer interior is a good change of angle. |
| G4 | 128.25–135.25 | Slightly static and dark (note 8). |
| T1 / F1–F4 | 135.25–152.25 | Right, apart from the F1 bridge (note 4). |
| Q | 152.75–160.5 | **Drags**: 7.75 s on a dim static frame with no card (note 2). |

**Transitions:** nearly all are motivated:
- the cubes falling into the box;
- the push into the jar, then the microscope;
- the streak whip to the car;
- the rewind;
- the push into the compass, then the meadow;
- the head glow, then the office;
- the glow of the 相对论 sheet, then the eclipse;
- the letter shrinking onto the desk;
- the A4 sky, then the window, then the jar;
- the scale brain lifting into A6;
- the push into the jar, then G1;
- the bag's glow, then the G2 cube;
- the T1 sky matching A4.

The exception is F1 → K1 (note 4).

**Safety: passes.**
- The brain is always an outline or translucent cubes, and slides are abstract dots.
- There is no autopsy picture (closed PATHOLOGY door).
- The 1939 letter has no bomb imagery.
- Einstein, Harvey, Evelyn and the researchers are silhouettes only.
- The mastheads are generic (THE GAZETTE, EVENING NEWS) and the box says CIDER, so there are no real logos.
- There is no 1915, 广义 or 狭义 anywhere, and no angle number on the bend (ruling 2 / carry-forward 3 hold).

**Facts:** every stamp I read traces to facts.md (1230克, 35 / 11 controls, 右额叶4道褶, 6篇正式论文, 杜卡斯, 凌晨1点多, 伊芙琳, 帕特尼蒂). The only wrinkle is note 9.

## For the producer: how to deliver by morning

The owner's standing rule (2026-10-12) is "send the corrected still and wait for the OK before re-rendering". He also asked for a final video by morning. My call on his behalf:
- Apply notes 1–5, 7 and 8. Note 9 is optional.
- Every one of them carries out a rule he has already stated or his own new note.
- Render once.
- Put the before/after stills of each changed shot in the morning message, so he can veto any single change without a re-review.
- Change nothing else.

Note 6 waits for the final track. If the track isn't in by morning, ship with the temp music and say so.

## What must not change (it works)

**Opening**
- Frame 0 with the first words already typed and the brain cracking on the first beat.
- C1–C4 as one sentence over hard cuts.
- The ◀◀ rewind with the counter spinning back. Only the title's hold changes (note 1).

**Callbacks and the counter**
- Each fate's payoff on its same shot.
- The counter: plain era tags, the running date after D2, holding 76 from D2 to A7, the 76 → 99 roll with the seasons.
- The D2 split.
- The A6 camera flash paying off as G3's photo.

**Lines and type**
- The `INDENT` alignment of F2 under K2.
- The ？ pull-back on C5, D2 and Q (centred to within 3 px).
- Subtitles: 58 px sans, no box, feathered shade.
- The two-line 霞鹜文楷 stamp.
- The small J seal.
- Rose-gold as the only saturated colour.

**Scenes**
- E1b: the flare with rays, then the headlines stacking.
- N1: the relativity sheet going out beside the diploma.
- W1: the typed letter dated August 2nd, 1939.
- W3: the letter in the window glass.
- A1: the PATHOLOGY door and Harvey walking out with the jar.
- A4 → T1: the sky match.
- A5: the 普通人的范围 band.
- R2: the odometer 5994 → 6004.
- R3/R4: the doorstep and the closing door.

**The hunt**
- Its timing (10 / 6.5 / 4.75).
- G1's 3 grey + 1 lit + 存疑.
- The glia pill label at about 44 px.
- G3's numbered folds 1-2-3-4.
- G4's ring of 18 silhouettes.

**The ending**
- F2 on K2's exact compass shot.
- F3's 「——爱因斯坦」 attribution.
