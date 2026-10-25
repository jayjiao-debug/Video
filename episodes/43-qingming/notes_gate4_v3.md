# Gate 4 review: 假如你是清明上河图, v3 (master.mp4 + send.mp4): SHIP

**Overall.** v3 fixes all four v1 Highs. The drop at 123.40 now hits: a punch-in on the bass, then the push into the roll. The opening hold moves. The music fades over the last bar. There are no more grade pops in transitions. No frame is black, blank or corrupt, the audio is the untouched bed plus the one allowed fade, and the send file is clean.

What's left is polish. The top item is two single flash frames in the 1973 lens insert (138.53, 139.83). I'd fix them if scene 30 can be re-rendered cheaply before morning. I would not hold the film for them.

**Evidence** is in `/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/g4b/`:
- `sheet_01–10.jpg`: 1 fps, with the subtitle under each frame.
- `ev_<t>.jpg`: every-frame strips starting at t.
- `full.jpg`: full-resolution frames for 138.53 / 138.57 / 139.80 / 139.83 / 31.5 / 149.5 / 174.2 / 121.0 / 122.87.
- `behav.jpg`: logic spot-checks.
- `send_cmp.jpg`: subtitle crops, master vs send.
- `feat.npz`: per-frame luma and diff, compared against v1's `g4/feat.npz`.

## Fixed since v1 (checked on v3 frames)

| v1 # | Item | v3 status | Evidence |
|---|---|---|---|
| 1 | 123.40 drop on a dim, still frame | **Fixed.** At 123.40 → 123.43 the camera punches in on the bass (frame diff 15). The roll fills the frame width by 123.7. Mean luma goes 62 → 85 by 123.9 (v1: 55 → 65). The dive into the painting runs 124.2–124.8 (luma 120). | `ev_123.30.jpg`, `ev_124.0.jpg` |
| 1b | Rolls on the store table too small / 真迹 unreadable | **Partly fixed.** The push-in makes the table bigger. The 「真」 tags are still about 20 px, and the grey-out beat is still subtle (see #4 below). | `full.jpg` (121.0, 122.87) |
| 2 | 3.70–6.07 frozen | **Fixed.** 0 of 71 frames are static (v1: 59). Minimum frame diff is 0.30. | feat diff column; `sheet_01` |
| 3 | Music truncated at the end | **Fixed.** A single fade from 182.58 to 184.21 (gain 1.00 → 0.00, roughly linear in amplitude). Before 182.5 the master matches `bgm_cut.wav` with lag 0 and a residual of −40 to −50 dB. Nothing else in the bed is touched. | gain curve 182.6…184.2: .97 .85 .73 .60 .48 .36 .23 .11 .00 |
| 4 | Per-side grade pops at 85.80 / 30.90 / 102.60 | **Fixed.** 85.80: luma 108 → 108 (v1: 108 → 155). 30.90: 98 → 96 (v1: −18). 102.60: no band pop, only a 2-frame blend into the ledger. | `ev_85.75.jpg`, `ev_102.45.jpg` |
| 5 | Whips (3.3, 24.1, 33.2, 110.6, 138.6–143.7, 173.8) | **Mostly fixed.**<br>- 33.2 and 143.6: eased over 12+ frames.<br>- 110.3: an 18-frame push into the door.<br>- 3.3: now about 9 frames (v1: 3). Still quick, but it reads as a pull-back.<br>- **Still to do:** 24.1 (hard cut → 0.55 s passage rush → hard cut), the 1973 lens insert (#1 below) and the end move (#2 below). | `ev_3.20`, `ev_33.10`, `ev_110.25`, `ev_143.55`, `ev_24.00` |
| 6 | 150.77 flash | **Fixed.** Peak mean is 90 (v1: 154). The iris opens out of the roll's glow while the wall stays visible. | `ev_150.55.jpg` |
| 7 | Z1 38.6–41.0 blank silk | **Fixed.** Painted houses, trees and the silk edge are in frame throughout. | `sheet_02` (38.5, 39.5), `sheet_03` (40.5) |
| 8 | 张著 headless at 42.03–42.17 | **Fixed.** He stays whole through the pull-back. | `ev_41.90.jpg` |
| 9 | Roll-up wipe at 54.5 reveals nothing | **Fixed.** The Yuan crest is revealed behind the roller edge, with no empty brown and no cut. | `ev_54.25.jpg` |
| 11 | Labels: size and duration | **Partly fixed.**<br>- Fixed: labels now clear before the 33.1 pull-back.<br>- Not fixed: `.lbl` is still 44 px (`film.html` l.27). 几百个人 is still on screen for about 1.1 s, and 约一百卷 · 只有一卷是你 for 1.7 s (`furniture.ts` l.73, unchanged). | `full.jpg` (31.5, 149.5) |

Logic notes, spot-checked on v3 frames (`behav.jpg`). These are now fine:
- A#1, 12.6: the craftsman stands behind the table.
- C#1, 36.05: the figures are solid, with no onion-skin.
- D#2, 59.7: the craftsman has a torso.
- D#4, 69.3: the hand-over makes contact.
- C#5, 142.2: the restorers are present at the start of the crane.
- E#1, 156.6: the walkers are in different leg phases, so no lockstep.
- E#2, 165.6: the staff stand in front of the case, with no arms through it.
- E#4, 178.5: the follow pill sits above the lit doorway, not on it.

## Remaining list (ranked)

| # | Sev | Time | What's wrong | Evidence | Fix |
|---|---|---|---|---|---|
| 1 | Med | 138.53–138.57, 139.80–139.83 | **Two single flash frames in the 1973 lens insert.**<br>- At the end of the lens pull-out, one wide frame of the table shows the magnifier small and **both restorers missing**. The next frame is a close two-shot of the restorers.<br>- The same thing happens in reverse at 139.83, before the 5-frame push back into the lens.<br>- These are the two largest single-frame pops in the film (pop score 21 and 16; the next real one is 12). On a phone they read as a stutter.<br>- The insert still goes lens out → in → out in 2.4 s (v1 #5). | `full.jpg` (138.533 / 138.567 / 139.800 / 139.833), `ev_138.30.jpg`, `ev_139.60.jpg` | Make the restorer layer and the table/lens camera switch on the same frame: either drop the frame at 138.53 and 139.83, or draw the restorers on them. If there's time, cut the second lens move (as in v1) and hard-cut on the 140.70 beat, which is already on the grid. |
| 2 | Low-Med | 173.6–174.67 (end move) | **Busy hand-off into the end card.**<br>- The hall pulls back.<br>- Then 174.10–174.27 is **6 frames of an almost empty grey field** with only the J, the title and 评论区聊聊.<br>- Then the passage zooms (174.37–174.63, luma < 40) and cuts to the 午门 on b76.5. That cut is now on the beat: fixed.<br>- The near-blank frames look like a missing render for a moment. | `ev_173.60.jpg`, `full.jpg` (174.2) | Start the passage on the 174.10 cut (no grey frames), or hold the hall until 174.33. |
| 3 | Low | 24.10–24.67 | Hard cut → 0.55 s rush down the passage → hard cut to the hall. The red 四五个小时 / 一两分钟 on the tan passage is still low-contrast (v1 #13). | `ev_24.00.jpg` | Optional. Give the red words a darker halo here. |
| 4 | Low | 114.7–123.4 | 「真」 tags on the store rolls are about 20 px, and the two-turn-grey beat is subtle. Y3 now lands on a visible push, so the line carries it. | `full.jpg` (121.0, 122.87) | Optional. Tags at 40–56 px. |
| 5 | Low | 31.4–32.8, 148.4–150.5 | Labels are 44 px, against owner row 76's ≥ 56 px. 一百卷 is on screen for 1.7 s; reading it needs about 2.7 s. | `full.jpg` (31.5, 149.5); `film.html` `.lbl` | `.lbl` 56 px. Show 一百卷 from b64.75 to b66. |
| 6 | Low | 48.40–48.60 | A fast slide across the colophon double-images the columns (清明 appears twice) for about 6 frames. | `ev_48.35.jpg` | Optional. Slow the slide or use a single layer. |
| 7 | Low | 110.3–110.8 | V1 「1945年，伪满覆灭…」 sits over the light façade. It reads because of the shadow (v1 #13). | `ev_110.25.jpg` | Optional. |

## Technical

**Master**
- 1920×1080 H.264 Main, 30 fps, 5529 frames, 184.30 s, 11.7 Mbps, 275 MB.
- AAC mono 44.1 kHz. Audio and video both start at 0.

**Audio**
- −17.4 LUFS integrated, true peak −2.9 dBTP, LRA 3.6, no clipped samples.
- This is the track's own level (owner row 64), so the platform normalises it.
- A/V sync: lag 0 samples against `bgm_cut.wav` in 4 windows. Cuts are on the grid as in v1, and 174.67 is now on b76.5.
- The 112.7–114.3 silence is the track's own stop.

**Picture integrity**
- No black or flat frames.
- Frames below mean 40 occur only at 114.67–114.70 (lamp-off beat, intended) and 174.57–174.63 (end passage, #2).
- No frozen stretch of 1.5 s or more.
- I looked at every pop above score 9 on its strip. The real ones are #1, #6 and the deliberate whip at 3.4.

**Send**
- 28,988,620 B. That is under the 30 MB limit, but over owner row 21's "≤ 28 MB" if MB is decimal (it is 27.6 MiB). If the chat counts decimal MB, re-encode at about 1.05 Mbps.
- H.264 High at 1.12 Mbps, 1080p30; AAC at 129 kbps, −17.5 LUFS, −2.9 dBTP.
- SSIM against the master: 0.990 average, worst frame 0.967 (128.9, the busy painting).
- Subtitles are crisp at full size over the busiest backgrounds (painting, snow, colophon, silk).
- The bitrate is a little under the owner's 1.5–2 Mbps target. It holds up anyway.

| Check | Evidence |
|---|---|
| Send SSIM | `ssim` per frame, at 960 px |
| Subtitle legibility in the send file | `send_cmp.jpg` |

**Pace**
- `lines_bars.json` is unchanged since v1, and the subtitle timing on the sheets matches it. The v1 pace result stands: no line is too fast, and 10 % of the time is spent waiting.

## What works (keep)
- The drop: the punch-in on 123.40 followed by the dive and the colour flood is now the film's hit.
- The 150.7 iris from the roll's glow: clean and motivated.
- The 54.5 roller wipe revealing the Yuan crest.
- The bed: untouched, with a single last-bar fade.
- The end card: complete and centred, with the pill clear of the doorway.

## Not checked
- I did not listen to the audio, only measured it. How the fade sounds is for the owner's ears.
- I did not play the film back on a phone.
- I looked at 1 fps for the whole film plus every-frame strips around each flagged moment, not at every frame.
- I did not re-run contact_check.mjs. The behaviour checks were a 14-frame spot-check, not the full logic re-pass.
