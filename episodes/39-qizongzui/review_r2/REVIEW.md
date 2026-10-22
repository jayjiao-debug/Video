# Review: 《七宗罪》梗图版 r2 (send version, 59.46 s) — verdict: FIX FIRST

The bans hold. No white or grey flash anywhere, every reveal and the title land within ±13 ms of the kick, and the iris colours all match. The script reads clean and funny. The biggest risk is still the cut-outs that gate 3 flagged as a blocker: 鼠鼠 is a blurry smear with straight matte edges, and 哈基米 has a rectangular matte. Behind that come a dark, small frame 0 and a dead bar before the outro.

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| 1 | MAJOR (gate-3 blocker, not fixed) | 28.6–34.5, 34.7–40.6, 4.3–6.1, 16.4–18.3 | **Cut-outs.** (a) **鼠鼠 reveal:** the face is an upscaled beige smear (no readable eyes or nose), the helmet has a flat cropped top and the face a straight vertical left edge. This is the film's "biggest laugh" scene. (b) **鼠鼠 silhouette:** not a silhouette. The darkened photo shows through (face and helmet texture) and the top edge is flat. (c) **哈基米 reveal:** the matte has a flat top (head cloth) and straight vertical cuts down both cheeks. (d) **哈基米 silhouette:** a semi-transparent grey rectangle sticks out right of the head. (e) **袋鼠 silhouette:** white streaks and jagged specks along the base. (f) Small: 刀盾狗 silhouette has a light haze lower-left and an unsilhouetted blade; a black matte speck sits right of the shield arm (20.84, x≈1520 y≈595). | `evidence/E2_cutouts_board.png`, `evidence/E1_kangaroo_sil_base_5.00s_x2.png`, `full/crop_disc_32.5.png`, `full/crop_disc_38.6.png`, `full/crop_disc_35.5.png`, sheets 08–10 | Replace the 鼠鼠 source with a sharp original-resolution frame (face readable at ¼ phone screen) and re-matte with a clean binary alpha; no straight edges. Re-matte 哈基米 (round off the head-cloth top, cut the cheeks along the fur). Build every silhouette from a **thresholded** alpha (alpha>0.5 → 1, else 0), filled flat, so no photo texture or mid-alpha haze can show. Erode the 袋鼠 base by 2–3 px. Check each PNG's alpha histogram before rendering. |
| 2 | MAJOR | 0:00–1.0 | **Frame 0 is dark and small.** Mean luminance is **19.6/255** (director's target ≥35; ep21 "too dark" was 27). Frame 0 shows two typed characters (七宗\|) and seven ~150 px silhouettes in a strip; nothing fills the frame. The first sticker pop comes at **1.0 s**, so nothing hits the music on beats 0–1 (0.06, 0.57). | sheet_01 frame 1, `evidence/E5_intro_0-1.5s.png`, `checks/flash_summary.txt` | Lift the backdrop to a mid-tone (indigo/violet vignette, frame mean ≥35). Scale the sticker row up ~1.3× (≈200 px stickers, ~90 % of width). Start the pops on beat 0 (0.06 s) and pop one per half-beat so all seven have popped by ~1.8 s. Have frame 0 show 七宗罪 already typed. |
| 3 | MAJOR | 46.0–48.5 | **Dead bar before the ending.** The 色欲 scene simply holds for bar 23. Its closing line has been read by ~45.5, then 2.5–3 s pass with nothing new (cow bob, hearts). Every other scene irises out on its 3rd bar line; this one holds 5.8 s. The planned "collect" beat (stickers fly onto the ring in bar 23, then stillness) instead happens *under the question* (48.9–51.5). That reverses the 画面停顿 plan (dense, then still). | `evidence/E4_bar23_hold_45.8-48.4s.png`, sheet_12, `strips/p_outro_flyin.png` | Iris into the gold ring at 46.69 (bar 23). Fly the seven stickers onto the ring one per half-beat inside bar 23. From 48.72 the question appears into a **still** ring (slow turn only) through bar 26, then the slam. This is director note 6d. |
| 4 | MAJOR | each moment bar: 4.3–6.0, 10.37–12.03, … 40.80–42.47 | **Pre-reveal read is too short.** The context line is legible only **~1.67 s** (it slides in ~0.2 s after the iris opens and blurs out ~0.1 s before the reveal). A 6-字 line needs 1.96 s by the owner's formula (0.5 + 字/7 + 0.6). In that same window the viewer also reads the 4-字 bubble and guesses the silhouette. Worst in scenes 1, 2 and 7 (10 字 total). The screenwriter's budget table left out the +0.6 s. | `strips/p_ctx_window_s2.png`, `strips/p_ctx_window_s7.png`, `strips/s_130_scene1_in.png` | Bring the context line in **with** the iris opening (on the first frame the disc is readable, ~+0.1 s). Keep it until 1 frame before the reveal in scenes 2–7; scene 1 keeps its designed 5.62 hold. If still short, trim to ≤5 字: 朋友考研上岸 → 朋友上岸了, 又点开ta主页 → 又刷ta主页. |
| 5 | MAJOR | 0:00–4.1, 48.9–54.7, bubbles | **Off-centre punctuation (owner rows 89 and 97).** Intro line 1 七宗罪，你每天都在犯。 has its ink centre at **925 px** (frame 960): **35 px left**, from the trailing 。. The outro question 你心里，哪一宗罪最大声？ sits at **943 px** against a ring centre of 959.5: **16.5 px left**, from the trailing ？. Bubbles ending in ？/！/。 are ~12 px left-heavy (e.g. 我？先低头？ at 5.0, 你再说一遍？ at 17.3). The thesis line is correctly centred (960.0). | `checks/ink_centre.txt`, `evidence/E3_outro_question_54.40s.png`, `full/f_5.0.png`, `full/f_17.3.png` | Apply the ½-em (+ letter-spacing) trailing-punctuation pull-back in the typed intro line, the outro question and the Bubble component. Re-measure the ink centre on rendered frames. |
| 6 | MINOR | 48.9–59.4 | **Outro ring stickers have no sin names.** At ~145 px, to answer 哪一宗罪最大声 the viewer must remember which colour is which sin. Also, as the ring turns, the 暴食 sticker comes within ~30 px of 你 (54.4); there is no overlap. | sheet_13, `evidence/E3_outro_question_54.40s.png` | Put the sin name (≥40 px, sin colour) under each ring sticker, as director note 8 asked. Stop the ring turn so no sticker passes the 9 and 3 o'clock positions while the question is up, or narrow the question. |
| 7 | MINOR | 25.0–28.1 | **The 懒惰 payoff is the shortest element.** 明天 lands at ~27.4 and is covered by the iris at ~28.1: 0.7 s. The calendar straddles the disc's left rim, ~60 px from *Acedia*. | `strips/p_sloth_calendar.png`, `full/crop_disc_27.6.png` | Flip faster (one day per half-beat) so 明天 lands at ~26.4 and holds ≥1.5 s, with a small stamp bounce. Move the calendar 60–80 px right, inside the disc. |
| 8 | MINOR | 54.8–59.4 | The thesis 七个梗，七个放大版的你。 renders at ~48 px glyph height. It is the film's 原来如此 line and director note 5 asked for 56 px. | sheet_13 frame 5, `strips/p_endcard.png` | Set it to 56 px. It fits inside the ring (two lines, ink 846–1074 px today). |
| 9 | MINOR | 54.8–59.46 | **No Juno end card** (no follow pill, no source); only the small "Juno · 七宗罪" watermark. Owner row 17. | `strips/p_endcard.png` | If 《七情》 shipped without one and the owner accepted it, leave it. Otherwise add 关注 Juno · 一起看懂世界 + 资料：Encyclopaedia Britannica (≥32 px) in the ring's lower arc for the last bar. |
| 10 | MINOR | 58.46–59.46 | The music fade ends 1.18 beats into bar 29, not on a downbeat (owner row 66). The music specialist has already asked the owner. | `notes_music_r1.md` §6 Q2 | Owner decides. If yes, extend the end card to 60.89 s so the fade ends on bar 30. |
| 11 | MINOR | delivery | The brief says "upload with the same track chosen from Douyin's library". The music notes warn that this **doubles** the music, with a flam or offset, unless the library track's volume is 0. | `brief.md`, `notes_music_r1.md` §5f | Write one explicit upload instruction for the owner: attach the library track for credit only, with 配乐 at 0 and 原声 at 100. |

## The specific checks you asked for

1. **White/grey full-frame flashes: none.** I measured per-frame luminance (whole, left half, right half, % near-white) over all 1783 frames.
   - At every reveal (f184, 366, 549, 731, 914, 1096, 1279) and the title (f1644) brightness **steps up and stays up** (e.g. R1: mean 32→52→54→56, left half 7→22), with no spike-and-return.
   - No isolated bright frame anywhere.
   - Brightest frame in the film: the gold iris wash at 48.73 (75.9/255, gold, not white).
   - The old tether line and the title sweep streak are gone; the title slam shows thin rings only.
   - `checks/luma_scan.txt`, `checks/flash_summary.txt`, `strips/s_rev_*.png`, `strips/s_1640_title.png`.
2. **Reveals and title on the kick: all within ±15 ms.** Measured on the delivered mp4's own audio (broadband attack; it matches the music notes' clicks to within ~1.5 ms, so there is no encoder offset).
   - R1/R3/R5/R7 and the title: picture is **+3.0 to +4.2 ms** after the click.
   - R2/R4/R6: picture is **−12.6 to −13.4 ms**, i.e. the frame starts just before the click.
   - `checks/sync.txt`.
3. **Legibility and overlap.**
   - Text sizes at 1080p: context ~60 px glyphs (good), bubbles ~45 px, 七宗罪·之X ~36 px, closing lines ~48 px.
   - All text is light-on-dark or dark-on-white bubble, so contrast is fine.
   - No bubble is clipped by the frame edge. The highest, the scene-1 quip, has its top at ≈75 px.
   - The 暴怒 cracks run behind the bubble, not across text.
   - The outro question never overlaps a sticker (closest gap ~30 px). Its centring is off: finding 5.
4. **Cut-out quality:** finding 1. 奶蛙, 刀盾狗 (revealed), 牛来 and 草地牛 are clean. 袋鼠 (revealed) is clean.
5. **Iris transitions.**
   - Eight irises, each in the **next** disc's colour: purple, green, red, blue, gold, orange, pink, gold. No mismatch.
   - Each has a 4–7-frame full-frame colour wash with no content; none is white or grey.
   - The probe's five "single-frame glitch" flags (4.27, 16.43, 28.60, 40.77, 48.87) are the iris zoom-through: three-frame monotonic fades (|prev−next| > each step), not flashes.
6. **Intro frame 0:** finding 2.

## Fixed since r1 (director gate 3), confirmed on r2 frames
- Lift white/grey flashes, the tether line and the title streak: gone.
- English sin line: dropped. Text sizes raised (context 42 → ~64 px font).
- Text diet works: the quote is in the silhouette's bubble, the quip in the meme's bubble, the closing line at +2 beats.
- Frame-rounding sync bug: fixed (finding above).
- Live elements now read:
  - lemon (柠檬精) for 嫉妒
  - crack on the disc at the bar-10 kick-out (20.33)
  - loot bags for 贪婪
  - 外卖 stack for 暴食
  - 明天 page for 懒惰, now big and red
- Outro: meme stickers sit on the ring, and the thesis no longer says 怪物.
- **Still open from r1:**
  - cut-outs (1)
  - frame-0 luminance (2)
  - the bar-23 collect beat (3)
  - names under the ring stickers (6)
  - ？ centring (5)
  - thesis size (8)
  - end card (9)

## What works (keep)
- The film follows both bans: no flash on any cut, reveal or the title, and one untouched music bed (short-term loudness −13.4 to −14.9 LUFS throughout, no holes).
- Beat lock: every reveal and the slam land on the kick, and the 6.14 / bar-10 / bar-26 pauses line up with the track's own holes.
- Layout A, the same every scene; iris colours chain consistently; the 3-bar rhythm (except finding 3).
- The script: 恭喜恭喜！ → 运气好而已。, 我很冷静！, 再摸一个包就撤。, 填不满的，往往不是胃。, and the 你心里，哪一宗罪最大声？ comment driver. Every opener and key word differs.
- Delivery numbers: 17.5 MB, 2.15 Mbps, 1920×1080 30 fps, −14.17 LUFS, −2.71 dBTP. No silence, black or frozen stretches.

## Owner-notes pass (rows that apply)
- **"Yes, the owner would say it":**
  - rows 8/22/47 (opening; finding 2)
  - row 18 (renders whole; finding 1)
  - row 104 (reading time; finding 4)
  - rows 89/97 (？ centring; finding 5)
  - row 14 (节奏, visual change every few seconds; finding 3)
  - row 17 (Juno end card; finding 9)
  - row 66 (fade ending on a downbeat; finding 10)
- **Passes:**
  - row 21 (≤28 MB, ~2 Mbps, −14 LUFS)
  - row 26 (title on the hardest drop: 54.80 on the bar-26 kick return)
  - rows 51/64 (untouched BGM)
  - row 37 (one quiet SFX family)
  - row 54 (shake: on R1 the background measured static on the hit frames f184–185; motion is on the disc and meme)
  - rows 55/84 (no flashes)
  - rows 114/115/116 (silhouette tease, typed intro, fixed layout)
  - row 11 (no misleading line)
  - row 12 (no repeats)
- **Deliberately not re-flagged (owner decisions in the brief):**
  - The same iris for all eight transitions (row 86 would otherwise apply).
  - Scene-A labels stay up until the iris covers them.
  - The use of real meme images. Risk noted against row 50: 美团袋鼠 is Meituan's brand mascot, and the 鼠鼠 image shows Delta Force game gear.

## Not checked / can't judge
- The music's and the bell's taste (only levels, sync and the loudness curve were measured).
- Whole-frame shake on reveals 2–7 (only R1 was measured).
- Real phone playback (judged from pixel sizes at 1080p).
- Douyin copyright fingerprinting.
- The Britannica claim behind the caption: taken from the brief and script, not re-verified online.
- **Dismissed automatic flags:**
  - probe.py's "bitrate < 8 Mbps" (owner rows 21/44 set ~2 Mbps for the send version)
  - facts.py's "no facts table" (the only on-screen fact is the sourced caption)
  - pace.py's 37–58 % "waiting" (an artefact of stacked labels; the real read-time problems are findings 3 and 4)

Files: `auto_checks.md`, `probe.json`, `sheet_01…13.png`, `strips/`, `full/` (full-res frames and crops), `evidence/`, `checks/` (luma_scan, sync, ink_centre, loudness_curve, shake scripts and outputs).

---

# Re-review r4 (七宗罪_r4.mp4 send version; HD master checked for sync and loudness) — verdict: FIX FIRST (two ~10-minute fixes)

r4 is a real step up. The iris now lands on the bar line, the dead bar is gone, the ending builds into the slam and frame 0 is bright. Every reveal still hits the kick. Two problems are left that the owner has flagged before, and both are cheap to fix. (1) During the roulette, the outro question collides with the lit stickers at both ends. (2) The end-card thesis and title sit off-centre (owner rows 89/97). Fix those two, re-measure, and it is READY. No full re-review is needed.

Evidence for this pass: `review_r2/r4/` holds auto_checks.md, probe.json, sheet_01–12, checks/ (around_bars.txt = luma/Δ/detail per frame at every bar line, sync.txt) and R4_E1–E3 PNGs. I also pulled full-res HD frames and crops and frame strips around all 8 transitions, the burn-out, the outro and the props exits.

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| 1 | MAJOR (new) | 49.74–50.24, 51.26–51.77, 53.39–54.05 | **The outro question collides with the lit roulette stickers.** The stickers are bigger now (r 96, ×1.16 + pop when lit), and the question (54 px, ink x 638–1278, y 525–571) sits at the height of the 3 and 9 o'clock stickers. Lit 暴怒 reaches x = 1243, so it covers the trailing ？ by **35 px**. Lit 暴食 reaches x = 668, so it covers 你 by **~40 px**. 暴怒 is the lit sticker for most of bar 26's held step (53.39–54.05), right before the slam. That is the line that drives comments. | `r4/R4_E1_question_vs_lit_stickers_51.5_53.5.png` (HD 51.5 s and 53.5 s) | Set the question in two centred lines (你心里，/ 哪一宗罪最大声？) at ~56 px, centred on y≈540 between the side stickers. Or keep one line at ≤46 px. Check that the gap to every **lit** sticker (including its glow) is ≥30 px. |
| 2 | MAJOR (new, owner rows 89/97) | 55.0–59.46 | **End card off-centre.** The thesis now breaks into two lines, and each ends in full-width punctuation that is not pulled back. 七个梗， has its ink centre at **939.5 px** (−20.5) and 七个放大版的你。 at **942.0 px** (−18). The title 七宗罪 is at **945.5 px** (−14.5) because of its trailing 0.1 em letter-spacing. This is the last frame people see, held for 4.6 s. | `r4/R4_E2_endcard_offcentre_57.5s.png` (red line = x 960) | Apply the same ½-em pull-back to each thesis line (+0.25 em offset, as the question already has). Offset the title by +½ of its letter-spacing (≈+8.5 px) and SEVEN DEADLY SINS by +½ × 0.6 em. Re-measure on a rendered frame. |
| 3 | MINOR | 32.5 (鼠鼠), 38.0 (哈基米) | **Cut-outs: much better, two leftovers.** 鼠鼠 is now round-topped and shown at 78 %, but the face is still the soft upscale: the eyes are green blobs. 哈基米's ghost rectangle is gone, but the head cloth still has a straight top, a straight-cut white wedge left of the cheek and a vertical cut down the right cheek. The new white die-cut outline traces these straight segments. | `r4/R4_E3_cutouts_…png` (bottom-centre 38.0, top-right 32.5) | 哈基米: round off the left wedge and the right cheek cut along the fur (about 15 min of matte). 鼠鼠: only if a sharper frame of the meme exists. Otherwise leave it; at phone size it now reads as "cat in a headset". |
| 4 | MINOR | 46.67–46.85 | **The outro entrance jumps and dips.** The gold flood grows from the 色欲 disc at x≈1360. On the bar-line frame (f1401) the ring opens at x = 960, a 400 px sideways jump (every other transition keeps the disc position). The next 4 frames are the **darkest of the film (9–13/255)**: an empty ring before the first sticker arrives at ~46.9. | `/home/claude/video/episodes/39-qizongzui/review_r2/r4/checks/around_bars.txt` (f1400–1406), strip at 46.57–46.80 | Start the outro ring at the disc's position and glide it to the centre over ~6 frames. Or centre the last flood on 960. Have the first sticker already in flight on f1401. |
| 5 | MINOR | 1.0–4.2, scene 1 | **Small leftovers in the intro and scene 1.** (a) Intro line 1 ink centre is **950 px** (r2: 925), still 10 px left. (b) The picture is completely still from 3.50 to 3.83 (Δ = 0.00 for 11 frames), and the 3.61 kick lands on it. As a hold before the dive it is fine; a "?" bounce on 3.61 would keep the "something on every beat" promise. (c) The scene-1 context line is readable 4.23 → 6.03 = 1.80 s against 1.96 s needed (6 字). Scenes 2–7 now pass (e.g. 朋友上岸了 10.27 → 12.10 = 1.83 s against 1.81 s). | `/home/claude/video/episodes/39-qizongzui/review_r2/r4/sheet_01.png`, strip f120–127, HD 3.4 s crop | (a) Pull back a further ~0.1 em. (b) Optional. (c) Fine to leave: P1's hold at 5.58 gives the eye time. |
| 6 | MINOR | 55.73–59.40 | The end card is a **3.7 s frozen frame** (Δ ≈ 0.01). It is the end card, so this is acceptable. A slow breathe on the sticker glows would stop it reading as a stall (row 91). | `probe.json` frozen [55.73, 59.4] | Optional: 2–3 % glow pulse or a very slow ring turn. |
| 7 | MINOR (carried) | end | Still no Juno follow pill or source line, and the music fade still ends 1.18 beats into bar 29. The audio is bit-identical to r2 (decoded md5 match). Both are owner decisions (r2 findings 9 and 10). The Douyin library-track upload note (r2 finding 11) still stands. | — | Owner decides. |

## Fixed since r2: each r2 finding

| r2 # | Status | Evidence on r4 |
|---|---|---|
| 1 Cut-outs | **PARTLY** | Silhouettes are now solid binary fills: 鼠鼠 (29.5) has a round top and no texture; 哈基米 (35.3) has no grey patch; 袋鼠's base (5.0) has no specks, only a stepped edge; 刀盾狗's blade is silhouetted and the speck at 20.84 is gone. 鼠鼠's reveal is smaller and round-topped but still soft. 哈基米's ghost rectangle is gone, but its straight cuts remain (#3 above). |
| 2 Frame 0 dark / small | **FIXED** | Frame-0 mean is **37.9/255** (send) / 37.1 (HD), against 19.6 before. The stickers span ~87 % of the width. A pop lands on every beat from 0.06 (one per beat, all seven by 3.10). 七宗罪\| is typed on frame 0. |
| 3 Dead bar before the ending | **FIXED** | 色欲 irises out at 46.69 like every other scene. Bar 23 is the fly-in (46.75–48.2). The question lands at 48.72. The roulette steps on every kick in bars 24–25 (Δ spikes), slows through bar 26 (52.77 / 53.39 / 54.05), inhales 54.30–54.77 (Δ 0.4–0.6), then the slam. No Δ = 0 stretch before the title. |
| 4 Pre-reveal reading window | **FIXED** (scene 1 borderline, #5c) | The context lines are ≤ 5–6 字 and readable from ~+0.07–0.12 s after the bar line until 0.1 s before the reveal. |
| 5 Off-centre punctuation | **PARTLY** | Outro question **958 px** (was 943). Bubbles: visually centred in all 13 (board of HD crops at x = 1445). Intro line 950 (was 925). **New:** the thesis is now two lines and both are off (#2), and the title is 14.5 px left. |
| 6 Ring stickers unnamed | **FIXED** | Each sticker has a 40 px name on a sin-colour pill. The stickers are ~192 px. (Their new size causes #1.) |
| 7 懒惰 payoff too short | **FIXED** | 明天 is up by 26.42 and holds to the flood at ~28.2 (≈1.8 s). The calendar now sits inside the rim. |
| 8 Thesis size | **FIXED** | 56 px font; line-2 ink height 58 px. |
| 9 Juno end card | NOT FIXED (owner decision) | #7 |
| 10 Fade not on a downbeat | NOT FIXED (owner decision) | Audio is identical to r2. |
| 11 Upload instruction | Not checkable in the film | — |

## Director gate-4 notes

| Note | Status | Evidence |
|---|---|---|
| 1 Cut-outs + die-cut edge | **PARTLY** | Every reveal has the white die-cut outline and the silhouettes are binary. 鼠鼠 is soft and 哈基米 has straight cuts (#3). I can't see whether the owner was sent the 7 crops before the render. |
| 2 No empty colour field; open on the bar line; props out before the flood | **FIXED** | Empty (detail < 2) frames per transition are now **1–2 frames** (f122–123, 305, 487–488, 670, 852–853, 1035, 1217–1218, 1400), against ~8 in r2. The new disc + silhouette is complete on the first new-scene frame, which is 5–32 ms after the measured bar kick (bar 11: kick 22.362, disc f671 = 22.367). Bubbles, lemon, 外卖 boxes and bags fade out 2–3 frames **before** the flood starts (strips f474–485, f1204–1215). The scene-A left column still stays until the iris covers it (owner decision, not flagged). |
| 3 Ending as a roulette into the slam | **FIXED** (with #1, #2) | The steps fall on every kick, slow down and hold, then the slam lands at f1644 with all seven lit at once and a gold glow. Frame luminance after the slam is **39.5/255** (r2: 24). The gold Rings start outside the title. |
| 4 Tease pulse / lock / squash | **FIXED** | The "?" bounces on the kicks (scene 1: Δ 1.8 at f139 and f154 = 4.63 / 5.13). It locks from 5.58 (Δ ~0.2). The squash gather is at f182–183 (Δ 1.0), then the reveal (Δ 30). Scene 4 shows the same pattern. |
| 5 Bar-10 burn-out | **FIXED** (subtle) | The disc darkens to maroon from 20.4, the cracks turn ember orange, small embers rise, and there is a slow push. Motion over 21.4–22.0 is Δ ≈ 0.2 (r2: 0.12), so the frame is alive but quiet on a phone. The release on 22.36 opens 懒惰's disc on the kick. |
| 6 Intro brightness / no freeze | **FIXED** (0.33 s pre-dive hold remains, #5b) | Frame 0 is 37.9. Δ over 3.0–3.5 is now 0.36 (r2: 0.00). |
| 7 Bubble punctuation | **FIXED** | See r2 #5. |
| 8 Scene-1 quip | **DONE** | 本王，从不低头。 answers the silhouette's 我？先低头？ as a punchline, and the crown sells it. It reads alone. |
| 9 Labels (七宗罪·之X 44 px, calendar in disc, cracks) | **FIXED** | 44 px. Calendar inside the rim. Cracks 5 px with an ember glow. |
| 10 End card | Owner decision | #7 |

## Automatic checks re-run (r4)
- **Format/size:** send version 1920×1080 30 fps, 59.46 s, **17.0 MB, 2.08 Mbps video**, AAC 195 kbps. HD master 34.7 MB, 4.40 Mbps. Both meet owner row 21 (≤28 MB, ~2 Mbps). The probe's "<8 Mbps" flag is dismissed per rows 21/44.
- **Loudness:** **−14.17 LUFS, −2.71 dBTP**, LRA 1.0. Short-term −14.7 to −13.3 LUFS throughout. No silence. HD −14.1 LUFS.
- **Flashes:** none. No isolated brightness bump in 1783 frames. The brightest frames are the gold flood into the outro (73/255, gold).
- **The 4 probe "single-frame glitches"** (10.20, 22.37, 34.53, 46.70) are the bar-line frames where the flood gives way to the new scene. Brightness falls monotonically (e.g. 56→52→34) with no spike, so they are not flashes.
- **Kick sync** (broadband attack on the delivered audio):
  - R1 +3.1 ms, R2 −12.6, R3 +3.2, R4 −13.4, R5 +4.2, R6 −13.4, R7 +3.3.
  - **Title f1644 = 54.800, +3.0 ms.**
  - The HD master is identical.
- **Black:** none. **Frozen:** only the end card (55.73–59.40, #6) and the 3.50–3.83 pre-dive hold.
- **Ink centring:**
  - intro line 950 (−10)
  - caption 957
  - outro question 958
  - bubbles centred
  - thesis 939.5 / 942.0 (#2)
  - title 945.5 (#2)
- **Frame 0:** 37.9/255.
- **Pace:** pace.py's 59 % "waiting" is the stacked-label artefact (dismissed as in r2). The real read windows are covered above.
- **Brand:** no "Juno 出品"; the facts.py "no facts table" flag is dismissed (one sourced caption).

## Script pass (changed lines)
- 朋友上岸了, ddl前一晚 and 又刷ta主页 are all shorter, and each still reads alone.
- ddl is everyday slang for the target viewer.
- 本王，从不低头。 is clearer than 你的胆子真是肥嘟嘟的啊 and pays off the silhouette's line.
- Nothing new overclaims. The order, the thesis and the question are unchanged.

## Owner-notes pass (r4)
- **Would flag:** rows 89/97 (#2, and the ？ in #1); row 18 (renders whole: #3, minor now); row 91 (frozen end card, #6, minor); rows 17/66 (owner decisions).
- **Now pass:** rows 8/22/47 (frame 0), row 14 (no dead bar), row 86 (props leave before the move), row 88 (the slam is now the brightest, fullest frame of the ending), row 112 (hold → hit on the slam and on every reveal), rows 26/51/64, row 21.

## Not checked / can't judge
- The sound itself (I measured levels and sync only; the audio is bit-identical to r2).
- Real phone playback.
- Douyin fingerprinting.
- Whether the owner saw the reveal crops before this render.
- Whole-frame shake on reveals 2–7.
