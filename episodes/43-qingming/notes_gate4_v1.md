# Gate 4 review: 假如你是清明上河图, draft v1 (master_v1.mp4, 1080p30, 3:04): FIX FIRST

**Overall.** The film is well built and solid: the cuts hit the grid, the music is untouched and in sync, no frame is black or corrupt, and the subtitles hold reading pace. Four things would still make the owner stop it:
- the hardest drop (123.40) lands on a dim, nearly still frame;
- the first held shot is frozen for 2.4 s inside the first 6 s;
- the music ends with a hard truncation in the middle of the groove;
- a run of transitions snap, flash or whip in 3–6 frames instead of moving the way the board describes.

**Scope.** I did not re-report the behaviour items in notes_logic_C/D/E. A few rows below touch the same moments; each says so and covers only what those notes don't.

**Evidence.** Everything is in `/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/g4/`:
- `sheet_01–16.jpg`: one frame per second, timestamps corrected to ±1 frame.
- `ev_<t>.jpg`: consecutive-frame strips starting at t.
- `auto/probe.json`, `feat.npz` (per-frame luma, saturation and diff values) and `rms.npy`.

## Fix list (ranked)

| # | Sev | Time | What's wrong | Evidence | Fix |
|---|---|---|---|---|---|
| 1 | **High** | 114.7–124.6 | **The hardest drop lands on nothing, and the setup it pays off can't be seen.**<br>**At 123.40** (sub-bass −42 → −17 dB) the frame mean stays at 55 → 55. It is only 65 by 123.9. All that changes is a small dim unroll at the far end of the table. The dive starts at 124.3, and the colour flood (mean 115) arrives at **124.6, 1.2 s after the drop**. Owner rows 26/88: the biggest image goes on the hardest drop.<br>**Before it (114.7–123.4, about 9 s),** a seated man barely moves (thumbnail diff ≈ 0 for 5 s, 115.8–120.8). The three rolls are ~200 px wide in total at 1080p, so on a phone the 「真迹」 slips and the "two turn grey" beat are invisible. Y2 and Y3 are told, not shown. A#16/A#17 cover the roll logic; this row covers scale and the hit. | `ev_123.3.jpg`, `ev_123.7.jpg`; `store.jpg` (crops at 116.0 / 118.6 / 121.2 / 122.9); `feat.npz` luma | 1. Put the visual hit **on 123.40**:<br>- start scene 28's dive and colour (now b54.5 = 124.5) at 123.40, with the unroll compressed into the 0.3 s before;<br>- or make the unroll itself the big image: a push-in that fills ≥ 60 % of the frame by 123.7, with the bloom peaking on 123.40.<br>2. In 27, frame the table so the three rolls are ≥ 40 % of the frame width from b51.25. Show 「真迹」 as ≥ 56 px tags, and make the grey-out a clear beat on b53 (with a counter-move or a small push). |
| 2 | **High** | 3.70–6.07 | **The opening's held shot is frozen.** 59 of 78 frames are pixel-identical (frame diff < 0.05). Only H2 types. Nothing sways, flickers or breathes, and the boat and bank figures don't move.<br>This sits inside the first 6 s, the swipe window. Owner row 122 ("first 5 s must move"), row 29 ("something always moves") and row 47. A#6 flagged it before render, and it is still in v1. | `feat.npz` diff column; `sheet_01.jpg` (4.0 / 5.0 / 6.0 look identical) | Give the shot life without changing its framing:<br>- the holders breathe and sway (±4 px);<br>- the lanterns flicker softly;<br>- the boat's mast lowers (b1.5, the board's beat that is missing, A#26);<br>- the bank figures' heads turn to the light;<br>- a slow 2 % drift of the camera toward the scroll from 3.7 to b2. |
| 3 | **High** | 182.0–184.3 | **The music doesn't end: it is cut off.**<br>- The source track keeps playing eighth-note onsets at full outro level (−19 dB RMS) through **183.91**, then drops −19 → −59 dB in 20 ms at **184.21**.<br>- The original MP3 does the same at 252.2, so this is the file's truncation, not an ending.<br>- music.md's "the song ends by itself / no fade needed" is wrong.<br>- On a phone it sounds like the upload broke. On a Douyin loop it jumps into frame 0's 0.55 s of silence.<br>Owner rows 66 ("fade out on a beat") and 95. | `rms.npy`; 10 ms RMS 183.9–184.3: `−19 … −17 −22 −37 −59 −68 −81`; onset list 182.12 / 182.40 / 182.77 / 183.06 / 183.34 / 183.62 / 183.91 | Use the one edit the owner allows (row 66): a single fade over the last bar, ending on a beat.<br>- e.g. an equal-power fade from 182.58 (b80) to 184.21, or end the film on b80's downbeat with a fade from b79.5.<br>- Leave the rest of the bed untouched.<br>- Confirm with the owner first, because row 64 forbids any other processing. |
| 4 | Med | 30.90, 85.80, 102.60 (any transition between scenes with different grades) | **The grade snaps at the first frame of a transition.**<br>`film.ts` composites both layers with the **incoming** scene's grade (`composite(x, fc.grade …)`), so the outgoing scene loses its corner bands and vignette in one frame. It reads as a pop.<br>- **85.80:** frame mean 108 → 155 in one frame. The silk's dark top and bottom bands vanish, and for 8 frames (85.80–86.07) the stacked F1/F2 subtitles and the HUD sit white-on-cream before the ripple starts.<br>- **30.90:** the dark top band slams in (−18).<br>- **102.60:** −33, with the bands popping in under the ledger dissolve. | `ev_85.7.jpg`, `ev_30.8.jpg`, `ev_102.4.jpg`; diff 46.9 at 85.80 | Engine fix: give each layer its own grade (A's grade on slot 0, B's on slot 1), or lerp the grade uniforms over the transition. Then re-check every IN transition. |
| 5 | Med | 3.27–3.60, 24.10–24.67, 33.20–33.50, 110.60–110.83, 138.60–138.87, 139.70–139.80, 140.80–140.95, 143.70–143.85, 173.80–174.33 | **Camera moves finish in 3–10 frames with no motion blur, so they read as jump cuts or whips, not 运镜.**<br>- 3.37 → 3.47: the scale halves in 3 frames.<br>- 24.1: a hard cut into the passage, a 0.5-s rush, then a hard cut to a hall wide where the case jumps from centre-close to small.<br>- 1973 lens: out (8 frames), in (**3 frames**), then out again (5 frames) within 2.4 s.<br>Owner row 67 ("转场运镜有点让人不适应"), row 72 and row 33 ("运镜很舒服"). | `s_003b.jpg`, `ev_24.0.jpg`, `ev_33.17.jpg`, `ev_110.6.jpg`, `ev_138.5.jpg`, `ev_139.6.jpg`, `ev_140.75.jpg`, `ev_143.6.jpg`, `ev_173.7.jpg` | Give every scale change over 1.5× at least 12–18 frames with ease-in-out, landing on the beat. Where the beat can't afford that, cut on the beat instead of whipping. In 30, drop the third lens move: swing the magnifier aside in the room wide. |
| 6 | Med | 150.70–150.83 | **A light-burst flash on the push into the glowing roll** (32 → 33): the frame mean goes 80 → 115 → **154** → 97 → 57 over 5 frames (p95 215), a near-cream full frame, before the iris opens on the 宋 fire crest. E1/E3 are unreadable on those frames. Owner row 55: "No white flashes on cuts unless asked". | `ev_150.6.jpg`; luma 150.67–150.87 | Cap the roll's bloom at the silk's own value. Open the iris from the roll's glow while the wall is still visible around it, so no frame exceeds mean ≈ 110. |
| 7 | Med | 38.6–41.0 (Z1) | **About 2.5 s of near-blank cream silk.** The "corner search" doesn't read: no scroll edge, mount, corner or painted element is in frame, and hard-edged dark bands sit top and bottom (one ends abruptly at x ≈ 1200 under the counter). On a phone it looks like a missing render. Logic C called the content plausible; this row is about how it reads. | `z1.jpg` (38.6 / 39.6 / 40.6 at 960 px), `sheet_04.jpg` | Frame a real corner: the painting's last trees and the silk edge meeting the mounting, with the light pool sweeping across them. Keep some ink in frame at all times. Feather the bottom band (no square corner). |
| 8 | Med | 42.03–42.17 | **张著 comes apart during the pull-back.** For 4 frames the body is headless and his hat floats separately above-left (over the start of the subtitle), then snaps back on at 42.2. The camera passes through his layers (owner row 43, 穿模). | `ev_42.jpg`, `z2.jpg` | Keep the figure's parts in one group or plane, and start the pull-back outside his near plane. |
| 9 | Med | 53.5–54.67 (13 → 14) | **The roll-up wipe reveals nothing.** The roller sweeps right and leaves **~5 frames of empty brown** (54.50–54.63). Then a hard cut to the Yuan crest follows (mean +60 in one frame). The board says the roller reveals the next crest behind it. This sits next to C#3 (missing roll-up) but is the transition itself. | `ev_54.4.jpg` | Composite the Yuan crest behind the roller's edge (a mode-2 wipe whose edge rides the roller), so the crest is revealed as the roller passes and there is no cut. |
| 10 | Med | 133.93–134.30 (29 → 30) | **The gate-passage iris opens from the wrong place.** It blooms from a dim point at about (320, 640), ~1000 px from the carried roll's glow at about (1360, 440). The passage is never shown, so the eye is on the right while the new scene opens on the left. Gate-3 B7 is still owed. | `ev_133.8.jpg` | Follow the roll into the far-bank gate, then open the iris from the lit passage with the roll in it, or simply from the roll's glow. |
| 11 | Med | 33.2–33.7, 148.1–150.4 | **Labels flash past and are undersized.**<br>- 「几百个人」 is on screen **0.57 s** (b14 → b14.25).<br>- 「约一百卷 · 只有一卷是你」 is on **1.7 s** (b65 → b65.75; the board says 2.26 s; reading needs ≈ 2.7 s).<br>- `.lbl` is **44 px**, against the board's and owner row 76's ≥ 56 px.<br>- 5米多长 and 几百个人 stay pinned while the camera whips back at 33.2–33.5 (owner row 86).<br>Without that label, 「抄你」 reads as 抄家: the film uses 抄 = confiscate four times before it (被抄进了皇宫, 主人家被抄, 严家被抄, 毕沅家被抄). | `furniture.ts` LABELS; `film.html` `.lbl{font-size:44px}`; `ev_33.17.jpg`, `sheet_13.jpg` | Show 几百个人 for ≥ 1.5 s and the 一百卷 label from b64.75 to b66 (as boarded). Set labels to 56 px, and clear them before the pull-back starts. |
| 12 | Med | 97.7–123.7 (script) | **The 1923 and 1950 "two rolls" can merge in a first viewing.** P3 says 「清单上，其中两卷都写着张择端」. Y3 then says 「标着真迹的两卷，都是仿的」. A first-time viewer can take these as the same two rolls and conclude that both 张择端 entries were fakes, which contradicts C24 (one entry is you). Nothing on screen separates them, because in 27 the 真迹 rolls can't be read (#1). | lines_bars.json P3/Y3; facts C24, C31 (mapping unverified) | Picture first:<br>- in 25, the two inked entries map to one glowing roll and one grey roll (keep that, and make it larger);<br>- in 27, give the 真迹 rolls the copy look (dead grey ink) before they "turn".<br>If it still reads that way at the cold read, the screenwriter could anchor Y3 to the storeroom (e.g. 「库房里标着真迹的两卷，都是仿的」, within 16 字). |
| 13 | Low | 24.40–24.60, 102.40–102.57, 106.0–106.9, 41.9–53.4 | **Text on bright or warm backgrounds.**<br>- Red 四五个小时 / 一两分钟 on the tan passage (~2.3 : 1).<br>- P3 typing over white snow.<br>- **V1 and its stamp over the white 小白楼 façade for about 0.9 s.** These read only because of the shadow and will be muddy on a phone. The board says the top-left stays quiet sky or wall.<br>- On the silk inserts the tally's hollow ○ marks vanish on cream, so 「出●○○○ 进●○○○○」 reads as 「出● 进●」. | `v1sub.jpg`, `z2.jpg` (41.95), `hud.jpg` (45.5) | Keep the 小白楼 pull-back's façade below y 340 until V1 has been read. Give the tally the feathered scrim on inserts, or draw the ○ marks with a dark ring. |
| 14 | Low | 52.00–52.33, 102.56–102.69, 124.40–124.60, 130.39–130.57 | **Crossfade-looking blends.**<br>- 52.0–52.3: the colophon pull-back double-exposes two copies of the columns at different scales for ~8 frames, and the mean pulses 126 → 143 → 120.<br>- The other three are 3–5-frame mode-7 dissolves. Gate 3 accepted 130.4.<br>The board's rule is "no crossfade between scenes". | `ev_52.jpg`, `ev_102.4.jpg`, `ev_123.7.jpg` | 52.0: one layer, a real pull-back. Leave the others unless they are being touched anyway. |
| 15 | Low | 34.28, 114.67–114.70, 173.53–174.66, 11.64–15.03 | **Small things.**<br>- 09 → 10 is billed as a "match on action", but the roll lies still on the table, then a plain hard cut follows (+42 luma). Lift it leftward on b14.25 and cut mid-motion.<br>- 114.67–114.70 (lamp off) and 174.10–174.30 (end passage) sit at mean 37–39, below the board's floor of 40.<br>- At the end, the J, the title and 评论区聊聊 sit 0.8 s over the moving hall and passage with an empty question slot. The cut to the exterior (174.33) falls on an off-beat eighth, not b76.5 (174.66).<br>- Stamp 「— 元 · 1351年前」 normally reads as "1351 years ago". Use 「1351年以前」 or 「元末 · 1351年之前」. | `ev_34.2.jpg`, `ev_114.57.jpg`, `ev_173.7.jpg`, `sheet_02.jpg` | As described in each item. |

**Logic A/B (not on the "being fixed" list).** I did not re-verify these item by item. Three were plainly still there in v1:
- A#6, the frozen opening (#2 above);
- A#9, the 22–24 s queue reads as pegs;
- A#16, the rolls in 27 (#1).

## Checks run (numbers)

**Format.** 1920×1080, 30 fps, 5529 frames, 184.30 s. H.264 Main at 11.8 Mbps, 277 MB. AAC mono at 44.1 kHz, 203 kbps. This is the master; the ≤ 28 MB delivery encode is a separate step (owner row 21).

**Picture integrity.**
- No black frames (blackdetect), no frozen stretch longer than 3 s (probe), no gap or fallback scenes.
- The probe's single "glitch" at 8.97 is the title band's first opening frame, which is correct.
- The only near-flat frame is 173.83 (p95 53), inside the end move.

**Audio.**
- −17.5 LUFS integrated, −2.9 dBTP, LRA 3.6, no samples above −0.01 dBFS.
- The master's audio equals `bgm_cut.wav` sample for sample: lag 0 samples in 4 windows, gain −0.005 dB, residual −48.6 dB (AAC only). No SFX, sync exact.
- Silence 112.74–114.34 is the track's own stop.
- Loudness stays at the track's own level per owner row 64; the platform normalises.

**Cuts vs the grid.** Every hard cut is within 1 frame of its bar, half-bar or beat:
- 11.67, 15.07, 17.30, 19.57, 21.83, 24.10, 30.90, 34.30;
- 54.67, 58.07, 61.47, 76.20, 85.80, 89.77, 94.30, 114.67;
- 146.37 / 146.93 / 147.50 / 148.07 (E3 on b64 / 64.25 / 64.5 / 64.75), 151.47, 152.60, 165.07, 166.20, 166.73, 169.00.
- The exception is 174.33.
- The title band is fully open at 9.03 for the 9.05 hit. V3 lands whole on the 112.39 stop. The lamp clicks on at 114.74.

**Glow lock.**
- The brightest point before the 8.96 cut is at (1740, 580), against the title roller at 1710.
- T1 sits at (880, 540) and T2/T3 at (960, 560–580).
- 06 → 07: the store glow at about (1000, 560) becomes the 午门 light at about (960, 576).
- The E3 藏 flash has no glow on the lock point (lock-zone luma 29 at 148.0); that is E#11, known.

**Luma per scene** (mean; target ≥ 45 at night and indoors):

| Scene | Mean | Scene | Mean | Scene | Mean | Scene | Mean |
|---|---|---|---|---|---|---|---|
| 02 | 91 | 07 | 66 | 19 | 63 | 32 | 72 |
| 03 | 53 | 15 | 68 | 26 | 86 | 35 | 62 |
| 04 | 59 | 16 | 72 | 27 | 54 | 36 | 59 |
| 06 | 48 | 18 | 66 | 37 | 45.5 | | |

- Day crest 14 is 98 and 29 is 103 (target 110–150; gate 3 accepted this).
- Inserts run 125–142.
- Saturation in 16–27 never drops below 49, so no low-colour run.
- Frame minima below 40 occur only at 114.67–114.70 and 174.10–174.30 (#15).

**Reading pace** (pace.py on lines_bars.json):
- no TOO FAST;
- 18.4 s, 10 %, spent waiting (target ≤ 12 %);
- gaps 7.1–11.6 (wind-up + title), 128.2–130.5 (relief), 162.2–165.0 (moral picture), 172.4–174.7 (card): all are named beats;
- the stacked rows are correct;
- gate-3 C1 (lingering lines) is verified fixed at 114.67.

**Centring** (measured ink centre against 960):

| Element | Ink centre |
|---|---|
| Question | 961 |
| End-card title | 957 |
| Pill | 959.5 |

**Sources and brand.** `facts.py` finds no problems. There is no "Juno 出品", and the end card has the J, the gold title, the question, the pill and the sources. The 张著 colophon is real text (翰林张择端…藏者宜宝之…燕山张著跋).

## What works (keep)

- **Music.** It is untouched and in sync, and every cut sits on the grid. The title slam on 9.05 and V3 on the 112.39 stop are exactly right.
- **The teaser chain.** It holds the glow on one point through title → T1 → T2 → T3, so the eye never searches.
- **The colour peak.** 124.6–130 is the richest stretch of the film (mean 114, saturation 71) and reads as the climax once it arrives. Only its timing is off (#1).
- **The colophon inserts.** 44.5–53 and 142–146 are big, real and readable: the 翰林张择端 and 藏者宜宝之 glow are the film's best "原来如此" images.
- **Subtitles and end card.** Subtitle pace and stacking are clean, and the end card is complete and centred.

## Not checked / can't judge

- I measured the audio but did not listen to it. Taste, the feel of the 1.6-s stop and how the fade in #3 should sound need ears (the owner's).
- I reviewed the master only, not the ≤ 28 MB delivery encode or phone playback.
- I looked at one frame per second for the whole film, plus every-frame strips around every cut, luma jump and pop the analysis flagged. I did not look at every frame.
- Behaviour in C/D/E is excluded as instructed. Figure contact and posture outside those notes I judged only where the sheets showed it.
- I did not re-run figure contact checks (contact_check.mjs).
